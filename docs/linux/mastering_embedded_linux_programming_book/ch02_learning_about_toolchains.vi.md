# Chương 2: Tìm hiểu về toolchain (Learning about Toolchains)

Toolchain là thành phần đầu tiên của embedded Linux và là điểm khởi đầu của project. Bạn sẽ dùng nó để compile toàn bộ code sẽ chạy trên thiết bị của mình. Những lựa chọn bạn đưa ra ở giai đoạn sớm này sẽ có tác động sâu sắc đến kết quả cuối cùng.

Toolchain của bạn phải có khả năng sử dụng hiệu quả phần cứng bằng cách dùng tập lệnh tối ưu cho bộ xử lý. Nó phải hỗ trợ các ngôn ngữ bạn cần và có một bản hiện thực vững chắc của Portable Operating System Interface (POSIX) cùng các giao diện hệ thống khác.

Toolchain của bạn nên được giữ cố định trong suốt project. Nói cách khác, một khi đã chọn toolchain, điều quan trọng là phải gắn bó với nó. Thay đổi compiler và thư viện phát triển một cách không nhất quán trong một project sẽ dẫn đến các bug tinh vi. Dù vậy, vẫn tốt nhất là cập nhật toolchain khi phát hiện lỗ hổng bảo mật hoặc bug.

Việc lấy một toolchain có thể đơn giản như tải về và cài đặt một file TAR, hoặc phức tạp như build toàn bộ từ source code. Trong chương này, chúng ta dùng cách thứ nhất. Về sau, ở Chương 6, chúng ta sẽ chuyển sang dùng toolchain do build system tạo ra. Đó là cách thông thường hơn để có một toolchain.

Trong chương này, chúng ta sẽ đề cập các chủ đề sau:

- Giới thiệu toolchain

- Tìm một toolchain

- Cấu tạo của một toolchain

- Link với thư viện ‒ static linking và dynamic linking

- Nghệ thuật cross-compiling

## Yêu cầu kỹ thuật

Tôi khuyên dùng Ubuntu 24.04 hoặc một bản phát hành LTS mới hơn, vì tất cả các bài tập trong chương này đều được kiểm thử trên distro Linux đó tại thời điểm viết.

Sau đây là lệnh để cài đặt tất cả các package cần cho chương này trên Ubuntu 24.04 LTS:

```
$ sudo apt-get install autoconf automake bison bzip2 cmake flex g++ gawk
gcc gettext git gperf help2man libstdc++6 libtool libtool-bin make patch
texinfo unzip wget xz-utils
```

Code dùng trong chương này có trong thư mục của chương trong GitHub repository của cuốn sách: `https://github.com/PacktPublishing/Mastering-Embedded-Linux-Development/tree/main/Chapter02`.

## Giới thiệu toolchain

Toolchain là một tập công cụ compile source code thành các file thực thi có thể chạy trên thiết bị target của bạn. Nó bao gồm một compiler, một linker và các thư viện runtime. Bạn cần một toolchain để build ba thành phần còn lại của một hệ thống embedded Linux:

- Bootloader

- Kernel

- Root filesystem

Nó phải có khả năng compile code viết bằng C, C++ và hợp ngữ, vì đây là các ngôn ngữ được dùng trong các package open source nền tảng.

Thông thường, toolchain cho Linux dựa trên các thành phần từ project GNU, và điều đó vẫn đúng tại thời điểm viết. Tuy nhiên, trong vài năm qua, compiler Clang và project Low-Level Virtual Machine (LLVM) đi kèm đã tiến bộ đến mức LLVM giờ là một lựa chọn thay thế khả thi cho toolchain GNU. Một khác biệt lớn giữa toolchain LLVM và toolchain GNU-based là license; LLVM dùng Apache License v2.0 with LLVM Exceptions còn GNU dùng GPL.

Clang cũng có một số ưu điểm kỹ thuật, như compile nhanh hơn, chẩn đoán lỗi tốt hơn và hỗ trợ nhiều hơn cho các chuẩn C và C++ mới nhất. Nhưng GCC (GNU C Compiler) có ưu điểm là tương thích với code base hiện có và hỗ trợ nhiều kiến trúc và Operating System (OS) hơn. Dù đã mất vài năm để đạt được, Clang giờ có thể compile tất cả các thành phần cần cho embedded Linux và là một lựa chọn thay thế khả thi cho GCC. Để tìm hiểu thêm, hãy xem `https://docs.kernel.org/kbuild/llvm.html`.

Có một mô tả tốt về cách dùng Clang cho cross-compilation tại `https://clang.llvm.org/docs/CrossCompilation.html`. Nếu bạn muốn dùng nó như một phần của build system embedded Linux, nhiều người đang làm việc để dùng Clang với Buildroot và The Yocto Project. Tôi sẽ đề cập các build system nhúng trong Chương 6. Trong khi đó, chương này tập trung vào toolchain GNU vì nó vẫn là toolchain phổ biến và trưởng thành nhất cho Linux.

Một toolchain GNU chuẩn gồm ba thành phần chính:

- Binutils: Một tập tiện ích binary, bao gồm assembler và linker.

- GCC: Các compiler cho C và các ngôn ngữ khác, bao gồm C++, Objective-C, Objective-C++, Java, Fortran, Ada, Go và D. Tất cả đều dùng một backend chung tạo ra code assembler được đưa vào GNU assembler.

- Thư viện C: Một Application Program Interface (API) được chuẩn hóa dựa trên đặc tả POSIX, là giao diện chính tới kernel của OS dành cho các ứng dụng. Có nhiều thư viện C cần cân nhắc, như chúng ta sẽ thấy ở phần sau của chương này.

Cùng với những thứ này, bạn cũng sẽ cần một bản sao các Linux kernel header. Các kernel header chứa các định nghĩa và hằng số cần thiết khi truy cập kernel trực tiếp. Bạn cần các kernel header để compile thư viện C, các chương trình và thư viện. Code user space này tương tác gián tiếp với các thiết bị Linux, ví dụ, để hiển thị đồ họa qua driver Linux frame buffer. Điều này hoàn toàn trái ngược với các kernel module/driver bên trong kernel space có quyền truy cập trực tiếp vào phần cứng ngoại vi.

Đây không đơn giản là việc copy các file header trong thư mục include của source code kernel. Những header đó chỉ dành để dùng trong kernel và chứa các định nghĩa sẽ gây xung đột nếu được dùng ở trạng thái thô để compile các ứng dụng Linux thông thường. Thay vào đó, bạn sẽ cần tạo một tập kernel header đã được làm sạch, như tôi đã minh họa trong Chương 5.

Khi compile cho user space, các kernel header không cần được tạo từ đúng phiên bản Linux mà bạn sẽ chạy. Vì các giao diện kernel luôn tương thích ngược, chỉ cần các header đến từ một kernel giống hoặc cũ hơn kernel bạn đang dùng trên target.

Hầu hết mọi người coi GNU Debugger (GDB) cũng là một phần của toolchain, vì nó cũng thường được build vào thời điểm này. Khi build một cross compiler, bạn cũng cần build một cross debugger tương ứng để debug code trên target từ xa từ máy host. Tôi sẽ nói về GDB trong Chương 19.

Giờ chúng ta đã nói về kernel header và thấy các thành phần của một toolchain là gì, hãy xem các loại toolchain khác nhau.

### Các loại toolchain

Với mục đích của chúng ta, có hai loại toolchain:

- Native: Một toolchain chạy trên cùng loại hệ thống (hoặc thậm chí chính hệ thống đó) với các chương trình nó tạo ra. Đây thường là trường hợp của desktop và server, và nó đang trở nên phổ biến trên một số loại thiết bị nhúng. Ví dụ, Raspberry Pi 4 chạy Debian cho ARM có các native compiler self-hosted.

- Cross: Một toolchain chạy trên một loại hệ thống khác với target, cho phép việc phát triển được thực hiện trên một desktop PC nhanh rồi được nạp lên target nhúng để thực thi.

Gần như mọi việc phát triển embedded Linux đều được thực hiện bằng một toolchain cross-development. Một phần là vì hầu hết các thiết bị nhúng không thật phù hợp cho việc phát triển do thiếu sức mạnh tính toán, bộ nhớ và bộ lưu trữ, nhưng cũng vì nó giữ cho môi trường host và target tách biệt. Điểm sau đặc biệt quan trọng khi host và target dùng cùng một kiến trúc, ví dụ x86\_64. Trong trường hợp này, rất dễ bị cám dỗ compile native trên host rồi chỉ việc copy các binary sang target.

Cách này hoạt động được đến một mức nào đó. Tuy nhiên, nhiều khả năng bản phân phối trên host sẽ nhận cập nhật thường xuyên hơn target, hoặc các kỹ sư khác nhau build code cho target sẽ có các phiên bản thư viện phát triển trên host hơi khác nhau. Theo thời gian, hệ thống phát triển và hệ thống target sẽ khác biệt dần. Bạn có thể nâng cấp toolchain nếu bảo đảm môi trường build của host và target luôn đồng bộ với nhau. Tuy nhiên, một cách tốt hơn nhiều là giữ host và target tách biệt, và cross toolchain là cách để làm điều đó.

Có một lập luận ngược lại ủng hộ việc phát triển native. Cross-development tạo ra gánh nặng phải cross-compile tất cả các thư viện và công cụ mà bạn cần cho target. Chúng ta sẽ thấy ở phần sau, trong mục có tiêu đề Nghệ thuật cross-compiling, rằng cross-development không phải lúc nào cũng đơn giản vì nhiều package open source không được thiết kế để build theo cách này.

Các công cụ build tích hợp như Buildroot và The Yocto Project giúp ích bằng cách đóng gói các quy tắc cross-compiling cho nhiều package mà hầu hết các hệ thống nhúng cần. Nhưng nếu bạn muốn compile nhiều package bổ sung, thì tốt hơn là compile chúng native. Ví dụ, build một bản phân phối Debian cho Raspberry Pi 4 hoặc BeaglePlay bằng cross compiler là rất khó. Thay vào đó, chúng được compile native.

Tạo một môi trường build native từ đầu không dễ. Ban đầu bạn vẫn cần một cross compiler để tạo môi trường build native trên target, rồi sau đó dùng môi trường đó để build các package. Sau đó, để thực hiện native build trong thời gian hợp lý, bạn cần một build farm gồm các target board well-provisioned hoặc Quick Emulator (QEMU) để emulate target.

Trong chương này, chúng ta sẽ tập trung vào một môi trường cross-compiler pre-built tương đối dễ thiết lập và quản trị. Chúng ta sẽ bắt đầu bằng việc xem điều gì phân biệt một kiến trúc CPU target với một kiến trúc khác.

### Kiến trúc CPU

Toolchain phải được build theo khả năng của CPU target, bao gồm:

- Kiến trúc CPU: ARM, RISC-V, PowerPC, Microprocessor without Interlocked Pipelined Stages (MIPS) hoặc x86\_64.

- Hoạt động Big- hoặc little-endian: Một số CPU có thể hoạt động ở cả hai chế độ, nhưng mã máy khác nhau cho mỗi chế độ.

- Hỗ trợ dấu chấm động: Không phải mọi phiên bản bộ xử lý nhúng đều hiện thực một đơn vị dấu chấm động bằng phần cứng. Trong những trường hợp này, toolchain phải được cấu hình để gọi một thư viện dấu chấm động bằng phần mềm thay thế.

- Application Binary Interface (ABI): Quy ước gọi hàm được dùng để truyền tham số giữa các lời gọi hàm.

Với nhiều kiến trúc, ABI là cố định trên toàn họ bộ xử lý. Một ngoại lệ đáng chú ý là ARM. Kiến trúc ARM đã chuyển sang Extended Application Binary Interface (EABI) vào cuối những năm 2000, khiến ABI trước đó được gọi là Old Application Binary Interface (OABI). Mặc dù OABI giờ đã lỗi thời, bạn vẫn tiếp tục thấy các tham chiếu tới EABI. Kể từ đó, EABI đã tách thành ba dựa trên cách truyền tham số dấu chấm động: softfloat, softfp và hardfp.

EABI gốc dùng emulation bằng phần mềm (softfloat) hoặc các thanh ghi số nguyên general-purpose (softfp), trong khi Extended Application Binary Interface Hard-Float (EABIHF) mới hơn dùng các thanh ghi dấu chấm động (hardfp). Các chế độ softfloat và softfp của EABI gốc là ABI-compatible. Ở chế độ softfloat, compiler không tạo ra các lệnh Floating Point Unit (FPU). Mọi phép toán dấu chấm động đều được thực hiện bằng phần mềm, dẫn đến hiệu năng không tối ưu. Ở chế độ softfp, các giá trị float được truyền qua stack hoặc các thanh ghi số nguyên để có hiệu năng tốt hơn. EABIHF nhanh hơn đáng kể ở các phép toán dấu chấm động vì chế độ hardfp loại bỏ nhu cầu copy giữa các thanh ghi số nguyên và thanh ghi dấu chấm động.

Nhược điểm của EABIHF là chế độ hardfp không tương thích với các CPU không có đơn vị dấu chấm động. Khi đó, lựa chọn là giữa hai ABI không tương thích nhau. Bạn không thể trộn lẫn hai ABI này, vì vậy bạn phải quyết định ở giai đoạn này.

GNU thêm một tiền tố vào tên của mỗi công cụ trong toolchain để nhận diện các tổ hợp khác nhau có thể được tạo ra. Tiền tố này gồm một bộ (tuple) ba hoặc bốn thành phần phân cách bằng dấu gạch ngang, như được mô tả ở đây:

- CPU: Kiến trúc CPU như ARM, RISC-V, PowerPC, MIPS hoặc x86\_64. Nếu CPU có cả hai chế độ endian, chúng có thể được phân biệt bằng cách thêm `el` cho little-endian hoặc `eb` cho big-endian. Các ví dụ tiêu biểu là MIPS little-endian (`mipsel`) và ARM big-endian (`armeb`).

- Vendor: Nhận diện nhà cung cấp toolchain. Ví dụ bao gồm `buildroot`, `poky` và chỉ đơn giản là `unknown`. Đôi khi, thành phần này bị bỏ hẳn.

- OS: Với mục đích của chúng ta, nó luôn là `linux`.

- User space: Tên của thành phần user space, có thể là `gnu` hoặc `musl`. ABI cũng có thể được nối vào đây. Vì vậy, với các toolchain ARM, bạn có thể thấy `gnueabi`, `gnueabihf`, `musleabi` hoặc `musleabihf`.

Bạn có thể tìm tuple được dùng khi build toolchain bằng tùy chọn `-dumpmachine` của `gcc`. Ví dụ, bạn có thể thấy như sau trên máy host:

```
$ gcc -dumpmachine
x86_64-linux-gnu
```

Tuple này cho biết CPU là `x86_64`, kernel là `linux` và user space là `gnu`.

LƯU Ý QUAN TRỌNG

Khi một native compiler được cài đặt trên một máy, việc tạo các link tới mỗi công cụ trong toolchain không có tiền tố là bình thường, để bạn có thể gọi C compiler bằng lệnh `gcc`.

Sau đây là một ví dụ dùng cross compiler:

```
$ mipsel-unknown-linux-gnu-gcc -dumpmachine
mipsel-unknown-linux-gnu
```

Tuple này cho biết CPU là MIPS little-endian, vendor là `unknown`, kernel là `linux` và user space là `gnu`. Lựa chọn user space của bạn (`gnu` hoặc `musl`) quyết định chương trình của bạn được link với thư viện C nào (glibc hay musl).

### Chọn thư viện C

Giao diện lập trình tới OS Unix được định nghĩa bằng ngôn ngữ C theo các chuẩn POSIX. Thư viện C là bản hiện thực của giao diện đó. Nó là cổng vào kernel cho các chương trình Linux. Ngay cả khi bạn viết chương trình bằng ngôn ngữ khác như Go hay Python, các thư viện hỗ trợ runtime tương ứng rốt cuộc cũng sẽ phải gọi thư viện C, như được thể hiện ở đây:

![Figure 2.1](images/ch02/fig02-01.png)

Hình 2.1 – Thư viện C

Bất cứ khi nào thư viện C cần các dịch vụ của kernel, nó sẽ dùng giao diện system call của kernel để chuyển giữa user space và kernel space. Có thể bỏ qua thư viện C bằng cách gọi trực tiếp các system call của kernel, nhưng điều đó rất phiền phức và hầu như không bao giờ cần thiết.

Có nhiều thư viện C để lựa chọn. Các lựa chọn chính như sau:

- glibc: Đây là thư viện GNU C chuẩn, có tại `https://gnu.org/software/libc/`. Nó lớn và, cho đến gần đây, không cấu hình được nhiều, nhưng nó là bản hiện thực đầy đủ nhất của POSIX API. License là LGPL 2.1.

- musl libc: Thư viện này tương đối mới nhưng đã được chú ý nhiều như một lựa chọn thay thế nhỏ gọn và standards-compliant cho glibc. Nó là một lựa chọn tốt cho các hệ thống có lượng RAM và bộ lưu trữ hạn chế. Nó có license MIT và có tại `https://musl.libc.org`.

- uClibc-ng: u thực ra là chữ cái Hy Lạp mu, cho biết đây là thư viện C cho vi điều khiển. uClibc-ng có tại `https://uclibc-ng.org`. Ban đầu nó được phát triển để làm việc với uClinux (Linux cho các vi điều khiển không có memory management unit) nhưng sau đó đã được điều chỉnh để dùng với Linux đầy đủ. Thư viện uClibc-ng là một fork của project uClibc gốc, vốn đã bị bỏ bê. Cả hai đều được cấp phép theo LGPL 2.1.

Vậy, nên chọn cái nào? Lời khuyên của tôi là chỉ dùng uClibc-ng nếu bạn đang dùng uClinux. Nếu bạn có lượng bộ lưu trữ hoặc RAM rất hạn chế, thì musl libc là một lựa chọn tốt. Nếu không, hãy dùng glibc, như được thể hiện trong lưu đồ này:

![Figure 2.2](images/ch02/fig02-02.png)

Hình 2.2 – Chọn một thư viện C

Lựa chọn thư viện C của bạn có thể giới hạn lựa chọn toolchain, vì không phải mọi toolchain pre-built đều hỗ trợ mọi thư viện C. Khi đã biết mình cần gì ở một toolchain, bạn tìm nó ở đâu?

## Tìm một toolchain

Bạn có ba lựa chọn cho toolchain cross-development: bạn có thể tìm một toolchain ready-built phù hợp với nhu cầu, bạn có thể dùng toolchain do một công cụ build nhúng tạo ra (được đề cập trong Chương 6), hoặc bạn có thể tự tạo một toolchain.

Một cross toolchain pre-built là một lựa chọn hấp dẫn ở chỗ bạn chỉ cần tải về và cài đặt nó. Nhưng bạn bị giới hạn ở cấu hình của toolchain cụ thể đó, và bạn phụ thuộc vào người hoặc tổ chức mà bạn lấy nó. Nhiều khả năng, đó sẽ là một trong những nguồn sau:

- Một nhà cung cấp SoC hoặc board. Hầu hết các nhà cung cấp đều cung cấp một toolchain Linux.

- Một liên minh chuyên cung cấp hỗ trợ system-level cho một kiến trúc nhất định. Ví dụ, Linaro (`https://www.linaro.org`) có các toolchain pre-built cho kiến trúc ARM.

- Một nhà cung cấp công cụ Linux third-party như Siemens, Timesys hoặc Wind River.

- Các package cross-tool cho bản phân phối Linux trên desktop của bạn. Ví dụ, các bản phân phối Debian-based có các package cho cross-compiling cho các target ARM, PowerPC và MIPS.

- Một binary SDK do một trong các công cụ build nhúng tích hợp tạo ra. The Yocto Project có một số SDK để tải về tại `https://downloads.yoctoproject.org/releases/yocto/yocto-<version>/toolchain/`. (thay `<version>` bằng một phiên bản Yocto Project hợp lệ như `5.0` trong URL trên).

- Một link từ một diễn đàn mà bạn không thể tìm lại được nữa.

LƯU Ý QUAN TRỌNG

Trong tất cả các trường hợp này, bạn phải quyết định toolchain pre-built được cung cấp có đáp ứng yêu cầu của bạn hay không. Nó có dùng thư viện C mà bạn muốn không? Nhà cung cấp có cung cấp cho bạn các bản cập nhật sửa lỗi bảo mật và bug không? Hãy nhớ những nhận xét của tôi về hỗ trợ và cập nhật trong Chương 1. Nếu câu trả lời của bạn cho bất kỳ câu hỏi nào là không, thì bạn nên cân nhắc tự tạo toolchain.

Thật không may, build một toolchain không phải là việc dễ. Nếu bạn thực sự muốn tự làm toàn bộ, hãy xem Cross Linux From Scratch (`https://trac.clfs.org`). Ở đó, bạn sẽ tìm thấy hướng dẫn step-by-step về cách tạo từng thành phần.

Một lựa chọn đơn giản hơn là dùng crosstool-NG, công cụ đóng gói quy trình này thành một tập script và có một frontend menu-driven. Tuy vậy, bạn vẫn cần một mức kiến thức kha khá chỉ để đưa ra các lựa chọn đúng.

Còn đơn giản hơn nữa là dùng một build system như Buildroot hoặc The Yocto Project, vì chúng tạo ra một toolchain như một phần của quá trình build. Đây là giải pháp tôi ưa thích, như chúng ta sẽ thấy trong Chương 6.

Bạn sẽ cần một cross toolchain hoạt động được để hoàn thành các bài tập trong phần tiếp theo. Chúng ta sẽ dùng một toolchain pre-built từ Bootlin. Các toolchain của Bootlin được build bằng Buildroot.

Để tải về cross toolchain pre-built cần cho Chương 2 đến 5:

```
$ wget https://toolchains.bootlin.com/downloads/releases/toolchains/
aarch64/tarballs/aarch64--glibc--stable-2024.02-1.tar.bz2
```

Để tải về phiên bản mới nhất của toolchain này, hãy truy cập `https://toolchains.bootlin.com`. Chọn aarch64 cho architecture và glibc cho libc. Khi đã đưa ra các lựa chọn này, hãy tải về phiên bản stable của toolchain.

Cài đặt toolchain pre-built lên máy host Linux của bạn bằng cách giải nén nó vào thư mục home:

```
$ bzip2 -d aarch64--glibc--stable-2024.02-1.tar.bz2
$ tar -xvf aarch64--glibc--stable-2024.02-1.tar
<…>
```

Bạn sẽ dùng toolchain này cho phần còn lại của chương. Hãy bắt đầu bằng việc xem bên trong nó.

## Cấu tạo của một toolchain

Để hình dung một toolchain điển hình chứa những gì, hãy xem xét toolchain bạn đã tải về từ Bootlin. Các ví dụ dùng toolchain aarch64, có tiền tố `aarch64-buildroot-linux-gnu`.

Toolchain aarch64 nằm trong thư mục `~/aarch64--glibc--stable-2024.02-1/bin`. Trong đó, bạn sẽ tìm thấy cross compiler `aarch64-buildroot-linux-gnu-gcc`. Để dùng nó, bạn cần thêm thư mục này vào path bằng lệnh sau:

```
$ PATH=~/aarch64--glibc--stable-2024.02-1/bin:$PATH
```

Nếu bạn đã tải về một phiên bản khác, hãy bảo đảm thay `2024.02-1` bằng phiên bản thực tế của toolchain stable.

Giờ bạn có thể lấy một chương trình `helloworld` đơn giản, trong ngôn ngữ C trông như sau:

```
#include <stdio.h>
#include <stdlib.h>

int main (int argc, char *argv[])
{
    printf ("Hello, World!\n");
    return 0;
}
```

Và compile nó như sau:

```
$ aarch64-buildroot-linux-gnu-gcc helloworld.c -o helloworld
```

Xác nhận rằng nó đã được cross-compiled bằng cách dùng lệnh `file` để in ra loại của file:

```
$ file helloworld
helloworld: ELF 64-bit LSB pie executable, ARM aarch64, version 1 (SYSV),
dynamically linked, interpreter /lib/ld-linux-aarch64.so.1, for GNU/Linux
3.7.0,  not stripped
```

Giờ bạn đã xác nhận cross compiler hoạt động, hãy xem xét kỹ hơn.

### Tìm hiểu về cross compiler của bạn

Hãy tưởng tượng bạn vừa nhận được một toolchain và muốn biết thêm về cách nó được cấu hình. Bạn có thể biết được rất nhiều bằng cách truy vấn `gcc`. Ví dụ, để biết phiên bản, bạn dùng `--version`:

```
$ aarch64-buildroot-linux-gnu-gcc --version
aarch64-buildroot-linux-gnu-gcc.br_real (Buildroot 2021.11-11272-ge2962af)
12.3.0
Copyright (C) 2022 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR
PURPOSE.
```

Để biết nó được cấu hình như thế nào, hãy dùng `-v`:

```
$ aarch64-buildroot-linux-gnu-gcc -v
Using built-in specs.
COLLECT_GCC=/home/frank/aarch64--glibc--stable-2024.02-1/bin/aarch64-
buildroot-linux-gnu-gcc.br_real
COLLECT_LTO_WRAPPER=/home/frank/aarch64--glibc--stable-2024.02-1/bin/../
libexec/gcc/aarch64-buildroot-linux-gnu/12.3.0/lto-wrapper
Target: aarch64-buildroot-linux-gnu
Configured with: ./configure --prefix=/builds/buildroot.org/toolchains-
builder/build/aarch64--glibc--stable-2024.02-1 --sysconfdir=/builds/
buildroot.org/toolchains-builder/build/aarch64--glibc--stable-2024.02-1/
etc --enable-static --target=aarch64-buildroot-linux-gnu --with-
sysroot=/builds/buildroot.org/toolchains-builder/build/aarch64--glibc--
stable-2024.02-1/aarch64-buildroot-linux-gnu/sysroot --enable-__cxa_atexit
--with-gnu-ld --disable-libssp --disable-multilib --disable-decimal-float
--enable-plugins --enable-lto --with-gmp=/builds/buildroot.org/toolchains-
builder/build/aarch64--glibc--stable-2024.02-1 --with-mpc=/builds/
buildroot.org/toolchains-builder/build/aarch64--glibc--stable-2024.02-1
--with-mpfr=/builds/buildroot.org/toolchains-builder/build/aarch64--glibc-
-stable-2024.02-1 --with-pkgversion='Buildroot 2021.11-11272-ge2962af'
--with-bugurl=http://bugs.buildroot.net/ --without-zstd --disable-
libquadmath --disable-libquadmath-support --enable-tls --enable-threads
--without-isl --without-cloog --with-abi=lp64 --with-cpu=cortex-a53
--enable-languages=c,c++,fortran --with-build-time-tools=/builds/
buildroot.org/toolchains-builder/build/aarch64--glibc--stable-2024.02-1/
aarch64-buildroot-linux-gnu/bin --enable-shared --enable-libgomp
Thread model: posix
Supported LTO compression algorithms: zlib
gcc version 12.3.0 (Buildroot 2021.11-11272-ge2962af)
<…>
```

Có rất nhiều output ở đó, nhưng những điều thú vị cần chú ý là:

- `--with-sysroot`=`/builds/buildroot.org/toolchains-builder/build/aarch64--glibc--stable-2024.02-1/aarch64-buildroot-linux-gnu/sysroot`: Vị trí của thư mục `sysroot` lúc build. Xem phần tiếp theo để biết giải thích.

- `--enable-languages=c,c++,fortran`: Cả ngôn ngữ C và C++ đều được bật.

- `--with-cpu=cortex-a53`: Tạo code cho một lõi ARM Cortex-A53.

- `--enable-threads`: Bật POSIX thread.

Đây là các thiết lập mặc định cho compiler. Bạn có thể ghi đè hầu hết chúng trên command line của `gcc`. Ví dụ, nếu muốn compile cho một CPU khác, bạn có thể ghi đè thiết lập đã cấu hình `--with-cpu` bằng cách thêm `-mcpu=cortex-a72` vào command line, như sau:

```
$ aarch64-buildroot-linux-gnu-gcc -mcpu=cortex-a72 helloworld.c -o
helloworld
```

Bạn có thể in ra các tùy chọn architecture-specific có sẵn bằng `--target-help`, như sau:

```
$ aarch64-buildroot-linux-gnu-gcc --target-help
```

Có thể bạn đang tự hỏi liệu việc cấu hình chính xác ngay lúc này có quan trọng không, vì bạn luôn có thể thay đổi nó. Câu trả lời phụ thuộc vào cách bạn dự định dùng nó. Nếu bạn định tạo một toolchain mới cho mỗi target, thì việc thiết lập mọi thứ ngay từ đầu là hợp lý, vì nó sẽ giảm rủi ro làm sai về sau.

Tôi gọi đây là triết lý Buildroot, mà chúng ta sẽ xem lại trong Chương 6. Mặt khác, nếu bạn muốn build một toolchain tổng quát, và bạn sẵn sàng cung cấp các thiết lập đúng khi build cho một target cụ thể, thì bạn nên làm cho toolchain cơ sở là tổng quát, đó cũng là cách The Yocto Project xử lý mọi thứ.

Giờ chúng ta đã thấy vị trí của thư mục `sysroot` lúc build, hãy xem bên trong thư mục `sysroot` mặc định được cài đặt trên máy host của bạn.

### sysroot, thư viện và các file header

Thư mục `sysroot` của toolchain chứa các thư mục con cho thư viện, file header và các file cấu hình khác. Nó có thể được đặt khi cấu hình toolchain thông qua `--with-sysroot=`, hoặc có thể được đặt trên command line bằng `--sysroot=`. Bạn có thể xem vị trí của `sysroot` mặc định bằng `-print-sysroot`:

```
$ aarch64-buildroot-linux-gnu-gcc -print-sysroot
/home/frank/aarch64--glibc--stable-2024.02-1/aarch64-buildroot-linux-gnu/
sysroot
```

Bạn sẽ thấy các thư mục con sau trong `sysroot`:

- `lib`: Chứa các shared object của thư viện C và dynamic linker/loader `ld-linux`

- `usr/lib`: Chứa các file archive thư viện tĩnh của thư viện C và mọi thư viện khác có thể được cài đặt sau đó

- `usr/include`: Chứa các header của tất cả các thư viện

- `usr/bin`: Chứa các chương trình tiện ích chạy trên target, như lệnh `ldd`

- `usr/share`: Dùng cho bản địa hóa và quốc tế hóa

- `sbin`: Cung cấp tiện ích `ldconfig` được dùng để tối ưu các đường dẫn nạp thư viện

Một số trong đó cần trên host phát triển để compile chương trình, còn một số khác, như các shared library và `ld-linux`, cần trên target lúc runtime.

### Các công cụ khác trong toolchain

Dưới đây là danh sách các lệnh để gọi các thành phần khác nhau của một toolchain GNU. Giống như `aarch64-buildroot-linux-gnu-gcc`, tất cả các công cụ này đều nằm trong thư mục `~/aarch64--glibc--stable-2024.02-1/bin/` mà bạn đã thêm vào `PATH`. Sau đây là mô tả ngắn gọn về các công cụ này:

- `addr2line`: Chuyển đổi địa chỉ chương trình thành tên file source code và số dòng bằng cách đọc các bảng debug symbol trong một file thực thi. Nó rất hữu ích khi giải mã các địa chỉ được in ra trong một báo cáo crash hệ thống.

- `ar`: Một tiện ích archive dùng để tạo thư viện tĩnh.

- `as`: GNU assembler.

- `c++filt`: Demangle các symbol C++ và Java.

- `cpp`: C preprocessor dùng để mở rộng `#define`, `#include` và các directive tương tự khác. Bạn hiếm khi cần dùng riêng công cụ này.

- `elfedit`: Cập nhật ELF header của các file ELF.

- `g++`: Frontend GNU C++, giả định rằng các file source chứa code C++.

- `gcc`: Frontend GNU C, giả định rằng các file source chứa code C.

- `gcov`: Công cụ đo độ bao phủ code.

- `gdb`: GNU debugger.

- `gprof`: Công cụ profiling chương trình.

- `ld`: GNU linker.

- `nm`: Liệt kê các symbol từ object file.

- `objcopy`: Copy và chuyển đổi object file.

- `objdump`: Hiển thị thông tin từ object file.

- `ranlib`: Tạo hoặc sửa đổi một index trong thư viện tĩnh, giúp giai đoạn link nhanh hơn.

- `readelf`: Hiển thị thông tin về các file ở định dạng object ELF.

- `size`: Liệt kê kích thước các section và tổng kích thước.

- `strings`: Hiển thị các chuỗi ký tự in được trong file.

- `strip`: Loại bỏ các bảng debug symbol khỏi một object file, khiến nó nhỏ hơn. Thông thường, bạn sẽ strip toàn bộ code thực thi được đưa lên target.

Giờ chúng ta sẽ chuyển từ các công cụ command-line quay lại chủ đề thư viện C.

### Xem xét các thành phần của thư viện C

Thư viện C không phải là một file thư viện duy nhất. Nó gồm bốn phần chính cùng nhau hiện thực POSIX API:

- `libc`: Thư viện C chính chứa các hàm POSIX well-known như `printf`, `open`, `close`, `read`, `write`, v.v.

- `libm`: Chứa các hàm toán học như `cos`, `exp` và `log`

- `libpthread`: Chứa tất cả các hàm POSIX thread có tên bắt đầu bằng `pthread_`

- `librt`: Có các phần mở rộng real-time cho POSIX, bao gồm shared memory và I/O bất đồng bộ

Thư viện đầu tiên, `libc`, luôn được link vào, nhưng các thư viện khác phải được link tường minh bằng tùy chọn `-l`. Tham số cho `-l` là tên thư viện đã bỏ phần `lib`. Ví dụ, một chương trình tính hàm sin bằng cách gọi `sin()` sẽ được link với `libm` bằng `-lm`:

```
$ aarch64-buildroot-linux-gnu-gcc myprog.c -o myprog -lm
```

Bạn có thể kiểm tra những thư viện nào đã được link trong chương trình này hoặc bất kỳ chương trình nào khác bằng lệnh `readelf`:

```
$ aarch64-buildroot-linux-gnu-readelf -a myprog | grep "Shared library"
0x0000000000000001 (NEEDED)             Shared library: [libm.so.6]
0x0000000000000001 (NEEDED)             Shared library: [libc.so.6]
```

Shared library cần một runtime linker, mà bạn có thể thấy bằng:

```
$ aarch64-buildroot-linux-gnu-readelf -a myprog | grep "program
interpreter"
      [Requesting program interpreter: /lib/ld-linux-aarch64.so.1]
```

Điều này hữu ích đến mức tôi có một file script tên là `list-libs`, bạn sẽ tìm thấy nó trong kho code của cuốn sách tại `MELD/list-libs`. Nó chứa các lệnh sau:

```
${CROSS_COMPILE}readelf -a $1 | grep "program interpreter"
${CROSS_COMPILE}readelf -a $1 | grep "Shared library"
```

Có những file thư viện khác mà chúng ta có thể link tới ngoài bốn thành phần của thư viện C. Chúng ta sẽ xem cách làm điều đó trong phần tiếp theo.

## Link với thư viện – static linking và dynamic linking

Mọi ứng dụng bạn viết cho Linux, dù bằng C hay C++, đều sẽ được link với thư viện C `libc`. Điều này cơ bản đến mức bạn thậm chí không cần bảo `gcc` hay `g++` làm vậy, vì nó luôn link `libc`. Các thư viện khác mà bạn có thể muốn link phải được nêu tên tường minh thông qua tùy chọn `-l`.

Code thư viện có thể được link theo hai cách khác nhau:

- Tĩnh (Statically): Nghĩa là tất cả các hàm thư viện mà ứng dụng của bạn gọi cùng các dependency của chúng được lấy từ library archive và gắn vào file thực thi của bạn.

- Động (Dynamically): Nghĩa là các tham chiếu tới file thư viện và các hàm trong những file đó được tạo ra trong code, nhưng việc link thực sự được thực hiện động lúc nạp.

Bạn sẽ tìm thấy code cho các ví dụ sau trong kho code của cuốn sách tại `MELD/Chapter02/library`.

### Thư viện tĩnh

Static linking hữu ích trong một vài trường hợp. Ví dụ, nếu bạn đang build một hệ thống nhỏ chỉ gồm BusyBox và một số file script, thì link BusyBox tĩnh sẽ đơn giản hơn và tránh phải copy các file thư viện runtime và linker. Footprint cũng sẽ nhỏ hơn vì bạn chỉ link phần code mà ứng dụng dùng thay vì cung cấp toàn bộ thư viện C. Static linking cũng hữu ích nếu bạn cần chạy một chương trình trước khi filesystem chứa các thư viện runtime sẵn sàng.

Bạn có thể link tất cả các thư viện tĩnh bằng cách thêm `-static` vào command line:

```
$ aarch64-buildroot-linux-gnu-gcc -static helloworld.c -o helloworld-
static
```

Bạn sẽ thấy kích thước của binary tăng lên đáng kể:

```
$ ls -l helloworld*
-rwxrwxr-x 1 frank frank   8928 Apr 28 23:34 helloworld
-rw-rw-r-- 1 frank frank    123 Apr 28 23:30 helloworld.c
-rwxrwxr-x 1 frank frank 718472 Apr 28 23:33 helloworld-static
```

Static linking lấy code từ một library archive thường có tên lib\<name\>.a. Trong trường hợp trên, đó là libc.a, nằm trong \<sysroot\>/usr/lib:

```
$ export SYSROOT=$(aarch64-buildroot-linux-gnu-gcc -print-sysroot)
$ cd $SYSROOT
$  ls -l usr/lib/libc.a
-rw-r--r-- 1 frank frank 5551484 Mar  3  2024 usr/lib/libc.a
```

Lưu ý rằng cú pháp `export SYSROOT=$(aarch64-buildroot-linux-gnu-gcc -print-sysroot)` đặt đường dẫn tới `sysroot` vào biến shell `SYSROOT`, giúp ví dụ rõ ràng hơn một chút.

Tạo một thư viện tĩnh đơn giản như tạo một archive gồm các object file bằng lệnh `ar`. Nếu tôi có hai file source tên là `test1.c` và `test2.c` (bài tập này không có ví dụ Git – bạn được kỳ vọng tự tạo các file `test1.c` và `test2.c`) và tôi muốn tạo một thư viện tĩnh tên là `libtest.a`, thì tôi sẽ làm như sau:

```
$ aarch64-buildroot-linux-gnu-gcc -c test1.c
$ aarch64-buildroot-linux-gnu-gcc -c test2.c
$ aarch64-buildroot-linux-gnu-ar rc libtest.a test1.o test2.o
$ ls -l
total 24
-rw-rw-r--  1 frank frank 2392 Nov  9 09:28 libtest.a
-rw-rw-r--  1 frank frank  116 Nov  9 09:26 test1.c
-rw-rw-r--  1 frank frank 1080 Nov  9 09:27 test1.o
-rw-rw-r--  1 frank frank  121 Nov  9 09:26 test2.c
-rw-rw-r--  1 frank frank 1088 Nov  9 09:27 test2.o
```

Git repository của cuốn sách chứa source và makefile để hỗ trợ các bài tập link sau đây:

```
$ cd MELD/Chapter02/library
$ tree
.
├── hello-arm
│   ├── hello-arm.c
│   └── Makefile
├── inc
│   └── testlib.h
├── shared
│   ├── Makefile
│   └── testlib.c
└── static
    ├── Makefile
    └── testlib.c
```

Compile thư viện tĩnh `libtest.a`:

```
$ cd static
$ CC=aarch64-buildroot-linux-gnu-gcc make
aarch64-buildroot-linux-gnu-gcc -Wall -g -I../inc -c testlib.c
ar rc libtest.a testlib.o
```

Compile `hello-arm.c` và link nó với `libtest.a` để tạo ra một file thực thi hello-arm-static:

```
$ cd ../hello-arm
$ CC=aarch64-buildroot-linux-gnu-gcc make hello-arm-static
aarch64-buildroot-linux-gnu-gcc -c -Wall -I../inc -o hello-arm.o hello-
arm.c
aarch64-buildroot-linux-gnu-gcc -o hello-arm-static hello-arm.o -L../
static -ltest
```

Giờ hãy build lại cùng chương trình đó bằng dynamic linking.

### Shared library

Một cách phổ biến hơn để triển khai thư viện là dưới dạng các shared object được link lúc runtime, giúp sử dụng bộ lưu trữ và bộ nhớ hệ thống hiệu quả hơn vì chỉ cần nạp một bản sao của code. Nó cũng giúp dễ dàng cập nhật các file thư viện mà không phải link lại tất cả các chương trình dùng chúng.

Object code của một shared library phải là position independent để runtime linker có thể tự do đặt nó trong bộ nhớ tại địa chỉ trống tiếp theo. Để làm điều này, hãy thêm tham số `-fPIC` vào `gcc` rồi link nó bằng tùy chọn `-shared`:

```
$ aarch64-buildroot-linux-gnu-gcc -fPIC -c test1.c
$ aarch64-buildroot-linux-gnu-gcc -fPIC -c test2.c
$ aarch64-buildroot-linux-gnu-gcc -shared -o libtest.so test1.o test2.o
```

Lệnh này tạo ra shared library `libtest.so`. Để link một ứng dụng với thư viện này, bạn thêm `-ltest` giống như với trường hợp tĩnh, nhưng lần này code không được đưa vào file thực thi. Thay vào đó, có một tham chiếu tới thư viện mà runtime linker sẽ phải phân giải.

Compile shared library `libtest.so`:

```
$ cd MELD/Chapter02/library
$ cd shared
$ CC=aarch64-buildroot-linux-gnu-gcc make
aarch64-buildroot-linux-gnu-gcc -Wall -g -fPIC -I../inc -c testlib.c
aarch64-buildroot-linux-gnu-gcc -shared -o libtest.so testlib.o
```

Compile `hello-arm.c` và link nó với `libtest.so` để tạo ra một file thực thi `hello-arm-shared`:

```
$ cd ../hello-arm
$ CC=aarch64-buildroot-linux-gnu-gcc make hello-arm-shared
aarch64-buildroot-linux-gnu-gcc -c -Wall -I../inc -o hello-arm.o hello-
arm.c
aarch64-buildroot-linux-gnu-gcc -o hello-arm-shared hello-arm.o -L../
shared -ltest
$ ~/MELD/list-libs hello-arm-shared
      [Requesting program interpreter: /lib/ld-linux-aarch64.so.1]
 0x0000000000000001 (NEEDED)             Shared library: [libtest.so]
 0x0000000000000001 (NEEDED)             Shared library: [libc.so.6]
```

Runtime linker của chương trình này là `/lib/ld-linux-aarch64.so.1`, file này phải có trong filesystem của target. Linker sẽ tìm `libtest.so` trong đường dẫn tìm kiếm mặc định: `/lib` và `/usr/lib`. Nếu bạn muốn nó tìm thư viện ở cả các thư mục khác, bạn có thể đặt một danh sách đường dẫn colon-separated vào biến shell `LD_LIBRARY_PATH`:

```
$ export LD_LIBRARY_PATH=/opt/lib:/opt/usr/lib
```

Vì shared library tách biệt với file thực thi, bạn cần bảo đảm các phiên bản đúng của shared library được cài đặt trên target để không gặp lỗi lúc runtime.

#### Tìm hiểu số phiên bản của shared library

Một trong những lợi ích của shared library là chúng có thể được cập nhật độc lập với các chương trình dùng chúng. Các bản cập nhật thư viện có hai loại:

- Loại sửa bug hoặc thêm hàm mới theo cách backward-compatible

- Loại phá vỡ khả năng tương thích với các ứng dụng hiện có

GNU/Linux có một lược đồ đánh phiên bản để xử lý cả hai trường hợp này.

Mỗi thư viện có một release version và một interface number. Release version đơn giản là một chuỗi được nối vào tên thư viện. Ví dụ, thư viện ảnh JPEG `libjpeg` hiện đang ở bản phát hành 8.2.2, vì vậy thư viện có tên là `libjpeg.so.8.2.2`. Có một symbolic link tên là `libjpeg.so` trỏ tới `libjpeg.so.8.2.2`, để khi bạn compile một chương trình với `-ljpeg`, bạn link với phiên bản hiện tại. Nếu bạn cài đặt phiên bản 8.2.3, link được cập nhật và bạn sẽ link với phiên bản đó.

Giờ giả sử phiên bản 9.0.0 xuất hiện và phá vỡ khả năng tương thích ngược. Link từ `libjpeg.so` giờ trỏ tới `libjpeg.so.9.0.0` để mọi chương trình mới được link với phiên bản mới. Khi giao diện của `libjpeg` thay đổi, kết quả là các lỗi compile mà developer có thể sửa.

Mọi chương trình trên target không được compile lại sẽ thất bại theo cách nào đó, vì chúng vẫn dùng giao diện cũ. Đây là lúc một đối tượng gọi là soname phát huy tác dụng. Soname mã hóa interface number tại thời điểm thư viện được build và được runtime linker dùng khi nạp thư viện. Nó có định dạng `<library name>.so.<interface number>`. Với `libjpeg.so.8.2.2`, soname là `libjpeg.so.8` vì interface number khi shared library `libjpeg` đó được build là 8:

```
$ readelf -a /usr/lib/x86_64-linux-gnu/libjpeg.so.8.2.2 | grep SONAME
0x000000000000000e (SONAME)    Library soname: [libjpeg.so.8]
```

Mọi chương trình được compile với nó sẽ yêu cầu `libjpeg.so.8` lúc runtime, đây sẽ là một symbolic link trên target trỏ tới `libjpeg.so.8.2.2`. Khi phiên bản 9.0.0 của `libjpeg` được cài đặt, nó sẽ có soname là `libjpeg.so.9`, vì vậy có thể có hai phiên bản không tương thích của cùng một thư viện được cài đặt trên cùng một hệ thống. Các chương trình được link với `libjpeg.so.8.*.*` sẽ nạp `libjpeg.so.8`, còn các chương trình được link với `libjpeg.so.9.*.*` sẽ nạp `libjpeg.so.9`.

Đó là lý do khi xem danh sách thư mục của `/usr/lib/x86_64-linux-gnu/libjpeg*`, bạn thấy bốn file này:

- `libjpeg.a`: Library archive dùng cho static linking

- `libjpeg.so -> libjpeg.so.8.2.2`: Một symbolic link dùng cho dynamic linking

- `libjpeg.so.8 -> libjpeg.so.8.2.2`: Một symbolic link dùng khi nạp thư viện lúc runtime

- `libjpeg.so.8.2.2`: Shared library thực sự, được dùng cả lúc compile lẫn lúc runtime

Hai file đầu chỉ cần trên máy host để build, còn hai file sau cần trên target lúc runtime.

Mặc dù bạn có thể gọi trực tiếp các công cụ cross-compilation GNU khác nhau từ command line, kỹ thuật này không mở rộng được quá các ví dụ đồ chơi như `helloworld`. Để thực sự hiệu quả trong việc cross-compiling, chúng ta cần kết hợp một cross toolchain với một build system.

## Nghệ thuật cross-compiling

Có một cross toolchain hoạt động được là điểm khởi đầu của một hành trình chứ không phải điểm kết thúc. Đến một lúc nào đó, bạn sẽ muốn bắt đầu cross-compiling các công cụ, ứng dụng và thư viện khác nhau mà bạn cần cho target. Nhiều trong số đó sẽ là các package open source, mỗi package có cách compile riêng và những đặc thù riêng.

Một số build system phổ biến bao gồm:

- Makefile thuần, trong đó toolchain thường được điều khiển bằng biến `CROSS_COMPILE` của `make`

- Build system GNU Autotools

- CMake

Cả Autotools và makefile đều cần để build ngay cả một hệ thống embedded Linux cơ bản. CMake là cross-platform và được dùng ngày càng nhiều qua các năm, đặc biệt là trong cộng đồng C++. Trong phần này, chúng ta sẽ đề cập cả ba công cụ build.

### Makefile đơn giản

Một số package quan trọng rất dễ cross-compile, bao gồm Linux kernel, bootloader U-Boot và BusyBox. Với mỗi package này, bạn chỉ cần đặt tiền tố toolchain vào biến make `CROSS_COMPILE`, ví dụ, `aarch64-buildroot-linux-gnu-`. Lưu ý dấu gạch nối ở cuối.

Để compile BusyBox, bạn gõ:

```
$ make CROSS_COMPILE=aarch64-buildroot-linux-gnu-
```

Hoặc bạn có thể đặt nó thành một biến shell:

```
$ export CROSS_COMPILE=aarch64-buildroot-linux-gnu-
$ make
```

Trong trường hợp U-Boot và Linux, bạn cũng cần đặt biến `make` `ARCH` thành một trong các kiến trúc machine mà chúng hỗ trợ, điều tôi sẽ đề cập trong Chương 3 và 4.

Cả Autotools và CMake đều có thể tạo makefile. Autotools chỉ tạo makefile, trong khi CMake hỗ trợ các cách khác để build project tùy theo nền tảng mà bạn nhắm tới (trong trường hợp của chúng ta thì chỉ là Linux). Hãy xem cross-compiling với Autotools trước.

### Autotools

Tên Autotools chỉ một nhóm công cụ được dùng làm build system trong nhiều project open source. Các thành phần, cùng với các trang project tương ứng, là:

- GNU autoconf (`https://www.gnu.org/software/autoconf/` )

- GNU automake (https://www.gnu.org/software/automake/)

- GNU libtool (`https://www.gnu.org/software/libtool/)`

- gnulib (`https://www.gnu.org/software/gnulib/)`

Vai trò của Autotools là làm phẳng những khác biệt giữa các loại hệ thống khác nhau mà package có thể được compile cho, tính đến các phiên bản compiler khác nhau, các phiên bản thư viện khác nhau, các vị trí khác nhau của file header, và các dependency với package khác.

Các package dùng Autotools đi kèm một script tên là `configure`, kiểm tra các dependency và tạo makefile theo những gì nó tìm thấy. Script `configure` cũng có thể cho bạn cơ hội bật hoặc tắt một số tính năng. Bạn có thể xem các tùy chọn được cung cấp bằng cách chạy `./configure --help`.

Để cấu hình, build và cài đặt một package cho OS native, thông thường bạn sẽ chạy ba lệnh sau:

```
$ ./configure
$ make
$ sudo make install
```

Autotools cũng có thể xử lý cross-development. Bạn có thể tác động đến hành vi của script đã cấu hình bằng cách đặt các biến shell sau:

- `CC`: Lệnh C compiler

- `CFLAGS`: Các flag bổ sung cho C compiler

- `CXX`: Lệnh C++ compiler

- `CXXFLAGS`: Các flag bổ sung cho C++ compiler

- `LDFLAGS`: Các flag bổ sung cho linker; ví dụ, nếu bạn có thư viện trong một thư mục non-standard, `<lib dir>`, bạn sẽ thêm nó vào đường dẫn tìm thư viện bằng cách thêm `-L<lib dir>`

- `LIBS`: Danh sách các thư viện bổ sung truyền cho linker; ví dụ, `-lm` cho thư viện toán học

- `CPPFLAGS`: Các flag cho C/C++ preprocessor; ví dụ, bạn sẽ thêm `-I<include dir>` để tìm header trong một thư mục non-standard, `<include dir>`

- `CPP`: C preprocessor cần dùng

Đôi khi, chỉ cần đặt biến `CC` là đủ, như sau:

```
$ CC=aarch64-buildroot-linux-gnu-gcc ./configure
```

Những lúc khác, điều đó sẽ dẫn đến một lỗi như thế này:

```
<…>
checking for suffix of executables...
checking whether we are cross compiling... configure: error: in '/home/
frank/sqlite-autoconf-3440000':
configure: error: cannot run C compiled programs.
If you meant to cross compile, use '--host'.
See 'config.log' for more details
```

Lý do của lỗi là `configure` thường cố khám phá khả năng của toolchain bằng cách compile các đoạn code nhỏ và chạy chúng để xem điều gì xảy ra, điều này không thể hoạt động nếu chương trình đã được cross-compiled.

LƯU Ý QUAN TRỌNG

Hãy truyền `--host=<host>` cho `configure` khi bạn cross-compiling để `configure` tìm trên hệ thống của bạn toolchain cross-compiling nhắm tới nền tảng `<host>` được chỉ định. Bằng cách đó, `configure` không cố chạy các đoạn code non-native như một phần của bước cấu hình.

Autotools hiểu ba loại máy khác nhau có thể liên quan khi compile một package:

- build: Máy tính build package, mặc định là máy hiện tại.

- host: Máy tính mà chương trình sẽ chạy trên đó. Với compile native, tham số này để trống và mặc định là cùng máy tính với build. Khi bạn cross-compiling, hãy đặt nó thành tuple của toolchain.

- target: Máy tính mà chương trình sẽ tạo code cho. Bạn sẽ đặt tham số này khi build một cross compiler.

Để cross-compile, bạn chỉ cần ghi đè host như sau:

```
$ CC=aarch64-buildroot-linux-gnu-gcc ./configure --host=aarch64-buildroot-
linux-gnu
```

Một điều cuối cùng cần lưu ý là thư mục cài đặt mặc định là `<sysroot>/usr/local`. Thông thường bạn sẽ cài đặt vào `<sysroot>/usr` để các file header và thư viện được lấy từ các vị trí mặc định của chúng.

Lệnh đầy đủ để cấu hình một package Autotools điển hình như sau:

```
$ CC=aarch64-buildroot-linux-gnu-gcc ./configure --host=aarch64-buildroot-
linux-gnu --prefix=/usr
```

Hãy đi sâu hơn vào Autotools và dùng nó để cross-compile một thư viện phổ biến.

#### Một ví dụ: SQLite

Thư viện SQLite hiện thực một cơ sở dữ liệu quan hệ đơn giản và khá phổ biến trên các thiết bị nhúng.

Trước tiên, hãy lấy một bản sao của SQLite:

```
$ wget http://www.sqlite.org/2023/sqlite-autoconf-3440000.tar.gz
$ tar xf sqlite-autoconf-3440000.tar.gz
$ cd sqlite-autoconf-3440000
```

Phiên bản 3.44.0 của SQLite có thể không còn nữa. Nếu vậy, hãy tải một phiên bản source code up-to-date hơn từ trang SQLite Download tại `https://www.sqlite.org/download.html.` Sửa các lệnh `tar` và `cd` ở trên cho khớp với tên file của tarball mới.

Tiếp theo, chạy script `configure`:

```
$ CC=aarch64-buildroot-linux-gnu-gcc ./configure --host=aarch64-buildroot-
linux-gnu --prefix=/usr
```

Có vẻ đã chạy được! Nếu thất bại, sẽ có các thông báo lỗi được in ra terminal và ghi vào `config.log`. Lưu ý rằng nhiều makefile đã được tạo ra, vì vậy giờ bạn có thể build nó:

```
$ make
```

Cuối cùng, bạn cài đặt nó vào thư mục toolchain bằng cách đặt biến make `DESTDIR`. Nếu không, nó sẽ cố cài đặt vào thư mục `/usr` của máy host, đó không phải là điều bạn muốn:

```
$ make DESTDIR=$(aarch64-buildroot-linux-gnu-gcc -print-sysroot) install
```

Bạn có thể thấy lệnh cuối cùng thất bại với lỗi quyền truy cập file vì toolchain được cài đặt trong một thư mục hệ thống như `/opt` hoặc `/usr/local`. Trong trường hợp đó, bạn sẽ cần quyền root khi chạy cài đặt.

Sau khi cài đặt, bạn sẽ thấy nhiều file đã được thêm vào toolchain:

- `<sysroot>/usr/bin`: `sqlite3`: Một giao diện command-line cho SQLite mà bạn có thể cài đặt và chạy trên target

- `<sysroot>/usr/lib`: `libsqlite3.so.0.8.6`, `libsqlite3.so.0`, `libsqlite3.so`, `libsqlite3.la`, `libsqlite3.a`: Các thư viện shared và static

- `<sysroot>/usr/lib/pkgconfig`: `sqlite3.pc`: File cấu hình package, như được mô tả trong phần sau

- `<sysroot>/usr/include`: `sqlite3.h`, `sqlite3ext.h`: Các file header

- `<sysroot>/usr/share/man/man1`: `sqlite3.1`: Trang manual

Giờ bạn có thể compile các chương trình dùng sqlite3 bằng cách thêm `-lsqlite3` ở giai đoạn link:

```
$ aarch64-buildroot-linux-gnu-gcc -lsqlite3 sqlite-test.c -o sqlite-test
```

Ở đây, `sqlite-test.c` là một chương trình giả định gọi các hàm SQLite. Vì `sqlite3` đã được cài đặt vào `sysroot`, compiler sẽ tìm thấy file header và thư viện mà không gặp vấn đề gì. Nếu chúng được cài đặt ở nơi khác, bạn sẽ phải thêm `-L<lib dir>` và `-I<include dir>`.

Tất nhiên, cũng sẽ có các runtime dependency và bạn sẽ phải cài đặt các file thích hợp vào thư mục target, như được mô tả trong Chương 5.

Để cross-compile một thư viện hoặc package, trước tiên bạn cần cross-compile các dependency của nó. Autotools dựa vào một tiện ích gọi là `pkg-config` để thu thập thông tin quan trọng về các package được cross-compiled bởi Autotools.

### Cấu hình package

Theo dõi các dependency của package khá phức tạp. Tiện ích cấu hình package `pkg-config` giúp theo dõi những package nào được cài đặt và mỗi package cần những compile flag nào bằng cách giữ một cơ sở dữ liệu các package Autotools trong `<sysroot>/usr/lib/pkgconfig`. Ví dụ, file của SQLite3 có tên là `sqlite3.pc` và chứa thông tin thiết yếu mà các package khác phụ thuộc vào nó cần:

```
cat $(aarch64-buildroot-linux-gnu-gcc -print-sysroot)/usr/lib/pkgconfig/
sqlite3.pc
# Package Information for pkg-config
prefix=/usr
exec_prefix=${prefix}
libdir=${exec_prefix}/lib
includedir=${prefix}/include

Name: SQLite
Description: SQL database engine
Version: 3.44.0
Libs: -L${libdir} -lsqlite3
Libs.private: -lm -ldl -lpthread
Cflags: -I${includedir}
```

Bạn có thể dùng `pkg-config` để trích xuất thông tin ở dạng có thể đưa thẳng vào `gcc`. Trong trường hợp của một thư viện như `libsqlite3`, bạn muốn biết tên thư viện (`--libs`) và mọi C flag đặc biệt `(--cflags`):

```
$ pkg-config sqlite3 --libs --cflags
Package sqlite3 was not found in the pkg-config search path.
Perhaps you should add the directory containing 'sqlite3.pc' to the PKG_
CONFIG_PATH environment variable
No package 'sqlite3' found
```

Ối! Lệnh đó thất bại vì nó tìm trong `sysroot` của host, và development package của `libsqlite3` chưa được cài đặt trên host. Bạn cần trỏ nó tới `sysroot` của toolchain target bằng cách đặt biến shell `PKG_CONFIG_LIBDIR`:

```
$ export PKG_CONFIG_LIBDIR=$(aarch64-buildroot-linux-gnu-gcc -print-
sysroot)/usr/lib/pkgconfig
$ pkg-config sqlite3 --libs --cflags
-lsqlite3
```

Giờ output là `-lsqlite3`. Trong trường hợp này, bạn đã biết điều đó rồi, nhưng thông thường thì không, vì vậy đây là một kỹ thuật có giá trị. Các lệnh cuối cùng để compile là:

```
$ export PKG_CONFIG_LIBDIR=$(aarch64-buildroot-linux-gnu-gcc -print-
sysroot)/usr/lib/pkgconfig
$ aarch64-buildroot-linux-gnu-gcc $(pkg-config sqlite3 --cflags --libs)
sqlite-test.c -o sqlite-test
```

Nhiều script `configure` đọc thông tin do `pkg-config` tạo ra. Điều này có thể dẫn đến lỗi khi cross-compiling, như chúng ta sẽ thấy tiếp theo.

### Các vấn đề khi cross-compiling

`sqlite3` là một package well-behaved, nó cross-compiles rất suôn sẻ, nhưng không phải package nào cũng vậy. Các điểm khó điển hình bao gồm:

- Build system Home-grown cho các thư viện như `zlib`, có một script `configure` không hoạt động giống `configure` của Autotools được mô tả trong phần trước

- Các script `configure` đọc thông tin `pkg-config`, header và các file khác từ host mà bỏ qua việc ghi đè `--host`

- Các script cứ cố chạy code đã được cross-compiled

Mỗi trường hợp đòi hỏi phân tích lỗi cẩn thận. Chúng ta có thể truyền thêm tham số cho script `configure` để cung cấp thông tin đúng, hoặc áp patch vào code để tránh hẳn vấn đề. Hãy nhớ rằng một package có thể có rất nhiều dependency. Điều này đặc biệt đúng với các chương trình có giao diện đồ họa hoặc xử lý nội dung đa phương tiện. Ví dụ, MPlayer có dependency vào hơn 100 thư viện. Sẽ mất hàng tuần công sức để build tất cả chúng.

Vì vậy, tôi không khuyên cross-compiling thủ công các thành phần cho target theo cách này, trừ khi không có lựa chọn nào khác hoặc số lượng package cần build là nhỏ.

Một cách tốt hơn nhiều là dùng một công cụ build như Buildroot hoặc The Yocto Project, hoặc tránh hẳn vấn đề bằng cách thiết lập một môi trường build native cho kiến trúc target. Giờ bạn có thể thấy vì sao các bản phân phối như Debian luôn được compile native.

### CMake

CMake mang tính một meta build system hơn, theo nghĩa nó dựa vào các công cụ native của nền tảng bên dưới để build phần mềm. Trên Windows, CMake có thể tạo file project cho Microsoft Visual Studio, còn trên macOS, nó có thể tạo file project cho Xcode. Tích hợp với các IDE chính trên mỗi nền tảng lớn không phải là việc đơn giản, và điều đó giải thích sự thành công của CMake như giải pháp build system cross-platform hàng đầu. CMake cũng chạy trên Linux, nơi nó có thể được dùng cùng với một toolchain cross-compiling tùy bạn chọn.

Để cấu hình, build và cài đặt một package cho OS Linux native, hãy chạy các lệnh sau:

```
$ cmake .
$ make
$ sudo make install
```

Trên Linux, công cụ build native là GNU `make`, vì vậy CMake mặc định tạo makefile để chúng ta build. Thường thì chúng ta muốn thực hiện các lần build out-of-source để object file và các build artifact khác tách biệt với file source.

Để cấu hình một lần build out-of-source trong một thư mục con tên là `build`, hãy chạy các lệnh sau:

```
$ mkdir build
$ cd build
$ cmake ..
```

Lệnh này sẽ tạo các makefile bên trong một thư mục con `build` trong thư mục project nơi có `CMakeLists.txt`. File `CMakeLists.txt` là thứ tương đương trong CMake của script `configure` cho các project Autotools-based.

Sau đó, chúng ta có thể build project ở ngoài source từ bên trong thư mục `build` và cài đặt package giống như trước:

```
$ make
$ sudo make install
```

CMake dùng đường dẫn tuyệt đối, vì vậy thư mục con `build` không thể được copy hay di chuyển sau khi các makefile đã được tạo, nếu không mọi bước `make` tiếp theo nhiều khả năng sẽ thất bại. Lưu ý rằng CMake mặc định cài đặt package vào các thư mục hệ thống như `/usr/bin`, ngay cả với các lần build out-of-source.

Để tạo makefile sao cho CMake cài đặt package vào thư mục con `build`, hãy thay lệnh `cmake` trước đó bằng lệnh sau:

```
$ cmake .. -D CMAKE_INSTALL_PREFIX=../build
```

Chúng ta không còn cần đặt `sudo` trước `make install` vì không cần quyền nâng cao để copy các file package vào thư mục `build`.

Tương tự, chúng ta có thể dùng một tùy chọn command-line khác của CMake để tạo makefile cho cross-compilation:

```
$ cmake .. -D CMAKE_C_COMPILER="/home/frank/aarch64--glibc--stable-
<version>/bin/aarch64-buildroot-linux-gnu-gcc"
```

Nhưng cách làm tốt nhất để cross-compiling với CMake là tạo một toolchain file đặt `CMAKE_C_COMPILER` và `CMAKE_CXX_COMPILER` cùng với các biến liên quan khác để nhắm tới embedded Linux.

CMake hoạt động tốt nhất khi chúng ta thiết kế phần mềm theo cách module hóa, bằng cách áp đặt các ranh giới API well-defined giữa các thư viện và thành phần.

Sau đây là một số thuật ngữ then chốt xuất hiện lặp đi lặp lại trong CMake:

- `target`: Một thành phần phần mềm như thư viện hoặc file thực thi.

- `properties`: Các file source, tùy chọn compiler và thư viện được link cần để build một target.

- `package`: Một file CMake cấu hình một target bên ngoài để build, giống như thể nó được định nghĩa bên trong chính `CMakeLists.txt` của bạn.

Ví dụ, nếu chúng ta có một file thực thi CMake-based tên là `dummy` cần phụ thuộc vào SQLite, chúng ta có thể định nghĩa `CMakeLists.txt` sau:

```
cmake_minimum_required (VERSION 3.0)
project (Dummy)
add_executable(dummy dummy.c)
find_package (SQLite3)
target_include_directories(dummy PRIVATE ${SQLITE3_INCLUDE_DIRS})
target_link_libraries (dummy PRIVATE ${SQLITE3_LIBRARIES})
```

Lệnh `find_package` tìm một package (trong trường hợp này là SQLite3) và import nó để target bên ngoài có thể được thêm làm dependency vào danh sách `target_link_libraries` của file thực thi `dummy` để link.

CMake đi kèm nhiều finder cho các package C và C++ phổ biến, bao gồm OpenSSL, Boost và protobuf, giúp việc phát triển native hiệu quả hơn nhiều so với khi chỉ dùng makefile thuần.

Qualifier `PRIVATE` ngăn các chi tiết như header và flag bị rò rỉ ra ngoài target `dummy`. Dùng `PRIVATE` hợp lý hơn khi target được build là một thư viện thay vì một file thực thi. Hãy coi các target như các module và cố gắng giảm thiểu bề mặt bị lộ ra của chúng khi dùng CMake để định nghĩa target của riêng bạn. Chỉ dùng qualifier `PUBLIC` khi thực sự cần thiết và dùng qualifier `INTERFACE` cho các thư viện header-only.

Hãy mô hình hóa ứng dụng của bạn như một đồ thị dependency với các cạnh nối giữa các target. Đồ thị này không chỉ nên bao gồm các thư viện mà ứng dụng link trực tiếp mà cả mọi dependency bắc cầu. Để có kết quả tốt nhất, hãy loại bỏ mọi chu trình hoặc các phụ thuộc không cần thiết khác thấy trong đồ thị. Thường tốt nhất là thực hiện bài tập này trước khi bắt đầu viết code. Một chút lập kế hoạch có thể tạo nên sự khác biệt giữa một `CMakeLists.txt` sạch sẽ, dễ bảo trì và một mớ hỗn độn khó hiểu mà không ai muốn động vào.

## Tóm tắt

Toolchain luôn là điểm khởi đầu của bạn. Mọi thứ theo sau đều phụ thuộc vào việc có một toolchain hoạt động được và đáng tin cậy.

Bạn có thể bắt đầu chỉ với một toolchain tải về từ Bootlin hoặc Linaro và dùng nó để compile tất cả các package mà bạn cần trên target. Hoặc bạn có thể có được toolchain như một phần của một bản phân phối được tạo từ source code bằng một build system như Buildroot hoặc The Yocto Project.

Hãy cẩn thận với các toolchain hoặc bản phân phối được cung cấp miễn phí cho bạn như một phần của một gói phần cứng. Chúng thường được cấu hình kém và không được bảo trì.

Khi đã có toolchain, bạn có thể dùng nó để build các thành phần khác của hệ thống embedded Linux. Trong chương tiếp theo, bạn sẽ học về bootloader, thứ đưa thiết bị của bạn vào hoạt động và bắt đầu quá trình boot. Chúng ta sẽ dùng toolchain đã build trong chương này để build một bootloader hoạt động được cho BeaglePlay.

## Tìm hiểu thêm

- Toolchain Options in 2023: What’s new in compilers and libcs?, của Bernhard “Bero” Rosenkränzer – `https://www.youtube.com/watch?v=Vgm3GJ2ItDA`

- Modern CMake for modular design, của Mathieu Ropert – `https://www.youtube.com/watch?v=eC9-iRN2b04`
