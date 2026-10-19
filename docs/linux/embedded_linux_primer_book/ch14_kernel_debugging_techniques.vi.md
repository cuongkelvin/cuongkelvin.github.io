# Chương 14. Kỹ thuật debug kernel

## Trong chương này

- 14\.1 Thách thức khi debug kernel 368

- 14\.2 Dùng KGDB debug kernel 369

- 14\.3 Kỹ thuật debug kernel 381

- 14\.4 Debugging Hardware-Assisted 410

- 14\.5 Khi không boot được 417

- 14\.6 Tổng kết 421

Yếu tố quyết định đáp ứng lịch phát triển thường nằm

ở hiệu quả tìm, sửa bug. Debug bên trong Linux

kernel có thể rất khó. Dù tiếp cận thế nào, kernel debugging

luôn phức tạp. Chương này khảo sát một số phức tạp

và trình bày ý tưởng, phương pháp cải thiện kỹ năng debug trong

kernel và device driver.

## 14.1 Thách thức khi debug kernel

Debug operating system hiện đại có nhiều thách thức. Virtual memory operating system có thách thức riêng. Đã qua thời có thể thay processor bằng in-circuit emulator. Processor quá nhanh, phức tạp. Hơn nữa pipeline architecture che chi tiết code-execution quan trọng, vì memory access trên bus có thể khác thứ tự code execution, đặc biệt do cache instruction stream nội bộ. Không phải luôn liên hệ được external bus activity với internal processor instruction execution, trừ mức khá thô.

Một số thách thức khi debug Linux kernel code:

- Linux kernel code tối ưu cao cho tốc độ thực thi ở nhiều nơi.

- Compiler dùng kỹ thuật tối ưu làm phức tạp liên hệ C source với machine instruction flow thực. Inline function là ví dụ.

- Single-stepping qua compiler optimized code thường cho kết quả lạ, bất ngờ.

- Virtual memory cách ly user space memory với kernel memory, khiến nhiều tình huống debug đặc biệt khó.

- Một số code không thể step qua bằng debugger truyền thống.

- Startup code có thể đặc biệt khó vì gần phần cứng và ít tài nguyên (không console, memory mapping hạn chế, v.v.).

Linux kernel đã trưởng thành thành operating system high-performance cạnh tranh với commercial operating system tốt nhất. Nhiều vùng kernel khó phân tích chỉ bằng đọc source code. Thường cần hiểu architecture và thiết kế chi tiết để hiểu code flow vùng cụ thể. Có vài sách tốt mô tả kernel design chi tiết; xem đề xuất cuối chương.

GCC là optimizing compiler. Mặc định Linux kernel compile với compiler flag `-O2`, bật nhiều thuật toán tối ưu có thể đổi cấu trúc, thứ tự code cơ bản.[^1] Ví dụ kernel dùng inline function rất nhiều. Đây là function nhỏ khai báo bằng keyword `inline`, khiến function được đưa trực tiếp vào execution thread thay vì sinh function call cùng overhead.[^2] Inline function cần optimization level tối thiểu `-O1`. Vì thế không thể tắt tối ưu, dù muốn vậy để dễ debug.

Trong nhiều vùng Linux kernel, single-stepping code khó hoặc không thể. Ví dụ rõ nhất là code path sửa virtual memory setting. Khi ứng dụng gọi system call vào kernel, address space process nhìn thấy thay đổi. Thực tế mọi transition có processor exception đều đổi operational context, có thể khó hoặc không thể single-step qua.

## 14.2 Dùng KGDB debug kernel

Hai phương pháp phổ biến cho symbolic source-level debugging trong Linux kernel:

- Dùng KGDB làm remote GDB agent

- Dùng hardware JTAG probe điều khiển processor

JTAG debugging trình bày trong Phần 14.4, “Debugging Hardware-Assisted”.

KGDB (Kernel GDB) là tập Linux kernel patch cung cấp interface tới GDB qua remote serial protocol.[^3] KGDB triển khai GDB stub giao tiếp cross-gdb trên host development workstation. Đến gần đây KGDB trên target cần serial connection tới host. Một số target hỗ trợ Ethernet, thậm chí USB. Hỗ trợ KGDB đầy đủ vẫn chưa trong mainline kernel.org kernel. Cần port KGDB sang target hoặc lấy embedded Linux distribution cho architecture, platform có KGDB. Phần lớn commercial embedded Linux distribution hiện nay hỗ trợ KGDB.

Cần lưu ý khác biệt architecture, platform về KGDB support. Trừ khi platform developer bật rõ KGDB, có thể không chạy trên platform cụ thể. Bạn thấy kernel configuration option KGDB khác giữa architecture, platform. Cách duy nhất bảo đảm là tự port hoặc lấy Linux kernel, distribution từ commercial vendor hỗ trợ KGDB trên platform. Xem reference documentation cuối chương.

Hình 14-1 cho KGDB debug setup. Dùng tối đa ba kết nối target board. Ethernet cho NFS root mount, telnet session từ host. Nếu board có ramdisk image trong Flash mount làm root file system, có thể bỏ Ethernet connection.

![Figure 14-1](images/ch14/fig14-01.png)

HÌNH 14-1 KGDB debug setup

Một serial port dành kết nối KGDB với GDB trên development host, serial port thứ hai tùy chọn làm console. Hệ thống chỉ một serial port khiến KGDB hơi phiền hơn.

Như Hình 14-1, debugger (cross-version GDB) chạy trên development host. KGDB thuộc kernel trên target. KGDB triển khai hook cần để nối GDB với target board, cho đặt breakpoint, xem memory và thực thi chương trình single-step.

### 14.2.1 Kernel configuration cho KGDB

Như đã nói, architecture, platform khác nhau về KGDB. Ví dụ sau dựa Power Architecture MPC8548 CPU trên CDS platform của Freescale Semiconductor, dùng MontaVista Linux distribution thương mại đã thêm hỗ trợ này. Một số tính năng ví dụ không có trong mainline kernel source vì đưa KGDB vào kernel đã lâu không được khuyến khích, chỉ gần đây (Linux 2.6.26) mới bắt đầu xuất hiện dạng generic.

KGDB là kernel feature, phải bật trong kernel. Chọn từ menu Kernel hacking như Hình 14-2. (Nhiều item bị bỏ để vừa trang; của bạn có nhiều entry trước option KGDB hơn.) Khi cấu hình phải chọn I/O driver cho KGDB. Ở đây chọn serial port qua KGDB\_8250. Chú ý Hình 14-2 còn bật compile kernel với debug information, thêm compiler flag `-g` vào build để symbolic debugging.

![Figure 14-2](images/ch14/fig14-02.png)

HÌNH 14-2 Kernel configuration cho KGDB

### 14.2.2 Boot target hỗ trợ KGDB

Sau khi build kernel hỗ trợ KGDB, phải bật lúc runtime. Nhìn chung bật bằng command-line switch trên kernel command line. Nếu compile hỗ trợ nhưng không bật bằng command-line switch, KGDB không làm gì. Khi bật, có thể yêu cầu kernel dừng tại breakpoint KGDB-enabled rất sớm trong boot cycle để kết nối target bằng GDB. Hình 14-3 cho logic tạo initial breakpoint khi bật KGDB.

![Figure 14-3](images/ch14/fig14-03.png)

HÌNH 14-3 Logic KGDB

KGDB cần serial port nối host.[^4] Bước đầu là bật serial port rất sớm trong boot process. Nhiều architecture phải map hardware UART vào kernel memory trước truy cập. Sau map address range, khởi tạo serial port. Sau đó cài debug trap handler cho processor exception trap vào debugger.

Listing 14-1 hiển thị terminal output khi boot bật KGDB. Ví dụ dựa Freescale MPC8548CDS reference board kèm bootloader U-Boot.

LISTING 14-1 Boot bật KGDB bằng U-Boot

```
=> setenv bootargs console=ttyS1,115200 root=/dev/nfs rw ip=dhcp kgdbwait
kgdb8250=ttyS1,115200
=> tftp 600000 mpc8548.uImage
Speed: 1000, full duplex
Using eTSEC0 device
TFTP from server 192.168.0.9; our IP address is 192.168.0.18
Filename ‘8548/uImage’.
Load address: 0x600000
Loading: #################################################################
         ##############################################################
done
Bytes transferred = 1854347 (1c4b8b hex)
=> tftp c00000 mpc8548.dtb
Speed: 1000, full duplex
Using eTSEC0 device
TFTP from server 192.168.0.9; our IP address is 192.168.0.18
Filename ‘8548/dtb’.
Load address: 0xc00000
Loading: ##
done
Bytes transferred = 16384 (4000 hex)
=> bootm 600000 - c00000
## Booting kernel from Legacy Image at 00600000 ...
   Image Name:   MontaVista Linux 6/2.6.27/freesc
   Image Type:   PowerPC Linux Kernel Image (gzip compressed)
   Data Size:    1854283 Bytes =  1.8 MB
   Load Address: 00000000
   Entry Point:  00000000
   Verifying Checksum ... OK
## Flattened Device Tree blob at 00c00000
   Booting using the fdt blob at 0xc00000
   Uncompressing Kernel Image ... OK
   Loading Device Tree to 007f9000, end 007fffff ... OK
kgdb8250: ttyS1 init delayed, use io/mmio/mbase syntax for early init.
Using MPC85xx CDS machine description
Memory CAM mapping: CAM0=256Mb, CAM1=0Mb, CAM2=0Mb residual: 0Mb
Linux version 2.6.27.28.freescale-8548cds.0908010910 (chris@pluto) (gcc version
4.3.3 (MontaVista Linux Sourcery G++ 4.3-217) ) #1 PREEMPT Mon Mar 29 11:09:48 EDT
2010
console [udbg0] enabled
setup_arch: bootmem
mpc85xx_cds_setup_arch()
<... many messages deleted ...>
Serial: 8250/16550 driver4 ports, IRQ sharing enabled
serial8250.0: ttyS0 at MMIO 0xe0004500 (irq = 42) is a 16550A
serial8250.0: ttyS1 at MMIO 0xe0004600 (irq = 42) is a 16550A
console handover: boot [udbg0] -> real [ttyS1]
kgdb: Registered I/O driver kgdb8250.
kgdb: Waiting for connection from remote gdb...
```

Phần lớn boot sequence quen từ U-Boot ở Chương 7, “Bootloader”. Nhớ kernel command line định nghĩa qua environment variable U-Boot `bootargs`. Chú ý thêm parameter `kgdbwait`, yêu cầu kernel ép early breakpoint và đợi host debugger (cross-gdb) kết nối.

Chú ý boot sequence chưa hoàn tất. Vì đặt `kgdbwait` trên command line, kernel khởi tạo đến khi load serial port driver rồi chạm breakpoint định sẵn. Tại đây đợi vô hạn external debugger kết nối.

Cũng chú ý kernel command-line parameter mới thứ hai. Architecture (Power), platform (8548CDS) này dùng 8250 serial driver và KGDB driver 8250-based đặc biệt ở `.../drivers/serial/8250_kgdb.c`. Phải báo KGDB dùng serial port nào bằng cú pháp tương tự mô tả console device.

Giờ kernel thiết lập, đợi host debugger, có thể bắt đầu debug session. Gọi cross-gdb từ host workstation, nối target qua GDB remote protocol. Ví dụ dùng chung serial port với console nên phải ngắt terminal emulator trước khi nối GDB. Listing 14-2 nêu quá trình kết nối, giả định đã thoát terminal emulator, giải phóng serial port cho GDB.

LISTING 14-2 Kết nối KGDB

```
$ ppc_85xx-gdb -q vmlinux
(gdb) target remote /dev/ttyS0
Remote debugging using /dev/ttyS0
0xc0058360 in kgdb_register_io_module (new_kgdb_io_ops=0x1)
    at kernel/kgdb.c:1802
1802        wmb(); /* Sync point before breakpoint */
(gdb) l
1797   * the debugger.
1798   */
1799  void kgdb_breakpoint(void)
1800  {
1801        atomic_set(&kgdb_setting_breakpoint, 1);
1802        wmb(); /* Sync point before breakpoint */
1803        arch_kgdb_breakpoint();
1804        wmb(); /* Sync point after breakpoint */
1805        atomic_set(&kgdb_setting_breakpoint, 0);
1806  }
(gdb)
```

Ở đây thực hiện ba hành động:

- Gọi cross-gdb, truyền kernel ELF file `vmlinux`

- Nối target bằng lệnh `target remote`

- Gọi lệnh `list`, viết tắt `l`, hiển thị vị trí source code

Dù có vẻ hiển nhiên, image `vmlinux` truyền GDB phải từ cùng kernel build sinh binary chạy target. Cũng phải compile với flag `-g` để chứa debug information. Nhớ Chương 13, “Công cụ phát triển”, Phần 13.5.2, có thể dùng cross-readelf xác minh image `vmlinux` có debug symbol. Dùng lệnh tương tự để kiểm tra debug section trong ELF file:

```
$ ppc_85xx-readelf -S vmlinux | grep debug
```

Khi gọi `target remote`, GDB hiện vị trí program counter (PC). Ví dụ kernel dừng trong function `kgdb_breakpoint()` tại dòng 1802 file `.../kernel/kgdb.c`. Khi gọi `continue` (`c`), thực thi tiếp từ đây.

### 14.2.3 Kernel breakpoint hữu ích

Giờ đã debug connection với kernel trên target. Khi gọi GDB continue (`c`), kernel tiếp tục boot, hoàn tất nếu không lỗi. Lúc này có thể muốn đặt breakpoint cho debug session cụ thể. Hai loại phổ biến nhất nêu ở Listing 14-3.

LISTING 14-3 Kernel breakpoint phổ biến

```
(gdb) b panic
Breakpoint 1 at 0xc02d1a84: file arch/powerpc/include/asm/thread_info.h, line 87.
(gdb) b sys_sync
Breakpoint 2 at 0xc00baae4: file fs/sync.c, line 41.
(gdb) c
Continuing.
```

Dùng lệnh GDB `breakpoint` viết tắt, nhập hai breakpoint. Một ở `panic()`, một ở sync system call entry `sys_sync()`. Đầu tiên cho gọi debugger nếu sự kiện sau gây panic, để xem system state lúc panic. Thứ hai hữu ích halt kernel, trap vào debugger từ user space bằng nhập lệnh `sync` trên terminal target hardware.

Giờ sẵn sàng debug. Có kernel KGDB-enabled trên target, dừng tại breakpoint KGDB-defined. Đã nối target bằng cross debugger host-based—ở đây gọi là `ppc_85xx-gdb`—và nhập hai system breakpoint hữu ích. Giờ hướng hoạt động debug vào việc cần làm.

Một lưu ý: theo định nghĩa không thể dùng KGDB step qua code trước `breakpoint()` dùng thiết lập kết nối kernel KGDB-enabled và cross-gdb trên host. Hình 14-3 xấp xỉ code thực thi trước KGDB giành quyền. Debug early code này cần debug probe hardware-assisted, trình bày Phần 14.4, “Debugging Hardware-Assisted”.

Sau initial breakpoint và gọi `continue`, có thể dừng bất kỳ lúc nào bằng Ctrl-C tới cross-gdb. Listing 14-4 cho ví dụ.

LISTING 14-4 Kernel debug session đang tiến hành

```
(gdb) c
Continuing.

<<<<<<< User types Ctl-C here >>>>>>>>>

Program received signal SIGTRAP, Trace/breakpoint trap.
0xc0058048 in kgdb_breakpoint () at kernel/kgdb.c:1802
1802        wmb(); /* Sync point before breakpoint */
(gdb) bt
#0  0xc0058048 in kgdb_breakpoint () at kernel/kgdb.c:1802
#1  0xc019bcdc in kgdb8250_interrupt (irq=<value optimized out>,
    dev_id=<value optimized out>) at drivers/serial/8250_kgdb.c:145
#2  0xc005a4f0 in handle_IRQ_event (irq=42, action=0xcf80af20)
    at kernel/irq/handle.c:140
#3  0xc005c19c in handle_fasteoi_irq (irq=42, desc=0xc039a950)
    at kernel/irq/chip.c:424
#4  0xc0004b04 in do_IRQ (regs=<value optimized out>)
    at include/linux/irq.h:289
#5  0xc000f310 in ret_from_except_full ()
#6  0xc0008144 in cpu_idle () at arch/powerpc/kernel/idle.c:59
#7  0xc02d022c in rest_init () at init/main.c:481
#8  0xc036e75c in start_kernel () at init/main.c:691
#9  0xc00003d0 in skpinv ()
(gdb)
```

Thấy ảnh hưởng compiler optimization ở Listing 14-4, thảo luận thêm Phần 14.3.2.

### 14.2.4 Dùng chung console serial port với KGDB

Dù có thể dùng một serial port cho system console và KGDB over serial, chắc chắn không lý tưởng. KGDB có mức hoàn thiện khác tùy architecture, platform. Ra ngoài x86 thì kém chắc chắn hơn. KGDB có nhiều connection option: serial, Ethernet, thậm chí USB một số platform. Chắc chắn không phải mọi tổ hợp đều test trên từng platform.

Sách đã nói: nếu nghĩ cần kernel debugging qua KGDB, chi phí thêm serial port dễ biện minh, đặc biệt nếu bỏ lắp khi sản xuất để đạt mục tiêu chi phí. Phiền toái tiết kiệm (tức thời gian lập trình viên) vượt chi phí phát triển tăng thêm.

Để dùng chung console/KGDB serial port, cần hai command-line parameter. Dùng kernel command-line parameter `kgdboc` chỉ serial port, `kgdbcon` chỉ dùng chung console. Chỉ định `kgdboc` với serial console tương tự mô tả console device trên kernel command line:

```
kgdbcon kgdboc=ttyS1,115200
```

Khi boot kernel, nối KGDB, console message hiện trên cross-gdb. Listing 14-5 cho dạng. Đầu tiên boot target với các kernel command-line parameter bổ sung vừa nêu. Target boot tới login prompt. Giờ bật KGDB bằng SysRequest function. Cách dễ nhất từ serial port console là interface `/proc`:

```
root@8548:~# echo g >/proc/sysrq-trigger
SysRq : GDB
Entering KGDB
```

Giờ ngắt serial terminal khỏi console, giải phóng cho KGDB. Sau đó chạy cross-gdb, session tiếp như Listing 14-5.

LISTING 14-5 Dùng chung serial console với KGDB

```
$ ppc_85xx-gdb -q vmlinux
(gdb) target remote /dev/ttyS0
Remote debugging using /dev/ttyS0
0xc0058098 in sysrq_handle_gdb (key=0x11, tty=0x8ddf) at kernel/kgdb.c:1802
1802        wmb(); /* Sync point before breakpoint */
(gdb) b sys_sync
Breakpoint 1 at 0xc00baae4: file fs/sync.c, line 41.
(gdb) b panic
Breakpoint 2 at 0xc02d1a84: file arch/powerpc/include/asm/thread_info.h, line 87.
(gdb) c
Continuing.
<<<<  After logging in via SSH on another terminal
<<<<  we execute ‘modprobe ipv6’ at this point in time
[New Thread 1665]
NET: Registered protocol family 10
lo: Disabled Privacy Extensions
ADDRCONF(NETDEV_UP): eth1: link is not ready
tunl0: Disabled Privacy Extensions
```

Như Listing 14-5 đặt breakpoint, continue cho kernel chạy lại với breakpoint. Trên terminal window khác của host, ssh vào target rồi load module, ở đây `ipv6.ko`. Module nào không quan trọng. Mục tiêu sinh kernel message `printk` kiểm tra thật đến GDB terminal window. Thấy message từ dòng `[New Thread 1665]`. Đây là kernel message `printk` route tới system console rồi từ KGDB qua GDB remote protocol tới GDB console. Thật thú vị.

### 14.2.5 Debug kernel code rất sớm

Kỹ thuật vừa mô tả không cho debug kernel code rất sớm lúc khởi tạo. Thực tế tốt nhất chỉ debug initialization code sau serial driver được gọi, đăng ký. Một số architecture, platform cung cấp qua hai kernel command-line parameter `kgdbwait`, `kgdb8250`.[^5]

Early kernel debug cần KGDB I/O driver hỗ trợ. Phương pháp I/O phổ biến nhất (ít can thiệp nhất) là serial driver. Ví dụ driver `kgdb8250` vừa nêu. Rõ ràng phải compile driver vào kernel để sẵn cho early debug.

Như Listing 14-1, `kgdb8250` báo KGDB dùng serial port nào. Nhưng dùng cú pháp khác có thể gọi early serial initialization routine cho debug rất sớm. Dùng `kgdbwait` yêu cầu kernel halt rất sớm trong initialization sequence đợi user command. Thêm variable sau vào kernel command line để bật early debug qua KGDB:

```
kgdb8250=ttyS1,115200 kgdbwait
```

Quan trọng thứ tự kernel command-line parameter. Phải cho KGDB I/O driver trước (ví dụ `kgdb8250`) để khởi tạo trước gặp `kgdbwait`. Vì `kgdbwait` thực chất tạo debug breakpoint, phải có hạ tầng giao tiếp debugger trước khi breakpoint.

Điểm khác cần nhớ: hỗ trợ thường platform-specific. Tức kernel, platform phải hỗ trợ early kernel debug I/O driver để có chức năng. Platform có thể có phần cứng khác cho mục đích, nên bạn (hoặc embedded Linux vendor) phải cung cấp driver.

Với I/O driver `kgdb8250`, cũng có thể truyền đặc tả đầy đủ thông tin chi tiết board: loại I/O cần truy cập driver, base address, tùy chọn register shift value, IRQ cùng baud rate. Dạng như sau:

```
kgdb8250=<io|mmio|mbase>,<address>[/<regshift>],<baud rate>,<irq>
```

### 14.2.6 Hỗ trợ KGDB trong mainline kernel

Từ Linux 2.6.26, generic KGDB support vào Linux kernel trên kernel.org. Khi compile hỗ trợ như trước, hai kernel command-line parameter cấu hình KGDB lúc runtime. `kgdboc` chỉ serial port, `kgdbwait` khiến kernel breakpoint lúc boot cho debugger (`gdb`) giành quyền. Cú pháp `kgdboc` giống `kgdb8250` ở Phần 14.2.5, chỉ port, baud rate. `kgdbwait` dùng stand-alone không parameter. Tương tự ví dụ Phần 14.2.5, parameter command-line bật KGDB trên Linux 2.6.26 trở lên như sau. Chú ý thứ tự quan trọng: phải chỉ port trước khi yêu cầu kernel breakpoint:

```
kgdboc=ttyS1,115200 kgdbwait
```

Khi boot, kernel thực hiện phần lớn khởi tạo rồi đợi debugger kết nối. Listing 14-6 minh họa.

LISTING 14-6 Boot với generic KGDB từ Kernel.org

```
<... boot kernel using kgdboc=ttyS0,115200 kgdbwait ...>
... (many boot messages)
Serial: 8250/16550 driver, 2 ports, IRQ sharing enabled
serial8250.0: ttyS0 at MMIO 0xffe04500 (irq = 42) is a 16550A
console handover: boot [udbg0] -> real [ttyS0]
serial8250.0: ttyS1 at MMIO 0xffe04600 (irq = 42) is a 16550A
kgdb: Registered I/O driver kgdboc.
kgdb: Waiting for connection from remote gdb...
```

Lúc này kernel đợi remote GDB session kết nối, có thể bắt đầu debug. Chú ý khá muộn trong kernel boot sequence. Muốn debug generic kernel sớm hơn phải dùng debugging hardware-assisted với JTAG probe, mô tả ngay sau.

## 14.3 Kỹ thuật debug kernel

Lý do phổ biến hơn để step kernel code là sửa, tùy chỉnh code platform-specific cho custom board. Hãy xem với AMCC Yosemite board. Đặt breakpoint ở architecture setup functionv platform-specific rồi continue đến breakpoint. Listing 14-7 cho trình tự.

LISTING 14-7 Debug architecture setup code

```
(gdb) b yosemite_setup_arch
    Breakpoint 3 at 0xc021a488:
        file arch/ppc/platforms/4xx/yosemite.c, line 308.
(gdb) c
Continuing.
Can’t send signals to this remote system.  SIGILL not sent.

Breakpoint 3, yosemite_setup_arch () at arch/ppc/platforms/4xx/yosemite.c:308
308             yosemite_set_emacdata();
(gdb) l
303     }
304
305     static void __init
306     yosemite_setup_arch(void)
307     {
308             yosemite_set_emacdata();
```

LISTING 14-7 Debug architecture setup code

```
309
310             ibm440gx_get_clocks(&clocks, YOSEMITE_SYSCLK, 6 * 1843200);
311             ocp_sys_info.opb_bus_freq = clocks.opb;
312
(gdb)
```

Khi gặp breakpoint `yosemite_setup_arch()`, quyền điều khiển sang GDB tại dòng 308 của `yosemite.c`. Lệnh `list` (`l`) hiện source listing quanh breakpoint dòng 308. Cảnh báo SIGILL sau continue (`c`) có thể bỏ qua an toàn. Nó thuộc cách GDB kiểm tra remote system capability. Đầu tiên gửi remote command `continue_with_signal` tới target. KGDB implementation của board không hỗ trợ nên target NAK. GDB hiện informational message và thay bằng standard remote continue command.

### 14.3.1 GDB remote serial protocol

GDB có debug switch cho quan sát remote protocol giữa GDB trên development host và target. Rất hữu ích hiểu protocol và khắc phục target có hành vi lạ, sai. Bật bằng:

```
(gdb) set debug remote 1
```

Bật remote debugging, quan sát continue command và các bước GDB rất bổ ích. Listing 14-8 minh họa continue khi bật remote debugging.

LISTING 14-8 Ví dụ remote protocol: Lệnh continue

```
(gdb) c
Continuing.
Sending packet: $mc0000000,4#80...Ack
Packet received: c022d200
Sending packet: $Mc0000000,4:7d821008#68...Ack
Packet received: OK
Sending packet: $mc0016de8,4#f8...Ack
```

LISTING 14-8 Ví dụ remote protocol: Lệnh continue

```
Packet received: 38600001
Sending packet: $Mc0016de8,4:7d821008#e0...Ack
Packet received: OK
Sending packet: $mc005bd5c,4#23...Ack
Packet received: 38600001
Sending packet: $Mc005bd5c,4:7d821008#0b...Ack
Packet received: OK
Sending packet: $mc021a488,4#c8...Ack
Packet received: 4bfffbad
Sending packet: $Mc021a488,4:7d821008#b0...Ack
Packet received: OK
Sending packet: $c#63...Ack
    <<< program running, gdb waiting for event
```

Dù đầu tiên có vẻ khó, dễ hiểu điều xảy ra. Tóm lại GDB khôi phục mọi breakpoint trên target. Nhớ Listing 14-3 nhập hai breakpoint tại `panic()` và `sys_sync()`. Sau Listing 14-7 thêm thứ ba ở `yosemite_setup_arch()`. Vậy có ba breakpoint user-specified đang hoạt động. Hiện bằng lệnh GDB `info breakpoints`, như thường dùng dạng tắt:

```
(gdb) i b
Num Type           Disp Enb Address    What
1   breakpoint     keep y   0xc0016de8 in panic at kernel/panic.c:74
2   breakpoint     keep y   0xc005bd5c in sys_sync at fs/buffer.c:296
3   breakpoint     keep y   0xc021a488 in yosemite_setup_arch at
arch/ppc/platforms/4xx/yosemite.c:308
        breakpoint already hit 1 time
(gdb)
```

Giờ so breakpoint address trên với address trong GDB remote packet `$m` ở Listing 14-8. Packet `$m` là lệnh “đọc target memory”, `$M` là “ghi target memory”. Với mỗi breakpoint, address được đọc từ target memory, GDB lưu cục bộ trên host (để khôi phục sau), rồi thay bằng Power Architecture trap instruction `twge r2, r2 (0x7d821008)`. Điều này đưa quyền điều khiển về debugger. Hình 14-4 minh họa.

![Figure 14-4](images/ch14/fig14-04.png)

HÌNH 14-4 GDB chèn target memory breakpoint

Có thể bạn thấy GDB cập nhật bốn breakpoint dù chỉ nhập ba. Đầu tiên ở target memory location `0xc000_0000` được GDB tự đặt lúc startup. Đây là base address linked kernel image từ ELF file—thực chất `_start`. Tương đương breakpoint `main()` cho user space debugging, GDB tự làm. Ba breakpoint còn lại đã nhập trước.

Điều tương tự đảo ngược khi sự kiện trả quyền GDB. Listing 14-9 chi tiết khi gặp breakpoint `yosemite_setup_arch()`.

LISTING 14-9 Remote protocol: Chạm breakpoint

```
Packet received: T0440:c021a488;01:c020ff90;
Sending packet: $mc0000000,4#80...Ack  <<< Read memory @c0000000
Packet received: 7d821008
Sending packet: $Mc0000000,4:c022d200#87...Ack  <<< Write memory
Packet received: OK
Sending packet: $mc0016de8,4#f8...Ack
Packet received: 7d821008
Sending packet: $Mc0016de8,4:38600001#a4...Ack
Packet received: OK
Sending packet: $mc005bd5c,4#23...Ack
Packet received: 7d821008
Sending packet: $Mc005bd5c,4:38600001#cf...Ack
Packet received: OK
Sending packet: $mc021a488,4#c8...Ack
Packet received: 7d821008
Sending packet: $Mc021a488,4:4bfffbad#d1...Ack
Packet received: OK

Sending packet: $mc021a484,c#f3...Ack
Packet received: 900100244bfffbad3fa0c022
Breakpoint 3, yosemite_setup_arch () at arch/ppc/platforms/4xx/yosemite.c:308
308             yosemite_set_emacdata();
(gdb)
```

Packet `$T` là GDB Stop Reply packet, target gửi GDB khi gặp breakpoint. Ví dụ packet `$T` trả program counter value và register r1.[^6] Hoạt động còn lại ngược Listing 14-8. Các breakpoint instruction `trap` của Power Architecture bị bỏ, GDB khôi phục instruction gốc tại memory location tương ứng.

### 14.3.2 Debug optimized kernel code

Đầu chương nói thách thức debug kernel code do compiler optimization. Chúng ta lưu ý mặc định kernel compile optimization level `-O2`. Ở đây minh họa một trong nhiều cách tối ưu làm phức tạp debug.

Internet mail list liên quan đầy câu hỏi về công cụ có vẻ hỏng. Đôi khi người đăng nói debugger single-stepping ngược, line number không khớp source. Ở đây ví dụ phức tạp optimizing compiler mang tới debugging source-level. Line number GDB báo khi chạm breakpoint không khớp source file vì function inlining.

Để minh họa dùng cùng debug code snippet Listing 14-7. Listing 14-10 cho kết quả session.

LISTING 14-10 Code Architecture-Setup đã tối ưu

```
$ ppc_44x-gdb --silent vmlinux
(gdb) target remote /dev/ttyS0
Remote debugging using /dev/ttyS0
breakinst () at arch/ppc/kernel/ppc-stub.c:825
825     }
(gdb) b panic
Breakpoint 1 at 0xc0016b18: file kernel/panic.c, line 74.
(gdb) b sys_sync
Breakpoint 2 at 0xc005a8c8: file fs/buffer.c, line 296.
(gdb) b yosemite_setup_arch
Breakpoint 3 at 0xc020f438: file arch/ppc/platforms/4xx/yosemite.c, line 116.
(gdb) c
Continuing.

Breakpoint 3, yosemite_setup_arch ()
    at arch/ppc/platforms/4xx/yosemite.c:116
116             def = ocp_get_one_device(OCP_VENDOR_IBM, OCP_FUNC_EMAC, 0);
(gdb) l
111             struct ocp_def *def;
112             struct ocp_func_emac_data *emacdata;
113
114             /* Set mac_addr and phy mode for each EMAC */
115
116             def = ocp_get_one_device(OCP_VENDOR_IBM, OCP_FUNC_EMAC, 0);
117             emacdata = def->additions;
118             memcpy(emacdata->mac_addr, __res.bi_enetaddr, 6);
119             emacdata->phy_mode = PHY_MODE_RMII;
120
(gdb) p yosemite_setup_arch
$1 = {void (void)} 0xc020f41c <yosemite_setup_arch>
```

Tham khảo Listing 14-7, function `yosemite_setup_arch()` thực ở dòng 306 file `yosemite.c`. So với Listing 14-10: chạm breakpoint nhưng GDB báo file `yosemite.c` dòng 116. Thoạt nhìn line number debugger và source không khớp. Lỗi GDB chăng? Đầu tiên xác nhận compiler sinh debug information gì. Dùng công cụ `readelf`[^7] Chương 13 xem debug information compiler sinh cho function:

```
$ ppc_44x-readelf --debug-dump=info vmlinux | grep -u6 \
  yosemite_setup_arch | tail -n 7
    DW_AT_name        : (indirect string, offset: 0x9c04): yosemite_setup_arch
    DW_AT_decl_file   : 1
    DW_AT_decl_line   : 307
    DW_AT_prototyped  : 1
    DW_AT_low_pc      : 0xc020f41c
    DW_AT_high_pc     : 0xc020f794
    DW_AT_frame_base  : 1 byte block: 51       (DW_OP_reg1)
```

Không cần chuyên gia đọc DWARF2 debug record[^8] để nhận function báo tại dòng 307 source. Xác nhận bằng `addr2line` cũng Chương 13. Dùng address lấy từ GDB Listing 14-10:

```
$ ppc_44x-addr2line  -e vmlinux 0xc020f41c
    arch/ppc/platforms/4xx/yosemite.c:307
```

Lúc này GDB báo breakpoint dòng 116 file `yosemite.c`. Để hiểu, cần xem assembler output function do GDB báo. Listing 14-11 là output GDB sau lệnh `disassemble` trên function `yosemite_setup_arch()`.

LISTING 14-11 Disassemble function `yosemite_setup_arch`

```
(gdb) disassemble yosemite_setup_arch
0xc020f41c <yosemite_setup_arch+0>:     mflr    r0
0xc020f420 <yosemite_setup_arch+4>:     stwu    r1,-48(r1)
0xc020f424 <yosemite_setup_arch+8>:     li      r4,512
0xc020f428 <yosemite_setup_arch+12>:    li      r5,0
0xc020f42c <yosemite_setup_arch+16>:    li      r3,4116
0xc020f430 <yosemite_setup_arch+20>:    stmw    r25,20(r1)
0xc020f434 <yosemite_setup_arch+24>:    stw     r0,52(r1)
0xc020f438 <yosemite_setup_arch+28>:    bl      0xc000d344 <ocp_get_one_device>
0xc020f43c <yosemite_setup_arch+32>:    lwz     r31,32(r3)
0xc020f440 <yosemite_setup_arch+36>:    lis     r4,-16350
0xc020f444 <yosemite_setup_arch+40>:    li      r28,2
0xc020f448 <yosemite_setup_arch+44>:    addi    r4,r4,21460
0xc020f44c <yosemite_setup_arch+48>:    li      r5,6
0xc020f450 <yosemite_setup_arch+52>:    lis     r29,-16350
0xc020f454 <yosemite_setup_arch+56>:    addi    r3,r31,48
0xc020f458 <yosemite_setup_arch+60>:    lis     r25,-16350
0xc020f45c <yosemite_setup_arch+64>:    bl      0xc000c708 <memcpy>
0xc020f460 <yosemite_setup_arch+68>:    stw     r28,44(r31)
0xc020f464 <yosemite_setup_arch+72>:    li      r4,512
0xc020f468 <yosemite_setup_arch+76>:    li      r5,1
0xc020f46c <yosemite_setup_arch+80>:    li      r3,4116
0xc020f470 <yosemite_setup_arch+84>:    addi    r26,r25,15104
0xc020f474 <yosemite_setup_arch+88>:    bl      0xc000d344 <ocp_get_one_device>
0xc020f478 <yosemite_setup_arch+92>:    lis     r4,-16350
0xc020f47c <yosemite_setup_arch+96>:    lwz     r31,32(r3)
0xc020f480 <yosemite_setup_arch+100>:   addi    r4,r4,21534
0xc020f484 <yosemite_setup_arch+104>:   li      r5,6
0xc020f488 <yosemite_setup_arch+108>:   addi    r3,r31,48
0xc020f48c <yosemite_setup_arch+112>:   bl      0xc000c708 <memcpy>
0xc020f490 <yosemite_setup_arch+116>:   lis     r4,1017
0xc020f494 <yosemite_setup_arch+120>:   lis     r5,168
0xc020f498 <yosemite_setup_arch+124>:   stw     r28,44(r31)
0xc020f49c <yosemite_setup_arch+128>:   ori     r4,r4,16554
0xc020f4a0 <yosemite_setup_arch+132>:   ori     r5,r5,49152
0xc020f4a4 <yosemite_setup_arch+136>:   addi    r3,r29,-15380
0xc020f4a8 <yosemite_setup_arch+140>:   addi    r29,r29,-15380
0xc020f4ac <yosemite_setup_arch+144>:   bl      0xc020e338 <ibm440gx_get_clocks>
0xc020f4b0 <yosemite_setup_arch+148>:   li      r0,0
0xc020f4b4 <yosemite_setup_arch+152>:   lis     r11,-16352
0xc020f4b8 <yosemite_setup_arch+156>:   ori     r0,r0,50000
0xc020f4bc <yosemite_setup_arch+160>:   lwz     r10,12(r29)
0xc020f4c0 <yosemite_setup_arch+164>:   lis     r9,-16352
0xc020f4c4 <yosemite_setup_arch+168>:   stw     r0,8068(r11)
0xc020f4c8 <yosemite_setup_arch+172>:   lwz     r0,84(r26)
0xc020f4cc <yosemite_setup_arch+176>:   stw     r10,8136(r9)
0xc020f4d0 <yosemite_setup_arch+180>:   mtctr   r0
0xc020f4d4 <yosemite_setup_arch+184>:   bctrl
0xc020f4d8 <yosemite_setup_arch+188>:   li      r5,64
0xc020f4dc <yosemite_setup_arch+192>:   mr      r31,r3
0xc020f4e0 <yosemite_setup_arch+196>:   lis     r4,-4288
0xc020f4e4 <yosemite_setup_arch+200>:   li      r3,0
0xc020f4e8 <yosemite_setup_arch+204>:   bl      0xc000c0f8 <ioremap64>
End of assembler dump.
(gdb)
```

Một lần nữa không cần chuyên gia Power Architecture assembly language để hiểu. Chú ý label gắn instruction Power Architecture `bl`, là function call theo mnemonic architecture này. Symbolic function label là thông tin quan trọng. Phân tích sơ thấy nhiều function call gần đầu assembler listing:

```
Address     Function
0xc020f438  ocp_get_one_device()
0xc020f45c  memcpy()
0xc020f474  ocp_get_one_device()
0xc020f48c  memcpy()
0xc020f4ac  ibm440gx_get_clocks()
```

Listing 14-12 tái hiện phần source file `yosemite.c`. Liên hệ function trong GDB disassemble output, thấy label xuất hiện trong function `yosemite_set_emacdata()`, quanh line number GDB báo khi gặp breakpoint `yosemite_setup_arch()`. Chìa khóa là subroutine call ngay đầu `yosemite_setup_arch()`. Compiler inline lời gọi `yosemite_set_emacdata()` thay vì sinh function call như dự kiến khi chỉ xem source. Inlining làm line number lệch khi GDB chạm breakpoint. Dù function `yosemite_set_emacdata()` không khai báo keyword `inline`, GCC inline để tối ưu hiệu năng.

LISTING 14-12 Các phần source file `yosemite.c`

```
    109 static void __init yosemite_set_emacdata(void)
    110 {
    111         struct ocp_def *def;
    112         struct ocp_func_emac_data *emacdata;
    113
    114         /* Set mac_addr and phy mode for each EMAC */
    115
    116         def = ocp_get_one_device(OCP_VENDOR_IBM, OCP_FUNC_EMAC, 0);
    117         emacdata = def->additions;
    118         memcpy(emacdata->mac_addr, __res.bi_enetaddr, 6);
    119         emacdata->phy_mode = PHY_MODE_RMII;
    120
    121         def = ocp_get_one_device(OCP_VENDOR_IBM, OCP_FUNC_EMAC, 1);
    122         emacdata = def->additions;
    123         memcpy(emacdata->mac_addr, __res.bi_enet1addr, 6);
124         emacdata->phy_mode = PHY_MODE_RMII;
125 }
126
...
304
305 static void __init
306 yosemite_setup_arch(void)
307 {
308         yosemite_set_emacdata();
309
310         ibm440gx_get_clocks(&clocks, YOSEMITE_SYSCLK, 6 * 1843200);
311         ocp_sys_info.opb_bus_freq = clocks.opb;
312
313         /* init to some ~sane value until calibrate_delay() runs */
314         loops_per_jiffy = 50000000/HZ;
315
316         /* Setup PCI host bridge */
317         yosemite_setup_hose();
318
319 #ifdef CONFIG_BLK_DEV_INITRD
320        if (initrd_start)
321                ROOT_DEV = Root_RAM0;
322         else
323 #endif
324 #ifdef CONFIG_ROOT_NFS
325                 ROOT_DEV = Root_NFS;
326 #else
327                 ROOT_DEV = Root_HDA1;
328 #endif
329
330         yosemite_early_serial_map();
331
332         /* Identify the system */
333         printk( “AMCC PowerPC “ BOARDNAME “ Platform\n” );
334 }
335
```

Tóm tắt thảo luận trước:

- Nhập breakpoint GDB tại `yosemite_setup_arch()`.

- Khi chạm, thấy ở dòng 116 source file,

cách xa function định nghĩa breakpoint.

- Tạo disassembly listing code tại `yosemite_setup_arch()`, tìm label mà chuỗi code branch tới.

- So label với source code, thấy compiler đặt subroutine `yosemite_set_emacdata()` inline với function đặt breakpoint, có thể gây nhầm.

Điều này giải thích line number GDB báo khi chạm breakpoint gốc ở `yosemite_setup_arch()`.

Nhớ Listing 14-4 có ví dụ tối ưu khác: debugger báo `value optimized out` với một số variable. Đây là nơi local variable thay bằng processor register suốt function, nên compiler tối ưu bỏ local variable. Dễ minh họa bằng U-Boot code file `cmd_bootm.c`. Listing 14-13 có vài dòng function `do_bootm()`.

LISTING 14-13 Ví dụ local variable bị tối ưu bỏ

```
584 int do_bootm (cmd_tbl_t *cmdtp, int flag, int argc, char *argv[])
 585 {
 586         ulong           iflag;
 587         ulong           load_end = 0;
 588         int             ret;

<...many lines omitted>

 652         ret = bootm_load_os(images.os, &load_end, 1);
 653
 654         if (ret < 0) {
 655                 if (ret == BOOTM_ERR_RESET)
 656                         do_reset (cmdtp, flag, argc, argv);
 ...
```

Step qua code bằng BDI-2000/3000 cùng cross-gdb như sau:

```
(gdb) l 654
649         dcache_disable();
650   #endif
651
652         ret = bootm_load_os(images.os, &load_end, 1);
653
654         if (ret < 0) {
655               if (ret == BOOTM_ERR_RESET)
656                     do_reset (cmdtp, flag, argc, argv);
657               if (ret == BOOTM_ERR_OVERLAP) {
658                     if (images.legacy_hdr_valid) {
(gdb) p ret
$2 = <value optimized out>
```

Chú ý sau lời gọi `bootm_load_os()`, đọc return value, theo source dòng 652 lưu trong local variable `ret`. Thử hiển thị `ret` cho thông báo now-familiar `<value optimized out>`. Vì biết Power Architecture trả kết quả function trong R3, có thể hiển thị return code bằng R3 ngay sau return:

```
(gdb) mon rd
GPR00: 0ff7c9ec 0ff4db40 0ff4df64 00000000
GPR04: 00000002 00000000 0ff50ac8 00002538
GPR08: 00001000 00000020 00003538 00000001
GPR12: 24044022 1001a5b8 00000000 00000000
GPR16: 0ff88af4 00000000 00000000 00000000
GPR20: 00000000 00000000 0fff10f4 00000000
GPR24: 00000001 00000000 0ffab9d0 00000004
GPR28: 0ff50a40 0fff0b34 0ffaf0f0 00000000
CR   : 42044048     MSR: 00021200
(gdb)
```

Lệnh gọi trực tiếp BDI-2000/3000 `rd` (hiện general-purpose register) và trả kết quả. GPR03 (R3) chứa 0, chỉ function call thành công.

Compiler dùng nhiều thuật toán tối ưu khác nhau. Ví dụ trình bày một: function inlining. Mỗi loại làm debugger (người và máy) bối rối khác nhau. Thách thức là hiểu machine level rồi chuyển sang ý định lập trình viên. Giờ thấy lợi ích dùng optimization level thấp nhất có thể để debug.

### 14.3.3 Lệnh GDB User-Defined

Có thể bạn biết GDB tìm initialization file `.gdbinit` khi startup. Lúc gọi, GDB load file (thường trong home directory user), thực hiện lệnh bên trong. Một tổ hợp tôi thích là nối target, đặt initial breakpoint. Khi đó nội dung `.gdbinit` như Listing 14-14.

LISTING 14-14 GDB initialization file đơn giản

```
$ cat ~/.gdbinit
set history save on
set history filename ~/.gdb_history
set output-radix 16

define connect
#   target remote bdi:2001
    target remote /dev/ttyS0
    b panic
    b sys_sync
end
```

File `.gdbinit` đơn giản bật lưu command history vào file user-specified, đặt default output radix để in value. Rồi định nghĩa lệnh GDB user-defined `connect`. (Lệnh User-defined cũng thường gọi macro.) Khi gọi tại prompt, GDB nối target theo phương pháp muốn (serial port ở đây), đặt breakpoint `panic()`, `sys_sync()`. Network method (host:port) được comment, thảo luận Phần 14.4.

Cách dùng sáng tạo lệnh GDB user-defined không có giới hạn. Khi debug kernel, thường hữu ích xem global data structure như task list, memory map. Ở đây có vài lệnh GDB user-defined hữu ích hiện kernel data cụ thể có thể cần khi debug.

### 14.3.4 GDB macro hữu ích cho kernel

Khi debug kernel, thường hữu ích xem process chạy và attribute chung. Kernel giữ linked list task mô tả bằng `struct task_struct`. Địa chỉ task đầu chứa trong kernel global variable `init_task`, biểu diễn initial task kernel sinh lúc startup. Mỗi task chứa `struct list_head` liên kết task thành circular linked list. Hai kernel structure phổ biến này mô tả trong header file:

```
struct task_struct            .../include/linux/sched.h
struct list_head              .../include/linux/list.h
```

Dùng GDB macro duyệt task list, hiện thông tin hữu ích. Dễ sửa macro lấy dữ liệu quan tâm. Cũng rất hữu ích học kernel internal chi tiết.

Macro đầu xem trong Listing 14-15 (`find_task`) đơn giản tìm linked list structure `task_struct` của kernel tới khi thấy task cho. Nếu thấy, hiện task name.

LISTING 14-15 Macro GDB `find_task`

```
 1 # Helper function to find a task given a PID or the
 2 # address of a task_struct.
 3 # The result is set into $t
 4 define find_task
 5   # Addresses greater than _end: kernel data...
 6   # ...user passed in an address
 7   if ((unsigned)$arg0 > (unsigned)&_end)
 8     set $t=(struct task_struct *)$arg0
 9   else
10     # User entered a numeric PID
11     # Walk the task list to find it
12     set $t=&init_task
13     if (init_task.pid != (unsigned)$arg0)
14       find_next_task $t
15       while (&init_task!=$t && $t->pid != (unsigned)$arg0)
16         find_next_task $t
17       end
18       if ($t == &init_task)
19         printf “Couldn’t find task; using init_task\n”
20       end
21     end
22   end
23   printf “Task \”%s\”:\n”, $t->comm
24 end
```

Đặt văn bản vào file `.gdbinit`, restart GDB hoặc source nó[^9] bằng lệnh `source` của GDB. (Giải thích macro `find_next_task` sau ở Listing 14-19.) Gọi như sau:

```
(gdb) find_task 910
   Task “syslogd”:
```

Chú ý cũng có thể truyền address cho macro `find_task`:

```
(gdb) find_task 0xCFFDE470
   Task “bash”:
```

Tất nhiên phải cung cấp parameter hợp lệ theo tình huống debug riêng.

Dòng 4 Listing 14-15 định nghĩa macro name. Dòng 7 quyết định input argument là PID (numeric entry từ 0 giới hạn vài triệu) hay address `task_struct` phải lớn hơn cuối Linux kernel image, do symbol `_end` định nghĩa.[^10] Nếu address, chỉ cần cast đúng type để dereference `task_struct` liên quan, ở dòng 8. Như comment dòng 3, macro trả GDB convenience variable typecast thành pointer tới `struct task_struct`.

Nếu argument là numeric PID, duyệt list tìm `task_struct` khớp. Dòng 12,13 khởi tạo loop variable (macro command language GDB không có câu lệnh `for`), dòng 15–17 định nghĩa search loop. Macro `find_next_task` lấy pointer tới `task_struct` tiếp trong linked list. Cuối cùng nếu tìm thất bại đặt return value hợp lý (address `init_task`) để dùng an toàn trong macro khác.

Dựa macro `find_task` Listing 14-15 dễ tạo lệnh `ps` đơn giản hiện thông tin hữu ích từng process chạy.

Listing 14-16 định nghĩa macro GDB `ps` hiện thông tin thú vị từ process đang chạy, trích `struct task_struct`. Gọi như lệnh GDB khác: tên rồi input parameter cần. Chú ý lệnh user-defined này cần một argument, PID hoặc address `task_struct`.

LISTING 14-16 Macro GDB in process information

```
 1 define ps
 2   # Print column headers
 3   task_struct_header
 4   set $t=&init_task
 5   task_struct_show $t
 6   find_next_task $t
 7   # Walk the list
 8   while &init_task!=$t
 9     # Display useful info about each task
10     task_struct_show $t
11     find_next_task $t
12   end
13 end
14
15 document ps
16 Print points of interest for all tasks
17 end
```

Macro `ps` này tương tự `find_task`, nhưng không cần input argument và thêm macro (`task_struct_show`) hiện thông tin hữu ích từ mỗi `task_struct`. Dòng 3 in banner với column heading. Dòng 4–6 thiết lập loop, hiện task đầu. Dòng 8–11 loop từng task, gọi `task_struct_show` cho mỗi task.

Cũng chú ý lệnh GDB `document`, cho user nhận help bằng `help ps` từ prompt như sau:

```
(gdb) help ps
   Print points of interest for all tasks
```

Listing 14-17 hiện output macro trên target board chỉ chạy dịch vụ tối thiểu.

LISTING 14-17 Output macro GDB `ps`

```
(gdb) ps
Address      PID State      User_NIP  Kernel-SP  device comm
0xC01D3750     0 Running              0xC0205E90 (none) swapper
0xC04ACB10     1 Sleeping  0x0FF6E85C 0xC04FFCE0 (none) init
0xC04AC770     2 Sleeping             0xC0501E90 (none) ksoftirqd/0
0xC04AC3D0     3 Sleeping             0xC0531E30 (none) events/0
0xC04AC030     4 Sleeping             0xC0533E30 (none) khelper
0xC04CDB30     5 Sleeping             0xC0535E30 (none) kthread
0xC04CD790    23 Sleeping             0xC06FBE30 (none) kblockd/0
0xC04CD3F0    45 Sleeping             0xC06FDE50 (none) pdflush
0xC04CD050    46 Sleeping             0xC06FFE50 (none) pdflush
0xC054B7B0    48 Sleeping             0xC0703E30 (none) aio/0
0xC054BB50    47 Sleeping             0xC0701E20 (none) kswapd0
0xC054B410   629 Sleeping             0xC0781E60 (none) kseriod
0xC054B070   663 Sleeping             0xCFC59E30 (none) rpciod/0
0xCFFDE0D0   675 Sleeping  0x0FF6E85C 0xCF86DCE0 (none) udevd
0xCF95B110   879 Sleeping  0x0FF0BE58 0xCF517D80 (none) portmap
0xCFC24090   910 Sleeping  0x0FF6E85C 0xCF61BCE0 (none) syslogd
0xCF804490   918 Sleeping  0x0FF66C7C 0xCF65DD70 (none) klogd
0xCFE350B0   948 Sleeping  0x0FF0E85C 0xCF67DCE0 (none) rpc.statd
0xCFFDE810   960 Sleeping  0x0FF6E85C 0xCF5C7CE0 (none) inetd
0xCFC24B70   964 Sleeping  0x0FEEBEAC 0xCF64FD80 (none) mvltd
0xCFE35B90   973 Sleeping  0x0FF66C7C 0xCFEF7CE0 ttyS1  getty
0xCFE357F0   974 Sleeping  0x0FF4B85C 0xCF6EBCE0 (none) in.telnetd
0xCFFDE470   979 Sleeping  0x0FEB6950 0xCF675DB0 ttyp0  bash
0xCFFDEBB0   982<Running   0x0FF6EB6C 0xCF7C3870 ttyp0  sync
(gdb)
```

Phần lớn việc macro `ps` do `task_struct_show` thực hiện. Như Listing 14-17, macro `task_struct_show` hiện các field sau từ từng `task_struct`:

- Address—Address của `task_struct` cho process

- PID—Process ID

- State—Trạng thái hiện tại process

- User\_NIP—User space next instruction pointer

- Kernel\_SP—Kernel stack pointer

- device—Device gắn process

- comm—Tên process (hoặc command)

Tương đối dễ sửa macro hiện mục quan tâm cho kernel debugging cụ thể. Phức tạp duy nhất nằm trong sự đơn giản macro language. Vì không có function tương đương như `strlen` trong ngôn ngữ GDB user-defined command, phải format màn hình thủ công. Listing 14-18 cho macro `task_struct_show` tạo

listing trên.

LISTING 14-18 Macro GDB `task_struct_show`

```
 1 define task_struct_show
 2   # task_struct addr and PID
 3   printf “0x%08X %5d”, $arg0, $arg0->pid
 4
 5   # Place a ‘<’ marker on the current task
 6   #  if ($arg0 == current)
 7   # For PowerPC, register r2 points to the “current” task
 8   if ($arg0 == $r2)
 9     printf “<”
10   else
11     printf “ “
12   end
13
14   # State
15   if ($arg0->state == 0)
16     printf “Running   “
17   else
18     if ($arg0->state == 1)
19       printf “Sleeping  “
20     else
21       if ($arg0->state == 2)
22         printf “Disksleep “
23       else
24         if ($arg0->state == 4)
25           printf “Zombie    “
26         else
27           if ($arg0->state == 8)
28             printf “sTopped   “
29           else
30             if ($arg0->state == 16)
31               printf “Wpaging   “
32             else
33               printf “%2d        “, $arg0->state
34             end
35           end
36         end
37       end
38     end
   39   end
   40
   41   # User NIP
   42   if ($arg0->thread.regs)
   43     printf “0x%08X “, $arg0->thread.regs->nip
   44   else
   45     printf “           “
   46   end
   47
   48   # Display the kernel stack pointer
   49   printf “0x%08X “, $arg0->thread.ksp
   50
   51   # device
   52   if ($arg0->signal->tty)
   53     printf “%s   “, $arg0->signal->tty->name
   54   else
   55     printf “(none) “
   56   end
   57
   58   # comm
   59   printf “%s\n”, $arg0->comm
   60 end
```

Dòng 3 hiện address `task_struct`. Dòng 8–12 hiện process ID. Nếu current process (đang chạy trên CPU khi chạm breakpoint), đánh dấu bằng ký tự `<`.

Dòng 14–39 decode, hiện process state. Sau đó hiện user process next instruction pointer (NIP), kernel stack pointer (SP). Cuối cùng hiện device gắn process rồi tên process (lưu ở phần tử `->comm` của `task_struct`).

Quan trọng macro architecture-dependent như dòng 7,8. Nhìn chung macro như vậy rất architecture- và version-dependent. Mỗi lần structure bên dưới đổi phải cập nhật. Nhưng nếu debug kernel bằng GDB nhiều, lợi ích thường xứng công sức.

Cho đầy đủ, trình bày macro `find_next_task`. Implementation không hiển nhiên, cần giải thích. (Giả định dễ suy ra `task_struct_header` hoàn tất chuỗi cho macro `ps`; chỉ một dòng sắp column header với white space đúng.) Listing 14-19 cho macro `find_next_task` dùng trong macro `ps`, `find_task`.

LISTING 14-19 Macro GDB `find_next_task`

```
define find_next_task
  # Given a task address, find the next task in the linked list
  set $t = (struct task_struct *)$arg0
  set $offset=( (char *)&$t->tasks - (char *)$t)
  set $t=(struct task_struct *)( (char *)$t->tasks.next- (char *)$offset)
end
```

Chức năng macro đơn giản, implementation hơi kém trực tiếp. Mục tiêu trả pointer `->next` trỏ `task_struct` tiếp trong linked list. Tuy nhiên structure `task_struct` được liên kết bằng address member `struct list_head` tên `tasks`, thay cách thường dùng starting address chính `task_struct`. Vì pointer `->next` trỏ address task structure element trong `task_struct` tiếp trên list, phải trừ để lấy address đầu chính `task_struct`. Giá trị trừ từ pointer `->next` là offset từ address pointer đó tới đầu `task_struct`. Đầu tiên tính offset, rồi dùng điều chỉnh pointer `->next` trỏ đầu `task_struct`. Hình 14-5 làm rõ.

Giờ macro cuối `lsmod`, hữu ích phần sau khi debug loadable module. Listing 14-20 đơn giản hiện danh sách loadable module hiện cài trong kernel.

![Figure 14-5](images/ch14/fig14-05.png)

HÌNH 14-5 Liên kết task structure list

LISTING 14-20 Macro GDB liệt kê module

```
 1 define lsmod
 2   printf “Address\t\tModule\n”
 3   set $m=(struct list_head *)&modules
 4   set $done=0
 5   while ( !$done )
 6     # list_head is 4-bytes into struct module
 7     set $mp=(struct module *)((char *)$m->next - (char *)4)
 8     printf “0x%08X\t%s\n”, $mp, $mp->name
 9     if ( $mp->list->next == &modules)
10       set $done=1
11     end
12     set $m=$m->next
13   end
14 end
15
16 document lsmod
17 List the loaded kernel modules and their start addresses
18 end
```

Loop đơn giản bắt đầu từ kernel global variable module. Đây là `struct list_head` đánh dấu đầu linked list loadable module. Phức tạp duy nhất giống Listing 14-19: phải trừ offset từ pointer `struct list_head` để trỏ đầu `struct module`, thực hiện dòng 7. Macro tạo danh sách đơn giản gồm address `struct module` và module name. Ví dụ dùng:

```
(gdb) lsmod
Address         Module
0xD1012A80      ip_conntrack_tftp
0xD10105A0      ip_conntrack
0xD102F9A0      loop
(gdb) help lsmod
List the loaded kernel modules and their start addresses
(gdb)
```

Macro như ở đây hỗ trợ debug rất mạnh. Có thể tạo tương tự hiện mọi thứ trong kernel dễ truy cập, đặc biệt data structure chính dạng linked list. Ví dụ process memory map information, module information, file system information, timer list, v.v. Thông tin ở đây giúp bắt đầu.

### 14.3.5 Debug loadable module

Lý do điển hình dùng KGDB là debug loadable kernel module—device driver. Tính năng thuận tiện là phần lớn trường hợp không cần reboot kernel mỗi session mới. Có thể debug, sửa, compile lại, reload module không phiền và chậm như reboot kernel đầy đủ.

Phức tạp khi debug loadable module là truy cập symbolic debug information trong object file module. Vì module link động lúc load vào kernel, symbolic information trong object file vô dụng tới khi điều chỉnh symbol table.

Nhớ ví dụ trước gọi GDB cho kernel debugging session:

```
$ ppc_4xx-gdb vmlinux
```

Điều này chạy GDB session trên host, đọc symbol information từ Linux kernel ELF file `vmlinux`. Tất nhiên không thấy symbol loadable module trong file. Chúng là compilation unit riêng, link thành ELF object stand-alone riêng. Vì thế muốn debugging source-level trên loadable module cần load debug symbol từ ELF file. GDB cung cấp qua lệnh `add-symbol-file`.

Lệnh `add-symbol-file` load symbol từ object file cho, giả định module đã load. Tuy nhiên gặp vấn đề chicken-and-egg. Chưa có symbol information tới khi module load vào kernel và gọi `add-symbol-file` đọc symbol information. Nhưng module đã load thì quá muộn đặt breakpoint, debug function `*_init` và liên quan vì đã thực thi.

Giải pháp là breakpoint trong kernel code load module, sau link nhưng trước gọi initialization function. Việc do `.../kernel/module.c` thực hiện. Listing 14-21 cho phần liên quan `module.c`.

LISTING 14-21 `module.c`: Khởi tạo module

```
...
2292         /* Drop lock so they can recurse */
2293         mutex_unlock(&module_mutex);
2294
2295         blocking_notifier_call_chain(&module_notify_list,
2296                         MODULE_STATE_COMING, mod);
2297
2298         /* Start the module */
2299         if (mod->init != NULL)
2300                 ret = do_one_initcall(mod->init);
2301         if (ret < 0) {
2302                 /* Init routine failed: abort.  Try to protect us from
2303                    buggy refcounters. */
2304                 mod->state = MODULE_STATE_GOING;
...
```

Load module bằng utility `modprobe` như Listing 8-5 Chương 8, “Kiến thức cơ bản về device driver”. Như sau:

```
$ modprobe loop
```

Lệnh gọi system call đặc biệt yêu cầu kernel load module. Bắt đầu tại `load_module()` trong `module.c`. Sau load vào kernel memory, link động, quyền điều khiển sang function `*_init` của module, như dòng 2299,2300 bản `module.c` gần đây trong Listing 14-21. Đặt breakpoint đây, cho thêm symbol file vào GDB rồi đặt breakpoint trong module. Minh họa bằng Linux kernel loopback driver `loop.ko`. Nó không dependency module khác, khá dễ minh họa.

Listing 14-22 cho lệnh GDB bắt đầu session debug `loop.ko`.

LISTING 14-22 Bắt đầu module debug session: `loop.ko`

```
 1 $ ppc-linux-gdb --silent vmlinux
 2 (gdb) connect   <<< remember, this is a user-defined func
 3 breakinst () at arch/ppc/kernel/ppc-stub.c:825
 4 825     }
 5 Breakpoint 1 at 0xc0016b18: file kernel/panic.c, line 74.
 6 Breakpoint 2 at 0xc005a8c8: file fs/buffer.c, line 296.
 7 (gdb) b kernelmodule.c:2299
 8 Breakpoint 3 at 0xc0055b28: file kernel/module.c, line 2299.
 9 (gdb) c
10 Continuing.
11 >>>> Here we let the kernel finish booting
12      and then load the loop.ko module on the target
13
14 Breakpoint 3, sys_init_module (umod=0x48030000, len=<optimized out>,
15     uargs=<value optimized out>) at kernel/module.c:2299
16 2299                    ret = mod->init();
17 (gdb) lsmod
18 Address         Module
19 0xD1069A60     loop
20 (gdb) set $m=(struct module *)0xD1069a60
21 (gdb) p $m->module_core
22 $1 = (void *) 0xd1066000
23 (gdb) add-symbol-file ./drivers/block/loop.ko 0xd1066000
24 add symbol table from file “./drivers/block/loop.ko” at
25         .text_addr = 0xd1066000
26 (y or n) y
27 Reading symbols from /home/chris/sandbox/linux-2.6.27/
drivers/block        /loop.ko...done.
28 (gdb)
```

Từ dòng 2 dùng macro GDB user-defined connect tạo ở Listing 14-14 nối target board, đặt initial breakpoint. Sau thêm breakpoint trong `module.c` như dòng 7, gọi continue (`c`). Giờ kernel boot xong, lập telnet session tới target, load module `loop.ko` (không hiện). Khi loop module load, chạm ngay breakpoint 3. GDB hiện thông tin dòng 14–16.

Lúc này cần tìm address Linux kernel link section `.text` của module. Linux lưu trong module information structure `struct module`, phần tử `module_core`. Dùng macro `lsmod` Listing 14-20 lấy address `struct module` gắn module `loop.ko`, như dòng 17–19. Dùng structure address lấy address `.text` từ member `module_core`. Truyền address cho GDB command `add-symbol-file`, GDB điều chỉnh internal symbol table khớp address thực module link vào kernel. Từ đó tiếp tục bình thường đặt breakpoint, step code, xem data, v.v.

Kết thúc phần bằng đặt breakpoint trong initialization function loopback module để step initialization code. Phức tạp là kernel load code này vào vùng memory cấp phát riêng để giải phóng sau dùng. Nhớ thảo luận macro `__init` Chương 5, “Khởi tạo kernel”. Macro expand thành compiler attribute hướng linker đặt phần code đánh dấu vào ELF section có tên riêng. Về bản chất, function định nghĩa attribute này vào section `.init.text` riêng. Cách dùng tương tự:

```
static int __init loop_init(void){...}
```

Lời gọi đặt function `loop_init()` đã compile vào section `.init.` `text` của object module `loop.ko`. Khi load, kernel cấp memory cho phần chính module, được member `struct module` tên `module_core` trỏ tới. Sau đó cấp riêng memory giữ section `.init.text`. Sau initialization function, kernel giải phóng memory chứa nó. Vì object module chia như vậy, cần báo GDB addressing scheme để dùng symbolic data debug initialization function. Listing 14-23 minh họa.

LISTING 14-23 Debug code `init` của module

```
$ ppc-linux-gdb -q vmlinux
(gdb) target remote /dev/ttyS0
Remote debugging using /dev/ttyS0
breakinst () at arch/ppc/kernel/ppc-stub.c:825
825     }

<< Place a breakpoint before calling module init >>
(gdb) b kernel/module.c:2299
Breakpoint 1 at 0xc0036418: file kernel/module.c, line 2299.
(gdb) c
Continuing.
[New Thread 1468]
[Switching to Thread 1468]

Breakpoint 3, sys_init_module (umod=0x48030000, len=<optimized out>,
    uargs=<value optimized out>) at kernel/module.c:2299
2299         if (mod->init != NULL)

<< Discover init addressing from struct module >>

(gdb) lsmod
Address         Module
0xD1069A60      loop
(gdb) set $m=(struct module *)0xD1069A60
(gdb) p $m->module_core
$1 = (void *) 0xd1066000
(gdb) p $m->module_init
$2 = (void *) 0xd101e000

<< Now load a symbol file using the core and init addrs >>

(gdb) add-symbol-file ./drivers/block/loop.ko 0xd1066000 -s .init.text 0xd101e000
add symbol table from file “./drivers/block/loop.ko” at
      .text_addr = 0xd1066000
      .init.text_addr = 0xd101e000
(y or n) y
Reading symbols from /home/chris/sandbox/linux-2.6.27/drivers/block/
loop.ko...done.
(gdb) b loop_init
Breakpoint 4 at 0xd101e008: file drivers/block/loop.c, line 1517.
(gdb) c
Continuing.

<< Breakpoint hit, proceed to debug module init function >>

Breakpoint 4, loop_init () at drivers/block/loop.c:1517
1517          part_shift = 0;
(gdb)l
1512           *     load, user can further extend loop device by create dev node
1513           *     themselves and have kernel automatically instantiate actual
1514           *     device on-demand.
1515           */
1516
1517          part_shift = 0;
1518          if (max_part > 0)
1519                part_shift = fls(max_part);
1520
1521          if (max_loop > 1UL << (MINORBITS - part_shift))
(gdb)
```

### 14.3.6 Debug bằng printk

Debug kernel/device driver code bằng `printk()` phổ biến, chủ yếu vì `printk` đã thành phương pháp vững chắc. Có thể gọi `printk` gần mọi context, gồm interrupt handler. `printk` là bản kernel của C library function `printf()` quen thuộc. `printk` định nghĩa trong `.../kernel/printk.c`.

Quan trọng hiểu giới hạn `printk` khi debug. Đầu tiên `printk` cần console device. Hơn nữa dù cấu hình console sớm nhất có thể lúc khởi tạo, nhiều lời gọi `printk` trước khi console khởi tạo. Có phương pháp xử lý giới hạn sau tại Phần 14.5, “Khi không boot được”.

Function `printk` cho thêm string marker nhận diện severity level thông báo. Header file `.../include/linux/kernel.h` định nghĩa tám level:

```
#define     KERN_EMERG    “<0>” /* system is unusable */
#define     KERN_ALERT    “<1>” /* action must be taken immediately */
#define     KERN_CRIT     “<2>” /* critical conditions */
#define     KERN_ERR      “<3>” /* error conditions */
#define     KERN_WARNING  “<4>” /* warning conditions */
#define     KERN_NOTICE   “<5>” /* normal but significant condition */
#define     KERN_INFO     “<6>” /* informational */
#define     KERN_DEBUG    “<7>” /* debug-level messages */
```

Message `printk` đơn giản có thể như:

```
printk(“foo() entered w/ %s\n”, arg);
```

Nếu bỏ severity string như đây, kernel gán default severity level định nghĩa trong `printk.c`. Kernel gần đây đặt level 4, `KERN_WARNING`. Chỉ định `printk` với severity level (cách ưu tiên) có thể như:

```
printk(KERN_CRIT “vmalloc failed in foo()\n”);
```

Không, cú pháp C lạ này không phải lỗi gõ. `KERN_CRIT` tự là text string nên không cần phẩy tách parameter. Thực tế thêm phẩy khiến function không cho kết quả mong đợi. Compiler tự nối string thành một. Mặc định mọi message `printk` dưới predefined loglevel hiện trên system console device. Default console loglevel định nghĩa trong `printk.c`, kernel gần đây bằng 7. Nghĩa mọi message `printk` quan trọng hơn `KERN_DEBUG` (trong `.../include/linux/kernel.h`) đều hiện console.

Có thể đặt default kernel loglevel nhiều cách. Lúc boot, chỉ định trên target board bằng truyền kernel command-line parameter phù hợp. Ba kernel command-line option trong `main.c` ảnh hưởng default loglevel:

- `debug` đặt console loglevel 10.

- `quiet` đặt console loglevel 4.

- `loglevel=` đặt console loglevel giá trị tùy chọn.

Dùng log level `debug` thực chất hiện mọi message `printk`. Dùng `quiet` hiện mọi message `printk` severity `KERN_ERR` trở lên.

Message `printk` có thể log vào file trên target hoặc qua network. Dùng `klogd` (kernel log daemon), `syslogd` (system log daemon) điều khiển logging behavior của message `printk`. Utility phổ biến này đã mô tả trong man page, nhiều Linux reference nên không mô tả ở đây.

### 14.3.7 Magic SysReq key

Magic SysReq key hỗ trợ debug hữu ích, gọi qua chuỗi phím đặc biệt định sẵn gửi message trực tiếp kernel. Với nhiều target architecture, board, dùng terminal emulator đơn giản trên serial port làm console. Khi đó Magic SysReq là break character rồi command character. Xem tài liệu terminal emulator để biết gửi break. Nhiều Linux developer dùng minicom, gửi break bằng Ctrl-A F. Nếu dùng `screen`, Ctrl-A Ctrl-B gửi break. Sau gửi, có 5 giây nhập command character trước timeout.

Công cụ kernel hữu ích cho phát triển, debug nhưng cũng có thể mất dữ liệu, hỏng hệ thống. Thực tế lệnh `b` reboot ngay không thông báo, chuẩn bị. File mở không đóng, disk không sync, file system không unmount. Khi gọi reboot (`b`), quyền điều khiển chuyển ngay tới reset vector architecture rất đột ngột. Tự chịu rủi ro khi dùng!

Tính năng có tài liệu tốt trong Linux kernel documentation subdirectory, file `sysrq.txt`. Có chi tiết nhiều architecture, mô tả lệnh sẵn.

Cách khác đặt kernel loglevel vừa nói là Magic SysReq. Lệnh là số 0–9, đặt default loglevel theo số truyền. Từ minicom nhấn Ctrl-A F rồi số như 9. Đây là terminal sau gửi break sequence:

```
$ SysRq : Changing Loglevel
   Loglevel set to 9
```

Có thể dùng lệnh dump register, shutdown, reboot, dump process list, current memory information ra console và hơn nữa. Xem documentation file trong kernel gần đây để biết.

Tính năng hay dùng nhất khi thứ gì khiến hệ thống lock up. Magic SysReq thường cho cách biết thêm từ hệ thống tưởng đã chết.

## 14.4 Debugging Hardware-Assisted

Đến đây có lẽ nhận ra không thể debug kernel startup code rất sớm bằng KGDB, vì chỉ khởi tạo sau phần lớn low-level hardware initialization code. Hơn nữa nếu phải bring up board brand-new, port bootloader/Linux kernel, hardware-debug probe chắc chắn hiệu quả nhất debug vấn đề giai đoạn đầu port board.

Có nhiều hardware-debug probe chọn. Ví dụ phần này dùng Abatron BDI-2000(xem www. abatron.ch). Thường gọi JTAG probe vì dùng phương pháp giao tiếp low-level đầu tiên cho boundary scan testing integrated circuit do Joint Test Action Group (JTAG) định nghĩa. Abatron đã phát hành BDI-3000 mới hơn có Ethernet interface nhanh hơn (100MB).

JTAG probe có connector nhỏ nối target board, thường square-pin header và ribbon cable đơn giản. Phần lớn CPU high-performance hiện đại có JTAG interface thiết kế cho software debugging. Probe nối CPU JTAG interface. Phía khác nối host development system, thường Ethernet, USB hoặc parallel port. Hình 14-6 cho setup Abatron.

![Figure 14-6](images/ch14/fig14-06.png)

HÌNH 14-6 Debug bằng hardware JTAG probe

JTAG probe có thể khó thiết lập, trực tiếp do CPU kết nối phức tạp. Khi cấp nguồn target board, CPU thoát reset, gần như chưa khởi tạo gì. Thực tế nhiều processor cần ít nhất khởi tạo nhỏ trước làm gì. Nhiều phương pháp đưa initial configuration vào CPU. Một số đọc word hardware-configuration hoặc initial value của pin để biết power-on configuration. Số khác đọc default location trong nonvolatile storage đơn giản như Flash. Dùng JTAG probe, đặc biệt bring up board mới, phải khởi tạo CPU/board tối thiểu trước mọi việc khác. Nhiều probe dựa configuration file cho việc này.

Abatron dùng configuration file khởi tạo target hardware và định nghĩa operational parameter khác của debugger. File chứa directive khởi tạo CPU, memory system và phần cứng board-level cần. Lập trình viên chịu trách nhiệm tùy chỉnh directive đúng board. Cú pháp configuration command có trong probe documentation. Nhưng chỉ embedded developer tạo được file riêng cho board design, cần hiểu CPU, tính năng board-level chi tiết. Như custom Linux port cho board mới, không có lối tắt hay thay thế.

Phụ lục F, “BDI-2000 configuration file mẫu”, chứa Abatron configuration file mẫu cho custom board dựa Freescale Semiconductor MPC5200 embedded controller. Ở đó thấy setup cần. Chú ý dùng nhiều comment mô tả register, initialization detail, giúp cập nhật, bảo trì và cấu hình đúng ngay lần đầu.

Hardware probe thường dùng hai cách. Phần lớn có user interface cho dùng tính năng như lập trình Flash, download binary image. Cách thứ hai làm front end cho GDB/source-level debugger khác. Chúng ta minh họa cả hai.

### 14.4.1 Lập trình Flash bằng JTAG probe

Nhiều hardware probe lập trình nhiều loại Flash memory chip. Abatron BDI-3000 không ngoại lệ. BDI-3000 configuration file có section \[FLASH\] định nghĩa target Flash, xem mẫu Phụ lục F. Section \[FLASH\] định nghĩa attribute chip trong thiết kế cụ thể như chip type, device size, data bus width, cùng vị trí memory, mô tả storage organization.

Khi cập nhật một phần Flash thường muốn giữ nội dung phần khác. Khi đó probe phải có cách giới hạn sector xóa. Với Abatron, thêm dòng bắt đầu keyword ERASE cho từng sector. Gọi lệnh `erase` qua telnet user interface, mọi sector có ERASE specification bị xóa. Listing 14-24 minh họa xóa phần Flash trên target board rồi lập trình bootloader image U-Boot mới.

LISTING 14-24 Xóa và lập trình Flash

```
$ telnet bdi
Trying 192.168.1.129...
Connected to bdi (192.168.1.129).
Escape character is ‘^]’.
BDI Debugger for Embedded PowerPC
=================================
...  (large volume of help text)

uei> erase
Erasing flash at 0xfff00000
Erasing flash at 0xfff10000
Erasing flash at 0xfff20000
Erasing flash at 0xfff30000
Erasing flash at 0xfff40000
Erasing flash passed
uei> prog 0xfff00000 u-boot.bin BIN
Programming u-boot.bin , please wait ....
Programming flash passed
uei>
```

Đầu tiên lập telnet session tới Abatron BDI-2000. Sau một số khởi tạo có prompt. Gọi `erase`, Abatron hiện dòng output cho từng section định nghĩa trong file. Với cấu hình Phụ lục F, định nghĩa năm erase sector, dành tối đa 256KB cho U-Boot bootloader binary.

Lệnh `prog` hiện với cả ba optional parameter, chỉ vị trí memory load image mới, image filename, file format—ở đây binary. Có thể chỉ parameter trong BDI-2000 configuration file, khi đó chỉ cần `prog` không parameter.

Ví dụ mới chạm bề mặt hai lệnh BDI-2000. Hỗ trợ nhiều tổ hợp cách dùng, khả năng khác. Mỗi hardware JTAG probe có cách riêng chỉ Flash erasure/programming. Xem documentation device cụ thể.

### 14.4.2 Debug với JTAG probe

Thay giao tiếp trực tiếp JTAG probe qua user interface, nhiều probe nối được source-level debugger. GDB phổ biến nhất được hardware probe hỗ trợ cho Linux. Trong cách dùng này GDB bắt đầu session với target qua external connection, thường Ethernet. Thay trực tiếp user interface, debugger trao đổi command với probe. Model này probe dùng GDB remote protocol điều khiển phần cứng thay debugger. Xem Hình 14-6 chi tiết kết nối.

JTAG probe đặc biệt hữu ích debug source-level bootloader, early startup code. Ví dụ minh họa GDB và Abatron BDI-2000 debug phần U-Boot trên Power Architecture target board.

Nhiều processor chứa debugging register cho address breakpoint truyền thống (dừng khi chương trình tới address cụ thể) và data breakpoint (dừng truy cập có điều kiện memory address cho). Debug code trong memory read-only như Flash, đây là cách duy nhất đặt breakpoint. Nhưng register thường giới hạn, nhiều processor chỉ một, hai. Phải hiểu trước dùng hardware breakpoint. Ví dụ sau minh họa.

Với setup như Hình 14-6, giả định target có U-Boot trong Flash. Chương 7 cho biết U-Boot và bootloader khác thường copy vào RAM sớm nhất sau startup, vì hardware read (write) cycle RAM nhanh hơn nhiều bậc so read-only memory device như Flash. Điều này tạo hai thách thức. Đầu tiên không sửa được nội dung read-only memory (chèn software breakpoint), phải dựa breakpoint register processor-supported.

Thứ hai chỉ một execution context (Flash hoặc RAM) được biểu diễn bằng ELF executable file GDB đọc symbolic debugging information. U-Boot link cho Flash environment lưu ban đầu. Early code tự relocate, điều chỉnh address cần. Nghĩa phải làm việc với GDB trong cả hai context. Listing 14-25 cho session ví dụ.

LISTING 14-25 Debug U-Boot bằng JTAG probe

```
$ ppc-linux-gdb -q u-boot
(gdb) target remote bdi:2001
Remote debugging using bdi:2001
_start () at /home/chris/sandbox/u-boot-1.1.4/cpu/mpc5xxx/start.S:91
91        li      r21, BOOTFLAG_COLD   /* Normal Power-On */
Current language:  auto; currently asm

<< Debug a flash resident code snippet >>
(gdb) mon break hard
(gdb) b board_init_f
Breakpoint 1 at 0xfff0457c: file board.c, line 366.
(gdb) c
Continuing.

Breakpoint 1, board_init_f (bootflag=0x7fc3afc) at board.c:366
366             gd = (gd_t *) (CFG_INIT_RAM_ADDR + CFG_GBL_DATA_OFFSET);
Current language:  auto; currently c
(gdb) bt
#0  board_init_f (bootflag=0x1) at board.c:366
#1  0xfff0456c in board_init_f (bootflag=0x1) at board.c:353
(gdb) i frame
Stack level 0, frame at 0xf000bf50:
 pc = 0xfff0457c in board_init_f (board.c:366); saved pc 0xfff0456c
 called by frame at 0xf000bf78
 source language c.
 Arglist at 0xf000bf50, args: bootflag=0x1
 Locals at 0xf000bf50, Previous frame’s sp is 0x0
<< Now debug a memory resident code snippet after relocation >>
(gdb) del 1
(gdb) symbol-file
Discard symbol table from ‘/home/chris/sandbox/u-boot-1.1.4-powerdna/u-boot’?
(y or n) y
No symbol file now.
(gdb) add-symbol-file u-boot 0x7fa8000
add symbol table from file “u-boot” at
        .text_addr = 0x7fa8000
(y or n) y
Reading symbols from u-boot...done.
(gdb) b board_init_r
Breakpoint 2 at 0x7fac6c0: file board.c, line 608.
(gdb) c
Continuing.

Breakpoint 2, board_init_r (id=0x7f85f84, dest_addr=0x7f85f84) at board.c:608
608             gd = id;      /* initialize RAM version of global data */
(gdb) i frame
Stack level 0, frame at 0x7f85f38:
 pc = 0x7fac6c0 in board_init_r (board.c:608); saved pc 0x7fac6b0
 called by frame at 0x7f85f68
 source language c.
 Arglist at 0x7f85f38, args: id=0x7f85f84, dest_addr=0x7f85f84
 Locals at 0x7f85f38, Previous frame’s sp is 0x0
(gdb) mon break soft
(gdb)
```

Nghiên cứu kỹ ví dụ. Có tinh tế đáng hiểu. Đầu nối Abatron BDI-2000 bằng `target remote`. IP address ở đây của Abatron, biểu diễn symbolic name bdi.[^11] Mặc định BDI-2000 dùng port 2001 cho remote GDB protocol.

Tiếp gọi lệnh tới BDI-2000 bằng GDB `mon`. Lệnh `mon` báo GDB chuyển phần còn lại trực tiếp remote hardware. Vì thế `mon break hard` đặt BDI-2000 hardware breakpoint mode.

Rồi đặt hardware breakpoint `board_init_f`, routine thực thi khi vẫn chạy từ Flash address `0xfff0457c`. Sau định nghĩa gọi continue (`c`) tiếp. Gặp ngay breakpoint `board_init_f`, tự do debug thường như step code, xem data. Thấy đã gọi `bt` xem stack backtrace và `i frame` xem current stack frame chi tiết.

Giờ continue lần nữa nhưng biết U-Boot copy vào RAM, tiếp tục từ bản RAM. Cần đổi debugging context giữ session sống. Để làm, bỏ current symbol table (lệnh `symbol-file` không argument), load cùng symbol file lại bằng `add-symbol-file`. Lần này yêu cầu GDB offset symbol table khớp nơi U-Boot relocate trong memory, bảo đảm source code, symbolic information khớp image memory-resident thực.

Sau load symbol table mới, thêm breakpoint vị trí biết sẽ ở RAM khi thực thi. Đây lộ phức tạp tinh tế. Vì U-Boot đang chạy Flash nhưng sắp chuyển vào RAM, nhảy tới bản RAM-based, vẫn phải dùng hardware breakpoint. Xét nếu software breakpoint: GDB ghi breakpoint opcode vào memory chỉ định nhưng U-Boot ghi đè khi copy vào RAM. Kết quả không bao giờ chạm breakpoint, bắt đầu nghi công cụ hỏng. Sau U-Boot vào bản RAM, symbol table cập nhật address RAM-based, tự do dùng breakpoint RAM-based. Lệnh cuối Listing 14-25 phản ánh, đặt BDI-2000 lại soft breakpoint mode.

Vì sao quan tâm hardware hay software breakpoint? Nếu register vô hạn thì không cần, nhưng không bao giờ vậy. Đây là khi hết hardware breakpoint register processor-supported trong session trên processor 4xx:

```
(gdb) b flash_init
Breakpoint 3 at 0x7fbebe0: file flash.c, line 70.
(gdb) c
Continuing.
warning: Cannot insert breakpoint 3:
Error accessing memory address 0x7fbebe0: Unknown error 4294967295.
```

Vì remote debugging, chưa biết resource constraint tới khi thử resume sau thêm breakpoint. Do cách GDB xử lý: khi chạm breakpoint, khôi phục mọi vị trí bằng original opcode. Khi resume, khôi phục breakpoint opcode tại vị trí chỉ. Quan sát bằng bật GDB remote debug như trước:

```
(gdb) set debug remote 1
```

## 14.5 Khi không boot được

Một câu hỏi thường gặp nhất trên mailing list embedded Linux có dạng:

```
I am trying to boot Linux on my board, and I get stuck after this message
prints to my console:
“Uncompressing Kernel Image . . . OK.”
```

Thế là bắt đầu đường học dài, đôi khi bực bội của embedded Linux! Nhiều thứ sai dẫn đến lỗi phổ biến này. Với kiến thức và JTAG debugger, có cách xác định sai ở đâu.

### 14.5.1 Early serial debug output

`CONFIG_SERIAL_TEXT_DEBUG` đã trình bày bản đầu sách bị deprecated trong Linux kernel gần đây. Tham chiếu configuration parameter này đã bỏ khỏi kernel source.

Tuy nhiên `CONFIG_EARLY_PRINTK` có trên phần lớn architecture, bật mặc định trong phần lớn kernel configuration. Khi bật cho serial console output sớm hơn nhiều so đăng ký serial driver. Trên phần lớn Linux port không cần làm gì, đã bật mặc định.

### 14.5.2 Dump printk log buffer

Khi nói debugging `printk` Phần 14.3.6, chỉ vài giới hạn. Chính `printk` implementation rất vững. Một nhược điểm là không thấy message `printk` tới giai đoạn boot sau, khi console device khởi tạo. Rất thường board treo lúc boot, nhiều message kẹt buffer `printk`. Biết tìm đâu thường xác định chính xác vấn đề. Thực tế nhiều lần kernel gặp lỗi dẫn lời gọi `panic()`. Output `panic()` có thể đã dump vào buffer `printk`, thường chỉ đúng dòng code lỗi.

Tốt nhất làm bằng JTAG debugger nhưng vẫn có thể dùng bootloader memory dump xem buffer `printk` sau reset. Nội dung memory có thể hỏng chút do reset nhưng text log buffer thường rất dễ đọc.

Buffer thực nơi `printk` lưu text message khai báo trong source file `printk` `.../kernel/printk.c`:

```
static char __log_buf[__LOG_BUF_LEN];
```

Dễ xác định linked location buffer từ Linux kernel map file `System.map`:

```
$ grep __log_buf System.map
   c022e5a4 b __log_buf
```

Nếu hệ thống treo boot ngay sau message `Uncompressing Kernel Image . . . OK`, reboot dùng bootloader xem buffer. Vì quan hệ kernel virtual memory, physical memory cố định trên architecture, có thể chuyển đổi đơn giản. Address `__log_buf` trên là kernel virtual address, phải đổi physical. Trên Power Architecture processor này chỉ trừ constant `KERNELBASE`, `0xc0000000`. Đây là nơi probe memory đọc nội dung, nếu có, log buffer `printk`.

Listing 14-26 là ví dụ do U-Boot memory dump command hiển thị.

LISTING 14-26 Dump raw log buffer `printk`

```
=> md 22e5a4
0022e5a4: 3c353e4c 696e7578 20766572 73696f6e    <5>Linux version
0022e5b4: 20322e36 2e313320 28636872 6973406a     2.6.13 (chris@
0022e5c4: 756e696f 72292028 67636320 76657273    junior) (gcc
0022e5d4: 696f6e20 332e342e 3320284d 6f6e7461    version 3.4.3 (Monta
0022e5e4: 56697374 6120332e 342e332d 32352e30    Vista 3.4.3-25.0
0022e5f4: 2e37302e 30353031 39363120 32303035    .70.0501961 2005
0022e604: 2d31322d 31382929 20233131 20547565    -12-18)) #11 Tue
0022e614: 20466562 20313420 32313a30 353a3036     Feb 14 21:05:06
0022e624: 20455354 20323030 360a3c34 3e414d43     EST 2006.<4>AMC
0022e634: 4320506f 77657250 43203434 30455020    C PowerPC 440EP
0022e644: 596f7365 6d697465 20506c61 74666f72    Yosemite Platform.
0022e654: 6d0a3c37 3e4f6e20 6e6f6465 20302074    <7>On node 0
0022e664: 6f74616c 70616765 733a2036 35353336    totalpages: 65536
0022e674: 0a3c373e 2020444d 41207a6f 6e653a20    .<7>  DMA zone:
0022e684: 36353533 36207061 6765732c 204c4946    65536 pages, LIF
0022e694: 4f206261 7463683a 33310a3c 373e2020    O batch:31.<7>
=>
0022e6a4: 4e6f726d 616c207a 6f6e653a 20302070    Normal zone: 0
0022e6b4: 61676573 2c204c49 464f2062 61746368    pages, LIFO batch
0022e6c4: 3a310a3c 373e2020 48696768 4d656d20    :1.<7>  HighMemzone:
0022e6d4: 7a6f6e65 3a203020 70616765 732c204c    0 pages,
0022e6e4: 49464f20 62617463 683a310a 3c343e42    LIFO batch:1.<4>
0022e6f4: 75696c74 2031207a 6f6e656c 69737473    Built 1 zonelists
0022e704: 0a3c353e 4b65726e 656c2063 6f6d6d61    .<5>Kernel command
0022e714: 6e64206c 696e653a 20636f6e 736f6c65    line: console
0022e724: 3d747479 53302c31 31353230 3020726f    =ttyS0,115200
0022e734: 6f743d2f 6465762f 6e667320 72772069    root=/dev/nfs rw
0022e744: 703d6468 63700a3c 343e5049 44206861    ip=dhcp.<4>PID
0022e754: 73682074 61626c65 20656e74 72696573    hash table entries
0022e764: 3a203230 34382028 6f726465 723a2031    : 2048 (order:
0022e774: 312c2033 32373638 20627974 6573290a    11, 32768 bytes).
0022e784: 00000000 00000000 00000000 00000000    . ..............
0022e794: 00000000 00000000 00000000 00000000    . ..............
=>
```

Không đẹp để đọc nhưng có dữ liệu. Thấy ví dụ kernel crash đâu đó sau khởi tạo PID hash table entry. Thêm message `printk` có thể khoanh dần nguồn crash thực.

Như ví dụ, kỹ thuật không cần công cụ thêm. Thấy tầm quan trọng của early serial port output lúc boot khi làm board port mới.

Cần lưu ý bootloader một số platform khởi tạo nội dung memory trước khi hoàn tất initialization. Trên đó nội dung kernel log buffer bị phá, không dùng kỹ thuật này nếu không sửa bootloader code.

### 14.5.3 KGDB khi panic

Nếu bật KGDB, kernel cố trả quyền KGDB khi error exception. Đôi khi lỗi dễ thấy. Để dùng phải có sẵn kết nối KGDB–GDB. Khi exception, KGDB gửi Stop Reply packet tới GDB chỉ lý do trap vào debug handler, cùng address trap. Listing 14-27 minh họa.

LISTING 14-27 Bắt crash khi panic bằng KGDB

```
$ ppc-_4xx-gdb -q vmlinux
(gdb) target remote /dev/ttyS0
Remote debugging using /dev/ttyS0

(gdb) c
Continuing.

<< KGDB gains control from panic() on crash >>
Program received signal SIGSEGV, Segmentation fault.
0xc0215d6c in pcibios_init () at arch/ppc/kernel/pci.c:1263
1263            *(int *)-1 = 0;
(gdb) bt
#0  0xc0215d6c in pcibios_init () at arch/ppc/kernel/pci.c:1263
#1  0xc020e728 in do_initcalls () at init/main.c:563
#2  0xc020e7c4 in do_basic_setup () at init/main.c:605
#3  0xc0001374 in init (unused=0x20) at init/main.c:677
#4  0xc00049d0 in kernel_thread ()
Previous frame inner to this frame (corrupt stack?)
(gdb)
```

Crash ví dụ cố tạo bằng ghi invalid memory location (toàn bit 1). Đầu nối GDB–KGDB rồi cho kernel boot tiếp. Chú ý không cần đặt breakpoint. Khi crash, thấy dòng code lỗi, backtrace đẹp giúp xác định nguyên nhân.

## 14.6 Tổng kết

- Debug Linux kernel có nhiều phức tạp, đặc biệt trong môi trường cross-

development. Hiểu cách xử lý những phức tạp

là chìa khóa debug kernel thành công.

- KGDB là GDB stub kernel-level rất hữu ích cho symbolic

debugging source-level trực tiếp trong Linux kernel, device driver. Nó dùng

GDB remote protocol giao tiếp cross-gdb host-based.

- Hiểu (và giảm thiểu) compiler optimization giúp hiểu

hành vi debugger có vẻ lạ khi step code compiler-

optimized.

- GDB hỗ trợ lệnh user-defined rất hữu ích tự động hóa

tác vụ debug tẻ nhạt như duyệt kernel linked list, truy cập

variable phức tạp.

- Module Kernel-loadable có thách thức riêng cho debugging source-level.

Có thể debug module initialization routine bằng đặt breakpoint

trong `module.c` tại lời gọi `mod->init()`.

- `printk` và Magic SysReq key cung cấp công cụ thêm để cô lập vấn

đề lúc phát triển, debug kernel.

- Debugging Hardware-assisted bằng JTAG probe cho debug code trong Flash hoặc

ROM, nơi phương pháp khác có thể cồng kềnh hoặc

không thể dùng.

- Bật `CONFIG_EARLY_PRINTK` trên architecture hỗ trợ tính năng

là công cụ mạnh debug kernel port mới.

- Xem `printk log_buf` thường chỉ nguyên nhân kernel crash âm thầm lúc

boot trên architecture hỗ trợ.

- KGDB chuyển quyền GDB khi kernel panic, cho xem

backtrace và cô lập nguyên nhân panic.

### 14.6.1 Gợi ý đọc thêm

Linux Kernel Development, 3rd Edition Robert Love Addison-Wesley, 2010

The Linux Kernel Primer Claudia Salzberg Rodriguez et al. Prentice Hall, 2005

“Using the GNU Compiler Collection” Richard M. Stallman and the GCC Developer Community GNU Press, a division of Free Software Foundation http://gcc.gnu.org/onlinedocs/

Debugging with GDB Richard Stallman, Roland Pesch, Stan Shebs, et al. Free Software Foundation www.gnu.org/software/gdb/documentation/

Dùng kgdb và kgdb internal www.kernel.org/doc/htmldocs/kgdb.html

Tool Interface Standards DWARF Debugging Information Format Specification Version 2.0 TIS Committee, May 1995

[^1]: Xem GCC manual cuối chương để biết optimization level chi tiết.

[^2]: Inline function như macro nhưng có lợi thế type checking compile-time.

[^3]: Bản KGDB đơn giản hóa vào mainline Linux 2.6.26 nhưng thiếu một số tính năng như KGDB over Ethernet và loại khác.

[^4]: Có thể cấu hình KGDB dùng Ethernet, thậm chí USB trên một số architecture, platform.

[^5]: Early debug support này do MontaVista cung cấp trong embedded Linux thương mại cho MPC8548. Hiện chưa có trong mainstream kernel source. Kernel cần patch early serial driver để tái tạo chức năng.

[^6]: Như đã nêu, GDB remote protocol chi tiết trong GDB manual cuối chương.

[^7]: Nhớ dùng cross-version readelf như ppc\_44x-readelf cho PowerPC 44x architecture.

[^8]: Tham chiếu DWARF debug specification cuối chương.

[^9]: Lối tắt hữu ích phát triển macro là lệnh GDB `source`, mở và đọc source file chứa macro definition.

[^10]: Symbol `_end` được định nghĩa trong linker script file lúc final link.

[^11]: Entry trong file `/etc/hosts` của host system cho phép tham chiếu symbolic IP address.
