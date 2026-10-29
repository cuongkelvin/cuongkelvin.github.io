<a id="_idParaDest-132"></a>

# Chương 09: Abstraction và OOP trong C++ (Abstraction and OOP in C++)

Đây là chương cuối cùng về OOP trong C. Trong chương này, chúng ta sẽ trình bày các chủ đề còn lại và giới thiệu với bạn một paradigm lập trình mới. Ngoài ra, chúng ta khám phá C++ và xem cách nó triển khai các khái niệm object-oriented ở phía sau hậu trường.

Trong chương này, chúng ta sẽ trình bày các chủ đề sau:

- Trước hết, chúng ta thảo luận về *Abstraction*. Điều này tiếp nối thảo luận của chúng ta về inheritance và polymorphism và sẽ là chủ đề cuối cùng chúng ta trình bày trong phần OOP trong C. Chúng tôi cho thấy abstraction giúp chúng ta như thế nào trong việc thiết kế các object model có khả năng mở rộng tối đa và sự phụ thuộc tối thiểu giữa các thành phần khác nhau của nó.
- Chúng ta nói về cách các khái niệm object-oriented đã được triển khai trong một compiler C++ nổi tiếng, trong trường hợp này là `g++`. Trong đó, chúng ta thấy các cách tiếp cận mà chúng ta đã thảo luận cho đến giờ phù hợp chặt chẽ như thế nào với các cách tiếp cận mà `g++` đã chọn để cung cấp cùng các khái niệm.

Hãy bắt đầu chương bằng việc nói về abstraction.

<a id="_idParaDest-133"></a>

## Abstraction

Abstraction có thể có một ý nghĩa rất<a id="_idIndexMarker612"></a> chung trong nhiều lĩnh vực khoa học và kỹ thuật khác nhau. Nhưng trong lập trình, và đặc biệt trong OOP, abstraction về bản chất xử lý các *abstract data type* (kiểu dữ liệu trừu tượng). Trong hướng đối tượng class-based, abstract data type<a id="_idIndexMarker613"></a> cũng giống như *abstract class*. Abstract class là những class đặc biệt mà chúng ta không thể tạo object từ đó; chúng chưa sẵn sàng hay chưa đủ hoàn chỉnh để được dùng cho việc tạo object. Vậy, tại sao chúng ta cần có những class hay kiểu dữ liệu như vậy? Đó là vì khi chúng ta làm việc với các kiểu dữ liệu trừu tượng và tổng quát, chúng ta tránh tạo ra các phụ thuộc chặt chẽ giữa các phần khác nhau của code.

Ví dụ, chúng ta có thể có các quan hệ sau giữa các class *Human* và *Apple*:

*Một object của class Human ăn một object của class Apple.*

*Một object của class Human ăn một object của class Orange.*

Nếu các class mà một object từ class *Human* có thể ăn được mở rộng ra nhiều hơn chỉ *Apple* và *Orange*, chúng ta sẽ <a id="_idIndexMarker614"></a>cần thêm nhiều quan hệ hơn vào class *Human*. Tuy nhiên, thay vào đó, chúng ta có thể tạo một abstract class gọi là *Fruit* là cha của cả hai class *Apple* và *Orange*, và chúng ta có thể đặt quan hệ chỉ giữa *Human* và *Fruit*. Do đó, chúng ta có thể biến hai phát biểu trên thành một:

*Một object của class Human ăn một object từ một subtype của class Fruit.*

Class *Fruit* là trừu tượng vì nó thiếu thông tin về hình dạng, vị, mùi, màu sắc, và nhiều attribute khác của một loại trái cây cụ thể. Chỉ khi chúng ta có một quả táo hay một quả cam, chúng ta mới biết giá trị chính xác của các attribute khác nhau. Các class *Apple* và *Orange* được gọi là *concrete type* (kiểu cụ thể).

Chúng ta thậm chí có thể<a id="_idIndexMarker615"></a> thêm nhiều abstraction hơn. Class *Human* cũng có thể ăn *Salad* hay *Chocolate*. Vì vậy, chúng ta có thể nói:

*Một object của kiểu Human ăn một object từ một subtype của class Eatable.*

Như bạn có thể thấy, mức trừu tượng của *Eatable* thậm chí còn cao hơn của *Fruit*. Abstraction là một kỹ thuật tuyệt vời để thiết kế một object model có sự phụ thuộc tối thiểu vào các concrete type và cho phép object model mở rộng tối đa trong tương lai khi có thêm concrete type được đưa vào hệ thống.

Về ví dụ trên, chúng ta cũng có thể thêm abstraction bằng cách dùng thực tế rằng *Human* là một *Eater*. Khi đó, chúng ta có thể làm cho phát biểu của mình còn trừu tượng hơn:

*Một object từ một subtype của class Eater ăn một object từ một subtype của class Eatable.*

Chúng ta có thể tiếp tục trừu tượng hóa mọi thứ trong một object model và tìm ra các abstract data type trừu tượng hơn mức chúng ta cần để giải quyết vấn đề. Điều này thường được gọi là *over-abstraction* (trừu tượng hóa quá mức). Nó xảy ra <a id="_idIndexMarker616"></a>khi bạn cố tạo ra các abstract data type không có ứng dụng thực tế nào, cho cả nhu cầu hiện tại lẫn tương lai của bạn. Điều này nên được tránh bằng mọi giá vì abstraction có thể gây ra vấn đề, bất chấp mọi lợi ích mà nó mang lại.

Một hướng dẫn chung về lượng abstraction mà chúng ta cần có thể được tìm thấy trong *abstraction principle* (nguyên lý trừu tượng hóa). Tôi lấy trích dẫn sau từ trang Wikipedia của nó [page, https://en.wikipedia.org/wiki/Abstraction_principle_(computer_program](https://en.wikipedia.org/wiki/Abstraction_principle_(computer_programming))ming). Nó đơn giản <a id="_idIndexMarker617"></a>phát biểu:

*Mỗi phần chức năng quan trọng trong một chương trình nên được triển khai ở đúng một chỗ trong source code. Khi các hàm tương tự được thực hiện bởi các đoạn code riêng biệt, nhìn chung sẽ có lợi nếu kết hợp chúng thành một bằng cách trừu tượng hóa các phần khác nhau.*

Dù thoạt nhìn bạn có thể không thấy dấu hiệu nào của hướng đối tượng hay inheritance trong phát biểu này, bằng cách suy nghĩ thêm về nó, bạn sẽ nhận thấy rằng những gì chúng ta đã làm với inheritance đều dựa trên nguyên lý này. Do đó, như một quy tắc chung, bất cứ khi nào bạn không kỳ vọng có các biến thể trong một logic cụ thể, không cần đưa abstraction vào ở điểm đó.

Trong một ngôn ngữ<a id="_idIndexMarker618"></a> lập trình, inheritance và polymorphism là hai khả năng cần thiết để tạo ra abstraction. Một abstract class như *Eatable* là một supertype trong quan hệ với các concrete class của nó, như *Apple*, và điều này đạt được nhờ inheritance.

Polymorphism cũng đóng một vai trò quan trọng. Có những behavior trong một abstract type *không thể* có triển khai mặc định ở mức trừu tượng đó. Ví dụ, *vị* (taste) như một attribute được triển khai bằng một behavior function như `eatable_get_taste` trong class *Eatable* không thể có một giá trị chính xác khi chúng ta đang nói về một object *Eatable*. Nói cách khác, chúng ta không thể tạo một object trực tiếp từ class *Eatable* nếu chúng ta không biết cách định nghĩa behavior function `eatable_get_taste`.

Hàm trên chỉ có thể được định nghĩa khi class con đủ cụ thể. Ví dụ, chúng ta biết rằng các object *Apple* nên trả về *ngọt* (sweet) cho vị của chúng (ở đây chúng ta đã giả định rằng mọi quả táo đều ngọt). Đây là chỗ polymorphism giúp ích. Nó cho phép một class con override các behavior của cha và trả về vị phù hợp, chẳng hạn.

Nếu bạn còn nhớ từ chương trước, các behavior function có thể bị override bởi các class con được <a id="_idIndexMarker619"></a>gọi là *virtual function*. Lưu ý rằng có thể một virtual function hoàn toàn không có định nghĩa nào. Dĩ nhiên, điều này làm cho class sở hữu trở thành trừu tượng.

Bằng cách thêm ngày càng nhiều abstraction, ở một mức nhất định, chúng ta đi đến các class không có attribute nào và chỉ chứa các virtual function không có định nghĩa mặc định. Những class này được gọi là *interface*. Nói <a id="_idIndexMarker620"></a>cách khác, chúng phơi ra các chức năng nhưng hoàn toàn không cung cấp bản triển khai nào, và chúng thường được dùng để tạo ra các phụ thuộc giữa các thành phần khác nhau trong một dự án phần mềm. Ví dụ, trong các ví dụ trên, các class *Eater* và *Eatable* là interface. Lưu ý rằng, giống như abstract class, bạn không được tạo một object từ một interface. Code sau cho thấy tại sao điều này không thể được thực hiện trong code C.

Code box sau là code tương đương được viết cho interface *Eatable* trên bằng C, dùng các kỹ thuật mà chúng ta đã giới thiệu trong chương trước để triển khai inheritance và polymorphism:

```
typedef enum {SWEET, SOUR} taste_t;
// Function pointer type
typedef taste_t (*get_taste_func_t)(void*);
typedef struct {
  // Pointer to the definition of the virtual function
  get_taste_func_t get_taste_func;
} eatable_t;
eatable_t* eatable_new() { ... }
void eatable_ctor(eatable_t* eatable) {
  // We don't have any default definition for the virtual function
  eatable->get_taste_func = NULL;
}
// Virtual behavior function
taste_t eatable_get_taste(eatable_t* eatable) {
  return eatable->get_taste_func(eatable);
}
```

*Code Box 9-1: Interface Eatable trong C*

Như bạn có thể thấy, trong hàm constructor, chúng ta đã đặt pointer `get_taste_func` thành `NULL`. Vì vậy, việc gọi virtual function `eatable_get_taste` có thể dẫn đến segmentation fault. Từ góc nhìn viết code, về cơ bản đó là lý do tại sao chúng ta không được tạo một object từ interface *Eatable*, ngoài những lý do chúng ta biết từ định nghĩa của interface và góc nhìn thiết kế.

Code box sau minh họa cách việc tạo một object từ interface *Eatable*, vốn hoàn toàn khả thi và được phép từ góc nhìn của C, có thể dẫn đến crash và không được làm:

```
eatable_t *eatable = eatable_new();
eatable_ctor(eatable);
taste_t taste = eatable_get_taste(eatable); // Segmentation fault!
free(eatable);
```

*Code Box 9-2: Segmentation fault khi tạo một object từ interface Eatable và gọi một pure virtual function từ nó*

Để ngăn bản thân<a id="_idIndexMarker622"></a> tạo một object từ một abstract type, chúng ta có thể bỏ *allocator function* khỏi public interface của class. Nếu bạn còn nhớ các cách tiếp cận mà chúng ta đã chọn trong chương trước để triển khai inheritance trong C, bằng việc bỏ allocator function, chỉ các class con mới có thể tạo object từ attribute structure của cha.

Khi đó code bên ngoài không còn có thể làm điều đó. Chẳng hạn, trong ví dụ trên, chúng ta không muốn bất kỳ code bên ngoài nào có thể tạo bất kỳ object nào từ structure `eatable_t`. Để làm điều đó, chúng ta cần có attribute structure được forward declare và làm nó thành một incomplete type. Sau đó, chúng ta cần bỏ memory allocator public `eatable_new` khỏi class.

Để tóm tắt những gì chúng ta cần làm để có một abstract class trong C, bạn cần đặt về null các virtual function pointer không được dự định có định nghĩa mặc định ở mức trừu tượng đó. Ở một mức trừu tượng cực kỳ cao, chúng ta có một interface mà mọi function pointer của nó đều là null. Để ngăn bất kỳ code bên ngoài nào tạo object từ các abstract type, chúng ta nên bỏ allocator function khỏi public interface.

Trong phần sau, chúng ta sẽ so sánh các tính năng object-oriented tương tự trong C và C++. Điều này cho chúng ta một ý niệm về cách C++ đã được phát triển từ C thuần.

<a id="_idParaDest-134"></a>

## Các cấu trúc Object-oriented trong C++

Trong phần này, chúng ta<a id="_idIndexMarker623"></a> sẽ so sánh những gì chúng ta đã làm trong C và các cơ chế bên dưới <a id="_idIndexMarker624"></a>được dùng trong một compiler C++ nổi tiếng, trong trường hợp này là `g++`, để hỗ trợ encapsulation, inheritance, polymorphism và abstraction.

Chúng tôi muốn cho thấy rằng có một sự phù hợp chặt chẽ giữa các phương pháp mà các khái niệm object-oriented được triển khai trong C và C++. Lưu ý rằng, từ giờ trở đi, bất cứ khi nào chúng tôi đề cập đến C++, chúng tôi thực ra đang đề cập đến bản triển khai của `g++` như một trong các compiler C++, chứ không phải chuẩn C++. Dĩ nhiên, các bản triển khai bên dưới có thể khác nhau với các compiler khác nhau, nhưng chúng tôi không kỳ vọng thấy nhiều khác biệt. Chúng tôi cũng sẽ dùng `g++` trong một thiết lập Linux 64-bit.

Chúng ta sẽ dùng các kỹ thuật đã thảo luận trước đây để viết một code object-oriented bằng C, và sau đó chúng ta viết cùng chương trình bằng C++, trước khi đi đến kết luận cuối cùng.

<a id="_idParaDest-135"></a>

### Encapsulation

Thật khó để đi sâu vào một compiler C++ và xem nó dùng các kỹ thuật mà chúng ta đã khám phá <a id="_idIndexMarker627"></a>cho đến giờ như thế nào để tạo ra executable cuối cùng<a id="_idIndexMarker628"></a>, nhưng có một mánh khéo léo mà chúng ta có thể dùng để thực sự thấy điều này. Cách làm là so sánh các instruction assembly được sinh ra cho hai chương trình C và C++ tương tự nhau.

Đây chính xác là những gì chúng ta sẽ làm để minh họa rằng compiler C++ rốt cuộc sinh ra cùng các instruction assembly như một chương trình C dùng các kỹ thuật OOP mà chúng ta đã thảo luận trong các chương trước.

*Ví dụ 9.1* là về hai chương trình C và C++ đề cập cùng một logic object-oriented đơn giản. Có một class `Rectangle` trong ví dụ này, có một behavior function để tính diện tích của nó. Chúng ta muốn xem và so sánh code assembly được sinh ra cho cùng behavior function trong cả hai chương trình. Code box sau minh họa phiên bản C:

```
#include <stdio.h>
typedef struct {
  int width;
  int length;
} rect_t;
int rect_area(rect_t* rect) {
  return rect->width * rect->length;
}
int main(int argc, char** argv) {
  rect_t r;
  r.width = 10;
  r.length = 25;
  int area = rect_area(&r);
  printf("Area: %d\n", area);
  return 0;
}
```

*Code Box 9-3 [ExtremeC_examples_chapter9_1.c]: Ví dụ encapsulation trong C*

Và code box sau thể hiện phiên bản C++ của chương trình trên:

```
#include <iostream>
class Rect {
public:
  int Area() {
    return width * length;
  }
  int width;
  int length;
};
int main(int argc, char** argv) {
  Rect r;
  r.width = 10;
  r.length = 25;
  int area = r.Area();
  std::cout << "Area: " << area << std::endl;
  return 0;
}
```

*Code Box 9-4 [ExtremeC_examples_chapter9_1.cpp]: Ví dụ encapsulation trong C++*

Vậy, hãy sinh <a id="_idIndexMarker629"></a>code assembly cho <a id="_idIndexMarker630"></a>các chương trình C và C++ trên:

```
$ gcc -S ExtremeC_examples_chapter9_1.c -o ex9_1_c.s
$ g++ -S ExtremeC_examples_chapter9_1.cpp -o ex9_1_cpp.s
$
```

*Shell Box 9-1: Sinh output assembly cho code C và C++*

Giờ, hãy dump các file `ex9_1_c.s` và `ex9_1_cpp.s` và tìm định nghĩa của các behavior function. Trong `ex9_1_c.s`, chúng ta nên tìm symbol `rect_area`, và trong `ex9_1_cpp.s`, chúng ta nên tìm symbol `_ZN4Rect4AreaEv`. Lưu ý rằng C++ mangle tên symbol, và đó là lý do tại sao bạn cần tìm symbol kỳ lạ này. Name mangling trong C++ đã được thảo luận trong *Chương 2*, *Biên dịch và Liên kết (Compilation and Linking)*.

Đối với chương trình C, sau đây là assembly được sinh ra cho hàm `rect_area`:

```
$ cat ex9_1_c.s
...
rect_area:
.LFB0:
    .cfi_startproc
    pushq   %rbp
    .cfi_def_cfa_offset 16
    .cfi_offset 6, -16
    movq    %rsp, %rbp
    .cfi_def_cfa_register 6
    movq    %rdi, -8(%rbp)
    movq    -8(%rbp), %rax
    movl    (%rax), %edx
    movq    -8(%rbp), %rax
    movl    4(%rax), %eax
    imull   %edx, %eax
    popq    %rbp
    .cfi_def_cfa 7, 8
    Ret
    .cfi_endproc
...
$
```

*Shell Box 9-2: Code assembly được sinh ra của hàm rect_area*

Sau đây là các instruction<a id="_idIndexMarker631"></a> assembly được sinh ra<a id="_idIndexMarker632"></a> cho hàm `Rect::Area`:

```
$ cat ex9_1_cpp.s
...
_ZN4Rect4AreaEv:
.LFB1493:
    .cfi_startproc
    pushq   %rbp
    .cfi_def_cfa_offset 16
    .cfi_offset 6, -16
    movq    %rsp, %rbp
    .cfi_def_cfa_register 6
    movq    %rdi, -8(%rbp)
    movq    -8(%rbp), %rax
    movl    (%rax), %edx
    movq    -8(%rbp), %rax
    movl    4(%rax), %eax
    imull   %edx, %eax
    popq    %rbp
    .cfi_def_cfa 7, 8
    Ret
    .cfi_endproc
...
$
```

*Shell Box 9-3: Code assembly được sinh ra của hàm Rect::Area*

Thật khó tin, chúng giống hệt nhau! Tôi không chắc code C++ biến thành code assembly trên như thế nào, nhưng tôi chắc chắn rằng code assembly được sinh ra cho hàm C trên gần như, với độ chính xác cao, tương đương với code assembly được sinh ra cho hàm C++.

Từ đây chúng ta có thể kết luận rằng compiler C++ đã dùng một cách tiếp cận tương tự cách chúng ta đã dùng trong C, được giới thiệu là *implicit encapsulation* trong *Chương 6*, *OOP và Encapsulation*, để triển khai encapsulation. Giống như những gì chúng ta đã làm với implicit <a id="_idIndexMarker635"></a>encapsulation, bạn có thể thấy trong *Code Box 9-3* rằng một pointer tới attribute structure được truyền cho hàm `rect_area` làm argument đầu tiên.

Trong các instruction assembly được in đậm ở cả hai shell box, các biến `width` và `length` đang được đọc bằng cách cộng vào memory address được truyền làm argument đầu tiên. Argument pointer đầu tiên có thể được tìm thấy trong register `%rdi` theo *System V ABI*. Vì vậy, chúng ta có thể suy ra rằng C++ đã thay đổi hàm `Area` để nhận một argument pointer làm argument đầu tiên, trỏ tới chính object đó.

Lời cuối về encapsulation, chúng ta đã thấy C và C++ liên quan chặt chẽ với nhau như thế nào về encapsulation, ít nhất là trong ví dụ đơn giản này. Hãy xem điều tương tự có đúng với inheritance không.

<a id="_idParaDest-136"></a>

### Inheritance

Việc điều tra inheritance<a id="_idIndexMarker636"></a> dễ hơn encapsulation. Trong C++, <a id="_idIndexMarker637"></a>pointer từ một class con có thể được gán cho pointer từ class cha. Ngoài ra, class con nên có quyền truy cập định nghĩa private của class cha.

Cả hai behavior này ngụ ý rằng C++ đang dùng cách tiếp cận thứ nhất của chúng ta để triển khai inheritance, đã được thảo luận trong chương trước, *Chương 8, Inheritance và Polymorphism*, cùng với cách tiếp cận thứ hai. Hãy tham khảo lại chương trước nếu bạn cần nhắc lại hai cách tiếp cận.

Tuy nhiên, inheritance trong C++ có vẻ phức tạp hơn vì C++ hỗ trợ multiple inheritance mà chúng ta không thể hỗ trợ trong cách tiếp cận thứ nhất. Trong phần này, chúng ta sẽ kiểm tra memory layout của hai object được tạo instance từ hai class tương tự trong C và C++, như được minh họa trong *ví dụ 9.2*.

*Ví dụ 9.2* là về một class đơn giản kế thừa từ một class đơn giản khác, cả hai đều không có behavior function nào. Phiên bản C như sau:

```
#include <string.h>
typedef struct {
  char c;
  char d;
} a_t;
typedef struct {
  a_t parent;
  char str[5];
} b_t;
int main(int argc, char** argv) {
  b_t b;
  b.parent.c = 'A';
  b.parent.d = 'B';
  strcpy(b.str, "1234");
  // We need to set a break point at this line to see the memory layout.
  return 0;
}
```

*Code Box 9-5 [ExtremeC_examples_chapter9_2.c]: Ví dụ inheritance trong C*

Và phiên bản C++ nằm trong code box sau:

```
#include <string.h>
class A {
public:
  char c;
  char d;
};
class B : public A {
public:
  char str[5];
};
int main(int argc, char** argv) {
  B b;
  b.c = 'A';
  b.d = 'B';
  strcpy(b.str, "1234");
  // We need to set a break point at this line to see the memory layout.
  return 0;
}
```

*Code Box 9-6 [ExtremeC_examples_chapter9_2.cpp]: Ví dụ inheritance trong C++*

Trước tiên, chúng ta cần <a id="_idIndexMarker640"></a>biên dịch chương trình C và dùng `gdb` để đặt một<a id="_idIndexMarker641"></a> breakpoint ở dòng cuối của hàm `main`. Khi việc thực thi tạm dừng, chúng ta có thể xem xét memory layout cũng như các giá trị hiện có:

```
$ gcc -g ExtremeC_examples_chapter9_2.c -o ex9_2_c.out
$ gdb ./ex9_2_c.out
...
(gdb) b ExtremeC_examples_chapter9_2.c:19
Breakpoint 1 at 0x69e: file ExtremeC_examples_chapter9_2.c, line 19.
(gdb) r
Starting program: .../ex9_2_c.out
Breakpoint 1, main (argc=1, argv=0x7fffffffe358) at ExtremeC_examples_chapter9_2.c:20
20    return 0;
(gdb) x/7c &b
0x7fffffffe261: 65 'A'  66 'B'  49 '1'  50 '2'  51 '3'  52 '4'  0 '\000'
(qdb) c
[Inferior 1 (process 3759) exited normally]
(qdb) q
$
```

*Shell Box 9-4: Chạy phiên bản C của ví dụ 9.2 trong gdb*

Như bạn có thể thấy, chúng ta<a id="_idIndexMarker642"></a> đã in ra bảy ký tự,<a id="_idIndexMarker643"></a> bắt đầu từ address của object `b`, như sau: `'A'`, `'B'`, `'1'`, `'2'`, `'3'`, `'4'`, `'\0'`. Hãy làm tương tự với code C++:

```
$ g++ -g ExtremeC_examples_chapter9_2.cpp -o ex9_2_cpp.out
$ gdb ./ex9_2_cpp.out
...
(gdb) b ExtremeC_examples_chapter9_2.cpp:20
Breakpoint 1 at 0x69b: file ExtremeC_examples_chapter9_2.cpp, line 20.
(gdb) r
Starting program: .../ex9_2_cpp.out
Breakpoint 1, main (argc=1, argv=0x7fffffffe358) at ExtremeC_examples_chapter9_2.cpp:21
21    return 0;
(gdb) x/7c &b
0x7fffffffe251: 65 'A'  66 'B'  49 '1'  50 '2'  51 '3'  52 '4'  0 '\000'
(qdb) c
[Inferior 1 (process 3804) exited normally]
(qdb) q
$
```

*Shell Box 9-5: Chạy phiên bản C++ của ví dụ 9.2 trong gdb*

Như bạn có thể thấy trong hai shell box trên, memory layout và các giá trị được lưu trong các attribute là giống nhau. Bạn không nên bị rối bởi việc có behavior function và attribute cùng nhau trong một class trong C++; chúng sẽ được xử lý riêng rẽ khỏi class. Trong C++, các attribute, bất kể bạn đặt chúng ở đâu trong một class, luôn được gom lại trong cùng một khối memory đối với một object cụ thể, và các hàm sẽ luôn độc lập với các attribute, giống như chúng ta đã thấy khi xem xét *implicit encapsulation* trong *Chương 6*, *OOP và Encapsulation*.

Ví dụ trước minh họa *single inheritance*. Vậy, còn *multiple inheritance* thì sao? Trong<a id="_idIndexMarker644"></a> chương trước, chúng ta đã giải thích tại sao cách tiếp cận thứ nhất của chúng ta để triển khai inheritance trong C không thể hỗ trợ multiple inheritance. Chúng tôi một lần nữa minh họa lý do trong code box sau:

```
typedef struct { ... } a_t;
typedef struct { ... } b_t;
typedef struct {
  a_t a;
  b_t b;
  ...
} c_t;
c_t c_obj;
a_t* a_ptr = (a_ptr*)&c_obj;
b_t* b_ptr = (b_ptr*)&c_obj;
c_t* c_ptr = &c_obj;
```

*Code Box 9-7: Minh họa tại sao multiple inheritance không thể hoạt động với cách tiếp cận thứ nhất mà chúng ta đã đề xuất để triển khai inheritance trong C*

Trong code<a id="_idIndexMarker645"></a> box trên, class `c_t` muốn kế thừa cả hai class `a_t` và `b_t`. Sau khi khai báo các class, chúng ta tạo object `c_obj`. Trong các dòng tiếp theo của code trên, chúng ta tạo các pointer khác nhau.

Một lưu ý quan trọng ở đây là *tất cả những pointer này phải trỏ tới cùng một address*. Các pointer `a_ptr` và `c_ptr` có thể được dùng một cách an toàn với bất kỳ behavior function nào từ các class `a_t` và `c_t`, nhưng pointer `b_ptr` nguy hiểm khi dùng vì nó đang trỏ tới trường a trong class `c_t`, vốn là một object `a_t`. Cố truy cập các trường bên trong `b_t` qua `b_ptr` dẫn đến undefined behavior.

Code sau là phiên bản đúng của code trên, trong đó mọi pointer đều có thể được dùng một cách an toàn:

```
c_t c_obj;
a_t* a_ptr = (a_ptr*)&c_obj;
b_t* b_ptr = (b_ptr*)(&c_obj + sizeof(a_t));
c_t* c_ptr = &c_obj;
```

*Code Box 9-8: Minh họa cách các phép cast nên được cập nhật để trỏ tới đúng các trường*

Như bạn có thể thấy ở dòng thứ ba trong *Code Box 9-8*, chúng ta đã cộng kích thước của một object `a_t` vào address của `c_obj`; điều này rốt cuộc tạo ra một pointer trỏ tới trường `b` trong `c_t`. Lưu ý rằng<a id="_idIndexMarker646"></a> phép cast trong C không làm phép màu nào; nó ở đó để chuyển đổi kiểu và nó không sửa đổi giá trị được chuyển, trong trường hợp trên là memory address. Rốt cuộc, sau phép gán, address từ vế right-hand (bên phải) sẽ được sao chép sang vế left-hand (bên trái).

Giờ, hãy xem <a id="_idIndexMarker647"></a>cùng ví dụ trong C++ qua *ví dụ 9.3*. Giả sử rằng chúng ta có một class `D` kế thừa từ ba class khác nhau, `A`, `B` và `C`. Sau đây là code được viết cho *ví dụ 9.3*:

```
#include <string.h>
class A {
public:
  char a;
  char b[4];
};
class B {
public:
  char c;
  char d;
};
class C {
public:
  char e;
  char f;
};
class D : public A, public B, public C {
public:
  char str[5];
};
int main(int argc, char** argv) {
  D d;
  d.a = 'A';
  strcpy(d.b, "BBB");
  d.c = 'C';
  d.d = 'D';
  d.e = 'E';
  d.f = 'F';
  strcpy(d.str, "1234");
  A* ap = &d;
  B* bp = &d;
  C* cp = &d;
  D* dp = &d;
  // We need to set a break point at this line.
  return 0;
}
```

*Code Box 9-9 [ExtremeC_examples_chapter9_3.cpp]: Multiple inheritance trong C++*

Hãy biên dịch ví dụ và chạy nó với `gdb`:

```
$ g++ -g ExtremeC_examples_chapter9_3.cpp -o ex9_3.out
$ gdb ./ex9_3.out
...
(gdb) b ExtremeC_examples_chapter9_3.cpp:40
Breakpoint 1 at 0x100000f78: file ExtremeC_examples_chapter9_3.cpp, line 40.
(gdb) r
Starting program: .../ex9_3.out
Breakpoint 1, main (argc=1, argv=0x7fffffffe358) at ExtremeC_examples_chapter9_3.cpp:41
41    return 0;
(gdb) x/14c &d
0x7fffffffe25a: 65 'A'  66 'B'  66 'B'  66 'B'  0 '\000'    67 'C'  68 'D'  69 'E'
0x7fffffffe262: 70 'F'  49 '1'  50 '2'  51 '3'  52 '4'  0 '\000'
(gdb)
$
```

*Shell Box 9-6: Biên dịch và chạy ví dụ 9.3 trong gdb*

Như bạn có thể thấy, <a id="_idIndexMarker648"></a>các attribute được đặt kề<a id="_idIndexMarker649"></a> nhau. Điều này cho thấy nhiều object của các class cha đang được giữ bên trong cùng memory layout của object `d`. Còn các pointer `ap`, `bp`, `cp` và `dp` thì sao? Như bạn có thể thấy, trong C++, chúng ta có thể cast ngầm định khi gán một pointer con cho một pointer cha (upcasting).

Hãy xem xét giá trị của những pointer này trong lần thực thi hiện tại:

```
(gdb) print ap
$1 = (A *) 0x7fffffffe25a
(gdb) print bp
$2 = (B *) 0x7fffffffe25f
(gdb) print cp
$3 = (C *) 0x7fffffffe261
(gdb) print dp
$4 = (D *) 0x7fffffffe25a
(gdb)
```

*Shell Box 9-7: In các address được lưu trong các pointer trong ví dụ 9.3*

Shell box trên cho thấy address bắt đầu của object d, được hiển thị là `$4`, giống với address đang được ap trỏ tới, được hiển thị là `$1`. Vì vậy, điều này cho thấy rõ rằng C++ đặt một object thuộc kiểu *A* làm trường đầu tiên trong attribute structure tương ứng của class *D*. Dựa trên các address trong các pointer và kết quả chúng ta nhận được từ lệnh `x`, một object thuộc kiểu *B* và sau đó một object thuộc kiểu *C*, được đặt vào cùng memory layout thuộc về object `d`.

Ngoài ra, các address trên cho thấy rằng phép cast trong C++ không phải là một thao tác thụ động, và nó có thể thực hiện một số phép tính số học pointer trên address được chuyển trong khi chuyển đổi kiểu. Ví dụ, trong *Code Box 9-9*, khi gán pointer `bp` trong hàm `main`, năm byte hay `sizeof(A)`, được cộng vào address của `d`. Điều này được thực hiện để vượt qua vấn đề chúng ta gặp phải khi triển khai multiple inheritance trong C. Giờ, những pointer này có thể dễ dàng được dùng trong mọi behavior function mà bạn không cần tự làm phép tính số học. Một lưu ý quan trọng, phép cast trong C và phép cast trong C++ là khác nhau, và bạn có thể thấy behavior khác nếu bạn giả định rằng phép cast trong C++ cũng thụ động như phép cast trong C.

Giờ là lúc xem xét những điểm tương đồng giữa C và C++ trong trường hợp polymorphism.

<a id="_idParaDest-137"></a>

### Polymorphism

So sánh các <a id="_idIndexMarker652"></a>kỹ thuật bên dưới để có<a id="_idIndexMarker653"></a> polymorphism trong C và C++ không phải là một việc dễ dàng. Trong chương trước, chúng ta đã nghĩ ra một phương pháp đơn giản để có một behavior function polymorphic trong C, nhưng C++ dùng một cơ chế tinh vi hơn nhiều để mang lại polymorphism, dù ý tưởng cơ bản bên dưới vẫn như nhau. Nếu chúng ta muốn tổng quát hóa cách tiếp cận của mình để triển khai polymorphism trong C, chúng ta có thể làm như pseudo-code có thể thấy trong code box sau:

```
// Typedefing function pointer types
typedef void* (*func_1_t)(void*, ...);
typedef void* (*func_2_t)(void*, ...);
...
typedef void* (*func_n_t)(void*, ...);
// Attribute structure of the parent class
typedef struct {
  // Attributes
  ...
  // Pointers to functions
  func_1_t func_1;
  func_2_t func_2;
  ...
  func_n_t func_t;
} parent_t;
// Default private definitions for the
// virtual behavior functions
void* __default_func_1(void* parent, ...) {  // Default definition }
void* __default_func_2(void* parent, ...) {  // Default definition }
...
void* __default_func_n(void* parent, ...) {  // Default definition }
// Constructor
void parent_ctor(parent_t *parent) {
  // Initializing attributes
  ...
  // Setting default definitions for virtual
  // behavior functions
  parent->func_1 = __default_func_1;
  parent->func_2 = __default_func_2;
  ...
  parent->func_n = __default_func_n;
}
// Public and non-virtual behavior functions
void* parent_non_virt_func_1(parent_t* parent, ...) { // Code }
void* parent_non_virt_func_2(parent_t* parent, ...) { // Code }
...
void* parent_non_virt_func_m(parent_t* parent, ...) { // Code }
// Actual public virtual behavior functions
void* parent_func_1(parent_t* parent, ...) {
  return parent->func_1(parent, ...);
}
void* parent_func_2(parent_t* parent, ...) {
  return parent->func_2(parent, ...);
}
...
void* parent_func_n(parent_t* parent, ...) {
  return parent->func_n(parent, ...);
}
```

*Code Box 9-10: Pseudo-code minh họa cách các virtual function có thể được khai báo và định nghĩa trong code C*

Như bạn có thể thấy<a id="_idIndexMarker655"></a> trong pseudo-code trên, class cha phải duy trì một danh sách function pointer trong attribute structure của nó. Những function<a id="_idIndexMarker656"></a> pointer này (trong class cha) hoặc trỏ tới các định nghĩa mặc định cho các virtual function, hoặc chúng là null. Lớp giả (pseudo-class) được định nghĩa trong *Code Box 9-10* có `m` behavior function non-virtual và `n` behavior function virtual.

> **Lưu ý**:
>
> Không phải mọi behavior function đều là polymorphic. Các behavior function polymorphic được gọi là virtual<a id="_idIndexMarker657"></a> behavior function hay đơn giản là virtual function. Trong một số ngôn ngữ, như Java, chúng được gọi là *virtual method*.

Các hàm Non-virtual không phải là polymorphic, và bạn không bao giờ có được các behavior khác nhau bằng việc gọi chúng. Nói cách khác, một lời gọi tới một hàm non-virtual là một lời gọi hàm đơn giản và nó chỉ thực hiện logic bên trong định nghĩa và không chuyển tiếp lời gọi tới một hàm khác. Tuy nhiên, các virtual function cần chuyển hướng lời gọi tới một hàm phù hợp, được đặt bởi constructor của cha hoặc của con. Nếu một class con muốn override một số virtual function được kế thừa, nó nên cập nhật các virtual function pointer.

> **Lưu ý**:
>
> Kiểu `void*` cho các biến output có thể được thay bằng bất kỳ kiểu pointer nào khác. Tôi đã dùng một generic pointer để cho thấy rằng bất cứ thứ gì cũng có thể được trả về từ các hàm trong pseudo-code.

Đoạn pseudo-code sau cho thấy cách một class con override một vài virtual function có trong *Code Box 9-10*:

```
Include everything related to parent class ...
typedef struct {
  parent_t parent;
  // Child attributes
  ...
} child_t;
void* __child_func_4(void* parent, ...) { // Overriding definition }
void* __child_func_7(void* parent, ...) { // Overriding definition }
void child_ctor(child_t* child) {
  parent_ctor((parent_t*)child);
  // Initialize child attributes
  ...
  // Update pointers to functions
  child->parent.func_4 = __child_func_4;
  child->parent.func_7 = __child_func_7;
}
// Child's behavior functions
...
```

*Code Box 9-11: Pseudo-code trong C minh họa cách một class con có thể override một số virtual function được kế thừa từ class cha*

Như bạn có thể thấy trong *Code Box 9-11*, class con chỉ cần cập nhật một vài pointer trong attribute structure của cha. C++ chọn một cách tiếp cận tương tự. Khi bạn khai báo một behavior function là virtual (dùng từ khóa `virtual`), C++ tạo ra một mảng function pointer, khá giống với cách chúng ta đã làm trong *Code Box 9-10*.

Như bạn có thể thấy, chúng ta đã thêm một attribute function pointer cho mỗi virtual function, nhưng C++ có một cách thông minh hơn<a id="_idIndexMarker660"></a> để giữ những pointer này. Nó chỉ dùng một mảng <a id="_idIndexMarker661"></a>gọi là *virtual table* hay *vtable*. Virtual table được tạo ra khi một object sắp được tạo ra. Nó được điền trước tiên khi gọi constructor của class base, và sau đó trong constructor của class con, giống như chúng ta đã thể hiện trong *Code Box 9-10* và *9-11*.

Vì virtual<a id="_idIndexMarker662"></a> table chỉ được điền trong các constructor, nên tránh gọi một method polymorphic trong một constructor, dù ở class cha hay class con, vì pointer của nó có thể chưa được cập nhật và nó có thể đang trỏ tới một định nghĩa không đúng.

Là thảo luận cuối cùng của chúng ta về các cơ chế bên dưới được dùng để có các khái niệm object-oriented khác nhau trong C và C++, chúng ta sẽ nói về abstraction.

<a id="_idParaDest-138"></a>

### Abstract class

Abstraction trong C++ là <a id="_idIndexMarker663"></a>khả thi nhờ dùng các hàm *pure virtual*. Trong<a id="_idIndexMarker664"></a> C++, nếu bạn định nghĩa một member function là một virtual function và đặt nó bằng không, bạn đã khai báo một pure virtual function. Hãy xem ví dụ sau:

```
enum class Taste { Sweet, Sour };
// This is an interface
class Eatable {
public:
  virtual Taste GetTaste() = 0;
};
```

*Code Box 9-12: Interface Eatable trong C++*

Bên trong class `Eatable`, chúng ta có một virtual function `GetTaste` được đặt bằng không. `GetTaste` là một pure virtual function và làm cho toàn bộ class trở thành trừu tượng. Bạn không còn có thể tạo object từ kiểu *Eatable*, và C++ không cho phép điều này. Ngoài ra, *Eatable* là một interface, vì mọi member function của nó đều là pure virtual. Hàm này có thể bị override trong một class con.

Sau đây cho thấy một class đang override hàm `GetTaste`:

```
enum class Taste { Sweet, Sour };
// This is an interface
class Eatable {
public:
  virtual Taste GetTaste() = 0;
};
class Apple : public Eatable {
public:
  Taste GetTaste() override {
    return Taste::Sweet;
  }
};
```

*Code Box 9-13: Hai class con triển khai interface Eatable*

Các pure virtual function rất giống các virtual function. Address tới các định nghĩa <a id="_idIndexMarker666"></a>thực sự được giữ trong virtual table theo cùng cách như các virtual function, nhưng với một khác biệt. Giá trị ban đầu cho các pointer của pure virtual function là null, không giống các pointer của virtual function thông thường, vốn cần trỏ tới một định nghĩa mặc định trong khi quá trình tạo dựng đang diễn ra.

Không giống một compiler C, vốn không biết gì về các abstract type, một compiler C++ nhận thức được các abstract type và sinh ra một lỗi biên dịch nếu bạn cố tạo một object từ một abstract type.

Trong phần này, chúng ta đã lấy các khái niệm object-oriented khác nhau và so sánh chúng trong C, dùng các kỹ thuật được giới thiệu trong ba chương vừa qua, và trong C++, dùng compiler `g++`. Chúng tôi đã cho thấy rằng, trong hầu hết các trường hợp, các cách tiếp cận mà chúng ta đã dùng phù hợp với các kỹ thuật mà một compiler như `g++` dùng.

<a id="_idParaDest-139"></a>

## Tóm tắt

Trong chương này, chúng ta đã kết thúc việc khám phá các chủ đề trong OOP, bắt đầu từ abstraction và tiếp tục bằng việc cho thấy những điểm tương đồng giữa C và C++ về các khái niệm object-oriented.

Các chủ đề sau đã được thảo luận trong chương này:

- Abstract class và interface đã được thảo luận ban đầu. Dùng chúng, chúng ta có thể có một interface hay một class trừu tượng một phần, có thể được dùng để tạo các class con cụ thể với các behavior polymorphic và khác nhau.
- Sau đó chúng ta đã so sánh output của các kỹ thuật chúng ta đã dùng trong C để đưa vào một số tính năng OOP, với output của những gì `g++` tạo ra. Điều này nhằm minh họa các kết quả giống nhau đến mức nào. Chúng ta đã kết luận rằng các kỹ thuật mà chúng ta đã dùng có thể rất giống nhau về kết quả.
- Chúng ta đã thảo luận sâu hơn về virtual table.
- Chúng ta đã cho thấy cách các pure virtual function (vốn là một khái niệm C++ nhưng có cái tương ứng trong C) có thể được dùng để khai báo các virtual behavior không có định nghĩa mặc định.

Chương tiếp theo là về Unix và sự tương ứng của nó với C. Nó sẽ điểm lại lịch sử của Unix và sự ra đời của C. Nó cũng sẽ giải thích layered architecture (architecture phân lớp) của một hệ thống Unix.
