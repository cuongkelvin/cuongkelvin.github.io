# 28 Lock

Trong phần giới thiệu concurrency, chúng ta thấy một vấn đề cơ bản của lập trình concurrent: muốn thực thi atomically một chuỗi instruction, nhưng không thể vì interrupt trên một processor (hoặc nhiều thread thực thi đồng thời trên nhiều processor). Vì vậy, chương này giải quyết trực tiếp vấn đề bằng cách giới thiệu lock. Lập trình viên thêm lock vào source code, bao quanh critical section, nhờ đó bảo đảm mỗi critical section thực thi như một atomic instruction duy nhất.

## 28.1 Lock: Ý tưởng cơ bản

Chẳng hạn, giả sử critical section như sau, thao tác cập nhật shared variable điển hình:

```
balance = balance + 1;
```

Tất nhiên có những critical section khác, như thêm phần tử vào linked list hoặc cập nhật shared structure phức tạp hơn, nhưng hiện tại hãy dùng ví dụ đơn giản này. Để sử dụng lock, chúng ta thêm code bao quanh critical section như sau:

```
 1   lock_t mutex; // some globally-allocated lock ’mutex’
 2   ...
 3   lock(&mutex);
 4   balance = balance + 1;
 5   unlock(&mutex);
```

Lock chỉ là một biến, vì vậy muốn dùng phải khai báo một biến lock thuộc kiểu nào đó (như mutex ở trên). Biến lock này (gọi ngắn là “lock”) giữ state của lock tại mọi thời điểm. Nó hoặc available (unlocked hay free), tức không thread nào giữ lock, hoặc acquired (locked hay held), tức đúng một thread giữ lock và có lẽ đang trong critical section. Chúng ta cũng có thể lưu thông tin khác trong data type, như thread nào giữ lock hoặc queue sắp thứ tự acquire lock, nhưng thông tin đó được ẩn khỏi người dùng lock.

Semantics của routine lock() và unlock() rất đơn giản. Gọi lock() để thử acquire lock; nếu không thread khác giữ lock (tức nó free), thread sẽ acquire lock và vào critical section; đôi khi gọi thread này là owner của lock. Nếu thread khác gọi lock() trên cùng biến lock (ở ví dụ này là mutex), nó không quay về khi lock còn được thread khác giữ; theo cách đó, thread khác bị ngăn vào critical section trong khi thread đầu tiên giữ lock đang ở trong.

Khi owner gọi unlock(), lock lại available (free). Nếu không thread nào khác đang chờ lock (tức không thread khác đã gọi lock() rồi mắc kẹt), state của lock chỉ được đổi thành free. Nếu có thread đang chờ (mắc trong lock()), một thread trong số đó (cuối cùng) sẽ nhận thấy (hoặc được thông báo về) thay đổi state, acquire lock và vào critical section.

Lock cho lập trình viên một mức kiểm soát scheduling tối thiểu. Nói chung chúng ta xem thread là thực thể do lập trình viên tạo nhưng được OS schedule theo bất kỳ cách OS chọn. Lock trả lại một phần quyền kiểm soát đó cho lập trình viên; đặt lock quanh đoạn code bảo đảm không quá một thread hoạt động trong code đó. Vì vậy lock giúp biến scheduling OS hỗn loạn truyền thống thành hoạt động được kiểm soát hơn.

## 28.2 Pthread Lock

Tên thư viện POSIX dùng cho lock là mutex, vì nó cung cấp mutual exclusion giữa các thread: nếu một thread ở critical section, nó ngăn thread khác vào cho tới khi hoàn tất. Vì vậy khi thấy code POSIX thread sau, bạn nên hiểu nó làm giống ở trên (chúng ta lại dùng wrapper kiểm tra lỗi khi lock và unlock):

```
 1   pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
 2
 3   Pthread_mutex_lock(&lock);   // wrapper for pthread_mutex_lock()
 4   balance = balance + 1;
 5   Pthread_mutex_unlock(&lock);
```

Bạn cũng có thể thấy phiên bản POSIX truyền biến cho lock và unlock, vì có thể dùng những lock khác nhau bảo vệ những biến khác nhau. Điều này tăng concurrency: thay cho một lock lớn được dùng mỗi lần truy cập bất kỳ critical section nào (chiến lược locking coarse-grained), người ta thường bảo vệ dữ liệu và data structure khác nhau bằng lock khác nhau, cho phép nhiều thread đồng thời ở trong code được lock (cách tiếp cận fine-grained hơn).

## 28.3 Xây dựng lock

Đến đây, bạn đã hiểu phần nào lock hoạt động thế nào từ góc nhìn lập trình viên. Nhưng nên xây dựng lock ra sao? Cần hardware hỗ trợ gì? OS hỗ trợ gì? Phần còn lại của chương trả lời nhóm câu hỏi đó.

> Mấu chốt: CÁCH XÂY DỰNG LOCK
>
> Làm sao xây dựng lock hiệu quả? Lock hiệu quả cung cấp mutual exclusion với chi phí thấp, và có thể đạt thêm những thuộc tính bàn dưới đây. Cần hardware hỗ trợ gì? OS hỗ trợ gì?

Để xây dựng lock hoạt động, chúng ta cần giúp đỡ từ người bạn cũ hardware và người bạn tốt OS. Qua nhiều năm, nhiều hardware primitive khác nhau đã được thêm vào instruction set của các computer architecture; chúng ta không nghiên cứu cách triển khai instruction (đó là chủ đề môn computer architecture), nhưng sẽ nghiên cứu cách dùng chúng để xây dựng mutual exclusion primitive như lock. Chúng ta cũng nghiên cứu cách OS tham gia hoàn thiện bức tranh và giúp xây dựng thư viện locking tinh vi.

## 28.4 Đánh giá lock

Trước khi xây dựng lock, cần hiểu mục tiêu và cách đánh giá hiệu quả của một triển khai cụ thể. Để đánh giá lock có hoạt động (tốt) không, cần xác lập vài tiêu chí cơ bản. Đầu tiên là lock có thực hiện nhiệm vụ cơ bản là mutual exclusion không. Về cơ bản, nó có ngăn nhiều thread cùng vào critical section không?

Thứ hai là fairness. Mỗi thread tranh chấp lock có cơ hội công bằng acquire lock khi nó free không? Một cách nhìn khác là xem trường hợp cực đoan: có thread tranh chấp nào bị starvation và do đó không bao giờ lấy được lock không?

Tiêu chí cuối cùng là hiệu năng, cụ thể time overhead do dùng lock. Có vài trường hợp đáng xem xét. Một là không có contention: khi một thread chạy rồi lấy và release lock, overhead là bao nhiêu? Hai là nhiều thread tranh chấp lock trên một CPU: có vấn đề hiệu năng nào? Cuối cùng, lock hoạt động ra sao khi có nhiều CPU và thread trên mỗi CPU đều tranh chấp? So sánh các tình huống giúp hiểu tác động hiệu năng của các kỹ thuật locking khác nhau mô tả dưới đây.

## 28.5 Điều khiển interrupt

Một trong những giải pháp mutual exclusion sớm nhất là disable interrupt cho critical section; giải pháp này được phát minh cho hệ thống single-processor. Code như sau:

```
 1   void lock() {
 2       DisableInterrupts();
 3   }
 4   void unlock() {
 5       EnableInterrupts();
 6   }
```

Giả sử đang chạy trên hệ thống single-processor như vậy. Tắt interrupt (bằng một hardware instruction đặc biệt) trước khi vào critical section bảo đảm code bên trong không bị interrupt và thực thi như atomic. Khi xong, chúng ta re-enable interrupt (lại qua hardware instruction), và chương trình tiếp tục bình thường.

Ưu điểm chính là đơn giản. Bạn không cần suy nghĩ quá nhiều để hiểu tại sao nó hoạt động. Không có interrupt, thread có thể chắc rằng code của mình sẽ thực thi và không thread khác can thiệp.

Thật không may, nhược điểm có nhiều. Thứ nhất, cách này yêu cầu cho phép bất kỳ calling thread nào thực hiện privileged operation (bật tắt interrupt), tin rằng khả năng đó không bị lạm dụng. Như bạn biết, bất cứ lúc nào phải tin chương trình tùy ý, có lẽ chúng ta gặp rắc rối. Ở đây có nhiều biểu hiện: chương trình tham lam có thể gọi lock() ngay đầu rồi độc chiếm processor; tệ hơn, chương trình sai hoặc độc hại có thể gọi lock() rồi vào endless loop. Trường hợp sau khiến OS không bao giờ lấy lại quyền điều khiển hệ thống, chỉ còn cách khởi động lại. Dùng disable interrupt làm giải pháp synchronization general-purpose đòi hỏi quá nhiều tin tưởng ứng dụng.

Thứ hai, cách này không hoạt động trên multiprocessor. Nếu nhiều thread chạy trên các CPU khác nhau và đều thử vào cùng critical section, disable interrupt không giải quyết được gì; thread vẫn chạy được trên processor khác và có thể vào critical section. Vì multiprocessor giờ phổ biến, giải pháp tổng quát phải tốt hơn.

Thứ ba, tắt interrupt lâu có thể làm mất interrupt, dẫn đến vấn đề hệ thống nghiêm trọng. Chẳng hạn, nếu CPU bỏ lỡ việc disk device hoàn tất read request, OS biết thế nào để đánh thức process đang chờ thao tác read đó?

Cuối cùng, có lẽ ít quan trọng nhất, cách này có thể kém hiệu quả. So với thực thi instruction thường, code mask hoặc unmask interrupt thường chạy chậm trên CPU hiện đại.

Vì vậy, tắt interrupt chỉ được dùng trong ngữ cảnh hạn chế như một primitive mutual-exclusion. Chẳng hạn, đôi khi bản thân operating system dùng interrupt masking bảo đảm atomicity khi truy cập data structure riêng, hoặc ít nhất ngăn vài tình huống interrupt handling rắc rối. Cách dùng này hợp lý vì vấn đề tin tưởng biến mất bên trong OS, vốn luôn tin chính mình thực hiện privileged operation.

> BÊN LỀ: THUẬT TOÁN DEKKER VÀ PETERSON
>
> Vào thập niên 1960, Dijkstra nêu vấn đề concurrency với bạn bè, và một người, nhà toán học Theodorus Jozef Dekker, đưa ra lời giải [D68]. Khác những giải pháp ở đây dùng hardware instruction đặc biệt và cả OS hỗ trợ, thuật toán Dekker chỉ dùng load và store (giả định chúng atomic đối với nhau, đúng trên hardware thời đầu).
>
> Peterson sau đó cải tiến cách này [P81]. Một lần nữa chỉ dùng load và store, với ý tưởng bảo đảm hai thread không bao giờ cùng vào critical section. Đây là thuật toán Peterson (cho hai thread); hãy thử hiểu code. Các biến flag và turn dùng làm gì?
>
> ```
> int flag[2];
> int turn;
>
> void init() {
>     flag[0] = flag[1] = 0;    // 1->thread wants to grab lock
>     turn = 0;                 // whose turn? (thread 0 or 1?)
> }
> void lock() {
>     flag[self] = 1;           // self: thread ID of caller
>     turn = 1 - self;          // make it other thread’s turn
>     while ((flag[1-self] == 1) && (turn == 1 - self))
>         ; // spin-wait
> }
> void unlock() {
>     flag[self] = 0;           // simply undo your intent
> }
> ```
>
> Vì lý do nào đó, phát triển lock hoạt động không cần hardware hỗ trợ đặc biệt từng trở thành trào lưu, cho giới theory-types nhiều vấn đề nghiên cứu. Tất nhiên, hướng này trở nên khá vô dụng khi người ta nhận ra giả định một ít hardware hỗ trợ dễ hơn nhiều (và thực sự hỗ trợ đó đã có từ thời đầu multiprocessing). Hơn nữa, các thuật toán như trên không hoạt động trên hardware hiện đại (do relaxed memory consistency model), càng làm chúng ít hữu ích hơn trước. Thêm nghiên cứu bị bỏ vào sọt rác lịch sử...

```
 1   typedef struct __lock_t { int flag; } lock_t;
 2
 3   void init(lock_t *mutex) {
 4       // 0 -> lock is available, 1 -> held
 5       mutex->flag = 0;
 6   }
 7
 8   void lock(lock_t *mutex) {
 9       while (mutex->flag == 1)  // TEST the flag
10           ; // spin-wait (do nothing)
11       mutex->flag = 1;          // now SET it!
12   }
13
14   void unlock(lock_t *mutex) {
15       mutex->flag = 0;
16   }
```

Hình 28.1: Thử lần đầu: Flag đơn giản

## 28.6 Test And Set (Atomic Exchange)

Vì disable interrupt không hoạt động trên nhiều processor, người thiết kế hệ thống bắt đầu phát minh hardware hỗ trợ locking. Các hệ thống multiprocessor sớm nhất, như Burroughs B5000 đầu thập niên 1960 [M82], đã có hỗ trợ đó; ngày nay mọi hệ thống đều cung cấp, kể cả hệ thống một CPU.

Hardware hỗ trợ dễ hiểu nhất là instruction test-and-set, cũng gọi là atomic exchange. Để hiểu test-and-set hoạt động thế nào, hãy thử xây dựng lock đơn giản không dùng nó. Trong lần thử thất bại này, chúng ta dùng biến flag đơn giản chỉ lock đang được giữ hay không.

Trong lần thử đầu (Hình 28.1), ý tưởng đơn giản: dùng biến cho biết có thread đang giữ lock không. Thread đầu vào critical section gọi lock(), kiểm tra flag bằng 1 không (ở đây không), rồi đặt flag bằng 1 để chỉ nó đang giữ lock. Khi xong critical section, thread gọi unlock() và xóa flag, cho biết lock không còn được giữ.

Nếu thread khác gọi lock() khi thread đầu đang trong critical section, nó chỉ spin-wait trong while loop chờ thread đó gọi unlock() rồi xóa flag. Khi thread đầu làm vậy, waiting thread thoát while loop, tự đặt flag bằng 1 và đi vào critical section.

Thật không may, code có hai vấn đề: correctness và hiệu năng. Vấn đề correctness dễ thấy khi quen suy nghĩ về lập trình concurrent. Hãy tưởng tượng code interleaving trong Hình 28.2 (trang 7); giả sử ban đầu flag=0.

Như interleaving cho thấy, với interrupt đúng lúc (hay không đúng lúc?), dễ tạo trường hợp cả hai thread đặt flag bằng 1 và đều vào critical section. Giới chuyên môn gọi hành vi này là “tệ” – rõ ràng chúng ta không đáp ứng yêu cầu cơ bản nhất: mutual exclusion.

| Thread 1 | Thread 2 |
|---|---|
| gọi lock() |  |
| while (flag == 1) |  |
| interrupt: chuyển sang Thread 2 |  |
|  | gọi lock() |
|  | while (flag == 1) |
|  | flag = 1; |
|  | interrupt: chuyển sang Thread 1 |
| flag = 1; // set flag to 1 (too!) |  |

Hình 28.2: Trace: Không có Mutual Exclusion

Vấn đề hiệu năng, sẽ bàn thêm sau, nằm ở cách thread chờ acquire lock đang được giữ: nó kiểm tra liên tục giá trị flag, kỹ thuật gọi là spin-waiting. Spin-waiting lãng phí thời gian chờ thread khác release lock. Lãng phí đặc biệt lớn trên uniprocessor, nơi thread được chờ thậm chí không chạy được (ít nhất đến khi context switch xảy ra)! Vì vậy, khi phát triển giải pháp tinh vi hơn, cũng nên tìm cách tránh lãng phí này.

## 28.7 Xây dựng Spin Lock hoạt động

Dù ý tưởng sau ví dụ trên tốt, không thể triển khai nếu thiếu hardware hỗ trợ. May thay, một số hệ thống cung cấp instruction hỗ trợ tạo lock đơn giản theo ý tưởng đó. Instruction mạnh hơn này có tên khác nhau — SPARC gọi load/store unsigned byte (ldstub), x86 gọi atomic exchange (xchg) — nhưng cơ bản làm cùng việc trên các platform, thường gọi là test-and-set. Chúng ta định nghĩa hành vi của test-and-set bằng đoạn code C sau:

```
 1   int TestAndSet(int *old_ptr, int new) {
 2       int old = *old_ptr; // fetch old value at old_ptr
 3       *old_ptr = new;     // store ’new’ into old_ptr
 4       return old;         // return the old value
 5   }
```

Instruction test-and-set thực hiện như sau. Nó trả về giá trị cũ mà ptr trỏ tới, đồng thời cập nhật giá trị đó thành new. Tất nhiên, điểm then chốt là chuỗi operation thực hiện atomically. Tên “test and set” vì nó cho phép “test” giá trị cũ (giá trị trả về) đồng thời “set” memory location thành giá trị mới; instruction mạnh hơn một chút này đủ để xây dựng spin lock đơn giản, như Hình 28.3. Hoặc tốt hơn: hãy tự tìm ra trước!

Hãy bảo đảm hiểu tại sao lock này hoạt động. Trước tiên tưởng tượng thread gọi lock() và không thread nào khác giữ lock; flag phải bằng 0. Khi thread gọi TestAndSet(flag, 1), routine trả về giá trị flag cũ là 0; do đó calling thread đang kiểm tra flag không mắc kẹt spin trong while loop và acquire lock. Thread cũng atomically đặt giá trị bằng 1, chỉ lock đang được giữ. Khi xong critical section, thread gọi unlock() đặt flag về không.

```
 1   typedef struct __lock_t {
 2       int flag;
 3   } lock_t;
 4
 5   void init(lock_t *lock) {
 6       // 0 indicates that lock is available, 1 that it is held
 7       lock->flag = 0;
 8   }
 9
10   void lock(lock_t *lock) {
11       while (TestAndSet(&lock->flag, 1) == 1)
12           ; // spin-wait (do nothing)
13   }
14
15   void unlock(lock_t *lock) {
16       lock->flag = 0;
17   }
```

Hình 28.3: Spin Lock đơn giản dùng Test-and-set

Trường hợp thứ hai là một thread đã giữ lock (flag bằng 1). Khi đó thread này gọi lock() rồi cũng gọi TestAndSet(flag, 1). Lần này TestAndSet() trả về giá trị flag cũ là 1 (vì lock đang được giữ), đồng thời lại đặt nó bằng 1. Chừng nào thread khác còn giữ lock, TestAndSet() liên tục trả về 1, khiến thread spin mãi đến khi lock được release. Khi thread khác cuối cùng đặt flag bằng 0, thread này gọi TestAndSet() lần nữa, lúc đó trả về 0 đồng thời atomically đặt giá trị bằng 1, nhờ vậy acquire lock và vào critical section.

Bằng cách gộp test (giá trị lock cũ) và set (giá trị mới) thành một atomic operation, chúng ta bảo đảm chỉ một thread acquire lock. Đó là cách xây dựng mutual exclusion primitive hoạt động!

Giờ có thể bạn hiểu tại sao loại lock này thường gọi spin lock. Đây là loại lock đơn giản nhất để xây dựng, chỉ spin và dùng CPU cycle đến khi lock available. Để hoạt động đúng trên một processor, cần preemptive scheduler (thỉnh thoảng ngắt thread bằng timer để chạy thread khác). Không có preemption, spin lock ít ý nghĩa trên một CPU, vì thread spin trên CPU không bao giờ nhường CPU.

> MẸO: NGHĨ VỀ CONCURRENCY NHƯ SCHEDULER ĐỘC ÁC
>
> Ví dụ cho thấy cách cần tiếp cận để hiểu concurrent execution. Hãy giả vờ mình là scheduler độc ác, ngắt thread vào thời điểm bất lợi nhất nhằm phá nỗ lực yếu ớt xây dựng synchronization primitive của chúng. Scheduler thật xấu tính! Dù chuỗi interrupt chính xác có thể khó xảy ra, nó vẫn có thể xảy ra, và chỉ vậy đã đủ chứng minh một cách tiếp cận không hoạt động. Suy nghĩ độc ác có thể hữu ích! (ít nhất đôi khi)

## 28.8 Đánh giá Spin Lock

Với spin lock cơ bản, giờ chúng ta đánh giá hiệu quả theo các tiêu chí trước. Quan trọng nhất là correctness: có cung cấp mutual exclusion không? Có: spin lock chỉ cho một thread vào critical section tại một thời điểm. Vì vậy chúng ta có lock đúng.

Tiếp theo là fairness. Spin lock công bằng thế nào với waiting thread? Có bảo đảm waiting thread sẽ có lúc vào critical section không? Đáng tiếc, tin xấu là spin lock không có bảo đảm fairness. Thực ra khi contention, thread có thể spin mãi. Spin lock không công bằng và có thể gây starvation.

Tiêu chí cuối là hiệu năng. Chi phí dùng spin lock là gì? Để phân tích kỹ hơn, hãy nghĩ vài trường hợp. Trong trường hợp đầu, hãy tưởng tượng các thread tranh chấp lock trên một processor; trong trường hợp thứ hai, hãy xem xét các thread phân bố trên nhiều processor.

Với spin lock trên một CPU, performance overhead có thể rất lớn; tưởng tượng thread giữ lock bị pre-empted trong critical section. Scheduler sau đó có thể chạy mọi thread khác (giả sử có N − 1), mỗi thread đều thử acquire lock. Mỗi thread sẽ spin hết một time slice trước khi nhường CPU, lãng phí CPU cycle.

Tuy nhiên, trên nhiều CPU, spin lock hoạt động khá tốt (nếu số thread xấp xỉ số CPU). Lập luận như sau: Thread A trên CPU 1 và Thread B trên CPU 2 cùng tranh lock. Nếu Thread A (CPU 1) lấy lock rồi Thread B thử lấy, B sẽ spin (trên CPU 2). Nhưng critical section có lẽ ngắn, nên lock sớm available và Thread B acquire được. Spin chờ lock được giữ trên processor khác không lãng phí nhiều cycle trong trường hợp này nên có thể hiệu quả.

## 28.9 Compare-And-Swap

Một hardware primitive khác mà một số hệ thống cung cấp là instruction compare-and-swap (tên trên SPARC chẳng hạn), hoặc compare-and-exchange (tên trên x86). Pseudocode C cho instruction đơn lẻ này trong Hình 28.4.

Ý tưởng cơ bản của compare-and-swap là kiểm tra giá trị tại address do ptr chỉ định có bằng expected không; nếu có, cập nhật memory location mà ptr trỏ tới thành new. Nếu không, không làm gì. Trong cả hai trường hợp, trả về giá trị thực tại memory location đó, cho phép code gọi compare-and-swap biết có thành công không.

```
 1   int CompareAndSwap(int *ptr, int expected, int new) {
 2       int actual = *ptr;
 3       if (actual == expected)
 4           *ptr = new;
 5       return actual;
 6   }
```

Hình 28.4: Compare-and-swap

Với instruction compare-and-swap, có thể xây dựng lock gần giống cách dùng test-and-set. Chẳng hạn, chỉ cần thay routine lock() trên bằng:

```
 1   void lock(lock_t *lock) {
 2       while (CompareAndSwap(&lock->flag, 0, 1) == 1)
 3           ; // spin
 4   }
```

Phần code còn lại giống ví dụ test-and-set ở trên. Code hoạt động tương tự: kiểm tra flag bằng 0 không, nếu có thì atomically đổi thành 1 để acquire lock. Thread thử acquire khi lock đang được giữ sẽ mắc kẹt spin đến khi lock được release.

Nếu muốn xem cách thực sự tạo x86-version của compare-and-swap có thể C-callable, chuỗi code này có thể hữu ích (từ [S05]):

```
 1   char CompareAndSwap(int *ptr, int old, int new) {
 2       unsigned char ret;
 3
 4       // Note that sete sets a ’byte’ not the word
 5       __asm__ __volatile__ (
 6             "  lock\n"
 7             "  cmpxchgl %2,%1\n"
 8             "  sete %0\n"
 9             : "=q" (ret), "=m" (*ptr)
10             : "r" (new), "m" (*ptr), "a" (old)
11             : "memory");
12       return ret;
13   }
```

Cuối cùng, có thể bạn nhận thấy compare-and-swap mạnh hơn test-and-set. Sau này chúng ta dùng sức mạnh đó khi tìm hiểu sơ qua wait-free synchronization [H91]. Tuy nhiên, nếu chỉ xây dựng spin lock đơn giản, hành vi giống hệt spin lock đã phân tích.

```
 1   int LoadLinked(int *ptr) {
 2       return *ptr;
 3   }
 4
 5   int StoreConditional(int *ptr, int value) {
 6       if (no one has updated *ptr since the LoadLinked to this address) {
 7           *ptr = value;
 8           return 1; // success!
 9       } else {
10           return 0; // failed to update
11       }
12   }
```

Hình 28.5: Load-linked và Store-conditional

## 28.10 Load-Linked và Store-Conditional

Một số platform cung cấp cặp instruction phối hợp để xây dựng critical section. Chẳng hạn trên MIPS [H93], có thể dùng load-linked và store-conditional cùng nhau để xây dựng lock và concurrent structure khác. Pseudocode C của chúng trong Hình 28.5. Alpha, PowerPC và ARM cung cấp instruction tương tự [W09].

load-linked hoạt động giống load thông thường: lấy giá trị từ memory vào register. Khác biệt then chốt là store-conditional, chỉ thành công (cập nhật giá trị tại address vừa load-linked) nếu không có store nào vào address đó xen giữa. Khi thành công, store-conditional trả về 1 và cập nhật giá trị tại ptr thành value; nếu thất bại, không cập nhật giá trị tại ptr và trả về 0.

Hãy tự thử thách bằng cách nghĩ cách xây dựng lock với load-linked và store-conditional. Khi xong, xem code dưới đây cung cấp một lời giải đơn giản. Hãy làm đi! Lời giải trong Hình 28.6.

Code lock() là phần thú vị duy nhất. Đầu tiên thread spin chờ flag được đặt bằng 0 (chỉ lock không được giữ). Sau đó thread thử acquire qua store-conditional; nếu thành công, thread đã atomically đổi flag thành 1 và có thể vào critical section.

```
 1   void lock(lock_t *lock) {
 2       while (1) {
 3           while (LoadLinked(&lock->flag) == 1)
 4               ; // spin until it’s zero
 5           if (StoreConditional(&lock->flag, 1) == 1)
 6               return; // if set-it-to-1 was a success: all done
 7                       // otherwise: try it all over again
 8       }
 9   }
10
11   void unlock(lock_t *lock) {
12       lock->flag = 0;
13   }
```

Hình 28.6: Dùng LL/SC xây dựng lock

> MẸO: ÍT CODE HƠN LÀ CODE TỐT HƠN (ĐỊNH LUẬT LAUER)
>
> Lập trình viên hay khoe đã viết nhiều code thế nào để làm việc gì đó. Điều này sai về cơ bản. Thay vào đó, nên khoe viết ít code thế nào để hoàn thành nhiệm vụ. Code ngắn gọn luôn được ưu tiên; thường dễ hiểu và ít bug hơn. Như Hugh Lauer nói khi bàn xây dựng operating system Pilot: “Nếu cùng những người đó có thời gian gấp đôi, họ có thể tạo hệ thống tốt tương đương với nửa lượng code.” [L81] Chúng ta gọi đó là định luật Lauer, rất đáng nhớ. Lần tới khi khoe lượng code viết để làm bài tập, hãy nghĩ lại, hoặc tốt hơn hãy quay lại viết lại, làm code rõ ràng và ngắn gọn nhất có thể.

Lưu ý store-conditional có thể thất bại thế nào. Một thread gọi lock() và thực thi load-linked, nhận 0 vì lock không được giữ. Trước khi thử store-conditional, nó bị interrupt và thread khác vào code lock, cũng thực thi load-linked, cũng nhận 0 và tiếp tục. Lúc này hai thread đều đã thực thi load-linked và chuẩn bị thử store-conditional. Đặc điểm then chốt là chỉ một thread thành công cập nhật flag bằng 1 và acquire lock; thread thử store-conditional thứ hai thất bại (vì thread kia cập nhật flag giữa load-linked và store-conditional của nó), nên phải thử acquire lại.

Trong lớp vài năm trước, sinh viên đại học David Capel đề xuất phiên bản ngắn gọn hơn dưới đây, cho những bạn thích boolean conditional short-circuiting. Hãy thử hiểu tại sao tương đương. Chắc chắn ngắn hơn!

```
 1   void lock(lock_t *lock) {
 2     while (LoadLinked(&lock->flag)||!StoreConditional(&lock->flag, 1))
 3       ; // spin
 4   }
```

## 28.11 Fetch-And-Add

Hardware primitive cuối cùng là instruction fetch-and-add, atomically tăng một giá trị đồng thời trả về giá trị cũ tại address cụ thể. Pseudocode C cho fetch-and-add như sau:

```
 1   int FetchAndAdd(int *ptr) {
 2       int old = *ptr;
 3       *ptr = old + 1;
 4       return old;
 5   }
 1   typedef struct __lock_t {
 2       int ticket;
 3       int turn;
 4   } lock_t;
 5
 6   void lock_init(lock_t *lock) {
 7       lock->ticket = 0;
 8       lock->turn   = 0;
 9   }
10
11   void lock(lock_t *lock) {
12       int myturn = FetchAndAdd(&lock->ticket);
13       while (lock->turn != myturn)
14           ; // spin
15    }
16
17   void unlock(lock_t *lock) {
18       lock->turn = lock->turn + 1;
19   }
```

Hình 28.7: Ticket Lock

Trong ví dụ này, chúng ta dùng fetch-and-add xây dựng ticket lock thú vị hơn, do Mellor-Crummey và Scott [MS91] giới thiệu. Code lock và unlock như Hình 28.7.

Thay cho một giá trị, lời giải dùng kết hợp biến ticket và turn để xây dựng lock. Hoạt động cơ bản đơn giản: khi muốn acquire lock, thread trước tiên thực hiện atomic fetch-and-add trên ticket; giá trị đó trở thành “lượt” của thread (myturn). Sau đó dùng lock->turn được chia sẻ toàn cục để xác định đến lượt thread nào; khi (myturn == turn) với một thread, đến lượt nó vào critical section. Unlock chỉ cần tăng turn để waiting thread tiếp theo (nếu có) vào critical section.

Lưu ý khác biệt quan trọng so với các lần thử trước: lời giải bảo đảm tiến triển cho mọi thread. Khi được gán ticket, thread sẽ được schedule vào thời điểm nào đó trong tương lai (sau khi những thread đứng trước đã qua critical section và release lock). Trước đây không có bảo đảm đó; thread spin trên test-and-set (chẳng hạn) có thể spin mãi dù thread khác vẫn acquire rồi release lock.

## 28.12 Spin quá nhiều: Giờ làm gì?

Các lock hardware-based của chúng ta đơn giản (chỉ vài dòng code) và hoạt động đúng (bạn có thể chứng minh bằng cách viết code nếu muốn), hai thuộc tính tuyệt vời của mọi hệ thống hay code. Nhưng đôi khi chúng khá kém hiệu quả. Tưởng tượng chạy hai thread trên một processor. Một thread (thread 0) trong critical section giữ lock, không may bị interrupt. Thread thứ hai (thread 1) thử acquire nhưng thấy lock đang được giữ. Nó bắt đầu spin. Rồi spin. Rồi spin tiếp. Cuối cùng timer interrupt xảy ra, thread 0 chạy lại, release lock, và cuối cùng (lần tiếp theo chạy chẳng hạn), thread 1 không phải spin nhiều nữa và acquire được lock. Vì vậy, mỗi lần thread mắc kẹt spin như vậy, nó lãng phí nguyên time slice chỉ kiểm tra giá trị sẽ không thay đổi! Vấn đề tệ hơn với N thread tranh lock; N − 1 time slice có thể lãng phí tương tự, chỉ spin chờ một thread release lock. Từ đó có vấn đề tiếp theo:

> MẤU CHỐT: CÁCH TRÁNH SPIN
>
> Làm sao phát triển lock không lãng phí thời gian spin không cần thiết trên CPU?

Chỉ hardware hỗ trợ không giải quyết được. Chúng ta cũng cần OS! Hãy tìm hiểu cách thực hiện.

## 28.13 Cách đơn giản: Cứ Yield đi

Hardware đã giúp đi khá xa: lock hoạt động, thậm chí fairness khi acquire (như ticket lock). Nhưng vẫn có vấn đề: làm gì khi context switch xảy ra trong critical section và thread bắt đầu spin vô tận, chờ thread lock-holding bị ngắt chạy lại?

Lần thử đầu là cách đơn giản và thân thiện: khi sắp spin, thay vào đó nhường CPU cho thread khác. Hoặc như Al Davis có thể nói, “cứ yield đi!” [D91]. Hình 28.8 trình bày cách này.

Ở đây giả định operating system cung cấp primitive yield(), thread gọi khi muốn nhường CPU để thread khác chạy. Thread có một trong ba state (running, ready hoặc blocked); yield chỉ là system call chuyển caller từ running sang ready, nhờ đó đưa thread khác sang running. Về cơ bản, process yield tự deschedule mình.

```
 1   void init() {
 2       flag = 0;
 3   }
 4
 5   void lock() {
 6       while (TestAndSet(&flag, 1) == 1)
 7           yield(); // give up the CPU
 8   }
 9
10   void unlock() {
11       flag = 0;
12   }
```

Hình 28.8: Lock với Test-and-set và Yield

Nghĩ ví dụ hai thread trên một CPU; cách yield-based hoạt động khá tốt. Nếu thread gọi lock() và thấy lock đang được giữ, nó chỉ yield CPU, cho thread khác chạy và hoàn tất critical section. Trong trường hợp đơn giản này, yield hoạt động tốt.

Giờ xét nhiều thread (giả sử 100) liên tục tranh lock. Nếu một thread acquire lock rồi bị preempt trước khi release, 99 thread còn lại mỗi thread gọi lock(), thấy lock được giữ và yield CPU. Giả sử scheduler round-robin, mỗi thread trong 99 thread thực hiện mẫu run-and-yield trước khi thread giữ lock chạy lại. Dù tốt hơn spin (lãng phí 99 time slice), cách này vẫn tốn kém; context switch có chi phí đáng kể, nên vẫn lãng phí nhiều.

Tệ hơn, chúng ta chưa giải quyết starvation chút nào. Thread có thể mắc vòng yield vô tận trong khi thread khác liên tục vào ra critical section. Rõ ràng cần cách giải quyết trực tiếp vấn đề này.

## 28.14 Dùng queue: Sleep thay vì spin

Vấn đề thực sự của các cách trước là phó mặc quá nhiều điều cho sự ngẫu nhiên. Scheduler quyết định thread chạy kế tiếp; nếu chọn tệ, thread được chạy phải spin chờ lock (cách đầu) hoặc yield CPU ngay (cách thứ hai). Dù cách nào, đều có khả năng lãng phí và không ngăn starvation.

Vì vậy phải kiểm soát tường minh thread nào được acquire lock tiếp theo sau khi holder hiện tại release. Để làm vậy cần OS hỗ trợ thêm chút và queue theo dõi thread chờ acquire lock.

Để đơn giản, chúng ta dùng hỗ trợ Solaris với hai lời gọi: park() đưa calling thread vào sleep, và unpark(threadID) đánh thức thread cụ thể do threadID chỉ định. Hai routine phối hợp xây dựng lock đưa caller vào sleep nếu thử acquire lock đang được giữ, và đánh thức khi lock free. Xem code Hình 28.9 để hiểu một cách dùng các primitive này.

Ví dụ có vài điều thú vị. Đầu tiên, kết hợp ý tưởng test-and-set cũ với queue tường minh chứa lock waiter để tạo lock hiệu quả hơn. Thứ hai, dùng queue kiểm soát ai lấy lock kế tiếp, tránh starvation.

Bạn có thể thấy guard được dùng (Hình 28.9, trang 16) về cơ bản như spin-lock quanh thao tác flag và queue mà lock sử dụng. Vì vậy cách này không loại bỏ spin-waiting hoàn toàn; thread có thể bị interrupt khi acquire hoặc release lock, khiến thread khác spin-wait chờ nó chạy lại. Nhưng thời gian spin rất hạn chế (chỉ vài instruction trong code lock và unlock, thay cho critical section user-defined), nên cách này có thể hợp lý.

```
 1   typedef struct __lock_t {
 2       int flag;
 3       int guard;
 4       queue_t *q;
 5   } lock_t;
 6
 7   void lock_init(lock_t *m) {
 8       m->flag  = 0;
 9       m->guard = 0;
10       queue_init(m->q);
11   }
12
13   void lock(lock_t *m) {
14       while (TestAndSet(&m->guard, 1) == 1)
15           ; //acquire guard lock by spinning
16       if (m->flag == 0) {
17           m->flag = 1; // lock is acquired
18           m->guard = 0;
19       } else {
20           queue_add(m->q, gettid());
21           m->guard = 0;
22           park();
23       }
24   }
25
26   void unlock(lock_t *m) {
27       while (TestAndSet(&m->guard, 1) == 1)
28           ; //acquire guard lock by spinning
29       if (queue_empty(m->q))
30           m->flag = 0; // let go of lock; no one wants it
31       else
32           unpark(queue_remove(m->q)); // hold lock (for next thread!)
33       m->guard = 0;
34   }
```

Hình 28.9: Lock với Queue, Test-and-set, Yield và Wakeup

Thứ hai, bạn có thể thấy trong lock(), khi thread không acquire được lock (đã được giữ), chúng ta cẩn thận thêm mình vào queue (gọi gettid() lấy thread ID hiện tại), đặt guard bằng 0 và yield CPU. Câu hỏi cho bạn: nếu release guard lock sau park() thay vì trước thì sao? Gợi ý: điều tệ hại.

Bạn cũng có thể thấy điều thú vị: flag không được đặt về 0 khi đánh thức thread khác. Tại sao? Đó không phải lỗi mà là điều cần thiết! Khi thread được đánh thức, giống như quay về từ park(); tuy nhiên lúc đó nó không giữ guard nên thậm chí không thể thử đặt flag bằng 1. Do đó chúng ta truyền lock trực tiếp từ thread release sang thread acquire kế tiếp; flag không được đặt bằng 0 in-between.

Cuối cùng, bạn có thể nhận thấy race condition tiềm tàng ngay trước park(). Với thời điểm không may, thread sắp park, cho rằng nên sleep cho tới khi lock không còn được giữ. Chuyển sang thread khác lúc đó (chẳng hạn holder) có thể gây vấn đề, ví dụ thread đó release lock. park tiếp theo của thread đầu có thể khiến nó sleep mãi. Đôi khi gọi đây là wakeup/waiting race; để tránh cần thêm công việc.

Solaris giải quyết bằng system call thứ ba: setpark(). Gọi routine này, thread báo sắp park. Nếu sau đó bị interrupt và thread khác gọi unpark trước khi park thực sự được gọi, park sau đó trả về ngay thay vì sleep. Thay đổi code trong lock() rất nhỏ:

```
 1   queue_add(m->q, gettid());
 2   setpark(); // new code
 3   m->guard = 0;
```

Giải pháp khác có thể truyền guard vào kernel. Khi đó kernel có thể thực hiện biện pháp để atomically release lock và dequeue running thread.

## 28.15 OS khác, hỗ trợ khác

Đến đây chúng ta thấy một kiểu OS hỗ trợ xây dựng lock hiệu quả hơn trong thư viện thread. OS khác cung cấp hỗ trợ tương tự; chi tiết khác nhau.

Chẳng hạn, Linux cung cấp futex tương tự interface Solaris nhưng có nhiều chức năng in-kernel hơn. Cụ thể, mỗi futex gắn với một physical memory location cụ thể và queue in-kernel per-futex. Caller dùng các lời gọi futex (mô tả dưới) để sleep và wake khi cần.

Cụ thể có hai lời gọi. futex_wait(address, expected) đưa calling thread vào sleep nếu giá trị tại address bằng expected. Nếu không bằng, trả về ngay. futex_wake(address) đánh thức một thread đang chờ trong queue. Cách dùng trên Linux trong Hình 28.10.

Đoạn code từ lowlevellock.h trong thư viện nptl (thuộc gnu libc) [L09] khá thú vị. Về cơ bản dùng một integer theo dõi cả lock đang được giữ không (high bit) và số waiter (các bit còn lại). Vì vậy nếu lock âm, nó đang được giữ (high bit bật, quyết định dấu integer). Code cũng minh họa tối ưu trường hợp phổ biến không contention: chỉ một thread acquire và release lock thì làm rất ít việc (atomic bit test-and-set để lock và atomic add để release). Hãy thử suy luận phần còn lại của lock “real-world” này để hiểu hoạt động.

```
 1   void mutex_lock (int *mutex) {
 2     int v;
 3     /* Bit 31 was clear, we got the mutex (this is the fastpath)  */
 4     if (atomic_bit_test_set (mutex, 31) == 0)
 5       return;
 6     atomic_increment (mutex);
 7     while (1) {
 8         if (atomic_bit_test_set (mutex, 31) == 0) {
 9             atomic_decrement (mutex);
10             return;
11         }
12         /* We have to wait now. First make sure the futex value
13            we are monitoring is truly negative (i.e. locked). */
14         v = *mutex;
15         if (v >= 0)
16           continue;
17         futex_wait (mutex, v);
18     }
19   }
20
21   void mutex_unlock (int *mutex) {
22     /* Adding 0x80000000 to the counter results in 0 if and only if
23       there are not other interested threads */
24     if (atomic_add_zero (mutex, 0x80000000))
25       return;
26
27     /* There are other threads waiting for this mutex,
28        wake one of them up.  */
29     futex_wake (mutex);
30   }
```

Hình 28.10: Futex Lock Linux-based

## 28.16 Two-Phase Lock

Lưu ý cuối: cách Linux mang nét của phương pháp cũ được dùng không liên tục nhiều năm, ít nhất từ Dahm Lock đầu thập niên 1960 [M82], nay gọi là two-phase lock. two-phase lock nhận ra spin có thể hữu ích, đặc biệt khi lock sắp release. Vì vậy trong phase đầu, lock spin một lúc với hy vọng acquire được.

Nếu chưa acquire được trong spin phase đầu, chuyển sang phase hai, đưa caller vào sleep và chỉ đánh thức khi lock free sau này. Lock Linux trên là một dạng như vậy nhưng chỉ spin một lần; tổng quát hóa có thể spin trong loop khoảng thời gian cố định trước khi dùng futex để sleep.

Two-phase lock là ví dụ nữa về cách hybrid: kết hợp hai ý tưởng tốt có thể tạo ý tưởng tốt hơn. Tất nhiên có tốt không phụ thuộc nhiều thứ, gồm môi trường hardware, số thread và chi tiết workload khác. Như thường lệ, tạo một lock general-purpose tốt cho mọi trường hợp sử dụng là thử thách lớn.

## 28.17 Tổng kết

Cách trên cho thấy lock thực tế ngày nay được xây dựng thế nào: một phần hardware hỗ trợ (instruction mạnh hơn) cộng một phần operating system hỗ trợ (ví dụ primitive park() và unpark() trên Solaris, hoặc futex trên Linux). Tất nhiên chi tiết khác nhau, code locking cụ thể thường được tinh chỉnh kỹ. Xem code Solaris hoặc Linux nếu muốn thêm chi tiết; rất hấp dẫn [L09, S09]. Cũng xem công trình xuất sắc của David và cộng sự so sánh chiến lược locking trên multiprocessor hiện đại [D+13].

## Tài liệu tham khảo

[D91] “Just Win, Baby: Al Davis and His Raiders”

Glenn Dickey, Harcourt 1991

Thậm chí có cuốn sách chắc hẳn tệ về Al Davis và câu “just win” nổi tiếng. Hoặc có lẽ sách nói nhiều hơn về Al Davis và Raiders, không chỉ câu nói. Đọc để biết nhé?

[D+13] “Everything You Always Wanted to Know about Synchronization but Were Afraid to Ask”

Tudor David, Rachid Guerraoui, Vasileios Trigonakis

SOSP ’13, Nemacolin Woodlands Resort, Pennsylvania, November 2013

Bài báo mới xuất sắc so sánh nhiều cách xây dựng lock bằng hardware primitive. Rất đáng đọc để thấy các ý tưởng qua nhiều năm hoạt động trên hardware hiện đại thế nào.

[D68] “Cooperating sequential processes”

Edsger W. Dijkstra, 1968

Có tại: http://www.cs.utexas.edu/users/EWD/ewd01xx/EWD123.PDF

Một trong những bài báo nền tảng thời đầu của lĩnh vực. Bàn cách Dijkstra đặt vấn đề concurrency ban đầu và lời giải Dekker.

[H93] “MIPS R4000 Microprocessor User’s Manual”

Joe Heinrich, Prentice-Hall, June 1993

Có tại: http://cag.csail.mit.edu/raw/documents/R4400_Uman_book_Ed2.pdf

[H91] “Wait-free Synchronization”

Maurice Herlihy

ACM Transactions on Programming Languages and Systems (TOPLAS)

Volume 13, Issue 1, January 1991

Bài báo cột mốc giới thiệu cách khác xây dựng concurrent data structure. Nhưng vì phức tạp, nhiều ý tưởng được hệ thống triển khai chấp nhận chậm.

[L81] “Observations on the Development of an Operating System”

Hugh Lauer

SOSP ’81, Pacific Grove, California, December 1981

Bài nhìn lại must-read về phát triển Pilot OS, operating system PC thời đầu. Thú vị và nhiều hiểu biết sâu sắc.

[L09] “glibc 2.9 (include Linux pthreads implementation)”

Có tại: http://ftp.gnu.org/gnu/glibc/

Đặc biệt xem subdirectory nptl, nơi chứa phần lớn hỗ trợ pthread trên Linux ngày nay.

[M82] “The Architecture of the Burroughs B5000 20 Years Later and Still Ahead of the Times?”

Alastair J.W. Mayer, 1982

www.ajwm.net/amayer/papers/B5000.html

Từ bài báo: “Một instruction đặc biệt hữu ích là RDLK (read-lock). Đó là operation không thể chia nhỏ, đọc và ghi một memory location.” RDLK do đó là primitive test-and-set sớm, nếu không phải sớm nhất. Một phần công lao thuộc kỹ sư Dave Dahm, người dường như phát minh nhiều thứ này cho hệ thống Burroughs, gồm dạng spin lock (“Buzz Locks”) và two-phase lock mang tên ông, “Dahm Locks.”

[MS91] “Algorithms for Scalable Synchronization on Shared-Memory Multiprocessors”

John M. Mellor-Crummey and M. L. Scott

ACM TOCS, Volume 9, Issue 1, February 1991

Khảo sát xuất sắc và kỹ lưỡng các thuật toán locking khác nhau. Nhưng không dùng operating system hỗ trợ, chỉ hardware instruction tinh vi.

[P81] “Myths About the Mutual Exclusion Problem”

G.L. Peterson

Information Processing Letters, 12(3), pages 115–116, 1981

Thuật toán Peterson được giới thiệu ở đây.

[S05] “Guide to porting from Solaris to Linux on x86”

Ajay Sood, April 29, 2005

Có tại: http://www.ibm.com/developerworks/linux/library/l-solar/

[S09] “OpenSolaris Thread Library”

Có tại: http://src.opensolaris.org/source/xref/onnv/onnv-gate/usr/src/lib/libc/port/threads/synch.c

Cũng khá thú vị để xem, dù ai biết sẽ ra sao khi Oracle sở hữu Sun. Cảm ơn Mike Swift đã chỉ dẫn tới code.

[W09] “Load-Link, Store-Conditional”

Mục Wikipedia về chủ đề này, tại thời điểm October 22, 2009 http://en.wikipedia.org/wiki/Load-Link/Store-Conditional

Bạn tin được chúng tôi trích wikipedia không? Khá lười nhỉ? Nhưng chúng tôi tìm thông tin ở đó trước, và thấy không trích dẫn là sai. Hơn nữa, họ liệt kê cả instruction cho từng architecture: ldl_l/stl_c và ldq_l/stq_c (Alpha), lwarx/stwcx (PowerPC), ll/sc (MIPS), ldrex/strex (ARM phiên bản 6 trở lên). Thực ra wikipedia khá tuyệt, đừng quá khắt khe nhé?

[WG00] “The SPARC Architecture Manual: Version 9”

David L. Weaver and Tom Germond, September 2000

SPARC International, San Jose, California

Có tại: http://www.sparc.org/standards/SPARCV9.pdf

Xem thêm: http://developers.sun.com/solaris/articles/atomic_sparc/ để biết thêm chi tiết atomic operation Sparc.

## Bài tập

Chương trình x86.py cho thấy cách thread interleaving khác nhau gây ra hoặc tránh race condition. Xem README để biết cách hoạt động và input cơ bản, rồi trả lời các câu hỏi dưới đây.

### Câu hỏi

1. Trước tiên chuẩn bị chạy x86.py với flag -p flag.s. Code “triển khai” locking bằng một memory flag. Bạn hiểu code assembly đang cố làm gì không?

2. Chạy mặc định, flag.s hoạt động đúng mong đợi không? Có tạo kết quả đúng không? Dùng flag -M và -R theo dõi biến và register (bật -c để xem giá trị). Bạn có dự đoán giá trị cuối trong flag khi code chạy không?

3. Đổi register %bx bằng flag -a (ví dụ -a bx=2,bx=2 nếu chỉ chạy hai thread). Code làm gì? Điều đó thay đổi câu trả lời trên thế nào?

4. Đặt bx lớn cho mỗi thread, dùng flag -i tạo tần suất interrupt khác nhau; giá trị nào cho kết quả xấu? Giá trị nào cho kết quả tốt?

5. Giờ xem test-and-set.s. Trước tiên thử hiểu code dùng instruction xchg xây dựng locking primitive đơn giản. Acquire lock được viết thế nào? Release lock thì sao?

6. Giờ chạy code, lại thay khoảng cách interrupt (-i) và bảo đảm lặp nhiều lần. Code luôn đúng mong đợi không? Đôi khi dùng CPU kém hiệu quả không? Có thể định lượng thế nào?

7. Dùng flag -P tạo kiểm thử cụ thể cho code locking. Ví dụ chạy schedule lấy lock ở thread đầu rồi thử acquire ở thread thứ hai. Có đúng không? Cần kiểm thử gì nữa?

8. Giờ xem code peterson.s, triển khai thuật toán Peterson (đề cập ở phần bên lề). Nghiên cứu code và thử hiểu nó.

9. Giờ chạy code với giá trị -i khác nhau. Bạn thấy những hành vi khác nhau nào?

10. Bạn có thể điều khiển scheduling (flag -P) để “chứng minh” code hoạt động không? Cần minh họa những trường hợp khác nhau nào? Hãy nghĩ về mutual exclusion và tránh deadlock.

11. Giờ nghiên cứu code ticket lock trong ticket.s. Có khớp code trong chương không?

12. Chạy code với flag: -a bx=1000,bx=1000 (đặt mỗi thread lặp qua critical section 1000 lần). Quan sát theo thời gian; các thread có dành nhiều thời gian spin chờ lock không?

13. Code hoạt động thế nào khi thêm thread?

14. Xem yield.s, nơi giả định instruction yield cho phép thread nhường CPU cho thread khác (thực tế đây là OS primitive, nhưng để mô phỏng đơn giản, giả định instruction làm việc đó). Tìm tình huống test-and-set.s lãng phí cycle spin nhưng yield.s không. Tiết kiệm bao nhiêu instruction? Tình huống nào có tiết kiệm này?

15. Cuối cùng xem test-and-test-and-set.s. Lock này làm gì? Tiết kiệm gì so với test-and-set.s?
