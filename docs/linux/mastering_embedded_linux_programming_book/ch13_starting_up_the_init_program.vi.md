# Chương 13: Khởi động – Chương trình init (Starting Up – The init Program)

Trong Chương 4, chúng ta đã xem kernel boot như thế nào cho đến lúc nó khởi chạy chương trình đầu tiên, `init`. Trong Chương 5 và 6, chúng ta đã xem cách tạo các root filesystem với độ phức tạp khác nhau, tất cả đều chứa một chương trình `init`. Giờ là lúc xem xét chính chương trình `init` chi tiết hơn và khám phá vì sao nó lại quan trọng đến vậy đối với phần còn lại của hệ thống.

Có nhiều bản hiện thực của `init`. Trong chương này, tôi sẽ mô tả ba bản chính: BusyBox `init`, System V `init` và `systemd`. Tôi sẽ giải thích cách chúng hoạt động và loại hệ thống nào phù hợp nhất với từng loại. Một phần của việc này là cân bằng sự đánh đổi giữa kích thước, độ phức tạp và tính linh hoạt. Chúng ta sẽ học cách khởi chạy một daemon bằng cả BusyBox `init` lẫn System V `init`. Chúng ta cũng sẽ học cách thêm một service vào `systemd`.

Trong chương này, chúng ta sẽ đề cập các chủ đề sau:

- Sau khi kernel đã boot

- Giới thiệu các chương trình `init`

- BusyBox `init`

- System V `init`

- `systemd`

## Yêu cầu kỹ thuật

Để làm theo các ví dụ, hãy bảo đảm bạn có những thứ sau:

- Một hệ thống host Ubuntu 24.04 hoặc bản LTS mới hơn với ít nhất 90 GB dung lượng đĩa trống

- Bản phát hành Buildroot 2024.02.6 LTS

- Bản phát hành Yocto 5.0 (scarthgap) LTS

Lẽ ra bạn đã cài đặt bản phát hành 2024.02.6 LTS của Buildroot cho Chương 6. Nếu chưa, hãy tham khảo phần System requirements của The Buildroot user manual (`https://buildroot.org/downloads/manual/manual.html)` trước khi cài đặt Buildroot trên host Linux theo hướng dẫn từ Chương 6.

Lẽ ra bạn đã build bản phát hành 5.0 (scarthgap) LTS của Yocto trong Chương 6. Nếu chưa, hãy tham khảo các phần Compatible Linux Distribution và Build Host Packages của Yocto Project Quick Build guide (`https://docs.yoctoproject.org/brief-yoctoprojectqs/`) trước khi build Yocto trên host Linux theo hướng dẫn trong Chương 6.

Code dùng trong chương này có trong thư mục của chương trong GitHub repository của cuốn sách: `https://github.com/PacktPublishing/Mastering-Embedded-Linux-Development`.

## Sau khi kernel đã boot

Trong Chương 4, chúng ta đã thấy code bootstrap của kernel tìm một root filesystem như thế nào, hoặc là `initramfs` hoặc là một filesystem được chỉ định bởi `root=` trên kernel command line. Code bootstrap của kernel sau đó thực thi một chương trình, mặc định là `/init` đối với `initramfs` và `/sbin/init` đối với một filesystem thông thường. Chương trình `init` có quyền `root`, và vì nó là process đầu tiên chạy, nó có process ID (PID) là 1. Nếu vì lý do nào đó `init` không thể được khởi động, kernel sẽ panic và hệ thống sẽ không boot được.

Chương trình `init` là tổ tiên của mọi process khác, như được thể hiện ở đây bằng lệnh `pstree` chạy trên một hệ thống embedded Linux đơn giản:

```
# pstree -gn
init(1)-+-syslogd(63)
        |-klogd(66)
        |-dropbear(99)
        `-sh(100)---pstree(109)
```

Công việc của chương trình `init` là nắm quyền điều khiển quá trình boot trong user space và đưa nó vào hoạt động. Nó có thể đơn giản chỉ là một lệnh shell chạy một shell script—có một ví dụ về điều này ở đầu Chương 5—nhưng trong hầu hết các trường hợp, bạn sẽ dùng một daemon `init` chuyên dụng để thực hiện các tác vụ sau:

- Khởi động các daemon khác và cấu hình các tham số hệ thống cùng những thứ khác cần thiết để đưa hệ thống vào trạng thái hoạt động.

- Tùy chọn, khởi chạy một daemon đăng nhập, như `getty`, trên các terminal cho phép login shell.

- Nhận nuôi các process trở thành mồ côi do process cha trực tiếp của chúng kết thúc và không còn process nào khác trong thread group.

- Phản hồi khi bất kỳ process con trực tiếp nào của nó kết thúc bằng cách bắt signal `SIGCHLD` và thu nhận giá trị trả về để ngăn chúng trở thành zombie process. Tôi sẽ nói thêm về zombie trong Chương 17.

- Tùy chọn, khởi động lại các daemon khác đã kết thúc.

- Xử lý việc tắt hệ thống.

Nói cách khác, `init` quản lý vòng đời của hệ thống từ lúc bootup đến lúc tắt máy. Có một trường phái cho rằng `init` ở vị trí tốt để xử lý các sự kiện runtime khác như phần cứng mới và việc nạp và gỡ module. Đây là điều mà `systemd` làm.

## Giới thiệu các chương trình init

Ba chương trình init mà bạn có khả năng gặp nhất trong các thiết bị nhúng là BusyBox `init`, System V `init` và `systemd`. Buildroot cung cấp cả ba với BusyBox `init` là mặc định. The Yocto Project cho phép bạn chọn giữa System V `init` và `systemd` với System V `init` là mặc định. Trong khi tiny distribution của Yocto đi kèm BusyBox `init`, hầu hết các distro layer khác thì không.

Bảng sau đưa ra một số tiêu chí để so sánh ba chương trình:

| Tiêu chí | BusyBox init | System V init | systemd |
|---|---|---|---|
| Độ phức tạp | Thấp | Trung bình | Cao |
| Tốc độ bootup | Nhanh | Chậm | Trung bình |
| Shell yêu cầu | ash | dash hoặc bash | Không |
| Số file thực thi | 1(\*) | 4 | 50 |
| libc | Bất kỳ | Bất kỳ | glibc |
| Kích thước (MB) | \< 0.1(\*) | 0.1 | 34(\*\*) |

Bảng 13.1 – So sánh BusyBox init, System V init và systemd

(\*) BusyBox `init` là một phần của file thực thi duy nhất của BusyBox, vốn được tối ưu cho kích thước trên đĩa.

(\*\*) Dựa trên cấu hình `systemd` của Buildroot.

Nói chung, tính linh hoạt và độ phức tạp tăng dần khi bạn đi từ BusyBox `init` đến `systemd`.

## BusyBox init

BusyBox có một chương trình `init` tối giản dùng một file cấu hình `/etc/inittab` để khởi động các chương trình lúc bootup và dừng chúng lúc tắt máy. Công việc thực sự được thực hiện bởi các shell script, theo quy ước được đặt trong thư mục `/etc/init.d`.

`init` bắt đầu bằng việc đọc `/etc/inittab`. File này chứa danh sách các chương trình cần chạy, mỗi chương trình một dòng, theo định dạng này:

```
<id>::<action>:<program>
```

Vai trò của các tham số này là:

- `id`: Terminal điều khiển của lệnh

- `action`: Khi nào và cách chạy chương trình

- `program`: Chương trình cần chạy cùng với tất cả các đối số command-line của nó

Các action là:

- `sysinit`: Chạy chương trình khi `init` khởi động, trước mọi loại action khác.

- `respawn`: Chạy chương trình và khởi động lại nó nếu nó kết thúc. Nó được dùng để chạy một chương trình như một daemon.

- `askfirst`: Giống như `respawn`, nhưng nó in thông điệp Please press Enter to activate this console ra console và chạy chương trình sau khi Enter được nhấn. Nó được dùng để khởi động một shell tương tác trên một terminal mà không nhắc nhập username hay mật khẩu.

- `once`: Chạy chương trình một lần nhưng không cố khởi động lại nó nếu nó kết thúc.

- `wait`: Chạy chương trình và chờ nó hoàn thành.

- `restart`: Chạy chương trình khi `init` nhận signal `SIGHUP`, cho biết nó nên nạp lại file `inittab`.

- `ctrlaltdel`: Chạy chương trình khi `init` nhận signal `SIGINT`, thường là kết quả của việc nhấn Ctrl + Alt + Del trên console.

- `shutdown`: Chạy chương trình khi `init` tắt.

Đây là một ví dụ nhỏ mount `proc` và `sysfs` rồi chạy một shell trên một giao diện serial:

```
null::sysinit:/bin/mount -t proc proc /proc
null::sysinit:/bin/mount -t sysfs sysfs /sys
console::askfirst:-/bin/sh
```

Đối với các project đơn giản mà bạn muốn khởi chạy một số ít daemon và khởi động một login shell trên một serial terminal, việc viết các script thủ công rất dễ dàng. Điều này phù hợp nếu bạn đang tạo một embedded Linux roll-your-own (RYO). Tuy nhiên, bạn sẽ thấy rằng các script `init` viết tay nhanh chóng trở nên không thể bảo trì khi số lượng thứ cần cấu hình tăng lên. Chúng không mấy module hóa và cần được cập nhật mỗi khi một thành phần mới được thêm vào hoặc gỡ bỏ.

### Các script init của Buildroot

Buildroot đã sử dụng hiệu quả BusyBox `init` trong nhiều năm. Buildroot có hai script trong `/etc/init.d/` tên là `rcS` và `rcK` (`rc` là viết tắt của "run commands"). Script `rcS` chạy lúc bootup. Nó duyệt qua tất cả các script trong `/etc/init.d/` có tên bắt đầu bằng chữ `S` hoa theo sau là hai chữ số và chạy chúng theo thứ tự số. Đây là các start script. Script `rcK` được chạy lúc tắt máy. Nó duyệt qua tất cả các script bắt đầu bằng chữ `K` hoa theo sau là hai chữ số và chạy chúng theo thứ tự số. Đây là các kill script.

Với cấu trúc này, các package của Buildroot dễ dàng cung cấp start script và kill script của riêng chúng để hệ thống trở nên mở rộng được. Số two-digit kiểm soát thứ tự chạy các script `init`. Nếu bạn đang dùng Buildroot, cấu trúc này là trong suốt. Nếu không, bạn có thể dùng nó làm mô hình để viết các script BusyBox `init` của riêng mình.

Giống như BusyBox `init`, System V `init` dựa vào các shell script bên trong `/etc/init.d` và một file cấu hình `/etc/inittab`. Mặc dù hai hệ thống `init` giống nhau ở nhiều mặt, System V `init` có nhiều tính năng hơn và lịch sử dài hơn nhiều.

## System V init

Chương trình `init` này được lấy cảm hứng từ chương trình của Unix System V và có từ mid-1980s. Phiên bản thường gặp nhất trong các bản phân phối Linux ban đầu được viết bởi Miquel van Smoorenburg. Cho đến gần đây, nó là daemon `init` cho hầu như mọi bản phân phối desktop và server cũng như khá nhiều hệ thống nhúng. Tuy nhiên, trong những năm gần đây nó đã bị thay thế bởi `systemd`, mà chúng ta sẽ mô tả trong phần tiếp theo.

Daemon BusyBox `init` chỉ là một phiên bản trimmed-down của System V `init`. System V `init` có hai ưu điểm so với BusyBox `init`:

- Thứ nhất, các boot script được viết theo một định dạng module hóa well-known, giúp dễ dàng thêm package mới lúc build hoặc lúc runtime.

- Thứ hai, nó có khái niệm runlevel, cho phép một tập hợp chương trình được khởi động hoặc dừng một lượt khi chuyển từ runlevel này sang runlevel khác.

Có tám runlevel được đánh số từ `0` đến `6` cộng với `S`:

- `S`: Chạy các tác vụ khởi động

- `0`: Dừng hệ thống

- `1` đến `5`: Dành cho sử dụng chung

- `6`: Reboot hệ thống

Các level `1` đến `5` có thể được dùng tùy ý. Trên hầu hết các bản phân phối Linux desktop, chúng được gán như sau:

- `1`: Một người dùng

- `2`: Multi-user không có cấu hình mạng

- `3`: Multi-user có cấu hình mạng

- `4`: Không dùng

- `5`: Multi-user với đăng nhập đồ họa

Chương trình `init` khởi động runlevel mặc định được cho bởi dòng `initdefault` trong `/etc/inittab`:

```
id:3:initdefault:
```

Bạn có thể đổi runlevel lúc runtime bằng lệnh `telinit <runlevel>`, lệnh này gửi một thông điệp đến `init`. Bạn có thể tìm runlevel hiện tại và runlevel trước đó bằng lệnh `runlevel`. Đây là một ví dụ:

```
# runlevel
N 5
# telinit 3
INIT: Switching to runlevel: 3
# runlevel
5 3
```

Output ban đầu từ lệnh `runlevel` là `N 5`. Một `N` cho biết không có runlevel trước đó vì runlevel chưa thay đổi kể từ khi boot. Runlevel hiện tại là `5`. Sau khi đổi runlevel, output là `5` `3`, cho biết đã có một chuyển đổi từ `5` sang `3`.

Các lệnh `halt` và `reboot` chuyển sang runlevel `0` và `6` tương ứng. Bạn có thể ghi đè runlevel mặc định bằng cách đưa một runlevel khác (một chữ số duy nhất từ `0` đến `6`) trên kernel command line. Ví dụ, để buộc runlevel mặc định là một người dùng, bạn thêm `1` vào cuối kernel command line như sau:

```
console=ttyAMA0 root=/dev/mmcblk1p2 1
```

Mỗi runlevel có một số kill script để dừng các thứ, và một nhóm start script khác để khởi động chúng. Khi vào một runlevel mới, `init` trước tiên chạy các kill script rồi đến các start script từ level mới. Các daemon đang chạy mà không có start script lẫn kill script trong runlevel mới sẽ được gửi một signal `SIGTERM`. Nói cách khác, action mặc định khi chuyển runlevel là kết thúc các daemon trừ khi được chỉ định khác.

Thực tế, runlevel không được dùng nhiều trong embedded Linux. Hầu hết các thiết bị đơn giản boot vào runlevel mặc định và ở lại đó. Tôi có cảm giác điều này một phần là vì hầu hết mọi người không biết đến chúng.

MẸO

Runlevel là một cách đơn giản và tiện lợi để chuyển đổi giữa các chế độ, ví dụ, từ chế độ sản xuất sang chế độ bảo trì.

System V `init` là một tùy chọn trong Buildroot và The Yocto Project. Trong cả hai trường hợp, các script `init` đã được loại bỏ mọi đặc thù của shell `bash`, vì vậy chúng sẽ hoạt động với shell `ash` của BusyBox. Tuy nhiên, Buildroot hơi ăn gian bằng cách thay chương trình BusyBox `init` bằng System V `init` và thêm một `inittab` mô phỏng hành vi của BusyBox. Buildroot không hiện thực runlevel ngoại trừ `0` và `6`, là các runlevel dừng hoặc reboot hệ thống.

Tiếp theo, hãy xem một số chi tiết. Các ví dụ sau được lấy từ bản phát hành The Yocto Project 5.0. Các bản phân phối Linux khác có thể hiện thực các script `init` hơi khác một chút.

### inittab

Chương trình `init` bắt đầu bằng việc đọc các mục định nghĩa điều gì xảy ra ở mỗi runlevel từ một file cấu hình `/etc/inittab`. Định dạng là một phiên bản mở rộng của `inittab` BusyBox được mô tả ở phần trước. Điều này không có gì ngạc nhiên vì ngay từ đầu BusyBox đã mượn nó từ System V.

Định dạng của mỗi mục trong `inittab` là:

```
<id>:<runlevels>:<action>:<process>
```

Các trường là:

- `id`: Một định danh duy nhất dài tối đa bốn ký tự

- `runlevels`: Các runlevel mà mục này thuộc về

- `action`: Khi nào và cách chạy lệnh

- `process`: Lệnh cần chạy

Các action giống như của BusyBox `init`: `sysinit`, `respawn`, `once`, `wait`, `restart`, `ctrlaltdel` và `shutdown`. Tuy nhiên, System V `init` không có `askfirst`, vốn đặc thù cho BusyBox.

Đây là `inittab` đầy đủ được The Yocto Project cung cấp khi build `core-image-minimal` cho machine `qemuarm`:

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
# /sbin/getty invocations for the runlevels
#
# The "id" field MUST be the same as the last
# characters of the device (after "tty").
#
# Format:
# <id>:<runlevels>:<action>:<process>
#

1:2345:respawn:/sbin/getty 38400 tty1
```

Mục `id:5:initdefault` đầu tiên đặt runlevel mặc định là `5`. Mục `si::sysinit` tiếp theo chạy script `/etc/init.d/rcS` lúc bootup. Tất cả những gì script `rcS` làm là vào runlevel `S`:

```
#!/bin/sh
<…>
exec /etc/init.d/rc S
```

Do đó, runlevel đầu tiên được vào là `S`, theo sau là runlevel mặc định `5`. Lưu ý rằng runlevel `S` không được ghi lại và không bao giờ được hiển thị là runlevel trước đó bởi lệnh `runlevel`.

Bảy mục bắt đầu bằng `l0` đến `l6` chạy script `/etc/init.d/rc` bất cứ khi nào có thay đổi runlevel. Script `rc` chịu trách nhiệm xử lý các start script và kill script.

Dò xuống thêm một chút để tìm một mục chạy daemon `getty`:

```
AMA0:12345:respawn:/sbin/getty 115200 ttyAMA0
```

Mục này tạo một dấu nhắc đăng nhập trên `/dev/ttyAMA0` khi vào các runlevel `1` đến `5`, cho phép bạn đăng nhập và có một shell tương tác. Thiết bị `ttyAMA0` là serial console trên board Arm Versatile được QEMU giả lập. Tên thiết bị có thể khác đối với serial console trên các dev board khác.

Mục cuối cùng chạy một daemon `getty` khác trên `/dev/tty1`:

```
1:2345:respawn:/sbin/getty 38400 tty1
```

Mục này được kích hoạt khi vào các runlevel `2` đến `5`. Thiết bị `tty1` là một virtual console được ánh xạ tới một màn hình đồ họa khi bạn build kernel với `CONFIG_FRAMEBUFFER_CONSOLE` hoặc `VGA_CONSOLE`.

Các bản phân phối Linux desktop thường spawn sáu daemon `getty` trên các virtual terminal 1 đến 6, với `tty7` dành riêng cho màn hình đồ họa. Ubuntu và Arch Linux là những ngoại lệ đáng chú ý vì chúng dùng `tty1` cho đồ họa. Bạn có thể chuyển giữa các virtual terminal bằng các tổ hợp phím Ctrl + Alt + F1 đến Ctrl + Alt + F6. Virtual terminal hiếm khi được dùng trên các thiết bị nhúng.

### Các script init.d

Mỗi thành phần cần phản hồi một thay đổi runlevel có một script trong `/etc/init.d` để thực hiện thay đổi. Script nên nhận hai tham số: `start` và `stop`. Tôi sẽ đưa ra ví dụ về từng tham số trong phần Adding a new daemon.

Script xử lý runlevel `/etc/init.d/rc` (runlevel-handling) nhận runlevel mà nó đang chuyển sang làm tham số. Có một thư mục tên `rc<runlevel>.d` cho mỗi runlevel:

```
# ls -d /etc/rc*
/etc/rc0.d  /etc/rc2.d  /etc/rc4.d  /etc/rc6.d
/etc/rc1.d  /etc/rc3.d  /etc/rc5.d  /etc/rcS.d
```

Ở đó bạn sẽ tìm thấy một tập script bắt đầu bằng chữ `S` hoa theo sau là hai chữ số. Bạn cũng có thể tìm thấy các script bắt đầu bằng chữ `K` hoa. Đây là các start script và kill script. Đây là một ví dụ về các script cho runlevel `5`:

```
# ls /etc/rc5.d
S01networking   S20hwclock.sh  S99rmnologin.sh  S99stop-bootlogd
S15mountnfs.sh  S20syslog
```

Thực tế, đây là các symbolic link trỏ ngược về các script tương ứng của chúng trong `init.d`. Script `rc` trước tiên chạy tất cả các script bắt đầu bằng `K`, truyền vào tham số `stop`. Sau đó nó chạy tất cả các script bắt đầu bằng `S`, truyền vào tham số `start`. Một lần nữa, các mã two-digit có mặt để quy định thứ tự thực thi các script.

### Thêm một daemon mới

Hãy tưởng tượng bạn có một chương trình tên `simpleserver` được viết như một daemon Unix truyền thống; nói cách khác, nó fork và chạy ở chế độ nền. Code cho chương trình này nằm trong `MELD/Chapter13/simpleserver`. Script `init.d` tương ứng (xem bên dưới) nằm trong `MELD/Chapter13/simpleserver-sysvinit/init.d`:

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

`start-stop-daemon` là một chương trình giúp thao tác với các process chạy nền dễ dàng hơn. Ban đầu nó đến từ package trình cài đặt Debian (`dpkg`) nhưng hầu hết các hệ thống nhúng dùng bản từ BusyBox. Chạy `start-stop-daemon` với tham số `-S` khởi động daemon, bảo đảm rằng không bao giờ có nhiều hơn một instance chạy tại bất kỳ thời điểm nào. Chạy `start-stop-daemon` với tham số `-K` dừng daemon bằng cách gửi cho nó một signal, mặc định là `SIGTERM`, để báo cho daemon biết đã đến lúc kết thúc.

Để `simpleserver` hoạt động, hãy copy script `init.d` vào `/etc/init.d` và làm cho nó thực thi được. Sau đó, thêm các link từ mỗi runlevel mà bạn muốn chạy chương trình này—trong trường hợp này, chỉ runlevel mặc định `5`:

```
# cd /etc/init.d/rc5.d
# ln -s ../init.d/simpleserver S99simpleserver
```

Số `99` nghĩa là đây sẽ là một trong những chương trình cuối cùng được khởi động.

LƯU Ý QUAN TRỌNG

Hãy nhớ rằng có thể có các link khác bắt đầu bằng `S99`, trong trường hợp đó script `rc` sẽ chỉ chạy chúng theo thứ tự từ điển.

Trong các thiết bị nhúng, hiếm khi phải lo lắng quá nhiều về các thao tác tắt máy, nhưng nếu có việc gì cần làm, hãy thêm các kill link vào level `0` và `6`:

```
# cd /etc/init.d/rc0.d
# ln -s ../init.d/simpleserver K01simpleserver
# cd /etc/init.d/rc6.d
# ln -s ../init.d/simpleserver K01simpleserver
```

Chúng ta có thể bỏ qua runlevel và thứ tự để kiểm thử và debug các script `init.d` tức thời hơn.

### Khởi động và dừng service

Bạn có thể tương tác với các script trong `/etc/init.d` bằng cách gọi chúng trực tiếp. Đây là một ví dụ dùng script `syslog` điều khiển các daemon `syslogd` và `klogd`:

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

Tất cả các script đều hiện thực `start` và `stop`, và chúng cũng nên hiện thực `help`. Một số hiện thực cả `status`, cho bạn biết service có đang chạy hay không. Các bản phân phối chính thống vẫn dùng System V `init` có một lệnh tên `service` để khởi động và dừng service, che giấu chi tiết của việc gọi script trực tiếp.

System V `init` là một daemon `init` đơn giản đã phục vụ các quản trị viên Linux trong nhiều thập kỷ. Mặc dù runlevel mang lại mức độ tinh vi cao hơn BusyBox `init`, System V `init` vẫn thiếu khả năng giám sát service và khởi động lại chúng khi cần. Khi System V `init` bắt đầu lộ vẻ già cỗi, hầu hết các bản phân phối Linux phổ biến đã chuyển sang `systemd`.

## systemd

`systemd` (`https://systemd.io/`) tự định nghĩa mình là một trình quản lý hệ thống và service. Project được khởi xướng năm 2010 bởi Lennart Poettering và Kay Sievers để tạo một tập công cụ tích hợp cho việc quản lý một hệ thống Linux dựa trên một daemon `init`. Nó cũng bao gồm quản lý thiết bị (`udev`) và logging, cùng nhiều thứ khác. `systemd` là state of the art và vẫn đang phát triển nhanh chóng. Nó phổ biến trên các bản phân phối Linux desktop và server và ngày càng phổ biến trên các hệ thống embedded Linux. Vậy, nó tốt hơn System V `init` như thế nào?

- Cấu hình đơn giản và logic hơn (một khi bạn hiểu nó). Thay vì các shell script rối rắm, `systemd` có các file cấu hình unit được viết theo một định dạng well-defined.

- Có các dependency tường minh giữa các service. Đây là một cải tiến lớn so với các số two-digit chỉ kiểm soát thứ tự thực thi các script.

- Dễ dàng đặt quyền và giới hạn tài nguyên cho từng service vì mục đích bảo mật.

- Nó có thể giám sát service và khởi động lại chúng khi cần.

- Các service được khởi động song song, giảm thời gian boot.

Không thể mô tả đầy đủ `systemd` ở đây. Cũng như với System V `init`, tôi sẽ tập trung vào các trường hợp sử dụng nhúng với các ví dụ dựa trên bản phát hành The Yocto Project 5.0 với `systemd` phiên bản 255.

### Build systemd với The Yocto Project và Buildroot

Daemon `init` mặc định trong The Yocto Project là System V. Để chọn `systemd`, hãy thêm dòng này vào `conf/local.conf`:

```
INIT_MANAGER = "systemd"
```

Buildroot mặc định dùng BusyBox `init`. Bạn có thể chọn `systemd` qua `menuconfig` bằng cách tìm trong menu System configuration \| Init system. Bạn cũng sẽ phải cấu hình toolchain dùng `glibc` cho thư viện C vì `systemd` không chính thức hỗ trợ `uClibc-ng` hay `musl`. Ngoài ra, có các hạn chế về phiên bản và cấu hình của kernel. Có một danh sách đầy đủ các dependency về thư viện và kernel trong file `README` ở cấp trên cùng của source code `systemd`.

### Giới thiệu target, service và unit

Trước khi mô tả cách `systemd` hoạt động, tôi cần giới thiệu ba khái niệm then chốt:

- Unit: Một file cấu hình mô tả một target, một service hoặc một số thứ khác. Unit là các file văn bản chứa các thuộc tính và giá trị.

- Service: Một daemon có thể được khởi động và dừng, giống như một service System V `init`.

- Target: Một nhóm service, tương tự như một runlevel System V `init`. Có một target mặc định gồm tất cả các service được khởi động lúc boot.

Bạn có thể thay đổi trạng thái và tìm hiểu điều gì đang diễn ra bằng lệnh `systemctl`.

#### Unit

Thành phần cấu hình cơ bản là unit file. Unit file được tìm thấy ở bốn nơi khác nhau:

- `/etc/systemd/system`: Cấu hình cục bộ

- `/run/systemd/system`: Cấu hình runtime

- `/usr/lib/systemd/system:` Cấu hình Distribution-wide (vị trí mặc định)

- `/lib/systemd/system`: Cấu hình Distribution-wide (vị trí mặc định cũ)

Khi tìm một unit, `systemd` tìm trong các thư mục này theo thứ tự trên, dừng ngay khi tìm thấy kết quả khớp. Bạn có thể ghi đè hành vi của một unit distribution-wide bằng cách đặt một unit cùng tên trong `/etc/systemd/system`. Bạn cũng có thể vô hiệu hóa hoàn toàn một unit bằng cách tạo một file cục bộ rỗng hoặc được link tới `/dev/null`.

Mọi unit file đều bắt đầu bằng một section được đánh dấu `[Unit]` chứa thông tin cơ bản và các dependency. Ví dụ, đây là section `Unit` của service D-Bus `/lib/systemd/system/dbus.service`:

```
[Unit]
Description=D-Bus System Message Bus
Documentation=man:dbus-daemon(1)
Requires=dbus.socket
```

Ngoài phần mô tả và một tham chiếu tới tài liệu, có một dependency vào unit `dbus.socket` được biểu đạt qua từ khóa `Requires`. Điều này báo cho `systemd` tạo một local socket khi service D-Bus được khởi động.

Dependency được biểu đạt bởi các từ khóa `Requires`, `Wants` và `Conflicts`:

- `Requires`: Một danh sách các unit mà unit này phụ thuộc vào; chúng được khởi động khi unit này được khởi động.

- `Wants`: Một dạng yếu hơn của `Requires`; unit này vẫn tiếp tục ngay cả khi bất kỳ dependency nào trong số này khởi động thất bại.

- `Conflicts`: Một dependency phủ định; các unit này bị dừng khi unit này được khởi động, và ngược lại, nếu một trong số chúng sau đó được khởi động lại, thì unit này bị dừng.

Ba từ khóa này định nghĩa các dependency đi ra (outgoing). Chúng được dùng để tạo dependency giữa các target. Có một tập dependency khác gọi là dependency đi vào (incoming), được dùng để tạo liên kết giữa service và target. Nói cách khác, dependency đi ra được dùng để tạo danh sách các target cần được khởi động khi hệ thống đi từ trạng thái này sang trạng thái khác, còn dependency đi vào được dùng để xác định các service cần được khởi động hoặc dừng khi vào bất kỳ trạng thái nào. Dependency đi vào được tạo bởi từ khóa `WantedBy`, mà tôi sẽ mô tả trong phần sắp tới, Adding your own service.

Việc xử lý các dependency tạo ra một danh sách các unit cần được khởi động hoặc dừng. Các từ khóa `Before` và `After` xác định thứ tự khởi động chúng. Thứ tự dừng đơn giản là đảo ngược của thứ tự khởi động:

- `Before`: Khởi động unit này trước các unit được liệt kê.

- `After`: Khởi động unit này sau các unit được liệt kê.

Ví dụ, directive `After` bảo đảm rằng web server sau được khởi động sau khi network subsystem được khởi động:

```
[Unit]
Description=Lighttpd Web Server
After=network.target
```

Khi không có directive `Before` hay `After`, các unit được khởi động hoặc dừng song song mà không có thứ tự.

#### Service

Một service là một daemon có thể được khởi động và dừng như một service System V `init`. Một service có một unit file với tên kết thúc bằng `.service`.

Một service unit có một section `[Service]` mô tả cách service nên được chạy. Đây là section `[Service]` từ `lighttpd.service`:

```
[Service]
ExecStart=/usr/sbin/lighttpd -f /etc/lighttpd/lighttpd.conf -D
ExecReload=/bin/kill -HUP $MAINPID
```

Đây là các lệnh cần chạy khi khởi động và khởi động lại service. Còn nhiều điểm cấu hình khác mà bạn có thể thêm vào đây, vì vậy hãy tham khảo manual page của `systemd.service(5)`.

#### Target

Một target là một unit nhóm các service hoặc các loại unit khác lại với nhau. Xét về mặt đó, một target là một metaservice và đóng vai trò một điểm đồng bộ. Một target chỉ có dependency. Target có tên kết thúc bằng `.target` như `multi-user.target`. Một target là một trạng thái mong muốn, thực hiện cùng vai trò như các runlevel System V `init`. Đây là `multi-user.target` đầy đủ:

```
[Unit]
Description=Multi-User System
Documentation=man:systemd.special(7)
Requires=basic.target
Conflicts=rescue.service rescue.target
After=basic.target rescue.service rescue.target
AllowIsolate=yes
```

Điều này nói rằng basic target phải được khởi động trước multi-user target. Điều này cũng nói rằng vì nó xung đột với rescue target, việc khởi động rescue target sẽ khiến multi-user target bị dừng trước. Rescue target và multi-user target không thể chạy đồng thời vì rescue target boot vào chế độ single-user. Kích hoạt rescue target chỉ có ý nghĩa trong quá trình khôi phục hệ thống.

### Cách systemd boot hệ thống

Hãy xem `systemd` hiện thực bootstrap như thế nào. Kernel khởi động `systemd` vì `/sbin/init` là symbolic link tới `/lib/systemd/systemd`. `systemd` chạy `default.target`, vốn luôn là một link tới target mong muốn: hoặc `multi-user.target` cho đăng nhập văn bản hoặc `graphical.target` cho môi trường đồ họa. Nếu target mặc định là `multi-user.target`, bạn sẽ thấy symbolic link này:

```
/etc/systemd/system/default.target -> /lib/systemd/system/multi-user.
target
```

Ghi đè target mặc định bằng cách truyền `system.unit=<new target>` trên kernel command line.

Để tìm target mặc định:

```
# systemctl get-default
multi-user.target
```

Khởi động một target như `multi-user.target` tạo ra một cây dependency đưa hệ thống vào trạng thái hoạt động. Trong một hệ thống điển hình, `multi-user.target` phụ thuộc vào `basic.target`, vốn phụ thuộc vào `sysinit.target`, vốn phụ thuộc vào các service cần được khởi động sớm.

Để in một đồ thị dạng văn bản của các dependency hệ thống:

```
# systemctl list-dependencies
```

Để liệt kê tất cả các service và trạng thái hiện tại của chúng:

```
# systemctl list-units --type service
```

Để liệt kê tất cả các target:

```
# systemctl list-units --type target
```

Giờ chúng ta đã thấy cây dependency của hệ thống, làm thế nào để chèn thêm một service?

### Thêm service của riêng bạn

Đây là một unit cho service `simpleserver` của chúng ta:

```
[Unit]
Description=Simple server

[Service]
Type=forking
ExecStart=/usr/bin/simpleserver

[Install]
WantedBy=multi-user.target
```

Bạn sẽ tìm thấy file `simpleserver.service` này trong `MELD/Chapter13/simpleserver-systemd`.

Section `[Unit]` chỉ chứa một mô tả hiển thị dưới `systemctl`. Không có dependency nào vì service này rất đơn giản.

Section `[Service]` trỏ tới file thực thi và có một cờ cho biết nó fork. Nếu `simpleserver` còn đơn giản hơn nữa và chạy ở foreground, `systemd` sẽ làm việc daemon hóa cho chúng ta và `Type=forking` sẽ không cần thiết.

Section `[Install]` tạo một dependency đi vào trên `multi-user.target` để server của chúng ta được khởi động khi hệ thống vào chế độ multi-user.

Khi bạn đặt file `simpleserver.service` vào thư mục `/etc/systemd/system`, bạn có thể khởi động và dừng service bằng các lệnh `systemctl start simpleserver` và `sytemctl stop` `simpleserver`. Bạn cũng có thể dùng `systemctl` để lấy trạng thái hiện tại của nó:

```
# systemctl status simpleserver
simpleserver.service - Simple server
  Loaded: loaded (/etc/systemd/system/simpleserver.service; disabled)
  Active: active (running) since Thu 1970-01-01 02:20:50 UTC; 8s ago
Main PID: 180 (simpleserver)
  CGroup: /system.slice/simpleserver.service
          └─180 /usr/bin/simpleserver -n

Jan 01 02:20:50 qemuarm systemd[1]: Started Simple server.
```

Tại thời điểm này, service chỉ khởi động và dừng theo lệnh. Để làm cho nó bền vững, bạn cần thêm một dependency cố định vào một target. Section `[Install]` nói rằng khi service này được enable, nó trở thành phụ thuộc vào `multi-user.target` để nó khởi động lúc boot.

Để enable service:

```
# systemctl enable simpleserver
Created symlink from /etc/systemd/system/multiuser.target.wants/
simpleserver.service to /etc/systemd/system/simpleserver.service.
```

Để cập nhật cây dependency của `systemd` mà không cần reboot:

```
# systemctl daemon-reload
```

Bạn cũng có thể thêm dependency vào service mà không cần sửa các target unit file. Một target có thể có một thư mục tên `<target_name>.target.wants` với các link tới service. Tạo một link bên trong thư mục này tương đương với việc thêm một unit vào danh sách `[Wants]` trong target. Lệnh `systemctl` `enable` `simpleserver` đã tạo link sau:

```
/etc/systemd/system/multi-user.target.wants/simpleserver.service -> /etc/
systemd/system/simpleserver.service
```

Bạn có thể muốn khởi động lại một service quan trọng nếu nó crash. Để làm được điều đó, hãy thêm cờ sau vào section `[Service]`:

```
Restart=on-abort
```

Các tùy chọn `Restart` khác là `on-success`, `on-failure`, `on-abnormal`, `on-watchdog` và `always`.

### Thêm một watchdog

Nhiều hệ thống nhúng cần một watchdog: bạn cần hành động nếu một service quan trọng ngừng hoạt động. Điều này thường có nghĩa là reboot hệ thống. Hầu hết các SoC nhúng có một hardware watchdog có thể được truy cập qua device node `/dev/watchdog`. Watchdog được khởi tạo với một timeout lúc boot. Nếu timer này không được reset trong khoảng thời gian timeout, watchdog bị kích hoạt và hệ thống reboot. Giao diện với watchdog driver được mô tả trong kernel source dưới `Documentation/watchdog/` và code của các driver nằm trong `drivers/watchdog/`.

Một vấn đề nảy sinh khi có hai hoặc nhiều service quan trọng cần được bảo vệ bởi một watchdog. `systemd` có một tính năng hữu ích phân phối watchdog giữa nhiều service. `systemd` có thể được cấu hình để mong đợi một lời gọi keepalive định kỳ từ một service và hành động khi không nhận được keepalive, tạo ra một software watchdog. Để điều này hoạt động, bạn cần thêm code vào daemon để gửi các thông điệp keepalive. Daemon đọc giá trị của biến môi trường `WATCHDOG_USEC` và gọi `sd_notify(false, "WATCHDOG=1")` trong khoảng thời gian này. Chu kỳ nên được đặt khoảng một nửa watchdog timeout. Có các ví dụ trong source code `systemd`.

Để bật software watchdog trong một service unit, hãy thêm thứ gì đó như sau vào section `[Service]`:

```
WatchdogSec=30s
Restart=on-watchdog
StartLimitInterval=5min
StartLimitBurst=4
StartLimitAction=reboot-force
```

Trong ví dụ này, service mong đợi một lời gọi keepalive mỗi 30 giây. Nếu keepalive không được gửi tới, service được khởi động lại, nhưng nếu nó bị khởi động lại hơn bốn lần trong 5 phút, `systemd` ngay lập tức reboot toàn bộ hệ thống. Có một mô tả đầy đủ về các thiết lập này trong manual page `systemd.service(5)`.

Một software watchdog lo cho từng service riêng lẻ, nhưng nếu chính `systemd` thất bại, kernel crash hoặc phần cứng bị treo thì sao? Trong những trường hợp đó, chúng ta cần bảo `systemd` dùng hardware watchdog. Thêm `RuntimeWatchdogSec=<N>` vào `/etc/systemd/system.conf`. Điều này sẽ reset watchdog trong khoảng thời gian `N` đã cho, để hệ thống reboot nếu `systemd` thất bại vì lý do nào đó. Đây sẽ là một hard reboot tức thì hay "reset" hệ thống mà không có quá trình tắt máy êm ái nào.

### Ý nghĩa đối với embedded Linux

`systemd` có rất nhiều tính năng hữu ích cho embedded Linux. Chương này chỉ đề cập một số trong đó. Các tính năng khác bao gồm kiểm soát tài nguyên (được mô tả trong các manual page của `systemd.slice(5)` và `systemd.resource-control(5)`), quản lý thiết bị (`udev(7)`), các tiện ích logging hệ thống (`journald(5)`), mount unit để auto-mounting filesystem và timer unit cho các job `cron`.

Bạn cần cân bằng các tính năng này với kích thước của `systemd`. Ngay cả một bản build tối giản chỉ gồm các thành phần lõi (`systemd`, `udevd` và `journald`) cũng gần tới 10 MB dung lượng lưu trữ bao gồm cả shared library.

Bạn cũng cần lưu ý rằng việc phát triển `systemd` bám sát kernel và `glibc`, vì vậy một bản phát hành `systemd` sẽ không hoạt động trên một kernel và `glibc` cũ hơn chính nó quá một hoặc hai năm.

## Tóm tắt

Mọi thiết bị Linux đều cần một chương trình `init` nào đó. Nếu bạn đang thiết kế một hệ thống chỉ cần khởi chạy một số ít daemon lúc khởi động, thì BusyBox `init` là đủ. BusyBox `init` cũng thường là một lựa chọn tốt nếu bạn đang dùng Buildroot làm build system.

Mặt khác, nếu bạn có một hệ thống với các dependency phức tạp giữa các service lúc boot hoặc lúc runtime, thì `systemd` là lựa chọn tốt nhất. Ngay cả khi không có độ phức tạp như vậy, `systemd` có một số tính năng hữu ích như watchdog, remote logging, v.v. Nếu bạn có đủ dung lượng lưu trữ, bạn nên nghiêm túc cân nhắc `systemd`.

Trong khi đó, System V `init` vẫn tồn tại. Nó được hiểu rõ và đã có sẵn các script `init` cho mọi thành phần quan trọng đối với chúng ta. System V vẫn là `init` mặc định cho distribution tham chiếu của The Yocto Project (Poky). Về thời gian boot, `systemd` nhanh hơn với các workload tương tự. Tuy nhiên, nếu bạn đang tìm cách boot nhanh nhất, không cái nào trong hai cái đánh bại BusyBox `init` đơn giản với các boot script tối giản.

## Tìm hiểu thêm

- systemd System and Service Manager – `https://systemd.io/`
