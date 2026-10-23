# Chương 3. Pointer và function

Pointer đóng góp rất lớn vào khả năng của function. Chúng cho phép truyền dữ liệu vào function và để function sửa đổi dữ liệu đó. Dữ liệu phức tạp cũng có thể được truyền vào và trả về từ function dưới dạng pointer tới structure. Khi chứa địa chỉ của function, pointer cung cấp cách điều khiển động luồng thực thi của chương trình. Trong chương này, chúng ta sẽ tìm hiểu sức mạnh của pointer khi kết hợp với function và học cách dùng chúng giải quyết nhiều bài toán real-world.

Để hiểu function và cách sử dụng chúng với pointer, bạn cần nắm vững program stack. Phần lớn ngôn ngữ block-structured hiện đại, chẳng hạn C, dùng program stack để hỗ trợ thực thi function. Khi một function được gọi, stack frame của nó được tạo rồi push lên program stack. Khi function trả về, stack frame của nó được pop khỏi program stack.

Khi làm việc với function, pointer hữu ích trong hai trường hợp. Trường hợp thứ nhất là truyền pointer vào function. Điều này cho phép function sửa đổi dữ liệu được pointer tham chiếu tới, đồng thời truyền các khối thông tin hiệu quả hơn.

Thứ hai là khai báo pointer đến function. Về bản chất, function notation là pointer notation. Tên function được evaluate thành address của function, và các parameter được truyền cho function. Như sẽ thấy, function pointer bổ sung khả năng điều khiển execution flow của chương trình.

Phần này xây dựng nền tảng để hiểu và làm việc với function và pointer. Do function và pointer hiện diện khắp nơi, nền tảng này sẽ rất hữu ích.

## Program stack và heap

Program stack và heap là những thành phần runtime quan trọng của C. Trong phần này, chúng ta sẽ xem xét kỹ cấu trúc và cách sử dụng program stack cùng heap. Chúng ta cũng tìm hiểu cấu trúc của stack frame, nơi chứa local variable.

![image](images/ch03/fig03-01.png)

Local variable còn gọi là automatic variable. Chúng luôn được cấp phát trong stack frame.

### Program stack

Program stack là vùng memory hỗ trợ function execution và thường dùng chung với heap, tức chúng chia sẻ cùng vùng memory. Program stack thường chiếm phần thấp của vùng này, còn heap dùng phần cao.

Program stack chứa stack frame, đôi khi gọi activation record hoặc activation frame. Stack frame chứa parameter và local variable của function. Heap quản lý dynamic memory, được bàn trong “Dynamic memory allocation” trang 34.

Hình 3-1 minh họa tổ chức stack và heap về mặt khái niệm, dựa trên chuỗi code sau:

```
void function2() {
    Object *var1 = ...;
    int var2;
    printf("Program Stack Example\n");
}

void function1() {
    Object *var3 = ...;
    function2();
}

int main() {
    int var4;
    function1();
}
```

Khi gọi function, stack frame được push lên stack và stack tăng “lên trên”. Khi function kết thúc, stack frame bị pop khỏi program stack. Memory dùng cho stack frame không được xóa và cuối cùng có thể bị stack frame khác ghi đè khi được push lên program stack.

![image](images/ch03/fig03-02.png)

Hình 3-1. Stack và heap

Memory được cấp phát động lấy từ heap, vốn có xu hướng phát triển “xuống dưới”. Heap sẽ bị phân mảnh khi memory được cấp phát rồi giải phóng. Dù heap thường phát triển xuống dưới, đó chỉ là hướng tổng quát; memory có thể được cấp phát từ bất kỳ vị trí nào trong heap.

### Tổ chức stack frame

Stack frame gồm một số element, bao gồm:

Return address

Address trong chương trình mà function trở về khi hoàn tất

Vùng lưu local data

Memory được cấp phát cho local variable

Vùng lưu parameter

Memory được cấp phát cho các parameter của function

Stack pointer và base pointer

Các pointer được runtime system sử dụng để quản lý stack

Lập trình viên C thông thường không cần quan tâm đến stack pointer và base pointer hỗ trợ stack frame. Tuy nhiên, hiểu chúng là gì và được sử dụng như thế nào sẽ giúp bạn có hiểu biết in-depth về program stack.

Stack pointer thường trỏ đến đỉnh stack. Stack base pointer (frame pointer) cũng thường có và trỏ đến address trong stack frame, như return address. Nó hỗ trợ truy cập element của stack frame. Cả hai không phải C pointer, mà là address runtime system dùng quản lý program stack. Nếu runtime system viết bằng C, chúng có thể là C pointer thực. Xét việc tạo stack frame cho function sau, nhận array integer và integer biểu diễn kích thước array. Ba câu `printf` hiển thị address của parameter và local variable:

```
float average(int *arr, int size) {
   int sum;
   printf("arr: %p\n",&arr);
   printf("size: %p\n",&size);
   printf("sum: %p\n",&sum);
```

```
   for(int i=0; i<size; i++) {
       sum += arr[i];
   }
   return (sum * 1.0f) / size;
}
```

Khi thực thi, bạn sẽ nhận được output tương tự như sau:

```
arr: 0x500
size: 0x504
sum: 0x480
```

Khoảng cách địa chỉ giữa parameter và local variable xuất phát từ những thành phần khác của stack frame mà runtime system sử dụng để quản lý stack.

Khi stack frame được tạo, các parameter được push vào frame theo thứ tự ngược với thứ tự khai báo, tiếp theo là local variable. Điều này được minh họa trong Hình 3-2. Trong trường hợp này, `size` được push trước, rồi đến `arr`. Thông thường, return address của lời gọi function được push tiếp theo, sau đó là local variable. Chúng được push theo thứ tự ngược với thứ tự được liệt kê.

Về khái niệm stack trong ví dụ tăng “lên”. Tuy nhiên, parameter, local variable và stack frame mới được thêm ở memory address thấp hơn. Hướng stack thực sự tăng là implementation-specific.

Variable `i` dùng trong câu `for` không thuộc stack frame này. C coi block statement là function “mini”, push và pop khi thích hợp. Ở đây block được push lên program stack phía trên stack frame `average` khi chạy rồi pop khi hoàn tất.

Dù các địa chỉ cụ thể có thể thay đổi, thứ tự thường không đổi. Hiểu điều này rất quan trọng vì nó giải thích cách memory được cấp phát và xác lập thứ tự tương đối của parameter với variable. Điều đó có thể hữu ích khi debug vấn đề liên quan đến pointer. Nếu không biết stack frame được cấp phát như thế nào, bạn có thể thấy việc gán địa chỉ thật khó hiểu.

Khi các stack frame được push lên program stack, hệ thống có thể hết memory. Tình trạng này gọi là stack overflow và thường khiến chương trình kết thúc bất thường. Hãy nhớ rằng mỗi thread thường được cấp program stack riêng.

![image](images/ch03/fig03-03.png)

Hình 3-2. Ví dụ stack frame

Điều này có thể dẫn tới xung đột nếu một hoặc nhiều thread truy cập cùng object trong memory. Vấn đề được bàn trong “Chia sẻ pointer giữa các thread” trang 186.

## Truyền và trả về bằng pointer

Trong phần này, chúng ta xem xét tác động của việc truyền pointer vào function và trả pointer về từ function. Truyền pointer cho phép nhiều function truy cập object được tham chiếu mà không cần biến object thành global. Điều đó có nghĩa chỉ những function cần truy cập object mới nhận quyền truy cập, đồng thời object không cần được sao chép.

Nếu cần sửa đổi dữ liệu trong function, dữ liệu phải được truyền bằng pointer. Chúng ta có thể truyền dữ liệu bằng pointer nhưng ngăn sửa đổi bằng cách truyền pointer tới constant, như sẽ minh họa trong mục “Truyền pointer tới constant” ở trang 63. Khi dữ liệu là một pointer cần được sửa đổi, chúng ta truyền nó dưới dạng pointer tới pointer. Chủ đề này được trình bày trong mục “Truyền pointer tới pointer” ở trang 68.

Các parameter, bao gồm pointer, được truyền by value. Nghĩa là một bản sao của argument được truyền cho function. Truyền pointer đến argument có thể hiệu quả khi xử lý data structure lớn. Chẳng hạn, hãy xét một structure lớn biểu diễn nhân viên. Nếu truyền toàn bộ structure cho function, từng byte của structure phải được copy, khiến chương trình chậm hơn và dùng nhiều storage hơn trong stack frame. Truyền pointer đến object có nghĩa object phải được copy, và chúng ta có thể truy cập object qua pointer.

### Truyền data bằng pointer

Một trong những lý do chính để truyền dữ liệu bằng pointer là cho phép function sửa đổi dữ liệu. Đoạn code sau triển khai function swap để hoán đổi các giá trị mà parameter tham chiếu tới. Đây là thao tác phổ biến trong nhiều thuật toán sắp xếp. Ở đây, chúng ta dùng integer pointer và dereference chúng để thực hiện thao tác swap:

```
void swapWithPointers(int* pnum1, int* pnum2) {
    int tmp;
    tmp = *pnum1;
    *pnum1 = *pnum2;
    *pnum2 = tmp;
}
```

Đoạn code sau minh họa cách sử dụng function này:

```
int main() {
    int n1 = 5;
    int n2 = 10;
    swapWithPointers(&n1, &n2);
    return 0;
}
```

Các pointer `pnum1` và `pnum2` được dereference trong swap operation. Điều này khiến các giá trị `n1` và `n2` được sửa đổi. Hình 3-3 minh họa cách memory được tổ chức. `Before image` cho thấy program stack khi function swap bắt đầu, còn `After image` cho thấy nó ngay trước khi function trả về.

![image](images/ch03/fig03-04.png)

Hình 3-3. Swap bằng pointer

### Truyền data by value

Nếu không truyền bằng pointer, thao tác swap sẽ không xảy ra. Trong function sau, hai integer được truyền by value:

```
void swap(int num1, int num2) {
    int tmp;
    tmp = num1;
    num1 = num2;
    num2 = tmp;
}
```

Trong đoạn code sau, hai integer được truyền vào function:

```
int main() {
    int n1 = 5;
    int n2 = 10;
    swap(n1, n2);
    return 0;
}
```

Tuy nhiên, cách này không hoạt động vì các integer được truyền by value thay vì bằng pointer. Chỉ bản sao của argument được lưu trong `num1` và `num2`. Nếu sửa `num1`, argument `n1` không thay đổi. Khi sửa parameter, chúng ta không sửa argument gốc. Hình 3-4 minh họa cách memory được cấp phát cho các parameter.

![image](images/ch03/fig03-05.png)

Hình 3-4. Truyền by value

### Truyền pointer đến constant

Truyền pointer tới constant là kỹ thuật phổ biến trong C. Kỹ thuật này hiệu quả vì chỉ truyền địa chỉ dữ liệu và trong một số trường hợp có thể tránh sao chép lượng lớn memory. Tuy nhiên, với pointer thông thường, dữ liệu có thể bị sửa đổi. Khi không muốn điều đó, giải pháp là truyền pointer tới constant.

Trong ví dụ này, chúng ta truyền một pointer tới constant integer và một pointer tới integer. Bên trong function, không thể sửa giá trị được truyền dưới dạng pointer tới constant:

```
void passingAddressOfConstants(const int* num1, int* num2) {
    *num2 = *num1;
}
int main() {
    const int limit = 100;
    int result = 5;
    passingAddressOfConstants(&limit, &result);
    return 0;
}
```

Không có syntax error nào được tạo, và function sẽ gán 100 cho variable `result`. Trong phiên bản function sau, chúng ta cố sửa cả hai integer được tham chiếu:

```
void passingAddressOfConstants(const int* num1, int* num2) {
    *num1 = 100;
    *num2 = 200;
}
```

Điều này gây vấn đề nếu truyền constant `limit` hai lần:

```
const int limit = 100;
passingAddressOfConstants(&limit, &limit);
```

Điều này tạo ra các syntax error báo rằng type của parameter thứ hai không khớp với argument. Ngoài ra, compiler còn báo rằng chúng ta đang cố sửa giá trị được giả định là constant mà parameter thứ nhất tham chiếu tới.

Function yêu cầu pointer tới integer, nhưng lại nhận pointer tới integer constant. Chúng ta không thể truyền địa chỉ của integer constant cho pointer tới constant, vì điều đó sẽ cho phép sửa giá trị constant. Nội dung này được trình bày chi tiết trong mục “Constant và pointer” ở trang 27.

Thử truyền address của integer literal như sau cũng sinh syntax error:

```
passingAddressOfConstants(&23, &23);
```

Thông báo cho biết cần `lvalue` làm operand của address-of operator. Khái niệm `lvalue` được bàn trong “Dereference pointer bằng indirection operator” trang 11.

### Trả về pointer

Trả về pointer rất dễ thực hiện. Chỉ cần khai báo return type là pointer tới data type phù hợp. Nếu cần trả về object từ một function, hai kỹ thuật sau thường được sử dụng:

- Cấp phát memory bên trong function bằng `malloc` rồi trả về địa chỉ của nó. Caller chịu trách nhiệm giải phóng memory nhận được.

- Truyền object vào function để sửa đổi tại đó. Cách này đặt trách nhiệm cấp phát và giải phóng memory của object lên caller.

Trước hết, chúng ta minh họa việc dùng các function thuộc loại `malloc` để cấp phát memory được trả về. Tiếp theo là ví dụ trả về pointer tới local object; cách này không được khuyến nghị. Cách nêu ở gạch đầu dòng thứ hai sau đó được minh họa trong mục “Truyền null pointer” ở trang 67.

Trong ví dụ sau, chúng ta định nghĩa function nhận kích thước của một integer array và một giá trị để khởi tạo từng phần tử. Function cấp phát memory cho integer array, khởi tạo array bằng giá trị đã truyền, rồi trả về địa chỉ của array:

```
int* allocateArray(int size, int value) {
    int* arr = (int*)malloc(size * sizeof(int));
    for(int i=0; i<size; i++) {
        arr[i] = value;
    }
    return arr;
}
```

Sau đây minh họa cách dùng function:

```
int* vector = allocateArray(5,45);
for(int i=0; i<5; i++) {
    printf("%d\n", vector[i]);
}
```

Hình 3-5 minh họa cách memory được cấp phát cho function này. Hình `Before` cho thấy trạng thái chương trình ngay trước khi return statement thực thi. Hình `After` cho thấy trạng thái sau khi function trả về. Variable `vector` lúc này chứa địa chỉ của memory được cấp phát bên trong function. Dù variable `arr` không còn khi function kết thúc, memory mà pointer tham chiếu tới vẫn tồn tại. Cuối cùng, memory này cần được giải phóng.

Dù ví dụ trước hoạt động đúng, việc trả về pointer từ function có thể dẫn đến một số vấn đề sau:

- Trả pointer chưa khởi tạo

- Trả pointer đến address không hợp lệ

- Trả pointer đến local variable

- Trả pointer nhưng không giải phóng

Vấn đề cuối được minh họa điển hình bằng function `allocateArray`. Trả về memory được cấp phát động từ function có nghĩa caller của function chịu trách nhiệm giải phóng nó. Hãy xem ví dụ sau:

```
int* vector = allocateArray(5,45);
...
free(vector);
```

![image](images/ch03/fig03-06.png)

Hình 3-5. Trả pointer

Khi dùng xong, cuối cùng chúng ta phải giải phóng nó. Nếu không, sẽ xuất hiện memory leak.

### Pointer đến local data

Nếu không hiểu program stack hoạt động như thế nào, bạn rất dễ mắc lỗi trả về pointer tới local data. Trong ví dụ sau, chúng ta viết lại function `allocateAr` `ray` đã dùng trong mục “Trả về pointer” ở trang 64. Thay vì cấp phát động memory cho array, chúng ta dùng local array:

```
int* allocateArray(int size, int value) {
    int arr[size];
    for(int i=0; i<size; i++) {
        arr[i] = value;
    }
    return arr;
}
```

Đáng tiếc là địa chỉ array được trả về không còn hợp lệ khi function trả về, vì stack frame của function đã bị pop khỏi stack. Dù từng phần tử array có thể vẫn chứa 45, các giá trị này có thể bị ghi đè nếu function khác được gọi. Đoạn code sau minh họa điều đó: function `printf` được gọi nhiều lần, làm hỏng nội dung array:

```
int* vector = allocateArray(5,45);
for(int i=0; i<5; i++) {
    printf("%d\n", vector[i]);
}
```

Hình 3-6 minh họa việc cấp phát memory khi điều này xảy ra. Khung nét đứt cho biết nơi các stack frame khác, chẳng hạn stack frame của function `printf`, có thể được push lên program stack và do đó làm hỏng memory mà array chiếm giữ. Nội dung thực tế của stack frame ấy là implementation-dependent.

![image](images/ch03/fig03-07.png)

Hình 3-6. Trả pointer đến local data

Một cách khác là khai báo variable `arr` là static. Điều này giới hạn scope của variable trong function nhưng cấp phát nó ngoài stack frame, loại bỏ khả năng function khác ghi đè giá trị của variable:

```
int* allocateArray(int size, int value) {
    static int arr[5];
    ...
}
```

Tuy nhiên, cách này không phải lúc nào cũng hoạt động. Mỗi lần function `allocateArray` được gọi, nó sẽ tái sử dụng array. Điều đó thực chất khiến kết quả của mọi lời gọi trước không còn hiệu lực. Ngoài ra, static array phải được khai báo với kích thước cố định, hạn chế khả năng xử lý nhiều kích thước array khác nhau của function.

Nếu function chỉ trả về một vài giá trị có thể có và việc chia sẻ chúng không gây vấn đề, function có thể duy trì danh sách các giá trị ấy rồi trả về giá trị thích hợp. Cách này hữu ích khi trả về thông báo trạng thái, chẳng hạn mã lỗi ít có khả năng bị sửa đổi. Mục “Trả về string” ở trang 126 minh họa cách dùng global value và static value.

### Truyền null pointer

Trong phiên bản function `allocateArray` sau, chúng ta truyền pointer tới array cùng kích thước và giá trị dùng để khởi tạo từng phần tử của array. Pointer được trả về để thuận tiện sử dụng. Dù phiên bản này không cấp phát memory, các phiên bản sau sẽ làm việc đó:

```
int* allocateArray(int *arr, int size, int value) {
    if(arr != NULL) {
        for(int i=0; i<size; i++) {
            arr[i] = value;
        }
    }
    return arr;
}
```

Khi truyền pointer vào function, luôn nên kiểm tra nó không phải null trước khi sử dụng.

Có thể gọi function như sau:

```
int* vector = (int*)malloc(5 * sizeof(int));
allocateArray(vector,5,45);
```

Nếu pointer là NULL, function không thực hiện thao tác nào và chương trình tiếp tục chạy mà không kết thúc bất thường.

### Truyền pointer đến pointer

Khi truyền pointer vào function, pointer được truyền by value. Nếu muốn sửa pointer gốc thay vì bản sao của pointer, chúng ta cần truyền nó dưới dạng pointer tới pointer. Trong ví dụ sau, một pointer tới integer array được truyền vào để nhận memory được cấp phát và khởi tạo. Function trả memory đã cấp phát qua parameter thứ nhất. Bên trong function, trước hết chúng ta cấp phát memory rồi khởi tạo nó. Địa chỉ của memory này được dự định gán cho pointer tới `int`. Để sửa pointer ấy trong function gọi, chúng ta cần truyền địa chỉ của pointer. Vì vậy, parameter được khai báo là pointer tới pointer tới `int`. Trong function gọi, chúng ta cần truyền địa chỉ của pointer:

```
void allocateArray(int **arr, int size, int value) {
    *arr = (int*)malloc(size * sizeof(int));
    if(*arr != NULL) {
        for(int i=0; i<size; i++) {
            *(*arr+i) = value;
        }
    }
}
```

Có thể kiểm thử function bằng code:

```
int *vector = NULL;
allocateArray(&vector,5,45);
```

Parameter thứ nhất của `allocateArray` được truyền dưới dạng pointer tới pointer tới integer. Khi gọi function, chúng ta cần truyền một giá trị thuộc type này bằng cách truyền địa chỉ của `vector`. Địa chỉ do `malloc` trả về được gán cho `arr`. Dereference pointer tới pointer tới integer cho kết quả là pointer tới integer. Vì đó là địa chỉ của `vector`, chúng ta sửa được `vector`.

Việc cấp phát memory được minh họa trong Hình 3-7. Hình `Before` cho thấy trạng thái stack sau khi `malloc` trả về và array được khởi tạo. Tương tự, hình `After` cho thấy trạng thái stack sau khi function trả về.

![image](images/ch03/fig03-01.png)

Để dễ nhận ra những vấn đề như memory leak, hãy vẽ sơ đồ cấp phát memory.

![image](images/ch03/fig03-08.png)

Hình 3-7. Truyền pointer đến pointer

Phiên bản function sau minh họa vì sao truyền pointer thông thường không hoạt động:

```
void allocateArray(int *arr, int size, int value) {
    arr = (int*)malloc(size * sizeof(int));
    if(arr != NULL) {
        for(int i=0; i<size; i++) {
            arr[i] = value;
        }
    }
}
```

Chuỗi sau minh họa cách dùng:

```
int *vector = NULL;
allocateArray(&vector,5,45);
printf("%p\n",vector);
```

Khi thực thi chương trình, bạn sẽ thấy 0x0 được hiển thị vì khi `vector` được truyền vào function, giá trị của nó được sao chép vào parameter `arr`. Sửa `arr` không ảnh hưởng đến `vector`. Khi function trả về, giá trị trong `arr` không được sao chép sang `vec` `tor`. Hình 3-8 minh họa việc cấp phát memory. Hình `Before malloc` cho thấy trạng thái memory ngay trước khi `arr` được gán giá trị mới. Nó chứa giá trị 500 được truyền từ `vector`. Hình `After malloc` cho thấy trạng thái memory sau khi function `malloc` thực thi bên trong function `allocateArray` và array được khởi tạo. Variable `arr` đã thay đổi để trỏ tới vị trí mới trong heap. Hình `After return` cho thấy trạng thái program stack sau khi function trả về. Ngoài ra, chúng ta có memory leak vì đã mất quyền truy cập khối memory ở địa chỉ 600.

![image](images/ch03/fig03-09.png)

Hình 3-8. Truyền pointer

#### Tự viết function free

Một số vấn đề quanh function `free` khiến một số lập trình viên muốn tự tạo phiên bản của riêng mình. Function `free` không kiểm tra pointer được truyền vào có phải `NULL` hay không và không đặt pointer thành `NULL` trước khi trả về. Đặt pointer thành `NULL` sau khi giải phóng là cách làm tốt.

Dựa trên nền tảng trong mục “Truyền và trả về bằng pointer” ở trang 61, ví dụ sau minh họa một cách triển khai function `free` riêng để gán NULL cho pointer. Cách này đòi hỏi sử dụng pointer tới pointer:

```
void saferFree(void **pp) {
    if (pp != NULL && *pp != NULL) {
        free(*pp);
        *pp = NULL;
    }
}
```

Function `saferFree` gọi function `free` để thực sự giải phóng memory. Parameter của nó được khai báo là pointer tới pointer tới `void`. Dùng pointer tới pointer cho phép sửa pointer được truyền vào. Dùng type `void` cho phép truyền mọi loại pointer. Tuy nhiên, nếu không cast tường minh pointer type sang void khi gọi function, chúng ta sẽ nhận cảnh báo. Khi thực hiện cast tường minh, cảnh báo sẽ biến mất.

Macro `safeFree` dưới đây gọi function `saferFree` với phép cast này và dùng address-of operator, nhờ đó người dùng function không cần tự cast và truyền địa chỉ của pointer.

```
#define safeFree(p) saferFree((void**)&(p))
```

Chuỗi tiếp theo minh họa macro:

```
int main() {
    int *pi;
    pi = (int*) malloc(sizeof(int));
    *pi = 5;
    printf("Before: %p\n",pi);
    safeFree(pi);
    printf("After: %p\n",pi);
    safeFree(pi);
    return (EXIT_SUCCESS);
}
```

Giả sử `malloc` trả về memory từ địa chỉ 1000, output của đoạn code này là 1000 rồi đến 0. Lần dùng macro `safeFree` thứ hai với giá trị `NULL` không làm ứng dụng kết thúc, vì function phát hiện và bỏ qua giá trị đó.

## Function pointer

Function pointer là pointer chứa địa chỉ của một function. Khả năng trỏ tới function hóa ra là một tính năng quan trọng và hữu ích của C. Nó cung cấp cách khác để thực thi các function theo thứ tự có thể chưa biết tại compile time mà không cần conditional statement.

Một mối lo khi dùng function pointer là chương trình có thể chạy chậm hơn. Processor có thể không dùng được branch prediction kết hợp với pipelining. Branch prediction là kỹ thuật processor đoán xem trong nhiều chuỗi thực thi, chuỗi nào sẽ được thực hiện. Pipelining là công nghệ hardware thường dùng để cải thiện hiệu năng processor bằng cách chồng lấp việc thực thi instruction. Trong cơ chế này, processor bắt đầu xử lý nhánh mà nó cho rằng sẽ được thực thi. Nếu dự đoán đúng nhánh, các instruction đang nằm trong pipeline sẽ không phải bị loại bỏ.

Sự chậm lại này có thể xảy ra hoặc không. Dùng function pointer trong những tình huống như tra bảng có thể giảm bớt vấn đề hiệu năng. Trong phần này, chúng ta sẽ học cách khai báo function pointer, tìm hiểu cách dùng chúng để hỗ trợ các luồng thực thi thay thế và khám phá kỹ thuật khai thác tiềm năng của chúng.

### Khai báo function pointer

Syntax khai báo pointer tới function có thể gây bối rối khi mới nhìn thấy. Cũng như nhiều khía cạnh khác của C, khi quen notation, mọi thứ sẽ dần rõ ràng. Hãy bắt đầu bằng declaration đơn giản. Dưới đây, chúng ta khai báo pointer tới function nhận void và trả về void:

```
void (*foo)();
```

Declaration này rất giống function prototype. Nếu bỏ cặp ngoặc đơn thứ nhất, nó trông như prototype của function `foo` nhận void và trả về pointer tới void. Tuy nhiên, cặp ngoặc khiến nó trở thành function pointer có tên `foo`. Dấu sao cho biết đây là pointer. Hình 3-9 đánh dấu các phần của declaration function pointer.

![image](images/ch03/fig03-10.png)

Hình 3-9. Declaration function pointer

![image](images/ch03/fig03-01.png)

Khi sử dụng function pointer, lập trình viên phải cẩn thận bảo đảm dùng đúng, vì C không kiểm tra xem các parameter được truyền có chính xác hay không.

Các ví dụ declaration function pointer khác như sau:

```
int (*f1)(double);       // Passed a double and
                         //    returns an int
void (*f2)(char*);       // Passed a pointer to char and
                         //    returns void
double* (*f3)(int, int); // Passed two integers and
                         //    returns a pointer to a double
```

![image](images/ch03/fig03-01.png)

Một quy ước đặt tên được đề xuất cho function pointer là luôn bắt đầu tên bằng prefix `fptr`.

Đừng nhầm function trả về pointer với function pointer. Declaration sau khai báo `f4` là function trả về pointer tới integer, còn `f5` là function pointer trả về integer. Variable `f6` là function pointer trả về pointer tới integer:

```
int  *f4();
int  (*f5)();
int* (*f6)();
```

Có thể sắp xếp lại khoảng trắng trong các expression để đọc như sau:

```
int*  f4();
int (*f5)();
```

Rõ ràng `f4` là function trả về pointer tới integer. Tuy nhiên, cặp ngoặc đơn với `f5` gắn rõ dấu sao “pointer” với tên function, khiến nó trở thành function pointer.

### Dùng function pointer

Dưới đây là ví dụ đơn giản dùng function pointer trỏ tới function nhận một integer và trả về một integer. Chúng ta cũng định nghĩa function `square` để tính bình phương integer rồi trả kết quả. Để đơn giản hóa ví dụ, chúng ta bỏ qua khả năng integer overflow.

```
int (*fptr1)(int);

int square(int num) {
    return num*num;
}
```

Để dùng function pointer thực thi function `square`, chúng ta cần gán địa chỉ của function `square` cho function pointer như dưới đây. Cũng như tên array, khi chỉ dùng tên function, nó trả về địa chỉ của function. Chúng ta cũng khai báo một integer sẽ được truyền vào function:

```
int n = 5;
fptr1 = square;
printf("%d squared is %d\n",n, fptr1(n));
```

Khi thực thi, chương trình hiển thị “5 squared is 25.” Chúng ta có thể dùng address-of operator với tên function như sau, nhưng điều đó không cần thiết và là dư thừa. Trong ngữ cảnh này, compiler thực chất sẽ bỏ qua address-of operator.

```
fptr1 = &square;
```

Hình 3-10 minh họa cách memory được cấp phát trong ví dụ này. Chúng ta đặt function `square` bên dưới program stack chỉ nhằm mục đích minh họa. Function được cấp phát trong segment khác với segment của program stack. Vị trí thực tế của function thường không phải điều cần quan tâm.

![image](images/ch03/fig03-11.png)

Hình 3-10. Vị trí function

Khai báo type definition cho function pointer rất thuận tiện. Dưới đây là ví dụ áp dụng cho function pointer vừa dùng. Type definition trông hơi lạ: thông thường tên của type definition là thành phần cuối cùng trong declaration.

```
typedef int (*funcptr)(int);

...

funcptr fptr2;
fptr2 = square;
printf("%d squared is %d\n",n, fptr2(n));
```

“Function pointer và string” trang 130 cho ví dụ thú vị về dùng function pointer điều khiển cách sort array string.

### Truyền function pointer

Truyền function pointer khá dễ thực hiện. Chỉ cần dùng declaration function pointer làm parameter của function. Chúng ta sẽ minh họa bằng các function `add`, `sub` và `compute` được khai báo dưới đây:

```
int add(int num1, int num2) {
   return num1 + num2;
}

int subtract(int num1, int num2) {
   return num1 - num2;
}

typedef int (*fptrOperation)(int,int);

int compute(fptrOperation operation, int num1, int num2) {
    return operation(num1, num2);
}
```

Chuỗi sau minh họa các function:

```
printf("%d\n",compute(add,5,6));
printf("%d\n",compute(sub,5,6));
```

Output sẽ là 11 và –1. Địa chỉ của các function `add` và `sub` được truyền vào function `compute`, rồi được dùng để gọi thao tác tương ứng. Ví dụ này cũng cho thấy dùng function pointer có thể khiến code linh hoạt hơn.

### Trả function pointer

Để trả về function pointer, cần khai báo return type của function là function pointer. Nhằm minh họa, chúng ta dùng lại function `add` và `sub` cùng type definition đã xây dựng trong mục “Truyền function pointer” ở trang 74.

Chúng ta dùng function `select` sau để trả về function pointer tới một thao tác dựa trên ký tự đầu vào. Nó trả về pointer tới function `add` hoặc function `subtract`, tùy `opcode` được truyền:

```
fptrOperation select(char opcode) {
    switch(opcode) {
        case '+': return add;
        case '-': return subtract;
    }
}
```

Function `evaluate` liên kết các function này lại với nhau. Nó nhận hai integer và một ký tự biểu thị thao tác cần thực hiện. Nó truyền `opcode` cho function `select`, function này trả về pointer tới function cần thực thi. Trong return statement, nó thực thi function ấy rồi trả về kết quả:

```
int evaluate(char opcode, int num1, int num2) {
    fptrOperation operation = select(opcode);
    return operation(num1, num2);
}
```

Các statement `printf` sau minh họa việc sử dụng function này:

```
printf("%d\n",evaluate('+', 5, 6));
printf("%d\n",evaluate('-', 5, 6));
```

Output là 11 và –1.

### Dùng array function pointer

Array chứa function pointer có thể dùng để chọn function cần đánh giá dựa trên một số tiêu chí. Khai báo array như vậy khá đơn giản: chỉ cần dùng declaration function pointer làm type của array như dưới đây. Array cũng được khởi tạo với mọi phần tử là `NULL`. Khi một khối giá trị khởi tạo được dùng với array, các giá trị được gán cho các phần tử liên tiếp. Nếu số giá trị ít hơn kích thước array, như trong ví dụ này, giá trị được dùng để khởi tạo mọi phần tử của array:

```
typedef int (*operation)(int, int);
operation operations[128] = {NULL};
```

Hoặc khai báo array mà không dùng `typedef` như sau:

```
int (*operations[128])(int, int) = {NULL};
```

Mục đích của array này là dùng một character index để chọn function tương ứng cần thực thi. Chẳng hạn, ký tự '\*' xác định function nhân nếu function ấy tồn tại. Chúng ta dùng được character index vì character literal là integer. 128 phần tử tương ứng với 128 ký tự ASCII đầu tiên. Chúng ta sẽ kết hợp definition này với các function `add` và `subtract` đã xây dựng trong mục “Trả về function pointer” ở trang 75.

Sau khi khởi tạo mọi phần tử của array thành `NULL`, chúng ta gán các function `add` và `subtract` cho phần tử tương ứng với dấu cộng và dấu trừ:

```
void initializeOperationsArray() {
    operations['+'] = add;
    operations['-'] = subtract;
}
```

Function `evaluate` trước đó được viết lại thành `evaluateArray`. Thay vì gọi function `select` để lấy function pointer, chúng ta dùng `operations` với ký tự thao tác làm index:

```
int evaluateArray(char opcode, int num1, int num2) {
    fptrOperation operation;
    operation = operations[opcode];
    return operation(num1, num2);
}
```

Kiểm thử function bằng chuỗi sau:

```
initializeOperationsArray();
printf("%d\n",evaluateArray('+', 5, 6));
printf("%d\n",evaluateArray('-', 5, 6));
```

Kết quả thực thi đoạn code này là 11 và –1. Phiên bản chắc chắn hơn của function `evaluateArray` sẽ kiểm tra null function pointer trước khi cố thực thi function.

### So sánh function pointer

Các function pointer có thể được so sánh với nhau bằng equality operator và inequality operator. Trong ví dụ sau, chúng ta dùng type definition `fptrOperator` và function `add` từ mục “Truyền function pointer” ở trang 74. Function `add` được gán cho function pointer `fptr1`, rồi pointer này được so sánh với địa chỉ của function `add`:

```
fptrOperation fptr1 = add;

if(fptr1 == add) {
    printf("fptr1 points to add function\n");
} else {
    printf("fptr1 does not point to add function\n");
}
```

Khi chạy, output xác nhận pointer thực sự trỏ đến function `add`.

Một ví dụ thực tế hơn về lợi ích của so sánh function pointer là array chứa function pointer biểu diễn các bước của một nhiệm vụ. Chẳng hạn, ta có thể có một chuỗi function thao tác trên array các mặt hàng tồn kho. Một nhóm thao tác có thể sắp xếp các mặt hàng, tính tổng tích lũy số lượng của chúng, rồi hiển thị array và tổng. Nhóm thứ hai có thể hiển thị array, tìm mặt hàng đắt nhất và rẻ nhất, rồi hiển thị chênh lệch giá. Mỗi nhóm thao tác có thể được định nghĩa bằng array chứa pointer tới từng function. Thao tác ghi log có thể xuất hiện trong cả hai danh sách. Khả năng so sánh hai function pointer cho phép thay đổi động một nhóm thao tác bằng cách tìm rồi loại function, chẳng hạn ghi log, khỏi danh sách.

### Cast function pointer

Pointer tới một function có thể được cast sang type khác. Cần cẩn thận vì runtime system không xác minh các parameter dùng với function pointer có đúng hay không. Cũng có thể cast function pointer sang function pointer khác rồi cast ngược lại; pointer thu được sẽ bằng pointer ban đầu. Kích thước của các function pointer được sử dụng không nhất thiết giống nhau. Đoạn code sau minh họa thao tác này:

```
typedef int (*fptrToSingleInt)(int);
typedef int (*fptrToTwoInts)(int,int);
int add(int, int);
```

```
fptrToTwoInts fptrFirst = add;
fptrToSingleInt fptrSecond = (fptrToSingleInt)fptrFirst;
fptrFirst = (fptrToTwoInts)fptrSecond;
printf("%d\n",fptrFirst(5,6));
```

Khi thực thi, đoạn lệnh này sẽ hiển thị output là 11.

![image](images/ch03/fig03-12.png)

Việc chuyển đổi giữa function pointer và pointer tới dữ liệu không được bảo đảm sẽ hoạt động.

Việc sử dụng `void*` với function pointer không được bảo đảm sẽ hoạt động. Nghĩa là chúng ta không nên gán function pointer cho `void*` như dưới đây:

```
void* pv = add;
```

Tuy nhiên, khi trao đổi các function pointer, người ta thường dùng một function pointer type “cơ sở” như khai báo dưới đây. Declaration này khai báo `fptrBase` là function pointer tới function nhận void và trả về void:

```
typedef void (*fptrBase)();
```

Đoạn lệnh sau minh họa việc sử dụng base pointer này, tái hiện ví dụ trước:

```
fptrBase basePointer;
fptrFirst = add;
basePointer = (fptrToSingleInt)fptrFirst;
fptrFirst = (fptrToTwoInts)basePointer;
printf("%d\n",fptrFirst(5,6));
```

Base pointer được dùng làm chỗ giữ tạm để trao đổi các giá trị function pointer.

![image](images/ch03/fig03-12.png)

Luôn bảo đảm dùng đúng argument list cho function pointer. Nếu không, chương trình sẽ có hành vi không xác định.

## Tóm tắt

Hiểu cấu trúc program stack và heap giúp bạn hiểu chi tiết và thấu đáo hơn cách chương trình hoạt động cũng như hành vi của pointer. Trong chương này, chúng ta đã xem xét stack, heap và stack frame. Các khái niệm ấy giúp giải thích cơ chế truyền pointer vào function và trả pointer về từ function.

Chẳng hạn, trả về pointer tới local variable là cách làm không tốt vì memory cấp cho local variable sẽ bị ghi đè bởi các lời gọi function sau đó. Truyền pointer tới constant data vừa hiệu quả vừa ngăn function sửa dữ liệu được truyền. Truyền pointer tới pointer cho phép gán lại argument pointer để nó trỏ tới vị trí khác trong memory. Stack và heap đã giúp trình bày chi tiết và minh họa khả năng này.

Chương cũng đã giới thiệu và giải thích function pointer. Loại pointer này hữu ích để điều khiển thứ tự thực thi trong ứng dụng bằng cách cho phép thực thi các function thay thế tùy nhu cầu của ứng dụng.
