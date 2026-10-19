# Chương 19. udev

## Trong chương này

- 19\.1 udev là gì? 522

- 19\.2 Phát hiện device 523

- 19\.3 Hành vi udev mặc định 525

- 19\.4 Hiểu udev rule 527

- 19\.5 Load platform device driver 538

- 19\.6 Tùy chỉnh hành vi udev 540

- 19\.7 Đặt tên device bền vững 541

- 19\.8 Dùng udev với busybox 545

- 19\.9 Tổng kết 548

Như nhiều Linux kernel subsystem, udev tiến hóa qua thời gian dựa trên

nhiều ý kiến từ user, developer, distribution maintainer, cùng

kinh nghiệm lịch sử từ các nỗ lực trước giải quyết vấn đề tương tự.

udev thay devfs, từng cố giải quyết directory tăng không kiểm soát

`/dev` và yêu cầu tạo directory `/dev` động

dựa trên phát hiện hardware hiện diện trong hệ thống.

Như nhiều chủ đề sách, trình bày kỹ udev cần

cuốn sách nhỏ riêng. Chương xem nhanh udev, điều nó làm

cho bạn, cách hoạt động.

## 19.1 udev là gì?

Ôn ngắn, `/dev` là Linux system directory chứa special file system entry gọi device node. Đã giới thiệu Chương 8, “Kiến thức cơ bản device driver”, Phần 8.3.3, “Device node và `mknod`”. Có thể xem file đặc biệt như “pointer” tới driver thực điều khiển, cho application truy cập device. Device node liên kết human-readable name với kernel device major/minor number pair. Cũng chứa attribute marker chỉ device type tham chiếu như block/character.

Trong quá khứ not-so-distant, Linux system kèm hàng nghìn device node tạo tĩnh, thường script như `MAKEDEV`. Có lẽ nếu máy nhà/cơ quan chạy Linux, vẫn tìm thấy script `MAKEDEV`.

Không có phương pháp tự động xác định device hiện diện, distribution maintainer chỉ dùng `MAKEDEV` tạo `/dev` với gần mọi device có thể gặp. Dễ hiểu cách brute-force không lý tưởng.

udev là subsystem mới, tốt nhất để tạo `/dev` động theo kernel information khi phát hiện device. Tiến hóa thành cách rất linh hoạt, mạnh áp policy khi phát hiện hardware. Chú ý tôi không nói “load device driver” hoặc “tạo device node” khi phát hiện hardware. Thực tế udev thường làm mặc định nhưng có thể tùy chỉnh action khi device cụ thể được thấy. Mặc định tạo node mang device name kernel cung cấp.

Có nhiều cách device đột nhiên xuất hiện sau boot lâu. Rõ như cắm USB device hoặc bật wireless interface qua switch laptop. Hot-plugging hard drive vào chassis fault-tolerant là ví dụ khác.

## 19.2 Phát hiện device

Khi kernel phát hiện device mới, tạo uevent gửi listener trên netlink socket[^1] user space, chính udev. Listing 19-1 cho uevent điển hình kernel gửi. Thu bằng utility `udevadm` như sau rồi cắm USB hub four-port vào host port BeagleBoard:

```
# udevadm monitor --environment
```

(Chú ý udev cũ dùng lệnh riêng như `udevmonitor`, `udevtrigger`. Bản mới gom tool vào admin program `udevadm` như đây. Kiểm tra phiên bản nếu không nhận lệnh.)

LISTING 19-1 Uevent điển hình: USB device

```
KERNEL[1244031028.077331] add  /devices/platform/musb_hdrc/usb1/1-1 (usb)
ACTION=add
DEVPATH=/devices/platform/musb_hdrc/usb1/1-1
SUBSYSTEM=usb
DEVTYPE=usb_device
DEVICE=/proc/bus/usb/001/002
PRODUCT=5e3/608/702
TYPE=9/0/1
BUSNUM=001
DEVNUM=002
SEQNUM=321
MAJOR=189
MINOR=1
```

Listing 19-1 cho kernel uevent đầu phát khi nhận USB hub four-port cắm BeagleBoard. Dòng đầu chỉ operation “add”, nghĩa kernel thấy USB device. Kernel name là

```
/devices/platform/musb_hdrc/usb1/1-1
```

Khi thấy device mới, một default action là tạo entry sysfs, gần luôn mount `/sys`. Attribute `DEVPATH` biểu diễn vị trí trong hierarchy `/sys`, tham chiếu nhiều trong udev rule/utility. Attribute khác chỉ device type, device, product (vendor/device ID), thông tin vị trí vật lý phân cấp trên USB bus. Attribute `DEVICE` là ý niệm kernel về device node. Device thấy trên bus 001, được kernel gán device number 002.

Listing 19-1 có product vendor code 5e3, device 608. Theo list www.linux-usb.org/usb.ids, vendor 05e3 là Genesys Logic, Inc., product ID 0608 là hub USB 2.0 four-port.

Uevent sequence number tăng mỗi uevent phát. Cuối cùng major/minor number của driver có trong uevent. Ở đây major 189, minor 1.

Khi udev nhận uevent, scan rules database (Phần 19.4), tìm khớp device attribute quy định action dựa attribute. Không rule khớp, mặc định chỉ tạo node tên kernel cấp, major/minor theo uevent. Ở đây tạo node sau, hiển thị bằng `ls -l`:

```
crw-rw---- 1 root root 189, 0 Jun  4 16:37 usbdev1.1
```

Rule cho system designer/distribution maintainer áp custom action phù hợp application. Thường default rule tạo node đúng trong `/dev`. Cũng thường tạo symlink tới node mới, có thể tên tắt well-known ứng dụng dùng. Sắp xem rule chi tiết.

## 19.3 Hành vi udev mặc định

Có thể ngạc nhiên uevent Listing 19-1 là đầu trong nhiều kernel uevent. Listing 19-2 chi tiết mọi uevent khi cắm hub four-port. Sinh bằng lệnh:

```
# udevadm monitor --kernel
```

LISTING 19-2 Kernel uevent khi cắm hub Four-Port

`KERNEL`× `add /devices/platform/musb_hdrc/usb1/1-1 (usb)`

```
KERNEL× add     /devices/platform/musb_hdrc/usb1/1-1/1-1:1.0 (usb)
KERNEL× add     /class/usb_endpoint/usbdev1.2_ep81 (usb_endpoint)
KERNEL× add     /class/usb_device/usbdev1.2 (usb_device)
KERNEL× add     /class/usb_endpoint/usbdev1.2_ep00 (usb_endpoint)
```

Chú ý timestamp thay `ts` để vừa trang, dễ đọc. Mọi uevent có timestamp như Listing 19-1. Thấy năm event khi cắm hub USB four-port, biểu diễn các component hierarchy. USB architecture mô tả Chương 18, “Universal Serial Bus”.

Listing 19-3 cho device node udev tạo tới đây trong `/dev`. Biểu diễn hành vi mặc định. Bài nhập môn không cung cấp rule tùy chỉnh.

LISTING 19-3 USB device ban đầu do udev tạo

```
crw-rw---- 1 root root 189, 0 Jan  1 02:03 usb1
crw-rw---- 1 root root 189, 0 Jan  1 02:03 usbdev1.1
crw-rw---- 1 root root 253, 1 Jan  1 02:03 usbdev1.1_ep00
crw-rw---- 1 root root 253, 0 Jan  1 02:03 usbdev1.1_ep81
crw-rw---- 1 root root 189, 1 Jan  1 02:04 usbdev1.2
crw-rw---- 1 root root 253, 3 Jan  1 02:04 usbdev1.2_ep00
crw-rw---- 1 root root 253, 2 Jan  1 02:04 usbdev1.2_ep81
```

Hình 19-1 cho hardware configuration tạo device Listing 19-3.

![Figure 19-1](images/ch19/fig19-01.png)

HÌNH 19-1 Setup USB hub four-port

Dòng đầu Listing 19-3 biểu diễn host controller BeagleBoard. Như Chương 18, biết bằng attribute trong `/sys`. Là controller USB high-speed dual-rate (gọi chung host controller) thuộc Texas Instruments OMAP3530 chip. Xem attribute qua /sys:

```
# cd /sys/devices/platform/musb_hdrc/usb1
# cat idVendor idProduct product
1d6b
0002
MUSB HDRC host driver
```

Ba dòng tiếp Listing 19-3 là hub one-port nội bộ luôn gắn controller theo architecture. Đây root hub Chương 18. Có thể xem physical connector như hub one-port. Như Chương 18, device có logical entity interface/endpoint. Device `usbdev1.1` là interface, `usbdev1.1_ep00`, `usbdev1.1_ep81` là logical endpoint của hub—thực thể logic giao tiếp trên bus.

Sau cắm hub four-port vào BeagleBoard, ba node cuối Listing 19-3 được udev tạo mặc định. Chú ý đánh số `.2` là hub thứ hai trong hierarchy USB hub nối nhau.

Có thể tự hỏi tên khác biểu diễn device tốt hơn không. Nếu device dành trực tiếp cho application như USB mouse, tên `usbdev1.3_ep00`[^2] không user-friendly. Đây lúc rule hữu ích.

## 19.4 Hiểu udev rule

Sức mạnh udev từ rules engine. Designer/maintainer dùng rule tổ chức hierarchy `/dev`, gán tên user-friendly cho node. Thường default name được tạo cùng symlink tên user-friendly, liên kết kernel name với user-friendly name.

Rules engine còn load driver (module). Thực tế làm gần mọi action tưởng tượng khi phát hiện insert/remove. Nhưng thường nhất là đổi tên device—symbolic link human-readable—và load driver.

Xem tập rule điển hình quyết định action sau kernel uevent. Bản udev gần đây default location là `/lib/udev/rules.d`, dùng mặc định phần còn lại. Nhiều distribution đặt `/etc/udev/rules.d`. Rule file thường do maintainer tùy chỉnh, nhóm theo chức năng dễ bảo trì. Nếu gần Linux machine, dành chút xem rule file.

Dù default directory `/lib/udev/rules.d`, udev cũng tìm `/etc/udev/rules.d`. File ở đó override file cùng tên trong `/lib/udev/rules.d`, cho override default rule.

Trong distribution hiện đại, rule file cùng tạo lộ trình action khi discover/remove. Laptop distribution của tôi có 31 file, gần 1.400 dòng, gần 700 rule riêng! Scan chúng sẽ hiểu tính linh hoạt, sức mạnh.

Khi mới chạy, udev đọc mọi rule `/lib/udev/rules.d/`, xây internal table. Khi device phát hiện, match action/attribute kernel uevent với global table. Có match, thực hiện action của rule/tập rule. Xem ví dụ.

Tiếp BeagleBoard, cắm mouse thường vào port. Không rule, udev tạo node bắt buộc dùng raw name từ uevent:

```
root@beagle:~# ls -l /dev/usbdev1.2*
crw-rw---- 1 root root 189, 1 Jan  1 00:21 /dev/usbdev1.2
crw-rw---- 1 root root 253, 3 Jan  1 00:21 /dev/usbdev1.2_ep00
crw-rw---- 1 root root 253, 2 Jan  1 00:21 /dev/usbdev1.2_ep81
```

Device biểu diễn USB infrastructure cơ bản, không device khác được tạo. Nếu quen Linux input device sẽ mong device mouse-something. Nhiều application mong mouse tên vậy. Hơn nữa không driver nào load xử lý mouse mới. Desktop cấu hình đúng với distribution hiện đại hoạt động đúng sẽ có tên chung (như `mouse*`), mong input driver/mouse driver đã load.[^3]

Nhớ Chương 8, kiểm tra module load bằng `lsmod`:

```
root@beagle:~# lsmod
Module                  Size  Used by
musb_hdrc              36352  0
usbcore               143324  2 musb_hdrc
```

Nhớ hệ bare-bones không rule. Chỉ controller driver (`musb_hdrc`), USB core subsystem (`usbcore`) đang load, thủ công cho ví dụ. Sau sẽ thấy udev tự load platform driver. Điểm thú vị là không driver xử lý mouse (input) được load!

Giờ thêm vài rule như Listing 19-4.

LISTING 19-4 Udev rule đơn giản

```
DRIVER!=”?*”, ENV{MODALIAS}==”?*”, RUN{ignore_error}+=”/sbin/modprobe -b
$env{MODALIAS}”
KERNEL==”mouse*|mice|event*”,     NAME=”input/%k”, MODE=”0640”
```

Hai rule đặt file tên tùy ý đuôi `.rules` trong `/` `lib/udev/rules.d`.[^4] Rule đầu kỳ diệu load driver, match nếu uevent attribute `DRIVER` chưa đặt (kernel không biết/cấp driver name). Rule yêu cầu udev `RUN` chương trình `modprobe`, truyền environment variable `MODALIAS`. Sắp xem `MODALIAS`, giờ giả định là “manh mối” để `modprobe` load driver đúng.

Sau driver load, mouse nhận dạng vượt generic USB device. Driver nhận mouse function, đăng ký là mouse driver. Khi driver load sinh chuỗi kernel uevent khác, kích xử lý rule tiếp. Đây rule hai tham gia.

Rule hai match mọi uevent device tên `mouse*`, `mice`, `event*`. Khi khớp yêu cầu tạo node trong subdirectory `input`. Udev giả định `/dev` là root path trừ override—gần như không nên làm trong production. Node mang kernel device name theo substitution operator `%k`. Tạo mode 0640: user read/write, group read-only, other không truy cập. Listing 19-5 cho node sau load, Listing 19-6 cho module load/active sau insert mouse và rule. Chú ý usbhid, mousedev, evdev đã load sẵn cho application device. Có thể double-check module load đúng bằng:

```
# cat /dev/input/mouse0
```

Nếu di mouse khi lệnh active thấy control character trên device. Tất nhiên không human-readable, terminal có thể phàn nàn! Screen trên ttyUSB0 hiện khá đẹp trên Ubuntu 80.4 host tôi.

LISTING 19-5 Entry `/dev` cho mouse device

```
root@beagle:~# ls -l /dev/input/
total 0
crw-r----- 1 root root 13, 64 Jan  3 21:38 event0
crw-r----- 1 root root 13, 63 Jan  3 21:38 mice
crw-r----- 1 root root 13, 32 Jan  3 21:38 mouse0
```

Device `event0` là event stream đầu, mô tả high-level input event. Device `mice` là mixed input mọi mouse—vì vậy số nhiều! Device `mouse0` là low-level mouse thực.

LISTING 19-6 `lsmod` sau xử lý udev

```
root@beagle:~# lsmod
Module                  Size  Used by
evdev                   9080  0
mousedev               11692  0
usbhid                 16548  0
hid                    36944  1 usbhid
musb_hdrc              36352  0
usbcore               143324  3 usbhid,musb_hdrc
```

Có thể thắc mắc mọi module Listing 19-6 load thế nào bởi hai rule đơn giản Listing 19-4. Driver định vị, load qua modalias kỳ diệu.

### 19.4.1 Modalias

Khi detect device như mouse USB ví dụ, kernel phát chuỗi uevent báo thêm. Listing 19-7 chi tiết khi cắm mouse vào port BeagleBoard. Listing 19-7 sinh bằng:

```
# udevadm monitor --kernel
```

LISTING 19-7 Kernel uevent khi cắm USB mouse

```
KERNEL× add      /devices/platform/musb_hdrc/usb1/1-1 (usb)
KERNEL× add      /devices/platform/musb_hdrc/usb1/1-1/1-1:1.0 (usb)
KERNEL× add      /class/usb_endpoint/usbdev1.2_ep81 (usb_endpoint)
KERNEL× add      /class/usb_device/usbdev1.2 (usb_device)
KERNEL× add      /class/usb_endpoint/usbdev1.2_ep00 (usb_endpoint)
KERNEL× add      /module/hid (module)
KERNEL× add      /bus/hid (bus)
KERNEL× add      /module/usbhid (module)
KERNEL× add      /bus/hid/drivers/generic-usb (drivers)
KERNEL× add      /devices/platform/musb_hdrc/usb1/1-1/1-1:1.0/
0003:047D:1035.0001 (hid)
KERNEL× add      /class/input/input0 (input)
KERNEL× add      /bus/usb/drivers/usbhid (drivers)
KERNEL× add      /module/mousedev (module)
KERNEL× add      /class/input/mice (input)
KERNEL× add      /class/input/input0/mouse0 (input)
KERNEL× add      /class/misc/psaux (misc)
KERNEL× add      /module/evdev (module)
KERNEL× add      /class/input/input0/event0 (input)
```

Timestamp rút thành `ts` dễ đọc. Mỗi event có timestamp như Listing 19-1. Có thể ngạc nhiên 18 event từ mouse đơn giản. Năm event đầu báo raw USB device, biểu diễn component architecture USB: device, interface, endpoint. Xem full text uevent cho interface 1-1:1.0.[^5] Listing 19-8 chứa full text theo `udevadm`:

```
# udevadm monitor --environment
```

LISTING 19-8 Kernel uevent cho USB interface 1-1:1.0

```
KERNEL× add    /devices/platform/musb_hdrc/usb1/1-1/1-1:1.0 (usb)
ACTION=add
DEVPATH=/devices/platform/musb_hdrc/usb1/1-1/1-1:1.0
SUBSYSTEM=usb
DEVTYPE=usb_interface
DEVICE=/proc/bus/usb/001/002
PRODUCT=47d/1035/100
TYPE=0/0/0
INTERFACE=3/1/2
MODALIAS=usb:v047Dp1035d0100dc00dsc00dp00ic03isc01ip02
SEQNUM=322
```

Chú ý field `MODALIAS`, đầu trông vô nghĩa. String parse thành phần tử riêng là attribute device cho driver. Một số rõ:

v047D Vendor ID (047D là Kensington)

p1035 Product ID (1035 là product ID wireless mouse Kensington)

Field khác là device-, class-, subsystem-specific, có thể device, device class, subclass. Attribute cung cấp hardware detail low-level. Chi tiết ngoài phạm vi. Quan trọng là utility `modprobe` load module từ `MODALIAS`. Xem hoạt động.

Từ command line BeagleBoard, lệnh sau load hai driver. Giả định đã load platform USB driver (`musb_hdrc`), `usbcore`, và `udevd` không chạy:

```
# modprobe usb:v047Dp1035d0100dc00dsc00dp00ic03isc01ip02
```

Thực thi lệnh `modprobe` load hai module mới `hid`, `usbhid`. Thấy bằng `lsmod` lần nữa:

```
root@beagle:~# lsmod
Module                  Size  Used by
usbhid                 16548  0
hid                    36944  1 usbhid
musb_hdrc              36352  0
usbcore               143324  3 usbhid,musb_hdrc
```

Lời gọi `modprobe` khiến `modprobe` cố load `usbhid`. Vì `hid` là dependency của `usbhid`, load trước. Khi gọi `modprobe`, tham khảo file `modules.alias` trong `` /lib/modules/`uname -r` ``. Utility `depmod` tạo file, mục đích tạo module dependency database. Xem `modules.alias` thấy nhiều dòng giống string `MODALIAS` Listing 19-8. `modprobe` match alias command line với dòng file `modules.alias`. Khớp thì load module trong alias file. Dòng khớp trong `modules.alias` chứa:

```
alias usb:v*p*d*dc*dsc*dp*ic03isc*ip* usbhid
```

Xem dòng `modules.alias`, rõ field `ic`. USB interface class `0x03` định nghĩa human input device (HID). Dòng cơ bản chấp nhận mọi value (wildcard \*) cho mọi field, nếu interface class (ic) là 0x03, load `usbhid`. Thế là xong!

Modalias entry compile trong file `modules.alias` từ chính driver. Ví dụ có dòng sau trong source file kernel `hid.mod.c`:

```
MODULE_ALIAS(“usb:v*p*d*dc*dsc*dp*ic03isc*ip*”);
```

Khi module compile, đặt hệ thống, utility `depmod` thu string, xây `modules.alias` cho `modprobe`. Xem `modules.alias` trên máy và drivers subdirectory kernel gần đây để match entry. Đây cách udev tự load module qua `MODALIAS`. Trong rule Listing 19-4, dòng thứ hai chứa directive `modprobe` thực nói: nếu environment variable `DEVICE` chưa đặt và có text trong `MODALIAS` từ kernel uevent, truyền `MODALIAS` cho `modprobe` load. Dependency như `hid` cũng load. Tính năng rất mạnh.

### 19.4.2 Cấu hình udev rule điển hình

Như nói, tập rule chi phối udev trên embedded Linux thuộc designer hoặc distribution provider. Đôi khi package provider thêm rule cho chức năng riêng. Mọi mainstream distribution gần đây là ví dụ tốt. Listing 19-9 cho default rule từ Moblin snapshot gần đây.

LISTING 19-9 Udev rule mặc định từ Moblin Linux distribution

```
$ ls -l /Moblin/lib/udev/rules.d/
total 60
-rw-r--r-- 1 root root  652 2009-05-10 04:02 10-moblin.rules
-rw-r--r-- 1 root root  348 2009-05-10 04:02 40-alsa.rules
-rw-r--r-- 1 root root  172 2009-05-10 04:02 50-firmware.rules
-rw-r--r-- 1 root root 4548 2009-05-10 04:02 50-udev-default.rules
-rw-r--r-- 1 root root  141 2009-05-10 04:02 60-cdrom_id.rules
-rw-r--r-- 1 root root  715 2009-05-10 04:02 60-persistent-serial.rules
-rw-r--r-- 1 root root 1518 2009-05-10 04:02 60-persistent-storage-tape.rules
-rw-r--r-- 1 root root  708 2009-05-10 04:02 60-persistent-v4l.rules
-rw-r--r-- 1 root root  525 2009-05-10 04:02 61-persistent-storage-edd.rules
-rw-r--r-- 1 root root  390 2009-05-10 04:02 75-cd-aliases-generator.rules
-rw-r--r-- 1 root root 2403 2009-05-10 04:02 75-persistent-net-generator.rules
-rw-r--r-- 1 root root  137 2009-05-10 04:02 79-fstab_import.rules
-rw-r--r-- 1 root root  779 2009-05-10 04:02 80-drivers.rules
-rw-r--r-- 1 root root  234 2009-05-10 04:02 95-udev-late.rules
```

Chú ý nhóm rules file. Tương tự system V initscript, số cố định read order. Rule xử lý đúng thứ tự Listing 19-9. Vài file đáng xem.

File `50-udev-default.rules` thuộc udev package (snapshot hiện tại), do team cung cấp làm mẫu. Moblin rất gần bản default package. File đặt default nhiều Linux device: character device ttys, ptys, serial device, memory device `/dev/null`, `/dev/zero`, nhiều loại khác.

File khác cung cấp attribute, action distribution-specific cho device class cụ thể. Trong Moblin gồm ALSA rule cho sound, CD-ROM rule, nhiều tập persistent name cho các nhóm device. Thêm chi tiết trong documentation cuối chương.

Nhận xét rule đáng nói: trừ cú pháp cụ thể gây hành vi khác, rule tích lũy. Tức một device có nhiều rule qua nhiều file, mỗi rule match attribute khác. Mọi action áp lên device/subsystem. Ví dụ tách rule đặt tên khỏi rule permission. Ubuntu gần đây minh họa bằng `20- names.rules`, `40-basic-permissions.rules`.

Xem `20-names.rules`, `40-basic-permissions.rules` dễ thấy tính “xếp chồng”. Device match nhiều rule, cùng định nghĩa action. Ví dụ sound device `controlC0`, sound card interface. Rule trong `20-names.rules` có thể:

```
KERNEL==”controlC[0-9]*”, NAME=”snd/%k”
```

Rule chỉ match kernel device `controlC0`, `controlC1`, v.v., gán name `snd/%k`. `%k` là tên kernel truyền, ở đây `controlC`. Prefix `snd/` yêu cầu tạo node dưới subdirectory trong `/dev` tên `snd`. Vậy có node `/dev/snd/controlC0` cho sound card interface đầu.

Rule tiếp từ `40-permissions.rules` có thể:

```
KERNEL=”controlC[0-9]*”,  MODE=”0666”
```

Rule này khi udev scan cơ bản nối rule trước, tạo node read/write cho tất cả (user, group, other).

Như vậy distribution tạo rule set sạch tách function để bảo trì dễ. Thấy rule gán tên device thành nhóm (subdirectory dưới `/dev`) duy trì một file, rule permission trong file riêng chỉ quyền. Rất sạch, dễ bảo trì.

Để thành chuyên gia, nghiên cứu tài liệu hay “Writing udev Rules” Daniel Drake cuối chương.

Lưu ý cuối: udev event-driven, không làm gì trừ khi event trigger. Ví dụ dù theo dõi rules directory bằng inotify, rescan nếu sửa file, không action theo rule vừa sửa tới khi device dùng rule bị remove, cài lại.[^6]

### 19.4.3 Thiết lập hệ thống ban đầu cho udev

Udev là user space process nên chưa chạy tới khi kernel boot xong, mount root file system. Đại đa số Linux system embedded hay không chạy init đầu tiên như Chương 6, “Khởi tạo user space”. Hệ udev tạo node phải có cơ chế cho init, child truy cập device thường cần trước udev. Gồm console; input/output `stdin`, `stdout`, `stderr`; vài loại khác.

Cách đơn giản, phổ biến nhất với embedded nhỏ là sẵn vài static node trên `/dev`, rồi mount tmpfs lên `/dev` cho udev trước chạy. Listing 19-10 là startup script đơn giản hóa cho hệ udev-based.

LISTING 19-10 Startup script udev đơn giản

```
#!/bin/sh
# Simplified udev init script
# Assumes we’ve already mounted our virtual file systems, i.e. /proc, /sys, etc.

# mount /dev as a tmpfs
mount -n -t tmpfs -o mode=0755 udev /dev

# Copy default static devices, which were duplicated here
cp -a -f /lib/udev/devices/* /dev

# udev does all the work of hotplug now
if [ -e /proc/sys/kernel/hotplug ]; then
    echo “” > /proc/sys/kernel/hotplug
fi

# Now start the udev daemon
/sbin/udevd --daemon

# Process devices already created by the kernel during boot
/sbin/udevadm trigger

# Wait until initial udevd processing (from the trigger event)
# has completed
/sbin/udevadm settle
```

Script là chức năng tối thiểu cấu hình node động bằng udev. Đầu mount tmpfs (file system RAM-based tạm dùng virtual memory) lên `/dev`. Khi `mount` thành công, nội dung cũ `/dev` biến mất, `/dev` trống.

Tiếp copy tập static node nhỏ thay collection cần boot như console, standard input/output, vài loại khác. Listing 19-11 là ví dụ đặt `/lib/udev/devices` khi tạo file system. Vị trí gốc tùy bạn, không quan trọng.

Action cuối script Listing 19-10 bảo đảm không hotplug agent trong `/proc`. Kernel gửi uevent cho user space agent nếu chỉ định. Nhưng muốn udev nhận qua netlink như trước nên đặt entry rỗng.

LISTING 19-11 Static device node mặc định

```
root@beagle:~# ls -l /lib/udev/devices/
total 8
crw------- 1 root root 5, 1 Jun  8  2009 console
crw-rw-rw- 1 root root 1, 3 Jun  8  2009 null
crw-rw-rw- 1 root root 5, 2 Jun  8  2009 ptmx
drwxrw-r-- 2 root root 4096 Jun  8  2009 pts
drwxrw-r-- 2 root root 4096 Jun  8  2009 shm
lrwxrwxrwx 1 root root   15 Jun  8  2009 stderr -> /proc/self/fd/2
lrwxrwxrwx 1 root root   15 Jun  8  2009 stdin -> /proc/self/fd/0
lrwxrwxrwx 1 root root   15 Jun  8  2009 stdout -> /proc/self/fd/1
```

Giờ setup xong, chạy daemon udevd. Thấy Listing 19-10 dòng `/sbin/udevd`. Nếu nghiên cứu script có thể tự hỏi action cuối làm gì.

### 19.4.3.1 Xử lý coldplug

Trong kernel boot, subsystem khởi tạo, nhiều device phát hiện, đăng ký cùng entry `/sys`. BeagleBoard ví dụ báo gần 200 device `/sys` thông thường udev xử lý tạo node/load driver. Vấn đề udev chỉ chạy sau `init` nên gần 200 device chưa xử lý. Đó lý do có trigger facility.

Xem hai shell command cuối Listing 19-10. `udevdadm` `trigger` khiến udev xử lý mọi entry `/sys` bằng phát lại kernel uevent, xử lý bình thường. Để minh họa quy mô không chiếm 12 trang, đếm device `/dev` trước/sau trigger bằng:

```
root@beagle:~# find /dev -type c -o -type b -o -type l | wc -l
6
```

Chú ý ba node từ lệnh `find` khớp Listing 19-11. Static set đầu đúng ba character device, ba symbolic link, tổng sáu entry. Hai entry cuối Listing 19-11 là directory được lọc bằng `find`.

Sau chạy `udevadm trigger` trong startup script mẫu Listing 19-10, phát lại mọi uevent, thấy hơn 100 device mới, hơn 400 symbolic link tạo. Minh họa qua:

```
root@beagle:~# udevadm trigger
root@beagle:~# udevadm settle
root@beagle:~# find /dev -type c -o -type b | wc -l
135
root@beagle:~# find /dev -type c -o -type b -o -type l | wc -l
410
```

Giờ udev xử lý mọi device kernel tìm boot, thấy 132 node mới, tổng 135 (gồm ba static gốc). Cộng symlink, tổng 410 file trong `/dev` tham chiếu device. Đây cách udev “post-processes” device kernel tạo boot. Từ giờ miễn daemon `udevd` còn chạy, kernel báo mọi device thêm/bỏ, udev xử lý theo rule set.

## 19.5 Load platform device driver

Platform driver dễ load động bằng udev. Default rule trong package cài lên embedded system, giống rule đầu Listing 19-4. Tái hiện cho tiện:

```
DRIVER!=”?*”, ENV{MODALIAS}==”?*”, RUN{ignore_error}+=”/sbin/modprobe
-b $env{MODALIAS}”
```

Rule nói chạy `modprobe`, truyền MODALIAS cho `modprobe` khi `MODALIAS` đặt bởi driver, environment variable `DRIVER` chưa đặt. Miễn driver có macro `MODULE_ALIAS` format đúng, truyền tới `modprobe` match thông tin file `modules.alias` do `depmod` sinh. Chi tiết Phần 19.4.1.

Ví dụ xem platform driver của Inventra dual-role USB controller OMAP3530 BeagleBoard. Listing 19-12 cho vài dòng driver từ kernel gần đây. Dòng cuối tạo entry file `modules.alias` mà `modprobe` dùng chọn driver load.

LISTING 19-12 Một phần `musb_hdrc.c`

```
#define MUSB_DRIVER_NAME “musb_hdrc”
const char musb_driver_name[] = MUSB_DRIVER_NAME;

MODULE_DESCRIPTION(DRIVER_INFO);
MODULE_AUTHOR(DRIVER_AUTHOR);
MODULE_LICENSE(“GPL”);
MODULE_ALIAS(“platform:” MUSB_DRIVER_NAME);
```

Macro `MODULE_ALIAS` thực chất tạo char string (`const char`) đặt trong special section object file driver (module). String giống environment variable, dạng `alias=”string”`. Section `.modinfo` chứa attribute mô tả driver. Thấy header qua cross `readelf`. Nhớ chi tiết `readelf` Chương 13, “Công cụ phát triển”. Section `.modinfo` xem bằng:

```
$ arm_v7_vfp_le-readelf -e drivers/usb/musb/musb_hdrc.ko | grep modinfo
  [11] .modinfo          PROGBITS        00000000 0063dc 0001ec 00   A  0   0  4
```

Để xem nội dung human-readable section `.modinfo`, dùng command `modinfo` từ package module-init-tools:

```
$ modinfo drivers/usb/musb/musb_hdrc.ko
filename:       drivers/usb/musb/musb_hdrc.ko
alias:          platform:musb_hdrc
license:        GPL
author:         Mentor Graphics, Texas Instruments, Nokia
description:    Inventra Dual-Role USB Controller Driver, v6.0
srcversion:     70956E00448DDC456F54F73
depends:        usbcore
vermagic:       2.6.29.1_omap3-omap3530_evm-00003-g1c23d15 mod_unload
modversions ARMv7
parm:           debug:Debug message level. Default = 0 (uint)
parm:           fifo_mode:initial endpoint configuration (ushort)
parm:           use_dma:enable/disable use of DMA (bool)
```

Chú ý alias `platform:musb_hdrc`. Có đủ phần, có thể load driver thủ công bằng modalias string như udev truyền:

```
# modprobe platform:musb_hdrc
```

Tất nhiên nếu udev cấu hình đúng với rule giống Listing 19-4, tự load module bằng modalias. Module load sau lời gọi `udevadm trigger` trong startup script Listing 19-10. Chỉ vậy!

## 19.6 Tùy chỉnh hành vi udev

Giới hạn điều làm với udev có thể chỉ trí tưởng tượng. Có thể chạy chương trình riêng khi add/remove. Ví dụ rule sau khởi động software upgrade khi ai cắm USB storage vào appliance:

```
ACTION=”add”, KERNEL==”sd[a-d][0-9]”, RUN+=”/bin/myloader”
```

Chương trình `/bin/myloader` nhận bản sao udev environment của device. Tiếp có thể xác thực nội dung device mới, bắt đầu action cần. Cách tự động cài software image mới trên embedded Linux.

Nếu chọn cách này, nên fork, detach để udev parent hoàn tất, return. Tránh bất ngờ nếu udev hiện tại/tương lai kill child quá lâu. Cũng cân nhắc execution environment riêng: chương trình kế thừa minimal environment udev có thể chưa đủ. Có thể cần tạo environment riêng cho handler hoàn thành.

### 19.6.1 Ví dụ tùy chỉnh: USB automounting

Listing 19-13 minh họa tập rule tự mount USB Flash drive cắm embedded Linux.

LISTING 19-13 Rule USB automounting

```
# Handle all usb storage devices from sda<n> to sdd<n>
ACTION==”add”, KERNEL==”sd[a-d][0-9]”, SYMLINK+=”usbdisk%n”, NAME=”%k”
ACTION==”add”, KERNEL==”sd[a-d][0-9]”, RUN+=”/bin/mkdir -p /media/usbdisk%n”
ACTION==”add”, KERNEL==”sd[a-d][0-9]”, RUN+=”/bin/mount /dev/%k /media/usbdisk%n”
ACTION==”remove”, KERNEL==”sd[a-d][0-9]”, RUN+=”/bin/umount /media/usbdisk%n”
ACTION==”remove”, KERNEL==”sd[a-d][0-9]”, RUN+=”/bin/rmdir /media/usbdisk%n”
```

Khi detect, udev tạo symbolic link tới device thực tên `usbdiskn`, với `n` device number. Ví dụ `usbdisk0`: sau xử lý có symlink `/dev/usbdisk0` trỏ device thực. Tiếp directive `RUN` tạo directory dưới `/media` cùng tên. Vì option `-p` cho `mkdir`, mọi entry trên path tạo nếu chưa có. Action cuối `add` là mount device mới lên mount point trong `/media`. Khi remove, `umount` thực thi, directory xóa.

Cắm Flash drive vào BeagleBoard với rule trên ở `/lib/udev/rules/99-usb-automount.rules` cho:

```
# ls /media
usbdisk1
# ls /media/usbdisk1/
u-boot.bin         uImage-beagle
```

## 19.7 Đặt tên device bền vững

Persistent naming triển khai mặc định theo scheme Hannes Reinecke đề xuất. Rule nằm trong file có string `“persistent”`. Xem hoạt động.

Nếu xem directory `/dev` trên hệ udev-based thấy cho device disk-based.

Listing 19-14 cho file trong `/dev/disk` BeagleBoard sau cắm hai USB Flash drive vào hub gắn USB port.

LISTING 19-14 Symlink `by-id` trong `/dev/disk`

```
# ls -l /dev/disk/by-id/
mmc-SD02G_0x5079cde8 -> ../../mmcblk0
mmc-SD02G_0x5079cde8-part1 -> ../../mmcblk0p1
mmc-SD02G_0x5079cde8-part2 -> ../../mmcblk0p2
usb-Flash_Drive_SM_USB20_AA04012700008398-0:0 -> ../../sdb
usb-Flash_Drive_SM_USB20_AA04012700008398-0:0-part1 -> ../../sdb1
usb-SanDisk_Cruzer_Mini_SNDK8BA6040286306704-0:0 -> ../../sda
usb-SanDisk_Cruzer_Mini_SNDK8BA6040286306704-0:0-part1 -> ../../sda1
```

Output `ls -l` cắt để tránh dữ liệu không thú vị. Bảy symlink trong directory gọi `by-id`. Mỗi trỏ node udev tạo cho device. Từ trên xuống SD card, generic Flash drive, Cruzer Mini USB Flash drive. Mỗi trường hợp đầu disk device rồi enumerate từng partition. Thấy hai partition SD (`mmcblk0` disk, `mmcblk0p1`, `mmcblk0p2` partition), tương tự một partition mỗi Flash drive.

Symlink là persistent name. Giờ remove drive, cắm lại hub port khác. Udev qua helper `usb_id` gán cùng tên (symlink) trỏ node đúng, chưa chắc raw node giống lần cắm đầu.

### 19.7.1 Udev helper utility

Unique ID string Listing 19-14 sinh bằng đọc raw device hoặc query attribute `data` trong `/sys`. Do tập helper nhỏ trong directory `extras` của udev git tree: `scsi_id`, `cdrom_id`, `path_id`, `volume_id`. Xem subdirectory `extras` để đủ. Xem utility `usb_id` hiểu hoạt động.

Rule sinh persistent name (unique ID) từ `60-persistent-storage.rules` trong source tree:

```
KERNEL==”sd*[!0-9]|sr*”, ENV{ID_SERIAL}!=”?*”, SUBSYSTEMS==”usb”,
IMPORT{program}=”usb_id --export %p”
```

Rule nói với mọi kernel device có `ACTION` là `add`/`change`,[^7] name sd\*/sr\* không device number (base disk, không partition), gọi `usb_id`, thu output `stdout` thành environment variable. `%p` là string substitution operator, chỉ DEVPATH—device path `/sys`. Xem chạy thủ công console:

```
# /lib/udev/usb_id --export /devices/platform/musb_hdrc/usb1/1-1/1-1.2/1-1.2:1.0
/host1/target1:0:0/1:0:0:0/block/sda/sda1
ID_VENDOR=SanDisk
ID_VENDOR_ENC=SanDisk\x20
ID_VENDOR_ID=0781
ID_MODEL=Cruzer_Mini
ID_MODEL_ENC=Cruzer\x20Mini\x20\x20\x20\x20\x20
ID_MODEL_ID=5150
ID_REVISION=0.1
ID_SERIAL=SanDisk_Cruzer_Mini_SNDK8BA6040286306704-0:0
ID_SERIAL_SHORT=SNDK8BA6040286306704
ID_TYPE=disk
ID_INSTANCE=0:0
ID_BUS=usb
ID_USB_INTERFACES=:080650:
ID_USB_INTERFACE_NUM=00
ID_USB_DRIVER=usb-storage
```

Khi command `usb_id` chạy trong rule, output import vào environment cho udev event này. Sau trong cùng file (`60-persistent-storage.rules`) có rule:

```
KERNEL==”sd*|sr*”, ENV{DEVTYPE}==”disk”, ENV{ID_SERIAL}==”?*”,
SYMLINK+=”disk/by-id/$env{ID_BUS}-$env{ID_SERIAL}”
```

Rule này tạo persistent name từ `usb_id`. Nói với uevent `ACTION` là `add`/`change`, device name sd\*/sr\* (disk SCSI-type), variable `DEVTYPE` là `disk`, variable `ID_SERIAL` là string non-null, tạo symlink ghép `ID_BUS`, `ID_SERIAL` bằng dash (-). Kết quả symlink như Listing 19-14.

Utility không nhất thiết cho end user. Dễ hơn dùng `udevadm info` lấy thông tin để dùng persistent name. Listing 19-15 cho output `udevadm info` cùng Cruzer Mini USB Flash drive. Dễ dùng, dành system admin/developer. Truyền device name từ `/dev`—ví dụ partition đầu sda.

LISTING 19-15 Query device bằng `udevadm`

```
# udevadm info --query=env --name=/dev/sda1
DEVPATH=/devices/platform/musb_hdrc/usb1/1-1/1-1.2/1-1.2:1.0/host1/
target1:0:0/1:0:0:0/block/sda/sda1
MAJOR=8
MINOR=1
DEVTYPE=partition
DEVNAME=/dev/sda1
ID_VENDOR=SanDisk
ID_VENDOR_ENC=SanDisk\x20
ID_VENDOR_ID=0781
ID_MODEL=Cruzer_Mini
ID_MODEL_ENC=Cruzer\x20Mini\x20\x20\x20\x20\x20
ID_MODEL_ID=5150
ID_REVISION=0.1
ID_SERIAL=SanDisk_Cruzer_Mini_SNDK8BA6040286306704-0:0
ID_SERIAL_SHORT=SNDK8BA6040286306704
ID_TYPE=disk
ID_INSTANCE=0:0
ID_BUS=usb
ID_USB_INTERFACES=:080650:
ID_USB_INTERFACE_NUM=00
ID_USB_DRIVER=usb-storage
DEVLINKS=/dev/block/8:1 /dev/disk/by-id/usb-SanDisk_Cruzer_Mini_SNDK-
8BA6040286306704-0:0-part1 /dev/usbdisk1
```

Dùng dữ liệu thế nào? Trước đã thấy mount Flash disk bằng rule. Dùng unique identifier từ `udevadm info` xây rule. Chú ý dùng bất kỳ attribute nếu hợp lý.

Cách phổ biến nhất là tên human-readable hoặc dễ nhận biết, bền vững cho device. Ví dụ:

```
ACTION==”add”, ENV{ID_SERIAL}==”SanDisk_Cruzer_Mini_SNDK8BA6040286306704-0:0”,
SYMLINK+=”cruzer”
```

Gây thêm symlink mới vào `/dev`, trỏ tên bất kỳ kernel/udev tạo cho device:

```
# ls -l /dev/cruzer
lrwxrwxrwx  1 root  root  4 Jan  1 22:12 /dev/cruzer -> sda1
```

Xem lại USB automount rule Listing 19-13, tạo rule luôn mount Cruzer Mini Flash disk này tại mount point chọn, bất kể thứ tự cắm hay vị trí USB hierarchy:

```
ACTION==”add”, ENV{ID_SERIAL}==”SanDisk_Cruzer_Mini_SNDK8BA6040286306704-0:0”,
RUN+=”/bin/mkdir -p /media/cruzer”
ACTION==”add”, ENV{ID_SERIAL}==”SanDisk_Cruzer_Mini_SNDK8BA6040286306704-0:0”,
RUN+=”/bin/mount /dev/%k /media/cruzer”
```

Với rule cài file `99-usb-automount.` `rules` trong ví dụ, mỗi lần cắm Cruzer Mini (bất kể thứ tự/hub port), luôn mount, nội dung tại `/media/cruzer`. Đó kỳ diệu udev, persistent naming!

## 19.8 Dùng udev với busybox

Xem rule đầu Listing 19-4, gọi `modprobe` với flag `-b` kiểm tra modules blacklist nếu có. Hiện không tương thích busybox `modprobe`.[^8] Khi `modprobe` chạy chưa sửa, không thấy driver load khi mong vậy. Lỗi gọi `modprobe` không rõ vì daemon udev nhận stdout/stderr khi chạy chương trình trong context, nên không hiện console.

Cách dễ là bản thực `modprobe`—thêm package module-init-tools vào system, có bản đầy đủ `modprobe`, `lsmod`, `insmod`. Cần compile busybox tắt hỗ trợ `depmod` hoặc tối thiểu xóa symlink busybox trỏ module-init-tools utility lại busybox. Tùy cấu hình có link/scriptlet—script wrapper đơn giản gọi busybox cho mỗi function. Xem Chương 11, “BusyBox”, chi tiết option cài.

### 19.8.1 busybox mdev

Busybox có bản nhỏ nhiều Linux utility nên sao không udev? Đơn giản mdev là câu trả lời của busybox. Tạo device node động `/dev` khi discovery. Vì giản lược nên không phong phú, linh hoạt như package udev stand-alone.

Như udev, busybox mdev cần sysfs kernel và hotplug-enabled. Khó tưởng tượng embedded Linux hiện đại không bật subsystem này![^9]

Mdev dùng old hotplug infrastructure nhận uevent. Nhớ Listing 19-10 với udev đặt file `/proc` tên agent rỗng (tắt) để kernel không gửi uevent tới agent. Mdev yêu cầu chính nó làm hotplug agent qua `/bin/mdev`. Việc đầu startup script là đặt file `/proc` trỏ mdev:

```
echo “/bin/mdev” > /proc/sys/kernel/hotplug
```

Tất nhiên sau mount `/proc`. Yêu cầu ít rõ hơn là cũng mount `/sys`. Xong thì chạy utility. Listing 19-16 là startup script busybox mdev mẫu.

LISTING 19-16 Startup script mẫu cho busybox mdev

```
#!/bin/sh

# mount virtual file systems
mount -t proc /proc /proc
mount -t sysfs /sys /sys
mount -t tmpfs /tmp /tmp
mount -t devpts /pts /dev/pts

# mount /dev as a tmpfs
mount -n -t tmpfs -o mode=0755 udev /dev

# Copy default static devices, which were duplicated here
cp -a -f /lib/udev/devices/* /dev

# Set hotplug agent
echo “/bin/mdev” > /proc/sys/kernel/hotplug

# Start busybox mdev
/bin/mdev -s
```

Mặc định mdev chỉ tạo node trong `/dev` cùng kernel device name truyền uevent. Rất hữu ích nếu không cần linh hoạt udev stand-alone, thường cho device name well-known.

Listing 19-16, flag `-s` khi gọi mdev giống `udevadm trigger`, scan `/sys` tạo node device thấy. Nhờ đó tạo node cho initial device kernel đã phát hiện trước `init` chạy (busybox là `busybox init`).

Boot hệ cấu hình busybox, bỏ udev, trước mdev chạy có:

```
# find /dev -type b -o -type c | wc -l
3
```

Thực thi `/bin/mdev` (busybox link/scriptlet trỏ chính `/bin/busybox` ) cho:

```
# find /dev -type b -o -type c | wc -l
130
```

### 19.8.2 Cấu hình mdev

Busybox mdev tùy chỉnh bằng optional configuration file `/etc/mdev.` `conf`, chủ yếu quyền node. Mặc định tạo uid:gid root:root, permission 0660. Entry `/etc/mdev.conf` đơn giản dạng:

```
device uid:gid octal permissions
```

`device` là regex đơn giản device name, tương tự udev specification. Field còn lại self-explanatory, lưu ý `uid`, `gid` là số, không ASCII user/group name.

Ví dụ sau đổi default permission 777, giữ default user:group root:root. Có thể đổi user/group tương tự:

```
.* 0:0 777
```

Cũng rename/relocate node bằng `/etc/mdev.conf`. Rule chuyển mọi mouse device sang subdirectory `input` trong dev:

```
mouse* 0:0 660 input/
```

Học thêm busybox mdev trong documentation file source tree busybox.

## 19.9 Tổng kết

Chương trình bày chi tiết udev, utility Linux tăng nhiều giá trị cho distribution. Dùng đúng tạo hệ user-friendly, tự phát hiện/cấu hình device không cần người can thiệp.

- Bắt đầu bằng giới thiệu udev, mục đích.

- Hành vi mặc định làm nền hiểu tùy chỉnh.

- Khảo sát setup điển hình minh họa phức tạp dùng udev.

- Thảo luận tùy chỉnh để designer/maintainer tạo hệ theo use case.

- Với user busybox xem mdev, bản thay udev nhẹ.

- Kết thúc với ví dụ cấu hình busybox mdev.

### 19.9.1 Gợi ý đọc thêm

“Udev: A Userspace Implementation of devfs” Greg Kroah-Hartman www.kroah.com/linux/talks/ols\_2003\_udev\_paper/Reprint-Kroah-Hartman-OLS2003.pdf

Linux Allocated Devices Torben Mathiasen, maintainer www.lanana.org/docs/device-list/devices.txt

Linux Device Drivers, 3rd Edition (especially Chapter 14, “The Linux Device Model”) Jonathan Corbet, Alessandro Rubini, and Greg Kroah-Hartman O’Reilly, 2005

“Writing udev Rules” Daniel Drake http://reactivated.net/writing\_udev\_rules.html

Persistent Device Names in Linux 2.6.x Hannes Reinecke July 12, 2004

[^1]: Học thêm netlink socket tại http://en.wikipedia.org/wiki/Netlink.

[^2]: Đúng tên node biểu diễn mouse (hay device khác) nếu cắm thẳng hub four-port này.

[^3]: Giả định hệ cấu hình load driver động.

[^4]: Tất nhiên production nên đặt tên, tổ chức rule file hợp lý hơn.

[^5]: Scheme đánh số trình bày Chương 18.

[^6]: Có thể trigger thủ công bằng `udevadm trigger` để áp thay đổi.

[^7]: Xem `60-persistent-storage.rules` để biết chính xác. Clause `add|change` ở đầu file trong pseudo statement `if`, bỏ toàn file nếu `ACTION` không `add`/`change`.

[^8]: Test trên busybox v1.41.1.

[^9]: Được, tôi tưởng tượng hệ rất tối thiểu tắt hotplug/sysfs, nhưng rất riêng biệt, hạn chế chức năng.
