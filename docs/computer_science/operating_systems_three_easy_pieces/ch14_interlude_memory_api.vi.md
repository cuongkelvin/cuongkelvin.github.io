# 14 Phần xen kẽ: Memory API

Trong phần xen kẽ này, ta thảo luận các interface cấp phát memory trong hệ thống UNIX. Các interface được cung cấp khá đơn giản, nên chương này ngắn và đi thẳng vào vấn đề[^1]. Vấn đề chính ta giải quyết là:

> MẤU CHỐT: CẤP PHÁT VÀ QUẢN LÝ MEMORY THẾ NÀO
>
> Trong chương trình UNIX/C, hiểu cách cấp phát và quản lý memory rất quan trọng để xây software vững chắc, tin cậy. Interface nào thường dùng? Nên tránh lỗi gì?

## 14.1 Các loại memory

Khi chạy chương trình C, hai loại memory được cấp phát. Đầu tiên là stack memory, việc cấp phát và giải phóng được compiler quản lý ngầm thay cho bạn, lập trình viên; vì vậy đôi khi gọi là automatic memory.

Khai báo memory trên stack trong C rất dễ. Ví dụ, giả sử bạn cần một ít không gian trong function func() cho một integer tên x. Để khai báo vùng memory đó, chỉ cần làm như sau:

```
void func() {
    int x; // declares an integer on the stack
    ...
}
```

Compiler làm phần còn lại, bảo đảm có chỗ trên stack khi gọi func(). Khi return, compiler giải phóng memory; vì vậy, nếu muốn thông tin tồn tại sau lần gọi, đừng để nó trên stack.

Nhu cầu memory long-lived dẫn đến loại thứ hai, heap memory, nơi bạn, lập trình viên, xử lý tường minh mọi cấp phát và giải phóng. Trách nhiệm nặng nề, chắc chắn! Và gây nhiều bug. Nhưng nếu cẩn thận, chú ý, bạn sẽ dùng đúng interface mà không quá rắc rối. Đây là ví dụ có thể cấp phát pointer đến integer trên heap như thế nào:

```
void func() {
    int *x = (int *) malloc(sizeof(int));
    ...
}
```

Có vài lưu ý về đoạn code nhỏ. Trước hết, cả cấp phát stack lẫn heap xảy ra trên dòng này: compiler biết cần chỗ cho pointer đến integer khi thấy khai báo (int *x); sau đó khi chương trình gọi malloc(), nó yêu cầu chỗ cho integer trên heap; routine trả address integer (nếu thành công, hoặc NULL nếu lỗi), address được lưu trên stack để chương trình dùng.

Do tính tường minh và cách dùng đa dạng hơn, heap memory đặt nhiều thách thức hơn cho cả người dùng lẫn hệ thống. Vì vậy, phần còn lại tập trung vào nó.

## 14.2 Lời gọi malloc()

malloc() khá đơn giản: truyền size để yêu cầu chỗ trên heap, nó thành công và trả pointer đến vùng newly-allocated, hoặc thất bại trả NULL[^2].

Manual page cho biết bạn cần làm gì để dùng malloc; gõ man malloc tại command line và bạn sẽ thấy:

```
#include <stdlib.h>
...
void *malloc(size_t size);
```

Từ đó thấy chỉ cần include header file stdlib.h để dùng malloc. Thực ra thậm chí không thật sự cần làm vậy, vì thư viện C mà mọi chương trình C link mặc định chứa code malloc(); thêm header chỉ giúp compiler kiểm tra gọi đúng (như số lượng argument và type đúng).

Parameter duy nhất malloc() nhận có type size_t, mô tả số byte cần. Tuy nhiên phần lớn lập trình viên không gõ số trực tiếp (như 10); làm vậy bị coi là thói quen kém. Thay vào đó dùng các routine và macro. Ví dụ, cấp phát cho giá trị floating point double-precision như sau:

```
double *d = (double *) malloc(sizeof(double));
```

> MẸO: KHI NGHI NGỜ, HÃY THỬ
>
> Nếu không chắc routine hoặc operator mình đang dùng hoạt động thế nào, không gì thay thế được việc thử trực tiếp và bảo đảm nó hoạt động như mong đợi. Đọc manual page hay tài liệu khác hữu ích, nhưng hoạt động thực tế mới là điều quan trọng. Hãy viết code và kiểm tra! Đó chắc chắn là cách tốt nhất bảo đảm code hoạt động như bạn muốn. Thực ra, ta đã làm vậy để double-check rằng những điều ta nói về sizeof() thực sự đúng!

Chà, thật nhiều double-ing! Lần gọi malloc() này dùng operator sizeof() yêu cầu đúng lượng chỗ; trong C, nó thường được xem là operator compile-time, nghĩa là size thực biết lúc compile nên một số (ở đây 8, cho double) được thay vào argument malloc(). Vì vậy sizeof() đúng là operator, không phải function call (function call diễn ra lúc run time).

Cũng có thể truyền tên variable (không chỉ type) vào sizeof(), nhưng một số trường hợp không cho kết quả mong muốn, nên cẩn thận. Ví dụ đoạn code sau:

```
int *x = malloc(10 * sizeof(int));
printf("%d\n", sizeof(x));
```

Dòng đầu khai báo chỗ cho array 10 integer, hoàn toàn ổn. Nhưng sizeof() dòng sau trả giá trị nhỏ như 4 (máy 32-bit) hoặc 8 (máy 64-bit). Vì ở đây sizeof() nghĩ ta chỉ hỏi pointer đến integer lớn bao nhiêu, không phải lượng memory cấp phát động. Tuy nhiên, đôi khi sizeof() hoạt động như kỳ vọng:

```
int x[10];
printf("%d\n", sizeof(x));
```

Ở đây compiler có đủ thông tin static để biết đã cấp phát 40 byte.

Một chỗ khác cần cẩn thận là string. Khi khai báo không gian cho string, dùng mẫu malloc(strlen(s) + 1): lấy chiều dài string bằng function strlen(), rồi cộng 1 để dành chỗ cho ký tự end-of-string. Dùng sizeof() ở đây có thể gây rắc rối.

Bạn cũng có thể nhận thấy malloc() trả pointer đến type void. Trong C, đó là cách trả address để lập trình viên quyết định làm gì. Lập trình viên hỗ trợ thêm bằng cast; ví dụ trên cast return type malloc() thành pointer đến double. Cast thực ra không làm gì ngoài nói với compiler và người đọc code: “đúng, tôi biết mình đang làm gì.” Cast kết quả malloc() chỉ tạo sự yên tâm; không cần cho tính đúng.

## 14.3 Lời gọi free()

Hóa ra cấp phát memory là phần dễ; biết khi nào, bằng cách nào và thậm chí có nên free memory mới khó. Để free heap memory không còn dùng, chỉ gọi free():

```
int *x = malloc(10 * sizeof(int));
...
free(x);
```

Routine nhận một argument là pointer do malloc() trả về. Vì vậy size vùng cấp phát không do người dùng truyền vào, mà thư viện memory-allocation phải tự theo dõi.

## 14.4 Lỗi thường gặp

Có nhiều lỗi thường gặp khi dùng malloc() và free(). Đây là những lỗi ta thấy lặp lại khi dạy operating system đại học. Mọi ví dụ đều compile và chạy mà compiler không phàn nàn; compile chương trình C là cần để xây chương trình đúng nhưng còn lâu mới đủ, như bạn sẽ học (thường qua trải nghiệm đau đớn).

Thực ra, quản lý memory đúng khó đến mức nhiều ngôn ngữ mới hỗ trợ automatic memory management. Trong đó, dù gọi thứ như malloc() để cấp phát (thường new hay tương tự để cấp object), không bao giờ phải gọi để free; garbage collector chạy, xác định memory bạn không còn tham chiếu và giải phóng thay.

### Quên cấp phát memory

Nhiều routine đòi hỏi cấp phát memory trước khi gọi. Ví dụ strcpy(dst, src) sao chép string từ source pointer đến destination pointer. Nhưng nếu không cẩn thận, có thể làm như sau:

```
char *src = "hello";
char *dst;        // oops! unallocated
strcpy(dst, src); // segfault and die
```

Chạy code này có thể dẫn đến segmentation fault[^3], cách gọi cầu kỳ của BẠN LÀM SAI VỚI MEMORY RỒI ĐỒ LẬP TRÌNH VIÊN NGỐC NGHẾCH VÀ TÔI ĐANG TỨC GIẬN.

> MẸO: COMPILE ĐƯỢC HOẶC CHẠY ĐƯỢC 6= ĐÚNG Việc chương trình compile(!) hoặc thậm chí chạy đúng một hay nhiều lần không có nghĩa nó đúng. Nhiều sự kiện có thể phối hợp khiến bạn tin nó chạy, rồi điều gì thay đổi và nó ngừng hoạt động. Sinh viên thường nói (hoặc hét) “Nhưng trước đó chạy được!” rồi đổ lỗi compiler, operating system, hardware hay thậm chí (dám nói không) giáo sư. Nhưng vấn đề thường đúng chỗ bạn nghĩ: code của bạn. Hãy bắt tay debug trước khi đổ lỗi các thành phần khác.

Ở đây code đúng có thể là:

```
char *src = "hello";
char *dst = (char *) malloc(strlen(src) + 1);
strcpy(dst, src); // work properly
```

Hoặc dùng strdup() để dễ hơn nữa. Đọc man page strdup để biết thêm.

### Cấp phát không đủ memory

Lỗi liên quan là cấp phát không đủ memory, đôi khi gọi là buffer overflow. Trong ví dụ trên, lỗi thường là tạo chỗ gần đủ cho destination buffer.

```
char *src = "hello";
char *dst = (char *) malloc(strlen(src)); // too small!
strcpy(dst, src); // work properly
```

Lạ là tùy triển khai malloc và nhiều chi tiết khác, chương trình thường có vẻ chạy đúng. Đôi khi string copy ghi vượt một byte khỏi vùng cấp phát nhưng vô hại, có thể ghi đè variable không còn dùng. Có trường hợp overflow cực kỳ có hại, thực ra là nguồn nhiều lỗ hổng security [W06]. Trường hợp khác, thư viện malloc đã cấp dư một chút nên chương trình không ghi bừa lên variable khác và chạy tốt. Có trường hợp nữa chương trình thực sự fault và crash. Qua đó học bài học giá trị: chạy đúng một lần không có nghĩa là đúng.

### Quên khởi tạo memory đã cấp phát

Với lỗi này, gọi malloc() đúng nhưng quên điền giá trị vào data type newly-allocated. Đừng làm vậy! Nếu quên, cuối cùng chương trình gặp uninitialized read, đọc dữ liệu không rõ giá trị từ heap. Ai biết có gì trong đó? May mắn thì giá trị vẫn cho chương trình chạy (như không). Không may thì ngẫu nhiên và có hại.

### Quên free memory

Lỗi phổ biến khác là memory leak, xảy ra khi quên free. Với ứng dụng hay hệ thống long-running (như chính OS), đây là vấn đề lớn, vì leak dần dẫn đến hết memory và phải restart. Vì vậy khi dùng xong chunk memory, nên bảo đảm free. Lưu ý ngôn ngữ garbage-collected không giúp ở đây: nếu vẫn tham chiếu chunk memory, không garbage collector nào free, nên memory leak vẫn tồn tại trong ngôn ngữ hiện đại.

Đôi khi không gọi free() có vẻ hợp lý. Ví dụ chương trình short-lived sớm thoát; khi process chết, OS dọn mọi page đã cấp nên không thực sự leak. Dù chắc chắn “hoạt động” (xem phần thêm trang 7), đó có lẽ là thói quen xấu, nên cẩn thận khi chọn. Về lâu dài, mục tiêu lập trình viên là tạo thói quen tốt; một trong đó là hiểu cách quản lý memory và (với C) free block đã cấp. Dù có thể không làm mà vẫn ổn, nên tập free từng byte cấp phát tường minh.

### Free memory trước khi dùng xong

Đôi khi chương trình free memory trước khi dùng xong; lỗi gọi là dangling pointer, và như đoán được cũng xấu. Dùng sau đó có thể crash hoặc ghi đè memory hợp lệ (ví dụ gọi free() rồi malloc() cấp thứ khác, dùng lại memory errantly-freed).

### Free memory lặp lại

Đôi khi program free cùng một vùng memory hơn một lần, gọi là double free. Kết quả của việc này là undefined. Như bạn có thể hình dung, library memory-allocation có thể bị rối và làm đủ chuyện kỳ lạ; crash là kết quả thường gặp.

Gọi free() không đúng cách. Vấn đề cuối ta bàn là gọi free() sai. Rốt cuộc, free() chỉ mong bạn truyền vào một trong những pointer đã nhận từ malloc() trước đó. Khi truyền giá trị khác, những chuyện xấu có thể (và thực sự) xảy ra. Vì vậy, invalid free nguy hiểm và dĩ nhiên cũng cần tránh.

> THÔNG TIN THÊM: VÌ SAO KHÔNG LEAK MEMORY KHI PROCESS THOÁT
>
> Khi viết chương trình short-lived, có thể cấp phát bằng malloc(). Chương trình chạy và sắp xong: có cần gọi free() nhiều lần ngay trước khi thoát? Dù không gọi có vẻ sai, thực sự không memory nào bị “mất”. Lý do đơn giản: hệ thống có hai mức quản lý memory. Đầu tiên là OS, cấp memory khi process chạy và thu lại khi thoát (hoặc chết theo cách khác). Thứ hai là bên trong mỗi process, ví dụ heap khi gọi malloc() và free(). Dù không gọi free() (nên leak trong heap), operating system thu toàn memory process (gồm page code, stack và heap liên quan ở đây) khi chương trình chạy xong. Bất kể trạng thái heap trong address space, OS thu mọi page khi process chết, bảo đảm không memory nào mất dù không free. Vì vậy, chương trình short-lived leak thường không gây vấn đề vận hành (dù bị xem là thói quen kém). Khi viết server long-running (như web server hoặc database management system không bao giờ thoát), memory leak lớn hơn nhiều, cuối cùng crash khi ứng dụng hết memory. Và tất nhiên leak còn nghiêm trọng hơn trong một chương trình đặc biệt: chính operating system. Lại cho thấy người viết kernel code có công việc khó nhất...

### Tóm tắt

Như thấy, có nhiều cách dùng sai memory. Vì lỗi memory thường xuyên, cả hệ sinh thái công cụ phát triển để tìm vấn đề trong code. Xem purify [HJ92] và valgrind [SN05]; cả hai giúp định vị nguồn vấn đề memory-related rất tốt. Khi quen công cụ mạnh này, bạn sẽ tự hỏi từng sống sót thế nào khi thiếu chúng.

## 14.5 Hỗ trợ OS bên dưới

Có thể bạn nhận thấy ta chưa nói system call khi thảo luận malloc() và free(). Lý do đơn giản: chúng là library call, không phải system call. Thư viện malloc quản lý chỗ trong virtual address space, nhưng xây trên một số system call gọi OS yêu cầu thêm memory hoặc trả lại một phần cho hệ thống.

Một system call là brk, dùng đổi vị trí program break: điểm cuối heap. Nó nhận một argument (address break mới), tăng hoặc giảm size heap tùy break mới lớn hay nhỏ hơn hiện tại. Lời gọi sbrk bổ sung nhận increment, còn lại có mục đích tương tự.

Lưu ý bạn không bao giờ nên gọi trực tiếp brk hay sbrk. Library memory-allocation sử dụng chúng; nếu bạn cố dùng, rất có thể sẽ khiến điều gì đó sai hỏng (nghiêm trọng). Thay vào đó, hãy dùng malloc() và free().

Cuối cùng, có thể nhận memory từ operating system qua mmap(). Truyền đúng argument, mmap() tạo anonymous memory region trong chương trình — vùng không gắn file cụ thể mà gắn swap space, thứ sẽ thảo luận kỹ sau về virtual memory. Memory này cũng có thể xem và quản lý như heap. Đọc manual page mmap() để biết thêm.

## 14.6 Lời gọi khác

Library memory-allocation hỗ trợ một vài lời gọi khác. Ví dụ, calloc() cấp phát memory và điền zero vào đó trước khi trả về; điều này tránh một số lỗi khi bạn giả định memory đã được điền zero nên quên tự khởi tạo (xem đoạn “uninitialized read” bên trên). Routine realloc() cũng hữu ích khi bạn đã cấp phát không gian cho thứ gì đó (chẳng hạn array), rồi cần thêm phần tử: realloc() tạo vùng memory mới lớn hơn, copy vùng cũ vào đó và trả pointer tới vùng mới.

## 14.7 Tóm tắt

Ta đã giới thiệu một số API liên quan cấp phát memory. Như thường lệ, ta mới trình bày kiến thức cơ bản; có thể tìm thêm chi tiết ở nơi khác. Đọc sách C [KR88] và Stevens [SR05] (Chương 7) để biết thêm. Để xem một bài báo hiện đại thú vị về tự động phát hiện và sửa nhiều vấn đề này, đọc Novark và cộng sự [N+07]; bài báo cũng tổng kết tốt các vấn đề thường gặp và một số ý tưởng hay để tìm và sửa chúng.

## Tài liệu tham khảo

[HJ92] Purify: Fast Detection of Memory Leaks and Access Errors

R. Hastings and B. Joyce

USENIX Winter ’92

Bài báo đằng sau công cụ Purify hay, nay là sản phẩm thương mại.

[KR88] “The C Programming Language”

Brian Kernighan and Dennis Ritchie

Prentice-Hall 1988

Sách C, do người phát triển C viết. Đọc một lần, lập trình một chút rồi đọc lại, giữ gần bàn hay nơi lập trình.

[N+07] “Exterminator: Automatically Correcting Memory Errors with High Probability” Gene Novark, Emery D. Berger, and Benjamin G. Zorn

PLDI 2007

Bài hay về tự tìm và sửa lỗi memory, cùng tổng quan tốt nhiều lỗi phổ biến trong chương trình C và C++.

[SN05] “Using Valgrind to Detect Undefined Value Errors with Bit-precision”

J. Seward and N. Nethercote

USENIX ’05

Cách dùng valgrind tìm một số loại lỗi.

[SR05] “Advanced Programming in the UNIX Environment”

W. Richard Stevens and Stephen A. Rago

Addison-Wesley, 2005

Đã nói rồi, ta nói lại: đọc sách nhiều lần và dùng tham khảo bất cứ khi nào nghi ngờ. Tác giả luôn ngạc nhiên vì mỗi lần đọc lại học điều mới, dù sau nhiều năm lập trình C.

[W06] “Survey on Buffer Overflow Attacks and Countermeasures”

Tim Werthman

Có tại: www.nds.rub.de/lehre/seminar/SS06/Werthmann_BufferOverflow.pdf

Khảo sát tốt về buffer overflow và vấn đề security gây ra, tham chiếu nhiều exploit nổi tiếng.

## Bài tập về nhà (Code)

Bài này giúp làm quen cấp phát memory. Đầu tiên viết chương trình có bug (thú vị!). Sau đó dùng công cụ tìm bug đã chèn. Rồi nhận ra công cụ tuyệt thế nào và dùng sau này, khiến bạn vui và năng suất hơn.

Công cụ đầu tiên bạn dùng là debugger gdb. Có rất nhiều điều cần học về debugger này; ở đây ta chỉ mới tìm hiểu những điều cơ bản nhất.

Công cụ thứ hai là valgrind [SN05], giúp tìm memory leak và vấn đề memory hiểm hóc. Nếu chưa cài, đến website và cài:

```
http://valgrind.org/downloads/current.html
```

### Câu hỏi

1. Đầu tiên viết chương trình null.c đơn giản tạo pointer đến integer, đặt NULL rồi thử dereference. Compile thành executable null. Chuyện gì xảy ra khi chạy?

2. Tiếp theo compile với symbol information (flag -g), thêm thông tin vào executable để debugger truy cập thông tin hữu ích hơn về tên variable và tương tự. Chạy dưới debugger bằng gdb null, rồi khi gdb chạy, gõ run. gdb cho thấy gì?

3. Cuối cùng dùng valgrind trên chương trình. Ta dùng memcheck, phần của valgrind, để phân tích. Gõ valgrind --leak-check=yes null. Điều gì xảy ra? Bạn giải thích được đầu ra không?

4. Viết chương trình đơn giản malloc() memory nhưng quên free trước khi thoát. Chuyện gì xảy ra khi chạy? Dùng gdb tìm vấn đề được không? Còn valgrind (lại với flag --leak-check=yes)?

5. Viết chương trình tạo integer array data size 100 bằng malloc; rồi đặt data[100] bằng không. Chuyện gì xảy ra khi chạy? Khi dùng valgrind thì sao? Chương trình đúng không?

6. Tạo program cấp phát một array integer (như trên), giải phóng nó, rồi thử in giá trị của một phần tử trong array. Program có chạy được không? Điều gì xảy ra khi dùng valgrind với nó?

7. Truyền giá trị lạ cho free (như pointer giữa array đã cấp). Chuyện gì xảy ra? Có cần công cụ tìm lỗi này không?

8. Thử một số interface cấp phát memory khác. Ví dụ, tạo data structure vector-like đơn giản cùng các routine liên quan dùng realloc() để quản lý vector. Dùng array lưu các phần tử của vector; khi user thêm entry vào vector, dùng realloc() cấp phát thêm không gian. Vector như vậy có hiệu năng thế nào? So với linked list thì sao? Dùng valgrind hỗ trợ tìm bug.

9. Dành thêm thời gian đọc cách dùng gdb và valgrind. Biết công cụ rất quan trọng; hãy dành thời gian học để thành chuyên gia debug trong môi trường UNIX và C.

---

[^1]: Thực ra hy vọng mọi chương đều thế! Nhưng chương này ngắn và đi thẳng vấn đề hơn, theo chúng tôi.

[^2]: Lưu ý NULL trong C không đặc biệt, chỉ là macro cho giá trị không.

[^3]: Dù nghe bí ẩn, bạn sẽ sớm hiểu vì sao truy cập memory không hợp lệ gọi là segmentation fault; nếu thế chưa đủ khuyến khích đọc tiếp thì còn gì?
