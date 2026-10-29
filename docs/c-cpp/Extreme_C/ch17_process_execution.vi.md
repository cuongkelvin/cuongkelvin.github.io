<a id="_idParaDest-225"></a>

# Chương 17: Process Execution

Giờ chúng ta đã sẵn sàng nói về các hệ thống phần mềm gồm nhiều hơn một process trong architecture tổng thể của chúng. Những hệ thống này thường được gọi là hệ thống multi-process hay multiple-process. Chương này, cùng với chương tiếp theo, cố gắng trình bày các khái niệm multi-processing và tiến hành một phân tích pros-and-cons (ưu và nhược điểm) để so sánh nó với multithreading, vốn đã được chúng ta trình bày trong *Chương 15*, *Thực thi Thread (Thread Execution)*, và *Chương 16*, *Thread Synchronization*.

Trong chương này, trọng tâm của chúng ta là các API và kỹ thuật có sẵn để khởi động một process mới và việc thực thi process thực sự diễn ra như thế nào, và trong chương tiếp theo, chúng ta sẽ đi qua các môi trường concurrent gồm nhiều hơn một process. Chúng tôi sẽ giải thích các state khác nhau có thể được chia sẻ giữa một số process như thế nào và những cách phổ biến để truy cập shared state trong một môi trường multi-processing là gì.

Một phần của chương này dựa trên việc so sánh các môi trường multi-processing và multithreading. Ngoài ra, chúng ta nói ngắn gọn về các hệ thống multi-processing single-host và các hệ thống multi-processing phân tán.

<a id="_idParaDest-226"></a>

## Các API thực thi process

Mọi chương trình đều được thực thi <a id="_idIndexMarker1158"></a>dưới dạng một process. Trước khi có một process, chúng ta chỉ có một executable binary file chứa một số memory segment và có lẽ rất nhiều instruction machine-level. Ngược lại, mỗi process là một instance riêng lẻ của một chương trình đang được thực thi. Do đó, một chương trình đã biên dịch duy nhất (hay một executable binary file) có thể được thực thi nhiều lần thông qua các process khác nhau. Thực tế, đó là lý do tại sao trọng tâm của chúng ta là các process trong chương này, thay vì bản thân các chương trình.

Trong hai chương trước, chúng ta đã nói về thread trong phần mềm single-process, nhưng để theo đuổi mục tiêu của chúng ta trong chương này, chúng ta sẽ nói về phần mềm có nhiều process. Nhưng trước tiên, chúng ta cần biết làm thế nào, và bằng API nào, một process mới có thể được sinh ra.

Lưu ý rằng trọng tâm chính của chúng ta là việc thực thi process trong các hệ điều hành Unix-like vì tất cả chúng đều theo onion architecture của Unix và phơi ra các API rất well-known và tương tự nhau. Các hệ điều hành<a id="_idIndexMarker1159"></a> khác có thể có cách riêng để thực thi process, nhưng vì hầu hết chúng, ít nhiều, đều theo onion architecture của Unix, chúng ta kỳ vọng thấy các phương pháp tương tự để thực thi process.

Trong một hệ điều hành Unix-like, không có nhiều cách để thực thi một process ở mức system call. Nếu bạn còn nhớ *vòng kernel* từ *Chương 11*, *System Call và Kernel*, nó là vòng trong cùng<a id="_idIndexMarker1160"></a> sau *vòng phần cứng*, và nó cung cấp *system call interface* cho các vòng bên ngoài, *shell* và *user*, để cho phép chúng thực thi các chức năng kernel-specific khác nhau. Hai trong số các system call được phơi ra này dành cho việc tạo process và thực thi process; lần lượt là `fork` và `exec` (dù trong Linux là `execve`). Trong *process creation* (tạo process), chúng ta sinh ra một process mới, nhưng trong *process execution* (thực thi process), chúng ta dùng một process hiện có làm host, và chúng ta thay thế nó bằng một chương trình mới; do đó, không có process mới nào được sinh ra trong process execution.

Do việc dùng những system call này, một chương trình luôn được thực thi dưới dạng một process mới, nhưng process này không phải lúc nào cũng được sinh ra! System call `fork` sinh ra một process mới trong khi system call `exec` thay thế process gọi (host) bằng một process mới. Chúng ta nói về những khác biệt giữa các system call `fork` và `exec` sau. Trước đó, hãy xem những system call này được phơi ra cho các vòng bên ngoài như thế nào.

Như chúng tôi đã giải thích trong *Chương 10*, *Unix – Lịch sử và Architecture*, chúng ta có hai chuẩn cho các hệ điều hành Unix-like, cụ thể là về interface mà chúng nên phơi ra từ vòng shell. Những chuẩn này là **Single Unix Specification** (**SUS**) và **POSIX**. Để biết thêm thông tin về những chuẩn này, cùng với những điểm tương đồng và khác biệt của chúng, hãy tham khảo *Chương 10*, *Unix – Lịch sử và Architecture*.

Interface nên được phơi ra từ vòng shell được quy định kỹ lưỡng trong POSIX interface, và thực tế, có những phần trong chuẩn xử lý việc thực thi process và quản lý process.

Do đó, chúng ta sẽ kỳ vọng tìm thấy các header và hàm để tạo process và thực thi process trong POSIX. Những hàm như vậy thực sự tồn tại, và chúng ta tìm thấy chúng trong các header khác nhau cung cấp chức năng mong muốn. Sau đây là danh sách các hàm POSIX chịu trách nhiệm tạo process và thực thi process:

- Hàm `fork` có thể được tìm thấy trong header file `unistd.h` chịu trách nhiệm tạo process.
- Các hàm `posix_spawn` và `posix_spawnp` có thể được tìm thấy trong header file `spawn.h`. Những hàm này chịu trách nhiệm tạo process.
- Nhóm các hàm `exec*`, ví dụ, `execl` và `execlp`, có thể được tìm thấy trong header file `unistd.h`. Những hàm này chịu trách nhiệm thực thi process.

Lưu ý rằng các hàm trên không nên bị nhầm lẫn với các system call `fork` và `exec`. Những<a id="_idIndexMarker1161"></a> hàm này là một phần của POSIX interface được phơi ra từ vòng shell trong khi các system call được phơi ra từ vòng kernel. Trong khi hầu hết các hệ điều hành Unix-like là POSIX-compliant, chúng ta có thể có một hệ thống non-Unix-like cũng POSIX-compliant. Khi đó, các hàm trên tồn tại trong hệ thống đó, nhưng cơ chế bên dưới để sinh ra một process có thể khác ở mức system call.

Một ví dụ hữu hình là việc dùng Cygwin hay MinGW để làm cho Microsoft Windows POSIX-compliant. Bằng việc cài đặt những chương trình này, bạn có thể viết và biên dịch các chương trình C chuẩn đang dùng POSIX interface, và Microsoft Windows trở nên POSIX-compliant một phần, nhưng không có system call `fork` hay `exec` nào trong Microsoft Windows! Điều này thực tế vừa rất khó hiểu vừa rất quan trọng, và bạn nên biết rằng vòng shell không nhất thiết phơi ra cùng interface được vòng kernel phơi ra.

> **Lưu ý**:
>
> Bạn có thể tìm thấy chi tiết triển khai của hàm `fork` trong Cygwin ở đây: https://github.com/openunix/cygwin/blob/master/winsup/cygwin/fork.cc. Lưu ý rằng nó<a id="_idIndexMarker1162"></a> không gọi system call `fork` vốn thường tồn tại trong các kernel Unix-like; thay vào đó, nó include các header từ Win32 API và gọi các hàm vốn là những hàm well-known liên quan đến tạo process và quản lý process.

Theo chuẩn POSIX, thư viện chuẩn C không phải là thứ duy nhất được phơi ra từ vòng shell trên một hệ thống Unix-like. Khi dùng một Terminal, có các chương trình tiện ích shell được viết sẵn được dùng để cung cấp một cách dùng phức tạp của standard C API. Về việc tạo process, bất cứ khi nào người dùng nhập một lệnh trong Terminal, một process mới được tạo ra.

Ngay cả một lệnh `ls` hay `sed` đơn giản cũng sinh ra một process mới có thể chỉ kéo dài chưa đầy một giây. Bạn nên biết rằng những chương trình tiện ích này chủ yếu được viết bằng ngôn ngữ C và chúng đang dùng chính xác cùng POSIX interface mà bạn sẽ dùng khi viết các chương trình của riêng mình.

Shell script cũng được thực thi trong một process riêng nhưng theo một cách hơi khác. Chúng ta sẽ thảo luận chúng trong các phần sau về cách một process được thực thi bên trong một hệ thống Unix-like.

Việc tạo process diễn ra trong kernel, đặc biệt trong các monolithic kernel. Bất cứ khi nào một user process sinh ra một process mới hay thậm chí một thread mới, yêu cầu được system call interface nhận, và nó được chuyển xuống vòng kernel. Ở đó, một *task* mới được tạo ra cho yêu cầu đến, hoặc là một process hoặc là một thread.

Các monolithic kernel như Linux hay FreeBSD theo dõi các task (process và thread) bên trong kernel của chúng, và điều này khiến việc có các process được tạo ra trong chính kernel là hợp lý.

Lưu ý rằng bất cứ khi nào một task mới được tạo ra bên trong kernel, nó được đặt vào hàng đợi của *task scheduler unit* và có thể mất một chút thời gian để nó có được CPU và bắt đầu thực thi.

Để tạo một process mới, cần một parent process (process cha). Đó là lý do tại sao mỗi process đều có một cha. Thực tế, mỗi process chỉ có thể có một cha. Chuỗi cha và ông đi ngược về user process đầu tiên, thường được gọi là *init*, và kernel process là cha của nó.

Nó là tổ tiên của mọi process khác bên trong một hệ thống Unix-like và tồn tại cho đến khi hệ thống tắt. Thông thường, process init trở thành cha của mọi *orphan process* (process mồ côi) đã có process cha bị kết thúc, để không process nào có thể bị bỏ lại mà không có process cha.

Quan hệ parent-child này dẫn đến một cây process lớn. Cây này có thể được xem xét bằng tiện ích lệnh *pstree*. Chúng tôi sẽ<a id="_idIndexMarker1164"></a> cho thấy cách dùng tiện ích này trong các ví dụ sau.

Giờ, chúng ta đã biết API có thể thực thi một process mới, và chúng ta cần đưa ra một số ví dụ C thật về cách những phương pháp này thực sự hoạt động. Chúng ta bắt đầu với fork API, vốn rốt cuộc gọi system call `fork`.

<a id="_idParaDest-227"></a>

### Tạo process

Như chúng tôi đã đề cập trong<a id="_idIndexMarker1165"></a> phần trước, fork API có thể được dùng để sinh ra một process mới. Chúng tôi cũng đã giải thích rằng một process mới chỉ có thể được tạo ra như một con của một process đang chạy. Ở đây, chúng ta xem một vài ví dụ về cách một process có thể fork một con mới bằng fork API.

Để sinh ra một child process mới, một parent process cần gọi hàm `fork`. Khai báo của hàm `fork` có thể được include từ header file `unistd.h` vốn là một phần của các POSIX header.

Khi hàm `fork` được gọi, một bản sao chính xác của process gọi (được gọi là parent process) được tạo ra, và cả hai process tiếp tục chạy concurrent bắt đầu từ instruction ngay sau câu lệnh gọi `fork`. Lưu ý rằng child process (hay process được fork) kế thừa nhiều thứ từ parent process bao gồm mọi memory segment cùng với nội dung của chúng. Do đó, nó có quyền truy cập vào cùng các biến trong các segment Data, Stack và Heap, và cả các instruction của chương trình có trong segment Text. Chúng ta nói về những thứ được kế thừa khác trong các đoạn sắp tới, sau khi nói về ví dụ.

Vì giờ chúng ta có hai process khác nhau, hàm `fork` trả về hai lần; một lần trong parent process và một lần khác trong child process. Ngoài ra, hàm `fork` trả về các giá trị khác nhau cho mỗi process. Nó trả về 0 cho child process, và nó trả về PID của process được fork (hay child process) cho parent process. *Ví dụ 17.1* cho thấy `fork` hoạt động như thế nào trong một trong những cách dùng đơn giản nhất của nó:

```
#include <stdio.h>
#include <unistd.h>
int main(int argc, char** argv) {
  printf("This is the parent process with process ID: %d\n",
          getpid());
  printf("Before calling fork() ...\n");
  pid_t ret = fork();
  if (ret) {
    printf("The child process is spawned with PID: %d\n", ret);
  } else {
    printf("This is the child process with PID: %d\n", getpid());
  }
  printf("Type CTRL+C to exit ...\n");
  while (1);
  return 0;
}
```

*Code Box 17-1 [ExtremeC_examples_chapter17_1.c]: Tạo một child process bằng fork API*

Trong code box trên, chúng ta đã dùng `printf` để in ra một số log nhằm theo dõi hoạt động của các process. Như bạn thấy, chúng ta đã gọi hàm `fork` để sinh ra một process mới. Như đã rõ, nó không nhận argument nào, và do đó, cách dùng của nó rất dễ dàng và đơn giản.

Khi gọi hàm `fork`, một process mới được fork (hay clone) từ process gọi, vốn giờ là parent process, và sau đó, chúng tiếp tục làm việc concurrent như hai process khác nhau.

Chắc chắn, lời gọi tới hàm `fork` sẽ gây ra các lời gọi tiếp theo ở mức system call, và<a id="_idIndexMarker1167"></a> chỉ khi đó, logic chịu trách nhiệm trong kernel mới có thể tạo một process được fork mới.

Ngay trước câu lệnh `return`, chúng ta đã dùng một vòng lặp vô hạn để giữ cả hai process chạy và ngăn chúng thoát. Lưu ý rằng các process rốt cuộc nên đi đến vòng lặp vô hạn này vì chúng có chính xác cùng các instruction trong segment Text của chúng.

Chúng ta muốn cố ý giữ các process chạy để có thể thấy chúng trong danh sách process được hiển thị bởi các lệnh `pstree` và `top`. Trước đó, chúng ta cần biên dịch code trên và xem process mới được fork như thế nào, như được thể hiện trong *Shell Box 17-1*:

```
$ gcc ExtremeC_examples_chapter17_1.c -o ex17_1.out
$ ./ex17_1.out
This is the parent process with process ID: 10852
Before calling fork() …
The child process is spawned with PID: 10853
This is the child process with PID: 10853
Type CTRL+C to exit ...
$
```

*Shell Box 17-1: Build và chạy ví dụ 17.1*

Như bạn có thể thấy, parent process in PID của nó, và đó là `10852`. Lưu ý rằng PID sẽ thay đổi trong mỗi lần chạy. Sau khi fork child process, parent process in PID được trả về bởi hàm `fork`, và đó là `10853`.

Ở dòng tiếp theo, child process in PID của nó, lại là `10853` và nó phù hợp với những gì cha đã nhận được từ hàm `fork`. Và cuối cùng, cả hai process đi vào vòng lặp vô hạn, cho chúng ta chút thời gian để quan sát chúng trong các tiện ích thăm dò.

Như bạn thấy trong *Shell Box 17-1*, process được fork kế thừa cùng file descriptor `stdout` và cùng terminal từ cha của nó. Do đó, nó có thể in ra cùng output mà cha của nó ghi vào. Một process được fork kế thừa mọi file descriptor đang mở tại thời điểm gọi hàm `fork` từ parent process của nó.

Ngoài ra, cũng có các attribute được kế thừa khác, có thể được tìm thấy trong các trang manual của `fork`. Trang manual của `fork` cho Linux có thể<a id="_idIndexMarker1168"></a> được tìm thấy ở đây: http://man7.org/linux/man-pages/man2/fork.2.html.

Nếu bạn mở link và xem qua các attribute, bạn sẽ thấy rằng có những attribute <a id="_idIndexMarker1169"></a>được chia sẻ giữa parent process và process được fork, và có những attribute khác khác nhau và đặc thù cho mỗi process, ví dụ, PID, parent PID, thread, v.v.

Quan hệ parent-child giữa các process có thể dễ dàng được thấy bằng một chương trình tiện ích như `pstree`. Mỗi process có một parent process, và mọi process đều góp phần xây dựng một cây lớn. Hãy nhớ rằng mỗi process có đúng một cha, và một process duy nhất không thể có hai cha.

Trong khi các process trong ví dụ trên đang mắc kẹt trong các vòng lặp vô hạn của chúng, chúng ta có thể dùng lệnh tiện ích `pstree` để xem danh sách mọi process trong hệ thống được hiển thị dưới dạng một cây. Sau đây là output của việc dùng `pstree` trên một máy Linux. Lưu ý rằng lệnh `pstree` được cài đặt mặc định trên các hệ thống Linux, nhưng có thể cần được cài đặt trên các hệ điều hành Unix-like khác:

```
$ pstree -p
systemd(1)─┬─accounts-daemon(877)─┬─{accounts-daemon}(960)
           │                      └─{accounts-daemon}(997)
...
...
...
           ├─systemd-logind(819)
           ├─systemd-network(673)
           ├─systemd-resolve(701)
           ├─systemd-timesyn(500)───{systemd-timesyn}(550)
           ├─systemd-udevd(446)
           └─tmux: server(2083)─┬─bash(2084)───pstree(13559)
                                └─bash(2337)───ex17_1.out(10852)───ex17_1.out(10853)
$
```

*Shell Box 17-2: Dùng pstree để tìm các process được sinh ra trong ví dụ 17.1*

Như có thể thấy ở dòng cuối cùng của *Shell Box 17-2*, chúng ta có hai process với PID `10852` và `10853` đang ở trong quan hệ parent-child. Lưu ý rằng process `10852` có một cha với PID `2337`, là một process *bash*.

Thú vị cần lưu ý là ở dòng trước dòng cuối cùng, chúng ta có thể thấy chính process `pstree` là con của process bash với PID `2084`. Cả hai process bash đều thuộc về cùng một terminal emulator *tmux* với PID `2083`.

Trong Linux, process đầu tiên là process *scheduler*, là một phần của kernel image, và nó có PID 0. <a id="_idIndexMarker1170"></a>Process tiếp theo, thường được gọi là *init*, có PID 1, và nó là user process đầu tiên được tạo ra bởi process scheduler. Nó tồn tại từ khi hệ thống khởi động cho đến khi tắt. Mọi user process khác đều là con trực tiếp hoặc gián tiếp của process `init`. Các process mất parent process của chúng trở thành orphan process, và chúng bị process init nhận làm con trực tiếp.

Tuy nhiên, trong các phiên bản mới hơn của gần như mọi bản phân phối Linux nổi tiếng, process init đã được thay thế bởi *systemd daemon*, và đó là lý do tại sao bạn thấy `systemd(1)` ở dòng đầu tiên trong *Shell Box 17-2*. Link sau là một nguồn tuyệt vời để đọc thêm về những khác biệt giữa `init` và `systemd` và tại sao các developer distro Linux đã đưa ra quyết định như vậy: https://www.tecmint.com/systemd-replaces-init-in-linux.

Khi dùng fork API, parent process và process được fork được thực thi concurrent. Điều này có nghĩa là chúng ta nên có thể phát hiện một số hành vi của các hệ thống concurrent.

Hành vi best-known có thể được quan sát là một số interleaving. Nếu bạn không quen thuộc với thuật ngữ này hay bạn chưa nghe về nó trước đây, rất khuyến khích bạn đọc *Chương 13*, *Concurrency*, và *Chương 14*, *Synchronization*.

Ví dụ sau, *ví dụ 17.2*, cho thấy parent process và process được fork có thể có các interleaving non-deterministic như thế nào. Chúng ta sẽ in một số chuỗi và quan sát một số interleaving khác nhau có thể xảy ra như thế nào trong hai lần chạy liên tiếp:

```
#include <stdio.h>
#include <unistd.h>
int main(int argc, char** argv) {
  pid_t ret = fork();
  if (ret) {
    for (size_t i = 0; i < 5; i++) {
      printf("AAA\n");
      usleep(1);
    }
  } else {
    for (size_t i = 0; i < 5; i++) {
      printf("BBBBBB\n");
      usleep(1);
    }
  }
  return 0;
}
```

*Code Box 17-2 [ExtremeC_examples_chapter17_2.c]: Hai process in một số dòng ra standard output*

Code trên rất<a id="_idIndexMarker1171"></a> giống code chúng ta đã viết cho *ví dụ 17.1*. Nó tạo một process được fork, và sau đó, parent process và process được fork in một số dòng văn bản ra standard output. Parent process in `AAA` 5 lần, và process được fork in `BBBBBB` năm lần. Sau đây là output của hai lần chạy liên tiếp của cùng executable đã biên dịch:

```
$ gcc ExtremeC_examples_chapter17_2.c -o ex17_2.out
$ ./ex17_2.out
AAA
AAA
AAA
AAA
AAA
BBBBBB
BBBBBB
BBBBBB
BBBBBB
BBBBBB
$ ./ex17_2.out
AAA
AAA
BBBBBB
AAA
AAA
BBBBBB
BBBBBB
BBBBBB
AAA
BBBBBB
$
```

*Shell Box 17-3: Output của hai lần chạy liên tiếp của ví dụ 17.2*

Rõ ràng từ output trên là chúng ta có các interleaving khác nhau. Điều này có nghĩa là chúng ta có khả năng đang mắc phải một race condition ở đây nếu chúng ta định nghĩa invariant constraint của mình theo<a id="_idIndexMarker1172"></a> những gì chúng ta thấy trong standard output. Điều này rốt cuộc sẽ dẫn đến mọi vấn đề chúng ta đã gặp khi viết code multithreaded, và chúng ta cần dùng các phương pháp tương tự để vượt qua những vấn đề này. Trong chương tiếp theo, chúng ta sẽ thảo luận chi tiết hơn về những giải pháp như vậy.

Trong phần sau, chúng ta sẽ nói về process execution và cách nó có thể đạt được bằng các hàm `exec*`.

<a id="_idParaDest-228"></a>

### Thực thi process

Một cách khác để thực thi <a id="_idIndexMarker1173"></a>một process mới là dùng họ hàm `exec*`. Nhóm hàm này chọn một cách tiếp cận khác để thực thi một process mới so với fork API. Triết lý đằng sau các hàm `exec*` là tạo một process cơ sở đơn giản trước và sau đó, vào một thời điểm nào đó, nạp executable đích và<a id="_idIndexMarker1174"></a> thay thế nó như một *process image* mới vào process cơ sở. Một process image là phiên bản đã được nạp của một executable có các memory segment đã được cấp phát, và nó sẵn sàng để được thực thi. Trong các phần sau, chúng ta sẽ thảo luận các bước khác nhau của việc nạp một executable, và chúng tôi sẽ giải thích process image sâu hơn.

Do đó, khi dùng các hàm `exec*`, không có process mới nào được tạo ra, và một sự thay thế process xảy ra. Đây là khác biệt quan trọng nhất giữa `fork` và các hàm `exec*`. Thay vì fork một process mới, process cơ sở được thay thế hoàn toàn bằng một tập memory segment và code instruction mới.

*Code Box 17-3*, chứa *ví dụ 17.3*, cho thấy cách hàm `execvp`, một trong các hàm trong họ hàm `exec*`, được dùng để khởi động một process echo. Hàm `execvp` là một trong các hàm trong nhóm hàm `exec*` kế thừa biến môi trường `PATH` từ parent process và tìm kiếm các executable như parent process đã làm:

```
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <errno.h>
int main(int argc, char** argv) {
  char *args[] = {"echo", "Hello", "World!", 0};
  execvp("echo", args);
  printf("execvp() failed. Error: %s\n", strerror(errno));
  return 0;
}
```

*Code Box 17-3 [ExtremeC_examples_chapter17_3.c]: Minh họa execvp hoạt động như thế nào*

Như bạn thấy trong code box trên, chúng ta đã gọi hàm `execvp`. Như chúng tôi đã giải thích trước đây, hàm `execvp` kế thừa biến môi trường `PATH`, cùng với cách nó tìm các executable hiện có, từ process cơ sở. Nó nhận hai argument; argument thứ nhất là tên của executable file hay script nên được nạp và thực thi, và argument thứ hai là danh sách các argument nên được truyền cho executable.

Lưu ý rằng chúng ta<a id="_idIndexMarker1175"></a> đang truyền `echo` chứ không phải một đường dẫn tuyệt đối. Do đó, `execvp` nên định vị executable `echo` trước. Những executable file này có thể ở bất cứ đâu trong một hệ điều hành Unix-like, từ `/usr/bin` đến `/usr/local/bin` hay thậm chí những nơi khác. Vị trí tuyệt đối của `echo` có thể được tìm thấy bằng cách đi qua mọi đường dẫn thư mục<a id="_idIndexMarker1176"></a> có trong biến môi trường `PATH`.

> Các hàm `exec*` có thể thực thi một loạt executable file. Sau đây là danh sách một số định dạng file có thể được thực thi bởi các hàm `exec*`:
>
> - Executable file ELF
> - Script file có một dòng *shebang* chỉ ra *interpreter* của script
> - Binary file định dạng `a.out` truyền thống
> - Executable file ELF FDPIC

Sau khi tìm thấy executable file `echo`, `execvp` làm phần còn lại. Nó gọi system call `exec` (`execve` trong Linux) với một tập argument đã chuẩn bị và sau đó, kernel chuẩn bị một process image từ executable file tìm được. Khi mọi thứ đã sẵn sàng, kernel thay thế process image hiện tại bằng process image đã chuẩn bị, và process cơ sở biến mất mãi mãi. Giờ, quyền điều khiển trở về process mới, và nó bắt đầu thực thi từ hàm `main` của nó, giống như một lần thực thi bình thường.

Kết quả của quá trình này là câu lệnh `printf` sau câu lệnh gọi hàm `execvp` không thể được thực thi nếu `execvp` đã thành công, vì giờ chúng ta có một process hoàn toàn mới với các memory segment mới và các instruction mới. Nếu câu lệnh `execvp` không thành công, thì `printf` lẽ ra đã được thực thi, đó là dấu hiệu cho sự thất bại của lời gọi hàm `execvp`.

Như chúng tôi đã nói trước đây, chúng ta có một nhóm hàm `exec*`, và hàm `execvp` chỉ là một trong số đó. Dù tất cả chúng đều hoạt động tương tự, chúng có những khác biệt nhỏ. Tiếp theo, bạn có thể tìm thấy một sự so sánh những hàm này:

- `execl(const char* path, const char* arg0, ..., NULL)`: Nhận một đường dẫn tuyệt đối tới executable file và một chuỗi argument nên được truyền cho process mới. Chúng phải kết thúc bằng một chuỗi null, `0` hay `NULL`. Nếu chúng ta muốn viết lại *ví dụ 17.3* bằng `execl`, chúng ta sẽ dùng `execl("/usr/bin/echo", "echo", "Hello", "World", NULL)`.
- `execlp(const char* file, const char* arg0, ..., NULL)`: Nhận một đường dẫn tương đối làm argument thứ nhất, nhưng vì nó có quyền truy cập biến môi trường `PATH`, nó có thể định vị executable file dễ dàng. Sau đó, nó nhận một chuỗi argument nên được truyền cho process mới. Chúng phải kết thúc bằng một chuỗi null, `0` hay `NULL`. Nếu chúng ta muốn viết lại *ví dụ 17.3* bằng `execlp`, chúng ta sẽ dùng `execlp("echo", "echo," "Hello," "World," NULL)`.
- `excele(const char* path, const char* arg0, ..., NULL, const char* env0, ..., NULL)`: Nhận một đường dẫn tuyệt đối tới executable file làm argument thứ nhất. Sau đó, nó nhận một chuỗi argument nên được truyền cho<a id="_idIndexMarker1177"></a> process mới, theo sau là một chuỗi null. Tiếp theo đó, nó nhận một chuỗi các string biểu diễn các biến môi trường. Chúng cũng phải kết thúc bằng một chuỗi null. Nếu chúng ta muốn viết lại *ví dụ 17.3* bằng `execle`, chúng ta sẽ dùng `execle("/usr/bin/echo", "echo", "Hello", "World", NULL, "A=1", "B=2", NULL)`. Lưu ý rằng trong lời gọi này, chúng ta đã truyền hai biến môi trường mới, `A` và `B`, cho process mới.
- `execv(const char* path, const char* args[])`: Nhận một đường dẫn tuyệt đối tới executable file và một mảng các argument nên được truyền cho process mới. Phần tử cuối cùng trong mảng phải là một chuỗi null, `0` hay `NULL`. Nếu chúng ta muốn viết lại *ví dụ 17.3* bằng `execl`, chúng ta sẽ dùng `execl("/usr/bin/echo", args)` trong đó `args` được khai báo như sau: `char* args[] = {"echo", "Hello", "World", NULL}`.
- `execvp(const char* file, const char* args[])`: Nó nhận một đường dẫn tương đối làm argument thứ nhất, nhưng vì nó có quyền truy cập biến môi trường `PATH`, nó có thể định vị executable file dễ dàng. Sau đó, nó nhận một mảng các argument nên được truyền cho process mới. Phần tử cuối cùng trong mảng phải là một chuỗi null, `0` hay `NULL`. Đây là hàm mà chúng ta đã dùng trong *ví dụ 17.3*.

Khi các hàm `exec*`<a id="_idIndexMarker1178"></a> thành công, process trước biến mất, và một process mới được tạo ra thay vào đó. Do đó, hoàn toàn không có process thứ hai. Vì lý do này, chúng ta không thể minh họa các interleaving như chúng ta đã làm cho `fork` API. Trong phần tiếp theo, chúng ta so sánh `fork` API và các hàm `exec*` để thực thi một chương trình mới.

<a id="_idParaDest-229"></a>

### So sánh tạo process và thực thi process

Dựa trên thảo luận <a id="_idIndexMarker1179"></a>và các ví dụ được đưa ra trong các phần trước, chúng ta có thể đưa ra sự so sánh sau giữa hai phương pháp được dùng để thực thi một chương trình mới:

- Một lời gọi thành công hàm `fork` dẫn đến hai process riêng biệt; một parent process đã gọi hàm `fork` và một process được fork (hay child process). Nhưng một lời gọi thành công bất kỳ hàm `exec*` nào dẫn đến việc process gọi bị thay thế bởi một process image mới và do đó không có process mới nào được tạo ra.
- Gọi hàm `fork` nhân bản mọi nội dung memory của parent process, và process được fork thấy cùng nội dung memory và biến. Nhưng gọi các hàm `exec*` hủy memory layout của process cơ sở và tạo một layout mới dựa trên executable được nạp.
- Một process được fork có quyền truy cập một số attribute nhất định của parent process, ví dụ, các file descriptor đang mở nhưng khi dùng các hàm `exec*`. Process mới không biết gì về điều đó, và nó không kế thừa gì từ process cơ sở.
- Trong cả hai API, chúng ta rốt cuộc có một process mới chỉ có một main thread. Các thread trong parent process không được fork khi dùng fork API.
- `exec*` API có thể được dùng để chạy script và các executable file bên ngoài, nhưng `fork` API chỉ có thể được dùng để tạo một process mới thực ra là cùng một chương trình C.

Trong phần tiếp theo, chúng ta sẽ nói về các bước mà hầu hết các kernel thực hiện để nạp và thực thi một process mới. Những bước này và chi tiết của chúng khác nhau từ kernel này sang kernel khác, nhưng chúng tôi cố gắng trình bày các bước chung được hầu hết các kernel được biết đến thực hiện để thực thi một process.

<a id="_idParaDest-230"></a>

## Các bước thực thi process

Để có một process <a id="_idIndexMarker1180"></a>được thực thi từ một executable file, user space và kernel space thực hiện một số bước chung trong hầu hết các hệ điều hành. Như chúng tôi đã lưu ý trong phần trước, executable file chủ yếu là các executable object file, ví dụ, ELF, Mach, hay các script file cần một interpreter để thực thi chúng.

Từ góc nhìn của vòng user, một system call như `exec` nên được gọi. Lưu ý rằng chúng tôi không giải thích system call `fork` ở đây vì nó thực ra không phải là một việc thực thi. Nó giống một thao tác nhân bản process đang chạy hiện tại hơn.

Khi user space gọi system call `exec`, một yêu cầu mới để thực thi executable file được tạo ra bên trong kernel. Kernel cố tìm một handler cho executable file được chỉ định dựa trên kiểu của nó và theo handler đó, nó dùng một *loader program* để nạp nội dung của executable file.

Lưu ý rằng đối với các script file, executable binary của chương trình interpreter thường được chỉ định trong *dòng shebang* ở dòng đầu tiên của script. Loader program có các nhiệm vụ sau để thực thi một process:

- Nó kiểm tra ngữ cảnh thực thi<a id="_idIndexMarker1181"></a> và quyền của người dùng đã yêu cầu việc thực thi.
- Nó cấp phát memory cho process mới từ main memory.
- Nó sao chép nội dung binary của executable file vào memory đã cấp phát. Việc này chủ yếu liên quan đến các segment Data và Text.
- Nó cấp phát một vùng memory cho segment Stack và chuẩn bị các memory mapping ban đầu.
- Main thread và vùng memory Stack của nó được tạo ra.
- Nó sao chép các argument command-line dưới dạng một *stack frame* trên đỉnh vùng Stack của main thread.
- Nó khởi tạo các register sống còn cần thiết cho việc thực thi.
- Nó thực thi instruction đầu tiên của entry point của chương trình.

Trong trường hợp script file, đường dẫn tới script file được sao chép làm argument command-line của interpreter process. Các bước chung trên được hầu hết các kernel thực hiện, nhưng chi tiết triển khai có thể khác nhau rất nhiều từ kernel này sang kernel khác.

Để biết thêm thông tin về một hệ điều hành cụ thể, bạn cần đọc tài liệu của nó hay đơn giản là tìm kiếm nó trên Google. Các bài viết sau từ LWN là một khởi đầu tuyệt vời cho những ai tìm kiếm thêm chi tiết về <a id="_idIndexMarker1182"></a>pro[cess execution in Linux: https:/](https://lwn.net/Articles/631631/)/lwn.[net/Articles/631631/ and https:/](https://lwn.net/Articles/630727/)/lwn.net/Articles/630727/ (việc thực thi process trong Linux).

Trong phần tiếp theo, chúng ta sẽ bắt đầu nói về các chủ đề concurrency-related. Chúng ta chuẩn bị nền tảng cho chương tiếp theo, vốn <a id="_idIndexMarker1183"></a>sẽ nói rất sâu về các kỹ thuật synchronization multi-processing-specific. Ở đây chúng ta bắt đầu bằng việc thảo luận về các shared state, có thể được dùng trong các hệ thống phần mềm multi-process.

<a id="_idParaDest-231"></a>

## Shared state

Giống như với thread, chúng ta có thể có một số<a id="_idIndexMarker1184"></a> shared state giữa các process. Khác biệt duy nhất là các thread có thể truy cập cùng không gian memory thuộc sở hữu của process sở hữu chúng, nhưng các process không có được lợi thế xa xỉ đó. Do đó, các cơ chế khác nên được dùng để chia sẻ một state giữa một số process.

Trong phần này, chúng ta sẽ thảo luận những kỹ thuật này và trong chương này, chúng ta tập trung vào một số kỹ thuật hoạt động như nơi lưu trữ. Trong phần đầu tiên, chúng ta sẽ thảo luận các kỹ thuật khác nhau và cố gắng nhóm chúng dựa trên bản chất của chúng.

<a id="_idParaDest-232"></a>

### Các kỹ thuật chia sẻ

Nếu bạn nhìn vào các cách bạn có thể chia sẻ một state (một biến hay một mảng) giữa hai process, hóa ra nó có thể được thực hiện theo một số lượng cách hạn chế. Về lý thuyết, có hai<a id="_idIndexMarker1185"></a> nhóm chính để chia sẻ một state giữa một số process, nhưng trong một hệ thống máy tính thật, mỗi nhóm này có một số nhóm con.

Bạn hoặc phải đặt một<a id="_idIndexMarker1186"></a> state ở một "nơi" có thể được một số process truy cập, hoặc bạn phải có state của mình được *gửi* hay *chuyển* dưới dạng một thông điệp, signal hay sự kiện tới<a id="_idIndexMarker1187"></a> các process khác. Tương tự, bạn hoặc phải *kéo* hay *lấy* một state hiện có từ một "nơi", hoặc *nhận* nó dưới dạng một thông điệp, signal hay sự kiện. Cách tiếp cận thứ nhất <a id="_idIndexMarker1188"></a>cần nơi lưu trữ<a id="_idIndexMarker1189"></a> hay một *medium* (phương tiện) như một memory <a id="_idIndexMarker1190"></a>buffer hay một filesystem, và cách tiếp cận thứ hai đòi hỏi bạn có một cơ chế truyền thông điệp hay một *channel* (kênh) giữa các process.

Như một ví dụ cho cách tiếp cận thứ nhất, chúng ta có thể có một vùng shared memory làm medium với một mảng bên trong có thể được một số process truy cập để đọc và sửa đổi mảng. Như một ví dụ cho cách tiếp cận thứ hai, chúng ta có thể có một mạng máy tính làm channel để cho phép một số thông điệp được truyền giữa một số process nằm trên các host khác nhau trong mạng đó.

Thảo luận hiện tại của chúng ta về cách chia sẻ state giữa một số process thực tế không chỉ giới hạn ở process; nó cũng có thể được áp dụng cho thread. Các thread cũng có thể có việc báo hiệu giữa chúng để chia sẻ một state hay lan truyền một sự kiện.

Theo một hệ thuật ngữ khác, các kỹ thuật trong nhóm thứ nhất đòi hỏi một *medium* như nơi lưu trữ để chia sẻ state được gọi là các kỹ thuật *pull-based*. Đó là vì các process muốn đọc state phải <a id="_idIndexMarker1191"></a>kéo chúng từ nơi lưu trữ.

Các kỹ thuật trong nhóm thứ hai đòi hỏi một *channel* để truyền state<a id="_idIndexMarker1192"></a> được gọi là các kỹ thuật *push-based*. Đó là vì các state được đẩy (hay chuyển giao) qua channel tới process <a id="_idIndexMarker1193"></a>nhận và nó không cần kéo chúng từ một medium. Chúng ta sẽ dùng những thuật ngữ này từ giờ trở đi để chỉ các kỹ thuật này.

Sự đa dạng trong các kỹ thuật push-based đã dẫn đến nhiều architecture phân tán khác nhau trong ngành công nghiệp phần mềm hiện đại. Các kỹ thuật pull-based được coi là cũ so với các kỹ thuật push-based, và bạn có thể thấy điều đó trong nhiều ứng dụng doanh nghiệp nơi một cơ sở dữ liệu trung tâm duy nhất được dùng để chia sẻ các state khác nhau trong toàn bộ hệ thống.

Tuy nhiên, cách tiếp cận push-based đang có đà phát triển ngày nay và đã dẫn đến các kỹ thuật như *event sourcing* và một số cách tiếp cận phân tán tương tự khác được dùng để giữ mọi phần của một hệ thống phần mềm lớn nhất quán với nhau mà không cần lưu mọi dữ liệu ở một nơi trung tâm.

Giữa hai cách tiếp cận đã thảo luận, chúng ta đặc biệt quan tâm đến cách tiếp cận thứ nhất trong suốt chương này. Chúng ta sẽ tập trung nhiều hơn vào cách tiếp cận thứ hai trong *Chương 19*, *Single-Host IPC và Socket*, và *Chương 20*, *Socket Programming*. Trong những chương đó, chúng tôi sẽ giới thiệu các channel khác nhau có sẵn để truyền thông điệp giữa các process như một phần của các kỹ thuật **Inter-Process Communication** (**IPC**). Chỉ khi đó chúng ta mới có thể khám phá các kỹ thuật push-based khác nhau và đưa ra một số ví dụ thật cho các vấn đề concurrency quan sát được và các cơ chế kiểm soát có thể được dùng.

Sau đây là danh sách các kỹ thuật pull-based được chuẩn POSIX hỗ trợ và có thể được dùng rộng rãi trong mọi hệ điều hành POSIX-compliant:

- **Shared memory**: Đây <a id="_idIndexMarker1194"></a>đơn giản là một vùng trong main memory được chia sẻ và có thể truy cập được bởi một số process, và chúng có thể dùng nó để lưu biến và mảng giống như một khối memory thông thường. Một đối tượng shared memory không phải là một file trên đĩa, mà nó là memory thực sự. Nó có thể tồn tại như một đối tượng độc lập trong hệ điều hành ngay cả khi không có process nào đang dùng nó. Các đối tượng shared memory có thể bị gỡ bỏ hoặc bởi một process khi không còn cần thiết hoặc bằng cách khởi động lại hệ thống. Do đó, xét về khả năng tồn tại qua các lần khởi động lại, các đối tượng shared memory có thể được coi là các đối tượng tạm thời.
- **Filesystem**: Các process có thể <a id="_idIndexMarker1195"></a>dùng file để chia sẻ state. Kỹ thuật này là một trong những kỹ thuật lâu đời nhất để chia sẻ một số state trong toàn bộ một hệ thống phần mềm giữa một số process. Rốt cuộc, những khó khăn trong việc đồng bộ hóa truy cập vào các file dùng chung, cùng với nhiều lý do xác đáng khác, đã dẫn đến<a id="_idIndexMarker1197"></a> việc phát minh ra **Database Management Systems** (**DBMSes**), nhưng các file dùng chung vẫn đang được dùng trong một số trường hợp sử dụng nhất định.
- **Network service** (dịch vụ mạng): Một khi có sẵn cho mọi process, các process có thể dùng network storage hay một network <a id="_idIndexMarker1198"></a>service để lưu và lấy một shared state. Trong kịch bản này, các process không biết chính xác điều gì đang diễn ra phía sau hậu trường. Chúng chỉ dùng một network service thông qua một API well-defined cho phép chúng thực hiện các thao tác nhất định trên một shared state. Như một số <a id="_idIndexMarker1199"></a>ví dụ, chúng ta có thể kể tên **Network Filesystems** (**NFS**) hay DBMSes. Chúng cung cấp các network service cho phép duy trì state thông qua một mô hình well-defined và một tập thao tác đồng hành. Để đưa ra một ví dụ cụ thể hơn, chúng ta có thể đề cập *Relational DBMSes,* vốn cho phép <a id="_idIndexMarker1200"></a>bạn lưu state của mình trong một mô hình quan hệ thông qua việc dùng các lệnh SQL.

Trong các tiểu mục sau, chúng ta sẽ thảo luận từng phương pháp trên có trong POSIX interface. Chúng ta bắt đầu với POSIX shared memory, và chúng tôi cho thấy nó có thể dẫn đến các data race quen thuộc đã biết từ *Chương 16*, *Thread Synchronization* như thế nào.

<a id="_idParaDest-233"></a>

### POSIX shared memory

Được chuẩn POSIX hỗ trợ, shared<a id="_idIndexMarker1201"></a> memory là một trong những kỹ thuật được dùng rộng rãi để chia sẻ một mẩu thông tin giữa một số process. Không giống các thread có thể truy cập cùng không gian memory, các process không có khả năng này và việc truy cập memory của các process khác bị hệ điều hành cấm. Do đó, chúng ta cần một cơ chế để chia sẻ một phần memory giữa hai process, và shared memory chính xác là kỹ thuật đó.

Trong các ví dụ sau, chúng ta đi qua chi tiết việc tạo và dùng một đối tượng shared memory, và chúng ta bắt đầu thảo luận bằng việc tạo một vùng shared memory. Code sau cho thấy cách tạo và điền một đối tượng shared memory trong một hệ thống POSIX-compliant:

```
#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <string.h>
#include <sys/mman.h>
#define SH_SIZE 16
int main(int argc, char** argv) {
  int shm_fd = shm_open("/shm0", O_CREAT | O_RDWR, 0600);
  if (shm_fd < 0) {
    fprintf(stderr, "ERROR: Failed to create shared memory: %s\n",
        strerror(errno));
    return 1;
  }
  fprintf(stdout, "Shared memory is created with fd: %d\n",
          shm_fd);
  if (ftruncate(shm_fd, SH_SIZE * sizeof(char)) < 0) {
    fprintf(stderr, "ERROR: Truncation failed: %s\n",
            strerror(errno));
    return 1;
  }
  fprintf(stdout, "The memory region is truncated.\n");
  void* map = mmap(0, SH_SIZE, PROT_WRITE, MAP_SHARED, shm_fd, 0);
  if (map == MAP_FAILED) {
    fprintf(stderr, "ERROR: Mapping failed: %s\n",
            strerror(errno));
    return 1;
  }
  char* ptr = (char*)map;
  ptr[0] = 'A';
  ptr[1] = 'B';
  ptr[2] = 'C';
  ptr[3] = '\n';
  ptr[4] = '\0';
  while(1);
  fprintf(stdout, "Data is written to the shared memory.\n");
  if (munmap(ptr, SH_SIZE) < 0) {
    fprintf(stderr, "ERROR: Unmapping failed: %s\n",
            strerror(errno));
    return 1;
  }
  if (close(shm_fd) < 0) {
    fprintf(stderr, "ERROR: Closing shared memory failed: %s\n",
        strerror(errno));
    return 1;
  }
  return 0;
}
```

*Code Box 17-4 [ExtremeC_examples_chapter17_4.c]: Tạo và ghi vào một đối tượng POSIX shared memory*

Code trên tạo<a id="_idIndexMarker1202"></a> một đối tượng shared memory tên là `/shm0` với 16 byte bên trong. Sau đó nó điền vào shared memory chuỗi literal `ABC\n` và cuối cùng, nó thoát sau khi *unmap* vùng shared memory. Lưu ý rằng đối tượng shared memory vẫn ở tại chỗ ngay cả khi process thoát. Các process tương lai có thể mở và đọc cùng đối tượng shared memory hết lần này đến lần khác. Một đối tượng shared memory bị hủy hoặc bằng cách khởi động lại hệ thống hoặc bằng cách bị một process *unlink* (gỡ bỏ).

> **Lưu ý**:
>
> Trong FreeBSD, tên của các đối tượng shared memory nên bắt đầu bằng `/`. Điều này không bắt buộc trong Linux hay macOS, nhưng chúng tôi đã làm tương tự cho cả hai để giữ tương thích với FreeBSD.

Trong code trên, trước tiên chúng ta mở một đối tượng shared memory bằng hàm `shm_open`. Nó nhận một tên và các mode mà đối tượng shared memory nên được tạo với. `O_CREAT` và `O_RDWR` có nghĩa là shared memory nên được tạo ra, và nó có thể được dùng cho cả đọc và ghi.

Lưu ý rằng việc tạo sẽ không thất bại nếu đối tượng shared memory đã tồn tại. Argument cuối cùng chỉ ra quyền của đối tượng shared memory. `0600` có nghĩa là nó có sẵn cho các thao tác đọc và ghi được thực hiện bởi các process chỉ được khởi tạo bởi chủ sở hữu của đối tượng shared memory.

Ở các dòng tiếp theo, chúng ta định nghĩa kích thước của vùng shared memory bằng cách truncate nó bằng hàm `ftruncate`. Lưu ý rằng đây<a id="_idIndexMarker1203"></a> là một bước cần thiết nếu bạn sắp tạo một đối tượng shared memory mới. Với đối tượng shared memory trên, chúng ta đã định nghĩa 16 byte được cấp phát và sau đó truncate.

Khi tiếp tục, chúng ta ánh xạ đối tượng shared<a id="_idIndexMarker1204"></a> memory tới một vùng mà process có thể truy cập bằng hàm `mmap`. Kết quả là, chúng ta có một pointer tới memory đã được ánh xạ và nó có thể được dùng để truy cập vùng shared memory phía sau. Đây cũng là một bước cần thiết làm cho shared memory có thể truy cập được từ chương trình C của chúng ta.

Hàm `mmap` thường được dùng để ánh xạ một file hay một vùng shared memory (ban đầu được cấp phát từ không gian memory của kernel) tới một address space mà process gọi có thể truy cập. Sau đó, address space đã được ánh xạ có thể được truy cập như một vùng memory thông thường bằng các pointer thông thường.

Như bạn có thể thấy, vùng được ánh xạ như một vùng có thể ghi được chỉ ra bởi `PROT_WRITE` và như một vùng dùng chung giữa các process được chỉ ra bởi argument `MAP_SHARED`. `MAP_SHARED` đơn giản có nghĩa là mọi thay đổi đối với vùng đã ánh xạ sẽ hiển thị với các process khác ánh xạ cùng vùng đó.

Thay vì `MAP_SHARED`, chúng ta có thể có `MAP_PRIVATE`; điều này có nghĩa là các thay đổi đối với vùng đã ánh xạ<a id="_idIndexMarker1205"></a> không được lan truyền tới các process khác và, thay vào đó, là private đối với process ánh xạ. Cách dùng này không phổ biến trừ khi bạn muốn dùng shared memory chỉ bên trong một process.

Sau khi ánh xạ vùng shared memory, code trên ghi một chuỗi null-terminated `ABC\n` vào shared memory. Lưu ý ký tự xuống dòng ở cuối chuỗi. Ở các bước cuối cùng, process unmap vùng shared memory bằng cách gọi hàm `munmap` và sau đó nó đóng file descriptor được gán cho đối tượng shared memory.

> **Lưu ý**:
>
> Mỗi hệ điều hành cung cấp một cách khác nhau để tạo một đối tượng *unnamed* hay *anonymous shared memory*. Trong FreeBSD, chỉ cần truyền `SHM_ANON` làm đường dẫn của đối tượng shared memory cho hàm `shm_open` là đủ. Trong Linux, người ta có thể tạo một anonymous file bằng hàm `memfd_create` thay vì tạo một đối tượng shared memory và <a id="_idIndexMarker1206"></a>dùng file descriptor được trả về để tạo một vùng được ánh xạ. Một anonymous shared memory là private đối với process sở hữu và không thể được dùng để chia sẻ state giữa một số process.

Code trên có thể được biên dịch trên các hệ thống macOS, FreeBSD và Linux. Trong các hệ thống Linux, các đối tượng shared memory có thể được thấy bên trong thư mục `/dev/shm`. Lưu ý rằng thư mục này không có một filesystem thông thường và những gì bạn thấy không phải là file trên một thiết bị đĩa. Thay vào đó, `/dev/shm` dùng filesystem `shmfs`. Nó dùng để phơi ra các đối tượng tạm thời được tạo bên trong memory thông qua một thư mục được mount, và nó chỉ có sẵn trong Linux.

Hãy biên dịch và chạy *ví dụ 17.4* trong Linux và xem xét nội dung của thư mục `/dev/shm`. Trong Linux, bắt buộc phải link binary cuối cùng với library `rt` để dùng các phương tiện shared memory, và đó là lý do tại sao bạn thấy tùy chọn `-lrt` trong shell box sau:

```
$ ls /dev/shm
$ gcc ExtremeC_examples_chapter17_4.c -lrt -o ex17_4.out
$ ./ex17_4.out
Shared memory is created with fd: 3
The memory region is truncated.
Data is written to the shared memory.
$ ls /dev/shm
shm0
$
```

*Shell Box 17-4: Build và chạy ví dụ 17.4 và kiểm tra xem đối tượng shared memory đã được tạo chưa*

Như bạn có thể thấy ở dòng đầu tiên, không có đối tượng shared memory nào trong thư mục `/dev/shm`. Ở dòng thứ hai, chúng ta build *ví dụ 17.4*, và ở dòng thứ ba, chúng ta thực thi executable file được tạo ra. Sau đó chúng ta kiểm tra `/dev/shm`, và chúng ta thấy rằng chúng ta đã có một đối tượng shared memory mới, `shm0`, ở đó.

Output của<a id="_idIndexMarker1207"></a> chương trình cũng xác nhận việc tạo đối tượng shared memory. Một điều quan trọng khác về shell box trên là file descriptor `3`, được gán cho đối tượng shared memory.

Với mỗi file bạn mở, một file descriptor mới được mở trong mỗi process. File này không nhất thiết ở trên đĩa, và nó có thể là một đối tượng shared memory, standard output, v.v. Trong mỗi process, file descriptor bắt đầu từ 0 và đi lên đến một số tối đa được phép.

Lưu ý rằng trong mỗi process, các file descriptor `0`, `1` và `2` lần lượt được gán trước cho các stream `stdout`, `stdin` và `stderr`. Những file descriptor này được mở cho mọi process mới trước khi hàm `main` của nó chạy. Về cơ bản đó là lý do tại sao đối tượng shared memory trong ví dụ trên nhận `3` làm file descriptor của nó.

> **Lưu ý**:
>
> Trên các hệ thống macOS, bạn có thể dùng tiện ích `pics` để kiểm tra<a id="_idIndexMarker1208"></a> các đối tượng IPC đang hoạt động trong hệ thống. Nó có thể cho bạn thấy các message queue và shared memory đang hoạt động. Nó cũng cho bạn thấy các semaphore đang hoạt động.

Thư mục `/dev/shm` có một thuộc tính thú vị khác. Bạn có thể dùng tiện ích `cat` để xem nội dung của các đối tượng shared memory, nhưng một lần nữa điều này chỉ có sẵn trong Linux. Hãy dùng nó trên đối tượng `shm0` mà chúng ta đã tạo. Như bạn thấy trong shell box sau, nội dung của đối tượng shared memory được hiển thị. Đó là chuỗi `ABC` cộng với một ký tự xuống dòng `\n`:

```
$ cat /dev/shm/shm0
ABC
$
```

*Shell Box 17-5 Dùng chương trình cat để xem nội dung của đối tượng shared memory được tạo trong ví dụ 17.4*

Như chúng tôi đã giải thích trước đây, một đối tượng shared memory tồn tại chừng nào nó còn đang được ít nhất một process dùng. Ngay cả khi một trong các process đã yêu cầu hệ điều hành xóa (hay *unlink*) shared memory, nó sẽ không thực sự bị xóa cho đến khi process cuối cùng dùng xong nó. Ngay cả khi không có process nào unlink một đối tượng shared memory, nó sẽ bị xóa khi một<a id="_idIndexMarker1209"></a> lần khởi động lại xảy ra. Các đối tượng shared memory không thể tồn tại qua các lần khởi động lại, và các process nên tạo lại chúng để dùng chúng cho việc giao tiếp.

Ví dụ sau cho thấy cách một process có thể mở và đọc từ một đối tượng shared memory đã tồn tại và cuối cùng nó có thể unlink nó như thế nào. *Ví dụ 17.5* đọc từ đối tượng shared memory được tạo trong *ví dụ 17.4*. Do đó, nó có thể được coi là phần bổ sung cho những gì chúng ta đã làm trong *ví dụ 17.4*:

```
#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <string.h>
#include <sys/mman.h>
#define SH_SIZE 16
int main(int argc, char** argv) {
  int shm_fd = shm_open("/shm0", O_RDONLY, 0600);
  if (shm_fd < 0) {
    fprintf(stderr, "ERROR: Failed to open shared memory: %s\n",
        strerror(errno));
    return 1;
  }
  fprintf(stdout, "Shared memory is opened with fd: %d\n", shm_fd);
  void* map = mmap(0, SH_SIZE, PROT_READ, MAP_SHARED, shm_fd, 0);
  if (map == MAP_FAILED) {
    fprintf(stderr, "ERROR: Mapping failed: %s\n",
            strerror(errno));
    return 1;
  }
  char* ptr = (char*)map;
  fprintf(stdout, "The contents of shared memory object: %s\n",
          ptr);
  if (munmap(ptr, SH_SIZE) < 0) {
    fprintf(stderr, "ERROR: Unmapping failed: %s\n",
            strerror(errno));
    return 1;
  }
  if (close(shm_fd) < 0) {
    fprintf(stderr, "ERROR: Closing shared memory fd filed: %s\n",
        strerror(errno));
    return 1;
  }
  if (shm_unlink("/shm0") < 0) {
    fprintf(stderr, "ERROR: Unlinking shared memory failed: %s\n",
        strerror(errno));
    return 1;
  }
  return 0;
}
```

*Code Box 17-5 [ExtremeC_examples_chapter17_5.c]: Đọc từ đối tượng shared memory được tạo trong ví dụ 17.4*

Ở câu lệnh đầu tiên trong hàm `main`, chúng ta đã mở một đối tượng shared memory hiện có tên là `/shm0`. Nếu không có đối tượng shared memory nào như vậy, chúng ta sẽ sinh ra một lỗi. Như bạn có thể thấy, chúng ta đã mở đối tượng shared memory ở chế độ read-only, nghĩa là chúng ta sẽ không ghi gì vào shared memory.

Ở các dòng tiếp theo, chúng ta ánh xạ vùng shared memory. Một lần nữa, chúng ta đã chỉ ra rằng vùng được ánh xạ là read-only bằng cách truyền argument `PROT_READ`. Sau đó, cuối cùng chúng ta có một pointer tới vùng shared memory, và chúng ta dùng nó để in nội dung của nó. Khi chúng ta dùng xong<a id="_idIndexMarker1210"></a> shared memory, chúng ta unmap vùng đó. Tiếp theo, file descriptor được gán bị đóng, và cuối cùng đối tượng shared memory được đăng ký để gỡ bỏ bằng cách unlink nó thông qua hàm `shm_unlink`.

Sau điểm này, khi mọi process khác đang dùng cùng shared memory đã dùng xong nó, đối tượng shared memory bị gỡ khỏi hệ thống. Lưu ý rằng đối tượng shared memory tồn tại chừng nào còn có một process đang dùng nó.

Sau đây là output của việc chạy code trên. Lưu ý nội dung của `/dev/shm` trước và sau khi chạy *ví dụ 17.5*:

```
$ ls /dev/shm
shm0
$ gcc ExtremeC_examples_chapter17_5.c -lrt -o ex17_5.out
$ ./ex17_5.out
Shared memory is opened with fd: 3
The contents of the shared memory object: ABC
$ ls /dev/shm
$
```

*Shell Box 17-6: Đọc từ đối tượng shared memory được tạo trong ví dụ 17.4 và cuối cùng gỡ bỏ nó*

<a id="_idParaDest-234"></a>

#### Ví dụ data race dùng shared memory

Giờ, đã đến lúc minh họa một<a id="_idIndexMarker1211"></a> data race dùng <a id="_idIndexMarker1212"></a>sự kết hợp của fork API và shared memory. Nó sẽ tương tự các ví dụ được đưa ra trong *Chương 15*, *Thực thi Thread (Thread Execution)*, để minh họa một data race giữa một số thread.

Trong *ví dụ 17.6*, chúng ta có một biến bộ đếm được đặt bên trong một vùng shared memory. Ví dụ fork một child process từ process chính đang chạy, và cả hai đều cố tăng bộ đếm dùng chung. Output cuối cùng cho thấy một data race rõ ràng trên bộ đếm dùng chung:

```
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <string.h>
#include <sys/mman.h>
#include <sys/wait.h>
#define SH_SIZE 4
// Shared file descriptor used to refer to the
// shared memory object
int shared_fd = -1;
// The pointer to the shared counter
int32_t* counter = NULL;
void init_shared_resource() {
  // Open the shared memory object
  shared_fd = shm_open("/shm0", O_CREAT | O_RDWR, 0600);
  if (shared_fd < 0) {
    fprintf(stderr, "ERROR: Failed to create shared memory: %s\n",
        strerror(errno));
    exit(1);
  }
  fprintf(stdout, "Shared memory is created with fd: %d\n",
          shared_fd);
}
void shutdown_shared_resource() {
  if (shm_unlink("/shm0") < 0) {
    fprintf(stderr, "ERROR: Unlinking shared memory failed: %s\n",
        strerror(errno));
    exit(1);
  }
}
void inc_counter() {
  usleep(1);
  int32_t temp = *counter;
  usleep(1);
  temp++;
  usleep(1);
  *counter = temp;
  usleep(1);
}
int main(int argc, char** argv) {
  // Parent process needs to initialize the shared resource
  init_shared_resource();
  // Allocate and truncate the shared memory region
  if (ftruncate(shared_fd, SH_SIZE * sizeof(char)) < 0) {
    fprintf(stderr, "ERROR: Truncation failed: %s\n",
            strerror(errno));
    return 1;
  }
  fprintf(stdout, "The memory region is truncated.\n");
  // Map the shared memory and initialize the counter
  void* map = mmap(0, SH_SIZE, PROT_WRITE,
          MAP_SHARED, shared_fd, 0);
  if (map == MAP_FAILED) {
    fprintf(stderr, "ERROR: Mapping failed: %s\n",
            strerror(errno));
    return 1;
  }
  counter = (int32_t*)map;
  *counter = 0;
  // Fork a new process
  pid_t pid = fork();
  if (pid) { // The parent process
    // Increment the counter
    inc_counter();
    fprintf(stdout, "The parent process sees the counter as %d.\n",
        *counter);
    // Wait for the child process to exit
    int status = -1;
    wait(&status);
    fprintf(stdout, "The child process finished with status %d.\n",
        status);
  } else { // The child process
    // Incrmenet the counter
    inc_counter();
    fprintf(stdout, "The child process sees the counter as %d.\n",
        *counter);
  }
  // Both processes should unmap shared memory region and close
  // its file descriptor
  if (munmap(counter, SH_SIZE) < 0) {
    fprintf(stderr, "ERROR: Unmapping failed: %s\n",
            strerror(errno));
    return 1;
  }
  if (close(shared_fd) < 0) {
    fprintf(stderr, "ERROR: Closing shared memory fd filed: %s\n",
        strerror(errno));
    return 1;
  }
  // Only parent process needs to shutdown the shared resource
  if (pid) {
    shutdown_shared_resource();
  }
  return 0;
}
```

*Code Box 17-6 [ExtremeC_examples_chapter17_6.c]: Minh họa một data race dùng một POSIX shared memory và fork API*

Có ba hàm trong code trên ngoài hàm `main`. Hàm `init_shared_resource` tạo đối tượng shared memory. Lý do tôi đã đặt tên hàm<a id="_idIndexMarker1213"></a> này là `init_shared_resource` thay vì `init_shared_memory` là thực tế rằng chúng ta có thể dùng một kỹ thuật pull-based khác trong ví dụ trên và việc có một tên chung cho hàm này cho phép hàm `main` giữ nguyên trong các ví dụ sau.

Hàm `shutdown_shared_resource` hủy shared memory và unlink nó. Ngoài ra,<a id="_idIndexMarker1214"></a> hàm `inc_counter` tăng bộ đếm dùng chung thêm 1.

Hàm `main` truncate và ánh xạ vùng shared memory giống như chúng ta đã làm trong *ví dụ 17.4*. Sau khi đã ánh xạ vùng shared memory, logic fork bắt đầu. Bằng việc gọi hàm `fork`, một process mới được sinh ra, và cả hai process (process được fork và process fork) đều cố tăng bộ đếm bằng cách gọi hàm `inc_counter`.

Khi parent process ghi vào bộ đếm dùng chung, nó chờ child process kết thúc, và chỉ sau đó, nó cố unmap, đóng và unlink đối tượng shared memory. Lưu ý rằng việc unmap và đóng file descriptor diễn ra trong cả hai process, nhưng chỉ parent process mới unlink đối tượng shared memory.

Như bạn có thể thấy trong *Code Box 17-6*, chúng ta đã dùng một số lời gọi `usleep` khác thường trong hàm `inc_counter`. Lý do là để buộc scheduler lấy lại lõi CPU từ một process và trao nó cho một process khác. Không có những lời gọi hàm `usleep` này, lõi CPU thường không được chuyển giữa các process, và bạn không thể thấy ảnh hưởng của các interleaving khác nhau thường xuyên lắm.

Một trong những lý do cho ảnh hưởng như vậy là có một số lượng instruction nhỏ trong mỗi process. Nếu<a id="_idIndexMarker1215"></a> số lượng instruction mỗi process tăng đáng kể, người ta có thể thấy hành vi non-deterministic của các interleaving ngay cả khi không có lời gọi sleep. Ví dụ, có một vòng lặp trong mỗi process đếm 10,000 lần và tăng bộ đếm dùng chung trong mỗi lần lặp rất <a id="_idIndexMarker1216"></a>có khả năng làm lộ ra data race. Bạn có thể tự thử điều này.

Lưu ý cuối cùng về code trên, parent process tạo và mở đối tượng shared memory và gán một file descriptor cho nó trước khi fork child process. Process được fork không mở đối tượng shared memory, nhưng nó có thể dùng cùng file descriptor. Thực tế rằng mọi file descriptor đang mở đều được kế thừa từ parent process đã giúp child process tiếp tục và dùng file descriptor, tham chiếu tới cùng đối tượng shared memory.

Sau đây trong *Shell Box 17-7* là output của việc chạy *ví dụ 17.6* một số lần. Như bạn có thể thấy, chúng ta có một data race rõ ràng trên bộ đếm dùng chung. Có những lúc parent process hay child process cập nhật bộ đếm mà không có được giá trị đã sửa đổi mới nhất, và điều này dẫn đến việc cả hai process đều in `1`:

```
$ gcc ExtremeC_examples_chapter17_6 -o ex17_6.out
$ ./ex17_6.out
Shared memory is created with fd: 3
The memory region is truncated.
The parent process sees the counter as 1.
The child process sees the counter as 2.
The child process finished with status 0.
$ ./ex17_6
...
...
...
$ ./ex17_6.out
Shared memory is created with fd: 3
The memory region is truncated.
The parent process sees the counter as 1.
The child process sees the counter as 1.
The child process finished with status 0.
$
```

*Shell Box 17-7: Chạy ví dụ 17.6 và minh họa data race xảy ra trên bộ đếm dùng chung*

Trong phần này, chúng tôi đã cho thấy cách tạo và dùng shared memory. Chúng tôi cũng đã minh họa một<a id="_idIndexMarker1217"></a> ví dụ data race và cách các process concurrent hoạt động khi truy cập một vùng shared memory. Trong<a id="_idIndexMarker1218"></a> phần sau, chúng ta sẽ nói về filesystem như một phương pháp pull-based được dùng rộng rãi khác để chia sẻ một state giữa một số process.

<a id="_idParaDest-235"></a>

### File system

POSIX phơi ra một API tương tự để <a id="_idIndexMarker1219"></a>làm việc với file trong một filesystem. Chừng nào có liên quan đến file descriptor và chúng được dùng để tham chiếu tới các đối tượng hệ thống khác nhau, cùng API như API được giới thiệu để làm việc với shared memory có thể được dùng.

Chúng ta dùng file descriptor để tham chiếu tới các file thực sự trong một filesystem như **ext4**, cùng với shared memory, pipe, v.v.; do đó, cùng ngữ nghĩa cho việc mở, đọc, ghi, ánh xạ chúng tới một vùng memory cục bộ, v.v. có thể được dùng. Do đó, chúng ta kỳ vọng thấy thảo luận tương tự và có lẽ code C tương tự liên quan đến filesystem như chúng ta đã có cho shared memory. Chúng ta thấy điều này trong *ví dụ 17.7*.

> **Lưu ý**:
>
> Chúng ta thường ánh xạ file descriptor. Tuy nhiên, có một số trường hợp ngoại lệ, nơi *socket descriptor* có thể được ánh xạ. Socket<a id="_idIndexMarker1220"></a> descriptor tương tự file descriptor nhưng được dùng cho network socket hay Unix socket. Link này cung cấp <a id="_idIndexMarker1221"></a>một trường hợp sử dụng thú vị cho việc ánh xạ kernel buffer đằng sau một TCP socket, được gọi là một *zero-copy receive mechanism*: https://lwn.net/Articles/752188/.

Lưu ý rằng đúng là API được dùng để làm việc với filesystem rất giống API chúng ta đã dùng cho shared memory, nhưng điều đó không có nghĩa là bản triển khai của chúng cũng tương tự. Thực tế, một đối tượng file trong một filesystem được hỗ trợ bởi một ổ cứng về cơ bản khác với một đối tượng shared memory. Hãy thảo luận ngắn gọn một số khác biệt:

- Một đối tượng shared memory <a id="_idIndexMarker1223"></a>về cơ bản nằm trong không gian memory của kernel process trong khi một file trong một filesystem nằm trên một đĩa. Nhiều nhất, một file như vậy có một số buffer được cấp phát cho các thao tác đọc và ghi.
- Các state được ghi vào shared memory bị xóa sạch khi khởi động lại hệ thống, nhưng các state được ghi vào một file dùng chung, nếu nó được hỗ trợ bởi một ổ cứng hay nơi lưu trữ vĩnh viễn, có thể được giữ lại sau khi khởi động lại.
- Nói chung, truy cập shared memory nhanh hơn rất nhiều so với truy cập filesystem.

Code sau là cùng ví dụ data race mà chúng ta đã đưa ra cho shared memory trong phần trước. Vì API được dùng cho filesystem khá giống API chúng ta đã dùng cho shared memory, chúng ta chỉ cần thay đổi hai hàm từ *ví dụ 17.6*; `init_shared_resource` và `shutdown_shared_resource`. Phần còn lại sẽ giữ nguyên. Đây là một thành tựu lớn đạt được nhờ dùng cùng POSIX API thao tác trên các file descriptor. Hãy đi vào code:

```
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <string.h>
#include <sys/mman.h>
#include <sys/wait.h>
#define SH_SIZE 4
// The shared file descriptor used to refer to the shared file
int shared_fd = -1;
// The pointer to the shared counter
int32_t* counter = NULL;
void init_shared_resource() {
  // Open the file
  shared_fd = open("data.bin", O_CREAT | O_RDWR, 0600);
  if (shared_fd < 0) {
    fprintf(stderr, "ERROR: Failed to create the file: %s\n",
        strerror(errno));
    exit(1);
  }
  fprintf(stdout, "File is created and opened with fd: %d\n",
          shared_fd);
}
void shutdown_shared_resource() {
  if (remove("data.bin") < 0) {
    fprintf(stderr, "ERROR: Removing the file failed: %s\n",
        strerror(errno));
    exit(1);
  }
}
void inc_counter() {
  ... As exmaple 17.6 ...
}
int main(int argc, char** argv) {
  ... As exmaple 17.6 ...
}
```

*Code Box 17-7 [ExtremeC_examples_chapter17_7.c]: Minh họa một data race dùng file thông thường và fork API*

Như bạn thấy, phần lớn <a id="_idIndexMarker1224"></a>code trên được lấy từ *ví dụ 17.6*. Phần còn lại là sự thay thế bằng việc dùng các hàm `open` và `remove` thay cho các hàm `shm_open` và `shm_unlink`.

Lưu ý rằng file `data.bin` được tạo trong thư mục hiện tại vì chúng ta chưa đưa một đường dẫn tuyệt đối cho hàm `open`. Chạy code trên cũng tạo ra cùng data race trên bộ đếm dùng chung. Nó có thể được xem xét tương tự cách tiếp cận của chúng ta cho *ví dụ 17.6*.

Cho đến giờ, chúng ta đã thấy rằng chúng ta có thể dùng shared memory và file dùng chung để lưu một state và truy cập nó từ một số process một cách concurrent. Giờ, đã đến lúc nói về multithreading và multi-processing theo một nghĩa rộng hơn và so sánh chúng kỹ lưỡng.

<a id="_idParaDest-236"></a>

## Multithreading so với multi-processing

Sau khi thảo luận <a id="_idIndexMarker1226"></a>multithreading và multi-processing trong *Chương 14*, *Synchronization*, cùng với các khái niệm chúng ta đã trình bày trong các chương gần đây, chúng ta đang ở vị trí tốt để so sánh chúng và đưa ra một mô tả high-level về các tình huống mà mỗi cách tiếp cận nên được dùng. Giả sử rằng chúng ta sẽ thiết kế một phần mềm nhằm xử lý một số yêu cầu input một cách concurrent. Chúng ta thảo luận điều này trong ngữ cảnh của ba tình huống khác nhau. Hãy bắt đầu với tình huống thứ nhất.

<a id="_idParaDest-237"></a>

### Multithreading

Tình huống thứ nhất là khi bạn có thể viết một phần mềm chỉ có một process, và mọi yêu cầu đều đi vào cùng process đó. Mọi logic nên<a id="_idIndexMarker1228"></a> được viết như một phần của cùng process, và kết quả là, bạn có một process đồ sộ làm mọi thứ trong hệ thống của bạn. Vì đây là phần mềm single-process, nếu bạn muốn xử lý nhiều yêu cầu một cách concurrent, bạn cần làm điều đó theo cách multithreaded bằng việc tạo các thread để xử lý nhiều yêu cầu. Hơn nữa, có thể là một quyết định thiết kế tốt hơn khi <a id="_idIndexMarker1229"></a>chọn một *thread pool* có một số lượng thread giới hạn.

Có những cân nhắc sau về concurrency và synchronization nên được chú ý. Lưu ý rằng chúng tôi không nói về việc dùng event loop hay asynchronous I/O trong tình huống này, dù nó vẫn có thể là một lựa chọn thay thế hợp lệ cho multithreading.

Nếu số lượng yêu cầu tăng đáng kể, số lượng thread giới hạn bên trong thread pool nên được tăng lên để đáp ứng nhu cầu. Điều này theo đúng nghĩa đen có nghĩa là nâng cấp phần cứng và tài nguyên trên máy mà process chính đang chạy. Điều này được gọi là *scaling up* hay *vertical scaling*. Nó có nghĩa là bạn nâng cấp phần cứng bạn có trên<a id="_idIndexMarker1230"></a> một máy duy nhất để<a id="_idIndexMarker1231"></a> có thể đáp ứng nhiều yêu cầu hơn. Ngoài thời gian ngừng hoạt động khả dĩ mà các client gặp phải trong khi nâng cấp lên phần cứng mới (dù có thể ngăn được), việc nâng cấp tốn kém, và bạn phải thực hiện một lần scale up khác khi số lượng yêu cầu lại tăng.

Nếu việc xử lý các yêu cầu rốt cuộc dẫn đến việc thao tác một shared state hay một kho dữ liệu, các kỹ thuật synchronization có thể được triển khai dễ dàng, nhờ biết thực tế rằng các thread có quyền truy cập vào cùng không gian memory. Dĩ nhiên, điều này là cần thiết dù chúng có một cấu trúc dữ liệu dùng chung cần được duy trì hay chúng có quyền truy cập vào một kho dữ liệu từ xa không có tính giao dịch (transactional).

Mọi thread đều đang chạy trên cùng một máy, và do đó chúng có thể dùng mọi kỹ thuật được dùng để chia sẻ một state mà chúng tôi đã giải thích cho đến giờ, được dùng bởi cả thread lẫn process. Đây là<a id="_idIndexMarker1232"></a> một tính năng tuyệt vời và giảm bớt rất nhiều khó khăn<a id="_idIndexMarker1233"></a> khi nói đến thread synchronization.

Hãy nói về tình huống tiếp theo, khi chúng ta có thể có nhiều hơn một process nhưng tất cả chúng đều ở trên cùng một máy.

<a id="_idParaDest-238"></a>

### Single-host multi-processing (xử lý đa process trên một host)

Trong tình huống này, chúng ta viết<a id="_idIndexMarker1234"></a> một phần mềm có nhiều process, nhưng tất cả đều được triển khai trên một máy duy nhất. Mọi process này có thể hoặc là single-threaded, hoặc chúng có thể có một thread pool bên trong cho phép mỗi process xử lý nhiều hơn một yêu cầu tại một thời điểm.

Khi số lượng<a id="_idIndexMarker1235"></a> yêu cầu tăng, người ta có thể tạo các process mới thay vì tạo thêm thread. Điều này thường được gọi là *scaling out* hay *horizontal scaling*. Tuy nhiên, khi bạn chỉ có một máy duy nhất, bạn phải scale up nó, hay nói cách khác, bạn phải<a id="_idIndexMarker1236"></a> nâng cấp phần cứng của nó. Điều này có thể gây ra cùng các vấn đề mà chúng tôi đã đề cập đối với việc scale up một chương trình multithreaded trong tiểu mục trước.

Khi nói đến concurrency, các process đang được thực thi trong một môi trường concurrent. Chúng chỉ có thể dùng các cách multi-processing để chia sẻ một state hay đồng bộ hóa các process. Chắc chắn, nó không tiện lợi bằng việc viết code multithreaded. Ngoài ra, các process có thể dùng cả các kỹ thuật pull-based lẫn push-based để chia sẻ state.

Multi-processing trên một máy duy nhất không hiệu quả lắm, và có vẻ như multithreading tiện lợi hơn khi nói đến công sức viết code.

Tiểu mục tiếp theo nói về môi trường multi-processing phân tán, vốn là thiết kế tốt nhất để tạo phần mềm hiện đại.

<a id="_idParaDest-239"></a>

### Distributed multi-processing (xử lý đa process phân tán)

Trong tình huống cuối cùng, chúng ta<a id="_idIndexMarker1237"></a> đã viết một chương trình được chạy dưới dạng nhiều process, chạy trên nhiều host, tất cả được kết nối với nhau qua một mạng, và trên một host duy nhất chúng ta có thể có nhiều hơn một process đang chạy. Các đặc điểm sau có thể được thấy trong một cách triển khai như vậy.

Khi đối mặt với sự tăng trưởng đáng kể về số lượng yêu cầu, hệ thống này có thể được scale out không giới hạn. Đây là một tính năng tuyệt vời cho phép bạn dùng phần cứng thông dụng khi bạn đối mặt với những đỉnh cao như vậy. Việc dùng các cluster phần cứng thông dụng thay cho các server mạnh mẽ là một trong những ý tưởng đã cho phép Google chạy các thuật toán *Page Rank* và *Map* *Reduce* của mình trên một cluster máy.

Các kỹ thuật được thảo luận trong chương này hầu như không giúp được gì vì chúng có một điều kiện tiên quyết quan trọng: mọi process đều đang chạy trên cùng một máy. Do đó, một tập thuật toán và kỹ thuật hoàn toàn khác nên được dùng để làm cho các process được đồng bộ hóa và làm cho các shared state sẵn có cho mọi process trong hệ thống. *Latency* (độ trễ), *fault tolerance* (khả năng chịu lỗi), *availability* (tính sẵn sàng), *data consistency* (tính nhất quán dữ liệu), và nhiều yếu tố khác nữa nên được nghiên cứu và tinh chỉnh đối với một hệ thống phân tán như vậy.

Các process trên các host khác nhau dùng network socket để giao tiếp theo cách push-based, nhưng các process trên cùng một host có thể dùng các kỹ thuật IPC cục bộ, ví dụ, message queue, shared memory, pipe, v.v., để chuyển thông điệp và chia sẻ state.

Lời cuối trong phần này, trong ngành công nghiệp phần mềm hiện đại, chúng ta thích scaling out hơn scaling up. Điều này sẽ làm nảy sinh nhiều ý tưởng và công nghệ mới cho lưu trữ dữ liệu, synchronization, truyền thông điệp, v.v. Nó thậm chí có thể có tác động đến thiết kế phần cứng để làm cho nó phù hợp với horizontal scaling.

<a id="_idParaDest-240"></a>

## Tóm tắt

Trong chương này, chúng ta đã khám phá các hệ thống multi-processing và các kỹ thuật khác nhau có thể được dùng để chia sẻ một state giữa một số process. Các chủ đề sau đã được trình bày trong chương này:

- Chúng tôi đã giới thiệu các POSIX API được dùng để thực thi process. Chúng tôi đã giải thích `fork` API và các hàm `exec*` hoạt động như thế nào.
- Chúng tôi đã giải thích các bước mà một kernel thực hiện để thực thi một process.
- Chúng ta đã thảo luận các cách mà một state có thể được chia sẻ giữa một số process.
- Chúng tôi đã giới thiệu các kỹ thuật pull-based và push-based như hai nhóm top-level cho mọi kỹ thuật có sẵn khác.
- Shared memory và file dùng chung trên một filesystem nằm trong số các kỹ thuật phổ biến để chia sẻ một state theo cách pull-based.
- Chúng tôi đã giải thích những khác biệt và tương đồng của các cách triển khai multithreading và multi-processing và các khái niệm vertical scaling và horizontal scaling trong một hệ thống phần mềm phân tán.

Trong chương tiếp theo, chúng ta sẽ nói về concurrency trong các môi trường multi-processing single-host. Nó sẽ gồm các thảo luận về các vấn đề concurrency và các cách đồng bộ hóa một số process để bảo vệ một tài nguyên dùng chung. Các chủ đề rất giống những chủ đề bạn đã gặp trong *Chương 16*, *Thread Synchronization*, nhưng trọng tâm của chúng là process thay vì thread.
