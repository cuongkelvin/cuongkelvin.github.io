<a id="_idParaDest-207"></a>

# Chương 15: Thực thi Thread (Thread Execution)

Như chúng tôi đã giải thích trong chương trước, concurrency có thể được triển khai bằng chỉ một trong hai cách tiếp cận *multithreading* hay *multi-processing* bên trong một hệ thống POSIX-compliant. Vì hai cách tiếp cận này là những chủ đề quá lớn để thảo luận, chúng đã được chia thành bốn chương riêng biệt để cho mỗi chủ đề phạm vi trình bày mà nó cần:

- **Cách tiếp cận multithreading** sẽ được thảo luận trong cả chương này và *Chương 16*, *Thread Synchronization*
- **Cách tiếp cận multi-processing** sẽ được trình bày trong *Chương 17*, *Process Execution*, và *Chương 18*, *Process Synchronization*.

Trong chương này, chúng ta sẽ xem xét cấu tạo của một thread và các API có thể được dùng để tạo và quản lý thread. Trong chương tiếp theo, *Chương 16, Thread Synchronization*, chúng ta sẽ đi qua các cơ chế concurrency control trong một môi trường multithreaded để nghiên cứu cách chúng được dự định giải quyết các vấn đề concurrency-related.

Multi-processing hoàn toàn là về ý tưởng<a id="_idIndexMarker1053"></a> đưa concurrency vào phần mềm bằng cách chia logic của nó thành các process concurrent, rốt cuộc dẫn đến phần mềm multi-process. Vì những khác biệt hiện có giữa multithreading và multi-processing, chúng tôi đã quyết định chuyển thảo luận về multi-processing sang hai chương riêng biệt.

Để so sánh, multithreading, trọng tâm của hai chương đầu tiên, bị giới hạn trong một hệ thống single-process. Đây là sự thật cơ bản nhất về thread và là lý do tại sao chúng ta tập trung vào nó trước.

Trong chương trước, chúng tôi đã giải thích ngắn gọn những khác biệt và tương đồng giữa multithreading và multi-processing. Trong chương này, chúng ta sẽ tập trung vào multithreading, cùng với việc khám phá cách chúng nên được dùng để có nhiều thread thực thi chạy hoàn hảo trong một process duy nhất.

Các chủ đề sau được trình bày trong chương này:

- Chúng ta bắt đầu bằng việc nói về thread. Cả *user thread* lẫn *kernel thread* đều được giải thích trong phần này, và một số thuộc tính quan trọng nhất của thread được thảo luận. Những thuộc tính này giúp chúng ta hiểu rõ hơn một môi trường multithreaded.
- Sau đó chúng ta chuyển sang phần tiếp theo, dành cho việc lập trình cơ bản dùng library **POSIX threading**, hay viết tắt là library **pthread**. Library này là<a id="_idIndexMarker1054"></a> library chuẩn chính cho phép chúng ta phát triển các chương trình concurrent trên các hệ thống POSIX, nhưng điều đó không có nghĩa là các hệ điều hành non-POSIX-compliant không hỗ trợ concurrency. Đối với các hệ điều hành non-compliant như Microsoft Windows, chúng vẫn có thể cung cấp API riêng để phát triển các chương trình concurrent. Library POSIX threading cung cấp hỗ trợ cho cả thread lẫn process. Tuy nhiên, trong chương này, trọng tâm của chúng ta là phần threading, nơi chúng ta xem xét cách library pthread có thể được dùng cả để tạo một thread lẫn để quản lý nó sau đó.
- Trong một bước tiếp theo, chúng tôi cũng minh họa một race condition cùng với một data race được tạo ra trong một số ví dụ code C dùng library pthread. Điều này xây dựng nền tảng để tiếp tục thảo luận của chúng ta trong chương tiếp theo về *thread synchronization*.

> **Lưu ý**:
>
> Để có thể nắm bắt đầy đủ các thảo luận mà chúng ta sẽ có liên quan đến cách tiếp cận multithreading, rất khuyến khích bạn hoàn thành chương này trước khi chuyển sang *Chương 16*, *Thread Synchronization*. Đó là vì các chủ đề được giới thiệu trong chương này xuất hiện xuyên suốt phần thứ hai của việc chúng ta tìm hiểu thread synchronization, sẽ có trong chương tiếp theo.

Trước khi đi xa hơn, hãy nhớ rằng chúng ta sẽ chỉ trình bày cách dùng cơ bản của library POSIX threading trong chương này. Việc đi sâu vào nhiều yếu tố hấp dẫn của library POSIX threading nằm ngoài phạm vi của cuốn sách này và do đó, khuyến khích bạn dành chút thời gian để khám phá library pthread chi tiết hơn và có đủ thực hành thông qua các ví dụ đã viết để giúp bạn thoải mái với nó. Cách dùng nâng cao hơn của library POSIX threading sẽ được minh họa trong các chương còn lại của cuốn sách này.

Tuy nhiên, lúc này, hãy đi sâu vào khái niệm thread bằng cách bắt đầu với một tổng quan xem xét mọi thứ chúng ta biết về chúng. Đây là một yếu tố then chốt trong sự hiểu biết của chúng ta, vì chúng ta sẽ giới thiệu các khái niệm then chốt khác mà chúng ta sẽ học trong các trang còn lại của chương này.

<a id="_idParaDest-208"></a>

## Thread

Trong chương trước, chúng ta đã thảo luận về thread như một phần của <a id="_idIndexMarker1055"></a>cách tiếp cận multithreading mà bạn có thể dùng khi muốn viết các chương trình concurrent trong một hệ điều hành POSIX-compliant.

Trong phần này, bạn sẽ thấy một bản tóm tắt về<a id="_idIndexMarker1056"></a> mọi thứ bạn nên biết về thread. Chúng tôi cũng sẽ đưa vào một số thông tin mới liên quan đến các chủ đề chúng ta sẽ thảo luận sau. Hãy nhớ rằng mọi thông tin này sẽ đóng vai trò như một nền tảng để tiếp tục phát triển các chương trình multithreaded.

Mỗi thread được khởi tạo bởi một process. Sau đó nó sẽ thuộc về process đó mãi mãi. Không thể có một thread dùng chung hay chuyển quyền sở hữu một thread sang một process khác. Mỗi process có ít nhất một<a id="_idIndexMarker1057"></a> thread là *main thread* của nó. Trong một chương trình C, hàm `main` được thực thi như một phần của main thread.

Mọi thread đều chia sẻ<a id="_idIndexMarker1058"></a> cùng một **Process ID** (**PID**). Nếu bạn dùng các tiện ích như `top` hay `htop`, bạn có thể dễ dàng thấy các thread đang chia sẻ cùng process ID, và được nhóm dưới nó. Hơn thế nữa, mọi thuộc tính của process sở hữu đều được kế thừa bởi mọi thread của nó, ví dụ, group ID, user ID, thư mục làm việc hiện tại và signal handler. Ví dụ, thư mục làm việc hiện tại của một thread giống với của process sở hữu nó.

Mỗi thread có một **Thread ID** (**TID**) độc nhất <a id="_idIndexMarker1059"></a>và riêng. ID này có thể được dùng để truyền signal tới thread đó hay theo dõi nó khi debug. Bạn sẽ thấy rằng trong POSIX thread, thread ID có thể truy cập được qua biến `pthread_t`. Ngoài ra, mỗi thread cũng có một signal mask riêng có thể được dùng để lọc ra các signal mà nó có thể nhận.

Mọi thread bên trong cùng một process đều có quyền truy cập vào mọi *file descriptor* được mở bởi các thread khác trong process đó. Do đó, mọi thread đều có thể đọc hay sửa đổi các tài nguyên đằng sau những<a id="_idIndexMarker1060"></a> file descriptor đó. Điều này cũng đúng với các *socket descriptor* và các *socket* đã mở. Trong các <a id="_idIndexMarker1061"></a>chương sắp tới, bạn sẽ học thêm về file descriptor và socket.

Thread có thể dùng mọi kỹ thuật được process dùng đã được giới thiệu trong chương 14 để chia sẻ hay chuyển một state. Hãy lưu ý thực tế rằng việc có một shared state ở một nơi dùng chung (như một cơ sở dữ liệu) khác với việc truyền nó trên một mạng chẳng hạn, và điều này dẫn đến hai nhóm kỹ thuật IPC khác nhau. Chúng ta sẽ quay lại điểm này trong các chương sau.

Ở đây, bạn có thể tìm thấy một danh sách các phương pháp có thể được thread dùng để chia sẻ hay chuyển một state trong một hệ thống POSIX-compliant:

- Memory của process sở hữu (các segment Data, Stack và Heap). Phương pháp này *chỉ* đặc thù cho thread chứ không phải process.
- Filesystem.
- Memory-mapped <a id="_idIndexMarker1062"></a>file.
- Mạng (dùng internet socket).
- Truyền signal giữa các thread.
- Shared memory.
- POSIX pipe.
- Unix domain socket.
- POSIX message queue.
- Biến môi trường.

Tiếp tục với các thuộc tính của thread, mọi thread bên trong cùng một process đều có thể dùng cùng không gian memory của process để lưu và duy trì một shared state. Đây là cách phổ biến nhất để chia sẻ một <a id="_idIndexMarker1063"></a>state giữa một số thread. Segment Heap của process thường được dùng cho mục đích này.

Vòng đời của một thread phụ thuộc vào vòng đời của process sở hữu nó. Khi một process bị *kill* hay *terminate*, mọi thread thuộc về process đó cũng sẽ bị kết thúc.

Khi main thread kết thúc, process thoát ngay lập tức. Tuy nhiên, nếu có các thread *detached* khác đang chạy, process chờ tất cả chúng kết thúc trước khi bị kết thúc. Detached thread sẽ được giải thích khi giải thích việc tạo thread trong POSIX.

Process tạo ra một thread có thể là kernel process. Đồng thời, nó cũng có thể là một user process được khởi tạo<a id="_idIndexMarker1064"></a> trong user space. Nếu process là kernel, thread được gọi là một *kernel-level thread* hay đơn giản là một *kernel thread*, ngược lại,<a id="_idIndexMarker1065"></a> thread được gọi là một *user-level thread*. Kernel thread thường thực thi logic quan trọng, và vì <a id="_idIndexMarker1066"></a>điều này chúng có độ ưu tiên cao hơn của user thread. Ví dụ, một device driver có thể đang dùng một kernel thread để chờ một tín hiệu phần cứng.

Tương tự các user thread có quyền truy cập vào cùng vùng memory, kernel thread cũng có thể truy cập không gian memory của kernel và, kéo theo đó, mọi thủ tục và đơn vị bên trong kernel.

Trong suốt cuốn sách này, chúng ta sẽ chủ yếu nói về user thread, không phải kernel thread. Đó là vì API cần thiết để làm việc với user thread được chuẩn POSIX cung cấp. Nhưng không có interface chuẩn nào để tạo và quản lý một kernel thread và chúng chỉ đặc thù cho từng kernel.

Tạo và quản lý kernel thread nằm ngoài phạm vi của cuốn sách này. Do đó, từ điểm này trở đi, khi chúng ta dùng thuật ngữ *thread*, chúng ta đang chỉ user thread chứ không phải kernel thread.

Một người dùng không thể tạo một thread trực tiếp. Người dùng cần sinh ra một process trước, vì chỉ khi đó main thread của process đó mới có thể khởi tạo một thread khác. Lưu ý rằng chỉ thread mới có thể tạo thread.

Về memory<a id="_idIndexMarker1067"></a> layout của thread, mỗi thread có vùng memory Stack riêng có thể được coi là một vùng memory private dành riêng cho thread đó. Tuy nhiên, trên thực tế, nó có thể được các thread khác (bên trong cùng process) truy cập khi có một pointer trỏ tới nó.

Bạn nên nhớ rằng mọi vùng Stack này đều là một phần của cùng không gian memory của process và có thể được bất kỳ thread nào bên trong cùng process truy cập.

Về các kỹ thuật synchronization, cùng các cơ chế kiểm soát được dùng để đồng bộ hóa process có thể được dùng để đồng bộ hóa một số thread. Semaphore, mutex và condition variable là một phần của các công cụ có thể được dùng để đồng bộ hóa thread, cũng như process.

Khi các thread của nó được đồng bộ hóa và không còn data race hay race condition nào có thể quan sát được, một chương trình thường được gọi là<a id="_idIndexMarker1068"></a> một chương trình *thread-safe*. Tương tự, một library hay một tập hàm có thể dễ dàng được dùng trong một chương trình multithreaded mà không đưa vào vấn đề concurrency mới nào được gọi là một *thread-safe library*. Mục tiêu của chúng ta với tư cách lập trình viên<a id="_idIndexMarker1069"></a> là tạo ra một đoạn code thread safe.

> **Lưu ý**:
>
> Trong link sau, bạn có thể tìm thấy thêm thông tin về POSIX thread và các thuộc tính mà chúng chia sẻ. Link sau là <a id="_idIndexMarker1070"></a>về bản triển khai NTPL của POSIX threading interface. Nó dành cho môi trường Linux nhưng phần lớn có thể áp dụng cho các hệ điều hành Unix-like khác.
>
> http://man7.org/linux/man-pages/man7/pthreads.7.html.

Trong phần này, chúng ta đã xem xét một số khái niệm và thuộc tính nền tảng liên quan đến thread để hiểu rõ hơn các phần sắp tới. Bạn sẽ thấy nhiều thuộc tính này hoạt động sau đó khi chúng ta nói về các ví dụ multithreaded khác nhau.

Phần tiếp theo sẽ giới thiệu với bạn các ví dụ code đầu tiên về cách tạo một POSIX thread. Phần này sẽ đơn giản vì nó chỉ đề cập những điều cơ bản của threading trong POSIX. Những điều cơ bản này sẽ dẫn chúng ta vào các chủ đề nâng cao hơn sau đó.

<a id="_idParaDest-209"></a>

## POSIX thread

Phần này dành cho POSIX threading API, được biết đến nhiều hơn là *pthread library*. API này rất quan trọng vì nó là<a id="_idIndexMarker1071"></a> API chính được dùng để tạo và<a id="_idIndexMarker1072"></a> quản lý thread trong một hệ điều hành POSIX-compliant <a id="_idIndexMarker1073"></a>.

Trong các hệ điều hành non-POSIX-compliant như Microsoft Windows, phải có một API khác được thiết kế cho mục đích này và nó có thể được tìm thấy trong tài liệu của hệ điều hành đó. Ví dụ, trong trường hợp Microsoft Windows, threading API được cung cấp như một phần của Windows API<a id="_idIndexMarker1074"></a>, được biết đến là Win32 API. Đây là link tới tài liệu của Microsoft<a id="_idIndexMarker1075"></a> về [Windows' threading API: https://docs.microsoft.com/en-us/windows/desktop/procthread/proce](https://docs.microsoft.com/en-us/windows/desktop/procthread/process-and-thread-functions)ss-and-thread-functions.

Tuy nhiên, trong C11, chúng ta kỳ vọng có một API thống nhất để làm việc với thread. Nói cách khác, bất kể bạn đang viết một chương trình cho một hệ thống POSIX hay một hệ thống non-POSIX, bạn sẽ có thể dùng cùng API do C11 cung cấp. Dù điều này rất đáng mong muốn, vào thời điểm này chưa có nhiều hỗ trợ cho những API phổ quát như vậy giữa các cách triển khai chuẩn C khác nhau, như glibc.

Tiếp tục chủ đề, library pthread đơn giản là một tập *header* và *hàm* có thể được dùng để viết các chương trình multithreaded trong các hệ điều hành POSIX-compliant. Mỗi hệ điều hành có bản triển khai riêng cho library pthread. Những bản triển khai này có thể hoàn toàn khác với những gì một hệ điều hành POSIX-compliant khác có, nhưng rốt cuộc, tất cả chúng đều phơi ra cùng một interface (API).

Một ví dụ nổi tiếng<a id="_idIndexMarker1076"></a> là **Native POSIX Threading Library**, hay viết tắt là **NPTL**, vốn là bản triển khai chính của library pthread cho hệ điều hành Linux.

Như được pthread API mô tả, mọi chức năng threading đều có sẵn bằng cách include header `pthread.h`. Cũng có một số phần mở rộng của library pthread chỉ có sẵn nếu bạn include `semaphore.h`. Ví dụ, một trong các phần mở rộng liên quan đến các thao tác semaphore-specific, ví dụ, tạo một semaphore, khởi tạo nó, hủy nó, v.v.

Library POSIX threading phơi ra các chức năng sau. Chúng hẳn quen thuộc với bạn vì chúng tôi đã đưa ra các giải thích chi tiết về chúng trong các chương trước:

- Quản lý thread, bao gồm tạo thread, join thread và detach thread
- Mutex
- Semaphore
- Condition variable
- Các loại lock khác nhau như spinlock và recursive lock

Để giải thích các chức năng trên, chúng ta phải bắt đầu với tiền tố `pthread_`. Mọi hàm pthread đều bắt đầu bằng tiền tố này. Điều này đúng trong mọi trường hợp ngoại trừ semaphore, vốn không phải là một phần của library POSIX threading ban đầu và đã được thêm vào sau như một phần mở rộng. Trong trường hợp này, các hàm sẽ bắt đầu bằng tiền tố `sem_`.

Trong các phần sau của chương này, chúng ta sẽ thấy cách dùng một số chức năng trên khi viết một chương trình multithreaded. Để bắt đầu, chúng ta sẽ học cách tạo một POSIX thread để chạy một đoạn code concurrent với main thread. Ở đây, chúng ta sẽ tìm hiểu về các hàm `pthread_create` và `pthread_join`, thuộc về API chính lần lượt được dùng để *tạo* và *join* thread.

<a id="_idParaDest-210"></a>

## Sinh ra POSIX thread

Sau khi đã đi qua mọi<a id="_idIndexMarker1078"></a> khái niệm cơ bản như interleaving, lock, mutex và condition variable trong các chương trước, và giới thiệu khái niệm POSIX thread trong chương này, đã đến lúc viết một ít code.

Bước đầu tiên là tạo một POSIX thread. Trong phần này, chúng tôi sẽ minh họa cách chúng ta có thể dùng POSIX threading API để tạo các thread mới bên trong một process. *Ví dụ 15.1* sau mô tả cách tạo một thread thực hiện một tác vụ đơn giản như in một chuỗi ra output:

```
#include <stdio.h>
#include <stdlib.h>
// The POSIX standard header for using pthread library
#include <pthread.h>
// This function contains the logic which should be run
// as the body of a separate thread
void* thread_body(void* arg) {
  printf("Hello from first thread!\n");
  return NULL;
}
int main(int argc, char** argv) {
  // The thread handler
  pthread_t thread;
  // Create a new thread
  int result = pthread_create(&thread, NULL, thread_body, NULL);
  // If the thread creation did not succeed
  if (result) {
    printf("Thread could not be created. Error number: %d\n",
            result);
    exit(1);
  }
  // Wait for the created thread to finish
  result = pthread_join(thread, NULL);
  // If joining the thread did not succeed
  if (result) {
    printf("The thread could not be joined. Error number: %d\n",
            result);
    exit(2);
  }
  return 0;
}
```

*Code Box 15-1 [ExtremeC_examples_chapter15_1.c]: Sinh ra một POSIX thread mới*

Code ví dụ, thấy trong *Code Box 15-1*, tạo một POSIX thread mới. Đây là ví dụ đầu tiên trong cuốn<a id="_idIndexMarker1079"></a> sách này có hai thread. Mọi ví dụ trước đều là single-threaded, và code luôn chạy bên trong main thread.

Hãy giải thích code chúng ta vừa xem. Ở đầu, chúng ta đã include một header file mới: `pthread.h`. Đây là header file chuẩn phơi ra mọi chức năng pthread. Chúng ta cần header file này để có thể đưa vào các khai báo của cả hai hàm `pthread_create` và `pthread_join`.

Ngay trước hàm `main`, chúng ta đã khai báo một hàm mới: `thread_body`. Hàm này tuân theo một chữ ký cụ thể. Nó nhận một pointer `void*` và trả về một pointer `void*` khác. Để nhắc lại, `void*` là một kiểu generic pointer có thể biểu diễn bất kỳ kiểu pointer nào khác, như `int*` hay `double*`.

Do đó, chữ ký này là chữ ký tổng quát nhất mà một hàm C có thể có. Điều này được chuẩn POSIX áp đặt rằng mọi hàm muốn là *companion function* (hàm đồng hành) cho một thread (được dùng làm<a id="_idIndexMarker1081"></a> logic của thread) nên tuân theo chữ ký tổng quát này. Đó là lý do tại sao chúng ta đã định nghĩa hàm `thread_body` như vậy.

> **Lưu ý**:
>
> Hàm `main` là một phần logic của main thread. Khi main thread được tạo ra, nó thực thi hàm `main` như một phần logic của nó. Điều này có nghĩa là có thể có code khác được thực thi trước và sau hàm `main`.

Quay lại code, ở instruction đầu tiên trong hàm `main`, chúng ta đã khai báo một biến kiểu `pthread_t`. Đây là một biến thread handle, và khi được khai báo, nó không tham chiếu tới bất kỳ thread cụ thể nào. Nói cách khác, biến này chưa giữ thread ID hợp lệ nào. Chỉ sau khi tạo một thread thành công, biến này mới chứa một handle hợp lệ tới thread mới được tạo.

Sau khi tạo thread, thread handle thực sự tham chiếu tới thread ID của thread vừa được tạo. Trong khi thread ID là định danh thread trong hệ điều hành, thread handle là đại diện của thread trong chương trình. Phần lớn thời gian, giá trị được lưu trong thread handle giống với thread ID. Mỗi thread có thể truy cập thread ID của nó thông qua việc có được một biến `pthread_t` tham chiếu tới chính nó. Một thread có thể dùng hàm `pthread_self` để có được một handle self-referring (tự tham chiếu). Chúng tôi sẽ minh họa cách dùng những hàm này trong các ví dụ sau.

Việc tạo thread diễn ra khi hàm `pthread_create` được gọi. Như bạn có thể thấy, chúng ta đã truyền address của biến handle `thread` cho hàm `pthread_create` để nó được điền một handle phù hợp (hay thread ID), tham chiếu tới thread mới được tạo.

Argument thứ hai xác định các attribute của thread. Mỗi thread có một số attribute như *stack size*, *stack address* và trạng thái *detach* có thể được cấu hình trước khi sinh ra thread.

Chúng tôi cho thấy thêm ví dụ về cách cấu hình những attribute này và cách chúng ảnh hưởng đến cách các thread hoạt động. Nếu một `NULL` được truyền làm argument thứ hai, điều đó có nghĩa là thread mới nên dùng các giá trị mặc định cho các attribute của nó. Do đó, trong code trên, chúng ta đã tạo một thread có các attribute với giá trị mặc định.

Argument thứ ba được truyền cho `pthread_create` là một function pointer. Nó đang trỏ tới *companion function* của thread, vốn chứa logic của thread. Trong code trên, logic của thread được định nghĩa trong hàm `thread_body `. Do đó, address của nó nên được truyền để được gắn với biến handle `thread`.

Argument thứ tư và cuối cùng là argument input cho logic của thread, mà trong trường hợp của chúng ta là `NULL`. Điều này có nghĩa là chúng ta không muốn truyền gì cho hàm. Do đó, tham số `arg` trong<a id="_idIndexMarker1082"></a> hàm `thread_body` sẽ là `NULL` khi thread thực thi. Trong các ví dụ được đưa ra trong phần tiếp theo, chúng ta sẽ xem cách chúng ta có thể truyền một giá trị cho hàm này thay vì một `NULL`.

Mọi hàm pthread, bao gồm `pthread_create`, đều được dự định trả về không khi thực thi thành công. Do đó, nếu bất kỳ số nào khác không được trả về, thì điều đó có nghĩa là hàm đã thất bại, và một *error number* (mã lỗi) đã được trả về.

Lưu ý rằng việc tạo một thread bằng `pthread_create` không có nghĩa là logic của thread đang được thực thi ngay lập tức. Đó là vấn đề của scheduling và không thể dự đoán khi nào thread mới có được một trong các lõi CPU và bắt đầu thực thi.

Sau khi tạo thread, chúng ta join thread mới được tạo, nhưng chính xác thì điều đó có nghĩa là gì? Như chúng tôi đã giải thích trước đây, mỗi process bắt đầu với đúng một thread, đó là *main thread*. Ngoại trừ main thread, vốn có cha là process sở hữu, mọi thread khác đều có một *parent thread* (thread cha). Trong một kịch bản<a id="_idIndexMarker1083"></a> mặc định, nếu main thread kết thúc, process cũng sẽ kết thúc. Khi process bị kết thúc, mọi thread khác đang chạy hay đang ngủ cũng sẽ bị kết thúc ngay lập tức.

Vì vậy, nếu một thread mới được tạo và nó chưa bắt đầu (vì nó chưa có được CPU) và trong lúc đó, process cha bị kết thúc (vì bất kỳ lý do gì), thread sẽ chết trước cả khi thực thi instruction đầu tiên của nó. Do đó, main thread cần chờ thread thứ hai được thực thi và kết thúc bằng cách join nó.

Một thread chỉ kết thúc khi companion function của nó trả về. Trong ví dụ trên, thread được sinh ra kết thúc khi companion function `thread_body` trả về, và điều này xảy ra khi hàm trả về `NULL`. Khi thread mới được sinh ra kết thúc, main thread, vốn bị chặn phía sau lời gọi `pthread_join`, được giải phóng và có thể tiếp tục, rốt cuộc dẫn đến việc kết thúc thành công của chương trình.

Nếu main thread không join thread mới được tạo, thì khó có khả năng thread mới được sinh ra có thể được thực thi chút nào. Như chúng tôi đã giải thích trước đây, điều này xảy ra do thực tế rằng main thread thoát ngay cả trước khi thread được sinh ra đi vào giai đoạn thực thi của nó.

Chúng ta cũng nên nhớ<a id="_idIndexMarker1084"></a> rằng việc tạo một thread là không đủ để nó được thực thi. Có thể mất một lúc để thread được tạo có được quyền truy cập vào một lõi CPU, và qua đó rốt cuộc bắt đầu chạy. Nếu, trong lúc đó, process bị kết thúc, thì thread mới được tạo không có cơ hội chạy thành công.

Giờ chúng ta đã nói về thiết kế của code, *Shell Box 15-1* cho thấy output của việc chạy *ví dụ 15.1*:

```
$ gcc ExtremeC_examples_chapter15_1.c -o ex15_1.out -lpthread
$ ./ex15_1.out
Hello from first thread!
$
```

*Shell Box 15-1: Build và chạy ví dụ 15.1*

Như bạn thấy trong shell box trên, chúng ta cần thêm tùy chọn `-lpthread` vào lệnh biên dịch. Điều này được làm vì chúng ta cần link chương trình của mình với bản triển khai hiện có của library pthread. Trên một số nền tảng, như macOS, chương trình của bạn có thể được link mà không cần tùy chọn `-lpthread`; tuy nhiên, rất khuyến khích dùng tùy chọn này khi bạn đang link các chương trình dùng library pthread. Tầm quan trọng của lời khuyên này là làm cho các *build script* của bạn hoạt động trên mọi nền tảng và ngăn mọi vấn đề cross-compatibility khi build các dự án C của bạn.

Một thread mà<a id="_idIndexMarker1085"></a> có thể được join được gọi là *joinable*. Các thread mặc định là joinable. Ngược lại với các thread joinable<a id="_idIndexMarker1086"></a>, chúng ta có các thread *detached*. Detached thread không thể được join.

Trong *ví dụ 15.1*, main thread có thể detach thread mới được sinh ra thay vì join nó. Bằng cách này, chúng ta sẽ cho process biết rằng nó phải chờ detached thread kết thúc trước khi nó có thể bị kết thúc. Lưu ý rằng trong trường hợp này, main thread có thể thoát mà không làm process cha bị kết thúc.

Trong đoạn code cuối cùng của phần này, chúng ta muốn viết lại ví dụ trên dùng detached thread. Thay vì join thread mới được tạo, main thread làm cho nó detached và sau đó thoát. Bằng cách này, process vẫn tiếp tục chạy cho đến khi thread thứ hai kết thúc, mặc dù main thread đã thoát:

```
#include <stdio.h>
#include <stdlib.h>
// The POSIX standard header for using pthread library
#include <pthread.h>
// This function contains the logic which should be run
// as the body of a separate thread
void* thread_body(void* arg) {
  printf("Hello from first thread!\n");
  return NULL;
}
int main(int argc, char** argv) {
  // The thread handler
  pthread_t thread;
  // Create a new thread
  int result = pthread_create(&thread, NULL, thread_body, NULL);
  // If the thread creation did not succeed
  if (result) {
    printf("Thread could not be created. Error number: %d\n",
            result);
    exit(1);
  }
  // Detach the thread
  result = pthread_detach(thread);
  // If detaching the thread did not succeed
  if (result) {
    printf("Thread could not be detached. Error number: %d\n",
            result);
    exit(2);
  }
  // Exit the main thread
  pthread_exit(NULL);
  return 0;
}
```

*Code Box 15-2 [ExtremeC_examples_chapter15_1_2.c]: Ví dụ 15.1 sinh ra một detached thread*

Output của code trên giống hệt như code trước được viết bằng joinable thread. Khác biệt duy nhất là cách chúng ta quản lý thread mới được tạo.

Ngay sau khi tạo<a id="_idIndexMarker1087"></a> thread mới, main thread đã detach nó. Sau đó, main thread thoát. Instruction `pthread_exit(NULL)` là cần thiết để cho process biết rằng nó nên chờ các detached thread khác kết thúc. Nếu các thread không bị detach, process sẽ bị kết thúc khi main thread thoát.

> **Lưu ý**:
>
> *Detach state* là một trong các attribute <a id="_idIndexMarker1088"></a>của thread có thể được đặt trước khi tạo một thread mới để nó được detach. Đây là một phương pháp khác để tạo một detached thread mới thay vì gọi `pthread_detach` trên một joinable thread. Khác biệt là theo cách này, thread mới được tạo bị detach ngay từ đầu.

Trong phần tiếp theo, chúng tôi sẽ giới thiệu ví dụ đầu tiên minh họa một race condition. Chúng ta sẽ dùng mọi hàm được giới thiệu trong phần này để viết các ví dụ sau. Do đó, bạn sẽ có cơ hội thứ hai để xem lại chúng trong các kịch bản khác nhau.

<a id="_idParaDest-211"></a>

## Ví dụ về race condition

Với ví dụ thứ hai, chúng ta sẽ<a id="_idIndexMarker1089"></a> xem xét một kịch bản gây vấn đề hơn. *Ví dụ 15.2*, được thể hiện trong *Code Box 15-3*, cho thấy các interleaving xảy ra như thế nào và chúng ta không thể dự đoán một cách đáng tin cậy output cuối cùng của ví dụ trên thực tế như thế nào, chủ yếu vì bản chất non-deterministic của các hệ thống concurrent. Ví dụ là một chương trình tạo ba thread gần như cùng lúc, và mỗi thread in ra một chuỗi khác nhau.

Output cuối cùng của code sau chứa các chuỗi được in bởi ba thread khác nhau nhưng theo một thứ tự không thể dự đoán. Nếu invariant constraint (được giới thiệu trong chương trước) cho ví dụ sau là thấy các chuỗi theo một thứ tự cụ thể trong output, code sau sẽ thất bại trong việc thỏa mãn ràng buộc đó, chủ yếu vì các interleaving không thể dự đoán. Hãy xem code box sau:

```
#include <stdio.h>
#include <stdlib.h>
// The POSIX standard header for using pthread library
#include <pthread.h>
void* thread_body(void* arg) {
  char* str = (char*)arg;
  printf("%s\n", str);
  return NULL;
}
int main(int argc, char** argv) {
  // The thread handlers
  pthread_t thread1;
  pthread_t thread2;
  pthread_t thread3;
  // Create new threads
  int result1 = pthread_create(&thread1, NULL,
          thread_body, "Apple");
  int result2 = pthread_create(&thread2, NULL,
          thread_body, "Orange");
  int result3 = pthread_create(&thread3, NULL,
          thread_body, "Lemon");
  if (result1 || result2 || result3) {
    printf("The threads could not be created.\n");
    exit(1);
  }

  // Wait for the threads to finish
  result1 = pthread_join(thread1, NULL);
  result2 = pthread_join(thread2, NULL);
  result3 = pthread_join(thread3, NULL);
  if (result1 || result2 || result3) {
    printf("The threads could not be joined.\n");
    exit(2);
  }
  return 0;
}
```

*Code Box 15-3 [ExtremeC_examples_chapter15_2.c]: Ví dụ 15.2 in ba chuỗi khác nhau ra output*

Code chúng ta vừa xem rất giống code được viết cho *ví dụ 15.1*, nhưng nó tạo ba thread thay vì một. Trong ví dụ này, chúng ta dùng cùng một companion function cho cả ba thread.

Như bạn có thể thấy trong code trên, chúng ta đã truyền một argument thứ tư cho hàm `pthread_create`, trong khi trong <a id="_idIndexMarker1090"></a>ví dụ trước, *15.1*, nó là `NULL`. Những argument này sẽ có thể được thread truy cập thông qua tham số generic pointer `arg` trong companion function `thread_body`.

Bên trong hàm `thread_body`, thread cast generic pointer `arg` sang một pointer `char*` và in chuỗi bắt đầu tại address đó bằng hàm `printf`. Đây là cách chúng ta có thể truyền argument cho các thread. Tương tự, không quan trọng chúng lớn đến đâu vì chúng ta chỉ đang truyền một pointer.

Nếu bạn có nhiều giá trị cần được gửi cho một thread khi tạo nó, bạn có thể dùng một structure để chứa những giá trị đó và truyền một pointer tới một biến structure được điền các giá trị mong muốn. Chúng tôi sẽ minh họa cách làm điều này trong chương tiếp theo, *Thread Synchronization*.

> **Lưu ý**:
>
> Việc chúng ta có thể truyền một pointer cho một thread ngụ ý rằng các thread mới nên có quyền truy cập vào cùng vùng memory mà main thread có quyền truy cập. Tuy nhiên, quyền truy cập không bị giới hạn ở một segment hay vùng cụ thể trong memory của process sở hữu và mọi thread đều có quyền truy cập đầy đủ vào các segment Stack, Heap, Text và Data trong một process.

Nếu bạn lấy *ví dụ 15.2* và chạy nó nhiều lần, bạn sẽ thấy rằng thứ tự của các chuỗi được in ra có thể khác nhau, vì mỗi lần chạy được kỳ vọng in ra cùng các chuỗi nhưng theo một thứ tự khác nhau.

*Shell Box 15-2* cho thấy việc biên dịch và output của *ví dụ 15.2* sau ba lần chạy liên tiếp:

```
$ gcc ExtremeC_examples_chapter15_2.c -o ex15_2.out -lpthread
$ ./ex15_2.out
Apple
Orange
Lemon
$ ./ex15_2.out
Orange
Apple
Lemon
$ ./ex15_2.out
Apple
Orange
Lemon
$
```

*Shell Box 15-2: Chạy ví dụ 15.2 ba lần để quan sát race condition hiện có và các interleaving khác nhau*

Rất dễ tạo ra các interleaving trong đó thread thứ nhất và thứ hai in chuỗi của chúng trước thread thứ ba, nhưng sẽ khó tạo ra một interleaving trong đó thread thứ ba <a id="_idIndexMarker1091"></a>in chuỗi của nó, `Lemon`, như chuỗi thứ nhất hay thứ hai trong output. Tuy nhiên, điều này chắc chắn sẽ xảy ra, dù với một xác suất thấp. Bạn có thể cần chạy ví dụ nhiều lần hơn nữa để tạo ra interleaving đó. Điều này có thể đòi hỏi chút kiên nhẫn.

Code trên cũng được nói là không thread safe. Đây là một định nghĩa quan trọng; một chương trình multithreaded là thread safe nếu, và chỉ nếu, nó không có race condition nào theo các invariant constraint đã định nghĩa. Do đó, vì code trên có một race condition, nó không thread safe. Công việc của chúng ta sẽ là làm cho code trên thread safe thông qua việc dùng các cơ chế kiểm soát phù hợp sẽ được giới thiệu trong chương tiếp theo.

Như bạn thấy trong output của ví dụ trên, chúng ta không có interleaving nào giữa các ký tự của `Apple` hay `Orange`. Ví dụ, chúng ta không thấy output sau:

```
$ ./ex15_2.out
AppOrle
Ange
Lemon
$
```

*Shell Box 15-3: Một output tưởng tượng không xảy ra với ví dụ trên*

Điều này cho thấy một thực tế rằng hàm `printf` là *thread safe* và nó đơn giản có nghĩa là bất kể các interleaving xảy ra như thế nào, khi một trong các thread đang ở giữa việc in một chuỗi, các instance `printf` trong các thread khác không in gì cả.

Ngoài ra, trong code trên, companion function `thread_body` đã được chạy ba lần trong ngữ cảnh của ba thread khác nhau. Trong các chương trước và trước khi đưa ra các ví dụ multithreaded, mọi hàm đều được thực thi trong ngữ cảnh của main thread. Từ giờ trở đi, mọi lời gọi hàm đều xảy ra trong ngữ cảnh của một thread cụ thể (không nhất thiết là main thread).

Không thể có chuyện hai thread khởi tạo một lời gọi hàm duy nhất. Lý do là hiển nhiên vì mỗi lời gọi hàm cần<a id="_idIndexMarker1092"></a> tạo một *stack frame* nên được đặt lên đỉnh Stack của chỉ một thread, và hai thread khác nhau có hai vùng Stack khác nhau. Do đó, một lời gọi hàm chỉ có thể được khởi tạo bởi chỉ một thread. Nói cách khác, hai thread có thể gọi cùng một hàm một cách riêng rẽ và điều đó dẫn đến hai lời gọi hàm riêng biệt, nhưng chúng không thể chia sẻ cùng một lời gọi hàm.

Chúng ta nên lưu ý rằng <a id="_idIndexMarker1093"></a>pointer được truyền cho một thread không nên là một *dangling pointer*. Nó gây ra <a id="_idIndexMarker1094"></a>một số vấn đề memory nghiêm trọng khó lần theo. Để nhắc lại, một dangling pointer trỏ tới một address trong memory nơi không có biến nào được cấp phát. Cụ thể hơn, đây là trường hợp mà vào một thời điểm nào đó; có thể đã có một biến hay một mảng ở đó ban đầu, nhưng vào thời điểm pointer sắp được dùng, nó đã được giải phóng.

Trong code trên, chúng ta đã truyền ba literal cho mỗi thread. Vì memory cần cho những string literal này được cấp phát từ segment Data chứ không phải từ các segment Heap hay Stack, address của chúng không bao giờ bị giải phóng và các pointer `arg` sẽ không trở thành dangling.

Sẽ dễ dàng viết code trên theo cách mà các pointer trở thành dangling. Sau đây là cùng code nhưng với dangling pointer, và bạn sẽ thấy ngay sau đây rằng nó dẫn đến các hành vi memory tồi tệ:

```
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
// The POSIX standard header for using pthread library
#include <pthread.h>
void* thread_body(void* arg) {
  char* str = (char*)arg;
  printf("%s\n", str);
  return NULL;
}
int main(int argc, char** argv) {
  // The thread handlers
  pthread_t thread1;
  pthread_t thread2;
  pthread_t thread3;
  char str1[8], str2[8], str3[8];
  strcpy(str1, "Apple");
  strcpy(str2, "Orange");
  strcpy(str3, "Lemon");
  // Create new threads
  int result1 = pthread_create(&thread1, NULL, thread_body, str1);
  int result2 = pthread_create(&thread2, NULL, thread_body, str2);
  int result3 = pthread_create(&thread3, NULL, thread_body, str3);
  if (result1 || result2 || result3) {
    printf("The threads could not be created.\n");
    exit(1);
  }
  // Detach the threads
  result1 = pthread_detach(thread1);
  result2 = pthread_detach(thread2);
  result3 = pthread_detach(thread3);
  if (result1 || result2 || result3) {
    printf("The threads could not be detached.\n");
    exit(2);
  }
  // Now, the strings become deallocated.
  pthread_exit(NULL);
  return 0;
}
```

*Code Box 15-4 [ExtremeC_examples_chapter15_2_1.c]: Ví dụ 15.2 với các literal được cấp phát từ vùng Stack của main thread*

Code trên gần giống code được đưa ra trong *ví dụ 15.2*, nhưng với hai khác biệt.

Thứ nhất, các pointer được truyền cho các thread không trỏ tới các string literal nằm trong segment Data, thay vào đó chúng trỏ tới các mảng ký tự được cấp phát từ vùng Stack của main thread. Trong hàm `main`, những mảng này đã được khai báo và trong các dòng tiếp theo, chúng đã được điền bằng một số string literal.

Chúng ta cần nhớ rằng các string literal vẫn nằm trong segment Data, nhưng các mảng đã khai báo giờ có cùng giá trị như các string literal sau khi được điền bằng hàm `strcpy`.

Khác biệt thứ hai<a id="_idIndexMarker1095"></a> là về cách main thread hoạt động. Trong code trước, nó đã join các thread, nhưng trong code này, nó detach các thread và thoát ngay lập tức. Điều này sẽ giải phóng các mảng được khai báo trên đỉnh Stack của main thread, và trong một số interleaving các thread khác có thể cố đọc những vùng đã giải phóng đó. Do đó, trong một số interleaving, các pointer được truyền cho các thread có thể trở thành dangling.

> **Lưu ý**:
>
> Một số ràng buộc, như không có crash, không có dangling pointer, và nói chung không có vấn đề memory-related nào, luôn có thể được coi là một phần của các invariant constraint cho một chương trình. Do đó, một hệ thống concurrent gây ra một vấn đề dangling pointer trong một số interleaving chắc chắn đang mắc phải một race condition nghiêm trọng.

Để có thể phát hiện các dangling pointer, bạn<a id="_idIndexMarker1096"></a> cần dùng một *memory profiler*. Như một cách tiếp cận đơn giản hơn, bạn có thể chạy chương trình nhiều lần và chờ một crash xảy ra. Tuy nhiên, không phải lúc nào bạn cũng đủ may mắn để có thể thấy điều đó và chúng ta cũng không may mắn thấy crash trong ví dụ này.

Để phát hiện hành vi memory tồi tệ trong ví dụ này, chúng ta sẽ dùng `valgrind`. Bạn nhớ rằng chúng tôi đã giới thiệu memory profiler này trong *Chương 4*, *Cấu trúc memory của process (Process Memory Structure)*, và *Chương 5*, *Stack và Heap*, để tìm *memory leak*. Quay lại ví dụ này, chúng ta muốn dùng nó để tìm những chỗ đã xảy ra truy cập memory tồi tệ.

Đáng nhớ rằng việc dùng một dangling pointer, và truy cập nội dung của nó, sẽ không nhất thiết dẫn đến crash. Điều này đặc biệt đúng trong code trên, trong đó các chuỗi được đặt trên đỉnh Stack của main thread.

Trong khi các thread khác đang chạy, segment Stack vẫn giữ nguyên như khi main thread thoát, do đó bạn có thể truy cập các chuỗi dù các mảng `str1`, `str2` và `str3` đã được giải phóng khi rời hàm `main`. Nói cách khác, trong C hay C++, môi trường runtime không kiểm tra xem một pointer có dangling hay không, nó chỉ tuân theo chuỗi câu lệnh.

Nếu một pointer bị dangling và memory bên dưới của nó bị thay đổi, thì những điều tồi tệ như crash hay lỗi logic có thể xảy ra nhưng chừng nào memory bên dưới vẫn *chưa bị động đến* thì việc dùng các dangling pointer có thể không dẫn đến crash, và điều này rất nguy hiểm và khó lần theo.

Tóm lại, chỉ vì bạn có thể truy cập một vùng memory thông qua một dangling pointer, điều đó không có nghĩa là bạn được phép truy cập vùng đó. Đây là lý do tại sao chúng ta cần dùng một memory profiler như `valgrind` sẽ báo cáo về những truy cập memory không hợp lệ này.

Trong shell box<a id="_idIndexMarker1097"></a> sau, chúng ta biên dịch chương trình và chạy nó với `valgrind` hai lần. Trong lần chạy thứ nhất, không có gì tồi tệ xảy ra nhưng trong lần chạy thứ hai, `valgrind` báo cáo một truy cập memory tồi tệ.

*Shell Box 15-4* cho thấy lần chạy thứ nhất:

```
$ gcc -g ExtremeC_examples_chapter15_2_1.c -o ex15_2_1.out -lpthread
$ valgrind ./ex15_2_1.out
==1842== Memcheck, a memory error detector
==1842== Copyright (C) 2002-2017, and GNU GPL'd, by Julian Seward et al.
==1842== Using Valgrind-3.13.0 and LibVEX; rerun with -h for copyright info
==1842== Command: ./ex15_2_1.out
==1842==
Orange
Apple
Lemon
==1842==
==1842== HEAP SUMMARY:
==1842==     in use at exit: 0 bytes in 0 blocks
==1842==   total heap usage: 9 allocs, 9 frees, 3,534 bytes allocated
==1842==
==1842== All heap blocks were freed -- no leaks are possible
==1842==
==1842== For counts of detected and suppressed errors, rerun with: -v
==1842== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
$
```

*Shell Box 15-4: Chạy ví dụ 15.2 với valgrind lần thứ nhất*

Trong lần chạy thứ hai, `valgrind` báo cáo một số vấn đề truy cập memory (lưu ý rằng output đầy đủ sẽ <a id="_idIndexMarker1098"></a>xem được khi bạn chạy nó, nhưng vì lý do độ dài, chúng tôi đã rút gọn nó.):

```
$ valgrind ./ex15_2_1.out
==1854== Memcheck, a memory error detector
==1854== Copyright (C) 2002-2017, and GNU GPL'd, by Julian Seward et al.
==1854== Using Valgrind-3.13.0 and LibVEX; rerun with -h for copyright info
==1854== Command: ./ex15_2_1.out
==1854==
Apple
Lemon
==1854== Thread 4:
==1854== Conditional jump or move depends on uninitialised value(s)
==1854==    at 0x50E6A65: _IO_file_xsputn@@GLIBC_2.2.5 (fileops.c:1241)
==1854==    by 0x50DBA8E: puts (ioputs.c:40)
==1854==    by 0x1087C9: thread_body (ExtremeC_examples_chapter15_2_1.c:17)
==1854==    by 0x4E436DA: start_thread (pthread_create.c:463)
==1854==    by 0x517C88E: clone (clone.S:95)
==1854==
...
==1854==
==1854== Syscall param write(buf) points to uninitialised byte(s)
==1854==    at 0x516B187: write (write.c:27)
==1854==    by 0x50E61BC: _IO_file_write@@GLIBC_2.2.5 (fileops.c:1203)
==1854==    by 0x50E7F50: new_do_write (fileops.c:457)
==1854==    by 0x50E7F50: _IO_do_write@@GLIBC_2.2.5 (fileops.c:433)
==1854==    by 0x50E8402: _IO_file_overflow@@GLIBC_2.2.5 (fileops.c:798)
==1854==    by 0x50DBB61: puts (ioputs.c:41)
==1854==    by 0x1087C9: thread_body (ExtremeC_examples_chapter15_2_1.c:17)
==1854==    by 0x4E436DA: start_thread (pthread_create.c:463)
==1854==    by 0x517C88E: clone (clone.S:95)
...
==1854==
Orange
==1854==
==1854== HEAP SUMMARY:
==1854==     in use at exit: 272 bytes in 1 blocks
==1854==   total heap usage: 9 allocs, 8 frees, 3,534 bytes allocated
==1854==
==1854== LEAK SUMMARY:
==1854==    definitely lost: 0 bytes in 0 blocks
==1854==    indirectly lost: 0 bytes in 0 blocks
==1854==      possibly lost: 272 bytes in 1 blocks
==1854==    still reachable: 0 bytes in 0 blocks
==1854==         suppressed: 0 bytes in 0 blocks
==1854== Rerun with --leak-check=full to see details of leaked memory
==1854==
==1854== For counts of detected and suppressed errors, rerun with: -v
==1854== Use --track-origins=yes to see where uninitialised values come from
==1854== ERROR SUMMARY: 13 errors from 3 contexts (suppressed: 0 from 0)
$
```

*Shell Box 15-5: Chạy ví dụ 15.2 với valgrind lần thứ hai*

Như bạn có thể thấy, lần chạy thứ nhất diễn ra tốt đẹp, không có vấn đề truy cập memory nào, dù race condition đã nêu vẫn rõ ràng với chúng ta. Tuy nhiên, trong lần chạy thứ hai, có điều gì đó sai khi một trong các thread cố truy cập chuỗi `Orange` được trỏ tới bởi `str2`.

Điều này có nghĩa là<a id="_idIndexMarker1099"></a> pointer được truyền cho thread thứ hai đã trở thành dangling. Trong output trên, bạn có thể thấy rõ rằng stack trace trỏ tới dòng bên trong hàm `thread_body` nơi có câu lệnh `printf`. Lưu ý rằng stack trace thực ra tham chiếu tới hàm `puts` vì compiler C của chúng ta đã thay câu lệnh `printf` bằng câu lệnh `puts` tương đương. Output trên cũng cho thấy rằng system call `write` đang dùng một pointer tên là `buf` trỏ tới một vùng memory *chưa được khởi tạo hay cấp phát*.

Nhìn vào ví dụ trên, `valgrind` không kết luận một pointer có dangling hay không. Nó chỉ đơn giản báo cáo truy cập memory không hợp lệ.

Trước các thông báo lỗi<a id="_idIndexMarker1100"></a> về truy cập memory tồi tệ, bạn có thể thấy rằng chuỗi `Orange` được in ra dù việc truy cập để đọc nó là không hợp lệ. Điều này chỉ cho thấy mọi thứ có thể trở nên phức tạp dễ dàng như thế nào khi chúng ta có code chạy theo kiểu concurrent.

Trong phần này, chúng ta đã thực hiện một bước tiến đáng kể trong việc thấy việc viết code không thread safe dễ dàng như thế nào. Tiếp theo, giờ chúng ta sẽ minh họa một ví dụ thú vị khác tạo ra một data race. Ở đây, chúng ta sẽ thấy một cách dùng phức tạp hơn của library pthread và các hàm khác nhau của nó.

<a id="_idParaDest-212"></a>

## Ví dụ về data race

*Ví dụ 15.3* minh họa một <a id="_idIndexMarker1101"></a>data race. Trong các ví dụ trước, chúng ta không có shared state nào, nhưng trong ví dụ này, chúng ta sẽ có một biến được chia sẻ giữa hai thread.

Invariant constraint của ví dụ này là bảo vệ *data integrity* của shared state, cộng với mọi ràng buộc hiển nhiên khác, như không có crash, không có truy cập memory tồi tệ, v.v. Nói cách khác, không quan trọng output xuất hiện như thế nào, nhưng một thread không được ghi giá trị mới trong khi giá trị của biến dùng chung đã bị thread kia thay đổi và thread ghi không biết giá trị mới nhất. Đây là ý của chúng tôi khi nói "data integrity":

```
#include <stdio.h>
#include <stdlib.h>
// The POSIX standard header for using pthread library
#include <pthread.h>
void* thread_body_1(void* arg) {
  // Obtain a pointer to the shared variable
  int* shared_var_ptr = (int*)arg;
  // Increment the shared variable by 1 by writing
  // directly to its memory address
  (*shared_var_ptr)++;
  printf("%d\n", *shared_var_ptr);
  return NULL;
}
void* thread_body_2(void* arg) {
  // Obtain a pointer to the shared variable
  int* shared_var_ptr = (int*)arg;
  // Increment the shared variable by 2 by writing
  // directly to its memory address
  *shared_var_ptr += 2;
  printf("%d\n", *shared_var_ptr);
  return NULL;
}
int main(int argc, char** argv) {
  // The shared variable
  int shared_var = 0;
  // The thread handlers
  pthread_t thread1;
  pthread_t thread2;
  // Create new threads
  int result1 = pthread_create(&thread1, NULL,
          thread_body_1, &shared_var);
  int result2 = pthread_create(&thread2, NULL,
          thread_body_2, &shared_var);
  if (result1 || result2) {
    printf("The threads could not be created.\n");
    exit(1);
  }
  // Wait for the threads to finish
  result1 = pthread_join(thread1, NULL);
  result2 = pthread_join(thread2, NULL);
  if (result1 || result2) {
    printf("The threads could not be joined.\n");
    exit(2);
  }
  return 0;
}
```

*Code Box 15-5 [ExtremeC_examples_chapter15_3.c]: Ví dụ 15.3 với hai thread thao tác trên một biến dùng chung duy nhất*

Shared state đã được khai báo ở dòng đầu tiên trong hàm `main`. Trong ví dụ này, chúng ta đang làm việc với một biến số nguyên duy nhất được cấp phát từ vùng Stack của main thread, nhưng trong các ứng dụng thật nó có thể phức tạp hơn nhiều. Giá trị ban đầu của biến số nguyên là không, và mỗi thread góp phần trực tiếp vào việc tăng giá trị của nó bằng cách ghi vào vị trí memory của nó.

Trong ví dụ này, không có<a id="_idIndexMarker1102"></a> biến local nào giữ một bản sao giá trị của biến dùng chung trong mỗi thread. Tuy nhiên, bạn nên cẩn thận với các thao tác tăng trong các thread vì chúng không phải là các thao tác *atomic*, và do đó có thể trải qua các interleaving khác nhau. Chúng tôi đã giải thích điều này kỹ lưỡng trong chương trước.

Mỗi thread có thể thay đổi giá trị của biến dùng chung bằng cách dùng pointer mà nó nhận được bên trong companion function của nó thông qua argument `arg`. Như bạn có thể thấy trong cả hai lời gọi tới `pthread_create`, chúng ta đang truyền address của biến `shared_var` làm argument thứ tư.

Đáng lưu ý rằng pointer không bao giờ trở thành dangling trong các thread vì main thread không thoát, và nó chờ các thread kết thúc bằng cách join chúng.

*Shell Box 15-6* cho chúng ta thấy output của nhiều lần chạy code trên để tạo ra các interleaving khác nhau. Hãy nhớ rằng chúng ta muốn data integrity được bảo toàn cho biến dùng chung `shared_var`.

Vì vậy, dựa trên logic được định nghĩa trong `thread_body_1` và `thread_body_2`, chúng ta chỉ có thể có `1 3` và `2 3` là các output chấp nhận được:

```
$ gcc ExtremeC_examples_chapter15_3.c -o ex15_3.out -lpthread
$ ./ex15_3.out
1
3
$
...
...
...
$ ./ex15_3.out
3
1
$
...
...
...
$ ./ex15_3.out
1
2
$
```

*Shell Box 15-6: Nhiều lần chạy ví dụ 15.3, trong đó cuối cùng chúng ta thấy rằng data integrity của biến dùng chung không được bảo toàn*

Như bạn có thể thấy, lần chạy cuối cùng cho thấy rằng điều kiện data integrity đã không được đáp ứng cho biến dùng chung.

Trong lần chạy cuối cùng, thread thứ nhất, thread có `thread_body_1` làm companion function, đã đọc giá trị của biến dùng chung và nó là `0`.

Thread thứ hai, thread có `thread_body_2` làm companion function, cũng đã đọc giá trị dùng chung và nó là `0`. Sau điểm này, cả hai thread đều cố tăng giá trị của biến dùng chung và<a id="_idIndexMarker1103"></a> in nó ra ngay lập tức. Đây là một sự vi phạm data integrity vì khi một thread đang thao tác một shared state, thread kia không nên có thể ghi vào nó.

Như chúng tôi đã giải thích trước đây, chúng ta có một data race rõ ràng trên `shared_var` trong ví dụ này.

> **Lưu ý**:
>
> Khi tự thực thi *ví dụ 15.3*, hãy kiên nhẫn và chờ thấy output `1 2`. Nó có thể xảy ra sau khi chạy executable 100 lần! Tôi đã có thể quan sát data race trên cả macOS và Linux.

Để giải quyết data race trên, chúng ta cần dùng một cơ chế kiểm soát, như một semaphore hay một mutex, để đồng bộ hóa việc truy cập vào biến dùng chung. Trong chương tiếp theo, chúng tôi sẽ đưa một mutex vào code trên để làm điều đó cho chúng ta.

<a id="_idParaDest-213"></a>

## Tóm tắt

Chương này là bước đầu tiên của chúng ta hướng tới việc viết các chương trình multithreaded trong C dùng library POSIX threading. Trong chương này:

- Chúng ta đã đi qua những điều cơ bản của library POSIX threading, vốn là công cụ chính để viết các ứng dụng multithreaded trong các hệ thống POSIX-compliant.
- Chúng ta đã khám phá các thuộc tính khác nhau của thread và cấu trúc memory của chúng.
- Chúng tôi đã đưa ra một số hiểu biết về các cơ chế có sẵn để các thread giao tiếp và chia sẻ một state.
- Chúng tôi đã giải thích rằng các vùng memory có sẵn cho mọi thread bên trong cùng một process là cách tốt nhất để chia sẻ dữ liệu và giao tiếp.
- Chúng ta đã nói về các kernel thread và các user-level thread và chúng khác nhau như thế nào.
- Chúng tôi đã giải thích các joinable thread và detached thread và chúng khác nhau như thế nào từ góc nhìn thực thi.
- Chúng tôi đã minh họa cách dùng các hàm `pthread_create` và `pthread_join` và những argument mà chúng nhận.
- Các ví dụ về một race condition và một data race đã được minh họa bằng code C thực tế, và bạn đã thấy việc dùng dangling pointer có thể gây ra các vấn đề memory nghiêm trọng như thế nào và rốt cuộc một crash hay một lỗi logic có thể xảy ra.

Trong chương tiếp theo, chúng ta sẽ tiếp tục và phát triển thảo luận về multithreading bằng việc xem xét các vấn đề concurrency-related và các cơ chế có sẵn để vừa ngăn ngừa vừa giải quyết chúng.
