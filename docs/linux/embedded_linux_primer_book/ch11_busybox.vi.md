# Chương 11. BusyBox

## Trong chương này

- 11\.1 Giới thiệu BusyBox 290

- 11\.2 Cấu hình BusyBox 291

- 11\.3 Hoạt động BusyBox 293

- 11\.4 Tổng kết 303

Man page của BusyBox tuyên bố BusyBox là “Dao đa năng Thụy Sĩ

của Embedded Linux”. Mô tả này phù hợp vì BusyBox là phần thay thế nhỏ

và hiệu quả cho tập hợp lớn các tiện ích Linux command-line chuẩn.

Nó thường làm nền tảng cho embedded platform resource-limited.

Chương này giới thiệu BusyBox và cung cấp điểm khởi đầu tốt

để tùy chỉnh cài đặt BusyBox riêng.

Các chương trước đã đề cập BusyBox. Chương này trình bày chi tiết

package hữu ích này. Sau giới thiệu ngắn, chúng ta khám phá BusyBox

configuration utility, dùng điều chỉnh BusyBox theo yêu cầu

cụ thể. Sau đó thảo luận yêu cầu cross-compiling BusyBox

package.

Các vấn đề hoạt động BusyBox được xem xét, gồm cách dùng trong embedded

system. Chúng ta khảo sát initialization sequence và giải thích

khác biệt với System V initialization chuẩn. Chương này cũng trình

bày initialization script mẫu. Sau các bước cài BusyBox

trên target system, bạn sẽ tìm hiểu một số lệnh BusyBox và

giới hạn của chúng.

## 11.1 Giới thiệu BusyBox

BusyBox cực kỳ phổ biến trong cộng đồng embedded Linux. Nó rất dễ cấu hình, compile và dùng. Ngoài ra có tiềm năng giảm đáng kể tài nguyên hệ thống tổng thể cần hỗ trợ tập hợp lớn tiện ích Linux thông dụng. BusyBox cung cấp phần thay thế gọn cho nhiều tiện ích full-blown truyền thống trên phần lớn desktop và embedded Linux distribution. Ví dụ file utility `ls`, `cat`, `cp`, `dir`, `head`, `tail`; general utility `dmesg`, `kill`, `halt`, `fdisk`, `mount`, `umount`; và nhiều loại khác. BusyBox cũng hỗ trợ operation more-complex như `ifconfig`, `netstat`, `route` cùng network utility khác.

BusyBox có tính module, cấu hình cao và tùy chỉnh phù hợp yêu cầu cụ thể. Package có configuration utility tương tự dùng cấu hình Linux kernel nên sẽ khá quen thuộc.

Lệnh BusyBox thường là implementation đơn giản hơn bản full-blown tương ứng. Một số chỉ hỗ trợ tập con command-line option thông thường. Tuy nhiên thực tế bạn sẽ thấy tập con chức năng lệnh BusyBox quá đủ cho phần lớn yêu cầu embedded chung.

### 11.1.1 BusyBox dễ dùng

Nếu có thể cấu hình, build Linux kernel, bạn sẽ thấy cấu hình, build, cài BusyBox khá đơn giản. Các bước tương tự:

1\. Thực thi configuration utility và bật tính năng chọn.

2\. Chạy `make` build package.

3\. Cài binary cùng loạt symbolic link[^1] lên target system.

Có thể build, cài BusyBox trên development workstation hoặc target embedded system. Nó hoạt động tốt như nhau ở cả hai môi trường. Tuy nhiên khi cài trên development workstation, phải cẩn thận giữ riêng trong working directory để tránh ghi đè system startup file hoặc utility chính.

## 11.2 Cấu hình BusyBox

Để bắt đầu cấu hình BusyBox, lệnh giống Linux kernel cho configuration utility library-based `ncurses`. Chú ý tương tự Linux kernel, `make help` cung cấp nhiều thông tin hữu ích về make target sẵn có. Lệnh cấu hình là:

```
$ make menuconfig
```

Hình 11-1 cho cấu hình BusyBox top-level.

Dung lượng không cho phép trình bày từng configuration option. Tuy nhiên một số đáng đề cập. Các option quan trọng hơn nằm dưới Busybox Settings ---\> Build Options. Ở đây có option cần để cross-compile BusyBox application. Listing 11-1 trình bày option dưới Build Options trong BusyBox snapshot gần đây. Chọn Build Options từ configuration utility top-level của BusyBox để đến màn hình.

![Figure 11-1](images/ch11/fig11-01.png)

HÌNH 11-1 Menu cấu hình BusyBox Top-level

LISTING 11-1 BusyBox build option

```
[ ] Build BusyBox as a static binary (no shared libs)
[ ]   Build BusyBox as a position independent executable
[ ] Force NOMMU build
[ ] Build shared libbusybox
[*] Build with Large File Support (for accessing files > 2 GB)
()  Cross Compiler prefix
```

Option đầu hữu ích khi tạo embedded system rất tối thiểu. Nó cho compile, link BusyBox tĩnh để không cần dynamically loaded library (như `libc-*`) lúc runtime trên target system. Không có option, BusyBox cần nhiều library để chạy. Có thể dễ xác định library BusyBox (hoặc binary khác) cần trên target system bằng lệnh `ldd`. Listing 11-2 là output `ldd` được cross-compiled cho ARM xscale.

LISTING 11-2 Library dependency của BusyBox

```
$ xscale_be-ldd busybox
    linux-gate.so.1 =>  (0xb8087000)
    libm.so.6 => /lib/tls/i686/cmov/libm.so.6 (0xb804d000)
    libc.so.6 => /lib/tls/i686/cmov/libc.so.6 (0xb7efe000)
    /lib/ld-linux.so.2 (0xb8088000)
```

Chú ý BusyBox compile với cấu hình mặc định cần bốn shared library trong Listing 11-2. Nếu chọn build BusyBox static binary, `ldd` chỉ báo BusyBox binary không phải dynamic executable. Nói cách khác, không cần shared library giải quyết unresolved dependency nào trong executable. Static linking tạo footprint tổng nhỏ hơn trên root file system vì không cần shared library. Tuy nhiên build embedded application không có shared library nghĩa là các C library function quen thuộc không có sẵn cho ứng dụng. Để hình dung chênh lệch kích thước tương đối giữa BusyBox link tĩnh và cùng cấu hình compile với shared library, ở phiên bản gần đây busybox link tĩnh khoảng 1,5MB so với 778KB của dynamically linked image.

### 11.2.1 Cross-Compiling BusyBox

Như đầu chương, tác giả BusyBox định dùng package trong môi trường cross-development nên build ở đó khá dễ. Phiên bản trước chỉ cần chỉ định prefix cho cross-compiler bằng option build BusyBox với cross-compiler. Điều này đã được thay bằng phương pháp chuẩn hơn chỉ định environment variable tương tự build package khác như Linux kernel. Để cross-compile với cross-compiler cụ thể trên development workstation, chỉ định nghĩa `CROSS_COMPILE` trong environment. Ví dụ giá trị `CROSS_COMPILE` là `arm5vt_le-`, `xscale_be-`, `ppc_linux-`. Chú ý cũng có thể chỉ định cross-compiler prefix trong configuration utility vừa mô tả. Chúng ta trình bày compiler prefix liên quan cross-compiling chi tiết hơn ở chương sau khi khảo sát embedded development environment.

## 11.3 Hoạt động BusyBox

Khi build BusyBox, thu được binary tên—đúng như đoán—`BusyBox`. Có thể gọi BusyBox từ chính binary name nhưng thường chạy qua symlink. Khi gọi không có command-line parameter, nó tạo danh sách function bật qua configuration. Listing 11-3 cho output như vậy (được format vừa trang).

LISTING 11-3 Cách dùng BusyBox

```
root@coyote # busybox
BusyBox v1.13.2 (2010-02-24 16:04:14 EST) multi-call binary
Copyright (C) 1998-2008 Erik Andersen, Rob Landley, Denys Vlasenko and
others. Licensed under GPLv2.
See source distribution for full notice.

Usage: busybox [function] [arguments]...
   or: function [arguments]...

    BusyBox is a multi-call binary that combines many common Unix
    utilities into a single executable.  Most people will create a link
    to busybox for each function they wish to use and BusyBox will act
    like whatever it was invoked as!

Currently defined functions:
    [, [[, addgroup, adduser, ar, ash, awk, basename, blkid, bunzip2,
    bzcat, cat, chattr, chgrp, chmod, chown, chpasswd, chroot, chvt,
    clear, cmp, cp, cpio, cryptpw, cut, date, dc, dd, deallocvt,
    delgroup, deluser, df, dhcprelay, diff, dirname, dmesg, du,
    dumpkmap, dumpleases, echo, egrep, env, expr, false, fbset,
    fbsplash, fdisk, fgrep, find, free, freeramdisk, fsck, fsck.minix,
    fuser, getopt, getty, grep, gunzip, gzip, halt, head, hexdump,
    hostname, httpd, hwclock, id, ifconfig, ifdown, ifup, init, insmod,
    ip, kill, killall, klogd, last, less, linuxrc, ln, loadfont,
    loadkmap, logger, login, logname, logread, losetup, ls, lsmod,
    makedevs, md5sum, mdev, microcom, mkdir, mkfifo, mkfs.minix, mknod,
    mkswap, mktemp, modprobe, more, mount, mv, nc, netstat, nice,
    nohup, nslookup, od, openvt, passwd, patch, pidof, ping, ping6,
    pivot_root, poweroff, printf, ps, pwd, rdate, rdev, readahead,
    readlink, readprofile, realpath, reboot, renice, reset, rm, rmdir,
    rmmod, route, rtcwake, run-parts, sed, seq, setconsole, setfont,
    sh, showkey, sleep, sort, start-stop-daemon, strings, stty, su,
    sulogin, swapoff, swapon, switch_root, sync, sysctl, syslogd, tail,
    tar, tee, telnet, telnetd, test, tftp, time, top, touch, tr,
    traceroute, true, tty, udhcpc, udhcpd, umount, uname, uniq, unzip,
    uptime, usleep, vi, vlock, watch, wc, wget, which, who, whoami,
    xargs, yes, zcat
```

Từ Listing 11-3 thấy danh sách function bật trong BusyBox build này. Chúng theo thứ tự chữ cái (bỏ qua shell scripting operator `[` và `[[`) từ `addgroup` đến `zcat`, tiện ích giải nén nội dung compressed file. Danh sách biểu diễn tập tiện ích bật trong bản build cụ thể.

Để gọi function cụ thể, thực thi `busybox` với function đã định nghĩa trên command line. Ví dụ hiển thị danh sách file trong root directory bằng lệnh:

```
[root@coyote]# busybox ls /
```

Thông điệp quan trọng khác từ usage message BusyBox trong Listing 11-3 là mô tả ngắn chương trình. Nó mô tả BusyBox như multicall binary kết hợp nhiều utility thông dụng trong một executable. Đây là mục đích các symlink nói trước. BusyBox được thiết kế gọi bằng symlink đặt tên theo function thực hiện. Điều này bỏ gánh nặng gõ lệnh two-word để gọi function và cho user tập lệnh quen thuộc của utility cùng tên. Listing 11-4 và 11-5 làm rõ điều này.

Listing 11-4 cho target directory structure do BusyBox package tạo qua lệnh `make install` trong source tree `busybox`.

LISTING 11-4 BusyBox symlink structure từ `make install`

```
[root@coyote]$ ls -l /
total 12
drwxrwxr-x  2 root   root 4096 Dec  3 13:38 bin
lrwxrwxrwx  1 root   root   11 Dec  3 13:38 linuxrc -> bin/busybox
drwxrwxr-x  2 root   root 4096 Dec  3 13:38 sbin
drwxrwxr-x  4 root   root 4096 Dec  3 13:38 usr
```

Executable file `busybox` nằm trong directory `/bin`, symlink được tạo khắp phần cấu trúc còn lại trỏ về `/bin/busybox`. Listing 11-5 mở rộng directory structure của Listing 11-4.

LISTING 11-5 BusyBox symlink structure: Chi tiết tree

```
[root@coyote]$ tree
.
|-- bin
|   |-- addgroup -> busybox
|   |-- busybox
|   |-- cat -> busybox
|   |-- cp -> busybox
<...>
|   ‘-- zcat -> busybox
|-- linuxrc -> bin/busybox
|-- sbin
|   |-- halt -> ../bin/busybox
|   |-- ifconfig -> ../bin/busybox
|   |-- init -> ../bin/busybox
|   |-- klogd -> ../bin/busybox
<...>
|   ‘-- syslogd -> ../bin/busybox
‘-- usr
    |-- bin
    |   |-- [ -> ../../bin/busybox
    |   |-- basename -> ../../bin/busybox
<...>
    |   |-- xargs -> ../../bin/busybox
    |   ‘-- yes -> ../../bin/busybox
    ‘-- sbin
        ‘-- chroot -> ../../bin/busybox
```

Output Listing 11-5 được cắt đáng kể để dễ đọc và tránh listing three-page. Mỗi dòng có dấu ba chấm (`...`) chỉ nơi listing cắt để chỉ hiện vài entry đầu, cuối của directory đó. Thực tế có thể tạo hơn 100 symlink trong các directory, tùy chức năng bật bằng BusyBox configuration utility.

Chú ý BusyBox executable, entry thứ hai của directory `/bin`. Cũng trong `/bin` có symlink trỏ lại busybox cho `addgroup`, `cat`, `cp`, v.v. đến `zcat`. Một lần nữa entry giữa `cp` và `zcat` bỏ để dễ đọc. Với symlink structure này, user chỉ nhập tên utility thực để gọi chức năng. Ví dụ cấu hình network interface bằng tiện ích BusyBox `ifconfig`, user có thể nhập:

```
$ ifconfig eth1 192.168.1.14
```

Điều này gọi BusyBox executable qua symlink `ifconfig`. BusyBox kiểm tra cách được gọi, tức đọc `argv[0]` để biết chức năng được yêu cầu.

### 11.3.1 BusyBox init

Chú ý symlink trong Listing 11-5 tên `init`. Chương 6, “Khởi tạo user space”, giới thiệu chương trình `init` và vai trò khởi tạo hệ thống. Nhớ kernel cố thực thi chương trình `/sbin/init` làm bước cuối khởi tạo kernel. Không có lý do BusyBox không thể mô phỏng chức năng `init`, và đó chính là cách cấu hình hệ thống Listing 11-5. BusyBox xử lý chức năng `init`.

BusyBox xử lý khởi tạo hệ thống khác System V `init` chuẩn. Linux system dùng System V (SysV) initialization như Chương 6 cần file `inittab` truy cập được trong directory `/etc`. BusyBox cũng đọc file `inittab` nhưng cú pháp file `inittab` khác. Nhìn chung không cần dùng `inittab` nếu dùng BusyBox. Cân nhắc lời khuyên man page: nếu cần runlevel, dùng System V initialization.[^2]

Hãy xem trên embedded system. Chúng ta tạo root file system nhỏ dựa BusyBox, cấu hình static linking để không cần shared library. Listing 11-6 là listing `tree` của root file system. Chúng ta tạo file system nhỏ theo các bước Chương 9, “File system”, Phần 9.11, “Tạo file system đơn giản”. Không lặp lại quy trình ở đây. File trong file system đơn giản thể hiện ở Listing 11-6.

LISTING 11-6 Root file system BusyBox tối thiểu

```
$ tree
.
|-- bin
|   |-- busybox
|   |-- cat -> busybox
|   |-- dmesg -> busybox
|   |-- echo -> busybox
|   |-- hostname -> busybox
|   |-- ls -> busybox
|   |-- ps -> busybox
|   |-- pwd -> busybox
|   ‘-- sh -> busybox
|-- dev
|   ‘-- console
|-- etc
‘-- proc
4 directories, 10 files
```

Root file system BusyBox-based này chiếm hơn chút so với kích thước chính `busybox`. Trong cấu hình dùng static linking và gần 100 utility, BusyBox executable dưới 2MB:

```
# ls -l /bin/busybox
-rwxr-xr-x 1 chris chris 1531600 2010-01-28 15:49 /bin/busybox
```

Giờ xem hành vi hệ thống. Listing 11-7 ghi console output lúc power-up trên embedded system BusyBox-based.

LISTING 11-7 Khởi động mặc định BusyBox

```
...
Looking up port of RPC 100003/2 on 192.168.1.9
Looking up port of RPC 100005/1 on 192.168.1.9
VFS: Mounted root (nfs filesystem).
Freeing init memory: 96K
Bummer, could not run ‘/etc/init.d/rcS’: No such file or directory

Please press Enter to activate this console.


BusyBox v1.01 (2005.12.03-19:09+0000) Built-in shell (ash)
Enter ‘help’ for a list of built-in commands.

-sh: can’t access tty; job control turned off
/ #
```

Listing 11-7 chạy trên embedded board cấu hình NFS root mount. Export directory trên workstation chứa file system image đơn giản của Listing 11-6. Là bước gần cuối boot process, Linux kernel trên target board mount root file system qua NFS. Khi kernel cố thực thi `/sbin/init`, nó thất bại (có chủ ý) vì không có `/sbin/init` trong file system. Tuy nhiên như đã thấy kernel cũng thử `/bin/sh`. Trên target BusyBox-configured, điều này thành công và `busybox` chạy qua symlink `/bin/sh` trên root file system.

Điều đầu BusyBox làm là phàn nàn không tìm thấy `/etc/init.d/rcS`. Đây là initialization script mặc định nó tìm. Thay vì `inittab`, đây là phương pháp ưu tiên khởi tạo embedded system dựa BusyBox.

Khởi tạo xong, BusyBox hiển thị prompt yêu cầu user nhấn Enter kích hoạt console. Khi phát hiện Enter, nó thực thi shell session `ash` đợi input. Thông báo cuối về job control xuất phát từ việc trong ví dụ này (và phần lớn embedded system điển hình), tạo system console trên serial terminal. Linux kernel có code tắt job control nếu phát hiện console trên serial terminal.

Ví dụ tạo hệ thống hoạt động với gần 100 Linux utility gồm core utility, file utility, network support và shell khá có khả năng. Bạn thấy package đơn giản cung cấp platform mạnh để xây dựng system application riêng. Tất nhiên nếu không hỗ trợ libc và system library khác, bạn đối mặt tác vụ triển khai ứng dụng rất khó. Phải hỗ trợ mọi standard C library call và library function khác mà chương trình C điển hình dựa vào. Hoặc link tĩnh ứng dụng với library phụ thuộc, nhưng nếu có hơn vài ứng dụng như vậy, kích thước có thể vượt tổng kích thước link động và giữ shared library trên target.

### 11.3.2 Initialization script rcS mẫu

Trước khi BusyBox sinh interactive shell, nó cố thực thi lệnh từ script `/etc/init.d/rcS` như Listing 11-7. Đây là nơi ứng dụng vào hoạt động trong BusyBox system. Script khởi tạo `rcS` đơn giản có ở Listing 11-8.

LISTING 11-8 Startup script `rcS` đơn giản cho BusyBox

```
#!/bin/sh

echo “Mounting proc”
mount -t proc /proc /proc

echo “Starting system loggers”
syslogd
klogd

echo “Configuring loopback interface”
ifconfig lo 127.0.0.1

echo “Starting inetd”
xinetd

# start a shell
busybox sh
```

Script đơn giản này phần lớn self-explanatory. Đầu tiên quan trọng là mount file system `/proc` tại mount point dành riêng `/proc`, vì nhiều utility lấy thông tin từ file system `/proc`. Điều này giải thích kỹ hơn trong Chương 9. Tiếp theo chạy system logger sớm nhất có thể để ghi lại vấn đề startup. Sau system log daemon, cấu hình local loopback interface cho hệ thống. Một lần nữa, nhiều Linux facility truyền thống giả định có loopback interface, và nếu hệ thống có cấu hình hỗ trợ socket thì nên bật interface này. Việc cuối trước khi mở shell là chạy Internet superserver `xinetd`. Chương trình chạy nền, lắng nghe network request trên mọi network interface cấu hình. Ví dụ để bắt đầu telnet session tới board, `xinetd` tiếp nhận request telnet connection và sinh telnet server xử lý session.

Thay vì mở shell, có thể chạy ứng dụng riêng từ initialization script `rcS`. Listing 11-8 là ví dụ đơn giản target board telnet-enabled chạy dịch vụ cơ bản như system logger và kernel logger.

### 11.3.3 Cài BusyBox lên target

Chỉ có thể thảo luận cài BusyBox khi hiểu cách dùng và mục đích symlink. BusyBox makefile chứa target install. Thực thi `make install` tạo directory structure chứa BusyBox executable và symlink tree. Môi trường này cần chuyển tới root directory target embedded system, đầy đủ symlink tree. Như giải thích, symlink tree bỏ yêu cầu gõ `busybox` `command` cho mỗi lệnh. Thay vào đó, để liệt kê file trong directory, user chỉ gõ `ls`. Symlink thực thi BusyBox như mô tả và gọi chức năng `ls`. Xem lại Listing 11-4 và 11-5. Chú ý BusyBox build system chỉ tạo link cho chức năng bật qua configuration utility.

Cách dễ nhất tạo symlink farm cần trong root file system là để BusyBox build system thực hiện. Chỉ mount root file system trên development workstation và truyền `CONFIG_PREFIX` cho BusyBox makefile. Listing 11-9 cho quy trình.

LISTING 11-9 Cài BusyBox trên root file system

```
$ mount -o loop bbrootfs.ext2 /mnt/remote
$ make CONFIG_PREFIX=/mnt/remote install
  /mnt/remote/bin/ash -> busybox
  /mnt/remote/bin/cat -> busybox
  /mnt/remote/bin/chgrp -> busybox
  /mnt/remote/bin/chmod -> busybox
  /mnt/remote/bin/chown -> busybox
...
  /mnt/remote/usr/bin/xargs -> ../../bin/busybox
  /mnt/remote/usr/bin/yes -> ../../bin/busybox
  /mnt/remote/usr/sbin/chroot -> ../../bin/busybox


--------------------------------------------------
You will probably need to make your busybox binary
setuid root to ensure all configured applets will
work properly.
--------------------------------------------------

$ chmod +s /mnt/remote/bin/busybox
$ ls -l /mnt/remote/bin/busybox
-rwsr-sr-x  1 root root 552132  ... /mnt/remote/bin/busybox
```

Đầu tiên mount root file system binary image vào mount point mong muốn—ở đây `/mnt/remote`, vị trí tôi thích. Sau đó gọi lệnh BusyBox `make install`, truyền `CONFIG_PREFIX` chỉ nơi đặt symlink tree và BusyBox executable file. Dù không rõ từ listing, makefile gọi script `applets/install.sh` làm phần lớn việc. Script duyệt file chứa mọi BusyBox applet bật và tạo symlink cho từng applet trên path đã chỉ bằng `CONFIG_PREFIX`. Script rất nhiều lời, xuất một dòng cho từng symlink tạo. Để ngắn gọn Listing 11-9 chỉ hiện vài thông báo đầu, cuối. Dấu ba chấm biểu diễn phần bỏ.

Thông báo setuid cũng do install script hiển thị để nhắc có thể cần đặt BusyBox executable thành setuid root. Điều này cho function cần root access hoạt động đúng ngay cả khi nonroot user gọi. Không bắt buộc tuyệt đối, đặc biệt trong embedded Linux nơi thường chỉ có root account. Nếu cần cho cài đặt, lệnh (`chmod +s`) được thể hiện trong Listing 11-9.

Kết quả bước cài là BusyBox binary và symlink tree được cài trên target root file system. Kết quả cuối rất giống Listing 11-4.

Hữu ích khi biết BusyBox còn có option bật tạo symlink tree trên target system lúc runtime. Option bật trong configuration và gọi lúc runtime bằng BusyBox với option `-install`. Phải mount file system `/proc` trên target để hỗ trợ này hoạt động.

### 11.3.4 BusyBox applet

Trong BusyBox snapshot gần đây, man page ghi 282 lệnh (còn gọi applet). Có đủ hỗ trợ cho shell script tương đối phức tạp, gồm Bash shell scripting. BusyBox hỗ trợ `awk`, `sed`, thường gặp trong Bash script. Hỗ trợ network utility như `ping`, `ifconfig`, `traceroute`, `netstat`. Một số lệnh đưa vào riêng để hỗ trợ scripting, gồm `true`, `false`, `yes`.

Dành ít phút xem Phụ lục C, “Các lệnh BusyBox”, nơi có tổng quan từng lệnh. Sau đó bạn hiểu rõ hơn khả năng BusyBox và tính phù hợp cho embedded Linux project riêng.

Như đầu chương, nhiều lệnh BusyBox có tập con tính năng, option giới hạn so với bản full-featured tương ứng. Nhìn chung có thể nhận help cho lệnh lúc runtime bằng option `--help`. Nó sinh usage message mô tả ngắn từng command option hỗ trợ. Applet BusyBox `gzip` là ví dụ hữu ích về lệnh hỗ trợ option hạn chế. Listing 11-10 hiển thị output `gzip -help` trên BusyBox target.

LISTING 11-10 Cách dùng applet BusyBox `gzip`

```
/ # gzip --help
BusyBox v1.13.2 (2010-02-24 16:04:14 EST) multi-call binary

Usage: gzip [OPTION]... [FILE]...

Compress FILEs (or standard input)

Options:
        -c      Write to standard output
        -d      Decompress
        -f      Force
```

Phiên bản BusyBox của `gzip` chỉ hỗ trợ ba command-line option. Bản full-featured hỗ trợ hơn 15 command-line option khác nhau. Ví dụ tiện ích full-featured `gzip` hỗ trợ option `--list` tạo compression statistic cho từng file trên command line. Không có hỗ trợ đó cho BusyBox `gzip`. Thường đây không là giới hạn đáng kể cho embedded system. Trình bày để bạn lựa chọn sáng suốt khi quyết định BusyBox. Khi cần đầy đủ khả năng utility, giải pháp đơn giản: bỏ hỗ trợ utility đó trong BusyBox configuration và thêm Linux utility chuẩn vào target system. Nhờ vậy có thể kết hợp BusyBox utility và Linux utility chuẩn trên cùng embedded system.

## 11.4 Tổng kết

Chương mô tả BusyBox, một tiện ích phổ biến nhất trong embedded Linux. BusyBox còn có chỗ trong desktop, server distribution như phần rescue image và initial ramdisk thường gặp. Chương trình bày cách cấu hình, build, cài tiện ích quan trọng. Cũng khảo sát khác biệt khởi tạo hệ thống khi dùng hệ thống BusyBox-based.

- BusyBox là công cụ mạnh cho embedded system thay nhiều Linux utility thông dụng trong một multicall binary.

- BusyBox có thể giảm đáng kể kích thước root file system image.

- BusyBox dễ dùng, nhiều tính năng hữu ích.

- Cấu hình BusyBox đơn giản, dùng interface tương tự cấu hình Linux.

- BusyBox có thể cấu hình làm ứng dụng link tĩnh hoặc động tùy yêu cầu cụ thể.

- Khởi tạo hệ thống hơi khác với BusyBox; chương đã trình bày khác biệt.

- BusyBox hỗ trợ nhiều lệnh. Phụ lục C liệt kê mọi lệnh sẵn có từ release gần đây.

### 11.4.1 Gợi ý đọc thêm

Trang chủ dự án BusyBox www.busybox.net/

Man page BusyBox www.busybox.net/downloads/BusyBox.html

[^1]: Chúng ta sẽ trình bày chi tiết symbolic link ngay sau đây.

[^2]: Chúng ta đã trình bày chi tiết System V initialization trong Chương 6.
