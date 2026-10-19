# Phụ lục C. Các lệnh BusyBox

BusyBox có nhiều lệnh hữu ích. Bảng C-1 liệt kê các lệnh được ghi trong tài liệu BusyBox snapshot gần đây.

BẢNG C-1 Các lệnh BusyBox có tài liệu

| Lệnh | Mô tả |
|---|---|
| `adduser` | Thêm user |
| `adjtimex` | Đọc, tùy chọn đặt system timebase parameter |
| `ar` | Trích xuất hoặc liệt kê FILES từ archive `ar` |
| `arp` | Thao tác ARP cache |
| `arping` | Gửi ARP request/reply |
| `ash` | Shell nhỏ, thường mặc định |
| `basename` | Bỏ directory path, hậu tố khỏi FILE |
| `bbconfig` | In config file đã build BusyBox |
| `bbsh` | Shell bbsh (command interpreter) |
| `blkid` | In UUID mọi file system |
| `brctl` | Quản lý Ethernet bridge |
| `bunzip2` | Giải nén FILE |
| `busybox` | Xin chào thế giới! |
| `bzcat` | Giải nén ra stdout |
| `bzip2` | Nén FILE(s) bằng thuật toán bzip2 |
| `cal` | Hiển thị lịch |
| `cat` | Nối FILE(s), in ra stdout |
| `catv` | Hiển thị ký tự không in được dạng \^x hoặc M\\-x |
| `chat` | Hữu ích tương tác modem nối stdin/stdout |
| `chattr` | Đổi file attribute trên ext2 fs |
| `chcon` | Đổi security context mỗi FILE thành CONTEXT |
| `chgrp` | Đổi group membership mỗi FILE thành GROUP |
| `chmod` | Đổi permission file |
| `chown` | Đổi owner và/hoặc group mỗi FILE thành OWNER và/hoặc GROUP |
| `chpasswd` | Đọc user:password từ stdin, cập nhật /etc/passwd tương ứng |
| `chpst` | Đổi process state, chạy PROG |
| `chroot` | Chạy COMMAND với root directory đặt NEWROOT |
| `chrt` | Thao tác attribute real-time của process |
| `chvt` | Đổi foreground virtual terminal sang /dev/ttyN |
| `cksum` | Tính CRC32 checksum FILES |
| `clear` | Xóa màn hình |
| `cmp` | So FILE1 với stdin nếu không chỉ FILE2 |
| `comm` | So FILE1 với FILE2 hoặc stdin nếu chỉ - |
| `cp` | Copy SOURCE tới DEST hoặc nhiều SOURCE(s) tới DIRECTORY |
| `cpio` | Trích xuất/liệt kê file từ cpio archive hoặc tạo cpio archive |
| `crond` | Daemon thực thi lệnh theo lịch |
| `crontab` | Duy trì crontab file từng user |
| `cryptpw` | Xuất string đã mã hóa |
| `cttyhack` | In field chọn từ mỗi input FILE ra standard output |
| `date` | Hiển thị giờ (dùng +FMT) hoặc đặt giờ |
| `dc` | Máy tính RPN nhỏ |
| `dd` | Copy file có chuyển đổi, format |
| `deallocvt` | Giải phóng virtual terminal /dev/ttyN không dùng |
| `delgroup` | Xóa group GROUP khỏi hệ thống hoặc user USER khỏi GROUP |
| `deluser` | Xóa USER khỏi hệ thống |
| `depmod` | Quản lý devfs permission và symlink tên device cũ |
| `devmem` | Read/write physical address |
| `df` | In thống kê sử dụng file system |
| `dhcprelay` | Chuyển DHCP request từ client device tới server device |
| `diff` | So file từng dòng, xuất khác biệt |
| `dirname` | Bỏ hậu tố không phải directory khỏi FILENAME |
| `dmesg` | In hoặc điều khiển kernel ring buffer |
| `dnsd` | DNS server daemon tĩnh nhỏ |
| `dos2unix` | Chuyển FILE từ DOS sang UNIX format |
| `dpkg` | Cài, remove, quản lý Debian package |
| `dpkg-deb` | Thực hiện action trên Debian package (.debs) |
| `du` | Tổng hợp disk space từng FILE và/hoặc directory dùng |
| `dumpkmap` | In binary keyboard translation table ra standard output |
| `dumpleases` | Hiển thị DHCP lease udhcpd cấp |
| `e2fsck` | Kiểm tra ext2/ext3 file system |
| `echo` | In ARGs chỉ định ra stdout |
| `ed` | Đẩy DEVICE chỉ định ra (hoặc mặc định /dev/cdrom) |
| `env` | In environment hiện tại hoặc chạy chương trình sau thiết lập |
| `envdir` | Đặt nhiều environment variable theo file chỉ định |
| `envuidgid` | Đặt $UID bằng UID account, $GID bằng GID account, chạy PROG |
| `ether-wake` | Gửi magic packet wake máy đang sleep |
| `expand` | Chuyển tab thành space, ghi standard output |
| `expr` | In giá trị EXPRESSION ra standard output |
| `fakeidentd` | Cung cấp ident (auth) service giả |
| `FALSE` | Trả exit code FALSE (1) |
| `fbset` | Hiện, sửa frame buffer setting |
| `fbsplash` | Splash image |
| `fdflush` | Ép floppy disk drive phát hiện đổi disk |
| `fdformat` | Format floppy disk |
| `fdisk` | Đổi partition table |
| `fgrep` | Tìm file |
| `findfs` | Tìm file system device theo label/UUID |
| `fold` | Ngắt input line trong mỗi FILE (mặc định standard input) |
| `free` | Hiển thị system memory trống, đã dùng |
| `freeramdisk` | Giải phóng mọi memory ramdisk chỉ định dùng |
| `fsck` | Kiểm tra, sửa file system |
| `fsck.minix` | Kiểm tra MINIX file system |
| `ftpget` | Lấy remote file qua FTP |
| `ftpput` | Lưu local file trên remote machine qua FTP |
| `fuser` | Tìm process dùng FILEs/PORTs |
| `getenforce` | Parse command option |
| `getsebool` | Lấy SELinux boolean value |
| `getty` | Mở tty, nhắc login name rồi gọi /bin/login |
| `grep` | Tìm PATTERN trong mỗi FILE hoặc standard input |
| `gunzip` | Giải nén FILEs (hoặc standard input) |
| `gzip` | Nén FILEs (hoặc standard input) |
| `halt` | Halt hệ thống |
| `hd` | hd là alias hexdump |
| `hdparm` | Get/set hd device parameter |
| `head` | In mười dòng đầu mỗi FILE ra standard output |
| `hexdump` | Hiển thị file hoặc standard input theo format user-specified |
| `hostid` | In identifier 32-bit duy nhất của machine |
| `hostname` | Lấy, đặt hostname/DNS domain name |
| `httpd` | Nghe incoming HTTP request |
| `hush` | Query, đặt hardware clock (RTC) |
| `id` | In thông tin USER hoặc current user |
| `ifconfig` | Cấu hình network interface |
| `ifdown` | Tắt network interface |
| `ifenslave` | Cấu hình network interface cho parallel routing |
| `ifup` | Bật network interface |
| `inetd` | Nghe network connection, chạy chương trình |
| `init` | init là parent mọi process |
| `inotifyd` | Sinh user space agent khi file system đổi |
| `insmod` | Load kernel module chỉ định vào kernel |
| `install` | Copy file, đặt attribute |
| `ip` | Hiện/thao tác routing, device, policy routing, tunnel |
| `ipaddr` | ipaddr {add \| delete} IFADDR dev STRING |
| `ipcalc` | Tính IP network setting từ IP address |
| `ipcrm` | Option hoa MQS remove object theo shmkey value |
| `ipcs` | Cung cấp thông tin ipc facility |
| `iplink` | iplink set DEVICE { up \| down \| arp \| multicast { on \| off } |
| `iproute` | iproute { list \| flush } SELECTOR |
| `iprule` | iprule \[list \| add \| del\] SELECTOR ACTION |
| `iptunnel` | iptunnel { add \| change \| del \| show } \[NAME\] |
| `kbd_mode` | Báo hoặc đặt keyboard mode |
| `kill` | Gửi signal (mặc định TERM) tới PID cho |
| `killall` | Gửi signal (mặc định TERM) tới process cho |
| `killall5` | Gửi signal (mặc định TERM) mọi process ngoài current session |
| `klogd` | Kernel logger |
| `lash` | lash deprecated nên dùng hush |
| `last` | Liệt kê user login hệ thống gần nhất |
| `length` | In độ dài STRING |
| `less` | Xem file/danh sách file |
| `linux32` | Tạo link tên LINK\_NAME hoặc DIRECTORY tới TARGET chỉ định |
| `load_policy` | Load console font từ standard input |
| `loadkmap` | Load binary keyboard translation table từ standard input |
| `logger` | Ghi MESSAGE vào system log |
| `login` | Bắt đầu session mới trên hệ thống |
| `logname` | In current user name |
| `logread` | Hiện message trong circular buffer syslogd |
| `losetup` | Thiết lập, điều khiển loop device |
| `lpd` | SPOOLDIR phải chứa device node/directory (hoặc symlink tới chúng) |
| `lpq` | Line printer daemon |
| `lpr` | Line printer từ xa |
| `ls` | Liệt kê directory content |
| `lsattr` | Liệt kê file attribute trên ext2 fs |
| `lsmod` | Liệt kê kernel module đang load |
| `lzmacat` | Giải nén ra stdout |
| `makedevs` | Tạo dải special file theo device table |
| `makemime` | Tạo message MIME-encoded |
| `man` | Format, hiển thị manual page |
| `matchpathcon` | Lấy default SELinux security context |
| `md5sum` | In hoặc kiểm tra MD5 checksum |
| `mdev` | Implementation Mini-udev |
| `mesg` | Điều khiển quyền ghi vào terminal |
| `microcom` | Copy byte từ stdin tới TTY và TTY tới stdout |
| `mkdir` | Tạo DIRECTORY |
| `mke2fs` | Tạo ext2/ext3 file system |
| `mkfifo` | Tạo named pipe (giống `mknod name p`) |
| `mkfs.minix` | Tạo MINIX file system |
| `mknod` | Tạo special file (block, character, pipe) |
| `mkswap` | Chuẩn bị block device làm swap partition |
| `mktemp` | Tạo file tạm |
| `modprobe` | Thêm hoặc bỏ module vào/khỏi Linux kernel |
| `more` | Xem FILE/standard input từng màn hình |
| `mount` | Mount file system |
| `mountpoint` | Kiểm tra directory là mountpoint không |
| `msh` | Điều khiển hoạt động magnetic tape drive |
| `mv` | Đổi SOURCE thành DEST hoặc chuyển SOURCE(s) tới DIRECTORY |
| `nameif` | Đổi tên network interface khi down |
| `nc` | Dao đa năng TCP/IP |
| `netstat` | Hiển thị networking information |
| `nice` | Chạy chương trình với scheduling priority sửa |
| `nmeter` | Theo dõi hệ thống real time |
| `nohup` | Chạy lệnh miễn nhiễm hangup, output tới non-tty |
| `nslookup` | Query nameserver IP address của HOST |
| `od` | Ghi biểu diễn rõ ràng FILE |
| `openvt` | Chạy COMMAND trên virtual terminal mới |
| `parse` | Parse token |
| `passwd` | Đổi user password |
| `patch` | Áp diff file vào bản gốc |
| `pgrep` | Hiện process chọn theo regex pattern |
| `pidof` | Liệt kê PID mọi process tên khớp NAMEs |
| `ping` | Gửi ICMP ECHO\_REQUEST packet tới network host |
| `ping6` | Gửi ICMP ECHO\_REQUEST packet tới network host |
| `pipe_progress` | Chuyển current root file system tới PUT\_OLD và tạo NEW\_ROOT |
| `pkill` | Gửi signal tới process chọn theo regex pattern |
| `popmaildir` | Lấy remote mailbox content vào local maildir |
| `poweroff` | Halt, tắt nguồn |
| `printenv` | In toàn bộ/một phần environment |
| `printf` | Format, in ARGUMENT(s) theo FORMAT |
| `ps` | Báo process status |
| `pscan` | Scan host, in mọi open port |
| `pwd` | In full filename current working directory |
| `raidautorun` | Báo kernel tự tìm, khởi động RAID array |
| `rdate` | Lấy, có thể đặt system date/time từ remote HOST |
| `rdev` | In device node gắn file system mount tại `/` |
| `readahead` | Preload FILE(s) vào RAM cache để lần đọc sau không block disk I/O |
| `readlink` | Hiển thị symlink value |
| `readprofile` | Đọc kernel profiling information |
| `realpath` | Trả absolute pathname của argument |
| `reboot` | Reboot hệ thống |
| `reformime` | Parse message MIME-encoded |
| `renice` | Đổi priority process đang chạy |
| `reset` | Reset màn hình |
| `resize` | Resize màn hình |
| `restorecon` | Reset security context file dưới pathname |
| `rm` | Remove (unlink) file |
| `rmdir` | Remove DIRECTORY nếu trống |
| `rmmod` | Unload kernel module chỉ định khỏi kernel |
| `route` | Sửa kernel routing table |
| `rpm` | Thao tác RPM package |
| `rpm2cpio` | Xuất cpio archive của rpm file |
| `rtcwake` | Vào system sleep state tới wakeup time chỉ định |
| `run-parts` | Chạy tập script trong directory |
| `runcon` | Chạy chương trình security context khác |
| `runlevel` | Báo runlevel trước, hiện tại |
| `runsv` | Chạy, theo dõi service, tùy chọn log service đi kèm |
| `runsvdir` | Chạy runsv process mỗi subdirectory; nếu exit, restart |
| `rx` | Nhận file bằng xmodem protocol |
| `script` | Tạo bản ghi terminal session |
| `sed` | Stream editor lọc, chuyển đổi text |
| `selinuxenabled` | Xác định SELinux bật không |
| `seq` | In số FIRST tới LAST theo bước INCREMENT |
| `sestatus` | Công cụ SELinux status |
| `setarch` | Đổi architecture được báo |
| `setconsole` | Chuyển system console output tới DEVICE (mặc định /dev/tty) |
| `setenforce` | Reset file context dưới pathname theo spec\_file |
| `setfont` | Load console font |
| `setkeycodes` | Đặt entry trong kernel map scancode-to-keycode |
| `setlogcons` | Chuyển kernel output tới console N |
| `setsebool` | Đổi SELinux boolean setting |
| `setsid` | Chạy PROG trong session mới |
| `setuidgid` | Đặt uid/gid bằng uid/gid account |
| `sh` | In hoặc kiểm tra SHA1 checksum |
| `showkey` | Hiện phím nhấn |
| `slattach` | Attach network interface tới serial line |
| `sleep` | Delay thời gian chỉ định |
| `softlimit` | Đặt soft resource limit rồi chạy PROG |
| `sort` | Sắp dòng text |
| `split` | Chia file thành phần |
| `start-stop-daemon` | Start/stop system daemon program |
| `stat` | Hiển thị file status (mặc định) hoặc file system status |
| `strings` | Hiển thị printable string trong binary file |
| `stty` | Đổi, in terminal line setting |
| `su` | Đổi user ID hoặc thành root |
| `sulogin` | Single user login |
| `sum` | Checksum, đếm block trong file |
| `sv` | Điều khiển service runsv supervisor theo dõi |
| `svlogd` | Đọc log data từ standard input, tùy chọn lọc message, ghi một/nhiều log tự rotate |
| `swapoff` | Dừng swapping trên DEVICE |
| `swapon` | Bắt đầu swapping trên DEVICE |
| `switch_root` | Chuyển file system khác làm root mount tree |
| `sync` | Ghi mọi buffered file system block xuống disk |
| `sysctl` | Cấu hình kernel parameter runtime |
| `syslogd` | Tiện ích system logging |
| `tac` | Nối FILE(s), in thứ tự ngược |
| `tail` | In mười dòng cuối mỗi FILE ra standard output |
| `tar` | Tạo, extract hoặc liệt kê file từ tar file |
| `taskset` | Đặt/lấy CPU affinity |
| `tc` | Hiện/thao tác traffic control setting |
| `tcpsvd` | Tạo TCP socket, bind ip:port, listen |
| `tee` | Copy standard input tới mỗi FILE, cả standard output |
| `telnet` | Nối telnet server |
| `telnetd` | Xử lý incoming telnet connection |
| `test` | Kiểm tra file type, so value, v.v.; trả exit code 0/1 |
| `tftp` | Truyền file từ/tới TFTP server |
| `tftpd` | Truyền file theo TFTP client request |
| `time` | Chạy chương trình, tổng hợp system resource usage |
| `top` | Cung cấp góc nhìn process activity real time |
| `touch` | Cập nhật ngày last-modified trên FILE(s) cho |
| `tr` | Chuyển đổi, gộp và/hoặc xóa ký tự |
| `traceroute` | Trace route tới HOST |
| `TRUE` | Trả exit code TRUE (0) |
| `tty` | In filename terminal standard input |
| `ttysize` | In kích thước terminal standard input |
| `tune2fs` | Điều chỉnh file system option trên ext\[23\] |
| `udhcpc` | DHCP client rất nhỏ |
| `udhcpd` | DHCP server rất nhỏ |
| `udpsvd` | Tạo UDP socket, bind ip:port, đợi |
| `umount` | Unmount file system |
| `uname` | In system information |
| `uncompress` | Giải nén file .Z |
| `unexpand` | Chuyển space thành tab, ghi standard output |
| `uniq` | Bỏ dòng trùng |
| `unix2dos` | Chuyển FILE từ UNIX sang DOS |
| `unlzma` | Giải nén FILE |
| `unzip` | Extract file từ ZIP archive |
| `uptime` | Hiển thị thời gian từ boot cuối |
| `usleep` | Tạm dừng N microsecond |
| `uudecode` | Uudecode file |
| `uuencode` | Uuencode file ra stdout |
| `vconfig` | Tạo, remove virtual Ethernet device |
| `vi` | Sửa FILE |
| `vlock` | Khóa virtual terminal |
| `watch` | Thực thi chương trình định kỳ |
| `watchdog` | Ghi định kỳ vào watchdog device DEV |
| `wc` | In số dòng, từ, byte từng FILE |
| `wget` | Lấy file qua HTTP/FTP |
| `which` | Định vị COMMAND |
| `who` | Hiện ai login |
| `whoami` | In username gắn current effective user ID |
| `xargs` | Thực thi COMMAND trên mỗi item standard input cung cấp |
| `yes` | Xuất lặp string tới khi kill |
| `zcat` | Giải nén ra `stdout` |
| `zcip` | Quản lý address IPv4 link-local `ZeroConf` |
