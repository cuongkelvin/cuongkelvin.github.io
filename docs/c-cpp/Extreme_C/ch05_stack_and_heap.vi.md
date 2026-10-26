<a id="_idParaDest-82"></a>

# Chương 05: Stack và Heap (Stack and Heap)

Trong chương trước, chúng ta đã tiến hành một cuộc điều tra về memory layout của một process đang chạy. Lập trình hệ thống mà không biết đủ về cấu trúc memory và các segment khác nhau của nó cũng giống như phẫu thuật mà không biết giải phẫu cơ thể người. Chương trước chỉ cho chúng ta thông tin cơ bản về các segment khác nhau trong memory layout của process, còn chương này muốn chúng ta chỉ tập trung vào các segment được dùng thường xuyên nhất: Stack và Heap.

Là một lập trình viên, bạn chủ yếu bận rộn làm việc với các segment Stack và Heap. Các segment khác như Data hay BSS ít được dùng hơn, hoặc bạn có ít quyền kiểm soát hơn đối với chúng. Về cơ bản đó là do thực tế là các segment Data và BSS được compiler sinh ra, và thông thường, chúng chiếm một tỉ lệ nhỏ trong toàn bộ memory của một process trong suốt vòng đời của nó. Điều này không có nghĩa là chúng không quan trọng, và, thực tế, có những vấn đề liên quan trực tiếp đến những segment này. Nhưng vì bạn dành phần lớn thời gian với Stack và Heap, hầu hết các vấn đề về memory đều có gốc rễ trong những segment này.

Trong chương này, bạn sẽ học:

- Cách thăm dò segment Stack và các công cụ bạn cần cho mục đích này
- Cách quản lý memory được thực hiện tự động cho segment Stack
- Các đặc điểm khác nhau của segment stack
- Các hướng dẫn và best practice về cách dùng segment Stack
- Cách thăm dò segment Heap
- Cách cấp phát và giải phóng một khối memory Heap
- Các hướng dẫn và best practice liên quan đến việc dùng segment Heap
- Các môi trường Memory-constrained và việc tinh chỉnh memory trong các môi trường hiệu năng cao

Hãy bắt đầu hành trình bằng cách thảo luận chi tiết hơn về segment Stack.

<a id="_idParaDest-83"></a>

## Stack

Một process có thể tiếp tục <a id="_idIndexMarker370"></a>làm việc mà không có segment Heap nhưng không thể thiếu segment Stack. Điều này nói lên rất nhiều. Stack là phần chính trong quá trình trao đổi chất của process, và process không thể tiếp tục thực thi mà không có nó. Lý do ẩn sau cơ chế điều khiển các lời gọi hàm. Như đã giải thích ngắn gọn trong chương trước, việc gọi một hàm chỉ có thể được thực hiện bằng cách dùng segment Stack. Không có segment Stack, không lời gọi hàm nào có thể được thực hiện, và điều này có nghĩa là không thực thi gì cả.

Như đã nói, segment Stack và nội dung của nó được thiết kế cẩn thận để dẫn đến sự thực thi lành mạnh của process. Do đó, làm rối nội dung Stack có thể làm gián đoạn việc thực thi và dừng process. Việc cấp phát từ segment Stack nhanh, và nó không cần bất kỳ lời gọi hàm đặc biệt nào. Hơn thế nữa, việc giải phóng và mọi tác vụ quản lý memory diễn ra tự động. Tất cả những sự thật này đều rất hấp dẫn và khuyến khích bạn lạm dụng Stack.

Bạn nên cẩn thận về điều này. Dùng segment Stack mang lại những phức tạp riêng. Stack không lớn lắm, do đó bạn không thể lưu các đối tượng lớn trong đó. Ngoài ra, dùng sai nội dung Stack có thể dừng việc thực thi và dẫn đến crash. Đoạn code sau minh họa điều này:

```
#include <string.h>
int main(int argc, char** argv) {
  char str[10];
  strcpy(str, "akjsdhkhqiueryo34928739r27yeiwuyfiusdciuti7twe79ye");
  return 0;
}
```

*Code Box 5-1: Một tình huống buffer overflow. Hàm strcpy sẽ ghi đè nội dung của Stack*

Khi chạy code trên, chương trình rất có thể sẽ crash. Đó là vì `strcpy` đang ghi đè nội dung của Stack, hay như thường được gọi, *smashing* (đập vỡ) <a id="_idIndexMarker371"></a> stack. Như bạn thấy trong *Code Box 5-1*, mảng `str` có `10` ký tự, nhưng `strcpy` đang ghi nhiều hơn 10 ký tự rất nhiều vào mảng `str`. Như bạn sẽ thấy ngay sau đây, việc này thực chất ghi đè lên các biến và stack frame đã được push trước đó, và chương trình nhảy tới một instruction sai sau khi trả về từ hàm `main`. Và điều này rốt cuộc khiến việc tiếp tục thực thi trở nên không thể.

Tôi hy vọng rằng ví dụ trên đã giúp bạn cảm nhận được sự mong manh của segment Stack. Trong nửa đầu của chương này, chúng ta sẽ xem xét Stack sâu hơn và kiểm tra nó kỹ lưỡng. Trước tiên chúng ta bắt đầu bằng việc thăm dò Stack.

<a id="_idParaDest-84"></a>

### Thăm dò Stack

Trước khi biết thêm<a id="_idIndexMarker372"></a> về Stack, chúng ta cần có khả năng đọc và, có lẽ, sửa đổi nó. Như đã nêu trong chương trước, segment Stack là một memory private mà chỉ process sở hữu mới có quyền đọc và sửa đổi. Nếu chúng ta định đọc Stack hay thay đổi nó, chúng ta cần trở thành một phần của process sở hữu Stack.

Đây là lúc một bộ công cụ mới xuất hiện: *debugger*. Một <a id="_idIndexMarker373"></a>debugger là một chương trình gắn vào một process khác để *debug* nó. Một trong những tác vụ thông thường khi debug một process là quan sát và thao tác các memory segment khác nhau. Chỉ khi debug một process, chúng ta mới có thể đọc và sửa đổi các khối memory private. Việc khác có thể được thực hiện như một phần của debug là điều khiển thứ tự thực thi các instruction của chương trình. Chúng tôi sẽ đưa ra ví dụ về cách thực hiện những tác vụ này bằng một debugger ngay sau đây, như một phần của phần này.

Hãy bắt đầu với một ví dụ. Trong *ví dụ 5.1*, chúng tôi thể hiện cách biên dịch một chương trình và làm cho nó sẵn sàng để debug. Sau đó, chúng tôi minh họa cách dùng `gdb`, GNU debugger, để chạy chương trình và đọc memory Stack. Ví dụ này khai báo một mảng ký tự được cấp phát trên đỉnh Stack và điền các phần tử của nó bằng một số ký tự, như có thể thấy trong code box sau:

```
#include <stdio.h>
int main(int argc, char** argv) {
  char arr[4];
  arr[0] = 'A';
  arr[1] = 'B';
  arr[2] = 'C';
  arr[3] = 'D';
  return 0;
}
```

*Code Box 5-2 [ExtremeC_examples_chapter5_1.c]: Khai báo một mảng được cấp phát trên đỉnh Stack*

Chương trình đơn giản và dễ theo dõi, nhưng những điều đang xảy ra bên trong memory thì thú vị. Trước hết, memory cần cho mảng `arr` được cấp phát từ Stack đơn giản vì nó không được cấp phát từ segment Heap và chúng ta đã không dùng hàm `malloc`. Hãy nhớ, segment Stack là nơi mặc định để cấp phát biến và mảng.

Để có một ít memory được cấp phát từ Heap, người ta phải lấy nó bằng cách gọi `malloc` hay các hàm tương tự khác, như `calloc`. Nếu không, memory được cấp phát từ Stack, và chính xác hơn, trên đỉnh Stack.

Để có thể debug một chương trình, binary phải được build cho mục đích debug. Điều này có nghĩa là chúng ta phải nói với compiler rằng chúng ta muốn một binary chứa các *debug* *<a id="_idIndexMarker374"></a>**symbol*. Những symbol này sẽ được dùng để tìm các dòng code đã được thực thi hay những dòng đã gây ra crash. Hãy biên dịch *ví dụ 5.1* và tạo một executable object file chứa các debugging symbol.

Trước tiên, chúng ta build ví dụ. Chúng ta đang biên dịch trong môi trường Linux:

```
$ gcc -g ExtremeC_examples_chapter5_1.c -o ex5_1_dbg.out
$
```

*Shell Box 5-1: Biên dịch ví dụ 5.1 với tùy chọn debug -g*

Tùy chọn `-g` nói với compiler rằng executable object file cuối cùng phải chứa thông tin debug. Kích thước của binary cũng khác nhau khi bạn biên dịch source có và không có tùy chọn debug. Tiếp theo, bạn có thể thấy sự khác biệt giữa kích thước của hai executable object file, cái thứ nhất được build không có tùy chọn `-g` và cái thứ hai có tùy chọn `-g`:

```
$ gcc ExtremeC_examples_chapter2_10.c -o ex5_1.out
$ ls -al ex5_1.out
-rwxrwxr-x 1 kamranamini kamranamini 8640 jul 24 13:55 ex5_1.out
$ gcc -g ExtremeC_examples_chapter2_10.c -o ex5_1_dbg.out
$ ls -al ex5_1.out
-rwxrwxr-x 1 kamranamini kamranamini 9864 jul 24 13:56 ex5_1_dbg.out
$
```

*Shell Box 5-2: Kích thước của executable object file output có và không có tùy chọn -g*

Giờ chúng ta đã có một executable file chứa các debug symbol, chúng ta có thể dùng debugger để chạy chương trình. Trong ví dụ này, chúng ta sẽ dùng `gdb` để debug *ví dụ 5.1*. Tiếp theo, bạn có thể tìm thấy lệnh để khởi động debugger:

```
$ gdb ex5_1_dbg.out
```

*Shell Box 5-3: Khởi động debugger cho ví dụ 5.1*

> **Lưu ý**:
>
> `gdb` thường được cài như một phần của package `build-essentials` trên các hệ thống Linux. Trong các hệ thống macOS, nó có thể được cài bằng package manager `brew` như sau: `brew install gdb`.

Sau khi chạy debugger, output sẽ là thứ gì đó tương tự shell box sau:

```
$ gdb ex5_1_dbg.out
GNU gdb (Ubuntu 7.11.1-0ubuntu1~16.5) 7.11.1
Copyright (C) 2016 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later http://gnu.org/licenses/gpl.html
...
Reading symbols from ex5_1_dbg.out...done.
(gdb)
```

*Shell Box 5-4: Output của debugger sau khi được khởi động*

Như bạn có thể đã <a id="_idIndexMarker375"></a>để ý, tôi đã chạy lệnh trên trên một máy Linux. `gdb` có một interface command-line cho phép bạn đưa ra các lệnh debug. Nhập lệnh `r` (hay `run`) để thực thi executable object file, được chỉ định như một input cho debugger. Shell box sau cho thấy cách lệnh `run` thực thi chương trình:

```
...
Reading symbols from ex5_1_dbg.out...done.
(gdb) run
Starting program: .../extreme_c/5.1/ex5_1_dbg.out
[Inferior 1 (process 9742) exited normally]
(gdb)
```

*Shell Box 5-5: Output của debugger sau khi đưa ra lệnh run*

Trong shell box trên, sau khi đưa ra lệnh `run`, `gdb` đã khởi động process, gắn vào nó, và để chương trình thực thi các instruction của nó rồi thoát. Nó đã không ngắt chương trình vì chúng ta<a id="_idIndexMarker376"></a> chưa đặt một *breakpoint*. Một breakpoint là một chỉ báo nói với `gdb` tạm dừng việc thực thi chương trình và chờ các lệnh tiếp theo. Bạn có thể có bao nhiêu breakpoint tùy thích.

Tiếp theo, chúng ta đặt một breakpoint trên hàm `main` bằng lệnh `b` (hay `break`). Sau khi đặt breakpoint, `gdb` tạm dừng việc thực thi khi chương trình đi vào hàm `main`. Bạn có thể thấy cách đặt một breakpoint trên hàm `main` trong shell box sau:

```
(gdb) break main
Breakpoint 1 at 0x400555: file ExtremeC_examples_chapter5_1.c, line 4.
(gdb)
```

*Shell Box 5-6: Đặt một breakpoint trên hàm main trong gdb*

Giờ, chúng ta chạy<a id="_idIndexMarker377"></a> chương trình lần nữa. Việc này tạo ra một process mới, và `gdb` gắn vào nó. Tiếp theo, bạn có thể tìm thấy kết quả:

```
(gdb) r
Starting program: .../extreme_c/5.1/ex5_1_dbg.out
Breakpoint 1, main (argc=1, argv=0x7fffffffcbd8) at ExtremeC_examples_chapter5_1.c:3
3       int main(int argc, char** argv) {
(gdb)
```

*Shell Box 5-7: Chạy chương trình lần nữa sau khi đặt breakpoint*

Như bạn có thể thấy, việc thực thi đã tạm dừng ở dòng 3, vốn chính là dòng của hàm `main`. Sau đó, debugger chờ lệnh tiếp theo. Giờ, chúng ta có thể yêu cầu `gdb` chạy dòng code tiếp theo và tạm dừng lần nữa. Nói cách khác, chúng ta chạy chương trình từng bước và từng dòng một. Bằng cách này, bạn có đủ thời gian để nhìn quanh và kiểm tra các biến và giá trị của chúng bên trong memory. Thực tế, đây là phương pháp chúng ta sẽ dùng để thăm dò các segment Stack và Heap.

Trong shell box sau, bạn có thể thấy cách dùng lệnh `n` (hay `next`) để chạy dòng code tiếp theo:

```
(gdb) n
5         arr[0] = 'A';
(gdb) n
6         arr[1] = 'B';
(gdb) next
7        arr[2] = 'C';
(gdb) next
8        arr[3] = 'D';
(gdb) next
9        return 0;
(gdb)
```

*Shell Box 5-8: Dùng lệnh n (hay next) để thực thi các dòng code sắp tới*

Giờ, nếu bạn nhập lệnh `print arr` trong debugger, nó sẽ hiển thị nội dung của mảng dưới dạng một chuỗi:

```
(gdb) print arr
$1 = "ABCD"
(gdb)
```

*Shell Box 5-9: In nội dung của mảng arr bằng gdb*

Quay lại<a id="_idIndexMarker378"></a> chủ đề, chúng ta đã giới thiệu `gdb` để có thể nhìn vào bên trong memory Stack. Giờ, chúng ta có thể làm điều đó. Chúng ta có một process có một segment Stack, và nó đang tạm dừng, và chúng ta có một command line `gdb` để khám phá memory của nó. Hãy bắt đầu và in memory được cấp phát cho mảng `arr`:

```
(gdb) x/4b arr
0x7fffffffcae0: 0x41    0x42    0x43    0x44
(gdb) x/8b arr
0x7fffffffcae0: 0x41    0x42    0x43    0x44    0xff    0x7f    0x00    0x00
(gdb)
```

*Shell Box 5-10: In các byte memory bắt đầu từ mảng arr*

Lệnh thứ nhất, `x/4b`, hiển thị 4 byte từ vị trí mà `arr` đang trỏ tới. Hãy nhớ rằng `arr` là một pointer thực ra đang trỏ tới phần tử đầu tiên của mảng, nên nó có thể được dùng để di chuyển dọc theo memory.

Lệnh thứ hai, `x/8b`, in 8 byte sau `arr`. Theo code được viết cho *ví dụ 5.1*, và có trong *Code Box 5-2*, các giá trị `A`, `B`, `C` và `D` được lưu trong mảng `arr`. Bạn nên biết rằng các giá trị ASCII được lưu trong mảng, không phải các ký tự thật. Giá trị ASCII của `A` là `65` thập phân hay `0x41` thập lục phân. Với `B`, nó là `66` hay `0x42`. Như bạn có thể thấy, các giá trị được in trong output của `gdb` là các giá trị chúng ta vừa lưu trong mảng `arr`.

Còn 4 byte còn lại trong lệnh thứ hai thì sao? Chúng là một phần của Stack, và chúng có lẽ chứa dữ liệu từ Stack frame gần đây được đặt lên đỉnh Stack khi gọi hàm `main`.

Lưu ý rằng segment Stack được lấp đầy theo kiểu ngược lại so với các segment khác.

Các vùng memory khác được lấp đầy bắt đầu từ các address nhỏ hơn và chúng tiến tới các address lớn hơn, nhưng đây không phải là trường hợp với segment Stack.

Segment Stack được lấp đầy từ các address lớn hơn và lùi dần về các address nhỏ hơn. Một số lý do đằng sau thiết kế này nằm ở lịch sử phát triển của máy tính hiện đại, và một số nằm ở chức năng của segment Stack, vốn hoạt động giống một cấu trúc dữ liệu stack.

Với tất cả những điều đã nói, nếu bạn đọc segment Stack từ một address về phía các address lớn hơn, giống như chúng ta đã làm trong *Shell Box 5-10*, thực chất bạn đang đọc nội dung đã được push <a id="_idIndexMarker379"></a> như một phần của segment Stack, và nếu bạn cố thay đổi những byte đó, bạn đang sửa đổi Stack, và điều này không tốt. Chúng tôi sẽ minh họa tại sao điều này nguy hiểm và nó có thể được thực hiện như thế nào trong các đoạn sau.

Tại sao chúng ta có thể thấy nhiều hơn kích thước của mảng `arr`? Vì `gdb` đi qua số byte trong memory mà chúng ta đã yêu cầu. Lệnh `x` không quan tâm đến biên của mảng. Nó chỉ cần một address bắt đầu và số byte để in ra dải đó.

Nếu bạn muốn thay đổi các giá trị bên trong Stack, bạn phải dùng lệnh `set`. Lệnh này cho phép bạn sửa đổi một memory cell hiện có. Trong trường hợp này, memory cell chỉ một byte riêng lẻ trong mảng `arr`:

```
(gdb) x/4b arr
0x7fffffffcae0: 0x41    0x42    0x43    0x44
(gdb) set arr[1] = 'F'
(gdb) x/4b arr
0x7fffffffcae0: 0x41    0x46    0x43    0x44
(gdb) print arr
$2 = "AFCD"
(gdb)
```

*Shell Box 5-11: Thay đổi một byte riêng lẻ trong mảng bằng lệnh set*

Như bạn có thể thấy, dùng lệnh `set`, chúng ta đã đặt phần tử thứ hai của mảng `arr` thành `F`. Nếu bạn định thay đổi một address không nằm trong biên của các mảng của bạn, điều đó vẫn có thể thực hiện được thông qua `gdb`.

Hãy quan sát kỹ sửa đổi sau. Giờ, chúng ta muốn sửa đổi một byte nằm ở một address lớn hơn `arr` rất nhiều, và như chúng ta đã giải thích trước đây, chúng ta sẽ sửa đổi nội dung đã được push của Stack. Hãy nhớ, memory Stack được lấp đầy theo cách ngược lại so với các segment khác:

```
(gdb) x/20x arr
0x7fffffffcae0: 0x41    0x42    0x43    0x44    0xff    0x7f    0x00    0x00
0x7fffffffcae8: 0x00    0x96    0xea    0x5d    0xf0    0x31    0xea    0x73
0x7fffffffcaf0: 0x90    0x05    0x40    0x00
(gdb) set *(0x7fffffffcaed) = 0xff
(gdb) x/20x arr
0x7fffffffcae0: 0x41    0x42    0x43    0x44    0xff    0x7f    0x00    0x00
0x7fffffffcae8: 0x00    0x96    0xea    0x5d    0xf0    0xff    0x00    0x00
0x7fffffffcaf0: 0x00    0x05    0x40    0x00
(gdb)
```

*Shell Box 5-12: Thay đổi một byte riêng lẻ bên ngoài biên của mảng*

Chỉ có vậy. Chúng ta vừa ghi giá trị `0xff` vào address `0x7fffffffcaed`, vốn nằm ngoài biên<a id="_idIndexMarker380"></a> của mảng `arr`, và có lẽ là một byte bên trong stack frame được push trước khi đi vào hàm `main`.

Điều gì sẽ xảy ra nếu chúng ta tiếp tục việc thực thi? Nếu chúng ta đã sửa đổi một byte then chốt trong Stack, chúng ta kỳ vọng thấy một crash hoặc ít nhất sửa đổi này bị một cơ chế nào đó phát hiện và việc thực thi chương trình bị dừng. Lệnh `c` (hay `continue`) sẽ tiếp tục việc thực thi process trong `gdb`, như bạn có thể thấy tiếp theo:

```
(gdb) c
Continuing.
*** stack smashing detected ***: .../extreme_c/5.1/ex5_1_dbg.out terminated
Program received signal SIGABRT, Aborted.
0x00007ffff7a42428 in __GI_raise (sig=sig@entry=6) at ../sysdeps/Unix/sysv/linux/raise.c:54
54      ../sysdeps/Unix/sysv/linux/raise.c: No such file or directory.
(gdb)
```

*Shell Box 5-13: Một byte then chốt bị thay đổi trong Stack làm process kết thúc*

Như bạn có thể thấy trong shell box trên, chúng ta vừa đập vỡ Stack! Sửa đổi nội dung của Stack ở những address không do bạn cấp phát, dù chỉ 1 byte, có thể rất nguy hiểm và nó thường dẫn đến một crash hay một sự kết thúc đột ngột.

Như chúng ta đã nói trước đây, hầu hết các thủ tục sống còn liên quan đến việc thực thi một chương trình đều được thực hiện bên trong memory Stack. Vì vậy, bạn nên rất cẩn thận khi ghi vào các biến Stack. Bạn không nên ghi bất kỳ giá trị nào bên ngoài biên được định nghĩa cho biến và mảng đơn giản vì các address tăng ngược trong memory Stack, điều này khiến việc ghi đè các byte đã được ghi trở nên dễ xảy ra.

Khi bạn debug xong, và bạn sẵn sàng rời `gdb`, khi đó bạn có thể đơn giản dùng lệnh `q` (hay `quit`). Giờ, bạn hẳn đã ra khỏi debugger và quay lại terminal.

Một lưu ý khác, việc ghi các giá trị không được kiểm tra vào một *buffer* (một tên khác của mảng byte hay mảng ký tự) được cấp phát trên đỉnh Stack (không phải từ Heap) được coi là một lỗ hổng. Một<a id="_idIndexMarker381"></a> kẻ tấn công có thể thiết kế cẩn thận một mảng byte và đưa nó vào chương trình để chiếm quyền điều khiển nó. Việc này thường được gọi là một *exploit* vì<a id="_idIndexMarker382"></a> một cuộc tấn công *buffer overflow*.

Chương trình sau thể hiện lỗ hổng này:

```
int main(int argc, char** argv) {
  char str[10];
  strcpy(str, argv[1]);
  printf("Hello %s!\n", str);
}
```

*Code Box 5-3: Một chương trình thể hiện lỗ hổng buffer overflow*

Code trên không kiểm tra nội dung và kích thước của input `argv[1]` và sao chép nó trực tiếp vào mảng `str`, vốn được cấp phát trên đỉnh Stack.

Nếu bạn may mắn, việc này có thể dẫn đến một crash, nhưng trong một số trường hợp hiếm nhưng nguy hiểm, việc này có thể dẫn đến một cuộc tấn công exploit.

<a id="_idParaDest-85"></a>

### Những điểm cần lưu ý khi dùng memory Stack

Giờ bạn đã hiểu rõ hơn<a id="_idIndexMarker383"></a> về segment Stack và cách nó hoạt động, chúng ta có thể nói về các best practice và những điểm bạn nên cẩn thận. Bạn nên quen thuộc<a id="_idIndexMarker384"></a> với khái niệm *scope* (phạm vi). Mỗi biến Stack có scope riêng của nó, và scope xác định vòng đời của biến. Điều này có nghĩa là một biến Stack bắt đầu vòng đời của nó trong một scope và chết khi scope đó không còn. Nói cách khác, scope xác định vòng đời của một biến Stack.

Chúng ta cũng có việc cấp phát và giải phóng memory tự động cho các biến Stack, và nó chỉ áp dụng cho các biến Stack. Tính năng này, quản lý memory tự động, đến từ bản chất của segment Stack.

Bất cứ khi nào bạn khai báo một biến Stack, nó sẽ được cấp phát trên đỉnh segment Stack. Việc cấp phát diễn ra tự động, và điều này có thể được đánh dấu là sự bắt đầu vòng đời của nó. Sau thời điểm này, nhiều biến khác và các stack frame khác được đặt lên trên nó bên trong Stack. Chừng nào biến còn tồn tại trong Stack và có các biến khác ở trên nó, nó vẫn sống sót và tiếp tục sống.

Tuy nhiên, rốt cuộc, những thứ này sẽ bị pop ra khỏi Stack vì đến một lúc nào đó trong tương lai chương trình phải kết thúc, và stack phải trống vào lúc đó. Vì vậy, phải có<a id="_idIndexMarker385"></a> một thời điểm trong tương lai khi biến này bị pop ra khỏi stack. Như vậy, việc giải phóng, hay việc bị pop ra, diễn ra tự động, và điều đó có thể được đánh dấu là sự kết thúc vòng đời của biến. Về cơ bản đây là lý do tại sao chúng ta nói rằng chúng ta có quản lý memory tự động cho các biến Stack, vốn không do lập trình viên điều khiển.

Giả sử rằng bạn đã định nghĩa một biến trong hàm `main`, như chúng ta thấy trong code box sau:

```
int main(int argc, char** argv) {
  int a;
  ...
  return 0;
}
```

*Code Box 5-4: Khai báo một biến trên đỉnh Stack*

Biến này sẽ ở lại trong Stack cho đến khi hàm `main` trả về. Nói cách khác, biến tồn tại chừng nào scope của nó (hàm `main`) còn hợp lệ. Vì hàm `main` là hàm mà trong đó toàn bộ chương trình chạy, vòng đời của biến gần giống như một biến global được khai báo xuyên suốt runtime của chương trình.

Nó giống một biến global, nhưng không hẳn là một biến global, vì sẽ có lúc biến bị pop ra khỏi Stack, trong khi một biến global luôn có memory của nó ngay cả khi hàm main đã kết thúc và chương trình đang được hoàn tất. Lưu ý rằng có hai đoạn code được chạy trước và sau hàm `main`, lần lượt khởi động (bootstrapping) và hoàn tất (finalizing) chương trình. Một lưu ý khác, các biến global được cấp phát từ một segment khác, Data hay BSS, vốn không hoạt động giống segment Stack.

Giờ hãy xem một ví dụ về một lỗi rất phổ biến. Nó thường xảy ra với một lập trình viên nghiệp dư khi viết những chương trình C đầu tiên. Nó là việc trả về address của một biến local bên trong một hàm.

Code box sau thể hiện *ví dụ 5.2*:

```
int* get_integer() {
  int var = 10;
  return &var;
}
int main(int argc, char** argv) {
  int* ptr = get_integer();
  *ptr = 5;
  return 0;
}
```

*Code Box 5-5 [ExtremeC_examples_chapter5_2.c]: Khai báo một biến trên đỉnh Stack*

Hàm `get_integer` trả về address của biến local `var`, vốn đã được khai báo trong scope của hàm `get_integer`. Hàm `get_integer` trả về address của biến local. Sau đó, hàm `main` cố dereference pointer nhận được và truy cập vùng <a id="_idIndexMarker386"></a>memory phía sau. Sau đây là output của compiler `gcc` khi biên dịch code trên trên một hệ thống Linux:

```
$ gcc ExtremeC_examples_chapter5_2.c -o ex5_2.out
ExtremeC_examples_chapter5_2.c: In function 'get_integer':
ExtremeC_examples_chapter5_2.c:3:11: warning: function returns address of local variable [-Wreturn-local-addr]
   return &var;
          ^~~~
$
```

*Shell Box 5-14: Biên dịch ví dụ 5.2 trong Linux*

Như bạn có thể thấy, chúng ta đã nhận được một thông báo cảnh báo. Vì việc trả về address của một biến local là một lỗi phổ biến, các compiler đã biết về nó, và chúng hiển thị một thông báo cảnh báo rõ ràng như `warning: function returns address of a local variable`.

Và đây là những gì xảy ra khi chúng ta thực thi chương trình:

```
$ ./ex5_2.out
Segmentation fault (core dumped)
$
```

*Shell Box 5-15: Thực thi ví dụ 5.2 trong Linux*

Như bạn có thể thấy trong *Shell Box 5-15*, một segmentation fault đã xảy ra. Nó có thể được hiểu là một crash. Nó thường là do truy cập không hợp lệ vào một vùng memory đã được cấp phát vào một lúc nào đó, nhưng giờ đã được giải phóng.

> **Lưu ý**:
>
> Một số cảnh báo nên được đối xử như lỗi. Ví dụ, cảnh báo trên nên là một lỗi vì nó thường dẫn đến crash. Nếu bạn muốn mọi cảnh báo đều được đối xử như lỗi, chỉ cần truyền tùy chọn `-Werror` cho compiler `gcc`. Nếu bạn muốn chỉ một cảnh báo cụ thể được đối xử như lỗi, chẳng hạn cảnh báo trên, chỉ cần truyền tùy chọn `-Werror=return-local-addr`.

Nếu bạn chạy chương trình <a id="_idIndexMarker387"></a>với `gdb`, bạn sẽ thấy thêm chi tiết về crash. Nhưng hãy nhớ, bạn cần biên dịch chương trình với tùy chọn `-g`, nếu không `gdb` sẽ không hữu ích lắm.

Luôn bắt buộc phải biên dịch các source với tùy chọn `-g` nếu bạn sắp debug chương trình bằng `gdb` hay các công cụ debug khác như `valgrind`. Shell box sau minh họa cách biên dịch và chạy *ví dụ 5.2* trong debugger:

```
$ gcc -g ExtremeC_examples_chapter5_2.c -o ex5_2_dbg.out
ExtremeC_examples_chapter5_2.c: In function 'get_integer':
ExtremeC_examples_chapter5_2.c:3:11: warning: function returns address of local variable [-Wreturn-local-addr]
   return &var;
          ^~~~
$ gdb ex5_2_dbg.out
GNU gdb (Ubuntu 8.1-0ubuntu3) 8.1.0.20180409-git
...
Reading symbols from ex5_2_dbg.out...done.
(gdb) run
Starting program: .../extreme_c/5.2/ex5_2_dbg.out
Program received signal SIGSEGV, Segmentation fault.
0x00005555555546c4 in main (argc=1, argv=0x7fffffffdf88) at ExtremeC_examples_chapter5_2.c:8
8    *ptr = 5;
(gdb) quit
$
```

*Shell Box 5-16: Chạy ví dụ 5.2 trong debugger*

Như đã rõ từ output của `gdb`, nguồn gốc của crash nằm ở dòng 8 trong hàm `main`, chính xác nơi chương trình cố ghi vào address được trả về bằng cách dereference pointer được trả về. Nhưng biến `var` đã là một biến local của hàm `get_integer` và nó không còn tồn tại nữa, đơn giản vì ở dòng 8 chúng ta đã trả về từ hàm `get_integer` và scope của nó, cùng với mọi biến, đã biến mất. Do đó, pointer được trả về là một *dangling pointer*.

Thông thường, một thực hành <a id="_idIndexMarker388"></a>phổ biến là truyền các pointer trỏ tới các biến trong scope hiện tại cho các hàm khác nhưng không theo chiều ngược lại, vì chừng nào scope hiện tại còn hợp lệ, các biến vẫn ở đó. Các lời gọi hàm tiếp theo chỉ đặt thêm thứ lên đỉnh segment Stack, và scope hiện tại sẽ không kết thúc trước chúng.

Lưu ý rằng phát biểu trên không phải là một thực hành tốt đối với các chương trình concurrent, vì trong tương lai, nếu một tác vụ concurrent khác muốn dùng pointer nhận được trỏ tới một biến bên trong scope hiện tại, scope hiện tại có thể đã biến mất rồi.

Để kết thúc phần này và có một <a id="_idIndexMarker389"></a>kết luận về segment Stack, có thể rút ra những điểm sau từ những gì chúng ta đã giải thích cho đến giờ:

- Memory Stack có kích thước giới hạn; do đó, nó không phải là một chỗ tốt để lưu các đối tượng lớn.
- Các address trong segment Stack tăng ngược, do đó đọc tiến về phía trước trong memory Stack có nghĩa là đọc các byte đã được push.
- Stack có quản lý memory tự động, cho cả việc cấp phát lẫn giải phóng.
- Mỗi biến Stack có một scope và nó xác định vòng đời của biến. Bạn nên thiết kế logic của mình dựa trên vòng đời này. Bạn không có quyền kiểm soát nó.
- Pointer chỉ nên trỏ tới những biến Stack vẫn còn trong một scope.
- Việc giải phóng memory của các biến Stack được thực hiện tự động khi scope sắp kết thúc, và bạn không có quyền kiểm soát nó.
- Pointer tới các biến tồn tại trong scope hiện tại có thể được truyền cho các hàm khác như argument chỉ khi chúng ta chắc chắn rằng scope hiện tại vẫn còn tại chỗ khi code trong các hàm được gọi sắp dùng pointer đó. Điều kiện này có thể bị phá vỡ trong những tình huống mà chúng ta có logic concurrent.

Trong phần tiếp theo, chúng ta sẽ nói về segment Heap và các tính năng khác nhau của nó.

<a id="_idParaDest-86"></a>

## Heap

Gần như mọi code, được viết bằng <a id="_idIndexMarker390"></a>bất kỳ ngôn ngữ lập trình nào, đều dùng memory Heap theo cách nào đó. Đó là vì Heap có một số ưu điểm độc nhất không thể đạt được bằng cách dùng Stack.

Mặt khác, nó cũng<a id="_idIndexMarker391"></a> có một số nhược điểm; ví dụ, việc cấp phát một vùng memory Heap chậm hơn so với một vùng tương tự trong memory Stack.

Trong phần này, chúng ta sẽ nói thêm về bản thân Heap và các hướng dẫn mà chúng ta nên ghi nhớ khi dùng memory Heap.

Memory Heap<a id="_idIndexMarker392"></a> quan trọng vì các thuộc tính độc nhất của nó. Không phải tất cả chúng đều có lợi và, thực tế, một số có thể được coi là rủi ro cần được giảm thiểu. Một công cụ tuyệt vời luôn có những điểm tốt và một số điểm xấu, và nếu bạn định dùng nó cho đúng, bạn cần biết rất rõ cả hai mặt.

Ở đây, chúng ta sẽ liệt kê những tính năng này<a id="_idIndexMarker393"></a> và xem tính năng nào có lợi và tính năng nào rủi ro:

1. **Heap không có bất kỳ khối memory nào được cấp phát tự động**. Thay vào đó, lập trình viên phải dùng `malloc` hay các hàm tương tự để lấy các khối memory Heap, từng khối một. Thực tế, điều này có thể được xem là một điểm yếu của memory Stack được memory Heap giải quyết. Memory Stack có thể chứa các stack frame, vốn không được lập trình viên cấp phát và push mà là kết quả của các lời gọi hàm, và theo kiểu tự động.
2. **Heap có kích thước memory lớn**. Trong khi kích thước của Stack bị giới hạn và nó không phải là một lựa chọn tốt để giữ các đối tượng lớn, Heap cho phép lưu các đối tượng rất lớn, thậm chí có kích thước hàng chục gigabyte. Khi kích thước Heap lớn lên, allocator cần yêu cầu thêm heap page từ hệ điều hành, và các khối memory Heap được trải ra giữa những page này. Lưu ý rằng, không giống segment Stack, các address cấp phát trong memory Heap tiến về phía các address lớn hơn.
3. **Việc cấp phát và giải phóng memory bên trong memory Heap được lập trình viên quản lý**. Điều này có nghĩa là lập trình viên là thực thể duy nhất chịu trách nhiệm cấp phát memory và sau đó giải phóng nó khi nó không còn cần thiết. Trong nhiều ngôn ngữ lập trình gần đây, việc giải phóng các khối Heap đã cấp phát được thực hiện tự động bởi một thành phần song song gọi là *garbage collector*. Nhưng trong C <a id="_idIndexMarker394"></a>và C++, chúng ta không có khái niệm như vậy và việc giải phóng các khối Heap phải được thực hiện thủ công. Đây thực sự là một rủi ro, và các lập trình viên C/C++ nên rất cẩn thận khi dùng memory heap. Việc không giải phóng các khối Heap đã cấp phát thường dẫn đến *memory leak*, vốn có thể<a id="_idIndexMarker395"></a> chí mạng trong hầu hết các trường hợp.
4. **Các biến được cấp phát từ Heap không có bất kỳ scope nào**, không giống các biến trong Stack.
5. Đây là một rủi ro vì nó khiến việc quản lý memory khó hơn nhiều. Bạn không biết khi nào cần giải phóng biến, và bạn phải nghĩ ra <a id="_idIndexMarker396"></a>một số định nghĩa mới cho *scope* và *owner* (chủ sở hữu) của <a id="_idIndexMarker397"></a>khối memory để thực hiện việc quản lý memory một cách hiệu quả. Một số phương pháp này được trình bày trong các phần sắp tới.
6. **Chúng ta chỉ có thể dùng pointer để trỏ tới một khối memory Heap**. Nói cách khác, không có khái niệm nào như biến Heap. Vùng Heap được truy cập qua pointer.

1. **Vì segment Heap là private đối với process sở hữu nó, chúng ta cần dùng một debugger để thăm dò nó**. May mắn thay, pointer trong C làm việc với khối memory Heap giống hệt như cách chúng <a id="_idIndexMarker398"></a>làm việc với các khối memory Stack. C thực hiện sự trừu tượng hóa này rất tốt, và nhờ đó, chúng ta có thể dùng cùng các pointer để trỏ tới cả hai loại memory. Do đó, chúng ta có thể dùng cùng các phương pháp đã dùng để xem xét Stack để thăm dò memory Heap.

Trong phần tiếp theo, chúng ta sẽ thảo luận cách cấp phát và giải phóng một khối memory heap.

<a id="_idParaDest-87"></a>

### Cấp phát và giải phóng memory Heap

Như chúng ta đã nói trong phần trước,<a id="_idIndexMarker399"></a> memory Heap phải được lấy và giải phóng<a id="_idIndexMarker400"></a> một cách thủ công. Điều này có nghĩa là lập trình viên phải dùng một tập hàm hay API (các hàm cấp phát memory của thư viện chuẩn C) để cấp phát hay giải phóng một khối memory trong Heap.

Những hàm này có tồn tại, và chúng được định nghĩa trong header `stdlib.h`. Các hàm được dùng để lấy một khối memory Heap là `malloc`, `calloc` và `realloc`, và hàm duy nhất được dùng để giải phóng một khối memory Heap là `free`. *Ví dụ 5.3* minh họa cách dùng một số hàm này.

> **Lưu ý**:
>
> Trong một số tài liệu, dynamic memory được dùng để chỉ memory Heap. *Dynamic memory allocation* là một từ đồng nghĩa với cấp phát memory Heap.

Code box sau thể hiện source code của *ví dụ 5.3*. Nó cấp phát hai khối memory Heap, và sau đó nó in ra các memory mapping của chính nó:

```
#include <stdio.h>  // For printf function
#include <stdlib.h> // For C library's heap memory functions
void print_mem_maps() {
#ifdef __linux__
  FILE* fd = fopen("/proc/self/maps", "r");
  if (!fd) {
    printf("Could not open maps file.\n");
    exit(1);
  }
  char line[1024];
  while (!feof(fd)) {
    fgets(line, 1024, fd);
    printf("> %s", line);
  }
  fclose(fd);
#endif
}
int main(int argc, char** argv) {
  // Allocate 10 bytes without initialization
  char* ptr1 = (char*)malloc(10 * sizeof(char));
  printf("Address of ptr1: %p\n", (void*)&ptr1);
  printf("Memory allocated by malloc at %p: ", (void*)ptr1);
  for (int i = 0; i < 10; i++) {
    printf("0x%02x ", (unsigned char)ptr1[i]);
  }
  printf("\n");
  // Allocation 10 bytes all initialized to zero
  char* ptr2 = (char*)calloc(10, sizeof(char));
  printf("Address of ptr2: %p\n", (void*)&ptr2);
  printf("Memory allocated by calloc at %p: ", (void*)ptr2);
  for (int i = 0; i < 10; i++) {
    printf("0x%02x ", (unsigned char)ptr2[i]);
  }
  printf("\n");
  print_mem_maps();
  free(ptr1);
  free(ptr2);
  return 0;
}
```

*Code Box 5-6 [ExtremeC_examples_chapter5_3.c]: Ví dụ 5.3 thể hiện các memory mapping sau khi cấp phát hai khối memory Heap*

Code trên là cross-platform, và bạn có thể biên dịch nó trên hầu hết các hệ điều hành Unix-like. Nhưng hàm `print_mem_maps` chỉ hoạt động trên Linux vì macro `__linux__` chỉ được <a id="_idIndexMarker401"></a>định nghĩa trong các môi trường Linux. Do đó, trong <a id="_idIndexMarker402"></a>macOS, bạn có thể biên dịch code, nhưng hàm `print_mem_maps` sẽ không làm gì cả.

Shell box sau là kết quả của việc chạy ví dụ trong một môi trường Linux:

```
$ gcc ExtremeC_examples_chapter5_3.c -o ex5_3.out
$ ./ex5_3.out
Address of ptr1: 0x7ffe0ad75c38
Memory allocated by malloc at 0x564c03977260: 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00
Address of ptr2: 0x7ffe0ad75c40
Memory allocated by calloc at 0x564c03977690: 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00
> 564c01978000-564c01979000 r-xp 00000000 08:01 5898436                    /home/kamranamini/extreme_c/5.3/ex5_3.out
> 564c01b79000-564c01b7a000 r--p 00001000 08:01 5898436                    /home/kamranamini/extreme_c/5.3/ex5_3.out
> 564c01b7a000-564c01b7b000 rw-p 00002000 08:01 5898436                    /home/kamranamini/extreme_c/5.3/ex5_3.out
> 564c03977000-564c03998000 rw-p 00000000 00:00 0           [heap]
> 7f31978ec000-7f3197ad3000 r-xp 00000000 08:01 5247803     /lib/x86_64-linux-gnu/libc-2.27.so
...
> 7f3197eef000-7f3197ef1000 rw-p 00000000 00:00 0
> 7f3197f04000-7f3197f05000 r--p 00027000 08:01 5247775     /lib/x86_64-linux-gnu/ld-2.27.so
> 7f3197f05000-7f3197f06000 rw-p 00028000 08:01 5247775     /lib/x86_64-linux-gnu/ld-2.27.so
> 7f3197f06000-7f3197f07000 rw-p 00000000 00:00 0
> 7ffe0ad57000-7ffe0ad78000 rw-p 00000000 00:00 0           [stack]
> 7ffe0adc2000-7ffe0adc5000 r--p 00000000 00:00 0           [vvar]
> 7ffe0adc5000-7ffe0adc7000 r-xp 00000000 00:00 0           [vdso]
> ffffffffff600000-ffffffffff601000 r-xp 00000000 00:00 0   [vsyscall]
$
```

*Shell Box 5-17: Output của ví dụ 5.3 trong Linux*

Output trên có rất nhiều điều để nói. Chương trình in ra address của các pointer `ptr1` và `ptr2`. Nếu bạn tìm memory mapping của segment Stack, như một phần của các memory mapping được in ra, bạn thấy rằng vùng Stack bắt đầu từ `0x7ffe0ad57000` và kết thúc ở `0x7ffe0ad78000`. Các pointer nằm trong dải này.

Điều này có nghĩa là các pointer được cấp phát từ<a id="_idIndexMarker403"></a> Stack, nhưng chúng đang trỏ tới một vùng memory bên ngoài segment Stack, trong trường hợp này là segment Heap. Việc dùng một Stack pointer để trỏ tới <a id="_idIndexMarker404"></a>một khối memory Heap là rất phổ biến.

Hãy nhớ rằng các pointer `ptr1` và `ptr2` có cùng scope và chúng sẽ được giải phóng khi hàm `main` trả về, nhưng không có scope nào cho các khối memory Heap lấy từ segment Heap. Chúng sẽ vẫn được cấp phát cho đến khi chương trình giải phóng chúng một cách thủ công. Bạn có thể thấy rằng trước khi trả về từ hàm `main`, cả hai khối memory đều được giải phóng bằng các pointer trỏ tới chúng và bằng hàm `free`.

Một lưu ý thêm về ví dụ trên, chúng ta có thể thấy rằng các address được trả về bởi các hàm `malloc` và `calloc` nằm bên trong segment Heap. Điều này có thể được điều tra bằng cách so sánh các address được trả về với memory mapping được mô tả là `[heap]`. Vùng được đánh dấu là heap bắt đầu từ `0x564c03977000` và kết thúc ở `0x564c03998000`. Pointer `ptr1` trỏ tới address `0x564c03977260` và `ptr2 p`ointer trỏ tới address `0x564c03977690`, cả hai đều nằm bên trong vùng heap.

Về các hàm cấp phát<a id="_idIndexMarker405"></a> Heap, như tên gọi của chúng ngụ ý, `calloc` là viết tắt của **clear and allocate** (xóa và cấp phát) và `malloc` là viết tắt của **memory allocate** (cấp phát memory). Vậy, điều này có nghĩa là `calloc` xóa khối memory <a id="_idIndexMarker406"></a>sau khi cấp phát, còn `malloc` để nó ở trạng thái chưa khởi tạo cho đến khi chương trình tự làm điều đó nếu cần.

> **Lưu ý**:
>
> Trong C++, các từ khóa `new` và `delete` lần lượt làm điều tương tự như `malloc` và `free`. Ngoài ra, toán tử new suy ra kích thước của khối memory được cấp phát từ kiểu của operand và cũng tự động chuyển đổi pointer được trả về sang kiểu của operand.

Nhưng nếu bạn nhìn vào các byte trong hai khối đã cấp phát, cả hai đều có các byte bằng không. Vậy, có vẻ như `malloc` cũng đã khởi tạo khối memory sau khi cấp phát. Nhưng dựa trên mô tả của `malloc` trong C Specification, `malloc` không khởi tạo khối memory được cấp phát. Vậy, tại sao lại như vậy? Để đi xa hơn, hãy chạy ví dụ trong một môi trường macOS:

```
$ clang ExtremeC_examples_chapter5_3.c -o ex5_3.out
$ ./ ex5_3.out
Address of ptr1: 0x7ffee66b2888
Memory allocated by malloc at 0x7fc628c00370: 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x80 0x00 0x00
Address of ptr2: 0x7ffee66b2878
Memory allocated by calloc at 0x7fc628c02740: 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00
$
```

*Shell Box 5-18: Output của ví dụ 5.3 trên macOS*

Nếu bạn nhìn kỹ, bạn có thể thấy rằng khối memory được cấp phát bởi `malloc` có một số byte non-zero, nhưng khối memory <a id="_idIndexMarker407"></a>được cấp phát bởi `calloc` thì toàn số không. Vậy, chúng ta nên làm gì? Chúng ta có nên giả định rằng <a id="_idIndexMarker408"></a>khối memory được cấp phát bởi `malloc` trong Linux luôn là số không?

Nếu bạn định viết một chương trình cross-platform, hãy luôn tuân theo C specification. Specification nói rằng `malloc` không khởi tạo khối memory được cấp phát.

Ngay cả khi bạn đang viết chương trình chỉ cho Linux và không cho các hệ điều hành khác, hãy lưu ý rằng các compiler tương lai có thể hoạt động khác. Do đó, theo C specification, chúng ta phải luôn giả định rằng khối memory được cấp phát bởi `malloc` chưa được khởi tạo và nó nên được khởi tạo thủ công nếu cần.

Lưu ý rằng vì `malloc` không khởi tạo memory được cấp phát, nó thường nhanh hơn `calloc`. Trong một số hiện thực, `malloc` không thực sự cấp phát khối memory và trì hoãn việc cấp phát cho đến khi khối memory được truy cập (đọc hoặc ghi). Bằng cách này, việc cấp phát memory diễn ra nhanh hơn.

Nếu bạn định khởi tạo memory sau `malloc`, bạn có thể dùng hàm `memset`. Đây là một ví dụ:

```
#include <stdlib.h> // For malloc
#include <string.h> // For memset
int main(int argc, char** argv) {
  char* ptr = (char*)malloc(16 * sizeof(char));
  memset(ptr, 0, 16 * sizeof(char));    // Fill with 0
  memset(ptr, 0xff, 16 * sizeof(char)); // Fill with 0xff
  ...
  free(ptr);
  return 0;
}
```

*Code Box 5-7: Dùng hàm memset để khởi tạo một khối memory*

Hàm `realloc` là<a id="_idIndexMarker409"></a> một hàm khác được giới thiệu như một phần của các hàm cấp phát<a id="_idIndexMarker410"></a> Heap. Nó không được dùng trong *ví dụ 5.3*. Nó thực ra cấp phát lại memory bằng cách thay đổi kích thước của một khối memory đã được cấp phát. Đây là một ví dụ:

```
int main(int argc, char** argv) {
  char* ptr = (char*)malloc(16 * sizeof(char));
  ...
  ptr = (char*)realloc(32 * sizeof(char));
  ...
  free(ptr);
  return 0;
}
```

*Code Box 5-8: Dùng hàm realloc để thay đổi kích thước của một khối đã được cấp phát*

Hàm `realloc` không thay đổi dữ liệu trong khối cũ và chỉ mở rộng một khối đã được cấp phát thành một khối mới. Nếu nó không thể mở rộng khối đang được cấp phát vì *fragmentation* (phân mảnh), nó sẽ tìm một khối khác đủ lớn và sao chép dữ liệu từ khối cũ sang khối mới. Trong trường hợp này, nó cũng sẽ giải phóng khối cũ. Như bạn có thể thấy, việc cấp phát lại không phải là một thao tác rẻ trong một số trường hợp vì nó gồm nhiều bước, do đó nó nên được dùng một cách cẩn thận.

Lưu ý cuối cùng về *ví dụ 5.3* là về hàm `free`. Thực tế, nó giải phóng một khối memory Heap đã được cấp phát bằng cách truyền address của khối dưới dạng một pointer. Như đã nói trước đây, mọi khối Heap đã cấp phát nên được giải phóng khi nó không còn cần thiết. Không làm như vậy sẽ dẫn đến *memory leakage* (rò rỉ memory). Dùng một <a id="_idIndexMarker411"></a>ví dụ mới, *ví dụ 5.4*, chúng tôi sẽ cho bạn thấy cách phát hiện memory leak bằng công cụ `valgrind`.

Trước tiên hãy tạo ra một số memory leak như một phần của *ví dụ 5.4*:

```
#include <stdlib.h> // For heap memory functions
int main(int argc, char** argv) {
  char* ptr = (char*)malloc(16 * sizeof(char));
  return 0;
}
```

*Code Box 5-9: Tạo ra một memory leak bằng cách không giải phóng khối đã cấp phát khi trả về từ hàm main*

Chương trình trên có một memory leak vì khi chương trình kết thúc, chúng ta có `16` byte memory Heap đã được cấp phát mà không được giải phóng. Ví dụ này rất đơn giản, nhưng khi source code lớn lên và có nhiều thành phần hơn tham gia, sẽ quá khó hoặc thậm chí không thể phát hiện nó bằng mắt.

Memory profiler là những chương trình hữu ích có thể phát hiện các vấn đề memory trong một process đang chạy. Công cụ `valgrind` nổi tiếng là một trong những công cụ được biết đến nhiều nhất.

Để dùng `valgrind` phân tích *ví dụ 5.4*, trước tiên chúng ta cần build ví dụ với tùy chọn debug `-g`. Sau đó, chúng ta nên<a id="_idIndexMarker412"></a> chạy nó bằng `valgrind`. Trong khi chạy executable object file<a id="_idIndexMarker413"></a> được cho, `valgrind` ghi lại mọi lần cấp phát và giải phóng memory. Cuối cùng, khi việc thực thi kết thúc hoặc một crash xảy ra, `valgrind` in ra bản tóm tắt các lần cấp phát và giải phóng và lượng memory chưa được giải phóng. Bằng cách này, nó có thể cho bạn biết bao nhiêu memory leak đã được tạo ra trong quá trình thực thi chương trình được cho.

Shell box sau minh họa cách biên dịch và dùng `valgrind` cho *ví dụ 5.4*:

```
$ gcc -g ExtremeC_examples_chapter5_4.c -o ex5_4.out
$ valgrind ./ex5_4.out
==12022== Memcheck, a memory error detector
==12022== Copyright (C) 2002-2017, and GNU GPL'd, by Julian Seward et al.
==12022== Using Valgrind-3.13.0 and LibVEX; rerun with -h for copyright info
==12022== Command: ./ex5_4.out
==12022==
==12022==
==12022== HEAP SUMMARY:
==12022==     in use at exit: 16 bytes in 1 blocks
==12022==   total heap usage: 1 allocs, 0 frees, 16 bytes allocated
==12022==
==12022== LEAK SUMMARY:
==12022==    definitely lost: 16 bytes in 1 blocks
==12022==    indirectly lost: 0 bytes in 0 blocks
==12022==      possibly lost: 0 bytes in 0 blocks
==12022==    still reachable: 0 bytes in 0 blocks
==12022==         suppressed: 0 bytes in 0 blocks
==12022== Rerun with --leak-chck=full to see details of leaked memory
==12022==
==12022== For counts of detected and suppressed errors, rerun with: -v
==12022== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
$
```

*Shell Box 5-19: Output của valgrind thể hiện memory leak 16-byte trong quá trình thực thi ví dụ 5.4*

Nếu bạn nhìn vào phần `HEAP SUMMARY` trong *Shell Box 5-19*, bạn có thể thấy rằng chúng ta đã có `1` lần cấp phát và `0` lần giải phóng, và `16` byte<a id="_idIndexMarker414"></a> vẫn còn được cấp phát khi thoát. Nếu bạn đi xuống một chút tới phần `LEAK SUMMARY`, nó nói rằng `16` byte chắc chắn đã bị mất (definitely lost), và điều này có nghĩa là một memory leak!

Nếu bạn muốn biết <a id="_idIndexMarker415"></a>chính xác khối memory bị rò rỉ đã nêu được cấp phát ở dòng nào, bạn có thể dùng `valgrind` với một tùy chọn đặc biệt được thiết kế cho việc này. Trong shell box sau, bạn sẽ thấy cách dùng `valgrind` để tìm các dòng chịu trách nhiệm cho việc cấp phát thực sự:

```
$ gcc -g ExtremeC_examples_chapter5_4.c -o ex5_4.out
$ valgrind --leak-check=full ./ex5_4.out
==12144== Memcheck, a memory error detector
==12144== Copyright (C) 2002-2017, and GNU GPL'd, by Julian Seward et al.
==12144== Using Valgrind-3.13.0 and LibVEX; rerun with -h for copyright info
==12144== Command: ./ex5_4.out
==12144==
==12144==
==12144== HEAP SUMMARY:
==12144==     in use at exit: 16 bytes in 1 blocks
==12144==   total heap usage: 1 allocs, 0 frees, 16 bytes allocated
==12144==
==12144== 16 bytes in 1 blocks are definitely lost in loss record 1 of 1
==12144==    at 0x4C2FB0F: malloc (in /usr/lib/valgrind/vgpreload_memcheck-amd64-linux.so)
==12144==    by 0x108662: main (ExtremeC_examples_chapter5_4.c:4)
==12144==
==12144== LEAK SUMMARY:
==12144==    definitely lost: 16 bytes in 1 blocks
==12144==    indirectly lost: 0 bytes in 0 blocks
==12144==      possibly lost: 0 bytes in 0 blocks
==12144==    still reachable: 0 bytes in 0 blocks
==12144==         suppressed: 0 bytes in 0 blocks
==12144==
==12144== For counts of detected and suppressed errors, rerun with : -v
==12144== ERROR SUMMARY: 1 errors from 1 contexts (suppressed: 0 from 0)
$
```

*Shell Box 5-20: Output của valgrind thể hiện dòng chịu trách nhiệm cho việc cấp phát thực sự*

Như bạn có thể thấy, chúng ta đã truyền tùy chọn `--leak-check=full` cho `valgrind`, và giờ nó hiển thị dòng code<a id="_idIndexMarker416"></a> chịu trách nhiệm cho memory Heap bị rò rỉ. Nó cho thấy rõ rằng dòng 4 trong *Code Box 5-9*, vốn là một lời gọi `malloc`, là nơi khối Heap bị rò rỉ<a id="_idIndexMarker417"></a> đã được cấp phát. Điều này có thể giúp bạn lần theo nó xa hơn và tìm đúng chỗ mà khối bị rò rỉ đã nêu nên được giải phóng.

OK, hãy thay đổi ví dụ trên để nó giải phóng memory đã cấp phát. Chúng ta chỉ cần thêm instruction `free(ptr)` trước câu lệnh `return`, như chúng ta có thể thấy ở đây:

```
#include <stdlib.h> // For heap memory functions
int main(int argc, char** argv) {
  char* ptr = (char*)malloc(16 * sizeof(char));
  free(ptr);
  return 0;
}
```

*Code Box 5-10: Giải phóng khối memory đã cấp phát trong ví dụ 5.4*

Giờ với thay đổi này, khối Heap duy nhất đã cấp phát được giải phóng. Hãy build và chạy `valgrind` lần nữa:

```
$ gcc -g ExtremeC_examples_chapter5_4.c -o ex5_4.out
$ valgrind --leak-check=full ./ex5_4.out
==12175== Memcheck, a memory error detector
==12175== Copyright (C) 2002-2017, and GNU GPL'd, by Julian Seward et al.
==12175== Using Valgrind-3.13.0 and LibVEX; rerun with -h for copyright info
==12175== Command: ./ex5_4.out
==12175==
==12175==
==12175== HEAP SUMMARY:
==12175==     in use at exit: 0 bytes in 0 blocks
==12175==   total heap usage: 1 allocs, 1 frees, 16 bytes allocated
==12175==
==12175== All heap blocks were freed -- no leaks are possible
==12175==
==12175== For counts of detected and suppressed errors, rerun with  -v
==12175== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
$
```

*Shell Box 5-20: Output của valgrind sau khi giải phóng khối memory đã cấp phát*

Như bạn có thể thấy, `valgrind` nói rằng `All Heap blocks were freed`, và điều này thực chất có nghĩa là chúng ta không còn memory<a id="_idIndexMarker418"></a> leakage nào trong chương trình. Chạy chương trình với `valgrind` có thể làm chúng chậm đi đáng kể, gấp 10 đến 50 lần, nhưng nó có thể giúp bạn phát hiện các vấn đề memory rất <a id="_idIndexMarker419"></a>dễ dàng. Để các chương trình bạn viết chạy bên trong một memory profiler và bắt các memory leak càng sớm càng tốt là một thực hành tốt.

Memory leak có thể được coi<a id="_idIndexMarker420"></a> vừa là *technical debt* (nợ kỹ thuật), nếu bạn có một thiết kế tồi gây ra<a id="_idIndexMarker421"></a> các leak, vừa là *rủi ro*, khi biết rằng chúng ta có một leak, nhưng chúng ta không biết điều gì sẽ xảy ra nếu leak tiếp tục lớn lên. Nhưng theo ý kiến của tôi, chúng nên được<a id="_idIndexMarker423"></a> đối xử như *bug*; nếu không, sẽ mất một thời gian bạn mới nhìn lại chúng. Thông thường, trong các nhóm, memory leak được đối xử như bug cần được sửa càng sớm càng tốt.

Có những memory<a id="_idIndexMarker424"></a> profiler khác ngoài `valgrind`. **LLVM Address Sanitizer** (hay **ASAN**) và **MemProf** cũng là những memory profiler well-known khác. Memory profiler có thể profile việc sử dụng và cấp phát memory bằng nhiều phương pháp khác nhau. Tiếp theo, chúng ta thảo luận một số phương pháp:

- Một số profiler có thể hoạt động giống một sandbox, chạy chương trình đích bên trong và giám sát mọi hoạt động memory của nó. Chúng ta đã dùng phương pháp này để chạy *ví dụ 5.4* bên trong một sandbox `valgrind`. Phương pháp này không đòi hỏi bạn biên dịch lại code.

- Một phương pháp khác là dùng các library do một số memory profiler cung cấp, vốn bọc các system call memory-related. Bằng cách này, binary cuối cùng sẽ chứa mọi logic cần thiết cho tác vụ profiling.

  `valgrind` và ASAN có thể được link vào executable object file cuối cùng như một memory profiler library. Phương pháp này đòi hỏi biên dịch lại source code đích và thậm chí cả việc thực hiện một số sửa đổi đối với source code nữa.

- Chương trình cũng có thể *preload* các library khác thay cho các library chuẩn C mặc định, vốn chứa các *function interposition* memory của các hàm cấp phát memory chuẩn của library C. Bằng cách này, bạn không cần biên dịch source code đích. Bạn chỉ cần chỉ định các library của những profiler như vậy trong biến môi trường `LD_PRELOAD` để chúng được preload thay cho các library `libc` mặc định. `MemProf` dùng<a id="_idIndexMarker427"></a> phương pháp này.

> **Lưu ý**:
>
> Một *function interposition* là một hàm wrapper được định nghĩa trong một dynamic library được nạp trước dynamic library đích, hàm này chuyển tiếp các lời gọi tới hàm đích. Dynamic library có thể được preload bằng biến môi trường `LD_PRELOAD`.

<a id="_idParaDest-88"></a>

### Các nguyên tắc về memory Heap

Như đã chỉ ra trước đây, memory Heap <a id="_idIndexMarker428"></a>khác với memory Stack ở nhiều điểm. Do đó, memory heap có các hướng dẫn riêng về quản lý memory. Trong phần này, chúng ta sẽ tập trung vào những khác biệt này và đưa ra một số điều nên làm và không nên làm mà chúng ta nên cân nhắc khi làm việc với không gian Heap.

Mỗi khối memory (hay một biến) trong Stack có một scope. Vì vậy, việc định nghĩa vòng đời của một khối memory dựa trên scope của nó là một việc dễ dàng. Bất cứ khi nào chúng ta ra khỏi scope, mọi biến trong scope đó đều biến mất. Nhưng điều này khác và phức tạp hơn nhiều với memory Heap.

Một khối memory Heap không có scope nào, nên vòng đời của nó không rõ ràng và cần được định nghĩa lại. Đây là lý do đằng sau việc có giải phóng thủ công <a id="_idIndexMarker429"></a>hay *generational* *garbage collection* trong các ngôn ngữ hiện đại như Java. Vòng đời Heap không thể được xác định bởi chính chương trình hay các library C được dùng, và lập trình viên là người duy nhất định nghĩa vòng đời của một khối memory Heap.

Khi thảo luận đến quyết định của lập trình viên, đặc biệt trong trường hợp này, nó phức tạp và khó có thể đề xuất một giải pháp vạn năng (silver bullet). Mọi ý kiến đều có thể tranh luận và có thể dẫn đến một trade-off.

Một trong những chiến lược tốt nhất được đề xuất để vượt qua sự phức tạp của vòng đời Heap, vốn dĩ nhiên không phải là một giải pháp hoàn chỉnh, là định nghĩa một *owner* (chủ sở hữu) cho một khối memory thay vì có một scope bao trùm khối memory.

Owner là thực thể duy nhất chịu trách nhiệm quản lý vòng đời của một khối memory Heap và là thực thể cấp phát khối ngay từ đầu và giải phóng nó khi khối không còn cần thiết.

Có rất nhiều ví dụ kinh điển về cách dùng chiến lược này. Hầu hết các library C well-known đều dùng chiến lược này để xử lý các lần cấp phát memory Heap của chúng. *Ví dụ 5.5* là một hiện thực rất đơn giản của phương pháp này được dùng để quản lý vòng đời của một đối tượng queue được viết bằng C. Code<a id="_idIndexMarker431"></a> box sau cố gắng minh họa chiến lược *ownership* (quyền sở hữu):

```
#include <stdio.h> // For printf function
#include <stdlib.h> // For heap memory functions
#define QUEUE_MAX_SIZE 100
typedef struct {
  int front;
  int rear;
  double* arr;
} queue_t;
void init(queue_t* q) {
  q->front = q->rear = 0;
  // The heap memory block allocated here is owned
  // by the queue object.
  q->arr = (double*)malloc(QUEUE_MAX_SIZE * sizeof(double));
}
void destroy(queue_t* q) {
  free(q->arr);
}
int size(queue_t* q) {
  return q->rear - q->front;
}
void enqueue(queue_t* q, double item) {
  q->arr[q->rear] = item;
  q->rear++;
}
double dequeue(queue_t* q) {
  double item = q->arr[q->front];
  q->front++;
  return item;
}
int main(int argc, char** argv) {
  // The heap memory block allocated here is owned
  // by the function main
  queue_t* q = (queue_t*)malloc(sizeof(queue_t));
  // Allocate needed memory for the queue object
  init(q);
  enqueue(q, 6.5);
  enqueue(q, 1.3);
  enqueue(q, 2.4);
  printf("%f\n", dequeue(q));
  printf("%f\n", dequeue(q));
  printf("%f\n", dequeue(q));
  // Release resources acquired by the queue object
  destroy(q);
  // Free the memory allocated for the queue object
  // acquired by the function main
  free(q);
  return 0;
}
```

*Code Box 5-11 [ExtremeC_examples_chapter5_5.c]: Ví dụ 5.5 minh họa chiến lược ownership để quản lý vòng đời Heap*

Ví dụ trên chứa hai ownership khác nhau, mỗi ownership sở hữu một đối tượng cụ thể. Ownership thứ nhất là về khối memory Heap được trỏ tới bởi pointer `arr` trong structure `queue_t`, vốn thuộc sở hữu của đối tượng queue. Chừng nào đối tượng queue còn tồn tại, khối memory này phải vẫn ở tại chỗ và được cấp phát.

Ownership thứ hai<a id="_idIndexMarker432"></a> liên quan đến khối memory Heap được hàm `main` lấy làm chỗ chứa cho đối tượng queue `q`, vốn thuộc sở hữu của chính hàm `main`. Việc phân biệt giữa các khối memory Heap thuộc sở hữu của đối tượng queue và các khối memory Heap thuộc sở hữu của hàm `main` là rất quan trọng, vì giải phóng một trong số chúng không giải phóng cái kia.

Để minh họa cách một memory leak có thể xảy ra trong code trên, giả sử rằng bạn quên gọi hàm `destroy` trên đối tượng queue. Điều đó chắc chắn sẽ dẫn đến một memory leak vì khối memory Heap được lấy bên trong hàm `init` sẽ vẫn được cấp phát và không được giải phóng.

Lưu ý rằng nếu một thực thể (một đối tượng, hàm, v.v.) sở hữu một khối memory Heap, điều đó nên được thể hiện trong các comment. Không gì được giải phóng một khối memory Heap nếu nó không sở hữu khối đó.

Lưu ý rằng việc giải phóng nhiều lần cùng một khối memory Heap sẽ dẫn đến tình huống *double free*. Một <a id="_idIndexMarker433"></a>tình huống double-free là một vấn đề memory corruption và giống như mọi vấn đề memory corruption khác, nó nên được xử lý và giải quyết sớm sau khi phát hiện. Nếu không, nó có thể gây ra những hậu quả nghiêm trọng như crash đột ngột.

Ngoài chiến lược ownership, người ta có thể dùng một garbage collector. Garbage collector là một cơ chế tự động được nhúng vào một chương trình và cố gắng thu gom các khối memory không có pointer nào <a id="_idIndexMarker434"></a>trỏ tới chúng. Một trong những garbage collector well-known lâu đời cho C là *Boehm-Demers-Weiser Conservative Garbage Collector*, cung cấp một tập hàm cấp phát memory nên được gọi thay cho `malloc` và các hàm cấp phát memory chuẩn khác của C.

> **Đọc thêm**:
>
> Có thể tìm thêm informatio[n about the Boehm-Demers-Weise](http://www.hboehm.info/gc/)r garbage collector tại đây: [http://www.hboehm.info/gc/](http://www.hboehm.info/gc/).

Một kỹ thuật khác để<a id="_idIndexMarker435"></a> quản lý vòng đời của một khối Heap là<a id="_idIndexMarker436"></a> dùng một đối tượng RAII. **RAII** là viết tắt của **Resource Acquisition Is Initialization**. Nó có nghĩa là chúng ta có thể gắn vòng đời của một tài nguyên, có thể là một khối memory được cấp phát trên Heap, với vòng đời của một đối tượng. Nói cách khác, chúng ta dùng một đối tượng mà khi được khởi tạo (construction) thì khởi tạo tài nguyên, và khi bị hủy (destruction) thì giải phóng tài nguyên. Không may là kỹ thuật này không thể được dùng trong C vì chúng ta không được thông báo về việc hủy một đối tượng. Nhưng trong C++, dùng destructor, kỹ thuật này có thể được dùng một cách hiệu quả. Trong các đối tượng RAII, việc khởi tạo tài nguyên diễn ra trong constructor và code cần thiết để de-initialize tài nguyên được đặt vào destructor. Lưu ý rằng trong C++, destructor được gọi tự động khi một đối tượng sắp ra khỏi scope hay đang bị delete.

Để kết luận, các hướng dẫn sau là quan trọng khi làm việc với memory Heap:

- Việc cấp phát memory Heap<a id="_idIndexMarker437"></a> không miễn phí, và nó có chi phí riêng. Không phải mọi hàm cấp phát memory đều có cùng chi phí và, thông thường, `malloc` là hàm rẻ nhất.
- Mọi khối memory được cấp phát từ không gian Heap đều phải được giải phóng hoặc ngay lập tức khi chúng không còn cần thiết hoặc ngay trước khi kết thúc chương trình.
- Vì các khối memory Heap<a id="_idIndexMarker438"></a> không có scope, chương trình phải có khả năng quản lý memory để tránh mọi khả năng rò rỉ.
- Việc bám theo một chiến lược quản lý memory đã chọn cho mỗi khối memory Heap có vẻ là cần thiết.
- Chiến lược đã chọn và các giả định của nó nên được ghi lại trong toàn bộ code ở bất cứ nơi nào khối được truy cập để các lập trình viên tương lai biết về nó.
- Trong một số ngôn ngữ lập trình như C++, chúng ta có thể dùng các đối tượng RAII để quản lý một tài nguyên, có thể là một khối memory Heap.

Cho đến giờ, chúng ta đã coi như mình có đủ memory để lưu các đối tượng lớn và chạy bất kỳ loại chương trình nào. Nhưng trong phần sau, chúng ta sẽ đặt một số ràng buộc lên memory có sẵn và thảo luận về các môi trường mà memory thấp, hoặc việc thêm memory storage tốn kém (về tiền bạc, thời gian, hiệu năng, v.v.). Trong những trường hợp như vậy, chúng ta cần dùng memory có sẵn theo cách hiệu quả nhất.

<a id="_idParaDest-89"></a>

## Quản lý memory trong các môi trường bị ràng buộc

Có những môi trường mà memory là một tài nguyên quý giá, và nó thường bị giới hạn. Cũng có những môi trường khác mà<a id="_idIndexMarker439"></a> hiệu năng là một yếu tố then chốt và chương trình phải nhanh, bất kể chúng ta có bao nhiêu memory. Về quản lý memory, mỗi môi trường này đòi hỏi một kỹ thuật cụ thể để vượt qua tình trạng thiếu memory và suy giảm hiệu năng. Trước tiên, chúng ta cần biết một môi trường bị ràng buộc là gì.

Một môi trường bị ràng buộc không nhất thiết có dung lượng memory thấp. Thường có một số *ràng buộc* giới hạn việc sử dụng memory cho một chương trình. Những<a id="_idIndexMarker440"></a> ràng buộc này có thể là giới hạn cứng của khách hàng về việc sử dụng memory, hoặc có thể là do một phần cứng cung cấp dung lượng memory thấp, hoặc có thể là do một hệ điều hành không hỗ trợ memory lớn hơn (ví dụ, MS-DOS).

Ngay cả khi không có ràng buộc hay giới hạn phần cứng nào, chúng ta với tư cách lập trình viên vẫn cố gắng hết sức để dùng lượng memory ít nhất có thể và dùng nó một cách tối ưu. Mức tiêu thụ memory là một trong những *yêu cầu non-functional* then chốt trong một dự án và nên được giám sát và tinh chỉnh cẩn thận.

Trong phần này, trước tiên chúng ta sẽ giới thiệu các kỹ thuật được dùng trong các môi trường memory thấp để vượt qua vấn đề thiếu hụt, và sau đó chúng ta sẽ nói về các kỹ thuật memory thường được dùng trong các môi trường hiệu năng cao để tăng hiệu năng của các chương trình đang chạy.

<a id="_idParaDest-90"></a>

### Các môi trường Memory-constrained

Trong những môi trường này, memory<a id="_idIndexMarker441"></a> giới hạn luôn là một ràng buộc, và các thuật toán nên được thiết kế theo cách để đối phó với tình trạng thiếu memory. Các embedded system với kích thước memory từ hàng chục đến hàng trăm megabyte thường thuộc loại này. Có một vài mẹo về quản lý memory trong những môi trường như vậy, nhưng không mẹo nào hiệu quả bằng việc có một thuật toán được tinh chỉnh tốt. Trong trường hợp này, các thuật toán có độ phức tạp memory thấp thường được dùng. Những thuật toán này thường có *độ phức tạp thời gian* cao hơn, điều cần được đánh đổi với mức sử dụng memory thấp của chúng.

Để giải thích thêm về điều này, mọi thuật toán đều có độ phức tạp *thời gian* và *memory* cụ thể. Độ phức tạp thời gian mô tả mối quan hệ giữa kích thước input và thời gian mà thuật toán cần để hoàn tất. Tương tự, độ phức tạp memory mô tả mối quan hệ giữa kích thước input và memory mà thuật toán tiêu thụ để hoàn tất tác vụ của nó. Những độ phức tạp này <a id="_idIndexMarker442"></a>thường được ký hiệu dưới dạng *các hàm Big-O*, mà chúng ta không muốn đề cập trong phần này. Thảo luận của chúng ta mang tính định tính, nên chúng ta không cần toán học nào để nói về các môi trường memory-constrained.

Một thuật toán lý tưởng nên có độ phức tạp thời gian thấp và cũng có độ phức tạp memory thấp. Nói cách khác, có một thuật toán nhanh tiêu thụ ít memory là điều rất đáng mong muốn, nhưng việc có tình huống "tốt cả đôi đường" này là bất thường. Việc có một thuật toán tiêu thụ nhiều memory trong khi không hoạt động tốt cũng là điều không được mong đợi

Phần lớn thời gian, chúng ta có một trade-off giữa memory và tốc độ, vốn đại diện cho thời gian. Ví dụ, một thuật toán sắp xếp nhanh hơn một thuật toán khác thường tiêu thụ nhiều memory hơn thuật toán kia, mặc dù cả hai đều làm cùng một công việc.

Đây là một thực hành tốt nhưng thận trọng, đặc biệt khi viết một chương trình, giả định rằng chúng ta đang viết code cho một hệ thống memory-constrained, ngay cả khi chúng ta biết rằng chúng ta sẽ có thừa memory trong môi trường production cuối cùng. Chúng ta đưa ra giả định này vì muốn giảm thiểu rủi ro tiêu thụ quá nhiều memory.

Lưu ý rằng động lực đằng sau giả định này nên được kiểm soát và điều chỉnh dựa trên một ước đoán khá chính xác về lượng memory có sẵn trung bình, về kích thước, trong thiết lập cuối cùng. Các thuật toán được thiết kế cho các môi trường memory-constrained về bản chất chậm hơn, và bạn nên cẩn thận với cái bẫy này.

Trong các phần sắp tới, chúng ta sẽ trình bày một số kỹ thuật có thể giúp chúng ta thu gom một số memory bị lãng phí hoặc dùng ít memory hơn trong các môi trường memory-constrained.

<a id="_idParaDest-91"></a>

#### Packed structure

Một trong những cách dễ nhất để dùng ít <a id="_idIndexMarker444"></a>memory hơn là dùng packed structure. Packed structure bỏ qua memory alignment và chúng có memory layout gọn hơn để lưu các trường của chúng.

Dùng packed structure thực ra là một trade-off. Bạn tiêu thụ ít memory hơn vì bạn bỏ qua memory alignment và rốt cuộc phải chịu thời gian đọc memory lâu hơn khi nạp một biến structure. Điều này sẽ dẫn đến một chương trình chậm hơn.

Phương pháp này đơn giản nhưng không được khuyến nghị cho mọi chương trình. Để biết thêm thông tin về phương pháp này, bạn có thể đọc phần *Structure* có trong *Chương 1*, *Các tính năng thiết yếu (Essential Features)*.

<a id="_idParaDest-92"></a>

#### Nén (Compression)

Đây là một kỹ thuật hiệu quả, đặc biệt cho các chương trình làm việc với nhiều dữ liệu văn bản cần được giữ bên trong <a id="_idIndexMarker445"></a>memory. Dữ liệu văn bản có *tỉ lệ nén* cao so với dữ liệu binary. Kỹ thuật này cho phép một chương trình lưu dạng đã nén thay cho dữ liệu văn bản thật với lượng memory thu lại rất lớn.

Tuy nhiên, tiết kiệm memory không miễn phí; vì các thuật toán nén là *CPU-bound* và computation-intensive, chương trình rốt cuộc sẽ có hiệu năng kém hơn. Phương pháp này lý tưởng cho các chương trình giữ dữ liệu văn bản không thường xuyên được cần đến; nếu không, sẽ cần rất nhiều thao tác nén/giải nén, và rốt cuộc chương trình sẽ gần như không thể dùng được.

<a id="_idParaDest-93"></a>

#### Lưu trữ dữ liệu bên ngoài (External data storage)

Dùng lưu trữ dữ liệu bên ngoài<a id="_idIndexMarker446"></a> dưới dạng một network service, một hạ tầng cloud, hay đơn giản là một ổ cứng là một kỹ thuật rất phổ biến và hữu ích để giải quyết các vấn đề memory thấp. Vì thường người ta cho rằng một chương trình có thể được chạy trong một môi trường memory giới hạn hay thấp, có rất nhiều ví dụ dùng phương pháp này để có thể tiêu thụ ít memory hơn ngay cả trong các môi trường có đủ memory.

Kỹ thuật này thường giả định rằng memory không phải là nơi lưu trữ chính, mà nó đóng vai trò là *cache* memory. Một giả định khác là chúng ta không thể giữ toàn bộ dữ liệu trong memory và vào bất kỳ thời điểm nào, chỉ một phần dữ liệu hay một *page* dữ liệu có thể được nạp vào memory.

Những thuật toán này không trực tiếp giải quyết vấn đề memory thấp, mà chúng đang cố giải quyết một vấn đề khác: lưu trữ dữ liệu bên ngoài chậm. Lưu trữ dữ liệu bên ngoài luôn quá chậm so với main memory. Vì vậy, các thuật toán nên cân bằng giữa các lần đọc từ kho dữ liệu bên ngoài và memory nội bộ của chúng. Mọi dịch vụ cơ sở dữ liệu, như PostgreSQL và Oracle, đều dùng kỹ thuật này.

Trong hầu hết các dự án, việc<a id="_idIndexMarker447"></a> thiết kế và viết những thuật toán này từ đầu không khôn ngoan lắm vì những thuật toán này không tầm thường và đơn giản để viết. Các nhóm đứng sau những library nổi tiếng như SQLite đã sửa bug trong nhiều năm.

Nếu bạn cần truy cập một kho lưu trữ dữ liệu bên ngoài như một file, một cơ sở dữ liệu, hay một host trên mạng trong khi có memory footprint thấp, luôn có những lựa chọn sẵn có cho bạn.

<a id="_idParaDest-94"></a>

### Các môi trường hiệu năng cao (Performant environments)

Như chúng ta đã giải thích trong<a id="_idIndexMarker448"></a> các phần trước về độ phức tạp thời gian và memory của một thuật toán, thông thường người ta kỳ vọng sẽ tiêu thụ nhiều memory hơn khi bạn muốn có một thuật toán nhanh hơn. Do đó, trong phần này, chúng ta kỳ vọng tiêu thụ nhiều memory hơn để đổi lấy hiệu năng tăng lên.

Một ví dụ trực quan của phát biểu này có thể là việc dùng một cache để tăng hiệu năng. Cache dữ liệu có nghĩa là tiêu thụ nhiều memory hơn, nhưng chúng ta có thể kỳ vọng có được hiệu năng tốt hơn nếu cache được dùng đúng cách.

Nhưng thêm memory không phải lúc nào cũng là cách tốt nhất để tăng hiệu năng. Có những phương pháp khác liên quan trực tiếp hay gián tiếp đến memory và có thể có tác động đáng kể đến hiệu năng của một thuật toán. Trước khi nhảy tới những phương pháp này, trước tiên hãy nói về caching.

<a id="_idParaDest-95"></a>

#### Caching

Caching là một thuật ngữ chung cho mọi <a id="_idIndexMarker449"></a>kỹ thuật tương tự được dùng ở nhiều phần của một hệ thống máy tính khi có hai kho lưu trữ dữ liệu với tốc độ đọc/ghi khác nhau tham gia. Ví dụ, CPU có một số register nội bộ hoạt động nhanh xét về các thao tác đọc và ghi. Ngoài ra, CPU phải fetch dữ liệu từ main memory, vốn chậm hơn nhiều lần so với các register của nó. Ở đây cần một cơ chế caching; nếu không, tốc độ thấp hơn của main memory trở nên chi phối, và nó che khuất tốc độ tính toán cao của CPU.

Làm việc với các file cơ sở dữ liệu là một ví dụ khác. Các file cơ sở dữ liệu thường được lưu trên một ổ cứng ngoài, vốn chậm hơn main memory rất nhiều, tới nhiều bậc độ lớn. Chắc chắn, ở đây cần một cơ chế caching; nếu không, tốc độ chậm nhất trở nên chi phối, và nó quyết định tốc độ của toàn bộ hệ thống.

Caching và các chi tiết xung quanh nó xứng đáng có cả một chương riêng vì có những mô hình trừu tượng và thuật ngữ cụ thể cần được giải thích.

Dùng những mô hình này, người ta có thể dự đoán một cache sẽ hoạt động tốt đến đâu và có thể kỳ vọng bao nhiêu *performance gain* (mức tăng hiệu năng) sau khi đưa cache vào. Ở đây, chúng ta cố gắng giải thích caching theo cách đơn giản và trực quan.

Giả sử rằng bạn có một kho lưu trữ chậm có thể chứa nhiều mục. Bạn cũng có một kho lưu trữ nhanh khác, nhưng nó chỉ có thể chứa một số lượng mục giới hạn. Đây là một tradeoff hiển nhiên. Chúng ta có thể gọi kho lưu trữ nhanh hơn nhưng nhỏ hơn là *cache*. Sẽ hợp lý nếu bạn mang các mục từ kho lưu trữ chậm vào kho nhanh và xử lý chúng trên kho nhanh, đơn giản vì nó nhanh hơn.

Thỉnh thoảng, bạn phải tới kho lưu trữ chậm để mang thêm mục sang. Hiển nhiên là bạn sẽ không mang chỉ một mục từ kho lưu trữ chậm sang, vì việc này sẽ rất kém hiệu quả. Thay vào đó, bạn sẽ mang một *bucket* (xô) các mục vào kho lưu trữ nhanh hơn. Thông thường, người ta nói rằng các mục được cache vào kho lưu trữ nhanh hơn.

Giả sử rằng bạn đang xử lý một mục đòi hỏi bạn nạp một mục khác từ kho lưu trữ chậm. Điều đầu tiên nảy ra trong đầu là tìm mục cần thiết bên trong bucket vừa được mang sang, vốn đang nằm trong kho cache vào lúc này.

Nếu bạn có thể tìm thấy<a id="_idIndexMarker450"></a> mục trong cache, không cần lấy nó từ kho lưu trữ chậm, và<a id="_idIndexMarker451"></a> điều này được gọi là một *hit*. Nếu mục không có trong kho cache, bạn phải tới kho lưu trữ chậm và đọc một bucket mục khác vào cache <a id="_idIndexMarker452"></a>memory. Điều này được gọi là một *miss*. Rõ ràng là bạn quan sát được càng nhiều hit, bạn càng có được nhiều hiệu năng.

Mô tả trên có thể được áp dụng cho CPU cache và main memory. CPU cache lưu các instruction và dữ liệu gần đây được đọc từ main memory, và main memory chậm so với CPU cache memory.

Trong phần sau, chúng ta thảo luận về code cache-friendly, và chúng ta quan sát tại sao code cache-friendly có thể được CPU thực thi nhanh hơn.

##### Code Cache-friendly

Khi CPU đang thực thi <a id="_idIndexMarker453"></a>một instruction, trước tiên nó phải fetch mọi dữ liệu cần thiết. Dữ liệu nằm trong main memory tại một address cụ thể được xác định bởi instruction.

Dữ liệu phải được chuyển tới các register của CPU trước bất kỳ phép tính nào. Nhưng CPU thường mang nhiều khối hơn số được kỳ vọng sẽ fetch và đặt chúng vào cache của nó.

Lần tiếp theo, nếu cần một giá trị ở *vùng lân cận* của address trước đó, nó hẳn sẽ có trong cache, và CPU có thể dùng cache thay vì main memory, vốn nhanh hơn rất nhiều so với việc đọc nó từ main memory. Như chúng ta đã giải thích trong phần trước, đây là một *cache hit*. Nếu address <a id="_idIndexMarker454"></a>không được tìm thấy trong CPU cache, đó là một *cache miss*, và CPU phải <a id="_idIndexMarker455"></a>truy cập main memory để đọc address đích và mang dữ liệu cần thiết về, việc này khá chậm. Nói chung, tỉ lệ hit cao hơn dẫn đến việc thực thi nhanh hơn.

Nhưng tại sao CPU lại fetch các address lân cận (vùng lân cận) quanh một address? Đó là vì *nguyên lý locality* (principle of locality). Trong các hệ thống máy tính, người ta thường quan sát thấy rằng dữ liệu nằm trong cùng một vùng lân cận được truy cập thường xuyên hơn. Vì vậy, CPU hoạt động theo nguyên lý này và mang thêm dữ liệu từ một tham chiếu cục bộ. Nếu một thuật toán có thể khai thác hành vi này, nó có thể được CPU thực thi nhanh hơn. Đây là lý do tại sao chúng ta gọi những<a id="_idIndexMarker456"></a> thuật toán như vậy là thuật toán *cache-friendly*.

*Ví dụ 5.6* minh họa sự khác biệt giữa hiệu năng của code cache-friendly và code non-cache-friendly:

```
#include <stdio.h>  // For printf function
#include <stdlib.h> // For heap memory functions
#include <string.h> // For strcmp function
void fill(int* matrix, int rows, int columns) {
  int counter = 1;
  for (int i = 0; i < rows; i++) {
    for (int j = 0; j < columns; j++) {
      *(matrix + i * columns + j) = counter;
    }
    counter++;
  }
}
void print_matrix(int* matrix, int rows, int columns) {
  int counter = 1;
  printf("Matrix:\n");
  for (int i = 0; i < rows; i++) {
    for (int j = 0; j < columns; j++) {
      printf("%d ", *(matrix + i * columns + j));
    }
    printf("\n");
  }
}
void print_flat(int* matrix, int rows, int columns) {
  printf("Flat matrix: ");
  for (int i = 0; i < (rows * columns); i++) {
    printf("%d ", *(matrix + i));
  }
  printf("\n");
}
int friendly_sum(int* matrix, int rows, int columns) {
  int sum = 0;
  for (int i = 0; i < rows; i++) {
    for (int j = 0; j < columns; j++) {
      sum += *(matrix + i * columns + j);
    }
  }
  return sum;
}
int not_friendly_sum(int* matrix, int rows, int columns) {
  int sum = 0;
  for (int j = 0; j < columns; j++) {
    for (int i = 0; i < rows; i++) {
      sum += *(matrix + i * columns + j);
    }
  }
  return sum;
}
int main(int argc, char** argv) {
  if (argc < 4) {
    printf("Usage: %s [print|friendly-sum|not-friendly-sum] ");
    printf("[number-of-rows] [number-of-columns]\n", argv[0]);
    exit(1);
  }
  char* operation = argv[1];
  int rows = atol(argv[2]);
  int columns = atol(argv[3]);
  int* matrix = (int*)malloc(rows * columns * sizeof(int));
  fill(matrix, rows, columns);
  if (strcmp(operation, "print") == 0) {
    print_matrix(matrix, rows, columns);
    print_flat(matrix, rows, columns);
  }
  else if (strcmp(operation, "friendly-sum") == 0) {
    int sum = friendly_sum(matrix, rows, columns);
    printf("Friendly sum: %d\n", sum);
  }
  else if (strcmp(operation, "not-friendly-sum") == 0) {
    int sum = not_friendly_sum(matrix, rows, columns);
    printf("Not friendly sum: %d\n", sum);
  }
  else {
    printf("FATAL: Not supported operation!\n");
    exit(1);
  }
  free(matrix);
  return 0;
}
```

*Code Box 5-12 [ExtremeC_examples_chapter5_6.c]: Ví dụ 5.6 minh họa hiệu năng của code cache-friendly và code non-cache-friendly*

Chương trình trên tính và in tổng của mọi phần tử trong một ma trận, nhưng nó cũng làm nhiều hơn thế.

Người<a id="_idIndexMarker457"></a> dùng có thể truyền các tùy chọn cho chương trình này, vốn làm thay đổi hành vi của nó. Giả sử rằng chúng ta muốn in một ma trận 2 nhân 3 được khởi tạo bởi một thuật toán được viết trong hàm `fill`. Người dùng phải truyền tùy chọn `print` với số hàng và số cột mong muốn. Tiếp theo, bạn có thể thấy cách những tùy chọn này được truyền cho executable binary cuối cùng:

```
$ gcc ExtremeC_examples_chapter5_6.c -o ex5_6.out
$ ./ex5_6.out print 2 3
Matrix:
1 1 1
2 2 2
Flat matrix: 1 1 1 2 2 2
$
```

*Shell Box 5-21: Output của ví dụ 5.6 thể hiện một ma trận 2 nhân 3*

Output gồm hai bản in khác nhau cho ma trận. Bản thứ nhất là biểu diễn 2D của ma trận và bản thứ hai là biểu diễn *phẳng* (flat) của cùng ma trận đó. Như bạn có thể thấy, ma trận được lưu theo *thứ tự row-major* trong memory. Điều này có nghĩa là chúng ta lưu nó từng hàng một. Vì vậy, nếu một thứ gì đó từ một hàng được CPU fetch, rất có thể mọi phần tử trong hàng đó cũng được fetch. Do đó, sẽ tốt hơn nếu thực hiện phép tính tổng theo thứ tự row-major chứ không phải thứ tự *column-major*.

Nếu bạn nhìn lại code, bạn có thể thấy rằng phép tính tổng được thực hiện trong hàm `friendly_sum` là row-major, và phép tính tổng được thực hiện trong hàm `not_friendly_sum` là column-major. Tiếp theo, chúng ta có thể so sánh thời gian cần để thực hiện phép tính tổng của một ma trận có 20,000 hàng và 20,000 cột. Như bạn có thể thấy, sự khác biệt rất rõ ràng:

```
$ time ./ex5_6.out friendly-sum 20000 20000
Friendly sum: 1585447424
real   0m5.192s
user   0m3.142s
sys    0m1.765s
$ time ./ex5_6.out not-friendly-sum 20000 20000
Not friendly sum: 1585447424
real   0m15.372s
user   0m14.031s
sys    0m0.791s
$
```

*Shell Box 5-22: Minh họa sự khác biệt về thời gian giữa các thuật toán tính tổng ma trận column-major và row-major*

Sự khác biệt giữa các<a id="_idIndexMarker458"></a> thời gian đo được là khoảng 10 giây! Chương trình được biên dịch trên một máy macOS bằng compiler `clang`. Sự khác biệt này có nghĩa là cùng một logic, dùng cùng lượng memory, có thể mất lâu hơn nhiều – chỉ bằng cách chọn một thứ tự truy cập các phần tử ma trận khác! Ví dụ này cho thấy rõ tác động của code cache-friendly.

> **Lưu ý**:
>
> Tiện ích `time` có sẵn<a id="_idIndexMarker459"></a> trong mọi hệ điều hành Unix-like. Nó có thể được dùng để đo thời gian một chương trình cần để hoàn tất.

Trước khi tiếp tục với kỹ thuật tiếp theo, chúng ta nên nói thêm một chút về chi phí cấp phát và giải phóng.

<a id="_idParaDest-96"></a>

#### Chi phí cấp phát và giải phóng

Ở đây, chúng ta muốn nói cụ thể về chi phí của việc cấp phát và giải phóng memory Heap. Điều này có thể hơi bất ngờ nếu bạn nhận ra rằng các thao tác cấp phát và giải phóng memory Heap là time-and memory-consuming (tốn thời gian và memory) và thường đắt đỏ, đặc biệt khi <a id="_idIndexMarker460"></a>bạn cần cấp phát và giải phóng các khối memory Heap nhiều lần mỗi giây.

Không giống cấp phát Stack, vốn tương đối nhanh và bản thân việc cấp phát không đòi hỏi thêm memory, cấp phát Heap đòi hỏi tìm một khối memory trống có đủ kích thước, và việc này có thể tốn kém.

Có nhiều thuật toán được thiết kế cho việc cấp phát và giải phóng memory, và luôn có một tradeoff giữa các thao tác cấp phát và giải phóng. Nếu bạn muốn cấp phát nhanh, bạn phải tiêu thụ nhiều memory hơn như một phần của thuật toán cấp phát và ngược lại, nếu bạn muốn tiêu thụ ít memory hơn, bạn có thể chọn dành nhiều thời gian hơn với một cách cấp phát chậm hơn.

Có những memory allocator cho C khác với những allocator do thư viện chuẩn C mặc định cung cấp thông qua các hàm `malloc` và `free`. Một số memory allocator library này là `ptmalloc`, `tcmalloc`, `Haord` và `dlmalloc`.

Đi qua mọi allocator ở đây nằm ngoài phạm vi của chương này, nhưng sẽ là một thực hành tốt nếu bạn tự đi qua chúng và thử dùng chúng.

Giải pháp cho vấn đề âm thầm này là gì? Nó đơn giản: cấp phát và giải phóng ít thường xuyên hơn. Điều<a id="_idIndexMarker461"></a> này có vẻ bất khả thi trong một số chương trình được yêu cầu có tần suất cấp phát Heap cao. Những chương trình này thường cấp phát một khối memory Heap lớn và cố tự quản lý nó. Điều này giống như có thêm một lớp logic cấp phát và giải phóng khác (có lẽ đơn giản hơn các hiện thực của `malloc` và `free`) trên một khối memory Heap lớn.

Cũng có <a id="_idIndexMarker462"></a>một phương pháp khác, đó là dùng *memory pool*. Chúng tôi sẽ giải thích ngắn gọn kỹ thuật này trước khi đi đến cuối chương.

<a id="_idParaDest-97"></a>

#### Memory pool

Như chúng ta đã mô tả trong <a id="_idIndexMarker463"></a>phần trước, việc cấp phát và giải phóng memory là tốn kém. Dùng một pool gồm các khối memory Heap fixed-size được cấp phát trước là một cách hiệu quả để giảm số lần cấp phát và có được thêm hiệu năng. Mỗi khối trong pool thường có một định danh, có thể được lấy thông qua một API được thiết kế để quản lý pool. Ngoài ra, khối có thể được giải phóng sau này khi nó không còn cần thiết. Vì lượng memory được cấp phát gần như cố định, nó là một lựa chọn tuyệt vời cho các thuật toán muốn có hành vi tất định trong các môi trường memory-constrained.

Mô tả memory pool chi tiết hơn nằm ngoài phạm vi của cuốn sách này; có nhiều tài nguyên hữu ích về chủ đề này trên mạng nếu bạn muốn đọc thêm về nó.

<a id="_idParaDest-98"></a>

## Tóm tắt

Trong chương này, chúng ta chủ yếu đã trình bày các segment Stack và Heap và cách chúng nên được dùng. Sau đó, chúng ta đã thảo luận ngắn gọn về các môi trường memory-constrained và chúng ta đã thấy các kỹ thuật như caching và memory pool có thể tăng hiệu năng như thế nào.

Trong chương này:

- Chúng ta đã thảo luận về các công cụ và kỹ thuật được dùng để thăm dò cả hai segment Stack và Heap.
- Chúng ta đã giới thiệu debugger và chúng ta đã dùng `gdb` làm debugger chính để xử lý các vấn đề memory-related.
- Chúng ta đã thảo luận về memory profiler và chúng ta đã dùng `valgrind` để tìm các vấn đề memory như leakage hay dangling pointer xảy ra vào lúc runtime.
- Chúng ta đã so sánh vòng đời của một biến Stack và một khối Heap và chúng ta đã giải thích cách chúng ta nên đánh giá vòng đời của những khối memory như vậy.
- Chúng ta đã thấy rằng việc quản lý memory là tự động đối với các biến Stack, nhưng hoàn toàn thủ công với các khối Heap.
- Chúng ta đã đi qua những lỗi phổ biến xảy ra khi làm việc với các biến Stack.
- Chúng ta đã thảo luận về các môi trường bị ràng buộc và chúng ta đã thấy việc tinh chỉnh memory có thể được thực hiện như thế nào trong những môi trường này.
- Chúng ta đã thảo luận về các môi trường hiệu năng cao và những kỹ thuật nào có thể được dùng để có được thêm hiệu năng.

Bốn chương tiếp theo cùng nhau trình bày hướng đối tượng trong C. Thoạt nhìn điều này có vẻ không liên quan đến C, nhưng thực tế, đây là cách đúng để viết code object-oriented trong C. Trong những chương này, bạn sẽ được giới thiệu cách đúng đắn để thiết kế và giải quyết một vấn đề theo kiểu object-oriented, và bạn sẽ được hướng dẫn viết code C dễ đọc và đúng đắn.

Chương tiếp theo trình bày encapsulation và những điều cơ bản của lập trình object-oriented bằng cách cung cấp thảo luận lý thuyết cần thiết và các ví dụ để khám phá các chủ đề đã thảo luận.
