# Chương 4. Pointer và array

Array là data structure căn bản được tích hợp trong C. Hiểu kỹ array và cách dùng là cần thiết để phát triển application hiệu quả. Hiểu nhầm cách dùng array và pointer có thể gây lỗi hard-to-find và performance chưa tối ưu. Array notation và pointer notation liên quan chặt chẽ, thường có thể thay thế nhau trong ngữ cảnh phù hợp.

Một ngộ nhận phổ biến là array và pointer hoàn toàn thay thế được nhau. Tên array không phải pointer. Dù đôi lúc có thể coi tên array như pointer và dùng array notation với pointer, chúng khác biệt và không phải luôn thay nhau được. Hiểu khác biệt giúp tránh dùng sai notation. Ví dụ, dùng riêng tên array trả address của array, nhưng không thể dùng riêng tên làm đích của assignment.

Array hỗ trợ nhiều phần application, có thể một hoặc nhiều chiều. Chương này xét những khía cạnh cơ bản liên quan pointer để hiểu sâu array và nhiều cách thao tác bằng pointer. Bạn sẽ gặp chúng trong ngữ cảnh nâng cao hơn suốt sách.

Bắt đầu bằng ôn nhanh array, rồi xét điểm giống và khác giữa array notation và pointer notation. Có thể tạo array bằng function kiểu `malloc`, linh hoạt hơn declaration array truyền thống. Chúng ta sẽ thấy cách `realloc` đổi lượng memory cấp cho array.

Cấp động memory cho array có thể khó, nhất là array từ hai chiều trở lên, vì phải bảo đảm cấp trong memory liên tục. Cũng sẽ tìm hiểu vấn đề khi truyền và trả array. Trong phần lớn tình huống phải truyền kích thước để function xử lý đúng. Biểu diễn nội bộ array không có gì vốn xác định độ dài. Nếu không truyền độ dài, function không có cách standard biết array kết thúc đâu. Cũng xem cách tạo jagged array trong C, dù ít dùng. Jagged array là array two-dimensional mà mỗi row có thể có số column khác nhau.

Để minh họa, dùng vector cho array single-dimensional và matrix cho array two-dimensional. Vector và matrix được dùng rộng trong nhiều lĩnh vực, gồm phân tích trường điện từ, dự báo thời tiết và toán học.

## Ôn nhanh array

Array là tập hợp liên tục các element đồng nhất, truy cập bằng index. Liên tục nghĩa là các element nằm kề nhau trong memory không có khoảng trống. Đồng nhất nghĩa là cùng type. Array declaration dùng cặp ngoặc vuông và có thể có nhiều chiều.

Array Two-dimensional phổ biến; thường dùng row và column để mô tả vị trí element. Array từ ba chiều ít phổ biến hơn nhưng hữu ích trong một số application. Đừng nhầm array two-dimensional với array pointer. Chúng tương tự nhưng hành xử hơi khác, như mục “Dùng array One-Dimensional chứa pointer” trang 92 sẽ cho thấy.

Variable length array xuất hiện trong C99. Trước đó dùng kỹ thuật với `realloc` hỗ trợ array có kích thước thay đổi. Function `realloc` được minh họa trong “Dùng function realloc đổi kích thước array” trang 87.

![image](images/ch04/fig04-01.png)

Array có kích thước cố định. Khi khai báo, cần quyết định lớn bao nhiêu. Quá nhiều element gây lãng phí, quá ít giới hạn số element xử lý được. Function `realloc` và variable length array cung cấp kỹ thuật xử lý array cần đổi kích thước. Với chút công sức, có thể resize array để dùng đúng lượng memory.

### Array One-Dimensional

Array one-dimensional là cấu trúc tuyến tính, dùng một index truy cập member. Sau đây khai báo array integer five-element:

```
int vector[5];
```

Array index bắt đầu 0, kết thúc ở kích thước khai báo trừ một. Index hợp lệ của `vector` từ 0 đến 4. Tuy nhiên, C không cưỡng chế giới hạn này. Index không hợp lệ có thể gây hành vi khó dự đoán. Hình 4-1 minh họa cấp memory. Mỗi element dài bốn byte và chưa khởi tạo. Kích thước có thể khác tùy memory model như “Memory model” trang 16 đã giải thích.

![image](images/ch04/fig04-02.png)

Hình 4-1. Memory allocation cho array

Biểu diễn nội bộ array không có thông tin số element. Tên array chỉ tham chiếu block memory. Operator `sizeof` với array trả số byte được cấp. Muốn xác định số element, chia kích thước array cho kích thước element như sau. Kết quả hiển thị 5:

```
printf("%d\n", sizeof(vector)/sizeof(int));
```

Array One-dimensional dễ khởi tạo bằng câu lệnh dạng block. Trong chuỗi sau, từng element được khởi tạo bằng integer bắt đầu từ một:

```
int vector[5] = {1, 2, 3, 4, 5};
```

### Array Two-Dimensional

Array Two-dimensional dùng row và column xác định element. Cần ánh xạ array vào address space one-dimension của main memory. Trong C, dùng thứ tự row-column: row đầu nằm trong memory, tiếp theo row thứ hai, thứ ba, tiếp tục đến row cuối.

Sau đây khai báo array two-dimensional với hai row và ba column, khởi tạo bằng block statement. Hình 4-2 minh họa cấp memory. Sơ đồ trái là ánh xạ memory; sơ đồ phải là cách nhìn khái niệm:

```
int matrix[2][3] = {{1,2,3},{4,5,6}};
```

![image](images/ch04/fig04-03.png)

Hình 4-2. Array Two-dimensional

Array two-dimensional được xem là array của các array. Khi truy cập bằng một subscript, nhận pointer đến row tương ứng. Chuỗi code sau hiển thị address và kích thước từng row:

```
for (int i = 0; i < 2; i++) {
    printf("&matrix[%d]: %p  sizeof(matrix[%d]): %d\n",
            i, &matrix[i], i, sizeof(matrix[i]));
}
```

Output sau giả định array ở address 100. Kích thước là 12 vì mỗi row có ba element, mỗi element bốn byte:

```
&matrix[0]: 100 sizeof(matrix[0]): 12
&matrix[1]: 112 sizeof(matrix[1]): 12
```

Mục “Pointer và multidimensional array” trang 94 sẽ xét kỹ hành vi này.

### Multidimensional array

Multidimensional array có từ hai chiều. Như array two-dimensional, nhiều cặp ngoặc vuông định nghĩa type và kích thước. Ví dụ sau định nghĩa array three-dimensional gồm ba row, hai column và rank bốn. Thuật ngữ rank thường chỉ các element của chiều thứ ba:

```
int arr3d[3][2][4] = {
    {{1, 2, 3, 4}, {5, 6, 7, 8}},
    {{9, 10, 11, 12}, {13, 14, 15, 16}},
    {{17, 18, 19, 20}, {21, 22, 23, 24}}
};
```

Các element được cấp liên tục theo thứ tự row-column-rank như Hình 4-3.

![image](images/ch04/fig04-04.png)

Hình 4-3. Array Three-dimensional

Chúng ta sẽ dùng các declaration này trong ví dụ sau.

## Pointer notation và array

Pointer rất hữu ích với array. Có thể dùng với array hiện có hoặc cấp memory từ heap rồi coi như array. Array notation và pointer notation có thể thay nhau ở một mức độ. Tuy nhiên, không hoàn toàn giống nhau, như mục “Khác biệt giữa array và pointer” trang 85 trình bày.

Dùng riêng tên array trả address của array. Có thể gán address cho pointer như sau:

```
int vector[5] = {1, 2, 3, 4, 5};
int *pv = vector;
```

Variable `pv` trỏ đến element đầu, không phải bản thân array. Khi gán giá trị đầu tiên cho `pv`, chúng ta gán address element đầu.

Có thể dùng riêng tên array hoặc address-of operator với element đầu như sau. Hai cách tương đương và trả address của `vector`. Dùng address-of operator dài hơn nhưng tường minh hơn:

```
printf("%p\n",vector);
printf("%p\n",&vector[0]);
```

Expression `&vector` đôi khi được dùng lấy address array. Nó khác notation kia vì trả pointer đến toàn array. Hai cách kia trả pointer đến integer. Thay vì pointer đến integer, nó trả pointer đến array integer. Cách dùng type này sẽ được minh họa trong “Truyền multidimensional array” trang 96.

Cũng có thể dùng array subscript với pointer. Thực tế notation `pv[i]` được evaluate như sau:

```
*(pv + i)
```

Pointer `pv` chứa address block memory. Notation ngoặc vuông lấy address trong `pv` rồi cộng giá trị index `i` bằng pointer arithmetic. Address mới sau đó được dereference để trả nội dung.

Như “Pointer arithmetic” trang 20 đã bàn, cộng integer vào pointer tăng address bằng tích integer với kích thước data type. Cộng integer vào tên array cũng vậy. Hai câu sau tương đương:

```
*(pv + i)
*(vector + i)
```

Giả định `vector` ở address 100, `pv` ở address 96. Bảng 4-1 và Hình 4-4 minh họa array subscript và pointer arithmetic với tên array và pointer cho các giá trị khác nhau.

Bảng 4-1. Array/pointer notation

| Giá trị | Expression tương đương |  |  |  |
|---|---|---|---|---|
| 92 | \&vector\[-2\] | vector - 2 | \&pv\[-2\] | pv - 2 |
| 100 | vector | vector+0 | \&pv\[0\] | pv |
| 100 | \&vector\[0\] | vector+0 | \&pv\[0\] | pv |
| 104 | \&vector\[1\] | vector + 1 | \&pv\[1\] | pv + 1 |
| 140 | \&vector\[10\] | vector + 10 | \&pv\[10\] | pv + 10 |

![image](images/ch04/fig04-05.png)

Hình 4-4. Array/pointer notation

Cộng 1 vào array address thực tế cộng 4, kích thước integer, vì đây là array integer. Operation đầu và cuối truy cập vị trí ngoài giới hạn array. Dù không tốt, nó nhấn mạnh phải thận trọng khi dùng index hoặc pointer truy cập element.

Có thể coi array notation là operation “dịch và dereference”. Expression `vector[2]` bắt đầu ở vector, pointer đến đầu array, dịch hai vị trí sang phải rồi dereference lấy giá trị. Dùng address-of operator với array notation như `&vector[2]` thực chất triệt tiêu dereferencing. Có thể diễn giải là đi sang trái hai vị trí rồi trả address đó.

Sau đây minh họa pointer khi triển khai scalar addition operation. Operation này nhận giá trị rồi nhân với từng element của vector:

```
pv = vector;
int value = 3;
for(int i=0; i<5; i++) {
    *pv++ *= value;
}
```

### Khác biệt giữa array và pointer

Có một số khác biệt khi dùng array và pointer đến array. Phần này dùng array `vector` và pointer `pv` định nghĩa sau:

```
int vector[5] = {1, 2, 3, 4, 5};
int *pv = vector;
```

Code sinh bởi `vector[i]` khác code sinh bởi `vector+i`. Notation `vector[i]` sinh machine code bắt đầu tại `vector`, di chuyển `i` vị trí rồi dùng nội dung. Notation `vector+i` sinh machine code bắt đầu tại `vector`, cộng `i` vào address rồi dùng nội dung tại address đó. Dù kết quả giống nhau, machine code khác nhau. Khác biệt hiếm khi quan trọng với phần lớn programmer.

Có khác biệt khi áp operator `sizeof` cho array và pointer đến cùng array. Áp `sizeof` cho `vector` trả 20, số byte cấp cho array. Áp `sizeof` cho `pv` trả 4, kích thước pointer.

Pointer `pv` là `lvalue`. `lvalue` chỉ thành phần bên trái assignment operator. `lvalue` phải sửa được. Tên array như `vector` không phải `lvalue`, không sửa được. Address gán cho array không thể thay đổi. Pointer có thể nhận giá trị mới và tham chiếu vùng memory khác.

Xét đoạn sau:

```
pv = pv + 1;
vector = vector + 1; // Syntax error
```

Không thể sửa `vector`, chỉ sửa nội dung. Tuy nhiên, expression `vector+1` hợp lệ, như sau:

```
pv = vector + 1;
```

## Dùng malloc tạo array One-Dimensional

Nếu cấp memory từ heap rồi gán address cho pointer, không có lý do không dùng array subscript với pointer và coi memory như array. Chuỗi sau sao chép nội dung array `vector` dùng trước:

```
int *pv = (int*) malloc(5 * sizeof(int));
for(int i=0; i<5; i++) {
    pv[i] = i+1;
}
```

Có thể dùng pointer notation như sau, nhưng array notation thường dễ theo dõi hơn:

```
for(int i=0; i<5; i++) {
    *(pv+i) = i+1;
}
```

Hình 4-5 minh họa memory allocation.

![image](images/ch04/fig04-06.png)

Hình 4-5. Array cấp từ heap

Kỹ thuật tạo vùng memory rồi coi như array. Kích thước xác định tại runtime. Tuy nhiên, phải nhớ giải phóng khi dùng xong.

![image](images/ch04/fig04-07.png)

Ví dụ trước dùng `*(pv+i)` thay vì `*pv+1`. Vì dereference operator ưu tiên cao hơn plus operator, pointer trong expression thứ hai bị dereference, cho giá trị được tham chiếu. Sau đó cộng `i` vào integer value này, không đúng ý định. Ngoài ra, dùng expression này làm `lvalue` khiến compiler phàn nàn. Vì vậy phải buộc cộng trước rồi dereference để hoạt động đúng.

## Dùng function realloc đổi kích thước array

Có thể resize array tạo bằng `malloc` với `realloc`. Các điểm chính của `realloc` đã nêu ở Chương 2. Chuẩn C99 hỗ trợ variable length array; đôi khi là giải pháp tốt hơn dùng `realloc`. Nếu không dùng C99 thì cần `realloc`. Ngoài ra, variable length array chỉ được khai báo làm thành viên function. Nếu cần array tồn tại lâu hơn function, phải dùng `realloc`.

Để minh họa `realloc`, chúng ta triển khai function đọc character từ standard input rồi gán vào buffer. Buffer chứa mọi character đọc được trừ ký tự return kết thúc. Vì không biết người dùng nhập bao nhiêu, không biết buffer cần dài đến đâu. Dùng `realloc` cấp thêm theo lượng tăng cố định. Code như sau:

```
char* getLine(void) {
    const size_t sizeIncrement = 10;
    char* buffer = malloc(sizeIncrement);
    char* currentPosition = buffer;
    size_t maximumLength = sizeIncrement;
    size_t length = 0;
    int character;

    if(currentPosition == NULL) { return NULL; }

    while(1) {
        character = fgetc(stdin);
        if(character == '\n') { break; }

        if(++length >= maximumLength) {
            char *newBuffer = realloc(buffer, maximumLength += sizeIncrement);

            if(newBuffer == NULL) {
                free(buffer);
                return NULL;
            }
```

```
            currentPosition = newBuffer + (currentPosition - buffer);
            buffer = newBuffer;
        }
        *currentPosition++ = character;
    }
    *currentPosition = '\0';
    return buffer;
}
```

Bắt đầu bằng một số declaration tóm tắt trong Bảng 4-2.

Bảng 4-2. Variable của getLine

| sizeIncrement | Kích thước buffer ban đầu và lượng tăng khi cần mở rộng |
|---|---|
| buffer | Pointer đến các character đọc vào |
| currentPosition | Pointer đến vị trí trống kế tiếp trong buffer |
| maximumLength | Số character tối đa lưu an toàn trong buffer |
| length | Số character đã đọc |
| character | Character cuối được đọc |

Buffer được tạo với kích thước `sizeIncrement`. Nếu `malloc` không cấp được memory, câu `if` đầu buộc function trả `NULL`. Sau đó vào loop vô hạn xử lý từng character. Khi thoát loop, thêm NUL kết thúc string và trả address buffer.

Trong loop `while`, đọc character. Nếu là carriage return thì thoát loop. Sau đó câu `if` xác định đã vượt kích thước buffer chưa. Nếu chưa, thêm character vào vị trí hiện tại.

Nếu vượt kích thước buffer, `realloc` tạo block memory mới lớn hơn block cũ `sizeIncrement` byte. Nếu không cấp được, giải phóng memory hiện có rồi buộc trả `NULL`. Nếu được, điều chỉnh `currentPosition` trỏ đúng vị trí trong buffer mới, và gán variable buffer trỏ đến buffer mới cấp. Function `realloc` không nhất thiết giữ memory tại chỗ cũ, nên phải dùng pointer trả về để biết block resize mới nằm đâu.

Variable `newBuffer` giữ address memory cấp phát. Cần variable riêng thay vì `buffer` phòng trường hợp `realloc` không cấp được memory, để phát hiện và xử lý.

Không giải phóng `buffer` nếu `realloc` thành công vì `realloc` sao chép buffer cũ sang mới rồi giải phóng buffer cũ. Nếu thử giải phóng `buffer`, thường làm chương trình kết thúc vì giải phóng cùng block hai lần.

Hình 4-6 minh họa memory cho `getLine` với input string “Once upon a time there was a giant pumpkin.” Program stack được đơn giản hóa, bỏ qua local variable ngoài `buffer` và `currentPosition`. Buffer đã được mở rộng bốn lần, thể hiện bằng hình chữ nhật chứa input string.

![image](images/ch04/fig04-08.png)

Hình 4-6. Memory allocation cho function getLine

Function `realloc` cũng giảm lượng không gian pointer dùng. Để minh họa, function `trim` sau xóa khoảng trắng đầu string:

```
char* trim(char* phrase) {
    char* old = phrase;
    char* new = phrase;
```

```
while(*old == ' ') {
    old++;
}
```

```
    while(*old) {
        *(new++) = *(old++);
    }
    *new = 0;
    return (char*) realloc(phrase,strlen(phrase)+1);
}

int main() {
    char* buffer = (char*)malloc(strlen("  cat")+1);
    strcpy(buffer,"  cat");
    printf("%s\n",trim(buffer));
}
```

Loop `while` đầu dùng variable `tmp` bỏ qua khoảng trắng đầu. Loop `while` thứ hai sao chép character còn lại về đầu string. Nó evaluate true đến khi gặp `NUL`, được evaluate false. Sau đó thêm zero kết thúc string. Function `realloc` cấp lại memory dựa trên độ dài mới.

Hình 4-7 minh họa dùng function với string ban đầu “cat.” Trạng thái trước và sau khi `trim` thực thi được hiển thị. Memory đỏ là memory cũ, không nên truy cập.

![image](images/ch04/fig04-09.png)

Hình 4-7. Ví dụ realloc

## Truyền array One-Dimensional

Khi truyền array one-dimensional cho function, address được truyền by value. Truyền thông tin hiệu quả hơn vì không truyền toàn array và phải cấp memory trên stack cho nó. Thông thường phải truyền kích thước array; nếu không, từ góc nhìn function chỉ có address mà không có dấu hiệu kích thước.

Trừ khi array có gì đó cho biết giới hạn, cần truyền thông tin kích thước. Với string trong array, có thể dựa ký tự kết thúc `NUL` để biết khi nào dừng xử lý; Chương 5 sẽ bàn. Nói chung, không biết kích thước thì không thể xử lý element đúng, có thể làm quá ít hoặc coi memory ngoài array như thuộc array. Thường dẫn tới kết thúc bất thường.

Có thể khai báo array trong function declaration bằng array notation hoặc pointer notation.

### Dùng array notation

Ví dụ sau truyền array integer cùng kích thước cho function rồi hiển thị nội dung:

```
void displayArray(int arr[], int size) {
    for (int i = 0; i < size; i++) {
        printf("%d\n", arr[i]);
    }
}

    int vector[5] = {1, 2, 3, 4, 5};
    displayArray(vector, 5);
```

Output là các số 1 đến 5. Số 5 truyền vào cho biết kích thước. Có thể truyền bất kỳ số dương nào; function sẽ cố hiển thị số element tương ứng dù kích thước đúng hay không. Truy cập memory ngoài array có thể làm chương trình kết thúc. Hình 4-8 cho memory allocation.

![image](images/ch04/fig04-10.png)

Hình 4-8. Dùng array notation

![image](images/ch04/fig04-07.png)

Lỗi phổ biến là dùng `sizeof` với array để xác định số element như sau. Tuy nhiên, như “Array One-Dimensional” trang 80 giải thích, đây không phải cách đúng xác định kích thước. Ở đây sẽ truyền giá trị 20 cho array.

```
displayArray(arr, sizeof(arr));
```

Truyền kích thước nhỏ hơn số element thực là thông lệ để chỉ xử lý một phần array. Ví dụ đọc một loạt tuổi vào array nhưng chưa đầy. Nếu gọi function `sort`, chỉ muốn sort tuổi hợp lệ chứ không mọi element.

### Dùng pointer notation

Không bắt buộc dùng ngoặc vuông khi khai báo array parameter. Có thể dùng pointer notation như sau:

```
void displayArray(int* arr, int size) {
    for (int i = 0; i < size; i++) {
        printf("%d\n", arr[i]);
    }
}
```

Bên trong function vẫn dùng array notation. Nếu muốn có thể dùng pointer notation:

```
void displayArray(int* arr, int size) {
    for (int i = 0; i < size; i++) {
        printf("%d\n", *(arr+i));
    }
}
```

Nếu khai báo function bằng array notation, vẫn dùng pointer notation trong function body được:

```
void displayArray(int arr[], int size) {
    for (int i = 0; i < size; i++) {
        printf("%d\n", *(arr+i));
    }
}
```

## Dùng array One-Dimensional chứa pointer

Phần này xét các điểm chính của array pointer bằng array pointer đến integer. Ví dụ array pointer cũng có trong:

- “Dùng array function pointer” trang 76, nơi dùng array các function

pointer;

- “Memory được cấp cho structure thế nào” trang 135, nơi array structure

được dùng; và

- “Truyền argument cho application” trang 125, nơi xử lý array `argv`.

Mục đích là chuẩn bị cho ví dụ sau bằng cách minh họa bản chất. Chuỗi sau khai báo array integer pointer, cấp memory cho từng element và khởi tạo memory bằng index:

```
int* arr[5];
for(int i=0; i<5; i++) {
    arr[i] = (int*)malloc(sizeof(int));
    *arr[i] = i;
}
```

Nếu hiển thị array, in các số 0 đến 4. Dùng `arr[i]` tham chiếu pointer, `*arr[i]` gán giá trị cho vị trí tham chiếu. Đừng để array notation gây nhầm. Vì `arr` khai báo array pointer, `arr[i]` trả address. Dereference pointer như `*arr[i]` cho nội dung tại address.

Có thể dùng pointer notation tương đương sau cho loop body:

```
*(arr+i) = (int*)malloc(sizeof(int));
**(arr+i) = i;
```

Notation khó theo dõi hơn, nhưng hiểu nó sẽ nâng kỹ năng C. Câu thứ hai dùng hai mức indirection. Thành thạo notation này phân biệt bạn với C programmer ít kinh nghiệm.

Subexpression `(arr+i)` biểu diễn address element thứ i<sup>th</sup>. Cần sửa nội dung address nên dùng `*(arr+i)`. Câu đầu gán memory đã cấp cho vị trí này. Dereference subexpression lần thứ hai, như câu hai, trả vị trí memory cấp phát. Sau đó gán variable `i` vào đó. Hình 4-9 minh họa cấp memory.

Ví dụ `arr[1]` nằm ở address 104. Expression `(arr+1)` cho 104; `*(arr+1)` cho nội dung. Ở đây đó là pointer 504. Dereference lần hai bằng `**(arr+1)` cho nội dung 504, là 1.

![image](images/ch04/fig04-11.png)

Hình 4-9. Array pointer

Các expression ví dụ được liệt kê trong Bảng 4-3. Đọc từ trái sang phải và không bỏ qua ngoặc giúp hiểu cách hoạt động.

Bảng 4-3. Expression của array pointer

| Expression | Giá trị |
|---|---|
| \*arr\[0\] | 0 |
| \*\*arr | 0 |
| \*\*(arr+1) | 1 |
| arr\[0\]\[0\] | 0 |
| arr\[3\]\[0\] | 3 |

Ba expression đầu giống giải thích trước. Hai expression cuối khác: notation pointer đến pointer gợi ý đang làm việc với array pointer, và thực tế đúng vậy. Xem lại Hình 4-9, giả sử mỗi element `arr` trỏ array kích thước một thì hai expression cuối có nghĩa. Chúng ta có array pointer five-element trỏ đến chuỗi array one-element.

Expression `arr[3][0]` chỉ element thứ tư của arr rồi element đầu của array nó trỏ đến. Expression `arr[3][1]` không hoạt động vì array mà element thứ tư trỏ đến không có hai element.

Điều này gợi ý khả năng tạo jagged array. Thực sự làm được, là chủ đề “Jagged array và pointer” trang 102.

## Pointer và multidimensional array

Có thể coi phần của multidimensional array là subarray. Ví dụ mỗi row của array two-dimensional là array one-dimensional. Hành vi ảnh hưởng cách dùng pointer với multidimensional array.

Để minh họa, tạo và khởi tạo array two-dimensional như sau:

```
int matrix[2][5] = {{1,2,3,4,5},{6,7,8,9,10}};
```

Sau đó hiển thị address và giá trị tương ứng:

```
for(int i=0; i<2; i++) {
   for(int j=0; j<5; j++) {
      printf("matrix[%d][%d]  Address: %p  Value: %d\n",
                 i, j, &matrix[i][j], matrix[i][j]);
   }
}
```

Output như sau:

```
matrix[0][0]  Address: 100  Value: 1
matrix[0][1]  Address: 104  Value: 2
matrix[0][2]  Address: 108  Value: 3
matrix[0][3]  Address: 112  Value: 4
matrix[0][4]  Address: 116  Value: 5
matrix[1][0]  Address: 120  Value: 6
matrix[1][1]  Address: 124  Value: 7
matrix[1][2]  Address: 128  Value: 8
matrix[1][3]  Address: 132  Value: 9
matrix[1][4]  Address: 136  Value: 10
```

Array được lưu theo thứ tự row-column: row đầu lưu tuần tự trong memory, sau đó row thứ hai. Hình 4-10 minh họa.

Có thể khai báo pointer dùng với array như sau:

```
int (*pmatrix)[5] = matrix;
```

![image](images/ch04/fig04-12.png)

Hình 4-10. Memory allocation cho array Two-dimensional

Expression `(*pmatrix)` khai báo pointer đến array. Kết hợp phần còn lại declaration, `pmatrix` là pointer đến array integer two-dimensional có năm element mỗi column. Bỏ ngoặc sẽ khai báo array five-element chứa pointer đến integer. Kích thước chiều đầu là 2 vì biết kích thước của `matrix`. Nếu dùng kích thước khác truy cập array, kết quả khó dự đoán.

Muốn truy cập element thứ hai, 2, bằng pointer notation, có vẻ hợp lý dùng:

```
printf("%p\n", matrix);
printf("%p\n", matrix + 1);
```

Output như sau:

```
100
120
```

Address trả bởi `matrix+1` không cách đầu array 4. Thay vào đó cách bằng kích thước row đầu, 20 byte. Dùng riêng `matrix` trả address element đầu. Vì array two-dimensional là array của array, nhận address của array integer five-element, kích thước 20. Có thể xác nhận bằng câu sau, hiển thị 20:

```
printf("%d\n",sizeof(matrix[0]));  // Displays 20
```

Để truy cập element thứ hai, cộng 1 vào row đầu như sau: `*(matrix[0] + 1)`. Expression `matrix[0]` trả address element đầu row đầu. Đây là address array integer. Do đó cộng một làm tăng bằng kích thước một integer, cho element thứ hai. Output là 104 và 2.

```
printf("%p  %d\n", matrix[0] + 1, *(matrix[0] + 1));
```

Có thể biểu diễn array bằng đồ họa như Hình 4-11.

![image](images/ch04/fig04-13.png)

Hình 4-11. Biểu diễn đồ họa array two-dimensional

Có thể diễn giải notation array Two-dimensional như Hình 4-12.

![image](images/ch04/fig04-14.png)

Hình 4-12. Notation array Two-dimensional

## Truyền multidimensional array

Truyền multidimensional array cho function có thể khó hiểu, nhất là dùng pointer notation. Cần quyết định array notation hay pointer notation trong function signature. Cũng cần cân nhắc cách truyền hình dạng array, tức số và kích thước các chiều. Muốn dùng array notation trong function, bắt buộc chỉ hình dạng; nếu không compiler không dùng được subscript.

Để truyền array `matrix`, dùng:

```
void display2DArray(int arr[][5], int rows) {
```

hoặc:

```
void display2DArray(int (*arr)[5], int rows) {
```

Cả hai phiên bản đều chỉ số column. Điều này cần vì compiler phải biết số element mỗi row. Không truyền thông tin thì không evaluate được expression như `arr[0][3]`, như “Pointer và multidimensional array” trang 94 giải thích.

Phiên bản đầu, expression `arr[]` là declaration ngầm của pointer đến array. Phiên bản thứ hai, expression `(*arr)` khai báo tường minh pointer.

![image](images/ch04/fig04-07.png)

Declaration sau không hoạt động đúng:

```
void display2DArray(int *arr[5], int rows) {
```

Dù không sinh syntax error, array truyền được coi là array five-element chứa pointer đến integer. “Dùng array One-Dimensional chứa pointer” trang 92 bàn array pointer.

Sau đây là implementation đơn giản và lời gọi:

```
void display2DArray(int arr[][5], int rows) {
    for (int i = 0; i<rows; i++) {
        for (int j = 0; j<5; j++) {
            printf("%d", arr[i][j]);
        }
        printf("\n");
    }
}

void main() {
    int matrix[2][5] = {
        {1, 2, 3, 4, 5},
        {6, 7, 8, 9, 10}
    };
    display2DArray(matrix, 2);
}
```

Function không cấp memory cho array. Chỉ address được truyền. Hình 4-13 cho trạng thái program stack của lời gọi.

![image](images/ch04/fig04-15.png)

Hình 4-13. Truyền multidimensional array

Bạn có thể gặp function khai báo như sau, nhận một pointer cùng số row và column:

```
void display2DArrayUnknownSize(int *arr, int rows, int cols) {
    for(int i=0; i<rows; i++) {
        for(int j=0; j<cols; j++) {
            printf("%d ", *(arr + (i*cols) + j));
        }
        printf("\n");
    }
}
```

Câu `printf` tính address từng element bằng cách cộng vào `arr` số element của các row trước, `(i*cols)`, rồi cộng `j` để chỉ column. Có thể gọi như sau:

```
display2DArrayUnknownSize(&matrix[0][0], 2, 5);
```

Trong function không thể dùng array subscript như sau:

```
printf("%d ", arr[i][j]);
```

Không thể vì pointer không được khai báo là array two-dimensional. Tuy nhiên, dùng array notation sau được. Có thể dùng một subscript, được diễn giải đơn giản là offset trong array; không dùng hai subscript vì compiler không biết kích thước các chiều:

```
printf("%d ", (arr+i)[j]);
```

Address element đầu được truyền bằng `&matrix[0][0]` thay vì `matrix`. Dùng `matrix` vẫn chạy đúng nhưng sinh warning về pointer type không tương thích. Expression `&matrix[0][0]` là pointer đến integer, còn `matrix` là pointer đến array integer.

Khi truyền array hơn hai chiều, phải chỉ kích thước mọi chiều trừ chiều đầu. Sau đây minh họa function hiển thị array three-dimensional. Hai chiều cuối được chỉ trong declaration:

```
void display3DArray(int (*arr)[2][4], int rows) {
    for(int i=0; i<rows; i++) {
        for(int j=0; j<2; j++) {
            printf("{");
            for(int k=0; k<4; k++) {
                printf("%d ", arr[i][j][k]);
            }
            printf("}");
        }
        printf("\n");
    }
}
```

Code sau cho cách gọi function:

```
int arr3d[3][2][4] = {
    {{1, 2, 3, 4}, {5, 6, 7, 8}},
    {{9, 10, 11, 12}, {13, 14, 15, 16}},
    {{17, 18, 19, 20}, {21, 22, 23, 24}}
};

display3DArray(arr3d,3);
```

Output như sau:

```
{1 2 3 4 }{5 6 7 8 }
{9 10 11 12 }{13 14 15 16 }
{17 18 19 20 }{21 22 23 24 }
```

Hình 4-14 mô tả memory allocation của array.

![image](images/ch04/fig04-04.png)

Hình 4-14. Array Three-dimensional

Expression `arr3d[1]` chỉ row thứ hai, là pointer đến array two-dimensional có hai row, bốn column. Expression `arr3d[1][0]` chỉ row thứ hai, column đầu, là pointer đến array one-dimensional kích thước 5.

## Cấp phát động array Two-Dimensional

Cấp memory động cho array two-dimensional liên quan một số vấn đề:

- Các element có cần liên tục không

- Array có jagged không

Memory được cấp liên tục khi khai báo array two-dimensional như sau:

```
int matrix[2][5] = {{1,2,3,4,5},{6,7,8,9,10}};
```

Tuy nhiên, khi dùng function như `malloc` tạo array two-dimensional, có nhiều cách cấp memory. Vì có thể coi array two-dimensional là array của array, không có lý do các array “bên trong” phải liên tục. Khi dùng array subscript, tính không liên tục được xử lý trong suốt.

![image](images/ch04/fig04-01.png)

Liên tục hay không ảnh hưởng operation khác như copy block memory. Nếu không liên tục, có thể phải copy nhiều lần.

### Cấp memory có thể không liên tục

Sau đây là cách cấp array two-dimensional không bảo đảm memory liên tục. Trước tiên cấp array “bên ngoài”, rồi từng row bằng câu `malloc` riêng:

```
int rows = 2;
int columns = 5;
```

```
int **matrix = (int **) malloc(rows * sizeof(int *));
```

```
for (int i = 0; i < rows; i++) {
    matrix[i] = (int *) malloc(columns * sizeof(int));
}
```

Vì dùng các lời gọi `malloc` riêng, không bảo đảm memory liên tục. Hình 4-15 minh họa.

![image](images/ch04/fig04-16.png)

Hình 4-15. Allocation không liên tục

Allocation thực tùy heap manager và trạng thái heap. Nó vẫn có thể liên tục.

### Cấp memory liên tục

Trình bày hai cách cấp memory liên tục cho array two-dimensional. Cách đầu cấp array “bên ngoài”, rồi toàn bộ memory cho các row. Cách hai cấp toàn bộ memory một lần.

Chuỗi sau minh họa cách đầu. `malloc` thứ nhất cấp array pointer đến integer, mỗi element giữ pointer đến row. Đây là block ở address 500 trong Hình 4-16. `malloc` thứ hai cấp memory cho toàn element tại 600. Trong loop `for`, mỗi element array đầu được gán một phần memory do `malloc` thứ hai cấp:

```
int rows = 2;
int columns = 5;
int **matrix = (int **) malloc(rows * sizeof(int *));
matrix[0] = (int *) malloc(rows * columns * sizeof(int));
for (int i = 1; i < rows; i++)
    matrix[i] = matrix[0] + i * columns;
```

![image](images/ch04/fig04-17.png)

Hình 4-16. Cấp liên tục bằng hai lời gọi malloc

Về kỹ thuật, memory cho array đầu có thể tách khỏi memory cho “thân” array. Tuy nhiên thân được cấp một vùng liên tục.

Cách hai sau cấp toàn memory cho array cùng lúc:

```
int *matrix = (int *)malloc(rows * columns * sizeof(int));
```

Hình 4-17 minh họa allocation.

![image](images/ch04/fig04-18.png)

Hình 4-17. Cấp liên tục bằng một lời gọi malloc

Khi tham chiếu array sau đó, không dùng được array subscript. Thay vào đó phải tính index thủ công như chuỗi sau. Mỗi element được khởi tạo bằng tích các index:

```
for (int i = 0; i < rows; i++) {
    for (int j = 0; j < columns; j++) {
        *(matrix + (i*columns) + j) = i*j;
    }
}
```

Không dùng subscript được vì đã mất thông tin hình dạng compiler cần. Khái niệm được giải thích trong “Truyền multidimensional array” trang 96.

Cách này ít dùng thực tế, nhưng minh họa quan hệ giữa khái niệm array two-dimensional và tính one-dimensional của main memory. Notation array two-dimensional thuận tiện hơn làm ánh xạ trong suốt và dễ dùng.

Đã minh họa hai cách tổng quát cấp memory liên tục cho array two-dimensional. Chọn cách tùy nhu cầu application. Tuy nhiên, cách cuối tạo một block duy nhất cho “toàn bộ” array.

## Jagged array và pointer

Jagged array là array two-dimensional có số column khác nhau mỗi row. Hình 4-18 minh họa về khái niệm: ba row với số column thay đổi.

![image](images/ch04/fig04-19.png)

Hình 4-18. Jagged array

Trước khi học tạo array như vậy, xét array two-dimensional tạo bằng compound literal. Compound literal là cấu trúc C trông như cast operator theo sau là initializer list trong ngoặc nhọn. Sau đây là ví dụ cho constant integer và array integer, dùng như phần declaration:

```
(const int) {100}
(int[3]) {10, 20, 30}
```

Declaration sau tạo array `arr1` bằng cách khai báo array pointer đến integer rồi khởi tạo bằng block statement gồm compound literal:

```
int (*(arr1[])) = {
    (int[]) {0, 1, 2},
    (int[]) {3, 4, 5},
    (int[]) {6, 7, 8}};
```

Array có ba row và ba column. Element khởi tạo từ 0 đến 8 theo thứ tự row column. Hình 4-19 mô tả bố trí memory.

![image](images/ch04/fig04-20.png)

Hình 4-19. Array Two-dimensional

Chuỗi sau hiển thị address và giá trị từng element:

```
for(int j=0; j<3; j++) {
    for(int i=0; i<3; i++) {
        printf("arr1[%d][%d]  Address: %p  Value: %d\n",
                j, i, &arr1[j][i], arr1[j][i]);
    }
    printf("\n");
}
```

Khi chạy, nhận output:

```
arr1[0][0]  Address: 0x100  Value: 0
arr1[0][1]  Address: 0x104  Value: 1
arr1[0][2]  Address: 0x108  Value: 2

arr1[1][0]  Address: 0x112  Value: 3
arr1[1][1]  Address: 0x116  Value: 4
arr1[1][2]  Address: 0x120  Value: 5

arr1[2][0]  Address: 0x124  Value: 6
arr1[2][1]  Address: 0x128  Value: 7
arr1[2][2]  Address: 0x132  Value: 8
```

Có thể sửa nhẹ declaration để tạo jagged array như Hình 4-18. Declaration như sau:

```
int (*(arr2[])) = {
    (int[]) {0, 1, 2, 3},
    (int[]) {4, 5},
    (int[]) {6, 7, 8}};
```

Dùng ba compound literal khai báo jagged array. Element được khởi tạo theo row-column từ zero. Chuỗi tiếp hiển thị array để xác nhận đã tạo. Cần ba loop `for` vì mỗi row có số column khác nhau:

```
int row = 0;
for(int i=0; i<4; i++) {
    printf("layer1[%d][%d]  Address: %p  Value: %d\n",
            row, i, &arr2[row][i], arr2[row][i]);
}
printf("\n");

row = 1;
for(int i=0; i<2; i++) {
    printf("layer1[%d][%d]  Address: %p  Value: %d\n",
            row, i, &arr2[row][i], arr2[row][i]);
}
printf("\n");

row = 2;
for(int i=0; i<3; i++) {
    printf("layer1[%d][%d]  Address: %p  Value: %d\n",
            row, i, &arr2[row][i], arr2[row][i]);
}
printf("\n");
```

Output của chuỗi như sau:

```
arr2[0][0]  Address: 0x000100  Value: 0
arr2[0][1]  Address: 0x000104  Value: 1
arr2[0][2]  Address: 0x000108  Value: 2
arr2[0][3]  Address: 0x000112  Value: 3

arr2[1][0]  Address: 0x000116  Value: 4
arr2[1][1]  Address: 0x000120  Value: 5

arr2[2][0]  Address: 0x000124  Value: 6
arr2[2][1]  Address: 0x000128  Value: 7
arr2[2][2]  Address: 0x000132  Value: 8
```

Hình 4-20 mô tả bố trí memory.

![image](images/ch04/fig04-21.png)

Hình 4-20. Memory allocation của jagged array

Các ví dụ dùng array notation thay pointer notation khi truy cập nội dung, giúp dễ nhìn và hiểu hơn phần nào. Tuy nhiên, pointer notation cũng hoạt động.

Compound literal hữu ích để tạo jagged array. Tuy nhiên, truy cập element có thể vụng về, như ba for loop trước. Có thể đơn giản hóa bằng array riêng giữ kích thước từng column. Dù tạo jagged array trong C được, công sức có thể không đáng.

## Tóm tắt

Chúng ta ôn nhanh array rồi xét giống và khác giữa array notation và pointer notation. Có thể tạo array bằng function kiểu `malloc`, linh hoạt hơn declaration truyền thống. Đã thấy cách dùng `realloc` thay đổi lượng memory cấp cho array.

Cấp memory động cho array có thể khó. Với array từ hai chiều, phải cẩn thận bảo đảm cấp trong memory liên tục.

Cũng đã tìm hiểu vấn đề khi truyền và trả array. Thường phải truyền kích thước cho function để xử lý đúng. Ngoài ra, đã xem cách tạo jagged array trong C.
