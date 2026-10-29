<a id="_idParaDest-241"></a>

# Chương 18: Process Synchronization

Chương này tiếp tục thảo luận của chúng ta trong chương trước, *Process Execution*, và trọng tâm chính của chúng ta sẽ là process synchronization. Các cơ chế kiểm soát trong các chương trình multi-process khác với các kỹ thuật kiểm soát mà chúng ta<a id="_idIndexMarker1240"></a> đã gặp trong các chương trình multi-threaded. Không chỉ memory là khác; có những yếu tố khác mà bạn không thể tìm thấy trong một chương trình multi-threaded, và chúng tồn tại trong một môi trường multi-process.

Trái với thread vốn bị gắn với một process, process có thể sống tự do trên bất kỳ máy nào, với bất kỳ hệ điều hành nào, nằm ở bất cứ đâu trong một mạng lớn như internet. Như bạn có thể tưởng tượng, mọi thứ trở nên phức tạp. Sẽ không dễ dàng đồng bộ hóa một số process trong một hệ thống phân tán như vậy.

Chương này dành cho process synchronization diễn ra chỉ trong một máy. Nói cách khác, nó chủ yếu nói về synchronization single-host và các kỹ thuật xung quanh nó. Chúng ta thảo luận ngắn gọn về process synchronization trong các hệ thống phân tán, nhưng chúng ta sẽ không đi vào chi tiết sâu rộng.

Chương này trình bày các chủ đề sau:

- Trước tiên, chúng tôi mô tả phần mềm multi-process mà mọi process đều đang chạy trên cùng một máy. Chúng tôi giới thiệu các kỹ thuật có sẵn trong các môi trường single-host. Chúng tôi dùng kiến thức từ chương trước để đưa ra một số ví dụ minh họa những kỹ thuật này.
- Trong nỗ lực đầu tiên để đồng bộ hóa một số process, chúng ta dùng named POSIX semaphore. Chúng tôi giải thích chúng nên được dùng như thế nào và sau đó chúng tôi đưa ra một ví dụ giải quyết một vấn đề race condition mà chúng ta đã gặp trong các chương trước.
- Sau đó, chúng ta nói về named POSIX mutex và chúng tôi cho thấy cách chúng ta có thể dùng các vùng shared memory để có các named mutex hoạt động. Như một ví dụ, chúng ta giải quyết cùng race condition đã được giải quyết bằng semaphore, lần này dùng named mutex.
- Là kỹ thuật cuối cùng để đồng bộ hóa một số process, chúng ta thảo luận named POSIX condition variable. Giống như named mutex, chúng cần được đặt trong một vùng shared memory để có thể truy cập được bởi một số process. Chúng tôi đưa ra một ví dụ kỹ lưỡng về kỹ thuật này cho thấy named POSIX condition variable có thể được dùng như thế nào để đồng bộ hóa một hệ thống multi-process.
- Là thảo luận cuối cùng trong chương này, chúng ta nói ngắn gọn về các hệ thống multi-process có các process của riêng chúng được phân tán khắp một mạng. Chúng ta thảo luận các đặc điểm của chúng và những khác biệt gây vấn đề mà chúng có so với một hệ thống multi-process single-host.

Hãy bắt đầu chương bằng việc nói thêm một chút về concurrency control single-host và những kỹ thuật nào có sẵn trong đó.

<a id="_idParaDest-242"></a>

## Single-host concurrency control (kiểm soát concurrency trên một host)

Rất phổ biến khi ở trong <a id="_idIndexMarker1241"></a>những tình huống mà có một số process đang chạy trên một máy duy nhất, đồng thời, cần truy cập đồng thời vào một tài nguyên dùng chung. Vì mọi process đều đang chạy bên trong cùng một hệ điều hành, chúng có quyền truy cập mọi phương tiện mà hệ điều hành của chúng cung cấp.

Trong phần này, chúng tôi cho thấy cách dùng một số phương tiện này để tạo một cơ chế kiểm soát đồng bộ hóa các process. Shared memory đóng một vai trò then chốt trong hầu hết các cơ chế kiểm soát này; do đó, chúng ta dựa rất nhiều vào những gì chúng tôi đã giải thích về shared memory trong chương trước.

Sau đây là danh sách các cơ chế kiểm soát POSIX-provided có thể được dùng khi mọi process đều đang chạy trên cùng một máy POSIX-compliant:

- **Named POSIX semaphore**: Cùng các POSIX semaphore mà chúng tôi đã giải thích trong *Chương 16*, *Thread Synchronization*, nhưng với <a id="_idIndexMarker1242"></a>một khác biệt: giờ chúng có tên và có thể<a id="_idIndexMarker1243"></a> được dùng toàn cục trong hệ thống. Nói cách khác, chúng không còn là các semaphore *anonymous* hay *private* nữa.
- **Named mutex**: Một lần nữa, cùng <a id="_idIndexMarker1244"></a>các POSIX mutex <a id="_idIndexMarker1245"></a>với cùng các thuộc tính đã được giải thích trong *Chương 16*, *Thread Synchronization*, nhưng giờ có tên và có thể được dùng trong toàn hệ thống. Những mutex này nên được đặt bên trong một shared memory để có sẵn cho nhiều process.
- **Named condition variable**: Cùng các POSIX condition<a id="_idIndexMarker1246"></a> variable mà chúng tôi đã giải thích trong *Chương 16*, *Thread Synchronization*, nhưng giống như mutex, chúng nên được đặt bên trong một đối tượng shared <a id="_idIndexMarker1247"></a>memory để có sẵn cho một số process.

Trong các phần sắp tới, chúng ta thảo luận mọi kỹ thuật trên và đưa ra ví dụ để minh họa chúng hoạt động như thế nào. Trong phần sau, chúng ta sẽ thảo luận về named POSIX semaphore.

<a id="_idParaDest-243"></a>

## Named POSIX semaphore (POSIX semaphore có tên)

Như bạn đã thấy trong *Chương 16*, *Thread Synchronization*, semaphore là công cụ chính để đồng bộ hóa một số tác vụ concurrent. Chúng ta đã thấy chúng trong các chương trình multi-threaded và thấy chúng giúp vượt qua các vấn đề concurrency như thế nào.

Trong phần này, chúng ta<a id="_idIndexMarker1248"></a> sẽ cho thấy chúng có thể được dùng giữa một số process như thế nào. *Ví dụ 18.1* cho thấy cách dùng một POSIX semaphore để giải quyết các data race mà chúng ta đã gặp trong *ví dụ 17.6* và *17.7* được đưa ra trong chương trước, *Process Execution*. Ví dụ này rất giống *ví dụ 17.6*, và nó lại dùng một vùng shared memory để lưu biến bộ đếm dùng chung. Nhưng nó dùng named semaphore để đồng bộ hóa việc truy cập vào bộ đếm dùng chung.

Các code box sau cho thấy cách chúng ta dùng một named semaphore để đồng bộ hóa hai process khi truy cập một biến dùng chung. Code box sau cho thấy các khai báo global của *ví dụ 18.1*:

```
#include <stdio.h>
...
#include <semaphore.h>  // For using semaphores
#define SHARED_MEM_SIZE 4
// Shared file descriptor used to refer to the
// shared memory object
int shared_fd = -1;
// The pointer to the shared counter
int32_t* counter = NULL;
// The pointer to the shared semaphore
sem_t* semaphore = NULL;
```

*Code Box 18-1 [ExtremeC_examples_chapter18_1.c]: Các khai báo global của ví dụ 18.1*

Trong *Code Box 18-1*, chúng ta đã khai báo một bộ đếm global và một pointer global tới một đối tượng semaphore <a id="_idIndexMarker1249"></a>sẽ được đặt sau. Pointer này sẽ được cả parent process lẫn child process dùng để có truy cập được đồng bộ hóa vào bộ đếm dùng chung, được trỏ tới bởi pointer bộ đếm.

Code sau cho thấy các định nghĩa hàm được dự định thực hiện process synchronization thực sự. Một số định nghĩa giống như chúng ta đã có trong *ví dụ 17.6* và những dòng đó đã được bỏ khỏi code box sau:

```
void init_control_mechanism() {
  semaphore = sem_open("/sem0", O_CREAT | O_EXCL, 0600, 1);
  if (semaphore == SEM_FAILED) {
    fprintf(stderr, "ERROR: Opening the semaphore failed: %s\n",
        strerror(errno));
    exit(1);
  }
}
void shutdown_control_mechanism() {
  if (sem_close(semaphore) < 0) {
    fprintf(stderr, "ERROR: Closing the semaphore failed: %s\n",
        strerror(errno));
    exit(1);
  }
  if (sem_unlink("/sem0") < 0) {
    fprintf(stderr, "ERROR: Unlinking failed: %s\n",
        strerror(errno));
    exit(1);
  }
}
void init_shared_resource() {
  ... as in the example 17.6 ...
}
void shutdown_shared_resource() {
  ... as in the example 17.6 ...
}
```

*Code Box 18-2 [ExtremeC_examples_chapter18_1.c]: Định nghĩa của các hàm synchronization*

Chúng ta đã thêm<a id="_idIndexMarker1250"></a> hai hàm mới so với *ví dụ 17.6*: `init_control_mechanism` và `shutdown_control_mechanism`. Chúng ta cũng đã thực hiện một số thay đổi đối với hàm `inc_counter` (được thể hiện trong *Code Box 18-3*) để dùng semaphore và tạo một critical section bên trong.

Bên trong các hàm `init_control_mechanism` và `shutdown_control_mechanism`, chúng ta đang dùng một API tương tự shared memory API để mở, đóng và unlink một named semaphore.

Các hàm `sem_open`, `sem_close` và `sem_unlink` có thể được xem là tương tự `shm_open`, `shm_close` và `shm_unlink`. Có một khác biệt và đó là hàm `sem_open` trả về một semaphore pointer thay vì một file descriptor.

Lưu ý rằng API được dùng để làm việc với semaphore trong ví dụ này giống như chúng ta đã thấy trước đây, nên phần còn lại của code có thể giữ nguyên như với *ví dụ 17.6*. Trong ví dụ này, semaphore được khởi tạo với giá trị `1`, làm cho nó thành một mutex. Code box sau cho thấy critical section và semaphore được dùng như thế nào để đồng bộ hóa các thao tác đọc và ghi được thực hiện trên bộ đếm dùng chung:

```
void inc_counter() {
  usleep(1);
  sem_wait(semaphore); // Return value should be checked.
  int32_t temp = *counter;
  usleep(1);
  temp++;
  usleep(1);
  *counter = temp;
  sem_post(semaphore); // Return value should be checked.
  usleep(1);
}
```

*Code Box 18-3 [ExtremeC_examples_chapter18_1.c]: Critical section nơi bộ đếm dùng chung đang được tăng*

So với *ví dụ 17.6*, trong hàm `inc_counter`, các hàm `sem_wait` và `sem_post` lần lượt được dùng để vào và thoát các critical section.

Trong code box sau, bạn có thể thấy hàm `main`. Nó gần giống *ví dụ 17.6* và chúng ta chỉ thấy một số thay đổi ở phần đầu và phần cuối, và điều đó phù hợp với việc thêm hai hàm mới thấy trong *Code Box 18-2*:

```
int main(int argc, char** argv) {
  // Parent process needs to initialize the shared resource
  init_shared_resource();
  // Parent process needs to initialize the control mechanism
  init_control_mechanism();
  ... as in the example 17.6 ...
  // Only parent process needs to shut down the shared resource
  // and the employed control mechanism
  if (pid) {
    shutdown_shared_resource();
    shutdown_control_mechanism();
  }
  return 0;
}
```

*Code Box 18-4 [ExtremeC_examples_chapter18_1.c]: Hàm main của ví dụ 18.1*

Trong shell box<a id="_idIndexMarker1251"></a> sau, bạn có thể thấy output cho hai lần chạy liên tiếp của *ví dụ 18.1*:

```
$ gcc ExtremeC_examples_chapter18_1.c -lrt -lpthread -o ex18_1.out
$ ./ex18_1.out
Shared memory is created with fd: 3
The memory region is truncated.
The child process sees the counter as 1.
The parent process sees the counter as 2.
The child process finished with status 0.
$ ./ex18_1.out
Shared memory is created with fd: 3
The memory region is truncated.
The parent process sees the counter as 1.
The child process sees the counter as 2.
The child process finished with status 0.
$
```

*Shell Box 18-1: Build trong Linux và hai lần chạy liên tiếp của ví dụ 18.1*

Lưu ý rằng chúng ta cần link code trên với library `pthread` vì chúng ta đang dùng POSIX semaphore. Chúng ta cũng cần link nó với library `rt` trong Linux để dùng shared memory.

Output trên rất rõ ràng. Đôi khi<a id="_idIndexMarker1252"></a> child process có được CPU trước và tăng bộ đếm, và đôi khi parent process làm như vậy. Không có lúc nào cả hai cùng vào critical section, và do đó chúng thỏa mãn data integrity của bộ đếm dùng chung.

Lưu ý rằng không bắt buộc phải dùng fork API để dùng named semaphore. Các process hoàn toàn tách biệt, không phải là cha và con, vẫn có thể mở và dùng cùng các semaphore nếu chúng được chạy trên cùng một máy và bên trong cùng một hệ điều hành. Trong *ví dụ 18.3*, chúng tôi cho thấy điều này khả thi như thế nào.

Lưu ý cuối cùng trong phần này, bạn nên biết rằng chúng ta có hai loại named semaphore trong các hệ điều hành Unix-like. Một là *System V Semaphore*, và loại kia là *POSIX semaphore*. Trong phần này, chúng tôi đã giải thích POSIX semaphore vì chúng có danh tiếng tốt hơn nhờ API đẹp và hiệu năng. Link sau là một câu hỏi Stack Overflow<a id="_idIndexMarker1253"></a> giải thích hay những khác biệt giữa System V semaphore và POSI[X semaphores: https://stackoverflow.com/questions/368322/differences-between-system-v-and-po](https://stackoverflow.com/questions/368322/differences-between-system-v-and-posix-semaphores)six-semaphores.

> **Lưu ý:**
>
> Microsoft Windows không POSIX-compliant về mặt dùng semaphore, và nó có API riêng để tạo và quản lý semaphore.

Trong phần tiếp theo, chúng ta thảo luận về named mutex. Nói ngắn gọn, named mutex là các đối tượng mutex thông thường được đặt vào một vùng shared memory.

<a id="_idParaDest-244"></a>

## Named mutex (mutex có tên)

POSIX mutex hoạt động đơn giản trong các chương trình multi-threaded; chúng tôi đã minh họa điều này trong *Chương 16*, *Thread Synchronization*. Tuy nhiên, điều này <a id="_idIndexMarker1254"></a>sẽ không đúng với các môi trường nhiều process. Để có một mutex hoạt động giữa một số process, nó cần được định nghĩa bên trong một nơi mà tất cả chúng đều có thể truy cập.

Lựa chọn tốt nhất cho một nơi dùng chung như vậy là một vùng shared memory. Do đó, để có một mutex hoạt động trong một môi trường multi-process, nó nên được phân phối trong một vùng shared memory.

<a id="_idParaDest-245"></a>

### Ví dụ thứ nhất

Ví dụ sau, *ví dụ 18.2*, là một bản sao của *ví dụ 18.1*, nhưng nó giải quyết race condition tiềm ẩn <a id="_idIndexMarker1256"></a>bằng named mutex thay vì named semaphore. Nó cũng cho thấy cách tạo một vùng shared memory và dùng nó để lưu một mutex dùng chung.

Vì mỗi đối tượng shared memory có một tên toàn cục, một mutex được lưu trong một vùng shared memory có thể được coi là *có tên* (named) và có thể được các process khác trong toàn hệ thống truy cập.

Code box sau cho thấy các khai báo cần thiết cho *ví dụ 18.2*. Nó cho thấy những gì cần thiết để có một mutex dùng chung:

```
#include <stdio.h>
...
#include <pthread.h> // For using pthread_mutex_* functions
#define SHARED_MEM_SIZE 4
// Shared file descriptor used to refer to shared memory object
int shared_fd = -1;
// Shared file descriptor used to refer to the mutex's shared
// memory object
int mutex_shm_fd = -1;
// The pointer to the shared counter
int32_t* counter = NULL;
// The pointer to shared mutex
pthread_mutex_t* mutex = NULL;
```

*Code Box 18-5 [ExtremeC_examples_chapter18_2.c]: Các khai báo global của ví dụ 18.2*

Như bạn có thể thấy, chúng ta đã khai báo:

- Một file descriptor global để trỏ tới một vùng shared memory được dự định lưu biến bộ đếm dùng chung
- Một file descriptor global cho vùng shared memory lưu mutex dùng chung
- Một pointer tới bộ đếm dùng chung
- Một pointer tới mutex dùng chung

Những biến này sẽ được điền tương ứng bởi logic sắp tới.

Các code<a id="_idIndexMarker1257"></a> box sau cho thấy mọi hàm chúng ta đã có trong *ví dụ 18.1*, nhưng như bạn thấy, các định nghĩa đã được cập nhật để làm việc với một named mutex thay vì một named semaphore:

```
void init_control_mechanism() {
  // Open the mutex shared memory
  mutex_shm_fd = shm_open("/mutex0", O_CREAT | O_RDWR, 0600);
  if (mutex_shm_fd < 0) {
    fprintf(stderr, "ERROR: Failed to create shared memory: %s\n"
        , strerror(errno));
    exit(1);
  }
  // Allocate and truncate the mutex's shared memory region
  if (ftruncate(mutex_shm_fd, sizeof(pthread_mutex_t)) < 0) {
    fprintf(stderr, "ERROR: Truncation of mutex failed: %s\n",
        strerror(errno));
    exit(1);
  }
  // Map the mutex's shared memory
  void* map = mmap(0, sizeof(pthread_mutex_t),
          PROT_READ | PROT_WRITE, MAP_SHARED, mutex_shm_fd, 0);
  if (map == MAP_FAILED) {
    fprintf(stderr, "ERROR: Mapping failed: %s\n",
            strerror(errno));
    exit(1);
  }
  mutex = (pthread_mutex_t*)map;
  // Initialize the mutex object
  int ret = -1;
  pthread_mutexattr_t attr;
  if ((ret = pthread_mutexattr_init(&attr))) {
    fprintf(stderr, "ERROR: Failed to init mutex attrs: %s\n",
        strerror(ret));
    exit(1);
  }
  if ((ret = pthread_mutexattr_setpshared(&attr,
                  PTHREAD_PROCESS_SHARED))) {
    fprintf(stderr, "ERROR: Failed to set the mutex attr: %s\n",
        strerror(ret));
    exit(1);
  }
  if ((ret = pthread_mutex_init(mutex, &attr))) {
    fprintf(stderr, "ERROR: Initializing the mutex failed: %s\n",
        strerror(ret));
    exit(1);
  }
  if ((ret = pthread_mutexattr_destroy(&attr))) {
    fprintf(stderr, "ERROR: Failed to destroy mutex attrs : %s\n"
        , strerror(ret));
    exit(1);
  }
}
```

*Code Box 18-6 [ExtremeC_examples_chapter18_2.c]: Hàm init_control_mechanism trong ví dụ 18.2*

Trong hàm `init_control_mechanism`, chúng ta đã tạo một đối tượng shared memory mới tên là `/mutex0`. Kích thước của vùng shared memory được khởi tạo bằng `sizeof(pthread_mutex_t)`, cho thấy ý định của chúng ta là chia sẻ một đối tượng POSIX mutex ở đó.

Sau đó, chúng ta<a id="_idIndexMarker1258"></a> có được một pointer tới vùng shared memory. Giờ chúng ta có một mutex được cấp phát từ shared memory, nhưng nó vẫn cần được khởi tạo. Do đó bước tiếp theo là khởi tạo đối tượng mutex bằng hàm `pthread_mutex_init`, với các attribute chỉ ra rằng đối tượng mutex nên được chia sẻ và có thể truy cập được bởi các process khác. Điều này đặc biệt quan trọng; nếu không, mutex không hoạt động trong một môi trường multi-process, dù nó được đặt bên trong một vùng shared memory. Như bạn đã thấy trong code box trên và trong hàm `init_control_mechanism`, chúng ta đã đặt attribute `PTHREAD_PROCESS_SHARED` để đánh dấu mutex là dùng chung. Hãy xem hàm tiếp theo:

```
void shutdown_control_mechanism() {
  int ret = -1;
  if ((ret = pthread_mutex_destroy(mutex))) {
    fprintf(stderr, "ERROR: Failed to destroy mutex: %s\n",
        strerror(ret));
    exit(1);
  }
  if (munmap(mutex, sizeof(pthread_mutex_t)) < 0) {
    fprintf(stderr, "ERROR: Unmapping the mutex failed: %s\n",
        strerror(errno));
    exit(1);
  }
  if (close(mutex_shm_fd) < 0) {
    fprintf(stderr, "ERROR: Closing the mutex failed: %s\n",
        strerror(errno));
    exit(1);
  }
  if (shm_unlink("/mutex0") < 0) {
    fprintf(stderr, "ERROR: Unlinking the mutex failed: %s\n",
        strerror(errno));
    exit(1);
  }
}
```

*Code Box 18-7 [ExtremeC_examples_chapter18_2.c]: Hàm destroy_control_mechanism trong ví dụ 18.2*

Trong hàm `destroy_control_mechanism`, chúng ta hủy đối tượng mutex, và sau đó chúng ta đóng và <a id="_idIndexMarker1259"></a>unlink vùng shared memory bên dưới của nó. Đây là cùng cách mà chúng ta hủy một đối tượng shared memory thông thường. Hãy tiếp tục với các đoạn code khác trong ví dụ:

```
void init_shared_resource() {
  ... as in the example 18.1 ...
}
void shutdown_shared_resource() {
  ... as in the example 18.1 ...
}
```

*Code Box 18-8 [ExtremeC_examples_chapter18_2.c]: Những hàm này giống như chúng ta đã thấy trong ví dụ 18.1*

Như bạn thấy, các hàm trên hoàn toàn không thay đổi và chúng giống như chúng ta đã có trong *ví dụ 18.1*. Hãy xem critical section bên trong hàm `inc_counter`, giờ dùng một named mutex thay vì một named semaphore.

```
void inc_counter() {
  usleep(1);
  pthread_mutex_lock(mutex); // Should check the return value.
  int32_t temp = *counter;
  usleep(1);
  temp++;
  usleep(1);
  *counter = temp;
  pthread_mutex_unlock(mutex); // Should check the return value.
  usleep(1);
}
int main(int argc, char** argv) {
  ... as in the example 18.1 ...
}
```

*Code Box 18-9 [ExtremeC_examples_chapter18_2.c]: Critical section giờ dùng một named mutex để bảo vệ bộ đếm dùng chung*

Nói chung, như bạn thấy trong các code box trên, một vài chỗ khác với *ví dụ 18.1*, và chúng ta<a id="_idIndexMarker1260"></a> chỉ phải thay đổi nhiều ở ba hàm. Chẳng hạn, hàm `main` hoàn toàn không thay đổi, và nó giống như trong *ví dụ 18.1*. Điều này đơn giản là vì chúng ta đã dùng một cơ chế kiểm soát khác so với *ví dụ 18.1*, và logic còn lại là như nhau.

Lưu ý cuối cùng về *Code Box 18-9*, trong hàm `inc_counter`, chúng ta đã dùng đối tượng mutex chính xác như chúng ta đã làm trong một chương trình multi-threaded. API là như nhau, và nó được thiết kế theo cách mà mutex có thể được dùng trong cả môi trường multi-threaded lẫn multi-process bằng cùng API. Đây là một tính năng tuyệt vời của POSIX mutex vì nó cho phép chúng ta dùng cùng code đã viết trong cả môi trường multi-threaded lẫn multi-process khi sử dụng những đối tượng này – trong khi dĩ nhiên, việc khởi tạo và hủy có thể khác nhau.

Output của code trên rất giống những gì chúng ta đã quan sát được cho *ví dụ 18.1*. Trong khi bộ đếm dùng chung được bảo vệ bởi một mutex trong ví dụ này, nó đã được bảo vệ bởi một semaphore trong ví dụ trước. Semaphore được dùng trong ví dụ trước thực ra là một binary semaphore, và như chúng tôi đã giải thích trong *Chương 16*, *Thread Synchronization*, một binary semaphore có thể mô phỏng một mutex. Do đó, không có nhiều điều mới trong *ví dụ 18.2*, ngoài việc thay binary semaphore bằng một mutex.

<a id="_idParaDest-246"></a>

### Ví dụ thứ hai

Các shared memory và mutex có tên có thể được dùng trong toàn hệ thống bởi bất kỳ process nào. Không bắt buộc phải có một process được fork để có thể dùng những đối tượng này. Ví dụ sau, *ví dụ 18.3*, cố gắng cho thấy cách chúng ta có thể dùng một mutex dùng chung và một shared memory để đồng thời kết thúc một số process đều đang chạy cùng lúc. Chúng ta kỳ vọng mọi process đều bị kết thúc sau khi nhấn tổ hợp phím `Ctrl` + `C` chỉ ở một trong số chúng.

Lưu ý rằng code sẽ được cung cấp theo nhiều bước. Các nhận xét liên quan đến mỗi bước được cung cấp ngay sau nó. Hãy trình bày bước đầu tiên.

<a id="_idParaDest-247"></a>

#### Bước 1 – Các khai báo global

Trong ví dụ này, chúng ta viết một source file <a id="_idIndexMarker1262"></a>duy nhất có thể được biên dịch và thực thi nhiều lần để tạo ra nhiều process. Các process dùng một số vùng shared memory để đồng bộ hóa việc thực thi của chúng. Một trong các process được chọn làm chủ sở hữu của các vùng shared memory và quản lý việc tạo và hủy chúng. Các process khác chỉ dùng các shared memory đã được tạo.

Bước đầu tiên sẽ khai báo một số đối tượng global mà chúng ta cần trong toàn bộ code. Chúng ta sẽ khởi tạo chúng sau trong code. Lưu ý rằng các biến global được định nghĩa trong code box sau, như `mutex`, thực ra không được chia sẻ giữa các process. Chúng có những biến này trong không gian memory riêng nhưng mỗi process ánh xạ biến global của riêng mình tới các đối tượng hay biến nằm trong các vùng shared memory khác nhau:

```
#include <stdio.h>
...
#include <pthread.h> // For using pthread_mutex_* functions
typedef uint16_t bool_t;
#define TRUE 1
#define FALSE 0
#define MUTEX_SHM_NAME "/mutex0"
#define SHM_NAME "/shm0"
// Shared file descriptor used to refer to the shared memory
// object containing the cancel flag
int cancel_flag_shm_fd = -1;
// A flag which indicates whether the current process owns the
// shared memory object
bool_t cancel_flag_shm_owner = FALSE;
// Shared file descriptor used to refer to the mutex's shared
// memory object
int mutex_shm_fd = -1;
// The shared mutex
pthread_mutex_t* mutex = NULL;
// A flag which indicates whether the current process owns the
// shared memory object
bool_t mutex_owner = FALSE;
// The pointer to the cancel flag stored in the shared memory
bool_t* cancel_flag = NULL;
```

*Code Box 18-10 [ExtremeC_examples_chapter18_3.c]: Khai báo global trong ví dụ 18.3*

Trong code trên, chúng ta <a id="_idIndexMarker1263"></a>có thể thấy các khai báo global được dùng trong code. Chúng ta sẽ dùng một flag dùng chung để cho các process biết về tín hiệu hủy. Lưu ý rằng, trong ví dụ này, chúng ta sẽ chọn cách tiếp cận busy-wait để chờ flag hủy trở thành `true`.

Chúng ta có một đối tượng shared memory riêng cho flag hủy và một đối tượng shared memory khác cho mutex bảo vệ flag như chúng ta đã làm trong *ví dụ 18.2*. Lưu ý rằng chúng ta có thể xây dựng một structure duy nhất và định nghĩa cả flag hủy lẫn đối tượng mutex làm các trường của nó, và sau đó dùng một vùng shared memory duy nhất để lưu chúng. Nhưng chúng tôi đã chọn dùng các vùng shared memory riêng biệt để đạt được mục đích của mình.

Trong ví dụ này, một lưu ý quan trọng về các đối tượng shared memory là việc dọn dẹp nên được thực hiện bởi process đã tạo và khởi tạo chúng ngay từ đầu. Vì mọi process đều đang dùng cùng code, bằng cách nào đó, chúng ta cần biết process nào đã tạo một đối tượng shared memory nhất định và làm cho process đó trở thành chủ sở hữu của đối tượng đó. Sau đó, khi dọn dẹp các đối tượng, chỉ process sở hữu mới có thể tiếp tục và thực hiện việc dọn dẹp thực sự. Do đó, chúng ta phải khai báo hai biến Boolean cho mục đích này: `mutex_owner` và `cancel_flag_shm_owner`.

<a id="_idParaDest-248"></a>

#### Bước 2 – Shared memory của flag hủy

Code box sau <a id="_idIndexMarker1264"></a>cho thấy việc khởi tạo<a id="_idIndexMarker1265"></a> vùng shared memory dành cho flag hủy:

```
void init_shared_resource() {
  // Open the shared memory object
  cancel_flag_shm_fd = shm_open(SHM_NAME, O_RDWR, 0600);
  if (cancel_flag_shm_fd >= 0) {
    cancel_flag_shm_owner = FALSE;
    fprintf(stdout, "The shared memory object is opened.\n");
  } else if (errno == ENOENT) {
    fprintf(stderr,
            "WARN: The shared memory object doesn't exist.\n");
    fprintf(stdout, "Creating the shared memory object ...\n");
    cancel_flag_shm_fd = shm_open(SHM_NAME,
            O_CREAT | O_EXCL | O_RDWR, 0600);
    if (cancel_flag_shm_fd >= 0) {
      cancel_flag_shm_owner = TRUE;
      fprintf(stdout, "The shared memory object is created.\n");
    } else {
      fprintf(stderr,
          "ERROR: Failed to create shared memory: %s\n",
          strerror(errno));
      exit(1);
    }
  } else {
      fprintf(stderr,
          "ERROR: Failed to create shared memory: %s\n",
          strerror(errno));
    exit(1);
  }
  if (cancel_flag_shm_owner) {
    // Allocate and truncate the shared memory region
    if (ftruncate(cancel_flag_shm_fd, sizeof(bool_t)) < 0) {
      fprintf(stderr, "ERROR: Truncation failed: %s\n",
              strerror(errno));
      exit(1);
    }
    fprintf(stdout, "The memory region is truncated.\n");
  }
  // Map the shared memory and initialize the cancel flag
  void* map = mmap(0, sizeof(bool_t), PROT_WRITE, MAP_SHARED,
      cancel_flag_shm_fd, 0);
  if (map == MAP_FAILED) {
    fprintf(stderr, "ERROR: Mapping failed: %s\n",
            strerror(errno));
    exit(1);
  }
  cancel_flag = (bool_t*)map;
  if (cancel_flag_shm_owner) {
    *cancel_flag = FALSE;
  }
}
```

*Code Box 18-11 [ExtremeC_examples_chapter18_3.c]: Khởi tạo shared memory của flag hủy*

Cách tiếp cận chúng ta chọn khác với những gì chúng ta đã làm trong *ví dụ 18.2*. Đó là vì bất cứ khi nào một <a id="_idIndexMarker1266"></a>process mới được chạy, nó nên kiểm tra xem đối tượng shared memory đã được một process khác tạo chưa. Lưu ý<a id="_idIndexMarker1267"></a> rằng chúng ta không dùng fork API để tạo các process mới trong ví dụ này và người dùng có thể dùng shell của mình và khởi động một process mới tùy ý.

Vì lý do này, một process mới trước tiên cố mở vùng shared memory bằng cách chỉ cung cấp flag `O_RDWR`. Nếu thành công, thì đó là dấu hiệu cho thấy process hiện tại không phải là chủ sở hữu của vùng đó, và nó tiếp tục ánh xạ vùng shared memory. Nếu thất bại, điều đó có nghĩa là vùng shared memory không tồn tại, và đó là dấu hiệu cho thấy process hiện tại nên tạo vùng đó và trở thành chủ sở hữu của nó. Vì vậy, nó tiếp tục và cố mở vùng với các flag khác; `O_CREAT` và `O_EXCL`. Những flag này tạo một đối tượng shared memory nếu nó chưa tồn tại.

Nếu việc tạo thành công, process hiện tại là chủ sở hữu, và nó tiếp tục bằng việc truncate và ánh xạ vùng shared memory.

Có một khả năng nhỏ rằng giữa hai lời gọi liên tiếp hàm `shm_open` trong kịch bản trên, một process khác tạo cùng vùng shared memory, và do đó lời gọi `shm_open` thứ hai thất bại. Flag `O_EXCL` ngăn process hiện tại tạo một đối tượng đã tồn tại, và sau đó nó thoát bằng cách hiển thị một thông báo lỗi phù hợp. Nếu điều này xảy ra, vốn rất hiếm, chúng ta luôn có thể thử chạy lại process và nó sẽ không gặp cùng vấn đề trong lần chạy thứ hai.

Code sau là thao tác ngược lại để hủy flag hủy và vùng shared memory của nó:

```
void shutdown_shared_resource() {
  if (munmap(cancel_flag, sizeof(bool_t)) < 0) {
    fprintf(stderr, "ERROR: Unmapping failed: %s\n",
            strerror(errno));
    exit(1);
  }
  if (close(cancel_flag_shm_fd) < 0) {
    fprintf(stderr,
        "ERROR: Closing the shared memory fd filed: %s\n",
        strerror(errno));
    exit(1);
  }
  if (cancel_flag_shm_owner) {
    sleep(1);
    if (shm_unlink(SHM_NAME) < 0) {
      fprintf(stderr,
          "ERROR: Unlinking the shared memory failed: %s\n",
          strerror(errno));
      exit(1);
    }
  }
}
```

*Code Box 18-12 [ExtremeC_examples_chapter18_3.c]: Đóng các tài nguyên được cấp phát cho shared memory của flag hủy*

Như bạn có thể thấy trong *Code Box 18-12*, logic được viết rất giống những gì chúng ta đã thấy cho đến giờ, trong các ví dụ trước, về việc giải phóng một đối tượng shared memory. Nhưng có một khác biệt <a id="_idIndexMarker1268"></a>ở đây và đó là thực tế rằng <a id="_idIndexMarker1269"></a>chỉ process sở hữu mới có thể unlink đối tượng shared memory. Lưu ý rằng process sở hữu chờ 1 giây trước khi unlink đối tượng shared memory, để cho các process khác hoàn tất các tài nguyên của chúng. Việc chờ này thường không cần thiết do thực tế rằng, trong hầu hết các hệ thống POSIX-compliant, đối tượng shared memory vẫn ở tại chỗ cho đến khi mọi process phụ thuộc thoát.

<a id="_idParaDest-249"></a>

#### Bước 3 – Shared memory của named mutex

Code box sau cho thấy<a id="_idIndexMarker1270"></a> cách khởi tạo mutex dùng chung và đối tượng shared memory liên kết của nó:

```
void init_control_mechanism() {
  // Open the mutex shared memory
  mutex_shm_fd = shm_open(MUTEX_SHM_NAME, O_RDWR, 0600);
  if (mutex_shm_fd >= 0) {
    // The mutex's shared object exists and I'm now the owner.
    mutex_owner = FALSE;
    fprintf(stdout,
            "The mutex's shared memory object is opened.\n");
  } else if (errno == ENOENT) {
    fprintf(stderr,
            "WARN: Mutex's shared memory doesn't exist.\n");
    fprintf(stdout,
            "Creating the mutex's shared memory object ...\n");
    mutex_shm_fd = shm_open(MUTEX_SHM_NAME,
            O_CREAT | O_EXCL | O_RDWR, 0600);
    if (mutex_shm_fd >= 0) {
      mutex_owner = TRUE;
      fprintf(stdout,
              "The mutex's shared memory object is created.\n");
    } else {
      fprintf(stderr,
          "ERROR: Failed to create mutex's shared memory: %s\n",
          strerror(errno));
      exit(1);
    }
  } else {
    fprintf(stderr,
        "ERROR: Failed to create mutex's shared memory: %s\n",
        strerror(errno));
    exit(1);
  }
  if (mutex_owner) {
    // Allocate and truncate the mutex's shared memory region
  }
  if (mutex_owner) {
    // Allocate and truncate the mutex's shared memory region
    if (ftruncate(mutex_shm_fd, sizeof(pthread_mutex_t)) < 0) {
      fprintf(stderr,
          "ERROR: Truncation of the mutex failed: %s\n",
          strerror(errno));
      exit(1);
    }
  }
  // Map the mutex's shared memory
  void* map = mmap(0, sizeof(pthread_mutex_t),
          PROT_READ | PROT_WRITE, MAP_SHARED, mutex_shm_fd, 0);
  if (map == MAP_FAILED) {
    fprintf(stderr, "ERROR: Mapping failed: %s\n",
            strerror(errno));
    exit(1);
  }
  mutex = (pthread_mutex_t*)map;
  if (mutex_owner) {
    int ret = -1;
    pthread_mutexattr_t attr;
    if ((ret = pthread_mutexattr_init(&attr))) {
      fprintf(stderr,
          "ERROR: Initializing mutex attributes failed: %s\n",
          strerror(ret));
      exit(1);
    }
    if ((ret = pthread_mutexattr_setpshared(&attr,
                    PTHREAD_PROCESS_SHARED))) {
      fprintf(stderr,
          "ERROR: Setting the mutex attribute failed: %s\n",
          strerror(ret));
      exit(1);
    }
    if ((ret = pthread_mutex_init(mutex, &attr))) {
      fprintf(stderr,
          "ERROR: Initializing the mutex failed: %s\n",
          strerror(ret));
      exit(1);
    }
    if ((ret = pthread_mutexattr_destroy(&attr))) {
      fprintf(stderr,
          "ERROR: Destruction of mutex attributes failed: %s\n",
          strerror(ret));
      exit(1);
    }
  }
}
```

*Code Box 18-13 [ExtremeC_examples_chapter18_3.c]: Khởi tạo mutex dùng chung và vùng shared memory bên dưới của nó*

Tương tự những gì chúng ta đã làm khi cố tạo vùng shared memory liên kết với flag hủy, chúng ta đã làm điều tương tự để tạo và khởi tạo vùng shared memory<a id="_idIndexMarker1271"></a> bên dưới mutex dùng chung. Lưu ý rằng, giống như trong *ví dụ 18.2*, mutex đã được đánh dấu là `PTHREAD_PROCESS_SHARED`, cho phép nó được dùng bởi nhiều process.

Code box sau cho thấy cách hoàn tất mutex dùng chung:

```
void shutdown_control_mechanism() {
  sleep(1);
  if (mutex_owner) {
    int ret = -1;
    if ((ret = pthread_mutex_destroy(mutex))) {
      fprintf(stderr,
          "WARN: Destruction of the mutex failed: %s\n",
          strerror(ret));
    }
  }
  if (munmap(mutex, sizeof(pthread_mutex_t)) < 0) {
    fprintf(stderr, "ERROR: Unmapping the mutex failed: %s\n",
        strerror(errno));
    exit(1);
  }
  if (close(mutex_shm_fd) < 0) {
    fprintf(stderr, "ERROR: Closing the mutex failed: %s\n",
        strerror(errno));
    exit(1);
  }
  if (mutex_owner) {
    if (shm_unlink(MUTEX_SHM_NAME) < 0) {
      fprintf(stderr, "ERROR: Unlinking the mutex failed: %s\n",
          strerror(errno));
      exit(1);
    }
  }
}
```

*Code Box 18-14 [ExtremeC_examples_chapter18_3.c]: Đóng mutex dùng chung và vùng shared memory liên kết của nó*

Một lần nữa, chỉ process sở hữu<a id="_idIndexMarker1272"></a> mới có thể unlink đối tượng shared memory của mutex dùng chung.

<a id="_idParaDest-250"></a>

#### Bước 4 – Đặt flag hủy

Code box <a id="_idIndexMarker1273"></a>sau cho thấy các hàm<a id="_idIndexMarker1274"></a> cho phép các process đọc hay đặt flag hủy:

```
bool_t is_canceled() {
  pthread_mutex_lock(mutex); // Should check the return value
  bool_t temp = *cancel_flag;
  pthread_mutex_unlock(mutex); // Should check the return value
  return temp;
}
void cancel() {
  pthread_mutex_lock(mutex); // Should check the return value
  *cancel_flag = TRUE;
  pthread_mutex_unlock(mutex); // Should check the return value
}
```

*Code Box 18-15 [ExtremeC_examples_chapter18_3.c]: Các hàm được đồng bộ hóa đọc và đặt flag hủy được bảo vệ bởi mutex dùng chung*

Hai hàm trên cho phép chúng ta có truy cập được đồng bộ hóa vào flag hủy dùng chung. Hàm `is_canceled` được dùng để kiểm tra giá trị của flag, và hàm `cancel` được dùng để đặt flag. Như bạn thấy, cả hai đều được bảo vệ bởi cùng một mutex dùng chung.

<a id="_idParaDest-251"></a>

#### Bước 5 – Hàm main

Và cuối cùng, code <a id="_idIndexMarker1275"></a>box sau cho thấy hàm `main` và một *signal handler* mà chúng tôi sẽ giải thích ngay sau đây:

```
void sigint_handler(int signo) {
  fprintf(stdout, "\nHandling INT signal: %d ...\n", signo);
  cancel();
}
int main(int argc, char** argv) {
  signal(SIGINT, sigint_handler);
  // Parent process needs to initialize the shared resource
  init_shared_resource();
  // Parent process needs to initialize the control mechanism
  init_control_mechanism();
  while(!is_canceled()) {
    fprintf(stdout, "Working ...\n");
    sleep(1);
  }
  fprintf(stdout, "Cancel signal is received.\n");
  shutdown_shared_resource();
  shutdown_control_mechanism();
  return 0;
}
```

*Code Box 18-16 [ExtremeC_examples_chapter18_3.c]: Hàm main và hàm signal handler trong ví dụ 18.3*

Như bạn thấy, logic bên trong hàm `main` rõ ràng và đơn giản. Nó khởi tạo flag và mutex dùng chung và sau đó đi vào một busy-wait cho đến khi flag hủy trở thành `true`. Cuối cùng, nó<a id="_idIndexMarker1276"></a> tắt mọi tài nguyên dùng chung và kết thúc.

Một điều <a id="_idIndexMarker1277"></a>mới ở đây là việc dùng hàm `signal`, gán một signal handler cho một tập *signal* cụ thể. Signal là một trong các phương tiện được cung cấp bởi mọi hệ điều hành POSIX-compliant và dùng nó, các process bên trong hệ thống có thể gửi signal cho nhau. *Terminal* chỉ là một <a id="_idIndexMarker1278"></a>process bình thường mà người dùng tương tác và nó có thể được dùng để gửi signal tới các process khác. Nhấn `Ctrl` + `C` là một cách tiện lợi để gửi `SIGINT` tới process foreground đang chạy trong một terminal.

`SIGINT` là *interrupt signal* mà<a id="_idIndexMarker1279"></a> một process có thể nhận. Trong code trên, chúng ta gán hàm `sigint_handler` làm handler của signal `SIGINT`. Nói cách khác, bất cứ khi nào signal `SIGINT` được process nhận, hàm `sigint_handler` sẽ được gọi. Nếu signal `SIGINT` không được xử lý, routine mặc định là kết thúc process, nhưng điều này có thể bị override bằng các signal handler như trên.

Có nhiều cách để gửi một signal `SIGINT` tới một process, nhưng một trong những cách dễ nhất là nhấn các phím `Ctrl` + `C` trên bàn phím. Process sẽ ngay lập tức nhận signal `SIGINT`. Như bạn thấy, bên trong signal handler, chúng ta đặt flag hủy dùng chung thành `true`, và sau điểm này, mọi process bắt đầu thoát khỏi các vòng lặp busy-wait của chúng.

Sau đây là một minh họa về cách code trên biên dịch và hoạt động. Hãy build code trên và chạy process đầu tiên:

```
$ gcc ExtremeC_examples_chapter18_3.c -lpthread -lrt -o ex18_3.out
$ ./ex18_3.out
WARN: The shared memory object doesn't exist.
Creating a shared memory object ...
The shared memory object is created.
The memory region is truncated.
WARN: Mutex's shared memory object doesn't exist.
Creating the mutex's shared memory object ...
The mutex's shared memory object is created.
Working ...
Working ...
Working ...
```

*Shell Box 18-2: Biên dịch ví dụ 18.3 và chạy process đầu tiên*

Như bạn thấy, process trên là process đầu tiên được chạy, và do đó, nó là chủ sở hữu của mutex và flag hủy. Sau đây là lần chạy process thứ hai:

```
$ ./ex18_3.out
The shared memory object is opened.
The mutex's shared memory object is opened.
Working ...
Working ...
Working ...
```

*Shell Box 18-3: Chạy process thứ hai*

Như bạn thấy, process thứ hai chỉ mở các đối tượng shared memory, và nó không phải là chủ sở hữu. Output sau cho thấy khi `Ctrl` + `C` đã được nhấn ở process đầu tiên:

```
...
Working ...
Working ...
^C
Handling INT signal: 2 ...
Cancel signal is received.
$
```

*Shell Box 18-4: Output của process đầu tiên khi Ctrl + C đã được nhấn*

Như bạn thấy,<a id="_idIndexMarker1282"></a> process đầu tiên in ra rằng nó đang xử lý một signal với số `2`, là số signal chuẩn của `SIGINT`. Nó đặt flag hủy, và nó thoát ngay lập tức. Và theo sau nó, process thứ hai thoát. Sau đây là output của process thứ hai:

```
...
Working ...
Working ...
Working ...
Cancel signal is received.
$
```

*Shell Box 18-5: Output của process thứ hai khi nó thấy rằng flag hủy đã được đặt*

Ngoài ra, bạn có thể<a id="_idIndexMarker1283"></a> gửi `SIGINT` tới process thứ hai và kết quả sẽ như nhau; cả hai process sẽ nhận signal và sẽ thoát. Ngoài ra, bạn có thể tạo nhiều hơn hai process và tất cả chúng sẽ thoát một cách đồng bộ bằng cùng shared memory và mutex.

Trong phần tiếp theo, chúng tôi minh họa cách dùng condition variable. Giống như named mutex, nếu bạn đặt một condition variable bên trong một vùng shared memory, nó có thể được truy cập và dùng bởi nhiều process bằng tên của shared memory.

<a id="_idParaDest-252"></a>

## Named condition variable (condition variable có tên)

Như chúng tôi đã giải thích trước đây, tương tự<a id="_idIndexMarker1284"></a> named POSIX mutex, chúng ta cần cấp phát một POSIX condition variable từ một vùng shared memory để dùng nó trong một hệ thống multi-processing. Ví dụ sau, *ví dụ 18.4*, cho thấy cách làm như vậy để khiến một số process đếm theo một thứ tự cụ thể. Như bạn biết từ *Chương 16*, *Thread Synchronization*, mọi condition variable nên được dùng cùng với một đối tượng mutex đồng hành bảo vệ nó. Do đó, chúng ta sẽ có ba vùng shared memory trong *ví dụ 18.4*; một cho bộ đếm dùng chung, một cho *named condition variable* dùng chung, và một cho *named mutex* dùng chung bảo vệ condition variable dùng chung.

Lưu ý rằng thay vì có ba shared memory khác nhau, chúng ta cũng có thể dùng một shared memory duy nhất. Điều này khả thi bằng cách định nghĩa một structure bao gồm mọi đối tượng cần thiết. Trong ví dụ này, chúng ta sẽ không chọn cách tiếp cận này và chúng ta sẽ định nghĩa một vùng shared memory riêng cho mỗi đối tượng.

*Ví dụ 18.4* là về một số process nên đếm theo thứ tự tăng dần. Mỗi process được cho một số, bắt đầu từ 1 và lên đến số lượng process, và số được cho chỉ ra thứ hạng của process trong số các process khác. Process phải chờ các process khác có số (thứ hạng) nhỏ hơn đếm trước và sau đó nó mới có thể đếm lượt của mình và thoát. Dĩ nhiên, process được gán số 1 đếm trước, ngay cả khi nó là process được sinh ra sau cùng.

Vì chúng ta sẽ có ba vùng shared memory khác nhau, mỗi vùng đòi hỏi các bước riêng để được khởi tạo và hoàn tất, chúng ta sẽ có rất nhiều code trùng lặp nếu chúng ta muốn chọn cùng cách tiếp cận như chúng ta đã làm cho đến giờ trong các ví dụ trước. Để giảm lượng code mà chúng ta viết, và tách các phần trùng lặp thành một số hàm, và có code better-organized (được tổ chức tốt hơn), chúng ta sẽ làm nó object-oriented theo các chủ đề và thủ tục đã thảo luận trong *Chương 6*, *OOP và Encapsulation*, *Chương 7*, *Composition và Aggregation*, và *Chương 8*, *Inheritance và Polymorphism*. Chúng ta sẽ viết *ví dụ 18.4* theo cách object-oriented và dùng inheritance để giảm lượng code trùng lặp.

Chúng ta sẽ định nghĩa một class cha cho mọi class cần được xây dựng trên một vùng shared memory. Do đó, khi có class shared memory cha, sẽ có một class con được định nghĩa cho bộ đếm dùng chung, một class con cho named mutex dùng chung, và một class con khác cho named condition variable dùng chung. Mỗi class sẽ có cặp header file và source file riêng, và tất cả chúng cuối cùng sẽ được dùng trong hàm main của ví dụ.

Các phần sau đi qua từng class đã đề cập. Trước hết, hãy bắt đầu với class cha: shared memory.

<a id="_idParaDest-253"></a>

### Bước 1 – Class shared memory

Code box sau <a id="_idIndexMarker1285"></a>cho thấy các khai báo của class shared memory:

```
struct shared_mem_t;
typedef int32_t bool_t;
struct shared_mem_t* shared_mem_new();
void shared_mem_delete(struct shared_mem_t* obj);
void shared_mem_ctor(struct shared_mem_t* obj,
                     const char* name,
                     size_t size);
void shared_mem_dtor(struct shared_mem_t* obj);
char* shared_mem_getptr(struct shared_mem_t* obj);
bool_t shared_mem_isowner(struct shared_mem_t* obj);
void shared_mem_setowner(struct shared_mem_t* obj, bool_t is_owner);
```

*Code Box 18-17 [ExtremeC_examples_chapter18_4_shared_mem.h]: Public interface của class shared memory*

Code trên chứa các khai báo (public API) cần thiết để dùng một đối tượng shared memory. Các hàm `shared_mem_getptr`, `shared_mem_isowner` và `shared_mem_setowner` là các behavior của class này.

Nếu cú pháp này không quen thuộc với bạn, hãy đọc *Chương 6*, *OOP và Encapsulation*, *Chương 7*, *Composition và Aggregation*, và *Chương 8*, *Inheritance và Polymorphism*.

Code box sau cho thấy định nghĩa của các hàm được khai báo như một phần của public interface của class, như thấy trong *Code Box 18-17*:

```
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <fcntl.h>
#include <sys/mman.h>
#define TRUE 1
#define FALSE 0
typedef int32_t bool_t;
bool_t owner_process_set = FALSE;
bool_t owner_process = FALSE;
typedef struct {
  char* name;
  int shm_fd;
  void* map_ptr;
  char* ptr;
  size_t size;
} shared_mem_t;
shared_mem_t* shared_mem_new() {
  return (shared_mem_t*)malloc(sizeof(shared_mem_t));
}
void shared_mem_delete(shared_mem_t* obj) {
  free(obj->name);
  free(obj);
}
void shared_mem_ctor(shared_mem_t* obj, const char* name,
        size_t size) {
  obj->size = size;
  obj->name = (char*)malloc(strlen(name) + 1);
  strcpy(obj->name, name);
  obj->shm_fd = shm_open(obj->name, O_RDWR, 0600);
  if (obj->shm_fd >= 0) {
    if (!owner_process_set) {
      owner_process = FALSE;
      owner_process_set = TRUE;
    }
    printf("The shared memory %s is opened.\n", obj->name);
  } else if (errno == ENOENT) {
    printf("WARN: The shared memory %s does not exist.\n",
            obj->name);
    obj->shm_fd = shm_open(obj->name,
            O_CREAT | O_RDWR, 0600);
    if (obj->shm_fd >= 0) {
      if (!owner_process_set) {
        owner_process = TRUE;
        owner_process_set = TRUE;
      }
      printf("The shared memory %s is created and opened.\n",
              obj->name);
      if (ftruncate(obj->shm_fd, obj->size) < 0) {
        fprintf(stderr, "ERROR(%s): Truncation failed: %s\n",
            obj->name, strerror(errno));
        exit(1);
      }
    } else {
      fprintf(stderr,
          "ERROR(%s): Failed to create shared memory: %s\n",
          obj->name, strerror(errno));
      exit(1);
    }
  } else {
      fprintf(stderr,
          "ERROR(%s): Failed to create shared memory: %s\n",
          obj->name, strerror(errno));
    exit(1);
  }
  obj->map_ptr = mmap(0, obj->size, PROT_READ | PROT_WRITE,
      MAP_SHARED, obj->shm_fd, 0);
  if (obj->map_ptr == MAP_FAILED) {
    fprintf(stderr, "ERROR(%s): Mapping failed: %s\n",
        name, strerror(errno));
    exit(1);
  }
  obj->ptr = (char*)obj->map_ptr;
}
void shared_mem_dtor(shared_mem_t* obj) {
  if (munmap(obj->map_ptr, obj->size) < 0) {
    fprintf(stderr, "ERROR(%s): Unmapping failed: %s\n",
        obj->name, strerror(errno));
    exit(1);
  }
  printf("The shared memory %s is unmapped.\n", obj->name);
  if (close(obj->shm_fd) < 0) {
    fprintf(stderr,
        "ERROR(%s): Closing the shared memory fd failed: %s\n",
        obj->name, strerror(errno));
    exit(1);
  }
  printf("The shared memory %s is closed.\n", obj->name);
  if (owner_process) {
    if (shm_unlink(obj->name) < 0) {
      fprintf(stderr,
          "ERROR(%s): Unlinking the shared memory failed: %s\n",
          obj->name, strerror(errno));
      exit(1);
    }
    printf("The shared memory %s is deleted.\n", obj->name);
  }
}
char* shared_mem_getptr(shared_mem_t* obj) {
  return obj->ptr;
}
bool_t shared_mem_isowner(shared_mem_t* obj) {
  return owner_process;
}
void shared_mem_setowner(shared_mem_t* obj, bool_t is_owner) {
    owner_process = is_owner;
}
```

*Code Box 18-18 [ExtremeC_examples_chapter18_4_shared_mem.c]: Định nghĩa của mọi hàm có trong class shared memory*

Như bạn thấy, chúng ta chỉ<a id="_idIndexMarker1286"></a> sao chép code chúng ta đã viết cho shared memory trong các ví dụ trước. Structure `shared_mem_t` đóng gói mọi thứ chúng ta cần để làm việc với một đối tượng POSIX shared memory. Hãy lưu ý biến Boolean global `process_owner`. Nó chỉ ra liệu process hiện tại có phải là chủ sở hữu của mọi vùng shared memory hay không. Nó chỉ được đặt một lần.

<a id="_idParaDest-254"></a>

### Bước 2 – Class bộ đếm số nguyên 32-bit dùng chung

Code box sau<a id="_idIndexMarker1287"></a> chứa khai báo của class bộ đếm dùng chung, vốn là một bộ đếm số nguyên 32-bit. Class này kế thừa từ class shared memory. Như bạn có thể đã để ý, chúng ta đang dùng cách tiếp cận thứ hai mà chúng tôi đã mô tả trong *Chương 8*, *Inheritance và Polymorphism*, để triển khai quan hệ inheritance:

```
struct shared_int32_t;
struct shared_int32_t* shared_int32_new();
void shared_int32_delete(struct shared_int32_t* obj);
void shared_int32_ctor(struct shared_int32_t* obj,
                       const char* name);
void shared_int32_dtor(struct shared_int32_t* obj);
void shared_int32_setvalue(struct shared_int32_t* obj,
                           int32_t value);
void shared_int32_setvalue_ifowner(struct shared_int32_t* obj,
                                   int32_t value);
int32_t shared_int32_getvalue(struct shared_int32_t* obj);
```

*Code Box 18-19 [ExtremeC_examples_chapter18_4_shared_int32.h]: Public interface của class bộ đếm dùng chung*

Và code box sau cho thấy bản triển khai của các hàm đã khai báo ở trên:

```
#include "ExtremeC_examples_chapter18_4_shared_mem.h"
typedef struct {
  struct shared_mem_t* shm;
  int32_t* ptr;
} shared_int32_t;
shared_int32_t* shared_int32_new(const char* name) {
  shared_int32_t* obj =
      (shared_int32_t*)malloc(sizeof(shared_int32_t));
  obj->shm = shared_mem_new();
  return obj;
}
void shared_int32_delete(shared_int32_t* obj) {
  shared_mem_delete(obj->shm);
  free(obj);
}
void shared_int32_ctor(shared_int32_t* obj, const char* name) {
  shared_mem_ctor(obj->shm, name, sizeof(int32_t));
  obj->ptr = (int32_t*)shared_mem_getptr(obj->shm);
}
void shared_int32_dtor(shared_int32_t* obj) {
  shared_mem_dtor(obj->shm);
}
void shared_int32_setvalue(shared_int32_t* obj, int32_t value) {
  *(obj->ptr) = value;
}
void shared_int32_setvalue_ifowner(shared_int32_t* obj,
                                   int32_t value) {
  if (shared_mem_isowner(obj->shm)) {
    *(obj->ptr) = value;
  }
}
int32_t shared_int32_getvalue(shared_int32_t* obj) {
  return *(obj->ptr);
}
```

*Code Box 18-20 [ExtremeC_examples_chapter18_4_shared_int32.c]: Định nghĩa của mọi hàm có trong class bộ đếm dùng chung*

Như bạn có thể thấy, chúng ta<a id="_idIndexMarker1288"></a> đã viết ít code hơn nhiều nhờ inheritance. Mọi code cần thiết để quản lý đối tượng shared memory liên kết đã được đưa vào bởi trường `shm` trong structure `shared_int32_t`.

<a id="_idParaDest-255"></a>

### Bước 3 – Class mutex dùng chung

Code<a id="_idIndexMarker1289"></a> box sau chứa khai báo của class mutex dùng chung:

```
#include <pthread.h>
struct shared_mutex_t;
struct shared_mutex_t* shared_mutex_new();
void shared_mutex_delete(struct shared_mutex_t* obj);
void shared_mutex_ctor(struct shared_mutex_t* obj,
                       const char* name);
void shared_mutex_dtor(struct shared_mutex_t* obj);
pthread_mutex_t* shared_mutex_getptr(struct shared_mutex_t* obj);
void shared_mutex_lock(struct shared_mutex_t* obj);
void shared_mutex_unlock(struct shared_mutex_t* obj);
#if !defined(__APPLE__)
void shared_mutex_make_consistent(struct shared_mutex_t* obj);
#endif
```

*Code Box 18-21 [ExtremeC_examples_chapter18_4_shared_mutex.h]: Public interface của class mutex dùng chung*

Như bạn thấy, class trên có ba behavior được phơi ra như kỳ vọng; `shared_mutex_lock`, `shared_mutex_unlock` và `shared_mutex_make_consistent`. Nhưng có một ngoại lệ, đó là behavior `shared_mutex_make_consistent` chỉ có sẵn trong các hệ thống POSIX không dựa trên macOS (Apple). Đó là vì *robust mutex* không được các hệ thống Apple hỗ trợ. Chúng ta sẽ thảo luận robust mutex là gì trong các đoạn sắp tới. Lưu ý rằng chúng ta đã dùng macro `__APPLE__` để phát hiện xem chúng ta có đang biên dịch trên một hệ thống Apple hay không.

Code box sau cho thấy bản triển khai của class trên:

```
#include "ExtremeC_examples_chapter18_4_shared_mem.h"
typedef struct {
  struct shared_mem_t* shm;
  pthread_mutex_t* ptr;
} shared_mutex_t;
shared_mutex_t* shared_mutex_new() {
  shared_mutex_t* obj =
      (shared_mutex_t*)malloc(sizeof(shared_mutex_t));
  obj->shm = shared_mem_new();
  return obj;
}
void shared_mutex_delete(shared_mutex_t* obj) {
  shared_mem_delete(obj->shm);
  free(obj);
}
void shared_mutex_ctor(shared_mutex_t* obj, const char* name) {
  shared_mem_ctor(obj->shm, name, sizeof(pthread_mutex_t));
  obj->ptr = (pthread_mutex_t*)shared_mem_getptr(obj->shm);
  if (shared_mem_isowner(obj->shm)) {
    pthread_mutexattr_t mutex_attr;
    int ret = -1;
    if ((ret = pthread_mutexattr_init(&mutex_attr))) {
      fprintf(stderr,
          "ERROR(%s): Initializing mutex attrs failed: %s\n",
          name, strerror(ret));
      exit(1);
    }
#if !defined(__APPLE__)
    if ((ret = pthread_mutexattr_setrobust(&mutex_attr,
                    PTHREAD_MUTEX_ROBUST))) {
      fprintf(stderr,
          "ERROR(%s): Setting the mutex as robust failed: %s\n",
          name, strerror(ret));
      exit(1);
    }
#endif
    if ((ret = pthread_mutexattr_setpshared(&mutex_attr,
                    PTHREAD_PROCESS_SHARED))) {
      fprintf(stderr,
          "ERROR(%s): Failed to set as process-shared: %s\n",
          name, strerror(ret));
      exit(1);
    }
    if ((ret = pthread_mutex_init(obj->ptr, &mutex_attr))) {
      fprintf(stderr,
          "ERROR(%s): Initializing the mutex failed: %s\n",
          name, strerror(ret));
      exit(1);
    }
    if ((ret = pthread_mutexattr_destroy(&mutex_attr))) {
      fprintf(stderr,
          "ERROR(%s): Destruction of mutex attrs failed: %s\n",
          name, strerror(ret));
      exit(1);
    }
  }
}
void shared_mutex_dtor(shared_mutex_t* obj) {
  if (shared_mem_isowner(obj->shm)) {
    int ret = -1;
    if ((ret = pthread_mutex_destroy(obj->ptr))) {
      fprintf(stderr,
          "WARN: Destruction of the mutex failed: %s\n",
          strerror(ret));
    }
  }
  shared_mem_dtor(obj->shm);
}
pthread_mutex_t* shared_mutex_getptr(shared_mutex_t* obj) {
  return obj->ptr;
}
#if !defined(__APPLE__)
void shared_mutex_make_consistent(shared_mutex_t* obj) {
  int ret = -1;
  if ((ret = pthread_mutex_consistent(obj->ptr))) {
    fprintf(stderr,
        "ERROR: Making the mutex consistent failed: %s\n",
        strerror(ret));
    exit(1);
  }
}
#endif
void shared_mutex_lock(shared_mutex_t* obj) {
  int ret = -1;
  if ((ret = pthread_mutex_lock(obj->ptr))) {
#if !defined(__APPLE__)
    if (ret == EOWNERDEAD) {
        fprintf(stderr,
                "WARN: The owner of the mutex is dead ...\n");
        shared_mutex_make_consistent(obj);
        fprintf(stdout, "INFO: I'm the new owner!\n");
        shared_mem_setowner(obj->shm, TRUE);
        return;
    }
#endif
    fprintf(stderr, "ERROR: Locking the mutex failed: %s\n",
        strerror(ret));
    exit(1);
  }
}
void shared_mutex_unlock(shared_mutex_t* obj) {
  int ret = -1;
  if ((ret = pthread_mutex_unlock(obj->ptr))) {
    fprintf(stderr, "ERROR: Unlocking the mutex failed: %s\n",
        strerror(ret));
    exit(1);
  }
}
```

*Code Box 18-22 [ExtremeC_examples_chapter18_4_shared_mutex.c]: Định nghĩa của mọi hàm có trong class named mutex dùng chung*

Trong code trên, chúng ta chỉ thực hiện việc khởi tạo, hoàn tất POSIX mutex, và phơi ra một số behavior tầm thường như lock và unlock. Mọi thứ khác liên quan đến <a id="_idIndexMarker1291"></a>đối tượng shared memory đang được xử lý trong class shared memory. Đó là một lợi ích của việc dùng inheritance.

Lưu ý rằng trong hàm constructor `shared_mutex_ctor`, chúng ta đặt mutex là một mutex *shared process* để<a id="_idIndexMarker1292"></a> có thể truy cập được bởi mọi process. Điều này hoàn toàn cần thiết cho phần mềm multi-process. Lưu ý rằng trong các hệ thống không Apple-based, chúng ta đi xa hơn và cấu hình<a id="_idIndexMarker1293"></a> mutex thành một *robust mutex*.

Đối với một mutex thông thường bị một process lock, nếu process đó đột ngột chết thì mutex đi vào một trạng thái non-consistent (không nhất quán). Đối với một robust mutex, nếu điều này xảy ra, mutex có thể được đưa trở lại một trạng thái nhất quán. Process tiếp theo, vốn thường đang chờ mutex, chỉ có thể lock mutex bằng cách làm cho nó nhất quán. Bạn có thể thấy điều đó có thể được thực hiện như thế nào trong hàm `shared_mutex_lock`. Lưu ý rằng chức năng này không có trong các hệ thống Apple.

<a id="_idParaDest-256"></a>

### Bước 4 – Class condition variable dùng chung

Code box sau cho thấy<a id="_idIndexMarker1295"></a> khai báo của class condition variable dùng chung:

```
struct shared_cond_t;
struct shared_mutex_t;
struct shared_cond_t* shared_cond_new();
void shared_cond_delete(struct shared_cond_t* obj);
void shared_cond_ctor(struct shared_cond_t* obj,
                      const char* name);
void shared_cond_dtor(struct shared_cond_t* obj);
void shared_cond_wait(struct shared_cond_t* obj,
                      struct shared_mutex_t* mutex);
void shared_cond_timedwait(struct shared_cond_t* obj,
                           struct shared_mutex_t* mutex,
                           long int time_nanosec);
void shared_cond_broadcast(struct shared_cond_t* obj);
```

*Code Box 18-23 [ExtremeC_examples_chapter18_4_shared_cond.h]: Public interface của class condition variable dùng chung*

Ba behavior được phơi ra; `shared_cond_wait`, `shared_cond_timedwait` và `shared_cond_broadcast`. Nếu bạn còn nhớ từ *Chương 16*, *Thread Synchronization*, behavior `shared_cond_wait` chờ một signal trên một condition variable.

Ở trên, chúng ta đã thêm một phiên bản mới của behavior chờ; `shared_cond_timedwait`. Nó chờ signal trong một khoảng thời gian được chỉ định và sau đó nó hết thời gian chờ (time out) nếu condition variable không nhận được signal. Mặt khác, `shared_cond_wait` không bao giờ thoát cho đến khi nó nhận được một loại signal nào đó. Chúng ta sẽ dùng phiên bản chờ có thời hạn trong *ví dụ 18.4*. Lưu ý rằng cả hai behavior function chờ đều nhận một pointer tới mutex dùng chung đồng hành giống như những gì chúng ta đã thấy trong các môi trường multi-threaded.

Code box sau chứa bản triển khai thực sự của class condition variable<a id="_idIndexMarker1296"></a> dùng chung:

```
#include "ExtremeC_examples_chapter18_4_shared_mem.h"
#include "ExtremeC_examples_chapter18_4_shared_mutex.h"
typedef struct {
  struct shared_mem_t* shm;
  pthread_cond_t* ptr;
} shared_cond_t;
shared_cond_t* shared_cond_new() {
  shared_cond_t* obj =
      (shared_cond_t*)malloc(sizeof(shared_cond_t));
  obj->shm = shared_mem_new();
  return obj;
}
void shared_cond_delete(shared_cond_t* obj) {
  shared_mem_delete(obj->shm);
  free(obj);
}
void shared_cond_ctor(shared_cond_t* obj, const char* name) {
  shared_mem_ctor(obj->shm, name, sizeof(pthread_cond_t));
  obj->ptr = (pthread_cond_t*)shared_mem_getptr(obj->shm);
  if (shared_mem_isowner(obj->shm)) {
    pthread_condattr_t cond_attr;
    int ret = -1;
    if ((ret = pthread_condattr_init(&cond_attr))) {
      fprintf(stderr,
          "ERROR(%s): Initializing cv attrs failed: %s\n",
          name, strerror(ret));
      exit(1);
    }
    if ((ret = pthread_condattr_setpshared(&cond_attr,
                    PTHREAD_PROCESS_SHARED))) {
      fprintf(stderr,
          "ERROR(%s): Setting as process shared failed: %s\n",
          name, strerror(ret));
      exit(1);
    }
    if ((ret = pthread_cond_init(obj->ptr, &cond_attr))) {
      fprintf(stderr,
          "ERROR(%s): Initializing the cv failed: %s\n",
          name, strerror(ret));
      exit(1);
    }
    if ((ret = pthread_condattr_destroy(&cond_attr))) {
      fprintf(stderr,
          "ERROR(%s): Destruction of cond attrs failed: %s\n",
          name, strerror(ret));
      exit(1);
    }
  }
}
void shared_cond_dtor(shared_cond_t* obj) {
  if (shared_mem_isowner(obj->shm)) {
    int ret = -1;
    if ((ret = pthread_cond_destroy(obj->ptr))) {
      fprintf(stderr, "WARN: Destruction of the cv failed: %s\n",
          strerror(ret));
    }
  }
  shared_mem_dtor(obj->shm);
}
void shared_cond_wait(shared_cond_t* obj,
                      struct shared_mutex_t* mutex) {
  int ret = -1;
  if ((ret = pthread_cond_wait(obj->ptr,
                  shared_mutex_getptr(mutex)))) {
    fprintf(stderr, "ERROR: Waiting on the cv failed: %s\n",
            strerror(ret));
    exit(1);
  }
}
void shared_cond_timedwait(shared_cond_t* obj,
                           struct shared_mutex_t* mutex,
                           long int time_nanosec) {
  int ret = -1;
  struct timespec ts;
  ts.tv_sec = ts.tv_nsec = 0;
  if ((ret = clock_gettime(CLOCK_REALTIME, &ts))) {
    fprintf(stderr,
            "ERROR: Failed at reading current time: %s\n",
            strerror(errno));
    exit(1);
  }
  ts.tv_sec += (int)(time_nanosec / (1000L * 1000 * 1000));
  ts.tv_nsec += time_nanosec % (1000L * 1000 * 1000);
  if ((ret = pthread_cond_timedwait(obj->ptr,
                  shared_mutex_getptr(mutex), &ts))) {
#if !defined(__APPLE__)
    if (ret == EOWNERDEAD) {
      fprintf(stderr,
              "WARN: The owner of the cv's mutex is dead ...\n");
      shared_mutex_make_consistent(mutex);
      fprintf(stdout, "INFO: I'm the new owner!\n");
      shared_mem_setowner(obj->shm, TRUE);
      return;
    } else if (ret == ETIMEDOUT) {
#else
    if (ret == ETIMEDOUT) {
#endif
      return;
    }
    fprintf(stderr, "ERROR: Waiting on the cv failed: %s\n",
            strerror(ret));
    exit(1);
  }
}
void shared_cond_broadcast(shared_cond_t* obj) {
  int ret = -1;
  if ((ret = pthread_cond_broadcast(obj->ptr))) {
    fprintf(stderr, "ERROR: Broadcasting on the cv failed: %s\n",
        strerror(ret));
    exit(1);
  }
}
```

*Code Box 18-24 [ExtremeC_examples_chapter18_4_shared_cond.c]: Định nghĩa của mọi hàm có trong class condition variable dùng chung*

Trong class condition variable dùng chung của chúng ta, chúng ta chỉ phơi ra behavior *broadcasting*. Chúng ta cũng có thể phơi ra behavior *signaling*. Như bạn<a id="_idIndexMarker1297"></a> có thể nhớ từ *Chương 16*, *Thread Synchronization*, việc signal một condition variable chỉ đánh thức một trong nhiều process đang chờ, mà không có khả năng chỉ định hay dự đoán process nào. Ngược lại, broadcasting sẽ đánh thức mọi process đang chờ. Trong *ví dụ 18.4*, chúng ta sẽ chỉ dùng broadcasting, và đó là lý do tại sao<a id="_idIndexMarker1298"></a> chúng ta chỉ phơi ra hàm đó.

Lưu ý rằng vì mọi condition variable đều có một mutex đồng hành, class mutex dùng chung nên có thể dùng một instance của class mutex dùng chung, và đó là lý do tại sao chúng ta đã khai báo `shared_mutex_t` dưới dạng một forward declaration.

<a id="_idParaDest-257"></a>

### Bước 5 – Logic chính

Code<a id="_idIndexMarker1299"></a> box sau chứa logic chính được triển khai cho ví dụ của chúng ta:

```
#include "ExtremeC_examples_chapter18_4_shared_int32.h"
#include "ExtremeC_examples_chapter18_4_shared_mutex.h"
#include "ExtremeC_examples_chapter18_4_shared_cond.h"
int int_received = 0;
struct shared_cond_t* cond = NULL;
struct shared_mutex_t* mutex = NULL;
void sigint_handler(int signo) {
  fprintf(stdout, "\nHandling INT signal: %d ...\n", signo);
  int_received = 1;
}
int main(int argc, char** argv) {
  signal(SIGINT, sigint_handler);
  if (argc < 2) {
    fprintf(stderr,
            "ERROR: You have to provide the process number.\n");
    exit(1);
  }
  int my_number = atol(argv[1]);
  printf("My number is %d!\n", my_number);
  struct shared_int32_t* counter = shared_int32_new();
  shared_int32_ctor(counter, "/counter0");
  shared_int32_setvalue_ifowner(counter, 1);
  mutex = shared_mutex_new();
  shared_mutex_ctor(mutex, "/mutex0");
  cond = shared_cond_new();
  shared_cond_ctor(cond, "/cond0");
  shared_mutex_lock(mutex);
  while (shared_int32_getvalue(counter) < my_number) {
    if (int_received) {
        break;
    }
    printf("Waiting for the signal, just for 5 seconds ...\n");
    shared_cond_timedwait(cond, mutex, 5L * 1000 * 1000 * 1000);
    if (int_received) {
        break;
    }
    printf("Checking condition ...\n");
  }
  if (int_received) {
    printf("Exiting ...\n");
    shared_mutex_unlock(mutex);
    goto destroy;
  }
  shared_int32_setvalue(counter, my_number + 1);
  printf("My turn! %d ...\n", my_number);
  shared_mutex_unlock(mutex);
  sleep(1);
  // NOTE: The broadcasting can come after unlocking the mutex.
  shared_cond_broadcast(cond);
destroy:
  shared_cond_dtor(cond);
  shared_cond_delete(cond);
  shared_mutex_dtor(mutex);
  shared_mutex_delete(mutex);
  shared_int32_dtor(counter);
  shared_int32_delete(counter);
  return 0;
}
```

*Code Box 18-25 [ExtremeC_examples_chapter18_4_main.c]: Hàm main của ví dụ 18.4*

Như bạn có thể thấy, chương trình nhận một argument chỉ ra số của nó. Ngay khi process biết được số của mình, nó bắt đầu khởi tạo bộ đếm dùng chung, mutex dùng chung và condition variable dùng chung. Sau đó nó đi vào một critical section được bảo vệ bởi mutex dùng chung.

Bên trong một vòng lặp, nó<a id="_idIndexMarker1300"></a> chờ bộ đếm trở thành bằng số của nó. Vì nó chờ trong 5 giây, có thể có một timeout và chúng ta có thể rời hàm `shared_cond_timedwait` sau 5 giây. Điều này về cơ bản có nghĩa là condition variable chưa được thông báo trong 5 giây đó. Process sau đó kiểm tra điều kiện lần nữa và nó đi ngủ thêm 5 giây khác. Việc này tiếp diễn cho đến khi process đến lượt.

Khi điều này xảy ra, process in số của nó, tăng bộ đếm dùng chung, và bằng việc broadcast một signal trên đối tượng condition variable dùng chung, nó thông báo cho các process đang chờ còn lại về sự sửa đổi mà nó đã thực hiện đối với bộ đếm dùng chung. Chỉ khi đó nó mới chuẩn bị thoát.

Trong lúc đó, nếu người dùng nhấn `Ctrl` + `C`, signal handler được định nghĩa như một phần của logic chính đặt flag cục bộ `int_received` và ngay khi process rời hàm `shared_mutex_timedwait` khi nó ở bên trong vòng lặp chính, nó nhận ra interrupt signal và thoát khỏi vòng lặp.

Shell box sau cho thấy cách biên dịch *ví dụ 18.4*. Chúng ta sẽ biên dịch nó trong Linux:

```
$ gcc -c ExtremeC_examples_chapter18_4_shared_mem.c -o shared_mem.o
$ gcc -c ExtremeC_examples_chapter18_4_shared_int32.c -o shared_int32.o
$ gcc -c ExtremeC_examples_chapter18_4_shared_mutex.c -o shared_mutex.o
$ gcc -c ExtremeC_examples_chapter18_4_shared_cond.c -o shared_cond.o
$ gcc -c ExtremeC_examples_chapter18_4_main.c -o main.o
$ gcc shared_mem.o shared_int32.o shared_mutex.o shared_cond.o \  main.o -lpthread -lrt -o ex18_4.out
$
```

*Shell Box 18-6: Biên dịch các source của ví dụ 18.4 và tạo ra executable file cuối cùng*

Giờ chúng ta đã có executable file cuối cùng `ex18_4.out`, chúng ta có thể chạy ba process và xem chúng đếm theo trình tự như thế nào, bất kể bạn gán số cho chúng như thế nào và theo thứ tự nào<a id="_idIndexMarker1301"></a> chúng được chạy. Hãy chạy process đầu tiên. Chúng ta gán cho process này số 3, bằng cách truyền số như một tùy chọn cho executable file:

```
$ ./ex18_4.out 3
My number is 3!
WARN: The shared memory /counter0 does not exist.
The shared memory /counter0 is created and opened.
WARN: The shared memory /mutex0 does not exist.
The shared memory /mutex0 is created and opened.
WARN: The shared memory /cond0 does not exist.
The shared memory /cond0 is created and opened.
Waiting for the signal, just for 5 seconds ...
Checking condition ...
Waiting for the signal, just for 5 seconds ...
Checking condition ...
Waiting for the signal, just for 5 seconds ...
```

*Shell Box 18-7: Chạy process đầu tiên, nhận số 3*

Như bạn thấy trong output trên, process đầu tiên tạo mọi đối tượng dùng chung cần thiết và trở thành chủ sở hữu của các tài nguyên dùng chung. Giờ, hãy chạy process thứ hai trong một Terminal riêng. Nó nhận số 2:

```
$ ./ex18_4.out 2
My number is 2!
The shared memory /counter0 is opened.
The shared memory /mutex0 is opened.
The shared memory /cond0 is opened.
Waiting for the signal, just for 5 seconds ...
Checking condition ...
Waiting for the signal, just for 5 seconds ...
```

*Shell Box 18-8: Chạy process thứ hai, nhận số 2*

Và cuối cùng, process cuối cùng nhận số 1. Vì process này đã được gán số 1, nó in số của mình ngay lập tức, tăng bộ đếm dùng chung, và thông báo cho các process còn lại về điều đó:

```
$ ./ex18_4.out 1
My number is 1!
The shared memory /counter0 is opened.
The shared memory /mutex0 is opened.
The shared memory /cond0 is opened.
My turn! 1 ...
The shared memory /cond0 is unmapped.
The shared memory /cond0 is closed.
The shared memory /mutex0 is unmapped.
The shared memory /mutex0 is closed.
The shared memory /counter0 is unmapped.
The shared memory /counter0 is closed.
$
```

*Shell Box 18-9: Chạy process thứ ba, nhận số 1. Process này sẽ thoát ngay lập tức vì nó có số 1.*

Giờ, nếu bạn<a id="_idIndexMarker1302"></a> quay lại process thứ hai, nó in ra số của mình, tăng bộ đếm dùng chung, và thông báo cho process thứ ba về điều đó:

```
...
Waiting for the signal, just for 5 seconds ...
Checking condition ...
My turn! 2 ...
The shared memory /cond0 is unmapped.
The shared memory /cond0 is closed.
The shared memory /mutex0 is unmapped.
The shared memory /mutex0 is closed.
The shared memory /counter0 is unmapped.
The shared memory /counter0 is closed.
$
```

*Shell Box 18-10: Process thứ hai in số của nó và thoát*

Cuối cùng, quay lại process đầu tiên, nó được process thứ hai thông báo, sau đó nó in ra số của mình và thoát.

```
...
Waiting for the signal, just for 5 seconds ...
Checking condition ...
My turn! 3 ...
The shared memory /cond0 is unmapped.
The shared memory /cond0 is closed.
The shared memory /cond0 is deleted.
The shared memory /mutex0 is unmapped.
The shared memory /mutex0 is closed.
The shared memory /mutex0 is deleted.
The shared memory /counter0 is unmapped.
The shared memory /counter0 is closed.
The shared memory /counter0 is deleted.
$
```

*Shell Box 18-11: Process đầu tiên in số của nó và thoát. Nó cũng xóa mọi mục shared memory.*

Vì process đầu tiên<a id="_idIndexMarker1303"></a> là chủ sở hữu của mọi shared memory, nó nên xóa chúng khi thoát. Việc giải phóng các tài nguyên đã cấp phát trong một môi trường multi-processing có thể khá khó và phức tạp vì một lỗi đơn giản là đủ để khiến mọi process crash. Cần thêm synchronization khi một tài nguyên dùng chung sắp bị gỡ khỏi hệ thống.

Giả sử rằng, trong ví dụ trên, chúng ta đã chạy process đầu tiên với số 2 và process thứ hai với số 3. Do đó, process đầu tiên nên in số của nó trước process thứ hai. Khi process đầu tiên thoát, vì nó là người tạo ra mọi tài nguyên dùng chung, nó xóa các đối tượng dùng chung và process thứ hai crash ngay khi nó muốn truy cập chúng.

Đây chỉ là một ví dụ đơn giản về việc hoàn tất có thể khó và gây vấn đề như thế nào trong các hệ thống multi-process. Để giảm thiểu rủi ro của những crash như vậy, người ta cần đưa thêm synchronization vào giữa các process.

Trong các phần trước, chúng ta đã trình bày các cơ chế có thể được dùng để đồng bộ hóa một số process khi tất cả chúng đều đang chạy trên cùng một host. Trong phần <a id="_idIndexMarker1304"></a>sau, chúng ta sẽ nói ngắn gọn về các cơ chế concurrency control phân tán và các đặc điểm của chúng.

<a id="_idParaDest-258"></a>

## Distributed concurrency control (kiểm soát concurrency phân tán)

Cho đến giờ trong chương này, chúng ta đã<a id="_idIndexMarker1305"></a> giả định rằng mọi process đều tồn tại bên trong cùng một hệ điều hành, và do đó cùng một máy. Nói cách khác, chúng ta liên tục nói về một hệ thống phần mềm single-host.

Nhưng các hệ thống phần mềm thật thường vượt xa điều đó. Ngược lại với hệ thống phần mềm single-host, chúng ta có các hệ thống phần mềm phân tán. Những hệ thống này có các process được phân tán khắp một mạng, và chúng hoạt động thông qua việc giao tiếp qua mạng.

Đối với một hệ thống process phân tán<a id="_idIndexMarker1306"></a>, chúng ta có thể thấy nhiều thách thức hơn ở một số khía cạnh không có mặt ở mức độ đó trong một hệ thống tập trung hay single-host. Tiếp theo, chúng ta thảo luận ngắn gọn một số trong đó:

- **Trong một hệ thống phần mềm phân tán, có lẽ bạn đang trải nghiệm parallelism thay vì concurrency**. Vì mỗi process chạy trên một máy riêng, và mỗi process có bộ xử lý cụ thể riêng, chúng ta sẽ quan sát thấy parallelism thay vì concurrency. Concurrency thường bị giới hạn trong ranh giới của một máy duy nhất. Lưu ý rằng các interleaving vẫn tồn tại và chúng ta có thể trải nghiệm cùng non-determinism như chúng ta đã thấy trong các hệ thống concurrent.
- **Không phải mọi process trong một hệ thống phần mềm phân tán đều được viết bằng một ngôn ngữ lập trình duy nhất**. Khá phổ biến khi thấy nhiều ngôn ngữ lập trình khác nhau được dùng trong một hệ thống phần mềm phân tán. Cũng phổ biến khi thấy cùng sự đa dạng trong các process của một hệ thống phần mềm single-host. Bất chấp giả định ngầm của chúng ta về các process trong một hệ thống, đó là tất cả chúng đều được viết bằng C, chúng ta có thể có các process được viết bằng bất kỳ ngôn ngữ nào khác. Các ngôn ngữ khác nhau cung cấp các cách khác nhau để có concurrency và các cơ chế kiểm soát. Do đó, ví dụ, trong một số ngôn ngữ, bạn có thể không dùng được một named mutex dễ dàng. Các công nghệ và ngôn ngữ lập trình đa dạng được dùng trong một hệ thống phần mềm, single-host hay phân tán, buộc chúng ta phải dùng các cơ chế concurrency control đủ trừu tượng để có sẵn trong tất cả chúng. Điều này có thể giới hạn chúng ta trong việc dùng một kỹ thuật synchronization cụ thể có sẵn trong một công nghệ hay một ngôn ngữ lập trình nhất định.
- **Trong một hệ thống phân tán, bạn luôn có một mạng làm channel giao tiếp giữa hai process không nằm trên cùng một máy**. Điều này ngược với giả định ngầm của chúng ta về hệ thống single-host nơi mọi process đều đang chạy bên trong cùng một hệ điều hành và dùng các hạ tầng truyền thông điệp có sẵn để giao tiếp với nhau.
- **Có một mạng ở giữa có nghĩa là bạn có latency**. Cũng có một latency nhỏ trong các hệ thống single-host, nhưng nó xác định được và quản lý được. Nó cũng thấp hơn nhiều so với latency mà bạn có thể gặp trong một mạng. Latency đơn giản có nghĩa là một process có thể không nhận được một thông điệp ngay lập tức vì nhiều lý do có gốc rễ trong hạ tầng mạng. Không có gì nên được coi là tức thời trong những hệ thống này.
- **Có một mạng ở giữa cũng dẫn đến các vấn đề bảo mật**. Khi bạn có mọi process trong một hệ thống, và tất cả chúng đều đang giao tiếp bên trong<a id="_idIndexMarker1307"></a> cùng một ranh giới bằng các cơ chế có latency cực thấp, các vấn đề bảo mật khác rất nhiều. Người ta trước tiên phải truy cập chính hệ thống để tấn công hệ thống, nhưng trong một hệ thống phân tán, mọi việc truyền thông điệp đều được thực hiện qua mạng. Bạn có thể gặp một *eavesdropper* (kẻ nghe lén) ở giữa để sniff hay, tệ hơn nữa, thay đổi các thông điệp. Về thảo luận của chúng ta về synchronization trong các hệ thống phân tán, điều này cũng áp dụng cho các thông điệp được dùng để đồng bộ hóa các process trong một hệ thống phân tán.
- **Ngoài latency và các vấn đề bảo mật, bạn có thể có các vấn đề chuyển giao vốn xảy ra ít thường xuyên hơn nhiều trong các hệ thống multi-process single-host**. Thông điệp nên được chuyển giao để được xử lý. Khi một process gửi một thông điệp tới một process khác trong hệ thống, bằng cách nào đó process gửi nên bảo đảm rằng thông điệp của nó được đầu bên kia nhận. Các cơ chế *delivery guarantee* (bảo đảm chuyển giao) là khả thi, nhưng chúng tốn kém và, trong một số kịch bản, đơn giản là hoàn toàn không thể dùng chúng. Trong những tình huống đó, một loại vấn đề truyền thông điệp đặc biệt được thấy, thường được mô hình hóa bằng *Two Generals Problem* (bài toán hai vị tướng) nổi tiếng.

Những khác biệt và vấn đề khả dĩ trên là đủ để buộc chúng ta phát minh ra các cách synchronization mới giữa các process và các thành phần khác nhau của các hệ thống phân tán khổng lồ. Nói chung, có hai cách để làm cho một hệ thống phân tán có tính giao dịch và được đồng bộ hóa:

- **Centralized process synchronization** (đồng bộ hóa process tập trung): Những kỹ thuật này cần một process (hay node) trung tâm quản lý<a id="_idIndexMarker1308"></a> các process. Mọi process khác trong hệ thống nên liên tục giao tiếp với node trung tâm này, và chúng cần sự chấp thuận của nó để đi vào critical section của chúng.
- **Distributed (or peer-to-peer) process synchronization** (đồng bộ hóa process phân tán hay ngang hàng): Có một hạ tầng process synchronization<a id="_idIndexMarker1309"></a> không có node trung tâm không phải là một việc dễ dàng. Đây thực ra là một lĩnh vực nghiên cứu đang sôi động, và có một số thuật toán ad hoc.

Trong phần này, chúng tôi đã cố gắng làm sáng tỏ đôi chút sự phức tạp của concurrency control trong một hệ thống multi-process phân tán. Các thảo luận thêm về concurrency control phân tán sẽ nằm ngoài phạm vi của cuốn sách này.

<a id="_idParaDest-259"></a>

## Tóm tắt

Trong chương này, chúng ta đã hoàn tất thảo luận về các môi trường multi-processing. Trong chương này, chúng ta đã thảo luận những điều sau:

- Named semaphore là gì và nó có thể được tạo và dùng bởi nhiều process như thế nào.
- Named mutex là gì và nó nên được dùng với một vùng shared memory như thế nào.
- Chúng tôi đã đưa ra một ví dụ về việc điều phối kết thúc trong đó một số process đang chờ một dấu hiệu để kết thúc và signal được nhận và xử lý bởi một trong các process và được lan truyền tới các process khác. Chúng tôi đã triển khai ví dụ này bằng mutex dùng chung.
- Named condition variable là gì và nó có thể trở thành dùng chung và có tên bằng một vùng shared memory như thế nào.
- Chúng tôi đã minh họa một ví dụ khác về các process đếm. Trong ví dụ này, chúng ta đã dùng inheritance để giảm lượng code trùng lặp cho các đối tượng mutex và condition variable có một vùng shared memory liên kết.
- Chúng ta đã khám phá ngắn gọn những khác biệt và thách thức có trong một hệ thống phân tán.
- Chúng ta đã thảo luận ngắn gọn các phương pháp có thể được dùng để đưa concurrency control vào phần mềm phân tán.

Trong chương sắp tới, chúng ta bắt đầu thảo luận về các kỹ thuật **Inter-Process Communication** (**IPC**). Các thảo luận của chúng ta sẽ trải dài qua hai chương và chúng ta sẽ trình bày nhiều chủ đề như mạng máy tính, giao thức transport, socket programming, và nhiều chủ đề hữu ích khác.
