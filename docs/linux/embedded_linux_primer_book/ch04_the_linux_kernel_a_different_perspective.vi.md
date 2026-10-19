# Chương 4. Linux Kernel: Góc nhìn khác

## Trong chương này

- 4\.1 Bối cảnh 64

- 4\.2 Cấu tạo Linux Kernel 68

- 4\.3 Kernel Build System 78

- 4\.4 Kernel Configuration 89

- 4\.5 Kernel Documentation 96

- 4\.6 Lấy Custom Linux Kernel 96

- 4\.7 Tổng kết 97

Nếu muốn tìm hiểu kernel internals, có nhiều sách tốt về kernel design

và hoạt động. Một số được giới thiệu ở phần cuối chương này

cũng như chương khác. Tuy nhiên rất ít tài liệu nói cách

tổ chức và cấu trúc kernel từ góc nhìn dự án. Nếu bạn đang

tìm đúng nơi thêm custom support cho dự án embedded mới

thì sao? Làm thế nào biết file nào quan trọng với architecture của mình?

Thoạt nhìn có vẻ gần như bất khả thi để hiểu Linux

kernel và cách cấu hình cho platform hoặc application cụ thể. Trong một

Linux kernel snapshot gần đây, kernel source tree gồm hơn

28.000[^1] file chứa khoảng 10 đến 11 triệu[^2] dòng code,

tùy cách đếm dòng code thực tế.[^3] Đó mới chỉ là bắt đầu.

Bạn còn cần tool (rõ nhất là compiler) và root file system

chứa nhiều Linux application để dựng hệ thống dùng được.

Chương giới thiệu Linux kernel, trình bày cách tổ chức kernel và

cấu trúc source tree. Sau đó xem thành phần tạo

kernel image và bàn kernel source tree layout. Tiếp theo,

trình bày chi tiết kernel build system và file điều khiển kernel

configuration/build system. Cuối chương xem các yêu

cầu cho embedded Linux system hoàn chỉnh.

## 4.1 Bối cảnh

Linus Torvalds viết version Linux đầu tiên khi còn là sinh viên University of Helsinki ở Phần Lan. Công việc bắt đầu năm 1991. Tháng 8 năm đó, Torvalds đăng thông báo nay đã now-famous trên `comp.os.minix`:

```
From: torvalds@klaava.Helsinki.FI (Linus Benedict Torvalds)
Newsgroups: comp.os.minix
Subject: What would you like to see most in minix?
Summary: small poll for my new operating system
Message-ID: <1991Aug25.205708.9541@klaava.Helsinki.FI>
Date: 25 Aug 91 20:57:08 GMT
Organization: University of Helsinki


Hello everybody out there using minix -

I’m doing a (free) operating system (just a hobby, won’t be big and profession-
al like gnu) for 386(486) AT clones.  This has been brewing since april, and is
starting to get ready.  I’d like any feedback on things people like/dislike in
minix, as my OS resembles it somewhat(same physical layout of the file-system (due
to practical reasons) among other things).

I’ve currently ported bash(1.08) and gcc(1.40), and things seem to work. This im-
plies that I’ll get something practical within a few months, and I’d like to know
what features most people would want.  Any suggestions are welcome, but I won’t
promise I’ll implement them :-)

              Linus (torvalds@kruuna.helsinki.fi)

PS.  Yes - it’s free of any minix code, and it has a multi-threaded fs.
It is NOT protable (uses 386 task switching etc), and it probably never
will support anything other than AT-harddisks, as that’s all I have :-(.
```

Từ release đầu tiên, Linux trưởng thành thành operating system full-featured với robustness, reliability và feature high-end sánh ngang commercial operating system tốt nhất. Một số ước tính hơn nửa Internet server trên Web chạy Linux. Ai cũng biết Google dùng tập hợp lớn PC low-cost chạy Linux fault-tolerant để triển khai search engine phổ biến.

### 4.1.1 Kernel Version

Có thể lấy source code Linux kernel và component bổ sung từ nhiều nơi. Hiệu sách địa phương có thể kèm version trên CD-ROMs trong sách Linux. Cũng có thể tải kernel hoặc cả distribution từ nhiều nơi trên Internet. Địa chỉ chính thức Linux kernel là iswww.kernel.org. Bạn thường nghe mainline source/mainline kernel để chỉ source tree tại kernel.org.

Đã khá lâu Linux 2.6 là version hiện tại. Đầu development cycle, developer chọn numbering system phân biệt source tree để phát triển/thử nghiệm và source tree ổn định production-ready. Scheme gồm major version, minor version và sequence number. Trước Linux 2.6, minor chẵn chỉ production kernel, lẻ chỉ development kernel. Ví dụ:

- Linux 2.4.x—Production kernel

- Linux 2.5.x—Thử nghiệm (phát triển)

- Linux 2.6.x—Production kernel

Hiện kernel Linux 2.6 không có development branch riêng. Mọi feature mới, enhancement và bug fix đi qua một loạt gatekeeper, cuối cùng lọc/đẩy thay đổi lên Linux source tree top-level do Andrew Morton và Linus Torvalds duy trì.

Dễ biết kernel version đang làm việc. Vài dòng đầu makefile top-level[^4] trong kernel source tree nêu chính xác version của instance đó. Với release 2.6.30:

```
VERSION = 2
PATCHLEVEL = 6
SUBLEVEL = 30
EXTRAVERSION =
NAME=Man-Eating Seals of Antiquity
```

Sau đó trong cùng makefile, các macro tạo macro version-level như:

```
KERNELVERSION=$(VERSION).$(PATCHLEVEL).$(SUBLEVEL)$(EXTRAVERSION)
```

Macro dùng nhiều nơi trong kernel build system chỉ kernel version. Kernel gần đây giảm dùng xuống vài chỗ trong directory scripts. Thay bằng descriptive string đầy đủ hơn tên `KERNELRELEASE`. Chứa kernel version cùng tag tương ứng source control revision level từ `git`, source control system Linux dùng.

`KERNELRELEASE` dùng nhiều nơi trong kernel source tree. Macro cũng build vào kernel image để query từ console. Kiểm tra kernel release string từ command prompt hệ thống đang chạy:

```
$ cat /proc/version
Linux version 2.6.13 (chris@pluto) (gcc version 4.0.0 (DENX ELDK 4.0
4.0.0)) #2 Thu Feb 16 19:30:13 EST 2006
```

Lưu ý cuối về version: dễ theo dõi version trong dự án bằng tùy chỉnh field `EXTRAVERSION`. Ví dụ đang phát triển enhancement cho kernel feature mới, có thể đặt `EXTRAVERSION` như:

```
EXTRAVERSION=-foo
```

Sau đó dùng `cat /proc/version` sẽ thấy `Linux version 2.6.13-foo`, giúp phân biệt development version của kernel riêng.

### 4.1.2 Kernel Source Repository

Địa chỉ chính thức source code là www.kernel.org. Có cả version hiện tại/lịch sử và nhiều patch. FTP repository chính ftp.kernel.org chứa subdirectory từ Linux 1.0. Kernel.org là trọng tâm hoạt động phát triển kernel đang diễn ra.

Tải kernel gần đây từ kernel.org sẽ thấy file cho hơn 20 architecture/subarchitecture. Nhiều development tree khác hỗ trợ major architecture. Một lý do là lượng developer và thay đổi quá lớn. Nếu mọi developer mọi architecture gửi patch vào một source tree, maintainer ngập thay đổi/patch management, không còn phát triển feature. Ai làm kernel development cũng biết đã rất bận!

Có public source tree khác ngoài mainline kernel.org, chủ yếu phát triển architecture-specific. Ví dụ developer MIPS có thể tìm kernel phù hợp tại atwww.linux-mips.org. Thường công việc trong architecture tree cuối cùng gửi mainline maintainer. Phần lớn cố sync mainline thường xuyên để theo phát triển mới khi có thể. Nhưng không luôn dễ đưa patch vào mainline. Thực tế luôn có khác biệt giữa architecture kernel tree và mainline tại mỗi thời điểm.

Nếu muốn tìm kernel cho application, tốt nhất lấy Linux source tree stable mới nhất. Kiểm tra hỗ trợ processor, rồi tìm Linux kernel mailing list cho patch/issue liên quan. Cũng tìm mailing list sát quan tâm nhất và tra archive.

Phụ lục E, “Tài nguyên mã nguồn mở”, chứa tham khảo/nguồn thông tin tốt về kernel source repository, mailing list, v.v.

### 4.1.3 Dùng git tải Kernel

Cách đơn giản nhất tải kernel mới nhất là `git`, công cụ source control management được Linux kernel community chọn. Repository phần lớn desktop distribution hiện đại có version `git`. Ví dụ Ubuntu,[^5] nhập lệnh sau cài `git` trên desktop/laptop PC:

```
$ sudo apt-get install git-core
```

[^6]

Sau khi cài đúng `git`, dùng lệnh `git clone` clone source tree `git`:

```
$ git clone
git://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux-2.6.git linux-2.6
```

Tạo directory mới dưới current directory tên `linux-2.6`, chứa cloned tree từ kernel.org. Nhiều tutorial/web page dạy `git`. Có thể bắt đầu hướng dẫn Jeff Garzik: http://linux.yyz.us/git-howto.html.

## 4.2 Cấu tạo Linux Kernel

Các phần tiếp theo khám phá layout, tổ chức và cấu tạo Linux kernel. Kiến thức giúp dễ điều hướng code base lớn/phức tạp. Qua thời gian cải tiến đáng kể source tree organization, nhất là architecture branch hỗ trợ nhiều architecture/machine type.

### 4.2.1 Source Directory Top-Level

Sách thường nói source directory top-level, luôn chỉ directory highest-level trong kernel source tree. Có thể ở bất cứ đâu, nhưng desktop Linux workstation thường tại `/usr/src/linux-x.y.z`, với `x.y.z` là version. Xuyên sách dùng viết tắt `.../` chỉ kernel source directory top-level.

Kernel source directory top-level chứa subdirectory sau. (Bỏ nondirectory entry và directory source control để rõ/gọn.)

```
arch/           firmware/  kernel/   scripts/
block/          fs/        lib/      security/
crypto/         include/   mm/       sound/
Documentation/  init/      net/      usr/
drivers/        ipc/       samples/  virt/
```

Nhiều directory chứa thêm nhiều tầng subdirectory với source code, makefile và configuration file. Nhánh lớn nhất nằm dưới `.../drivers`, hỗ trợ Ethernet network card, USB controller và vô số hardware device. Như đoán được, `.../arch` lớn thứ nhì, hỗ trợ hơn 20 processor architecture riêng.

File khác trong Linux subdirectory top-level gồm makefile top-level, hidden configuration file (dot-config, giới thiệu mục 4.3.1, “The Dot-Config”), và informational file không tham gia build. Cuối cùng sau build thành công có hai build target quan trọng ở kernel source tree top-level: `System.map` và kernel thực sự `vmlinux`. Phần tiếp mô tả cả hai.

### 4.2.2 Compile Kernel

Hiểu software lớn như Linux có thể đáng sợ. Quá lớn để đơn giản “step through” code theo dõi. Multithreading/preemption thêm phức tạp phân tích. Ngay tìm entry point (dòng code đầu chạy khi vào kernel) cũng khó. Cách hữu ích hiểu cấu trúc binary image lớn là xem build component.

Output kernel build system gồm common file và một/nhiều binary module architecture-specific. Common file luôn build bất kể architecture. Hai file là `System.map` và `vmlinux`. File đầu hữu ích khi debug, đặc biệt thú vị, chứa list kernel symbol human-readable cùng address. File sau là file ELF [^7] architecture-specific dạng executable. Makefile kernel top-level tạo cho mọi architecture. Nếu compile có symbolic debug information, nằm trong image `vmlinux`. Thực tế dù ELF executable, gần như không boot trực tiếp, như sắp thấy.

Listing 4-1 là đoạn output khi chạy `make` trong kernel tree gần đây cấu hình ARM XScale. Source tree cấu hình cho ADI Engineering Coyote reference board dựa Intel IXP425 network processor bằng:

```
$ make ARCH=arm CROSS_COMPILE=xscale_be- ixp4xx_defconfig
```

Lệnh không build kernel mà chuẩn bị source tree cho XScale, gồm initial default configuration cho architecture/processor. Tạo default configuration (file dot-config) điều khiển kernel build, dựa default trong `ixp4xx_defconfig`. Mục 4.3, “Kernel Build System” nói thêm configuration process.

Listing 4-1 chỉ hiển thị vài dòng đầu/cuối build output để thảo luận.

LISTING 4-1 Kernel Build Output

```
$ make ARCH=arm CROSS_COMPILE=xscale_be- zImage
  CHK     include/linux/version.h
  UPD     include/linux/version.h
  Generating include/asm-arm/mach-types.h
  CHK     include/linux/utsrelease.h
  UPD     include/linux/utsrelease.h
  SYMLINK include/asm -> include/asm-arm
  CC      kernel/bounds.s
  GEN     include/linux/bounds.h
  CC      arch/arm/kernel/asm-offsets.s
  .
  . <hundreds of lines of output omitted here>
  .
  LD      vmlinux
  SYSMAP  System.map
  SYSMAP  .tmp_System.map
  OBJCOPY arch/arm/boot/Image
  Kernel: arch/arm/boot/Image is ready
  AS      arch/arm/boot/compressed/head.o
  GZIP    arch/arm/boot/compressed/piggy.gz
  AS      arch/arm/boot/compressed/piggy.o
  CC      arch/arm/boot/compressed/misc.o
  AS      arch/arm/boot/compressed/head-xscale.o
  AS      arch/arm/boot/compressed/big-endian.o
  LD      arch/arm/boot/compressed/vmlinux
  OBJCOPY arch/arm/boot/zImage
  Kernel: arch/arm/boot/zImage is ready

  ...
```

Đầu tiên chú ý invocation: cả architecture (`ARCH=arm`) và toolchain[^8] (`CROSS_COMPILE=xscale_be-`) chỉ định trên command line. Buộc `make` dùng XScale toolchain[^9] build kernel image, nhánh arm-specific cho phần architecture-dependent. Cũng chỉ định target zImage, phổ biến nhiều architecture, mô tả Chương 5 “Kernel Initialization”. Kernel hiện đại build default target đúng không cần chỉ định target `make`, nên có thể không cần zImage/target khác.

Điều tiếp theo là command thực tế mỗi bước ẩn và thay shorthand notation. Mục đích làm sạch output, chú ý intermediate build issue, đặc biệt compiler warning. Source tree cũ in chi tiết mọi compilation/link command, thường nhiều dòng mỗi bước. Kết quả gần như không đọc được, warning bị chìm. Hệ thống mới cải thiện rõ vì dễ thấy anomaly. Muốn xem build step đầy đủ, buộc verbose output bằng `V=1` trên command line `make`:

```
$ make ARCH=arm CROSS_COMPILE=xscale_be- V=1 zImage
```

Đã bỏ phần lớn compile/link step Listing 4-1 cho rõ. (Build này hơn 1.000 command riêng compile, link và khác, sẽ rất dài.) Khi mọi intermediate file/library archive build/compile xong, ghép thành ELF build target lớn `vmlinux`. Dù architecture-specific, `vmlinux` là common target cho mọi Linux architecture hỗ trợ, nằm kernel source directory top-level để dễ tham chiếu.

### 4.2.3 Kernel thực sự: vmlinux

Chú ý dòng Listing 4-1:

```
LD vmlinux
```

File `vmlinux` là kernel thực sự. ELF image monolithic, stand-alone hoàn toàn. Tức binary `vmlinux` không unresolved external reference.. Khi thực thi đúng context (bootloader thiết kế boot Linux kernel), nó boot board đang chạy, để lại kernel đầy đủ chức năng. (Thực tế target ELF `vmlinux` hiếm dùng trực tiếp. Gần như luôn dùng dạng nén tạo ở bước cuối Listing 4-1. Sắp nói nhiều hơn.)

Theo triết lý hiểu hệ thống trước hết hiểu thành phần, xem cấu tạo kernel object `vmlinux`. Listing 4-2 tái hiện link stage thực của build tạo ELF object `vmlinux`. Đã format ngắt dòng (ký tự UNIX line-continuation `\`) cho dễ đọc, ngoài ra đúng output link step `vmlinux` từ Listing 4-1. Nếu build kernel thủ công, đây là link command cần chạy.

LISTING 4-2 Link Stage: `vmlinux`

```
$ xscale_be-ld -EB  -p --no-undefined -X  -o vmlinux \
-T arch/arm/kernel/vmlinux.lds    \
arch/arm/kernel/head.o            \
arch/arm/kernel/init_task.o       \
init/built-in.o                   \
--start-group                     \
  usr/built-in.o                  \
  arch/arm/kernel/built-in.o      \
  arch/arm/mm/built-in.o          \
  arch/arm/common/built-in.o      \
  arch/arm/mach-ixp4xx/built-in.o \
  arch/arm/nwfpe/built-in.o       \
  kernel/built-in.o               \
  mm/built-in.o                   \
  fs/built-in.o                   \
  ipc/built-in.o                  \
  security/built-in.o             \
  crypto/built-in.o               \
  block/built-in.o                \
  arch/arm/lib/lib.a              \
  lib/lib.a                       \
  arch/arm/lib/built-in.o         \
  lib/built-in.o                  \
  drivers/built-in.o              \
  sound/built-in.o                \
  firmware/built-in.o             \
  net/built-in.o                  \
--end-group                       \
.tmp_kallsyms2.o
```

### 4.2.4 Kernel Image Component

Từ Listing 4-2, bạn có thể thấy image `vmlinux` gồm nhiều binary image thành phần. Lúc này, chưa cần hiểu mục đích của từng thành phần. Điều quan trọng là hiểu góc nhìn top-level về những thành phần tạo nên kernel. Dòng đầu tiên của link command trong Listing 4-2 chỉ định output file (`-o vmlinux`). Dòng thứ hai chỉ định linker script file (`-T vmlinux.lds`), một bản hướng dẫn chi tiết về cách link kernel binary image.[^10]

Dòng ba trở đi Listing 4-2 chỉ object module tạo binary image. Chú ý object đầu `head.o`, assemble từ `.../arch/arm/kernel/head.S`, assembly source architecture-specific thực hiện kernel initialization rất low-level. Muốn tìm dòng code đầu kernel thực thi, hợp lý bắt đầu ở đây vì cuối cùng là code đầu trong binary image do link stage tạo. Chương 5 xem kỹ initialization.

Object kế `init_task.o` thiết lập initial thread/task structure kernel cần. Sau đó nhiều object module cùng tên `built-in.o`. Nhưng mỗi object `built-in.o` đến phần kernel source tree cụ thể như path trước tên `built-in.o` chỉ ra. Đây là binary object trong image. Minh họa giúp rõ hơn.

Hình 4-1 minh họa cấu tạo binary image `vmlinux`. Có section cho mỗi dòng link stage. Không đúng tỷ lệ vì chỗ hạn chế, nhưng thấy relative size functional component. Một số rất nhỏ, như sound/firmware mỗi cái 8 byte trong build vì empty object file. (Sound compile module, build không firmware.)

Không ngạc nhiên ba binary component lớn nhất là file system code, network code và mọi driver built-in. Gộp kernel code cùng code architecture-specific là component next-largest. Có scheduler, process/thread management, timer management và core functionality khác. Dĩ nhiên kernel chứa chức năng architecture-specific như context switching low-level, xử lý interrupt/timer hardware-level, processor exception handling, v.v., trong `.../arch/arm/kernel`.

Nhớ đây là ví dụ build cụ thể cho ARM XScale, chính xác hơn Intel IXP425 network processor trên ADI Engineering reference board. Hình 4-1 thấy binary component machine-specific `arch/arm/mach-ixp4xx`. Mỗi architecture/machine type (processor/reference board) khác phần architecture-specific nên cấu tạo image `vmlinux` hơi khác. Hiểu một ví dụ sẽ dễ điều hướng ví dụ khác.

![Figure 4-1](images/ch04/fig04-01.png)

HÌNH 4-1 Component của image `vmlinux`

Để hiểu phân chia chức năng source tree, Bảng 4-1 liệt kê từng component Hình 4-1 và mô tả binary element tạo image `vmlinux`.

BẢNG 4-1 Component của Image `vmlinux`

| Component | Mô tả |
|---|---|
| `arch/arm/kernel/head.o` | Startup code Kernel-architecture-specific. |
| `arch/arm/kernel/init_task.o` | Initial thread và task struct kernel cần. |
| `init/built-in.o` | Main kernel initialization code. Xem Chương 5. |
| `usr/built-in.o` | Image initramfs Built-in. Xem Chương 6. |
| `arch/arm/kernel/built-in.o` | Kernel code Architecture-specific. |
| `arch/arm/mm/built-in.o` | Code memory-management Architecture-specific. |
| `arch/arm/common/built-in.o` | Generic code Architecture-specific. Khác theo architecture. |
| `arch/arm/mach-ixp4xx/built-in.o` | Code Machine-specific, thường initialization. |
| `arch/arm/nwfpe/built-in.o` | Code mô phỏng floating-point Architecture-specific. |
| `kernel/built-in.o` | Common component của chính kernel. |
| `mm/built-in.o` | Common component của code memory-management. |
| `fs/built-in.o` | File system code. |
| `ipc/built-in.o` | Interprocess communication như SysV IPC. |
| `security/built-in.o` | Linux security component. |
| `crypto/built-in.o` | Cryptographic API. |
| `block/built-in.o` | Core code kernel block layer. |
| `arch/arm/lib/lib.a` | Common facility Architecture-specific. Khác theo architecture. |
| `lib/lib.a` | Common kernel helper function. |
| `arch/arm/lib/built-in.o` | Helper routine Architecture-specific. |
| `lib/built-in.o` | Common library function. |
| `drivers/built-in.o` | Mọi driver built-in. Không gồm loadable module. |
| `sound/built-in.o` | Sound driver. |
| `firmware/built-in.o` | Driver firmware object. |
| `net/built-in.o` | Linux networking. |
| `.tmp_kallsyms2.o` | Kernel Symbol table. |

Khi nói kernel thực sự là image `vmlinux` (trong kernel directory top-level). Như đã nói rất ít platform boot trực tiếp. Trước hết image boot gần như luôn nén. Ít nhất bootloader phải giải nén. Nhiều platform cần stub gắn image để giải nén. Chương 5 học cách đóng gói image cho architecture, machine type, bootloader và yêu cầu boot.

### 4.2.5 Subdirectory Layout

Đã thấy thành phần image, giờ xem kernel subdirectory tiêu biểu. Listing 4-3 chi tiết nội dung subdirectory `mach-ix-p4xx`, dưới nhánh architecture-specific `.../arch/arm` của source tree.

LISTING 4-3 Kernel Subdirectory

```
$ ls -l ./arch/arm/mach-ixp4xx
total 204
-rw-r--r-- 1 chris chris  1817 2009-11-19 17:12 avila-pci.c
-rw-r--r-- 1 chris chris  4610 2009-11-19 17:12 avila-setup.c
-rw-r--r-- 1 chris chris 11812 2009-11-19 17:12 common.c
-rw-r--r-- 1 chris chris 12979 2009-11-19 17:12 common-pci.c
-rw-r--r-- 1 chris chris  1459 2009-11-19 17:12 coyote-pci.c
-rw-r--r-- 1 chris chris  3158 2009-11-19 17:12 coyote-setup.c
-rw-r--r-- 1 chris chris  1898 2009-11-19 17:12 dsmg600-pci.c
-rw-r--r-- 1 chris chris  7030 2009-11-19 17:12 dsmg600-setup.c
-rw-r--r-- 1 chris chris  1625 2009-11-19 17:12 fsg-pci.c
-rw-r--r-- 1 chris chris  6622 2009-11-19 17:12 fsg-setup.c
-rw-r--r-- 1 chris chris  1490 2009-11-19 17:12 gateway7001-pci.c
-rw-r--r-- 1 chris chris  2646 2009-11-19 17:12 gateway7001-setup.c
-rw-r--r-- 1 chris chris 12280 2009-11-19 17:12 goramo_mlr.c
-rw-r--r-- 1 chris chris  2623 2009-11-19 17:12 gtwx5715-pci.c
-rw-r--r-- 1 chris chris  3935 2009-11-19 17:12 gtwx5715-setup.c
drwxr-xr-x 3 chris chris  4096 2009-11-19 17:12 include
-rw-r--r-- 1 chris chris  1794 2009-11-19 17:12 ixdp425-pci.c
-rw-r--r-- 1 chris chris  7430 2009-11-19 17:12 ixdp425-setup.c
-rw-r--r-- 1 chris chris  1354 2009-11-19 17:12 ixdpg425-pci.c
-rw-r--r-- 1 chris chris 21560 2009-11-19 17:12 ixp4xx_npe.c
-rw-r--r-- 1 chris chris  9350 2009-11-19 17:12 ixp4xx_qmgr.c
-rw-r--r-- 1 chris chris  6422 2009-11-19 17:12 Kconfig
-rw-r--r-- 1 chris chris  1319 2009-11-19 17:12 Makefile
-rw-r--r-- 1 chris chris    57 2009-11-19 17:12 Makefile.boot
-rw-r--r-- 1 chris chris  1751 2009-11-19 17:12 nas100d-pci.c
-rw-r--r-- 1 chris chris  7764 2009-11-19 17:12 nas100d-setup.c
-rw-r--r-- 1 chris chris  1561 2009-11-19 17:12 nslu2-pci.c
-rw-r--r-- 1 chris chris  6732 2009-11-19 17:12 nslu2-setup.c
-rw-r--r-- 1 chris chris  1468 2009-11-19 17:12 wg302v2-pci.c
-rw-r--r-- 1 chris chris  2585 2009-11-19 17:12 wg302v2-setup.c
```

Nội dung Listing 4-3 có component chung nhiều kernel source subdirectory: `Makefile` và `Kconfig`. Hai file điều khiển configuration/build process. Xem cách làm.

## 4.3 Kernel Build System

Linux kernel configuration/build system khá phức tạp, như kỳ vọng dự án hơn 10 triệu dòng code! Phần này trình bày nền tảng để bạn tùy chỉnh build environment nếu cần.

Kernel snapshot gần đây có hơn 1.200 makefile[^11] trong source tree. (Ấn bản đầu chỉ 800, tăng 50% từ Linux 2.6.10!) Nghe lớn nhưng không lớn vậy khi hiểu structure/operation build system. Đã cải tiến đáng kể từ Linux 2.4 trở về trước. Nếu quen hệ cũ chắc thấy Kbuild mới cải thiện rất nhiều.

### 4.3.1 The Dot-Config

Đã giới thiệu, file dot-config là bản thiết kế configuration để build kernel image. Đầu dự án có thể dành nhiều công xây configuration phù hợp embedded platform. Nhiều editor text-based và graphical để sửa. Output ghi file `.config` ở Linux source directory top-level điều khiển build.

Có lẽ đã tốn nhiều thời gian hoàn thiện configuration nên muốn bảo vệ. Nhiều command `make` xóa file không cảnh báo. Phổ biến `make distclean`, target `make` trả source tree về trạng thái nguyên sơ chưa cấu hình, xóa mọi configuration data—đúng, xóa cả `.config` trước đó.

Bạn có thể biết filename bắt đầu dot là hidden file Linux. Đáng tiếc file quan trọng lại hidden, khiến nhiều developer đau khổ. Nếu chạy `make` `distclean` hoặc `make mrproper` mà không backup `.config`, bạn cũng vậy. (Đã cảnh báo—backup `.config`!)

File `.config` là tập definition format đơn giản. Listing 4-4 là đoạn `.config` từ release gần đây.

LISTING 4-4 Đoạn trích .config Linux 2.6

```
...
# USB support
#
CONFIG_USB=m
# CONFIG_USB_DEBUG is not set

# Miscellaneous USB options
#
CONFIG_USB_DEVICEFS=y
# CONFIG_USB_BANDWIDTH is not set
# CONFIG_USB_DYNAMIC_MINORS is not set

# USB Host Controller Drivers
#
CONFIG_USB_EHCI_HCD=m
# CONFIG_USB_EHCI_SPLIT_ISO is not set
# CONFIG_USB_EHCI_ROOT_HUB_TT is not set
CONFIG_USB_OHCI_HCD=m
CONFIG_USB_UHCI_HCD=m
...
```

Để hiểu `.config`, phải hiểu đặc điểm cơ bản: Linux monolithic. Tức toàn kernel compile/link thành một statically linked executable. Tuy nhiên có thể compile và incremental link[^12] tập source thành object module đơn nhất để dynamic insertion vào running kernel. Cách thường hỗ trợ device driver phổ biến. Linux gọi loadable module, cũng gọi chung device driver. Sau boot, application program đặc biệt được gọi insert module vào running kernel.

Với kiến thức đó xem lại Listing 4-4. Đoạn configuration file (`.config`) thể hiện phần USB subsystem. Option đầu `CONFIG_USB=m` khai báo subsystem có trong configuration, compile dynamically loadable module (`=m`), load sau boot. Lựa chọn khác `=y` khiến compile/static link USB module vào chính kernel image, nằm composite binary `.../drivers/built-in.o` đã thấy Listing 4-2/Hình 4-1. Độc giả tinh ý hiểu driver loadable thì code không trong kernel thực, mà là object module stand-alone, loadable module insert sau boot.

Chú ý `CONFIG_USB_DEVICEFS=y` Listing 4-4. Option hành vi hơi khác. `USB_DEVICEFS` (cách viết tắt option thường dùng) không phải module stand-alone mà feature bật/tắt trong USB driver. Không nhất thiết tạo module compile vào kernel (`=y`); thay vào đó bật feature, thường bằng object module bổ sung trong toàn USB device driver module. Help text hoặc hierarchy editor thường làm rõ khác biệt.

### 4.3.2 Configuration Editor

Kernel đầu dùng script command-line-driven đơn giản cấu hình. Cồng kềnh ngay lúc ít parameter hơn nhiều. Interface command-line-style vẫn hỗ trợ nhưng rất tẻ nhạt. Configuration điển hình kernel gần đây cần trả hơn 900 câu trên command line, nhập lựa chọn rồi Enter từng query. Sai thì không quay lại được, phải làm từ đầu. Rất bực nếu sai mục 899!

Một số trường hợp như build trên embedded system không graphics không tránh được command-line utility, nhưng tác giả sẽ cố hết sức tìm cách khác.

Kernel configuration subsystem có nhiều target; release gần đây 11 target. Tổng hợp từ output `make help`:

- `config`—Cập nhật current config bằng chương trình line-oriented

- `menuconfig`—Cập nhật current config bằng chương trình menu-based

- `xconfig`—Cập nhật current config bằng front end QT-based

- `gconfig`—Cập nhật current config bằng front end GTK-based

- `oldconfig`—Cập nhật current config dựa trên `.config` cung cấp

- `silentoldconfig`—Giống `oldconfig` nhưng im lặng

- `randconfig`—Config mới với câu trả lời ngẫu nhiên mọi option

- `defconfig`—Config mới với câu trả lời mặc định mọi option

- `allmodconfig`—Config mới chọn module khi có thể

- `allyesconfig`—Config mới chấp nhận mọi option bằng `yes`

- `allnoconfig`—Config tối thiểu mới

Bốn makefile target đầu gọi dạng configuration editor như list. Vì chỗ hạn chế, chương và sách chỉ tập trung graphical front end GTK-based. Bạn có thể dùng editor ưa thích với cùng kết quả.

Gọi editor bằng `make gconfig` từ kernel directory top-level.[^13] Hình 4-2 là configuration menu top-level khi chạy `gconfig`, từ đây truy cập mọi parameter để tạo custom configuration.

![Figure 4-2](images/ch04/fig04-02.png)

HÌNH 4-2 Kernel configuration Top-level

Thoát editor được hỏi lưu thay đổi. Nếu chọn lưu, global configuration file `.config` cập nhật (hoặc tạo nếu chưa có). File `.config` đã giới thiệu điều khiển build qua makefile top-level.

Phần lớn kernel software module cũng đọc configuration gián tiếp qua file `.config` như sau. Trong build process, file `.config` được xử lý thành một C header file trong directory `.../include/linux`, có tên là `autoconf.h`. File này được sinh tự động. Bạn không bao giờ nên sửa trực tiếp file này, vì các chỉnh sửa sẽ mất mỗi khi configuration thay đổi và một lượt build mới bắt đầu. Nhiều kernel source file include trực tiếp file này bằng preprocessor directive `#include`. Listing 4-5 tái hiện một phần của header file này liên quan đến hỗ trợ USB. Các kernel build file include file `autoconf.h` này vào mọi kernel compile command line, bằng directive `-include` của gcc như sau:

```
gcc ... -include include/linux/autoconf.h ... <somefile.c>
```

Đó là cách các module truy cập kernel config.

LISTING 4-5 Linux `autoconf.h`

```
$ cat include/linux/autoconf.h | grep CONFIG_USB
#define CONFIG_USB_ARCH_HAS_EHCI 1
#define CONFIG_USB_HID 1
#define CONFIG_USB_EHCI_BIG_ENDIAN_DESC 1
#define CONFIG_USB_ARCH_HAS_OHCI 1
#define CONFIG_USB_EHCI_BIG_ENDIAN_MMIO 1
#define CONFIG_USB_STORAGE 1
#define CONFIG_USB_SUPPORT 1
#define CONFIG_USB_EHCI_HCD 1
#define CONFIG_USB_DEVICEFS 1
#define CONFIG_USB_OHCI_HCD 1
#define CONFIG_USB_UHCI_HCD 1
#define CONFIG_USB_OHCI_LITTLE_ENDIAN 1
#define CONFIG_USB_ARCH_HAS_HCD 1
#define CONFIG_USB 1
```

Nếu chưa làm, chạy `make gconfig` trong kernel source directory top-level, khám phá utility để thấy nhiều subsection/option cho developer. Miễn không chủ động lưu, thay đổi mất khi thoát, nên khám phá an toàn không sửa configuration.[^14] Nhiều parameter có explanatory text hữu ích tăng hiểu biết option.

### 4.3.3 Makefile Target

Gõ `make help` tại Linux source directory top-level cho list target sinh từ source tree. Cách dùng `make` phổ biến không chỉ target, sinh ELF kernel `vmlinux` và default binary image cho architecture chọn (ví dụ `bzImage` x86). `make` không target cũng build mọi device driver module (kernel loadable module) configuration chỉ định.

Nhiều architecture và machine type yêu cầu các binary target riêng cho architecture và bootloader đang sử dụng. Một trong những target architecture-specific phổ biến hơn là `zImage`. Trong nhiều architecture, đây là target image mặc định có thể được load và chạy trên embedded system đích. Một lỗi phổ biến của người mới là chỉ định `bzImage` làm target của `make`. Target `bzImage` dành riêng cho architecture x86/PC. Trái với quan niệm phổ biến, `bzImage` không phải image được nén bằng `bzip2`. Nó là một `zImage` lớn. Không đi sâu vào chi tiết của legacy PC architecture, bạn chỉ cần biết rằng `bzImage` chỉ phù hợp với các machine PC-compatible có BIOS PC-style theo chuẩn industry-standard.

Listing 4-6 chứa output `make help` kernel gần đây. Thấy nhiều target, mỗi cái kèm mô tả ngắn. Phải hiểu ngay target `help make` (như `make help`) cũng architecture-specific. List target architecture-specific khác tùy architecture trong invocation `make`. Listing 4-6 chọn ARM như command line.

LISTING 4-6 Makefile Target

```
$ make ARCH=arm help
Cleaning targets:
  Clean          - Remove most generated files but keep the config and
                    enough build support to build external modules
  mrproper       - Remove all generated files + config + various backup files
  distclean      - mrproper + remove editor backup and patch files

Configuration targets:
  Config         - Update current config utilising a line-oriented program
  Menuconfig     - Update current config utilising a menu based program
  Xconfig        - Update current config utilising a QT based front-end
  Gconfig        - Update current config utilising a GTK based front-end
  Oldconfig      - Update current config utilising a provided .config as base
  silentoldconfig - Same as oldconfig, but quietly
  randconfig     - New config with random answer to all options
  defconfig      - New config with default answer to all options
  allmodconfig   - New config selecting modules when possible
  allyesconfig   - New config where all options are accepted with yes
  allnoconfig    - New config where all options are answered with no

Other generic targets:
  All            - Build all targets marked with [*]
* vmlinux        - Build the bare kernel
* modules        - Build all modules
  modules_install - Install all modules to INSTALL_MOD_PATH (default: /)
  firmware_install- Install all firmware to INSTALL_FW_PATH
                    (default: $(INSTALL_MOD_PATH)/lib/firmware)
  dir/            - Build all files in dir and below
  dir/file.[ois]  - Build specified target only
  dir/file.ko     - Build module including final link
  modules_prepare - Set up for building external modules
  tags/TAGS      - Generate tags file for editors
  cscope         - Generate cscope index
  kernelrelease  - Output the release version string
  kernelversion  - Output the version stored in Makefile
  headers_install - Install sanitised kernel headers to INSTALL_HDR_PATH
                    (default: /home/chris/temp/linux-2.6/usr)

Static analysers
  checkstack      - Generate a list of stack hogs
  namespacecheck  - Name space analysis on compiled kernel
  versioncheck    - Sanity check on version.h usage
   includecheck    - Check for duplicate included header files
  export_report   - List the usages of all exported symbols
  headers_check   - Sanity check on exported headers
  headerdep       - Detect inclusion cycles in headers

Kernel packaging:
  rpm-pkg         - Build both source and binary RPM kernel packages
  binrpm-pkg      - Build only the binary kernel package
  deb-pkg         - Build the kernel as an deb package
  tar-pkg         - Build the kernel as an uncompressed tarball
  targz-pkg       - Build the kernel as a gzip compressed tarball
  tarbz2-pkg      - Build the kernel as a bzip2 compressed tarball

Documentation targets:
 Linux kernel internal documentation in different formats:
  htmldocs        - HTML
  pdfdocs         - PDF
  psdocs          - Postscript
  xmldocs         - XML DocBook
  mandocs         - man pages
  installmandocs  - install man pages generated by mandocs
  cleandocs       - clean all generated DocBook files

Architecture specific targets (arm):
* zImage        - Compressed kernel image (arch/arm/boot/zImage)
  Image         - Uncompressed kernel image (arch/arm/boot/Image)
* xipImage      - XIP kernel image, if configured (arch/arm/boot/xipImage)
  uImage        - U-Boot wrapped zImage
  bootpImage    - Combined zImage and initial RAM disk
                  (supply initrd image via make variable INITRD=<path>)
  install       - Install uncompressed kernel
  zinstall      - Install compressed kernel
                  Install using (your) ~/bin/installkernel or
                  (distribution) /sbin/installkernel or
                  install to $(INSTALL_PATH) and run lilo

  acs5k_defconfig          - Build for acs5k
  acs5k_tiny_defconfig     - Build for acs5k_tiny
  afeb9260_defconfig       - Build for afeb9260
  am200epdkit_defconfig    - Build for am200epdkit
  ams_delta_defconfig      - Build for ams_delta
  assabet_defconfig        - Build for assabet
  at91cap9adk_defconfig    - Build for at91cap9adk
  at91rm9200dk_defconfig   - Build for at91rm9200dk
  at91rm9200ek_defconfig   - Build for at91rm9200ek
  at91sam9260ek_defconfig  - Build for at91sam9260ek
  at91sam9261ek_defconfig  - Build for at91sam9261ek
  at91sam9263ek_defconfig  - Build for at91sam9263ek
  at91sam9g20ek_defconfig  - Build for at91sam9g20ek
  at91sam9rlek_defconfig   - Build for at91sam9rlek
  ateb9200_defconfig       - Build for ateb9200
  badge4_defconfig         - Build for badge4
  cam60_defconfig          - Build for cam60
  carmeva_defconfig        - Build for carmeva
  cerfcube_defconfig       - Build for cerfcube
  cm_x2xx_defconfig        - Build for cm_x2xx
  cm_x300_defconfig        - Build for cm_x300
  colibri_pxa270_defconfig - Build for colibri_pxa270
  colibri_pxa300_defconfig - Build for colibri_pxa300
  collie_defconfig         - Build for collie
  corgi_defconfig          - Build for corgi
  csb337_defconfig         - Build for csb337
  csb637_defconfig         - Build for csb637
  davinci_all_defconfig    - Build for davinci_all
  ebsa110_defconfig        - Build for ebsa110
  ecbat91_defconfig        - Build for ecbat91
  edb7211_defconfig        - Build for edb7211
  em_x270_defconfig        - Build for em_x270
  ep93xx_defconfig         - Build for ep93xx
  eseries_pxa_defconfig    - Build for eseries_pxa
  ezx_defconfig            - Build for ezx
  footbridge_defconfig     - Build for footbridge
  fortunet_defconfig       - Build for fortunet
  h3600_defconfig          - Build for h3600
  h5000_defconfig          - Build for h5000
  h7201_defconfig          - Build for h7201
  h7202_defconfig          - Build for h7202
  hackkit_defconfig        - Build for hackkit
  integrator_defconfig     - Build for integrator
  iop13xx_defconfig        - Build for iop13xx
  iop32x_defconfig         - Build for iop32x
  iop33x_defconfig         - Build for iop33x
  ixp2000_defconfig        - Build for ixp2000
  ixp23xx_defconfig        - Build for ixp23xx
  ixp4xx_defconfig         - Build for ixp4xx
  jornada720_defconfig     - Build for jornada720
  kafa_defconfig           - Build for kafa
  kb9202_defconfig         - Build for kb9202
  kirkwood_defconfig       - Build for kirkwood
  ks8695_defconfig         - Build for ks8695
  lart_defconfig           - Build for lart
  littleton_defconfig      - Build for littleton
  loki_defconfig           - Build for loki
  lpd270_defconfig         - Build for lpd270
  lpd7a400_defconfig       - Build for lpd7a400
  lpd7a404_defconfig       - Build for lpd7a404
  lubbock_defconfig        - Build for lubbock
  lusl7200_defconfig       - Build for lusl7200
  magician_defconfig       - Build for magician
  mainstone_defconfig      - Build for mainstone
  msm_defconfig            - Build for msm
  mv78xx0_defconfig        - Build for mv78xx0
  mx1ads_defconfig         - Build for mx1ads
  mx1_defconfig            - Build for mx1
  mx27_defconfig           - Build for mx27
  mx31pdk_defconfig        - Build for mx31pdk
  mx3_defconfig            - Build for mx3
  n770_defconfig           - Build for n770
  neocore926_defconfig     - Build for neocore926
  neponset_defconfig       - Build for neponset
  netwinder_defconfig      - Build for netwinder
  netx_defconfig           - Build for netx
  ns9xxx_defconfig         - Build for ns9xxx
  omap_2430sdp_defconfig   - Build for omap_2430sdp
  omap_3430sdp_defconfig   - Build for omap_3430sdp
  omap3_beagle_defconfig   - Build for omap3_beagle
  omap3_pandora_defconfig  - Build for omap3_pandora
  omap_apollon_2420_defconfig - Build for omap_apollon_2420
  omap_generic_1510_defconfig - Build for omap_generic_1510
  omap_generic_1610_defconfig - Build for omap_generic_1610
  omap_generic_1710_defconfig - Build for omap_generic_1710
  omap_generic_2420_defconfig - Build for omap_generic_2420
  omap_h2_1610_defconfig   - Build for omap_h2_1610
  omap_h4_2420_defconfig   - Build for omap_h4_2420
  omap_innovator_1510_defconfig - Build for omap_innovator_1510
  omap_innovator_1610_defconfig - Build for omap_innovator_1610
  omap_ldp_defconfig       - Build for omap_ldp
  omap_osk_5912_defconfig  - Build for omap_osk_5912
  omap_perseus2_730_defconfig - Build for omap_perseus2_730
  onearm_defconfig         - Build for onearm
  orion5x_defconfig        - Build for orion5x
  overo_defconfig          - Build for overo
  palmte_defconfig         - Build for palmte
  palmtt_defconfig         - Build for palmtt
  palmz71_defconfig        - Build for palmz71
  palmz72_defconfig        - Build for palmz72
  pcm027_defconfig         - Build for pcm027
  picotux200_defconfig     - Build for picotux200
  pleb_defconfig           - Build for pleb
  pnx4008_defconfig        - Build for pnx4008
  pxa168_defconfig         - Build for pxa168
  pxa255-idp_defconfig     - Build for pxa255-idp
  pxa910_defconfig         - Build for pxa910
  qil-a9260_defconfig      - Build for qil-a9260
  realview_defconfig       - Build for realview
  realview-smp_defconfig   - Build for realview-smp
  rpc_defconfig            - Build for rpc
  rx51_defconfig           - Build for rx51
  s3c2410_defconfig        - Build for s3c2410
  s3c6400_defconfig        - Build for s3c6400
  sam9_l9260_defconfig     - Build for sam9_l9260
  shannon_defconfig        - Build for shannon
  shark_defconfig          - Build for shark
  simpad_defconfig         - Build for simpad
  spitz_defconfig          - Build for spitz
  sx1_defconfig            - Build for sx1
  tct_hammer_defconfig     - Build for tct_hammer
  trizeps4_defconfig       - Build for trizeps4
  usb-a9260_defconfig      - Build for usb-a9260
  usb-a9263_defconfig      - Build for usb-a9263
  versatile_defconfig      - Build for versatile
  viper_defconfig          - Build for viper
  w90p910_defconfig        - Build for w90p910
  yl9200_defconfig         - Build for yl9200
  zylonite_defconfig       - Build for zylonite

  make V=0|1 [targets] 0 => quiet build (default), 1 => verbose build
  make V=2   [targets] 2 => give reason for rebuild of target
  make O=dir [targets] Locate all output files in “dir”, including .config
  make C=1   [targets] Check all c source with $CHECK (sparse by default)
  make C=2   [targets] Force check of all c source with $CHECK

Execute “make” or “make all” to build all targets marked with [*]
For further info see the ./README file
```

Nhiều target có thể không bao giờ dùng, nhưng biết tồn tại hữu ích. Listing 4-6 đánh dấu asterisk cho target build mặc định. Chú ý default configuration `*_defconfig`. Nhớ mục 4.2.2 “Compile Kernel”: preconfigure source tree nguyên sơ bằng `make` với architecture/default configuration. Default là `ixp4xx_defconfig`, có trong list ARM target. Đây là cách tốt tìm mọi default configuration cho release/architecture.

## 4.4 Kernel Configuration

`Kconfig` (hoặc file có phần tên gốc tương tự, theo sau là extension, chẳng hạn `Kconfig.ext`) tồn tại trong gần 300 kernel subdirectory. `Kconfig` điều khiển configuration process cho các feature nằm trong subdirectory của nó. Nội dung của `Kconfig` được configuration subsystem parse; subsystem này trình bày các lựa chọn configuration cho người dùng và chứa help text gắn với một configuration parameter nhất định.

Configuration utility (chẳng hạn `gconf` đã trình bày trước đó) đọc các file `Kconfig`, bắt đầu từ file trong subdirectory `arch` có tên `Kconfig`. Nó được gọi từ makefile `Kconfig` bằng một entry có dạng như sau:

```
ifdef KBUILD_KCONFIG
Kconfig := $(KBUILD_KCONFIG)
else
Kconfig := arch/$(SRCARCH)/Kconfig
endif
...
gconfig: $(obj)/gconf
        $< $(Kconfig)
```

Tùy architecture build, `gconf` đọc `Kconfig` architecture-specific này làm definition top-level. Trong `Kconfig` có các dòng như:

```
source  “drivers/pci/Kconfig”
```

Directive bảo editor đọc file `Kconfig` khác từ nơi khác trong source tree. Mỗi architecture chứa nhiều file `Kconfig`, cùng quyết định toàn bộ menu option khi cấu hình. Mỗi file `Kconfig` tự do source thêm `Kconfig` ở phần khác. Utility—ở đây `gconf`—đọc đệ quy chuỗi file `Kconfig`, dựng configuration menu structure.

Listing 4-7 là tree view một phần file `Kconfig` ARM. Trong source tree Linux 2.6 gần đây dùng làm ví dụ, configuration định nghĩa bởi 473 file `Kconfig` riêng. Bỏ phần lớn để tiết kiệm chỗ và rõ, mục tiêu thể hiện overall structure. Liệt kê hết sẽ nhiều trang.

LISTING 4-7 Danh sách một phần `Kconfig` cho ARM Architecture

```
arch/arm/Kconfig <<<<<< (top level Kconfig)
 |->  init/Kconfig
 |  ...
 |->  arch/arm/mach-iop3xx/Kconfig
 |->  arch/arm/mach-ixp4xx/Kconfig
 |    ...
 |->  net/Kconfig
 |    |-->  net/ipv4/Kconfig
 |    |     |-->  net/ipv4/ipvs/Kconfig
 |    ...
 |->  drivers/pci/Kconfig
 |    ...
 |->  drivers/usb/Kconfig
 |    |-->  drivers/usb/core/Kconfig
 |    |-->  drivers/usb/host/Kconfig
 | ...
 |->  lib/Kconfig
```

Xem Listing 4-7, file `.../arch/arm/Kconfig` chứa dòng như:

```
source “net/Kconfig”
```

File `net/Kconfig` chứa dòng như:

```
source “net/ipv4/Kconfig”
```

và cứ tiếp tục vậy.

Như đã nói, tập file `Kconfig` quyết định configuration menu structure/option trình bày khi cấu hình. Hình 4-3 ví dụ utility (`gconf`) cho ARM.

![Figure 4-3](images/ch04/fig04-03.png)

HÌNH 4-3 Màn hình configuration `gconf`

### 4.4.1 Configuration Option tùy chỉnh

Nhiều embedded developer thêm feature hỗ trợ custom hardware. Configuration management architecture trên giúp dễ tùy chỉnh/thêm feature. Xem nhanh `Kconfig` điển hình thấy configuration script language structure. Giả sử hai platform IXP425 network processor được engineering team đặt Vega/Constellation. Mỗi board có hardware riêng cần khởi tạo sớm khi boot kernel. Xem dễ thêm option vào lựa chọn developer thế nào. Listing 4-8 là đoạn file ARM `Kconfig` top-level.

LISTING 4-8 Đoạn trích `.../arch/arm/Kconfig`

```
source “init/Kconfig”

menu “System Type”

choice
        prompt “ARM system type”
        default ARCH_RPC

config ARCH_CLPS7500
        bool “Cirrus-CL-PS7500FE”

config ARCH_CLPS711X
        bool “CLPS711x/EP721x-based”

...

source “arch/arm/mach-ixp4xx/Kconfig”
```

Trong đoạn `Kconfig`, menu item System Type được định nghĩa. Sau prompt `ARM System type` là list lựa chọn ARM. Sau đó include definition `Kconfig` IXP4xx-specific. Thêm custom configuration switch tại file này. Listing 4-9 trích đoạn; lần nữa bỏ text không liên quan bằng ellipsis cho dễ đọc/tiện.

LISTING 4-9 Đoạn trích `.../arch/arm/mach-ixp4xx/Kconfig`

```
menu “Intel IXP4xx Implementation Options”

comment “IXP4xx Platforms”

config ARCH_AVILA
        bool “Avila”
        help
          Say ‘Y’ here if you want your kernel to support...

config ARCH_ADI_COYOTE
        bool “Coyote”
        help
          Say ‘Y’ here if you want your kernel to support
         the ADI Engineering Coyote...

# (These are our new custom options)
config ARCH_VEGA
        bool “Vega”
        help
          Select this option for “Vega” hardware support

config ARCH_CONSTELLATION
        bool “Constellation”
        help
          Select this option for “Constellation”
          hardware support
...
```

Hình 4-4 là kết quả khi chạy `gconf` (qua `make ARCH=arm gconfig`). Thay đổi đơn giản khiến editor có option cho hai platform mới.[^15] Sắp thấy dùng configuration information trong source tree để chọn object hỗ trợ board theo điều kiện.

Sau chạy editor (`gconf` ở đây), chọn custom platform, file `.config` chứa macro cho option mới. Như mọi option kernel-configuration, prefix `CONFIG_` nhận diện option kernel-configuration. Vì vậy có hai option mới, state ghi trong `.config`. Listing 4-10 cho file `.config` mới.

![Figure 4-4](images/ch04/fig04-04.png)

HÌNH 4-4 Configuration option tùy chỉnh

LISTING 4-10 Đoạn trích file `.config` tùy chỉnh

```
...
#
# IXP4xx Platforms
#
# CONFIG_ARCH_AVILA is not set
# CONFIG_ARCH_ADI_COYOTE is not set
CONFIG_ARCH_VEGA=y
# CONFIG_ARCH_CONSTELLATION is not set
# CONFIG_ARCH_IXDP425 is not set
# CONFIG_ARCH_PRPMC1100 is not set
...
```

Chú ý hai option mới cho Vega/Constellation. Như Hình 4-4 chọn Vega; trong `.config`, option `CONFIG_` mới biểu diễn Vega được chọn và đặt `y`. Option `CONFIG_` Constellation có nhưng chưa chọn.

### 4.4.2 Kernel Makefile

Khi build, makefile quét configuration quyết định subdirectory đi vào/source file compile. Để hoàn tất ví dụ Vega/Constellation, xem makefile đọc configuration và hành động theo tùy chỉnh.

Vì ví dụ option hardware-specific, giả sử tùy chỉnh bằng hai module hardware-setup `vega_setup.c` và `constellation_setup.c`. Đặt C source file trong subdirectory `.../arch/arm/mach-ixp4xx` của source tree. Listing 4-11 là makefile đầy đủ directory này từ release gần đây.

LISTING 4-11 Makefile từ Kernel Subdirectory `.../arch/arm/mach-ixp4xx`

```
#
# Makefile for the linux kernel.
#

obj-y   += common.o common-pci.o

obj-$(CONFIG_ARCH_IXDP4XX)    += ixdp425-pci.o ixdp425-setup.o
obj-$(CONFIG_MACH_IXDPG425)    += ixdpg425-pci.o coyote-setup.o
obj-$(CONFIG_ARCH_ADI_COYOTE)  += coyote-pci.o coyote-setup.o
obj-$(CONFIG_MACH_GTWX5715)    += gtwx5715-pci.o gtwx5715-setup.o
```

Có thể ngạc nhiên makefile đơn giản. Đã đầu tư nhiều công build system chính vì lý do này. Developer bình thường chỉ cần hỗ trợ custom hardware sẽ thấy thiết kế khiến tùy chỉnh rất thẳng thắn.[^16]

Xem makefile dễ thấy cần gì thêm hardware setup routine theo condition configuration. Chỉ thêm hai dòng cuối makefile là xong:

```
obj-$(CONFIG_ARCH_VEGA)   += vega_setup.o
obj-$(CONFIG_ARCH_CONSTELLATION)   += costellation_setup.o
```

Các bước hoàn tất thêm setup module riêng custom hardware giả định. Dùng logic tương tự, giờ bạn có thể tự sửa configuration/build system.

## 4.5 Kernel Documentation

Linux source tree có rất nhiều thông tin. Khó đọc hết vì directory `.../Documentation` gần 1.300 documentation file trong 118 subdirectory. Cẩn thận: kernel phát triển/release nhanh khiến tài liệu sớm lỗi thời. Nhưng thường là điểm bắt đầu tốt xây nền kiến thức kernel subsystem/khái niệm.

Đừng bỏ qua theLinux Documentation Project tại www.tldp.org, có thể chứa version up-to-date nhất của document/man page.[^17] Đặc biệt liên quan phần trước là Kbuild documentation trong subdirectory kernel `.../Documentation/kbuild`.

Nói kernel documentation không thể thiếu Google. Một ngày gần đây Google sẽ xuất hiện trong Merriam-Webster’s như động từ! Có lẽ nhiều vấn đề/câu hỏi của bạn đã được giải đáp. Dành thời gian thành thạo tìm Internet. Sẽ thấy nhiều mailing list/information repository đầy thông tin quý liên quan dự án/vấn đề. Phụ lục E có list tài nguyên open-source hữu ích.

## 4.6 Lấy Custom Linux Kernel

Nói chung lấy embedded Linux kernel cho platform bằng ba cách: mua commercial embedded Linux distribution phù hợp; tải embedded distribution miễn phí hỗ trợ hardware nếu tìm thấy phù hợp architecture/processor; hoặc tìm kernel open-source gần application nhất rồi tự port.

Dù port open source kernel tới custom board không nhất thiết khó, vẫn đầu tư đáng kể engineering/development resource. Cách này cho software miễn phí nhưng triển khai Linux trong dự án hoàn toàn không miễn phí, như Chương 1 “Giới thiệu”. Ngay hệ thống nhỏ yêu cầu application tối thiểu cũng cần nhiều component ngoài kernel.

### 4.6.1 Còn cần gì?

Chương tập trung layout/cấu tạo kernel. Như thấy, Linux chỉ là component nhỏ trong embedded system Linux. Ngoài kernel, cần component sau để phát triển, test, khởi chạy embedded Linux widget:

- Bootloader port và cấu hình cho hardware platform cụ thể

- Một cross-compiler và toolchain đi kèm cho architecture bạn đã chọn

- File system chứa nhiều package—binary executable/library compile cho native hardware architecture/processor

- Device driver cho custom device trên board

- Development environment gồm host tool/utility

- Linux kernel source tree hỗ trợ processor và board cụ thể

Đó là component embedded Linux distribution.

## 4.7 Tổng kết

Chương trình bày kernel build system và cách sửa để hỗ trợ thay đổi. Để sách tốt khác mô tả lý thuyết/hoạt động kernel. Ở đây nói cách build và nhận diện thành phần image. Chia kernel thành phần dễ hiểu là chìa khóa điều hướng dự án software lớn.

- Linux kernel gần 20 tuổi, đã thành operating system chủ lưu, well-supported cho nhiều architecture.

- Địa chỉ Linux mã nguồn mở www.kernel.org. Gần như mọi release từ Linux 1.0 có ở đó.

- Có nhiều configuration editor. Ta chọn một, xem cách điều khiển và sửa menu/menu item. Khái niệm áp dụng mọi graphical front end.

- Kernel có cả directory structure đầy documentation hữu ích, giúp hiểu/điều hướng kernel và hoạt động.

- Chương kết thúc giới thiệu ngắn lựa chọn lấy embedded Linux distribution.

### 4.7.1 Gợi ý đọc thêm

Linux Kernel HOWTO www.linuxdocs.org/HOWTOs/Kernel-HOWTO.html

Kbuild documentation của Kernel Linux kernel source tree

```
.../Documentation/kbuild/*
```

The Linux Documentation Project: www.tldp.org

Tool Interface Standard (TIS) Executable and Linking Format (ELF) Specification, Version 1.2 TIS Committee, May 1995 http://refspecs.freestandards.org/elf/elf.pdf

Linux kernel source tree

```
.../Documentation/kbuild/makefiles.txt
```

Linux kernel source tree

```
.../Documentation/kbuild/kconfig-language.txt
```

Linux Kernel Development, 3rd Edition Robert Love Addison-Wesley, 2010

[^1]: Thú vị là nhiều hơn 8.000 file so với lúc chuẩn bị ấn bản đầu!

[^2]: Nhiều hơn 4 triệu dòng code so với ấn bản đầu!

[^3]: Xấp xỉ từ đếm raw line header file, C/assembler source, makefile và Kconfig. Không gồm script.

[^4]: Sắp nói build system/makefile.

[^5]: Xem tài liệu distribution để cài `git`.

[^6]: Lưu ý distribution có thể gọi tên khác. Tiếc là `git` trùng tên package GNU Interactive Tools!

[^7]: Executable and Linking Format, format tiêu chuẩn thực tế cho binary executable file.

[^8]: Dĩ nhiên toolchain prefix của bạn có thể khác.

[^9]: Thực ra chỉ thêm giá trị `CROSS_COMPILE` trước `CC`, `LD`, `AR`, v.v. trong makefile.

[^10]: Linker script file có cú pháp riêng, chi tiết trong tài liệu GNU linker.

[^11]: Không phải mọi makefile tham gia build kernel trực tiếp. Một số build documentation file.

[^12]: Incremental linking tạo object module dự định link lại vào object khác. Vì vậy unresolved symbol còn lại không báo lỗi—được resolve tại link stage sau.

[^13]: Như đã nói có thể dùng editor chọn, như `make xconfig` hoặc `make menuconfig.`

[^14]: Tốt hơn hãy backup file `.config`.

[^15]: Đã bỏ nhiều option ARM system type và Intel IXP4xx Implementation Options cho hình vừa trang.

[^16]: Thực tế build system phức tạp nhưng phần lớn khéo giấu khỏi developer bình thường. Vì vậy thêm/sửa/xóa configuration tương đối dễ mà không cần chuyên gia.

[^17]: Luôn giả định feature phát triển nhanh hơn tài liệu; coi tài liệu là hướng dẫn thay vì sự thật không tranh cãi.
