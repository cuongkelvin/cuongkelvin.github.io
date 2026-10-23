# Chương 8. Vì sao lập trình viên không phân biệt được Halloween với ngày Giáng sinh

Bạn đã chán tốc độ chậm chạp của workstation? Bạn có muốn chương trình chạy nhanh gấp đôi không?

Đây là cách thực hiện trên UNIX. Chỉ cần làm theo ba bước đơn giản:

1\. Thiết kế và viết code cho UNIX vm kernel high-performance. Cẩn thận! Thuật toán của bạn phải chạy nhanh gấp đôi thuật toán hiện tại thì mới đạt đầy đủ mức speed-up 100%.

2\. Đặt code trong file có tên `/kernel/unix.c`

3\. Thực hiện lệnh

`4.`

```
cc -O4 -o /kernel/unix /kernel/unix.c
```

rồi reboot máy.

Chỉ đơn giản vậy thôi. Và hãy nhớ, Beethoven viết bản giao hưởng đầu tiên bằng C.

—Sách mẹo tuning và bài hát bóng bầu dục của A.P.L. Byteswap

hệ đo lường Potrzebie… tạo glyph từ bit pattern… thay đổi type ngay trong lúc bạn đợi… nỗi đau prototype… đọc ký tự mà không cần newline… triển khai finite state machine trong C… lập trình trường hợp đơn giản trước… cách cast và lý do cast… giải trí nhẹ nhàng — cuộc thi code C khó hiểu quốc tế

## Hệ đo lường Potrzebie

Dĩ nhiên, khi Picasso nhận xét máy tính chẳng thú vị, chúng ta biết ông thật ra muốn thúc đẩy cuộc đối thoại trong đó nghệ sĩ có vai trò thách thức trật tự sẵn có, đặt câu hỏi, hoặc ít nhất bảo đảm mỗi đơn hàng có đúng khẩu phần khoai tây chiên. Vì thế, thật thích hợp khi chương này mở đầu bằng câu hỏi lâu đời trong giới máy tính: vì sao lập trình viên không phân biệt được Halloween với ngày Giáng sinh? Trước khi bật mí câu chốt, ta nên nói đôi lời về công trình của nhà khoa học máy tính world-class Donald Knuth. Giáo sư Knuth, người đã giảng dạy nhiều năm tại Đại học Stanford, viết bộ tài liệu tham khảo đồ sộ và có tính chuẩn mực The Art of Computer Programming <sup>\[1\]</sup> và thiết kế hệ thống dàn trang TeX.

<sup>\[1\]</sup> Sau này, Giáo sư Knuth xác định người đồng nghiệp long-standing Art Evans chính là “Art” trong nhan đề The Art of Computer Programming. Năm 1967, khi các tập sách bắt đầu xuất bản, Knuth trình bày một semi-nar ở Carnegie Tech. Ông nói rất vui khi thấy người bạn cũ Art Evans trong khán giả vì đã lấy tên ông đặt cho bộ sách. Mọi người rên lên thích thú khi hiểu được lối chơi chữ khủng khiếp ấy, còn Art là người ngạc nhiên nhất.

Sau đó, khi giành giải Turing của ACM, Knuth bảo đảm lối chơi chữ được ghi vào hồ sơ chính thức bằng cách nhắc lại Art trong bài diễn thuyết nhận giải. Bạn có thể đọc trong Communications of the ACM, tập 17, số 12, trang 668. Art khẳng định rằng “nó hầu như chẳng ảnh hưởng gì tới cuộc đời tôi”.

Một sự thật little-known là công bố đầu tiên của Giáo sư Knuth không nằm trong tạp chí khoa học peer-reviewed danh tiếng mà trong một tờ báo phổ biến hơn nhiều. “The Potrzebie System of Weights and Measures” của Donald Knuth xuất hiện trong MAD Magazine số 33, tháng 6 năm 1957. Bài viết, do chính Donald Knuth sau này trở thành nhà khoa học máy tính lỗi lạc viết, chế giễu hệ đo lường mét then-novel. Phần lớn bài viết sau này của Knuth có xu hướng thông thường hơn. Chúng tôi cho rằng thật đáng tiếc và mong ông trở về cội nguồn. Nền tảng của mọi phép đo trong hệ Potrzebie là độ dày của MAD Magazine số 26.

Bài của Knuth áp dụng nhất quán các tiền tố metric-decaded, sử dụng những đơn vị quen thuộc hơn với độc giả MAD như potrzebies, whatmeworrys và axolotls. Với nhiều độc giả, đó là lời giới thiệu nhẹ nhàng về các khái niệm của hệ mét. Người Mỹ khi ấy chưa quen kilo, centi và các tiền tố khác, nên Potrzebie của Knuth mở đường cho sự hiểu biết rộng hơn. Nếu hệ Potrzebie thực sự được chấp nhận, có lẽ thử nghiệm áp dụng hệ mét sau này của Mỹ đã thành công hơn.

Giống hệ Potrzebie, câu đùa về việc lập trình viên lẫn lộn Halloween với Giáng sinh dựa trên kiến thức nội bộ về hệ đếm. Họ không phân biệt được hai ngày vì 31 trong octal, cơ số tám, bằng 25 trong decimal, cơ số mười. Nói gọn: OCT 31 bằng DEC 25! Khi tôi viết xin phép Giáo sư Knuth kể câu chuyện và gửi kèm bản thảo chương, ông không chỉ đồng ý mà còn đánh dấu nhiều chỉnh sửa hiệu đính, đồng thời chỉ ra rằng lập trình viên cũng không phân biệt được NOV 27 với hai ngày kia.

Chương này trình bày một số thành ngữ C cũng dựa vào kiến thức nội bộ về lập trình. Có ví dụ là mẹo hữu ích đáng thử, có ví dụ là câu chuyện cau-tionary về những điểm rắc rối nên tránh. Ta bắt đầu bằng một cách thú vị để icon trở nên self-documenting.

## Tạo glyph từ bit pattern

Icon, hay glyph, là hình đồ họa nhỏ dành cho màn hình bit-mapped. Mỗi pixel trong hình được biểu diễn bằng một bit. Nếu bit được set, pixel “bật”; nếu bit được clear, pixel “tắt”. Vì vậy, một dãy giá trị integer mã hóa hình ảnh. Công cụ như Iconedit dùng để vẽ hình và xuất ra file ASCII chứa integer có thể include vào chương trình cửa sổ. Một vấn đề là trong chương trình, icon chỉ hiện như một đống số hex. Glyph đen trắng 16-by-16 điển hình có thể trông như sau trong C:

```
static unsigned short stopwatch[] = {
    0x07C6,
    0x1FF7,
    0x383B,
    0x600C,
    0x600C,
    0xC006,
    0xC006,
    0xDF06,
    0xC106,
    0xC106,
    0x610C,
    0x610C,
    0x3838,
    0x1FF0,
    0x07C0,
    0x0000
};
```

Như bạn thấy, các literal C không cho biết hình ảnh thực sự trông ra sao. Sau đây là một bộ #define thanh nhã đến kinh ngạc, cho phép lập trình viên xây dựng literal sao cho chúng giống glyph trên màn hình.

```
#define X )*2+1
#define _ )*2
#define s ((((((((((((((((0 /* For building glyphs 16 bits
wide */
```

Chúng cho phép tạo hex pattern cho icon, glyph, v.v. bằng cách vẽ hình bạn muốn! Còn gì tốt hơn để chương trình trở nên self-documenting? Với các define này, ví dụ trở thành:

```
static unsigned short stopwatch[] =
{
    s _ _ _ _ _ X X X X X _ _ _ X X _ ,
    s _ _ _ X X X X X X X X X _ X X X ,
    s _ _ X X X _ _ _ _ _ X X X _ X X ,
    s _ X X _ _ _ _ _ _ _ _ _ X X _ _ ,
    s _ X X _ _ _ _ _ _ _ _ _ X X _ _ ,
    s X X _ _ _ _ _ _ _ _ _ _ _ X X _ ,
    s X X _ _ _ _ _ _ _ _ _ _ _ X X _ ,
    s X X _ X X X X X _ _ _ _ _ X X _ ,
    s X X _ _ _ _ _ X _ _ _ _ _ X X _ ,
    s X X _ _ _ _ _ X _ _ _ _ _ X X _ ,
    s _ X X _ _ _ _ X _ _ _ _ X X _ _ ,
    s _ X X _ _ _ _ X _ _ _ _ X X _ _ ,
    s _ _ X X X _ _ _ _ _ X X X _ _ _ ,
    s _ _ _ X X X X X X X X X _ _ _ _ ,
    s _ _ _ _ _ X X X X X _ _ _ _ _ _ ,
    s _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
};
```

rõ ràng có ý nghĩa hơn nhiều so với các giá trị literal tương đương. C tiêu chuẩn có constant octal, decimal và hexadecimal, nhưng không có constant binary; nếu có thì đó sẽ là cách đơn giản hơn để diễn tả pattern.

Nếu giữ sách ở đúng góc và nheo mắt nhìn trang giấy, có thể bạn sẽ đoán được đây là glyph đồng hồ bấm giờ nhỏ biểu thị “cursor busy” trong các hệ thống cửa sổ phổ biến. Chúng tôi lấy mẹo này từ newsgroup Usenet comp.lang.c vài năm trước.

Đừng quên undefine macro sau các hình: bạn không muốn chúng bí ẩn can thiệp vào code phía sau đâu.

## Thay đổi type ngay trong lúc bạn đợi

Ở Chương 1, ta đã thấy các type conversion xảy ra khi operator nhận operand khác type. Chúng được gọi là “usual arithmetic conversions”, chi phối việc chuyển hai type khác nhau sang một type chung, thường cũng là type của kết quả.

Type conversion trong C phổ biến hơn nhiều so với mọi người thường nhận ra. Chúng còn có thể xảy ra trong bất kỳ expression nào có type nhỏ hơn `int` hoặc `double`. Hãy lấy code sau làm ví dụ:

```
printf(" %d ", sizeof 'A' );
```

Code in kích thước type chứa character literal. Chắc hẳn đó là kích thước một character, tức “1”? Hãy chạy thử. Bạn sẽ thấy thực tế nhận “4”, hoặc kích thước `int` trên hệ thống của bạn. Character literal có type `int`, đạt được bằng cách tuân theo quy tắc promotion từ type `char`. Điều này được đề cập quá ngắn trong K\&R 1, trang 39: Mọi char trong expression được chuyển thành `int`.… Lưu ý mọi `float` trong expression được chuyển thành `double`.… Vì function argument là expression, type conversion cũng xảy ra khi truyền argument cho function; cụ thể, `char` và `short` trở thành `int`, `float` trở thành `double`.

—The C Programming Language, ấn bản đầu

Tính năng này gọi là type promotion. Khi xảy ra với integer type, nó được gọi là “integral promotion”. Khái niệm type promotion tự động được giữ lại trong ANSI C, dù có nới nhẹ ở vài chỗ. Chuẩn ANSI C nói như sau:

Khi thực thi đoạn

```
char c1, c2;
/* ... */
c1 = c1 + c2;
```

“integral promotions” yêu cầu abstract machine nâng giá trị từng biến lên kích thước `int`, sau đó cộng hai `int` rồi cắt bớt tổng. Miễn là phép cộng hai `char` không gây overflow exception, thực thi thực tế chỉ cần tạo cùng kết quả và có thể bỏ các bước promotion.

Tương tự, trong đoạn

```
float f1, f2;
double d;
/* ... */
f1=f2*d;
```

phép nhân có thể dùng arithmetic single-precision nếu implementation xác định được kết quả giống khi dùng arithmetic double-precision, chẳng hạn khi thay `d` bằng constant `2.0` có type `double`.

—Chuẩn ANSI C, Mục 5.1.2.3

Bảng 8-1 liệt kê mọi type promotion thông thường. Chúng xảy ra trong mọi expression, không chỉ expression có operator và operand mixed-type.

Bảng 8-1. Type promotion trong C

| Type ban đầu | Thường được nâng thành |
|---|---|
| `char` | `int` |
| `bit-field` | `int` |
| `enum` | `int` |
| `unsigned char` | `int` |
| `short` | `int` |
| `unsigned short` | `int` |
| `float` | `double` |
| `array` của type bất kỳ | `pointer` tới type đó |

Integral promotion gồm: `char, short` `int`, các type bit-field và phiên bản signed hoặc unsigned của chúng, cùng enumeration type, được nâng thành `int` nếu có thể biểu diễn bằng type ấy. Nếu không, chúng được nâng thành `unsigned int`. ANSI C nói không bắt buộc thực hiện promotion nếu compiler bảo đảm cùng kết quả khi bỏ nó; điều này thường có nghĩa operand là literal.

### Giáo điều software

![image](images/ch08/img08-01.png)

Chú ý! Điểm thật sự quan trọng — argument cũng được promotion!

Một nơi khác xảy ra implicit type conversion là truyền argument. Trong K\&R C, vì function argument là expression, type promotion cũng diễn ra ở đây. Trong ANSI C, argument không được promotion nếu có prototype; nếu không có thì được promotion. Argument đã mở rộng được cắt lại về kích thước khai báo trong function được gọi.

Đó là lý do một format string `printf()` duy nhất, `"%d"`, dùng được cho mọi type `short`, `char` hoặc `int`. Dù bạn truyền type nào trong số ấy, thực tế một `int` được đặt lên stack, vào register hoặc nơi tương tự, để `printf` <sup>\[1\]</sup> hay bất kỳ callee nào xử lý thống nhất. Bạn có thể thấy điều này khi dùng printf in type dài hơn `int`, như `long long` trên máy Sun. Nếu không dùng format specifier long long `%lld,`, bạn sẽ không nhận giá trị đúng. Nguyên nhân là khi thiếu thông tin thêm, printf giả định nó xử lý `int`.

<sup>\[1\]</sup> Ngay cả khi prototype của `printf()` đang trong scope, hãy lưu ý prototype kết thúc bằng ellipsis:

```
int printf(const char *format, ...);
```

Điều đó có nghĩa đây là function nhận số argument thay đổi. Không có thông tin về parameter ngoài parameter đầu tiên, và argument promotion thông thường luôn diễn ra.

Type conversion trong C phổ biến hơn rất nhiều so với ngôn ngữ khác, vốn thường chỉ chuyển đổi để operand khác type khớp nhau. C cũng làm vậy, nhưng còn nâng cả các type đã khớp nhau nếu nhỏ hơn dạng canonical `int` hoặc `double`. Có ba điểm quan trọng cần lưu ý về implicit type conversion:

- Đây là một giải pháp chắp vá trong ngôn ngữ, có từ mong muốn đơn giản hóa những compiler đầu tiên. Chuyển mọi operand về kích thước thống nhất đơn giản hóa đáng kể code generation. Mọi parameter được đẩy lên stack đều dài bằng nhau, nên runtime system chỉ cần biết số lượng parameter chứ không cần kích thước. Thực hiện mọi phép tính floating-point ở double precision cho phép PDP-11 cứ đặt ở chế độ “double” rồi làm việc, không phải theo dõi precision.

- Bạn có thể lập trình C rất nhiều mà chẳng bao giờ nhận ra default type promotion. Và nhiều lập trình viên C quả thực như vậy.

- Bạn không thể tự gọi mình là chuyên gia C nếu chưa biết những điều này. Chúng đặc biệt quan trọng trong bối cảnh prototype, được mô tả ở phần tiếp theo.

## Đau prototype

Mục đích của function prototype ANSI C là làm C đáng tin cậy hơn. Prototype nhằm giảm một loại lỗi phổ biến và hard-to-find: type của formal parameter không khớp actual parameter.

Điều đó được thực hiện bằng dạng function declaration mới có chứa parameter declaration. Function definition cũng được thay đổi tương ứng để khớp declaration. Nhờ vậy compiler kiểm tra cách sử dụng so với declaration. Để nhắc lại, Bảng 8-2 trình bày dạng declaration và definition cũ, mới.

Bảng 8-2. So sánh function declaration K\&R C với prototype ANSI C

| K\&R C | ANSI C |
|---|---|
| Declaration: <br> `int foo();` | Prototype: <br> `int foo(int a, int b);` <br> hoặc <br> `int foo(int, int );` |
| Definition: <br> `int foo(a,b) int a; int b; { ... }` | Definition: <br> `int foo(int a, int b) { ... }` |

Lưu ý function declaration K\&R khác function declaration, tức prototype, ANSI C; function definition K\&R cũng khác function definition ANSI C. Trong ANSI C, “không parameter” được biểu diễn bằng `int foo(void);`, nên ngay trường hợp này cũng khác C cổ điển.

Tuy nhiên, ANSI C không và không thể bắt buộc chỉ sử dụng prototype, vì điều đó sẽ phá hủy tính tương thích hướng lên của hàng tỷ dòng code pre-ANSI sẵn có. Chuẩn quy định rõ việc dùng function declarator với ngoặc rỗng, tức không chỉ định argument type, chính thức bị coi là sắp lỗi thời và có thể không còn được hỗ trợ trong các phiên bản chuẩn tương lai. Trong tương lai có thể thấy trước, hai kiểu sẽ cùng tồn tại vì lượng code pre-ANSI rất lớn. Vậy nếu prototype là “điều tốt”, liệu ta nên dùng khắp nơi và quay lại bổ sung prototype cho code cũ khi bảo trì không? Dứt khoát không!

Function prototype không chỉ thay đổi syntax; nó còn đưa vào semantics một khác biệt tinh tế và có thể xem là không mong muốn. Như phần trước đã nói, trong K\&R, nếu truyền thứ nhỏ hơn int cho function, function thực tế nhận int; float được mở rộng thành double. Trong thân function được gọi, các giá trị tự động bị cắt lại về type hẹp tương ứng nếu được khai báo như thế.

Đến đây bạn có thể tự hỏi: sao phải mở rộng rồi lại thu hẹp? Ban đầu người ta làm vậy để đơn giản hóa compiler: mọi thứ có kích thước tiêu chuẩn. Chỉ có vài type đặc biệt giúp đơn giản hóa truyền argument, nhất là trong K\&R C rất cũ, nơi không thể truyền struct làm argument. Chính xác có ba type: int, double và pointer. Mọi argument trở thành kích thước tiêu chuẩn, rồi callee thu hẹp nếu cần.

Ngược lại, khi dùng function prototype, default argument promotion không diễn ra. Nếu prototype ghi một thứ là `char`, thực tế `char` được truyền. Nếu dùng function definition new-style, trong đó argument type nằm trong ngoặc sau tên function, compiler sinh code với giả định parameter đúng như khai báo, không có mở rộng type mặc định.

### Những chỗ prototype không còn hoạt động đúng

Có bốn trường hợp cần xem xét:

1\. Function declaration K\&R và function definition K\&R

Lời gọi hoạt động đúng; type đã promotion được truyền.

2\. Declaration (prototype) ANSI C và definition ANSI C

Lời gọi hoạt động đúng; type thực tế được truyền.

3\. Declaration (prototype) ANSI C và function definition K\&R

![](images/ch08/img08-02.png)![](images/ch08/img08-02.png)

Thất bại nếu dùng type hẹp! Lời gọi truyền type thực tế, nhưng function chờ type đã promotion.

4\. 4\. Function declaration K\&R và definition ANSI C

![](images/ch08/img08-02.png)![](images/ch08/img08-02.png)

Thất bại nếu dùng type hẹp! Lời gọi truyền type đã promotion, nhưng function chờ type thực tế.

Vì vậy, nếu thêm prototype cho definition K\&R C có `short`, prototype sẽ khiến `short` được truyền, nhưng definition chờ `int`, nên nó lấy cả data rác tình cờ nằm cạnh parameter. Bạn có thể ép trường hợp 3 và 4 hoạt động bằng cách viết prototype sử dụng type đã mở rộng. Điều này giảm portability và gây bối rối cho người bảo trì. Các ví dụ dưới minh họa hai trường hợp thất bại.

file 1

```
/* old style definition, but has prototype */
olddef (d,i)
 float d;
 char i;
{
 printf("olddef: float= %f, char =%x \n", d, i);
}
/* new style definition, but no prototype */
newdef (float d, char i)
{
 printf("newdef: float= %f, char =%x \n", d, i);
}
```

file 2:

```
/* old style definition, but has prototype */
int olddef (float d, char i);

main() {
 float d=10.0;
 char j=3;

 olddef(d, j);

/* new style definition, but no prototype */
 newdef (d, j);
}
```

Output mong đợi:

```
olddef: float= 10.0, char =3
newdef: float= 10.0, char =3
```

Output thực tế:

```
olddef: float= 524288.000000, char =4
newdef: float= 2.562500, char =0
```

Lưu ý rằng nếu đặt các function trong cùng file nơi gọi chúng, ở đây là file 2, hành vi sẽ thay đổi. Compiler phát hiện `olddef()` không khớp vì thấy đồng thời prototype và definition K\&R. Nếu đặt definition của `newdef()` trước lời gọi, compiler âm thầm làm đúng vì definition đóng vai prototype, tạo sự nhất quán. Nếu đặt definition sau lời gọi, compiler nên cảnh báo không khớp. Vì C++ yêu cầu prototype, bạn có thể bị cám dỗ thêm chúng willy-nilly khi dùng compiler C++ để brute-force một ít code K\&R C cổ lỗ.

#### Thử thách lập trình

![image](images/ch08/img08-03.png)

Cách đánh lừa prototype

Hãy thử vài ví dụ để làm rõ vấn đề. Tạo function sau trong file riêng:

```
void banana_peel(char a, short b, float c) {
    printf("char = %c, short =%d, float = %f \n",
a,b,c);
}
```

Trong file khác, tạo chương trình main gọi `banana_peel()`.

1\. Thử gọi có prototype, không prototype, và với prototype không khớp definition.

2\. Với từng trường hợp, hãy dự đoán trước khi thử. Kiểm tra dự đoán bằng cách viết một `union` cho phép lưu giá trị thuộc một type rồi lấy lại dưới dạng type có kích thước khác.

3\. Đổi thứ tự parameter trong declaration và definition có ảnh hưởng cách function được gọi nhận giá trị không? Hãy giải thích. Compiler của bạn bắt được bao nhiêu trường hợp lỗi?

Trước đó ta nói prototype cho phép compiler kiểm tra cách sử dụng so với declaration. Ngay cả khi không trộn kiểu cũ với mới, quy ước này cũng không tuyệt đối an toàn vì không có gì bảo đảm prototype thực sự khớp definition tương ứng. Thực tế ta phòng tránh bằng cách đặt prototype vào header file rồi include header trong file khai báo function. Compiler thấy đồng thời cả hai và phát hiện không khớp. Khốn cho lập trình viên không làm vậy!

#### Mẹo thực hành hữu ích

![image](images/ch08/img08-04.png)

Đừng trộn kiểu cũ và mới trong function declaration và definition

Đừng bao giờ trộn kiểu cũ và mới của function declaration và definition. Nếu function có declaration K\&R-style trong header file, hãy dùng syntax K\&R cho definition.

```
int foo();    int foo(a,b) int a; int b; { /* ... */ }
```

Nếu function có prototype ANSI C, hãy dùng syntax C-style ANSI trong definition.

```
int foo(int a, int b);    int foo(int a, int b) { /* ...
*/ }
```

Hoàn toàn có thể tạo cơ chế tuyệt đối an toàn để kiểm tra function call qua nhiều file. Các function có số argument thay đổi như printf sẽ được xử lý đặc biệt, như hiện nay. Thậm chí có thể áp dụng cách đó cho syntax sẵn có. Chỉ cần chuẩn ràng buộc mỗi function call phải nhất quán với tên, số lượng, type parameter và return type trong function definition. “Tiền lệ” đã có vì ngôn ngữ Ada làm như vậy. C cũng có thể thực hiện nhờ thêm một lượt pre-linker. Gợi ý rõ ràng: dùng lint.

Trên thực tế, thành viên ủy ban ANSI C khá thận trọng khi mở rộng C, có thể nói là quá thận trọng. Rationale cho thấy họ dằn vặt thế nào về việc có thể bỏ giới hạn six-character, case-insensitive hiện có đối với phần có ý nghĩa của external name hay không. Cuối cùng họ quyết định không bỏ được, một quyết định mà vài chuyên gia ngôn ngữ cho là khá yếu đuối. Có lẽ ủy ban ANSI C cũng nên cắn răng chấp nhận quy định giải pháp trọn vẹn dù cần lượt pre-linker, thay vì lấy một giải pháp dở hơi không đầy đủ từ C++, mang theo quy ước, syntax, semantics và giới hạn riêng.

## Đọc char mà không cần carriage return

Một trong những câu hỏi đầu tiên lập trình viên MS-DOS đặt ra khi gặp UNIX là: “Làm sao đọc ký tự từ terminal mà không buộc người dùng nhấn `RETURN`?” Mặc định, terminal input trên UNIX được “cooked”, nghĩa là raw input được xử lý trước để dùng các ký tự line-editing như backspace, delete, v.v.; những phím này có hiệu lực mà không chuyển tới chương trình đang chạy. Thông thường đó là tiện ích đáng có, nhưng cũng có nghĩa thao tác đọc không nhận data cho đến khi người dùng nhấn `RETURN` để báo hết dòng. Thực tế input là line-by-line, trong khi một số ứng dụng cần thấy từng ký tự ngay khi từng phím được nhấn.

Tính năng này thiết yếu với nhiều loại software và rất đơn giản trên PC. Các thư viện C ở đó hỗ trợ nó, thường qua hàm `kbhit()` cho biết có ký tự đang đợi đọc không. Compiler C của Microsoft và Borland cung cấp `getch()` hoặc `getche()` để echo ký tự, cho phép nhận input character-by-character mà không đợi cả dòng.

Người ta thường thắc mắc vì sao ANSI C không định nghĩa hàm chuẩn lấy ký tự khi một phím được nhấn. Không có hàm chuẩn, mỗi hệ thống dùng cách khác nhau và mất portability. Lập luận phản đối đưa `kbhit()` vào chuẩn là nó chủ yếu hữu ích cho game software, trong khi nhiều tính năng terminal I/O khác cũng chưa được chuẩn hóa. Hơn nữa, không nên hứa cung cấp hàm thư viện chuẩn mà một số hệ điều hành khó triển khai. Lập luận ủng hộ cũng là nó chủ yếu hữu ích cho game software, và người viết game không cần vô số tính năng terminal I/O khác có thể được chuẩn hóa. Dù theo quan điểm nào, rõ ràng X3J11 đã bỏ lỡ cơ hội củng cố vị thế C như ngôn ngữ được chọn của một thế hệ sinh viên lập trình game trên UNIX.

### Mẹo thực hành hữu ích

![image](images/ch08/img08-04.png)

Phím sếp

Game software quan trọng hơn người ta thường nghĩ. Microsoft hiểu điều này và chu đáo trang bị “boss key” cho mọi game software mới. Bạn nhấn phím ấy khi liếc thấy quản lý đang lén tiến lại. Game biến mất tức thì, nên khi sếp bước đến terminal, trông như bạn đang làm việc. Chúng tôi vẫn đang tìm boss key có thể thu gọn MS-Windows để lộ hệ thống cửa sổ tử tế bên dưới…

Trên UNIX, có cách khó và cách dễ để nhận input character-by-character. Cách dễ là để chương trình stty làm việc. Dù là cách gián tiếp đạt điều bạn muốn, nó rất đơn giản để lập trình.

```
#include <stdio.h>
 main()
 {
 int c;

 /* The terminal driver is in its ordinary line-at-a-time mode
*/
 system("stty raw");

 /* Now the terminal driver is in character-at-a-time mode */
 c = getchar();

 system("stty cooked");
 /* The terminal driver is back in line-at-a-time mode */
}
```

Dòng cuối, `system("stty cooked");`, là cần thiết vì đặc tính terminal vẫn tồn tại sau khi chương trình kết thúc. Nếu chương trình đặt terminal vào chế độ kỳ lạ, terminal sẽ tiếp tục ở chế độ ấy. Điều này khác hẳn việc đặt biến môi trường, vốn biến mất khi process kết thúc.

Raw I/O thực hiện blocking read: nếu chưa có ký tự, process đợi đến khi ký tự xuất hiện. Nếu cần nonblocking read, bạn có thể dùng system call `ioctl()` (I/O control). Nó cho phép kiểm soát rất chi tiết đặc tính terminal và có thể cho biết phím đã được nhấn hay chưa trong SVr4. Code này dùng ioctl để chỉ đọc khi có ký tự chờ đọc. Loại I/O này gọi là polling vì bạn liên tục hỏi thiết bị xem nó đã có ký tự để đưa cho bạn chưa.

```
#include <sys/filio.h>
int kbhit()
{
 int i;
 ioctl(0, FIONREAD, &i);
 return i; /* return a count of chars available to read */
}
main()
{
 int i = 0;
 intc='';

 system("stty raw -echo");
 printf("enter 'q' to quit \n");
 for (;c!='q';i++) {
    if (kbhit()) {
        c=getchar();
       printf("\n got %c, on iteration %d",c, i);
    }
}
 system("stty cooked echo");
}
```

#### Mẹo thực hành hữu ích

![image](images/ch08/img08-04.png)

Kiểm tra errno sau lời gọi thư viện

Mỗi khi dùng system call như `ioctl()`, bạn nên kiểm tra biến global `errno`, một phần của ANSI standard C.

Nếu lời gọi thư viện hoặc system call gặp vấn đề, nó đặt `errno` để chỉ nguyên nhân. Tuy nhiên, giá trị `errno` chỉ hợp lệ nếu thực sự có vấn đề; lời gọi sẽ báo điều này bằng một cách nào đó, thường là return code.

Cách sử dụng điển hình có thể là:

```
errno=0;
if (ioctl(0, FIONREAD, &i)<0) {
    if (errno==EBADF) printf("errno: bad file number");
    if (errno==EINVAL) printf("errno: invalid
argument");}
```

Bạn có thể làm cầu kỳ tùy thích, đóng gói việc kiểm tra trong một function duy nhất rồi gọi sau mỗi system call khi debug. Điều này giúp cô lập lỗi rất nhiều. Lời gọi thư viện `perror()` in thông báo lỗi khi bạn biết đã có lỗi.

Nếu quan tâm I/O single-character như vậy, bạn thường cũng muốn thực hiện điều khiển hiển thị khác; thư viện curses cung cấp nhiều routine portable cho cả hai. Curses, hãy liên tưởng “cursor”, là thư viện các lời gọi quản lý màn hình, có implementation trên mọi nền tảng phổ biến. Viết lại main function trên bằng curses thay stty cho ta:

```
#include <curses.h>
/* uses curses library, and the kbhit() function defined above
*/
main()
{
 int c=' ', i=0;

 initscr(); /* initialize curses functions */
 cbreak();
 noecho(); /* do not echo pressed character */

 mvprintw(0, 0, "Press 'q' to quit\n");
 refresh();

 while (c!='q')
 if (kbhit()) {
    c = getch(); /* won't block, as we know a character is
waiting */
    mvprintw(1, 0, "got char '%c' on iteration %d \n",c, ++i);
    refresh();
}

 nocbreak();
 echo();
 endwin(); /* finish curses */
}
```

Compile bằng `cc foo.c -lcurses`. Hãy chú ý output gọn gàng hơn nhiều khi chạy dưới curses. Cuốn Nutshell mang tên UNIX Curses Explained, hoàn toàn không phải sách những câu chửi của lập trình viên như nhiều người nghĩ khi cầm lên, mô tả curses rất tốt. Thư viện curses chỉ cung cấp các func-tions điều khiển màn hình character-based. Đây là mẫu số chung thấp hơn software viết bằng thư viện cửa sổ đồ họa bit-mapped cụ thể, nhưng software curses portable hơn nhiều.

Cuối cùng còn có non-polling read, trong đó hệ điều hành gửi signal cho process mỗi khi có input sẵn sàng.

Nếu chương trình dùng I/O interrupt-driven, lúc không xử lý input nó có thể làm việc khác trong main function. Đây là cách sử dụng tài nguyên rất hiệu quả nếu input thưa thớt và cần xử lý nhiều. Chương trình Interrupt-driven phức tạp hơn và khó làm cho chạy đúng hơn nhiều, nhưng mô hình này cho phép process tận dụng thời gian đáng lẽ phải chờ input. Việc dùng thread làm giảm nhu cầu sử dụng kỹ thuật I/O interrupt-driven.

#### Thử thách lập trình

![image](images/ch08/img08-03.png)

Viết routine input Interrupt-Driven trên hệ thống của bạn

Input Interrupt-driven rất dễ trên MS-DOS. Dịch vụ hệ thống sơ sài đến mức dễ gạt sang một bên và lấy ký tự trực tiếp từ I/O port. Trong SVr4, bạn cần làm như sau:

1\. Tạo signal handler routine được gọi để đọc ký tự khi hệ điều hành gửi signal báo có ký tự sẵn sàng. Signal cần bắt là `SIGPOLL`.

2\. Signal handler phải đọc ký tự và mỗi lần được gọi lại tự đặt mình làm handler cho signal này. Hãy cho nó echo ký tự vừa đọc và thoát nếu đó là 'q'. Lưu ý: đây chỉ phục vụ giảng dạy. Trong thực tế, kết quả thường là undefined nếu gọi bất kỳ hàm thư viện chuẩn nào bên trong signal handler.

3\. Gọi `ioctl()` để thông báo hệ điều hành rằng bạn cần được gửi signal mỗi khi input đến standard input. Xem manpage của streamio. Bạn cần command `I_SETSIG` và argument

```
S_RDNORM.
```

4\. Khi đã thiết lập signal handler, chương trình có thể làm việc khác cho đến khi input đến. Hãy cho nó tăng một counter và in giá trị counter trong handler routine.

Mỗi lần bàn phím gửi ký tự, signal `SIGPOLL` được gửi tới process. Signal handler đọc ký tự rồi tự đặt lại mình làm handler.

## Triển khai finite state machine trong C

Finite state machine là một khái niệm toán học có thể rất hữu ích khi được đưa vào chương trình. Đó là một quy tắc để lần lượt đi qua một số lượng hữu hạn (“finite”) các subroutine (“state”); mỗi subroutine thực hiện một số công việc xử lý rồi chọn state tiếp theo, thường dựa trên phần input tiếp theo.

Finite state machine (FSM) có thể dùng làm control structure của chương trình. FSM đặc biệt well-suited với những chương trình lặp qua nhiều action thay thế nhau tùy theo input. Máy bán hàng coin-operated là một ứng viên phù hợp cho FSM. Nó sẽ có các state như “nhận tiền xu”, “chọn món hàng”, “giao món hàng” và “trả tiền thừa”. Input là tiền xu, còn output là các món hàng được bán.

Ý tưởng cơ bản là có một bảng chứa mọi state có thể có, đồng thời liệt kê những action cần thực hiện khi đi vào từng state. Action cuối cùng là tính xem phải đi vào state nào tiếp theo, thường bằng một lần tra bảng nữa dựa trên state hiện tại và input token tiếp theo. Bạn bắt đầu ở state gọi là “initial state”. Trong quá trình chạy, transition table có thể yêu cầu đi vào error state, biểu thị input bất ngờ hoặc sai. Bạn tiếp tục chuyển state cho đến khi đến end state.

Có nhiều cách biểu diễn FSM trong C, nhưng phần lớn đều dựa trên một array chứa pointer tới function. Có thể khai báo array chứa pointer tới function như sau:

```
void ( *state[MAX_STATES] )();
```

Nếu biết tên các function, bạn có thể khởi tạo array như sau:

```
extern int a(), b(), c(), d();
int (*state[])() = { a, b, c, d };
```

Có thể gọi function thông qua một pointer trong array như sau:

```
(*state[i])();
```

Tất cả function phải nhận cùng các argument và có cùng kiểu giá trị trả về, trừ khi bạn biến phần tử array thành union… Pointer tới function khá kỳ lạ. Cũng hãy chú ý rằng có thể bỏ pointer đi, vì thế lời gọi trên hoàn toàn có thể viết thành

```
state[i]();
```

hoặc thậm chí

```
(******state[i])();
```

Đây là một đặc điểm kỳ quặc không may đã trở nên phổ biến cùng ANSI C: lời gọi trực tiếp một function và lời gọi function thông qua pointer, dù có bao nhiêu mức indirection, đều có thể dùng cùng syntax. Array cũng có một đặc điểm kỳ quặc tương ứng. Điều này càng làm suy yếu triết lý vốn đã có khiếm khuyết “declaration trông giống cách sử dụng”.

### Thử thách lập trình

![image](images/ch08/img08-03.png)

Viết chương trình FSM

Hãy triển khai bộ phân tích declaration C ở Chương 3 dưới dạng finite state machine.

1\. Xem lại sơ đồ “decoder ring”, Hình 3-3 ở trang 76. Đây chính là một sơ đồ state machine đơn giản! Hãy lập trình nó theo cách này, có thể bằng cách sửa chương trình cdecl bạn đã viết ở Chương 3. (Bạn đã viết nó rồi, đúng không?)

2\. Trước hết, viết code điều khiển việc chuyển từ state này sang state khác. Cho mỗi action routine chỉ in thông báo rằng nó đã được gọi. Debug hoàn chỉnh phần này.

3\. Thêm code để xử lý và giải mã declaration đầu vào.

Decoder ring là một state machine đơn giản; phần lớn các lần chuyển state diễn ra tuần tự, bất kể input. Điều đó có nghĩa bạn không phải tạo transition table tra cặp state/input để tìm state tiếp theo. Bạn có thể dùng một biến đơn giản có type pointer-to-function. Trong mỗi state, một trong những việc cần làm là gán state tiếp theo cho biến này. Trong main loop, chương trình gọi function mà pointer trỏ tới, rồi tiếp tục như vậy cho đến khi đến function kết thúc hoặc error state.

So với phiên bản non-FSM, chương trình FSM-based có dễ viết code và debug hơn không? Việc thêm một action khác hoặc thay đổi thứ tự thực hiện các action thì sao?

Nếu muốn tinh tế hơn, bạn có thể cho state function trả về pointer tới một successor function tổng quát, rồi cast pointer đó sang type thích hợp. Khi ấy bạn không cần global variable. Nếu muốn đơn giản hơn, bạn có thể dùng switch statement như một state machine kiểu bình dân: gán giá trị cho control variable và đặt switch trong loop. Một điểm cuối cùng về FSM: nếu các state function dường như cần nhiều loại argument khác nhau, hãy cân nhắc dùng số lượng argument và một array chứa pointer tới string, giống main routine. Cơ chế quen thuộc `int` `argc,` `char` `*argv[]` rất tổng quát và cũng có thể áp dụng thành công cho các function do bạn định nghĩa.

## Software khó hơn hardware!

Bạn có bao giờ nhận thấy software và hardware dường như được đặt tên ngược không: software dễ thay đổi hơn, nhưng lại khó hơn ở mọi khía cạnh khác? Vì việc phát triển software và làm cho nó hoạt động đúng rất khó, lập trình viên chúng ta cần tìm cách làm công việc ấy dễ nhất có thể. Một cách, áp dụng cho mọi ngôn ngữ chứ không riêng C, là viết code sao cho dễ debug. Khi viết chương trình, hãy cung cấp các debugging hook.

### Mẹo thực hành hữu ích

![image](images/ch08/img08-04.png)

Debugging hook

Bạn có biết phần lớn debugger cho phép gọi function từ command line của debugger không? Điều này có thể rất hữu ích nếu bạn có data structure phức tạp. Hãy viết và compile một function duyệt qua data structure rồi in nó ra. Function này không được gọi ở bất kỳ đâu trong code, nhưng vẫn là một phần của executable. Đó là một “debugger hook”.

Khi debug code và đang dừng ở một breakpoint, bạn có thể dễ dàng kiểm tra tính toàn vẹn của data structure bằng cách tự gọi routine in dữ liệu. Khi được chỉ ra thì điều này thật hiển nhiên; nhưng nếu chưa từng thấy trước đó thì không hẳn vậy.

Phần trước đã gợi ý cách viết code để dễ debug khi đề nghị xây dựng FSM theo hai giai đoạn riêng: trước hết thực hiện việc chuyển state, và chỉ khi phần đó hoạt động mới bổ sung các action. Đừng nhầm phát triển tăng dần với “debug cho code thành hình”, một kỹ thuật phổ biến ở lập trình viên mới hoặc những người phải viết theo thời hạn too-strict. Cách làm này là viết vội một bản thử đầu tiên rồi dành nhiều tuần liên tục sửa những phần không chạy để cuối cùng chương trình hoạt động. Trong thời gian đó, bất cứ ai phụ thuộc vào component ấy của hệ thống đều có thể phát điên. “Sendmail” và “make” là hai chương trình nổi tiếng thường được cho là ban đầu đã hình thành theo cách này. Vì thế, ngôn ngữ lệnh của chúng được thiết kế thiếu suy xét và khó học. Không riêng bạn đâu: ai cũng thấy chúng phiền phức.

Viết code sao cho dễ debug có nghĩa là chia hệ thống thành các phần và làm cho cấu trúc chương trình hoạt động trước. Chỉ khi chương trình cơ bản đã chạy, bạn mới nên viết những phần tinh chỉnh phức tạp, điều chỉnh hiệu năng và tối ưu thuật toán.

#### Mẹo thực hành hữu ích

![image](images/ch08/img08-04.png)

Hash có phong cách

Hashing là cách tăng tốc truy cập một phần tử trong bảng dữ liệu. Thay vì tìm tuần tự qua bảng, bạn đi tắt đến phần tử có khả năng chứa giá trị cần tìm nhất.

Điều này đạt được bằng cách đưa dữ liệu vào bảng một cách có tính toán, thay vì theo thứ tự tuần tự. Bạn áp dụng một phép biến đổi, gọi là hash function, lên giá trị dữ liệu của phần tử cần lưu. Hash function tạo ra giá trị trong khoảng 0…tablesize-1; giá trị này trở thành index mà bạn thử dùng để lưu record đó.

Nếu vị trí ấy đã có dữ liệu, hãy tìm tiếp về phía sau trong bảng để lấy vị trí trống tiếp theo.

Một cách khác là gắn một linked list vào phần tử đó rồi đơn giản thêm phần tử mới vào cuối danh sách; thực ra thêm vào đầu nào cũng được. Bạn thậm chí có thể gắn một hash table thứ hai vào phần tử ấy.

Khi tra một mục dữ liệu, bạn không cần bắt đầu tìm các entry từ phần tử số không. Thay vào đó, hãy hash giá trị cần tìm một lần nữa rồi bắt đầu tìm từ vị trí đó trong bảng.

Hashing là một kỹ thuật tối ưu việc tra bảng đã được kiểm chứng, được sử dụng khắp nơi trong systems software: database, operating system và compiler.

Nếu bị mắc kẹt trên đảo hoang và chỉ được mang theo một data structure, tôi sẽ chọn hash table.

Một đồng nghiệp phải viết chương trình có một phần lưu filename cùng thông tin về từng file. Dữ liệu được lưu trong bảng các struct, và anh quyết định dùng hash lookup. Đây là lúc cách viết code để dễ debug phát huy tác dụng. Anh không cố làm cho mọi phần của chương trình chạy được trong một lần. Anh làm cho trường hợp đơn giản nhất hoạt động trước bằng cách cho hash function luôn trả về hằng số không. Function đó như sau:

```
/* hash_file: Placeholder for more sophisticated future
routine */
int hash_filename (char *s)
{
 return 0;
}
```

Code gọi function ấy như sau:

```
/*
 * find_file: Locate a previously created file descriptor or
 *     make a new one if necessary.
 */
file find_filename (char *s)
{
 int hash_value = hash_filename(s);
 file f;

 for (f = file_hash_table[hash_value]; f != NIL;f=f->flink) {
   if (strcmp(f->fname, s) == SAME) {
     return f;
   }
}

 /* file not found, so make a new one: */
 f = allocate_file(s);
 f->flink = file_hash_table[hash_value];
 file_hash_table[hash_value] = f;
 return f;
}
```

Hiệu quả giống như không dùng hash table: mọi phần tử được lưu trong một linked list gắn vào phần tử số không. Điều này khiến việc debug đơn giản vì không cần tính xem mỗi thứ thực sự phải nằm ở đâu. Người lập trình tài giỏi ấy nhanh chóng làm cho phần code còn lại hoạt động vì không phải lo tương tác với hashing. Khi đã hài lòng rằng các routine chính chạy hoàn hảo, anh đo hiệu năng rồi quyết định kích hoạt hash function. Việc này chỉ là một thay đổi two-line trong một function duy nhất. Đây là phiên bản hiện tại, với điều anh gọi là “động não, chịu khó và hưởng lợi”.

```
int hash_filename (char *s)
{
 int length = strlen(s);
 return (length+4*(s[0]+4*s[length/2])) % FILE_HASH;
}
```

Đôi khi, dành thời gian chia bài toán lập trình thành các phần nhỏ hơn lại là cách giải nhanh nhất.

#### Thử thách lập trình

![image](images/ch08/img08-03.png)

Viết chương trình hash

Hãy nhập đoạn code trên và bổ sung đủ những type, dữ liệu và code còn thiếu để nó chạy thành một chương trình. Sau đó, thật kinh khủng, hãy debug cho chương trình thành hình.

## Cast cách nào, vì sao

Ngay từ buổi đầu của C, thuật ngữ “cast” đã được dùng với cả hai nghĩa “type conversion” và “type disambiguation”. Nếu bạn viết một biểu thức như

```
(float) 3
```

thì đó là type conversion và các bit thực sự thay đổi. Nếu bạn viết

```
(float) 3.0
```

thì đó là type disambiguation, và compiler có thể đặt đúng các bit ngay từ đầu. Có người nói cast được so-named vì nó giúp thứ gì đó bị hỏng vẫn khập khiễng chạy tiếp, giống như bó bột giúp người bị thương đi lại.

Cast sang một elementary type rất dễ: viết tên type mới, chẳng hạn `int`, trong ngoặc trước expression cần cast. Cách cast sang type phức tạp hơn thì không hiển nhiên như vậy. Giả sử bạn có một pointer tới void mà bạn biết thực ra chứa function pointer. Làm sao vừa typecast vừa gọi function trong cùng một statement?

Ngay cả các phép cast phức tạp cũng có thể viết theo quy trình three-step sau.

1\. Xem declaration của object mà bạn muốn gán kết quả đã cast vào.

2\. Bỏ identifier cùng mọi storage class specifier như `extern`, rồi đặt phần còn lại trong ngoặc đơn.

3\. Viết phần văn bản thu được ngay bên trái object cần cast.

Một ví dụ thực tế là lập trình viên thường nhận ra cần cast để dùng library routine qsort(). Routine này nhận bốn parameter, một trong số đó là pointer tới comparison routine. Qsort được khai báo như sau:

```
void qsort(void *base, size_t nel, size_t width,
        int (*compar) (const void *, const void *));
```

Khi gọi qsort(), bạn truyền pointer tới comparison routine ưa thích của mình làm argument compar. Comparison routine nhận argument thuộc type thực tế thay vì void \*, nên có thể trông như sau:

```
int intcompare(const int *i, const int *j)
{
      return(*i - *j);
}
```

Điều này không khớp chính xác với điều qsort mong đợi ở argument compar(), nên cần một phép cast. <sup>\[2\]</sup> Giả sử ta có array a gồm mười integer cần sắp xếp. Theo quy trình cast ba bước đã nêu, có thể thấy lời gọi sẽ như sau:

<sup>\[2\]</sup> Nếu bạn có một máy tính kỳ quặc và ít phổ biến mà kích thước pointer thay đổi tùy theo type được trỏ tới, bạn sẽ phải thực hiện cast bên trong comparison routine thay vì tại lời gọi. Hãy cố chuyển sang một kiến trúc được thiết kế tốt hơn càng sớm càng tốt.

```
qsort(
     a,
     10,
     sizeof(int),
     (int (*)(const void *, const void *)) intcompare
);
```

Một ví dụ thiếu thực tế hơn: bạn có thể tạo pointer tới một function, chẳng hạn printf(), bằng cách viết

```
extern int printf(const char*,...);
void *f = (void*)printf;
```

Sau đó, bạn có thể gọi printf thông qua pointer đã được properly-cast như sau:

```
(*(int(*)(const char*,...))f)("Bite my shorts. Also my chars
and ints\n");
```

## Giải trí nhẹ — Cuộc thi C khó hiểu quốc tế

Ngôn ngữ C kết hợp toàn bộ sức mạnh của assembly language với toàn bộ ease-of-use của assembly language.

—Tục ngữ nông dân cổ

Bất kỳ ngôn ngữ lập trình nào cũng có thể bị lạm dụng. Phần lớn lập trình viên giỏi có thể viết những chương trình rối rắm đến mức chỉ nhìn thôi đã nhức mắt. Đó là code bạn có thể tự hào mang sang khoe với lập trình viên ở phòng bên và thách họ đoán xem nó làm gì. Cũng là code mà sáu tháng sau khi viết, chính bạn không còn hiểu nó làm gì. Bạn có thể viết kiểu chương trình ấy bằng bất kỳ ngôn ngữ nào; chỉ là với C dường như dễ hơn.

International Obfuscated C Code Competition (IOCCC) là cuộc thi thường niên do Landon Curt Noll và Larry Bassel tổ chức qua USENET từ năm 1984. Nó bắt đầu khi Landon xem source code của Bourne shell và quyết định: “Không! Thế này kỳ quặc quá.” Anh tự hỏi sẽ đi xa đến đâu nếu chủ động làm cho code C khó hiểu, thay vì chỉ vô tình đạt được điều đó như một tác dụng phụ.

Cuộc thi đã trở thành truyền thống hằng năm. Bài dự thi được nhận vào mùa đông, chấm trong mùa xuân, và người thắng được công bố tại hội nghị Usenix mùa hè. Thường có khoảng mười hạng mục giải thưởng: “lạm dụng luật kỳ lạ nhất”, “bố cục source code sáng tạo nhất”, “one-liner hay nhất”, v.v. Giải chung cuộc “best of show” thuộc về người tạo ra chương trình C khó đọc và kỳ quặc nhất nhưng vẫn hoạt động.

IOCCC rất vui và có thể mở rộng kiến thức theo những cách bất ngờ, dù bạn tham gia hay chỉ phân tích code prize-winning sau đó. Chẳng hạn, năm 1987, David Korn của Bell Labs gửi bài dự thi đoạt giải sau:

```
main() { printf(&unix["\021%six\012\0"],(unix)["have"]+"fun"-
0x60);}
```

Nó in ra gì? (Gợi ý: không phải “have fun”!) David đã viết Korn shell mang tên mình, vốn được nhiều người coi là gọn gàng hơn nhiều so với /bin/sh phiên bản 7. Vì vậy, có lẽ IOCCC cũng là một van xả an toàn cho những hacker vui tính.

Một bài thắng giải năm 1988 là phiên bản cdecl được làm khó hiểu do lập trình viên Gopi Reddy gửi dự thi. Hãy nhớ rằng ta đã cần khoảng 150 dòng để viết chương trình này theo cách dễ đọc. Code khó hiểu dưới đây chưa đến một chục dòng:

```
#include<stdio.h>
#include<ctype.h>
#define w printf
#define p while
#define t(s) (W=T(s))
char*X,*B,*L,I[99];M,W,V;D(){W==9?(w("`%.*s' is
",V,X),t(0)):W==40?
(t(0),D(),t(41)):W==42?(t(0),D(),w("ptr to ")):0;p(W==40?(t(0),
w("func returning "),t(41)):W==91?(t(0)==32?(w("array[0..%d]
of ",
atoi(X)-1),t(0)):w("array of "),t(93)):0);}main(){p(w("input:
"),
B=gets(I))if(t(0)==9)L=X,M=V,t(0),D(),w("%.*s.\n\n",M,L);}T(s)
{if(!s||s==W)
{p(*B==9||*B==32)B++;X=B;V=0;if(W=isalpha(*B)?9:isdigit(*B)?32
:*B++)
if(W<33)p(isalnum(*B))B++,V++;}return W;}
```

Kiểu làm khó hiểu bằng cách lạm dụng các operator `?` và `,` này ngày nay đã hơi lỗi thời, nhưng khi ấy còn mới lạ, và độ ngắn gọn của chương trình quả thực đáng kinh ngạc. Việc Figur-ing xem nó hoạt động thế nào được dành làm bài tập cho bạn đọc. (Ha! Tôi luôn muốn nói câu đó.) Để bạn có điểm khởi đầu: có hai subroutine, `T()` thực hiện lexical analysis cho token tiếp theo và cho biết đó là identifier, number, v.v.; còn `D()` thực hiện parsing. Hãy thử gỡ rối bằng cách chạy chương trình qua preprocessor rồi định dạng lại. Sau đó đổi mọi expression `?` thành statement `if`. Lặp lại cho đến khi có thể đọc được.

Ví dụ code C khó hiểu cuối cùng là một BASIC interpreter do nghiên cứu sinh Diomidis Spinellis ở Đại học London gửi dự thi, được viết chỉ với khoảng 1.500 ký tự! Bài dự thi kèm theo hướng dẫn sử dụng interpreter và một chương trình BASIC mẫu.

### Giáo điều software

![image](images/ch08/img08-01.png)

DDS-BASIC Interpreter (Phiên bản 1.00)

Lệnh trực tiếp: `RUN` `LIST` `NEW` `BYE` `OLD` filename `SAVE` filename

Lệnh chương trình:

Tên variable từ A đến Z; các variable được khởi tạo bằng 0 khi RUN. FOR var = exp TO exp NEXT variable GOSUB exp RETURN GOTO exp IF exp THEN exp INPUT variable PRINT string PRINT exp var = exp REM any text END

Expression (theo precedence):

expression đặt trong ngoặc

number (bắt đầu bằng 0 là octal, 0x là hex, còn lại là decimal), variable

Unary -

\* /

\+ -

\= \<\>

\> \<

\<= \>=

\* và + cũng được dùng cho boolean AND và boolean OR

boolean expression cho giá trị 0 khi false và 1 khi true

Chỉnh sửa:

Line editor cho phép chỉnh sửa bằng cách nhập lại toàn bộ dòng (line re-entry).

Một số dòng không có nội dung nào theo sau sẽ xóa dòng đó.

Input format:

Có thể đặt token tự do ở các vị trí trên dòng.

Không được có space trước số dòng. Phải có đúng một space giữa lệnh OLD hoặc SAVE và filename.

MỌI INPUT ĐỀU PHẢI VIẾT HOA.

Giới hạn:

Số dòng: 1–10000; độ dài dòng: 999 ký tự; FOR lồng nhau: 26 mức; GOSUB: 999 mức; chương trình: cấp phát động; expression: -32768–32767 trên máy 16-bit,

\-2147483648–2147483647 trên máy 32-bit

Kiểm tra lỗi / thông báo lỗi:

Không thực hiện kiểm tra lỗi.

Thông báo “core dumped” biểu thị lỗi syntax hoặc semantic.

Môi trường host:

ANSI C, K\&R C truyền thống

Character set ASCII hoặc EBCDIC

48 Kbyte bộ nhớ

Chương trình BASIC mẫu đi kèm là game lunar lander quen thuộc:

```
10 REM Lunar Lander
20 REM By Diomidis Spinellis
30 PRINT "You are on the Lunar Lander about to leave the
spacecraft."
60 GOSUB 4000
70 GOSUB 1000
80 GOSUB 2000
90 GOSUB 3000
100 H=H-V
110 V=((V+G)*10-U*2)/10
120 F=F-U
130 IFH>0THEN 80
135 H = 0
140 GOSUB 2000
150 IFV>5THEN 200
160 PRINT "Congratulations! This was a very good landing."
170 GOSUB 5000
180 GOTO 10
200 PRINT "You have crashed."
210 GOTO 170
1000 REM Initialise
1010 V = 70
1020 F = 500
1030 H = 1000
1040 G = 2
1050 RETURN
2000 REM Print values
2010 PRINT " Meter readings"
2015 PRINT " --------------"
2020 PRINT "Fuel (gal):"
2030 PRINT F
2040 GOSUB 2100 + 100 * (H <> 0)
2050 PRINT V
2060 PRINT "Height (m):"
2070 PRINT H
2080 RETURN
2100 PRINT "Landing velocity (m/sec):"
2110 RETURN
2200 PRINT "Velocity (m/sec):"
2210 RETURN
3000 REM User input
3005 IFF=0THEN 3070
3010 PRINT "How much fuel will you use?"
3020 INPUT U
3025 IFU<0THEN 3090
3030 IF U <= F THEN 3060
3040 PRINT "Sorry, you have not got that much fuel!"
3050 GOTO 3010
3060 RETURN
3070 U = 0
3080 RETURN
3090 PRINT "No cheating please! Fuel must be >= 0."
3100 GOTO 3010
4000 REM Detachment
4005 PRINT "Ready for detachment"
4007 PRINT "-- COUNTDOWN --"
4010 FORI=1TO11
4020 PRINT 11 - I
4025 GOSUB 4500
4030 NEXT I
4035 PRINT "You have left the spacecraft."
4037 PRINT "Try to land with velocity less than 5 m/sec."
4040 RETURN
4500 REM Delay
4510 FORJ=1TO500
4520 NEXT J
4530 RETURN
5000 PRINT "Do you want to play again? (0 = no,1=yes)"
5010 INPUT Y
5020 IFY=0THEN 5040
5030 RETURN
5040 PRINT "Have a nice day."
```

Nếu nhập chương trình này vào file có tên `LANDER.BAS`, bạn có thể compile và chạy bằng các lệnh sau trong BASIC interpreter:

```
OLD LANDER.BAS
RUN
```

Bản thân BASIC interpreter khó hiểu có dạng như sau:

```
#define O(b,f,u,s,c,a) \
b(){into=f();switch(*p++){Xu:_osb();Xc:_oab();default:p--;_o;}}
#define t(e,d,_,C)X e:f=fopen(B+d,_);C;fclose(f)
#define U(y,z) while(p=Q(s,y))*p++=z,*p=' '
#define N for(i=0;i<11*R;i++)m[i]&&
#define I "%d %s\n",i,m[i]
#define X ;break;case
#define _ return
#define R 999
typedef char*A;int*C,E[R],L[R],M[R],P[R],l,i,j;char
B[R],F[2];A m[12*R],malloc
(),p,q,x,y,z,s,d,f,fopen();A Q(s,o)A
s,o;{for(x=s;*x;x++){for(y=x,z=o;*z&&*y==
*z;y++)z++;if(z>o&&!*z)_ x;}_
0;}main(){m[11*R]="E";while(puts("Ok"),gets(B)
)switch(*B){X'R':C=E;l=1;for(i=0;i<R;P[i++]=0);while(l){while(
!(s=m[l]))l++;if
(!Q(s,"\"")){U("<>",'#');U("<=",'$');U(">=",'!');}d=B;while(*F
=*s){*s=='"'&&j
++;if(j&1||!Q(" \t",F))*d++=*s;s++;}*d--
=j=0;if(B[1]!='=')switch(*B){X'E':l=-1
X'R':B[2]!='M'&&(l=*--
C)X'I':B[1]=='N'?gets(p=B),P[*d]=S():(*(q=Q(B,"TH"))=0,p
=B+2,S()&&(p=q+4,l=S()-
1))X'P':B[5]=='"'?*d=0,puts(B+6):(p=B+5,printf("%d\n",S
()))X'G':p=B+4,B[2]=='S'&&(*C++=l,p++),l=S()-1
X'F':*(q=Q(B,"TO"))=0;p=B+5;P[i
=B[3]]=S();p=q+2;M[i]=S();L[i]=l
X'N':++P[*d]<=M[*d]&&(l=L[*d]);}else p=B+2,P[
*B]=S();l++;}X'L':N printf(I)X'N':N free(m[i]),m[i]=0 X'B':_ 0
t('S',5,"w",N
fprintf(f,I))t('O',4,"r",while(fgets(B,R,f))(*Q(B,"\n")=0,G())
)X 0:default:G()
;}_ 0;}G(){l=atoi(B);m[l]&&free(m[l]);(p=Q(B,"
"))?strcpy(m[l]=malloc(strlen(p
)),p+1):(m[l]=0,0);}O(S,J,'=',==,'#',!=)O(J,K,'<',<,'>',>)O(K,
V,'$',<=,'!',>=)
O(V,W,'+',+,'-',-)O(W,Y,'*',*,'/',/)Y(){int o;_*p=='-'?p++,-
Y():*p>='0'&&*p<=
'9'?strtol(p,&p,0):*p=='('?p++,o=S(),p++,o:P[*p++];}
```

Khi nhập code, hãy chú ý phân biệt chữ “l” với chữ số “1”! Nếu nằm ở phía left-hand của assignment thì phải là chữ “l”.

Đây là một chương trình đáng kinh ngạc, rất đáng reverse-engineering để loại bỏ sự khó hiểu và tìm ra cách hoạt động. Nếu nó khơi gợi trí tưởng tượng của bạn, hẳn bạn sẽ vui khi biết mình cũng có thể dự thi IOCCC. Chỉ cần đọc newsgroup comp.lang.c trên Usenet và làm theo hướng dẫn đăng vào cuối mùa thu. Nhưng hãy nhớ rằng người thắng thuộc hàng lập trình viên giỏi nhất thế giới, và họ đang cố hết sức để viết code tệ nhất.

#### Lời giải lập trình

![image](images/ch08/img08-05.png)

Sự nhầm lẫn về type promotion trong prototype (Mix-Up)

```
main() {
    union {
        double d;
        float f;
    }u;

    u.d = 10.0;
    printf(" put in a double, pull out a float f= %f
\n", u.f);

    u.f=10.0;
    printf(" put in a float, pull out a double d= %f
\n", u.d);
}

%a.out
 put in a double, pull out a float f= 2.562500
 put in a float, pull out a double d= 524288.000000
```

#### Lời giải lập trình

![image](images/ch08/img08-05.png)

Asynchronous I/O

Code dưới đây khiến một hệ điều hành SVr4-based gửi interrupt cho mỗi ký tự được nhập vào standard input.

```
#include <errno.h>
#include <signal.h>
#include <stdio.h>
#include <stropts.h>
#include <sys/types.h>
#include <sys/conf.h>

int iteration=0;
char crlf []={0xd,0xa, 0};

void handler(int s)
{
    int c=getchar(); /* read a character */
    printf("got char %c, at count %d
%s",c,iteration,crlf);

    if (c=='q') {
            system("stty sane");
            exit(0);
    }
}

main()
{
    sigset(SIGPOLL, handler); /* set up the handler */
    system("stty raw -echo");
    ioctl(0, I_SETSIG, S_RDNORM); /* ask for interrupt
driven input */

    for(;;iteration++);
    /* can do other stuff here */
}
```

Dùng sigset() thay cho signal() để không phải re-register signal handler mỗi lần. Output mẫu như sau:

```
% a.out
got char a, at count 1887525
got char b, at count 5979648
got char c, at count 7299030
got char d, at count 9802103
got char e, at count 11060214
got char q, at count 14551814
```

#### Lời giải lập trình

![image](images/ch08/img08-05.png)

cdecl dạng FSM

```
#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAXTOKENS 100
#define MAXTOKENLEN 64

enum type_tag { IDENTIFIER, QUALIFIER, TYPE };

struct token {
    char type;
    char string[MAXTOKENLEN];
};

int top = -1;

/* holds all the tokens before first identifier */
struct token stack[MAXTOKENS];

/* holds the token just read */
struct token this;

#define pop stack[top--]
#define push(s) stack[++top]=s

enum type_tag
classify_string(void)
/* figure out the identifier type */
{
    char *s = this.string;
    if (!strcmp(s, "const")) {
        strcpy(s, "read-only");
        return QUALIFIER;
    }
    if (!strcmp(s, "volatile")) return QUALIFIER;
    if (!strcmp(s, "void")) return TYPE;
    if (!strcmp(s, "char")) return TYPE;
    if (!strcmp(s, "signed")) return TYPE;
    if (!strcmp(s, "unsigned")) return TYPE;
    if (!strcmp(s, "short")) return TYPE;
    if (!strcmp(s, "int")) return TYPE;
    if (!strcmp(s, "long")) return TYPE;
    if (!strcmp(s, "float")) return TYPE;
    if (!strcmp(s, "double")) return TYPE;
    if (!strcmp(s, "struct")) return TYPE;
    if (!strcmp(s, "union")) return TYPE;
    if (!strcmp(s, "enum")) return TYPE;
    return IDENTIFIER;
}

void gettoken(void)
{             /* read next token into "this" */
    char *p = this.string;

    /* read past any spaces */
    while ((*p = getchar()) == ' ');

    if (isalnum(*p)) {
        /* it starts with A-Z,1-9 read in identifier */
        while (isalnum(*++p = getchar()));
        ungetc(*p, stdin);
        *p = '\0';
        this.type = classify_string();
        return;
    }
    this.string[1] = '\0';
    this.type = *p;
    return;
}

void initialize(),
 get_array(), get_params(), get_lparen(),
get_ptr_part(), get_type();

void (*nextstate)(void) = initialize;


int main()
/* Cdecl written as a finite state machine */
{
    /* transition through the states, until the pointer
is null */
    while (nextstate != NULL)
        (*nextstate)();

    return 0;
}

void initialize()
{
    gettoken();
    while (this.type != IDENTIFIER) {
        push(this);
        gettoken();
    }
    printf("%s is ", this.string);
    gettoken();
    nextstate = get_array;
}

void get_array()
{
    nextstate = get_params;
    while (this.type == '[') {
        printf("array ");
        gettoken();/* a number or ']' */
        if (isdigit(this.string[0])) {
            printf("0..%d ", atoi(this.string) - 1);
            gettoken();/* read the ']' */
        }
        gettoken();/* read next past the ']' */
        printf("of ");
        nextstate = get_lparen;
    }
}

void get_params()
{
    nextstate = get_lparen;
    if (this.type == '(') {
        while (this.type != ')') {
            gettoken();
        }
        gettoken();
        printf("function returning ");
    }
}

void get_lparen()
{
    nextstate = get_ptr_part;
    if (top >= 0) {
        if (stack[top].type == '(') {
            pop;
            gettoken();/* read past ')' */
            nextstate = get_array;
        }
    }
}

void get_ptr_part()
{
    nextstate = get_type;
    if (stack[top].type == '*') {
        printf("pointer to ");
        pop;
        nextstate = get_lparen;
    } else if (stack[top].type == QUALIFIER) {
        printf("%s ", pop.string);
        nextstate = get_lparen;
    }
}

void get_type()
{
    nextstate = NULL;
    /* process tokens that we stacked while reading to
identifier */
    while (top >= 0) {
        printf("%s ", pop.string);
    }
    printf("\n");
}
```
