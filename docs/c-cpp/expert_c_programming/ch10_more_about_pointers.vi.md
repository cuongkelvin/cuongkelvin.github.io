# Chương 10. Thêm về pointer

Đừng quên chỉ tay ai, ba ngón mình chỉ lại…

—Tục ngữ điệp viên đa nghi

layout multidimensional array…array pointer là Iliffe vector…ragged array…truyền one-dimensional function…pointer truyền multidimensional…pointer trả array…tạo dynamic array…giải trí nhẹ — giới hạn chứng minh program

## Layout multidimensional array

Ít dùng systems programming nên C không runtime phức tạp như ngôn ngữ khác. Dynamic array phải tự cấp/thao tác pointer thay compiler. Multidimensional parameter tổng quát không diễn được. Chương nói các vấn đề. Đã quen memory layout, khai

```
char pea[4][6];
```

có người nghĩ row array two-dimensional xếp bảng Hình10-1.

Hình 10-1. Memory layout tưởng tượng array Two-dimensional

![image](images/ch10/img10-01.png)

Đừng cho người vậy đỗ xe bạn. Storage, reference element thật linear memory Hình10-2.

Hình 10-2. Memory layout thực array Two-dimensional

![image](images/ch10/img10-02.png)

Rule subscript Chương9 trang242 đánh l-value `pea[i][j]`: lấy `pea[i]`, char offset `[j]` từ đó. Compiler resolve `pea[i][j]`:

```
*(*(pea+i)+j)
```

Nhưng nghĩa "`pea[i]`" tùy `pea` định thế nào! Quay lại sau, đầu data structure C phổ biến quan trọng: array one-dimensional pointer string.

## Array pointer là Iliffe vector

Giống array char two-dimensional bằng array pointer onedimensional, mỗi pointer string. <sup>\[1\]</sup> Khai báo:

<sup>\[1\]</sup> Đơn giản chút: thật pointer một character. Dạng pointer-to-character để mở khả năng char cạnh tạo string ngầm. `char (* rhubarb[4])[7];` thật array pointer string nhưng không dùng vì hạn chế pointed-to array đúng bảy char không cần.

```
char * pea[4];
```

### Giáo điều software

![image](images/ch10/img10-03.png)

Nhắc syntax declaration

`char *turnip[23]` khai 23-element array pointer character (hay character-string, không biết từ declaration). Nghĩ ngoặc `(char *) turnip[23]`. Không như đọc trái phải pointer tới 23-element array vì index bracket precedence cao asterisk. Chương3 đầy đủ.

Array pointer hỗ trợ multidimensional gọi Iliffe vector, display, dope vector. Anh còn display là vector pointer active stack frame lexical procedure bao, thay static link rồi linked list. Kỹ thuật mạnh ngoài C. Hình10-3.

Hình 10-3. Array Pointers-to-String

![image](images/ch10/img10-04.png)

Phải initialize pointer tới memory string, compile literal hoặc runtime:

```
for (j=0;j<=4;j++) {
    pea[j] = malloc( 6 );
```

Cách khác malloc toàn x nhân y data array,

```
malloc(row_size * column_size * sizeof(char) ) ;
```

rồi loop gán pointer vị trí trong vùng, contiguous memory thứ tự C static array, ít bookkeeping malloc nhưng không free riêng string được.

#### Giáo điều software

![image](images/ch10/img10-03.png)

Thấy `squash[i][j]` — chưa biết khai thế nào!

Việc double-subscript two-dimensional, one-dimensional array pointer đều được, nhìn `squash[i][j]` không biết:

```
int squash[23][12];    /* array [23] of array[12] of int
*/
```

hoặc

```
int * squash[23];      /* an Iliffe vector of 23
pointers-to-int */
```

hoặc

```
int ** squash;         /* pointer to a pointer to int */
```

hoặc cả

```
int (* squash)[12];    /* pointer to array-of-12-ints */
```

Giống không biết trong function truyền array/pointer, cùng lý do array name l-values decay pointer.

Cùng `squash[i][j]` truy cập mọi definition nhưng kiểu access khác.

Như array của array, Iliffe char hai index `pea[i][j]`. Rule Chương9 trang242 khiến `pea[i][j]`:

```
* ( *(pea + i) + j )
```

Quen không? Chính expression multidimensional phân rã, nhiều sách giải vậy. Nhưng dù source subscript, pointer expression giống, reference mỗi case khác. Bảng 10-1, 10-2.

Bảng 10-1. `char a[4][6]` — Array-of-Arrays

`char a[4][6]` — Array-of-Arrays, symbol table compiler giữ `a` address9980

runtime bước1: lấy `i`, scale row6 byte, cộng9980

runtime bước2: lấy `j`, scale element1 byte, cộng kết quả trước

runtime bước3: lấy nội dung address (9980 + `i*`scale-factor1 + `j*`scale-factor2)

`a[i][j]`

Definition `char a[4][6]` nói `a` array\[4\], mỗi element array\[6\] mỗi element `char`. Việc look-up đến array thứ i trong bốn (bước i array six-byte), lấy char thứ j.

Bảng 10-2. `char *p[4]` — Array Pointers-to-String

`char *p[4]` — Array Pointers-to-String

symbol table compiler giữ `p` address4624

runtime bước1: lấy `i`, scale pointer4 byte, cộng4624

runtime bước2: lấy nội dung (4624+ scaled `i`), giả5081

runtime bước3: lấy `j`, scale element1 byte, cộng5081

runtime bước4: lấy nội dung (5081+`j`)

`p[i][j]`

Definition `char * p[4`\] nói `p` array\[4\] pointer-to-char. Việc look-up không hoàn thành trừ pointer đã trỏ char/array char. Giả đã value, look-up đến element thứ i, lấy pointer, cộng j, lấy nội dung address.

Do rule2 Chương8: subscript tương đương offset pointer. `turnip[i]` chọn element pointer, `[j]` cho `*(pointer + j)` tới char. Mở rộng a\[2\],p\[2\] cùng char chương trước.

## Pointer cho ragged array

Iliffe vector kỹ thuật compiler-writing cũ từ Algol-60, tăng tốc reference, máy limited-memory chỉ giữ phần array main. Nay ít phù hợp nhưng hữu ích table row khác length, truyền string array. Cần50 string dài tối đa255 thì khai two-dimensional:

```
char carrot[50][256];
```

Dành256 char cho mỗi trong50 string dù chỉ một hai byte, dùng nhiều lãng phí. Array pointers-to-strings cho level2 khác size, Hình10-4.

Hình 10-4. Ragged string array

![image](images/ch10/img10-05.png)

Khai pointer string, cấp khi cần tiết kiệm. "Ragged" vì right-hand không đều. Điền Iliffe pointer string có sẵn hoặc cấp bản mới, Hình10-5.

Hình 10-5. Tạo ragged string array

```
                 char * turnip[UMPTEEN];
                 char my_string[] = "your message here";
        /* share the string */          /* copy the string */
turnip[i] = &my_string[0];       turnip[j] =
                                     malloc( strlen(my_string)
+ 1 );
                                 strcpy(turnip[j], my_string);
```

Nếu được đừng copy string. Hai structure cần thì copy pointer nhanh ít space hơn. Iliffe có thể string khác page, kém locality, nhiều paging tùy cách,tần suất.

### Mẹo thực hành hữu ích

![image](images/ch10/img10-06.png)

Compiler đổi array/pointer parameter thế nào

Rule array name thành pointer argument không đệ quy: array array thành pointer array, không pointer pointer.

Argument: Khớp formal parameter:

array của array `char c[8][10];` `char (*c)[10];` pointer array array pointer `char *c[15];` `char **c;` pointer pointer pointer array `char (*c)[64];` `char (*c)[64];` không đổi pointer pointer `char **c;` `char **c;` không đổi

Thấy `char ** argv` vì `argv` array pointer (`char *argv[])`, decay pointer element, tức pointer pointer. Nếu `argv` thật array array `char argv[10][15])` sẽ decay `char (* argv)[15] (` tức pointer array char, không `char ** argv.`

### Chỉ dành sinh viên nâng cao

Xem Hình 9-8 trang255 storage multidimensional, variable compatible type trái khớp chính declaration array parameter bảng trên.

Không lạ: Hình 9-8 array expression decay, bảng array argument decay, rule tương tự context.

Hình 10-6 mọi code hợp lệ:

- Ba function cùng argument array\[2\]\[3\]\[5\] hoặc pointer array\[3\]\[5\] int.

- Ba variable `apricot,` `p,` `*q` khớp parameter cả ba.

Hình 10-6. Mọi tổ hợp code hợp lệ

```
my_function_1( int fruit [2][3][5] ) { ; }
my_function_2( int fruit [][3][5] ) { ; }
my_function_3( int (*fruit)[3][5] ) { ; }

                         int apricot[2][3][5];

                         my_function_1( apricot );
                         my_function_2( apricot );
                         my_function_3( apricot );

                         int (*p) [3][5] = apricot;

                         my_function_1( p );
                         my_function_2( p );
                         my_function_3( p );

                         int (*q)[2][3][5] = &apricot;

                         my_function_1( *q );
                         my_function_2( *q );
                         my_function_3( *q );
```

#### Thử thách lập trình

![image](images/ch10/img10-07.png)

Kiểm thử

Gõ C Hình 10-6 tự thử.

## Truyền array One-Dimensional cho function

Array One-dimensional mọi type làm argument, parameter pointer đầu nên cần quy ước tổng size. Hai cách:

- Thêm parameter count (`argc` làm vậy)

- Element cuối value riêng không thể khác trong data (nul string).

Array Two-dimensional khó hơn, pointer row đầu. Cần quy ước end row, end mọi row, mỗi cái dùng hai cách one-dimensional trên. Tăng pointer next row nhưng biết hết sao? Thêm row value out-of-bound không khác có, nếu tồn tại; tăng thì kiểm row. Hoặc thêm parameter count row.

## Dùng pointer truyền multidimensional array cho function

Đánh extent bằng cách xấu trên được, nhưng khai two-dimensional parameter mới rắc rối. C không diễn "bound đổi mỗi call". Compiler cần bound tạo index code. Runtime khả thi, nhiều ngôn ngữ làm nhưng không triết C. Tốt nhất bỏ two-dimensional, đổi `array[x][y]` sang one-dimensional `array[x+1]` pointer `array[y]`. Đã giải dạng này, đặt null tại `array[x+1]` làm end.

### Giáo điều software

![image](images/ch10/img10-03.png)

C không truyền multidimensional array tổng quát cho function được

Cần mọi dimension size scale arithmetic, C không truyền data đổi mỗi call giữa actual/formal. Phải cho mọi dimension trừ trái nhất, ràng buộc actual khớp tất cả đó.

```
invert_in_place( int a[][3][5] );
```

gọi bằng:

```
int b[10][3][5]; invert_in_place( b );
int c[999][3][5]; invert_in_place( c );
```

Nhưng array 3-dimensional tùy ý:

```
int fails1[10][5][5];  invert_in_place( fails1 );/* does
NOT compile */
int fails2[999][3][6]; invert_in_place( fails2 );/* does
NOT compile */
```

compile thất bại.

Array hai chiều trở lên không parameter tổng quát C. Size biết định trước được, tổng quát không.

Rõ nhất prototype:

### Thử1

```
my_function( int my_array [10][20] );
```

Đơn giản nhưng ít hữu ích, chỉ10x20 integer. Muốn tổng quát mọi size. Dimension quan trọng nhất không cần, còn lại + base đủ bước qua row.

### Thử2

Bỏ dimension đầu hợp lệ:

```
my_function( int my_array [][20] );
```

Vẫn row buộc20 int. Khai tương đương:

```
my_function( int (* my_array)[20] );
```

Ngoặc `(* my_array)` cần để pointer tới 20-element array, không array20 pointers-to-int. Vẫn buộc chiều phải20.

#### Giáo điều software

![image](images/ch10/img10-03.png)

Conformant array

Pascal gốc thiếu như C, không truyền array khác size cùng function, tệ hơn không cả one-dimensional. Bound thuộc signature, mismatch nếu size khác. Code fail:

```
var apple : array[1..10] of integer;
procedure invert( a: array[1..15] of integer);
invert(apple); { fails to compile! }
```

Những language-meisters chuẩn hóa nghĩ conformant array, tên hay hơn "làm họ rối". Giao thức truyền size actual/formal, không rõ người thường, không ngôn ngữ chủ đạo khác, code:

```
procedure a(fname: array[lo..hi:integer] of char);
```

`lo`, `hi` tự điền bound actual mỗi call, nhiều người rối. Giải tổng quát lại cấm case đơn giản bound literal cố định:

```
1 procedure a(fname: array[1..70] of char);
E --------------------------^--- Expected identifier
```

Trái kỳ vọng gây nhiều support call. Nhóm Sun vài tháng lại escalation "Pascal compiler bug". Còn array character Pascal-conformant không string type vì không denote array type, không dùng nơi cần string! Gây khổ nhất trừ interactive I/O. Tệ nữa đang bàn thêm C.

### Thử3

Bỏ two-dimensional, Iliffe one-dimensional pointer. Nhớ main `char * argv[];`, `char ** argv;` dễ giải. Truyền pointer element0 như sau cho two-dimensional:

```
my_function( char **my_array );
```

Chỉ sau đổi array two-dimensional thành array pointer vector!

Đẹp là cho array pointer string tùy ý, nhưng chỉ pointer array, pointer string. Cả string,pointer có out-of-bound end (`NUL`, `NULL,`). Type khác không out-of-bound value chắc, không built-in biết end dimension. Ngay string thường count `argc`.

### Thử4

Cuối bỏ multidimensional, tự index. Groucho Marx hẳn nghĩ cách vòng này khi nói "hầm cranberry như applesauce, giống plum hơn rhubarb".

```
char_array[ row_size *i+j]=...
```

Dễ sai, tự hỏi dùng compiler làm gì nếu tự tay vậy.

Tổng hợp fixed cùng size truyền dễ, size tùy:

- Một chiều ổn nhưng count/end-marker out-of-bound. Không biết extent là

nguyên nhân `gets()` không an toàn dẫn sâu Internet.

- Hai chiều không trực tiếp; viết lại Iliffe one-dimensional dùng cùng subscript. String chịu được, type khác count/end-marker out-of-bound, dựa giao thức caller/callee.

- Ba trở lên không type nào, phải chia lesser-dimension array.

Thiếu này cố hữu C, khó viết program như numerical analysis.

## Pointer trả array từ function

Trước truyền vào, đây trả ra.

Không trực tiếp trả array nhưng pointer tới gì cũng được. Declaration theo use, ví dụ:

```
int (*paf())[20];
```

`paf` function trả pointer array20 int, definition:

```
int (*paf())[20] {
    int (*pear)[20];          /* declare a pointer to 20-int
array */
    pear = calloc( 20,sizeof(int));
    if (!pear) longjmp(error, 1);
    return pear;
}
```

Gọi:

```
int (*result)[20];            /* declare a pointer to 20-int
array */
       ...
result = paf();               /* call the function */

(*result)[3] = 12;            /* access the resulting array */
```

Hoặc nhát, dùng struct:

```
struct a_tag {
              int array[20];
           } x,y;

struct a_tag my_function() { ... return y }
```

còn cho:

```
x=y;
x=my_function();
```

đổi lấy selector `x` thêm khi truy cập:

```
x.array[i] = 38;
```

Đừng trả pointer auto variable (Chương2).

### Mẹo thực hành hữu ích

![image](images/ch10/img10-06.png)

Sao null pointer crash `printf`?

Hỏi mãi "null argument printf sao crash?" Muốn code:

```
char *p = NULL;
    /* . . . */
printf("%s", p );
```

không crash, khách "HP/IBM/PC không crash". Muốn null in string trống.

Chuẩn buộc `%s` pointer tới array character. `NULL` không vậy (pointer nhưng không array char), undefined.

Code sai, hỏi báo lúc nào? Buộc printf nhận null thì routine libc nào nữa? strcmp() null làm gì? Muốn printf đoán ý dẫn rắc rối lớn sau hay kiểm sớm?

Sun libc chọn sau, vendor khác đầu thân thiện hơn có lẽ nhưng kém an toàn. Nhất quán nữa, routine nào mở null?

## Dùng pointer tạo và dùng dynamic array

Chưa biết data size dùng dynamic. Hầu hết ngôn ngữ cho size runtime vừa đủ, Algol-60,PL/I,Algol-68, mới Ada,Fortran90,GNU C cũng vậy.

ANSI C array static size compiletime, hỗ trợ kém đến không constant như:

```
const int limit=100;
char plum[limit];
           ^^^
            error: integral constant expression expected
```

Không hỏi ngượng sao `const int` không integral constant expression. C++ hợp lệ.

Dễ thêm dynamic vì tiền lệ, chỉ đổi Mục5.5.4 từ

```
direct-declarator [constant-expression opt]
```

thành

```
direct-declarator [expression opt]
```

Bỏ hạn chế nhân tạo còn đơn giản definition, tương thích K\&R, hữu ích. Vì muốn giữ mục tiêu C đơn giản đầu nên không. May mô phỏng bằng tự pointer.

### Mẹo thực hành hữu ích

![image](images/ch10/img10-06.png)

Học từ message program

`strings` xem binary error message có ích. Quốc tế hóa lưu message riêng thì không cần binary. `yacc` hai release gần đổi rõ:

```
% strings yacc
       :
       too many states
```

thành

```
% strings yacc
       :
       cannot expand table of states
```

Vì yacc nay internal table dynamic, tăng khi cần.

#### Giáo điều software

![image](images/ch10/img10-03.png)

Thông báo lỗi có nghĩa

Compiler cũng string thú vị, được cho trong Apollo C:

```
00 cpp says it's hopeless but trying anyway
14 parse error: I just don't get it
77 you learned to program in Fortran, didn't you?
```

và ưa thích:

```
033 linker attempting to "duct tape" this "gerbil" of a
program
```

có lẽ linker còn gọi binder...

Thông báo có lẽ hư cấu là đùa nội bộ programmer. Nhưng hài hước đúng chỗ. Một người không Sun trong network driver ghi "Bad bcb: we're in big trouble now", default switch theo manual không bao giờ xảy ra.

Dĩ nhiên xảy ra, chỉ khi production. Khách chục mainframe operator round-the-clock, console in, ký log đã đọc.

Họ gọi supervisor6giờ, ông gọi programmer vendor3giờ Pacific. Vì processing thiết yếu kinh doanh nên nghiêm mọi message, nghĩa gì?

Không chửi, nói programmer sai gì, nhưng làm khách lo thừa. Release ngay một đổi, message:

```
"buffer control block 35 checksum failed."
"packet rejected - inform support - not urgent."
```

Hai dòng chấp nhận cho lỗi hiếm.

Thông tin, non-inflammatory, tránh chửi, tiếng lóng,hài,phóng đại, nhất tiết kiệm bị gọi3giờ.

Dynamic array C: thắt dây, xóc. Library `malloc()` cấp pointer vùng lớn, reference như array vì decay pointer+offset.

```
#include <stdlib.h>
#include <stdio.h>
. . .
int    size;
char   *dynamic;
char   input[10];
printf("Please enter size of array: ");
size = atoi(fgets(input,7,stdin));
dynamic = (char *) malloc(size);
. . .
dynamic[0] = 'a';
dynamic[size-1] = 'z';
```

Tránh limit định sẵn, như compiler không hạn symbol table fixed nhưng không muốn table fixed-size khổng lồ chiếm chỗ. Tốt.

#### Mẹo thực hành hữu ích

![image](images/ch10/img10-06.png)

Báo bug cải thiện sản phẩm

Vài năm thêm Pascal compiler table include filename lớn theo cần, đầu12 slot, include lồng hơn12 tự tăng.

Software đáng kể đều bug, programmer viết sai, lớn thì core dump. Rất tệ, compiler không bao giờ abort bất kể input.

Khách châu Âu lớn port Pascal power generation control sang Sun, đa số include>12 nên hay core dump. Sai hai: không báo, không điều tra đủ.

Sửa vấn đề báo ưu tiên cao, nhưng chỉ biết mới sửa. Pascal ít include sâu (không thuộc chuẩn), không test/khách khác báo, nên lỗi qua release sau.

Khủng hoảng hàng trăm nghìn đô, vô số golf bị gián đoạn khi VP hai bên phải vào. Khách gửi senior engineer bay Mỹ gặp tôi xin sửa. Đầu tiên nhóm compiler thấy bug! Sửa ngay, cho patched compiler về. Nhưng họ dễ né nếu bỏ chút công tìm nguyên nhân. Bài học two-fold:

1\. Báo support mọi defect. Chỉ sửa bug biết,tái hiện; bực là cơ quan chính phủ báo nhưng "bảo mật" không cho cả code tẩy nhạy cảm tái hiện.

2\. Thiền và nghệ thuật bảo trì bảo nên điều tra chút, có thể workaround dễ.

Muốn table lớn theo cần, chỉ limit tổng memory. Không khai trực tiếp, allocation heap runtime. `realloc()` đổi size block, thường lớn, giữ nội dung. Thêm entry:

1\. Kiểm đầy.

2\. Đầy thì `realloc` lớn, kiểm thành công.

3\. Thêm entry.

Code C:

```
int    current_element=0;
int    total_element=128;
char   *dynamic = malloc(total_element);

void add_element(char c) {
   if (current_element==total_element-1) {
      total_element*=2;
      dynamic = (char *) realloc(dynamic, total_element);
      if (dynamic==NULL) error("Couldn't expand the table");
   }
   current_element++;
   dynamic[current_element] = c;
}
```

Đừng gán `realloc()` thẳng character pointer: fail thành null, mất reference table cũ!

#### Thử thách lập trình

![image](images/ch10/img10-07.png)

Array lớn động

Viết `main()` cho function, kiểm storage gốc, điền đủ để reallocate.

Điểm thêm:

Thêm `add_element()` chịu initial allocation. Ưu nhược? Dùng `setjmp()/longjmp()` xử lý error lớn table sao?

SunOS5.0 áp rộng, mọi fixed-size table limit hay gặp đổi theo cần. Compiler,debugger cũng. Không áp khắp vì:

- Đột nhiên table lớn làm chậm lúc bất ngờ, growth multiple rất quan trọng.

- Reallocate có thể đổi vị trí toàn vùng, element address invalid; dùng index thay.

- Mọi add/delete qua routine giữ integrity, thay table hơn subscript đơn.

- Entry giảm có nên shrink/free, shrink multiple quan trọng; mọi search phải biết size lúc đó.

- Có thể cần lock tránh thread đọc khi thread realloc, multithread anyway thường lock.

Linked list thay dynamic structure, không random access, chỉ serial trừ cache address hay dùng; array random, khác lớn hiệu năng.

## Giải trí nhẹ — Giới hạn chứng minh program

Vấn đề kỹ sư là gian để có kết quả.

Vấn đề nhà toán là toy problem để có kết quả. Vấn đề program verifier gian trên toy problem để có kết quả.

—Vô danh

Forum C Usenet bất ngờ bài gay gắt ngày hè, giấu tên bảo vệ thủ phạm, đòi formal proof toàn bộ vì "còn lại engineering hack". Kèm proof 45-line đúng program three-line. Tôi rút ngắn.

Bảng 10-3. Bài chứng minh program

Từ: Người ủng hộ proof

Ngày: Fri May15 1991,12:43:52 PDT

Chủ đề: Re: Đổi2 value không temporary.

Ai hỏi fragment đổi2 value hoạt động:

```
*a ^= *b;      /* Do 3 successive XORs */
*b ^= *a;
*a ^= *b;
```

Đáp:

Giả định chuẩn (1) chạy atomic,

(2) không hardware failure,memory limit,math failure.

Sau chuỗi

```
*a ^= *b; *b ^= *a; *a ^= *b;
```

\*a, \*b có value f3(a),f3(b):

```
f3 = lambda x.(x == a? f2(a) ^ f2(b): f2(x))
f2 = lambda x.(x == b? f1(b) ^ f1(a): f1(x))
f1 = lambda x.(x == a? *a ^ *b: *x)
```

hoặc dễ đọc:

```
f3(a) = f2(a) ^ f2(b), f3(x) = f2(x) else
f2(b) = f1(b) ^ f1(a), f2(x) = f1(x) else
f1(a) = *a ^ *b, f1(x) = *x else
```

(miễn \*a,\*b định nghĩa, a != NULL,b != NULL).

Chỉ hai solution qua beta reduction:

```
if a and b are the same: f3(a) = f3(b) = 0
if a and b are different: f3(a) = b, f3(b) = a.
```

Về verification,debug đáng tin:

mathematical verification,proof là cách duy nhất tin cậy.

Mọi thứ khác engineering hack, trái truyền thuyết

thường nhận, mọi C dễ xử lý theo

phân tích toán.

Độc giả còn kinh hơn thấy vài phút sau cùng người…

Bảng 10-4. Bài Program Proofs Follow-Up

Từ: Người ủng hộ proof

Ngày: Fri May15 1991,13:07:34 PDT

Chủ đề: Re: Đổi2 value không temporary.

Trước tôi viết:

Chỉ hai solution qua beta reduction,

là:

```
if a and b are the same: f3(a) = f3(b) = 0
if a and b are different: f3(a) = b, f3(b) = a.
```

thật định viết

```
f3(a) = *b, and f3(b) = *a...
```

Proof hai lỗi, program "verified" còn sai từ đầu! C biết rõ không thể đổi hai value tổng quát không temporary. a,b object chồng thì fail; register/bitfield không lấy address nên không áp, different-sized type hay array cũng không chạy.

Ai còn tin proof sẵn dùng, dưới là một verification clause điển hình từ proof thật được tin đúng, cho Fourier transform phân tích waveform, báo cáo1973 "On Programming" Jacob Schwartz Courant Institute NYU.

Ai tin thực tế, thách: đã đổi đơn giản proof, tìm. Tìm được từ thông tin có. Đáp cuối chương.

### Một verification condition từ proof Fast Fourier Transform

Cảnh báo sức khỏe: đừng thật học!

Proof trông kinh để thuyết phục không thực tế!

Muốn cả ngày nhìn trang như vậy? Chỉ tái hiện có xác suất lớn thêm lỗi. Viết chính xác toàn proof hàng ream condition sao được, chưa nói đầy đủ,nhất quán,đúng?

Có người nói automated prover quản notation. Sao chắc prover không bug? Cho tự verify? Nghĩ chút thấy không đủ, như hỏi kẻ có thể nói dối "có nói dối không?", không tin phủ nhận được.

### Đọc thêm

Communications ACM tập22 số5 tháng5 1979 "Social Processes and Proofs of Theorems and Programs", Richard de Millo,Richard Lipton,Alan Perlis dễ đọc, vì sao proof nay không thực tế,có lẽ mãi. Điều chính proof chứng minh là quy trình hiện không thực tế. Phù! Tạm engineering hack.

#### Lời giải lập trình

![image](images/ch10/img10-08.png)

Đáp thay đổi proof: Thú thật không đổi gì. Ai review text phức sao chắc? Không thực tế vì đa số thấy quá khó tiếp cận.
