# 27 Phần xen kẽ: Thread API

Chương này trình bày ngắn gọn các phần chính của thread API. Mỗi phần sẽ được giải thích thêm trong những chương sau, khi chúng ta minh họa cách sử dụng API. Bạn có thể tìm thêm chi tiết trong nhiều sách và nguồn trực tuyến [B89, B97, B+96, K+96]. Lưu ý rằng các chương tiếp theo giới thiệu khái niệm lock và condition variable chậm rãi hơn, với nhiều ví dụ; vì vậy chương này thích hợp hơn để tra cứu.

> MẤU CHỐT: CÁCH TẠO VÀ ĐIỀU KHIỂN THREAD
>
> OS nên cung cấp interface nào để tạo và điều khiển thread? Nên thiết kế những interface này thế nào để vừa dễ dùng vừa hữu ích?

## 27.1 Tạo thread

Điều đầu tiên bạn phải làm được khi viết chương trình multi-threaded là tạo thread mới; do đó phải có một loại interface tạo thread. Trong POSIX, việc này rất dễ:

```
#include <pthread.h>
int
pthread_create(      pthread_t *       thread,
               const pthread_attr_t *  attr,
                     void *            (*start_routine)(void*),
                     void *            arg);
```

Khai báo này có thể hơi phức tạp (đặc biệt nếu bạn chưa dùng function pointer trong C), nhưng thực ra không quá khó. Có bốn argument: thread, attr, start_routine và arg. Argument đầu tiên, thread, là pointer tới structure kiểu pthread_t; chúng ta dùng structure này để tương tác với thread, nên cần truyền nó cho pthread_create() để khởi tạo.

Argument thứ hai, attr, chỉ định các attribute mà thread có thể có. Ví dụ gồm đặt stack size hoặc thông tin scheduling priority của thread. Attribute được khởi tạo bằng lời gọi pthread_attr_init() riêng; xem manual page để biết chi tiết. Tuy nhiên, trong hầu hết trường hợp, mặc định là đủ; lúc đó chúng ta chỉ truyền giá trị NULL.

Argument thứ ba phức tạp nhất, nhưng thực chất chỉ hỏi: thread nên bắt đầu chạy ở hàm nào? Trong C, chúng ta gọi đây là function pointer, và ở đây nó yêu cầu: một tên hàm (start_routine), nhận duy nhất một argument kiểu void * (như phần trong ngoặc sau start_routine chỉ ra), và trả về giá trị kiểu void * (tức void pointer).

Nếu routine này cần argument integer thay cho void pointer, khai báo sẽ như sau:

```
int pthread_create(..., // first two args are the same
                   void *    (*start_routine)(int),
                   int       arg);
```

Nếu routine nhận argument void pointer nhưng trả về integer, khai báo sẽ như sau:

```
int pthread_create(..., // first two args are the same
                   int       (*start_routine)(void *),
                   void *     arg);
```

Cuối cùng, argument thứ tư, arg, chính là argument được truyền cho hàm nơi thread bắt đầu thực thi. Bạn có thể hỏi: tại sao cần các void pointer này? Câu trả lời đơn giản: dùng void pointer làm argument cho hàm start_routine cho phép truyền argument thuộc bất kỳ kiểu nào; dùng nó làm return value cho phép thread trả về bất kỳ kiểu kết quả nào.

Hãy xem ví dụ trong Hình 27.1. Ở đây chúng ta tạo thread được truyền hai argument, đóng gói trong một kiểu do chúng ta định nghĩa (myarg_t). Khi được tạo, thread chỉ cần cast argument sang kiểu mong đợi rồi lấy các argument ra như mong muốn.

Vậy là xong! Khi tạo thread, bạn thực sự có thêm một thực thể đang thực thi, với call stack riêng, chạy trong cùng address space với tất cả thread đang tồn tại trong chương trình. Cuộc vui bắt đầu!

## 27.2 Thread hoàn tất

Ví dụ trên minh họa cách tạo thread. Nhưng nếu muốn chờ thread hoàn tất thì sao? Bạn cần thực hiện thao tác đặc biệt để chờ hoàn tất; cụ thể là gọi routine pthread_join().

```
int pthread_join(pthread_t thread, void **value_ptr);
```

```
 1   #include <pthread.h>
 2
 3   typedef struct __myarg_t {
 4       int a;
 5       int b;
 6   } myarg_t;
 7
 8   void *mythread(void *arg) {
 9       myarg_t *m = (myarg_t *) arg;
10       printf("%d %d\n", m->a, m->b);
11       return NULL;
12   }
13
14   int
15   main(int argc, char *argv[]) {
16       pthread_t p;
17       int rc;
18
19       myarg_t args;
20       args.a = 10;
21       args.b = 20;
22       rc = pthread_create(&p, NULL, mythread, &args);
23       ...
24   }
```

Hình 27.1: Tạo thread

Routine này nhận hai argument. Argument đầu có kiểu pthread_t, dùng để chỉ định thread cần chờ. Biến này được routine tạo thread khởi tạo (khi bạn truyền pointer tới nó làm argument cho pthread_create()); nếu giữ lại biến này, bạn có thể dùng nó để chờ thread kết thúc.

Argument thứ hai là pointer tới return value mà bạn mong nhận. Vì routine có thể trả về bất cứ thứ gì, nó được định nghĩa là trả về pointer tới void; vì routine pthread_join() thay đổi giá trị của argument được truyền vào, bạn phải truyền pointer tới giá trị đó, thay vì chỉ truyền chính giá trị.

Hãy xem ví dụ khác (Hình 27.2). Code lại tạo một thread duy nhất và truyền vài argument qua structure myarg_t. Để trả về giá trị, chúng ta dùng kiểu myret_t. Khi thread chạy xong, main thread, vốn đang chờ bên trong routine pthread_join()[^1], sẽ quay về từ lời gọi đó, và chúng ta có thể truy cập các giá trị thread trả về, tức nội dung trong myret_t.

Có vài điều cần lưu ý về ví dụ này. Thứ nhất, nhiều khi không cần đóng gói và giải đóng gói argument phiền phức như vậy. Chẳng hạn, nếu tạo thread không có argument, chúng ta có thể truyền NULL làm argument khi tạo. Tương tự, có thể truyền NULL cho pthread_join() nếu không quan tâm return value.

Thứ hai, nếu chỉ truyền một giá trị (ví dụ int), chúng ta không cần đóng gói nó thành argument. Hình 27.3 minh họa ví dụ. Trường hợp này đơn giản hơn đôi chút, vì không phải đóng gói argument và return value trong structure.

```
 1   #include <stdio.h>
 2   #include <pthread.h>
 3   #include <assert.h>
 4   #include <stdlib.h>
 5
 6   typedef struct __myarg_t {
 7       int a;
 8       int b;
 9   } myarg_t;
10
11   typedef struct __myret_t {
12       int x;
13       int y;
14   } myret_t;
15
16   void *mythread(void *arg) {
17       myarg_t *m = (myarg_t *) arg;
18       printf("%d %d\n", m->a, m->b);
19       myret_t *r = Malloc(sizeof(myret_t));
20       r->x = 1;
21       r->y = 2;
22       return (void *) r;
23   }
24
25   int
26   main(int argc, char *argv[]) {
27       int rc;
28       pthread_t p;
29       myret_t *m;
30
31       myarg_t args;
32       args.a = 10;
33       args.b = 20;
34       Pthread_create(&p, NULL, mythread, &args);
35       Pthread_join(p, (void **) &m);
36       printf("returned %d %d\n", m->x, m->y);
37       return 0;
38   }
```

Hình 27.2: Chờ thread hoàn tất

Thứ ba, cần hết sức cẩn thận với cách trả về giá trị từ thread. Cụ thể, đừng bao giờ trả về pointer trỏ tới thứ được cấp phát trên call stack của thread. Nếu làm vậy, bạn nghĩ chuyện gì xảy ra? (hãy suy nghĩ!) Đây là ví dụ code nguy hiểm, sửa từ ví dụ trong Hình 27.2.

```
 1   void *mythread(void *arg) {
 2       myarg_t *m = (myarg_t *) arg;
 3       printf("%d %d\n", m->a, m->b);
 4       myret_t r; // ALLOCATED ON STACK: BAD!
 5       r.x = 1;
 6       r.y = 2;
 7       return (void *) &r;
 8   }
void *mythread(void *arg) {
    int m = (int) arg;
    printf("%d\n", m);
    return (void *) (arg + 1);
}

int main(int argc, char *argv[]) {
    pthread_t p;
    int rc, m;
    Pthread_create(&p, NULL, mythread, (void *) 100);
    Pthread_join(p, (void **) &m);
    printf("returned %d\n", m);
    return 0;
}
```

Hình 27.3: Truyền argument đơn giản hơn cho thread

Trong trường hợp này, biến r được cấp phát trên stack của mythread. Tuy nhiên, khi hàm trả về, giá trị tự động được thu hồi (rốt cuộc đó là lý do stack dễ dùng!), nên trả về pointer tới biến đã bị thu hồi sẽ dẫn đến đủ loại kết quả xấu. Chắc chắn khi in các giá trị tưởng đã trả về, bạn có thể (nhưng không nhất thiết!) ngạc nhiên. Hãy thử và tự tìm hiểu[^2]!

Cuối cùng, bạn có thể nhận thấy dùng pthread_create() tạo thread rồi ngay lập tức gọi pthread_join() là cách tạo thread khá kỳ lạ. Thực ra có cách dễ hơn để thực hiện đúng việc này: gọi procedure. Rõ ràng, thông thường chúng ta tạo nhiều hơn một thread rồi chờ chúng hoàn tất; nếu không, dùng thread hầu như chẳng có ý nghĩa.

Lưu ý không phải mọi code multi-threaded đều dùng routine join. Ví dụ, web server multi-threaded có thể tạo một số worker thread, rồi dùng main thread nhận request và truyền cho worker vô thời hạn. Những chương trình long-lived như vậy có thể không cần join. Tuy nhiên, chương trình parallel tạo thread để thực hiện một tác vụ cụ thể (song song) thường dùng join để bảo đảm toàn bộ công việc hoàn tất trước khi thoát hoặc chuyển sang giai đoạn tính toán kế tiếp.

## 27.3 Lock

Ngoài tạo và join thread, nhóm hàm hữu ích tiếp theo do thư viện POSIX thread cung cấp có lẽ là các hàm tạo mutual exclusion cho critical section thông qua lock. Cặp routine cơ bản nhất cho mục đích này là:

```
int pthread_mutex_lock(pthread_mutex_t *mutex);
int pthread_mutex_unlock(pthread_mutex_t *mutex);
```

Các routine này dễ hiểu và dễ dùng. Khi nhận ra một vùng code là critical section, bạn cần bảo vệ nó bằng lock để hoạt động đúng mong muốn. Có lẽ bạn hình dung được code như sau:

```
pthread_mutex_t lock;
pthread_mutex_lock(&lock);
x = x + 1; // or whatever your critical section is
pthread_mutex_unlock(&lock);
```

Ý định của code như sau: nếu không có thread khác giữ lock khi gọi pthread_mutex_lock(), thread sẽ acquire lock và vào critical section. Nếu một thread khác đang giữ lock, thread cố lấy lock sẽ không quay về từ lời gọi cho tới khi acquire được lock (nghĩa là thread đang giữ lock đã release bằng lời gọi unlock). Tất nhiên, tại một thời điểm nhiều thread có thể mắc kẹt chờ bên trong hàm acquire lock; tuy nhiên chỉ thread đã acquire lock mới nên gọi unlock.

Thật không may, code này sai ở hai điểm quan trọng. Vấn đề đầu tiên là thiếu khởi tạo thích hợp. Mọi lock phải được khởi tạo đúng để bảo đảm có giá trị ban đầu đúng, nhờ đó hoạt động như mong muốn khi gọi lock và unlock.

Với POSIX thread, có hai cách khởi tạo lock. Một cách là dùng PTHREAD_MUTEX_INITIALIZER, như sau:

```
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
```

Điều này đặt lock về các giá trị mặc định và khiến lock sử dụng được. Cách động (tức tại run time) là gọi pthread_mutex_init(), như sau:

```
int rc = pthread_mutex_init(&lock, NULL);
assert(rc == 0); // always check success!
```

Argument đầu tiên của routine này là address của chính lock, còn argument thứ hai là tập attribute tùy chọn. Hãy tự đọc thêm về attribute; truyền NULL chỉ sử dụng mặc định. Cả hai cách đều được, nhưng chúng ta thường dùng cách động (cách sau). Lưu ý cũng nên gọi pthread_mutex_destroy() tương ứng khi dùng xong lock; xem manual page để biết đầy đủ chi tiết.

Vấn đề thứ hai của code trên là không kiểm tra error code khi gọi lock và unlock. Giống hầu như mọi library routine trong hệ thống UNIX, những routine này cũng có thể thất bại! Nếu code không kiểm tra error code đúng cách, lỗi sẽ âm thầm xảy ra, ở đây có thể cho phép nhiều thread vào critical section. Tối thiểu, hãy dùng wrapper assert rằng routine thành công (ví dụ Hình 27.4); chương trình tinh vi hơn (non-toy), không thể đơn giản thoát khi có sự cố, nên kiểm tra thất bại và xử lý thích hợp khi lock hoặc unlock không thành công.

```
// Use this to keep your code clean but check for failures
// Only use if exiting program is OK upon failure
void Pthread_mutex_lock(pthread_mutex_t *mutex) {
  int rc = pthread_mutex_lock(mutex);
  assert(rc == 0);
}
```

Hình 27.4: Ví dụ wrapper

Routine lock và unlock không phải những routine duy nhất trong thư viện pthreads tương tác với lock. Cụ thể, hai routine sau cũng có thể đáng quan tâm:

```
int pthread_mutex_trylock(pthread_mutex_t *mutex);
int pthread_mutex_timedlock(pthread_mutex_t *mutex,
                            struct timespec *abs_timeout);
```

Hai lời gọi này dùng để acquire lock. Phiên bản trylock trả về thất bại nếu lock đang được giữ; phiên bản timedlock trả về sau timeout hoặc sau khi acquire lock, tùy điều nào xảy ra trước. Do đó timedlock với timeout bằng không trở thành trường hợp trylock. Nói chung nên tránh cả hai phiên bản; tuy nhiên có vài trường hợp tránh mắc kẹt (có thể vô thời hạn) trong routine acquire lock là hữu ích, như chúng ta sẽ thấy ở chương sau (ví dụ khi nghiên cứu deadlock).

## 27.4 Condition Variable

Thành phần quan trọng khác của bất kỳ thư viện thread nào, và chắc chắn có trong POSIX thread, là condition variable. Condition variable hữu ích khi cần signaling giữa các thread, nếu một thread chờ thread khác làm gì đó trước khi tiếp tục. Chương trình muốn tương tác theo cách này dùng hai routine chính:

```
int pthread_cond_wait(pthread_cond_t *cond, pthread_mutex_t *mutex);
int pthread_cond_signal(pthread_cond_t *cond);
```

Để dùng condition variable, phải có thêm lock gắn với condition này. Khi gọi một trong hai routine trên, cần giữ lock đó.

Routine đầu tiên, pthread_cond_wait(), đưa calling thread vào sleep, chờ thread khác signal, thường khi chương trình có thay đổi mà thread now-sleeping có thể quan tâm. Cách dùng điển hình như sau:

```
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t  cond = PTHREAD_COND_INITIALIZER;

Pthread_mutex_lock(&lock);
while (ready == 0)
    Pthread_cond_wait(&cond, &lock);
Pthread_mutex_unlock(&lock);
```

Trong code này, sau khi khởi tạo lock và condition liên quan[^3], thread kiểm tra biến ready đã được đặt thành giá trị khác không chưa. Nếu chưa, thread chỉ gọi routine wait để sleep cho đến khi thread khác đánh thức.

Code đánh thức thread, chạy trong một thread khác, như sau:

```
Pthread_mutex_lock(&lock);
ready = 1;
Pthread_cond_signal(&cond);
Pthread_mutex_unlock(&lock);
```

Có vài lưu ý về chuỗi code này. Thứ nhất, khi signal (cũng như khi sửa global variable ready), chúng ta luôn bảo đảm đang giữ lock. Điều này bảo đảm không vô tình đưa race condition vào code.

Thứ hai, bạn có thể thấy lời gọi wait nhận lock làm parameter thứ hai, còn signal chỉ nhận condition. Lý do là ngoài đưa calling thread vào sleep, lời gọi wait còn release lock khi đưa caller vào sleep. Nếu không, thread khác làm sao acquire lock rồi signal để đánh thức nó? Tuy nhiên, trước khi quay về sau khi được đánh thức, pthread_cond_wait() re-acquires lock, bảo đảm bất cứ lúc nào waiting thread chạy giữa lần acquire lock đầu chuỗi wait và lần release cuối cùng, nó đều giữ lock.

Một điều lạ cuối cùng: waiting thread re-checks condition trong while loop thay vì câu lệnh if đơn giản. Chúng ta sẽ bàn kỹ khi nghiên cứu condition variable ở chương sau, nhưng nói chung dùng while loop là cách đơn giản và an toàn. Dù nó kiểm tra lại condition (có thể tăng chút overhead), một số triển khai pthread có thể đánh thức waiting thread một cách spurious; lúc đó, nếu không kiểm tra lại, waiting thread sẽ tiếp tục vì tưởng condition đã thay đổi dù thực tế chưa. Vì vậy an toàn hơn khi xem việc được đánh thức là gợi ý rằng có thể đã có thay đổi, thay vì sự thật tuyệt đối.

Lưu ý đôi khi bạn muốn dùng flag đơn giản để signal giữa hai thread, thay vì condition variable và lock liên quan. Chẳng hạn, chúng ta có thể viết lại code chờ ở trên thành:

```
while (ready == 0)
    ; // spin
```

Code signaling tương ứng sẽ như sau:

```
ready = 1;
```

Đừng bao giờ làm vậy, vì các lý do sau. Thứ nhất, hiệu năng kém trong nhiều trường hợp (spin lâu chỉ lãng phí CPU cycle). Thứ hai, dễ sai. Nghiên cứu gần đây [X+10] cho thấy cực kỳ dễ mắc lỗi khi dùng flag (như trên) để đồng bộ các thread; trong nghiên cứu đó, khoảng nửa số lần dùng synchronization tùy biến như vậy có bug! Đừng lười; hãy dùng condition variable ngay cả khi tưởng có thể không cần.

Nếu condition variable nghe khó hiểu, đừng quá lo (lúc này) – chúng ta sẽ trình bày rất chi tiết ở chương sau. Trước đó, chỉ cần biết chúng tồn tại và có hình dung cách dùng cùng lý do sử dụng là đủ.

## 27.5 Compile và chạy

Mọi ví dụ code trong chương tương đối dễ chuẩn bị và chạy. Để compile, bạn phải include header pthread.h trong code. Trên dòng link, cũng phải link tường minh với thư viện pthreads bằng cách thêm flag -pthread.

Chẳng hạn, để compile chương trình multi-threaded đơn giản, bạn chỉ cần làm như sau:

```
prompt> gcc -o main main.c -Wall -pthread
```

Miễn là main.c include header pthreads, giờ bạn đã compile thành công chương trình concurrent. Như thường lệ, nó hoạt động hay không lại là chuyện hoàn toàn khác.

## 27.6 Tổng kết

Chúng ta đã giới thiệu kiến thức cơ bản của thư viện pthread, gồm tạo thread, xây dựng mutual exclusion bằng lock, signal và chờ bằng condition variable. Bạn không cần thêm nhiều thứ để viết code multi-threaded vững chắc và hiệu quả, ngoài kiên nhẫn và rất nhiều cẩn trọng!

Chúng ta kết thúc chương bằng các mẹo hữu ích khi viết code multi-threaded (xem phần bên lề trang tiếp theo để biết chi tiết). API còn nhiều khía cạnh thú vị khác; nếu muốn biết thêm, gõ man -k pthread trên Linux để xem hơn một trăm API tạo nên toàn bộ interface. Tuy nhiên, kiến thức cơ bản ở đây đủ giúp bạn xây dựng chương trình multi-threaded tinh vi (hy vọng đúng và hiệu năng tốt). Phần khó của thread nằm ở logic rắc rối khi xây dựng chương trình concurrent, không phải API. Hãy đọc tiếp để tìm hiểu.

> BÊN LỀ: HƯỚNG DẪN THREAD API
>
> Có một số điều nhỏ nhưng quan trọng cần nhớ khi dùng thư viện POSIX thread (hoặc bất kỳ thư viện thread nào) để xây dựng chương trình multi-threaded. Đó là:
>
> • Giữ đơn giản. Trên hết, code lock hoặc signal giữa các thread nên đơn giản nhất có thể. Tương tác thread phức tạp dẫn đến bug.
>
> • Giảm thiểu tương tác thread. Cố giữ số cách thread tương tác ở mức tối thiểu. Mỗi tương tác phải được suy nghĩ cẩn thận và xây dựng bằng phương pháp đã được kiểm chứng (nhiều phương pháp sẽ được học ở các chương tới).
>
> • Khởi tạo lock và condition variable. Không làm vậy dẫn đến code lúc chạy được, lúc thất bại theo cách rất kỳ lạ.
>
> • Kiểm tra return code. Tất nhiên, với mọi chương trình C và UNIX, bạn nên kiểm tra từng return code, và ở đây cũng vậy. Không làm thế sẽ dẫn đến hành vi kỳ quặc khó hiểu, dễ khiến bạn (a) hét lên, (b) giật tóc mình, hoặc (c) cả hai.
>
> • Cẩn thận với cách truyền argument cho thread và trả về giá trị từ thread. Đặc biệt, bất cứ khi nào truyền reference tới biến cấp phát trên stack, có lẽ bạn đang làm sai.
>
> • Mỗi thread có stack riêng. Liên quan điểm trên, hãy nhớ mỗi thread có stack riêng. Do đó, nếu có biến locally-allocated bên trong hàm mà thread đang thực thi, về cơ bản nó riêng tư với thread đó; thread khác không thể (dễ dàng) truy cập. Để chia sẻ dữ liệu giữa các thread, giá trị phải nằm trong heap hoặc vị trí có thể truy cập toàn cục.
>
> • Luôn dùng condition variable để signal giữa các thread. Dù thường muốn dùng flag đơn giản, đừng làm vậy.
>
> • Sử dụng manual page. Đặc biệt trên Linux, pthread man page rất giàu thông tin và bàn nhiều điểm tinh tế trình bày ở đây, thường chi tiết hơn. Hãy đọc kỹ!

## Tài liệu tham khảo

[B89] “An Introduction to Programming with Threads”

Andrew D. Birrell

DEC Technical Report,January, 1989

Có tại: https://birrell.org/andrew/papers/035-Threads.pdf

Phần giới thiệu kinh điển nhưng đã cũ về lập trình thread. Vẫn đáng đọc và có sẵn miễn phí.

[B97] “Programming with POSIX Threads”

David R. Butenhof

Addison-Wesley, May 1997

Một cuốn sách nữa về thread.

[B+96] “PThreads Programming: A POSIX Standard for Better Multiprocessing”

Dick Buttlar, Jacqueline Farrell, Bradford Nichols

O’Reilly, September 1996

Một cuốn sách khá tốt từ nhà xuất bản O’Reilly thực tiễn và xuất sắc. Giá sách của chúng tôi chắc chắn có rất nhiều sách của hãng này, gồm những cuốn tuyệt vời về Perl, Python và Javascript (đặc biệt “Javascript: The Good Parts” của Crockford.)

[K+96] “Programming With Threads”

Steve Kleiman, Devang Shah, Bart Smaalders

Prentice Hall, January 1996

Có lẽ là một trong những sách tốt hơn về chủ đề này. Hãy tìm ở thư viện địa phương. Hoặc lấy trộm của mẹ bạn. Nghiêm túc hơn, chỉ cần hỏi mẹ – bà sẽ cho mượn, đừng lo.

[X+10] “Ad Hoc Synchronization Considered Harmful”

Weiwei Xiong, Soyeon Park, Jiaqi Zhang, Yuanyuan Zhou, Zhiqiang Ma

OSDI 2010, Vancouver, Canada

Bài báo này cho thấy code synchronization tưởng đơn giản có thể dẫn đến số bug đáng ngạc nhiên. Hãy dùng condition variable và signal cho đúng!

---

[^1]: Lưu ý chúng ta dùng wrapper function ở đây; cụ thể là gọi Malloc(), Pthread_join() và Pthread_create(), chỉ gọi các phiên bản lower-case similarly-named tương ứng và bảo đảm routine không trả về điều bất ngờ.

[^2]: May thay, compiler gcc có thể cảnh báo khi bạn viết code như vậy, thêm một lý do để chú ý compiler warning.

[^3]: Lưu ý có thể dùng pthread_cond_init() (và lời gọi pthread_cond_destroy() tương ứng) thay cho static initializer PTHREAD_COND_INITIALIZER. Nghe có vẻ nhiều việc hơn? Đúng vậy.
