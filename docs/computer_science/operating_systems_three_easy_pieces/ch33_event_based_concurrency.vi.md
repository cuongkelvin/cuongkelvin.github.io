# 33 Event-based Concurrency (Nâng cao)

Đến đây, chúng ta đã viết về concurrency như thể cách duy nhất để xây dựng concurrent application là dùng thread. Giống nhiều điều trong cuộc sống, điều này không hoàn toàn đúng. Cụ thể, một phong cách concurrent programming khác thường được dùng trong cả GUI-based application [O96] lẫn một số loại internet server [PDZ99]. Phong cách này, gọi là event-based concurrency, đã trở nên phổ biến trong một số hệ thống hiện đại, bao gồm server-side framework như node.js [N13], nhưng có nguồn gốc từ những hệ thống C/UNIX mà chúng ta sẽ bàn dưới đây.

Vấn đề mà event-based concurrency giải quyết mang tính two-fold. Thứ nhất, việc quản lý concurrency đúng đắn trong multi-threaded application có thể rất khó; như đã thảo luận, có thể xảy ra thiếu lock, deadlock và những vấn đề khó chịu khác. Thứ hai, trong multi-threaded application, người phát triển có rất ít hoặc không có quyền kiểm soát công việc nào được schedule tại một thời điểm nhất định; thay vào đó, lập trình viên chỉ tạo thread rồi hy vọng OS bên dưới schedule chúng hợp lý trên các CPU sẵn có. Vì việc xây dựng một general-purpose scheduler hoạt động tốt trong mọi trường hợp với mọi workload rất khó, đôi khi OS schedule công việc theo cách chưa tối ưu. Mấu chốt:

> MẤU CHỐT:
>
> LÀM THẾ NÀO XÂY DỰNG CONCURRENT SERVER KHÔNG DÙNG THREAD
>
> Làm sao xây dựng concurrent server không dùng thread, từ đó giữ quyền kiểm soát concurrency cũng như tránh một số vấn đề dường như thường gây phiền toái cho multi-threaded application?

## 33.1 Ý tưởng cơ bản: Event Loop

Cách tiếp cận cơ bản chúng ta dùng, như đã nói ở trên, gọi là event-based concurrency. Cách này rất đơn giản: chỉ cần chờ một điều gì đó (tức một “event”) xảy ra; khi nó xảy ra, kiểm tra loại event rồi thực hiện lượng công việc nhỏ mà nó yêu cầu (có thể bao gồm phát I/O request, hoặc schedule event khác để xử lý sau này, v.v.). Chỉ vậy thôi!

Trước khi đi vào chi tiết, hãy xem một event-based server điển hình trông như thế nào. Những ứng dụng này được xây dựng quanh một cấu trúc đơn giản gọi là event loop. Pseudocode của event loop như sau:

```
while (1) {
    events = getEvents();
    for (e in events)
        processEvent(e);
}
```

Thực sự chỉ đơn giản vậy thôi. Vòng lặp chính chỉ chờ công việc cần làm (bằng cách gọi getEvents() trong code trên), rồi xử lý lần lượt từng event được trả về; code xử lý mỗi event được gọi là event handler. Điều quan trọng là khi handler xử lý một event, đó là hoạt động duy nhất đang diễn ra trong hệ thống; vì vậy, quyết định xử lý event nào tiếp theo tương đương với scheduling. Quyền kiểm soát scheduling tường minh này là một trong những ưu điểm cơ bản của cách tiếp cận event-based.

Nhưng phần thảo luận này để lại một câu hỏi lớn hơn: chính xác thì event-based server xác định event nào đang diễn ra bằng cách nào, đặc biệt với network và disk I/O? Cụ thể, làm sao event server biết một message đã đến cho nó?

## 33.2 Một API quan trọng: select() (hoặc poll())

Với event loop cơ bản đó trong đầu, tiếp theo chúng ta phải giải quyết câu hỏi nhận event như thế nào. Trong hầu hết hệ thống, một API cơ bản được cung cấp qua system call select() hoặc poll().

Điều những interface này cho phép chương trình làm rất đơn giản: kiểm tra có I/O đến nào cần được xử lý hay không. Ví dụ, hãy tưởng tượng một network application (như web server) muốn kiểm tra có network packet nào đến chưa để phục vụ chúng. Những system call này cho phép bạn làm đúng điều đó.

Lấy select() làm ví dụ. Manual page (trên Mac OS X) mô tả API như sau:

```
int select(int nfds,
           fd_set *restrict readfds,
           fd_set *restrict writefds,
           fd_set *restrict errorfds,
           struct timeval *restrict timeout);
```

Mô tả thực tế từ man page: select() kiểm tra các tập I/O descriptor có địa chỉ được truyền vào readfds, writefds và errorfds để lần lượt xem có descriptor nào sẵn sàng đọc, sẵn sàng ghi hoặc có điều kiện ngoại lệ đang chờ hay không. nfds descriptor đầu tiên được kiểm tra trong mỗi tập, tức các descriptor từ 0 đến nfds-1 trong các tập descriptor được xem xét. Khi trả về, select() thay các tập descriptor đã cho bằng các tập con gồm những descriptor sẵn sàng cho thao tác được yêu cầu. select() trả về tổng số descriptor sẵn sàng trong mọi tập.

> BỔ SUNG: BLOCKING VÀ NON-BLOCKING INTERFACE
>
> Blocking (hoặc synchronous) interface hoàn thành toàn bộ công việc trước khi trả về cho caller; non-blocking (hoặc asynchronous) interface bắt đầu một công việc nhưng trả về ngay, nhờ đó công việc cần làm có thể tiếp tục được thực hiện ở background.
>
> Thủ phạm thường gặp trong blocking call là một dạng I/O nào đó. Chẳng hạn, nếu lời gọi phải đọc disk mới hoàn tất, nó có thể block, chờ I/O request đã gửi tới disk trả về.
>
> Non-blocking interface có thể được dùng trong bất kỳ phong cách lập trình nào (ví dụ với thread), nhưng là thiết yếu trong cách tiếp cận event-based, vì một lời gọi block sẽ làm mọi hoạt động tiến triển dừng lại.

Có vài điểm về select(). Trước tiên, lưu ý rằng nó cho phép kiểm tra descriptor có thể đọc cũng như có thể ghi hay không; trường hợp đầu giúp server xác định một packet mới đã đến và cần xử lý, còn trường hợp sau giúp service biết khi nào có thể trả lời (tức outbound queue chưa đầy).

Thứ hai, lưu ý argument timeout. Một cách dùng phổ biến là đặt timeout thành NULL, khiến select() block vô thời hạn cho đến khi một descriptor sẵn sàng. Tuy nhiên, server vững chắc hơn thường chỉ định một loại timeout nào đó; kỹ thuật phổ biến là đặt timeout bằng không, nhờ đó lời gọi select() trả về ngay lập tức.

System call poll() khá tương tự. Xem manual page của nó, hoặc Stevens và Rago [SR05], để biết chi tiết.

Dù theo cách nào, các primitive cơ bản này cho chúng ta cách xây dựng non-blocking event loop: chỉ kiểm tra packet đến, đọc từ socket có message và trả lời khi cần.

## 33.3 Sử dụng select()

Để cụ thể hơn, hãy xem cách dùng select() nhằm biết network descriptor nào có message đến. Hình 33.1 minh họa một ví dụ đơn giản.

Code này thực ra khá dễ hiểu. Sau một số bước khởi tạo, server đi vào vòng lặp vô hạn. Trong vòng lặp, nó dùng macro FD_ZERO() để xóa tập file descriptor trước, rồi dùng FD_SET() để đưa toàn bộ file descriptor từ minFD tới maxFD vào tập. Chẳng hạn, tập descriptor này có thể đại diện cho mọi network socket mà server đang theo dõi. Cuối cùng, server gọi select() để xem connection nào có dữ liệu sẵn có. Sau đó dùng FD_ISSET() trong một vòng lặp, event server có thể biết descriptor nào có dữ liệu sẵn sàng và xử lý dữ liệu đến.

```
 1   #include <stdio.h>
 2   #include <stdlib.h>
 3   #include <sys/time.h>
 4   #include <sys/types.h>
 5   #include <unistd.h>
 6
 7   int main(void) {
 8       // open and set up a bunch of sockets (not shown)
 9       // main loop
10       while (1) {
11           // initialize the fd_set to all zero
12           fd_set readFDs;
13           FD_ZERO(&readFDs);
14
15           // now set the bits for the descriptors
16           // this server is interested in
17           // (for simplicity, all of them from min to max)
18           int fd;
19           for (fd = minFD; fd < maxFD; fd++)
20               FD_SET(fd, &readFDs);
21
22           // do the select
23           int rc = select(maxFD+1, &readFDs, NULL, NULL, NULL);
24
25           // check which actually have data using FD_ISSET()
26           int fd;
27           for (fd = minFD; fd < maxFD; fd++)
28               if (FD_ISSET(fd, &readFDs))
29                   processFD(fd);
30       }
31   }
```

Hình 33.1: Code đơn giản sử dụng select()

Dĩ nhiên, server thực sẽ phức tạp hơn và cần logic cho việc gửi message, phát disk I/O và nhiều chi tiết khác. Để tìm hiểu thêm, xem Stevens và Rago [SR05] về API, hoặc Pai và cộng sự hay Welsh và cộng sự để có cái nhìn tổng quan tốt về luồng hoạt động chung của event-based server [PDZ99, WCB01].

## 33.4 Vì sao đơn giản hơn? Không cần Lock

Với một CPU và một event-based application, những vấn đề trong concurrent program không còn hiện diện. Cụ thể, vì chỉ một event được xử lý tại một thời điểm, không cần acquire hay release lock; event-based server không thể bị thread khác ngắt vì rõ ràng nó chỉ có một thread. Do đó, concurrency bug thường gặp trong chương trình dùng thread không xuất hiện ở cách tiếp cận event-based cơ bản.

> MẸO: ĐỪNG BLOCK TRONG EVENT-BASED SERVER
>
> Event-based server cho phép kiểm soát fine-grained việc scheduling task. Tuy nhiên, để duy trì quyền kiểm soát đó, tuyệt đối không được thực hiện lời gọi làm block quá trình thực thi của caller; không tuân theo mẹo thiết kế này sẽ dẫn tới event-based server bị block, client bực bội và những câu hỏi nghiêm túc về việc liệu bạn có từng đọc phần này của cuốn sách hay không.

## 33.5 Một vấn đề: Blocking System Call

Đến đây, event-based programming nghe rất tuyệt, phải không? Bạn lập trình một vòng lặp đơn giản và xử lý event khi chúng xuất hiện. Thậm chí không cần nghĩ về locking! Nhưng có một vấn đề: nếu event yêu cầu bạn thực hiện system call có thể block thì sao?

Ví dụ, hãy tưởng tượng request từ client đến server yêu cầu đọc file từ disk và trả nội dung cho client đó (khá giống HTTP request đơn giản). Để phục vụ request như vậy, cuối cùng một event handler phải thực hiện system call open() để mở file, tiếp theo là một loạt lời gọi read() để đọc file. Khi file được đọc vào memory, server có thể bắt đầu gửi kết quả cho client.

Cả open() lẫn read() đều có thể phát I/O request tới storage system (khi metadata hoặc dữ liệu cần thiết chưa nằm trong memory), vì vậy có thể mất nhiều thời gian phục vụ. Với thread-based server, đây không phải vấn đề: trong khi thread phát I/O request tạm dừng (chờ I/O hoàn tất), các thread khác có thể chạy, cho phép server tiếp tục tiến triển. Thực sự, sự chồng lấp tự nhiên giữa I/O và tính toán khác này khiến thread-based programming khá tự nhiên và dễ hiểu.

Tuy nhiên, với cách tiếp cận event-based, không có thread khác để chạy: chỉ có event loop chính. Điều này hàm ý rằng nếu event handler thực hiện một lời gọi block, toàn bộ server cũng sẽ làm đúng như vậy: block cho đến khi lời gọi hoàn tất. Khi event loop block, hệ thống nằm nhàn rỗi, do đó có khả năng lãng phí tài nguyên rất lớn. Vì vậy, chúng ta có một quy tắc phải tuân theo trong event-based system: không được phép có blocking call.

## 33.6 Một lời giải: Asynchronous I/O

Để vượt qua giới hạn này, nhiều operating system hiện đại đã đưa vào những cách mới để phát I/O request tới disk system, gọi chung là asynchronous I/O. Những interface này cho phép ứng dụng phát I/O request rồi trả quyền điều khiển ngay cho caller trước khi I/O hoàn tất; các interface bổ sung cho phép ứng dụng xác định những I/O khác nhau đã hoàn tất hay chưa.

Ví dụ, hãy xem interface được cung cấp trên Mac OS X (các hệ thống khác có API tương tự). Các API xoay quanh một structure cơ bản, struct aiocb, hay AIO control block theo thuật ngữ thông dụng. Phiên bản đơn giản hóa của structure như sau (xem manual page để biết thêm):

```
struct aiocb {
    int             aio_fildes;          /* File descriptor */
    off_t           aio_offset;          /* File offset */
    volatile void   *aio_buf;            /* Location of buffer */
    size_t          aio_nbytes;          /* Length of transfer */
};
```

Để phát asynchronous read tới file, ứng dụng trước tiên phải điền thông tin thích hợp vào structure này: file descriptor của file cần đọc (aio_fildes), offset trong file (aio_offset) cùng độ dài request (aio_nbytes), và cuối cùng là vị trí memory đích để sao chép kết quả đọc vào (aio_buf).

Sau khi điền structure, ứng dụng phải thực hiện asynchronous call để đọc file; trên Mac OS X, API này đơn giản là asynchronous read API:

```
int aio_read(struct aiocb *aiocbp);
```

Lời gọi này thử phát I/O; nếu thành công, nó chỉ trả về ngay và ứng dụng (tức event-based server) có thể tiếp tục công việc.

Tuy nhiên, còn một mảnh ghép cuối cùng phải giải quyết. Làm sao biết khi nào I/O hoàn tất, và do đó buffer (được aio_buf trỏ tới) hiện chứa dữ liệu đã yêu cầu?

Cần thêm một API cuối cùng. Trên Mac OS X, nó được gọi (hơi gây nhầm lẫn) là aio_error(). API như sau:

```
int aio_error(const struct aiocb *aiocbp);
```

System call này kiểm tra request mà aiocbp tham chiếu đã hoàn tất chưa. Nếu rồi, routine trả về thành công (biểu thị bằng số không); nếu chưa, EINPROGRESS được trả về. Do đó, với mỗi asynchronous I/O chưa hoàn tất, ứng dụng có thể định kỳ poll hệ thống qua lời gọi aio_error() để xác định I/O đó đã hoàn tất hay chưa.

Một điều có thể bạn nhận thấy là kiểm tra I/O đã hoàn tất chưa rất phiền phức; nếu chương trình có hàng chục hoặc hàng trăm I/O đã phát tại một thời điểm, nó nên liên tục kiểm tra từng I/O, hay chờ một chút trước, hay ... ?

Để khắc phục vấn đề này, một số hệ thống cung cấp cách tiếp cận dựa trên interrupt. Phương pháp này dùng UNIX signal để báo cho ứng dụng khi asynchronous I/O hoàn tất, nhờ đó loại bỏ nhu cầu hỏi đi hỏi lại hệ thống. Vấn đề polling so với interrupt này cũng xuất hiện trong device, như bạn sẽ thấy (hoặc đã thấy) ở chương về I/O device.

> BỔ SUNG: UNIX SIGNAL
>
> Một hạ tầng đồ sộ và thú vị gọi là signal hiện diện trong mọi biến thể UNIX hiện đại. Ở dạng đơn giản nhất, signal cung cấp cách giao tiếp với process. Cụ thể, một signal có thể được chuyển tới ứng dụng; việc đó dừng bất kỳ công việc nào ứng dụng đang làm để chạy signal handler, tức một đoạn code trong ứng dụng để xử lý signal đó. Khi xong, process tiếp tục hoạt động trước đó.
>
> Mỗi signal có một tên như HUP (hang up), INT (interrupt), SEGV (segmentation violation), v.v.; xem manual page để biết chi tiết. Điều thú vị là đôi khi chính kernel phát signal. Chẳng hạn, khi chương trình gặp segmentation violation, OS gửi SIGSEGV cho nó (thêm tiền tố SIG trước tên signal là cách thông dụng); nếu chương trình được cấu hình bắt signal này, bạn thực sự có thể chạy code để phản ứng với hành vi sai của chương trình (có thể hữu ích cho debugging). Khi signal được gửi tới process không được cấu hình xử lý nó, hành vi mặc định nào đó được thực hiện; với SEGV, process bị kill.
>
> Đây là chương trình đơn giản đi vào vòng lặp vô hạn, nhưng trước tiên thiết lập signal handler để bắt SIGHUP:
>
> ```
> #include <stdio.h>
> #include <signal.h>
>
> void handle(int arg) {
>     printf("stop wakin’ me up...\n");
> }
>
> int main(int argc, char *argv[]) {
>     signal(SIGHUP, handle);
>     while (1)
>         ; // doin’ nothin’ except catchin’ some sigs
>     return 0;
> }
> ```
>
> Bạn có thể gửi signal cho nó bằng công cụ command line kill (đúng, tên này kỳ lạ và hung hăng). Việc đó sẽ ngắt vòng lặp while chính trong chương trình và chạy code handler handle():
>
> ```
> prompt> ./main &
> [3] 36705
> prompt> kill -HUP 36705
> stop wakin’ me up...
> prompt> kill -HUP 36705
> stop wakin’ me up...
> prompt> kill -HUP 36705
> stop wakin’ me up...
> ```
>
> Còn rất nhiều điều để học về signal, đến mức một trang, chứ chưa nói một chương, còn lâu mới đủ. Như mọi khi, có một nguồn tuyệt vời: Stevens và Rago [SR05]. Hãy đọc thêm nếu quan tâm.

Trong hệ thống không có asynchronous I/O, không thể triển khai cách tiếp cận thuần event-based. Tuy nhiên, những nhà nghiên cứu thông minh đã tìm ra các phương pháp thay thế hoạt động khá tốt. Ví dụ, Pai và cộng sự [PDZ99] mô tả cách tiếp cận kết hợp, dùng event để xử lý network packet và thread pool để quản lý I/O chưa hoàn tất. Hãy đọc bài báo để biết chi tiết.

## 33.7 Vấn đề khác: Quản lý State

Một vấn đề khác với cách tiếp cận event-based là code như vậy thường phức tạp hơn khi viết so với thread-based code truyền thống. Lý do như sau: khi event handler phát asynchronous I/O, nó phải đóng gói một số program state cho event handler tiếp theo sử dụng khi I/O cuối cùng hoàn tất; công việc bổ sung này không cần trong thread-based program, vì state chương trình cần nằm trên stack của thread. Adya và cộng sự gọi việc này là manual stack management, và nó là nền tảng của event-based programming [A+02].

Để làm rõ hơn, hãy xem ví dụ đơn giản trong đó thread-based server cần đọc từ file descriptor (fd) và khi hoàn tất, ghi dữ liệu đã đọc từ file vào network socket descriptor (sd). Code (bỏ qua kiểm tra lỗi) như sau:

```
int rc = read(fd, buffer, size);
rc = write(sd, buffer, size);
```

Như bạn thấy, trong multi-threaded program, làm việc này rất đơn giản; khi read() cuối cùng trả về, code biết ngay cần ghi vào socket nào vì thông tin đó nằm trên stack của thread (trong biến sd).

Trong event-based system, mọi thứ không dễ như vậy. Để thực hiện cùng công việc, trước tiên chúng ta phát read theo kiểu asynchronous, dùng các lời gọi AIO đã mô tả ở trên. Giả sử sau đó ta định kỳ kiểm tra việc đọc hoàn tất bằng lời gọi aio_error(); khi lời gọi này báo việc đọc đã xong, làm sao event-based server biết phải làm gì?

Lời giải, như Adya và cộng sự [A+02] mô tả, là dùng cấu trúc cũ trong ngôn ngữ lập trình gọi là continuation [FHK84]. Dù nghe phức tạp, ý tưởng khá đơn giản: về cơ bản, ghi lại thông tin cần để hoàn tất xử lý event này trong một data structure nào đó; khi event xảy ra (tức disk I/O hoàn tất), tra cứu thông tin cần thiết và xử lý event.

Trong trường hợp cụ thể này, lời giải là ghi socket descriptor (sd) trong một data structure nào đó (ví dụ hash table), được đánh chỉ mục bằng file descriptor (fd). Khi disk I/O hoàn tất, event handler dùng file descriptor để tra cứu continuation, trả lại giá trị socket descriptor cho caller. Đến lúc này (cuối cùng), server có thể làm nốt công việc ghi dữ liệu vào socket.

## 33.8 Những khó khăn vẫn còn với Event

Có vài khó khăn khác với cách tiếp cận event-based cần đề cập. Ví dụ, khi hệ thống chuyển từ một CPU sang nhiều CPU, một phần sự đơn giản của cách tiếp cận event-based biến mất. Cụ thể, để tận dụng nhiều hơn một CPU, event server phải chạy nhiều event handler song song; khi đó, những vấn đề synchronization thông thường (ví dụ critical section) phát sinh, và phải dùng các lời giải thông thường (ví dụ lock). Vì thế, trên hệ thống multicore hiện đại, xử lý event đơn giản không cần lock không còn khả thi.

Vấn đề khác với cách tiếp cận event-based là nó không tích hợp tốt với một số hoạt động hệ thống, như paging. Chẳng hạn, nếu event-handler gặp page fault, nó sẽ block, do đó server không tiến triển cho tới khi page fault hoàn tất. Dù server đã được tổ chức để tránh blocking tường minh, kiểu blocking ngầm do page fault này khó tránh và có thể gây vấn đề hiệu năng lớn khi xảy ra thường xuyên.

Vấn đề thứ ba là event-based code có thể khó quản lý theo thời gian, khi ngữ nghĩa chính xác của các routine thay đổi [A+02]. Ví dụ, nếu routine chuyển từ non-blocking sang blocking, event handler gọi routine đó cũng phải thay đổi để thích ứng với bản chất mới của nó, bằng cách tự chia thành hai phần. Vì blocking gây hậu quả rất nghiêm trọng cho event-based server, lập trình viên phải luôn chú ý những thay đổi như vậy trong ngữ nghĩa của API mà mỗi event sử dụng.

Cuối cùng, dù asynchronous disk I/O hiện có thể thực hiện trên hầu hết platform, phải mất rất lâu mới đạt được điều đó [PDZ99], và nó chưa bao giờ tích hợp với asynchronous network I/O đơn giản và thống nhất như bạn có thể nghĩ. Ví dụ, dù chỉ muốn dùng interface select() để quản lý mọi I/O chưa hoàn tất, thường vẫn cần kết hợp select() cho networking với các lời gọi AIO cho disk I/O.

## 33.9 Tổng kết

Chúng ta đã trình bày phần giới thiệu sơ lược về một phong cách concurrency khác dựa trên event. Event-based server trao quyền kiểm soát scheduling cho chính ứng dụng, nhưng phải đánh đổi bằng sự phức tạp và khó tích hợp với những khía cạnh khác của hệ thống hiện đại (ví dụ paging). Vì các thách thức này, chưa có cách tiếp cận nào nổi lên là tốt nhất; do đó, cả thread lẫn event nhiều khả năng sẽ tiếp tục tồn tại như hai cách giải quyết khác nhau cho cùng vấn đề concurrency trong nhiều năm tới. Hãy đọc một số bài nghiên cứu (ví dụ [A+02, PDZ99, vB+03, WCB01]) hoặc tốt hơn nữa, viết event-based code để tìm hiểu thêm.

## Tài liệu tham khảo

[A+02] “Cooperative Task Management Without Manual Stack Management”

Atul Adya, Jon Howell, Marvin Theimer, William J. Bolosky, John R. Douceur

USENIX ATC ’02, Monterey, CA, June 2002

Bài báo quý giá này là bài đầu tiên trình bày rõ một số khó khăn của event-based concurrency, đề xuất những lời giải đơn giản, đồng thời khám phá ý tưởng còn táo bạo hơn là kết hợp hai kiểu quản lý concurrency trong một ứng dụng!

[FHK84] “Programming With Continuations”

Daniel P. Friedman, Christopher T. Haynes, Eugene E. Kohlbecker

In Program Transformation and Programming Environments, Springer Verlag, 1984

Tài liệu tham khảo kinh điển về ý tưởng lâu đời này trong thế giới ngôn ngữ lập trình. Hiện ngày càng phổ biến trong một số ngôn ngữ hiện đại.

[N13] “Node.js Documentation”

Do những người xây dựng node.js viết

Có tại: http://nodejs.org/api/

Một trong nhiều framework mới thú vị giúp bạn dễ dàng xây dựng web service và ứng dụng. Mọi systems hacker hiện đại nên thành thạo framework như thế này (và có lẽ nhiều hơn một). Hãy dành thời gian phát triển trong một trong những môi trường này và trở thành chuyên gia.

[O96] “Why Threads Are A Bad Idea (for most purposes)”

John Ousterhout

Invited Talk at USENIX ’96, San Diego, CA, January 1996

Một bài nói chuyện tuyệt vời về việc thread không phù hợp lắm với GUI-based application (nhưng ý tưởng mang tính tổng quát hơn). Ousterhout hình thành nhiều quan điểm này khi phát triển Tcl/Tk, một scripting language và toolkit thú vị giúp phát triển GUI-based application dễ hơn 100x so với công nghệ tiên tiến nhất thời đó. Dù Tk GUI toolkit vẫn tồn tại (ví dụ trong Python), Tcl dường như đang dần lụi tàn (thật đáng tiếc).

[PDZ99] “Flash: An Efficient and Portable Web Server”

Vivek S. Pai, Peter Druschel, Willy Zwaenepoel

USENIX ’99, Monterey, CA, June 1999

Bài báo tiên phong về cách tổ chức web server trong thời đại Internet then-burgeoning. Hãy đọc để hiểu kiến thức cơ bản cũng như ý tưởng của tác giả về cách xây dựng hệ thống kết hợp khi thiếu hỗ trợ asynchronous I/O.

[SR05] “Advanced Programming in the UNIX Environment”

W. Richard Stevens and Stephen A. Rago

Addison-Wesley, 2005

Một lần nữa, chúng tôi nhắc đến cuốn sách kinh điển must-have-on-your-bookshelf về UNIX systems programming. Nếu có chi tiết bạn cần biết, nó nằm ở đây.

[vB+03] “Capriccio: Scalable Threads for Internet Services”

Rob von Behren, Jeremy Condit, Feng Zhou, George C. Necula, Eric Brewer

SOSP ’03, Lake George, New York, October 2003

Bài báo về cách làm thread hoạt động ở quy mô cực lớn; một đối trọng với mọi công trình event-based đang diễn ra thời đó.

[WCB01] “SEDA: An Architecture for Well-Conditioned, Scalable Internet Services”

Matt Welsh, David Culler, and Eric Brewer

SOSP ’01, Banff, Canada, October 2001

Một biến thể hay của phục vụ event-based, kết hợp thread, queue và xử lý event-based thành một thể thống nhất gọn gàng. Một số ý tưởng đã đi vào hạ tầng của những công ty như Google, Amazon và nơi khác.
