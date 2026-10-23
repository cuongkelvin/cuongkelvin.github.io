# Chương 15. Debug ứng dụng embedded Linux

## Trong chương này

- 15\.1 Debug trên target 424

- 15\.2 Remote (cross) debugging 424

- 15\.3 Debug với shared library 429

- 15\.4 Debug nhiều task 435

- 15\.5 Các remote debug option bổ sung 442

- 15\.6 Tổng kết 443

Chương trước khám phá GDB để debug kernel code

và code trong Flash như bootloader. Chương này tiếp tục

GDB cho application code trong user space. Chúng ta mở rộng

remote debugging và công cụ, kỹ thuật dùng cho

môi trường debug cụ thể này.

## 15.1 Debug trên target

Chúng ta đã tìm hiểu một số debugging tool quan trọng trong Chương 13, “Công cụ phát triển”. `strace` và `ltrace` có thể được dùng để quan sát, mô tả hành vi của process và thường giúp khoanh vùng vấn đề. `dmalloc` có thể giúp khoanh vùng memory leak và lập profile mức sử dụng memory. `ps` và `top` hữu ích để xem xét trạng thái của các process. Những công cụ tương đối nhỏ này được thiết kế để chạy trực tiếp trên target hardware.

Debug Linux application code trên embedded system có những thách thức riêng. Tài nguyên trên embedded target của bạn thường hạn chế. Các giới hạn về RAM và nonvolatile storage có thể khiến bạn không chạy được development tool target-based. Bạn có thể không có Ethernet port hoặc kết nối high-speed khác. Target embedded system cũng có thể không có màn hình đồ họa, bàn phím hoặc chuột.

Đây là nơi các công cụ cross-development và môi trường NFS root mount mang lại lợi ích lớn. Nhiều công cụ, đặc biệt là GDB, được thiết kế để thực thi trên development host trong khi thực sự debug code trên remote target. GDB có thể được sử dụng để debug tương tác target code hoặc phân tích sau sự cố một core file được tạo do ứng dụng crash. Chúng ta đã trình bày chi tiết việc phân tích application core dump trong Chương 13.

## 15.2 Remote (cross) debugging

Các công cụ Cross-development được phát triển chủ yếu để khắc phục giới hạn tài nguyên của embedded platform. Một ứng dụng modest-size được compile với symbolic debug information có thể dễ dàng vượt quá vài megabyte. Với cross debugging, development host có thể đảm nhận phần công việc nặng. Khi gọi cross version của GDB trên development host, bạn truyền cho nó một ELF file được compile với symbolic debug information. Trên target, bạn có thể strip[^1] mọi debugging information không cần thiết khỏi ELF file để giữ kích thước image kết quả ở mức tối thiểu.

Chúng ta đã giới thiệu tiện ích `readelf` trong Chương 13. Trong Chương 14, “Các kỹ thuật debug kernel”, chúng ta dùng nó để xem debug information trong một ELF file được compile với symbolic debugging information. Listing 15-1 chứa output của `readelf` cho một ứng dụng web server tương đối nhỏ được compile cho ARM architecture.

LISTING 15-1 ELF file debug information của chương trình mẫu

```
$ xscale_be-readelf -S websdemo
There are 39 section headers, starting at offset 0x3dfd0:

Section Headers:
[Nr] Name              Type        Addr     Off    Size   ES Flg Lk Inf Al
[ 0]                   NULL        00000000 000000 000000 00      0  0  0
[ 1] .interp           PROGBITS    00008154 000154 000013 00   A  0  0  1
[ 2] .note.ABI-tag     NOTE        00008168 000168 000020 00   A  0  0  4
[ 3] .note.numapolicy  NOTE        00008188 000188 000074 00   A  0  0  4
[ 4] .hash             HASH        000081fc 0001fc 00022c 04   A  5  0  4
[ 5] .dynsym           DYNSYM      00008428 000428 000460 10   A  6  1  4
[ 6] .dynstr           STRTAB      00008888 000888 000211 00   A  0  0  1
[ 7] .gnu.version      VERSYM      00008a9a 000a9a 00008c 02   A  5  0  2
[ 8] .gnu.version_r    VERNEED     00008b28 000b28 000020 00   A  6  1  4
[ 9] .rel.plt          REL         00008b48 000b48 000218 08   A  5 11  4
[10] .init             PROGBITS    00008d60 000d60 000018 00  AX  0  0  4
[11] .plt              PROGBITS    00008d78 000d78 000338 04  AX  0  0  4
[12] .text             PROGBITS    000090b0 0010b0 019fe4 00  AX  0  0  4
[13] .fini             PROGBITS    00023094 01b094 000018 00  AX  0  0  4
[14] .rodata           PROGBITS    000230b0 01b0b0 0023d0 00   A  0  0  8
[15] .ARM.extab        PROGBITS    00025480 01d480 000000 00   A  0  0  1
[16] .ARM.exidx        ARM_EXIDX   00025480 01d480 000008 00  AL 12  0  4
[17] .eh_frame_hdr     PROGBITS    00025488 01d488 00002c 00   A  0  0  4
[18] .eh_frame         PROGBITS    000254b4 01d4b4 00007c 00   A  0  0  4
[19] .init_array       INIT_ARRAY  0002d530 01d530 000004 00  WA  0  0  4
[20] .fini_array       FINI_ARRAY  0002d534 01d534 000004 00  WA  0  0  4
[21] .jcr              PROGBITS    0002d538 01d538 000004 00  WA  0  0  4
[22] .dynamic          DYNAMIC     0002d53c 01d53c 0000d0 08  WA  6  0  4
[23] .got              PROGBITS    0002d60c 01d60c 000118 04  WA  0  0  4
[24] .data             PROGBITS    0002d728 01d728 0003c0 00  WA  0  0  8
[25] .bss              NOBITS      0002dae8 01dae8 0001c8 00  WA  0  0  4
[26] .comment          PROGBITS    00000000 01dae8 000940 00      0  0  1
[27] .debug_aranges    PROGBITS    00000000 01e428 0004a0 00      0  0  8
[28] .debug_pubnames   PROGBITS    00000000 01e8c8 001aae 00      0  0  1
[29] .debug_info       PROGBITS    00000000 020376 013d27 00      0  0  1
[30] .debug_abbrev     PROGBITS    00000000 03409d 002ede 00      0  0  1
[31] .debug_line       PROGBITS    00000000 036f7b 0034a2 00      0  0  1
[32] .debug_frame      PROGBITS    00000000 03a420 003380 00      0  0  4
[33] .debug_str        PROGBITS    00000000 03d7a0 000679 00      0  0  1
[34] .note.gnu.arm.ide NOTE        00000000 03de19 00001c 00      0  0  1
[35] .debug_ranges     PROGBITS    00000000 03de35 000018 00      0  0  1
[36] .shstrtab         STRTAB      00000000 03de4d 000183 00      0  0  1
[37] .symtab           SYMTAB      00000000 03e5e8 004bd0 10     38 773 4
[38] .strtab           STRTAB      00000000 0431b8 0021bf 00      0  0  1
Key to Flags:
W (write), A (alloc), X (execute), M (merge), S (strings)
I (info), L (link order), G (group), x (unknown)
O (extra OS processing required) o (OS specific), p (processor specific)
$
```

Từ Listing 15-1, bạn có thể thấy nhiều section chứa debug information. Một section tên là `.comment` chứa hơn 2KB (0x940) thông tin không cần thiết để ứng dụng hoạt động. Kích thước file mẫu này, bao gồm debug information, lớn hơn 275KB, như sau:

```
$ ls -l websdemo
-rwxrwxr-x  1 chris chris 283511 Nov 8 18:48 websdemo
```

Nếu strip file bằng cross-strip utility, có thể giảm kích thước giữ tài nguyên target. Listing 15-2 cho kết quả.

LISTING 15-2 Strip target application

```
$ xscale_be-strip -s -R .comment -o websdemo-stripped websdemo
$ ls -l websdemo*
-rwxrwxr-x  1 chris chris 283491 Apr  9 09:19 websdemo
-rwxrwxr-x  1 chris chris 123156 Apr  9 09:21 websdemo-stripped
$
```

Ở đây, chúng ta strip cả symbolic debug information lẫn section `.comment` khỏi executable file. Chúng ta chỉ định tên stripped binary bằng switch command-line `-o`. Bạn có thể thấy stripped binary nhỏ hơn một nửa kích thước ban đầu. Dĩ nhiên, với các ứng dụng lớn hơn, mức tiết kiệm dung lượng còn đáng kể hơn. Một Linux kernel gần đây được compile với debug information có kích thước hơn 18MB. Sau khi strip như trong Listing 15-2, binary kết quả chỉ lớn hơn 2MB một chút!

Để debug theo cách này, bạn đặt phiên bản binary đã được strip trên target system và giữ một bản sao cục bộ chưa strip trên development workstation, chứa symbolic information cần thiết cho việc debug. Bạn sử dụng `gdbserver` trên target board để cung cấp interface trở lại development host, nơi chạy phiên bản GDB full-blown, dĩ nhiên là cross-gdb, trên binary chưa strip.

### 15.2.1 gdbserver

Sử dụng `gdbserver` cho phép bạn chạy GDB trên development workstation thay vì trên target embedded Linux platform. Cấu hình này có những lợi ích rõ ràng. Trước hết, development workstation thường có CPU mạnh hơn, nhiều memory và hard-drive storage hơn rất nhiều so với embedded platform. Ngoài ra, source code của ứng dụng đang được debug thường nằm trên development workstation thay vì trên embedded platform.

`gdbserver` là một chương trình nhỏ chạy trên target board và cho phép remote debugging một process trên board. Nó được gọi trên target board với chương trình cần debug cùng IP address và port number nơi nó lắng nghe yêu cầu kết nối từ GDB. Listing 15-3 trình bày trình tự startup để bắt đầu một debug session trên target board.

LISTING 15-3 Khởi động `gdbserver` trên target board

```
$ gdbserver localhost:2001 websdemo-stripped
Process websdemo-stripped created; pid = 197
Listening on port 2001
```

Ví dụ chạy `gdbserver` cấu hình nghe Ethernet TCP/IP connection port 2001, sẵn debug stripped binary `websdemo-stripped`.

Từ development workstation, chúng ta khởi chạy GDB và truyền tên binary executable chứa symbolic debug information cần debug làm đối số. Sau khi GDB khởi tạo, chúng ta thực hiện một lệnh kết nối đến remote target board. Listing 15-4 trình bày trình tự này.

LISTING 15-4 Khởi động remote GDB session

```
$ xscale_be-gdb -q websdemo
(gdb) target remote 192.168.1.141:2001
Remote debugging using 192.168.1.141:2001
0x40000790 in ?? ()
(gdb) p main       <<<< Display address of main function
$1 = {int (int, char **)} 0x12b68 <main>
(gdb) b main       <<<< Place breakpoint at main()
Breakpoint 1 at 0x12b80: file main.c, line 72.
(gdb)
```

Listing 15-4 gọi cross-gdb trên development host. Khi GDB đang chạy, chúng ta thực hiện lệnh GDB `target remote`. Lệnh này khiến GDB khởi tạo một TCP/IP connection từ development workstation đến target board, với IP address được chỉ định trên port 2001. Khi `gdbserver` chấp nhận yêu cầu kết nối, nó in một dòng tương tự như sau:

```
Remote debugging from host 192.168.0.10
```

Bây giờ GDB đã kết nối với process `gdbserver` trên target board, sẵn sàng nhận các command từ GDB. Phần còn lại của session hoàn toàn giống như debug một ứng dụng cục bộ. Đây là công cụ mạnh, cho phép bạn tận dụng năng lực development workstation cho debug session, chỉ để lại một GDB stub nhỏ, tương đối ít gây ảnh hưởng, và chương trình đang debug trên target board. Nếu bạn thắc mắc, `gdbserver` dành cho ARM target cụ thể này chỉ có kích thước 54KB, như sau:

```
root@coyote:~# ls -l /usr/bin/gdbserver
-rwxr-xr-x  1 root root 54344 Jun 26  2009 /usr/bin/gdbserver
```

Một lưu ý thường xuất hiện trong các câu hỏi thường gặp (FAQ) trên mailing list là bạn phải sử dụng GDB trên development host đã được cấu hình làm cross debugger. Đây là một chương trình binary chạy trên development workstation, thường là x86, và hiểu các binary executable image được compile cho architecture khác. Điều này quan trọng nhưng thường bị bỏ qua. Bạn không thể debug Power Architecture target bằng native GDB như bản đi kèm một cài đặt Ubuntu desktop Linux điển hình. Bạn phải có GDB được cấu hình cho tổ hợp host và target của mình.

Khi được gọi, GDB hiển thị một banner gồm vài dòng thông tin, sau đó hiển thị cấu hình đã được compile vào nó. Listing 15-5 là một ví dụ GDB được sử dụng cho một số ví dụ trong sách này. Nó thuộc embedded Linux distribution do MontaVista Software cung cấp và được cấu hình cho Power Architecture cross- development.

LISTING 15-5 Gọi cross-gdb

```
$ ppc_82xx-gdb
GNU gdb 6.0 (MontaVista 6.0-8.0.4.0300532 2003-12-24)
Copyright 2003 Free Software Foundation, Inc.
GDB is free software, covered by the GNU General Public License, and
you are welcome to change it and/or distribute copies of it under
certain conditions.  Type “show copying” to see the conditions.
There is absolutely no warranty for GDB. Type “show warranty” for
details.
This GDB was configured as “--host=i686-pc-linux-gnu
--target=powerpc-hardhat-linux”.
(gdb)
```

Hãy chú ý các dòng cuối của GDB startup message này. Đây là cấu hình được compile vào phiên bản GDB này. Nó được compile để thực thi trên PC host x86 (i686) chạy GNU/Linux và debug các chương trình binary được compile cho processor Power Architecture chạy GNU/Linux. Điều này được chỉ định bởi các variable `--host` và `--target` hiển thị trong banner. Đây cũng là một phần của configuration string truyền cho `./configure` khi build GDB.

## 15.3 Debug với shared library

Bây giờ bạn đã hiểu cách bắt đầu remote debug session bằng GDB trên host và `gdbserver` trên target, chúng ta chuyển sang sự phức tạp của shared library và debug symbol. Trừ khi ứng dụng là một statically linked executable, được link bằng switch command-line của linker `-static`, nhiều symbol trong ứng dụng sẽ tham chiếu code nằm ngoài ứng dụng. Những ví dụ rõ ràng gồm việc sử dụng các standard C library routine như `fopen`, `printf`, `malloc` và `memcpy`. Ví dụ ít rõ ràng hơn có thể là lời gọi đến các function application-specific như `jack_transport_locate()`, một routine từ JACK audio server low-latency, gọi một library function bên ngoài các standard C library.

Để có symbol routine này phải đáp ứng hai yêu cầu GDB:

- Có debug version của library.

- GDB biết nơi tìm.

Nếu không có sẵn phiên bản debug của các library, bạn vẫn có thể debug ứng dụng; chỉ là bạn không có debug information cho các library routine được ứng dụng gọi. Điều này thường hoàn toàn chấp nhận được, trừ khi bạn đang phát triển một shared library object như một phần của dự án embedded.

Xem lại Listing 15-4 gọi GDB trên remote target. Sau kết nối bằng `target remote`, GDB trả phản hồi two-line:

```
Remote debugging using 192.168.1.141:2001
0x40000790 in ?? ()
```

Điều này xác nhận GDB đã kết nối với target tại IP address và port được chỉ định. Sau đó, GDB báo vị trí program counter là `0x40000790`. Vì sao chúng ta nhận dấu hỏi thay vì symbolic location? Vì đây là Linux dynamic loader (`ld-x.y.z.so`), và platform cụ thể này không có sẵn debug symbol cho shared library đó. Làm thế nào chúng ta biết điều này?

Nhớ lại phần thảo luận về file system `/proc` trong Chương 9, “File system”. Một entry hữu ích là maps entry, xem Listing 9-16 trong Chương 9, trong cấu trúc thư mục per-process. Chúng ta biết process ID (PID) của target application từ output `gdbserver` trong Listing 15-3. Process được gán PID 197. Với thông tin đó, chúng ta có thể xem các memory segment đang được sử dụng ngay sau process startup, như trong Listing 15-6.

LISTING 15-6 Mapping target memory segment ban đầu

```
root@coyote:~# cat /proc/197/maps
00008000-00026000 r-xp 00000000 00:0e 4852444    ./websdemo-stripped
0002d000-0002e000 rw-p 0001d000 00:0e 4852444    ./websdemo-stripped
40000000-40017000 r-xp 00000000 00:0a 4982583    /lib/ld-2.3.3.so
4001e000-40020000 rw-p 00016000 00:0a 4982583    /lib/ld-2.3.3.so
bedf9000-bee0e000 rwxp bedf9000 00:00 0          [stack]
root@coyote:~#
```

Ở đây, chúng ta thấy target application `websdemo-stripped` chiếm hai memory segment. Đầu tiên là executable segment read-only tại `0x8000`, thứ hai là data segment read-write tại `0x2d000`. Memory segment thứ ba là phần đáng quan tâm: executable code segment của Linux dynamic linker. Lưu ý nó bắt đầu tại địa chỉ `0x40000000`. Nếu tìm hiểu thêm, chúng ta có thể xác nhận GDB thực sự đang dừng ở dòng code đầu tiên của dynamic linker, trước khi bất kỳ code nào của ứng dụng được thực thi. Dùng phiên bản cross của `readelf`, chúng ta có thể xác nhận địa chỉ bắt đầu của linker như sau:

```
# xscale_be-readelf -S ld-2.3.3.so | grep \.text
[ 9] .text    PROGBITS    00000790 000790 012c6c 00  AX  0   0 16
```

Từ dữ liệu này, chúng ta kết luận rằng address mà GDB báo khi khởi động là instruction đầu tiên từ `ld-2.3.3.so`, Linux dynamic linker/loader. Bạn có thể dùng kỹ thuật này để hình dung sơ bộ code của mình đang ở đâu nếu không có symbolic debug information cho một process hoặc shared library.

Hãy nhớ chúng ta đang thực thi lệnh cross `readelf` này trên development host. Vì vậy, file `ld-2.3.3.so`, bản thân là một XScale binary object, phải truy cập được từ development host. Thông thường, file này nằm trên development host và là một thành phần của embedded Linux distribution được cài trên host.

### 15.3.1 Shared library event trong GDB

GDB có thể thông báo các shared library event cho bạn. Điều này hữu ích để hiểu hành vi của ứng dụng hoặc Linux loader, hoặc để đặt breakpoint trong các shared library routine bạn muốn debug hay step qua. Listing 15-7 minh họa kỹ thuật này. Thông thường, path đầy đủ đến library được hiển thị. Listing này đã được chỉnh sửa để dễ đọc hơn.

LISTING 15-7 Dừng GDB trên shared library event

```
$ xscale_be-gdb -q websdemo
(gdb) target remote 192.168.1.141:2001
Remote debugging using 192.168.1.141:2001
0x40000790 in ?? ()
(gdb) i shared       <<< Display loaded shared libs
No shared libraries loaded at this time.
(gdb) b main         <<< Break at main
Breakpoint 1 at 0x12b80: file main.c, line 72.
(gdb) c
Continuing.
Breakpoint 1, main (argc=0x1, argv=0xbec7fdc4) at main.c:72
72              int localvar = 9;
(gdb) i shared
From        To          Syms Read   Shared Object Library
0x40033300  0x4010260c  Yes         /opt/mvl/.../lib/tls/libc.so.6
0x40000790  0x400133fc  Yes         /opt/mvl/.../lib/ld-linux.so.3
(gdb) set stop-on-solib-events 1
(gdb) c
Continuing.
Stopped due to shared library event
(gdb) i shared
From        To          Syms Read   Shared Object Library
0x40033300  0x4010260c  Yes         /opt/mvl/.../lib/tls/libc.so.6
0x40000790  0x400133fc  Yes         /opt/mvl/.../lib/ld-linux.so.3
0x4012bad8  0x40132104  Yes         /opt/mvl/.../libnss_files.so.2
(gdb)
```

Khi debug session mới bắt đầu, chưa có shared library nào được load. Bạn có thể thấy điều này qua lệnh `i shared` đầu tiên, lệnh hiển thị các shared library hiện được load. Khi đặt breakpoint tại function `main()` của ứng dụng, chúng ta thấy hai shared library đã được load. Đó là Linux dynamic linker/loader và thành phần standard C library `libc`.

Từ đây, chúng ta thực hiện lệnh `set stop-on-solib-event` và tiếp tục thực thi chương trình. Khi ứng dụng thử thực thi một function từ shared library khác, library đó được load. Nếu bạn thắc mắc, function `gethostbyname()` được gặp và khiến shared object tiếp theo được load.

Ví dụ này minh họa một khái niệm cross-development quan trọng. Binary application (ELF image) chạy trên target chứa thông tin về các library cần thiết để resolve những external reference của nó. Chúng ta có thể dễ dàng xem thông tin này bằng lệnh `ldd`, đã được giới thiệu trong Chương 11, “BusyBox”, và trình bày chi tiết trong Chương 13. Listing 15-8 cho thấy output của `ldd` được gọi từ target board.

LISTING 15-8 `ldd` thực thi trên target board

```
root@coyote:/workspace# ldd websdemo
        libc.so.6 => /lib/tls/libc.so.6 (0x40020000)
        /lib/ld-linux.so.3 (0x40000000)
root@coyote:/workspace#
```

Lưu ý rằng các path đến shared library trên target là absolute path bắt đầu từ `/lib` trên root file system. Tuy nhiên, GDB chạy trên development workstation của host không thể sử dụng các path này để tìm library. Bạn cần hiểu rằng làm như vậy sẽ khiến GDB trên host load library của architecture không đúng. Host nhiều khả năng là x86, trong khi target trong ví dụ này là ARM XScale.

Nếu gọi phiên bản cross của `ldd`, bạn sẽ thấy các path đã được cấu hình sẵn trong toolchain. Toolchain phải biết nơi các file này tồn tại trên host development system.[^2] Listing 15-9 minh họa điều này. Một lần nữa, chúng tôi đã chỉnh sửa listing để dễ đọc; các path dài được viết tắt.

LISTING 15-9 `ldd` thực thi trên development host

```
$ xscale_be-ldd websdemo
   libc.so.6 => /opt/mvl/.../xscale_be/target/lib/libc.so.6 (0xdead1000)
   ld-linux.so.3 => /opt/mvl/.../xscale_be/target/lib/ld-linux.so.3 (0xdead2000)
$
```

Cross toolchain của bạn cần được cấu hình sẵn với các vị trí library này. Không chỉ GDB trên host cần biết chúng nằm ở đâu, mà compiler và linker cũng cần biết.[^3] GDB có thể cho biết nơi nó được cấu hình để tìm các library này bằng lệnh `show solib-absolute-prefix`:

```
(gdb) show solib-absolute-prefix
Prefix for loading absolute shared library symbol files is
“/opt/mvl/pro/devkit/arm/xscale_be/target”.
(gdb)
```

Bạn có thể thiết lập hoặc thay đổi nơi GDB tìm shared library bằng các lệnh GDB `set solib-absolute-prefix` và `set solib-search-path`. Nếu phát triển các shared library module riêng hoặc có các vị trí library tùy chỉnh trên hệ thống, bạn có thể sử dụng `solib-search-path` để chỉ dẫn GDB nơi tìm library. Để biết thêm chi tiết về các lệnh này và các GDB command khác, hãy xem tài liệu GDB trực tuyến được dẫn ở cuối chương.

Một lưu ý cuối về `ldd`: bạn có thể đã chú ý các địa chỉ gắn với library trong Listing 15-8 và Listing 15-9. `ldd` hiển thị load address ở đầu các code segment này như khi chương trình được Linux dynamic linker/loader load. Khi thực thi trên target, các địa chỉ trong Listing 15-5 hoàn toàn hợp lý, và chúng ta có thể đối chiếu với listing `/proc/<pid>/maps` của process đang chạy trên target. Listing 15-10 hiển thị các memory segment của target process này sau khi nó được load đầy đủ và đang chạy.

LISTING 15-10 Memory segment từ `/proc/<pid>/maps` trên target

```
root@coyote:~# cat /proc/197/maps
00008000-00026000 r-xp 00000000 00:0e 4852444    /workspace/websdemo-stripped
0002d000-0002e000 rw-p 0001d000 00:0e 4852444    /workspace/websdemo-stripped
0002e000-0005e000 rwxp 0002e000 00:00 0          [heap]
40000000-40017000 r-xp 00000000 00:0a 4982583    /lib/ld-2.3.3.so
40017000-40019000 rw-p 40017000 00:00 0
4001e000-4001f000 r--p 00016000 00:0a 4982583    /lib/ld-2.3.3.so
4001f000-40020000 rw-p 00017000 00:0a 4982583    /lib/ld-2.3.3.so
40020000-4011d000 r-xp 00000000 00:0a 4982651    /lib/tls/libc-2.3.3.so
4011d000-40120000 ---p 000fd000 00:0a 4982651    /lib/tls/libc-2.3.3.so
40120000-40124000 rw-p 000f8000 00:0a 4982651    /lib/tls/libc-2.3.3.so
40124000-40126000 r--p 000fc000 00:0a 4982651    /lib/tls/libc-2.3.3.so
40126000-40128000 rw-p 000fe000 00:0a 4982651    /lib/tls/libc-2.3.3.so
40128000-4012a000 rw-p 40128000 00:00 0
4012a000-40133000 r-xp 00000000 00:0a 4982652    /lib/tls/libnss_files-2.3.3.so
40133000-4013a000 ---p 00009000 00:0a 4982652    /lib/tls/libnss_files-2.3.3.so
4013a000-4013b000 r--p 00008000 00:0a 4982652    /lib/tls/libnss_files-2.3.3.so
4013b000-4013c000 rw-p 00009000 00:0a 4982652    /lib/tls/libnss_files-2.3.3.so
becaa000-becbf000 rwxp becaa000 00:00 0          [stack]
root@coyote:~#
```

Hãy chú ý mối tương quan giữa output `ldd` trên target trong Listing 15-8 và các memory segment hiển thị trong file system `/proc` cho process này. Vị trí bắt đầu Linux loader, tức đầu segment `.text`, là `0x40000000`, và vị trí bắt đầu `libc` là `0x40020000`. Đây là các virtual address nơi những phần này của ứng dụng đã được load; chúng được báo bởi lệnh `ldd` trên target. Tuy nhiên, load address do phiên bản cross của `ldd` báo trong Listing 15-9 (`0xdead1000` và `0xdead2000`) nhắc bạn rằng những library này không thể được load trên host system vì chúng là binary cho ARM architecture. Những load address này chỉ là placeholder.

## 15.4 Debug nhiều task

Nhìn chung, nhà phát triển gặp hai tình huống debug khác nhau khi làm việc với nhiều thread thực thi. Process có thể tồn tại trong address space riêng hoặc chia sẻ address space và các system resource khác với những thread thực thi khác. Tình huống thứ nhất, các process độc lập không chia sẻ address space, phải được debug bằng các debug session riêng biệt. Không có gì ngăn bạn sử dụng `gdbserver` trên nhiều process của target system và gọi các GDB riêng trên development host để điều phối việc debug nhiều process có phối hợp nhưng độc lập.

### 15.4.1 Debug nhiều process

Khi một process đang được debug bằng GDB sử dụng system call `fork()`[^4] để tạo một process mới, GDB có thể thực hiện một trong hai cách. Nó có thể tiếp tục điều khiển và debug parent process, hoặc dừng debug parent process rồi attach vào child process vừa được tạo. Bạn có thể điều khiển hành vi này bằng lệnh `set follow-fork-mode`. Hai mode là follow parent và follow child. Hành vi mặc định là GDB theo dõi parent. Trong trường hợp này, child process thực thi ngay khi fork thành công.

Listing 15-11 tái hiện code snippet đơn giản fork nhiều process từ routine `main()`.

LISTING 15-11 Dùng `fork()` sinh child process

```
...
  for( i=0; i<MAX_PROCESSES; i++ ) {
    /* Creating child process */
    pid[i] = fork();            /* Parent gets non-zero PID */
    if ( pid[i] == -1 ) {
      perror(“fork failed”);
      exit(1);
    }

    if ( pid[i] == 0 ) {      /* Indicates child’s code path */
      worker_process();       /* The forked process calls this */
    }
  }

  /* Parent’s main control loop */
  while ( 1 ) {
...
  }
```

Vòng lặp đơn giản này tạo `MAX_PROCESSES` process mới bằng system call `fork()`. Mỗi process vừa tạo thực thi một phần code được định nghĩa bởi function `worker_process()`. Khi code này chạy dưới GDB ở mode mặc định, GDB phát hiện các thread thực thi mới (process) được tạo nhưng vẫn attach vào thread thực thi của parent. Listing 15-12 minh họa GDB session này.

LISTING 15-12 GDB trong `follow-fork-mode` = `parent`

```
(gdb) target remote 192.168.1.141:2001
0x40000790 in ?? ()
(gdb) b main
Breakpoint 1 at 0x8888: file forker.c, line 104.
(gdb) c
Continuing.
[New Thread 356]
[Switching to Thread 356]

Breakpoint 1, main (argc=0x1, argv=0xbe807dd4) at forker.c:104
104       time(&start_time);
(gdb) b worker_process
Breakpoint 2 at 0x8784: file forker.c, line 45.
(gdb) c
Continuing.
Detaching after fork from child process 357.
Detaching after fork from child process 358.
Detaching after fork from child process 359.
Detaching after fork from child process 360.
Detaching after fork from child process 361.
Detaching after fork from child process 362.
Detaching after fork from child process 363.
Detaching after fork from child process 364.
```

Lưu ý tám child process đã được tạo, có PID từ 357 đến 364. Parent process được tạo với PID 356. Khi breakpoint trong `main()` được chạm đến, chúng ta đặt một breakpoint ở routine `worker_process()`, routine mà mỗi child process thực thi sau `fork()`. Cho chương trình tiếp tục từ `main`, chúng ta thấy từng process mới được tạo và bị debugger detach. Chúng không bao giờ chạm breakpoint vì GDB attach vào main process, process không bao giờ thực thi routine `worker_process()`.

Nếu cần debug từng process, bạn phải thực thi một GDB session độc lập và attach vào child process sau khi nó được `forked()`. Tài liệu GDB được dẫn ở cuối chương phác thảo một kỹ thuật hữu ích: đặt lời gọi `sleep()` trong child process để có thời gian attach debugger vào process mới. Việc attach vào process mới được giải thích trong Mục 15.5.2, “Attach process đang chạy”.

Nếu chỉ cần follow child, đặt `follow-fork-mode` theo `child` trước parent tới system call `fork()`, như Listing 15-13.

LISTING 15-13 GDB trong `follow-fork-mode` = `child`

```
(gdb) target remote 192.168.1.141:2001
0x40000790 in ?? ()
(gdb) set follow-fork-mode child
(gdb) b worker_process
Breakpoint 1 at 0x8784: file forker.c, line 45.
(gdb) c
Continuing.
[New Thread 401]
Attaching after fork to child process 402.
[New Thread 402]
[Switching to Thread 402]

Breakpoint 1, worker_process () at forker.c:45
45        int my_pid = getpid();
(gdb) c
Continuing.
```

Ở đây, chúng ta thấy parent process được tạo với PID 401. Khi child đầu tiên được tạo bởi system call `fork()`, GDB âm thầm detach khỏi luồng thực thi của parent và attach vào child process vừa được tạo có PID 402. GDB lúc này điều khiển child process đầu tiên và dừng theo breakpoint được đặt tại `worker_process()`. Tuy nhiên, lưu ý rằng các child process khác do đoạn code trong Listing 15-11 tạo ra không được debug và tiếp tục chạy cho đến khi tự hoàn tất.

Tóm lại, khi sử dụng GDB theo cách này, bạn chỉ có thể debug một process tại một thời điểm. Bạn có thể debug qua system call `fork()`, nhưng phải quyết định theo thread thực thi nào qua lời gọi `fork()`: parent hay child. Như đã đề cập ở đầu mục này, bạn có thể sử dụng nhiều GDB session độc lập nếu phải debug đồng thời nhiều process phối hợp với nhau.

### 15.4.2 Debug ứng dụng multithreaded

Nếu ứng dụng sử dụng POSIX thread library cho các threading function, GDB có thêm khả năng debug đồng thời một multithreaded application. Native POSIX Thread Library (NPTL) đã trở thành thread library tiêu chuẩn trên thực tế được dùng trong Linux system, bao gồm embedded Linux system. Phần thảo luận còn lại giả định bạn đang sử dụng thread library này.

Trong phần này, chúng ta dùng một chương trình minh họa tạo một số thread bằng library function `pthread_create()` trong một loop đơn giản. Sau khi các thread được tạo, routine `main()` chỉ chờ thao tác nhập từ bàn phím để kết thúc ứng dụng. Mỗi thread hiển thị một thông báo ngắn trên màn hình và sleep trong một khoảng thời gian được xác định trước. Listing 15-14 trình bày startup sequence trên target board.

LISTING 15-14 Startup demo thread trên target

```
root@coyote:/apps # gdbserver localhost:2001 ./tdemo
Process ./tdemo created; pid = 671
Listening on port 2001
Remote debugging from host 192.168.1.10
    ^^^^^  Previous three lines displayed by gdbserver

tdemo main() entered: My pid is 671
Starting worker thread 0
Starting worker thread 1
Starting worker thread 2
Starting worker thread 3
```

Giống các ví dụ trước, `gdbserver` chuẩn bị ứng dụng để chạy và chờ kết nối từ cross-gdb host-based. Khi GDB kết nối, `gdbserver` báo kết nối bằng message `Remote debugging`... Bây giờ chúng ta khởi động GDB trên host và kết nối. Listing 15-15 trình bày lại nửa này của session.

LISTING 15-15 Host GDB kết nối target thread demo

```
$ xscale_be-gdb -q tdemo
(gdb) target remote 192.168.1.141:2001
0x40000790 in ?? ()
(gdb) b tdemo.c:97
Breakpoint 1 at 0x88ec: file tdemo.c, line 97.
(gdb) c
Continuing.
[New Thread 1059]
[New Thread 1060]
[New Thread 1061]
[New Thread 1062]
[New Thread 1063]
[Switching to Thread 1059]

Breakpoint 1, main (argc=0x1, argv=0xbefffdd4) at tdemo.c:98
98              int c = getchar();
(gdb)
```

Ở đây, chúng ta kết nối đến target, tạo message `Remote debugging`... trong Listing 15-14, đặt breakpoint ngay sau vòng lặp tạo các thread mới rồi tiếp tục. Khi một thread mới được tạo, GDB hiển thị thông báo cùng thread ID. Thread 1059 là ứng dụng `tdemo`, thực hiện công việc trực tiếp từ function `main()`. Các thread từ 1060 đến 1063 là những thread mới được tạo từ lời gọi `pthread_create()`.

Khi GDB chạm breakpoint, nó hiển thị message `[Switching to Thread 1059]`, cho biết đây là thread thực thi đã gặp breakpoint. Nó là active thread của debug session, được gọi là current thread trong tài liệu GDB.

GDB cho phép chúng ta chuyển giữa các thread và thực hiện những thao tác debug thông thường như đặt thêm breakpoint, kiểm tra dữ liệu, hiển thị backtrace và làm việc với từng stack frame trong current thread. Listing 15-16 cung cấp ví dụ về những thao tác này, tiếp tục debug session được bắt đầu trong Listing 15-15.

LISTING 15-16 GDB operation trên thread

```
...
(gdb) c
Continuing.
                 <<< Ctl-C to interrupt program execution
Program received signal SIGINT, Interrupt.
0x400db9c0 in read () from /opt/mvl/.../lib/tls/libc.so.6
(gdb) i threads
  5 Thread 1063  0x400bc714 in nanosleep ()
   from /opt/mvl/.../lib/tls/libc.so.6
  4 Thread 1062  0x400bc714 in nanosleep ()
   from /opt/mvl/.../lib/tls/libc.so.6
  3 Thread 1061  0x400bc714 in nanosleep ()
   from /opt/mvl/.../lib/tls/libc.so.6
  2 Thread 1060  0x400bc714 in nanosleep ()
   from /opt/mvl/.../lib/tls/libc.so.6
* 1 Thread 1059  0x400db9c0 in read ()
   from /opt/mvl/.../lib/tls/libc.so.6
(gdb) thread 4               <<< Make Thread 4 the current thread
[Switching to thread 4 (Thread 1062)]
#0  0x400bc714 in nanosleep ()
   from /opt/mvl/.../lib/tls/libc.so.6
(gdb) bt
#0  0x400bc714 in nanosleep ()
   from /opt/mvl/.../lib/tls/libc.so.6
#1  0x400bc4a4 in __sleep (seconds=0x0) at sleep.c:137
#2  0x00008678 in go_to_sleep (duration=0x5) at tdemo.c:18
#3  0x00008710 in worker_2_job (random=0x5) at tdemo.c:36
#4  0x00008814 in worker_thread (threadargs=0x2) at tdemo.c:67
#5  0x40025244 in start_thread (arg=0xfffffdfc) at pthread_create.c:261
#6  0x400e8fa0 in clone () at../sysdeps/unix/sysv/linux/arm/clone.S:82
#7  0x400e8fa0 in clone () at../sysdeps/unix/sysv/linux/arm/clone.S:82
(gdb) frame 3
#3  0x00008710 in worker_2_job (random=0x5) at tdemo.c:36
36          go_to_sleep(random);
(gdb) l                    <<< Generate listing of where we are
31      }
32
33      static void worker_2_job(int random)
34      {
35          printf(“t2 sleeping for %d\n”, random);
36          go_to_sleep(random);
37      }
```

LISTING 15-16 Tiếp

```
38
39      static void worker_3_job(int random)
40      {
(gdb)
```

Có một số điểm cần đề cập. GDB gán một giá trị integer riêng cho mỗi thread và sử dụng chúng để tham chiếu đến từng thread. Khi một thread chạm breakpoint, tất cả thread trong process đều được dừng để kiểm tra. GDB đánh dấu current thread bằng dấu hoa thị (`*`). Bạn có thể đặt breakpoint riêng trong từng thread, dĩ nhiên với giả định chúng tồn tại trong context riêng. Nếu đặt breakpoint ở phần code chung mà mọi thread đều thực thi, thread chạm breakpoint đầu tiên là bất kỳ.

GDB user documentation cuối chương có thêm thông tin hữu ích debug multithreaded environment.

### 15.4.3 Debug bootloader/Flash code

Debug code nằm trong Flash có những thách thức riêng. Giới hạn rõ ràng nhất là cách GDB và `gdbserver` phối hợp để đặt breakpoint trên target. Khi thảo luận GDB remote serial protocol trong Chương 14, bạn đã tìm hiểu cách chèn breakpoint vào ứng dụng.[^5] GDB thay opcode tại vị trí breakpoint bằng một opcode architecture-specific chuyển quyền điều khiển cho debugger. Tuy nhiên, trong ROM hoặc Flash, GDB không thể ghi đè opcode nên phương pháp đặt breakpoint này không có tác dụng.

Phần lớn processor hiện đại chứa một số debug register có thể được sử dụng để vượt qua giới hạn này. Các khả năng đó phải được hỗ trợ bởi hardware probe hoặc stub architecture- và processor-specific. Kỹ thuật phổ biến nhất để debug code nằm trong Flash và ROM là sử dụng JTAG hardware probe. Những probe này hỗ trợ đặt hardware breakpoint processor-specific. Chủ đề này đã được trình bày chi tiết trong Chương 14. Xem Mục 14.4.2, “Debug với JTAG probe”, để biết thêm chi tiết.

## 15.5 Các remote debug option bổ sung

Đôi khi bạn muốn dùng serial port để remote debugging. Với những tác vụ khác, bạn có thể thấy hữu ích khi attach debugger vào một process đang chạy. Các thao tác đơn giản nhưng hữu ích này được trình bày chi tiết dưới đây.

### 15.5.1 Debug bằng serial port

Debug bằng serial port khá đơn giản. Dĩ nhiên, bạn phải có serial port sẵn trên target mà không bị một process khác, chẳng hạn serial console, sử dụng. Host cũng có cùng giới hạn: phải có một serial port khả dụng. Nếu đáp ứng cả hai điều kiện, chỉ cần thay IP address:port number truyền cho `gdbserver` bằng thông tin chỉ định serial port. Dùng kỹ thuật tương tự khi kết nối đến target từ GDB host-based.

Trên target:

```
root@coyote:/apps # gdbserver /dev/ttyS0 ./tdemo
Process ./tdemo created; pid = 698
Remote debugging using /dev/ttyS0
```

Từ host:

```
$ xscale_be-gdb -q tdemo
(gdb) target remote /dev/ttyS1
Remote debugging using /dev/ttyS1
0x40000790 in ?? ()
```

### 15.5.2 Attach process đang chạy

Thường có lợi khi nối process xem trạng thái lúc chạy thay kill, khởi động lại. Với `gdbserver` việc này rất dễ:

```
root@coyote:/apps # ps ax | grep tdemo
 1030 pts/0    Sl+    0:00 ./tdemo
root@coyote:/apps # gdbserver localhost:2001 --attach 1030
Attached; pid = 1030
Listening on port 2001
```

Khi đã kiểm tra xong process đang debug, bạn có thể thực hiện lệnh GDB `detach`. Lệnh này detach `gdbserver` khỏi ứng dụng trên target và kết thúc debug session. Ứng dụng tiếp tục từ vị trí đã dừng. Đây là kỹ thuật rất hữu ích để kiểm tra một chương trình đang chạy. Tuy nhiên, cần biết rằng khi attach vào process, nó dừng lại để chờ chỉ dẫn của bạn. Nó không tiếp tục thực thi cho đến khi được yêu cầu bằng lệnh `continue` hoặc `detach`. Cũng lưu ý rằng có thể sử dụng lệnh `detach` ở hầu như bất kỳ thời điểm nào để kết thúc debug session và để ứng dụng tiếp tục chạy trên target.

## 15.6 Tổng kết

- Remote (cross) debugging cho symbolic debugging dùng workstation làm phần nặng, giữ tài nguyên target often-scarce.

- `gdbserver` chạy target, làm cầu nối cross-gdb host và process debug trên target.

- GDB trên host thường sử dụng IP connection qua Ethernet để gửi command đến và nhận command từ `gdbserver` chạy trên target. GDB remote protocol được sử dụng giữa GDB và `gdbserver`.

- GDB có thể dừng khi có shared library event và tự động load shared library symbol khi chúng có sẵn. Toolchain cần được cấu hình cho các default path trên hệ thống cross-development. Hoặc bạn có thể sử dụng GDB command để đặt các search path cho shared library object.

- GDB debug được nhiều independent process bằng nhiều session đồng thời.

- GDB có thể follow forked process trên system call `fork()`. Mặc định tiếp debug parent—bên gọi `fork()`.

- GDB có tính năng giúp debug multithreaded application viết POSIX thread API. Linux thread library mặc định hiện là Native POSIX Thread Library (NPTL).

- GDB hỗ trợ attach, detach process đang chạy.

### 15.6.1 Gợi ý đọc thêm

GDB: The GNU Project Debugger Tài liệu trực tuyến http://sourceware.org/gdb/onlinedocs/

GDB Pocket Reference Arnold Robbins O’Reilly Media, 2005

[^1]: Hãy nhớ sử dụng cross version của `strip`, chẳng hạn `ppc_82xx-strip`.

[^2]: Bạn hoàn toàn có thể truyền những vị trí này cho compiler, linker và debugger mỗi lần gọi chúng. Tuy nhiên, một embedded Linux distribution tốt sẽ cấu hình sẵn các giá trị mặc định này trong toolchain để thuận tiện cho developer.

[^3]: Tất nhiên, compiler của bạn cũng cần biết vị trí các target file, chẳng hạn system header file và library header file architecture-specific.

[^4]: Chúng ta sẽ dùng thuật ngữ system call, nhưng `fork()` trong context này thực ra là một C library function; function đó sau đó gọi system call `Linux sys_fork()`.

[^5]: Tham khảo Listing 14-7.
