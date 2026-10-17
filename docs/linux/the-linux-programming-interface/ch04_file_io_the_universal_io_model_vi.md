# CHƯƠNG 4: FILE I/O: MÔ HÌNH I/O PHỔ QUÁT

Bây giờ chúng ta bắt đầu đi sâu vào API lời gọi hệ thống (system call API). Tập tin (file) là một nơi tốt để bắt đầu, vì chúng là trung tâm của triết lý UNIX. Trọng tâm của chương này là các system call được sử dụng để thực hiện vào/ra tập tin (file input and output).

Chúng ta sẽ giới thiệu khái niệm về mô tả tập tin (file descriptor), sau đó xem xét các system call cấu thành nên cái gọi là mô hình I/O phổ quát (universal I/O model). Đây là các system call dùng để mở và đóng tập tin, cũng như đọc và ghi dữ liệu.

Chúng ta tập trung vào I/O trên các file đĩa (disk files). Tuy nhiên, phần lớn tài liệu được đề cập ở đây cũng có liên quan đến các chương sau, vì các system call tương tự cũng được sử dụng để thực hiện I/O trên tất cả các loại file, chẳng hạn như pipe và terminal.

Chương 5 sẽ mở rộng thảo luận trong chương này với các chi tiết sâu hơn về file I/O. Một khía cạnh khác của file I/O, đệm (buffering), đủ phức tạp để xứng đáng có một chương riêng. Chương 13 sẽ đề cập đến đệm I/O trong kernel và trong thư viện stdio.

## 4.1 Tổng quan

Tất cả các system call để thực hiện I/O đều tham chiếu đến các file đang mở bằng cách sử dụng một mô tả tập tin (file descriptor), một số nguyên không âm (thường là số nhỏ). File descriptor được sử dụng để tham chiếu đến tất cả các loại file đang mở, bao gồm pipe, FIFO, socket, terminal, thiết bị (device), và file thông thường (regular file). Mỗi tiến trình đều có tập hợp các file descriptor của riêng mình.

Theo quy ước, hầu hết các chương trình đều kỳ vọng có thể sử dụng ba file descriptor chuẩn được liệt kê trong Bảng 4-1. Ba file descriptor này được mở thay cho chương trình bởi shell, trước khi chương trình được bắt đầu. Hay nói chính xác hơn, chương trình kế thừa các bản sao file descriptor của shell, và shell thường hoạt động với ba file descriptor này luôn mở. (Trong một shell tương tác, ba file descriptor này thường tham chiếu đến terminal mà shell đang chạy bên dưới.) Nếu sự chuyển hướng I/O (I/O redirection) được chỉ định trên dòng lệnh, shell sẽ đảm bảo rằng các file descriptor được sửa đổi thích hợp trước khi khởi chạy chương trình.

<span id="page-49-0"></span> **Bảng 4-1:** Các file descriptor chuẩn

| File descriptor | Mục đích | Tên POSIX | Luồng stdio |
| ------ | ------ | ------ | ------ |
| 0 | standard input (đầu vào chuẩn) | STDIN_FILENO | stdin |
| 1 | standard output (đầu ra chuẩn) | STDOUT_FILENO | stdout |
| 2 | standard error (đầu ra lỗi chuẩn) | STDERR_FILENO | stderr |

Khi tham chiếu đến các file descriptor này trong một chương trình, chúng ta có thể sử dụng các số (0, 1, hoặc 2) hoặc, ưu tiên hơn, các tên chuẩn POSIX được định nghĩa trong `<unistd.h>`.

Mặc dù các biến `stdin`, `stdout`, và `stderr` ban đầu tham chiếu đến đầu vào, đầu ra và lỗi chuẩn của tiến trình, chúng có thể được thay đổi để tham chiếu đến bất kỳ file nào bằng cách sử dụng thư viện hàm `freopen()`. Là một phần trong hoạt động của nó, `freopen()` có thể thay đổi file descriptor nằm bên dưới luồng được mở lại. Nói cách khác, sau khi gọi `freopen()` trên `stdout`, chẳng hạn, sẽ không còn an toàn khi giả định rằng file descriptor bên dưới vẫn là 1.

Sau đây là bốn system call then chốt để thực hiện file I/O (các ngôn ngữ lập trình và gói phần mềm thường chỉ sử dụng các lời gọi này một cách gián tiếp, thông qua các thư viện I/O):

* `fd = open(pathname, flags, mode)` mở file được định danh bởi `pathname`, trả về một file descriptor được sử dụng để tham chiếu đến file đang mở trong các lời gọi sau đó. Nếu file không tồn tại, `open()` có thể tạo nó, tùy thuộc vào cài đặt của đối số mặt nạ bit `flags`. Đối số `flags` cũng chỉ định file được mở để đọc, ghi, hay cả hai. Đối số `mode` chỉ định các quyền (permissions) được đặt trên file nếu nó được tạo bởi lời gọi này. Nếu lời gọi `open()` không được sử dụng để tạo file, đối số này sẽ bị bỏ qua và có thể bỏ bớt.
* `numread = read(fd, buffer, count)` đọc tối đa `count` byte từ file đang mở được tham chiếu bởi `fd` và lưu chúng vào `buffer`. Lời gọi `read()` trả về số byte thực tế đã đọc được. Nếu không thể đọc thêm byte nào nữa (tức là gặp end-of-file), `read()` trả về 0.
* `numwritten = write(fd, buffer, count)` ghi tối đa `count` byte từ `buffer` vào file đang mở được tham chiếu bởi `fd`. Lời gọi `write()` trả về số byte thực tế được ghi, số byte này có thể nhỏ hơn `count`.
* `status = close(fd)` được gọi sau khi tất cả I/O đã hoàn tất, nhằm giải phóng file descriptor `fd` và các tài nguyên kernel liên quan của nó.

Trước khi đi sâu vào chi tiết của các system call này, chúng tôi cung cấp một minh họa ngắn gọn về việc sử dụng chúng trong Mã nguồn 4-1. Chương trình này là một phiên bản đơn giản của lệnh `cp(1)`. Nó sao chép nội dung của file hiện có được đặt tên trong đối số dòng lệnh đầu tiên sang file mới được đặt tên trong đối số dòng lệnh thứ hai.

Chúng ta có thể sử dụng chương trình trong Mã nguồn 4-1 như sau:

```bash
$ ./copy oldfile newfile
```

<span id="page-50-0"></span> **Mã nguồn 4-1:** Sử dụng các system call I/O
```c
–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– fileio/copy.c
#include <sys/stat.h>
#include <fcntl.h>
#include "tlpi_hdr.h"

#ifndef BUF_SIZE /* Cho phép "cc -D" ghi đè định nghĩa */
#define BUF_SIZE 1024
#endif

int
main(int argc, char *argv[])
{
    int inputFd, outputFd, openFlags;
    mode_t filePerms;
    ssize_t numRead;
    char buf[BUF_SIZE];

    if (argc != 3 || strcmp(argv[1], "--help") == 0)
        usageErr("%s old-file new-file\n", argv[0]);

    /* Mở các file đầu vào và đầu ra */

    inputFd = open(argv[1], O_RDONLY);
    if (inputFd == -1)
        errExit("opening file %s", argv[1]);

    openFlags = O_CREAT | O_WRONLY | O_TRUNC;
    filePerms = S_IRUSR | S_IWUSR | S_IRGRP | S_IWGRP |
                S_IROTH | S_IWOTH; /* rw-rw-rw- */

    outputFd = open(argv[2], openFlags, filePerms);
    if (outputFd == -1)
        errExit("opening file %s", argv[2]);

    /* Truyền dữ liệu cho đến khi gặp cuối đầu vào hoặc có lỗi */

    while ((numRead = read(inputFd, buf, BUF_SIZE)) > 0)
        if (write(outputFd, buf, numRead) != numRead)
            fatal("couldn't write whole buffer");

    if (numRead == -1)
        errExit("read");

    if (close(inputFd) == -1)
        errExit("close input");
    if (close(outputFd) == -1)
        errExit("close output");

    exit(EXIT_SUCCESS);
}
–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– fileio/copy.c
```

## 4.2 Tính phổ quát của I/O

Một trong những đặc điểm nổi bật của mô hình UNIX I/O là khái niệm tính phổ quát của I/O (universality of I/O). Điều này có nghĩa là cùng bốn system call — `open()`, `read()`, `write()`, và `close()` — được sử dụng để thực hiện I/O trên tất cả các loại file, bao gồm cả các thiết bị như terminal. Do đó, nếu chúng ta viết một chương trình chỉ sử dụng các system call này, chương trình đó sẽ hoạt động trên bất kỳ loại file nào. Ví dụ, tất cả các trường hợp sau đây đều là cách sử dụng hợp lệ của chương trình trong Mã nguồn 4-1:

```bash
$ ./copy test test.old       Sao chép một file thông thường
$ ./copy a.txt /dev/tty      Sao chép file thông thường ra terminal này
$ ./copy /dev/tty b.txt      Sao chép đầu vào từ terminal này vào file thông thường
$ ./copy /dev/pts/16 /dev/tty Sao chép đầu vào từ terminal khác
```

Tính phổ quát của I/O đạt được bằng cách đảm bảo rằng mỗi file system và device driver đều triển khai cùng một tập hợp các system call I/O. Vì các chi tiết cụ thể đối với file system hoặc thiết bị được xử lý bên trong kernel, chúng ta nói chung có thể bỏ qua các yếu tố đặc thù của thiết bị khi viết các chương trình ứng dụng. Khi cần truy cập vào các tính năng cụ thể của một file system hoặc thiết bị, một chương trình có thể sử dụng system call tổng hợp `ioctl()` (Mục 4.8), cung cấp một giao diện cho các tính năng nằm ngoài mô hình I/O phổ quát.

## 4.3 Mở một tập tin: open()

System call `open()` mở một file hiện có hoặc tạo và mở một file mới.

```c
#include <sys/stat.h>
#include <fcntl.h>

int open(const char *pathname, int flags, ... /* mode_t mode */);
                               Trả về file descriptor khi thành công, hoặc –1 khi lỗi
```

File cần mở được định danh bởi đối số `pathname`. Nếu `pathname` là một symbolic link, nó sẽ được giải tham chiếu (dereferenced). Khi thành công, `open()` trả về một file descriptor được sử dụng để tham chiếu đến file trong các system call tiếp theo. Nếu xảy ra lỗi, `open()` trả về –1 và `errno` được đặt tương ứng.

Đối số `flags` là một mặt nạ bit chỉ định chế độ truy cập (access mode) cho file, sử dụng một trong các hằng số được hiển thị trong Bảng 4-2.

Các bản triển khai UNIX sớm hơn đã sử dụng các số 0, 1, và 2 thay vì các tên được hiển thị trong Bảng 4-2. Hầu hết các triển khai UNIX hiện đại định nghĩa các hằng số này có những giá trị đó. Do đó, chúng ta có thể thấy rằng `O_RDWR` không tương đương với `O_RDONLY | O_WRONLY`; sự kết hợp sau là một lỗi logic.

Khi `open()` được sử dụng để tạo một file mới, đối số mặt nạ bit `mode` chỉ định các quyền (permissions) sẽ được đặt trên file. (Kiểu dữ liệu `mode_t` được sử dụng cho kiểu của `mode` là một kiểu số nguyên được đặc tả trong SUSv3.) Nếu lời gọi `open()` không được sử dụng để tạo file, đối số `mode` có thể được bỏ qua.

<span id="page-52-0"></span> **Bảng 4-2:** Các chế độ truy cập file

| Chế độ truy cập | Mô tả |
| ------ | ------ |
| O_RDONLY | Mở file chỉ để đọc |
| O_WRONLY | Mở file chỉ để ghi |
| O_RDWR | Mở file cho cả đọc và ghi |

Chúng ta sẽ mô tả chi tiết quyền truy cập file trong Mục 15.4. Sau này, chúng ta sẽ thấy rằng các quyền thực sự được đặt trên một file mới không chỉ phụ thuộc vào đối số `mode`, mà còn phụ thuộc vào `umask` của tiến trình (Mục 15.4.6) và danh sách kiểm soát truy cập mặc định (tùy chọn có mặt) (Mục 17.6) của thư mục cha. Trong thời gian chờ đợi, chúng ta sẽ chỉ ghi nhận rằng đối số `mode` có thể được chỉ định dưới dạng một số (thường ở dạng bát phân - octal) hoặc, ưu tiên hơn, bằng cách OR (`|`) một hoặc nhiều hằng số mặt nạ bit được liệt kê trong Bảng 15-4, ở trang 295.

Mã nguồn 4-2 hiển thị các ví dụ về việc sử dụng `open()`, một số ví dụ trong đó sử dụng các bit cờ bổ sung mà chúng ta sẽ mô tả ngắn gọn sau đây.

<span id="page-52-1"></span> **Mã nguồn 4-2:** Các ví dụ về việc sử dụng open()
```c
/* Mở file hiện có để đọc */
fd = open("startup", O_RDONLY);
if (fd == -1)
    errExit("open");

/* Mở file mới hoặc file hiện có để đọc và ghi, cắt ngắn (truncate) về 0 byte;
   quyền file đọc+ghi cho chủ sở hữu, không có quyền cho tất cả những người khác */
fd = open("myfile", O_RDWR | O_CREAT | O_TRUNC, S_IRUSR | S_IWUSR);
if (fd == -1)
    errExit("open");

/* Mở file mới hoặc file hiện có để ghi; các thao tác ghi luôn ghi bổ sung (append) vào cuối file */
fd = open("w.log", O_WRONLY | O_CREAT | O_TRUNC | O_APPEND,
          S_IRUSR | S_IWUSR);
if (fd == -1)
    errExit("open");
```

### Số file descriptor được trả về bởi open()

SUSv3 đặc tả rằng nếu `open()` thành công, nó được đảm bảo sử dụng file descriptor chưa được sử dụng có số nhỏ nhất cho tiến trình. Chúng ta có thể sử dụng tính năng này để đảm bảo rằng một file được mở bằng một file descriptor cụ thể. Ví dụ, chuỗi lệnh sau đảm bảo rằng một file được mở bằng đầu vào chuẩn (file descriptor 0).

```c
if (close(STDIN_FILENO) == -1) /* Đóng file descriptor 0 */
    errExit("close");
fd = open(pathname, O_RDONLY);
if (fd == -1)
    errExit("open");
```

Vì file descriptor 0 chưa được sử dụng, `open()` được đảm bảo sẽ mở file bằng cách sử dụng descriptor đó. Trong Mục 5.5, chúng ta sẽ xem xét việc sử dụng `dup2()` và `fcntl()` để đạt được kết quả tương tự, nhưng với khả năng kiểm soát linh hoạt hơn đối với file descriptor được sử dụng. Trong mục đó, chúng ta cũng chỉ ra một ví dụ về lý do tại sao việc kiểm soát file descriptor mà một file được mở trên đó lại có thể hữu ích.


### 4.3.1 Đối số flags của open()

<span id="page-53-0"></span>Trong một số ví dụ gọi `open()` ở Mã nguồn 4-2, chúng ta đã bao gồm các bit khác (`O_CREAT`, `O_TRUNC`, và `O_APPEND`) trong `flags` bên cạnh chế độ truy cập file. Bây giờ chúng ta xem xét đối số `flags` chi tiết hơn. Bảng 4-3 tóm tắt toàn bộ các hằng số có thể được OR theo bit (`|`) trong `flags`. Cột cuối cùng chỉ ra hằng số nào trong số này được chuẩn hóa trong SUSv3 hoặc SUSv4.

**Bảng 4-3:** Các giá trị cho đối số flags của open()

| Cờ (Flag) | Mục đích | SUS? |
| ------ | ------ | ------ |
| O_RDONLY | Mở chỉ để đọc | v3 |
| O_WRONLY | Mở chỉ để ghi | v3 |
| O_RDWR | Mở để đọc và ghi | v3 |
| O_CLOEXEC | Đặt cờ close-on-exec (từ Linux 2.6.23) | v4 |
| O_CREAT | Tạo file nếu nó chưa tồn tại | v3 |
| O_DIRECT | I/O file bỏ qua bộ đệm đệm (buffer cache) |  |
| O_DIRECTORY | Báo lỗi nếu pathname không phải là thư mục | v4 |
| O_EXCL | Cùng với O_CREAT: tạo file độc quyền (exclusively) | v3 |
| O_LARGEFILE | Sử dụng trên hệ thống 32-bit để mở file lớn |  |
| O_NOATIME | Không cập nhật thời gian truy cập cuối cùng của file khi read() (từ Linux 2.6.8) |  |
| O_NOCTTY | Không cho pathname trở thành terminal điều khiển | v3 |
| O_NOFOLLOW | Không giải tham chiếu các symbolic link | v4 |
| O_TRUNC | Cắt ngắn (truncate) file hiện có về độ dài 0 | v3 |
| O_APPEND | Các thao tác ghi luôn được nối vào cuối file | v3 |
| O_ASYNC | Tạo tín hiệu khi I/O là khả thi |  |
| O_DSYNC | Cung cấp tính toàn vẹn dữ liệu I/O đồng bộ (từ Linux 2.6.33) | v3 |
| O_NONBLOCK | Mở ở chế độ không chặn (nonblocking mode) | v3 |
| O_SYNC | Làm cho các thao tác ghi file mang tính đồng bộ | v3 |

Các hằng số trong Bảng 4-3 được chia thành các nhóm sau:

* Các cờ chế độ truy cập file (File access mode flags): Đây là các cờ `O_RDONLY`, `O_WRONLY`, và `O_RDWR` được mô tả trước đó. Chúng có thể được lấy ra bằng cách sử dụng thao tác `fcntl()` `F_GETFL` (Mục 5.3).
* Các cờ tạo file (File creation flags): Đây là các cờ được hiển thị ở phần thứ hai của Bảng 4-3. Chúng kiểm soát các khía cạnh khác nhau trong hành vi của lời gọi `open()`, cũng như các tùy chọn cho các thao tác I/O tiếp theo. Các cờ này không thể lấy ra hoặc thay đổi.
* Các cờ trạng thái file đang mở (Open file status flags): Đây là các cờ còn lại trong Bảng 4-3. Chúng có thể được lấy ra và sửa đổi bằng cách sử dụng các thao tác `fcntl()` `F_GETFL` và `F_SETFL` (Mục 5.3). Các cờ này đôi khi được gọi đơn giản là các cờ trạng thái file (file status flags).

Từ kernel 2.6.22, các file đặc thù Linux trong thư mục `/proc/PID/fdinfo` có thể được đọc để lấy thông tin về các file descriptor của bất kỳ tiến trình nào trên hệ thống. Có một file trong thư mục này cho mỗi file descriptor đang mở của tiến trình, với tên khớp với số của descriptor đó. Trường `pos` trong file này hiển thị vị trí con trỏ file hiện tại (file offset - Mục 4.7). Trường `flags` là một số bát phân hiển thị các cờ chế độ truy cập file và các cờ trạng thái file đang mở. (Để giải mã số này, chúng ta cần nhìn vào giá trị số của các cờ này trong các file header của thư viện C.)

Chi tiết về các hằng số cờ như sau:

#### O_APPEND
Các thao tác ghi luôn được nối vào cuối file. Chúng ta sẽ thảo luận về ý nghĩa của cờ này trong Mục 5.1.

#### O_ASYNC
Tạo một tín hiệu khi I/O trở nên khả thi trên file descriptor do `open()` trả về. Tính năng này, được gọi là I/O theo định hướng tín hiệu (signal-driven I/O), chỉ khả dụng cho một số loại file nhất định, chẳng hạn như terminal, FIFO, và socket. (Cờ `O_ASYNC` không được đặc tả trong SUSv3; tuy nhiên, nó, hoặc tên đồng nghĩa cũ hơn `FASYNC`, được tìm thấy trên hầu hết các bản triển khai UNIX.) Trên Linux, việc chỉ định cờ `O_ASYNC` khi gọi `open()` không có tác dụng. Để bật I/O theo định hướng tín hiệu, thay vào đó chúng ta phải đặt cờ này bằng thao tác `fcntl()` `F_SETFL` (Mục 5.3). (Một số bản triển khai UNIX khác cũng hoạt động tương tự.) Tham khảo Mục 63.3 để biết thêm thông tin về cờ `O_ASYNC`.

#### O_CLOEXEC (từ Linux 2.6.23)
Bật cờ close-on-exec (`FD_CLOEXEC`) cho file descriptor mới. Chúng ta mô tả cờ `FD_CLOEXEC` trong Mục 27.4. Việc sử dụng cờ `O_CLOEXEC` cho phép một chương trình tránh các thao tác `fcntl()` `F_SETFD` bổ sung để đặt cờ close-on-exec. Nó cũng cần thiết trong các chương trình đa luồng để tránh điều kiện tranh chấp (race conditions) có thể xảy ra khi sử dụng kỹ thuật sau. Các cuộc tranh chấp này có thể xảy ra khi một luồng mở một file descriptor và sau đó cố gắng đánh dấu nó là close-on-exec cùng lúc với một luồng khác thực hiện `fork()` và sau đó là `exec()` một chương trình tùy ý. (Giả sử rằng luồng thứ hai quản lý để vừa `fork()` và `exec()` trong khoảng thời gian giữa lúc luồng thứ nhất mở file descriptor và dùng `fcntl()` để đặt cờ close-on-exec.) Những tranh chấp như vậy có thể dẫn đến việc các file descriptor đang mở vô tình bị chuyển sang cho các chương trình không an toàn. (Chúng ta sẽ nói thêm về điều kiện tranh chấp trong Mục 5.1.)

#### O_CREAT
Nếu file chưa tồn tại, nó được tạo dưới dạng một file mới, rỗng. Cờ này có hiệu lực ngay cả khi file chỉ được mở để đọc. Nếu chúng ta chỉ định `O_CREAT`, thì chúng ta phải cung cấp đối số `mode` trong lời gọi `open()`; nếu không, các quyền của file mới sẽ được đặt thành một giá trị ngẫu nhiên nào đó từ stack.

#### O_DIRECT
Cho phép I/O file bỏ qua bộ đệm đệm (buffer cache). Tính năng này được mô tả trong Mục 13.6. Macro kiểm tra tính năng `_GNU_SOURCE` phải được định nghĩa để làm cho định nghĩa hằng số này có sẵn từ `<fcntl.h>`.

#### O_DIRECTORY
Trả về một lỗi (`errno` bằng `ENOTDIR`) nếu `pathname` không phải là một thư mục. Cờ này là một mở rộng được thiết kế đặc biệt để triển khai `opendir()` (Mục 18.8). Macro kiểm tra tính năng `_GNU_SOURCE` phải được định nghĩa để làm cho định nghĩa hằng số này có sẵn từ `<fcntl.h>`.

#### O_DSYNC (từ Linux 2.6.33)
Thực hiện ghi file theo các yêu cầu về hoàn tất tính toàn vẹn dữ liệu I/O đồng bộ (synchronized I/O data integrity completion). Xem thảo luận về đệm I/O của kernel trong Mục 13.3.

#### O_EXCL
Cờ này được sử dụng kết hợp với `O_CREAT` để chỉ ra rằng nếu file đã tồn tại, nó sẽ không được mở; thay vào đó, `open()` sẽ thất bại, với `errno` được đặt thành `EEXIST`. Nói cách khác, cờ này cho phép bên gọi đảm bảo rằng chính tiến trình đó là bên tạo ra file. Việc kiểm tra sự tồn tại và việc tạo file được thực hiện một cách nguyên tử (atomically). Chúng ta thảo luận về khái niệm tính nguyên tử (atomicity) trong Mục 5.1. Khi cả `O_CREAT` và `O_EXCL` được chỉ định trong `flags`, `open()` sẽ thất bại (với lỗi `EEXIST`) nếu `pathname` là một symbolic link. SUSv3 yêu cầu hành vi này để một ứng dụng có đặc quyền có thể tạo một file ở một vị trí đã biết mà không có khả năng là một symbolic link sẽ khiến file đó được tạo ở một vị trí khác (ví dụ: một thư mục hệ thống), điều này sẽ có những ảnh hưởng về mặt bảo mật.

#### O_LARGEFILE
Mở file với sự hỗ trợ file lớn (large file support). Cờ này được sử dụng trên các hệ thống 32-bit để làm việc với các file lớn. Mặc dù không được đặc tả trong SUSv3, cờ `O_LARGEFILE` được tìm thấy trên một số bản triển khai UNIX khác. Trên các triển khai Linux 64-bit như Alpha và IA-64, cờ này không có hiệu lực. Xem Mục 5.10 để biết thêm thông tin.

#### O_NOATIME (từ Linux 2.6.8)
Không cập nhật thời gian truy cập cuối cùng của file (trường `st_atime` được mô tả trong Mục 15.1) khi đọc từ file này. Để sử dụng cờ này, user ID hiệu lực của tiến trình gọi phải khớp với chủ sở hữu của file, hoặc tiến trình phải có đặc quyền (`CAP_FOWNER`); nếu không, `open()` thất bại với lỗi `EPERM`. (Trong thực tế, đối với một tiến trình không có đặc quyền, chính file-system user ID của tiến trình, chứ không phải user ID hiệu lực của nó, mới là cái phải khớp với user ID của file khi mở file với cờ `O_NOATIME`, như được mô tả trong Mục 9.5.) Cờ này là một mở rộng Linux không chuẩn. Để hiển thị định nghĩa của nó từ `<fcntl.h>`, chúng ta phải định nghĩa macro kiểm tra tính năng `_GNU_SOURCE`. Cờ `O_NOATIME` được thiết kế để sử dụng bởi các chương trình đánh chỉ mục và sao lưu. Việc sử dụng nó có thể làm giảm đáng kể dung lượng hoạt động của đĩa, bởi vì việc di chuyển đầu đọc đĩa qua lại liên tục trên đĩa không còn bị bắt buộc chỉ để đọc nội dung của file và cập nhật thời gian truy cập cuối cùng trong i-node của file (Mục 14.4). Chức năng tương tự `O_NOATIME` cũng có sẵn bằng cờ `MS_NOATIME` của `mount()` (Mục 14.8.1) và cờ `FS_NOATIME_FL` (Mục 15.5).

#### O_NOCTTY
Nếu file đang được mở là một thiết bị terminal, hãy ngăn không cho nó trở thành terminal điều khiển (controlling terminal). Terminal điều khiển được thảo luận trong Mục 34.4. Nếu file đang được mở không phải là terminal, cờ này không có hiệu lực.

#### O_NOFOLLOW
Thông thường, `open()` giải tham chiếu `pathname` nếu nó là một symbolic link. Tuy nhiên, nếu cờ `O_NOFOLLOW` được chỉ định, thì `open()` thất bại (với `errno` được đặt thành `ELOOP`) nếu `pathname` là một symbolic link. Cờ này hữu ích, đặc biệt là trong các chương trình có đặc quyền, để đảm bảo rằng `open()` không giải tham chiếu một symbolic link. Để hiển thị định nghĩa của cờ này từ `<fcntl.h>`, chúng ta phải định nghĩa macro kiểm tra tính năng `_GNU_SOURCE`.

#### O_NONBLOCK
Mở file ở chế độ không chặn (nonblocking mode). Xem Mục 5.9.

#### O_SYNC
Mở file cho I/O đồng bộ (synchronous I/O). Xem thảo luận về đệm I/O của kernel trong Mục 13.3.

#### O_TRUNC
Nếu file đã tồn tại và là một file thông thường, hãy cắt ngắn (truncate) nó về độ dài 0, xóa bỏ mọi dữ liệu hiện có. Trên Linux, việc cắt ngắn diễn ra cho dù file đang được mở để đọc hay ghi (trong cả hai trường hợp, chúng ta phải có quyền ghi trên file). SUSv3 để lửng sự kết hợp của `O_RDONLY` và `O_TRUNC` không đặc tả, nhưng hầu hết các bản triển khai UNIX khác đều hoạt động theo cách tương tự như Linux.

### 4.3.2 Các lỗi từ open()

Nếu xảy ra lỗi khi cố gắng mở file, `open()` trả về –1, và `errno` xác định nguyên nhân gây ra lỗi. Sau đây là một số lỗi có thể xảy ra (bên cạnh các lỗi đã lưu ý khi mô tả đối số `flags` ở trên):

#### EACCES
Quyền truy cập file không cho phép tiến trình gọi mở file ở chế độ được chỉ định bởi `flags`. Hoặc, do quyền của thư mục, file không thể truy cập được, hoặc file không tồn tại và không thể tạo được.

#### EISDIR
File được chỉ định là một thư mục, và bên gọi đã cố gắng mở nó để ghi. Điều này không được cho phép. (Mặt khác, có những lúc việc mở một thư mục để đọc lại hữu ích. Chúng ta xem xét một ví dụ trong Mục 18.11.)

#### EMFILE
Giới hạn tài nguyên tiến trình về số lượng file descriptor đang mở đã đạt tới ngưỡng (`RLIMIT_NOFILE`, được mô tả trong Mục 36.3).

#### ENFILE
Giới hạn toàn hệ thống về số lượng file đang mở đã đạt tới ngưỡng.

#### ENOENT
File được chỉ định không tồn tại, và `O_CREAT` không được chỉ định, hoặc `O_CREAT` đã được chỉ định, và một trong các thư mục trong `pathname` không tồn tại hoặc là một symbolic link trỏ đến một pathname không tồn tại (một dangling link).

#### EROFS
File được chỉ định nằm trên một file system chỉ đọc và bên gọi đã cố mở nó để ghi.

#### ETXTBSY
File được chỉ định là một file thực thi (chương trình) hiện đang chạy. Không được phép sửa đổi (tức là mở để ghi) file thực thi liên kết với một chương trình đang chạy. (Trước tiên chúng ta phải kết thúc chương trình đó để có thể sửa đổi file thực thi.)

Khi mô tả các system call hoặc thư viện hàm khác sau này, chúng tôi nhìn chung sẽ không liệt kê một phạm vi các lỗi có thể xảy ra theo cách ở trên. (Danh sách như vậy có thể tìm thấy trong trang tài liệu manual page tương ứng cho từng system call hoặc thư viện hàm.) Chúng tôi làm như vậy ở đây vì hai lý do. Một là `open()` là system call đầu tiên mà chúng tôi mô tả chi tiết, và danh sách trên minh họa rằng một system call hoặc thư viện hàm có thể thất bại vì bất kỳ lý do nào trong số nhiều lý do. Thứ hai, các lý do cụ thể khiến `open()` có thể thất bại tự tạo thành một danh sách thú vị, minh họa cho một số yếu tố và phép kiểm tra được đưa vào hoạt động khi một file được truy cập. (Danh sách trên chưa đầy đủ: xem trang tài liệu `open(2)` để biết thêm lý do tại sao `open()` có thể thất bại.)

### 4.3.3 System call creat()

Trong các bản triển khai UNIX sớm hơn, `open()` chỉ có hai đối số và không thể được sử dụng để tạo một file mới. Thay vào đó, system call `creat()` được sử dụng để tạo và mở một file mới.

```c
#include <fcntl.h>

int creat(const char *pathname, mode_t mode);
                                          Trả về file descriptor, hoặc –1 khi lỗi
```

System call `creat()` tạo và mở một file mới với `pathname` đã cho, hoặc nếu file đã tồn tại, nó mở file và cắt ngắn (truncate) nó về độ dài 0. Làm kết quả hàm, `creat()` trả về một file descriptor có thể được sử dụng trong các system call tiếp theo. Việc gọi `creat()` tương đương với lời gọi `open()` sau:

```c
fd = open(pathname, O_WRONLY | O_CREAT | O_TRUNC, mode);
```

Bởi vì đối số `flags` của `open()` cung cấp khả năng kiểm soát tốt hơn đối với cách mở file (ví dụ: chúng ta có thể chỉ định `O_RDWR` thay vì `O_WRONLY`), `creat()` hiện đã lỗi thời, mặc dù nó vẫn có thể được nhìn thấy trong các chương trình cũ hơn.


## 4.4 Đọc từ một tập tin: read()

System call `read()` đọc dữ liệu từ file đang mở được tham chiếu bởi file descriptor `fd`.

```c
#include <unistd.h>

ssize_t read(int fd, void *buffer, size_t count);
                        Trả về số byte đã đọc, 0 khi gặp EOF, hoặc –1 khi lỗi
```

Đối số `count` chỉ định số byte tối đa cần đọc. (Kiểu dữ liệu `size_t` là một kiểu số nguyên không dấu.) Đối số `buffer` cung cấp địa chỉ của vùng đệm bộ nhớ mà dữ liệu đầu vào sẽ được đặt vào. Vùng đệm này phải có độ dài ít nhất là `count` byte.

Các system call không cấp phát bộ nhớ cho các vùng đệm được sử dụng để trả lại thông tin cho bên gọi. Thay vào đó, chúng ta phải truyền một con trỏ tới vùng đệm bộ nhớ đã được cấp phát trước đó với kích thước chính xác. Điều này trái ngược với một số thư viện hàm có thực hiện cấp phát các vùng đệm bộ nhớ để trả lại thông tin cho bên gọi.

Một lời gọi thành công tới `read()` sẽ trả về số byte thực tế đã đọc được, hoặc 0 nếu gặp phải end-of-file. Khi xảy ra lỗi, giá trị thông thường –1 sẽ được trả về. Kiểu dữ liệu `ssize_t` là một kiểu số nguyên có dấu được sử dụng để chứa số lượng byte hoặc chỉ báo lỗi –1.

Một lời gọi `read()` có thể đọc ít hơn số byte được yêu cầu. Đối với một file thông thường, lý do có khả năng xảy ra điều này là chúng ta đã ở gần cuối file.

Khi `read()` được áp dụng cho các loại file khác — chẳng hạn như pipe, FIFO, socket, hoặc terminal — cũng có nhiều trường hợp khác nhau mà nó có thể đọc ít byte hơn so với yêu cầu. Ví dụ, theo mặc định, một lời gọi `read()` từ một terminal chỉ đọc các ký tự cho đến ký tự xuống dòng (`\n`) tiếp theo. Chúng ta sẽ xem xét các trường hợp này khi đề cập đến các loại file khác trong các chương tiếp theo.

Sử dụng `read()` để nhập một chuỗi ký tự từ, chẳng hạn như một terminal, chúng ta có thể kỳ vọng đoạn mã sau đây sẽ hoạt động:

```c
#define MAX_READ 20
char buffer[MAX_READ];

if (read(STDIN_FILENO, buffer, MAX_READ) == -1)
    errExit("read");
printf("The input data was: %s\n", buffer);
```

Đầu ra từ đoạn mã này có khả năng sẽ rất kỳ lạ, vì nó có thể sẽ bao gồm các ký tự bổ sung bên cạnh chuỗi thực tế đã nhập. Điều này là do `read()` không đặt một byte null kết thúc (`\0`) ở cuối chuỗi mà `printf()` đang được yêu cầu in. Một chút suy ngẫm dẫn chúng ta đến nhận thức rằng điều này phải là như vậy, vì `read()` có thể được sử dụng để đọc bất kỳ chuỗi byte nào từ một file. Trong một số trường hợp, đầu vào này có thể là văn bản, nhưng trong các trường hợp khác, đầu vào có thể là các số nguyên dạng nhị phân hoặc các cấu trúc C ở dạng nhị phân. Không có cách nào để `read()` phân biệt được sự khác biệt, và do đó nó không thể tuân theo quy ước của C về việc kết thúc chuỗi ký tự bằng byte null. Nếu cần một byte null kết thúc ở cuối vùng đệm đầu vào, chúng ta phải tự đặt nó vào đó một cách rõ ràng:

```c
char buffer[MAX_READ + 1];
ssize_t numRead;

numRead = read(STDIN_FILENO, buffer, MAX_READ);
if (numRead == -1)
    errExit("read");
buffer[numRead] = '\0';
printf("The input data was: %s\n", buffer);
```

Bởi vì byte null kết thúc yêu cầu một byte bộ nhớ, kích thước của `buffer` phải lớn hơn ít nhất một đơn vị so với chuỗi lớn nhất mà chúng ta kỳ vọng đọc được.

## 4.5 Ghi vào một tập tin: write()

System call `write()` ghi dữ liệu vào một file đang mở.

```c
#include <unistd.h>

ssize_t write(int fd, void *buffer, size_t count);
                                Trả về số byte đã ghi, hoặc –1 khi lỗi
```

Các đối số đối với `write()` tương tự như các đối số đối với `read()`: `buffer` là địa chỉ của dữ liệu cần ghi; `count` là số byte cần ghi từ `buffer`; và `fd` là file descriptor tham chiếu đến file mà dữ liệu sẽ được ghi vào.

Khi thành công, `write()` trả về số byte thực tế đã ghi; số này có thể nhỏ hơn `count`. Đối với một file đĩa, các lý do có thể cho việc ghi một phần (partial write) như vậy là do đĩa đã đầy hoặc đã đạt tới giới hạn tài nguyên tiến trình về kích thước file. (Giới hạn có liên quan là `RLIMIT_FSIZE`, được mô tả trong Mục 36.3.)

Khi thực hiện I/O trên một file đĩa, một kết quả trả về thành công từ `write()` không đảm bảo rằng dữ liệu đã được chuyển ra đĩa, bởi vì kernel thực hiện đệm đĩa I/O (buffering of disk I/O) nhằm giảm hoạt động của đĩa và tăng tốc các lời gọi `write()`. Chúng ta sẽ xem xét chi tiết trong Chương 13.

## 4.6 Đóng một tập tin: close()

System call `close()` đóng một file descriptor đang mở, giải phóng nó để tái sử dụng sau đó bởi tiến trình. Khi một tiến trình kết thúc, tất cả các file descriptor đang mở của nó sẽ tự động bị đóng.

```c
#include <unistd.h>

int close(int fd);
                                              Trả về 0 khi thành công, hoặc –1 khi lỗi
```

Việc đóng các file descriptor không cần thiết một cách rõ ràng thường là một thực hành tốt, vì điều này làm cho mã của chúng ta dễ đọc hơn và tin cậy hơn trước những sửa đổi sau đó. Hơn nữa, các file descriptor là một tài nguyên có thể bị tiêu tốn hết, do đó việc không đóng file descriptor có thể dẫn đến việc tiến trình hết descriptor. Đây là một vấn đề đặc biệt quan trọng khi viết các chương trình chạy lâu dài xử lý nhiều file, chẳng hạn như shell hoặc máy chủ mạng.

Cũng giống như mọi system call khác, một lời gọi `close()` nên được bao bọc bằng mã kiểm tra lỗi, chẳng hạn như sau:

```c
if (close(fd) == -1)
    errExit("close");
```

Điều này bắt được các lỗi chẳng hạn như cố gắng đóng một file descriptor chưa mở hoặc đóng cùng một file descriptor hai lần, và bắt các điều kiện lỗi mà một file system cụ thể có thể chẩn đoán trong một thao tác đóng.

NFS (Network File System) cung cấp một ví dụ về một lỗi đặc thù đối với một file system. Nếu xảy ra lỗi commit NFS, có nghĩa là dữ liệu chưa tới được đĩa từ xa, thì lỗi này được lan truyền tới ứng dụng như một sự thất bại trong lời gọi `close()`.

## 4.7 Thay đổi vị trí con trỏ tập tin: lseek()

<span id="page-60-0"></span>Đối với mỗi file đang mở, kernel ghi lại một vị trí con trỏ file (file offset), đôi khi còn được gọi là read-write offset hoặc pointer. Đây là vị trí trong file mà lời gọi `read()` hoặc `write()` tiếp theo sẽ bắt đầu. File offset được biểu diễn dưới dạng vị trí byte thứ tự so với điểm bắt đầu của file. Byte đầu tiên của file ở vị trí offset 0.

File offset được đặt trỏ đến điểm bắt đầu của file khi file được mở và được tự động điều chỉnh bởi mỗi lời gọi `read()` hoặc `write()` sau đó để nó trỏ đến byte tiếp theo của file ngay sau (các) byte vừa được đọc hoặc ghi. Do đó, các lời gọi `read()` và `write()` liên tiếp sẽ tiến triển tuần tự qua một file.

System call `lseek()` điều chỉnh file offset của file đang mở được tham chiếu bởi file descriptor `fd`, theo các giá trị được chỉ định trong `offset` và `whence`.

```c
#include <unistd.h>

off_t lseek(int fd, off_t offset, int whence);
                               Trả về vị trí file offset mới nếu thành công, hoặc –1 khi lỗi
```

Đối số `offset` chỉ định một giá trị tính bằng byte. (Kiểu dữ liệu `off_t` là một kiểu số nguyên có dấu được đặc tả bởi SUSv3.) Đối số `whence` chỉ ra điểm cơ sở mà từ đó `offset` sẽ được giải thích, và là một trong các giá trị sau:

### SEEK_SET
File offset được đặt thành `offset` byte tính từ đầu file.

### SEEK_CUR
File offset được điều chỉnh thêm `offset` byte tương quan với vị trí file offset hiện tại.

### SEEK_END
File offset được đặt thành kích thước của file cộng với `offset`. Nói cách khác, `offset` được giải thích tương quan với byte tiếp theo sau byte cuối cùng của file.

Hình 4-1 hiển thị cách đối số `whence` được giải thích.

Trong các bản triển khai UNIX sớm hơn, các số nguyên 0, 1, và 2 đã được sử dụng, thay vì các hằng số `SEEK_*` được hiển thị trong văn bản chính. Các phiên bản BSD cũ hơn sử dụng các tên khác nhau cho các giá trị này: `L_SET`, `L_INCR`, và `L_XTND`.

```text
                      File chứa N byte dữ liệu
        <-------------------------------------------------------->

Số
byte        0     1     ...     ...     N-2     N-1     N     N+1
           +-----+-----+-----+-----+-----+-----+-----+-----+-----+
           |  0  |  1  | ... | ... | N-2 | N-1 |     |     |     |
           +-----+-----+-----+-----+-----+-----+-----+-----+-----+
                                                  ^     ^
                                                  |     |
                                            Các byte chưa ghi
                                               qua EOF

                              ^
                              |
                       File offset hiện tại
```

**Hình 4-1:** Giải thích đối số whence của lseek()

Nếu `whence` là `SEEK_CUR` hoặc `SEEK_END`, `offset` có thể âm hoặc dương; đối với `SEEK_SET`, `offset` phải không âm.

Giá trị trả về từ một lời gọi `lseek()` thành công là vị trí file offset mới. Lời gọi sau đây lấy ra vị trí hiện tại của file offset mà không làm thay đổi nó:

```c
curr = lseek(fd, 0, SEEK_CUR);
```

Một số bản triển khai UNIX (nhưng không phải Linux) có hàm không chuẩn `tell(fd)`, phục vụ cùng mục đích như lời gọi `lseek()` ở trên.

Dưới đây là một số ví dụ khác về các lời gọi `lseek()`, cùng với các ghi chú chỉ ra vị trí file offset được di chuyển tới đâu:

```c
lseek(fd, 0, SEEK_SET);      /* Đầu file */
lseek(fd, 0, SEEK_END);      /* Byte tiếp theo sau cuối file */
lseek(fd, -1, SEEK_END);     /* Byte cuối cùng của file */
lseek(fd, -10, SEEK_CUR);    /* Mười byte trước vị trí hiện tại */
lseek(fd, 10000, SEEK_END);  /* 10001 byte sau byte cuối cùng của file */
```

Việc gọi `lseek()` chỉ đơn thuần điều chỉnh bản ghi của kernel về file offset liên kết với một file descriptor. Nó không gây ra bất kỳ truy cập thiết bị vật lý nào.

Chúng tôi mô tả thêm một số chi tiết về mối quan hệ giữa file offset, file descriptor, và các file đang mở trong Mục 5.4.

Chúng ta không thể áp dụng `lseek()` cho tất cả các loại file. Việc áp dụng `lseek()` cho một pipe, FIFO, socket, hoặc terminal là không được phép; `lseek()` sẽ thất bại, với `errno` được đặt thành `ESPIPE`. Mặt khác, có thể áp dụng `lseek()` cho các thiết bị mà việc làm đó là hợp lý. Ví dụ, có thể seek đến một vị trí được chỉ định trên một thiết bị đĩa hoặc băng ghi.

Chữ `l` trong tên `lseek()` bắt nguồn từ thực tế là đối số `offset` và giá trị trả về ban đầu đều có kiểu là `long`. Các bản triển khai UNIX sớm hơn đã cung cấp một system call `seek()`, có kiểu của các giá trị này là `int`.

### Lỗ hổng tập tin (File holes)

Điều gì xảy ra nếu một chương trình seek qua khỏi cuối của một file, và sau đó thực hiện I/O? Một lời gọi `read()` sẽ trả về 0, chỉ ra end-of-file. Khá bất ngờ là có thể ghi các byte tại một điểm tùy ý vượt qua cuối file.

Khoảng trống ở giữa cuối file trước đó và các byte mới được ghi được gọi là một lỗ hổng tập tin (file hole). Từ góc độ lập trình, các byte trong một lỗ hổng tồn tại, và việc đọc từ lỗ hổng đó sẽ trả về một vùng đệm các byte chứa 0 (null byte).

Tuy nhiên, các lỗ hổng tập tin không chiếm bất kỳ dung lượng đĩa nào. File system không cấp phát bất kỳ block đĩa nào cho một lỗ hổng cho đến khi, tại một điểm sau đó, dữ liệu được ghi vào đó. Ưu điểm chính của các lỗ hổng tập tin là một file thưa (sparsely populated file) tiêu tốn ít dung lượng đĩa hơn so với mức bắt buộc nếu các null byte thực sự cần được cấp phát trong các block đĩa. File core dump (Mục 22.1) là ví dụ phổ biến về các file chứa các lỗ hổng lớn.

Phát biểu rằng các lỗ hổng tập tin không tiêu tốn dung lượng đĩa cần phải được làm rõ hơn một chút. Trên hầu hết các file system, dung lượng file được cấp phát theo đơn vị các block (Mục 14.3). Kích thước của một block phụ thuộc vào file system, nhưng thường là khoảng 1024, 2048, hoặc 4096 byte. Nếu mép của một lỗ hổng rơi vào bên trong một block, thay vì trên một ranh giới block, thì một block hoàn chỉnh sẽ được cấp phát để lưu trữ dữ liệu ở phần khác của block, và phần tương ứng với lỗ hổng được lấp đầy bằng các null byte.

Hầu hết các bản triển khai UNIX file system bản địa đều hỗ trợ khái niệm lỗ hổng tập tin, nhưng nhiều file system không bản địa (ví dụ: VFAT của Microsoft) thì không. Trên một file system không hỗ trợ các lỗ hổng, các null byte rõ ràng sẽ được ghi vào file.

Sự tồn tại của các lỗ hổng có nghĩa là kích thước danh nghĩa (nominal size) của một file có thể lớn hơn dung lượng lưu trữ đĩa mà nó sử dụng (trong một số trường hợp, lớn hơn đáng kể). Việc ghi các byte vào giữa lỗ hổng tập tin sẽ làm giảm dung lượng đĩa trống khi kernel cấp phát các block để lấp đầy lỗ hổng, mặc dù kích thước của file không thay đổi. Một kịch bản như vậy là không phổ biến, nhưng dù sao cũng là điều cần lưu ý.

SUSv3 đặc tả một hàm, `posix_fallocate(fd, offset, len)`, đảm bảo rằng dung lượng được cấp phát trên đĩa cho phạm vi byte được chỉ định bởi `offset` và `len` đối với file đĩa được tham chiếu bởi descriptor `fd`. Điều này cho phép một ứng dụng đảm bảo rằng lời gọi `write()` sau đó tới file sẽ không thất bại vì hết dung lượng đĩa (điều có thể xảy ra nếu một lỗ hổng trong file được lấp đầy, hoặc một ứng dụng khác tiêu tốn dung lượng trên đĩa). Trong lịch sử, bản triển khai glibc của hàm này đạt được kết quả mong muốn bằng cách ghi một byte 0 vào mỗi block trong phạm vi được chỉ định. Từ phiên bản 2.6.23, Linux cung cấp một system call `fallocate()`, cung cấp một cách hiệu quả hơn để đảm bảo rằng dung lượng cần thiết được cấp phát, và bản triển khai `posix_fallocate()` của glibc sử dụng system call này khi nó khả dụng.

Mục 14.4 mô tả cách các lỗ hổng được biểu diễn trong một file, và Mục 15.1 mô tả system call `stat()`, có thể cho chúng ta biết kích thước hiện tại của một file, cũng như số lượng block thực sự được cấp phát cho file.

### Chương trình ví dụ

Mã nguồn 4-3 minh họa việc sử dụng `lseek()` kết hợp với `read()` và `write()`. Đối số dòng lệnh đầu tiên cho chương trình này là tên của một file cần mở. Các đối số còn lại chỉ định các thao tác I/O sẽ được thực hiện trên file. Mỗi thao tác này bao gồm một chữ cái theo sau bởi một giá trị tương ứng (không có khoảng trắng phân cách):

* `soffset`: Seek tới vị trí byte `offset` tính từ đầu file.
* `rlength`: Đọc `length` byte từ file, bắt đầu tại file offset hiện tại, và hiển thị chúng ở dạng văn bản.
* `Rlength`: Đọc `length` byte từ file, bắt đầu tại file offset hiện tại, và hiển thị chúng ở dạng thập lục phân (hexadecimal).
* `wstr`: Ghi chuỗi ký tự được chỉ định trong `str` tại vị trí file offset hiện tại.

<span id="page-63-0"></span> **Mã nguồn 4-3:** Minh họa về read(), write(), và lseek()
```c
––––––––––––––––––––––––––––––––––––––––––––––––––––––––– fileio/seek_io.c
#include <sys/stat.h>
#include <fcntl.h>
#include <ctype.h>
#include "tlpi_hdr.h"

int
main(int argc, char *argv[])
{
    size_t len;
    off_t offset;
    int fd, ap, j;
    char *buf;
    ssize_t numRead, numWritten;

    if (argc < 3 || strcmp(argv[1], "--help") == 0)
        usageErr("%s file {r<length>|R<length>|w<string>|s<offset>}...\n",
                 argv[0]);

    fd = open(argv[1], O_RDWR | O_CREAT,
              S_IRUSR | S_IWUSR | S_IRGRP | S_IWGRP |
              S_IROTH | S_IWOTH); /* rw-rw-rw- */
    if (fd == -1)
        errExit("open");

    for (ap = 2; ap < argc; ap++) {
        switch (argv[ap][0]) {
        case 'r': /* Hiển thị các byte tại offset hiện tại, dưới dạng văn bản */
        case 'R': /* Hiển thị các byte tại offset hiện tại, dưới dạng hex */
            len = getLong(&argv[ap][1], GN_ANY_BASE, argv[ap]);
            buf = malloc(len);
            if (buf == NULL)
                errExit("malloc");

            numRead = read(fd, buf, len);
            if (numRead == -1)
                errExit("read");

            if (numRead == 0) {
                printf("%s: end-of-file\n", argv[ap]);
            } else {
                printf("%s: ", argv[ap]);
                for (j = 0; j < numRead; j++) {
                    if (argv[ap][0] == 'r')
                        printf("%c", isprint((unsigned char) buf[j]) ?
                                     buf[j] : '?');
                    else
                        printf("%02x ", (unsigned int) buf[j]);
                }
                printf("\n");
            }
            free(buf);
            break;

        case 'w': /* Ghi chuỗi tại offset hiện tại */
            numWritten = write(fd, &argv[ap][1], strlen(&argv[ap][1]));
            if (numWritten == -1)
                errExit("write");
            printf("%s: wrote %ld bytes\n", argv[ap], (long) numWritten);
            break;

        case 's': /* Thay đổi file offset */
            offset = getLong(&argv[ap][1], GN_ANY_BASE, argv[ap]);
            if (lseek(fd, offset, SEEK_SET) == -1)
                errExit("lseek");
            printf("%s: seek succeeded\n", argv[ap]);
            break;

        default:
            cmdLineErr("Argument must start with [rRws]: %s\n", argv[ap]);
        }
    }

    exit(EXIT_SUCCESS);
}
––––––––––––––––––––––––––––––––––––––––––––––––––––––––– fileio/seek_io.c
```

Nhật ký phiên tương tác shell sau đây minh họa việc sử dụng chương trình trong Mã nguồn 4-3, cho thấy điều gì xảy ra khi chúng ta cố gắng đọc các byte từ một lỗ hổng tập tin:

```bash
$ touch tfile                      Tạo file mới, rỗng
$ ./seek_io tfile s100000 wabc     Seek tới offset 100,000, ghi "abc"
s100000: seek succeeded
wabc: wrote 3 bytes
$ ls -l tfile                      Kiểm tra kích thước file
-rw-r--r-- 1 mtk users 100003 Feb 10 10:35 tfile
$ ./seek_io tfile s10000 R5        Seek tới offset 10,000, đọc 5 byte từ lỗ hổng
s10000: seek succeeded
R5: 00 00 00 00 00                 Các byte trong lỗ hổng chứa 0
```


## 4.8 Các thao tác nằm ngoài mô hình I/O phổ quát: ioctl()

System call `ioctl()` là một cơ chế tổng quát để thực hiện các thao tác trên file và thiết bị nằm ngoài mô hình I/O phổ quát được mô tả ở phần trước trong chương này.

```c
#include <sys/ioctl.h>

int ioctl(int fd, int request, ... /* argp */);
                   Giá trị trả về khi thành công phụ thuộc vào request, hoặc –1 khi lỗi
```

Đối số `fd` là một file descriptor đang mở cho thiết bị hoặc file mà thao tác kiểm soát được chỉ định bởi `request` sẽ được thực hiện trên đó. Các file header đặc thù cho thiết bị định nghĩa các hằng số có thể được truyền trong đối số `request`.

Như được chỉ ra bởi dấu chấm ba chấm (`...`) tiêu chuẩn của C, đối số thứ ba đối với `ioctl()`, mà chúng tôi đánh nhãn là `argp`, có thể có bất kỳ kiểu nào. Giá trị của đối số `request` cho phép `ioctl()` xác định kiểu giá trị nào được kỳ vọng trong `argp`. Thông thường, `argp` là một con trỏ tới một số nguyên hoặc một cấu trúc; trong một số trường hợp, nó không được sử dụng.

Chúng ta sẽ thấy một số trường hợp sử dụng `ioctl()` trong các chương sau (xem, ví dụ, Mục 15.5).

Đặc tả duy nhất mà SUSv3 thực hiện cho `ioctl()` là đối với các thao tác kiểm soát các thiết bị STREAMS. (Tính năng STREAMS là một tính năng của System V không được hỗ trợ bởi mainline Linux kernel, mặc dù một vài bản triển khai bổ sung đã được phát triển.) Không có thao tác `ioctl()` nào khác được mô tả trong cuốn sách này được đặc tả trong SUSv3. Tuy nhiên, lời gọi `ioctl()` đã là một phần của hệ thống UNIX kể từ các phiên bản sớm hơn, và do đó một số thao tác `ioctl()` mà chúng tôi mô tả được cung cấp trên nhiều bản triển khai UNIX khác. Khi mô tả từng thao tác `ioctl()`, chúng tôi sẽ lưu ý các vấn đề về tính di động.

## 4.9 Tóm tắt

Để thực hiện I/O trên một file thông thường, trước tiên chúng ta phải lấy một file descriptor bằng cách sử dụng `open()`. I/O sau đó được thực hiện bằng cách sử dụng `read()` và `write()`. Sau khi thực hiện tất cả I/O, chúng ta nên giải phóng file descriptor và các tài nguyên liên quan của nó bằng `close()`. Các system call này có thể được sử dụng để thực hiện I/O trên tất cả các loại file.

Thực tế là tất cả các loại file và device driver đều triển khai cùng một giao diện I/O cho phép có tính phổ quát của I/O, nghĩa là một chương trình nhìn chung có thể được sử dụng với bất kỳ loại file nào mà không cần mã đặc thù cho loại file đó.

Đối với mỗi file đang mở, kernel duy trì một file offset, xác định vị trí mà tại đó lời gọi read hoặc write tiếp theo sẽ diễn ra. File offset được tự động cập nhật bởi các lời gọi read và write. Sử dụng `lseek()`, chúng ta có thể tái định vị một cách rõ ràng file offset tới bất kỳ vị trí nào trong file hoặc vượt qua khỏi cuối file. Việc ghi dữ liệu tại một vị trí vượt quá cuối file trước đó sẽ tạo ra một lỗ hổng trong file. Các lời gọi đọc từ một lỗ hổng tập tin sẽ trả về các byte chứa các số 0.

System call `ioctl()` là một công cụ tổng hợp cho các thao tác thiết bị và file không vừa vặn với mô hình file I/O chuẩn.

## 4.10 Bài tập

* **4-1.** Lệnh `tee` đọc đầu vào chuẩn của nó cho đến end-of-file, ghi một bản sao của đầu vào ra đầu ra chuẩn và vào file được đặt tên trong đối số dòng lệnh của nó. (Chúng tôi hiển thị một ví dụ về việc sử dụng lệnh này khi thảo luận về FIFO trong Mục 44.7.) Hãy triển khai `tee` bằng các system call I/O. Theo mặc định, `tee` ghi đè lên bất kỳ file hiện có nào với tên đã cho. Hãy triển khai tùy chọn dòng lệnh `-a` (`tee -a file`), làm cho `tee` ghi bổ sung văn bản vào cuối file nếu nó đã tồn tại. (Tham khảo Phụ lục B để biết mô tả về hàm `getopt()`, có thể được sử dụng để phân tích các tùy chọn dòng lệnh.)
* **4-2.** Viết một chương trình giống như `cp` mà khi được sử dụng để sao chép một file thông thường chứa các lỗ hổng (chuỗi các null byte), cũng tạo ra các lỗ hổng tương ứng trong file đích.

