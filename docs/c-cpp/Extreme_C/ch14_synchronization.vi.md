<a id="_idParaDest-191"></a>

# Chương 14: Synchronization

Trong chương trước, chúng ta đã đi qua các khái niệm cơ bản và hệ thuật ngữ được dùng rộng rãi của concurrency. Trong chương này, chúng ta sẽ tập trung vào các vấn đề có thể xuất hiện do việc dùng concurrency trong một chương trình. Giống như chương trước, chúng ta sẽ không làm việc với source code C nào; thay vào đó, chúng ta sẽ đặt trọng tâm hoàn toàn vào các khái niệm và nền tảng lý thuyết xung quanh các vấn đề concurrency và việc giải quyết chúng.

Trong chương này, chúng ta sẽ tìm hiểu về:

- **Các vấn đề Concurrency-related, cụ thể là race condition và data race**: Chúng ta sẽ thảo luận về ảnh hưởng của việc có một shared state giữa nhiều tác vụ và việc truy cập đồng thời vào biến dùng chung có thể dẫn đến các vấn đề như thế nào.
- **Các kỹ thuật concurrency control được dùng để đồng bộ hóa việc truy cập vào một shared state**: Chúng ta chủ yếu sẽ nói về những kỹ thuật này từ góc nhìn lý thuyết, và chúng tôi sẽ giải thích các cách tiếp cận mà chúng ta có thể chọn để vượt qua các vấn đề concurrency-related.
- **Concurrency trong POSIX**: Trong chủ đề này, chúng ta thảo luận POSIX có thể chuẩn hóa cách chúng ta nên phát triển các chương trình concurrent như thế nào. Chúng tôi giải thích và so sánh ngắn gọn các chương trình multithreaded và multi-process.

Trong phần đầu tiên, chúng ta sẽ thảo luận thêm về cách bản chất non-deterministic của các môi trường concurrent có thể dẫn đến các vấn đề concurrency, như chúng tôi đã đề cập trong chương trước. Chúng ta cũng sẽ nói về cách chúng ta có thể phân loại những vấn đề như vậy.

<a id="_idParaDest-192"></a>

## Các vấn đề concurrency

Trong suốt chương trước, chúng ta đã<a id="_idIndexMarker917"></a> thấy rằng một shared state có thể sửa đổi có thể gây ra vấn đề khi một số tác vụ concurrent có thể thay đổi giá trị của shared state. Tìm hiểu thêm về điều này, chúng ta có thể hỏi, loại vấn đề nào có thể xảy ra? Lý do chính đằng sau chúng là gì? Chúng ta sẽ trả lời những câu hỏi này trong phần này.

Trước hết, chúng ta cần phân biệt các loại vấn đề concurrency khác nhau có thể xảy ra. Một số vấn đề concurrency chỉ tồn tại khi không có cơ chế concurrency control nào được áp dụng, và một số được đưa vào do việc dùng một kỹ thuật concurrency control.

Về các <a id="_idIndexMarker918"></a>vấn đề trong nhóm thứ nhất, chúng xảy ra khi bạn có thể thấy rằng các interleaving khác nhau dẫn đến các *overall state* khác nhau. Khi xác định được một trong những vấn đề này, bước tiếp theo dĩ nhiên sẽ là bắt đầu nghĩ về một cách sửa phù hợp để giải quyết vấn đề đó.

Về nhóm thứ hai, chúng chỉ phát sinh sau khi một cách sửa được áp dụng. Điều này có nghĩa là khi bạn sửa một vấn đề concurrency, bạn có thể đưa vào một vấn đề mới có bản chất hoàn toàn khác và một nguyên nhân gốc rễ khác; đây là điều khiến các chương trình concurrent khó xử lý.

Ví dụ, giả sử rằng bạn có một số tác vụ đều có quyền đọc/ghi vào cùng một nguồn dữ liệu dùng chung. Sau khi chạy các tác vụ nhiều lần, bạn phát hiện ra rằng các thuật toán của bạn, được viết cho các tác vụ khác nhau, không hoạt động như chúng được dự định. Điều này dẫn đến các crash bất ngờ hay các lỗi logic xảy ra ngẫu nhiên. Vì việc xảy ra crash và kết quả sai là ngẫu nhiên và không thể dự đoán trong trường hợp của bạn, bạn có thể hợp lý giả định rằng đó có thể là các vấn đề concurrency.

Bạn bắt đầu phân tích các thuật toán hết lần này đến lần khác, và cuối cùng bạn tìm ra vấn đề; có một *data race* trên<a id="_idIndexMarker919"></a> nguồn dữ liệu dùng chung. Giờ bạn cần nghĩ ra một cách sửa cố gắng kiểm soát việc truy cập vào nguồn dữ liệu dùng chung. Bạn triển khai một giải pháp và chạy lại hệ thống, và thật bất ngờ, bạn phát hiện ra rằng đôi khi một số tác vụ không bao giờ có cơ hội truy cập nguồn dữ liệu. Về mặt kỹ thuật, chúng ta nói rằng những tác vụ này bị *starved* (bỏ đói). Một vấn đề mới, với <a id="_idIndexMarker920"></a>bản chất hoàn toàn khác với vấn đề đầu tiên, đã được đưa vào bởi các thay đổi của bạn!

Do đó, giờ chúng ta có hai nhóm vấn đề concurrency khác nhau, đó là:

- Các vấn đề tồn tại trong<a id="_idIndexMarker921"></a> một hệ thống concurrent khi không có cơ chế kiểm soát (synchronization) nào được áp dụng. Chúng ta gọi chúng là *intrinsic concurrency issue* (vấn đề concurrency nội tại).
- Các vấn đề <a id="_idIndexMarker922"></a>xảy ra sau khi cố gắng giải quyết một vấn đề trong nhóm thứ nhất. Chúng ta gọi chúng là *post-synchronization issue*.

Lý do đằng sau việc gọi nhóm thứ nhất là *intrinsic* (nội tại) là do thực tế rằng những vấn đề này có mặt một cách nội tại trong mọi hệ thống concurrent. Bạn không thể tránh chúng, và bạn phải xử lý chúng bằng cách dùng các cơ chế kiểm soát. Theo một cách nào đó, chúng có thể được coi là một thuộc tính của các hệ thống concurrent hơn là các vấn đề. Mặc dù vậy, chúng ta coi chúng là vấn đề vì bản chất non-deterministic của chúng cản trở khả năng của chúng ta trong việc phát triển các chương trình tất định mà chúng ta cần.

Các vấn đề trong nhóm thứ hai chỉ xảy ra khi bạn dùng các cơ chế kiểm soát sai cách. Lưu ý rằng các cơ chế kiểm soát hoàn toàn không có vấn đề gì và thực sự cần thiết để mang lại tính tất định cho các chương trình của chúng ta. Tuy nhiên, nếu chúng được dùng sai cách, chúng có thể dẫn đến các vấn đề concurrency thứ cấp. Những vấn đề thứ cấp này, hay post-concurrency issue, có thể được coi là các bug mới được lập trình viên đưa vào, hơn là một thuộc tính nội tại của một hệ thống concurrent.

Trong các phần sau, chúng ta sẽ giới thiệu các vấn đề trong cả hai nhóm. Trước tiên, chúng ta bắt đầu với các vấn đề nội tại và thảo luận về lý do chính đằng sau việc có những thuộc tính nội tại gây vấn đề này trong các môi trường concurrent.

<a id="_idParaDest-193"></a>

## Các vấn đề concurrency nội tại

Mọi hệ thống concurrent với<a id="_idIndexMarker924"></a> nhiều hơn một tác vụ đều có thể có một<a id="_idIndexMarker925"></a> số interleaving khả dĩ, có thể được coi là một thuộc tính nội tại của hệ thống. Từ những gì chúng ta đã học cho đến giờ, chúng ta biết rằng thuộc tính này có bản chất non-deterministic, khiến các instruction của các tác vụ khác nhau được thực thi theo một thứ tự hỗn loạn trong mỗi lần chạy, trong khi vẫn tuân theo các *ràng buộc happens-before*. Lưu ý rằng đây là điều đã được giải thích trong chương trước.

Bản thân các interleaving không gây vấn đề và, như chúng tôi đã giải thích trước đây, chúng là một thuộc tính nội tại của một hệ thống concurrent. Nhưng trong một số trường hợp, thuộc tính này làm không thỏa mãn một số ràng buộc được dự định phải được bảo toàn. Đây chính xác là lúc các interleaving gây ra vấn đề.

Chúng ta biết rằng có thể có nhiều interleaving trong khi một số tác vụ đang được thực thi một cách concurrent. Tuy nhiên, vấn đề chỉ phát sinh khi một ràng buộc của hệ thống, vốn lẽ ra phải bất biến, lại bị các interleaving thay đổi từ lần chạy này sang lần chạy khác. Do đó, mục tiêu của chúng ta là dùng một số cơ chế kiểm soát, đôi khi được gọi là<a id="_idIndexMarker926"></a> *synchronization mechanism*, để giữ ràng buộc đó không đổi và bất biến.

Ràng buộc này thường được biểu đạt thông qua một danh sách điều kiện và tiêu chí, mà từ giờ trở đi chúng ta sẽ gọi là<a id="_idIndexMarker927"></a> *invariant constraint* (ràng buộc bất biến). Những ràng buộc này có thể là về gần như bất cứ thứ gì trong một hệ thống concurrent.

Các invariant constraint có thể là một thứ rất đơn giản, như ví dụ chúng tôi đã đưa ra trong các chương trước, trong đó chương trình lẽ ra phải in ra hai số 3 trong output của nó. Chúng cũng có thể rất phức tạp, như việc bảo toàn *data integrity* (tính toàn vẹn dữ liệu) của mọi nguồn dữ liệu bên ngoài trong một chương trình phần mềm concurrent khổng lồ.

> **Lưu ý**:
>
> Rất khó để tạo ra mọi interleaving khả dĩ. Trong một số trường hợp, một interleaving cụ thể chỉ<a id="_idIndexMarker928"></a> khả dĩ với một xác suất rất thấp. Nó có thể xảy ra một lần trong một triệu, nếu có xảy ra.
>
> Đây là một khía cạnh nguy hiểm khác của việc phát triển concurrent. Trong khi một số interleaving có thể chỉ xảy ra một lần trong một triệu, khi chúng gây lỗi, chúng gây lỗi rất nặng. Chẳng hạn, chúng có thể gây ra một vụ rơi máy bay hay một sự cố thiết bị nghiêm trọng trong một ca phẫu thuật não!

Mọi hệ thống concurrent đều có ít nhất một số invariant constraint well-defined. Khi chúng ta tiến qua chương, chúng tôi đưa ra các ví dụ và với mỗi ví dụ, chúng ta sẽ thảo luận về các invariant constraint của nó. Đó là vì chúng ta cần những ràng buộc này để có thể thiết kế một hệ thống concurrent cụ thể sẽ thỏa mãn chúng và giữ chúng bất biến.

Các interleaving xảy ra trong một hệ thống concurrent nên thỏa mãn các invariant constraint đã được định nghĩa. Nếu chúng không thỏa mãn, có điều gì đó sai với hệ thống. Đây là lúc các invariant constraint trở thành một yếu tố rất quan trọng. Bất cứ khi nào có các interleaving làm không thỏa mãn các invariant constraint của một hệ thống, chúng ta nói rằng chúng ta có một *race* *condition* trong hệ thống.

Một race condition là một vấn đề được gây ra bởi thuộc tính nội tại của các hệ thống concurrent, hay nói cách khác, các interleaving. Bất cứ khi nào chúng ta gặp một race condition, các invariant constraint của hệ thống có nguy cơ bị vi phạm.

Hệ quả của việc không thỏa mãn các invariant constraint có thể được quan sát thấy dưới dạng hoặc lỗi logic hoặc crash đột ngột. Có rất nhiều ví dụ trong đó các giá trị được lưu trong các biến dùng chung không phản ánh state thực sự. Điều này chủ yếu là do có các interleaving khác nhau làm hỏng *data integrity* của biến dùng chung.

Chúng tôi sẽ giải thích các vấn đề data integrity-related sau trong chương này nhưng, lúc này, hãy xem ví dụ sau. Như chúng tôi đã nói trước đây, chúng ta phải định nghĩa các invariant constraint của một ví dụ trước khi có thể nhảy vào nó. *Ví dụ 14.1* được thể hiện trong *Code Box 14-1* chỉ có một invariant constraint, và đó là có giá trị đúng cuối cùng trong biến dùng chung `Counter`, vốn nên là `3`. Có ba tác vụ concurrent trong ví dụ này. Mỗi tác vụ được dự định tăng `Counter` lên một, và đây là logic mà chúng ta đã nhắm tới trong code box sau:

```
Concurrent System {
    Shared State {
      Counter : Integer = 0
    }

    Task T1 {
      A : Integer
        1.1. A = Counter
        1.2. A = A + 1
        1.2. Counter = A
    }
    Task T2 {
      B : Integer
        2.1. B = Counter
        2.2. B = B + 1
        2.2. Counter = B
    }
    Task T3 {
      A : Integer
        3.1. A = Counter
        3.2. A = A + 1
        3.2. Counter = A
    }
}
```

*Code Box 14-1: Một hệ thống gồm ba tác vụ concurrent thao tác trên một biến dùng chung duy nhất*

Trong code box trên, bạn thấy một hệ thống concurrent được viết bằng pseudo-code. Như bạn có thể thấy, có ba tác vụ trong hệ thống concurrent. Cũng có một phần dành cho các shared state. Trong <a id="_idIndexMarker930"></a>hệ thống trên, `Counter` là biến dùng chung duy nhất có thể truy cập được bởi cả ba tác vụ.

Mỗi tác vụ có thể có một số biến local. Những biến local này là private đối với tác vụ và các tác vụ khác không thể thấy chúng. Đó là lý do tại sao chúng ta có thể có hai biến local với cùng tên `A`, nhưng mỗi biến đều khác nhau và local đối với tác vụ sở hữu nó.

Lưu ý rằng các tác vụ không thể thao tác trực tiếp trên các biến dùng chung, và chúng chỉ có thể đọc giá trị của chúng hay thay đổi giá trị của chúng. Về cơ bản đó là lý do tại sao bạn cần có một số biến local. Như bạn có thể thấy, các tác vụ chỉ có thể tăng một biến local chứ không thể tăng trực tiếp biến dùng chung. Điều này rất phù hợp với những gì chúng ta thấy trong các hệ thống multithreading và multi-processing, và đó là lý do tại sao chúng tôi đã chọn cấu hình trên để biểu diễn một hệ thống concurrent.

Ví dụ được thể hiện trong *Code Box 14-1* cho chúng ta thấy race condition có thể dẫn đến một lỗi logic như thế nào. Rất dễ tìm ra một interleaving dẫn đến việc có giá trị `2` trong biến dùng chung `Counter`. Chỉ cần xem interleaving trong *Code Box 14-2*:

```
  Task Scheduler |    Task T1   |    Task T2   |  Task T3
---------------------------------------------------------
  Context Switch |              |              |
                 |  A = Counter |              |
                 |  A = A + 1   |              |
                 |  Counter = A |              |
  Context Switch |              |              |
                 |              |  B = Counter |
                 |              |  B = B + 1   |
  Context Switch |              |              |
                 |              |              |  A = Counter
  Context Switch |              |              |
                 |              |  Counter = B |
  Context Switch |              |              |
                 |              |              |  A = A + 1
                 |              |              |  Counter = A
```

*Code Box 14-2: Một interleaving vi phạm invariant constraint được định nghĩa cho Code Box 14.1*

Ở đây, rất dễ lần theo interleaving. Các instruction `2.3` và `3.3` (như thấy trong *Code Box 14-1*) đều lưu giá trị `2` vào biến dùng chung `Counter`. Tình huống trên được gọi là một *data race*, điều mà chúng tôi sẽ giải thích chi tiết hơn sau trong phần này.

Ví dụ tiếp theo, được thể hiện trong *Code Box 14-3*, minh họa một race condition có thể dẫn đến crash như thế nào.

> **Lưu ý**:
>
> Trong phần sau, chúng ta sẽ dùng một ví dụ C pseudo-codes. Đó là vì chúng tôi chưa giới thiệu POSIX API, vốn cần thiết để viết code C tạo và quản lý thread hay process.

Code sau là một ví dụ có thể dẫn đến segmentation fault nếu nó được viết bằng C:

```
Concurrent System {
    Shared State {
      char *ptr = NULL; // A shared char pointer which is
                        // supposed to point to a memory
                        // address in the Heap space. It
                        // becomes null by default.
    }
    Task P {
        1.1. ptr = (char*)malloc(10 * sizeof(char));
        1.2. strcpy(ptr, "Hello!");
        1.3. printf("%s\n", ptr);
    }
    Task Q {
        2.1. free(ptr);
        2.2. ptr = NULL;
    }
}
```

*Code Box 14-3: Một interleaving vi phạm invariant constraint của ví dụ thấy trong Code Box 14-1*

Một trong những invariant<a id="_idIndexMarker932"></a> constraint hiển nhiên mà chúng ta quan tâm trong ví dụ này là không để một tác vụ bị crash, điều được bao gồm một cách *ngầm định* trong các invariant constraint của chúng ta. Nếu một tác vụ không thể sống sót để hoàn thành công việc của mình, thì việc có một invariant constraint ngay từ đầu đã là mâu thuẫn.

Có một số interleaving <a id="_idIndexMarker933"></a>khiến các tác vụ trên bị crash. Tiếp theo, chúng tôi giải thích hai trong số đó:

- Trước tiên, giả sử rằng instruction `2.1` được thực thi trước. Vì `ptr` là null, nên tác vụ `Q` sẽ crash, trong khi tác vụ `P` tiếp tục. Kết quả là, và trong trường hợp multithreading khi cả hai tác vụ (thread) thuộc cùng một process, toàn bộ chương trình chứa hai tác vụ sẽ crash. Lý do chính đằng sau crash là việc delete một null pointer.
- Interleaving kia là khi instruction `2.2` được thực thi trước `1.2` nhưng sau `1.1`. Trong trường hợp này, tác vụ `P` sẽ crash, trong khi tác vụ `Q` kết thúc mà không có vấn đề gì. Lý do chính đằng sau crash là việc dereference một null pointer.

Do đó, như bạn thấy trong các ví dụ trước, việc có một race condition trong một hệ thống concurrent có thể dẫn đến các tình huống khác nhau, như lỗi logic hay crash đột ngột. Hai sự việc hiển nhiên cần được giải quyết đúng cách.

Đáng dành<a id="_idIndexMarker934"></a> một chút thời gian để bảo đảm rằng chúng ta hiểu rằng không phải mọi race condition trong một hệ thống concurrent đều có thể dễ dàng được nhận ra. Một số race condition vẫn ẩn giấu cho đến khi chúng tự lộ diện muộn hơn nhiều. Đây là lý do tại sao tôi mở đầu chương này bằng việc nói rằng các chương trình concurrent khó xử lý.

Như đã nói, đôi khi<a id="_idIndexMarker935"></a> chúng ta sẽ dùng *race detector* để tìm các race condition hiện có trong các nhánh code ít được thực thi hơn. Thực tế, chúng có thể được dùng để xác định các interleaving dẫn đến một race condition.

> **Lưu ý**:
>
> Race condition có thể<a id="_idIndexMarker936"></a> được phát hiện bởi một nhóm chương trình gọi là *race detector*. Chúng được phân nhóm dựa trên việc là tĩnh hay động.
>
> *Static race detector* sẽ đi qua<a id="_idIndexMarker937"></a> source code và cố gắng tạo ra mọi interleaving dựa trên các instruction quan sát được, trong khi *dynamic race detector* chạy <a id="_idIndexMarker938"></a>chương trình trước và sau đó chờ một lần thực thi code bị nghi là một race condition. Cả hai được dùng kết hợp để giảm thiểu rủi ro có race condition.

Giờ, đã đến lúc cho một câu hỏi. Có một lý do chính duy nhất đằng sau mọi race condition không? Chúng ta cần trả lời câu hỏi này để nghĩ ra một giải pháp loại bỏ các race condition. Chúng ta biết rằng bất cứ khi nào một interleaving làm không thỏa mãn invariant constraint, một race condition xảy ra. Do đó, để trả lời câu hỏi, chúng ta cần tiến hành một phân tích sâu hơn về các invariant constraint khả dĩ và xem chúng có thể bị vi phạm như thế nào.

Từ những gì chúng ta đã quan sát trên nhiều hệ thống concurrent khác nhau, để giữ một invariant constraint được thỏa mãn, luôn có một số instruction được tìm thấy trong các tác vụ khác nhau cần được thực thi theo một thứ tự nghiêm ngặt trên mọi interleaving.

Do đó, những interleaving tuân theo thứ tự này không vi phạm invariant constraint. Chúng ta hài lòng với những interleaving này, và chúng ta quan sát thấy output mong muốn. Những interleaving không giữ thứ tự nghiêm ngặt sẽ làm không thỏa mãn invariant constraint và do đó có thể được coi là các interleaving gây vấn đề.

Đối với những interleaving này, chúng ta cần dùng các cơ chế để khôi phục thứ tự và bảo đảm rằng các invariant constraint luôn được thỏa mãn. *Ví dụ 14.2* có thể được thấy trong *Code Box 14-4*. Ràng buộc nên giữ bất biến là **có 1 được in ra trong output**. Dù ràng buộc này hơi non nớt, và bạn sẽ không thấy nó trong các ứng dụng concurrent thực tế, nó giúp chúng ta hiểu các khái niệm đang thảo luận:

```
Concurrent System {
  Shared State {
    X : Integer = 0
  }
  Task P {
      1.1. X = 1
  }
  Task Q {
      2.1. print X
  }
}
```

*Code Box 14-4: Một hệ thống concurrent rất đơn giản mắc phải một race condition*

Ví dụ <a id="_idIndexMarker939"></a>trên có thể có hai output khác nhau dựa trên các interleaving mà nó có. Nếu chúng ta muốn có `1` được in ra trong output, điều được invariant constraint áp đặt, thì chúng ta cần định nghĩa một thứ tự nghiêm ngặt cho các instruction trong hai tác vụ khác nhau.

Vì mục đích này, instruction in, `2.1`, phải được thực thi chỉ sau instruction `1.1`. Vì có một interleaving khác dễ dàng vi phạm thứ tự như vậy, và do đó vi phạm invariant constraint, nên chúng ta có một race condition. Chúng ta cần một thứ tự nghiêm ngặt giữa những instruction này. Tuy nhiên, đặt chúng theo thứ tự mong muốn không phải là một việc dễ dàng. Chúng ta sẽ thảo luận các cách khôi phục thứ tự này sau trong chương này.

Hãy xem *ví dụ 14.3*, dưới đây. Trong code sau, chúng ta có một hệ thống gồm ba tác vụ. Chúng ta nên lưu ý rằng không có shared state nào trong hệ thống này. Tuy nhiên, dù vậy, chúng ta có một race condition. Hãy định nghĩa invariant constraint của hệ thống sau là **luôn in 1 trước tiên, 2 thứ hai, và 3 sau cùng**:

```
Concurrent System {
  Shared State {
  }
  Task P {
      1.1. print 3
  }
  Task Q {
      2.1. print 1
  }
  Task R {
      3.1. print 2
  }
}
```

*Code Box 14-5: Một hệ thống concurrent rất đơn giản khác mắc phải race condition nhưng không có bất kỳ shared state nào*

Ngay cả trong hệ thống rất<a id="_idIndexMarker940"></a> đơn giản này, bạn không thể bảo đảm tác vụ nào sẽ bắt đầu trước, và vì vậy, chúng ta có một race condition. Do đó, để thỏa mãn invariant constraint, chúng ta cần thực thi các instruction theo thứ tự sau: `2.1`, `3.1`, `1.1`. Thứ tự này phải được giữ trong mọi interleaving khả dĩ.

Ví dụ trên tiết lộ một đặc điểm quan trọng của race condition, đó là: Để có một race condition trong một hệ thống concurrent, chúng ta không cần có một shared state. Thay vào đó, để tránh có race condition, chúng ta cần giữ một số instruction theo một thứ tự nghiêm ngặt mọi lúc. Chúng ta nên lưu ý rằng race condition chỉ xảy ra vì một tập nhỏ instruction, thường<a id="_idIndexMarker941"></a> được gọi là một *critical section*, được thực thi sai thứ tự, trong khi các instruction khác có thể được thực thi theo bất kỳ thứ tự nào.

Việc có cả một shared state có thể ghi lẫn một invariant constraint cụ thể liên quan đến shared state có thể áp đặt một thứ tự nghiêm ngặt giữa các instruction *đọc* và *ghi* nhắm tới shared state đó. Một trong những ràng buộc quan trọng nhất về một shared state có thể ghi là data integrity. Nó đơn giản có nghĩa là mọi tác vụ nên luôn có khả năng đọc giá trị mới nhất và tươi nhất của shared state, ngoài việc biết về bất kỳ cập nhật nào được thực hiện đối với shared state trước khi tiếp tục với các instruction của riêng chúng sửa đổi shared state.

*Ví dụ 14.4*, được thể hiện trong *Code Box 14-6*, giải thích ràng buộc data integrity và, quan trọng hơn, nó có thể bị vi phạm dễ dàng như thế nào:

```
Concurrent System {
  Shared State {
    X : Integer = 2
  }
  Task P {
    A : Integer
      1.1. A = X
      1.2. A = A + 1
      1.3. X = A
  }
  Task Q {
    B : Integer
      2.1. B = X
      2.2. B = B + 3
      2.3. X = B
  }
}
```

*Code Box 14-6: Một hệ thống concurrent mắc phải một data race trên biến dùng chung X*

Hãy xem xét interleaving sau. Trước tiên, instruction `1.1` được thực thi. Do đó, giá trị của `X` được sao chép vào biến local `A`. Tuy nhiên, tác vụ `P` không may mắn lắm, nên một context switch xảy ra, và CPU được trao cho tác vụ `Q`. Instruction `2.1` sau đó được thực thi, và rồi giá trị của `X` được sao chép vào biến local `B`. Do đó, cả hai biến `A` và `B` đều có cùng giá trị, `2`.

Giờ, tác vụ `Q`<a id="_idIndexMarker942"></a> may mắn và có thể tiếp tục thực thi. Instruction `2.2` sau đó được thực thi, và `B` trở thành `5`. Tác vụ `Q` tiếp tục và ghi giá trị `5` vào shared state `X`. Vì vậy, `X` trở thành `5`.

Giờ, context switch tiếp theo xảy ra, và CPU được trao lại cho tác vụ `P`. Nó tiếp tục với instruction `1.2`. Đây là nơi ràng buộc integrity bị vi phạm.

Shared state `X` đã được tác vụ `Q` cập nhật, nhưng tác vụ `P` đang dùng giá trị cũ `2` cho phần còn lại của các phép tính. Rốt cuộc, nó đặt lại giá trị của `X` thành `3`, điều khó có thể là kết quả mà lập trình viên mong muốn. Để giữ ràng buộc data integrity được thỏa mãn, chúng ta phải bảo đảm rằng instruction `1.1` chỉ được thực thi sau instruction `2.3`, hoặc instruction `2.1` chỉ được thực thi sau instruction `1.3`, nếu không data integrity có khả năng bị xâm phạm.

> **Lưu ý**:
>
> Bạn có thể tự hỏi tại sao chúng ta lại dùng các biến local `A` và `B` khi chúng ta có thể dễ dàng viết `X = X + 1` hay `X = X + 3`.
>
> Như chúng tôi đã giải thích trong chương trước, instruction `X = X + 1`, vốn trong C được viết là `X++`, không phải là một instruction *atomic*. Nó đơn giản có nghĩa là nó không thể được thực hiện chỉ trong một instruction và nó cần nhiều hơn một. Đó là vì chúng ta không bao giờ có quyền truy cập trực tiếp vào một biến trong memory khi thực hiện một phép toán trên nó.
>
> Chúng ta luôn dùng một biến tạm, hay một register CPU, để giữ giá trị mới nhất và thực hiện phép toán trên biến tạm hay register đó và sau đó chuyển kết quả trở lại memory. Do đó, bất kể bạn viết nó như thế nào, luôn có một biến tạm gắn cục bộ với tác vụ.
>
> Bạn sẽ thấy rằng tình huống còn tệ hơn trong các hệ thống có nhiều hơn một lõi CPU. Chúng ta cũng có các CPU cache cache các biến và không chuyển kết quả trở lại biến trong main memory ngay lập tức.

Hãy nói về<a id="_idIndexMarker943"></a> một định nghĩa khác. Bất cứ khi nào một số interleaving làm mất hiệu lực ràng buộc data integrity liên quan đến một shared state, người ta nói rằng chúng ta có một data race trên shared state đó.

Data race rất giống race condition, nhưng để có một data race, chúng ta cần có một shared state giữa các tác vụ khác nhau và shared state đó phải có thể bị sửa đổi (có thể ghi) bởi ít nhất một trong các tác vụ. Nói cách khác, shared state không nên là read-only đối với mọi tác vụ, và nên có ít nhất một tác vụ có thể ghi vào shared state dựa trên logic của nó.

Như chúng tôi đã nói trước đây, đối với một shared state read-only, chúng ta *không thể* có một data race. Đó là do thực tế rằng người ta không thể phá hỏng data integrity của một shared state read-only vì giá trị của shared state không thể bị sửa đổi.

*Ví dụ 14.5*, được thể hiện trong *Code Box 14-7*, cho thấy cách chúng ta có thể có một race condition, trong khi đồng thời không thể có data race nào trên một shared state read-only:

```
Concurrent System {
  Shared State {
    X : Integer (read-only) = 5
  }
  Task P {
    A : Integer
      1.1. A = X
      1.2. A = A + 1
      1.2. print A
  }
  Task Q {
      2.1. print X
  }
  Task R {
    B : Integer
      3.1. B = X + 1
      3.2. B = B + 1
      3.3. print B
  }
}
```

*Code Box 14-7: Một hệ thống concurrent với một shared state read-only*

Giả sử rằng<a id="_idIndexMarker944"></a> invariant constraint của ví dụ trên là **giữ data integrity của X và trước tiên in 5, sau đó 6, và cuối cùng 7**. Chắc chắn, chúng ta có một race condition vì cần một thứ tự nghiêm ngặt giữa các instruction `print` khác nhau.

Tuy nhiên, vì biến dùng chung là read-only, không có data race nào. Lưu ý rằng các instruction `1.2` và `3.2` chỉ sửa đổi các biến local của chúng, và do đó chúng không thể được coi là các sửa đổi đối với shared state.

Lưu ý cuối cùng trong phần này: Đừng kỳ vọng race condition được giải quyết dễ dàng! Bạn chắc chắn sẽ cần dùng một số cơ chế synchronization để tạo ra thứ tự cần thiết giữa các instruction nhất định từ các tác vụ khác nhau. Điều này sẽ buộc mọi interleaving khả dĩ tuân theo thứ tự đã cho. Thực tế, bạn sẽ thấy trong phần tiếp theo rằng chúng ta phải đưa vào một số interleaving mới tuân theo thứ tự mong muốn.

Chúng ta sẽ nói về những cơ chế này sau trong chương này; trước đó, chúng ta cần giải thích các vấn đề concurrency-related xảy ra sau khi dùng một số phương pháp synchronization. Phần tiếp theo hoàn toàn nói về các vấn đề *post-synchronization* và chúng khác với các vấn đề nội tại như thế nào.

<a id="_idParaDest-194"></a>

## Các vấn đề Post-synchronization

Tiếp theo, chúng ta sẽ nói <a id="_idIndexMarker945"></a>về ba trong số các vấn đề then chốt<a id="_idIndexMarker946"></a> được kỳ vọng xảy ra do việc dùng sai các cơ chế kiểm soát. Bạn có thể gặp một hoặc thậm chí tất cả những vấn đề này cùng nhau vì chúng có các nguyên nhân gốc rễ khác nhau:

- **Các vấn đề nội tại mới**: Việc áp dụng các cơ chế kiểm soát có thể dẫn đến việc có các race<a id="_idIndexMarker947"></a> condition hay data race khác. Các cơ chế kiểm soát nhằm áp đặt một thứ tự nghiêm ngặt giữa các instruction, và điều này có thể khiến các vấn đề nội tại mới hơn xảy ra. Việc các cơ chế kiểm soát đưa vào các interleaving mới là cơ sở cho việc gặp phải các hành vi và vấn đề concurrency-related mới. Do việc có các race condition mới và các data race mới, các lỗi logic và crash mới có thể xảy ra. Bạn sẽ phải đi qua các kỹ thuật synchronization đã dùng và tinh chỉnh chúng dựa trên logic chương trình của bạn để sửa những vấn đề mới này.

- **Starvation** (bỏ đói): Khi một<a id="_idIndexMarker949"></a> tác vụ trong một hệ thống concurrent không có quyền truy cập vào một tài nguyên dùng chung trong một khoảng thời gian dài, chủ yếu do việc dùng một cơ chế kiểm soát cụ thể, người ta nói rằng tác vụ đã bị bỏ đói. Một tác vụ bị bỏ đói không thể truy cập tài nguyên dùng chung, và do đó nó không thể thực hiện mục đích của mình một cách hiệu quả. Nếu các tác vụ khác dựa vào sự hợp tác của một tác vụ bị bỏ đói, bản thân chúng cũng có thể bị bỏ đói.

- **Deadlock**: Khi mọi tác vụ<a id="_idIndexMarker950"></a> trong một hệ thống concurrent đang chờ nhau và không tác vụ nào tiến lên, chúng ta nói rằng một<a id="_idIndexMarker951"></a> deadlock đã xảy ra. Nó chủ yếu xảy ra do một cơ chế kiểm soát được áp dụng sai cách, điều đến lượt nó khiến các tác vụ đi vào một vòng lặp vô hạn chờ tác vụ kia giải phóng một tài nguyên dùng chung hay mở khóa một đối tượng lock, v.v. Điều này<a id="_idIndexMarker952"></a> thường được gọi là *circular wait* (chờ vòng tròn). Trong khi các tác vụ đang chờ, không tác vụ nào có thể tiếp tục thực thi, và kết quả là, hệ thống sẽ đi vào một tình trạng coma-like (giống hôn mê). Một số minh họa mô tả tình huống deadlock có thể được[<a id="_idIndexMarker953"></a> found on the Wikipedia page found at: h](https://en.wikipedia.org/wiki/Deadlock)ttps://en.wikipedia.org/wiki/Deadlock (tìm thấy trên trang Wikipedia).

  Trong một tình huống deadlock, mọi tác vụ đều bị kẹt và đang chờ nhau. Nhưng thường có những tình huống mà chỉ một phần tác vụ, chỉ một hoặc hai trong số chúng, bị kẹt và phần còn lại<a id="_idIndexMarker954"></a> có thể tiếp tục. Chúng ta gọi chúng là các tình huống *semi-deadlock*. Chúng ta sẽ thấy thêm về những tình huống semi-deadlock này trong các phần sắp tới.

- **Priority inversion** (đảo ngược độ ưu tiên): Có những tình huống mà, sau khi dùng một kỹ thuật synchronization<a id="_idIndexMarker955"></a>, một tác vụ có độ ưu tiên cao hơn để dùng một tài nguyên dùng chung bị chặn phía sau một tác vụ có độ ưu tiên thấp và bằng cách này, độ ưu tiên của chúng bị đảo ngược. Đây là một loại vấn đề thứ cấp khác có thể xảy ra do một kỹ thuật synchronization được triển khai sai.

Starvation không tồn tại mặc định trong một hệ thống concurrent; khi không có kỹ thuật synchronization nào được áp đặt lên task scheduler của hệ điều hành, hệ thống là công bằng và không cho phép tác vụ nào bị bỏ đói. Chỉ việc có một số cơ chế kiểm soát được lập trình viên dùng mới có thể dẫn đến starvation. Tương tự, việc xảy ra deadlock cũng không tồn tại trong một hệ thống concurrent cho đến khi lập trình viên can thiệp. Lý do chính cho hầu hết các tình huống deadlock là khi các lock được dùng theo cách mà mọi tác vụ trong một hệ thống concurrent đều đang chờ nhau giải phóng lock. Nói chung, deadlock là một vấn đề phổ biến hơn starvation trong một hệ thống concurrent.

Giờ, chúng ta nên<a id="_idIndexMarker956"></a> tiếp tục và nói về các cơ chế kiểm soát. Trong phần tiếp theo, chúng ta sẽ nói về các kỹ thuật synchronization khác nhau có thể được dùng để vượt qua race condition.

<a id="_idParaDest-195"></a>

## Các kỹ thuật synchronization

Trong phần này, chúng ta sẽ nói <a id="_idIndexMarker957"></a>về các kỹ thuật synchronization, hay các kỹ thuật concurrency control, hay các cơ chế concurrent control, được dùng để vượt qua các vấn đề concurrency-related nội tại. Nhìn lại những gì chúng tôi đã giải thích cho đến giờ, các cơ chế kiểm soát cố gắng vượt qua các vấn đề mà một phần các interleaving có thể gây ra trong một hệ thống.

Mỗi hệ thống concurrent có các invariant constraint riêng, và không phải mọi interleaving đều sẽ giữ tất cả chúng được thỏa mãn. Đối với những interleaving làm không thỏa mãn các invariant constraint của hệ thống, chúng ta cần phát minh một phương pháp để áp đặt một thứ tự cụ thể giữa các instruction. Nói cách khác, chúng ta nên *tạo ra* các interleaving mới thỏa mãn invariant constraint và thay thế các interleaving xấu bằng chúng. Sau khi dùng một kỹ thuật synchronization nhất định, chúng ta sẽ có một hệ thống concurrent hoàn toàn mới với một số interleaving mới, và hy vọng của chúng ta là hệ thống mới sẽ giữ các invariant constraint được thỏa mãn và không tạo ra vấn đề post-synchronization nào.

Lưu ý rằng để dùng một kỹ thuật synchronization, chúng ta sẽ cần vừa viết code mới vừa thay đổi code hiện có. Khi bạn thay đổi code hiện có, bạn thực chất đang thay đổi thứ tự của các instruction, và do đó thay đổi các interleaving. Thay đổi code đơn giản tạo ra một hệ thống concurrent mới với các interleaving mới.

Việc có các interleaving mới giải quyết các vấn đề concurrent của chúng ta như thế nào? Bằng việc đưa vào các interleaving được thiết kế mới thêm vào, chúng ta áp đặt thêm một số ràng buộc happens-before giữa các instruction khác nhau từ các tác vụ khác nhau, điều giữ các invariant constraint được thỏa mãn.

Lưu ý rằng các ràng buộc happens-before <a id="_idIndexMarker958"></a>luôn tồn tại giữa hai instruction kề nhau trong một tác vụ đơn lẻ, nhưng chúng ta không có chúng giữa hai instruction từ hai tác vụ khác nhau trong một hệ thống concurrent và bằng việc dùng các kỹ thuật synchronization, chúng ta định nghĩa một số ràng buộc happens-before mới chi phối thứ tự thực thi giữa hai tác vụ khác nhau.

Có một hệ thống concurrent hoàn toàn mới có nghĩa là có các vấn đề mới, khác biệt. Hệ thống concurrent first-hand (ban đầu) là một hệ thống tự nhiên trong đó task scheduler là thực thể duy nhất điều khiển các context switch. Nhưng trong hệ thống sau, chúng ta đang đối mặt với một hệ thống concurrent nhân tạo và được thiết kế, nơi task scheduler không phải là yếu tố tác động duy nhất. Các cơ chế concurrency control được dùng để bảo toàn các invariant constraint của hệ thống là những yếu tố quan trọng khác. Do đó, các vấn đề mới hơn<a id="_idIndexMarker959"></a> gọi là *post-synchronization issue*, đã được thảo luận trong phần trước, sẽ xuất hiện.

Việc dùng một kỹ thuật kiểm soát phù hợp để đồng bộ hóa một số tác vụ và khiến chúng tuân theo một thứ tự cụ thể phụ thuộc vào môi trường concurrent first-hand. Ví dụ, các cơ chế kiểm soát được dùng trong một chương trình multi-processing có thể khác với các phương pháp được dùng trong một chương trình multithreading.

Vì điều này, chúng ta không thể thảo luận chi tiết về các cơ chế kiểm soát ở đây mà không dùng code C thật. Do đó chúng ta sẽ thảo luận chúng theo một cách trừu tượng đúng với mọi hệ thống concurrent, bất kể phương pháp triển khai của chúng. Các kỹ thuật và khái niệm sau do đó hợp lệ trong mọi hệ thống concurrent, nhưng bản triển khai của chúng phụ thuộc rất nhiều vào bản chất thực sự của môi trường xung quanh và chính hệ thống.

<a id="_idParaDest-196"></a>

### Busy-waits và spin lock

Như một giải pháp chung, để<a id="_idIndexMarker960"></a> buộc một instruction từ <a id="_idIndexMarker961"></a>một tác vụ được thực thi<a id="_idIndexMarker962"></a> sau một instruction khác<a id="_idIndexMarker963"></a> từ một tác vụ khác, tác vụ thứ nhất nên chờ tác vụ sau thực thi instruction của nó trước. Trong lúc đó, tác vụ thứ nhất có thể có được CPU do một context switch, nhưng nó không nên tiếp tục thực thi, và nó vẫn nên chờ. Nói cách khác, tác vụ thứ nhất nên tạm dừng và chờ cho đến khi tác vụ sau đã thực thi instruction của nó.

Khi tác vụ sau có thể hoàn tất việc thực thi instruction của nó, thì có hai lựa chọn khả dụng. Hoặc chính tác vụ thứ nhất kiểm tra lại và thấy rằng tác vụ sau đã làm xong công việc của mình hoặc phải có một cách để tác vụ sau thông báo cho tác vụ thứ nhất và cho nó biết rằng giờ nó có thể tiếp tục thực thi instruction của mình.

Kịch bản<a id="_idIndexMarker965"></a> được mô tả tương tự một tình huống trong đó hai <a id="_idIndexMarker966"></a>người cố gắng làm một việc gì đó theo một thứ tự đã định. Một trong số họ phải chờ người kia hoàn thành công việc của mình, và chỉ khi đó người kia mới có thể tiếp tục làm công việc của riêng mình. Chúng ta có thể nói rằng gần như mọi cơ chế kiểm soát đều dùng một cách tiếp cận tương tự điều này, nhưng các bản triển khai<a id="_idIndexMarker967"></a> của nó rất đa dạng, và chúng chủ yếu phụ thuộc vào các cơ chế có sẵn trong một môi trường cụ thể. Chúng tôi sẽ giải thích một trong những môi trường này, một hệ thống POSIX-compliant, và các cơ chế có sẵn trong nó, trong phần cuối của chương này.

Hãy giải thích kỹ thuật kiểm soát trên, vốn là trung tâm của mọi kỹ thuật khác, bằng một ví dụ. *Ví dụ 14.6*, được thể hiện trong *Code Box 14-8*, là một hệ thống gồm hai tác vụ concurrent, và chúng ta muốn định nghĩa invariant constraint là **có A trước, và sau đó B được in ra trong output**. Không có cơ chế kiểm soát nào được áp dụng, nó trông như code box sau:

```
Concurrent System {
  Task P {
    1.1. print 'A'
  }
  Task Q {
    2.1. print 'B'
  }
}
```

*Code Box 14-8: Một hệ thống concurrent biểu diễn ví dụ 14.6 trước khi đưa vào một cơ chế kiểm soát*

Rõ ràng là chúng ta có một race condition dựa trên invariant constraint đã định nghĩa. Interleaving `{2.1, 1.1}` in `B` rồi `A`, điều đi ngược lại invariant constraint. Do đó, chúng ta cần dùng một cơ chế kiểm soát để giữ một thứ tự cụ thể giữa các instruction trên.

Chúng ta muốn có `2.1` được thực thi chỉ khi instruction `1.1` đã được thực thi. Đoạn pseudo-code sau được thể hiện trong *Code Box 14-9* minh họa cách chúng ta thiết kế và dùng cách tiếp cận previously-explained (đã giải thích trước đó) để khôi phục thứ tự giữa các instruction:

```
Concurrent System {
  Shared State {
    Done : Boolean = False
  }
  Task P {
    1.1. print 'A'
    1.2. Done = True
  }
  Task Q {
    2.1. While Not Done Do Nothing
    2.2. print 'B'
  }
}
```

*Code Box 14-9: Một giải pháp cho ví dụ 14.6 dùng busy-waiting*

Như bạn có thể thấy, chúng ta<a id="_idIndexMarker968"></a> đã phải thêm nhiều instruction hơn để đồng bộ hóa các tác vụ. Do đó, có vẻ như chúng ta đã thêm một loạt interleaving mới. Chính xác hơn, chúng ta đang đối mặt với một <a id="_idIndexMarker969"></a>hệ thống concurrent hoàn toàn mới so với hệ thống trước. Hệ thống mới này có tập interleaving riêng hoàn toàn không thể so sánh với các interleaving trong hệ thống cũ.

Một điều là chung giữa mọi interleaving mới này, và đó là thực tế rằng instruction `1.1` luôn xảy ra trước instruction `2.2`; đây là điều chúng ta muốn đạt được bằng việc thêm cơ chế kiểm soát. Bất kể interleaving nào được chọn hay các context switch xảy ra như thế nào, chúng ta đã áp đặt một ràng buộc happens-before giữa các instruction `1.1` và `2.2`.

Điều này khả thi như thế nào? Trong hệ thống trên, chúng ta đã đưa vào một shared state mới, `Done`, là một biến Boolean ban đầu được đặt thành `False`. Bất cứ khi nào tác vụ `P` in `A`, nó đặt `Done` thành `True`. Sau đó, tác vụ `Q`, vốn đang chờ `Done` trở thành `True`, thoát khỏi vòng lặp `while` tại dòng `2.1` và in `B`. Nói cách khác, tác vụ `Q` chờ trong một vòng lặp `while` cho đến khi shared state `Done` trở thành `True` và đó là dấu hiệu cho thấy tác vụ `P` đã hoàn tất lệnh `print` của nó. Mọi thứ có vẻ ổn với giải pháp được đề xuất, và thực tế, nó hoạt động tốt.

Hãy thử tưởng tượng interleaving sau. Khi tác vụ `P` mất lõi CPU và tác vụ `Q` có được lõi CPU, nếu `Done` không phải là true, thì tác vụ `Q` vẫn ở trong vòng lặp cho đến khi nó mất lõi CPU lần nữa. Điều này có nghĩa là, trong khi tác vụ `Q` có lõi CPU, điều kiện cần thiết chưa được đáp ứng, nó không rời vòng lặp, và nó cố dùng *time slice* của mình để gần như không làm gì ngoài *polling* và kiểm tra xem điều kiện đã được đáp ứng chưa. Nó làm điều đó cho đến khi lõi CPU bị lấy lại. Nói cách khác, tác vụ `Q` chờ và *lãng phí* thời gian của mình cho đến khi lõi CPU được trao lại cho tác vụ `P` và tác vụ `P` giờ có thể in `A`.

Theo ngôn ngữ kỹ thuật, chúng ta nói rằng tác vụ `Q` đang ở trong một *busy-wait* cho đến khi một điều kiện cụ thể được đáp ứng. Nó giám sát (hay poll) một điều kiện liên tục trong một busy-wait cho đến khi nó trở thành true và sau đó nó thoát khỏi busy-wait. Dù bạn gọi nó là gì, tác vụ `Q` đang lãng phí thời gian quý giá của CPU mặc dù giải pháp trên giải quyết vấn đề của chúng ta một cách hoàn hảo.

> **Lưu ý**:
>
> Busy-waiting không phải là <a id="_idIndexMarker972"></a>một cách tiếp cận hiệu quả để chờ một sự kiện xảy ra, nhưng nó đơn giản. Vì bên trong một<a id="_idIndexMarker973"></a> busy-wait không có gì đặc biệt có thể được một tác vụ thực hiện, nó lãng phí hoàn toàn time slice được cấp. Busy-waits được tránh trong các lần chờ lâu. Thời gian CPU bị lãng phí đó có thể được trao cho một tác vụ khác để hoàn thành một phần công việc của nó. Tuy nhiên, trong một số hoàn cảnh mà thời gian chờ được kỳ vọng là ngắn, busy-waits được dùng.

Trong các chương trình C thật, và cả trong các ngôn ngữ <a id="_idIndexMarker974"></a>lập trình khác, *lock* thường được dùng để áp đặt một thứ tự nghiêm ngặt nào đó. Một lock đơn giản là một đối tượng, hay một biến, mà chúng ta dùng để chờ một điều kiện được đáp ứng hay một sự kiện xảy ra. Lưu ý rằng trong ví dụ trước, `Done` không phải là một lock mà là một flag.

Để hiểu thuật ngữ *lock*, chúng ta có thể nghĩ về nó như thể chúng ta đang cố có được (acquire) một lock trước khi thực thi instruction `2.2`. Chỉ một khi lock đã được acquire, bạn mới có thể tiếp tục và thoát khỏi vòng lặp. Bên trong vòng lặp, chúng ta đang chờ lock trở nên sẵn có. Chúng ta có thể có nhiều loại lock khác nhau, mà chúng tôi sẽ giải thích trong các phần sau.

Trong phần tiếp theo, chúng ta sẽ thực hiện kịch bản chờ đã thảo luận ở trên, nhưng lần này dùng một cách tiếp cận hiệu quả hơn không lãng phí thời gian của lõi CPU. Nó có nhiều tên, nhưng chúng ta có thể gọi nó là cơ chế *wait/notify* hay *sleep/notify*.

<a id="_idParaDest-197"></a>

### Cơ chế sleep/notify

Thay vì dùng một vòng lặp busy-wait như <a id="_idIndexMarker975"></a>đã thảo luận trong <a id="_idIndexMarker976"></a>phần trước, một kịch bản khác cũng có thể được tưởng tượng. Tác vụ `Q` có thể đi ngủ thay vì busy-waiting trên flag `Done` và tác vụ `P` có thể thông báo cho nó về sự thay đổi của flag khi nó làm cho flag thành `True`.

Nói cách khác, tác vụ `Q` đi ngủ ngay khi nó thấy flag không phải là `True` và để tác vụ `P` có được lõi CPU nhanh hơn và thực thi logic của mình. Đổi lại, tác vụ `P` sẽ đánh thức tác vụ `Q` sau khi sửa đổi flag thành `True`. Thực tế, cách <a id="_idIndexMarker977"></a>tiếp cận này là bản triển khai *de facto* trong hầu hết các hệ điều hành để tránh busy-waits và đưa các cơ chế kiểm soát vào cuộc một cách hiệu quả hơn.

Đoạn pseudo-code sau minh họa cách dùng cách tiếp cận này để viết lại giải pháp cho ví dụ được đưa ra trong phần trước:

```
Concurrent System {
  Task P {
      1.1. print 'A'
      1.2. Notify Task Q
  }
  Task Q {
      2.1. Go To Sleep Mode
      2.2. print 'B'
  }
}
```

*Code Box 14-10: Một giải pháp cho ví dụ 14.6 dùng sleep/notify*

Chúng ta sẽ cần điểm lại một số khái niệm mới trước khi có thể giải thích pseudo-code trên. Khái niệm đầu tiên là một tác vụ có thể *ngủ* (sleep) như thế nào. Chừng nào một tác vụ còn đang ngủ, nó sẽ không có phần CPU nào. Khi một tác vụ tự đặt mình vào chế độ ngủ, task scheduler sẽ biết điều này. Sau đó, task scheduler sẽ không cho tác vụ đang ngủ bất kỳ time slice nào.

Lợi ích của việc các tác vụ đi ngủ là gì? Các tác vụ đi ngủ sẽ không lãng phí thời gian của CPU bằng việc đi vào một busy-wait. Thay vì bắt đầu một busy-wait để poll một điều kiện, các tác vụ đi ngủ và được thông báo khi điều kiện đã được đáp ứng. Điều này sẽ tăng đáng kể hệ số *CPU utilization* (mức sử dụng CPU), và các tác vụ thực sự cần phần CPU sẽ có được nó.

Khi một tác vụ đi vào chế độ ngủ, phải có một cơ chế để đánh thức nó. Cơ chế này thường được thực hiện bằng việc *notify* (thông báo) hay *signal* (báo hiệu) cho tác vụ đang ngủ. Một tác vụ có thể được thông báo để rời chế độ ngủ, và ngay khi nó trở nên thức và được thông báo, task scheduler đặt nó trở lại hàng đợi và cho nó CPU lần nữa. Sau đó tác vụ sẽ tiếp tục thực thi ngay sau dòng đã đặt nó vào chế độ ngủ.

Trong code chúng ta đã viết, tác vụ `Q` đi vào chế độ ngủ ngay khi nó bắt đầu thực thi. Khi nó đi vào chế độ ngủ, nó sẽ không có phần CPU nào cho đến khi nó được thông báo và đánh thức<a id="_idIndexMarker979"></a> bởi tác vụ `P`. Tác vụ `P` thông báo cho tác vụ `Q` chỉ khi nó đã in `A`. Sau đó, tác vụ `Q` trở nên thức và nó có được CPU, và nó tiếp tục và in `B`.

Với phương pháp này không có busy-wait, và không có sự lãng phí thời gian của CPU. Lưu ý rằng việc đi vào chế độ ngủ và việc thông báo cho một tác vụ đang ngủ đều có các system call cụ thể và được hỗ trợ trong hầu hết các hệ điều hành, đặc biệt là các hệ điều hành POSIX-compliant.

Thoạt nhìn, có vẻ như giải pháp trên đã giải quyết vấn đề của chúng ta, và theo một cách hiệu quả – thực sự là vậy! Tuy nhiên, có một interleaving gây ra một vấn đề post-synchronization. Nó xảy ra khi bạn có thứ tự thực thi sau trong hệ thống trên:

```
1.1 print 'A'
1.2. Notify Task Q
2.1. Go To Sleep Mode
2.2. print 'B'
```

*Code Box 14-11: Một interleaving đưa hệ thống concurrent được trình bày trong Code Box 14-10 vào một tình huống semi-deadlock*

Trong interleaving trên, tác vụ `P` đã in `A`, và sau đó nó đã thông báo cho tác vụ `Q`, vốn chưa ngủ vì nó chưa có được CPU. Khi tác vụ `Q` có được CPU, nó đi vào chế độ ngủ ngay lập tức. Tuy nhiên, không có tác vụ nào khác đang chạy để thông báo cho nó. Do đó, tác vụ `Q` sẽ không có được CPU nữa đơn giản vì task scheduler không trao lõi CPU cho một tác vụ đang ngủ. Đây là ví dụ đầu tiên về việc dùng một kỹ thuật synchronization và quan sát hệ quả của nó dưới dạng một vấn đề post-synchronization.

Để giải quyết vấn đề này, chúng ta cần dùng lại một flag Boolean. Giờ, tác vụ `Q` nên kiểm tra flag trước khi đi ngủ. Đây là giải pháp cuối cùng của chúng ta:

```
Concurrent System {
  Shared State {
    Done : Boolean = False
  }
  Task P {
      1.1. print 'A'
      1.2. Done = True
      1.3. Notify Task Q
  }
  Task Q {
      2.1. While Not Done {
      2.2.     Go To Sleep Mode If Done is False (Atomic)
      2.3. }
      2.4. print 'B'
  }
}
```

*Code Box 14-12: Một giải pháp cải tiến cho ví dụ 14.6 dựa trên cách tiếp cận sleep/notify*

Như bạn thấy trong <a id="_idIndexMarker980"></a>pseudo-code trên, tác vụ `Q` ngủ nếu flag `Done` chưa được đặt thành `True`. Instruction `2.2` được đặt bên trong một vòng lặp chỉ đơn giản kiểm tra flag và đi ngủ chỉ khi `Done` là `False`. Một lưu ý quan trọng về instruction `2.2` là nó phải là một atomic instruction, nếu không giải pháp sẽ không hoàn chỉnh, và nó sẽ mắc phải cùng vấn đề.

> **Lưu ý**:
>
> Đối với những ai trong số các bạn có kinh nghiệm với các hệ thống concurrent, việc khai báo instruction này là atomic có thể có vẻ hơi bất ngờ. Lý do chính đằng sau điều này là thực tế rằng đối với ví dụ trên, một sự synchronization hữu hình thực sự chỉ xảy ra khi chúng ta định nghĩa một critical section rõ ràng và bảo vệ nó bằng một mutex. Khi chúng ta tiến lên, điều này trở nên rõ ràng hơn và sau khi đi qua thêm các chủ đề khái niệm, cuối cùng chúng ta có thể đưa ra một giải pháp hữu hình và thực sự.

Vòng lặp là cần thiết vì một tác vụ đang ngủ có thể được thông báo bởi bất cứ thứ gì trong hệ thống, không chỉ tác vụ `P`. Trong các hệ thống thật, hệ điều hành và các tác vụ khác có thể thông báo cho một tác vụ nhưng ở đây, chúng ta chỉ quan tâm đến các thông báo nhận được từ tác vụ `P`.

Do đó, khi tác vụ được thông báo và đánh thức, nó nên kiểm tra flag lần nữa và quay lại ngủ nếu flag chưa được đặt. Như chúng tôi đã giải thích trước đây, giải pháp này có vẻ hoạt động dựa trên các giải thích mà chúng tôi đã đưa ra cho đến giờ, nhưng nó không phải là một giải pháp hoàn chỉnh, vì nó cũng có thể gây ra một tình huống semi-deadlock trên một máy có nhiều lõi CPU. Chúng tôi giải thích thêm về điều này trong phần *Nhiều đơn vị xử lý (Multiple processor units)*.

> **Lưu ý**:
>
> Các giải pháp dựa trên cơ chế wait/notify thường được phát triển bằng condition variable. Condition variable cũng có cái tương ứng trong POSIX API, và chúng tôi sẽ trình bày chúng về mặt khái niệm trong một phần riêng, sẽ có ngay sau đây.

Mọi cơ chế synchronization đều có liên quan đến một kiểu chờ đợi nào đó. Đây là cách duy nhất bạn có thể giữ một số tác vụ được đồng bộ hóa. Vào một thời điểm nào đó, một số trong chúng nên chờ, và một số khác nên tiếp tục. Đây là lúc chúng ta cần giới thiệu *semaphore*; chúng là các công cụ chuẩn để làm cho một mẩu logic chờ hay tiếp tục trong một môi trường concurrent. Chúng ta tập trung vào điều này trong phần tiếp theo.

<a id="_idParaDest-198"></a>

### Semaphore và mutex

Đó là vào những năm 1960 khi<a id="_idIndexMarker982"></a> Edsger Dijkstra, một nhà khoa học máy tính<a id="_idIndexMarker983"></a> và nhà toán học người Hà Lan rất well-known, cùng với<a id="_idIndexMarker984"></a> nhóm của ông đã thiết kế<a id="_idIndexMarker985"></a> một hệ điều hành mới gọi là *THE Multiprogramming System* hay *THE OS* cho máy tính Electrologica X8, vốn có architecture độc nhất của riêng nó vào thời điểm đó.

Đó là chưa đầy 10 năm trước khi Bell Labs phát minh ra Unix, và sau đó là C. Họ đã dùng assembly để viết THE OS. THE OS là một hệ điều hành multitasking, và nó có một architecture multi-level. Mức cao nhất là người dùng, và mức thấp nhất là task scheduler. Theo thuật ngữ Unix, mức thấp nhất tương đương với việc có *task scheduler* và *process management unit* cùng nhau trong vòng kernel. Một trong những ý tưởng mà Dijkstra và nhóm của ông đã phát minh để vượt qua những khó khăn concurrency-related nhất định, và để chia sẻ các tài nguyên khác nhau giữa các tác vụ khác nhau, là khái niệm *semaphore*.

Semaphore đơn giản là các biến, hay đối tượng, được dùng để đồng bộ hóa việc truy cập vào một tài nguyên dùng chung. Chúng tôi sẽ giải thích chúng kỹ lưỡng trong phần này và giới thiệu một loại semaphore cụ thể, mutex, được dùng rộng rãi trong các chương trình concurrent và tồn tại trong gần như mọi ngôn ngữ lập trình ngày nay.

Khi một tác vụ sắp truy cập một tài nguyên dùng chung, có thể là một biến đơn giản hay một file dùng chung, tác vụ nên kiểm tra một semaphore được định nghĩa trước và xin phép để tiếp tục và truy cập tài nguyên dùng chung. Chúng ta có thể dùng một ví dụ tương tự để giải thích một semaphore và vai trò của nó.

Hãy tưởng tượng một bác sĩ, và một số bệnh nhân muốn được bác sĩ khám. Giả sử rằng không có cơ chế đặt lịch hẹn trước nào, và các bệnh nhân có thể đến gặp bác sĩ bất cứ khi nào họ muốn. Bác sĩ của chúng ta có một thư ký quản lý các bệnh nhân, giữ họ trong một hàng đợi, và cho phép họ vào phòng bác sĩ.

Chúng ta giả định rằng bác sĩ có thể khám nhiều bệnh nhân (tối đa một số lượng nhất định) cùng lúc, điều hơi khác thường dựa trên trải nghiệm hằng ngày của chúng ta, nhưng bạn có thể giả định rằng bác sĩ của chúng ta phi thường và có thể khám nhiều bệnh nhân cùng lúc; có lẽ nhiều bệnh nhân vui lòng ngồi cùng nhau trong một buổi khám. Trong một số trường hợp sử dụng thực tế, semaphore bảo vệ các tài nguyên có thể được dùng bởi nhiều người tiêu dùng. Vì vậy, xin hãy tạm chấp nhận giả định trên.

Bất cứ khi nào một bệnh nhân mới đến phòng khám của bác sĩ, họ nên đến gặp thư ký trước để được đăng ký. Thư ký có một danh sách chỉ đơn giản được viết trên một mảnh giấy, nơi họ sẽ viết tên của bệnh nhân mới. Giờ, bệnh nhân nên chờ thư ký gọi họ và cho phép họ vào phòng bác sĩ. Mặt khác, bất cứ khi nào một bệnh nhân rời phòng bác sĩ, thông tin này được chuyển tới thư ký, người sẽ xóa tên bệnh nhân khỏi danh sách.

Tại mỗi thời điểm, danh sách của thư ký phản ánh các bệnh nhân bên trong phòng bác sĩ và đang được khám cộng với những bệnh nhân đang chờ được khám. Khi một bệnh nhân rời phòng bác sĩ, một bệnh nhân mới đang chờ trong danh sách có thể vào phòng bác sĩ. Quá trình này tiếp diễn cho đến khi mọi bệnh nhân đều đã gặp bác sĩ.

Giờ, hãy ánh xạ nó sang một hệ thống máy tính concurrent để xem semaphore làm điều tương tự như người thư ký trong phép so sánh của chúng ta như thế nào.

Trong ví dụ, bác sĩ là một tài nguyên dùng chung. Bác sĩ có thể được truy cập bởi một số bệnh nhân, vốn tương tự các tác vụ muốn truy cập tài nguyên dùng chung. Thư ký là một semaphore. Giống như người thư ký có một danh sách, mỗi semaphore có một hàng đợi các tác vụ đang chờ để có được quyền truy cập vào tài nguyên dùng chung. Phòng bác sĩ có thể <a id="_idIndexMarker988"></a>được coi là một *critical section*.

Một critical section đơn giản là một tập instruction được bảo vệ bởi một semaphore. Các tác vụ không thể đi vào nó mà không chờ phía sau một semaphore. Mặt khác, nhiệm vụ của semaphore là bảo vệ critical section. Bất cứ khi nào một tác vụ cố đi vào một critical section, nó nên cho một semaphore cụ thể biết về điều đó.

Tương tự, khi một tác vụ xong việc và muốn thoát khỏi critical section, nó nên cho cùng semaphore đó biết. Như bạn có thể thấy, có một sự tương ứng rất tốt giữa ví dụ bác sĩ của chúng ta và các semaphore. Hãy tiếp tục với một ví dụ mang tính lập trình hơn và cố gắng tìm các semaphore và các yếu tố khác trong đó.

> **Lưu ý**:
>
> Critical section nên thỏa mãn một số điều kiện nhất định. Những điều kiện này sẽ được giải thích khi chúng ta tiến qua chương.

Ví dụ sau, *ví dụ 14.7*, được thể hiện trong *Code Box 14-13*, một lần nữa là về hai tác vụ cố<a id="_idIndexMarker990"></a> tăng một bộ đếm dùng chung. Chúng ta đã thảo luận ví dụ này trong các phần trước<a id="_idIndexMarker991"></a> ở nhiều chỗ, nhưng lần này, chúng ta sẽ đưa ra một giải pháp dựa trên semaphore:

```
Concurrent System {
  Shared State {
    S : Semaphore which allows only 1 task at a time
    Counter: Integer = 0
  }
  Task P {
    A : Local Integer
      1.1. EnterCriticalSection(S)
      1.2. A = Counter
      1.3. A = A + 1
      1.4. Counter = A
      1.5. LeaveCriticalSection(S)
  }
  Task Q {
    B : Local Integer
      2.1. EnterCriticalSection(S)
      2.2. B = Counter
      2.3. B = B + 2
      2.4. Counter = B
      2.5. LeaveCriticalSection(S)
  }
}
```

*Code Box 14-13: Dùng semaphore để đồng bộ hóa hai tác vụ*

Trong hệ thống trên, chúng ta có hai shared state khác nhau: một semaphore dùng chung `S` được dự định bảo vệ việc truy cập vào một biến dùng chung khác `Counter`. `S` chỉ cho phép một tác vụ tại một thời điểm đi vào một critical section được nó bảo vệ. Các critical section là các instruction được bao bởi các instruction `EnterCriticalSection(S)` và `LeaveCriticalSection(S)`, và như bạn có thể thấy, mỗi tác vụ có một critical section khác nhau được bảo vệ bởi `S`.

Để đi vào một<a id="_idIndexMarker992"></a> critical section, một tác vụ nên thực thi instruction `EnterCriticalSection(S)`. Nếu một tác vụ khác đã ở trong critical section của riêng nó, instruction `EnterCriticalSection(S)` trở thành blocking và không kết thúc, và vì vậy tác vụ hiện tại nên chờ cho đến khi semaphore cho phép nó đi qua và vào critical section của mình.

Instruction `EnterCriticalSection(S)` có thể có các cách triển khai khác nhau tùy theo kịch bản. Nó có thể đơn giản là một busy-wait, hoặc nó có thể chỉ làm cho tác vụ đang chờ đi vào chế độ ngủ. Cách tiếp cận sau phổ biến hơn, và các tác vụ đang chờ critical section của chúng thường đi ngủ.

Trong ví dụ trên, semaphore `S` được dùng theo cách mà chỉ một tác vụ có thể đi vào critical section của nó. Nhưng semaphore tổng quát hơn, và chúng có thể cho phép nhiều hơn một tác vụ (tối đa một số lượng nhất định được định nghĩa khi tạo semaphore) đi vào critical section của chúng. Một semaphore chỉ cho phép một tác vụ đi vào critical section tại một thời điểm thường <a id="_idIndexMarker993"></a>được gọi là một *binary semaphore* hay một *mutex*. Mutex phổ biến hơn semaphore rất nhiều, và bạn sẽ luôn thấy chúng trong code concurrent. POSIX API phơi ra cả semaphore lẫn mutex, và bạn có thể dùng chúng tùy theo tình huống.

Thuật ngữ **mutex** là viết tắt của **mutual exclusion** (loại trừ lẫn nhau). Giả sử rằng <a id="_idIndexMarker994"></a>chúng ta có hai tác vụ và mỗi tác vụ có một critical section truy cập cùng một tài nguyên dùng chung. Để có một giải pháp dựa trên mutual exclusion không có race condition, các điều kiện sau nên được đáp ứng đối với các tác vụ:

- Chỉ một trong số chúng có thể đi vào critical section tại bất kỳ thời điểm nào, và tác vụ kia nên chờ cho đến khi tác vụ trước rời critical section.
- Giải pháp nên không có deadlock. Một tác vụ đang chờ phía sau một critical section nên có thể đi vào<a id="_idIndexMarker995"></a> nó rốt cuộc. Trong một số trường hợp, một giới hạn trên cho thời gian chờ (*contention time*) được giả định.
- Tác vụ trong <a id="_idIndexMarker996"></a>critical section không thể bị kéo ra bởi *preemption* để cho tác vụ kia đi vào critical section. Nói cách khác, giải pháp nên *không có preemption* và *hợp tác*.

Mutex tồn tại để<a id="_idIndexMarker997"></a> cho phép phát triển những giải pháp dựa trên mutual exclusion như vậy. Lưu ý rằng các critical section cũng nên tuân theo các điều kiện tương tự. Chúng nên chỉ cho phép một tác vụ bên trong, và chúng nên không có deadlock. Lưu ý rằng các semaphore cũng thỏa mãn hai điều kiện cuối, nhưng chúng có thể cho phép nhiều hơn một tác vụ đi vào critical section của chúng tại một thời điểm.

Chúng ta có thể nói rằng mutual exclusion là khái niệm quan trọng nhất trong concurrency và là một yếu tố chủ đạo trong nhiều cơ chế kiểm soát mà chúng ta có trong tay. Nói cách khác, trong mọi kỹ thuật synchronization mà bạn có thể biết, bạn sẽ thấy dấu vết của mutual exclusion thông qua việc dùng semaphore và mutex (nhưng chủ yếu là mutex).

Semaphore và<a id="_idIndexMarker998"></a> mutex được gọi là các đối tượng *lockable* (có thể khóa). Theo một hệ thuật ngữ khác nhưng chính thức hơn, hành động chờ một semaphore và đi vào critical section <a id="_idIndexMarker1000"></a>giống như *locking* (khóa) semaphore. Tương tự, hành động rời một critical section và cập nhật semaphore<a id="_idIndexMarker1001"></a> giống như *unlocking* (mở khóa) semaphore.

Do đó, locking<a id="_idIndexMarker1002"></a> và unlocking các semaphore có thể được coi là hai thuật toán lần lượt được dùng để chờ và có được quyền truy cập vào critical section và để giải phóng critical section. Ví dụ, <a id="_idIndexMarker1003"></a>*spin locking* là có được quyền truy cập vào một critical section bằng cách busy-waiting trên một semaphore, và chắc chắn, chúng ta cũng có thể có các loại thuật toán locking và unlocking khác. Chúng tôi sẽ giải thích các thuật toán locking khác nhau này khi chúng ta phát triển các chương trình concurrent dùng POSIX API trong *Chương 16*, *Thread Synchronization*.

Nếu chúng ta viết giải pháp trên dựa trên thuật ngữ locking và unlocking, nó sẽ như sau:

```
Concurrent System {
  Shared State {
    S : Semaphore which allows only 1 task at a time
    Counter: Integer = 0
  }
  Task P {
    A : Local Integer
      1.1. Lock(S)
      1.2. A = Counter
      1.3. A = A + 1
      1.4. Counter = A
      1.5. Unlock(S)
  }
  Task Q {
    B : Local Integer
      2.1. Lock(S)
      2.2. B = Counter
      2.3. B = B + 2
      2.4. Counter = B
      2.5. Unlock(S)
  }
}
```

*Code Box 14-14: Dùng các thao tác lock và unlock để làm việc với semaphore*

Từ giờ trở đi, chúng ta sẽ dùng thuật ngữ locking và unlocking trong các đoạn pseudo-code của mình, và thuật ngữ này cũng đã được dùng trong suốt POSIX API.

Chúng ta sẽ kết thúc phần này bằng việc đưa ra định nghĩa cuối cùng. Khi một số tác vụ muốn đi vào một critical section, chúng đang cố lock một semaphore, nhưng chỉ một số lượng nhất định<a id="_idIndexMarker1004"></a> trong số chúng (tùy thuộc vào semaphore) có thể có được lock và đi vào critical section. Các tác vụ khác sẽ chờ để có được lock. Hành động chờ để có được một lock trên một semaphore <a id="_idIndexMarker1005"></a>được gọi là *contention* (tranh chấp). Nhiều tác vụ hơn tạo ra nhiều contention hơn, và contention time là thước đo việc thực thi của các tác vụ bị làm chậm đi bao nhiêu.

Hiển nhiên, các tác vụ trong contention<a id="_idIndexMarker1006"></a> cần một khoảng thời gian để có được lock, và chúng ta có càng nhiều tác vụ, chúng càng phải chờ lâu hơn để đi vào critical section của mình. Lượng thời gian mà một tác vụ chờ trong trạng thái contention thường được gọi là *contention time*. Contention<a id="_idIndexMarker1007"></a> time có thể là một yêu cầu non-functional cho một hệ thống concurrent cần được giám sát cẩn thận để ngăn bất kỳ sự suy giảm hiệu năng nào.

Chúng ta có thể kết luận rằng mutex là công cụ chính của chúng ta để đồng bộ hóa một số tác vụ concurrent. Chúng ta cũng có mutex trong POSIX threading API và gần như mọi ngôn ngữ lập trình hỗ trợ concurrency. Ngoài<a id="_idIndexMarker1008"></a> mutex, *condition variable* cũng đóng một vai trò quan trọng khi chúng ta cần chờ trong một khoảng thời gian không xác định để thỏa mãn một điều kiện nhất định.

Chúng ta sẽ thảo luận về condition variable, nhưng trước đó, chúng ta cần nói về memory barrier và các môi trường concurrent có nhiều đơn vị xử lý, hoặc nhiều CPU hoặc một CPU có nhiều lõi. Do đó, phần tiếp theo dành cho chủ đề này.

<a id="_idParaDest-199"></a>

### Nhiều đơn vị xử lý (Multiple processor units)

Khi bạn chỉ có một <a id="_idIndexMarker1009"></a>đơn vị xử lý trong hệ thống máy tính<a id="_idIndexMarker1010"></a> của mình, một CPU chỉ có một lõi, các tác vụ cố truy cập một address cụ thể trong main memory luôn đọc được giá trị mới nhất và tươi nhất ngay cả khi address đó được cache trong lõi CPU. Việc cache giá trị của một số memory address nhất định bên trong lõi CPU như một phần của *local cache* của nó và thậm chí giữ các thay đổi được thực hiện đối với những address đó bên trong cache là một thực hành phổ biến. Điều này sẽ tăng hiệu năng bằng cách giảm số thao tác đọc và ghi trên main memory. Vào những sự kiện nhất định, lõi CPU sẽ lan truyền các thay đổi trong local cache của nó trở lại main memory để giữ cache và main memory được đồng bộ.

Những local cache này vẫn tồn tại khi bạn có nhiều hơn một đơn vị xử lý. Với nhiều đơn vị xử lý, chúng tôi muốn nói hoặc một CPU có nhiều hơn một lõi hoặc nhiều CPU với số lõi bất kỳ. Lưu ý rằng mỗi lõi CPU có local cache riêng của nó.

Do đó, khi hai tác vụ khác nhau được thực thi trên hai lõi CPU khác nhau, làm việc trên cùng một address trong main memory, mỗi lõi CPU đã cache giá trị của cùng memory address đó trong local cache riêng của nó. Điều này có nghĩa là nếu một trong số chúng cố ghi vào memory address dùng chung, các thay đổi chỉ được áp dụng cho local cache của nó, chứ không áp dụng cho main memory và local cache của lõi CPU kia.

Làm như vậy dẫn đến nhiều vấn đề khác nhau vì khi tác vụ chạy trên lõi CPU kia cố đọc giá trị mới nhất từ memory address dùng chung, nó không thể thấy các thay đổi mới nhất vì nó sẽ đọc từ local cache của mình, vốn không có các thay đổi mới nhất.

Vấn đề này, vốn <a id="_idIndexMarker1012"></a>đến từ việc có một local cache khác nhau cho mỗi lõi CPU, được giải quyết bằng việc đưa vào một *memory coherence protocol* giữa các lõi CPU. Do đó, bằng việc tuân theo một coherence protocol, mọi tác vụ chạy trên các lõi CPU khác nhau sẽ thấy cùng một giá trị trong local cache của chúng khi giá trị bị thay đổi ở một trong các lõi CPU. Nói cách khác, chúng ta nói rằng memory address hiển thị với mọi bộ xử lý khác. Tuân theo một memory coherence protocol mang lại *memory visibility* cho mọi tác vụ chạy trên các đơn vị xử lý khác nhau. Cache coherence và memory visibility là hai yếu tố quan trọng nên được xem xét trong các hệ thống concurrent chạy trên nhiều hơn một đơn vị xử lý.

Hãy quay lại giải pháp sleep-notify-based đầu tiên của chúng ta cho *ví dụ 14.6* đã được giải thích trong hai phần trước. Invariant constraint cho *ví dụ 14.6* là **có A trước và sau đó B trong output**.

Đoạn pseudo-code sau là giải pháp cuối cùng của chúng ta, và chúng ta đã dùng cơ chế sleep/notify để áp đặt thứ tự mong muốn giữa các instruction `print`. Chúng tôi đã nói rằng giải pháp này không bug-free và có thể gây ra các vấn đề post-synchronization. Trong đoạn sau, chúng tôi sẽ giải thích vấn đề xuất hiện như thế nào:

```
Concurrent System {
  Shared State {
    Done : Boolean = False
  }
  Task P {
      1.1. print 'A'
      1.2. Done = True
      1.3. Notify Task Q
  }
  Task Q {
      2.1. While Not Done {
      2.2.     Go To Sleep Mode If Done is False (Atomic)
      2.3. }
      2.4. print 'B'
  }
}
```

*Code Box 14-15: Giải pháp được đề xuất cho ví dụ 14.6 dựa trên kỹ thuật sleep/notify*

Giả sử rằng các tác vụ `P` và `Q` đang chạy trên các lõi CPU khác nhau. Trong trường hợp này, mỗi lõi CPU có một mục cho biến dùng chung `Done` trong local cache của nó. Lưu ý rằng, một lần nữa, chúng ta đã khai báo instruction `2.2` là atomic, và lưu ý rằng đây là một giả định thiết yếu cho đến khi chúng ta nghĩ ra một giải pháp mutex-based phù hợp để giải quyết điều này. Giả sử một interleaving trong <a id="_idIndexMarker1013"></a>đó tác vụ `P` thực thi instruction `1.2` và thông báo cho tác vụ `Q`, vốn có thể đang ngủ. Do đó, tác vụ `P` cập nhật giá trị của `Done` trong local cache của nó, nhưng điều đó không có nghĩa là nó ghi nó trở lại main memory hay nó cập nhật local cache của lõi CPU kia.

Như đã nói, không có gì bảo đảm rằng chúng ta sẽ thấy một thay đổi trong main memory và local cache của tác vụ `Q`. Do đó, có khả năng khi tác vụ `Q` có được CPU và đọc local cache của mình, nó thấy rằng `Done` có giá trị `False` và đi vào chế độ ngủ trong khi tác vụ `P` đã kết thúc và đã gửi tín hiệu thông báo của nó từ một lúc trước, và không còn tín hiệu thông báo nào nữa sẽ được tác vụ `P` phát ra. Rốt cuộc, tác vụ `Q` đi ngủ mãi mãi và một tình huống semi-deadlock xảy ra.

Để giải quyết vấn đề này, người ta cần dùng memory barrier hay memory fence. Chúng là các instruction hoạt động như một rào chắn và khi thực thi (đi qua) chúng, mọi giá trị được cập nhật chỉ trong một local cache đều được lan truyền vào main memory và các local cache khác. Chúng trở nên hiển thị với mọi tác vụ đang thực thi trên các lõi CPU khác. Nói cách khác, memory barrier đồng bộ hóa local cache của mọi lõi CPU và main memory.

Cuối cùng, chúng ta có thể<a id="_idIndexMarker1014"></a> đề xuất giải pháp hoàn chỉnh như sau. Lưu ý rằng, một lần nữa, chúng ta đã khai báo instruction `2.3` là atomic, và lưu ý rằng đây là một giả định thiết yếu cho đến khi chúng ta nghĩ ra một giải pháp mutex-based phù hợp để giải quyết điều này:

```
Concurrent System {
  Shared State {
      Done : Boolean = False
  }
  Task P {
      1.1. print 'A'
      1.2. Done = True
      1.3. Memory Barrier
      1.4. Notify Task Q
  }
  Task Q {
      2.1. Do {
      2.2.     Memory Barrier
      2.3.     Go To Sleep Mode If Done is False (Atomic)
      2.4. } While Not Done
      2.5. print 'B'
  }
}
```

*Code Box 14-16: Cải tiến giải pháp được đề xuất cho ví dụ 14.6 bằng memory barrier*

Bằng việc dùng memory barrier trong pseudo-code trên, chúng ta chắc chắn rằng mọi cập nhật đối với biến dùng chung `Done` đều có thể được tác vụ `Q` thấy. Sẽ là một ý hay nếu bạn đi qua các interleaving khả dĩ khác nhau và tự mình thấy memory barrier giúp làm cho biến dùng chung `Done` hiển thị với tác vụ `Q` và ngăn bất kỳ tình huống semi-deadlock không mong muốn nào như thế nào.

Lưu ý rằng việc tạo một tác vụ, lock một semaphore và unlock một semaphore là ba thao tác hoạt động như memory barrier và đồng bộ hóa local cache của mọi lõi CPU và main memory, và lan truyền các thay đổi gần đây được thực hiện đối với các shared state.

Đoạn pseudo-code sau giống với giải pháp trên nhưng lần này dùng mutex. Trong giải pháp sau, chúng ta sẽ dùng một mutex và cuối cùng giải quyết vấn đề đã khiến chúng ta khai báo instruction `Go To Sleep Mode If Done` is `False` là atomic. Tuy nhiên hãy lưu ý rằng mutex là semaphore chỉ cho phép một tác vụ ở trong critical section tại mỗi thời điểm và, giống như semaphore, việc lock và unlock mutex có thể hoạt động như một memory barrier:

```
Concurrent System {
  Shared State {
      Done : Boolean = False
      M : Mutex
  }
  Task P {
      1.1. print 'A'
      1.2. Lock(M)
      1.3. Done = True
      1.4. Unlock(M)
      1.5. Notify Task Q
  }
  Task Q {
      2.1. Lock(M)
      2.2. While Not Done {
      2.3.     Go To Sleep Mode And Unlock(M) (Atomic)
      2.4.     Lock(M)
      2.5. }
      2.6. Unlock(M)
      2.7. print 'B'
  }
}
```

*Code Box 14-17: Cải tiến giải pháp được đề xuất cho ví dụ 14.6 bằng một mutex*

Các instruction `Lock(M)` và `Unlock(M)` hoạt động như memory barrier nên bảo đảm memory visibility trong mọi tác vụ. Để nhắc lại, các instruction giữa `Lock(M)` và `Unlock(M)` được coi là các critical section trong mỗi tác vụ.

Lưu ý rằng khi một tác vụ lock một mutex (hay semaphore), có ba trường hợp mà mutex được unlock tự động:

- Tác vụ dùng lệnh `Unlock` để unlock một mutex.

- Khi một tác vụ kết thúc, mọi mutex đã lock đều trở nên unlocked.

- Khi một tác vụ đi vào chế độ ngủ, các mutex đã lock trở nên unlocked.

  > **Lưu ý**:
  >
  > Gạch đầu dòng thứ ba trong danh sách trên nói chung không đúng. Nếu một tác vụ muốn ngủ trong một khoảng thời gian nhất định bên trong một critical section được một mutex bảo vệ, chắc chắn là có thể ngủ mà không cần unlock mutex. Đó là lý do tại sao chúng ta đã khai báo instruction `2.3` là atomic và chúng ta đã thêm `Unlock(M)` vào nó. Để hiểu đầy đủ những kịch bản như vậy, chúng ta cần đề cập đến *condition variable*, sẽ có ngay trong các phần sắp tới.

Do đó, khi instruction `2.3` được thực thi như một atomic instruction, mutex `M` đã lock trở nên unlocked. Khi tác vụ được thông báo lần nữa, nó sẽ có lại lock bằng instruction `2.4`, và sau đó nó có thể tiến vào critical section của mình lần nữa.

Lưu ý cuối cùng trong phần này, khi một tác vụ đã lock một mutex, nó không thể lock nó lần nữa, và việc cố lock nó thêm thường dẫn đến một tình huống deadlock. Chỉ một *recursive mutex* mới có thể được lock nhiều lần bởi một tác vụ duy nhất. Lưu ý rằng trong khi một recursive mutex bị lock (bất kể bao nhiêu lần), mọi tác vụ khác sẽ bị chặn khi cố lock nó. Các thao tác lock và unlock<a id="_idIndexMarker1016"></a> luôn đi theo cặp, do đó nếu một tác vụ đã lock một recursive mutex hai lần, nó cũng nên unlock nó hai lần.

Cho đến giờ, chúng ta đã thảo luận và dùng kỹ thuật sleep/notify trong một số ví dụ. Bạn sẽ chỉ hiểu đầy đủ kỹ thuật sleep/notify khi bạn được giới thiệu một khái niệm mới: condition variable. Condition variable cùng với mutex đã xây dựng một nền tảng cho việc triển khai các kỹ thuật kiểm soát, vốn đồng bộ hóa hiệu quả nhiều tác vụ trên một tài nguyên dùng chung duy nhất. Nhưng trước đó, hãy nói về một giải pháp khả dĩ khác cho *ví dụ 14.6*.

<a id="_idParaDest-200"></a>

## Spin lock

Trước khi bắt đầu nói về<a id="_idIndexMarker1017"></a> condition variable và cách thực sự mà kỹ thuật sleep/notify nên được triển khai, hãy lùi lại một chút và dùng busy-waiting cùng với mutex để viết một giải pháp mới cho *ví dụ 14.6*. Để nhắc lại, ví dụ là về **có A trước và sau đó B được in ra standard output**.

Sau đây là giải pháp được đề xuất dùng một mutex được trang bị thuật toán spin locking. Mutex hoạt động như một memory barrier, nên chúng ta sẽ không có vấn đề memory visibility nào, và nó đồng bộ hóa hiệu quả các tác vụ `P` và `Q` trên flag dùng chung `Done`:

```
Concurrent System {
  Shared State {
      Done : Boolean = False
      M : Mutex
  }
  Task P {
      1.1. print 'A'
      1.2. SpinLock(M)
      1.2. Done = True
      1.3. SpinUnlock(M)
  }
  Task Q {
      2.1  SpinLock(M)
      2.2. While Not Done {
      2.3.   SpinUnlock(M)
      2.4.   SpinLock(M)
      2.5. }
      2.6. SpinUnlock(M)
      2.4. print 'B'
  }
}
```

*Code Box 14-18: Giải pháp cho ví dụ 14.6 dùng một mutex và các thuật toán spin locking*

Đoạn pseudo-code trên là giải pháp đầu tiên có thể được viết thành code C hợp lệ dùng POSIX threading API. Không pseudo-code nào được đưa ra trước đây có thể được viết thành chương trình thật vì hoặc chúng quá trừu tượng để được triển khai hoặc chúng gây vấn đề trong một số kịch bản nhất định, như khi được chạy trong một hệ thống có nhiều đơn vị xử lý. Nhưng pseudo-code trên có thể được dịch sang bất kỳ ngôn ngữ lập trình nào hỗ trợ concurrency.

Trong code trên, chúng ta đang<a id="_idIndexMarker1018"></a> dùng *spinlock*, vốn đơn giản là các thuật toán busy-waiting. Bất cứ khi nào bạn lock một spinlock mutex, nó đi vào một vòng lặp busy-wait cho đến khi mutex trở nên sẵn có và sau đó nó tiếp tục.

Tôi nghĩ mọi thứ trong pseudo-code trên đều dễ theo dõi, ngoại trừ các instruction `2.3` và `2.4`, vốn là các instruction lock và unlock liên tiếp kỳ lạ bên trong một vòng lặp! Thực ra, đây là phần đẹp nhất của code. Một chuỗi việc lock và unlock spinlock mutex `M` đang diễn ra trong khi tác vụ `Q` có được lõi CPU.

Điều gì xảy ra nếu chúng ta không có các instruction `2.3` và `2.4`? Khi đó lock tại instruction `2.1` sẽ giữ mutex bị lock cho đến instruction `2.6`, nghĩa là tác vụ `P` không bao giờ có cơ hội truy cập flag dùng chung `Done`. Những instruction lock và unlock đó cho phép tác vụ `P` có cơ hội và cập nhật flag `Done` qua instruction `1.2`. Nếu không, mutex sẽ bị tác vụ `Q` giữ mọi lúc và tác vụ `P` không bao giờ có thể tiến tới instruction `1.2`. Nói cách khác, hệ thống đi vào một tình huống semi-deadlock. Đoạn pseudo-code minh họa một sự hài hòa đẹp đẽ của các thao tác lock/unlock, giải quyết gọn gàng vấn đề của chúng ta bằng spinlock.

Lưu ý rằng trong các hệ thống high-performance mà việc đặt một tác vụ vào chế độ ngủ rất tốn kém so với tốc độ các sự kiện xảy ra trong hệ thống, spin lock rất phổ biến. Khi dùng spin lock, các tác vụ nên được viết theo cách mà chúng có thể unlock một mutex càng sớm càng tốt. Để điều này xảy ra, các critical section nên đủ nhỏ. Như bạn có thể thấy trong code của chúng ta, chúng ta có một critical section chỉ với một phép kiểm tra Boolean (điều kiện của vòng lặp).

Trong phần tiếp theo, chúng ta khám phá condition variable và các thuộc tính của chúng.

<a id="_idParaDest-201"></a>

### Condition variable

Các giải pháp mà chúng tôi đã đưa ra trong<a id="_idIndexMarker1020"></a> các phần trước để thỏa mãn *ví dụ 14.6* không thể được triển khai bằng một ngôn ngữ lập trình vì chúng ta không biết làm thế nào để đặt một tác vụ vào chế độ ngủ và làm thế nào để thông báo cho một tác vụ khác bằng lập trình. Trong phần này, chúng tôi sẽ giới thiệu condition variable, một khái niệm mới có thể giúp chúng ta làm cho một tác vụ chờ và được thông báo tương ứng.

Condition variable là các biến (hay đối tượng) đơn giản có thể được dùng để đặt một tác vụ vào chế độ ngủ hay thông báo cho các tác vụ đang ngủ khác và đánh thức chúng. Lưu ý rằng chế độ ngủ được thảo luận ở đây khác với việc ngủ trong một số giây hay mili giây để tạo độ trễ, và nó đặc biệt có nghĩa là tác vụ không muốn nhận thêm phần CPU nào nữa. Giống như mutex được dùng để bảo vệ một critical section, condition variable được dùng để cho phép *signaling* (báo hiệu) giữa các tác vụ khác nhau.

Một lần nữa, giống như mutex có các thao tác *lock* và *unlock* gắn liền, condition variable có các thao tác *sleep* và *notify*. Tuy nhiên, mỗi ngôn ngữ lập trình có thuật ngữ riêng ở đây, và trong một số ngôn ngữ bạn có thể thấy *wait* và *signal* thay cho sleep và notify, nhưng logic đằng sau chúng vẫn như nhau.

Một condition variable phải được dùng cùng với <a id="_idIndexMarker1021"></a>một mutex. Có một giải pháp dùng condition variable mà không có mutex đơn giản là thiếu thuộc tính *mutual exclusion*. Hãy nhớ rằng một condition variable phải được chia sẻ giữa nhiều tác vụ để có ích và, như một tài nguyên dùng chung, chúng ta cần truy cập được đồng bộ hóa vào nó. Điều này thường đạt được bằng một mutex canh giữ các critical section. Đoạn pseudo-code sau cho thấy cách chúng ta có thể dùng condition variable và mutex để chờ một điều kiện nhất định, hay một sự kiện nói chung, và cụ thể là chờ flag dùng chung `Done` trở thành `True` trong *ví dụ 14.6*:

```
Concurrent System {
  Shared State {
      Done : Boolean = False
      CV   : Condition Variable
      M    : Mutex
  }
  Task P {
        1.1. print 'A'
        1.2. Lock(M)
        1.3. Done = True
        1.4. Notify(CV)
        1.5. Unlock(M)
  }
  Task Q {
        2.1. Lock(M)
        2.2. While Not Done {
        2.3.     Sleep(M, CV)
        2.4. }
        2.5. Unlock(M)
        2.6. print 'B'
  }
}
```

*Code Box 14-19: Giải pháp cho ví dụ 14.6 dùng một condition variable*

Giải pháp trên là cách đúng đắn nhất để dùng condition variable nhằm triển khai thứ tự nghiêm ngặt giữa hai instruction trong một hệ thống concurrent. Các instruction `1.4` và `2.3` đang dùng condition variable `CV`. Như bạn có thể thấy, thao tác `Sleep` cần biết về cả mutex `M` lẫn condition variable `CV` vì nó cần unlock `M` khi tác vụ `Q` sắp đi ngủ và có lại lock trên `M` khi nó đã được thông báo.

Lưu ý rằng khi tác vụ `Q` được thông báo, nó tiếp tục logic của mình bên trong thao tác `Sleep`, và việc lock `M` lần nữa là một phần của điều đó. Instruction `1.4` cũng chỉ hoạt động khi bạn đã có được lock trên `M`, nếu không race condition sẽ xảy ra. Sẽ là một thử thách tốt và có lợi nếu đi qua các interleaving khả dĩ và xem mutex và condition variable trên sẽ áp đặt thứ tự mong muốn giữa các instruction `1.1` và `2.6` mọi lúc như thế nào.

Là một định nghĩa cuối cùng trong phần này, một đối tượng mutex cùng với một condition variable thường được gọi là một đối tượng *monitor*. Chúng ta<a id="_idIndexMarker1023"></a> cũng có một design pattern concurrency-related gọi là *monitor object*, là về việc dùng kỹ thuật trên để sắp xếp lại các instruction trong một số tác vụ concurrent.

Trong các phần trước<a id="_idIndexMarker1024"></a>, chúng tôi đã cho thấy semaphore, mutex và condition variable cùng với các thuật toán lock, unlock, sleep và notify có thể được dùng như thế nào để triển khai các cơ chế kiểm soát được dùng để áp đặt một thứ tự nghiêm ngặt giữa một số instruction trong các tác vụ concurrent khác nhau và để bảo vệ các critical section. Những khái niệm này sẽ được dùng trong các chương sắp tới để viết các chương trình multithreaded và multi-process bằng C. Phần tiếp theo sẽ nói về hỗ trợ concurrency trong chuẩn POSIX đã được triển khai và cung cấp bởi nhiều hệ điều hành Unix-like.

<a id="_idParaDest-202"></a>

## Concurrency trong POSIX

Như chúng tôi đã giải thích trong các <a id="_idIndexMarker1025"></a>phần trước, concurrency hay multitasking là một chức năng<a id="_idIndexMarker1026"></a> do kernel của một hệ điều hành cung cấp. Không phải mọi kernel đều concurrent ngay từ khi ra đời, nhưng hầu hết chúng đều hỗ trợ concurrency ngày nay. Thật thú vị khi biết rằng phiên bản đầu tiên của Unix không concurrent, nhưng nó đã có được tính năng này rất sớm sau khi ra đời.

Nếu bạn còn nhớ *Chương 10*, *Unix – Lịch sử và Architecture*, chúng tôi đã giải thích single Unix specification và POSIX đã cố gắng chuẩn hóa API được phơi ra bởi vòng shell trong một hệ điều hành Unix-like như thế nào. Concurrency đã là một phần của những chuẩn này từ lâu, và cho đến nay, nó đã cho phép nhiều developer viết các chương trình concurrent cho các hệ điều hành POSIX-compliant. Hỗ trợ concurrency trong POSIX đã được dùng rộng rãi và được triển khai trong một phạm vi rộng lớn các hệ điều hành, như Linux và macOS.

Concurrency trong một hệ điều hành POSIX-compliant nói chung được cung cấp theo hai cách. Bạn có thể hoặc có một chương trình concurrent <a id="_idIndexMarker1027"></a>thực thi dưới dạng một số process khác nhau, được gọi là *multi-processing*, hoặc bạn <a id="_idIndexMarker1028"></a>có thể có chương trình concurrent của mình chạy dưới dạng một số thread khác nhau như một phần của cùng một process, được gọi là *multithreading*. Trong phần này, chúng ta sẽ nói về hai phương pháp này và so sánh chúng từ góc nhìn của một lập trình viên. Nhưng trước đó, chúng ta cần biết thêm về phần bên trong của một kernel hỗ trợ concurrency. Phần tiếp theo giải thích ngắn gọn những gì bạn sẽ tìm thấy trong một kernel như vậy.

<a id="_idParaDest-203"></a>

### Các kernel hỗ trợ concurrency

Gần như mọi kernel đang <a id="_idIndexMarker1029"></a>được phát triển và bảo trì ngày nay đều là multitasking. Như chúng ta đã biết, mỗi kernel có một *task scheduler unit* chia sẻ các lõi CPU giữa nhiều process và thread đang chạy, vốn được gọi chung là tác vụ trong chương này và chương trước.

Trước khi có thể tiếp tục, chúng ta cần mô tả process và thread và những khác biệt của chúng đối với concurrency. Bất cứ khi nào bạn chạy một chương trình, một process mới được tạo ra, và logic của chương trình được chạy bên trong process đó. Các process được cô lập với nhau, và một process không thể truy cập phần bên trong của một process khác, như memory của nó.

Thread rất giống process, nhưng chúng là local đối với một process nhất định. Chúng được dùng để đưa concurrency vào một process duy nhất thông qua việc có nhiều thread thực thi cùng nhau thực thi nhiều chuỗi instruction theo một cách concurrent. Một thread duy nhất không thể được chia sẻ giữa hai process, và nó là local và gắn với process sở hữu nó. Mọi thread trong một process đều có thể truy cập memory của process sở hữu như một tài nguyên dùng chung, trong khi mỗi thread có vùng Stack riêng mà dĩ nhiên có thể được các thread khác trong cùng process truy cập. Ngoài ra, cả process lẫn thread đều có thể dùng phần CPU, và task scheduler trong hầu hết các kernel dùng cùng một thuật toán *scheduling* để chia sẻ các lõi CPU giữa chúng.

Lưu ý rằng khi nói ở mức kernel, chúng ta thích<a id="_idIndexMarker1030"></a> dùng thuật ngữ *task* thay cho các thuật ngữ *thread* hay *process*. Từ góc nhìn của kernel, có một hàng đợi các tác vụ đang chờ có một lõi CPU để thực thi các instruction của chúng, và nhiệm vụ của đơn vị task scheduler là cung cấp phương tiện này cho tất cả chúng một cách công bằng.

> **Lưu ý**:
>
> Trong các kernel Unix-like, chúng ta thường dùng thuật ngữ *task* cho cả process lẫn thread. Thực tế, các thuật ngữ thread hay<a id="_idIndexMarker1031"></a> process là các thuật ngữ *userspace*, và chúng không thể được dùng trong thuật ngữ kernel. Do đó, các kernel Unix-like có các đơn vị task scheduler cố gắng quản lý một cách công bằng việc truy cập các lõi CPU giữa các tác vụ khác nhau.

Trong các kernel khác nhau, các task scheduler dùng các chiến lược và thuật toán khác nhau để thực hiện scheduling. Nhưng hầu hết chúng có thể được nhóm thành hai nhóm lớn các thuật toán scheduling:

- Cooperative scheduling (lập lịch hợp tác)
- Preemptive scheduling (lập lịch ưu tiên chiếm quyền)

Cooperative scheduling là việc trao lõi CPU cho một tác vụ và chờ sự hợp tác của tác vụ để<a id="_idIndexMarker1032"></a> giải phóng lõi CPU. Cách tiếp cận này không *preemptive* theo nghĩa là trong hầu hết các trường hợp bình thường, không có sự cưỡng chế nào được dùng để lấy lại lõi CPU từ tác vụ. Phải có một *preemptive signal* có độ ưu tiên cao để khiến scheduler lấy lại lõi CPU bằng preemption. Nếu không, scheduler và mọi tác vụ trong hệ thống nên chờ cho đến khi tác vụ đang hoạt động tự ý giải phóng lõi CPU. Các kernel hiện đại thường không được thiết kế theo cách này, nhưng bạn vẫn có thể tìm thấy các kernel dùng cooperative scheduling cho các ứng dụng rất cụ thể, như *real-time processing*. Các phiên bản đầu của macOS và Windows đã dùng cooperative scheduling, nhưng ngày nay chúng dùng cách tiếp cận preemptive scheduling.

Trái ngược với cooperative scheduling, chúng ta có preemptive scheduling. Trong preemptive scheduling, một tác vụ được phép dùng một lõi CPU cho đến khi nó bị scheduler lấy lại. Trong một loại preemptive scheduling cụ thể, một tác vụ được phép dùng lõi CPU được cấp trong một khoảng thời gian nhất định. Loại preemptive scheduling này được gọi là *time-sharing*, và nó<a id="_idIndexMarker1033"></a> là chiến lược scheduling được dùng nhiều nhất trong các kernel hiện tại. Khoảng thời gian được cấp cho một tác vụ để dùng CPU có nhiều tên khác nhau, và nó có thể được gọi là một *time slice*, một *time slot*, hay một *quantum* trong các nguồn học thuật khác nhau.

Cũng có nhiều loại time-sharing scheduling khác nhau dựa trên thuật toán được dùng. *Round-robin* là thuật toán time-sharing được dùng rộng rãi <a id="_idIndexMarker1034"></a>nhất và đã được nhiều kernel dùng, dĩ nhiên với một số sửa đổi. Thuật toán round-robin cho phép truy cập công bằng và *starvation-free* (không bỏ đói) vào một tài nguyên dùng chung, trong trường hợp này là một lõi CPU.

Mặc dù thuật toán round-robin đơn giản và không có độ ưu tiên, nó có thể được sửa đổi để cho phép nhiều mức độ ưu tiên cho các tác vụ. Có các mức độ ưu tiên khác nhau thường là một yêu cầu đối với các kernel hiện đại vì có những loại tác vụ nhất định được khởi tạo bởi chính kernel hay các đơn vị quan trọng khác bên trong kernel, và những tác vụ này nên được phục vụ trước mọi tác vụ thông thường khác.

Như chúng tôi đã nói trước đây, có hai cách để đưa concurrency vào một phần mềm. Cách tiếp cận thứ nhất là multi-processing, dùng các *user process* để thực hiện các tác vụ song song trong một môi trường multitasking. Cách tiếp cận thứ hai là multithreading, dùng các *user thread* để chia các tác vụ thành các luồng thực thi song song bên trong một process duy nhất. Việc dùng kết hợp cả hai kỹ thuật trong một dự án phần mềm lớn cũng rất phổ biến. Mặc dù cả hai kỹ thuật đều mang concurrency vào phần mềm, chúng có những khác biệt cơ bản xét về bản chất khác nhau của chúng.

Trong hai phần sau, chúng ta sẽ nói chi tiết hơn về multi-processing và multithreading. Trong hai chương tiếp theo, chúng ta sẽ trình bày việc phát triển multithreaded trong C, và trong hai chương sau đó, chúng ta sẽ thảo luận về<a id="_idIndexMarker1035"></a> multi-processing.

<a id="_idParaDest-204"></a>

## Multi-processing

Multi-processing đơn giản <a id="_idIndexMarker1036"></a>có nghĩa là dùng process để thực hiện các tác vụ concurrent. Một ví dụ rất tốt là chuẩn **Common Gateway Interface** (**CGI**) trong các web server. Các web server dùng kỹ thuật này khởi chạy một *interpreter process* mới cho mỗi yêu cầu HTTP. Bằng cách này, chúng có thể phục vụ nhiều yêu cầu đồng thời.

Trên những web server như vậy, với một lưu lượng yêu cầu cao, bạn có thể thấy nhiều interpreter process được sinh ra và chạy cùng lúc, mỗi process đang xử lý một yêu cầu HTTP khác nhau. Vì chúng là các process khác nhau, chúng được cô lập và không thể thấy các vùng memory của nhau. May mắn thay, trong trường hợp sử dụng CGI, các interpreter process không cần giao tiếp với nhau hay chia sẻ dữ liệu. Nhưng điều này không phải lúc nào cũng vậy.

Có nhiều ví dụ trong đó một số process đang thực hiện một số tác vụ concurrent, và chúng cần chia sẻ những mẩu thông tin then chốt để cho phần mềm tiếp tục hoạt động. Ví dụ, chúng ta có thể nói đến hạ tầng Hadoop. Có nhiều node trong một cluster Hadoop, và mỗi node có một số process giữ cho cluster hoạt động.

Những process này cần liên tục chia sẻ các mẩu thông tin để giữ cho cluster hoạt động. Có nhiều ví dụ khác về những hệ thống phân tán như vậy với nhiều node, như Gluster, Kafka và các mạng tiền mã hóa. Tất cả chúng đều cần rất nhiều sự giao tiếp qua lại và message-passing giữa các process nằm trên các node khác nhau để duy trì hoạt động.

Chừng nào các process hay thread đang hoạt động mà không có shared state nào ở giữa, không có nhiều khác biệt giữa multi-processing và multithreading. Có lẽ bạn có thể dùng process thay cho thread và ngược lại. Nhưng khi đưa vào một shared state giữa chúng, chúng ta thấy một khác biệt lớn giữa việc dùng process hay thread, hay thậm chí kết hợp cả hai. Một khác biệt nằm ở các kỹ thuật synchronization có sẵn. Dù các API được phơi ra để dùng những cơ chế này ít nhiều giống nhau, độ phức tạp của việc làm việc trong các môi trường multi-process cao hơn nhiều và các cách triển khai bên dưới khác nhau. Một khác biệt khác giữa multi-processing và multithreading là các kỹ thuật chúng ta dùng để có shared state. Trong khi thread có thể dùng mọi kỹ thuật có sẵn cho process, chúng có lợi thế xa xỉ là có thể dùng cùng một vùng memory để chia sẻ một state. Như bạn sẽ thấy trong các chương sắp tới, điều này tạo ra một khác biệt lớn.

Để giải thích thêm, một process có một memory private, và các process khác không thể đọc hay sửa đổi nó, nên không dễ dàng dùng memory của process để chia sẻ một thứ gì đó với các process khác. Nhưng điều này đơn giản hơn nhiều với thread. Mọi thread trong cùng một process đều có quyền truy cập vào cùng memory của process; do đó chúng có thể dùng nó để lưu một shared state.

Tiếp theo, bạn có thể tìm thấy các kỹ thuật có thể được process dùng để truy cập một shared state giữa chúng. Thêm thông tin về những kỹ thuật này sẽ được đưa ra trong các chương sắp tới:

- **File system**: Đây có thể <a id="_idIndexMarker1037"></a>được coi là cách đơn giản nhất để chia sẻ dữ liệu giữa một số process. Cách tiếp cận này rất cũ và được hỗ trợ bởi gần như mọi hệ điều hành. Một ví dụ là các file cấu hình được nhiều process trong một dự án phần mềm đọc. Nếu file sẽ được ghi bởi một trong các process, các kỹ thuật synchronization nên được dùng để ngăn data race và các vấn đề concurrency-related khác.

- **Memory-mapped file**: Trong mọi hệ điều hành POSIX-compliant <a id="_idIndexMarker1038"></a>và Microsoft Windows, chúng ta có thể có các vùng memory được ánh xạ tới các file trên đĩa. Những vùng memory này có thể được chia sẻ giữa một số process để được đọc và sửa đổi.

  Kỹ thuật này rất giống cách tiếp cận file system, nhưng nó ít gây đau đầu hơn do việc streaming dữ liệu tới và từ một file descriptor bằng File API. Các cơ chế synchronization phù hợp nên được dùng nếu nội dung của vùng được ánh xạ có thể bị sửa đổi bởi bất kỳ process nào có quyền truy cập nó.

- **Network** (mạng): Đối với các process<a id="_idIndexMarker1039"></a> nằm trên các máy tính khác nhau, cách duy nhất để giao tiếp là dùng hạ tầng mạng và socket programming API. Socket programming API là một phần lớn của các chuẩn SUS và POSIX, và nó tồn tại trong gần như mọi hệ điều hành.

  Các chi tiết về kỹ thuật này rất đồ sộ, và có nhiều cuốn sách chỉ để trình bày kỹ thuật này. Nhiều giao thức khác nhau, nhiều architecture khác nhau, các phương pháp khác nhau để xử lý luồng dữ liệu, và nhiều chi tiết khác nữa đều tồn tại như các phần con của kỹ thuật này. Chúng tôi cố gắng trình bày một phần của nó trong *Chương 20*, *Socket Programming*, nhưng có thể cần một cuốn sách hoàn toàn riêng để đi qua các khía cạnh khác nhau của IPC qua mạng.

- **Signal**: Các process đang chạy <a id="_idIndexMarker1040"></a>bên trong cùng một hệ điều hành có thể gửi signal cho nhau. Dù điều này được dùng nhiều hơn để truyền các tín hiệu lệnh, nó cũng có thể được dùng để chia sẻ một state nhỏ (payload). Giá trị cho shared state có thể được mang theo signal và được process đích chặn bắt.

- **Shared memory**: Trong các hệ điều hành POSIX<a id="_idIndexMarker1041"></a>-compliant và Microsoft Windows, chúng ta có thể có một vùng memory được chia sẻ giữa một số process. Do đó, chúng có thể dùng vùng dùng chung này để lưu biến và chia sẻ một số giá trị. Shared memory không được bảo vệ chống lại data race, nên các process muốn dùng nó làm chỗ chứa cho các shared state có thể sửa đổi của mình cần dùng một cơ chế synchronization phù hợp để tránh mọi vấn đề concurrency. Một vùng shared memory có thể được nhiều process dùng cùng lúc.

- **Pipe**: Trong các hệ điều hành POSIX-compliant <a id="_idIndexMarker1042"></a>và Microsoft Windows, pipe<a id="_idIndexMarker1043"></a> là các kênh giao tiếp one-way (một chiều). Chúng có thể được dùng để chuyển một shared state giữa hai process. Một trong các process ghi vào pipe, và process kia đọc từ nó.

  Một pipe có thể là có tên hoặc ẩn danh, mỗi loại có các trường hợp sử dụng cụ thể riêng. Chúng tôi sẽ đưa ra thêm chi tiết và ví dụ trong *Chương 19*, *Single-Host IPC và Socket*, khi nói về các kỹ thuật IPC khác nhau có sẵn trên một máy duy nhất.

- **Unix domain socket**: Trong các hệ điều hành POSIX-compliant, và gần đây là Windows 10, chúng ta có các điểm cuối giao tiếp được biết đến là *Unix socket*. Các process nằm trên cùng một máy và chạy bên trong cùng một hệ điều hành có thể dùng *Unix domain socket* để truyền thông tin qua<a id="_idIndexMarker1044"></a> một kênh full-duplex. Unix domain socket rất giống network socket, nhưng mọi dữ liệu đều được truyền qua kernel, do đó nó cung cấp một cách truyền dữ liệu rất nhanh. Nhiều process có thể dùng cùng một Unix domain socket để giao tiếp và chia sẻ dữ liệu. Unix domain socket cũng có thể được dùng cho các trường hợp sử dụng đặc biệt, như chuyển một file descriptor giữa các process trên cùng một máy. Điều tốt về Unix domain socket là chúng ta cần dùng cùng socket programming API như thể chúng là network socket.

- **Message queue**: Điều này tồn tại trong <a id="_idIndexMarker1045"></a>gần như mọi hệ điều hành. Một message queue được duy trì trong kernel có thể được nhiều process dùng để gửi và nhận một số thông điệp. Các process không cần biết về nhau, và chúng chỉ cần có quyền truy cập vào message queue là đủ.

  Kỹ thuật này chỉ được dùng để làm cho các process trên cùng một máy có thể giao tiếp với nhau.

- **Biến môi trường** (environment variable): Các hệ điều hành Unix-like<a id="_idIndexMarker1047"></a> và Microsoft Windows cung cấp một tập <a id="_idIndexMarker1048"></a>biến được giữ trong chính hệ điều hành.

  Những biến này được gọi là biến môi trường, và chúng có thể truy cập được bởi các process bên trong hệ thống.

Ví dụ, phương pháp này được dùng rất nhiều trong các bản triển khai CGI được giới thiệu ở đoạn đầu tiên của phần này, đặc biệt khi process web server chính muốn truyền dữ liệu yêu cầu HTTP cho interpreter process được sinh ra.

Về các kỹ thuật kiểm soát để làm cho một số thread/process được đồng bộ hóa, bạn sẽ thấy rằng các kỹ thuật được dùng trong các môi trường multi-processing và multithreading dùng chung một API rất giống nhau do chuẩn POSIX cung cấp. Nhưng có lẽ bản triển khai bên dưới của một mutex hay một condition variable khác nhau trong cách dùng multithreading và multiprocessing. Chúng tôi sẽ đưa ra các ví dụ về điều này trong các chương sắp tới.

<a id="_idParaDest-205"></a>

## Multithreading

Multithreading là <a id="_idIndexMarker1049"></a>việc dùng các *user thread* để thực hiện các tác vụ song song trong một môi trường concurrent. Rất hiếm khi tìm thấy một chương trình non-trivial chỉ có một thread duy nhất; gần như mọi chương trình bạn sẽ gặp đều là multithreaded. Thread chỉ có thể tồn tại bên trong process; chúng ta không thể có bất kỳ thread nào mà không có process sở hữu. Mỗi process có ít nhất một thread, thường <a id="_idIndexMarker1050"></a>được gọi là *main thread*. Một chương trình dùng một thread duy nhất để thực hiện mọi tác vụ của nó được gọi là một chương trình *single-threaded*. Mọi thread <a id="_idIndexMarker1051"></a>bên trong một process đều có quyền truy cập vào cùng các vùng memory, và điều này có nghĩa là chúng ta sẽ không phải nghĩ ra một kịch bản phức tạp để chia sẻ một mẩu dữ liệu, như chúng ta làm trong multi-processing.

Vì thread rất giống process, chúng có thể dùng mọi kỹ thuật mà process dùng để chia sẻ hay chuyển một state. Do đó, mọi kỹ thuật được giải thích trong phần trước đều có thể được thread dùng để truy cập một shared state hay chuyển dữ liệu giữa chúng. Nhưng thread có một ưu điểm khác so với process theo nghĩa này, và đó là có quyền truy cập vào cùng các vùng memory. Do đó, một trong những phương pháp phổ biến để chia sẻ một mẩu dữ liệu giữa một số thread là dùng memory bằng cách khai báo một số biến.

Vì mỗi thread có memory Stack riêng của nó, nó có thể được dùng làm chỗ chứa để giữ các shared state. Một thread có thể đưa một address trỏ tới đâu đó bên trong Stack của nó cho một thread khác, và nó có thể dễ dàng được thread kia truy cập vì mọi memory address này đều thuộc về segment Stack của process. Các thread cũng có thể dễ dàng truy cập cùng không gian Heap thuộc sở hữu của process và dùng nó làm chỗ chứa để lưu các shared state của chúng. Chúng tôi sẽ đưa ra một số ví dụ về việc dùng các vùng Stack và Heap làm chỗ chứa cho các shared state trong chương tiếp theo.

Các kỹ thuật synchronization cũng rất giống các kỹ thuật được process dùng. Ngay cả POSIX API cũng vẫn như nhau giữa process và thread. Có lẽ là do<a id="_idIndexMarker1052"></a> thực tế rằng một hệ điều hành POSIX-compliant đối xử với process và thread theo gần như cùng một cách. Trong chương tiếp theo, chúng tôi sẽ giải thích cách dùng POSIX API để khai báo semaphore, mutex và condition variable và nhiều thứ khác trong một chương trình multithreaded.

Lưu ý cuối cùng về Windows, liên quan đến POSIX Threading API (pthreads), Microsoft Windows không hỗ trợ nó. Do đó, Windows có API riêng, tạo và quản lý thread. API này là một phần của library native Win32, mà chúng ta sẽ không đi qua trong cuốn sách này, nhưng bạn chắc chắn có thể tìm thấy nhiều tài nguyên trên web trình bày về nó.

<a id="_idParaDest-206"></a>

## Tóm tắt

Trong chương này, chúng ta đã thảo luận về các vấn đề mà chúng ta có thể kỳ vọng gặp phải khi phát triển một chương trình concurrent, và các giải pháp chúng ta nên dùng để giải quyết chúng. Sau đây là các điểm chính mà chúng ta đã trình bày trong chương này.

- Chúng ta đã trình bày các vấn đề concurrency. Các vấn đề nội tại tồn tại trong mọi hệ thống concurrent khi các interleaving khác nhau làm không thỏa mãn các invariant constraint của một hệ thống.
- Chúng ta đã thảo luận các vấn đề post-synchronization chỉ xảy ra sau khi dùng một kỹ thuật synchronization một cách kém cỏi và sai lầm.
- Chúng ta đã khám phá các cơ chế kiểm soát được dùng để giữ các invariant constraint được thỏa mãn.
- Semaphore là công cụ then chốt trong việc triển khai các cơ chế kiểm soát. Mutex là một loại semaphore đặc biệt chỉ cho phép một tác vụ tại một thời điểm đi vào một critical section dựa trên các điều kiện mutual exclusion.
- Các đối tượng monitor đóng gói một mutex và một condition variable có thể được dùng trong các tình huống khi một tác vụ đang chờ một điều kiện được đáp ứng.
- Cuối cùng chúng ta đã thực hiện bước đầu tiên hướng tới việc phát triển concurrency bằng việc giới thiệu multi-processing và multithreading trong chuẩn POSIX.

Chương tiếp theo là chương đầu tiên trong cặp chương (*Chương 15*, *Thực thi Thread (Thread Execution)*, và *Chương 16*, *Thread Synchronization*) thảo luận việc phát triển multithreaded trong các hệ điều hành POSIX-compliant. *Chương 15*, *Thực thi Thread (Thread Execution)* chủ yếu nói về thread và cách chúng được thực thi. *Chương 16*, *Thread Synchronization* đi qua các cơ chế concurrency control có sẵn cho các môi trường multithreaded, và cùng nhau chúng truyền tải mọi chủ đề cần thiết để viết một chương trình multithreaded.
