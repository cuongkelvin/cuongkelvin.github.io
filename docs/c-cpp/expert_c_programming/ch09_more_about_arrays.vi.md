# Chương 9. Thêm về array

Đừng bao giờ ăn ở một nơi có tên là "Mom's". Đừng bao giờ chơi bài với một người có tên là "Doc".

Và đừng bao giờ, tuyệt đối đừng bao giờ quên rằng trong một expression, C coi một l-value có type array-of-T là một pointer trỏ tới phần tử đầu tiên của array.

—Câu nói truyền thống của lập trình viên C

khi nào array là pointer…vì sao lại có sự nhầm lẫn?…"array name trong expression" là pointer…vì sao C coi array subscript là pointer offset…"array name làm function parameter" là pointer…vì sao C coi array parameter là pointer…cách tham chiếu tới array parameter…đánh chỉ số cho một phần array…tổng kết khả năng dùng thay thế array và pointer…C có array multi-dimensional…nhưng mọi ngôn ngữ khác gọi chúng là "array của array"…cách bố trí array trong memory…cách khởi tạo array…một chút giải trí—những đánh đổi hardware/software trade-offs

## Khi array là pointer

Một chương trước đã nhấn mạnh trường hợp phổ biến nhất mà array không thể được viết dưới dạng pointer. Chương này bắt đầu bằng việc mô tả khi nào có thể làm như vậy. Trong thực tế, có nhiều trường hợp array có thể dùng thay cho pointer hơn là những trường hợp không thể. Chúng ta hãy xem xét riêng "declaration" và "use" (theo ý nghĩa trực quan thông thường của chúng).

Bản thân declaration có thể được chia tiếp thành ba trường hợp:

- Khai báo một external array

- Định nghĩa một array (hãy nhớ rằng definition chỉ là một trường hợp đặc biệt của declaration; nó cấp phát không gian lưu trữ và có thể cung cấp một giá trị ban đầu)

- Khai báo một function parameter

Mọi array name là function parameter luôn được compiler chuyển thành pointer. Trong tất cả các trường hợp khác (trường hợp đáng chú ý nhất là "được định nghĩa là array trong một file/được khai báo là pointer trong một file khác" đã mô tả ở chương trước), khai báo array tạo ra array, khai báo pointer tạo ra pointer, và hai thứ này hoàn toàn tách biệt. Nhưng việc sử dụng array (tham chiếu trong một statement hoặc expression) luôn có thể được viết lại để sử dụng pointer. Hình 9-1 trình bày sơ đồ tổng kết.

Hình 9-1. Khi array là pointer

![image](images/ch09/img09-01.png)

Tuy nhiên, compiler xử lý array và pointer theo những cách khác nhau; chúng có cách biểu diễn khác nhau khi chạy và có thể sinh ra code khác nhau. Với compiler, array là một địa chỉ, còn pointer là địa chỉ của một địa chỉ. Hãy chọn đúng công cụ cho công việc cần làm.

## Vì sao lại có sự nhầm lẫn?

Vì sao mọi người lại tưởng nhầm rằng array và pointer hoàn toàn có thể dùng thay thế cho nhau? Bởi vì họ đọc các tài liệu tham khảo tiêu chuẩn!

The C Programming Language, ấn bản thứ 2, Kernighan \& Ritchie, cuối trang 99:

Khi là formal parameter trong một function definition

lật sang trang 100:

```
char s[];
```

và

```
char *s;
```

tương đương; . . .

Arggggghhh! Argv! Argc! Thật là một chỗ ngắt trang tai hại trong K\&R2! Người đọc rất dễ bỏ sót rằng phát biểu về tính tương đương chỉ áp dụng cho một trường hợp cụ thể là formal parameter trong function definition—nhất là khi tài liệu nhấn mạnh rằng array expression có subscript luôn có thể được viết thành expression dạng pointer-plus-offset.

"The C Programming Language," Ritchie, Johnson, Lesk \& Kernighan, The Bell System Technical Journal, tập 57, số 6, July-Aug 1978, trang 1991-2019:

bao gồm một quy tắc chung: bất cứ khi nào tên của một array xuất hiện trong expression, nó được chuyển thành một pointer trỏ tới phần tử đầu tiên của array.

Thuật ngữ then chốt "expression" không được định nghĩa trong bài báo này.

Khi học lập trình, mọi người thường bắt đầu bằng cách đặt toàn bộ code vào một function, sau đó chuyển sang nhiều function, và cuối cùng học cách tổ chức chương trình thành nhiều file. Vì thế, họ có rất nhiều dịp thấy array và pointer được dùng làm function argument, nơi hai thứ này hoàn toàn có thể dùng thay cho nhau, như sau:

```
char my_array[10];
 char * my_ptr;
...
 i = strlen( my_array );
 j = strlen( my_ptr );
```

Lập trình viên cũng thường xuyên gặp các statement như

```
printf("%s %s", my_ptr, my_array);
```

vốn thể hiện rõ rằng pointer và array có thể dùng thay thế cho nhau. Người ta rất dễ bỏ qua rằng điều này chỉ xảy ra trong ngữ cảnh cụ thể của actual parameter trong một lời gọi function. Tệ hơn nữa, bạn có thể viết

```
printf("array at location %x holds string %s",a ,a);
```

trong đó cùng một statement sử dụng array name vừa như một địa chỉ (pointer), vừa như một array chứa character. Điều này chỉ hoạt động vì `printf` là một function, nên array được truyền dưới dạng pointer. Chúng ta cũng đã quen thấy parameter của `main` được khai báo bằng `char` `**argv` hoặc `char *argv[]` và dùng hai cách này thay thế cho nhau. Một lần nữa, điều này chỉ được phép vì `argv` là function parameter, nhưng nó lại khiến lập trình viên dễ yên tâm mà kết luận sai rằng "C xử lý address arithmetic một cách nhất quán và có quy luật". Nếu cộng thêm phần trình bày chi tiết, dài dòng về cách luôn có thể viết array expression có subscript theo pointer, ta dễ hiểu vì sao sự nhầm lẫn lại xuất hiện.

Khung bên dưới thực sự quan trọng; nội dung của nó sẽ được giải thích rồi được viện dẫn nhiều lần trong chương này và chương tiếp theo. Hãy chú ý, đánh dấu trang và chuẩn bị quay lại tham khảo nó nhiều lần!

### Giáo điều software

![image](images/ch09/img09-02.png)

Khi array là pointer

Chuẩn C phát biểu như sau về vấn đề này.

Quy tắc Một array name trong expression (khác với trong declaration) được

1\. compiler coi là một pointer trỏ tới phần tử đầu tiên của array <sup>\[1\]</sup> (diễn giải từ chuẩn ANSI C, đoạn 6.2.2.1).

Quy tắc Một subscript luôn tương đương với một offset tính từ pointer (diễn giải từ 2. chuẩn ANSI C, đoạn 6.3.2.1). Quy tắc Một array name trong declaration của function parameter được

3\. compiler coi là pointer trỏ tới phần tử đầu tiên của array (diễn giải từ chuẩn ANSI C, đoạn 6.7.1).

<sup>\[1\]</sup> Được rồi, dành cho những người thích bắt bẻ: có một vài ngoại lệ rất nhỏ liên quan tới việc xử lý array như một tổng thể. Tham chiếu tới array không bị thay bằng pointer trỏ tới phần tử đầu tiên khi:

- `sizeof()`

- `&`

Có thể tóm tắt đại ý rằng array và pointer giống như thơ limerick và haiku: chúng là các loại hình nghệ thuật có liên hệ với nhau, nhưng mỗi loại có cách thể hiện thực tế riêng. Những phần tiếp theo mô tả ý nghĩa thực tiễn của các quy tắc này.

### Quy tắc 1: "Array name trong expression" là một pointer

Kết hợp quy tắc 1 và 2 ở trên có nghĩa là tham chiếu tới array bằng subscript luôn có thể được viết tương đương thành pointer-to-base-of-array cộng với offset. Ví dụ, nếu chúng ta khai báo

```
int a[10], *p, i=2;
```

thì `a[i]` cũng có thể được truy cập bằng bất kỳ cách nào sau đây:

```
p=a;       p=a;         p=a+i;
p[i];      *(p+i);      *p;
```

Thực ra, điều này còn mạnh hơn thế. Compiler luôn viết lại tham chiếu array `a[i]` thành `*(a+i)` tại compiletime. Chuẩn C yêu cầu hành vi này về mặt khái niệm. Một cách dễ hiểu là nhớ rằng dấu ngoặc vuông `[]` biểu diễn subscript operator, cũng như dấu cộng biểu diễn addition operator. Subscript operator nhận một integer và pointer-to-type-T, rồi trả về một object có type T. Array name trong expression trở thành pointer, và đó chính là lý do: pointer và array có thể dùng thay thế trong expression vì cuối cùng tất cả đều quy về pointer, và cả hai đều có thể dùng subscript. Cũng như phép cộng, subscript operator có tính giao hoán (nó không quan tâm thứ tự argument, 5 + 3 bằng 3 + 5). Vì vậy, với một declaration như int `a[10];`, cả hai cách sau đều đúng:

```
a[6] = ....;
6[a] = ....;
```

Cách viết thứ hai không bao giờ xuất hiện trong production code và không có công dụng nào được biết đến ngoài việc làm những người mới học C bối rối.

Compiler tự động điều chỉnh subscript theo kích thước của object được trỏ tới. Nếu integer dài 4 byte thì `a[i+1]` thực sự nằm sau `a[i]` 4 byte (chứ không phải 1 byte). Compiler thực hiện việc điều chỉnh này trước khi cộng địa chỉ cơ sở. Đây là lý do pointer luôn có type—bị ràng buộc chỉ trỏ tới object thuộc một type—để compiler biết cần lấy bao nhiêu byte khi dereference pointer và cần nhân subscript lên bao nhiêu.

### Quy tắc 2: C coi array subscript là pointer offset

Việc coi array subscript là pointer-plus-offset là một kỹ thuật kế thừa từ BCPL (ngôn ngữ tiền thân của C). Quy ước này khiến việc bổ sung hỗ trợ range-checking cho subscript lúc chạy trong C trở nên thiếu thực tế. Subscript operator gợi ý, nhưng không bảo đảm, rằng một array đang được truy cập. Ngoài ra, người ta có thể bỏ qua hoàn toàn subscript để truy cập array bằng pointer, tức là by-passed. Trong những điều kiện này, range-checking chỉ có thể thực hiện đối với một tập con hạn chế các phép truy cập array. Trong thực tế, người ta thường cho rằng việc đó không đáng công.

Có lời đồn rằng viết thuật toán array bằng pointer thay cho array sẽ "hiệu quả hơn". Niềm tin phổ biến này thường sai. Với các optimizing compiler hiện đại có chất lượng production-quality, code sinh ra cho array one-dimensional không nhất thiết khác code tham chiếu qua pointer. Suy cho cùng, array subscript được định nghĩa theo pointer, nên optimizer thường có thể chuyển chúng sang cách biểu diễn hiệu quả nhất và xuất ra machine instruction tương ứng. Hãy xem lại các phương án array/pointer đó, đồng thời tách việc khởi tạo khỏi việc truy cập trong loop:

```
int a[10], *p, i;
```

Variable `a[i]` cũng có thể được truy cập bằng bất kỳ cách nào trong Hình 9-2.

Hình 9-2. Array/pointer code Trade-offs

![image](images/ch09/img09-03.png)

Ngay cả khi việc chuyển đổi simple-minded sinh ra những đoạn code khác nhau, duyệt array one-dimensional bằng pointer thường cũng không nhanh hơn dùng subscript. Khi bước qua các vị trí memory liên tiếp bằng pointer hoặc array, đều cần điều chỉnh bước nhảy theo kích thước phần tử. Việc điều chỉnh này nhân offset với kích thước phần tử; kết quả là offset thực theo byte tính từ đầu array. Hệ số này thường là lũy thừa của 2 (ví dụ integer dài 4 byte, double dài 8 byte, v.v.). Thay vì thực hiện phép nhân chậm, có thể dịch trái để điều chỉnh. Một phép "shift-left-by-three" tương đương nhân một số nhị phân với tám. Nếu kích thước phần tử array không phải lũy thừa của hai (ví dụ array chứa struct), thì không thể khẳng định trước điều gì.

Tuy nhiên, việc lần lượt duyệt một array chứa int là một mẫu thao tác dễ nhận biết. Nếu một optimizing compiler tốt phân tích code, cố giữ các variable cơ sở trong register nhanh và nhận diện những mẫu loop, thì kết quả cuối cùng có thể là code giống hệt nhau cho truy cập bằng pointer và array trong loop.

Pointer không nhất thiết nhanh hơn subscript khi xử lý array one-dimensional. Lý do căn bản khiến C coi array subscript là pointer offset là vì đây chính là mô hình mà hardware bên dưới sử dụng.

### Quy tắc 3: "Array name làm function parameter" là một pointer

Quy tắc 3 cũng cần được giải thích. Trước tiên, hãy ôn lại một số thuật ngữ mà Kernighan và Ritchie đã quy định.

Thuật ngữ Định nghĩa Ví dụ

Parameter là một variable được định nghĩa trong function definition `int power( int base, int n);`

hoặc trong declaration của function prototype. `base` và `n` là parameter. Một số người gọi đây là "formal parameter".

Argument là một giá trị được sử dụng trong một lời gọi cụ thể tới `i = power(10, j);` `10` và `j` là

function. Một số người gọi đây là "actual parameter". Các argument có thể khác nhau giữa những lần gọi một function.

Chuẩn quy định rằng declaration của parameter dưới dạng "array of type" phải được điều chỉnh thành "pointer to type". Trong trường hợp cụ thể là định nghĩa một formal function parameter, compiler bắt buộc phải viết lại array thành pointer trỏ tới phần tử đầu tiên của nó. Thay vì truyền một bản sao array, compiler chỉ truyền địa chỉ của array. Parameter là function cũng được xử lý tương tự như pointer, nhưng hiện giờ hãy chỉ xét array. Việc chuyển đổi ngầm này có nghĩa là

```
my_function( int * turnip ) {...}
my_function( int turnip[] ) {...}
my_function( int turnip[200]){...}
```

đều hoàn toàn tương đương. Vì vậy, việc gọi `my_function()` với actual argument là array, hay thực chất là pointer, hoàn toàn hợp lệ.

## Vì sao C coi array parameter là pointer

Lý do truyền array vào function dưới dạng pointer là hiệu quả thực thi, một lý do rất thường được dùng để biện minh cho những vi phạm thực hành software engineering tốt. Mô hình I/O của Fortran trở nên rắc rối vì người ta cho rằng re-use các thư viện I/O viết bằng assembler cho IBM 704 hiện có (dù vụng về và đã lỗi thời) sẽ "hiệu quả". Portable C Compiler không thực hiện kiểm tra ngữ nghĩa toàn diện với lý do đáng ngờ rằng triển khai `lint` thành chương trình riêng sẽ "hiệu quả" hơn. Quyết định này đã ngầm bị đảo ngược bởi khả năng kiểm tra lỗi nâng cao của phần lớn ANSI C compiler.

Sự tương đương giữa array và pointer đối với parameter được đưa ra vì hiệu quả thực thi. Mọi data argument non-array trong C đều được truyền "by value" (một bản sao argument được tạo rồi truyền cho function được gọi; function không thể đổi giá trị variable thực được dùng làm argument, mà chỉ đổi giá trị bản sao nó nhận được). Tuy nhiên, sao chép array có thể rất tốn memory và thời gian; phần lớn trường hợp bạn không thực sự muốn có bản sao array mà chỉ muốn cho function biết hiện đang quan tâm tới array cụ thể nào. Một cách thực hiện là cho phép parameter có storage specifier chỉ rõ nó được truyền by value hay by reference, như trong Pascal. Compiler sẽ đơn giản hơn nếu áp dụng quy ước rằng mọi array được truyền dưới dạng pointer tới đầu array, còn mọi thứ khác được truyền bằng cách tạo bản sao. Tương tự, giá trị trả về của function không bao giờ có thể là array hoặc function, mà chỉ có thể là pointer tới array hoặc function.

Một số người thích hiểu điều này là mọi argument trong C mặc định đều là call-by-value, ngoại trừ array và function; chúng được truyền dưới dạng parameter call-by-reference. Có thể chủ động truyền dữ liệu theo call-by-reference bằng operator "address of". Khi đó, địa chỉ argument được gửi đi thay vì bản sao argument. Thực tế, một công dụng chính của address-of operator `&` là mô phỏng call-by-reference. Cách nhìn "by reference" này không hoàn toàn chính xác vì cơ chế triển khai được thể hiện tường minh—trong procedure được gọi, bạn vẫn chỉ có pointer tới một thứ chứ không có chính thứ đó. Sự khác biệt này có ý nghĩa khi bạn lấy kích thước hoặc sao chép nó.

### Cách tham chiếu array parameter

Hình 9-3 cho thấy những bước cần thực hiện để truy cập một array parameter bằng subscript.

Hình 9-3. Tham chiếu array parameter có subscript

![image](images/ch09/img09-04.png)

Hãy lưu ý kỹ rằng điều này giống hệt Sơ đồ C ở trang 101, vốn mô tả cách tra cứu một pointer có subscript. Ngôn ngữ C cho phép lập trình viên khai báo và tham chiếu parameter này dưới dạng array (thứ lập trình viên dự định truyền vào function) hoặc pointer (thứ function thực sự nhận được). Compiler biết rằng bất cứ khi nào formal parameter được khai báo là array, bên trong function thực ra nó luôn phải xử lý một pointer tới phần tử đầu tiên của array chưa biết kích thước. Vì thế, compiler có thể sinh code đúng mà không cần phân biệt các trường hợp.

Bất kể lập trình viên viết theo dạng nào, function cũng không tự động biết có bao nhiêu phần tử trong đối tượng pointed-to. Phải có một quy ước nào đó, chẳng hạn dấu kết thúc NUL hoặc parameter bổ sung cho biết độ dài array. Ví dụ trong Ada thì khác: mỗi array mang theo một loạt thông tin về kích thước phần tử, số chiều và các chỉ số của nó.

Với các definition sau:

```
    func( int * turnip){...}
or
    func( int turnip[]){...}
or
    func( int turnip[200]){...}

int my_int; /* data definitions */
int * my_int_ptr;
int my_int_array[10];
```

bạn có thể gọi hợp lệ bất kỳ function prototype nào ở trên bằng bất kỳ argument nào dưới đây. Chúng thường được dùng cho những mục đích rất khác nhau:

Bảng 9-1. Những công dụng thường gặp của actual parameter dạng array/pointer

| Actual argument trong lời gọi | Type | Mục đích thường gặp |
|---|---|---|
| `func(&my_int );` | Địa chỉ của một integer | "Call-by-reference" đối với một int |
| `func( my_int_ptr );` | Một pointer tới integer | Truyền một pointer |
| `func( my_int_array );` | Một array chứa integer | Truyền một array |
| `func(&my_int_array[i] );` | Địa chỉ một phần tử của array chứa int | Truyền một phần của array |

Ngược lại, khi ở bên trong `func()`, bạn không có cách dễ dàng nào để biết function đã được gọi bằng argument nào trong những lựa chọn trên, và do đó được gọi với mục đích gì. Mọi array là function argument đều được compiler viết lại thành pointer tại compiletime. Vì vậy, bất kỳ tham chiếu nào tới array parameter bên trong function cũng sinh code tham chiếu pointer. Hình 9-3 ở trang 247 cho thấy ý nghĩa thực tế của điều này.

Vì vậy, điều thú vị là không có cách nào truyền chính array vào function, bởi nó luôn tự động được chuyển thành pointer tới array. Tất nhiên, bằng pointer bên trong function, bạn vẫn làm được hầu hết những việc có thể làm với array ban đầu. Tuy nhiên, nếu lấy kích thước của nó, bạn sẽ không nhận được kết quả đúng.

Do đó, khi khai báo function như vậy, bạn có quyền lựa chọn. Bạn có thể định nghĩa parameter là array hoặc pointer. Dù chọn cách nào, compiler cũng nhận ra trường hợp đặc biệt rằng object này là function argument và sinh code để dereference pointer.

#### Thử thách lập trình

![image](images/ch09/img09-05.png)

Nghịch array/pointer argument

Hãy viết và chạy một chương trình để tự xác nhận rằng các thông tin vừa trình bày là đúng.

1\. Định nghĩa một function nhận array chứa character `ca` làm argument. Bên trong function, in các giá trị `&ca`, `&(ca[0])` và `&(ca[1]).`

2\. Định nghĩa một function khác nhận character pointer `pa` làm argument. Bên trong function, in các giá trị `&pa`, `&(pa[0])`, `&(pa[1])` và `++pa`.

3\. Tạo một global character array `ga` và khởi tạo nó bằng các chữ cái trong bảng chữ cái. Gọi hai function với global này làm parameter. So sánh những giá trị bạn in ra.

4\. Trong main routine, in các giá trị `&ga`, `&(ga[0])` và

```
&(ga[1]).
```

5\. Trước khi chạy chương trình, hãy viết ra những giá trị bạn dự đoán sẽ bằng nhau cùng lý do. Giải thích mọi khác biệt giữa dự đoán và kết quả quan sát được.

Cần có sự nghiêm túc nhất định để không nhầm lẫn tất cả những điều này! Chúng tôi luôn thích định nghĩa parameter là pointer vì compiler cũng viết lại nó thành pointer. Đặt tên cho một thứ theo cách thể hiện sai bản chất của nó là một phong cách lập trình đáng nghi ngờ. Tuy nhiên, mặt khác, một số người cảm thấy rằng:

`int table[]` thay `int *table`

giải thích ý định của bạn rõ hơn một chút. Ký hiệu `table[]` cho thấy rõ rằng còn nhiều phần tử int theo sau phần tử mà table trỏ tới, qua đó gợi ý function sẽ xử lý tất cả chúng.

Lưu ý rằng có một việc bạn làm được với pointer nhưng không thể làm với array name: thay đổi giá trị của nó. Array name không phải l-values có thể sửa đổi; giá trị của chúng không thể thay đổi. Xem Hình 9-4 (các function được đặt cạnh nhau để so sánh; chúng đều thuộc cùng một file).

Hình 9-4. Các thao tác hợp lệ trên array được dùng làm argument

```
 pointer argument   array argument       pointer non-argument
                                     int array[100],
array2[100];
fun1(int *ptr)    fun2(int arr[])    main()
{                 {                  {
   ptr[1]=3;         arr[1]=3;          array[1]=3;
   *ptr = 3;         *arr = 3;          *array = 3;
   ptr = array2;     arr = array2;      array =
array2;/*FAILS*/
}                 }                  }
```

Statement `array = array2;` sẽ gây lỗi compiletime với thông báo đại ý "không thể thay đổi giá trị của array name". Nhưng viết `arr = array2;` thì hợp lệ, bởi `arr`, dù được khai báo là array, thực chất là pointer.

## Index slice

Toàn bộ array được truyền vào function bằng cách cung cấp pointer tới phần tử số không, nhưng bạn có thể cung cấp pointer tới bất kỳ phần tử nào và chỉ truyền phần cuối array. Một số người (chủ yếu là lập trình viên Fortran) đã mở rộng kỹ thuật này theo hướng ngược lại. Bằng cách truyền một địa chỉ nằm trước đầu array một phần tử (`a[-1]`), trên thực tế bạn có thể khiến array có miền chỉ số từ 1 tới N thay vì từ 0 tới N - 1.

Nếu giống nhiều lập trình viên Fortran, bạn quen viết thuật toán trong đó mọi array có giới hạn từ 1 tới N, cách này sẽ rất hấp dẫn. Đáng tiếc, thủ thuật này hoàn toàn nằm ngoài chuẩn (điều cấm nằm ở mục 6.3.6, "Additive Operators"), thậm chí còn được ghi rõ là gây undefined behavior, nên đừng nói với ai rằng bạn nghe được từ tôi.

Rất dễ đạt được hiệu quả mà lập trình viên Fortran mong muốn: chỉ cần khai báo mọi array lớn hơn nhu cầu một phần tử để chỉ số chạy từ 0 tới N. Sau đó chỉ dùng các phần tử từ 1 tới N. Không rắc rối, không phiền phức. Chỉ đơn giản vậy thôi.

## Tổng hợp array/pointer thay thế

Cảnh báo: đừng đọc phần này nếu chưa đọc và hiểu chương trước, nếu không nó có thể khiến bạn bị brain-fade vĩnh viễn.

1\. Compiler luôn "viết lại" hoặc diễn giải truy cập array `a[i]` thành truy cập pointer `*(a+i);`

2\. Pointer luôn chỉ là pointer; chúng không bao giờ được viết lại thành array. Bạn có thể áp dụng subscript cho pointer; điều này thường được thực hiện khi pointer là function argument và bạn biết mình sẽ truyền một array vào.

3\. Chỉ trong ngữ cảnh cụ thể là function parameter, declaration của array mới có thể được viết tương đương thành pointer. Array là function argument (nghĩa là trong lời gọi function) luôn được compiler chuyển thành pointer tới đầu array.

4\. Vì vậy, bạn có thể chọn định nghĩa function parameter là array hoặc pointer. Bất kể định nghĩa theo cách nào, thứ bạn thực sự nhận được bên trong function vẫn là pointer.

5\. Trong tất cả các trường hợp khác, definition phải khớp với declaration. Nếu bạn định nghĩa nó là array thì extern declaration phải là array. Với pointer cũng tương tự.

## C có multidimensional array…

Một số người khẳng định rằng C không có multidimensional array. Họ đã nhầm. Mục 6.5.4.2 của chuẩn ANSI và chú thích số 69 của mục này nói rằng: Khi nhiều đặc tả "array of" (nghĩa là những dấu ngoặc vuông biểu thị một chỉ số) nằm liền nhau, một multidimensional array được khai báo.

## …Nhưng ngôn ngữ khác gọi "array của array"

Ý của những người này là C không có multidimensional array như trong các ngôn ngữ khác, chẳng hạn Pascal hoặc Ada. Trong Ada, bạn có thể khai báo multidimensional array như Hình 9-5.

Hình 9-5. Ví dụ Ada

![image](images/ch09/img09-06.png)

Nhưng bạn không thể trộn lẫn táo với dưa cải muối. Trong Ada, multidimensional array và array của array là hai thứ hoàn toàn khác nhau.

Pascal chọn cách tiếp cận ngược lại: luôn coi array của array và multidimensional array là hoàn toàn tương đương và có thể dùng thay thế cho nhau. Trong Pascal, bạn có thể khai báo và truy cập multidimensional array như Hình 9-6.

Hình 9-6. Ví dụ Pascal

![image](images/ch09/img09-07.png)

The Pascal User Manual and Report <sup>\[1\]</sup> nói rõ rằng array của array tương đương và có thể dùng thay cho multidimensional array. Ngôn ngữ Ada chặt chẽ hơn và nghiêm ngặt duy trì sự phân biệt giữa array của array với multidimensional array. Trong memory, chúng trông giống nhau, nhưng sự phân biệt này ảnh hưởng rất lớn tới những type nào tương thích và có thể được gán cho từng hàng riêng lẻ của array chứa array. Điều này khá giống việc chọn float hay int cho variable: bạn chọn type phản ánh sát nhất dữ liệu bên dưới. Trong Ada, bạn thường sử dụng multidimensional array khi các chỉ số biến thiên độc lập, chẳng hạn tọa độ Descartes xác định một điểm. Bạn thường dùng array của array khi dữ liệu mang tính phân cấp hơn, ví dụ array \[12\] tháng gồm \[5\] tuần, mỗi tuần gồm \[7\] ngày, để ghi nhận một thứ gì đó hằng ngày, đồng thời vẫn có thể thao tác trên cả tuần hoặc cả tháng một lần.

<sup>\[1\]</sup> The Pascal User Manual and Report, Springer-Verlag, 1975, trang 39.

### Mẹo thực hành hữu ích

![image](images/ch09/img09-08.png)

Ý nghĩa của "Multidimensional" trong các ngôn ngữ khác nhau

Chuẩn Ada nói rõ rằng array của array và multidimensional array là hai thứ khác nhau.

Chuẩn Pascal nói rõ rằng array của array và multidimensional array là một.

C chỉ có thứ mà các ngôn ngữ khác gọi là array của array, nhưng C cũng gọi chúng là "multidimensional".

C có cách tiếp cận khá độc đáo: cách duy nhất để định nghĩa và tham chiếu multidimensional array là dùng array của array. Mặc dù C gọi array của array là multidimensional array, không có cách nào "gộp" nhiều chỉ số như `[i][j][k]` thành một subscript expression Pascal-style duy nhất như `[i,j,k].` Nếu biết mình đang làm gì và không ngại viết chương trình không tuân theo chuẩn, bạn có thể tính offset tương đương với `[i][j][k]` rồi tham chiếu chỉ bằng một subscript `[z]`. Đây không phải cách làm được khuyến nghị. Tệ hơn nữa, `[i,j,z]` là một expression hợp lệ dạng comma-separated. Tuy nhiên, nó không tham chiếu tới nhiều subscript. Như vậy, C hỗ trợ thứ mà các ngôn ngữ khác thường gọi là "array của array", nhưng lại làm mờ ranh giới và khiến rất nhiều người hết sức bối rối khi cũng gọi chúng là "multidimensional array". (Xem Hình 9-7.)

Hình 9-7. Array của array

![image](images/ch09/img09-09.png)

Mặc dù thuật ngữ của C nói tới "multidimensional array", C thực sự chỉ hỗ trợ "array của array". Lĩnh vực khá khó nhằn này sẽ đơn giản hơn rất nhiều nếu trong đầu bạn luôn nghĩ rằng khi thấy "array" trong C, hãy hiểu đó là "vector" (tức array one-dimensional chứa một thứ gì đó, có thể là một array khác).

#### Mẹo thực hành hữu ích

![image](images/ch09/img09-08.png)

Array trong C là One-Dimensional

Bất cứ khi nào thấy "array" trong C, hãy nghĩ "vector", nghĩa là một array one-dimensional chứa một thứ gì đó, có thể là một array khác.

## Cách phân tách multidimensional array thành các thành phần

Hãy chú ý kỹ cách phân tách multidimensional array thành các array thành phần riêng lẻ. Nếu có declaration

```
int apricot[2][3][5];
```

thì declaration này cho biết cùng một vùng lưu trữ có thể được nhìn theo bất kỳ cách nào trong Hình 9-8.

Hình 9-8. Storage multidimensional array

![image](images/ch09/img09-10.png)

Thông thường, người ta thực hiện phép gán giữa hai type giống hệt nhau: integer cho integer, double cho double, v.v. Trong Hình 9-8, ta thấy mỗi array riêng lẻ trong array-of-array-of-arrays đều tương thích với một pointer. Đó là vì array-name trong expression chuyển thành "pointer-to-element" (quy tắc 1 ở trang 242). Nói cách khác, bạn không thể gán array cho một thứ cùng type vì không thể gán cho toàn bộ array. Bạn có thể nạp giá trị của array-name vào pointer nhờ quy tắc "array-name trong expression chuyển thành pointer". Số chiều của array mà pointer trỏ tới tạo ra khác biệt rất lớn. Với những declaration trong ví dụ trên,

```
r++;
t++;
```

sẽ tăng `r` và `t` để chúng trỏ tới phần tử tiếp theo tương ứng (trong cả hai trường hợp, bản thân phần tử này cũng là một array). Lượng tăng sẽ được điều chỉnh với các hệ số rất khác nhau, bởi `r` trỏ tới những phần tử array có kích thước lớn gấp ba các phần tử array mà `t` trỏ tới.

### Thử thách lập trình

![image](images/ch09/img09-05.png)

Hoan hô array!

Với declaration:

```
int apricot[2][3][5];

int (*r)[5] = apricot[0];
int *t = apricot[0][0];
```

hãy viết một chương trình in giá trị ban đầu của `r` và `t` dưới dạng hex (dùng ký tự chuyển đổi `%x` của printf để in giá trị hex), tăng hai pointer này rồi in giá trị mới của chúng.

Trước khi chạy chương trình, hãy dự đoán phép tăng sẽ thực sự cộng bao nhiêu byte vào mỗi pointer. Hãy tham khảo Hình 9-8 ở trang 255.

## Cách bố trí array trong memory

Với multidimensional array trong C, subscript ngoài cùng bên phải thay đổi nhanh nhất, một quy ước được gọi là "row major addressing". Vì thuật ngữ "row/column major addressing" thực sự chỉ có ý nghĩa với array có đúng hai chiều, cách gọi được ưu tiên là "subscript ngoài cùng bên phải thay đổi nhanh nhất". Phần lớn ngôn ngữ thuật toán dùng quy ước này; ngoại lệ lớn là Fortran, vốn ưu tiên subscript ngoài cùng bên trái, hay column major addressing. Subscript nào thay đổi nhanh nhất sẽ ảnh hưởng tới cách bố trí array trong memory. Thật vậy, nếu truyền một matrix C vào một routine Fortran, matrix sẽ có vẻ bị chuyển vị—một cách xử lý rất vụng về mà đôi khi người ta vẫn tận dụng.

Hình 9-9. Thứ tự row major so với column major

![image](images/ch09/img09-11.png)

Công dụng phổ biến nhất của multidimensional array trong C là lưu nhiều string chứa character. Một số người chỉ ra rằng thứ tự rightmost-subscript-varies-fastest có lợi cho việc này (các character liền nhau trong mỗi string được lưu cạnh nhau); điều đó không đúng với multidimensional array chứa character theo thứ tự leftmost-subscript-varies-fastest.

## Cách khởi tạo array

Trong trường hợp đơn giản nhất, array one-dimensional có thể được gán giá trị ban đầu bằng cách đặt danh sách giá trị trong cặp ngoặc nhọn thông thường. Một tiện ích là nếu bỏ qua kích thước array, array sẽ được tạo với kích thước vừa đủ chứa số lượng giá trị ban đầu đó.

```
float banana [5] = { 0.0, 1.0, 2.72, 3.14, 25.625 };

float honeydew[] = { 0.0, 1.0, 2.72, 3.14, 25.625 };
```

Bạn chỉ có thể gán cho toàn bộ array trong lúc khai báo nó. Không có lý do hợp lý nào cho hạn chế này.

Có thể khởi tạo multidimensional array bằng các cặp ngoặc nhọn lồng nhau:

```
short cantaloupe[2][5] = {
 {10, 12, 3, 4, -5},
 {31, 22, 6, 0, -5},
};

int rhubarb[][3] ={ {0,0,0}, {1,1,1}, };
```

Lưu ý rằng bạn có thể giữ hoặc bỏ dấu phẩy sau initializer cuối cùng. Bạn cũng có thể bỏ chiều có ý nghĩa cao nhất (và chỉ chiều đó); compiler sẽ suy ra nó từ số lượng initializer được cung cấp.

Nếu kích thước array lớn hơn số giá trị ban đầu được cung cấp, những phần tử còn lại được đặt thành zero. Nếu là pointer, chúng được đặt thành NULL. Nếu là phần tử floating point, chúng được đặt thành 0.0. Trong cách triển khai floating point theo chuẩn IEEE 754 phổ biến được dùng trên IBM PC và các hệ thống Sun, bit pattern của 0.0 cũng giống với integer zero.

### Thử thách lập trình

![image](images/ch09/img09-05.png)

Kiểm tra các bit pattern đó

Hãy viết một one-liner để kiểm tra xem trên hệ thống của bạn, bit pattern của floating point 0.0 có giống integer zero hay không.

Đây là cách khởi tạo một array two-dimensional chứa string:

```
char vegetables[][9] = { "beet",
                         "barley",
                         "basil",
                         "broccoli",
                         "beans" };
```

Một khả năng hữu ích là tạo array chứa pointer. Có thể dùng string literal làm array initializer, và compiler sẽ lưu đúng các địa chỉ vào array. Vì vậy,

```
char *vegetables[] = { "carrot",
                       "celery",
                       "corn",
                       "cilantro",
                       "crispy fried potatoes" }; /* works
fine */
```

Hãy chú ý rằng phần khởi tạo giống hệt cách khởi tạo array chứa array chứa character. Chỉ string literal mới có đặc quyền khởi tạo pointer array theo cách này. Không thể trực tiếp khởi tạo array chứa pointer bằng các type non-string:

```
int *weights[] = {           /* will NOT compile successfully
*/
                  {1,2,3,4,5},
                  {6,7},
                  {8,9,10}
                };           /* will NOT compile successfully
*/
```

Bí quyết để thực hiện kiểu khởi tạo này là tạo các hàng dưới dạng array riêng lẻ, rồi dùng tên của những array đó để khởi tạo array ban đầu.

```
int row_1[] = {1,2,3,4,5,-1}; /* -1 is end-of-row marker */
int row_2[] = {6,7,-1};
int row_3[] = {8,9,10,-1};

int *weights[] = {
                  row_1,
                  row_2,
                  row_3
};
```

Chương tiếp theo về pointer sẽ trình bày thêm về điều này. Nhưng trước tiên, hãy giải trí một chút.

## Giải trí nhẹ — Hardware/software Trade-Offs

Muốn trở thành lập trình viên thành công, bạn phải hiểu rõ những đánh đổi software/hardware trade-offs. Sau đây là một ví dụ tôi nghe được từ bạn của một người bạn. Nhiều năm trước, một công ty bán hàng qua thư lớn dùng một legacy mainframe IBM cũ để duy trì database tên và địa chỉ. Máy này hoàn toàn không có cơ chế điều khiển batch.

Hệ thống IBM đã lỗi thời và sắp được thay bằng một hệ thống Burroughs. Điều đó cho thấy câu chuyện đã xưa đến mức nào—Burroughs (hay "Rubs-rough" theo cách chúng tôi đảo chữ) đã không còn tồn tại từ giữa thập niên 1980, khi sáp nhập với Sperry để tạo thành Unisys. Trong lúc đó, trở lại bộ phận xử lý dữ liệu, máy IBM đang hoạt động hết công suất, kể cả ca đêm. Nhiệm vụ duy nhất của nhân viên vận hành ban đêm là chờ các job ban ngày hoàn tất, sau đó khởi chạy thêm bốn job vào những thời điểm cách nhau trong suốt đêm.

Người quản lý bộ phận xử lý dữ liệu nhận ra rằng mình có thể chuyển nhân viên vận hành ban đêm sang làm ca ngày nếu tìm được cách khởi chạy batch job vào các thời điểm nhất định. IBM báo giá hàng chục nghìn đô la cho bản nâng cấp software cung cấp khả năng này. Không ai muốn chi nhiều như vậy cho một máy sắp ngừng sử dụng. Tình cờ, máy được chia thành nhiều partition, mỗi partition có một terminal riêng. Có thể bố trí các job ban đêm sao cho mỗi job được khởi chạy từ một terminal khác nhau. Mỗi terminal có thể được thiết lập để job bắt đầu ngay khi nhấn phím return. Người quản lý sau đó thiết kế và chế tạo bốn bản của một thiết bị mà ông gọi là "ngón tay ma", minh họa trong Hình 9-10.

Hình 9-10. Ngón tay ma

![image](images/ch09/img09-12.png)

Mỗi đêm, một ngón tay ma được đặt phía sau mỗi terminal. Lúc 2 giờ sáng, chuông báo thức đầu tiên reo lên. Núm lên dây của đồng hồ cuốn sợi chỉ, kéo một chiếc chốt ra, khiến cánh tay rơi xuống phím return. Khối Lego bật ra, tránh hiện tượng dội phím hoặc lặp phím, và job bắt đầu chạy.

Mặc dù ai cũng bật cười trước bộ máy kỳ quặc này, nó vẫn hoạt động suốt sáu tháng cho tới khi hệ thống mới được lắp đặt! Chỉ trong vài giờ sau khi hệ thống mới đi vào hoạt động, các kỹ sư hệ thống của cả Burroughs lẫn IBM đều nài xin một mẫu còn sót lại của những thiết bị Rube Goldberg này. Đó chính là bản chất của một đánh đổi software-hardware trade-off thành công.

### Lời giải lập trình

![image](images/ch09/img09-13.png)

Nghịch array/pointer argument

```
char ga[] = "abcdefghijklm";

void my_array_func( char ca[10] )
{
   printf(" addr of array param = %#x \n",&ca);
   printf(" addr (ca[0]) = %#x \n",&(ca[0]));
   printf(" addr (ca[1]) = %#x \n",&(ca[1]));
   printf(" ++ca = %#x \n\n", ++ca);
}

void my_pointer_func( char *pa )
{
   printf(" addr of ptr param = %#x \n",&pa);
   printf(" addr (pa[0]) = %#x \n",&(pa[0]));
   printf(" addr (pa[1]) = %#x \n",&(pa[1]));
   printf(" ++pa = %#x \n", ++pa);
}

main()
{
   printf(" addr of global array = %#x \n",&ga);
   printf(" addr (ga[0]) = %#x \n",&(ga[0]));
   printf(" addr (ga[1]) = %#x \n\n",&(ga[1]));
   my_array_func( ga );
   my_pointer_func( ga );
}
```

Và output là:

```
% a.out
 addr of global array = 0x20900
 addr (ga[0]) = 0x20900
 addr (ga[1]) = 0x20901

 addr of array param = 0xeffffa14
 addr (ca[0]) = 0x20900
 addr (ca[1]) = 0x20901
 ++ca = 0x20901

 addr of ptr param = 0xeffffa14
 addr (pa[0]) = 0x20900
 addr (pa[1]) = 0x20901
 ++pa = 0x20901
```

Thoạt nhìn, việc địa chỉ của một array parameter không bằng địa chỉ phần tử đầu tiên của array parameter có vẻ hơi kỳ quặc, nhưng đó hoàn toàn là sự thật.

Bạn có thể thắng nhiều vụ cá cược money-making với những lập trình viên C mới vào nghề về kết quả mà sizeof operator tạo ra trong trường hợp này.
