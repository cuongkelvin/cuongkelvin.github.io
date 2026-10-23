# Chương 6. Thơ ca chuyển động: Runtime data structure

\#41: Tàu Enterprise gặp Thượng đế, và đó là một đứa trẻ, một computer hoặc một chương trình C.

\#42: Trong lúc dũng cảm tiến tới nơi gần đây mới chỉ có vài người đặt chân đến, computer của Enterprise bị một life-form ngoài hành tinh đầy quyền năng, có hình dạng giống con người đến kinh ngạc, khống chế.

\#43: Các Trekker gặp một trí tuệ computer thù địch và lạm dụng triết học hoặc logic để khiến nó self-destruct.

\#44: Các Trekker gặp một nền văn minh giống một xã hội trước đây trên Trái Đất đến mức kỳ lạ.

\#45: Một căn bệnh khiến một hoặc nhiều thành viên phi hành đoàn già đi nhanh chóng. Cũng có phiên bản ngược lại: các thành viên chủ chốt trở về tuổi thơ, về thể chất, tinh thần hoặc cả hai.

\#46: Một sinh vật ngoài hành tinh xâm nhập cơ thể một Trekker và chiếm quyền điều khiển. Vẫn đang chờ xem phiên bản ngược lại của tình huống này… #47: Thuyền trưởng vi phạm Chỉ thị Tối cao, sau đó hoặc khiến Enterprise lâm nguy, hoặc có quan hệ tình cảm với một người ngoài hành tinh hấp dẫn, hoặc cả hai, trong lúc cố khắc phục tình hình.

\#48: Cuối cùng, thuyền trưởng đem lại hòa bình cho hai xã hội nguyên thủy đang giao chiến ("chúng tôi đến trong hòa bình, bắn để giết") trên một thế giới gợi nhớ đến Trái Đất một cách kỳ lạ.

—Sách của Giáo sư Snopes về những cốt truyện Star Trek kinh điển và công thức chế biến khoai ngon

a.out và những giai thoại về a.out…segment…OS làm gì với a.out của bạn…C runtime làm gì với a.out của bạn…điều gì xảy ra khi gọi một function: procedure activation record…những công cụ C hữu ích…giải trí nhẹ nhàng — câu đố lập trình Princeton

Một trong những sự phân chia kinh điển trong lý thuyết ngôn ngữ lập trình là phân biệt code với dữ liệu. Một số ngôn ngữ, như LISP, hợp nhất hai yếu tố này; những ngôn ngữ khác, như C, thường duy trì sự tách biệt. Internet worm được mô tả trong Chương 2 khó hiểu vì cách tấn công của nó dựa trên việc biến dữ liệu thành code. Sự phân biệt giữa code và dữ liệu cũng có thể được phân tích như sự phân chia giữa compiletime và runtime. Phần lớn công việc của compiler liên quan đến dịch code; phần lớn việc quản lý vùng lưu trữ dữ liệu cần thiết diễn ra tại runtime. Chương này mô tả những data structure ẩn của runtime system.

Có ba lý do để tìm hiểu runtime system:

- Nó giúp bạn tinh chỉnh code để đạt hiệu năng cao nhất.

- Nó giúp bạn hiểu những nội dung nâng cao hơn.

- Nó giúp bạn chẩn đoán vấn đề dễ dàng hơn khi gặp trục trặc.

## `a.out` và giai thoại `a.out`

Bạn đã bao giờ thắc mắc tên "a.out" được chọn như thế nào chưa? Việc mọi output file đều mặc định mang cùng tên a.out có thể gây bất tiện, vì bạn có thể quên nó được tạo từ source file nào và sẽ ghi đè nó trong lần compilation tiếp theo của bất kỳ file nào. Phần lớn mọi người có ấn tượng mơ hồ rằng tên này bắt nguồn từ truyền thống ngắn gọn của UNIX, còn "a" là chữ cái đầu tiên trong bảng chữ cái nên cũng là chữ đầu tiên bạn gõ khi đặt filename mới. Thực ra, nó chẳng liên quan gì đến những điều đó.

Đó là viết tắt của "assembler output"! Manpage BSD cũ thậm chí còn gợi ý điều này:

```
NAME
    a.out - assembler and link editor output format
```

Chỉ có một vấn đề: nó không phải output của assembler, mà là output của linker!

Tên "assembler output" hoàn toàn có nguồn gốc lịch sử. Trên PDP-7, ngay cả trước khi có ngôn ngữ B, chưa có linker. Chương trình được tạo bằng cách ghép tất cả source file rồi assemble, và assembler output thu được được ghi vào a.out. Quy ước này vẫn được giữ cho output cuối cùng ngay cả sau khi linker được viết cho PDP-11; tên đó đã mang nghĩa "một chương trình mới sẵn sàng thử thực thi". Vì vậy, tên mặc định a.out là một ví dụ trong UNIX về kiểu "không có lý do chính đáng, nhưng chúng tôi vẫn luôn làm vậy"! Executable file trên UNIX cũng được đánh dấu theo cách đặc biệt để hệ thống nhận ra các thuộc tính riêng của chúng. Gắn nhãn hoặc tag dữ liệu quan trọng bằng một số duy nhất xác định đó là gì là một kỹ thuật lập trình phổ biến. Số dùng làm nhãn thường được gọi là "magic number"; nó ban cho khả năng bí ẩn là nhận diện một tập hợp các bit ngẫu nhiên. Chẳng hạn, superblock, data structure nền tảng của UNIX filesystem, được gắn magic number sau:

```
#define FS_MAGIC 0x011954
```

Con số strange-looking đó không hoàn toàn ngẫu nhiên. Nó là ngày sinh của Kirk McKusick. Kirk, người triển khai Berkeley fast file system, đã viết code này vào cuối thập niên 1970; nhưng magic number hữu ích đến mức con số đó vẫn còn trong source base ngày nay, trong file `sys/fs/ufs_fs.h`. Nó không chỉ nâng cao độ tin cậy của file system, mà còn khiến mọi file system hacker giờ đều biết phải gửi thiệp sinh nhật cho Kirk vào ngày 19 tháng 1.

Các file a.out cũng có một magic number tương tự. Trước bản UNIX System V của AT\&T, a.out được nhận diện bằng magic number 0407 tại offset 0. Vậy tại sao 0407 được chọn làm "magic number" nhận diện UNIX object file? Đó là opcode của một unconditional branch instruction, tương đối với program counter, trên PDP-11! Nếu chạy trên PDP-11 hoặc VAX ở compatibility mode, bạn có thể bắt đầu thực thi ngay từ word đầu tiên của file, và magic number nằm tại đó sẽ chuyển điều khiển vượt qua a.out header tới instruction thực thi thực sự đầu tiên của chương trình. PDP-11 là máy UNIX tiêu biểu vào thời điểm a.out cần magic number. Trong SVr4, executable được đánh dấu bằng byte đầu tiên mang giá trị hex `7F`, theo sau là các chữ "ELF" tại byte 2, 3 và 4 của file.

## Segment

Object file và executable có thể dùng một trong nhiều định dạng khác nhau. Trên phần lớn implementation SVr4, định dạng đó được gọi là ELF, ban đầu là "Extensible Linker Format", nay là "Executable and Linking Format". Trên các hệ thống khác, executable format là COFF (Common Object-File Format). Còn trên BSD UNIX, cũng giống như Đức Phật có Buddha-nature, file a.out có định dạng a.out. Bạn có thể tìm hiểu thêm định dạng được dùng trên một hệ thống UNIX bằng cách gõ `man` `a.out` và đọc manpage.

Tất cả những định dạng khác nhau này đều có chung khái niệm segment. Chúng ta sẽ nói nhiều hơn về segment ở phần sau, nhưng đối với object file, chúng chỉ là những vùng trong binary file chứa toàn bộ thông tin thuộc một loại cụ thể, chẳng hạn các entry của symbol table. Thuật ngữ section cũng được dùng rộng rãi; section là đơn vị tổ chức nhỏ nhất trong ELF file. Một segment thường chứa nhiều section.

Đừng nhầm khái niệm segment trên UNIX với khái niệm segment trong kiến trúc Intel x86.

- Segment trên UNIX là một phần chứa những nội dung liên quan trong binary.

- Segment trong memory model của Intel x86 là kết quả của một thiết kế mà vì lý do tương thích, address space không đồng nhất mà được chia thành những vùng 64-Kbyte gọi là segment.

Chủ đề segment trên kiến trúc Intel x86 thực sự xứng đáng có một chương riêng. <sup>\[1\]</sup> Trong phần còn lại của sách, thuật ngữ segment mang nghĩa của UNIX, trừ khi có chỉ định khác.

<sup>\[1\]</sup> Và nó cũng gần như có một chương riêng đấy! Hãy xem chương tiếp theo.

Khi chạy `size` trên một executable, bạn sẽ biết kích thước ba segment trong file, được gọi là text, data và bss:

```
% echo; echo "text data bss total" ; size a.out

text          data       bss         total
1548   +      4236    +  4004 =      9788
```

Size không in các tiêu đề, nên hãy dùng echo để tạo chúng.

Một cách khác để kiểm tra nội dung executable file là dùng các utility `nm` hoặc `dump`. Hãy compile source dưới đây và chạy `nm` trên a.out thu được.

```
        char pear[40];
static double peach;
        int mango = 13;
static long melon = 2001;

main () {
    int i=3, j, *ip;
    ip=malloc(sizeof(i));
    pear[5] = i;
    peach = 2.0*mango;
}
```

Một số trích đoạn output khi chạy `nm` được trình bày dưới đây; output đã được chỉnh sửa đôi chút để dễ đọc hơn:

```
% nm -sx a.out
Symbols from a.out:

[Index]   Value      Size  Type  Bind   Segment Name
...
[29]  |0x00020790|0x00000008|OBJT |LOCL |.bss peach
[42]  |0x0002079c|0x00000028|OBJT |GLOB |.bss pear
[43]  |0x000206f4|0x00000004|OBJT |GLOB |.data mango
[30]  |0x000206f8|0x00000004|OBJT |LOCL |.data melon
[36]  |0x00010628|0x00000058|FUNC |GLOB |.text main
[50]  |0x000206e4|0x00000038|FUNC |GLOB |UNDEF malloc
                    ...
```

Hình 6-1 cho biết compiler/linker đặt những gì trong từng segment:

Hình 6-1. Những loại câu lệnh C nào cuối cùng được đặt vào những segment nào?

![image](images/ch06/img06-01.png)

BSS segment được đặt tên từ chữ viết tắt của "Block Started by Symbol", một pseudo-op của assembler IBM 704 cũ được đưa sang UNIX và tồn tại ở đó từ bấy đến nay. Một số người thích ghi nhớ nó là "Better Save Space". Vì BSS segment chỉ chứa những variable chưa có giá trị, nó không thực sự cần lưu hình ảnh của chúng. Kích thước mà BSS cần tại runtime được ghi trong object file, nhưng khác với data segment, BSS không chiếm vùng lưu trữ thực tế trong object file.

### Thử thách lập trình

![image](images/ch06/img06-02.png)

Kiểm tra các segment trong một executable

1\. Compile chương trình "hello world", chạy `ls -l` trên executable để biết tổng kích thước và chạy `size` để biết kích thước các segment bên trong.

2\. Thêm declaration của một global array gồm 1000 int, compile lại và lặp lại các phép đo. Hãy chú ý những khác biệt.

3\. Bây giờ hãy thêm một giá trị ban đầu vào declaration của array; nhớ rằng trong initializer, C không buộc bạn cung cấp giá trị cho mọi phần tử của array. Việc này sẽ chuyển array từ BSS segment sang data segment. Lặp lại các phép đo và chú ý những khác biệt.

4\. Bây giờ hãy thêm declaration của một array lớn có phạm vi local trong một function. Khai báo một local array lớn thứ hai có initializer. Lặp lại các phép đo. Dữ liệu được định nghĩa local bên trong function có được lưu trong executable không? Có gì khác biệt giữa việc khởi tạo và không khởi tạo nó không?

5\. Kích thước file và segment thay đổi thế nào nếu bạn compile để debugging? Còn nếu compile với mức tối ưu cao nhất?

Hãy phân tích kết quả của "Thử thách lập trình" trên để tự kiểm chứng rằng:

- data segment được lưu trong object file;

- BSS segment không được lưu trong object file, ngoại trừ thông tin về kích thước cần thiết tại runtime;

- text segment là segment chịu ảnh hưởng nhiều nhất của việc tối ưu;

- kích thước file a.out chịu ảnh hưởng khi compile để debugging, nhưng các segment thì không.

## OS làm gì với `a.out`

Bây giờ ta thấy tại sao file a.out được tổ chức thành các segment. Các segment thuận tiện tương ứng với những object mà runtime linker có thể load trực tiếp! Loader chỉ cần lấy hình ảnh của từng segment trong file rồi đặt thẳng vào memory. Về cơ bản, các segment trở thành những vùng memory của chương trình đang thực thi, mỗi vùng có một mục đích riêng. Điều này được minh họa trong Hình 6-2.

Hình 6-2. Cách các segment của executable được bố trí trong memory

![image](images/ch06/img06-03.png)

Text segment chứa những instruction của chương trình. Loader chép trực tiếp chúng từ file vào memory, thường bằng system call `mmap()`, rồi không bao giờ cần lo về chúng nữa vì text của chương trình thường không thay đổi cả giá trị lẫn kích thước. Một số operating system và linker còn có thể gán quyền phù hợp cho các section khác nhau trong segment; chẳng hạn text có thể được đặt là read-and-execute-only, một phần dữ liệu là read-write-no-execute, phần khác là read-only, v.v.

Data segment chứa các global variable và static variable đã khởi tạo, cùng đầy đủ các giá trị được gán. Sau đó, kích thước BSS segment được lấy từ executable, và loader lấy một block có kích thước đó rồi đặt ngay sau data segment. Block này được điền số 0 khi đưa vào address space của chương trình. Lúc này, toàn bộ vùng data và BSS thường được gọi chung là data segment. Đó là vì theo thuật ngữ quản lý memory của OS, segment chỉ là một dải virtual address liên tiếp, nên các segment liền kề được hợp nhất. Data segment thường là segment lớn nhất trong một process.

Sơ đồ cho thấy memory layout của chương trình sắp bắt đầu thực thi. Ta vẫn cần thêm vùng memory cho local variable, giá trị tạm, việc truyền parameter trong function call và những mục đích tương tự. Stack segment được cấp phát cho việc này. Ta cũng cần heap space cho memory được cấp phát động. Vùng này được thiết lập theo nhu cầu ngay khi có lời gọi `malloc()` đầu tiên.

Lưu ý rằng phần thấp nhất của virtual address space chưa được map; nghĩa là nó nằm trong address space của process nhưng chưa được gán physical address, nên mọi tham chiếu tới đó đều không hợp lệ. Đây thường là vài Kbyte memory tính từ địa chỉ 0 trở lên. Cách bố trí này bắt được những tham chiếu thông qua null pointer và pointer mang giá trị integer nhỏ.

Khi tính cả shared library, process address space có dạng như trong Hình 6-3.

Hình 6-3. Bố trí virtual address space, có thể hiện shared library

![image](images/ch06/img06-04.png)

## C runtime làm gì với `a.out`

Bây giờ chúng ta đi vào chi tiết cách C tổ chức các data structure của một chương trình đang chạy. Có nhiều runtime data structure: stack, activation record, dữ liệu, heap, v.v. Chúng ta sẽ lần lượt xem từng loại và phân tích những tính năng C mà chúng hỗ trợ.

### Stack segment

Stack segment chứa một data structure duy nhất là stack. Là một đối tượng kinh điển trong computer science, stack là một vùng memory động triển khai một hàng đợi last-in-first-out, phần nào giống chồng đĩa trong căng tin. Định nghĩa kinh điển của stack nói rằng trên đó có thể có bao nhiêu đĩa cũng được, nhưng các thao tác hợp lệ duy nhất là thêm hoặc lấy một đĩa ở trên cùng. Nghĩa là các giá trị có thể được push lên stack và được lấy ra bằng thao tác pop. Thao tác push làm stack lớn lên, còn pop lấy một giá trị ra khỏi stack.

Compiler-writers dùng một cách tiếp cận linh hoạt hơn một chút. Chúng ta chỉ thêm hoặc lấy đĩa ở trên cùng, nhưng cũng có thể thay đổi các giá trị trên một chiếc đĩa ở giữa stack. Function có thể truy cập những variable local của function gọi nó thông qua parameter hoặc global pointer. Runtime duy trì một pointer, thường nằm trong một register và thường gọi là `sp`, chỉ đỉnh hiện tại của stack. Stack segment có ba mục đích sử dụng chính, hai mục đích liên quan đến function và một mục đích liên quan đến đánh giá biểu thức:

- Stack cung cấp vùng lưu trữ cho những local variable được khai báo trong function. Theo thuật ngữ C, chúng được gọi là "automatic variable".

- Stack lưu thông tin "housekeeping" liên quan khi thực hiện function call. Thông tin này được gọi là stack frame, hoặc tổng quát hơn là procedure activation record. Chúng ta sẽ mô tả chi tiết sau, nhưng trước mắt hãy biết rằng nó gồm địa chỉ nơi function được gọi, tức nơi quay lại khi function được gọi kết thúc, mọi parameter không vừa trong các register và các giá trị register đã lưu.

- Stack còn là một vùng scratch-pad: mỗi khi chương trình cần vùng lưu trữ tạm, có thể để đánh giá một biểu thức số học dài, nó có thể push các kết quả từng phần lên stack và pop khi cần. Vùng lưu trữ lấy bằng lời gọi `alloca()` cũng nằm trên stack. Đừng dùng `alloca()` để lấy memory mà bạn muốn tồn tại lâu hơn routine cấp phát nó. Memory đó sẽ bị function call tiếp theo ghi đè.

Nếu không có recursive call thì không cần stack. Khi đó, lượng vùng lưu trữ cố định cho local variable, parameter và return address sẽ được biết tại compiletime và có thể cấp phát trong BSS. Các implementation ban đầu của BASIC, COBOL và FORTRAN không cho phép gọi function đệ quy, nên không cần dynamic stack tại runtime. Cho phép recursive call có nghĩa là phải tìm cách để mul-tiple instance của local variable cùng tồn tại một lúc, dù chỉ những instance được tạo gần nhất được truy cập: đó chính là đặc tả kinh điển của stack.

#### Thử thách lập trình

![image](images/ch06/img06-02.png)

Nghịch stack

Hãy compile và chạy chương trình thử nhỏ này để tìm vị trí gần đúng của stack trên hệ thống của bạn:

```
#include <stdio.h>
main()
 {
    int i;
    printf("The stack top is near %p\n", &i);
    return 0;
}
```

Hãy tìm vị trí của data segment, text segment và heap bên trong data segment bằng cách khai báo những variable sẽ được đặt vào các segment đó rồi in địa chỉ của chúng. Làm stack lớn lên bằng cách gọi một function và khai báo một số local array lớn.

Bây giờ địa chỉ đỉnh stack là gì?

Stack có thể nằm tại địa chỉ khác nhau trên những kiến trúc và bản OS khác nhau. Mặc dù chúng ta nói tới đỉnh stack, trên phần lớn processor, stack phát triển xuống dưới, hướng tới những địa chỉ memory có giá trị nhỏ hơn.

## Khi function được gọi: Procedure activation record

Phần này mô tả cách C runtime quản lý chương trình trong address space riêng của nó. Thực ra, các runtime routine của C ít và nhẹ một cách đáng kể. Khác với C++ hoặc Ada chẳng hạn, nếu chương trình C muốn một dịch vụ như cấp phát vùng lưu trữ động, nó thường phải yêu cầu rõ ràng. Điều đó khiến C trở thành ngôn ngữ rất hiệu quả, nhưng cũng đặt thêm gánh nặng lên lập trình viên.

Một dịch vụ được cung cấp tự động là theo dõi call chain: routine nào đã gọi routine nào và điều khiển sẽ quay lại đâu ở câu lệnh "return" tiếp theo. Cơ chế kinh điển đảm nhiệm việc này là procedure activation record trên stack. Mỗi câu lệnh gọi được thực thi sẽ có một procedure activation record hoặc một cấu trúc tương đương. Procedure activation record là data structure sup-ports một lần gọi procedure và ghi lại mọi thứ cần thiết để quay về nơi xuất phát trước lời gọi. Xem Hình 6-4.

Hình 6-4. Một procedure activation record điển hình

![image](images/ch06/img06-05.png)

Mô tả nội dung activation record chỉ có tính minh họa. Cấu trúc chính xác thay đổi tùy implementation. Thứ tự các field có thể rất khác nhau. Có thể có một vùng lưu các giá trị register trước khi gọi. Include file `/usr/include/sys/frame.h,` cho biết stack frame trên hệ thống UNIX của bạn có dạng thế nào. Trên SPARC, stack frame lớn, tới vài chục word, vì nó dành chỗ lưu register window. Trên kiến trúc x86, frame nhỏ hơn một chút. Runtime duy trì một pointer, thường trong một register và thường gọi là `fp`, chỉ stack frame đang hoạt động. Đây sẽ là stack frame ở gần hoặc ngay đỉnh stack.

### Giáo điều software

![image](images/ch06/img06-06.png)

Sự thật C đáng kinh ngạc!

Phần lớn ngôn ngữ thuật toán hiện đại cho phép định nghĩa function, cũng như dữ liệu, bên trong function. C không cho phép các function lồng nhau theo cách này. Mọi function trong C đều nằm ở lexical level cao nhất.

Hạn chế này làm các implementation C đơn giản hơn một chút. Trong các ngôn ngữ như Pascal, Ada, Modula-2, PL/I hoặc Algol-60, vốn cho phép procedure lồng nhau về mặt từ vựng, activation record thường chứa một pointer tới activation record của function bao ngoài. Pointer này được gọi là static link <sup>\[1\]</sup> và cho phép procedure bên trong truy cập stack frame của procedure bao ngoài, từ đó truy cập dữ liệu local của procedure ấy. Hãy nhớ rằng có thể có nhiều lần gọi procedure bao ngoài đang hoạt động cùng lúc. Static link trong activation record của procedure bên trong sẽ trỏ tới stack frame thích hợp, cho phép truy cập đúng instance của local data.

Kiểu truy cập này, tức tham chiếu tới một data item được định nghĩa trong scope bao ngoài về mặt từ vựng, được gọi là uplevel reference. Static link trỏ tới stack frame của procedure bao ngoài về mặt từ vựng, được xác định tại compiletime; nó có tên như vậy để phân biệt với dynamic link của chuỗi frame pointer, vốn trỏ tới stack frame của lần gọi procedure liền trước tại runtime.

Trong Pascal compiler của Sun, static link được xem là một hidden parameter bổ sung, truyền ở cuối argument list khi cần. Điều đó cho phép các Pascal routine dùng cùng activation record, từ đó dùng cùng code generator và làm việc với các C routine. Bản thân C không cho phép nested function; vì thế nó không có uplevel reference tới dữ liệu trong chúng và không cần static link trong activation record. Một số người đang thúc giục bổ sung khả năng nested function cho C++.

<sup>\[1\]</sup> Xin đừng nhầm static link trong procedure activation record, vốn cho phép uplevel reference tới local data của một procedure bao ngoài về mặt từ vựng, với static link ở chương trước, vốn mô tả phương pháp lỗi thời gắn một bản sao của tất cả library vào executable. Trong chương trước, static nghĩa là "được thực hiện tại compiletime". Ở đây, nó nghĩa là "tham chiếu tới bố cục từ vựng của chương trình".

Ví dụ code dưới đây sẽ được dùng để minh họa activation record trên stack tại các thời điểm thực thi khác nhau. Đây là khái niệm khó biểu diễn trong sách, vì chúng ta phải xử lý luồng điều khiển động thay vì code tĩnh mà một listing thể hiện. Phải thừa nhận điều này khó theo dõi, nhưng như Wendy Kaminer nhận xét trong tác phẩm psy-chological kinh điển I'm Dysfunctional; You're Dysfunctional, chỉ những người qua đời rất trẻ mới học được ở mẫu giáo mọi thứ họ thực sự cần biết.

```
1 a (int i) {
2       if (i>0)
3          a(--i);
4       else
5          printf("i has reached zero ");
6       return;
7 }
8
9 main(){
10  a(1);
11 }
```

Nếu compile và chạy chương trình trên, luồng điều khiển sẽ như trong Hình 6-5. Mỗi khung nét đứt thể hiện một đoạn source thực hiện function call. Các câu lệnh được thực thi được in đậm. Khi điều khiển chuyển từ function này sang function khác, trạng thái mới của stack được thể hiện phía dưới. Việc thực thi bắt đầu ở `main`, và stack phát triển xuống dưới.

Hình Figure6-5. Một activation record được tạo tại runtime cho mỗi function call

![image](images/ch06/img06-07.png)

Compiler-writers cố tăng tốc chương trình bằng cách không lưu những thông tin sẽ không được dùng. Những cách tối ưu khác gồm giữ thông tin trong register thay vì trên stack, không push một stack frame đầy đủ cho leaf function (function bản thân không gọi function nào khác), và để callee chịu trách nhiệm lưu register thay vì caller. "Pointer tới frame trước" trong mỗi frame đơn giản hóa việc pop stack về record trước đó khi function hiện tại trả về.

#### Thử thách lập trình

![image](images/ch06/img06-02.png)

Stack frame

1\. Hãy tự theo dõi luồng điều khiển trong chương trình trên và điền nội dung stack frame tại mỗi câu lệnh gọi. Với mỗi return address, hãy dùng số dòng mà điều khiển sẽ quay lại.

2\. Hãy thực sự compile chương trình rồi chạy nó trong debugger. Xem những gì được thêm vào stack sau khi một function được gọi. So sánh với kết quả tự kiểm tra của bạn để xác định chính xác stack frame trên hệ thống có dạng thế nào.

Hãy nhớ rằng compiler-writers cố đặt càng nhiều nội dung activation record vào register càng tốt vì cách đó nhanh hơn, nên một phần nội dung có thể không xuất hiện trên stack. Tham khảo file frame.h để xem bố trí của stack frame.

## Keyword `auto` và `static`

Mô tả về cách stack triển khai function call cũng giải thích tại sao việc trả về một pointer tới local automatic variable của function không hoạt động, như sau:

```
char * favorite_fruit () {
    char deciduous [] = "apple";
    return deciduous;
}
```

Automatic variable `deciduous` được cấp phát trên stack khi đi vào function; sau khi thoát function, variable không còn tồn tại và vùng stack đó có thể bị ghi đè bất kỳ lúc nào. Những pointer mất hiệu lực theo cách này, vì tham chiếu tới thứ không còn tồn tại, được gọi là "dangling pointer": chúng không tham chiếu tới thứ gì hữu ích mà chỉ lơ lửng trong không gian. Nếu cần trả về pointer tới một thứ được định nghĩa trong function, hãy định nghĩa thứ đó là `static`. Điều này bảo đảm vùng lưu trữ cho variable được cấp phát trong data segment thay vì trên stack. Lifetime của variable khi đó chính là lifetime của chương trình; một tác dụng kèm theo là nó giữ giá trị ngay cả sau khi function định nghĩa nó đã thoát. Giá trị đó vẫn sẵn có khi lần tiếp theo đi vào function.

Storage class specifier `auto` không bao giờ cần thiết. Nó chủ yếu có ý nghĩa với một compiler-writer khi tạo entry trong symbol table: nó nói rằng "vùng lưu trữ này được cấp phát tự động khi đi vào block", thay vì cấp phát tĩnh tại compiletime hoặc cấp phát động trên heap. Auto gần như vô nghĩa với mọi lập trình viên khác vì nó chỉ được dùng bên trong function, trong khi data declaration trong function mặc định đã có thuộc tính này. Công dụng duy nhất mà chúng tôi từng tìm thấy cho keyword `auto` là căn các declaration thẳng hàng đẹp mắt như sau:

```
register int filbert;
    auto int almond;
  static int hazel;
```

thay vì:

```
register int filbert;
int almond;
static int hazel;
```

### Stack frame có thể không trên stack

Mặc dù chúng ta nói "stack frame" được "push lên stack", activation record không nhất thiết phải nằm trên stack. Thực ra, giữ càng nhiều nội dung activation record trong register càng tốt sẽ nhanh hơn và hiệu quả hơn. Kiến trúc SPARC đưa điều này tới giới hạn với khái niệm "register window", trong đó chip có một tập register dành riêng để giữ parameter trong procedure activation record. Stack frame rỗng vẫn được push cho mỗi lời gọi; nếu call chain sâu tới mức hết register window, các register sẽ được thu hồi bằng cách spill nội dung vào vùng frame đã dành sẵn trên stack.

Một số ngôn ngữ, chẳng hạn Mesa và Cedar của Xerox PARC, cấp phát activation record dưới dạng linked list trên heap. Activation record cho recursive procedure cũng được heap-allocated trong những implementation PL/I đầu tiên, dẫn tới chỉ trích về hiệu năng chậm, vì stack thường là nơi lấy memory nhanh hơn nhiều.

## Thread of control

Đến đây hẳn đã rõ cách hỗ trợ nhiều thread of control khác nhau, tức những gì trước đây được gọi là "lightweight process", trong một process. Chỉ cần dành riêng một stack khác nhau cho mỗi thread of control. Nếu một thread gọi foo(), rồi foo() gọi bar(), rồi bar() gọi baz(), trong khi chương trình chính thực thi các routine khác, mỗi bên cần stack riêng để theo dõi vị trí của mình. Mỗi thread được một stack 1Mb, phát triển theo nhu cầu, và có một page red zone giữa các stack của thread. Thread là mô hình lập trình rất mạnh mẽ, đem lại lợi ích hiệu năng ngay cả trên uniprocessor. Tuy nhiên, đây là sách về C chứ không phải thread; bạn có thể và nên tìm hiểu thêm chi tiết về thread.

## `setjmp` và `longjmp`

Chúng ta cũng có thể nói tới chức năng của `setjmp()` và `longjmp()`, vì chúng được triển khai bằng cách thao tác activation record. Nhiều người mới lập trình không biết cơ chế mạnh mẽ này vì đây là tính năng riêng của C. Chúng bù đắp một phần khả năng phân nhánh hạn chế của C và hoạt động theo cặp như sau:

- Phải gọi `setjmp(jmp_buf j)` trước. Nó có nghĩa là dùng variable `j` để ghi nhớ vị trí hiện tại của bạn. Lời gọi trả về 0.

- Sau đó có thể gọi `longjmp(jmp_buf j,int i)`. Nó có nghĩa là quay lại vị trí mà `j` đang ghi nhớ. Nó làm như thể bạn đang trở về từ lời gọi `setjmp()` ban đầu, nhưng trả về giá trị `i` để code biết khi nào bạn thực sự quay lại đây thông qua `longjmp()`. Phù!

- Nội dung của `j` bị phá hủy khi nó được dùng trong một lời gọi `longjmp()`.

Setjmp lưu một bản sao program counter và pointer hiện tại tới đỉnh stack. Có thể hiểu là nó lưu một số giá trị ban đầu. Sau đó longjmp khôi phục những giá trị này, thực chất chuyển điều khiển và đặt trạng thái trở lại nơi bạn đang ở khi lưu. Điều đó được gọi là "unwinding the stack" vì bạn tháo các activation record khỏi stack cho tới khi tới record đã lưu. Mặc dù gây ra một nhánh, longjmp khác goto ở chỗ:

- Trong C, goto không thể nhảy ra khỏi function hiện tại; đó là lý do nó mang tên "longjmp": bạn có thể nhảy rất xa, thậm chí tới một function trong file khác.

- Bạn chỉ có thể longjmp trở về một nơi đã từng đi qua, nơi đã thực hiện setjmp và vẫn có activation record còn tồn tại. Xét theo khía cạnh này, setjmp giống một câu lệnh "đến từ" hơn là "đi tới". Longjmp nhận thêm một integer argument được truyền ngược về, cho phép bạn biết mình tới đây từ longjmp hay do tiếp tục từ câu lệnh trước.

Code sau minh họa một ví dụ về `setjmp()` và `longjmp()`.

```
#include <setjmp.h>

jmp_buf buf;
#include <setjmp.h>
banana() {
    printf("in banana()\n");
    longjmp(buf, 1);
    /*NOTREACHED*/
    printf("you'll never see this, because I longjmp'd");
}


main()
{
    if (setjmp(buf))
        printf("back in main\n");
    else {
        printf("first time through\n");
        banana();
    }
}
```

Output thu được là:

```
% a.out
first time through
in banana()
back in main
```

Điểm cần chú ý: cách đáng tin cậy duy nhất để bảo đảm local variable giữ giá trị mà nó có tại thời điểm longjmp là khai báo nó volatile. Điều này áp dụng cho những variable có giá trị thay đổi giữa lúc thực thi setjmp và lúc longjmp trả về.

Setjmp/longjmp hữu ích nhất cho việc khôi phục sau lỗi. Miễn là chưa trả về từ function, nếu phát hiện một lỗi không thể khôi phục tại chỗ, bạn có thể chuyển điều khiển về main input loop và bắt đầu lại từ đó. Một số người dùng setjmp/longjmp để thoát một lúc khỏi một chuỗi rất nhiều function. Những người khác dùng chúng để bảo vệ code có thể nguy hiểm, chẳng hạn khi dereference một pointer đáng ngờ như trong ví dụ sau.

```
switch(setjmp(jbuf)) {
    case 0:
        apple = *suspicious;
        break;
    case 1:
        printf("suspicious is indeed a bad pointer\n");
        break;
    default:
        die("unexpected value returned by setjmp");
}
```

Cách này cần một handler cho segmentation violation signal để thực hiện lời gọi tương ứng `longjmp(jbuf,1)`, như sẽ được giải thích trong chương tiếp theo. Setjmp và longjmp đã phát triển thành các exception routine tổng quát hơn là "catch" và "throw" trong C++.

### Thử thách lập trình

![image](images/ch06/img06-02.png)

Nhảy vào việc!

Hãy lấy source của một chương trình bạn đã viết rồi thêm `setjmp/longjmp` vào, sao cho khi nhận một input cụ thể, nó sẽ bắt đầu lại từ đầu.

Header file `<setjmp.h>` cần được include trong mọi source file sử dụng setjmp hoặc longjmp.

Giống goto, setjmp/longjmp có thể khiến chương trình khó hiểu và khó debug. Tốt nhất nên tránh chúng, ngoại trừ những tình huống cụ thể đã mô tả.

## Stack segment UNIX

Trên UNIX, stack tự động phát triển khi process cần thêm vùng lưu trữ. Lập trình viên có thể đơn giản giả định stack lớn vô hạn. Đây là một trong nhiều ưu điểm của UNIX so với những môi trường vận hành như MS-DOS. Các implementation UNIX thường dùng một dạng virtual memory nào đó. Khi bạn cố truy cập vượt quá vùng hiện được cấp cho stack, nó tạo ra một hardware interrupt gọi là page fault. Page fault được xử lý theo một trong nhiều cách, tùy tham chiếu hợp lệ hay không hợp lệ.

Kernel thường xử lý tham chiếu tới địa chỉ không hợp lệ bằng cách gửi signal thích hợp, có lẽ là segmentation fault, tới process vi phạm. Có một vùng "red zone" nhỏ ngay dưới đỉnh stack. Tham chiếu tới đó không chuyển tiếp lỗi; thay vào đó, operating system tăng kích thước stack segment thêm một khoảng đáng kể. Chi tiết khác nhau giữa các implementation UNIX, nhưng thực chất là thêm virtual memory được map vào address space tiếp sau phần cuối stack hiện tại. Phần cứng memory mapping bảo đảm bạn không thể truy cập memory ngoài vùng operating system đã cấp cho process.

## Stack segment MS-DOS

Trong DOS, stack size phải được chỉ định như một phần của việc build executable và không thể tăng tại runtime. Nếu đoán sai và stack lớn hơn vùng đã cấp, cả bạn lẫn chương trình đều thất bại; nếu đã bật kiểm tra, bạn sẽ nhận thông báo `STACK` `OVERFLOW!`. Thông báo này cũng có thể xuất hiện tại compiletime khi bạn vượt giới hạn của một segment.

Turbo C sẽ báo `Segment overflowed` `maximum` `size` `<lsegname>` nếu quá nhiều dữ liệu hoặc code phải được kết hợp vào một segment duy nhất. Giới hạn là 64Kbyte do kiến trúc 80x86.

Phương pháp chỉ định stack size khác nhau tùy compiler bạn dùng. Với compiler của Microsoft, lập trình viên có thể chỉ định stack size như một linker parameter. Parameter

```
STACK:nnnn
```

cho Microsoft linker biết phải dành nnnn byte cho stack.

Các compiler Borland dùng một variable có tên đặc biệt:

```
unsigned int _stklen = 0x4000; /* 16K stack */
```

Những nhà cung cấp compiler khác có các phương pháp khác để thực hiện việc này. Hãy tra mục "stack size" trong tài liệu tham khảo dành cho lập trình viên để biết chi tiết.

## Công cụ C hữu ích

Phần này gồm một số danh sách, nhóm theo chức năng, về những công cụ C hữu ích mà bạn nên biết và công dụng của chúng, được trình bày trong các Bảng 6-1 đến 6-4. Chúng tôi đã đề cập sơ qua một số công cụ giúp bạn xem bên trong process hoặc file a.out. Một số công cụ dành riêng cho Sun OS. Phần này cung cấp bản tổng hợp easy-to-read về công dụng và nơi tìm từng công cụ. Sau khi nghiên cứu bản tổng hợp, hãy đọc manpage của từng công cụ rồi thử chạy mỗi công cụ trên một vài file a.out khác nhau: chương trình "hello world" và một chương trình lớn.

Hãy tìm hiểu kỹ những công cụ này: dành 15 phút thử từng công cụ ngay bây giờ sẽ giúp bạn tiết kiệm hàng giờ khi giải quyết một bug khó về sau.

Bảng 6-1. Công cụ xem source

| Công cụ | Nơi tìm | Công dụng |
|---|---|---|
| `cb` | Được cung cấp cùng compiler | Công cụ làm đẹp chương trình C. Đưa source qua filter này để có bố cục và cách thụt lề chuẩn. Có nguồn gốc từ Berkeley. |
| `indent` |  | Thực hiện những công việc giống `cb`. Có nguồn gốc từ AT \& T. |
| `cdecl` | Cuốn sách này | Giải nghĩa các declaration C phức tạp. |
| `cflow` | Được cung cấp cùng compiler | In các quan hệ caller/callee của một chương trình. |
| `cscope` | Được cung cấp cùng compiler | Công cụ duyệt chương trình C tương tác `ASCII`-based. Nhóm OS của chúng tôi sử dụng nó để kiểm tra tác động của những thay đổi trong header file. Nó nhanh chóng trả lời những câu hỏi như: "Có bao nhiêu lệnh dùng libthread?" hoặc "Tất cả những thành phần đọc kmem là những thành phần nào?" |
| `ctags` | /usr/bin | Tạo tags file để dùng trong vi editor. Tags file tăng tốc việc xem xét source của chương trình bằng cách duy trì một bảng ghi vị trí của phần lớn object. |
| `lint` | Được cung cấp cùng compiler | Công cụ kiểm tra chương trình C. |
| `sccs` | /usr/ccs/bin | Hệ thống quản lý phiên bản source code. |
| `vgrind` | /usr/bin | Công cụ định dạng để in các listing C đẹp mắt. |

Bác sĩ có thể sử dụng x-rays, siêu âm, nội soi khớp và phẫu thuật thăm dò để quan sát bên trong bệnh nhân. Những công cụ này chính là x-rays của thế giới phần mềm.

Bảng 6-2. Công cụ xem executable

| Công cụ | Nơi tìm | Công dụng |
|---|---|---|
| `dis` | /usr/ccs/bin | Công cụ disassembler cho object code. |
| `dump -Lv` | /usr/ccs/bin | In thông tin dynamic linking. |
| `ldd` | /usr/bin | In những dynamic library mà file này cần. |
| `nm` | /usr/ccs/bin | In symbol table của một object file. |
| `strings` | /usr/bin | Xem các string được nhúng trong binary. Hữu ích để xem những thông báo lỗi mà binary có thể tạo ra, các filename built-in và đôi khi cả symbol name hoặc thông tin phiên bản, bản quyền. |
| `sum` | /usr/bin | In checksum và số block của một file. An-swers những câu hỏi như: "Hai executable có cùng phiên bản không?" và "Quá trình truyền có thành công không?" |

Bảng 6-3. Công cụ debug

| Công cụ | Nơi tìm | Công dụng |
|---|---|---|
| `truss` | /usr/bin | Phiên bản SVr4 của `trace`. Công cụ này in các system call mà executable thực hiện. Dùng nó để xem binary đang làm gì và tại sao nó bị kẹt hoặc thất bại. Đây là một sự trợ giúp rất lớn! |
| `ps` | /usr/bin | Hiển thị các đặc tính của process. |
| `ctrace` | Được cung cấp cùng compiler | Sửa source của bạn để in các dòng khi chúng được thực thi. Một công cụ tuyệt vời cho chương trình nhỏ! |
| `debugger` | Được cung cấp cùng compiler | Debugger tương tác. |
| `file` | /usr/bin | Cho biết file chứa gì, chẳng hạn executable, dữ liệu, ASCII, shell script, archive, v.v. |

Bảng 6-4. Công cụ tinh chỉnh hiệu năng

| Công cụ | Nơi tìm | Công dụng |
|---|---|---|
| `collector` | Được cung cấp cùng debugger | Chỉ trên SunOS: thu thập dữ liệu hiệu năng runtime dưới sự điều khiển của debugger. |
| `analyzer` | Được cung cấp cùng debugger | Chỉ trên SunOS: phân tích dữ liệu hiệu năng đã thu thập. |
| `gprof` | /usr/ccs/bin | Hiển thị dữ liệu call-graph profile, giúp xác định các function compute-intensive. |
| `prof` | /usr/ccs/bin | Hiển thị tỷ lệ phần trăm thời gian dành cho mỗi routine. |
| `tcov` | Được cung cấp cùng compiler | Hiển thị số lần mỗi câu lệnh được thực thi, giúp xác định các loop compute-intensive bên trong function. |
| `time` | /usr/bin/time | Hiển thị tổng thời gian thực và CPU time mà chương trình sử dụng. |

Nếu làm việc với OS kernel, bạn không thể sử dụng phần lớn runtime tool vì kernel không chạy như một user process. Các compiletime tool, chẳng hạn lint, vẫn hoạt động, nhưng ngoài ra chúng ta phải dùng những phương tiện thô sơ như dao đá và rìu đá: đặt các pattern không ngẫu nhiên trong memory để xem khi nào chúng bị ghi đè (hai hằng hex được ưa thích là `dead-beef` và `abadcafe`), dùng printf hoặc những công cụ tương đương, và ghi lại thông tin trace.

### Giáo điều software

![image](images/ch06/img06-06.png)

Debug kernel bằng grep

Kernel "panic", tức dừng đột ngột, khi phát hiện một tình huống "không thể" xảy ra. Chẳng hạn, nó gặp một null pointer khi tìm kiếm dữ liệu thiết yếu. Vì không có cách nào khôi phục từ tình huống này, hành động an toàn nhất là dừng processor trước khi thêm dữ liệu bị mất. Để giải quyết một panic, trước hết bạn phải xem điều gì đã xảy ra mà có thể khiến operating system hoảng sợ như vậy.

Nhóm phát triển kernel tại Sun từng có một bug khó hiểu rất khó truy tìm. Triệu chứng là kernel memory bị ghi đè ngẫu nhiên, đôi khi khiến hệ thống panic.

Hai kỹ sư giỏi nhất của chúng tôi đã làm việc này và nhận thấy byte bị phá hỏng luôn là byte thứ 19 tính từ đầu một memory block. Đây là offset ít gặp, khác với các offset 2, 4 hoặc 8 thường thấy ở khắp nơi. Một kỹ sư chợt nảy ra ý tưởng dùng offset để khoanh vùng bug. Anh đề nghị dùng kernel debugger kadb để disassemble kernel binary image thành một file ASCII; việc này mất một giờ! Sau đó họ dùng grep tìm những instruction "store" có operand chỉ offset 19. Một trong số đó gần như chắc chắn là instruction gây corruption.

Chỉ có tám instruction như vậy và tất cả đều nằm trong subsystem xử lý process control. Lúc này họ khá chắc vấn đề nằm ở đâu và chỉ cần tìm chính xác nó là gì. Nỗ lực tiếp theo cuối cùng tìm ra nguyên nhân: một race condition trên một process control structure. Điều này khiến một thread đánh dấu memory để trả về hệ thống trước khi thread khác thực sự sử dụng xong. Kết quả là kernel memory allocator giao vùng memory cho bên khác, nhưng process control code vẫn tưởng mình giữ nó và ghi vào đó, gây ra sự corruption vốn sẽ impossible-to-find nếu không có cách truy tìm này!

Debug một OS kernel bằng grep — thật là một ý tưởng. Đôi khi ngay cả source tool cũng giúp giải quyết runtime problem!

Nhân nói về công cụ hữu ích, Bảng 0-5 liệt kê một số cách xem chính xác cấu hình hệ thống Sun. Tuy nhiên, không công cụ nào giúp được bạn nếu bạn không luyện tập sử dụng chúng.

Bảng 6-5. Công cụ nhận diện hardware

| Nhận diện | Output điển hình | Cách gọi |
|---|---|---|
| Kernel architecture | sun4c | `/usr/kvm/arch -k` |
| Các OS patch đã được áp dụng | không có patch nào được cài đặt | `/usr/bin/showrev -p` |
| Những thông tin hardware khác nhau | rất nhiều | `/usr/sbin/prtconf` |
| CPU clock rate | processor 40MHz | `/usr/sbin/psrinfo -v` |
| hostid | 554176fe | `/usr/ucb/hostid` |
| Memory | 32Mb | Được hiển thị khi bật nguồn |
| Serial number | 4290302 | Được hiển thị khi bật nguồn |
| ROM revision | 2\.4.1 | Được hiển thị khi bật nguồn |
| Disk đã mount | Disk 198Mb | `/usr/bin/df -F ufs -k` |
| Swap space | 40Mb | `/etc/swap -s` |
| Ethernet address | 8:0:20:f:8c:60 | `/usr/sbin/ifconfig -a` <br> Ethernet address được tích hợp trong máy |
| IP address | le0=129.144.248.36 | `/usr/sbin/ifconfig -a` <br> IP address được tích hợp trong network |
| Floating-point hardware | Tần số của FPU có vẻ là 38.2 MHz | `fpversion` được cung cấp cùng compiler |

## Giải trí nhẹ nhàng — Câu đố lập trình CMU

Vài năm trước, khoa Computer Science tại Carnegie-Mellon University thường xuyên tổ chức một cuộc thi lập trình nhỏ cho những nghiên cứu sinh mới nhập học. Cuộc thi nhằm cho các nhà nghiên cứu mới trải nghiệm hands-on với các hệ thống của khoa và cơ hội thể hiện tiềm năng nổi bật của mình. CMU có lịch sử lâu dài và danh tiếng trong lĩnh vực computer, bắt nguồn từ những ngày tiên phong, nên thường có thể mong đợi những bài dự thi xuất sắc tại một cuộc thi lập trình ở đó.

Hình thức cuộc thi thay đổi qua từng năm, và vào một năm cụ thể, nó rất đơn giản. Người dự thi phải đọc một file chứa các số rồi in giá trị trung bình. Chỉ có hai quy tắc:

1\. Chương trình phải chạy nhanh nhất có thể.

2\. Chương trình phải được viết bằng Pascal hoặc C.

Các chương trình dự thi được một giảng viên tập hợp và gửi chạy theo từng batch. Sinh viên có thể nộp bao nhiêu bài tùy thích; điều này khuyến khích sử dụng các thuật toán xác suất non-deterministic, tức những thuật toán đoán một số đặc tính của data set rồi dùng phỏng đoán đó để đạt hiệu năng cao hơn. Quy tắc vàng là chương trình chạy trong thời gian ngắn nhất sẽ thắng cuộc thi.

Các nghiên cứu sinh bèn lui về những góc tối và bắt đầu miệt mài làm những chương trình khác nhau của mình. Phần lớn có ba hoặc bốn phiên bản để nộp và chạy. Đến đây, mời bạn đọc đoán xem những kỹ thuật nào đã giúp các chương trình chạy nhanh.

### Thử thách lập trình

![image](images/ch06/img06-02.png)

Vượt giới hạn tốc độ thế nào?

Hãy tưởng tượng bạn được giao viết một chương trình đọc file chứa 10.000 số rồi tính giá trị trung bình. Chương trình phải chạy trong thời gian ngắn nhất.

Bạn sẽ sử dụng những kỹ thuật lập trình và kỹ thuật compiler nào để đạt mục tiêu đó?

Phần lớn mọi người đoán những cải thiện lớn nhất sẽ đến từ code optimization, được thực hiện tường minh trong code hoặc ngầm thông qua các compiler option thích hợp. Các kỹ thuật code optimization chuẩn gồm loop unrolling, mở rộng function in-line, common subexpression elimination, cải thiện register allocation, bỏ kiểm tra array bound tại runtime, loop-invariant code motion, operator strength reduction (chuyển exponen-tiation thành phép nhân, chuyển phép nhân thành bit-shifting và/hoặc phép cộng), v.v.

File dữ liệu chứa khoảng 10.000 số, nên nếu giả định chỉ việc đọc và xử lý mỗi số đã mất một millisecond, xấp xỉ khả năng các hệ thống thời đó, chương trình nhanh nhất có thể sẽ mất khoảng mười giây.

Kết quả thực tế rất đáng ngạc nhiên. Theo operating system báo cáo, chương trình nhanh nhất mất âm ba giây. Đúng vậy, người thắng cuộc đã chạy trong một lượng thời gian âm! Chương trình nhanh thứ hai dường như chỉ mất vài millisecond, còn bài đứng thứ ba mất ít hơn một chút so với 10 giây dự kiến. Rõ ràng đã có những thủ thuật lập trình tinh quái, nhưng là gì và được thực hiện như thế nào? Việc xem xét kỹ các chương trình thắng cuộc cuối cùng đã cung cấp câu trả lời.

Chương trình có vẻ chạy ngược thời gian đã tận dụng operating system. Lập trình viên biết process control block được lưu ở đâu so với đáy stack. Anh tạo một pointer để truy cập process control block và ghi đè field "CPU-time-used" bằng một giá trị rất lớn. <sup>\[2\]</sup> Operating system không dự kiến CPU time lớn như vậy và đã diễn giải nhầm số dương rất lớn thành số âm theo cách biểu diễn bù hai.

<sup>\[2\]</sup> Một sự lạm dụng quy tắc trắng trợn, ngang với lần ngôi sao bóng đá Argentina Diego Maradona dùng cẳng tay đẩy bóng vào lưới đội Anh để ghi bàn thắng quyết định tại World Cup bóng đá năm 1986.

Người runner-up, với chương trình chỉ mất vài millisecond, cũng khôn khéo không kém nhưng theo cách khác. Anh tận dụng quy tắc cuộc thi thay vì những kỹ thuật viết code khác thường. Anh nộp hai bài khác nhau. Một bài đọc các số, tính đáp án theo cách thông thường rồi ghi kết quả vào file; bài thứ hai dành phần lớn thời gian để ngủ, nhưng cứ vài giây lại thức dậy một lúc để kiểm tra xem file đáp án đã tồn tại chưa. Khi có file, nó in nội dung ra. Process thứ hai chỉ dùng tổng cộng vài millisecond CPU time. Vì người dự thi được phép nộp nhiều bài, thời gian nhỏ hơn được tính và đưa anh lên vị trí thứ hai.

Lập trình viên có bài đứng thứ ba, mất ít hơn một chút so với thời gian tối thiểu đã tính, dùng phương án công phu nhất. Anh đã tìm ra các machine code instruction tối ưu để giải bài toán và lưu chúng thành một array gồm các integer trong chương trình. Có thể dễ dàng ghi đè một return address trên stack, như Bob Morris, Jr. về sau đã làm với Internet worm năm 1988, để khiến chương trình nhảy vào và bắt đầu thực thi array này. Những instruction đó giải quyết bài toán một cách trung thực trong thời gian kỷ lục.

Khi các mưu mẹo này bị phát hiện, đội ngũ giảng viên đã tranh cãi dữ dội. Một số người ủng hộ khiển trách nghiêm khắc những người thắng cuộc. Một nhóm giáo sư trẻ hơn lại đề nghị trao thêm giải để ghi nhận sự sáng tạo của họ. Cuối cùng, các bên đạt thỏa hiệp: không trao giải, không đưa ra hình phạt và giữ nguyên kết quả. Đáng tiếc, cuộc thi trở thành nạn nhân của những cảm xúc mạnh mẽ đó, và sự việc này đánh dấu năm cuối cùng cuộc thi được tổ chức.

## Chỉ dành sinh viên nâng cao

Một lời khuyên cho người hiểu biết: có thể nhúng assembler code vào source C. Điều này thường chỉ được làm cho những thao tác machine-specific nhất nằm sâu trong OS kernel, chẳng hạn thiết lập các register cụ thể khi chuyển từ supervisor mode sang user mode. Đây là cách chúng tôi chèn một no-op hoặc instruction khác vào một function C bằng SunPro SPARCompiler:

```
banana() { asm("nop"); }
```

Đây là cách nhúng instruction assembly language bằng Microsoft C trên PC:

```
__asm mov ah, 2
__asm mov dl, 43h
```

Bạn cũng có thể đặt keyword "\_ \_asm" trước assembler code. Hoặc chỉ dùng keyword một lần rồi đặt toàn bộ assembler code trong một cặp dấu ngoặc nhọn, như sau:

```
__asm {
       mov ah, 2
       mov dl, 43h
       int 21h
       }
```

Hệ thống chỉ thực hiện rất ít kiểm tra giúp bạn, và rất dễ tạo ra chương trình bị sập. Nhưng đây là một cách tốt để thử nghiệm và học instruction set của một máy. Hãy xem SPARC architecture manual, assembler manual (chủ yếu nói về cú pháp và directive), cùng một databook từ một nhà cung cấp SPARC, chẳng hạn "SPARC RISC User's Guide" của Cypress Semiconductor.
