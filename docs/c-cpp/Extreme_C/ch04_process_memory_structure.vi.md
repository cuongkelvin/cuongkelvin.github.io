<a id="_idParaDest-70"></a>

# Chương 04: Cấu trúc memory của process (Process Memory Structure)

Trong chương này, chúng ta sẽ nói về memory và cấu trúc của nó bên trong một process. Đối với một lập trình viên C, quản lý memory luôn là một chủ đề then chốt, và việc áp dụng các best practice của nó đòi hỏi một kiến thức cơ bản về cấu trúc memory. Thực tế, điều này không chỉ giới hạn ở C. Trong nhiều ngôn ngữ lập trình như C++ hay Java, bạn cần có một hiểu biết nền tảng về memory và cách nó hoạt động; nếu không, bạn sẽ đối mặt với một số vấn đề nghiêm trọng không dễ lần ra và sửa.

Có thể bạn biết rằng quản lý memory hoàn toàn là thủ công trong C, và hơn thế nữa, lập trình viên là người duy nhất chịu trách nhiệm cấp phát các vùng memory và giải phóng chúng một khi chúng không còn cần thiết.

Quản lý memory khác đi trong các ngôn ngữ lập trình high-level như Java hay C#, và nó được thực hiện một phần bởi lập trình viên và một phần bởi platform ngôn ngữ bên dưới, như **Java Virtual Machine** (**JVM**) trong trường hợp dùng Java. Trong những ngôn ngữ này, <a id="_idIndexMarker288"></a>lập trình viên chỉ đưa ra các yêu cầu cấp phát memory, nhưng họ không chịu trách nhiệm giải phóng. Một thành phần gọi là *garbage collector* làm việc giải phóng và tự động giải phóng memory đã được cấp phát.

Vì không có garbage collector nào như vậy trong C và C++, việc có một số chương riêng để trình bày các khái niệm và vấn đề liên quan đến quản lý memory là thiết yếu. Đó là lý do chúng tôi dành chương này và chương tiếp theo cho các khái niệm memory-related, và những chương này cùng nhau sẽ cho bạn một hiểu biết cơ bản về cách memory hoạt động trong C/C++.

Xuyên suốt chương này:

- Chúng ta bắt đầu bằng cách xem cấu trúc memory điển hình của một process. Điều này sẽ giúp chúng ta khám phá giải phẫu của một process và cách nó tương tác với memory.
- Chúng ta thảo luận về memory layout tĩnh và động.
- Chúng ta giới thiệu các segment có trong các memory layout nói trên. Chúng ta thấy rằng một số trong chúng nằm trong executable object file và phần còn lại được tạo ra trong khi process đang được nạp.
- Chúng ta giới thiệu các công cụ và lệnh thăm dò có thể giúp chúng ta phát hiện các segment và xem nội dung của chúng, cả bên trong một object file lẫn sâu bên trong một process đang chạy.

Như một phần của chương này, chúng ta làm quen với hai segment gọi là *Stack* và *Heap*. Chúng là một phần của dynamic memory layout của một process và mọi việc cấp phát và giải phóng đều diễn ra trong những segment này. Trong chương sau, chúng ta sẽ thảo luận chi tiết hơn về các segment Stack và Heap vì thực tế, chúng là những segment mà lập trình viên tương tác nhiều nhất.

Hãy bắt đầu chương này bằng cách nói về *process memory layout*. Điều này sẽ cho bạn một ý niệm tổng thể về cách memory của một process đang chạy được phân đoạn, và mỗi segment được dùng để làm gì.

<a id="_idParaDest-71"></a>

## Memory layout của process

Bất cứ khi nào <a id="_idIndexMarker289"></a>bạn chạy một executable file, hệ điều hành tạo ra một process mới. Một process là một chương trình sống và đang chạy được nạp vào memory và có một **Process Identifier** (**PID**) duy nhất. Hệ <a id="_idIndexMarker290"></a>điều hành là thực thể duy nhất chịu trách nhiệm sinh ra và nạp các process mới.

Một process vẫn chạy cho đến khi nó hoặc thoát bình thường, hoặc process được gửi một signal, như `SIGTERM`, `SIGINT` hay `SIGKILL`, rốt cuộc khiến nó thoát. Các signal `SIGTERM` và `SIGINT` có thể bị bỏ qua, nhưng `SIGKILL` sẽ giết process ngay lập tức và một cách cưỡng bức.

> **Lưu ý**:
>
> Các signal được nhắc đến trong phần trên được giải thích như sau:
>
> `SIGTERM`: đây là signal kết thúc. Nó cho phép process dọn dẹp.
>
> `SIGINT`: đây là signal ngắt, thường được gửi tới process foreground bằng cách nhấn `Ctrl` + `C`.
>
> `SIGKILL`: đây là signal giết và nó đóng process một cách cưỡng bức mà không để nó dọn dẹp.

Khi tạo một process, một trong những việc đầu tiên mà hệ điều hành làm là cấp phát một phần memory dành riêng cho process rồi áp dụng một memory layout được định nghĩa trước. Memory layout được định nghĩa trước này ít nhiều giống nhau trong các hệ điều hành khác nhau, đặc biệt là trong các hệ điều hành Unix-like.

Trong chương này, chúng ta sẽ khám phá cấu trúc của memory layout này, và một số thuật ngữ quan trọng và hữu ích được giới thiệu.

Memory layout của một process thông thường được chia thành nhiều phần. Mỗi phần được gọi là một *segment*. Mỗi <a id="_idIndexMarker291"></a>segment là một vùng memory có một nhiệm vụ xác định và nó được dự định để lưu một loại dữ liệu cụ thể. Bạn có thể thấy danh sách sau gồm các segment là một phần của <a id="_idIndexMarker292"></a>memory layout của một process đang chạy:

- Uninitialized data segment hay segment **Block Started by Symbol** (**BSS**)
- Segment Data
- Segment Text hay segment Code
- Segment Stack
- Segment Heap

Trong các phần sau, chúng ta sẽ nghiên cứu riêng từng segment này, và chúng ta thảo luận cách chúng góp phần vào việc thực thi một chương trình. Trong chương tiếp theo, chúng ta sẽ tập trung vào các segment Stack và Heap và chúng ta sẽ thảo luận kỹ lưỡng về chúng. Như một phần của hành trình, hãy giới thiệu một số công cụ giúp chúng ta xem xét memory trước khi đi vào chi tiết của các segment trên.

<a id="_idParaDest-72"></a>

## Khám phá cấu trúc memory

Các hệ <a id="_idIndexMarker293"></a>điều hành Unix-like cung cấp một tập công cụ để xem xét các memory segment của một process. Bạn sẽ học trong phần này rằng một số segment nằm bên trong executable object file, và các segment khác được tạo ra một cách động vào lúc runtime, khi process được sinh ra.

Như bạn hẳn đã biết từ hai chương trước, một executable object file và một process không phải là cùng một thứ, do đó có thể kỳ vọng có các công cụ khác nhau để xem xét mỗi thứ.

Từ các chương trước, chúng ta biết rằng một executable object file chứa các machine instruction, và nó được compiler tạo ra. Nhưng một process là một chương trình đang chạy được sinh ra bằng cách thực thi một executable object file, chiếm một vùng của main memory, và CPU liên tục nạp và thực thi các instruction của nó.

Một process là một thực thể sống đang được thực thi bên trong hệ điều hành, trong khi executable object file chỉ là một file chứa một layout ban đầu được làm sẵn đóng vai trò cơ sở để sinh ra các process tương lai. Đúng là trong memory layout của một process đang chạy, một số segment đến trực tiếp từ executable object file gốc, và phần còn lại được xây dựng một cách động vào lúc runtime trong khi process đang được nạp. Layout <a id="_idIndexMarker294"></a>thứ nhất được gọi là **static memory layout**, và layout <a id="_idIndexMarker295"></a>thứ hai được gọi là **dynamic memory layout**.

Cả static memory layout lẫn dynamic memory layout đều có một tập segment được định trước. Nội dung của static memory layout được compiler viết sẵn vào executable object file khi biên dịch source code. Mặt khác, nội dung của dynamic memory layout được <a id="_idIndexMarker296"></a>viết bởi các instruction của process khi chúng cấp phát memory cho biến và mảng, và sửa đổi chúng theo logic của chương trình.

Với tất cả những gì đã nói, chúng ta có thể đoán nội dung của static memory layout chỉ bằng cách nhìn vào source code hoặc object file đã biên dịch. Nhưng điều này không dễ đến thế đối với dynamic memory layout vì nó không thể được xác định mà không chạy chương trình. Ngoài ra, các lần chạy khác nhau của cùng một executable file có thể dẫn đến nội dung khác nhau trong dynamic memory layout. Nói cách khác, nội dung động của một process là độc nhất đối với process đó và nó nên được điều tra trong khi process vẫn đang chạy.

Hãy bắt đầu với việc xem xét static memory layout của một process.

<a id="_idParaDest-73"></a>

## Thăm dò static memory layout

Các <a id="_idIndexMarker297"></a>công cụ được dùng để xem xét static memory layout thường làm việc trên object file. Để có cái nhìn sâu sắc ban đầu, chúng ta sẽ bắt đầu với một ví dụ, *ví dụ 4.1*, là một chương trình C tối thiểu không có bất kỳ biến hay logic nào trong đó:

```
int main(int argc, char** argv) {
  return 0;
}
```

*Code Box 4-1 [ExtremeC_examples_chapter4_1.c]: Một chương trình C tối thiểu*

Trước tiên, chúng ta cần biên dịch chương trình trên. Chúng ta biên dịch nó trên Linux bằng `gcc`:

```
$ gcc ExtremeC_examples_chapter4_1.c -o ex4_1-linux.out
$
```

*Shell Box 4-1: Biên dịch ví dụ 4.1 bằng gcc trên Linux*

Sau khi biên dịch thành công và có được binary executable cuối cùng đã link, chúng ta có một executable object file tên là `ex4_1-linux.out`. File này chứa một static memory layout được định trước riêng cho hệ điều hành Linux, và nó sẽ tồn tại trong mọi process tương lai được sinh ra dựa trên executable file này.

Lệnh `size` là công cụ đầu tiên mà chúng ta muốn giới thiệu. Nó có thể được dùng để in ra static memory layout của một executable object file.

Bạn có thể thấy cách dùng lệnh `size` để xem các segment khác nhau có trong static memory layout như sau:

```
$ size ex4_1-linux.out
   text    data     bss     dec     hex   filename
   1099     544       8    1651     673   ex4_1-linux.out
$
```

*Shell Box 4-2: Dùng lệnh size để xem các segment tĩnh của ex4_1-linux.out*

Như bạn thấy, chúng ta có các segment Text, Data và BSS như một phần của static layout. Các <a id="_idIndexMarker298"></a>kích thước được hiển thị tính bằng byte.

Giờ, hãy biên dịch cùng code, *ví dụ 4.1*, trên một hệ điều hành khác. Chúng ta đã chọn macOS và chúng ta sẽ dùng compiler `clang`:

```
$ clang ExtremeC_examples_chapter4_1.c -o ex4_1-macos.out
$
```

*Shell Box 4-3: Biên dịch ví dụ 4.1 bằng clang trên macOS*

Vì macOS là một hệ điều hành POSIX-compliant giống như Linux, và lệnh `size` được quy định là một phần của các chương trình tiện ích POSIX, macOS cũng hẳn có lệnh `size`. Do đó, chúng ta có thể dùng cùng lệnh để xem các memory segment tĩnh của `ex4_1-macos.out`:

```
$ size ex4_1-macos.out
__TEXT __DATA  __OBJC  others       dec         hex
4096   0       0       4294971392   4294975488  100002000
$ size -m ex4_1-macos.out
Segment __PAGEZERO: 4294967296
Segment __TEXT: 4096
    Section __text: 22
    Section __unwind_info: 72
    total 94
Segment __LINKEDIT: 4096
total 4294975488
$
```

*Shell Box 4-4: Dùng lệnh size để xem các segment tĩnh của ex4_1-macos.out*

Trong shell box trên, chúng ta đã chạy lệnh `size` hai lần; lần chạy thứ hai cho chúng ta thêm chi tiết về các memory segment tìm được. Có thể bạn đã nhận thấy rằng chúng ta có các segment Text và Data trong macOS, giống như Linux, nhưng không có segment BSS. Lưu ý rằng segment BSS cũng tồn tại trong macOS, nhưng nó không được hiển thị trong output của `size`. Vì segment BSS chứa các biến global chưa khởi tạo, không cần cấp phát byte nào như một phần của object file và chỉ cần biết cần bao nhiêu byte để lưu những biến global đó là đủ.

Trong các shell box trên, có một điểm thú vị cần lưu ý. Kích thước của segment Text là 1,099 byte trong Linux trong khi nó là 4 KB trong macOS. Cũng có thể thấy rằng segment Data cho một chương trình C tối thiểu có kích thước non-zero trong Linux, nhưng nó trống trong macOS. Rõ ràng <a id="_idIndexMarker299"></a>là các chi tiết memory low-level khác nhau trên các platform khác nhau.

Bất chấp những khác biệt nhỏ này giữa Linux và macOS, chúng ta có thể thấy rằng cả hai platform đều có các segment Text, Data và BSS như một phần của static layout của chúng. Từ giờ trở đi, chúng ta dần dần giải thích mỗi segment này được dùng để làm gì. Trong các phần sắp tới, chúng ta sẽ thảo luận riêng từng segment và đưa ra một ví dụ hơi khác *ví dụ 4.1* cho mỗi segment, để xem mỗi segment phản ứng khác nhau thế nào với những thay đổi nhỏ trong code.

<a id="_idParaDest-74"></a>

### Segment BSS

Chúng <a id="_idIndexMarker300"></a>ta bắt đầu với segment BSS. **BSS** là viết tắt của **Block Started by Symbol**. Về mặt lịch sử, cái tên được dùng để chỉ các vùng được dành riêng <a id="_idIndexMarker301"></a>cho các word chưa khởi tạo. Về cơ bản, đó <a id="_idIndexMarker302"></a>là mục đích chúng ta dùng segment BSS; hoặc cho các biến global chưa khởi tạo hoặc cho các biến global được đặt bằng không.

Hãy mở rộng *ví dụ 4.1* bằng cách thêm vài biến global chưa khởi tạo. Bạn sẽ thấy rằng các biến global chưa khởi tạo sẽ góp phần vào segment BSS. Code box sau minh họa *ví dụ 4.2*:

```
int global_var1;
int global_var2;
int global_var3 = 0;
int main(int argc, char** argv) {
  return 0;
}
```

*Code Box 4-2 [ExtremeC_examples_chapter4_2.c]: Một chương trình C tối thiểu với vài biến global hoặc chưa khởi tạo hoặc được đặt bằng không*

Các số nguyên `global_var1`, `global_var2` và `global_var3` là các biến global chưa khởi tạo. Để quan sát những thay đổi được thực hiện với executable object file thu được trên Linux, so với *ví dụ 4.1*, chúng ta lại chạy lệnh `size`:

```
$ gcc ExtremeC_examples_chapter4_2.c -o ex4_2-linux.out
$ size ex4_2-linux.out
   text    data     bss     dec     hex   filename
   1099     544      16    1659     67b   ex4_2-linux.out
$
```

*Shell Box 4-5: Dùng lệnh size để xem các segment tĩnh của ex4_2-linux.out*

Nếu bạn so sánh output trên với một output tương tự từ *ví dụ 4.1*, bạn sẽ nhận thấy rằng kích thước của segment BSS đã thay đổi. Nói cách khác, việc khai báo các biến global *không* được khởi tạo hoặc được đặt bằng không sẽ cộng thêm vào segment BSS. Những biến global đặc biệt này <a id="_idIndexMarker303"></a>là một phần của static layout và chúng trở nên <a id="_idIndexMarker304"></a>được cấp phát sẵn khi một process đang được nạp, và chúng không bao giờ bị giải phóng chừng nào process còn sống. Nói cách khác, chúng có một vòng đời tĩnh (static lifetime).

> **Lưu ý**:
>
> Vì những mối quan tâm về thiết kế, chúng ta thường thích dùng biến local trong các thuật toán của mình. Có quá nhiều biến global có thể làm tăng kích thước binary. Ngoài ra, việc giữ dữ liệu nhạy cảm trong phạm vi global có thể gây ra những lo ngại về bảo mật. Các vấn đề concurrency, đặc biệt là data race, ô nhiễm namespace, quyền sở hữu không rõ, và việc có quá nhiều biến trong phạm vi global, là một số phức tạp mà biến global gây ra.

Hãy biên dịch *ví dụ 4.2* trên macOS và xem output của lệnh `size`:

```
$ clang ExtremeC_examples_chapter4_2.c -o ex4_2-macos.out
$ size ex4_2-macos.out
__TEXT __DATA  __OBJC  others       dec         hex
4096   4096       0    4294971392   4294979584  100003000
$ size -m ex4_2-macos.out
Segment __PAGEZERO: 4294967296
Segment __TEXT: 4096
    Section __text: 22
    Section __unwind_info: 72
    total 94
Segment __DATA: 4096
    Section __common: 12
    total 12
Segment __LINKEDIT: 4096
total 4294979584
$
```

*Shell Box 4-6: Dùng lệnh size để xem các segment tĩnh của ex4_2-macos.out*

Và một lần nữa, nó khác với Linux. Trong Linux, chúng ta đã có 8 byte được cấp phát sẵn cho segment BSS, khi chúng ta không có biến global nào. Trong *ví dụ 4.2*, chúng ta đã thêm ba biến global chưa khởi tạo mới có tổng kích thước là 12 byte, và compiler C của Linux đã mở rộng segment BSS thêm 8 byte. Nhưng trong macOS, chúng ta vẫn không có segment BSS trong output của `size`, nhưng compiler đã mở rộng segment `data` từ 0 byte lên 4KB, đó <a id="_idIndexMarker305"></a>là kích thước page mặc định trong macOS. Điều này<a id="_idIndexMarker306"></a> có nghĩa là `clang` đã cấp phát một memory page mới cho segment `data` bên trong layout. Một lần nữa, điều này đơn giản cho thấy các chi tiết của memory layout có thể khác nhau đến mức nào trên các platform khác nhau.

> **Lưu ý**:
>
> Khi cấp phát memory, chương trình cần cấp phát bao nhiêu byte không quan trọng. *Allocator* luôn lấy memory theo đơn vị *memory page* cho đến khi tổng kích thước được cấp phát bao trùm nhu cầu của chương trình. Có thể tìm thấy thêm thông tin <a id="_idIndexMarker307"></a>về memory allocator của Linux ở đây: [https://www.kernel.org/doc/gorman/html/understand/understand009.html](https://www.kernel.org/doc/gorman/html/understand/understand009.html).

Trong *Shell Box 4-6*, chúng ta có một section tên là `__common`, bên trong segment `_DATA`, có kích thước 12 byte, và thực tế nó chỉ segment BSS vốn không được hiển thị là BSS trong output của `size`. Nó chỉ 3 biến global kiểu số nguyên chưa khởi tạo hay 12 byte (mỗi số nguyên là 4 byte). Đáng lưu ý rằng các biến global chưa khởi tạo được đặt bằng *không* theo mặc định. Không có giá trị nào khác có thể hình dung được cho các biến chưa khởi tạo.

Giờ hãy nói về segment tiếp theo trong static memory layout; segment Data.

<a id="_idParaDest-75"></a>

### Segment Data

Để <a id="_idIndexMarker308"></a>cho thấy <a id="_idIndexMarker309"></a>loại biến nào được lưu trong segment Data, chúng ta sẽ khai báo thêm biến global, nhưng lần này chúng ta khởi tạo chúng bằng các giá trị non-zero. Ví dụ sau, *ví dụ 4.3*, mở rộng *ví dụ 4.2* và thêm hai biến global đã khởi tạo mới:

```
int global_var1;
int global_var2;
int global_var3 = 0;
double global_var4 = 4.5;
char global_var5 = 'A';
int main(int argc, char** argv) {
  return 0;
}
```

*Code Box 4-3 [ExtremeC_examples_chapter4_3.c]: Một chương trình C tối thiểu với cả biến global đã khởi tạo lẫn chưa khởi tạo*

Shell box <a id="_idIndexMarker310"></a>sau thể hiện output của lệnh `size`, trên <a id="_idIndexMarker311"></a>Linux, cho *ví dụ 4.3*:

```
$ gcc ExtremeC_examples_chapter4_3.c -o ex4_3-linux.out
$ size ex4_3-linux.out
   text    data     bss     dec     hex filename
   1099     553      20    1672     688 ex4_3-linux.out
$
```

*Shell Box 4-7: Dùng lệnh size để xem các segment tĩnh của ex4_3-linux.out*

Chúng ta biết rằng segment Data được dùng để lưu các biến global đã khởi tạo được đặt bằng một giá trị non-zero. Nếu bạn so sánh output của lệnh `size` cho *ví dụ 4.2* và *4.3*, bạn có thể dễ dàng thấy rằng segment Data đã tăng thêm 9 byte, là tổng kích thước của hai biến global mới được thêm vào (một `double` 8-byte và một `char` 1-byte).

Hãy xem những thay đổi trên macOS:

```
$ clang ExtremeC_examples_chapter4_3.c -o ex4_3-macos.out
$ size ex4_3-macos.out
__TEXT __DATA  __OBJC  others       dec         hex
4096   4096       0    4294971392   4294979584  100003000
$ size -m ex4_3-macos.out
Segment __PAGEZERO: 4294967296
Segment __TEXT: 4096
    Section __text: 22
    Section __unwind_info: 72
    total 94
Segment __DATA: 4096
    Section __data: 9
    Section __common: 12
    total 21
Segment __LINKEDIT: 4096
total 4294979584
$
```

*Shell Box 4-8: Dùng lệnh size để xem các segment tĩnh của ex4_3-macos.out*

Trong lần chạy đầu tiên, chúng ta không thấy thay đổi nào vì kích thước của mọi biến global cộng lại vẫn còn thấp hơn rất nhiều so với 4KB. Nhưng trong lần chạy thứ hai, chúng ta thấy một section mới như một phần của segment `_DATA`; section `__data`. Memory được cấp phát cho section này là 9 byte, và nó phù hợp <a id="_idIndexMarker312"></a>với kích thước của các biến global đã khởi tạo <a id="_idIndexMarker313"></a>mới được đưa vào. Và vẫn vậy, chúng ta có 12 byte cho các biến global chưa khởi tạo như chúng ta đã có trong *ví dụ 4.2*, và trên macOS.

Thêm một lưu ý nữa, lệnh `size` chỉ hiển thị kích thước của các segment, chứ không hiển thị nội dung của chúng. Có những lệnh khác, riêng cho từng hệ điều hành, có thể được dùng để xem xét nội dung của các segment có trong một object file. Chẳng hạn, trong Linux, bạn có các lệnh `readelf` và `objdump` để xem nội dung của các file *ELF*. Những công cụ này cũng có thể được dùng để thăm dò static memory layout bên trong các object file. Như một phần của hai chương trước, chúng ta đã khám phá một số lệnh này.

Ngoài biến global, chúng ta có thể có một số biến static được khai báo bên trong một hàm. Những biến này giữ giá trị của chúng khi gọi cùng một hàm nhiều lần. Những biến này có thể được lưu hoặc trong segment Data hoặc trong segment BSS tùy theo platform và việc chúng có được khởi tạo hay không. Code box sau minh họa cách khai báo một số biến static bên trong một hàm:

```
void func() {
  static int i;
  static int j = 1;
  ...
}
```

*Code Box 4-4: Khai báo hai biến static, một đã khởi tạo và một chưa khởi tạo*

Như bạn thấy trong *Code Box 4-4*, các biến `i` và `j` là static. Biến `i` chưa khởi tạo và biến `j` được khởi tạo với giá trị `1`. Bạn vào và rời khỏi hàm `func` bao nhiêu lần không quan trọng, những biến này giữ giá trị gần đây nhất của chúng.

Để giải thích thêm việc này được làm thế nào, vào lúc runtime, hàm `func` có quyền truy cập vào những biến này nằm trong segment Data hoặc segment BSS, vốn có vòng đời tĩnh. Về cơ bản, đó là lý do những biến này được gọi là *static*. Chúng ta biết rằng biến `j` <a id="_idIndexMarker314"></a>nằm trong segment Data đơn giản <a id="_idIndexMarker315"></a>vì nó có một giá trị ban đầu, và biến `i` được cho là nằm bên trong segment BSS vì nó chưa được khởi tạo.

Giờ, chúng ta muốn giới thiệu lệnh thứ hai để xem xét nội dung của segment BSS. Trong Linux, lệnh `objdump` có thể được dùng để in ra nội dung của các memory segment có trong một object file. Lệnh tương ứng trong macOS là `gobjdump`, lệnh này phải được cài đặt trước.

Như một phần của *ví dụ 4.4*, chúng ta cố xem xét executable object file thu được để tìm dữ liệu được ghi vào segment Data dưới dạng một số biến global. Code box sau thể hiện code cho *ví dụ 4.4*:

```
int     x = 33;            // 0x00000021
int     y = 0x12153467;
char z[6] = "ABCDE";
int main(int argc, char**argv) {
  return 0;
}
```

*Code Box 4-5 [ExtremeC_examples_chapter4_4.c]: Một số biến global đã khởi tạo sẽ được ghi vào segment Data*

Code trên dễ theo dõi. Nó chỉ khai báo ba biến global với một số giá trị ban đầu. Sau khi biên dịch, chúng ta cần dump nội dung của segment Data để tìm các giá trị đã được ghi.

Các lệnh sau sẽ minh họa cách biên dịch và dùng `objdump` để xem nội dung của segment Data:

```
$ gcc ExtremeC_examples_chapter4_4.c -o ex4_4.out
$ objdump -s -j .data ex4_4.out
a.out:     file format elf64-x86-64
Contents of section .data:
 601020 00000000 00000000 00000000 00000000  ...............
 601030 21000000 67341512 41424344 4500      !....4..ABCDE.
$
```

*Shell Box 4-9: Dùng lệnh objdump để xem nội dung của segment Data*

Hãy giải thích output trên, và đặc biệt là nội dung của section `.data`, nên được đọc thế nào. Cột đầu tiên bên trái là cột address. Bốn cột tiếp theo là nội dung, và mỗi cột hiển thị `4` byte dữ liệu. Vì vậy, trong mỗi hàng, chúng ta có nội dung của 16 byte. Cột cuối cùng bên phải hiển thị biểu diễn ASCII của cùng các byte được hiển thị ở các cột giữa. Một ký tự dấu chấm có nghĩa là <a id="_idIndexMarker316"></a>ký tự không thể được hiển thị bằng các ký tự chữ-số <a id="_idIndexMarker317"></a>. Lưu ý rằng tùy chọn `-s` bảo `objdump` hiển thị toàn bộ nội dung của section được chọn và tùy chọn `-j .data` bảo nó hiển thị nội dung của section `.data`.

Dòng đầu tiên là 16 byte được lấp đầy bằng số không. Không có biến nào được lưu ở đây, vì vậy chẳng có gì đặc biệt đối với chúng ta. Dòng thứ hai hiển thị nội dung của segment Data bắt đầu tại address `0x601030`. 4 byte đầu tiên là giá trị được lưu trong biến `x` có trong *ví dụ 4.4*. 4 byte tiếp theo cũng chứa giá trị cho biến `y`. 6 byte cuối cùng là các ký tự bên trong mảng `z`. Nội dung của `z` có thể được thấy rõ ở cột cuối cùng.

Nếu bạn chú ý đủ đến nội dung được hiển thị trong *Shell Box 4-9*, bạn sẽ thấy rằng mặc dù chúng ta viết 33, ở cơ số thập phân, là `0x00000021` ở cơ số hexadecimal, nó được lưu khác đi trong segment. Nó được lưu là `0x21000000`. Điều này cũng đúng với nội dung của biến `y`. Chúng ta đã viết nó là `0x12153467`, nhưng nó được lưu khác đi là `0x67341512`. Có vẻ như thứ tự các byte bị đảo ngược.

Hiệu ứng được giải thích là do khái niệm *endianness*. Nói chung, chúng ta có hai loại endianness khác nhau, *big-endian* và *little-endian*. Giá trị `0x12153467` là biểu diễn big-endian cho số `0x12153467`, vì byte lớn nhất, `0x12`, đứng trước. Nhưng giá trị `0x67341512` là biểu diễn little-endian cho số `0x12153467`, vì byte nhỏ nhất, `0x67`, đứng trước.

Dù endianness là gì, chúng ta luôn đọc đúng giá trị trong C. Endianness là một thuộc tính của CPU và với một CPU khác, bạn có thể có một thứ tự byte khác trong các object file cuối cùng. Đây là một trong những lý do tại sao bạn không thể chạy một executable object file trên phần cứng có endianness khác.

Sẽ thú vị khi xem cùng output trên một máy macOS. Shell box sau minh họa cách dùng lệnh `gobjdump` để xem nội dung của segment Data:

```
$ gcc ExtremeC_examples_chapter4_4.c -o ex4_4.out
$ gobjdump -s -j .data ex4_4.out
a.out:     file format mach-o-x86-64
Contents of section .data:
 100001000 21000000 67341512 41424344 4500      !...g4..ABCDE.
$
```

*Shell Box 4-10: Dùng lệnh gobjdump trên macOS để xem nội dung của segment Data*

Nó nên được đọc hoàn toàn giống output Linux có trong *Shell Code 4-9*. Như bạn thấy, trong macOS, không có các header số không 16-byte trong data segment. Endianness của nội dung <a id="_idIndexMarker318"></a>cũng cho thấy binary đã được biên dịch cho một bộ xử lý little-endian.

Như một <a id="_idIndexMarker319"></a>ghi chú cuối cùng trong phần này, các công cụ khác như `readelf` trong Linux và `dwarfdump` trong macOS có thể được dùng để xem xét nội dung của object file. Nội dung binary của object file cũng có thể được đọc bằng các công cụ như `hexdump`.

Trong phần sau, chúng ta sẽ thảo luận về segment Text và cách nó có thể được xem xét bằng `objdump`.

<a id="_idParaDest-76"></a>

### Segment Text

Như <a id="_idIndexMarker320"></a>chúng ta biết từ *Chương 2*, *Biên dịch và Liên kết (Compilation and Linking)*, linker ghi các instruction machine-level thu được vào executable <a id="_idIndexMarker321"></a>object file cuối cùng. Vì segment Text, hay Code segment, chứa mọi instruction machine-level của một chương trình, nó phải nằm trong executable object file, như một phần của static memory layout của nó. Những instruction này được bộ xử lý nạp và được thực thi vào lúc runtime khi process đang chạy.

Để đi sâu hơn, hãy xem segment Text của một executable object file thật. Vì mục đích này, chúng tôi đề xuất một ví dụ mới. Code box sau thể hiện *ví dụ 4.5*, và như bạn thấy, nó chỉ là một hàm `main` trống:

```
int main(int argc, char** argv) {
  return 0;
}
```

*Code Box 4-6 [ExtremeC_examples_chapter4_5.c]: Một chương trình C tối thiểu*

Chúng ta có thể dùng lệnh `objdump` để dump các phần khác nhau của executable object file thu được. Lưu ý rằng lệnh `objdump` chỉ có sẵn trong Linux, trong khi các hệ điều hành khác có bộ lệnh riêng để làm điều tương tự.

Shell <a id="_idIndexMarker322"></a>box sau minh họa việc dùng lệnh `objdump` để trích xuất nội dung của các section khác nhau có trong executable <a id="_idIndexMarker323"></a>object file thu được từ *ví dụ 4.5*. Lưu ý rằng output đã được rút gọn để chỉ hiển thị section tương ứng của hàm `main` và các instruction assembly của nó:

```
$ gcc ExtremeC_examples_chapter4_5.c -o ex4_5.out
$ objdump -S ex4_5.out
ex4_5.out:     file format elf64-x86-64
Disassembly of section .init:
0000000000400390 <_init>:
... truncated.
.
.
Disassembly of section .plt:
00000000004003b0 <__libc_start_main@plt-0x10>:
... truncated
00000000004004d6 <main>:
  4004d6:   55                      push   %rbp
  4004d7:   48 89 e5                mov    %rsp,%rbp
  4004da:   b8 00 00 00 00          mov    $0x0,%eax
  4004df:   5d                      pop    %rbp
  4004e0:   c3                      retq
  4004e1:   66 2e 0f 1f 84 00 00    nopw   %cs:0x0(%rax,%rax,1)
  4004e8:   00 00 00
  4004eb:   0f 1f 44 00 00          nopl   0x0(%rax,%rax,1)
00000000004004f0 <__libc_csu_init>:
... truncated
.
.
.
0000000000400564 <_fini>:
... truncated
$
```

*Shell Box 4-11: Dùng objdump để hiển thị nội dung của section tương ứng với hàm main*

Như bạn thấy trong shell box trên, có nhiều section khác nhau chứa instruction machine-level: các section `.text`, `.init` và `.plt` và một số section khác, tất cả cùng nhau cho phép một chương trình được nạp và chạy. Mọi section này đều là một phần của cùng segment Text có trong static memory layout, bên trong executable object file.

Chương trình C của chúng ta, được viết cho *ví dụ 4.5*, chỉ có một hàm, hàm `main`, nhưng như bạn thấy, executable object file cuối cùng có cả tá hàm khác.

Output trên, được thấy như một phần của *Shell Box 4-11*, cho thấy rằng hàm `main` không phải là hàm đầu tiên <a id="_idIndexMarker324"></a>được gọi trong một chương trình C và có <a id="_idIndexMarker325"></a>những logic trước và sau `main` cần được thực thi. Như đã giải thích trong *Chương 2*, *Biên dịch và Liên kết (Compilation and Linking)*, trong Linux, những hàm này thường được mượn từ library `glibc`, và chúng được linker ghép lại với nhau để tạo thành executable object file cuối cùng.

Trong phần sau, chúng ta bắt đầu thăm dò dynamic memory layout của một process.

<a id="_idParaDest-77"></a>

## Thăm dò dynamic memory layout

Dynamic <a id="_idIndexMarker326"></a>memory layout thực ra là memory runtime của một process, và nó tồn tại chừng nào process còn đang chạy. Khi bạn thực thi một <a id="_idIndexMarker327"></a>executable object file, một chương trình gọi là *loader* lo việc thực thi. Nó sinh ra một process mới và nó tạo ra memory layout ban đầu, vốn được dự định là động. Để tạo thành layout này, các segment có trong static layout sẽ được sao chép từ executable object file. Hơn thế nữa, hai segment mới cũng sẽ được thêm vào đó. Chỉ khi đó process mới có thể tiếp tục và bắt đầu chạy.

Tóm lại, chúng ta kỳ vọng có năm segment trong memory layout của một process đang chạy. Ba trong số những segment này được sao chép trực tiếp từ static layout có trong executable object file. Hai segment mới được thêm vào được gọi là các segment Stack và Heap. Những segment này là động, và chúng chỉ tồn tại khi process đang chạy. Điều này có nghĩa là bạn không thể tìm thấy bất kỳ dấu vết nào của chúng trong executable object file.

Trong phần này, mục tiêu cuối cùng của chúng ta là thăm dò các segment Stack và Heap và giới thiệu các công cụ và vị trí trong một hệ điều hành có thể được dùng cho mục đích này. Thỉnh thoảng, chúng ta có thể gọi những segment này là dynamic memory layout của process, mà không xét đến ba segment khác được sao chép từ object file, nhưng bạn nên luôn nhớ rằng dynamic memory của một process gồm cả năm segment cùng nhau.

Segment Stack là <a id="_idIndexMarker328"></a>vùng memory mặc định mà chúng ta cấp phát biến từ đó. Đó là một vùng bị giới hạn về kích thước, và bạn không thể giữ các đối tượng lớn trong đó. Ngược lại, segment Heap là một vùng memory lớn hơn và có thể điều chỉnh được, có thể được dùng để giữ các đối tượng lớn và các mảng khổng lồ. Làm việc với segment Heap đòi hỏi API riêng của nó, mà chúng ta giới thiệu như một phần của phần thảo luận.

Hãy nhớ, dynamic memory layout khác với *Dynamic Memory Allocation*. Bạn không nên trộn lẫn hai khái niệm này, vì chúng chỉ hai thứ khác nhau! Khi tiến lên, chúng ta sẽ học thêm về các loại cấp phát memory khác nhau, đặc biệt là dynamic memory allocation.

Năm segment có trong dynamic memory của một process chỉ các phần của main memory đã được *cấp phát*, *dành riêng* và *private* cho một process đang chạy. Những segment này, ngoại trừ segment Text vốn tĩnh và không đổi theo đúng nghĩa đen, đều là động theo nghĩa là nội dung của chúng luôn thay đổi vào lúc runtime. Đó là do những segment này liên tục bị sửa đổi bởi thuật toán mà process đang thực thi.

Việc xem xét dynamic memory layout của một process đòi hỏi thủ tục riêng của nó. Điều này ngụ ý rằng chúng ta cần có một process đang chạy trước khi có thể thăm dò dynamic memory layout của nó. Điều này đòi hỏi chúng ta viết các ví dụ vẫn chạy trong một khoảng thời gian khá dài để giữ dynamic memory của chúng tại chỗ. Sau đó, chúng ta có thể dùng các công cụ xem xét để nghiên cứu cấu trúc dynamic memory của chúng.

Trong phần sau, chúng ta đưa ra một ví dụ về cách thăm dò cấu trúc của dynamic memory.

<a id="_idParaDest-78"></a>

### Memory mapping

Hãy <a id="_idIndexMarker330"></a>bắt đầu với một ví dụ đơn giản. *Ví dụ 4.6* sẽ chạy trong một khoảng thời gian không xác định. Bằng cách này, chúng ta có một process <a id="_idIndexMarker331"></a>không bao giờ chết, và trong lúc đó, chúng ta có thể thăm dò cấu trúc memory của nó. Và dĩ nhiên, chúng ta có thể *kill* nó bất cứ khi nào xem xét xong. Bạn có thể tìm thấy ví dụ trong code box sau:

```
#include <unistd.h> // Needed for sleep function
int main(int argc, char** argv) {
  // Infinite loop
  while (1) {
    sleep(1); // Sleep 1 second
  };
  return 0;
}
```

*Code Box 4-6 [ExtremeC_examples_chapter4_6.c]: Ví dụ 4.6 được dùng để thăm dò dynamic memory layout*

Như bạn thấy, code chỉ là một vòng lặp vô hạn, nghĩa là process sẽ chạy mãi mãi. Vì vậy, chúng ta có đủ thời gian để xem xét memory của process. Trước tiên hãy build nó.

> **Lưu ý**:
>
> Header `unistd.h` chỉ có sẵn trên các hệ điều hành Unix-like; chính xác hơn, trong các hệ điều hành POSIX-compliant. Điều này có nghĩa là trên Microsoft Windows, vốn không POSIX-compliant, bạn phải include header `windows.h` thay vào đó.

Shell box sau cho thấy cách biên dịch ví dụ trên Linux:

```
$ gcc ExtremeC_examples_chapter4_6.c -o ex4_6.out
$
```

*Shell Box 4-12: Biên dịch ví dụ 4.6 trên Linux*

Sau đó, chúng ta <a id="_idIndexMarker332"></a>chạy nó như sau. Để dùng <a id="_idIndexMarker333"></a>cùng dấu nhắc để đưa ra các lệnh tiếp theo trong khi process đang chạy, chúng ta nên khởi động process ở chế độ chạy nền:

```
$ ./ ex4_6.out &
[1] 402
$
```

*Shell Box 4-13: Chạy ví dụ 4.6 ở chế độ chạy nền*

Process giờ đang chạy ở chế độ nền. Theo output, PID của process vừa được khởi động là 402, và chúng ta sẽ dùng PID này để kill nó sau này. PID khác nhau mỗi lần bạn chạy một chương trình; do đó, có lẽ bạn sẽ thấy một PID khác trên máy tính của mình. Lưu ý rằng bất cứ khi nào bạn chạy một process ở chế độ nền, dấu nhắc shell trở lại ngay lập tức, và bạn có thể đưa ra các lệnh tiếp theo.

> **Lưu ý**:
>
> Nếu bạn có PID (Process ID) của một process, bạn có thể dễ dàng kết thúc nó bằng lệnh `kill`. Ví dụ, nếu PID là 402, lệnh sau sẽ hoạt động trong các hệ điều hành Unix-like: `kill -9 402`.

PID là định danh mà chúng ta dùng để xem xét memory của một process. Thông thường, một hệ điều hành cung cấp cơ chế cụ thể riêng của nó để truy vấn các thuộc tính khác nhau của một process dựa trên PID của nó. Nhưng ở đây, chúng ta chỉ quan tâm đến dynamic memory của một process và chúng ta sẽ dùng cơ chế có sẵn trong Linux để tìm hiểu thêm về cấu trúc dynamic memory của process đang chạy ở trên.

Trên một máy Linux, thông tin về một process có thể được tìm thấy trong các file dưới thư mục `/proc`. Nó dùng một <a id="_idIndexMarker336"></a>filesystem đặc biệt gọi là *procfs*. Filesystem này không phải là một filesystem thông thường dành để giữ các file thật, mà nó giống một interface phân cấp để truy vấn về các thuộc tính khác nhau của một process riêng lẻ hay của toàn bộ hệ thống hơn.

> **Lưu ý**:
>
> procfs không chỉ giới hạn ở Linux. Nó thường là một phần của các hệ điều hành Unix-like, nhưng không phải hệ điều hành Unix-like nào cũng dùng nó. Ví dụ, FreeBSD dùng filesystem này, nhưng macOS thì không.

Giờ, chúng ta sẽ dùng procfs để xem cấu trúc memory của process đang chạy. Memory của một process gồm một số *memory mapping*. Mỗi memory mapping biểu diễn một vùng memory dành riêng được ánh xạ tới một file hay segment cụ thể như một phần của process. Ngay sau đây, bạn sẽ thấy rằng cả segment Stack lẫn Heap đều có memory mapping riêng trong mỗi process.

Một trong những việc bạn có thể dùng procfs để làm là quan sát các memory mapping hiện tại của process. Tiếp theo, chúng ta sẽ thể hiện điều này.

Chúng ta biết rằng process đang chạy với PID 402. Dùng lệnh `ls`, chúng ta có thể thấy nội dung của thư mục `/proc/402`, được thể hiện như sau:

```
$ ls -l /proc/402
total of 0
dr-xr-xr-x  2 root root 0 Jul 15 22:28 attr
-rw-r--r--  1 root root 0 Jul 15 22:28 autogroup
-r--------  1 root root 0 Jul 15 22:28 auxv
-r--r--r--  1 root root 0 Jul 15 22:28 cgroup
--w-------  1 root root 0 Jul 15 22:28 clear_refs
-r--r--r--  1 root root 0 Jul 15 22:28 cmdline
-rw-r--r--  1 root root 0 Jul 15 22:28 comm
-rw-r--r--  1 root root 0 Jul 15 22:28 coredump_filter
-r--r--r--  1 root root 0 Jul 15 22:28 cpuset
lrwxrwxrwx  1 root root 0 Jul 15 22:28 cwd -> /root/codes
-r--------  1 root root 0 Jul 15 22:28 environ
lrwxrwxrwx  1 root root 0 Jul 15 22:28 exe -> /root/codes/a.out
dr-x------  2 root root 0 Jul 15 22:28 fd
dr-x------  2 root root 0 Jul 15 22:28 fdinfo
-rw-r--r--  1 root root 0 Jul 15 22:28 gid_map
-r--------  1 root root 0 Jul 15 22:28 io
-r--r--r--  1 root root 0 Jul 15 22:28 limits
...
$
```

*Shell Box 4-14: Liệt kê nội dung của /proc/402*

Như bạn có thể thấy, có rất nhiều file và thư mục dưới thư mục `/proc/402`. Mỗi file và thư mục này tương ứng với một thuộc tính cụ thể của process. Để truy vấn các <a id="_idIndexMarker337"></a>memory mapping của process, chúng ta <a id="_idIndexMarker338"></a>phải xem nội dung của file `maps` dưới thư mục PID. Chúng ta dùng lệnh `cat` để dump nội dung của file `/proc/402/maps`. Nó có thể được thấy như sau:

```
$ cat /proc/402/maps
00400000-00401000 r-xp 00000000 08:01 790655              .../extreme_c/4.6/ex4_6.out
00600000-00601000 r--p 00000000 08:01 790655              .../extreme_c/4.6/ex4_6.out
00601000-00602000 rw-p 00001000 08:01 790655              .../extreme_c/4.6/ex4_6.out
7f4ee16cb000-7f4ee188a000 r-xp 00000000 08:01 787362      /lib/x86_64-linux-gnu/libc-2.23.so
7f4ee188a000-7f4ee1a8a000 ---p 001bf000 08:01 787362      /lib/x86_64-linux-gnu/libc-2.23.so
7f4ee1a8a000-7f4ee1a8e000 r--p 001bf000 08:01 787362      /lib/x86_64-linux-gnu/libc-2.23.so
7f4ee1a8e000-7f4ee1a90000 rw-p 001c3000 08:01 787362      /lib/x86_64-linux-gnu/libc-2.23.so
7f4ee1a90000-7f4ee1a94000 rw-p 00000000 00:00 0
7f4ee1a94000-7f4ee1aba000 r-xp 00000000 08:01 787342      /lib/x86_64-linux-gnu/ld-2.23.so
7f4ee1cab000-7f4ee1cae000 rw-p 00000000 00:00 0
7f4ee1cb7000-7f4ee1cb9000 rw-p 00000000 00:00 0
7f4ee1cb9000-7f4ee1cba000 r--p 00025000 08:01 787342      /lib/x86_64-linux-gnu/ld-2.23.so
7f4ee1cba000-7f4ee1cbb000 rw-p 00026000 08:01 787342      /lib/x86_64-linux-gnu/ld-2.23.so
7f4ee1cbb000-7f4ee1cbc000 rw-p 00000000 00:00 0
7ffe94296000-7ffe942b7000 rw-p 00000000 00:00 0           [stack]
7ffe943a0000-7ffe943a2000 r--p 00000000 00:00 0           [vvar]
7ffe943a2000-7ffe943a4000 r-xp 00000000 00:00 0           [vdso]
ffffffffff600000-ffffffffff601000 r-xp 00000000 00:00 0   [vsyscall]
$
```

*Shell Box 4-15: Dump nội dung của /proc/402/maps*

Như bạn thấy trong *Shell Box 4-15*, kết quả gồm một số hàng. Mỗi hàng biểu diễn một memory mapping cho biết một dải memory address (một vùng) đã được <a id="_idIndexMarker339"></a>cấp phát và ánh xạ tới một file <a id="_idIndexMarker340"></a>hay segment cụ thể trong dynamic memory layout của process. Mỗi mapping có một số trường được phân tách bằng một hoặc nhiều dấu space. Tiếp theo, bạn có thể tìm thấy mô tả của những trường này từ trái sang phải:

- **Address range** (dải address): đây là các address bắt đầu và kết thúc của dải được ánh xạ. Bạn có thể <a id="_idIndexMarker341"></a>tìm thấy một đường dẫn file phía trước chúng nếu vùng được ánh xạ tới một file. Đây là một cách khéo léo để ánh xạ cùng một shared object file đã nạp trong nhiều process khác nhau. Chúng ta đã nói về điều này như một phần của *Chương 3*, *Object File*.
- **Permissions** (quyền): trường <a id="_idIndexMarker342"></a>này cho biết nội dung có thể được thực thi (`x`), đọc (`r`) hay sửa đổi (`w`) hay không. Vùng cũng có thể được chia sẻ (`s`) bởi các process khác hoặc là private (`p`) chỉ cho process sở hữu.
- **Offset**: nếu <a id="_idIndexMarker343"></a>vùng được ánh xạ tới một file, đây là offset tính từ đầu file. Nó thường là 0 nếu vùng không được ánh xạ tới một file.
- **Device** (thiết bị): nếu <a id="_idIndexMarker344"></a>vùng được ánh xạ tới một file, đây sẽ là số hiệu thiết bị (ở dạng m:n), chỉ một thiết bị chứa file được ánh xạ. Ví dụ, đây sẽ là số hiệu thiết bị của ổ cứng chứa một shared object file.
- **Inode**: nếu <a id="_idIndexMarker345"></a>vùng được ánh xạ tới một file, file đó phải nằm trên một filesystem. Khi đó, trường này sẽ là số inode của <a id="_idIndexMarker346"></a>file trong filesystem đó. Một *inode* là một khái niệm trừu tượng bên trong các filesystem như *ext4*, vốn chủ yếu được dùng trong các hệ điều hành Unix-like. Mỗi inode có thể biểu diễn cả file lẫn thư mục. Mỗi inode có một số được dùng để truy cập nội dung của nó.
- **Pathname or description** (tên đường dẫn hay mô tả): nếu vùng được ánh xạ tới một file, đây sẽ là đường dẫn tới <a id="_idIndexMarker347"></a>file đó. Ngược lại, nó sẽ được để <a id="_idIndexMarker348"></a>trống, hoặc nó sẽ mô tả mục đích của vùng. Ví dụ, `[stack]` cho biết vùng thực ra là segment Stack.

File `maps` cung cấp thêm nhiều thông tin hữu ích hơn nữa về dynamic memory layout của một process. Chúng ta sẽ cần một ví dụ mới để minh họa điều này cho đúng.

<a id="_idParaDest-79"></a>

### Segment Stack

Trước tiên, hãy <a id="_idIndexMarker351"></a>nói thêm về segment Stack. Stack là một phần then chốt <a id="_idIndexMarker352"></a>của dynamic memory trong mọi process, và nó tồn tại trong gần như mọi architecture. Bạn đã thấy nó trong các memory mapping được mô tả là `[stack]`.

Cả segment Stack lẫn Heap đều có nội dung động liên tục thay đổi trong khi process đang chạy. Không dễ thấy nội dung động của những segment này và phần lớn thời gian bạn cần một debugger như `gdb` để đi qua các byte memory và đọc chúng trong khi một process đang chạy.

Như đã chỉ ra ở trên, segment Stack thường bị giới hạn về kích thước, và nó không phải là một chỗ tốt để lưu các đối tượng lớn. Nếu segment Stack đầy, process không thể thực hiện thêm lời gọi hàm nào vì cơ chế gọi hàm phụ thuộc rất nhiều vào chức năng của segment Stack.

Nếu segment Stack của một process trở nên đầy, process bị hệ điều hành kết thúc. *Stack overflow* là một lỗi nổi tiếng xảy ra khi segment Stack trở nên đầy. Chúng ta thảo luận về cơ chế gọi hàm trong các đoạn tiếp theo.

Như đã giải thích ở trên, segment Stack là vùng memory mặc định mà biến được cấp phát từ đó. Giả sử bạn đã khai báo một biến bên trong một hàm, như sau:

```
void func() {
  // The memory required for the following variable is
  // allocated from the stack segment.
  int a;
  ...
}
```

*Code Box 4-7: Khai báo một biến local có memory được cấp phát từ segment Stack*

Trong hàm trên, khi khai báo biến, chúng ta đã không nói gì để cho compiler biết biến nên được cấp phát từ segment nào. Vì vậy, compiler dùng segment Stack theo mặc định. Segment Stack là nơi đầu tiên mà việc cấp phát được thực hiện từ đó.

Như tên gọi của nó ngụ ý, nó là một *stack* (ngăn xếp). Nếu bạn khai báo một biến local, nó được cấp phát trên đỉnh segment Stack. Khi bạn rời khỏi phạm vi của biến local đã khai báo, compiler phải pop các biến local trước để đưa các biến local được khai báo ở phạm vi bên ngoài lên.

> **Lưu ý**:
>
> Stack, ở dạng <a id="_idIndexMarker355"></a>trừu tượng của nó, là một cấu trúc dữ liệu **First In, Last Out** (**FILO**) hay **Last In, First Out** (**LIFO**) <a id="_idIndexMarker356"></a>. Bất kể chi tiết hiện thực, mỗi mục được lưu (push) lên đỉnh stack, và nó sẽ bị các mục tiếp theo chôn vùi. Một mục không thể được pop ra mà không lấy đi các mục phía trên trước.

Biến không phải là thực thể duy nhất được lưu trong segment Stack. Bất cứ khi nào bạn thực hiện một lời gọi hàm, một mục mới gọi là *stack frame* được đặt lên đỉnh segment Stack. Nếu không, bạn <a id="_idIndexMarker357"></a>không thể quay lại hàm gọi hay trả kết quả về cho nơi gọi.

Có một cơ chế stack lành mạnh là điều sống còn để có một chương trình hoạt động được. Vì kích thước của Stack bị giới hạn, khai báo các biến nhỏ trong đó là một thực hành tốt. Ngoài ra, Stack không nên bị lấp đầy bởi quá nhiều stack frame do kết quả của việc thực hiện các lời gọi *đệ quy* vô hạn hay quá nhiều lời gọi hàm.

Từ một góc nhìn khác, segment Stack là một vùng được dùng bởi bạn, với tư cách lập trình viên, để giữ dữ liệu và khai báo các biến local được dùng trong thuật toán của bạn, và bởi hệ điều hành, với tư cách là người chạy chương trình, để giữ dữ liệu cần thiết cho các cơ chế nội bộ của nó để thực thi chương trình của bạn thành công.

Theo nghĩa này, bạn nên cẩn thận khi làm việc với segment này vì dùng sai nó hay làm hỏng dữ liệu của nó có thể làm gián đoạn process đang chạy hay thậm chí làm nó crash. Segment Heap là memory segment chỉ được lập trình viên quản lý. Chúng ta sẽ trình bày segment Heap trong phần tiếp theo.

Không dễ thấy nội dung của segment Stack từ bên ngoài nếu chúng ta chỉ dùng các công cụ đã giới thiệu để thăm dò static memory layout. Phần memory này chứa dữ liệu private <a id="_idIndexMarker358"></a>và có thể nhạy cảm. Nó cũng là private đối với <a id="_idIndexMarker359"></a>process, và các process khác không thể đọc hay sửa đổi nó.

Vì vậy, để đi qua memory Stack, người ta phải gắn một thứ gì đó vào một process và nhìn segment Stack qua con mắt của process đó. Việc này có thể được thực hiện bằng một chương trình *debugger*. Một debugger gắn vào một process và cho phép lập trình viên điều khiển process đích và điều tra nội dung memory của nó. Chúng ta sẽ dùng kỹ thuật này và xem xét memory Stack trong chương sau. Lúc này, chúng ta tạm để segment Stack để thảo luận thêm về segment Heap. Chúng ta sẽ quay lại Stack trong chương tiếp theo.

<a id="_idParaDest-80"></a>

### Segment Heap

Ví <a id="_idIndexMarker360"></a>dụ sau, *ví dụ 4.7*, cho thấy cách các memory <a id="_idIndexMarker361"></a>mapping có thể được dùng để tìm các vùng được cấp phát cho segment Heap. Nó khá giống *ví dụ 4.6*, nhưng nó cấp phát một số byte từ segment Heap trước khi đi vào vòng lặp vô hạn.

Do đó, giống như chúng ta đã làm cho *ví dụ 4.6*, chúng ta có thể đi qua các memory mapping của process đang chạy và xem mapping nào chỉ segment Heap.

Code box sau chứa code cho *ví dụ 4.7*:

```
#include <unistd.h> // Needed for sleep function
#include <stdlib.h> // Needed for malloc function
#include <stdio.h> // Needed for printf
int main(int argc, char** argv) {
  void* ptr = malloc(1024); // Allocate 1KB from heap
  printf("Address: %p\n", ptr);
  fflush(stdout); // To force the print
  // Infinite loop
  while (1) {
    sleep(1); // Sleep 1 second
  };
  return 0;
}
```

*Code Box 4-8 [ExtremeC_examples_chapter4_7.c]: Ví dụ 4.7 được dùng để thăm dò segment Heap*

Trong code trên, chúng ta đã dùng hàm `malloc`. Đó là cách chính để cấp phát thêm memory từ segment Heap. Nó nhận số byte cần được cấp phát, và nó trả về một generic pointer.

Để nhắc lại, một generic pointer (hay void pointer) chứa một memory address nhưng nó không thể được *dereference* và dùng trực tiếp. Nó phải được cast sang một kiểu pointer cụ thể trước khi được dùng.

Trong *ví dụ 4.7*, chúng ta cấp phát 1024 byte (hay 1KB) trước khi đi vào vòng lặp. Chương trình <a id="_idIndexMarker362"></a>cũng in ra address của pointer nhận được từ `malloc` trước khi <a id="_idIndexMarker363"></a>bắt đầu vòng lặp. Hãy biên dịch ví dụ và chạy nó như chúng ta đã làm cho *ví dụ 4.7*:

```
$ g++ ExtremeC_examples_chapter4_7.c -o ex4_7.out
$ ./ex4_7.out &
[1] 3451
Address: 0x19790010
$
```

*Shell Box 4-16: Biên dịch và chạy ví dụ 4.7*

Giờ, process đang chạy ở chế độ nền, và nó đã có được PID 3451.

Hãy xem những vùng memory nào đã được ánh xạ cho process này bằng cách nhìn vào file `maps` của nó:

```
$ cat /proc/3451/maps
00400000-00401000 r-xp 00000000 00:2f 176521             .../extreme_c/4.7/ex4_7.out
00600000-00601000 r--p 00000000 00:2f 176521             .../extreme_c/4.7/ex4_7.out
00601000-00602000 rw-p 00001000 00:2f 176521             .../extreme_c/4.7/ex4_7.out
01979000-0199a000 rw-p 00000000 00:00 0                  [heap]
7f7b32f12000-7f7b330d1000 r-xp 00000000 00:2f 30         /lib/x86_64-linux-gnu/libc-2.23.so
7f7b330d1000-7f7b332d1000 ---p 001bf000 00:2f 30         /lib/x86_64-linux-gnu/libc-2.23.so
7f7b332d1000-7f7b332d5000 r--p 001bf000 00:2f 30         /lib/x86_64-linux-gnu/libc-2.23.so
7f7b332d5000-7f7b332d7000 rw-p 001c3000 00:2f 30         /lib/x86_64-linux-gnu/libc-2.23.so
7f7b332d7000-7f7b332db000 rw-p 00000000 00:00 0
7f7b332db000-7f7b33301000 r-xp 00000000 00:2f 27        /lib/x86_64-linux-gnu/ld-2.23.so
7f7b334f2000-7f7b334f5000 rw-p 00000000 00:00 0
7f7b334fe000-7f7b33500000 rw-p 00000000 00:00 0
7f7b33500000-7f7b33501000 r--p 00025000 00:2f 27         /lib/x86_64-linux-gnu/ld-2.23.so
7f7b33501000-7f7b33502000 rw-p 00026000 00:2f 27         /lib/x86_64-linux-gnu/ld-2.23.so
7f7b33502000-7f7b33503000 rw-p 00000000 00:00 0
7ffdd63c2000-7ffdd63e3000 rw-p 00000000 00:00 0          [stack]
7ffdd63e7000-7ffdd63ea000 r--p 00000000 00:00 0          [vvar]
7ffdd63ea000-7ffdd63ec000 r-xp 00000000 00:00 0          [vdso]
ffffffffff600000-ffffffffff601000 r-xp 00000000 00:00 0  [vsyscall]
$
```

*Shell Box 4-17: Dump nội dung của /proc/3451/maps*

Nếu bạn nhìn kỹ *Shell Box 4-17*, bạn sẽ thấy một mapping mới được tô sáng, và nó được mô tả là `[heap]`. Vùng này đã được thêm vào vì dùng hàm `malloc`. Nếu bạn tính kích thước của vùng, nó là `0x21000` byte hay 132 KB. Điều này có nghĩa <a id="_idIndexMarker364"></a>là để cấp phát chỉ 1 KB trong code, một vùng có <a id="_idIndexMarker365"></a>kích thước 132 KB đã được cấp phát.

Việc này thường được làm để ngăn những lần cấp phát memory tiếp theo khi dùng `malloc` lần nữa trong tương lai. Đơn giản là vì việc cấp phát memory từ segment Heap không rẻ và nó có chi phí cả về memory lẫn thời gian.

Nếu bạn quay lại code được thể hiện trong *Code Box 4-8*, address mà pointer `ptr` đang trỏ tới cũng thú vị. Memory mapping của Heap, được thể hiện trong *Shell Box 4-17*, được cấp phát từ address `0x01979000` đến `0x0199a000`, và address được lưu trong `ptr` là `0x19790010`, hiển nhiên nằm bên trong dải Heap, ở offset `16` byte.

Segment Heap có thể lớn lên tới kích thước lớn hơn 132 KB rất nhiều, thậm chí tới hàng chục gigabyte, và thường nó được dùng cho các đối tượng lâu dài, global và rất lớn như mảng và bit stream.

Như đã chỉ ra ở trên, việc cấp phát và giải phóng bên trong segment heap đòi hỏi một chương trình gọi các hàm cụ thể do chuẩn C cung cấp. Trong khi bạn có thể có các biến local trên đỉnh segment Stack, và bạn có thể dùng chúng trực tiếp để tương tác với memory, <a id="_idIndexMarker366"></a>memory Heap chỉ có thể được truy cập <a id="_idIndexMarker367"></a>thông qua pointer, và đây là một trong những lý do tại sao việc biết pointer và có khả năng làm việc với chúng là then chốt đối với mọi lập trình viên C. Hãy đưa ra *ví dụ 4.8*, minh họa cách dùng pointer để truy cập không gian Heap:

```
#include <stdio.h>   // For printf function
#include <stdlib.h>  // For malloc and free function
void fill(char* ptr) {
  ptr[0] = 'H';
  ptr[1] = 'e';
  ptr[2] = 'l';
  ptr[3] = 'l';
  ptr[5] = 0;
}
int main(int argc, char** argv) {
  void* gptr = malloc(10 * sizeof(char));
  char* ptr = (char*)gptr;
  fill(ptr);
  printf("%s!\n", ptr);
  free(ptr);
  return 0;
}
```

*Code Box 4-9 [ExtremeC_examples_chapter4_8.c]: Dùng pointer để tương tác với memory Heap*

Chương trình trên cấp phát 10 byte từ không gian Heap bằng hàm `malloc`. Hàm `malloc` nhận số byte cần được cấp phát và trả về một generic pointer trỏ tới byte đầu tiên của khối memory đã được cấp phát.

Để dùng pointer được trả về, chúng ta phải cast nó sang một kiểu pointer phù hợp. Vì chúng ta sẽ dùng memory đã cấp phát để lưu một số ký tự, chúng ta chọn cast nó sang một `char` pointer. Việc cast được thực hiện trước khi gọi hàm `fill`.

Lưu ý rằng các biến pointer local, `gptr` và `ptr`, được cấp phát từ Stack. Những pointer này cần memory để lưu giá trị của chúng, và memory này đến từ segment Stack. Nhưng address mà chúng đang trỏ tới nằm bên trong segment Heap. Đây là chủ đề chung khi làm việc với memory Heap. Bạn có các pointer local được cấp phát từ segment Stack, nhưng chúng thực ra đang trỏ tới một vùng được cấp phát từ segment Heap. Chúng ta sẽ thể hiện thêm về những điều này trong chương sau.

Lưu ý rằng pointer `ptr` bên trong hàm `fill` cũng được cấp phát từ Stack nhưng nó ở một phạm vi khác, và nó khác với pointer `ptr` được khai báo trong hàm `main`.

Khi nói <a id="_idIndexMarker368"></a>đến memory Heap, chương trình, hay thực ra là <a id="_idIndexMarker369"></a>lập trình viên, chịu trách nhiệm cấp phát memory. Chương trình cũng chịu trách nhiệm giải phóng memory khi nó không còn cần thiết. Có một mẩu memory Heap đã được cấp phát mà không *với tới được* (reachable) được coi là một *memory leak* (rò rỉ memory). Với việc không với tới được, chúng ta muốn nói rằng không có pointer nào có thể được dùng để trỏ tới vùng đó.

Memory leak là chí mạng đối với chương trình vì có một memory leak tăng dần rốt cuộc sẽ dùng hết toàn bộ không gian memory được cho phép, và điều này có thể giết process. Đó là lý do chương trình gọi hàm `free` trước khi trả về từ hàm `main`. Lời gọi tới hàm `free` sẽ giải phóng khối memory Heap đã lấy, và chương trình không nên dùng những address Heap đó nữa.

Thêm về các segment Stack và Heap sẽ có trong chương tiếp theo.

<a id="_idParaDest-81"></a>

## Tóm tắt

Mục tiêu ban đầu của chúng ta trong chương này là cung cấp một cái nhìn tổng quan về cấu trúc memory của một process trong một hệ điều hành Unix-like. Vì chúng ta đã trình bày rất nhiều trong chương này, hãy dành một phút để đọc qua những gì chúng ta đã đi qua, vì giờ bạn hẳn đã cảm thấy thoải mái trong việc hiểu những gì chúng ta đã đạt được:

- Chúng ta đã mô tả cấu trúc dynamic memory của một process đang chạy cũng như cấu trúc static memory của một executable object file.
- Chúng ta đã quan sát thấy rằng static memory layout nằm bên trong executable object file và nó được chia thành các mảnh gọi là segment. Chúng ta đã tìm ra rằng các segment Text, Data và BSS là một phần của static memory layout.
- Chúng ta đã thấy rằng segment Text hay Code segment được dùng để lưu các instruction machine-level dự định được thực thi khi một process mới được sinh ra từ executable object file hiện tại.
- Chúng ta đã thấy rằng segment BSS được dùng để lưu các biến global hoặc chưa khởi tạo hoặc được đặt bằng không.
- Chúng ta đã giải thích rằng segment Data được dùng để lưu các biến global đã khởi tạo.
- Chúng ta đã dùng các lệnh `size` và `objdump` để thăm dò phần bên trong của object file. Chúng ta cũng có thể dùng các công cụ dump object file như `readelf` để tìm những segment này bên trong một object file.
- Chúng ta đã thăm dò dynamic memory layout của một process. Chúng ta đã thấy rằng mọi segment đều được sao chép từ static memory layout vào dynamic memory của process. Tuy nhiên, có hai segment mới trong dynamic memory layout; segment Stack và segment Heap.
- Chúng ta đã giải thích rằng segment Stack là vùng memory mặc định được dùng cho việc cấp phát.
- Chúng ta đã học rằng các biến local luôn được cấp phát trên đỉnh vùng Stack.
- Chúng ta cũng đã quan sát thấy rằng bí mật đằng sau các lời gọi hàm nằm trong segment Stack và cách nó hoạt động.
- Chúng ta đã thấy rằng chúng ta phải dùng một API cụ thể, hay một tập hàm, để cấp phát và giải phóng các vùng memory Heap. API này được thư viện chuẩn C cung cấp.
- Chúng ta đã thảo luận về memory leak và cách nó có thể xảy ra với các vùng memory Heap.

Chương tiếp theo nói riêng về các segment Stack và Heap. Nó sẽ dùng các chủ đề chúng ta đã trình bày trong chương này, và nó sẽ bổ sung thêm vào những nền tảng đó. Sẽ có thêm ví dụ, và các công cụ thăm dò mới sẽ được giới thiệu; điều này sẽ hoàn tất thảo luận của chúng ta về quản lý memory trong C.
