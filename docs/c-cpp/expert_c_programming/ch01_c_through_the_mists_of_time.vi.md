# Chương 1. C qua màn sương thời gian

C kỳ quặc, có khiếm khuyết và thành công vang dội.

—Dennis Ritchie

tiền sử của C…quy tắc vàng cho compiler-writers…trải nghiệm ban đầu với C…standard I/O library và C preprocessor…K\&R C…hiện tại: ANSI C…hay đấy, nhưng có đúng chuẩn?…cấu trúc chuẩn ANSI C…đọc chuẩn ANSI C để vui, thích thú và thu lợi…"thay đổi thầm lặng" thầm lặng đến đâu?…giải trí nhẹ nhàng — tác động implementation-defined của pragma

## Tiền sử của C

Câu chuyện C nghịch lý thay bắt đầu bằng thất bại. Năm 1969, dự án Multics lớn — hợp tác giữa General Electric, MIT và Bell Laboratories để xây dựng operating system — rõ ràng gặp rắc rối. Không chỉ không cung cấp được hệ thống on-line nhanh, tiện như hứa, nó còn chẳng cung cấp được thứ gì dùng được. Dù cuối cùng nhóm phát triển cũng khiến Multics ì ạch hoạt động, họ sa cùng vũng lầy đã giữ chân IBM với OS/360. Họ cố tạo operating system quá lớn trên hardware quá nhỏ. Multics là kho báu vấn đề kỹ thuật đã giải quyết, nhưng cũng mở đường để C chứng minh nhỏ là đẹp.

Khi nhân viên Bell Labs vỡ mộng rút khỏi Multics, họ tìm nhiệm vụ khác. Nhà nghiên cứu Ken Thompson rất muốn làm operating system khác, gửi nhiều đề xuất (đều bị từ chối) lên ban quản lý Bell. Trong lúc đợi phê duyệt, Thompson và co-worker Dennis Ritchie giải trí bằng port software "Space Travel" của Thompson sang chiếc PDP-7 little-used. Space Travel mô phỏng các thiên thể chính của hệ mặt trời, hiển thị trên màn hình đồ họa cùng tàu vũ trụ có thể điều khiển và đáp xuống các hành tinh. Đồng thời, Thompson miệt mài cung cấp cho PDP-7 nền tảng operating system mới, đơn giản và lighter-weight hơn Multics nhiều. Mọi thứ viết bằng assembler. Brian Kernighan đặt tên "UNIX" năm 1970, paro-dying bài học từ Multics về điều không nên làm. Hình 1-1 mô tả C, UNIX và hardware liên quan thời đầu.

Hình 1-1. C, UNIX thời đầu và hardware liên quan

![image](images/ch01/img01-01.png)

Trong tình huống chicken-and-egg tiềm tàng này, UNIX chắc chắn có trước C rất lâu (đó cũng là lý do thời gian hệ thống UNIX đo bằng giây từ ngày 1 tháng 1 năm 1970 — lúc thời gian bắt đầu). Nhưng đây là chuyện lập trình, không phải gia cầm. Viết assembler tỏ ra bất tiện; viết code cho data structure lâu hơn, debug và hiểu khó hơn. Thompson muốn lợi thế của ngôn ngữ triển khai high-level nhưng không có vấn đề hiệu năng, độ phức tạp PL/I <sup>\[1\]</sup> đã thấy trên Multics. Sau cuộc thử nghiệm Fortran ngắn và không thành công, Thompson tạo ngôn ngữ B bằng đơn giản hóa ngôn ngữ nghiên cứu BCPL <sup>\[2\]</sup> để interpreter vừa memory 8K word của PDP-7. B chưa bao giờ thật sự thành công; giới hạn memory hardware chỉ đủ interpreter, không đủ compiler. Hiệu năng chậm khiến B không được dùng để systems programming chính UNIX.

<sup>\[1\]</sup> Khó khăn khi học, dùng và triển khai PL/I khiến một lập trình viên viết thơ: IBM có một PL/I / Cú pháp tệ hơn cả JOSS / Ngôn ngữ đi đến nơi nào / Nơi đó hoàn toàn thất bát. JOSS là ngôn ngữ trước đó, cũng chẳng nổi tiếng đơn giản.

<sup>\[2\]</sup> "BCPL: A Tool for Compiler Writing and System Programming," Martin Richards, Proc. AFIPS Spring Joint Computer Conference, 34 (1969), tr. 557-566. BCPL không viết tắt "Before C Programming Language", dù tên trùng hợp thú vị. Nó là "Basic Combined Programming Lan-guage" — "basic" nghĩa "không rườm rà" — được các nhà nghiên cứu London University và Cambridge University tại Anh cùng phát triển. Multics có một triển khai BCPL.

### Giáo điều software

![image](images/ch01/img01-02.png)

Quy tắc vàng của Compiler-Writers:

Hiệu năng là (gần như) tất cả.

Hiệu năng gần như là tất cả trong compiler. Có mối quan tâm khác: thông báo lỗi có nghĩa, tài liệu tốt, hỗ trợ sản phẩm. Các yếu tố này lu mờ so với tầm quan trọng người dùng dành cho tốc độ thuần túy. Hiệu năng compiler có hai mặt: runtime performance (code chạy nhanh thế nào) và compile time performance (mất bao lâu tạo code). Runtime performance thường chi phối, trừ môi trường phát triển và sinh viên.

Nhiều compiler optimization kéo dài compilation time nhưng rút ngắn run time nhiều. Optimization khác (như dead code elimination, bỏ runtime check) tăng tốc cả compile time, run time và giảm memory usage. Mặt trái của optimization mạnh là nguy cơ không báo kết quả không hợp lệ. Optimizer rất cẩn thận chỉ biến đổi an toàn, nhưng lập trình viên có thể gây kết quả sai bằng code không hợp lệ (ví dụ truy cập ngoài array bound vì "biết" variable mong muốn ở sát bên).

Vì vậy hiệu năng gần như, nhưng chưa hoàn toàn là tất cả — nếu kết quả không chính xác thì nhận được nhanh đến đâu cũng vô nghĩa. Compiler-writers thường cung cấp tùy chọn để mỗi lập trình viên chọn optimization mong muốn. Việc B không thành công cho đến khi Dennis Ritchie tạo bản biên dịch high-performance tên "New B" minh họa quy tắc vàng cho compiler-writers.

B đơn giản hóa BCPL bằng bỏ vài tính năng (như nested procedure, một số cấu trúc loop-ing), giữ ý tưởng array reference nên "phân rã" thành tham chiếu pointer-plus-offset. B cũng giữ tính không có type của BCPL; operand duy nhất là machine word. Thompson nghĩ ra operator `++`, `--` và thêm vào compiler B trên PDP-7. Niềm tin phổ biến, hấp dẫn rằng chúng có trong C vì PDP-11 có addressing mode auto-increment/decrement tương ứng là sai! Auto increment và decrement có trước hardware PDP-11, dù đúng là câu lệnh C sao chép character trong string:

```
*p++ = *s++;
```

có thể được biên dịch đặc biệt hiệu quả thành code PDP-11:

```
movb (r0)+,(r1)+
```

khiến một số người kết luận sai rằng cái trước được tạo riêng cho cái sau.

Ngôn ngữ không có type tỏ ra không khả thi khi phát triển chuyển sang PDP-11 mới ra mắt năm 1970. Processor này hỗ trợ hardware cho datatype nhiều kích thước, còn B không diễn tả được. Hiệu năng cũng là vấn đề, khiến Thompson triển khai lại OS bằng assembler PDP-11 thay vì B. Dennis Ritchie tận dụng PDP-11 mạnh hơn tạo "New B", giải quyết cả hai vấn đề: nhiều datatype và hiệu năng. "New B" — tên nhanh chóng thành "C" — được compile thay vì interpret, thêm type system với mỗi variable được mô tả trước khi dùng.

## Trải nghiệm ban đầu với C

Type system được thêm chủ yếu để compiler-writer phân biệt float, double và character với word trên hardware PDP-11 mới. Khác với Pascal, nơi type system bảo vệ lập trình viên bằng giới hạn operation hợp lệ trên data item. Với triết lý khác, C từ chối strong typing và cho lập trình viên assignment giữa object khác type nếu muốn. Type system gần như là ý nghĩ bổ sung, chưa bao giờ được đánh giá chặt chẽ hay kiểm thử rộng về tính dễ dùng. Đến nay, nhiều lập trình viên C tin "strong typing" chỉ là gõ bàn phím mạnh hơn.

Ngoài type system, nhiều tính năng khác được đưa vào C vì lợi ích C compiler-writer (sao không, vì C compiler-writers là khách hàng chính vài năm đầu). Những tính năng dường như phát triển với compiler-writer trong đầu gồm:

- Array bắt đầu từ 0 thay vì 1. Phần lớn người đếm từ 1 thay vì zero. Compiler-writers bắt đầu zero vì quen nghĩ theo offset. Đôi lúc khó cho non-compiler-writers: dù `a[100]` xuất hiện trong định nghĩa array, tốt nhất không lưu dữ liệu tại `a[100]`, vì array chỉ trải từ `a[0]` đến `a[99]`.

- Type C nền tảng map trực tiếp lên hardware bên dưới. Không có type complex-number built-in như Fortran chẳng hạn. Người viết compiler-writer không phải tốn công hỗ trợ semantics hardware không trực tiếp cung cấp. C không hỗ trợ floating-point number cho đến khi hardware hỗ trợ.

- Keyword `auto` dường như vô dụng. Chỉ có nghĩa với compiler-writer thêm entry vào symbol table — storage tự động cấp khi vào block (khác global static allocation hoặc dynamic allocation trên heap). Auto không liên quan lập trình viên khác vì mặc định đã có.

- Array name trong expression "decay" thành pointer. Coi array như pointer giúp đơn giản hóa. Không cần cơ chế phức tạp coi chúng là composite object hay chịu sự kém hiệu quả khi sao chép mọi thứ lúc truyền vào function. Nhưng đừng lầm rằng array và pointer luôn tương đương; Chương 4 nói thêm.

- Expression Floating-point được mở rộng thành double-length-precision ở mọi nơi. Dù ANSI C không còn vậy, ban đầu real number constant luôn là double, float variable luôn được chuyển thành double trong mọi expression. Lý do, dù chúng tôi chưa thấy in đâu, liên quan hardware floating-point PDP-11. Trước hết, chuyển float sang double trên PDP-11 hay VAX rất rẻ: chỉ thêm word toàn zero. Chuyển ngược chỉ bỏ word thứ hai. Một số hardware floating-point PDP-11 có mode bit, nên hoặc làm toàn số học single-precision hoặc toàn double-precision; muốn đổi phải chuyển mode. Vì đa số chương trình UNIX đầu không floating-point-intensive, đặt máy ở mode double-precision và giữ nguyên dễ hơn compiler-writer cố theo dõi!

- Không có nested function (function chứa trong function khác). Điều này đơn giản compiler và tăng nhẹ tốc độ tổ chức runtime của chương trình C. Cơ chế chính xác được mô tả trong Chương 6, "Thơ ca chuyển động: Runtime data structure".

- Keyword `register`. Nó gợi ý cho compiler-writer variable nào lập trình viên thấy "nóng" (tham chiếu thường xuyên), nên hữu ích khi giữ trong register. Hóa ra là sai lầm. Code tốt hơn nếu compiler phân register cho từng lần dùng variable thay vì dành suốt lifetime từ declaration. Có keyword `register` giúp đơn giản compiler bằng chuyển gánh nặng sang lập trình viên.

Còn nhiều tính năng C khác được nghĩ ra để tiện C compiler-writer. Bản thân điều này không nhất thiết xấu; nó đơn giản hóa ngôn ngữ rất nhiều, tránh semantics phức tạp (như generic hay tasking Ada; string handling PL/I; template hay multiple inheritance C++), khiến C dễ học, dễ triển khai hơn nhiều và chạy nhanh hơn.

Khác phần lớn ngôn ngữ lập trình, C tiến hóa lâu dài, qua nhiều dạng trung gian trước hình thức hiện tại. Nó qua nhiều năm sử dụng thực tế thành ngôn ngữ được thử thách và kiểm chứng. Compiler C đầu xuất hiện khoảng 1972, tức hơn 20 năm trước lúc này. UNIX bên dưới càng phổ biến, C càng được mang theo. Chú trọng operation low-level do hardware trực tiếp hỗ trợ đem lại tốc độ, tính portable, ngược lại giúp lan truyền UNIX trong chu kỳ tích cực.

## Standard I/O library và C preprocessor

Chức năng bỏ khỏi C compiler phải xuất hiện đâu đó; với C, nó xuất hiện ở runtime, trong application code hoặc runtime library. Nhiều ngôn ngữ khác để compiler ngầm chèn code gọi runtime support, nên lập trình viên không phải lo; nhưng gần như mọi routine C library phải gọi tường minh. Trong C, khi cần, lập trình viên phải tự quản dynamic memory, lập trình array variable-size, kiểm tra array bound và range.

Tương tự, ban đầu I/O không được định nghĩa trong C mà cung cấp bằng library routine, thực tế đã thành phương tiện chuẩn. Portable I/O library do Mike Lesk <sup>\[3\]</sup> viết, xuất hiện đầu khoảng 1972 trên cả ba nền tảng hardware hiện có. Kinh nghiệm thực tế cho thấy hiệu năng chưa đạt mong đợi, nên library được tinh chỉnh, thu gọn thành standard I/O library.

<sup>\[3\]</sup> Sau này chính Michael nêu quy tắc kinh nghiệm mỉa mai vui nhộn rằng "thiết kế hệ thống sao cho manual ngắn nhất sẽ giảm thiểu công sức học" (Datamation, tháng 11 năm 1981, tr.146). Có vài lời bình hiện lên, trong đó "Bwaa ha ha!" có lẽ giảm thiểu công sức học nhất.

C preprocessor, cũng thêm khoảng lúc đó theo đề nghị Alan Snyder, đáp ứng ba mục đích chính:

- Thay string, dạng "đổi mọi foo thành baz", thường để đặt symbolic name cho constant.

- Include source file (BCPL tiên phong). Declaration chung tách vào header file, cung cấp cho nhiều source file. Dù quy ước ".h" được chọn cho extension header file, đáng tiếc không có quy ước liên hệ header file với object library chứa code tương ứng.

- Mở rộng code template tổng quát. Khác function, cùng macro argument có thể mang type khác nhau ở lời gọi liên tiếp (actual argument macro chỉ được đặt nguyên vào output). Tính năng này thêm sau hai tính năng đầu, hơi lệch với C. White space tạo khác biệt lớn với macro expansion loại này.

```
#define a(y) a_expanded(y)
a(x);
```

mở rộng thành:

```
a_expanded(x);
```

Tuy nhiên,

```
#define a (y) a_expanded (y)
a(x);
```

được biến đổi thành:

```
(y) a_expanded (y)(x);
```

Hoàn toàn không gần giống nhau. Macro processor có thể dùng curly brace như phần còn lại C để chỉ token nhóm trong block, nhưng không làm vậy.

Không có thảo luận sâu C preprocessor ở đây; phản ánh quan điểm rằng cách dùng thích hợp duy nhất là macro không cần thảo luận sâu. C++ tiến thêm bước, đưa quy ước nhằm khiến preprocessor hoàn toàn không cần thiết.

### Giáo điều software

![image](images/ch01/img01-02.png)

C không phải Algol

Khi viết shell (command interpreter) UNIX Version 7 tại Bell Labs cuối những năm 1970, Steve Bourne quyết dùng C preprocessor để C giống Algol-68 hơn một chút. Trước đó tại Cambridge University ở Anh, Steve viết compiler Algol-68, thấy dễ debug code có dấu "kết thúc câu lệnh" rõ như `if ... fi`, `case ... esac`. Steve nghĩ chỉ nhìn " `}`" không đủ dễ biết khớp với gì. Vì vậy, ông tạo nhiều preprocessor definition:

```
#define STRING char *
#define IF if(
#define THEN ){
#define ELSE } else {
#define FI ;}
#define WHILE while (
#define DO ){
#define OD ;}
#define INT int
#define BEGIN {
#define END }
```

Điều này cho viết shell bằng code như sau:

```
INT compare(s1, s2)
    STRING s1;
    STRING s2;
BEGIN
    WHILE *s1++ == *s2
    DO IF *s2++ == 0
        THEN return(0);
        FI
    OD
    return(*--s1 - *s2);
END
```

Giờ xem lại, lần này bằng C:

```
int compare(s1, s2)
    char * s1, *s2;
{
    while (*s1++ == *s2) {
            if (*s2++ == 0) return (0);
    }
    return (*--s1 - *s2);
}
```

Phương ngữ Algol-68 này đạt địa vị huyền thoại khi Bourne shell lan xa Bell Labs, làm một số lập trình viên C bực. Họ phàn nàn nó khiến người khác khó bảo trì code hơn. Bourne shell BSD 4.3 (trong /bin/sh) đến nay vẫn viết bằng tập con Algol!

Tôi có lý do riêng để càu nhàu Bourne shell — báo lỗi của nó đều đáp xuống bàn tôi! Rồi tôi giao Sam! Chúng tôi thật sự gặp không ít lỗi: shell không dùng malloc mà tự quản heap storage bằng sbrk. Bảo trì software như vậy quá thường cứ sửa hai lỗi lại thêm một lỗi mới. Steve giải thích custom memory allocator nhằm tăng hiệu quả string-handling, và ông không bao giờ nghĩ ai ngoài mình sẽ thấy code.

Phương ngữ C Bournegol thật sự truyền cảm hứng cho The International Obfuscated C Code Competition, cuộc thi vui nhộn nơi lập trình viên thi nhau nghĩ chương trình bí hiểm, khó hiểu (sẽ nói thêm sau).

Tốt nhất giới hạn macro ở đặt tên literal constant và viết tắt vài cấu trúc well-chosen. Đặt macro name toàn chữ hoa để lúc dùng thấy ngay không phải function call. Tránh mọi cách dùng C preprocessor sửa ngôn ngữ bên dưới thành thứ không còn là C.

## K\&R C

Đến giữa những năm 1970, ngôn ngữ đã nhận ra được là C ta biết và yêu ngày nay. Tiếp tục tinh chỉnh, chủ yếu dọn chi tiết (như cho function trả structure value) hoặc mở rộng basic type theo hardware mới (như thêm keyword `unsigned`, `long)`). Năm 1978 Steve Johnson viết pcc, portable C compiler. Source được cung cấp ngoài Bell Labs, được port rộng, tạo nền tảng chung cho cả thế hệ C compiler. Con đường tiến hóa đến hiện tại trong Hình 1-2.

Hình 1-2. C về sau

![image](images/ch01/img01-03.png)

### Giáo điều software

![image](images/ch01/img01-02.png)

Lỗi khác thường

Một tính năng C kế thừa Algol-68 là assignment operator. Nó cho viết operand lặp một lần thay vì hai, gợi ý code generator rằng định địa chỉ operand cũng tiết kiệm tương tự được. Ví dụ viết `b+=3` thay `b=b+3`. Assignment operator ban đầu đặt assignment trước operator, như `b=+3`. Điểm kỳ quặc trong lexical analyzer B khiến triển khai `=`op đơn giản hơn op`=` ngày nay. Dạng này dễ nhầm vì quá dễ lẫn

```
b=-3; /* subtract 3 from b */
```

với

```
b= -3; /* assign -3 to b */
```

Vì vậy tính năng đổi sang thứ tự hiện tại. Trong thay đổi đó, code formatter `indent` được sửa để nhận dạng assignment operator lỗi thời rồi đảo thành operator assignment. Đây thực sự là quyết định rất tệ; formatter không bao giờ nên đổi gì ngoài white space. Đáng tiếc xảy ra hai việc. Lập trình viên đưa lỗi vào: gần như mọi thứ (không phải variable) xuất hiện sau assignment đều bị đảo vị trí.

Nếu "may", đó là thứ gây syntax error, như

```
epsilon=.0001;
```

bị đảo thành

```
epsilon.=0001;
```

Nhưng source statement như

```
valve=!open; /* valve is set to logical negation of open
*/
```

bị lặng lẽ biến thành

```
valve!=open; /* valve is compared for inequality to open
*/
```

vẫn compile tốt nhưng không đổi giá trị `valve`.

Việc thứ hai là lỗi ẩn không bị phát hiện. Dễ né bằng thêm dấu cách sau assignment, nên khi assignment operator lỗi thời ít dùng dần, mọi người quên indent đã được vá víu để "cải thiện" nó. Lỗi indent tồn tại trong một số triển khai đến mid-1980's. Cực kỳ tai hại!

Năm 1978, kinh thánh C kinh điển The C Programming Language được xuất bản. Theo sự accla-mation rộng rãi, tôn vinh tác giả Brian Kernighan và Dennis Ritchie, tên "K\&R C" áp cho phiên bản ngôn ngữ này. Nhà xuất bản ước bán khoảng một nghìn bản; đến nay (1994) hơn một triệu rưỡi (xem Hình 1-3). C là một trong ngôn ngữ thành công nhất hai thập kỷ qua, có lẽ thành công nhất. Nhưng khi lan rộng, cám dỗ tách thành phương ngữ tăng.

Hình 1-3. Như Elvis, C ở khắp nơi

![image](images/ch01/img01-04.png)

## Hiện tại: ANSI C

Đầu những năm 1980, C được dùng rộng trong ngành, nhưng có nhiều triển khai, thay đổi. Người triển khai PC nhận ra lợi thế C so với BASIC tạo cú hích mới. Microsoft có triển khai cho IBM PC thêm keyword (`far`, `near`, v.v.) giúp pointer đối phó kiến trúc bất thường Intel 80x86. Khi nhiều triển khai non-pcc-based khác xuất hiện, C có nguy cơ theo BASIC thành họ ngôn ngữ liên hệ lỏng lẻo, ngày càng tách xa, ever-diverging.

Rõ ràng cần chuẩn ngôn ngữ chính thức. May có nhiều tiền lệ — mọi ngôn ngữ thành công cuối cùng đều chuẩn hóa. Nhưng vấn đề manual chuẩn là chỉ có nghĩa nếu đã biết nó có nghĩa gì. Viết bằng tiếng Anh thì càng cố chính xác càng dài, buồn tẻ, tối nghĩa. Viết bằng ký pháp toán để định nghĩa ngôn ngữ thì quá nhiều người không tiếp cận được.

Qua nhiều năm, manual định nghĩa chuẩn ngôn ngữ dài hơn nhưng không dễ hiểu hơn. Algol-60 Reference Definition chỉ 18 trang cho ngôn ngữ phức tạp tương đương C; Pascal mô tả trong 35 trang. Kernighan, Ritchie dùng 40 trang cho báo cáo C đầu; dù còn lỗ hổng, đủ cho nhiều người triển khai. ANSI C định nghĩa trong manual dày hơn 200 trang. Một phần sách này mô tả cách dùng thực tế để làm sáng tỏ, mở rộng văn bản đôi lúc tối nghĩa của tài liệu chuẩn ANSI.

Năm 1983, nhóm công tác C thành lập dưới bảo trợ American National Standards Institute. Phần lớn quá trình xoay quanh xác định tính năng chung, nhưng cũng có thay đổi, tính năng mới đáng kể. Keyword `far`, `near` được tranh luận rất lâu, cuối cùng không vào chuẩn ANSI hơi UNIX-centric. Dù hơn 50 triệu PC và đây là nền tảng phổ biến nhất cho người triển khai C, người ta thấy (đúng theo chúng tôi) không nên biến đổi ngôn ngữ để đối phó giới hạn một kiến trúc cụ thể.

### Mẹo thực hành hữu ích

![image](images/ch01/img01-05.png)

Nên dùng phiên bản C nào?

Lúc này, bất kỳ ai học hay dùng C nên làm với ANSI C, không phải K\&R C.

Dự thảo chuẩn cuối cùng được ANSI thông qua tháng 12 năm 1989. Tổ chức chuẩn quốc tế ISO sau đó thông qua chuẩn ANSI C (đáng tiếc bỏ phần "Rationale" rất hữu ích, thay đổi format, số đoạn vụn vặt nhưng annoy-ing). ISO là tổ chức quốc tế, về kỹ thuật cấp cao hơn, nên đầu 1990 ANSI thông qua lại ISO C (lại exclud-ing Rationale) thay phiên bản mình. Vì vậy, về nguyên tắc nên nói chuẩn C ANSI thông qua là ISO C và gọi ngôn ngữ ISO C. Rationale là văn bản hữu ích giúp hiểu chuẩn rất nhiều, được xuất bản riêng. <sup>\[4\]</sup>

<sup>\[4\]</sup> Chỉ ANSI C Rationale được cung cấp miễn phí bằng anonymous ftp từ ftp.uu.net, thư mục /doc/standards/ansi/X3.159-1989/.

(Nếu chưa biết anonymous ftp, hãy chạy, đừng đi bộ, tới hiệu sách gần nhất mua sách Internet trước khi trở thành \<chèn ẩn dụ lái xe vụng về tùy chọn\> trên Xa lộ thông tin.) Rationale còn xuất bản thành sách ANSI C Rationale, New Jersey, Silicon Press, 1990. Chính chuẩn ANSI C không có qua ftp ở đâu vì ANSI lấy phần rev-enue quan trọng từ bán chuẩn in.

#### Mẹo thực hành hữu ích

![image](images/ch01/img01-05.png)

Lấy bản chuẩn C ở đâu

Tên chính thức chuẩn C: ISO/IEC 9899-1990. ISO/IEC là International Organization for Standardization International Electrotechnical Commission. Cơ quan chuẩn bán khoảng $130.00. Ở Mỹ, lấy bản chuẩn bằng viết thư tới:

American National Standards Institute 11 West 42nd Street New York, NY 10036 Điện thoại (212) 642-4900 Ngoài Mỹ, có thể viết tới:

ISO Sales Case postale 56 CH-1211 Genève 20 Switzerland

Nhớ chỉ định ấn bản tiếng Anh.

Nguồn khác là mua The Annotated ANSI C Standard của Herbert Schildt (New York, Osborne McGraw-Hill, 1993). Sách chứa bản chuẩn đầy đủ thu nhỏ bằng chụp ảnh. Hai ưu điểm khác là giá $39.95 chưa bằng one-third giá cơ quan chuẩn và có ở hiệu sách địa phương; nơi đó, khác ANSI hay ISO, có lẽ đã nghe thế kỷ hai mươi và nhận đặt điện thoại bằng credit card.

Thực tế, "ANSI C" được dùng rộng trước khi có ISO Working Group 14 chuyên C. Tên cũng thích hợp vì nhóm ISO giao phát triển kỹ thuật chuẩn đầu cho ủy ban ANSI X3J11. Gần cuối, ISO WG14 và X3J11 phối hợp giải quyết vấn đề kỹ thuật, bảo đảm chuẩn được cả hai chấp nhận. Thực tế, cuối quá trình trễ một năm do sửa dự thảo bao phủ vấn đề quốc tế như wide character, locale.

Ai theo dõi vài năm vẫn gọi ANSI C. Đạt thứ tốt này, ai cũng muốn công nhận chuẩn C. ANSI C còn là chuẩn châu Âu (CEN 29899), chuẩn X/Open. ANSI C được thông qua thành Federal Information Processing Standard, FIPS 160, do National Institute of Standards and Technology ban hành tháng 3 năm 1991, cập nhật ngày 24 tháng 8 năm 1992. Công việc với C tiếp tục — đang bàn thêm complex number type.

## Hay đấy, nhưng có đúng chuẩn?

Cứu một cái cây — giải tán nhóm công tác ISO ngay hôm nay.

—Vô danh

Chuẩn ANSI C độc đáo ở vài điểm thú vị. Nó định nghĩa thuật ngữ sau mô tả đặc tính triển khai. Biết chúng giúp hiểu điều gì chấp nhận được trong ngôn ngữ. Hai thuật ngữ đầu liên quan code không portable; hai tiếp là code xấu; hai cuối là code portable.

### Code không portable:

implementation-defined — Người viết compiler-writer chọn điều xảy ra và phải ghi tài liệu.

Ví dụ: sign bit có được truyền khi dịch int sang phải không.

unspecified — Hành vi của điều đúng mà chuẩn không đặt yêu cầu.

Ví dụ: thứ tự đánh giá argument.

### Code xấu:

undefined — Hành vi của điều sai mà chuẩn không đặt yêu cầu. Mọi thứ đều được phép, từ không gì đến thông báo cảnh báo, kết thúc chương trình, CPU nóng chảy, phóng tên lửa hạt nhân (giả sử đã cài đúng tùy chọn hardware).

Ví dụ: điều xảy ra khi signed integer overflow.

constraint — Hạn chế hay yêu cầu phải tuân thủ. Nếu không, hành vi chương trình thành undefined theo nghĩa trên. Điều đáng kinh ngạc: dễ biết có phải constraint vì mỗi chủ đề trong chuẩn có tiểu mục "Constraints" liệt kê tất cả. Điều còn kinh ngạc hơn: chuẩn quy định <sup>\[5\]</sup> compiler chỉ phải tạo thông báo lỗi cho vi phạm syntax và constraint! Nghĩa là có thể phá semantic rule không nằm trong tiểu mục constraint; vì hành vi undefined, compiler tự do làm gì cũng được, thậm chí không phải cảnh báo!

<sup>\[5\]</sup> Trong đoạn 5.1.1.3, "Diagnostics", nếu nhất định muốn biết. Là chuẩn ngôn ngữ, nó không nói đơn giản phải báo ít nhất một lỗi trong chương trình sai. Nó nói long trọng như nhóm luật sư doanh nghiệp được trả theo từ soạn: một conforming implementation shall <sup>\[\*\]</sup> tạo ít nhất một diagnostic message (được nhận diện theo cách implementation-dependent) cho mỗi translation unit vi phạm syntax rule hoặc constraint. Không cần diagnostic message trong trường hợp khác.

<sup>\[\*\]</sup> Quy tắc hữu ích từ Brian Scearce <sup>\[</sup>![](images/ch01/img01-06.png)<sup>\]</sup> — nếu nghe lập trình viên nói "shall", họ đang trích chuẩn.

<sup>\[</sup>![](images/ch01/img01-06.png)<sup>\]</sup> Người phát minh chú thích lồng nhau.

Ví dụ: operand operator `%` phải có integral type. Vì vậy dùng type non-integral với `%` phải tạo diagnostic.

Ví dụ rule không phải constraint: mọi identifier khai báo trong C standard header file dành riêng cho implementation, nên không được khai báo function `malloc()` vì standard header đã có function tên đó. Nhưng vì không là constraint, có thể phá rule mà compiler không phải cảnh báo! Xem thêm phần "interpositioning" Chương 5.

#### Giáo điều software

![image](images/ch01/img01-02.png)

Undefined behavior làm CPU IBM PC nóng chảy!

Gợi ý undefined software behavior làm CPU nóng chảy không xa vời như thoạt tưởng. Monitor IBM PC đầu hoạt động ở horizontal scan rate do video controller chip cung cấp. Flyback transformer (thiết bị tạo điện áp cao tăng tốc electron làm phosphor trên màn hình phát sáng) dựa vào tần số hợp lý. Tuy nhiên software có thể đặt scan rate video chip bằng zero, đưa điện áp không đổi vào phía sơ cấp transformer. Nó thành điện trở, tiêu tán công suất bằng nhiệt thay vì biến đổi lên màn hình. Monitor cháy trong vài giây. Thế đấy: undefined software behavior làm hệ thống nóng chảy!

### Code portable:

strictly-conforming — Chương trình strictly-conforming là chương trình:

- Chỉ dùng tính năng đã quy định.

- Không vượt giới hạn implementation-defined.

- Không có output phụ thuộc tính năng implementation-defined, unspecified hay undefined.

Điều này nhằm mô tả chương trình portable tối đa, luôn cho output giống hệt bất kể chạy trên gì. Thực tế lớp này không thú vị lắm vì nhỏ so với toàn bộ chương trình conforming. Ví dụ chương trình sau không strictly conforming:

```
#include <limits.h>
#include <stdio.h>
int main() { (void) printf("biggest int is %d", INT_MAX);
return 0;}

/* not strictly conforming: implementation-defined output! */
```

Trong phần còn lại, chúng tôi thường không cố làm chương trình ví dụ strictly conforming. Nó làm rối văn bản, khó thấy điểm cụ thể đang bàn. Tính portable có giá trị, nên luôn đặt cast, return value cần thiết, v.v. trong code real-world.

conforming — Chương trình conforming có thể phụ thuộc tính năng không portable của implementation. Nó conforming với implementation cụ thể, có thể nonconforming với compiler khác. Có thể có extension, nhưng không extension thay hành vi chương trình strictly-conforming. Tuy nhiên rule không phải constraint, nên đừng mong compiler cảnh báo vi phạm khiến chương trình nonconforming!

Ví dụ chương trình trên là conforming.

## Translation limit

Chuẩn ANSI C thật sự quy định giới hạn dưới kích thước chương trình phải dịch thành công, ở đoạn 5.2.4.1. Phần lớn ngôn ngữ nói dataname có bao nhiêu character, một số quy định giới hạn chấp nhận được cho số array dimension tối đa. Nhưng quy định lower bound kích thước các tính năng khác là bất thường, nếu không nói độc đáo trong chuẩn ngôn ngữ. Thành viên ủy ban bình luận nó nhằm hướng dẫn chọn kích thước tối thiểu chấp nhận được.

Mỗi compiler ANSI C phải hỗ trợ ít nhất:

- 31 parameter trong function definition

- 31 argument trong function call

- 509 character trong source line

- 32 mức ngoặc đơn lồng trong expression

- Giá trị tối đa `long int` không nhỏ hơn 2.147.483.647 (tức long integer ít nhất 32 bit).

v.v. Hơn nữa, compiler conforming phải compile và execute chương trình kiểm tra mọi giới hạn cùng lúc. Ngạc nhiên là giới hạn "bắt buộc" không thực sự là constraint — compiler có thể nghẹn mà không báo lỗi.

Compiler limit thường là vấn đề "chất lượng triển khai"; đưa vào ANSI C ngầm thừa nhận port code dễ hơn nếu đặt kỳ vọng rõ về khả năng cho mọi implementation. Dĩ nhiên implementation thật tốt không có giới hạn định sẵn, chỉ có giới hạn yếu tố ngoài như memory, disk. Có thể dùng linked list hoặc mở rộng table động khi cần (kỹ thuật Chương 10).

## Cấu trúc chuẩn ANSI C

Nên tạm rẽ để xem nguồn gốc, nội dung chuẩn ANSI C. Chuẩn có bốn phần chính:

Phần 4: Giới thiệu, định nghĩa thuật ngữ (5 trang).

Phần 5: Environment (13 trang). Bao phủ hệ thống bao quanh, hỗ trợ C, gồm điều xảy ra lúc chương trình start-up, kết thúc, signal, operation floating-point. Còn có giới hạn dưới translator và character set.

Phần 6: Ngôn ngữ C (78 trang). Dựa trên "The C Reference Manual" kinh điển của Dennis Ritchie, xuất hiện trong nhiều ấn phẩm gồm Phụ lục A The C Programming Language. So chuẩn với phụ lục, phần lớn heading giống và cùng thứ tự. Nhưng chủ đề trong chuẩn có format chặt hơn, như Hình 1-4 (bỏ tiểu mục trống).

Hình 1-4. Một đoạn trong chuẩn ANSI C trông thế nào

![image](images/ch01/img01-07.png)

Phụ lục gốc chỉ 40 trang, còn phần chuẩn này dài gấp đôi.

Phần 7: C runtime library (81 trang). Danh sách library call implementation conforming phải cung cấp — service, routine chuẩn làm chức năng thiết yếu hay hữu ích. Phần 7 dựa trên chuẩn /usr/group 1984, bỏ phần UNIX-specific. "/usr/group" ban đầu là nhóm người dùng UNIX quốc tế. Năm 1989 đổi "UniForum", nay là hiệp hội thương mại phi lợi nhuận thúc đẩy UNIX operating system.

Thành công UniForum định nghĩa UNIX theo hành vi thúc đẩy nhiều sáng kiến, gồm X/Open portability guide (phiên bản 4, XPG/4 ra tháng 10 năm 1992), IEEE POSIX 1003, System V Interface Definition, ANSI C library. Mọi người phối hợp với nhóm ANSI C để dự thảo chuẩn nhất quán với nhau. Ơn trời.

Chuẩn ANSI C còn có phụ lục hữu ích:

Phụ lục F: Thông báo cảnh báo thường gặp. Một số tình huống phổ biến không bắt buộc diagnostic message nhưng thường hữu ích nếu vẫn tạo.

Phụ lục G: Vấn đề portability. Lời khuyên tổng quát gom từ khắp chuẩn, gồm thông tin hành vi unspecified, undefined, implementation-defined.

### Giáo điều software

![image](images/ch01/img01-02.png)

Chuẩn đúc trong bê tông, kể cả sai sót

Chỉ vì ghi trong chuẩn quốc tế không có nghĩa đầy đủ, nhất quán hay đúng. Chuẩn IEEE POSIX 1003.1-1988 (chuẩn OS định nghĩa hành vi UNIX-like) có mâu thuẫn vui:

"\[Pathname\] ... gồm tối đa PATH\_MAX byte, bao gồm terminating null character." — phần 2.3

"PATH\_MAX là số byte tối đa pathname (không phải string length; không tính terminating null)." — phần 2.9.5

Vậy PATH\_MAX byte vừa bao gồm vừa không bao gồm terminating null!

Có yêu cầu diễn giải, câu trả lời (IEEE Std 1003.1-1988/INT, ấn bản 1992, diễn giải số 15, tr.36) rằng đây là bất nhất và cả hai đều có thể đúng (khá lạ vì vấn đề chính là cả hai không thể cùng đúng).

Vấn đề do thay đổi lúc dự thảo không truyền tới mọi chỗ có câu chữ đó. Quy trình chuẩn hóa hình thức, cứng nhắc, nên không sửa được đến khi nhóm bỏ phiếu phê duyệt cập nhật.

Lỗi này cũng có trong chuẩn C ở chú thích đầu tiên tham chiếu tài liệu Rationale đi kèm. Thực tế Rationale không còn đi kèm — bị xóa khi quyền sở hữu chuẩn chuyển sang ISO.

#### Mẹo thực hành hữu ích

![image](images/ch01/img01-05.png)

Khác biệt K\&R C và ANSI C

Yên tâm rằng biết K\&R C là đã biết 90% ANSI C. Khác biệt thuộc bốn nhóm lớn, liệt kê theo tầm quan trọng:

1\. Nhóm đầu gồm thứ mới, rất khác và quan trọng. Tính năng duy nhất là prototype — viết parameter type như phần function declaration. Prototype giúp compiler dễ kiểm tra cách dùng function với definition.

2\. Nhóm thứ hai là keyword mới. Chính thức thêm `enum` cho enumerated type (thấy đầu ở pcc bản muộn), `const`, `volatile`, `signed`, `void`, cùng semantics liên quan. Keyword never-used `entry`, dường như lọt vào C do sơ suất, đã nghỉ hưu.

3\. Nhóm thứ ba là "thay đổi thầm lặng" — tính năng vẫn compile nhưng nghĩa hơi khác. Có nhiều, phần lớn không quá quan trọng, bỏ qua đến khi đẩy giới hạn và thật sự vấp phải. Ví dụ, preprocessing rule chặt hơn, có rule mới nối các string literal liền nhau.

4\. Nhóm cuối là mọi thứ khác, gồm thứ tranh luận bất tận lúc chuẩn hóa nhưng gần như chắc không gặp thực tế, như token-pasting hoặc trigraph. (Trigraph dùng ba character biểu diễn một character máy quá thiếu thốn có thể không có trong character set. Như digraph `\t` biểu diễn "tab", trigraph `??<` biểu diễn "ngoặc nhọn mở".)

Tính năng mới quan trọng nhất là "prototype", lấy từ C++. Mở rộng function declaration để biết không chỉ tên, return type mà mọi parameter type, cho compiler kiểm tra nhất quán cách dùng và khai báo parameter. "Prototype" không mô tả rõ "function name cùng mọi argument"; gọi "function signature" hay "function specification" như Ada có nghĩa hơn.

#### Giáo điều software

![image](images/ch01/img01-02.png)

Quy tắc của prototype

Mục đích prototype là đưa thông tin parameter type (thay vì chỉ tên function, return value type) khi forward declaration. Compiler nhờ đó đối chiếu argument type trong function call với parameter được định nghĩa. Trong K\&R C, kiểm tra trì hoãn đến link time, hoặc thường bỏ hẳn. Thay vì

```
char * strcpy();
```

declaration trong header file nay như sau:

```
char * strcpy(char *dst, const char *src);
```

Cũng có thể bỏ parameter name, chỉ giữ type:

```
char * strcpy(char * , const char * );
```

Đừng bỏ parameter name. Dù compiler không kiểm tra, tên thường truyền thêm semantic information cho lập trình viên. Tương tự, function definition đổi từ

```
char * strcpy(dst, src)
     char *dst, *src;
{ ... }
```

thành

```
char * strcpy(char *dst, const char *src) /* note no
semi-colon! */
{ ... }
```

Thay vì kết thúc bằng dấu chấm phẩy, function header nay được theo ngay bởi một compound statement tạo function body.

Viết prototype cho mọi code mới, bảo đảm prototype trong scope ở mọi lời gọi. Đừng quay lại thêm prototype cho code K\&R cũ trừ khi tính đến default type promotion — thêm ở Chương 8.

Nhiều thuật ngữ cho cùng thứ hơi khó hiểu. Khá giống thuốc có ít nhất ba tên: chemical name, brand name của nhà sản xuất, street name.

## Đọc chuẩn ANSI C để vui, thích thú và thu lợi

Đôi khi cần tập trung đáng kể để đọc chuẩn ANSI C và lấy câu trả lời. Kỹ sư bán hàng gửi đoạn code sau cho nhóm compiler Sun làm test case.

```
1 foo(const char **p) { }
2
3 main(int argc, char **argv)
4{
5 foo(argv);
6}
```

Nếu thử compile, thấy compiler cảnh báo:

```
line 5: warning: argument is incompatible with prototype
```

Người gửi muốn biết vì sao có cảnh báo và phần nào chuẩn ANSI C bắt buộc. Suy luận của anh là argument `char *s` khớp parameter `const char *p`

Điều này thấy ở mọi library string function.

Vậy argument `char **argv` không khớp parameter `const char **p` sao?

Câu trả lời không, không khớp. Mất chút thời gian trả lời; xem quy trình tìm câu trả lời có tính giáo dục theo nhiều nghĩa. Phân tích do một "luật sư ngôn ngữ" của Sun <sup>\[6\]</sup> làm, như sau:

<sup>\[6\]</sup> The New Hacker's Dictionary định nghĩa language lawyer là "người chỉ cho bạn năm câu rải rác trong manual 200-plus-page, kết hợp ngụ ý câu trả lời cho câu hỏi 'giá như bạn nghĩ đến tìm ở đó.'" Đúng! Chính xác điều xảy ra ở đây.

Phần Constraints của Mục 6.3.2.2 chuẩn ANSI C có câu:

Mỗi argument phải có type sao cho giá trị của nó gán được cho object có phiên bản không qualifier của type parameter tương ứng.

Nghĩa là truyền argument phải có hành vi như assignment.

Vì vậy phải tạo diagnostic message trừ khi object type `const char **` gán được giá trị type `char **.` Để biết assignment hợp lệ không, xem simple assignment, Mục 6.3.16.1, có constraint:

Một trong các điều sau phải đúng:…

- Cả hai operand là pointer tới phiên bản có hay không qualifier của compatible type; type mà bên trái trỏ tới có mọi qualifier của type bên phải trỏ tới.

Chính điều kiện này làm lời gọi có argument `char *` tương ứng parameter `const char *` hợp lệ (như mọi string routine trong C library). Hợp lệ vì trong code

```
char * cp;
const char *ccp;
ccp = cp;
```

- Operand trái là pointer tới "char có qualifier const".

- Operand phải là pointer tới "char" không qualifier.

- Type `char` tương thích với `char`; type operand trái trỏ tới có mọi qualifier của type bên phải trỏ tới (không có), cộng qualifier riêng (const).

Lưu ý không thể assignment ngược lại. Thử nếu không tin.

```
cp = ccp; /* results in a compilation warning */
```

Mục 6.3.16.1 có làm lời gọi argument `char **` tương ứng parameter `const char **` hợp lệ không? Không.

Phần Examples của Mục 6.1.2.5 nêu:

Type "const float \*" không phải qualified type — type là "pointer tới float const-qualified", một pointer tới qualified type.

Tương tự, `const char **` chỉ pointer tới unqualified type. Type là pointer tới pointer tới qualified type.

Vì type `char **` và `const char **` đều là pointer tới unqualified type không cùng type, chúng không compatible. Vì vậy, không cho lời gọi argument type `char **` tương ứng parameter type `const char **`. Do đó constraint Mục 6.3.2.2 bị vi phạm, phải tạo diagnostic message.

Đây là điểm tinh tế khó nắm. Cách khác là lưu ý:

- Operand trái có type FOO2 — pointer tới FOO, trong đó FOO là unqualified pointer tới character có qualifier const, và

- Operand phải có type BAZ2 — pointer tới BAZ, trong đó BAZ là unqualified pointer tới character không qualifier.

FOO và BAZ compatible, nhưng FOO2 và BAZ2 khác nhau ngoài qualifica-tion của thứ được trỏ trực tiếp, nên không compatible; vì vậy operand trái, phải là unqualified pointer tới type không compatible. Tính compatible của pointer type không bắc cầu. Vì vậy assignment hay function call không được phép. Nhưng lưu ý hạn chế chủ yếu gây bực, rối người dùng. Assignment hiện được cho trong C++ translator dựa cfront (dù có thể đổi).

### Mẹo thực hành hữu ích

![image](images/ch01/img01-05.png)

Const không phải constant

Keyword `const` không biến variable thành constant! Symbol có qualifier `const` chỉ nghĩa không dùng symbol đó để assignment. Điều này làm giá trị chỉ đọc qua symbol đó; không ngăn giá trị bị sửa bằng cách khác bên trong (thậm chí bên ngoài) chương trình. Nó gần như chỉ hữu ích khi qualify pointer parameter, chỉ function này không đổi data argument trỏ tới nhưng function khác có thể. Có lẽ đây là cách dùng `const` phổ biến nhất trong C, C++. Có thể dùng `const` cho data như:

```
const int limit = 10;
```

và hoạt động phần nào như ngôn ngữ khác. Thêm pointer vào thì mọi thứ hơi gai góc:

```
const int * limitp = &limit;
int i=27;
limitp = &i;
```

Nghĩa là `limitp` là pointer tới constant integer. Không dùng pointer đổi integer được; nhưng bản thân pointer nhận giá trị khác bất kỳ lúc nào. Nó sẽ trỏ vị trí khác, dereference cho giá trị khác!

Kết hợp `const` với `*` thường chỉ để mô phỏng call-by-value cho array parameter. Nó nói "tôi đưa pointer tới thứ này, nhưng bạn không được đổi". Idiom giống cách dùng thường nhất của `void *`. Dù lý thuyết dùng trong vô số hoàn cảnh, thường chỉ giới hạn chuyển pointer từ type này sang type khác.

Tương tự, có thể lấy địa chỉ constant variable và, thôi, có lẽ tôi đừng gợi ý vào đầu mọi người. Như Ken Thompson nói, "keyword `const` chỉ làm rối library interface với hy vọng bắt vài lỗi hiếm". Nhìn lại, keyword `const` đặt tên `readonly` tốt hơn.

Đúng là cả vùng này trong chuẩn có vẻ dịch sang Anh từ Urdu qua Đan Mạch bởi người chỉ hơi biết các ngôn ngữ đó; nhưng ủy ban đang vui đến mức đáng tiếc phá vui bằng đòi rule đơn giản, rõ hơn.

Chúng tôi nghĩ sau này nhiều người sẽ hỏi, không phải ai cũng muốn theo suy luận trên. Vì vậy sửa compiler Sun ANSI C in thêm thông tin về thứ không compatible. Thông báo đầy đủ nay là:

```
Line 6: warning: argument #1 is incompatible with prototype:
  prototype: pointer to pointer to const char : "barf.c", line
1
  argument : pointer to pointer to char
```

Dù không hiểu vì sao, lập trình viên nay biết thứ gì không compatible.

## "Thay đổi thầm lặng" thầm lặng đến đâu?

Không phải mọi thay đổi chuẩn nổi bật như prototype. ANSI C đổi một số thứ khác, thường để ngôn ngữ tin cậy hơn. Ví dụ "usual arithmetic conversions" thay đổi giữa K\&R C cổ xưa ban đầu và ANSI C. Vì vậy, nơi Kernighan, Ritchie nói đại ý:

Mục 6.6 Arithmetic Conversions

Rất nhiều operator gây conversion và tạo result type tương tự. Mẫu này gọi "usual arithmetic conversions".

Đầu tiên, operand type char hay short chuyển thành int, type float chuyển double. Sau đó nếu một operand double, operand kia chuyển double, đó là result type. Nếu không, nếu một operand long, operand kia chuyển long, đó là result type. Nếu không, nếu một operand unsigned, operand kia chuyển unsigned, đó là result type. Nếu không, cả hai phải int và result type là int.

Manual ANSI C bịt lỗ hổng bằng viết lại:

Mục 6.2.1.1 Character và integer (integral promotion)

Char, short int, int bit-field, hoặc biến thể signed, unsigned, hoặc enumeration type, có thể dùng trong expression ở bất cứ nơi nào dùng được int hay unsigned int. Nếu int biểu diễn mọi giá trị type gốc, giá trị chuyển int; nếu không, chuyển unsigned int. Đó là integral promotion.

Mục 6.2.1.5 Usual Arithmetic Conversions

Nhiều binary operator đòi operand arithmetic type gây conversion, cho result type tương tự. Mục đích tạo common type, cũng là result type. Mẫu này gọi "usual arithmetic conversions".

Đầu tiên, nếu một operand long double, operand kia chuyển long double. Nếu không, nếu một operand double, operand kia chuyển double. Nếu không, nếu một operand float, operand kia chuyển float. Nếu không, integral promotion \[xem mục 6.2.1.1 về integral promotion\] thực hiện trên cả hai. Rồi áp dụng rule sau.

Nếu một operand unsigned long int, operand kia chuyển unsigned long int. Nếu không, nếu một operand long int và operand kia unsigned int, nếu long int biểu diễn mọi giá trị unsigned int thì operand unsigned int chuyển long int; nếu long int không biểu diễn mọi giá trị unsigned int, cả hai chuyển unsigned long int. Nếu không, nếu một operand long int, operand kia chuyển long int. Nếu không, nếu một operand unsigned int, operand kia chuyển unsigned int. Nếu không, cả hai operand int.

Giá trị floating operand và kết quả floating expression có thể được biểu diễn với precision, range lớn hơn type yêu cầu; type không vì vậy thay đổi.

Diễn giải thông thường (đầy lỗ hổng, thiếu chính xác), bản ANSI C nghĩa đại loại:

Operand khác type được chuyển khi làm số học. Mọi thứ chuyển sang type operand "thực" nhất, dài nhất, signed nếu không mất bit. Cách unsigned preserving (K\&R C) nói khi unsigned type trộn int hay signed type nhỏ hơn, kết quả là unsigned. Rule đơn giản, độc lập hardware nhưng như ví dụ dưới, đôi khi buộc kết quả âm mất dấu!

Cách value preserving (ANSI C) nói khi trộn integral operand type như vậy, result type signed hay unsigned tùy kích thước tương đối của operand type.

Đoạn chương trình sau in thông báo khác giữa compiler ANSI và pre-ANSI:

```
main() {
  if ( -1 < (unsigned char) 1 )
      printf("-1 is less than (unsigned char) 1: ANSI
semantics ");
  else
      printf("-1 NOT less than (unsigned char) 1: K&R
semantics ");
}
```

Tùy compile K\&R hay ANSI C, expression được đánh giá khác. Cùng bitpattern được so nhưng diễn giải thành số âm hoặc số unsigned, do đó dương.

### Giáo điều software

![image](images/ch01/img01-02.png)

Lỗi tinh vi

Dù rule đổi, lỗi tinh vi vẫn có thể và thực sự xảy ra. Trong ví dụ, variable d nhỏ hơn index cần một đơn vị, nên code xử lý. Nhưng if statement không true. Vì sao, lỗi gì?

```
int array[] = { 23, 34, 12, 17, 204, 99, 16 };
#define TOTAL_ELEMENTS (sizeof(array) /
sizeof(array[0]))

main()
{
    int d= -1, x;
    /* ... */

    if (d <= TOTAL_ELEMENTS-2)
        x = array[d+1];
    /* ... */
}
```

Variable định nghĩa `TOTAL_ELEMENTS` có type unsigned int (vì return type sizeof là "unsigned"). Phép kiểm so signed int với unsigned int. Vì vậy d được promote thành unsigned int. Diễn giải -1 thành unsigned int cho số dương lớn, khiến clause false. Lỗi có trong ANSI C, và K\&R C nếu `sizeof()` trả unsigned trong implementation đó. Sửa bằng đặt int cast ngay trước `TOTAL_ELEMENTS`:

```
if (d <= (int) TOTAL_ELEMENTS - 2)
```

#### Mẹo thực hành hữu ích

![image](images/ch01/img01-05.png)

Lời khuyên về unsigned type

Tránh phức tạp không cần bằng giảm dùng unsigned type. Cụ thể, đừng dùng unsigned biểu diễn đại lượng chỉ vì không bao giờ âm (như "age", "national\_debt").

Dùng signed type như `int` sẽ khỏi lo boundary case trong rule chi tiết promote mixed type.

Chỉ dùng unsigned cho bitfield hoặc binary mask. Dùng cast trong expression để mọi operand signed hoặc unsigned, tránh compiler phải chọn result type.

Nếu thấy hơi khó hay bất ngờ thì đúng vậy! Hãy làm qua ví dụ bằng rule trang trước.

Cuối cùng, để code không xuất hiện như ví dụ xấu trong ấn bản tương lai The Elements of Programming Style <sup>\[7\]</sup>, nên giải thích đã dùng

<sup>\[7\]</sup> The Elements of Programming Style, Kernighan (đúng, chính Kernighan đó), Plauger, New York, McGraw-Hill, 1978. Đọc cực hay, cốt truyện đáng tin, sách nhỏ tuyệt — mua, đọc, sống theo!

```
#define TOTAL_ELEMENTS (sizeof(array) / sizeof(array[0]))
```

thay vì

```
#define TOTAL_ELEMENTS (sizeof(array) / sizeof(int))
```

vì cách đầu cho base type array đổi (ví dụ `int` sang `char`) không cần đổi cả `#define`.

Nhóm compiler Sun ANSI C thấy chuyển "unsigned preserving" sang "value preserving" là thay đổi semantics C hoàn toàn không cần, gây bất ngờ, thất vọng cho ai gặp đột ngột. Vì "nguyên tắc ít bất ngờ nhất", compiler Sun nhận, compile tính năng ANSI C trừ khi tính năng cho kết quả khác K\&R C. Khi đó, compiler cảnh báo và mặc định dùng diễn giải K\&R. Trong tình huống trên, lập trình viên nên cast để nói result type cuối mong muốn. Semantics ANSI nghiêm ngặt có trên workstation Sun chạy Solaris 2.x bằng tùy chọn compiler `-Xc`.

Có nhiều cập nhật K\&R C khác trong ANSI C, gồm vài so-called "thay đổi thầm lặng" nơi code compile cả hai nhưng nghĩa khác. Theo phản ứng thường thấy lúc phát hiện, nên gọi "thay đổi thật sự rất ồn ào". Nhìn chung ủy ban ANSI cố đổi ngôn ngữ ít nhất, phù hợp sửa thứ rõ ràng cần cải thiện.

Nhưng đủ nền tảng cây gia phả ANSI C rồi. Sau chút giải trí phần sau, chuyển chương tiếp, bắt đầu code!

## Giải trí nhẹ nhàng — Tác động Implementation-Defined của pragma . . .

Free Software Foundation là tổ chức độc đáo do hacker xuất sắc MIT Richard Stallman lập. Nhân tiện, chúng tôi dùng "hacker" theo nghĩa tốt cũ "lập trình viên tài năng"; truyền thông làm xấu thuật ngữ, nên người ngoài hiểu "thiên tài độc ác". Như tính từ bad, "hacker" nay có hai nghĩa trái nhau, phải suy từ ngữ cảnh.

Free Software Foundation của Stallman lập trên triết lý software phải miễn phí, tự do có cho mọi người. Tôn chỉ FSF là "loại bỏ hạn chế sao chép, phân phối lại, hiểu và sửa computer program", tham vọng tạo triển khai UNIX public-domain tên GNU (viết tắt "GNU's Not UNIX". Đúng thật.)

Nhiều nghiên cứu sinh computer science và người khác đồng ý GNU, làm sản phẩm software FSF đóng gói, phân phối miễn phí. Nguồn lao động giỏi hiến tài năng tạo một số software tốt. Sản phẩm tốt nhất có họ compiler GNU C. gcc là optimizing compiler mạnh, vững, có cho nhiều hardware platform, đôi khi tốt hơn compiler nhà sản xuất. Dùng gcc không phù hợp mọi dự án; có vấn đề bảo trì, tính liên tục sản phẩm tương lai. Cần công cụ ngoài compiler, và GNU debugger từng không làm việc được shared library rất lâu. GNU C đôi lúc cũng hơi, nói sao nhỉ, bốc đồng trong phát triển.

Khi chuẩn ANSI C đang phát triển, directive `pragma` được đưa vào. Mượn từ Ada, `#pragma` truyền gợi ý cho compiler như muốn mở rộng function in-line hoặc bỏ range check. Chưa thấy trước trong C, `pragma` gặp phản đối ban đầu từ người triển khai gcc, hiểu tác động "implementation-defined" theo nghĩa rất đen — trong gcc phiên bản 1.34, pragma khiến compiler dừng compile và mở computer game! Manual gcc chứa nội dung: Lệnh "#pragma" được chuẩn ANSI quy định có tác động implementation-defined tùy ý. Trong GNU C preprocessor, "#pragma" đầu tiên thử chạy game "rogue"; thất bại thì thử "hack"; thất bại nữa thì thử GNU Emacs hiển thị Tower of Hanoi; nếu thất bại, báo fatal error. Mọi trường hợp đều không tiếp tục preprocessing.

—Manual phiên bản 1.34 của GNU C compiler

Source code tương ứng trong phần preprocessor compiler là:

```
/*
 * the behavior of the #pragma directive is implementation
defined.
 * this implementation defines it as follows.
 */
do_pragma ()
{
 close (0);
 if (open ("/dev/tty", O_RDONLY, 0666) != 0)
                      goto nope;
 close (1);
 if (open ("/dev/tty", O_WRONLY, 0666) != 1)
                      goto nope;
 execl ("/usr/games/hack", "#pragma", 0);
 execl ("/usr/games/rogue", "#pragma", 0);
 execl ("/usr/new/emacs", "-f", "hanoi", "9", "-kill", 0);
 execl ("/usr/local/emacs", "-f", "hanoi", "9", "-kill", 0);
nope:
 fatal ("You are in a maze of twisty compiler features, all
different");
}
```

Đặc biệt hài là mô tả user manual sai: code cho thấy thử "hack" trước "rogue".
