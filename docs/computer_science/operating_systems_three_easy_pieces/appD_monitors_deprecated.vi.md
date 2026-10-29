# D Monitor (Deprecated)

Khi concurrent programming bắt đầu trở nên quan trọng, lập trình object-oriented cũng phát triển. Không ngạc nhiên, người ta nghĩ đến cách tích hợp synchronization vào môi trường lập trình có cấu trúc hơn.

Một cách xuất hiện là monitor. Được Per Brinch Hansen mô tả đầu tiên [BH73], rồi Tony Hoare hoàn thiện [H74], ý tưởng monitor khá đơn giản. Xét monitor giả định viết bằng cú pháp C++ sau:

```
monitor class account {
private:
    int balance = 0;

public:
    void deposit(int amount) {
        balance = balance + amount;
    }
    void withdraw(int amount) {
        balance = balance - amount;
    }
};
```

Hình D.1: Monitor class giả định

Lưu ý: đây là class “giả định” vì C++ không hỗ trợ monitor, nên keyword monitor không tồn tại. Tuy nhiên, Java hỗ trợ monitor bằng thứ gọi là synchronized method. Dưới đây, ta xem cả cách tạo thứ giống monitor trong C/C++ lẫn cách dùng synchronized method của Java.

Trong ví dụ, có thể bạn thấy người bạn cũ account và các routine deposit, withdraw một khoản khỏi balance. Bạn cũng có thể thấy đây là critical section; nếu nhiều thread gọi đồng thời, có race condition và nguy cơ kết quả sai.

Nhưng trong monitor class, bạn không gặp rắc rối vì monitor bảo đảm chỉ một thread hoạt động bên trong tại một thời điểm. Vì vậy, ví dụ trên là code hoàn toàn an toàn và hoạt động được; nhiều thread gọi deposit() hoặc withdraw() và biết mutual exclusion được giữ.

Monitor làm điều này thế nào? Đơn giản: bằng lock. Mỗi khi thread cố gọi monitor routine, nó ngầm cố acquire monitor lock. Nếu thành công, nó gọi routine và chạy code của method. Nếu không, nó block đến khi thread trong monitor làm xong. Vì thế, nếu viết C++ class như sau, nó đạt đúng mục tiêu của monitor class trên:

```
class account {
private:
    int balance = 0;
    pthread_mutex_t monitor;

public:
    void deposit(int amount) {
        pthread_mutex_lock(&monitor);
        balance = balance + amount;
        pthread_mutex_unlock(&monitor);
    }
    void withdraw(int amount) {
        pthread_mutex_lock(&monitor);
        balance = balance - amount;
        pthread_mutex_unlock(&monitor);
    }
};
```

Hình D.2: C++ class hoạt động như monitor

Như thấy trong ví dụ, monitor không tự động làm quá nhiều cho bạn. Về cơ bản, nó chỉ acquire rồi release lock. Nhờ vậy, ta đạt yêu cầu của monitor: chỉ một thread hoạt động trong deposit() hoặc withdraw(), như mong muốn.

## D.1 Vì sao cần monitor?

Có thể bạn tự hỏi vì sao phát minh monitor thay vì dùng locking tường minh. Khi đó, lập trình object-oriented vừa thịnh hành. Ý tưởng là kết hợp khéo một số khái niệm then chốt của concurrent programming với các phương pháp cơ bản của object orientation. Chỉ vậy thôi.

## D.2 Có gì ngoài locking tự động?

Trở lại vấn đề. Như biết từ thảo luận semaphore, chỉ có lock chưa đủ; chẳng hạn, để triển khai giải pháp producer/consumer, trước đây ta dùng semaphore vừa cho thread ngủ khi chờ điều kiện thay đổi (như producer chờ buffer rỗng), vừa đánh thức thread khi điều kiện nhất định đã đổi (như consumer báo đã làm rỗng buffer).

```
monitor class BoundedBuffer {
  private:
    int buffer[MAX];
    int fill, use;
    int fullEntries = 0;
    cond_t empty;
    cond_t full;

  public:
    void produce(int element) {
        if (fullEntries == MAX)    // line P0
            wait(&empty);          // line P1
        buffer[fill] = element;    // line P2
        fill = (fill + 1) % MAX;   // line P3
        fullEntries++;             // line P4
        signal(&full);             // line P5
    }

    int consume() {
        if (fullEntries == 0)      // line C0
            wait(&full);           // line C1
        int tmp = buffer[use];     // line C2
        use = (use + 1) % MAX;     // line C3
        fullEntries--;             // line C4
        signal(&empty);            // line C5
        return tmp;                // line C6
    }
}
```

Hình D.3: Producer/consumer với monitor và Hoare semantics

Monitor hỗ trợ chức năng đó bằng cấu trúc tường minh gọi là condition variable. Hãy xem giải pháp producer/consumer, ở đây viết bằng monitor và condition variable.

Trong monitor class này, có hai routine produce() và consume(). Producer thread liên tục gọi produce() để đưa data vào bounded buffer, còn consumer() liên tục gọi consume(). Ví dụ là cách diễn đạt hiện đại của giải pháp Hoare [H74].

Bạn nên thấy điểm giống giữa code này và giải pháp semaphore-based trong phần trước. Khác biệt lớn là condition variable phải dùng cùng state variable tường minh; ở đây integer fullEntries xác định producer hay consumer phải chờ tùy state. Ngược lại, semaphore có giá trị số nội bộ làm cùng nhiệm vụ. Vì vậy, condition variable phải đi cùng một loại external state value để đạt mục đích tương tự.

Tuy nhiên, khía cạnh quan trọng nhất là dùng hai condition variable empty, full và các call wait(), signal() tương ứng. Những operation này làm đúng như bạn nghĩ: wait() block thread gọi trên điều kiện cho trước; signal() đánh thức một thread đang chờ điều kiện đó.

Tuy nhiên, có điểm tinh tế trong cách các call hoạt động; hiểu semantics của chúng là thiết yếu để hiểu vì sao code đúng. Trong thứ các nhà nghiên cứu operating system gọi là Hoare semantics (vâng, cái tên hơi không may), signal() lập tức đánh thức một thread đang chờ và chạy nó; vì vậy, monitor lock vốn được thread đang chạy ngầm giữ lập tức chuyển cho thread được đánh thức, rồi thread ấy chạy đến khi block hoặc ra khỏi monitor. Có thể nhiều thread đang chờ; signal() chỉ đánh thức và chạy một thread, những thread khác phải chờ signal tiếp theo.

Ví dụ đơn giản giúp hiểu code rõ hơn. Hình dung hai thread: một producer, một consumer. Consumer chạy trước, gọi consume() nhưng thấy fullEntries = 0 (C0) vì buffer chưa có gì. Nó gọi wait(&full) (C1) và chờ buffer được điền. Producer chạy, thấy không cần chờ (P0), đưa phần tử vào buffer (P2), tăng fill index (P3) và fullEntries count (P4), rồi gọi signal(&full) (P5). Trong Hoare semantics, producer không tiếp tục sau signal; thay vào đó, signal lập tức chuyển quyền cho consumer đang chờ, consumer trở về từ wait() (C1) và lập tức consume phần tử producer vừa tạo (C2), v.v. Chỉ sau khi consumer trả về, producer mới chạy tiếp và trở về từ produce().

## D.3 Khi lý thuyết gặp thực tiễn

Tony Hoare, người viết giải pháp trên và đưa ra semantics chính xác cho signal(), wait(), là nhà lý thuyết. Rõ ràng cũng rất thông minh; suy cho cùng, ông phát minh quicksort [H61]. Nhưng semantics của signaling và waiting hóa ra chưa lý tưởng để triển khai thực tế. Như câu nói cũ: trên lý thuyết, không có khác biệt giữa lý thuyết và thực tiễn, nhưng trên thực tế thì có.

> CÂU NÓI CŨ: LÝ THUYẾT VÀ THỰC TIỄN
>
> Câu nói cũ là “trên lý thuyết, không có khác biệt giữa lý thuyết và thực tiễn, nhưng trên thực tế thì có.” Dĩ nhiên, chỉ người làm thực tiễn nói thế; nhà lý thuyết hẳn chứng minh được điều đó không đúng.

Vài năm sau, Butler Lampson và David Redell tại Xerox PARC xây dựng concurrent language tên Mesa, quyết định dùng monitor làm concurrency primitive cơ bản [LR80]. Họ là nhà nghiên cứu hệ thống well-known và sớm thấy Hoare semantics tuy dễ chứng minh hơn nhưng khó hiện thực trong hệ thống thực (có nhiều lý do, có lẽ quá nhiều để trình bày ở đây).

Cụ thể, để xây dựng monitor hoạt động được, Lampson và Redell đổi nghĩa signal() theo cách tinh tế nhưng thiết yếu. Hàm signal() giờ chỉ được xem là hint [L83]; nó chuyển một thread đang chờ từ blocked sang runnable nhưng không chạy ngay. Thay vào đó, thread phát signal giữ quyền điều khiển tới khi ra khỏi monitor và bị deschedule.

## D.4 Ôi, một race

Với Mesa semantics mới, hãy xét lại code. Lại hình dung consumer (consumer 1) vào monitor, thấy buffer rỗng nên chờ (C1). Producer đến, điền buffer và signal buffer đã được điền, chuyển consumer từ blocked trên condition variable full sang ready. Producer tiếp tục chạy một lúc rồi nhường CPU.

Nhưng Houston, ta có vấn đề. Bạn thấy không? Hình dung consumer khác (consumer 2) giờ gọi consume(); nó thấy buffer đầy, consume rồi trả về, đồng thời đặt fullEntries thành 0. Đã thấy vấn đề chưa? Đây rồi. Consumer 1 cuối cùng được chạy, trở về từ wait(), kỳ vọng buffer đầy (C1...); đáng tiếc điều đó không còn đúng, vì consumer 2 chen vào consume trước khi consumer 1 có cơ hội. Vì vậy code không đúng: giữa signal() của producer và lúc consumer 1 trở về từ wait(), điều kiện đã thay đổi. Timeline minh họa:

```
     Producer                Consumer1                Consumer2
                        C0 (fullEntries=0)
                        C1 (Consumer 1: blocked)
P0 (fullEntries=0)
P2
P3
P4 (fullEntries=1)
P5 (Consumer1: ready)
                                                 C0 (fullEntries=1)
                                                 C2
                                                 C3
                                                 C4 (fullEntries=0)
                                                 C5
                                                 C6
                        C2 (using a buffer,
                            fullEntries=0!)
```

Hình D.4: Vì sao code không hoạt động với Hoare semantics

May mắn là chuyển từ Hoare semantics sang Mesa semantics chỉ cần lập trình viên đổi chút ít để có giải pháp đúng. Cụ thể, khi được đánh thức, thread phải kiểm tra lại điều kiện đã chờ; vì signal() chỉ là hint, điều kiện có thể đã đổi (thậm chí nhiều lần), nên có thể không còn state mong muốn khi thread chờ được chạy. Trong ví dụ, phải đổi hai dòng P0 và C0:

```
public:
  void produce(int element) {
      while (fullEntries == MAX) // line P0 (CHANGED IF->WHILE)
          wait(&empty);          // line P1
      buffer[fill] = element;    // line P2
      fill = (fill + 1) % MAX;   // line P3
      fullEntries++;             // line P4
      signal(&full);             // line P5
  }

  int consume() {
      while (fullEntries == 0)   // line C0 (CHANGED IF->WHILE)
          wait(&full);           // line C1
      int tmp = buffer[use];     // line C2
      use = (use + 1) % MAX;     // line C3
      fullEntries--;             // line C4
      signal(&empty);            // line C5
      return tmp;                // line C6
  }
```

Hình D.5: Producer/consumer với monitor và Mesa semantics

Rốt cuộc không khó lắm. Vì dễ triển khai, hầu như mọi hệ thống ngày nay dùng condition variable với signaling và waiting đều dùng Mesa semantics. Vì vậy, nếu không nhớ gì khác từ môn này, hãy nhớ: luôn kiểm tra lại điều kiện sau khi được đánh thức! Nói đơn giản hơn, dùng vòng while thay vì if khi kiểm tra điều kiện. Điều này luôn đúng ngay cả khi bằng cách nào đó bạn chạy trên hệ thống Hoare semantics; khi ấy chỉ kiểm tra dư điều kiện thêm một lần.

## D.5 Tìm hiểu bên trong một chút

Để hiểu vì sao Mesa semantics dễ triển khai hơn, hãy tìm hiểu thêm cách triển khai Mesa monitor. Trong công trình [LR80], Lampson và Redell mô tả ba loại queue mà thread có thể thuộc tại một thời điểm: ready queue, monitor lock queue và condition variable queue. Chương trình có thể có nhiều monitor class và condition variable instance; mỗi instance như vậy có một queue.

Với một bounded buffer monitor, ta có bốn queue cần xét: ready queue, một monitor queue và hai condition variable queue (một cho điều kiện full, một cho empty). Để hiểu thread library quản lý chúng, ta sẽ trình bày thread chuyển qua các queue thế nào trong ví dụ producer/consumer.

Trong ví dụ, ta xét trường hợp consumer được đánh thức nhưng không có gì để consume. Xét timeline sau. Bên trái là hai consumer (Con1, Con2), producer (Prod) và dòng code họ đang thực thi; bên phải là state của bốn queue theo dõi: ready queue của runnable process, monitor lock queue tên Monitor, cùng condition variable queue empty và full. Ta còn theo dõi thời gian (t), thread đang chạy (dấu ngoặc vuông quanh thread trên ready queue đang chạy) và giá trị fullEntries (FE).

```
 t | Con1 Con2 Prod | Mon | Empty | Full | FE | Comment
------------------------------------------------------------------------
 0  C0                                     0
 1  C1                              Con1   0   Con1 waiting on full
 2 <Context switch>                 Con1   0   switch: Con1 to Prod
 3            P0                    Con1   0
 4            P2                    Con1   0   Prod doesn’t wait (FE=0)
 5            P3                    Con1   0
 6            P4                    Con1   1   Prod updates fullEntries
 7            P5                           1   Prod signals: Con1 now ready
 8 <Context switch>                        1   switch: Prod to Con2
 9        C0                               1   switch to Con2
10        C2                               1   Con2 doesn’t wait (FE=1)
11        C3                               1
12        C4                               0   Con2 changes fullEntries
13        C5                               0   Con2 signals empty (no waiter)
14        C6                               0   Con2 done
15 <Context switch>                        0   switch: Con2 to Con1
16   C0                                    0   recheck fullEntries: 0!
17   C1                            Con1    0   wait on full again
```

Hình D.6: Theo dõi queue trong lần chạy producer/consumer

Như timeline cho thấy, consumer 2 (Con2) chen vào consume data sẵn có (t=9..14) trước khi consumer 1 (Con1), đang chờ điều kiện full được signal (từ t=1), có cơ hội. Tuy nhiên, Con1 được signal của producer đánh thức (t=7) nên chạy lại, dù lúc đó buffer đã rỗng. Nếu Con1 không kiểm tra lại state variable fullEntries (t=16), nó sẽ sai lầm cố consume khi không có data. Vì vậy, cách triển khai tự nhiên này chính là điều dẫn tới Mesa semantics (không phải Hoare).

## D.6 Những cách dùng monitor khác

Trong bài Mesa, Lampson và Redell chỉ ra một vài nơi cần loại signaling khác. Chẳng hạn, xét memory allocator sau (Hình D.7).

Nhiều chi tiết được bỏ để tập trung vào điều kiện đánh thức và signaling. Hóa ra code signal/wait trên chưa hoạt động đúng; bạn thấy vì sao không?

Hình dung hai thread gọi allocate. Thread đầu gọi allocate(20), thread thứ hai allocate(10). Không có memory nên cả hai gọi wait() và block. Sau đó, thread khác gọi free(p, 15), giải phóng 15 byte memory rồi signal. Đáng tiếc, nó đánh thức thread chờ 20 byte; thread đó kiểm tra lại, thấy chỉ có 15 byte nên lại wait(). Thread có thể hưởng lợi từ 15 byte vừa giải phóng, tức thread gọi allocate(10), không được đánh thức.

```
monitor class allocator {
    int available; // how much memory is available?
    cond_t c;

    void *allocate(int size) {
        while (size > available)
            wait(&c);
        available -= size;
        // and then do whatever the allocator should do
        // and return a chunk of memory
    }

    void free(void *pointer, int size) {
        // free up some memory
        available += size;
        signal(&c);
    }
};
```

Hình D.7: Memory allocator đơn giản

Lampson và Redell đề xuất giải pháp đơn giản. Thay vì signal() đánh thức một thread chờ, dùng broadcast() đánh thức tất cả. Vì vậy, mọi thread được đánh thức; trong ví dụ, thread chờ 10 byte sẽ thấy có 15 byte và cấp phát thành công.

Trong Mesa semantics, dùng broadcast() luôn đúng vì mọi thread dù sao cũng kiểm tra lại điều kiện khi thức dậy. Tuy nhiên, có thể gây vấn đề performance nên chỉ dùng khi cần. Trong ví dụ, broadcast() có thể đánh thức hàng trăm thread chờ, nhưng chỉ một tiếp tục thành công còn tất cả lập tức block lại; vấn đề đôi khi gọi là thundering herd, tốn kém vì mọi context switch bổ sung.

## D.7 Dùng monitor triển khai semaphore

Có lẽ bạn thấy nhiều điểm giống giữa monitor và semaphore. Không ngạc nhiên, có thể dùng thứ này triển khai thứ kia. Ở đây, ta trình bày cách triển khai semaphore class bằng monitor (Hình D.8).

Như thấy, wait() chỉ chờ giá trị semaphore lớn hơn 0 rồi giảm giá trị, còn post() tăng giá trị và đánh thức một thread chờ nếu có. Đơn giản như vậy.

Để dùng class làm binary semaphore (tức lock), chỉ cần khởi tạo semaphore bằng 1 rồi đặt cặp wait()/post() quanh critical section. Như vậy đã thấy monitor dùng để triển khai semaphore.

```
monitor class Semaphore {
    int s; // value of the semaphore
    Semaphore(int value) {
        s = value;
    }
    void wait() {
        while (s <= 0)
            wait();
        s--;
    }
    void post() {
        s++;
        signal();
    }
};
```

Hình D.8: Triển khai semaphore bằng monitor

## D.8 Monitor trong thực tế

Ta đã nói đang dùng monitor “giả định”; C++ không có khái niệm đó. Giờ ta trình bày cách tạo C++ class monitor-like và cách Java dùng synchronized method để đạt mục đích tương tự.

### Một dạng monitor C++

Sau đây là code producer/consumer viết bằng C++ với lock và condition variable (Hình D.9). Bạn thấy ít khác biệt giữa code monitor giả định và C++ class hoạt động được ở trên. Dĩ nhiên, khác biệt rõ ràng là dùng lock ”monitor” tường minh. Tinh tế hơn là chuyển sang pthread_cond_signal() và pthread_cond_wait() chuẩn POSIX. Đặc biệt, khi gọi pthread_cond_wait(), còn truyền lock đang giữ lúc chờ. Lock cần thiết trong pthread_cond_wait() vì phải được release khi thread ngủ và re-acquired trước khi trả về caller (cùng hành vi trong monitor nhưng với lock tường minh).

### Monitor Java

Điều thú vị là nhà thiết kế Java chọn monitor vì nghĩ đây là cách khéo léo thêm synchronization primitive vào ngôn ngữ. Để dùng, chỉ cần thêm keyword synchronized vào method hoặc tập method muốn dùng làm monitor (đây là ví dụ từ trang tài liệu của chính Sun [S12a,S12b]):

Code làm đúng điều bạn nghĩ: cung cấp counter thread safe. Vì chỉ một thread được vào monitor tại một thời điểm, chỉ một thread cập nhật giá trị ”c”, nên tránh race condition.

```
class BoundedBuffer {
  private:
    int buffer[MAX];
    int fill, use;
    int fullEntries;
    pthread_mutex_t monitor; // monitor lock
    pthread_cond_t empty;
    pthread_cond_t full;

  public:
    BoundedBuffer() {
        use = fill = fullEntries = 0;
    }
    void produce(int element) {
        pthread_mutex_lock(&monitor);
        while (fullEntries == MAX)
            pthread_cond_wait(&empty, &monitor);
        buffer[fill] = element;
        fill = (fill + 1) % MAX;
        fullEntries++;
        pthread_cond_signal(&full);
        pthread_mutex_unlock(&monitor);
    }

    int consume() {
        pthread_mutex_lock(&monitor);
        while (fullEntries == 0)
            pthread_cond_wait(&full, &monitor);
        int tmp = buffer[use];
        use = (use + 1) % MAX;
        fullEntries--;
        pthread_cond_signal(&empty);
        pthread_mutex_unlock(&monitor);
        return tmp;
    }
}
```

Hình D.9: Producer/consumer C++ với “monitor”

### Java và một condition variable duy nhất

Trong Java ban đầu, mỗi synchronized class còn có một condition variable. Để dùng, gọi wait() hoặc notify() (đôi khi dùng notify thay signal, nhưng cùng nghĩa). Lạ là ở cách triển khai ban đầu, không thể có hai hay nhiều condition variable. Có lẽ bạn thấy giải pháp producer/consumer luôn dùng hai: một báo buffer rỗng, một báo buffer đầy.

Để hiểu hạn chế của chỉ một condition variable, hình dung giải pháp producer/consumer với một condition variable duy nhất. Hai consumer chạy trước và đều mắc kẹt chờ. Sau đó producer chạy, điền một buffer, đánh thức một consumer rồi cố điền tiếp nhưng thấy buffer đầy (MAX=1). Vì thế, ta có producer chờ buffer rỗng, consumer chờ buffer đầy, và consumer đã chờ sắp được chạy vì đã được đánh thức.

```
public class SynchronizedCounter {
    private int c = 0;
    public synchronized void increment() {
        c++;
    }
    public synchronized void decrement() {
        c--;
    }
    public synchronized int value() {
        return c;
    }
}
```

Hình D.10: Java class đơn giản với synchronized method

Consumer sau đó chạy và consume buffer. Nhưng khi gọi notify(), nó đánh thức một thread chờ điều kiện. Vì chỉ có một condition variable, consumer có thể đánh thức consumer chờ thay vì producer chờ. Vì vậy giải pháp không hoạt động.

Để khắc phục, lại dùng broadcast. Trong Java, gọi notifyAll() để đánh thức mọi thread chờ. Khi đó consumer đánh thức một producer và một consumer; consumer thấy fullEntries bằng 0 rồi ngủ lại, còn producer tiếp tục. Như thường lệ, đánh thức mọi thread chờ có thể gây thundering herd.

Vì thiếu sót này, Java sau đó thêm Condition class tường minh, cho phép giải pháp hiệu quả hơn cho vấn đề này và những concurrency problem tương tự.

## D.9 Tổng kết

Ta đã được giới thiệu monitor, khái niệm tổ chức do Brinch Hansen phát triển rồi Hoare tiếp nối đầu những năm bảy mươi. Khi chạy trong monitor, thread ngầm giữ monitor lock, ngăn thread khác vào, giúp dễ xây dựng mutual exclusion.

Ta còn được giới thiệu condition variable tường minh, cho phép thread signal() và wait() giống semaphore trong phần trước. Semantics của signal() và wait() thiết yếu; vì mọi hệ thống hiện đại triển khai Mesa semantics, phải kiểm tra lại điều kiện thread chờ để thực thi đúng. Vì vậy, signal() chỉ là hint rằng điều gì đó đã đổi; thread được đánh thức chịu trách nhiệm bảo đảm điều kiện phù hợp để tiếp tục.

Cuối cùng, vì C++ không hỗ trợ monitor, ta xem cách mô phỏng bằng pthread lock và condition variable tường minh. Ta cũng thấy Java hỗ trợ monitor bằng synchronized routine và một số hạn chế của chỉ cung cấp một condition variable trong môi trường đó.

## Tài liệu tham khảo

[BH73] “Operating System Principles”

Per Brinch Hansen, Prentice-Hall, 1973

Có tại: http://portal.acm.org/citation.cfm?id=540365

Một trong những sách đầu tiên về operating system, chắc chắn đi trước thời đại. Giới thiệu monitor làm concurrency primitive.

[H74] “Monitors: An Operating System Structuring Concept”

C.A.R. Hoare

CACM, Tập 17:10, trang 549–557, tháng Mười 1974

Một tài liệu tham khảo sớm về monitor; tuy nhiên Brinch Hansen có lẽ mới là nhà phát minh thực sự.

[H61] “Quicksort: Algorithm 64”

C.A.R. Hoare

CACM, Tập 4:7, tháng Bảy 1961

Thuật toán quicksort nổi tiếng.

[LR80] “Experience with Processes and Monitors in Mesa”

B.W. Lampson and D.R. Redell

CACM, Tập 23:2, trang 105–117, tháng Hai 1980

Một bài báo sớm, quan trọng, làm rõ khác biệt giữa lý thuyết và thực tiễn.

[L83] “Hints for Computer Systems Design”

Butler Lampson

ACM Operating Systems Review, 15:5, tháng Mười 1983

Lampson, nhà nghiên cứu hệ thống nổi tiếng, thích dùng hint trong thiết kế. Hint thường đúng nhưng có thể sai; ở đây, signal() báo cho thread chờ rằng đã thay đổi điều kiện nó chờ, nhưng đừng tin điều kiện vẫn ở state mong muốn lúc thức dậy. Trong bài về hint thiết kế hệ thống, một hint tổng quát của Lampson là hãy dùng hint. Không khó hiểu như nghe thoạt đầu đâu.

[S12a] “Synchronized Methods”

Sun documentation

http://java.sun.com/docs/books/tutorial/essential/concurrency/syncmeth.html

[S12b] “Condition Interface”

Sun documentation

http://java.sun.com/j2se/1.5.0/docs/api/java/util/concurrent/locks/Condition.html
