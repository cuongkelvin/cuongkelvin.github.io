# Chương 8. Vì sao lập trình viên không phân biệt Halloween với Giáng sinh

Chán workstation chậm? Muốn chương trình nhanh gấp đôi?

UNIX làm như sau, ba bước dễ:

1\. Thiết kế, code UNIX vm kernel high-performance. Cẩn thận! Thuật toán phải nhanh đôi để đủ speed-up 100%.

2\. Đặt code trong file `/kernel/unix.c`

3\. Ra lệnh

`4.`

```
cc -O4 -o /kernel/unix /kernel/unix.c
```

rồi reboot.

Đơn giản vậy. Nhớ Beethoven viết giao hưởng đầu bằng C.

—Sách mẹo tuning và bài hát bóng bầu dục của A.P.L. Byteswap

hệ đo Potrzebie…tạo glyph bằng bit pattern…type đổi trong lúc chờ…đau prototype…đọc character không newline…FSM trong C…program case đơn giản trước…cast cách nào vì sao…giải trí nhẹ — cuộc thi C khó hiểu quốc tế

## Hệ đo lường Potrzebie

Dĩ nhiên khi Picasso nói computer không thú vị, biết ông muốn thúc diễn ngôn nghệ sĩ thách thức thiết chế, hỏi hoặc ít nhất đúng phần khoai chiên mỗi đơn. Vì vậy chương mở câu hỏi cũ vì sao programmer nhầm Halloween, Giáng sinh. Trước đáp, nói Donald Knuth, computer scientist world-class. Giáo sư dạy Stanford nhiều năm, viết tham khảo đồ sộ The Art of Computer Programming <sup>\[1\]</sup>, thiết kế TeX.

<sup>\[1\]</sup> Sau Knuth nhận đồng nghiệp long-standing Art Evans là Art tên sách. Năm 1967 lúc bộ sách ra, semi-nar Carnegie Tech, nói vui thấy Art vì đặt sách theo ông. Ai hiểu chơi chữ đều rên tán thưởng, Art kinh ngạc nhất.

Sau giành ACM Turing Award, Knuth nhắc Art trong lecture để lưu chính thức. Đọc Communications of ACM tập17 số12 tr668. Art nói "chẳng ảnh hưởng đời tôi mấy".

Điều little-known là bài đầu Knuth không phải journal peer-reviewed uy tín mà báo phổ biến. "The Potrzebie System of Weights and Measures", MAD số33 tháng6 năm1957, chính Knuth sau nổi tiếng viết, nhại hệ mét then-novel. Bài sau thường chính thống hơn, chúng tôi thấy tiếc, mong về gốc. Cơ sở đo Potrzebie là độ dày MAD số26.

Áp dụng nhất quán prefix metric-decaded với đơn vị độc giả MAD quen như potrzebies, whatmeworrys, axolotls. Nhẹ nhàng giới thiệu hệ mét, người Mỹ chưa quen kilo, centi, v.v., Potrzebie mở đường. Nếu thật áp dụng, thử hệ mét Mỹ sau có lẽ thành công hơn.

Như Potrzebie, chuyện nhầm ngày dựa biết hệ số. 31 bát phân (cơ số8) bằng25 thập phân (cơ số10), ngắn là OCT31=DEC25! Viết xin Knuth kể kèm draft, ông không chỉ đồng ý còn sửa nhiều chỗ, chỉ programmer cũng nhầm NOV27.

Chương chọn idiom C cần hiểu lập trình bên trong tương tự. Có mẹo nên thử, chuyện cau-tionary né. Bắt đầu cách làm icon self-documenting thú vị.

## Tạo glyph từ bit pattern

Icon hay glyph là hình nhỏ màn bit-mapped. Một bit mỗi pixel, set thì on, clear thì off. Integer encode image. Tool Iconedit vẽ, xuất ASCII integer file include window program. Vấn đề icon trong code chỉ hex. Glyph đen trắng 16-by-16 điển hình:

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

Literal C chẳng gợi hình. Bộ #define đẹp ngoạn mục sau cho dựng literal giống glyph trên screen.

```
#define X )*2+1
#define _ )*2
#define s ((((((((((((((((0 /* For building glyphs 16 bits
wide */
```

Cho tạo hex pattern bằng vẽ hình muốn! Còn gì tốt cho self-documenting? Ví dụ thành:

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

có nghĩa hơn literal nhiều. C chuẩn có octal, decimal, hex, không binary constant vốn đơn giản hơn hình dung pattern.

Nghiêng sách đúng, nheo mắt, có thể đoán stopwatch "cursor busy" của window system phổ biến. Mẹo từ comp.lang.c Usenet vài năm trước.

Đừng quên undef macro sau hình, tránh can thiệp bí ẩn code sau.

## Type đổi trong lúc chờ

Chương1 có conversion khi operator nhận operand khác type: "usual arithmetic conversions", về common type thường cũng result type.

Conversion C rộng hơn thường nhận ra, cả expression có type nhỏ `int`, `double`. Ví dụ:

```
printf(" %d ", sizeof 'A' );
```

In size type chứa character literal. Chắc size character "1"? Chạy sẽ "4" (hoặc size `int` hệ bạn). Literal type `int`, theo rule promotion từ `char`. K\&R1 trang39 nói quá ngắn: Mọi char expression chuyển `int`.…Mọi `float` expression chuyển `double`.…Argument function là expression nên conversion khi truyền: `char`, `short` thành `int`, `float` thành `double`.

—The C Programming Language, ấn bản đầu

Đó là type promotion, với integer gọi integral promotion. ANSI giữ tự động nhưng giảm vài chỗ. Chuẩn nói:

Khi chạy đoạn

```
char c1, c2;
/* ... */
c1 = c1 + c2;
```

integral promotion buộc abstract machine promote mỗi variable lên size `int`, cộng hai `int`, truncate tổng. Nếu cộng hai `char` không overflow exception, chạy thật chỉ cần cùng kết quả, có thể bỏ promotion.

Tương tự đoạn

```
float f1, f2;
double d;
/* ... */
f1=f2*d;
```

có thể nhân số học single-precision nếu chắc giống double-precision (ví dụ thay `d` constant `2.0`, type `double`).

—Chuẩn ANSI C, Mục5.1.2.3

Bảng 8-1 liệt kê promotion thông thường, trong mọi expression, không chỉ operator với mixed-type operand.

Bảng8-1. Type promotion C

| Type gốc | Thường promote thành |
|---|---|
| `char` | `int` |
| `bit-field` | `int` |
| `enum` | `int` |
| `unsigned char` | `int` |
| `short` | `int` |
| `unsigned short` | `int` |
| `float` | `double` |
| `array` của bất cứ gì | `pointer` tới thứ đó |

Integral promotion: `char, short` `int`, bit-field type (bản signed/unsigned), enumeration promote `int` nếu biểu diễn được, không thì `unsigned int`. ANSI cho bỏ nếu compiler bảo đảm cùng kết quả, thường literal operand.

### Giáo điều software

![image](images/ch08/img08-01.png)

Chú ý! Rất quan trọng — Argument cũng promote!

Conversion ngầm còn ở truyền argument. K\&R argument là expression nên promote. ANSI có prototype thì không, không có thì có. Argument mở rộng được thu về size khai báo trong function gọi.

Vì vậy một format `printf()` `"%d"` dùng mọi type `short`, `char`, `int`. Truyền gì cũng thật đặt `int` lên stack/register hay nơi khác, `printf` <sup>\[1\]</sup> hoặc callee xử lý thống nhất. Thử printf type dài hơn `int` như `long long` Sun; thiếu specifier `%lld,` không đúng vì printf mặc định `int` khi không thông tin thêm.

<sup>\[1\]</sup> Dù prototype `printf()` trong scope, kết thúc ellipsis:

```
int printf(const char *format, ...);
```

Nghĩa variable argument. Không thông tin parameter ngoài đầu, luôn usual promotion.

Conversion C rộng hơn ngôn ngữ khác vốn chỉ khớp operand khác type. C còn nâng type khớp nhỏ hơn dạng chuẩn `int`, `double`. Ba điểm:

- Vá víu từ mong đơn giản compiler đầu. Cùng operand size đơn giản code generation. Parameter stack cùng length, runtime chỉ cần count không size. Mọi floating-point double thì PDP-11 đặt mode double, khỏi theo precision.

- Lập trình C rất nhiều không biết promotion được, nhiều người vậy.

- Không chuyên gia nếu không biết, đặc biệt prototype phần sau.

## Đau prototype

Prototype ANSI để tin cậy, giảm lớp lỗi hard-to-find mismatch formal, actual parameter type.

Function declaration dạng mới include parameter declaration; definition đổi tương tự khớp. Compiler kiểm use với declaration. Ôn dạng cũ, mới Bảng8-2.

Bảng8-2. Declaration function K\&R C so prototype ANSI C

| K\&R C | ANSI C |
|---|---|
| Declaration: <br> `int foo();` | Prototype: <br> `int foo(int a, int b);` <br> hoặc <br> `int foo(int, int );` |
| Definition: <br> `int foo(a,b) int a; int b; { ... }` | Definition: <br> `int foo(int a, int b) { ... }` |

Declaration K\&R khác prototype ANSI, definition cũng khác. ANSI "không parameter" `int foo(void);`, cũng khác C cổ.

ANSI không thể buộc chỉ prototype vì phá tương thích hàng tỷ dòng pre-ANSI. Chuẩn chính thức coi declarator ngoặc trống không type obsolescent, có thể bỏ tương lai. Trước mắt hai kiểu cùng vì nhiều pre-ANSI. Prototype tốt có nên khắp, thêm code cũ bảo trì? Dứt khoát không!

Không chỉ syntax, còn semantics khác tinh tế, có thể không mong. K\&R truyền ngắn int được int, float double. Callee body tự thu hẹp nếu khai báo vậy.

Sao nở rồi thu? Đơn giản compiler, cùng size chuẩn. Ít type dễ truyền, nhất K\&R rất cũ chưa truyền struct. Đúng ba type int,double,pointer, mọi argument chuẩn, callee thu nếu cần.

Có prototype thì không default promotion. Prototype `char` thì truyền `char` thật. Definition new-style type trong ngoặc tên, compiler giả parameter đúng khai báo, không widening.

### Nơi prototype hỏng

Bốn trường hợp:

1\. Declaration K\&R, definition K\&R

Chạy đúng, truyền type promote

2\. Declaration ANSI (prototype), definition ANSI

Chạy đúng, truyền type thực

3\. Declaration ANSI (prototype), definition K\&R

![](images/ch08/img08-02.png)![](images/ch08/img08-02.png)

Dùng narrow type thì hỏng! Truyền type thực, function đợi promote.

4\. 4\. Declaration K\&R, definition ANSI

![](images/ch08/img08-02.png)![](images/ch08/img08-02.png)

Dùng narrow type thì hỏng! Truyền promote, function đợi thực.

Thêm prototype definition K\&R có `short` sẽ truyền `short`, definition đợi `int`, lấy rác cạnh parameter. Ép3,4 chạy bằng prototype type rộng nhưng kém portable, rối bảo trì. Ví dụ hai fail:

File1

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

File2:

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

Output dự kiến:

```
olddef: float= 10.0, char =3
newdef: float= 10.0, char =3
```

Output thực:

```
olddef: float= 524288.000000, char =4
newdef: float= 2.562500, char =0
```

Cùng file lời gọi (file2) đổi hành vi. Compiler thấy prototype, definition K\&R cùng, báo `olddef()` mismatch. Đặt `newdef()` definition trước call tự đúng vì definition làm prototype. Đặt sau call nên cảnh báo. C++ bắt prototype, có thể cám dỗ thêm willy-nilly để compiler C++ brute-force code K\&R cổ.

#### Thử thách lập trình

![image](images/ch08/img08-03.png)

Đánh lừa prototype

Thử ví dụ, tạo function file riêng:

```
void banana_peel(char a, short b, float c) {
    printf("char = %c, short =%d, float = %f \n",
a,b,c);
}
```

File riêng main gọi `banana_peel()`.

1\. Thử có/không prototype, prototype lệch definition.

2\. Đoán trước thử. Kiểm bằng `union` lưu value type này, lấy type size khác.

3\. Đổi parameter order cả declaration/definition ảnh hưởng value callee không? Giải thích. Compiler bắt bao nhiêu lỗi?

Prototype cho kiểm use/declaration. Không trộn cũ mới vẫn không bảo đảm prototype khớp definition. Thực tế đặt prototype header include trong file function declaration, compiler thấy cả hai bắt mismatch. Khốn người không làm!

#### Mẹo thực hành hữu ích

![image](images/ch08/img08-04.png)

Không trộn kiểu cũ mới declaration, definition

Đừng trộn. K\&R-style declaration header thì syntax K\&R definition.

```
int foo();    int foo(a,b) int a; int b; { /* ... */ }
```

Prototype ANSI thì definition C-style ANSI.

```
int foo(int a, int b);    int foo(int a, int b) { /* ...
*/ }
```

Có thể cơ chế hoàn chỉnh kiểm function qua file, đặc biệt cho printf variable argument như hiện. Áp syntax cũ cũng được. Chỉ constraint mỗi call nhất quán tên,count,type parameter và return với definition. Ada có tiền lệ. C làm bằng pre-linker pass. Gợi ý lớn: lint.

Ủy ban thận trọng, có lẽ quá. Rationale đau đầu bỏ hạn chế external name six-character case-insensitive không, cuối giữ, hơi yếu theo chuyên gia. Nên cắn răng giải hoàn chỉnh dù pre-linker thay giải một phần kỳ quặc C++ có quy ước, syntax, semantics, limit riêng.

## Lấy char không carriage return

MS-DOS programmer gặp UNIX hỏi "đọc terminal không buộc `RETURN` sao?" Mặc định input cooked, xử lý raw trước cho line-editing như backspace/delete, không truyền key cho program. Tiện nhưng read chưa nhận data đến `RETURN` báo hết dòng. Thực line-by-line, ứng dụng có lúc cần từng key.

Thiết yếu nhiều software, PC dễ. Library thường `kbhit()` báo có char chờ. Microsoft/Borland `getch()` hoặc echo `getche()` đọc character-by-character không chờ dòng.

Sao ANSI không chuẩn hóa? Mỗi hệ khác, mất portable. Phản đối `kbhit()` vì chủ yếu game, nhiều terminal I/O khác chưa chuẩn, không nên hứa OS khó cung cấp. Ủng hộ vì chủ yếu game, người viết game không cần vô số tính năng khác. Dù quan điểm nào X3J11 lỡ cơ hội củng cố C cho thế hệ sinh viên viết game UNIX.

### Mẹo thực hành hữu ích

![image](images/ch08/img08-04.png)

Phím sếp

Game quan trọng hơn tưởng. Microsoft biết, thêm boss key mọi game mới. Thấy sếp lén tới nhấn biến mất, nhìn như làm việc. Vẫn tìm boss key thu MS-Windows lộ window system đúng bên dưới…

UNIX có cách khó,dễ character-by-character. Dễ để stty làm, gián tiếp nhưng code đơn giản.

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

Dòng cuối `system("stty cooked");` cần vì terminal characteristic còn sau program. Đặt mode kỳ thì giữ, khác environment variable biến khi process mất.

Raw I/O blocking read, không char thì chờ. Nonblocking dùng `ioctl()` fine control terminal, biết key SVr4. Code chỉ đọc nếu có chờ. Gọi polling vì liên tục hỏi device đã có chưa.

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

Kiểm errno sau library call

Dùng system call như `ioctl()`, nên kiểm global variable `errno` thuộc ANSI C.

Library/system call gặp vấn đề đặt `errno` nguyên nhân. Value `errno` chỉ hợp lệ khi có vấn đề, call có cách báo, thường return code.

Ví dụ:

```
errno=0;
if (ioctl(0, FIONREAD, &i)<0) {
    if (errno==EBADF) printf("errno: bad file number");
    if (errno==EINVAL) printf("errno: invalid
argument");}
```

Có thể gói checking function gọi sau mỗi system call khi debug. Giúp khoanh lỗi nhiều. Library `perror()` in message khi biết có lỗi.

Quan tâm single-character I/O thường cả display control, curses có routine portable cho cả. Curses (nghĩ cursor) screen management trên mọi nền phổ biến. Viết main trên bằng curses thay stty:

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

Compile `cc foo.c -lcurses`, output gọn hơn. Sách Nutshell UNIX Curses Explained (không phải sách chửi thề programmer như tưởng) mô tả tốt. Library chỉ func-tions character-based screen, mẫu chung thấp hơn bit-mapped graphics library nhưng portable hơn.

Cuối có non-polling read, OS gửi signal mỗi input sẵn.

Dùng interrupt-driven I/O cho main xử lý khác khi không input, hiệu quả nếu thưa input, nhiều việc. Program Interrupt-driven phức tạp khó làm nhưng tận dụng thời gian chờ. Thread giảm nhu cầu interrupt-driven I/O.

#### Thử thách lập trình

![image](images/ch08/img08-03.png)

Viết routine input Interrupt-Driven trên hệ mình

MS-DOS dễ Interrupt-driven: service tối giản dễ gạt, lấy char thẳng port. SVr4:

1\. Handler đọc character khi OS signal sẵn. Bắt `SIGPOLL`.

2\. Handler đọc, reset mình mỗi lần, echo và quit nếu 'q'. Chỉ giảng dạy, thực tế gọi standard library trong handler thường undefined.

3\. `ioctl()` báo OS gửi signal mỗi stdin input. Xem streamio, command `I_SETSIG`, argument

```
S_RDNORM.
```

4\. Thiết lập xong làm khác đợi input, tăng counter, handler in counter.

Mỗi key gửi `SIGPOLL` process, handler đọc, reset.

## Triển khai finite state machine trong C

FSM là khái niệm toán hữu ích trong program, giao thức qua số subroutine hữu hạn (state), mỗi xử lý rồi chọn state sau thường theo input tiếp.

Dùng làm control structure, well-suited program lặp action tùy input. Máy coin-operated ví dụ, state nhận xu,chọn hàng,nhả hàng,trả lại tiền. Input xu, output hàng.

Table giữ mọi state, action khi vào. Action cuối tính next (thường lookup state/input), từ initial state, có thể error state vì input sai, tiếp đến end state.

Nhiều cách C, thường array pointer function, khai báo:

```
void ( *state[MAX_STATES] )();
```

Biết tên thì initialize:

```
extern int a(), b(), c(), d();
int (*state[])() = { a, b, c, d };
```

Gọi qua pointer array:

```
(*state[i])();
```

Mọi function cùng argument, return (trừ array element union…). Function pointer lạ, có thể bỏ pointer, call như

```
state[i]();
```

hoặc thậm chí

```
(******state[i])();
```

Quirk không hay ANSI phổ biến: gọi function hay qua pointer mọi mức indirection cùng syntax, array cũng vậy. Suy yếu thêm "declaration giống use" thiếu sót.

### Thử thách lập trình

![image](images/ch08/img08-03.png)

Viết FSM program

Triển khai declaration analyzer Chương3 như FSM.

1\. Ôn decoder ring Hình 3-3 trang76, sơ đồ state đơn giản! Sửa cdecl Chương3 (đã viết rồi chứ?).

2\. Đầu code chuyển state, action chỉ in được gọi, debug hết.

3\. Thêm xử lý, decode declaration.

Decoder ring phần lớn state nối tuần tự bất kể input, không cần table khớp state/input, chỉ variable pointer-to-function. Mỗi state gán next, main loop gọi đến end/error.

So FSM-based với non-FSM dễ code/debug? Thêm action, đổi order?

Tinh vi hơn state function trả pointer generic successor, cast đúng, không global. Ít hơn dùng switch trong loop, gán control variable làm FSM người nghèo. Cuối nếu state cần nhiều argument khác, dùng count và string pointer array như main. `int` `argc,` `char` `*argv[]` rất tổng quát, mượn function riêng được.

## Software khó hơn hardware!

Tên ngược — software dễ đổi nhưng mọi mặt khác khó hơn? Vì phát triển đúng khó, cần đơn giản nhất. Mọi ngôn ngữ nên code dễ debug: khi viết cho debugging hook.

### Mẹo thực hành hữu ích

![image](images/ch08/img08-04.png)

Debugging hook

Đa số debugger gọi function từ command line được! Data structure phức tạp, viết function duyệt in. Không call đâu trong code nhưng thuộc executable, là debugger hook.

Dừng breakpoint, gọi print routine thủ công kiểm integrity. Chỉ ra thì hiển nhiên, chưa thấy thì không.

Đã gợi FSM hai pha state rồi action. Đừng lẫn phát triển tăng dần với "debug code thành tồn tại" thường người mới hay deadline too-strict: viết vội rồi vài tuần đổi phần hỏng cho chạy. Ai phụ thuộc component vò tóc. Sendmail, make thường được coi như vậy nên ngôn ngữ lệnh tệ, khó học. Không riêng bạn, ai cũng khó.

Code dễ debug là chia phần, cấu trúc chạy trước, rồi mới refinements phức tạp, tuning hiệu năng, optimization thuật toán.

#### Mẹo thực hành hữu ích

![image](images/ch08/img08-04.png)

Hash có phong cách

Hash tăng tốc truy cập table, thay serial search nhảy tới phần tử khả dĩ.

Nạp table cẩn thận không serial, hash function biến data value thành 0…tablesize-1, index thử lưu record.

Slot có rồi thì tìm tiến tới trống.

Hoặc linked list từ element, thêm cuối (đầu nào cũng được), hoặc hash table thứ hai.

Lookup không từ zero, hash value tìm từ điểm đó.

Tối ưu đã kiểm chứng, mọi systems software: database,OS,compiler.

Nếu đảo hoang chỉ mang một structure, hash table.

Đồng nghiệp viết program lưu filename, thông tin file trong table struct, chọn hash. Đây code debuggability: không làm tất cả một cú, đầu hash luôn zero, đơn giản nhất:

```
/* hash_file: Placeholder for more sophisticated future
routine */
int hash_filename (char *s)
{
 return 0;
}
```

Caller code:

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

Như không hash, mọi element linked list từ zero, dễ debug khỏi tính chỗ. Nhanh làm phần khác vì không lo tương tác hash. Main hoàn hảo, đo hiệu năng, kích hoạt hash: thay two-line một function. Bản hiện "não, đau, lợi":

```
int hash_filename (char *s)
{
 int length = strlen(s);
 return (length+4*(s[0]+4*s[length/2])) % FILE_HASH;
}
```

Dành thời gian chia nhỏ đôi khi nhanh nhất giải.

#### Thử thách lập trình

![image](images/ch08/img08-03.png)

Viết hash program

Gõ đoạn trên, bổ sung type,data,code thiếu để chạy, rồi (kinh!) debug thành tồn tại.

## Cast cách nào, vì sao

Từ đầu C "cast" vừa type conversion vừa type disambiguation. Nói

```
(float) 3
```

là conversion, bit thật đổi. Nói

```
(float) 3.0
```

là disambiguation, compiler đặt bit đúng ngay. Có người nói so-named vì giúp thứ hỏng khập khiễng đi.

Cast elementary type dễ: tên mới như `int` trong ngoặc trước expression. Type phức khó rõ. Pointer void biết thật chứa function pointer, làm cast,gọi một statement sao?

Cast phức cũng theo three-step:

1\. Xem declaration object muốn gán kết quả cast.

2\. Bỏ identifier, storage class như `extern`, ngoặc phần còn.

3\. Viết ngay trái object muốn cast.

Thực tế hay cần cast qsort(), bốn parameter, một pointer comparison routine. Khai báo:

```
void qsort(void *base, size_t nel, size_t width,
        int (*compar) (const void *, const void *));
```

Gọi qsort đưa pointer routine yêu thích làm compar. Routine nhận actual type thay void \*, trông:

```
int intcompare(const int *i, const int *j)
{
      return(*i - *j);
}
```

Không khớp chính xác compar() nên cần cast. <sup>\[2\]</sup> Giả array a mười integer, theo ba bước call:

<sup>\[2\]</sup> Máy quái, ít ai dùng có pointer size tùy type thì cast trong routine thay call. Chuyển kiến trúc tốt sớm.

```
qsort(
     a,
     10,
     sizeof(int),
     (int (*)(const void *, const void *)) intcompare
);
```

Ví dụ phi thực tạo pointer printf() bằng

```
extern int printf(const char*,...);
void *f = (void*)printf;
```

Gọi qua pointer properly-cast như:

```
(*(int(*)(const char*,...))f)("Bite my shorts. Also my chars
and ints\n");
```

## Giải trí nhẹ — Cuộc thi C khó hiểu quốc tế

C hợp mọi sức mạnh assembly với mọi ease-of-use của assembly.

—Tục ngữ nông dân cổ

Ngôn ngữ nào cũng lạm dụng được. Người giỏi viết code căng đến đau mắt, khoe phòng bên thách hiểu, sáu tháng sau mình không hiểu. Ngôn ngữ nào cũng được, C dễ hơn.

IOCCC do Landon Curt Noll,Larry Bassel tổ chức USENET hằng năm từ1984. Landon thấy source Bourne shell "quá kỳ", tự hỏi cố làm khó hiểu thay side effect thì xa đến đâu.

Truyền thống năm: nhận mùa đông, chấm xuân, công bố Usenix hè, khoảng mười loại "lạm dụng rule lạ nhất","source layout sáng tạo","one-liner hay", v.v. Best of show là code khó đọc,kỳ nhất vẫn chạy.

Vui, mở kiến thức bất ngờ dù dự hay phân tích prize-winning code. Năm1987 David Korn Bell Labs bài thắng:

```
main() { printf(&unix["\021%six\012\0"],(unix)["have"]+"fun"-
0x60);}
```

In gì? Không "have fun"! David viết Korn shell cùng tên, sạch hơn /bin/sh version7, có lẽ cuộc thi là van xả hacker vui.

1988 Gopi Reddy gửi cdecl khó hiểu. Cần150 dòng không obfuscate, đây dưới chục:

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

Lạm dụng `?`, `,` hơi cũ nay nhưng lúc đó mới, ngắn kinh ngạc. Figur-ing cách chạy để bài tập (Ha, luôn muốn nói!). Hai routine `T()` lex token, nói identifier/number, `D()` parse. Chạy preprocessor, format, đổi mọi `?` sang `if`, lặp đến đọc được.

Ví dụ cuối BASIC interpreter nghiên cứu sinh London Diomidis Spinellis, khoảng1.500 character! Kèm manual cách dùng, BASIC mẫu.

### Giáo điều software

![image](images/ch08/img08-01.png)

DDS-BASIC Interpreter (Phiên bản1.00)

Lệnh trực tiếp: `RUN` `LIST` `NEW` `BYE` `OLD` filename `SAVE` filename

Lệnh chương trình:

tên variable A đến Z, RUN khởi tạo 0 FOR var = exp TO exp NEXT variable GOSUB exp RETURN GOTO exp IF exp THEN exp INPUT variable PRINT string PRINT exp var = exp REM any text END

Expression (theo precedence):

expression trong ngoặc

number (0 đầu octal,0x hex, còn decimal), variable

Unary -

\* /

\+ -

\= \<\>

\> \<

\<= \>=

\* và + còn dùng boolean AND, boolean OR

Boolean expression cho0 false,1 true

Chỉnh sửa:

Line editor nhập lại dòng.

Số dòng không gì sau xóa dòng.

Input format:

Token định vị tự do trên dòng.

Không space trước số dòng. Đúng một space giữa OLD/SAVE và filename.

MỌI INPUT PHẢI CHỮ HOA.

Giới hạn:

Số dòng:1–10000 Chiều dài:999 character FOR lồng:26 GOSUB:999 mức Program: cấp động Expression:-32768–32767 máy 16-bit,

\-2147483648–2147483647 máy 32-bit

Kiểm lỗi / báo lỗi:

Không kiểm lỗi.

"core dumped" chỉ lỗi syntax/semantic.

Môi trường host:

ANSI C, K\&R C truyền thống

Character set ASCII hoặc EBCDIC

48 Kbyte memory

BASIC mẫu là game lunar lander cũ:

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

Gõ vào file `LANDER.BAS`, compile/chạy bằng lệnh BASIC interpreter:

```
OLD LANDER.BAS
RUN
```

Interpreter BASIC khó hiểu trông:

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

Chú ý chữ "l" với số "1"! Bên left-hand assignment phải "l".

Program kinh ngạc, đáng reverse-engineering gỡ obfuscation xem chạy. Có thể dự IOCCC, đọc comp.lang.c Usenet, hướng dẫn cuối thu. Cẩn thận người thắng giỏi nhất thế giới, đang làm tệ nhất.

#### Lời giải lập trình

![image](images/ch08/img08-05.png)

Type promotion Mix-Up trong prototype

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

Code khiến OS SVr4-based gửi interrupt mỗi character stdin.

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

Dùng sigset() thay signal() khỏi re-register handler mỗi lần. Output:

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
