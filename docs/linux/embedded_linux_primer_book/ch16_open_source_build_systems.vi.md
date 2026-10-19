# Chương 16. Open source build system

## Trong chương này

- 16\.1 Vì sao dùng build system? 446

- 16\.2 Scratchbox 447

- 16\.3 Buildroot 451

- 16\.4 OpenEmbedded 454

- 16\.5 Tổng kết 464

Software build system tồn tại từ lâu. Trong lịch sử,

chúng có nhiều dạng, từ hệ thống script-driven hoặc make-based đơn giản

đến chương trình phần mềm phức tạp, thường độc quyền, thiết kế build dự

án cụ thể. Nhiều open source build system xuất hiện rồi biến mất, một số

vượt qua thử thách thời gian.

Chương giới thiệu một số build system phổ biến hơn, xem chi

tiết một hệ thống nổi lên thành ứng viên hàng đầu để

build embedded Linux system: OpenEmbedded.

## 16.1 Vì sao dùng build system?

Có nhiều nguồn embedded Linux distribution hoàn chỉnh. Có thể tìm trực tuyến, download miễn phí hoặc mua từ commercial supplier. Thường chúng cố định chức năng, khó đổi. Thường kèm giải pháp binary-only như toolchain quan trọng, critical package mà không có hướng dẫn sinh từ source.

Embedded Linux build system tốt giúp tạo distribution theo yêu cầu riêng. Phải gồm cross-toolchain và mọi package cần. Build system nên sinh root file system theo binary format chọn, embedded Linux kernel image với cấu hình riêng, bootloader image, file và utility cần khác để triển khai đúng.

Build embedded Linux distribution—hay Linux distribution bất kỳ—từ đầu hoàn toàn không đơn giản. Tưởng tượng tập hợp mọi thành phần desktop Linux distribution. Đừng quên toolchain, vì với embedded application, trái quan niệm phổ biến, lấy toolchain commercial-quality cho architecture non-x86 rất khó nếu thiếu kiến thức, kinh nghiệm chuyên biệt phát triển, test cross-toolchain cho architecture chọn.

Lập danh sách thành phần cần có thể là thách thức đầu. Toolchain từ đâu? System library, bootloader cần thì sao? Lấy ở đâu? Cần package nào hỗ trợ hardware device, software application dự kiến cho sản phẩm? Dependency từng package là gì? Dùng file system nào, build thế nào? Theo dõi package version, dependency thế nào? Xác định phiên bản package, tool nào tương thích nhau ra sao? Quản lý update/upgrade distribution, sản phẩm embedded thế nào? Patch tích hợp sau đó ra sao?

Đó là câu hỏi lập trình viên embedded đối mặt khi hình thành kế hoạch. Build system embedded Linux well-designed, dễ hỗ trợ là công cụ hoàn hảo giúp trả lời và triển khai dự án nhanh, dễ bảo trì.

Vài phần sau giới thiệu các build system phổ biến hơn. Dành thời gian đáng kể mô tả OpenEmbedded, một hệ thống triển vọng và phổ biến nhất.

## 16.2 Scratchbox

Scratchbox là toolkit cross-compilation phổ biến khi dùng trong Maemo project cho Nokia N770 handheld computer. Maemo sau đó hợp nhất Moblin thành MeeGo (www.meego.com).

Theo Scratchbox website, hỗ trợ ARM/X86 target, hỗ trợ thử nghiệm PowerPC/MIPS. Installation manual mới nhất nói hỗ trợ PowerPC target.

### 16.2.1 Cài Scratchbox

Cài đơn giản theo website. Với hệ thống Debian-based như Ubuntu, thêm dòng sau vào file `/etc/apt/sources.` `list`:

```
deb http://scratchbox.org/debian stable main
```

Sau đó update, cài package cần, thêm username[^1] vào Scratchbox. Listing 16-1 cho chuỗi.

LISTING 16-1 Cài Scratchbox

```
$ sudo apt-get update
$ sudo apt-get install scratchbox-core
$ sudo sb-adduser <your username>
```

Chú ý chuỗi chỉ dẫn cần root access. Không vấn đề lớn nếu có root trên build machine. Nhiều lập trình viên doanh nghiệp lớn không có do chính sách IT. Cần cân nhắc có là vấn đề cho ứng dụng không.

Cũng chú ý sau `sb-adduser` thêm username vào hạ tầng Scratchbox, phải logout, login lại bằng shell mới để cập nhật group membership. Scratchbox documentation mô tả đầy đủ.

### 16.2.2 Tạo target Cross-Compilation

Sau cài Scratchbox phải làm vài bước trước build. Đầu cài toolchain, qemu (processor emulator phổ biến) để target emulation. Rồi login Scratchbox, initial setup bằng utility menu-driven. Cài toolchain dễ với distribution Debian-based như Ubuntu. Có nhiều toolchain; xem tab Download website cho bản hiện tại. Ví dụ chọn ARM compiler:

```
$ sudo apt-get install scratchbox-toolchain-arm-linux-cs2010q1-202
$ sudo apt-get install scratchbox-devkit-qemu
```

Tiếp login Scratchbox user, tạo target cross-compilation. Dùng chương trình `login` của Scratchbox:

```
$ /scratchbox/login
```

Sau login, gọi configuration utility menu-based tên `sb-menu`. Gọi như sau:

```
$ [sbox-NO-TARGET: ~] > sb-menu
```

Hình 16-1 cho main configuration screen kết quả.

![Figure 16-1](images/ch16/fig16-01.png)

HÌNH 16-1 Scratchbox menuconfig

Dùng installation documentation trên website (`installdoc.` `pdf`) làm hướng dẫn (www.scratchbox.org/documentation/docbook/installdoc.html), setup Scratchbox environment theo bước:

1\. Tạo target mới dưới Setup tên `mytarget`.

2\. Chọn cross-compiler khi nhắc sau chọn target.

3\. Chọn devkits, rồi qemu.

4\. Chọn CPU transparency, rồi qemu-arm-sb.

Xong bước, thoát utility `sb-menu`. Giờ sẵn khám phá Scratchbox environment.

Demo ngắn dùng Hello World đơn giản. Dùng editor ưa thích trong Scratchbox shell tạo chương trình tương tự Listing 16-2.

LISTING 16-2 Ví dụ Hello World đơn giản

```
#include <stdio.h>

int main(int argc, char **argv)
{
    printf(“Hello world\n”);
        return 0;
}
```

Giờ compile trong Scratchbox environment:

```
[sbox-mytarget: ~] > gcc -o hello-arm hello.c
```

Dùng Scratchbox ARM toolchain vừa cài compile file `hello.c`. Lệnh gọi ARM toolchain qua Scratchbox wrapper. Có thể thấy wrapper trong `/scratchbox/compilers/bin`. Wrapper quyết định compiler theo target specification vừa tạo. Sau đó kiểm tra file là ARM binary, chạy trong Scratchbox shell bằng công nghệ qemu emulation của môi trường:

```
[sbox-mytarget: ~] > file hello-arm
hello-arm: ELF 32-bit LSB executable, ARM, version 1 (SYSV), for GNU/Linux 2.6.16,
dynamically linked (uses shared libs), not stripped
[sbox-mytarget: ~] > ./hello-arm
Hello
```

Dù đơn giản, ví dụ minh họa môi trường, phương pháp Scratchbox. Model cung cấp môi trường phát triển trông như target. Ưu điểm là nhiều open source package khó cross-compile trở nên dễ hơn nhờ target emulation.

Tất nhiên use case thực phức tạp hơn nhiều nhưng architecture, cách tiếp cận rõ. Thực tế có nhiều package, software program compile trong môi trường, có lẽ bằng chuỗi makefile hoặc custom build script tạo theo yêu cầu.

Scratchbox có remote shell feature cho làm hành động tương tác, không tương tác trực tiếp trên real target hardware. Hoạt động tương tự remote shell (`rsh`) quen thuộc, tên `sbrsh`, thuộc cài đặt. Chi tiết `sbrsh` trong documentation.

Scratchbox có documentation tốt. Muốn học thêm hãy cài, theo tài liệu website (www.scratchbox.org).

## 16.3 Buildroot

Buildroot là tập makefile, patch trong hệ thống thiết kế build embedded Linux distribution hoàn chỉnh. Theo website, tính năng chính:

- Build mọi thành phần sản phẩm embedded Linux cần, gồm cross-compiler, root file system, kernel image, bootloader.

- Cấu hình đơn giản bằng Linux kernel menuconfig, utility liên quan quen thuộc.

- Hỗ trợ vài trăm package user space application/library, gồm GTK2, Qt, GStreamer, nhiều network utility.

- Hỗ trợ uClibc hoặc glibc cùng target library khác.

- Cấu trúc đơn giản dựa makefile language được hiểu rõ.

### 16.3.1 Cài Buildroot

Đầu tìm, download Buildroot snapshot. Dễ nhất bằng git. Tất nhiên dùng git không chỉ tag nghĩa lấy top of tree mới nhất, có rủi ro không ổn định như mọi open source project. Với người ít mạo hiểm, có stable snapshot để download ở http://buildroot.uclibc.org/downloads/buildroot.html. Ví dụ dùng git:

```
$ git clone git://git.buildroot.net/buildroot
```

### 16.3.2 Cấu hình Buildroot

Sau cài snapshot (hoặc git repository), bắt đầu configuration. Vào directory cài, gọi lệnh cấu hình quen:

```
$ make menuconfig
```

Nó mở configuration utility giờ rất quen. Đã thấy menu tương tự với Linux kernel và Scratchbox. Hình 16-2 cho dạng.

![Figure 16-2](images/ch16/fig16-02.png)

HÌNH 16-2 Cấu hình Buildroot

Buildroot configuration phong phú. Có nhiều option cấu hình property của embedded Linux distribution sẽ tạo. Một số attribute quan trọng phải chọn:

- Target architecture

- Architecture variant như PowerPC 603e hoặc ARM 920t

- Target option như board device, serial port

- Build option định nghĩa option build-related như nơi build/download directory, parallelism (số job đồng thời), build attribute khác

- Toolchain option gồm library type (uClibc/glibc), compiler version.

- Package selection như software package trên target

### 16.3.3 Build bằng Buildroot

Sau cấu hình đơn giản, bắt đầu build chỉ bằng `make`. Nếu cấu hình tốt, may mắn,[^2] sẽ có distribution hoàn chỉnh. Build có thể lâu vì download, build nhiều component và thực hiện nhiều bước. Nhiều output cuộn trên serial terminal khi build. Các bước chung:

- Download source file cho mọi package, toolchain cấu hình

- Build cross-compilation toolchain

- Dùng cross-toolchain cấu hình, compile mọi package yêu cầu

- Build kernel image nếu cấu hình

- Tạo root file system theo format chọn

Build xong thấy kết quả trong directory `.../output`, như Listing 16-3.

LISTING 16-3 Output directory structure của Buildroot

```
chris@speedy:~/sandbox/buildroot$ ls -l output
total 28
drwxr-xr-x  7 chris chris 4096 2010-07-31 16:45 build
drwxr-xr-x  3 chris chris 4096 2010-07-31 16:45 host
drwxr-xr-x  2 chris chris 4096 2010-07-31 16:45 images
drwxr-xr-x  5 chris chris 4096 2010-07-31 16:34 staging
drwxr-xr-x  2 chris chris 4096 2010-07-31 16:44 stamps
drwxr-xr-x 16 chris chris 4096 2010-07-31 16:45 target
drwxr-xr-x 18 chris chris 4096 2010-07-31 16:41 toolchain
```

Root file system đúng ở `.../output/images`. Vì chọn ext2 khi cấu hình, thấy image `rootfs.ext2` trong images subdirectory:

```
chris@speedy:~/sandbox/buildroot$ ls -l ./output/images/
total 3728
-rw-r--r-- 1 chris chris 3817472 2010-07-31 16:45 rootfs.ext2
-rwxr-xr-x 1 chris chris   65656 2010-07-31 17:31 u-boot.bin
```

Buildroot linh hoạt, nhiều option. Có thể build U-Boot cho board cụ thể chỉ bằng chỉ board name từ U-Boot makefile (không hậu tố `_config`) lúc cấu hình. Ví dụ chọn ap920t, cũng sinh image U-Boot (`u-boot.bin`). Documentation có thêm chi tiết.

Directory khác trong output subdirectory như Listing 16-3 giữ intermediate build target. Subdirectory `staging` giữ build target của package mà package khác phụ thuộc. Directory `toolchain` chứa component cần compile cross-toolchain. Directory `host` chứa tool host-specific build hỗ trợ Buildroot, gồm `fakeroot` (tạo root file system không root privilege), chương trình sinh image. Directory `target` là near-replica của root file system image nhưng không dùng trực tiếp được: user, group, permission, device node sai. Fakeroot dùng directory này tạo final image. Cuối cùng `build` là nơi build mọi component trừ cross-toolchain.

Buildroot mạnh, build distribution hoàn chỉnh. Xem documentation http://buildroot.uclibc.org/docs.html đầy đủ.

## 16.4 OpenEmbedded

Có nhiều tranh luận về tiến hóa nhưng với OpenEmbedded dễ thấy nó phát triển từ nhiều công nghệ trước. Chia sẻ một số nguồn gốc khái niệm với Portage build system của Gentoo, cũng dựa khái niệm hệ khác gồm Buildroot.

Trang chủ (www.openembedded.org) nói OpenEmbedded “...cung cấp môi trường cross-compile best-in-class”. Với giới hạn hệ khác và độ linh hoạt OpenEmbedded, có thể đúng. Website cũng liệt kê ưu điểm:

- Hỗ trợ nhiều hardware architecture.

- Hỗ trợ nhiều release cho architecture đó.

- Có tool tăng tốc re-creating nền tảng sau thay đổi.

- Dễ tùy chỉnh.

- Chạy trên mọi Linux distribution.

- cross-compiles hàng nghìn package gồm GTK+, Qt, X Windows, Mono, Java.

OpenEmbedded được tiếp nhận mạnh trong dự án thương mại, open source. Nhiều tổ chức chọn làm build system ưa thích. Thực tế supplier Embedded Linux như Mentor Graphics, MontaVista Software dùng làm cơ sở sản phẩm thương mại.

### 16.4.1 Thành phần OpenEmbedded

OpenEmbedded gồm hai phần chính như Hình 16-3. BitBake là build engine mạnh, linh hoạt. Metadata là tập chỉ dẫn báo BitBake build gì.

![Figure 16-3](images/ch16/fig16-03.png)

HÌNH 16-3 BitBake và metadata

BitBake xử lý metadata cung cấp chỉ dẫn build. Cuối build sinh mọi image yêu cầu: root file system, kernel, bootloader, intermediate image như device tree binary (Power Architecture). Tính năng mạnh hơn là tạo software development kit (SDK). SDK có thể chứa toolchain, library, header file để application developer dùng trong môi trường self-contained.

### 16.4.2 BitBake metadata

Metadata có thể chia sơ bốn nhóm, mỗi nhóm vai trò riêng:

- Recipe

- Class

- Task

- Configuration

Loại metadata phổ biến nhất là recipe file, thường chứa chỉ dẫn BitBake build một package. Recipe mô tả package, dependency, mọi hành động đặc biệt cần build.

Class tương tự class trong ngôn ngữ object-oriented như C++/Java, đóng gói chức năng chung dùng qua nhiều recipe.

Task thường gom package cho build root file system. Thường là file đơn giản, ít hơn vài dòng dependency.

Configuration metadata quan trọng định nghĩa hành vi tổng thể BitBake. Cung cấp global build variable như build path, default image construction command, đặc điểm machine cụ thể. Cũng định nghĩa distribution đang tạo như toolchain, C library (uClibc, glibc, v.v.).

### 16.4.3 Recipe cơ bản

Đơn vị metadata phổ biến nhất là recipe, thường một file hoặc tập file nhỏ build một package. Xem recipe đơn giản giúp hiểu metadata language. Listing 16-4 là OpenEmbedded Hello World. Recipe build ứng dụng đơn giản, chuẩn bị đưa vào root file system cuối. Tên trên file system `hello_1.0.0.bb`.

LISTING 16-4 OpenEmbedded recipe đơn giản: `hello_1.0.0.bb`

```
DESCRIPTION = “Hello demo project”
PR = “r0”
LICENSE = “GPL”

SRC_URI = “http://localhost/sources/hello-1.0.0.tar.gz”

SRC_URI[md5sum] = “90a8ffd73e4b467b6d4852fb95e493b9”
SRC_URI[sha256sum] = “fd626b829cf1df265abfceac37c2b5629f2ba8fbc3897add29f-
9661caa40fe12”

do_install() {
        install -m 0755 -d ${D}${bindir}
        install -m 0755 ${S}/hello ${D}${bindir}/hello
}
```

Vài field đầu chỉ mang tính quản lý:

- `DESCRIPTION`—Thông tin mô tả chính package

- `PR`—Package (recipe) version number

- `LICENSE`—License package

`SRC_URI` phải có trong mọi recipe. Định nghĩa method (`http` ở đây), location (`localhost/sources/hello-1.1.0.tar.gz`) BitBake dùng định vị, lấy file tạo package. Source code có thể fetch [^3] nhiều dạng, nhiều cách: git/svn/cvs repository local hoặc remote, file/tarball local hoặc Internet server.

`SRC_URI[md5sum]` là một cách chỉ checksum xác thực fetch source archive đúng. Nếu có remote md5/sha256 signature file, kiểm tra với giá trị này để bảo đảm download đúng.

Method `do_install` override default install method BitBake. Trong recipe mẫu, method `do_install` định nghĩa hai bước bằng lệnh Linux `install`: tạo output directory chứa build artifact (binary `hello`), đặt binary vào directory vừa tạo. Directory dùng cú pháp thường gặp autotools configuration script, build file. `{bindir}` chỉ `/bin` target. `S`, `D` là convenience variable metadata chỉ source, destination directory. Đọc thêm lệnh `install` trên Linux desktop ở man page `man install`.

Recipe có thể chứa directive Python hoặc bash shell script. Ví dụ Listing 16-4 chỉ bash. Python ngoài phạm vi phần này.

Có thể thắc mắc recipe đơn giản build Hello World thế nào. Có install step nhưng ít build instruction khác. BitBake xử lý recipe theo default step trong OpenEmbedded class. BitBake class là file đuôi `.bbclass`. Phần lớn default processing step từ special base class `base.bbclass`, nơi định nghĩa default command fetch, unpack, configure, compile, install.

Listing 16-5 cho BitBake output khi build hello. BitBake nhận mọi recipe hoặc task[^4] làm build target.

LISTING 16-5 BitBake xử lý Hello recipe

```
chris@speedy:~/sandbox/build01$ bitbake hello
<...>
NOTE: Executing runqueue
NOTE: Running task 10 of 38 (ID: 5, NOTE: Running task 10 of 38 (ID: 5,
/hello_1.0.0.bb, do_fetch)
NOTE: Running task 11 of 38 (ID: 0, /hello_1.0.0.bb, do_unpack)
NOTE: Running task 15 of 38 (ID: 1, /hello_1.0.0.bb, do_patch)
NOTE: Running task 16 of 38 (ID: 7, /hello_1.0.0.bb, do_configure)
NOTE: Running task 17 of 38 (ID: 8, /hello_1.0.0.bb, do_compile)
NOTE: Running task 18 of 38 (ID: 2, /hello_1.0.0.bb, do_install)
NOTE: Running task 19 of 38 (ID: 10, /hello_1.0.0.bb, do_package)
NOTE: Running task 25 of 38 (ID: 13, /hello_1.0.0.bb, do_package_write_ipk)
NOTE: Running task 26 of 38 (ID: 9, /hello_1.0.0.bb, do_package_write)
NOTE: Running task 29 of 38 (ID: 3, /hello_1.0.0.bb, do_populate_sysroot)
NOTE: Running task 30 of 38 (ID: 12, /hello_1.0.0.bb, do_package_stage)
NOTE: Running task 37 of 38 (ID: 11, /hello_1.0.0.bb, do_package_stage_all)
NOTE: Running task 38 of 38 (ID: 4, /hello_1.0.0.bb, do_build)
NOTE: Tasks Summary: Attempted 38 tasks of which 25 didn’t need to be rerun and 0
failed.
```

Chú ý listing format cho dễ đọc. Mỗi dòng cắt full path tới recipe file `hello_1.0.0.bb`, bỏ vài dòng không liên quan.

Từ Listing 16-5 thấy từng bước BitBake build package định nghĩa bởi recipe `hello_1.0.0.bb`. Đầu (fetch) download hello tarball từ server. Unpack untar vào working directory do configuration metadata định nghĩa. Listing 16-4 cho working directory tham chiếu bằng variable `S`. Bước `do_patch` áp dụng patch cần trong metadata.

Configure theo patch. Recipe này là null method, không làm gì vì không cần configure. Tiếp là compile step, gọi generic make trong hello source working directory, mong package makefile build. Sau đó install. Chú ý Listing 16-5 đã override default install stage bằng định nghĩa riêng, có ưu tiên. Nó cài binary `hello` như Listing 16-4.

Vài bước packaging tiếp tạo binary package chứa file đã đưa bằng install method. Packaging chi tiết ngoài phạm vi nhưng mỗi recipe tạo binary package theo dạng metadata chỉ. Thường `.ipk`, công nghệ gọn nhẹ riêng embedded Linux. Package kết quả đặt trong output directory đặc biệt BitBake tạo.

Populate, staging chuyển file cần tới staging location đặc biệt để package sau phụ thuộc artifact này có sẵn. Root file system cuối cũng được tập hợp từ directory recipe-specific thu build artifact. Đó là việc method `do_build`.

BitBake xử lý recipe thành công, package được build. Artifact (thường binary/library hoặc tập hợp) đặt trong directory recipe-specific để chương trình khác tham chiếu khi build. Recipe image-building sau thu artifact từ directory recipe-specific đưa vào final root file system.

Các phần sau thảo luận nhóm metadata chính khác—task, class, configuration.

### 16.4.4 Metadata task

Task là recipe gom package, thường để build root file system. Không tạo output package chứa artifact vì sẽ trống. Có thể có hoặc không “task” trong tên.

Chú ý thuật ngữ task trong OpenEmbedded có nhiều nghĩa. BitBake task là bước thực hiện như `do_compile`, hoặc task là special recipe này. Cẩn thận thuật ngữ!

Listing 16-6 là task đơn giản từ snapshot gần đây, chỉ package cần cho generic Java support. Khi root file system được tập hợp sẽ chứa package trong task-java.bb.

LISTING 16-6 `task-java.bb`

```
DESCRIPTION = “Base task package for Java”
PR = “r2”
LICENSE = “MIT”

inherit task

RDEPENDS_${PN} = “\
    cacao \
    classpath-awt \
    java2-runtime \
    librxtx-java \
 “
```

Một số task phức tạp nhưng task này đơn giản, minh họa ý cơ bản. Có header field bắt buộc `DESCRIPTION`, `PR`, `LICENSE`. Keyword `inherit` minh họa metadata type tiếp—class, vai trò inheritance. Xem directive như `#include` C: chỉ variable, method trong `task.` `bbclass` đưa vào recipe lúc BitBake xử lý.

Variable `RDEPENDS_${PN}` Listing 16-6 là cú pháp runtime dependency. `PN` ra package name, cơ bản basename recipe filename—ở đây `task-java`. Khi recipe `task-java.bb` đưa vào image build, runtime dependency dưới RDEPENDS khiến package được build, đưa final image. Nếu làm theo, download snapshot có thể xem task trong image recipe `x11-gpe-java-image.bb`.

### 16.4.5 Metadata class

Class trong OpenEmbedded tương tự ngôn ngữ object-oriented như C++/Java, đóng gói chức năng chung chia sẻ nhiều recipe. Dùng cho nhiều function chung.

Đã thấy class trong recipe `task-java.bb` Listing 16-6. Task class ở file `task.bbclass` trong subdirectory của repository `openembedded` tên `classes`. Nó housekeeping chức năng mọi task cần, gồm directive báo recipe không tự sinh artifact cần packaging/đưa root file system cuối. Cũng gồm logic tạo phiên bản `-dbg`, `-dev` của package task kết hợp.

Class thường dùng hơn là `autotools.bbclass`, cung cấp autotools quen thuộc mà nhiều Linux package build quanh. Có lẽ quen package autotools-based. Nếu từng download source, unpack, compile trên desktop với `./configure`, `make`, `make install`, bạn đã build dự án autotools-based.

Class `autotools.bbclass` cung cấp chức năng này. Source package dùng autotools có thể recipe rất đơn giản dù package không.

Listing 16-7 hiển thị recipe autotools-based đơn giản, format chút cho dễ đọc không mất chức năng.

LISTING 16-7 Recipe Autotools-Based đơn giản: `rdesktop_1.5.0.bb`

```
DESCRIPTION = “Rdesktop rdp client for X”
HOMEPAGE = “http://www.rdesktop.org”
DEPENDS = “virtual/libx11 openssl”
SECTION = “x11/network”
LICENSE = “GPL”
PR = “r2”

inherit autotools

SRC_URI = “${SOURCEFORGE_MIRROR}/rdesktop/rdesktop-${PV}.tar.gz”

EXTRA_OECONF = “--with-openssl=${STAGING_EXECPREFIXDIR} “
```

Khó đơn giản hơn. Recipe chỉ dẫn build rdesktop, rdp client cho X. Header chuẩn có `DESCRIPTION`, `LICENSE`, `PR`, v.v. Tiếp là autotools từ `autotools.` `bbclass` qua keyword `inherit`. SRC\_URI báo BitBake nơi, cách lấy source.

Mục cuối minh họa tính năng chính dự án autotools-based. Nếu từng truyền command cho `./configure` khi build dự án autotools-based, sẽ quen. Variable `EXTRA_OECONF` chỉ truyền tới `./configure` rdesktop khi configure step. Ví dụ truyền flag `--with-openssl` cho script `./configure` rdesktop, cấu hình openssl và báo nơi support file cần compile tính năng.

Class trong OpenEmbedded dùng nhiều mục đích. Thấy mọi class hiện tại trong directory `.../openembedded/classes`.

### 16.4.6 Cấu hình OpenEmbedded

Khó nhất khi dùng OpenEmbedded là có cấu hình hoạt động. Cần định nghĩa nhiều thứ để build distribution. Những attribute rõ hơn phải định nghĩa:

- Target architecture

- Processor type

- Machine feature như serial port, baud rate, Flash organization

- C library chọn như glibc hoặc bản thay thế embedded-optimized

- Toolchain, binutils version và source (external hoặc BitBake build)

- Root file system image type

- Kernel version

Tất nhiên cấu hình còn nhiều hơn. Configuration metadata chia bốn nhóm: BitBake, machine, distribution, local. BitBake configuration (`bitbake.conf`) như hệ thống bên trong, định nghĩa variable system-wide như system path, target file system layout và nhiều build variable architecture-dependent. Trừ khi làm khác thường, không cần sửa file.

Machine configuration đặt trong file tên machine mô tả. Snapshot gần đây có file cho hơn 250 machine.[^5] Đây là chỗ định nghĩa feature machine-specific như serial port configuration, yêu cầu image format, kernel/bootloader version. Target architecture thường chỉ trong machine file.

Distribution configuration định nghĩa khía cạnh toàn distribution đang build. Bản hiện có file cho hơn 35 distribution đặt tên. Angstrom, OpenMoko là hai ví dụ nhận nhiều quan tâm.

Attribute distribution trong file gồm toolchain type, C library type, distribution version. Thường đặt minimum specification cho base root file system trong file này. Xem nhiều ví dụ metadata để biết thêm.

Nhóm cuối là `local.conf`, nơi tinh chỉnh, tùy chỉnh distribution. `local.conf` có thể đơn giản/phức tạp tùy nhu cầu. Tối thiểu `local.conf` định nghĩa machine type, distribution chọn, gắn cấu hình cho custom embedded Linux distribution. Metadata chứa mẫu `local.conf` nhiều comment làm điểm đầu tốt. Cũng có ví dụ `local.conf` online. Hướng dẫn OpenEmbedded cho BeagleBoard tại wiki http://elinux.org/BeagleBoard#OpenEmbedded.

### 16.4.7 Build image

Recipe mạnh nhất là image recipe. Có thể build toàn distribution bằng image recipe đúng. Metadata chứa gần trăm image recipe, dùng nguyên hoặc sửa theo yêu cầu.

Image recipe phổ biến hơn gồm `console-image`, `x11-image`. Đầu build bootable image cơ bản tới command prompt. Sau tạo image cho graphics display gồm library cần X11. Dễ build bằng BitBake:

```
$ bitbake console-image
```

Lệnh đơn giản build root file system chứa tập package đủ boot device tới prompt. Không gì ngăn thêm output khác. Ví dụ recipe sinh root file system, kernel image, bootloader image, file khác target board cần.

Có thể dành nguyên sách OpenEmbedded. Hy vọng giới thiệu ngắn giúp bắt đầu build system mạnh này. Không gì thay thế đi sâu, thực hành công nghệ.

## 16.5 Tổng kết

Có nhiều open source build system. Đã giới thiệu ba loại phổ biến nhất. OpenEmbedded là hệ mới nhất được dùng rộng và nhiều lập trình viên tham gia. Bất kỳ hệ nào cũng giúp thách thức lớn build custom embedded Linux cho sản phẩm:

- Scratchbox mô phỏng target architecture giúp dễ cross-compilation.

- Buildroot phổ biến trong nhiều dự án, có cộng đồng developer/user tốt.

- OpenEmbedded phát triển trên công nghệ tiên tiến, biểu diễn công nghệ mới nhất embedded Linux build system.

### 16.5.1 Gợi ý đọc thêm

Website, tài liệu Scratchbox www.scratchbox.org/

Trang chủ Buildroot www.buildroot.org

Trang chủ OpenEmbedded www.openembedded.org

[^1]: Phải là tên Linux home user account hiện tại.

[^2]: Nhiều lý do build kiểu này thất bại, sẽ mô tả sau.

[^3]: Một BitBake module tên “fetcher”.

[^4]: Nhớ “task” là loại metadata (recipe) đặc biệt thường gom package đưa root file system.

[^5]: “Machine” chỉ hardware platform cụ thể.
