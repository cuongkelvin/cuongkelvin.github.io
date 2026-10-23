# Chương 9. Khởi động - chương trình init

Tôi đã xem cách kernel boot đến khi khởi chạy chương trình đầu tiên, `init`, trong Chương 4, Port và cấu hình kernel; trong Chương 5, Xây dựng root filesystem, và Chương 6, Chọn build system, tôi xem cách tạo root filesystem với độ phức tạp khác nhau, tất cả đều có chương trình `init`. Giờ là lúc xem `init` chi tiết hơn và tìm hiểu vì sao nó quan trọng với phần còn lại của hệ thống.

Có nhiều cách triển khai `init`. Tôi sẽ mô tả ba cách chính trong chương này: BusyBox `init`, System V `init` và `systemd`. Với mỗi cách, tôi trình bày tổng quan cách hoạt động và loại hệ thống phù hợp nhất. Một phần công việc là cân bằng trade-off giữa độ phức tạp và tính linh hoạt.

## Sau khi kernel boot

Trong Chương 4, Port và cấu hình kernel, chúng ta đã thấy code bootstrap kernel tìm root filesystem, là `initramfs` hoặc filesystem chỉ định bằng `root=` trên kernel command line, rồi thực thi một chương trình, mặc định là `/init` với `initramfs` và `/sbin/init` với filesystem thông thường. Chương trình `init` có root privilege, và vì là process đầu tiên chạy, nó có process ID (`PID`) bằng 1. Nếu vì lý do nào đó `init` không khởi động được, kernel sẽ panic. Chương trình `init` là tổ tiên mọi process khác, như thể hiện qua lệnh `pstree`, thuộc package `psmisc` trong phần lớn distribution:

```
# pstree -gn

init(1)-+-syslogd(63)
        |-klogd(66)
        |-dropbear(99)
        `-sh(100)---pstree(109)
```

Nhiệm vụ của `init` là tiếp quản hệ thống và đưa nó vào hoạt động. Có thể đơn giản như shell command chạy shell script – có ví dụ ở đầu Chương 5, Xây dựng root filesystem – nhưng phần lớn trường hợp, bạn dùng daemon `init` chuyên dụng. Các nhiệm vụ cần thực hiện gồm:

- Khi boot, khởi chạy daemon, cấu hình tham số hệ thống và các việc khác cần để hệ thống hoạt động.

- Tùy chọn, khởi chạy daemon như `getty` trên terminal cho phép login shell.

- Nhận nuôi process trở thành orphan do parent trực tiếp kết thúc và không còn process nào khác trong thread group.

- Phản ứng khi child trực tiếp của `init` kết thúc bằng cách bắt signal `SIGCHLD` và thu return value để ngăn chúng thành zombie process. Tôi sẽ nói thêm về zombie trong Chương 10, Tìm hiểu process và thread.

- Tùy chọn, khởi động lại daemon đã kết thúc.

- Xử lý shutdown hệ thống.

Nói cách khác, `init` quản lý vòng đời hệ thống, từ boot đến shutdown. Quan điểm hiện tại là `init` ở vị trí thích hợp để xử lý sự kiện runtime khác như hardware mới và nạp, gỡ module. Đó là điều `systemd` thực hiện.

## Giới thiệu các chương trình init

Ba chương trình `init` thường gặp nhất trên thiết bị embedded là BusyBox `init`, System V `init` và `systemd`. Buildroot có tùy chọn build cả ba, mặc định là BusyBox `init`. Yocto Project cho chọn System V `init` hoặc `systemd`, mặc định là System `V init`. Bảng sau đưa một số số liệu so sánh:

|  | BusyBox init | System V init | systemd |
|---|---|---|---|
| Độ phức tạp | Thấp | Trung bình | Cao |
| Tốc độ Boot-up | Nhanh | Chậm | Trung bình |
| Shell cần có | ash | ash hoặc bash | Không |
| Số executable | 0 | 4 | 50(\*) |
| libc | Bất kỳ | Bất kỳ | glibc |
| Kích thước (MiB) | 0 | 0\.1 | 34(\*) |

(\*) Dựa trên cấu hình Buildroot của `system`.

Nhìn chung, tính linh hoạt và độ phức tạp tăng khi đi từ BusyBox `init` tới `systemd`.

## BusyBox init

BusyBox có chương trình `init` tối thiểu dùng file cấu hình `/etc/inittab` để định nghĩa rule khởi chạy chương trình khi boot và dừng khi shutdown. Thông thường, công việc thực tế do shell script đảm nhận, theo quy ước đặt trong thư mục `/etc/init.d`.

`init` bắt đầu bằng đọc file cấu hình `/etc/inittab`. File chứa danh sách chương trình cần chạy, mỗi dòng một chương trình, với định dạng:

`<id>::<action>:<program>`

Vai trò các tham số như sau:

- `id`: Controlling terminal cho lệnh

- `action`: Điều kiện chạy lệnh, như đoạn sau

- `program`: Chương trình cần chạy

Các action gồm:

- `sysinit`: Chạy chương trình khi `init` bắt đầu, trước mọi loại action khác.

- `respawn`: Chạy chương trình và khởi động lại nếu kết thúc. Dùng để chạy chương trình như daemon.

- `askfirst`: Giống `respawn`, nhưng in thông báo Please press Enter to activate this console ra console và chạy chương trình sau khi nhấn Enter. Dùng để khởi động interactive shell trên terminal mà không hỏi user name hay password.

- `once`: Chạy chương trình một lần, không thử khởi động lại nếu kết thúc.

- `wait`: Chạy chương trình và chờ hoàn tất.

- `restart`: Chạy chương trình khi `init` nhận signal `SIGHUP`, cho biết cần nạp lại file `inittab`.

- `ctrlaltdel`: Chạy chương trình khi `init` nhận signal `SIGINT`, thường do nhấn Ctrl + Alt + Del trên console.

- `shutdown`: Chạy chương trình khi `init` shutdown.

Đây là ví dụ nhỏ mount `proc` và `sysfs`, chạy shell trên serial interface:

```
null::sysinit:/bin/mount -t proc proc /proc
null::sysinit:/bin/mount -t sysfs sysfs /sys
console::askfirst:-/bin/sh
```

Với dự án đơn giản cần khởi chạy ít daemon và có thể thêm login shell trên serial terminal, dễ viết script thủ công; cách này phù hợp nếu tạo embedded Linux RYO (roll your own). Tuy nhiên, script `init` hand-written nhanh chóng khó bảo trì khi số thứ cần cấu hình tăng. Chúng thường không có tính module cao, nên cần cập nhật mỗi khi thêm thành phần mới.

### Script init của Buildroot

Buildroot sử dụng hiệu quả BusyBox `init` từ nhiều năm. Buildroot có hai script trong `/etc/init.d` tên `rcS` và `rcK`. Script đầu chạy lúc boot-up, duyệt mọi script bắt đầu bằng chữ hoa `S` theo sau bởi hai chữ số, chạy theo thứ tự số. Đây là start script. Script `rcK` chạy khi shutdown, duyệt mọi script bắt đầu bằng chữ hoa `K` theo sau bởi hai chữ số và chạy theo thứ tự số. Đây là kill script.

Với cơ chế này, Buildroot package dễ cung cấp start và kill script riêng, dùng số hai chữ số để quy định thứ tự chạy, nhờ đó hệ thống có thể mở rộng. Nếu dùng Buildroot, điều này diễn ra trong suốt. Nếu không, có thể dùng nó làm mẫu viết script BusyBox `init` riêng.

## System V init

Chương trình `init` này lấy cảm hứng từ UNIX System V, nên có nguồn gốc giữa những năm 1980. Phiên bản thường gặp nhất trong Linux distribution do Miquel van Smoorenburg viết ban đầu. Đến gần đây, nó vẫn được coi là cách boot Linux, tất nhiên gồm embedded system; BusyBox `init` là phiên bản rút gọn của System V `init`.

So với BusyBox `init`, System V `init` có hai ưu điểm. Thứ nhất, boot script dùng định dạng well-known có tính module, dễ thêm package lúc build hoặc runtime. Thứ hai, có khái niệm runlevel, cho phép khởi chạy hoặc dừng tập chương trình cùng lúc bằng chuyển runlevel.

Có 8 runlevel đánh số từ 0 đến 6, cộng S:

- S: Single user mode

- 0: Halt hệ thống

- 1 đến 5: Dùng chung

- 6: Reboot hệ thống

Bạn có thể sử dụng các level 1 đến 5 tùy ý. Trên các Linux distribution cho desktop, chúng được gán theo quy ước sau:

- 1: Single user

- 2: Multi-user không có cấu hình network

- 3: Multi-user có cấu hình network

- 4: Không dùng

- 5: Multi-user có graphical login

Chương trình `init` khởi động `runlevel` mặc định nêu ở dòng `initdefault` trong `/etc/inittab`. Có thể đổi runlevel tại runtime bằng lệnh `telinit [runlevel]`, gửi thông điệp đến `init`. Có thể tìm runlevel hiện tại và trước đó bằng lệnh `runlevel`. Đây là ví dụ:

```
# runlevel
N 5
# telinit 3
INIT: Switching to runlevel: 3
# runlevel
5 3
```

Ở dòng đầu, đầu ra `runlevel` là `N 5`, nghĩa là không có runlevel trước vì `runlevel` chưa đổi từ lúc boot, và `runlevel` hiện tại là `5`. Sau khi đổi `runlevel`, đầu ra là `5 3`, cho thấy chuyển từ `5` sang `3`. Lệnh `halt` và `reboot` lần lượt chuyển sang runlevel `0` và `6`. Có thể ghi đè `runlevel` mặc định bằng cách cung cấp level khác trên kernel command line, dưới dạng một chữ số từ `0` đến `6`, hoặc `S` cho single user mode. Ví dụ, để buộc `runlevel` cho single user, thêm `S` vào kernel command line, trông như sau:

```
console=ttyAMA0 root=/dev/mmcblk1p2 S
```

Mỗi runlevel có các script dừng thành phần, gọi là `kill` script, và nhóm khác khởi chạy thành phần, gọi là `start` script. Khi vào `runlevel` mới, `init` chạy các script `kill` trước rồi các script `start`. Daemon đang chạy không có script `start` lẫn script `kill` trong `runlevel` mới được gửi signal `SIGTERM`. Nói cách khác, hành động mặc định khi chuyển `runlevel` là kết thúc daemon trừ khi được yêu cầu khác.

Thực ra runlevel không được dùng nhiều trong embedded Linux: phần lớn thiết bị chỉ boot đến `runlevel` mặc định rồi giữ nguyên. Tôi cảm thấy một phần do phần lớn mọi người không biết chúng.

Runlevel là cách đơn giản, tiện lợi để chuyển mode, ví dụ từ production sang maintenance mode.

System V `init` là tùy chọn trong Buildroot và Yocto Project. Cả hai đều loại bỏ đặc điểm riêng bash trong init script, nên chạy với BusyBox ash shell. Tuy nhiên, Buildroot dùng cách thay chương trình BusyBox `init` bằng SystemV `init` và thêm `inittab` mô phỏng hành vi BusyBox. Buildroot không triển khai runlevel, ngoại trừ chuyển level 0 hoặc 6 sẽ halt hoặc reboot hệ thống.

Tiếp theo, xem một số chi tiết. Các ví dụ lấy từ phiên bản fido của Yocto Project. Distribution khác có thể triển khai script `init` hơi khác.

### inittab

Chương trình `init` bắt đầu đọc `/etc/inttab`, chứa entry định nghĩa điều xảy ra ở mỗi `runlevel`. Định dạng là bản mở rộng BusyBox `inittab` đã mô tả trước, không ngạc nhiên vì ngay từ đầu BusyBox mượn từ System V! Định dạng mỗi dòng `inittab` như sau:

```
id:runlevels:action:process
```

Các field như sau:

- `id`: Định danh duy nhất tối đa bốn ký tự.

- `runlevels`: Các runlevel mà entry này cần được thực thi. (Trường này được để trống trong `inittab` của BusyBox)

- `action`: Một trong các keyword nêu sau.

- `process`: Lệnh cần chạy.

Action giống BusyBox `init`: `sysinit`, `respawn`, `once`, `wait`, `restart`, `ctrlaltdel`, `shutdown`. Tuy nhiên, System V `init` không có `askfirst`, vốn riêng BusyBox.

Ví dụ, đây là toàn bộ `inttab` do target core-image-minimal của Yocto Project cung cấp:

```
# /etc/inittab: init(8) configuration.
# $Id: inittab,v 1.91 2002/01/25 13:35:21 miquels Exp $

# The default runlevel.
id:5:initdefault:

# Boot-time system configuration/initialization script.
# This is run first except when booting in emergency (-b) mode.
si::sysinit:/etc/init.d/rcS

# What to do in single-user mode.
~~:S:wait:/sbin/sulogin
# /etc/init.d executes the S and K scripts upon change
# of runlevel.
#
# Runlevel 0 is halt.
# Runlevel 1 is single-user.
# Runlevels 2-5 are multi-user.
# Runlevel 6 is reboot.

l0:0:wait:/etc/init.d/rc 0
l1:1:wait:/etc/init.d/rc 1
l2:2:wait:/etc/init.d/rc 2
l3:3:wait:/etc/init.d/rc 3
l4:4:wait:/etc/init.d/rc 4
l5:5:wait:/etc/init.d/rc 5
l6:6:wait:/etc/init.d/rc 6
# Normally not reached, but fallthrough in case of emergency.
z6:6:respawn:/sbin/sulogin
AMA0:12345:respawn:/sbin/getty 115200 ttyAMA0
# /sbin/getty invocations for the runlevels.
#
# The "id" field MUST be the same as the last
# characters of the device (after "tty").
#
# Format:
#  <id>:<runlevels>:<action>:<process>
#

1:2345:respawn:/sbin/getty 38400 tty1
```

Entry đầu, `id:5:initdefault`, đặt `runlevel` mặc định thành `5`. Entry tiếp, `si::sysinit:/etc/init.d/rcS`, chạy script `rcS` khi boot. Sẽ nói thêm sau. Tiếp xuống có nhóm sáu entry bắt đầu với `l0:0:wait:/etc/init.d/rc 0`. Chúng chạy script `/etc/init.d/rc` mỗi khi đổi runlevel: script này xử lý script `start` và `kill`. Có entry cho runlevel `S` chạy chương trình login single-user.

Gần cuối `inittab`, có hai entry chạy daemon `getty` để tạo login prompt trên thiết bị `/dev/ttyAMA0` và `/dev/tty1` khi vào runlevel 1 đến 5, cho phép đăng nhập và có interactive shell:

```
AMA0:12345:respawn:/sbin/getty 115200 ttyAMA0
1:2345:respawn:/sbin/getty 38400 tty1
```

Thiết bị `ttyAMA0` là serial console trên board ARM Versatile đang giả lập bằng QEMU, khác với development board khác. Tty1 là virtual console thường map vào màn hình đồ họa nếu build kernel với `CONFIG_FRAMEBUFFER_CONSOLE or VGA_CONSOLE`. Linux desktop thường tạo sáu process `getty` trên virtual terminal 1 đến 6, có thể chọn bằng tổ hợp Ctrl + Alt + F1 đến Ctrl + Alt + F6; virtual terminal 7 dành cho màn hình đồ họa. Virtual terminal ít dùng trên thiết bị embedded.

Script `/etc/init.d/rcS` do entry `sysinit` chạy hầu như chỉ vào runlevel `S`:

```
#!/bin/sh

[...]
exec /etc/init.d/rc S
```

Vì vậy, run level đầu tiên là `S`, theo sau bởi `runlevel` mặc định `5`. Lưu ý `runlevel` `S` không được ghi nhận và không bao giờ được lệnh `runlevel` hiển thị là runlevel trước.

### Script init.d

Mỗi thành phần cần phản ứng với thay đổi `runlevel` có script trong `/etc/init.d` để thực hiện. Script phải hỗ trợ hai tham số: `start` và `stop`. Tôi sẽ đưa ví dụ sau.

Script xử lý `runlevel`, `/etc/init.d/rc`, nhận `runlevel` đích làm tham số. Với mỗi `runlevel`, có thư mục tên `rc<runlevel>.d`:

```
# ls -d /etc/rc*
/etc/rc0.d  /etc/rc2.d  /etc/rc4.d  /etc/rc6.d
/etc/rc1.d  /etc/rc3.d  /etc/rc5.d  /etc/rcS.d
```

Ở đó có tập script bắt đầu bằng chữ hoa `S` theo sau hai chữ số; cũng có thể có script bắt đầu bằng chữ hoa `K`. Đây là script `start` và `kill`: Buildroot dùng cùng ý tưởng, mượn từ đây:

```
# ls /etc/rc5.d
S01networking   S20hwclock.sh   S99rmnologin.sh S99stop-bootlogd
S15mountnfs.sh  S20syslog
```

Thực ra chúng là symbolic link về script thích hợp trong `init.d`. Script `rc` chạy mọi script bắt đầu bằng `K` trước, thêm tham số `stop`, rồi chạy script bắt đầu bằng `S`, thêm tham số `start`. Một lần nữa, số hai chữ số quy định thứ tự script cần chạy.

### Thêm daemon mới

Giả sử bạn có một chương trình tên `simpleserver`, được viết như một Unix daemon truyền thống, nghĩa là nó fork và chạy ở background. Bạn cần một script `init.d` như sau:

```
#! /bin/sh

case "$1" in
  start)
    echo "Starting simpelserver"
    start-stop-daemon -S -n simpleserver -a /usr/bin/simpleserver
    ;;
  stop)
    echo "Stopping simpleserver"
    start-stop-daemon -K -n simpleserver
    ;;
  *)
    echo "Usage: $0 {start|stop}"
  exit 1
esac

exit 0
```

`Start-stop-daemon` là helper function giúp thao tác background process như vậy dễ hơn. Ban đầu đến từ Debian installer package `dpkg`, nhưng phần lớn embedded system dùng bản BusyBox. Nó khởi động daemon bằng tham số `-S`, bảo đảm không bao giờ có hơn một instance chạy cùng lúc; tìm daemon theo tên bằng `-K` và gửi signal, mặc định `SIGTERM`. Đặt script vào `/etc/init.d/simpleserver` và cho phép thực thi.

Sau đó, thêm `symlinks` từ mỗi run level mà bạn muốn chạy chương trình; trong trường hợp này chỉ là `runlevel` mặc định, `5`:

```
# cd /etc/init.d/rc5.d
# ln -s ../init.d/simpleserver S99simpleserver
```

Số `99` có nghĩa là đây sẽ là một trong những chương trình được khởi chạy cuối cùng. Hãy nhớ rằng có thể có các link khác bắt đầu bằng `S99`; khi đó, script `rc` chỉ chạy chúng theo thứ tự từ điển.

Hiếm khi phải lo nhiều về thao tác shutdown trên thiết bị embedded, nhưng nếu cần làm gì, thêm `kill symlinks` vào level 0 và 6:

```
# cd /etc/init.d/rc0.d
# ln -s ../init.d/simpleserver K01simpleserver
# cd /etc/init.d/rc6.d
# ln -s ../init.d/simpleserver K01simpleserver
```

### Khởi động và dừng service

Bạn có thể tương tác với các script trong `/etc/init.d` bằng cách gọi chúng trực tiếp, chẳng hạn script `syslog` điều khiển các daemon `syslogd` và `klogd`:

```
# /etc/init.d/syslog --help
Usage: syslog { start | stop | restart }

# /etc/init.d/syslog stop
Stopping syslogd/klogd: stopped syslogd (pid 198)
stopped klogd (pid 201)
done

# /etc/init.d/syslog start
Starting syslogd/klogd: done
```

Mọi script triển khai `start` và `stop`, và nên triển khai `help`. Một số còn có `status`, cho biết service có chạy không. Distribution chủ đạo còn dùng System V `init` có lệnh tên service để khởi động, dừng service và che chi tiết gọi script trực tiếp.

## systemd

`systemd` tự định nghĩa là system and service manager. Dự án do Lennart Poettering và Kay Sievers khởi xướng năm 2010 nhằm tạo tập công cụ tích hợp quản lý Linux system, gồm daemon `init`. Nó còn gồm device management (`udev`), logging và nhiều thứ khác. Một số người nói nó không chỉ là chương trình `init`, mà là lối sống. Nó tiên tiến và vẫn phát triển nhanh. `systemd` phổ biến trên Linux distribution desktop, server và cũng ngày càng phổ biến trong embedded Linux, đặc biệt thiết bị phức tạp. Vậy nó tốt hơn System V `init` thế nào với embedded system?

- Cấu hình đơn giản, hợp lý hơn (khi đã hiểu); thay vì shell script đôi lúc rắc rối của System V `init`, `systemd` dùng unit configuration file để đặt tham số

- Có dependency tường minh giữa các service, thay vì một mã hai chữ số chỉ đơn thuần xác định thứ tự chạy script

- Dễ đặt permission và resource limit cho từng service, điều quan trọng đối với bảo mật

- `systemd` có thể giám sát service và khởi động lại nếu cần

- Có watchdog cho từng service và chính s`ystemd`

- Service khởi động song song, giảm boot time

Mô tả đầy đủ `systemd` không khả thi cũng không phù hợp ở đây. Như System V `init`, tôi tập trung vào use-cases embedded, với ví dụ dựa trên cấu hình do Yocto Fido tạo, có `systemd` phiên bản 219. Tôi sẽ tổng quan nhanh rồi đưa ví dụ cụ thể.

### Build systemd bằng Yocto Project và Buildroot

`init` mặc định trong Yocto Fido là System V. Để chọn `systemd`, thêm các dòng sau vào cấu hình, ví dụ `conf/local.conf`:

```
DISTRO_FEATURES_append = " systemd"
VIRTUAL-RUNTIME_init_manager = "systemd"
```

Lưu ý dấu cách ở đầu rất quan trọng! Sau đó rebuild.

Buildroot có `systemd` là tùy chọn `init` thứ ba. Nó yêu cầu glibc làm C library và kernel phiên bản 3.7 trở lên, bật tập tùy chọn cấu hình cụ thể. Danh sách dependency đầy đủ nằm trong file `README` ở cấp cao nhất source code `systemd`.

#### Giới thiệu target, service và unit

Trước khi mô tả cách `systemd init` hoạt động, tôi cần giới thiệu ba khái niệm chính.

Thứ nhất, target là nhóm service, tương tự nhưng tổng quát hơn SystemV `runlevel`. Có default target là nhóm service khởi động lúc boot.

Thứ hai, service là daemon có thể khởi động và dừng, rất giống SystemV `service`.

Cuối cùng, unit là file cấu hình mô tả `target`, `service` và một số thứ khác. Unit là text file chứa property và value.

Bạn có thể thay đổi trạng thái và tìm hiểu những gì đang diễn ra bằng lệnh `systemctl`.

##### Unit

Đơn vị cấu hình cơ bản là unit file. Unit file nằm ở ba nơi:

- `/etc/systemd/system`: Cấu hình cục bộ

- `/run/systemd/system`: Cấu hình runtime

- `/lib/systemd/system`: Cấu hình Distribution-wide

Khi tìm unit, `systemd` tìm directory theo thứ tự đó, dừng ngay khi khớp, cho phép ghi đè hành vi unit distribution-wide bằng unit cùng tên trong `/etc/systemd/system`. Có thể vô hiệu hoàn toàn unit bằng file cục bộ trống hoặc link đến `/dev/null`.

Mọi unit file bắt đầu bằng section `[Unit]`, chứa thông tin cơ bản và dependency, ví dụ:

```
[Unit]
Description=D-Bus System Message Bus
Documentation=man:dbus-daemon(1)
Requires=dbus.socket
```

Unit dependency được thể hiện qua `Requires`, `Wants`, `Conflicts`:

- `Requires`: Danh sách unit mà unit này phụ thuộc, được khởi động khi unit này khởi động

- `Wants`: Dạng yếu hơn của `Requires`: các unit được liệt kê được khởi động, nhưng unit hiện tại không dừng nếu một unit đó thất bại

- `Conflicts`: Dependency phủ định: các unit được liệt kê bị dừng khi unit này khởi động; ngược lại, nếu một unit đó khởi động thì unit này dừng

Việc xử lý dependency tạo ra danh sách những unit cần được khởi động (hoặc dừng). Các keyword `Before` và `After` xác định thứ tự khởi động chúng. Thứ tự dừng chính là thứ tự ngược lại của thứ tự khởi động:

- `Before`: Unit này phải khởi động trước các unit được liệt kê

- `After`: Unit này phải khởi động sau các unit được liệt kê

Trong ví dụ sau, directive `After` bảo đảm web server khởi động sau network:

```
[Unit]
Description=Lighttpd Web Server
After=network.target
```

Không có directive `Before` hay `After`, unit được khởi động hoặc dừng song song, không theo thứ tự cụ thể.

##### Service

Service là daemon có thể khởi động và dừng, tương đương System V `service`. Service là một loại unit file với tên kết thúc `.service`, ví dụ `lighttpd.service`.

Service unit có một section `[Service]` mô tả cách chạy service. Sau đây là phần liên quan trong `lighttpd.service`:

```
[Service]
ExecStart=/usr/sbin/lighttpd -f /etc/lighttpd/lighttpd.conf -D
ExecReload=/bin/kill -HUP $MAINPID
```

Đây là các lệnh được chạy khi khởi động và khởi động lại service. Bạn có thể thêm nhiều thiết lập cấu hình khác tại đây, nên hãy tham khảo man page của `systemd.service`.

##### Target

Target là loại unit khác nhóm service (hoặc loại unit khác). Đây là loại unit chỉ có dependency. Target có tên kết thúc `.target`, ví dụ `multi-user.target`. Target là trạng thái mong muốn, thực hiện cùng vai trò runlevel System V.

### Cách systemd boot hệ thống

Giờ có thể xem cách `systemd` triển khai bootstrap. Kernel chạy `systemd` vì `/sbin/init` là symbolic link đến `/lib/systemd/systemd`. Nó chạy default target, `default.target`, luôn là link tới target mong muốn như `multi-user.target` cho text login hoặc `graphical.target` cho môi trường đồ họa. Ví dụ, nếu default target là `multi-user.target`, bạn thấy symbolic link:

```
/etc/systemd/system/default.target -> /lib/systemd/system/multi-
user.target
```

Có thể ghi đè default target bằng cách truyền `system.unit=<new target>` trên kernel command line. Dùng `systemctl` để tìm default target như sau:

```
# systemctl get-default
multi-user.target
```

Khởi động target như `multi-user.target` tạo dependency tree đưa hệ thống vào hoạt động. Trong hệ thống điển hình, `multi-user.target` phụ thuộc `basic.target`, nó phụ thuộc `sysinit.target`, rồi phụ thuộc các service phải khởi động sớm. Có thể in graph bằng `systemctl list-dependencies`.

Cũng có thể liệt kê mọi service và trạng thái hiện tại bằng `systemctl list-units --type service`, tương tự cho target bằng `systemctl list-units --type target`.

### Thêm service riêng

Dùng cùng ví dụ `simpleserver` như trước, đây là service unit:

```
[Unit]
Description=Simple server

[Service]
Type=forking
ExecStart=/usr/bin/simpleserver

[Install]
WantedBy=multi-user.target
```

Section `[Unit]` chỉ chứa mô tả để hiển thị đúng khi liệt kê bằng `systemctl` và lệnh khác. Không có dependency; như đã nói, nó rất đơn giản.

Section `[Service]` trỏ đến executable và có flag cho biết nó fork. Nếu còn đơn giản hơn và chạy foreground, `systemd` sẽ daemonize thay và không cần `Type=forking`.

Section `[Install]` làm nó phụ thuộc `multi-user.target` để server khởi động khi hệ thống vào multi-user mode.

Sau khi lưu unit trong `/etc/systemd/system/simpleserver.service`, có thể khởi động và dừng bằng các lệnh `systemctl start simpleserver` và s`ystemctl stop simpleserver`. Dùng lệnh sau để tìm trạng thái hiện tại:

```
# systemctl status simpleserver
  simpleserver.service - Simple server
  Loaded: loaded (/etc/systemd/system/simpleserver.service;
  disabled)
  Active: active (running) since Thu 1970-01-01 02:20:50 UTC; 8s
  ago
  Main PID: 180 (simpleserver)
  CGroup: /system.slice/simpleserver.service
           └─180 /usr/bin/simpleserver -n

Jan 01 02:20:50 qemuarm systemd[1]: Started Simple server.
```

Lúc này, nó chỉ khởi động và dừng theo lệnh như trên. Để duy trì qua các lần khởi động, cần thêm dependency lâu dài vào target. Đó là mục đích section `[Install]`: khi service được enable, nó trở thành dependency của `multi-user.target` nên khởi động lúc boot. Enable bằng `systemctl enable` như sau:

```
# systemctl enable simpleserver
Created symlink from /etc/systemd/system/multi-
user.target.wants/simpleserver.service to
/etc/systemd/system/simpleserver.service.
```

Giờ bạn thấy cách thêm dependency tại runtime mà không phải sửa unit file nào. Target có thể có thư mục tên `<target_name>.target.wants` chứa link tới service. Điều này giống hệt thêm dependent unit vào danh sách `[Wants]` trong target. Ở đây, bạn thấy link sau đã được tạo:

```
/etc/systemd/system/multi-user.target.wants/simpleserver.service
/etc/systemd/system/simpleserver.service
```

Nếu đây là một service quan trọng, bạn có thể muốn khởi động lại nó khi gặp lỗi. Bạn có thể thực hiện bằng cách thêm flag sau vào section `[Service]`:

`Restart=on-abort`

Các tùy chọn khác cho `Restart` là `on-success`, `on-failure`, `on-abnormal`, `on-watchdog`, `on-abort` hoặc `always`.

### Thêm watchdog

Watchdog là yêu cầu phổ biến ở thiết bị embedded: cần hành động nếu service quan trọng ngừng hoạt động, thường reset hệ thống. Trên phần lớn embedded SoC có hardware watchdog truy cập qua device node `/dev/watchdog`. Watchdog được khởi tạo với timeout lúc boot và phải reset trong khoảng đó, nếu không watchdog kích hoạt và hệ thống reboot. Giao diện watchdog driver được mô tả trong source kernel tại `Documentation/watchdog`, code driver trong `drivers/watchdog`. Vấn đề nảy sinh nếu có từ hai service quan trọng cần watchdog bảo vệ. `systemd` có tính năng hữu ích phân phối watchdog giữa nhiều service.

`systemd` có thể cấu hình để mong đợi keepalive call định kỳ từ service và hành động nếu không nhận được, tức software watchdog per-service. Để hoạt động, phải thêm code gửi keepalive message vào daemon. Nó cần kiểm tra giá trị non-zero trong environment variable `WATCHDOG_USEC`, rồi gọi `sd_notify(false, "WATCHDOG=1")` trong khoảng đó (khuyến nghị chu kỳ bằng nửa watchdog timeout). Có ví dụ trong source code `systemd`.

Để bật watchdog trong service unit, thêm nội dung như sau vào section `[Service]`:

```
WatchdogSec=30s
Restart=on-watchdog
StartLimitInterval=5min
StartLimitBurst=4
StartLimitAction=reboot-force
```

Trong ví dụ này, service mong đợi keepalive mỗi 30 giây. Nếu không được gửi, service được khởi động lại; nhưng nếu khởi động lại hơn bốn lần trong năm phút, `systemd` buộc reboot ngay. Một lần nữa, manual `systemd` có mô tả đầy đủ các thiết lập.

Watchdog như vậy xử lý từng service, nhưng nếu chính `systemd` thất bại, kernel crash hoặc hardware bị treo thì sao? Khi đó cần bảo `systemd` dùng watchdog driver: chỉ cần thêm `RuntimeWatchdogSec=NN` vào `/etc/systemd/system.conf`. `systemd` reset watchdog trong khoảng đó, nên hệ thống reset nếu `systemd` thất bại vì lý do nào đó.

### Ý nghĩa với embedded Linux

`systemd` có nhiều tính năng hữu ích trong embedded Linux, gồm nhiều thứ chưa nhắc trong mô tả ngắn này như resource control bằng slice (xem man page `systemd.slice(5)` và `systemd.resource-control(5)`), device management (`udev(7)`) và system logging (`journald(5)`).

Bạn phải cân nhắc lợi ích đó với kích thước của nó: ngay cả bản build tối thiểu chỉ có các thành phần cốt lõi `systemd`, `udevd` và `journald` cũng chiếm gần 10 MiB storage, bao gồm các shared library.

Cũng phải nhớ phát triển `systemd` bám sát kernel, nên không hoạt động với kernel cũ hơn bản phát hành `systemd` quá một hoặc hai năm.

## Đọc thêm

Tài nguyên sau cung cấp thêm thông tin về chủ đề được giới thiệu trong chương:

- systemd system and Service Manager: `http://www.freedesktop.org/wiki/Software/systemd/` (có nhiều link hữu ích ở cuối trang)

## Tổng kết

Mọi thiết bị Linux cần chương trình `init` thuộc dạng nào đó. Nếu thiết kế hệ thống chỉ khởi chạy ít daemon lúc startup và tương đối static sau đó, BusyBox `init` đáp ứng nhu cầu. Nó thường là lựa chọn tốt nếu dùng Buildroot làm build system.

Ngược lại, nếu hệ thống có dependency phức tạp giữa service khi boot hoặc runtime và có đủ storage, `systemd` là lựa chọn tốt nhất. Ngay cả khi không phức tạp, `systemd` vẫn có tính năng hữu ích trong cách xử lý watchdog, remote logging, v.v., nên chắc chắn đáng cân nhắc nghiêm túc.

Khó biện hộ cho System V `init` chỉ dựa trên ưu điểm riêng, vì ít lợi thế so với BusyBox `init` đơn giản. Tuy vậy, nó vẫn tồn tại lâu chỉ vì đã có sẵn. Ví dụ, nếu build bằng Yocto Project và quyết định không dùng `systemd`, System V `init` là phương án thay thế.

Về giảm boot time, `systemd` nhanh hơn System V `init` với workload tương tự. Tuy nhiên, nếu muốn boot cực nhanh, không gì hơn BusyBox `init` đơn giản với boot script tối thiểu.

Chương này nói về một process rất quan trọng, `init`. Trong chương tiếp theo, tôi mô tả process thực sự là gì, liên quan thread thế nào, cách chúng phối hợp và được scheduling. Hiểu những điều này quan trọng nếu muốn tạo embedded system vững chắc, dễ bảo trì.
