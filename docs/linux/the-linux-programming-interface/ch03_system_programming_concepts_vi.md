# CHƯƠNG 3: CÁC KHÁI NIỆM LẬP TRÌNH HỆ THỐNG

Chương này trang bị các chủ đề đa dạng vốn là điều kiện tiên quyết cho lập trình hệ thống. Chúng ta bắt đầu bằng việc giới thiệu các system call (lời gọi hệ thống) và đi vào chi tiết các bước diễn ra trong quá trình thực thi chúng. Sau đó, chúng ta xem xét các thư viện hàm (library functions) và điểm khác biệt của chúng so với system call, kết hợp với phần mô tả về thư viện (GNU) C library.

Mỗi khi thực hiện một system call hoặc gọi một thư viện hàm, chúng ta luôn nên kiểm tra trạng thái trả về của lời gọi để xác định xem nó có thành công hay không. Chúng ta mô tả cách thực hiện các kiểm tra như vậy, và giới thiệu một tập hợp các hàm được sử dụng trong hầu hết các chương trình ví dụ trong cuốn sách này để chẩn đoán lỗi từ các system call và thư viện hàm.

Chúng ta kết thúc bằng việc xem xét các vấn đề liên quan đến lập trình có tính di động (portable programming), cụ thể là việc sử dụng các macro thử nghiệm tính năng (feature test macros) và các kiểu dữ liệu hệ thống chuẩn (standard system data types) do SUSv3 định nghĩa.

## 3.1 System Calls

<span id="page-22-0"></span>System call là một điểm nhập có kiểm soát vào kernel, cho phép một tiến trình yêu cầu kernel thực hiện một số hành động thay mặt cho tiến trình đó. Kernel cung cấp một loạt các dịch vụ mà chương trình có thể truy cập thông qua giao diện lập trình ứng dụng system call (system call API). Các dịch vụ này bao gồm, ví dụ: tạo tiến trình mới, thực hiện I/O, và tạo pipe cho việc giao tiếp giữa các tiến trình. (Trang tài liệu hướng dẫn `syscalls(2)` liệt kê các system call của Linux.)

Trước khi đi vào chi tiết về cách một system call hoạt động, chúng ta ghi nhận một số điểm chung:
* Một system call chuyển đổi trạng thái của bộ xử lý từ user mode sang kernel mode, để CPU có thể truy cập bộ nhớ kernel được bảo vệ.
* Tập hợp các system call là cố định. Mỗi system call được định danh bởi một số duy nhất. (Sơ đồ đánh số này thường không hiển thị đối với các chương trình, vốn định danh các system call bằng tên.)
* Mỗi system call có thể có một tập hợp các đối số chỉ định thông tin cần chuyển từ user space (tức là không gian địa chỉ ảo của tiến trình) sang kernel space và ngược lại.

Dưới góc độ lập trình, việc gọi một system call trông rất giống việc gọi một hàm C. Tuy nhiên, đằng sau hậu trường, rất nhiều bước diễn ra trong quá trình thực thi một system call. Để minh họa điều này, chúng ta xem xét các bước theo thứ tự diễn ra trên một kiến trúc phần cứng cụ thể, x86-32. Các bước như sau:
* Chương trình ứng dụng thực hiện một system call bằng cách gọi một hàm bao (wrapper function) trong thư viện C.
* Hàm wrapper phải đưa tất cả các đối số của system call tới bẫy xử lý system call (system call trap-handling routine - mô tả ngay sau đây). Các đối số này được truyền tới wrapper thông qua stack, nhưng kernel mong muốn nhận chúng trong các thanh ghi (registers) cụ thể. Hàm wrapper sẽ chép các đối số này vào các thanh ghi đó.
* Vì tất cả các system call đều đi vào kernel theo cùng một cách, kernel cần một phương pháp để định danh system call. Để cho phép điều này, hàm wrapper chép số hiệu system call vào một thanh ghi CPU cụ thể (`%eax`).
* Hàm wrapper thực thi một chỉ thị máy bẫy (`int 0x80`), khiến bộ xử lý chuyển từ user mode sang kernel mode và thực thi mã được trỏ bởi vị trí `0x80` (128 trong hệ thập phân) của véc-tơ bẫy (trap vector) hệ thống.
 Các kiến trúc x86-32 gần đây triển khai chỉ thị `sysenter`, cung cấp một phương pháp chuyển sang kernel mode nhanh hơn so với chỉ thị bẫy `int 0x80` truyền thống. Việc sử dụng `sysenter` được hỗ trợ trong kernel 2.6 và từ glibc 2.3.2 trở đi.
* Để đáp lại bẫy tới vị trí `0x80`, kernel gọi thủ tục `system_call()` của nó (nằm trong file assembler `arch/i386/entry.S`) để xử lý bẫy. Trình xử lý này:
    * a) Lưu các giá trị thanh ghi vào kernel stack (Mục 6.5).
    * b) Kiểm tra tính hợp lệ của số hiệu system call.
    * c) Gọi thủ tục dịch vụ system call (system call service routine) tương ứng, vốn được tìm bằng cách sử dụng số hiệu system call làm chỉ số tra bảng tất cả các thủ tục dịch vụ system call (biến kernel `sys_call_table`). Nếu thủ tục dịch vụ system call có bất kỳ đối số nào, đầu tiên nó kiểm tra tính hợp lệ của chúng; ví dụ: kiểm tra các địa chỉ xem có trỏ tới các vị trí hợp lệ trong bộ nhớ người dùng hay không. Sau đó, thủ tục dịch vụ thực hiện tác vụ được yêu cầu, có thể bao gồm việc sửa đổi các giá trị tại các địa chỉ được chỉ định trong các đối số và truyền dữ liệu giữa bộ nhớ người dùng và bộ nhớ kernel (ví dụ: trong các thao tác I/O). Cuối cùng, thủ tục dịch vụ trả về một trạng thái kết quả cho thủ tục `system_call()`.
    * d) Khôi phục các giá trị thanh ghi từ kernel stack và đặt giá trị trả về của system call lên stack.
    * e) Trả về hàm wrapper, đồng thời đưa bộ xử lý trở lại user mode.
* Nếu giá trị trả về của thủ tục dịch vụ system call chỉ ra một lỗi, hàm wrapper sẽ đặt biến toàn cục `errno` (xem Mục [3.4](#page-27-0)) bằng giá trị này. Hàm wrapper sau đó trả về cho chương trình gọi, cung cấp một giá trị trả về kiểu số nguyên chỉ ra sự thành công hay thất bại của system call.

Trên Linux, các thủ tục dịch vụ system call tuân theo quy ước trả về một giá trị không âm để chỉ ra sự thành công. Trong trường hợp xảy ra lỗi, thủ tục trả về một số âm, là giá trị phủ định của một trong các hằng số `errno`. Khi một giá trị âm được trả về, hàm wrapper của thư viện C sẽ phủ định nó (để làm cho nó thành dương), chép kết quả vào `errno`, và trả về `-1` làm kết quả hàm của wrapper để chỉ ra lỗi cho chương trình gọi.

Quy ước này dựa trên giả định rằng các thủ tục dịch vụ system call không trả về giá trị âm khi thành công. Tuy nhiên, đối với một số ít các thủ tục này, giả định đó không đúng. Thông thường, đây không phải là vấn đề vì dải các giá trị `errno` bị phủ định không chồng lấp với các giá trị trả về âm hợp lệ. Tuy nhiên, quy ước này gây ra sự cố trong một trường hợp: thao tác `F_GETOWN` của system call `fcntl()`, mà chúng ta mô tả trong Mục 63.3.

[Hình 3-1](#page-25-0) minh họa chuỗi thao tác trên bằng ví dụ về system call `execve()`. Trên Linux/x86-32, `execve()` là system call số 11 (`__NR_execve`). Do đó, trong véc-tơ `sys_call_table`, phần tử thứ 11 chứa địa chỉ của `sys_execve()`, thủ tục dịch vụ cho system call này. (Trên Linux, các thủ tục dịch vụ system call thường có tên dạng `sys_xyz()`, trong đó `xyz()` là system call tương ứng.)

Thông tin được đưa ra trong các đoạn trên nhiều hơn những gì chúng ta thường cần biết cho phần còn lại của cuốn sách này. Tuy nhiên, nó minh họa một điểm quan trọng rằng, ngay cả đối với một system call đơn giản, khá nhiều công việc phải được thực hiện, và do đó các system call có một chi phí bổ sung (overhead) nhỏ nhưng đáng kể.

Như một ví dụ về chi phí bổ sung khi thực hiện một system call, hãy xem xét system call `getppid()`, vốn chỉ đơn giản trả về ID tiến trình cha của tiến trình gọi. Trên một hệ thống x86-32 của tác giả chạy Linux 2.6.25, 10 triệu lời gọi `getppid()` mất khoảng 2,2 giây để hoàn thành. Điều này tương đương với khoảng 0,3 microgiây cho mỗi lời gọi. Để so sánh, trên cùng hệ thống đó, 10 triệu lời gọi tới một hàm C chỉ đơn giản trả về một số nguyên mất 0,11 giây, tức là khoảng một phần hai mươi thời gian cần thiết cho các lời gọi `getppid()`. Tất nhiên, hầu hết các system call có chi phí bổ sung lớn hơn nhiều so với `getppid()`.

Vì dưới góc độ của một chương trình C, việc gọi hàm wrapper trong thư viện C đồng nghĩa với việc gọi thủ tục dịch vụ system call tương ứng, trong phần còn lại của cuốn sách này, chúng ta sử dụng cách diễn đạt như "gọi system call `xyz()`" có nghĩa là "gọi hàm wrapper thực hiện system call `xyz()`."

```
+--------------------------- USER MODE -----------------------------------+
|      Application program              glibc wrapper function            |
|                                       (sysdeps/unix/sysv/linux/         |
|                                       syscalls/execve.c)                |                                
|    +----------------------+        +----------------------------------+ |
|    |                      |        |                                  | |
|    |                      |        |                                  | |
|    |   ...                |        |                                  | |
|    |   execve(path,------------------> execve(path, argv, envp)       | |
|    |          argv, envp);|        |   {   ...                        | |
|    |   ... <------------------|    |       int 0x80        ------>----------------|           
|    |                      |   |    |       (__NR_execve,              | |         |Switch to kernel mode
|    |                      |   |    |        path, argv, envp)  ... <--------------|------|
|    |                      |   |------------return                     | |         |      |
|    |                      |        |   }                              | |         |      |
|    +----------------------+        +----------------------------------+ |         |      |
|_________________________________________________________________________|         |      |
                                                                                    |      |
+--------------------------- KERNEL MODE ---------------------------------+         |      |
|   System call service routine                Trap handler               |         |      |Switch to user mode
|   (arch/x86/kernel/process_32.c)      (arch/x86/kernel/entry_32.S)      |         |      |                 
|    +----------------------+        +----------------------------------+ |         |      |
|    |                      |        |   system_call:  <-----------------------------      |
|    |                      |        |   ...                            | |                |
|    |                      |        |                                  | |                |
|    |   sys_execve() <------------------call sys_call_table            | |                |
|    |   {                  |        |            [__NR_execve]         | |                |
|    |   ...                |        |                                  | |                |
|    |   return error; ----------------> ...                            | |                |
|    |   }                  |        |                                  | |                |
|    |                      |        |                                  | |                |
|    |                      |        |              ----->---------------------------------|
|    +----------------------+        +----------------------------------+ |
|_________________________________________________________________________|   

```
<span id="page-25-0"></span> **Hình 3-1:** Các bước trong quá trình thực thi một system call

Phụ lục A mô tả lệnh `strace`, vốn có thể được sử dụng để theo vết các system call được thực hiện bởi một chương trình, cho mục đích gỡ lỗi hoặc đơn giản là để điều tra những gì chương trình đang làm.

Thêm thông tin về cơ chế system call của Linux có thể tìm thấy trong [Love, 2010], [Bovet & Cesati, 2005], và [Maxwell, 1999].

## 3.2 Library Functions

Một thư viện hàm (library function) đơn giản là một trong số rất nhiều hàm cấu thành nên thư viện C chuẩn (standard C library). (Để ngắn gọn, khi nói về một hàm cụ thể trong phần còn lại của cuốn sách, chúng ta sẽ thường chỉ viết "hàm" thay vì "thư viện hàm".) Mục đích của các hàm này rất đa dạng, bao gồm các tác vụ như mở file, chuyển đổi thời gian sang định dạng đọc được cho con người, và so sánh hai chuỗi ký tự.

Nhiều thư viện hàm không sử dụng bất kỳ system call nào (ví dụ: các hàm thao tác chuỗi). Mặt khác, một số thư viện hàm được xây dựng chồng lên các system call. Ví dụ, thư viện hàm `fopen()` sử dụng system call `open()` để thực sự mở một file. Thường thì các thư viện hàm được thiết kế để cung cấp một giao diện thân thiện với người gọi hơn so với system call bên dưới. Ví dụ, hàm `printf()` cung cấp định dạng đầu ra và đệm dữ liệu (data buffering), trong khi system call `write()` chỉ xuất một khối byte. Tương tự, các hàm `malloc()` và `free()` thực hiện nhiều tác vụ quản lý giúp cho việc cấp phát và giải phóng bộ nhớ dễ dàng hơn nhiều so với system call `brk()` bên dưới.


## 3.3 Thư viện C chuẩn; Thư viện GNU C (glibc)

Có nhiều bản triển khai khác nhau của thư viện C chuẩn trên các bản thực thi UNIX khác nhau. Bản triển khai được sử dụng phổ biến nhất trên Linux là GNU C library (glibc, http://www.gnu.org/software/libc/).

Nhà phát triển và bảo trì chính của thư viện GNU C ban đầu là Roland McGrath. Ngày nay, công việc này được đảm nhận bởi Ulrich Drepper.

Nhiều thư viện C khác cũng có sẵn cho Linux, bao gồm các thư viện với yêu cầu bộ nhớ nhỏ hơn dùng cho các ứng dụng thiết bị nhúng. Các ví dụ bao gồm uClibc (http://www.uclibc.org/) và diet libc (http://www.fefe.de/dietlibc/). Trong cuốn sách này, chúng ta giới hạn thảo luận về glibc, vì đó là thư viện C được sử dụng bởi hầu hết các ứng dụng được phát triển trên Linux.

### Xác định phiên bản glibc trên hệ thống

Đôi khi, chúng ta cần xác định phiên bản glibc trên hệ thống. Từ shell, chúng ta có thể làm điều này bằng cách chạy file thư viện chia sẻ glibc như thể nó là một chương trình thực thi. Khi chúng ta chạy thư viện dưới dạng một file thực thi, nó hiển thị các đoạn văn bản khác nhau, bao gồm số phiên bản của nó:

```
$ /lib/libc.so.6
GNU C Library stable release version 2.10.1, by Roland McGrath et al.
Copyright (C) 2009 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.
There is NO warranty; not even for MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.
Compiled by GNU CC version 4.4.0 20090506 (Red Hat 4.4.0-4).
Compiled on a Linux >>2.6.18-128.4.1.el5<< system on 2009-08-19.
Available extensions:
 The C stubs add-on version 2.1.2.
 crypt add-on version 2.1 by Michael Glad and others
 GNU Libidn by Simon Josefsson
 Native POSIX Threads Library by Ulrich Drepper et al
 BIND-8.2.3-T5B
 RT using linux kernel aio
For bug reporting instructions, please see:
<http://www.gnu.org/software/libc/bugs.html>.
```

Trong một số bản phân phối Linux, thư viện GNU C nằm ở đường dẫn khác `/lib/libc.so.6`. Một cách để xác định vị trí của thư viện là chạy chương trình `ldd` (list dynamic dependencies) đối với một file thực thi được liên kết động với glibc (hầu hết các file thực thi đều được liên kết theo cách này). Sau đó, chúng ta có thể kiểm tra danh sách phụ thuộc thư viện kết quả để tìm vị trí của thư viện chia sẻ glibc:

```
$ ldd myprog | grep libc
 libc.so.6 => /lib/tls/libc.so.6 (0x4004b000)
```

Có hai cách mà một chương trình ứng dụng có thể xác định phiên bản của thư viện GNU C hiện có trên hệ thống: bằng cách kiểm tra các hằng số hoặc bằng cách gọi một thư viện hàm. Từ phiên bản 2.0 trở đi, glibc định nghĩa hai hằng số, `__GLIBC__` và `__GLIBC_MINOR__`, có thể được kiểm tra tại thời điểm biên dịch (trong các câu lệnh `#ifdef`). Trên một hệ thống đã cài đặt glibc 2.12, các hằng số này sẽ có giá trị 2 và 12. Tuy nhiên, các hằng số này có giá trị sử dụng hạn chế trong một chương trình được biên dịch trên một hệ thống nhưng chạy trên một hệ thống khác có phiên bản glibc khác. Để xử lý khả năng này, một chương trình có thể gọi hàm `gnu_get_libc_version()` để xác định phiên bản glibc hiện có tại thời điểm chạy (run time).

```c
#include <gnu/libc-version.h>

const char *gnu_get_libc_version(void);
                   // Trả về con trỏ tới chuỗi được cấp phát tĩnh, kết thúc bằng null
                   // chứa số phiên bản thư viện GNU C
```

Hàm `gnu_get_libc_version()` trả về một con trỏ tới chuỗi, chẳng hạn như `2.12`.

Chúng ta cũng có thể lấy thông tin phiên bản bằng cách sử dụng hàm `confstr()` để truy xuất giá trị của biến cấu hình `_CS_GNU_LIBC_VERSION` (đặc thù của glibc). Lời gọi này trả về một chuỗi như `glibc 2.12`.

## <span id="page-27-0"></span> 3.4 Xử lý lỗi từ các System Call và Thư viện hàm

Hầu như mọi system call và thư viện hàm đều trả về một loại giá trị trạng thái nào đó cho biết lời gọi thành công hay thất bại. Giá trị trạng thái này luôn luôn nên được kiểm tra để xem lời gọi có thành công hay không. Nếu không, hành động thích hợp nên được thực hiện — ít nhất, chương trình nên hiển thị một thông báo lỗi cảnh báo rằng một điều gì đó không mong muốn đã xảy ra.

Mặc dù việc bỏ qua các kiểm tra này để tiết kiệm thời gian gõ phím rất cám dỗ (đặc biệt là sau khi xem các ví dụ về chương trình UNIX và Linux nơi các giá trị trạng thái không được kiểm tra), đó là một sự tiết kiệm sai lầm. Nhiều giờ gõ lỗi (debugging) có thể bị lãng phí vì đã không thực hiện kiểm tra trạng thái trả về của một system call hoặc thư viện hàm vốn "không thể nào thất bại."

Một số ít system call không bao giờ thất bại. Ví dụ: `getpid()` luôn trả về thành công ID của một tiến trình, và `_exit()` luôn kết thúc một tiến trình. Không cần thiết phải kiểm tra giá trị trả về từ các system call như vậy.

### Xử lý lỗi system call

Trang tài liệu hướng dẫn cho mỗi system call ghi lại các giá trị trả về có thể có của lời gọi, cho biết (các) giá trị nào báo hiệu lỗi. Thông thường, một lỗi được chỉ ra bằng giá trị trả về `-1`. Do đó, một system call có thể được kiểm tra bằng đoạn mã như sau:

```c
fd = open(pathname, flags, mode); /* system call để mở một file */
if (fd == -1) {
    /* Mã để xử lý lỗi */
}
...

if (close(fd) == -1) {
    /* Mã để xử lý lỗi */
}
```

Khi một system call thất bại, nó sẽ đặt biến số nguyên toàn cục `errno` thành một giá trị dương định danh lỗi cụ thể. Việc include file header `<errno.h>` cung cấp khai báo cho `errno`, cũng như một tập hợp các hằng số cho các số hiệu lỗi khác nhau. Tất cả các tên biểu tượng này đều bắt đầu bằng chữ `E`. Phần có tiêu đề `ERRORS` trong mỗi trang tài liệu hướng dẫn cung cấp danh sách các giá trị `errno` có thể có mà mỗi system call có thể trả về. Dưới đây là một ví dụ đơn giản về việc sử dụng `errno` để chẩn đoán lỗi system call:

```c
cnt = read(fd, buf, numbytes);
if (cnt == -1) {
    if (errno == EINTR)
        fprintf(stderr, "read was interrupted by a signal
");
    else {
        /* Một lỗi khác đã xảy ra */
    }
}
```

Các system call và thư viện hàm thành công không bao giờ đặt lại `errno` về 0, vì vậy biến này có thể có một giá trị khác 0 như là hệ quả của một lỗi từ một lời gọi trước đó. Hơn nữa, SUSv3 cho phép một lời gọi hàm thành công đặt `errno` thành một giá trị khác 0 (mặc dù ít hàm làm điều này). Do đó, khi kiểm tra lỗi, chúng ta luôn nên kiểm tra trước xem giá trị trả về của hàm có chỉ ra lỗi hay không, và chỉ khi đó mới kiểm tra `errno` để xác định nguyên nhân gây ra lỗi.

Một số ít system call (ví dụ: `getpriority()`) có thể trả về `-1` một cách hợp lệ khi thành công. Để xác định xem có lỗi xảy ra trong các lời gọi như vậy hay không, chúng ta đặt `errno` thành 0 trước lời gọi, và sau đó kiểm tra nó sau lời gọi. Nếu lời gọi trả về `-1` và `errno` khác 0, thì đã xảy ra lỗi. (Một khẳng định tương tự cũng áp dụng cho một số ít thư viện hàm.)

Một hướng xử lý phổ biến sau khi một system call thất bại là in ra một thông báo lỗi dựa trên giá trị `errno`. Các thư viện hàm `perror()` và `strerror()` được cung cấp cho mục đích này.

Hàm `perror()` in chuỗi được trỏ bởi đối số `msg` của nó, theo sau là một thông báo tương ứng với giá trị hiện tại của `errno`.

```c
#include <stdio.h>

void perror(const char *msg);
```

Một cách đơn giản để xử lý lỗi từ các system call sẽ như sau:

```c
fd = open(pathname, flags, mode);
if (fd == -1) {
    perror("open");
    exit(EXIT_FAILURE);
}
```

Hàm `strerror()` trả về chuỗi lỗi tương ứng với số hiệu lỗi được đưa ra trong đối số `errnum` của nó.

```c
#include <string.h>

char *strerror(int errnum);
                        // Trả về con trỏ tới chuỗi lỗi tương ứng với errnum
```

Chuỗi được trả về bởi `strerror()` có thể được cấp phát tĩnh, điều đó có nghĩa là nó có thể bị ghi đè bởi các lời gọi tiếp theo tới `strerror()`.

Nếu `errnum` chỉ định một số hiệu lỗi không được nhận biết, `strerror()` trả về một chuỗi dạng `Unknown error nnn`. Trên một số bản thực thi khác, `strerror()` thay vào đó trả về `NULL` trong trường hợp này.

Vì các hàm `perror()` và `strerror()` nhạy cảm với thiết lập ngôn ngữ cục bộ (locale-sensitive) (Mục 10.4), các mô tả lỗi sẽ được hiển thị bằng ngôn ngữ cục bộ.

### Xử lý lỗi từ các thư viện hàm

Các thư viện hàm khác nhau trả về các kiểu dữ liệu khác nhau và các giá trị khác nhau để chỉ ra sự thất bại. (Kiểm tra trang tài liệu hướng dẫn cho từng hàm.) Cho các mục đích của chúng ta, các thư viện hàm có thể được chia thành các loại sau:

* Một số thư viện hàm trả về thông tin lỗi theo cùng một cách chính xác như các system call: giá trị trả về `-1`, với `errno` chỉ ra lỗi cụ thể. Một ví dụ về hàm như vậy là `remove()`, vốn xóa một file (bằng cách sử dụng system call `unlink()`) hoặc một thư mục (bằng cách sử dụng system call `rmdir()`). Lỗi từ các hàm này có thể được chẩn đoán theo cùng một cách như lỗi từ các system call.
* Một số thư viện hàm trả về một giá trị khác `-1` khi xảy ra lỗi, nhưng vẫn đặt `errno` để chỉ ra điều kiện lỗi cụ thể. Ví dụ, `fopen()` trả về một con trỏ `NULL` khi xảy ra lỗi, và việc thiết lập `errno` phụ thuộc vào system call bên dưới nào đã thất bại. Các hàm `perror()` và `strerror()` có thể được sử dụng để chẩn đoán các lỗi này.
* Các thư viện hàm khác hoàn toàn không sử dụng `errno`. Phương pháp xác định sự tồn tại và nguyên nhân gây lỗi phụ thuộc vào từng hàm cụ thể và được ghi lại trong trang tài liệu hướng dẫn của hàm đó. Đối với các hàm này, việc sử dụng `errno`, `perror()`, hoặc `strerror()` để chẩn đoán lỗi là một sai lầm.


## 3.5 Ghi chú về các chương trình ví dụ trong cuốn sách này

Trong mục này, chúng ta mô tả các quy ước và tính năng khác nhau thường được sử dụng bởi các chương trình ví dụ trình bày trong cuốn sách này.

### 3.5.1 Tùy chọn và đối số dòng lệnh

Nhiều chương trình ví dụ trong cuốn sách này dựa vào các tùy chọn và đối số dòng lệnh để xác định hành vi của chúng.

Các tùy chọn dòng lệnh UNIX truyền thống bao gồm một dấu gạch nối đầu tiên, một chữ cái định danh tùy chọn, và một đối số tùy chọn. (Các tiện ích GNU cung cấp cú pháp tùy chọn mở rộng bao gồm hai dấu gạch nối đầu tiên, theo sau là một chuỗi định danh tùy chọn và một đối số tùy chọn.) Để phân tích (parse) các tùy chọn này, chúng ta sử dụng thư viện hàm chuẩn `getopt()` (được mô tả trong Phụ lục B).

Mỗi chương trình ví dụ của chúng ta có cú pháp dòng lệnh không đỗi hỏi cung cấp một tiện ích trợ giúp đơn giản cho người dùng: nếu được gọi với tùy chọn `--help`, chương trình sẽ hiển thị một thông báo hướng dẫn sử dụng chỉ ra cú pháp cho các tùy chọn và đối số dòng lệnh.

### 3.5.2 Các hàm và file header chung

Hầu hết các chương trình ví dụ bao gồm một file header chứa các định nghĩa thường được yêu cầu, và chúng cũng sử dụng một tập hợp các hàm chung. Chúng ta thảo luận về file header và các hàm trong mục này.

#### File header chung

Mã nguồn 3-1 là file header được sử dụng bởi hầu như mọi chương trình trong cuốn sách này. File header này bao gồm các file header khác nhau được sử dụng bởi nhiều chương trình ví dụ, định nghĩa một kiểu dữ liệu Boolean, và định nghĩa các macro để tính giá trị nhỏ nhất và lớn nhất của hai giá trị số. Việc sử dụng file header này cho phép chúng ta làm cho các chương trình ví dụ ngắn hơn một chút.

**Mã nguồn 3-1:** File header được sử dụng bởi hầu hết các chương trình ví dụ
```c
/* lib/tlpi_hdr.h */
#ifndef TLPI_HDR_H
#define TLPI_HDR_H /* Ngăn chặn việc bao gồm kép ngẫu nhiên */

#include <sys/types.h> /* Định nghĩa kiểu được sử dụng bởi nhiều chương trình */
#include <stdio.h>     /* Các hàm I/O chuẩn */
#include <stdlib.h>    /* Khai báo mẫu hàm thư viện thường dùng,
                          cộng với các hằng số EXIT_SUCCESS và EXIT_FAILURE */
#include <unistd.h>    /* Khai báo mẫu cho nhiều system call */
#include <errno.h>     /* Khai báo errno và định nghĩa các hằng số lỗi */
#include <string.h>    /* Các hàm xử lý chuỗi thường dùng */

#include "get_num.h"   /* Khai báo các hàm của chúng ta để xử lý đối số số (getInt(), getLong()) */
#include "error_functions.h" /* Khai báo các hàm xử lý lỗi của chúng ta */

typedef enum { FALSE, TRUE } Boolean;

#define min(m,n) ((m) < (n) ? (m) : (n))
#define max(m,n) ((m) > (n) ? (m) : (n))

#endif
```

#### Các hàm chẩn đoán lỗi

Để đơn giản hóa việc xử lý lỗi trong các chương trình ví dụ của chúng ta, chúng ta sử dụng các hàm chẩn đoán lỗi có khai báo được hiển thị trong Mã nguồn 3-2.

**Mã nguồn 3-2:** Khai báo cho các hàm xử lý lỗi chung
```c
/* lib/error_functions.h */
#ifndef ERROR_FUNCTIONS_H
#define ERROR_FUNCTIONS_H

void errMsg(const char *format, ...);

#ifdef __GNUC__
/* Macro này ngăn 'gcc -Wall' phàn nàn rằng "control reaches end of non-void function" 
   nếu chúng ta sử dụng các hàm sau để kết thúc main() hoặc một hàm non-void khác. */
#define NORETURN __attribute__ ((__noreturn__))
#else
#define NORETURN
#endif

void errExit(const char *format, ...) NORETURN ;
void err_exit(const char *format, ...) NORETURN ;
void errExitEN(int errnum, const char *format, ...) NORETURN ;
void fatal(const char *format, ...) NORETURN ;
void usageErr(const char *format, ...) NORETURN ;
void cmdLineErr(const char *format, ...) NORETURN ;

#endif
```

Để chẩn đoán lỗi từ các system call và thư viện hàm, chúng ta sử dụng `errMsg()`, `errExit()`, `err_exit()`, và `errExitEN()`.

```c
#include "tlpi_hdr.h"

void errMsg(const char *format, ...);
void errExit(const char *format, ...);
void err_exit(const char *format, ...);
void errExitEN(int errnum, const char *format, ...);
```

Hàm `errMsg()` in một thông báo ra error chuẩn (stderr). Danh sách đối số của nó giống như đối với `printf()`, ngoại trừ việc một ký tự dòng mới kết thúc sẽ tự động được thêm vào chuỗi đầu ra. Hàm `errMsg()` in văn bản lỗi tương ứng với giá trị hiện tại của `errno` — văn bản này bao gồm tên lỗi, chẳng hạn như `EPERM`, cộng với mô tả lỗi được trả về bởi `strerror()` — theo sau là đầu ra được định dạng được chỉ định trong danh sách đối số.

Hàm `errExit()` hoạt động giống như `errMsg()`, nhưng cũng kết thúc chương trình, bằng cách gọi `exit()` hoặc, nếu biến môi trường `EF_DUMPCORE` được định nghĩa với giá trị chuỗi không rỗng, bằng cách gọi `abort()` để tạo file core dump dùng cho trình gỡ lỗi. (Chúng ta giải thích các file core dump trong Mục 22.1.)

Hàm `err_exit()` tương tự như `errExit()`, nhưng khác ở hai điểm:
* Nó không xả đệm (flush) đầu ra chuẩn trước khi in thông báo lỗi.
* Nó kết thúc tiến trình bằng cách gọi `_exit()` thay vì `exit()`. Điều này khiến tiến trình kết thúc mà không xả đệm stdio hoặc gọi các trình xử lý kết thúc (exit handlers).

Chi tiết về những điểm khác biệt này trong hoạt động của `err_exit()` sẽ trở nên rõ ràng hơn trong Chương 25, nơi chúng ta mô tả sự khác biệt giữa `_exit()` và `exit()`, và xem xét việc xử lý các đệm stdio và exit handler trong một tiến trình con được tạo bởi `fork()`. Hiện tại, chúng ta chỉ ghi nhận rằng `err_exit()` đặc biệt hữu ích nếu chúng ta viết một thư viện hàm tạo một tiến trình con cần kết thúc vì lỗi. Sự kết thúc này nên diễn ra mà không xả bản sao các đệm stdio của tiến trình cha (tức là tiến trình gọi) ở tiến trình con và không gọi các exit handler do tiến trình cha thiết lập.

Hàm `errExitEN()` giống như `errExit()`, ngoại trừ việc thay vì in văn bản lỗi tương ứng với giá trị hiện tại của `errno`, nó in văn bản tương ứng với số hiệu lỗi (do đó có hậu tố `EN`) được đưa ra trong đối số `errnum`.

Chủ yếu, chúng ta sử dụng `errExitEN()` trong các chương trình sử dụng API POSIX threads. Không giống như các system call UNIX truyền thống vốn trả về `-1` khi xảy ra lỗi, các hàm POSIX threads chẩn đoán lỗi bằng cách trả về một số hiệu lỗi (tức là một số dương thuộc loại thường được đặt trong `errno`) làm kết quả hàm của chúng. (Các hàm POSIX threads trả về 0 khi thành công.)

Chúng ta có thể chẩn đoán lỗi từ các hàm POSIX threads bằng đoạn mã như sau:

```c
errno = pthread_create(&thread, NULL, func, &arg);
if (errno != 0)
    errExit("pthread_create");
```

Tuy nhiên, cách tiếp cận này không hiệu quả vì `errno` được định nghĩa trong các chương trình luồng như một macro mở rộng thành một lời gọi hàm trả về một lvalue có thể sửa đổi. Do đó, mỗi lần sử dụng `errno` đều dẫn đến một lời gọi hàm. Hàm `errExitEN()` cho phép chúng ta viết một đoạn mã tương đương hiệu quả hơn đoạn mã trên:

```c
int s;
s = pthread_create(&thread, NULL, func, &arg);
if (s != 0)
    errExitEN(s, "pthread_create");
```

Trong thuật ngữ C, một lvalue là một biểu thức tham chiếu tới một vùng lưu trữ. Ví dụ phổ biến nhất của lvalue là một định danh cho một biến. Một số toán tử cũng tạo ra lvalue. Ví dụ, nếu `p` là một con trỏ tới một vùng lưu trữ, thì `*p` là một lvalue. Theo POSIX threads API, `errno` được định nghĩa lại thành một hàm trả về một con trỏ tới vùng lưu trữ riêng của luồng (thread-specific storage area) (xem Mục 31.3).

Để chẩn đoán các loại lỗi khác, chúng ta sử dụng `fatal()`, `usageErr()`, và `cmdLineErr()`.

```c
#include "tlpi_hdr.h"

void fatal(const char *format, ...);
void usageErr(const char *format, ...);
void cmdLineErr(const char *format, ...);
```

Hàm `fatal()` được sử dụng để chẩn đoán các lỗi chung, bao gồm cả lỗi từ các thư viện hàm không đặt `errno`. Danh sách đối số của nó giống như đối với `printf()`, ngoại trừ việc một ký tự dòng mới kết thúc sẽ tự động được thêm vào chuỗi đầu ra. Nó in đầu ra được định dạng ra stderr và sau đó kết thúc chương trình như đối với `errExit()`.

Hàm `usageErr()` được sử dụng để chẩn đoán lỗi trong việc sử dụng đối số dòng lệnh. Nó nhận một danh sách đối số theo phong cách của `printf()` và in chuỗi `Usage: ` theo sau là đầu ra được định dạng ra stderr, và sau đó kết thúc chương trình bằng cách gọi `exit()`. (Một số chương trình ví dụ trong cuốn sách này cung cấp phiên bản mở rộng của riêng chúng cho hàm `usageErr()`, dưới tên `usageError()`.)

Hàm `cmdLineErr()` tương tự như `usageErr()`, nhưng dành cho việc chẩn đoán lỗi trong các đối số dòng lệnh được chỉ định cho một chương trình.

Bản triển khai của các hàm chẩn đoán lỗi của chúng ta được hiển thị trong Mã nguồn 3-3.

**Mã nguồn 3-3:** Các hàm xử lý lỗi được sử dụng bởi tất cả các chương trình
```c
/* lib/error_functions.c */
#include <stdarg.h>
#include "error_functions.h"
#include "tlpi_hdr.h"
#include "ename.c.inc" /* Định nghĩa ename và MAX_ENAME */

#ifdef __GNUC__
__attribute__ ((__noreturn__))
#endif
static void
terminate(Boolean useExit3)
{
    char *s;
    /* Dump core nếu biến môi trường EF_DUMPCORE được định nghĩa và
       là một chuỗi không rỗng; nếu không gọi exit(3) hoặc _exit(2),
       Tùy thuộc vào giá trị của 'useExit3'. */
    s = getenv("EF_DUMPCORE");
    if (s != NULL && *s != '\0')
        abort();
    else if (useExit3)
        exit(EXIT_FAILURE);
    else
        _exit(EXIT_FAILURE);
}

static void
outputError(Boolean useErr, int err, Boolean flushStdout,
            const char *format, va_list ap)
{
#define BUF_SIZE 500
    char buf[BUF_SIZE], userMsg[BUF_SIZE], errText[BUF_SIZE];

    vsnprintf(userMsg, BUF_SIZE, format, ap);

    if (useErr)
        snprintf(errText, BUF_SIZE, " [%s %s]",
                (err > 0 && err <= MAX_ENAME) ?
                ename[err] : "?UNKNOWN?", strerror(err));
    else
        snprintf(errText, BUF_SIZE, ":");

    snprintf(buf, BUF_SIZE, "ERROR%s %s\n", errText, userMsg);

    if (flushStdout)
        fflush(stdout); /* Xả mọi stdout đang chờ */
    fputs(buf, stderr);
    fflush(stderr); /* Trong trường hợp stderr không phải là line-buffered */
}

void
errMsg(const char *format, ...)
{
    va_list argList;
    int savedErrno;

    savedErrno = errno; /* Trong trường hợp chúng ta thay đổi nó ở đây */
    va_start(argList, format);
    outputError(TRUE, errno, TRUE, format, argList);
    va_end(argList);
    errno = savedErrno;
}

void
errExit(const char *format, ...)
{
    va_list argList;

    va_start(argList, format);
    outputError(TRUE, errno, TRUE, format, argList);
    va_end(argList);
    terminate(TRUE);
}

void
err_exit(const char *format, ...)
{
    va_list argList;

    va_start(argList, format);
    outputError(TRUE, errno, FALSE, format, argList);
    va_end(argList);
    terminate(FALSE);
}

void
errExitEN(int errnum, const char *format, ...)
{
    va_list argList;

    va_start(argList, format);
    outputError(TRUE, errnum, TRUE, format, argList);
    va_end(argList);
    terminate(TRUE);
}

void
fatal(const char *format, ...)
{
    va_list argList;

    va_start(argList, format);
    outputError(FALSE, 0, TRUE, format, argList);
    va_end(argList);
    terminate(TRUE);
}

void
usageErr(const char *format, ...)
{
    va_list argList;

    fflush(stdout); /* Xả mọi stdout đang chờ */
    fprintf(stderr, "Usage: ");
    va_start(argList, format);
    vfprintf(stderr, format, argList);
    va_end(argList);

    fflush(stderr); /* Trong trường hợp stderr không phải là line-buffered */
    exit(EXIT_FAILURE);
}

void
cmdLineErr(const char *format, ...)
{
    va_list argList;

    fflush(stdout); /* Xả mọi stdout đang chờ */
    fprintf(stderr, "Command-line usage error: ");
    va_start(argList, format);
    vfprintf(stderr, format, argList);
    va_end(argList);

    fflush(stderr); /* Trong trường hợp stderr không phải là line-buffered */
    exit(EXIT_FAILURE);
}
```

File `ename.c.inc` được bao gồm bởi Mã nguồn 3-3 được hiển thị trong [Mã nguồn 3-4](#page-37-0). File này định nghĩa một mảng các chuỗi, `ename`, là các tên biểu tượng tương ứng với từng giá trị `errno` có thể có. Các hàm xử lý lỗi của chúng ta sử dụng mảng này để in ra tên biểu tượng tương ứng với một số hiệu lỗi cụ thể. Đây là một giải pháp thay thế để giải quyết thực tế là, một mặt, chuỗi được trả về bởi `strerror()` không định danh hằng số biểu tượng tương ứng với thông báo lỗi của nó, trong khi mặt khác, các trang tài liệu hướng dẫn mô tả các lỗi bằng tên biểu tượng của chúng. Việc in ra tên biểu tượng cung cấp cho chúng ta một cách dễ dàng để tra cứu nguyên nhân gây ra lỗi trong các trang tài liệu hướng dẫn.

Nội dung của file `ename.c.inc` mang tính đặc thù của kiến trúc phần cứng, bởi vì các giá trị `errno` có sự khác nhau nhất định từ kiến trúc phần cứng Linux này sang kiến trúc khác. Phiên bản được hiển thị trong [Mã nguồn 3-4](#page-37-0) dành cho hệ thống Linux 2.6/x86-32. File này được xây dựng bằng một script (`lib/Build_ename.sh`) được bao gồm trong bản phân phối mã nguồn cho cuốn sách này. Script này có thể được sử dụng để xây dựng một phiên bản `ename.c.inc` thích hợp cho một nền tảng phần cứng và phiên bản kernel cụ thể.

Lưu ý rằng một số chuỗi trong mảng `ename` bị rỗng. Những chuỗi này tương ứng với các giá trị lỗi không được sử dụng. Hơn nữa, một số chuỗi trong `ename` bao gồm hai tên lỗi được phân tách bằng dấu gạch chéo. Các chuỗi này tương ứng với các trường hợp mà hai tên lỗi biểu tượng có cùng một giá trị số.

Từ file `ename.c.inc`, chúng ta có thể thấy rằng các lỗi `EAGAIN` và `EWOULDBLOCK` có cùng một giá trị. (SUSv3 cho phép điều này một cách rõ ràng, và giá trị của các hằng số này giống nhau trên hầu hết, nhưng không phải tất cả, các hệ thống UNIX khác.) Các lỗi này được trả về bởi một system call trong các trường hợp mà nó thường sẽ bị nghẽn (block) (tức là buộc phải chờ trước khi hoàn thành), nhưng người gọi đã yêu cầu system call trả về một lỗi thay vì bị nghẽn. `EAGAIN` bắt nguồn từ System V, và nó là lỗi được trả về cho các system call thực hiện I/O, các thao tác semaphore, thao tác hàng đợi thông điệp (message queue), và khóa file (`fcntl()`). `EWOULDBLOCK` bắt nguồn từ BSD, và nó được trả về bởi khóa file (`flock()`) và các system call liên quan đến socket.

Trong SUSv3, `EWOULDBLOCK` chỉ được đề cập trong các đặc tả của các giao diện khác nhau liên quan đến socket. Đối với các giao diện này, SUSv3 cho phép trả về `EAGAIN` hoặc `EWOULDBLOCK` bởi các lời gọi không nghẽn (nonblocking). Đối với tất cả các lời gọi không nghẽn khác, chỉ có lỗi `EAGAIN` được chỉ định trong SUSv3.

<span id="page-37-0"></span> **Mã nguồn 3-4:** File `lib/ename.c.inc`
```c
/* lib/ename.c.inc */
static char *ename[] = {
    /* 0 */ "",
    /* 1 */ "EPERM", "ENOENT", "ESRCH", "EINTR", "EIO", "ENXIO", "E2BIG",
    /* 8 */ "ENOEXEC", "EBADF", "ECHILD", "EAGAIN/EWOULDBLOCK", "ENOMEM",
    /* 13 */ "EACCES", "EFAULT", "ENOTBLK", "EBUSY", "EEXIST", "EXDEV",
    /* 19 */ "ENODEV", "ENOTDIR", "EISDIR", "EINVAL", "ENFILE", "EMFILE",
    /* 25 */ "ENOTTY", "ETXTBSY", "EFBIG", "ENOSPC", "ESPIPE", "EROFS",
    /* 31 */ "EMLINK", "EPIPE", "EDOM", "ERANGE", "EDEADLK/EDEADLOCK",
    /* 36 */ "ENAMETOOLONG", "ENOLCK", "ENOSYS", "ENOTEMPTY", "ELOOP", "",
    /* 42 */ "ENOMSG", "EIDRM", "ECHRNG", "EL2NSYNC", "EL3HLT", "EL3RST",
    /* 48 */ "ELNRNG", "EUNATCH", "ENOCSI", "EL2HLT", "EBADE", "EBADR",
    /* 54 */ "EXFULL", "ENOANO", "EBADRQC", "EBADSLT", "", "EBFONT", "ENOSTR",
    /* 61 */ "ENODATA", "ETIME", "ENOSR", "ENONET", "ENOPKG", "EREMOTE",
    /* 67 */ "ENOLINK", "EADV", "ESRMNT", "ECOMM", "EPROTO", "EMULTIHOP",
    /* 73 */ "EDOTDOT", "EBADMSG", "EOVERFLOW", "ENOTUNIQ", "EBADFD",
    /* 78 */ "EREMCHG", "ELIBACC", "ELIBBAD", "ELIBSCN", "ELIBMAX",
    /* 83 */ "ELIBEXEC", "EILSEQ", "ERESTART", "ESTRPIPE", "EUSERS",
    /* 88 */ "ENOTSOCK", "EDESTADDRREQ", "EMSGSIZE", "EPROTOTYPE",
    /* 92 */ "ENOPROTOOPT", "EPROTONOSUPPORT", "ESOCKTNOSUPPORT",
    /* 95 */ "EOPNOTSUPP/ENOTSUP", "EPFNOSUPPORT", "EAFNOSUPPORT",
    /* 98 */ "EADDRINUSE", "EADDRNOTAVAIL", "ENETDOWN", "ENETUNREACH",
    /* 102 */ "ENETRESET", "ECONNABORTED", "ECONNRESET", "ENOBUFS", "EISCONN",
    /* 107 */ "ENOTCONN", "ESHUTDOWN", "ETOOMANYREFS", "ETIMEDOUT",
    /* 111 */ "ECONNREFUSED", "EHOSTDOWN", "EHOSTUNREACH", "EALREADY",
    /* 115 */ "EINPROGRESS", "ESTALE", "EUCLEAN", "ENOTNAM", "ENAVAIL",
    /* 120 */ "EISNAM", "EREMOTEIO", "EDQUOT", "ENOMEDIUM", "EMEDIUMTYPE",
    /* 125 */ "ECANCELED", "ENOKEY", "EKEYEXPIRED", "EKEYREVOKED",
    /* 129 */ "EKEYREJECTED", "EOWNERDEAD", "ENOTRECOVERABLE", "ERFKILL"
};

#define MAX_ENAME 132
```

#### Các hàm phân tích đối số dòng lệnh dạng số

File header trong [Mã nguồn 3-5](#page-38-0) cung cấp khai báo cho hai hàm mà chúng ta thường xuyên sử dụng để phân tích các đối số dòng lệnh dạng số nguyên: `getInt()` và `getLong()`. Ưu điểm chính của việc sử dụng các hàm này thay vì `atoi()`, `atol()`, và `strtol()` là chúng cung cấp một số kiểm tra tính hợp lệ cơ bản cho các đối số dạng số.

```c
#include "tlpi_hdr.h"

int getInt(const char *arg, int flags, const char *name);
long getLong(const char *arg, int flags, const char *name);
                                     // Cả hai đều trả về arg chuyển đổi sang dạng số
```

Các hàm `getInt()` và `getLong()` chuyển đổi chuỗi được trỏ bởi `arg` thành kiểu `int` hoặc `long` tương ứng. Nếu `arg` không chứa một chuỗi số nguyên hợp lệ (tức là chỉ có các chữ số và các ký tự `+` và `-`), thì các hàm này sẽ in một thông báo lỗi và kết thúc chương trình.

Nếu đối số `name` khác `NULL`, nó nên chứa một chuỗi định danh đối số trong `arg`. Chuỗi này được bao gồm như một phần của bất kỳ thông báo lỗi nào được hiển thị bởi các hàm này.

Đối số `flags` cung cấp một số kiểm soát đối với hoạt động của các hàm `getInt()` và `getLong()`. Theo mặc định, các hàm này mong đợi các chuỗi chứa các số nguyên thập phân có dấu. Bằng cách thực hiện OR phép bit (`|`) một hoặc nhiều hằng số `GN_*` được định nghĩa trong [Mã nguồn 3-5](#page-38-0) vào `flags`, chúng ta có thể chọn các cơ số (bases) thay thế cho việc chuyển đổi và giới hạn dải số thành không âm hoặc lớn hơn 0.

Bản triển khai của các hàm `getInt()` và `getLong()` được cung cấp trong [Mã nguồn 3-6](#page-38-1).

Mặc dù đối số `flags` cho phép chúng ta thực thi các kiểm tra dải số được mô tả trong văn bản chính, trong một số trường hợp, chúng ta không yêu cầu các kiểm tra như vậy trong các chương trình ví dụ của mình, mặc dù điều đó có vẻ hợp lý. Ví dụ, trong Mã nguồn 47-1, chúng ta không kiểm tra đối số `init-value`. Điều này có nghĩa là người dùng có thể chỉ định một số âm làm giá trị ban đầu cho một semaphore, vốn sẽ dẫn đến một lỗi (`ERANGE`) trong system call `semctl()` tiếp theo, vì một semaphore không thể có giá trị âm. Việc bỏ qua các kiểm tra dải số trong những trường hợp như vậy cho phép chúng ta thử nghiệm không chỉ việc sử dụng đúng các system call và thư viện hàm, mà còn thấy điều gì xảy ra khi các đối số không hợp lệ được cung cấp. Các ứng dụng thực tế thường sẽ áp dụng các kiểm tra mạnh mẽ hơn đối với các đối số dòng lệnh của chúng.

<span id="page-38-0"></span> **Mã nguồn 3-5:** File header cho `get_num.c`
```c
/* lib/get_num.h */
#ifndef GET_NUM_H
#define GET_NUM_H

#define GN_NONNEG 01 /* Giá trị phải >= 0 */
#define GN_GT_0 02   /* Giá trị phải > 0 */

 /* Mặc định, số nguyên là thập phân */
#define GN_ANY_BASE 0100 /* Có thể dùng bất kỳ cơ số nào - giống strtol(3) */
#define GN_BASE_8 0200   /* Giá trị được biểu diễn ở hệ bát phân */
#define GN_BASE_16 0400  /* Giá trị được biểu diễn ở hệ thập lục phân */

long getLong(const char *arg, int flags, const char *name);
int getInt(const char *arg, int flags, const char *name);

#endif
```

<span id="page-38-1"></span> **Mã nguồn 3-6:** Các hàm phân tích đối số dòng lệnh dạng số
```c
/* lib/get_num.c */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <errno.h>
#include "get_num.h"

static void
gnFail(const char *fname, const char *msg, const char *arg, const char *name)
{
    fprintf(stderr, "%s error", fname);
    if (name != NULL)
        fprintf(stderr, " (in %s)", name);
    fprintf(stderr, ": %s\n", msg);
    if (arg != NULL && *arg != '\0')
        fprintf(stderr, " offending text: %s\n", arg);
    exit(EXIT_FAILURE);
}

static long
getNum(const char *fname, const char *arg, int flags, const char *name)
{
    long res;
    char *endptr;
    int base;

    if (arg == NULL || *arg == '\0')
        gnFail(fname, "null or empty string", arg, name);

    base = (flags & GN_ANY_BASE) ? 0 : (flags & GN_BASE_8) ? 8 :
           (flags & GN_BASE_16) ? 16 : 10;

    errno = 0;
    res = strtol(arg, &endptr, base);
    if (errno != 0)
        gnFail(fname, "strtol() failed", arg, name);

    if (*endptr != '\0')
        gnFail(fname, "nonnumeric characters", arg, name);

    if ((flags & GN_NONNEG) && res < 0)
        gnFail(fname, "negative value not allowed", arg, name);

    if ((flags & GN_GT_0) && res <= 0)
        gnFail(fname, "value must be > 0", arg, name);

    return res;
}

long
getLong(const char *arg, int flags, const char *name)
{
    return getNum("getLong", arg, flags, name);
}

int
getInt(const char *arg, int flags, const char *name)
{
    long res;

    res = getNum("getInt", arg, flags, name);
    if (res > INT_MAX || res < INT_MIN)
        gnFail("getInt", "integer out of range", arg, name);

    return (int) res;
}
```


## 3.6 Các vấn đề về tính di động

Trong mục này, chúng ta xem xét chủ đề viết các chương trình hệ thống có tính di động (portable system programs). Chúng ta giới thiệu các macro thử nghiệm tính năng (feature test macros) và các kiểu dữ liệu hệ thống chuẩn do SUSv3 định nghĩa, sau đó xem xét một số vấn đề về tính di động khác.

### 3.6.1 Feature Test Macros

Các tiêu chuẩn khác nhau chi phối hành vi của các API system call và thư viện hàm (xem Mục 1.3). Một số tiêu chuẩn này được định nghĩa bởi các tổ chức tiêu chuẩn như The Open Group (Single UNIX Specification), trong khi các tiêu chuẩn khác được định nghĩa bởi hai bản thực thi UNIX quan trọng về mặt lịch sử: BSD và System V Release 4 (và System V Interface Definition liên quan).

Đôi khi, khi viết một ứng dụng có tính di động, chúng ta có thể muốn các file header khác nhau chỉ hiển thị các định nghĩa (hằng số, mẫu hàm, v.v.) tuân theo một tiêu chuẩn cụ thể. Để làm điều này, chúng ta định nghĩa một hoặc nhiều macro thử nghiệm tính năng được liệt kê dưới đây khi biên dịch chương trình. Một cách chúng ta có thể làm điều này là định nghĩa macro trong mã nguồn chương trình trước khi bao gồm bất kỳ file header nào:

```c
#define _BSD_SOURCE 1
```

Hoặc, chúng ta có thể sử dụng tùy chọn `-D` cho C compiler:

```
$ cc -D_BSD_SOURCE prog.c
```

Thuật ngữ macro thử nghiệm tính năng (feature test macro) có thể gây nhầm lẫn, nhưng nó có ý nghĩa nếu chúng ta nhìn nhận từ góc độ của bản thực thi. Bản thực thi quyết định tính năng nào có sẵn trong mỗi header nó nên hiển thị, bằng cách kiểm tra (với `#if`) những giá trị nào ứng dụng đã định nghĩa cho các macro này.

Các macro thử nghiệm tính năng sau được chỉ định bởi các tiêu chuẩn liên quan, và do đó việc sử dụng chúng là di động đối với tất cả các hệ thống hỗ trợ các tiêu chuẩn này:

`_POSIX_SOURCE`
Nếu được định nghĩa (với bất kỳ giá trị nào), hiển thị các định nghĩa tuân thủ POSIX.1-1990 và ISO C (1990). Macro này bị thay thế bởi `_POSIX_C_SOURCE`.

`_POSIX_C_SOURCE`
Nếu được định nghĩa với giá trị 1, điều này có tác dụng tương tự như `_POSIX_SOURCE`. Nếu được định nghĩa với giá trị lớn hơn hoặc bằng 199309, cũng hiển thị các định nghĩa cho POSIX.1b (realtime). Nếu được định nghĩa với giá trị lớn hơn hoặc bằng 199506, cũng hiển thị các định nghĩa cho POSIX.1c (threads). Nếu được định nghĩa với giá trị 200112, cũng hiển thị các định nghĩa cho đặc tả cơ sở POSIX.1-2001 (tức là phần mở rộng XSI bị loại trừ). (Trước phiên bản 2.3.3, các header glibc không giải thích giá trị 200112 cho `_POSIX_C_SOURCE`.) Nếu được định nghĩa với giá trị 200809, cũng hiển thị các định nghĩa cho đặc tả cơ sở POSIX.1-2008. (Trước phiên bản 2.10, các header glibc không giải thích giá trị 200809 cho `_POSIX_C_SOURCE`.)

#### _XOPEN_SOURCE
Nếu được định nghĩa (với bất kỳ giá trị nào), hiển thị các định nghĩa POSIX.1, POSIX.2, và X/Open (XPG4). Nếu được định nghĩa với giá trị 500 hoặc lớn hơn, cũng hiển thị các phần mở rộng SUSv2 (UNIX 98 và XPG5). Thiết lập thành 600 hoặc lớn hơn sẽ hiển thị thêm các phần mở rộng SUSv3 XSI (UNIX 03) và C99. (Trước phiên bản 2.2, các header glibc không giải thích giá trị 600 cho `_XOPEN_SOURCE`.) Thiết lập thành 700 hoặc lớn hơn cũng hiển thị các phần mở rộng SUSv4 XSI. (Trước phiên bản 2.10, các header glibc không giải thích giá trị 700 cho `_XOPEN_SOURCE`.) Các giá trị 500, 600, và 700 cho `_XOPEN_SOURCE` được chọn vì SUSv2, SUSv3, và SUSv4 tương ứng là các Issue 5, 6, và 7 của các đặc tả X/Open.

Các macro thử nghiệm tính năng được liệt kê sau đây là đặc thù của glibc:

#### _BSD_SOURCE
Nếu được định nghĩa (với bất kỳ giá trị nào), hiển thị các định nghĩa BSD. Việc định nghĩa macro này cũng định nghĩa `_POSIX_C_SOURCE` với giá trị 199506. Việc thiết lập rõ ràng chỉ macro này khiến các định nghĩa BSD được ưu tiên trong một số ít trường hợp có xung đột tiêu chuẩn.

#### _SVID_SOURCE
Nếu được định nghĩa (với bất kỳ giá trị nào), hiển thị các định nghĩa System V Interface Definition (SVID).

#### _GNU_SOURCE
Nếu được định nghĩa (với bất kỳ giá trị nào), hiển thị tất cả các định nghĩa được cung cấp bằng cách thiết lập tất cả các macro trước đó, cũng như các phần mở rộng GNU khác nhau.

Khi GNU C compiler được gọi mà không có tùy chọn đặc biệt, `_POSIX_SOURCE`, `_POSIX_C_SOURCE=200809` (200112 với các phiên bản glibc 2.5 đến 2.9, hoặc 199506 với các phiên bản glibc sớm hơn 2.4), `_BSD_SOURCE`, và `_SVID_SOURCE` được định nghĩa theo mặc định.

Nếu các macro riêng lẻ được định nghĩa, hoặc compiler được gọi ở một trong các chế độ chuẩn của nó (ví dụ: `cc -ansi` hoặc `cc -std=c99`), thì chỉ các định nghĩa được yêu cầu mới được cung cấp. Có một ngoại lệ: nếu `_POSIX_C_SOURCE` không được định nghĩa theo cách khác, và compiler không được gọi ở một trong các chế độ chuẩn của nó, thì `_POSIX_C_SOURCE` được định nghĩa với giá trị 200809 (200112 với các phiên bản glibc 2.4 đến 2.9, hoặc 199506 với các phiên bản glibc sớm hơn 2.4).

Việc định nghĩa nhiều macro mang tính tích lũy (additive), do đó chúng ta có thể, ví dụ, sử dụng lệnh `cc` sau để chọn rõ ràng các thiết lập macro tương tự như được cung cấp theo mặc định:

```
$ cc -D_POSIX_SOURCE -D_POSIX_C_SOURCE=199506 \
  -D_BSD_SOURCE -D_SVID_SOURCE prog.c
```

File header `<features.h>` và trang tài liệu hướng dẫn `feature_test_macros(7)` cung cấp thêm thông tin chính xác về những giá trị nào được gán cho từng macro thử nghiệm tính năng.

#### _POSIX_C_SOURCE, _XOPEN_SOURCE, và POSIX.1/SUS

Chỉ các macro thử nghiệm tính năng `_POSIX_C_SOURCE` và `_XOPEN_SOURCE` được chỉ định trong POSIX.1-2001/SUSv3, vốn yêu cầu các macro này phải được định nghĩa với các giá trị tương ứng là 200112 và 600 trong các ứng dụng tuân thủ. Việc định nghĩa `_POSIX_C_SOURCE` là 200112 cung cấp sự tuân thủ đối với đặc tả cơ sở POSIX.1-2001 (tức là tuân thủ POSIX, không bao gồm phần mở rộng XSI). Việc định nghĩa `_XOPEN_SOURCE` là 600 cung cấp sự tuân thủ đối với SUSv3 (tức là tuân thủ XSI, đặc tả cơ sở cộng với phần mở rộng XSI). Các phát biểu tương tự cũng áp dụng cho POSIX.1-2008/SUSv4, vốn yêu cầu hai macro phải được định nghĩa với các giá trị 200809 và 700.

SUSv3 chỉ định rằng việc thiết lập `_XOPEN_SOURCE` thành 600 sẽ cung cấp tất cả các tính năng được bật nếu `_POSIX_C_SOURCE` được đặt thành 200112. Do đó, một ứng dụng chỉ cần định nghĩa `_XOPEN_SOURCE` cho sự tuân thủ SUSv3 (tức là XSI). SUSv4 đưa ra đặc tả tương tự rằng việc thiết lập `_XOPEN_SOURCE` thành 700 sẽ cung cấp tất cả các tính năng được bật nếu `_POSIX_C_SOURCE` được đặt thành 200809.

#### Macro thử nghiệm tính năng trong các mẫu hàm và ví dụ mã nguồn

Các trang tài liệu hướng dẫn mô tả (các) macro thử nghiệm tính năng nào phải được định nghĩa để làm cho một định nghĩa hằng số hoặc khai báo hàm cụ thể hiển thị từ một file header.

Tất cả các ví dụ mã nguồn trong cuốn sách này được viết để chúng có thể biên dịch bằng cách sử dụng các tùy chọn GNU C compiler mặc định hoặc các tùy chọn sau:

```
$ cc -std=c99 -D_XOPEN_SOURCE=600
```

Mẫu của mỗi hàm được hiển thị trong cuốn sách này chỉ ra bất kỳ macro thử nghiệm tính năng nào phải được định nghĩa để sử dụng hàm đó trong một chương trình được biên dịch với tùy chọn compiler mặc định hoặc tùy chọn trong lệnh `cc` vừa hiển thị. Các trang tài liệu hướng dẫn cung cấp mô tả chính xác hơn về (các) macro thử nghiệm tính năng được yêu cầu để hiển thị khai báo của từng hàm.

### 3.6.2 Kiểu dữ liệu hệ thống

<span id="page-42-0"></span>Các kiểu dữ liệu triển khai khác nhau được biểu diễn bằng các kiểu C chuẩn, ví dụ: process ID, user ID, và file offset. Mặc dù có thể sử dụng các kiểu dữ liệu cơ bản của C như `int` và `long` để khai báo các biến lưu trữ thông tin đó, điều này làm giảm tính di động trên các hệ thống UNIX, vì các lý do sau:

* Kích thước của các kiểu cơ bản này khác nhau giữa các bản thực thi UNIX (ví dụ: `long` có thể là 4 byte trên một hệ thống và 8 byte trên một hệ thống khác), hoặc thậm chí trong các môi trường biên dịch khác nhau trên cùng một bản thực thi. Hơn nữa, các bản thực thi khác nhau có thể sử dụng các kiểu khác nhau để biểu diễn cùng một thông tin. Ví dụ, một process ID có thể là một `int` trên một hệ thống nhưng là một `long` trên một hệ thống khác.
* Ngay cả trên một bản thực thi UNIX duy nhất, các kiểu được sử dụng để biểu diễn thông tin có thể khác nhau giữa các bản phát hành của bản thực thi đó. Các ví dụ đáng chú ý trên Linux là user ID và group ID. Trên Linux 2.2 và sớm hơn, các giá trị này được biểu diễn trong 16 bit. Trên Linux 2.4 và muộn hơn, chúng là các giá trị 32 bit.

Để tránh các vấn đề về tính di động như vậy, SUSv3 chỉ định các kiểu dữ liệu hệ thống chuẩn khác nhau, và yêu cầu một bản thực thi phải định nghĩa và sử dụng các kiểu này một cách thích hợp. Mỗi kiểu dữ liệu này được định nghĩa bằng tính năng `typedef` của C. Ví dụ, kiểu dữ liệu `pid_t` dành cho việc biểu diễn các process ID, và trên Linux/x86-32 kiểu này được định nghĩa như sau:

```c
typedef int pid_t;
```

Hầu hết các kiểu dữ liệu hệ thống chuẩn có tên kết thúc bằng `_t`. Nhiều kiểu trong số đó được khai báo trong file header `<sys/types.h>`, mặc dù một số ít được định nghĩa trong các file header khác.

Một ứng dụng nên sử dụng các định nghĩa kiểu này để khai báo các biến mà nó sử dụng một cách di động. Ví dụ, khai báo sau sẽ cho phép một ứng dụng biểu diễn chính xác các process ID trên bất kỳ hệ thống nào tuân thủ SUSv3:

```c
pid_t mypid;
```

Bảng 3-1 liệt kê một số kiểu dữ liệu hệ thống mà chúng ta sẽ gặp trong cuốn sách này. Đối với một số kiểu nhất định trong bảng này, SUSv3 yêu cầu kiểu đó phải được triển khai dưới dạng một kiểu số học (arithmetic type). Điều này có nghĩa là bản thực thi có thể chọn kiểu bên dưới là số nguyên hoặc số thực phẩy động (real or complex).

**Table 3-1:** Selected system data types

| Data type | SUSv3 type requirement | Description |
| ------ | ------ | ------ |
| `blkcnt_t` | signed integer | File block count (Mục 15.1) |
| `blksize_t` | signed integer | File block size (Mục 15.1) |
| `cc_t` | unsigned integer | Terminal special character (Mục 62.4) |
| `clock_t` | integer or real-floating | System time in clock ticks (Mục 10.7) |
| `clockid_t` | an arithmetic type | Clock identifier for POSIX.1b clock and timer functions (Mục 23.6) |
| `comp_t` | not in SUSv3 | Compressed clock ticks (Mục 28.1) |
| `dev_t` | an arithmetic type | Device number, consisting of major and minor numbers (Mục 15.1) |
| `DIR` | no type requirement | Directory stream (Mục 18.8) |
| `fd_set` | structure type | File descriptor set for `select()` (Mục 63.2.1) |
| `fsblkcnt_t` | unsigned integer | File-system block count (Mục 14.11) |
| `fsfilcnt_t` | unsigned integer | File count (Mục 14.11) |
| `gid_t` | integer | Numeric group identifier (Mục 8.3) |
| `id_t` | integer | Generic type for holding identifiers; large enough to hold at least `pid_t`, `uid_t`, and `gid_t` |
| `in_addr_t` | 32-bit unsigned integer | IPv4 address (Mục 59.4) |
| `in_port_t` | 16-bit unsigned integer | IP port number (Mục 59.4) |
| `ino_t` | unsigned integer | File i-node number (Mục 15.1) |
| `key_t` | an arithmetic type | System V IPC key (Mục 45.2) |
| `mode_t` | integer | File permissions and type (Mục 15.1) |
| `mqd_t` | no type requirement, but shall not be an array type | POSIX message queue descriptor |
| `msglen_t` | unsigned integer | Number of bytes allowed in System V message queue (Mục 46.4) |
| `msgqnum_t` | unsigned integer | Counts of messages in System V message queue (Mục 46.4) |
| `nfds_t` | unsigned integer | Number of file descriptors for `poll()` (Mục 63.2.2) |
| `nlink_t` | integer | Count of (hard) links to a file (Mục 15.1) |
| `off_t` | signed integer | File offset or size (Mục 4.7 và 15.1) |
| `pid_t` | signed integer | Process ID, process group ID, or session ID (Mục 6.2, 34.2, và 34.3) |
| `ptrdiff_t` | signed integer | Difference between two pointer values, as a signed integer |
| `rlim_t` | unsigned integer | Resource limit (Mục 36.2) |
| `sa_family_t` | unsigned integer | Socket address family (Mục 56.4) |
| `shmatt_t` | unsigned integer | Count of attached processes for a System V shared memory segment (Mục 48.8) |
| `sig_atomic_t` | integer | Data type that can be atomically accessed (Mục 21.1.3) |
| `siginfo_t` | structure type | Information about the origin of a signal (Mục 21.4) |
| `sigset_t` | integer or structure type | Signal set (Mục 20.9) |
| `size_t` | unsigned integer | Size of an object in bytes |
| `socklen_t` | integer type of at least 32 bits | Size of a socket address structure in bytes (Mục 56.3) |
| `speed_t` | unsigned integer | Terminal line speed (Mục 62.7) |
| `ssize_t` | signed integer | Byte count or (negative) error indication |
| `stack_t` | structure type | Description of an alternate signal stack (Mục 21.3) |
| `suseconds_t` | signed integer allowing range [–1, 1000000] | Microsecond time interval (Mục 10.1) |
| `tcflag_t` | unsigned integer | Terminal mode flag bit mask (Mục 62.2) |
| `time_t` | integer or real-floating | Calendar time in seconds since the Epoch (Mục 10.1) |
| `timer_t` | an arithmetic type | Timer identifier for POSIX.1b interval timer functions (Mục 23.6) |
| `uid_t` | integer | Numeric user identifier (Mục 8.1) |

Khi thảo luận về các kiểu dữ liệu trong Bảng 3-1 ở các chương sau, chúng ta sẽ thường đưa ra các phát biểu rằng một số kiểu "là một kiểu số nguyên [được chỉ định bởi SUSv3]." Điều này có nghĩa là SUSv3 yêu cầu kiểu đó phải được định nghĩa là số nguyên, nhưng không yêu cầu một kiểu số nguyên bản địa cụ thể (ví dụ: `short`, `int`, hoặc `long`) phải được sử dụng. (Thường thì chúng ta sẽ không nói kiểu dữ liệu bản địa cụ thể nào thực sự được sử dụng để biểu diễn từng kiểu dữ liệu hệ thống trong Linux, vì một ứng dụng di động nên được viết sao cho nó không cần quan tâm đến kiểu dữ liệu nào được sử dụng.)

#### In các giá trị kiểu dữ liệu hệ thống

Khi in giá trị của một trong các kiểu dữ liệu hệ thống dạng số được hiển thị trong Bảng 3-1 (ví dụ: `pid_t` và `uid_t`), chúng ta phải cẩn thận không đưa sự phụ thuộc vào cách biểu diễn vào lời gọi `printf()`. Sự phụ thuộc vào cách biểu diễn có thể xảy ra vì quy tắc thăng cấp đối số của C chuyển đổi các giá trị kiểu `short` thành `int`, nhưng giữ nguyên các giá trị kiểu `int` và `long`. Điều này có nghĩa là, tùy thuộc vào định nghĩa của kiểu dữ liệu hệ thống, một kiểu `int` hoặc `long` sẽ được truyền trong lời gọi `printf()`. Tuy nhiên, vì `printf()` không có cách nào xác định kiểu đối số của nó tại thời điểm chạy, người gọi phải cung cấp rõ ràng thông tin này bằng cách sử dụng định dạng specifier `%d` hoặc `%ld`. Vấn đề là việc chỉ viết mã một trong các định dạng specifier này trong lời gọi `printf()` tạo ra một sự phụ thuộc vào bản thực thi. Giải pháp thông thường là sử dụng định dạng specifier `%ld` và luôn ép kiểu giá trị tương ứng thành `long`, như thế này:

```c
pid_t mypid;
mypid = getpid(); /* Trả về process ID của tiến trình gọi */
printf("My PID is %ld\n", (long) mypid);
```

Chúng ta đưa ra một ngoại lệ cho kỹ thuật trên. Vì kiểu dữ liệu `off_t` có kích thước của `long long` trong một số môi trường biên dịch, chúng ta ép kiểu các giá trị `off_t` thành kiểu này và sử dụng định dạng specifier `%lld`, như được mô tả trong [Mục 5.10](#page-83-0).

Tiêu chuẩn C99 định nghĩa modifier độ dài `z` cho `printf()`, để chỉ ra rằng phép chuyển đổi số nguyên tiếp theo tương ứng với kiểu `size_t` hoặc `ssize_t`. Do đó, chúng ta có thể viết `%zd` thay vì sử dụng `%ld` cộng với ép kiểu cho các kiểu này. Mặc dù định dạng specifier này có sẵn trong glibc, chúng ta tránh nó vì nó không có sẵn trên tất cả các bản thực thi UNIX.

Tiêu chuẩn C99 cũng định nghĩa modifier độ dài `j`, chỉ định rằng đối số tương ứng thuộc kiểu `intmax_t` (hoặc `uintmax_t`), một kiểu số nguyên đảm bảo đủ lớn để có thể biểu diễn một số nguyên thuộc bất kỳ kiểu nào. Cuối cùng, việc sử dụng ép kiểu `(intmax_t)` cộng với định dạng specifier `%jd` nên thay thế cho ép kiểu `(long)` cộng với định dạng specifier `%ld` làm cách tốt nhất để in các giá trị kiểu dữ liệu hệ thống dạng số, vì cách tiếp cận trước cũng xử lý các giá trị `long long` và bất kỳ kiểu số nguyên mở rộng nào chẳng hạn như `int128_t`. Tuy nhiên, (một lần nữa) chúng ta tránh kỹ thuật này vì nó không thể thực hiện được trên tất cả các bản thực thi UNIX.

### 3.6.3 Các vấn đề di động khác

Trong mục này, chúng ta xem xét một vài vấn đề di động khác mà chúng ta có thể gặp phải khi viết các chương trình hệ thống.

#### Khởi tạo và sử dụng các cấu trúc

Mỗi bản thực thi UNIX chỉ định một loạt các cấu trúc chuẩn được sử dụng trong các system call và thư viện hàm khác nhau. Như một ví dụ, hãy xem xét cấu trúc `sembuf`, vốn được sử dụng để biểu diễn một thao tác semaphore sẽ được thực hiện bởi system call `semop()`:

```c
struct sembuf {
    unsigned short sem_num; /* Số hiệu semaphore */
    short sem_op;           /* Thao tác cần thực hiện */
    short sem_flg;          /* Cờ thao tác */
};
```

Mặc dù SUSv3 chỉ định các cấu trúc như `sembuf`, điều quan trọng là phải nhận ra những điều sau:
* Nói chung, thứ tự các định nghĩa trường trong các cấu trúc như vậy không được chỉ định.
* Trong một số trường hợp, các trường đặc thù của bản thực thi bổ sung có thể được đưa vào trong các cấu trúc đó.

Do đó, việc sử dụng một bộ khởi tạo cấu trúc như sau là không di động:

```c
struct sembuf s = { 3, -1, SEM_UNDO };
```

Mặc dù bộ khởi tạo này sẽ hoạt động trên Linux, nó sẽ không hoạt động trên một bản thực thi khác nơi các trường trong cấu trúc `sembuf` được định nghĩa theo một thứ tự khác. Để khởi tạo các cấu trúc như vậy một cách di động, chúng ta phải sử dụng các câu lệnh gán rõ ràng, như trong đoạn mã sau:

```c
struct sembuf s;
s.sem_num = 3;
s.sem_op = -1;
s.sem_flg = SEM_UNDO;
```

Nếu chúng ta đang sử dụng C99, thì chúng ta có thể áp dụng cú pháp mới của ngôn ngữ đó cho các bộ khởi tạo cấu trúc (designated initializers) để viết một khởi tạo tương đương:

```c
struct sembuf s = { .sem_num = 3, .sem_op = -1, .sem_flg = SEM_UNDO };
```

Các xem xét về thứ tự của các thành viên trong các cấu trúc chuẩn cũng áp dụng nếu chúng ta muốn ghi nội dung của một cấu trúc chuẩn ra một file. Để làm điều này một cách di động, chúng ta không thể chỉ đơn giản thực hiện ghi nhị phân cấu trúc đó. Thay vào đó, các trường cấu trúc phải được ghi riêng lẻ (có lẽ dưới dạng văn bản) theo một thứ tự được chỉ định.

#### Sử dụng các macro có thể không có mặt trên tất cả các bản thực thi

Trong một số trường hợp, một macro có thể không được định nghĩa trên tất cả các bản thực thi UNIX. Ví dụ, macro `WCOREDUMP()` (vốn kiểm tra xem một tiến trình con có tạo file core dump hay không) có sẵn rộng rãi, nhưng nó không được chỉ định trong SUSv3. Do đó, macro này có thể không có mặt trên một số bản thực thi UNIX. Để có thể di động, chúng ta có thể sử dụng câu lệnh `#ifdef` để kiểm tra xem macro có được định nghĩa hay không trước khi sử dụng nó:

```c
#ifdef WCOREDUMP
    /* Sử dụng macro WCOREDUMP() */
#endif
```

#### Sự biến đổi trong các file header được yêu cầu giữa các bản thực thi

Trong một số trường hợp, các file header được yêu cầu để khai báo mẫu cho các system call và thư viện hàm khác nhau có sự biến đổi giữa các bản thực thi UNIX. Trong cuốn sách này, chúng ta hiển thị các yêu cầu trên Linux và ghi chú bất kỳ sự biến đổi nào so với SUSv3.

Một số tóm tắt hàm (synopsis) trong cuốn sách này hiển thị một file header cụ thể với chú thích đi kèm `/* For portability */`. Điều này chỉ ra rằng file header đó không được yêu cầu trên Linux hoặc bởi SUSv3, nhưng vì một số bản thực thi khác (đặc biệt là cũ hơn) có thể yêu cầu nó, chúng ta nên bao gồm nó trong các chương trình di động.

Đối với nhiều hàm mà nó chỉ định, POSIX.1-1990 yêu cầu rằng file header `<sys/types.h>` phải được bao gồm trước bất kỳ file header nào khác liên quan đến hàm đó. Tuy nhiên, yêu cầu này là dư thừa, vì hầu hết các bản thực thi UNIX đương đại không yêu cầu các ứng dụng bao gồm file header này cho các hàm đó. Do đó, SUSv1 đã xóa bỏ yêu cầu này. Mặc dù vậy, khi viết các chương trình di động, khôn ngoan là nên làm cho file này trở thành một trong những file header đầu tiên được bao gồm. (Tuy nhiên, chúng ta bỏ qua file header này khỏi các chương trình ví dụ của mình vì nó không được yêu cầu trên Linux và việc bỏ qua nó cho phép chúng ta làm cho các chương trình ví dụ ngắn hơn một dòng.)


## 3.7 Tóm tắt

System call cho phép các tiến trình yêu cầu dịch vụ từ kernel. Ngay cả các system call đơn giản nhất cũng có chi phí bổ sung đáng kể so với một lời gọi hàm trong user space, vì hệ thống phải tạm thời chuyển sang kernel mode để thực thi system call, và kernel phải kiểm tra tính hợp lệ của các đối số system call và truyền dữ liệu giữa bộ nhớ người dùng và bộ nhớ kernel.

Thư viện C chuẩn cung cấp một lượng lớn các thư viện hàm thực hiện nhiều tác vụ đa dạng. Một số thư viện hàm sử dụng system call để thực hiện công việc của chúng; những thư viện khác thực hiện các tác vụ hoàn toàn trong user space. Trên Linux, bản triển khai thư viện C chuẩn thông thường được sử dụng là glibc.

Hầu hết các system call và thư viện hàm đều trả về một trạng thái cho biết lời gọi thành công hay thất bại. Các trạng thái trả về như vậy luôn luôn nên được kiểm tra.

Chúng ta đã giới thiệu một số hàm do chúng ta triển khai để sử dụng trong các chương trình ví dụ trong cuốn sách này. Các tác vụ được thực hiện bởi các hàm này bao gồm chẩn đoán lỗi và phân tích các đối số dòng lệnh.

Chúng ta đã thảo luận về các hướng dẫn và kỹ thuật khác nhau có thể giúp chúng ta viết các chương trình hệ thống có tính di động chạy trên bất kỳ hệ thống nào tuân thủ tiêu chuẩn.

Khi biên dịch một ứng dụng, chúng ta có thể định nghĩa các macro thử nghiệm tính năng khác nhau nhằm kiểm soát các định nghĩa được hiển thị bởi các file header. Điều này hữu ích nếu chúng ta muốn đảm bảo rằng một chương trình tuân thủ một tiêu chuẩn chính thức hoặc do bản thực thi định nghĩa.

Chúng ta có thể cải thiện tính di động của các chương trình hệ thống bằng cách sử dụng các kiểu dữ liệu hệ thống được định nghĩa trong các tiêu chuẩn khác nhau, thay vì các kiểu C bản địa. SUSv3 chỉ định một loạt các kiểu dữ liệu hệ thống mà một bản thực thi nên hỗ trợ và một ứng dụng nên sử dụng.

## 3.8 Bài tập

**3-1.** Khi sử dụng system call `reboot()` đặc thù của Linux để khởi động lại hệ thống, đối số thứ hai, `magic2`, phải được chỉ định là một trong một tập hợp các số kỳ diệu (magic numbers) (ví dụ: `LINUX_REBOOT_MAGIC2`). Ý nghĩa của các số này là gì? (Chuyển đổi chúng sang hệ thập lục phân sẽ cung cấp một gợi ý.)
