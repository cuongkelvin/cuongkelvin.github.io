<a id="_idParaDest-321"></a>

# Chương 22: Unit Testing và Debugging (Unit Testing and Debugging)

Không thực sự quan trọng bạn đang dùng ngôn ngữ lập trình nào hay bạn đang phát triển loại ứng dụng nào, việc kiểm thử nó kỹ lưỡng trước khi giao cho khách hàng luôn quan trọng.

Viết test không phải là điều mới mẻ và tính đến ngày nay, bạn có thể tìm thấy hàng trăm hay thậm chí hàng nghìn test trong gần như mọi dự án phần mềm. Ngày nay, viết test cho phần mềm là điều bắt buộc và việc giao một đoạn code hay tính năng mà không kiểm thử nó đúng cách là rất không được khuyến khích. Đó là lý do tại sao chúng tôi có một chương riêng để nói về việc kiểm thử phần mềm được viết bằng C, và các library khác nhau tồn tại ngày nay cho mục đích này.

Tuy nhiên, kiểm thử không phải là chủ đề duy nhất trong chương này. Chúng ta cũng sẽ thảo luận các công cụ và kỹ thuật debugging có thể được dùng để gỡ rối một chương trình C. Kiểm thử và debugging đã bổ sung cho nhau ngay từ đầu, và bất cứ khi nào một test thất bại, một loạt các cuộc điều tra được tiến hành và debug code đích là một hành động follow-up (tiếp theo) phổ biến.

Trong chương này, chúng ta sẽ không đi qua triết lý kiểm thử và chúng ta giả định rằng kiểm thử là tốt. Thay vào đó, chúng tôi sẽ cho bạn một phần giới thiệu ngắn về hệ thuật ngữ cơ bản và các hướng dẫn mà một developer nên tuân theo để viết code có thể kiểm thử được.

Chương này có hai phần. Trong phần đầu tiên, chúng ta nói về kiểm thử và các library hiện có có thể được dùng trong việc phát triển C hiện đại. Phần thứ hai của chương này sẽ nói về debugging, bắt đầu với một thảo luận về các nhóm bug khác nhau. Các vấn đề memory, vấn đề concurrency và vấn đề hiệu năng là những trường hợp phổ biến nhất mà việc debug thêm có vẻ cần thiết để tiến hành một cuộc điều tra thành công.

Chúng ta cũng sẽ trình bày các công cụ debugging được dùng nhiều nhất có sẵn cho C (và C++). Mục tiêu cuối cùng của chương này là cho bạn biết về các tiện ích kiểm thử và debugging có sẵn cho C và cho bạn một số kiến thức nền tảng cơ bản về chúng.

Phần đầu tiên giới thiệu với bạn hệ thuật ngữ cơ bản của kiểm thử phần mềm nói chung. Nó không đặc thù cho C, và các ý tưởng và khái niệm có thể được áp dụng cho các ngôn ngữ lập trình và công nghệ khác nữa.

<a id="_idParaDest-322"></a>

## Kiểm thử phần mềm

Kiểm thử phần mềm là một chủ đề lớn và quan trọng trong lập trình máy tính, và nó có hệ thuật ngữ cụ thể riêng và <a id="_idIndexMarker1618"></a>nhiều khái niệm. Trong phần này, chúng tôi sẽ cho bạn một phần giới thiệu rất cơ bản về kiểm thử phần mềm. Mục đích của chúng tôi là định nghĩa một số thuật ngữ mà chúng ta sẽ dùng trong nửa đầu của chương này. Do đó, bạn nên biết rằng đây không phải là một chương kỹ lưỡng về kiểm thử và rất khuyến khích nghiên cứu thêm.

Khi nói đến kiểm thử phần mềm, câu hỏi đầu tiên nảy ra là, chúng ta đang kiểm thử cái gì, và việc kiểm thử này là về cái gì? Nói chung, chúng ta kiểm thử một khía cạnh của một hệ thống phần mềm. Khía cạnh này có thể là *chức năng* (functional) hay *non-functional* (phi chức năng). Nói cách khác, khía cạnh đó có thể liên quan đến một chức năng nhất định của hệ thống, hay nó có thể liên quan đến một biến số nhất định của một hệ thống khi thực hiện một chức năng. Tiếp theo, chúng tôi đưa ra một số ví dụ.

*Functional testing* (kiểm thử chức năng) là về việc kiểm thử một chức năng đã định nghĩa được yêu cầu như một phần của *functional requirement* (yêu cầu chức năng). Những test này cung cấp một input nhất định cho một *software element* (phần tử phần mềm) như một *hàm*, một *module*, một *component*, hay một *hệ thống phần mềm*, và kỳ vọng một output nhất định từ chúng. Chỉ khi output kỳ vọng được thấy trong một test thì test đó mới được coi là *passed* (đạt).

*Non-functional testing* là về *mức chất lượng* mà một phần tử phần mềm, như một hàm, một module, một component, hay toàn bộ một hệ thống phần mềm, hoàn thành một chức năng cụ thể. Những test này thường được dự định *đo* các *biến số* khác nhau như *mức sử dụng memory*, *thời gian hoàn tất*, *lock contention* và *mức bảo mật*, và đánh giá phần tử đó đã làm tốt công việc của mình đến đâu. Một test chỉ đạt khi các biến số được đo nằm trong các khoảng kỳ vọng. Các *kỳ vọng* cho những biến số này được rút ra từ các *yêu cầu non-functional* được định nghĩa cho hệ thống.

Ngoài kiểm thử chức năng và non-functional, chúng ta có thể có các *mức* (level) kiểm thử khác nhau. Những mức này được thiết kế theo cách bao quát một số khía cạnh trực giao. Một số khía cạnh này là kích thước của phần tử được kiểm thử, tác nhân của việc kiểm thử, và phạm vi các chức năng cần được kiểm thử.

Chẳng hạn, về kích thước của phần tử, những mức này được định nghĩa từ mẩu chức năng nhỏ nhất có thể, mà chúng ta biết là một hàm (hay một method), lên đến mẩu chức năng lớn nhất có thể được phơi ra từ toàn bộ một hệ thống phần mềm.

Trong phần sau, chúng ta sẽ giới thiệu những mức này theo một nghĩa sâu hơn

Các mức kiểm thử (Testing levels)

Với mỗi hệ thống phần mềm, <a id="_idIndexMarker1620"></a>các mức kiểm thử sau có thể được xem xét và lên kế hoạch. Đây không phải là các mức kiểm thử duy nhất hiện có và bạn có thể tìm thấy thêm trong các tài liệu tham khảo khác:

- Unit testing
- Integration testing
- System testing
- Acceptance testing
- Regression testing

Trong *unit testing* (kiểm thử đơn vị), chúng ta kiểm thử một *unit* (đơn vị) chức năng. Đơn vị này có thể là một hàm thực hiện một công việc nhất định, hay một nhóm hàm cùng nhau đáp ứng một nhu cầu, hay một class có mục tiêu cuối cùng là thực hiện một chức năng nhất định, hay thậm chí một component có một tác vụ cụ thể cần làm. Một *component* là một phần của một hệ thống phần mềm có một tập chức năng well-defined và, cùng với các component khác, kết hợp lại và trở thành toàn bộ hệ thống phần mềm.

Trong trường hợp có các component làm đơn vị, chúng ta gọi quá trình kiểm thử là *component testing*. Cả kiểm thử chức năng lẫn non-functional đều có thể được thực hiện ở mức đơn vị. Khi kiểm thử một đơn vị, đơn vị đó nên được cô lập khỏi các đơn vị xung quanh, và để điều này xảy ra, môi trường xung quanh nên được mô phỏng theo một cách nào đó. Mức này sẽ là mức duy nhất mà chúng ta trình bày trong chương này và chúng tôi cung cấp code thật để minh họa unit testing và component testing có thể được thực hiện như thế nào trong C.

Khi các đơn vị kết hợp lại với nhau, chúng tạo thành một component. Trong component testing, một component được kiểm thử riêng lẻ trong sự cô lập. Nhưng khi chúng ta nhóm một số component này lại, chúng ta cần một mức kiểm thử khác kiểm tra chức năng hay các biến số cho nhóm component cụ thể đó. Mức này là *integration testing* (kiểm thử tích hợp). Như tên gọi ngụ ý, các test ở mức này kiểm tra xem việc tích hợp một số component có hoạt động tốt không và chúng cùng nhau vẫn thỏa mãn các yêu cầu được định nghĩa cho hệ thống.

Ở một mức khác, chúng ta kiểm thử chức năng của toàn bộ hệ thống. Điều này sẽ chứa một tập hoàn chỉnh mọi component được tích hợp đầy đủ. Bằng cách này, chúng ta kiểm thử xem các chức năng hệ thống và các biến số hệ thống được phơi ra có phù hợp với các yêu cầu được định nghĩa cho hệ thống phần mềm không.

Ở một mức khác nữa, chúng ta đánh giá một hệ thống phần mềm để kiểm tra xem nó có phù hợp với các yêu cầu nghiệp vụ được định nghĩa cho hệ thống đó từ góc nhìn của *stakeholder* (bên liên quan) hay *người dùng cuối* không. Mức này được gọi là *acceptance testing* (kiểm thử chấp nhận). Dù cả system testing lẫn acceptance testing đều là về toàn bộ hệ thống phần mềm, chúng thực ra khá khác nhau. Kể ra một vài khác biệt:

- System testing được thực hiện bởi developer và tester, còn acceptance testing thường được thực hiện bởi người dùng cuối hay stakeholder.
- System testing là về việc kiểm tra cả yêu cầu chức năng lẫn non-functional, còn acceptance testing chỉ là về yêu cầu chức năng.
- Trong system <a id="_idIndexMarker1621"></a>testing, chúng ta thường dùng một tập dữ liệu nhỏ đã chuẩn bị làm input, còn trong acceptance testing, dữ liệu real-time thực tế được đưa vào hệ thống.

Một link tuyệt vời giải thích mọi khác biệt có thể được tìm thấy [at https://www.javatpoint.com/acceptance-tes](https://www.javatpoint.com/acceptance-testing)ting.

Khi một thay đổi được đưa vào một hệ thống phần mềm, cần kiểm tra xem các test chức năng và non-functional hiện tại có còn ở trạng thái tốt không. Điều này được thực hiện ở một mức khác được biết đến là *regression testing* (kiểm thử hồi quy). Mục đích của regression testing là xác nhận rằng không có *regression* (sự thụt lùi) nào sau khi đưa vào một thay đổi. Trong regression testing, mọi test chức năng và non-functional có dưới dạng unit test, integration test và end-to-end test (system test) đều được chạy lại để xem có test nào thất bại sau một thay đổi không.

Trong phần này, chúng tôi đã giới thiệu các mức kiểm thử khác nhau. Trong phần còn lại của chương này, chúng ta sẽ thảo luận về unit testing. Trong phần sắp tới, chúng ta bắt đầu nói về nó bằng cách đưa ra một ví dụ C và cố gắng viết test case cho nó.

<a id="_idParaDest-323"></a>

## Unit testing

Như chúng tôi đã giải thích trong phần trước, trong unit testing, chúng ta kiểm thử các đơn vị được cô lập và một đơn vị có thể nhỏ<a id="_idIndexMarker1622"></a> như một hàm hay lớn như một component. Trong C, nó có thể là một hàm hay toàn bộ một component được viết bằng C. Cùng thảo luận này có thể được áp dụng cho C++, nhưng ở đó chúng ta có thể có các đơn vị khác như class.

Điều quan trọng nhất về unit testing là các đơn vị nên được kiểm thử trong sự cô lập. Ví dụ, nếu hàm đích phụ thuộc vào output của một hàm khác, chúng ta cần tìm cách kiểm thử hàm đích trong sự cô lập. Chúng tôi sẽ giải thích điều này bằng một ví dụ thật.

*Ví dụ 22.1* in giai thừa của các số chẵn nhỏ hơn 10, nhưng không theo cách thông thường. Code được tổ chức well-organized (gọn gàng) trong một header và hai source file. Ví dụ là về hai hàm; một trong số chúng sinh ra các số chẵn nhỏ hơn 10 và hàm kia nhận một function pointer và dùng nó làm nguồn để đọc một số nguyên, và cuối cùng tính giai thừa của nó.

Code box sau chứa header file chứa các khai báo hàm:

```
#ifndef _EXTREME_C_EXAMPLE_22_1_
#define _EXTREME_C_EXAMPLE_22_1_
#include <stdint.h>
#include <unistd.h>
typedef int64_t (*int64_feed_t)();
int64_t next_even_number();
int64_t calc_factorial(int64_feed_t feed);
#endif
```

*Code Box 22-1 [ExtremeC_examples_chapter22_1.h]: Header file của ví dụ 22.1*

Như bạn có thể thấy, hàm `calc_factorial` nhận một function pointer trả về một số nguyên. Nó sẽ dùng function pointer để đọc một số nguyên và tính giai thừa của nó. Code sau là định nghĩa của các hàm trên:

```
#include "ExtremeC_examples_chapter22_1.h"
int64_t next_even_number() {
  static int feed = -2;
  feed += 2;
  if (feed >= 10) {
    feed = 0;
  }
  return feed;
}
int64_t calc_factorial(int64_feed_t feed) {
  int64_t fact = 1;
  int64_t number = feed();
  for (int64_t i = 1; i <= number; i++) {
    fact *= i;
  }
  return fact;
}
```

*Code Box 22-2 [ExtremeC_examples_chapter22_1.c]: Định nghĩa của các hàm được dùng trong ví dụ 22.1*

Hàm `next_even_number` có một biến static nội bộ đóng vai trò như một nguồn cấp cho hàm gọi. Lưu ý rằng nó không bao giờ vượt quá 8 và sau đó, nó quay về 0. Do đó, bạn có thể<a id="_idIndexMarker1624"></a> đơn giản gọi hàm này bao nhiêu lần tùy thích, và bạn không bao giờ nhận được một số lớn hơn 8 và nhỏ hơn không. Code box sau chứa nội dung của source file chứa hàm `main`:

```
#include <stdio.h>
#include "ExtremeC_examples_chapter22_1.h"
int main(int argc, char** argv) {
  for (size_t i = 1; i <= 12; i++) {
    printf("%lu\n", calc_factorial(next_even_number));
  }
  return 0;
}
```

*Code Box 22-3 [ExtremeC_examples_chapter22_1_main.c]: Hàm main của ví dụ 22.1*

Như bạn thấy, hàm `main` gọi `calc_function` 12 lần và in ra các giai thừa được trả về. Để chạy ví dụ trên, bạn cần biên dịch cả hai source file trước và sau đó link các relocatable object file tương ứng của chúng lại với nhau. Shell box sau chứa các lệnh cần thiết để build và chạy ví dụ:

```
$ gcc -c ExtremeC_examples_chapter22_1.c -o impl.o
$ gcc -c ExtremeC_examples_chapter22_1_main.c -o main.o
$ gcc impl.o main.o -o ex22_1.out
$ ./ex22_1.out
1
2
24
720
40320
1
2
24
720
40320
1
2
$
```

*Shell Box 22-1: Build và chạy ví dụ 22.1*

Để viết test cho các hàm trên, chúng ta cần giới thiệu một chút trước. Như bạn có thể thấy, chúng ta có hai hàm (không tính hàm `main`) trong ví dụ. Do đó, có hai đơn vị khác nhau, trong trường hợp này là các hàm, nên được kiểm thử riêng rẽ và cô lập với nhau; một là hàm `next_even_number` và cái kia là hàm `calc_factorial`. Nhưng như đã rõ trong hàm main, hàm `calc_factorial` phụ thuộc vào hàm `next_even_number` và người ta có thể nghĩ rằng sự phụ thuộc này sẽ làm việc cô lập hàm `calc_factorial` khó hơn nhiều so với dự kiến. Nhưng điều này không đúng.

Thực tế, hàm `calc_factorial` hoàn toàn không phụ thuộc vào hàm `next_even_number`. Nó chỉ phụ thuộc vào *chữ ký* (signature) của `next_even_number` chứ không phụ thuộc vào định nghĩa của nó. Do đó, có<a id="_idIndexMarker1625"></a> thể thay `next_even_number` bằng một hàm tuân theo cùng chữ ký, nhưng luôn trả về một số nguyên cố định. Nói cách khác, chúng ta có thể cung cấp một phiên bản đơn giản hóa của `next_even_number` được dự định chỉ dùng trong các *test case*.

Vậy, test case là gì? Như bạn biết, có nhiều kịch bản khác nhau để kiểm thử một đơn vị cụ thể. Ví dụ đơn giản nhất là cung cấp các input khác nhau cho một đơn vị nhất định và *kỳ vọng* một output được xác định trước. Trong ví dụ trên, chúng ta có thể cung cấp `0` làm input cho hàm `calc_factorial` và chờ `1` làm output của nó. Chúng ta cũng có thể cung cấp `-1` và chờ `1`.

Mỗi kịch bản này có thể là một test case. Do đó, đối với một đơn vị duy nhất, chúng ta có thể có nhiều test case đề cập mọi trường hợp góc (corner case) khác nhau của đơn vị đó. Một tập hợp các test case được gọi là một *test suite*. Mọi test case có trong một test suite không nhất thiết liên quan đến cùng một đơn vị.

Chúng ta bắt đầu bằng việc tạo một test suite cho hàm `next_even_number`. Vì `next_even_number` có thể dễ dàng được kiểm thử trong sự cô lập, không cần làm thêm gì. Sau đây là các test case được viết cho hàm `next_even_number`:

```
#include <assert.h>
#include "ExtremeC_examples_chapter22_1.h"
void TESTCASE_next_even_number__even_numbers_should_be_returned() {
  assert(next_even_number() == 0);
  assert(next_even_number() == 2);
  assert(next_even_number() == 4);
  assert(next_even_number() == 6);
  assert(next_even_number() == 8);
}
void TESTCASE_next_even_number__numbers_should_rotate() {
  int64_t number = next_even_number();
  next_even_number();
  next_even_number();
  next_even_number();
  next_even_number();
  int64_t number2 = next_even_number();
  assert(number == number2);
}
```

*Code Box 22-4 [ExtremeC_examples_chapter22_1 __next_even_number__tests.c]: Các test case được viết cho hàm next_even_number*

Như bạn thấy, chúng ta đã định nghĩa hai test case trong test suite trên. Lưu ý rằng tôi đã dùng quy ước riêng để đặt tên cho các test case trên; tuy nhiên, không có chuẩn nào về <a id="_idIndexMarker1626"></a>điều này. Toàn bộ mục đích của việc đặt tên test case là để nhận ra một test case làm gì từ tên của nó và quan trọng hơn thế, để tìm nó dễ dàng trong code khi test case thất bại hay cần được sửa đổi.

Tôi đã dùng chữ in hoa `TESTCASE` làm tiền tố cho tên hàm để làm chúng phân biệt với các hàm thông thường khác. Tên của các hàm cũng cố gắng mô tả test case và mối quan tâm mà nó đề cập.

Cả hai test case đều có `assert` ở cuối. Đây là việc mà mọi hàm test case làm khi đánh giá các kỳ vọng. Nếu điều kiện bên trong dấu ngoặc của `assert` không đúng, *test runner*, một chương trình đang chạy các test, thoát và một thông báo lỗi được in ra. Hơn thế nữa, test runner trả về một *exit code* non-zero chỉ ra rằng một hay nhiều test case đã thất bại. Chương trình test runner phải trả về 0 khi mọi test đều thành công.

Sẽ tốt nếu tự mình đi qua các test case và cố gắng hiểu chúng đánh giá các kỳ vọng của chúng ta như thế nào bằng việc gọi hàm `next_even_number` trong hai kịch bản trên.

Giờ, đã đến lúc viết test case cho hàm `calc_factorial`. Việc viết test case cho hàm `calc_factorial` cần một *stub function* làm nguồn cấp trả về input test. Chúng tôi sẽ giải thích stub là gì ngay sau đây.

Sau đây là ba test case chỉ kiểm thử đơn vị `calc_factorial`:

```
#include <assert.h>
#include "ExtremeC_examples_chapter22_1.h"
int64_t input_value = -1;
int64_t feed_stub() {
  return input_value;
}
void TESTCASE_calc_factorial__fact_of_zero_is_one() {
  input_value = 0;
  int64_t fact = calc_factorial(feed_stub);
  assert(fact == 1);
}
void TESTCASE_calc_factorial__fact_of_negative_is_one() {
  input_value = -10;
  int64_t fact = calc_factorial(feed_stub);
  assert(fact == 1);
}
void TESTCASE_calc_factorial__fact_of_5_is_120() {
  input_value = 5;
  int64_t fact = calc_factorial(feed_stub);
  assert(fact == 120);
}
```

*Code Box 22-5 [ExtremeC_examples_chapter22_1 __calc_factorial__tests.c]: Các test case được viết cho hàm calc_factorial*

Như bạn có thể thấy, chúng ta đã định nghĩa ba test case cho hàm `calc_factorial`. Hãy lưu ý hàm `feed_stub`. Nó tuân theo cùng hợp đồng (contract) mà `next_even_number` đang tuân theo, như có thể thấy trong *Code Box 22-2*, nhưng nó có một định nghĩa rất đơn giản. Nó chỉ trả về một giá trị được lưu trong biến static `input_value`. Biến này có thể được các test case đặt trước khi gọi hàm `calc_facorial`.

Dùng stub function trên, chúng ta có thể cô lập `calc_factorial` và kiểm thử nó riêng lẻ. Cùng cách tiếp cận hợp lệ cho các ngôn ngữ lập trình object-oriented như C++ hay Java, nhưng ở đó chúng ta định nghĩa *stub class* và *stub object*.

Trong C, một *stub* là một định nghĩa hàm tuân theo một khai báo hàm mà đơn vị đích sẽ dùng như một phần logic của nó, và quan trọng hơn, stub không có logic phức tạp và nó chỉ trả về một giá trị sẽ chỉ được test case dùng.

Trong C++, một stub vẫn có thể là một định nghĩa hàm tuân theo một khai báo hàm, hay một class<a id="_idIndexMarker1628"></a> hiện thực một interface. Trong các ngôn ngữ object-oriented khác nơi bạn không thể có các hàm độc lập, chẳng hạn Java, một stub chỉ có thể là một class hiện thực một interface. Khi đó, một stub object là một đối tượng từ những stub class như vậy. Lưu ý rằng trong mọi trường hợp, một stub nên có một định nghĩa đơn giản chỉ dùng được trong test, và không dùng trong production.

Cuối cùng, chúng ta cần có khả năng chạy các test case. Như chúng tôi đã nói trước đây, chúng ta cần một test runner để chạy test. Do đó, chúng ta cần một source file cụ thể với một hàm `main` chỉ chạy các test case lần lượt từng cái một. Code box sau chứa code của test runner:

```
#include <stdio.h>
void TESTCASE_next_even_number__even_numbers_should_be_returned();
void TESTCASE_next_even_number__numbers_should_rotate();
void TESTCASE_calc_factorial__fact_of_zero_is_one();
void TESTCASE_calc_factorial__fact_of_negative_is_one();
void TESTCASE_calc_factorial__fact_of_5_is_120();
int main(int argc, char** argv) {
  TESTCASE_next_even_number__even_numbers_should_be_returned();
  TESTCASE_next_even_number__numbers_should_rotate();
  TESTCASE_calc_factorial__fact_of_zero_is_one();
  TESTCASE_calc_factorial__fact_of_negative_is_one();
  TESTCASE_calc_factorial__fact_of_5_is_120();
  printf("All tests are run successfully.\n");
  return 0;
}
```

*Code Box 22-6 [ExtremeC_examples_chapter22_1 _tests.c]: Test runner được dùng trong ví dụ 22.1*

Code trên trả về `0` chỉ khi mọi test case bên trong hàm `main` đều được thực thi thành công. Để build test runner, chúng ta cần chạy các lệnh sau. Hãy lưu ý tùy chọn `-g` thêm debugging symbol vào executable test runner cuối cùng. Thực hiện một *debug build* là cách phổ biến nhất để build test vì nếu một test case thất bại, chúng ta ngay lập tức cần *stack trace* chính xác và thêm thông tin debug để<a id="_idIndexMarker1629"></a> tiếp tục điều tra. Hơn thế nữa, các câu lệnh `assert` thường bị loại khỏi *release build*, nhưng chúng ta cần có chúng trong executable test runner:

```
$ gcc -g -c ExtremeC_examples_chapter22_1.c -o impl.o
$ gcc -g -c ExtremeC_examples_chapter22_1__next_even_number__tests.c -o tests1.o
$ gcc -g -c ExtremeC_examples_chapter22_1__calc_factorial__tests.c -o tests2.o
$ gcc -g -c ExtremeC_examples_chapter22_1_tests.c -o main.o
$ gcc impl.o tests1.o tests2.o main.o -o ex22_1_tests.out
$ ./ex22_1_tests.out
All tests are run successfully.
$ echo $?
0
$
```

*Shell Box 22-2: Build và chạy test runner của ví dụ 22.1*

Shell box trên cho thấy mọi test đều đã đạt. Bạn cũng có thể kiểm tra exit code của process test runner bằng lệnh `echo $?` và thấy rằng nó đã trả về không.

Giờ, bằng cách áp dụng một thay đổi đơn giản trong một trong các hàm, chúng ta có thể làm các test thất bại. Hãy xem điều gì xảy ra khi chúng ta thay đổi `calc_factorial` như sau:

```
int64_t calc_factorial(int64_feed_t feed) {
  int64_t fact = 1;
  int64_t number = feed();
  for (int64_t i = 1; i <= (number + 1); i++) {
    fact *= i;
  }
  return fact;
}
```

*Code Box 22-7: Thay đổi hàm calc_factorial để làm các test thất bại*

Với thay đổi trên, được thể hiện bằng chữ in đậm, các test case về input `0` và input âm vẫn đạt, nhưng <a id="_idIndexMarker1630"></a>test case cuối cùng, vốn là về việc tính giai thừa của `5`, thất bại. Chúng ta sẽ build lại test runner và sau đây là output của việc thực thi trên một máy macOS:

```
$ gcc -g -c ExtremeC_examples_chapter22_1.c -o impl.o
$ gcc -g -c ExtremeC_examples_chapter22_1_tests.c -o main.o
$ ./ex22_1_tests.out
Assertion failed: (fact == 120), function TESTCASE_calc_factorial__fact_of_5_is_120,
file .../22.1/ExtremeC_examples_chapter22_1__calc_factorial__tests.c, line 29.
Abort trap: 6
$ echo $?
134
$
```

*Shell Box 22-3: Build và chạy test runner sau khi thay đổi hàm calc_factorial*

Như bạn có thể thấy, `Assertion failed` xuất hiện trong output và exit code là `134`. Exit code này thường được dùng và báo cáo bởi các hệ thống chạy test định kỳ, như *Jenkins*, để kiểm tra xem các test có được chạy thành công không.

Như một quy tắc kinh nghiệm, bất cứ khi nào bạn có một đơn vị nên được kiểm thử trong sự cô lập, bạn cần tìm cách cung cấp các phụ thuộc của nó như một loại input nào đó. Do đó, bản thân đơn vị nên được viết theo cách làm cho nó *testable* (có thể kiểm thử được). Không phải mọi code đều testable, và khả năng kiểm thử không chỉ giới hạn ở unit testing, và điều này rất quan trọng cần biết. Link này cung cấp<a id="_idIndexMarker1631"></a> thông tin tốt về cách viết t[estable code: https://blog.gurock.com/highly-](https://blog.gurock.com/highly-testable-code/)testable-code/ (code có thể kiểm thử).

Để làm rõ thảo luận trên, giả sử rằng chúng ta đã viết hàm `calc_factorial` như dưới đây để dùng hàm `next_even_number` trực tiếp thay vì dùng một function pointer. Lưu ý rằng trong code box sau, hàm không nhận một argument function pointer và nó gọi hàm `next_even_number` trực tiếp:

```
int64_t calc_factorial() {
  int64_t fact = 1;
  int64_t number = next_even_number();
  for (int64_t i = 1; i <= number; i++) {
    fact *= i;
  }
  return fact;
}
```

*Code Box 22-8: Thay đổi chữ ký của hàm calc_factorial để không nhận function pointer*

Code trên ít testable hơn. Không có cách nào để kiểm thử `calc_factorial` mà không gọi `next_even_number` – tức là, nếu không dùng một số mẹo để thay đổi định nghĩa đằng sau symbol `next_even_number` như một phần của executable cuối cùng, như chúng ta làm trong *ví dụ 22.2*.

Thực tế, cả hai phiên bản của `calc_factorial` đều làm cùng một việc, nhưng định nghĩa trong *Code Box 22-2* testable hơn vì chúng ta có thể kiểm thử nó trong sự cô lập. Viết code testable không dễ, và bạn nên luôn suy nghĩ cẩn thận để hiện thực code và làm cho nó testable.

Viết code testable thường đòi hỏi nhiều công sức hơn. Có nhiều ý kiến khác nhau về tỉ lệ phần trăm chi phí phụ của việc viết code testable nhưng chắc chắn rằng việc viết test mang lại một số chi phí thêm về <a id="_idIndexMarker1632"></a>thời gian và công sức. Nhưng chi phí thêm này chắc chắn có những lợi ích lớn. Không có test cho một đơn vị, bạn sẽ mất dấu nó theo thời gian khi có thêm nhiều thay đổi được đưa vào đơn vị.

<a id="_idParaDest-324"></a>

### Test double

Trong ví dụ trên, khi viết test case, chúng tôi đã giới thiệu stub function. Có một vài thuật ngữ khác về<a id="_idIndexMarker1633"></a> các đối tượng cố gắng bắt chước các phụ thuộc của một đơn vị. Những đối tượng này được gọi là *test double*. Tiếp theo, chúng tôi sẽ giới thiệu hai test double khác: các hàm *mock* và *fake*. Trước tiên, hãy giải thích ngắn gọn lại stub function là gì.

Hãy lưu ý hai điều trong phần ngắn này. Thứ nhất, có những cuộc tranh luận never-ending (không hồi kết) về định nghĩa của các test double này, và chúng tôi cố gắng đưa ra một định nghĩa phù hợp khớp với cách dùng của chúng ta trong chương này. Thứ hai, chúng ta giữ thảo luận chỉ liên quan đến C, nên không có đối tượng nào và mọi thứ chúng ta có đều là hàm.

Khi một đơn vị phụ thuộc vào một hàm khác, nó đơn giản phụ thuộc vào chữ ký của hàm đó, do đó hàm đó có thể được thay bằng một hàm mới. Hàm mới này, dựa trên một số thuộc tính mà nó có thể có, có thể được gọi là một stub, một mock, hay một hàm fake. Những hàm này chỉ được viết để thỏa mãn các yêu cầu test và chúng không thể được dùng trong production.

Chúng tôi đã giải thích stub là một hàm rất đơn giản, thường chỉ trả về một giá trị hằng. Như bạn đã thấy trong *ví dụ 22.1*, nó gián tiếp trả về một giá trị vừa được test case đang chạy đặt. Trong link sau, bạn có thể đọc thêm về các test double mà chúng ta đang nói đến <a id="_idIndexMarker1634"></a>và a f[ew more of them: https://en.wikipedia.org](https://en.wikipedia.org/wiki/Test_double)/wiki/Test_double (vài loại khác nữa). Nếu bạn <a id="_idIndexMarker1635"></a>mở link, một stub được định nghĩa là thứ cung cấp một *indirect input* (input gián tiếp) cho code kiểm thử. Nếu bạn chấp nhận định nghĩa này, hàm `feed_stub` thấy trong *Code Box 22-5* là một stub function.

Các hàm mock, hay nói chung là các mock object trong các ngôn ngữ object-oriented, có thể được thao tác bằng cách chỉ định output cho một input nhất định. Bằng cách này, bạn đặt bất cứ thứ gì nên được trả về từ một hàm mock cho một input nhất định trước khi chạy logic test và trong quá trình logic chạy nó sẽ hành động như bạn đã đặt trước đó. Các mock object nói chung cũng có thể có kỳ vọng và chúng thực hiện các assertion cần thiết tương ứng. Như đã nêu trong link trên, đối với mock object, chúng ta đặt kỳ vọng trước khi chạy test. Chúng tôi sẽ đưa ra một ví dụ C về các hàm mock trong phần component testing.

Cuối cùng, một hàm fake có thể được dùng để cung cấp một chức năng rất đơn giản hóa thay cho một chức năng thật và có lẽ phức tạp trong test đang chạy. Ví dụ, thay vì dùng một filesystem thật, người ta có thể dùng một số kho lưu trữ in-memory (trong memory) đơn giản hóa. Trong component testing, chẳng hạn, các component khác có chức năng phức tạp có thể được thay bằng các hiện thực fake trong test.

Trước khi kết thúc phần này, tôi muốn nói về *code coverage*. Về lý thuyết, mọi đơn vị nên có các test suite tương ứng và mỗi test suite nên chứa mọi test case đi qua mọi nhánh code khả dĩ. Như chúng tôi đã nói, đây là về lý thuyết, nhưng trên thực tế bạn thường chỉ có test cho một tỉ lệ phần trăm đơn vị. Thường thì bạn không có test case bao quát mọi nhánh code khả dĩ.

Tỉ lệ các đơn vị có test case phù hợp được gọi là code coverage hay *test coverage*. Tỉ lệ càng cao, bạn càng ở vị trí tốt hơn để được thông báo về các sửa đổi không mong muốn. Những sửa đổi không mong muốn này thường không được đưa vào bởi các developer tồi. Thực tế, những thay đổi gây hỏng này thường được đưa vào khi ai đó đang làm việc trên một đoạn code để sửa một bug hay hiện thực một tính năng mới.

Sau khi đã trình bày test double, chúng ta nói về component testing trong phần tiếp theo.

<a id="_idParaDest-325"></a>

## Component testing

Như chúng tôi đã giải thích trong phần trước, đơn vị có thể được định nghĩa là một hàm duy nhất, một nhóm hàm, hay toàn bộ một component. Do đó, component testing là một loại unit testing đặc biệt. Trong phần này, chúng tôi muốn định nghĩa một component giả định như một phần của *ví dụ 22.1* và đặt hai hàm có trong ví dụ vào component này. Lưu ý rằng<a id="_idIndexMarker1636"></a> một component thường dẫn đến một executable hay một library. Chúng ta có thể giả sử rằng component giả định của chúng ta sẽ dẫn đến một library chứa hai hàm.

Như chúng tôi đã nói trước đây, chúng ta phải có khả năng kiểm thử chức năng của một component. Trong phần này, chúng ta vẫn muốn viết test case nhưng khác biệt giữa các test được viết trong phần này và phần trước là về các đơn vị cần được cô lập. Trong phần trước, chúng ta có các hàm cần được cô lập, nhưng trong phần này, chúng ta có một component, gồm hai hàm làm việc cùng nhau, cần được cô lập. Vì vậy, các hàm phải được kiểm thử khi chúng đang làm việc cùng nhau.

Tiếp theo, bạn có thể tìm thấy các test case chúng ta đã viết cho component được định nghĩa trong *ví dụ 22.1*:

```
#include <assert.h>
#include "ExtremeC_examples_chapter22_1.h"
void TESTCASE_component_test__factorials_from_0_to_8() {
  assert(calc_factorial(next_even_number) == 1);
  assert(calc_factorial(next_even_number) == 2);
  assert(calc_factorial(next_even_number) == 24);
  assert(calc_factorial(next_even_number) == 720);
  assert(calc_factorial(next_even_number) == 40320);
}
void TESTCASE_component_test__factorials_should_rotate() {
  int64_t number = calc_factorial(next_even_number);
  for (size_t i = 1; i <= 4; i++) {
    calc_factorial(next_even_number);
  }
  int64_t number2 = calc_factorial(next_even_number);
  assert(number == number2);
}
int main(int argc, char** argv) {
  TESTCASE_component_test__factorials_from_0_to_8();
  TESTCASE_component_test__factorials_should_rotate();
  return 0;
}
```

*Code Box 22-9 [ExtremeC_examples_chapter22_1_component_tests.c]: Một số component test được viết cho component giả định của chúng ta trong ví dụ 22.1*

Như bạn thấy, chúng ta đã viết hai test case. Như chúng tôi đã nói trước đây, trong component giả định của chúng ta, các hàm `calc_factorial` và `next_even_number` phải làm việc cùng nhau, và như bạn thấy, chúng ta đã truyền `next_even_number` làm nguồn cấp cho `calc_factorial`. Các test case trên, và các test case tương tự khác, nên bảo đảm rằng component đang hoạt động đúng.

Cần rất nhiều công sức<a id="_idIndexMarker1637"></a> để chuẩn bị một nền tảng cho việc viết test case. Do đó, rất phổ biến việc dùng một testing library cho mục đích này. Những library này chuẩn bị sân chơi cho các test case; chúng khởi tạo mỗi test case, chạy test case, và cuối cùng dọn dẹp (tear down) test case. Trong phần sắp tới, chúng ta sẽ nói về hai trong số các testing library có sẵn cho C.

<a id="_idParaDest-326"></a>

## Các testing library cho C

Trong phần này, chúng tôi sẽ minh họa hai trong số các library well-known được dùng để viết test cho<a id="_idIndexMarker1638"></a> các chương trình C. Đối với unit testing trong C, chúng ta dùng các library được viết bằng C hay C++. Đó là vì chúng ta có thể tích hợp chúng dễ dàng và dùng các đơn vị trực tiếp <a id="_idIndexMarker1639"></a>từ một môi trường kiểm thử C hay C++. Trong phần này, trọng tâm của chúng ta là unit testing và component testing trong C.

Đối với integration testing, chúng ta tự do chọn các ngôn ngữ lập trình khác. Nói chung, integration testing và system testing phức tạp hơn nhiều, và do đó chúng ta cần dùng một số testing automation framework để viết test dễ hơn và chạy chúng mà không quá nhiều <a id="_idIndexMarker1640"></a>rắc rối. Việc dùng một **domain-specific language** (**DSL**) là một phần của sự tự động hóa này, để viết các kịch bản test dễ hơn và làm việc thực thi test đơn giản hơn nhiều. Nhiều ngôn ngữ có thể được dùng cho mục đích này, nhưng các ngôn ngữ scripting như Unix shell, Python, JavaScript và Ruby nằm trong số những ngôn ngữ được ưa thích nhất. Một số ngôn ngữ lập trình khác như Java cũng được dùng rất nhiều trong test automation.

Sau đây là danh sách một số <a id="_idIndexMarker1641"></a>unit testing framework well-known có thể được dùng để viết unit test cho các chương trình C. Danh sách dưới đây có thể được tìm thấy tại link sau: http://check.sourceforge.net/doc/check_html/check_2.html#SEC3:

- Check (từ tác giả của link trên)
- AceUnit
- GNU Autounit
- cUnit
- CUnit
- CppUnit
- CuTest
- embUnit
- MinUnit
- Google Test
- CMocka

Trong các phần sau, chúng tôi sẽ giới thiệu hai testing framework phổ biến: *CMocka*, được viết bằng C, và *Google Test*, được viết bằng C++. Chúng ta sẽ không khám phá mọi tính năng của những<a id="_idIndexMarker1642"></a> framework này, mà đây chỉ là để cho bạn một cảm nhận ban đầu về một unit<a id="_idIndexMarker1643"></a> testing framework. Rất khuyến khích nghiên cứu thêm trong lĩnh vực này.

Trong phần tiếp theo, chúng ta sẽ viết unit test cho *ví dụ 22.1* bằng CMocka.

<a id="_idParaDest-327"></a>

### CMocka

Điều tuyệt vời đầu tiên về CMocka là nó được viết hoàn toàn bằng C, và nó chỉ phụ thuộc vào thư viện chuẩn C – không phụ thuộc vào bất kỳ library nào khác. Vì vậy, bạn có thể dùng một compiler C để biên dịch các test, và <a id="_idIndexMarker1644"></a>điều này cho bạn sự tự tin rằng môi trường test rất gần với môi trường production thực tế. CMocka có sẵn trên nhiều nền tảng như macOS, Linux, và thậm chí Microsoft Windows.

CMocka là framework *de facto* cho unit testing trong C. Nó hỗ trợ *test fixture*. Test fixture có thể cho phép bạn khởi tạo và dọn dẹp môi trường kiểm thử trước và sau mỗi test case. CMocka cũng hỗ trợ *function mocking*, vốn rất hữu ích khi cố mock bất kỳ hàm C nào. Để nhắc lại, một hàm mock có thể được cấu hình để trả về một giá trị nhất định khi một input nhất định được cung cấp. Chúng tôi sẽ đưa ra một ví dụ về việc mock hàm chuẩn `rand` được dùng trong *ví dụ 22.2*.

Code box sau chứa cùng các test case mà chúng ta đã thấy cho *ví dụ 22.1* nhưng lần này được viết bằng CMocka. Chúng tôi đã đặt mọi test case trong chỉ một file, có hàm `main` riêng:

```
// Required by CMocka
#include <stdarg.h>
#include <stddef.h>
#include <setjmp.h>
#include <cmocka.h>
#include "ExtremeC_examples_chapter22_1.h"
int64_t input_value = -1;
int64_t feed_stub() {
  return input_value;
}
void calc_factorial__fact_of_zero_is_one(void** state) {
  input_value = 0;
  int64_t fact = calc_factorial(feed_stub);
  assert_int_equal(fact, 1);
}
void calc_factorial__fact_of_negative_is_one(void** state) {
  input_value = -10;
  int64_t fact = calc_factorial(feed_stub);
  assert_int_equal(fact, 1);
}
void calc_factorial__fact_of_5_is_120(void** state) {
  input_value = 5;
  int64_t fact = calc_factorial(feed_stub);
  assert_int_equal(fact, 120);
}
void next_even_number__even_numbers_should_be_returned(void** state) {
  assert_int_equal(next_even_number(), 0);
  assert_int_equal(next_even_number(), 2);
  assert_int_equal(next_even_number(), 4);
  assert_int_equal(next_even_number(), 6);
  assert_int_equal(next_even_number(), 8);
}
void next_even_number__numbers_should_rotate(void** state) {
  int64_t number = next_even_number();
  for (size_t i = 1; i <= 4; i++) {
    next_even_number();
  }
  int64_t number2 = next_even_number();
  assert_int_equal(number, number2);
}
int setup(void** state) {
  return 0;
}
int tear_down(void** state) {
  return 0;
}
int main(int argc, char** argv) {
  const struct CMUnitTest tests[] = {
    cmocka_unit_test(calc_factorial__fact_of_zero_is_one),
    cmocka_unit_test(calc_factorial__fact_of_negative_is_one),
    cmocka_unit_test(calc_factorial__fact_of_5_is_120),
    cmocka_unit_test(next_even_number__even_numbers_should_be_returned),
    cmocka_unit_test(next_even_number__numbers_should_rotate),
  };
  return cmocka_run_group_tests(tests, setup, tear_down);
}
```

*Code Box 22-10 [ExtremeC_examples_chapter22_1_cmocka_tests.c]: Các test case CMocka cho ví dụ 22.1*

Trong CMocka, mỗi test case nên trả về `void` và nhận một argument `void**`. Argument pointer sẽ<a id="_idIndexMarker1645"></a> được dùng để nhận một mẩu thông tin, gọi là một `state`, đặc thù cho một test case. Trong hàm `main`, chúng ta tạo một danh sách test case, và cuối cùng chúng ta gọi hàm `cmocka_run_group_tests` để chạy mọi unit test.

Ngoài các hàm test case, bạn thấy hai hàm mới: `setup` và `tear_down`. Như chúng tôi đã nói trước đây, những hàm này được gọi là test fixture. Test fixture được gọi trước và sau mỗi test case và trách nhiệm của chúng là thiết lập và dọn dẹp test case. Fixture `setup` được gọi trước mỗi test case và fixture `tear_down` được gọi sau mỗi test case. Lưu ý rằng các tên là tùy chọn, và chúng có thể được đặt tên bất kỳ, nhưng chúng ta dùng `setup` và `tear_down` cho rõ ràng.

Một khác biệt quan trọng khác giữa các test case chúng ta đã viết trước đây và các test case được viết bằng CMocka là việc dùng các hàm assertion khác nhau. Đây là một trong những ưu điểm của việc dùng một unit testing framework. Có một phạm vi rộng các hàm assertion như một phần của một testing library có thể cho bạn thêm thông tin về sự thất bại của chúng, thay vì hàm `assert` chuẩn, vốn kết thúc chương trình ngay lập tức và không đưa ra nhiều thông tin. Như bạn có thể thấy, chúng ta đã dùng `assert_int_equal` trong code trên, vốn kiểm tra sự bằng nhau của hai số nguyên.

Để biên dịch chương trình trên, bạn cần cài đặt CMocka trước. Trên một hệ thống Linux Debian-based, chỉ cần chạy `sudo apt-get install libcmocka-dev`, và trên các hệ thống macOS, chỉ cần cài đặt nó bằng lệnh `brew install cmocka`. Sẽ có rất nhiều trợ giúp có sẵn trên mạng có thể giúp bạn vượt qua quá trình cài đặt.

Sau khi đã cài đặt CMocka, bạn có thể dùng các lệnh sau để build code trên:

```
$ gcc -g -c ExtremeC_examples_chapter22_1.c -o impl.o
$ gcc -g -c ExtremeC_examples_chapter22_1_cmocka_tests.c -o cmocka_tests.o
$ gcc impl.o cmocka_tests.o -lcmocka -o ex22_1_cmocka_tests.out
$ ./ex22_1_cmocka_tests.out
[==========] Running 5 test(s).
[ RUN      ] calc_factorial__fact_of_zero_is_one
[       OK ] calc_factorial__fact_of_zero_is_one
[ RUN      ] calc_factorial__fact_of_negative_is_one
[       OK ] calc_factorial__fact_of_negative_is_one
[ RUN      ] calc_factorial__fact_of_5_is_120
[       OK ] calc_factorial__fact_of_5_is_120
[ RUN      ] next_even_number__even_numbers_should_be_returned
[       OK ] next_even_number__even_numbers_should_be_returned
[ RUN      ] next_even_number__numbers_should_rotate
[       OK ] next_even_number__numbers_should_rotate
[==========] 5 test(s) run.
[  PASSED  ] 5 test(s).
$
```

*Shell Box 22-4: Build và chạy các unit test CMocka được viết cho ví dụ 22.1*

Như bạn có thể thấy, chúng ta phải dùng `-lcmocka` để link chương trình trên với library CMocka đã cài đặt. Output cho thấy tên các test case và số test đã đạt. Tiếp theo, chúng ta <a id="_idIndexMarker1647"></a>thay đổi một trong các test case để làm nó thất bại. Chúng ta chỉ sửa đổi assertion đầu tiên trong test case `next_even_number__even_numbers_should_be_returned`:

```
void next_even_number__even_numbers_should_be_returned(void** state) {
  assert_int_equal(next_even_number(), 1);
  ...
}
```

*Code Box 22-11: Thay đổi một trong các test case CMocka trong ví dụ 22.1*

Giờ, hãy build các test và chạy chúng lần nữa:

```
$ gcc -g -c ExtremeC_examples_chapter22_1_cmocka_tests.c -o cmocka_tests.o
$ gcc impl.o cmocka_tests.o -lcmocka -o ex22_1_cmocka_tests.out
$ ./ex22_1_cmocka_tests.out
[==========] Running 5 test(s).
[ RUN      ] calc_factorial__fact_of_zero_is_one
[       OK ] calc_factorial__fact_of_zero_is_one
[ RUN      ] calc_factorial__fact_of_negative_is_one
[       OK ] calc_factorial__fact_of_negative_is_one
[ RUN      ] calc_factorial__fact_of_5_is_120
[       OK ] calc_factorial__fact_of_5_is_120
[ RUN      ] next_even_number__even_numbers_should_be_returned
[  ERROR   ] --- 0 != 0x1
[   LINE   ] --- .../ExtremeC_examples_chapter22_1_cmocka_tests.c:37: error: Failure!
[  FAILED  ] next_even_number__even_numbers_should_be_returned
[ RUN      ] next_even_number__numbers_should_rotate
[       OK ] next_even_number__numbers_should_rotate
[==========] 5 test(s) run.
[  PASSED  ] 4 test(s).
[  FAILED  ] 1 test(s), listed below:
[  FAILED  ] next_even_number__even_numbers_should_be_returned
 1 FAILED TEST(S)
 $
```

*Shell Box 22-5: Build và chạy các unit test CMocka sau khi sửa đổi một trong số chúng*

Trong output trên, bạn thấy rằng một trong các test case đã thất bại và lý do được hiển thị dưới dạng một lỗi ở giữa các log. Nó cho thấy một sự thất bại của assertion so sánh bằng số nguyên. Như chúng tôi đã giải thích trước đây, việc dùng `assert_int_equal` thay vì dùng một lời gọi `assert` thông thường cho phép CMocka in ra một thông điệp hữu ích trong log thực thi thay vì chỉ kết thúc chương trình.

Ví dụ tiếp theo của chúng ta là về việc dùng tính năng function mocking của CMocka. CMocka cho phép bạn mock một hàm và bằng cách này, bạn có thể điều khiển hàm trả về một kết quả cụ thể khi một input nhất định được cung cấp.

Trong ví dụ tiếp theo, *ví dụ 22.2*, chúng tôi muốn minh họa cách dùng tính năng mocking. Trong ví dụ này, hàm chuẩn `rand` được dùng để sinh số ngẫu nhiên. Cũng có <a id="_idIndexMarker1648"></a>một hàm, tên là `random_boolean`, trả về một Boolean dựa trên tính chẵn lẻ của số được trả về từ hàm `rand`. Trước khi cho thấy tính năng mocking của CMocka, chúng tôi muốn cho thấy cách tạo một stub cho hàm `rand`. Bạn thấy rằng ví dụ này khác với *ví dụ 22.1*. Tiếp theo, bạn có thể thấy khai báo của hàm `random_boolean`:

```
#ifndef _EXTREME_C_EXAMPLE_22_2_
#define _EXTREME_C_EXAMPLE_22_2_
#define TRUE 1
#define FALSE 0
typedef int bool_t;
bool_t random_boolean();
#endif
```

*Code Box 22-12 [ExtremeC_examples_chapter22_2.h]: Header file của ví dụ 22.2*

Và code box sau chứa định nghĩa:

```
#include <stdlib.h>
#include <stdio.h>
#include "ExtremeC_examples_chapter22_2.h"
bool_t random_boolean() {
  int number = rand();
  return (number % 2);
}
```

*Code Box 22-13 [ExtremeC_examples_chapter22_2.c]: Định nghĩa của hàm random_boolean trong ví dụ 22.2*

Trước hết, chúng ta không thể để `random_boolean` dùng định nghĩa `rand` thực sự trong các test vì, như tên của nó ngụ ý, nó sinh số ngẫu nhiên và chúng ta không thể có một yếu tố ngẫu nhiên trong các test. Test là về việc kiểm tra kỳ vọng và các kỳ vọng, cùng các input được cung cấp, phải có thể dự đoán được. Hơn thế nữa, định nghĩa của hàm `rand` là một phần của thư viện chuẩn C, chẳng hạn *glibc* trong Linux, và việc dùng một stub function cho nó sẽ không dễ như những gì chúng ta đã làm trong *ví dụ 22.1*.

Trong ví dụ trước<a id="_idIndexMarker1649"></a>, chúng ta có thể gửi một function pointer tới định nghĩa stub rất dễ dàng. Nhưng trong ví dụ này, chúng ta đang dùng hàm `rand` trực tiếp. Chúng ta không thể thay đổi định nghĩa của `random_boolean`, và chúng ta phải nghĩ ra một mẹo khác để dùng stub function cho `rand`.

Để dùng một định nghĩa khác cho hàm `rand`, một trong những cách dễ nhất trong C là xử lý các *symbol* trong object file cuối cùng. Trong *symbol table* của object file thu được, có một mục cho `rand` tham chiếu tới định nghĩa thực sự của nó trong thư viện chuẩn C. Nếu chúng ta thay đổi mục này để tham chiếu tới một định nghĩa khác của hàm `rand` trong các binary test của chúng ta, chúng ta có thể dễ dàng thay định nghĩa của `rand` bằng định nghĩa stub của mình.

Trong code box sau, bạn có thể thấy cách chúng ta đã định nghĩa stub function và các test cùng nhau. Điều này sẽ rất giống những gì chúng ta đã làm cho *ví dụ 22.1*:

```
#include <stdlib.h>
// Required by CMocka
#include <stdarg.h>
#include <stddef.h>
#include <setjmp.h>
#include <cmocka.h>
#include "ExtremeC_examples_chapter22_2.h"
int next_random_num = 0;
int __wrap_rand() {
  return next_random_num;
}
void test_even_random_number(void** state) {
  next_random_num = 10;
  assert_false(random_boolean());
}
void test_odd_random_number(void** state) {
  next_random_num = 13;
  assert_true(random_boolean());
}
int main(int argc, char** argv) {
  const struct CMUnitTest tests[] = {
    cmocka_unit_test(test_even_random_number),
    cmocka_unit_test(test_odd_random_number)
  };
  return cmocka_run_group_tests(tests, NULL, NULL);
}
```

*Code Box 22-14 [ExtremeC_examples_chapter22_2_cmocka_tests_with_stub.c]: Viết các test case CMocka dùng một stub function*

Như bạn có thể thấy, code trên phần lớn theo cùng mẫu mà chúng ta đã thấy trong các test CMocka được viết cho *ví dụ 22.1* trong *Code Box 22-10*. Hãy build file trên và<a id="_idIndexMarker1650"></a> chạy các test. Những gì chúng ta kỳ vọng là mọi test đều thất bại vì, bất kể bạn định nghĩa stub function như thế nào, `random_boolean` vẫn đang lấy `rand` từ thư viện chuẩn C:

```
$ gcc -g -c ExtremeC_examples_chapter22_2.c -o impl.o
$ gcc -g -c ExtremeC_examples_chapter22_2_cmocka_tests_with_stub.c -o tests.o
$ gcc impl.o tests.o -lcmocka -o ex22_2_cmocka_tests_with_stub.out
$ ./ex22_2_cmocka_tests_with_stub.out
[==========] Running 2 test(s).
[ RUN      ] test_even_random_number
[  ERROR   ] --- random_boolean()
[   LINE   ] --- ExtremeC_examples_chapter22_2_cmocka_tests_with_stub.c:23: error: Failure!
[  FAILED  ] test_even_random_number
[ RUN      ] test_odd_random_number
[  ERROR   ] --- random_boolean()
[   LINE   ] --- ExtremeC_examples_chapter22_2_cmocka_tests_with_stub.c:28: error: Failure!
[  FAILED  ] test_odd_random_number
[==========] 2 test(s) run.
[  PASSED  ] 0 test(s).
[  FAILED  ] 2 test(s), listed below:
[  FAILED  ] test_even_random_number
[  FAILED  ] test_odd_random_number
 2 FAILED TEST(S)
$
```

*Shell Box 22-6: Build và chạy các unit test CMocka cho ví dụ 22.2*

Giờ là lúc thực hiện mẹo và thay đổi định nghĩa đằng sau symbol `rand` được định nghĩa như một phần của executable file `ex22_2_cmocka_tests_with_stub.out`. Lưu ý rằng các<a id="_idIndexMarker1651"></a> lệnh sau chỉ áp dụng được cho các hệ thống Linux. Chúng ta làm như sau:

```
$ gcc impl.o tests.o -lcmocka -Wl,--wrap=rand -o ex22_2_cmocka_tests_with_stub.out
$ ./ex22_2_cmocka_tests_with_stub.out
[==========] Running 2 test(s).
[ RUN      ] test_even_random_number
[       OK ] test_even_random_number
[ RUN      ] test_odd_random_number
[       OK ] test_odd_random_number
[==========] 2 test(s) run.
[  PASSED  ] 2 test(s).
$
```

*Shell Box 22-7: Build và chạy các unit test CMocka cho ví dụ 22.2 sau khi wrap symbol rand*

Như bạn thấy trong output, hàm `rand` chuẩn không còn được gọi nữa và thay vào đó, stub function trả về những gì chúng ta đã bảo nó trả về. Mẹo chính khiến hàm `__wrap_rand` được gọi thay cho hàm `rand` chuẩn nằm ở việc dùng tùy chọn `-Wl`,`--wrap=rand` trong lệnh link `gcc`.

Lưu ý rằng tùy chọn này chỉ có sẵn cho chương trình `ld` trong Linux và bạn phải dùng các mẹo khác như *inter-positioning* để gọi một hàm khác trong macOS hay các hệ thống khác dùng một linker khác GNU linker.

Tùy chọn `--wrap=rand` bảo linker cập nhật mục cho symbol `rand` trong symbol table của executable cuối cùng, mục này sẽ tham chiếu tới định nghĩa của hàm `__wrap_rand`. Lưu ý rằng đây không phải là một tên tùy chỉnh và bạn phải đặt tên stub function như vậy. Hàm `__wrap_rand` được gọi là một *wrapper function*. Sau khi cập nhật symbol table, mọi lời gọi tới hàm `rand` đều dẫn đến việc gọi hàm `__wrap_func`. Điều này có thể được kiểm chứng bằng cách xem symbol table của binary test cuối cùng.

Ngoài việc cập nhật symbol `rand` trong symbol table, linker cũng tạo một mục khác. Mục mới có symbol `__real_rand`, tham chiếu tới định nghĩa thực sự của hàm `rand` chuẩn. Do đó, nếu chúng ta cần chạy `rand` chuẩn, chúng ta vẫn có thể dùng tên hàm `__real_rand`. Đây là một cách dùng tuyệt vời của symbol table và các<a id="_idIndexMarker1652"></a> symbol trong đó, để gọi một wrapper function, mặc dù một số người không thích nó và họ thích preload một shared object bọc hàm `rand` thực sự hơn. Dù bạn dùng phương pháp nào, cuối cùng bạn cần chuyển hướng các lời gọi tới symbol `rand` sang một stub function khác.

Cơ chế trên sẽ là cơ sở để minh họa function mocking hoạt động như thế nào trong CMocka. Thay vì có một biến global `next_random_num`, như thấy trong *Code Box 22-14*, chúng ta có thể dùng một hàm được mock để trả về giá trị được chỉ định. Tiếp theo, bạn có thể thấy cùng các test CMocka nhưng dùng một hàm được mock để đọc các input test:

```
#include <stdlib.h>
// Required by CMocka
#include <stdarg.h>
#include <stddef.h>
#include <setjmp.h>
#include <cmocka.h>
#include "ExtremeC_examples_chapter22_2.h"
int __wrap_rand() {
  return mock_type(int);
}
void test_even_random_number(void** state) {
  will_return(__wrap_rand, 10);
  assert_false(random_boolean());
}
void test_odd_random_number(void** state) {
  will_return(__wrap_rand, 13);
  assert_true(random_boolean());
}
int main(int argc, char** argv) {
  const struct CMUnitTest tests[] = {
    cmocka_unit_test(test_even_random_number),
    cmocka_unit_test(test_odd_random_number)
  };
  return cmocka_run_group_tests(tests, NULL, NULL);
}
```

*Code Box 22-15 [ExtremeC_examples_chapter22_2_cmocka_tests_with_mock.c]: Viết các test case CMocka dùng một hàm mock*

Giờ chúng ta đã biết wrapper function `__wrap_rand` được gọi như thế nào, chúng ta có thể giải thích phần mocking. Chức năng mocking được cung cấp bởi cặp hàm `will_return` và `mock_type`. Trước tiên, `will_return` nên được gọi, chỉ định giá trị mà hàm mock nên trả về. Sau đó, khi hàm mock, trong trường hợp này là `__wrap_rand`, được gọi, hàm `mock_type` trả về giá trị được chỉ định.

Ví dụ, chúng ta định nghĩa `10` được trả về từ `__wrap_rand` bằng cách dùng `will_return(__wrap_rand, 10)`, và sau đó giá trị `10` được trả về khi hàm `mock_type` được gọi bên trong `__wrap_rand`. Lưu ý rằng mỗi `will_return` phải đi cặp với một lời gọi `mock_type`; nếu không, test thất bại. Do đó, nếu `__wrap_rand` không được gọi vì<a id="_idIndexMarker1653"></a> bất kỳ lý do gì, test thất bại.

Lưu ý cuối cùng trong phần này, output của code trên sẽ giống như chúng ta đã thấy trong Shell Box *22-6* và *22-7*. Ngoài ra, cùng các lệnh, dĩ nhiên cho source file `ExtremeC_examples_chapter22_2_cmocka_tests_with_mock.c`, phải được dùng để build code và chạy các test.

Trong phần này, chúng tôi đã cho thấy cách chúng ta có thể dùng library CMocka để viết test case, thực hiện assertion và viết hàm mock. Trong phần tiếp theo, chúng ta nói về Google Test, một testing framework khác có thể được dùng để unit test các chương trình C.

<a id="_idParaDest-328"></a>

### Google Test

Google Test là một testing <a id="_idIndexMarker1654"></a>framework C++ có thể được dùng để unit test cả chương trình C lẫn C++. Mặc dù được phát triển bằng C++, nó có thể được dùng để kiểm thử code C. Một số người coi đây là một thực hành tồi, vì môi trường test không được thiết lập bằng cùng compiler và linker mà bạn sẽ dùng để thiết lập môi trường production.

Trước khi có thể dùng Google Test để viết test case cho *ví dụ 22.1*, chúng ta cần sửa đổi header file trong *ví dụ 22.1* một chút. Sau đây là header file mới:

```
#ifndef _EXTREME_C_EXAMPLE_22_1_
#define _EXTREME_C_EXAMPLE_22_1_
#include <stdint.h>
#include <unistd.h>
#if __cplusplus
extern "C" {
#endif
typedef int64_t (*int64_feed_t)();
int64_t next_even_number();
int64_t calc_factorial(int64_feed_t feed);
#if __cplusplus
}
#endif
#endif
```

*Code Box 22-16 [ExtremeC_examples_chapter22_1.h]: Header file đã sửa đổi trong ví dụ 22.1*

Như bạn có thể thấy, chúng ta đã đặt các khai báo trong khối `extern C { ... }`. Chúng ta làm điều đó chỉ khi macro `_cplusplus` được định nghĩa. Thay đổi trên đơn giản có nghĩa là khi compiler là C++, chúng ta muốn có các symbol *unmangled* (không bị mangle) trong các object file thu được, nếu không chúng ta sẽ gặp lỗi link khi linker cố tìm định nghĩa cho các *mangled symbol*. Nếu bạn không biết về *name mangling* của C++, hãy tham khảo phần cuối cùng trong *Chương 2*, *Biên dịch và Liên kết (Compilation and Linking)*.

Giờ, hãy tiếp tục và viết các test case bằng Google Test:

```
// Required by Google Test
#include <gtest/gtest.h>
#include "ExtremeC_examples_chapter22_1.h"
int64_t input_value = -1;
int64_t feed_stub() {
  return input_value;
}
TEST(calc_factorial, fact_of_zero_is_one) {
  input_value = 0;
  int64_t fact = calc_factorial(feed_stub);
  ASSERT_EQ(fact, 1);
}
TEST(calc_factorial, fact_of_negative_is_one) {
  input_value = -10;
  int64_t fact = calc_factorial(feed_stub);
  ASSERT_EQ(fact, 1);
}
TEST(calc_factorial, fact_of_5_is_120) {
  input_value = 5;
  int64_t fact = calc_factorial(feed_stub);
  ASSERT_EQ(fact, 120);
}
TEST(next_even_number, even_numbers_should_be_returned) {
  ASSERT_EQ(next_even_number(), 0);
  ASSERT_EQ(next_even_number(), 2);
  ASSERT_EQ(next_even_number(), 4);
  ASSERT_EQ(next_even_number(), 6);
  ASSERT_EQ(next_even_number(), 8);
}
TEST(next_even_number, numbers_should_rotate) {
  int64_t number = next_even_number();
  for (size_t i = 1; i <= 4; i++) {
    next_even_number();
  }
  int64_t number2 = next_even_number();
   ASSERT_EQ(number, number2);
}
int main(int argc, char** argv) {
  ::testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}
```

*Code Box 22-17 [ExtremeC_examples_chapter22_1_gtests.cpp]: Các test case được viết bằng Google Test cho ví dụ 22.1*

Các test case được định nghĩa bằng macro `TEST(...)`. Đây là một ví dụ về việc macro có thể được dùng tốt như thế nào để tạo thành một DSL. Cũng có các macro khác như `TEST_F(...)` và `TEST_P(...)`, vốn đặc thù cho C++. Argument thứ nhất được truyền cho macro là tên class của test (Google Test được viết cho C++ object-oriented), có thể được coi là test suite chứa một số test case. Argument thứ hai là tên của test case.

Hãy lưu ý macro `ASSERT_EQ`, được dùng để assert sự bằng nhau của các đối tượng, không chỉ số nguyên. Có một<a id="_idIndexMarker1656"></a> số lượng lớn các macro kiểm tra kỳ vọng trong Google Test, khiến nó trở thành một unit testing framework hoàn chỉnh. Phần cuối cùng là hàm `main`, chạy mọi test đã định nghĩa. Lưu ý rằng code trên nên được biên dịch bằng một compiler C++11-compliant như `g++` và `clang++`.

Các lệnh sau build code trên. Hãy lưu ý việc dùng compiler `g++` và tùy chọn `-std=c++11` được truyền cho nó. Nó chỉ ra rằng C++11 nên được dùng:

```
$ gcc -g -c ExtremeC_examples_chapter22_1.c -o impl.o
$ g++ -std=c++11 -g -c ExtremeC_examples_chapter22_1_gtests.cpp -o gtests.o
$ g++ impl.o gtests.o -lgtest -lpthread -o ex19_1_gtests.out
$ ./ex19_1_gtests.out
[==========] Running 5 tests from 2 test suites.
[----------] Global test environment set-up.
[----------] 3 tests from calc_factorial
[ RUN      ] calc_factorial.fact_of_zero_is_one
[       OK ] calc_factorial.fact_of_zero_is_one (0 ms)
[ RUN      ] calc_factorial.fact_of_negative_is_one
[       OK ] calc_factorial.fact_of_negative_is_one (0 ms)
[ RUN      ] calc_factorial.fact_of_5_is_120
[       OK ] calc_factorial.fact_of_5_is_120 (0 ms)
[----------] 3 tests from calc_factorial (0 ms total)
[----------] 2 tests from next_even_number
[ RUN      ] next_even_number.even_numbers_should_be_returned
[       OK ] next_even_number.even_numbers_should_be_returned (0 ms)
[ RUN      ] next_even_number.numbers_should_rotate
[       OK ] next_even_number.numbers_should_rotate (0 ms)
[----------] 2 tests from next_even_number (0 ms total)
[----------] Global test environment tear-down
[==========] 5 tests from 2 test suites ran. (1 ms total)
[  PASSED  ] 5 tests.
$
```

*Shell Box 22-8: Build và chạy các unit test Google Test cho ví dụ 22.1*

Output trên cho thấy một output tương tự output của CMocka. Nó chỉ ra rằng năm test case đã<a id="_idIndexMarker1657"></a> đạt. Hãy thay đổi cùng test case như chúng ta đã làm cho CMocka để làm hỏng test suite:

```
TEST(next_even_number, even_numbers_should_be_returned) {
  ASSERT_EQ(next_even_number(), 1);
  ...
}
```

*Code Box 22-18: Thay đổi một trong các test case được viết bằng Google Test*

Hãy build lại các test và chạy chúng:

```
$ g++ -std=c++11 -g -c ExtremeC_examples_chapter22_1_gtests.cpp -o gtests.o
$ g++ impl.o gtests.o -lgtest -lpthread -o ex22_1_gtests.out
$ ./ex22_1_gtests.out
[==========] Running 5 tests from 2 test suites.
[----------] Global test environment set-up.
[----------] 3 tests from calc_factorial
[ RUN      ] calc_factorial.fact_of_zero_is_one
[       OK ] calc_factorial.fact_of_zero_is_one (0 ms)
[ RUN      ] calc_factorial.fact_of_negative_is_one
[       OK ] calc_factorial.fact_of_negative_is_one (0 ms)
[ RUN      ] calc_factorial.fact_of_5_is_120
[       OK ] calc_factorial.fact_of_5_is_120 (0 ms)
[----------] 3 tests from calc_factorial (0 ms total)
[----------] 2 tests from next_even_number
[ RUN      ] next_even_number.even_numbers_should_be_returned
.../ExtremeC_examples_chapter22_1_gtests.cpp:34: Failure
Expected equality of these values:
 next_even_number()
 Which is: 0
 1
[  FAILED  ] next_even_number.even_numbers_should_be_returned (0 ms)
[ RUN      ] next_even_number.numbers_should_rotate
[       OK ] next_even_number.numbers_should_rotate (0 ms)
[----------] 2 tests from next_even_number (0 ms total)
[----------] Global test environment tear-down
[==========] 5 tests from 2 test suites ran. (0 ms total)
[  PASSED  ] 4 tests.
[  FAILED  ] 1 test, listed below:
[  FAILED  ] next_even_number.even_numbers_should_be_returned
 1 FAILED TEST
$
```

*Shell Box 22-9: Build và chạy các unit test Google Test cho ví dụ 22.1 sau khi sửa đổi một trong các test case*

Như bạn có thể thấy và giống hệt CMocka, Google Test cũng in ra nơi các test bị hỏng và hiển thị một<a id="_idIndexMarker1658"></a> báo cáo hữu ích. Lưu ý cuối cùng về Google Test, nó hỗ trợ test fixture nhưng không theo cùng cách mà CMocka hỗ trợ. Test fixture nên được định nghĩa trong một *test class*.

> **Lưu ý**:
>
> Để có mock object và chức năng mocking, library *Google Mock* (hay *gmock*) có thể được dùng, nhưng chúng tôi không trình bày nó trong cuốn sách này.

Trong phần này, chúng ta đã đi qua hai trong số các unit testing library well-known nhất cho C. Trong phần tiếp theo của chương, chúng ta đi sâu vào chủ đề debugging, vốn dĩ nhiên là một kỹ năng cần thiết cho mọi lập trình viên.

<a id="_idParaDest-329"></a>

## Debugging

Có những tình huống mà một test hay một nhóm test thất bại. Ngoài ra, có những lúc bạn tìm thấy một bug. Trong cả hai <a id="_idIndexMarker1659"></a>tình huống này, có một bug, và bạn cần tìm nguyên nhân gốc rễ và sửa nó. Việc này bao gồm nhiều phiên debug và đi qua source code để tìm nguyên nhân của bug và lên kế hoạch các cách sửa cần thiết. Nhưng việc *debug* một phần mềm có nghĩa là gì?

> **Lưu ý**:
>
> Có một niềm tin phổ biến rằng thuật ngữ "debug" bắt nguồn từ thời mà máy tính lớn đến mức những con bọ thật (như bướm đêm) có thể bị mắc kẹt trong máy móc của hệ thống và gây ra sự cố. Do đó, một số người, chính thức được gọi là *debugger*, được cử vào phòng phần cứng để<a id="_idIndexMarker1660"></a> gỡ những con bọ khỏi thiết bị. Xem link này để biết thêm thông tin: https://en.wikipedia.org/wiki/Debugging.

Debugging là một tác vụ điều tra để tìm nguyên nhân gốc rễ của một bug quan sát được bằng cách nhìn vào bên trong và/hoặc bên ngoài một chương trình. Khi chạy một chương trình, bạn thường nhìn nó như một hộp đen. Tuy nhiên, khi có điều gì đó sai với kết quả hay có điều gì đó làm gián đoạn việc thực thi, bạn cần nhìn sâu hơn vào bên trong và xem vấn đề được tạo ra như thế nào. Điều này có nghĩa là bạn phải quan sát chương trình như một hộp trắng trong đó mọi thứ đều có thể được nhìn thấy.

Về cơ bản đó là lý do tại sao chúng ta có thể có hai bản build khác nhau cho một chương trình: *release* và *build*. Trong các release build, trọng tâm là việc thực thi và chức năng, và chương trình hầu hết được xem như một hộp đen, nhưng trong các debug build, chúng ta có thể theo dõi mọi sự kiện đang xảy ra và nhìn bên trong chương trình như một hộp trắng. Debug build nói chung hữu ích cho các môi trường phát triển và test, còn release build nhắm tới các môi trường triển khai và production.

Để có một debug build, mọi sản phẩm của một dự án phần mềm, hay một tập giới hạn trong số chúng, cần chứa các symbol *debugging*, cho phép một developer theo dõi và xem *stack trace* và luồng thực thi của chương trình. Thông thường, một sản phẩm release (executable hay library) không phù hợp cho mục đích debug vì nó không đủ trong suốt để cho phép một người quan sát xem xét phần bên trong của một chương trình. Trong *Chương 4*, *Cấu trúc memory của process (Process Memory Structure)*, và *Chương 5*, *Stack và Heap*, chúng ta đã thảo luận cách chúng ta có thể build các source C cho mục đích debug.

Để debug một chương trình, chúng ta chủ yếu dùng debugger. Debugger là các chương trình độc lập gắn vào process đích để điều khiển hay giám sát nó. Trong khi debugger là công cụ chính cho việc điều tra của chúng ta khi làm việc với một vấn đề, các công cụ debugging khác cũng có thể được dùng để nghiên cứu memory, các luồng thực thi concurrent, hay hiệu năng của một chương trình. Chúng ta sẽ nói về những công cụ này trong các phần sau.

Một phần lớn bug là *có thể tái tạo* (reproducible), nhưng có những bug không thể được tái tạo hay quan sát trong các phiên debug; điều này chủ yếu là do *observer effect* (hiệu ứng người quan sát). Nó nói rằng, khi bạn muốn nhìn vào phần bên trong của một chương trình, bạn làm thay đổi cách nó hoạt động, và điều đó có thể ngăn một số bug xảy ra. Những loại vấn đề này là thảm họa, và chúng thường rất khó sửa vì bạn không thể dùng các công cụ debugging để điều tra nguyên nhân gốc rễ của <a id="_idIndexMarker1661"></a>vấn đề!

Một số bug threading trong các môi trường high-performance có thể được phân vào nhóm này.

Trong các phần sau, chúng ta sẽ nói về các nhóm bug khác nhau. Sau đó, chúng tôi giới thiệu các công cụ mà chúng ta dùng trong việc phát triển C/C++ hiện đại để điều tra bug.

<a id="_idParaDest-330"></a>

### Các nhóm bug

Có thể có hàng nghìn bug được báo cáo trong một phần mềm trong suốt những năm nó được khách hàng sử dụng. Nhưng nếu bạn nhìn vào các loại bug này, chúng không nhiều. Tiếp theo, bạn có thể thấy một danh sách các nhóm bug<a id="_idIndexMarker1662"></a> mà chúng tôi nghĩ là quan trọng và đòi hỏi các kỹ năng đặc biệt để xử lý. Chắc chắn, danh sách này chưa đầy đủ và có thể có các loại bug khác mà chúng tôi bỏ sót:

- **Logical bug** (bug logic): Để điều tra những bug này, bạn cần biết code và luồng thực thi <a id="_idIndexMarker1663"></a>của code. Để xem luồng thực thi thực sự<a id="_idIndexMarker1664"></a> của một chương trình, một debugger nên được gắn vào một process đang chạy. Chỉ khi đó, luồng thực thi mới có thể được *trace* và phân tích. *Execution log* cũng có thể được dùng khi debug một chương trình, đặc biệt khi các debugging symbol không có sẵn trong các binary cuối cùng hay một debugger không thể được dùng để gắn vào một instance thực sự đang chạy của chương trình.
- **Memory bug** (bug memory): Những bug này liên quan đến memory. Chúng thường xảy ra do dangling<a id="_idIndexMarker1665"></a> pointer, buffer overflow, double free, v.v. Những bug này nên được điều tra bằng một *memory profiler*, vốn đóng vai trò như một<a id="_idIndexMarker1666"></a> công cụ debugging để quan sát và giám sát memory.
- **Concurrency bug**: Các chương trình Multi-processing và multithreading luôn là <a id="_idIndexMarker1667"></a>nơi sinh ra một số bug hardest-to-solve (khó giải quyết nhất)<a id="_idIndexMarker1668"></a> được tìm thấy trong ngành công nghiệp phần mềm. Bạn cần các công cụ đặc biệt như *thread sanitizer* để phát hiện các vấn đề đặc biệt khó như race condition và data race.
- **Performance bug** (bug hiệu năng): Các phát triển mới có thể dẫn đến *suy giảm hiệu năng* hay bug hiệu năng. Những bug này nên được điều tra bằng việc kiểm thử thêm và tập trung hơn<a id="_idIndexMarker1669"></a> và thậm chí debug. Execution log, vốn chứa dữ liệu lịch sử có chú thích cho các lần<a id="_idIndexMarker1670"></a> thực thi trước, có thể hữu ích để tìm chính xác thay đổi hay các thay đổi đã khởi đầu sự suy giảm.

Trong các phần sau, chúng ta sẽ nói về các công cụ khác nhau được giới thiệu trong danh sách trên.

<a id="_idParaDest-331"></a>

### Debugger

Chúng ta đã nói về debugger, đặc biệt là `gdb`, trong *Chương 4*, *Cấu trúc memory của process (Process Memory Structure)*, và chúng ta đã dùng nó để nhìn vào bên trong<a id="_idIndexMarker1671"></a> memory của một process. Trong phần này, chúng ta sẽ xem xét debugger lần thứ hai và mô tả vai trò của chúng trong việc phát triển phần mềm hằng ngày. Sau đây là danh sách các tính năng phổ biến được hầu hết các debugger hiện đại cung cấp:

- Một debugger là một chương trình, và giống như mọi chương trình khác, nó chạy như một process. Process debugger có thể<a id="_idIndexMarker1672"></a> gắn vào một process khác khi được cho process ID đích.
- Một debugger có thể điều khiển việc thực thi các instruction trong process đích sau khi gắn thành công; do đó, người dùng có thể tạm dừng và tiếp tục luồng thực thi trong process đích, bằng một phiên debug tương tác.
- Debugger có thể nhìn vào bên trong memory được bảo vệ của một process. Chúng cũng có thể sửa đổi nội dung, do đó một developer có thể chạy cùng một nhóm instruction trong khi nội dung memory đang bị thay đổi một cách cố ý.
- Gần như mọi debugger được biết đến, nếu các debugging symbol được cung cấp khi biên dịch các source thành relocatable object file, đều có thể truy ngược các instruction về source code. Nói cách khác, khi bạn tạm dừng tại một instruction, bạn có thể đi tới dòng code tương ứng của nó trong source file.
- Nếu các debugging symbol không được cung cấp trong object file đích, debugger có thể hiển thị code disassembly của một instruction đích, điều vẫn có thể hữu ích.
- Một số debugger là language-specific (đặc thù ngôn ngữ), nhưng hầu hết thì không. Các ngôn ngữ **Java Virtual Machine** (**JVM**)<a id="_idIndexMarker1673"></a> như Java, Scala và Groovy phải dùng JVM debugger để xem và điều khiển phần bên trong của một instance JVM.
- Các ngôn ngữ thông dịch như Python cũng có debugger riêng, có thể được dùng để tạm dừng và điều khiển một script. Dù các debugger low-level như `gdb` vẫn dùng được cho JVM hay các ngôn ngữ scripting, chúng cố debug process JVM hay interpreter thay vì Java bytecode hay Python script đang thực thi.

Một danh sách các debugger có thể <a id="_idIndexMarker1675"></a>được tìm thấy trên Wikipedia tại link sau: https://en.wikipedia.org/wiki/List_of_debuggers. Từ danh sách này, các debugger sau là eye-catching (nổi bật):

1. **Advanced Debugger** (**adb**): Debugger mặc định<a id="_idIndexMarker1676"></a> của Unix. Nó có các hiện thực khác nhau dựa trên hiện thực Unix thực tế. Nó đã là debugger mặc định trên Solaris Unix.
2. **GNU Debugger** (**gdb**): Phiên bản GNU của Unix debugger, vốn là debugger mặc định trên<a id="_idIndexMarker1677"></a> nhiều hệ điều hành Unix-like bao gồm Linux.
3. **LLDB**: Một debugger chủ yếu<a id="_idIndexMarker1678"></a> được thiết kế để debug các object file được tạo ra bởi các compiler LLVM.
4. **Python Debugger**: Được dùng trong<a id="_idIndexMarker1679"></a> Python để debug Python script.
5. **Java Platform Debugger Architecture** (**JPDA**): Đây không phải là một debugger, mà nó là một API được thiết kế <a id="_idIndexMarker1680"></a>để debug các chương trình chạy bên trong một instance JVM.
6. **OllyDbg**: Một debugger<a id="_idIndexMarker1681"></a> và disassembler được dùng trong Microsoft Windows để debug các ứng dụng GUI.

1. **Microsoft Visual Studio Debugger**: Debugger chính <a id="_idIndexMarker1682"></a>được Microsoft Visual Studio dùng.

Ngoài `gdb`, người ta có thể dùng `cgdb`. Chương trình `cgdb` hiển thị một trình soạn thảo code trên terminal bên cạnh shell tương tác `gdb` cho phép bạn di chuyển giữa các dòng code dễ hơn.

Trong phần này, chúng ta đã thảo luận <a id="_idIndexMarker1683"></a>debugger như công cụ chính để điều tra một vấn đề. Trong phần tiếp theo, chúng ta sẽ nói về memory profiler, vốn sống còn cho việc điều tra các bug memory-related.

<a id="_idParaDest-332"></a>

### Memory checker

Đôi khi khi bạn gặp một bug memory-related hay một crash, một debugger một mình không thể giúp được nhiều. Bạn cần một<a id="_idIndexMarker1684"></a> công cụ khác có thể phát hiện các memory corruption và việc đọc hay ghi không hợp lệ vào các memory cell. Công cụ bạn cần là một *memory checker* hay một *memory profiler*. Nó có thể là một phần của một debugger, nhưng nó thường được cung cấp như một chương trình riêng và cách nó phát hiện các hành vi memory sai khác với một debugger.

Chúng ta thường có thể kỳ vọng các tính năng sau từ một memory checker:

- Báo cáo tổng<a id="_idIndexMarker1685"></a> lượng memory đã cấp phát, memory đã giải phóng, static memory đã dùng, cấp phát Heap, cấp phát Stack, v.v.
- Phát hiện Memory-leak, có thể được coi là tính năng quan trọng nhất mà một memory checker cung cấp.
- Phát hiện các thao tác đọc/ghi memory không hợp lệ như truy cập out-of-bound (ngoài biên) đối với buffer và mảng, ghi vào một vùng memory đã giải phóng, v.v.
- Phát hiện vấn đề *double free*. Nó xảy ra khi một chương trình cố giải phóng một vùng memory đã được giải phóng.

Cho đến giờ, chúng ta đã thấy các memory checker như *Memcheck* (một trong các công cụ của Valgrind) trong một số chương, đặc biệt là *Chương 5*, *Stack và Heap*. Chúng ta cũng đã thảo luận các loại memory checker và memory profiler khác nhau trong chương 5. Ở đây, chúng tôi muốn giải thích chúng lần nữa, và đưa ra thêm chi tiết về từng loại.

Các memory checker đều làm cùng một việc, nhưng kỹ thuật bên dưới mà chúng dùng để giám sát các thao tác memory có thể khác nhau. Do đó, chúng tôi nhóm chúng dựa trên kỹ thuật chúng dùng:

1. **Compile-time overriding**: Để dùng một memory checker áp dụng kỹ thuật này, bạn cần thực hiện một số thay đổi, thường là nhỏ, cho source code của mình như include một header file từ library của memory checker. Sau đó, bạn cần biên dịch lại<a id="_idIndexMarker1686"></a> các binary của mình. Đôi khi, cần link các binary với các library do memory checker cung cấp. Ưu điểm là sự sụt giảm hiệu năng của binary đang thực thi ít hơn các kỹ thuật khác, nhưng nhược điểm là bạn cần biên dịch lại <a id="_idIndexMarker1687"></a>các binary của mình. **LLVM AddressSanitizer** (**ASan**), Memwatch, Dmalloc và Mtrace là các memory profiler dùng kỹ thuật này.
2. **Link-time overriding**: Nhóm memory checker này giống nhóm memory checker trước, nhưng khác biệt là bạn không cần thay đổi source code. Thay vào đó, bạn chỉ phải link các binary thu được với các library được cung cấp từ memory checker và không có thay đổi nào được thực hiện đối với source code. Tiện ích *heap checker* trong *gperftools* có thể được dùng như một memory checker link-time.
3. **Runtime interception**: Một memory checker dùng kỹ thuật này nằm giữa chương trình và OS và cố chặn bắt và theo dõi mọi thao tác memory-related và báo cáo bất cứ khi nào thấy một hành vi sai hay truy cập không hợp lệ. Nó cũng có thể đưa ra báo cáo leak dựa trên tổng các khối memory đã cấp phát và đã giải phóng. Ưu điểm chính của việc dùng kỹ thuật này là bạn không cần biên dịch lại hay link lại chương trình để dùng memory checker. Nhược điểm lớn là chi phí phụ đáng kể mà nó đưa vào việc thực thi chương trình. Ngoài ra, memory footprint sẽ cao hơn nhiều so với khi chạy chương trình không có memory checker. Đây chắc chắn không phải là một môi trường lý tưởng để debug các chương trình high-performance và embedded. Công cụ Memcheck trong Valgrind có thể được dùng như một memory checker chặn bắt runtime. Những memory profiler này nên được dùng với một debug build của code base.

1. **Preloading library**: Một số memory checker dùng *inter-positioning* để bọc các hàm memory chuẩn. Do đó, bằng việc preload các shared library của memory checker bằng biến môi trường `LD_PRELOAD`, chương trình có thể dùng các wrapper function và memory checker có thể chặn bắt các lời gọi tới các hàm memory chuẩn bên dưới. Tiện ích *heap checker* trong *gperftools* có thể được dùng như vậy.

Thông thường, dùng một công cụ cụ thể cho mọi vấn đề memory là không đủ vì mỗi công cụ có ưu điểm và<a id="_idIndexMarker1689"></a> nhược điểm riêng, khiến công cụ đó đặc thù cho một ngữ cảnh nhất định.

Trong phần này, chúng ta đã đi qua các memory profiler có sẵn và phân loại chúng dựa trên kỹ thuật chúng dùng để ghi lại việc cấp phát và giải phóng memory. Trong phần tiếp theo, chúng ta sẽ nói về thread sanitizer.

<a id="_idParaDest-333"></a>

### Thread debugger

*Thread sanitizer* hay *thread debugger* là các chương trình được dùng để debug các chương trình multithreading nhằm tìm các vấn đề concurrency-related trong khi chương trình đang chạy. Một số<a id="_idIndexMarker1690"></a> vấn đề chúng có thể tìm thấy như sau:

- Data race, và các vị trí chính xác trong các thread khác nhau nơi các thao tác đọc/ghi đã gây ra data race
- Dùng sai threading API, đặc biệt là POSIX threading API trong các hệ thống POSIX-compliant
- Các deadlock khả dĩ
- Các vấn đề về thứ tự lock

Cả thread debugger lẫn memory checker đều có thể phát hiện các vấn đề dưới dạng *false positive* (dương tính giả). Nói cách khác, chúng có thể tìm thấy và báo cáo một số vấn đề nhưng sau khi được điều tra, hóa ra chúng không phải là vấn đề. Điều này thực sự phụ thuộc vào kỹ thuật mà những library này dùng để theo dõi các sự kiện, và đưa ra quyết định cuối cùng về sự kiện đó.

Trong danh sách sau, bạn có thể tìm thấy một số<a id="_idIndexMarker1692"></a> thread debugger well-known có sẵn:

- **Helgrind** (**từ Valgrind**): Đây là một công cụ khác bên trong Valgrind chủ yếu được dùng cho thread debugging. DRD cũng<a id="_idIndexMarker1693"></a> là một thread<a id="_idIndexMarker1694"></a> debugger khác thuộc bộ Valgri[nd toolkit. The list of features and differenc](http://valgrind.org/docs/manual/hg-manual.html)es ca[n be seen in these links: http://valgrind.org/d](http://valgrind.org/docs/manual/drd-manual.html)ocs/manual/hg-manual.html and http://valgrind.org/docs/manual/drd-manual.html (danh sách tính năng và khác biệt có thể được xem tại các link này). Giống như mọi công cụ khác từ<a id="_idIndexMarker1695"></a> Valgrind, dùng Helgrind không cần bạn sửa đổi source. Để chạy Helgrind, bạn cần chạy lệnh `valgrind --tool=helgrind [path-to-executable]`.
- **Intel Inspector**: Người kế nhiệm *Intel Thread Checker* này thực hiện việc phân tích các lỗi threading và các vấn đề memory<a id="_idIndexMarker1696"></a>. Do đó, nó vừa là một thread debugger vừa là một memory <a id="_idIndexMarker1697"></a>checker. Nó không miễn phí như Valgrind, và phải mua license phù hợp để dùng công cụ.
- **LLVM ThreadSanitizer** (**TSan**): Đây là một phần của bộ công cụ LLVM, và nó đi kèm với LLVM AddressSanitizer, được mô tả trong phần trước. Cần một số sửa đổi compile-time<a id="_idIndexMarker1698"></a> nhỏ <a id="_idIndexMarker1699"></a>để dùng debugger và code base nên được biên dịch lại.

Trong phần này, chúng ta đã thảo luận thread debugger và chúng tôi đã giới thiệu một số thread debugger có sẵn để debug các vấn đề threading. Trong phần tiếp theo, chúng tôi đưa ra các chương trình và bộ công cụ được dùng để tinh chỉnh hiệu năng của một chương trình.

<a id="_idParaDest-334"></a>

### Performance profiler

Đôi khi kết quả của một nhóm test non-functional chỉ ra một sự suy giảm hiệu năng. Có<a id="_idIndexMarker1700"></a> các công cụ chuyên biệt để điều tra nguyên nhân của sự suy giảm. Trong phần này, chúng ta sẽ xem nhanh các công cụ có thể được dùng để phân tích hiệu năng và tìm các nút thắt cổ chai hiệu năng.

Những performance debugger này thường cung cấp một tập con các tính năng sau:

- Thu thập thống kê <a id="_idIndexMarker1701"></a>về từng lời gọi hàm
- Cung cấp một *function call graph* được dùng để theo dõi các lời gọi hàm
- Thu thập thống kê memory-related cho mỗi lời gọi hàm
- Thu thập thống kê lock contention
- Thu thập thống kê cấp phát/giải phóng memory
- Phân tích cache, đưa ra thống kê sử dụng cache và chỉ ra các phần của code không cache-friendly
- Thu thập thống kê về các sự kiện threading và synchronization

Sau đây là danh sách các chương trình và bộ công cụ well-known nhất có thể được dùng để profile hiệu năng:

- **Google Performance Tools** (**gperftools**): Đây thực ra là một hiện thực `malloc` hiệu năng cao, nhưng như<a id="_idIndexMarker1702"></a> trang chủ của nó nói, nó cung cấp một số công cụ phân tích hiệu năng như *heap checker*, vốn đã được giới thiệu trong các phần trước như một memory profiler. Nó nên được link với binary cuối cùng để có thể dùng được.
- **Callgrind** (**thuộc Valgrind**): Chủ yếu thu thập thống kê về các lời gọi hàm và quan hệ caller/callee (bên gọi/bên được gọi) giữa hai hàm. Không cần thay đổi source code hay link các binary cuối cùng và nó có thể được dùng ngay lập tức, dĩ nhiên với một debug build.
- **Intel VTune**: Đây là một bộ profile hiệu năng từ Intel, là một tập hoàn chỉnh mọi tính năng được đưa ra trong danh sách trên. Phải mua license phù hợp để dùng nó.

<a id="_idParaDest-335"></a>

## Tóm tắt

Chương này là về unit testing và debugging các chương trình C. Tóm lại, trong chương này:

- Chúng ta đã nói về kiểm thử, và tại sao nó quan trọng với chúng ta với tư cách kỹ sư phần mềm và nhóm phát triển.
- Chúng ta cũng đã thảo luận các mức kiểm thử khác nhau như unit testing, integration testing và system testing.
- Kiểm thử chức năng và non-functional cũng đã được trình bày.
- Regression testing đã được giải thích.
- CMocka và Google Test, như hai testing library well-known cho C, đã được khám phá và một số ví dụ đã được đưa ra.
- Chúng ta đã nói về debugging và các loại bug khác nhau.
- Chúng ta đã thảo luận debugger, memory profiler, thread debugger và performance debugger, vốn có thể giúp chúng ta có một cuộc điều tra thành công hơn khi làm việc với một bug.

Chương tiếp theo là về các *build system* có sẵn cho các dự án C. Chúng ta sẽ thảo luận build system là gì và nó có thể mang lại những tính năng gì, điều rốt cuộc sẽ giúp chúng ta tự động hóa quá trình build một dự án C khổng lồ.
