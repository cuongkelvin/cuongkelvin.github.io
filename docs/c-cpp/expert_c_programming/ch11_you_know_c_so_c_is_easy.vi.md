# Chương 11. Biết C rồi, C++ dễ thôi!

C++ sẽ làm với C điều Algol-68 đã làm với Algol. <sup>\[1\]</sup>

—David L. Jones

<sup>\[1\]</sup> Algol-68 là một ngôn ngữ monster-sized được xây dựng dựa trên Algol-60 nhỏ gọn và thành công. Nó khó hiểu (formal specification được viết bằng denotational semantics), khó triển khai và khó sử dụng. Nhưng ai cũng nói nó "rất mạnh". Algol-68 thực tế đã giết Algol-60 bằng cách thay thế nó, rồi self-destructing trong làn sóng thiếu tính thực tế. Một số người nhận thấy sự tương đồng giữa hai Algol và hai ngôn ngữ C.

Nếu bạn cho rằng C++ không quá phức tạp, vậy protected abstract virtual base pure virtual private destructor là gì, và lần gần nhất bạn cần đến nó là khi nào?

—Tom Cargill, C++ Journal, mùa thu năm 1990

allez-OOP!…abstraction—rút ra những đặc trưng thiết yếu của một thứ…encapsulation—nhóm các type, data và function có liên quan…thể hiện class—cho user-defined type những quyền như predefined type…constructor và destructor…inheritance—tái sử dụng những operation đã được định nghĩa…multiple inheritance—dẫn xuất từ hai base class trở lên…overloading—dùng một tên cho cùng hành động trên những type khác nhau…input/output trong C++…polymorphism—runtime binding…những góc khác của C++…nếu định đến đó, tôi sẽ không xuất phát từ đây…có thể nó rối rắm, nhưng đó là lựa chọn duy nhất…giải trí nhẹ—hội những máy tính đã biến mất

## Allez-OOP!

Bạn biết C, vậy C++ dễ thôi, đúng không? Có lẽ vậy. Phần lớn sách C++ có ba hoặc bốn trăm trang chữ dày đặc. Bạn dễ lạc trong rừng chi tiết, không nhìn thấy cả khu rừng semantics vì những binary tree trước mắt. Mặt khác, với phần lớn mục đích thực tế, C++ là superset của ANSI C. Một số ngoại lệ được liệt kê trong bảng cuối chương. Nhưng để tận dụng ngôn ngữ, hoặc chỉ để hiểu đầy đủ, bạn phải hiểu các khái niệm nền tảng. Đó là điều mọi người muốn nói khi nhắc đến "object-oriented paradigm" và "sự thay đổi tư duy" cần thiết để lập trình C++. Chúng ta sẽ gạt bỏ vẻ bí hiểm và mô tả C++ bằng lời lẽ đơn giản, liên hệ với những feature C quen thuộc.

Điều này tương tự window-interface paradigm, khi chúng ta học cách viết lại chương trình theo quan điểm của window system. Control logic bị đảo inside-out để phù hợp với window\_main\_loop. Object-oriented programming cũng theo hướng đó, nhưng viết lại theo quan điểm của datatype.

Object-Oriented Programming (OOP) không phải ý tưởng mới; khái niệm này đã tồn tại từ khi Simula-67 tiên phong hơn một phần tư thế kỷ trước. Object-oriented programming đương nhiên lấy object làm chủ đề trung tâm. Có nhiều cách định nghĩa software object; phần lớn đều đồng ý rằng yếu tố chính là nhóm data với code xử lý nó và cung cấp những cách tinh vi để coi chúng như một đơn vị. Nhiều ngôn ngữ gọi thứ này là "class". Cũng có những định nghĩa ten-dollar về object-oriented programming mà bạn thường chỉ hiểu được khi đã biết OOP là gì. Chúng thường như sau: Object-oriented programming được đặc trưng bởi inheritance và dynamic binding. C++ hỗ trợ inheritance qua class derivation. Virtual class function cung cấp dynamic binding. Virtual function cho phép encapsulate các chi tiết triển khai của inheritance hierarchy.

Ừ, tất nhiên rồi! Ở đây chúng ta sẽ lướt nhanh qua C++, chỉ mô tả các điểm nổi bật. Bằng cách bỏ qua nhiều chi tiết ít quan trọng, chúng ta sẽ làm rõ framework của ngôn ngữ. Chúng ta xem xét các khái niệm OOP chính rồi tóm tắt những feature C++ hỗ trợ từng khái niệm. Các khái niệm xây dựng trên nhau theo thứ tự logic được trình bày ở đây. Một số ví dụ lập trình cố ý liên quan đến hoạt động hằng ngày như ép nước cam. Juice-squeezing thường không được thực hiện bằng software. Ở đây chúng ta gọi function để làm việc đó nhằm tập trung vào abstraction thay vì chi tiết triển khai lowest-level. Trước tiên, hãy tóm tắt thuật ngữ và mô tả chúng bằng những khái niệm C đã biết (xem Bảng 11-1).

Cho đến khoảng năm 1985, C++ được biết đến với tên "C with classes", nhưng hiện nay nó có nhiều thứ hơn thế rất nhiều. Ở thời điểm đó, nó là một extension khá hợp lý của C, dễ giải thích, triển khai và giảng dạy. Sau đó, nó bị cuốn vào làn sóng hào hứng đến nay vẫn chưa lên đến đỉnh, và rất nhiều feature khác được bổ sung, kể cả những thứ không cần thiết, theo cách nói hình tượng là cả bồn rửa bếp. Để ngăn việc này, có người đề nghị C++ áp dụng "bảo toàn feature": các feature mới phải chịu quy tắc hạn chế tăng trưởng giống giấy phép quán rượu ở Cộng hòa Ireland—ai đề xuất thêm một giấy phép phải nộp lại hai giấy phép đang có để thu hồi. Bạn muốn multiple inheritance? Được thôi—nhưng phải từ bỏ exception và template!

Bảng 11-1. Những khái niệm chính của Object-Oriented Programming

| Thuật ngữ | Định nghĩa |
|---|---|
| Abstraction | Quá trình loại bỏ những chi tiết không quan trọng của một object, chỉ giữ lại các đặc trưng thiết yếu mô tả nó. Abstraction là hoạt động thiết kế. Các khái niệm còn lại là những feature OOP cung cấp abstraction. |
| Class | Một user-defined type, cũng như int là một built-in type. Các built-in type có operation well-defined (phép toán số học, v.v.), và cơ chế class cũng phải cho phép programmer chỉ định operation cho class type họ định nghĩa. Mọi thứ bên trong class được gọi là member của class. <br> Member function của class (các operation) còn được gọi là method. |
| Object | Một variable cụ thể thuộc class type, giống như `j` có thể là một variable cụ thể thuộc type `int`. Object còn được gọi là instance của class. |
| Encapsulation | Nhóm các type, data và function cấu thành một class. Trong C, header file là một ví dụ rất yếu về encapsulation. Nó yếu vì chỉ là quy ước lexical thuần túy; compiler không biết header file như một đơn vị semantic. |
| Inheritance | Đây là khái niệm quan trọng nhất—cho phép một class nhận những data structure và function được mô tả trong một base class đơn giản hơn. Derived class nhận operation và data của base class, có thể chuyên biệt hóa hoặc tùy chỉnh chúng khi cần. Nó cũng có thể thêm các data member và function member mới. Không có ví dụ nào trong C gợi được khái niệm inheritance. C không có thứ gì tương tự feature này. |

C++ là một ngôn ngữ khá lớn. Ví dụ cụ thể: front-end của C compiler có thể khoảng 40.000 dòng; front-end của C++ compiler có thể lớn gấp đôi hoặc hơn.

## Abstraction—Rút ra những đặc trưng thiết yếu của một thứ

Object-oriented programming bắt đầu bằng object-oriented design. Và object-oriented design bắt đầu bằng abstraction.

"Object" là gì? Sử dụng kỹ năng "abstraction" new-found của chúng ta, hãy xét những điểm giống nhau giữa real-world object, chẳng hạn một chiếc xe, và software object. Các thuộc tính chung của chúng được trình bày trong Bảng 11-2.

### Giáo điều software

![image](images/ch11/img11-01.png)

Ý chính: Abstraction

Abstraction là cách nhìn một nhóm "thứ gì đó" (chẳng hạn xe, hóa đơn hoặc chương trình đang thực thi) và nhận ra những đặc điểm chung. Khi đó, bạn có thể bỏ qua các khác biệt không quan trọng và chỉ ghi nhận những data item chủ yếu đặc trưng cho thứ ấy, ví dụ biển số xe, số tiền phải trả hoặc ranh giới address space. Làm như vậy được gọi là "abstraction", và các type của data bạn lưu là "abstract data type". Abstraction nghe như một khái niệm toán học khó, nhưng đừng để bị đánh lừa—thực ra đó là một cách đơn giản hóa.

Bảng 11-2. Ví dụ abstraction

| Ví dụ về ô tô | Đặc tính của object | Ví dụ software: chương trình sắp xếp |
|---|---|---|
| "Xe" | Có tên gọi cho toàn bộ đối tượng | "sort" |
| Input: nhiên liệu \& dầu <br> Output: vận chuyển | Input và output Well-defined | Input: file chưa được sắp xếp <br> Output: file gồm các record đã được sắp xếp |
| Động cơ, hộp số, bơm, v.v. | Cấu thành từ những object self-contained nhỏ hơn | Module, header file, function, data structure |
| Có nhiều chiếc xe và nhiều loại xe khác nhau | Có thể có nhiều instance của object | Chẳng hạn, implementation phải cho phép nhiều user sắp xếp cùng lúc, không dựa vào một vùng làm việc tạm thời global duy nhất. |
| Bơm nhiên liệu không phụ thuộc vào hoặc ảnh hưởng đến bộ rửa kính chắn gió | Những object self-contained nhỏ hơn chỉ tương tác qua các interface well-defined | Routine đọc record phải độc lập với routine so sánh key. |
| Chỉnh sớm thời điểm đánh lửa không phải thao tác lái xe thông thường, nên người lái không có bộ điều khiển trực tiếp làm việc này. | Không thể trực tiếp thao tác, thậm chí không thể nhìn thấy, các chi tiết implementation | User không cần biết hoặc có khả năng tận dụng thuật toán sắp xếp cụ thể đang được dùng, chẳng hạn quicksort, heapsort, shellsort, v.v. |
| Có thể lắp động cơ lớn hơn mà không thay các bộ điều khiển của người lái | Có thể thay đổi implementation mà không | Người triển khai phải có thể thay bằng thuật toán sắp xếp tốt hơn |
|  | thay đổi user interface | mà không ảnh hưởng đến bất kỳ user nào. |

Lưu ý rằng nhiều thuộc tính software ở đây mang tính "nên có". Ngôn ngữ OOP như C++ cung cấp các feature cần thiết để biến những mục tiêu từ trạng thái mong muốn thành sự thật easily-accomplished. Abstraction hữu ích trong software vì nó cho phép programmer:

- che giấu chi tiết không liên quan và tập trung vào những điều thiết yếu.

- cung cấp interface "hộp đen" cho bên ngoài. Interface chỉ định những operation hợp lệ trên object nhưng không cho biết object triển khai chúng bên trong ra sao.

- chia hệ thống phức tạp thành các component độc lập. Điều này giúp giới hạn kiến thức cần biết ở từng nơi và ngăn tương tác thiếu kỷ luật giữa các component.

- tái sử dụng và chia sẻ code.

C hỗ trợ abstraction bằng cách cho user định nghĩa type mới (`struct, enum`) gần tiện dụng như predefined type (`int, char,` v.v.) và sử dụng chúng tương tự. Chúng ta nói "gần tiện dụng" vì C không cho phép định nghĩa lại predefined operator (`*, <<, [], +` v.v.) cho user-defined type. C++ loại bỏ rào cản này. C++ còn cung cấp initialization tự động và có kiểm soát, cleanup khi data hết lifetime và implicit type conversion. Tất cả những điều này hoặc thiếu trong C, hoặc không tồn tại dưới hình thức tiện dụng như vậy.

Abstraction tạo ra abstract data type, và C++ dùng feature class để triển khai nó. Đây là cách nhìn từ trên xuống, xét các thuộc tính của data type. Cũng có thể tiếp cận từ dưới lên, nhìn theo encapsulation: nhóm các data và method khác nhau dùng để triển khai một type.

## Encapsulation—Nhóm các type, data và function có liên quan

Khi bạn nhóm một abstract data type cùng các operation của nó, điều đó được gọi là "encapsulation". Ngôn ngữ Non-OOP không có cơ chế đầy đủ để làm việc này. Không có cách nào bảo C compiler: "Ba function này là những operation hợp lệ duy nhất trên struct type cụ thể này." Cũng không có cách ngăn programmer định nghĩa thêm function truy cập struct theo cách không được kiểm tra hoặc không nhất quán.

### Giáo điều software

![image](images/ch11/img11-01.png)

Ý chính — Class encapsulate code với data liên quan

Khi lập trình mới xuất hiện, chương trình assembler chỉ thao tác được trên bit và word. Khi ngôn ngữ high-level phát triển, chúng cung cấp khả năng truy cập dễ dàng vào những hardware operand ngày càng đa dạng: float, double, long, char, v.v. Một số ngôn ngữ high-level áp dụng strong typing để bảo đảm chỉ thực hiện những operation phù hợp với type của variable. Đây là dạng class sơ khai, vì nó gắn data item với các operation được phép. Các operation thường chỉ giới hạn ở từng hardware instruction, như "floating-point multiply".

Bước phát triển tiếp theo cho phép programmer nhóm nhiều data type thành user-defined record (struct trong C), nhưng không có cách giới hạn những function được thao tác data hoặc kiểm soát truy cập từng field. Nếu một struct có thể được nhìn thấy, bất kỳ phần nào của nó cũng có thể bị sửa theo bất kỳ cách nào. Không có cách gắn function với type để thể hiện rõ chúng thuộc về nhau.

![image](images/ch11/img11-02.png)

Trình độ phát triển hiện nay là những ngôn ngữ object-oriented bảo đảm tính toàn vẹn data bằng cách nhóm user-defined data structure với user-defined function được phép thao tác chúng. Không function nào khác được phép truy cập data. Điều này mở rộng strong typing từ built-in data type sang user-defined data type.

## Thể hiện class—Cho User-Defined type những quyền như predefined type

Cơ chế class của C++ cung cấp encapsulation của OOP. Class là hiện thực software của encapsulation. Class là một type, giống như `char, int, double,` và `struct rec *` đều là type, nên bạn phải khai báo variable của class để làm điều hữu ích. Hầu như mọi việc có thể làm với type cũng có thể làm với class, chẳng hạn lấy kích thước hoặc khai báo variable thuộc class. Hầu như mọi việc có thể làm với variable cũng có thể làm với object: lấy địa chỉ, truyền làm argument, nhận làm giá trị trả về của function, tạo giá trị constant, v.v. Có thể khai báo object (variable thuộc class type) như bất kỳ variable nào khác:

```
Vegetable carrot;
```

Ở đây, `Vegetable` là tên class (chúng ta sẽ sớm nói thêm về cách tạo class), còn `carrot` là object của class đó. Bắt đầu tên class bằng chữ hoa là một quy ước hữu ích.

Class C++ cho phép user-defined type:

- nhóm các user-defined type cùng operation trên chúng.

- có quyền và cách sử dụng giống built-in type.

- xây dựng type phức tạp từ những type cơ bản hơn.

### Giáo điều software

![image](images/ch11/img11-01.png)

Ý chính: Class

Class đơn giản là user-defined type cùng toàn bộ operation của nó.

Class thường được triển khai dưới dạng một struct chứa data, nhóm cùng pointers-to-functions thao tác data đó. Compiler áp dụng strong typing—bảo đảm các function này chỉ được gọi cho object thuộc class, và không function nào khác được gọi cho những object ấy.

Class C++ thực hiện tất cả những điều này. Có thể so sánh nó với struct, và thực tế có thể triển khai thuận tiện bằng struct. Dạng tổng quát là:

```
class classname {
                  availability: declarations
                      . . .
                  availability: declarations
              };
```

## Availability

Availability là keyword cho biết ai có thể truy cập những declaration theo sau. Nó là một trong các keyword sau:

`public:` Những declaration theo sau có thể được nhìn thấy bên ngoài class, có thể được gán, gọi và

thao tác tùy ý. Nên tránh để data là public. Giữ data ở chế độ private làm phép ẩn dụ được trọn vẹn: chỉ bản thân object có thể thay đổi mọi thứ; function bên ngoài phải dùng member function, bảo đảm data chỉ được cập nhật một cách có kỷ luật.

`protected:` Những declaration theo sau có thể được nhìn thấy bởi function bên trong class này và bởi

function trong những class dẫn xuất từ class này.

`private:` Những declaration theo sau chỉ có thể được sử dụng bởi member function của

class này. Private declaration được nhìn thấy bên ngoài class (tên của chúng được biết), nhưng không thể được truy cập.

Còn hai keyword khác, `friend` và `virtual`, ảnh hưởng đến availability. Chúng áp dụng cho từng declaration, thay vì cả nhóm như các keyword trên. Khác với ba cơ chế kiểm soát availability kia, `friend` và `virtual` không có dấu hai chấm theo sau.

`friend` Cho biết function không phải member của class, nhưng có thể truy cập data private và

protected như thể nó là member. Friend có thể là một function khác hoặc một class khác.

`virtual` Chúng ta chưa đề cập các khái niệm dẫn đến nhu cầu này, nên sẽ hoãn giải thích đến

phần sau.

Tôi đã gửi một bài viết chính thức (tài liệu số X3J16/93-0121) tới ủy ban chuẩn hóa C++, đề nghị cả năm keyword availability đều bắt đầu bằng "p", bằng cách đổi `friend` thành `protégé` (điều này còn thúc đẩy quốc tế hóa và diễn đạt tính bất đối xứng của quan hệ theo cách mà `friend` không làm được)`.`Keyword `virtual` nên đổi thành `placeholder`, còn thuật ngữ mô tả "pure", vốn không liên quan đến availability, nên đổi thành "empty". Điều này sẽ tăng nhẹ lexical orthogonality của ngôn ngữ; nếu ủy ban thích thử nghiệm này, họ có thể mở rộng nó sang những phần semantics quan trọng hơn. <sup>\[2\]</sup> Chưa có thông tin họ có chấp nhận hay không…

<sup>\[2\]</sup> Đây không phải đề nghị đùa: keyword `const` được đặt tên sai trong standard C gây ra những vấn đề rất thực tế. Đây là cơ hội tránh vấn đề tương tự và tạo sự nhất quán cho một lĩnh vực gai góc trong C++.

## Declaration

Các declaration chỉ là declaration C thông thường cho function, type (kể cả class khác) hoặc data. Class gắn chúng lại với nhau. Mỗi function declaration trong class cần một implementation, có thể nằm trong class hoặc, thường hơn, được tách ra ngoài. Vì vậy, toàn bộ có thể như sau:

```
class Fruit { public: peel(); slice(); juice();
              private: int weight, calories_per_oz;
            };

// an instance of the class
Fruit melon;
```

Hãy nhớ comment C++ bắt đầu bằng `//` và kéo dài đến cuối dòng.

### Thử thách lập trình

![image](images/ch11/img11-03.png)

Thử compile và chạy chương trình C++…

Đã đến lúc thử một chương trình C++. Source file C++ thường có phần mở rộng `.cpp`, `.cc` hoặc `.C`. Hãy tạo một file như vậy, nhập code trên rồi thêm main program "hello world". Khai báo một vài object thuộc class fruit.

Trên nhiều hệ thống, bạn gọi C++ compiler bằng:

```
CC fruit.cpp
```

So với C, có vẻ bạn phải hét lên để gọi C++ compiler. Hãy compile và chạy file a.out. Chúc mừng—dù chương trình chưa làm được nhiều, bạn đã viết thành công một class C++.

Implementation của member function khi đặt ngoài class có thêm một chút syntactic sugar đặc biệt ở phía trước.

Syntactic sugar `::` nói rằng: "Này! Tôi quan trọng! Tôi tham chiếu đến một thứ trong class."

Vì vậy, thay vì có dạng declaration function C thông thường,

```
return-type                   functionname(parameters) {...};
```

member function (còn gọi là "method") sẽ có dạng

```
return-type Classname ::      functionname(parameters)
{ . . . };
```

`::` được gọi là "scope resolution operator". Identifier đứng trước nó chỉ class cần tìm trong đó. Nếu không có identifier đứng trước, nó có nghĩa là global scope. Nếu đặt implementation của `peel()` trong class, nó có thể như sau:

```
class Fruit { public: void peel(){ printf("in peel"); }
                          slice();
                          juice();
              private: int weight, calories_per_oz;
};
```

Còn nếu tách ra ngoài, nó sẽ như sau

```
class Fruit { public: void peel();
                          slice();
                          juice();
              private: int weight, calories_per_oz;
};

void Fruit::peel(){ printf("in peel"); }
```

Hai cách tương đương về semantics, nhưng cách thứ hai phổ biến hơn và giúp tổ chức source code gọn gàng hơn bằng include file. Cách thứ nhất thường dùng cho function rất ngắn và tự động mở rộng code inline thay vì tạo function call.

#### Thử thách lập trình

![image](images/ch11/img11-03.png)

Viết method body

Viết các phần thân tương tự cho `slice()` và `juice()` của class `Fruit`. Bắt đầu bằng cách sao chép phần thân của peel.

1\. Trong hệ thống thực tế, những method này có lẽ sẽ điều khiển cánh tay robot để chế biến trái cây theo yêu cầu. Trong bài tập này, chỉ cần mỗi method in ra thông báo rằng nó đã được gọi.

2\. Cho các method những parameter và return type hợp lý. Ví dụ, `slice()` nhận integer parameter chỉ số lát mong muốn, `juice()` trả về giá trị float biểu diễn số cc nước ép thu được, v.v. Dĩ nhiên, prototype trong class definition phải khớp function definition.

3\. Thử truy cập data trong phần private của class, trước từ bên trong method rồi từ bên ngoài.

## Gọi method thế nào

Hãy xem cách thú vị để gọi function trong class. Bạn phải đặt trước nó instance, hay variable thuộc class, mà bạn muốn nó thao tác.

```
Fruit melon, orange, banana;

main() {
       melon.slice();
       orange.juice();
       return 0;
}
```

Sau đó object thực hiện operation ấy trên chính nó. Điều này khá giống một số predefined operator; khi viết `i++`, chúng ta nói "lấy object `i` và thực hiện operation post-increment trên nó". Gọi member function trên class object tương đương thuật ngữ "gửi message đến object đó" mà các ngôn ngữ object-oriented khác dùng.

Mọi method đều được truyền ngầm một pointer parameter `this`, cho phép object tham chiếu chính nó trong method. Lưu ý rằng khi ở trong member function, có thể bỏ việc sử dụng tường minh pointer `this`; nó được ngầm hiểu.

```
class Fruit { public: void peel();
 private: int weight, calories_per_oz;
} ;

void Fruit::peel(){ printf("this ptr=%p", this);
                   this->weight--;
                   weight--;}

Fruit apple;
printf("address of apple=%x",&apple);
apple.peel();
```

### Thử thách lập trình

![image](images/ch11/img11-03.png)

Gọi method

1\. Gọi những method `slice()` và `juice()` bạn đã viết trong bài tập trước.

2\. Thử truy cập pointer `this`, argument đầu tiên implicitly-passed cho mọi method.

### Constructor và destructor

Phần lớn class có ít nhất một constructor. Đây là function được gọi ngầm mỗi khi tạo object thuộc class đó, để thiết lập những giá trị ban đầu trong object. Cũng có clean-up function tương ứng, gọi là "destructor", được gọi khi object bị hủy (ra khỏi scope hoặc được trả về heap). Destructor ít phổ biến hơn constructor; bạn viết code để xử lý các nhu cầu kết thúc đặc biệt, garbage collection, v.v. Có người dùng destructor như cách chắc chắn để bảo đảm synchronization lock luôn được giải phóng khi thoát những scope thích hợp. Do đó, destructor không chỉ dọn dẹp object mà còn cả lock object giữ. Constructor và destructor cần thiết vì không ai bên ngoài class truy cập được private data. Vì vậy, cần function có đặc quyền bên trong class để tạo object và điền những giá trị data ban đầu.

Đây là một bước nhảy so với C, nơi bạn chỉ khởi tạo variable bằng assignment trong definition, hoặc thậm chí để nó chưa được khởi tạo. Bạn có thể định nghĩa nhiều constructor function khác nhau và phân biệt chúng bằng argument. Constructor function luôn cùng tên với class và có dạng:

```
Classname :: Classname (arguments) { . . . };
```

Ví dụ fruit:

```
class Fruit { public: peel(); slice(); juice();
               Fruit(int i, int j); // constructor
               ~Fruit(); // destructor
            private: int weight, calories_per_oz;
            } ;


// constructor body
Fruit::Fruit(int i, int j) { weight=i; calories_per_oz=j; }


// object declarations are initialized by the constructor.
Fruit melon(4,5), banana(12,8);
```

Constructor cần thiết vì class thường chứa struct có nhiều field, đòi hỏi initialization phức tạp. Constructor function của object được gọi tự động mỗi khi tạo object thuộc class đó, và programmer không bao giờ nên gọi nó tường minh. Với global static object, constructor tự động được gọi khi chương trình start-up, còn destructor được gọi khi chương trình kết thúc.

Constructor và destructor vi phạm cách tiếp cận "không giấu gì trong tay áo" của C. Chúng có thể ngầm thực hiện khối lượng công việc lớn ở runtime thay programmer, phá vỡ triết lý C rằng không thứ gì trong ngôn ngữ cần được triển khai bằng runtime routine ẩn.

#### Thử thách lập trình

![image](images/ch11/img11-03.png)

Làm việc hủy diệt

Viết phần thân cho destructor của `Fruit`, trong đó có statement `printf()`, rồi khai báo một object `Fruit` ở inner scope. Bạn cần `#include <stdio.h>` ở đầu chương trình. Sau đó compile lại và chạy file a.out, kiểm tra rằng destructor được gọi khi object ra khỏi scope.

## Inheritance — Tái dùng operation đã định

Single inheritance xảy ra khi class chuyên biệt hóa hoặc tinh chỉnh data structure và method của một base class duy nhất. Nó tạo hierarchy tương tự hệ thống phân loại khoa học. Mỗi cấp là sự chuyên biệt hóa của cấp trên. Type inheritance là phần thiết yếu của OOP và là khái niệm không thực sự có trong C. Hãy sẵn sàng cho "bước nhảy khái niệm" đó!

### Giáo điều software

![image](images/ch11/img11-01.png)

Ý chính: Inheritance

Dẫn xuất một class từ class khác sao cho mọi đặc tính của class kia tự động có sẵn. Có thể khai báo những type chia sẻ một phần hoặc toàn bộ đặc tính của các previously-declared type. Có thể chia sẻ một số đặc tính từ nhiều parent type.

Inheritance thường cung cấp mức chuyên biệt hóa tăng dần khi đi từ base class đơn giản (ví dụ vehicle) đến derived class cụ thể hơn (ví dụ passenger car, fire truck hoặc delivery van). Tuy nhiên, nó cũng có thể thu hẹp hoặc mở rộng các operation hiện có. Class `shape` dường như là ví dụ được ưa chuộng trong tài liệu C++. Từ một `shape` cơ bản có thể dẫn xuất các cấu hình chuyên biệt hơn như `circle,` `square,` và `pentagon`. Chúng tôi cho rằng sẽ dễ hiểu hơn nếu trước tiên xem ví dụ real-world về "class inheritance" trong hệ thống phân loại giới động vật của Linnaeus (xem Hình 11-1), rồi một ví dụ tương tự cho thấy mối quan hệ với mô hình type hiện có của C.

Hình 11-1. Hai ví dụ Real-World về inheritance hierarchy

![image](images/ch11/img11-04.png)

Ví dụ:

- Ngành chordata gồm mọi sinh vật có dây sống (gần tương đương tủy sống), và chỉ những sinh vật đó. Giới động vật có tổng cộng 32 ngành.

- Mọi động vật có vú đều có tủy sống. Chúng thừa hưởng nó do được "dẫn xuất" từ ngành chordata. Động vật có vú còn có những đặc trưng chuyên biệt: nuôi con bằng sữa, chỉ có một xương ở hàm dưới, có lông, một cấu trúc xương nhất định trong tai trong, hai thế hệ răng, v.v.

- Bộ linh trưởng thừa hưởng mọi đặc trưng của động vật có vú, kể cả tủy sống mà động vật có vú thừa hưởng từ chordata. Linh trưởng còn được phân biệt bởi mắt forward-facing, hộp sọ lớn và cấu hình răng cửa đặc thù.

- Họ hominidae thừa hưởng mọi thứ từ linh trưởng và những tổ tiên xa hơn. Nó bổ sung đặc trưng chuyên biệt độc đáo là một số biến đổi bộ xương phù hợp đi thẳng bằng hai chân. Loài homo sapiens hiện là loài duy nhất còn sống trong họ này. Mọi loài khác đã tuyệt chủng.

Trừu tượng hơn một chút, có thể phân tích tương tự hierarchy của các type trong C:

- Mọi type trong C hoặc là composite (như array hoặc struct, cấu thành từ những element nhỏ hơn), hoặc là scalar. Scalar type có thuộc tính mỗi giá trị là atomic, không cấu thành từ những type khác.

- Numeric type thừa hưởng mọi thuộc tính của scalar type và có thêm đặc tính biểu diễn đại lượng số học.

- Integer type thừa hưởng mọi thuộc tính của numeric type và có thêm đặc trưng chỉ thao tác trên số nguyên, không có đại lượng phân số.

Type `char` chiếm một khoảng giá trị nhỏ hơn trong họ integer.

Dù có thể vui với việc chỉ ra inheritance về lý thuyết áp dụng thế nào cho các type C quen thuộc, cần lưu ý mô hình này không có ích thực tế với C programmer. C không cho programmer tạo data type mới có đầy đủ quyền như type sẵn có, càng không cho tạo type thừa hưởng thuộc tính từ data type khác. Vì vậy, programmer không thể dùng type hierarchy trong chương trình thực tế. Một phần quan trọng của OOP là xác định hierarchy của abstract data type trong ứng dụng. Điểm mới chủ yếu C++ cung cấp, khó đạt được chỉ bằng sử dụng C có kỷ luật, là inheritance. Inheritance cho phép programmer thể hiện rõ type hierarchy và dùng những quan hệ đó để điều khiển code.

Hãy tạo class `Apple` có mọi đặc trưng của trái cây và hai operation chuyên biệt riêng. Hai việc người ta làm với táo nhưng thường không làm với các trái cây khác là:

- trò dùng miệng vớt táo. Chẳng hạn không thể chơi với lê, vì lê đặc hơn táo và

chìm xuống. Trò vớt táo được triển khai bằng method `bob_for().`

- làm táo bọc kẹo (người Anh gọi là "toffee apple"). Người ta không làm nho caramel-covered, kể cả ở California. Làm táo bọc kẹo được triển khai bằng method

```
make_candy_apple().
```

Vì vậy, chúng ta tạo `Apple` thành derived class thừa hưởng mọi operation của class `Fruit` và bổ sung hai chuyên biệt hóa riêng này. Đừng mắc kẹt ở cách triển khai những method ấy. Rõ ràng chúng rất xa việc tính toán thông thường. Hãy nhớ chúng ta tập trung vào khái niệm mới, không sa vào thuật toán cụ thể.

#### Giáo điều software

![image](images/ch11/img11-01.png)

C++ inheritance thế nào

Inheritance diễn ra giữa hai class, không phải giữa những function riêng lẻ.

Base class:

```
class Fruit { public: peel(); slice(); juice();
               private: int weight, calories_per_oz;
               } ;
```

Ví dụ về class inheritance:

```
class Apple: public Fruit {
    public:
        void make_candy_apple(float weight);
        void bob_for(int tub_id, int
number_of_attempts);
}
```

Ví dụ khai báo object:

```
Apple teachers;
```

Ví dụ này nói rằng `class Apple` là một chuyên biệt hóa của base class `Fruit`. Keyword `public` ở dòng đầu của class Apple kế thừa điều khiển khả năng truy cập base class từ bên ngoài derived class. Đây là một trong vài khả năng quá chi tiết để trình bày đầy đủ ở đây.

Syntax inheritance ban đầu khá khó làm quen. Sau tên derived class là dấu hai chấm rồi tên base class. Cách viết này ngắn gọn, ít gợi ý đâu là base class, đâu là derived class, và không diễn đạt sự chuyên biệt hóa. Nó không dựa trên idiom C có sẵn, nên orthogonality không giúp định hướng được.

Đừng nhầm việc lồng một class trong class khác với inheritance. Nesting chỉ đưa một class vào class khác mà không có đặc quyền hoặc quan hệ đặc biệt. Nó thường được dùng để đưa vào container class, class triển khai data structure như linked list, hash table, queue, v.v. Nay template đã được thêm vào C++, chúng cũng được dùng cho container class.

Inheritance nói rằng derived class là biến thể của base class, với nhiều quy tắc semantics chi tiết điều chỉnh cách chúng truy cập nhau. Đó là sự khác nhau giữa object nhỏ là một trong nhiều phần của object lớn (nesting), và object là chuyên biệt hóa của parent object tổng quát hơn (inheritance). Chúng ta không nói động vật có vú được lồng trong con chó; có thể nói chó thừa hưởng đặc trưng của động vật có vú. Hãy xác định tình huống của mình và dùng idiom thích hợp.

## Multiple inheritance—Dẫn xuất từ hai base class trở lên

C giúp bạn dễ tự bắn vào bàn chân. C++ khiến việc đó khó hơn, nhưng một khi bắn, nó thổi bay cả chân bạn.

—Bjarne Stroustrup

Multiple inheritance cho phép kết hợp hai class thành một, để object của class kết quả hành xử như object của bất kỳ class nào trong hai class ấy. Nó biến tree hierarchy thành lattice.

Tiếp tục phép ẩn dụ `Fruit`, chúng ta cũng có thể có `class` `Sauces` và nhận thấy một số object là trái cây còn được dùng làm nước xốt. Điều này cho type hierarchy có multiple inheritance, biểu diễn như sau:

![image](images/ch11/img11-05.png)

Một số object declaration hợp lý là:

```
FruitSauce orange, cranberry; // Instances that are sauce and
fruit
```

Multiple inheritance ít phổ biến hơn single inheritance nhiều, và đã gây nhiều tranh luận về việc liệu nó có nên xuất hiện trong ngôn ngữ hay không. Các ngôn ngữ OOP như Smalltalk không có nó; những ngôn ngữ OOP khác như Eiffel có. Cần lưu ý rằng trong thực tế, type hierarchy thường giống Hình 11-2 hơn Hình 11-3 nhiều.

Hình 11-2. Direct inheritance

![image](images/ch11/img11-06.png)

Hình 11-3. Multiple inheritance

![image](images/ch11/img11-07.png)

Multiple inheritance có vẻ là feature khó và error-prone cả trong triển khai lẫn sử dụng. Có người nói chưa có ví dụ thuyết phục nào mà không thể thiết kế theo cách khác để tránh multiple inheritance.

## Overloading—Dùng một tên cho cùng hành động trên những type khác nhau

Overloading đơn giản là tái sử dụng một tên đã có, nhưng dùng nó để thao tác các type khác nhau. Tên đó có thể là tên function hoặc ký hiệu operator. Operator overloading đã có trong C dưới dạng sơ khai. Hầu như mọi ngôn ngữ đều over-load operator cho built-in type.

```
double e,f,g;
int i,j,k;
. . .
e = f+g;   /* floating-point addition */
i = j+k;   /* integer addition */
```

Operation `+` khác nhau trong hai trường hợp. Trường hợp đầu tạo floating-point add instruction, trường hợp sau tạo integer add instruction. Vì cùng thực hiện một operation về mặt khái niệm, tên hoặc operator nên giống nhau. Do C++ cho phép tạo type mới, programmer cũng được phép overload tên và operator cho các type mới đó. Overloading cho phép tái sử dụng tên function và phần lớn operator, `+`, `=`, `*`, `-`, `[]`, và `()`, bổ sung ý nghĩa cho các user-defined class type. Tất cả đều thuộc triết lý OOP coi object là một chỉnh thể.

Theo định nghĩa, overloading luôn được resolve ở compile time. Compiler xem type của operand và kiểm tra đã thấy declaration của operator cho các type ấy chưa. Để giữ programmer tỉnh táo, bạn chỉ nên overload operator cho operation tương tự; đừng overload `*` để nó thực hiện phép chia.

## C++ thực hiện operator overloading như thế nào

Ví dụ, hãy overload operator "`+`" và định nghĩa phép cộng cho class `Fruit`. Trước tiên, thêm prototype của operator vào class:

```
class Fruit { public: void peel(); slice(); juice();

                  int operator+(Fruit &f); // overload "+"
operator

           private: int weight, calories_per_oz;
          } ;
```

Sau đó cung cấp phần thân cho overloaded operator function:

```
int Fruit::operator+(Fruit &f) {

           printf("calling fruit addition\n"); // just so we
can see

           return weight + f.weight;
}
```

Như trước, mọi method được truyền ngầm pointer `this`, cho phép tham chiếu operand bên trái của operator. Operand bên phải của phép cộng ở đây là parameter tên `f`; nó là instance của Fruit, và dấu ampersand đứng trước cho biết nó được truyền bằng reference.

Có thể gọi overloaded function như sau:

```
Apple apple;
Fruit orange;

int ounces = apple+orange;
```

Precedence và số operand ("arity" theo thuật ngữ compiler) của overloaded operator vẫn giống operator gốc. Vậy đấy, C++ nói bạn có thể cộng táo với cam, miễn là định nghĩa trước. C++ cho cụm "operator error" cả một lớp ý nghĩa mới. Overloading cũng rất tiện cho C++ I/O, được mô tả trong phần tiếp theo.

## Input/output trong C++

Ngoài stdio library của C, C++ còn có những I/O routine và khái niệm mới riêng. I/O interface tên `iostream.h` giúp I/O thuận tiện hơn <sup>\[3\]</sup> và phù hợp hơn với triết lý object-oriented.

<sup>\[3\]</sup> Đừng nhầm C++ iostream I/O interface (trước đây gọi là streams) với framework STREAMS không liên quan trong UNIX kernel, dùng để giao tiếp giữa device driver và user process.

Operator `<<` (đặt vào, hay "insert") và `>>` (lấy ra, hay "extract") được dùng thay cho function như `putchar()` và `getchar().` Các operator `<<` và `>>` vẫn dùng để shift trái và phải như trong C, nhưng được overload cho C++ I/O. Compiler xem type của operand để quyết định sinh code cho shift hay I/O. Nếu operand ngoài cùng bên trái là stream, ý định là I/O. Dùng operator thay cho function có bốn lợi thế lớn:

- Có thể định nghĩa các operator cho mọi type. Vì vậy, không cần một function riêng hoặc

tương đương, một format specifier dạng chuỗi như "`%d`", cho mỗi type khác nhau.

- Dùng operator thay cho function có sự thuận tiện về ký pháp khi bạn

muốn xuất nhiều thông điệp. Giống như có thể viết expression `i+j+k+l`, tính left-associativity của operator bảo đảm có thể nối nhiều I/O operand thành chuỗi hợp lý:

```
cout << "the value is " << i << endl;
```

- Nó cung cấp thêm một layer giúp đơn giản hóa việc kiểm soát format và sử dụng các function như

`scanf()`. Hãy thừa nhận rằng họ `scanf()` chắc chắn cần được đơn giản hóa đôi chút, dù manual của nó khá ngắn.

- Có thể, và nên, overload extract operator và insert operator (tên gọi những dấu góc kép này) để đọc hoặc ghi toàn bộ object trong một operation duy nhất. Đây chỉ là ứng dụng của overloading như phần trước đã trình bày.

Trong C++, bạn vẫn có thể dùng những function `stdio.h` của C, nhưng nên chuyển sang feature C++ từ sớm.

## Polymorphism — Runtime binding

Ai cũng đã chơi nethack, nên ai cũng biết polymorphism trong tiếng Hy Lạp có nghĩa là "nhiều hình dạng". Trong C++, nó có nghĩa hỗ trợ những method khác nhau cho các object có liên quan và cho phép runtime binding đến method thích hợp. C++ hỗ trợ điều này bằng overloading—mọi polymorphic method được đặt cùng tên, và runtime system xác định method thích hợp. Điều này cần thiết khi kế thừa: đôi khi không thể biết ở compile time object thuộc base class hay class kế thừa. Quá trình xác định và gọi đúng method được gọi là "late binding"; bạn báo compiler muốn điều đó bằng cách áp dụng keyword `virtual` cho method.

Với compile-time overloading thông thường, signature của các function phải khác nhau đủ để compiler nhìn argument type và biết function nào được định gọi. Với virtual function, signature phải giống hệt nhau và polymorphism được resolve ở runtime. Polymorphism là điểm nổi bật cuối cùng của C++ chúng ta trình bày, và giải thích bằng ví dụ code sẽ dễ hơn bằng văn bản.

### Giáo điều software

![image](images/ch11/img11-01.png)

Ý chính: Polymorphism

Polymorphism là khả năng có một tên cho function hoặc operator và dùng nó cho nhiều derived class type khác nhau. Mỗi object thực hiện một biến thể operation khác nhau theo cách phù hợp với chính nó. Điều này bắt đầu bằng "overloading" tên—dùng lại cùng tên để biểu diễn cùng khái niệm với những object khác nhau. Nó hữu ích vì cho phép đặt tên giống nhau cho những thứ tương tự. Polymorphism xuất hiện khi runtime system chọn function thích hợp trong những function cùng tên đó.

Hãy bắt đầu với base class quen thuộc `Fruit` và thêm method bóc vỏ fruit object. Một lần nữa, chúng ta không viết chi tiết bóc vỏ, chỉ cho nó in thông điệp.

```
#include <stdio.h>
class Fruit { public: void peel(){printf("peeling a base class
fruit\n");}
                       slice();
                       juice();
             private: int weight, calories_per_oz;
            } ;
```

Khi khai báo fruit object và gọi method `peel()` như sau,

```
Fruit banana;
banana.peel();
```

chúng ta nhận được thông điệp

```
peeling a base class fruit
```

Đến đây mọi việc vẫn ổn. Giờ hãy xét việc dẫn xuất class apple và cho nó method bóc vỏ riêng! Rốt cuộc táo được gọt khác chuối: bạn có thể bóc chuối bằng ngón tay cái, nhưng cần dao để gọt táo. Chúng ta biết có thể có method cùng tên, vì C++ xử lý được overloading.

```
class Apple : public Fruit {
       public:
           void peel() {printf("peeling an apple\n");}
           void make_candy_apple(float weight);
};
```

Hãy khai báo pointer tới fruit, rồi cho nó trỏ đến apple object, vốn kế thừa từ class fruit, và xem điều gì xảy ra khi thử bóc vỏ.

```
Fruit * p;
p = new Apple;
p->peel();
```

Ồ! Nếu thử, bạn sẽ nhận output như sau:

```
% CC fruits.cpp
% a.out
peeling a base class fruit
```

Nói cách khác, method riêng của `Apple`, `peel()`, đã không được gọi; `peel()` của base class mới được gọi!

## Giải thích

Lý do là C++ yêu cầu bạn báo trước khi bắt đầu thay method của base class bằng method của derived class. Bạn báo bằng cách thêm keyword `virtual` vào method base class có thể bị thay thế. Giờ bạn hiểu vì sao chúng ta dè dặt chưa giải thích `virtual` khi gặp nó lần đầu ở trang 301. Bạn cần nhiều kiến thức nền, và đến đây chúng ta đã trình bày chúng.

### Mẹo thực hành hữu ích

![image](images/ch11/img11-08.png)

Virtual mà không thực tế

Vì sao `virtual` không phải mặc định? Rốt cuộc, bạn luôn có thể lấy method từ base class bằng cách viết:

```
p->Fruit::peel();
```

Lý do gần giống việc C ban đầu dùng keyword `register`—đó là một tối ưu hóa ngớ ngẩn. Để mọi method call không phải thêm một lần indirection ở runtime, bạn phải báo compiler những method nào cần điều đó.

Từ `virtual` có phần đặt sai tên trong ngữ cảnh này. Ở những nơi khác trong khoa học máy tính, "virtual" nghĩa là cho user nhìn thấy thứ không thực sự có ở đó và duy trì ảo giác bằng cách nào đó. Ở đây nó lại nghĩa là không cho user thấy thứ thực sự có ở đó, tức method của base class. Một keyword có ý nghĩa hơn, dù dài đến mức không thực tế, sẽ là

```
choose_the_appropriate_method_at_runtime_for_whatever_object_t
his_is
```

hoặc đơn giản hơn, `placeholder`.

## C++ thực hiện polymorphism như thế nào

Thêm keyword `virtual` vào method của base class và không thay đổi gì khác cho kết quả

```
#include <stdio.h>
class Fruit {
    public: virtual void peel(){printf("peeling a base class
fruit\n");}
           slice(); juice();
    private: int weight, calories_per_oz;
} ;
```

Và việc compile rồi thực thi là

```
% CC fruits.cpp
% a.out
peeling an apple
```

Đúng như mong muốn. Đến đây, toàn bộ điều này cũng có thể đạt được ở compile time, nhưng polymorphism là hiệu ứng runtime. Nó chỉ quá trình các object C++ quyết định ở runtime function nào phải được gọi để thực hiện operation cụ thể.

Runtime system xem object đã gọi overloaded method và chọn method thuộc class của object đó. Nếu là derived object, chúng ta không muốn nó gọi phiên bản base class mà muốn gọi phiên bản derived class; nhưng compiler có thể chưa thấy phiên bản này khi compile base class. Vì vậy, việc này phải diễn ra động ở runtime, hay theo thuật ngữ C++ là "virtually".

Single inheritance thường được triển khai bằng cách mỗi object chứa pointer `vptr` tới vector `vtbl` gồm các function pointer. Mỗi class có một vector như vậy, và mỗi method trong class có một entry trong vector. Nhờ đó, mọi object thuộc cùng class chia sẻ implementation code. Vector được bố trí sao cho một function pointer nhất định nằm cùng offset trong virtual table của mọi subclass. Mỗi method call có thể được ánh xạ tới offset `vtbl` ở compiletime. Ở runtime, lời gọi diễn ra gián tiếp qua pointer tại offset thích hợp. Multiple inheritance cần cơ chế phức tạp hơn một chút với thêm một layer indirection. Nếu vẫn chưa hiểu, hãy tự vẽ hình; chuyến xe cụ thể này đã đến điểm cuối.

## Những cách dùng polymorphism cầu kỳ

Còn nhiều thủ thuật cầu kỳ có thể làm với polymorphism, và đôi khi nó hoàn toàn thiết yếu. Nó ưu tiên method của derived class hơn method của base class, nhưng vẫn cho dùng method base class nếu chưa định nghĩa method derived class. Đôi khi ở compiletime, method không biết nó đang thao tác object thuộc class của mình hay class dẫn xuất. Polymorphism yêu cầu việc đó phải hoạt động đúng.

```
main() {
   Apple apple;
   Fruit orange;
    Fruit * p;
    p=&apple;
    p->peel();

    p=&orange;
    p->peel();
}
```

Ở runtime, kết quả sẽ là:

```
% a.out
peeling an apple
peeling a base class fruit
```

### Giáo điều software

![image](images/ch11/img11-01.png)

Suy ngẫm sâu—Polymorphism có điểm chung với interposing

Polymorphism và interposing đều cho phép nhiều function có cùng một identifier. Interposing là công cụ khá thô, vì nó bind mọi lần xuất hiện của tên với cùng một definition ở compile time. Polymorphism phân biệt tinh tế hơn, đưa ra quyết định binding theo từng object-by-object ở runtime.

## Những góc khác của C++

Còn nhiều khái niệm C++ nhỏ hơn chưa được đề cập trong lượt điểm qua ngắn gọn các điểm nổi bật này. Cũng còn nhiều quy tắc chi tiết áp dụng cho những khái niệm đã nhắc đến. Tuy nhiên, nếu nắm vững nội dung chương, bạn sẽ hiểu cơ bản các khái niệm OOP và cách diễn đạt chúng trong C++. Bạn sẽ có đủ nền tảng khởi đầu để viết chương trình C++ thử nghiệm. Đó mới là cách thực sự, cũng là cách duy nhất, để học bất kỳ ngôn ngữ lập trình nào.

Trong số những khái niệm chưa đề cập ở đây, C++ còn có:

- Exception: vay mượn từ Ada và Clu, một ngôn ngữ thử nghiệm phát triển ở MIT với ý tưởng chủ đạo là "cluster". Chúng dùng để thay đổi control flow cho error-handling. Chúng đơn giản hóa một số kiểu error-handling bằng cách tự động chuyển việc xử lý đến phần chương trình có thể xử lý lỗi.

- Template: hỗ trợ parameterized type. Tương tự quan hệ class/object, có thể xem template/function như cách tiếp cận "cookie-cutter" cho thuật toán. Khi đã có thuật toán cơ bản, bạn có thể đưa những type khác nhau vào đó. Chúng tương tự

cơ chế `generic` trong Ada và parameterized module trong Clu. Chúng có semantics khá phức tạp. Code sau:

```
template <class T> T min (T a, T b) { return (a < b) ? a :
b; }
```

cho phép gán một type T bất kỳ, đã được định nghĩa operator `<`, cho các variable a, b và function min. Có người gọi template là cơ chế cung cấp compiletime polymorphism. Cách gọi hơi gượng, nhưng ý họ là một operation đã nêu có thể thực hiện trên nhiều type khác nhau và mọi thứ được xác định ở compiletime.

- In-lining function: programmer có thể yêu cầu một function cụ thể được mở rộng in-line trong instruction stream như thể nó là macro, thay vì tạo function call.

- Operator `new` và `delete`, thay cho function call `malloc()` và `free()`. Các

operator thuận tiện hơn đôi chút, chẳng hạn phép tính `sizeof` được thực hiện ngầm và constructor/destructor thích hợp được gọi. `new` thực sự tạo object, trong khi

`malloc` chỉ cấp phát memory.

- Call-by-reference: C chỉ dùng call-by-value, ngoại trừ array. C++ đưa call-by-reference vào ngôn ngữ.

### Giáo điều software

![image](images/ch11/img11-01.png)

Mục tiêu thiết kế C++: Khi ấy là thế. Bây giờ là thế này.

Trích SIGPLAN Notices, tập 21, số 10, tháng 10 năm 1986, "An Overview of C++", Bjarne Stroustrup

Mục 6. Còn thiếu gì?

C++ được thiết kế dưới những ràng buộc nghiêm ngặt về khả năng tương thích, tính nhất quán nội bộ và hiệu quả: không đưa vào feature nào mà

1\. \[1\] gây bất tương thích nghiêm trọng với C ở cấp source hoặc linker.

2\. \[2\] gây overhead về run-time hoặc dung lượng cho chương trình không dùng feature đó.

3\. \[3\] tăng yêu cầu run-time hoặc dung lượng của chương trình C.

4\. \[4\] tăng đáng kể compile time so với C.

5\. \[5\] chỉ triển khai được bằng cách đặt yêu cầu lên môi trường lập trình (linker, loader, v.v.) mà không thể đáp ứng đơn giản và hiệu quả trong môi trường lập trình C truyền thống.

Những feature có thể đã được cung cấp nhưng không được đưa vào vì các tiêu chí này gồm garbage collection, parameterized class, exception, multiple inheritance, hỗ trợ concurrency và tích hợp ngôn ngữ với môi trường lập trình. Không phải mọi extension tiềm năng này thực sự phù hợp với C++; nếu không hết sức kiềm chế khi chọn và thiết kế feature cho ngôn ngữ, kết quả sẽ là một mớ hỗn độn lớn, khó kiểm soát và kém hiệu quả. Những ràng buộc nghiêm ngặt khi thiết kế C++ có lẽ đã có lợi và sẽ tiếp tục định hướng sự phát triển của C++.

Ôi, những năm tháng ấy! Những năm thời Reagan, khi tương cà chua được coi là rau, cây cối là nguồn ô nhiễm chủ yếu, và C++ được bảo đảm sẽ không bị đè nặng bởi parameterized class, exception và multiple inheritance.

## Nếu định đến đó, tôi sẽ không xuất phát từ đây

Ngôn ngữ lập trình có thuộc tính gọi là orthogonality, chỉ mức độ những feature khác nhau tuân theo cùng nguyên tắc nền tảng. Ví dụ trong Ada, programmer học cách package hoạt động cũng có thể áp dụng kiến thức đó cho generic package. Đáng tiếc, phần lớn C++ rất thiếu orthogonality. Nắm vững một feature C++ không cung cấp manh mối hoặc mô hình tư duy áp dụng được cho feature khác. Phần lớn programmer sẽ chọn chỉ dùng một subset C++ đơn giản hơn.

### Giáo điều software

![image](images/ch11/img11-01.png)

Một subset C++ đơn giản

Những feature C++ nên dùng:

- Class

- constructor và destructor, nhưng chỉ với phần thân rất đơn giản

- overloading, kể cả operator overloading và C++ I/O

- single inheritance và polymorphic function

Những feature C++ nên tránh:

- Template

- Exception

- Virtual base class

- Multiple inheritance

Mục đích chủ yếu của ngôn ngữ lập trình là cung cấp framework diễn đạt lời giải bài toán dưới dạng máy tính có thể xử lý. Ngôn ngữ biểu diễn điều đó càng tốt thì càng thành công. Fortran, một trong những ngôn ngữ high-level đầu tiên, cung cấp phương tiện mạnh mẽ để diễn đạt công thức toán học (tên "Fortran" nghĩa là "Formula translation"). COBOL hướng đến xử lý file, số học thập phân và biên tập output, và rất thành công trong lĩnh vực ấy. C cho systems programmer truy cập nhiều hardware-supported operator. Ngôn ngữ không "cản đường" bằng nhiều layer abstraction.

Ngôn ngữ sẽ thành công nếu cấu trúc của nó là những "khối xây dựng" hữu ích để giải bài toán trong lĩnh vực nhất định. Quyết định những "khối xây dựng" ấy là phần quan trọng nhất của thiết kế ngôn ngữ; các chi tiết như chọn dấu chấm phẩy làm dấu kết thúc hay phân cách không thể bỏ qua, nhưng khối xây dựng mới mang tính quyết định. Chất lượng của C++ sẽ được quyết định bởi việc feature của nó có là khối xây dựng tốt để giải những bài toán đáng quan tâm hay không, và programmer thông thường có dùng ngôn ngữ một cách đáng tin cậy được hay không.

Có người khẳng định class C++ sẽ cách mạng hóa việc tái sử dụng software. Tái sử dụng là mục tiêu mơ hồ trong software. Inheritance không nhất thiết là phương thuốc vạn năng như vẻ ngoài. Người có trí nhớ lâu sẽ nhớ những tuyên bố phóng đại về Ada một thập kỷ trước. Hãy ví chương trình máy tính với một cuốn sách. Khi đó, cả hai đều có thư viện. Bạn muốn tái sử dụng vài routine trong chương trình của mình; chúng tương ứng với một số đoạn văn trong sách.

#### Giáo điều software

![image](images/ch11/img11-01.png)

Thử thách thiết kế: Cỗ máy C++

Trước đây, có người đã xây dựng hardware máy tính special-purpose để thực thi một ngôn ngữ cụ thể rất hiệu quả:

Algol-60: các processor Burroughs đời đầu; Lisp: Symbolics Inc.; Ada: Rational Computers

Cỗ máy C++ sẽ trông như thế nào? Vì sao mọi processor dành riêng cho ngôn ngữ đều đi đến kết cục tồi tệ?

Đây là câu hỏi bẫy—không có nguyên nhân chung. Thị trường cho một ngôn ngữ luôn nhỏ hơn thị trường cho máy đa dụng. Workstation đã đánh bại máy Lisp. Chiến tranh Lạnh kết thúc đã giết máy Ada. Burroughs tiếp tục tồn tại như một phần Unisys. Vấn đề là không thể tạo văn bản mới có giá trị bằng cách cắt dán nguyên đoạn từ sách khác. Mức abstraction không đúng. Có thể chia sẻ văn bản ở cấp từng từ hoặc chữ cái, tương ứng với từng dòng code hoặc ký tự, nhưng công sức cắt chúng ra tỉ mỉ lớn hơn công sức tạo lại từ đầu cho tác phẩm mới. Tương tự, thực nghiệm cho thấy tái sử dụng software ở cấp library ít hơn kỳ vọng ban đầu.

Có một số ít routine special-purpose có thể và thực sự được chia sẻ: thư viện toán học, một số routine data structure, thư viện sắp xếp và tìm kiếm. Gần như chỉ có vậy. Chúng tương ứng với sơ đồ hoặc bảng tra trong sách, có thể lấy nguyên và hiểu ở nơi khác.

C++ có thể thành công trong tái sử dụng software hơn ngôn ngữ trước vì kiểu inheritance dựa trên object của nó cho phép kế thừa cả data lẫn code. Ada generic cũng cho phép điều này, nhưng feature Ada cồng kềnh và quá trừu tượng với phần lớn programmer. Tiếp tục ví von trên, C++ giúp mượn sách từ thư viện dễ hơn, nhưng vẫn còn bài toán sao chép những phần liên quan sao cho hợp lý.

## Có thể nó rối rắm \[4\], nhưng đó là lựa chọn duy nhất

<sup>\[4\]</sup> "Crufty /kruhf'tee/ \[không rõ nguồn gốc\] tính từ: có thể over-complex"—The New Hacker's Dictionary, biên tập Eric Raymond, Cambridge, MA, MIT Press, 1991.

Sau khi thấy một số thiếu sót nghiêm trọng của C trong những chương đầu sách, sẽ thật tuyệt nếu có thể nói C++ giải quyết chúng mà vẫn giữ phong vị C. Thật tuyệt, nhưng điều đó sẽ không xảy ra vì không đúng sự thật. C++ có một số cải thiện cục bộ, nhưng giữ lại nhiều khuyết điểm của C và chồng thêm một layer phức tạp lớn. Triết lý ban đầu của C "không có feature nào cần runtime support vô hình" đã bị thỏa hiệp.

### Giáo điều software

![image](images/ch11/img11-01.png)

Những cải thiện của C++ so với C

- Cấu trúc error-prone là khởi tạo char array mà không đủ chỗ cho

nul cuối được coi là lỗi. `char b[3]="Bob";` gây lỗi trong C++, nhưng không gây lỗi trong C.

- Typecast có thể được viết dưới format normal-looking hơn là `float(i)`, bên cạnh

kiểu strange-looking của C là `(float)i`.

- C++ cho phép dùng một constant integer để xác định kích thước array.

- `const int size=128;`

```
char a[size];
```

được phép trong C++, nhưng tạo thông báo lỗi trong C.

- Declaration có thể xen kẽ statement, bỏ yêu cầu của C rằng mọi declaration phải đứng trước mọi statement trong block. Thật tốt khi quy tắc tùy tiện này bị loại bỏ. Vì sửa đổi đã gây bất tương thích với C, sao không đi đến cùng và cung cấp cách thay thế đơn giản hơn, sửa luôn syntax declaration kinh khủng của C?

Dù C++ có thể rối rắm, đó vẫn là lựa chọn duy nhất. Mọi bên tham gia lớn đều ủng hộ nó. Người ta nói hiện mọi phát triển mới ở AT\&T đều dùng C++. Phần đồ họa của Windows NT, vốn ra muộn hơn, chậm hơn và lớn hơn dự kiến, được viết bằng C++. Phần lớn công cụ phát triển software, application library và công nghệ tiên tiến mới nay được viết bằng C++, hoặc ít nhất ANSI C subset của nó. Nhưng bao lâu nữa chúng ta bắt đầu thấy những bug ngoạn mục như vụ mạng AT\&T ngừng hoạt động, do feature C++ gây ra hoặc làm trầm trọng thêm thay vì C? Điều đó không quan trọng. C++ sẽ được dùng rộng rãi bất chấp khuyết điểm, và chúng ta hy vọng cuối cùng nó dẫn đến điều tốt hơn.

#### Mẹo thực hành hữu ích

![image](images/ch11/img11-08.png)

Chuyển từ C sang C++

Cách tốt nhất để bắt đầu C++ là lập trình bằng ANSI C subset của nó. Tránh các translator đời đầu dựa trên cfront, vốn sinh C code thay vì machine code. Dùng C như một machine language portable khiến linking và debugging thực sự phức tạp, vì cfront biến đổi mọi tên function để encode thông tin argument. Name-mangling là một cách chắp vá tệ hại có lẽ còn tồn tại trong C++ rất lâu. Hãy so với Ada, vốn làm đúng và không định nghĩa semantics bằng một implementation chắp vá. Name-mangling là thủ thuật để kiểm tra type giữa các file. Nhưng nó buộc toàn bộ C++ của bạn phải được compile bằng cùng compiler, vì cơ chế name-mangling có thể khác giữa các compiler. Đây là khuyết điểm lớn trong mô hình tái sử dụng của C++, vì thực tế nó ngăn tái sử dụng ở binary level.

Dưới đây là một số ví dụ tiêu biểu về những trường hợp C không phải subset của C++, giúp hình dung những chỗ có thể gặp rắc rối.

Những hạn chế có trong C++ nhưng không có trong C:

- User code không được gọi routine main() trong C++. C cho phép điều này, dù rất hiếm gặp.

- Function prototype là bắt buộc trong C++, nhưng tùy chọn trong C.

- Typedef name không thể trùng struct tag trong C++, nhưng có thể trong C vì chúng thuộc namespace riêng.

- C++ cần cast để gán pointer `void *` cho một pointer type khác; C không yêu cầu cast.

- Những feature C++ mang ý nghĩa khác trong C:

- C++ có hơn một tá keyword mới. Trong chương trình C có thể dùng chúng làm identifier, nhưng cách dùng ấy thường khiến C++ compiler báo lỗi.

- Trong C++, declaration có thể xuất hiện ở bất kỳ nơi nào statement xuất hiện; trong C, declaration phải đứng trước statement trong block.

- Trong C++, struct name ở inner scope che khuất object name ở outer scope, nhưng trong C thì không.

- Character literal có type `char` trong C++, nhưng có type `int` trong C. Nghĩa là,

`sizeof('a')` cho kết quả 1 trong C++ và giá trị lớn hơn trong C.

- Những trường hợp bất thường liên quan đến quy ước comment `//` của C++, như đã trình bày trong

Chương 2.

Còn nhiều khác biệt nữa, nhưng giờ bạn đã biết đủ để trở nên nguy hiểm. Vậy hãy ra ngoài và thử sức. Khi đã thoải mái với compiler và mọi công cụ làm việc trong ANSI C subset, hãy dang cánh và bắt đầu định nghĩa class riêng. Chọn một cuốn sách C++ tốt—xem vài cuốn và chọn phong cách bạn thích. Bảo đảm sách theo kịp ngôn ngữ, vốn vẫn đang phát triển. Bảo đảm nó đề cập exception và template, hai thứ mới được bổ sung gần nhất.

Giống như C, việc chuẩn hóa C++ hiện là nỗ lực chung của ISO (Working Group 21) và ANSI X3J16. Những ước tính lạc quan nhất dự đoán mất khoảng sáu năm để chuẩn hóa ngôn ngữ, hoàn thành năm 1996; hãy bảo đảm sách C++ của bạn đề cập định hướng ANSI C++.

#### Vậy protected abstract virtual base pure virtual private destructor là gì?

Hãy chia nhỏ và xét từng chút. Cụm này thực ra tách thành hai phần: pure virtual private destructor được kế thừa từ protected abstract virtual base.

- Private destructor là function được gọi khi object ra khỏi scope. "Private" nghĩa là chỉ member hoặc friend của class mới gọi được nó.

- Pure virtual function không chứa code, nhưng dùng làm định hướng cho những derived function khác thông qua inheritance.

- Pure virtual destructor chỉ có ý nghĩa nếu được định nghĩa bởi derived class. Vì destructor tự động thực hiện các hành động clean-up mặc định trên class, như gọi member destructor hoặc base destructor, thường không cần viết code tường minh trong destructor definition.

Khá đơn giản. Xét tiếp cụm thứ hai

- Abstract virtual base nghĩa là base class được chia sẻ bởi những class multiply-inherited (đó là "virtual base") và chứa ít nhất một pure virtual function, từ đó những class khác dẫn xuất qua inheritance (một "abstract base"). Virtual base class còn có initialization semantics đặc biệt.

- Protected abstract virtual base class là class được chúng ta kế thừa theo cách "protectedly", để những class con biết quan hệ cha mẹ của chúng ta, còn bên ngoài thì không.

Vậy ghép lại, protected abstract virtual base pure virtual private destructor là một destructor function mà

- chỉ member hoặc friend của class có thể gọi, và

- không có definition trong base class khai báo nó, nhưng sẽ được định nghĩa sau trong derived class,

- class đó (chỉ derived class) chia sẻ base được multiple inheritance

- còn base đó (chỉ base class) được kế thừa theo cách protected.

Và lần gần nhất chúng ta cần nó là… ừm, chưa bao giờ! Nó có bắt đầu khiến ai nhớ đến phần chứng minh chương trình Fast Fourier Transform không? Chắc chắn mức phức tạp của nó ngang hàng với phần đó.

Trong code C++, điều này có thể như sau:

```
class vbc {
 protected: virtual void v()=0;
 private: virtual ~vbc()=0; // private destructor
};
// vbc is an abstract class because it contains pure
virtual functions

classX:virtual protected vbc {
 // X inherits vbc virtually, and does it in a way such
that
 // vbc's protected members are protected members of X.
 // So vbc is a "protected abstract virtual base" class
of X.
    protected: void v() {}
 ~X() { /* do some X destruction */ }
};

// When an X object is destroyed, X::~X is called, and
then...
// X's "protected abstract virtual base pure virtual
private destructor"
// is called too. So even though it's declared pure, it
must be defined.
```

Đây là kiểu semantics khiến C++ mang tiếng quá phức tạp. Vấn đề không nằm ở riêng một feature mà ở sự phức tạp trong cách mọi feature khác nhau tương tác. Chúng ta dừng ở đây để độc giả tự rút ra kết luận.

## Giải trí nhẹ—Hội những máy tính đã biến mất

Có rất nhiều tổ chức computer-related đa dạng, nhưng giải kỳ lạ nhất chắc chắn thuộc về The Dead Computers Society! Mô phỏng "Dead Poets Society", vốn thực chất là nhóm thưởng thức những nhà thơ cổ điển, Dead Computers Society là nhóm trân trọng những computer architecture không còn tồn tại. Nó bắt đầu như một nhóm thảo luận không chính thức tại hội nghị ASPLOS ("Architecture Support for Programming Languages and OS's") năm 1991 ở Santa Clara, California. Một nhóm bạn bè và đồng nghiệp dự hội nghị nhận thấy nhiều người từng làm việc trên những hệ thống nay đã ngừng phát triển.

Họ quyết định nhìn chuyện này một cách hài hước bằng cách lập Dead Computers Society và tổ chức diễn đàn bàn tròn mở về các vấn đề liên quan. Hy vọng rằng việc nhìn lại một cách sáng suốt sẽ giúp những nhà thiết kế tương lai học bài học quá khứ. Bất kỳ ai từng giúp thiết kế, xây dựng hoặc lập trình một hệ thống máy tính không còn tồn tại đều có thể gia nhập, lý tưởng nhất là cho một công ty cũng không còn tồn tại. Có rất nhiều hệ thống như vậy; Bảng 11-3 liệt kê một phần.

Bảng 11-3. Những máy tính đã biến mất

| Bảng vinh danh những máy tính đã biến mất |  |
|---|---|
| American Supercomputer Inc. | Intel iPSC/1 |
| Ametek/Symult | Intel iPSC/2 |
| Astronautics | Intel/Siemens BiiN |
| Burroughs BSP | Masscomp/Concurrent |
| CDC 7600, Cyberplus | Multiflow |
| CHoPP | Myrias |
| Culler Scientific | Niche |
| Cydrome | Prisma |
| Denelcor | SCS |
| Elxsi | SSI |
| Evans \& Sutherland CD | Star Technologies |
| ETA/CDC | Supertek |
| FLEX (Flexible Computer) | Suprenum/Siemens |
| Goodyear Aerospace/Loral DataFlow Systems | Texas Instruments ASC |
| Guiltech/SAXPY | Topologix |
| Floating Point Systems AP-line and T-series | Unisys ISP |
| Intel 432 |  |

Mặt khác, bất kỳ ai chỉ thấy đây là ý tưởng khá hay cũng có thể gia nhập. Cuộc gặp đầu tiên có hơn 350 người tham dự.

Người điều phối cố gợi các thành viên nói về "một điều duy nhất chịu trách nhiệm cho cái chết của máy tính của bạn nhiều hơn bất kỳ điều gì khác". Nhà thiết kế Elxsi nói họ đã cố đẩy công nghệ quá xa và dùng ECL (emitter-coupled logic) trước khi nó sẵn sàng sử dụng rộng rãi. Tuy nhiên, kiến trúc sư trưởng của Multiflow, công ty sụp đổ khoảng cùng thời Elxsi, lại cảm thấy quyết định không dùng ECL là một trong những yếu tố cuối cùng gây ra cái chết của Multiflow!

Gần như sự đồng thuận duy nhất là quản lý và điều kiện thị trường gây ra nhiều vụ phá sản hơn thất bại kỹ thuật rất nhiều. Điều này dễ hiểu: công ty không lắng nghe khách hàng luôn phải đóng cửa. Công ty cố đẩy xa giới hạn công nghệ thường thành công.

Có một vài chủ đề kỹ thuật nhỏ: làm sản phẩm khó lập trình không có lợi (ví dụ CDC7600 với two-level memory, phép toán one's complement hoặc hình phạt tàn nhẫn và khác thường là word 60-bit). Không quá ngạc nhiên khi không có chủ đề kỹ thuật chung lớn nào xuất hiện. Có lẽ chẳng có chủ đề như vậy. Nhưng có một điều chắc chắn: tất cả chúng ta học được từ thất bại nhiều hơn từ thành công.

## Giải trí nhẹ cuối cùng—Giấy chứng nhận thành tích của bạn!

\[Hướng dẫn: cắt khỏi sách, điền tên bạn và đưa cho sếp\]

![image](images/ch11/img11-09.png)

### Đọc thêm

Một cuốn sách C tôi thấy rất hữu ích là C, A Reference Manual của Samuel P. Harbison và Guy L. Steele (Englewood Cliffs, Prentice Hall, 1991). Harbison và Steele viết sách từ kinh nghiệm phát triển một họ C compiler cho nhiều architecture khác nhau; những hiểu biết thực tế của họ tỏa sáng trên từng trang.
