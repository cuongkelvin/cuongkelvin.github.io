# Chương 5. Suy nghĩ về linking

Như Pall Mall Gazette mô tả ngày 11 tháng 3 năm 1889: "Ông Thomas Edison thức hai đêm trước để tìm 'bug' trong phonograph."

—Thomas Edison phát hiện bug, 1878

Computer system tiên phong Harvard Mark II có logbook nay ở National Museum of American History thuộc Smithsonian. Mục ngày 9 tháng 9 năm 1947 dán xác côn trùng bay vào switch, mắc kẹt. Nhãn "Relay #70 Panel F (bướm đêm) trong relay". Dưới ghi "Trường hợp đầu tiên thực sự tìm thấy bug."

—Grace Hopper phát hiện bug, 1947

Ngay bắt đầu lập trình, chúng tôi ngạc nhiên nhận ra làm chương trình đúng không dễ như nghĩ. Phải khám phá debugging. Tôi nhớ chính xác lúc nhận ra từ đó phần lớn đời sẽ dành tìm lỗi trong chính chương trình mình.

—Maurice Wilkes phát hiện bug, 1949

Kiểm thử chứng minh được có bug nhưng không bao giờ chứng minh không có.

—Edsger W. Dijkstra phát hiện bug, 1972

linking, library, loading…linker ở đâu trong giai đoạn compilation…lợi ích dynamic linking…năm bí mật linking library…cẩn thận interpositioning…đừng dùng các tên này cho identifier…tạo linker report…giải trí nhẹ nhàng — xem ai đang nói: thách thức Turing test

## Library, linking và loading

Bắt đầu ôn cơ bản linker: compiler tạo output file chứa relocatable object. Là data, machine instruction tương ứng source program. Chương dùng dạng linking tinh vi có trên mọi hệ SVR4 làm ví dụ.

### Linker ở đâu trong các giai đoạn compilation

Phần lớn compiler không là chương trình khổng lồ. Thường gồm đến half-a-dozen chương trình nhỏ, do "compiler driver" gọi. Có thể tách preprocessor, syntactic và semantic checker, code generator, assembler, optimizer, linker, và dĩ nhiên driver gọi các phần, truyền option đúng (Hình 5-1). Optimizer thêm được sau gần mọi pha. SPARCompiler hiện làm phần lớn optimization trên intermediate representation giữa front, back end.

Hình 5-1. Compiler thường chia thành chương trình nhỏ

![image](images/ch05/img05-01.png)

Chia phần vì dễ thiết kế, bảo trì khi mỗi phần chuyên biệt là chương trình riêng. Ví dụ preprocessing rule riêng pha đó, ít chung phần C còn lại. C preprocessor thường (không luôn) riêng. Code generator ("back end") stand-alone có thể chia sẻ với ngôn ngữ khác. Cái trade-off là nhiều chương trình nhỏ lâu hơn một lớn (overhead khởi process, truyền thông tin giữa pha). Xem từng pha bằng -#, -V cho thông tin phiên bản.

Truyền option từng pha bằng -W đặc biệt cho compiler-driver, nghĩa "chuyển option tới pha đó". Sau "W" là character chỉ pha, dấu phẩy rồi option. Character từng pha ở Hình 5-1.

Vậy truyền option qua compiler driver tới linker phải prefix "-Wl," để nói dành link editor, không preprocessor, compiler, assembler hay pha khác. Lệnh

```
cc -Wl,-m main.c > main.linker.map
```

đưa ld option "-m", bảo tạo linker map. Nên thử vài lần xem thông tin.

Object file không chạy trực tiếp; phải đưa linker trước. Linker xác định main là initial entry point (nơi bắt đầu chạy), bind symbolic reference với memory address, hợp object file, ghép library thành executable.

Linking trên PC và hệ lớn khác nhiều. PC thường chỉ vài dịch vụ I/O cơ bản, routine `BIOS`, ở vị trí memory cố định, không thuộc mỗi executable. PC program hay bộ program cần dịch vụ phức tạp thì cung cấp library, nhưng phải link vào từng executable. MS-DOS không có cơ chế "tách" library chung và cài chỉ một lần.

UNIX từng vậy. Link chương trình thì bản sao mọi library routine dùng vào executable. Những năm gần đây có mô hình hiện đại, tốt hơn là dynamic linking: hệ thống cung cấp nhiều library hữu ích, chương trình tìm runtime thay binary library bind vào executable. IBM OS/2 có, operating system chủ lực mới NT Microsoft cũng có. Windows<sup>®</sup> gần đây thêm cho phần windowing PC application.

Library vật lý trong executable gọi statically linked; executable chỉ chứa filename cho loader tìm library reference runtime gọi dynamically linked. Tên chuẩn ba pha tập module chuẩn bị chạy là link-editing, loading, runtime linking. Module static được link edit rồi load. Module dynamic được link-edited, load, runtime-linked. Khi chạy trước `main()`, runtime loader đưa shared data object vào process address space. Không resolve external function call đến khi thật gọi, nên không tốn cho link library có thể không gọi. Hai cách so trong Hình 5-2.

Hình 5-2. Static linking và dynamic linking

![image](images/ch05/img05-02.png)

Ngay static linking, không đưa toàn libc. a vào, chỉ routine cần.

## Lợi ích dynamic linking

Dynamic linking hiện đại hơn, executable nhỏ hơn nhiều. Đổi lấy dùng disk hiệu quả, pha link-edit nhanh là phạt runtime nhỏ (một số việc linker hoãn đến loadtime).

### Mẹo thực hành hữu ích

![image](images/ch05/img05-03.png)

Một mục đích dynamic linking là ABI

Mục đích lớn là tách chương trình khỏi phiên bản library cụ thể. Thay vào đó quy ước hệ thống cung cấp interface ổn định theo thời gian, qua bản OS liên tiếp.

Chương trình gọi service interface hứa, không lo cách cung cấp hay implementation đổi. Vì interface giữa application program và service library binary executable cung cấp, gọi Application Binary Interface, ABI.

ABI duy nhất là mục đích thống nhất UNIX quanh SVr4 AT\&T. ABI bảo đảm library có trên mọi máy compliant, giữ integrity interface. Bốn library bắt buộc dynamic linking: libc (C runtime), libsys (system runtime khác), libX (X windowing), libnsl (network service). Library khác static được nhưng rất khuyến khích dynamic.

Trước đây vendor phải relink mỗi OS, library release, nhiều công thêm cho mọi bên. ABI bỏ việc này, bảo đảm ứng dụng well-behaved không bị nâng cấp system software well-behaved ảnh hưởng.

Dù executable riêng tốn start-up hơn chút, dynamic linking giúp tổng thể hai cách:

1\. Executable dynamic nhỏ hơn static, tiết kiệm disk, virtual memory vì chỉ map library khi cần. Trước đây tránh bản sao library mỗi executable chỉ bằng đưa service vào kernel, góp "kernel bloat" đáng sợ.

2\. Mọi executable dynamic link library cụ thể chia sẻ một bản runtime. Kernel bảo đảm library map memory chia sẻ mọi process dùng. I/O, swap space hiệu quả hơn, tiết kiệm physical memory, tăng throughput tổng. Nếu static, mỗi cái lãng phí bản đầy đủ riêng.

Ví dụ tám ứng dụng XView™ chạy chỉ cần một bản library text segment map memory. Lời gọi mmap <sup>\[1\]</sup> process đầu khiến kernel map shared object. Bảy mmap tiếp cho chia sẻ mapping hiện có trong từng process. Tám process chung một bản XView. Static thì tám bản riêng tốn physical memory, paging hơn.

<sup>\[1\]</sup> System call `mmap()` map file vào process address space. Đọc memory location liên tiếp lấy nội dung file. Đặc biệt phù hợp file executable instruction. Filesystem được coi thuộc virtual memory SVr4, mmap là cơ chế đưa file vào memory.

Dynamic linking dễ versioning. Cung cấp library mới, cài xong chương trình cũ tự hưởng không relink. Cuối cùng (hiếm nhưng được) user chọn library runtime. Tạo phiên bản tối ưu tốc độ, memory, thêm debug information, cho user chọn bằng thay file library khi chạy.

Dynamic linking là "just-in-time" linking. Chương trình phải tìm được library runtime. Linker đặt filename, pathname vào executable; library không di chuyển tùy ý được. Link với `/usr/lib/libthread.so`, không chuyển sang directory khác trừ đã chỉ linker. Nếu không runtime gọi function library thất bại, báo như:

```
ld.so.1: main: fatal: libthread.so: can't open file: errno=2
```

Cũng là vấn đề khi chạy máy khác máy compile. Máy chạy phải đủ library, đúng directory đã nói linker. Library hệ thống chuẩn không vấn đề.

Lý do chính shared library là lợi ABI — khỏi recompile mỗi library, OS release. Lợi phụ là hiệu năng hệ thống tổng thể.

Ai cũng tạo static, dynamic library được. Compile code không main, xử lý .o bằng utility đúng — "ar" cho static, "ld" cho dynamic.

#### Giáo điều software

![image](images/ch05/img05-04.png)

Chỉ dùng dynamic linking!

Dynamic linking nay mặc định trên UNIX System V release 4, nên luôn dùng. Static linking đã lỗi thời về chức năng, nên để yên nghỉ.

Rủi ro chính static là OS tương lai không tương thích system library bind trong executable. Static trên OS N, chạy N+1 có thể chạy hoặc core dump, lỗi khó thấy hơn.

Không bảo đảm system library cũ chạy đúng hệ mới; thường giả định ngược an toàn hơn. Dynamic trên N thì chạy N+1 lấy đúng library N+1. Static phải tạo lại mỗi OS release để bảo đảm chạy.

Một số library (libaio.so, libdl.so, libsys.so, libresolv.so, librpcsvc.so) chỉ dynamic. Ứng dụng dùng phải link dynamic. Tốt nhất tránh vấn đề bằng mọi ứng dụng dynamic.

Static library gọi archive, tạo, cập nhật bằng utility `ar` — archive. `ar` đặt tên sai; quảng cáo software trung thực thì phải tên như `glue_files_together` hay `static_library_updater`. Quy ước extension ".a". Không ví dụ tạo static ở đây vì lỗi thời, không khuyến khích giao tiếp thế giới linh hồn.

SVR3 có loại trung gian "static shared libraries". Address cố định suốt đời, bind không cần indirection dynamic. Nhưng cứng nhắc, cần nhiều hỗ trợ riêng. Không xét thêm.

Dynamic library tạo bởi link editor `ld`. Extension ".so", "shared object" — mọi program chung một bản, khác static mỗi người một bản lãng phí. Đơn giản nhất tạo bằng option -G cho cc:

```
% cat tomato.c
    my_lib_function() {printf("library routine called\n"); }

% cc -o libfruit.so -G tomato.c
```

Sau đó viết routine dùng library, link như:

```
% cat test.c
    main() { my_lib_function(); }

% cc test.c -L/home/linden -R/home/linden -lfruit
% a.out
library routine called
```

Option `-L/home/linden -R/home/linden` nói directory tìm library lần lượt linktime, runtime.

Có lẽ cũng muốn compiler option `-K pic` tạo code position-independent cho library. Code Position-independent bảo đảm global data access qua indirection thêm, dễ relocate data bằng đổi một value trong global offset table. Tương tự function call qua indirect address trong procedure linkage table. Text dễ relocate bất cứ đâu bằng sửa offset table. Map runtime, runtime linker đặt thẳng nơi trống, code không phải đổi.

Mặc định compiler không tạo PICode vì pointer dereference thêm chậm chút runtime. Không PICode, code gắn fixed address — ổn executable, chậm shared library vì global reference phải fix runtime bằng sửa page, làm page không chia sẻ được.

Runtime linker vẫn fix page reference nhưng đơn giản hơn với code position-independent. PICode nhanh hay chậm hơn để runtime linker fix là trade-off. Rule là luôn PICode cho library. Code Position-independent đặc biệt hữu ích vì mỗi process thường map shared library ở virtual address khác (dù chung physical copy).

Thuật ngữ liên quan "pure code". Pure executable chỉ code (không static, initialized data). "Pure" vì không phải sửa để process cụ thể chạy. Data tham chiếu từ stack hay segment khác (impure). Pure code segment chia sẻ được. Tạo PIcode để chia sẻ thường muốn pure luôn.

## Năm bí mật đặc biệt linking library

Có năm quy ước non-obvious thiết yếu cần thạo. Sách C, manual thường không rõ, có lẽ người viết ngôn ngữ coi linking thuộc OS, người OS coi thuộc ngôn ngữ. Kết quả chỉ nhắc lướt trừ người nhóm linker tham gia! Đây là sự thật linking UNIX thiết yếu:

![image](images/ch05/img05-03.png)

1\. Dynamic library gọi `lib` `something` `.so`, static library `lib` `something` `.a`

Quy ước dynamic filename `libname` `.so` (có thể thêm version). Library thread routine là `libthread` `.so`. Static archive dạng libname.a. Shared archive dạng `libname` `.sa` từng tạm thời giúp chuyển static sang dynamic, nay cũng lỗi thời.

2\. Bảo compiler link chẳng hạn `libthread.so` bằng option `-lthread`

Command line không nêu toàn pathname, thậm chí không đầy đủ filename trong library directory! Thay vào đó `-lname` cho library `libname` `.so` — bỏ "`lib`", extension, nhét `-l` đầu.

3\. Compiler tìm library ở directory nhất định. Có lẽ thắc mắc biết directory nào. Như rule tìm header file, compiler tìm vài nơi riêng như `/usr/lib/`. Ví dụ threads library `/usr/lib/libthread.so`.

Option `-Lpathname` cho linker danh sách directory khác tìm library chỉ định bằng `-l`. Environment variable `LD_LIBRARY_PATH`, `LD_RUN_PATH,` cũng cho thông tin. Nay chính thức không khuyến khích vì bảo mật, hiệu năng, độc lập build/execute. Dùng `-Lpathname` `-Rpathname` lúc linktime thay.

4\. Nhận diện library qua header file đã dùng

Câu hỏi khác: "Biết cần link library nào?" Đáp như Obi-Wan Kenobi Star Wars đại ý "Dùng source, Luke!" Xem source thấy routine gọi nhưng không triển khai. Ví dụ lượng giác có `sin()`, `cos()`, trong math library. Manpage cho argument type chính xác và nên nói library.

Mẹo tốt xem `#include` dùng. Mỗi header có thể đại diện library cần link. C++ cũng vậy. Vấn đề tên không nhất quán: header thường tên chẳng giống library. Xin lỗi! Thứ phải "tự biết" để làm phù thủy C. Bảng 5-1 vài cái phổ biến.

Bảng 5-1. Quy ước library Solaris 2.x

| Filename `#include` | Library pathname | Compiler option |
|---|---|---|
| \<math.h\> | /usr/lib/libm.so | `-lm` |
| \<math.h\> | /usr/lib/libm.a | `-dn -lm` |
| \<stdio.h\> | /usr/lib/libc.so | Tự động link |
| "/usr/openwin/include/X11.h" | /usr/openwin/lib/libX11.so | `-L/usr/openwin/lib -lX11` |
| \<thread.h\> | /usr/lib/libthread.so | `-lthread` |
| \<curses.h\> | /usr/ccs/lib/libcurses.a | `-lcurses` |
| \<sys/socket.h\> | /usr/lib/libsocket.so | `-lsocket` |

Bất nhất khác: một library có routine đáp prototype trong nhiều header. Function `<string.h>`, `<stdio.h>`, `<time.h>` thường cùng `libc.so`. Nghi ngờ thì utility `nm` liệt kê routine library. Xem mẹo sau!

### Mẹo thực hành hữu ích

![image](images/ch05/img05-03.png)

Khớp symbol với library thế nào

Nếu link chương trình báo kiểu:

```
ld: Undefined symbol
    _xdr_reference
*** Error code 2
make: Fatal error: Command failed for target 'prog'
```

Định vị library cần link bằng nm tìm symbol mọi library /usr/lib, grep symbol thiếu. Linker mặc định tìm /usr/ccs/lib, /usr/lib, bạn cũng nên vậy. Không kết quả thì mọi library directory khác (như /usr/openwin/lib).

```
% cd /usr/lib
% foreach i (lib?*)
? echo $i
? nm $i | grep xdr_reference | grep -v UNDEF
? end
libc.so
libnsl.so
[2491] | 217028| 196|FUNC |GLOB |0 |8
|xdr_reference
libposix4.so
    ...
```

Chạy "nm" mỗi library, liệt kê symbol biết. Pipe qua grep giới hạn symbol tìm, lọc symbol "`UNDEF`" (tham chiếu nhưng không định nghĩa ở library này). Thấy `xdr_reference` ở libnsl. Thêm `-lnsl` cuối command line compiler.

5\. Symbol static library trích hạn chế hơn dynamic. Khác biệt link semantics lớn khác thường gây nhầm: archive (static) xử lý khác shared object (dynamic). Dynamic đưa mọi library symbol vào virtual address space output, mọi file trong link đều dùng. Static chỉ tìm archive cho undefined symbol loader hiện biết lúc xử lý archive.

Nói đơn giản, thứ tự static library trên compiler command line quan trọng. Linker khó tính vị trí, thứ tự vì resolve trái sang phải. Khác biệt nếu cùng symbol định nghĩa khác trong hai library. Cố ý làm có lẽ đủ hiểu hiểm họa.

Vấn đề khác khi nêu static library trước code mình. Chưa undefined symbol nên chẳng trích gì. Sau đó linker xử lý object, mọi library reference chưa đáp ứng! Quy ước từ đầu UNIX nhưng nhiều người bất ngờ; ít lệnh đòi thứ tự argument, loại có thường báo trực tiếp nếu sai. Người mới đều khó đến khi giải thích, rồi chỉ còn khó với chính khái niệm.

Thường gặp link math library. Nó dùng nhiều trong benchmark, application nên muốn vắt nanosecond hiệu năng cuối. Vì vậy libm thường static archive. Có chương trình dùng math routine như `sin()`, static link:

```
cc -lm main.c
```

báo như:

```
Undefined                  first referenced
 symbol                       in file
 sin                           main.o
ld: fatal: Symbol referencing errors. No output
written to a.out
```

Để trích symbol math library, đặt file chứa unresolved reference trước:

```
cc main.c -lm
```

Gây khổ vô tận cho người thiếu cảnh giác. Ai quen \<command\> \<options\> \<files\>, linker dùng \<command\> \<files\> \<options\> gây rối. Tệ hơn nó im nhận bản đầu, làm sai. Nhóm Sun từng sửa driver đối phó. Đổi SunOS 4.x unbundled compiler driver SC0.0 đến SC2.0.1 để "làm đúng" khi user bỏ `-lm`. Dù đúng, khác AT\&T, phá tuân thủ System V Interface Definition nên phải khôi phục cũ. Dù sao từ SunOS 5.2 có math library dynamic `/usr/lib/libm.so`.

#### Mẹo thực hành hữu ích

![image](images/ch05/img05-03.png)

Đặt library option ở đâu

Luôn đặt option library `-l` cuối cùng bên phải command line compile.

PC gặp tương tự khi Borland driver đoán có cần library floating-point. Đôi khi đoán sai, báo:

```
scanf : floating point formats not linked
Abnormal program termination
```

Dường như đoán sai khi dùng format floating-point `scanf()` hay `printf()` mà không gọi routine floating-point khác. Cách né là gợi thêm linker bằng khai báo function trong module sẽ link:

```
static void forcefloat(float *p)
{ float f = *p; forcefloat(&f); }
```

Đừng thật gọi, chỉ bảo đảm link vào. Đủ gợi Borland PC linker library floating-point thật sự cần.

Lưu ý: Microsoft C runtime cũng báo "floating point not loaded" khi cần numeric coprocessor mà máy không có. Sửa bằng relink dùng library floating-point emulation.

## Cẩn thận interpositioning

Interpositioning (còn "interposing") là thay library function bằng function user-written cùng tên. Kỹ thuật cho người thích đi hoang trên làn nhanh không lưới an toàn. Cho thay trong chương trình cụ thể, thường vì debug hay hiệu năng. Nhưng như súng không chốt, chuyên gia nhanh hơn còn người mới dễ tự hại.

Phải cực cẩn thận. Quá dễ vô tình thay library symbol bằng definition khác trong code. Không chỉ lời gọi bạn mà mọi lời gọi system routine cũng tham chiếu routine bạn. Compiler thường không lỗi khi thấy định nghĩa lại. Theo triết lý C lập trình viên luôn đúng, giả định cố ý.

Qua nhiều năm không thấy ví dụ thuyết phục interpositioning thiết yếu mà không làm cách khác (có thể bất tiện hơn). Thấy nhiều default global scope symbol kết hợp tạo lỗi hard-to-find (Hình 5-3), chừng chục bug report, escalations khẩn từ cả developer hiểu biết nhất. Tiếc không phải bug; implementation được định hoạt động vậy.

Hình 5-3. Interpositioning và default global scope

![image](images/ch05/img05-05.png)

Phần lớn không thuộc mọi tên C library, tên thường như `index`, `mktemp` được chọn nhiều bất ngờ. Đôi khi bug vào production code.

### Giáo điều software

![image](images/ch05/img05-04.png)

Lỗi interpositioning SunOS

SunOS 4.0.3, chương trình in /usr/ucb/lpr đôi khi báo "out of memory", từ chối in. Lỗi ngẫu nhiên khó tìm, cuối cùng do interpositioning vô ý.

Lập trình viên viết lpr có routine mặc định global `mktemp()` đòi ba argument. Không biết trùng tên library C (pre-ANSI), làm tương tự nhưng chỉ một argument.

lpr còn gọi library `getwd(),` vốn muốn `mktemp` library. Thay vào đó bind bản riêng lpr! `getwd()` gọi `mktemp,` đặt một argument stack, bản `mktemp` lpr lấy ba. Tùy value ngẫu nhiên, lpr báo "out of memory".

Bài học: đừng global symbol trừ khi thuộc interface!

Sửa bằng khai báo mktemp static, vô hình ngoài file (hoặc đổi tên). Mktemp nay thay library `tmpnam` trong ANSI C, nhưng cơ hội lỗi còn.

Identifier trong Bảng 5-2 thì đừng khai báo trong chương trình. Có cái luôn reserved, có cái chỉ khi include header cụ thể; cái chỉ global scope, cái cả global, file scope. Mọi keyword reserved nhưng bỏ bảng cho đơn giản. Dễ nhất coi tất cả luôn thuộc hệ thống. Đừng dùng làm identifier.

Có entry như `is[a-z]anything` `.`

Nghĩa mọi identifier bắt đầu "is", tiếp lowercase letter bất kỳ (không digit chẳng hạn), rồi character bất kỳ.

Entry khác `acos,-f,-l`.

Nghĩa ba identifier `acos`, `acosf`, `acosl` reserved. Mọi routine math header có bản cơ bản nhận double-precision argument. Có thêm hai bản: basename suffix `l` nhận quad precision ("long double"), suffix `f` single precision ("float").

Bảng 5-2. Tên tránh dùng làm identifier (dành hệ thống trong ANSI C)

| Đừng dùng tên này làm identifier |  |  |  |
|---|---|---|---|
| \_anything |  |  |  |
| `abort` | `abs` | `acos,-f,-l` | `asctime` |
| `asin,-f,-l` | `assert` | `atan,-f,-l` | `atan2,-f,-l` |
| `atexit` | `atof` | `atoi` | `atol` |
| `bsearch` | `BUFSIZ` | `calloc` | `ceil,-f,-l` |
| `CHAR_BIT` | `CHAR_MAX` | `CHAR_MIN` | `clearerr` |
| `clock` | `clock_t` | `CLOCKS_PER_SEC` | `cos,-f,-l` |
| `cosh,-f,-l` | `ctime` | `currency_symbol` | `DBL_DIG` |
| `DBL_EPSILON` | `DBL_MANT_DIG` | `DBL_MAX` | `DBL_MAX_10_EXP` |
| `DBL_MAX_EXP` | `DBL_MIN` | `DBL_MIN_10_EXP` | `DBL_MIN_EXP` |
| `decimal_point` | `defined` | `difftime` | `div` |
| `div_t` | `E[0-9]` | `E[A-Z]`anything |  |
| `errno` | `exit` | `EXIT_FAILURE` | `EXIT_SUCCESS` |
| `exp,-f,-l` | `fabs,-f,-l` | `fclose` | `feof` |
| `ferror` | `fflush` | `fgetc` | `fgetpos` |
| `fgets` | `FILE` | `FILENAME_MAX` | `floor,-f,-l` |
| `FLT_DIG` | `FLT_EPSILON` | `FLT_MANT_DIG` | `FLT_MAX` |
| `FLT_MAX_10_EXP` | `FLT_MAX_EXP` | `FLT_MIN` | `FLT_MIN_10_EXP` |
| `FLT_MIN_EXP` | `FLT_RADIX` | `FLT_ROUNDS` | `fmod,-f,-l` |
| `fopen` | `FOPEN_MAX` | `fpos_t` | `fprintf` |
| `fputc` | `fputs` | `frac_digits` | `fread` |
| `free` | `freopen` | `frexp,-f,-l` | `fscanf` |
| `fseek` | `fsetpos` | `ftell` | `fwrite` |
| `getc` | `getchar` | `getenv` | `gets` |
| `gmtime` | `grouping` | `HUGE_VAL` | `int_curr_symbol` |
| `int_frac_digits` | `INT_MAX` | `INT_MIN` | `is[a-z]`anything |
| `jmp_buf` | `L_tmpnam` | `labs` | `LC_[A-Z]`anything |
| `lconv` | `LDBL_DIG` | `LDBL_EPSILON` | `LDBL_MANT_DIG` |
| `LDBL_MAX` | `LDBL_MAX_10_EXP` | `LDBL_MAX_EXP` | `LDBL_MIN` |
| `LDBL_MIN_10_EXP` | `LDBL_MIN_EXP` | `ldexp,-f,-l` | `ldiv` |
| `ldiv_t` | `localeconv` | `localtime` | `log,-f,-l` |
| `log10,-f,-l` | `LONG_MAX` | `LONG_MIN` | `longjmp` |
| `malloc` | `MB_CUR_MAX` | `MB_LEN_MAX` | `mblen` |
| `mbstowcs` | `mbtowc` | `mem[a-z]`anything | `mktime` |
| `modf,-f,-l` | `mon_decimal_point` | `mon_grouping` | `mon_thousands_sep` |
| `n_cs_precedes` | `n_sep_by_space` | `n_sign_posn` | `NDEBUG` |
| `negative_sign` | `NULL` |  |  |
| `offsetof` | `p_cs_precedes` | `p_sep_by_space` | `p_sign_posn` |
| `perror` | `positive_sign` | `pow,-f,-l` | `printf` |
| `ptrdiff_t` | `putc` | `putchar` | `puts` |
| `qsort` | `raise` | `rand` | `RAND_MAX` |
| `realloc` | `remove` | `rename` | `rewind` |
| `scanf` | `SCHAR_MAX` | `SCHAR_MIN` | `SEEK_CUR` |
| `SEEK_END` | `SEEK_SET` | `setbuf` | `setjmp` |
| `setlocale` | `setvbuf` | `SHRT_MAX` | `SHRT_MIN` |
| `SIG_[A-Z]`anything | `sig_atomic_t` | `SIG_DFL` | `SIG_ERR` |
| `SIG_IGN` | `SIG[A-Z]`anything | `SIGABRT` | `SIGFPE` |
| `SIGILL` | `SIGINT` | `signal` | `SIGSEGV` |
| `SIGTERM` | `sin,-f,-l` | `sinh,-f,-l` | `size_t` |
| `sprintf` | `sqrt,-f,-l` |  |  |
| `srand` | `sscanf` | `stderr` | `stdin` |
| `stdout` | `str[a-z]`anything | `system` | `tan,-f,-l` |
| `tanh,-f,-l` | `thousands_sep` | `time` | `time_t` |
| `tm` | `tm_hour` | `tm_isdst` | `tm_mday` |
| `tm_min` | `tm_mon` | `tm_sec` | `tm_wday` |
| `tm_yday` | `tm_year` | `TMP_MAX` | `tmpfile` |
| `tmpnam` | `to[a-z]`anything | `UCHAR_MAX` | `UINT_MAX` |
| `ULONG_MAX` | `ungetc` | `USHRT_MAX` | `va_arg` |
| `va_end` | `va_list` | `va_start` | `vfprintf` |
| `vprintf` | `vsprintf` | `wchar_t` | `wcs[a-z]`anything |
| `wcstombs` | `wctomb` |  |  |

Nhớ ANSI 6.1.2 (Identifiers) cho implementation không phân biệt hoa thường external identifier. Cũng chỉ cần sáu character đầu có nghĩa (ANSI 5.2.4.1, Translation Limits). Cả hai mở rộng tên nên tránh. Danh sách là C library symbol không định nghĩa lại. Mỗi library thêm có symbol thêm. Xem tài liệu ABI <sup>\[2\]</sup> để có danh sách.

<sup>\[2\]</sup> The System V Application Binary Interface, AT\&T, 1990.

ANSI C chỉ giải quyết phần nào namespace pollution. Mục 7.1.2.1 out-laws user định nghĩa lại system name (thực chất cấm interpositioning):

7\.1.2.1 Reserved Identifier: Mọi identifier có external linkage trong phần sau \[sau đó là các phần định nghĩa standard library function\]… luôn dành làm identifier có external linkage.

Reserved nghĩa user không định nghĩa lại. Nhưng không constraint nên không cần báo khi thấy, chỉ gây hành vi không portable, undefined. Nghĩa là function name giống C library, cố ý hay không, tạo nonconforming program nhưng translator không phải cảnh báo. Chúng tôi thích chuẩn buộc warning diagnostic hơn, để tự chọn thứ như số case label switch tối đa.

## Tạo linker report file

Dùng "`-m`" cho ld có report ghi symbol interposed. Thường "`-m`" cho memory map, listing thứ đặt đâu executable. Cũng cho symbol nhiều instance, nhìn file xác định interpositioning.

Option `-D` cho ld từ SunOS 5.3 giúp link-editor debugging. Manual Linker and Libraries đầy đủ, cho xem link-editing, input file inclusion. Đặc biệt mon-itoring trích object từ archive. Còn hiển thị runtime binding.

Ld phức tạp, nhiều option, quy ước hơn đây. Mô tả đủ phần lớn mục đích; bốn nguồn giúp theo mức tinh vi tăng:

- Lệnh `ldd` liệt kê dynamic dependency executable, library chương trình dynamic cần.

- Option `-Dhelp` cho `ld` cung cấp thông tin xử lý sự cố linking.

- Thử manpage on-line của ld.

- Đọc SunOS Linker and Libraries Manual (mã 801-2869-10).

Kết hợp sẽ cho thông tin hiệu ứng linker tinh tế cần.

### Mẹo thực hành hữu ích

![image](images/ch05/img05-03.png)

Khi "botch" xuất hiện

SunOS 4.x, "botch" trong lỗi nghĩa loader thấy bất nhất nội bộ, thường input file lỗi.

SunOS 5.x loader kiểm input đúng, nhất quán chặt hơn. Không cần phàn nàn internal error, bỏ "botch".

## Giải trí nhẹ nhàng — Xem ai đang nói: thách thức Turing test

Bình minh điện tử, tiềm năng computer mở ra, tranh luận liệu hệ thống ngày nào có artificial intelligence. Dẫn câu "Biết máy nghĩ thế nào?" Trong Mind năm 1950, nhà toán Anh Alan Turing gỡ triết lý bằng test thực tế. Người hỏi nói qua teletype (tránh hình, tiếng) với người khác và computer. Không xác định đúng bên nào sau năm phút thì computer thể hiện AI. Gọi Turing Test. Qua nhiều thập kỷ diễn ra vài lần, kết quả đôi khi kinh ngạc. Chúng tôi mô tả vài test, tái hiện hội thoại để tự xét.

### Eliza

Chương trình natural language đầu có "Eliza", tên nữ chính nói nhiều Pygmalion của Shaw. Joseph Weizenbaum, giáo sư MIT, viết năm 1965, mô phỏng nhà tâm thần Rogerian nói với bệnh nhân. Phân tích text sơ rồi nhả một trong nhiều đáp chuẩn có sẵn. Ảo giác computer hiểu đánh lừa khá nhiều người com-puter-naive.

Weizenbaum thấy đầu khi mời thư ký thử. Sau vài phút với Eliza, thư ký (đã xem ông làm nhiều tháng, đáng ra hiểu hơn đa số chỉ là program) xin ông ra để tiếp tục riêng!

Turing test thất bại lần đầu vì thư ký coi software sơ đẳng không nhận AI là người. Không phải software thông minh, con người dễ tin. Eliza phổ biến, được Bolt Berenek and Newman, computer consul-tancy Boston, thích nghi. Dẫn test nặng hơn khi phó chủ tịch BBN nối Eliza thay lập trình viên mong đợi.

### Eliza gặp phó chủ tịch

Nhà computer science Daniel Bobrow kể trong SIGART Newsletter tháng 12 năm 1968.

Thứ Bảy khoảng 9 giờ sáng, vice-president BBN phụ trách bán Telcomp tới phòng máy mong demo. Thấy giấy teletype: "gõ mọi thông điệp, kết thúc dấu chấm". Một anh chàng lập trình để lại sau chạy được Lisp Doctor (dựa ELIZA Weizenbaum). Nhưng VP nghĩ teletype nối nhà tôi vì tôi thường dùng máy cả đêm. Ông gõ cho "tôi" nhưng thật cho Doctor. Hội thoại:

vp: Sáng nay dùng máy được không? teletype: Sao ông hỏi? vp: Có thể bán thêm telcomp. teletype: Sao không chắc? vp: Khách tiềm năng chưa xem demo. teletype: Điều đó quan trọng với ông? vp: Tất nhiên. teletype: Ông có vẻ chắc. vp: Nực cười. teletype: Nực cười nghĩa gì? vp: Có lý do nào tôi không dùng ngay? teletype: Kể thêm khách tiềm năng. vp: Gọi tôi nhé

Sau câu đó VP không tuân thủ, thiếu dấu chấm, nên computer không đáp. Ông nghĩ tôi đùa, nổi giận gọi đánh thức tôi ngủ say:

vp: Sao anh hợm với tôi? Bobrow: Ông nói tôi hợm là sao?

VP giận đọc hội thoại "chúng tôi", chỉ nhận tiếng cười. Mất lúc để thuyết phục thật sự computer.

Eliza/Doctor thường đáp open-ended question để user gõ thêm. Không cố trả lời vì không có khả năng. Nhưng lừa vice president computer-literate. Không phải thông minh, vượt Turing test. Khi đó mới, nay rất sơ đẳng. Lừa vì người quá dễ lừa, nên test không đủ. Turing test thất bại lần hai.

### Bác sĩ, gặp bác sĩ

FSF vì vui, hack-value, ngẫu hứng tích hợp đối thoại bác sĩ vào GNU editor phổ biến. GNU-EMACS miễn phí, có phần lớn UNIX. Mở GNU-EMACS, lệnh "escape-x doctor". Tôi nghĩ vui nếu nối hai Doctor back-to-back, nói nhau. Kết quả:

1: Tôi là nhà trị liệu tâm lý. Hãy mô tả vấn đề. 2: Điều gì đưa anh đến? 1: Nói kỹ hơn? 2: Tôi biết ơn nếu anh tiếp tục. 1: Điều gì khiến anh tin anh biết ơn nếu tôi tiếp tục? 2: Sao anh nói vậy? \[doctor 1 bắt đầu lỗi ngữ pháp…\] 1: Khi nào anh đầu tiên biết rằng có tôi nói vậy? \[doctor 2 cũng lỗi…\] 2: Chuyện gì khi đã tôi đầu tiên biết rằng có anh nói vậy? 1: Chuyện gì nếu đã anh đầu tiên biết rằng có tôi nói vậy? 2: Có phải việc có anh nói vậy là lý do thật? 1: Có phải việc có tôi nói vậy là lý do thật là lý do thật? 2: việc có anh nói vậy là lý do thật là lý do thật giải thích gì khác? 1: việc có tôi nói vậy là lý do thật là lý do thật giải thích gì khác giải thích gì

khác?

2: Anh chắc có anh nói vậy là lý do thật là lý do thật giải thích gì khác giải thích gì

khác?

1: Anh chắc lý do thật lý do thật giải thích gì khác giải thích gì khác? 2: Trước anh nói có tôi làm điều gì đưa tôi đến anh? 1: Trước anh nói có anh làm điều gì đưa anh đến tôi rằng tôi đến anh? 2: Có phải vì anh đến tôi mà anh đến tôi? 1: Có phải vì tôi đến anh mà anh đến tôi? 2: Anh bực rằng anh đến tôi mà tôi đến anh? \[doctor 1 thử hướng mới, phục hồi ngữ pháp nhưng lặp\] 1: Anh thường bực? 2: Anh thường bực? 1: Gì khiến anh bực? 2: Anh chắc anh bực? 1: Gì khiến anh tin anh bực? 2: Anh thường bực? 1: Anh thường bực?

Như thấy chẳng vui lắm. Hội thoại lộ "nhại" là phương tiện chính. Phân tích text nông bị câu phức làm hỏng. Doctor nhại một phần câu trước thành câu hỏi thường tự tạo câu quá khó cho mình. Từng lừa người nhưng ai xem transcript này không bị lừa.

### Giải thưởng Boston

Tua nhanh 1991. Computer nhanh mạnh hơn rất nhiều. AI nghiên cứu hơn phần tư thế kỷ. Đến Turing test mới, ngoạn mục nhất.

Tháng 11 năm 1991 Boston Computer Museum, National Science Foundation, Alfred P. Sloan Foundation tài trợ demo công khai. Chọn người hỏi qua quảng cáo news-papers Boston, muốn người trung bình thay nhà khoa học hiểu triết, ngôn ngữ. Mười người hỏi có ba giờ nói qua terminal với hơn chục program, người. Điển hình:

terminal: Ngẫu hứng là hành vi bất chợt, tùy hứng, thường kỳ lạ. Tia nắng trong thế giới xám u ám.

người hỏi: Giống linh cảm?

terminal: Ai cũng định làm gì và làm gì, nhưng chẳng ai làm thứ định.

người hỏi: Dù sao tôi nghĩ nói ngẫu hứng như nước mã cờ vua — zigzag thay một đường cụ thể.

terminal: Người ngẫu hứng có hành vi thất thường, ý nghĩ khó đoán…khó đoán thật thích! Không lạ terminal là program. Như Eliza, phân tích syntax, keyword câu hỏi, chọn chủ đề khớp từ database lớn câu sẵn. Tránh "thế khó bác sĩ" bằng không nhại mà liên tục đưa chủ đề mới có liên quan.

Cũng không lạ lừa năm trong mười người, đánh dấu là người sau trao đổi này, dài hơn. Turing test đen lần ba, bị đo ván.

### Kết luận

Không trực tiếp đáp câu đơn giản ("\[ý anh\] giống linh cảm?") lộ rõ với computer scientist, chỉ yếu điểm: trao đổi câu semi-appropriate không nghĩa nghĩ — phải xem nội dung.

Nhiều lần thấy Turing test không đủ. Dựa surface appear-ances, con người dễ bị lừa. Ngoài câu hỏi triết quan trọng liệu mô phỏng biểu hiện ngoài có chứng minh quá trình trong con người, human interro-gators thường không phân biệt chính xác. Trong đời chỉ người hội thoại, tự nhiên giả định mọi hội thoại dù gượng với người khác.

Dù thất bại thực nghiệm, cộng đồng AI rất không muốn bỏ. Tài liệu nhiều bảo vệ. Đơn giản lý thuyết hấp dẫn, nhưng không chạy thực tế phải sửa hoặc bỏ.

Turing test gốc nói người hỏi phân biệt phụ nữ với đàn ông giả phụ nữ qua teletype. Turing không trực tiếp nói có lẽ test cũng không đủ cho việc này.

Có thể nghĩ chỉ cần nhấn lại khía cạnh đó: buộc tranh luận terminal có là người. Tôi nghi không hơn. Test Museum 1991 cho đơn giản giới hạn một domain mỗi terminal. Program có knowledge base mua sắm, thời tiết, ngẫu hứng, v.v. Chỉ cần tập nhận xét khả dĩ và đáp khôn về thân phận người. Turing viết năm phút đủ; nay không gần đủ.

Sửa bằng mắt xích yếu: tính dễ tin con người. Như bác sĩ phải học nhiều năm mới khám, cần thêm người hỏi không đại diện người đường phố trung bình. Nên rành computer science, có thể nghiên cứu sinh quen mạnh yếu hệ thống, không bị câu khôn từ database thay câu trả lời thật đánh lạc.

Ý khác là xem óc hài hước terminal. Hỏi chuyện có phải joke, giải thích vì sao vui. Tôi nghĩ quá nặng — quá nhiều người trượt. Dù lý thuyết xuất sắc, Turing thường bất lực chuyện thực. Tính thiếu thực tế lộ lạ: xích cốc vào radiator để đồng nghiệp không dùng; họ coi thách thức, phá khóa, cố uống. Ông thường chạy hơn chục dặm tới hẹn xa, đến nhớp mệt thay đi phương tiện công cộng. Chiến tranh châu Âu 1939, đổi tiết kiệm hai thỏi bạc chôn đồng an toàn, cuối chiến tranh quên nơi. Cuối cùng tự sát kiểu thiếu thực tế đặc trưng: ăn táo tiêm cyanide. Test tên ông là lý thuyết thắng kinh nghiệm thực. Khác biệt lý thuyết, thực hành trong thực hành lớn hơn trong lý thuyết.

### Tái bút

Turing còn tin "cuối thế kỷ từ ngữ, ý kiến người có học đổi đến mức nói máy nghĩ không sợ phản đối". Thật xảy ra sớm hơn. Lập trình viên thường giải thích tật máy bằng suy nghĩ: "Chưa carriage return nên máy nghĩ còn input, đang đợi". Nhưng vì "nghĩ" mất giá, không phải máy có ý thức như ông đoán.

Alan Turing được công nhận chính đáng nhà tiên phong lý thuyết lớn computing. ACM lập Turing Award cao nhất hằng năm tưởng nhớ. Năm 1983 trao Dennis Ritchie, Ken Thompson vì UNIX, C.

#### Đọc thêm

Muốn hiểu tiến bộ, giới hạn AI, sách tốt là What Computers Still Can't Do: A Critique of Artificial Reason của Hubert L. Dreyfus, MIT Press, Boston, 1992.
