<a id="_idParaDest-13"></a>

# Chương 01: Các tính năng thiết yếu (Essential Features)

*Extreme C* là cuốn sách sẽ cung cấp cho bạn cả kiến thức nền tảng lẫn nâng cao mà bạn cần để phát triển và bảo trì các application C thực tế. Nhìn chung, việc chỉ biết cú pháp của một ngôn ngữ lập trình là chưa đủ để viết nên những chương trình thành công với ngôn ngữ đó – và điều này càng có tầm quan trọng lớn hơn trong C so với hầu hết các ngôn ngữ khác. Vì vậy, chúng ta sẽ đề cập đến tất cả các khái niệm mà bạn cần để viết phần mềm tuyệt vời bằng C, từ các chương trình single process đơn giản đến các hệ thống multiple process phức tạp hơn.

Chương đầu tiên này chủ yếu liên quan đến các tính năng đặc thù của C mà bạn sẽ thấy cực kỳ hữu ích trong khi viết các chương trình C. Những tính năng này xuất hiện trong các tình huống mà bạn sẽ thường xuyên bắt gặp khi lập trình bằng C. Mặc dù có rất nhiều cuốn sách và bài hướng dẫn tuyệt vời về lập trình C giải thích mọi thứ chi tiết và bao quát gần như mọi khía cạnh của cú pháp C, nhưng việc xem xét một số tính năng then chốt ở đây trước khi chúng ta đi sâu hơn vào C sẽ rất hữu ích.

Những tính năng này bao gồm các chỉ thị preprocessor, variable pointer, function pointer và structure. Tất nhiên, chúng rất phổ biến trong các ngôn ngữ lập trình hiện đại hơn ngày nay, và thật dễ dàng để tìm thấy các thành phần tương đương của chúng trong Java, C#, Python, vân vân. Ví dụ, *reference* trong Java có thể được coi là các phần tử tương tự như variable pointer trong C. Những tính năng này cùng các khái niệm liên quan của chúng mang tính nền tảng đến mức, nếu không có chúng, không một phần mềm nào có thể tiếp tục hoạt động, ngay cả khi nó có thể được thực thi! Ngay cả một chương trình "hello world" đơn giản cũng không thể hoạt động nếu không nạp một số shared library vốn đòi hỏi việc sử dụng *function pointer*!

Vì vậy, bất cứ khi nào bạn nhìn thấy những thứ như đèn giao thông, máy tính trung tâm trên ô tô của bạn, lò vi sóng trong nhà bếp, hệ điều hành trên điện thoại thông minh, hay có lẽ bất kỳ thiết bị nào khác mà bạn thường không nghĩ tới, tất cả chúng đều có các phần mềm được viết bằng C.

Cuộc sống của chúng ta ngày nay đã chịu tác động to lớn bởi sự ra đời của ngôn ngữ lập trình C, và thế giới của chúng ta sẽ rất khác nếu không có C.

Chương này tập trung vào các tính năng thiết yếu và cơ chế cần thiết để viết code C ở mức độ chuyên gia, đồng thời chứa một bộ sưu tập các tính năng được chọn lọc kỹ càng để chúng ta nghiên cứu chuyên sâu. Chúng ta sẽ khám phá các chủ đề sau:

- **Các chỉ thị preprocessor, macro và conditional compilation**: Preprocessing là một trong những tính năng của C mà bạn không thể dễ dàng tìm thấy trong các ngôn ngữ lập trình khác. Preprocessing mang lại rất nhiều lợi thế, và chúng ta sẽ đi sâu vào một số ứng dụng thú vị của nó, bao gồm *macro* và *chỉ thị có điều kiện (conditional directive)*.
- **Variable pointer**: Phần này deep-dives vào *variable pointer* và các ứng dụng của chúng. Chúng ta cũng sẽ tìm thấy một số hiểu biết hữu ích bằng cách xem xét một số sai sót có thể phát sinh do việc sử dụng sai variable pointer.
- **Function**: Phần này của chương là một bước đi sâu vào mọi thứ chúng ta biết về function, vượt xa khỏi cú pháp đơn thuần của chúng. Trên thực tế, cú pháp là phần dễ dàng! Trong phần này, chúng ta sẽ xem xét các function như những khối xây dựng (building block) để viết code *procedural*. Phần này cũng nói về *cơ chế gọi function (function call mechanism)* và cách một function nhận các đối số của nó từ function gọi (caller function).
- **Function pointer**: Chắc chắn rằng, *function pointer* là một trong những tính năng quan trọng nhất của C. Một function<a id="_idIndexMarker000"></a> pointer là một pointer trỏ tới một function hiện có thay vì trỏ tới một biến. Khả năng lưu trữ một pointer trỏ tới một logic hiện có có tầm quan trọng sâu sắc trong thiết kế thuật toán, và đó là lý do tại sao chúng tôi dành riêng một phần cho chủ đề này. Function pointer xuất hiện trong một loạt các ứng dụng từ việc nạp dynamic library đến *polymorphism*, và chúng ta sẽ thấy function pointer xuất hiện nhiều hơn nữa trong hai chương tiếp theo.
- **Structure**: Structure trong C có thể có cú pháp đơn giản và truyền tải một ý tưởng đơn giản, nhưng chúng là những khối xây dựng chính để viết code *well-organized* và mang tính *object-oriented* hơn. Tầm quan trọng của chúng, cùng với function pointer, đơn giản là không thể phóng đại! Trong phần cuối cùng của chương này, chúng ta sẽ xem lại tất cả những điều bạn cần biết về structure trong C cùng những thủ thuật xung quanh chúng.

Các tính năng thiết yếu của C cùng những khái niệm xoay quanh chúng đóng vai trò then chốt trong hệ sinh thái Unix, và chúng đã giúp C trở thành một công nghệ quan trọng và có tầm ảnh hưởng bất chấp tuổi đời lâu năm và cú pháp khắt khe của nó. Chúng ta sẽ nói nhiều hơn về ảnh hưởng lẫn nhau giữa C và Unix trong các chương sắp tới. Bây giờ, hãy bắt đầu chương đầu tiên này bằng việc nói về các chỉ thị preprocessor.

> Trước khi đọc chương này, hãy lưu ý rằng bạn nên đã quen thuộc với C. Hầu hết các ví dụ trong chương này đều khá căn bản, nhưng bạn rất nên nắm vững cú pháp C trước khi chuyển sang các chương khác. Để thuận tiện cho bạn, dưới đây là danh sách các chủ đề mà bạn nên quen thuộc trước khi tiếp tục với cuốn sách này:
>
> Kiến thức chung về computer architecture — bạn nên biết về memory, CPU, các thiết bị ngoại vi và đặc tính của chúng, cũng như cách một chương trình tương tác với các thành phần này trong một hệ thống máy tính.
>
> Kiến thức chung về lập trình — bạn nên biết thuật toán là gì, cách lần vết quá trình thực thi của nó ra sao, source code là gì, binary number là gì và các phép toán số học liên quan đến chúng hoạt động như thế nào.
>
> Quen thuộc với việc sử dụng Terminal và các lệnh shell cơ bản trong một hệ điều hành Unix-like như Linux hoặc macOS.
>
> Kiến thức trung cấp về các chủ đề lập trình như câu lệnh điều kiện, các loại vòng lặp khác nhau, structure hoặc class trong ít nhất một ngôn ngữ lập trình, pointer trong C hoặc C++, function, vân vân.
>
> Kiến thức cơ bản về object-oriented programming — điều này không bắt buộc vì chúng tôi sẽ giải thích chi tiết về object-oriented programming, nhưng kiến thức đó sẽ giúp bạn hiểu rõ hơn khi đọc các chương trong phần thứ ba của cuốn sách; *Object Orientation*.

<a id="_idParaDest-14"></a>

## Các chỉ thị preprocessor (Preprocessor directives)

*Preprocessing* là một tính năng<a id="_idIndexMarker001"></a> mạnh mẽ trong C. Chúng tôi sẽ đề cập đầy đủ về nó trong *Chương 2*, *Biên dịch và Liên kết (Compilation and Linking)*, nhưng ngay bây giờ hãy<a id="_idIndexMarker002"></a> định nghĩa preprocessing là một thứ cho phép bạn can thiệp kỹ thuật và sửa đổi source code của mình trước khi chuyển nó tới compiler. Điều này có nghĩa là C compilation pipeline có nhiều hơn ít nhất một bước so với các ngôn ngữ khác. Trong các ngôn ngữ lập trình khác, source code được gửi trực tiếp đến compiler, nhưng trong C và C++, trước tiên nó phải được tiền xử lý (preprocessed).

Bước bổ sung này đã làm cho C (và C++) trở thành một ngôn ngữ lập trình độc nhất vô nhị theo nghĩa là một lập trình viên C có thể thay đổi source code của họ một cách hiệu quả trước khi chuyển giao cho compiler. Tính năng này không có trong hầu hết các ngôn ngữ lập trình higher-level.

Mục đích của preprocessing là loại bỏ các chỉ thị tiền xử lý (preprocessing directive) và thay thế chúng bằng code C tương đương được sinh ra, đồng thời chuẩn bị một source code cuối cùng sẵn sàng để gửi tới compiler.

Hành vi của C preprocessor có thể được điều khiển và định hướng bằng một tập hợp các *chỉ thị (directive)*. Các chỉ thị C <a id="_idIndexMarker003"></a>là các dòng code bắt đầu bằng ký tự `#` trong cả header file và source file. Những dòng này <a id="_idIndexMarker004"></a>chỉ có ý nghĩa đối với C preprocessor và không bao giờ có ý nghĩa đối với C compiler. Có nhiều chỉ thị khác nhau trong C, nhưng một số trong đó rất quan trọng, đặc biệt là các chỉ thị dùng để định nghĩa macro và các chỉ thị dùng cho conditional compilation.

Trong phần tiếp theo, chúng tôi sẽ giải thích về macro và đưa ra nhiều ví dụ minh họa các ứng dụng khác nhau của chúng. Chúng tôi cũng phân tích sâu hơn để tìm ra ưu điểm và nhược điểm của chúng.

<a id="_idParaDest-15"></a>

### Macro

Có rất nhiều lời đồn<a id="_idIndexMarker005"></a> liên quan đến macro trong C. Có người nói rằng chúng làm cho source code của bạn quá phức tạp và khó đọc hơn. Người khác lại nói rằng bạn sẽ gặp rắc rối trong quá trình<a id="_idIndexMarker006"></a> debugging application nếu bạn sử dụng macro trong code của mình. Bản thân bạn có thể đã từng nghe một số nhận định như vậy. Nhưng chúng đúng đến mức nào? Macro có phải là thứ tồi tệ cần phải tránh xa hay không? Hay chúng có mang lại những lợi ích nhất định cho project của bạn?

Thực tế là bạn sẽ tìm thấy macro trong bất kỳ project C well-known nào. Để chứng minh, hãy tải về một project C well-known như Apache HTTP Server và thực hiện lệnh grep cho `#define`. Bạn sẽ thấy danh sách các file có định nghĩa macro. Đối với bạn với tư cách là một C developer, không có cách nào để trốn tránh macro. Ngay cả khi bản thân bạn không sử dụng chúng, bạn rất có thể sẽ nhìn thấy chúng trong code của người khác. Do đó, bạn cần học xem chúng là gì và cách xử lý chúng ra sao.

> Lệnh `grep` đề cập đến một chương trình tiện ích shell <a id="_idIndexMarker007"></a>chuẩn trong các hệ điều hành Unix-like dùng để tìm kiếm một pattern trong một luồng ký tự. Nó có thể được sử dụng để tìm kiếm một đoạn văn bản hoặc một pattern trong nội dung của tất cả các file nằm trong một đường dẫn nhất định.

Macro có một số <a id="_idIndexMarker008"></a>ứng dụng và bạn có thể thấy một số trong đó như sau:

- Định nghĩa một hằng số
- Sử dụng như một hàm thay vì viết một hàm C
- Loop unrolling
- Header guard
- Code generation
- Conditional compilation

Mặc dù có nhiều ứng dụng tiềm năng khác của macro, chúng tôi sẽ tập trung vào những ứng dụng nêu trên trong các phần sau.

<a id="_idParaDest-16"></a>

#### Định nghĩa một macro

Macro được<a id="_idIndexMarker009"></a> định nghĩa bằng chỉ thị `#define`. Mỗi macro có một tên và một danh sách các tham số có thể có. Nó cũng có một *giá trị (value)* sẽ được thay thế cho *tên (name)* của nó trong giai đoạn tiền xử lý thông qua một bước gọi là *macro expansion*. Một macro cũng có thể bị *hủy định nghĩa (undefined)* bằng chỉ thị `#undef`. Hãy bắt đầu với một ví dụ đơn giản, *ví dụ 1.1*:

```
#define ABC 5
int main(int argc, char** argv) {
  int x = 2;
  int y = ABC;
  int z = x + y;
  return 0;
}
```

*Code Box 1-1 [ExtremeC_examples_chapter1_1.c]: Định nghĩa một macro*

Trong code box trên, `ABC` không phải là một biến chứa giá trị số nguyên và cũng không phải là một hằng số nguyên. Trên thực tế, nó là một macro có tên là `ABC` và giá trị tương ứng của nó là `5`. Sau giai đoạn macro expansion, đoạn code kết quả có thể được gửi tới C compiler trông tương tự như đoạn code chúng ta thấy dưới đây:

```
int main(int argc, char** argv) {
  int x = 2;
  int y = 5;
  int z = x + y;
  return 0;
}
```

*Code Box 1-2: Code được sinh ra cho ví dụ 1.1 sau giai đoạn mở rộng macro*

Đoạn code trong *Code Box 1-2* có cú pháp C hợp lệ, và bây giờ compiler có thể tiếp tục và biên dịch nó. Trong ví dụ trước, preprocessor đã thực hiện macro expansion, và như một phần của công việc đó, <a id="_idIndexMarker010"></a>preprocessor chỉ đơn giản thay thế tên của macro bằng giá trị của nó. Preprocessor cũng đã loại bỏ các comment ở các dòng đầu tiên.

Bây giờ chúng ta hãy xem xét một ví dụ khác, *ví dụ 1.2*:

```
#define ADD(a, b) a + b
int main(int argc, char** argv) {
  int x = 2;
  int y = 3;
  int z = ADD(x, y);
  return 0;
}
```

*Code Box 1-3 [ExtremeC_examples_chapter1_2.c]: Định nghĩa một function-like macro*

Trong code box trên, tương tự như *ví dụ 1.1*, `ADD` không phải là một hàm. Nó chỉ là một *function-like macro* chấp nhận các đối số. Sau khi tiền xử lý, đoạn code thu được sẽ như thế này:

```
int main(int argc, char** argv) {
  int x = 2;
  int y = 3
  int z = x + y;
  return 0;
}
```

*Code Box 1-4: Ví dụ 1.2 sau giai đoạn tiền xử lý và mở rộng macro*

Như bạn có thể thấy trong code box trên, quá trình mở rộng (expansion) đã diễn ra như sau. Đối số `x` được sử dụng làm tham số `a` được thay thế vào tất cả các vị trí xuất hiện của `a` trong giá trị của macro. Điều này cũng tương tự đối với tham số `b` cùng đối số `y` tương ứng của nó. Sau đó, phép thay thế cuối cùng diễn ra, và chúng ta nhận được `x + y` thay vì `ADD(a, b)` trong code đã tiền xử lý.

Vì các function-like macro có thể<a id="_idIndexMarker011"></a> nhận các đối số đầu vào, chúng có thể mô phỏng các hàm C. Nói cách khác, thay vì đưa một đoạn logic thường dùng vào một hàm C, bạn có thể đặt tên cho logic đó dưới dạng một function-like macro và sử dụng macro đó thay thế.

Bằng cách này, các lần xuất hiện của macro sẽ được thay thế bằng logic thường dùng, như một phần của giai đoạn preprocessing, và không cần thiết phải đưa vào một hàm C mới. Chúng tôi sẽ thảo luận thêm về điều này và so sánh hai cách tiếp cận.

Macro chỉ tồn tại trước giai đoạn compilation. Điều này có nghĩa là, về mặt lý thuyết, compiler hoàn toàn không biết gì về các macro. Đây là một điểm rất quan trọng cần ghi nhớ nếu bạn định sử dụng macro thay cho hàm. Compiler biết mọi thứ về một hàm vì nó là một phần của ngữ pháp C, được phân tích cú pháp và được lưu giữ trong *parse tree*. Nhưng một macro chỉ là một chỉ thị C preprocessor mà chỉ có bản thân preprocessor biết đến.

Macro cho phép bạn *sinh (generate)* code trước khi biên dịch. Trong các ngôn ngữ lập trình khác như Java, bạn cần sử dụng một *code generator* để đáp ứng mục đích này. Chúng tôi sẽ đưa ra các ví dụ liên quan đến ứng dụng này của macro.

Các C compiler hiện đại đều nhận biết được các chỉ thị C preprocessor. Bất chấp quan niệm phổ biến cho rằng chúng không biết gì về giai đoạn preprocessing, trên thực tế chúng thực sự biết. Các C compiler hiện đại biết về source code trước khi bước vào giai đoạn preprocessing. Hãy xem đoạn code sau:

```
#include <stdio.h>
#define CODE \
printf("%d\n", i);
int main(int argc, char** argv) {
 CODE
 return 0;
}
```

*Code Box 1-5 [example.c]: Định nghĩa macro gây ra lỗi undeclared identifier*

Nếu bạn biên dịch đoạn code trên bằng `clang` trong macOS, output sau đây sẽ xuất hiện:

```
$ clang example.c
code.c:7:3: error: use of undeclared identifier 'i'
CODE
^
code.c:4:16: note: expanded from macro 'CODE'
printf("%d\n", i);
               ^
1 error generated.
$
```

*Shell Box 1-1: Output của quá trình biên dịch tham chiếu tới định nghĩa macro*

Như bạn thấy, compiler đã tạo ra một thông báo lỗi chỉ chính xác vào dòng mà macro được định nghĩa.

Như một ghi chú bên lề, trong hầu hết các<a id="_idIndexMarker012"></a> compiler hiện đại, bạn có thể xem kết quả tiền xử lý ngay trước khi biên dịch. Ví dụ, khi sử dụng `gcc` hoặc `clang`, bạn có thể dùng tùy chọn `-E` để xuất ra đoạn code sau khi tiền xử lý. Shell box sau đây minh họa cách sử dụng tùy chọn `-E`. Lưu ý rằng output không được hiển thị đầy đủ:

```
$ clang -E example.c
# 1 "sample.c"# 1 "<built-in>" 1
# 1 "<built-in>" 3
# 361 "<built-in>" 3
...
# 412 "/Library/Developer/CommandLineTools/SDKs/MacOSX10.14.sdk/usr/include/stdio.h" 2 3 4
# 2 "sample.c" 2
...
int main(int argc, char** argv) {
 printf("%d\n", i);
 return 0;
}
$
```

*Shell Box 1-2: Code của example.c sau giai đoạn tiền xử lý*

Bây giờ chúng ta đi đến một định nghĩa quan trọng. Một *translation unit* (hoặc một *compilation unit*) là đoạn code C đã được tiền xử lý và sẵn sàng để chuyển giao cho compiler.

Trong một translation unit, tất cả các chỉ thị đều được thay thế bằng nội dung include hoặc các macro expansion, và một đoạn code C phẳng, dài đã được tạo ra.

Bây giờ khi bạn đã hiểu biết nhiều hơn về macro, chúng ta hãy cùng làm việc trên một số ví dụ khó hơn. Chúng sẽ cho bạn thấy sức mạnh cũng như sự nguy hiểm của macro. Theo tôi, lập trình extreme xử lý những thứ nguy hiểm và tinh tế theo một cách thức điêu luyện, và đây chính xác là bản chất của C.

Ví dụ tiếp theo là một ví dụ<a id="_idIndexMarker013"></a> thú vị. Hãy chú ý đến cách các macro được sử dụng tuần tự để tạo ra một vòng lặp:

```
#include <stdio.h>
#define PRINT(a) printf("%d\n", a);
#define LOOP(v, s, e) for (int v = s; v <= e; v++) {
#define ENDLOOP }
int main(int argc, char** argv) {
  LOOP(counter, 1, 10)
    PRINT(counter)
  ENDLOOP
  return 0;
}
```

*Code Box 1-6 [ExtremeC_examples_chapter1_3.c]: Dùng macro để sinh ra một vòng lặp*

Như bạn thấy trong code box trên, đoạn code bên trong hàm `main` hoàn toàn không phải là code C hợp lệ theo bất kỳ cách nào! Nhưng sau khi tiền xử lý, chúng ta nhận được một source code C chuẩn xác biên dịch mà không gặp bất kỳ vấn đề gì. Dưới đây là kết quả tiền xử lý:

```
...
... content of stdio.h …
...
int main(int argc, char** argv) {
  for (int counter = 1; counter <= 10; counter++) {
    printf("%d\n", counter);
  }
  return 0;
}
```

*Code Box 1-7: Ví dụ 1.3 sau giai đoạn tiền xử lý*

Trong *Code Box 1-6*, trong hàm `main`, chúng ta chỉ vừa sử dụng một tập hợp các instruction khác biệt và mang phong cách not C-looking để viết thuật toán của mình. Sau đó sau khi tiền xử lý, trong *Code Box 1-7*, chúng ta có được một chương trình C hoạt động đầy đủ chức năng và chính xác. Đây là một ứng dụng quan trọng của macro: định nghĩa một **domain specific language** (**DSL** - ngôn ngữ đặc thù miền) mới và viết code bằng ngôn ngữ đó.

DSL rất hữu ích trong các phần khác nhau của một project; ví dụ, chúng được sử dụng rất nhiều trong các testing framework như Google Test framework (gtest), nơi DSL được dùng để viết các assertion, expectation và kịch bản kiểm thử (test scenario).

Chúng ta nên lưu ý rằng chúng ta không có bất kỳ chỉ thị C nào trong đoạn code đã tiền xử lý cuối cùng. Điều này có nghĩa là chỉ thị `#include` trong *Code Box 1-6* đã được thay thế bằng nội dung của file mà nó<a id="_idIndexMarker014"></a> đang tham chiếu đến. Đó là lý do tại sao bạn nhìn thấy nội dung của header file `stdio.h` (mà chúng tôi đã thay thế bằng dấu ba chấm) trong *Code Box 1-7* ở trước hàm `main`.

Bây giờ chúng ta hãy xem xét ví dụ tiếp theo, *ví dụ 1.4*, ví dụ này giới thiệu hai toán tử mới liên quan đến các tham số macro: toán tử `#` và `##`:

```
#include <stdio.h>
#include <string.h>
#define CMD(NAME) \
  char NAME ## _cmd[256]  = ""; \
  strcpy(NAME ## _cmd, #NAME);
int main(int argc, char** argv) {
  CMD(copy)
  CMD(paste)
  CMD(cut)
  char cmd[256];
  scanf("%s", cmd);
  if (strcmp(cmd, copy_cmd) == 0) {
    // ...
  }
  if (strcmp(cmd, paste_cmd) == 0) {
    // ...
  }
  if (strcmp(cmd, cut_cmd) == 0) {
    // ...
  }
  return 0;
}
```

*Code Box 1-8 [ExtremeC_examples_chapter1_4.c]: Dùng toán tử # và ## trong một macro*

Trong khi mở rộng macro, toán tử `#` sẽ biến tham số thành dạng chuỗi của nó được bao quanh bởi một cặp dấu ngoặc kép. Ví dụ, trong đoạn code trên, toán tử `#` được sử dụng trước tham số `NAME` sẽ biến nó thành `"copy"` trong đoạn code đã tiền xử lý.

Toán tử `##` có một ý nghĩa khác. Nó chỉ đơn thuần nối các tham số với những phần tử khác trong định nghĩa <a id="_idIndexMarker015"></a>macro và thường dùng để tạo nên tên biến. Dưới đây là source code đã tiền xử lý cuối cùng cho *ví dụ 1.4*:

```
...
... content of stdio.h ...
...
... content of string.h ...
...
int main(int argc, char** argv) {
  char copy_cmd[256] = ""; strcpy(copy_cmd, "copy");
  char paste_cmd[256] = ""; strcpy(paste_cmd, "paste");
  char cut_cmd[256] = ""; strcpy(cut_cmd, "cut");
  char cmd[256];
  scanf("%s", cmd);
  if (strcmp(cmd, copy_cmd) == 0) {
  }
  if (strcmp(cmd, paste_cmd) == 0) {
  }
  if (strcmp(cmd, cut_cmd) == 0) {
  }
  return 0;
}
```

*Code Box 1-9: Ví dụ 1.4 sau giai đoạn tiền xử lý*

Việc so sánh source code trước và sau khi tiền xử lý giúp bạn nhận ra các toán tử `#` và `##` được áp dụng vào các đối số của macro như thế nào. Lưu ý rằng, trong đoạn code đã tiền xử lý cuối cùng, tất cả các dòng được mở rộng từ cùng một định nghĩa macro đều nằm trên cùng một dòng.

> Việc tách các macro dài thành nhiều dòng là một thực hành tốt, nhưng đừng quên sử dụng \\ (một dấu gạch chéo ngược) để báo cho preprocessor biết rằng phần còn lại của định nghĩa nằm ở dòng tiếp theo. Lưu ý rằng \\ không được thay thế bằng một ký tự *newline*. Thay vào đó, nó là một dấu hiệu cho biết rằng dòng tiếp theo là sự tiếp nối của cùng một định nghĩa macro.

Bây giờ chúng ta hãy nói về một loại<a id="_idIndexMarker016"></a> macro khác. Phần tiếp theo sẽ nói về các *variadic macro*, những macro có thể chấp nhận một số lượng đối số thay đổi.

<a id="_idParaDest-17"></a>

#### Variadic macro

Ví dụ tiếp theo, <a id="_idIndexMarker017"></a>*ví dụ 1.5*, dành riêng cho variadic macro, vốn có thể chấp nhận<a id="_idIndexMarker018"></a> một số lượng đối số đầu vào thay đổi. Đôi khi cùng một variadic macro chấp nhận 2 đối số, đôi khi 4 đối số, và đôi khi 7 đối số. Variadic macro rất tiện lợi khi bạn không chắc chắn về số lượng đối số trong các lần sử dụng khác nhau của cùng một macro. Một ví dụ đơn giản được đưa ra như sau:

```
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define VERSION "2.3.4"
#define LOG_ERROR(format, ...) \
  fprintf(stderr, format, __VA_ARGS__)
int main(int argc, char** argv) {
  if (argc < 3) {
    LOG_ERROR("Invalid number of arguments for version %s\n.", VERSION);
    exit(1);
  }
  if (strcmp(argv[1], "-n") != 0) {
    LOG_ERROR("%s is a wrong param at index %d for version %s.", argv[1], 1, VERSION);
    exit(1);
  }
  // ...
  return 0;
}
```

*Code Box 1-10 [ExtremeC_examples_chapter1_5.c]: Định nghĩa và cách dùng một variadic macro*

Trong code box trên, bạn thấy một identifier mới: `__VA_ARGS__`. Nó là một chỉ dấu báo cho preprocessor biết cần thay thế nó bằng tất cả các đối số đầu vào còn lại mà chưa được gán cho bất kỳ tham số nào.

Trong ví dụ trước, ở lần sử dụng thứ hai của `LOG_ERROR`, theo định nghĩa của macro, các đối số `argv[1]`, `1` và `VERSION` là những đối số đầu vào *chưa* được gán cho bất kỳ tham số nào. Vì vậy, chúng sẽ được sử dụng vào vị trí của `__VA_ARGS__` trong khi mở rộng macro.

Như một ghi chú bên lề, hàm `fprintf` ghi dữ liệu vào một *file descriptor*. Trong *ví dụ 1.5*, file descriptor là `stderr`, vốn là *error stream* của process. Ngoài ra, hãy lưu ý dấu chấm phẩy kết thúc sau <a id="_idIndexMarker020"></a>mỗi lần sử dụng `LOG_ERROR`. Nó là bắt buộc bởi vì bản thân macro không cung cấp chúng trong định nghĩa của mình và lập trình viên *phải* thêm dấu chấm phẩy đó để làm cho đoạn code đã tiền xử lý cuối cùng đúng về mặt cú pháp.

Đoạn code sau đây là output cuối cùng sau khi đi qua C preprocessor:

```
...
... content of stdio.h ...
...
... content of stdlib.h ...
...
... content of string.h ...
...
int main(int argc, char** argv) {
  if (argc < 3) {
    fprintf(stderr, "Invalid number of arguments for version %s\n.", "2.3.4");
    exit(1);
  }
  if (strcmp(argv[1], "-n") != 0) {
    fprintf(stderr, "%s is a wrong param at index %d for version %s.", argv[1], 1, "2.3.4");
    exit(1);
  }
  // ...
  return 0;
}
```

*Code Box 1-11: Ví dụ 1.5 sau giai đoạn tiền xử lý*

Ví dụ tiếp theo, *ví dụ 1.6*, là một cách sử dụng nâng cao của variadic macro nhằm cố gắng mô phỏng một vòng lặp. Có một ví dụ well-known về điều này. Trước khi có `foreach` trong C++, framework *boost* đã (và hiện vẫn đang) cung cấp hành vi `foreach` bằng cách sử dụng một số macro.

Trong liên kết sau đây, bạn có thể thấy macro `BOOST_FOREACH` được định nghĩa là phần tử cuối cùng trong header file: [https://www.boost.org/doc/libs/1_35_0/boost/foreach.hpp](https://www.boost.org/doc/libs/1_35_0/boost/foreach.hpp). Nó được sử dụng để lặp qua một boost collection, và bản chất nó thực sự là một function-like macro.

Ví dụ tiếp theo của chúng tôi, *ví dụ 1.6*, nói về một vòng lặp đơn giản hoàn toàn không thể so sánh với `foreach` của boost, nhưng nó vẫn mang lại cho bạn ý niệm về cách sử dụng variadic macro để lặp lại một số câu lệnh:

```
#include <stdio.h>
#define LOOP_3(X, ...) \
  printf("%s\n", #X);
#define LOOP_2(X, ...) \
  printf("%s\n", #X); \
  LOOP_3(__VA_ARGS__)
#define LOOP_1(X, ...) \
  printf("%s\n", #X); \
  LOOP_2(__VA_ARGS__)
#define LOOP(...) \
  LOOP_1(__VA_ARGS__)
int main(int argc, char** argv) {
  LOOP(copy paste cut)
  LOOP(copy, paste, cut)
  LOOP(copy, paste, cut, select)
  return 0;
}
```

*Code Box 1-12 [ExtremeC_examples_chapter1_6.c]: Dùng variadic macro để mô phỏng một vòng lặp*

Trước khi bắt đầu giải thích<a id="_idIndexMarker022"></a> ví dụ, chúng ta hãy xem xét đoạn code cuối cùng sau khi tiền xử lý. Khi đó, việc giải thích những gì đã diễn ra sẽ dễ dàng hơn:

```
...
... content of stdio.h ...
...
int main(int argc, char** argv) {
  printf("%s\n", "copy paste cut"); printf("%s\n", ""); printf("%s\n", "");
  printf("%s\n", "copy"); printf("%s\n", "paste"); printf("%s\n", "cut");
  printf("%s\n", "copy"); printf("%s\n", "paste"); printf("%s\n", "cut");
  return 0;
}
```

*Code Box 1-13: Ví dụ 1.6 sau giai đoạn tiền xử lý*

Nếu quan sát kỹ đoạn code đã tiền xử lý, bạn sẽ thấy rằng macro `LOOP` đã được mở rộng thành nhiều lệnh `printf` thay vì các lệnh lặp như `for` hoặc `while`. Lý do tại sao lại như vậy là quá rõ ràng, và điều đó xuất phát từ thực tế là preprocessor không tự viết code C thông minh cho chúng ta. Nó ở đó chỉ để thay thế các macro bằng những chỉ dẫn do chúng ta đưa ra.

Cách duy nhất để tạo ra một vòng lặp bằng macro chỉ đơn thuần là đặt các lệnh lặp nối tiếp nhau, như một số lệnh riêng biệt. Điều này có nghĩa là một vòng lặp macro đơn giản với 1000 lần lặp sẽ được thay thế bằng 1000 lệnh trong C và chúng ta sẽ không có bất kỳ vòng lặp C thực sự nào trong đoạn code cuối cùng.

Kỹ thuật trên sẽ dẫn đến<a id="_idIndexMarker023"></a> kích thước binary lớn, điều có thể được coi là một nhược điểm. Nhưng việc đặt các lệnh nối tiếp nhau thay vì đặt chúng vào một vòng lặp, vốn được gọi là *loop unrolling*, lại có những ứng dụng riêng, đòi hỏi mức hiệu năng chấp nhận được trong các môi trường bị hạn chế và môi trường high-performance. Theo những gì chúng tôi đã giải thích cho đến nay, dường như việc loop unrolling bằng cách sử dụng macro là một trade-off giữa kích thước binary và hiệu năng. Chúng tôi sẽ nói nhiều hơn về điều này trong phần sắp tới.

Còn một lưu ý nữa về ví dụ trước. Như bạn thấy, các cách sử dụng khác nhau của macro `LOOP` trong hàm `main` đã tạo ra các kết quả khác nhau. Trong lần sử dụng đầu tiên, chúng ta truyền `copy paste cut` mà không có bất kỳ dấu phẩy nào giữa các từ. Preprocessor chấp nhận nó như một đầu vào duy nhất, do đó vòng lặp được mô phỏng chỉ có một lần lặp.

Trong lần sử dụng thứ hai, đầu vào `copy, paste, cut` được truyền vào với các từ phân tách bằng dấu phẩy. Giờ đây, preprocessor coi chúng là ba đối số khác nhau; vì vậy, vòng lặp được mô phỏng có ba lần lặp. Điều này thấy rõ từ *Shell Box 1-3* dưới đây.

Trong lần sử dụng thứ ba, chúng ta truyền bốn giá trị, `copy, paste, cut, select,` nhưng chỉ có ba giá trị trong số đó được xử lý. Như bạn thấy, đoạn code đã tiền xử lý hoàn toàn giống hệt như lần sử dụng <a id="_idIndexMarker025"></a>thứ hai. Đó là do thực tế là các macro lặp của chúng ta chỉ có khả năng xử lý danh sách tối đa ba phần tử. Các phần tử dư thừa sau phần tử thứ ba sẽ bị bỏ qua.

Lưu ý rằng điều này không tạo ra lỗi biên dịch vì không có điều gì sai sót được sinh ra trong code C cuối cùng, nhưng các macro của chúng ta bị giới hạn về số lượng phần tử mà chúng có thể xử lý:

```
$ gcc ExtremeC_examples_chapter1_6.c
$ ./a.out
copy paste cut
copy
paste
cut
$
```

*Shell Box 1-3: Biên dịch và output của ví dụ 1.6*

<a id="_idParaDest-18"></a>

#### Ưu điểm và nhược điểm của macro

Hãy bắt đầu cuộc<a id="_idIndexMarker026"></a> thảo luận bằng cách nói một chút về thiết kế phần mềm. Định nghĩa các macro và ghép nối chúng lại với nhau là một nghệ thuật, và đôi khi là một nghệ thuật gây nghiện! Bạn bắt đầu xây dựng đoạn code<a id="_idIndexMarker027"></a> tiền xử lý kỳ vọng trong tâm trí mình ngay cả trước khi định nghĩa bất kỳ macro nào và dựa vào đó bạn định nghĩa các macro của mình. Vì đây là một cách dễ dàng để nhân bản code và nghịch ngợm với nó, nó có thể bị lạm dụng quá mức. Việc lạm dụng macro có thể không phải là vấn đề lớn đối với bạn, nhưng nó có thể là vấn đề đối với các đồng đội của bạn. Nhưng tại sao lại như vậy?

Macro có một đặc tính quan trọng. Nếu bạn viết thứ gì đó bằng macro, chúng sẽ được thay thế bằng các dòng code khác trước giai đoạn biên dịch, và cuối cùng, bạn sẽ có một đoạn code phẳng dài mà không có bất kỳ tính mô-đun nào tại thời điểm biên dịch. Tất nhiên, bạn có tính mô-đun trong tâm trí và có thể trong các macro của mình, nhưng nó không hiện diện trong các binary cuối cùng của bạn. Đây chính xác là nơi mà việc sử dụng macro có thể bắt đầu gây ra các vấn đề về thiết kế.

Thiết kế phần mềm cố gắng đóng gói các thuật toán và khái niệm tương tự nhau vào một số *module* có thể quản lý và tái sử dụng được, nhưng macro lại cố gắng làm cho mọi thứ trở nên tuyến tính và phẳng. Vì vậy, khi bạn sử dụng macro như một số khối xây dựng logic trong thiết kế phần mềm của mình, thông tin liên quan đến chúng có thể bị mất sau giai đoạn tiền xử lý, như một phần của các translation unit cuối cùng. Đó là lý do tại sao các architect và designer sử dụng một nguyên tắc theo kinh nghiệm (rule of thumb) về macro:

> Nếu một macro có thể được viết dưới dạng một hàm C, thì bạn nên viết một hàm C để thay thế!

Dưới góc độ debugging, một lần nữa, người ta nói rằng macro là thứ tồi tệ. Một nhà phát triển sử dụng các lỗi biên dịch để tìm ra những nơi tồn tại *lỗi cú pháp (syntax error)* như một phần trong các tác vụ phát triển hàng ngày của họ. Họ cũng sử dụng *log* và có thể cả *cảnh báo biên dịch (compilation warning)* để phát hiện bug và sửa nó. Cả lỗi biên dịch lẫn cảnh báo biên dịch đều có lợi cho quy trình phân tích bug, và cả hai đều do compiler tạo ra.

Liên quan đến macro, và đặc biệt là với các C compiler cũ, compiler không biết gì về macro và nó coi nguồn đang biên dịch (translation unit) như một đoạn code dài, tuyến tính và phẳng. Vì vậy, đối với một nhà phát triển nhìn vào code C thực tế có macro và đối với C compiler nhìn vào code đã tiền xử lý không có macro, đó là hai thế giới hoàn toàn khác nhau. Do đó, nhà phát triển không thể dễ dàng hiểu được những gì compiler báo cáo.

Rất may, với sự trợ giúp của các C compiler hiện đại của chúng ta, vấn đề này không còn nghiêm trọng như vậy nữa. Ngày nay, các C compiler nổi tiếng như `gcc` và `clang` hiểu biết nhiều hơn về giai đoạn tiền xử lý, và chúng cố gắng lưu giữ, sử dụng và báo cáo theo đúng source code mà lập trình viên nhìn thấy. Nếu không, vấn đề với macro có thể lặp lại với các chỉ thị `#include`, đơn giản là vì nội dung chính của một translation unit chỉ được biết khi tất cả các việc include đã diễn ra. Để kết luận, chúng ta có thể nói rằng vấn đề với việc debugging ít nghiêm trọng hơn vấn đề mà chúng tôi đã giải thích trong đoạn trước về thiết kế phần mềm.

Nếu bạn nhớ lại, chúng tôi đã đưa ra một cuộc thảo luận trong phần giải thích về *ví dụ 1.6*. Đó là về một trade-off giữa kích thước binary và hiệu năng của một chương trình. Một dạng tổng quát hơn của trade-off này là giữa việc có một binary đơn lẻ kích thước lớn và việc có nhiều binary kích thước nhỏ. Cả hai đều cung cấp cùng một chức năng, nhưng phương án trước có thể mang lại hiệu năng tốt hơn.

Số lượng binary được sử dụng trong một project, đặc biệt là khi project đó lớn, ít nhiều tỷ lệ thuận với mức độ *mô-đun hóa (modularization)* và nỗ lực thiết kế dành cho nó. Ví dụ, một project có 60 library (shared hoặc static) và một file thực thi (executable) dường như được phát triển theo một kế hoạch phần mềm chia tách các dependency thành nhiều library và sử dụng chúng trong một executable chính duy nhất.

Nói cách khác, khi một project được phát triển theo các nguyên tắc thiết kế phần mềm và best practice, số lượng binary và kích thước của chúng được thiết kế kỹ thuật một cách cẩn thận và thường sẽ bao gồm nhiều binary nhẹ với kích thước tối thiểu có thể áp dụng, thay vì có một binary khổng lồ duy nhất.

Thiết kế phần <a id="_idIndexMarker030"></a>mềm cố gắng đặt từng thành phần phần mềm vào một vị trí phù hợp trong một hệ thống phân cấp khổng lồ thay vì đặt chúng theo thứ tự tuyến tính. Và điều này vốn dĩ đi ngược lại với<a id="_idIndexMarker031"></a> hiệu năng mặc dù ảnh hưởng của nó đến hiệu năng là rất nhỏ trong hầu hết các trường hợp.

Vì vậy, chúng ta có thể kết luận rằng cuộc thảo luận liên quan đến *ví dụ 1.6* là về trade-off giữa thiết kế và hiệu năng. Khi bạn cần hiệu năng, đôi khi bạn cần phải hy sinh thiết kế và đặt mọi thứ vào một cấu trúc tuyến tính. Ví dụ, bạn có thể <a id="_idIndexMarker032"></a>tránh các vòng lặp và sử dụng *loop unrolling* để thay thế.

Từ một góc độ khác, hiệu năng bắt đầu bằng việc lựa chọn các thuật toán phù hợp cho các bài toán đã được xác định trong giai đoạn thiết kế. Bước tiếp theo thường được gọi là *tối ưu hóa (optimization)* hoặc *tinh chỉnh hiệu năng (performance tuning)*. Trong giai đoạn này, việc đạt được hiệu năng tương đương với việc để CPU chỉ tính toán theo cách tuyến tính và tuần tự<a id="_idIndexMarker033"></a> mà không ép nó phải nhảy giữa các phần<a id="_idIndexMarker034"></a> khác nhau của code. Điều này có thể được thực hiện bằng cách sửa đổi các thuật toán đã được sử dụng hoặc bằng cách thay thế chúng bằng một số thuật toán có hiệu năng cao và thường phức tạp hơn. Giai đoạn này có thể xung đột với triết lý thiết kế. Như chúng tôi đã nói trước đây, thiết kế cố gắng đưa mọi thứ vào một hệ thống phân cấp và làm cho chúng trở nên non-linear, nhưng CPU lại mong đợi mọi thứ phải tuyến tính, đã được nạp sẵn và sẵn sàng để xử lý. Vì vậy, trade-off này cần phải được chăm chút và cân bằng riêng cho từng bài toán cụ thể.

Chúng ta hãy giải thích kỹ thuật loop unrolling thêm một chút. Kỹ thuật này chủ yếu được sử dụng trong embedded development và đặc biệt là trong các môi trường gặp hạn chế về năng lực xử lý. Kỹ thuật này là loại bỏ các vòng lặp và làm cho chúng trở nên tuyến tính nhằm tăng hiệu năng và tránh chi phí phụ (overhead) của vòng lặp trong khi chạy các lần lặp.

Đây chính xác là những gì chúng ta đã làm trong *ví dụ 1.6*; chúng ta đã mô phỏng một vòng lặp bằng macro, điều dẫn đến một tập hợp các lệnh tuyến tính. Theo nghĩa này, chúng ta có thể nói rằng các macro có thể được sử dụng để tinh chỉnh hiệu năng trong embedded development và các môi trường mà một thay đổi nhỏ trong cách thức thực thi các instruction sẽ mang lại một sự gia tăng hiệu năng đáng kể. Hơn thế nữa, macro có thể mang lại tính dễ đọc cho code và chúng ta có thể tách riêng các instruction lặp lại.

Liên quan đến câu trích dẫn được đề cập trước đó rằng macro nên được thay thế bằng các hàm C tương đương, chúng ta biết rằng câu trích dẫn đó xuất hiện vì lợi ích của thiết kế và nó có thể được bỏ qua trong một số ngữ cảnh nhất định. Trong một ngữ cảnh mà hiệu năng được cải thiện là một yêu cầu then chốt, việc có một tập hợp các instruction tuyến tính mang lại hiệu năng tốt hơn có thể là một điều tất yếu.

Code generation là một ứng dụng phổ biến khác của macro. Chúng có thể được sử dụng để đưa DSL vào một project. *Microsoft MFC*, *Qt*, *Linux Kernel* và *wxWidgets* là một vài project trong số hàng nghìn project đang sử dụng macro để định nghĩa DSL của riêng họ. Hầu hết trong số đó là các project C++, nhưng họ đang sử dụng tính năng C này để hỗ trợ các API của mình.

Để kết luận, các macro C <a id="_idIndexMarker036"></a>có thể có lợi thế nếu các tác động từ dạng đã tiền xử lý của chúng <a id="_idIndexMarker037"></a>được điều tra và nắm rõ. Nếu bạn đang làm việc trên một project trong một nhóm, hãy luôn chia sẻ các quyết định của bạn liên quan đến việc sử dụng macro trong nhóm và giữ cho bản thân luôn thống nhất với các quyết định được đưa ra trong nhóm.

<a id="_idParaDest-19"></a>

### Biên dịch có điều kiện (conditional compilation)

Conditional <a id="_idIndexMarker038"></a>compilation (biên dịch có điều kiện) là một tính năng độc đáo khác của C. Nó cho phép<a id="_idIndexMarker039"></a> bạn có các source code đã tiền xử lý khác nhau dựa trên những điều kiện khác nhau. Bất chấp ý nghĩa mà tên gọi của nó gợi ý, compiler không thực hiện bất kỳ điều gì một cách có điều kiện, mà chính đoạn code đã tiền xử lý được chuyển giao cho compiler có thể khác nhau dựa trên một số điều kiện được chỉ định. Những điều kiện này được đánh giá bởi preprocessor trong khi chuẩn bị code đã tiền xử lý. Có nhiều chỉ thị khác nhau đóng góp vào conditional compilation. Bạn có thể thấy danh sách của chúng như sau:

- `#ifdef`
- `#ifndef`
- `#else`
- `#elif`
- `#endif`

Ví dụ sau đây, *ví dụ 1.7*, minh họa một cách sử dụng rất cơ bản của các chỉ thị này:

```
#define CONDITION
int main(int argc, char** argv) {
#ifdef CONDITION
  int i = 0;
  i++;
#endif
  int j= 0;
  return 0;
}
```

*Code Box 1-14 [ExtremeC_examples_chapter1_7.c]: Một ví dụ về biên dịch có điều kiện*

Trong khi tiền xử lý đoạn code trên, preprocessor nhìn thấy định nghĩa của macro `CONDITION` và đánh dấu nó là đã được định nghĩa. Lưu ý rằng không có giá trị nào được đề xuất cho macro `CONDITION` và điều này hoàn toàn hợp lệ. Sau đó, preprocessor tiếp tục đi xuống sâu hơn cho đến khi nó gặp câu lệnh `#ifdef`. Vì macro `CONDITION` đã được định nghĩa, tất cả các dòng nằm giữa `#ifdef` và `#endif` sẽ được sao chép vào source code cuối cùng.

Bạn có thể thấy đoạn code đã tiền xử lý trong code box sau:

```
int main(int argc, char** argv) {
  int i = 0;
  i++;
  int j= 0;
  return 0;
}
```

*Code Box 1-15: Ví dụ 1.7 sau giai đoạn tiền xử lý*

Nếu macro không được định nghĩa, chúng ta sẽ không thấy bất kỳ sự thay thế nào cho các chỉ thị `#if-#endif`. Do đó, đoạn code đã tiền xử lý có thể giống như sau:

```
int main(int argc, char** argv) {
  int j= 0;
  return 0;
}
```

*Code Box 1-16: Ví dụ 1.7 sau giai đoạn tiền xử lý với giả định macro CONDITION không được định nghĩa*

Lưu ý các dòng trống trong cả hai code box *1-15* và *1-16*, những dòng này còn sót lại từ giai đoạn tiền xử lý sau khi thay thế phần `#ifdef-#endif` bằng giá trị đã được đánh giá của nó.

> Các macro có thể được định nghĩa bằng các tùy chọn `-D` được truyền vào lệnh biên dịch. Liên quan đến ví dụ trước, chúng ta có thể định nghĩa macro `CONDITION` như sau:
>
> ```
> $ gcc -DCONDITION -E main.c
> ```
>
> Đây là một tính năng tuyệt vời vì nó cho phép bạn định nghĩa các macro bên ngoài các source file. Điều này đặc biệt hữu ích khi có một source code duy nhất nhưng biên dịch nó cho các architecture khác nhau, ví dụ: Linux hoặc macOS, những hệ điều hành có các định nghĩa macro mặc định và các library khác nhau.

Một trong những cách sử dụng rất<a id="_idIndexMarker041"></a> phổ biến của `#ifndef` là đóng vai trò như một câu lệnh *header guard*. Câu lệnh này bảo vệ một header file không bị include hai lần trong giai đoạn tiền xử lý, và chúng ta có thể nói rằng hầu như tất cả các header file C và C++ trong gần như mọi project đều có câu lệnh này là lệnh đầu tiên của chúng.

Đoạn code sau đây, *ví dụ 1.8*, là một ví dụ về cách sử dụng câu lệnh header guard. Giả sử rằng đây là nội dung của một header file và do tình cờ, nó có thể được include hai lần trong một compilation unit. Lưu ý rằng *ví dụ 1.8* chỉ là một header file và nó không được dùng để biên dịch trực tiếp:

```
#ifndef EXAMPLE_1_8_H
#define EXAMPLE_1_8_H
void say_hello();
int read_age();
#endif
```

*Code Box 1-17 [ExtremeC_examples_chapter1_8.h]: Một ví dụ về header guard*

Như bạn thấy, tất cả các khai báo biến và hàm đều được đặt bên trong cặp `#ifndef` và `#endif` và chúng được bảo vệ khỏi việc include nhiều lần bằng một macro. Trong đoạn tiếp theo, chúng tôi giải thích cách thức hoạt động.

Khi lần include đầu tiên diễn ra, macro `EXAMPLE_1_8_H` vẫn chưa được định nghĩa, vì vậy preprocessor tiếp tục bằng cách đi vào khối` #ifndef-#endif`. Câu lệnh tiếp theo định nghĩa macro `EXAMPLE_1_8_H`, và preprocessor sao chép mọi thứ vào code đã tiền xử lý cho đến khi nó gặp chỉ thị `#endif`. Khi lần include thứ hai diễn ra, macro `EXAMPLE_1_8_H` đã được định nghĩa sẵn, vì vậy preprocessor bỏ qua toàn bộ nội dung bên trong phần `#ifndef-#endif` và chuyển sang câu lệnh tiếp theo sau `#endif`, nếu có.

Một thực hành phổ biến là toàn bộ nội dung của một header file được đặt giữa cặp `#ifndef-#endif`, và không có gì ngoài các comment được để lại bên ngoài.

Như một lưu ý cuối cùng trong phần này, thay vì có một cặp chỉ thị `#ifndef-#endif`, người ta có thể sử dụng `#pragma once` nhằm bảo vệ header file khỏi vấn đề *double inclusion*. Sự khác biệt giữa các chỉ thị có điều kiện và chỉ thị `#pragma once` là chỉ thị sau không thuộc tiêu chuẩn C, mặc dù thực tế là nó được hỗ trợ bởi hầu hết tất cả các C preprocessor. Tuy nhiên, tốt hơn hết là không nên sử dụng nó nếu tính *di động (portability)* của code là một yêu cầu bắt buộc.

Code box sau đây chứa phần minh họa về cách sử dụng `#pragma once` trong *ví dụ 1.8*, thay vì các chỉ thị `#ifndef-#endif`:

```
#pragma once
void say_hello();
int read_age();
```

*Code Box 1-18: Dùng chỉ thị #pragma once như một phần của ví dụ 1.8*

Bây giờ, chúng ta khép lại chủ đề về các chỉ thị preprocessor sau khi đã chứng minh một số đặc tính thú vị và các ứng dụng đa dạng của chúng. Phần tiếp theo là về variable pointer, vốn là một tính năng quan trọng khác của C.

<a id="_idParaDest-20"></a>

## Variable pointer

Khái niệm về một <a id="_idIndexMarker043"></a>variable pointer, hay gọi ngắn gọn là pointer (con trỏ), là một trong những khái niệm nền tảng nhất trong C. Bạn khó có thể tìm thấy bất kỳ<a id="_idIndexMarker044"></a> dấu vết trực tiếp nào của chúng trong hầu hết các ngôn ngữ lập trình high-level. Trên thực tế, chúng đã được thay thế bằng một số khái niệm song sinh <a id="_idIndexMarker045"></a>tương đương, ví dụ: *reference* trong Java. Điều đáng nói là các pointer là độc nhất vô nhị theo nghĩa là các address mà chúng trỏ tới có thể được phần cứng sử dụng trực tiếp, nhưng điều này lại không đúng đối với các khái niệm song sinh ở cấp độ higher-level như reference.

Việc có một sự hiểu biết sâu sắc về pointer và cách chúng hoạt động là tối quan trọng để trở thành một lập trình viên C lành nghề. Chúng là một trong những khái niệm nền tảng nhất trong quản lý memory, và bất chấp cú pháp đơn giản của chúng, chúng có tiềm năng dẫn đến một thảm họa khi bị sử dụng sai cách. Chúng tôi sẽ đề cập đến các chủ đề memory management-related trong *Chương 4*, *Cấu trúc memory của process (Process Memory Structure)*, và *Chương 5*, *Stack và Heap*, nhưng ở đây trong chương này, chúng tôi muốn tóm lược lại mọi thứ về pointer. Nếu bạn cảm thấy tự tin về thuật ngữ cơ bản và các khái niệm xoay quanh pointer, bạn có thể bỏ qua phần này.

<a id="_idParaDest-21"></a>

### Cú pháp

Ý tưởng đằng sau bất kỳ loại pointer nào cũng<a id="_idIndexMarker046"></a> rất đơn giản; nó chỉ là một biến đơn giản lưu giữ một *memory address*. Điều đầu tiên bạn có thể nhớ về chúng là ký tự dấu sao, `*`, được sử dụng để khai báo một pointer trong C. Bạn có thể thấy nó trong *ví dụ 1.9*. Code box sau đây minh họa cách khai báo và sử dụng một variable pointer:

```
int main(int argc, char** argv) {
  int var = 100;
  int* ptr = 0;
  ptr = &var;
  *ptr = 200;
  return 0;
}
```

*Code Box 1-19 [ExtremeC_examples_chapter1_9.c]: Ví dụ về cách khai báo và dùng một pointer trong C*

Ví dụ trên có mọi thứ bạn cần biết về cú pháp của pointer. Dòng đầu tiên khai báo biến `var` trên đỉnh của *Stack segment*. Chúng ta sẽ thảo luận về Stack segment trong *Chương 4*, *Cấu trúc memory của process (Process Memory Structure)*. Dòng thứ hai khai báo pointer `ptr` với giá trị ban đầu bằng không. Một pointer có giá trị bằng không được gọi là một *null pointer*. Chừng nào pointer `ptr` còn giữ giá trị không của nó, nó được coi là một null pointer. Việc *gán null (nullify)* cho một pointer là rất quan trọng nếu bạn *không* định lưu trữ một address hợp lệ ngay khi khai báo.

Như bạn thấy trong *Code Box 1-19*, không có header file nào được include. Pointer là một phần của ngôn ngữ C, và bạn không cần phải include bất cứ thứ gì để có thể sử dụng chúng. Thật vậy, chúng ta có thể có các chương trình C hoàn toàn không include bất kỳ header file nào.

> Tất cả các khai báo sau đây đều hợp lệ trong C:
>
> `int* ptr = 0;`
>
> `int * ptr = 0;`
>
> `int *ptr = 0;`

Dòng thứ ba trong hàm `main` giới thiệu toán tử `&`, được gọi là *toán tử lấy address (referencing operator)*. Nó trả về address của biến đứng cạnh nó. Chúng ta cần toán tử này để lấy được address của một biến. Nếu không, chúng ta không thể khởi tạo pointer với các address hợp lệ.

Trên cùng dòng đó, address được trả về được lưu trữ vào pointer `ptr`. Bây giờ, pointer `ptr` không còn là một null pointer nữa. Ở dòng thứ tư, chúng ta thấy một toán tử khác đứng trước pointer, được gọi là *toán tử giải tham chiếu (dereferencing operator)* và được ký hiệu bằng `*`. Toán tử này cho phép bạn truy cập gián tiếp vào memory cell mà pointer `ptr` đang trỏ tới. Nói cách khác, nó cho phép bạn đọc và sửa đổi biến `var` thông qua pointer đang trỏ tới nó. Dòng thứ tư tương đương với câu lệnh `var = 200;`.

Một null pointer không <a id="_idIndexMarker047"></a>trỏ tới một memory address hợp lệ. Do đó, việc dereference một null pointer *phải* được tránh tuyệt đối bởi vì nó được coi là một *undefined behavior* (hành vi không xác định), điều thường dẫn đến crash chương trình.

Như một ghi chú cuối cùng liên quan đến ví dụ trước, chúng ta thường có sẵn macro mặc định `NULL` được định nghĩa với giá trị `0`, và nó có thể được sử dụng để nullify các pointer khi khai báo. Việc sử dụng macro này thay vì dùng trực tiếp số `0` là một thực hành tốt vì nó giúp phân biệt dễ dàng hơn giữa các biến thông thường và các pointer:

```
char* ptr = NULL;
```

*Code Box 1-20: Dùng macro NULL để gán null cho một pointer*

Các pointer trong C++ hoàn toàn giống hệt như trong C. Chúng cần được nullify bằng cách lưu trữ `0` hoặc `NULL` trong chúng, nhưng C++11 có một từ khóa mới để khởi tạo pointer. Nó không phải là một macro như `NULL` cũng không phải là một số nguyên như `0`. Từ khóa đó là `nullptr` và có thể được sử dụng để nullify các pointer hoặc kiểm tra xem chúng có null hay không. Ví dụ sau đây minh họa cách nó được sử dụng trong C++11:

```
char* ptr = nullptr;
```

*Code Box 1-21: Dùng nullptr để gán null cho một pointer trong C++11*

> Cần ghi nhớ một điều cốt tử là các pointer *phải* được khởi tạo ngay khi khai báo. Nếu bạn không muốn lưu trữ bất kỳ memory address hợp lệ nào trong khi khai báo chúng, đừng để chúng không được khởi tạo. Hãy làm cho nó thành null bằng cách gán `0` hoặc `NULL!` Hãy làm điều này nếu không bạn có thể phải đối mặt với một bug nghiêm trọng!

Trong hầu hết các compiler hiện đại, một pointer chưa được khởi tạo luôn được nullify. Điều này có nghĩa là giá trị ban đầu là `0` cho tất cả các pointer chưa được khởi tạo. Nhưng điều này không nên được coi là cái cớ để khai báo các pointer mà không khởi tạo chúng đúng cách. Hãy nhớ rằng bạn đang viết code cho các architecture khác nhau, cả cũ lẫn mới, và điều này có thể gây ra sự cố trên các hệ thống cũ (legacy). Ngoài ra, bạn sẽ nhận được một danh sách các lỗi và cảnh báo cho các loại pointer chưa được khởi tạo này trong hầu hết các *memory profiler*. Các memory profiler sẽ được giải thích kỹ lưỡng như một phần của *Chương 4*, *Cấu trúc memory của process (Process Memory Structure)*, và *Chương 5*, *Stack và Heap*.

<a id="_idParaDest-22"></a>

### Phép toán số học trên variable pointer (Arithmetic on variable pointers)

Bức tranh đơn giản nhất<a id="_idIndexMarker048"></a> về memory là một mảng one-dimensional các byte rất dài. Với hình ảnh này trong tâm trí, nếu bạn đang đứng ở một byte, bạn chỉ có thể tiến và lùi trong mảng; không có chuyển động nào khác là khả thi. Vì vậy, điều này cũng tương tự đối với các pointer address các byte khác nhau trong memory. Việc tăng (increment) pointer làm cho pointer tiến về phía trước và việc giảm (decrement) làm cho pointer lùi về phía sau. Không có phép toán số học nào khác là khả thi đối với các pointer.

Như chúng tôi đã nói trước đây, các phép toán số học trên một pointer tương tự như các chuyển động trong một mảng byte. Chúng ta có thể sử dụng hình ảnh này để giới thiệu một khái niệm mới: *bước nhảy số học (arithmetic step size)*. Chúng ta cần có khái niệm mới này bởi vì khi bạn tăng một pointer lên 1, nó có thể tiến về phía trước nhiều hơn 1 byte trong memory. Mỗi pointer có một arithmetic step size, nghĩa là số lượng byte mà pointer sẽ di chuyển nếu nó được tăng hoặc giảm đi 1 đơn vị. Arithmetic step size này được xác định bởi *kiểu dữ liệu (data type)* C của pointer.

Trên mọi nền tảng, chúng ta có một đơn vị memory duy nhất và tất cả các pointer đều lưu trữ các address bên trong memory đó. Vì vậy, tất cả các pointer phải có kích thước bằng nhau tính theo số byte. Nhưng điều này không có nghĩa là tất cả chúng đều có arithmetic step size bằng nhau. Như chúng tôi đã đề cập trước đó, arithmetic step size của một pointer được xác định bởi kiểu dữ liệu C của nó.

Ví dụ, một pointer `int` có cùng kích thước với một pointer `char`, nhưng chúng có arithmetic step size khác nhau. `int*` thường có arithmetic step size 4-byte và `char*` có arithmetic step size 1-byte. Do đó, việc tăng một pointer số nguyên làm cho nó di chuyển tiến lên 4 byte trong memory (cộng thêm 4 byte vào address hiện tại), và việc tăng một pointer ký tự làm cho nó di chuyển tiến lên chỉ 1 byte trong memory. Ví dụ sau đây, *ví dụ 1.10*, minh họa arithmetic step size của hai pointer với hai kiểu dữ liệu khác nhau:

```
#include <stdio.h>
int main(int argc, char** argv) {
  int var = 1;
  int* int_ptr = NULL; // nullify the pointer
  int_ptr = &var;
  char* char_ptr = NULL;
  char_ptr = (char*)&var;
  printf("Before arithmetic: int_ptr: %u, char_ptr: %u\n",
          (unsigned int)int_ptr, (unsigned int)char_ptr);
  int_ptr++;    // Arithmetic step is usually 4 bytes
  char_ptr++;   // Arithmetic step in 1 byte
  printf("After arithmetic: int_ptr: %u, char_ptr: %u\n",
          (unsigned int)int_ptr, (unsigned int)char_ptr);
  return 0;
}
```

*Code Box 1-22 [ExtremeC_examples_chapter1_10.c]: Bước nhảy số học của hai pointer*

Shell box sau đây hiển thị output của *ví dụ 1.10*. Lưu ý rằng các address được in ra có thể khác nhau giữa hai lần chạy liên tiếp trên cùng một máy, và thậm chí từ nền tảng này sang nền tảng khác, do đó bạn có thể quan sát thấy các address khác trong output của mình:

```
$ gcc ExtremeC_examples_chapter1_10.c
$ ./a.out
Before arithmetic: int_ptr: 3932338348, char_ptr: 3932338348
After arithmetic:  int_ptr: 3932338352, char_ptr: 3932338349
$
```

*Shell Box 1-4: Output của ví dụ 1.10 sau lần chạy đầu tiên*

Từ việc so sánh các address trước và sau các phép toán số học, thấy rõ ràng rằng<a id="_idIndexMarker049"></a> step size cho pointer số nguyên là 4 byte, và nó là 1 byte cho pointer ký tự. Nếu bạn chạy lại ví dụ, các pointer có thể tham chiếu đến một số address khác, nhưng arithmetic step size của chúng vẫn giữ nguyên:

```
$ ./a.out
Before arithmetic: int_ptr: 4009638060, char_ptr: 4009638060
After arithmetic:  int_ptr: 4009638064, char_ptr: 4009638061
$
```

*Shell Box 1-5: Output của ví dụ 1.10 sau lần chạy thứ hai*

Bây giờ khi bạn đã biết về arithmetic step size, chúng ta có thể nói về một ví dụ kinh điển của việc sử dụng pointer arithmetic để *lặp (iterate)* qua một vùng memory. Các ví dụ 1.11 và 1.12 chuẩn bị in ra tất cả các phần tử của một mảng số nguyên. Cách tiếp cận thông thường không sử dụng pointer được đưa ra trong *ví dụ 1.11*, và giải pháp dựa trên pointer arithmetic được cung cấp như một phần của *ví dụ 1.12*.

Code box sau đây hiển thị code cho *ví dụ 1.11*:

```
#include <stdio.h>
#define SIZE 5
int main(int argc, char** argv) {
 int arr[SIZE];
 arr[0] = 9;
 arr[1] = 22;
 arr[2] = 30;
 arr[3] = 23;
 arr[4] = 18;
 for (int i = 0; i < SIZE; i++) {
   printf("%d\n", arr[i]);
 }
 return 0;
}
```

*Code Box 1-23 [ExtremeC_examples_chapter1_11.c]: Duyệt qua một mảng mà không dùng số học pointer*

Đoạn code trong *Code Box 1-23* hẳn đã quen thuộc với bạn. Nó chỉ sử dụng một *biến đếm vòng lặp (loop counter)* để tham chiếu đến một chỉ số (index) cụ thể của mảng và đọc nội dung của nó. Nhưng nếu bạn muốn sử dụng pointer thay vì truy cập các phần tử thông qua cú pháp *indexer* (một số nguyên nằm giữa `[` và `]`), nó cần phải được thực hiện theo cách khác. Code box sau đây minh họa cách sử dụng pointer để lặp qua ranh giới mảng:

```
#include <stdio.h>
#define SIZE 5
int main(int argc, char** argv) {
 int arr[SIZE];
 arr[0] = 9;
 arr[1] = 22;
 arr[2] = 30;
 arr[3] = 23;
 arr[4] = 18;
 int* ptr = &arr[0];
 for (;;) {
   printf("%d\n", *ptr);
   if (ptr == &arr[SIZE - 1]) {
     break;
   }
   ptr++;
 }
 return 0;
}
```

*Code Box 1-24 [ExtremeC_examples_chapter1_12.c]: Duyệt qua một mảng bằng số học pointer*

Cách tiếp cận thứ hai, được minh họa trong *Code Box 1-24*, sử dụng một vòng lặp vô hạn, vòng lặp này sẽ ngắt (break) khi address của pointer `ptr` trùng với phần tử cuối cùng của mảng.

Chúng ta biết rằng các mảng <a id="_idIndexMarker051"></a>là các biến liền kề nhau bên trong memory, vì vậy việc tăng và giảm một pointer đang trỏ tới một phần tử sẽ làm cho nó di chuyển tới lui bên trong mảng một cách hiệu quả và cuối cùng trỏ tới một phần tử khác.

Như thấy rõ từ đoạn code trước, pointer `ptr` có kiểu dữ liệu `int*`. Đó là do thực tế là nó phải có khả năng trỏ tới bất kỳ phần tử riêng lẻ nào của mảng vốn là một số nguyên kiểu `int`. Lưu ý rằng tất cả các phần tử của một mảng đều có cùng một kiểu, do đó chúng có kích thước bằng nhau. Vì vậy, việc tăng pointer `ptr` làm cho nó trỏ tới phần tử tiếp theo bên trong mảng. Như bạn thấy, trước vòng lặp `for`, `ptr` trỏ tới phần tử đầu tiên của mảng, và bằng các lần tăng tiếp theo, nó di chuyển về phía trước dọc theo vùng memory của mảng. Đây là một cách sử dụng rất kinh điển của pointer arithmetic.

Lưu ý rằng trong C, một mảng thực chất là một pointer trỏ tới phần tử đầu tiên của nó. Vì vậy, trong ví dụ này, kiểu dữ liệu thực tế của `arr` là `int*`. Do đó, chúng ta có thể viết dòng này như sau:

```
int* ptr = arr;
```

Thay vì dòng:

```
int* ptr = &arr[0];
```

<a id="_idParaDest-23"></a>

### Generic pointer

Một pointer kiểu `void*` được gọi là một generic pointer (con trỏ tổng quát). Nó có thể trỏ tới bất kỳ address nào giống như tất cả các pointer khác, nhưng chúng ta không biết<a id="_idIndexMarker052"></a> kiểu dữ liệu thực tế của nó, do đó chúng ta không biết arithmetic step size của nó. Các generic pointer thường được sử dụng để chứa nội dung của các pointer khác, nhưng chúng quên đi kiểu dữ liệu thực tế của những pointer đó. Do đó, một generic pointer không thể được dereference, và người ta không thể thực hiện các phép toán số học trên nó vì kiểu dữ liệu bên dưới của nó là chưa biết. Ví dụ sau đây, *ví dụ 1.13*, cho chúng ta thấy rằng việc dereference một generic pointer là không thể:

```
#include <stdio.h>
int main(int argc, char** argv) {
 int var = 9;
 int* ptr = &var;
 void* gptr = ptr;
 printf("%d\n", *gptr);
 return 0;
}
```

*Code Box 1-25 [ExtremeC_examples_chapter1_13.c]: Dereference một generic pointer sinh ra lỗi biên dịch!*

Nếu bạn biên dịch đoạn code trên bằng `gcc` trong Linux, bạn sẽ nhận được lỗi sau:

```
$ gcc ExtremeC_examples_chapter1_13.c
In function 'main':warning: dereferencing 'void *' pointer
  printf("%d\n", *gptr);
                 ^~~~~
error: invalid use of void expression
  printf("%d\n", *gptr);
$
```

*Shell Box 1-6: Biên dịch ví dụ 1.13 trên Linux*

Và nếu bạn biên dịch nó bằng `clang` trong macOS, thông báo lỗi sẽ khác, nhưng nó đề cập đến cùng một vấn đề:

```
$ clang ExtremeC_examples_chapter1_13.c
error: argument type 'void' is incomplete
  printf("%d\n", *gptr);
                 ^
1 error generated.
$
```

*Shell Box 1-7: Biên dịch ví dụ 1.13 trên macOS*

Như bạn thấy, cả hai <a id="_idIndexMarker053"></a>compiler đều không chấp nhận việc dereference một generic pointer. Trên thực tế, việc dereference một generic pointer là vô nghĩa! Vậy chúng dùng để làm gì? Trên thực tế, generic pointer rất tiện lợi để định nghĩa các *generic function* có thể chấp nhận một loạt các pointer khác nhau làm đối số đầu vào của chúng. Ví dụ sau đây, *ví dụ 1.14*, cố gắng làm sáng tỏ các chi tiết liên quan đến generic function:

```
#include <stdio.h>
void print_bytes(void* data, size_t length) {
  char delim = ' ';
  unsigned char* ptr = data;
  for (size_t i = 0; i < length; i++) {
    printf("%c 0x%x", delim, *ptr);
    delim = ',';
    ptr++;
  }
  printf("\n");
}
int main(int argc, char** argv) {
 int a = 9;
 double b = 18.9;
 print_bytes(&a, sizeof(int));
 print_bytes(&b, sizeof(double));
 return 0;
}
```

*Code Box 1-26 [ExtremeC_examples_chapter1_14.c]: Một ví dụ về generic function*

Trong code box trên, hàm `print_bytes` nhận một address dưới dạng một pointer `void*` và một số nguyên biểu thị độ dài. Sử dụng các đối số này, hàm sẽ in ra tất cả các byte bắt đầu từ address đã cho cho đến độ dài đã cho. Như bạn thấy, hàm chấp nhận một generic pointer, điều này cho phép người dùng truyền vào bất kỳ pointer nào họ muốn. Hãy nhớ rằng việc gán cho một *void pointer* (generic pointer) *không* cần một phép ép kiểu rõ ràng (explicit cast). Đó là lý do tại sao chúng ta đã truyền address của `a` và `b` mà không cần ép kiểu rõ ràng.

Bên trong hàm `print_bytes`, chúng ta phải sử dụng một pointer `unsigned char` để di chuyển bên trong memory. Nếu không, chúng ta <a id="_idIndexMarker054"></a>không thể thực hiện bất kỳ phép toán số học nào trên tham số void pointer, `data`, một cách trực tiếp. Như bạn có thể biết, step size của một `char*` hoặc `unsigned char*` là một byte. Vì vậy, nó là kiểu pointer tốt nhất để lặp qua một phạm vi memory address từng byte một và xử lý tất cả các byte đó lần lượt từng byte một.

Như một lưu ý cuối cùng về ví dụ này, `size_t` là một kiểu dữ liệu không dấu tiêu chuẩn thường được sử dụng để lưu trữ kích thước trong C.

> `size_t` được định nghĩa trong mục 6.5.3.4 của tiêu chuẩn ISO/ICE 9899:TC3. Tiêu chuẩn ISO này là đặc tả kỹ thuật C99 nổi tiếng được sửa đổi vào năm 2007. Tiêu chuẩn này đã là cơ sở cho tất cả các bản triển khai C cho [đến tận ngày nay. Liên kết đến ISO/ICE 9899:TC3 (2007)](http://www.open-std.org/jtc1/sc22/wg14/www/docs/n1256.pdf) là [http://www.open-std.org/jtc1/sc22/wg14/www/docs/n1256.pdf](http://www.open-std.org/jtc1/sc22/wg14/www/docs/n1256.pdf).

<a id="_idParaDest-24"></a>

### Kích thước của một pointer

Nếu bạn tìm kiếm *size of a pointer in C* trên Google, bạn có thể nhận ra rằng bạn không thể tìm thấy một câu trả lời dứt khoát cho điều đó. Có<a id="_idIndexMarker055"></a> rất nhiều câu trả lời ngoài kia, và đúng là bạn không thể xác định một kích thước cố định cho một pointer trong các architecture khác nhau. Kích thước của một pointer <a id="_idIndexMarker056"></a>phụ thuộc vào architecture hơn là một khái niệm C cụ thể. C không quá bận tâm về những chi tiết hardware-related như vậy, và nó cố gắng cung cấp một cách làm việc chung với các pointer và các khái niệm lập trình khác. Đó là lý do tại sao chúng ta biết đến C như một tiêu chuẩn. Chỉ có các pointer và các phép toán số học trên chúng là quan trọng đối với C.

> Architecture đề cập đến phần cứng được sử dụng trong một hệ thống máy tính. Bạn sẽ tìm thấy nhiều chi tiết hơn trong chương sắp tới, *Biên dịch và Liên kết (Compilation and Linking)*.

Bạn luôn có thể sử dụng hàm `sizeof` để lấy kích thước của một pointer. Chỉ cần nhìn vào kết quả của `sizeof(char*)` trên architecture mục tiêu của bạn. Theo nguyên tắc chung, các pointer có kích thước 4 byte trong các architecture 32-bit và 8 byte trong các architecture 64-bit, nhưng bạn có thể tìm thấy các kích thước khác trong những architecture khác. Hãy nhớ rằng đoạn code bạn viết *không nên* phụ thuộc vào một giá trị cụ thể cho kích thước của một pointer, và nó không nên đưa ra bất kỳ giả định nào về điều đó. Nếu không, bạn sẽ gặp rắc rối trong khi port code của mình sang các architecture khác.

<a id="_idParaDest-25"></a>

### Dangling pointer

Có rất nhiều vấn đề đã biết gây ra bởi việc sử dụng sai pointer. Vấn đề dangling pointer (con trỏ lơ lửng) là một vấn đề rất nổi tiếng. Một pointer<a id="_idIndexMarker058"></a> thường trỏ tới một address mà tại đó có một biến được cấp phát. Việc đọc hoặc sửa đổi một address nơi không có biến nào được đăng ký là một sai lầm lớn và có thể dẫn đến tình trạng crash hoặc *segmentation fault*. Segmentation fault là một lỗi đáng sợ mà mọi C/C++ developer đều phải từng nhìn thấy ít nhất một lần trong khi làm việc với code. Tình huống này thường xảy ra khi bạn sử dụng sai pointer. Bạn đang truy cập vào những vị trí trong memory mà bạn không được phép. Bạn đã từng có một biến ở đó trước đây, nhưng nó đã được giải phóng (deallocated) vào lúc này.

Chúng ta hãy cố gắng tạo ra tình huống này như một phần của ví dụ sau đây, *ví dụ 1.15*:

```
#include <stdio.h>
int* create_an_integer(int default_value) {
  int var = default_value;
  return &var;
}
int main() {
  int* ptr = NULL;
  ptr = create_an_integer(10);
  printf("%d\n", *ptr);
  return 0;
}
```

*Code Box 1-27 [ExtremeC_examples_chapter1_15.c]: Tạo ra một tình huống segmentation fault*

Trong ví dụ trước, hàm `create_an_integer` được sử dụng để tạo một số nguyên. Nó khai báo một số nguyên với một giá trị mặc định và trả về address của nó cho caller. Trong hàm `main`, address của số nguyên đã tạo, `var`, được nhận và nó được lưu trữ trong pointer `ptr`. Sau đó, pointer `ptr` được dereference, và giá trị được lưu trữ trong biến `var` được in ra.

Nhưng mọi thứ không dễ dàng như vậy. Khi bạn muốn biên dịch đoạn code này bằng `gcc` compiler trên máy Linux, nó sẽ tạo ra một<a id="_idIndexMarker059"></a> cảnh báo như sau, nhưng vẫn hoàn thành thành công quá trình biên dịch, và bạn nhận được file thực thi cuối cùng:

```
$ gcc ExtremeC_examples_chapter1_15.c
In function 'f':
warning: function returns address of local variable [-Wreturn-local-addr]
   return &var;
          ^~~~
$
```

*Shell Box 1-8: Biên dịch ví dụ 1.15 trên Linux*

Đây thực sự là một thông báo cảnh báo quan trọng có thể dễ dàng bị lập trình viên bỏ qua và lãng quên. Chúng tôi sẽ nói nhiều hơn về điều này sau như một phần của *Chương 5*, *Stack và Heap*. Hãy xem điều gì sẽ xảy ra nếu chúng ta tiếp tục và thực thi file thực thi thu được.

Khi bạn chạy *ví dụ 1.15*, bạn sẽ nhận được lỗi segmentation fault, và chương trình sẽ crash ngay lập tức:

```
$ ./a.out
Segmentation fault (core dumped)
$
```

*Shell Box 1-9: Segmentation fault khi chạy ví dụ 1.15*

Vậy, điều gì đã sai? Pointer `ptr` đang bị dangling và trỏ tới một phần memory đã được giải phóng vốn từng được biết đến là vị trí memory của biến `var`.

Biến `var` là một biến cục bộ (local variable) đối với hàm `create_an_integer`, và nó sẽ được giải phóng sau khi rời khỏi hàm, nhưng address của nó lại có thể được trả về từ hàm. Vì vậy, sau khi sao chép address được trả về vào `ptr` như một phần của hàm `main`, `ptr` trở thành một dangling pointer trỏ tới một address không hợp lệ trong memory. Bây giờ, việc dereference pointer này gây ra một vấn đề nghiêm trọng và chương trình crash.

Nếu bạn nhìn lại cảnh báo do compiler tạo ra, nó đang nêu rõ vấn đề.

Nó nói rằng bạn đang *trả về address của một biến cục bộ*, biến này sẽ được giải phóng sau khi return từ hàm. Quả là compiler thông minh! Nếu bạn coi trọng những cảnh báo này, bạn sẽ không phải đối mặt với những bug đáng sợ này.

Nhưng đâu là cách thích hợp để viết lại ví dụ này? Vâng, sử dụng *Heap memory*. Chúng tôi sẽ đề cập đầy đủ về heap memory trong *Chương 4*, *Cấu trúc memory của process (Process Memory Structure)*, và *Chương 5*, *Stack và Heap*, nhưng hiện tại, chúng tôi sẽ viết lại ví dụ này bằng cách sử dụng *cấp phát Heap (Heap allocation)*, và bạn sẽ thấy bạn có thể hưởng lợi như thế nào từ việc sử dụng *Heap* thay vì *Stack*.

*Ví dụ 1.16* dưới đây cho thấy cách sử dụng Heap memory để cấp phát các biến, và cho phép truyền các address giữa các hàm mà không gặp bất kỳ vấn đề nào:

```
#include <stdio.h>
#include <stdlib.h>
int* create_an_integer(int default_value) {
  int* var_ptr = (int*)malloc(sizeof(int));
  *var_ptr = default_value;
  return var_ptr;
}
int main() {
  int* ptr = NULL;
  ptr = create_an_integer(10);
  printf("%d\n", *ptr);
  free(ptr);
  return 0;
}
```

*Code Box 1-28 [ExtremeC_examples_chapter1_16.c]: Viết lại ví dụ 1.15 dùng Heap memory*

Như bạn thấy trong code box trên, chúng ta đã include một header file mới, `stdlib.h`, và chúng ta đang sử dụng hai hàm mới, `malloc` và `free`. Lời giải thích đơn giản là như thế này: biến số nguyên được tạo bên trong hàm `create_an_integer` không còn là một biến cục bộ nữa. Thay vào đó, nó là một biến được cấp phát từ Heap memory và lifetime của nó không bị giới hạn trong hàm khai báo nó. Do đó, nó có thể được truy cập trong hàm gọi bên ngoài (caller function). Các pointer trỏ tới biến này không còn bị dangling nữa, và chúng có thể được dereference chừng nào biến đó còn tồn tại và chưa bị giải phóng. Cuối cùng, biến được giải phóng bằng cách gọi hàm `free` như một điểm kết thúc cho lifetime của nó. Lưu ý rằng việc giải phóng một biến trên Heap là bắt buộc khi nó không còn cần thiết nữa.

Trong phần này, chúng ta đã đi qua tất cả các cuộc thảo luận thiết yếu liên quan đến variable pointer. Trong phần sắp tới, chúng ta sẽ nói về các hàm và giải phẫu cấu trúc của chúng trong C.

<a id="_idParaDest-26"></a>

## Một số chi tiết về function

C là một ngôn ngữ lập trình *thủ tục* (procedural)<a id="_idIndexMarker060"></a>. Trong C, các function đóng vai trò như các thủ tục, và chúng là các khối xây dựng (building block) của một chương trình C. Do đó, điều quan trọng là phải biết chúng là gì, chúng hoạt động như thế nào, và điều gì xảy ra khi bạn vào hoặc rời khỏi một function. Nói chung, các function (hoặc thủ tục) tương tự như các biến thông thường lưu trữ thuật toán thay vì giá trị. Bằng cách gộp các biến và function lại với nhau thành một kiểu mới, chúng ta có thể lưu trữ các giá trị và thuật toán liên quan dưới cùng một khái niệm. Đây là những gì chúng ta làm trong *object-oriented programming* (lập trình hướng đối tượng), và nó sẽ được đề cập trong phần thứ ba của cuốn sách, *Object Orientation*. Trong phần này, chúng ta muốn khám phá các function và thảo luận về các đặc tính của chúng trong C.

<a id="_idParaDest-27"></a>

### Giải phẫu một function

Trong phần này, chúng ta muốn<a id="_idIndexMarker061"></a> tóm tắt mọi thứ về một function C tại một nơi duy nhất. Nếu bạn cảm thấy điều này đã quen thuộc với mình, bạn có thể chỉ cần bỏ qua phần này.

Một function là một hộp logic có một tên gọi, một danh sách các tham số đầu vào (input parameter), và một danh sách các kết quả đầu ra. Trong C và nhiều ngôn ngữ lập trình khác chịu ảnh hưởng của C, các function chỉ trả về một giá trị duy nhất. Trong các ngôn ngữ object-oriented chẳng hạn như C++ và Java, các function (thường được gọi là các *method*) cũng có thể<a id="_idIndexMarker062"></a> ném ra một *exception* (ngoại lệ), điều này không có trong C. Các function được kích hoạt bằng một lệnh gọi hàm (function call), đơn giản là việc sử dụng tên của function để thực thi logic của nó. Một function call chính xác phải truyền tất cả các đối số (argument) bắt buộc tới function và đợi nó thực thi. Lưu ý rằng các function luôn ở trạng thái *blocking* (chặn) trong C. Điều này có nghĩa là bên gọi (caller) phải đợi function được gọi (callee) hoàn thành và chỉ khi đó nó mới có thể thu nhận kết quả trả về.

Trái ngược với một blocking function, chúng ta có thể có một *non-blocking* function. Khi gọi một non-blocking function, caller không phải đợi function hoàn thành và nó có thể tiếp tục quá trình thực thi của mình. Trong mô hình<a id="_idIndexMarker063"></a> này, thường có một cơ chế *callback* được kích hoạt khi function được gọi (callee) hoàn tất. Một non-blocking function cũng có thể<a id="_idIndexMarker064"></a> được gọi là một *asynchronous function* (hàm bất đồng bộ) hoặc đơn giản là một *async function*. Vì chúng ta không có các async function trong C, chúng ta cần triển khai<a id="_idIndexMarker065"></a> chúng bằng các giải pháp multithreading. Chúng tôi sẽ giải thích các khái niệm này chi tiết hơn trong phần thứ năm của cuốn sách, *Concurrency*.

Điều thú vị cần nói thêm là ngày nay, ngày càng có nhiều sự quan tâm đến việc sử dụng các non-blocking function thay vì blocking function. Nó thường được gọi là *event-oriented programming* (lập trình hướng sự kiện). Non-blocking <a id="_idIndexMarker066"></a>function là trung tâm trong phương pháp lập trình này, và hầu hết các function được viết đều là non-blocking.

Trong event-oriented programming, các function call thực tế diễn ra bên trong một *event loop*, và các callback thích hợp được kích hoạt khi một sự kiện xảy ra. Các framework chẳng hạn như `libuv` và `libev` thúc đẩy cách viết code này, và chúng cho phép bạn thiết kế phần mềm của mình xung quanh một hoặc một số event loop.

<a id="_idParaDest-28"></a>

### Tầm quan trọng trong thiết kế

Function là các building block<a id="_idIndexMarker067"></a> nền tảng của lập trình thủ tục. Kể từ khi được hỗ trợ chính thức trong các ngôn ngữ lập trình, chúng đã có tác động to lớn đến cách chúng ta viết code. Sử dụng function, chúng ta có thể lưu trữ logic trong các thực thể semi-variable và triệu gọi chúng bất cứ khi nào và bất cứ nơi nào cần thiết. Nhờ sử dụng chúng, chúng ta có thể viết một đoạn logic cụ thể chỉ một lần duy nhất và tái sử dụng nó nhiều lần ở nhiều nơi khác nhau.

Ngoài ra, function cho phép chúng ta ẩn giấu một đoạn logic khỏi logic hiện có khác. Nói cách khác, chúng giới thiệu một mức độ trừu tượng (abstraction) giữa các thành phần logic khác nhau. Lấy một ví dụ, giả sử bạn có một function, `avg`, có nhiệm vụ tính giá trị trung bình của một mảng đầu vào. Và bạn có một function khác, `main`, gọi function `avg`. Chúng ta nói rằng logic bên trong function `avg` được ẩn giấu khỏi logic bên trong function `main`.

Do đó, nếu bạn muốn thay đổi logic bên trong `avg`, bạn không cần phải thay đổi logic bên trong function `main`. Đó là bởi vì function `main` chỉ phụ thuộc vào tên và sự sẵn sàng (availability) của function `avg`. Đây là một thành tựu to lớn, ít nhất là đối với những năm tháng mà chúng ta còn phải sử dụng thẻ đục lỗ để viết và thực thi các chương trình!

Chúng ta vẫn đang sử dụng tính năng này trong việc thiết kế các thư viện được viết bằng C hoặc thậm chí các ngôn ngữ lập trình higher-level chẳng hạn như C++ và Java.

<a id="_idParaDest-29"></a>

### Quản lý Stack

Nếu bạn nhìn vào memory layout của một<a id="_idIndexMarker068"></a> process chạy trong một hệ điều hành Unix-like<a id="_idIndexMarker069"></a>, bạn sẽ nhận thấy rằng tất cả các process đều chia sẻ một bố cục tương tự nhau. Chúng ta sẽ thảo luận chi tiết hơn về bố cục này trong *Chương 4*, *Cấu trúc memory của process*, nhưng hiện tại, chúng ta muốn giới thiệu một trong các *segment* của nó; Stack segment. Stack segment là vị trí memory mặc định nơi tất cả các biến cục bộ (local variable), mảng, và structure được cấp phát từ đó. Vì vậy, khi bạn khai báo một biến cục bộ trong một function, nó đang được cấp phát từ Stack segment. Việc cấp phát này luôn diễn ra trên đỉnh của Stack segment.

Hãy chú ý đến thuật ngữ *stack* trong tên<a id="_idIndexMarker070"></a> của segment. Nó có nghĩa là segment này hoạt động giống như một ngăn xếp (stack). Các biến và mảng luôn được cấp phát trên đỉnh của nó, và những thứ ở trên đỉnh là những biến đầu tiên bị xóa bỏ. Hãy nhớ sự tương đồng này với khái niệm stack. Chúng ta sẽ quay lại vấn đề này trong đoạn tiếp theo.

Stack segment cũng<a id="_idIndexMarker071"></a> được sử dụng cho các function call. Khi bạn gọi một function, một *stack frame* chứa return address và tất cả các đối số được truyền vào sẽ được đặt lên đỉnh của Stack segment, và chỉ khi đó logic của function mới được thực thi. Khi return từ function, stack frame sẽ được pop ra ngoài, và instruction được return address trỏ tới sẽ được thực thi, thường là tiếp tục thực thi function của caller.

Tất cả các biến cục bộ<a id="_idIndexMarker072"></a> được khai báo trong thân function đều được đặt trên đỉnh của Stack segment. Vì vậy, khi rời khỏi function, tất cả các biến trên Stack đều được giải phóng. Đó là lý do tại sao chúng ta gọi chúng là các *local variable* và đó là lý do tại sao một function không thể truy cập các biến trong một function khác. Cơ chế này cũng giải thích tại sao các biến cục bộ không được định nghĩa trước khi vào một function và sau khi rời khỏi nó.

Hiểu về Stack segment và cách thức hoạt động của nó là điều tối quan trọng để viết code chính xác và có ý nghĩa. Nó cũng ngăn ngừa các lỗi memory phổ biến xảy ra. Đó cũng là lời nhắc nhở rằng bạn không thể tạo bất kỳ biến nào trên Stack với bất kỳ kích thước nào bạn thích. Stack là một phần memory có hạn, và bạn có thể làm đầy nó và có khả năng nhận được lỗi *stack overflow* (tràn ngăn xếp). Điều này thường<a id="_idIndexMarker073"></a> xảy ra khi chúng ta có quá nhiều function call tiêu tốn toàn bộ Stack segment bởi các stack frame của chúng. Điều này rất phổ biến khi xử lý các hàm đệ quy (recursive function), khi một function tự gọi chính nó mà không có bất kỳ điều kiện ngắt (break condition) hoặc giới hạn nào.

<a id="_idParaDest-30"></a>

### Pass-by-value so với pass-by-reference

Trong hầu hết các sách lập trình<a id="_idIndexMarker074"></a> máy tính, đều có một phần dành riêng cho pass-by-value và pass-by-reference liên quan đến các đối số<a id="_idIndexMarker075"></a> được truyền tới một function. May mắn thay, hoặc không may, chúng ta chỉ có duy nhất pass-by-value trong C.

Không có reference (tham chiếu) nào trong C, vì vậy cũng không có pass-by-reference. Mọi thứ đều được sao chép vào các biến cục bộ của function, và bạn không thể đọc hay sửa đổi chúng sau khi rời khỏi một function.

Bất chấp nhiều ví dụ dường như minh họa cho các lệnh gọi hàm pass-by-reference, tôi phải nói rằng truyền theo tham chiếu là một ảo ảnh trong C. Trong phần còn lại của mục này, chúng tôi muốn vạch trần ảo ảnh này và thuyết phục bạn rằng những ví dụ đó thực chất cũng là pass-by-value. Ví dụ sau đây sẽ chứng minh điều này:

```
#include <stdio.h>
void func(int a) {
  a = 5;
}
int main(int argc, char** argv) {
  int x = 3;
  printf("Before function call: %d\n", x);
  func(x);
  printf("After function call: %d\n", x);
  return 0;
}
```

*Code Box 1-29 [ExtremeC_examples_chapter1_17.c]: Một ví dụ về lời gọi hàm pass-by-value*

Thật dễ dàng để dự đoán kết quả đầu ra. Không có gì thay đổi<a id="_idIndexMarker076"></a> đối với biến `x`<a id="_idIndexMarker077"></a> vì nó được truyền theo giá trị (passed by value). Shell box sau đây hiển thị kết quả đầu ra của *ví dụ 1.17* và xác nhận dự đoán của chúng ta:

```
$ gcc ExtremeC_examples_chapter1_17.c
$ ./a.out
Before function call: 3
After function call: 3
$
```

*Shell Box 1-10: Output của ví dụ 1.17*

Ví dụ sau đây, *ví dụ 1.18*, chứng minh rằng truyền theo tham chiếu (passing by reference) không tồn tại trong C:

```
#include <stdio.h>
void func(int* a) {
  int b = 9;
  *a = 5;
  a = &b;
}
int main(int argc, char** argv) {
  int x = 3;
  int* xptr = &x;
  printf("Value before call: %d\n", x);
  printf("Pointer before function call: %p\n", (void*)xptr);
  func(xptr);
  printf("Value after call: %d\n", x);
  printf("Pointer after function call: %p\n", (void*)xptr);
  return 0;
}
```

*Code Box 1-30 [ExtremeC_examples_chapter1_18.c]: Một ví dụ về lời gọi hàm pass-by-pointer, khác với pass-by-reference*

Và đây là kết quả đầu ra:

```
$ gcc ExtremeC_examples_chapter1_18.c
$ ./a.out
The value before the call: 3
Pointer before function call: 0x7ffee99a88ec
The value after the call: 5
Pointer after function call: 0x7ffee99a88ec
$
```

*Shell Box 1-11: Output của ví dụ 1.18*

Như bạn thấy, giá trị<a id="_idIndexMarker078"></a> của pointer không hề bị thay đổi sau function call. Điều này có nghĩa là pointer được truyền vào dưới dạng một đối số pass-by-value. Việc giải tham chiếu (dereferencing)<a id="_idIndexMarker079"></a> pointer bên trong function `func` đã cho phép truy cập vào biến mà pointer đang trỏ tới. Nhưng bạn thấy rằng việc thay đổi giá trị của tham số pointer bên trong function không làm thay đổi đối số đối ứng của nó trong caller function. Trong một function call ở C, tất cả các đối số đều được truyền theo giá trị (passed by value) và việc giải tham chiếu các pointer cho phép sửa đổi các biến của caller function.

Cũng cần nói thêm rằng ví dụ trên minh họa cho một ví dụ pass-by-pointer, trong đó chúng ta truyền các pointer tới các biến thay vì truyền trực tiếp chúng. Người ta thường khuyên nên sử dụng pointer làm đối số thay vì truyền các object lớn tới một function, nhưng tại sao? Rất dễ đoán. Việc sao chép 8 byte của một đối số pointer hiệu quả hơn nhiều so với việc sao chép hàng trăm byte của một object lớn.

Đáng ngạc nhiên là, việc truyền pointer lại không hiệu quả trong ví dụ trên! Đó là do thực tế kiểu `int` có kích thước 4 byte và việc sao chép nó hiệu quả hơn việc sao chép 8 byte của pointer của nó. Nhưng điều này không đúng đối với structure và mảng. Vì việc sao chép structure và mảng được thực hiện theo kiểu byte-wise, và tất cả các byte trong chúng phải được sao chép từng byte một, nên thường tốt hơn là truyền pointer thay thế.

Bây giờ chúng ta đã nắm được một số chi tiết liên quan đến các function trong C, hãy cùng nói về function pointer.

<a id="_idParaDest-31"></a>

## Function pointer

Sở hữu function pointer là một tính năng siêu việt khác của ngôn ngữ lập trình C. Hai phần trước đã nói về<a id="_idIndexMarker080"></a> variable pointer và function, và phần này sẽ kết hợp chúng lại để bàn luận về một chủ đề thú vị hơn: pointer tới function (pointer to function).

Chúng có rất nhiều ứng dụng, nhưng việc chia nhỏ một binary lớn thành các binary nhỏ hơn và nạp lại chúng trong một file thực thi nhỏ khác là một trong những ứng dụng quan trọng nhất. Điều này đã dẫn đến tính mô-đun hóa (*modularization*) và thiết kế phần mềm. Function pointer là các building block để triển khai<a id="_idIndexMarker081"></a> tính đa hình (polymorphism) trong C++ và cho phép chúng ta mở rộng logic hiện có của mình. Trong phần này, chúng ta sẽ đề cập đến chúng và chuẩn bị cho bạn những chủ đề nâng cao hơn mà chúng ta sẽ khám phá trong các chương tiếp theo.

Giống như một variable pointer address một biến, một function pointer address một function và cho phép bạn gọi gián tiếp function đó. Ví dụ sau đây, *ví dụ 1.19*, có thể là một khởi đầu tốt cho chủ đề này:

```
#include <stdio.h>
int sum(int a, int b) {
  return a + b;
}
int subtract(int a, int b) {
  return a - b;
}
int main() {
  int (*func_ptr)(int, int);
  func_ptr = NULL;
  func_ptr = &sum;
  int result = func_ptr(5, 4);
  printf("Sum: %d\n", result);
  func_ptr = &subtract;
  result = func_ptr(5, 4);
  printf("Subtract: %d\n", result);
  return 0;
}
```

*Code Box 1-31 [ExtremeC_examples_chapter1_19.c]: Dùng một function pointer duy nhất để gọi các hàm khác nhau*

Trong hộp code ở trên, `func_ptr` là một function pointer. Nó chỉ có thể trỏ tới một lớp function cụ thể khớp với chữ ký (signature) của nó. Signature giới hạn pointer chỉ được trỏ tới các function nhận hai đối số số nguyên và trả về một kết quả số nguyên.

Như bạn thấy, chúng ta đã<a id="_idIndexMarker082"></a> định nghĩa hai function có tên là `sum` và `subtract` khớp với signature của pointer `func_ptr`. Ví dụ ở trên sử dụng function pointer `func_ptr` để trỏ riêng rẽ tới các function `sum` và `subtract`, sau đó gọi chúng với cùng các đối số và so sánh kết quả. Đây là kết quả đầu ra của ví dụ:

```
$ gcc ExtremeC_examples_chapter1_19.c
$ ./a.out
Sum: 9
Subtract: 1
$
```

*Shell Box 1-12: Output của ví dụ 1.19*

Như bạn thấy trong *ví dụ 1.19*, chúng ta có thể gọi các function khác nhau cho cùng một danh sách các đối số bằng cách sử dụng một function pointer duy nhất, và đây là một tính năng quan trọng. Nếu bạn đã quen thuộc với lập trình hướng đối tượng (object-oriented programming), điều đầu tiên xuất hiện trong tâm trí là *polymorphism* và *virtual function*. Trên thực tế, đây là cách duy nhất để hỗ trợ polymorphism trong C và<a id="_idIndexMarker083"></a> mô phỏng lại các virtual function của C++. Chúng ta sẽ đề cập đến OOP như một phần của phần thứ ba của cuốn sách, *Object* *<a id="_idIndexMarker084"></a>**Orientation*.

Giống như các variable pointer, điều quan trọng là phải khởi tạo các function pointer một cách thích hợp. Đối với những function pointer không được khởi tạo ngay khi khai báo, bắt buộc phải gán chúng bằng NULL. Việc gán NULL (nullification) cho các function pointer được minh họa trong ví dụ trên, và nó khá tương đồng với các variable pointer.

Người ta thường khuyên nên định nghĩa một *type alias* (bí danh kiểu) mới cho các function pointer. Ví dụ sau đây, *ví dụ 1.20*, minh họa cách thực hiện điều đó:

```
#include <stdio.h>
typedef int bool_t;
typedef bool_t (*less_than_func_t)(int, int);
bool_t less_than(int a, int b) {
  return a < b ? 1 : 0;
}
bool_t less_than_modular(int a, int b) {
  return (a % 5) < (b % 5) ? 1 : 0;
}
int main(int argc, char** argv) {
  less_than_func_t func_ptr = NULL;
  func_ptr = &less_than;
  bool_t result = func_ptr(3, 7);
  printf("%d\n", result);
  func_ptr = &less_than_modular;
  result = func_ptr(3, 7);
  printf("%d\n", result);
  return 0;
}
```

*Code Box 1-32 [ExtremeC_examples_chapter1_20.c]: Dùng một function pointer duy nhất để gọi các hàm khác nhau*

Từ khóa `typedef` cho phép bạn định nghĩa một<a id="_idIndexMarker085"></a> bí danh cho một kiểu đã được định nghĩa. Có hai type alias mới trong ví dụ trước: `bool_t`, là một alias cho kiểu `int`, và kiểu `less_than_func_t`, là một kiểu alias cho kiểu function pointer, `bool_t (*)(int, int)`. Các alias này tăng cường khả năng đọc hiểu cho code và cho phép bạn chọn một cái tên ngắn gọn hơn cho một kiểu dài và phức tạp. Trong C, tên của một kiểu mới thường kết thúc bằng `_t` theo quy ước, và bạn có thể tìm thấy quy ước này trong nhiều type alias tiêu chuẩn khác chẳng hạn như `size_t` và `time_t`.

<a id="_idParaDest-32"></a>

## Structure

Từ góc độ thiết kế, structure là<a id="_idIndexMarker086"></a> một trong những khái niệm nền tảng nhất trong C. Ngày nay, chúng không chỉ có riêng ở C, và bạn có thể tìm thấy các khái niệm song sinh của chúng ở hầu hết mọi ngôn ngữ lập trình hiện đại.

Nhưng chúng ta nên thảo luận về chúng trong lịch sử điện toán khi chưa có ngôn ngữ lập trình nào khác cung cấp một khái niệm như vậy. Trong số nhiều nỗ lực nhằm thoát khỏi các ngôn ngữ lập trình machine-level, việc giới thiệu structure là một bước tiến lớn hướng tới việc có được tính *đóng gói* (*encapsulation*) trong một ngôn ngữ lập trình. Trong hàng ngàn năm, cách chúng ta suy nghĩ không thay đổi nhiều, và encapsulation luôn là phương tiện trung tâm cho suy luận logic của chúng ta.

Nhưng chỉ sau khi có C, cuối cùng chúng ta<a id="_idIndexMarker087"></a> mới có một công cụ, trong trường hợp này là một ngôn ngữ lập trình, có khả năng hiểu được cách chúng ta tư duy và có thể lưu trữ cũng như xử lý các khối xây dựng của suy luận đó. Cuối cùng, chúng ta đã có một ngôn ngữ mô phỏng lại những suy nghĩ và ý tưởng của mình, và tất cả điều này xảy ra khi chúng ta có được structure. Các structure trong C chưa thực sự hoàn hảo so với các cơ chế encapsulation có trong các ngôn ngữ hiện đại, nhưng chúng đã đủ để chúng ta xây dựng một nền tảng mà từ đó tạo ra những công cụ tốt nhất của mình.

<a id="_idParaDest-33"></a>

### Tại sao lại là structure?

Bạn biết rằng mọi ngôn ngữ lập trình đều có<a id="_idIndexMarker088"></a> một số **Primitive Data Types** (**PDTs** - Kiểu dữ liệu nguyên thủy). Sử dụng các PDT này, bạn có thể thiết kế các cấu trúc dữ liệu<a id="_idIndexMarker089"></a> của mình và viết các thuật toán xoay quanh chúng. Các PDT này là một phần của ngôn ngữ lập trình, và chúng không thể bị thay đổi hoặc gỡ bỏ. Ví dụ, bạn không thể có C mà không có các kiểu nguyên thủy `int` và `double`.

Structure phát huy tác dụng khi bạn cần có<a id="_idIndexMarker090"></a> các kiểu dữ liệu do chính bạn tự định nghĩa, và các kiểu dữ liệu có sẵn trong ngôn ngữ là không đủ. **User-Defined Types** (**UDTs** - Kiểu dữ liệu do người dùng tự định nghĩa) là những kiểu được tạo ra bởi người dùng và chúng không phải là một phần có sẵn của ngôn ngữ.

Lưu ý rằng UDT khác với các kiểu mà bạn có thể định nghĩa bằng cách sử dụng `typedef`. Từ khóa `typedef` không thực sự tạo ra một kiểu mới, mà thay vào đó nó định nghĩa một alias (bí danh) hoặc từ đồng nghĩa cho một kiểu đã được định nghĩa. Nhưng structure cho phép bạn đưa các UDT hoàn toàn mới vào chương trình của mình.

Structure có các khái niệm tương đương trong các ngôn ngữ lập trình khác, ví dụ, class trong C++ và Java hoặc package trong Perl. Chúng được coi là những *type-makers* (bộ tạo kiểu) trong các ngôn ngữ này.

<a id="_idParaDest-34"></a>

### Tại sao lại cần user-defined types?

Vậy thì, tại sao chúng ta cần tạo ra<a id="_idIndexMarker091"></a> các kiểu mới trong một chương trình? Câu trả lời cho câu hỏi này tiết lộ các nguyên lý đằng sau việc thiết kế phần mềm và các phương pháp chúng ta sử dụng cho việc phát triển phần mềm hàng ngày. Chúng ta tạo ra các kiểu mới bởi vì chúng ta làm điều đó mỗi ngày bằng bộ não của mình trong các phân tích thường nhật.

Chúng ta không nhìn nhận thế giới xung quanh mình dưới dạng các số nguyên (integer), số thực (double), hay ký tự (character). Chúng ta đã học cách nhóm các thuộc tính có liên quan dưới cùng một đối tượng (object). Chúng ta sẽ thảo luận nhiều hơn về cách chúng ta phân tích môi trường xung quanh trong *Chương 6*, *OOP và Encapsulation*. Nhưng để trả lời cho câu hỏi khởi đầu của chúng ta, chúng ta cần các kiểu mới bởi vì chúng ta sử dụng chúng để phân tích các bài toán của mình ở mức độ logic cao hơn, đủ gần gũi với logic của con người chúng ta.

Ở đây, bạn cần làm quen<a id="_idIndexMarker093"></a> với thuật ngữ *business logic* (logic nghiệp vụ). Business logic là một tập hợp tất cả các thực thể và quy định có trong một nghiệp vụ. Ví dụ, trong business logic của một hệ thống ngân hàng, bạn bắt gặp các khái niệm như khách hàng (client), tài khoản (account), số dư (balance), tiền (money), tiền mặt (cash), thanh toán (payment), và nhiều khái niệm khác, những thứ tồn tại để làm cho các hoạt động như rút tiền trở nên khả thi và có ý nghĩa.

Giả sử bạn phải giải thích một số<a id="_idIndexMarker094"></a> logic ngân hàng hoàn toàn bằng các số nguyên, số thực, hoặc ký tự. Điều đó gần như là bất khả thi. Nếu điều đó có thể khả thi đối với các lập trình viên, thì nó lại gần như vô nghĩa đối với các *chuyên viên phân tích nghiệp vụ* (*business analyst*). Trong một môi trường phát triển phần mềm thực tế có business logic well-defined, các lập trình viên và các chuyên viên phân tích nghiệp vụ hợp tác chặt chẽ với nhau. Do đó, họ cần phải có một bộ thuật ngữ, bảng chú giải thuật ngữ, kiểu dữ liệu, phép toán, quy định, logic chung, v.v.

Ngày nay, một ngôn ngữ lập trình không hỗ trợ các kiểu mới trong hệ thống kiểu (*type system*) của nó có thể bị coi là một ngôn ngữ đã chết. Có lẽ đó là lý do tại sao hầu hết mọi người coi C là một ngôn ngữ lập trình đã chết, chủ yếu là vì họ không thể dễ dàng định nghĩa các kiểu mới của mình trong C, và họ thích chuyển sang một ngôn ngữ higher-level chẳng hạn như C++ hoặc Java. Đúng vậy, việc tạo ra một hệ thống kiểu đẹp mắt trong C không hề dễ dàng, nhưng mọi thứ bạn cần đều hiện diện ở đó.

Ngay cả ngày nay, vẫn có thể có nhiều lý do đằng sau việc lựa chọn C làm ngôn ngữ chính của dự án và chấp nhận nỗ lực tạo lập cũng như duy trì một hệ thống kiểu tốt trong một dự án C, và ngay cả ngày nay nhiều công ty vẫn đang làm điều đó.

Mặc dù thực tế là chúng ta cần các kiểu mới trong phân tích phần mềm hàng ngày của mình, CPU lại không hiểu các kiểu mới này. CPU cố gắng bám sát các PDT và các phép tính nhanh chóng vì chúng được thiết kế để làm điều đó. Vì vậy, nếu bạn có một chương trình được viết bằng ngôn ngữ high-level của mình, nó phải được dịch thành các instruction ở cấp độ CPU, và điều này có thể khiến bạn tiêu tốn nhiều thời gian và tài nguyên hơn.

Theo nghĩa này, may mắn thay, C không cách quá xa so với logic CPU-level, và nó có một hệ thống kiểu có thể được dịch một cách dễ dàng. Bạn có thể đã nghe nói rằng C là một ngôn ngữ lập trình low-level hoặc hardware-level. Đây là một trong những lý do tại sao một số công ty và tổ chức vẫn cố gắng viết và duy trì các framework cốt lõi của họ bằng C, ngay cả ngày nay.

<a id="_idParaDest-35"></a>

### Structure làm nhiệm vụ gì?

Structure đóng gói các giá trị liên quan<a id="_idIndexMarker095"></a> dưới một kiểu thống nhất duy nhất. Như một ví dụ ban đầu, chúng ta có thể nhóm các biến `red`, `green`, và `blue` dưới một kiểu dữ liệu đơn lẻ mới gọi là `color_t`. Kiểu mới này, `color_t`, có thể đại diện cho một màu RGB trong nhiều chương trình khác nhau như một ứng dụng chỉnh sửa hình ảnh. Chúng ta có thể định nghĩa structure C tương ứng như sau:

```
struct color_t {
  int red;
  int green;
  int blue;
};
```

*Code Box 1-33: Một structure trong C biểu diễn một màu RGB*

Như chúng tôi đã nói trước đây, structure thực hiện tính đóng gói (encapsulation). Encapsulation là một trong những khái niệm nền tảng nhất trong thiết kế phần mềm. Đó là về việc nhóm và đóng gói các trường liên quan lại với nhau dưới một kiểu mới. Sau đó, chúng ta có thể sử dụng kiểu mới này để định nghĩa các biến cần thiết. Chúng tôi sẽ mô tả kỹ lưỡng về encapsulation trong *Chương 6*, *OOP và Encapsulation*, khi nói về thiết kế object-oriented.

> Lưu ý rằng chúng tôi sử dụng hậu tố `_t` để đặt tên cho các kiểu dữ liệu mới.

<a id="_idParaDest-36"></a>

### Memory layout

Đối với các lập trình viên C, việc biết chính xác memory layout của một biến structure<a id="_idIndexMarker097"></a> thường rất quan trọng. Việc có một bố cục tồi trong memory có thể gây ra suy giảm hiệu năng trong một số architecture nhất định. Đừng quên rằng chúng ta viết code để tạo ra các instruction cho CPU. Các giá trị được lưu trữ trong memory, và CPU phải có khả năng đọc và ghi chúng đủ nhanh. Việc biết rõ memory layout giúp lập trình viên hiểu được cách thức hoạt động của CPU và điều chỉnh code của họ để đạt được kết quả tốt hơn.

Ví dụ sau đây, *ví dụ 1.21*, định nghĩa một kiểu structure mới, `sample_t`, và khai báo một biến structure, `var`. Sau đó, nó điền một số giá trị vào các trường của nó và in ra kích thước cũng như các byte thực tế của biến trong memory. Bằng cách này, chúng ta có thể quan sát memory layout của biến:

```
#include <stdio.h>
struct sample_t {
  char first;
  char second;
  char third;
  short fourth;
};
void print_size(struct sample_t* var) {
  printf("Size: %lu bytes\n", sizeof(*var));
}
void print_bytes(struct sample_t* var) {
  unsigned char* ptr = (unsigned char*)var;
  for (int i = 0; i < sizeof(*var); i++, ptr++) {
    printf("%d ", (unsigned int)*ptr);
  }
  printf("\n");
}
int main(int argc, char** argv) {
  struct sample_t var;
  var.first = 'A';
  var.second = 'B';
  var.third = 'C';
  var.fourth = 765;
  print_size(&var);
  print_bytes(&var);
  return 0;
}
```

*Code Box 1-34 [ExtremeC_examples_chapter1_21.c]: In ra số byte được cấp phát cho một biến structure*

Khao khát muốn biết chính xác<a id="_idIndexMarker098"></a> memory layout của mọi thứ có một chút gì đó mang tính đặc thù của C/C++, và nó dần biến mất khi các ngôn ngữ lập trình trở nên cao cấp hơn. Ví dụ, trong Java và Python, các lập trình viên có xu hướng ít biết về các chi tiết quản lý memory ở mức rất low-level, và mặt khác, các ngôn ngữ này cũng không cung cấp nhiều chi tiết về memory.

Như bạn thấy trong *Code Box 1-34*, trong C, bạn phải sử dụng từ khóa `struct` trước khi khai báo một biến structure. Do đó, trong ví dụ trước chúng ta có `struct sample_t var`, cho thấy cách bạn nên sử dụng từ khóa trước kiểu structure trong mệnh đề khai báo. Không cần phải nói rằng bạn cần sử dụng dấu `.` (chấm) để truy cập các trường của một biến structure. Nếu đó là một pointer trỏ tới structure, bạn cần sử dụng `->` (mũi tên) để truy cập các trường của nó.

Để tránh phải gõ quá nhiều từ `struct` trong toàn bộ code, khi định nghĩa một kiểu structure mới và khi khai báo một biến structure mới, chúng ta có thể sử dụng `typedef` để định nghĩa một kiểu alias mới cho structure. Sau đây là một ví dụ:

```
typedef struct {
  char first;
  char second;
  char third;
  short fourth;
} sample_t;
```

Bây giờ, bạn có thể khai báo<a id="_idIndexMarker099"></a> biến mà không cần sử dụng từ khóa `struct`:

```
sample_t var;
```

Dưới đây là kết quả đầu ra của ví dụ trước sau khi được biên dịch và thực thi trên một máy macOS. Lưu ý rằng các con số được tạo ra có thể khác nhau tùy thuộc vào hệ thống máy chủ:

```
$ clang ExtremeC_examples_chapter1_21.c
$ ./a.out
Size: 6 bytes
65 66 67 0 253 2
$
```

*Shell Box 1-13: Output của ví dụ 1.21*

Như bạn thấy trong shell box ở trên, `sizeof(sample_t)` đã trả về 6 byte. Memory layout của một biến structure rất giống với một mảng. Trong một mảng, tất cả các phần tử đều nằm liền kề nhau trong memory, và điều này cũng tương tự đối với một biến structure và các trường của nó. Điểm khác biệt là, trong một mảng, tất cả các phần tử đều có cùng một kiểu và do đó có cùng kích thước, nhưng điều này không đúng đối với một biến structure. Mỗi trường có thể có một kiểu khác nhau, và vì vậy, nó có thể có kích thước khác nhau. Không giống như một mảng có kích thước memory dễ dàng tính toán được, kích thước của một biến structure trong memory phụ thuộc vào một vài yếu tố và không thể dễ dàng xác định được.

Lúc đầu, dường như rất dễ dàng để đoán kích thước của một biến structure. Đối với structure trong ví dụ trước, nó có bốn trường, ba trường `char`, và một trường `short`. Với một phép tính đơn giản, nếu chúng ta giả định rằng `sizeof(char)` là 1 byte và `sizeof(short)` là 2 byte, thì mỗi biến thuộc kiểu `sample_t` phải có 5 byte trong memory layout của nó. Nhưng khi nhìn vào kết quả đầu ra, chúng ta thấy rằng `sizeof(sample_t)` là 6 byte. Nhiều hơn 1 byte! Tại sao chúng ta lại có thêm byte thừa này? Một lần nữa, khi nhìn vào các byte trong memory layout của biến structure `var`, chúng ta có thể thấy rằng nó hơi khác so với kỳ vọng của chúng ta là `65 66 67 253 2`.

Để làm rõ điều này và giải thích tại sao kích thước của biến structure lại không phải là 5 byte, chúng ta cần giới thiệu khái niệm *căn chỉnh memory* (*memory alignment*). CPU luôn thực hiện tất cả các tính toán. Bên cạnh đó, nó cần nạp các giá trị từ memory trước khi có thể tính toán bất kỳ điều gì và cần lưu trữ các kết quả trở lại memory sau khi tính toán. Việc tính toán là super-fast bên trong CPU, nhưng việc truy cập memory lại rất chậm khi so sánh với nó. Điều quan trọng là phải biết cách CPU tương tác với memory vì sau đó chúng ta có thể sử dụng<a id="_idIndexMarker100"></a> kiến thức này để tăng tốc một chương trình hoặc debug một vấn đề.

CPU thường đọc một số lượng byte cụ thể trong mỗi lần truy cập memory. Số lượng byte này thường được gọi là một *word* (từ nhớ). Vì vậy, memory được chia thành các word và một word là một đơn vị nguyên tử được CPU sử dụng để đọc từ memory và ghi vào memory. Số lượng byte thực tế trong một word là một yếu tố architecture-dependent. Ví dụ, trong hầu hết các máy 64-bit, kích thước word là 32 bit hoặc 4 byte. Liên quan đến memory alignment, chúng ta nói rằng một biến được căn chỉnh trong memory nếu byte bắt đầu của nó nằm ở đầu của một word. Bằng cách này, CPU có thể nạp giá trị của nó với số lần truy cập memory được tối ưu nhất.

Liên quan đến ví dụ trước, *ví dụ 1.21*, 3 trường đầu tiên, `first`, `second`, và `third`, mỗi trường có kích thước 1 byte, và chúng nằm trong word đầu tiên của bố cục structure, và tất cả chúng đều có thể được đọc chỉ bằng một lần truy cập memory. Về trường thứ tư, `fourth` chiếm 2 byte. Nếu chúng ta bỏ qua memory alignment, byte đầu tiên của nó sẽ là byte cuối cùng của word đầu tiên, điều này làm cho nó không được căn chỉnh (unaligned).

Nếu trường hợp này xảy ra, CPU sẽ bắt buộc phải thực hiện hai lần truy cập memory cùng với việc dịch chuyển một số bit để lấy ra giá trị của trường đó. Đó là lý do tại sao chúng ta thấy một số không bổ sung sau byte `67`. Byte số không<a id="_idIndexMarker101"></a> đã được thêm vào để hoàn thành word hiện tại và cho phép trường thứ tư bắt đầu ở word tiếp theo. Ở đây, chúng ta nói rằng word đầu tiên được đệm thêm một byte số không. Compiler sử dụng kỹ thuật *padding* (đệm) để căn chỉnh các giá trị trong memory. Padding là các byte bổ sung được thêm vào để khớp với sự căn chỉnh.

Hoàn toàn có thể tắt tính năng căn chỉnh này. Trong thuật ngữ C, chúng ta sử dụng một thuật ngữ cụ thể hơn cho các structure được căn chỉnh. Chúng ta nói rằng structure đó không được đóng gói (not packed). Các *packed structure* không được căn chỉnh và việc sử dụng chúng có thể dẫn đến sự không tương thích binary và làm suy giảm hiệu năng. Bạn có thể dễ dàng định nghĩa một structure được đóng gói (packed). Chúng ta sẽ làm điều đó trong ví dụ tiếp theo, *ví dụ 1.22*, ví dụ này khá giống với ví dụ trước, *ví dụ 1.21*. Structure `sample_t` được đóng gói (packed) trong ví dụ này. Code box sau đây cho thấy *ví dụ 1.22*. Lưu ý rằng đoạn code tương tự được thay thế bằng dấu ba chấm:

```
#include <stdio.h>
struct __attribute__((__packed__)) sample_t {
  char first;
  char second;
  char third;
  short fourth;
} ;
void print_size(struct sample_t* var) {
  // ...
}
void print_bytes(struct sample_t* var) {
  // ...
}
int main(int argc, char** argv) {
  // ...
}
```

*Code Box 1-35 [ExtremeC_examples_chapter1_22.c]: Khai báo một packed structure*

Trong shell box sau đây, code trước đó được biên dịch bằng `clang` và chạy trên macOS:

```
$ clang ExtremeC_examples_chapter1_22.c
$ ./a.out
Size: 5 bytes
65 66 67 253 2
$
```

*Shell Box 1-14: Output của ví dụ 1.22*

Như bạn thấy trong *Shell Box 1-14*, kích thước được in ra<a id="_idIndexMarker102"></a> chính xác là những gì chúng ta mong đợi như một phần của *ví dụ 1.21*. Bố cục cuối cùng cũng khớp với kỳ vọng của chúng ta. Các packed structure thường được sử dụng trong các môi trường memory-constrained, nhưng chúng có thể có tác động tiêu cực rất lớn đến hiệu năng trên hầu hết các architecture. Chỉ những CPU đời mới mới có thể xử lý việc đọc một giá trị không được căn chỉnh từ nhiều word mà không phải chịu thêm chi phí phụ. Lưu ý rằng memory alignment được bật theo mặc định.

<a id="_idParaDest-37"></a>

### Structure lồng nhau (Nested structures)

Như chúng tôi đã giải thích trong các<a id="_idIndexMarker103"></a> phần trước, nhìn chung, chúng ta có hai loại<a id="_idIndexMarker104"></a> kiểu dữ liệu trong C. Có những kiểu nguyên thủy đối với ngôn ngữ và có những kiểu do các lập trình viên định nghĩa bằng cách sử dụng từ khóa `struct`. Các kiểu trước là PDT, và các kiểu sau là UDT.

Cho đến nay, các ví dụ về structure của chúng ta đều nói về các UDT (structure) chỉ được tạo thành từ các PDT. Nhưng trong phần này, chúng ta sẽ đưa ra một ví dụ về các UDT (structure) được tạo từ các UDT (structure) khác. Chúng được gọi là *kiểu dữ liệu phức hợp* (*complex data types*), là kết quả của việc lồng ghép một vài structure lại với nhau.

Hãy bắt đầu với ví dụ, *ví dụ 1.23*:

```
typedef struct {
  int x;
  int y;
} point_t;
typedef struct {
  point_t center;
  int radius;
} circle_t;
typedef struct {
  point_t start;
  point_t end;
} line_t;
```

*Code Box 1-36 [ExtremeC_examples_chapter1_23.c]: Khai báo một số structure lồng nhau*

Trong code box trước, chúng ta có ba structure; `point_t`, `circle_t`, và `line_t`. Structure `point_t` là một UDT đơn giản vì nó chỉ được tạo thành từ các PDT, nhưng các structure khác chứa một biến thuộc kiểu `point_t`, điều này làm cho chúng trở thành các UDT phức hợp.

Kích thước của một structure phức hợp được tính toán hoàn toàn giống như một structure đơn giản, bằng cách cộng kích thước của tất cả các trường của nó lại với nhau. Tất nhiên, chúng ta vẫn nên cẩn thận về việc căn chỉnh, bởi vì nó có thể ảnh hưởng đến kích thước của một structure phức hợp. Do đó, `sizeof(point_t)` sẽ là 8 byte nếu `sizeof(int)` là 4 byte. Khi đó, `sizeof(circle_t)` là 12 byte và `sizeof(line_t)` là 16 byte.

> Thông thường, người ta hay gọi<a id="_idIndexMarker105"></a> các biến structure là các đối tượng (object). Chúng hoàn toàn tương tự như các object trong object-oriented programming, và chúng ta sẽ thấy rằng chúng có thể đóng gói cả giá trị<a id="_idIndexMarker106"></a> lẫn function. Vì vậy, hoàn toàn không sai khi gọi chúng là các C object.

<a id="_idParaDest-38"></a>

### Pointer trỏ tới structure (Structure pointers)

Giống như các pointer trỏ tới PDT, chúng ta cũng có thể<a id="_idIndexMarker107"></a> có các pointer trỏ tới UDT. Chúng hoạt động hoàn toàn giống như các PDT pointer. Chúng trỏ tới một address trong memory, và bạn có thể thực hiện các phép toán số học trên chúng giống như với các PDT pointer. Các UDT pointer cũng có các bước số học tương đương với kích thước của UDT. Nếu bạn chưa biết gì về pointer hoặc các phép toán số học được phép trên chúng, vui lòng chuyển đến phần *Pointer* và đọc lại phần đó.

Điều quan trọng cần biết là một biến structure trỏ tới address của trường đầu tiên của biến structure đó. Trong ví dụ trước, *ví dụ 1.23*, một pointer thuộc kiểu `point_t` sẽ trỏ tới address của trường đầu tiên của nó, `x`. Điều này cũng đúng đối với kiểu `circle_t`. Một pointer thuộc kiểu `circle_t` sẽ trỏ tới trường đầu tiên của nó, `center`, và vì nó thực chất là một đối tượng `point_t`, nó sẽ trỏ tới address của trường đầu tiên, `x`, trong kiểu `point_t`. Do đó, chúng ta có thể có 3 pointer khác nhau cùng address cùng một ô trong memory. Đoạn code sau đây sẽ chứng minh điều này:

```
#include <stdio.h>
typedef struct {
  int x;
  int y;
} point_t;
typedef struct {
  point_t center;
  int radius;
} circle_t;
int main(int argc, char** argv) {
  circle_t c;
  circle_t* p1 = &c;
  point_t*  p2 = (point_t*)&c;
  int*      p3 = (int*)&c;
  printf("p1: %p\n", (void*)p1);
  printf("p2: %p\n", (void*)p2);
  printf("p3: %p\n", (void*)p3);
  return 0;
}
```

*Code Box 1-37 [ExtremeC_examples_chapter1_24.c]: Ba pointer khác nhau thuộc ba kiểu khác nhau cùng trỏ tới một byte trong memory*

Và đây là kết quả đầu ra:

```
$ clang ExtremeC_examples_chapter1_24.c
$ ./a.out
p1: 0x7ffee846c8e0
p2: 0x7ffee846c8e0
p3: 0x7ffee846c8e0
$
```

*Shell Box 1-15: Output của ví dụ 1.24*

Như bạn thấy, tất cả<a id="_idIndexMarker108"></a> các pointer đều đang address cùng một byte, nhưng kiểu của chúng lại khác nhau. Điều này thường được sử dụng để mở rộng các structure đến từ các thư viện khác bằng cách thêm nhiều trường hơn. Đây cũng là<a id="_idIndexMarker109"></a> cách chúng ta triển khai tính kế thừa (*inheritance*) trong C. Chúng ta sẽ thảo luận điều này trong *Chương 8*, *Inheritance và Polymorphism*.

Đây là phần cuối cùng trong chương này. Trong chương sắp tới, chúng ta sẽ đi sâu vào C compilation pipeline và cách biên dịch cũng như liên kết (link) một dự án C đúng cách.

<a id="_idParaDest-39"></a>

## Tóm tắt

Trong chương này, chúng ta đã xem lại một số tính năng quan trọng của ngôn ngữ lập trình C. Chúng tôi đã cố gắng đi xa hơn và chỉ ra các khía cạnh thiết kế của các tính năng này cũng như các khái niệm đằng sau chúng. Tất nhiên, việc sử dụng hợp lý một tính năng đòi hỏi sự hiểu biết sâu sắc hơn về các khía cạnh khác nhau của tính năng đó. Như một phần của chương này, chúng ta đã thảo luận những nội dung sau:

- Chúng ta đã nói về giai đoạn tiền xử lý (preprocessing) trong C và cách các chỉ thị khác nhau có thể tác động đến bộ tiền xử lý để nó hoạt động khác đi hoặc tạo ra một đoạn code C cụ thể cho chúng ta.
- Macro và cơ chế mở rộng macro cho phép chúng ta tạo ra code C trước khi chuyển đơn vị dịch (translation unit) sang giai đoạn biên dịch.
- Các chỉ thị điều kiện cho phép chúng ta thay đổi code đã được tiền xử lý dựa trên các điều kiện nhất định và cho phép chúng ta có các code khác nhau cho các tình huống khác nhau.
- Chúng ta cũng đã xem xét các variable pointer, và cách chúng được sử dụng trong C.
- Chúng ta đã giới thiệu các generic pointer và cách chúng ta có thể có một function chấp nhận bất kỳ loại pointer nào.
- Chúng ta đã thảo luận một số vấn đề chẳng hạn như lỗi segmentation fault và dangling pointer để chỉ ra một vài tình huống thảm khốc có thể phát sinh từ việc sử dụng sai pointer.
- Tiếp theo, các function đã được thảo luận, và chúng ta đã ôn lại cú pháp của chúng.
- Chúng ta đã khám phá các khía cạnh thiết kế của function và cách chúng đóng góp vào một chương trình C theo hướng thủ tục (procedural) có cấu trúc đẹp mắt.
- Chúng ta cũng đã giải thích cơ chế gọi hàm (function call) và cách các đối số được truyền tới một function bằng cách sử dụng stack frame.
- Function pointer đã được khám phá trong chương này. Cú pháp mạnh mẽ của function pointer cho phép chúng ta lưu trữ các logic trong các thực thể variable-like và sử dụng chúng sau này. Trên thực tế, chúng là cơ chế nền tảng mà mọi chương trình đơn lẻ ngày nay đều sử dụng để được tải và vận hành.
- Structure cùng với function pointer đã làm phát sinh tính đóng gói (encapsulation) trong C. Chúng ta sẽ nói nhiều hơn về điều này trong phần thứ ba của cuốn sách, *Object Orientation*.
- Chúng tôi đã cố gắng giải thích các khía cạnh thiết kế của structure và tác động của chúng đối với cách chúng ta thiết kế các chương trình trong C.
- Chúng ta cũng đã thảo luận về memory layout của các biến structure và cách chúng được đặt bên trong memory để tối đa hóa việc sử dụng CPU.
- Các structure lồng nhau cũng đã được thảo luận. Chúng ta cũng đã xem xét bên trong các biến structure phức hợp và thảo luận về cách memory layout của chúng sẽ trông như thế nào.
- Là phần cuối cùng trong chương này, chúng ta đã nói về pointer trỏ tới structure.

Chương tiếp theo sẽ là bước đầu tiên của chúng ta trong việc xây dựng một dự án C. C compilation pipeline và cơ chế linking sẽ được thảo luận như một phần của chương tiếp theo. Việc đọc kỹ chương đó sẽ là điều cần thiết để tiếp tục đồng hành cùng cuốn sách và tiến tới các chương sâu hơn.
