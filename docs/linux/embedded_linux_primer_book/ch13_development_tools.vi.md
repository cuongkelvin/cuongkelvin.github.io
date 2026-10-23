# Chương 13. Công cụ phát triển

## Trong chương này

- 13\.1 GNU Debugger (GDB) 326

- 13\.2 Data Display Debugger 333

- 13\.3 `cbrowser/cscope` 335

- 13\.4 Công cụ tracing và profiling 337

- 13\.5 Binary utility 355

- 13\.6 Các binary utility khác 361

- 13\.7 Tổng kết 364

Môi trường phát triển embedded Linux điển hình gồm nhiều công cụ hữu ích.

Một số phức tạp, cần thành thạo cao để làm chủ.

Số khác đơn giản và gần như bị lập trình viên embedded

bỏ qua. Một số có thể cần tùy chỉnh cho môi trường cụ thể.

Nhiều công cụ chạy được ngay và cung cấp thông tin hữu

ích mà không tốn nhiều công sức. Chương này trình bày cross-section của những công cụ

quan trọng nhất (và thường bị lãng quên) dành cho

kỹ sư embedded Linux.

Không thể cung cấp đầy đủ chi tiết công cụ, tiện ích trình bày

trong chương. Điều đó cần nguyên cuốn sách! Thay vì

tài liệu tham chiếu đầy đủ, mục tiêu là giới thiệu cách dùng cơ bản từng loại. Bạn

nên nghiên cứu thêm những công cụ này và công cụ phát triển

quan trọng khác. Man page (hoặc tài liệu khác) mỗi công cụ là nơi

khởi đầu rất tốt.

GNU Debugger (GDB) được giới thiệu đầu tiên, rồi xem ngắn gọn

Data Display Debugger, graphical front end cho GDB. Tiếp theo là loạt

tiện ích cho lập trình viên quan sát hành vi chương trình và

toàn hệ thống, gồm `strace`, `ltrace`, `top`, `ps`, thường bị

lập trình viên Linux ít kinh nghiệm bỏ qua. Sau đó trình bày một số công cụ crash dump

và memory-analysis. Chương kết thúc bằng giới thiệu một số

binary utility hữu ích hơn cả.

## 13.1 GNU Debugger (GDB)

Nếu dành nhiều thời gian phát triển ứng dụng Linux, chắc chắn bạn sẽ dành nhiều giờ làm quen với GNU Debugger. Có thể nói GDB là công cụ quan trọng nhất trong bộ công cụ của lập trình viên. Nó có lịch sử lâu đời và đã phát triển để hỗ trợ debugging low-level hardware-specific cho rất nhiều architecture và microprocessor. Cần lưu ý rằng GDB user manual gần dày bằng cuốn sách này. Mục đích ở đây là giới thiệu GDB để giúp bạn bắt đầu. Bạn nên nghiên cứu user manual được dẫn ở phần cuối.

Vì đây là cuốn sách về phát triển embedded Linux, chúng ta sử dụng một phiên bản GDB được biên dịch thành cross-debugger. Nghĩa là bản thân debugger chạy trên development host, nhưng chỉ hiểu binary executable thuộc architecture mà nó được cấu hình tại thời điểm biên dịch. Một vài ví dụ tiếp theo dùng GDB được biên dịch cho Linux development host và target processor XScale (ARM). Mặc dù dùng tên ngắn `gdb`, chúng ta trình bày các ví dụ dựa trên cross-gdb XScale-enabled từ Monta Vista embedded Linux distribution dành cho ARM XScale. Binary này tên `xscale_be-gdb`. Nó vẫn là GDB, nhưng được cấu hình cho môi trường cross-development.

GDB debugger là một chương trình phức tạp, cung cấp nhiều configuration option trong quá trình build. Chúng tôi không có ý định hướng dẫn build `gdb`; chủ đề đó đã được trình bày trong các tài liệu khác. Trong chương này, chúng ta giả định bạn đã có một GDB hoạt động và được cấu hình cho architecture cùng host development environment sẽ sử dụng.

### 13.1.1 Debug core dump

Một trong những lý do phổ biến nhất để lấy GDB ra sử dụng là phân tích core dump. Quá trình này nhanh, dễ và thường giúp xác định ngay code gây lỗi. Core dump là file được kernel tạo khi chương trình ứng dụng gây fault, chẳng hạn truy cập một memory location mà nó không sở hữu. Nhiều tình huống có thể kích hoạt core dump,[^1] nhưng SIGSEGV (segmentation fault) phổ biến hơn cả. SIGSEGV là một Linux kernel signal được tạo khi user process truy cập memory trái phép. Khi signal này xuất hiện, kernel kết thúc process rồi dump core image nếu tính năng đó được bật.

Để bật khả năng tạo core dump, process của bạn phải có quyền thực hiện việc đó. Bạn có thể cấp quyền bằng cách đặt resource limit của process qua lời gọi function C `setrlimit()`, hoặc dùng `ulimit` tại command prompt của BASH hoặc BusyBox shell. Không hiếm khi bạn gặp dòng sau trong initialization script của embedded system để bật việc tạo core dump khi process gặp lỗi:

```
ulimit -c unlimited
```

Lệnh BASH built-in này được dùng để đặt giới hạn kích thước core dump. Trong trường hợp trên, kích thước được đặt thành `unlimited`. Bạn có thể chạy lệnh sau từ shell để xem thiết lập hiện tại:

```
$ ulimit
unlimited
```

Khi chương trình ứng dụng gây segmentation fault, chẳng hạn ghi vào memory address ngoài phạm vi được phép, Linux kết thúc process và tạo core dump nếu tính năng này được bật. Core dump là snapshot của process đang chạy tại thời điểm segmentation fault xảy ra.

Bật debugging symbol trong binary sẽ rất hữu ích. GDB tạo output hữu ích hơn nhiều khi debugging symbol được bật trong quá trình build bằng `gcc -g`. Tuy nhiên, bạn vẫn có thể xác định trình tự sự kiện dẫn đến segmentation fault ngay cả khi binary được biên dịch mà không có debugging symbol. Khi thiếu sự trợ giúp của symbol, bạn có thể cần điều tra thêm. Trong trường hợp đó, bạn phải tự đối chiếu virtual address với vị trí trong chương trình.

Listing 13-1 trình bày kết quả một session phân tích core dump bằng GDB. Output đã được định dạng lại đôi chút để vừa trang. Chúng ta sử dụng một software minh họa để cố ý tạo segmentation fault. Sau đây là output của process tên webs đã gây segmentation fault:

```
root@coyote:# ./webs
Segmentation fault (core dumped)
```

LISTING 13-1 Phân tích core dump bằng GDB

```
$ xscale_be-gdb webs core
GNU gdb 6.3 (MontaVista 6.3-20.0.22.0501131 2005-07-23)
Copyright 2004 Free Software Foundation, Inc.
GDB is free software, covered by the GNU General Public
License, and you are welcome to change it and/or distribute copies of it under
certain conditions.
Type “show copying” to see the conditions.
There is absolutely no warranty for GDB.  Type “show warranty” for details.
This GDB was configured as “--host=i686-pc-linux-gnu
-target=armv5teb-montavista-linuxeabi”...

Core was generated by ‘./webs’.
Program terminated with signal 11, Segmentation fault.
Reading symbols from /opt/montavista/pro/.../libc.so.6...done.
Loaded symbols for /opt/montavista/pro/.../libc.so.6
Reading symbols from /opt/montavista/pro/.../ld-linux.so.3...done.
Loaded symbols for /opt/montavista/pro/.../ld-linux.so.3
#0  0x00012ac4 in ClearBlock (RealBigBlockPtr=0x0, l=100000000) at led.c:43
43                      *ptr = 0;

(gdb) l
38
39    static int ClearBlock(char * BlockPtr, int l)
40    {
41        char * ptr;
42        for (ptr = BlockPtr; (ptr - BlockPtr) < l; ptr++)
43            *ptr = 0;
44        return 0;
45    }
46    static int InitBlock(char * ptr, int n)
47    {
(gdb) p ptr
$1 = 0x0
(gdb)
```

### 13.1.2 Gọi GDB

Dòng đầu tiên của Listing 13-1 cho thấy cách gọi GDB từ command line. Vì đang thực hiện cross-debugging, chúng ta cần cross-version của GDB đã được biên dịch cho host và target system của mình. Chúng ta gọi cross-gdb như trong listing, truyền cho `xscale_be-gdb` tên binary, tiếp theo là tên core dump file; trong trường hợp này, tên file chỉ là `core`. Sau khi in một số banner line mô tả cấu hình và các thông tin khác, GDB hiển thị nguyên nhân chương trình kết thúc: signal 11, biểu thị segmentation fault.[^2]

Tiếp theo là một số dòng thông báo khi GDB load binary, các library mà binary phụ thuộc và core file. Dòng cuối cùng được in khi GDB khởi động là vị trí của chương trình tại thời điểm xảy ra fault. Dòng bắt đầu bằng string `#0` cho biết stack frame: stack frame zero trong function `ClearBlock()` tại virtual address `0x00012ac4`. Dòng tiếp theo bắt đầu bằng `43`, là số dòng của dòng source code gây lỗi trong file `led.c`. Sau đó, GDB hiển thị command prompt và chờ input.

Để xem ngữ cảnh xung quanh lỗi, chúng ta nhập lệnh `gdb list` bằng dạng viết tắt `l`. GDB nhận dạng các lệnh viết tắt nếu chúng không gây nhầm lẫn. Đến đây, lỗi chương trình bắt đầu lộ rõ. Theo kết quả GDB phân tích core dump, dòng gây lỗi là:

```
43            *ptr = 0;
```

Tiếp theo, chúng ta chạy lệnh `gdb print` cho variable `ptr`, sử dụng dạng viết tắt `p`. Như bạn thấy trong Listing 13-1, pointer `ptr` có giá trị `0`. Vì vậy, chúng ta kết luận nguyên nhân segmentation fault là null pointer dereference điển hình, một lỗi lập trình phổ biến trong nhiều ngôn ngữ. Từ đây, chúng ta có thể chọn lệnh backtrace để xem call chain dẫn đến lỗi này, qua đó có thể lần ngược về nguồn gốc lỗi. Listing 13-2 hiển thị kết quả.

LISTING 13-2 Lệnh backtrace

```
(gdb) bt
#0  0x00012ac4 in ClearBlock (RealBigBlockPtr=0x0, l=100000000) at led.c:43
#1  0x00012b08 in InitBlock (ptr=0x0, n=100000000) at led.c:48
#2  0x00012b50 in ErrorInHandler (wp=0x325c8, urlPrefix=0x2f648 “/Error”,
    webDir=0x2f660 “”, arg=0, url=0x34f30 “/Error”, path=0x34d68 “/Error”,
    query=0x321d8 “”) at led.c:61
#3  0x000126cc in websUrlHandlerRequest (wp=0x325c8) at handler.c:273
#4  0x0001f518 in websGetInput (wp=0x325c8, ptext=0xbefffc40,
    pnbytes=0xbefffc38) at webs.c:664
#5  0x0001ede0 in websReadEvent (wp=0x325c8) at webs.c:362
#6  0x0001ed34 in websSocketEvent (sid=1, mask=2, iwp=206280) at webs.c:319
#7  0x00019740 in socketDoEvent (sp=0x34fc8) at sockGen.c:903
#8  0x00019598 in socketProcess (sid=1) at sockGen.c:845
#9  0x00012be8 in main (argc=1, argv=0xbefffe14) at main.c:99
(gdb)
```

Backtrace hiển thị call chain ngược đến tận `main()`, điểm bắt đầu chương trình của người dùng. Mỗi dòng trong backtrace được đặt trước một stack frame number. Bạn có thể chuyển đến bất kỳ stack frame nào bằng lệnh `gdb frame`. Listing 13-3 minh họa thao tác này: chúng ta chuyển đến stack frame 2 và hiển thị source code trong frame đó. Như trong các ví dụ trước, những dòng bắt đầu bằng command prompt `(gdb)` là lệnh chúng ta gửi đến GDB; những dòng còn lại là output của GDB.

LISTING 13-3 Di chuyển giữa stack frame trong GDB

```
(gdb) frame 2
#2  0x00012b50 in ErrorInHandler (wp=0x325c8, urlPrefix=0x2f648 “/Error”,
    webDir=0x2f660 “”, arg=0, url=0x34f30 “/Error”, path=0x34d68 “/Error”,
    query=0x321d8 “”) at led.c:61
61              return InitBlock(p, siz);
(gdb) l
56
57              siz = 10000 * sizeof(BigBlock);
58
59              p = malloc(siz);
60          /*  if (p) */
61                 return InitBlock(p, siz);
62          /*  else return (0);  */
63      }
64
65
(gdb)
```

Như bạn thấy, với một chút hỗ trợ từ source code được hiển thị bằng lệnh list, việc lần ngược theo code để tìm nguồn gốc null pointer gây lỗi trở nên đơn giản. Hãy chú ý nguyên nhân segmentation fault mà chúng ta đã tạo cho ví dụ này. Trong Listing 13-3, phần kiểm tra return value của lời gọi `malloc()` đã bị vô hiệu hóa bằng comment. Trong ví dụ này, lời gọi `malloc()` thất bại, dẫn đến thao tác trên null pointer ở hai frame sau trong call chain. Mặc dù ví dụ này được cố ý dựng lên và rất đơn giản, nhiều crash thuộc loại này lại dễ xác định đáng ngạc nhiên khi sử dụng phương pháp tương tự với GDB và core dump. Bạn cũng có thể nhận ra null pointer bằng cách xem các parameter value trong lời gọi function. Cách này thường dẫn bạn thẳng đến stack frame nơi null pointer xuất hiện.

### 13.1.3 Debug session trong GDB

Chúng ta kết thúc phần giới thiệu GDB bằng một debug session điển hình. Trong ví dụ chương trình crash trước đó, chúng ta cũng có thể chọn đi qua từng bước code để khoanh vùng nguyên nhân thất bại. Tất nhiên, nếu có core dump, bạn luôn nên bắt đầu từ đó. Tuy nhiên, trong những tình huống khác, bạn có thể muốn đặt breakpoint và đi qua từng bước code đang chạy. Listing 13-4 trình bày chi tiết cách khởi động GDB để chuẩn bị debug session. Chú ý rằng chương trình phải được biên dịch với debug flag được bật trên command line của `gcc` thì GDB mới hữu ích trong ngữ cảnh này. Xem Hình 12-1 trong Chương 12, “Môi trường phát triển embedded”; đây là một session cross-debug với GDB chạy trên development host để debug chương trình chạy trên target. Chúng ta trình bày đầy đủ chi tiết remote application debugging trong Chương 15, “Debug ứng dụng embedded Linux”.

LISTING 13-4 Bắt đầu GDB debug session

```
$ xscale_be-gdb -silent webs

(gdb) target remote 192.168.1.21:2001
0x40000790 in ?? ()
(gdb) b main
Breakpoint 1 at 0x12b74: file main.c, line 78.
(gdb) c
Continuing.

Breakpoint 1, main (argc=1, argv=0xbefffe04) at main.c:78
78              bopen(NULL, (60 * 1024), B_USE_MALLOC);
(gdb) b ErrorInHandler
Breakpoint 2 at 0x12b30: file led.c, line 57.
(gdb) c
Continuing.

Breakpoint 2, ErrorInHandler (wp=0x311a0, urlPrefix=0x2f648 “/Error”,
    webDir=0x2f660 “”, arg=0, url=0x31e88 “/Error”, path=0x31918 “/Error”,
    query=0x318e8 “”) at led.c:57
57              siz = 10000 * sizeof(BigBlock);
(gdb) next
59              p = malloc(siz);
(gdb) next
61              return InitBlock(p, siz);
(gdb) p p
$1 =(unsigned char *) 0x0
(gdb) p siz
$2 =  100000000
(gdb)
```

Khảo sát debug session đơn giản này, trước hết chúng ta kết nối đến target board bằng lệnh `gdb target`. (Chúng ta trình bày chi tiết hơn về remote debugging trong Chương 15.) Khi đã kết nối đến target hardware, chúng ta đặt breakpoint tại `main()` bằng lệnh gdb break, viết tắt là `b`. Sau đó, chúng ta chạy lệnh `gdb continue`, viết tắt là `c`, để tiếp tục thực thi chương trình. Nếu có program argument, chúng ta có thể truyền chúng trên command line khi gọi GDB.

Chương trình dừng ở breakpoint đã đặt tại `main()`. Sau đó, chúng ta đặt thêm một breakpoint tại `ErrorInHandler()` rồi chạy lệnh continue, cũng ở dạng viết tắt. Khi chương trình chạm breakpoint mới, chúng ta bắt đầu đi qua từng bước code bằng lệnh `next`. Tại đó, chúng ta gặp lời gọi `malloc()`. Sau lời gọi `malloc()`, chúng ta kiểm tra return value và phát hiện lời gọi thất bại, thể hiện qua return value là null. Cuối cùng, chúng ta in giá trị parameter của lời gọi `malloc()` và thấy chương trình đang yêu cầu một memory region rất lớn (100 triệu byte), khiến yêu cầu thất bại.

Mặc dù đơn giản, các ví dụ GDB trong phần này sẽ giúp người mới sử dụng GDB hiệu quả ngay. Rất ít người thật sự làm chủ GDB vì công cụ này phức tạp và có nhiều khả năng. Phần 13.2, “Data Display Debugger”, giới thiệu một graphical front end cho GDB có thể giúp việc làm quen dễ dàng hơn nếu bạn chưa quen dùng GDB.

Một lưu ý cuối về GDB: chắc hẳn bạn đã nhận thấy nhiều banner line mà GDB hiển thị trên console khi được gọi lần đầu, như trong Listing 13-1. Như đã nói, trong các ví dụ này chúng ta sử dụng cross-gdb từ Monta Vista embedded Linux distribution. Các banner line chứa một thông tin thiết yếu mà lập trình viên embedded phải chú ý: đặc tả host và target của GDB. Trong Listing 13-1, chúng ta thấy output sau khi gọi GDB:

```
This GDB was configured as “--host=i686-pc-linux-gnu -
target=armv5teb-montavista-linuxeabi”
```

Trong trường hợp này, chúng ta gọi một phiên bản GDB được biên dịch để chạy trên Linux PC, cụ thể là máy i686 chạy GNU/Linux operating system. Một điểm cũng quan trọng không kém là phiên bản GDB này được biên dịch để debug ARM binary code do armv5teb big endian toolchain tạo ra.

Một trong những lỗi phổ biến nhất của người mới phát triển embedded là dùng sai GDB khi cố debug target executable. Nếu có điều gì hoạt động không đúng, bạn nên kiểm tra ngay cấu hình GDB để bảo đảm cấu hình đó phù hợp với môi trường của mình. Bạn không thể dùng native GDB để debug target code!

## 13.2 Data Display Debugger

Data Display Debugger (DDD), được trình bày trong Hình 13-1, là graphical front end cho GDB và các debugger command-line khác. DDD có nhiều tính năng nâng cao ngoài việc chỉ xem source code và đi qua từng bước trong debug session.

![Figure 13-1](images/ch13/fig13-01.png)

HÌNH 13-1 Data Display Debugger

Gọi DDD như sau:

```
$ ddd --debugger xscale_be-gdb webs
```

Nếu thiếu flag `--debugger`, DDD sẽ thử gọi native GDB trên development host. Đây không phải điều bạn muốn nếu dự định debug ứng dụng trên target system. Argument thứ hai trên command line của DDD là chương trình bạn sẽ debug. Xem man page DDD để biết thêm chi tiết.

Sử dụng command tool như trong Hình 13-1, bạn có thể đi qua từng bước chương trình. Bạn có thể đặt breakpoint bằng giao diện đồ họa hoặc qua GDB console window ở phía dưới màn hình DDD. Để debug target, trước hết bạn phải kết nối debugger đến target system như trong Listing 13-4, bằng lệnh `target`. Lệnh này được chạy trong GDB window trên màn hình chính của DDD.

Khi đã kết nối đến target, bạn có thể thực thi các lệnh tương tự trình tự vừa trình bày để cô lập nguyên nhân chương trình thất bại. Hình 13-2 trình bày màn hình DDD ở giai đoạn sau của debugging session này.

![Figure 13-2](images/ch13/fig13-02.png)

HÌNH 13-2 Debug session trong DDD

Chú ý rằng trong Hình 13-2, chúng ta đã bắt đầu hiển thị một số program variable quan trọng có thể giúp khoanh vùng nguyên nhân segmentation fault. Chúng ta có thể theo dõi những variable này trong khi đi qua từng bước chương trình bằng command tool trong hình.

DDD là một graphical front end mạnh mẽ cho GDB. Công cụ này tương đối dễ sử dụng và được hỗ trợ rộng rãi trên nhiều development host. Xem phần cuối chương để tìm link đến tài liệu GNU DDD.

Cần lưu ý rằng theo thời gian, Eclipse đã làm lu mờ DDD (tác giả cố ý chơi chữ với tên Eclipse!) và trở thành debugger được ưu tiên lựa chọn. Khuôn khổ cuốn sách không cho phép trình bày chi tiết Eclipse. Các tài liệu tham khảo về Eclipse được liệt kê ở cuối chương nếu bạn muốn tìm hiểu thêm.

## 13.3 cbrowser/cscope

Chúng ta giới thiệu `cbrowser` vì hỗ trợ cho công cụ tiện dụng này đã được đưa vào Linux kernel source tree. `cbrowser` là một công cụ duyệt source-code đơn giản, giúp dễ dàng điều hướng trong source tree lớn bằng cách lần theo symbol. Một số distribution, chẳng hạn Ubuntu, có `cbrowser` trong repository, nhưng những distribution khác như các bản Fedora gần đây thì không. Trên Ubuntu, chỉ cần nhập:

```
$ sudo apt-get install cbrowser
```

Linux kernel makefile hỗ trợ build database mà `cbrowser` dùng. Đây là lời gọi mẫu từ Linux kernel snapshot gần đây:

```
$ make ARCH=powerpc CROSS_COMPILE=ppc_82xx- cscope
```

Thao tác này tạo symbol database `cscope` mà `cbrowser` sử dụng. `cscope` là engine; `cbrowser` là graphical user interface. Bạn có thể dùng riêng `cscope` nếu muốn. Công cụ này hoạt động theo kiểu command-line-driven và rất mạnh, nhưng không thật sự nhanh hoặc dễ dàng bằng khi điều hướng source tree lớn trong thời đại point-and-click. Nếu `vi` vẫn là editor yêu thích, có lẽ `cscope` rất phù hợp với bạn!

Để gọi `cbrowser`, hãy chuyển vào directory chứa database `cscope`, rồi nhập lệnh `cbrowser` không có argument. Hình 13-3 minh họa một session mẫu. Bạn có thể đọc thêm về cả hai công cụ hữu ích này trong các tài liệu tham khảo được liệt kê ở phần cuối.

![Figure 13-3](images/ch13/fig13-03.png)

HÌNH 13-3 `cbrowser` hoạt động

## 13.4 Công cụ tracing và profiling

Nhiều công cụ hữu ích có thể cung cấp các góc nhìn khác nhau về hệ thống. Một số công cụ cung cấp góc nhìn high-level: bạn có thể biết những process nào đang chạy trên hệ thống và process nào đang sử dụng nhiều CPU bandwidth nhất. Những công cụ khác cung cấp phân tích chi tiết, chẳng hạn memory đang được cấp phát ở đâu hoặc, hữu ích hơn nữa, đang bị leak ở đâu. Một vài phần tiếp theo giới thiệu những tool và utility quan trọng nhất trong nhóm này. Khuôn khổ sách chỉ cho phép giới thiệu sơ lược các công cụ; tài liệu tham khảo được cung cấp ở những chỗ thích hợp để bạn tìm hiểu chi tiết hơn.

### 13.4.1 strace

`strace` là một trace utility hữu ích có mặt trong gần như mọi Linux distribution. `strace` thu thập và hiển thị thông tin cho từng kernel system call mà một chương trình ứng dụng Linux thực thi. `strace` đặc biệt tiện dụng vì có thể chạy trên những chương trình không có sẵn source code. Bạn không cần biên dịch chương trình với debug symbol như khi dùng GDB. Hơn nữa, `strace` có thể là một công cụ học tập giúp hiểu rất sâu. Như man page viết, “Sinh viên, hacker và những người overly-curious sẽ thấy rằng có thể học được rất nhiều về một hệ thống và các system call của nó chỉ bằng cách trace ngay cả những chương trình thông thường.”

Trong khi chuẩn bị sample software cho phần GDB trước đó trong chương, tôi quyết định sử dụng một software project mà mình chưa quen: một phiên bản đầu tiên của GoAhead embedded web server. Lần đầu thử biên dịch và link project này đã mang lại một ví dụ thú vị cho `strace`. Khởi chạy ứng dụng từ command line chỉ âm thầm trả quyền điều khiển về console. Không có error message nào xuất hiện, và xem system log cũng không tìm được manh mối. Ứng dụng đơn giản là không chịu chạy.

`strace` nhanh chóng xác định được vấn đề. Listing 13-5 hiển thị output khi gọi `strace` trên ứng dụng này. Nhiều dòng trong output đã bị lược bỏ do giới hạn dung lượng trình bày. Output chưa biên tập dài hơn một trăm dòng.

LISTING 13-5 Output `strace`: GoAhead Web Demo

```
01 root@coyote:$ strace ./websdemo
02 execve(“./websdemo”, [“./websdemo”], [/* 14 vars */]) = 0
03 uname({sys=”Linux”, node=”coyote”, ...}) = 0
04 brk(0)                                  = 0x10031050
05 open(“/etc/ld.so.preload”, O_RDONLY)    = -1 ENOENT (No such file or
 directory)
06 open(“/etc/ld.so.cache”, O_RDONLY)      = -1 ENOENT (No such file or
 directory)
07 open(“/lib/libc.so.6”, O_RDONLY)        = 3
08 read(3, “\177ELF\1\2\1\0\0\0\0\0\0\0\0\0\0\3\0\24\0\0\0\1\0\1\322”..., 1024) =
1024
09 fstat64(0x3, 0x7fffefc8)                = 0
10 mmap(0xfe9f000, 1379388, PROT_READ|PROT_EXEC, MAP_PRIVATE, 3, 0) = 0xfe9f000
11 mprotect(0xffd8000, 97340, PROT_NONE)   = 0
12 mmap(0xffdf000, 61440, PROT_READ|PROT_WRITE|PROT_EXEC,MAP_PRIVATE|MAP_FIXED, 3,
0x130000) = 0xffdf000
13 mmap(0xffee000, 7228, PROT_READ|PROT_WRITE|PROT_EXEC,
MAP_PRIVATE|MAP_FIXED| MAP_ANONYMOUS, -1, 0) = 0xffee000
14 close(3)                                = 0
15 brk(0)                                  = 0x10031050
16 brk(0x10032050)                         = 0x10032050
17 brk(0x10033000)                         = 0x10033000
18 brk(0x10041000)                         = 0x10041000
19 rt_sigaction(SIGPIPE, {SIG_IGN}, {SIG_DFL}, 8) = 0
20 stat(“./umconfig.txt”, 0x7ffff9b8)      = -1 ENOENT (No such file or
directory)
21 uname({sys=”Linux”, node=”coyote”, ...}) = 0
22 gettimeofday({3301, 178955}, NULL)      = 0
23 getpid()                                = 156
24 open(“/etc/resolv.conf”, O_RDONLY)      = 3
25 fstat64(0x3, 0x7fffd7f8)                = 0
26 mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) =
0x30017000
27 read(3, “#\n# resolv.conf  This file is th”..., 4096) = 83
28 read(3, “”, 4096)                       = 0
29 close(3)                                = 0
...   <<< Lines 30-81 removed for brevity
82 socket(PF_INET, SOCK_DGRAM, IPPROTO_IP) = 3
83 connect(3, {sa_family=AF_INET, sin_port=htons(53),
sin_addr=inet_addr(“0.0.0.0”)}, 28) = 0
84 send(3, “\267s\1\0\0\1\0\0\0\0\0\0\6coyotea\0\0\1\0\1”, 24, 0) = 24
85 gettimeofday({3301, 549664}, NULL)      = 0
86 poll([{fd=3, events=POLLIN, revents=POLLERR}], 1, 5000) = 1
87 ioctl(3, 0x4004667f, 0x7fffe6a8)        = 0
88 recvfrom(3, 0x7ffff1f0, 1024, 0, 0x7fffe668, 0x7fffe6ac) = -1
ECONNREFUSED (Connection refused)
89 close(3)                                = 0
90 socket(PF_INET, SOCK_DGRAM, IPPROTO_IP) = 3
91 connect(3, {sa_family=AF_INET, sin_port=htons(53),
sin_addr=inet_addr(“0.0.0.0”)}, 28) = 0
92 send(3, “\267s\1\0\0\1\0\0\0\0\0\0\6coyote\0\0\1\0\1”, 24, 0) = 24
93 gettimeofday({3301, 552839}, NULL)      = 0
494 poll([{fd=3, events=POLLIN, revents=POLLERR}], 1, 5000) = 1
95 ioctl(3, 0x4004667f, 0x7fffe6a8)        = 0
96 recvfrom(3, 0x7ffff1f0, 1024, 0, 0x7fffe668, 0x7fffe6ac) = -1
ECONNREFUSED (Connection refused)
97 close(3)                                = 0
98 exit(-1)                                = ?
99 root@coyote:/home/websdemo#
```

Số dòng đã được thêm vào output của `strace` để listing dễ đọc hơn. Ứng dụng được khởi chạy dưới strace ở dòng 01. Với cách sử dụng đơn giản nhất, chỉ cần đặt lệnh `strace` ngay trước tên chương trình mà bạn muốn khảo sát. Đó là cách tạo ra output trong Listing 13-5.

Mỗi dòng trong trace này biểu thị một kernel system call riêng biệt mà ứng dụng `websdemo` gọi vào kernel. Chúng ta không cần phân tích và hiểu từng dòng trace, mặc dù làm vậy sẽ rất bổ ích. Chúng ta đang tìm những bất thường có thể giúp xác định chính xác vì sao chương trình không chạy. Trong một số dòng đầu, môi trường thực thi của chương trình được chuẩn bị. Chúng ta thấy một số system call `open()` đến `/etc/ld.so.*`; đây là Linux dynamic linker-loader (`ld.so`) đang thực hiện công việc của nó. Thực tế, dòng 06 là một manh mối cho thấy embedded board trong ví dụ chưa được cấu hình đúng. Cần tạo linker cache file bằng cách chạy `ldconfig`. (Linker cache tăng đáng kể tốc độ tìm kiếm shared library reference.) Sau đó, vấn đề này được giải quyết bằng cách chạy `ldconfig` trên target.[^3]

Các dòng tiếp theo đến dòng 19 thực hiện thêm các công việc chuẩn bị cơ bản, chủ yếu do loader và quá trình khởi tạo `libc` thực hiện. Chú ý ở dòng 20, chương trình tìm configuration file nhưng không thấy. Đây có thể là một vấn đề quan trọng khi chúng ta đã chạy được software. Bắt đầu từ dòng 24, chương trình thiết lập và cấu hình những networking resource phù hợp mà nó cần. Các dòng 24 đến 29 mở và đọc một Linux system file chứa chỉ dẫn để DNS service resolve hostname. Hoạt động cấu hình local network tiếp tục đến dòng 81. Phần lớn hoạt động này là các bước thiết lập và cấu hình network cần thiết để xây dựng networking infrastructure cho chính chương trình. Phần listing này đã được lược bỏ để nội dung ngắn gọn và rõ ràng hơn.

Đặc biệt chú ý hoạt động network bắt đầu ở dòng 82. Tại đây, chương trình cố thiết lập TCP/IP connection đến một IP address gồm toàn số 0. Dòng 82 được trình bày lại dưới đây để tiện theo dõi:

```
socket(PF_INET, SOCK_DGRAM, IPPROTO_IP) = 3
```

Có một vài điểm đáng chú ý về Listing 13-5. Chúng ta có thể không biết mọi chi tiết của từng system call, nhưng vẫn hình dung được những gì đang xảy ra. System call `socket()` tương tự lời gọi `open()` của file system. Return value, được biểu thị bằng dấu `=` trong trường hợp này, là một Linux file descriptor. Nhờ biết điều đó, chúng ta có thể liên hệ hoạt động từ dòng 82 đến system call `close()` ở dòng 89 với file descriptor 3.

Chúng ta quan tâm đến nhóm system call liên quan này vì thấy error message ở dòng 88: `Connection refused`. Lúc này, chúng ta vẫn chưa biết vì sao chương trình không chạy, nhưng điều này có vẻ bất thường. Hãy tìm hiểu. Dòng 82, lời gọi system call `socket()`, thiết lập một endpoint cho IP communication. Dòng 83 khá lạ vì cố thiết lập connection đến một remote endpoint (socket) có IP address gồm toàn số 0. Không cần là chuyên gia network, chúng ta cũng có thể nghi ngờ đây là nguyên nhân gây rắc rối.[^4] Dòng 83 còn cung cấp một manh mối quan trọng khác: port parameter được đặt thành 53. Tìm nhanh các TCP/IP port number trên Internet cho biết port 53 dành cho Domain Name Service (DNS).

Dòng 84 cung cấp thêm một manh mối. Board của chúng ta có hostname là coyote. Bạn có thể thấy tên này trong command prompt ở dòng 01 của Listing 13-5. Có vẻ hoạt động này là một DNS lookup đang thất bại đối với hostname của board. Để thử nghiệm, chúng ta thêm một entry vào file `/etc/hosts`[^5] trên target system, nhằm liên kết hostname được định nghĩa cục bộ với IP address được gán cục bộ cho board, như sau:

```
coyote  192.168.1.21        #The IP address we assigned
```

Thế là chương trình bắt đầu hoạt động bình thường. Mặc dù chúng ta có thể không biết chính xác vì sao điều này làm chương trình thất bại, trong khi chuyên gia TCP/IP networking có thể biết, output của `strace` đã dẫn chúng ta đến việc DNS lookup cho tên board đang thất bại. Sau khi sửa vấn đề đó, chương trình khởi động suôn sẻ và bắt đầu phục vụ web page. Nhắc lại, đây là chương trình mà chúng ta không có source code để tham khảo và binary image không được biên dịch kèm symbol. Sử dụng `strace`, chúng ta đã xác định được nguyên nhân chương trình thất bại và triển khai giải pháp.

### 13.4.2 Các biến thể strace

Tiện ích `strace` có nhiều command-line option. Một trong những khả năng hữu ích hơn cả là chọn một tập con system call để trace. Ví dụ, nếu chỉ muốn xem hoạt động network-related của một process cụ thể, hãy chạy lệnh sau:

```
$ strace -e trace=network process_name
```

Lệnh này tạo trace của tất cả system call network-related, chẳng hạn `socket()`, `connect()`, `recvfrom()` và `send()`. Đây là một cách hiệu quả để xem hoạt động network của một chương trình cụ thể. Một số tập con khác cũng có sẵn. Ví dụ, bạn có thể chỉ xem các hoạt động file-related của chương trình, với `open()`, `close()`, `read()`, `write()`, v.v. Các tập con khác bao gồm system call process-related, system call signal-related và system call IPC-related.

Cần lưu ý rằng `strace` có thể trace các chương trình sinh thêm process. Gọi `strace` với option `-f` yêu cầu `strace` theo dõi các child process được tạo bằng system call `fork()`. Lệnh `strace` có rất nhiều khả năng. Cách tốt nhất để thành thạo tiện ích mạnh mẽ này là sử dụng nó. Hãy chủ động tìm và đọc open source documentation mới nhất cho công cụ này cũng như các công cụ khác mà chúng tôi trình bày. Trong trường hợp này, `man strace` trên phần lớn Linux host sẽ cung cấp đủ tài liệu để bạn thử nghiệm suốt một buổi chiều!

Một cách sử dụng `strace` rất hữu ích là dùng option `-c`. Option này tạo bản profiling high-level của ứng dụng. Với option `-c`, `strace` tích lũy số liệu thống kê cho từng system call: số lần được gọi, số lần trả về lỗi và thời gian dành cho mỗi system call. Listing 13-6 là một ví dụ chạy `strace -c` trên webs demo trong ví dụ trước.

LISTING 13-6 Profiling bằng `strace`

```
root@coyote$ strace -c ./webs
% time     seconds  usecs/call     calls    errors syscall
------ ----------- -----------  ---------  --------- --------
 29.80    0.034262         189       181           send
 18.46    0.021226        1011        21        10 open
 14.11    0.016221         130       125           read
 11.87    0.013651         506        27         8 stat64
  5.88    0.006762         193        35           select
  5.28    0.006072          76        80           fcntl64
  3.47    0.003994          65        61           time
  2.79    0.003205        3205         1           execve
  1.71    0.001970          90        22         3 recv
  1.62    0.001868          85        22           close
  1.61    0.001856         169        11           shutdown
  1.38    0.001586         144        11           accept
  0.41    0.000470          94         5           mmap2
  0.26    0.000301         100         3           mprotect
  0.24    0.000281          94         3           brk
  0.17    0.000194         194         1         1 access
  0.13    0.000150         150         1           lseek
  0.12    0.000141          47         3           uname
  0.11    0.000132         132         1           listen
  0.11    0.000128         128         1           socket
  0.09    0.000105          53         2           fstat64
  0.08    0.000097          97         1           munmap
  0.06    0.000064          64         1           getcwd
  0.05    0.000063          63         1           bind
  0.05    0.000054          54         1           setsockopt
  0.04    0.000048          48         1           rt_sigaction
  0.04    0.000046          46         1           gettimeofday
  0.03    0.000038          38         1           getpid
------ -----------  -----------  --------- --------- -----------
100.00    0.114985                   624        22 total
```

Đây là một cách rất hữu ích để có góc nhìn high-level về những nơi ứng dụng tiêu tốn thời gian và những nơi xảy ra lỗi. Một số lỗi có thể là một phần bình thường trong hoạt động của ứng dụng, nhưng những lỗi khác có thể làm mất thời gian theo cách bạn không dự kiến. Từ Listing 13-6, chúng ta thấy syscall có thời lượng dài nhất là `execve()`, lời gọi mà shell dùng để khởi chạy ứng dụng. Như bạn thấy, nó chỉ được gọi một lần. Một quan sát thú vị khác là system call `send()` được sử dụng thường xuyên nhất. Điều này hợp lý vì ứng dụng là một web server nhỏ.

Hãy nhớ rằng, cũng như các công cụ khác đang thảo luận, `strace` phải được biên dịch cho target architecture. `strace` được thực thi trên target board, thay vì development host. Bạn phải sử dụng phiên bản tương thích với architecture của mình. Nếu mua commercial embedded Linux distribution, bạn nên bảo đảm tiện ích này được cung cấp cho architecture đã chọn.

### 13.4.3 ltrace

Hai tiện ích `ltrace` và `strace` có quan hệ chặt chẽ với nhau. `ltrace` theo dõi library call theo cách mà `strace` theo dõi system call. Cách gọi cũng tương tự: bạn đặt tiện ích tracer trước chương trình cần trace, như sau:

```
$ ltrace ./example
```

Listing 13-7 tái hiện output `ltrace` trên chương trình mẫu nhỏ thực thi vài standard C library call.

LISTING 13-7 Output `ltrace` mẫu

```
$ ltrace ./example
__libc_start_main(0x8048594, 1, 0xbffff944, 0x80486b4, 0x80486fc <unfinished ...>
malloc(256)                                      = 0x804a008
getenv(“HOME”)                                   = “/home/chris”
strncpy(0x804a008, “/home”, 5)                   = 0x804a008
fopen(“foo.txt”, “w”)                            = 0x804a110
printf(“$HOME = %s\n”, “/home/chris”$HOME = /home/chris
)            = 20
fprintf(0x804a110, “$HOME = %s\n”, “/home/chris”) = 20
fclose(0x804a110)                                = 0
remove(“foo.txt”)                                = 0
free(0x804a008)                                  = <void>
+++ exited (status 0) +++
$
```

Đối với mỗi library call, công cụ hiển thị tên lời gọi cùng các phần khác nhau của parameter được truyền vào. Tương tự `strace`, sau đó công cụ hiển thị return value của library call. Cũng như `strace`, công cụ này có thể được dùng cho những chương trình không có sẵn source code.

Tương tự `strace`, nhiều switch có thể thay đổi hành vi của `ltrace`. Bạn có thể hiển thị giá trị program counter ở mỗi library call, điều này giúp hiểu luồng thực thi của ứng dụng. Cũng như `strace`, bạn có thể dùng `-c` để tích lũy và báo cáo số liệu thống kê về số lần gọi, lỗi và thời gian, tạo thành một profiling tool đơn giản nhưng hữu ích. Listing 13-8 hiển thị kết quả chạy chương trình mẫu đơn giản của chúng ta với option `-c`.

LISTING 13-8 Profiling bằng `ltrace`

```
$ ltrace -c ./example
$HOME = /home/chris
% time     seconds  usecs/call     calls      function
------ -----------  ----------- --------- ----------------
 24.16    0.000231         231         1 printf
 16.53    0.000158         158         1 fclose
 16.00    0.000153         153         1 fopen
 13.70    0.000131         131         1 malloc
 10.67    0.000102         102         1 remove
  9.31    0.000089          89         1 fprintf
  3.35    0.000032          32         1 getenv
  3.14    0.000030          30         1 free
  3.14    0.000030          30         1 strncpy
------ ----------- ----------- --------- ----------------
 100.00    0.000956                     9 total
```

Công cụ `ltrace` chỉ sử dụng được với những chương trình đã được biên dịch để dùng dynamically linked shared library object. Đây thường là mặc định, nên trừ khi bạn chủ động chỉ định `-static` khi biên dịch, bạn có thể sử dụng `ltrace` trên binary kết quả. Cũng tương tự `strace`, bạn phải dùng một binary `ltrace` được biên dịch cho target architecture. Các tiện ích này chạy trên target, thay vì host development system.

### 13.4.4 ps

Có lẽ ngoại trừ `strace` và `ltrace`, không công cụ nào bị lập trình viên embedded system bỏ quên thường xuyên hơn `top` và `ps`. Với vô số option của mỗi tiện ích, chúng ta có thể dễ dàng dành cả một chương cho những công cụ system-profiling hữu ích này. Chúng có mặt trên gần như mọi target mà bạn yêu thích trong các embedded Linux distribution.

Cả hai tiện ích đều sử dụng file system `/proc`, như mô tả trong Chương 9, “File system”. Bạn có thể tự lấy phần lớn thông tin mà chúng cung cấp từ file system `/proc` nếu biết cần tìm gì và cách phân tích thông tin thu được. Các công cụ này trình bày thông tin dưới dạng human-readable thuận tiện.

Tiện ích `ps` liệt kê mọi process đang chạy trên một máy. Tuy nhiên, công cụ này rất linh hoạt và có thể được điều chỉnh để cung cấp nhiều dữ liệu hữu ích về trạng thái máy cùng các process đang chạy trên đó. Ví dụ, `ps` có thể hiển thị scheduling policy của mỗi process. Điều này đặc biệt hữu ích cho những hệ thống sử dụng real-time process.

Khi không có option, `ps` hiển thị tất cả process có cùng user ID với người dùng gọi lệnh, đồng thời chỉ hiển thị những process gắn với terminal nơi lệnh được chạy. Điều này hữu ích khi người dùng đó đã khởi chạy nhiều job từ terminal đó.

Việc truyền option cho `ps` có thể gây nhầm lẫn, vì `ps` hỗ trợ nhiều chuẩn khác nhau, chẳng hạn POSIX và UNIX, cùng ba kiểu option riêng biệt: BSD, UNIX và GNU. Nhìn chung, BSD option gồm một hoặc nhiều chữ cái, không có dấu gạch ngang. UNIX option dùng tổ hợp dash-letter quen thuộc, còn GNU dùng long argument format đứng sau hai dấu gạch ngang. Tham khảo man page để biết chi tiết về bản triển khai `ps` của bạn.

Mỗi người dùng `ps` có lẽ đều có một cách gọi yêu thích. Một cách gọi general-purpose đặc biệt hữu ích là `ps aux`, hiển thị mọi process trên hệ thống. Listing 13-9 là ví dụ từ một embedded target board đang chạy.

LISTING 13-9 Danh sách process

```
$ ps aux
USER      PID %CPU %MEM    VSZ   RSS TTY   STAT START   TIME COMMAND
root        1  0.0  0.8   1416   508 ?     S    00:00   0:00 init [3]
root        2  0.0  0.0      0     0 ?     S<   00:00   0:00 [ksoftirqd/0]
root        3  0.0  0.0      0     0 ?     S<   00:00   0:00 [desched/0]
root        4  0.0  0.0      0     0 ?     S<   00:00   0:00 [events/0]
root        5  0.0  0.0      0     0 ?     S<   00:00   0:00 [khelper]
root       10  0.0  0.0      0     0 ?     S<   00:00   0:00 [kthread]
root       21  0.0  0.0      0     0 ?     S<   00:00   0:00 [kblockd/0]
root       62  0.0  0.0      0     0 ?     S    00:00   0:00 [pdflush]
root       63  0.0  0.0      0     0 ?     S    00:00   0:00 [pdflush]
root       65  0.0  0.0      0     0 ?     S<   00:00   0:00 [aio/0]
root       36  0.0  0.0      0     0 ?     S    00:00   0:00 [kapmd]
root       64  0.0  0.0      0     0 ?     S    00:00   0:00 [kswapd0]
root      617  0.0  0.0      0     0 ?     S    00:00   0:00 [mtdblockd]
root      638  0.0  0.0      0     0 ?     S    00:00   0:00 [rpciod]
bin       834  0.0  0.7   1568   444 ?     Ss   00:00   0:00 /sbin/portmap
root      861  0.0  0.0      0     0 ?     S    00:00   0:00 [lockd]
root      868  0.0  0.9   1488   596 ?     Ss   00:00   0:00 /sbin/syslogd -r
root      876  0.0  0.7   1416   456 ?     Ss   00:00   0:00 /sbin/klogd -x
root      884  0.0  1.1   1660   700 ?     Ss   00:00   0:00 /usr/sbin/rpc.statd
root      896  0.0  0.9   1668   584 ?     Ss   00:00   0:00 /usr/sbin/inetd
root      909  0.0  2.2   2412  1372 ?     Ss+  00:00   0:00 -bash
telnetd   953  0.3  1.1   1736   732 ?     S    05:58   0:00 in.telnetd
root      954  0.2  2.1   2384  1348 pts/0 Ss   05:58   0:00 -bash
root      960  0.0  1.2   2312   772 pts/0 R+   05:59   0:00 ps aux
```

Đây chỉ một trong nhiều cách xem output bằng `ps`. Các cột như sau:

- Field USER và process ID (PID) là self-explanatory.

- Field %CPU biểu thị phần trăm sử dụng CPU tính từ khi process bắt đầu tồn tại; vì vậy, tổng CPU usage gần như không bao giờ bằng 100 phần trăm.

- Field %MEM chỉ tỷ lệ resident memory footprint của process so với tổng physical memory sẵn có.

- Field VSZ là virtual memory size process theo kilobyte.

- RSS là resident set size, chỉ nonswapped physical memory process dùng, cũng theo kilobyte.

- TTY là controlling terminal của process.

Phần lớn process trong ví dụ này không gắn với một controlling terminal. Lệnh `ps` tạo Listing 13-9 được chạy từ một telnet session, như terminal device `pts/0` cho thấy.

Field STAT mô tả trạng thái của process tại thời điểm tạo snapshot này. S biểu thị process đang sleeping, chờ một loại sự kiện nào đó, thường là I/O. R biểu thị process ở trạng thái runnable, nghĩa là scheduler có thể giao quyền sử dụng CPU cho nó nếu không có công việc ưu tiên cao hơn đang chờ. Dấu ngoặc nhọn cạnh chữ biểu thị trạng thái cho biết process này có mức ưu tiên cao hơn.

Cột cuối cùng là command name. Những tên nằm trong ngoặc vuông là kernel thread. Còn nhiều symbol và option khác; tham khảo man page của `ps` để biết đầy đủ chi tiết.

### 13.4.5 top

Trong khi `ps` tạo snapshot one-time của hệ thống hiện tại, `top` lấy snapshot định kỳ về trạng thái hệ thống và các process. Tương tự `ps`, `top` có nhiều command-line option và configuration option. Công cụ này có tính tương tác và có thể được cấu hình lại trong khi chạy để tùy chỉnh nội dung hiển thị theo nhu cầu cụ thể của bạn.

Khi được gọi không có option, `top` hiển thị mọi process đang chạy theo cách rất giống lệnh `ps aux` trong Listing 13-9, cập nhật mỗi 3 giây. Tất nhiên, điều này và nhiều khía cạnh khác của `top` đều là user-configurable. Một vài dòng đầu màn hình `top` hiển thị thông tin hệ thống, cũng cập nhật mỗi 3 giây. Thông tin này gồm system uptime, số người dùng, số lượng và trạng thái process, cùng nhiều nội dung khác.

Listing 13-10 cho `top` cấu hình mặc định, từ thực thi `top` trên command line không parameter.

LISTING 13-10 Display mặc định `top`

```
top - 06:23:14 up  6:23,  2 users,  load average: 0.00, 0.00, 0.00
Tasks:  24 total,   1 running,  23 sleeping,   0 stopped,   0 zombie
Cpu(s):  0.0% us,  0.3% sy,  0.0% ni, 99.7% id,  0.0% wa,  0.0% hi,  0.0% si
Mem:     62060k total,    17292k used,    44768k free,        0k buffers
Swap:        0k total,        0k used,        0k free,    11840k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
  978 root      16   0  1924  952  780 R  0.3  1.5   0:01.22 top
    1 root      16   0  1416  508  452 S  0.0  0.8   0:00.47 init
    2 root       5 -10     0    0    0 S  0.0  0.0   0:00.00 ksoftirqd/0
    3 root       5 -10     0    0    0 S  0.0  0.0   0:00.00 desched/0
    4 root      -2  -5     0    0    0 S  0.0  0.0   0:00.00 events/0
    5 root      10  -5     0    0    0 S  0.0  0.0   0:00.09 khelper
   10 root      18  -5     0    0    0 S  0.0  0.0   0:00.00 kthread
   21 root      20  -5     0    0    0 S  0.0  0.0   0:00.00 kblockd/0
   62 root      20   0     0    0    0 S  0.0  0.0   0:00.00 pdflush
   63 root      15   0     0    0    0 S  0.0  0.0   0:00.00 pdflush
   65 root      19  -5     0    0    0 S  0.0  0.0   0:00.00 aio/0
   36 root      25   0     0    0    0 S  0.0  0.0   0:00.00 kapmd
   64 root      25   0     0    0    0 S  0.0  0.0   0:00.00 kswapd0
  617 root      25   0     0    0    0 S  0.0  0.0   0:00.00 mtdblockd
  638 root      15   0     0    0    0 S  0.0  0.0   0:00.34 rpciod
  834 bin       15   0  1568  444  364 S  0.0  0.7   0:00.00 portmap
  861 root      20   0     0    0    0 S  0.0  0.0   0:00.00 lockd
  868 root      16   0  1488  596  504 S  0.0  1.0   0:00.11 syslogd
  876 root      19   0  1416  456  396 S  0.0  0.7   0:00.00 klogd
  884 root      18   0  1660  700  612 S  0.0  1.1   0:00.02 rpc.statd
  896 root      16   0  1668  584  504 S  0.0  0.9   0:00.00 inetd
  909 root      15   0  2412 1372 1092 S  0.0  2.2   0:00.34 bash
  953 telnetd   16   0  1736  736  616 S  0.0  1.2   0:00.27 in.telnetd
  954 root      15   0  2384 1348 1096 S  0.0  2.2   0:00.16 bash
```

Các cột mặc định trong Listing 13-10 lần lượt là PID, user, process priority, process nice value, lượng virtual memory mà process sử dụng, resident memory footprint, lượng shared memory mà task sử dụng và những field khác giống các field đã mô tả trong ví dụ `ps` trước đó.

Khuôn khổ sách chỉ cho phép giới thiệu sơ lược những tiện ích hữu ích này. Bạn nên dành một buổi chiều đọc man page của `top` và `ps` để khám phá những khả năng phong phú của chúng.

### 13.4.6 mtrace

`mtrace` là một tiện ích đơn giản phân tích và báo cáo các lời gọi `malloc()`, `realloc()` và `free()` trong ứng dụng. Công cụ này dễ dùng và có thể giúp phát hiện vấn đề trong ứng dụng. Cũng như các userland tool khác đã mô tả trong chương, `mtrace` phải được cấu hình và biên dịch cho target architecture. `mtrace` là một library thay thế `malloc` được cài trên target. Ứng dụng bật library này bằng một function call đặc biệt. Embedded Linux distribution của bạn nên có package `mtrace`.

Để minh họa tiện ích này, chúng ta tạo một chương trình đơn giản tạo dữ liệu động trên một linked list đơn giản. Mỗi list item được tạo động, và mỗi data item đặt trên list cũng vậy. Listing 13-11 trình bày list structure đơn giản này.

LISTING 13-11 Linear linked list đơn giản

```
struct blist_s {
  struct blist_s *next;
  char *data_item;
  int item_size;
  int index;
};
```

Mỗi list item được tạo động bằng `malloc()` như sau rồi đặt cuối linked list:

```
struct blist_s *p = malloc( sizeof(struct blist_s) );
```

Mỗi data item variable-sized trong list cũng được tạo động và thêm vào list item trước khi item được đặt ở cuối list. Như vậy, mỗi list item được tạo bằng hai lời gọi `malloc()`: một cho chính list item, được biểu diễn bằng `struct` `blist_s` vừa trình bày, và một cho data item có kích thước thay đổi. Sau đó, chúng ta tạo 10.000 record trong list chứa string data có kích thước thay đổi, dẫn đến 20.000 lời gọi `malloc()`.

Để dùng `mtrace`, phải đáp ứng ba điều kiện:

- Source file phải include header file `mcheck.h`.

- Ứng dụng phải gọi `mtrace()` cài handler.

- Environment variable `MALLOC_TRACE` phải chỉ tên file ghi được để nhận trace data.

Khi các điều kiện này được đáp ứng, mỗi lời gọi đến một trong những function được trace sẽ tạo một dòng trong raw trace file do `MALLOC_TRACE` định nghĩa. Trace data có dạng như sau:

```
@ ./mt_ex:[0x80486ec] + 0x804a5f8 0x10
```

Dấu `@` báo rằng trace line chứa một địa chỉ hoặc function name. Chương trình đang thực thi tại địa chỉ trong ngoặc vuông, `0x80486ec`. Sử dụng binary utility hoặc debugger, chúng ta có thể dễ dàng liên hệ địa chỉ này với một function. Dấu cộng (`+`) biểu thị đây là lời gọi cấp phát memory. Lời gọi `free()` sẽ được biểu thị bằng dấu trừ. Field tiếp theo cho biết virtual address của memory location đang được cấp phát hoặc giải phóng. Field cuối cùng là kích thước, được đưa vào trong mọi lời gọi cấp phát memory.

Data format này không thật sự user-friendly. Vì vậy, tiện ích `mtrace` có kèm một công cụ phân tích raw trace data và báo cáo mọi điểm không nhất quán. Công cụ phân tích là một Perl script được cung cấp trong package `mtrace`. Trong trường hợp đơn giản nhất, Perl script in một dòng duy nhất với message `No memory leaks`. Listing 13-12 hiển thị output khi phát hiện memory leak.

LISTING 13-12 Báo lỗi `mtrace`

```
$ mtrace ./mt_ex mtrace.log

Memory not freed:
-----------------
   Address     Size     Caller
0x0804aa70     0x0a  at /home/chris/temp/mt_ex.c:64
0x0804abc0     0x10  at /home/chris/temp/mt_ex.c:26
0x0804ac60     0x10  at /home/chris/temp/mt_ex.c:26
0x0804acc8     0x0a  at /home/chris/temp/mt_ex.c:64
```

Như bạn thấy, công cụ đơn giản này có thể giúp phát hiện nguy cơ trước khi sự cố xảy ra, cũng như tìm ra vấn đề khi sự cố đã xuất hiện. Chú ý rằng Perl script hiển thị filename và line number của mỗi lời gọi `malloc()` không có lời gọi `free()` tương ứng cho memory location đó. Để làm được điều này, executable file phải chứa debugging information, được tạo bằng cách truyền flag `-g` cho compiler. Nếu không tìm thấy debugging information, script chỉ báo cáo địa chỉ của function gọi `malloc()`.

### 13.4.7 dmalloc

`dmalloc` tiếp tục ở nơi `mtrace` dừng lại. Package `mtrace` đơn giản, tương đối ít can thiệp và hữu ích nhất để phát hiện những tình huống mất cân bằng giữa `malloc` và free. Package `dmalloc` cho phép bạn phát hiện phạm vi lỗi dynamic memory-management rộng hơn nhiều. So với `mtrace`, `dmalloc` can thiệp rất mạnh. Tùy cấu hình, `dmalloc` có thể khiến ứng dụng chạy cực kỳ chậm. Đây chắc chắn không phải công cụ phù hợp nếu bạn nghi ngờ memory error do race condition hoặc những vấn đề timing khác. `dmalloc`, và `mtrace` ở mức thấp hơn, chắc chắn sẽ thay đổi timing của ứng dụng.

`dmalloc` là một công cụ memory-analysis động rất mạnh. Công cụ này cho phép cấu hình linh hoạt nên cũng tương đối phức tạp. Bạn cần dành thời gian học và làm chủ nó. Tuy nhiên, từ QA testing đến sửa bug, nó có thể trở thành một trong những development tool yêu thích của bạn.

`dmalloc` là debug library thay thế `malloc`. Để dùng `dmalloc`, phải đáp ứng:

- Application code phải include header file `dmalloc.h`.

- Ứng dụng phải link với library `dmalloc`.

- Library, utility `dmalloc` phải cài trên embedded target.

- Những environment variable nhất định mà library `dmalloc` tham chiếu phải được định nghĩa trước khi bạn chạy ứng dụng trên target.

Mặc dù không hoàn toàn bắt buộc, bạn nên include `dmalloc.h` trong chương trình ứng dụng. Việc này cho phép `dmalloc` đưa thông tin file và line number vào output.

Hãy link ứng dụng với library `dmalloc` mà bạn lựa chọn. Package `dmalloc` có thể được cấu hình để tạo ra một số library khác nhau, tùy các lựa chọn của bạn khi cấu hình package. Những ví dụ sau sử dụng shared library object `libdmalloc.` `so`. Đặt library này, hoặc một symlink trỏ đến nó, trong path mà compiler có thể tìm thấy. Lệnh biên dịch ứng dụng có thể tương tự như sau:

```
$ ppc_82xx-gcc -g -Wall -o mtest_ex -L../dmalloc-5.4.2/ -ldmalloc mtest_ex.c
```

Command line này giả định rằng bạn đã đặt library `dmalloc` (`libdmalloc.` `so`) tại một vị trí được tìm kiếm bằng switch `-L` trên command line, cụ thể là `../dmalloc-5.4.2`, ngay phía trên current directory.

Để cài library `dmalloc` trên target, đặt nó tại vị trí bạn muốn, có thể là `/usr/local/lib`. Bạn có thể cần cấu hình hệ thống để tìm được library này. Trên Power Architecture system mẫu, chúng ta thêm path `/usr/local/lib` vào file `/etc/ld.so.conf`, rồi gọi tiện ích `ldconfig` để cập nhật library search cache.

Bước chuẩn bị cuối cùng là đặt một environment variable mà library `dmalloc` sử dụng để xác định mức debugging sẽ được bật. Environment variable này chứa một debug bit mask kết hợp nhiều tính năng vào một variable duy nhất, thuận tiện cho việc sử dụng. Thiết lập của bạn có thể tương tự như sau:

```
DMALLOC_OPTIONS=debug=0x4f4ed03,inter=100,log=dmalloc.log
```

Ở đây, `debug` là bit mask debug-level, còn `inter` đặt số đếm khoảng cách giữa các lần library `dmalloc` thực hiện kiểm tra toàn diện chính nó và heap. Library `dmalloc` ghi output log vào file được variable `log` chỉ định.

Package `dmalloc` đi kèm một tiện ích tạo environment variable `DMALLOC_OPTIONS` dựa trên các flag được truyền vào. Tài liệu trong package `dmalloc` trình bày nội dung này rất đầy đủ nên chúng ta không lặp lại ở đây. Ví dụ vừa rồi được tạo bằng lời gọi `dmalloc` sau:

```
$ dmalloc -p check-fence -l dmalloc.log -i 100 high
```

Xong các bước, có thể chạy ứng dụng với debug library `dmalloc`.

`dmalloc` tạo output log khá chi tiết. Listing 13-13 trình bày log output mẫu của `dmalloc` cho một chương trình mẫu cố ý tạo một số memory leak.

LISTING 13-13 Log output `dmalloc`

```
2592: 4002: Dmalloc version ‘5.4.2’ from ‘http://dmalloc.com/’
2592: 4002: flags = 0x4f4e503, logfile ‘dmalloc.log’
2592: 4002: interval = 100, addr = 0, seen # = 0, limit = 0
2592: 4002: starting time = 2592
2592: 4002: process pid = 442
2592: 4002: Dumping Chunk Statistics:
2592: 4002: basic-block 4096 bytes, alignment 8 bytes
2592: 4002: heap address range: 0x30015000 to 0x3004f000, 237568 bytes
2592: 4002:     user blocks: 18 blocks, 73652  bytes (38%)
2592: 4002:    admin blocks: 29 blocks, 118784 bytes (61%)
2592: 4002:    total blocks: 47 blocks, 192512 bytes
2592: 4002: heap checked 41
2592: 4002: alloc calls: malloc 2003, calloc 0, realloc 0, free 1999
2592: 4002: alloc calls: recalloc 0, memalign 0, valloc 0
2592: 4002: alloc calls: new 0, delete 0
2592: 4002:   current memory in use: 52 bytes (4 pnts)
2592: 4002:  total memory allocated: 27546 bytes (2003 pnts)
2592: 4002:  max in use at one time: 27546 bytes (2003 pnts)
2592: 4002: max alloced with 1 call: 376 bytes
2592: 4002: max unused memory space: 37542 bytes (57%)
2592: 4002: top 10 allocations:
2592: 4002:  total-size  count in-use-size  count  source
2592: 4002:       16000   1000          32      2  mtest_ex.c:36
2592: 4002:       10890   1000          20      2  mtest_ex.c:74
2592: 4002:         256      1           0      0  mtest_ex.c:154
2592: 4002:       27146   2001          52      4  Total of 3
2592: 4002: Dumping Not-Freed Pointers Changed Since Start:
2592: 4002:  not freed: ‘0x300204e8|s1’ (10 bytes) from ‘mtest_ex.c:74’
2592: 4002:  not freed: ‘0x30020588|s1’ (16 bytes) from ‘mtest_ex.c:36’
2592: 4002:  not freed: ‘0x30020688|s1’ (16 bytes) from ‘mtest_ex.c:36’
2592: 4002:  not freed: ‘0x300208a8|s1’ (10 bytes) from ‘mtest_ex.c:74’
2592: 4002:  total-size  count  source
2592: 4002:          32      2  mtest_ex.c:36
2592: 4002:          20      2  mtest_ex.c:74
2592: 4002:          52      4  Total of 2
2592: 4002: ending time = 2592, elapsed since start = 0:00:00
```

Cần lưu ý rằng log này được tạo khi chương trình kết thúc. (`dmalloc` có nhiều option và mode hoạt động; bạn có thể cấu hình `dmalloc` in các dòng output ngay khi phát hiện lỗi.)

Nửa đầu output log báo cáo số liệu thống kê high-level về heap và tổng mức sử dụng memory của ứng dụng. Tổng số được thống kê cho từng library call thuộc nhóm `malloc`, chẳng hạn `malloc()`, `free()` và `realloc()`. Một điểm thú vị là log mặc định này báo cáo mười allocation lớn nhất cùng vị trí source code nơi chúng xảy ra. Điều này có thể rất hữu ích cho profiling system-level tổng thể.

Ở gần cuối log, chúng ta thấy bằng chứng về memory leak trong ứng dụng. Bạn có thể thấy library `dmalloc` phát hiện bốn vùng memory đã được cấp phát nhưng dường như chưa bao giờ được giải phóng. Vì chúng ta đã include `dmalloc.h` và biên dịch với debug symbol, dmalloc ghi vào log vị trí source code nơi memory được cấp phát.

Cũng như các công cụ khác đã trình bày trong chương, khuôn khổ sách chỉ cho phép giới thiệu ngắn gọn công cụ debug rất mạnh này. `dmalloc` có thể phát hiện nhiều tình trạng và giới hạn khác. Ví dụ, `dmalloc` có thể phát hiện việc ghi qua pointer đã được giải phóng. Nó có thể cho biết pointer có được dùng để truy cập dữ liệu ngoài giới hạn của vùng nhớ nhưng vẫn trong phạm vi địa chỉ được phép của ứng dụng hay không. Thực tế, `dmalloc` có thể được cấu hình để ghi log gần như mọi memory transaction thông qua họ lời gọi `malloc`. `dmalloc` chắc chắn sẽ mang lại lợi ích lớn gấp nhiều lần công sức bạn bỏ ra để thành thạo công cụ này.

### 13.4.8 Kernel oops

Mặc dù không hoàn toàn là một công cụ, kernel oops chứa nhiều thông tin hữu ích để giúp bạn tìm nguyên nhân sự cố. Kernel oops có thể xuất phát từ nhiều loại kernel error, từ memory error đơn giản do process gây ra, thường có thể khôi phục hoàn toàn, đến hard kernel panic. Những Linux kernel gần đây hỗ trợ hiển thị symbolic information bên cạnh các giá trị địa chỉ thập lục phân thô. Listing 13-14 trình bày kernel oops từ một Power Architecture target.

LISTING 13-14 Kernel oops display

```
$ modprobe loop
Oops: kernel access of bad area, sig: 11 [#1]
NIP: C000D058 LR: C0085650 SP: C7787E80 REGS: c7787dd0 TRAP: 0300  Not tainted
MSR: 00009032 EE: 1 PR: 0 FP: 0 ME: 1 IR/DR: 11
DAR: 00000000, DSISR: 22000000
TASK = c7d187b0[323] ‘modprobe’ THREAD: c7786000
Last syscall: 128
GPR00: 0000006C C7787E80 C7D187B0 00000000 C7CD25CC FFFFFFFF 00000000 80808081
GPR08: 00000001 C034AD80 C036D41C C034AD80 C0335AB0 1001E3C0 00000000 00000000
GPR16: 00000000 00000000 00000000 100170D8 100013E0 C9040000 C903DFD8 C9040000
GPR24: 00000000 C9040000 C9040000 00000940 C778A000 C7CD25C0 C7CD25C0 C7CD25CC
NIP [c000d058] strcpy+0x10/0x1c
LR [c0085650] register_disk+0xec/0xf0
Call trace:
 [c00e170c] add_disk+0x58/0x74
 [c90061e0] loop_init+0x1e0/0x430 [loop]
 [c002fc90] sys_init_module+0x1f4/0x2e0
 [c00040a0] ret_from_syscall+0x0/0x44
Segmentation fault
```

Chú ý rằng register dump có kèm symbolic information ở những chỗ thích hợp. Kernel của bạn phải bật `KALLSYMS` để có thông tin này. Hình 13-4 trình bày các configuration option trong main menu General Setup.

![Figure 13-4](images/ch13/fig13-04.png)

HÌNH 13-4 Hỗ trợ symbol cho oops

Phần lớn thông tin trong kernel oops message liên quan trực tiếp đến processor. Bạn cần có một số kiến thức về architecture bên dưới để hiểu đầy đủ oops message.

Khi phân tích oops trong Listing 13-14, chúng ta thấy ngay nguyên nhân tạo oops là “kernel access of bad area, sig: 11.” Từ các ví dụ trước trong chương, chúng ta đã biết signal 11 biểu thị segmentation fault.

Phần đầu tiên tóm tắt nguyên nhân oops, một vài pointer quan trọng và task gây lỗi. Trong Listing 13-14, NIP là next instruction pointer, được giải mã ở phần sau của oops message. Pointer này trỏ đến code gây ra oops. LR là một register của Power Architecture, thường cho biết return address của subroutine đang thực thi. SP là stack pointer. REGS cho biết kernel address của data structure chứa register dump data. TRAP biểu thị loại exception mà oops message này liên quan. Tham khảo PowerPC architecture user manual được dẫn ở cuối Chương 7, “Bootloader”, chúng ta thấy TRAP 0300 là Data Storage Interrupt, được kích hoạt bởi lỗi truy cập data memory.

Ở dòng thứ ba của oops message, chúng ta thấy thêm các machine register của Power Architecture, chẳng hạn MSR (machine state register), cùng kết quả giải mã một số bit của register này. Dòng tiếp theo hiển thị DAR (data access register), thường chứa memory address gây lỗi. Nội dung DSISR register có thể được sử dụng cùng tài liệu tham khảo PowerPC architecture để tìm hiểu nhiều chi tiết về nguyên nhân cụ thể của exception.

Oops message còn chứa task pointer và task name đã được giải mã, giúp bạn nhanh chóng xác định task hoặc thread nào đang chạy tại thời điểm xảy ra oops. Chúng ta cũng thấy processor register dump chi tiết, có thể cung cấp thêm manh mối. Một lần nữa, chúng ta cần kiến thức về architecture và cách compiler sử dụng register để hiểu các manh mối từ register value. Ví dụ, PowerPC architecture sử dụng register r3 cho return value của function C.

Phần cuối oops message cung cấp stack backtrace kèm kết quả giải mã symbol nếu kernel đã bật symbol. Dựa vào thông tin này, chúng ta có thể dựng lại trình tự sự kiện dẫn đến tình trạng gây lỗi.

Trong ví dụ đơn giản này, chúng ta đã thu được rất nhiều thông tin từ oops message. Chúng ta biết đây là Power Architecture Data Storage Exception, do lỗi truy cập data memory gây ra, khác với truy cập memory để fetch instruction. DAR register cho biết data address gây exception là `0x0000_0000`. Chúng ta biết process `modprobe` gây ra lỗi. Từ backtrace và NIP (next instruction pointer), chúng ta biết lỗi xảy ra trong lời gọi `strcpy()`, có thể lần ngược trực tiếp về function `loop_init()` trong module `loop.ko`, mà `modprobe` đang cố insert tại thời điểm xảy ra exception. Với những thông tin này, việc tìm nguồn gốc null pointer dereference gây lỗi sẽ khá dễ dàng.

## 13.5 Binary utility

Binary utility, hay binutils, là thành phần thiết yếu của mọi toolchain. Thực tế, để build compiler, trước hết bạn phải build binutils thành công. Phần này giới thiệu ngắn gọn những công cụ hữu ích hơn mà lập trình viên embedded cần biết. Cũng như phần lớn công cụ khác trong chương, đây là các cross-utilities và phải được build để chạy trên development host trong khi xử lý binary file dành cho architecture đã chọn. Bạn cũng có thể biên dịch hoặc lấy các phiên bản chạy trên target, nhưng các ví dụ này giả định môi trường cross-development.

### 13.5.1 readelf

Tiện ích `readelf` khảo sát thành phần của target ELF binary file. Công cụ này đặc biệt hữu ích khi build image dành cho ROM hoặc Flash memory, nơi cần kiểm soát rõ ràng image layout. Đây cũng là một công cụ rất tốt để tìm hiểu cách toolchain build image và để hiểu ELF file format.

Ví dụ hiển thị symbol table trong ELF image bằng lệnh:

```
$ readelf -s <elf-image>
```

Để tìm, hiển thị mọi section trong ELF image, dùng:

```
$ readelf -e <elf-image>
```

Sử dụng flag `-S` để liệt kê section header trong ELF image. Bạn có thể ngạc nhiên khi biết rằng ngay cả chương trình “Hello World” seven-line đơn giản cũng chứa 38 section riêng biệt. Một số section có thể quen thuộc với bạn, chẳng hạn `.text` và `.data`. Listing 13-15 liệt kê một phần các section trong ví dụ “Hello World” của chúng ta. Để đơn giản, chúng tôi chỉ liệt kê những section có khả năng quen thuộc hoặc liên quan đến lập trình viên embedded.

LISTING 13-15 Section header từ `readelf`

```
$ ppc_82xx-readelf -S  hello-ex
There are 38 section headers, starting at offset 0x32f4:

Section Headers:
[ Nr] Name        Type        Addr     Off    Size   ES Flg Lk Inf Al
...
 [11] .text       PROGBITS    100002f0 0002f0 000568 00  AX  0   0  4
...
 [13] .rodata     PROGBITS    10000878 000878 000068 00   A  0   0  4
...
 [15] .data       PROGBITS    100108e0 0008e0 00000c 00  WA  0   0  4
...
 [22] .sdata      PROGBITS    100109e0 0009e0 00001c 00  WA  0   0  4
 [23] .sbss       NOBITS      100109fc 0009fc 000000 00  WA  0   0  1
...
 [25] .bss        NOBITS      10010a74 0009fc 00001c 00  WA  0   0  4
...
```

Section `.text` chứa executable program code. Section `.rodata` chứa dữ liệu hằng trong chương trình. Section `.data` thường chứa global data đã khởi tạo được C library prologue code sử dụng, và có thể chứa các data item lớn đã khởi tạo từ ứng dụng của bạn. Section `.sdata` được dùng cho các global data item nhỏ hơn đã khởi tạo và chỉ tồn tại trên một số architecture. Một số processor architecture có thể tận dụng việc truy cập dữ liệu được tối ưu khi các attribute của memory area đã được biết. Các section `.sdata` và `.sbss` cho phép thực hiện những tối ưu này. Các section `.bss` và `.sbss` chứa dữ liệu chưa khởi tạo trong chương trình. Những section này không chiếm dung lượng trong program image. Memory space của chúng được C library prologue code cấp phát và khởi tạo bằng 0 khi chương trình khởi động.

Có thể dump section bất kỳ, hiển thị nội dung. Với dòng sau trong chương trình C khai báo ngoài mọi function, có thể khảo sát cách đặt trong section `.rodata`:

```
char *hello_rodata = “This is a read-only data string\n”;
```

Gọi lệnh `readelf` chỉ định section number muốn dump từ Listing 13-15:

```
$ ppc_82xx-readelf -x 13 hello-ex
Hex dump of section ‘.rodata’:
  0x10000878 100189e0 10000488 1000050c 1000058c ................
  0x10000888 00020001 54686973 20697320 61207265 ....This is a read-
  0x10000898 61642d6f 6e6c7920 64617461 20737472 only data string
  0x100008a8 696e670a 00000000 54686973 20697320 .....This is
  0x100008b8 73746174 69632064 6174610a 00000000 static data.....
  0x100008c8 48656c6c 6f20456d 62656464 65640a00 Hello Embedded..
  0x100008d8 25730a00 25780a00                   %s..%x..
```

Thấy initialized global variable đã khai báo được biểu diễn trong section `.rodata`, cùng mọi constant string định nghĩa trong chương trình.

### 13.5.2 Khảo sát debug information bằng readelf

Một trong những tính năng hữu ích hơn của `readelf` là hiển thị debug information chứa trong ELF file. Khi compiler flag `-g` được chỉ định trong quá trình compile, compiler tạo debug information trong một loạt section bên trong ELF file kết quả. Chúng ta có thể dùng `readelf` để hiển thị các ELF section header này trong ELF file:

```
$ ppc-linux-readelf -S ex_sync | grep debug
  [28] .debug_aranges    PROGBITS   00000000 000c38 0000b8 00   0   0  8
  [29] .debug_pubnames   PROGBITS   00000000 000cf0 00007a 00   0   0  1
  [30] .debug_info       PROGBITS   00000000 000d6a 00079b 00   0   0  1
  [31] .debug_abbrev     PROGBITS   00000000 001505 000207 00   0   0  1
  [32] .debug_line       PROGBITS   00000000 00170c 000354 00   0   0  1
  [33] .debug_frame      PROGBITS   00000000 001a60 000080 00   0   0  4
  [34] .debug_str        PROGBITS   00000000 001ae0 00014d 00   0   0  1
```

Dùng `readelf` với option `--debug-dump` hiển thị nội dung bất kỳ section `.debug_*`. Bạn sẽ thấy thông tin hữu ích thế nào trong Chương 14, “Kỹ thuật debug kernel”, khi thảo luận khó khăn debug optimized kernel code.

Debug information có thể rất lớn. Hiển thị toàn bộ debug information trong Linux kernel ELF file `vmlinux` tạo hơn sáu triệu dòng output. Dù có vẻ đáng ngại, ít nhất quen debug information giúp bạn thành kỹ sư embedded tốt hơn.

Listing 13-16 là phần nội dung section `.debug_info` từ ứng dụng mẫu nhỏ. Vì dung lượng, chỉ cho vài record.

LISTING 13-16 Một phần debug info dump

```
$ ppc-linux-readelf -debug-dump=info ex_sync
1 The section .debug_info contains:
2
3   Compilation Unit @ 0:
4    Length:        109
5    Version:       2
6    Abbrev Offset: 0
7    Pointer Size:  4
8  <0><b>: Abbrev Number: 1 (DW_TAG_compile_unit)
9      DW_AT_stmt_list   : 0
10      DW_AT_low_pc      : 0x10000368
11      DW_AT_high_pc     : 0x1000038c
12      DW_AT_name        :
../sysdeps/powerpc/powerpc32/elf/start.S
13      DW_AT_comp_dir    : /var/tmp/BUILD/glibc-2.3.3/csu
14      DW_AT_producer    : GNU AS 2.15.94
15      DW_AT_language    : 32769  (MIPS assembler)
...
394  <1><5a1>: Abbrev Number: 14 (DW_TAG_subprogram)
395      DW_AT_sibling     : <5fa>
396      DW_AT_external    : 1
397      DW_AT_name        : main
398      DW_AT_decl_file   : 1
399      DW_AT_decl_line   : 9
400      DW_AT_prototyped  : 1
401      DW_AT_type        : <248>
402      DW_AT_low_pc      : 0x100004b8
403      DW_AT_high_pc     : 0x10000570
404      DW_AT_frame_base  : 1 byte block: 6f       (DW_OP_reg31)
...
423  <2><5e9>: Abbrev Number: 16 (DW_TAG_variable)
424      DW_AT_name        : mybuf
425      DW_AT_decl_file   : 1
426      DW_AT_decl_line   : 11
427      DW_AT_type        : <600>
428      DW_AT_location    : 2 byte block: 91 20    (DW_OP_fbreg: 32)
...
```

Record đầu tiên, được nhận diện bằng tag Dwarf2[^6] `DW_TAG_compile_unit`, xác định compilation unit đầu tiên của Power Architecture executable này. Đó là file có tên `start.S`, cung cấp startup prologue cho chương trình C. Record tiếp theo, được nhận diện bằng `DW_TAG_subprogram`, xác định điểm bắt đầu của user program, tức function `main()` quen thuộc. Dwarf2 debug record này chứa tham chiếu đến file và số dòng nơi có `main()`. Record cuối cùng trong Listing 13-16 xác định một local variable trong routine `main()` có tên `mybuf`. Một lần nữa, record này cung cấp số dòng và file. Từ thông tin đó, bạn có thể suy ra `main()` nằm ở dòng 9 và `mybuf` ở dòng 11 của source file. Các debug record khác trong ELF file liên kết filename thông qua attribute Dwarf2 `DW_AT_decl_file`.

Có thể tìm đầy đủ Dwarf2 debug information format qua tham chiếu cuối chương.

### 13.5.3 objdump

Tiện ích `objdump` có nhiều chức năng trùng với công cụ `readelf`. Tuy nhiên, một trong những tính năng hữu ích hơn của `objdump` là khả năng hiển thị disassembled object code. Listing 13-17 cung cấp ví dụ disassembly section `.text` của phiên bản “Hello World” đơn giản cho Power Architecture. Chúng ta chỉ đưa routine `main()` vào để tiết kiệm dung lượng trình bày. Toàn bộ bản dump, bao gồm C library prologue và epilogue, sẽ chiếm nhiều trang.

LISTING 13-17 Disassembly bằng `objdump`

```
$ ppc_82xx-objdump -S -m powerpc:common -j .text hello
...
10000488 <main>:
10000488:       94 21 ff e0     stwu    r1,-32(r1)
1000048c:       7c 08 02 a6     mflr    r0
10000490:       93 e1 00 1c     stw     r31,28(r1)
10000494:       90 01 00 24     stw     r0,36(r1)
10000498:       7c 3f 0b 78     mr      r31,r1
1000049c:       90 7f 00 08     stw     r3,8(r31)
100004a0:       90 9f 00 0c     stw     r4,12(r31)
100004a4:       3d 20 10 00     lis     r9,4096
100004a8:       38 69 08 54     addi    r3,r9,2132
100004ac:       4c c6 31 82     crclr   4*cr1+eq
100004b0:       48 01 05 11     bl      100109c0
<__bss_start+0x60>
100004b4:       38 00 00 00     li      r0,0
100004b8:       7c 03 03 78     mr      r3,r0
100004bc:       81 61 00 00     lwz     r11,0(r1)
100004c0:       80 0b 00 04     lwz     r0,4(r11)
100004c4:       7c 08 03 a6     mtlr    r0
100004c8:       83 eb ff fc     lwz     r31,-4(r11)
100004cc:       7d 61 5b 78     mr      r1,r11
100004d0:       4e 80 00 20     blr
...
```

Phần lớn code trong routine `main()` đơn giản là tạo và hủy stack frame. Lời gọi thực sự đến `printf()` được biểu diễn bằng instruction branch link (`bl`) gần giữa listing, tại address `0x100004b0`. Đây là một function call của Power Architecture. Vì chương trình này được compile thành một dynamically linked object, chúng ta sẽ chưa có address cho function `printf()` cho đến runtime, khi nó được link với routine `printf()` trong shared library. Nếu compile chương trình thành một statically linked object, chúng ta sẽ thấy symbol và address tương ứng cho lời gọi `printf()`.

### 13.5.4 objcopy

`objcopy` định dạng binary object file và có thể chuyển đổi format của file nếu được yêu cầu. Tiện ích này rất hữu ích khi tạo code cho image nằm trong ROM hoặc Flash. Bootloader U-Boot được giới thiệu trong Chương 7 sử dụng `objcopy` để tạo các output format binary và s-record[^7] từ ELF file cuối cùng. Ví dụ sử dụng sau minh họa các khả năng của `objcopy` và cách dùng công cụ này để build Flash image:

```
$ ppc_82xx-objcopy --gap-fill=0xff -O binary u-boot u-boot.bin
```

Lời gọi `objcopy` này cho thấy cách chuẩn bị một image cho Flash memory. Input file, trong ví dụ này là `u-boot`, là ELF image U-Boot đầy đủ, bao gồm symbol và relocation information. Tiện ích `objcopy` chỉ lấy các section liên quan chứa program code và dữ liệu rồi đặt image vào output file, ở đây được chỉ định là `u-boot.bin`.

Flash memory chứa toàn bit 1 khi đã xóa. Vì thế lấp gap binary image bằng toàn bit 1 tăng hiệu quả lập trình và kéo dài tuổi thọ Flash vốn giới hạn write cycle. Thực hiện bằng parameter `--gap-fill` cho `objcopy`.

Đây chỉ một ví dụ đơn giản dùng `objcopy`. Utility còn sinh s-records và chuyển format. Xem man page để đủ chi tiết.

## 13.6 Các binary utility khác

Toolchain chứa thêm một số utility hữu ích. Học dùng đơn giản. Bạn sẽ tìm nhiều công dụng cho chúng.

### 13.6.1 strip

Tiện ích `strip` có thể được dùng để loại bỏ symbol và debug information khỏi binary. Thao tác này thường được sử dụng để tiết kiệm dung lượng trên embedded device. Trong mô hình cross-development, cách thuận tiện là đặt stripped binary trên target system và giữ phiên bản chưa strip trên development host. Với phương pháp này, symbol vẫn có sẵn để cross-debugging trên development host, đồng thời tiết kiệm dung lượng trên target. `strip` có nhiều option được mô tả trong man page.

### 13.6.2 addr2line

Khi chúng ta trình bày `mtrace` trong Listing 13-12, bạn đã thấy output từ analysis script `mtrace` chứa thông tin file và số dòng. Perl script `mtrace` dùng tiện ích `addr2line` để đọc debug information trong executable ELF file và hiển thị số dòng tương ứng với address. Sử dụng cùng executable mẫu `mtrace`, chúng ta có thể tìm filename và số dòng cho một virtual address:

```
$ addr2line -f -e mt_ex 0x80487c6
     put_data
     /home/chris/examples/mt_ex.c:64
```

Lưu ý rằng function `put_data()` cũng được liệt kê cùng file và số dòng. Điều này cho biết address `0x80487c6` nằm ở dòng 64 của file `mt_ex.c`, trong function `put_data()`. Thông tin này còn hữu ích hơn với các binary lớn gồm nhiều filename, chẳng hạn Linux kernel:

```
$ ppc_82xx-addr2line -f -e vmlinux c000d95c
     mpc52xx_restart
     arch/ppc/syslib/mpc52xx_setup.c:41
```

Ví dụ cụ thể này nhấn mạnh một điểm được nhắc lại xuyên suốt chương: đây là công cụ architecture-specific. Bạn phải sử dụng công cụ được cấu hình và biên dịch phù hợp với architecture của target binary đang dùng. Cũng như cross-compiler, `addr2line` là một cross tool và là thành phần của binary utilities package.

### 13.6.3 strings

Tiện ích `strings` xem xét dữ liệu ASCII string trong binary file. Điều này đặc biệt hữu ích để xem xét memory dump khi có thể không có source code hoặc debug symbol. Bạn thường có thể khoanh vùng nguyên nhân crash bằng cách truy ngược các string về binary gây lỗi. Mặc dù `strings` có một số command-line option, nó vẫn dễ học và dễ sử dụng. Hãy xem man page để biết thêm chi tiết.

### 13.6.4 ldd

Dù không hoàn toàn binary utility, script `ldd` là công cụ hữu ích khác cho embedded developer. Thuộc C library package, có trên gần mọi Linux distribution. `ldd` liệt kê shared object library dependency cho object file hoặc nhiều file. Đã giới thiệu `ldd` trong Chương 11, “BusyBox”. Xem Listing 11-2 ví dụ. Script `ldd` đặc biệt hữu ích khi phát triển ramdisk image. Lỗi phổ biến nhất hỏi trên embedded Linux mailing list là kernel panic sau mount root:

```
VFS: Mounted root (nfs filesystem).
Freeing unused kernel memory: 96k init
Kernel panic - not syncing: No init found.  Try passing init=option to kernel.
```

Một trong những nguyên nhân phổ biến nhất là root file system image, dù là ramdisk, Flash hay NFS root file system, không chứa các library cần thiết cho những binary mà kernel đang cố thực thi. Sử dụng `ldd`, bạn có thể xác định từng binary cần những library nào và bảo đảm đưa chúng vào ramdisk hoặc root file system image khác. Trong ví dụ kernel panic trước đó, `init` thực sự có mặt trên file system, nhưng Linux dynamic loader `ld.so.1` lại bị thiếu. Cách sử dụng `ldd` khá đơn giản:

```
$ xscale_be-ldd init
    libc.so.6 => /opt/mvl/.../lib/libc.so.6 (0xdead1000)
    ld-linux.so.3 => /opt/mvl/.../lib/ld-linux.so.3 (0xdead2000)
```

Ví dụ đơn giản này cho thấy binary `init` cần hai dynamic library object: libc và ld-linux. Cả hai phải có mặt trên target và init binary phải truy cập được chúng, nghĩa là chúng phải có quyền đọc và thực thi.

### 13.6.5 nm

Tiện ích `nm` hiển thị các symbol trong object file. Công cụ này có thể hữu ích cho nhiều công việc. Ví dụ, giả sử khi cross-compiling một ứng dụng lớn, bạn gặp các unresolved symbol. Bạn có thể dùng `nm` để tìm object module chứa các symbol đó, rồi sửa build environment để đưa module này vào.

Tiện ích `nm` cung cấp attribute cho từng symbol. Chẳng hạn, bạn có thể xác định symbol đó là local hay global, và nó được định nghĩa hay chỉ được tham chiếu trong một object module cụ thể. Listing 13-18 trình bày lại một vài dòng từ output của `nm` khi chạy trên U-Boot ELF image `u-boot`.

LISTING 13-18 Hiển thị symbol bằng `nm`

```
$ ppc_85xx-nm u-boot
...
fff23140 b base_address
fff24c98 B BootFile
fff06d64 T BootpRequest
fff00118 t boot_warm
fff21010 d border
fff23000 A __bss_start
...
```

Chú ý các link address của những symbol U-Boot này. Chúng được link cho một Flash device nằm ở vùng cao nhất trong memory map của board cụ thể này. Listing chỉ chứa một vài symbol mẫu phục vụ việc thảo luận. Cột giữa là symbol type. Chữ hoa biểu thị global symbol, còn chữ thường biểu thị local symbol. B cho biết symbol nằm trong section `.bss`. T cho biết symbol nằm trong section `.text`. D cho biết symbol nằm trong section `.data`. A cho biết địa chỉ này là absolute và không bị thay đổi bởi một link stage bổ sung. Absolute symbol này biểu thị vị trí bắt đầu section `.bss` và được code sử dụng để xóa `.bss` khi khởi động, theo yêu cầu của C execution environment.

### 13.6.6 prelink

Tiện ích `prelink` thường được dùng trong những hệ thống coi trọng startup time. Một dynamically linked ELF executable phải được link tại runtime khi chương trình được load lần đầu. Việc này có thể tốn thời gian đáng kể với ứng dụng lớn. `prelink` chuẩn bị các shared library và object file phụ thuộc vào chúng để cung cấp thông tin biết trước về những unresolved library reference. Nhờ đó, startup time của một ứng dụng có thể được giảm xuống. Man page có đầy đủ chi tiết về cách sử dụng tiện ích hữu ích này.

## 13.7 Tổng kết

Chương này đã xem xét một số công cụ quan trọng hơn dành cho embedded Linux developer. Chúng ta đã cho thấy cách dùng các tiện ích thông thường một cách hiệu quả để phân tích hành vi hệ thống. Chúng ta đã trình bày nhiều tiện ích trong binutils, bao gồm `readelf`, `objdump`, `objcopy` và một số tiện ích khác.

- GNU Debugger (GDB) là debugger phức tạp, mạnh với nhiều khả năng. Chúng ta trình bày cơ bản để bắt đầu.

- DDD graphical front end cho GDB tích hợp source code, data display với sức mạnh giao diện GDB command-line.

- `cbrowser` hỗ trợ hữu ích hiểu dự án lớn. Dùng database `cscope` nhanh tìm, hiện symbol và thành phần C source code khác.

- Linux có nhiều profiling, trace tool. Đã trình bày `strace`, `ltrace`, `top`, `ps`, memory profiler `mtrace`, `dmalloc`.

- Embedded developer thường cần custom image như bootloader, firmware image. Với tác vụ đó kiến thức binutils không thể thiếu.

### 13.7.1 Gợi ý đọc thêm

GDB: The GNU Project Debugger www.gnu.org/software/gdb/gdb.html

GDB Pocket Reference Arnold Robbins O’Reilly Media, 2005

Data Display Debugger www.gnu.org/software/ddd/

Trang chủ `cbrowser` www.ziplink.net/\~felaco/cbrowser/

Trang chủ `cscope` http://cscope.sourceforge.net/index.html

`dmalloc`: Debug Malloc Library http://dmalloc.com/

Tool Interface Standard (TIS) Executable and Linking Format (ELF) Specification Version 1.2 TIS Committee, May 1995

Tool interface standards DWARF Debugging Information Format Specification Version 2.0 TIS Committee, May 1995

The Eclipse Project www.eclipse.org/Trang này được cố ý để trống

[^1]: Xem `SIG_KERNEL_COREDUMP_MASK` trong `.../include/linux/signal.h` để biết signal nào sinh core dump.

[^2]: Các signal và số tương ứng của chúng được định nghĩa trong `.../arch/<arch>/include/asm/signal.h` thuộc Linux kernel source tree của bạn.

[^3]: Xem `man ldconfig` để biết chi tiết về cách tạo linker cache cho target system của bạn.

[^4]: Trong context này, một address all-0s đôi khi là hợp lệ. Tuy nhiên, chúng ta đang tìm hiểu vì sao chương trình kết thúc bất thường, nên cần xem đây là một điểm đáng ngờ.

[^5]: Xem `man hosts` về system administration file này.

[^6]: Tài liệu tham khảo cho Dwarf2 Debug Information Specification được cung cấp ở cuối chương này.

[^7]: Các file S-record là dạng biểu diễn ASCII của một binary file, được nhiều device programmer và tiện ích xử lý software binary sử dụng.
