# 30 Condition Variable

Đến đây chúng ta đã phát triển khái niệm lock và thấy cách xây dựng đúng bằng kết hợp hardware và OS hỗ trợ phù hợp. Thật không may, lock không phải primitive duy nhất cần để xây dựng chương trình concurrent.

Cụ thể, nhiều trường hợp thread muốn kiểm tra condition đúng trước khi tiếp tục thực thi. Chẳng hạn parent thread muốn kiểm tra child thread hoàn tất trước khi tiếp tục (thường gọi join()); nên triển khai việc chờ thế nào? Xem Hình 30.1.

```
 1   void *child(void *arg) {
 2       printf("child\n");
 3       // XXX how to indicate we are done?
 4       return NULL;
 5   }
 6
 7   int main(int argc, char *argv[]) {
 8       printf("parent: begin\n");
 9       pthread_t c;
10       Pthread_create(&c, NULL, child, NULL); // create child
11       // XXX how to wait for child?
12       printf("parent: end\n");
13       return 0;
14   }
```

Hình 30.1: Parent chờ Child

Chúng ta muốn thấy output sau:

```
parent: begin
child
parent: end
```

Có thể thử dùng shared variable như Hình 30.2. Giải pháp thường hoạt động nhưng cực kỳ kém hiệu quả vì parent spin và lãng phí CPU time. Thay vào đó, chúng ta muốn đưa parent vào sleep đến khi condition đang chờ (ví dụ child thực thi xong) trở thành đúng.

```
 1   volatile int done = 0;
 2
 3   void *child(void *arg) {
 4       printf("child\n");
 5       done = 1;
 6       return NULL;
 7   }
 8
 9   int main(int argc, char *argv[]) {
10       printf("parent: begin\n");
11       pthread_t c;
12       Pthread_create(&c, NULL, child, NULL); // create child
13       while (done == 0)
14           ; // spin
15       printf("parent: end\n");
16       return 0;
17   }
```

Hình 30.2: Parent chờ Child: Cách Spin-based

> MẤU CHỐT: CÁCH CHỜ CONDITION
>
> Trong chương trình multi-threaded, thread thường cần chờ condition đúng trước khi tiếp tục. Cách đơn giản, chỉ spin đến khi condition đúng, cực kỳ kém hiệu quả và lãng phí CPU cycle, thậm chí có trường hợp sai. Vậy thread nên chờ condition thế nào?

## 30.1 Định nghĩa và routine

Để chờ condition đúng, thread có thể dùng condition variable. Condition variable là queue tường minh mà thread có thể tự đưa vào khi một state thực thi (tức condition) chưa như mong muốn (bằng cách wait trên condition); thread khác, khi thay đổi state đó, có thể đánh thức một (hoặc nhiều) waiting thread để chúng tiếp tục (bằng cách signal trên condition). Ý tưởng bắt nguồn từ “private semaphore” của Dijkstra [D68]; Hoare sau đó đặt tên ý tưởng tương tự là “condition variable” trong công trình monitor [H74].

Để khai báo condition variable, chỉ cần viết như: pthread_cond_t c;, khai báo c là condition variable (lưu ý cũng phải khởi tạo đúng). Condition variable có hai operation: wait() và signal(). Thread gọi wait() khi muốn tự sleep; gọi signal() khi đã thay đổi điều gì trong chương trình và muốn đánh thức sleeping thread chờ condition này. Cụ thể, lời gọi POSIX như sau:

```
pthread_cond_wait(pthread_cond_t *c, pthread_mutex_t *m);
pthread_cond_signal(pthread_cond_t *c);
 1   int done  = 0;
 2   pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;
 3   pthread_cond_t c  = PTHREAD_COND_INITIALIZER;
 4
 5   void thr_exit() {
 6       Pthread_mutex_lock(&m);
 7       done = 1;
 8       Pthread_cond_signal(&c);
 9       Pthread_mutex_unlock(&m);
10   }
11
12   void *child(void *arg) {
13       printf("child\n");
14       thr_exit();
15       return NULL;
16   }
17
18   void thr_join() {
19       Pthread_mutex_lock(&m);
20       while (done == 0)
21           Pthread_cond_wait(&c, &m);
22       Pthread_mutex_unlock(&m);
23   }
24
25   int main(int argc, char *argv[]) {
26       printf("parent: begin\n");
27       pthread_t p;
28       Pthread_create(&p, NULL, child, NULL);
29       thr_join();
30       printf("parent: end\n");
31       return 0;
32   }
```

Hình 30.3: Parent chờ Child: Dùng Condition Variable

Để đơn giản thường gọi chúng là wait() và signal(). Bạn có thể thấy wait() còn nhận mutex làm parameter; giả định mutex đã locked khi gọi wait(). Nhiệm vụ wait() là release lock rồi đưa calling thread vào sleep (atomically); khi thread thức dậy (sau khi thread khác signal), phải re-acquire lock trước khi về caller. Sự phức tạp này nhằm ngăn race condition khi thread cố tự đưa mình vào sleep. Xem lời giải join (Hình 30.3) để hiểu rõ hơn.

Có hai trường hợp. Đầu tiên, parent tạo child thread nhưng tiếp tục chạy (giả sử chỉ một processor), nên lập tức gọi thr_join() chờ child hoàn tất. Nó acquire lock, kiểm tra child xong chưa (chưa), rồi gọi wait() để sleep (do đó release lock). Cuối cùng child chạy, in “child”, gọi thr_exit() đánh thức parent; code này chỉ lấy lock, đặt state variable done và signal parent để đánh thức. Cuối cùng parent chạy (quay về từ wait() khi đang giữ lock), unlock và in thông báo cuối “parent: end”.

Trường hợp hai, child chạy ngay khi tạo, đặt done bằng 1, gọi signal đánh thức sleeping thread (nhưng không có nên chỉ trả về), rồi xong. Parent sau đó chạy, gọi thr_join(), thấy done bằng 1 nên không chờ và trả về.

Lưu ý cuối: parent dùng while loop thay vì chỉ if khi quyết định chờ condition. Dù logic chương trình có vẻ không bắt buộc, đây luôn là ý tốt, như sẽ thấy dưới.

Để hiểu tầm quan trọng từng phần code thr_exit() và thr_join(), hãy thử vài triển khai khác. Đầu tiên, bạn có thể tự hỏi cần state variable done không. Nếu code như ví dụ dưới thì sao? Có hoạt động không?

```
 1   void thr_exit() {
 2       Pthread_mutex_lock(&m);
 3       Pthread_cond_signal(&c);
 4       Pthread_mutex_unlock(&m);
 5   }
 6
 7   void thr_join() {
 8       Pthread_mutex_lock(&m);
 9       Pthread_cond_wait(&c, &m);
10       Pthread_mutex_unlock(&m);
11   }
```

Thật không may cách này sai. Tưởng tượng child chạy ngay và gọi thr_exit() ngay; child signal nhưng không thread nào sleep trên condition. Khi parent chạy, nó chỉ gọi wait rồi mắc kẹt; không thread nào đánh thức. Ví dụ cho thấy tầm quan trọng của state variable done; nó ghi lại giá trị thread quan tâm. Sleep, wake và locking đều xây quanh nó.

Đây là triển khai kém khác. Ví dụ giả định không cần giữ lock để signal và wait. Vấn đề gì có thể xảy ra? Hãy suy nghĩ!

```
 1   void thr_exit() {
 2       done = 1;
 3       Pthread_cond_signal(&c);
 4   }
 5
 6   void thr_join() {
 7       if (done == 0)
 8           Pthread_cond_wait(&c);
 9   }
```

Vấn đề là race condition tinh tế. Cụ thể, parent gọi thr_join(), kiểm tra done, thấy 0 và thử sleep. Nhưng ngay trước wait, parent bị interrupt và child chạy. Child đổi state variable done thành 1 rồi signal, nhưng không thread chờ nên không đánh thức ai. Parent chạy lại và sleep mãi, thật buồn.

> MẸO: LUÔN GIỮ LOCK KHI SIGNAL
>
> Dù không bắt buộc trong mọi trường hợp, đơn giản và tốt nhất có lẽ là giữ lock khi signal với condition variable. Ví dụ trên cần giữ lock để đúng; một số trường hợp có lẽ không cần, nhưng nên tránh. Vì vậy để đơn giản, giữ lock khi gọi signal.
>
> Chiều ngược, giữ lock khi gọi wait, không chỉ là mẹo mà bắt buộc theo semantics của wait: wait luôn (a) giả định lock được giữ khi gọi, (b) release lock khi cho caller sleep, và (c) re-acquires lock ngay trước khi trả về. Vì vậy tổng quát hóa mẹo là đúng: giữ lock khi signal hoặc wait, bạn luôn ổn.

Hy vọng ví dụ join đơn giản cho thấy vài yêu cầu cơ bản để dùng condition variable đúng. Để bảo đảm hiểu, chúng ta xem ví dụ phức tạp hơn: bài toán producer/consumer hay bounded-buffer.

## 30.2 Bài toán Producer/Consumer (Bounded Buffer)

Vấn đề synchronization tiếp theo là producer/consumer, đôi khi gọi bounded buffer, do Dijkstra nêu đầu tiên [D72]. Chính vấn đề này dẫn Dijkstra và co-workers phát minh generalized semaphore (dùng được như lock hoặc condition variable) [D01]; sẽ tìm hiểu semaphore sau.

Tưởng tượng một hoặc nhiều producer thread và một hoặc nhiều consumer thread. Producer tạo data item đặt vào buffer; consumer lấy item từ buffer và tiêu thụ theo cách nào đó.

Mô hình này xuất hiện trong nhiều hệ thống thật. Chẳng hạn web server multi-threaded, producer đặt HTTP request vào work queue (bounded buffer); consumer thread lấy request rồi xử lý.

Bounded buffer cũng dùng khi pipe output chương trình này sang chương trình khác, ví dụ grep foo file.txt | wc -l. Ví dụ chạy hai process concurrent; grep ghi dòng file.txt chứa chuỗi foo ra thứ nó tưởng là standard output; UNIX shell redirect output sang UNIX pipe (tạo bằng system call pipe). Đầu kia nối standard input của process wc, chỉ đếm số dòng input stream rồi in kết quả. Vì vậy grep là producer; wc là consumer; ở giữa là bounded buffer in-kernel; bạn trong ví dụ chỉ là người dùng vui vẻ.

```
 1   int buffer;
 2   int count = 0; // initially, empty
 3
 4   void put(int value) {
 5       assert(count == 0);
 6       count = 1;
 7       buffer = value;
 8   }
 9
10   int get() {
11       assert(count == 1);
12       count = 0;
13       return buffer;
14   }
```

Hình 30.4: Routine Put và Get (Phiên bản 1)

```
 1   void *producer(void *arg) {
 2       int i;
 3       int loops = (int) arg;
 4       for (i = 0; i < loops; i++) {
 5           put(i);
 6       }
 7   }
 8
 9   void *consumer(void *arg) {
10       int i;
11       while (1) {
12           int tmp = get();
13           printf("%d\n", tmp);
14       }
15   }
```

Hình 30.5: Thread Producer/Consumer (Phiên bản 1)

Vì bounded buffer là shared resource, tất nhiên phải đồng bộ truy cập, kẻo[^1] xảy ra race condition. Để hiểu rõ hơn, xem code thực tế.

Đầu tiên cần shared buffer để producer đặt dữ liệu vào và consumer lấy ra. Để đơn giản dùng một integer (bạn có thể tưởng tượng đặt pointer tới data structure vào ô này), cùng hai inner routine để đặt giá trị vào shared buffer và lấy ra. Xem Hình 30.4.

Khá đơn giản nhỉ? put() giả định buffer empty (kiểm tra bằng assertion), đặt giá trị vào shared buffer rồi đánh dấu full bằng count bằng 1. get() làm ngược lại, đặt buffer empty (count bằng 0), trả về giá trị. Đừng lo shared buffer chỉ có một entry; sau này tổng quát thành queue chứa nhiều entry, còn vui hơn nghe có vẻ.

Giờ cần routine biết khi nào được truy cập buffer để đặt hoặc lấy dữ liệu. Các condition ở đây rất rõ ràng: chỉ put khi count bằng không (buffer empty), và chỉ get khi count bằng một (buffer full). Nếu code synchronization cho producer put vào buffer full hoặc consumer get từ empty, chúng ta làm sai (ở đây assertion sẽ kích hoạt).

```
 1   cond_t  cond;
 2   mutex_t mutex;
 3
 4   void *producer(void *arg) {
 5       int i;
 6       for (i = 0; i < loops; i++) {
 7           Pthread_mutex_lock(&mutex);           // p1
 8           if (count == 1)                       // p2
 9               Pthread_cond_wait(&cond, &mutex); // p3
10           put(i);                               // p4
11           Pthread_cond_signal(&cond);           // p5
12           Pthread_mutex_unlock(&mutex);         // p6
13       }
14   }
15
16   void *consumer(void *arg) {
17       int i;
18       for (i = 0; i < loops; i++) {
19           Pthread_mutex_lock(&mutex);           // c1
20           if (count == 0)                       // c2
21               Pthread_cond_wait(&cond, &mutex); // c3
22           int tmp = get();                      // c4
23           Pthread_cond_signal(&cond);           // c5
24           Pthread_mutex_unlock(&mutex);         // c6
25           printf("%d\n", tmp);
26       }
27   }
```

Hình 30.6: Producer/Consumer: Một CV và câu lệnh If

Công việc do hai loại thread làm, một nhóm gọi producer thread, nhóm kia consumer thread. Hình 30.5 là code producer đặt integer vào shared buffer số lần bằng loops, và consumer lấy dữ liệu từ buffer (mãi mãi), mỗi lần in item vừa lấy.

### Lời giải sai

Giờ giả sử chỉ một producer và một consumer. Rõ ràng put() và get() có critical section vì put() cập nhật buffer còn get() đọc. Nhưng chỉ lock quanh code không được; cần thêm. Không ngạc nhiên, thứ cần là condition variable. Lần thử đầu (sai) này (Hình 30.6) có một condition variable cond và lock mutex liên quan.

| T<sub>c</sub><sub>1</sub> | State | T<sub>c</sub><sub>2</sub> | State | T<sub>p</sub> | State | Số lượng | Giải thích |
|---|---|---|---|---|---|---|---|
| c1 | Running |  | Ready |  | Ready | 0 |  |
| c2 | Running |  | Ready |  | Ready | 0 |  |
| c3 | Sleep |  | Ready |  | Ready | 0 | Không có gì để lấy |
|  | Sleep |  | Ready | p1 | Running | 0 |  |
|  | Sleep |  | Ready | p2 | Running | 0 |  |
|  | Sleep |  | Ready | p4 | Running | 1 | Buffer giờ full |
|  | Ready |  | Ready | p5 | Running | 1 | T<sub>c</sub><sub>1</sub> được đánh thức |
|  | Ready |  | Ready | p6 | Running | 1 |  |
|  | Ready |  | Ready | p1 | Running | 1 |  |
|  | Ready |  | Ready | p2 | Running | 1 |  |
|  | Ready |  | Ready | p3 | Sleep | 1 | Buffer full; sleep |
|  | Ready | c1 | Running |  | Sleep | 1 | T<sub>c</sub><sub>2</sub> chen vào ... |
|  | Ready | c2 | Running |  | Sleep | 1 |  |
|  | Ready | c4 | Running |  | Sleep | 0 | ... và lấy dữ liệu |
|  | Ready | c5 | Running |  | Ready | 0 | T<sub>p</sub> được đánh thức |
|  | Ready | c6 | Running |  | Ready | 0 |  |
| c4 | Running |  | Ready |  | Ready | 0 | Ôi không! Không có dữ liệu |

Hình 30.7: Thread Trace: Lời giải sai (Phiên bản 1)

Xem logic signaling giữa producer và consumer. Khi producer muốn điền buffer, nó chờ empty (p1– p3). Consumer có logic hoàn toàn tương tự, nhưng chờ một condition khác: full (c1–c3).

Chỉ một producer và một consumer, code Hình 30.6 hoạt động. Nhưng nếu có nhiều hơn một thread mỗi loại (ví dụ hai consumer), lời giải có hai vấn đề nghiêm trọng. Đó là gì?

... (dừng ở đây để suy nghĩ) ...

Hãy hiểu vấn đề đầu, liên quan if trước wait. Giả sử có hai consumer (T<sub>c</sub><sub>1</sub> và T<sub>c</sub><sub>2</sub>) và một producer (T<sub>p</sub>). Đầu tiên consumer (T<sub>c</sub><sub>1</sub>) chạy; acquire lock (c1), kiểm tra có buffer sẵn để tiêu thụ không (c2), thấy không thì wait (c3) (release lock).

Sau đó producer (T<sub>p</sub>) chạy. Nó acquire lock (p1), kiểm tra mọi buffer full không (p2), thấy chưa nên điền buffer (p4). Producer signal buffer đã full (p5). Quan trọng là điều này chuyển consumer đầu (T<sub>c</sub><sub>1</sub>) từ sleep trên condition variable sang ready queue; T<sub>c</sub><sub>1</sub> giờ có thể chạy (nhưng chưa chạy). Producer tiếp tục đến khi thấy buffer full rồi sleep (p6, p1–p3).

Vấn đề xảy ra ở đây: consumer khác (T<sub>c</sub><sub>2</sub>) chen vào và tiêu thụ giá trị duy nhất trong buffer (c1, c2, c4, c5, c6, bỏ wait tại c3 vì buffer full). Giờ giả sử T<sub>c</sub><sub>1</sub> chạy; ngay trước quay về từ wait, nó re-acquires lock rồi trả về. Nó gọi get() (c4), nhưng không còn buffer để tiêu thụ! Assertion kích hoạt, code không như mong muốn. Rõ ràng cần ngăn T<sub>c</sub><sub>1</sub> thử tiêu thụ vì T<sub>c</sub><sub>2</sub> đã chen vào lấy giá trị vừa sản xuất. Hình 30.7 cho hành động mỗi thread cùng scheduler state (Ready, Running hoặc Sleeping) theo thời gian.

```
 1   cond_t  cond;
 2   mutex_t mutex;
 3
 4   void *producer(void *arg) {
 5       int i;
 6       for (i = 0; i < loops; i++) {
 7           Pthread_mutex_lock(&mutex);           // p1
 8           while (count == 1)                    // p2
 9               Pthread_cond_wait(&cond, &mutex); // p3
10           put(i);                               // p4
11           Pthread_cond_signal(&cond);           // p5
12           Pthread_mutex_unlock(&mutex);         // p6
13       }
14   }
15
16   void *consumer(void *arg) {
17       int i;
18       for (i = 0; i < loops; i++) {
19           Pthread_mutex_lock(&mutex);           // c1
20           while (count == 0)                    // c2
21               Pthread_cond_wait(&cond, &mutex); // c3
22           int tmp = get();                      // c4
23           Pthread_cond_signal(&cond);           // c5
24           Pthread_mutex_unlock(&mutex);         // c6
25           printf("%d\n", tmp);
26       }
27   }
```

Hình 30.8: Producer/Consumer: Một CV và While

Lý do đơn giản: sau khi producer đánh thức T<sub>c</sub><sub>1</sub>, nhưng trước khi T<sub>c</sub><sub>1</sub> chạy, state bounded buffer đổi (do T<sub>c</sub><sub>2</sub>). Signal chỉ đánh thức thread; đó là gợi ý state thế giới thay đổi (ở đây giá trị được đặt vào buffer), không bảo đảm khi thread chạy state vẫn mong muốn. Cách hiểu signal này thường gọi Mesa semantics, theo nghiên cứu đầu xây condition variable như vậy [LR80]; cách đối lập Hoare semantics khó xây hơn nhưng bảo đảm mạnh hơn: thread được đánh thức chạy ngay [H74]. Hầu như mọi hệ thống đều dùng Mesa semantics.

### Tốt hơn nhưng vẫn sai: Dùng While thay If

May thay, sửa dễ (Hình 30.8): đổi if thành while. Nghĩ tại sao đúng; giờ consumer T<sub>c</sub><sub>1</sub> thức dậy và (giữ lock) lập tức re-checks state shared variable (c2). Nếu buffer empty lúc đó, consumer chỉ sleep lại (c3). if tương ứng cũng đổi thành while trong producer (p2).

Vì Mesa semantics, quy tắc dễ nhớ với condition variable là luôn dùng while loop. Đôi khi không cần re-check condition, nhưng làm vậy luôn an toàn; cứ làm và vui vẻ.

| T<sub>c</sub><sub>1</sub> | State | T<sub>c</sub><sub>2</sub> | State | T<sub>p</sub> | State | Số lượng | Giải thích |
|---|---|---|---|---|---|---|---|
| c1 | Running |  | Ready |  | Ready | 0 |  |
| c2 | Running |  | Ready |  | Ready | 0 |  |
| c3 | Sleep |  | Ready |  | Ready | 0 | Không có gì để lấy |
|  | Sleep | c1 | Running |  | Ready | 0 |  |
|  | Sleep | c2 | Running |  | Ready | 0 |  |
|  | Sleep | c3 | Sleep |  | Ready | 0 | Không có gì để lấy |
|  | Sleep |  | Sleep | p1 | Running | 0 |  |
|  | Sleep |  | Sleep | p2 | Running | 0 |  |
|  | Sleep |  | Sleep | p4 | Running | 1 | Buffer giờ full |
|  | Ready |  | Sleep | p5 | Running | 1 | T<sub>c</sub><sub>1</sub> được đánh thức |
|  | Ready |  | Sleep | p6 | Running | 1 |  |
|  | Ready |  | Sleep | p1 | Running | 1 |  |
|  | Ready |  | Sleep | p2 | Running | 1 |  |
|  | Ready |  | Sleep | p3 | Sleep | 1 | Phải sleep (full) |
| c2 | Running |  | Sleep |  | Sleep | 1 | Kiểm tra lại condition |
| c4 | Running |  | Sleep |  | Sleep | 0 | T<sub>c</sub><sub>1</sub> lấy dữ liệu |
| c5 | Running |  | Ready |  | Sleep | 0 | Ối! Đánh thức T<sub>c</sub><sub>2</sub> |
| c6 | Running |  | Ready |  | Sleep | 0 |  |
| c1 | Running |  | Ready |  | Sleep | 0 |  |
| c2 | Running |  | Ready |  | Sleep | 0 |  |
| c3 | Sleep |  | Ready |  | Sleep | 0 | Không có gì để lấy |
|  | Sleep | c2 | Running |  | Sleep | 0 |  |
|  | Sleep | c3 | Sleep |  | Sleep | 0 | Mọi thread đều sleep... |

Hình 30.9: Thread Trace: Lời giải sai (Phiên bản 2)

Tuy nhiên code còn bug, vấn đề thứ hai đã nói. Bạn thấy không? Liên quan việc chỉ một condition variable. Hãy thử tìm trước khi đọc tiếp. LÀM ĐI!

... (lại dừng để bạn nghĩ, hoặc nhắm mắt chút) ...

Hãy xác nhận bạn hiểu đúng, hoặc xác nhận bạn đã thức và đọc đoạn này. Vấn đề xảy ra khi hai consumer chạy trước (T<sub>c</sub><sub>1</sub> và T<sub>c</sub><sub>2</sub>), đều sleep (c3). Producer chạy, đặt giá trị vào buffer, đánh thức một consumer (giả sử T<sub>c</sub><sub>1</sub>), rồi sleep lại. Giờ có một consumer ready (T<sub>c</sub><sub>1</sub>) và hai thread sleep trên condition (T<sub>c</sub><sub>2</sub> và T<sub>p</sub>). Chúng ta sắp gây vấn đề: bắt đầu hấp dẫn!

Consumer T<sub>c</sub><sub>1</sub> thức bằng cách quay về từ wait() (c3), re-checks condition (c2), thấy buffer full nên tiêu thụ (c4). Quan trọng là sau đó nó signal condition (c5), đánh thức một sleeping thread. Nhưng nên đánh thức ai?

Vì consumer làm empty buffer, rõ ràng nên đánh thức producer. Nhưng nếu đánh thức consumer T<sub>c</sub><sub>2</sub> (điều hoàn toàn có thể xảy ra, tùy cách quản lý wait queue), có vấn đề. T<sub>c</sub><sub>2</sub> thức, thấy buffer empty (c2), sleep lại (c3). Producer T<sub>p</sub>, có giá trị muốn put, vẫn sleep. Consumer còn lại T<sub>c</sub><sub>1</sub> cũng sleep lại. Cả ba thread sleep, bug rõ ràng; xem Hình 30.9 để lần theo step-by-step tai họa này.

Rõ ràng cần signaling nhưng phải có hướng cụ thể hơn. Consumer không nên đánh thức consumer khác, chỉ producer, và vice-versa.

```
 1   cond_t  empty, fill;
 2   mutex_t mutex;
 3
 4   void *producer(void *arg) {
 5       int i;
 6       for (i = 0; i < loops; i++) {
 7           Pthread_mutex_lock(&mutex);
 8           while (count == 1)
 9               Pthread_cond_wait(&empty, &mutex);
10           put(i);
11           Pthread_cond_signal(&fill);
12           Pthread_mutex_unlock(&mutex);
13       }
14   }
15
16   void *consumer(void *arg) {
17       int i;
18       for (i = 0; i < loops; i++) {
19           Pthread_mutex_lock(&mutex);
20           while (count == 0)
21               Pthread_cond_wait(&fill, &mutex);
22           int tmp = get();
23           Pthread_cond_signal(&empty);
24           Pthread_mutex_unlock(&mutex);
25           printf("%d\n", tmp);
26       }
27   }
```

Hình 30.10: Producer/Consumer: Hai CV và While

### Lời giải Producer/Consumer một buffer

Lời giải lại nhỏ: dùng hai condition variable thay một để signal đúng loại thread cần đánh thức khi system state thay đổi. Hình 30.10 là code kết quả.

Trong code trên, producer thread wait trên condition empty, signal fill. Ngược lại consumer wait trên fill và signal empty. Như vậy thiết kế tránh vấn đề thứ hai: consumer không bao giờ vô tình đánh thức consumer, producer không bao giờ vô tình đánh thức producer.

### Lời giải Producer/Consumer cuối cùng

Giờ có lời giải producer/consumer hoạt động, dù chưa hoàn toàn tổng quát. Thay đổi cuối nhằm tăng concurrency và hiệu quả: thêm buffer slot để sản xuất nhiều giá trị trước sleep, tương tự tiêu thụ nhiều trước sleep. Chỉ một producer và consumer, cách này hiệu quả hơn vì giảm context switch; nhiều producer hoặc consumer (hoặc cả hai), nó còn cho sản xuất hoặc tiêu thụ concurrent, tăng concurrency. May thay, thay đổi nhỏ so với lời giải hiện tại.

```
 1   int buffer[MAX];
 2   int fill_ptr = 0;
 3   int use_ptr  = 0;
 4   int count    = 0;
 5
 6   void put(int value) {
 7       buffer[fill_ptr] = value;
 8       fill_ptr = (fill_ptr + 1) % MAX;
 9       count++;
10   }
11
12   int get() {
13       int tmp = buffer[use_ptr];
14       use_ptr = (use_ptr + 1) % MAX;
15       count--;
16       return tmp;
17   }
```

Hình 30.11: Routine Put và Get cuối cùng

```
 1   cond_t empty, fill;
 2   mutex_t mutex;
 3
 4   void *producer(void *arg) {
 5       int i;
 6       for (i = 0; i < loops; i++) {
 7           Pthread_mutex_lock(&mutex);            // p1
 8           while (count == MAX)                   // p2
 9               Pthread_cond_wait(&empty, &mutex); // p3
10           put(i);                                // p4
11           Pthread_cond_signal(&fill);            // p5
12           Pthread_mutex_unlock(&mutex);          // p6
13       }
14   }
15
16   void *consumer(void *arg) {
17       int i;
18       for (i = 0; i < loops; i++) {
19           Pthread_mutex_lock(&mutex);            // c1
20           while (count == 0)                     // c2
21               Pthread_cond_wait(&fill, &mutex);  // c3
22           int tmp = get();                       // c4
23           Pthread_cond_signal(&empty);           // c5
24           Pthread_mutex_unlock(&mutex);          // c6
25           printf("%d\n", tmp);
26       }
27   }
```

Hình 30.12: Lời giải hoạt động cuối cùng

Thay đổi đầu tiên của lời giải cuối cùng nằm ở chính buffer structure và put(), get() tương ứng (Hình 30.11). Cũng thay chút condition producer và consumer kiểm tra để quyết định sleep không. Hình 30.12 là logic wait và signal cuối. Producer chỉ sleep nếu mọi buffer full (p2); consumer chỉ sleep nếu mọi buffer empty (c2). Như vậy giải quyết bài toán producer/consumer.

> MẸO: DÙNG WHILE (KHÔNG PHẢI IF) CHO CONDITION
>
> Khi kiểm tra condition trong chương trình multi-threaded, dùng while loop luôn đúng; if chỉ có thể đúng tùy signaling semantics. Vì vậy luôn dùng while và code hoạt động mong đợi.
>
> While loop quanh kiểm tra condition cũng xử lý spurious wakeup. Một số thread package, do chi tiết triển khai, có thể đánh thức hai thread dù chỉ một signal [L11]. Spurious wakeup là lý do nữa để re-check condition mà thread chờ.

## 30.3 Covering Condition

Giờ xem ví dụ nữa về dùng condition variable. Nghiên cứu code này từ bài Pilot của Lampson và Redell [LR80], nhóm đầu triển khai Mesa semantics ở trên (ngôn ngữ dùng là Mesa, nên có tên đó).

Vấn đề họ gặp dễ minh họa bằng ví dụ đơn giản, ở đây thư viện memory allocation multi-threaded đơn giản. Hình 30.13 là đoạn code thể hiện vấn đề.

Như code cho thấy, thread gọi code memory allocation có thể phải chờ thêm memory free. Ngược lại, thread free memory signal rằng có thêm memory free. Nhưng code trên có vấn đề: nên đánh thức waiting thread nào (có thể nhiều hơn một)?

Xét tình huống sau. Giả sử không byte nào free; thread T<sub>a</sub> gọi allocate(100), sau đó thread T<sub>b</sub> xin ít memory hơn bằng allocate(10). Cả T<sub>a</sub> và T<sub>b</sub> wait trên condition rồi sleep; không đủ byte free cho request nào.

Lúc đó giả sử thread thứ ba T<sub>c</sub> gọi free(50). Đáng tiếc khi gọi signal, có thể không đánh thức đúng waiting thread T<sub>b</sub> chỉ chờ 10 byte; T<sub>a</sub> nên tiếp tục chờ vì chưa đủ memory. Vì vậy code trong hình sai, vì thread đánh thức không biết nên đánh thức thread nào (hoặc những thread nào).

Lampson và Redell đề xuất giải pháp đơn giản: thay pthread_cond_signal() bằng pthread_cond_broadcast(), đánh thức mọi waiting thread. Nhờ vậy bảo đảm thread cần thức đều được thức. Nhược điểm tất nhiên là có thể giảm hiệu năng vì đánh thức không cần thiết nhiều thread chưa nên thức. Chúng chỉ thức, re-check condition rồi lập tức sleep lại.

```
 1   // how many bytes of the heap are free?
 2   int bytesLeft = MAX_HEAP_SIZE;
 3
 4   // need lock and condition too
 5   cond_t  c;
 6   mutex_t m;
 7
 8   void *
 9   allocate(int size) {
10       Pthread_mutex_lock(&m);
11       while (bytesLeft < size)
12           Pthread_cond_wait(&c, &m);
13       void *ptr = ...; // get mem from heap
14       bytesLeft -= size;
15       Pthread_mutex_unlock(&m);
16       return ptr;
17   }
18
19   void free(void *ptr, int size) {
20       Pthread_mutex_lock(&m);
21       bytesLeft += size;
22       Pthread_cond_signal(&c); // whom to signal??
23       Pthread_mutex_unlock(&m);
24   }
```

Hình 30.13: Covering Condition: Ví dụ

Lampson và Redell gọi condition đó là covering condition, vì bao phủ mọi trường hợp cần đánh thức (theo cách bảo thủ); chi phí là có thể đánh thức quá nhiều thread. Bạn đọc tinh ý cũng thấy có thể dùng cách này trước (bài producer/consumer chỉ một condition variable). Nhưng ở đó có giải pháp tốt hơn nên dùng nó. Nói chung, nếu chương trình chỉ hoạt động khi đổi signal sang broadcast (mà bạn nghĩ không cần), có lẽ có bug; hãy sửa! Nhưng như memory allocator trên, broadcast có thể là giải pháp thẳng thắn nhất.

## 30.4 Tổng kết

Chúng ta giới thiệu synchronization primitive quan trọng khác ngoài lock: condition variable. Cho thread sleep khi program state chưa mong muốn, CV giúp giải quyết gọn nhiều synchronization problem quan trọng, gồm producer/consumer nổi tiếng (vẫn quan trọng), và covering condition. Ở đây đáng ra có câu kết kịch tính hơn, như “Anh yêu Anh Cả” [O49].

## Tài liệu tham khảo

[D68] “Cooperating sequential processes”

Edsger W. Dijkstra, 1968

Có tại: http://www.cs.utexas.edu/users/EWD/ewd01xx/EWD123.PDF

Một kinh điển nữa của Dijkstra; đọc công trình đầu về concurrency sẽ dạy nhiều điều cần biết.

[D72] “Information Streams Sharing a Finite Buffer”

E.W. Dijkstra

Information Processing Letters 1: 179180, 1972

Có tại: http://www.cs.utexas.edu/users/EWD/ewd03xx/EWD329.PDF

Bài báo nổi tiếng giới thiệu bài toán producer/consumer.

[D01] “My recollections of operating system design”

E.W. Dijkstra

April, 2001

Có tại: http://www.cs.utexas.edu/users/EWD/ewd13xx/EWD1303.PDF

Bài đọc hấp dẫn cho ai quan tâm cách người tiên phong nghĩ ra khái niệm cơ bản, nền tảng, gồm “interrupt” và thậm chí “stack”!

[H74] “Monitors: An Operating System Structuring Concept”

C.A.R. Hoare

Communications of the ACM, 17:10, pages 549–557, October 1974

Hoare có khá nhiều công trình lý thuyết concurrency. Nhưng có lẽ vẫn nổi tiếng nhất về Quicksort, thuật toán sort tuyệt nhất thế giới, ít nhất theo các tác giả này.

[L11] “Pthread_cond_signal Man Page”

Có tại: http://linux.die.net/man/3/pthread_cond_signal

March, 2011

Linux man page cho ví dụ đơn giản hay về tại sao thread có thể spurious wakeup do race condition trong code signal/wakeup.

[LR80] “Experience with Processes and Monitors in Mesa”

B.W. Lampson, D.R. Redell

Communications of the ACM. 23:2, pages 105-117, February 1980

Bài xuất sắc về cách thực sự triển khai signaling và condition variable trong hệ thống thật, dẫn đến tên “Mesa” semantics về ý nghĩa được đánh thức; semantics cũ do Tony Hoare phát triển [H74] sau đó gọi “Hoare” semantics, khó nói to trong lớp mà giữ mặt nghiêm.

[O49] “1984”

George Orwell, 1949, Secker and Warburg

Hơi heavy-handed, nhưng tất nhiên phải đọc. Dù vậy, chúng tôi hơi tiết lộ kết thúc khi trích câu cuối. Xin lỗi! Nếu chính phủ đang đọc, xin nói chúng tôi nghĩ chính phủ “double plus good”. Nghe chưa, bạn bè ở NSA?

---

[^1]: Đây là chỗ chúng tôi đưa tiếng Anh cổ nghiêm túc cùng thể giả định vào cho bạn.
