<a id="_idParaDest-153"></a>

# Chương 11: System Call và Kernel (System Calls and Kernels)

Trong chương trước, chúng ta đã thảo luận về lịch sử của Unix và architecture onion-like của nó. Chúng ta cũng đã giới thiệu và nói về các chuẩn POSIX và SUS chi phối vòng shell trong Unix, trước khi giải thích thư viện chuẩn C có mặt ở đó như thế nào để cung cấp các chức năng chung được một hệ thống Unix-compliant phơi ra.

Trong chương này, chúng ta sẽ tiếp tục thảo luận về *system call interface* và Unix *kernel*. Điều này sẽ cho chúng ta một cái nhìn hoàn chỉnh về cách một hệ thống Unix hoạt động.

Sau khi đọc chương này, bạn sẽ có thể phân tích các system call mà một chương trình gọi, bạn sẽ có thể giải thích process sống và phát triển như thế nào bên trong môi trường Unix, và bạn cũng sẽ có thể dùng system call trực tiếp hoặc thông qua libc. Chúng ta cũng sẽ nói về việc phát triển Unix kernel và cho bạn thấy cách bạn có thể thêm một system call mới vào Linux kernel và cách nó có thể được gọi từ vòng shell.

Trong phần cuối của chương này, chúng ta sẽ nói về các kernel *monolithic* và *microkernel* và chúng khác nhau như thế nào. Chúng ta sẽ giới thiệu Linux kernel như một monolithic kernel, và chúng ta sẽ viết một *kernel module* cho nó có thể được nạp và gỡ một cách động.

Hãy bắt đầu chương này bằng việc nói về system call.

<a id="_idParaDest-154"></a>

## System call

Trong chương trước, chúng tôi đã giải thích ngắn gọn system call là gì. Trong phần này, chúng tôi muốn xem xét sâu hơn và <a id="_idIndexMarker774"></a>giải thích cơ chế được dùng đằng sau system call để chuyển việc thực thi từ một user process sang kernel process.

Tuy nhiên, trước khi làm điều đó, chúng tôi cần giải thích thêm một chút về cả kernel space lẫn user space, vì điều này sẽ có lợi cho việc hiểu system call hoạt động như thế nào ở phía sau hậu trường. Chúng ta cũng sẽ viết một system call đơn giản để có được một số ý niệm về việc phát triển kernel.

Những gì chúng ta sắp làm là then chốt nếu bạn muốn có thể viết một system call mới khi bạn định thêm một chức năng mới vào kernel vốn chưa có trước đó. Nó cũng cho bạn hiểu rõ hơn về kernel space và nó khác với user space như thế nào bởi vì, trên thực tế, chúng rất khác nhau.

<a id="_idParaDest-155"></a>

### System call dưới kính hiển vi

Như chúng ta đã thảo luận trong chương trước, một sự phân tách xảy ra khi đi từ vòng shell vào vòng kernel. Bạn thấy rằng bất cứ thứ gì nằm trong hai vòng đầu tiên, user application và shell, đều thuộc về user space. Tương tự, bất cứ thứ gì xuất hiện trong vòng kernel hay vòng phần cứng đều thuộc về kernel space.

Có một quy tắc về sự phân tách này, đó là không có gì trong hai vòng trong cùng – kernel và phần cứng – có thể được user space truy cập trực tiếp. Nói cách khác, không process nào trong user space có thể truy cập trực tiếp phần cứng, các cấu trúc dữ liệu nội bộ của kernel và các thuật toán. Thay vào đó, chúng nên được truy cập thông qua system call.

Như đã nói, bạn có thể nghĩ rằng điều này có vẻ hơi mâu thuẫn với bất cứ điều gì bạn biết và đã trải nghiệm về các hệ điều hành Unix-like, như Linux. Nếu bạn không thấy vấn đề, hãy để tôi giải thích cho bạn. Nó có vẻ là một mâu thuẫn vì, chẳng hạn, khi một chương trình <a id="_idIndexMarker775"></a>đọc một số byte từ một network socket, không phải chương trình thực sự đọc những byte đó từ network adapter. Chính kernel đọc các byte và sao chép chúng vào user space, và sau đó chương trình có thể lấy chúng và dùng chúng.

Chúng ta có thể làm rõ điều này bằng cách đi qua mọi bước được thực hiện từ user space đến kernel space và ngược lại trong một ví dụ. Khi bạn muốn đọc một file từ một ổ cứng, bạn viết một chương trình ở vòng user application. Chương trình của bạn dùng một hàm I/O của libc gọi là `fread` (hay một hàm tương tự khác) và rốt cuộc sẽ chạy như một process trong user space. Khi chương trình thực hiện một lời gọi tới hàm `fread`, bản triển khai đằng sau libc được kích hoạt.

Cho đến giờ, mọi thứ vẫn ở trong user process. Sau đó, bản triển khai `fread` rốt cuộc gọi một system call, trong khi `fread` nhận một *file descriptor* đã được mở làm argument thứ nhất, address của một buffer được cấp phát trong memory của process, vốn nằm trong user space, làm argument thứ hai, và độ dài của buffer làm argument thứ ba.

Khi system call được kích hoạt bởi bản triển khai libc, kernel nắm quyền điều khiển việc thực thi thay mặt cho user process. Nó nhận các argument từ user space và giữ chúng trong kernel space. Sau đó, chính kernel đọc từ file bằng cách truy cập đơn vị filesystem bên trong kernel (như có thể thấy trong *Hình 10-5* ở chương trước).

Khi thao tác `read` hoàn tất trong vòng kernel, dữ liệu đã đọc sẽ được sao chép vào buffer trong user space, như được chỉ định bởi argument thứ hai khi gọi hàm `fread`, và system call rời đi và trả quyền điều khiển việc thực thi cho user process. Trong khi đó, user process thường chờ trong lúc system call bận với thao tác. Trong trường hợp này, system call là blocking.

Có một số điều quan trọng cần lưu ý về kịch bản này:

- Chúng ta chỉ có một kernel thực hiện mọi logic đằng sau system call.
- Nếu system call là *blocking*, khi system call đó đang diễn ra, user process gọi nó phải chờ trong khi system call bận và chưa kết thúc. Ngược lại, nếu system call là *non-blocking*, system call trả về rất nhanh, nhưng user process phải thực hiện thêm các system call để kiểm tra xem kết quả đã có chưa.
- Các argument cùng với dữ liệu input và output sẽ được sao chép từ/tới user space. Vì các giá trị thực sự được sao chép, system call được dự định thiết kế theo cách mà chúng nhận các biến nhỏ và pointer làm argument input.
- Kernel có quyền truy cập đặc quyền <a id="_idIndexMarker776"></a>đầy đủ vào mọi tài nguyên của một hệ thống. Do đó, nên có một cơ chế để kiểm tra xem user process có thể thực hiện một system call như vậy hay không. Trong kịch bản này, nếu người dùng không phải là chủ sở hữu của file, `fread` nên thất bại với một lỗi về việc thiếu quyền cần thiết.
- Một sự phân tách tương tự tồn tại giữa memory dành cho user space và kernel space. Các user process chỉ có thể truy cập memory của user space. Có thể cần nhiều lần chuyển dữ liệu để hoàn thành một system call nhất định.

Trước khi chuyển sang phần tiếp theo, tôi muốn hỏi bạn một câu hỏi. Làm thế nào một system call chuyển quyền điều khiển việc thực thi sang kernel? Hãy dành một phút để suy nghĩ về điều đó, vì trong phần tiếp theo chúng ta sẽ tìm câu trả lời cho nó.

<a id="_idParaDest-156"></a>

### Bỏ qua C chuẩn – gọi một system call trực tiếp

Trước khi trả lời câu hỏi đã đặt ra, hãy đi qua một ví dụ bỏ qua thư viện chuẩn C <a id="_idIndexMarker777"></a>và gọi một system call trực tiếp. Nói cách khác, chương trình gọi một system call mà không đi qua vòng shell. Như chúng tôi đã lưu ý trước đây, điều này được coi là một <a id="_idIndexMarker778"></a>anti-pattern, nhưng khi một số system call nhất định không được phơi ra qua libc, một user application có thể gọi system call trực tiếp.

Trong mọi hệ thống Unix, có một phương pháp cụ thể để gọi system call trực tiếp. Ví dụ, trong Linux, có một hàm gọi là `syscall` nằm trong header file `<sys/syscall.h>` có thể được dùng cho mục đích này.

Code box sau, *ví dụ 11.1*, là một ví dụ Hello World khác không dùng libc để in ra standard output. Nói cách khác, ví dụ không dùng hàm `printf` vốn có thể được tìm thấy như một phần của vòng shell và chuẩn POSIX. Thay vào đó, nó gọi trực tiếp một system call cụ thể, do đó code chỉ biên dịch được trên các máy Linux, không phải các hệ thống Unix khác. Nói cách khác, code không portable giữa các biến thể Unix khác nhau:

```
// We need to have this to be able to use non-POSIX stuff
#define _GNU_SOURCE
#include <unistd.h>
// This is not part of POSIX!
#include <sys/syscall.h>
int main(int argc, char** argv) {
  char message[20] = "Hello World!\n";
  // Invokes the 'write' system call that writes
  // some bytes into the standard output.
  syscall(__NR_write, 1, message, 13);
  return 0;
}
```

*Code Box 11-1 [ExtremeC_examples_chapter11_1.c]: Một ví dụ Hello World khác gọi trực tiếp system call write*

Ở câu lệnh đầu tiên trong code box trên, chúng ta phải định nghĩa `_GNU_SOURCE` để chỉ ra rằng chúng ta <a id="_idIndexMarker779"></a>sẽ dùng các phần của **GNU C Library** (**glibc**) không <a id="_idIndexMarker780"></a>thuộc chuẩn POSIX hay SUS. Điều này phá vỡ tính portability của chương trình, và vì vậy, bạn <a id="_idIndexMarker781"></a>có thể không biên dịch được code của mình trên một máy Unix khác. Trong câu lệnh `include` thứ hai, chúng ta include một trong các header file glibc-specific không tồn tại trong các hệ thống POSIX khác dùng các cách triển khai khác glibc làm xương sống libc chính.

Trong hàm `main`, chúng ta thực hiện một system call bằng cách gọi hàm `syscall`. Trước hết, chúng ta phải chỉ định system call bằng cách truyền một số. Đây là một số nguyên tham chiếu tới một system call cụ thể. Mọi system call đều có *system call number* (số hiệu system call) cụ thể độc nhất của riêng nó trong Linux.

Trong code ví dụ, hằng `__R_write` đã được truyền thay cho số hiệu system call, và chúng ta không biết giá trị số chính xác của nó. Sau khi tra cứu nó trong header file `unistd.h`, hóa ra 64 là số hiệu của system call `write`.

Sau khi truyền số hiệu system call, chúng ta nên truyền các argument cần thiết cho system call.

Lưu ý rằng, mặc dù code trên rất đơn giản, và nó chỉ chứa một lời gọi hàm đơn giản, bạn nên biết rằng `syscall` không phải là một hàm thông thường. Nó là một thủ tục assembly <a id="_idIndexMarker782"></a>điền vào một số register CPU phù hợp và thực sự chuyển quyền điều khiển việc thực thi từ user space sang kernel space. Chúng ta sẽ nói <a id="_idIndexMarker783"></a>về điều này ngay sau đây.

Đối với `write`, chúng ta cần truyền ba argument: file descriptor, ở đây là `1` để chỉ standard output; argument thứ hai là *pointer tới một buffer* được cấp phát trong user space; và cuối cùng, *độ dài số byte* cần được sao chép từ buffer.

Sau đây là output của *ví dụ 11.1*, được biên dịch và chạy trong Ubuntu 18.04.1 bằng `gcc`:

```
$ gcc ExtremeC_examples_chapter11_1.c -o ex11_1.out
$ ./ex11_1.out
Hello World!
$
```

*Shell Box 11-1: Output của ví dụ 11.1*

Giờ là lúc dùng `strace`, đã được giới thiệu trong chương trước, để xem các system call thực sự mà *ví dụ 11.1* đã gọi. Output của `strace`, được thể hiện như sau, minh họa rằng chương trình đã gọi system call mong muốn:

```
$ strace ./ex11_1.out
execve("./ex11_1.out", ["./ex11_1.out"], 0x7ffcb94306b0 /* 22 vars */) = 0
brk(NULL)                               = 0x55ebc30fb000
access("/etc/ld.so.nohwcap", F_OK)      = -1 ENOENT (No such file or directory)
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
...
...
arch_prctl(ARCH_SET_FS, 0x7f24aa5624c0) = 0
mprotect(0x7f24aa339000, 16384, PROT_READ) = 0
mprotect(0x55ebc1e04000, 4096, PROT_READ) = 0
mprotect(0x7f24aa56a000, 4096, PROT_READ) = 0
munmap(0x7f24aa563000, 26144)           = 0
write(1, "Hello World!\n", 13Hello World!
)          = 13
exit_group(0)                           = ?
+++ exited with 0 +++
$
```

*Shell Box 11-2: Output của strace khi chạy ví dụ 11.1*

Như bạn có thể thấy ở phần in đậm trong *Shell Box 11-2*, system call đã được `strace` ghi lại. Hãy xem giá trị trả về, là `13`. Nó có nghĩa <a id="_idIndexMarker784"></a>là system call đã ghi thành công <a id="_idIndexMarker785"></a>13 byte vào file được cho, trong trường hợp này là standard output.

> **Lưu ý**:
>
> Một user application không bao giờ nên cố dùng system call trực tiếp. Thường có những bước cần được thực hiện trước và sau khi gọi system call. Các bản triển khai libc thực hiện những bước này. Khi bạn không định dùng libc, bạn phải tự thực hiện những bước này, và bạn phải biết rằng những bước này khác nhau từ hệ thống Unix này sang hệ thống khác.

<a id="_idParaDest-157"></a>

### Bên trong hàm syscall

Tuy nhiên, điều gì xảy ra bên trong hàm `syscall`? Lưu ý rằng thảo luận hiện tại chỉ áp dụng cho glibc và <a id="_idIndexMarker786"></a>không áp dụng cho các bản triển khai libc còn lại. Trước tiên, chúng ta cần tìm `syscall` trong glibc. Đây là link tới định nghĩa `syscall`[ definition: https://github.com/lattera/glibc/blob/master/sysdeps/unix/sysv/linux/x86](https://github.com/lattera/glibc/blob/master/sysdeps/unix/sysv/linux/x86_64/syscall.S)_64/syscall.S.

Nếu bạn mở link trên trong một trình duyệt, bạn sẽ thấy rằng hàm này được viết bằng assembly language.

> **Lưu ý**:
>
> Assembly language có thể được dùng cùng với các câu lệnh C trong một source file C. Thực tế, đây là một trong những tính năng tuyệt vời của C khiến nó phù hợp để viết một hệ điều hành. Đối với hàm `syscall`, chúng ta có một khai báo được viết bằng C, nhưng định nghĩa thì bằng assembly.

Đây là source code bạn tìm thấy trong `syscall.S`:

```
/* Copyright (C) 2001-2018 Free Software Foundation, Inc.
   This file is part of the GNU C Library.
...
   <http://www.gnu.org/licenses/>.  */
#include <sysdep.h>
/* Please consult the file sysdeps/unix/sysv/linux/x86-64/sysdep.h for
   more information about the value -4095 used below.  */
/* Usage: long syscall (syscall_number, arg1, arg2, arg3, arg4, arg5, arg6)
   We need to do some arg shifting, the syscall_number will be in
   rax.  */
	.text
ENTRY (syscall)
    movq %rdi, %rax            /* Syscall number -> rax.  */
    movq %rsi, %rdi            /* shift arg1 - arg5.  */
    movq %rdx, %rsi
    movq %rcx, %rdx
    movq %r8, %r10
    movq %r9, %r8
    movq 8(%rsp),%r9           /* arg6 is on the stack.  */
    syscall                    /* Do the system call.  */
    cmpq $-4095, %rax          /* Check %rax for error.  */
    jae SYSCALL_ERROR_LABEL    /* Jump to error handler if error.  */
    ret                        /* Return to caller.  */
PSEUDO_END (syscall)
```

*Code Box 11-2: Định nghĩa của hàm syscall trong glibc*

Những instruction này ngắn gọn và đơn giản mặc dù việc thực hiện một system call theo cách này có vẻ phức tạp <a id="_idIndexMarker787"></a>hơn. Comment hướng dẫn sử dụng giải thích rằng một system call trong glibc có thể được cung cấp tối đa sáu argument trong mỗi lần gọi.

Điều này có nghĩa là nếu kernel bên dưới hỗ trợ system call với nhiều hơn sáu argument, glibc không thể cung cấp một số chức năng kernel nhất định, và nó nên được thay đổi để hỗ trợ chúng. May mắn thay, sáu argument là đủ trong hầu hết các trường hợp, và với các system call cần nhiều hơn sáu argument, chúng ta có thể truyền pointer tới các biến structure được cấp phát trong memory của user space.

Trong code box trên, sau các instruction `movq`, code assembly gọi subroutine `syscall`. Nó đơn giản sinh ra một *interrupt*, cho phép một phần cụ thể của kernel, vốn đang chờ những interrupt như vậy, thức dậy và xử lý interrupt.

Như bạn có thể thấy ở dòng đầu tiên của thủ tục `syscall`, số hiệu system call được chuyển vào register `%rax`. Ở các dòng tiếp theo, chúng ta đang sao chép các argument khác vào các register khác nhau. Khi interrupt system call được kích hoạt, đơn vị interrupt handler của kernel nhận lời gọi và thu thập số hiệu system call và các argument. Sau đó nó tìm kiếm trong *system call table* của nó để tìm hàm phù hợp cần được gọi ở phía kernel.

Một điểm thú vị là, vào lúc interrupt handler đang được thực thi trong CPU, user code đã <a id="_idIndexMarker788"></a>khởi tạo system call đã rời CPU, và kernel đang làm công việc. Đây là cơ chế chính đằng sau system call. Khi bạn khởi tạo một system call, CPU thay đổi chế độ của nó, và các instruction của kernel được fetch vào CPU và ứng dụng user space không còn được thực thi nữa. Về cơ bản đó là lý do tại sao chúng ta nói rằng kernel thực hiện logic đằng sau system call thay mặt cho user application.

Trong phần tiếp theo, chúng ta sẽ đưa ra một ví dụ về điều này bằng việc viết một system call in ra một lời chào. Nó có thể được coi là một phiên bản cải tiến của *ví dụ 11.1*, nhận một chuỗi input và trả về một chuỗi lời chào.

<a id="_idParaDest-158"></a>

### Thêm một system call vào Linux

Trong phần này, chúng ta sẽ thêm một system call mới vào system call table của một kernel Unix-like hiện có. Đây <a id="_idIndexMarker789"></a>có thể là lần đầu tiên hầu hết các bạn đọc cuốn sách này viết code C được dự định chạy bên trong kernel space. Tất cả các <a id="_idIndexMarker790"></a>ví dụ trước mà chúng ta đã viết trong các chương trước, và gần như toàn bộ code mà chúng ta sẽ viết trong các chương sau, đều chạy trong user space.

Thực tế, hầu hết các chương trình chúng ta viết đều được dự định chạy trong user space. Thực tế, đây là những gì chúng ta gọi là *lập trình C* hay *phát triển C*. Tuy nhiên, nếu chúng ta định viết một chương trình C được dự định chạy trong kernel space, chúng ta dùng một tên khác; chúng ta gọi nó là *kernel development* (phát triển kernel).

Chúng ta sẽ đi qua ví dụ tiếp theo, *ví dụ 11.2*, nhưng trước đó chúng ta cần khám phá môi trường kernel để xem nó khác với user space như thế nào.

<a id="_idParaDest-159"></a>

#### Kernel development (phát triển kernel)

Phần này sẽ có lợi cho những ai trong số các bạn đang tìm cách trở thành một kernel developer hay một nhà nghiên cứu bảo mật <a id="_idIndexMarker791"></a>trong lĩnh vực hệ điều hành. Trong phần đầu tiên, trước khi nhảy vào bản thân system call, chúng tôi muốn giải thích những khác biệt giữa việc phát triển kernel và việc phát triển C thông thường.

Việc phát triển kernel khác với việc phát triển các chương trình C thông thường ở nhiều điểm. Trước khi xem xét những khác biệt, một điều chúng ta nên lưu ý là việc phát triển C thường diễn ra trong user space.

Trong danh sách sau, chúng tôi đã đưa ra sáu khác biệt then chốt giữa các nỗ lực phát triển diễn ra trong kernel và trong user space:

- Chỉ có một kernel process chạy mọi thứ. Điều này đơn giản có nghĩa là nếu code của bạn gây ra crash trong kernel, có lẽ bạn cần khởi động lại máy và để kernel được khởi tạo lại. Vì vậy, với kernel process, chi phí phát triển rất cao, và bạn không thể thử các giải pháp khác nhau mà không khởi động lại máy, điều mà bạn có thể làm rất dễ dàng với các chương trình user space khi làm việc trên chúng. Khi có crash trong kernel, một *kernel crash dump* được tạo ra, có thể được dùng để chẩn đoán nguyên nhân.

- Trong vòng kernel, không có thư viện chuẩn C nào như glibc! Nói cách khác, đây là một lãnh địa mà các chuẩn SUS và POSIX không còn hiệu lực. Vì vậy, bạn không thể include bất kỳ header file libc nào, như `stdio.h` hay `string.h`. Trong trường hợp này, bạn có một tập hàm riêng nên được dùng cho các thao tác khác nhau. Những hàm này thường nằm trong *kernel header* và có thể khác nhau từ biến thể Unix này sang biến thể khác vì không có sự chuẩn hóa nào trong lĩnh vực này.

  Ví dụ, nếu bạn đang phát triển kernel trong Linux, bạn có thể dùng `printk` để ghi một thông điệp vào *message buffer* của kernel. Tuy nhiên, trong FreeBSD, bạn cần dùng họ hàm `printf`, vốn khác với các hàm `printf` của libc. Bạn sẽ tìm thấy những hàm `printf` này trong header file `<sys/system.h>` trong một hệ thống FreeBSD. Hàm tương đương khi phát triển kernel XNU là `os_log`. Lưu ý rằng XNU là kernel của macOS.

- Bạn có thể đọc hay sửa đổi file trong kernel, nhưng không phải bằng các hàm libc. Mỗi Unix kernel có phương pháp riêng để truy cập file bên trong vòng kernel. Điều này cũng tương tự với mọi chức năng được phơi ra qua libc.

- Bạn có quyền truy cập đầy đủ vào physical memory và nhiều dịch vụ khác trong vòng kernel. Vì vậy, viết code an toàn và đáng tin cậy là rất quan trọng.

- Không có cơ chế system call nào trong kernel. System call là cơ chế chính của user space để cho phép các user process giao tiếp với vòng kernel. Vì vậy, một khi bạn đã ở trong kernel, không cần đến nó.

- Kernel process được tạo ra bằng cách sao chép kernel image vào physical memory, do *boot loader* thực hiện. Bạn không thể thêm một system call mới mà không phải <a id="_idIndexMarker792"></a>tạo kernel image từ đầu và nạp lại nó bằng cách khởi động lại hệ thống. Trong các kernel hỗ trợ *kernel module*, bạn có thể dễ dàng thêm hay gỡ một module khi kernel đang chạy, nhưng bạn không thể làm tương tự với system call.

Như bạn có thể thấy với những điểm chúng tôi vừa liệt kê, việc phát triển kernel diễn ra theo một luồng khác so với việc phát triển C thông thường. Kiểm thử logic đã viết không phải là một việc dễ dàng, và code có bug có thể gây ra crash hệ thống.

Trong phần tiếp theo, chúng ta sẽ thực hiện việc phát triển kernel đầu tiên bằng cách thêm một system call mới. Chúng ta làm điều này không phải vì việc thêm một system call là phổ biến khi bạn muốn đưa một chức năng mới vào kernel, mà chúng ta sẽ thử nó để làm quen với việc phát triển kernel.

<a id="_idParaDest-160"></a>

#### Viết một system call Hello World cho Linux

Trong phần này, chúng ta sẽ viết một system call mới cho Linux. Có nhiều nguồn tuyệt vời trên <a id="_idIndexMarker793"></a>internet giải thích cách thêm một system call vào một Linux kernel hiện có, nhưng bài đăng diễn đàn sau, *Adding a Hello World System Call to Linux Kernel* (Thêm một system call Hello World vào Linux kernel) – có tại https://medium.com/anubhav-shrimal/adding-a-hello-world-system-call-to-linux-kernel-dad32875872 – đã được dùng làm cơ sở để xây dựng system call của riêng tôi trong Linux.

*Ví dụ 11.2* là một phiên bản nâng cao của *ví dụ 11.1* dùng một system call khác và tùy chỉnh, mà chúng ta <a id="_idIndexMarker794"></a>sẽ viết trong phần này. System call mới nhận bốn argument. Hai argument đầu tiên dành cho tên input và hai argument sau dành cho chuỗi lời chào output. System call của chúng ta nhận một tên bằng hai argument đầu tiên, một pointer `char` trỏ tới một buffer đã được cấp phát trong user space và một số nguyên là độ dài của buffer, và trả về chuỗi lời chào bằng hai argument sau, một pointer khác với buffer input và cũng được cấp phát trong user space và một số nguyên khác là độ dài của nó.

> **CẢNH BÁO**:
>
> Xin đừng thực hiện thí nghiệm này trên một bản cài đặt Linux được dùng cho mục đích công việc hay sử dụng tại nhà. Hãy chạy các lệnh sau trên một máy thử nghiệm, rất được khuyến nghị là một máy ảo. Bạn có thể dễ dàng tạo máy ảo bằng các ứng dụng giả lập như VirtualBox hay VMware.
>
> Các hướng dẫn sau có khả năng làm hỏng hệ thống của bạn và khiến bạn mất một phần, nếu không phải toàn bộ, dữ liệu nếu chúng được dùng không phù hợp hay sai thứ tự. Hãy luôn cân nhắc một số giải pháp sao lưu để tạo bản sao dữ liệu của bạn nếu bạn định chạy các lệnh sau trên một máy none-experimental (không phải máy thử nghiệm).

Trước hết, chúng ta cần tải về source code mới nhất của Linux kernel. Chúng ta sẽ dùng Linux GitHub repository để clone source code của nó và sau đó chúng ta sẽ chọn một bản phát hành cụ thể. Phiên bản 5.3 được phát hành vào ngày 15 tháng Chín năm 2019, và vì vậy chúng ta sẽ dùng phiên bản này cho ví dụ này.

> **Lưu ý**:
>
> Linux là một kernel. Điều đó có nghĩa là nó chỉ có thể được cài đặt trong vòng kernel của một hệ điều hành Unix-like, còn một *Linux distribution* là một thứ khác. Một Linux distribution có một phiên bản cụ thể của Linux kernel trong vòng kernel của nó và một phiên bản cụ thể của GNU libc và Bash (hay GNU shell) trong vòng shell của nó.
>
> Mỗi Linux distribution thường được phát hành kèm một danh sách hoàn chỉnh các user application trong các vòng bên ngoài của nó. Vì vậy, chúng ta có thể nói một Linux distribution là một hệ điều hành hoàn chỉnh. Lưu ý rằng, *Linux distribution*, *Linux distro* và *Linux flavor* đều chỉ cùng một thứ.

Trong ví dụ này, tôi <a id="_idIndexMarker795"></a>đang dùng Linux distribution Ubuntu 18.04.1 <a id="_idIndexMarker796"></a>trên một máy 64-bit.

Trước khi bắt đầu, điều sống còn là bảo đảm rằng các package tiên quyết đã được cài đặt bằng cách chạy các lệnh sau:

```
$ sudo apt-get update
$ sudo apt-get install -y build-essential autoconf libncurses5-dev libssl-dev bison flex libelf-dev git
...
...
$
```

*Shell Box 11-3: Cài đặt các package tiên quyết cần thiết cho ví dụ 11.2*

Một vài lưu ý về các hướng dẫn trên: `apt` là package manager chính trong các Linux distribution Debian-based, còn `sudo` là một chương trình tiện ích mà chúng ta dùng để chạy một lệnh ở chế độ *superuser*. Nó có sẵn trên gần như mọi hệ điều hành Unix-like.

Bước tiếp theo là clone Linux GitHub repository. Chúng ta cũng cần check out bản phát hành 5.3 sau khi clone repository. Phiên bản có thể được check out bằng cách dùng tên tag của bản phát hành, như bạn có thể thấy trong các lệnh sau:

```
$ git clone https://github.com/torvalds/linux
$ cd linux
$ git checkout v5.3
$
```

*Shell Box 11-4: Clone Linux kernel và check out phiên bản 5.3*

Giờ, nếu bạn nhìn vào <a id="_idIndexMarker797"></a>các file trong thư mục gốc, bạn <a id="_idIndexMarker798"></a>sẽ thấy rất nhiều file và thư mục kết hợp lại tạo nên code base của Linux kernel:

```
$ ls
total 760K
drwxrwxr-x  33 kamran kamran 4.0K Jan 28  2018 arch
drwxrwxr-x   3 kamran kamran 4.0K Oct 16 22:11 block
drwxrwxr-x   2 kamran kamran 4.0K Oct 16 22:11 certs
...
drwxrwxr-x 125 kamran kamran  12K Oct 16 22:11 Documentation
drwxrwxr-x 132 kamran kamran 4.0K Oct 16 22:11 drivers
-rw-rw-r--   1 kamran kamran 3.4K Oct 16 22:11 dropped.txt
drwxrwxr-x   2 kamran kamran 4.0K Jan 28  2018 firmare
drwxrwxr-x  75 kamraln kamran 4.0K Oct 16 22:11 fs
drwxrwxr-x  27 kamran kamran 4.0K Jan 28  2018 include
...
-rw-rw-r--   1 kamran kamran  287 Jan 28  2018 Kconfig
drwxrwxr-x  17 kamran kamran 4.0K Oct 16 22:11 kernel
drwxrwxr-x  13 kamran kamran  12K Oct 16 22:11 lib
-rw-rw-r--   1 kamran kamran 429K Oct 16 22:11 MAINTAINERS
-rw-rw-r--   1 kamran kamran  61K Oct 16 22:11 Makefile
drwxrwxr-x   3 kamran kamran 4.0K Oct 16 22:11 mm
drwxrwxr-x  69 kamran kamran 4.0K Jan 28  2018 net
-rw-rw-r--   1 kamran kamran  722 Jan 28  2018 README
drwxrwxr-x  28 kamran kamran 4.0K Jan 28  2018 samples
drwxrwxr-x  14 kamran kamran 4.0K Oct 16 22:11 scripts
...
drwxrwxr-x   4 kamran kamran 4.0K Jan 28  2018 virt
drwxrwxr-x   5 kamran kamran 4.0K Oct 16 22:11 zfs
$
```

*Shell Box 11-5: Nội dung của code base Linux kernel*

Như bạn có thể thấy, có những thư mục có thể có vẻ quen thuộc: `fs`, `mm`, `net`, `arch`, v.v. Tôi nên chỉ ra rằng chúng tôi sẽ không đưa ra thêm chi tiết về mỗi thư mục này vì nó có thể khác nhau rất nhiều từ kernel này sang kernel khác, nhưng một đặc điểm chung là mọi kernel đều theo gần như cùng một cấu trúc bên trong.

Giờ chúng ta đã có source của kernel, chúng ta nên bắt đầu thêm system call Hello World mới. Tuy nhiên, trước khi làm điều đó, chúng ta cần chọn một định danh số độc nhất cho system call của mình; trong trường hợp này, tôi đặt cho nó tên `hello_world`, và tôi chọn `999` làm số hiệu của nó.

Trước tiên, chúng ta cần thêm khai báo hàm system call vào cuối header file `include/linux/syscalls.h`. Sau sửa đổi này, file sẽ trông như sau:

```
/*
 * syscalls.h - Linux syscall interfaces (non-arch-specific)
 *
 * Copyright (c) 2004 Randy Dunlap
 * Copyright (c) 2004 Open Source Development Labs
 *
 * This file is released under the GPLv2.
 * See the file COPYING for more details.
 */
#ifndef _LINUX_SYSCALLS_H
#define _LINUX_SYSCALLS_H
struct epoll_event;
struct iattr;
struct inode;
...
asmlinkage long sys_statx(int dfd, const char __user *path, unsigned flags,
                          unsigned mask, struct statx __user *buffer);
asmlinkage long sys_hello_world(const char __user *str,
                                const size_t str_len,
                                char __user *buf,
                                size_t buf_len);
#endif
```

*Code Box 11-3 [include/linux/syscalls.h]: Khai báo của system call Hello World mới*

Mô tả ở trên cùng nói rằng đây là một header file chứa các interface `syscall` của Linux, vốn không *architecture specific* (đặc thù theo architecture). Điều này có nghĩa là trên mọi architecture, Linux phơi ra cùng một tập system call.

Ở cuối file, chúng ta đã khai báo hàm system call của mình, nhận bốn argument. Như chúng tôi đã giải thích trước đây, hai argument đầu tiên là chuỗi input và độ dài của nó, và hai argument sau là chuỗi output và độ dài của nó.

Lưu ý rằng các argument input là `const`, nhưng các argument output thì không. Ngoài ra, định danh `__user` <a id="_idIndexMarker801"></a>có nghĩa là các pointer đang trỏ tới các memory address bên trong user space. Như bạn có thể thấy, mọi system call đều có một giá trị số nguyên <a id="_idIndexMarker802"></a>được trả về như một phần của chữ ký hàm, vốn thực sự sẽ là kết quả thực thi của nó. Dải giá trị trả về và ý nghĩa của chúng khác nhau từ system call này sang system call khác. Trong trường hợp system call của chúng ta, `0` có nghĩa là thành công và bất kỳ số nào khác là thất bại.

Giờ chúng ta cần định nghĩa system call của mình. Để làm điều này, trước tiên chúng ta phải tạo một thư mục tên là `hello_world` trong thư mục gốc, việc mà chúng ta thực hiện bằng các lệnh sau:

```
$ mkdir hello_world
$ cd hello_world
$
```

*Shell Box 11-6: Tạo thư mục hello_world*

Tiếp theo, chúng ta tạo một file tên là `sys_hello_world.c` bên trong thư mục `hello_world`. Nội dung của file này nên như sau:

```
#include <linux/kernel.h>   // For printk
#include <linux/string.h>   // For strcpy, strcat, strlen
#include <linux/slab.h>     // For kmalloc, kfree
#include <linux/uaccess.h>  // For copy_from_user, copy_to_user
#include <linux/syscalls.h> // For SYSCALL_DEFINE4
// Definition of the system call
SYSCALL_DEFINE4(hello_world,
          const char __user *, str,    // Input name
          const unsigned int, str_len, // Length of input name
          char __user *, buf,          // Output buffer
          unsigned int, buf_len) {     // Length of output buffer
  // The kernel stack variable supposed to keep the content
  // of the input buffer
  char name[64];
  // The kernel stack variable supposed to keep the final
  // output message.
  char message[96];
  printk("System call fired!\n");
  if (str_len >= 64) {
    printk("Too long input string.\n");
    return -1;
  }
  // Copy data from user space into kernel space
  if (copy_from_user(name, str, str_len)) {
    printk("Copy from user space failed.\n");
    return -2;
  }
  // Build up the final message
  strcpy(message, "Hello ");
  strcat(message, name);
  strcat(message, "!");
  // Check if the final message can be fit into the output binary
  if (strlen(message) >= (buf_len - 1)) {
    printk("Too small output buffer.\n");
    return -3;
  }
  // Copy back the message from the kernel space to the user space
  if (copy_to_user(buf, message, strlen(message) + 1)) {
    printk("Copy to user space failed.\n");
    return -4;
  }
  // Print the sent message into the kernel log
  printk("Message: %s\n", message);
  return 0;
}
```

*Code Box 11-4: Định nghĩa của system call Hello World*

Trong *Code Box 11-4*, chúng ta đã dùng macro `SYSCALL_DEFINE4` để định nghĩa hàm của mình, với hậu tố `DEFINE4` đơn giản có nghĩa là nó nhận bốn argument.

Ở đầu thân hàm, chúng ta đã khai báo các mảng two-character trên đỉnh Stack của kernel. Giống như các process thông thường, kernel process có một address space chứa một Stack. Sau khi làm được điều đó, chúng ta sao chép dữ liệu từ user space vào kernel space. Sau đó, chúng ta tạo thông điệp lời chào bằng cách nối một số chuỗi. Chuỗi <a id="_idIndexMarker803"></a>này vẫn nằm trong memory của kernel. Cuối cùng, chúng ta sao chép thông điệp trở lại user space và làm cho nó sẵn có cho process gọi.

Trong trường hợp có lỗi, các mã lỗi phù hợp được trả về để cho process gọi biết về <a id="_idIndexMarker804"></a>kết quả của system call.

Bước tiếp theo để làm system call của chúng ta hoạt động là cập nhật thêm một bảng nữa. Chỉ có một system call table cho cả hai architecture x86 và x64, và các system call mới được thêm vào nên được thêm vào bảng này để được phơi ra.

Chỉ sau bước này, các system call mới có sẵn trên các máy x86 và x64. Để thêm system call vào bảng, chúng ta cần thêm `hello_word` và tên hàm của nó, `sys_hello_world`.

Để làm điều này, hãy mở file `arch/x86/entry/syscalls/syscall_64.tbl` và thêm dòng sau vào cuối file:

```
999      64     hello_world             __x64_sys_hello_world
```

*Code Box 11-5: Thêm system call Hello World mới được thêm vào system call table*

Sau sửa đổi, file sẽ trông như sau:

```
$ cat arch/x86/entry/syscalls/syscall_64.tbl
...
...
546     x32     preadv2                 __x32_compat_sys_preadv64v2
547     x32     pwritev2                __x32_compat_sys_pwritev64v2
999      64     hello_world             __x64_sys_hello_world
$
```

*Shell Box 11-7: System call Hello World được thêm vào system call table*

Lưu ý tiền tố `__x64_` trong tên của system call. Đây là dấu hiệu cho thấy system call chỉ được phơi ra trong các hệ thống x64.

Linux kernel dùng build system Make để biên dịch mọi source file và build kernel image <a id="_idIndexMarker805"></a>cuối cùng. Tiếp theo, bạn phải <a id="_idIndexMarker806"></a>tạo một file tên là `Makefile` trong thư mục `hello_world`. Nội dung của nó, vốn là một dòng văn bản duy nhất, nên như sau:

```
obj-y := sys_hello_world.o
```

*Code Box 11-6: Makefile của system call Hello World*

Sau đó, bạn cần thêm thư mục `hello_world` vào `Makefile` chính trong thư mục gốc. Chuyển tới thư mục gốc của kernel, mở file `Makefile` và tìm dòng sau:

```
core-y  += kernel/certs/mm/fs/ipc/security/crypto/block/
```

*Code Box 11-7: Dòng target cần được sửa đổi trong Makefile gốc*

Thêm `hello_world/` vào danh sách này. Tất cả những thư mục này đơn giản là các thư mục cần được build như một phần của kernel.

Chúng ta cần thêm thư mục của system call Hello World để đưa nó vào quá trình build <a id="_idIndexMarker807"></a>và để nó được bao gồm trong kernel image cuối cùng. Dòng này sẽ trông như code <a id="_idIndexMarker808"></a>sau sau khi sửa đổi:

```
core-y  += kernel/certs/mm/fs/hello_world/ipc/security/crypto/block/
```

*Code Box 11-8: Dòng target sau khi sửa đổi*

Bước tiếp theo là build kernel.

<a id="_idParaDest-161"></a>

#### Build kernel

Để build kernel, trước tiên chúng ta phải quay lại thư mục gốc của kernel vì trước khi bắt đầu build kernel, bạn cần cung cấp một cấu hình. Một cấu hình có một danh sách các tính năng và đơn vị <a id="_idIndexMarker809"></a>cần được build như một phần của quá trình build.

Lệnh sau cố gắng tạo cấu hình đích dựa trên cấu hình của Linux kernel hiện tại. Nó dùng các giá trị hiện có trong kernel của bạn và hỏi bạn xác nhận nếu có một giá trị cấu hình mới hơn tồn tại trong kernel mà chúng ta đang cố build. Nếu có, bạn có thể đơn giản chấp nhận mọi phiên bản mới hơn bằng cách chỉ cần nhấn phím `Enter`:

```
$ make localmodconfig
...
...
#
# configuration written to .config
#
$
```

*Shell Box 11-8: Tạo một cấu hình kernel dựa trên kernel đang chạy hiện tại*

Giờ bạn có thể bắt đầu quá trình build. Vì Linux kernel chứa rất nhiều source file, việc build có thể mất hàng giờ để hoàn tất. Do đó, chúng ta cần chạy các lần biên dịch song song.

Nếu bạn đang dùng một <a id="_idIndexMarker810"></a>máy ảo, hãy cấu hình máy của bạn để có nhiều hơn một lõi nhằm tăng tốc hiệu quả cho quá trình build:

```
$ make -j4
SYSHDR  arch/x86/include/generated/asm/unistd_32_ia32.h
SYSTBL  arch/x86/include/generated/asm/syscalls_32.h
HOSTCC  scripts/basic/bin2c
SYSHDR  arch/x86/include/generated/asm/unistd_64_x32.h
...
...
UPD     include/generated/compile.h
CC      init/main.o
CC      hello_world/sys_hello_world.o
CC      arch/x86/crypto/crc32c-intel_glue.o
...
...
LD [M]  net/netfilter/x_tables.ko
LD [M]  net/netfilter/xt_tcpudp.ko
LD [M]  net/sched/sch_fq_codel.ko
LD [M]  sound/ac97_bus.ko
LD [M]  sound/core/snd-pcm.ko
LD [M]  sound/core/snd.ko
LD [M]  sound/core/snd-timer.ko
LD [M]  sound/pci/ac97/snd-ac97-codec.ko
LD [M]  sound/pci/snd-intel8x0.ko
LD [M]  sound/soundcore.ko
$
```

*Shell Box 11-9: Output của việc build kernel. Hãy lưu ý dòng cho biết việc biên dịch system call Hello World*

> **Lưu ý**:
>
> Hãy bảo đảm rằng bạn đã cài đặt các package tiên quyết được giới thiệu ở phần đầu tiên của mục này; nếu không, bạn sẽ gặp lỗi biên dịch.

Như bạn có thể thấy, quá trình build đã bắt đầu với bốn job cố gắng biên dịch các file C song song. Bạn cần chờ nó hoàn tất. Khi nó xong, bạn có thể dễ dàng cài đặt kernel mới và khởi động lại máy:

```
$ sudo make modules_install install
INSTALL arch/x86/crypto/aes-x86_64.ko
INSTALL arch/x86/crypto/aesni-intel.ko
INSTALL arch/x86/crypto/crc32-pclmul.ko
INSTALL arch/x86/crypto/crct10dif-pclmul.ko
...
...
run-parts: executing /et/knel/postinst.d/initam-tools 5.3.0+ /boot/vmlinuz-5.3.0+
update-iniras: Generating /boot/initrd.img-5.3.0+
run-parts: executing /etc/keneostinst.d/unattende-urades 5.3.0+ /boot/vmlinuz-5.3.0+
...
...
Found initrd image: /boot/initrd.img-4.15.0-36-generic
Found linux image: /boot/vmlinuz-4.15.0-29-generic
Found initrd image: /boot/initrd.img-4.15.0-29-generic
done.
$
```

*Shell Box 11-10: Tạo và cài đặt kernel image mới*

Như bạn có thể thấy, một kernel image mới cho phiên bản 5.3.0 đã được tạo và cài đặt. Giờ chúng ta đã sẵn sàng khởi động lại hệ thống. Đừng quên kiểm tra phiên bản của kernel hiện tại trước khi <a id="_idIndexMarker811"></a>khởi động lại nếu bạn chưa biết. Trong trường hợp của tôi, phiên bản của tôi là `4.15.0-36-generic`. Tôi đã dùng các lệnh sau để tìm ra nó:

```
$ uname -r
4.15.0-36-generic $
```

*Shell Box 11-11: Kiểm tra phiên bản của kernel đang được cài đặt hiện tại*

Giờ, hãy khởi động lại hệ thống bằng lệnh sau:

```
$ sudo reboot
```

*Shell Box 11-12: Khởi động lại hệ thống*

Trong khi hệ thống đang khởi động, kernel image mới sẽ được chọn và dùng. Lưu ý rằng boot loader sẽ không chọn các kernel cũ hơn; do đó, nếu bạn đã có một kernel với phiên bản trên 5.3, bạn sẽ cần nạp kernel image đã build một cách thủ công. Link này có thể giúp bạn làm điều đó: https://askubuntu.com/questions/82140/how-can-i-boot-with-an-older-kernel-version.

Khi việc khởi động hệ điều hành hoàn tất, bạn sẽ có kernel mới đang chạy. Hãy kiểm tra phiên bản. Nó phải trông như sau:

```
$ uname -r
5.3.0+
$
```

*Shell Box 11-13: Kiểm tra phiên bản kernel sau khi khởi động lại.*

Nếu mọi thứ diễn ra tốt đẹp, kernel mới sẽ ở đúng chỗ. Giờ chúng ta có thể tiếp tục viết một chương trình C gọi system call Hello World mới được thêm vào của chúng ta. Nó sẽ rất giống *ví dụ 11.1*, vốn đã gọi system call `write`. Bạn có thể tìm thấy *ví dụ 11.2* tiếp theo:

```
// We need to have this to be able to use non-POSIX stuff
#define _GNU_SOURCE
#include <stdio.h>
#include <unistd.h>
// This is not part of POSIX!
#include <sys/syscall.h>
int main(int argc, char** argv) {
  char str[20] = "Kam";
  char message[64] = "";
  // Call the hello world system call
  int ret_val = syscall(999, str, 4, message, 64);
  if (ret_val < 0) {
    printf("[ERR] Ret val: %d\n", ret_val);
    return 1;
  }
  printf("Message: %s\n", message);
  return 0;
}
```

*Code Box 11-9 [ExtremeC_examples_chapter11_2.c]: Ví dụ 11.2 gọi system call Hello World mới được thêm vào*

Như bạn có thể thấy, chúng ta đã gọi system call với số hiệu `999`. Chúng ta truyền `Kam` làm input, và chúng ta kỳ vọng nhận được `Hello Kam!` làm thông điệp lời chào. Chương trình chờ kết quả và in ra message buffer được system call điền vào trong kernel space.

Trong code sau, chúng ta build và chạy ví dụ:

```
$ gcc ExtremeC_examples_chapter11_2.c -o ex11_2.out
$ ./ex11_2.out
Message: Hello Kam!
$
```

*Shell Box 11-14: Biên dịch và chạy ví dụ 11.2*

Sau khi chạy ví dụ, và nếu bạn xem log của kernel bằng lệnh `dmesg`, bạn sẽ thấy các log được sinh ra bằng `printk`:

```
$ dmesg
...
...
[  112.273783] System call fired!
[  112.273786] Message: Hello Kam!
$
```

*Shell Box 11-15: Dùng dmesg để xem các log được sinh ra bởi system call Hello World*

Nếu bạn chạy *ví dụ 11.2* với `strace`, bạn có thể thấy rằng nó thực sự gọi system call `999`. Bạn có thể thấy nó ở <a id="_idIndexMarker812"></a>dòng bắt đầu bằng `syscall_0x3e7(...)`. Lưu ý rằng `0x3e7` là giá trị thập lục phân của 999:

```
$ strace ./ex11_2.out
...
...
mprotect(0x557266020000, 4096, PROT_READ) = 0
mprotect(0x7f8dd6d2d000, 4096, PROT_READ) = 0
munmap(0x7f8dd6d26000, 27048)           = 0
syscall_0x3e7(0x7fffe7d2af30, 0x4, 0x7fffe7d2af50, 0x40, 0x7f8dd6b01d80, 0x7fffe7d2b088) = 0
fstat(1, {st_mode=S_IFCHR|0620, st_rdev=makedev(136, 0), ...}) = 0
brk(NULL)                               = 0x5572674f2000
brk(0x557267513000)
...
...
exit_group(0)                           = ?
+++ exited with 0 +++
$
```

*Shell Box 11-16: Giám sát các system call được thực hiện bởi ví dụ 11.2*

Trong *Shell Box 11-16*, bạn có thể thấy rằng `syscall_0x3e7` đã được gọi và `0` đã được trả về. Nếu bạn thay đổi code trong *ví dụ 11.2* để truyền một tên dài hơn 64 byte, bạn sẽ nhận được một lỗi. Hãy thay đổi ví dụ và chạy lại:

```
int main(int argc, char** argv) {
  char name[84] = "A very very long message! It is really hard to produce a big string!";
  char message[64] = "";
  ...
  return 0;
}
```

*Code Box 11-10: Truyền một thông điệp dài (hơn 64 byte) cho system call Hello World của chúng ta*

Hãy biên dịch <a id="_idIndexMarker813"></a>và chạy lại nó:

```
$ gcc ExtremeC_examples_chapter11_2.c -o ex11_2.out
$ ./ex11_2.out
[ERR] Ret val: -1
$
```

*Shell Box 11-17: Biên dịch và chạy ví dụ 11.2 sau khi sửa đổi*

Như bạn thấy, system call trả về `-1` dựa trên logic mà chúng ta đã viết cho nó. Chạy với `strace` cũng cho thấy system call đã trả về `-1`:

```
$ strace ./ex11_2.out
...
...
munmap(0x7f1a900a5000, 27048)           = 0
syscall_0x3e7(0x7ffdf74e10f0, 0x54, 0x7ffdf74e1110, 0x40, 0x7f1a8fe80d80, 0x7ffdf74e1248) = -1 (errno 1)
fstat(1, {st_mode=S_IFCHR|0620, st_rdev=makedev(136, 0), ...}) = 0
brk(NULL)                               = 0x5646802e2000
...
...
exit_group(1)                           = ?
+++ exited with 1 +++
$
```

*Shell Box 11-18: Giám sát các system call được thực hiện bởi ví dụ 11.2 sau khi sửa đổi*

Trong phần tiếp theo, chúng ta nói về các cách tiếp cận mà chúng ta có thể chọn trong việc thiết kế kernel. Trong thảo luận, chúng ta <a id="_idIndexMarker814"></a>giới thiệu các kernel module và khám phá cách chúng được dùng trong việc phát triển kernel.

<a id="_idParaDest-162"></a>

## Unix kernel

Trong phần này, chúng ta sẽ nói về các architecture mà các Unix kernel đã được phát triển theo trong suốt 30 năm qua. Trước khi nói về các loại kernel khác nhau, và không có nhiều loại lắm, chúng ta nên biết rằng không có sự chuẩn hóa nào về cách một kernel nên được thiết kế.

Các best practice mà chúng ta có được đều dựa trên kinh nghiệm qua nhiều năm, và chúng đã dẫn chúng ta tới một bức tranh high-level về các đơn vị bên trong một Unix kernel, tạo ra những minh họa như *Hình 10-5* trong chương trước. Do đó, mỗi kernel đều có phần khác biệt so với kernel khác. Điểm chung chính của tất cả chúng là chúng nên phơi ra các chức năng của mình thông qua một system call interface. Tuy nhiên, mỗi kernel có cách riêng để xử lý system call.

Sự đa dạng này và các cuộc tranh luận xung quanh nó đã biến nó thành một trong những chủ đề architecture-related máy tính nóng nhất của những năm 1990, với những nhóm người lớn tham gia vào các cuộc tranh luận này – cuộc tranh luận *Tanenbaum-Torvalds* được coi là nổi tiếng nhất.

Chúng ta sẽ không đi vào chi tiết của các cuộc tranh luận này, nhưng chúng tôi muốn nói một chút về hai architecture thống trị chính để thiết kế một Unix kernel: *monolithic* và *microkernel*. Vẫn còn các architecture khác, như *hybrid kernel*, *nanokernel* và *exokernel*, tất cả đều có những cách dùng cụ thể riêng.

Tuy nhiên, chúng ta sẽ tập trung vào monolithic kernel và microkernel bằng cách tạo ra một sự so sánh để chúng ta có thể tìm hiểu về các đặc điểm của chúng.

<a id="_idParaDest-163"></a>

### Monolithic kernel so với microkernel

Trong chương trước khi chúng ta xem xét architecture Unix, chúng ta đã mô tả kernel như một <a id="_idIndexMarker815"></a>process duy nhất chứa nhiều đơn vị, nhưng trên thực tế, chúng ta thực ra đang nói về một monolithic kernel.

Một monolithic kernel được tạo nên từ một kernel process với một address space chứa nhiều <a id="_idIndexMarker816"></a>đơn vị nhỏ hơn bên trong cùng process. Microkernel chọn cách tiếp cận ngược lại. Một microkernel là một kernel process tối giản cố gắng đẩy các dịch vụ như filesystem, device driver và quản lý process ra user space để làm cho kernel process nhỏ hơn và mỏng hơn.

Cả hai architecture này đều có ưu điểm và nhược điểm, và kết quả là, chúng đã là chủ đề của một trong những cuộc tranh luận nổi tiếng nhất trong lịch sử hệ điều hành. Nó bắt nguồn từ năm 1992, ngay sau khi phát hành phiên bản đầu tiên của Linux. Một cuộc tranh luận đã được bắt đầu trên *Usenet* bởi một bài đăng do **Andrew S. Tanenbaum** viết. Cuộc tranh luận được biết đến là cuộc tranh luận Tanenbaum-Torvalds. Bạn có thể đọc thêm tại https://en.wikipedia.org/wiki/Tanenbaum–Torvalds_debate.

Bài đăng đó là điểm khởi đầu cho một cuộc khẩu chiến (flame war) giữa người tạo ra Linux **Linus Torvalds** và Tanenbaum và một nhóm những người đam mê khác, những người sau này trở thành các developer Linux đầu tiên. Họ đã tranh luận về bản chất của monolithic kernel và microkernel. Nhiều khía cạnh khác nhau của thiết kế kernel và ảnh hưởng của architecture phần cứng đến thiết kế kernel đã được thảo luận trong cuộc khẩu chiến này.

Thảo luận thêm về các cuộc tranh luận và chủ đề đã mô tả sẽ dài dòng và phức tạp và do đó nằm ngoài phạm vi của cuốn sách này, nhưng chúng tôi muốn so sánh hai cách tiếp cận này và giúp bạn làm quen với ưu điểm và nhược điểm của mỗi cách tiếp cận.

Sau đây là danh sách những khác biệt giữa monolithic kernel và microkernel:

- Một monolithic kernel được tạo nên từ một process duy nhất chứa mọi dịch vụ do kernel cung cấp. Hầu hết các Unix kernel thời kỳ đầu đều được phát triển như vậy, và nó được coi là một cách tiếp cận cũ. Microkernel khác vì chúng có các process riêng cho mọi dịch vụ mà kernel cung cấp.
- Một monolithic kernel process nằm trong kernel space, trong khi các *server process* trong một microkernel thường ở trong user space. Server process là những process cung cấp các chức năng của kernel, như quản lý memory, filesystem, v.v. Microkernel khác ở chỗ chúng để các server process ở trong user space. Điều này có nghĩa là một số hệ điều hành microkernel-like hơn những hệ điều hành khác.
- Monolithic kernel thường nhanh hơn. Đó là vì mọi dịch vụ kernel đều được thực hiện bên trong kernel process, còn microkernel cần thực hiện một số *message passing* (truyền thông điệp) giữa user space và kernel space, do đó có nhiều system call và context switch hơn.
- Trong một monolithic kernel, mọi device driver đều được nạp vào kernel. Do đó, các device driver được viết bởi các nhà cung cấp third-party sẽ được chạy như một phần của kernel. Bất kỳ lỗi nào trong bất kỳ device driver nào hay bất kỳ đơn vị nào khác bên trong kernel đều có thể dẫn đến kernel crash. Điều này không xảy ra với microkernel vì mọi device driver và nhiều đơn vị khác đều được chạy trong user space, đây là điều chúng ta có thể giả thuyết là lý do tại sao monolithic kernel không được dùng trong các dự án mission-critical.
- Trong monolithic kernel, chỉ cần chèn một đoạn code độc hại nhỏ là đủ để xâm phạm toàn bộ kernel, và kéo theo đó là toàn bộ hệ thống. Tuy nhiên, điều này không thể dễ dàng xảy ra trong một microkernel vì nhiều server process ở trong user space, và chỉ một tập tối thiểu các chức năng then chốt được tập trung trong kernel space.
- Trong một monolithic kernel, ngay cả một thay đổi đơn giản đối với source của kernel cũng cần toàn bộ kernel được biên dịch lại, và một kernel image mới phải được tạo ra. Việc nạp <a id="_idIndexMarker819"></a>image mới cũng đòi hỏi máy phải được khởi động lại. Nhưng các thay đổi trong một microkernel có thể chỉ dẫn đến việc biên dịch một server process cụ thể, và <a id="_idIndexMarker820"></a>có lẽ nạp chức năng mới mà không cần khởi động lại hệ thống. Trong monolithic kernel, có thể đạt được một chức năng tương tự ở một mức độ nào đó bằng cách dùng kernel module.

MINIX là một trong những ví dụ best-known (nổi tiếng nhất) về microkernel. Nó được viết bởi Andrew S. Tanenbaum và khởi đầu như một hệ điều hành giáo dục. Linus Torvalds đã dùng MINIX làm môi trường phát triển của mình để viết kernel của riêng ông, gọi là Linux, vào năm 1991 cho bộ vi xử lý 80386.

Vì Linux đã là người bảo vệ lớn nhất và thành công nhất của monolithic kernel trong gần 30 năm, chúng ta sẽ nói thêm về Linux trong phần tiếp theo.

<a id="_idParaDest-164"></a>

### Linux

Bạn đã được giới thiệu Linux kernel trong phần trước của chương này, khi chúng ta phát triển một system call mới cho nó. Trong phần này, chúng tôi muốn tập trung thêm một chút vào thực tế rằng Linux là monolithic và rằng mọi chức năng của kernel đều nằm bên trong kernel.

Tuy nhiên, phải có một <a id="_idIndexMarker821"></a>cách để thêm một chức năng mới vào kernel mà không cần biên dịch lại nó. Các chức năng mới không thể được thêm vào kernel dưới dạng system call mới đơn giản vì, như bạn đã thấy, bằng việc thêm một system call mới, nhiều file nền tảng cần được thay đổi, và điều này có nghĩa là chúng ta cần biên dịch lại kernel để có các chức năng mới.

Cách tiếp cận mới thì khác. Trong kỹ thuật này, các kernel module được viết và cắm vào kernel một cách động, điều mà chúng ta sẽ thảo luận trong phần đầu tiên, trước khi chuyển sang viết một kernel module cho Linux.

<a id="_idParaDest-165"></a>

### Kernel module

Monolithic kernel thường được trang bị một phương tiện khác cho phép các kernel developer hot-plug (cắm nóng) các chức năng mới vào một kernel up-and-running (đang chạy). Những đơn vị có thể cắm vào này được gọi là kernel module. Chúng không giống các server process trong microkernel.

Không giống các server process trong một <a id="_idIndexMarker822"></a>microkernel, vốn thực sự là các process riêng biệt dùng các kỹ thuật IPC để giao tiếp với nhau, kernel module là các *kernel object file* đã được biên dịch và có thể được nạp một cách động vào kernel process. Những kernel object file này có thể hoặc được build tĩnh như một phần của kernel image hoặc được nạp một cách động khi kernel đang chạy.

Lưu ý rằng kernel object file là các khái niệm song sinh với các object file thông thường được tạo ra trong việc phát triển C.

Đáng lưu ý một lần nữa rằng nếu kernel module làm điều gì đó tồi tệ bên trong kernel, một *kernel crash* có thể xảy ra.

Cách bạn giao tiếp với kernel module khác với system call, và chúng không thể được dùng bằng cách gọi một hàm hay dùng một API cho trước. Nói chung, có ba cách để giao tiếp với một kernel module trong Linux và một số hệ điều hành tương tự:

- **Device file trong thư mục /dev**: Kernel module chủ yếu được phát triển để được device driver dùng, và đó là lý do tại sao device là cách phổ biến nhất để giao tiếp với kernel module. Như chúng tôi đã giải thích trong chương trước, device có thể truy cập được dưới dạng các device file nằm trong thư mục `/dev`. Bạn có thể đọc từ và ghi vào những file này và, dùng chúng, bạn có thể gửi và nhận dữ liệu tới/từ các module.
- **Các mục trong procfs**: Các mục trong thư mục `/proc` có thể được dùng để đọc meta-information về một kernel module cụ thể. Những file này cũng có thể được dùng để truyền meta-information hay các lệnh điều khiển cho một kernel module. Chúng tôi sẽ minh họa ngắn gọn việc dùng procfs trong ví dụ tiếp theo, *ví dụ 11.3*, trong phần sau.
- **Các mục trong sysfs**: Đây là một filesystem khác trong Linux cho phép các script và người dùng điều khiển các user process và các đơn vị kernel-related khác, như kernel module. Nó có thể được coi là một phiên bản mới của procfs.

Thực tế, cách tốt nhất để thấy một kernel module là viết một cái, đó là những gì chúng ta sẽ làm trong phần tiếp theo, nơi chúng ta viết một kernel module Hello World cho Linux. Lưu ý rằng kernel module không chỉ giới hạn ở Linux; các monolithic kernel như FreeBSD cũng được hưởng lợi từ cơ chế kernel module.

<a id="_idParaDest-166"></a>

#### Thêm một kernel module vào Linux

Trong phần này, chúng ta sẽ viết một kernel module mới cho Linux. Đây là kernel module Hello World, <a id="_idIndexMarker823"></a>tạo ra một mục trong procfs. Sau đó, dùng mục này, chúng ta đọc chuỗi lời chào.

Trong phần này, bạn sẽ làm quen với việc viết một kernel module, biên dịch nó, nạp nó vào kernel, gỡ nó <a id="_idIndexMarker824"></a>khỏi kernel, và đọc dữ liệu từ một mục procfs. Mục đích chính của ví dụ này là giúp bạn bắt tay vào việc viết một kernel module và, kết quả là, bạn có thể tự mình phát triển thêm.

> **Lưu ý**:
>
> Kernel module được biên dịch thành các kernel object file có thể được nạp trực tiếp vào kernel vào lúc run-time. Không cần khởi động lại hệ thống sau khi nạp kernel module object file chừng nào nó không làm điều gì đó tồi tệ trong kernel dẫn đến kernel crash. Điều đó cũng đúng với việc gỡ kernel module.

Bước đầu tiên là tạo một thư mục được dự định chứa mọi file liên quan đến kernel module. Chúng ta đặt tên nó là `ex11_3` vì đây là ví dụ thứ ba trong chương này:

```
$ mkdir ex11_3
$ cd ex11_3
$
```

*Shell Box 11-19: Tạo thư mục gốc cho ví dụ 11.3*

Sau đó, tạo một file tên là `hwkm.c`, vốn chỉ là một từ viết tắt được tạo nên từ các chữ cái đầu của "Hello World Kernel Module", với nội dung sau:

```
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/proc_fs.h>
// The structure pointing to the proc file
struct proc_dir_entry *proc_file;
// The read callback function
ssize_t proc_file_read(struct file *file, char __user *ubuf, size_t count, loff_t *ppos) {
  int copied = 0;
  if (*ppos > 0) {
    return 0;
  }
  copied = sprintf(ubuf, "Hello World From Kernel Module!\n");
  *ppos = copied;
  return copied;
}
static const struct file_operations proc_file_fops = {
 .owner = THIS_MODULE,
 .read  = proc_file_read
};
// The module initialization callback
static int __init hwkm_init(void) {
  proc_file = proc_create("hwkm", 0, NULL, &proc_file_fops);
  if (!proc_file) {
    return -ENOMEM;
  }
  printk("Hello World module is loaded.\n");
  return 0;
}
// The module exit callback
static void __exit hkwm_exit(void) {
  proc_remove(proc_file);
  printk("Goodbye World!\n");
}
// Defining module callbacks
module_init(hwkm_init);
module_exit(hkwm_exit);
```

*Code Box 11-11 [ex11_3/hwkm.c]: Kernel module Hello World*

Dùng hai câu lệnh cuối cùng trong *Code Box 11-11*, chúng ta đã đăng ký các callback khởi tạo và <a id="_idIndexMarker825"></a>thoát của module. Những hàm này lần lượt được gọi khi module đang được nạp và gỡ. Callback khởi tạo là <a id="_idIndexMarker826"></a>đoạn code đầu tiên được thực thi.

Như bạn có thể thấy bên trong hàm `hwkm_init`, nó tạo một file tên là `hwkm` bên trong thư mục `/proc`. Cũng có một callback thoát. Bên trong hàm `hwkm_exit`, nó gỡ file `hwkm` khỏi đường dẫn `/proc`. File `/proc/hwkm` là điểm liên lạc để user space có thể giao tiếp với kernel module.

Hàm `proc_file_read` là hàm callback đọc. Hàm này được gọi khi user space cố đọc file `/proc/hwkm`. Như bạn sẽ thấy ngay sau đây, chúng ta dùng chương trình tiện ích `cat` để đọc file. Nó đơn giản sao chép chuỗi `Hello World From Kernel Module!` sang user space.

Lưu ý rằng ở giai đoạn này, code được viết bên trong một kernel module có quyền truy cập toàn bộ vào gần như mọi thứ bên trong kernel, và nó có thể làm rò rỉ bất kỳ loại thông tin nào ra user space. Đây là một vấn đề bảo mật <a id="_idIndexMarker827"></a>lớn, và nên tìm đọc thêm về các best practice để viết một kernel module an toàn.

Để biên dịch code trên, chúng ta cần dùng một compiler phù hợp, có thể bao gồm cả việc link nó với các <a id="_idIndexMarker828"></a>library phù hợp. Để cuộc sống dễ dàng hơn, chúng ta tạo một file tên là `Makefile` sẽ kích hoạt các công cụ build cần thiết để build kernel module.

Code box sau thể hiện nội dung của `Makefile`:

```
obj-m += hwkm.o
all:
    make -C /lib/modules/$(shell uname -r)/build M=$(PWD) modules
clean:
    make -C /lib/modules/$(shell uname -r)/build M=$(PWD) clean
```

*Code Box 11-12: Makefile của kernel module Hello World*

Sau đó, chúng ta có thể chạy lệnh `make`. Shell box sau minh họa điều này:

```
$ make
make -C /lib/modules/54.318.0+/build M=/home/kamran/extreme_c/ch11/codes/ex11_3 modules
make[1]: Entering directory '/home/kamran/linux'
  CC [M]  /home/kamran/extreme_c/ch11/codes/ex11_3/hwkm.o
  Building modules, stage 2.
  MODPOST 1 modules
WARNING: modpost: missing MODULE_LICENSE() in /home/kamran/extreme_c/ch11/codes/ex11_3/hwkm.o
see include/linux/module.h for more information
  CC      /home/kamran/extreme_c/ch11/codes/ex11_3/hwkm.mod.o
  LD [M]  /home/kamran/extreme_c/ch11/codes/ex11_3/hwkm.ko
make[1]: Leaving directory '/home/kamran/linux'
$
```

*Shell Box 11-20: Build kernel module Hello World*

Như bạn có thể thấy, compiler biên dịch code và tạo ra một object file. Sau đó, nó tiếp tục bằng việc link object file với các library khác để tạo ra một file `.ko`. Giờ, nếu bạn nhìn vào các file được tạo ra, bạn sẽ thấy một file tên là `hwkm.ko`.

Hãy để ý phần mở rộng `.ko`, vốn đơn giản có nghĩa là file output là một kernel object file. Nó giống như một shared library có thể được nạp một cách động vào kernel và trở nên đang chạy.

Hãy lưu ý rằng trong *Shell Box 11-20*, quá trình build đã tạo ra một thông báo cảnh báo. Nó nói rằng module không có license nào gắn với nó. Việc tạo ra các module có license <a id="_idIndexMarker829"></a>khi phát triển hay triển khai <a id="_idIndexMarker830"></a>kernel module trong các môi trường test và production là một thực hành rất được khuyến nghị.

Shell box sau cho thấy danh sách các file có thể được tìm thấy sau khi build kernel module:

```
$ ls -l
total 556
-rw-rw-r-- 1 kamran kamran    154 Oct 19 00:36 Makefile
-rw-rw-r-- 1 kamran kamran      0 Oct 19 08:15 Module.symvers
-rw-rw-r-- 1 kamran kamran   1104 Oct 19 08:05 hwkm.c
-rw-rw-r-- 1 kamran kamran 272280 Oct 19 08:15 hwkm.ko
-rw-rw-r-- 1 kamran kamran    596 Oct 19 08:15 hwkm.mod.c
-rw-rw-r-- 1 kamran kamran 104488 Oct 19 08:15 hwkm.mod.o
-rw-rw-r-- 1 kamran kamran 169272 Oct 19 08:15 hwkm.o
-rw-rw-r-- 1 kamran kamran     54 Oct 19 08:15 modules.order
$
```

*Shell Box 11-21: Danh sách các file hiện có sau khi build kernel module Hello World*

> **Lưu ý**:
>
> Chúng tôi đã dùng các công cụ build module từ Linux kernel phiên bản 5.3.0 Bạn có thể gặp lỗi biên dịch nếu bạn biên dịch ví dụ này bằng một phiên bản kernel dưới 3.10.

Để nạp kernel module `hwkm`, chúng ta dùng lệnh `insmod` trong Linux, vốn đơn giản nạp và cài đặt kernel module, như chúng ta đã làm trong shell box sau:

```
$ sudo insmod hwkm.ko
$
```

*Shell Box 11-22: Nạp và cài đặt kernel module Hello World*

Giờ, nếu bạn xem log của kernel, bạn sẽ thấy các dòng được tạo ra bởi hàm khởi tạo. Chỉ cần dùng lệnh `dmesg` để xem các log mới nhất của kernel, đó là những gì chúng ta đã làm tiếp theo:

```
$ dmesg
...
...
[ 7411.519575] Hello World module is loaded.
$
```

*Shell Box 11-23: Kiểm tra các thông điệp log của kernel sau khi cài đặt kernel module*

Giờ, module đã được nạp, và file `/proc/hwkm` hẳn đã <a id="_idIndexMarker831"></a>được tạo ra. Chúng ta có thể đọc nó <a id="_idIndexMarker832"></a>bây giờ bằng lệnh `cat`:

```
$ cat /proc/hwkm
Hello World From Kernel Module!
$ cat /proc/hwkm
Hello World From Kernel Module!
$
```

*Shell Box 11-24: Đọc file /proc/hwkm bằng cat*

Như bạn có thể thấy trong shell box trên, chúng ta đã đọc file hai lần, và cả hai lần, nó đều trả về cùng chuỗi `Hello World From Kernel Module!`. Lưu ý rằng chuỗi được kernel module sao chép vào user space, và chương trình `cat` chỉ in nó ra standard output.

Khi đến lúc gỡ module, chúng ta có thể dùng lệnh `rmmod` trong Linux, như chúng ta đã làm tiếp theo:

```
$ sudo rmmod hwkm
$
```

*Shell Box 11-25: Gỡ kernel module Hello World*

Giờ module đã được gỡ, hãy xem lại log của kernel để thấy thông điệp tạm biệt:

```
$ dmesg
...
...
[ 7411.519575] Hello World module is loaded.
[ 7648.950639] Goodbye World!
$
```

*Shell Box 11-26: Kiểm tra các thông điệp log của kernel sau khi gỡ kernel module*

Như bạn đã thấy trong ví dụ trên, kernel module rất tiện lợi khi viết code kernel.

Để kết thúc chương này, tôi tin rằng sẽ hữu ích nếu đưa cho bạn một danh sách các tính năng mà <a id="_idIndexMarker833"></a>chúng ta đã thấy cho đến giờ về kernel module:

- Kernel module có thể được <a id="_idIndexMarker834"></a>nạp và gỡ mà không cần khởi động lại máy.
- Khi được nạp, chúng trở thành một phần của kernel và có thể truy cập bất kỳ đơn vị hay cấu trúc nào bên trong kernel. Điều này có thể được coi là một lỗ hổng, nhưng một Linux kernel có thể được bảo vệ chống lại việc cài đặt các module không mong muốn.
- Trong trường hợp kernel module, bạn chỉ cần biên dịch source code của chúng. Nhưng với system call, bạn phải biên dịch toàn bộ kernel, việc này có thể dễ dàng chiếm một giờ thời gian của bạn.

Cuối cùng, kernel module có thể tiện lợi khi bạn định phát triển một đoạn code cần được chạy bên trong kernel đằng sau một system call. Logic sẽ được phơi ra bằng một system call có thể được nạp vào kernel bằng một kernel module trước, và sau khi được phát triển và kiểm thử đúng cách, nó có thể đi vào đằng sau một system call thật.

Phát triển system call từ đầu có thể là một công việc tẻ nhạt vì bạn phải khởi động lại máy vô số lần. Có logic được viết và kiểm thử trước như một phần của một kernel module có thể giảm bớt khó khăn của việc phát triển kernel. Lưu ý rằng nếu code của bạn đang cố gây ra kernel crash, không quan trọng nó ở trong một kernel module hay đằng sau một system call; nó gây ra kernel crash và bạn phải khởi động lại máy.

Trong phần này, chúng ta đã nói về các loại kernel khác nhau. Chúng ta cũng đã cho thấy cách một kernel module có thể được dùng bên trong một monolithic kernel để có logic kernel tạm thời bằng cách nạp và gỡ nó một cách động.

<a id="_idParaDest-167"></a>

## Tóm tắt

Giờ chúng ta đã hoàn thành thảo luận two-chapter (hai chương) về Unix. Trong chương này, chúng ta đã học về những điều sau:

- System call là gì và nó phơi ra một chức năng nhất định như thế nào
- Điều gì xảy ra đằng sau việc gọi một system call
- Một system call nhất định có thể được gọi trực tiếp từ code C như thế nào
- Cách thêm một system call mới vào một kernel Unix-like hiện có (Linux) và cách biên dịch lại kernel
- Monolithic kernel là gì và nó khác với microkernel như thế nào
- Kernel module hoạt động như thế nào bên trong một monolithic kernel và cách viết một kernel module mới cho Linux

Trong chương tiếp theo, chúng ta sẽ nói về các chuẩn C và phiên bản gần đây nhất của C, C18. Bạn sẽ làm quen với các tính năng mới được giới thiệu trong đó.
