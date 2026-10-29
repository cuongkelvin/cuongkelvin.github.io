<a id="_idParaDest-168"></a>

# Chương 12: Phiên bản C mới nhất (The Most Recent C)

Thay đổi là điều không thể ngăn cản, và C không phải là ngoại lệ. Ngôn ngữ <a id="_idIndexMarker837"></a>lập trình C được chuẩn hóa bởi một chuẩn ISO, và nó liên tục được sửa đổi bởi một nhóm người đang cố gắng làm cho nó tốt hơn và mang lại các tính năng mới cho nó. Tuy nhiên, điều này không có nghĩa là ngôn ngữ nhất thiết sẽ trở nên dễ hơn; chúng ta có thể thấy các tính năng mới lạ và phức tạp xuất hiện trong ngôn ngữ khi nội dung mới được thêm vào.

Trong chương này, chúng ta sẽ xem qua các tính năng của C11. Bạn có thể biết rằng C11 đã thay thế chuẩn C99 cũ, và nó đã được thay thế bởi chuẩn C18. Nói cách khác, C18 là phiên bản mới nhất của chuẩn C, và ngay trước đó chúng ta có C11.

Thật thú vị khi biết rằng C18 không cung cấp tính năng mới nào; nó chỉ chứa các bản sửa lỗi cho các vấn đề được tìm thấy trong C11. Do đó, nói về C11 về cơ bản cũng giống như nói về C18, và nó sẽ dẫn chúng ta tới chuẩn C mới nhất. Như bạn có thể thấy, chúng ta đang quan sát thấy sự cải tiến liên tục trong ngôn ngữ C… trái ngược với niềm tin rằng nó là một ngôn ngữ long-dead (đã chết từ lâu)!

Chương này sẽ đưa ra một tổng quan ngắn gọn về các chủ đề sau:

- Cách phát hiện phiên bản C và cách viết một đoạn code C tương thích với nhiều phiên bản C khác nhau
- Các tính năng mới để viết code được tối ưu và an toàn, như các hàm *no-return* và các hàm *bounds-checking*
- Các kiểu dữ liệu mới và các kỹ thuật memory alignment
- Các hàm Type-generic
- Hỗ trợ Unicode trong C11, vốn thiếu trong ngôn ngữ ở các chuẩn cũ hơn
- Anonymous structure và anonymous union
- Hỗ trợ chuẩn cho multithreading và các kỹ thuật synchronization trong C11

Hãy bắt đầu chương bằng việc nói về C11 và các tính năng mới của nó.

<a id="_idParaDest-169"></a>

## C11

Tập hợp một chuẩn mới cho <a id="_idIndexMarker838"></a>một công nghệ đã được dùng hơn 30 năm không phải là một việc dễ dàng. Hàng triệu (nếu không phải hàng tỉ!) dòng code C tồn tại, và nếu bạn sắp giới thiệu các tính năng mới, điều này phải được thực hiện trong khi giữ nguyên code hay tính năng trước đó. Các tính năng mới không nên tạo ra vấn đề mới cho các chương trình hiện có, và chúng nên bug-free (không có bug). Dù quan điểm này có vẻ lý tưởng hóa, đó là điều chúng ta nên cam kết.

Tài liệu PDF sau nằm trên trang web *Open Standards* và chứa những lo lắng và suy nghĩ mà những người trong <a id="_idIndexMarker839"></a>cộng đồng C đã có trong đầu trước khi bắt đầu định hình C11: http://www.open-std.org/JTC1/SC22/wg14/www/docs/n1250.pdf. Sẽ hữu ích nếu đọc nó vì nó sẽ giới thiệu cho bạn trải nghiệm soạn thảo một chuẩn mới cho một ngôn ngữ lập trình mà hàng nghìn phần mềm đã được xây dựng trên đó.

Cuối cùng, với những<a id="_idIndexMarker840"></a> điều này trong đầu, chúng ta xem xét việc phát hành C11. Khi C11 ra đời, nó chưa ở dạng lý tưởng và thực tế đang mắc phải một số khiếm khuyết nghiêm trọng. Bạn có thể xem danh sách những khiếm khuyết này tại đâ[re: http://www.open-std.org/jtc1/sc22/wg14/www/docs/n2244](http://www.open-std.org/jtc1/sc22/wg14/www/docs/n2244.htm).htm.

Bảy năm sau khi C11 ra mắt, C18 đã được giới thiệu, vốn<a id="_idIndexMarker841"></a> ra đời để sửa các khiếm khuyết được tìm thấy trong C11. Lưu ý rằng C18 cũng được gọi một cách *không chính thức* là C17, và cả C17 lẫn C18 đều chỉ cùng một chuẩn C<a id="_idIndexMarker842"></a>. Nếu bạn mở link trước, bạn sẽ thấy các khiếm khuyết và trạng thái hiện tại của chúng. Nếu trạng thái của một khiếm khuyết là "C17", điều đó có nghĩa là khiếm khuyết đã được giải quyết trong C18. Điều này cho thấy việc tập hợp một chuẩn có nhiều người dùng như C là một quá trình khó khăn và tinh tế như thế nào.

Trong các phần sau, chúng ta sẽ nói về các tính năng mới của C11. Tuy nhiên, trước khi đi qua chúng, chúng ta cần một cách để chắc chắn rằng chúng ta thực sự đang viết code C11, và rằng chúng ta đang dùng một compiler tương thích. Phần sau sẽ đáp ứng yêu cầu này.

<a id="_idParaDest-170"></a>

## Tìm một phiên bản chuẩn C được hỗ trợ

Vào thời điểm viết sách, đã gần <a id="_idIndexMarker843"></a>8 năm kể từ khi C11 ra đời. Do đó, có thể kỳ vọng rằng nhiều compiler hẳn hỗ trợ chuẩn này, và thực tế đúng là như vậy. Các compiler mã nguồn mở như `gcc` và `clang` đều hỗ trợ C11 một cách hoàn hảo, và chúng có thể chuyển về C99 hay thậm chí các phiên bản C cũ hơn nếu cần. Trong phần này, chúng tôi cho thấy cách dùng các macro cụ thể để phát hiện phiên bản C và, tùy theo phiên bản, cách dùng các tính năng được hỗ trợ.

Điều đầu tiên <a id="_idIndexMarker844"></a>cần thiết khi dùng một compiler hỗ trợ các phiên bản khác nhau của chuẩn C là có khả năng xác định phiên bản nào của chuẩn C đang được dùng. Mỗi chuẩn C định nghĩa một macro đặc biệt có thể được dùng để tìm ra phiên bản nào đang được dùng. Cho đến giờ, chúng ta đã dùng `gcc` trong Linux và `clang` trong các hệ thống macOS. Kể từ phiên bản 4.7, `gcc` cung cấp C11 như một trong các chuẩn được hỗ trợ của nó.

Hãy xem ví dụ sau và xem các macro already-defined (đã được định nghĩa sẵn) có thể được dùng như thế nào để phát hiện phiên bản hiện tại của chuẩn C vào lúc runtime:

```
#include <stdio.h>
int main(int argc, char** argv) {
#if __STDC_VERSION__ >=  201710L
  printf("Hello World from C18!\n");
#elif __STDC_VERSION__ >= 201112L
  printf("Hello World from C11!\n");
#elif __STDC_VERSION__ >= 199901L
  printf("Hello World from C99!\n");
#else
  printf("Hello World from C89/C90!\n");
#endif
  return 0;
}
```

*Code Box 12-1 [ExtremeC_examples_chapter12_1.c]: Phát hiện phiên bản của chuẩn C*

Như bạn có thể thấy, code trên có thể phân biệt giữa các phiên bản khác nhau của chuẩn C. Để thấy các phiên bản C khác nhau có thể dẫn đến các bản in khác nhau như thế nào, chúng ta phải biên dịch source code trên nhiều lần với các phiên bản chuẩn C khác nhau được compiler hỗ trợ.

Để yêu cầu compiler dùng một phiên bản cụ thể của chuẩn C, chúng ta phải truyền tùy chọn -`std=CXX` cho compiler C. Hãy xem các lệnh sau và output được tạo ra:

```
$ gcc ExtremeC_examples_chapter12_1.c -o ex12_1.out
$ ./ex12_1.out
Hello World from C11!
$ gcc ExtremeC_examples_chapter12_1.c -o ex12_1.out -std=c11
$ ./ex12_1.out
Hello World from C11!
$ gcc ExtremeC_examples_chapter12_1.c -o ex12_1.out -std=c99
$ ./ex12_1.out
Hello World from C99!
$ gcc ExtremeC_examples_chapter12_1.c -o ex12_1.out -std=c90
$ ./ex12_1.out
Hello World from C89/C90!
$ gcc ExtremeC_examples_chapter12_1.c -o ex12_1.out -std=c89
$ ./ex12_1.out
Hello World from C89/C90!
$
```

*Shell Box 12-1: Biên dịch ví dụ 12.1 với các phiên bản chuẩn C khác nhau*

Như bạn có thể thấy, phiên bản chuẩn C <a id="_idIndexMarker845"></a>mặc định trong các compiler mới hơn là C11. Với các phiên bản cũ hơn, bạn phải chỉ định phiên bản bằng tùy chọn `-std`, nếu bạn muốn bật C11. Hãy lưu ý các comment được đặt ở đầu file. Tôi đã dùng comment `/* ... */` (comment nhiều dòng) thay vì comment `//` (comment one-line). Đó là vì comment one-line không được hỗ trợ trong các chuẩn trước C99. Do đó, chúng tôi phải dùng comment nhiều dòng để code trên biên dịch được với mọi phiên bản C.

<a id="_idParaDest-171"></a>

## Loại bỏ hàm gets

Trong C11, hàm `gets` nổi tiếng<a id="_idIndexMarker846"></a> đã bị loại bỏ. Hàm `gets` dễ bị tấn công *buffer overflow*, và trong các phiên bản cũ hơn người ta đã quyết định làm cho hàm này *deprecated*. Sau đó, trong chuẩn C11, nó đã bị loại bỏ. Do đó, source code cũ hơn dùng hàm `gets` sẽ không biên dịch được bằng một compiler C11.

Hàm `fgets` có thể được dùng<a id="_idIndexMarker847"></a> thay cho `gets`. Sau đây là một trích đoạn từ trang manual (man page) của `gets` trong macOS:

> SECURITY CONSIDERATIONS (CÂN NHẮC VỀ BẢO MẬT)

> Hàm gets() không thể được dùng một cách an toàn. Vì nó thiếu việc kiểm tra biên, và chương trình gọi không có khả năng xác định một cách đáng tin cậy độ dài của dòng tiếp theo đi vào, việc dùng hàm này cho phép những người dùng độc hại tùy ý thay đổi chức năng của một chương trình đang chạy thông qua một cuộc tấn công buffer overflow. Rất khuyến nghị rằng hàm fgets() được dùng trong mọi trường hợp. (Xem FSA.)

<a id="_idParaDest-172"></a>

## Những thay đổi đối với hàm fopen

Hàm `fopen` thường<a id="_idIndexMarker848"></a> được dùng để mở một file và trả về một file descriptor tới file đó. Khái niệm file rất tổng quát trong Unix, và bằng việc dùng thuật ngữ *file*, chúng tôi không nhất thiết muốn nói một file nằm trên filesystem. Hàm `fopen` có các chữ ký sau:

```
FILE* fopen(const char *pathname, const char *mode);
FILE* fdopen(int fd, const char *mode);
FILE* freopen(const char *pathname, const char *mode, FILE *stream);
```

*Code Box 12-2: Các chữ ký khác nhau của họ hàm fopen*

Như bạn có thể thấy, mọi chữ ký trên đều nhận một input `mode`. Tham số input này là một chuỗi xác định file nên được mở như thế nào. Mô tả sau trong *Shell Box 12-2* được lấy từ manual của FreeBSD cho hàm `fopen` và giải thích `mode` nên được dùng như thế nào:

```
$ man 3 fopen
...
The argument mode points to a string beginning with one of the following letters:
     "r"     Open for reading.  The stream is positioned at the beginning
             of the file.  Fail if the file does not exist.
     "w"     Open for writing.  The stream is positioned at the beginning
             of the file.  Create the file if it does not exist.
     "a"     Open for writing.  The stream is positioned at the end of
             the file. Subsequent writes to the file will always end up
             at the then current end of file, irrespective of
             any intervening fseek(3) or similar. Create the file
             if it does not exist.
     An optional "+" following "r", "w", or "a" opens the file
     for both reading and writing.  An optional "x" following "w" or
     "w+" causes the fopen() call to fail if the file already exists.
     An optional "e" following the above causes the fopen() call to set
     the FD_CLOEXEC flag on the underlying file descriptor.
     The mode string can also include the letter "b" after either
     the "+" or the first letter.
...
$
```

*Shell Box 12-2: Một trích đoạn từ trang manual của fopen trong FreeBSD*

Mode `x`, được giải thích trong trích đoạn trên từ trang manual của `fopen`, đã được giới thiệu trong C11. Để <a id="_idIndexMarker849"></a>mở một file để ghi vào nó, mode `w` hay `w+` nên được cung cấp cho `fopen`. Vấn đề là, nếu file đã tồn tại, mode `w` hay `w+` sẽ cắt cụt (làm trống) file.

Do đó, nếu lập trình viên muốn ghi nối vào một file và giữ nội dung hiện tại của nó, họ phải dùng một mode khác, `a`. Vì vậy, họ phải kiểm tra sự tồn tại của file, dùng một filesystem API như `stat`, trước khi gọi `fopen`, và sau đó chọn mode phù hợp dựa trên kết quả. Tuy nhiên, giờ với mode mới `x`, lập trình viên trước tiên thử với mode `wx` hay `w+x`, và nếu file đã tồn tại thì `fopen` sẽ thất bại. Sau đó lập trình viên có thể tiếp tục với mode `a`.

Như vậy, cần viết ít boilerplate code hơn để mở một file mà không dùng filesystem API để kiểm tra sự tồn tại của file. Từ giờ trở đi, `fopen` là đủ để mở một file ở mọi mode mong muốn.

Một thay đổi khác trong C11 là việc giới thiệu API `fopen_s`. Hàm này đóng vai trò như một `fopen` an toàn. Theo <a id="_idIndexMarker850"></a>tài liệu cho `fopen_s` có tại https://en.cppreference.com/w/c/io/fopen, nó thực hiện kiểm tra bổ sung trên các buffer được cung cấp và biên của chúng để phát hiện bất kỳ lỗi nào trong chúng.

<a id="_idParaDest-173"></a>

## Các hàm Bounds-checking

Một trong những vấn đề nghiêm trọng với các chương trình C thao tác trên chuỗi và mảng byte là khả năng dễ dàng vượt quá biên được định nghĩa cho một buffer hay một mảng byte.

Để nhắc lại, một buffer là một vùng<a id="_idIndexMarker851"></a> memory được dùng làm chỗ chứa cho một mảng byte hay một biến chuỗi. Vượt quá biên của một buffer gây ra *buffer overflow* và dựa vào đó một thực thể độc hại có thể tổ chức một cuộc tấn công (thường được gọi là *buffer overflow attack*). Loại tấn công này dẫn đến hoặc một **denial of service** (**DOS**) hoặc việc *exploitation* (khai thác) chương trình C<a id="_idIndexMarker852"></a> nạn nhân.

Hầu hết các cuộc tấn công như vậy thường bắt đầu trong một hàm thao tác trên mảng ký tự hay mảng byte. Các hàm xử lý chuỗi có trong `string.h`, như `strcpy` và `strcat`, nằm trong số các hàm *dễ bị tấn công* thiếu cơ chế kiểm tra biên để ngăn các cuộc tấn công buffer overflow.

Tuy nhiên, trong C11, một tập hàm mới đã được giới thiệu. Các hàm *Bounds-checking* mượn cùng tên từ các hàm xử lý chuỗi nhưng có thêm `_s` ở cuối. Hậu tố `_s` phân biệt chúng là phiên bản *secure* (an toàn) hay *safe* của những hàm đó, thực hiện thêm các kiểm tra runtime để bịt các lỗ hổng. Các hàm như `strcpy_s` và `strcat_s` đã được giới thiệu như một phần của các hàm bounds-checking trong C11.

Những hàm này nhận thêm một số argument cho các buffer input để hạn chế chúng thực hiện các thao tác nguy hiểm. Ví dụ, hàm `strcpy_s` có chữ ký sau:

```
errno_t strcpy_s(char *restrict dest, rsize_t destsz, const char *restrict src);
```

*Code Box 12-3: Chữ ký của hàm strcpy_s*

Như bạn có thể thấy, argument thứ hai là độ dài của buffer `dest`. Dùng nó, hàm thực hiện một số kiểm tra runtime, như bảo đảm rằng chuỗi `src` ngắn hơn hoặc có cùng kích thước với buffer `dest` để ngăn việc ghi vào memory chưa được cấp phát.

<a id="_idParaDest-174"></a>

## Các hàm No-return

Một lời gọi hàm có thể kết thúc hoặc bằng <a id="_idIndexMarker853"></a>việc dùng từ khóa `return` hoặc bằng việc đi đến cuối khối của hàm. Cũng có những tình huống mà một lời gọi hàm không bao giờ kết thúc, và điều này thường được làm một cách cố ý. Hãy xem ví dụ code sau trong *Code Box 12-4*:

```
void main_loop() {
  while (1) {
    ...
  }
}

int main(int argc, char** argv) {
  ...
  main_loop();
  return 0;
}
```

*Code Box 12-4: Ví dụ về một hàm không bao giờ trả về*

Như bạn có thể thấy, hàm `main_loop` thực hiện tác vụ chính của chương trình, và nếu chúng ta trả về từ<a id="_idIndexMarker854"></a> hàm, chương trình có thể được coi là đã kết thúc. Trong những trường hợp ngoại lệ này, compiler có thể thực hiện thêm một số tối ưu, nhưng bằng cách nào đó, nó cần biết rằng hàm `main_loop` không bao giờ trả về.

Trong C11, bạn có khả năng đánh dấu một hàm là một hàm *no-return*. Từ khóa `_Noreturn` từ header file `stdnoreturn.h` có thể được dùng để chỉ định rằng một hàm không bao giờ thoát. Vì vậy, code trong *Code Box 12-4* có thể được thay đổi cho C11 để trông như sau:

```
_Noreturn void main_loop() {
  while (true) {
    ...
  }
}
```

*Code Box 12-5: Dùng từ khóa _Noreturn để đánh dấu main_loop là một hàm never-ending (không bao giờ kết thúc)*

Có những hàm khác, như `exit`, `quick_exit` (được thêm gần đây trong C11 để kết thúc chương trình nhanh chóng) và `abort`, được coi là các hàm no-return. Ngoài ra, việc biết về các hàm no-return cho phép compiler nhận ra các lời gọi hàm vô tình không trả về và đưa ra các cảnh báo phù hợp vì chúng có thể là dấu hiệu của một bug logic. Lưu ý rằng nếu một hàm được đánh dấu `_Noreturn` lại trả về, thì đây sẽ là một *undefined behavior* và rất không được khuyến khích.

<a id="_idParaDest-175"></a>

## Type generic macro

Trong C11, một từ khóa mới đã được giới thiệu: `_Generic`. Nó có thể được dùng để viết các macro type-aware (nhận biết kiểu) vào lúc biên dịch<a id="_idIndexMarker855"></a>. Nói cách khác, bạn có thể viết các macro có thể thay đổi giá trị của chúng dựa trên kiểu của các argument. Điều này thường được gọi là *generic selection*. Hãy xem ví dụ code sau trong *Code Box 12-6*:

```
#include <stdio.h>
#define abs(x) _Generic((x), \
                        int: absi, \
                        double: absd)(x)
int absi(int a) {
  return a > 0 ? a : -a;
}
double absd(double a) {
  return a > 0 ? a : -a;
}
int main(int argc, char** argv) {
  printf("abs(-2): %d\n", abs(-2));
  printf("abs(2.5): %f\n", abs(2.5));;
  return 0;
}
```

*Code Box 12-6: Ví dụ về một generic macro*

Như bạn có thể thấy trong định nghĩa macro, chúng ta đã dùng các biểu thức khác nhau dựa trên kiểu của argument `x`. Chúng ta dùng `absi` nếu nó là một giá trị số nguyên, và `absd` nếu nó là một giá trị double. Tính năng này không mới trong C11, và bạn có thể tìm thấy nó trong các compiler C cũ hơn, nhưng nó không phải là một phần của chuẩn C. Kể từ C11, nó đã trở thành chuẩn, và bạn có thể dùng cú pháp này để viết các macro type-aware.

<a id="_idParaDest-176"></a>

## Unicode

Một trong những tính năng tuyệt vời<a id="_idIndexMarker856"></a> nhất đã được thêm vào chuẩn C11 là hỗ trợ<a id="_idIndexMarker857"></a> Unicode thông qua các encoding UTF-8, UTF-16 và UTF-32. C đã thiếu tính năng này trong một thời gian dài, và các lập trình viên C phải dùng các library third-party như **IBM International Components for Unicode** (**ICU**) để đáp ứng nhu cầu của họ.

Trước C11, chúng ta chỉ có các kiểu `char` và `unsigned char`, vốn là các biến 8-bit được dùng để lưu các ký tự ASCII và Extended ASCII. Bằng việc tạo mảng các ký tự ASCII này, chúng ta có thể tạo các chuỗi ASCII.

> **Lưu ý**:
>
> Chuẩn ASCII có 128 ký tự <a id="_idIndexMarker859"></a>có thể được lưu trong 7 bit. Extended ASCII là một sự mở rộng của ASCII thêm 128 ký tự khác để tổng cộng thành 256 ký tự. Khi đó, một biến 8-bit hay one-byte là đủ để lưu tất cả chúng. Trong phần văn bản sắp tới, chúng tôi sẽ chỉ dùng thuật ngữ ASCII, và với nó chúng tôi chỉ cả chuẩn ASCII lẫn Extended ASCII.

Lưu ý rằng việc hỗ trợ các ký tự và chuỗi ASCII là nền tảng, và nó sẽ không bao giờ bị loại bỏ khỏi C. Như vậy, chúng ta có thể tự tin rằng chúng ta sẽ luôn có hỗ trợ ASCII trong C. Từ C11, họ đã thêm hỗ trợ cho các ký tự mới, và do đó các chuỗi mới dùng một số byte khác nhau, không chỉ một byte, cho mỗi ký tự.

Để giải thích thêm, trong ASCII, chúng ta có một byte cho mỗi ký tự. Do đó, byte và ký tự có thể được dùng thay thế cho nhau, nhưng điều này nói chung *không* đúng. Các encoding khác nhau định nghĩa các cách mới để lưu một phạm vi ký tự rộng hơn trong nhiều byte.

Trong ASCII, tổng cộng chúng ta có 256 ký tự. Do đó, một ký tự one-byte (8-bit) duy nhất là đủ để lưu tất cả chúng. Tuy nhiên, nếu chúng ta sẽ có nhiều hơn 256 ký tự, chúng ta phải dùng nhiều hơn một byte để lưu giá trị số của chúng sau 255. Các ký tự cần <a id="_idIndexMarker860"></a>nhiều hơn một byte để lưu giá trị của chúng thường được gọi là *wide character*. Theo định nghĩa này, các ký tự ASCII không được coi là wide character.

Chuẩn Unicode đã giới thiệu nhiều<a id="_idIndexMarker861"></a> phương pháp dùng nhiều hơn một byte để mã hóa mọi ký tự trong ASCII, Extended ASCII và wide character. Những phương pháp này được gọi là *encoding*. Thông qua Unicode, có ba encoding well-known: UTF-8, UTF-16 và UTF-32. UTF-8 dùng byte đầu tiên để lưu nửa đầu của các ký tự ASCII, và các byte tiếp theo, thường lên tới 4 byte, cho nửa còn lại của các ký tự ASCII cùng với mọi wide character khác. Do đó, UTF-8 được coi là một encoding variable-sized. Nó dùng các bit nhất định trong byte đầu tiên của ký tự để biểu thị số byte thực tế cần được đọc để lấy ký tự một cách đầy đủ. UTF-8 được coi là một superset của ASCII vì đối với các ký tự ASCII (không phải ký tự Extended ASCII) biểu diễn là giống nhau.

Giống UTF-8, UTF-16 dùng một hoặc hai *word* (mỗi word có 16 bit bên trong) để lưu mọi ký tự; do đó nó cũng là một encoding variable-sized. UTF-32 dùng chính xác 4 byte để lưu giá trị của mọi ký tự; do đó, nó là một encoding fixed-sized. UTF-8, và sau đó, UTF-16, phù hợp cho các ứng dụng trong đó nên dùng ít byte hơn cho các ký tự thường xuyên hơn.

UTF-32 dùng một số <a id="_idIndexMarker862"></a>byte cố định ngay cả cho các ký tự ASCII. Vì vậy, nó tiêu thụ nhiều không gian memory hơn để lưu chuỗi dùng encoding này so với các encoding khác; nhưng nó đòi hỏi ít sức mạnh tính toán hơn khi dùng các ký tự UTF-32. UTF-8 và UTF-16 có thể được coi là các encoding nén<a id="_idIndexMarker863"></a>, nhưng chúng cần nhiều tính toán hơn để trả về giá trị thực của một ký tự.

> **Lưu ý**:
>
> Thêm thông tin về các chuỗi UTF-8, UTF-16 và UTF-32 và<a id="_idIndexMarker865"></a> cách giải mã chúng có thể được tìm thấy trên <a id="_idIndexMarker866"></a>Wik[ipedia or other<a id="_idIndexMarker867"></a> sources like:](https://unicodebook.readthedocs.io/unicode_encodings.html) (Wikipedia hoặc các nguồn khác như:)
>
> [https://unicodebook.readth](https://unicodebook.readthedocs.io/unicode_encodings.html)e[docs.io/unicode_encodings.html](https://javarevisited.blogspot.com/2015/02/difference-between-utf-8-utf-16-and-utf.html)
>
> [https://javarevisited.blogspot.com/2015/02/difference-be](https://javarevisited.blogspot.com/2015/02/difference-between-utf-8-utf-16-and-utf.html)t[ween-utf-8-utf-16-and-utf.html](https://unicodebook.readthedocs.io/unicode_encodings.html).

Trong C11, chúng ta có hỗ trợ cho mọi encoding Unicode trên. Hãy xem ví dụ sau, *ví dụ 12.3*. Nó định nghĩa các chuỗi ASCII, UTF-8, UTF-16 và UTF-32 khác nhau, và đếm số byte thực tế <a id="_idIndexMarker868"></a>được dùng để lưu chúng và số ký tự quan sát được trong chúng. Chúng tôi trình bày code theo nhiều bước để đưa ra thêm các nhận xét về code. Code box sau minh họa các phần include và khai báo cần thiết:

```
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#ifdef __APPLE__
#include <stdint.h>
typedef uint16_t char16_t;
typedef uint32_t char32_t;
#else
#include <uchar.h> // Needed for char16_t and char32_t
#endif
```

*Code Box 12-7 [ExtremeC_examples_chapter12_3.c]: Các phần include và khai báo cần thiết để ví dụ 12.3 build được*

Các dòng trên là các câu lệnh `include` cho *ví dụ 12.3*. Như bạn có thể thấy, trong macOS chúng ta không có header `uchar.h` và chúng ta phải định nghĩa các kiểu mới cho các kiểu `char16_t` và `char32_t`. Tuy nhiên, toàn bộ chức năng của chuỗi Unicode đều được hỗ trợ. Trên Linux, chúng ta không gặp vấn đề nào với hỗ trợ Unicode trong C11.

Phần tiếp theo của code <a id="_idIndexMarker869"></a>minh họa các hàm được dùng để đếm số byte và ký tự trong các loại chuỗi Unicode khác nhau. Lưu ý rằng C11 không cung cấp hàm tiện ích nào để thao tác trên chuỗi Unicode, do đó chúng ta phải viết một `strlen` mới cho chúng. Thực tế, các phiên bản hàm `strlen` của chúng ta làm nhiều hơn là chỉ trả về số ký tự; chúng cũng trả về số byte đã dùng. Các chi tiết triển khai sẽ không được mô tả, nhưng rất khuyến khích bạn đọc chúng:

```
typedef struct {
  long num_chars;
  long num_bytes;
} unicode_len_t;
unicode_len_t strlen_ascii(char* str) {
  unicode_len_t res;
  res.num_chars = 0;
  res.num_bytes = 0;
  if (!str) {
    return res;
  }
  res.num_chars = strlen(str) + 1;
  res.num_bytes = strlen(str) + 1;
  return res;
}
unicode_len_t strlen_u8(char* str) {
  unicode_len_t res;
  res.num_chars = 0;
  res.num_bytes = 0;
  if (!str) {
    return res;
  }
  // Last null character
  res.num_chars = 1;
  res.num_bytes = 1;
  while (*str) {
    if ((*str | 0x7f) == 0x7f) { // 0x7f = 0b01111111
      res.num_chars++;
      res.num_bytes++;
      str++;
    } else if ((*str & 0xc0) == 0xc0) { // 0xc0 = 0b11000000
      res.num_chars++;
      res.num_bytes += 2;
      str += 2;
    } else if ((*str & 0xe0) == 0xe0) { // 0xe0 = 0b11100000
      res.num_chars++;
      res.num_bytes += 3;
      str += 3;
    } else if ((*str & 0xf0) == 0xf0) { // 0xf0 = 0b11110000
      res.num_chars++;
      res.num_bytes += 4;
      str += 4;
    } else {
      fprintf(stderr, "UTF-8 string is not valid!\n");
      exit(1);
    }
  }
  return res;
}
unicode_len_t strlen_u16(char16_t* str) {
  unicode_len_t res;
  res.num_chars = 0;
  res.num_bytes = 0;
  if (!str) {
    return res;
  }
  // Last null character
  res.num_chars = 1;
  res.num_bytes = 2;
  while (*str) {
    if (*str < 0xdc00 || *str > 0xdfff) {
      res.num_chars++;
      res.num_bytes += 2;
      str++;
    } else {
      res.num_chars++;
      res.num_bytes += 4;
      str += 2;
    }
  }
  return res;
}
unicode_len_t strlen_u32(char32_t* str) {
  unicode_len_t res;
  res.num_chars = 0;
  res.num_bytes = 0;
  if (!str) {
    return res;
  }
  // Last null character
  res.num_chars = 1;
  res.num_bytes = 4;
  while (*str) {
      res.num_chars++;
      res.num_bytes += 4;
      str++;
  }
  return res;
}
```

*Code Box 12-8 [ExtremeC_examples_chapter12_3.c]: Định nghĩa của các hàm được dùng trong ví dụ 12.3*

Phần cuối cùng là hàm `main`. Nó khai báo một số chuỗi khác nhau bằng tiếng Anh, tiếng Ba Tư và một số ngôn ngữ ngoài hành tinh để <a id="_idIndexMarker870"></a>đánh giá các hàm trên:

```
int main(int argc, char** argv) {
  char ascii_string[32] = "Hello World!";
  char utf8_string[32] = u8"Hello World!";
  char utf8_string_2[32] = u8"درود دنیا!";
  char16_t utf16_string[32] = u"Hello World!";
  char16_t utf16_string_2[32] = u"درود دنیا!";
  char16_t utf16_string_3[32] = u"হহহ!";
  char32_t utf32_string[32] = U"Hello World!";
  char32_t utf32_string_2[32] = U"درود دنیا!";
  char32_t utf32_string_3[32] = U"হহহ!";
  unicode_len_t len = strlen_ascii(ascii_string);
  printf("Length of ASCII string:\t\t\t %ld chars, %ld bytes\n\n",
      len.num_chars, len.num_bytes);
  len = strlen_u8(utf8_string);
  printf("Length of UTF-8 English string:\t\t %ld chars, %ld bytes\n",
      len.num_chars, len.num_bytes);
  len = strlen_u16(utf16_string);
  printf("Length of UTF-16 english string:\t %ld chars, %ld bytes\n",
      len.num_chars, len.num_bytes);
  len = strlen_u32(utf32_string);
  printf("Length of UTF-32 english string:\t %ld chars, %ld bytes\n\n",
      len.num_chars, len.num_bytes);
  len = strlen_u8(utf8_string_2);
  printf("Length of UTF-8 Persian string:\t\t %ld chars, %ld bytes\n",
      len.num_chars, len.num_bytes);
  len = strlen_u16(utf16_string_2);
  printf("Length of UTF-16 persian string:\t %ld chars, %ld bytes\n",
      len.num_chars, len.num_bytes);
  len = strlen_u32(utf32_string_2);
  printf("Length of UTF-32 persian string:\t %ld chars, %ld bytes\n\n",
      len.num_chars, len.num_bytes);
  len = strlen_u16(utf16_string_3);
  printf("Length of UTF-16 alien string:\t\t %ld chars, %ld bytes\n",
      len.num_chars, len.num_bytes);
  len = strlen_u32(utf32_string_3);
  printf("Length of UTF-32 alien string:\t\t %ld chars, %ld bytes\n",
      len.num_chars, len.num_bytes);
  return 0;
}
```

*Code Box 12-9 [ExtremeC_examples_chapter12_3.c]: Hàm main của ví dụ 12.3*

Giờ, chúng ta phải biên dịch ví dụ trên. Lưu ý rằng ví dụ chỉ có thể được biên dịch bằng một compiler C11. Bạn<a id="_idIndexMarker871"></a> có thể thử dùng các compiler cũ hơn và xem các lỗi thu được. Các lệnh sau biên dịch và chạy chương trình trên:

```
$ gcc ExtremeC_examples_chapter12_3.c -std=c11 -o ex12_3.out
$ ./ex12_3.out
Length of ASCII string:            13 chars, 13 bytes
Length of UTF-8 english string:      13 chars, 13 bytes
Length of UTF-16 english string:     13 chars, 26 bytes
Length of UTF-32 english string:     13 chars, 52 bytes
Length of UTF-8 persian string:      11 chars, 19 bytes
Length of UTF-16 persian string:     11 chars, 22 bytes
Length of UTF-32 persian string:     11 chars, 44 bytes
Length of UTF-16 alien string:       5 chars, 14 bytes
Length of UTF-32 alien string:       5 chars, 20 bytes
$
```

*Shell Box 12-3: Biên dịch và chạy ví dụ 12.3*

Như bạn có thể thấy, cùng một chuỗi với cùng số ký tự dùng số byte khác nhau để mã hóa và lưu cùng một giá trị. UTF-8 dùng ít byte nhất, đặc biệt khi một số lượng lớn ký tự trong văn bản là ký tự ASCII, đơn giản vì hầu hết các ký tự sẽ chỉ dùng một byte.

Khi chúng ta đi qua các ký tự khác biệt hơn<a id="_idIndexMarker872"></a> so với các ký tự Latin, như các ký tự trong các ngôn ngữ châu Á, UTF-16 có sự cân bằng tốt hơn giữa số ký tự và số byte được dùng, vì hầu hết các ký tự sẽ dùng tối đa hai byte.

UTF-32 hiếm khi được dùng, nhưng nó <a id="_idIndexMarker873"></a>có thể được dùng trong các hệ thống mà việc có một *code print* fixed-length cho các ký tự là hữu ích; ví dụ, nếu hệ thống có sức mạnh tính toán thấp hoặc đang hưởng lợi<a id="_idIndexMarker874"></a> từ một số pipeline xử lý song song. Do đó, các ký tự UTF-32 có thể được dùng làm khóa trong các ánh xạ từ ký tự tới bất kỳ loại dữ liệu nào. Nói cách khác, chúng có thể được dùng để xây dựng một số chỉ mục để tra cứu dữ liệu rất nhanh.

<a id="_idParaDest-177"></a>

## Anonymous structure và anonymous union

Anonymous structure và <a id="_idIndexMarker875"></a>anonymous union là các định nghĩa kiểu không có tên, và chúng<a id="_idIndexMarker876"></a> thường được dùng trong các kiểu khác như một kiểu lồng nhau. Giải thích chúng bằng một ví dụ sẽ dễ hơn. Ở đây, bạn có thể thấy một kiểu có cả một anonymous structure lẫn một anonymous union ở cùng một chỗ, được hiển thị trong *Code Box 12-10*:

```
typedef struct {
  union {
    struct {
      int x;
      int y;
    };
    int data[2];
  };
} point_t;
```

*Code Box 12-10: Ví dụ về một anonymous structure cùng với một anonymous union*

Kiểu trên dùng cùng memory cho anonymous structure và trường mảng byte `data`. Code box sau cho thấy nó có thể được dùng như thế nào trong một ví dụ thật:

```
#include <stdio.h>
typedef struct {
  union {
    struct {
      int x;
      int y;
    };
    int data[2];
  };
} point_t;
int main(int argc, char** argv) {
  point_t p;
  p.x = 10;
  p.data[1] = -5;
  printf("Point (%d, %d) using an anonymous structure inside an anonymous union.\n", p.x, p.y);
  printf("Point (%d, %d) using byte array inside an anonymous union.\n",
      p.data[0], p.data[1]);
  return 0;
}
```

*Code box 12-11 [ExtremeC_examples_chapter12_4.c]: Hàm main dùng một anonymous structure cùng với một anonymous union*

Trong ví dụ này, chúng ta<a id="_idIndexMarker877"></a> đang tạo một anonymous union có một anonymous structure bên trong. Do đó, cùng một vùng memory được dùng để lưu một instance của<a id="_idIndexMarker878"></a> anonymous structure và mảng số nguyên two-element (hai phần tử). Tiếp theo, bạn có thể thấy output của chương trình trên:

```
$ gcc ExtremeC_examples_chapter12_4.c -std=c11 -o ex12_4.out
$ ./ex12_4.out
Point (10, -5) using anonymous structure.
Point (10, -5) using anonymous byte array.
$
```

*Shell Box 12-4: Biên dịch và chạy ví dụ 12.4*

Như bạn có thể thấy, mọi thay đổi đối với mảng số nguyên two-element đều có thể thấy được trong biến structure, và ngược lại.

<a id="_idParaDest-178"></a>

## Multithreading

Hỗ trợ multithreading đã <a id="_idIndexMarker879"></a>có trong C từ lâu thông qua các hàm threading POSIX, hay library `pthreads`. Chúng tôi đã trình bày kỹ lưỡng về multithreading trong *Chương 15*, *Thực thi Thread (Thread Execution)*, và *Chương 16*, *Thread Synchronization*.

Library threading POSIX, như tên gọi của nó ngụ ý, chỉ có sẵn trong các hệ thống POSIX-compliant như Linux và các hệ thống Unix-like khác. Do đó, nếu bạn đang ở trên một hệ điều hành non-POSIX compliant như Microsoft Windows, bạn phải dùng library do hệ điều hành cung cấp. Trong C11, một library threading chuẩn được cung cấp có thể được dùng trên mọi hệ thống đang dùng C chuẩn, bất kể nó có POSIX-compliant hay không. Đây là thay đổi lớn nhất mà chúng ta thấy trong chuẩn C11.

Không may là threading của C11 chưa được triển khai cho Linux và macOS. Do đó, chúng tôi không thể cung cấp các ví dụ hoạt động được vào thời điểm viết sách.

<a id="_idParaDest-179"></a>

## Một chút về C18

Như chúng tôi đã đề cập trong các phần trước<a id="_idIndexMarker881"></a>, chuẩn C18 chứa mọi bản sửa lỗi đã được thực hiện trong C11, và không có tính năng mới nào được giới thiệu trong nó. Như đã nói trước đây, link sau đưa bạn tới một trang mà trên đó bạn có thể thấy các vấn đề được tạo ra và đang được theo dõi cho C11 và các <a id="_idIndexMarker882"></a>thảo luận xung quanh chúng: http://www.open-std.org/jtc1/sc22/wg14/www/docs/n2244.htm.

<a id="_idParaDest-180"></a>

## Tóm tắt

Trong chương này, chúng ta đã đi qua C11, C18 và các chuẩn C gần đây nhất, và chúng ta đã khám phá các tính năng mới khác nhau của C11. Hỗ trợ Unicode, anonymous structure và union, và library threading chuẩn mới (mặc dù nó chưa có sẵn trong các compiler và nền tảng gần đây cho đến nay) nằm trong số những tính năng quan trọng nhất đã được giới thiệu trong C hiện đại. Chúng ta sẽ mong chờ các phiên bản mới của chuẩn C trong tương lai.

Trong chương tiếp theo, chúng ta bắt đầu nói về concurrency và lý thuyết đằng sau các hệ thống concurrent. Điều này sẽ bắt đầu một hành trình dài qua sáu chương trong đó chúng ta sẽ trình bày multithreading và multi-processing nhằm đạt được mục đích có thể viết các hệ thống concurrent.
