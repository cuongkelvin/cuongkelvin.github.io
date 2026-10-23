# Chương 2. Không phải lỗi, đó là tính năng ngôn ngữ

Bọ là lớp sinh vật đông đảo và thành công nhất, với gần một triệu loài đã biết. Xét mặt này, chúng đông gấp khoảng bốn lần mọi sinh vật đã biết khác.

—Bách khoa toàn thư về đời sống động vật của Giáo sư Snopes

vì sao tính năng ngôn ngữ quan trọng…tội làm điều không nên: switch khiến bạn thất vọng vì fall through…hardware có sẵn là bút sáp?…default visibility quá rộng…tội sai mục tiêu: chất nặng lưng lạc đà…"một số operator có precedence sai"…lỗi sớm gets() sâu Internet…tội bỏ sót: mail không đến user có "f" trong user name…space — biên giới cuối cùng…ngày tháng compiler bị hỏng…lint không nên bị tách riêng…giải trí nhẹ nhàng — một số tính năng thật sự là lỗi

## Vì sao tính năng ngôn ngữ quan trọng — Lỗi Fortran thực sự xảy ra thế nào!

Các chi tiết của ngôn ngữ lập trình thực sự quan trọng. Chúng quan trọng vì tạo nên khác biệt giữa một ngôn ngữ đáng tin cậy và một ngôn ngữ error-prone. Điều này bộc lộ rõ vào mùa hè năm 1961, khi một lập trình viên NASA kiểm thử Fortran subroutine dùng để tính quỹ đạo. <sup>\[1\]</sup> Subroutine đã được dùng cho một số chuyến bay Mercury ngắn, nhưng bí ẩn thay, nó không cung cấp độ chính xác mong đợi và cần thiết cho các nhiệm vụ quỹ đạo và mặt trăng sắp tới. Kết quả gần đúng, nhưng chưa chính xác như mong đợi.

<sup>\[1\]</sup> Câu chuyện bị kể sai rất rộng, phiên bản không chính xác có trong nhiều sách ngôn ngữ lập trình. Thực sự nó đã thành truyền thuyết đô thị kinh điển giữa lập trình viên. Tường thuật xác thực từ Fred Webb, người làm NASA lúc đó và thấy source code thật, có trong "Fortran Story—The Real Scoop", Forum on Risks to the Public in Computers and Related Systems, tập 9, số 54, ACM Committee on Computers and Public Policy, ngày 12 tháng 12 năm 1989.

Sau khi kiểm tra rất kỹ thuật toán, dữ liệu và kết quả mong đợi, cuối cùng kỹ sư nhận ra statement sau trong code:

```
DO 10 I=1.10
```

Rõ ràng lập trình viên định viết vòng lặp `DO` dạng:

```
DO 10 I=1,10
```

Trong Fortran, blank character không có ý nghĩa và thậm chí có thể xuất hiện giữa một identifier. Các nhà thiết kế Fortran dự định dùng điều này để giúp người đục thẻ và tăng tính dễ đọc của chương trình, nên bạn có thể có identifier như `MAX Y`. Đáng tiếc là compiler đã đọc statement một cách hoàn toàn chính xác thành `DO10I = 1.10`

Trong Fortran, variable không bắt buộc phải được khai báo. Câu lệnh đã viết khiến giá trị 1.1 được gán cho floating point variable `DO10I` được khai báo ngầm. Các statement trong body của loop dự định chỉ được thực thi một lần thay vì mười lần, và phép tính chỉ thực hiện một xấp xỉ ban đầu thay vì hội tụ qua nhiều lần lặp. Sau khi cor-recting dấu chấm thành dấu phẩy, kết quả đạt độ chính xác mong đợi.

Bug được phát hiện kịp thời và chưa bao giờ khiến chuyến bay vũ trụ Mercury thất bại như nhiều phiên bản câu chuyện khẳng định (một bug khác trong các chuyến bay Mariner, được mô tả ở cuối chương, thực sự gây hậu quả đó). Tuy nhiên, nó minh họa rất rõ tầm quan trọng của thiết kế ngôn ngữ. C có all-too-many điểm mơ hồ hoặc near-ambiguities tương tự. Chương này mô tả một tập hợp đại diện những điểm phổ biến nhất và cách chúng thường biểu hiện thành bug. Trong C còn có những vấn đề khác; chẳng hạn, bất cứ khi nào gặp chuỗi `malloc(strlen(str));`, gần như chắc chắn đó là lỗi, trong khi ý định là `malloc(strlen(str)+1);`. Lý do là gần như mọi routine string-handling khác đều tính cả chỗ cho trailing nul terminator, nên mọi người quen không dự trù riêng cho nó như `strlen` yêu cầu. Ví dụ malloc là lỗi trong hiểu biết của lập trình viên về một library routine, còn chương này tập trung vào các điểm có vấn đề trong chính C thay vì cách lập trình viên dùng nó. Một cách phân tích những thiếu sót của ngôn ngữ lập trình là chia chúng thành ba nhóm: những điều ngôn ngữ làm mà lẽ ra không nên làm; những điều nó không làm mà lẽ ra nên làm; và những điều hoàn toàn lệch hướng. Để tiện, chúng ta có thể gọi lần lượt là “tội làm điều không nên”, “tội bỏ sót” và “tội sai mục tiêu”. Các phần sau mô tả những tính năng C thuộc các nhóm này.

Chương này không nhằm phê phán C đến mức phủ nhận nó. C là một ngôn ngữ lập trình tuyệt vời với nhiều thế mạnh. Việc nó phổ biến như ngôn ngữ triển khai được lựa chọn trên nhiều platform là well-deserved. Nhưng như bà tôi thường nói, bạn không thể vận hành một máy gia tốc va chạm super-conducting mà không đập vỡ vài nguyên tử, và không thể phân tích C mà không nhìn cả khiếm khuyết lẫn ưu điểm. Xem xét những điểm cần cải thiện là một yếu tố dần nâng cao khoa học software engineering và nghệ thuật thiết kế ngôn ngữ lập trình. Đó là lý do C++ gây thất vọng: nó không giải quyết một số vấn đề nền tảng nhất của C, và bổ sung quan trọng nhất của nó, class, lại xây dựng trên type model thiếu sót của C. Vì vậy, với tinh thần tìm hiểu nhằm cải thiện các ngôn ngữ tương lai, sau đây là một số quan sát và câu chuyện thực tế.

### Mẹo thực hành hữu ích

![image](images/ch02/img02-01.png)

nul một chữ 'l' và null hai chữ 'l'

Hãy học thuộc bài vần nhỏ này để nhớ đúng thuật ngữ dành cho pointer và ASCII zero:

Một "l" `NUL` kết thúc ASCII string,

Hai "l" `NULL` chẳng trỏ thứ gì.

Xin lỗi Ogden Nash, nhưng nulll với ba chữ “l” có nghĩa là hãy kiểm tra chính tả. ASCII character có bit pattern bằng 0 được gọi là “NUL”. Giá trị pointer đặc biệt có nghĩa pointer không trỏ đến đâu là “NULL”. Hai thuật ngữ này không thể thay thế nhau về nghĩa.

## Tội làm điều không nên

Nhóm “tội làm điều không nên” bao gồm những điều ngôn ngữ thực hiện nhưng lẽ ra không nên. Trong đó có các tính năng error-prone như switch statement, tự động nối các string literal liền nhau và global scope mặc định.

### Switch khiến bạn thất vọng vì fall through

Dạng tổng quát của switch statement là:

```
switch (expression){
  case constant-expression: zero-or-more-statements
                   default: zero-or-more-statements
  case constant-expression: zero-or-more-statements
      }
```

Mỗi case được mở đầu bằng bộ ba: keyword `case`, tiếp theo là integer-valued constant hoặc constant expression, rồi dấu hai chấm. Quá trình thực thi bắt đầu ở case khớp với expression. Default case, nếu có, có thể nằm ở bất kỳ đâu trong danh sách case và được thực thi nếu không case nào khớp. Nếu không có default case và không case nào khớp, statement này không làm gì. Một số người đề xuất rằng nên có runtime error cho trường hợp “không khớp”, như Pascal. Runtime error checking gần như không có trong C: kiểm tra việc dereference pointer không hợp lệ gần như là trường hợp duy nhất, và ngay cả trường hợp hạn chế đó cũng không thể làm đầy đủ trên MS-DOS.

#### Mẹo thực hành hữu ích

![image](images/ch02/img02-01.png)

Runtime checking trên MS-DOS

Pointer không hợp lệ có thể là tai họa đời lập trình viên. Quá dễ tham chiếu memory qua pointer sai. Mọi kiến trúc virtual memory báo fault cho process dereference pointer ngoài address space ngay khi xảy ra. Nhưng MS-DOS không hỗ trợ virtual memory, nên không bắt được trường hợp tổng quát ngay thời điểm lỗi.

Tuy nhiên, MS-DOS có thể và thực sự dùng một heuristic để kiểm tra trường hợp cụ thể là dereference null pointer sau khi chương trình của bạn kết thúc. Cả Microsoft C và Borland C đều lưu nội dung vị trí 0 trước khi vào chương trình. Trong exit code, chúng kiểm tra xem vị trí đó có chứa giá trị khác không. Nếu có, khả năng khá cao là chương trình đã ghi thông qua null pointer, và runtime system in cảnh báo “null pointer assignment”.

Xem thêm Chương 7.

Runtime checking đi ngược triết lý C rằng lập trình viên biết mình đang làm gì và luôn đúng.

Các case và default có thể xuất hiện theo bất kỳ thứ tự nào, dù theo quy ước default case thường ở cuối. Một C compiler conformant phải cho phép ít nhất 257 case label cho một switch statement (Tiêu chuẩn ANSI C, mục 5.2.4.1). Điều này cho phép switch theo một character 8-bit, tức 256 giá trị khả dĩ cộng EOF.

Switch có một số vấn đề, trong đó có việc quá dễ dãi với những gì nó chấp nhận trong các case. Chẳng hạn, bạn có thể khai báo một số local storage bằng cách đặt declaration ngay sau dấu ngoặc nhọn mở của switch. Đây là dấu vết để lại từ compiler ban đầu: phần lớn code xử lý compound statement bất kỳ có thể được tái sử dụng để xử lý phần braces-enclosed của switch. Vì vậy, declaration được chấp nhận một cách tự nhiên, dù việc thêm initial value vào declaration trong switch statement là vô ích, vì nó sẽ không được exe-cuted: quá trình thực thi bắt đầu ở case khớp với expression.

#### Mẹo thực hành hữu ích

![image](images/ch02/img02-01.png)

Cần storage tạm? Hãy đứng đầu block!

Trong C, bất cứ khi nào có một số statement ở đầu một block

```
 {
    statements
```

bạn luôn có thể chèn thêm declaration vào giữa như sau:

```
 {
    declarations
    statements
```

Bạn có thể dùng cách này nếu cấp phát memory tốn kém và do đó nên tránh khi có thể. Tuy nhiên, compiler được phép bỏ qua điều đó và cấp storage cho mọi local block ngay khi gọi function. Một cách dùng khác là khai báo một số variable mà việc sử dụng thực sự chỉ giới hạn trong block này.

```
if ( a>b )
    /* swap a, b */
 {
    int tmp = a;
    a = b; b = tmp;
}
```

C++ còn tiến xa hơn, cho phép trộn lẫn statement và declaration tùy ý, thậm chí nhúng declaration vào giữa statement “for”.

```
for (int i=0; i<100; i++){...
```

Nếu không được dùng có chừng mực, điều đó có thể nhanh chóng gây nhầm lẫn. Một vấn đề khác là mọi statement bên trong switch đều có thể được gắn label và nhảy đến, cho phép chuyển control qua lại tùy ý:

```
switch (i) {
  case 5+3: do_again:
  case 2: printf("I loop unremittingly \n"); goto do_again;
  default : i++;
  case 3: ;
}
```

Việc mọi case đều tùy chọn và mọi dạng statement, bao gồm labelled statement, đều được phép có nghĩa là có những lỗi ngay cả lint cũng không phát hiện được. Một đồng nghiệp của tôi từng gõ nhầm `defau1t` cho default label, tức gõ chữ số “1” thay chữ “l”. Bug này rất khó truy tìm và trên thực tế loại bỏ default case khỏi switch statement. Tuy nhiên, code vẫn compile mà không báo lỗi, và ngay cả khi xem xét source code kỹ cũng không thấy gì bất thường. Phần lớn các bản lint không phát hiện lỗi này.

Nhân tiện, vì keyword `const` không thực sự có nghĩa là constant trong C,

```
const int two=2;

switch (i) {
  case 1: printf("case 1 \n");
  case two: printf("case 2 \n");
**error** ^^^ integral constant expression expected

  case 3: printf("case 3 \n");
  default: ; }
```

đoạn code trên sẽ tạo compilation error như đã minh họa. Đây không hẳn là lỗi của switch statement, nhưng switch statement là một nơi bộc lộ vấn đề rằng constant không thực sự là constant.

Có lẽ khuyết điểm lớn nhất của switch statement là các case không tự break sau khi thực hiện các thao tác cho một case label. Khi một case statement được thực thi, flow of control tiếp tục đi xuống, thực thi mọi case tiếp theo cho đến khi gặp break statement. Đoạn code

```
switch (2) {
  case 1: printf("case 1 \n");
  case 2: printf("case 2 \n");
  case 3: printf("case 3 \n");
  case 4: printf("case 4 \n");
  default: printf("default \n");
}
```

in ra

```
case 2
case 3
case 4
default
```

Điều này được gọi là “fall through”, ban đầu nhằm cho phép xử lý phần cuối chung sau khi thực hiện một số chuẩn bị case-specific. Trên thực tế, đây là một misfea-ture nghiêm trọng vì gần như mọi case action đều kết thúc bằng `break;`. Phần lớn phiên bản lint thậm chí phát cảnh báo nếu thấy một case fall through sang case khác.

#### Giáo điều software

![image](images/ch02/img02-02.png)

Fall through mặc định sai 97% trường hợp

Chúng tôi phân tích source code của compiler Sun C để xem fall through mặc định được sử dụng thường xuyên đến mức nào. Front end của compiler Sun ANSI C có 244 switch statement, mỗi statement có trung bình bảy case. Fall through chỉ xuất hiện trong 3% tổng số case này.

Nói cách khác, hành vi switch thông thường sai trong 97% trường hợp. Điều này không chỉ đúng trong compiler; ngược lại, những chỗ dùng fall through trong phân tích này thường là tình huống xảy ra trong compiler thường xuyên hơn software khác, chẳng hạn khi compile operator có thể có một hoặc hai operand:

```
switch( operator->num_of_operands ) {
    case 2: process_operand( operator->operand_2 );
             /* FALLTHRU */
    case 1: process_operand( operator->operand_1 );
    break;
}
```

Fall through giữa các case được thừa nhận rộng rãi là một khiếm khuyết đến mức thậm chí có quy ước comment đặc biệt như đã minh họa ở trên để báo cho lint: “Đây thực sự là một trong 3% trường hợp chủ định dùng fall through.” Sự bất tiện của fall through mặc định cũng được xác nhận trong nhiều chương trình khác.

Chúng tôi kết luận fall through mặc định trên switch là lỗi thiết kế C. Trong overwhelm-ing đa số trường hợp, bạn không muốn và phải viết code thêm để chống lại. Như Red Queen nói với Alice trong Through the Looking Glass, dùng cả hai tay cũng không phủ nhận được.

#### Vấn đề switch khác — `break`

#### Thoát khỏi đâu?

Đây là bản sao đoạn code gây gián đoạn nghiêm trọng dịch vụ điện thoại AT\&T trên toàn nước Mỹ. Phần lớn mạng AT\&T không thể sử dụng trong khoảng chín giờ kể từ chiều ngày 15 tháng 1 năm 1990. Ngày nay, tổng đài điện thoại, hay “switching system” theo thuật ngữ điện thoại, đều là computer system, và đoạn code này chạy trên model 4ESS Central Office Switching System. Nó cho thấy trong C quá dễ bỏ qua chính xác control construct nào chịu tác động của statement “break”.

```
network code()
{
  switch (line) {

      case THING1:
        doit1();
        break;

      case THING2:
        if (x == STUFF) {
            do_first_stuff();

            if (y == OTHER_STUFF)
                break;
                do_later_stuff();
            } /* coder meant to break to here... */
            initialize_modes_pointer();
            break;

          default:
            processing();
  } /* ...but actually broke to here! */

  use_modes_pointer();/* leaving the modes_pointer
uninitialized */

}
```

Đây là phiên bản đơn giản hóa của code, nhưng bug hoàn toàn có thật. Lập trình viên muốn thoát khỏi statement “if”, quên rằng “break” thực sự đưa bạn ra khỏi iteration statement hoặc switch statement bao gần nhất. Ở đây, nó thoát khỏi switch rồi thực hiện lời gọi `use_modes_pointer()`, nhưng việc khởi tạo cần thiết chưa được thực hiện, gây lỗi ở phần sau.

Cuối cùng, đoạn code này gây ra sự cố mạng lớn đầu tiên trong lịch sử 114-year của AT\&T. Câu chuyện được mô tả chi tiết hơn ở trang 11 của tạp chí Telephony số ngày 22 tháng 1 năm 1990. Thiết kế được cho là fail-safe của network signaling system thực tế lại lan truyền lỗi theo phản ứng dây chuyền, làm sập toàn bộ mạng đường dài. Và tất cả đều nằm ở một statement C `switch`.

### Hardware có sẵn là bút sáp?

Một tính năng mới được ANSI C đưa vào là quy ước nối các string literal liền nhau thành một string. Nó thay thế cách cũ để tạo thông báo nhiều dòng bằng escaped newline và bắt đầu mỗi continuation string ở cột đầu tiên.

Kiểu cũ:

```
      printf( "A favorite children's book \
is 'Muffy Gets It: the hilarious tale of a cat, \
a boy, and his machine gun'" );
```

Bây giờ có thể viết nội dung này thành một chuỗi string literal liền nhau, tự động được nối thành một tại compile-time. Nul character thường kết thúc string literal được loại bỏ khỏi mọi string literal được nối, trừ string literal cuối cùng.

Kiểu mới:

```
printf( "A second favorite children's book "
     "is 'Thomas the tank engine and the Naughty Enginedriver
who "
     "tied down Thomas's boiler safety valve'" );
```

Tuy nhiên, việc nối tự động có nghĩa là thiếu dấu phẩy trong initialization list gồm các string literal không còn tạo diagnostic message. Giờ đây, thiếu dấu phẩy dẫn đến sự “kết hôn” âm thầm của các string liền nhau. Điều này có hậu quả nghiêm trọng trong những tình huống như sau:

```
char *available_resources[] = {
  "color monitor",
  "big disk",

  "Cray" /*           whoa! no comma! */
  "on-line drawing routines",

  "mouse",
  "keyboard",
  "power cables",     /* and what's this extra comma? */
};
```

Vì vậy, available\_resources\[2\] là “Crayon-line drawing routines”. Có một “Cray” cùng “on-line drawing routines” rất khác với chỉ có một số routine vẽ đường bằng bút sáp...

Tổng số resource ít hơn dự kiến một, nên ghi vào `available_resources[6]` sẽ phá hỏng một variable khác. Nhân tiện, dấu phẩy cuối sau initializer cuối cùng không phải lỗi gõ, mà là một điểm bất thường trong cú pháp được giữ lại từ C nguyên thủy. Có hoặc không có nó đều được phép nhưng không mang ý nghĩa gì. Lý do mà ANSI C rationale đưa ra là nó giúp việc tự động sinh code C dễ hơn. Lời biện hộ này sẽ đáng tin hơn nếu trailing comma được cho phép trong mọi danh sách comma-sepa-rated, chẳng hạn enum declaration hoặc nhiều variable declarator trong một declaration. Nhưng không phải vậy.

#### Mẹo thực hành hữu ích

![image](images/ch02/img02-01.png)

Lần đầu đi qua

Mẹo này cho thấy một cách đơn giản để thực hiện thao tác khác trong lần đầu đi qua một đoạn code.

Function dưới đây thực hiện thao tác khác ở lần gọi đầu so với mọi lần gọi sau. Có những cách khác để làm điều này; cách này giảm tối đa các switch và phép kiểm tra điều kiện.

```
generate_initializer(char * string)
{
  static char separator='';
  printf( "%c %s \n", separator, string);
  separator = ',';
}
```

Trong lần thực hiện đầu tiên, đoạn này in một dấu cách rồi đến initializer. Mọi initializer tiếp theo, nếu có, đều có dấu phẩy đứng trước. Xem đặc tả là “lần đầu tiên, thêm dấu cách phía trước” thay vì “lần cuối cùng, bỏ dấu phẩy phía sau” giúp việc lập trình trở nên đơn giản.

Lời biện hộ này khó tin, vì một chương trình tự động có thể xuất dấu phẩy hoặc không bằng cách dùng một character được khai báo static, khởi tạo bằng dấu cách rồi đặt thành dấu phẩy. Cách này tạo đúng hành vi và rất dễ viết code. Trong C có những ví dụ khác về các mục comma-separated mà dấu phẩy không được kết thúc danh sách. Dấu phẩy không cần thiết nhưng được cho phép sau initializer cuối chủ yếu làm rối thêm một cú pháp vốn đã mù mờ.

### Default visibility quá rộng

Mỗi khi định nghĩa một C function, tên của nó mặc định được nhìn thấy ở global scope. Bạn có thể đặt keyword thừa `extern` trước tên function hoặc bỏ nó đi, kết quả vẫn giống nhau. Function được nhìn thấy bởi mọi thành phần link với object file đó. Nếu muốn hạn chế truy cập function, bạn bắt buộc phải chỉ định keyword `static`.

```
       function apple (){ /* visible everywhere */ }
extern function pear () { /* visible everywhere */ }

static function turnip(){ /* not visible outside this file */ }
```

Trong thực tế, gần như mọi người đều có xu hướng định nghĩa function mà không thêm storage-class specifier, nên global scope chiếm ưu thế.

Qua kinh nghiệm thực tế, việc mặc định cho phép global visibility đã nhiều lần được chứng minh rõ ràng là sai lầm. Software object nên mặc định có scope hạn chế nhất. Lập trình viên phải thực hiện thao tác tường minh khi muốn cho một thứ có global scope.

Vấn đề scope quá rộng tương tác với một quy ước C phổ biến khác là interpositioning. Interpositioning là việc thay thế một library function bằng một function user-written cùng tên. Nhiều lập trình viên C hoàn toàn không biết tính năng này, nên nó được mô tả trong chương về linking. Trước mắt, chỉ cần ghi nhớ: “interpositioning — mình nên tìm hiểu thêm về nó”.

Vấn đề scope quá rộng thường gặp trong library: một library cần làm cho một object được nhìn thấy từ library khác. Cách duy nhất là làm nó được biết đến ở global scope; nhưng khi đó, bất kỳ ai link với library cũng nhìn thấy nó. Đây là visibil-ity “all-or-nothing”: symbol hoặc được biết trên toàn cục, hoặc hoàn toàn không được biết. Trong C không có cách chọn lọc hơn khi công khai thông tin.

Vấn đề trở nên tệ hơn vì bạn không thể lồng function definition trong các function khác như trong Pascal. Do đó, một tập hợp function “nội bộ” phục vụ một function lớn phải nằm ngoài nó. Không ai nhớ đặt chúng là static, nên chúng mặc định có global visibility. Ada và Modula-2 đều giải quyết vấn đề này theo cách man-ageable, bằng cách yêu cầu program unit chỉ định chính xác symbol nào được export và symbol nào được import.

## Tội sai mục tiêu

Nhóm “tội sai mục tiêu” bao gồm những điều trong C có vẻ bị định hướng sai hoặc không phù hợp với ngôn ngữ. Trong đó có các tính năng như tính ngắn gọn của C (một phần do tái sử dụng symbol quá mức) và các vấn đề về operator precedence.

### Chất nặng lưng lạc đà

Một vấn đề là C quá ngắn gọn. Chỉ cần thêm, đổi hoặc bỏ một ký tự thường đã tạo ra một chương trình vẫn hợp lệ nhưng thực hiện điều hoàn toàn khác. Tệ hơn, nhiều symbol được “overload”, tức có nghĩa khác nhau khi dùng trong các context khác nhau. Ngay cả một số keyword cũng được overload với nhiều nghĩa; đây là lý do chính khiến các scope rule của C không rõ ràng một cách trực giác đối với lập trình viên. Bảng 2-1 cho thấy các symbol C tương tự có nhiều nghĩa khác nhau như thế nào.

Bảng 2-1. Symbol overloading trong C

| Symbol | Ý nghĩa |
|---|---|
| `static` | Trong function, giữ giá trị giữa các lời gọi <br> Ở function level, chỉ thấy trong file này <sup>\[1\]</sup> |
| `extern` | Với function definition, có global scope (và thừa) <br> Với variable, được định nghĩa nơi khác |
| `void` | Return type function, không trả value <br> Trong pointer declaration, type generic pointer <br> Trong parameter list, không nhận parameter |
| `*` | Multiplication operator <br> Áp dụng pointer, indirection <br> Trong declaration, pointer |
| `&` | Operator bitwise `AND` <br> Operator Address-of |
| `=` <br> `==` | Assignment operator <br> Comparison operator |
| `<=` <br> `<<=` | Operator Less-than-or-equal-to <br> Compound assignment operator shift-left |
| `<` <br> `<` | Operator Less-than <br> Left delimiter trong directive `#include` |
| `()` | Bao formal parameter trong function definition <br> Thực hiện function call <br> Xác lập expression precedence <br> Convert (cast) value sang type khác <br> Định nghĩa macro có argument <br> Gọi macro có argument <br> Bao operand operator `sizeof` khi là typename |

<sup>\[1\]</sup> Có lẽ bạn đang thắc mắc lý do nào có thể biện minh cho việc re-using keyword `static` với những nghĩa khác nhau đến thế. Nếu tìm ra, xin cho chúng tôi biết với.

Có những symbol khác cũng giống nhau đến mức gây nhầm lẫn. Một lập trình viên bối rối từng nhìn statement `if (x>>4)` và hỏi: “Nó nghĩa là gì? Có phải nói ‘Nếu x lớn hơn 4 rất nhiều’ không?”

Overloading có thể thành vấn đề trong statement như:

```
p = N * sizeof * q;
```

Nhanh nào, có hai phép nhân hay chỉ một? Đây là gợi ý: statement tiếp theo là:

```
r = malloc( p );
```

Câu trả lời là chỉ có một phép nhân, vì sizeof là một operator mà ở đây nhận operand là thứ q trỏ đến, tức `*q)`. Nó trả về kích thước tính bằng byte của type mà q trỏ đến, thuận tiện để function malloc cấp thêm memory. Khi operand của sizeof là một type, nó phải được đặt trong ngoặc đơn, khiến mọi người lầm tưởng đây là function call; nhưng với variable thì không bắt buộc.

Ví dụ phức tạp hơn:

```
apple = sizeof (int) * p;
```

Điều này có nghĩa gì? Là kích thước của int nhân với p? Hay kích thước của thứ mà p trỏ đến, nhưng được cast thành int? Hay một điều còn kỳ lạ hơn? Câu trả lời không được đưa ra ở đây, vì một phần của việc trở thành lập trình viên chuyên gia là học cách viết các chương trình thử nghiệm nhỏ để tìm hiểu những câu hỏi như vậy. Hãy thử xem!

Bạn bắt một symbol làm càng nhiều việc, compiler càng khó phát hiện những điều bất thường trong cách bạn dùng nó. Không chỉ những người hát theo các chú chim Tiki ở Disneyland mới gặp khó khăn ở đây. So với phần lớn ngôn ngữ khác, C dường như tiến xa hơn một chút trên ranh giới chông chênh của sự mơ hồ về token.

### "Một số operator có precedence sai"

Bạn biết chắc mình đã tìm thấy vấn đề khi các tác giả của báo cáo ban đầu về C nói rằng “một số operator có precedence sai”, như Kernighan và Ritchie đề cập ở trang 3 của The C Programming Language. Dù có sự thừa nhận đó, ANSI C không thay đổi operator precedence. Điều này không có gì ngạc nhiên: bất kỳ thay đổi precedence nào cũng sẽ đặt gánh nặng không thể chấp nhận lên source code base hiện có.

Nhưng cụ thể những operator C nào có precedence sai? Câu trả lời là “bất kỳ operator nào có vẻ gây hiểu lầm khi bạn dùng theo cách thông thường”. Một số operator mà precedence thường gây rắc rối cho người không cảnh giác được trình bày trong Hình 2-1.

Hình 2-1. Vấn đề precedence của operator C

![image](images/ch02/img02-03.png)

Phần lớn những điều này trở nên dễ hiểu hơn nếu bạn ngồi xuống xem xét chúng kỹ lưỡng. Tuy nhiên, trường hợp liên quan đến dấu phẩy đôi khi khiến lập trình viên nổi điên. Chẳng hạn, khi dòng này được thực thi:

```
i=1,2;
```

cuối cùng i nhận giá trị nào? Chúng ta biết giá trị của comma operator là giá trị của operand ngoài cùng bên phải. Nhưng ở đây assignment có precedence cao hơn, nên thực tế bạn nhận được:

```
(i=1), 2; /* i gets the value 1 */
```

i nhận giá trị 1; sau đó literal 2 được đánh giá rồi bỏ đi. Cuối cùng i bằng một, không phải hai.

Trong một bài đăng trên Usenet vài năm trước, Dennis Ritchie giải thích rằng một số điều bất thường này là những sự tình cờ của lịch sử.

#### Giáo điều software

![image](images/ch02/img02-02.png)

'And' và 'AND' hay 'Or' hay 'OR'

Từ decvax!harpo!npoiv!alice!research!dmr

Ngày: Thứ Sáu 22 tháng 10 năm 1982 01:04:10

Chủ đề: Operator precedence

Newsgroup: net.lang.c

Priority của \&\& và \|\| so với ==, v.v. hình thành như sau. C ban đầu không có operator riêng cho \& và \&\&, hay \| và \|\|. (Bạn hiểu chứ?) Thay vào đó, nó dùng khái niệm “truth-value context” kế thừa từ B và BCPL: tại nơi cần Boolean value, sau “if”, “while”, v.v., các operator \& và \| được diễn giải như \&\& và \|\| hiện nay; trong expression thông thường, cách diễn giải bitwise được dùng. Cách này hoạt động khá tốt nhưng khó giải thích. (Có khái niệm “top-level operators” trong truth-value context.)

Precedence của \& và \| giống như hiện nay. Chủ yếu theo sự thúc giục của Alan Snyder, các operator \&\& và \|\| được thêm vào. Điều này tách thành công khái niệm bitwise operation khỏi short-circuit Boolean evaluation. Tuy nhiên, tôi chùn bước trước các vấn đề về precedence. Chẳng hạn, có nhiều chương trình chứa những đoạn như if (a==b \& c==d) ...

Nhìn lại, lẽ ra tốt hơn nếu cứ thay đổi precedence của \& thành cao hơn ==, nhưng khi đó có vẻ an toàn hơn nếu chỉ tách \& và \&\& mà không đưa \& vượt qua một operator hiện có. (Suy cho cùng, chúng tôi đã có vài trăm kilobyte source code và có lẽ ba nơi cài đặt....)

Dennis Ritchie

#### Mẹo thực hành hữu ích

![image](images/ch02/img02-01.png)

Thứ tự đánh giá

Bài học từ tất cả những điều này là bạn luôn nên đặt ngoặc đơn quanh expression trộn Boolean, số học hoặc bit-twiddling với bất kỳ thứ gì khác.

Và hãy nhớ rằng, trong khi precedence và associativity cho biết thứ nào được nhóm với thứ nào, thứ tự đánh giá các nhóm này luôn undefined. Trong expression:

```
x = f() + g() * h();
```

Các giá trị do g() và h() trả về được nhóm với nhau để nhân, nhưng g và h có thể được gọi theo bất kỳ thứ tự nào. Tương tự, f có thể được gọi trước hoặc sau phép nhân, hoặc thậm chí giữa g và h. Điều duy nhất chúng ta biết chắc là phép nhân xảy ra trước phép cộng, vì kết quả phép nhân là một operand của phép cộng. Dù vậy, viết chương trình dựa vào hiểu biết này vẫn là phong cách kém. Phần lớn ngôn ngữ lập trình không quy định thứ tự đánh giá operand. Thứ tự này được để undefined để compiler-writers có thể tận dụng các đặc điểm riêng của architecture hoặc thông tin đặc biệt về những giá trị đã nằm trong register.

Pascal tránh mọi vấn đề trong lĩnh vực này bằng cách yêu cầu ngoặc đơn tường minh quanh expression trộn Boolean operator và arithmetic operator. Một số chuyên gia khuyến nghị chỉ có hai mức precedence cần nhớ trong C: nhân và chia đứng trước cộng và trừ. Mọi thứ khác nên được đặt trong ngoặc đơn. Chúng tôi cho rằng đây là lời khuyên xuất sắc.

#### Mẹo thực hành hữu ích

![image](images/ch02/img02-01.png)

"Associativity" nghĩa gì

Trong khi operator precedence có thể gây khó hiểu, nhiều người cũng bối rối không kém về operator associativity. Trong tài liệu C thông thường, operator associativity dường như chưa bao giờ được giải thích thật rõ. Mẹo thực hành này giải thích nó là gì và khi nào bạn cần biết đến nó. Cách giải thích five-cent là: đây là “tie-breaker” cho những operator có precedence bằng nhau.

Mỗi operator được gán một mức precedence và associativity “trái” hoặc “phải”. Precedence cho biết các operand trong expression không có ngoặc liên kết “chặt” đến mức nào. Chẳng hạn, trong expression `a * b + c,` vì phép nhân có precedence cao hơn phép cộng, nó được thực hiện trước và thừa số sẽ là `b,` chứ không phải `b + c`.

Nhưng nhiều operator có cùng mức precedence, và đây là lúc associativity phát huy tác dụng. Nó là quy tắc giải thích precedence thực giữa tất cả các operator có cùng mức precedence biểu kiến. Nếu có một expression như

```
int a, b=1, c=2;
a = b = c;
```

chúng ta thấy rằng, vì expression chỉ có assignment operator, precedence không giúp hiểu cách các operand được nhóm. Vậy thao tác nào xảy ra trước: gán c cho b, hay gán b cho a? Trong trường hợp đầu, cuối cùng a nhận giá trị 2; trong trường hợp sau, a nhận giá trị 1.

Mọi assignment-operators đều có right associativity. Quy tắc associativity nói rằng điều này có nghĩa operation ngoài cùng bên phải trong expression được đánh giá trước, và việc đánh giá tiếp tục từ phải sang trái. Do đó, giá trị c được gán cho b. Sau đó, giá trị b được lưu vào a. a nhận giá trị 2. Tương tự, với các operator có left associativity, chẳng hạn bitwise and và or, các operand được nhóm từ trái sang phải.

Công dụng duy nhất của associativity là phân giải sự mơ hồ trong expression có hai hoặc nhiều operator equal-precedence. Thực tế, bạn sẽ thấy mọi operator có chung mức precedence cũng có chung associativity. Chúng bắt buộc phải như vậy, nếu không việc đánh giá expression vẫn mơ hồ. Nếu cần tính đến associativity để xác định giá trị một expression, thường tốt hơn bạn nên viết lại nó thành hai expression hoặc sử dụng ngoặc đơn.

Trong C, thứ tự xảy ra của một số việc được định nghĩa, còn những việc khác thì không. Thứ tự precedence và associativity là well-defined. Tuy nhiên, thứ tự đánh giá expression phần lớn là unspecified, thuật ngữ đặc biệt được định nghĩa trong chương trước, để compiler-writers có mức tự do tối đa khi tạo code nhanh nhất. Chúng ta nói “phần lớn” vì thứ tự được định nghĩa cho `&&`, `||` và một vài operator khác. Hai operator này đánh giá operand theo thứ tự left-to-right nghiêm ngặt, dừng khi đã biết kết quả. Tuy nhiên, thứ tự đánh giá các argument trong function call lại là một thứ tự unspecified khác.

### Lỗi sớm `gets()` sâu Internet

Các vấn đề của C không chỉ giới hạn trong bản thân ngôn ngữ. Một số routine trong standard library có semantics không an toàn. Điều này được minh họa rõ rệt vào tháng 11 năm 1988, khi một chương trình worm luồn qua hàng nghìn máy trên mạng Internet. Khi mọi chuyện lắng xuống và các cuộc điều tra hoàn tất, người ta xác định rằng một cách worm lan truyền là thông qua điểm yếu trong finger daemon, thành phần nhận truy vấn qua mạng về những ai đang đăng nhập. Finger daemon, in.fingerd, dùng standard I/O routine `gets()`.

Nhiệm vụ danh nghĩa của `gets()` là đọc một string từ stream. Caller cho nó biết nơi đặt các ký tự nhận được. Nhưng `gets()` không kiểm tra dung lượng buffer; thực tế, nó không thể kiểm tra. Nếu caller cung cấp pointer đến stack và lượng input lớn hơn dung lượng buffer, `gets()` sẽ vui vẻ ghi đè stack. Finger daemon chứa đoạn code:

```
main(argc, argv)
  char *argv[];
{
  char line[512];
      ...
  gets(line);
```

Ở đây, `line` là một array 512-byte được cấp phát tự động trên stack. Khi user cung cấp lượng input lớn hơn thế cho finger daemon, routine `gets()` tiếp tục đặt input lên stack. Phần lớn architecture dễ bị tổn thương khi một entry sẵn có giữa stack bị ghi đè bằng dữ liệu lớn hơn, đồng thời ghi đè các entry lân cận. Chi phí kiểm tra kích thước và permission bằng software cho mỗi lần truy cập stack sẽ quá lớn. Kẻ xấu có hiểu biết có thể sửa return address trong procedure activation record trên stack bằng cách giấu các binary pattern thích hợp trong argument string. Điều này chuyển flow of execution đến một instruction sequence đặc biệt, cũng được đặt cẩn thận trên stack, thay vì trở lại nơi xuất phát. Sequence đó gọi `execv()` để thay running image bằng shell. Thế là bạn đang tương tác với shell trên máy từ xa thay vì finger daemon, và có thể ra lệnh chuyển một bản sao virus sang máy khác. Cứ lặp lại cho đến khi bị tống vào tù. Hình 2-2 minh họa quá trình này.

Hình 2-2. Cách sâu Internet giành quyền thực thi từ xa

![image](images/ch02/img02-04.png)

Trớ trêu là routine `gets()` là một function lỗi thời, cung cấp tính tương thích với phiên bản đầu tiên của portable I/O library, vốn đã được standard I/O thay thế hơn một thập kỷ trước. Manpage thậm chí khuyến nghị mạnh mẽ rằng luôn nên dùng `fgets()` thay thế. Routine `fgets()` đặt giới hạn số ký tự được đọc, nên không vượt quá kích thước buffer. Finger daemon được làm an toàn bằng một bản sửa two-line thay thế:

```
gets(line);
```

bằng các dòng:

```
if (fgets(line, sizeof(line), stdin) == NULL)
    exit(1);
```

Đoạn này nhận một lượng input có giới hạn, nên người chạy chương trình không thể thao túng nó để ghi đè các vị trí quan trọng. Tuy nhiên, tiêu chuẩn ANSI C không loại bỏ `gets()` khỏi ngôn ngữ. Vì vậy, trong khi chương trình cụ thể này đã được làm an toàn, khuyết điểm bên dưới của C standard library vẫn chưa bị loại bỏ.

## Tội bỏ sót

Nhóm “tội bỏ sót” bao gồm những điều ngôn ngữ không làm nhưng lẽ ra nên làm. Trong đó có các tính năng bị thiếu như standard argument processing và sai lầm tách việc kiểm tra của lint ra khỏi compiler.

### Mail không đến user có "f" trong user name

Báo cáo bug rất khó hiểu. Nó chỉ ghi: “mail không được chuyển đến những user có chữ ‘f’ ở vị trí thứ hai trong username”. Nghe thật khó tin. Điều gì có thể khiến mail thất bại chỉ vì một ký tự trong username? Suy cho cùng, không có liên hệ nào giữa các ký tự của username và quá trình chuyển mail. Tuy nhiên, vấn đề được báo cáo tại nhiều nơi.

Sau một số kiểm thử khẩn cấp, chúng tôi nhận thấy mail thực sự rơi vào hư vô khi người nhận có chữ “f” ở vị trí thứ hai trong username! Vì vậy, mail đến được Fred và Muffy, nhưng không đến Effie. Việc xem xét source code nhanh chóng tìm ra vấn đề.

Nhiều người ngạc nhiên khi biết ANSI C bắt buộc quy ước truyền argument `argc, argv` cho chương trình C, nhưng đúng là như vậy. Quy ước UNIX đã được nâng lên thành tiêu chuẩn, và nó chịu một phần trách nhiệm cho bug mail ở đây. Trong release trước, chương trình mail đã được sửa thành:

```
if ( argv[argc-1][0] == '-' || (argv[argc-2][1] == 'f' ) )
  readmail(argc, argv);
else
  sendmail(argc, argv);
```

Chương trình “mail” có thể được chạy để gửi mail hoặc đọc mail gửi đến bạn. Chúng ta sẽ không xem xét quá kỹ lợi ích của việc giao cho một chương trình hai nhiệm vụ khác nhau như vậy. Đoạn code này dự định xem các argument và dùng thông tin đó để quyết định chúng ta đang đọc hay gửi mail. Cách phân biệt mang tính phỏng đoán: tìm các switch chỉ có ở thao tác đọc hoặc gửi. Trong trường hợp này, nếu argument cuối là switch, tức bắt đầu bằng dấu gạch ngang, chắc chắn chúng ta đang đọc mail. Chúng ta cũng đang đọc mail nếu argument cuối không phải option mà là filename, nghĩa là argument next-to-last là “`-f`”.

Và đây là chỗ lập trình viên mắc sai lầm, với sự tiếp tay của việc thiếu hỗ trợ trong ngôn ngữ. Anh chỉ nhìn ký tự thứ hai của option next-to-last. Nếu đó là “f”, anh cho rằng mail được gọi bằng một dòng như sau:

```
mail -h -d -f /usr/linden/mymailbox
```

Trong phần lớn trường hợp, điều này đúng và mail được đọc từ mymailbox. Nhưng cũng có thể chương trình được gọi như sau:

```
mail effie robert
```

Trong trường hợp này, argument processing khiến chương trình mail nghĩ rằng nó được yêu cầu đọc mail thay vì gửi. Trúng rồi! E-mail gửi đến user có chữ “f” ở vị trí thứ hai trong tên biến mất! Bản sửa chỉ là một one-liner: nếu đang xem argument next-to-last để tìm chữ “f”, hãy bảo đảm phía trước nó còn có dấu gạch ngang của switch:

```
if ( argv[argc-1][0] == '-' ||
  argv[argc-2][0] == '-' && (argv[argc-2][1] == 'f' ) )
      readmail(argc, argv);
```

Vấn đề do parse argument sai gây ra, nhưng được tạo điều kiện bởi việc phân loại argument thành switch và filename không đầy đủ. Nhiều operating system, chẳng hạn VAX/VMS, phân biệt runtime option với các argument khác cho chương trình, chẳng hạn filename, nhưng UNIX không làm vậy; ANSI C cũng không.

#### Giáo điều software

![image](images/ch02/img02-02.png)

Shell vụng về parse argument

Vấn đề argument parsing không đầy đủ xuất hiện ở nhiều nơi trên UNIX. Để tìm những file nào trong directory là link, bạn có thể nhập lệnh:

```
ls -l | grep ->
```

Điều này tạo thông báo lỗi “Missing name for redirect”, và phần lớn mọi người sẽ nhanh chóng nhận ra shell đã diễn giải dấu ngoặc nhọn hướng phải thành redirection thay vì argument cho grep. Sau đó, họ dùng dấu nháy để che nó khỏi shell và thử cách sau:

```
ls -l | grep "->"
```

Vẫn không được! Chương trình grep nhìn dấu trừ ở đầu, diễn giải argument thành một option greater-than không nhận dạng được, rồi thoát. Câu trả lời là lùi khỏi “ls” và thay vào đó dùng:

```
file -h * | grep link
```

Nhiều người từng khổ sở vì tạo một file có tên bắt đầu bằng dấu gạch ngang, rồi không thể yêu cầu rm xóa nó. Một cách giải quyết là cung cấp toàn bộ pathname của file, để rm không thấy dấu gạch ngang ở đầu và cố diễn giải tên thành option. Một số lập trình viên C áp dụng quy ước rằng argument “ `--` ” nghĩa là “từ đây trở đi, không argument nào là switch, dù bắt đầu bằng dấu gạch ngang”. Giải pháp tốt hơn sẽ đặt gánh nặng lên hệ thống thay vì user, với một argument pro-cessor chia argument thành option và non-options. Cơ chế argv đơn giản hiện đã ăn sâu đến mức không thể thay đổi. Chỉ cần đừng gửi mail cho Effie trên các phiên bản Berkeley UNIX pre-1990.

### Space — Biên giới cuối cùng

Nhiều người sẽ nói với bạn rằng white space không có ý nghĩa trong C, bạn có thể dùng nhiều hay ít tùy thích. Không đúng! Sau đây là một số ví dụ mà white space làm thay đổi rad-ically ý nghĩa hoặc tính hợp lệ của chương trình.

- Ký tự backslash có thể được dùng để “escape” một số ký tự, bao gồm newline. Escaped newline được xem là một dòng logic, và có thể dùng để tiếp tục các string dài. Vấn đề phát sinh nếu bạn vô tình chèn một hoặc hai dấu cách giữa backslash và carriage return, vì `\` whitespace newline khác với `\`newline. Lỗi này có thể khó tìm vì bạn đang tìm thứ vô hình: một space character xuất hiện ở nơi lẽ ra là newline. Newline thường được escape để tiếp tục macro definition nhiều dòng. Nếu compiler của bạn không có thông báo lỗi xuất sắc, có lẽ bạn nên bỏ cuộc ngay. Một lý do khác để escape newline là tiếp tục string literal, như sau:

- `char a[]= "Hi! How are you? I am quite a \`

```
long string, folded onto 2 lines";
```

ANSI C xử lý vấn đề string literal nhiều dòng bằng cách đưa vào quy ước nối các string literal liền nhau. Như chúng ta chỉ ra ở phần khác trong chương, cách tiếp cận đó giải quyết một vấn đề tiềm ẩn bằng cách đưa vào một vấn đề khác.

- Nếu loại bỏ hoàn toàn dấu cách, bạn vẫn có thể gặp rắc rối. Chẳng hạn, bạn nghĩ đoạn code sau có nghĩa gì?

```
z = y+++x;
```

Lập trình viên có thể định viết `z = y + ++x`, hoặc cũng có thể nghĩ đến `z = y++ + x`. Tiêu chuẩn ANSI quy định một quy ước được biết đến với tên chiến lược maximal munch. Maximal munch nói rằng nếu có nhiều khả năng cho token tiếp theo, compiler sẽ ưu tiên “ngoạm” khả năng có chuỗi ký tự dài nhất. Vì vậy, ví dụ trên sẽ được parse thành `z = y++ + x`.

Vẫn gây vấn đề, vì code

```
z = y+++++x;
```

vì vậy sẽ được parse thành `z = y++ ++ + x` và gây compilation error kiểu “operator ++ đang trôi lơ lửng trong không gian”. Điều này xảy ra dù về lý thuyết compiler có thể suy ra rằng cách sắp xếp dấu cách hợp lệ duy nhất là `z = y++ +`

```
++x.
```

- Một vấn đề white space thứ ba xảy ra khi lập trình viên có hai pointers-to-int và muốn chia int này cho int kia. Đoạn code là

```
ratio = *x/*y;
```

nhưng compiler phát thông báo lỗi phàn nàn về syntax error. Vấn đề là thiếu dấu cách giữa division operator “`/` ” và indirection operator “`*` ”. Khi đặt liền nhau, chúng mở một comment và che toàn bộ code cho đến dấu đóng comment tiếp theo!

Liên quan đến việc vô tình mở comment là trường hợp vô tình không đóng comment khi bạn định làm vậy. Một release của ANSI C compiler có bug thú vị. Symbol table được truy cập bằng một hash function tính vị trí thích hợp để bắt đầu tìm kiếm tuần tự. Phép tính có rất nhiều comment, thậm chí mô tả cả cuốn sách mà thuật toán được lấy từ đó. Đáng tiếc là lập trình viên quên đóng comment! Vì vậy, toàn bộ phép tính hash initial value nằm trong comment kéo dài, tạo ra đoạn code dưới đây. Hãy bảo đảm bạn nhận ra vấn đề và thử dự đoán chuyện gì đã xảy ra.

```
int hashval=0;
/* PJW hash function from "Compilers: Principles, Techniques,
and Tools"
 * by Aho, Sethi, and Ullman, Second Edition.
while (cp < bound)
{
 unsigned long overflow;

 hashval = ( hashval <<4)+*cp++;
 if ((overflow = hashval & (((unsigned long) 0xF) << 28)) != 0)
     hashval ^= overflow | (overflow >> 24);
}
hashval %= ST_HASHSIZE;         /* choose start bucket */
/* Look through each table, in turn, for the name. If we fail,
 * save the string, enter the string's pointer, and return it.
 */
for (hp = &st_ihash; ; hp = hp->st_hnext) {
     int probeval = hashval;    /* next probe value */
```

Toàn bộ phép tính initial hash value bị bỏ qua, nên bảng luôn được tìm kiếm tuần tự từ element thứ 0! Kết quả là symbol table lookup, một thao tác rất thường gặp trong compiler, chậm hơn nhiều so với mức đáng ra phải có. Điều này không được phát hiện trong kiểm thử vì nó chỉ ảnh hưởng đến tốc độ lookup, không ảnh hưởng kết quả. Đây là lý do một số compiler phàn nàn nếu nhận ra dấu mở comment trong một comment string. Cuối cùng, lỗi được tìm thấy trong lúc tìm một bug khác. Việc chèn dấu đóng comment lập tức tăng tốc compile 15%!

### Rẽ sang comment C++

C++ không giải quyết phần lớn các khuyết điểm của C, nhưng có thể tránh được comment run-on ngoài ý muốn này. Giống BCPL, comment C++ bắt đầu bằng `//` và kéo dài đến hết dòng. Ban đầu, người ta nghĩ quy ước comment `//` sẽ không thay đổi nghĩa của bất kỳ đoạn code C đúng cú pháp nào. Đáng tiếc là không phải vậy

```
a //*
//*/ b
```

là `a/b` trong C, nhưng là `a` trong C++. C++ cũng cho phép cách viết comment của C.

### Ngày tháng compiler bị hỏng

Bug được mô tả trong phần này là ví dụ hoàn hảo cho thấy dễ viết một đoạn C compile ngon lành nhưng tạo kết quả rác tại runtime đến mức nào. Có thể làm điều đó trong bất kỳ ngôn ngữ nào, chẳng hạn chỉ cần chia cho 0, nhưng ít ngôn ngữ cung cấp nhiều cơ hội phong phú và vô tình như C.

Pascal compiler của Sun vừa được “quốc tế hóa”, nghĩa là được điều chỉnh để, trong số những việc khác, in ngày trên source listing theo định dạng địa phương. Vì vậy, ở Pháp, ngày có thể hiện là Lundi 6 Avril 1992. Để thực hiện, compiler trước tiên gọi `stat()` để lấy thời gian sửa đổi source file theo định dạng UNIX, rồi gọi `localtime()` để chuyển thành struct tm, cuối cùng gọi `strftime()`, function string-from-time, để chuyển thời gian struct tm thành ASCII string theo định dạng địa phương.

Đáng tiếc là có một bug biểu hiện thành date string bị hỏng. Ngày thực tế xuất hiện không phải là

```
Lundi 6 Avril 1992
```

mà dạng hỏng, như

```
Lui*7& %' Y sxxdj @ ^F
```

Function chỉ có bốn statement, và các argument cho function call đều đúng trong mọi trường hợp. Hãy thử xác định nguyên nhân string bị hỏng.

```
/* Convert the source file timestamp into a localized date
string */
char *
localized_time(char * filename)
{
  struct tm *tm_ptr;
  struct stat stat_block;
  char buffer[120];

  /* get the sourcefile's timestamp in time_t format */
  stat(filename, &stat_block);

  /* convert UNIX time_t into a struct tm holding local time
*/
  tm_ptr = localtime(&stat_block.st_mtime);

  /* convert the tm struct into a string in local format */
  strftime(buffer, sizeof(buffer), "%a %b %e %T %Y", tm_ptr);

  return buffer;
}
```

Bạn thấy chưa? Hết giờ! Vấn đề nằm ở dòng cuối của function, nơi buffer được trả về. Buffer là một automatic array cục bộ của function này. Automatic variable mất đi khi flow of control rời khỏi scope nơi chúng được khai báo. Điều đó có nghĩa là dù bạn trả về pointer đến một variable như vậy, như ở đây, vẫn không thể biết nó trỏ đến gì sau khi thoát function.

Trong C, automatic variable được cấp phát trên stack. Điều này được giải thích kỹ hơn trong Chương 6. Khi thoát function hoặc block chứa chúng, phần stack đó sẵn sàng được tái sử dụng và chắc chắn sẽ bị function được gọi tiếp theo ghi đè. Tùy vị trí auto variable trước đó trên stack, cũng như những variable mà function đang hoạt động khai báo và ghi vào, nó có thể bị ghi đè ngay hoặc về sau, dẫn đến vấn đề hỏng dữ liệu hard-to-find.

Có vài giải pháp.

1\. Trả pointer tới string literal. Ví dụ:

`2.`

```
char *func() { return "Only works for simple strings"; }
```

Đây là giải pháp đơn giản nhất, nhưng không thể dùng nếu bạn cần tính nội dung string, như trong trường hợp này. Bạn cũng có thể gặp rắc rối nếu string literal được lưu trong memory read-only và caller sau đó cố ghi đè nó.

3\. Dùng array khai báo global. Ví dụ:

`4.` `5.` `char *func() { 6.` `... 7.` `my_global_array[i] = 8.` `... 9.` `return my_global_array;`

```
}
```

Cách này hoạt động với những string mà bạn cần xây dựng nội dung, đồng thời vẫn đơn giản và dễ dùng. Nhược điểm là bất kỳ ai cũng có thể sửa global array bất cứ lúc nào, và lời gọi function tiếp theo sẽ ghi đè nó.

10\. Dùng static array. Ví dụ:

`11.` `12.` `char *func() { 13.` `static char buffer[20] ; 14.` `... 15.` `return buffer;`

```
}
```

Cách này giải quyết vấn đề bất kỳ ai cũng có thể ghi đè string. Chỉ những routine mà bạn cung cấp pointer mới có thể sửa static array này. Tuy nhiên, caller phải sử dụng hoặc copy giá trị trước khi một lời gọi khác ghi đè nó. Cũng như với global array, buffer lớn có thể lãng phí memory nếu không được sử dụng.

16\. Cấp phát tường minh một vùng memory để chứa return value. Ví dụ:

`17.` `18.` `char *func() { 19.` `char *s = malloc( 120 ) ; 20.` `... 21.` `return s;`

```
}
```

Phương pháp này có các ưu điểm của static array, và mỗi lần gọi tạo một buffer mới, nên các lời gọi sau không ghi đè giá trị do lời gọi đầu trả về. Nó hoạt động với multithreaded code, tức những chương trình có nhiều thread of control hoạt động tại một thời điểm. Nhược điểm là lập trình viên phải chịu trách nhiệm quản lý memory. Việc này có thể dễ hoặc rất khó, tùy độ phức tạp của chương trình. Nó có thể dẫn đến những bug khó tin nếu memory được free khi vẫn đang dùng, hoặc “memory leak” nếu memory không còn dùng vẫn bị giữ lại. Quên free memory đã cấp phát là điều quá dễ xảy ra.

22\. Có lẽ giải pháp tốt nhất là yêu cầu caller cấp phát memory để chứa return value. Để an toàn, hãy cung cấp số đo kích thước buffer, giống như `fgets()` yêu cầu trong standard library.

`23.` `24.` `void func( char * result, int size) { 25.` `... 26.` `strncpy(result,"That'd be in the data segment, Bob",`

```
size);
```

`27.` `} 28.` `29.` `buffer = malloc(size); 30.` `func( buffer, size ); 31.` `...`

```
free(buffer);
```

Memory management hoạt động tốt nhất nếu bạn có thể viết “free” cùng lúc viết “malloc”. Giải pháp này làm điều đó trở nên khả thi.

Để tránh vấn đề “data corruption”, hãy lưu ý rằng lint sẽ phàn nàn về trường hợp đơn giản nhất sau:

```
return local_array;
```

bằng `warning: function returns pointer to automatic`. Nhưng compiler và lint không phát hiện mọi trường hợp trả local array (có thể bị giấu bởi mức indirection).

### Lint không nên bị tách riêng

Bạn sẽ nhận thấy một chủ đề nhất quán xuyên suốt nhiều vấn đề trên: lint phát hiện và cảnh báo cho bạn. Cần có kỷ luật để bảo đảm code luôn sạch với lint, và sẽ tránh được nhiều rắc rối nếu compiler tự động tạo các lint warning.

Trong những ngày đầu của C trên UNIX, người ta chủ động quyết định tách việc kiểm tra semantics đầy đủ ra khỏi compiler. Thay vào đó, việc kiểm tra lỗi này được một chương trình stand-alone có tên “lint” thực hiện. Bằng cách bỏ error-checking toàn diện, compiler có thể nhỏ hơn, nhanh hơn và đơn giản hơn. Suy cho cùng, ta luôn có thể tin lập trình viên nói đúng điều họ muốn nói và muốn đúng điều họ nói, phải không? Sai!

#### Mẹo thực hành hữu ích

![image](images/ch02/img02-01.png)

Lint sớm, lint thường xuyên

Lint là lương tâm software của bạn. Nó cho bạn biết khi nào bạn đang làm điều không tốt. Hãy luôn dùng lint. Hãy lắng nghe lương tâm mình.

Tách lint khỏi compiler thành một chương trình độc lập là sai lầm lớn mà chỉ đến bây giờ mọi người mới dần chấp nhận. Đúng là nó làm compiler nhỏ hơn và tập trung hơn, nhưng phải trả giá đắt bằng việc để bug và các code idiom đáng ngờ ẩn náu mà không bị phát hiện. Nhiều lập trình viên, có lẽ phần lớn, không mặc định dùng lint sau mỗi lần compile. Compile code có bug thật nhanh là một trade-off tồi. Phần lớn việc kiểm tra của lint nay bắt đầu xuất hiện trở lại trong compiler.

Tuy nhiên, có một việc lint thường làm mà phần lớn C compiler implementation hiện không làm: kiểm tra tính nhất quán của việc dùng function qua nhiều file. Nhiều người xem đây là thiếu sót của compiler implementation, thay vì justifi-cation cho một chương trình lint độc lập. Mọi Ada compiler đều thực hiện kiểm tra nhất quán nhiều file này; đó là xu hướng trong C++ translator, và có lẽ cuối cùng cũng sẽ phổ biến trong C.

#### Tiệc lint SunOS

Nhóm phát triển SunOS có lý do chính đáng để tự hào về kernel lint-clean của chúng tôi. Chúng tôi đã dành nhiều công sức để kernel 4.x qua được lint mà không có lỗi và giữ nó như vậy. Khi chuyển source code base từ BSD UNIX sang SVR4 năm 1991, chúng tôi kế thừa một kernel mới chưa rõ tình trạng lint. Chúng tôi quyết định chạy lint cho kernel SVR4.

Hoạt động này diễn ra trong vài tuần và được gọi là “bữa tiệc lint”. Nó tạo ra khoảng 12.000 lint warning khác nhau, mỗi cảnh báo đều phải được điều tra và sửa thủ công. Cuối cùng, khoảng 750 source file được sửa, và công việc được biết đến với tên “cuộc hợp nhất lint từ địa ngục”. Phần lớn lint message chỉ cần một cast tường minh hoặc lint comment, nhưng quá trình cũng làm lộ ra một số bug thực sự:

- Các argument type bị đảo thứ tự giữa function và lời gọi.

- Một function được truyền một argument nhưng lại đòi hỏi ba, nên lấy dữ liệu rác từ stack. Việc phát hiện lỗi này khắc phục một vấn đề hỏng dữ liệu không thường xuyên trong streams subsystem.

- Variable dùng trước khi đặt giá trị.

Giá trị không chỉ nằm ở việc loại bỏ bug hiện có, mà còn ngăn bug mới làm nhiễm source code base. Bây giờ, chúng tôi giữ kernel lint-clean bằng cách yêu cầu mọi thay đổi hoặc bổ sung source code đều phải chạy qua lint và cstyle. Theo cách này, chúng tôi không chỉ loại bỏ bug hiện có mà còn giảm số bug trong tương lai.

Một số lập trình viên phản đối mạnh mẽ ý tưởng đưa lint trở lại compiler, với lý do nó làm compiler chậm đi và tạo quá nhiều cảnh báo không xác đáng. Đáng tiếc là kinh nghiệm đã nhiều lần chứng minh rằng tách lint thành công cụ riêng chủ yếu dẫn đến việc lint không được dùng.

Về mặt kinh tế của software, bug được tìm thấy càng sớm trong development cycle thì chi phí sửa càng thấp. Vì vậy, để lint, hoặc tốt hơn là chính compiler, làm thêm công việc tìm vấn đề thay vì debugger là một khoản đầu tư tốt. Nhưng để debugger tìm vấn đề vẫn tốt hơn để nhóm kiểm thử nội bộ tìm thấy. Lựa chọn tệ nhất là để khách hàng phát hiện vấn đề.

## Giải trí nhẹ nhàng — Một số tính năng thật sự là lỗi!

Chương này sẽ chưa hoàn chỉnh nếu không kết thúc câu chuyện về các nhiệm vụ không gian và software. Câu chuyện về Fortran loop `DO` ở đầu chương, xuất phát từ các chuyến bay Mercury dưới quỹ đạo, thường xuyên bị gắn nhầm với nhiệm vụ Mariner 1.

Trùng hợp là Mariner 1 thực sự có liên quan đến một sự cố software nghiêm trọng, nhưng nó diễn ra theo cách hoàn toàn khác và không liên quan đến lựa chọn ngôn ngữ. Mariner 1 được phóng vào tháng 7 năm 1962 để đưa một tàu thăm dò đến sao Kim, nhưng phải bị phá hủy vài phút sau khi phóng khi tên lửa Atlas bắt đầu lệch hướng.

Sau nhiều tuần phân tích, người ta xác định vấn đề nằm trong software, nhưng đó là lỗi chép lại thuật toán chứ không phải program bug. Nói cách khác, chương trình đã làm đúng như lập trình viên nghĩ, nhưng specification đã cung cấp thông tin sai cho anh! Tracking algorithm dự định dùng vận tốc được làm mượt, tức lấy trung bình. Ký hiệu toán học cho điều này là một dấu gạch ngang đặt trên đại lượng cần làm mượt. Trong các phương trình dẫn đường viết tay đưa cho lập trình viên, dấu gạch ngang bị bỏ sót ngoài ý muốn.

Lập trình viên tuân theo chính xác thuật toán được giao và dùng vận tốc thô trực tiếp từ radar thay vì vận tốc được làm mượt. Kết quả là chương trình thấy những dao động nhỏ trong vận tốc tên lửa và, trong một negative feedback loop điển hình, gây ra hành vi thất thường thực sự khi cố hiệu chỉnh. Chương trình lỗi đã có trong các nhiệm vụ trước, nhưng đây là lần đầu nó được thực thi. Các chuyến bay trước được điều khiển từ mặt đất, nhưng lần này một antenna hỏng, ngăn việc nhận chỉ thị vô tuyến và do đó khiến control software on-board được gọi.

Bài học: ngay cả khi có thể làm ngôn ngữ lập trình đáng tin cậy 100%, bạn vẫn có thể trở thành nạn nhân của bug thuật toán gây thảm họa. Từ lâu, chúng tôi cho rằng lập trình viên làm việc trên real-time control system nên có đặc quyền đi chuyến đầu tiên trên prototype hoạt động được. Nói cách khác, nếu code của bạn triển khai hệ thống duy trì sự sống trên tàu con thoi, bạn sẽ được phóng vào không gian và tự debug mọi trục trặc vào phút chót. Chắc chắn điều này sẽ đem lại sự tập trung hoàn toàn mới vào chất lượng sản phẩm. Bảng 2-2 cho thấy một số cơ hội.

Bảng 2-2. Sự thật về hai thất bại software không gian nổi tiếng

| Khi nào | Nhiệm vụ | Lỗi | Kết quả | Nguyên nhân |
|---|---|---|---|---|
| Mùa hè 1961 | Mercury | Dùng . thay , | Không; tìm lỗi trước chuyến bay | Khiếm khuyết ngôn ngữ Fortran |
| 22 tháng 7 năm 1962 | Mariner 1 | Viết "R" thay " " trong specification | Rocket, probe $12M bị hủy | Lập trình viên theo lỗi specification |

![](images/ch02/img02-05.png)

Hãy dành lời cuối của chương cho một câu chuyện hiện đại hơn về sự cố software không gian, gần như chắc chắn là hư cấu. Trong mỗi nhiệm vụ tàu con thoi, có một cargo manifest, tức danh sách mọi thứ phải được đưa lên tàu trước khi phóng. Manifest liệt kê từng món cùng trọng lượng, rất quan trọng để tính nhiên liệu và cân bằng tàu. Dường như trước chuyến bay đầu tiên, một người quản lý bến đang đánh dấu kiểm tra từng món khi chúng được đưa lên tàu. Ông kiểm tra xong các computer system, rồi đến mục software trong manifest. Nó ghi software có trọng lượng bằng 0, gây một cơn hoảng loạn nhỏ: suy cho cùng, chắc chắn mọi thứ đều phải có trọng lượng chứ!

Có một số cuộc trao đổi cuống cuồng giữa bến bốc hàng và trung tâm máy tính trước khi vấn đề được giải quyết, và software zero-weight, tức các bit pattern trong memory, được phép đi qua! Dĩ nhiên, mọi người đều biết thông tin có khối lượng theo nghĩa tương đối tính, nhưng đừng phá hỏng câu chuyện hay bằng sự câu nệ, nhé?

### Tài liệu tham khảo

Ceruzzi, Paul, Beyond the Limits—Flight Enters the Computer Age, Cambridge, MA, MIT Press,1989

Hill, Gladwyn, "For Want of Hyphen Venus Rocket is Lost," New York Times, July 28, 1962.

Nicks, Oran W., Far Travelers—The Exploring Machines, NASA publication SP-480, 1985.

"Venus Shot Fails as Rocket Strays," Associated Press, New York Times, July 23, 1962.
