<a id="_idParaDest-61"></a>

# Chương 03: Object File

Chương này trình bày chi tiết các sản phẩm khác nhau mà một dự án C/C++ có thể có. Các sản phẩm khả dĩ bao gồm relocatable object file, executable object file, static library và shared object file. Tuy nhiên, relocatable object file được coi là sản phẩm tạm thời và chúng đóng vai trò nguyên liệu để làm ra các loại sản phẩm khác là sản phẩm cuối cùng.

Có vẻ như ngày nay trong C, việc thảo luận thêm về các loại object file khác nhau và cấu trúc bên trong của chúng là then chốt. Phần lớn các cuốn sách C chỉ nói về cú pháp C và bản thân ngôn ngữ; nhưng trong real-world, bạn cần kiến thức in-depth hơn để trở thành một lập trình viên C thành công.

Khi bạn tạo ra phần mềm, nó không chỉ là chuyện phát triển và ngôn ngữ lập trình. Thực tế, nó là toàn bộ quá trình: viết code, biên dịch, tối ưu, tạo ra các sản phẩm đúng, và các bước tiếp theo nữa, để chạy và bảo trì những sản phẩm đó trên các platform đích.

Bạn nên có hiểu biết về các bước trung gian này, đến mức bạn có thể giải quyết bất kỳ vấn đề nào có thể gặp phải. Điều này còn nghiêm trọng hơn đối với phát triển embedded, vì các architecture phần cứng và các instruction set có thể đầy thách thức và không điển hình.

Chương này được chia thành các phần sau:

1. **Application binary interface**: ở đây, trước tiên chúng ta sẽ nói về **Application Binary Interface** (**ABI**) và tầm quan trọng của nó.
2. **Các object file format**: trong phần này, chúng ta nói về các object file format khác nhau tồn tại ngày nay hoặc đã trở nên lỗi thời qua nhiều năm. Chúng ta cũng giới thiệu ELF như object file format được dùng nhiều nhất trong các hệ thống Unix-like.
3. **Relocatable object file**: ở đây chúng ta thảo luận về relocatable object file và những sản phẩm đầu tiên của một dự án C. Chúng ta nhìn vào bên trong các relocatable object file ELF để xem có thể tìm thấy gì ở đó.
4. **Executable object file**: như một phần của mục này, chúng ta nói về executable object file. Chúng ta cũng giải thích cách chúng được tạo ra từ một số relocatable object file. Chúng ta thảo luận về sự khác biệt giữa relocatable object file và executable object file ELF xét về cấu trúc bên trong của chúng.
5. **Static library**: trong phần này, chúng ta nói về static library và cách chúng ta có thể tạo ra chúng. Chúng ta cũng minh họa cách viết một chương trình và dùng các static library đã được build sẵn.

1. **Dynamic library**: ở đây chúng ta nói về shared object file. Chúng ta minh họa cách tạo chúng từ một số relocatable object file và cách dùng chúng trong một chương trình. Chúng ta cũng nói ngắn gọn về cấu trúc bên trong của một shared object file ELF.

Các thảo luận của chúng ta trong chương này chủ yếu xoay quanh các hệ thống Unix-like, nhưng chúng ta sẽ thảo luận một số khác biệt ở các hệ điều hành khác như Microsoft Windows.

> **Lưu ý**:
>
> Trước khi đọc chương này, bạn cần quen với những ý tưởng và bước cơ bản cần thiết để build một dự án C. Bạn cần biết translation unit là gì và việc link khác với việc biên dịch như thế nào. Hãy đọc chương trước trước khi tiếp tục với chương này.

Hãy bắt đầu chương bằng cách nói về ABI.

<a id="_idParaDest-62"></a>

## Application binary interface (ABI)

Như có thể bạn đã <a id="_idIndexMarker243"></a>biết, mọi library hay framework, bất kể công nghệ hay ngôn ngữ lập trình được dùng, đều phơi ra một tập chức năng nhất định, được biết đến là **Application Programming Interface** (**API**) của nó. Nếu một library được dự định để được dùng bởi một code khác, thì code sử dụng phải dùng API được cung cấp. Nói rõ ràng, không được dùng bất cứ thứ gì ngoài API để dùng một library vì đó là public interface của library và mọi thứ khác được coi là một hộp đen, do đó không thể được dùng.

Giờ giả sử sau một thời gian, API của library trải qua một số sửa đổi. Để code sử dụng tiếp tục dùng được các phiên bản mới hơn của library, code phải tự thích nghi với API mới; nếu không, nó sẽ không thể dùng library nữa. Code sử dụng có thể bám vào một phiên bản nhất định của library (có thể là một phiên bản cũ) và bỏ qua các phiên bản mới hơn, nhưng hãy giả định rằng có mong muốn nâng cấp lên phiên bản mới nhất của library.

Nói đơn giản, một API giống như một quy ước (hay tiêu chuẩn) được chấp nhận giữa hai thành phần phần mềm để phục vụ hay dùng lẫn nhau. Một ABI khá giống API, nhưng ở một mức khác. Trong khi API đảm bảo tính tương thích của hai thành phần phần mềm để tiếp tục hợp tác về chức năng, ABI đảm bảo rằng hai chương trình tương thích ở mức các instruction machine-level của chúng, cùng với các object file tương ứng của chúng.

Ví dụ, một chương trình không thể dùng một dynamic library hay static library có ABI khác. Có lẽ tệ hơn thế, một executable file (thực tế là một object file) không thể chạy trên một hệ thống<a id="_idIndexMarker244"></a> hỗ trợ một ABI khác với ABI mà executable file được build cho. Một số chức năng hệ thống thiết yếu và hiển nhiên, như *dynamic linking*, *nạp một executable* và *function calling convention*, phải được thực hiện chính xác theo một ABI đã được thống nhất.

Một ABI thường bao gồm những thứ sau:

- Instruction set của target architecture, bao gồm các instruction của bộ xử lý, memory layout, endianness, register, v.v.
- Các kiểu dữ liệu hiện có, kích thước của chúng và chính sách alignment.
- Function calling convention mô tả các hàm nên được gọi thế nào. Ví dụ, những chủ đề như cấu trúc của *stack frame* và thứ tự push các argument là một phần của nó.
- Định nghĩa các *system call* nên được gọi thế nào trong một hệ thống Unix-like.
- *Object file format* được dùng, mà chúng ta sẽ giải thích trong phần sau, cho các *relocatable, executable* và *shared object file*.
- Đối với các object file do một compiler C++ tạo ra, *name mangling* và layout của *virtual table* là một phần của ABI.

*System V ABI* là tiêu chuẩn ABI được dùng rộng rãi nhất trong số các hệ điều hành Unix-like như Linux và các hệ thống BSD<a id="_idIndexMarker245"></a>. **Executable and Linking Format** (**ELF**) là object file format chuẩn được dùng trong System V ABI.

> **Lưu ý**:
>
> Đường dẫn sau là System V ABI cho AMD 64-bit architectur[e: https://www.uclibc.org/docs/psABI-x86_64.](https://www.uclibc.org/docs/psABI-x86_64.pdf)pdf. Bạn có thể xem qua danh sách nội dung và thấy những lĩnh vực nó bao quát.

Trong phần sau, chúng ta sẽ thảo luận về các object file format, đặc biệt là ELF.

<a id="_idParaDest-63"></a>

## Các object file format

Như chúng ta đã giải thích trong chương trước, *Chương 2*, *Biên dịch và Liên kết (Compilation and Linking)*, trên một platform, object file <a id="_idIndexMarker246"></a>có định dạng cụ thể riêng của chúng để lưu các instruction machine-level. Lưu ý rằng đây là chuyện về cấu trúc của object file và điều này khác với việc mỗi architecture có instruction set riêng của nó. Như chúng ta biết từ phần thảo luận trước, hai biến thể này là những phần khác nhau của ABI trong một platform; object file format và instruction set của architecture.

Trong phần này, chúng ta sẽ xem ngắn gọn một số object file format được biết đến rộng rãi. Để bắt đầu, hãy xem<a id="_idIndexMarker247"></a> một số object file format được dùng trong các hệ điều hành khác nhau:

- **ELF** được dùng bởi Linux và nhiều hệ điều hành Unix-like khác
- **Mach-O** được dùng trong các hệ thống OS X (macOS và iOS)
- **PE** được dùng trong Microsoft Windows

Để đưa ra một chút lịch sử và bối cảnh về các object file format hiện tại và trong quá khứ, chúng ta có thể nói rằng mọi object file format tồn tại ngày nay đều là hậu duệ của object file format `a.out` cũ. Nó được thiết kế cho các phiên bản Unix đời đầu.

Thuật ngữ **a.out** là viết tắt của **assembler output**. Mặc dù định dạng file này ngày nay đã lỗi thời, cái <a id="_idIndexMarker248"></a>tên vẫn được dùng làm tên file mặc định cho các executable file do hầu hết các linker tạo ra. Bạn hẳn còn nhớ đã thấy `a.out` trong một số ví dụ ở chương đầu tiên của cuốn sách.

Tuy nhiên, định dạng `a.out`<a id="_idIndexMarker249"></a> sớm bị thay thế bởi **COFF** hay **Common Object File Format**. COFF là cơ sở cho ELF – định dạng object mà chúng ta dùng trong hầu hết các hệ thống Unix-like. Apple cũng thay `a.out` bằng Mach-O như một phần của OS/X. Windows<a id="_idIndexMarker250"></a> dùng định dạng file **PE** hay **Portable Execution** cho các object file của nó, định dạng này dựa trên COFF.

> **Lưu ý**:
>
> Có thể tìm thấy lịch sử sâu hơn về<a id="_idIndexMarker251"></a> các object file format ở đây: [https://en.wikipedia.org/wiki/COFF#History](https://en.wikipedia.org/wiki/COFF#History). Biết về lịch sử của một chủ đề cụ thể sẽ giúp bạn hiểu rõ hơn con đường tiến hóa của nó cũng như các đặc điểm hiện tại và quá khứ.

Như bạn có thể thấy, mọi object file format lớn ngày nay đều dựa trên object file format lịch sử `a.out`, rồi đến COFF, và theo nhiều cách có chung tổ tiên.

ELF là object file format chuẩn được dùng trong Linux và hầu hết các hệ điều hành Unix-like. Thực tế, ELF là object file format được dùng như một phần của System V ABI, được dùng rất nhiều trong hầu hết các hệ thống Unix. Ngày nay, nó là object file format được các hệ điều hành chấp nhận rộng rãi nhất.

ELF là định dạng binary file chuẩn cho các hệ điều hành bao gồm, nhưng không giới hạn ở:

- Linux
- FreeBSD
- NetBSD
- Solaris

Điều này có nghĩa là chừng nào architecture bên dưới chúng vẫn như nhau, một object file ELF được tạo ra cho một trong <a id="_idIndexMarker252"></a>những hệ điều hành này có thể chạy và được dùng trên những hệ điều hành khác. ELF, như mọi *file format* khác, có một cấu trúc mà chúng ta sẽ mô tả ngắn gọn trong các phần sắp tới.

> **Lưu ý**:
>
> Có thể tìm thấy thêm thông tin về<a id="_idIndexMarker253"></a> ELF và chi tiết của nó f[ound here: https://www.uclibc.org/docs/psABI](https://www.uclibc.org/docs/psABI-x86_64.pdf)-x86_64.pdf. Lưu ý rằng đường dẫn này chỉ tới System V ABI cho architecture AMD 64-bits (`amd64`).
>
> Bạn cũng có thể đọc<a id="_idIndexMarker254"></a> phiên bản HTML của System V ABI ở đây: [http://www.sco.com/developers/gabi/2003-12-17/ch4.intro.html](http://www.sco.com/developers/gabi/2003-12-17/ch4.intro.html).

Trong các phần sắp tới, chúng ta sẽ nói về các sản phẩm tạm thời và cuối cùng của một dự án C. Chúng ta bắt đầu với relocatable object file.

<a id="_idParaDest-64"></a>

## Relocatable object file

Trong phần này, chúng ta sẽ nói về<a id="_idIndexMarker255"></a> relocatable object file. Như chúng ta đã giải thích trong chương trước, những object file này là output của bước assemble trong pipeline biên dịch C. Những file này được coi là sản phẩm tạm thời của một dự án C, và chúng là nguyên liệu chính để tạo ra các sản phẩm tiếp theo và cuối cùng. Vì lý do này, sẽ hữu ích nếu xem xét chúng sâu hơn và xem chúng ta có thể tìm thấy gì trong một relocatable object file.

Trong một relocatable object file, chúng ta có thể tìm thấy các mục sau liên quan đến translation unit đã được biên dịch:

- Các instruction machine-level được tạo ra cho các hàm có trong translation unit (code).
- Giá trị của các biến global đã được khởi tạo được khai báo trong translation unit (data).
- *Symbol table* chứa mọi symbol được định nghĩa và được tham chiếu có trong translation unit.

Đây là những mục then chốt có thể được tìm thấy trong bất kỳ relocatable object file nào. Dĩ nhiên, cách chúng được ghép lại với nhau phụ thuộc vào object file format, nhưng dùng các công cụ phù hợp, bạn sẽ có thể trích xuất những mục này từ một relocatable object file. Chúng ta sẽ làm điều này cho một relocatable object file ELF ngay sau đây.

Nhưng trước khi đi sâu <a id="_idIndexMarker256"></a>vào ví dụ, hãy nói về lý do tại sao relocatable object file được đặt tên như vậy. Nói cách khác, rốt cuộc *relocatable* có nghĩa là gì? Lý do đến từ quá trình mà một linker thực hiện để ghép một số relocatable object file lại với nhau và tạo thành một object file lớn hơn – một executable object file hay một shared object file.

Chúng ta thảo luận những gì có thể được tìm thấy trong một executable file trong phần tiếp theo, nhưng lúc này, chúng ta nên biết rằng các mục chúng ta tìm thấy trong một executable object file là tổng của mọi mục có trong tất cả các relocatable object file thành phần. Hãy chỉ nói về các instruction machine-level.

Các instruction machine-level có trong một relocatable object file phải được đặt cạnh các instruction machine-level đến từ một relocatable object file khác. Điều này có nghĩa là các instruction phải dễ dàng *di chuyển được* (movable) hay *relocatable*. Để điều này xảy ra, các instruction không có address trong một relocatable object file, và chúng chỉ có được address sau bước link. Đây là lý do chính chúng ta gọi những object file này là relocatable. Để giải thích thêm về điều này, chúng ta cần thể hiện nó trong một ví dụ thực tế.

*Ví dụ 3.1* nói về hai source file, một chứa definition của hai hàm, `max` và `max_3`, và source file kia chứa hàm `main` dùng các hàm đã khai báo `max` và `max_3`. Tiếp theo, bạn có thể thấy nội dung của source file thứ nhất:

```
int max(int a, int b) {
  return a > b ? a : b;
}
int max_3(int a, int b, int c) {
  int temp = max(a, b);
  return c > temp ? c : temp;
}
```

*Code Box 3-1 [ExtremeC_examples_chapter3_1_funcs.c]: Một source file chứa hai definition hàm*

Và source file thứ hai trông như code box sau:

```
int max(int, int);
int max_3(int, int, int);
int a = 5;
int b = 10;
int main(int argc, char** argv) {
  int m1 = max(a, b);
  int m2 = max_3(5, 8, -1);
  return 0;
}
```

*Code Box 3-2 [ExtremeC_examples_chapter3_1.c]: Hàm main dùng các hàm đã được khai báo. Definition được đặt trong một source file riêng.*

Hãy tạo các relocatable object file cho các source file trên. Bằng cách này, chúng ta có thể điều tra nội dung và những gì chúng ta đã giải thích ở trên. Lưu ý rằng, vì chúng ta đang biên dịch những<a id="_idIndexMarker257"></a> source này trên một máy Linux, chúng ta kỳ vọng thấy các object file ELF làm kết quả:

```
$ gcc -c ExtremeC_examples_chapter3_1_funcs.c  -o funcs.o
$ gcc -c ExtremeC_examples_chapter3_1.c -o main.o
$
```

*Shell Box 3-1: Biên dịch các source file thành các relocatable object file tương ứng của chúng*

Cả `funcs.o` lẫn `main.o` đều là các relocatable object file ELF. Trong một object file ELF, các mục được mô tả là có trong một relocatable object file được đặt vào một số section. Để xem các section có trong các relocatable object file trên, chúng ta có thể dùng tiện ích `readelf` như sau:

```
$ readelf -hSl funcs.o
[7/7]
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              REL (Relocatable file)
  Machine:                           Advanced Micro Devices X86-64
...
  Number of section headers:         12
  Section header string table index: 11
Section Headers:
  [Nr] Name              Type             Address           Offset
       Size              EntSize          Flags  Link  Info  Align
  [ 0]                   NULL             0000000000000000  00000000
       0000000000000000  0000000000000000           0     0     0
  [ 1] .text             PROGBITS         0000000000000000  00000040
       0000000000000045  0000000000000000  AX       0     0     1
...
  [ 3] .data             PROGBITS         0000000000000000  00000085
       0000000000000000  0000000000000000  WA       0     0     1
  [ 4] .bss              NOBITS           0000000000000000  00000085
       0000000000000000  0000000000000000  WA       0     0     1
...
  [ 9] .symtab           SYMTAB           0000000000000000  00000110
       00000000000000f0  0000000000000018          10     8     8
  [10] .strtab           STRTAB           0000000000000000  00000200
       0000000000000030  0000000000000000           0     0     1
  [11] .shstrtab         STRTAB           0000000000000000  00000278
       0000000000000059  0000000000000000           0     0     1
...
$
```

*Shell Box 3-2: Nội dung ELF của object file funcs.o*

Như bạn có thể thấy trong shell box trên, relocatable object file có 11 section. Các section in đậm là những section mà chúng ta đã giới thiệu như các mục tồn tại trong một object file. Section `.text` chứa mọi instruction machine-level cho translation unit. Các section `.data` và `.bss` lần lượt chứa giá trị cho các biến global đã khởi tạo và số byte cần thiết cho các biến global chưa khởi tạo. Section `.symtab` chứa symbol table.

Lưu ý rằng các section <a id="_idIndexMarker258"></a>tồn tại trong cả hai object file trên là như nhau, nhưng nội dung của chúng khác nhau. Do đó, chúng ta không thể hiện các section cho relocatable object file kia.

Như chúng ta đã đề cập ở trên, một trong các section trong một object file ELF chứa symbol table. Trong chương trước, chúng ta đã có một thảo luận kỹ lưỡng về symbol table và các mục của nó. Chúng ta đã mô tả cách nó được linker dùng để tạo ra executable object file và shared object file. Ở đây, chúng ta muốn lưu ý bạn một điều về symbol table mà chúng ta đã không thảo luận trong chương trước. Điều này sẽ phù hợp với phần giải thích của chúng ta về lý do tại sao relocatable object file được đặt tên theo cách này.

Hãy dump symbol table cho `funcs.o`. Trong chương trước, chúng ta đã dùng `objdump` nhưng giờ, chúng ta sẽ dùng `readelf` để làm việc đó:

```
$ readelf -s funcs.o
Symbol table '.symtab' contains 10 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND
...
     6: 0000000000000000     0 SECTION LOCAL  DEFAULT    7
     7: 0000000000000000     0 SECTION LOCAL  DEFAULT    5
     8: 0000000000000000    22 FUNC    GLOBAL DEFAULT    1 max
     9: 0000000000000016    47 FUNC    GLOBAL DEFAULT    1 max_3
$
```

*Shell Box 3-3: Symbol table của object file funcs.o*

Như bạn có thể thấy trong cột `Value`, address được gán cho `max` là `0` và address được gán cho `max_3` là `22` (hexadecimal `16`). Điều này có nghĩa là các instruction liên quan đến những symbol này nằm kề nhau và address của chúng bắt đầu từ 0. Những symbol này, và các instruction machine-level tương ứng của chúng, đã sẵn sàng để được relocate tới những chỗ khác trong executable cuối cùng. Hãy xem symbol table của `main.o`:

```
$ readelf -s main.o
Symbol table '.symtab' contains 14 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND
...
     8: 0000000000000000     4 OBJECT  GLOBAL DEFAULT    3 a
     9: 0000000000000004     4 OBJECT  GLOBAL DEFAULT    3 b
    10: 0000000000000000    69 FUNC    GLOBAL DEFAULT    1 main
    11: 0000000000000000     0 NOTYPE  GLOBAL DEFAULT  UND _GLOBAL_OFFSET_TABLE_
    12: 0000000000000000     0 NOTYPE  GLOBAL DEFAULT  UND max
    13: 0000000000000000     0 NOTYPE  GLOBAL DEFAULT  UND max_3
$
```

*Shell Box 3-4: Symbol table của object file main.o*

Như bạn có thể thấy, các symbol gắn với các biến global `a` và `b`, cũng như symbol cho hàm `main` được đặt tại những address có vẻ không phải là address cuối cùng mà chúng nên được đặt tại đó. Đây là dấu hiệu của một relocatable object file. Như chúng ta đã nói ở trên, các symbol trong một relocatable object file không có address cuối cùng và tuyệt đối nào và address của chúng sẽ được xác định như một phần của bước link.

Trong phần sau, chúng ta tiếp tục tạo một executable file từ các relocatable object file trên. Bạn sẽ thấy rằng symbol table là khác.

<a id="_idParaDest-65"></a>

## Executable object file

Giờ là lúc nói về executable object file. Đến giờ bạn hẳn đã biết rằng executable object file là một trong những sản phẩm cuối cùng của một dự án C. Giống như<a id="_idIndexMarker260"></a> relocatable object file, chúng có cùng các mục<a id="_idIndexMarker261"></a> bên trong: các instruction machine-level, giá trị cho các biến global đã khởi tạo, và symbol table; tuy nhiên, cách sắp xếp có thể khác. Chúng ta có thể thể hiện điều này đối với các executable object file ELF vì sẽ dễ sinh ra chúng và nghiên cứu cấu trúc bên trong của chúng.

Để tạo ra một executable object file ELF, chúng ta tiếp tục với *ví dụ 3.1*. Trong phần trước, chúng ta đã sinh ra các relocatable object file cho hai source có trong ví dụ, và trong phần này, chúng ta sẽ link chúng để tạo thành một executable file.

Các lệnh sau làm việc đó cho bạn, như đã giải thích trong chương trước:

```
$ gcc funcs.o main.o -o ex3_1.out
$
```

*Shell Box 3-5: Link các relocatable object file đã được build trước đó trong ví dụ 3.1*

Trong phần trước, chúng ta đã nói về các section có mặt trong một object file ELF. Chúng ta nên nói rằng có nhiều section hơn trong một executable object file ELF, nhưng đi cùng với một số segment. Mọi executable object file ELF, và như bạn sẽ thấy ở phần sau của chương này, mọi shared object file ELF, đều có một số *segment* ngoài các section. Mỗi segment gồm một số section (không hoặc nhiều hơn), và các section được đặt vào segment dựa trên nội dung của chúng.

Ví dụ, mọi section chứa instruction machine-level đều đi vào cùng một segment. Bạn sẽ thấy trong *Chương 4*, *Cấu trúc memory của process (Process Memory Structure)*, rằng những segment này ánh xạ gọn gàng tới các *memory segment* tĩnh có trong memory layout của một process đang chạy.

Hãy xem nội dung của một executable file và gặp gỡ những segment này. Tương tự như với relocatable object file, chúng ta có thể dùng cùng một lệnh để hiển thị các section và các segment có trong một executable object file ELF.

```
$ readelf -hSl ex3_1.out
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
 Type:                              DYN (Shared object file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x4f0
  Start of program headers:          64 (bytes into file)
  Start of section headers:          6576 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         9
  Size of section headers:           64 (bytes)
  Number of section headers:         28
  Section header string table index: 27
Section Headers:
  [Nr] Name              Type             Address           Offset
       Size              EntSize          Flags  Link  Info  Align
  [ 0]                   NULL             0000000000000000  00000000
      0000000000000000  0000000000000000           0     0     0
  [ 1] .interp           PROGBITS         0000000000000238  00000238
       000000000000001c  0000000000000000   A       0     0     1
  [ 2] .note.ABI-tag     NOTE             0000000000000254  00000254
       0000000000000020  0000000000000000   A       0     0     4
  [ 3] .note.gnu.build-i NOTE             0000000000000274  00000274
       0000000000000024  0000000000000000   A       0     0     4
...
  [26] .strtab           STRTAB           0000000000000000  00001678
       0000000000000239  0000000000000000           0     0     1
  [27] .shstrtab         STRTAB           0000000000000000  000018b1
       00000000000000f9  0000000000000000           0     0     1
Key to Flags:
  W (write), A (alloc), X (execute), M (merge), S (strings), I (info),
  L (link order), O (extra OS processing required), G (group), T (TLS),
  C (compressed), x (unknown), o (OS specific), E (exclude),
  l (large), p (processor specific)
Program Headers:
  Type           Offset             VirtAddr           PhysAddr
                 FileSiz            MemSiz              Flags  Align
  PHDR           0x0000000000000040 0x0000000000000040 0x0000000000000040
                 0x00000000000001f8 0x00000000000001f8  R      0x8
  INTERP         0x0000000000000238 0x0000000000000238 0x0000000000000238
                 0x000000000000001c 0x000000000000001c  R      0x1
      [Requesting program interpreter: /lib64/ld-linux-x86-64.so.2]
...
  GNU_EH_FRAME   0x0000000000000714 0x0000000000000714 0x0000000000000714
                 0x000000000000004c 0x000000000000004c  R      0x4
  GNU_STACK      0x0000000000000000 0x0000000000000000 0x0000000000000000
                 0x0000000000000000 0x0000000000000000  RW     0x10
  GNU_RELRO      0x0000000000000df0 0x0000000000200df0 0x0000000000200df0
                 0x0000000000000210 0x0000000000000210  R      0x1
Section to Segment mapping:
  Segment Sections...
   00
 01     .interp
 02     .interp .note.ABI-tag .note.gnu.build-id .gnu.hash .dynsym .dynstr .gnu.version .gnu.version_r .rela.dyn .init .plt .plt.got .text .fini .rodata .eh_frame_hdr .eh_frame
 03     .init_array .fini_array .dynamic .got .data .bss
 04     .dynamic
   05     .note.ABI-tag .note.gnu.build-id
   06     .eh_frame_hdr
   07
   08     .init_array .fini_array .dynamic .got
$
```

*Shell Box 3-6: Nội dung ELF của executable object file ex3_1.out*

Có nhiều ghi chú về <a id="_idIndexMarker262"></a>output trên:

- Chúng ta có thể thấy rằng kiểu object file xét từ góc nhìn ELF là một shared object file. Nói cách khác, trong ELF, một executable object file là một shared object file có một số segment cụ thể như `INTERP`. Segment này (thực ra là section `.interp` được segment này tham chiếu tới) được chương trình loader dùng để nạp và thực thi executable object file.
- Chúng tôi đã in đậm bốn segment. Segment thứ nhất chỉ segment `INTERP` đã được giải thích ở gạch đầu dòng trước. Segment thứ hai là segment `TEXT`. Nó chứa mọi section có instruction machine-level. Segment thứ ba là segment `DATA` chứa mọi giá trị cần được dùng để khởi tạo các biến global và các cấu trúc ban đầu khác. Segment thứ tư chỉ section<a id="_idIndexMarker263"></a> nơi có thể tìm thấy thông tin liên quan đến *dynamic linking*. Chẳng hạn, các shared object file cần được nạp như một phần của việc thực thi.
- Như bạn thấy, chúng ta có nhiều section hơn so với một relocatable shared object, có lẽ được lấp đầy bằng dữ liệu cần thiết để nạp và thực thi object file.

Như chúng ta đã giải thích trong phần trước, các symbol có trong symbol table của một relocatable object file không có address tuyệt đối và xác định nào. Đó là vì các section chứa instruction machine-level chưa được link.

Theo một nghĩa sâu hơn, việc link một số relocatable object file thực ra là thu thập mọi section tương tự từ các relocatable object file được cho và ghép chúng lại với nhau để tạo thành một section lớn hơn, và cuối cùng đặt<a id="_idIndexMarker264"></a> section thu được vào executable output hay shared object file. Do đó, chỉ sau bước này, các symbol mới có thể được hoàn tất và có được các address sẽ không thay đổi. Trong executable object file, các address là tuyệt đối, còn trong shared object file, các address tương đối là tuyệt đối. Chúng ta sẽ thảo luận thêm về điều này trong phần dành cho dynamic library.

Hãy xem symbol table có trong executable file `ex3_1.out`. Lưu ý rằng symbol table có rất nhiều mục và đó là lý do output không được thể hiện đầy đủ trong shell box sau:

```
$ readelf -s ex3_1.out
Symbol table '.dynsym' contains 6 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND
...
     5: 0000000000000000     0 FUNC    WEAK   DEFAULT  UND __cxa_finalize@GLIBC_2.2.5 (2)
Symbol table '.symtab' contains 66 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND
...
    45: 0000000000201000     0 NOTYPE  WEAK   DEFAULT   22 data_start
    46: 0000000000000610    47 FUNC    GLOBAL DEFAULT   13 max_3
    47: 0000000000201014     4 OBJECT  GLOBAL DEFAULT   22 b
    48: 0000000000201018     0 NOTYPE  GLOBAL DEFAULT   22 _edata
    49: 0000000000000704     0 FUNC    GLOBAL DEFAULT   14 _fini
    50: 00000000000005fa    22 FUNC    GLOBAL DEFAULT   13 max
    51: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND __libc_start_main@@GLIBC_
...
    64: 0000000000000000     0 FUNC    WEAK   DEFAULT  UND __cxa_finalize@@GLIBC_2.2
    65: 00000000000004b8     0 FUNC    GLOBAL DEFAULT   10 _init
$
```

*Shell Box 3-7: Các symbol table có trong executable object file ex3_1.out*

Như bạn thấy trong shell box trên, chúng ta có hai symbol table khác nhau trong một executable object file. Cái thứ nhất, `.dynsym`, chứa các symbol cần được phân giải khi nạp <a id="_idIndexMarker265"></a>executable, còn symbol table thứ hai, `.symtab`, chứa mọi symbol đã được phân giải cùng với các unresolved symbol được mang sang từ dynamic symbol table. Nói cách khác, symbol table cũng chứa các unresolved symbol từ dynamic table.

Như bạn thấy, các symbol đã được phân giải trong symbol table có các address tuyệt đối tương ứng mà chúng có được sau bước link. Các address cho các symbol `max` và `max_3` được thể hiện in đậm.

Trong phần này, chúng ta đã xem ngắn gọn executable object file. Trong phần tiếp theo, chúng ta sẽ nói về static library.

<a id="_idParaDest-66"></a>

## Static library

Như chúng ta đã giải thích ở trên, static library là một trong những sản phẩm khả dĩ của một dự án C. Trong phần này, chúng ta<a id="_idIndexMarker266"></a> sẽ nói về static library và cách chúng được tạo ra và được dùng. Sau đó chúng ta sẽ tiếp tục thảo luận này bằng cách giới thiệu dynamic library trong phần tiếp theo.

Một static library đơn giản là một Unix archive được tạo ra từ các relocatable object file. Một library như vậy thường được link cùng với các object file khác để tạo thành một executable object file.

Lưu ý rằng bản thân một static library không được coi là một object file, mà nó là một vật chứa cho chúng. Nói cách khác, static library không phải là file ELF trong các hệ thống Linux, cũng không phải là file Mach-O trong các hệ thống macOS. Chúng đơn giản là các file lưu trữ được tạo ra bởi tiện ích `ar` của Unix.

Khi một linker sắp dùng một static library trong bước link, trước tiên nó cố trích xuất các relocatable object file từ đó, rồi nó bắt đầu tìm kiếm và phân giải các undefined symbol có thể được tìm thấy trong một số object file đó.

Giờ là lúc tạo một static library cho một dự án có nhiều source file. Bước đầu tiên là tạo một số relocatable object file. Một khi bạn đã biên dịch mọi source file trong một dự án C/C++, bạn có thể dùng công cụ lưu trữ của Unix, `ar`, để tạo file archive của static library.

Trong các hệ thống Unix, static library thường được đặt tên theo một quy ước được chấp nhận và dùng rộng rãi. Tên bắt đầu bằng `lib`, và nó kết thúc bằng phần mở rộng `.a`. Điều này có thể khác ở các hệ điều hành khác; chẳng hạn, trong Microsoft Windows, static library mang phần mở rộng `.lib`.

Giả sử rằng, trong một<a id="_idIndexMarker267"></a> dự án C tưởng tượng, bạn có các source file `aa.c`, `bb.c`, cho đến tận `zz.c`. Để tạo ra các relocatable object file, bạn sẽ cần biên dịch các source file theo cách tương tự như cách chúng ta dùng các lệnh tiếp theo. Lưu ý rằng quá trình biên dịch đã được giải thích kỹ lưỡng trong chương trước:

```
$ gcc -c aa.c -o aa.o
$ gcc -c bb.c -o bb.o
.
.
.
$ gcc -c zz.c -o zz.o
$
```

*Shell Box 3-8: Biên dịch một số source thành các relocatable object file tương ứng của chúng*

Bằng cách chạy các lệnh trên, chúng ta sẽ có mọi relocatable object file cần thiết. Lưu ý rằng việc này có thể mất một lượng thời gian đáng kể nếu dự án lớn và chứa hàng nghìn source file. Dĩ nhiên, có một máy build mạnh, cùng với việc chạy các tác vụ biên dịch song song, có thể giảm đáng kể thời gian build.

Khi đến lúc tạo một file static library, chúng ta chỉ cần chạy lệnh sau:

```
$ ar crs libexample.a aa.o bb.o ... zz.o
$
```

*Shell Box 3-9: Công thức chung để tạo một static library từ một số relocatable object file*

Kết quả là `libexample.a` được tạo ra, chứa tất cả các relocatable object file trên dưới dạng một archive duy nhất. Giải thích tùy chọn `crs` được truyền cho `ar` sẽ nằm ngoài phạm vi của chương này, nhưng trong đường dẫn sau, bạn có thể đọc [about its meaning: https://stackoverflow.com/questions/29714300/what-does-th](https://stackoverflow.com/questions/29714300/what-does-the-rcs-option-in-ar-do)e-rcs-option-in-ar-do (về ý nghĩa của nó).

> **Lưu ý**:
>
> Lệnh `ar` không nhất thiết tạo ra một file archive *nén*. Nó chỉ được dùng để ghép các file lại với nhau để tạo thành một file duy nhất là archive của tất cả những file đó. Công cụ `ar` là general purpose, và bạn có thể dùng nó để ghép bất kỳ loại file nào lại với nhau và tạo archive của riêng mình từ chúng.

Giờ chúng ta đã biết cách tạo một static library, chúng ta sẽ tạo một static library thật như một phần của *ví dụ 3.2*.

Trước tiên, chúng ta sẽ giả định rằng *ví dụ 3.2* là một dự án C về hình học. Ví dụ gồm ba source file và một header file. Mục đích của library là định nghĩa một tập hợp<a id="_idIndexMarker268"></a> các hàm liên quan đến hình học có thể được dùng trong các ứng dụng khác.

Để làm điều này, chúng ta cần tạo một file static library tên là `libgeometry.a` từ ba source file. Bằng cách có static library, chúng ta có thể dùng header file và file static library cùng nhau để viết một chương trình khác sẽ dùng các hàm hình học được định nghĩa trong library.

Các code box sau là nội dung của các source file và header file. File thứ nhất, `ExtremeC_examples_chapter3_2_geometry.h`, chứa mọi declaration cần được export từ library hình học của chúng ta. Những declaration này sẽ được dùng bởi các ứng dụng tương lai sẽ dùng library.

> **Lưu ý**:
>
> Mọi lệnh được cung cấp để tạo object file đều được chạy và kiểm thử trên Linux. Có thể cần một số sửa đổi nếu bạn định thực thi chúng trên một hệ điều hành khác.

Chúng ta cần lưu ý rằng các ứng dụng tương lai *phải* chỉ phụ thuộc vào các declaration và hoàn toàn không phụ thuộc vào các definition. Do đó, trước tiên, hãy xem các declaration của library hình học:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_3_2_H
#define EXTREME_C_EXAMPLES_CHAPTER_3_2_H
#define PI 3.14159265359
typedef struct {
  double x;
  double y;
} cartesian_pos_2d_t;
typedef struct {
  double length;
  // in degrees
  double theta;
} polar_pos_2d_t;
typedef struct {
  double x;
  double y;
  double z;
} cartesian_pos_3d_t;
typedef struct {
  double length;
  // in degrees
  double theta;
  // in degrees
  double phi;
} polar_pos_3d_t;
double to_radian(double deg);
double to_degree(double rad);
double cos_deg(double deg);
double acos_deg(double deg);
double sin_deg(double deg);
double asin_deg(double deg);
cartesian_pos_2d_t convert_to_2d_cartesian_pos(
        const polar_pos_2d_t* polar_pos);
polar_pos_2d_t convert_to_2d_polar_pos(
        const cartesian_pos_2d_t* cartesian_pos);
cartesian_pos_3d_t convert_to_3d_cartesian_pos(
        const polar_pos_3d_t* polar_pos);
polar_pos_3d_t convert_to_3d_polar_pos(
        const cartesian_pos_3d_t* cartesian_pos);
#endif
```

*Code Box 3-3 [ExtremeC_examples_chapter3_2_geometry.h]: Header file của ví dụ 3.2*

File thứ hai, là một source file, chứa definition của các hàm lượng giác, sáu<a id="_idIndexMarker269"></a> hàm đầu tiên được khai báo trong header file trên:

```
#include <math.h>
// We need to include the header file since
// we want to use the macro PI
#include "ExtremeC_examples_chapter3_2_geometry.h"
double to_radian(double deg) {
  return (PI * deg) / 180;
}
double to_degree(double rad) {
  return (180 * rad) / PI;
}
double cos_deg(double deg) {
  return cos(to_radian(deg));
}
double acos_deg(double deg) {
  return acos(to_radian(deg));
}
double sin_deg(double deg) {
  return sin(to_radian(deg));
}
double asin_deg(double deg) {
  return asin(to_radian(deg));
}
```

*Code Box 3-4 [ExtremeC_examples_chapter3_2_trigon.c]: Source file chứa definition của các hàm lượng giác*

Lưu ý rằng các source không cần include header file trừ khi chúng sẽ dùng một declaration như `PI` hay `to_degree`, được khai báo trong header file.

File thứ ba, lại là một source file, chứa definition của mọi hàm hình học 2D:

```
#include <math.h>
// We need to include the header file since we want
// to use the types polar_pos_2d_t, cartesian_pos_2d_t,
// etc and the trigonometry functions implemented in
// another source file.
#include "ExtremeC_examples_chapter3_2_geometry.h"
cartesian_pos_2d_t convert_to_2d_cartesian_pos(
        const polar_pos_2d_t* polar_pos) {
  cartesian_pos_2d_t result;
  result.x = polar_pos->length * cos_deg(polar_pos->theta);
  result.y = polar_pos->length * sin_deg(polar_pos->theta);
  return result;
}
polar_pos_2d_t convert_to_2d_polar_pos(
        const cartesian_pos_2d_t* cartesian_pos) {
  polar_pos_2d_t result;
  result.length = sqrt(cartesian_pos->x * cartesian_pos->x +
    cartesian_pos->y * cartesian_pos->y);
  result.theta =
      to_degree(atan(cartesian_pos->y / cartesian_pos->x));
  return result;
}
```

*Code Box 3-5 [ExtremeC_examples_chapter3_2_2d.c]: Source file chứa definition của các hàm 2D*

Và cuối cùng, file thứ tư chứa definition của các hàm hình học 3D:

```
#include <math.h>
// We need to include the header file since we want to
// use the types polar_pos_3d_t, cartesian_pos_3d_t,
// etc and the trigonometry functions implemented in
// another source file.
#include "ExtremeC_examples_chapter3_2_geometry.h"
cartesian_pos_3d_t convert_to_3d_cartesian_pos(
        const polar_pos_3d_t* polar_pos) {
  cartesian_pos_3d_t result;
  result.x = polar_pos->length *
      sin_deg(polar_pos->theta) * cos_deg(polar_pos->phi);
  result.y = polar_pos->length *
      sin_deg(polar_pos->theta) * sin_deg(polar_pos->phi);
  result.z = polar_pos->length * cos_deg(polar_pos->theta);
  return result;
}
polar_pos_3d_t convert_to_3d_polar_pos(
        const cartesian_pos_3d_t* cartesian_pos) {
  polar_pos_3d_t result;
  result.length = sqrt(cartesian_pos->x * cartesian_pos->x +
    cartesian_pos->y * cartesian_pos->y +
    cartesian_pos->z * cartesian_pos->z);
  result.theta =
      to_degree(acos(cartesian_pos->z / result.length));
  result.phi =
      to_degree(atan(cartesian_pos->y / cartesian_pos->x));
  return result;
}
```

*Code Box 3-6 [ExtremeC_examples_chapter3_2_3d.c]: Source file chứa definition của các hàm 3D*

Giờ chúng ta sẽ tạo file static library. Để làm điều này, trước tiên chúng ta cần biên dịch các source trên thành các relocatable object file tương ứng của chúng. Bạn cần lưu ý rằng chúng ta không thể link những object file này để tạo một executable file vì không có hàm `main` nào trong bất kỳ <a id="_idIndexMarker271"></a>source file nào ở trên. Do đó, chúng ta có thể hoặc giữ chúng là relocatable object file hoặc lưu trữ chúng để tạo thành một static library. Chúng ta còn một lựa chọn khác là tạo một shared object file từ chúng, nhưng chúng ta sẽ chờ đến phần tiếp theo để xem điều này.

Trong phần này, chúng ta đã chọn lưu trữ chúng để tạo một file static library. Các lệnh sau sẽ thực hiện việc biên dịch trên một hệ thống Linux:

```
$ gcc -c ExtremeC_examples_chapter3_2_trigon.c -o trigon.o
$ gcc -c ExtremeC_examples_chapter3_2_2d.c -o 2d.o
$ gcc -c ExtremeC_examples_chapter3_2_3d.c -o 3d.o
$
```

*Shell Box 3-10: Biên dịch các source file thành các relocatable object file tương ứng của chúng*

Khi đến lúc lưu trữ các object file này vào một file static library, chúng ta cần chạy lệnh sau:

```
$ ar crs libgeometry.a trigon.o 2d.o 3d.o
$ mkdir -p /opt/geometry
$ mv libgeometry.a /opt/geometry
$
```

*Shell Box 3-11: Tạo file static library từ các relocatable object file*

Như chúng ta có thể thấy, file `libgeometry.a` đã được tạo ra. Như bạn thấy, chúng ta đã chuyển file library tới thư mục `/opt/geometry` để bất kỳ chương trình nào khác cũng dễ định vị được nó. Một lần nữa, dùng lệnh `ar`, và thông qua<a id="_idIndexMarker272"></a> việc truyền tùy chọn `t`, chúng ta có thể thấy nội dung của file archive:

```
$ ar t /opt/geometry/libgeometry.a
trigon.o
2d.o
3d.o
$
```

*Shell Box 3-12: Liệt kê nội dung của file static library*

Như đã rõ từ shell box trên, file static library chứa ba relocatable object file như chúng ta đã định. Bước tiếp theo là dùng file static library.

Giờ chúng ta đã tạo một static library cho ví dụ hình học của mình, *ví dụ 3.2*, chúng ta sẽ dùng nó trong một ứng dụng mới. Khi dùng một library C, chúng ta cần có quyền truy cập vào các declaration được library phơi ra cùng với file static library của nó. Các declaration được coi là *public interface* của library, hay thông dụng hơn, là API của library.

Chúng ta cần các declaration ở giai đoạn biên dịch, khi compiler cần biết về sự tồn tại của các kiểu, function signature, v.v. Header file phục vụ mục đích này. Các chi tiết khác như kích thước kiểu và address hàm được cần đến ở các giai đoạn sau; link và nạp.

Như chúng ta đã nói ở trên, chúng ta thường thấy một C API (một API được một library C phơi ra) dưới dạng một nhóm header file. Do đó, header file từ *ví dụ 3.2*, và file static library đã tạo `libgeometry.a`, là đủ để chúng ta viết một chương trình mới dùng library hình học của mình.

Khi đến lúc dùng static library, chúng ta cần viết một source file mới include API của library và dùng các hàm của nó. Chúng ta viết code mới như một ví dụ mới, *ví dụ 3.3*. Code sau là source mà chúng ta đã viết cho *ví dụ 3.3*:

```
#include <stdio.h>
#include "ExtremeC_examples_chapter3_2_geometry.h"
int main(int argc, char** argv) {
  cartesian_pos_2d_t cartesian_pos;
  cartesian_pos.x = 100;
  cartesian_pos.y = 200;
  polar_pos_2d_t polar_pos =
      convert_to_2d_polar_pos(&cartesian_pos);
  printf("Polar Position: Length: %f, Theta: %f (deg)\n",
    polar_pos.length, polar_pos.theta);
  return 0;
}
```

*Code Box 3-7 [ExtremeC_examples_chapter3_3.c]: Hàm main kiểm thử một số hàm hình học*

Như bạn có thể thấy, *ví dụ 3.3* đã include header file từ *ví dụ 3.2*. Nó làm điều này vì nó cần các<a id="_idIndexMarker273"></a> declaration của các hàm mà nó sẽ dùng.

Giờ chúng ta cần biên dịch source file trên để tạo relocatable object file tương ứng của nó trong một hệ thống Linux:

```
$ gcc -c ExtremeC_examples_chapter3_3.c -o main.o
$
```

*Shell Box 3-13: Biên dịch ví dụ 3.3*

Sau khi làm xong việc đó, chúng ta cần link nó với static library mà chúng ta đã tạo cho *ví dụ 3.2*. Trong trường hợp này, chúng ta giả định rằng file `libgeometry.a` nằm trong thư mục `/opt/geometry`, như chúng ta đã có trong *Shell Box 3-11*. Lệnh sau sẽ hoàn tất việc build bằng cách thực hiện bước link và tạo executable object file *ex3_3.out*:

```
$ gcc main.o -L/opt/geometry -lgeometry -lm -o ex3_3.out
$
```

*Shell Box 3-14: Link với static library đã được tạo như một phần của ví dụ 3.2*

Để giải thích lệnh trên, chúng ta sẽ giải thích từng tùy chọn được truyền một cách riêng biệt:

- `-L/opt/geometry` bảo `gcc` coi thư mục `/opt/geometry` là một trong các vị trí khác nhau nơi có thể tìm thấy static library và shared library. Có các đường dẫn well-known như `/usr/lib` hay `/usr/local/lib` mà linker tìm kiếm library file trong đó theo mặc định. Nếu bạn không chỉ định tùy chọn `-L`, linker chỉ tìm kiếm trong các đường dẫn mặc định của nó.
- `-lgeometry` bảo `gcc` tìm file `libgeometry.a` hoặc `libgeometry.so`. Một file kết thúc bằng `.so` là một shared object file, mà chúng ta giải thích trong phần tiếp theo. Hãy chú ý quy ước được dùng. Chẳng hạn, nếu bạn truyền tùy chọn `-lxyz`, linker sẽ tìm file `libxyz.a` hoặc `libxyz.so` trong các thư mục mặc định và được chỉ định. Nếu không tìm thấy file, linker dừng lại và sinh ra một lỗi.
- `-lm` bảo `gcc` tìm một library khác tên là `libm.a` hoặc `libm.so`. Library này giữ definition của các hàm toán học trong *glibc*. Chúng ta cần nó cho các hàm `cos`, `sin` và `acos`. Lưu ý rằng chúng ta đang build *ví dụ 3.3* trên một máy Linux, máy này dùng *glibc* làm hiện thực library C mặc định của nó. Trong macOS và có thể một số hệ thống Unix-like khác, bạn không cần chỉ định tùy chọn này.
- `-o ex3_3.out` bảo `gcc` rằng executable file đầu ra nên được đặt tên là `ex3_3.out`.

Sau khi chạy lệnh trên, nếu mọi thứ suôn sẻ, bạn sẽ có một file binary executable chứa mọi relocatable object file có trong static library `libgeometry.a` cộng với `main.o`.

Lưu ý rằng sẽ không có bất kỳ sự phụ thuộc nào vào sự tồn tại của file static library sau khi link, vì mọi thứ đều được *nhúng* (embedded) bên trong chính executable file. Nói cách khác, executable file cuối cùng có thể chạy một mình mà không cần static library có mặt.

Tuy nhiên, các executable file được tạo ra từ việc link nhiều static library thường có kích thước khổng lồ. Càng nhiều static library và càng nhiều relocatable object file bên trong chúng, kích thước của executable cuối cùng càng lớn. Đôi khi nó có thể lên tới vài trăm megabyte hay thậm chí vài gigabyte.

Đó là một trade-off giữa kích thước của binary và các phụ thuộc mà nó có thể có. Bạn có thể có một binary nhỏ hơn, nhưng bằng cách dùng shared library. Điều đó có nghĩa là binary cuối cùng không hoàn chỉnh và không thể chạy nếu các shared library bên ngoài không tồn tại hoặc không thể được tìm thấy. Chúng ta sẽ nói thêm<a id="_idIndexMarker275"></a> về điều này trong các phần sắp tới.

Trong phần này, chúng ta đã mô tả static library là gì và chúng nên được tạo ra và được dùng thế nào. Chúng ta cũng đã minh họa cách một chương trình khác có thể dùng API được phơi ra và được link với một static library có sẵn. Trong phần sau, chúng ta sẽ nói về dynamic library và cách tạo một shared object file (dynamic library) từ các source trong *ví dụ 3.2*, thay vì dùng một static library.

<a id="_idParaDest-67"></a>

## Dynamic library

Dynamic library, hay shared library, là một cách khác để tạo ra library để tái sử dụng. Như tên gọi của chúng ngụ ý, không giống<a id="_idIndexMarker276"></a> static library, dynamic library không phải là một phần của chính executable cuối cùng. Thay vào đó, chúng phải được nạp và mang vào trong khi nạp một process để thực thi.

Vì static library là một phần của executable, linker đặt mọi thứ có trong các relocatable file được cho vào executable file cuối cùng. Nói cách khác, linker phát hiện các undefined symbol, và các definition cần thiết, và cố tìm chúng trong các relocatable object file được cho, rồi đặt tất cả chúng vào executable file đầu ra.

Sản phẩm cuối cùng chỉ được tạo ra khi mọi undefined symbol đều được tìm thấy. Từ một góc nhìn độc đáo, chúng ta phát hiện mọi phụ thuộc và phân giải chúng vào lúc link. Đối với dynamic library, có thể có các undefined symbol không được phân giải vào lúc link. Những symbol này được tìm kiếm khi sản phẩm executable sắp được nạp và bắt đầu thực thi.

Nói cách khác, cần một loại bước link khác khi bạn có các undefined dynamic symbol. Một *dynamic linker*, hay đơn giản là *loader*, thường làm việc link trong khi nạp một executable file và chuẩn bị nó để chạy như một process.

Vì các undefined dynamic symbol không được tìm thấy trong executable file, chúng phải được tìm thấy ở chỗ khác. Những symbol này phải được nạp từ các shared object file. Những file này là file chị em của các file static library. Trong khi các file static library có phần mở rộng `.a` trong tên, các shared object file mang phần mở rộng `.so` trong hầu hết các hệ thống Unix-like. Trong macOS, chúng có phần mở rộng `.dylib`.

Khi nạp một process và sắp khởi chạy nó, một shared object file sẽ được nạp và ánh xạ tới một vùng memory mà process có thể truy cập. Thủ tục này được thực hiện bởi một dynamic linker (hay loader), thành phần nạp và thực thi một executable file.

Như chúng ta đã nói trong phần dành cho executable object file, cả executable object file lẫn shared object file ELF đều có các segment trong cấu trúc ELF của chúng. Mỗi segment có không hoặc nhiều section bên trong. Có hai khác biệt chính giữa một executable object file ELF và một shared object file ELF. Thứ nhất, các symbol có các address tuyệt đối tương đối cho phép chúng được nạp như một phần của nhiều process cùng một lúc.

Điều này có nghĩa là mặc dù address của mỗi instruction khác nhau trong mỗi process, khoảng cách giữa hai instruction vẫn cố định. Nói cách khác, các address được cố định tương đối so với một offset. Đó là vì các relocatable object file là *position independent*. Chúng ta sẽ nói thêm về điều này trong phần cuối cùng của chương này.

Ví dụ, nếu hai<a id="_idIndexMarker277"></a> instruction nằm tại các address 100 và 200 trong một process, trong một process khác chúng có thể ở 140 và 240, và trong một process khác nữa chúng có thể ở 323 và 423. Các address liên quan là tuyệt đối, nhưng các address thực sự có thể thay đổi. Hai instruction này sẽ luôn cách nhau 100 address.

Khác biệt thứ hai là một số segment liên quan đến việc nạp một executable object file ELF không có mặt trong shared object file. Điều này trên thực tế có nghĩa là shared object file không thể được thực thi.

Trước khi đưa ra thêm chi tiết về cách một shared object được truy cập từ các process khác nhau, chúng ta cần thể hiện một ví dụ về cách chúng được tạo ra và được dùng. Do đó, chúng ta sẽ tạo dynamic library cho cùng library hình học, *ví dụ 3.2*, mà chúng ta đã làm việc trong phần trước.

Trong phần trước, chúng ta đã tạo một static library cho library hình học. Trong phần này, chúng ta muốn biên dịch lại các source để tạo một shared object file từ chúng. Các lệnh sau cho bạn thấy cách biên dịch ba source thành các relocatable object file tương ứng của chúng, chỉ với một khác biệt so với những gì chúng ta đã làm cho *ví dụ 3.2*. Trong các lệnh sau, hãy chú ý tùy chọn `-fPIC` được truyền cho `gcc`:

```
$ gcc -c ExtremeC_examples_chapter3_2_2d.c -fPIC -o 2d.o
$ gcc -c ExtremeC_examples_chapter3_2_3d.c -fPIC -o 3d.o
$ gcc -c ExtremeC_examples_chapter3_2_trigon.c -fPIC -o trigon.o
$
```

*Shell Box 3-15: Biên dịch các source của ví dụ 3.2 thành các relocatable object file position-independent tương ứng*

Nhìn vào các lệnh, bạn có thể thấy rằng chúng ta đã truyền thêm một tùy chọn,`-fPIC`, cho `gcc` trong khi biên dịch các source. Tùy chọn này là *bắt buộc* nếu bạn định tạo một shared object file từ một số <a id="_idIndexMarker278"></a>relocatable object file. **PIC** là viết tắt của **position independent code**. Như chúng ta đã giải thích ở trên, nếu một relocatable object file là position independent, điều đó đơn giản có nghĩa là các instruction bên trong nó không có address cố định. Thay vào đó, chúng có address tương đối; do đó chúng có thể có được các address khác nhau trong các process khác nhau. Đây là một yêu cầu vì cách chúng ta dùng shared object file.

Không có gì đảm bảo rằng <a id="_idIndexMarker279"></a>chương trình loader sẽ nạp một shared object file tại cùng một address trong các process khác nhau. Thực tế, loader tạo ra các ánh xạ memory tới các shared object file, và các dải address cho những ánh xạ đó có thể khác nhau. Nếu các address instruction là tuyệt đối, chúng ta không thể nạp cùng một shared object file trong nhiều process khác nhau, và trong nhiều vùng memory khác nhau, cùng một lúc.

> **Lưu ý**:
>
> Để có thông tin chi tiết hơn về cách<a id="_idIndexMarker280"></a> việc nạp động chương trình và shared object<a id="_idIndexMarker281"></a> file hoạt động, bạn có thể xem các tài nguyên sau:
>
> - [https://software.intel.com/sites/default/files/m/a/1/e/dsohowto.pdf](https://software.intel.com/sites/default/files/m/a/1/e/dsohowto.pdf)
> - [https://www.technovelty.org/linux/plt-and-got-the-key-to-code-sharing-and-dynamic-libraries.html](https://www.technovelty.org/linux/plt-and-got-the-key-to-code-sharing-and-dynamic-libraries.html)

Để tạo shared object file, bạn lại cần dùng compiler, trong trường hợp này là `gcc`. Không giống một file static library, vốn là một archive đơn giản, một shared object file tự nó là một object file. Do đó, chúng phải được tạo ra bởi cùng chương trình linker, chẳng hạn `ld`, mà chúng ta đã dùng để tạo ra các relocatable object file.

Chúng ta biết rằng, trên hầu hết các hệ thống Unix-like, `ld` làm việc đó. Tuy nhiên, bạn được khuyến nghị mạnh mẽ không dùng `ld` trực tiếp để link các object file vì những lý do chúng ta đã giải thích trong chương trước.

Lệnh sau cho thấy bạn nên tạo một shared object file từ một số relocatable object file đã được biên dịch bằng tùy chọn `-fPIC` như thế nào:

```
$ gcc -shared 2d.o 3d.o trigon.o -o libgeometry.so
$ mkdir -p /opt/geometry
$ mv libgeometry.so /opt/geometry
$
```

*Shell Box 3-16: Tạo một shared object file từ các relocatable object file*

Như bạn có thể thấy trong lệnh đầu tiên, chúng ta đã truyền tùy chọn `-shared`, để yêu cầu `gcc` tạo một shared object file từ các relocatable object file. Kết quả là một shared object file tên là `libgeometry.so`. Chúng ta đã chuyển shared object file tới `/opt/geometry` để nó dễ dàng sẵn có cho các chương trình khác muốn dùng nó. Bước tiếp theo là biên dịch và link lại *ví dụ 3.3*.

Trước đây, chúng ta đã biên dịch và link *ví dụ 3.3* với file static library đã tạo, `libgeometry.a`. Ở đây, chúng ta sẽ làm điều tương tự, nhưng thay vào đó, link nó với `libgeometry.so`, một dynamic library.

Mặc dù mọi thứ<a id="_idIndexMarker282"></a> có vẻ như nhau, đặc biệt là các lệnh, thực tế chúng khác nhau. Lần này, chúng ta sẽ link *ví dụ 3.3* với `libgeometry.so` thay vì `libgeometry.a`, và hơn thế nữa, dynamic library sẽ không được nhúng vào executable cuối cùng, thay vào đó nó sẽ nạp library khi thực thi. Trong khi thực hành điều này, hãy đảm bảo rằng bạn đã xóa file static library `libgeometry.a` khỏi `/opt/geometry` trước khi link lại *ví dụ 3.3*:

```
$ rm -fv /opt/geometry/libgeometry.a
$ gcc -c ExtremeC_examples_chapter3_3.c -o main.o
$ gcc main.o -L/opt/geometry-lgeometry -lm -o ex3_3.out
$
```

*Shell Box 3-17: Link ví dụ 3.3 với shared object file đã build*

Như chúng ta đã giải thích ở trên, tùy chọn `-lgeometry` bảo compiler tìm và dùng một library, static hay shared, để link nó với phần còn lại của các object file. Vì chúng ta đã xóa file static library, shared object file được chọn. Nếu cả static library lẫn shared object file đều tồn tại cho một library được định nghĩa, thì `gcc` ưu tiên chọn shared object file và link nó với chương trình.

Nếu giờ bạn thử chạy executable file `ex3_3.out`, nhiều khả năng bạn sẽ gặp lỗi sau:

```
$ ./ex3_3.out
./ex3_3.out: error while loading shared libraries: libgeometry.so: cannot open shared object file: No such file or directory
$
```

*Shell Box 3-18: Thử chạy ví dụ 3.3*

Đến giờ chúng ta chưa thấy lỗi này, vì chúng ta đang dùng static linkage và một static library. Nhưng giờ, bằng cách đưa vào dynamic library, nếu chúng ta định chạy một chương trình có *dynamic dependency*, chúng ta nên cung cấp các dynamic library cần thiết để nó chạy được. Nhưng điều gì đã xảy ra và tại sao chúng ta nhận được thông báo lỗi?

Executable file `ex3_3.out` phụ thuộc vào `libgeometry.so`. Đó là vì một số definition mà nó cần chỉ có thể được tìm thấy bên trong shared object file đó. Chúng ta nên lưu ý rằng điều này không đúng với static library `libgeometry.a`. Một executable file được link với một static library có thể chạy một mình như một executable độc lập, vì nó đã sao chép mọi thứ từ file static library, và do đó, không còn dựa vào sự tồn tại của file đó nữa.

Điều này không đúng với shared object file. Chúng ta nhận được lỗi vì program loader (dynamic linker) không thể tìm thấy `libgeometry.so` trong các đường dẫn tìm kiếm mặc định của nó. Do đó, chúng ta cần thêm `/opt/geometry` vào các đường dẫn tìm kiếm của nó, để nó tìm thấy file `libgeometry.so` ở đó. Để làm điều này, chúng ta sẽ cập nhật biến môi trường `LD_LIBRARY_PATH` để trỏ tới thư mục hiện tại.

Loader sẽ kiểm tra<a id="_idIndexMarker283"></a> giá trị của biến môi trường này, và nó sẽ tìm kiếm các shared library cần thiết trong các đường dẫn được chỉ định. Lưu ý rằng có thể chỉ định nhiều hơn một đường dẫn trong biến môi trường này (dùng dấu phân cách là dấu hai chấm `:`).

```
$ export LD_LIBRARY_PATH=/opt/geometry
$ ./ex3_3.out
Polar Position: Length: 223.606798, Theta: 63.434949 (deg)
$
```

*Shell Box 3-19: Chạy ví dụ 3.3 bằng cách chỉ định LD_LIBRARY_PATH*

Lần này, chương trình đã chạy thành công! Điều này có nghĩa là program loader đã tìm thấy shared object file và dynamic linker đã nạp thành công các symbol cần thiết từ đó.

Lưu ý rằng, trong shell box trên, chúng ta đã dùng lệnh `export` để thay đổi `LD_LIBRARY_PATH`. Tuy nhiên, việc đặt biến môi trường cùng với lệnh thực thi là phổ biến. Bạn có thể thấy điều này trong shell box sau. Kết quả sẽ như nhau với cả hai cách dùng:

```
$ LD_LIBRARY_PATH=/opt/geometry ./ex3_3.out
Polar Position: Length: 223.606798, Theta: 63.434949 (deg)
$
```

*Shell Box 3-20: Chạy ví dụ 3.3 bằng cách chỉ định LD_LIBRARY_PATH như một phần của cùng lệnh*

Bằng cách link một executable với vài shared object file, như chúng ta đã làm ở trên, chúng ta bảo hệ thống rằng executable file này cần một số shared library được tìm thấy và nạp vào lúc runtime. Do đó, trước khi chạy executable, loader tìm kiếm những shared object file đó <a id="_idIndexMarker284"></a>một cách tự động, và các symbol cần thiết được ánh xạ tới các address phù hợp mà process có thể truy cập. Chỉ khi đó bộ xử lý mới có thể bắt đầu việc thực thi.

<a id="_idParaDest-68"></a>

### Nạp thủ công shared library

Shared object file cũng có thể được nạp và dùng theo một cách khác, trong đó chúng không được chương trình loader (dynamic linker) nạp một cách *tự động*<a id="_idIndexMarker285"></a>. Thay vào đó, lập trình viên sẽ dùng một tập hàm để nạp một shared object file một cách *thủ công* trước khi dùng một số symbol (hàm) có thể được tìm thấy bên trong shared library đó. Có những ứng dụng cho cơ chế nạp thủ công này, và chúng ta sẽ nói về chúng một khi đã thảo luận ví dụ mà chúng ta sẽ xem trong phần này.

*Ví dụ 3.4* minh họa cách nạp một shared object file một cách lười biếng (lazily), hay thủ công, mà không cần có nó trong bước link. Ví dụ này mượn cùng logic từ *ví dụ 3.3*, nhưng thay vào đó, nó nạp shared object file `libgeometry.so` một cách thủ công bên trong chương trình.

Trước khi đi qua *ví dụ 3.4*, chúng ta cần tạo ra `libgeometry.so` hơi khác một chút để làm cho *ví dụ 3.4* hoạt động. Để làm điều này, chúng ta phải dùng lệnh sau trong Linux:

```
$ gcc -shared 2d.o 3d.o trigon.o -lm -o libgeometry.so
$
```

*Shell Box 3-21: Link shared object file hình học với library toán học chuẩn*

Nhìn vào lệnh trên, bạn có thể thấy một tùy chọn mới, `-lm`, bảo linker link shared object file với library toán học chuẩn, `libm.so`. Việc đó được làm vì khi chúng ta nạp `libgeometry.so` một cách thủ công, các phụ thuộc của nó phải, bằng cách nào đó, được nạp tự động. Nếu không, chúng ta sẽ nhận được lỗi về các symbol mà chính `libgeometry.so` cần, như `cos` hay `sqrt`. Lưu ý rằng chúng ta sẽ không link executable file cuối cùng với library toán học chuẩn, và nó sẽ được loader tự động phân giải khi nạp `libgeometry.so`.

Giờ chúng ta đã có một shared object file đã được link, chúng ta có thể tiếp tục với *ví dụ 3.4*:

```
#include <stdio.h>
#include <stdlib.h>
#include <dlfcn.h>
#include "ExtremeC_examples_chapter3_2_geometry.h"
polar_pos_2d_t (*func_ptr)(cartesian_pos_2d_t*);
int main(int argc, char** argv) {
  void* handle = dlopen ("/opt/geometry/libgeometry.so", RTLD_LAZY);
  if (!handle) {
    fprintf(stderr, "%s\n", dlerror());
    exit(1);
  }
  func_ptr = dlsym(handle, "convert_to_2d_polar_pos");
  if (!func_ptr)  {
    fprintf(stderr, "%s\n", dlerror());
    exit(1);
  }
  cartesian_pos_2d_t cartesian_pos;
  cartesian_pos.x = 100;
  cartesian_pos.y = 200;
  polar_pos_2d_t polar_pos = func_ptr(&cartesian_pos);
  printf("Polar Position: Length: %f, Theta: %f (deg)\n",
    polar_pos.length, polar_pos.theta);
  return 0;
}
```

*Code Box 3-8 [ExtremeC_examples_chapter3_4.c]: Ví dụ 3.4 nạp thủ công shared object file hình học*

Nhìn vào code trên, bạn có thể thấy cách chúng ta đã dùng các hàm `dlopen` và `dlsym` để nạp<a id="_idIndexMarker286"></a> shared object file rồi tìm symbol `convert_to_2d_polar_pos` trong đó. Hàm `dlsym` trả về một function pointer, có thể được dùng để gọi hàm đích.

Cần lưu ý rằng code trên tìm kiếm shared object file trong `/opt/geometry`, và nếu không có object file nào như vậy, thì một thông báo lỗi được hiển thị. Lưu ý rằng trong macOS, các shared object file kết thúc bằng phần mở rộng `.dylib`. Do đó, code trên nên được sửa đổi để nạp file với phần mở rộng đúng.

Lệnh sau biên dịch code trên và chạy executable file:

```
$ gcc ExtremeC_examples_chapter3_4.c -ldl -o ex3_4.out
$ ./ex3_4.out
Polar Position: Length: 223.606798, Theta: 63.434949 (deg)
$
```

*Shell Box 3-22: Chạy ví dụ 3.4*

Như bạn có thể thấy, chúng ta đã không link chương trình với file `libgeometry.so`. Chúng ta không làm điều này vì thay vào đó chúng ta muốn nạp nó một cách thủ công khi cần. Phương pháp này thường được gọi là *lazy loading* (nạp lười biếng) shared object file. Tuy nhiên, bất chấp cái tên, trong một số kịch bản nhất định, việc nạp lười biếng các shared object file có thể thực sự hữu ích.

Một trường hợp như vậy là khi bạn có các shared object file khác nhau cho các hiện thực hay phiên bản khác nhau của cùng một library. Lazy loading cho bạn thêm tự do để nạp các shared object mong muốn theo logic của riêng bạn và khi cần, thay vì để chúng được nạp tự động vào lúc nạp, nơi bạn có ít quyền kiểm soát hơn với chúng.

<a id="_idParaDest-69"></a>

## Tóm tắt

Chương này chủ yếu nói về các loại object file khác nhau, như các sản phẩm của một dự án C/C++ sau khi build. Như một phần của chương này, chúng ta đã trình bày các điểm sau:

- Chúng ta đã thảo luận về API và ABI, cùng với sự khác biệt giữa chúng.
- Chúng ta đã đi qua các object file format khác nhau và xem qua lịch sử ngắn gọn của chúng. Tất cả đều có chung một tổ tiên, nhưng chúng đã thay đổi theo những con đường riêng để trở thành những gì chúng là ngày nay.
- Chúng ta đã nói về relocatable object file và cấu trúc bên trong của chúng đối với các relocatable object file ELF.
- Chúng ta đã thảo luận về executable object file và sự khác biệt giữa chúng và relocatable object file. Chúng ta cũng đã xem một executable object file ELF.
- Chúng ta đã thể hiện static symbol table và dynamic symbol table và cách nội dung của chúng có thể được đọc bằng một số công cụ command-line.
- Chúng ta đã thảo luận về static linking và dynamic linking và cách các symbol table khác nhau được tra cứu để tạo ra binary cuối cùng hay để thực thi một chương trình.
- Chúng ta đã thảo luận về các file static library và sự thật rằng chúng chỉ là các file archive chứa một số relocatable object file.
- Shared object file (dynamic library) đã được thảo luận và chúng ta đã minh họa cách chúng có thể được tạo ra từ một số relocatable object file.
- Chúng ta đã giải thích position-independent code là gì và tại sao các relocatable object file tham gia vào việc tạo ra một shared library phải là position-independent.

Trong chương sau, chúng ta sẽ đi qua cấu trúc memory của một process; một chủ đề then chốt khác trong lập trình C/C++. Các memory segment khác nhau sẽ được mô tả như một phần của chương tiếp theo và chúng ta sẽ thấy cách có thể viết code không có vấn đề memory nào.
