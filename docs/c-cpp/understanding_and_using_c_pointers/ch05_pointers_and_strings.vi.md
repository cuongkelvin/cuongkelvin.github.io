# Chương 5. Pointer và string

String có thể được cấp trong các vùng memory khác nhau, và pointer thường hỗ trợ string operation. Pointer hỗ trợ cấp động string và truyền string cho function. Hiểu rõ pointer và cách dùng với string giúp programmer phát triển application đúng và hiệu quả.

String là thành phần phổ biến của nhiều application và là chủ đề phức tạp. Chương này tìm hiểu nhiều cách khai báo và khởi tạo string, việc dùng literal pool trong C application cùng tác động của nó. Ngoài ra, xem các operation phổ biến như so sánh, copy và nối string.

String thường được truyền vào và trả về từ function như pointer đến `char`. Khi truyền, có thể dùng pointer đến `char` hoặc pointer đến constant `char`. Cách sau bảo vệ string khỏi bị sửa trong function. Nhiều ví dụ chương này minh họa thêm các khái niệm của chương function; điểm khác là không cần truyền kích thước cho function.

Cũng có thể trả string từ function để đáp ứng yêu cầu. String có thể được truyền vào để sửa hoặc cấp phát bên trong function. Cũng có thể trả string cấp phát static. Chúng ta sẽ xét từng cách.

Cũng xem function pointer và cách hỗ trợ sorting operation. Hiểu cách pointer hoạt động trong các tình huống này là trọng tâm chương.

## Cơ bản về string

String là chuỗi character kết thúc bằng ASCII `NUL`. ASCII character `NUL` biểu diễn là `\0`. String thường lưu trong array hoặc memory cấp từ heap. Tuy nhiên, không phải mọi array character đều là string. Array `char` có thể không chứa `NUL`. Array `char` từng được dùng biểu diễn đơn vị integer nhỏ hơn như boolean để tiết kiệm memory cho application.

Có hai loại string trong C:

Byte string

Gồm chuỗi data type `char`

Wide string

Gồm chuỗi data type `wchar_t`

Data type `wchar_t` dùng cho wide character, có thể rộng 16 hoặc 32 bit. Cả hai loại string đều kết thúc bằng `NUL`. Byte string function nằm trong string.h; wide string function trong wchar.h. Trừ khi nói khác, chương này dùng byte string. Wide char được tạo để hỗ trợ character set non-Latin, hữu ích trong application hỗ trợ ngoại ngữ.

Độ dài string là số character, không gồm `NUL`. Khi cấp memory cho string, nhớ cấp đủ cho mọi character cộng thêm `NUL`.

![image](images/ch05/fig05-01.png)

Nhớ rằng `NULL` khác `NUL`. `NULL` dùng như pointer đặc biệt, thường định nghĩa `((void*)0)`. `NUL` là `char`, định nghĩa `'\0'`. Không nên dùng thay nhau.

Character constant là chuỗi character trong nháy đơn. Thường chỉ có một character nhưng có thể nhiều hơn như escape sequence. Trong C, chúng có type `int`. Minh họa như sau:

```
printf("%d\n",sizeof(char));
printf("%d\n",sizeof('a'));
```

Khi chạy, kích thước `char` là 1 còn character literal là 4. Sự bất thường này là hệ quả thiết kế ngôn ngữ.

### Khai báo string

Có ba cách khai báo string: literal, array character hoặc pointer đến character. String literal là chuỗi character trong nháy kép, thường dùng để khởi tạo. Chúng nằm trong string literal pool bàn ở mục sau.

Đừng nhầm string literal với character trong nháy đơn—đó là character literal. Như sẽ thấy, dùng character literal thay string literal có thể gây vấn đề. Ví dụ sau khai báo array header chứa tối đa 31 character. Vì string cần ký tự kết thúc `NUL`, array khai báo 32 character chỉ dùng 31 element cho văn bản thực. Vị trí string tùy nơi đặt declaration, sẽ tìm hiểu trong “Khởi tạo string” trang 110.

```
char header[32];
```

Sau đây minh họa pointer đến character. Vì chưa khởi tạo, nó không tham chiếu string nào. Độ dài và vị trí string chưa được chỉ định.

```
char *header;
```

### String literal pool

Khi định nghĩa literal, chúng thường được đưa vào literal pool. Vùng memory này chứa các chuỗi character tạo thành string. Khi literal dùng nhiều lần, thường chỉ có một bản sao trong string literal pool, giảm không gian application. Vì literal thường được coi immutable, một bản sao không gây hại. Tuy nhiên, không nên giả định chỉ có một bản sao hay literal immutable. Phần lớn compiler có option tắt string pooling. Khi đó literal có thể bị nhân bản, mỗi bản có address riêng.

![image](images/ch05/fig05-02.png)

GCC dùng option `-fwritable-strings` tắt string pooling. Microsoft Visual Studio dùng `/GF` bật string pooling.

Hình 5-1 minh họa memory có thể được cấp cho literal pool.

![image](images/ch05/fig05-03.png)

Hình 5-1. String literal pool String literal thường được cấp trong read-only memory, khiến chúng immutable. Không quan trọng literal dùng ở đâu, global, static hay local. Theo nghĩa này string literal không có scope.

#### Khi string literal không phải constant

Phần lớn compiler coi string literal là constant, không sửa được. Tuy nhiên, một số compiler như GCC cho phép sửa string literal. Xét ví dụ:

```
char *tabHeader  = "Sound";
*tabHeader = 'L';
printf("%s\n",tabHeader);   // Displays "Lound"
```

Điều này đổi literal thành “Lound.” Thường không mong muốn và nên tránh. Đặt variable thành constant như sau cung cấp giải pháp một phần. Mọi nỗ lực sửa string sẽ gây compile-time error.

```
const char *tabHeader  = "Sound";
```

### Khởi tạo string

Cách khởi tạo tùy variable được khai báo array character hay pointer đến character. Memory dùng cho string là array hoặc memory do pointer trỏ đến. Khi khởi tạo, có thể dùng string literal, chuỗi character hoặc lấy character từ nguồn khác như standard input. Chúng ta sẽ xét các cách này.

#### Khởi tạo array char

Có thể khởi tạo array `char` bằng initialization operator. Ví dụ sau khởi tạo array header bằng character trong string literal:

```
char header[] = "Media Player";
```

Literal “Media Player” dài 12 character nên cần 13 byte biểu diễn. Array được cấp 13 byte chứa string. Initialization copy character vào array với `NUL` kết thúc, như Hình 5-2, giả định declaration nằm trong function `main`.

Cũng có thể khởi tạo array bằng `strcpy`, bàn kỹ trong “Copy string” trang 116. Chuỗi sau copy string literal vào array.

```
char header[13];
strcpy(header,"Media Player");
```

![image](images/ch05/fig05-04.png)

Hình 5-2. Khởi tạo array char

Cách tỉ mỉ hơn là gán từng character như sau:

```
header[0] = 'M';
header[1] = 'e';
    ...
header[12] = '\0';
```

![image](images/ch05/fig05-01.png)

Assignment sau không hợp lệ. Không thể gán address string literal cho tên array.

```
char header2[];
header2 = "Media Player";
```

#### Khởi tạo pointer đến char

Dynamic memory allocation linh hoạt và có thể cho memory tồn tại lâu hơn. Declaration sau dùng minh họa kỹ thuật:

```
char *header;
```

Cách khởi tạo phổ biến là dùng `malloc` và `strcpy` để cấp memory rồi copy literal vào string:

```
char *header = (char*) malloc(strlen("Media Player")+1);
strcpy(header,"Media Player");
```

Giả định code nằm trong main function, Hình 5-3 cho trạng thái program stack.

![image](images/ch05/fig05-05.png)

Hình 5-3. Khởi tạo pointer đến char

Trong cách dùng `malloc` trước, dùng `strlen` với argument string literal. Có thể khai báo kích thước tường minh như sau:

```
char *header = (char*) malloc(13);
```

![image](images/ch05/fig05-01.png)

Khi xác định độ dài string để dùng với `malloc`:

- Luôn nhớ cộng một cho ký tự kết thúc `NUL`.

- Đừng dùng `sizeof`. Hãy dùng `strlen` xác định độ dài string hiện có. Operator `sizeof` trả kích thước array hoặc pointer, không phải độ dài string.

Thay vì string literal và `strcpy` để khởi tạo, có thể dùng:

```
*(header + 0) = 'M';
*(header + 1) = 'e';
    ...
*(header + 12) = '\0';
```

Address string literal có thể gán trực tiếp cho character pointer như sau. Tuy nhiên, không tạo bản sao string mới, như Hình 5-4:

```
char *header = "Media Player";
```

![image](images/ch05/fig05-06.png)

Hình 5-4. Copy address string literal vào pointer

![image](images/ch05/fig05-01.png)

Thử khởi tạo pointer đến char bằng character literal không hoạt động. Vì character literal có type `int`, đó là cố gán integer cho character pointer. Khi dereference, thường làm application kết thúc:

```
char* prefix = '+';   // Illegal
```

Cách hợp lệ dùng `malloc` như sau:

```
prefix = (char*)malloc(2);
*prefix = '+';
*(prefix+1) = 0;
```

#### Khởi tạo string từ standard input

String cũng có thể khởi tạo từ nguồn ngoài như standard input. Tuy nhiên, có thể mắc initialization error khi đọc string như sau. Vấn đề là chưa cấp memory cho variable `command` trước khi dùng:

```
char *command;
printf("Enter a Command: ");
scanf("%s",command);
```

Để xử lý, trước tiên cấp memory cho pointer hoặc dùng array kích thước cố định thay pointer. Nhưng người dùng có thể nhập nhiều hơn lượng chứa được. Chương 4 minh họa cách vững chắc hơn.

#### Tóm tắt vị trí string

String có thể được cấp ở một số vị trí. Ví dụ sau minh họa các biến thể, còn Hình 5-5 cho bố trí memory:

```
char* globalHeader = "Chapter";
char globalArrayHeader[] = "Chapter";

void displayHeader() {
    static char* staticHeader = "Chapter";
    char* localHeader = "Chapter";
    static char staticArrayHeader[] = "Chapter";
    char localArrayHeader[] = "Chapter";
    char* heapHeader = (char*)malloc(strlen("Chapter")+1);
    strcpy(heapHeader,"Chapter");
}
```

Biết vị trí string hữu ích khi tìm hiểu chương trình và dùng pointer truy cập. Vị trí quyết định thời gian tồn tại và phần application có thể truy cập. Ví dụ string cấp trong global memory luôn có sẵn, nhiều function truy cập được. Static string luôn có sẵn nhưng chỉ function định nghĩa truy cập được. String trong heap tồn tại đến khi giải phóng, có thể dùng trong nhiều function. Hiểu điều này giúp quyết định có cơ sở.

![image](images/ch05/fig05-07.png)

Hình 5-5. Cấp phát string trong memory

## Standard string operation

Phần này xem cách dùng pointer trong operation string phổ biến, gồm so sánh, copy và nối.

### So sánh string

So sánh string có thể là phần không thể thiếu của application. Chúng ta xét chi tiết vì so sánh sai có thể cho kết quả gây nhầm hoặc không hợp lệ. Hiểu cơ chế giúp tránh operation sai, đồng thời áp dụng được cho tình huống tương tự.

Cách standard so sánh string là dùng `strcmp`. Prototype như sau:

```
int strcmp(const char *s1, const char *s2);
```

Hai string được truyền như pointer đến constant `char`, cho phép dùng function không sợ sửa string. Function trả một trong ba giá trị:

Âm

Nếu `s1` đứng trước `s2` theo thứ tự từ điển (bảng chữ cái)

Zero

Nếu hai string bằng nhau

Dương

Nếu `s1` đứng sau `s2` theo thứ tự từ điển

Return value dương và âm hữu ích để sort string theo bảng chữ cái. Sau đây minh họa kiểm tra bằng nhau. Input người dùng lưu trong `command`, rồi so với string literal:

```
char command[16];

printf("Enter a Command: ");
scanf("%s", command);
if (strcmp(command, "Quit") == 0) {
    printf("The command was Quit");
} else {
    printf("The command was not Quit");
}
```

Hình 5-6 cho memory allocation.

Có vài cách sai để so sánh hai string. Cách đầu sau thử dùng assignment operator để so sánh:

```
char command[16];
```

```
printf("Enter a Command: ");
scanf("%s",command);
if(command = "Quit") {
   ...
```

Thứ nhất, nó không so sánh; thứ hai, sinh syntax error báo type không tương thích. Không thể gán address của string

![image](images/ch05/fig05-08.png)

Hình 5-6. Ví dụ strcmp

literal cho tên array. Ví dụ này cố gán address string literal, 600, cho `command`. Vì `command` là array, không thể gán giá trị cho variable mà không dùng array subscript.

Cách thứ hai dùng equality operator:

```
char command[16];
```

```
printf("Enter a Command: ");
scanf("%s",command);
if(command == "Quit") {
   ...
```

Kết quả phải false vì đang so address `command`, 300, với address string literal, 600. Equality operator so address chứ không so nội dung tại address. Dùng riêng tên array hoặc string literal trả address.

### Copy string

Copy string là operation phổ biến, thường bằng `strcpy` có prototype:

```
char* strcpy(char *s1, const char *s2);
```

Phần này trình bày quy trình copy cơ bản và lỗi hay gặp. Giả định cần copy string hiện có vào buffer mới cấp động, dù cũng có thể dùng array character.

Ứng dụng phổ biến là đọc nhiều string rồi lưu từng string vào array với memory tối thiểu. Có thể tạo array đủ chứa string lớn nhất người dùng có thể nhập rồi đọc vào. Dựa trên string đọc được, cấp đúng lượng memory. Các bước cơ bản:

1\. Đọc string bằng array `char` lớn

2\. Dùng `malloc` cấp đúng lượng memory

3\. Dùng `strcpy` copy string vào memory cấp động

Chuỗi sau minh họa. Array `names` chứa pointer đến từng tên đọc vào. Variable `count` chỉ element trống tiếp theo. Array `name` giữ string đọc được, tái sử dụng cho mỗi tên. Function `malloc` cấp memory cần cho từng string và được gán cho element trống kế tiếp của `names`. Sau đó copy tên vào memory:

```
char name[32];
char *names[30];
size_t count = 0;
```

```
printf("Enter a name: ");
scanf("%s",name);
names[count] = (char*)malloc(strlen(name)+1);
strcpy(names[count],name);
count++;
```

Có thể lặp operation trong loop, tăng count mỗi vòng. Hình 5-7 minh họa bố trí memory sau khi đọc một tên “Sam.”

![image](images/ch05/fig05-09.png)

Hình 5-7. Copy string

Hai pointer có thể tham chiếu cùng string. Hai pointer tham chiếu cùng vị trí gọi là aliasing, bàn trong Chương 8. Dù không nhất thiết gây vấn đề, cần biết gán pointer này cho pointer kia không copy string, chỉ copy address. Sau đây khai báo array pointer đến page header. Trang index 12 được gán address string literal. Sau đó pointer trong `pageHeaders[12]` được copy sang `pageHeaders[13]`. Cả hai nay cùng tham chiếu string literal. Pointer được copy, không phải string:

```
char *pageHeaders[300];
```

```
pageHeaders[12] = "Amorphous Compounds";
pageHeaders[13] = pageHeaders[12];
```

Các assignment được minh họa trong Hình 5-8.

![image](images/ch05/fig05-10.png)

Hình 5-8. Tác động của copy pointer

### Nối string

Nối string là gộp hai string. Function `strcat` thường dùng cho operation này. Nó nhận pointer đến hai string cần nối và trả pointer đến kết quả. Prototype:

```
char *strcat(char *s1, const char *s2);
```

Function nối string thứ hai vào cuối string đầu. String thứ hai được truyền như pointer đến constant `char`. Function không cấp memory. Vì vậy string đầu phải đủ lớn chứa kết quả, nếu không có thể ghi vượt cuối, gây hành vi khó dự đoán. Return value là cùng address với argument đầu, tiện trong tình huống như dùng function làm argument của `printf`. Để minh họa, nối hai string thông báo lỗi: đầu là prefix, sau là lỗi cụ thể. Như sau, đầu tiên cấp đủ memory cho cả hai trong buffer, copy string đầu vào buffer rồi nối string thứ hai:

```
char* error = "ERROR: ";
char* errorMessage = "Not enough memory";

char* buffer = (char*)malloc(strlen(error)+strlen(errorMessage)+1);
strcpy(buffer,error);
strcat(buffer, errorMessage);
```

```
printf("%s\n", buffer);
printf("%s\n", error);
printf("%s\n", errorMessage);
```

Cộng một vào argument `malloc` để chứa `NUL`. Giả định literal đầu nằm ngay trước literal thứ hai trong memory, output như sau. Hình 5-9 minh họa allocation:

```
ERROR: Not enough memory
ERROR:
Not enough memory
```

![image](images/ch05/fig05-11.png)

Hình 5-9. Copy operation đúng

Nếu không cấp vị trí memory riêng cho string nối, sẽ ghi đè string đầu. Ví dụ sau không dùng buffer để minh họa. Cũng giả định literal đầu nằm ngay trước literal thứ hai:

```
char* error = "ERROR: ";
char* errorMessage = "Not enough memory";
```

```
strcat(error, errorMessage);
printf("%s\n", error);
printf("%s\n", errorMessage);
```

Output của chuỗi như sau:

```
ERROR: Not enough memory
ot enough memory
```

String `errorMessage` đã dịch một character sang trái vì string kết quả được ghi đè lên `errorMessage`. Literal “Not enough memory” theo sau literal đầu, nên literal thứ hai bị ghi đè. Hình 5-10 minh họa trạng thái literal pool trước và sau copy.

![image](images/ch05/fig05-12.png)

Hình 5-10. Copy string sai

Có thể dùng array `char` thay pointer cho thông báo như sau, nhưng không phải luôn hoạt động:

```
char error[] = "ERROR: ";
char errorMessage[] = "Not enough memory";
```

Nếu dùng lời gọi `strcpy` sau, nhận syntax error vì cố gán pointer function trả về cho tên array. Operation này không hợp lệ:

```
error = strcat(error, errorMessage);
```

Nếu bỏ assignment như sau, có thể gặp memory access violation vì copy ghi đè một phần stack frame. Giả định array declaration nằm trong function như Hình 5-11. Dù source string ở literal pool hay stack frame, không nên dùng trực tiếp để chứa kết quả nối. Luôn cấp memory riêng cho concatenation:

```
strcat(error, errorMessage);
```

![image](images/ch05/fig05-13.png)

Hình 5-11. Ghi đè stack frame

Lỗi đơn giản khác khi nối là dùng character literal thay string literal. Ví dụ sau nối string vào path string và hoạt động như dự kiến:

```
char* path = "C:";
char* currentPath = (char*) malloc(strlen(path)+2);
currentPath = strcat(currentPath,"\\");
```

Cộng hai vào độ dài string trong lời gọi `malloc` vì cần chỗ cho character bổ sung và `NUL`. Chỉ nối một character, backslash, vì dùng escape sequence trong string literal.

Tuy nhiên, dùng character literal như sau gây runtime error khi argument thứ hai bị diễn giải nhầm thành address của `char`:

```
currentPath = strcat(path,'\\');
```

## Truyền string

Truyền string khá đơn giản. Trong function call, dùng expression evaluate thành address của `char`. Trong parameter list, khai báo pointer đến `char`. Vấn đề thú vị xuất hiện khi dùng string trong function. Hai mục đầu xem truyền string đơn giản; mục thứ ba xem truyền string cần khởi tạo. Truyền string làm argument application được bàn trong “Truyền argument cho application” trang 125.

### Truyền string đơn giản

Có nhiều cách truyền address string cho function, tùy declaration. Phần này minh họa bằng function mô phỏng `strlen` như dưới. Dùng ngoặc buộc post increment operator thực thi trước, tăng pointer. Nếu không, character được `string` tham chiếu bị tăng, không đúng ý định:

```
size_t stringLength(char* string) {
    size_t length = 0;
    while(*(string++)) {
        length++;
    }
    return length;
}
```

![image](images/ch05/fig05-02.png)

Thực ra nên truyền string như pointer đến constant `char`, như mục “Truyền pointer đến constant char” trang 123.

Bắt đầu với các declaration:

```
char simpleArray[] = "simple string";
char *simplePtr = (char*)malloc(strlen("simple string")+1);
strcpy(simplePtr, "simple string");
```

Để gọi function với pointer, chỉ dùng tên pointer:

```
printf("%d\n",stringLength(simplePtr));
```

Để gọi với array, có ba lựa chọn sau. Câu đầu dùng tên array, trả address. Câu hai dùng address-of operator tường minh, dư thừa và không cần, thường còn sinh warning. Câu ba dùng address-of operator với element đầu; hoạt động nhưng hơi dài:

```
printf("%d\n",stringLength(simpleArray));
printf("%d\n",stringLength(&simpleArray));
printf("%d\n",stringLength(&simpleArray[0]));
```

Hình 5-12 minh họa memory cho function `stringLength`.

![image](images/ch05/fig05-14.png)

Hình 5-12. Truyền string Giờ xem cách khai báo formal parameter. Trong implementation `stringLength` trước, parameter là pointer đến `char`. Cũng có thể dùng array notation như sau:

```
size_t stringLength(char string[]) { ... }
```

Function body giữ nguyên. Thay đổi không ảnh hưởng lời gọi hoặc hành vi function.

### Truyền pointer đến constant char

Truyền pointer đến string như constant `char` là kỹ thuật rất phổ biến và hữu ích. Nó truyền string bằng pointer, đồng thời ngăn sửa string. Implementation tốt hơn của `stringLength` trong “Truyền string” trang 121 dùng declaration như sau:

```
size_t stringLength(const char* string) {
    size_t length = 0;
    while(*(string++)) {
        length++;
    }
    return length;
}
```

Nếu thử sửa string gốc như sau, sinh compile-time error:

```
size_t stringLength(const char* string) {
      ...
    *string = 'A';
      ...
}
```

### Truyền string để khởi tạo

Có lúc muốn function trả string do chính nó khởi tạo. Ví dụ truyền thông tin linh kiện như tên, số lượng rồi nhận string đã định dạng biểu diễn thông tin. Giữ quy trình format trong function cho phép tái sử dụng ở nhiều phần chương trình.

Tuy nhiên, phải quyết định truyền buffer rỗng để function điền rồi trả, hay để function cấp động buffer rồi trả về.

Khi truyền buffer:

- Phải truyền address và kích thước buffer

- Caller chịu trách nhiệm giải phóng buffer

- Function thường trả pointer đến buffer này

Cách này giữ trách nhiệm cấp và giải phóng buffer cho caller. Trả pointer đến buffer là phổ biến dù không cần, như `strcpy` và function tương tự. Function `format` sau minh họa:

```
char* format(char *buffer, size_t size,
        const char* name, size_t quantity, size_t weight) {
    snprintf(buffer, size, "Item: %s  Quantity: %u  Weight: %u",
            name, quantity, weight);
    return buffer;
}
```

Function `snprintf` được dùng để format string đơn giản. Nó ghi vào buffer do parameter đầu cung cấp. Argument hai chỉ kích thước buffer. Function không ghi vượt cuối buffer; ngoài ra hành xử như `printf`.

Sau đây minh họa cách dùng:

```
printf("%s\n",format(buffer,sizeof(buffer),"Axle",25,45));
```

Output như sau:

```
Item: Axle  Quantity: 25  Weight: 45
```

Trả pointer đến `buffer` cho phép dùng function làm parameter của `printf`.

Cách khác là truyền NULL làm address buffer, ngụ ý caller không muốn cung cấp buffer hoặc không chắc kích thước. Có thể triển khai như sau. Khi tính length, subexpression `10 + 10` biểu diễn độ rộng lớn nhất dự kiến cho số lượng và trọng lượng. Số một dành cho ký tự kết thúc `NUL`:

```
char* format(char *buffer, size_t size,
        const char* name, size_t quantity, size_t weight) {

    char *formatString = "Item: %s  Quantity: %u  Weight: %u";
    size_t formatStringLength = strlen(formatString)-6;
    size_t nameLength = strlen(name);
    size_t length = formatStringLength + nameLength +
            10 + 10 + 1;
```

```
    if(buffer == NULL) {
        buffer = (char*)malloc(length);
        size = length;
    }
    snprintf(buffer, size, formatString, name, quantity, weight);
    return buffer;
}
```

Chọn biến thể tùy nhu cầu application. Nhược điểm chính của cách thứ hai là caller chịu trách nhiệm giải phóng memory được cấp. Caller phải biết rõ cách dùng, nếu không dễ gây memory leak.

### Truyền argument cho application

Function `main` thường chạy đầu tiên trong application. Chương trình console-based thường nhận thông tin để bật hoặc điều khiển hành vi application. Parameter có thể chỉ file cần xử lý hoặc cấu hình output. Ví dụ Linux command `ls` liệt kê file trong current directory theo parameter của command.

C hỗ trợ command line argument bằng parameter thường tên `argc` và `argv`. Parameter đầu, `argc`, là integer cho số parameter được truyền. Luôn có ít nhất một parameter: tên `executable`. Parameter thứ hai, `argv`, thường coi là array one-dimensional chứa string pointer. Mỗi pointer tham chiếu một command line argument.

Function `main` sau chỉ liệt kê argument mỗi dòng một cái. Ở đây `argv` khai báo pointer đến pointer đến `char`:

```
int main(int argc, char** argv) {
    for(int i=0; i<argc; i++) {
        printf("argv[%d] %s\n",i,argv[i]);
    }
    ...
}
```

Chạy chương trình bằng command line:

```
process.exe -f names.txt limit=12 -verbose
```

Output như sau:

```
argv[0] c:/process.exe
argv[1] -f
argv[2] names.txt
argv[3] limit=12
argv[4] -verbose
```

Mỗi command line parameter được phân tách bằng khoảng trắng. Hình 5-13 minh họa memory.

![image](images/ch05/fig05-15.png)

Hình 5-13. Dùng argc/argv

Có thể đơn giản hóa declaration `argv` như sau:

```
int main(int argc, char* argv[]) {
```

Tương đương `char** argv`. “Nhiều mức indirection” trang 25 giải thích kỹ notation.

## Trả string

Khi function trả string, nó trả address của string. Điều chính cần quan tâm là trả address hợp lệ. Có thể trả tham chiếu đến:

- Literal

- Memory cấp phát động

- Local string variable

### Trả address của literal

Ví dụ sau trả literal. Integer code chọn một trong bốn trung tâm xử lý. Function trả tên trung tâm dưới dạng string; ở đây chỉ trả address literal:

```
char* returnALiteral(int code) {
    switch(code) {
        case 100:
            return "Boston Processing Center";
        case 200:
            return "Denver Processing Center";
        case 300:
            return "Atlanta Processing Center";
        case 400:
            return "San Jose Processing Center";
    }
}
```

Cách này hoạt động tốt. Chỉ cần nhớ string literal không luôn được coi constant, như “Khi string literal không phải constant” trang 110. Cũng có thể khai báo static literal như ví dụ sau. Thêm field `subCode` để chọn giữa các trung tâm. Ưu điểm là không dùng cùng literal nhiều nơi, tránh lỗi gõ sai:

```
char* returnAStaticLiteral(int code, int subCode) {
    static char* bpCenter = "Boston Processing Center";
    static char* dpCenter = "Denver Processing Center";
    static char* apCenter = "Atlanta Processing Center";
    static char* sjpCenter = "San Jose Processing Center";
```

```
    switch(code) {
        case 100:
            return bpCenter;
        case 135:
            if(subCode <35) {
                return dpCenter;
            } else {
                return bpCenter;
            }
        case 200:
            return dpCenter;
        case 300:
            return apCenter;
        case 400:
            return sjpCenter;
    }
}
```

Trả pointer đến static string dùng cho nhiều mục đích có thể gây vấn đề. Xét biến thể `format` trong “Truyền string để khởi tạo” trang 123. Thông tin linh kiện được truyền vào rồi trả string đã format biểu diễn string:

```
char* staticFormat(const char* name, size_t quantity, size_t weight) {
    static char buffer[64];  // Assume to be large enough
    sprintf(buffer, "Item: %s  Quantity: %u  Weight: %u",
            name, quantity, weight);
    return buffer;
}
```

Buffer được cấp 64 byte, có thể đủ hoặc không. Ví dụ bỏ qua vấn đề tiềm tàng này. Vấn đề chính của cách này được minh họa bằng:

```
char* part1 = staticFormat("Axle",25,45);
char* part2 = staticFormat("Piston",55,5);
printf("%s\n",part1);
printf("%s\n",part2);
```

Khi chạy nhận output:

```
Item: Piston  Quantity: 55  Weight: 5
Item: Piston  Quantity: 55  Weight: 5
```

Vì method `staticFormat` dùng cùng static buffer cho hai lời gọi, lần cuối ghi đè kết quả lần đầu.

### Trả address của memory cấp động

Nếu cần trả string, có thể cấp memory từ heap rồi trả address. Chúng ta minh họa bằng function `blanks`, trả string chứa chuỗi khoảng trắng biểu diễn “tab” như sau. Function nhận integer chỉ độ dài chuỗi tab:

```
char* blanks(int number) {
    char* spaces = (char*) malloc(number + 1);
    int i;
    for (i = 0; i<number; i++) {
        spaces[i] = ' ';
    }
    spaces[number] = '\0';
    return spaces;
}

    ...
    char *tmp = blanks(5);
```

Ký tự kết thúc `NUL` gán cho element cuối, index `number`. Hình 5-14 minh họa memory, cho trạng thái ngay trước và sau function `blanks` return.

Caller chịu trách nhiệm giải phóng memory trả về. Không giải phóng khi hết cần gây memory leak. Ví dụ sau cho trường hợp leak: string dùng trong `printf`, sau đó address mất vì không được lưu:

```
printf("[%s]\n",blanks(5));
```

Cách an toàn hơn như sau:

```
char *tmp = blanks(5);
printf("[%s]\n",tmp);
free(tmp);
```

![image](images/ch05/fig05-16.png)

Hình 5-14. Trả string cấp động

#### Trả address của local string

Trả address local string gây vấn đề vì memory sẽ hỏng khi stack frame khác ghi đè. Nên tránh cách này; giải thích ở đây nhằm minh họa nguy cơ.

Viết lại function blanks trước như sau. Thay vì cấp memory động, khai báo array trong function, nên nó nằm trong stack frame. Function trả address array:

```
#define MAX_TAB_LENGTH 32

char* blanks(int number) {
    char spaces[MAX_TAB_LENGTH];
    int i;
    for (i = 0; i < number && i < MAX_TAB_LENGTH; i++) {
        spaces[i] = ' ';
    }
    spaces[i] = '\0';
    return spaces;
}
```

Function trả address string, nhưng memory sau đó bị function tiếp theo ghi đè. Khi dereference pointer, nội dung có thể đã đổi. Hình 5-15 minh họa program stack.

![image](images/ch05/fig05-17.png)

Hình 5-15. Trả address local string

## Function pointer và string

Function pointer được bàn kỹ trong “Function pointer” trang 71, là cách linh hoạt điều khiển thực thi. Phần này minh họa bằng cách truyền comparison function cho sort function. Trong sort, so sánh element để quyết định swap. Comparison xác định sort tăng, giảm hay theo tiêu chí khác. Truyền function điều khiển comparison làm function linh hoạt hơn; các comparison function khác nhau cho cùng sort function hoạt động khác nhau.

Các comparison function dùng ở đây xác định thứ tự theo chữ hoa/thường của element. Hai function `compare` và `compareIgnoreCase` sau so sánh theo case. Function `compareIgnoreCase` chuyển string sang chữ thường trước khi dùng `strcmp` so sánh. Function `strcmp` đã bàn trong “So sánh string” trang 115. Function `stringToLower` trả pointer đến memory cấp động, nên phải giải phóng khi không cần:

```
int compare(const char* s1, const char* s2) {
    return strcmp(s1,s2);
}

int compareIgnoreCase(const char* s1, const char* s2) {
    char* t1 = stringToLower(s1);
    char* t2 = stringToLower(s2);
    int result = strcmp(t1, t2);
    free(t1);
    free(t2);
    return result;
}
```

Function `stringToLower` sau trả phiên bản chữ thường của string truyền vào:

```
char* stringToLower(const char* string) {
    char *tmp = (char*) malloc(strlen(string) + 1);
    char *start = tmp;
    while (*string != 0) {
        *tmp++ = tolower(*string++);
    }
    *tmp = 0;
    return start;
}
```

Function pointer dùng được khai báo bằng type definition:

```
typedef int (fptrOperation)(const char*, const char*);
```

Implementation của `sort` sau dựa bubble sort algorithm. Nó nhận address array, kích thước và pointer đến function điều khiển sort. Trong câu `if`, function truyền vào được gọi với hai element, quyết định có swap không.

```
void sort(char *array[], int size, fptrOperation operation) {
    int swap = 1;
    while(swap) {
        swap = 0;
        for(int i=0; i<size-1; i++) {
            if(operation(array[i],array[i+1]) > 0){
                swap = 1;
                char *tmp = array[i];
                array[i] = array[i+1];
                array[i+1] = tmp;
            }
        }
    }
}
```

Display function hiển thị nội dung array:

```
void displayNames(char* names[], int size) {
    for(int i=0; i<size; i++) {
        printf("%s   ",names[i]);
    }
    printf("\n");
}
```

Có thể gọi `sort` bằng một trong hai comparison function. Sau đây dùng `compare` để sort case-sensitive:

```
char* names[] = {"Bob", "Ted", "Carol", "Alice", "alice"};
sort(names,5,compare);
displayNames(names,5);
```

Output của chuỗi như sau:

```
Alice   Bob   Carol   Ted   alice
```

Nếu dùng `compareIgnoreCase` thay thế, output như sau:

```
Alice   alice   Bob   Carol   Ted
```

Điều này làm `sort` linh hoạt hơn nhiều. Có thể thiết kế và truyền operation đơn giản hoặc phức tạp tùy ý để điều khiển sort mà không viết các function `sort` khác nhau cho từng nhu cầu.

## Tóm tắt

Chương này tập trung string operation và pointer. Cấu trúc string cùng vị trí trong memory ảnh hưởng cách dùng. Pointer là công cụ linh hoạt xử lý string nhưng cũng tạo nhiều cơ hội dùng sai.

Đã bàn string literal và literal pool. Hiểu literal giúp giải thích vì sao một số string assignment không luôn như dự kiến. Điều này liên quan chặt với string initialization, đã trình bày kỹ. Nhiều standard string operation được xem xét và vấn đề tiềm tàng được xác định.

Truyền string vào và trả string từ function là operation phổ biến. Vấn đề và nguy cơ đã được nêu chi tiết, gồm trả local string. Cũng đã bàn pointer đến constant character.

Cuối cùng, function pointer minh họa cách mạnh mẽ để viết sort function. Cách này không chỉ giới hạn sort mà áp dụng được nơi khác.
