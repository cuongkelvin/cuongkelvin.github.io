# Chương 3. Gỡ rối declaration trong C

"Tên bài hát được gọi là 'Mắt cá tuyết.'"

“Ồ, đó là tên bài hát phải không?” Alice nói, cố tỏ ra hứng thú.

“Không, cô chưa hiểu,” Hiệp sĩ nói với vẻ hơi bực bội.

"Đó là cách gọi cái tên. Tên thật là 'Ông già già nua.'"

"Vậy tôi nên nói 'Đó là cách gọi bài hát'?" Alice sửa lời. "Không, không nên: đó là chuyện hoàn toàn khác! Bài hát được gọi 'Cách thức và phương tiện': nhưng chỉ là cách gọi thôi, cô biết đấy!"

“Vậy bài hát là gì?” Alice hỏi, lúc này đã hoàn toàn bối rối.

"Tôi đang đến chỗ đó," Hiệp sĩ nói. "Bài hát thật sự là 'A-sitting On A Gate': giai điệu do tôi nghĩ ra."

—Lewis Carroll, Through the Looking Glass

syntax chỉ compiler yêu nổi…declaration hình thành thế nào…đôi lời về struct…đôi lời về union…đôi lời về enum…quy tắc precedence…gỡ declaration C bằng sơ đồ…typedef có thể là bạn…khác biệt typedef và #define…"typedef struct foo { ... foo } foo;" nghĩa gì…đoạn code hiểu mọi parsing…giải trí nhẹ nhàng — software cắn nòng nọc sáp

Có câu chuyện rằng Nữ hoàng Victoria ấn tượng với Alice in Wonderland đến mức yêu cầu các bản sách khác của Lewis Carroll. Nữ hoàng không biết Lewis Carroll là pen-name của giáo sư toán Oxford Charles Dodgson. Bà không vui khi các cận thần cười khúc khích mang đến một số tập sách dày, trong đó có The Condensation (Factoring) of Determinants. Câu chuyện được kể nhiều vào thời Victoria, và Dodgson cố hết sức bác bỏ nó:

“Tôi nhân cơ hội này để công khai hết mức có thể lời bác bỏ một câu chuyện ngớ ngẩn đang được báo chí truyền đi, rằng tôi đã tặng một số cuốn sách cho Nữ hoàng. Nó được lặp lại liên tục và hoàn toàn là chuyện hư cấu, nên tôi nghĩ đáng để tuyên bố một lần cho dứt khoát rằng câu chuyện sai hoàn toàn trong từng chi tiết: chưa từng xảy ra bất cứ điều gì dù chỉ tương tự.”

—Charles Dodgson, Symbolic Logic, ấn bản thứ hai

Vì vậy, theo nguyên tắc “ông ấy phản đối quá mức”, chúng ta có thể khá chắc rằng sự việc thực sự xảy ra đúng như được mô tả. Dù sao, Dodgson hẳn sẽ rất hợp với C, còn Nữ hoàng Victoria thì không. Đưa trích dẫn ở đầu chương vào một bảng, chúng ta có:

được gọi là là

tên bài hát "Mắt cá tuyết" "Ông già già nua" bài hát "Cách thức và phương tiện" "A-sitting On A Gate"

Đúng vậy, Dodgson hẳn sẽ rất thoải mái với computer science. Và ông đặc biệt sẽ đánh giá cao các type model trong ngôn ngữ lập trình. Chẳng hạn, với các declaration C:

```
typedef char * string;
string punchline = "I'm a frayed knot";
```

chúng ta có thể thấy mô hình của Hiệp sĩ được áp dụng như thế nào:

được gọi là là

type của variable `string` `char *` variable `punchline` `"I'm a frayed knot"` Còn điều gì có thể trực quan hơn thế? Thực ra là khá nhiều điều, và chúng sẽ còn rõ ràng hơn sau khi bạn đọc chương này.

## Syntax chỉ compiler yêu nổi

Như Kernighan và Ritchie thừa nhận, “C đôi khi bị chỉ trích vì cú pháp declaration” (K\&R, ấn bản 2, trang 122). Declaration syntax của C rất dễ cho compiler hoặc compiler-writer xử lý, nhưng khó đối với lập trình viên thông thường. Người thiết kế ngôn ngữ cũng chỉ là con người, và sai lầm sẽ xảy ra. Chẳng hạn, Ada language reference manual đưa ra một grammar mơ hồ trong phụ lục cuối sách. Ambiguity là đặc tính rất không mong muốn của grammar ngôn ngữ lập trình, vì nó làm com-plicates đáng kể công việc của compiler-writer. Nhưng cú pháp declaration C thực sự là một mớ hỗn độn kinh khủng, thấm vào việc sử dụng toàn bộ ngôn ngữ. Không quá lời khi nói C phức tạp đáng kể và không cần thiết vì cách kết hợp type vụng về.

Có một số lý do khiến declaration model của C khó hiểu. Vào cuối thập niên 1960, khi phần này của C được thiết kế, “type model” chưa phải lĩnh vực được hiểu rõ trong lý thuyết ngôn ngữ lập trình. BCPL, ngôn ngữ ông nội của C, là type-poor, chỉ có binary word làm data type duy nhất, nên C dựa trên một nền tảng thiếu sót. Ngoài ra còn có triết lý C rằng declaration của object nên giống cách sử dụng nó. Một array gồm các pointers-to-integers được khai báo bằng `int * p[3];`, và một integer được tham chiếu hoặc dùng trong expression bằng cách viết `*p[i]`, nên declaration giống cách dùng. Ưu điểm là precedence của các operator trong “declaration” giống như trong “use”. Nhược điểm là operator precedence, với 15 mức trở lên tùy cách đếm, lại là một phần phức tạp quá mức khác của C. Lập trình viên phải nhớ các rule đặc biệt để xác định `int *p[3]` là array gồm các pointers-to-int hay pointer đến array gồm các int.

Ý tưởng declaration nên giống cách sử dụng dường như bắt nguồn từ C và chưa được ngôn ngữ nào khác áp dụng. Nhưng cũng có thể “declaration giống cách dùng” không tuyệt vời như người ta tưởng lúc đó. Có gì hay khi làm hai thứ khác nhau trông giống nhau? Những người ở Bell Labs thừa nhận lời phê bình, nhưng đến nay vẫn bảo vệ quyết định này đến cùng. Ý tưởng tốt hơn có lẽ là khai báo pointer như

```
int &p;
```

ít nhất gợi ý rằng `p` là address của một integer. Cú pháp này hiện đã được C++ dùng để chỉ một parameter được truyền theo call by reference.

Vấn đề lớn nhất là bạn không còn có thể đọc declaration từ trái sang phải, cách mà mọi người thấy tự nhiên nhất. Tình hình tệ hơn khi ANSI C đưa vào các keyword `volatile` và `const`; vì chúng chỉ xuất hiện trong declaration, không xuất hiện trong cách sử dụng, giờ có ít trường hợp hơn mà cách dùng variable mô phỏng declaration của nó. Bất kỳ thứ gì có dạng declaration nhưng không có identifier, chẳng hạn formal parameter declaration hoặc cast, đều trông kỳ lạ. Nếu muốn cast một thứ sang type pointer-to-array, bạn phải diễn đạt cast như sau:

```
char (*j)[20]; /* j is a pointer to an array of 20 char */
j = (char (*)[20]) malloc( 20 );
```

Nếu bỏ các dấu ngoặc đơn có vẻ thừa quanh dấu sao, declaration trở nên không hợp lệ. Declaration có pointer và `const` có một số cách sắp xếp khả dĩ:

```
const int * grape;
int const * grape;
int * const grape_jelly;
```

Trường hợp cuối làm pointer trở thành read-only, trong khi hai trường hợp kia làm object mà nó trỏ đến trở thành read-only; dĩ nhiên, cả object lẫn thứ nó trỏ đến đều có thể là constant. Một trong hai declaration tương đương sau sẽ thực hiện điều này:

```
const int * const grape_jam;
int const * const grape_jam;
```

Tiêu chuẩn ANSI ngầm thừa nhận những vấn đề khác khi nói typedef specifier chỉ được gọi là “storage-class specifier” để tiện về cú pháp. Đây là lĩnh vực mà ngay cả lập trình viên C giàu kinh nghiệm cũng thấy khó xử lý. Nếu declaration syntax đã khó coi với thứ đơn giản như array gồm các pointer, hãy xem nó trông thế nào với thứ chỉ phức tạp hơn một chút. Chẳng hạn, declaration sau, được phỏng theo chương trình `telnet`, chính xác khai báo điều gì?

```
char* const *(*next)();
```

Chúng ta sẽ trả lời câu hỏi bằng cách dùng declaration này làm ví dụ ở phần sau của chương. Qua nhiều năm, lập trình viên, sinh viên và giáo viên đã vất vả tìm các mẹo ghi nhớ và thuật toán đơn giản giúp hiểu được cú pháp C kinh khủng. Chương này trình bày một thuật toán tiếp cận step-by-step để giải quyết vấn đề. Hãy thực hiện nó với vài ví dụ, và bạn sẽ không bao giờ phải lo về declaration C nữa!

## Declaration hình thành thế nào

Trước tiên, hãy xem một số thuật ngữ C và những thành phần riêng lẻ có thể tạo nên declaration. Một thành phần quan trọng là declarator, trái tim của mọi declaration; đại khái, declarator là identifier cùng mọi pointer, function bracket hoặc array indica-tions đi kèm, như trong Hình 3-1. Để tiện, chúng ta cũng nhóm mọi initializer vào đây.

Hình 3-1. Declarator trong C

![image](images/ch03/img03-01.png)

Declaration gồm những phần được trình bày trong Hình 3-2 Hình 3-2 (không phải mọi tổ hợp đều hợp lệ, nhưng bảng này cung cấp từ vựng cho phần thảo luận tiếp theo). Declaration cho biết basic type bên dưới của variable và mọi initial value.

Hình 3-2. Declaration trong C

![image](images/ch03/img03-02.png)

Chúng ta bắt đầu thấy declaration có thể phức tạp đến mức nào khi kết hợp các type. Cũng hãy nhớ có những hạn chế đối với declaration hợp lệ. Bạn không thể có bất kỳ dạng nào sau đây:

- Function không thể trả về function, nên bạn sẽ không bao giờ thấy `foo()()`

- Function không thể trả về array, nên bạn sẽ không bao giờ thấy `foo()[]`

- Array không thể chứa function, nên bạn sẽ không bao giờ thấy `foo[]()`

Có thể có những thứ sau:

- Function được phép trả về pointer tới function: `int (* fun())();`

- Function được phép trả về pointer tới array: `int (* foo())[]`

- Array được phép chứa pointer tới function: `int (*foo[])()`

- Array có thể chứa array khác, vì vậy bạn sẽ thường thấy `int foo[][]`

Trước khi xử lý việc kết hợp type, chúng ta sẽ ôn lại cách kết hợp variable trong struct và union, đồng thời xem xét enum.

### Đôi lời về `structs`

Struct chỉ là một nhóm data item được gom lại. Các ngôn ngữ khác gọi nó là “record”. Cú pháp struct dễ nhớ: cách thông thường để gom các thứ trong C là đặt chúng trong ngoặc nhọn: { các thứ... } Keyword `struct` đứng ở đầu để compiler có thể phân biệt nó với một block:

```
struct {stuff... }
```

Nội dung trong struct có thể là bất kỳ data declaration nào khác: data item riêng lẻ, array, struct khác, pointer, v.v. Sau struct definition, chúng ta có thể đặt một số variable name để khai báo các variable thuộc type struct này, chẳng hạn:

```
struct {stuff... } plum, pomegranate, pear;
```

Điểm duy nhất khác cần chú ý là chúng ta có thể viết một “structure tag” tùy chọn sau keyword “struct”:

```
struct fruit_tag {stuff... } plum, pomegranate, pear;
```

Bây giờ có thể dùng cụm `struct fruit_tag` làm cách viết tắt cho

```
struct {stuff... }
```

trong các declaration về sau.

Vậy `struct` có dạng chung:

```
struct optional_tag {
              type_1 identifier_1;
              type_2 identifier_2;
              ...
              type_N identifier_N;
              } optional_variable_definitions;
```

Với các declaration

```
struct date_tag { short dd,mm,yy; } my_birthday, xmas;
struct date_tag easter, groundhog_day;
```

Các variable `my_birthday,` `xmas,` `easter,` và `groundhog_day` đều có type giống hệt nhau. Struct cũng có thể có bit field, unnamed field và field word-aligned. Chúng được tạo bằng cách đặt dấu hai chấm và một số biểu thị độ dài field tính bằng bit sau field declaration.

```
/* process ID info */

struct pid_tag {
unsigned int inactive :1;
unsigned int          :1;       /* 1 bit of padding */
unsigned int refcount :6;
unsigned int          :0;       /* pad to next word boundary
*/
short pid_id;
struct pid_tag *link;
};
```

Điều này thường được dùng để “lập trình sát đến silicon”, và bạn sẽ gặp trong các chương trình hệ thống. Nó cũng có thể dùng để lưu Boolean flag trong một bit thay vì một char. Bit field phải có type int, unsigned int hoặc signed int, hoặc phiên bản có qualifier của một trong các type này. Việc bit field có type int có thể mang giá trị âm hay không là implementation-dependent.

Chúng tôi không thích trộn struct declaration với variable definition. Chúng tôi thích

```
struct veg { int weight, price_per_lb; };
struct veg onion, radish, turnip;
```

hơn

```
struct veg { int weight, price_per_lb; } onion, radish, turnip;
```

Đúng là phiên bản thứ hai giúp bạn đỡ gõ vài ký tự code, nhưng chúng ta nên quan tâm nhiều hơn đến việc code dễ đọc chứ không phải dễ viết. Chúng ta viết code một lần, nhưng nó được đọc nhiều lần trong quá trình bảo trì chương trình sau này. Một dòng chỉ làm một việc sẽ dễ đọc hơn một chút. Vì lý do đó, variable declaration nên tách riêng khỏi type declaration.

Cuối cùng, có hai vấn đề truyền parameter liên quan đến struct. Một số sách C nói những câu như “parameter được truyền cho function được gọi bằng cách đẩy lên stack từ phải sang trái”. Đây là sự đơn giản hóa quá mức: nếu có cuốn sách như vậy, hãy xé trang đó ra và đốt đi. Nếu có compiler như vậy, hãy xé những byte đó ra. Khi có thể, parameter được truyền trong register để tăng tốc. Hãy lưu ý rằng int “i” rất có thể được truyền theo cách hoàn toàn khác với struct “s” chỉ có một member là int. Giả sử int parameter thường được truyền trong register, bạn có thể thấy struct lại được truyền trên stack. Điểm thứ hai cần lưu ý là bằng cách đặt array trong struct như sau:

```
/* array inside a struct */
struct s_tag { int a[100]; };
```

giờ bạn có thể coi array là một first-class type. Bạn có thể copy toàn bộ array bằng assignment statement, truyền nó cho function theo by value và dùng nó làm return type của function.

```
struct s_tag { int a[100]; };
struct s_tag orange, lime, lemon;
struct s_tag twofold (struct s_tag s) {
    int j;
    for (j=0;j<100;j++) s.a[j] *= 2;
    return s;
}

main() {
    int i;
    for (i=0;i<100;i++) lime.a[i] = 1;
    lemon = twofold(lime);
    orange = lemon; /* assigns entire struct */
}
```

Thông thường, bạn không muốn gán toàn bộ array quá thường xuyên, nhưng có thể thực hiện bằng cách đặt nó trong struct. Hãy kết thúc bằng một cách làm cho struct chứa pointer đến chính type của nó, như cần thiết với list, tree và nhiều dynamic data structure.

```
/* struct that points to the next struct */
struct node_tag { int datum;
                  struct node_tag *next;
                };
struct node_tag a,b;
a.next = &b;       /* example link-up */
a.next->next=NULL;
```

### Đôi lời về `unions`

Trong nhiều ngôn ngữ khác, union được biết đến như variant part của variant record. Chúng có hình thức tương tự struct, nhưng memory layout có một khác biệt then chốt. Thay vì mỗi member được lưu sau điểm kết thúc của member trước, mọi member đều có offset bằng 0. Vì vậy, storage của các member riêng lẻ chồng lên nhau: chỉ một member có thể được lưu ở đó tại một thời điểm.

Có cả tin tốt và tin xấu liên quan đến union. Tin xấu là tin tốt không tốt đến thế. Tin tốt là union có hình thức tổng quát giống hệt struct, chỉ thay keyword `struct` bằng `union`. Vì vậy, nếu đã quen với mọi biến thể và khả năng của struct, bạn cũng đã biết union. Union có dạng tổng quát:

```
union optional_tag {
        type_1 identifier_1;
        type_2 identifier_2;
          ...
        type_N identifier_N;
} optional_variable_definitions;
```

Union thường xuất hiện như một phần của struct lớn hơn, vốn có thông tin ngầm hoặc tường minh về type dữ liệu thực sự đang hiện diện. Ở đây có sự thiếu an toàn type rõ ràng khi lưu dữ liệu bằng một type và lấy ra bằng type khác. Ada giải quyết bằng cách yêu cầu discriminant field phải được lưu tường minh trong record. C thì bảo bạn tự lo và dựa vào lập trình viên để nhớ thứ đã được đặt vào đó.

Union thường được dùng để tiết kiệm dung lượng, bằng cách không lưu mọi khả năng của những data item không thể cùng xuất hiện. Chẳng hạn, nếu đang lưu thông tin động vật học về một số loài, lần thử đầu với data record có thể là:

```
struct creature {
 char has_backbone;
 char has_fur;
 short num_of_legs_in_excess_of_4;
};
```

Tuy nhiên, chúng ta biết mọi sinh vật đều có xương sống hoặc không có xương sống. Chúng ta cũng biết chỉ động vật có xương sống mới có lông, và chỉ sinh vật không xương sống mới có nhiều hơn bốn chân. Không sinh vật nào vừa có hơn bốn chân vừa có lông, nên có thể tiết kiệm dung lượng bằng cách lưu hai field loại trừ nhau này trong một union:

```
union secondary_characteristics {
 char has_fur;
 short num_of_legs_in_excess_of_4;
};
struct creature {
           char has_backbone;
           union secondary_characteristics form;
};
```

Thông thường, chúng ta chồng các vùng lưu trữ như vậy để tiết kiệm backing store. Nếu có data file chứa 20 triệu con vật, cách này có thể tiết kiệm đến 20 Mb dung lượng disk.

Tuy nhiên, union còn có một cách dùng khác. Union cũng có thể được dùng không phải để có một cách diễn giải cho hai phần dữ liệu khác nhau, mà để có hai cách diễn giải khác nhau cho cùng dữ liệu. Điều thú vị là nó thực hiện đúng công việc của REDEFINES clause trong COBOL. Một ví dụ là:

```
union bits32_tag {
        int whole;                       /* one 32-bit value
*/
        struct {char c0,c1,c2,c3;} byte; /* four 8-bit bytes
*/
} value;
```

Union này cho phép lập trình viên lấy toàn bộ giá trị 32-bit hoặc các byte field riêng lẻ như `value.byte.c0`, v.v. Có những cách khác để thực hiện, nhưng union làm được mà không cần thêm assignment hay type cast. Chỉ để cho vui, tôi xem qua khoảng 150.000 dòng operating system source code machine-independent, và ôi, tay tôi mỏi thật đấy. Kết quả cho thấy struct phổ biến hơn union khoảng một trăm lần. Đó là chỉ dấu cho thấy trong thực tế bạn sẽ gặp struct thường xuyên hơn union đến mức nào.

### Đôi lời về `enums`

Enum, hay enumerated type, đơn giản là một cách liên kết một chuỗi tên với một chuỗi integer value. Trong ngôn ngữ weakly typed như C, chúng cung cấp rất ít điều không thể thực hiện bằng `#define`, nên bị bỏ khỏi phần lớn implementation K\&R C ban đầu. Nhưng phần lớn ngôn ngữ khác có chúng, nên cuối cùng C cũng có. Đến đây, dạng tổng quát của enum hẳn trông quen thuộc:

```
enum optional_tag {stuff... } optional_variable_definitions;
```

“Các thứ…” trong trường hợp này là một danh sách identifier, có thể kèm integer value được gán cho chúng. Ví dụ về enumerated type là:

```
enum sizes { small=7, medium, large=10, humungous };
```

Mặc định, các integer value bắt đầu từ 0. Nếu bạn gán một giá trị trong danh sách, giá trị tiếp theo lớn hơn một đơn vị, và cứ thế. Enum có một ưu điểm: khác với các tên #defined thường bị loại bỏ khi compile, tên enum thường tồn tại đến debugger và có thể được dùng khi debug code.

## Quy tắc precedence

Đến đây, chúng ta đã ôn lại các thành phần tạo nên declaration. Phần này mô tả một phương pháp phân tách chúng thành lời giải thích bằng tiếng Anh. Precedence rule để hiểu declaration C là rule mà các “luật sư ngôn ngữ” thích nhất. Nó rất ngắn gọn nhưng rất thiếu trực giác.

Quy tắc precedence hiểu declaration C

A Declaration được đọc bằng cách bắt đầu từ tên rồi đọc theo thứ tự precedence. B Precedence, từ cao xuống thấp, là: B.1 các dấu ngoặc đơn nhóm những phần của declaration với nhau B.2 các postfix operator: dấu ngoặc đơn `()` chỉ function, và

ngoặc vuông `[]` chỉ array.

B.3 prefix operator: asterisk nghĩa "pointer tới". C Nếu keyword `const` và/hoặc `volatile` sát type specifier (như `int, long`, v.v.) thì

áp dụng cho type specifier. Nếu không, keyword `const` và/hoặc `volatile` áp dụng cho dấu sao pointer nằm ngay bên trái nó.

Ví dụ giải declaration bằng quy tắc precedence:

```
char* const *(*next)();
```

Bảng 3-1. Giải declaration bằng quy tắc precedence

| Rule áp dụng | Giải thích |
|---|---|
| A | Trước tiên, đến tên variable “`next`” và lưu ý rằng nó được ngoặc đơn bao trực tiếp. |
| B.1 | Vì vậy, chúng ta nhóm nó với phần còn lại trong ngoặc đơn, được “`next` là một pointer đến...”. |
| B | Sau đó, ra ngoài ngoặc đơn, chúng ta có lựa chọn giữa một prefix asterisk hoặc một cặp ngoặc đơn postfix. |
| B.2 | Rule B.2 cho biết thành phần có precedence cao nhất là ngoặc đơn function bên phải, nên chúng ta có “`next` là pointer đến một function trả về…”. |
| B.3 | Xử lý prefix "`*`" để được "pointer tới". |
| C | Cuối cùng lấy "`char * const`" như constant pointer tới character. |

Ghép lại thành:

"`next` là pointer tới function trả pointer tới const pointer-to-char"

và chúng ta đã xong. Mọi rule đều quy về precedence rule, nhưng nếu muốn cách trực quan hơn một chút, hãy dùng Hình 3-3.

Hình 3-3. Parse declaration C thế nào

![image](images/ch03/img03-03.png)

## Gỡ declaration C bằng sơ đồ

Trong phần này, chúng ta trình bày một sơ đồ với các bước được đánh số, xem Hình 3-3. Nếu thực hiện từng bước, bắt đầu từ một và đi theo các mũi tên hướng dẫn, bạn có thể nhanh chóng dịch một declaration C có độ phức tạp tùy ý thành tiếng Anh, cũng có độ phức tạp tùy ý. Chúng ta đơn giản hóa declaration bằng cách bỏ qua typedef trong sơ đồ. Để đọc typedef, hãy dịch declaration mà bỏ từ “typedef”. Nếu kết quả là “p là một…”, giờ bạn có thể dùng tên “p” mỗi khi muốn khai báo một thứ thuộc type được dịch ra đó.

Vòng giải mã thần kỳ cho declaration C

Declaration trong C được đọc theo kiểu boustrophedon, tức luân phiên right-to-left với left-to right. Ai ngờ lại có một từ đặc biệt để mô tả điều đó! Hãy bắt đầu ở identifier đầu tiên tìm thấy khi đọc từ trái. Khi đối chiếu một token trong declaration với sơ đồ, chúng ta xóa nó khỏi phần còn phải xem xét. Tại mỗi điểm, chúng ta xem token bên phải trước, rồi mới đến bên trái. Khi mọi thứ đã bị xóa, công việc hoàn tất. Hãy thử vài ví dụ gỡ declaration bằng sơ đồ. Giả sử chúng ta muốn tìm hiểu ví dụ code đầu tiên có nghĩa gì:

```
char* const *(*next)();
```

Khi gỡ declaration này, chúng ta dần “tẩy trắng” những phần đã xử lý để thấy chính xác còn bao nhiêu. Một lần nữa, hãy nhớ `const` có nghĩa là “read-only”. Chỉ vì nó ghi constant không có nghĩa nó nhất thiết là constant.

Quá trình được trình bày trong Bảng 3-2. Trong mỗi bước, phần declaration mà chúng ta đang xử lý được in đậm. Bắt đầu từ bước một, chúng ta sẽ thực hiện các bước sau.

Bảng 3-2. Các bước gỡ declaration C

| Declaration còn lại <br> (từ identifier trái nhất) | Bước tiếp áp dụng | Kết quả |
|---|---|---|
| `char * const *(*next` `)();` | bước 1 | nói "next là…" |
| `char * const *(*)` `();` | bước 2, 3 | không khớp, bước tiếp, nói "next là…" |
| `char * const *(*` `)();` | bước 4 | không khớp, bước tiếp |
| `char * const *(*` `)();` | bước 5 | asterisk khớp, nói "pointer tới …", về bước 4 |
| `char * const *()` `();` | bước 4 | "(" khớp đến ")", về bước 2 |
| `char * const *` `()` `;` | bước 2 | không khớp, bước tiếp |
| `char * const *` `()` `;` | bước 3 | nói "function trả…" |
| `char * const` `*` `;` | bước 4 | không khớp, bước tiếp |
| `char * const` `*` `;` | bước 5 | nói "pointer tới…" |
| `char *` `const` `;` | bước 5 | nói "read-only…" |
| `char` `*` `;` | bước 5 | nói "pointer tới…" |
| `char` `;` | bước 6 | nói "char" |

Ghép lại thành:

"next là pointer tới function trả pointer tới pointer-to-char read-only"

và xong.

Giờ thử ví dụ phức tạp hơn.

```
char *(*c[10])(int **p);
```

Hãy thử thực hiện các bước theo cùng cách như ví dụ trước. Các bước được cung cấp ở cuối chương để bạn có cơ hội tự thử và so sánh đáp án.

## `typedef` có thể là bạn

Typedef là một loại declaration thú vị: chúng đưa vào tên mới cho type thay vì dành storage cho variable. Theo một số khía cạnh, typedef giống macro text replacement: nó không đưa vào type mới mà chỉ một tên mới cho type, nhưng có một khác biệt then chốt được giải thích ở phần sau.

Nếu xem lại phần cách declaration được hình thành, bạn sẽ thấy keyword `typedef` có thể là một phần của declaration thông thường, xuất hiện đâu đó gần đầu. Thực tế, typedef có định dạng giống hệt variable declaration, chỉ thêm keyword này để báo cho bạn biết.

Vì typedef trông giống hệt variable declaration, nó cũng được đọc giống hệt. Các kỹ thuật ở những phần trước đều áp dụng được. Thay vì declaration nói “tên này tham chiếu đến một variable có type đã nêu”, keyword `typedef` không tạo variable mà khiến declaration nói “tên này là từ đồng nghĩa cho type đã nêu”.

Thông thường, cách này được dùng cho những trường hợp khó liên quan đến pointer trỏ đến một thứ gì đó. Ví dụ kinh điển là declaration của prototype `signal()`. Signal là một system call yêu cầu runtime system gọi một routine cụ thể mỗi khi một “software interrupt” được chỉ định xuất hiện. Thực ra, nó nên được gọi là “Call\_that\_routine\_when\_this\_interrupt\_comes\_in”. Bạn gọi `signal()` và truyền argument để chỉ ra đang nói đến interrupt nào và routine nào cần được gọi để xử lý nó. Tiêu chuẩn ANSI cho thấy signal được khai báo như sau:

```
void (*signal(int sig, void (*func)(int)) ) (int);
```

Vận dụng kỹ năng new-found về đọc declaration, chúng ta có thể xác định ý nghĩa của nó như sau:

```
void (*signal(                          ) ) (int);
```

`signal` là một function (với một số argument kỳ lạ) trả về pointer đến một function (nhận một int argument và trả về void). Bản thân một trong những argument kỳ lạ đó là:

```
void (*func)(int) ;
```

một pointer đến function nhận một int argument và trả về void. Sau đây là cách đơn giản hóa bằng một typedef “tách ra” phần chung.

```
typedef void (*ptr_to_func) (int);
/* this says that ptr_to_func is a pointer to a function
 * that takes an int argument, and returns void
 */


ptr_to_func signal(int, ptr_to_func);
/* this says that signal is a function that takes
 * two arguments, an int and a ptr_to_func, and
 * returns a ptr_to_func
 */
```

Tuy nhiên, typedef không phải không có nhược điểm. Nó có cùng cú pháp gây nhầm lẫn với các declaration khác, và cùng khả năng nhồi nhiều declarator vào một declaration. Về cơ bản, nó không cung cấp gì cho struct ngoài khả năng không hữu ích là bỏ keyword `struct`. Và trong bất kỳ `typedef` nào, bạn thậm chí không phải đặt `typedef` ở đầu declaration!

### Mẹo thực hành hữu ích

![image](images/ch03/img03-04.png)

Mẹo làm việc với declarator

Đừng đặt nhiều declarator trong một typedef như:

```
typedef int *ptr, (*fun)(), arr[5];
/* ptr is the type "pointer to int"
 * fun is the type "pointer to a function returning int"
 * arr is the type "array of 5 ints"
 */
```

Và tuyệt đối đừng chôn typedef giữa declaration như:

```
unsigned const long typedef int volatile *kumquat;
```

Typedef tạo alias cho data type thay vì tạo data type mới. Bạn có thể typedef bất kỳ type nào.

```
typedef int (*array_ptr)[100];
```

Chỉ cần viết declaration cho một variable có type bạn muốn. Hãy để tên variable là tên bạn muốn dùng làm alias. Viết keyword “typedef” ở đầu, như đã minh họa. Typedef name không được trùng với một identifier khác trong cùng block.

## Khác biệt giữa `typedef int x[10]` và `#define x int[10]`

Như đã đề cập, có một khác biệt then chốt giữa typedef và macro text replacement. Cách hiểu đúng là xem typedef như một type được “đóng gói” hoàn chỉnh: bạn không thể thêm vào nó sau khi đã khai báo. Sự khác biệt giữa điều này và macro thể hiện theo hai cách.

Bạn có thể mở rộng một macro typename bằng các type specifier khác, nhưng không thể làm như vậy với typename được định nghĩa bằng typedef. Nghĩa là,

```
#define peach int
unsigned peach i; /* works fine */

typedef int banana;
unsigned banana i; /* Bzzzt! illegal */
```

Thứ hai, tên typedef cung cấp type cho mọi declarator trong declaration.

```
#define int_ptr int *
int_ptr chalk, cheese;
```

Sau macro expansion, dòng hai thực sự thành:

```
int * chalk, cheese;
```

Điều này làm chalk và cheese khác nhau như chutney và chives: chalk là pointer-to-an-integer, còn cheese là integer. Ngược lại, một typedef như sau:

```
typedef char * char_ptr;
char_ptr Bentley, Rolls_Royce;
```

khai báo cả Bentley và Rolls\_Royce giống nhau. Tên ở phía trước khác nhau, nhưng cả hai đều là pointer đến char.

## `typedef struct foo { ... foo; } foo;` nghĩa gì

C có nhiều namespace:

\* label name

\* tag (một namespace cho mọi struct, enum, union)

\* member name (mỗi struct, union có namespace riêng)

\* mọi thứ khác. Mọi thứ trong một namespace phải là duy nhất, nhưng có thể dùng cùng tên cho những thứ thuộc các namespace khác nhau. Vì mỗi struct hoặc union có namespace riêng, các member name giống nhau có thể được tái sử dụng trong nhiều struct khác nhau. Điều này không đúng với các compiler rất cũ, và là một lý do người ta thêm một ký tự đầu duy nhất làm prefix cho field name trong kernel code BSD 4.2, như sau:

```
struct vnode {
        long              v_flag;
        long              v_usecount;
        struct vnode      *v_freef;
        struct vnodeops   *v_op;
};
```

Vì việc dùng cùng tên trong các namespace khác nhau là hợp lệ, đôi khi bạn thấy code như sau.

```
struct foo {int foo;} foo;
```

Điều này chắc chắn sẽ gây nhầm lẫn và nản lòng cho các lập trình viên sau này phải bảo trì code của bạn. Và `sizeof( foo );` sẽ tham chiếu đến điều gì?

Còn đáng sợ hơn. Declaration sau hoàn toàn hợp lệ:

```
typedef struct baz {int baz;} baz;
        struct baz variable_1;
               baz variable_2;
```

Quá nhiều “baz”! Hãy thử lại với những tên dễ hiểu hơn để xem điều gì đang xảy ra:

```
typedef struct my_tag {int i;} my_type;
        struct my_tag variable_1;
my_type variable_2;
```

Typedef đưa vào tên `my_type` làm cách viết tắt cho “`struct` `my_tag` `{int i}`”, nhưng đồng thời cũng đưa vào structure tag `my_tag`, có thể được dùng cùng keyword `struct`. Nếu dùng cùng identifier cho type và tag trong một typedef, nó có tác dụng làm keyword “`struct`” trở thành tùy chọn, tạo ra một mô hình tư duy hoàn toàn sai về điều đang diễn ra. Đáng tiếc là cú pháp cho kiểu struct typedef này giống hệt cú pháp kết hợp struct type với variable declaration. Vì vậy, mặc dù hai declaration sau có hình thức tương tự,

```
typedef struct fruit {int weight, price_per_lb } fruit; /*
statement 1 */
        struct veg   {int weight, price_per_lb } veg;   /*
statement 2 */
```

những điều rất khác nhau đang diễn ra. Statement 1 khai báo một structure tag “fruit” và một structure typedef “fruit”, có thể được dùng như sau:

```
struct fruit mandarin; /* uses structure tag "fruit" */
       fruit tangerine; /* uses structure type "fruit" */
```

Statement 2 khai báo một structure tag “veg” và một variable veg. Chỉ structure tag có thể được dùng trong các declaration tiếp theo, như sau:

```
struct veg potato;
```

Thử khai báo `veg cabbage` sẽ là lỗi. Điều đó giống như viết:

```
int i;
ij;
```

### Mẹo thực hành hữu ích

![image](images/ch03/img03-04.png)

Mẹo làm việc với typedef

Đừng mất công `typedefs` cho `structs`.

Tất cả những gì chúng làm là giúp bạn khỏi viết từ “struct”, vốn là một gợi ý mà có lẽ bạn không nên che giấu.

Dùng typedef cho:

- Các type kết hợp array, struct, pointer hoặc function.

- Type portable. Khi cần một type có độ rộng ít nhất, chẳng hạn, 20-bits, hãy tạo typedef cho nó. Sau đó, khi port code sang platform khác, hãy chọn type thích hợp, `short,` `int,` `long,` và chỉ sửa typedef thay vì mọi declaration.

- Cast. Typedef có thể cung cấp một tên đơn giản cho type cast phức tạp. Ví dụ:

- `typedef int (*ptr_to_int_fun)(void);`

- `char * p;`

```
                = (ptr_to_int_fun) p;
```

Hãy luôn dùng tag trong structure definition, ngay cả khi chưa cần. Về sau sẽ cần đến nó.

Một nguyên tắc khá tốt trong computer science là khi có hai thứ khác nhau, hãy dùng hai tên khác nhau để chỉ chúng. Điều đó giảm cơ hội nhầm lẫn, luôn là cách làm tốt trong software. Nếu bí tên cho structure tag, cứ đặt tên kết thúc bằng “\_tag”. Điều này giúp dễ nhận ra một tên cụ thể là gì. Khi đó, các thế hệ sau sẽ chúc phúc cho tên bạn thay vì nguyền rủa công trình của bạn.

## Đoạn code hiểu mọi parsing

Bạn có thể dễ dàng viết một chương trình parse declaration C và dịch chúng sang tiếng Anh. Thực ra, sao bạn không tự viết? Dạng cơ bản của declaration C đã được mô tả. Chúng ta chỉ cần viết một đoạn code hiểu dạng đó và gỡ nó theo cùng cách như Hình 3-4. Để đơn giản, chúng ta gần như bỏ qua error handling và xử lý struct, enum, union bằng cách rút chúng về một từ duy nhất “struct”, “enum” hoặc “union”. Cuối cùng, chương trình này yêu cầu function có ngoặc đơn rỗng, tức không có argument list.

### Thử thách lập trình

![image](images/ch03/img03-05.png)

Viết chương trình dịch declaration C sang tiếng Anh

Sau đây là thiết kế. Data structure chính là một stack, nơi chúng ta lưu các token đã đọc trong lúc đọc tiến đến identifier. Sau đó, có thể xem token tiếp theo bên phải bằng cách đọc nó, và token tiếp theo bên trái bằng cách pop nó khỏi stack. Data structure có dạng:

```
struct token { char type;
              char string[MAXTOKENLEN]; };

 /* holds tokens we read before reaching first
identifier */
struct token stack[MAXTOKENS];

 /* holds the token just read */
struct token this;
```

Đoạn pseudo-code là:

utility routine----------

```
classify_string
    look at the current token and
    return a value of "type" "qualifier" or "identifier"
in this.type
gettoken
    read the next token into this.string
    if it is alphanumeric, classify_string
    else it must be a single character token
    this.type = the token itself; terminate this.string
with a nul.
read_to_first_identifier
    gettoken and push it onto the stack until the first
identifier is read.
    Print "identifier is", this.string
    gettoken
```

parsing routine----------

```
deal_with_function_args
    read past closing ')' print out "function returning"
deal_with_arrays
    while you've got "[size]" print it out and read past
it
deal_with_any_pointers
    while you've got "*" on the stack print "pointer to"
and pop it
deal_with_declarator
    if this.type is '[' deal_with_arrays
    if this.type is '(' deal_with_function_args
    deal_with_any_pointers
    while there's stuff on the stack
    if it's a '('
    pop it and gettoken; it should be the closing ')'
    deal_with_declarator
    else pop it and print it
```

main routine----------

```
main
    read_to_first_identifier
    deal_with_declarator
```

Đây là một chương trình nhỏ đã được viết nhiều lần qua nhiều năm, thường dưới tên “cdecl”. <sup>\[1\]</sup> Một phiên bản chưa đầy đủ của cdecl xuất hiện trong The C Programming Language. Phiên bản cdecl được đặc tả ở đây đầy đủ hơn; nó hỗ trợ các type qualifier “const” và “volatile”. Nó cũng biết struct, enum và union, dù chưa xử lý tổng quát hoàn toàn; có thể dễ dàng mở rộng phiên bản này để xử lý argument declaration trong function. Chương trình có thể được triển khai bằng khoảng 150 dòng code C. Thêm error handling và hỗ trợ đầy đủ mọi declaration sẽ làm nó lớn hơn nhiều. Dù sao, khi lập trình parser này, bạn đang triển khai một trong các subsystem chính của compiler: đó là thành tựu lập trình đáng kể, thực sự giúp bạn hiểu sâu lĩnh vực này.

<sup>\[1\]</sup> Đừng nhầm điều này với cdecl modifier dùng trong Turbo C trên PC để chỉ rằng code được tạo không nên dùng calling convention mặc định của Turbo Pascal. Cdecl modifier cho phép code Borland C được link với các ngôn ngữ Turbo khác được triển khai với calling convention khác.

#### Đọc thêm

Giờ đã nắm vững cách xây dựng data structure trong C, bạn có thể muốn đọc một cuốn sách general-purpose hay về data structure. Một cuốn như vậy là Data Structures with Abstract Data Types của Daniel F. Stubbs và Neil W. Webre, ấn bản 2, Pacific Grove, CA, Brooks/Cole, 1989. Các tác giả trình bày nhiều loại data structure, bao gồm string, list, stack, queue, tree, heap, set và graph. Rất đáng đọc.

## Giải trí nhẹ nhàng — Software cắn nòng nọc sáp…

Một niềm vui lớn của lập trình máy tính là viết software điều khiển một vật thể thực, chẳng hạn cánh tay robot hoặc disk head. Có một cảm giác thỏa mãn rất lớn khi bạn chạy chương trình và một thứ gì đó chuyển động ngoài đời thực. Các nghiên cứu sinh tại Artificial Intelligence Laboratory của MIT được điều này thúc đẩy khi nối máy tính của khoa với nút gọi thang máy ở tầng chín. Nhờ đó, bạn có thể gọi thang máy bằng cách gõ lệnh từ máy LISP! Trước khi gọi thang, chương trình kiểm tra để bảo đảm terminal của bạn thực sự nằm trong phòng thí nghiệm, ngăn các hacker đối thủ dùng mặt tối của Thần lực để chiếm dụng thang máy.

Niềm vui lớn khác của lập trình máy tính là nhai đồ ăn vặt trong lúc hack-ing. Vậy còn gì tự nhiên hơn việc kết hợp hai thú vui? Một số nghiên cứu sinh computer science tại Carnegie-Mellon University phát triển một junk-food/com-puter interface để giải quyết vấn đề long-standing: máy Coke<sup>®</sup> của khoa computer science nằm ở tầng ba, xa văn phòng nghiên cứu sinh. Sinh viên chán việc đi một quãng xa chỉ để thấy máy hết Coke, hoặc tệ hơn, mới được nạp đến mức nhả ra những chai còn ấm. John Zsarney và Lawrence Butcher nhận ra máy Coke lưu sản phẩm trong sáu col-umns được làm lạnh, mỗi cột có một đèn “empty” nhấp nháy khi nhả chai và sáng liên tục khi cột đã bán hết. Việc nối các đèn này với serial interface khá đơn giản, nhờ đó truyền dữ liệu “đã nhả chai” đến mainframe PDP10 của khoa. Từ PDP10, interface của máy Coke trông hệt một telnet connection! Mike Kazar và Dave Nichols viết software trả lời truy vấn và theo dõi cột nào chứa những chai được làm lạnh lâu nhất.

Dĩ nhiên, Mike và Dave không dừng ở đó. Họ còn thiết kế một network protocol cho phép mainframe trả lời truy vấn trạng thái máy Coke từ bất kỳ máy nào trên mạng ethernet cục bộ, rồi cuối cùng từ chính Internet. Ivor Durham triển khai software thực hiện việc này và kiểm tra trạng thái máy Coke từ máy khác. Với khả năng tiết kiệm công sức đáng ngưỡng mộ, Ivor tái sử dụng tiện ích “finger” tiêu chuẩn, vốn thường được dùng từ một máy để kiểm tra xem một user được chỉ định có đăng nhập trên máy khác không. Anh sửa “finger” server để chạy chương trình trạng thái Coke bất cứ khi nào có người finger user không tồn tại tên “coke”. Vì finger request là một phần của các Internet protocol tiêu chuẩn, mọi người có thể kiểm tra máy Coke từ bất kỳ máy tính CMU nào. Thực tế, bằng cách chạy lệnh

```
finger coke@g.gp.cs.cmu.edu
```

bạn có thể biết trạng thái máy Coke từ bất kỳ máy nào ở bất cứ đâu trên Internet, dù cách hàng nghìn dặm! Những người khác tham gia dự án gồm Steve Berman, Eddie Caplan, Mark Wilkins và Mark Zaremsky <sup>\[2\]</sup>. Các chương trình máy Coke được dùng hơn một thập kỷ, thậm chí được viết lại cho UNIX Vaxen khi PDP-10 ngừng hoạt động đầu thập niên 1980. Kết thúc đến vào vài năm trước, khi nhà đóng chai Coke địa phương ngừng cung cấp các chai có thể hoàn trả mang hình Coke-bottle-shaped. Máy cũ không xử lý được hình dạng chai mới, nên được thay bằng máy bán hàng mới cần interface mới. Một thời gian không ai buồn làm, nhưng sức hấp dẫn của caffeine cuối cùng thúc đẩy Greg Nelson thiết kế lại hệ thống cho máy mới. Nghiên cứu sinh CMU cũng nối máy bán kẹo, và các trường khác cũng hoàn thành những dự án tương tự.

<sup>\[2\]</sup> Craig Everhart, Eddie Caplan, Robert Frederking, "Serious Coke Addiction," 25th Anniversary Sym-posium, Computer Science at CMU: A Commemorative Review, 1990, tr.70. Reed and Witting Company.

Câu lạc bộ máy tính tại University of Western Australia có một máy Coke kết nối với CPU 68000, memory 80K và ethernet interface, mạnh hơn phần lớn PC của một thập kỷ trước. Computer Science House tại Rochester Institute of Technology, Rochester, NY, cũng có một máy Coke trên Internet và đã mở rộng nó để cung cấp đồ uống theo tín dụng cùng việc tính tiền tài khoản bằng máy tính. Một sinh viên thích đăng nhập từ xa tại nhà cách hàng trăm dặm trong kỳ nghỉ hè và ngẫu nhiên phát vài đồ uống miễn phí cho người tiếp theo đi ngang qua. Mọi chuyện đang tiến đến mức “máy Coke” sớm trở thành loại hardware phổ biến nhất trên Internet.

Tại sao chỉ dừng ở cola? Giáng sinh vừa rồi, lập trình viên tại Cygnus Support nối đồ trang trí cây thông Giáng sinh trong văn phòng vào ethernet. Họ có thể giải trí bằng cách tog-gling các đèn khác nhau từ workstation. Vậy mà người ta lo Nhật Bản đang vượt Mỹ về công nghệ! Bên trong Sun Microsystems có một e-mail address được gate-wayed đến fax modem. Khi gửi e-mail đến đó, nội dung được parse để lấy thông tin số điện thoại rồi gửi tiếp dưới dạng fax. Lập trình viên tài ba Don Hopkins viết pizzatool để tận dụng nó. Pizzatool cho phép bạn custom-select topping pizza bằng GUI interface (phần lớn user yêu cầu thêm phô mai GUI), rồi gửi đơn hàng qua fax đến nhà hàng Tony \& Alba's Pizza gần đó, nơi nhận đơn fax và giao hàng.

Tôi không nghĩ mình tiết lộ bí mật thương mại khi nói rằng dịch vụ này được dùng rất nhiều trong các buổi làm việc tại lab late-night để phát triển dòng máy SPARCserver 600MP của Sun. Chúc ngon miệng!

### Lời giải lập trình

![image](images/ch03/img03-06.png)

```
The Piece of Code that Understandeth All Parsing
1 #include <stdio.h>
2 #include <string.h>
3 #include <ctype.h>
4 #include <stdlib.h>
5 #define MAXTOKENS 100
6 #define MAXTOKENLEN 64
7
8 enum type_tag { IDENTIFIER, QUALIFIER, TYPE };
9
10 struct token {
11     char type;
12     char string[MAXTOKENLEN];
13 };
14
15 int top=-1;
16 struct token stack[MAXTOKENS];
17 struct token this;
18
19 #define pop stack[top--]
20 #define push(s) stack[++top]=s
21
22 enum type_tag classify_string(void)
23 /* figure out the identifier type */
24 {
25     char *s = this.string;
26     if (!strcmp(s,"const")) {
27         strcpy(s,"read-only");
28         return QUALIFIER;
29     }
30     if (!strcmp(s,"volatile")) return QUALIFIER;
31     if (!strcmp(s,"void")) return TYPE;
32     if (!strcmp(s,"char")) return TYPE;
33     if (!strcmp(s,"signed")) return TYPE;
34     if (!strcmp(s,"unsigned")) return TYPE;
35     if (!strcmp(s,"short")) return TYPE;
36     if (!strcmp(s,"int")) return TYPE;
37     if (!strcmp(s,"long")) return TYPE;
38     if (!strcmp(s,"float")) return TYPE;
39     if (!strcmp(s,"double")) return TYPE;
40     if (!strcmp(s,"struct")) return TYPE;
41     if (!strcmp(s,"union")) return TYPE;
42     if (!strcmp(s,"enum")) return TYPE;
43     return IDENTIFIER;
44 }
45
46 void gettoken(void) /* read next token into "this" */
47 {
48     char *p = this.string;
49
50     /* read past any spaces */
51     while ((*p = getchar()) == ' ' ) ;
52
53     if (isalnum(*p)) {
54         /* it starts with A-Z,0-9 read in identifier
*/
55         while ( isalnum(*++p=getchar()) );
56         ungetc(*p,stdin);
57         *p = '\0';
58         this.type=classify_string();
59         return;
60     }
61
62     if (*p=='*') {
63         strcpy(this.string,"pointer to");
64         this.type = '*';
65         return;
66     }
67     this.string[1]= '\0';
68     this.type = *p;
69     return;
70 }
71 /* The piece of code that understandeth all parsing.
*/
72 read_to_first_identifier() {
73     gettoken();
74     while (this.type!=IDENTIFIER) {
75         push(this);
76         gettoken();
77     }
78     printf("%s is ", this.string);
79     gettoken();
80 }
81
82 deal_with_arrays() {
83     while (this.type=='[') {
84         printf("array ");
85         gettoken(); /* a number or ']' */
86         if (isdigit(this.string[0])) {
87             printf("0..%d ",atoi(this.string)-1);
88             gettoken(); /* read the ']' */
89         }
90         gettoken(); /* read next past the ']' */
91         printf("of ");
92     }
93 }
94
95 deal_with_function_args() {
96     while (this.type!=')') {
97         gettoken();
98     }
99     gettoken();
100    printf("function returning ");
101 }
102
103 deal_with_pointers() {
104    while ( stack[top].type== '*' ) {
105        printf("%s ", pop.string );
106    }
107 }
108
109 deal_with_declarator() {
110    /* deal with possible array/function following
the identifier */
111    switch (this.type) {
112    case '[' : deal_with_arrays(); break;
113    case '(' : deal_with_function_args();
114    }
115
116    deal_with_pointers();
117
118    /* process tokens that we stacked while reading
to identifier */
119    while (top>=0) {
120        if (stack[top].type == '(' ) {
121            pop;
122            gettoken(); /* read past ')' */
123            deal_with_declarator();
124        } else {
125            printf("%s ",pop.string);
126        }
127    }
128 }
129
130 main()
131 {
132    /* put tokens on stack until we reach identifier
*/
133    read_to_first_identifier();
134    deal_with_declarator();
135    printf("\n");
136    return 0;
137 }
```

#### Mẹo thực hành hữu ích

![image](images/ch03/img03-04.png)

Làm string comparison tự nhiên hơn

Một vấn đề của routine `strcmp ()` dùng để so sánh hai string là nó trả về 0 nếu các string giống hệt nhau. Điều này dẫn đến code rắc rối khi phép so sánh là một phần của conditional statement:

```
if (!strcmp(s,"volatile")) return QUALIFIER;
```

kết quả 0 biểu thị false, nên chúng ta phải phủ định nó để nhận điều mình muốn. Sau đây là cách tốt hơn. Hãy thiết lập định nghĩa:

```
#define STRCMP(a,R,b) (strcmp(a,b) R 0)
```

Bây giờ bạn có thể viết string theo cách tự nhiên hơn

```
if ( STRCMP(s, ==, "volatile"))
```

Với định nghĩa này, code diễn đạt điều đang xảy ra theo cách tự nhiên hơn. Hãy thử viết lại chương trình cdecl để dùng cách so sánh string này và xem bạn có thích nó hơn không.

#### Lời giải lập trình

![image](images/ch03/img03-06.png)

Gỡ declaration C (thêm lần nữa)

Sau đây là lời giải cho câu hỏi “Declaration này là gì?” ở trang 78. Trong mỗi bước, phần declaration mà chúng ta đang xử lý được in đậm. Bắt đầu từ bước một, chúng ta sẽ thực hiện các bước sau:

Declaration còn lại Bước tiếp Kết quả

áp dụng

bắt đầu identifier trái nhất `char *(*c` bước 1 nói "c là…"

`[10])(int **p);`

`char *(*` bước 2 nói "array\[0..9\] gồm…"

`[10]` `)(int **p);`

`char *(*` `)(int` bước 5 nói "pointer tới…"

`**p);`

đến bước 4

`char *()` `(int` bước 4 bỏ ngoặc, tới bước 2, rơi `**p);` qua bước 2 tới bước 3 `char *` `(int **p)` `;` bước 3 nói "function trả…" `char` `*` `;` bước 5 nói "pointer tới…" `char ;` bước 6 nói "char;"

Ghép lại thành:

"c là array\[0..9\] gồm pointer tới function trả pointer-to-char"

và chúng ta đã xong. Lưu ý: các function được trỏ đến trong array nhận một pointer đến pointer làm parameter duy nhất của chúng.
