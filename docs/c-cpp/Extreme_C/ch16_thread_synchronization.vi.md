<a id="_idParaDest-214"></a>

# Chương 16: Thread Synchronization

Trong chương trước, chúng tôi đã giải thích cách tạo và quản lý một POSIX thread. Chúng tôi cũng đã minh họa hai trong số các vấn đề concurrency phổ biến nhất: race condition và data race.

Trong chương này, chúng ta sẽ hoàn tất thảo luận về lập trình multithreaded dùng library POSIX threading và cung cấp cho bạn các kỹ năng cần thiết để kiểm soát một số thread.

Nếu bạn còn nhớ từ *Chương 14*, *Synchronization*, chúng tôi đã cho thấy rằng các vấn đề concurrency-related thực ra không phải là vấn đề; thay vào đó, chúng là hệ quả của các thuộc tính cơ bản của một hệ thống concurrent. Do đó, bạn có khả năng gặp chúng trong bất kỳ hệ thống concurrent nào.

Chúng tôi đã cho thấy trong chương trước rằng chúng ta thực sự có thể tạo ra những vấn đề như vậy với library POSIX threading. *Ví dụ 15.2* và *15.3* từ chương trước đã minh họa các vấn đề race condition và data race. Do đó, chúng sẽ là điểm khởi đầu của chúng ta để dùng các cơ chế synchronization được library pthread cung cấp nhằm đồng bộ hóa một số thread.

Trong chương này, chúng ta sẽ trình bày các chủ đề sau:

- Dùng POSIX mutex để bảo vệ các critical section truy cập một tài nguyên dùng chung.
- Dùng POSIX condition variable để chờ một điều kiện cụ thể.
- Dùng các loại lock khác nhau cùng với mutex và condition variable.
- Dùng POSIX barrier và cách chúng có thể giúp đồng bộ hóa một số thread.
- Khái niệm semaphore và đối tượng tương ứng của nó trong library pthread: POSIX semaphore. Bạn sẽ phát hiện ra rằng mutex chỉ là các binary semaphore.
- Cấu trúc memory của một thread và cấu trúc này có thể ảnh hưởng đến memory visibility trong một hệ thống multi-core như thế nào.

Chúng ta bắt đầu chương này với một thảo luận chung về concurrency control. Các phần sau cung cấp cho bạn các công cụ và cấu trúc cần thiết để viết các chương trình multithreaded well-behaved (hoạt động đúng đắn).

<a id="_idParaDest-215"></a>

## POSIX concurrency control

Trong phần này, chúng ta sẽ<a id="_idIndexMarker1104"></a> xem xét các cơ chế kiểm soát khả dĩ được library pthread cung cấp. Semaphore, mutex và condition variable cùng với các loại lock khác nhau được dùng theo nhiều tổ hợp khác nhau để mang lại tính tất định cho các chương trình multithreaded. Trước tiên, chúng ta bắt đầu với POSIX mutex.

<a id="_idParaDest-216"></a>

### POSIX mutex

Các mutex được giới thiệu<a id="_idIndexMarker1105"></a> trong library pthread có thể được dùng để đồng bộ hóa cả process lẫn thread. Trong phần này, chúng ta sẽ dùng chúng trong một chương trình C multithreaded để đồng bộ hóa một số thread.

Để nhắc lại, một mutex là một semaphore chỉ cho phép một thread tại một thời điểm đi vào critical section. Nói chung, một semaphore có khả năng cho phép nhiều hơn một thread đi vào critical section của nó.

> **Lưu ý**:
>
> Mutex cũng<a id="_idIndexMarker1106"></a> được gọi là *binary semaphore* vì chúng là các semaphore chỉ chấp nhận hai trạng thái.

Chúng ta bắt đầu phần này bằng việc giải quyết vấn đề data race đã quan sát được trong *ví dụ 15.3* ở chương trước, dùng một POSIX mutex. Mutex chỉ cho phép một thread tại một thời điểm đi vào critical section và thực hiện các thao tác đọc và ghi trên biến dùng chung. Bằng cách này, nó bảo đảm data integrity của biến dùng chung. Code box sau chứa giải pháp cho vấn đề data race:

```
#include <stdio.h>
#include <stdlib.h>
// The POSIX standard header for using pthread library
#include <pthread.h>
// The mutex object used to synchronize the access to
// the shared state.
pthread_mutex_t mtx;
void* thread_body_1(void* arg) {
  // Obtain a pointer to the shared variable
  int* shared_var_ptr = (int*)arg;
  // Critical section
  pthread_mutex_lock(&mtx);
  (*shared_var_ptr)++;
  printf("%d\n", *shared_var_ptr);
  pthread_mutex_unlock(&mtx);
  return NULL;
}
void* thread_body_2(void* arg) {
  int* shared_var_ptr = (int*)arg;
  // Critical section
  pthread_mutex_lock(&mtx);
  *shared_var_ptr += 2;
  printf("%d\n", *shared_var_ptr);
  pthread_mutex_unlock(&mtx);
  return NULL;
}
int main(int argc, char** argv) {
  // The shared variable
  int shared_var = 0;
  // The thread handlers
  pthread_t thread1;
  pthread_t thread2;
  // Initialize the mutex and its underlying resources
  pthread_mutex_init(&mtx, NULL);
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
  pthread_mutex_destroy(&mtx);
  return 0;
}
```

*Code Box 16-1 [ExtremeC_examples_chapter15_3_mutex.c]: Dùng một POSIX mutex để giải quyết vấn đề data race được tìm thấy trong ví dụ 15.3 ở chương trước*

Nếu bạn biên dịch code trên và chạy nó bao nhiêu lần tùy thích, bạn sẽ chỉ thấy `1 3` hay `2 3` trong output. Đó là vì chúng ta đang dùng một đối tượng POSIX mutex để đồng bộ hóa các critical section trong code trên.

Ở đầu<a id="_idIndexMarker1107"></a> file, chúng ta đã khai báo một đối tượng POSIX mutex global là `mtx`. Sau đó bên trong hàm `main`, chúng ta đã khởi tạo mutex với các attribute mặc định bằng hàm `pthread_mutex_init`. Argument thứ hai, là `NULL`, có thể là các attribute tùy chỉnh được lập trình viên chỉ định. Chúng ta sẽ đi qua một ví dụ về cách đặt những attribute này trong các phần sắp tới.

Mutex được dùng trong cả hai thread để bảo vệ các critical section được bao giữa các câu lệnh `pthread_mutex_lock(&mtx)` và `pthread_mutex_unlock(&mtx)`.

Cuối cùng, trước khi rời hàm `main`, chúng ta hủy đối tượng mutex.

Cặp câu lệnh `pthread_mutex_lock(&mtx)` và `pthread_mutex_unlock(&mtx)` thứ nhất, trong companion function `thread_body_1`, tạo nên critical section cho thread thứ nhất. Ngoài ra, cặp thứ hai trong companion function `thread_body_2` tạo nên critical section cho thread thứ hai. Cả hai critical section đều được mutex bảo vệ, và tại mỗi thời điểm, chỉ một trong các thread có thể ở trong critical section của nó và thread kia nên chờ bên ngoài critical section của mình cho đến khi thread đang bận rời đi.

Ngay khi một thread đi vào critical section, nó lock mutex, và thread kia nên chờ phía sau câu lệnh `pthread_mutex_lock(&mtx)` để mutex được unlock lại.

Theo mặc định, một thread<a id="_idIndexMarker1109"></a> đang chờ một mutex trở nên unlocked đi vào chế độ ngủ và không thực hiện *busy-wait*. Nhưng nếu chúng ta muốn thực hiện *busy-waiting* thay vì đi ngủ thì sao? Khi đó chúng ta<a id="_idIndexMarker1110"></a> có thể dùng một *spinlock*. Chỉ cần <a id="_idIndexMarker1111"></a>dùng các hàm sau thay cho mọi hàm mutex-related ở trên là đủ. May mắn thay, pthread dùng một quy ước nhất quán trong việc đặt tên các hàm.

Các kiểu và hàm spinlock-related<a id="_idIndexMarker1112"></a> như sau.

- `pthread_spin_t`: Kiểu được dùng để tạo một đối tượng spinlock. Nó tương tự kiểu `pthread_mutex_t`.
- `pthread_spin_init`: Khởi tạo một đối tượng spinlock. Nó tương tự `pthread_mutex_init`.
- `pthread_spin_destroy`: Tương tự `pthread_mutex_destory`.
- `pthread_spin_lock`: Tương tự `pthread_mutex_lock`.
- `pthread_spin_unlock`: Tương tự `pthread_mutex_unlock`.

Như bạn thấy, khá dễ dàng chỉ cần thay các kiểu và hàm mutex trên bằng các kiểu và hàm spinlock để có một hành vi khác, trong trường hợp này là busy-waiting, trong khi chờ một đối tượng mutex được giải phóng.

Trong phần này, chúng tôi đã giới thiệu POSIX mutex và cách chúng có thể được dùng để giải quyết một vấn đề data race. Trong phần tiếp theo, chúng tôi sẽ minh họa cách dùng một condition variable để chờ một sự kiện nhất định xảy ra. Chúng ta sẽ đề cập race condition đã xảy ra trong *ví dụ 15.2*, nhưng chúng ta sẽ thực hiện một số sửa đổi cho ví dụ ban đầu.

<a id="_idParaDest-217"></a>

### POSIX condition variable

Nếu bạn còn nhớ từ *ví dụ 15.2* trong chương trước<a id="_idIndexMarker1113"></a>, chúng ta đã đối mặt với một race condition. Giờ, chúng ta muốn đưa ra một ví dụ mới rất giống *ví dụ 15.2*, nhưng là một ví dụ mà việc dùng condition variable sẽ đơn giản hơn. *Ví dụ 16.1* có hai thread thay vì ba (vốn là trường hợp của *ví dụ 15.2*), và chúng được yêu cầu in các ký tự `A` và `B` ra output, nhưng chúng ta muốn chúng luôn theo một thứ tự cụ thể; trước tiên là `A` rồi đến `B`.

Invariant constraint của chúng ta cho ví dụ này là *thấy A trước rồi đến B trong output* (cộng với data integrity cho mọi shared state, không có truy cập memory tồi tệ, không có dangling pointer, không có crash, và các ràng buộc hiển nhiên khác). Code sau minh họa cách chúng ta dùng một condition variable để đưa ra một giải pháp hoạt động được viết bằng C cho ví dụ này:

```
#include <stdio.h>
#include <stdlib.h>
// The POSIX standard header for using pthread library
#include <pthread.h>
#define TRUE  1
#define FALSE 0
typedef unsigned int bool_t;
// A structure for keeping all the variables related
// to a shared state
typedef struct {
  // The flag which indicates whether 'A' has been printed or not
  bool_t          done;
  // The mutex object protecting the critical sections
  pthread_mutex_t mtx;
  // The condition variable used to synchronize two threads
  pthread_cond_t  cv;
} shared_state_t;
// Initializes the members of a shared_state_t object
void shared_state_init(shared_state_t *shared_state) {
  shared_state->done = FALSE;
  pthread_mutex_init(&shared_state->mtx, NULL);
  pthread_cond_init(&shared_state->cv, NULL);
}
// Destroy the members of a shared_state_t object
void shared_state_destroy(shared_state_t *shared_state) {
  pthread_mutex_destroy(&shared_state->mtx);
  pthread_cond_destroy(&shared_state->cv);
}
void* thread_body_1(void* arg) {
  shared_state_t* ss = (shared_state_t*)arg;
  pthread_mutex_lock(&ss->mtx);
  printf("A\n");
  ss->done = TRUE;
  // Signal the threads waiting on the condition variable
  pthread_cond_signal(&ss->cv);
  pthread_mutex_unlock(&ss->mtx);
  return NULL;
}
void* thread_body_2(void* arg) {
  shared_state_t* ss = (shared_state_t*)arg;
  pthread_mutex_lock(&ss->mtx);
  // Wait until the flag becomes TRUE
  while (!ss->done) {
    // Wait on the condition variable
    pthread_cond_wait(&ss->cv, &ss->mtx);
  }
  printf("B\n");
  pthread_mutex_unlock(&ss->mtx);
  return NULL;
}
int main(int argc, char** argv) {
  // The shared state
  shared_state_t shared_state;
  // Initialize the shared state
  shared_state_init(&shared_state);
  // The thread handlers
  pthread_t thread1;
  pthread_t thread2;
  // Create new threads
  int result1 =
    pthread_create(&thread1, NULL, thread_body_1, &shared_state);
  int result2 =
    pthread_create(&thread2, NULL, thread_body_2, &shared_state);
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
  // Destroy the shared state and release the mutex
  // and condition variable objects
  shared_state_destroy(&shared_state);
  return 0;
}
```

*Code Box 16-2 [ExtremeC_examples_chapter16_1_cv.c]: Dùng một POSIX condition variable để quy định một thứ tự cụ thể giữa hai thread*

Trong code trên, việc dùng một structure để đóng gói mutex dùng chung, condition <a id="_idIndexMarker1115"></a>variable dùng chung và flag dùng chung vào một thực thể duy nhất là tốt. Lưu ý rằng chúng ta chỉ có thể truyền một pointer duy nhất cho mỗi thread. Do đó, chúng ta phải gom các biến dùng chung cần thiết vào một biến structure duy nhất.

Là định nghĩa kiểu thứ hai (sau `bool_t`) trong ví dụ, chúng ta đã định nghĩa một kiểu mới, `shared_state_t`, như sau:

```
typedef struct {
  bool_t          done;
  pthread_mutex_t mtx;
  pthread_cond_t  cv;
} shared_state_t;
```

*Code Box 16-3: Đặt mọi biến dùng chung cần cho ví dụ 16.1 vào một structure*

Sau các định nghĩa kiểu, chúng ta đã định nghĩa hai hàm để khởi tạo và hủy các instance `shared_state_t`. Chúng có thể được coi lần lượt là các hàm *constructor* và *destructor* cho kiểu `shared_state_t`. Để đọc thêm về các hàm constructor và destructor, hãy tham khảo *Chương 6*, *OOP và Encapsulation*.

Đây là cách chúng ta dùng một<a id="_idIndexMarker1116"></a> condition variable. Một thread có thể *wait* (hay *sleep*) trên một condition variable, và sau đó trong tương lai, nó được thông báo để thức dậy. Hơn thế nữa, một thread có thể *notify* (hay *wake up*) mọi thread khác đang chờ (hay đang ngủ) trên một condition variable. Mọi thao tác này *phải* được bảo vệ bởi một mutex, và đó là lý do tại sao bạn nên luôn dùng một condition variable cùng với một mutex.

Chúng ta đã làm đúng như vậy trong code trên. Trong đối tượng shared state của mình, chúng ta có một condition variable, cùng với một mutex đồng hành được dự định bảo vệ condition variable. Để nhấn mạnh lần nữa, một condition variable được dự định chỉ được dùng trong các critical section được bảo vệ bởi mutex đồng hành của nó.

Vậy, điều gì xảy ra trong code trên? Trong thread được dự định in `A`, nó cố lock mutex `mtx` bằng một pointer tới đối tượng shared state. Khi lock đã được acquire, thread in `A`, nó đặt flag `done`, và cuối cùng nó thông báo cho thread kia, vốn có thể đang chờ trên condition variable `cv`, bằng cách gọi hàm `pthread_cond_signal`.

Mặt khác, nếu trong lúc đó thread thứ hai trở nên hoạt động và thread thứ nhất chưa in `A`, thread thứ hai cố acquire lock trên `mtx`. Nếu thành công, nó kiểm tra flag `done`, và nếu nó là false, điều đó đơn giản có nghĩa là thread thứ nhất chưa đi vào critical section của nó (nếu không flag hẳn đã là true). Do đó, thread thứ hai chờ trên condition variable và ngay lập tức giải phóng CPU bằng cách gọi hàm `pthread_cond_wait`.

Rất quan trọng cần lưu ý rằng khi chờ trên một condition variable, mutex liên kết được giải phóng và thread kia có thể tiếp tục. Ngoài ra, khi trở nên hoạt động và thoát khỏi trạng thái chờ, mutex liên kết nên được acquire lại. Để thực hành tốt về condition variable, bạn có thể đi qua các interleaving khả dĩ khác.

> **Lưu ý**:
>
> Hàm `pthread_cond_signal` chỉ có thể<a id="_idIndexMarker1117"></a> được dùng để thông báo cho đúng một thread duy nhất. Nếu bạn định thông báo cho mọi thread đang chờ một condition variable, bạn phải dùng hàm `pthread_cond_broadcast`. Chúng tôi sẽ đưa ra một ví dụ về điều này ngay sau đây.

Nhưng tại sao chúng ta lại dùng một vòng lặp `while` để kiểm tra flag `done` khi nó có thể là một câu lệnh `if` đơn giản? Đó là vì thread thứ hai có thể được thông báo bởi các nguồn khác chứ không chỉ thread thứ nhất. Trong những trường hợp đó, nếu thread có thể có được lock trên mutex của nó khi thoát khỏi việc chờ và trở nên hoạt động lần nữa, nó có thể kiểm tra điều kiện của vòng lặp, và nếu điều kiện chưa được đáp ứng, nó nên chờ lần nữa. Chờ một condition variable bên trong một vòng lặp, cho đến khi điều kiện của nó khớp với những gì chúng ta đang chờ, là một kỹ thuật được chấp nhận.

Giải pháp trên cũng thỏa mãn ràng buộc memory visibility. Như chúng tôi đã giải thích trong các chương trước, mọi thao tác lock và unlock đều có khả năng kích hoạt một memory coherence<a id="_idIndexMarker1118"></a> giữa các lõi CPU khác nhau; do đó, các giá trị thấy được trong các phiên bản cache khác nhau của flag `done` luôn là mới nhất và bằng nhau.

Vấn đề race condition quan sát được trong các ví dụ 15.2 và 16.1 (trong trường hợp không có cơ chế kiểm soát nào được áp dụng), cũng có thể được giải quyết bằng POSIX barrier. Trong phần tiếp theo, chúng ta sẽ nói về chúng và viết lại *ví dụ 16.1* bằng một cách tiếp cận khác.

<a id="_idParaDest-218"></a>

### POSIX barrier

POSIX barrier dùng một cách tiếp cận khác <a id="_idIndexMarker1119"></a>để đồng bộ hóa một số thread. Giống như một nhóm người đang lên kế hoạch thực hiện một số tác vụ song song và tại một số điểm cần gặp nhau, tổ chức lại và tiếp tục, điều tương tự có thể xảy ra với thread (hay thậm chí process). Một số thread làm tác vụ của chúng nhanh hơn, và những thread khác chậm hơn. Nhưng có thể có một checkpoint (hay điểm hẹn) mà tại đó mọi thread phải dừng và chờ các thread khác tham gia. Những checkpoint này có thể được mô phỏng bằng *POSIX barrier*.

Code sau dùng barrier để đề xuất một giải pháp cho các vấn đề thấy trong *ví dụ 16.1*. Để nhắc lại, trong *ví dụ 16.1*, chúng ta có hai thread. Một trong số chúng để `print A`, và thread kia để `print B`, và chúng ta muốn luôn thấy `A` trước và `B` sau trong output, bất kể các interleaving khác nhau:

```
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
// The barrier object
pthread_barrier_t barrier;
void* thread_body_1(void* arg) {
  printf("A\n");
  // Wait for the other thread to join
  pthread_barrier_wait(&barrier);
  return NULL;
}
void* thread_body_2(void* arg) {
  // Wait for the other thread to join
  pthread_barrier_wait(&barrier);
  printf("B\n");
  return NULL;
}
int main(int argc, char** argv) {
  // Initialize the barrier object
  pthread_barrier_init(&barrier, NULL, 2);
  // The thread handlers
  pthread_t thread1;
  pthread_t thread2;
  // Create new threads
  int result1 = pthread_create(&thread1, NULL,
          thread_body_1, NULL);
  int result2 = pthread_create(&thread2, NULL,
          thread_body_2, NULL);
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
  // Destroy the barrier object
  pthread_barrier_destroy(&barrier);
  return 0;
}
```

*Code Box 16-4 [ExtremeC_examples_chapter16_1_barrier.c]: Một giải pháp cho ví dụ 16.1 dùng POSIX barrier*

Như bạn có thể thấy, code trên nhỏ hơn nhiều so với code chúng ta đã viết bằng condition variable. Dùng POSIX barrier, sẽ rất dễ dàng đồng bộ hóa một số thread tại một số điểm nhất định trong quá trình thực thi của chúng.

Trước tiên, chúng ta đã khai báo<a id="_idIndexMarker1120"></a> một đối tượng barrier global kiểu `pthread_barrier_t`. Sau đó, bên trong hàm `main`, chúng ta đã khởi tạo đối tượng barrier bằng <a id="_idIndexMarker1121"></a>hàm `pthread_barrier_init`.

Argument thứ nhất là một pointer tới đối tượng barrier. Argument thứ hai là các attribute tùy chỉnh của đối tượng barrier. Vì chúng ta đang truyền `NULL`, điều đó có nghĩa là đối tượng barrier sẽ được khởi tạo bằng các giá trị mặc định cho các attribute của nó. Argument thứ ba quan trọng; nó là số thread cần trở nên chờ trên cùng đối tượng barrier bằng cách gọi hàm `pthread_barrier_wait` và chỉ sau đó tất cả chúng mới được giải phóng và được phép tiếp tục.

Với ví dụ trên, chúng ta đặt nó là 2. Do đó, chỉ khi có hai thread đang chờ trên đối tượng barrier, cả hai mới được bỏ chặn và có thể tiếp tục. Phần còn lại của code khá giống các ví dụ trước, và đã được giải thích trong phần trước.

Một đối tượng barrier có thể được hiện thực bằng một mutex và một condition variable tương tự những gì chúng ta đã làm trong phần trước. Thực tế, một hệ điều hành POSIX-compliant không cung cấp thứ gì như barrier trong system call interface của nó, và hầu hết các hiện thực được tạo bằng một mutex và một condition variable.

Về cơ bản đó là lý do tại sao một số hệ điều hành như macOS không cung cấp hiện thực cho POSIX barrier. Code trên không thể được biên dịch trên một máy macOS vì các hàm POSIX barrier không được định nghĩa. Code trên đã được kiểm thử trên cả Linux và FreeBSD và hoạt động trên cả hai. Do đó, hãy cẩn thận khi dùng barrier, vì việc dùng chúng làm cho code của bạn kém portable hơn.

> Việc macOS không cung cấp các hàm POSIX barrier đơn giản có nghĩa là nó chỉ POSIX-compliant một phần và các chương trình dùng barrier (vốn dĩ nhiên là chuẩn) không thể được biên dịch trên các máy macOS. Điều này đi ngược lại triết lý C, đó là *viết một lần, và biên dịch ở bất cứ đâu*.

Lưu ý cuối cùng trong phần này, POSIX barrier bảo đảm memory visibility. Tương tự các thao tác lock và unlock, việc chờ trên barrier bảo đảm rằng mọi phiên bản cache của cùng một biến đều được đồng bộ hóa giữa các thread khác nhau khi chúng sắp rời điểm barrier.

Trong phần tiếp theo, chúng tôi<a id="_idIndexMarker1122"></a> sẽ đưa ra một ví dụ về semaphore. Chúng không thường được dùng trong việc phát triển concurrent, nhưng chúng có những cách dùng đặc biệt riêng.

Một loại semaphore cụ thể, binary semaphore (được gọi thay thế cho nhau là mutex), được dùng thường xuyên và bạn đã thấy một số ví dụ liên quan đến nó trong các phần trước.

<a id="_idParaDest-219"></a>

### POSIX semaphore

Trong hầu hết các trường hợp, mutex (hay *binary semaphore*) là<a id="_idIndexMarker1123"></a> đủ để đồng bộ hóa một số thread truy cập một tài nguyên dùng chung. Đó là vì, để<a id="_idIndexMarker1124"></a> thực hiện các thao tác đọc và ghi một cách tuần tự, chỉ <a id="_idIndexMarker1125"></a>một thread nên có thể đi vào critical section tại một thời điểm. Nó được biết đến là *mutual exclusion*, do đó có tên "mutex".

Tuy nhiên, trong một số kịch bản, bạn có thể muốn có nhiều hơn một thread đi vào critical<a id="_idIndexMarker1126"></a> section và thao tác trên tài nguyên dùng chung. Đây là kịch bản mà bạn nên dùng *general semaphore* (semaphore tổng quát).

Trước khi chúng ta đi vào một ví dụ về general semaphore, hãy đưa ra một ví dụ về một binary semaphore (hay một mutex). Chúng ta sẽ không dùng các hàm `pthread_mutex_*` trong ví dụ này; thay vào đó, chúng ta sẽ dùng các hàm `sem_*` vốn được dự định phơi ra các chức năng semaphore-related.

#### Binary semaphore

Code sau là <a id="_idIndexMarker1127"></a>giải pháp được tạo bằng semaphore cho *ví dụ 15.3*. Để nhắc lại, nó gồm hai thread; mỗi thread tăng một số nguyên dùng chung bằng một giá trị khác nhau. Chúng ta muốn bảo vệ data integrity của biến dùng chung. Lưu ý rằng chúng ta sẽ không dùng POSIX mutex trong code sau:

```
#include <stdio.h>
#include <stdlib.h>
// The POSIX standard header for using pthread library
#include <pthread.h>
// The semaphores are not exposed through pthread.h
#include <semaphore.h>
// The main pointer addressing a semaphore object used
// to synchronize the access to the shared state.
sem_t *semaphore;
void* thread_body_1(void* arg) {
  // Obtain a pointer to the shared variable
  int* shared_var_ptr = (int*)arg;
  // Waiting for the semaphore
  sem_wait(semaphore);
  // Increment the shared variable by 1 by writing directly
  // to its memory address
  (*shared_var_ptr)++;
  printf("%d\n", *shared_var_ptr);
  // Release the semaphore
  sem_post(semaphore);
  return NULL;
}
void* thread_body_2(void* arg) {
  // Obtain a pointer to the shared variable
  int* shared_var_ptr = (int*)arg;
  // Waiting for the semaphore
  sem_wait(semaphore);
  // Increment the shared variable by 1 by writing directly
  // to its memory address
  (*shared_var_ptr) += 2;
  printf("%d\n", *shared_var_ptr);
  // Release the semaphore
  sem_post(semaphore);
  return NULL;
}
int main(int argc, char** argv) {
  // The shared variable
  int shared_var = 0;
  // The thread handlers
  pthread_t thread1;
  pthread_t thread2;
#ifdef __APPLE__
  // Unnamed semaphores are not supported in OS/X. Therefore
  // we need to initialize the semaphore like a named one using
  // sem_open function.
  semaphore = sem_open("sem0", O_CREAT | O_EXCL, 0644, 1);
#else
  sem_t local_semaphore;
  semaphore = &local_semaphore;
  // Initiliaze the semaphore as a mutex (binary semaphore)
  sem_init(semaphore, 0, 1);
#endif
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
#ifdef __APPLE__
  sem_close(semaphore);
#else
  sem_destroy(semaphore);
#endif
  return 0;
}
```

*Code Box 16-5 [ExtremeC_examples_chapter15_3_sem.c]: Một giải pháp cho ví dụ 15.3 dùng POSIX semaphore*

Điều đầu tiên bạn có thể để ý trong code trên là các hàm semaphore khác nhau mà chúng ta đã dùng trong các hệ thống Apple<a id="_idIndexMarker1129"></a>. Trong các hệ điều hành Apple<a id="_idIndexMarker1130"></a> (macOS, OS X và iOS), *unnamed semaphore* (semaphore không tên) không được hỗ trợ. Do đó, chúng ta không thể chỉ dùng các hàm `sem_init` và `sem_destroy`. Unnamed semaphore không có tên (thật đáng ngạc nhiên) và chúng chỉ có thể được dùng bên trong một process, bởi một số thread. Mặt khác, named semaphore là system-wide (toàn hệ thống) và có thể được thấy và dùng bởi các process khác nhau trong hệ thống.

Trong các hệ thống Apple, các hàm cần thiết để tạo unnamed semaphore được đánh dấu là deprecated, và đối tượng semaphore sẽ không được khởi tạo bởi `sem_init`. Vì vậy, chúng ta phải dùng các hàm `sem_open` và `sem_close` để định nghĩa named semaphore thay vào đó.

Named semaphore được dùng để đồng bộ hóa process, và chúng tôi sẽ giải thích chúng trong *Chương 18*, *Process Synchronization*. Trong các hệ điều hành POSIX-compliant khác, cụ thể là Linux, chúng ta vẫn có thể dùng unnamed semaphore và để chúng lần lượt được khởi tạo và hủy bằng các hàm `sem_init` và `sem_destroy`.

Trong code trên, chúng ta đã include thêm một header file, `semaphore.h`. Như chúng tôi đã giải thích trước đây, semaphore đã được thêm vào như một phần mở rộng của library POSIX threading, và do đó, chúng không được phơi ra như một phần của header file `pthread.h`.

Sau các câu lệnh include header, chúng ta đã khai báo một pointer global tới một đối tượng semaphore. Pointer này sẽ trỏ tới một address phù hợp chỉ đối tượng semaphore thực sự. Chúng ta phải dùng một pointer ở đây vì, trong các hệ thống Apple, chúng ta phải dùng hàm `sem_open`, vốn trả về một pointer.

Sau đó, bên trong hàm `main`, và trong các hệ thống Apple, chúng ta tạo một named semaphore `sem0`. Trong các hệ điều hành POSIX-compliant khác, chúng ta khởi tạo semaphore bằng `sem_init`. Lưu ý rằng trong trường hợp này pointer `semaphore` trỏ tới biến `local_sempahore` được cấp phát trên đỉnh Stack của main thread. Pointer `semaphore` sẽ không trở thành một dangling pointer vì main thread không thoát và chờ các thread hoàn tất bằng cách join chúng.

Lưu ý rằng chúng ta có thể phân biệt giữa các hệ thống Apple và không phải Apple (not - Apple) bằng cách dùng macro `__APPLE__`. Đây là một macro được định nghĩa mặc định trong các C preprocessor được dùng trong các hệ thống Apple. Do đó, chúng ta có thể loại trừ code không được dự định biên dịch trên các hệ thống Apple bằng cách dùng macro này.

Hãy xem bên trong các thread. Trong các companion function, các critical section được bảo vệ bởi các hàm `sem_wait` và `sem_post`, lần lượt tương ứng với các hàm `pthread_mutex_lock` và `pthread_mutex_unlock` trong POSIX mutex API. Lưu ý rằng `sem_wait` có thể cho phép nhiều hơn một thread đi vào critical section.

Số lượng thread tối đa được phép ở trong critical section được xác định khi khởi tạo đối tượng semaphore. Chúng ta đã truyền giá trị `1` cho số lượng thread tối đa làm argument cuối cùng cho các hàm `sem_open` và `sem_init`; do đó, semaphore được dự định hoạt động như một mutex.

Để hiểu rõ hơn về semaphore, hãy đi sâu hơn một chút vào chi tiết. Mỗi đối tượng semaphore có một giá trị số nguyên. Bất cứ khi nào một thread chờ một semaphore bằng cách gọi hàm `sem_wait`, nếu giá trị của semaphore lớn hơn không, thì giá trị được giảm đi 1<a id="_idIndexMarker1131"></a> và thread được phép đi vào critical section. Nếu giá trị của semaphore là 0, thread phải chờ cho đến khi giá trị của semaphore trở thành dương lần nữa. Bất cứ khi nào một thread thoát khỏi critical section bằng cách gọi hàm `sem_post`, giá trị của semaphore được tăng thêm 1. Do đó, bằng việc chỉ định giá trị ban đầu `1`, rốt cuộc chúng ta sẽ có một binary semaphore.

Chúng ta kết thúc code trên bằng việc gọi `sem_destroy` (hay `sem_close` trong các hệ thống Apple), vốn thực chất giải phóng đối tượng semaphore cùng mọi tài nguyên bên dưới của nó. Về các named semaphore, vì chúng có thể được chia sẻ giữa một số process, các kịch bản phức tạp hơn có thể xảy ra khi đóng một semaphore. Chúng tôi sẽ trình bày những kịch bản này trong *Chương 18*, *Process Synchronization*.

#### General semaphore

Giờ, đã đến lúc đưa ra một ví dụ kinh điển<a id="_idIndexMarker1132"></a> dùng general semaphore. Cú pháp khá giống code trên, nhưng kịch bản trong đó <a id="_idIndexMarker1133"></a>nhiều thread được phép đi vào critical section có thể thú vị.

Ví dụ kinh điển này là về việc tạo ra 50 phân tử nước. Với 50 phân tử nước, bạn cần có 50 nguyên tử oxy và 100 nguyên tử hydro. Nếu chúng ta mô phỏng mỗi nguyên tử bằng một thread, chúng ta cần hai thread hydro và một thread oxy đi vào critical section của chúng để tạo ra một phân tử nước và đếm nó.

Trong code sau, trước tiên chúng ta tạo 50 thread oxy và 100 thread hydro. Để bảo vệ critical section của thread oxy, chúng ta dùng một mutex, nhưng đối với critical section của các thread hydro, chúng ta dùng một general semaphore cho phép hai thread đi vào critical section đồng thời.

Cho mục đích báo hiệu, chúng ta dùng POSIX barrier, nhưng vì barrier không được hiện thực trong các hệ thống Apple, chúng ta cần hiện thực chúng bằng mutex và condition variable. Code box sau chứa code:

```
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <errno.h> // For errno and strerror function
// The POSIX standard header for using pthread library
#include <pthread.h>
// Semaphores are not exposed through pthread.h
#include <semaphore.h>
#ifdef __APPLE__
// In Apple systems, we have to simulate the barrier functionality.
pthread_mutex_t barrier_mutex;
pthread_cond_t  barrier_cv;
unsigned int    barrier_thread_count;
unsigned int    barrier_round;
unsigned int    barrier_thread_limit;
void barrier_wait() {
  pthread_mutex_lock(&barrier_mutex);
  barrier_thread_count++;
  if (barrier_thread_count >= barrier_thread_limit) {
    barrier_thread_count = 0;
    barrier_round++;
    pthread_cond_broadcast(&barrier_cv);
  } else {
    unsigned int my_round = barrier_round;
    do {
      pthread_cond_wait(&barrier_cv, &barrier_mutex);
    } while (my_round == barrier_round);
  }
  pthread_mutex_unlock(&barrier_mutex);
}
#else
// A barrier to make hydrogen and oxygen threads synchronized
pthread_barrier_t water_barrier;
#endif
// A mutex in order to synchronize oxygen threads
pthread_mutex_t   oxygen_mutex;
// A general semaphore to make hydrogen threads synchronized
sem_t*            hydrogen_sem;
// A shared integer counting the number of made water molecules
unsigned int      num_of_water_molecules;
void* hydrogen_thread_body(void* arg) {
  // Two hydrogen threads can enter this critical section
  sem_wait(hydrogen_sem);
  // Wait for the other hydrogen thread to join
#ifdef __APPLE__
  barrier_wait();
#else
  pthread_barrier_wait(&water_barrier);
#endif
  sem_post(hydrogen_sem);
  return NULL;
}
void* oxygen_thread_body(void* arg) {
  pthread_mutex_lock(&oxygen_mutex);
  // Wait for the hydrogen threads to join
#ifdef __APPLE__
  barrier_wait();
#else
  pthread_barrier_wait(&water_barrier);
#endif
  num_of_water_molecules++;
  pthread_mutex_unlock(&oxygen_mutex);
  return NULL;
}
int main(int argc, char** argv) {
  num_of_water_molecules = 0;
  // Initialize oxygen mutex
  pthread_mutex_init(&oxygen_mutex, NULL);
  // Initialize hydrogen semaphore
#ifdef __APPLE__
  hydrogen_sem = sem_open("hydrogen_sem",
          O_CREAT | O_EXCL, 0644, 2);
#else
  sem_t local_sem;
  hydrogen_sem = &local_sem;
  sem_init(hydrogen_sem, 0, 2);
#endif
  // Initialize water barrier
#ifdef __APPLE__
  pthread_mutex_init(&barrier_mutex, NULL);
  pthread_cond_init(&barrier_cv, NULL);
  barrier_thread_count = 0;
  barrier_thread_limit = 0;
  barrier_round = 0;
#else
  pthread_barrier_init(&water_barrier, NULL, 3);
#endif
  // For creating 50 water molecules, we need 50 oxygen atoms and
  // 100 hydrogen atoms
  pthread_t thread[150];
  // Create oxygen threads
  for (int i = 0; i < 50; i++) {
    if (pthread_create(thread + i, NULL,
                oxygen_thread_body, NULL)) {
      printf("Couldn't create an oxygen thread.\n");
      exit(1);
    }
  }
  // Create hydrogen threads
  for (int i = 50; i < 150; i++) {
    if (pthread_create(thread + i, NULL,
                hydrogen_thread_body, NULL)) {
      printf("Couldn't create an hydrogen thread.\n");
      exit(2);
    }
  }
  printf("Waiting for hydrogen and oxygen atoms to react ...\n");
  // Wait for all threads to finish
  for (int i = 0; i < 150; i++) {
    if (pthread_join(thread[i], NULL)) {
      printf("The thread could not be joined.\n");
      exit(3);
    }
  }
  printf("Number of made water molecules: %d\n",
          num_of_water_molecules);
#ifdef __APPLE__
  sem_close(hydrogen_sem);
#else
  sem_destroy(hydrogen_sem);
#endif
  return 0;
}
```

*Code Box 16-6 [ExtremeC_examples_chapter16_2.c]: Dùng một general semaphore để mô phỏng quá trình tạo 50 phân tử nước từ 50 nguyên tử oxy và 100 nguyên tử hydro*

Ở đầu code, có <a id="_idIndexMarker1135"></a>một số dòng <a id="_idIndexMarker1136"></a>được bao bởi `#ifdef __APPLE__` và `#endif`. Những dòng này chỉ được biên dịch trong các hệ thống Apple. Những dòng này chủ yếu là hiện thực và các biến cần thiết để mô phỏng hành vi của POSIX barrier. Trong các hệ thống POSIX-compliant khác ngoài Apple, chúng ta dùng một POSIX barrier thông thường. Chúng tôi sẽ không đi qua chi tiết hiện thực barrier trên các hệ thống Apple ở đây, nhưng đáng để đọc code và hiểu nó kỹ lưỡng.

Là một phần của một số biến global được định nghĩa trong code trên, chúng ta đã khai báo mutex `oxygen_mutex`, được dự định bảo vệ critical section của các thread oxy. Tại mỗi thời điểm, chỉ một thread oxy (hay nguyên tử oxy) có thể đi vào critical section.

Sau đó trong critical section của nó, một thread oxy chờ hai thread hydro khác tham gia và sau đó nó tiếp tục tăng bộ đếm phân tử nước. Việc tăng diễn ra bên trong critical section của oxy.

Để giải thích thêm về<a id="_idIndexMarker1137"></a> những điều xảy ra bên trong các critical section, chúng ta cần giải thích vai trò của general semaphore. Trong code trên, chúng ta cũng đã khai báo general semaphore `hydrogen_sem`, được dự định bảo vệ critical section của các thread hydro. Tại mỗi thời điểm, chỉ tối đa hai thread hydro có thể đi vào critical section của chúng, và chúng chờ trên đối tượng barrier được chia sẻ giữa các thread oxy và hydro.

Khi số thread đang chờ trên đối tượng barrier dùng chung đạt đến hai, điều đó có nghĩa là chúng ta đã có một oxy và hai hydro, và rồi voilà: một phân tử nước được tạo ra, và mọi<a id="_idIndexMarker1138"></a> thread đang chờ có thể tiếp tục. Các thread hydro thoát ngay lập tức, nhưng thread oxy chỉ thoát sau khi tăng bộ đếm phân tử nước.

Chúng ta khép lại phần này với lưu ý cuối cùng này. Trong *ví dụ 16.2*, chúng ta đã dùng hàm `pthread_cond_broadcast` khi hiện thực các barrier cho các hệ thống Apple. Nó báo hiệu cho mọi thread đang chờ trên condition variable của barrier vốn được dự định tiếp tục sau khi có các thread khác tham gia.

Trong phần tiếp theo, chúng ta sẽ nói về memory model đằng sau POSIX thread và cách chúng tương tác với memory của process sở hữu. Chúng ta cũng sẽ xem các ví dụ về việc dùng các segment Stack và Heap và cách chúng có thể dẫn đến một số vấn đề memory-related nghiêm trọng.

<a id="_idParaDest-220"></a>

## POSIX thread và memory

Phần này sẽ nói về các tương tác giữa các thread và memory của process. Như bạn<a id="_idIndexMarker1139"></a> biết, có nhiều segment trong memory layout của một process. Segment Text, segment Stack, segment Data và segment Heap đều là một phần của<a id="_idIndexMarker1140"></a> memory layout này, và chúng ta đã trình bày chúng trong *Chương 4*, *Cấu trúc memory của process (Process Memory Structure)*. Các thread tương tác khác nhau với mỗi memory segment này. Trong phần này, chúng ta chỉ thảo luận các vùng memory Stack và Heap vì chúng là những vùng được dùng nhiều nhất và gây vấn đề nhiều nhất khi viết các chương trình multithreaded.

Ngoài ra, chúng ta thảo luận việc thread synchronization và một sự hiểu biết thực sự về memory model đằng sau một thread có thể giúp chúng ta phát triển các chương trình concurrent tốt hơn như thế nào. Những khái niệm này càng rõ ràng hơn đối với memory Heap vì việc quản lý memory ở đó là thủ công và trong một hệ thống concurrent, các thread chịu trách nhiệm cấp phát và giải phóng các khối Heap. Một race condition tầm thường có thể gây ra các vấn đề memory nghiêm trọng, do đó synchronization phù hợp nên được áp dụng để tránh những thảm họa như vậy.

Trong tiểu mục tiếp theo, chúng tôi sẽ giải thích segment Stack được các thread khác nhau truy cập như thế nào và những biện pháp phòng ngừa nào nên được thực hiện.

<a id="_idParaDest-221"></a>

### Memory Stack

Mỗi thread có vùng Stack riêng được dự định là private chỉ với thread đó. Vùng Stack của một thread là một phần của<a id="_idIndexMarker1142"></a> segment Stack của process sở hữu và mọi thread, theo mặc định, nên có vùng Stack của chúng được cấp phát từ segment Stack. Cũng có thể một thread có một vùng Stack được cấp phát từ segment Heap. Chúng tôi sẽ cho thấy trong các ví dụ sau cách làm điều này, nhưng lúc này, chúng ta giả định rằng Stack của một thread là một phần của segment Stack của process.

Vì mọi thread bên trong cùng một process đều có thể đọc và sửa đổi segment Stack của process, chúng thực chất có thể đọc và sửa đổi vùng Stack của nhau, nhưng chúng *không nên*. Lưu ý rằng việc làm việc với vùng Stack của các thread khác được coi là hành vi nguy hiểm vì các biến được định nghĩa trên đỉnh các vùng Stack khác nhau có thể bị giải phóng bất cứ lúc nào, đặc biệt khi một thread thoát hay một hàm trả về.

Đó là lý do tại sao chúng ta cố<a id="_idIndexMarker1143"></a> giả định rằng một vùng Stack chỉ có thể được thread sở hữu truy cập chứ không phải các thread khác. Vì vậy, *biến local* (những biến được khai báo trên đỉnh Stack) được coi là private đối với thread và không nên được các thread khác truy cập.

Trong các ứng dụng single-threaded, chúng ta luôn có một thread là main thread. Do đó, chúng ta dùng vùng Stack của nó giống như chúng ta dùng segment Stack của process. Đó là vì, trong một chương trình single-threaded, không có ranh giới nào giữa main thread và chính process. Nhưng tình huống khác đi đối với một chương trình multithreaded. Mỗi thread có vùng Stack riêng khác với vùng Stack của thread khác.

Khi tạo một thread mới, một khối memory được cấp phát cho vùng Stack. Nếu không được lập trình viên chỉ định khi tạo, vùng Stack sẽ có một Stack Size mặc định, và nó sẽ được cấp phát từ segment Stack của process. Kích thước Stack mặc định phụ thuộc nền tảng và khác nhau từ architecture này sang architecture khác. Bạn có thể dùng lệnh `ulimit -s` để lấy kích thước Stack mặc định trong một hệ thống POSIX-compliant.

Trên nền tảng hiện tại của tôi, là macOS trên một máy Intel 64-bit, kích thước Stack mặc định là 8 MB:

```
$ ulimit -s
8192
$
```

*Shell Box 16-1: Đọc kích thước Stack mặc định*

POSIX threading API cho phép bạn đặt vùng Stack cho một thread mới. Trong ví dụ sau, *ví dụ 16.3*, chúng ta có hai thread. Với một trong số chúng, chúng ta dùng các thiết lập Stack mặc định, và với thread kia, chúng ta sẽ<a id="_idIndexMarker1144"></a> cấp phát một buffer từ segment Heap và đặt nó làm vùng Stack của thread đó. Lưu ý rằng, khi đặt vùng Stack, buffer được cấp phát nên có một kích thước tối thiểu; nếu không nó không thể được dùng làm vùng Stack:

```
#include <stdio.h>
#include <stdlib.h>
#include <limits.h>
#include <pthread.h>
void* thread_body_1(void* arg) {
  int local_var = 0;
  printf("Thread1 > Stack Address: %p\n", (void*)&local_var);
  return 0;
}
void* thread_body_2(void* arg) {
  int local_var = 0;
  printf("Thread2 > Stack Address: %p\n", (void*)&local_var);
  return 0;
}
int main(int argc, char** argv) {
  size_t buffer_len = PTHREAD_STACK_MIN + 100;
  // The buffer allocated from heap to be used as
  // the thread's stack region
  char *buffer = (char*)malloc(buffer_len * sizeof(char));
  // The thread handlers
  pthread_t thread1;
  pthread_t thread2;
  // Create a new thread with default attributes
  int result1 = pthread_create(&thread1, NULL,
          thread_body_1, NULL);
  // Create a new thread with a custom stack region
  pthread_attr_t attr;
  pthread_attr_init(&attr);
  // Set the stack address and size
  if (pthread_attr_setstack(&attr, buffer, buffer_len)) {
    printf("Failed while setting the stack attributes.\n");
    exit(1);
  }
  int result2 = pthread_create(&thread2, &attr,
          thread_body_2, NULL);
  if (result1 || result2) {
    printf("The threads could not be created.\n");
    exit(2);
  }
  printf("Main Thread > Heap Address: %p\n", (void*)buffer);
  printf("Main Thread > Stack Address: %p\n", (void*)&buffer_len);
  // Wait for the threads to finish
  result1 = pthread_join(thread1, NULL);
  result2 = pthread_join(thread2, NULL);
  if (result1 || result2) {
    printf("The threads could not be joined.\n");
    exit(3);
  }
  free(buffer);
  return 0;
}
```

*Code Box 16-7 [ExtremeC_examples_chapter16_3.c]: Đặt một khối Heap làm vùng Stack của một thread*

Để bắt đầu chương trình, chúng ta tạo thread thứ nhất với các thiết lập Stack mặc định. Do đó, Stack của nó nên được cấp phát từ segment Stack của process. Sau đó, chúng ta tạo thread thứ hai bằng cách chỉ định memory address của một buffer được dự định là <a id="_idIndexMarker1145"></a>vùng Stack của thread.

Lưu ý rằng kích thước được chỉ định lớn hơn `100` byte so với kích thước Stack tối thiểu đã được định nghĩa, được chỉ ra bởi macro `PTHREAD_STACK_MIN`. Hằng này có các giá trị khác nhau trên các nền tảng khác nhau, và nó được bao gồm như một phần của header file `limits.h`.

Nếu bạn build chương trình trên và chạy nó trên một thiết bị Linux, bạn sẽ thấy thứ gì đó như sau:

```
$ gcc ExtremeC_examples_chapter16_3.c -o ex16_3.out -lpthread
$ ./ex16_3.out
Main Thread > Heap Address: 0x55a86a251260
Main Thread > Stack Address: 0x7ffcb5794d50
Thread2 > Stack Address: 0x55a86a2541a4
Thread1 > Stack Address: 0x7fa3e9216ee4
$
```

*Shell Box 16-2: Build và chạy ví dụ 16.3*

Như đã rõ từ output thấy trong *Shell Box 16-2*, address của biến local `local_var` được cấp phát trên đỉnh Stack của thread thứ hai thuộc về một dải address khác (dải của không gian Heap). Điều này có nghĩa là vùng Stack của thread thứ hai nằm bên trong Heap. Tuy nhiên, điều này không đúng với thread thứ nhất.

Như output cho thấy, address của biến local trong thread thứ nhất nằm trong dải address của segment Stack của process. Kết quả là, chúng ta đã có thể đặt thành công một vùng Stack mới được cấp phát từ segment Heap, cho một thread mới được tạo.

Khả năng đặt vùng Stack của một thread có thể then chốt trong một số trường hợp sử dụng. Ví dụ, trong các môi trường memory-constrained nơi tổng lượng memory thấp để có các Stack lớn, hay trong các môi trường high-performance mà chi phí cấp phát Stack cho mỗi thread không thể chấp nhận được, việc dùng một số buffer được cấp phát trước có thể hữu ích và thủ tục trên có thể được dùng để đặt một buffer được cấp phát trước làm vùng Stack của một thread mới được tạo.

Ví dụ sau minh họa việc chia sẻ một address trong Stack của một thread có thể dẫn đến một số vấn đề memory như thế nào. Khi một address từ một thread được chia sẻ, thread đó nên vẫn sống, nếu không mọi pointer giữ address đó đều trở thành dangling.

Code sau không thread-safe, do đó chúng ta kỳ vọng thấy crash thỉnh thoảng trong các lần chạy liên tiếp. Các thread cũng có các thiết lập Stack mặc định, nghĩa là vùng Stack của chúng được cấp phát từ segment Stack <a id="_idIndexMarker1146"></a>của process:

```
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <pthread.h>
int* shared_int;
void* t1_body(void* arg) {
  int local_var = 100;
  shared_int = &local_var;
  // Wait for the other thread to print the shared integer
  usleep(10);
  return NULL;
}
void* t2_body(void* arg) {
  printf("%d\n", *shared_int);
  return NULL;
}
int main(int argc, char** argv) {
  shared_int = NULL;
  pthread_t t1;
  pthread_t t2;
  pthread_create(&t1, NULL, t1_body, NULL);
  pthread_create(&t2, NULL, t2_body, NULL);
  pthread_join(t1, NULL);
  pthread_join(t2, NULL);
  return 0;
}
```

*Code Box 16-8 [ExtremeC_examples_chapter16_4.c]: Cố đọc một biến được cấp phát từ vùng Stack của một thread khác*

Ở đầu, chúng ta đã khai báo một pointer dùng chung global. Vì nó là một pointer, nó có thể nhận bất kỳ address nào bất kể address đó trỏ tới đâu trong memory layout của process. Nó có thể từ<a id="_idIndexMarker1147"></a> segment Stack hay segment Heap hay thậm chí segment Data.

Trong code trên, bên trong companion function `t1_body`, chúng ta lưu address của một biến local vào pointer dùng chung. Biến này thuộc về thread thứ nhất, và nó được cấp phát trên đỉnh Stack của thread thứ nhất.

Từ giờ trở đi, nếu thread thứ nhất thoát, pointer dùng chung trở thành dangling, và mọi phép dereference có lẽ dẫn đến một crash, một lỗi logic, hay một vấn đề memory ẩn trong trường hợp tốt nhất. Trong một số interleaving, điều này sẽ xảy ra, và bạn thấy crash thỉnh thoảng nếu bạn chạy chương trình trên nhiều lần.

Một lưu ý quan trọng, các kỹ thuật synchronization phù hợp nên được dùng nếu một thread muốn dùng một biến được cấp phát từ vùng Stack của một thread khác. Vì vòng đời của một biến Stack bị ràng buộc với scope của nó, synchronization nên nhắm tới việc giữ scope còn sống cho đến khi thread sử dụng dùng xong biến.

Lưu ý rằng để đơn giản chúng ta đã không kiểm tra kết quả của các hàm pthread. Luôn được khuyên làm như vậy và kiểm tra các giá trị trả về. Không phải mọi hàm pthread đều hoạt động như nhau trên các nền tảng khác nhau; nếu có điều gì đó sai, bạn sẽ biết bằng cách kiểm tra các giá trị trả về.

Trong phần này, nói chung, chúng tôi đã cho thấy tại sao các address thuộc về các vùng Stack không nên được chia sẻ, và tại sao các shared state tốt hơn không nên được cấp phát từ các vùng Stack. Phần tiếp theo nói về memory Heap, vốn là nơi phổ biến nhất để lưu các shared state. Như bạn có thể đã đoán, làm việc với Heap cũng khó, và bạn nên cẩn thận với memory leak.

<a id="_idParaDest-222"></a>

### Memory Heap

Segment Heap và segment Data có thể được mọi thread truy cập. Không giống segment Data, vốn được tạo ra vào lúc biên dịch, segment Heap là động, và nó được định hình vào lúc runtime. Các thread có thể vừa đọc vừa sửa đổi nội dung của Heap. Ngoài ra, nội dung của Heap có thể tồn tại chừng nào process còn sống, và độc lập với vòng đời của các thread riêng lẻ. Ngoài ra, các đối tượng lớn có thể được đặt bên trong Heap. Tất cả những yếu tố này cùng nhau đã khiến Heap trở thành một nơi tuyệt vời để lưu các state sẽ được chia sẻ giữa một số thread.

Việc quản lý memory trở thành một cơn ác mộng khi nói đến cấp phát Heap, và đó là do thực tế rằng memory đã cấp phát phải được giải phóng vào một lúc nào đó bởi một trong các thread đang chạy, nếu không nó có thể dẫn đến memory leak.

Đối với các môi trường concurrent, các interleaving có thể dễ dàng tạo ra dangling pointer; do đó crash xuất hiện. Vai trò then chốt của synchronization là đặt mọi thứ theo một thứ tự cụ thể mà không dangling pointer nào có thể được tạo ra, và đây là phần khó.

Hãy xem ví dụ sau, *ví dụ 16.5*. Có năm thread trong ví dụ này. Thread thứ nhất cấp phát một mảng từ Heap. Thread thứ hai và thứ ba điền vào <a id="_idIndexMarker1148"></a>mảng theo dạng này. Thread thứ hai điền vào các chỉ số chẵn trong mảng bằng các chữ cái in hoa bắt đầu từ *Z* và lùi dần về *A*, và thread thứ ba điền vào các chỉ số lẻ bằng các chữ cái thường bắt đầu từ *a* và tiến dần tới *z*. Thread thứ tư in mảng. Và cuối cùng, thread thứ năm giải phóng mảng và thu hồi memory Heap.

Mọi kỹ thuật được mô tả trong các phần trước về POSIX concurrency control nên được dùng để giữ những thread này không hoạt động sai bên trong Heap. Code sau không có cơ chế kiểm soát nào được áp dụng, và hiển nhiên, nó không thread-safe. Lưu ý rằng code chưa hoàn chỉnh. Phiên bản hoàn chỉnh với các cơ chế concurrency control được áp dụng sẽ có trong code box tiếp theo:

```
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <pthread.h>
#define CHECK_RESULT(result) \
if (result) { \
  printf("A pthread error happened.\n"); \
  exit(1); \
}
int TRUE = 1;
int FALSE = 0;
// The pointer to the shared array
char* shared_array;
// The size of the shared array
unsigned int shared_array_len;
void* alloc_thread_body(void* arg) {
  shared_array_len = 20;
  shared_array = (char*)malloc(shared_array_len * sizeof(char*));
  return NULL;
}
void* filler_thread_body(void* arg) {
  int even = *((int*)arg);
  char c = 'a';
  size_t start_index = 1;
  if (even) {
    c = 'Z';
    start_index = 0;
  }
  for (size_t i = start_index; i < shared_array_len; i += 2) {
    shared_array[i] = even ? c-- : c++;
  }
  shared_array[shared_array_len - 1] = '\0';
  return NULL;
}
void* printer_thread_body(void* arg) {
  printf(">> %s\n", shared_array);
  return NULL;
}
void* dealloc_thread_body(void* arg) {
  free(shared_array);
  return NULL;
}
int main(int argc, char** argv) {
  … Create threads ...
}
```

*Code Box 16-9 [ExtremeC_examples_chapter16_5_raw.c]: Ví dụ 16.5 không có cơ chế synchronization nào được áp dụng*

Rất dễ thấy rằng code trên không thread-safe và nó gây ra các crash nghiêm trọng vì sự can thiệp<a id="_idIndexMarker1149"></a> của thread giải phóng trong việc giải phóng mảng.

Bất cứ khi nào thread giải phóng có được CPU, nó giải phóng buffer Heap-allocated ngay lập tức, và sau đó pointer `shared_array` trở thành dangling, và các thread khác bắt đầu crash. Các kỹ thuật synchronization phù hợp nên được dùng để bảo đảm rằng thread giải phóng chạy sau cùng và thứ tự logic đúng trong các thread khác nhau được chạy.

Trong khối code sau, chúng ta bổ sung cho code trên các đối tượng POSIX concurrency control để làm cho nó thread-safe:

```
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <pthread.h>
#define CHECK_RESULT(result) \
if (result) { \
  printf("A pthread error happened.\n"); \
  exit(1); \
}
int TRUE = 1;
int FALSE = 0;
// The pointer to the shared array
char* shared_array;
// The size of the shared array
size_t shared_array_len;
pthread_barrier_t alloc_barrier;
pthread_barrier_t fill_barrier;
pthread_barrier_t done_barrier;
void* alloc_thread_body(void* arg) {
  shared_array_len = 20;
  shared_array = (char*)malloc(shared_array_len * sizeof(char*));
  pthread_barrier_wait(&alloc_barrier);
  return NULL;
}
void* filler_thread_body(void* arg) {
  pthread_barrier_wait(&alloc_barrier);
  int even = *((int*)arg);
  char c = 'a';
  size_t start_index = 1;
  if (even) {
    c = 'Z';
    start_index = 0;
  }
  for (size_t i = start_index; i < shared_array_len; i += 2) {
    shared_array[i] = even ? c-- : c++;
  }
  shared_array[shared_array_len - 1] = '\0';
  pthread_barrier_wait(&fill_barrier);
  return NULL;
}
void* printer_thread_body(void* arg) {
  pthread_barrier_wait(&fill_barrier);
  printf(">> %s\n", shared_array);
  pthread_barrier_wait(&done_barrier);
  return NULL;
}
void* dealloc_thread_body(void* arg) {
  pthread_barrier_wait(&done_barrier);
  free(shared_array);
  pthread_barrier_destroy(&alloc_barrier);
  pthread_barrier_destroy(&fill_barrier);
  pthread_barrier_destroy(&done_barrier);
  return NULL;
}
int main(int argc, char** argv) {
  shared_array = NULL;
  pthread_barrier_init(&alloc_barrier, NULL, 3);
  pthread_barrier_init(&fill_barrier, NULL, 3);
  pthread_barrier_init(&done_barrier, NULL, 2);
  pthread_t alloc_thread;
  pthread_t even_filler_thread;
  pthread_t odd_filler_thread;
  pthread_t printer_thread;
  pthread_t dealloc_thread;
  pthread_attr_t attr;
  pthread_attr_init(&attr);
  int res = pthread_attr_setdetachstate(&attr,
          PTHREAD_CREATE_DETACHED);
  CHECK_RESULT(res);
  res = pthread_create(&alloc_thread, &attr,
          alloc_thread_body, NULL);
  CHECK_RESULT(res);
  res = pthread_create(&even_filler_thread,
          &attr, filler_thread_body, &TRUE);
  CHECK_RESULT(res);
  res = pthread_create(&odd_filler_thread,
          &attr, filler_thread_body, &FALSE);
  CHECK_RESULT(res);
  res = pthread_create(&printer_thread, &attr,
          printer_thread_body, NULL);
  CHECK_RESULT(res);
  res = pthread_create(&dealloc_thread, &attr,
          dealloc_thread_body, NULL);
  CHECK_RESULT(res);
  pthread_exit(NULL);
  return 0;
}
```

*Code Box 16-10 [ExtremeC_examples_chapter16_5.c]: Ví dụ 16.5 với các cơ chế synchronization được áp dụng*

Để làm cho code có trong *Code Box 16-9* thread-safe, chúng ta chỉ dùng POSIX barrier trong code mới. Đây là cách tiếp cận dễ nhất để tạo một thứ tự thực thi tuần tự giữa một số thread.

Nếu bạn so sánh *Code Box 16-9* và *16-10*, bạn sẽ thấy POSIX barrier được dùng như thế nào để áp đặt một thứ tự<a id="_idIndexMarker1151"></a> giữa các thread khác nhau. Ngoại lệ duy nhất là giữa hai thread điền. Các thread điền có thể chạy độc lập mà không chặn nhau, và vì chúng đang thay đổi các chỉ số lẻ và chẵn riêng rẽ, không có vấn đề concurrent nào có thể phát sinh. Lưu ý rằng code trên không thể được biên dịch trên các hệ thống Apple. Bạn cần mô phỏng hành vi barrier bằng mutex và condition variable trong những hệ thống này (như chúng ta đã làm cho *ví dụ 16.2*).

Sau đây là output của code trên. Bất kể bạn chạy chương trình bao nhiêu lần, nó không bao giờ crash. Nói cách khác, code trên được bảo vệ chống lại các interleaving khác nhau, và nó thread-safe:

```
$ gcc ExtremeC_examples_chapter16_5.c -o ex16_5 -lpthread
$ ./ex16_5
>> ZaYbXcWdVeUfTgShRiQ
$ ./ex16_5
>> ZaYbXcWdVeUfTgShRiQ
$
```

*Shell Box 16-3: Build và chạy ví dụ 16.5*

Trong phần này, chúng tôi đã đưa ra một ví dụ về việc dùng không gian Heap làm chỗ chứa cho các shared state. Không giống memory Stack, nơi việc giải phóng memory diễn ra tự động, việc giải phóng không gian Heap nên được thực hiện tường minh. Nếu không, memory leak là một tác dụng phụ không thể tránh khỏi.

Nơi dễ nhất và đôi khi là nơi tốt nhất có sẵn để giữ các shared state, xét về công sức quản lý memory <a id="_idIndexMarker1152"></a>ít nhất cho lập trình viên, là segment Data, nơi cả việc cấp phát lẫn giải phóng đều diễn ra tự động. Các biến nằm trong segment Data được coi là global, và có vòng đời dài nhất có thể, từ những khoảnh khắc đầu tiên khi process ra đời cho đến những khoảnh khắc cuối cùng của nó. Nhưng vòng đời dài này có thể được coi là tiêu cực trong một số trường hợp sử dụng, đặc biệt khi bạn định giữ một đối tượng lớn trong segment Data.

Trong phần tiếp theo, chúng ta sẽ nói về memory visibility và cách các hàm POSIX bảo đảm điều đó.

<a id="_idParaDest-223"></a>

### Memory visibility

Chúng tôi đã giải thích *memory visibility* và *cache coherency* trong các chương trước, đối với các hệ thống có<a id="_idIndexMarker1153"></a> nhiều hơn một lõi CPU. Trong phần này, chúng tôi muốn xem xét library pthread và xem nó bảo đảm memory visibility như thế nào.

Như bạn biết, một cache<a id="_idIndexMarker1154"></a> coherency protocol giữa các lõi CPU bảo đảm rằng mọi phiên bản cache của một memory address duy nhất trong mọi lõi CPU vẫn được đồng bộ và cập nhật theo các thay đổi mới nhất được thực hiện ở một trong các lõi CPU. Nhưng protocol này phải được kích hoạt bằng cách nào đó.

Có các API trong system call interface để kích hoạt cache coherency protocol và làm cho memory hiển thị với mọi lõi CPU. Trong pthread cũng vậy, có một số hàm bảo đảm memory visibility trước khi chúng thực thi.

Bạn có thể đã gặp một số hàm này trước đây. Danh sách của chúng được trình bày dưới đây:

- `pthread_barrier_wait`
- `pthread_cond_broadcast`
- `pthread_cond_signal`
- `pthread_cond_timedwait`
- `pthread_cond_wait`
- `pthread_create`
- `pthread_join`
- `pthread_mutex_lock`
- `pthread_mutex_timedlock`
- `pthread_mutex_trylock`
- `pthread_mutex_unlock`
- `pthread_spin_lock`
- `pthread_spin_trylock`
- `pthread_spin_unlock`
- `pthread_rwlock_rdlock`
- `pthread_rwlock_timedrdlock`
- `pthread_rwlock_timedwrlock`
- `pthread_rwlock_tryrdlock`
- `pthread_rwlock_trywrlock`
- `pthread_rwlock_unlock`
- `pthread_rwlock_wrlock`
- `sem_post`
- `sem_timedwait`
- `sem_trywait`
- `sem_wait`
- `semctl`
- `semop`

Ngoài các local cache trong lõi CPU, các compiler cũng có thể đưa vào các cơ chế caching cho các biến được dùng thường xuyên. Để điều này xảy ra, compiler cần phân tích code và tối ưu nó theo cách mà các biến được dùng thường xuyên được ghi vào và đọc từ các compiler cache. Đây là các software cache được compiler đặt vào binary cuối cùng để tối ưu và tăng tốc việc thực thi chương trình.

Dù những cache này có thể có lợi, chúng có khả năng thêm một vấn đề đau đầu khác khi viết code multithreaded và gây ra một số vấn đề memory visibility. Do đó, đôi khi những cache này<a id="_idIndexMarker1156"></a> phải bị vô hiệu hóa cho các biến cụ thể.

Các biến không được dự định để compiler tối ưu thông qua caching có thể được khai báo là *volatile*. Lưu ý rằng một biến volatile<a id="_idIndexMarker1157"></a> vẫn có thể được cache ở mức CPU, nhưng compiler sẽ không tối ưu nó bằng cách giữ nó trong compiler cache. Một biến có thể được khai báo là volatile bằng từ khóa `volatile`. Sau đây là khai báo của một số nguyên volatile:

```
volatile int number;
```

*Code Box 16-11: Khai báo một biến số nguyên volatile*

Điều quan trọng về các biến volatile là chúng không giải quyết các vấn đề memory visibility trong các hệ thống multi-threaded. Để giải quyết vấn đề này, bạn cần dùng các hàm POSIX trên ở đúng chỗ của chúng để bảo đảm memory visibility.

<a id="_idParaDest-224"></a>

## Tóm tắt

Trong chương này, chúng ta đã trình bày các cơ chế concurrent control được POSIX threading API cung cấp. Chúng ta đã thảo luận:

- POSIX mutex và cách chúng nên được dùng
- POSIX condition variable và barrier và cách chúng nên được dùng
- POSIX semaphore, và binary semaphore và general semaphore khác nhau như thế nào
- Các thread tương tác với vùng Stack như thế nào
- Cách định nghĩa một vùng Stack Heap-allocated mới cho một thread
- Các thread tương tác với không gian Heap như thế nào
- Memory visibility và các hàm POSIX bảo đảm memory visibility
- Biến volatile và compiler cache

Trong chương tiếp theo, chúng ta sẽ tiếp tục thảo luận và chúng ta sẽ nói về một cách tiếp cận khác để có concurrency trong một hệ thống phần mềm: multi-processing. Chúng ta sẽ thảo luận một process có thể được thực thi như thế nào và nó khác với một thread như thế nào.
