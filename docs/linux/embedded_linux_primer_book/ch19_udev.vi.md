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

Giống như nhiều Linux kernel subsystem, udev đã phát triển theo thời gian dựa trên

nhiều ý kiến đóng góp từ user, developer và distribution maintainer, cũng như

kinh nghiệm trước đây từ những nỗ lực giải quyết vấn đề tương tự.

udev thay thế devfs, một nỗ lực nhằm giải quyết tình trạng phát triển không kiểm soát của directory

`/dev` và đáp ứng yêu cầu tạo directory `/dev` một cách động

dựa trên việc phát hiện hardware hiện diện trong hệ thống.

Cũng như nhiều chủ đề khác trong cuốn sách, việc trình bày toàn diện udev sẽ cần

một cuốn sách nhỏ riêng. Chương này giới thiệu nhanh udev, những gì nó có thể làm

cho bạn và cách nó hoạt động.

## 19.1 udev là gì?

Để ôn lại ngắn gọn, `/dev` là directory trong Linux system chứa các file system entry đặc biệt gọi là device node. Device node đã được giới thiệu trong Chương 8, “Kiến thức cơ bản về device driver”, Mục 8.3.3, “Device node và `mknod`”. Có thể xem các file đặc biệt này như những “pointer” tới các device driver thực sự điều khiển device và cho phép ứng dụng truy cập device. Một device node tạo sự liên kết giữa một tên human-readable và một cặp major number, minor number của kernel device. Device node còn chứa một attribute marker chỉ định loại device mà nó tham chiếu, chẳng hạn block device hay character device.

Trong quá khứ not-so-distant, các Linux system đi kèm hàng nghìn device node được tạo tĩnh, thường bằng một script như `MAKEDEV`. Nếu bạn có Linux chạy trên máy ở nhà hoặc nơi làm việc, nhiều khả năng bạn vẫn tìm thấy script `MAKEDEV` trên hệ thống của mình.

Khi không có phương pháp tự động xác định những device hiện diện trên hệ thống, các Linux distribution maintainer chỉ đơn giản dùng `MAKEDEV` để tạo nội dung `/dev` với hầu như mọi device có thể gặp. Không khó để hiểu rằng cách tiếp cận brute-force này không lý tưởng.

udev là subsystem mới và tiên tiến nhất được thiết kế để tạo nội dung directory `/dev` một cách động, dựa trên thông tin do kernel cung cấp khi phát hiện các device. Nó đã phát triển thành một cách rất linh hoạt và mạnh mẽ để áp dụng policy khi phát hiện một phần hardware trong hệ thống. Hãy chú ý rằng tôi không nói “load một device driver” hay “tạo một device node” khi phát hiện hardware. Thực tế, udev thường thực hiện các thao tác này theo mặc định, nhưng bạn có thể tùy chỉnh những thao tác xảy ra khi một device cụ thể được phát hiện. Hành vi mặc định của udev là tạo device node mang tên device do kernel cung cấp.

Có nhiều cách để một device bất ngờ xuất hiện trong Linux system rất lâu sau khi hệ thống đã boot. Một số ví dụ rõ ràng là cắm USB device vào USB port hoặc bật wireless interface bằng công tắc có trên nhiều laptop. Hot-plugging một hard drive vào chassis fault-tolerant có thể là một ví dụ khác.

## 19.2 Phát hiện device

Khi kernel phát hiện một device mới, nó tạo ra một uevent được gửi đến một listener trên netlink socket[^1] trong user space. Listener đó chính là udev. Listing 19-1 trình bày một uevent điển hình do kernel gửi. Uevent này được thu thập bằng tiện ích `udevadm` theo cách dưới đây, rồi cắm một USB hub four-port vào USB host port trên BeagleBoard:

```
# udevadm monitor --environment
```

(Lưu ý rằng các phiên bản udev trước đây dùng những lệnh riêng như `udevmonitor` hoặc `udevtrigger`. Các phiên bản mới đã gộp tất cả công cụ này vào một admin program duy nhất là `udevadm`, như ở đây. Hãy kiểm tra phiên bản bạn đang chạy nếu hệ thống không nhận biết lệnh này.)

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

Listing 19-1 trình bày kernel uevent đầu tiên được phát khi một USB hub four-port được phát hiện sau khi cắm vào USB port trên BeagleBoard. Dòng đầu cho biết uevent này là một thao tác “add”, nghĩa là kernel đã phát hiện USB device. Kernel name của nó là

```
/devices/platform/musb_hdrc/usb1/1-1
```

Khi kernel phát hiện một device mới, một trong những thao tác mặc định của nó là tạo một entry trong sysfs file system, gần như luôn được mount tại `/sys`. Attribute `DEVPATH` biểu diễn vị trí của device trong directory hierarchy `/sys` và được tham chiếu ở nhiều nơi trong udev rule cũng như các tiện ích. Những attribute khác cho biết device type, device, product (vendor và/hoặc device ID) cùng một số thông tin về vị trí vật lý của device trong hierarchy USB bus. Attribute `DEVICE` thể hiện device node mà kernel xác định cho device này. Device được phát hiện trên USB bus số 001 và được kernel gán device number 002.

Trong Listing 19-1, product vendor code là 5e3 và device là 608. Theo danh sách được duy trì tại www.linux-usb.org/usb.ids, vendor 05e3 là Genesys Logic, Inc. và product ID 0608 là một USB 2.0 hub four-port.

Uevent sequence number được tăng lên với mỗi uevent được phát. Cuối cùng, uevent bao gồm major number và minor number của device driver. Trong trường hợp này, major number được gán là 189 và minor number là 1.

Khi nhận uevent, udev quét rules database của nó (được mô tả ở Mục 19.4). udev tìm những rule khớp với attribute của device, qua đó xác định các thao tác cần thực hiện dựa trên những attribute đó. Nếu không có rule nào khớp, hành vi mặc định của udev chỉ là tạo device node mang tên do kernel cung cấp, với major number và minor number được chỉ định trong kernel uevent. Trong trường hợp này, thao tác đó tạo device node sau, được hiển thị bằng `ls -l`:

```
crw-rw---- 1 root root 189, 0 Jun  4 16:37 usbdev1.1
```

Các rule trong udev cho phép người thiết kế hệ thống hoặc distribution maintainer áp dụng những thao tác tùy chỉnh phù hợp với các ứng dụng cụ thể. Thường thì các default rule chỉ định tạo một device node thích hợp trong `/dev`. Chúng cũng thường bao gồm việc tạo symlink trỏ đến device node vừa tạo; đó có thể là một tên viết tắt well-known mà các ứng dụng dùng để truy cập device. Chúng ta sẽ xem chi tiết udev rule ngay sau đây.

## 19.3 Hành vi udev mặc định

Có thể bạn sẽ ngạc nhiên khi biết uevent trong Listing 19-1 chỉ là uevent đầu tiên trong nhiều kernel uevent được gửi đến. Listing 19-2 trình bày chi tiết mọi uevent do kernel tạo khi cắm hub four-port này. Listing được tạo bằng lệnh udev sau:

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

Lưu ý rằng timestamp đã được bỏ đi và thay bằng `ts` để listing vừa trang và dễ đọc hơn. Mỗi uevent đều có timestamp như trong Listing 19-1. Bạn có thể thấy năm event được tạo khi cắm USB hub four-port. Chúng biểu diễn những thành phần khác nhau trong USB device hierarchy. USB và architecture của nó đã được mô tả trong Chương 18, “Universal Serial Bus”.

Listing 19-3 trình bày các device node mà udev đã tạo đến thời điểm này. Chúng được tạo trong `/dev` và thể hiện hành vi mặc định của udev. Trong bài thực hành nhập môn này, chưa có rule nào được cung cấp cho udev để tùy chỉnh hành vi của nó.

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

Hình 19-1 trình bày hardware configuration đã tạo ra các device trong Listing 19-3.

![Figure 19-1](images/ch19/fig19-01.png)

HÌNH 19-1 Setup USB hub four-port

Dòng đầu trong Listing 19-3 biểu diễn host controller trên BeagleBoard. Như đã tìm hiểu trong Chương 18, chúng ta có thể biết đó là gì bằng cách xem các attribute của nó trong `/sys`. Đây là USB controller high-speed dual-rate (thường được gọi chung là USB host controller), một phần của chip Texas Instruments OMAP3530 trên BeagleBoard. Sau đây là cách khảo sát các device attribute bằng /sys:

```
# cd /sys/devices/platform/musb_hdrc/usb1
# cat idVendor idProduct product
1d6b
0002
MUSB HDRC host driver
```

Ba dòng tiếp theo trong Listing 19-3 biểu diễn hub one-port nội bộ luôn gắn với USB host controller về mặt architecture. Đây là root hub đã thảo luận trong Chương 18. Bạn có thể hình dung physical connector như hub one-port đó. Như đã thảo luận trong Chương 18, USB device gồm các thực thể logic gọi là interface và endpoint. Device có tên `usbdev1.1` biểu diễn USB interface, còn các device có tên `usbdev1.1_ep00` và `usbdev1.1_ep81` biểu diễn những logical endpoint trong hub, tức các thực thể logic thực sự giao tiếp qua USB bus.

Sau khi cắm hub four-port vào USB port của BeagleBoard, ba device node cuối trong Listing 19-3 được udev tạo theo hành vi mặc định. Hãy chú ý cách đánh số device node: `.2` biểu diễn hub thứ hai trong hierarchy các USB hub được kết nối.

Bạn có thể tự hỏi liệu những tên khác có biểu diễn các device loại này tốt hơn không. Nếu device được dùng trực tiếp bởi application program, chẳng hạn USB mouse, thì một tên như `usbdev1.3_ep00`[^2] sẽ không mấy user-friendly. Đây là lúc các rule của udev phát huy tác dụng.

## 19.4 Hiểu udev rule

Sức mạnh thực sự của udev đến từ rules engine. Người thiết kế hệ thống và distribution maintainer dùng udev rule để tổ chức hierarchy `/dev` và gán tên user-friendly cho các device node mà nó tạo. Trong phần lớn trường hợp, default device name được tạo, đồng thời một symlink với tên user-friendly cũng được tạo bên cạnh để liên kết kernel name với một tên user-friendly.

Rules engine của udev cũng có thể được dùng để load device driver (module). Thực tế, bằng udev rule, bạn có thể thực hiện gần như bất kỳ thao tác nào có thể hình dung khi phát hiện một device được cắm vào hoặc tháo ra. Tuy nhiên, cách dùng udev rule phổ biến nhất là đổi tên device, tức tạo symbolic link với tên human-readable, và load device driver.

Hãy xem một tập rule điển hình mà udev dùng để quyết định thực hiện thao tác nào sau khi nhận uevent từ kernel. Trong các phiên bản udev gần đây, vị trí mặc định của udev rule là `/lib/udev/rules.d`. Chúng ta sẽ dùng đây làm vị trí mặc định trong phần thảo luận còn lại. Nhiều distribution đặt udev rule tại `/etc/udev/rules.d`. Các rules file thường được distribution maintainer tùy chỉnh và nhóm theo chức năng để dễ bảo trì. Nếu đang ngồi gần một máy Linux khi đọc phần này, bạn có thể dành chút thời gian xem các rules file của nó.

Mặc dù directory mặc định mà udev tìm rule là `/lib/udev/rules.d`, udev cũng tìm trong `/etc/udev/rules.d`. Mọi rules file tìm thấy ở đó sẽ ghi đè rules file cùng tên trong `/lib/udev/rules.d`, cho phép bạn ghi đè các default rule.

Trong các Linux distribution hiện đại, tập hợp các rules file tạo thành bản hướng dẫn những thao tác cần thực hiện khi phát hiện hoặc tháo một device. Distribution trên laptop của tôi có 31 rules file với gần 1.400 dòng và gần 700 rule riêng biệt! Khi xem qua những rules file này, bạn sẽ bắt đầu hiểu được tính linh hoạt và sức mạnh của udev.

Khi được khởi chạy lần đầu, udev đọc tất cả rule trong `/lib/udev/rules.d/` và xây dựng một rules table nội bộ. Khi một device được phát hiện, udev đối chiếu các action và attribute do kernel truyền trong uevent với global rules table mà nó duy trì. Khi tìm thấy sự khớp, những thao tác do rule hoặc tập rule đó xác định sẽ được thực hiện. Hãy xem một ví dụ.

Tiếp tục ví dụ BeagleBoard trước đó, hãy xem điều gì xảy ra khi cắm một mouse thông thường vào USB port. Nếu không có rule, udev tạo các device node bắt buộc bằng raw name do kernel cung cấp trong uevent:

```
root@beagle:~# ls -l /dev/usbdev1.2*
crw-rw---- 1 root root 189, 1 Jan  1 00:21 /dev/usbdev1.2
crw-rw---- 1 root root 253, 3 Jan  1 00:21 /dev/usbdev1.2_ep00
crw-rw---- 1 root root 253, 2 Jan  1 00:21 /dev/usbdev1.2_ep81
```

Những device này biểu diễn USB infrastructure cơ bản. Không có device nào khác được tạo. Nếu có chút hiểu biết về input device trong Linux, bạn có thể mong đợi một device có tên mouse-something. Nhiều ứng dụng thông dụng mong tìm thấy mouse mang một device name như vậy. Hơn nữa, không có device driver nào được load để xử lý mouse vừa cắm. Trên một desktop system được cấu hình đúng, giả sử Linux distribution hiện đại và hoạt động bình thường, bạn sẽ thấy một device có tên thông dụng (chẳng hạn `mouse*`) và mong đợi input device driver cùng mouse driver đã được load.[^3]

Hãy nhớ từ Chương 8 rằng chúng ta có thể kiểm tra những module đã được load bằng lệnh `lsmod`:

```
root@beagle:~# lsmod
Module                  Size  Used by
musb_hdrc              36352  0
usbcore               143324  2 musb_hdrc
```

Hãy nhớ đây là hệ thống bare-bones không có udev rule. Hiện chỉ host controller driver (`musb_hdrc`) và USB core subsystem (`usbcore`) được load, và chúng đã được load thủ công cho ví dụ này. Phần sau sẽ cho thấy cách udev tự động load những platform driver đó. Điểm đáng chú ý ở đây là không có device driver nào được load để xử lý mouse (input) device!

Giờ hãy bổ sung một vài rule để udev xử lý, như trình bày chi tiết trong Listing 19-4.

LISTING 19-4 Udev rule đơn giản

```
DRIVER!=”?*”, ENV{MODALIAS}==”?*”, RUN{ignore_error}+=”/sbin/modprobe -b
$env{MODALIAS}”
KERNEL==”mouse*|mice|event*”,     NAME=”input/%k”, MODE=”0640”
```

Hai rule này được đặt trong một file có tên tùy ý, kết thúc bằng `.rules`, tại `/` `lib/udev/rules.d`.[^4] Rule đầu tiên chứa cơ chế để load device driver. Rule này khớp nếu kernel uevent attribute `DRIVER` chưa được đặt (cho biết kernel không biết hoặc không cung cấp driver name). Rule yêu cầu udev `RUN` chương trình `modprobe`, truyền cho nó nội dung environment variable `MODALIAS`. Chúng ta sẽ khảo sát `MODALIAS` ngay sau đây, nhưng trước mắt hãy coi nó là một “manh mối” mà `modprobe` dùng để load device driver thích hợp.

Sau khi device driver được load, mouse device được nhận diện cụ thể hơn một generic USB device. Driver nhận diện các chức năng mouse và đăng ký chính nó như một mouse driver. Khi driver được load, một chuỗi kernel uevent khác được tạo ra, khiến quá trình xử lý rule tiếp tục bắt đầu. Đây là lúc rule thứ hai tham gia.

Rule thứ hai khớp với mọi kernel uevent có device mang tên `mouse*`, `mice` hoặc `event*`. Khi tìm thấy sự khớp, rule yêu cầu udev tạo device node trong subdirectory có tên `input`. udev giả định `/dev` là root path của các device node trừ khi được ghi đè, nhưng gần như không bao giờ nên làm vậy trên production system. Device node mang tên kernel device, được chỉ định ở đây bằng substitution operator `%k`. Device node được tạo với mode 0640, nghĩa là user có quyền đọc/ghi, group có quyền read-only và other không được truy cập. Listing 19-5 trình bày các device node sau khi driver được load, còn Listing 19-6 hiển thị những module đã được load và đang hoạt động sau event cắm mouse này cùng quá trình xử lý udev rule. Hãy chú ý các module usbhid, mousedev và evdev đã được load và sẵn sàng cho application device sử dụng. Bạn có thể double-check trên hệ thống rằng các module đã được load đúng bằng lệnh sau:

```
# cat /dev/input/mouse0
```

Nếu di chuyển mouse trong khi lệnh này đang chạy, bạn sẽ thấy các control character được nhận trên device đó. Tất nhiên, chúng không phải ký tự human-readable, và terminal device của bạn có thể phàn nàn! Chương trình screen trên ttyUSB0 hiển thị dữ liệu này khá tốt trên Ubuntu 80.4 host của tôi.

LISTING 19-5 Entry `/dev` cho mouse device

```
root@beagle:~# ls -l /dev/input/
total 0
crw-r----- 1 root root 13, 64 Jan  3 21:38 event0
crw-r----- 1 root root 13, 63 Jan  3 21:38 mice
crw-r----- 1 root root 13, 32 Jan  3 21:38 mouse0
```

Device có tên `event0` biểu diễn event stream đầu tiên, là một mô tả high-level của input event. Device có tên `mice` biểu diễn input tổng hợp từ tất cả mouse device, vì thế tên dùng dạng số nhiều của mouse! Device có tên `mouse0` là chính low-level mouse device.

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

Bạn có thể tự hỏi vì sao tất cả module trong Listing 19-6 lại được load chỉ bằng hai rule đơn giản trong Listing 19-4. Các device driver này được tìm thấy và load thông qua cơ chế modalias.

### 19.4.1 Modalias

Khi một device được phát hiện, chẳng hạn USB mouse đang được dùng làm ví dụ ở đây, kernel gửi một chuỗi uevent báo cáo việc thêm device đó. Listing 19-7 trình bày chi tiết các kernel uevent được phát khi USB mouse được cắm vào USB port trên BeagleBoard. Listing 19-7 được tạo bằng lệnh sau:

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

Các timestamp đã được rút ngắn thành `ts` để dễ đọc. Mỗi kernel event thực tế chứa một timestamp tương tự trong Listing 19-1. Bạn có thể ngạc nhiên khi thấy 18 event được phát chỉ vì cắm một USB mouse đơn giản. Năm event đầu báo việc thêm chính các raw USB device và biểu diễn những thành phần architecture của USB implementation. Đó là USB device, interface và endpoint. Hãy xem toàn bộ nội dung uevent được phát cho USB interface 1-1:1.0.[^5] Listing 19-8 chứa toàn bộ nội dung kernel uevent đó như được `udevadm` báo cáo:

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

Hãy chú ý field `MODALIAS`. Thoạt nhìn, nó có vẻ vô nghĩa. String này có thể được parse thành từng phần tử riêng, là các attribute mà USB device cung cấp cho device driver. Một số field khá rõ ràng:

v047D Vendor ID (047D là Kensington)

p1035 Product ID (1035 là product ID của Kensington dành cho một wireless mouse)

Các field khác dành riêng cho device-, class- và subsystem-specific. Chúng có thể bao gồm các attribute như device, device class và subclass. Những attribute này cung cấp chi tiết hardware low-level cho driver. Việc đi sâu các chi tiết đó nằm ngoài phạm vi phần thảo luận này. Điều quan trọng ở đây là nhận ra tiện ích `modprobe` có thể load một module từ `MODALIAS` này. Hãy xem cơ chế đó hoạt động ra sao.

Từ command line của BeagleBoard, lệnh sau khiến hai device driver được load. Điều này giả định rằng bạn đã load platform USB driver (`musb_hdrc`) và `usbcore`, đồng thời `udevd` không chạy:

```
# modprobe usb:v047Dp1035d0100dc00dsc00dp00ic03isc01ip02
```

Thực thi lệnh `modprobe` này khiến hai module mới được load: `hid` và `usbhid`. Bạn có thể thấy điều đó bằng cách chạy lại lệnh `lsmod`:

```
root@beagle:~# lsmod
Module                  Size  Used by
usbhid                 16548  0
hid                    36944  1 usbhid
musb_hdrc              36352  0
usbcore               143324  3 usbhid,musb_hdrc
```

Lời gọi `modprobe` này khiến `modprobe` cố load `usbhid`. Vì `hid` là một dependency của `usbhid`, nó được load trước. Khi được gọi, `modprobe` tham khảo một file có tên `modules.alias`, nằm trong `` /lib/modules/`uname -r` ``. File này được tạo bởi tiện ích `depmod`, có mục đích xây dựng database các module dependency. Nếu xem nội dung `modules.alias`, bạn sẽ thấy nhiều dòng rất giống string `MODALIAS` trong Listing 19-8. `modprobe` đối chiếu alias truyền trên command line với một dòng trong file `modules.alias`. Nếu tìm thấy sự khớp, module trong alias file được load. Sau đây là nội dung dòng khớp trong `modules.alias`:

```
alias usb:v*p*d*dc*dsc*dp*ic03isc*ip* usbhid
```

Nhìn vào dòng này trong `modules.alias`, ý nghĩa field `ic` trở nên rõ ràng. USB interface class `0x03` định nghĩa các human input device (HID). Về cơ bản, dòng này yêu cầu chấp nhận mọi giá trị (do wildcard \*) cho tất cả field, và nếu field interface class (ic) chứa 0x03 thì load `usbhid`. Thế là xong!

Các modalias entry được tổng hợp trong file `modules.alias` đến từ chính các device driver. Trong ví dụ này, bạn sẽ tìm thấy dòng sau trong source file `hid.mod.c` của kernel:

```
MODULE_ALIAS(“usb:v*p*d*dc*dsc*dp*ic03isc*ip*”);
```

Khi các module được compile và đặt lên hệ thống, tiện ích `depmod` thu thập tất cả những string này và xây dựng file `modules.alias` để `modprobe` tham khảo. Hãy xem file `modules.alias` trên máy Linux của bạn, sau đó xem subdirectory drivers của một Linux kernel gần đây để đối chiếu các entry. Đây là cách udev tự động load module: thông qua `MODALIAS`. Trong rule mẫu ở Listing 19-4, dòng thứ hai chứa directive `modprobe` thực chất nói như sau: nếu environment variable `DEVICE` chưa được đặt và environment variable `MODALIAS` do kernel uevent truyền có nội dung, hãy truyền `MODALIAS` cho `modprobe` để load module. Mọi module dependency, chẳng hạn `hid` trong ví dụ, cũng được load. Đây là một tính năng rất mạnh của udev.

### 19.4.2 Cấu hình udev rule điển hình

Như đã đề cập, tập rule chi phối hành vi udev trên hệ thống embedded Linux là trách nhiệm của người thiết kế hệ thống hoặc nhà cung cấp embedded Linux distribution. Trong một số trường hợp, nhà cung cấp package bổ sung rule để hỗ trợ chức năng riêng của package. Bất kỳ Linux distribution chính thống gần đây nào cũng là một ví dụ tốt để tham khảo. Listing 19-9 trình bày danh sách default rule trong một snapshot gần đây của Moblin distribution.

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

Hãy chú ý cách nhóm các rules file. Tương tự System V initscript, các số được dùng để ấn định thứ tự đọc. Những rules file được xử lý theo đúng thứ tự trong Listing 19-9. Một vài file trong số này đáng để xem kỹ.

Rules file `50-udev-default.rules` là một phần của udev package (từ một udev snapshot hiện tại) và được nhóm phát triển udev cung cấp làm ví dụ. Thực tế, phiên bản Moblin rất gần với phiên bản mặc định này trong udev package. Rules file thiết lập các giá trị mặc định cho nhiều Linux device thông dụng, bao gồm character device như tty, pty, serial device, các memory device như `/dev/null` và `/dev/zero`, cùng nhiều device khác thường gặp trên bất kỳ Linux system nào.

Các rules file khác cung cấp attribute và action distribution-specific cho những device class cụ thể. Trong bộ rules file của Moblin, chúng bao gồm ALSA rule cho sound device, các định nghĩa rule CD-ROM, cùng nhiều tập rule được thiết kế để cung cấp persistent device name cho một số nhóm device. Bạn có thể tìm thêm rất nhiều chi tiết trong tài liệu udev được tham chiếu ở cuối chương.

Một nhận xét khác về udev rule cũng đáng đề cập. Trừ khi dùng cú pháp cụ thể để tạo hành vi khác, các udev rule có tính tích lũy. Nói cách khác, một device có thể có nhiều rule trải trên nhiều rules file, mỗi rule khớp với các attribute khác nhau. Mọi thao tác được những rule đó định nghĩa đều được áp dụng cho device hoặc subsystem tương ứng. Ví dụ, bạn có thể tách các rule đặt tên device khỏi những rule áp dụng permission. Các Ubuntu distribution gần đây có ví dụ về ý tưởng này trong những rules file mang tên `20- names.rules` và `40-basic-permissions.rules`.

Xem `20-names.rules` và `40-basic-permissions.rules` sẽ dễ thấy tính “xếp chồng” của udev rule. Một device có thể khớp nhiều rule; tập hợp các rule đó xác định những thao tác được thực hiện cho subsystem hoặc device cụ thể. Ví dụ, hãy xét các sound device thông dụng như `controlC0`, tức sound card interface. Một rule trong `20-names.rules` có thể như sau:

```
KERNEL==”controlC[0-9]*”, NAME=”snd/%k”
```

Rule này chỉ đơn giản khớp với các kernel device có tên `controlC0`, `controlC1`, v.v. và gán device name `snd/%k`. `%k` chỉ tên thực mà kernel truyền cho udev, trong trường hợp này là `controlC`. Phần `snd/` được thêm trước device name yêu cầu udev tạo device node đó dưới `/dev`, trong subdirectory có tên `snd`. Vì vậy, bạn có device node `/dev/snd/controlC0` cho sound card interface đầu tiên.

Rule tiếp theo từ `40-permissions.rules` có thể như sau:

```
KERNEL=”controlC[0-9]*”,  MODE=”0666”
```

Khi được udev quét, về cơ bản rule này được nối thêm vào rule trước đó và khiến device node được tạo với quyền đọc/ghi cho tất cả đối tượng (user, group và other).

Theo cách này, các Linux distribution có thể tạo những tập rule rõ ràng, tách biệt chức năng để dễ bảo trì. Trong phần thảo luận này, bạn có thể thấy các rule phân loại tên device (chẳng hạn vào những subdirectory dưới `/dev`) được duy trì trong một rules file, còn các rule đặt permission cho những device đó được duy trì trong file riêng chỉ xử lý permission. Cách tổ chức này rất rõ ràng và dễ bảo trì.

Để trở thành chuyên gia, bạn nên nghiên cứu tài liệu rất hay “Writing udev Rules” của Daniel Drake, được tham chiếu ở cuối chương.

Một lưu ý cuối về rule: udev hoạt động theo cơ chế event-driven. Nó không làm gì trừ khi một event được kích hoạt. Ví dụ, dù udev theo dõi rules directory bằng inotify và quét lại các rule nếu bạn sửa một rules file, vẫn không có thao tác nào theo rule vừa sửa được thực hiện cho đến khi một device dùng rule đó được tháo ra rồi cắm lại.[^6]

### 19.4.3 Thiết lập hệ thống ban đầu cho udev

udev là một user space process. Vì vậy, nó không được chạy cho đến khi kernel hoàn tất boot process và mount một root file system. Đại đa số Linux system, dù embedded hay không, chạy init như process đầu tiên, như đã mô tả trong Chương 6, “Khởi tạo user space”. Trong hệ thống mà udev phụ trách tạo device node, chúng ta phải cung cấp một cơ chế để init và các child process truy cập những device thường cần nhất trước khi udev chạy. Chúng thường bao gồm console device, các input/output device như `stdin`, `stdout` và `stderr`, cùng một vài device khác.

Phương pháp đơn giản và phổ biến nhất cho các embedded system nhỏ là tạo sẵn một vài static device node trong `/dev`, rồi mount tmpfs phủ lên `/dev` để udev sử dụng trước khi khởi chạy udev. Listing 19-10 là ví dụ về startup script được đơn giản hóa cho hệ thống udev-based.

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

Script này cung cấp chức năng tối thiểu cần thiết để cấu hình hệ thống tạo device node động bằng udev. Việc đầu tiên nó thực hiện là mount tmpfs (một file system tạm thời RAM-based sử dụng virtual memory) phủ lên `/dev`. Khi lệnh `mount` thành công, nội dung trước đó của `/dev` không còn xuất hiện và `/dev` hiển thị như một directory trống.

Thao tác tiếp theo là sao chép một tập static device node nhỏ để thay thế những device cần cho boot, như console, standard input/output và một vài device khác. Listing 19-11 là ví dụ về một tập như vậy, được đặt trong `/lib/udev/devices` khi tạo file system. Vị trí ban đầu tùy bạn lựa chọn; nó không đặc biệt quan trọng.

Thao tác cuối của script trong Listing 19-10 là bảo đảm không có hotplug agent nào được chỉ định trong `/proc`. Kernel gửi uevent đến user space agent này nếu nó được chỉ định. Tuy nhiên, chúng ta muốn udev nhận các thông điệp đó qua netlink socket như đã mô tả, nên chúng ta đặt entry này thành rỗng.

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

Giờ đây mọi thứ đã được thiết lập, đã đến lúc khởi chạy daemon udevd. Bạn có thể thấy bước này ở dòng gọi `/sbin/udevd` trong Listing 19-10. Nếu đã nghiên cứu startup script đó, bạn có thể tự hỏi những thao tác cuối có mục đích gì.

### 19.4.3.1 Xử lý coldplug

Trong kernel boot process, các subsystem khác nhau được khởi tạo, nhiều device được phát hiện và đăng ký cùng các entry tương ứng trong `/sys`. Trên BeagleBoard được dùng cho các ví dụ ở chương này, gần 200 device được báo trong `/sys`; thông thường chúng sẽ được udev xử lý để có thể tạo device node hoặc load device driver. Vấn đề là udev chỉ được khởi chạy một thời gian sau khi `init` chạy, nên gần 200 device đó vẫn chưa được udev xử lý. Đây là lý do udev có chức năng trigger.

Hãy xem hai shell command cuối trong script ở Listing 19-10. `udevdadm` `trigger` khiến udev xử lý tất cả entry trong `/sys` bằng cách phát lại các kernel uevent và xử lý chúng theo cách thông thường. Để minh họa quy mô xử lý này mà không chiếm thêm 12 trang sách, chúng ta sẽ trình bày số device trong `/dev` trước và sau trigger event bằng lệnh sau:

```
root@beagle:~# find /dev -type c -o -type b -o -type l | wc -l
6
```

Lưu ý rằng ba device node tìm được bằng lệnh `find` này khớp chính xác với nội dung Listing 19-11. Tập static device ban đầu có đúng ba character device và ba symbolic link, tổng cộng sáu entry. Hai entry cuối trong Listing 19-11 là các directory mà chúng ta đã lọc bỏ bằng lệnh `find` vừa trình bày.

Sau khi chạy lệnh `udevadm trigger` trong startup script mẫu ở Listing 19-10, khiến udev phát lại tất cả kernel uevent, chúng ta thấy hơn 100 device mới và hơn 400 symbolic link đã được tạo. Chuỗi lệnh sau minh họa điều đó:

```
root@beagle:~# udevadm trigger
root@beagle:~# udevadm settle
root@beagle:~# find /dev -type c -o -type b | wc -l
135
root@beagle:~# find /dev -type c -o -type b -o -type l | wc -l
410
```

Giờ đây udev đã xử lý tất cả device mà kernel tìm thấy trong lúc boot, chúng ta có thêm 132 device node mới, tổng cộng 135 node (bao gồm ba node ban đầu trong tập static device). Tính cả symbolic link, hiện có tổng cộng 410 file trong `/dev` có thể tham chiếu đến một device. Đây là cách udev “post-processes” những device mà kernel tạo trong lúc boot. Từ thời điểm này, chừng nào daemon `udevd` còn chạy, kernel sẽ báo cho udev về mọi device được thêm hoặc tháo ra, và udev xử lý chúng theo tập rule của nó.

## 19.5 Load platform device driver

Platform device driver có thể dễ dàng được load động bằng udev. Bạn có thể cài một default rule có trong udev package lên embedded system. Rule này sẽ giống rule đầu tiên trong Listing 19-4. Nó được trình bày lại ở đây để tiện tham khảo:

```
DRIVER!=”?*”, ENV{MODALIAS}==”?*”, RUN{ignore_error}+=”/sbin/modprobe
-b $env{MODALIAS}”
```

Rule này yêu cầu chạy `modprobe`, truyền giá trị MODALIAS cho `modprobe` khi đáp ứng các điều kiện sau: `MODALIAS` được driver đặt, còn environment variable `DRIVER` chưa được đặt. Miễn là driver chứa macro `MODULE_ALIAS` có định dạng thích hợp, giá trị này được truyền đến `modprobe` để đối chiếu với thông tin trong file `modules.alias` do `depmod` tạo. Cơ chế này được giải thích chi tiết ở Mục 19.4.1.

Ví dụ, hãy xem platform driver cho Inventra dual-role USB controller trên OMAP3530 của BeagleBoard. Listing 19-12 trình bày một vài dòng từ USB host controller driver này trong một Linux kernel gần đây. Dòng cuối chứa cơ chế tạo thành một entry trong file `modules.alias`, được `modprobe` dùng để chọn driver cần load.

LISTING 19-12 Một phần `musb_hdrc.c`

```
#define MUSB_DRIVER_NAME “musb_hdrc”
const char musb_driver_name[] = MUSB_DRIVER_NAME;

MODULE_DESCRIPTION(DRIVER_INFO);
MODULE_AUTHOR(DRIVER_AUTHOR);
MODULE_LICENSE(“GPL”);
MODULE_ALIAS(“platform:” MUSB_DRIVER_NAME);
```

Macro `MODULE_ALIAS` thực chất tạo ra một char string (`const char`) được đặt trong một section đặc biệt của device driver (module) object file. String này tương tự environment variable và có dạng `alias=”string”`. Section đặc biệt này có tên `.modinfo`, chứa các attribute mô tả những khía cạnh khác nhau của driver. Bạn có thể xem section header đó bằng phiên bản cross của `readelf`. Hãy nhớ rằng chúng ta đã trình bày chi tiết `readelf` trong Chương 13, “Công cụ phát triển”. Có thể xem section `.modinfo` bằng lệnh sau:

```
$ arm_v7_vfp_le-readelf -e drivers/usb/musb/musb_hdrc.ko | grep modinfo
  [11] .modinfo          PROGBITS        00000000 0063dc 0001ec 00   A  0   0  4
```

Để xem nội dung human-readable của section `.modinfo`, hãy dùng lệnh `modinfo` từ package module-init-tools:

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

Hãy chú ý module alias `platform:musb_hdrc`. Khi đã có đầy đủ mọi thành phần, bạn có thể load device driver thủ công bằng modalias string, theo đúng cách string đó sẽ được udev truyền:

```
# modprobe platform:musb_hdrc
```

Tất nhiên, nếu udev được cấu hình đúng với một rule tương tự rule trong Listing 19-4, nó sẽ load module này cho bạn bằng modalias string. Module được load sau lời gọi `udevadm trigger` trong udev startup script mẫu ở Listing 19-10. Toàn bộ cơ chế chỉ có vậy!

## 19.6 Tùy chỉnh hành vi udev

Những gì bạn có thể làm với udev có lẽ chỉ bị giới hạn bởi trí tưởng tượng của chính mình. Chẳng hạn, bạn có thể chạy chương trình riêng khi device được thêm hoặc tháo ra. Ví dụ, một rule như sau có thể được dùng để bắt đầu quá trình nâng cấp software khi ai đó cắm USB storage device vào thiết bị embedded Linux của bạn:

```
ACTION=”add”, KERNEL==”sd[a-d][0-9]”, RUN+=”/bin/myloader”
```

Chương trình `/bin/myloader` của bạn được trao một bản sao udev environment liên quan đến device này. Sau đó, chương trình có thể xác thực nội dung của device vừa cắm và bắt đầu bất kỳ thao tác cần thiết nào. Đây là một cách tự động hóa quá trình cài đặt software image mới trên hệ thống embedded Linux.

Nếu chọn cách tiếp cận này, bạn nên cân nhắc fork và detach để udev parent process có thể hoàn tất rồi return. Thao tác này tránh những bất ngờ khó chịu nếu udev, hiện tại hoặc trong phiên bản tương lai, quyết định kill các child process mà nó cho là mất quá nhiều thời gian để hoàn tất. Cũng cần xét đến execution environment đặc biệt này. Khi chương trình chạy, nó kế thừa một execution environment tối thiểu do udev cung cấp, có thể không đủ cho nhu cầu của bạn. Bạn có thể cần tạo environment riêng để chương trình handler đặc biệt hoàn thành các tác vụ.

### 19.6.1 Ví dụ tùy chỉnh: USB automounting

Listing 19-13 minh họa một tập rule có thể tự động mount USB Flash drive được cắm vào hệ thống embedded Linux.

LISTING 19-13 Rule USB automounting

```
# Handle all usb storage devices from sda<n> to sdd<n>
ACTION==”add”, KERNEL==”sd[a-d][0-9]”, SYMLINK+=”usbdisk%n”, NAME=”%k”
ACTION==”add”, KERNEL==”sd[a-d][0-9]”, RUN+=”/bin/mkdir -p /media/usbdisk%n”
ACTION==”add”, KERNEL==”sd[a-d][0-9]”, RUN+=”/bin/mount /dev/%k /media/usbdisk%n”
ACTION==”remove”, KERNEL==”sd[a-d][0-9]”, RUN+=”/bin/umount /media/usbdisk%n”
ACTION==”remove”, KERNEL==”sd[a-d][0-9]”, RUN+=”/bin/rmdir /media/usbdisk%n”
```

Khi phát hiện device, udev tạo một symbolic link trỏ đến device thực, có tên `usbdiskn`, trong đó `n` là device number. Ví dụ, xét `usbdisk0`: sau khi udev xử lý xong, bạn sẽ có symbolic link mang tên `/dev/usbdisk0` trỏ đến device thực. Tiếp theo, directive `RUN` tạo một directory cùng tên dưới `/media`. Lưu ý rằng vì option `-p` được truyền cho `mkdir`, mọi entry trên path mới này đều được tạo nếu chưa tồn tại. Thao tác cuối đối với `add` là mount device vừa tìm thấy vào mount point mới được tạo trong `/media`. Khi device được tháo ra sau đó, `umount` được thực thi và directory bị xóa.

Cắm USB Flash drive vào BeagleBoard với các rule trên được đặt trong `/lib/udev/rules/99-usb-automount.rules` sẽ cho kết quả sau:

```
# ls /media
usbdisk1
# ls /media/usbdisk1/
u-boot.bin         uImage-beagle
```

## 19.7 Đặt tên device bền vững

Persistent device naming được triển khai mặc định trong udev, theo một phương án ban đầu do Hannes Reinecke đề xuất. Các persistent naming rule nằm trong những rules file có chứa string `“persistent”`. Hãy khảo sát cách toàn bộ cơ chế này hoạt động.

Nếu xem directory `/dev` trên hệ thống udev-based, bạn có thể thấy cơ chế này hoạt động với các device disk-based.

Listing 19-14 trình bày các file trong directory `/dev/disk` trên BeagleBoard của tôi sau khi hai USB Flash drive được cắm vào một hub nối với USB port của BeagleBoard.

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

Output của `ls -l` được rút ngắn ở đây để tránh các dữ liệu không cần thiết gây rối mắt. Có bảy symlink trong directory mang tên `by-id` này. Mỗi symlink trỏ về một device node do udev tạo cho device tương ứng. Từ trên xuống, chúng ta thấy một SD card, một generic USB Flash drive và một Cruzer Mini USB Flash drive. Trong mỗi trường hợp, entry đầu là disk device, sau đó từng partition tìm thấy trên device được liệt kê. Bạn có thể thấy hai partition trên SD card (`mmcblk0` là disk device, còn `mmcblk0p1` và `mmcblk0p2` là các partition), và tương tự, mỗi USB Flash drive có một partition.

Symlink chính là persistent name. Giờ bạn có thể tháo các USB Flash drive rồi cắm lại vào những hub port khác. Thông qua helper utility `usb_id`, udev gán lại cùng những tên (symlink) cho device và trỏ chúng đến đúng device node; device node đó không nhất thiết là cùng raw device node như lần cắm đầu tiên.

### 19.7.1 Udev helper utility

Những unique ID string trong Listing 19-14 được tạo bằng cách đọc raw device tương ứng hoặc truy vấn attribute `data` trong `/sys`. Công việc này được thực hiện bởi một tập nhỏ các helper utility trong directory `extras` của udev git tree. Có một số tiện ích như `scsi_id`, `cdrom_id`, `path_id` và `volume_id`. Hãy xem subdirectory `extras` trong udev git tree để có đầy đủ danh sách. Chúng ta sẽ xem tiện ích `usb_id` để hiểu cách chúng hoạt động.

Rule tạo persistent name (unique ID) đến từ file `60-persistent-storage.rules` trong udev source tree:

```
KERNEL==”sd*[!0-9]|sr*”, ENV{ID_SERIAL}!=”?*”, SUBSYSTEMS==”usb”,
IMPORT{program}=”usb_id --export %p”
```

Rule này nói rằng đối với mọi kernel device có `ACTION` là `add` hoặc `change`,[^7] với kernel device name là sd\* hoặc sr\* và không chứa device number (tức chính base disk device, không phải partition), hãy gọi chương trình `usb_id` và thu output từ `stdout` thành các environment variable. `%p` là một udev string substitution operator, chỉ DEVPATH, tức device path trong `/sys`. Hãy xem kết quả khi thực thi thủ công trên console:

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

Khi lệnh `usb_id` này được thực thi như một phần của rule, output được import thành một phần environment cho udev event cụ thể đó. Ở phần sau trong cùng rules file (`60-persistent-storage.rules`), bạn sẽ thấy rule sau:

```
KERNEL==”sd*|sr*”, ENV{DEVTYPE}==”disk”, ENV{ID_SERIAL}==”?*”,
SYMLINK+=”disk/by-id/$env{ID_BUS}-$env{ID_SERIAL}”
```

Rule này thực sự tạo ra persistent name do `usb_id` sinh ra. Rule nói rằng đối với một kernel uevent có `ACTION` là `add` hoặc `change`, kernel device name là sd\* hoặc sr\* (một disk device SCSI-type), udev environment variable `DEVTYPE` được đặt là `disk`, và udev environment variable `ID_SERIAL` là một string non-null, hãy tạo symlink bằng cách ghép `ID_BUS` với `ID_SERIAL`, nối bằng dấu gạch ngang (-). Symlink kết quả chính là symlink trong Listing 19-14.

Những tiện ích này không nhất thiết được thiết kế cho người dùng cuối. Dùng lệnh `udevadm info` để lấy thông tin cần cho persistent device name dễ hơn rất nhiều. Listing 19-15 có ví dụ về output của `udevadm info` cho cùng device đang được thảo luận ở đây, tức Cruzer Mini USB Flash drive. Tiện ích này dễ dùng hơn và được thiết kế cho system admin hoặc developer. Chúng ta truyền cho nó device name từ `/dev`, trong ví dụ này là partition đầu tiên của device sda.

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

Vậy chúng ta có thể sử dụng dữ liệu này như thế nào? Trước đó, chúng ta đã thấy một phương pháp mount USB Flash disk bằng udev rule. Chúng ta có thể dùng unique identifier do `udevadm info` tạo ra ở đây để xây dựng các rule trong một udev rules file. Lưu ý rằng có thể dùng bất kỳ attribute nào trong số này nếu hợp lý.

Cách phổ biến nhất để dùng infrastructure này là cung cấp tên human-readable hoặc dễ nhận biết cho device theo một cách ổn định lâu dài. Ví dụ, hãy xét rule sau:

```
ACTION==”add”, ENV{ID_SERIAL}==”SanDisk_Cruzer_Mini_SNDK8BA6040286306704-0:0”,
SYMLINK+=”cruzer”
```

Rule này khiến một symlink mới được thêm vào directory `/dev`, trỏ đến device name mà kernel và udev đã tạo cho device này, bất kể tên đó là gì:

```
# ls -l /dev/cruzer
lrwxrwxrwx  1 root  root  4 Jan  1 22:12 /dev/cruzer -> sda1
```

Quay lại các USB automounting rule trong Listing 19-13, chúng ta có thể tạo rule luôn mount Cruzer Mini USB Flash disk cụ thể này vào một mount point tự chọn, bất kể thứ tự cắm hay vị trí cuối cùng của nó trong USB device hierarchy:

```
ACTION==”add”, ENV{ID_SERIAL}==”SanDisk_Cruzer_Mini_SNDK8BA6040286306704-0:0”,
RUN+=”/bin/mkdir -p /media/cruzer”
ACTION==”add”, ENV{ID_SERIAL}==”SanDisk_Cruzer_Mini_SNDK8BA6040286306704-0:0”,
RUN+=”/bin/mount /dev/%k /media/cruzer”
```

Khi dùng những rule này, trong ví dụ được cài vào file có tên `99-usb-automount.` `rules`, mỗi lần cắm Cruzer Mini USB Flash drive (bất kể thứ tự hay hub port), nó luôn được mount và nội dung có sẵn tại `/media/cruzer`. Đó là sức mạnh của udev và persistent device naming!

## 19.8 Dùng udev với busybox

Hãy xem lại rule đầu tiên trong Listing 19-4. Rule này khiến `modprobe` được gọi với flag `-b`. Flag đó được dùng để kiểm tra modules blacklist nếu có. Hiện tại, điều này không tương thích với implementation `modprobe` của busybox.[^8] Khi `modprobe` được chạy mà chưa có điều chỉnh, bạn sẽ không thấy driver nào được load dù đó là thao tác mong đợi. Lỗi gọi `modprobe` không thể hiện rõ vì udev daemon là bên nhận các thông điệp trên stdout và stderr khi thực thi chương trình trong context của nó. Vì vậy, các thông báo lỗi không được hiển thị trên console.

Cách khắc phục đơn giản nhất là dùng phiên bản đầy đủ của `modprobe`, tức đưa package module-init-tools vào embedded system. Package này cung cấp các phiên bản đầy đủ của `modprobe`, `lsmod` và `insmod`. Bạn cần compile busybox với hỗ trợ `depmod` bị vô hiệu hóa hoặc ít nhất xóa các busybox symbolic link trỏ những tiện ích module-init-tools trở lại busybox. Tùy cách cấu hình busybox, bạn có thể có link hoặc scriptlet, tức các script wrapper đơn giản gọi busybox cho từng chức năng được hỗ trợ. Xem Chương 11, “BusyBox”, để biết thêm chi tiết về các installation option này.

### 19.8.1 busybox mdev

busybox có các phiên bản rất nhỏ của nhiều tiện ích Linux phổ biến và hữu ích, vậy tại sao không có một udev implementation? Nói đơn giản, mdev là câu trả lời của busybox cho udev. mdev có nhiệm vụ tạo device node động trong `/dev` khi phát hiện device. Vì là một implementation được đơn giản hóa, nó không có sự phong phú và linh hoạt của udev package stand-alone.

Giống udev, busybox mdev yêu cầu hỗ trợ sysfs trong kernel, đồng thời phải được hotplug-enabled. Khó có thể hình dung một embedded Linux system hiện đại mà không bật những kernel subsystem này![^9]

mdev dùng hotplug infrastructure cũ để nhận kernel uevent. Hãy nhớ trong Listing 19-10 rằng với udev, chúng ta bảo đảm file `/proc` chứa tên hotplug agent được đặt rỗng (vô hiệu hóa) để kernel không gửi uevent cho agent đó. busybox mdev yêu cầu chính nó là hotplug agent, được gọi qua `/bin/mdev`. Vì vậy, công việc đầu tiên trong startup script là đặt file `/proc` này trỏ đến mdev:

```
echo “/bin/mdev” > /proc/sys/kernel/hotplug
```

Tất nhiên, thao tác này phải được thực hiện sau khi mount `/proc` trong startup script. Một yêu cầu ít rõ ràng hơn là `/sys` cũng phải được mount. Sau khi hoàn tất các bước này, bạn khởi chạy tiện ích. Listing 19-16 là một startup script mẫu dùng busybox mdev.

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

Hành vi mặc định của mdev chỉ là tạo một device node trong `/dev` với cùng kernel device name được truyền trong uevent. Điều này khá hữu ích nếu bạn không cần sự linh hoạt của udev stand-alone. Nó thường tạo ra một device name well-known cho device tương ứng.

Trong Listing 19-16, flag `-s` được truyền khi gọi mdev tương tự thao tác `udevadm trigger`. Nó khiến mdev quét `/sys` và tạo device node cho các device tìm thấy ở đó. Theo cách này, device node được tạo cho các device ban đầu mà kernel đã phát hiện trước khi `init` được chạy (hoặc trong trường hợp busybox là `busybox init`).

Khi boot một hệ thống được cấu hình bằng busybox, đã loại bỏ udev và chưa khởi chạy mdev, chúng ta có kết quả sau:

```
# find /dev -type b -o -type c | wc -l
3
```

Thực thi `/bin/mdev` (một busybox link hoặc scriptlet trỏ đến chính `/bin/busybox`) cho kết quả sau:

```
# find /dev -type b -o -type c | wc -l
130
```

### 19.8.2 Cấu hình mdev

busybox mdev có thể được tùy chỉnh bằng một configuration file không bắt buộc có tên `/etc/mdev.` `conf`. File này chủ yếu được dùng để tùy chỉnh permission của các device node do mdev tạo. Theo mặc định, mdev tạo device node với uid:gid là root:root và permission 0660. Các entry trong `/etc/mdev.conf` đơn giản và có dạng sau:

```
device uid:gid octal permissions
```

`device` là một regex đơn giản của device name, tương tự cách chỉ định device name của udev. Những field còn lại đều self-explanatory, với lưu ý rằng `uid` và `gid` là giá trị số, không phải tên user/group ở dạng ASCII.

Sau đây là một số ví dụ. Rule mdev dưới đây đổi default permission thành 777 và giữ nguyên default user:group là root:root. Bạn cũng có thể dùng cách này để thay đổi default user và/hoặc group:

```
.* 0:0 777
```

Bạn cũng có thể đổi tên và di chuyển device node bằng `/etc/mdev.conf`. Rule này chuyển mọi mouse device vào một subdirectory có tên `input` trong dev:

```
mouse* 0:0 660 input/
```

Bạn có thể tìm hiểu thêm về busybox mdev trong các documentation file thuộc busybox source tree.

## 19.9 Tổng kết

Chương này trình bày chi tiết về udev, một tiện ích Linux mang lại rất nhiều giá trị cho bất kỳ Linux distribution nào. Sử dụng udev đúng cách giúp tạo ra một hệ thống rất user-friendly, có khả năng phát hiện và cấu hình device mà không cần con người can thiệp.

- Chúng ta bắt đầu chương bằng việc giới thiệu udev và mô tả mục đích của nó.

- Hành vi mặc định của udev được trình bày làm nền tảng để hiểu cách tùy chỉnh nó.

- Chúng ta khảo sát một thiết lập hệ thống điển hình để minh họa những điểm phức tạp khi sử dụng udev.

- Việc tùy chỉnh udev được thảo luận để người thiết kế hệ thống và distribution maintainer có thể xây dựng hệ thống phù hợp với những use case cụ thể.

- Với người dùng busybox, chúng ta khảo sát tiện ích busybox mdev, một lựa chọn thay thế udev có dung lượng nhỏ.

- Chúng ta kết thúc bằng một số ví dụ cấu hình busybox mdev.

### 19.9.1 Gợi ý đọc thêm

“Udev: A Userspace Implementation of devfs” Greg Kroah-Hartman www.kroah.com/linux/talks/ols\_2003\_udev\_paper/Reprint-Kroah-Hartman-OLS2003.pdf

Linux Allocated Devices Torben Mathiasen, maintainer www.lanana.org/docs/device-list/devices.txt

Linux Device Drivers, 3rd Edition (especially Chapter 14, “The Linux Device Model”) Jonathan Corbet, Alessandro Rubini, and Greg Kroah-Hartman O’Reilly, 2005

“Writing udev Rules” Daniel Drake http://reactivated.net/writing\_udev\_rules.html

Persistent Device Names in Linux 2.6.x Hannes Reinecke July 12, 2004

[^1]: Bạn có thể tìm hiểu thêm về netlink socket tại http://en.wikipedia.org/wiki/Netlink.

[^2]: Đây chính là tên mà một device node biểu diễn mouse (hay bất kỳ device nào khác) sẽ mang nếu bạn cắm nó trực tiếp vào hub four-port này.

[^3]: Điều này giả định bạn đang làm việc với hệ thống được cấu hình để load device driver động.

[^4]: Tất nhiên, trong môi trường production, chúng ta có thể áp dụng tên và cách tổ chức hợp lý hơn cho các rules file.

[^5]: Cách đánh số này đã được trình bày trong Chương 18.

[^6]: Bạn có thể kích hoạt thủ công bằng `udevadm trigger`, khiến thay đổi của mình được áp dụng.

[^7]: Hãy xem file `60-persistent-storage.rules` để biết chính xác cách thực hiện. Mệnh đề `add|change` nằm ở đầu rules file trong một pseudo statement `if`, bỏ qua toàn bộ rules file nếu `ACTION` không phải `add` hoặc `change`.

[^8]: Test trên busybox v1.41.1.

[^9]: Được rồi, tôi có thể hình dung một hệ thống cực kỳ tối giản với hotplug và sysfs bị vô hiệu hóa, nhưng hệ thống đó sẽ rất chuyên biệt và hạn chế về chức năng.
