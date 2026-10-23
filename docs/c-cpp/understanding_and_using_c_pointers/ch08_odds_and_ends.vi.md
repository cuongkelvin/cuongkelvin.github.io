# Chương 8. Các chủ đề khác

Pointer thiết yếu với gần như mọi khía cạnh của C. Nhiều lĩnh vực trong số này được xác định khá rõ, chẳng hạn array và function. Chương này xem xét một số chủ đề không phù hợp hoàn toàn với các chương trước. Nội dung này sẽ hoàn thiện kiến thức của bạn về cách pointer hoạt động.

Chương này xem các chủ đề liên quan pointer:

- Cast pointer

- Truy cập hardware device

- Aliasing và strict aliasing

- Dùng keyword `restrict`

- Thread

- Kỹ thuật Object-oriented

Về thread, có hai lĩnh vực đáng quan tâm. Thứ nhất là vấn đề cơ bản về chia sẻ data giữa các thread bằng pointer. Thứ hai thảo luận cách dùng pointer để hỗ trợ callback. Một operation có thể gọi function để thực hiện một công việc. Khi function thực tế được gọi thay đổi, nó được gọi là callback function. Chẳng hạn sort function dùng trong Chương 5 là một ví dụ về callback function. Callback cũng được dùng để giao tiếp giữa các thread.

Chúng ta sẽ trình bày hai cách cung cấp hỗ trợ kiểu object-oriented trong C. Cách thứ nhất dùng opaque pointer. Kỹ thuật này giấu những chi tiết implementation của data structure khỏi user. Kỹ thuật thứ hai minh họa cách tạo hành vi polymorphic type trong C.

## Cast pointer

Casting là operator cơ bản có thể rất hữu ích khi dùng với pointer. Cast pointer hữu ích vì một số lý do, bao gồm:

- Truy cập address cho mục đích đặc biệt

- Gán address biểu diễn port

- Xác định endianness của máy

Cũng sẽ bàn chủ đề gần với cast trong “Dùng union biểu diễn giá trị theo nhiều cách” trang 182.

![image](images/ch08/fig08-01.png)

Endianness của máy thường chỉ thứ tự byte trong data type. Hai loại phổ biến là little endian và big endian. Little endian lưu low-order byte tại address thấp nhất; big endian lưu high-order byte tại address thấp nhất.

Có thể cast integer thành pointer đến integer như sau:

```
int num = 8;
int *pi = (int*)num;
```

Tuy nhiên, đây thường là thực hành không tốt vì nó cho phép truy cập address tùy ý, có thể là vị trí chương trình không được phép truy cập. Hình 8-1 minh họa điều này: address 8 nằm ngoài address space của application. Nếu dereference pointer, thông thường application sẽ kết thúc.

![image](images/ch08/fig08-02.png)

Hình 8-1. Cast integer đến vị trí không hợp lệ Trong một số tình huống, chẳng hạn khi cần truy cập memory location zero, chúng ta có thể cần cast pointer sang integer rồi cast lại thành pointer. Điều này phổ biến hơn trên hệ thống cũ, nơi kích thước pointer bằng kích thước integer. Tuy nhiên, cách này không phải luôn hoạt động. Sau đây minh họa cách tiếp cận đó, với output implementation-dependent:

```
pi = &num;
printf("Before: %p\n",pi);
int tmp = (int)pi;
pi = (int*)tmp;
printf("After: %p\n",pi);
```

Cast pointer sang integer rồi trở lại pointer chưa bao giờ được coi là thực hành tốt. Nếu cần làm vậy, hãy cân nhắc union, như thảo luận trong phần “Dùng union biểu diễn giá trị theo nhiều cách” ở trang 182.

Nhớ rằng cast sang và từ integer khác cast sang và từ void, như “Pointer đến void” trang 14 minh họa.

![image](images/ch08/fig08-01.png)

Thuật ngữ handle đôi khi bị nhầm với pointer. Handle là tham chiếu đến system resource. Việc truy cập resource được cung cấp thông qua handle. Tuy nhiên, handle thường không cung cấp truy cập trực tiếp đến resource. Ngược lại, pointer chứa address của resource.

### Truy cập address cho mục đích đặc biệt

Nhu cầu truy cập address cho mục đích đặc biệt thường xuất hiện trên embedded system, nơi operating system làm trung gian rất ít. Ví dụ, trong một số OS kernel low-level, address video RAM của PC là 0xB8000. Address này chứa character cần hiển thị ở hàng đầu tiên và cột đầu tiên trong text mode. Có thể gán address ấy cho pointer rồi gán character vào vị trí đó như minh họa dưới đây. Hình 8-2 trình bày memory layout:

```
#define VIDEO_BASE 0xB8000
int *video = (int *) VIDEO_BASE;
*video = 'A';
```

Nếu thích hợp, cũng có thể đọc address này. Thường không làm vậy với video memory.

Khi cần truy cập memory tại vị trí zero, đôi khi compiler sẽ coi đó là giá trị pointer `NULL`. Chương trình kernel low-level thường cần truy cập vị trí zero. Sau đây là một số kỹ thuật xử lý tình huống này:

- Đặt pointer bằng zero (không phải luôn hoạt động)

- Gán zero cho integer rồi cast integer thành pointer

![image](images/ch08/fig08-03.png)

Hình 8-2. Truy cập video memory trên PC

- Dùng union như mục “Dùng union biểu diễn giá trị theo nhiều cách” trang 182

- Dùng function `memset` gán zero cho pointer

Ví dụ dùng `memset` như sau. Memory mà `ptr` tham chiếu được đặt toàn zero:

```
memset((void*)&ptr, 0, sizeof(ptr));
```

Trên hệ thống cần truy cập vị trí zero, nhà cung cấp thường có workaround.

### Truy cập port

Port vừa là khái niệm hardware vừa là khái niệm software. Server dùng software port để chỉ ra rằng nó phải nhận một số message gửi tới máy. Hardware port thường là component input/output vật lý của hệ thống được nối với external device. Bằng cách đọc hoặc ghi hardware port, chương trình có thể xử lý thông tin và command.

Software truy cập port thường thuộc OS. Sau đây minh họa pointer truy cập port:

```
#define PORT 0xB0000000
unsigned int volatile * const port = (unsigned int *) PORT;
```

Máy dùng address dạng hexadecimal để chỉ định port. Data được coi là unsigned integer. Qualifier keyword `volatile` cho biết variable có thể bị thay đổi từ bên ngoài chương trình. Ví dụ, external device có thể ghi data vào port. Write operation này diễn ra độc lập với processor của máy tính. Đôi khi compiler tạm dùng cache hoặc register để giữ giá trị tại một memory location nhằm tối ưu. Nếu thao tác ghi bên ngoài sửa memory location, thay đổi đó sẽ không được phản ánh trong giá trị đã cache hoặc lưu trong register.

Dùng keyword volatile ngăn runtime system dùng register để lưu tạm giá trị port. Mỗi lần truy cập port đòi hỏi hệ thống đọc hoặc ghi port thay vì đọc giá trị có thể đã cũ trong register. Chúng ta không muốn khai báo mọi variable là volatile, vì điều đó ngăn compiler thực hiện một số loại optimization.

Sau đó, application có thể đọc hoặc ghi port bằng cách dereference port pointer như sau. Hình 8-3 trình bày memory layout, trong đó External Device có thể đọc/ghi memory tại 0xB0000000:

```
*port = 0x0BF4; // write to the port
value = *port; // read from the port
```

![image](images/ch08/fig08-04.png)

Hình 8-3. Truy cập port

![image](images/ch08/fig08-05.png)

Không nên truy cập volatile memory bằng nonvolatile variable. Có thể dẫn tới undefined behavior.

### Truy cập memory bằng DMA

Direct Memory Access (DMA) là operation low-level hỗ trợ truyền data giữa main memory và một device. Nó không thuộc ANSI C specification, nhưng operating system thường cung cấp hỗ trợ cho operation này. DMA operation thường được thực hiện song song với CPU. Điều này giải phóng CPU để xử lý việc khác và có thể cho performance tốt hơn.

Programmer sẽ gọi một DMA function rồi chờ operation hoàn tất. Programmer thường cung cấp callback function. Khi operation hoàn tất, operating system gọi callback function. Callback được chỉ định bằng function pointer và sẽ được thảo luận thêm trong phần “Dùng function pointer hỗ trợ callback” ở trang 188.

### Xác định endianness của máy

Cast operator còn có thể dùng để xác định endianness của architecture. Endian chỉ thứ tự byte trong một đơn vị memory. Endianness thường được gọi là little endian hoặc big endian. Ví dụ, với cách biểu diễn integer four-byte theo little endian, least significant byte của integer được lưu tại address thấp nhất trong bốn byte.

Ví dụ sau cast address integer thành pointer đến `char`, rồi hiển thị từng byte:

```
int num = 0x12345678;
char* pc = (char*) &num;
for (int i = 0; i < 4; i++) {
    printf("%p: %02x \n", pc, (unsigned char) *pc++);
}
```

Output của đoạn code này khi thực thi trên Intel PC phản ánh architecture little-endian như dưới đây. Hình 8-4 minh họa cách các giá trị được cấp phát trong memory:

```
100: 78
101: 56
102: 34
103: 12
```

![image](images/ch08/fig08-06.png)

Hình 8-4. Ví dụ endian

## Aliasing, strict aliasing và keyword restrict

Một pointer được gọi là alias của pointer khác nếu cả hai cùng tham chiếu một memory location. Điều này không hiếm và có thể gây một số vấn đề. Trong đoạn code sau, hai pointer được khai báo và cùng được gán một address:

```
int num = 5;
int* p1 = &num;
int* p2 = &num;
```

Khi compiler sinh code cho pointer, nó phải giả định aliasing có thể xảy ra trừ khi được thông báo khác. Aliasing đặt những hạn chế lên code compiler-generated. Nếu hai pointer tham chiếu cùng vị trí, cả hai đều có thể sửa vị trí ấy. Khi compiler sinh code để đọc hoặc ghi vị trí đó, không phải lúc nào nó cũng tối ưu code bằng cách lưu giá trị trong register được. Nó buộc phải thực hiện các operation load và store ở machine-level với mỗi lần tham chiếu. Chuỗi load/store lặp lại có thể không hiệu quả. Trong một số tình huống, compiler còn phải quan tâm thứ tự thực hiện operation.

Strict aliasing là một dạng aliasing khác. Strict aliasing không cho pointer thuộc data type này alias pointer thuộc data type khác. Trong đoạn code sau, pointer tới integer alias pointer tới float. Điều này vi phạm quy tắc strict aliasing. Đoạn lệnh xác định số có âm hay không. Thay vì so sánh argument với zero để xem nó có dương không, cách tiếp cận này thực thi nhanh hơn:

```
float number = 3.25f;
unsigned int *ptrValue = (unsigned int *)&number;
unsigned int result = (*ptrValue & 0x80000000) == 0;
```

![image](images/ch08/fig08-01.png)

Strict aliasing không áp cho pointer chỉ khác sign hoặc qualifier. Các trường hợp sau đều là strict alias hợp lệ:

```
int num;
const int *ptr1 = &num;
int *ptr2 = &num;
int volatile ptr3 = &num;
```

Tuy nhiên, có lúc dùng nhiều biểu diễn của cùng data hữu ích. Có các kỹ thuật tránh vấn đề aliasing:

- Dùng union

- Tắt strict aliasing

- Dùng pointer đến `char`

Union gồm hai data type có thể tránh vấn đề strict aliasing. Điều này được thảo luận trong phần “Dùng union biểu diễn giá trị theo nhiều cách” ở trang 182. Nếu compiler có option vô hiệu hóa strict aliasing, có thể dùng nó để tắt. GCC compiler có những compiler option sau:

- `-fno-strict-aliasing` để tắt

- `-fstrict-aliasing` để bật

- `-Wstrict-aliasing` cảnh báo vấn đề aliasing-related của strict aliasing

Code đòi tắt strict aliasing có lẽ phản ánh cách truy cập memory chưa tốt. Khi có thể, hãy giải quyết vấn đề thay vì tắt.

![image](images/ch08/fig08-01.png)

Compiler không phải lúc nào cũng làm tốt việc báo các warning alias-related. Đôi khi chúng bỏ sót alias và đôi khi báo vấn đề alias tại nơi không có. Cuối cùng, programmer phải chịu trách nhiệm xác định các tình huống alias.

Pointer đến `char` luôn được giả định có thể alias mọi object, nên dùng an toàn trong phần lớn tình huống. Nhưng cast pointer của data type này sang pointer đến `char`, rồi cast pointer đến `char` thành pointer data type thứ hai gây undefined behavior, nên tránh.

### Dùng union biểu diễn giá trị theo nhiều cách

C là typed language. Khi variable được khai báo, nó được gán một type. Có thể tồn tại nhiều variable với type khác nhau. Đôi khi, chúng ta muốn chuyển một type sang type khác. Điều này thường được thực hiện bằng casting, nhưng cũng có thể dùng union. Thuật ngữ type punning mô tả kỹ thuật dùng để vượt qua type system.

Khi chuyển đổi liên quan pointer, có thể gây vấn đề nghiêm trọng. Để minh họa dùng ba function xác định floating point number có dương không.

Function đầu dùng union float và unsigned integer. Trước tiên gán floating point value cho union rồi lấy integer để kiểm tra:

```
typedef union _conversion {
    float fNum;
    unsigned int uiNum;
} Conversion;

int isPositive1(float number) {
    Conversion conversion = { .fNum =number};
    return (conversion.uiNum & 0x80000000) == 0;
}
```

Cách này hoạt động đúng và không liên quan aliasing vì không dùng pointer. Phiên bản tiếp theo dùng union chứa pointer tới hai data type. Address của floating point number được gán cho pointer đầu tiên. Sau đó integer pointer được dereference để thực hiện phép kiểm tra. Điều này vi phạm quy tắc strict aliasing:

```
typedef union _conversion2 {
    float *fNum;
    unsigned int *uiNum;
} Conversion2;

int isPositive2(float number) {
    Conversion2 conversion;
    conversion.fNum =&number;
    return (*conversion.uiNum & 0x80000000) == 0;
}
```

Function sau không dùng union và vi phạm strict aliasing vì pointer `ptrValue` cùng address với `number`:

```
int isPositive3(float number) {
    unsigned int *ptrValue = (unsigned int *)&number;
    return (*ptrValue & 0x80000000) == 0;
}
```

Cách các function này dùng giả định:

- Chuẩn floating point IEEE-754 dùng biểu diễn floating point number

- Floating number được bố trí theo cách cụ thể

- Integer và floating point pointer được align đúng

Các giả định không phải luôn đúng. Dù tối ưu operation được, cách này không luôn portable. Khi portability quan trọng, so sánh floating point là cách tốt hơn.

### Strict aliasing

Compiler không cưỡng chế strict aliasing; nó chỉ sinh warning. Compiler giả định hai hoặc nhiều pointer khác type sẽ không bao giờ tham chiếu cùng object. Điều này gồm pointer tới các structure khác tên nhưng giống hệt về mọi mặt khác. Với strict aliasing, compiler có thể thực hiện một số optimization. Nếu giả định sai, có thể xảy ra kết quả ngoài dự kiến.

Ngay cả nếu hai structure có cùng field nhưng khác tên, hai pointer đến chúng không nên tham chiếu cùng object. Ví dụ sau giả định pointer `person` và `employee` không bao giờ tham chiếu cùng object:

```
typedef struct _person {
    char* firstName;
    char* lastName;
    unsigned int age;
} Person;

typedef struct _employee {
    char* firstName;
    char* lastName;
    unsigned int age;
} Employee;

Person* person;
Employee* employee;
```

Tuy nhiên, pointer có thể tham chiếu cùng object nếu structure definition chỉ khác tên như sau:

```
typedef struct _person {
    char* firstName;
    char* lastName;
    unsigned int age;
} Person;

typedef Person Employee;

Person* person;
Employee* employee;
```

### Dùng keyword restrict

C compiler mặc định giả định pointer có alias. Dùng keyword `restrict` khi khai báo pointer cho compiler biết pointer không có alias. Điều này cho phép compiler sinh code hiệu quả hơn, thường bằng cách cache pointer. Hãy nhớ đây chỉ là khuyến nghị: compiler có thể quyết định không tối ưu code. Nếu alias được dùng, việc thực thi code sẽ gây undefined behavior. Compiler không đưa ra warning khi giả định bị vi phạm.

![image](images/ch08/fig08-01.png)

Khi phát triển code mới nên dùng `restrict` với phần lớn pointer declaration để tối ưu tốt hơn. Sửa code cũ có thể không đáng công.

Function sau minh họa định nghĩa và dùng `restrict`, cộng hai vector rồi lưu vào vector đầu:

```
void add(int size, double * restrict arr1, const double * restrict arr2) {
    for (int i = 0; i < size; i++) {
        arr1[i] += arr2[i];
    }
}
```

Keyword `restrict` được dùng với cả hai array parameter, nhưng chúng không được cùng tham chiếu một block memory. Sau đây trình bày cách dùng function đúng:

```
double vector1[] = {1.1, 2.2, 3.3, 4.4};
double vector2[] = {1.1, 2.2, 3.3, 4.4};
```

```
add(4,vector1,vector2);
```

Trong đoạn lệnh sau, function được gọi sai vì cùng vector được truyền làm cả hai parameter. Statement đầu dùng alias, còn statement thứ hai dùng cùng vector hai lần:

```
double vector1[] = {1.1, 2.2, 3.3, 4.4};
double *vector3 = vector1;

add(4,vector1,vector3);
add(4,vector1,vector1);
```

Dù đôi lúc chạy đúng, kết quả lời gọi có thể không đáng tin.

Một số standard C function dùng `restrict`, gồm:

- `void *memcpy(void * restrict s1, const void * restrict s2, size_t n);`

- `char *strcpy(char * restrict s1, const char * restrict s2);`

- `char *strncpy(char * restrict s1, const char * restrict s2, size_t n);`

- `int printf(const char * restrict format, ... );`

- i`nt sprintf(char * restrict s, const char * restrict format, ... );`

- i`nt snprintf(char * restrict s, size_t n, const char * restrict for` `mat, ... );`

- `int scanf(const char * restrict format, ...);`

Keyword `restrict` có hai ý nghĩa:

1\. Với compiler, có thể thực hiện một số code optimization

2\. Với programmer, những pointer này không nên alias; nếu không,

kết quả operation là undefined.

## Thread và pointer

Khi các thread chia sẻ data, nhiều vấn đề có thể xảy ra. Một vấn đề phổ biến là data corruption. Một thread có thể ghi vào object nhưng bị tạm dừng trong chốc lát, để object ở trạng thái không nhất quán. Sau đó, thread thứ hai có thể đọc object ấy trước khi thread đầu được tiếp tục. Khi đó, thread thứ hai đang dùng object không hợp lệ hoặc bị hỏng.

Vì pointer là cách phổ biến để tham chiếu data trong thread khác, chúng ta sẽ xem xét những vấn đề có thể ảnh hưởng bất lợi đến multithreaded application. Như các ví dụ trong phần này sẽ cho thấy, mutex thường được dùng để bảo vệ data.

Chuẩn C11 triển khai threading nhưng hiện chưa hỗ trợ rộng. Có nhiều library hỗ trợ thread trong C. Dùng Portable Operating System Interface (POSIX) thread vì sẵn có. Bất kể library, kỹ thuật ở đây vẫn áp dụng được. Dùng pointer hỗ trợ multithreaded application và callback. Thread là chủ đề phức tạp; giả định bạn quen khái niệm, thuật ngữ cơ bản, nên không đi sâu cách POSIX thread function hoạt động. Hãy xem PThreads Programming của O’Reilly để có thảo luận chi tiết hơn.

### Chia sẻ pointer giữa các thread

Khi hai hoặc nhiều thread chia sẻ data, data có thể bị hỏng. Để minh họa vấn đề, chúng ta sẽ triển khai một function multi-threaded tính dot product của hai vector. Nhiều thread đồng thời truy cập hai vector và một sum field. Khi các thread hoàn tất, sum field sẽ giữ giá trị dot product.

Dot product của hai vector được tính bằng cách cộng các tích của những element tương ứng của mỗi vector. Chúng ta dùng hai data structure để hỗ trợ operation này. Structure đầu tiên, `VectorInfo`, chứa thông tin về hai vector đang được thao tác. Nó có pointer tới hai vector, field `sum` giữ dot product và field `length` chỉ kích thước đoạn vector được dot product function dùng. Field `length` biểu diễn phần vector mà một thread sẽ xử lý, không phải toàn bộ độ dài vector:

```
typedef struct {
    double *vectorA;
    double *vectorB;
    double sum;
    int length;
} VectorInfo;
```

Data structure thứ hai, `Product`, chứa pointer đến instance `VectorInfo` và starting index mà vector dot `Product` dùng. Tạo instance mới cho mỗi thread với starting index khác:

```
typedef struct {
    VectorInfo *info;
    int beginningIndex;
} Product;
```

Dù mỗi thread thao tác cả hai vector cùng lúc, chúng truy cập những phần khác nhau của vector nên không có xung đột tại đó. Mỗi thread tính tổng cho phần vector của mình. Tuy nhiên, tổng này phải được cộng vào field `sum` của structure `VectorInfo`. Vì nhiều thread có thể truy cập field `sum` cùng lúc, cần bảo vệ data này bằng mutex được khai báo dưới đây. Mutex chỉ cho phép một thread truy cập variable được bảo vệ tại một thời điểm. Sau đây khai báo mutex bảo vệ variable `sum`; nó được khai báo ở global level để nhiều thread có thể truy cập:

```
pthread_mutex_t mutexSum;
```

Function `dotProduct` được trình bày dưới đây. Khi thread được tạo, function này sẽ được gọi. Vì dùng POSIX, cần khai báo function trả void và nhận pointer tới void. Pointer này truyền thông tin cho function. Chúng ta sẽ truyền một instance của structure `Product`.

Bên trong function, các variable được khai báo để giữ index bắt đầu và kết thúc. For loop thực hiện phép nhân thực tế và giữ tổng cộng dồn trong variable `total`. Phần cuối function lock mutex, cộng `total` vào `sum` rồi unlock mutex. Trong khi mutex bị lock, không thread nào khác có thể truy cập variable `sum`:

```
void dotProduct(void *prod) {
    Product *product = (Product*)prod;
    VectorInfo *vectorInfo = Product->info;
    int beginningIndex = Product->beginningIndex;
    int endingIndex = beginningIndex + vectorInfo->length;
    double total = 0;

    for (int i = beginningIndex; i < endingIndex; i++) {
        total += (vectorInfo->vectorA[i] * vectorInfo->vectorB[i]);
    }

    pthread_mutex_lock(&mutexSum);
    vectorInfo->sum += total;
    pthread_mutex_unlock(&mutexSum);

    pthread_exit((void*) 0);
}
```

Code tạo thread như sau. Khai báo hai vector đơn giản cùng instance `VectorInfo`. Mỗi vector 16 element. Field `length` đặt 4:

```
#define NUM_THREADS  4

void threadExample() {
    VectorInfo vectorInfo;
    double vectorA[] = {1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0,
        9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0};
    double vectorB[] = {1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0,
        9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0};

    double sum;

    vectorInfo.vectorA = vectorA;
    vectorInfo.vectorB = vectorB;
    vectorInfo.length = 4;
```

Tiếp theo tạo array thread four-element, cùng code khởi tạo mutex và attribute field cho thread:

```
pthread_t threads[NUM_THREADS];

void *status;
pthread_attr_t attr;

pthread_mutex_init(&mutexSum, NULL);
pthread_attr_init(&attr);
pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_JOINABLE);

int returnValue;
int threadNumber;
```

Với mỗi lần lặp for loop, một instance mới của structure `Product` được tạo. Nó được gán address của `vectorInfo` và một index riêng dựa trên `threadNumber`. Sau đó các thread được tạo:

```
for (threadNumber = 0; threadNumber < NUM_THREADS; threadNumber++) {
    Product *product = (Product*) malloc(sizeof(Product));
    product->beginningIndex = threadNumber * 4;
    product->info = &vectorInfo;
    returnValue = pthread_create(&threads[threadNumber], &attr,
                        dotProduct, (void *) (void*) (product));
    if (returnValue) {
        printf("ERROR; Unable to create thread: %d\n", returnValue);
        exit(-1);
    }
}
```

Sau loop `for`, hủy thread attribute và mutex variable. Loop `for` bảo đảm chương trình đợi cả bốn thread hoàn tất. Sau đó hiển thị dot product, bằng 1496 cho các vector trên:

```
    pthread_attr_destroy(&attr);

    for (int i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], &status);
    }

    pthread_mutex_destroy(&mutexSum);
    printf("Dot Product sum: %lf\n", vectorInfo.sum);
    pthread_exit(NULL);

}
```

Như vậy field `sum` được bảo vệ.

### Dùng function pointer hỗ trợ callback

Trước đó đã dùng callback trong sort function ở Chương 5. Vì sort không dùng nhiều thread, một số programmer không gọi đây là callback. Định nghĩa được chấp nhận rộng hơn là event trong thread này dẫn đến gọi, hay callback, function trong thread khác. Một thread được truyền function pointer đến callback. Event trong function có thể kích hoạt lời gọi callback. Cách này hữu ích trong GUI application xử lý user thread event.

Chúng ta minh họa cách này bằng function tính factorial của một số. Function sẽ callback function thứ hai sau khi tính xong factorial. Thông tin về factorial được encapsulate trong structure `FactorialData` và truyền giữa các function. Structure này và factorial function được trình bày dưới đây. Data gồm số cần tính factorial, kết quả và function pointer cho callback. Function `factorial` dùng data này để tính factorial, lưu đáp án vào field `result`, gọi callback function rồi kết thúc thread:

```
typedef struct _factorialData {
    int number;
    int result;
    void (*callBack)(struct _factorialData*);
} FactorialData;

void factorial(void *args) {
    FactorialData *factorialData = (FactorialData*) args;
    void (*callBack)(FactorialData*); // Function prototype

    int number = factorialData->number;
    callBack = factorialData->callBack;

    int num = 1;
    for(int i = 1; i<=number; i++) {
        num *= i;
    }

    factorialData->result = num;
    callBack(factorialData);

    pthread_exit(NULL);
}
```

Thread được tạo trong `startThread` sau, chạy `factorial` và truyền factorial data:

```
void startThread(FactorialData *data) {
    pthread_t thread_id;
    int thread =  pthread_create(&thread_id, NULL, factorial, (void *) data);
}
```

Callback chỉ hiển thị kết quả factorial:

```
void callBackFunction(FactorialData *factorialData) {
    printf("Factorial is %d\n", factorialData->result);
}
```

Factorial data được khởi tạo rồi function `startThread` được gọi như dưới đây. Function `Sleep` dành thời gian cho tất cả thread kết thúc đúng cách:

```
FactorialData *data =
    (FactorialData*) malloc(sizeof(FactorialData));

if(!data) {
    printf("Failed to allocate memory\n");
    return;
}

data->number = 5;
data->callBack = callBackFunction;

startThread(data);

Sleep(2000);
```

Khi chạy, output như sau:

```
Factorial is 120
```

Thay vì sleep, chương trình có thể làm task khác. Không phải đợi thread hoàn tất.

## Kỹ thuật Object-Oriented

C không nổi tiếng về hỗ trợ object-oriented programming. Nhưng có thể dùng opaque pointer encapsulate data và hỗ trợ một mức polymorphic behavior. Giấu implementation data structure cùng supporting function khiến người dùng không cần biết cách triển khai. Giấu thông tin giảm điều cần biết, từ đó giảm độ phức tạp application. Người dùng cũng không bị hấp dẫn khai thác chi tiết nội bộ, có thể gây vấn đề sau khi implementation đổi.

Polymorphic behavior giúp application dễ bảo trì hơn. Hành vi của polymorphic function phụ thuộc object mà nó đang thao tác. Điều này nghĩa là chúng ta có thể thêm chức năng vào application dễ hơn.

### Tạo và dùng opaque pointer

Opaque pointer có thể dùng để thực hiện data encapsulation trong C. Một cách là khai báo structure trong header file mà không có chi tiết implementation. Sau đó, function được định nghĩa trong implementation file để làm việc với một implementation cụ thể của data structure. User của data structure sẽ thấy declaration và prototype của các function. Tuy nhiên, implementation được giấu trong file .c/.obj. Chỉ thông tin cần thiết để sử dụng data structure được công khai cho user. Nếu cung cấp quá nhiều thông tin nội bộ, user có thể đưa nó vào code và trở nên phụ thuộc. Khi cấu trúc nội bộ thay đổi, code user có thể bị hỏng.

Chúng ta sẽ phát triển linked list để minh họa opaque pointer. User dùng một function để lấy pointer tới linked list. Sau đó pointer này được dùng để thêm và xóa thông tin khỏi linked list. Chi tiết cấu trúc nội bộ của linked list và supporting function không được cung cấp cho user. Những khía cạnh duy nhất được cung cấp về structure này nằm trong header file như sau:

```
//link.h

typedef void *Data;
typedef struct _linkedList LinkedList;

LinkedList* getLinkedListInstance();
void removeLinkedListInstance(LinkedList* list);
void addNode(LinkedList*, Data);
Data removeNode(LinkedList*);
```

Data khai báo pointer đến void, cho implementation xử lý mọi data type. Type definition `LinkedList` xác định structure `_linkedList`. Định nghĩa structure bị giấu trong implementation file.

Bốn method được cung cấp để sử dụng linked list. User bắt đầu bằng việc lấy instance của `LinkedList` qua function `getLinkedListInstance`. Khi không còn cần linked list, phải gọi function `removeLinkedListInstance`. Truyền linked list pointer cho phép function làm việc với một hoặc nhiều linked list.

Để thêm data vào linked list, dùng function `addNode`. Nó được truyền linked list cần dùng và pointer tới data cần thêm vào linked list. Method `removeNode` trả data ở head của linked list.

Implementation của linked list nằm trong file riêng tên link.c. Phần đầu implementation, trình bày dưới đây, khai báo các variable để giữ data của user và nối tới node tiếp theo trong linked list. Tiếp theo là định nghĩa structure `_linkedList`. Linked list đơn giản này chỉ dùng head pointer:

```
// link.c

#include <stdlib.h>
#include "link.h"

typedef struct _node {
      Data* data;
      struct _node* next;
} Node;
struct _linkedList {
    Node* head;
};
```

Phần thứ hai của implementation file chứa implementation của bốn supporting function cho linked list. Function đầu tiên trả một instance của linked list:

```
LinkedList* getLinkedListInstance() {
    LinkedList* list = (LinkedList*)malloc(sizeof(LinkedList));
    list->head = NULL;
    return list;
}
```

Implementation của function `removeLinkedListInstance` như sau. Nó giải phóng từng node trong linked list, nếu có, rồi giải phóng chính list. Implementation này có thể gây memory leak nếu data được node tham chiếu chứa pointer. Một giải pháp là truyền function để deallocate các member của data:

```
void removeLinkedListInstance(LinkedList* list) {
    Node *tmp = list->head;
    while(tmp != NULL) {
        free(tmp->data);  // Potential memory leak!
        Node *current = tmp;
        tmp = tmp->next;
        free(current);
    }
    free(list);
}
```

Function `addNode` thêm data truyền qua parameter thứ hai vào linked list được parameter đầu chỉ định. Memory được cấp phát cho node, và data user được liên kết với node. Trong implementation này, node của linked list luôn được thêm vào head:

```
void addNode(LinkedList* list, Data data) {
    Node *node = (Node*)malloc(sizeof(Node));
    node->data = data;
    if(list->head == NULL) {
        list->head = node;
        node->next = NULL;
    } else {
        node->next = list->head;
        list->head = node;
    }
}
```

Function `removeNode` trả data gắn với node đầu tiên trong linked list. Head pointer được điều chỉnh để trỏ tới node tiếp theo. Data được trả về và head node cũ được giải phóng, trả nó về heap.

![image](images/ch08/fig08-01.png)

Cách tiếp cận này khiến user không cần nhớ giải phóng các node của linked list, nhờ đó tránh memory leak. Đây là lợi thế đáng kể của việc giấu chi tiết implementation:

```
Data removeNode(LinkedList* list) {
    if(list->head == NULL) {
        return NULL;
    } else {
        Node* tmp = list->head;
        Data* data;
        list->head = list->head->next;
        data = tmp->data;
        free(tmp);
        return data;
    }
}
```

Để minh họa việc sử dụng data structure này, chúng ta tái sử dụng structure `Person` và những function được phát triển trong “Giới thiệu” ở trang 133. Đoạn lệnh sau thêm hai người vào linked list rồi xóa họ. Trước tiên, function `getLinkedListInstance` được gọi để lấy linked list. Tiếp theo, các instance `Person` được tạo bằng function `initializePerson` rồi thêm vào linked list bằng function `addNode`. Function `displayPerson` hiển thị những người được các function `remove` `Node` trả về. Sau đó linked list được giải phóng:

```
#include "link.h";
...
    LinkedList* list = getLinkedListInstance();
```

```
Person *person = (Person*) malloc(sizeof(Person));
initializePerson(person, "Peter", "Underwood", "Manager", 36);
addNode(list, person);
person = (Person*) malloc(sizeof(Person));
initializePerson(person, "Sue", "Stevenson", "Developer", 28);
addNode(list, person);

person = removeNode(list);
displayPerson(*person);

person = removeNode(list);
displayPerson(*person);
```

```
removeLinkedListInstance(list);
```

Có một vài điểm thú vị trong cách tiếp cận này. Chúng ta phải tạo instance của structure `_linkedList` trong file list.c. Nó cần được tạo ở đó vì không thể dùng operator `sizeof` nếu chưa có structure declaration đầy đủ. Ví dụ, nếu cố cấp phát memory cho structure này trong main function như sau, chúng ta sẽ nhận syntax error:

```
LinkedList* list = (LinkedList*)malloc(sizeof(LinkedList));
```

Syntax error tương tự:

```
error: invalid application of ‘sizeof’ to incomplete type ‘LinkedList’
```

Type là incomplete vì compiler không nhìn thấy định nghĩa thực nằm trong file list.c. Tất cả những gì nó thấy là type definition của structure `_linkedList`. Nó không thấy chi tiết implementation của structure.

Khả năng xem và khai thác cấu trúc nội bộ list của người dùng bị hạn chế. Mọi thay đổi structure được giấu.

Chỉ signature của bốn supporting function được công khai cho user. Ngoài ra, user không thể tận dụng hiểu biết về implementation của chúng hoặc sửa chúng. Linked list structure và supporting function được encapsulate, giảm gánh nặng cho user.

### Polymorphism trong C

Polymorphism trong ngôn ngữ object-oriented như C++ dựa trên inheritance giữa base class và derived class. Vì C không hỗ trợ inheritance, chúng ta cần mô phỏng inheritance giữa các structure. Chúng ta sẽ định nghĩa và sử dụng hai structure để minh họa polymorphic behavior. Structure `Shape` biểu diễn base “class”, còn structure `Rectangle` được dẫn xuất từ base `Shape`.

Thứ tự cấp phát variable của structure ảnh hưởng lớn đến cách kỹ thuật này hoạt động. Khi tạo instance của derived class/structure, các variable của base class/structure được cấp phát trước, tiếp theo là các variable của derived class/structure. Như sẽ thấy, chúng ta còn phải tính đến những function dự định override.

![image](images/ch08/fig08-01.png)

Hiểu cấp memory cho object tạo từ class là chìa khóa hiểu inheritance và polymorphism trong ngôn ngữ object-oriented. Tương tự khi dùng kỹ thuật này trong C.

Hãy bắt đầu với định nghĩa structure `Shape` như dưới đây. Trước tiên, chúng ta cấp phát một structure để giữ function pointer cho structure. Tiếp theo, các integer được khai báo cho vị trí `x` và `y`:

```
typedef struct _shape {
    vFunctions functions;
    // Base variables
    int x;
    int y;
} Shape;
```

Structure `vFunction` và những declaration hỗ trợ được định nghĩa dưới đây. Khi function thực thi trên class/structure, hành vi phụ thuộc vào đối tượng nó thao tác. Ví dụ, khi display function thực thi trên `Shape`, một `Shape` phải được hiển thị. Khi nó thực thi trên `Rectangle`, một `Rectangle` phải được hiển thị. Trong ngôn ngữ object-oriented, điều này thường đạt được bằng Virtual Table hay VTable. Structure `vFunction` được thiết kế để đảm nhận vai trò này:

```
typedef void (*fptrSet)(void*,int);
typedef int (*fptrGet)(void*);
typedef void (*fptrDisplay)();

typedef struct _functions {
    // Functions
    fptrSet setX;
    fptrGet getX;
    fptrSet setY;
    fptrGet getY;
    fptrDisplay display;
} vFunctions;
```

Structure này gồm một loạt function pointer. Các function pointer `fptrSet` và `fptrGet` định nghĩa những getter function và setter function thông thường cho data thuộc integer type. Trong trường hợp này, chúng dùng để lấy và đặt giá trị `x` và `y` cho `Shape` hoặc `Rectangle`. Function pointer `fptrDisplay` định nghĩa function được truyền `void` và trả `void`. Chúng ta sẽ dùng display function để minh họa polymorphic behavior.

Structure `Shape` có bốn function được thiết kế để làm việc với nó, như dưới đây. Implementation của chúng khá đơn giản. Để giữ ví dụ đơn giản, trong function `display` chúng ta chỉ in string “Shape.” Instance `Shape` được truyền cho những function này làm argument đầu tiên. Điều đó cho phép chúng làm việc với nhiều instance của `Shape`:

```
void shapeDisplay(Shape *shape) { printf("Shape\n");}
void shapeSetX(Shape *shape, int x) {shape->x = x;}
void shapeSetY(Shape *shape, int y) {shape->y = y;}
int shapeGetX(Shape *shape) { return shape->x;}
int shapeGetY(Shape *shape) { return shape->y;}
```

Để hỗ trợ tạo instance của `Shape`, chúng ta cung cấp function `getShapeInstance`. Nó cấp phát memory cho object rồi gán các function của object:

```
Shape* getShapeInstance() {
    Shape *shape = (Shape*)malloc(sizeof(Shape));
    shape->functions.display = shapeDisplay;
    shape->functions.setX = shapeSetX;
    shape->functions.getX = shapeGetX;
    shape->functions.setY = shapeSetY;
    shape->functions.getY = shapeGetY;
    shape->x = 100;
    shape->y = 100;
    return shape;
}
```

Chuỗi sau minh họa:

```
Shape *sptr = getShapeInstance();
sptr->functions.setX(sptr,35);
sptr->functions.display();
printf("%d\n", sptr->functions.getX(sptr));
```

Output là:

```
Shape
35
```

Điều này có vẻ tốn nhiều công sức chỉ để làm việc với structure `Shape`. Chúng ta sẽ thấy sức mạnh thực sự của cách tiếp cận khi tạo structure dẫn xuất từ `Shape`: `Rectangle`. Structure này như sau:

```
typedef struct _rectangle {
    Shape base;
    int width;
    int height;
} Rectangle;
```

Memory được cấp phát cho field đầu tiên của structure `Rectangle` giống memory được cấp phát cho structure `Shape`. Hình 8-5 minh họa điều này. Ngoài ra, chúng ta thêm hai field mới, `width` và `height`, để biểu diễn các đặc trưng của hình chữ nhật.

![image](images/ch08/fig08-07.png)

Hình 8-5. Memory allocation cho shape và rectangle `Rectangle`, như `Shape`, cần function liên quan, khai báo dưới. Chúng giống function của structure `Shape`, nhưng dùng base field của `Rectangle`:

```
void rectangleSetX(Rectangle *rectangle, int x) {
    rectangle->base.x = x;
}

void rectangleSetY(Rectangle *rectangle, int y) {
    rectangle->base.y;
}

int rectangleGetX(Rectangle *rectangle) {
    return rectangle->base.x;
}

int rectangleGetY(Rectangle *rectangle) {
    return rectangle->base.y;
}

void rectangleDisplay() {
    printf("Rectangle\n");
}
```

Function `getRectangleInstance` trả instance structure `Rectangle` như sau:

```
Rectangle* getRectangleInstance() {
    Rectangle *rectangle = (Rectangle*)malloc(sizeof(Rectangle));
    rectangle->base.functions.display = rectangleDisplay;
    rectangle->base.functions.setX = rectangleSetX;
    rectangle->base.functions.getX = rectangleGetX;
    rectangle->base.functions.setY = rectangleSetY;
    rectangle->base.functions.getY = rectangleGetY;
    rectangle->base.x = 200;
    rectangle->base.y = 200;
    rectangle->height = 300;
    rectangle->width = 500;
    return rectangle;
}
```

Sau đây minh họa cách dùng structure:

```
Rectangle *rptr = getRectangleInstance();
rptr->base.functions.setX(rptr,35);
rptr->base.functions.display();
printf("%d\n", rptr->base.functions.getX(rptr));
```

Output là:

```
Rectangle
35
```

Giờ tạo array pointer `Shape` và khởi tạo như sau. Khi gán `Rectangle` cho `shapes[1]`, không bắt buộc cast `(Shape*)`, nhưng nếu không sẽ warning:

```
Shape *shapes[3];
shapes[0] = getShapeInstance();
shapes[0]->functions.setX(shapes[0],35);
shapes[1] = getRectangleInstance();
shapes[1]->functions.setX(shapes[1],45);
shapes[2] = getShapeInstance();
shapes[2]->functions.setX(shapes[2],55);

for(int i=0; i<3; i++) {
    shapes[i]->functions.display();
    printf("%d\n", shapes[i]->functions.getX(shapes[i]));
}
```

Khi chạy chuỗi, output:

```
Shape
35
Rectangle
45
Shape
55
```

Dù tạo array pointer `Shape`, chúng ta tạo `Rectangle` rồi gán cho element thứ hai. Khi hiển thị trong for loop, nó dùng hành vi function của `Rectangle`, không của `Shape`. Đây là polymorphic behavior. Function `display` phụ thuộc structure nó thao tác.

Vì truy cập dưới dạng `Shape`, không nên cố truy cập width hoặc height qua `shapes[i]`, vì element có thể tham chiếu `Rectangle` hoặc không. Nếu làm, có thể truy cập memory trong shape khác không biểu diễn width/height, gây kết quả khó dự đoán.

Nay có thể thêm structure thứ hai dẫn xuất `Shape` như `Circle`, thêm vào array mà không sửa code nhiều. Cũng cần tạo function cho structure.

Nếu thêm function vào base structure `Shape`, chẳng hạn `getArea`, chúng ta có thể triển khai một function `getArea` riêng cho mỗi class. Trong loop, có thể dễ dàng tính tổng của mọi `Shape` và structure `Shape`-derived mà không cần xác định trước type `Shape` đang làm việc. Nếu `Shape` có implementation `getArea` đã đủ dùng, không cần thêm function cho các structure khác. Điều này giúp dễ bảo trì và mở rộng application.

## Tóm tắt

Trong chương này, chúng ta khám phá một số khía cạnh của pointer. Chúng ta bắt đầu bằng thảo luận về casting pointer. Các ví dụ minh họa cách dùng pointer để truy cập memory và hardware port. Chúng ta cũng thấy cách dùng pointer để xác định endianness của máy.

Đã giới thiệu aliasing và keyword `restrict`. Aliasing xảy ra khi hai pointer tham chiếu cùng object. Compiler giả định có thể alias, nhưng khiến code generation kém hiệu quả. Keyword `restrict` cho phép tối ưu tốt hơn.

Chúng ta đã thấy cách dùng pointer với thread và tìm hiểu sự cần thiết của việc bảo vệ data được chia sẻ qua pointer. Ngoài ra, chúng ta xem xét những kỹ thuật thực hiện callback giữa các thread bằng function pointer.

Phần cuối xét opaque pointer và polymorphic behavior. Opaque pointer cho phép C giấu data khỏi người dùng. Có thể đưa polymorphism vào chương trình để dễ bảo trì hơn.
