# Chương 2. Tìm hiểu toolchain

Toolchain là thành phần đầu tiên của embedded Linux và điểm khởi đầu dự án. Những lựa chọn ở giai đoạn sớm này sẽ tác động sâu sắc đến kết quả cuối. Toolchain phải sử dụng hiệu quả phần cứng bằng instruction set tối ưu cho processor, dùng floating point unit nếu có, v.v. Nó phải hỗ trợ ngôn ngữ bạn cần và triển khai vững chắc POSIX cùng system interface khác. Không chỉ vậy, nó cần được cập nhật khi phát hiện lỗ hổng bảo mật hoặc bug. Cuối cùng, nó nên cố định suốt dự án. Nói cách khác, một khi chọn toolchain, điều quan trọng là gắn bó với nó. Thay compiler và development library thiếu nhất quán trong dự án sẽ gây bug tinh vi.

Lấy toolchain đơn giản như download và cài package. Nhưng chính toolchain là thứ phức tạp, như tôi sẽ trình bày trong chương.

## Toolchain là gì?

Toolchain là tập công cụ compile source code thành executable chạy trên target device, gồm compiler, linker và run-time library. Ban đầu bạn cần nó để build ba thành phần embedded Linux system còn lại: bootloader, kernel, root filesystem. Nó phải compile code assembly, C, C++ vì đây là ngôn ngữ dùng trong base open source package. Thông thường Linux toolchain dựa trên component GNU project (`http://www.gnu.org`), vẫn đúng với đa số trường hợp khi viết sách. Tuy nhiên vài năm qua, Clang compiler và LLVM project liên quan (`http://llvm.org`) tiến tới mức trở thành lựa chọn khả thi thay GNU toolchain. Khác biệt lớn giữa LLVM và toolchain GNU-based là license: LLVM dùng BSD, GNU dùng GPL. Clang cũng có ưu điểm kỹ thuật như compile nhanh, diagnostic tốt hơn, nhưng GNU GCC có lợi thế tương thích code base hiện có, hỗ trợ nhiều architecture và operating system. Thực tế vẫn có vùng Clang chưa thay GNU C compiler được, đặc biệt compile mainline Linux kernel. Có thể trong khoảng năm tới Clang compile được mọi component embedded Linux cần, trở thành lựa chọn thay GNU. Có mô tả tốt cách cross compilation với Clang tại `http://clang.llvm.org/docs/CrossCompilation.html`. Nếu muốn dùng trong embedded Linux build system, EmbToolkit (`https://www.embtoolkit.org`) hỗ trợ đầy đủ cả GNU và LLVM/Clang toolchain, nhiều người đang làm Clang với Buildroot, Yocto Project. Tôi trình bày embedded build system ở Chương 6, Lựa chọn build system. Trong khi đó chương này tập trung GNU toolchain vì hiện là lựa chọn hoàn chỉnh duy nhất.

GNU toolchain chuẩn gồm ba thành phần chính:

- Binutils: Tập binary utility gồm assembler và linker, ld. Có tại `http://www.gnu.org/software/binutils/`.

- GNU Compiler Collection (GCC): Compiler cho C và ngôn ngữ khác tùy phiên bản, gồm C++, Objective-C, Objective-C++, Java, Fortran, Ada, Go. Tất cả dùng back-end chung sinh assembler code đưa cho GNU assembler. Có tại `http://gcc.gnu.org/`.

- C library: API chuẩn hóa dựa POSIX specification, là interface chính từ ứng dụng đến operating system kernel. Có nhiều C library để cân nhắc, xem phần sau.

Ngoài ra cần bản sao Linux kernel header chứa định nghĩa, constant cần khi truy cập kernel trực tiếp. Hiện cần để compile C library, sau cũng cần khi viết chương trình hoặc compile library tương tác Linux device cụ thể, ví dụ hiển thị graphics qua Linux frame buffer driver. Không đơn giản là copy header file trong include directory kernel source code. Những header đó chỉ dùng trong kernel, chứa định nghĩa gây xung đột nếu dùng nguyên để compile Linux application thông thường. Thay vào đó cần sinh sanitized kernel header, tôi minh họa ở Chương 5, Tạo root filesystem.

Thông thường không thiết yếu kernel header được sinh từ đúng Linux version sẽ dùng hay không. Vì kernel interface luôn backwards-compatible, chỉ cần header từ kernel cùng phiên bản hoặc cũ hơn kernel trên target.

Phần lớn cũng coi GNU debugger, GDB, là phần toolchain và thường build tại thời điểm này. Tôi nói GDB ở Chương 12, Debug bằng GDB.

## Các loại toolchain - native và cross toolchain

Cho mục đích của chúng ta, có hai loại:

- Native: Toolchain chạy trên cùng loại hệ thống, đôi khi chính hệ thống đó, với chương trình nó sinh. Đây thường là trường hợp desktop/server, đang phổ biến trên một số embedded device. Ví dụ Raspberry Pi chạy Debian cho ARM có native compiler self-hosted.

- Cross: Toolchain chạy trên hệ thống khác loại target, cho phát triển trên desktop PC nhanh rồi load lên embedded target để test.

Gần mọi phát triển embedded Linux dùng cross development toolchain, một phần vì đa số embedded device không phù hợp phát triển chương trình do thiếu computing power, memory, storage, cũng vì giữ riêng host/target environment. Điểm sau đặc biệt quan trọng khi host/target cùng architecture như X86\_64. Khi đó dễ muốn compile native trên host rồi chỉ copy binary sang target. Hoạt động tới mức nào đó, nhưng host distribution có thể update thường hơn target, các kỹ sư build cho target có development library version hơi khác, vi phạm nguyên tắc toolchain cố định suốt đời dự án. Có thể làm được nếu bảo đảm host/target build environment đồng bộ hoàn toàn, nhưng tốt hơn nhiều giữ riêng, cross toolchain là cách làm. Tuy nhiên có lập luận ngược ủng hộ native development. Cross development gây gánh nặng cross-compiling mọi library/tool cần trên target. Sau chương sẽ thấy cross-compiling không luôn đơn giản vì phần lớn open source package không thiết kế build kiểu này. Integrated build tool như Buildroot/Yocto Project giúp đóng gói rule cross compile các package cần trong embedded system điển hình, nhưng nếu muốn compile nhiều package bổ sung thì tốt hơn compile native. Ví dụ cung cấp Debian distribution cho Raspberry Pi/BeagleBone bằng cross compiler là bất khả thi, phải compile native. Tạo native build environment từ đầu không dễ, cần tạo cross compiler trước để bootstrap native environment trên target rồi dùng build package. Cần build farm target board well-provisioned hoặc dùng QEMU mô phỏng target. Muốn tìm hiểu thêm, xem Scratchbox project, giờ phiên bản thứ hai Scratchbox2 (`https://maemo.gitorious.org/scratchbox2`). Nokia phát triển để build Maemo Linux operating system, hiện Mer project, Tizen project và nơi khác dùng.

Trong chương này tôi tập trung cross compiler environment phổ biến hơn, tương đối dễ setup, quản trị.

### CPU architecture

Toolchain phải build theo khả năng target CPU, gồm:

- CPU architecture: arm, mips, x86\_64, v.v.

- Hoạt động Big- hoặc little-endian: Một số CPU có cả hai mode nhưng machine code khác nhau

- Floating point support: Không phải mọi embedded processor version có hardware floating point unit; khi không có, toolchain có thể cấu hình gọi software floating point library

- Application Binary Interface (ABI): Calling convention dùng truyền parameter giữa function call

Với nhiều architecture, ABI không đổi giữa họ processor. Ngoại lệ đáng chú ý là ARM. ARM chuyển sang Extended Application Binary Interface (EABI) cuối thập niên 2000, khiến ABI trước được đặt tên Old Application Binary Interface (OABI). Dù OABI nay obsolete, vẫn thấy tham chiếu EABI. Từ đó EABI chia hai theo cách truyền floating point parameter. EABI gốc dùng general purpose (integer) register, EABIHF mới dùng floating point register. EABIHF nhanh hơn đáng kể cho floating point operation vì bỏ copy giữa integer/floating point register, nhưng không tương thích CPU thiếu floating point unit. Vì vậy phải chọn giữa hai ABI không tương thích: không trộn dùng được, nên quyết định ở giai đoạn này.

GNU dùng prefix tool để nhận diện các tổ hợp có thể sinh, gồm tuple ba/bốn component cách bằng dash, như sau:

- CPU: Architecture như arm, mips, x86\_64. Nếu CPU có hai endian mode, phân biệt bằng thêm el cho little-endian, eb cho big-endian. Ví dụ tốt là MIPS little-endian, mipsel và ARM big-endian, armeb.

- Vendor: Nhận diện provider toolchain, ví dụ buildroot, poky, hoặc unknown. Đôi khi bỏ hẳn.

- Kernel: Với mục đích này luôn 'linux'.

- Operating system: Tên user space component có thể `gnu`, `uclibcgnu`. ABI có thể thêm đây, nên ARM toolchain có `gnueabi`, `gnueabihf`, `uclibcgnueabi`, `uclibcgnueabihf`.

Tìm tuple dùng build toolchain bằng option `-dumpmachine` của `gcc`. Ví dụ thấy sau trên host:

```
$ gcc -dumpmachine
x86_64-linux-gnu
```

Khi native compiler cài trên máy, thường tạo link tới từng tool không prefix để gọi compiler bằng `gcc`.

Đây ví dụ cross compiler:

```
$ mipsel-unknown-linux-gnu-gcc -dumpmachine
mipsel-unknown-linux-gnu
```

## Chọn C library

Programming interface tới Unix operating system được định nghĩa bằng C, nay theo POSIX standard. C library triển khai interface đó, là cửa ngõ kernel cho Linux program như sơ đồ. Ngay cả viết ngôn ngữ khác như Java/Python, run-time support library tương ứng cuối cùng phải gọi C library:

![figure](images/ch02/fig02-01.png)

C library là cửa ngõ kernel cho ứng dụng

Mỗi khi C library cần kernel service, dùng interface `system call` của kernel chuyển user space/kernel space. Có thể bỏ qua C library bằng gọi trực tiếp kernel system call nhưng rất phiền, gần không bao giờ cần.

Có nhiều C library để chọn. Các lựa chọn chính:

- glibc: Có tại `http://www.gnu.org/software/libc`. GNU C library chuẩn, lớn và tới gần đây chưa cấu hình được nhiều, nhưng triển khai POSIX API đầy đủ nhất.

- eglibc: Có tại `http://www.eglibc.org/home`. Đây embedded GLIBC, từng là chuỗi patch glibc thêm configuration option và hỗ trợ architecture glibc chưa có (cụ thể PowerPC e500). Việc chia luôn khá gượng ép; may code base eglibc hợp nhất lại glibc từ 2.20, cho một library cải tiến. Eglibc không còn duy trì.

- uClibc: Có tại `http://www.uclibc.org`. 'u' thực là ký tự Hy Lạp 'mu', chỉ micro controller C library. Ban đầu cho uClinux (Linux CPU không memory management unit), sau thích nghi full Linux. Có configuration utility cho fine-tune feature theo nhu cầu. Ngay full configuration vẫn nhỏ hơn glibc nhưng POSIX implementation kém đầy đủ.

- musl libc: Có tại `http://www.musl-libc.org`. C library mới thiết kế embedded system.

Vậy chọn gì? Tôi khuyên chỉ uClibc nếu dùng uClinux hoặc storage/RAM rất ít, kích thước nhỏ có lợi. Ngoài ra thích glibc up-to-date hoặc eglibc. Chưa kinh nghiệm musl libc nhưng nếu glibc/eglibc không hợp hãy thử. Quá trình tóm tắt hình sau:

![figure](images/ch02/fig02-02.png)

Chọn C library

## Tìm toolchain

Có ba lựa chọn cross development toolchain: bản build sẵn phù hợp, bản embedded build tool sinh như Chương 6, Lựa chọn build system, hoặc tự tạo như phần sau.

Cross toolchain pre-built hấp dẫn vì chỉ download/cài, nhưng bị giới hạn cấu hình bản đó, phụ thuộc người/tổ chức cung cấp. Có lẽ một trong:

- SoC hoặc board vendor. Phần lớn cung cấp Linux toolchain.

- Consortium chuyên hỗ trợ system-level cho architecture. Ví dụ Linaro (`https://www.linaro.org`) có toolchain pre-built cho ARM.

- Vendor Linux tool Third-party như Mentor Graphics, TimeSys, MontaVista.

- Cross tool package của desktop distribution, ví dụ Debian-based có package cross compiling ARM, MIPS, PowerPC.

- Binary SDK do integrated embedded build tool sinh; Yocto Project có ví dụ `http://autobuilder.yoctoproject.org/pub/releases/CURRENT/toolchain`, cùng Denx Embedded Linux Development Kit tại `ftp://ftp.denx.de/pub/eldk/`.

- Link từ forum bạn không tìm lại được.

Mọi trường hợp phải quyết định toolchain pre-built có đáp ứng yêu cầu không. Có C library thích không? Provider cập nhật security fix, bug không, nhớ nhận xét support/update Chương 1, Bắt đầu. Nếu không ở bất kỳ câu nào, cân nhắc tự tạo.

Tiếc rằng build toolchain không dễ. Nếu thật muốn tự làm toàn bộ, xem Cross Linux From Scratch (`http://trac.clfs.org`), có hướng dẫn step-by-step tạo từng component.

Lựa chọn đơn giản hơn là crosstool-NG, đóng gói quá trình thành script với front-end menu-driven. Nhưng vẫn cần kiến thức khá để chọn đúng. Còn đơn giản hơn dùng Buildroot/Yocto Project vì sinh toolchain trong build process. Đây giải pháp tôi thích như Chương 6, Lựa chọn build system.

### Build toolchain bằng crosstool-NG

Bắt đầu crosstool-NG vì cho thấy quá trình tạo và tạo được nhiều loại toolchain.

Vài năm trước Dan Kegel viết script/makefile sinh cross development toolchain tên crosstool (`kegel.com/crosstool`). Năm 2007 Yann E. Morin dùng nền này tạo thế hệ tiếp crosstool-NG (`crosstool-ng.org`). Ngày nay là cách thuận tiện nhất tạo cross toolchain stand-alone từ source.

### Cài crosstool-NG

Trước bắt đầu cần native toolchain, build tool hoạt động trên host PC. Với crosstool-NG trên Ubuntu, cài package bằng:

```
$ sudo apt-get install automake bison chrpath flex g++ git gperf
gawk libexpat1-dev libncurses5-dev libsdl1.2-dev libtool
python2.7-dev texinfo
```

Tiếp lấy release hiện tại từ mục download croostool-NG, `http://crosstool-ng.org/download/crosstool-ng`. Ví dụ dùng 1.20.0. Extract, tạo front-end menu system ct-ng theo lệnh:

```
$ tar xf crosstool-ng-1.20.0.tar.bz2
$ cd crosstool-ng-1.20.0
$ ./configure --enable-local
$ make
$ make install
```

Option `--enable-local` nghĩa cài chương trình vào current directory, không cần root như default `/usr/local/bin`. Gõ `./ct-ng` từ current directory mở crosstool menu.

### Chọn toolchain

Crosstool-NG build nhiều tổ hợp. Để dễ initial configuration, có sample cho common use-cases. Dùng `./ct-ng list-samples` tạo list.

Ví dụ target BeagleBone Black có ARM Cortex A8 core, VFPv3 floating point unit, muốn glibc hiện tại. Sample gần nhất `arm-cortex_a8-linux-gnueabi`. Xem default config bằng prefix `show-`:

```
$ ./ct-ng show-arm-cortex_a8-linux-gnueabi
[L..] arm-cortex_a8-linux-gnueabi
OS             : linux-3.15.4
Companion libs : gmp-5.1.3 mpfr-3.1.2 cloog-ppl-0.18.1 mpc-1.0.2
libelf-0.8.13
binutils       : binutils-2.22
C compiler     : gcc-4.9.1 (C,C++)
C library      : glibc-2.19 (threads: nptl)
Tools          : dmalloc-5.5.2 duma-2_5_15 gdb-7.8 ltrace-
0.7.3 strace-4.8
```

Để chọn làm target configuration, gõ:

```
$ ./ct-ng  arm-cortex_a8-linux-gnueabi
```

Giờ xem lại, thay đổi bằng configuration menu command `menuconfig`:

```
$ ./ct-ng menuconfig
```

Menu dựa Linux kernel `menuconfig`, nên ai từng cấu hình kernel quen điều hướng. Nếu chưa, xem Chương 4, Port và cấu hình kernel, mô tả `menuconfig`.

Tôi khuyên vài thay đổi cấu hình ở đây:

- Trong Paths and misc options, tắt Render the toolchain read-only (`CT_INSTALL_DIR_RO`)

- Trong Target options \| Floating point, chọn hardware (FPU) (`CT_ARCH_FLOAT_HW`)

- Trong C-library \| extra config, thêm --enable-obsolete-rpc (`CT_LIBC_GLIBC_EXTRA_CONFIG_ARRAY`)

Đầu cần nếu muốn thêm library sau cài toolchain, sẽ mô tả sau. Tiếp chọn floating point implementation tối ưu cho processor có hardware unit. Cuối ép sinh toolchain với obsolete header `rpc.h` vẫn được vài package dùng (chỉ vấn đề nếu chọn glibc). Tên trong ngoặc là configuration label lưu file. Đổi xong thoát `menuconfig`, lưu như thường.

Configuration data lưu file `.config`. Dòng đầu là Automatically generated make config: don't edit, thường lời khuyên tốt, nhưng tôi khuyên bỏ qua ở đây. Nhớ ARM hai ABI: truyền floating point parameter qua integer register hay VFP? Float configuration vừa chọn là loại sau, nên ABI phần tuple phải `eabihf`. Có configuration parameter đúng việc nhưng không bật mặc định, không hiện menu, ít nhất crosstool bản này. Vì thế phải sửa `.config`, thêm dòng in đậm như sau:

```
[…]
#
# arm other options
#
CT_ARCH_ARM_MODE="arm"
CT_ARCH_ARM_MODE_ARM=y
# CT_ARCH_ARM_MODE_THUMB is not set
# CT_ARCH_ARM_INTERWORKING is not set
CT_ARCH_ARM_EABI_FORCE=y
CT_ARCH_ARM_EABI=y
CT_ARCH_ARM_TUPLE_USE_EABIHF=y
[...]
```

Giờ dùng crosstool-NG lấy, configure, build component theo đặc tả bằng:

```
$ ./ct-ng build
```

Build khoảng nửa giờ, sau thấy toolchain tại `~/x-tools/arm-cortex_a8-linux-gnueabihf/`.

## Cấu tạo toolchain

Để hình dung toolchain điển hình có gì, tôi muốn khảo sát crosstool-NG toolchain vừa tạo.

Toolchain trong directory `~/x-tools/arm-cortex_a8-linux-gnueabihf/bin`. Có cross compiler `arm-cortex_a8-linux-gnueabihf-gcc`. Để dùng thêm directory vào path:

```
$ PATH=~/x-tools/arm-cortex_a8-linux-gnueabihf/bin:$PATH
```

Giờ lấy chương trình `hello world` đơn giản như:

```
#include <stdio.h>
#include <stdlib.h>
int main (int argc, char *argv[])
{
  printf ("Hello, world!\n");
  return 0;
}
```

Compile như sau:

```
$ arm-cortex_a8-linux-gnueabihf-gcc helloworld.c -o helloworld
```

Xác nhận cross compiled bằng lệnh `file` in file type:

```
$ file helloworld
helloworld: ELF 32-bit LSB executable, ARM, version 1 (SYSV),
dynamically linked (uses shared libs), for GNU/Linux 3.15.4, not
stripped
```

### Tìm hiểu cross compiler

Tưởng tượng vừa nhận toolchain, muốn biết cấu hình. Query gcc biết nhiều. Ví dụ tìm version bằng `--version`:

```
$ arm-cortex_a8-linux-gnueabi-gcc --version
arm-cortex_a8-linux-gnueabi-gcc (crosstool-NG 1.20.0) 4.9.1
Copyright (C) 2014 Free Software Foundation, Inc.
This is free software; see the source for copying conditions. There
is NO warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR
PURPOSE.
```

Tìm cách cấu hình bằng `-v`:

```
$ arm-cortex_a8-linux-gnueabi-gcc -v
Using built-in specs.
COLLECT_GCC=arm-cortex_a8-linux-gnueabihf-gcc
COLLECT_LTO_WRAPPER=/home/chris/x-tools/arm-cortex_a8-linux-
gnueabihf/libexec/gcc/arm-cortex_a8-linux-gnueabihf/4.9.1/lto-wrapper
Target: arm-cortex_a8-linux-gnueabihf
Configured with:
/home/chris/hd/home/chris/build/MELP/build/crosstool-ng-
1.20.0/.build/src/gcc-4.9.1/configure --build=x86_64-build_unknown-
linux-gnu --host=x86_64-build_unknown-linux-gnu --target=arm-
cortex_a8-linux-gnueabihf --prefix=/home/chris/x-tools/arm-cortex_a8-
linux-gnueabihf --with-sysroot=/home/chris/x-tools/arm-cortex_a8-
linux-gnueabihf/arm-cortex_a8-linux-gnueabihf/sysroot --enable-
languages=c,c++ --with-arch=armv7-a --with-cpu=cortex-a8 --with-
tune=cortex-a8 --with-float=hard --with-pkgversion='crosstool-NG
1.20.0' --enable-__cxa_atexit --disable-libmudflap --disable-libgomp
--disable-libssp --disable-libquadmath --disable-libquadmath-support
--disable-libsanitizer --with-
gmp=/home/chris/hd/home/chris/build/MELP/build/crosstool-ng-
1.20.0/.build/arm-cortex_a8-linux-gnueabihf/buildtools --with-
mpfr=/home/chris/hd/home/chris/build/MELP/build/crosstool-ng-
1.20.0/.build/arm-cortex_a8-linux-gnueabihf/buildtools --with-
mpc=/home/chris/hd/home/chris/build/MELP/build/crosstool-ng-
1.20.0/.build/arm-cortex_a8-linux-gnueabihf/buildtools --with-
isl=/home/chris/hd/home/chris/build/MELP/build/crosstool-ng-
1.20.0/.build/arm-cortex_a8-linux-gnueabihf/buildtools --with-
cloog=/home/chris/hd/home/chris/build/MELP/build/crosstool-ng-
1.20.0/.build/arm-cortex_a8-linux-gnueabihf/buildtools --with-
libelf=/home/chris/hd/home/chris/build/MELP/build/crosstool-ng-
1.20.0/.build/arm-cortex_a8-linux-gnueabihf/buildtools --with-host-
libstdcxx='-static-libgcc -Wl,-Bstatic,-lstdc++,-Bdynamic -lm' --
enable-threads=posix --enable-target-optspace --enable-plugin --
enable-gold --disable-nls --disable-multilib --with-local-
prefix=/home/chris/x-tools/arm-cortex_a8-linux-gnueabihf/arm-
cortex_a8-linux-gnueabihf/sysroot --enable-c99 --enable-long-long
Thread model: posix
gcc version 4.9.1 (crosstool-NG 1.20.0)
```

Nhiều output nhưng điểm đáng chú ý:

- `--with-sysroot=/home/chris/x-tools/arm-cortex_a8-linux-gnueabihf/arm-cortex_a8-linux-gnueabihf/sysroot`: Default sysroot directory, giải thích phần sau

- `--enable-languages=c,c++`: Bật cả C, C++

- `--with-arch=armv7-a`: Code sinh theo ARM v7a instruction set

- `--with-cpu=cortex-a8 and --with-tune=cortex-a8`: Code tinh chỉnh thêm cho Cortex A8 core

- `--with-float=hard`: Sinh opcode floating point unit, dùng VFP register truyền parameter

- `--enable-threads=posix`: Bật POSIX thread

Đây setting mặc định compiler. Override phần lớn trên gcc command line; ví dụ compile CPU khác thì override `–-with-cpu` bằng thêm `-mcpu`:

```
$ arm-cortex_a8-linux-gnueabihf-gcc -mcpu=cortex-a5 helloworld.c -o
helloworld
```

Có thể in các option architecture-specific bằng `--target-help,` như sau:

```
$ arm-cortex_a8-linux-gnueabihf-gcc --target-help
```

Có thể thắc mắc cần cấu hình chính xác lúc sinh toolchain không nếu đổi sau được; câu trả lời tùy cách dùng dự kiến. Nếu tạo toolchain mới mỗi target, nên setup tất cả ban đầu giảm rủi ro sai sau. Nói trước Chương 6, Lựa chọn build system, tôi gọi triết lý Buildroot. Ngược lại muốn toolchain generic, sẵn cung cấp setting đúng khi build target cụ thể, nên base toolchain generic như Yocto Project. Ví dụ trước theo triết lý Buildroot.

### Sysroot, library và header file

Toolchain sysroot là directory có subdirectory library, header, configuration file khác. Đặt khi cấu hình qua `--with-sysroot=` hoặc command line `--sysroot=`. Xem default location bằng `-print-sysroot`:

```
$ arm-cortex_a8-linux-gnueabi-gcc -print-sysroot
/home/chris/x-tools/arm-cortex_a8-linux-gnueabihf/arm-cortex_a8-
linux-gnueabihf/sysroot
```

Trong sysroot có:

- `lib`: Shared object của C library, dynamic linker/loader `ld-linux`

- `usr/lib`: Static library archive C library, mọi library khác có thể cài sau

- `usr/include`: Header mọi library

- `usr/bin`: Utility program chạy target như lệnh `ldd`

- `/usr/share`: Dùng localization, internationalization

- `sbin`: Utility ldconfig tối ưu library loading path

Rõ ràng một số cần trên development host compile chương trình, số khác—shared library, `ld-linux`—cần trên target runtime.

## Tool khác trong toolchain

Bảng sau cho command khác cùng mô tả ngắn:

| Lệnh | Mô tả |
|---|---|
| `addr2line` | Chuyển program address sang filename, number bằng đọc debug symbol table trong executable. Rất hữu ích decode address trong system crash report. |
| `ar` | Archive utility tạo static library. |
| `as` | GNU assembler. |
| `c++filt` | Demangle C++/Java symbol. |
| `cpp` | C preprocessor expand `#define`, `#include`, directive tương tự. Hiếm cần dùng riêng. |
| `elfedit` | Cập nhật ELF header của ELF file. |
| `g++` | GNU C++ front-end, giả định source file chứa code C++. |
| `gcc` | GNU C front-end, giả định source file chứa code C. |

| Lệnh | Mô tả |
|---|---|
| `gcov` | Code coverage tool. |
| `gdb` | GNU debugger. |
| `gprof` | Program profiling tool. |
| `ld` | GNU linker. |
| `nm` | Liệt kê symbol từ object file. |
| `objcopy` | Copy, chuyển đổi object file. |
| `objdump` | Hiển thị thông tin object file. |
| `ranlib` | Tạo/sửa index static library để link stage nhanh hơn. |
| `readelf` | Hiện thông tin file theo ELF object format. |
| `size` | Liệt kê section size, total size. |
| `strings` | Hiện printable character string trong file. |
| `strip` | Bỏ debug symbol table khỏi object file để nhỏ hơn. Thường strip mọi executable code đặt target. |

## Xem các thành phần C library

C library không chỉ một library file. Gồm bốn phần chính cùng triển khai POSIX function API:

- `libc`: C library chính chứa function POSIX well-known như `printf`, `open`, `close`, `read`, `write`, v.v.

- `libm`: Math function như `cos`, `exp`, `log`

- `libpthread`: Mọi POSIX thread function tên bắt đầu `pthread_`

- `librt`: Phần mở rộng real-time POSIX gồm shared memory, asynchronous I/O

Đầu tiên `libc` luôn link, phần khác phải link rõ bằng option `-l`. Parameter `-l` là tên library bỏ `lib`. Ví dụ chương trình tính sine bằng `sin()` link với `libm` qua `-lm`:

```
arm-cortex_a8-linux-gnueabihf-gcc myprog.c -o myprog -lm
```

Xác minh library link trong chương trình này hoặc khác bằng lệnh `readelf`:

```
$ arm-cortex_a8-linux-gnueabihf-readelf -a myprog | grep "Shared
library"
0x00000001 (NEEDED)         Shared library: [libm.so.6]
0x00000001 (NEEDED)         Shared library: [libc.so.6]
```

Shared library cần run-time linker, tìm bằng:

```
$ arm-cortex_a8-linux-gnueabihf-readelf -a myprog | grep "program
interpreter"
    [Requesting program interpreter: /lib/ld-linux-armhf.so.3]
```

Hữu ích đến mức tôi có script file chứa lệnh này trong shell script:

```
#!/bin/sh
${CROSS_COMPILE}readelf -a $1 | grep "program interpreter"
${CROSS_COMPILE}readelf -a $1 | grep "Shared library"
```

## Link với library: static và dynamic linking

Mọi ứng dụng viết cho Linux bằng C/C++ đều link C library libc. Cơ bản tới mức không cần bảo `gcc`/`g++` vì luôn link. Library khác muốn link phải nêu rõ qua option `-l`.

Library code có thể link hai cách: tĩnh, nghĩa mọi library function ứng dụng gọi cùng dependency được lấy từ library archive, gắn vào executable; động, nghĩa sinh reference tới library file/function trong code nhưng actual linking làm động runtime.

### Static library

Static linking hữu ích vài trường hợp. Ví dụ hệ nhỏ chỉ BusyBox, vài script, đơn giản hơn link BusyBox tĩnh, tránh copy runtime library và linker. Cũng nhỏ hơn vì chỉ link code ứng dụng dùng thay toàn C library. Còn hữu ích nếu cần chạy trước khi filesystem chứa runtime library sẵn có.

Bảo gcc link tĩnh mọi library bằng thêm `-static` command line:

```
$ arm-cortex_a8-linux-gnueabihf-gcc -static helloworld.c -o
helloworld-static
```

Bạn thấy binary size tăng mạnh:

```
$ ls -l
-rwxrwxr-x 1 chris chris   5323 Oct  9 09:01 helloworld
-rwxrwxr-x 1 chris chris 625704 Oct  9 09:01 helloworld-static
```

Static linking lấy code từ archive thường tên `lib[name].a`. Trên là `libc.a` trong `[sysroot]/usr/lib`:

```
$ ls -l $(arm-cortex_a8-linux-gnueabihf-gcc -print-
sysroot)/usr/lib/libc.a
-r--r--r-- 1 chris chris 3434778 Oct  8 14:00 /home/chris/x-
tools/arm-cortex_a8-linux-gnueabihf/arm-cortex_a8-linux-
gnueabihf/sysroot/usr/lib/libc.a
```

Chú ý cú pháp `$(arm-cortex_a8-linux-gnueabihf-gcc -print-sysroot)` đặt output chương trình trên command line. Tôi dùng như cách chung tham chiếu file trong sysroot.

Tạo static library đơn giản như tạo archive object file bằng `ar`. Nếu hai source file `test1.c`, `test2.c`, muốn library `libtest.a,` thì:

```
$ arm-cortex_a8-linux-gnueabihf-gcc -c test1.c
$ arm-cortex_a8-linux-gnueabihf-gcc -c test2.c
$ arm-cortex_a8-linux-gnueabihf-ar rc libtest.a test1.o test2.o
$ ls -l
total 24
-rw-rw-r-- 1 chris chris 2392 Oct  9 09:28 libtest.a
-rw-rw-r-- 1 chris chris  116 Oct  9 09:26 test1.c
-rw-rw-r-- 1 chris chris 1080 Oct  9 09:27 test1.o
-rw-rw-r-- 1 chris chris  121 Oct  9 09:26 test2.c
-rw-rw-r-- 1 chris chris 1088 Oct  9 09:27 test2.o
```

Rồi link `libtest` vào chương trình `helloworld` bằng:

```
$ arm-cortex_a8-linux-gnueabihf-gcc helloworld.c -ltest -L../libs -
I../libs -o helloworld
```

### Shared library

Cách triển khai phổ biến hơn là shared object link runtime, dùng storage/system memory hiệu quả vì chỉ cần load một code copy. Cũng dễ cập nhật library không re-link mọi chương trình dùng.

Object code shared library phải position-independent để runtime linker tự đặt memory tại address trống kế. Thêm `-fPIC` gcc rồi link option `-shared`:

```
$ arm-cortex_a8-linux-gnueabihf-gcc -fPIC -c test1.c
$ arm-cortex_a8-linux-gnueabihf-gcc -fPIC -c test2.c
$ arm-cortex_a8-linux-gnueabihf-gcc -shared -o libtest.so test1.o
test2.o
```

Để link ứng dụng, thêm `-ltest` như static trước, nhưng lần này code không vào executable mà có library reference để runtime linker resolve:

```
$ arm-cortex_a8-linux-gnueabihf-gcc helloworld.c -ltest -L../libs -
I../libs -o helloworld
$ list-libs helloworld
[Requesting program interpreter: /lib/ld-
linux-armhf.so.3]
0x00000001 (NEEDED)                     Shared library: [libtest.so]
0x00000001 (NEEDED)                     Shared library: [libc.so.6]
```

Runtime linker là `/lib/ld-linux-armhf.so.3`, phải trong target filesystem. Linker tìm `libtest.so` trong default path `/lib`, `/usr/lib`. Nếu muốn tìm directory khác, đặt list path colon-separated trong shell variable `LD_LIBRARY_PATH`:

```
# export LD_LIBRARY_PATH=/opt/lib:/opt/usr/lib
```

#### Hiểu shared library version number

Ưu điểm shared library là update độc lập chương trình dùng. Hai loại update: fix bug/thêm function backwards-compatible, hoặc phá tương thích ứng dụng hiện có. GNU/Linux có versioning scheme cho cả hai.

Mỗi library có release version, interface number. Release version chỉ string thêm tên, ví dụ JPEG image library libjpeg hiện release 8.0.2 nên tên `libjpeg.so.8.0.2`. Symbolic link `libjpeg.so` tới `libjpeg.so.8.0.2` để khi compile bằng `–ljpeg,` link bản hiện tại. Nếu cài 8.0.3, link cập nhật, bạn link bản đó.

Giả sử 9.0.0 tới, phá backwards compatibility. Link `libjpeg.so` trỏ `libjpeg.so.9.0.0` nên chương trình mới link bản mới, có thể compile error khi interface đổi mà developer sửa được. Chương trình target chưa compile lại thất bại kiểu nào đó vì dùng interface cũ. Đây `soname` giúp. `soname` mã hóa interface number lúc build, runtime linker dùng khi load. Format `<library name>.so.<interface number>`. Với `libjpeg.so.8.0.2,` thì `soname` là `libjpeg.so.8`:

```
$ readelf -a /usr/lib/libjpeg.so.8.0.2 | grep SONAME
0x000000000000000e (SONAME)             Library soname:
[libjpeg.so.8]
```

Chương trình compile với nó request `libjpeg.so.8` runtime, là symbolic link target tới `libjpeg.so.8.0.2`. Khi cài libjpeg 9.0.0 có `soname` `libjpeg.so.9`, nên cài được hai bản không tương thích cùng library trên hệ. Chương trình link `libjpeg.so.8.*.*` load `libjpeg.so.8,`, link `libjpeg.so.9.*.*` load `libjpeg.so.9`.

Đó vì sao listing `<sysroot>/usr/lib/libjpeg*` thấy bốn file:

- `libjpeg.a`: Library archive dùng static linking

- `libjpeg.so -> libjpeg.so.8.0.2` : Symbolic link dùng dynamic linking

- `libjpeg.so.8 -> libjpeg.so.8.0.2`: Symbolic link khi load library runtime

- `libjpeg.so.8.0.2`: Shared library thực dùng compile time, runtime

Hai file đầu chỉ cần host để build, hai cuối cần target runtime.

## Nghệ thuật cross compiling

Có cross toolchain hoạt động là khởi đầu hành trình, không kết thúc. Lúc nào đó muốn cross compile tool, application, library target cần. Nhiều là open source package, mỗi loại phương pháp compile, đặc điểm riêng. Một số common build system:

- Makefile thuần điều khiển toolchain qua variable `make` `CROSS_COMPILE`

- GNU build system tên Autotools

- CMake (`https://cmake.org`)

Chỉ trình bày hai đầu vì cần ngay embedded Linux cơ bản. Với CMake có tài nguyên xuất sắc trên website tham chiếu trên.

### Makefile đơn giản

Một số package quan trọng dễ cross compile, gồm Linux kernel, bootloader U-Boot, Busybox. Mỗi loại chỉ đặt toolchain prefix trong variable `make` `CROSS_COMPILE`, ví dụ `arm-cortex_a8-linux-gnueabi-`. Chú ý dash cuối `-`.

Vậy compile Busybox bằng:

```
$ make CROSS_COMPILE=arm-cortex_a8-linux-gnueabi-
```

Hoặc đặt shell variable:

```
$ export CROSS_COMPILE=arm-cortex_a8-linux-gnueabi-
$ make
```

Với U-Boot/Linux còn phải đặt variable `make` `ARCH` theo architecture hỗ trợ, trình bày Chương 3, Tất cả về bootloader và Chương 4, Port và cấu hình kernel.

### Autotools

Autotools chỉ nhóm tool làm build system nhiều open source project. Component cùng project page:

- GNU Autoconf (`http://www.gnu.org/software/autoconf/autoconf.html`)

- GNU Automake (`http://www.gnu.org/savannah-checkouts/gnu/automake`)

- GNU Libtool (`http://www.gnu.org/software/libtool/libtool.html`)

- Gnulib (`https://www.gnu.org/software/gnulib`)

Vai trò Autotools là làm mượt khác biệt nhiều loại hệ thống compile package, xét compiler version, library version, header location, dependency package khác. Package dùng Autotools có script `configure` kiểm dependency, sinh makefile theo kết quả. Script cũng có thể cho bật/tắt feature. Tìm option bằng `./configure --help`.

Để configure, build, install package cho native operating system, thường chạy ba lệnh:

```
$ ./configure
$ make
$ sudo make install
```

Autotools cũng xử lý cross development. Ảnh hưởng configure script bằng shell variable:

- `CC`: C compiler command

- `CFLAGS`: C compiler flag bổ sung

- `LDFLAGS`: Linker flag bổ sung, ví dụ library ở directory non-standard `<lib dir>` thì thêm library search path bằng `-L<lib dir>`

- `LIBS`: List library bổ sung cho linker, ví dụ `-lm` cho math library

- `CPPFLAGS`: C/C++ preprocessor flag, ví dụ thêm `-I<include dir>` tìm header trong directory non-standard `<include dir>`

- `CPP`: C preprocessor dùng

Đôi khi chỉ cần đặt variable `CC`:

```
$ CC=arm-cortex_a8-linux-gnueabihf-gcc ./configure
```

Lúc khác dẫn lỗi:

```
[...]
checking whether we are cross compiling... configure: error: in '/home/
chris/MELP/build/sqlite-autoconf-3081101':
configure: error: cannot run C compiled programs.
If you meant to cross compile, use '--host'.
See 'config.log' for more details
```

Lý do thất bại là `configure` thường khám phá toolchain capability bằng compile code snippet, chạy xem kết quả, không thể nếu cross compiled. Tuy nhiên message gợi ý giải pháp. Autotools hiểu ba machine type có thể liên quan khi compile:

- Build: Máy build package, mặc định current machine.

- Host: Máy chạy chương trình. Native compile để trống, mặc định cùng build. Cross compile đặt tuple toolchain.

- Target: Máy mà chương trình sẽ sinh code cho, ví dụ đặt khi build cross compiler.

Vậy cross compile chỉ cần override host:

```
$ CC=arm-cortex_a8-linux-gnueabihf-gcc \
./configure --host=arm-cortex_a8-linux-gnueabihf
```

Điểm cuối: default install directory `<sysroot>/usr/local/*`. Thường cài `<sysroot>/usr/*` để header/library được tìm ở default location. Lệnh đầy đủ configure package Autotools điển hình:

```
$ CC=arm-cortex_a8-linux-gnueabihf-gcc \
./configure --host=arm-cortex_a8-linux-gnueabihf --prefix=/usr
```

#### Ví dụ: SQLite

SQLite library triển khai relational database đơn giản, khá phổ biến embedded. Bắt đầu lấy bản sao:

```
$ wget http://www.sqlite.org/2015/sqlite-autoconf-3081101.tar.gz
$ tar xf sqlite-autoconf-3081101.tar.gz
$ cd sqlite-autoconf-3081101
```

Tiếp chạy configure script:

```
$ CC=arm-cortex_a8-linux-gnueabihf-gcc \
./configure --host=arm-cortex_a8-linux-gnueabihf --prefix=/usr
```

Có vẻ hoạt động! Nếu lỗi, có message trên terminal và `config.log`. Chú ý đã tạo nhiều makefile, giờ build:

```
$ make
```

Cuối cài vào toolchain directory bằng variable `make` `DESTDIR`. Nếu không sẽ thử cài directory `/usr` của host, không phải điều muốn.

```
$ make DESTDIR=$(arm-cortex_a8-linux-gnueabihf-gcc -print-sysroot)
install
```

Có thể lệnh cuối lỗi file permission. Toolchain crosstool-NG mặc định read-only, vì vậy hữu ích đặt `CT_INSTALL_DIR_RO` thành `y` lúc build. Vấn đề thường khác là toolchain cài system directory như `/opt`, `/usr/local`, cần root khi install.

Sau cài, nên thấy nhiều file thêm toolchain:

- `<sysroot>/usr/bin`: sqlite3. Interface command-line SQLite có thể cài, chạy target.

- \<`sysroot>/usr/lib`: libsqlite3.so.0.8.6, libsqlite3.so.0, libsqlite3.so libsqlite3. la libsqlite3.a. Shared và static library.

- `<sysroot>/usr/lib/pkgconfig`: `sqlite3.pc`: Package configuration file, mô tả phần sau.

- `<sysroot>/usr/lib/include`: `sqlite3.h`, `sqlite3ext.h`: Header file.

- \<`sysroot>/usr/share/man/man1`: sqlite3.1. Manual page.

Giờ compile chương trình dùng sqlite3 bằng thêm `-lsqlite3` ở link stage:

```
$ arm-cortex_a8-linux-gnueabihf-gcc -lsqlite3 sqlite-test.c -o
sqlite-test
```

Ở đây `sqlite-test.c` là chương trình giả định gọi SQLite function. Vì sqlite3 cài sysroot, compiler tìm header/library dễ. Nếu cài nơi khác phải thêm `-L<lib dir>`, `-I<include dir>`.

Tất nhiên cũng có runtime dependency, cần cài file đúng vào target directory như Chương 5, Tạo root filesystem.

### Package configuration

Theo dõi package dependency khá phức tạp. Utility `pkg-config` (`http://www.freedesktop.org/wiki/Software/pkg-config`) giúp theo dõi package đã cài, compile flag từng loại bằng database Autotools package trong `[sysroot]/usr/lib/pkgconfig`. Ví dụ SQLite3 tên `sqlite3.pc`, chứa thông tin thiết yếu package khác cần để dùng:

```
$ cat $(arm-cortex_a8-linux-gnueabihf-gcc -print-
sysroot)/usr/lib/pkgconfig/sqlite3.pc
# Package Information for pkg-config
prefix=/usr
exec_prefix=${prefix}
libdir=${exec_prefix}/lib
includedir=${prefix}/include
Name: SQLite
Description: SQL database engine
Version: 3.8.11.1
Libs: -L${libdir} -lsqlite3
Libs.private: -ldl -lpthread
Cflags: -I${includedir}
```

Dùng utility `pkg-config` trích thông tin dạng cấp trực tiếp gcc. Với library như libsqlite3 cần biết library name (`--libs`) và special C flag (`--cflags`):

```
$ pkg-config sqlite3 --libs --cflags
Package sqlite3 was not found in the pkg-config search path.
Perhaps you should add the directory containing `sqlite3.pc'
to the PKG_CONFIG_PATH environment variable
No package 'sqlite3' found
```

Ối! Thất bại vì tìm sysroot host, chưa cài development package libsqlite3 trên host. Cần trỏ sysroot target toolchain bằng shell variable `PKG_CONFIG_LIBDIR`:

```
$ PKG_CONFIG_LIBDIR=$(arm-cortex_a8-linux-gnueabihf-gcc -print-
sysroot)/usr/lib/pkgconfig \
pkg-config sqlite3 --libs --cflags
 -lsqlite3
```

Giờ output `-lsqlite3`. Ở đây đã biết nhưng thường không, nên kỹ thuật giá trị. Lệnh compile cuối:

```
$ PKG_CONFIG_LIBDIR=$(arm-cortex_a8-linux-gnueabihf-gcc -print-
sysroot)/usr/lib/pkgconfig \
arm-cortex_a8-linux-gnueabihf-gcc $(pkg-config sqlite3 --cflags --
libs) sqlite-test.c -o sqlite-
```

## Vấn đề cross compiling

Sqlite3 là package well-behaved, cross compile tốt nhưng không phải mọi package dễ vậy. Điểm khó điển hình:

- Build system Home-grown, ví dụ zlib có configure script nhưng không giống Autotools configure phần trước

- Configure script đọc `pkg-config` information, header, file khác từ host, bỏ qua override `--host`

- Script cứ thử chạy cross compiled code

Mỗi trường hợp cần phân tích lỗi kỹ, thêm parameter configure script để cấp thông tin đúng, hoặc patch code tránh hẳn vấn đề. Nhớ một package có thể nhiều dependency, đặc biệt chương trình GUI dùng GTK/QT hay multimedia. Ví dụ mplayer, tool phát multimedia phổ biến, phụ thuộc hơn 100 library. Build hết mất nhiều tuần.

Vì vậy tôi không khuyên cross compile thủ công component target kiểu này trừ không lựa chọn hoặc số package ít. Tốt hơn nhiều dùng Buildroot/Yocto Project, hoặc tránh bằng native build environment target architecture. Giờ thấy vì sao distribution như Debian luôn compile native.

## Tổng kết

Toolchain luôn là điểm đầu: mọi thứ sau phụ thuộc toolchain hoạt động, đáng tin.

Phần lớn embedded build environment dựa cross development toolchain tách rõ host mạnh build code và target chạy. Toolchain gồm GNU binutils, C compiler từ GNU compiler collection—có lẽ cả C++—cộng C library đã mô tả. Thường GNU debugger gdb sinh lúc này, mô tả Chương 12, Debug bằng GDB. Cũng theo dõi Clang sẽ phát triển vài năm tới.

Có thể bắt đầu chỉ toolchain—crosstool-NG build hoặc Linaro download—dùng compile mọi package target cần, chấp nhận công sức lớn. Hoặc lấy toolchain trong distribution có nhiều package. Distribution sinh từ source bằng Buildroot/Yocto Project, hoặc binary distribution bên thứ ba như thương mại Mentor Graphics, open source Denx ELDK. Cẩn thận toolchain/distribution tặng miễn phí cùng hardware: thường cấu hình kém, không duy trì. Dù trường hợp nào chọn theo tình huống rồi dùng nhất quán suốt dự án.

Khi có toolchain, build được component embedded Linux khác. Chương sau học bootloader đưa device vào hoạt động, bắt đầu boot.
