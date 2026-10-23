# Chương 2. Dynamic memory management trong C

Phần lớn sức mạnh của pointer bắt nguồn từ khả năng theo dõi memory được cấp phát động. Việc quản lý memory này thông qua pointer tạo nền tảng cho nhiều operation, bao gồm các operation dùng để thao tác data structure phức tạp. Để tận dụng đầy đủ những khả năng này, chúng ta cần hiểu dynamic memory management diễn ra như thế nào trong C.

Chương trình C thực thi bên trong runtime system, thường là môi trường do operating system cung cấp. Runtime system hỗ trợ stack, heap và các hành vi khác của chương trình.

Memory management là trọng tâm của mọi chương trình. Đôi khi runtime system quản lý memory ngầm, như khi cấp phát cho automatic variable. Khi ấy variable được cấp phát trong stack frame của function bao quanh. Với static và global variable, memory nằm trong data segment của application và được đặt toàn zero. Đây là vùng tách biệt executable code và các data khác mà runtime system quản lý.

Khả năng cấp phát rồi giải phóng memory cho phép ứng dụng quản lý memory hiệu quả hơn và linh hoạt hơn. Thay vì phải cấp phát memory đủ cho kích thước lớn nhất có thể của data structure, chỉ cần cấp phát lượng thực sự được yêu cầu.

Chẳng hạn, array có kích thước cố định trong các phiên bản C trước C99. Nếu cần chứa số element thay đổi, chẳng hạn employee record, chúng ta buộc phải khai báo array đủ lớn cho số nhân viên tối đa mà mình dự kiến sẽ cần. Nếu ước lượng thiếu, chúng ta phải compile lại ứng dụng với kích thước lớn hơn hoặc chọn cách khác. Nếu ước lượng thừa, chúng ta lãng phí dung lượng. Khả năng cấp phát memory động cũng hữu ích khi xử lý data structure có số element thay đổi, chẳng hạn linked list hoặc queue.

![image](images/ch02/fig02-01.png)

C99 giới thiệu Variable Length Arrays (VLA). Kích thước array được xác định ở runtime thay vì compile time. Tuy nhiên, sau khi tạo, array vẫn không đổi kích thước.

Những ngôn ngữ như C cũng hỗ trợ dynamic memory management, trong đó object được cấp phát memory từ heap. Việc này được làm thủ công bằng function cấp phát và giải phóng memory. Quá trình được gọi là dynamic memory management.

Chúng ta bắt đầu bằng tổng quan nhanh cách cấp phát và giải phóng memory. Tiếp theo là các allocation function cơ bản như `malloc` và `realloc`. Function `free` được bàn cùng cách dùng NULL và các vấn đề như double free.

Chương này tập trung vào dynamic memory management bằng pointer. Trước tiên, chúng ta xem xét kỹ các memory allocation function, bao gồm malloc và các function liên quan. Sau đó, chúng ta thảo luận cách dangling pointer xuất hiện và các kỹ thuật xử lý vấn đề. Phần cuối trình bày những kỹ thuật quản lý memory thay thế. Dùng pointer không đúng có thể dẫn đến hành vi không thể dự đoán. Nghĩa là chương trình có thể tạo kết quả sai, làm hỏng dữ liệu hoặc có thể kết thúc chương trình.

## Dynamic memory allocation

Các bước cơ bản để thực hiện dynamic memory allocation trong C là:

1\. Dùng function kiểu `malloc` để cấp phát memory

2\. Dùng memory này phục vụ application

3\. Giải phóng memory bằng function `free`

Dù cách tiếp cận này có một số biến thể nhỏ, đây là kỹ thuật phổ biến nhất. Trong ví dụ sau, chúng ta cấp phát memory cho một integer bằng function `malloc`. Pointer được dùng để gán 5 vào memory đã cấp phát, rồi memory được giải phóng bằng function `free`:

```
int *pi = (int*) malloc(sizeof(int));
*pi = 5;
printf("*pi: %d\n", *pi);
free(pi);
```

Khi chuỗi này được thực thi, nó hiển thị số 5. Hình 2-1 minh họa cách memory được cấp phát ngay trước khi function `free` thực thi. Trong chương này, trừ khi được lưu ý khác, chúng ta giả định code ví dụ nằm trong function `main`.

![image](images/ch02/fig02-02.png)

Hình 2-1. Cấp phát memory cho integer

Argument duy nhất của function `malloc` chỉ số byte cần cấp phát. Nếu thành công, nó trả pointer đến memory cấp phát từ heap; nếu thất bại, trả null pointer. Kiểm tra tính hợp lệ của pointer đã cấp phát được bàn trong “Dùng function malloc”. Operator `sizeof` làm application portable hơn và xác định đúng số byte cần cấp phát trên host system.

Ví dụ này cố cấp phát đủ memory cho integer. Nếu giả định kích thước là 4, có thể dùng:

```
int *pi = (int*) malloc(4));
```

Tuy nhiên, kích thước integer có thể thay đổi tùy memory model được dùng. Một cách portable là sử dụng operator `sizeof`. Nó trả về kích thước chính xác bất kể chương trình đang thực thi ở đâu.

![image](images/ch02/fig02-01.png)

Sau đây minh họa lỗi phổ biến liên quan dereference operator:

```
int *pi;
*pi = (int*) malloc(sizeof(int));
```

Vấn đề nằm ở vế trái của assignment operation. Chúng ta đang dereference pointer. Điều này sẽ gán address do `malloc` trả về vào address được lưu trong `pi`. Nếu đây là lần đầu thực hiện assignment cho pointer, address trong pointer có lẽ không hợp lệ. Cách tiếp cận đúng được trình bày dưới đây:

```
pi = (int*) malloc(sizeof(int));
```

Không nên dùng dereference operator trong trường hợp này.

Function `free`, sẽ được bàn kỹ sau, phối hợp với `malloc` để giải phóng memory khi không còn cần.

![image](images/ch02/fig02-01.png)

Mỗi lần function `malloc`, hoặc function tương tự, được gọi, phải có một lời gọi tương ứng đến function `free` khi ứng dụng dùng xong memory đó để tránh memory leak.

Sau khi memory được giải phóng, không nên truy cập lại. Thông thường, bạn không cố ý truy cập nó sau khi giải phóng. Tuy nhiên, điều này có thể vô tình xảy ra, như minh họa trong mục “Dangling pointer” ở trang 51. Khi đó, hệ thống hoạt động theo cách implementation-dependent. Một cách làm phổ biến là luôn gán `NULL` cho pointer đã được giải phóng, như thảo luận trong “Gán NULL cho pointer đã giải phóng” ở trang 48.

Khi memory được cấp phát, thông tin bổ sung được lưu như một phần của data structure do heap manager duy trì. Trong số những thông tin đó có kích thước block, và chúng thường được đặt sát ngay block đã cấp phát. Nếu ứng dụng ghi ra ngoài block memory này, data structure có thể bị hỏng. Điều này có thể gây hành vi chương trình kỳ lạ hoặc làm hỏng heap, như chúng ta sẽ thấy trong Chương 7.

Hãy xem chuỗi code sau. Memory được cấp phát cho một string, cho phép chứa tối đa năm ký tự cùng byte dành cho ký tự kết thúc `NUL`. Loop `for` ghi số 0 vào từng vị trí nhưng không dừng sau khi ghi sáu byte. Điều kiện kết thúc của statement `for` yêu cầu nó ghi tám byte. Những số 0 được ghi là binary zero, không phải giá trị ASCII của ký tự 0:

```
char *pc = (char*) malloc(6);
for(int i=0; i<8; i++) {
    *pc[i] = 0;
}
```

Trong Hình 2-2, memory bổ sung đã được cấp phát ở cuối string six-byte. Đây là memory thêm mà heap manager dùng để theo dõi việc cấp phát. Nếu ghi vượt quá cuối string, memory bổ sung này sẽ bị hỏng. Trong ví dụ, memory bổ sung được vẽ sau string. Tuy nhiên, vị trí thực và nội dung ban đầu của nó phụ thuộc vào compiler.

![image](images/ch02/fig02-03.png)

Hình 2-2. Memory bổ sung do heap manager sử dụng

### Memory leak

Memory leak xảy ra khi memory đã cấp phát không bao giờ dùng lại nhưng không được giải phóng. Có thể xảy ra khi:

- Address của memory bị mất

- Không gọi function `free` dù đáng ra phải gọi (đôi khi gọi hidden leak)

Một vấn đề của memory leak là memory không thể được thu hồi và sử dụng về sau. Lượng memory mà heap manager có thể dùng bị giảm. Nếu memory liên tục được cấp phát rồi bị mất, chương trình có thể kết thúc khi cần thêm memory nhưng `malloc` không thể cấp vì đã hết memory. Trong trường hợp nghiêm trọng, operating system có thể crash.

Ví dụ đơn giản sau minh họa điều này:

```
char *chunk;
while (1) {
    chunk = (char*) malloc(1000000);
    printf("Allocating\n");
}
```

Variable `chunk` được gán memory từ heap. Tuy nhiên, memory này không được giải phóng trước khi block khác được gán cho nó. Cuối cùng application hết memory và kết thúc bất thường. Ít nhất thì memory cũng không được sử dụng hiệu quả.

#### Làm mất address

Một ví dụ về mất address của memory được minh họa trong chuỗi code sau, nơi `pi` được gán lại một address mới. Address của lần cấp phát đầu tiên bị mất khi `pi` được cấp memory lần thứ hai.

```
int *pi = (int*) malloc(sizeof(int));
*pi = 5;
...
pi = (int*) malloc(sizeof(int));
```

Điều này được minh họa trong Hình 2-3, nơi các hình trước và sau tương ứng với trạng thái chương trình trước và sau lần thực thi `malloc` thứ hai. Memory tại address 500 chưa được giải phóng, và chương trình không còn giữ address này ở bất kỳ đâu.

![image](images/ch02/fig02-04.png)

Hình 2-3. Làm mất address

Ví dụ khác cấp phát memory cho string, khởi tạo rồi hiển thị từng character:

```
char *name = (char*)malloc(strlen("Susan")+1);
strcpy(name,"Susan");
while(*name != 0) {
    printf("%c",*name);
    name++;
}
```

Tuy nhiên, nó tăng `name` thêm 1 sau mỗi lần lặp. Cuối cùng, `name` còn trỏ đến ký tự kết thúc `NUL` của string, như minh họa trong Hình 2-4. Address bắt đầu của memory đã cấp phát bị mất.

![image](images/ch02/fig02-05.png)

Hình 2-4. Làm mất address của memory cấp phát động

#### Hidden memory leak

Memory leak cũng có thể xảy ra khi chương trình nên giải phóng memory nhưng không làm. Memory leak ẩn xuất hiện khi một object được giữ trong heap dù không còn cần thiết. Đây thường là kết quả của việc lập trình viên bỏ sót. Vấn đề chính là object đang dùng memory không còn cần và lẽ ra phải được trả lại heap. Trong trường hợp xấu nhất, heap manager có thể không cấp được memory khi được yêu cầu, có thể buộc chương trình kết thúc. Tốt nhất thì chúng ta cũng đang giữ memory không cần thiết.

Memory leak cũng có thể xảy ra khi giải phóng structure tạo bằng keyword `struct`. Nếu structure chứa pointer đến memory cấp phát động, có thể phải giải phóng các pointer này trước khi giải phóng structure. Chương 6 có ví dụ.

## Dynamic memory allocation function

Có một số memory allocation function để quản lý dynamic memory. Dù những function có sẵn có thể phụ thuộc hệ thống, các function sau được tìm thấy trên phần lớn hệ thống trong header file stdlib.h:

- `malloc`

- `realloc`

- `calloc`

- `free`

Các function được tóm tắt trong Bảng 2-1.

Bảng 2-1. Dynamic memory allocation function

| Function | Mô tả |
|---|---|
| `malloc` | Cấp phát memory từ heap |
| `realloc` | Cấp phát lại lượng memory lớn hoặc nhỏ hơn dựa trên block đã cấp phát |
| `calloc` | Cấp phát memory từ heap và đặt toàn zero |
| `free` | Trả block memory về heap |

Dynamic memory được cấp phát từ heap. Với các lời gọi cấp phát memory liên tiếp, không có bảo đảm về thứ tự hoặc tính liên tục của memory được cấp. Tuy nhiên, memory sẽ được align theo data type của pointer. Chẳng hạn, một integer four-byte sẽ được cấp phát tại ranh giới address chia hết cho bốn. Address do heap manager trả về chứa address của byte thấp nhất.

Trong Hình 2-3, function `malloc` cấp bốn byte tại address 500. Lần dùng function `malloc` thứ hai cấp memory tại address 600. Cả hai đều nằm trên ranh giới address four-byte, và chúng không cấp phát memory từ các vị trí liên tiếp.

### Dùng function malloc

Function `malloc` cấp phát một block memory từ heap. Số byte được cấp phát do argument duy nhất của nó chỉ định. Return type là pointer đến void. Nếu không có memory, `NULL` được trả về. Function không xóa hoặc sửa memory theo cách khác, nên nội dung memory phải được xem như chứa dữ liệu rác. Prototype của function như sau:

```
void*  malloc(size_t);
```

Function có một argument duy nhất thuộc type `size_t`. Type này được thảo luận trong Chương 1. Bạn cần cẩn thận khi truyền variable cho function này, vì vấn đề có thể phát sinh nếu argument là số âm. Trên một số hệ thống, giá trị NULL được trả về nếu argument âm.

Khi `malloc` được dùng với argument bằng 0, hành vi của nó là implementation-specific. Nó có thể trả về pointer đến `NULL` hoặc pointer đến một vùng được cấp phát 0 byte. Nếu function `malloc` được dùng với argument `NULL`, thông thường nó tạo cảnh báo và thực thi với kết quả trả về 0 byte.

Sau đây là cách dùng điển hình của `malloc`:

```
int *pi = (int*) malloc(sizeof(int));
```

Khi function `malloc` thực thi, các bước sau diễn ra:

1\. Memory được cấp phát từ heap

2\. Memory không được sửa hay xóa

3\. Address của byte đầu được trả về

![image](images/ch02/fig02-01.png)

Vì `malloc` có thể trả NULL nếu không cấp phát được memory, nên kiểm tra NULL trước khi dùng pointer như sau:

```
int *pi = (int*) malloc(sizeof(int));
if(pi != NULL) {
   // Pointer should be good
} else {
   // Bad pointer
}
```

#### Cast hay không cast

Trước khi pointer đến void được đưa vào C, cần có cast tường minh với `malloc` để ngăn cảnh báo khi thực hiện assignment giữa các pointer type không tương thích. Vì pointer đến void có thể được gán cho bất kỳ pointer type nào khác, cast tường minh không còn bắt buộc. Một số developer xem cast tường minh là cách làm tốt vì:

- Nó thể hiện ý định dùng function `malloc`

- Nó làm code tương thích C++ (hoặc C compiler đời trước), vốn yêu cầu cast tường minh

Dùng cast sẽ có vấn đề nếu quên include header file của `malloc`. Compiler có thể phát warning. Mặc định C giả định function trả integer. Nếu không include prototype của `malloc`, compiler sẽ phàn nàn khi thử gán integer cho pointer.

#### Không cấp phát memory

Nếu khai báo pointer nhưng không cấp phát memory tại address mà nó trỏ đến trước khi sử dụng, memory đó thường chứa dữ liệu rác, thường dẫn đến một memory reference không hợp lệ. Hãy xem chuỗi code sau:

```
int *pi;
...
printf("%d\n",*pi);
```

Memory allocation được thể hiện trong Hình 2-5. Chương 7 bàn kỹ vấn đề này.

![image](images/ch02/fig02-06.png)

Hình 2-5. Không cấp phát memory

Khi chạy, điều này có thể gây runtime exception. Vấn đề này phổ biến với string, như sau:

```
char *name;
printf("Enter a name: ");
scanf("%s",name);
```

Dù có vẻ đoạn này sẽ thực thi đúng, chúng ta đang dùng memory được `name` tham chiếu. Tuy nhiên, memory này chưa được cấp phát. Có thể minh họa vấn đề bằng hình ảnh bằng cách đổi variable `pi` trong Hình 2-5 thành `name`.

#### Dùng sai kích thước cho function malloc

Function `malloc` cấp phát số byte do argument chỉ định. Bạn cần cẩn thận để cấp đúng số byte khi dùng function. Chẳng hạn, nếu muốn cấp storage cho 10 double, chúng ta cần cấp 80 byte. Điều này được thực hiện như dưới đây:

```
double *pd = (double*)malloc(NUMBER_OF_DOUBLES * sizeof(double));
```

![image](images/ch02/fig02-01.png)

Dùng operator `sizeof` khi chỉ số byte cần cấp cho data type bất cứ khi nào có thể.

Trong ví dụ sau, chúng ta thử cấp phát memory cho 10 double:

```
const int NUMBER_OF_DOUBLES = 10;
double *pd = (double*)malloc(NUMBER_OF_DOUBLES);
```

Tuy nhiên, code chỉ cấp 10 byte.

#### Xác định lượng memory đã cấp phát

Không có cách tiêu chuẩn để xác định tổng lượng memory do heap cấp phát. Tuy nhiên, một số compiler cung cấp extension cho mục đích này. Ngoài ra, không có cách tiêu chuẩn để xác định kích thước một memory block do heap manager cấp phát.

Chẳng hạn, nếu cấp 64 byte cho một string, heap manager sẽ cấp thêm memory để quản lý block này. Tổng kích thước được cấp phát, tính cả lượng mà heap manager dùng, là tổng của hai lượng đó. Điều này được minh họa trong Hình 2-2.

Kích thước tối đa có thể cấp phát bằng `malloc` phụ thuộc hệ thống. Có vẻ kích thước này phải bị giới hạn bởi `size_t`. Tuy nhiên, giới hạn có thể đến từ lượng physical memory hiện có và các constraint khác của operating system.

Khi `malloc` thực thi, nó phải cấp lượng memory được yêu cầu rồi trả về address của memory đó. Điều gì xảy ra nếu operating system bên dưới dùng “lazy initialization”, không thực sự cấp memory cho đến khi memory được truy cập? Lúc này có thể phát sinh vấn đề nếu không đủ memory để cấp phát. Câu trả lời phụ thuộc runtime system và operating system. Developer thông thường thường không cần xử lý câu hỏi này vì những cơ chế khởi tạo như vậy khá hiếm.

#### Dùng malloc với static và global pointer

Bạn không thể dùng function call khi khởi tạo static variable hoặc global variable. Trong chuỗi code sau, chúng ta khai báo một static variable rồi cố khởi tạo nó bằng `malloc`:

```
static int *pi = malloc(sizeof(int));
```

Điều này tạo một thông báo lỗi compile-time. Điều tương tự xảy ra với global variable, nhưng với static variable có thể tránh bằng một statement riêng để cấp memory cho variable như dưới đây. Chúng ta không thể dùng assignment statement riêng với global variable vì global variable được khai báo ngoài function, còn executable code như assignment statement phải nằm bên trong function:

```
static int *pi;
pi = malloc(sizeof(int));
```

![image](images/ch02/fig02-01.png)

Từ góc nhìn của compiler, có sự khác nhau giữa việc dùng initialization operator = và dùng assignment operator =.

### Dùng function calloc

Function `calloc` cấp phát đồng thời xóa memory. Prototype như sau:

```
void *calloc(size_t numElements, size_t elementSize);
```

![image](images/ch02/fig02-01.png)

Xóa memory nghĩa là đặt toàn bộ nội dung thành binary zero.

Function sẽ cấp lượng memory được xác định bằng tích của các parameter `numElements` và `elementSize`. Nó trả về pointer đến byte đầu tiên của memory. Nếu function không thể cấp memory, `NULL` được trả về. Ban đầu, function này được dùng để hỗ trợ cấp memory cho array.

Nếu `numElements` hoặc `elementSize` bằng zero, có thể trả null pointer. Nếu `calloc` không cấp được memory, trả null pointer và đặt global variable `errno` thành `ENOMEM` (hết memory). Đây là error code `POSIX`, có thể không có trên mọi hệ thống.

Xét ví dụ sau, `pi` được cấp tổng cộng 20 byte, tất cả chứa zero:

```
int *pi = calloc(5,sizeof(int));
```

Thay vì dùng `calloc`, có thể dùng function `malloc` cùng function `memset` để đạt kết quả tương tự, như minh họa dưới đây:

```
int *pi = malloc(5 * sizeof(int));
memset(pi, 0, 5* sizeof(int));
```

![image](images/ch02/fig02-01.png)

Function `memset` điền một giá trị vào block. Argument đầu là pointer đến buffer cần điền. Argument thứ hai là giá trị dùng để điền buffer, và argument cuối là số byte cần được đặt.

Dùng `calloc` khi cần đặt memory toàn zero. Tuy nhiên, chạy `calloc` có thể lâu hơn `malloc`.

![image](images/ch02/fig02-01.png)

Function `cfree` không còn cần. Thời C ban đầu, nó dùng giải phóng memory do `calloc` cấp.

### Dùng function realloc

Đôi khi cần tăng hoặc giảm lượng memory được cấp cho một pointer. Điều này đặc biệt hữu ích khi cần array có kích thước biến đổi, như sẽ minh họa trong Chương 4. Function `realloc` sẽ cấp phát lại memory. Prototype như sau:

```
void *realloc(void *ptr, size_t size);
```

Function `realloc` trả về pointer đến một block memory. Function nhận hai argument. Argument đầu là pointer đến block ban đầu, còn argument thứ hai là kích thước yêu cầu. Kích thước block được cấp lại sẽ khác với kích thước block mà argument đầu tham chiếu. Return value là pointer đến memory được cấp phát lại.

Kích thước yêu cầu có thể nhỏ hơn hoặc lớn hơn lượng hiện đã cấp phát. Nếu nhỏ hơn, memory dư được trả về heap. Không có bảo đảm memory dư sẽ được xóa. Nếu lớn hơn, memory sẽ được cấp từ vùng ngay sau allocation hiện tại nếu có thể. Nếu không, memory được cấp từ một vùng khác của heap và memory cũ được copy sang vùng mới.

Nếu kích thước bằng 0 và pointer không phải null, pointer sẽ được free. Nếu không thể cấp storage, block memory ban đầu được giữ lại và không thay đổi. Tuy nhiên, pointer được trả về là null pointer và `errno` được đặt thành `ENOMEM`.

Hành vi function được tóm tắt trong Bảng 2-2.

Bảng 2-2. Hành vi function realloc

| Parameter thứ nhất | Parameter thứ hai | Hành vi |
|---|---|---|
| null | NA | Giống `malloc` |
| Not null | 0 | Block ban đầu được giải phóng |
| Not null | Nhỏ hơn kích thước block ban đầu | Cấp block nhỏ hơn bằng block hiện tại |
| Not null | Lớn hơn kích thước block ban đầu | Cấp block lớn hơn tại vị trí hiện tại hoặc vùng heap khác |

Trong ví dụ sau, chúng ta dùng hai variable để cấp memory cho một string. Ban đầu, chúng ta cấp 16 byte nhưng chỉ dùng 13 byte đầu: 12 chữ số hexadecimal và ký tự kết thúc null (0):

```
char *string1;
char *string2;
string1 = (char*) malloc(16);
strcpy(string1, "0123456789AB");
```

Tiếp theo dùng `realloc` chỉ định vùng memory nhỏ hơn. Sau đó hiển thị address và nội dung của hai variable:

```
string2 = realloc(string1, 8);
printf("string1  Value: %p [%s]\n", string1, string1);
printf("string2  Value: %p [%s]\n", string2, string2);
```

Output như sau:

```
string1  Value: 0x500 [0123456789AB]
string2  Value: 0x500 [0123456789AB]
```

Memory allocation được minh họa trong Hình 2-6.

![image](images/ch02/fig02-07.png)

Hình 2-6. Ví dụ realloc

Heap manager có thể tái sử dụng block ban đầu và không sửa nội dung của nó. Tuy nhiên, chương trình tiếp tục dùng nhiều hơn tám byte được yêu cầu. Nghĩa là chúng ta không thay đổi string để vừa block eight-byte. Trong ví dụ này, lẽ ra cần điều chỉnh độ dài string để vừa tám byte được cấp lại. Cách đơn giản nhất là gán một ký tự `NUL` cho address 507. Dùng nhiều storage hơn lượng được cấp không phải cách làm tốt và nên tránh, như trình bày chi tiết trong Chương 7.

Trong ví dụ tiếp theo, chúng ta cấp phát lại để có thêm memory:

```
string1 = (char*) malloc(16);
strcpy(string1, "0123456789AB");
string2 = realloc(string1, 64);
printf("string1  Value: %p [%s]\n", string1, string1);
printf("string2  Value: %p [%s]\n", string2, string2);
```

Khi chạy, có thể nhận kết quả tương tự:

```
string1  Value: 0x500 [0123456789AB]
string2  Value: 0x600 [0123456789AB]
```

Ở đây, `realloc` phải cấp block memory mới. Hình 2-7 minh họa allocation.

![image](images/ch02/fig02-08.png)

Hình 2-7. Cấp thêm memory

### Function alloca và Variable Length Array

Function `alloca`, hay `malloca` của Microsoft, cấp memory bằng cách đặt nó trong stack frame của function. Khi function trả về, memory tự động được giải phóng. Function này có thể khó triển khai nếu runtime system bên dưới không phải stack-based. Vì vậy, đây là function không tiêu chuẩn và nên tránh nếu ứng dụng cần portable.

Trong C99, Variable Length Array (VLA) được đưa vào, cho phép khai báo và tạo array trong function với kích thước dựa trên một variable. Trong ví dụ sau, một array `char` được cấp phát để dùng trong function:

```
void compute(int size) {
    char* buffer[size];
    ...
}
```

Điều này có nghĩa việc cấp memory được thực hiện tại runtime và memory được cấp như một phần của stack frame. Ngoài ra, khi operator `sizeof` được dùng với array, nó được thực thi tại runtime thay vì compile time.

Điều này gây một chi phí runtime nhỏ. Ngoài ra, khi function thoát, memory được giải phóng về mặt hiệu dụng. Vì chúng ta không dùng function kiểu `malloc` để tạo nó, không nên dùng function `free` để giải phóng. Function cũng không nên trả về pointer đến memory này. Vấn đề được trình bày trong Chương 5.

![image](images/ch02/fig02-01.png)

VLA không thay đổi kích thước. Kích thước của chúng được cố định khi cấp phát. Nếu cần array có kích thước thực sự thay đổi, bạn cần cách tiếp cận như dùng function `realloc`, được thảo luận trong mục “Dùng function realloc” ở trang 44.

## Giải phóng memory bằng function free

Với dynamic memory allocation, lập trình viên có thể trả lại memory khi không còn dùng, nhờ đó giải phóng nó cho mục đích khác. Thông thường, việc này được thực hiện bằng function `free`, có prototype dưới đây:

```
void free(void *ptr);
```

Pointer argument phải chứa address của memory được cấp bằng một function kiểu `malloc`. Memory này được trả về heap. Dù pointer vẫn có thể trỏ đến vùng đó, hãy luôn giả định nó trỏ đến dữ liệu rác. Vùng này có thể được cấp lại về sau và chứa dữ liệu khác.

Ví dụ đơn giản sau cấp memory cho `pi` rồi cuối cùng giải phóng:

```
int *pi = (int*) malloc(sizeof(int));
...
free(pi);
```

Hình 2-8 minh họa việc cấp phát memory ngay trước và ngay sau khi function `free` thực thi. Ô nét đứt tại address 500 cho biết memory đã được giải phóng nhưng vẫn có thể chứa giá trị của nó. Variable `pi` vẫn chứa address 500. Đây được gọi là dangling pointer và được thảo luận chi tiết trong mục “Dangling pointer” ở trang 51.

![image](images/ch02/fig02-09.png)

Hình 2-8. Giải phóng memory bằng free

Nếu function `free` nhận một null pointer, thông thường nó không làm gì. Nếu pointer được truyền vào đã được cấp phát bằng thứ khác ngoài function kiểu `malloc`, hành vi của function là undefined. Trong ví dụ sau, `pi` được gán address của `num`. Tuy nhiên, đây không phải heap address hợp lệ:

```
int num;
int *pi = &num;
free(pi);  // Undefined behavior
```

![image](images/ch02/fig02-01.png)

Quản lý cấp phát/giải phóng memory ở cùng cấp. Ví dụ, nếu cấp phát cho pointer trong function, hãy giải phóng trong chính function đó.

### Gán NULL cho pointer đã giải phóng

Pointer có thể gây vấn đề ngay cả sau khi được giải phóng. Nếu thử dereference pointer đã giải phóng, hành vi là undefined. Vì vậy, một số programmer gán tường minh `NULL` để đánh dấu pointer không hợp lệ. Dùng tiếp pointer như vậy sẽ gây runtime exception.

Sau đây là ví dụ cách này:

```
int *pi = (int*) malloc(sizeof(int));
...
free(pi);
pi = NULL;
```

Memory allocation được minh họa trong Hình 2-9.

![image](images/ch02/fig02-10.png)

Hình 2-9. Gán NULL sau khi dùng free

Kỹ thuật này cố xử lý những vấn đề như dangling pointer. Tuy nhiên, tốt hơn nên dành thời gian xử lý các điều kiện gây ra vấn đề thay vì bắt chúng một cách thô sơ bằng null pointer. Ngoài ra, bạn không thể gán `NULL` cho constant pointer ngoài lúc khởi tạo nó.

### Double free

Thuật ngữ double free chỉ việc cố giải phóng một block memory hai lần. Ví dụ đơn giản:

```
int *pi = (int*) malloc(sizeof(int));
*pi = 5;
free(pi);
 ...
free(pi);
```

Việc thực thi function `free` thứ hai sẽ gây runtime exception. Một ví dụ ít rõ hơn dùng hai pointer cùng trỏ đến một memory block. Như dưới đây, runtime exception tương tự xảy ra khi chúng ta vô tình cố free cùng memory lần thứ hai:

```
p1 = (int*) malloc(sizeof(int));
int *p2 = p1;
free(p1);
...
free(p2);
```

Memory allocation này được minh họa trong Hình 2-10.

![image](images/ch02/fig02-01.png)

Hai pointer tham chiếu cùng vị trí được gọi là aliasing. Chương 8 bàn khái niệm này.

![image](images/ch02/fig02-11.png)

Hình 2-10. Double free

Đáng tiếc là heap manager khó xác định một block đã được giải phóng hay chưa. Vì vậy, chúng không cố phát hiện việc cùng memory bị free hai lần. Điều này thường làm hỏng heap và kết thúc chương trình. Ngay cả khi chương trình không kết thúc, nó vẫn thể hiện logic giải quyết vấn đề đáng ngờ. Không có lý do gì để free cùng memory hai lần.

Có đề xuất rằng function `free` nên gán `NULL` hoặc một giá trị đặc biệt khác cho argument khi trả về. Tuy nhiên, vì pointer được truyền by value, function `free` không thể gán tường minh `NULL` cho pointer. Điều này được giải thích kỹ hơn trong mục “Truyền pointer đến pointer” ở trang 68.

### Heap và system memory

Heap thường dùng các operating system function để quản lý memory. Kích thước heap có thể được cố định khi chương trình được tạo hoặc được phép tăng lên. Tuy nhiên, heap manager không nhất thiết trả memory về operating system khi function `free` được gọi. Memory được giải phóng chỉ đơn giản trở nên sẵn có cho ứng dụng dùng tiếp. Vì vậy, khi chương trình cấp phát rồi giải phóng memory, việc giải phóng thường không được phản ánh trong mức sử dụng memory của ứng dụng từ góc nhìn operating system.

### Giải phóng memory khi chương trình kết thúc

Operating system chịu trách nhiệm duy trì tài nguyên của ứng dụng, bao gồm memory. Khi ứng dụng kết thúc, operating system có trách nhiệm phân bổ lại memory này cho các ứng dụng khác. Trạng thái memory của ứng dụng đã kết thúc, bị hỏng hay không, không phải vấn đề. Thực tế, một lý do ứng dụng có thể kết thúc là memory bị hỏng. Khi chương trình kết thúc bất thường, việc dọn dẹp có thể không khả thi. Vì vậy, không có lý do để free memory đã cấp trước khi ứng dụng kết thúc.

Tuy vậy, có thể có các lý do khác để free memory này. Lập trình viên có trách nhiệm có thể muốn free memory vì chất lượng. Free memory sau khi không còn cần luôn là thói quen tốt, ngay cả khi ứng dụng đang kết thúc. Nếu dùng công cụ phát hiện memory leak hoặc vấn đề tương tự, giải phóng memory sẽ làm sạch output của công cụ. Trong một số operating system ít phức tạp hơn, operating system có thể không tự thu hồi memory và chương trình có thể phải thu hồi trước khi kết thúc. Ngoài ra, phiên bản ứng dụng sau có thể thêm code gần cuối chương trình. Nếu memory trước đó chưa được free, vấn đề có thể phát sinh.

Vì vậy, bảo đảm mọi memory được giải phóng trước khi kết thúc:

- Có thể gây phiền phức nhiều hơn giá trị mang lại

- Có thể tốn thời gian và phức tạp khi giải phóng structure phức tạp

- Có thể tăng kích thước application

- Làm thời gian chạy dài hơn

- Tạo thêm cơ hội mắc lỗi lập trình

Có nên giải phóng memory trước khi kết thúc hay không là application-specific.

## Dangling pointer

Nếu pointer vẫn tham chiếu memory ban đầu sau khi memory được giải phóng, nó được gọi là dangling pointer. Pointer không trỏ đến một object hợp lệ. Điều này đôi khi được gọi là premature free.

Việc sử dụng dangling pointer có thể gây ra nhiều loại vấn đề khác nhau, bao gồm:

- Hành vi khó dự đoán nếu truy cập memory

- Segmentation fault khi memory không còn truy cập được

- Nguy cơ security tiềm tàng

Các vấn đề này có thể xảy ra khi:

- Truy cập memory sau khi giải phóng

- Trả pointer đến automatic variable của function call trước (bàn trong “Pointer đến local data” trang 66)

### Ví dụ dangling pointer

Dưới đây là ví dụ đơn giản: chúng ta cấp phát memory cho integer bằng function `malloc`. Tiếp theo, memory được giải phóng bằng function `free`:

```
int *pi = (int*) malloc(sizeof(int));
*pi = 5;
printf("*pi: %d\n", *pi);
free(pi);
```

Variable `pi` vẫn chứa address của integer. Tuy nhiên, heap manager có thể tái sử dụng memory này và nó có thể chứa dữ liệu khác integer. Hình 2-11 minh họa trạng thái chương trình ngay trước và sau khi function `free` được thực thi. Variable `pi` được giả định thuộc function `main` và nằm tại address 100. Memory được cấp bằng `malloc` nằm tại address 500.

Khi function `free` được thực thi, memory tại address 500 đã được giải phóng và không nên sử dụng. Tuy nhiên, phần lớn runtime system không ngăn việc truy cập hoặc sửa đổi về sau. Chúng ta vẫn có thể thử ghi vào vị trí đó như dưới đây. Kết quả của hành động này không thể dự đoán.

```
free(pi);
*pi = 10;
```

![image](images/ch02/fig02-12.png)

Hình 2-11. Dangling pointer

Ví dụ khó phát hiện hơn là nhiều pointer tham chiếu cùng vùng memory và một pointer được giải phóng. Như sau, `p1` và `p2` cùng tham chiếu một vùng, gọi là pointer aliasing. Tuy nhiên `p1` được giải phóng:

```
int *p1 = (int*) malloc(sizeof(int));
*p1 = 5;
...
int *p2;
p2 = p1;
...
free(p1);
...
*p2 = 10;   // Dangling pointer
```

Hình 2-12 minh họa allocation, ô nét chấm biểu diễn memory đã giải phóng.

![image](images/ch02/fig02-13.png)

Hình 2-12. Dangling pointer với aliased pointer

Một vấn đề khó nhận thấy có thể xảy ra khi dùng block statement như dưới đây. Ở đây, `pi` được gán address của `tmp`. Variable `pi` có thể là global variable hoặc local variable. Tuy nhiên, khi block chứa `tmp` được pop khỏi program stack, address không còn hợp lệ:

```
int *pi;
...
{
   int tmp = 5;
   pi = &tmp;
}
// pi is now a dangling pointer
foo();
```

Phần lớn compiler xem block statement như một stack frame. Variable `tmp` được cấp trên stack frame và sau đó bị pop khỏi stack khi thoát block statement. Pointer `pi` lúc này còn trỏ đến một vùng memory có thể cuối cùng bị activation record khác ghi đè, chẳng hạn function `foo`. Tình trạng này được minh họa trong Hình 2-13.

![image](images/ch02/fig02-14.png)

Hình 2-13. Vấn đề block statement

### Xử lý dangling pointer

Đôi khi, việc debug và giải quyết những vấn đề pointer-induced có thể khó khăn. Có một số cách tiếp cận để xử lý dangling pointer, bao gồm:

- Đặt pointer thành `NULL` sau khi free. Việc sử dụng nó sau đó sẽ kết thúc ứng dụng. Tuy nhiên, vấn đề vẫn có thể tồn tại nếu có nhiều bản sao pointer. Lý do là assignment chỉ ảnh hưởng một bản sao, như minh họa trong mục “Double free” ở trang 48.

- Viết function đặc biệt thay `free` (xem “Tự viết function free” trang 70).

- Một số hệ thống (runtime/debugger) ghi đè data khi giải phóng (ví dụ 0xDEADBEEF - Visual Studio dùng 0xCC, 0xCD hoặc 0xDD tùy thứ được giải phóng). Dù không throw exception, khi thấy memory chứa các giá trị này ngoài dự kiến, programmer biết có thể chương trình đang truy cập memory đã giải phóng.

- Dùng tool third-party phát hiện dangling pointer và vấn đề khác.

Hiển thị pointer value có thể hữu ích khi debug dangling pointer, nhưng bạn cần cẩn thận với cách hiển thị. Chúng ta đã thảo luận cách hiển thị pointer value trong “Hiển thị giá trị pointer” ở trang 9. Hãy bảo đảm hiển thị nhất quán để tránh nhầm lẫn khi so sánh pointer value. Macro `assert` cũng có thể hữu ích, như minh họa trong “Xử lý pointer chưa khởi tạo” ở trang 162.

### Hỗ trợ phát hiện memory leak trong debug version

Microsoft cung cấp các kỹ thuật xử lý việc ghi đè memory được cấp động và memory leak. Cách tiếp cận này dùng các kỹ thuật quản lý memory đặc biệt trong bản debug của chương trình để:

- Kiểm tra tính toàn vẹn heap

- Kiểm tra memory leak

- Mô phỏng tình huống heap ít memory

Microsoft thực hiện điều này bằng một data structure đặc biệt để quản lý cấp phát memory. Structure này duy trì debug information, chẳng hạn filename và số dòng nơi `malloc` được gọi. Ngoài ra, các buffer được cấp trước và sau memory thực để phát hiện việc ghi đè memory thực. Có thể tìm thêm thông tin về kỹ thuật này tại Microsoft Developer Network.

Mudflap Libraries cung cấp khả năng tương tự cho GCC compiler. Runtime library của nó hỗ trợ phát hiện memory leak cùng những vấn đề khác. Việc phát hiện được thực hiện bằng cách instrument các thao tác dereference pointer.

## Công nghệ dynamic memory allocation

Đến đây, chúng ta đã nói về việc heap manager cấp phát và giải phóng memory. Tuy nhiên, cách triển khai công nghệ này có thể khác nhau tùy compiler. Phần lớn heap manager dùng heap hoặc data segment làm nguồn memory. Tuy nhiên, cách này chịu fragmentation và có thể va chạm với program stack. Dù vậy, đây là cách triển khai heap phổ biến nhất.

Heap manager phải xử lý nhiều vấn đề, như cấp heap theo process và/hoặc thread, và bảo vệ heap khỏi vi phạm security.

Có nhiều heap manager, gồm malloc của OpenBSD, malloc của Hoard và TCMalloc do Google phát triển. Allocator của GNU C library dựa trên allocator general-purpose dlmalloc. Nó cung cấp công cụ debugging và hỗ trợ theo dõi memory leak. Logging feature của dlmalloc theo dõi memory usage, memory transaction và những hoạt động khác.

Kỹ thuật thủ công quản lý memory cho structure được trình bày trong “Tránh overhead malloc/free” trang 139.

### Garbage collection trong C

Các function `malloc` và `free` cung cấp cách cấp phát và giải phóng memory thủ công. Tuy nhiên, có nhiều vấn đề khi dùng quản lý memory thủ công trong C, chẳng hạn hiệu năng, đạt locality of reference tốt, vấn đề threading và dọn memory hợp lý.

Một số kỹ thuật không tiêu chuẩn có thể xử lý một phần những vấn đề này, và phần này tìm hiểu một số kỹ thuật đó. Đặc điểm chính là tự động giải phóng memory. Khi memory không còn cần, nó được thu gom và trở nên sẵn có để dùng sau trong chương trình. Memory được giải phóng được gọi là garbage. Vì vậy, thuật ngữ garbage collection chỉ quá trình xử lý memory này.

Garbage collection hữu ích vì nhiều lý do, gồm:

- Giải phóng programmer khỏi việc quyết định lúc nào deallocate memory

- Cho phép programmer tập trung vào bài toán application

Một lựa chọn thay manual memory management là Boehm-Weiser Collector, nhưng không thuộc ngôn ngữ.

### Resource Acquisition Is Initialization

Resource Acquisition Is Initialization (RAII) là kỹ thuật do Bjarne Stroustrup phát minh. Nó xử lý việc cấp phát và giải phóng resource trong C++. Kỹ thuật hữu ích để bảo đảm cấp phát rồi giải phóng resource khi có exception. Resource đã cấp cuối cùng sẽ được giải phóng.

Có một số cách tiếp cận để dùng RAII trong C. GNU compiler cung cấp một extension không tiêu chuẩn để hỗ trợ điều này. Chúng ta sẽ minh họa extension bằng cách cho thấy memory được cấp rồi free trong function như thế nào. Khi variable ra khỏi scope, quá trình giải phóng tự động xảy ra.

GNU extension dùng macro `RAII_VARIABLE`. Nó khai báo variable và liên kết với variable:

- Một type

- Một function thực thi khi variable được tạo

- Một function thực thi khi variable ra khỏi scope

Macro như sau:

```
#define RAII_VARIABLE(vartype,varname,initval,dtor) \
    void _dtor_ ## varname (vartype * v) { dtor(*v); } \
    vartype varname __attribute__((cleanup(_dtor_ ## varname))) = (initval)
```

Trong ví dụ sau, chúng ta khai báo variable tên `name` là pointer đến `char`. Khi nó được tạo, function `malloc` được thực thi và cấp cho nó 32 byte. Khi function kết thúc, `name` ra khỏi scope và function `free` được thực thi:

```
void raiiExample() {
    RAII_VARIABLE(char*, name, (char*)malloc(32), free);
    strcpy(name,"RAII Example");
    printf("%s\n",name);
}
```

Khi chạy function, string “RAII\_Example” được hiển thị.

Có thể đạt kết quả tương tự không cần GNU extension.

### Dùng exception handler

Một cách khác để xử lý việc giải phóng memory là dùng exception handling. Dù exception handling không phải phần tiêu chuẩn của C, nó có thể hữu ích nếu có sẵn và những vấn đề portability có thể có không đáng lo. Ví dụ sau minh họa cách này bằng phiên bản ngôn ngữ C của Microsoft Visual Studio.

Ở đây, try block bao quanh mọi statement có thể gây throw exception tại runtime. Finally block được thực thi bất kể có exception được throw hay không. Function `free` được bảo đảm sẽ được thực thi.

```
void exceptionExample() {
   int *pi = NULL;
   __try {
      pi = (int*)malloc(sizeof(int));
      *pi = 5;
      printf("%d\n",*pi);
   }
   __finally {
      free(pi);
   }
}
```

Có thể triển khai exception handling trong C bằng nhiều cách khác.

## Tóm tắt

Dynamic memory allocation là tính năng quan trọng của ngôn ngữ C. Trong chương này, chúng ta tập trung vào cấp phát memory thủ công bằng các function `malloc` và `free`. Chúng ta đã xử lý một số vấn đề phổ biến liên quan đến các function này, bao gồm không cấp phát memory và dangling pointer.

Có những kỹ thuật không standard khác để quản lý dynamic memory trong C. Chúng ta đã đề cập một vài kỹ thuật garbage collection, gồm RAII và exception handling.
