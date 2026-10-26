# *Chương 5*: Xây dựng root filesystem (Building a Root Filesystem)

Root filesystem là thành phần thứ tư và cuối cùng của embedded Linux. Khi đọc xong chương này, bạn sẽ có thể build, boot và chạy một hệ thống embedded Linux đơn giản.

Các kỹ thuật tôi sẽ mô tả ở đây thường được gọi chung là **roll your own** hay **RYO**. Vào những ngày đầu của embedded Linux, đây là cách duy nhất để tạo một root filesystem. Vẫn còn một số trường hợp sử dụng mà root filesystem RYO phù hợp, chẳng hạn khi lượng RAM hoặc bộ lưu trữ rất hạn chế, cho các bản demo nhanh, hoặc cho bất kỳ trường hợp nào mà yêu cầu của bạn không được các công cụ build system tiêu chuẩn đáp ứng (một cách dễ dàng). Tuy vậy, những trường hợp này khá hiếm. Tôi muốn nhấn mạnh rằng mục đích của chương này là giáo dục; nó không nhằm là công thức để build các hệ thống nhúng hằng ngày: hãy dùng các công cụ được mô tả trong chương tiếp theo cho việc đó.

Mục tiêu đầu tiên là tạo một root filesystem tối thiểu cho chúng ta một shell prompt. Sau đó, dùng nó làm nền, chúng ta sẽ thêm các script để khởi động các chương trình khác và cấu hình một network interface và quyền người dùng. Có các ví dụ hoàn chỉnh cho cả target BeagleBone Black và QEMU. Biết cách build root filesystem từ đầu là một kỹ năng hữu ích, và nó sẽ giúp bạn hiểu chuyện gì đang diễn ra khi chúng ta xem các ví dụ phức tạp hơn ở các chương sau.

Trong chương này, chúng ta sẽ đề cập các chủ đề sau:

- Root filesystem nên có những gì?
- Chuyển root filesystem sang target
- Tạo một boot `initramfs`
- Chương trình `init`
- Cấu hình tài khoản người dùng
- Một cách tốt hơn để quản lý device node
- Cấu hình mạng
- Tạo filesystem image với device table
- Mount root filesystem bằng NFS
- Dùng TFTP để nạp kernel

## Yêu cầu kỹ thuật

Để làm theo các ví dụ, hãy bảo đảm bạn có những thứ sau:

- Một hệ thống host Linux-based
- Một đầu đọc thẻ microSD và thẻ
- Thẻ microSD đã chuẩn bị cho BeagleBone Black từ [*Chương 4*](ch04_configuring_and_building_the_kernel.vi.md), *Cấu hình và build kernel*
- `zImage` và DTB cho QEMU từ [*Chương 4*](ch04_configuring_and_building_the_kernel.vi.md), *Cấu hình và build kernel*
- Một cáp serial USB to TTL 3.3V
- BeagleBone Black
- Một bộ nguồn DC 5V 1A
- Một cáp Ethernet và cổng cho NFS và TFTP

Toàn bộ code cho chương này có thể được tìm thấy trong thư mục `Chapter05` của repository GitHub của cuốn sách: [https://github.com/PacktPublishing/Mastering-Embedded-Linux-Programming-Third-Edition](https://github.com/PacktPublishing/Mastering-Embedded-Linux-Programming-Third-Edition)

## Root filesystem nên có những gì?

Kernel sẽ có được một root filesystem, hoặc dưới dạng `initramfs` được bootloader truyền qua một pointer, hoặc bằng cách mount block device được chỉ định trên kernel command line bằng tham số `root=`. Khi đã có root filesystem, kernel sẽ thực thi chương trình đầu tiên, mặc định có tên `init`, như được mô tả trong mục *Early user space* ở [*Chương 4*](ch04_configuring_and_building_the_kernel.vi.md), *Cấu hình và build kernel*. Sau đó, đối với kernel, công việc của nó đã xong. Việc bắt đầu khởi động các chương trình khác và đưa hệ thống vào hoạt động là việc của chương trình `init`.

Để tạo một root filesystem tối thiểu, bạn cần các thành phần sau:

- **init**: Đây là chương trình khởi động mọi thứ, thường bằng cách chạy một loạt script. Tôi sẽ mô tả cách `init` hoạt động chi tiết hơn nhiều trong [*Chương 13*](ch13_starting_up_the_init_program.vi.md), *Khởi động – Chương trình init*.
- **Shell**: Bạn cần một shell để có dấu nhắc lệnh nhưng, quan trọng hơn, còn để chạy các shell script được `init` và các chương trình khác gọi.
- **Daemon**: Daemon là một chương trình chạy nền cung cấp dịch vụ cho các chương trình khác. Các ví dụ điển hình là system log daemon (`syslogd`) và secure shell daemon (`sshd`). Chương trình `init` phải khởi động tập daemon ban đầu để hỗ trợ các application chính của hệ thống. Thực tế, bản thân `init` cũng là một daemon: nó là daemon cung cấp dịch vụ khởi chạy các daemon khác.
- **Shared library**: Hầu hết các chương trình được link với shared library và vì vậy chúng phải có mặt trong root filesystem.
- **File cấu hình**: Cấu hình cho `init` và các daemon khác được lưu trong một loạt file văn bản, thường trong thư mục `/etc`.
- **Device node**: Đây là các file đặc biệt cho phép truy cập các device driver khác nhau.
- **proc và sys**: Hai pseudo filesystem này biểu diễn các cấu trúc dữ liệu kernel dưới dạng một phân cấp thư mục và file. Nhiều chương trình và function thư viện phụ thuộc vào `/proc` và `/sys`.
- **Kernel module**: Nếu bạn đã cấu hình một số phần của kernel thành module, chúng cần được cài vào root filesystem, thường ở `/lib/modules/[kernel version]`.

Ngoài ra, còn có các application device-specific khiến thiết bị làm đúng công việc mà nó được thiết kế, và cả các file dữ liệu runtime mà chúng tạo ra.

> **Lưu ý quan trọng**
>
> Trong một số trường hợp, bạn có thể gộp hầu hết các chương trình ở trên vào một chương trình statically-linked duy nhất, và khởi động chương trình đó thay vì `init`. Ví dụ, nếu chương trình của bạn có tên `/myprog`, bạn sẽ thêm lệnh sau vào kernel command line `init=/myprog`. Tôi chỉ gặp cấu hình như vậy một lần, trong một hệ thống bảo mật trong đó system call `fork` đã bị disable, do đó không thể khởi động bất kỳ chương trình nào khác. Nhược điểm của cách tiếp cận này là bạn không thể dùng nhiều công cụ thường có trong một hệ thống nhúng. Bạn phải tự làm mọi thứ.

### Bố cục thư mục

Thú vị là Linux kernel không quan tâm đến bố cục file và thư mục ngoài sự tồn tại của chương trình được chỉ định bởi `init=` hoặc `rdinit=`, vì vậy bạn được tự do đặt mọi thứ ở bất cứ đâu bạn muốn. Ví dụ, hãy so sánh bố cục file của một thiết bị chạy Android với bố cục của một bản phân phối Linux cho máy để bàn: chúng gần như hoàn toàn khác nhau.

Tuy nhiên, nhiều chương trình mong đợi một số file nằm ở một số vị trí nhất định, và sẽ giúp ích cho các lập trình viên chúng ta nếu các thiết bị dùng bố cục tương tự nhau, trừ Android. Bố cục cơ bản của hầu hết các hệ thống Linux được định nghĩa trong **Filesystem Hierarchy Standard** (**FHS**), có tại [https://refspecs.linuxfoundation.org/fhs.shtml](https://refspecs.linuxfoundation.org/fhs.shtml). FHS bao quát tất cả các bản hiện thực của hệ điều hành Linux, từ lớn nhất đến nhỏ nhất. Các thiết bị nhúng có xu hướng dùng một tập con dựa trên nhu cầu của chúng, nhưng thường bao gồm:

- `/bin`: Các chương trình thiết yếu cho mọi người dùng
- `/dev`: Device node và các file đặc biệt khác
- `/etc`: Các file cấu hình hệ thống
- `/lib`: Các shared library thiết yếu, chẳng hạn các thư viện tạo nên C library
- `/proc`: Thông tin về các process được biểu diễn dưới dạng file ảo
- `/sbin`: Các chương trình thiết yếu cho quản trị viên hệ thống
- `/sys`: Thông tin về các thiết bị và driver của chúng được biểu diễn dưới dạng file ảo
- `/tmp`: Nơi đặt các file tạm hoặc volatile
- `/usr`: Các chương trình, thư viện bổ sung và các tiện ích quản trị hệ thống, lần lượt trong các thư mục `/usr/bin`, `/usr/lib` và `/usr/sbin`
- `/var`: Một phân cấp file và thư mục có thể bị thay đổi lúc runtime, chẳng hạn các log message, một số trong đó phải được giữ lại sau khi boot

Có một số khác biệt tinh tế ở đây. Khác biệt giữa `/bin` và `/sbin` đơn giản là thư mục sau không cần nằm trong đường dẫn tìm kiếm của người dùng non-root. Người dùng các bản phân phối Red Hat-derived sẽ quen với điều này. Ý nghĩa của `/usr` là nó có thể nằm trên một phân vùng riêng với root filesystem, vì vậy nó không thể chứa bất cứ thứ gì cần để boot hệ thống.

### Thư mục staging

Bạn nên bắt đầu bằng việc tạo một thư mục **staging** trên máy host, nơi bạn có thể tập hợp các file rồi cuối cùng sẽ được chuyển sang target. Trong các ví dụ sau, tôi đã dùng `~/rootfs`. Bạn cần tạo một cấu trúc thư mục *khung* (skeleton) trong đó, chẳng hạn hãy xem ở đây:

```
$ mkdir ~/rootfs
$ cd ~/rootfs
$ mkdir bin dev etc home lib proc sbin sys tmp usr var
$ mkdir usr/bin usr/lib usr/sbin
$ mkdir -p var/log
```

Để thấy phân cấp thư mục rõ hơn, bạn có thể dùng lệnh `tree` tiện dụng được dùng trong ví dụ sau với tùy chọn `-d` để chỉ hiển thị các thư mục:

```
$ tree -d
.
├── bin
├── dev
├── etc
├── home
├── lib
├── proc
├── sbin
├── sys
├── tmp
├── usr
│   ├── bin
│   ├── lib
│   └── sbin
└── var
    └── log
```

Như chúng ta sẽ thấy, không phải thư mục nào cũng có cùng quyền truy cập file và các file riêng lẻ bên trong một thư mục có thể có quyền chặt chẽ hơn chính thư mục đó.

### Quyền truy cập file POSIX

Mọi process, mà trong ngữ cảnh của phần bàn luận này có nghĩa là mọi chương trình đang chạy, đều thuộc về một user và một hoặc nhiều group. User được biểu diễn bằng một số 32-bit gọi là **user ID** hay **UID**. Thông tin về user, bao gồm ánh xạ từ UID sang tên, được giữ trong `/etc/passwd`. Tương tự, group được biểu diễn bằng **group ID** hay **GID** với thông tin được giữ trong `/etc/group`. Luôn có một user `root` với UID là `0` và một group root với GID là `0`. User `root` còn được gọi là **superuser** vì, trong cấu hình mặc định, nó vượt qua hầu hết các kiểm tra quyền và có thể truy cập mọi tài nguyên trong hệ thống. Bảo mật trong các hệ thống Linux-based chủ yếu là việc hạn chế truy cập vào tài khoản **root**.

Mỗi file và thư mục cũng có một owner và thuộc về đúng một group. Mức truy cập mà một process có đối với một file hay thư mục được điều khiển bởi một tập các flag quyền truy cập, gọi là **mode** của file. Có 3 nhóm, mỗi nhóm 3 bit: nhóm thứ nhất áp dụng cho *owner* của file, nhóm thứ hai cho *các thành viên* cùng group với file, và nhóm cuối cho *mọi người khác* – phần còn lại của thế giới. Các bit dành cho quyền **read** (`r`), **write** (`w`) và **execute** (`x`) trên file. Vì 3 bit vừa khít với một chữ số bát phân, chúng thường được biểu diễn ở hệ bát phân, như được thể hiện trong sơ đồ sau:

![](images/B11566_05_01.jpg)

*Hình 5.1 – Quyền truy cập file*

Có một chữ số bát phân thứ tư đứng trước với giá trị có ý nghĩa đặc biệt:

- **SUID** (**4**): Nếu file là file thực thi, nó đổi UID hiệu dụng của process thành UID của owner file khi chương trình chạy.
- **SGID** (**2**): Tương tự SUID, bit này đổi GID hiệu dụng của process thành GID của group của file.
- **Sticky** (**1**): Trong một thư mục, bit này hạn chế việc xóa để một user không thể xóa các file thuộc sở hữu của user khác. Nó thường được đặt trên `/tmp` và `/var/tmp`.

Bit SUID có lẽ được dùng thường xuyên nhất. Nó cho người dùng non-root một sự nâng quyền tạm thời lên superuser để thực hiện một tác vụ. Một ví dụ điển hình là chương trình `ping`: `ping` mở một raw socket, đây là một thao tác cần đặc quyền. Để người dùng bình thường có thể dùng `ping`, nó được sở hữu bởi user `root` và có bit SUID được đặt để khi bạn chạy `ping`, nó thực thi với UID `0` bất kể UID của bạn là gì.

Để đặt chữ số bát phân đứng đầu này, dùng các giá trị 4, 2 hoặc 1 với lệnh `chmod`. Ví dụ, để đặt SUID trên `/bin/ping` trong thư mục `root` staging, bạn sẽ thêm `4` vào trước mode `755` như sau:

```
$ cd ~/rootfs
$ ls -l bin/ping
-rwxr-xr-x 1 root root 35712 Feb 6 09:15 bin/ping
$ sudo chmod 4755 bin/ping
$ ls -l bin/ping
-rwsr-xr-x 1 root root 35712 Feb 6 09:15 bin/ping
```

Lưu ý rằng lệnh `ls` thứ hai cho thấy 3 bit đầu của mode là `rws`, trong khi trước đó chúng là `rwx`. Chữ `s` đó chỉ ra rằng bit SUID đã được đặt.

### Quyền sở hữu file trong thư mục staging

Vì lý do bảo mật và ổn định, việc chú ý đến quyền sở hữu và quyền truy cập của các file sẽ được đặt trên thiết bị đích là cực kỳ quan trọng. Nói chung, bạn muốn hạn chế các tài nguyên nhạy cảm để chỉ user `root` truy cập được và chạy càng ít chương trình bằng user `root` càng tốt. Tốt nhất là chạy chương trình bằng người dùng non-root để nếu chúng bị xâm phạm bởi một cuộc tấn công từ bên ngoài, chúng cung cấp càng ít tài nguyên hệ thống cho kẻ tấn công càng tốt. Ví dụ, device node có tên `/dev/mem` cho phép truy cập bộ nhớ hệ thống, điều cần thiết trong một số chương trình. Nhưng, nếu nó có thể đọc và ghi bởi mọi người, thì không có bảo mật nào cả vì mọi người đều có thể truy cập mọi thứ trong bộ nhớ. Vì vậy, `/dev/mem` nên được sở hữu bởi `root`, thuộc group `root`, và có mode là `600`, từ chối quyền đọc và ghi với tất cả mọi người trừ owner.

Tuy vậy, có một vấn đề với thư mục staging. Các file bạn tạo ở đó sẽ thuộc sở hữu của bạn, nhưng khi được cài lên thiết bị, chúng nên thuộc về các owner và group cụ thể, phần lớn là user `root`. Một cách sửa hiển nhiên là đổi quyền sở hữu thành `root` ở giai đoạn này bằng các lệnh được thể hiện ở đây:

```
$ cd ~/rootfs
$ sudo chown -R root:root *
```

Vấn đề là bạn cần đặc quyền `root` để chạy lệnh `chown`, và từ thời điểm đó trở đi, bạn sẽ cần là `root` để sửa bất kỳ file nào trong thư mục staging. Trước khi bạn kịp nhận ra, bạn đang làm toàn bộ việc phát triển với tư cách đăng nhập `root`, đó không phải ý hay. Đây là một vấn đề mà chúng ta sẽ quay lại sau.

### Các chương trình cho root filesystem

Bây giờ, đã đến lúc bắt đầu đưa vào filesystem `root` các chương trình thiết yếu cùng các thư viện, cấu hình và file dữ liệu hỗ trợ mà chúng cần để hoạt động. Tôi sẽ bắt đầu với tổng quan về các loại chương trình bạn sẽ cần.

#### Chương trình init

`init` là chương trình đầu tiên được chạy, và vì vậy nó là một phần thiết yếu của root filesystem. Trong chương này, chúng ta sẽ dùng chương trình `init` đơn giản do BusyBox cung cấp.

#### Shell

Chúng ta cần một shell để chạy script và cho chúng ta dấu nhắc lệnh để có thể tương tác với hệ thống. Một shell tương tác có lẽ không cần thiết trên thiết bị sản xuất, nhưng nó hữu ích cho việc phát triển, debug và bảo trì. Có nhiều shell thường được dùng trong hệ thống nhúng:

- `bash`: Đây là gã khổng lồ mà tất cả chúng ta đều biết và yêu thích từ Linux trên máy để bàn. Nó là một superset của Unix Bourne shell với nhiều phần mở rộng hay *bashism*.

- `ash`: Cũng dựa trên Bourne shell, nó có lịch sử lâu dài với các biến thể BSD của Unix. BusyBox có một phiên bản `ash`, đã được mở rộng để tương thích hơn với `bash`. Nó nhỏ hơn `bash` nhiều và do đó là lựa chọn rất phổ biến cho hệ thống nhúng.

- `hush`: Đây là một shell rất nhỏ mà chúng ta đã xem qua ngắn gọn trong [*Chương 3*](ch03_all_about_bootloaders.vi.md), *Tất cả về bootloader*. Nó hữu ích trên các thiết bị có rất ít bộ nhớ. Có một phiên bản `hush` trong BusyBox.

  > **Mẹo**
  >
  > Nếu bạn dùng `ash` hoặc `hush` làm shell trên target, hãy bảo đảm bạn test các shell script trên target. Rất dễ bị cám dỗ chỉ test chúng trên host, dùng `bash`, rồi ngạc nhiên khi chúng không hoạt động lúc bạn sao chép sang target.

Tiếp theo trong danh sách là các tiện ích.

#### Tiện ích

Shell chỉ là một cách khởi chạy các chương trình khác, và một shell script chỉ hơn một danh sách các chương trình cần chạy một chút, với một số điều khiển luồng và cách truyền thông tin giữa các chương trình. Để shell hữu ích, bạn cần các chương trình tiện ích mà command line Unix dựa vào. Ngay cả với một root filesystem cơ bản, bạn cần khoảng 50 tiện ích, điều này đặt ra hai vấn đề. Thứ nhất, tìm source code cho từng tiện ích và cross-compiling nó sẽ là một công việc khá lớn. Thứ hai, tập chương trình thu được sẽ chiếm vài chục megabyte, đây là một vấn đề thực sự vào những ngày đầu của embedded Linux khi vài megabyte là tất cả những gì bạn có. Để giải quyết vấn đề này, BusyBox ra đời.

#### BusyBox đến giải cứu!

Nguồn gốc của **BusyBox** không liên quan gì đến embedded Linux. Project được Bruce Perens khởi xướng năm 1996 cho trình cài đặt Debian để ông có thể boot Linux từ một đĩa mềm 1.44 MB. Thật trùng hợp, đây cũng xấp xỉ dung lượng lưu trữ trên các thiết bị đương thời, và vì vậy cộng đồng embedded Linux nhanh chóng tiếp nhận nó. Kể từ đó BusyBox luôn là trung tâm của embedded Linux.

BusyBox được viết từ đầu để thực hiện các chức năng thiết yếu của những tiện ích Linux thiết yếu đó. Các lập trình viên đã tận dụng quy tắc 80:20: 80% hữu ích nhất của một chương trình được hiện thực trong 20% code. Do đó, các công cụ BusyBox hiện thực một tập con các chức năng của các bản tương đương trên máy để bàn, nhưng chúng làm đủ để hữu ích trong phần lớn trường hợp.

Một mẹo khác mà BusyBox dùng là gộp tất cả các công cụ vào một binary duy nhất, giúp dễ dàng chia sẻ code giữa chúng. Nó hoạt động như thế này: BusyBox là một tập hợp các applet, mỗi applet export function `main` của nó dưới dạng `[applet]_main`. Ví dụ, lệnh `cat` được hiện thực trong `coreutils/cat.c` và export `cat_main`. Function `main` của bản thân BusyBox điều phối lời gọi tới applet đúng, dựa trên các đối số command-line.

Vậy, để đọc một file, bạn có thể khởi chạy BusyBox với tên applet bạn muốn chạy, theo sau là bất kỳ đối số nào applet cần, như được thể hiện ở đây:

```
$ busybox cat my_file.txt
```

Bạn cũng có thể chạy BusyBox không có đối số để có danh sách tất cả các applet đã được biên dịch.

Dùng BusyBox theo cách này khá vụng về. Một cách tốt hơn để BusyBox chạy applet `cat` là tạo một symbolic link từ `/bin/cat` tới `/bin/busybox`:

```
$ ls -l bin/cat bin/busybox
-rwxr-xr-x 1 root root 892868 Feb 2 11:01 bin/busybox
lrwxrwxrwx 1 root root 7      Feb 2 11:01 bin/cat -> busybox
```

Khi bạn gõ `cat` tại command line, BusyBox là chương trình thực sự chạy. BusyBox chỉ cần kiểm tra đường dẫn tới file thực thi được truyền vào qua `argv[0]`, sẽ là `/bin/cat`, trích ra tên application, `cat`, và tra bảng để khớp `cat` với `cat_main`. Tất cả việc này được làm trong `libbb/appletlib.c` ở đoạn code này (đã đơn giản hóa một chút):

```
applet_name = argv[0];
applet_name = bb_basename(applet_name);
run_applet_and_exit(applet_name, argv);
```

BusyBox có hơn 300 applet, bao gồm một chương trình `init`, nhiều shell với các mức độ phức tạp khác nhau, và các tiện ích cho hầu hết các tác vụ quản trị. Thậm chí có một phiên bản đơn giản của trình soạn thảo `vi` để bạn có thể sửa file văn bản trên thiết bị. Một binary BusyBox điển hình sẽ chỉ enable vài chục applet.

Tóm lại, một bản cài đặt BusyBox điển hình gồm một chương trình duy nhất với một symbolic link cho mỗi applet, nhưng nó hoạt động y như thể nó là một tập hợp các application riêng lẻ.

#### Build BusyBox

BusyBox dùng cùng hệ thống `Kconfig` và `Kbuild` như kernel, vì vậy cross-compiling rất đơn giản. Bạn có thể lấy source bằng cách clone repo Git của BusyBox và check out phiên bản bạn muốn (`1_31_1` là phiên bản mới nhất tại thời điểm viết), như sau:

```
$ git clone git://busybox.net/busybox.git
$ cd busybox
$ git checkout 1_31_1
```

Bạn cũng có thể tải file TAR tương ứng từ [https://busybox.net/downloads/](https://busybox.net/downloads/).

Sau đó, cấu hình BusyBox bằng cách bắt đầu với cấu hình mặc định, cấu hình này enable gần như toàn bộ tính năng của BusyBox:

```
$ make distclean
$ make defconfig
```

Tại thời điểm này, có lẽ bạn muốn chạy `make menuconfig` để fine-tune cấu hình. Ví dụ, gần như chắc chắn bạn muốn đặt đường dẫn cài đặt trong **Busybox Settings** | **Installation Options** `(CONFIG_PREFIX)` trỏ tới thư mục staging. Sau đó, bạn có thể cross-compile theo cách thông thường. Nếu target dự định của bạn là BeagleBone Black, dùng lệnh này:

```
$ make ARCH=arm CROSS_COMPILE=arm-cortex_a8-linux-gnueabihf-
```

Nếu target dự định của bạn là bản giả lập QEMU của Versatile PB, dùng lệnh này:

```
$ make ARCH=arm CROSS_COMPILE=arm-unknown-linux-gnueabi-
```

Trong cả hai trường hợp, kết quả là file thực thi `busybox`. Với một bản build cấu hình mặc định như thế này, kích thước khoảng 900 KiB. Nếu như vậy là quá lớn với bạn, bạn có thể thu gọn nó bằng cách thay đổi cấu hình để bỏ các tiện ích không cần.

Để cài BusyBox vào staging area, dùng lệnh sau:

```
$ make ARCH=arm CROSS_COMPILE=arm-cortex_a8-linux-gnueabihf- install
```

Lệnh này sẽ sao chép binary vào thư mục được cấu hình trong `CONFIG_PREFIX` và tạo tất cả các symbolic link tới nó.

Giờ chúng ta sẽ xem một lựa chọn thay thế cho Busybox có tên ToyBox.

#### ToyBox – một lựa chọn thay thế cho BusyBox

BusyBox không phải lựa chọn duy nhất. Ngoài ra, còn có **ToyBox**, mà bạn có thể tìm thấy tại [http://landley.net/toybox/](http://landley.net/toybox/). Project được khởi xướng bởi Rob Landley, người trước đây là maintainer của BusyBox. ToyBox có cùng mục tiêu với BusyBox, nhưng nhấn mạnh hơn vào việc tuân thủ tiêu chuẩn, đặc biệt là POSIX-2008 và LSB 4.1, và ít hơn vào khả năng tương thích với các phần mở rộng GNU của các tiêu chuẩn đó. ToyBox nhỏ hơn BusyBox, một phần vì nó hiện thực ít applet hơn. Và license của nó là BSD chứ không phải GPL v2, giúp nó tương thích với các hệ điều hành có user space BSD-licensed, chẳng hạn Android. Do đó, ToyBox được đi kèm trong mọi thiết bị Android mới. Từ bản phát hành 0.8.3 gần đây, `Makefile` của Toybox có thể build một hệ thống Linux đầy đủ boot tới shell prompt chỉ với source của Linux và ToyBox.

### Thư viện cho root filesystem

Các chương trình được link với thư viện. Bạn có thể link tất cả chúng tĩnh, khi đó sẽ không có thư viện nào trên thiết bị đích. Nhưng, việc này chiếm một lượng lưu trữ lớn không cần thiết nếu bạn có nhiều hơn hai hoặc ba chương trình. Vì vậy, bạn cần sao chép shared library từ toolchain sang thư mục staging. Làm sao biết cần những thư viện nào?

Một lựa chọn là sao chép tất cả các file `.so` từ thư mục `sysroot` của toolchain. Thay vì cố dự đoán cần include thư viện nào, hãy giả định rằng image của bạn cuối cùng sẽ cần tất cả. Điều này chắc chắn hợp lý và, nếu bạn đang tạo một nền tảng để người khác dùng cho nhiều application, đây sẽ là cách tiếp cận đúng. Tuy vậy, hãy lưu ý rằng một `glibc` đầy đủ khá lớn. Trong trường hợp bản build crosstool-NG của `glibc` 2.22, các thư viện, locale và các file hỗ trợ khác lên tới 33 MiB. Tất nhiên, bạn có thể giảm đáng kể con số đó bằng `musl libc` hoặc `uClibc-ng`.

Một lựa chọn khác là chỉ cherry-pick những thư viện bạn cần, để làm vậy bạn cần một cách phát hiện các phụ thuộc thư viện. Dùng một phần kiến thức từ [*Chương 2*](ch02_learning_about_toolchains.vi.md), *Tìm hiểu về toolchain*, chúng ta có thể dùng lệnh `readelf` cho việc này:

```
$ cd ~/rootfs
$ arm-cortex_a8-linux-gnueabihf-readelf -a bin/busybox | grep "program interpreter"
[Requesting program interpreter: /lib/ld-linux-armhf.so.3]
$ arm-cortex_a8-linux-gnueabihf-readelf -a bin/busybox | grep "Shared library"
0x00000001 (NEEDED) Shared library: [libm.so.6]
0x00000001 (NEEDED) Shared library: [libc.so.6]
```

Lệnh `readelf` đầu tiên tìm trong binary `busybox` các dòng chứa `program interpreter`. Lệnh `readelf` thứ hai tìm trong binary `busybox` các dòng chứa `Shared library`. Bây giờ, bạn cần tìm các file này trong thư mục `sysroot` của toolchain và sao chép chúng sang thư mục staging. Hãy nhớ rằng bạn có thể tìm `sysroot` như thế này:

```
$ arm-cortex_a8-linux-gnueabihf-gcc -print-sysroot
/home/chris/x-tools/arm-cortex_a8-linux-gnueabihf/arm-cortex_a8-linux-gnueabihf/sysroot
```

Để bớt phải gõ, tôi sẽ giữ một bản sao của nó trong một biến shell:

```
$ export SYSROOT=$(arm-cortex_a8-linux-gnueabihf-gcc -print-sysroot)
```

Nếu bạn xem `/lib/ld-linux-armhf.so.3` trong `sysroot`, bạn sẽ thấy nó thực ra là một symbolic link:

```
$ cd $SYSROOT
$ ls -l lib/ld-linux-armhf.so.3
lrwxrwxrwx 1 chris chris 10 Mar 3 15:22 lib/ld-linux-armhf.so.3 -> ld-2.22.so
```

Lặp lại bài tập cho `libc.so.6` và `libm.so.6`, và bạn sẽ có một danh sách ba file và ba symbolic link. Bây giờ, bạn có thể sao chép từng cái bằng `cp -a`, lệnh này sẽ giữ nguyên symbolic link:

```
$ cd ~/rootfs
$ cp -a $SYSROOT/lib/ld-linux-armhf.so.3 lib
$ cp -a $SYSROOT/lib/ld-2.22.so lib
$ cp -a $SYSROOT/lib/libc.so.6 lib
$ cp -a $SYSROOT/lib/libc-2.22.so lib
$ cp -a $SYSROOT/lib/libm.so.6 lib
$ cp -a $SYSROOT/lib/libm-2.22.so lib
```

Lặp lại thủ tục này cho mỗi chương trình.

> **Mẹo**
>
> Việc này chỉ đáng làm để có được dung lượng nhúng nhỏ nhất có thể. Có nguy cơ bạn sẽ bỏ sót các thư viện được nạp qua các lời gọi `dlopen(3)` – chủ yếu là plugin. Chúng ta sẽ xem một ví dụ với các thư viện **name service switch** (**NSS**) khi cấu hình network interface ở phần sau của chương này.

#### Giảm kích thước bằng cách strip

Thư viện và chương trình thường được biên dịch với một số thông tin được lưu trong các bảng symbol để hỗ trợ debug và tracing. Bạn hiếm khi cần chúng trong một hệ thống sản xuất. Một cách nhanh và dễ để tiết kiệm không gian là strip các bảng symbol khỏi binary. Ví dụ này cho thấy `libc` trước khi strip:

```
$ file rootfs/lib/libc-2.22.so
lib/libc-2.22.so: ELF 32-bit LSB shared object, ARM, EABI5 version 1 (GNU/Linux), dynamically linked (uses shared libs), for GNU/Linux 4.3.0, not stripped
$ ls -og rootfs/lib/libc-2.22.so
-rwxr-xr-x 1 1542572 Mar 3 15:22 rootfs/lib/libc-2.22.so
```

Bây giờ, hãy xem kết quả của việc strip thông tin debug:

```
$ arm-cortex_a8-linux-gnueabihf-strip rootfs/lib/libc-2.22.so
$ file rootfs/lib/libc-2.22.so
rootfs/lib/libc-2.22.so: ELF 32-bit LSB shared object, ARM, EABI5 version 1 (GNU/Linux), dynamically linked (uses shared libs), for GNU/Linux 4.3.0, stripped
$ ls -og rootfs/lib/libc-2.22.so
-rwxr-xr-x 1 1218200 Mar 22 19:57 rootfs/lib/libc-2.22.so
```

Trong trường hợp này, chúng ta đã tiết kiệm được 324,372 byte, khoảng 20% kích thước file trước khi strip.

> **Mẹo**
>
> Hãy cẩn thận khi strip kernel module. Một số symbol được module loader cần để relocate code module, và vì vậy module sẽ nạp thất bại nếu chúng bị strip. Dùng lệnh này để loại bỏ debug symbol trong khi giữ những symbol được dùng cho relocation: `strip --strip-unneeded <module name>`.

### Device node

Hầu hết các thiết bị trong Linux được biểu diễn bằng device node, theo triết lý Unix rằng *mọi thứ đều là file* (trừ network interface, vốn là socket). Một device node có thể tham chiếu tới một block device hoặc một character device. Block device là các thiết bị lưu trữ dung lượng lớn, chẳng hạn thẻ SD hay ổ cứng. Character device gần như là mọi thứ còn lại, một lần nữa, trừ network interface. Vị trí quy ước cho device node là thư mục có tên `/dev`. Ví dụ, một cổng serial có thể được biểu diễn bằng device node có tên `/dev/ttyS0`.

Device node được tạo bằng chương trình có tên `mknod` (viết tắt của *make node*):

```
mknod <name> <type> <major> <minor>
```

Các tham số của `mknod` như sau:

- `name` là tên của device node bạn muốn tạo.
- `type` là `c` cho character device hoặc `b` cho block device.
- `major` và `minor` là một cặp số được kernel dùng để định tuyến các request file tới code device driver phù hợp. Có một danh sách các số major và minor tiêu chuẩn trong kernel source ở file `Documentation/devices.txt`.

Bạn sẽ cần tạo device node cho tất cả các thiết bị bạn muốn truy cập trên hệ thống. Bạn có thể làm thủ công bằng lệnh `mknod` như tôi sẽ minh họa ở đây hoặc bạn có thể tạo chúng tự động lúc runtime bằng một trong các device manager mà tôi sẽ nhắc đến sau.

Trong một root filesystem thực sự tối thiểu, bạn chỉ cần hai node để boot với BusyBox: `console` và `null`. Console chỉ cần truy cập được bởi `root`, owner của device node, vì vậy quyền truy cập là `600 (rw-------)`. Thiết bị `null` nên đọc và ghi được bởi mọi người, vì vậy mode là `666 (rw-rw-rw-)`. Bạn có thể dùng tùy chọn `-m` của `mknod` để đặt mode khi tạo node. Bạn cần là `root` để tạo device node, như được thể hiện ở đây:

```
$ cd ~/rootfs
$ sudo mknod -m 666 dev/null c 1 3
$ sudo mknod -m 600 dev/console c 5 1
$ ls -l dev
total 0
crw------- 1 root root 5, 1 Mar 22 20:01 console
crw-rw-rw- 1 root root 1, 3 Mar 22 20:01 null
```

Bạn có thể xóa device node bằng lệnh `rm` tiêu chuẩn. Không có lệnh `rmnod` vì, một khi đã được tạo, chúng chỉ là file.

### Filesystem proc và sysfs

`proc` và `sysfs` là hai pseudo filesystem cho phép nhìn vào hoạt động bên trong của kernel. Cả hai đều biểu diễn dữ liệu kernel dưới dạng file trong một phân cấp thư mục: khi bạn đọc một trong các file, nội dung bạn thấy không đến từ bộ lưu trữ trên đĩa; nó được một function trong kernel định dạng on the fly. Một số file cũng có thể ghi được, nghĩa là một function kernel được gọi với dữ liệu mới bạn đã ghi và, nếu nó đúng định dạng và bạn có đủ quyền, nó sẽ sửa giá trị được lưu trong bộ nhớ của kernel. Nói cách khác, `proc` và `sysfs` cung cấp một cách khác để tương tác với device driver và các code kernel khác. Các filesystem `proc` và `sysfs` nên được mount lên các thư mục có tên `/proc` và `/sys`:

```
# mount -t proc proc /proc
# mount -t sysfs sysfs /sys
```

Dù rất giống nhau về khái niệm, chúng thực hiện các chức năng khác nhau. `proc` đã là một phần của Linux từ những ngày đầu. Mục đích ban đầu của nó là đưa thông tin về các process ra user space, do đó có tên như vậy. Để làm điều này, có một thư mục cho mỗi process tên `/proc/<PID>`, chứa thông tin về trạng thái của nó. Lệnh liệt kê process, `ps`, đọc các file này để tạo output. Ngoài ra, có các file cung cấp thông tin về các phần khác của kernel, chẳng hạn `/proc/cpuinfo` cho bạn biết về CPU, `/proc/interrupts` có thông tin về interrupt, v.v.

Cuối cùng, trong `/proc/sys`, có các file hiển thị và điều khiển trạng thái và hành vi của các subsystem kernel, đặc biệt là scheduling, quản lý bộ nhớ và mạng. Trang manual là tài liệu tham khảo tốt nhất cho các file bạn sẽ tìm thấy trong thư mục `proc`, mà bạn có thể xem bằng cách gõ `man 5 proc`.

Mặt khác, vai trò của `sysfs` là trình bày **driver model** của kernel cho user space. Nó export một phân cấp file liên quan đến các thiết bị và device driver và cách chúng được kết nối với nhau. Tôi sẽ đi vào chi tiết hơn về driver model của Linux khi mô tả việc tương tác với device driver trong [*Chương 11*](ch11_interfacing_with_device_drivers.vi.md), *Giao tiếp với device driver*.

#### Mount filesystem

Lệnh `mount` cho phép chúng ta gắn một filesystem vào một thư mục bên trong filesystem khác, tạo thành một phân cấp filesystem. Filesystem ở trên cùng, được kernel mount khi boot, được gọi là **root filesystem**. Định dạng của lệnh `mount` như sau:

```
mount [-t vfstype] [-o options] device directory
```

Các tham số của `mount` như sau:

- `vfstype` là loại filesystem.
- `options` là một danh sách comma-separated các tùy chọn `mount`.
- `device` là block device node mà filesystem nằm trên đó.
- `directory` là thư mục bạn muốn mount filesystem lên.

Có nhiều tùy chọn bạn có thể đưa sau `-o`; hãy xem trang manual `mount(8)` để biết thêm thông tin. Ví dụ, nếu bạn muốn mount một thẻ SD chứa filesystem `ext4` ở phân vùng đầu tiên lên thư mục có tên `/mnt`, bạn sẽ gõ code sau:

```
# mount -t ext4 /dev/mmcblk0p1 /mnt
```

Giả sử mount thành công, bạn sẽ có thể thấy các file được lưu trên thẻ SD trong thư mục `/mnt`. Trong một số trường hợp, bạn có thể bỏ loại filesystem và để kernel dò thiết bị để tìm ra thứ được lưu ở đó. Nếu mount thất bại, trước tiên bạn có thể cần unmount phân vùng trong trường hợp distro Linux của bạn được cấu hình để automount tất cả các phân vùng trên thẻ SD khi nó được cắm vào.

Nhìn vào ví dụ mount filesystem `proc`, có điều gì đó kỳ lạ: không có device node nào, chẳng hạn `/dev/proc`, vì nó là một pseudo filesystem chứ không phải filesystem thực. Nhưng lệnh `mount` cần một tham số `device`. Do đó, chúng ta phải đưa một chuỗi vào chỗ `device`, nhưng chuỗi đó là gì không quá quan trọng. Hai lệnh này đạt được đúng cùng một kết quả:

```
# mount -t proc procfs /proc
# mount -t proc nodevice /proc
```

Các chuỗi `procfs` và `nodevice` bị lệnh `mount` bỏ qua. Khá phổ biến khi dùng loại filesystem thay cho device khi mount các pseudo filesystem.

### Kernel module

Nếu bạn có kernel module, chúng cần được cài vào root filesystem, dùng make target `modules_install` của kernel, như chúng ta đã thấy trong [*Chương 4*](ch04_configuring_and_building_the_kernel.vi.md), *Cấu hình và build kernel*. Việc này sẽ sao chép chúng vào thư mục có tên `/lib/modules/<kernel version>` cùng với các file cấu hình mà lệnh `modprobe` cần.

Hãy lưu ý rằng bạn vừa tạo ra một phụ thuộc giữa kernel và root filesystem. Nếu bạn cập nhật một cái, bạn sẽ phải cập nhật cái kia.

Giờ chúng ta đã biết cách mount một filesystem từ thẻ SD, hãy xem các lựa chọn khác nhau để mount một root filesystem. Các lựa chọn thay thế (ramdisk và NFS) có thể làm bạn ngạc nhiên, đặc biệt nếu bạn mới làm quen với embedded Linux. Một ramdisk bảo vệ image source gốc khỏi hỏng hóc và hao mòn. Chúng ta sẽ tìm hiểu thêm về flash wear trong [*Chương 9*](ch09_creating_a_storage_strategy.vi.md), *Xây dựng chiến lược lưu trữ*. Một network filesystem cho phép phát triển nhanh hơn vì các thay đổi file có thể lan truyền ngay lập tức tới (các) target.

## Chuyển root filesystem sang target

Sau khi đã tạo một root filesystem khung trong thư mục staging, nhiệm vụ tiếp theo là chuyển nó sang target. Trong các mục tiếp theo, tôi sẽ mô tả ba khả năng:

- **initramfs**: Còn được gọi là ramdisk, đây là một filesystem image được bootloader nạp vào RAM. Ramdisk dễ tạo và không phụ thuộc vào các driver lưu trữ dung lượng lớn. Chúng có thể được dùng trong chế độ bảo trì dự phòng khi root filesystem chính cần cập nhật. Chúng thậm chí có thể được dùng làm root filesystem chính trong các thiết bị nhúng nhỏ, và chúng thường được dùng làm early user space trong các bản phân phối Linux mainstream. Hãy nhớ rằng nội dung của root filesystem là volatile, và mọi thay đổi bạn thực hiện trong root filesystem lúc runtime sẽ mất khi hệ thống boot lần sau. Bạn sẽ cần một loại lưu trữ khác để lưu dữ liệu lâu dài như các tham số cấu hình.
- **Disk image**: Đây là một bản sao của root filesystem đã được format và sẵn sàng nạp lên một thiết bị lưu trữ dung lượng lớn trên target. Ví dụ, nó có thể là một image định dạng `ext4` sẵn sàng sao chép lên thẻ SD, hoặc có thể ở định dạng `jffs2` sẵn sàng nạp vào bộ nhớ flash qua bootloader. Tạo một disk image có lẽ là lựa chọn phổ biến nhất. Có thêm thông tin về các loại lưu trữ dung lượng lớn khác nhau trong [*Chương 9*](ch09_creating_a_storage_strategy.vi.md), *Xây dựng chiến lược lưu trữ*.
- **Network filesystem**: Thư mục staging có thể được export ra mạng qua một NFS server và được target mount lúc boot. Việc này thường được làm trong giai đoạn phát triển, thay vì lặp đi lặp lại các chu kỳ tạo disk image và nạp lại nó lên thiết bị lưu trữ, một quá trình khá chậm.

Tôi sẽ bắt đầu với ramdisk, và dùng nó để minh họa một vài cải tiến cho root filesystem, chẳng hạn thêm username và một device manager để tạo device node tự động. Sau đó, tôi sẽ chỉ cho bạn cách tạo disk image và cách dùng NFS để mount root filesystem qua mạng.

## Tạo một boot initramfs

Một initial RAM filesystem, hay `initramfs`, là một archive `cpio` đã nén. `cpio` là một định dạng archive Unix cũ, tương tự TAR và ZIP nhưng dễ giải mã hơn và vì vậy cần ít code hơn trong kernel. Bạn cần cấu hình kernel với `CONFIG_BLK_DEV_INITRD` để hỗ trợ `initramfs`.

Thực ra, có ba cách khác nhau để tạo một boot ramdisk: dưới dạng một archive `cpio` độc lập, dưới dạng một archive `cpio` nhúng trong kernel image, và dưới dạng một device table mà build system của kernel xử lý như một phần của quá trình build. Lựa chọn đầu cho sự linh hoạt cao nhất vì chúng ta có thể kết hợp tùy ý kernel và ramdisk. Tuy nhiên, nó có nghĩa là bạn có hai file để xử lý thay vì một, và không phải bootloader nào cũng có khả năng nạp một ramdisk riêng. Tôi sẽ chỉ cho bạn cách build một ramdisk vào kernel ở phần sau.

### initramfs độc lập

Chuỗi lệnh sau tạo archive, nén nó và thêm một header U-Boot sẵn sàng để nạp lên target:

```
$ cd ~/rootfs
$ find . | cpio -H newc -ov --owner root:root >
../initramfs.cpio
$ cd ..
$ gzip initramfs.cpio
$ mkimage -A arm -O linux -T ramdisk -d initramfs.cpio.gz uRamdisk
```

Lưu ý rằng chúng ta chạy `cpio` với tùy chọn `--owner root:root`. Đây là một cách sửa nhanh cho vấn đề quyền sở hữu file đã nhắc ở trên, trong mục *Quyền sở hữu file trong thư mục staging*. Nó khiến mọi thứ trong archive `cpio` có UID và GID là `0`.

Kích thước cuối cùng của file `uRamdisk` khoảng 2.9 MB khi không có kernel module. Cộng thêm 4.4 MB cho file kernel `zImage` và 440 KB cho U-Boot, tổng cộng cần 7.7 MB lưu trữ để boot board này. Chúng ta đã cách khá xa chiếc đĩa mềm 1.44 MB khởi đầu tất cả. Nếu kích thước thực sự là vấn đề, bạn có thể dùng một trong các lựa chọn sau:

- Làm kernel nhỏ hơn bằng cách bỏ các driver và function bạn không cần.
- Làm BusyBox nhỏ hơn bằng cách bỏ các tiện ích bạn không cần.
- Dùng `musl libc` hoặc `uClibc-ng` thay cho `glibc`.
- Biên dịch BusyBox tĩnh.

Giờ chúng ta đã tập hợp được một `initramfs`, hãy boot archive đó.

### Boot initramfs

Điều đơn giản nhất chúng ta có thể làm là chạy một shell trên console để có thể tương tác với target. Chúng ta có thể làm điều đó bằng cách thêm `rdinit=/bin/sh` vào kernel command line. Hai mục tiếp theo chỉ ra cách làm điều đó cho cả QEMU và BeagleBone Black.

### Boot với QEMU

QEMU có tùy chọn tên `-initrd` để nạp `initramfs` vào bộ nhớ. Từ [*Chương 4*](ch04_configuring_and_building_the_kernel.vi.md), *Cấu hình và build kernel*, bạn lẽ ra đã có một `zImage` được biên dịch bằng toolchain `arm-unknown-linux-gnueabi` và device tree binary cho Versatile PB. Từ chương này, bạn lẽ ra đã tạo một `initramfs`, bao gồm BusyBox được biên dịch bằng cùng toolchain. Bây giờ, bạn có thể khởi chạy QEMU bằng script trong `MELP/Chapter05/run-qemu-initramfs.sh` hoặc bằng lệnh này:

```
$ QEMU_AUDIO_DRV=none \
qemu-system-arm -m 256M -nographic -M versatilepb \
-kernel zImage
-append "console=ttyAMA0 rdinit=/bin/sh" \
-dtb versatile-pb.dtb
-initrd initramfs.cpio.gz
```

Bạn sẽ có một root shell với dấu nhắc `/ #`.

### Boot BeagleBone Black

Với BeagleBone Black, chúng ta cần thẻ microSD đã chuẩn bị trong [*Chương 4*](ch04_configuring_and_building_the_kernel.vi.md), *Cấu hình và build kernel*, cộng với một root filesystem được build bằng toolchain `arm-cortex_a8-linux-gnueabihf`. Sao chép `uRamdisk` bạn đã tạo ở trên trong mục này sang phân vùng boot trên thẻ microSD, rồi dùng nó để boot BeagleBone Black tới chỗ bạn có dấu nhắc U-Boot. Sau đó, nhập các lệnh này:

```
fatload mmc 0:1 0x80200000 zImage
fatload mmc 0:1 0x80f00000 am335x-boneblack.dtb fatload mmc 0:1 0x81000000 uRamdisk
setenv bootargs console=ttyO0,115200 rdinit=/bin/sh
bootz 0x80200000 0x81000000 0x80f00000
```

Nếu mọi thứ suôn sẻ, bạn sẽ có một root shell với dấu nhắc `/ #` trên serial console. Sau khi xong, chúng ta sẽ cần mount `proc` trên cả hai nền tảng.

#### Mount proc

Bạn sẽ thấy rằng trên cả hai nền tảng, lệnh `ps` không hoạt động. Đó là vì filesystem `proc` chưa được mount. Hãy thử mount nó:

```
# mount -t proc proc /proc
```

Bây giờ, chạy lại `ps` và bạn sẽ thấy danh sách process.

Một cải tiến cho thiết lập này là viết một shell script mount `proc`, và bất cứ thứ gì khác cần làm lúc khởi động. Sau đó, bạn có thể chạy script này thay vì `/bin/sh` lúc boot. Đoạn code sau cho ý niệm về cách nó hoạt động:

```
#!/bin/sh
/bin/mount -t proc proc /proc
# Other boot-time commands go here
/bin/sh
```

Dòng cuối cùng, `/bin/sh`, khởi chạy một shell mới cho bạn một root shell prompt tương tác. Dùng shell làm `init` theo cách này rất tiện cho các mẹo nhanh, chẳng hạn khi bạn muốn cứu một hệ thống có chương trình `init` bị hỏng. Tuy nhiên, trong hầu hết trường hợp, bạn sẽ dùng một chương trình `init`, thứ chúng ta sẽ đề cập ở phần sau của chương này. Nhưng, trước đó, tôi muốn xem hai cách khác để nạp `initramfs`.

### Build initramfs vào kernel image

Cho đến giờ, chúng ta đã tạo một `initramfs` nén dưới dạng file riêng và dùng bootloader để nạp nó vào bộ nhớ. Một số bootloader không có khả năng nạp file `initramfs` theo cách này. Để đối phó với những tình huống như vậy, Linux có thể được cấu hình để đưa `initramfs` vào kernel image. Để làm điều này, thay đổi cấu hình kernel và đặt `CONFIG_INITRAMFS_SOURCE` thành đường dẫn đầy đủ tới archive `cpio` bạn đã tạo trước đó. Nếu bạn dùng `menuconfig`, nó nằm trong **General setup** | **Initramfs source file(s)**. Lưu ý rằng nó phải là file `cpio` chưa nén có đuôi `.cpio`, không phải phiên bản `gzipped`. Sau đó, build kernel.

Việc boot giống như trước, ngoại trừ không có file ramdisk. Với QEMU, lệnh như thế này:

```
$ QEMU_AUDIO_DRV=none \
qemu-system-arm -m 256M -nographic -M versatilepb \
-kernel zImage \
-append "console=ttyAMA0 rdinit=/bin/sh" \
-dtb versatile-pb.dtb
```

Với BeagleBone Black, nhập các lệnh này tại dấu nhắc U-Boot:

```
fatload mmc 0:1 0x80200000 zImage
fatload mmc 0:1 0x80f00000 am335x-boneblack.dtb
setenv bootargs console=ttyO0,115200 rdinit=/bin/sh
bootz 0x80200000 – 0x80f00000
```

Tất nhiên, bạn phải nhớ tạo lại file `cpio` mỗi lần thay đổi nội dung root filesystem rồi build lại kernel.

### Build initramfs bằng device table

Device table là một file văn bản liệt kê các file, thư mục, device node và link đi vào một archive hay filesystem image. Lợi thế vượt trội là nó cho phép bạn tạo các entry trong file archive thuộc sở hữu của user `root`, hay bất kỳ UID nào khác, mà bản thân bạn không cần đặc quyền root. Bạn thậm chí có thể tạo device node mà không cần đặc quyền root. Tất cả điều này khả thi vì archive chỉ là một file dữ liệu. Chỉ khi nó được Linux mở ra lúc boot thì các file và thư mục thực mới được tạo, dùng các thuộc tính bạn đã chỉ định.

Kernel có một tính năng cho phép chúng ta dùng device table khi tạo `initramfs`. Bạn viết file device table rồi trỏ `CONFIG_INITRAMFS_SOURCE` tới nó. Sau đó, khi bạn build kernel, nó tạo archive `cpio` từ các chỉ dẫn trong device table. Không lúc nào bạn cần quyền `root`.

Đây là một device table cho `rootfs` đơn giản của chúng ta, nhưng thiếu phần lớn các symbolic link tới BusyBox để dễ quản lý:

```
dir /bin 775 0 0
dir /sys 775 0 0
dir /tmp 775 0 0
dir /dev 775 0 0
nod /dev/null 666 0 0 c 1 3
nod /dev/console 600 0 0 c 5 1
dir /home 775 0 0
dir /proc 775 0 0
dir /lib 775 0 0
slink /lib/libm.so.6 libm-2.22.so 777 0 0
slink /lib/libc.so.6 libc-2.22.so 777 0 0
slink /lib/ld-linux-armhf.so.3 ld-2.22.so 777 0 0
file /lib/libm-2.22.so /home/chris/rootfs/lib/libm-2.22.so 755 0 0
file /lib/libc-2.22.so /home/chris/rootfs/lib/libc-2.22.so 755 0 0
file /lib/ld-2.22.so /home/chris/rootfs/lib/ld-2.22.so 755 0 0
```

Cú pháp khá hiển nhiên:

- `dir <name> <mode> <uid> <gid>`
- `file <name> <location> <mode> <uid> <gid>`
- `nod <name> <mode> <uid> <gid> <dev_type> <maj> <min>`
- `slink <name> <target> <mode> <uid> <gid>`

Các lệnh `dir`, `nod` và `slink` tạo một object filesystem trong archive `initramfs cpio` với tên, mode, user ID và group ID đã cho. Lệnh `file` sao chép file từ vị trí nguồn vào archive và đặt mode, user ID và group ID.

Việc tạo một device table `initramfs` từ đầu được làm dễ hơn nhờ một script trong kernel source code ở `usr/gen_initramfs_list.sh`, script này tạo một device table từ một thư mục cho trước. Ví dụ, để tạo device table `initramfs` cho thư mục `rootfs`, và đổi quyền sở hữu của tất cả các file thuộc user ID `1000` và group ID `1000` sang user và group ID `0`, bạn sẽ dùng lệnh này:

```
$ bash linux-stable/scripts/gen_initramfs_list.sh -u 1000 \
-g 1000
rootfs > initramfs-device-table
```

Dùng tùy chọn `-o` của script này cho phép bạn tạo một file `initramfs` nén có định dạng phụ thuộc vào phần mở rộng file sau `-o`.

Lưu ý rằng script chỉ hoạt động với shell `bash`. Nếu bạn có một hệ thống với shell mặc định khác, như trường hợp của hầu hết cấu hình Ubuntu, bạn sẽ thấy script thất bại. Do đó, trong lệnh ở trên, tôi đã dùng `bash` một cách tường minh để chạy script.

### Định dạng initrd cũ

Có một định dạng cũ hơn cho ramdisk Linux, được gọi là `initrd`. Nó là định dạng duy nhất có sẵn trước Linux 2.6 và vẫn cần thiết nếu bạn dùng biến thể MMU-less của Linux, uClinux. Nó khá ít người biết và tôi sẽ không đề cập ở đây. Có thêm thông tin trong kernel source ở `Documentation/initrd.txt`.

Khi `initramfs` của chúng ta boot, hệ thống cần bắt đầu chạy các chương trình. Chương trình đầu tiên chạy là chương trình `init`. Hãy xem nó tiếp theo.

## Chương trình init

Chạy một shell, hay thậm chí một shell script, lúc boot là ổn với các trường hợp đơn giản, nhưng thực sự bạn cần thứ gì đó linh hoạt hơn. Thông thường, các hệ thống Unix chạy một chương trình gọi là `init` để khởi động và giám sát các chương trình khác. Qua nhiều năm, đã có nhiều chương trình `init`, một số trong đó tôi sẽ mô tả trong [*Chương 13*](ch13_starting_up_the_init_program.vi.md), *Khởi động – Chương trình init*. Hiện tại, tôi sẽ giới thiệu ngắn gọn chương trình `init` của BusyBox.

Chương trình `init` bắt đầu bằng việc đọc file cấu hình `/etc/inittab`. Đây là một ví dụ đơn giản đủ cho nhu cầu của chúng ta:

```
::sysinit:/etc/init.d/rcS
::askfirst:-/bin/ash
```

Dòng đầu chạy một shell script, `rcS`, khi `init` được khởi động. Dòng thứ hai in message **Please press Enter to activate this console** ra console và khởi động một shell khi bạn nhấn *Enter*. Dấu `-` đứng trước `/bin/ash` có nghĩa là nó sẽ trở thành một login shell, shell này source `/etc/profile` và `$HOME/.profile` trước khi đưa ra shell prompt. Một trong những lợi thế của việc khởi chạy shell như thế này là job control được enable. Tác dụng thấy ngay nhất là bạn có thể dùng *Ctrl* + *C* để dừng chương trình hiện tại. Có thể trước đây bạn không để ý, nhưng hãy đợi đến khi bạn chạy chương trình `ping` và thấy mình không thể dừng nó!

BusyBox `init` cung cấp một `inittab` mặc định nếu không có file nào như vậy trong root filesystem. Nó đầy đủ hơn một chút so với cái ở trên.

Script có tên `/etc/init.d/rcS` là nơi đặt các lệnh khởi tạo cần được thực hiện lúc boot, chẳng hạn mount các filesystem `proc` và `sysfs`:

```
#!/bin/sh
mount -t proc proc /proc
mount -t sysfs sysfs /sys
```

Hãy bảo đảm bạn làm cho `rcS` thực thi được như thế này:

```
$ cd ~/rootfs
$ chmod +x etc/init.d/rcS
```

Bạn có thể thử `init` trên QEMU bằng cách thay đổi tham số `-append` như thế này:

```
-append "console=ttyAMA0 rdinit=/sbin/init"
```

Với BeagleBone Black, bạn cần đặt biến `bootargs` trong U-Boot như được thể hiện ở đây:

```
setenv bootargs console=ttyO0,115200 rdinit=/sbin/init
```

Bây giờ, hãy xem kỹ hơn `inittab` được `init` đọc trong lúc khởi động.

### Khởi động một daemon process

Thông thường, bạn sẽ muốn chạy một số process nền lúc khởi động. Hãy lấy log daemon, `syslogd`, làm ví dụ. Mục đích của `syslogd` là tích lũy các log message từ các chương trình khác, chủ yếu là các daemon khác. Tất nhiên, BusyBox có một applet cho việc đó!

Khởi động daemon đơn giản như thêm một dòng như thế này vào `etc/inittab`:

```
::respawn:/sbin/syslogd -n
```

`respawn` có nghĩa là nếu chương trình kết thúc, nó sẽ tự động được khởi động lại; `-n` có nghĩa là nó nên chạy như một process foreground. Log được ghi vào `/var/log/messages`.

> **Lưu ý quan trọng**
>
> Bạn cũng có thể muốn khởi động `klogd` theo cùng cách: `klogd` gửi các log message của kernel tới `syslogd` để chúng có thể được ghi vào bộ lưu trữ lâu dài.

Tiếp theo, chúng ta sẽ học cách cấu hình tài khoản người dùng.

## Cấu hình tài khoản người dùng

Như tôi đã gợi ý, chạy tất cả chương trình bằng `root` không phải là thói quen tốt, vì nếu một chương trình bị xâm phạm bởi một cuộc tấn công từ bên ngoài, thì toàn bộ hệ thống gặp nguy hiểm. Tốt hơn là tạo các tài khoản người dùng không đặc quyền và dùng chúng ở những nơi không cần `root` đầy đủ.

Username được cấu hình trong `/etc/passwd`. Có một dòng cho mỗi user, với bảy trường thông tin được phân cách bằng dấu hai chấm, theo thứ tự là:

- Tên đăng nhập
- Một mã hash dùng để kiểm chứng mật khẩu hoặc, thông dụng hơn, một ký tự `x` để chỉ ra rằng mật khẩu được lưu trong `/etc/shadow`
- User ID
- Group ID
- Một trường comment, thường để trống
- Thư mục `home` của user
- Shell mà user này sẽ dùng (tùy chọn)

Đây là một ví dụ đơn giản trong đó chúng ta có user `root` với UID `0` và user `daemon` với UID `1`:

```
root:x:0:0:root:/root:/bin/sh
daemon:x:1:1:daemon:/usr/sbin:/bin/false
```

Đặt shell cho user `daemon` là `/bin/false` bảo đảm rằng mọi nỗ lực đăng nhập với tên đó sẽ thất bại.

Nhiều chương trình phải đọc `/etc/passwd` để tra username và UID, và vì vậy file này phải world-readable. Đây là một vấn đề nếu các hash mật khẩu cũng được lưu ở đó, vì một chương trình độc hại có thể lấy một bản sao và tìm ra mật khẩu thực bằng nhiều chương trình bẻ khóa khác nhau. Do đó, để giảm mức phơi bày của thông tin nhạy cảm này, các mật khẩu được lưu trong `/etc/shadow` và `x` được đặt vào trường mật khẩu để chỉ ra điều đó. File có tên `/etc/shadow` chỉ cần được `root` truy cập, vì vậy miễn là user `root` không bị xâm phạm, các mật khẩu vẫn an toàn. File shadow password gồm một entry cho mỗi user, gồm chín trường. Đây là một ví dụ tương ứng với file password được thể hiện ở đoạn trước:

```
root::10933:0:99999:7:::
daemon:*:10933:0:99999:7:::
```

Hai trường đầu là username và hash mật khẩu. Bảy trường còn lại liên quan đến việc hết hạn mật khẩu, thường không phải là vấn đề trên thiết bị nhúng. Nếu bạn tò mò về toàn bộ chi tiết, hãy tham khảo trang manual của `shadow(5)`.

Trong ví dụ, mật khẩu cho `root` trống, nghĩa là root có thể đăng nhập mà không cần nhập mật khẩu. Có mật khẩu trống cho `root` hữu ích trong lúc phát triển nhưng không phải cho sản xuất. Bạn có thể tạo hoặc thay đổi một hash mật khẩu bằng cách chạy lệnh `passwd` trên target, lệnh này sẽ ghi một hash mới vào `/etc/shadow`. Nếu bạn muốn tất cả các root filesystem về sau có cùng mật khẩu này, bạn có thể sao chép file này ngược về thư mục staging.

Tên group được lưu theo cách tương tự trong `/etc/group`. Có một dòng cho mỗi group gồm bốn trường được phân cách bằng dấu hai chấm. Các trường là:

- Tên của group
- Mật khẩu group, thường là ký tự `x`, chỉ ra rằng không có mật khẩu group
- GID hay group ID
- Một danh sách tùy chọn các user thuộc group này, được phân cách bằng dấu phẩy

Đây là một ví dụ:

```
root:x:0:
daemon:x:1:
```

Giờ chúng ta đã học cách cấu hình một tài khoản người dùng, hãy xem cách thêm nó vào root filesystem.

### Thêm tài khoản người dùng vào root filesystem

Trước hết, bạn phải thêm vào thư mục staging các file `etc/passwd`, `etc/shadow` và `etc/group`, như được thể hiện ở mục trước. Hãy bảo đảm quyền của `etc/shadow` là `0600`. Tiếp theo, bạn cần khởi động thủ tục đăng nhập bằng cách khởi chạy một chương trình gọi là `getty`. Có một phiên bản `getty` trong BusyBox. Bạn khởi chạy nó từ `inittab` bằng keyword `respawn`, keyword này khởi động lại `getty` khi một login shell kết thúc. `inittab` của bạn nên như thế này:

```
::sysinit:/etc/init.d/rcS
::respawn:/sbin/getty 115200 console
```

Sau đó, build lại ramdisk và thử nó bằng QEMU hoặc BeagleBone Black như trước.

Ở phần đầu chương này, chúng ta đã học cách tạo device node bằng lệnh `mknod`. Giờ hãy xem một số cách dễ hơn để tạo device node.

## Một cách tốt hơn để quản lý device node

Tạo device node tĩnh bằng `mknod` khá vất vả và không linh hoạt. Có những cách khác để tạo device node tự động theo nhu cầu:

- `devtmpfs`: Đây là một pseudo filesystem mà bạn mount lên `/dev` lúc boot. Kernel đưa vào đó device node cho tất cả các thiết bị mà kernel hiện biết, và nó tạo node cho các thiết bị mới khi chúng được phát hiện lúc runtime. Các node thuộc sở hữu của `root` và có quyền mặc định là `0600`. Một số device node well-known, chẳng hạn `/dev/null` và `/dev/random`, ghi đè mặc định thành `0666`. Để thấy chính xác việc này được làm thế nào, hãy xem file source Linux `drivers/char/mem.c` và xem cách `struct memdev` được khởi tạo.

- `mdev`: Đây là một applet BusyBox được dùng để đưa device node vào một thư mục và tạo node mới khi cần. Có một file cấu hình, `/etc/mdev.conf`, chứa các rule cho quyền sở hữu và mode của các node.

- `udev`: Đây là thứ tương đương mainstream của `mdev`. Bạn sẽ tìm thấy nó trên Linux cho máy để bàn và trong một số thiết bị nhúng. Nó rất linh hoạt và là lựa chọn tốt cho các thiết bị nhúng higher-end. Giờ nó là một phần của `systemd`.

  > **Lưu ý quan trọng**
  >
  > Dù cả `mdev` và `udev` đều tự tạo device node, sẽ dễ hơn nếu chỉ để `devtmpfs` làm việc đó và dùng `mdev`/`udev` như một lớp bên trên để hiện thực chính sách đặt quyền sở hữu và quyền truy cập. Cách tiếp cận `devtmpfs` là cách duy nhất có thể bảo trì được để tạo device node trước khi user space khởi động.

Hãy xem một số ví dụ dùng các công cụ này.

### Một ví dụ dùng devtmpfs

Hỗ trợ cho filesystem `devtmpfs` được điều khiển bởi biến cấu hình kernel `CONFIG_DEVTMPFS`. Nó không được enable trong cấu hình mặc định của ARM Versatile PB, vì vậy nếu bạn muốn thử những điều sau với target này, bạn sẽ phải quay lại cấu hình kernel và enable tùy chọn này. Thử `devtmpfs` đơn giản như nhập lệnh này:

```
# mount -t devtmpfs devtmpfs /dev
```

Bạn sẽ để ý thấy sau đó có nhiều device node hơn hẳn trong `/dev`. Để sửa vĩnh viễn, thêm dòng này vào `/etc/init.d/rcS`:

```
#!/bin/sh
mount -t proc proc /proc
mount -t sysfs sysfs /sys
mount -t devtmpfs devtmpfs /dev
```

Nếu bạn enable `CONFIG_DEVTMPFS_MOUNT` trong cấu hình kernel, kernel sẽ tự động mount `devtmpfs` ngay sau khi mount root filesystem. Tuy nhiên, tùy chọn này không có tác dụng khi boot `initramfs`, như chúng ta đang làm ở đây.

### Một ví dụ dùng mdev

Dù `mdev` thiết lập phức tạp hơn một chút, nó cho phép bạn sửa quyền của device node khi chúng được tạo. Bạn bắt đầu bằng cách chạy `mdev` với tùy chọn `-s`, khiến nó quét thư mục `/sys` để tìm thông tin về các thiết bị hiện tại. Từ thông tin này, nó đưa các node tương ứng vào thư mục `/dev`. Nếu bạn muốn theo dõi các thiết bị mới xuất hiện và cũng tạo node cho chúng, bạn cần biến `mdev` thành một hot plug client bằng cách ghi vào `/proc/sys/kernel/hotplug`. Các phần bổ sung sau vào `/etc/init.d/rcS` sẽ đạt được tất cả điều này:

```
#!/bin/sh
mount -t proc proc /proc
mount -t sysfs sysfs /sys
mount -t devtmpfs devtmpfs /dev
echo /sbin/mdev > /proc/sys/kernel/hotplug
mdev -s
```

Mode mặc định là `660` và quyền sở hữu là `root:root`. Bạn có thể thay đổi điều này bằng cách thêm rule trong `/etc/mdev.conf`. Ví dụ, để cho các thiết bị `null`, `random` và `urandom` đúng mode của chúng, bạn sẽ thêm dòng này vào `/etc/mdev.conf`:

```
null root:root 666
random root:root 444
urandom root:root 444
```

Định dạng được tài liệu hóa trong BusyBox source code ở `docs/mdev.txt`, và có thêm ví dụ trong thư mục tên `examples`.

### Rốt cuộc device node tĩnh có tệ đến vậy không?

Device node được tạo tĩnh có một lợi thế so với việc chạy một device manager: chúng không tốn thời gian tạo trong lúc boot. Nếu giảm thiểu thời gian boot là ưu tiên, dùng device node statically-created sẽ tiết kiệm được một lượng thời gian đo được.

Sau khi các thiết bị được phát hiện và node của chúng được tạo, bước tiếp theo trong trình tự khởi động thường là cấu hình mạng.

## Cấu hình mạng

Tiếp theo, hãy xem một số cấu hình mạng cơ bản để chúng ta có thể giao tiếp với thế giới bên ngoài. Tôi giả định rằng có một Ethernet interface, `eth0`, và chúng ta chỉ cần một cấu hình IPv4 đơn giản.

Các ví dụ này dùng các tiện ích mạng là một phần của BusyBox, và chúng đủ cho một trường hợp sử dụng đơn giản, dùng các chương trình `ifup` và `ifdown` old-but-reliable. Bạn có thể đọc trang manual của cả hai để biết chi tiết. Cấu hình mạng chính được lưu trong `/etc/network/interfaces`. Bạn sẽ cần tạo các thư mục sau trong thư mục staging:

```
etc/network
etc/network/if-pre-up.d
etc/network/if-up.d
var/run
```

Với địa chỉ IP tĩnh, `/etc/network/interfaces` sẽ trông như thế này:

```
auto lo
iface lo inet loopback
auto eth0
iface eth0 inet static
    address 192.168.1.101
    netmask 255.255.255.0
    network 192.168.1.0
```

Với địa chỉ IP động được cấp phát bằng DHCP, `/etc/network/interfaces` sẽ trông như thế này:

```
auto lo
iface lo inet loopback
auto eth0
iface eth0 inet dhcp
```

Bạn cũng sẽ phải cấu hình một chương trình DHCP client. BusyBox có một chương trình tên `udchpcd`. Nó cần một shell script đặt ở `/usr/share/udhcpc/default.script`. Có một bản mặc định phù hợp trong BusyBox source code ở thư mục `examples/udhcp/simple.script`.

### Các thành phần mạng cho glibc

`glibc` dùng một cơ chế được gọi là **name service switch** (**NSS**) để điều khiển cách các tên được resolve thành số cho mạng và người dùng. Ví dụ, username có thể được resolve thành UID qua file `/etc/passwd` và các dịch vụ mạng như HTTP có thể được resolve thành số cổng dịch vụ qua `/etc/services`. Tất cả điều này được cấu hình bởi `/etc/nsswitch.conf`; xem trang manual `nss(5)` để biết đầy đủ chi tiết. Đây là một ví dụ đơn giản đủ cho hầu hết các bản hiện thực embedded Linux:

```
passwd:    files
group:     files
shadow:    files
hosts:     files dns
networks:  files
protocols: files
services:  files
```

Mọi thứ được resolve bởi file có tên tương ứng trong `/etc`, trừ hostname, có thể được resolve thêm bằng DNS lookup nếu chúng không có trong `/etc/hosts`.

Để điều này hoạt động, bạn cần đưa các file đó vào `/etc`. Networks, protocols và services là như nhau trên mọi hệ thống Linux, vì vậy chúng có thể được sao chép từ `/etc` trên PC phát triển. `/etc/hosts` nên, ít nhất, chứa địa chỉ loopback:

```
127.0.0.1 localhost
```

Các file khác, `passwd`, `group` và `shadow`, đã được mô tả ở trên, trong mục *Cấu hình tài khoản người dùng*.

Mảnh ghép cuối cùng là các thư viện thực hiện việc resolve tên. Chúng là các plugin được nạp khi cần dựa trên nội dung của `nsswitch.conf`, nghĩa là chúng không xuất hiện dưới dạng phụ thuộc nếu bạn dùng `readelf` hay `ldd`. Bạn sẽ đơn giản phải sao chép chúng từ `sysroot` của toolchain:

```
$ cd ~/rootfs
$ cp -a $SYSROOT/lib/libnss* lib
$ cp -a $SYSROOT/lib/libresolv* lib
```

Thư mục staging của chúng ta giờ đã hoàn chỉnh, vì vậy hãy tạo một filesystem từ nó.

## Tạo filesystem image với device table

Chúng ta đã thấy ở trên, trong mục *Tạo một boot initramfs*, rằng kernel có một tùy chọn để tạo `initramfs` bằng device table. Device table thực sự hữu ích vì chúng cho phép một người dùng non-root tạo device node và cấp phát các giá trị UID và GID tùy ý cho bất kỳ file hay thư mục nào. Khái niệm tương tự đã được áp dụng cho các công cụ tạo các định dạng filesystem image khác, như được thể hiện trong ánh xạ từ định dạng filesystem sang công cụ sau:

- `jffs2`: `mkfs.jffs2`
- `ubifs`: `mkfs:ubifs`
- `ext2`: `genext2fs`

Chúng ta sẽ xem `jffs2` và `ubifs` trong [*Chương 9*](ch09_creating_a_storage_strategy.vi.md), *Xây dựng chiến lược lưu trữ*, khi xem các filesystem cho bộ nhớ flash. Cái thứ ba, `ext2`, là một định dạng thường được dùng cho bộ nhớ managed flash bao gồm thẻ SD. Ví dụ sau dùng `ext2` để tạo một disk image có thể được sao chép lên thẻ SD.

Để bắt đầu, bạn cần cài công cụ `genext2fs` trên host. Trên Ubuntu, package cần cài có tên `genext2fs`:

```
$ sudo apt install genext2fs
```

`genext2fs` nhận một file device table với định dạng `<name> <type> <mode> <uid> <gid> <major> <minor> <start> <inc> <count>`, trong đó ý nghĩa của các trường như sau:

- `name`:

- `type`: Một trong các giá trị sau:

  `f`: Một file thông thường

  `d`: Một thư mục

  `c`: Một file thiết bị đặc biệt dạng character

  `b`: Một file thiết bị đặc biệt dạng block

  `p`: Một FIFO (named pipe)

- `uid`: UID của file

- `gid`: GID của file

- `major` và `minor`: Các số thiết bị (chỉ cho device node)

- `start`, `inc` và `count`: Cho phép bạn tạo một nhóm device node bắt đầu từ số minor trong start (chỉ cho device node)

Bạn không phải chỉ định mọi file, như khi làm với bảng `initramfs` của kernel. Bạn chỉ cần trỏ tới một thư mục—thư mục staging—và liệt kê các thay đổi và ngoại lệ bạn cần thực hiện trong filesystem image cuối cùng.

Một ví dụ đơn giản đưa vào các device node tĩnh cho chúng ta như sau:

```
/dev d 755 0 0 - - - - -
/dev/null c 666 0 0 1 3 0 0 -
/dev/console c 600 0 0 5 1 0 0 -
/dev/ttyO0 c 600 0 0 252 0 0 0 -
```

Sau đó, bạn có thể dùng `genext2fs` để tạo một filesystem image 4 MB (tức là 4,096 block với kích thước mặc định 1,024 byte):

```
$ genext2fs -b 4096 -d rootfs -D device-table.txt -U rootfs.ext2
```

Bây giờ, bạn có thể sao chép image thu được, `rootfs.ext2`, lên thẻ SD hoặc tương tự, việc chúng ta sẽ làm tiếp theo.

### Boot BeagleBone Black

Script có tên `MELP/format-sdcard.sh` tạo hai phân vùng trên thẻ microSD: một cho các file boot và một cho root filesystem. Giả sử bạn đã tạo root filesystem image như được thể hiện ở mục trước, bạn có thể dùng lệnh `dd` để ghi nó vào phân vùng thứ hai. Như mọi khi, khi sao chép file trực tiếp vào thiết bị lưu trữ như thế này, hãy tuyệt đối chắc chắn bạn biết đâu là thẻ microSD. Trong trường hợp này, tôi đang dùng một đầu đọc thẻ built-in, là thiết bị có tên `/dev/mmcblk0`, vì vậy lệnh như sau:

```
$ sudo dd if=rootfs.ext2 of=/dev/mmcblk0p2
```

Lưu ý rằng đầu đọc thẻ trên hệ thống host của bạn có thể có tên khác.

Sau đó, cắm thẻ micro SD vào BeagleBone Black, và đặt kernel command line thành `root=/dev/mmcblk0p2`. Chuỗi lệnh U-Boot đầy đủ như sau:

```
fatload mmc 0:1 0x80200000 zImage
fatload mmc 0:1 0x80f00000 am335x-boneblack.dtb
setenv bootargs console=ttyO0,115200 root=/dev/mmcblk0p2
bootz 0x80200000 – 0x80f00000
```

Đây là một ví dụ về việc mount một filesystem từ một block device thông thường, chẳng hạn thẻ SD. Các nguyên tắc tương tự áp dụng cho các loại filesystem khác và chúng ta sẽ xem chúng chi tiết hơn trong [*Chương 9*](ch09_creating_a_storage_strategy.vi.md), *Xây dựng chiến lược lưu trữ*.

## Mount root filesystem bằng NFS

Nếu thiết bị của bạn có network interface, thường hữu ích khi mount root filesystem qua mạng trong lúc phát triển. Nó cho bạn truy cập vào bộ lưu trữ gần như không giới hạn trên máy host, vì vậy bạn có thể thêm vào các công cụ debug và file thực thi có bảng symbol lớn. Như một phần thưởng thêm, các cập nhật thực hiện với root filesystem trên máy phát triển có sẵn ngay lập tức trên target. Bạn cũng có thể truy cập tất cả các log file của target từ host.

Để bắt đầu, bạn cần cài và cấu hình một NFS server trên host. Trên Ubuntu, package cần cài có tên `nfs-kernel-server`:

```
$ sudo apt install nfs-kernel-server
```

NFS server cần được cho biết thư mục nào đang được export ra mạng; điều này được điều khiển bởi `/etc/exports`. Có một dòng cho mỗi export. Định dạng được mô tả trong trang manual `exports(5)`. Ví dụ, để export root filesystem trên host của tôi, tôi có dòng này:

```
/home/chris/rootfs *(rw,sync,no_subtree_check,no_root_squash)
```

`*` export thư mục tới bất kỳ địa chỉ nào trên mạng cục bộ của tôi. Nếu muốn, bạn có thể đưa một địa chỉ IP duy nhất hoặc một dải tại đây. Tiếp theo là một danh sách tùy chọn được bao trong ngoặc đơn. Không được có khoảng trắng nào giữa `*` và dấu mở ngoặc. Các tùy chọn là:

- `rw`: Export thư mục ở chế độ read-write.
- `sync`: Tùy chọn này chọn phiên bản đồng bộ của protocol NFS, bền vững hơn nhưng chậm hơn một chút so với tùy chọn `async`.
- `no_subtree_check`: Tùy chọn này disable việc kiểm tra subtree, có hàm ý bảo mật nhẹ, nhưng có thể cải thiện độ tin cậy trong một số trường hợp.
- `no_root_squash`: Tùy chọn này cho phép các request từ user ID `0` được xử lý mà không bị squash sang một user ID khác. Nó cần thiết để cho phép target truy cập đúng các file thuộc sở hữu của `root`.

Sau khi đã thay đổi `/etc/exports`, khởi động lại NFS server để áp dụng chúng.

Bây giờ, bạn cần thiết lập target để mount root filesystem qua NFS. Để việc này hoạt động, kernel của bạn phải được cấu hình với `CONFIG_ROOT_NFS`. Sau đó, bạn có thể cấu hình Linux để thực hiện mount lúc boot bằng cách thêm dòng sau vào kernel command line:

```
root=/dev/nfs rw nfsroot=<host-ip>:<root-dir> ip=<target-ip>
```

Các tùy chọn như sau:

- `rw`: Mount root filesystem ở chế độ read-write.

- `nfsroot`: Chỉ định địa chỉ IP của host, theo sau là đường dẫn tới root filesystem đã export.

- `ip`: Đây là địa chỉ IP được gán cho target. Thông thường, địa chỉ mạng được gán lúc runtime, như chúng ta đã thấy trong mục *Cấu hình mạng*. Tuy nhiên, trong trường hợp này, interface phải được cấu hình trước khi root filesystem được mount và `init` được khởi động. Do đó, nó được cấu hình trên kernel command line.

  > **Lưu ý quan trọng**
  >
  > Có thêm thông tin về NFS root mount trong kernel source ở `Documentation/filesystems/nfs/nfsroot.txt`.

Tiếp theo, hãy boot một image hoàn chỉnh với root filesystem trên QEMU và BeagleBone Black.

### Test với QEMU

Script sau tạo một mạng ảo giữa thiết bị mạng có tên `tap0` trên host và `eth0` trên target dùng một cặp địa chỉ IPv4 tĩnh rồi khởi chạy QEMU với các tham số để dùng `tap0` làm interface được giả lập.

Bạn sẽ cần đổi đường dẫn tới root filesystem thành đường dẫn đầy đủ tới thư mục staging của bạn và có thể cả các địa chỉ IP nếu chúng xung đột với cấu hình mạng của bạn:

```
#!/bin/bash
KERNEL=zImage
DTB=versatile-pb.dtb
ROOTDIR=/home/chris/rootfs
HOST_IP=192.168.1.1
TARGET_IP=192.168.1.101
NET_NUMBER=192.168.1.0
NET_MASK=255.255.255.0
sudo tunctl -u $(whoami) -t tap0
sudo ifconfig tap0 ${HOST_IP}
sudo route add -net ${NET_NUMBER} netmask ${NET_MASK} dev tap0
sudo sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"
QEMU_AUDIO_DRV=none \
qemu-system-arm -m 256M -nographic -M versatilepb -kernel ${KERNEL} -append "console=ttyAMA0,115200 root=/dev/nfs rw nfsroot=${HOST_IP}:${ROOTDIR} ip=${TARGET_IP}" -dtb ${DTB} -net nic -net tap,ifname=tap0,script=no
```

Script có tại `MELP/Chapter05/run-qemu-nfsroot.sh`.

Nó sẽ boot như trước, giờ dùng trực tiếp thư mục staging qua NFS export. Mọi file bạn tạo trong thư mục đó sẽ hiển thị ngay lập tức với thiết bị đích, và mọi file được tạo trên thiết bị sẽ hiển thị với PC phát triển.

### Test với BeagleBone Black

Theo cách tương tự, bạn có thể nhập các lệnh này tại dấu nhắc U-Boot của BeagleBone Black:

```
setenv serverip 192.168.1.1
setenv ipaddr 192.168.1.101
setenv npath [path to staging directory]
setenv bootargs console=ttyO0,115200 root=/dev/nfs rw nfsroot=${serverip}:${npath} ip=${ipaddr}
fatload mmc 0:1 0x80200000 zImage
fatload mmc 0:1 0x80f00000 am335x-boneblack.dtb
bootz 0x80200000 - 0x80f00000
```

Có một file môi trường U-Boot trong `MELP/Chapter05/uEnv.txt`, chứa tất cả các lệnh này. Chỉ cần sao chép nó vào phân vùng boot của thẻ microSD và U-Boot sẽ làm phần còn lại.

### Vấn đề về quyền truy cập file

Các file bạn đã sao chép vào thư mục staging sẽ thuộc sở hữu của UID của người dùng bạn đang đăng nhập, thường là `1000`. Tuy nhiên, target không biết gì về người dùng này. Hơn nữa, mọi file do target tạo sẽ thuộc sở hữu của các người dùng được target cấu hình, thường là user `root`. Toàn bộ mọi thứ là một mớ hỗn độn. Không may, không có lối thoát đơn giản. Giải pháp tốt nhất là tạo một bản sao của thư mục staging và đổi quyền sở hữu UID và GID thành `0`, dùng lệnh `sudo chown -R 0:0 *`. Sau đó, export thư mục này làm NFS mount. Cách này mất đi sự tiện lợi của việc chỉ có một bản sao root filesystem dùng chung giữa hệ thống phát triển và hệ thống target, nhưng ít nhất quyền sở hữu file sẽ đúng.

Trong embedded Linux, việc link device driver tĩnh vào kernel thay vì nạp chúng động từ root filesystem dưới dạng module lúc runtime không phải là hiếm. Vậy làm sao chúng ta có được cùng lợi ích lặp nhanh mà NFS mang lại khi sửa kernel source code hay DTB? Câu trả lời là TFTP.

## Dùng TFTP để nạp kernel

Giờ chúng ta đã biết cách mount root filesystem qua mạng bằng NFS, có thể bạn đang tự hỏi liệu có cách nào để nạp kernel, device tree và `initramfs` qua mạng hay không. Nếu làm được điều này, thành phần duy nhất cần được ghi vào bộ lưu trữ trên target là bootloader. Mọi thứ khác có thể được nạp từ máy host. Nó sẽ tiết kiệm thời gian vì bạn không cần liên tục flash lại target, và bạn thậm chí có thể làm việc trong khi các driver bộ lưu trữ flash vẫn đang được phát triển (chuyện này có xảy ra).

**Trivial File Transfer Protocol** (**TFTP**) là câu trả lời cho vấn đề này. TFTP là một protocol truyền file rất đơn giản, được thiết kế để dễ hiện thực trong các bootloader như U-Boot.

Để bắt đầu, bạn cần cài một TFTP daemon trên host. Trên Ubuntu, package cần cài có tên `tftpd-hpa`:

```
$ sudo apt install tftpd-hpa
```

Theo mặc định, `tftpd-hpa` cấp quyền read-only cho các file trong thư mục `/var/lib/tftpboot`. Với `tftpd-hpa` đã được cài và đang chạy, sao chép các file bạn muốn chuyển sang target vào `/var/lib/tftpboot`, mà với BeagleBone Black sẽ là `zImage` và `am335x-boneblack.dtb`. Sau đó nhập các lệnh này tại dấu nhắc lệnh U-Boot:

```
setenv serverip 192.168.1.1
setenv ipaddr 192.168.1.101
tftpboot 0x80200000 zImage
tftpboot 0x80f00000 am335x-boneblack.dtb
setenv npath [path to staging]
setenv bootargs console=ttyO0,115200 root=/dev/nfs rw nfsroot=${serverip}:${npath} ip=${ipaddr}
bootz 0x80200000 - 0x80f00000
```

Bạn có thể thấy lệnh `tftpboot` bị treo, liên tục in ra chữ `T`, nghĩa là các request TFTP đang bị timeout. Có một số lý do khiến điều này xảy ra, phổ biến nhất là:

- Địa chỉ IP sai cho `serverip`.
- TFTP daemon không chạy trên server.
- Có một firewall trên server chặn protocol TFTP. Hầu hết firewall quả thực chặn cổng TFTP, `69`, theo mặc định.

Khi bạn đã giải quyết vấn đề, U-Boot có thể nạp các file từ máy host và boot theo cách thông thường. Bạn có thể tự động hóa quá trình bằng cách đặt các lệnh vào một file `uEnv.txt`.

## Tóm tắt

Một trong những thế mạnh của Linux là nó có thể hỗ trợ rất nhiều loại root filesystem, và vì vậy có thể được may đo cho rất nhiều nhu cầu. Chúng ta đã thấy rằng có thể dựng thủ công một root filesystem đơn giản với một số ít thành phần và rằng BusyBox đặc biệt hữu ích về mặt này. Bằng cách đi qua quá trình từng bước một, nó đã cho chúng ta cái nhìn sâu vào một số hoạt động cơ bản của các hệ thống Linux, bao gồm cấu hình mạng và tài khoản người dùng. Tuy nhiên, công việc nhanh chóng trở nên khó quản lý khi các thiết bị phức tạp hơn. Và, luôn có nỗi lo ever-present rằng có thể có một lỗ hổng bảo mật trong bản hiện thực mà chúng ta chưa nhận ra.

Trong chương tiếp theo, tôi sẽ chỉ cho bạn cách dùng một build system nhúng có thể làm quá trình tạo một hệ thống embedded Linux dễ dàng và đáng tin cậy hơn nhiều. Tôi sẽ bắt đầu bằng việc xem Buildroot, rồi chuyển sang xem Yocto Project phức tạp hơn nhưng mạnh mẽ.

## Đọc thêm

- *Filesystem Hierarchy Standard*, *Version 3.0* – [https://refspecs.linuxfoundation.org/fhs.shtml](https://refspecs.linuxfoundation.org/fhs.shtml)
- *ramfs, rootfs and initramfs*, của Rob Landley, là một phần của Linux source ở `Documentation/filesystems/ramfs-rootfs-initramfs.txt`
