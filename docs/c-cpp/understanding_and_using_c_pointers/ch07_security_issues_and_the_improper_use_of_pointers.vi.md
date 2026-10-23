# Chương 7. Những vấn đề security và việc sử dụng pointer không đúng cách

Hiếm có application nào mà security và reliability không quan trọng. Mối lo càng tăng bởi các báo cáo thường xuyên về vi phạm security và application failure. Trách nhiệm bảo vệ application phần lớn thuộc developer. Chương này xem các thực hành làm application an toàn và đáng tin cậy hơn.

Viết application an toàn bằng C có thể khó vì những đặc điểm vốn có của ngôn ngữ. Ví dụ C không ngăn programmer ghi ngoài giới hạn array, có thể làm hỏng memory và tạo nguy cơ security. Ngoài ra, dùng pointer sai thường là gốc rễ nhiều vấn đề security.

Khi application hành xử khó dự đoán, điều đó có thể không có vẻ là vấn đề security, ít nhất xét về truy cập trái phép. Tuy nhiên, đôi khi có thể lợi dụng hành vi ấy, gây denial of service và làm application bị tổn hại. Hành vi khó dự đoán do sử dụng pointer sai đã được minh họa ở những phần khác trong sách. Trong chương này, chúng ta sẽ xác định thêm những cách sử dụng pointer không đúng.

CERT là nguồn tốt để tìm hiểu toàn diện hơn vấn đề security trong C và ngôn ngữ khác. Tổ chức này nghiên cứu Internet security vulnerability. Chúng ta tập trung vấn đề liên quan pointer. Nhiều mối lo security của CERT bắt nguồn từ dùng pointer sai. Hiểu pointer và cách dùng đúng là công cụ quan trọng phát triển application an toàn, đáng tin. Một số chủ đề đã bàn trước, không nhất thiết theo góc security mà theo thực hành lập trình. Operating system (OS) đã có cải tiến security; một số thể hiện ở cách dùng memory. Dù thường ngoài tầm kiểm soát developer, cải tiến vẫn ảnh hưởng chương trình. Hiểu chúng giúp giải thích hành vi application. Chúng ta tập trung Address Space Layout Randomization và Data Execution Prevention.

Quá trình Address Space Layout Randomization (ASLR) bố trí ngẫu nhiên các data region của application trong memory. Các vùng này gồm code, stack và heap. Ngẫu nhiên hóa vị trí khiến attacker khó đoán memory được đặt ở đâu, do đó khó khai thác hơn. Một số kiểu tấn công, như return-to-libc, ghi đè một phần stack rồi chuyển control đến vùng này. Vùng đó thường là shared C library, `libc`. Nếu không biết vị trí stack và `libc`, những cuộc tấn công như vậy ít có khả năng thành công hơn.

Data Execution Prevention (DEP) ngăn thực thi code nằm trong vùng memory nonexecutable. Trong một số attack, memory bị ghi đè bằng malicious code rồi control chuyển đến đó. Nếu vùng code này nonexecutable, như stack hoặc heap, nó bị ngăn thực thi. Kỹ thuật có thể triển khai bằng hardware hoặc software.

Trong chương này, chúng ta xem xét các vấn đề security từ một số góc độ:

- Declaration và initialization của pointer

- Dùng pointer sai

- Vấn đề deallocation

## Declaration và initialization của pointer

Vấn đề có thể phát sinh khi khai báo và khởi tạo pointer, hay chính xác hơn là khi không khởi tạo pointer. Phần này sẽ xem xét những tình huống có thể xảy ra các loại vấn đề ấy.

### Declaration pointer sai

Xét declaration:

```
int* ptr1, ptr2;
```

Declaration không nhất thiết sai, nhưng có thể không đúng ý định. Nó khai báo `ptr1` là pointer đến integer và `ptr2` là integer. Dấu sao cố ý đặt sát data type, khoảng trắng trước `ptr1`. Vị trí không ảnh hưởng compiler, nhưng người đọc có thể nghĩ cả `ptr1` và `ptr2` là pointer đến integer. Thực tế chỉ `ptr1` là pointer. Cách đúng là khai báo cả hai là pointer trên cùng dòng như sau:

```
int *ptr1, *ptr2;
```

![image](images/ch07/fig07-01.png)

Tốt hơn nữa là khai báo mỗi variable một dòng.

Một thực hành tốt khác là sử dụng type definition thay cho macro definition. Type definition cho phép compiler kiểm tra các quy tắc scope, điều không phải lúc nào cũng đúng với macro definition.

Có thể khai báo variable với hỗ trợ directive như sau. Pointer đến integer được gói trong directive `define` rồi dùng khai báo variable:

```
#define PINT int*
PINT ptr1, ptr2;
```

Tuy nhiên, kết quả vẫn gặp vấn đề trên. Cách tốt hơn dùng type definition:

```
typedef int* PINT;
PINT ptr1, ptr2;
```

Cả hai variable đều là pointer đến integer.

### Không khởi tạo pointer trước khi dùng

Dùng pointer trước khi khởi tạo có thể gây run-time error. Pointer như vậy đôi khi được gọi là wild pointer. Ví dụ đơn giản sau khai báo pointer tới integer nhưng không gán giá trị cho nó trước khi sử dụng:

```
int *pi;
...
printf(“%d\n”,*pi);
```

Hình 7-1 minh họa cách memory được cấp phát tại thời điểm này.

![image](images/ch07/fig07-02.png)

Hình 7-1. Wild pointer

Variable `pi` chưa được khởi tạo và chứa giá trị rác, được biểu thị bằng dấu ba chấm. Đoạn lệnh này rất có thể sẽ kết thúc trong khi thực thi nếu memory address lưu trong `pi` nằm ngoài address space hợp lệ của application. Nếu không, giá trị được hiển thị sẽ là bất cứ thứ gì tình cờ có ở address đó, được diễn giải như integer. Nếu thay bằng pointer tới string, chúng ta thường thấy một chuỗi ký tự lạ được hiển thị cho đến khi gặp số zero kết thúc.

### Xử lý pointer chưa khởi tạo

Không có gì vốn có trong pointer cho biết hợp lệ hay không. Vì vậy không thể chỉ xem nội dung để xác định. Tuy nhiên có ba cách xử lý pointer chưa khởi tạo:

- Luôn khởi tạo pointer bằng `NULL`

- Dùng function `assert`

- Dùng tool third-party

Khởi tạo bằng `NULL` giúp kiểm tra cách dùng đúng dễ hơn. Dù vậy, kiểm tra null có thể tẻ nhạt như sau:

```
int *pi = NULL;
...
if(pi == NULL) {
   // pi should not be dereferenced
} else {
   // pi can be used
}
```

Function `assert` cũng kiểm tra null pointer value. Ví dụ sau kiểm tra variable `pi` với null. Nếu expression true, không có gì xảy ra; nếu false, chương trình kết thúc. Vì vậy pointer null sẽ làm chương trình kết thúc.

```
assert(pi != NULL);
```

Với debug version của application, cách tiếp cận này có thể chấp nhận được. Nếu pointer là null, output sẽ tương tự như sau:

```
Assertion failed: pi != NULL
```

Function `assert` nằm trong header file assert.h.

Các công cụ Third-party cũng có thể hỗ trợ phát hiện những loại vấn đề này. Ngoài ra, một số compiler option có thể hữu ích, như được đề cập trong phần “Sử dụng công cụ static analysis” ở trang 173.

## Vấn đề sử dụng pointer

Phần này xem xét việc dùng sai dereference operator và array subscript. Chúng ta cũng xem xét những vấn đề liên quan đến string, structure và function pointer. Nhiều vấn đề security xoay quanh khái niệm buffer overflow. Buffer overflow xảy ra khi memory bên ngoài giới hạn object bị ghi đè. Memory này có thể thuộc address space của chương trình hoặc của process khác. Khi memory nằm ngoài address space của chương trình, phần lớn operating system phát sinh segmentation fault và kết thúc chương trình. Nếu được gây ra với ý đồ xấu, việc kết thúc vì lý do này cấu thành denial of service attack. Kiểu tấn công này không cố giành truy cập trái phép mà nhằm làm application, và có thể cả server, ngừng hoạt động.

Nếu buffer overflow nằm trong address space application, có thể dẫn tới truy cập data trái phép và/hoặc chuyển control sang code segment khác, nguy cơ làm hệ thống bị xâm phạm. Đặc biệt đáng lo nếu application chạy với supervisor privilege.

Buffer overflow có thể xảy ra do:

- Không kiểm tra index khi truy cập array element

- Không thận trọng khi thực hiện pointer arithmetic với array pointer

- Dùng function như `gets` đọc string từ standard input

- Dùng sai function như `strcpy` và `strcat`

Khi buffer overflow xảy ra với element stack frame, có thể ghi đè return address bằng lời gọi malicious code được tạo cùng lúc. Xem “Program stack và heap” trang 58 để biết thêm về stack frame. Khi function return, control chuyển đến malicious function, có thể làm mọi operation chỉ bị giới hạn bởi privilege level của current user.

### Kiểm tra NULL

Luôn kiểm tra return value khi dùng function thuộc kiểu `malloc`. Không làm vậy có thể khiến chương trình kết thúc bất thường. Sau đây minh họa cách tiếp cận tổng quát:

```
float *vector = malloc(20 * sizeof(float));
if(vector == NULL) {
    // malloc failed to allocate memory
} else {
    // Process vector
}
```

### Dùng sai dereference operator

Cách phổ biến khai báo và khởi tạo pointer như sau:

```
int num;
int *pi = &num;
```

Chuỗi declaration có vẻ tương đương như sau:

```
int num;
int *pi;
*pi = &num;
```

Tuy nhiên, cách này không đúng. Hãy chú ý dereference operator ở dòng cuối. Chúng ta đang cố gán address của `num` vào vị trí memory được nội dung `pi` chỉ định, thay vì gán cho `pi`. Pointer `pi` vẫn chưa được khởi tạo. Chúng ta đã mắc lỗi đơn giản là dùng sai dereference operator. Đoạn lệnh đúng như sau:

```
int num;
int *pi;
pi = &num;
```

Trong declaration gốc `int *pi = &num`, dấu sao khai báo variable là pointer, không phải dereference operator.

### Dangling pointer

Dangling pointer xảy ra khi pointer được giải phóng nhưng vẫn tham chiếu memory đó. Vấn đề này được mô tả chi tiết trong “Dangling pointer” ở trang 51. Nếu cố truy cập memory ấy về sau, nội dung của nó rất có thể đã thay đổi. Write operation trên memory này có thể làm hỏng memory; read operation có thể trả về data không hợp lệ. Cả hai đều có nguy cơ khiến chương trình kết thúc.

Cho đến gần đây, điều này chưa được xem là mối lo security. Như Dangling Pointer giải thích, có khả năng khai thác dangling pointer. Tuy nhiên cách này dựa trên khai thác VTable (Virtual Table) trong C++. VTable là array function pointer hỗ trợ virtual method C++. Trừ khi dùng cách tương tự với function pointer, đây không phải mối lo trong C.

### Truy cập memory ngoài giới hạn array

Không có gì ngăn chương trình truy cập memory ngoài vùng được cấp phát cho array. Ví dụ này khai báo và khởi tạo ba array để minh họa hành vi ấy. Giả định rằng các array được cấp phát tại những vị trí memory liên tiếp.

```
char firstName[8] = "1234567";
char middleName[8] = "1234567";
char lastName[8] = "1234567";

middleName[-2] = 'X';
middleName[0] = 'X';
middleName[10] = 'X';

printf("%p  %s\n",firstName,firstName);
printf("%p  %s\n",middleName,middleName);
printf("%p  %s\n",lastName,lastName);
```

Để minh họa cách memory bị ghi đè, ba array được khởi tạo bằng một dãy số đơn giản. Dù hành vi chương trình thay đổi tùy compiler và máy, đoạn này thường vẫn thực thi và ghi đè các character trong `firstName` và `lastName`. Output được trình bày dưới đây. Hình 7-2 minh họa cách memory được cấp phát:

```
116  12X4567
108  X234567
100  123456X
```

![image](images/ch07/fig07-03.png)

Hình 7-2. Dùng array index không hợp lệ

Như Chương 4 giải thích, tính address bằng subscript không kiểm tra index. Đây là buffer overflow đơn giản.

### Tính sai kích thước array

Khi truyền array cho function, luôn truyền cả kích thước array cùng lúc. Thông tin này giúp function tránh vượt giới hạn array. Trong function `replace` dưới đây, address của string được truyền cùng replacement character và kích thước buffer. Mục đích function là thay mọi character trong string cho đến character `NUL` bằng replacement character. Size argument ngăn function ghi quá cuối buffer:

```
void replace(char buffer[], char replacement, size_t size) {
    size_t count = 0;
    while(*buffer != NUL && count++<size) {
        *buffer = replacement;
        buffer++;
    }
}
```

Trong đoạn lệnh sau, array `name` chỉ chứa tối đa bảy character cộng character kết thúc `NUL`. Tuy nhiên, chúng ta cố ý ghi quá cuối array để minh họa function `replace`. Trong đoạn này, function `replace` được truyền name và replacement character là `+`:

```
char name[8];
strcpy(name,"Alexander");
replace(name,'+',sizeof(name));
printf("%s\n", name);
```

Khi chạy code nhận output:

```
++++++++r
```

Chỉ tám character plus-sign được thêm vào array. Dù `strcpy` cho phép buffer overflow, `replace` không cho. Giả định kích thước truyền hợp lệ. Cẩn thận với function như `strcpy` không nhận kích thước buffer. Truyền kích thước thêm một lớp bảo vệ.

### Dùng sai sizeof operator

Một ví dụ dùng sai operator `sizeof` xảy ra khi chúng ta cố kiểm tra giới hạn pointer nhưng làm không đúng. Trong ví dụ sau, memory được cấp phát cho integer array rồi từng element được khởi tạo bằng 0.

```
int buffer[20];
int *pbuffer = buffer;
for(int i=0; i<sizeof(buffer); i++) {
    *(pbuffer++) = 0;
}
```

Tuy nhiên, `sizeof(buffer)` trả 80 vì buffer có 80 byte (20 nhân 4 byte mỗi element). Loop `for` chạy 80 lần thay vì 20, thường gây memory access exception làm application kết thúc. Tránh bằng expression `sizeof(buffer)/sizeof(int)` trong điều kiện kiểm tra câu `for`.

### Luôn dùng pointer type khớp

Luôn dùng pointer type thích hợp với data là một ý tưởng tốt. Để minh họa một nguy cơ có thể xảy ra, hãy xét đoạn lệnh sau. Pointer tới integer được gán cho pointer tới `short`:

```
int  num = 2147483647;
int *pi = &num;
short *ps = (short*)pi;
printf("pi: %p  Value(16): %x  Value(10): %d\n", pi, *pi, *pi);
printf("ps: %p  Value(16): %hx  Value(10): %hd\n",
        ps, (unsigned short)*ps, (unsigned short)*ps);
```

Output đoạn code:

```
pi: 100  Value(16): 7fffffff  Value(10): 2147483647
ps: 100  Value(16): ffff  Value(10): -1
```

Lưu ý rằng chữ số hexadecimal đầu tiên lưu tại address 100 có vẻ là `7` hoặc `f`, tùy nó được hiển thị như integer hay short. Sự mâu thuẫn bề ngoài này là hệ quả của việc thực thi đoạn lệnh trên máy little endian. Hình 7-3 minh họa cách bố trí memory của constant tại address 100.

![image](images/ch07/fig07-04.png)

Hình 7-3. Pointer type không khớp

Nếu coi đây là số short và chỉ dùng hai byte đầu, chúng ta nhận giá trị short là –1. Nếu coi là integer và dùng cả bốn byte, chúng ta nhận 2,147,483,647. Những vấn đề tinh vi như vậy khiến C và pointer trở thành chủ đề đầy thách thức.

### Bounded pointer

Thuật ngữ bounded pointer mô tả những pointer có việc sử dụng bị giới hạn trong các vùng hợp lệ. Ví dụ, với array được khai báo có 32 element, pointer dùng với array này sẽ bị ngăn truy cập bất kỳ memory nào trước hoặc sau array.

C không hỗ trợ trực tiếp, nhưng programmer có thể cưỡng chế tường minh như sau:

```
#define SIZE 32

char name[SIZE];
char *p = name;
if(name != NULL) {
    if(p >= name && p < name+SIZE) {
        // Valid pointer - continue
    } else {
        // Invalid pointer - error condition
    }
}
```

Cách này có thể tẻ nhạt. Thay vào đó static analysis trong “Dùng static analysis tool” trang 173 có thể hữu ích.

Biến thể thú vị là tạo pointer validation function; cần biết vị trí đầu và phạm vi.

Cách khác dùng Bounded Model Checking for ANSI-C and C++ (CBMC). Application này kiểm tra nhiều vấn đề safety, security trong C và tìm vấn đề array bound, buffer overflow.

![image](images/ch07/fig07-01.png)

Smart pointer, có trong C++, cung cấp cách mô phỏng pointer và hỗ trợ bounds checking. Đáng tiếc, chúng không có trong C.

### Vấn đề string security

Vấn đề security liên quan đến string thường xảy ra khi chúng ta ghi quá cuối string. Phần này tập trung vào những function “standard” góp phần gây ra vấn đề ấy.

Dùng những string function như `strcpy` và `strcat` có thể gây buffer overflow nếu không thận trọng. Đã có một số cách được đề xuất để thay thế các method này, nhưng chưa cách nào được chấp nhận rộng rãi. Function `strncpy` và `strncat` có thể hỗ trợ phần nào, với parameter `size_t` chỉ định số character tối đa cần sao chép. Tuy nhiên, chúng cũng dễ gây lỗi nếu số character không được tính đúng.

Trong C11 (Annex K), các function `strcat_s` và `strcpy_s` đã được bổ sung. Chúng trả về lỗi nếu xảy ra buffer overflow. Hiện tại chỉ Microsoft Visual C++ hỗ trợ chúng. Ví dụ sau minh họa function `strcpy_s`. Nó nhận ba parameter: destination buffer, kích thước destination buffer và source buffer. Return value bằng zero nghĩa là không có lỗi. Tuy nhiên, trong ví dụ này sẽ xảy ra lỗi vì source quá lớn để vừa destination buffer:

```
char firstName [8];
int result;
result = strcpy_s(firstName,sizeof(firstName),"Alexander");
```

Function `scanf_s` và `wscanf_s` cũng có để bảo vệ khỏi buffer overflow.

Function `gets` đọc string từ standard input rồi lưu character vào buffer chỉ định. Nó có thể ghi vượt độ dài khai báo. Nếu string quá dài, buffer overflow xảy ra.

Một số Linux system cũng hỗ trợ `strlcpy` và `srtlcat`, nhưng GNU C library không hỗ trợ. Có người cho rằng chúng gây nhiều vấn đề hơn giải quyết và tài liệu chưa tốt.

Việc sử dụng một số function có thể cho phép attacker truy cập memory bằng kỹ thuật gọi là format string attack. Trong những cuộc tấn công này, user-supplied format string, minh họa dưới đây, được chế tạo để cho phép truy cập memory và có thể inject code. Trong chương trình đơn giản này, command line argument thứ hai được dùng làm parameter đầu tiên của function `printf`:

```
int main(int argc, char** argv) {
    printf(argv[1]);
    ...
}
```

Có thể chạy bằng command tương tự:

```
main.exe "User Supplied Input"
```

Output như sau:

```
User Supplied Input
```

Dù chương trình này vô hại, một cuộc tấn công tinh vi hơn có thể gây thiệt hại thực sự. Ở đây không trình bày toàn diện chủ đề này; tuy nhiên, có thể tìm thêm chi tiết về cách thực hiện kiểu tấn công ấy tại hackerproof.org.

Các function `printf`, `fprintf`, `snprintf`, `syslog` đều nhận format string argument. Phòng thủ đơn giản nhất là không bao giờ dùng format string user-supplied với chúng.

### Pointer arithmetic và structure

Chỉ nên dùng pointer arithmetic với array. Vì array được bảo đảm cấp phát trong block memory liên tục, pointer arithmetic sẽ cho offset hợp lệ. Tuy nhiên, không nên dùng nó bên trong structure, vì các field của structure có thể không được cấp phát trong những vùng memory liên tiếp.

Structure sau minh họa điều này. Field `name` được cấp phát 10 byte, tiếp theo là một integer. Tuy nhiên, vì integer được align theo ranh giới four-byte, giữa hai field sẽ có khoảng trống. Những khoảng trống kiểu này được giải thích trong phần “Memory được cấp phát cho structure như thế nào” ở trang 135.

```
typedef struct _employee {
    char name[10];
    int age;
} Employee;
```

Chuỗi sau cố dùng pointer truy cập field `age`:

```
Employee employee;
// Initialize eployee
char *ptr = employee.name;
ptr += sizeof(employee.name);
```

Pointer sẽ chứa address 110, là address của hai byte nằm giữa hai field. Dereference pointer sẽ diễn giải bốn byte tại address 110 như một integer. Hình 7-4 minh họa điều này.

![image](images/ch07/fig07-05.png)

Hình 7-4. Ví dụ padding structure

![image](images/ch07/fig07-06.png)

Pointer được align không đúng có thể khiến chương trình kết thúc bất thường hoặc lấy được data sai. Ngoài ra, truy cập pointer có thể chậm hơn nếu compiler phải sinh thêm machine code để bù cho alignment không đúng.

Ngay cả khi memory trong structure liên tục, dùng pointer arithmetic với field của structure vẫn không phải thực hành tốt. Structure sau định nghĩa một `Item` gồm ba integer. Dù ba integer field thường được cấp phát tại những vị trí memory liên tiếp, không có bảo đảm chúng sẽ như vậy:

```
typedef struct _item {
    int partNumber;
    int quantity;
    int binNumber;
}Item;
```

Chuỗi code sau khai báo part rồi dùng pointer arithmetic truy cập từng field:

```
Item part = {12345, 35, 107};
int *pi = &part.partNumber;
printf("Part number: %d\n",*pi);
pi++;
printf("Quantity: %d\n",*pi);
pi++;
printf("Bin number: %d\n",*pi);
```

Output thường như mong đợi nhưng không bảo đảm. Tốt hơn là gán từng field cho `pi`:

```
int *pi = &part.partNumber;
printf("Part number: %d\n",*pi);
pi = &part.quantity;
printf("Quantity: %d\n",*pi);
pi = &part.binNumber;
printf("Bin number: %d\n",*pi);
```

Tốt hơn nữa, không dùng pointer như sau:

```
printf("Part number: %d\n",part.partNumber);
printf("Quantity: %d\n",part.quantity);
printf("Bin number: %d\n",part.binNumber);
```

### Vấn đề function pointer

Function và function pointer được dùng để điều khiển thứ tự thực thi chương trình, nhưng có thể bị sử dụng sai, gây hành vi khó dự đoán. Hãy xét function `getSystemStatus`. Function này trả integer value phản ánh trạng thái hệ thống:

```
int getSystemStatus() {
    int status;
    ...
    return status;
}
```

Cách tốt nhất để xác định trạng thái hệ thống có bằng zero hay không như sau:

```
if(getSystemStatus() == 0) {
    printf("Status is 0\n");
} else {
     printf("Status is not 0\n");
}
```

Trong ví dụ tiếp theo, chúng ta quên dùng dấu ngoặc mở và đóng. Code sẽ không thực thi đúng:

```
if(getSystemStatus == 0) {
    printf("Status is 0\n");
} else {
    printf("Status is not 0\n");
}
```

Mệnh đề `else` sẽ luôn được thực thi. Trong logical expression, chúng ta so sánh address của function với 0 thay vì gọi function rồi so sánh return value của nó với 0. Hãy nhớ rằng khi tên function được dùng riêng, nó trả về address của function.

Một lỗi tương tự là dùng trực tiếp return value của function mà không so sánh kết quả với giá trị khác. Address chỉ được trả về và đánh giá là true hoặc false. Address của function khó có thể bằng zero. Vì vậy, address được trả về sẽ được đánh giá là true, do C coi mọi giá trị khác zero là true:

```
if(getSystemStatus) {
    // Will always be true
}
```

Đáng ra phải viết lời gọi như sau để xác định status zero.

```
if(getSystemStatus()) {
```

Đừng gán function cho function pointer khi signature của chúng khác nhau. Việc này có thể gây undefined behavior. Ví dụ về cách dùng sai ấy như sau:

```
int (*fptrCompute)(int,int);
int add(int n1, int n2, int n3) {
    return n1+n2+n3;
}

fptrCompute = add;
fptrCompute(2,5);
```

Chúng ta cố gọi `add` với hai argument trong khi cần ba. Code compile được nhưng output indeterminate.

Function pointer thực thi các function khác nhau tùy address được gán cho nó. Ví dụ, chúng ta có thể muốn dùng function `printf` cho hoạt động thông thường nhưng đổi sang function khác để logging chuyên biệt. Sau đây minh họa việc khai báo và sử dụng function pointer như vậy:

```
int (*fptrIndirect)(const char *, ...) = printf;
fptrIndirect("Executing printf indirectly");
```

Attacker có thể dùng buffer overflow để ghi đè address của function pointer. Khi điều này xảy ra, control có thể được chuyển đến một vị trí tùy ý trong memory.

## Vấn đề memory deallocation

Ngay cả khi memory đã giải phóng, chưa chắc đã xong với pointer hoặc memory đó. Một mối lo là cố free cùng memory hai lần. Ngoài ra, sau free có thể cần bảo vệ data còn dư. Phần này xét các vấn đề đó.

### Double free

Giải phóng một block memory hai lần được gọi là double free, như giải thích trong “Double free” ở trang 48. Sau đây minh họa cách điều đó xảy ra:

```
char *name = (char*)malloc(...);
...
free(name);     // First free
...
free(name);     // Double free
```

Trong một phiên bản cũ của zlib compression library, operation double-free có thể gây denial of service attack hoặc chèn code vào chương trình. Tuy nhiên, khả năng này cực kỳ thấp và vulnerability đã được xử lý trong những bản phát hành mới hơn của library. Có thể tìm thêm thông tin về vulnerability này tại cert.org.

Một kỹ thuật đơn giản để tránh loại vulnerability này là luôn gán NULL cho pointer sau khi giải phóng. Phần lớn heap manager sẽ bỏ qua những lần cố giải phóng null pointer tiếp theo.

```
char *name = (char*)malloc(...);
...
free(name);
name = NULL;
```

Trong “Tự viết function free” trang 70, đã phát triển function làm điều này.

### Xóa sensitive data

Nên ghi đè sensitive data trong memory khi không còn cần đến. Khi application kết thúc, phần lớn operating system không đặt memory mà application đã dùng về zero hoặc thao tác nó theo cách khác. Vùng memory cũ có thể được cấp cho chương trình khác, chương trình ấy sẽ truy cập được nội dung. Ghi đè sensitive data khiến chương trình khác khó trích xuất thông tin hữu ích từ program address space trước đó dùng để giữ sensitive data. Đoạn lệnh sau minh họa việc đặt sensitive data trong chương trình về zero:

```
char name[32];
int userID;
char *securityQuestion;
```

```
// assign values
...
```

```
// Delete sensitive information
memset(name,0,sizeof(name));
userID = 0;
memset(securityQuestion,0,strlen(securityQuestion));
```

Nếu `name` khai báo pointer, nên xóa memory trước khi giải phóng như sau:

```
char *name = (char*)malloc(...);
...
memset(name,0,sizeof(name));
free(name);
```

## Dùng static analysis tool

Có nhiều công cụ static analysis để phát hiện việc dùng pointer sai. Ngoài ra, phần lớn compiler có option để phát hiện nhiều vấn đề được đề cập trong chương này. Ví dụ, option `-Wall` của GCC compiler bật việc báo tất cả compiler warning.

Sau đây minh họa warning sinh ra từ một số ví dụ trong chương. Ở đây chúng ta quên dùng dấu ngoặc mở và đóng cho function call:

```
if(getSystemStatus == 0) {
```

Kết quả là warning:

```
warning: the address of 'getSystemStatus' will never be NULL
```

Ở đây mắc lỗi về cơ bản giống nhau:

```
if(getSystemStatus) {
```

Tuy nhiên warning khác:

```
warning: the address of 'getSystemStatus' will always evaluate as 'true'
```

Dùng pointer type không tương thích gây warning:

```
int (*fptrCompute)(int,int);
int addNumbers(int n1, int n2, int n3) {
    return n1+n2+n3;
}

    ...
    fptrCompute = addNumbers;
```

Warning như sau:

```
warning: assignment from incompatible pointer type
```

Không khởi tạo pointer thường gây vấn đề:

```
char *securityQuestion;
strcpy(securityQuestion,"Name of your home town");
```

Warning sinh ra rõ ràng đến ngạc nhiên:

```
warning: 'securityQuestion' is used uninitialized in this function
```

Cũng có nhiều công cụ static analysis. Một số miễn phí, số khác thu phí. Nhìn chung, chúng cung cấp khả năng chẩn đoán nâng cao hơn phần lớn compiler. Do tính chất phức tạp của chúng, các ví dụ nằm ngoài phạm vi sách.

## Tóm tắt

Trong chương này, chúng ta khảo sát pointer có thể ảnh hưởng security và reliability của application ra sao. Các vấn đề được tổ chức quanh việc khai báo và khởi tạo pointer, sử dụng pointer và memory deallocation. Ví dụ, điều quan trọng là khởi tạo pointer trước khi dùng, và có thể cần dọn memory string đã sử dụng khi không còn cần nó. Đặt pointer thành `NULL` có thể là kỹ thuật hiệu quả trong nhiều tình huống này.

Pointer có thể được sử dụng sai theo nhiều cách. Nhiều cách liên quan đến việc ghi đè memory ngoài string, một dạng buffer overflow. Dùng pointer sai có thể gây undefined behavior trong nhiều trường hợp, kể cả pointer type không khớp và pointer arithmetic không đúng.

Chúng ta đã minh họa nhiều kỹ thuật tránh những loại vấn đề này. Nhiều kỹ thuật đơn giản chỉ liên quan đến việc hiểu pointer và string phải được sử dụng thế nào. Chúng ta cũng đề cập cách dùng compiler và công cụ static analysis để xác định các vùng có nguy cơ gặp vấn đề.
