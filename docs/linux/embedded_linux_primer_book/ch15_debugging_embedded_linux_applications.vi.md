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

Chương 13, “Công cụ phát triển”, khảo sát nhiều debugging tool quan trọng. `strace`, `ltrace` quan sát, mô tả hành vi process và thường cô lập vấn đề. `dmalloc` giúp cô lập memory leak, profile memory usage. `ps`, `top` hữu ích xem process state. Công cụ tương đối nhỏ này thiết kế chạy trực tiếp target hardware.

Debug Linux application code trên embedded system có thách thức riêng. Tài nguyên target thường hạn chế. Giới hạn RAM, nonvolatile storage có thể ngăn chạy tool target-based. Có thể không Ethernet port hay connection high-speed khác. Target có thể không graphical display, keyboard, mouse.

Đây là nơi tool cross-development và môi trường NFS root mount rất có lợi. Nhiều tool, đặc biệt GDB, thiết kế thực thi trên development host trong khi debug code remote target. GDB dùng debug tương tác target code hoặc phân tích hậu kiểm core file do application crash sinh. Chi tiết application core dump analysis ở Chương 13.

## 15.2 Remote (cross) debugging

Tool Cross-development phát triển chủ yếu khắc phục giới hạn tài nguyên embedded platform. Ứng dụng modest-size compile symbolic debug information dễ vượt vài megabyte. Với cross debugging, development host làm phần nặng. Khi gọi cross GDB trên host, truyền ELF file compile symbolic debug information. Trên target có thể strip[^1] mọi debug information không cần khỏi ELF file để image nhỏ nhất.

Đã giới thiệu `readelf` Chương 13. Trong Chương 14, “Kỹ thuật debug kernel”, dùng xem debug information trong ELF file compile symbolic debugging information. Listing 15-1 chứa output `readelf` cho web server nhỏ compile ARM architecture.

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

Listing 15-1 cho nhiều section chứa debug information. Section `.comment` chứa hơn 2KB (0x940) thông tin không cần cho hoạt động ứng dụng. Kích thước file mẫu gồm debug information hơn 275KB như sau:

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

Ở đây strip cả symbolic debug information, section `.comment` khỏi executable. Chỉ tên stripped binary bằng switch command-line `-o`. Thấy stripped binary nhỏ hơn nửa gốc. Tất nhiên ứng dụng lớn tiết kiệm còn đáng kể hơn. Linux kernel gần đây compile debug information lớn hơn 18MB. Sau strip như Listing 15-2, binary chỉ hơn 2MB chút!

Debug kiểu này đặt stripped binary trên target và giữ unstripped copy cục bộ trên workstation chứa symbolic information cần. Dùng `gdbserver` trên target board cung cấp interface về host, nơi chạy GDB full-blown (tất nhiên cross-gdb) trên unstripped binary.

### 15.2.1 gdbserver

Dùng `gdbserver` cho chạy GDB từ workstation thay vì target embedded Linux. Lợi ích rõ: workstation thường CPU mạnh, memory, hard-drive storage nhiều hơn. Ngoài ra source code ứng dụng debug thường ở workstation, không embedded platform.

`gdbserver` là chương trình nhỏ trên target board, cho remote debugging process trên board. Gọi trên board chỉ chương trình debug, IP address, port number nghe request kết nối GDB. Listing 15-3 cho startup sequence khởi đầu session trên target.

LISTING 15-3 Khởi động `gdbserver` trên target board

```
$ gdbserver localhost:2001 websdemo-stripped
Process websdemo-stripped created; pid = 197
Listening on port 2001
```

Ví dụ chạy `gdbserver` cấu hình nghe Ethernet TCP/IP connection port 2001, sẵn debug stripped binary `websdemo-stripped`.

Từ workstation, chạy GDB với tên binary executable chứa symbolic debug information muốn debug làm argument. Sau khởi tạo, gọi lệnh nối remote target board. Listing 15-4 cho chuỗi.

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

Listing 15-4 gọi cross-gdb trên host. Khi chạy gọi lệnh GDB `target remote`, khiến GDB khởi tạo TCP/IP connection từ workstation tới target IP chỉ định port 2001. Khi `gdbserver` chấp nhận, in dòng tương tự:

```
Remote debugging from host 192.168.0.10
```

Giờ GDB nối process `gdbserver` target, sẵn nhận GDB command. Phần còn lại giống hệt debug local application. Đây là tool mạnh, cho dùng workstation cho debug session, chỉ để GDB stub nhỏ ít can thiệp và chương trình debug trên target. Nếu thắc mắc, `gdbserver` cho ARM target này chỉ 54KB như sau:

```
root@coyote:~# ls -l /usr/bin/gdbserver
-rwxr-xr-x  1 root root 54344 Jun 26  2009 /usr/bin/gdbserver
```

Một lưu ý thường thành FAQ trên mailing list. Phải dùng GDB trên host cấu hình cross debugger: binary chạy trên workstation (thường x86), hiểu binary executable image compile cho architecture khác. Đây là sự thật quan trọng thường bị bỏ qua. Không thể debug Power Architecture target bằng native GDB trong Ubuntu desktop Linux điển hình. Phải có GDB cấu hình theo tổ hợp host, target.

Khi gọi, GDB hiện banner vài dòng thông tin rồi compiled configuration. Listing 15-5 là GDB dùng trong một số ví dụ sách, thuộc embedded Linux distribution MontaVista Software cấu hình Power Architecture cross- development.

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

Chú ý dòng cuối startup message. Đây là cấu hình compile vào bản GDB này: chạy trên x86 (i686) PC host GNU/Linux, debug binary compile cho Power Architecture processor GNU/Linux. Chỉ bởi variable `--host`, `--target` trong banner text. Cũng là phần configuration string truyền `./configure` khi build GDB.

## 15.3 Debug với shared library

Giờ hiểu cách remote debug bằng GDB host, `gdbserver` target, chuyển tới shared library, debug symbol phức tạp. Trừ khi ứng dụng statically linked executable (link bằng switch command-line linker `-static`), nhiều symbol tham chiếu code ngoài ứng dụng. Rõ nhất standard C library routine `fopen`, `printf`, `malloc`, `memcpy`. Ít rõ hơn là function application-specific như `jack_transport_locate()` (routine từ JACK audio server low-latency), gọi library function ngoài standard C library.

Để có symbol routine này phải đáp ứng hai yêu cầu GDB:

- Có debug version của library.

- GDB biết nơi tìm.

Nếu không có debug version, vẫn debug ứng dụng được nhưng không có debug information cho library routine được gọi. Thường hoàn toàn chấp nhận—trừ khi đang phát triển shared library object trong dự án embedded.

Xem lại Listing 15-4 gọi GDB trên remote target. Sau kết nối bằng `target remote`, GDB trả phản hồi two-line:

```
Remote debugging using 192.168.1.141:2001
0x40000790 in ?? ()
```

Điều này xác nhận GDB nối target IP, port chỉ định. Sau đó báo program counter tại `0x40000790`. Vì sao dấu hỏi thay symbolic location? Vì đây Linux dynamic loader (`ld-x.y.z.so`), platform này không có debug symbol cho shared library. Làm sao biết?

Nhớ file system `/proc` Chương 9, “File system”. Entry hữu ích hơn là maps (Listing 9-16 Chương 9) trong directory structure per-process. Biết target application PID từ output `gdbserver` Listing 15-3: PID 197. Nhờ đó xem memory segment dùng ngay sau startup, như Listing 15-6.

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

Thấy ứng dụng target `websdemo-stripped` chiếm hai segment. Đầu là executable segment read-only tại `0x8000`, sau là data segment read-write tại `0x2d000`. Segment thứ ba đáng quan tâm: Linux dynamic linker executable code segment, bắt đầu `0x40000000`. Điều tra thêm xác nhận GDB đang ở dòng code đầu dynamic linker trước mọi application code riêng. Dùng cross `readelf` xác nhận starting address:

```
# xscale_be-readelf -S ld-2.3.3.so | grep \.text
[ 9] .text    PROGBITS    00000790 000790 012c6c 00  AX  0   0 16
```

Từ dữ liệu kết luận address GDB báo startup là instruction đầu `ld-2.3.3.so`, Linux dynamic linker/loader. Có thể dùng kỹ thuật hình dung sơ vị trí code nếu thiếu symbolic debug information cho process/shared library.

Nhớ đang thực thi cross command `readelf` trên host. Vì thế file `ld-2.3.3.so`, bản thân XScale binary object, phải truy cập được từ host. Thường file nằm trên host, thuộc embedded Linux distribution cài ở đó.

### 15.3.1 Shared library event trong GDB

GDB có thể báo shared library event, hữu ích hiểu hành vi ứng dụng/Linux loader hoặc đặt breakpoint trong shared library routine muốn debug, step. Listing 15-7 minh họa. Bình thường hiện complete path library. Listing chỉnh để dễ đọc.

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

Khi mới debug session, chưa load shared library. Thấy qua lệnh `i shared` đầu, hiển thị library đang load. Đặt breakpoint tại function `main()` ứng dụng, thấy hai shared library đã load: Linux dynamic linker/loader và standard C library component `libc`.

Từ đây gọi `set stop-on-solib-event`, continue. Khi ứng dụng thử function từ shared library khác, library được load. Nếu thắc mắc, function `gethostbyname()` được gặp, gây load shared object tiếp.

Ví dụ minh họa khái niệm cross-development quan trọng. Binary application (ELF image) trên target chứa thông tin library cần resolve external reference. Xem dễ bằng `ldd`, giới thiệu Chương 11, “BusyBox”, chi tiết Chương 13. Listing 15-8 cho output `ldd` trên target.

LISTING 15-8 `ldd` thực thi trên target board

```
root@coyote:/workspace# ldd websdemo
        libc.so.6 => /lib/tls/libc.so.6 (0x40020000)
        /lib/ld-linux.so.3 (0x40000000)
root@coyote:/workspace#
```

Chú ý path library trên target là absolute path bắt đầu `/lib` trên root file system. Nhưng GDB host không dùng được để tìm library, nếu làm sẽ load library sai architecture. Host có lẽ x86, còn target ví dụ ARM XScale.

Nếu gọi cross `ldd`, thấy path cấu hình trước trong toolchain. Toolchain phải biết nơi file trên host.[^2] Listing 15-9 minh họa. Một lần nữa chỉnh listing dễ đọc, path dài viết tắt.

LISTING 15-9 `ldd` thực thi trên development host

```
$ xscale_be-ldd websdemo
   libc.so.6 => /opt/mvl/.../xscale_be/target/lib/libc.so.6 (0xdead1000)
   ld-linux.so.3 => /opt/mvl/.../xscale_be/target/lib/ld-linux.so.3 (0xdead2000)
$
```

Cross toolchain nên cấu hình sẵn library location. Không chỉ host GDB mà compiler/linker cũng cần biết.[^3] GDB báo nơi cấu hình tìm library bằng `show solib-absolute-prefix`:

```
(gdb) show solib-absolute-prefix
Prefix for loading absolute shared library symbol files is
“/opt/mvl/pro/devkit/arm/xscale_be/target”.
(gdb)
```

Có thể đặt, đổi nơi GDB tìm shared library bằng `set solib-absolute-prefix`, `set solib-search-path`. Nếu phát triển shared library module riêng hoặc custom location, dùng `solib-search-path` báo GDB nơi tìm. Xem online GDB manual cuối chương để thêm chi tiết.

Lưu ý cuối về `ldd`. Có thể thấy address Listing 15-8, 15-9 gắn library. `ldd` hiện load address đầu code segment như khi chương trình load bởi Linux dynamic linker/loader. Chạy trên target, address Listing 15-5 hoàn toàn hợp lý, liên hệ được với listing `/proc/<pid>/maps` process trên target. Listing 15-10 hiện memory segment khi process đã load hoàn chỉnh, chạy.

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

Chú ý liên hệ target output `ldd` Listing 15-8 với segment trong file system `/proc` cho process. Đầu Linux loader (đầu segment `.text`) là `0x40000000`, đầu `libc` là `0x40020000`. Đây là virtual address nơi các phần ứng dụng được load, báo bởi target `ldd`. Tuy nhiên load address từ cross `ldd` Listing 15-9 (`0xdead1000`, `0xdead2000`) nhắc rằng không thể load library trên host (là ARM binary). Chỉ là placeholder.

## 15.4 Debug nhiều task

Nhìn chung lập trình viên gặp hai tình huống debug nhiều execution thread. Process có thể ở address space riêng hoặc dùng chung address space (và system resource khác) với thread khác. Tình huống đầu (independent process không chung address space) phải dùng debug session độc lập. Không gì ngăn dùng `gdbserver` trên nhiều process target, dùng các lần gọi GDB riêng trên host điều phối debug nhiều process phối hợp nhưng độc lập.

### 15.4.1 Debug nhiều process

Khi process dưới GDB dùng system call `fork()`[^4] sinh process mới, GDB có hai hướng: tiếp tục điều khiển/debug parent hoặc ngừng debug parent, attach child mới. Điều khiển bằng `set follow-fork-mode`. Hai mode follow parent, follow child. Mặc định follow parent; child thực thi ngay sau fork thành công.

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

Loop đơn giản tạo `MAX_PROCESSES` process mới bằng system call `fork()`. Mỗi process thực thi code function `worker_process()`. Chạy dưới GDB mặc định, GDB phát hiện execution thread (process) mới nhưng vẫn attach parent. Listing 15-12 minh họa.

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

Chú ý tám child process sinh với PID 357–364. Parent PID 356. Khi breakpoint `main()` chạm, nhập breakpoint ở routine `worker_process()` mà mỗi child thực thi sau `fork()`. Cho chương trình continue từ `main`, thấy process mới sinh, detach bởi debugger. Không chạm breakpoint vì GDB attach main process, không bao giờ thực thi `worker_process()`.

Nếu cần debug từng process, phải chạy GDB session độc lập, attach child sau `forked()`. GDB documentation cuối chương nêu kỹ thuật thêm `sleep()` trong child, cho thời gian attach debugger. Attach process mới giải thích Phần 15.5.2, “Attach process đang chạy”.

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

Thấy parent PID 401. Khi child đầu sinh bởi system call `fork()`, GDB âm thầm detach parent, attach child PID 402. Giờ điều khiển child đầu, tôn trọng breakpoint `worker_process()`. Nhưng child khác sinh bởi code Listing 15-11 không debug và tiếp tục tự chạy đến xong.

Tóm lại dùng GDB kiểu này chỉ debug một process mỗi lần. Có thể debug qua system call `fork()` nhưng phải quyết định theo execution thread nào qua `fork()`—parent hay child. Như đầu phần, dùng nhiều GDB session độc lập nếu cần debug hơn một process phối hợp cùng lúc.

### 15.4.2 Debug ứng dụng multithreaded

Nếu ứng dụng dùng POSIX thread library cho threading function, GDB có thêm khả năng concurrent debugging multithreaded application. Native POSIX Thread Library (NPTL) trở thành chuẩn thực tế trên Linux system, gồm embedded. Phần còn lại giả định dùng library này.

Phần này dùng demonstration program sinh nhiều thread bằng library function `pthread_create()` trong loop đơn giản. Sau sinh, routine `main()` chỉ chờ keyboard input để kết thúc ứng dụng. Mỗi thread hiện thông báo ngắn, sleep thời gian định sẵn. Listing 15-14 cho startup sequence trên target.

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

Như trước, `gdbserver` chuẩn bị ứng dụng chạy, đợi cross-gdb host-based. Khi GDB nối, `gdbserver` báo bằng message `Remote debugging`... Giờ khởi động GDB trên host, nối. Listing 15-15 tái hiện nửa này của session.

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

Ở đây nối target (gây message `Remote debugging`... trong Listing 15-14), đặt breakpoint ngay sau loop sinh thread, continue. Khi thread tạo, GDB báo cùng thread ID. Thread 1059 là application `tdemo` làm việc trực tiếp từ function `main()`. Thread 1060–1063 mới tạo từ `pthread_create()`.

Khi chạm breakpoint, GDB hiện `[Switching to Thread 1059]` chỉ đây là execution thread gặp breakpoint. Nó là active thread của session, gọi current thread trong documentation GDB.

GDB cho chuyển giữa thread, làm debug operation thường như đặt breakpoint thêm, xem data, backtrace, làm với stack frame riêng trong current thread. Listing 15-16 cho ví dụ, tiếp session Listing 15-15.

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

Vài điểm đáng nói. GDB gán integer riêng mỗi thread, dùng tham chiếu từng thread. Khi breakpoint chạm trong thread, mọi thread trong process halt để xem. GDB đánh dấu current thread bằng sao (`*`). Có thể đặt breakpoint riêng từng thread—giả định tồn tại context riêng. Nếu đặt ở code chung mọi thread chạy, thread đầu chạm là tùy ý.

GDB user documentation cuối chương có thêm thông tin hữu ích debug multithreaded environment.

### 15.4.3 Debug bootloader/Flash code

Debug code trong Flash có thách thức riêng. Giới hạn rõ nhất cách GDB, `gdbserver` phối hợp đặt target breakpoint. Khi nói GDB remote serial protocol Chương 14, bạn học cách insert breakpoint.[^5] GDB thay opcode vị trí breakpoint bằng opcode architecture-specific chuyển quyền debugger. Nhưng trong ROM/Flash, không ghi đè opcode được nên phương pháp vô dụng.

Phần lớn processor hiện đại có debug register để vượt giới hạn. Khả năng này phải được hỗ trợ bởi hardware probe/stub architecture- và processor-specific. Kỹ thuật phổ biến nhất debug code Flash/ROM là JTAG hardware probe, hỗ trợ đặt hardware breakpoint processor-specific. Chi tiết Chương 14, Phần 14.4.2, “Debug với JTAG probe”.

## 15.5 Các remote debug option bổ sung

Đôi khi muốn serial port cho remote debugging. Tác vụ khác có thể hữu ích attach debugger tới process đang chạy. Những operation đơn giản hữu ích trình bày đây.

### 15.5.1 Debug bằng serial port

Debug bằng serial port khá dễ. Tất nhiên target phải có serial port không bị process khác dùng như serial console. Host cũng vậy. Nếu đáp ứng cả hai, chỉ thay IP address:port number truyền cho `gdbserver` bằng serial port specification. Dùng tương tự khi nối target từ GDB host-based.

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

Khi xem xong process debug, gọi GDB command `detach`. Nó detach `gdbserver` khỏi ứng dụng target, kết thúc session. Ứng dụng tiếp từ chỗ dừng. Kỹ thuật rất hữu ích xem running program. Nhưng khi attach, process halt đợi chỉ dẫn. Không resume tới khi yêu cầu bằng `continue` hoặc `detach`. Cũng chú ý dùng `detach` gần bất cứ lúc nào để kết thúc session, để ứng dụng tiếp tục trên target.

## 15.6 Tổng kết

- Remote (cross) debugging cho symbolic debugging dùng workstation làm phần nặng, giữ tài nguyên target often-scarce.

- `gdbserver` chạy target, làm cầu nối cross-gdb host và process debug trên target.

- GDB host thường dùng IP connection Ethernet gửi, nhận command với `gdbserver` target. Dùng GDB remote protocol giữa GDB, `gdbserver`.

- GDB halt được trên shared library event, tự load symbol khi có. Toolchain nên cấu hình default path trên hệ thống cross-development. Hoặc dùng GDB command đặt search path shared library object.

- GDB debug được nhiều independent process bằng nhiều session đồng thời.

- GDB có thể follow forked process trên system call `fork()`. Mặc định tiếp debug parent—bên gọi `fork()`.

- GDB có tính năng giúp debug multithreaded application viết POSIX thread API. Linux thread library mặc định hiện là Native POSIX Thread Library (NPTL).

- GDB hỗ trợ attach, detach process đang chạy.

### 15.6.1 Gợi ý đọc thêm

GDB: The GNU Project Debugger Tài liệu trực tuyến http://sourceware.org/gdb/onlinedocs/

GDB Pocket Reference Arnold Robbins O’Reilly Media, 2005

[^1]: Nhớ dùng cross version `strip`, như `ppc_82xx-strip`.

[^2]: Hoàn toàn có thể truyền location cho compiler, linker, debugger mỗi lần gọi, nhưng embedded Linux distribution tốt cấu hình default trong toolchain để tiện.

[^3]: Tất nhiên compiler cũng cần nơi target file như system/library header file architecture-specific.

[^4]: Chúng ta dùng thuật ngữ system call, nhưng `fork()` ở context này thực là C library function, rồi gọi system call `Linux sys_fork()`.

[^5]: Tham khảo Listing 14-7.
