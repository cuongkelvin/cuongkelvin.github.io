# Chương 2. Bức tranh tổng thể

## Trong chương này

- 2\.1 Embedded hay không? 10

- 2\.2 Cấu tạo Embedded System 12

- 2\.3 Cân nhắc về Storage 20

- 2\.4 Embedded Linux Distribution 32

- 2\.5 Tổng kết 34

Thông thường cách tốt nhất để hiểu một tác vụ là nắm vững

bức tranh tổng thể. Nhiều khái niệm nền tảng có thể gây khó khăn cho

người mới phát triển embedded system. Chương này đưa bạn

tham quan embedded system điển hình và development environment, đặc biệt

nhấn mạnh khái niệm và thành phần khiến việc phát triển các

hệ thống này khác biệt và thường nhiều thách thức.

## 2.1 Embedded hay không?

Embedded system gắn với một số thuộc tính chủ chốt. Bạn chưa chắc gọi desktop PC của mình là embedded system. Nhưng hãy xét desktop PC hardware platform trong remote data center thực hiện monitoring và alarm task quan trọng. Giả sử data center thường không có nhân viên. Điều này áp tập yêu cầu khác lên hardware platform. Ví dụ nếu mất rồi có điện lại, bạn kỳ vọng platform tiếp tục nhiệm vụ mà không cần operator can thiệp.

Embedded system có rất nhiều hình dạng và kích thước, từ những hệ thống lưu trữ dữ liệu hoặc xử lý mạng mạnh mẽ, lớn đến mức chiếm multiple-rack, cho tới các module nhỏ như MP3 player cá nhân hay điện thoại di động của bạn. Sau đây là một số đặc điểm thường gặp của embedded system:

- Chứa processing engine như microprocessor general-purpose.

- Thường thiết kế cho application hoặc mục đích cụ thể.

- Có user interface đơn giản (hoặc không có), như automotive engine ignition controller.

- Thường resource-limited. Ví dụ memory footprint nhỏ, không hard drive.

- Có thể hạn chế nguồn điện, như yêu cầu chạy bằng pin.

- Thường không dùng làm computing platform general-purpose.

- Thường application software tích hợp sẵn, không user-selected.

- Xuất xưởng với toàn bộ application hardware/software dự kiến đã tích hợp.

- Thường dành cho application không cần con người can thiệp.

Thông thường embedded system là resource-constrained so với desktop PC điển hình. Thường memory hạn chế, hard drive nhỏ hoặc không có, đôi khi không external network connectivity. Nhiều khi user interface duy nhất là serial port và vài LED. Những vấn đề này cùng vấn đề khác có thể thách thức embedded system developer.

### 2.1.1 BIOS và Bootloader

Khi máy tính desktop vừa được cấp điện, một chương trình software tên là BIOS lập tức nắm quyền điều khiển processor. (Trước đây, BIOS là từ viết tắt của Basic Input/Output Software, nhưng thuật ngữ này đã mang ý nghĩa riêng khi các chức năng nó thực hiện trở nên phức tạp hơn nhiều so với những cách triển khai ban đầu.) BIOS thực tế có thể được lưu trong Flash memory, sẽ được mô tả ngay sau đây, để thuận tiện nâng cấp chính chương trình BIOS tại nơi sử dụng.

BIOS là một tập hợp phức tạp các software routine system-configuration, có hiểu biết về những chi tiết low-level của hardware architecture. Phần lớn chúng ta không biết hết phạm vi và chức năng của BIOS, nhưng đây là một thành phần thiết yếu của desktop computer. BIOS là thành phần đầu tiên nắm quyền điều khiển processor khi được cấp nguồn. Trách nhiệm chính của nó là khởi tạo hardware, đặc biệt là memory subsystem, và load một operating system từ hard drive của PC.

Trong một embedded system điển hình (giả sử hệ thống không dựa trên x86 PC hardware platform industry-standard), bootloader là chương trình thực hiện các chức năng tương đương. Khi xây dựng custom embedded system của riêng mình, kế hoạch phát triển của bạn phải bao gồm việc phát triển một bootloader dành riêng cho board. May mắn là có sẵn một số bootloader open source tốt mà bạn có thể tùy chỉnh cho dự án. Các bootloader này được giới thiệu trong Chương 7, “Bootloader”.

Sau đây là tác vụ quan trọng bootloader làm khi power-up:

- Khởi tạo hardware component quan trọng như SDRAM controller, I/O controller và graphics controller.

- Khởi tạo system memory chuẩn bị giao quyền cho operating system.

- Cấp system resource như memory và interrupt circuit cho peripheral controller khi cần.

- Cung cấp cơ chế tìm và load operating system image.

- Load và giao quyền cho operating system cùng startup information cần thiết. Có thể gồm total memory size, clock rate, serial port speed và configuration data hardware-specific low-level khác.

Đây là phần tóm lược đơn giản về các tác vụ mà một bootloader embedded-system điển hình thực hiện. Điểm quan trọng cần nhớ là: nếu embedded system của bạn dựa trên một platform custom-designed, chính bạn, người thiết kế hệ thống, phải cung cấp các chức năng bootloader này. Nếu embedded system dựa trên platform commercial off-the-shelf (COTS), chẳng hạn một ATCA chassis,[^1] bootloader (và thường cả Linux kernel) thường đã có sẵn trên board. Chương 7 thảo luận chi tiết hơn về bootloader.

## 2.2 Cấu tạo Embedded System

Hình 2-1 là block diagram của một embedded system điển hình. Đây là ví dụ đơn giản về hardware architecture high-level có thể gặp trong một wireless access point. Hệ thống được thiết kế xoay quanh một RISC processor 32-bit. Flash memory được dùng để lưu trữ chương trình và dữ liệu không mất đi khi ngắt nguồn. Main memory là synchronous dynamic random-access memory (SDRAM), có dung lượng từ vài megabyte đến hàng trăm megabyte, tùy ứng dụng. Một module real-time clock, thường được cấp nguồn dự phòng bằng pin, duy trì thời gian trong ngày (calendar/wall clock, bao gồm cả ngày tháng). Ví dụ này có Ethernet interface và USB interface, cùng một serial port để truy cập console qua RS-232. Chipset hoặc module 802.11 thực hiện chức năng wireless modem.

Processor trong embedded system thường thực hiện nhiều chức năng ngoài việc xử lý core instruction stream truyền thống. Processor giả định trong Hình 2-1 có UART tích hợp cho serial interface, cùng các USB controller và Ethernet controller tích hợp. Nhiều processor có các peripheral tích hợp. Đôi khi chúng được gọi là system on chip (SOC). Chúng ta sẽ xem một số ví dụ về integrated processor trong Chương 3, “Kiến thức cơ bản về processor”.

![Figure 2-1](images/ch02/fig02-01.png)

HÌNH 2-1 Embedded system

### 2.2.1 Thiết lập Embedded Linux điển hình

Câu đầu người mới embedded Linux thường hỏi là cần gì để bắt đầu phát triển? Để trả lời, Hình 2-2 cho thấy thiết lập phát triển điển hình.

Hình 2-2 trình bày một cách bố trí phổ biến. Hình cho thấy một host development system chạy desktop Linux distribution mà bạn ưa thích, chẳng hạn Red Hat, SUSE hoặc Ubuntu Linux. Embedded Linux target board được kết nối với development host qua serial cable RS-232. Bạn cắm Ethernet interface của target board vào một Ethernet hub hoặc switch cục bộ; development host cũng kết nối đến đó qua Ethernet. Development host chứa các công cụ và tiện ích phát triển cùng các target file, thường được lấy từ một embedded Linux distribution.

![Figure 2-2](images/ch02/fig02-02.png)

HÌNH 2-2 Thiết lập phát triển Embedded Linux

Trong ví dụ này, kết nối chính của chúng ta đến embedded Linux target là kết nối RS-232. Một serial terminal program được sử dụng để giao tiếp với target board. Minicom là một trong các serial terminal application được sử dụng phổ biến nhất và có trên hầu như mọi desktop Linux distribution.[^2] Tác giả đã chuyển sang chọn `screen` làm terminal, thay thế chức năng của minicom. Nó linh hoạt hơn rất nhiều, đặc biệt khi thu thập trace, và xử lý tốt hơn các ký tự rác trên serial line thường gặp khi bringup hệ thống hoặc khắc phục sự cố. Để sử dụng `screen` theo cách này với một serial dongle USB-attached, chỉ cần gọi nó trên serial terminal và chỉ định tốc độ:

```
$ screen /dev/ttyUSB0 115200
```

### 2.2.2 Khởi động Target Board

Khi vừa cấp điện, bootloader đi kèm target board lập tức nắm quyền điều khiển processor. Nó thực hiện một số bước khởi tạo hardware rất low-level, bao gồm thiết lập processor và memory, khởi tạo UART điều khiển serial port và khởi tạo Ethernet controller. Listing 2-1 hiển thị các ký tự nhận được từ serial port khi target được cấp điện. Với ví dụ này, chúng ta chọn một target board của Freescale Semiconductor, PowerQUICC III MPC8548 Configurable Development System (CDS). Board chứa processor MPC8548 PowerQUICC III và được Freescale cung cấp với bootloader U-Boot cài đặt sẵn.

LISTING 2-1 Serial Output ban đầu của Bootloader

```
U-Boot 2009.01 (May 20 2009 - 09:45:35)

CPU:   8548E, Version: 2.1, (0x80390021)
Core:  E500, Version: 2.2, (0x80210022)
Clock Configuration:
       CPU:990  MHz, CCB:396  MHz,
       DDR:198  MHz (396 MT/s data rate), LBC:49.500 MHz
L1:    D-cache 32 kB enabled
       I-cache 32 kB enabled
Board: CDS Version 0x13, PCI Slot 1
CPU Board Revision 0.0 (0x0000)
I2C:   ready
DRAM:  Initializing
    SDRAM: 64 MB
    DDR: 256 MB
FLASH: 16 MB
L2:    512 KB enabled
Invalid ID (ff ff ff ff)
    PCI: 64 bit, unknown MHz, async, host, external-arbiter
               Scanning PCI bus 00
PCI on bus 00 - 02

    PCIE connected to slot as Root Complex (base address e000a000)
PCIE on bus 3 - 3
In:    serial
Out:   serial
Err:   serial
Net:   eTSEC0, eTSEC1, eTSEC2, eTSEC3
=>
```

Khi board MPC8548CDS được cấp điện, U-Boot thực hiện một số bước khởi tạo hardware low-level, bao gồm cấu hình một serial port. Sau đó, nó in một dòng banner, như dòng đầu của Listing 2-1. Tiếp theo là thông tin CPU và core, rồi đến một số dữ liệu cấu hình mô tả clock và cache configuration. Theo sau là một chuỗi văn bản mô tả board.

Khi cấu hình hardware ban đầu hoàn tất, U-Boot cấu hình các hardware subsystem theo static configuration của nó. Ở đây, chúng ta thấy I2C, DRAM, FLASH, L2 cache, PCI và network subsystem được U-Boot cấu hình. Cuối cùng, U-Boot chờ input từ console qua serial port, như được thể hiện bằng prompt `=>`.

### 2.2.3 Boot Kernel

Giờ U-Boot đã khởi tạo hardware, serial port và Ethernet network interface, chỉ còn một việc trong life span ngắn mà hữu ích: load và boot Linux kernel. Mọi bootloader có command load và thực thi operating system image. Listing 2-2 cho thấy cách phổ biến dùng U-Boot load/boot Linux kernel thủ công.

LISTING 2-2 Load Linux Kernel

```
=> tftp 600000 uImage
Speed: 1000, full duplex
Using eTSEC0 device
TFTP from server 192.168.0.103; our IP address is 192.168.0.18
Filename ‘uImage’.
Load address: 0x600000
Loading: #################################################################
         #############################################################
done
Bytes transferred = 1838553 (1c0dd9 hex)
=> tftp c00000 dtb
Speed: 1000, full duplex
Using eTSEC0 device
TFTP from server 192.168.0.103; our IP address is 192.168.0.18
Filename ‘dtb’.
Load address: 0xc00000
Loading: ##
done
Bytes transferred = 16384 (4000 hex)
=> bootm 600000 - c00000
## Booting kernel from Legacy Image at 00600000 ...
   Image Name:   MontaVista Linux 6/2.6.27/freesc
   Image Type:   PowerPC Linux Kernel Image (gzip compressed)
   Data Size:    1838489 Bytes =  1.8 MB
   Load Address: 00000000
   Entry Point:  00000000
   Verifying Checksum ... OK
## Flattened Device Tree blob at 00c00000
   Booting using the fdt blob at 0xc00000
   Uncompressing Kernel Image ... OK
   Loading Device Tree to 007f9000, end 007fffff ... OK
Using MPC85xx CDS machine description
Memory CAM mapping: CAM0=256Mb, CAM1=0Mb, CAM2=0Mb residual: 0Mb

...
< Lots of Linux kernel boot messages, removed for clarity >
...

freescale-8548cds login:  <<--- Linux login prompt
```

Lệnh `tftp` ở đầu Listing 2-2 yêu cầu U-Boot load kernel image `uImage` vào memory qua mạng bằng protocol TFTP[^3]. Trong trường hợp này, kernel image nằm trên development workstation, thường là cùng máy có serial port kết nối đến target board. Lệnh `tftp` được truyền một địa chỉ, là physical address trong memory của target board nơi kernel image sẽ được load. Hiện tại chưa cần lo về các chi tiết; Chương 7 trình bày U-Boot chi tiết hơn rất nhiều.

Lần gọi thứ hai của lệnh `tftp` load một board configuration file được gọi là device tree. Nó còn có các tên khác như flat device tree, device tree binary hoặc dtb. Bạn sẽ tìm hiểu thêm về file này trong Chương 7. Hiện tại, chỉ cần biết rằng file chứa thông tin board-specific mà kernel cần để boot board. Thông tin đó bao gồm kích thước memory, tốc độ clock, các onboard device, bus và Flash layout.

Tiếp theo, lệnh `bootm` (boot from memory image) được thực hiện để yêu cầu U-Boot boot kernel vừa load từ địa chỉ được lệnh `tftp` chỉ định. Trong ví dụ sử dụng `bootm` này, chúng ta yêu cầu U-Boot load kernel đã đặt tại `0x600000` và truyền device tree binary (dtb) đã load tại `0xc00000` cho kernel. Lệnh này chuyển quyền điều khiển sang Linux kernel. Giả sử kernel được cấu hình đúng, kết quả là Linux kernel boot đến console command prompt trên target board, như login prompt thể hiện.

Lưu ý rằng lệnh `bootm` đánh dấu sự kết thúc hoạt động của U-Boot. Đây là một khái niệm quan trọng. Khác với BIOS trong desktop PC, phần lớn embedded system được thiết kế sao cho khi Linux kernel nắm quyền điều khiển, bootloader không còn tồn tại. Kernel thu hồi mọi vùng memory và system resource mà bootloader đã sử dụng. Cách duy nhất để trao lại quyền điều khiển cho bootloader là reboot board.

Một quan sát cuối đáng lưu ý. Mọi serial output Listing 2-2 đến và gồm dòng này do bootloader U-Boot tạo:

```
Loading Device Tree to 007f9000, end 007fffff ... OK
```

Các boot message còn lại do Linux kernel tạo ra. Chúng ta sẽ thảo luận nhiều hơn về điều này ở phần sau, nhưng cần chú ý nơi U-Boot kết thúc công việc và nơi Linux kernel image tiếp quản.

### 2.2.4 Tổng quan Kernel Initialization

Khi Linux kernel bắt đầu thực thi, nó xuất ra nhiều status message trong quá trình boot khá toàn diện. Trong ví dụ đang thảo luận, Linux kernel hiển thị khoảng 200 dòng `printk`[^4] trước khi đưa ra login prompt. (Chúng tôi đã lược các dòng đó khỏi listing để làm rõ nội dung đang thảo luận.) Listing 2-3 trình bày lại một vài dòng output cuối trước login prompt. Mục tiêu của bài thực hành này không phải đi sâu vào chi tiết khởi tạo kernel, nội dung được trình bày trong Chương 5, “Kernel Initialization”. Mục tiêu là có hiểu biết high-level về những gì đang diễn ra và các thành phần cần thiết để boot Linux kernel trên embedded system.

LISTING 2-3 Boot Message cuối của Linux

```
...
Looking up port of RPC 100005/1 on 192.168.0.9
VFS: Mounted root (nfs filesystem).
Freeing unused kernel memory: 152k init
INIT: version 2.86 booting
...

freescale-8548cds login:
```

Ngay trước khi hiển thị login prompt trên serial terminal, Linux mount một root file system. Trong Listing 2-3, Linux thực hiện các bước cần thiết để mount root file system từ xa (qua Ethernet), từ một server NFS[^5] trên máy có IP address 192.168.0.9. Thông thường, đây là development workstation của bạn. Root file system chứa các chương trình ứng dụng, system library và tiện ích tạo nên một Linux system.

Không nên xem nhẹ điểm quan trọng trong phần thảo luận này: Linux yêu cầu phải có file system. Nhiều embedded operating system trước đây không yêu cầu file system. Điều này thường khiến các kỹ sư chuyển từ embedded OS cũ sang embedded Linux ngạc nhiên. File system bao gồm một tập hợp system directory và file được xác định trước, sắp xếp theo một layout cụ thể trên hard drive hoặc môi trường lưu trữ khác mà Linux kernel mount làm root file system.

Lưu ý rằng Linux có thể mount root file system từ các device khác. Dĩ nhiên, cách phổ biến nhất là mount một partition trên hard drive làm root file system, như trên Linux laptop hoặc workstation. Thực tế, NFS khá vô ích khi bạn xuất xưởng thiết bị embedded Linux và đưa nó ra khỏi môi trường phát triển. Tuy nhiên, khi đọc tiếp cuốn sách, bạn sẽ nhận thấy sức mạnh và tính linh hoạt của NFS root mounting trong vai trò một môi trường phát triển.

### 2.2.5 User Space Process đầu tiên: init

Cần thêm điểm quan trọng trước tiếp tục. Chú ý dòng Listing 2-3:

```
INIT: version 2.86 booting
```

Đến thời điểm này, chính kernel thực thi code và thực hiện nhiều bước khởi tạo trong một context được gọi là kernel context. Trong trạng thái hoạt động này, kernel sở hữu toàn bộ system memory và có toàn quyền đối với mọi system resource. Kernel có thể truy cập toàn bộ physical memory và tất cả I/O subsystem. Nó thực thi code trong kernel virtual address space, sử dụng stack do chính kernel tạo ra và sở hữu.

Khi Linux kernel hoàn tất quá trình khởi tạo nội bộ và mount root file system, hành vi mặc định là tạo một chương trình ứng dụng có tên `init`. Khi kernel khởi chạy `init`, chương trình được xem là đang chạy trong user space hay user space context. Trong chế độ hoạt động này, user space process có quyền truy cập hệ thống hạn chế và phải dùng kernel system call để yêu cầu các kernel service, chẳng hạn device I/O và file I/O. Các user space process, hay chương trình, hoạt động trong một virtual memory space được chọn ngẫu nhiên[^6] và do kernel quản lý. Kernel phối hợp với hardware memory-management chuyên dụng trong processor để thực hiện chuyển đổi address virtual-to-physical cho user space process. Lợi ích lớn nhất của kiến trúc này là lỗi trong một process không thể phá hỏng memory space của process khác. Đây là một vấn đề thường gặp trong embedded OS cũ, có thể dẫn đến những bug thuộc loại khó truy tìm nhất.

Đừng lo lắng nếu các khái niệm này có vẻ xa lạ. Mục tiêu của mục này là phác thảo một bức tranh tổng thể, từ đó bạn sẽ xây dựng kiến thức chi tiết hơn khi đọc tiếp cuốn sách. Những khái niệm này và các khái niệm khác được trình bày rất chi tiết trong những chương sau.

## 2.3 Cân nhắc về Storage

Một trong những thách thức lớn nhất khi phát triển embedded Linux là phần lớn embedded system có physical resource hạn chế. Dù máy Core™ 2 Duo trên bàn của bạn có thể có hard drive 500GB, việc gặp embedded system chỉ có một phần nhỏ dung lượng đó không phải hiếm. Trong nhiều trường hợp, hard drive được thay bằng các nonvolatile storage device nhỏ hơn và rẻ hơn. Hard drive cồng kềnh, có các bộ phận quay, nhạy với va đập vật lý và cần nhiều mức điện áp nguồn, nên không phù hợp với nhiều embedded system.

### 2.3.1 Flash Memory

Gần như mọi người đều quen với Compact Flash và SD card được dùng trong rất nhiều thiết bị tiêu dùng, chẳng hạn máy ảnh kỹ thuật số và PDA (cả hai đều là những ví dụ điển hình về embedded system). Các module dựa trên công nghệ Flash memory này có thể được xem như hard drive solid-state, có khả năng lưu trữ nhiều megabyte, thậm chí gigabyte dữ liệu trong một kích thước rất nhỏ. Chúng không có bộ phận chuyển động, tương đối bền và hoạt động với một mức điện áp nguồn thông dụng duy nhất.

Có nhiều nhà sản xuất Flash memory. Flash memory có nhiều electrical format, physical package và dung lượng khác nhau. Không hiếm embedded system chỉ có 4MB hoặc 8MB nonvolatile storage. Nhu cầu lưu trữ điển hình hơn của embedded Linux system nằm trong khoảng 16MB đến 256MB hoặc lớn hơn. Ngày càng nhiều embedded Linux system có nonvolatile storage đạt mức gigabyte.

Flash memory có thể được ghi và xóa dưới sự điều khiển của software. Công nghệ hard drive quay vẫn là phương tiện có thể ghi nhanh nhất. Tốc độ ghi và xóa Flash đã cải thiện đáng kể theo thời gian, nhưng thời gian ghi và xóa Flash vẫn chậm hơn đáng kể. Bạn phải hiểu một số khác biệt cơ bản giữa công nghệ hard drive và Flash memory để sử dụng công nghệ này đúng cách.

Flash memory được chia thành các đơn vị có thể xóa tương đối lớn, gọi là erase block. Một trong những đặc điểm định hình Flash memory là cách ghi và xóa dữ liệu. Trong một chip NOR[^7] Flash memory điển hình, software có thể đổi dữ liệu từ binary 1 thành binary 0 bằng các thao tác ghi đơn giản trực tiếp đến address của cell, mỗi lần một bit hoặc word. Tuy nhiên, để đổi một bit từ 0 trở lại 1, phải xóa toàn bộ erase block bằng một chuỗi control instruction đặc biệt gửi đến Flash chip.

Một NOR Flash memory device điển hình chứa nhiều erase block. Chẳng hạn, một Flash chip 4MB có thể chứa 64 erase block, mỗi block 64KB. Flash memory cũng có các loại với kích thước erase block không đồng đều, nhằm cho phép bố trí data-storage linh hoạt. Chúng thường được gọi là boot block hoặc boot sector Flash chip. Bootloader thường được lưu trong các block nhỏ hơn, còn kernel và dữ liệu cần thiết khác được lưu trong các block lớn hơn. Hình 2-3 minh họa cách bố trí kích thước block của một top boot Flash điển hình.

![Figure 2-3](images/ch02/fig02-03.png)

HÌNH 2-3 Boot block Flash architecture

Để sửa đổi dữ liệu lưu trong Flash memory array, block chứa dữ liệu cần sửa phải được xóa hoàn toàn. Ngay cả khi chỉ cần thay đổi 1 byte trong block, toàn bộ block vẫn phải được xóa và ghi lại.[^8] Flash block size tương đối lớn so với hard-drive sector size truyền thống. Để so sánh, một hard drive high-performance điển hình có các sector có thể ghi dài 512 hoặc 1024 byte. Hệ quả có thể thấy rõ: thời gian ghi để cập nhật dữ liệu trong Flash memory có thể gấp nhiều lần hard drive, một phần do mỗi lần cập nhật phải xóa và ghi lại một lượng dữ liệu tương đối lớn vào Flash. Trong trường hợp xấu nhất, các write cycle này có thể mất vài giây.

Một giới hạn khác cần xem xét của Flash memory là tuổi thọ ghi của Flash memory cell. Một NOR Flash memory cell chỉ có số write cycle hữu hạn trước khi hỏng. Mặc dù số cycle khá lớn, thông thường là 100.000 cycle mỗi block, có thể dễ dàng hình dung một Flash storage algorithm được thiết kế kém hoặc thậm chí một bug có thể nhanh chóng phá hỏng Flash device. Dĩ nhiên, bạn nên tránh cấu hình system logger xuất dữ liệu vào một device Flash-based.

### 2.3.2 NAND Flash

NAND Flash là một công nghệ Flash tương đối mới. Khi NAND Flash xuất hiện trên thị trường, Flash memory truyền thống như được mô tả ở mục trước được gọi là NOR Flash. Sự phân biệt này liên quan đến kiến trúc Flash memory cell bên trong. NAND Flash device cải thiện một số giới hạn của Flash truyền thống (NOR) bằng cách cung cấp block size nhỏ hơn, giúp ghi nhanh hơn, hiệu quả hơn và nhìn chung sử dụng Flash array hiệu quả hơn.

NOR Flash device giao tiếp với microprocessor theo cách tương tự nhiều microprocessor peripheral. Cụ thể, chúng có data bus và address bus song song, được kết nối trực tiếp[^9] với data/address bus của microprocessor. Mỗi byte hoặc word trong Flash array có thể được định địa chỉ riêng theo cách truy cập ngẫu nhiên. Ngược lại, NAND device được truy cập tuần tự qua một interface phức tạp khác nhau giữa các vendor. NAND device có mô hình hoạt động giống hard drive truyền thống và controller đi kèm hơn. Dữ liệu được truy cập theo các serial burst nhỏ hơn nhiều so với NOR Flash block size. Tuổi thọ write cycle của NAND Flash lớn hơn NOR Flash một bậc độ lớn, trong khi thời gian xóa nhỏ hơn đáng kể.

Tóm lại, microprocessor có thể truy cập trực tiếp NOR Flash và code thậm chí có thể được thực thi trực tiếp từ NOR Flash. (Tuy nhiên, vì lý do hiệu năng, điều này hiếm khi được thực hiện và chỉ có trên các hệ thống có tài nguyên cực kỳ hạn chế.) Thực tế, nhiều processor không thể cache các truy cập instruction vào Flash như với DRAM. Điều này tiếp tục làm giảm tốc độ thực thi. Ngược lại, NAND Flash phù hợp với lưu trữ khối lượng lớn theo định dạng file system hơn là lưu trữ dữ liệu và executable code ở dạng raw binary.

### 2.3.3 Sử dụng Flash

Người thiết kế embedded system có nhiều lựa chọn trong việc bố trí và sử dụng Flash memory. Trong những hệ thống đơn giản nhất, khi tài nguyên không quá hạn chế, raw binary data (có thể được nén) có thể được lưu trên Flash device. Khi boot, một file system image lưu trong Flash được đọc vào Linux ramdisk block device, mount làm file system và chỉ được truy cập từ RAM. Đây thường là lựa chọn thiết kế tốt khi dữ liệu trong Flash hiếm khi cần cập nhật. Lượng dữ liệu cần cập nhật tương đối nhỏ so với kích thước ramdisk. Cần hiểu rằng mọi thay đổi đối với file trong ramdisk đều mất đi khi reboot hoặc ngắt rồi cấp lại nguồn.

Hình 2-4 minh họa tổ chức Flash phổ biến cho embedded system đơn giản với nhu cầu nonvolatile storage cho dynamic data ít và không thường xuyên.

![Figure 2-4](images/ch02/fig02-04.png)

HÌNH 2-4 Flash memory layout điển hình

Bootloader thường được đặt ở đầu hoặc cuối Flash memory array. Theo sau bootloader là vùng được cấp phát cho Linux kernel image và ramdisk file system image,[^10] chứa root file system. Thông thường, Linux kernel image và ramdisk file system image được nén, và bootloader xử lý việc giải nén trong boot cycle.

Với dữ liệu động cần được giữ lại qua các lần reboot và tắt bật nguồn, có thể dành riêng một vùng Flash nhỏ khác hoặc sử dụng một loại nonvolatile storage khác.[^11] Đây là cấu hình điển hình của các embedded system có yêu cầu lưu dữ liệu cấu hình, chẳng hạn wireless access point dành cho thị trường tiêu dùng.

### 2.3.4 Flash File System

Các giới hạn của sơ đồ Flash layout đơn giản vừa mô tả có thể được khắc phục bằng cách sử dụng Flash file system để quản lý dữ liệu trên Flash device tương tự cách tổ chức dữ liệu trên hard drive. Những cách triển khai file system ban đầu cho Flash device gồm một block device layer đơn giản mô phỏng sector layout 512-byte của hard drive thông thường. Các emulation layer đơn giản này cho phép truy cập dữ liệu ở dạng file thay vì lưu trữ khối lượng lớn không định dạng, nhưng chúng có một số giới hạn về hiệu năng.

Một trong những cải tiến đầu tiên của Flash file system là tích hợp wear leveling. Như đã thảo luận trước đó, Flash block có tuổi thọ ghi hữu hạn. Các algorithm Wear-leveling được dùng để phân bố đều các lần ghi trên physical erase block của Flash memory nhằm kéo dài tuổi thọ Flash memory chip.

Một giới hạn khác xuất phát từ kiến trúc Flash là nguy cơ mất dữ liệu khi mất điện hoặc shutdown quá sớm. Hãy lưu ý rằng Flash block tương đối lớn, còn kích thước file trung bình được ghi thường nhỏ hơn nhiều so với block size. Bạn đã biết rằng phải ghi Flash theo từng block. Vì vậy, để ghi một file nhỏ 8KB, bạn phải xóa và ghi lại toàn bộ Flash block, có thể có kích thước 64KB hoặc 128KB; trong trường hợp xấu nhất, việc này có thể mất vài giây. Điều đó tạo ra một khoảng thời gian đáng kể có nguy cơ mất dữ liệu do mất điện.

Một trong những Flash file system được sử dụng phổ biến hiện nay là JFFS2, hay Journaling Flash File System 2. Nó có một số tính năng quan trọng nhằm cải thiện hiệu năng tổng thể, tăng tuổi thọ Flash và giảm nguy cơ mất dữ liệu khi mất nguồn. Những cải tiến đáng kể hơn trong JFFS2 file system mới nhất bao gồm wear leveling tốt hơn, nén và giải nén để lưu được nhiều dữ liệu hơn trong cùng dung lượng Flash, cùng hỗ trợ Linux hard link. Chủ đề này được trình bày chi tiết trong Chương 9 và Chương 10, “MTD subsystem”, khi chúng ta thảo luận về Memory Technology Device (MTD) subsystem.

### 2.3.5 Memory Space

Gần như mọi embedded operating system cũ đều xem và quản lý system memory như một flat address space lớn duy nhất. Nghĩa là address space của microprocessor trải từ 0 đến giới hạn trên của physical address range. Ví dụ, nếu microprocessor có 24 physical address line, giới hạn trên của memory sẽ là 16MB. Vì vậy, hexadecimal address của nó nằm trong khoảng từ `0x00000000` đến `0x00ffffff`. Các hardware design thường bố trí DRAM bắt đầu từ đầu thấp của khoảng này, còn Flash memory từ đầu cao trở xuống. Những address range chưa dùng giữa đầu cao của DRAM và đầu thấp của Flash được cấp để định địa chỉ các peripheral chip trên board. Cách thiết kế này thường do việc lựa chọn microprocessor quyết định. Hình 2-5 cho thấy một memory layout điển hình của embedded system đơn giản.

![Figure 2-5](images/ch02/fig02-05.png)

HÌNH 2-5 Memory map embedded system điển hình

Trong các embedded system truyền thống dựa trên legacy operating system, OS và mọi task[^12] có quyền truy cập như nhau đến tất cả tài nguyên trong hệ thống. Một bug trong process có thể xóa nội dung memory ở bất kỳ đâu trong hệ thống, dù thuộc chính nó, OS, task khác hay thậm chí một hardware register ở đâu đó trong address space. Mặc dù ưu điểm lớn nhất của cách tiếp cận này là sự đơn giản, nó dẫn đến những bug có thể rất khó chẩn đoán.

Các microprocessor High-performance chứa những hardware engine phức tạp tên là Memory Management Unit (MMU). Mục đích của chúng là cho phép operating system quản lý và kiểm soát chặt chẽ address space của chính nó cũng như address space được cấp phát cho process. Khả năng kiểm soát này có hai dạng chính: access right và memory translation. Access right cho phép operating system gán các quyền memory-access cụ thể cho từng task. Memory translation cho phép operating system virtualize address space, mang lại nhiều lợi ích.

Linux kernel tận dụng các hardware MMU này để tạo một virtual memory operating system. Một trong những lợi ích lớn nhất của virtual memory là sử dụng physical memory hiệu quả hơn bằng cách tạo cảm giác rằng hệ thống có nhiều memory hơn lượng thực sự hiện diện. Lợi ích khác là kernel có thể áp dụng access right cho từng vùng system memory được cấp phát cho task hoặc process, ngăn một process truy cập nhầm memory hoặc các tài nguyên thuộc process khác hay chính kernel.

Mục tiếp theo xem xét chi tiết hơn cách hoạt động của cơ chế này. Một bài hướng dẫn về sự phức tạp của virtual memory system nằm ngoài phạm vi cuốn sách.[^13] Thay vào đó, chúng ta xem xét những hệ quả của virtual memory system từ góc nhìn của người phát triển embedded system.

### 2.3.6 Execution Context

Một trong những công việc đầu tiên Linux thực hiện là cấu hình hardware MMU trên processor và các data structure hỗ trợ nó, đồng thời bật address translation. Khi bước này hoàn tất, kernel chạy trong virtual memory space riêng. Virtual kernel address mà kernel developer lựa chọn trong các Linux kernel version gần đây có giá trị mặc định là `0xC0000000`. Trong phần lớn architecture, đây là một parameter có thể cấu hình.[^14] Nếu xem symbol table của kernel, chúng ta sẽ thấy các kernel symbol được link tại address bắt đầu bằng `0xC0xxxxxx`. Kết quả là bất cứ khi nào kernel thực thi code trong kernel space, instruction pointer (program counter) của processor đều chứa giá trị trong khoảng này.

Trong Linux, chúng ta phân biệt hai operational context tách biệt rõ ràng, dựa trên môi trường mà một thread[^15] đang thực thi. Các thread thực thi hoàn toàn bên trong kernel được xem là hoạt động trong kernel context. Các chương trình ứng dụng được xem là hoạt động trong user space context. User space process chỉ có thể truy cập memory mà nó sở hữu và phải dùng kernel system call để truy cập các privileged resource như file I/O và device I/O. Một ví dụ có thể giúp làm rõ điều này.

Xét một ứng dụng mở file và đưa ra yêu cầu đọc, như trong Hình 2-6. Lời gọi function đọc bắt đầu trong user space, tại function `read()` của C library. Sau đó, C library gửi yêu cầu đọc đến kernel. Yêu cầu này gây ra context switch từ chương trình của người dùng sang kernel để phục vụ yêu cầu lấy dữ liệu file. Bên trong kernel, yêu cầu đọc dẫn đến truy cập hard-drive để yêu cầu các sector chứa dữ liệu của file.

![Figure 2-6](images/ch02/fig02-06.png)

HÌNH 2-6 File read request đơn giản

Thông thường, yêu cầu đọc hard-drive được gửi bất đồng bộ đến hardware. Nghĩa là request được chuyển đến hardware, và khi dữ liệu sẵn sàng, hardware interrupt processor. Chương trình ứng dụng đang chờ dữ liệu bị block trên một wait queue cho đến khi dữ liệu có sẵn. Sau đó, khi hard disk đã chuẩn bị dữ liệu, nó phát một hardware interrupt. (Mô tả này được cố ý đơn giản hóa để phục vụ minh họa.) Khi kernel nhận hardware interrupt, nó tạm dừng process đang thực thi và tiến hành đọc dữ liệu đang chờ từ drive.

Tổng hợp lại phần thảo luận, chúng ta đã xác định hai execution context tổng quát: user space và kernel space. Khi một chương trình ứng dụng thực hiện system call gây context switch và đi vào kernel, nó đang thực thi kernel code thay mặt một process. Bạn thường nghe điều này được gọi là process context bên trong kernel. Ngược lại, interrupt service routine (ISR) xử lý IDE drive, hoặc bất kỳ ISR nào khác, là kernel code không thực thi thay mặt process cụ thể nào. Điều này thường được gọi là interrupt context.

Có một số giới hạn trong context hoạt động này, bao gồm việc ISR không được block (sleep) hoặc gọi bất kỳ kernel function nào có thể dẫn đến blocking. Để tìm hiểu thêm các khái niệm này, hãy xem các tài liệu tham khảo ở cuối chương.

### 2.3.7 Process Virtual Memory

Khi một process được tạo, chẳng hạn khi người dùng nhập `ls` tại Linux command prompt, kernel cấp phát memory cho process và gán cho nó một dải địa chỉ virtual-memory. Các giá trị địa chỉ này không có mối quan hệ cố định với địa chỉ trong kernel hoặc bất kỳ process đang chạy nào khác. Hơn nữa, không có tương quan trực tiếp giữa physical memory address trên board và virtual memory mà process nhìn thấy. Thực tế, không hiếm trường hợp một process chiếm nhiều physical address khác nhau trong main memory trong suốt vòng đời do paging và swapping.

Listing 2-4 là chương trình “Hello World” quen thuộc, được sửa đổi để minh họa các khái niệm vừa thảo luận. Mục tiêu của ví dụ là minh họa address space mà kernel gán cho process. Code này được compile và chạy trên một embedded system chứa 256MB DRAM memory.

LISTING 2-4 Hello World, kiểu Embedded

```
#include <stdio.h>

int bss_var;        /* Uninitialized global variable */

int data_var = 1;   /* Initialized global variable */

int main(int argc, char **argv)
{
  void *stack_var;            /* Local variable on the stack */

  stack_var = (void *)main;   /* Don’t let the compiler */
                              /* optimize it out */

  printf(“Hello, World! Main is executing at %p\n”, stack_var);
  printf(“This address (%p) is in our stack frame\n”, &stack_var);

  /* bss section contains uninitialized data */
  printf(“This address (%p) is in our bss section\n”, &bss_var);

  /* data section contains initializated data */
  printf(“This address (%p) is in our data section\n”, &data_var);

  return 0;
}
```

Listing 2-5 hiển thị console output do chương trình này tạo ra. Lưu ý rằng process tên là `hello` cho rằng nó đang thực thi ở một vị trí trong high RAM ngay trên ranh giới 256MB (`0x10000418`). Cũng lưu ý stack address nằm vào khoảng giữa address space 32-bit, vượt xa 256MB RAM của chúng ta (`0x7ff8ebb0`). Điều này xảy ra như thế nào? DRAM thường liên tục trong những hệ thống như vậy. Với người quan sát thông thường, có vẻ chúng ta có gần 2GB DRAM để sử dụng. Các virtual address này do kernel gán và được hỗ trợ bởi physical RAM ở đâu đó trong phạm vi 256MB memory có sẵn trên embedded board.

LISTING 2-5 Output của Hello

```
root@192.168.4.9:~# ./hello
Hello, World! Main is executing at 0x10000418
This address (0x7ff8ebb0) is in our stack frame
This address (0x10010a1c) is in our bss section
This address (0x10010a18) is in our data section
root@192.168.4.9:~#
```

Một đặc điểm của virtual memory system là khi physical RAM khả dụng giảm xuống dưới threshold được chỉ định, kernel có thể swap out các memory page sang một phương tiện lưu trữ khối lượng lớn, thường là hard disk drive nếu có. Kernel xem xét các memory region đang hoạt động, xác định những vùng ít được sử dụng gần đây nhất và swap out chúng ra disk để giải phóng cho process hiện tại. Người phát triển embedded system thường vô hiệu hóa swapping do giới hạn hiệu năng hoặc tài nguyên. Ví dụ, trong phần lớn trường hợp, dùng một Flash memory device tương đối chậm và có tuổi thọ ghi hữu hạn làm swap device là vô lý. Nếu không có swap device, bạn phải thiết kế ứng dụng cẩn thận để hoạt động trong giới hạn physical memory khả dụng.

### 2.3.8 Môi trường Cross-Development

Trước khi phát triển ứng dụng và device driver cho embedded system, chúng ta cần một bộ công cụ như compiler và các tiện ích để tạo binary executable có định dạng phù hợp với target system. Xét một ứng dụng đơn giản được viết trên desktop PC, chẳng hạn ví dụ “Hello World” truyền thống. Sau khi tạo source code trên desktop, bạn gọi compiler đi kèm hệ thống desktop, thường là GNU `gcc`, để tạo một binary executable image. Image file đó có định dạng phù hợp để thực thi trên chính máy đã compile nó. Cách này được gọi là native compilation. Nói cách khác, bằng compiler trên desktop system, bạn tạo code sẽ thực thi trên desktop system đó.

Lưu ý native không hàm ý architecture. Nếu có toolchain chạy trên target board, có thể native compile application cho architecture target. Thực tế cách stress-test embedded kernel mới và custom board tốt là compile Linux kernel lặp lại trên đó.

Phát triển software trong môi trường cross-development yêu cầu compiler trên development host xuất binary executable không tương thích desktop development workstation dùng compile. Lý do chính có tool này là thường không thực tế hoặc không thể phát triển/compile natively trên embedded system vì resource constraint (thường memory và CPU horsepower).

Cách tiếp cận này có nhiều cạm bẫy tiềm ẩn thường khiến người mới phát triển embedded system thiếu thận trọng gặp khó khăn. Khi một chương trình được compile, compiler thường biết cách tìm các include file và nơi tìm những library có thể cần thiết để việc compile thành công. Để minh họa các khái niệm này, hãy xem lại chương trình “Hello World”. Ví dụ được trình bày lại trong Listing 2-4 đã được compile bằng dòng lệnh sau:

```
gcc -Wall -o hello hello.c
```

Trong Listing 2-4, chúng ta thấy một include file là `stdio.h`. File này không nằm cùng directory với file `hello.c` được chỉ định trên command line của `gcc`. Vậy compiler tìm các file đó bằng cách nào? Ngoài ra, function `printf()` không được định nghĩa trong file `hello.c`. Vì vậy, khi `hello.c` được compile, nó sẽ chứa một unresolved reference đến symbol này. Linker resolve reference đó tại link time như thế nào?

Compiler có các giá trị mặc định built-in để xác định vị trí include file. Khi gặp tham chiếu đến include file, compiler tìm trong danh sách vị trí mặc định để lấy file. Linker thực hiện một quá trình tương tự để resolve tham chiếu đến external symbol `printf()`. Theo mặc định, linker biết cần tìm các tham chiếu chưa được resolve trong C library (`libc-*`) và biết nơi tìm tham chiếu trên hệ thống. Một lần nữa, hành vi mặc định này được tích hợp trong toolchain.

Bây giờ, giả sử bạn đang build một ứng dụng cho embedded system Power Architecture. Rõ ràng, bạn cần cross-compiler để tạo binary executable tương thích với processor Power Architecture. Nếu thực hiện một lệnh compile tương tự bằng cross-compiler để compile ví dụ `hello.c` ở trên, binary executable có thể vô tình được link với phiên bản C library dành cho x86 trên development system khi resolve tham chiếu đến `printf()`. Dĩ nhiên, kết quả chạy executable lai không hợp lệ này, chứa lẫn binary instruction Power Architecture và x86,[^16] là điều có thể dự đoán: crash!

Giải pháp là chỉ dẫn cross-compiler tìm ở các vị trí không chuẩn để lấy header file và library dành riêng cho target. Chúng ta trình bày chủ đề này chi tiết hơn rất nhiều trong Chương 12. Mục đích của ví dụ là minh họa khác biệt giữa native development environment và môi trường phát triển hướng đến cross-compilation cho embedded system. Đây chỉ là một trong những điểm phức tạp của môi trường cross-development. Cùng vấn đề và giải pháp cũng áp dụng cho cross-debugging, như bạn sẽ thấy từ Chương 14, “Kỹ thuật Kernel Debugging”. Một môi trường cross-development phù hợp rất quan trọng để thành công và bao gồm nhiều thứ hơn compiler, như bạn sẽ thấy trong Chương 12.

## 2.4 Embedded Linux Distribution

Chính xác thì Linux distribution là gì? Sau khi Linux kernel boot, nó mong đợi tìm thấy và mount một root file system. Khi một root file system phù hợp đã được mount, các startup script khởi chạy một số chương trình và tiện ích mà hệ thống yêu cầu. Các chương trình này thường gọi chương trình khác để thực hiện những tác vụ cụ thể, chẳng hạn tạo login shell, khởi tạo network interface và khởi chạy ứng dụng của user. Mỗi chương trình có các yêu cầu riêng (thường gọi là dependency), phải được những thành phần khác trong hệ thống đáp ứng. Phần lớn chương trình ứng dụng Linux phụ thuộc vào một hoặc nhiều system library. Các chương trình khác yêu cầu configuration file, log file, v.v. Tóm lại, ngay cả một embedded Linux system nhỏ cũng cần nhiều chục file được bố trí trong một directory structure phù hợp trên root file system.

Các desktop system Full-blown có hàng nghìn file trên root file system. Những file này đến từ các package thường được nhóm theo chức năng. Package thường được cài đặt và quản lý bằng package manager. Red Hat’s Package Manager (`rpm`) là một ví dụ phổ biến, được sử dụng rộng rãi để cài đặt, xóa và cập nhật package trên Linux system. Nếu Linux workstation dựa trên Red Hat, bao gồm dòng Fedora, nhập `rpm -qa` tại command prompt sẽ liệt kê mọi package được cài trên hệ thống. Nếu sử dụng distribution dựa trên Debian như Ubuntu, nhập `dpkg -l` cho kết quả tương tự.

Một package có thể gồm nhiều file; thực tế, một số package chứa hàng trăm file. Một Linux distribution hoàn chỉnh có thể chứa hàng trăm hoặc thậm chí hàng nghìn package. Sau đây là một số ví dụ package bạn có thể thấy trong embedded Linux distribution và mục đích của chúng:

- `initscripts` chứa basic system startup/shutdown script.

- `apache` triển khai Apache web server phổ biến.

- `telnet-server` chứa file cần cho telnet server, cho phép thiết lập telnet session tới embedded target.

- `glibc` triển khai Standard C library.

- `busybox` chứa version gọn của hàng chục command-line utility phổ biến trên UNIX/Linux.[^17]

Đó là mục đích của một Linux distribution theo cách thuật ngữ này được sử dụng. Một Linux distribution điển hình đi kèm vài CD-ROMs chứa đầy các chương trình, library, công cụ, tiện ích và tài liệu hữu ích. Việc cài đặt distribution thường cung cấp cho người dùng một hệ thống đầy đủ chức năng dựa trên tập configuration option mặc định hợp lý, có thể được tùy chỉnh cho phù hợp các yêu cầu cụ thể. Bạn có thể đã quen với một desktop Linux distribution phổ biến, chẳng hạn Red Hat hoặc Ubuntu.

Linux distribution cho embedded target khác biệt ở một số điểm đáng kể. Trước tiên, các executable target binary từ embedded distribution không chạy trên PC mà hướng đến architecture và processor của embedded system. (Dĩ nhiên, nếu embedded Linux distribution hướng đến x86 architecture, nhận định này không nhất thiết đúng.) Desktop Linux distribution thường có nhiều GUI tool dành cho người dùng desktop thông thường, chẳng hạn đồng hồ đồ họa đẹp mắt, máy tính, công cụ time-management cá nhân, e-mail client và các công cụ khác. Embedded Linux distribution thường bỏ các thành phần đó để thay bằng công cụ chuyên dụng cho người phát triển, chẳng hạn công cụ phân tích memory, khả năng remote debug và nhiều công cụ khác.

Một khác biệt đáng kể khác giữa desktop Linux distribution và embedded Linux distribution là embedded distribution thường chứa cross tool thay vì native tool. Ví dụ, toolchain `gcc` đi kèm embedded Linux distribution chạy trên desktop PC x86 nhưng tạo binary code chạy trên target system, thường là architecture non-x86. Nhiều công cụ khác trong toolchain cũng được cấu hình tương tự: chúng chạy trên development host, thường là PC x86, nhưng được thiết kế để tạo hoặc thao tác các object dành cho architecture khác như ARM hoặc Power Architecture.

### 2.4.1 Linux Distribution thương mại

Có một số vendor cung cấp embedded Linux distribution thương mại. Các embedded Linux vendor hàng đầu đã cung cấp distribution trong nhiều năm. Tương đối dễ tìm thông tin về các vendor này. Một tìm kiếm Internet nhanh với cụm “embedded Linux distributions” dẫn đến một số danh sách tổng hợp. Một danh sách đặc biệt hữu ích có tại http://elinux.org/Embedded\_Linux\_Distributions.

### 2.4.2 Linux Distribution Do-It-Yourself

Bạn có thể chọn tự tập hợp tất cả thành phần cần thiết cho dự án embedded của mình. Bạn phải quyết định liệu các rủi ro có xứng đáng với công sức bỏ ra hay không. Nếu bạn tìm hiểu embedded Linux hoàn toàn vì niềm vui, chẳng hạn cho một sở thích cá nhân hoặc dự án ở trường đại học, cách tiếp cận này có thể phù hợp. Tuy nhiên, hãy dự kiến dành một lượng thời gian đáng kể để tập hợp mọi công cụ và tiện ích mà dự án cần, đồng thời bảo đảm chúng phối hợp hoạt động với nhau.

Trước tiên, bạn cần một toolchain. `gcc` và `binutils` có tại www.fsf.org và các mirror khác trên toàn thế giới. Cả hai đều cần thiết để compile kernel và userspace application cho dự án. Chúng chủ yếu được phân phối dưới dạng source code, và bạn phải compile các công cụ cho phù hợp môi trường cross-development cụ thể. Thường cần patch các source tree “stable” mới nhất của những tiện ích này, đặc biệt khi sử dụng ngoài x86/IA32 architecture. Patch thường nằm cùng vị trí với các base package. Thách thức là xác định những tập patch cần thiết cho vấn đề hoặc architecture cụ thể của bạn.

Ngay khi toolchain hoạt động, bạn cần download và compile nhiều application package cùng các dependency mà chúng yêu cầu. Đây có thể là một thách thức lớn vì ngay cả hiện nay, nhiều package không thuận tiện cho cross-compiling. Nhiều package vẫn gặp vấn đề build hoặc các vấn đề khác khi rời môi trường x86 gốc nơi chúng được phát triển.

Ngoài những thách thức này, bạn có thể muốn tập hợp một môi trường phát triển đầy đủ năng lực, chứa các công cụ như graphical debugger, công cụ phân tích memory, công cụ system tracing và profiling cùng các công cụ khác. Từ phần thảo luận này, bạn có thể thấy việc tự build embedded Linux distribution có thể khá khó khăn.

## 2.5 Tổng kết

Chương này đã trình bày nhiều chủ đề ở mức tổng quát. Bây giờ, bạn có góc nhìn phù hợp cho nội dung tiếp theo. Trong các chương sau, góc nhìn này được mở rộng để giúp bạn phát triển những kỹ năng và kiến thức cần thiết nhằm thành công trong dự án embedded tiếp theo.

- Embedded system chung vài thuộc tính. Thường resource hạn chế, user interface đơn giản/không có và thường thiết kế mục đích cụ thể.

- Bootloader là một thành phần thiết yếu của embedded system điển hình. Nếu embedded system dựa trên một board custom-designed, bạn phải cung cấp bootloader như một phần của thiết kế. Thông thường, đây chỉ là việc port một bootloader hiện có.

- Cần nhiều software component để boot custom board, gồm bootloader, kernel và file system image.

- Flash memory dùng rộng làm storage medium embedded Linux. Chương giới thiệu khái niệm, Chương 9/10 mở rộng.

- Application program, còn gọi process, sống trong virtual memory space riêng kernel gán. Nói application chạy trong user space.

- Môi trường cross-development environment trang bị/cấu hình đúng rất quan trọng với embedded developer. Chương 12 dành riêng chủ đề này.

- Cần embedded Linux distribution để bắt đầu phát triển target. Chứa nhiều component compile/tối ưu cho architecture chọn.

### 2.5.1 Gợi ý đọc thêm

Linux Kernel Development, 3rd Edition Robert Love Addison-Wesley, 2010

Understanding the Linux Kernel Daniel P. Bovet and Marco Cesati O’Reilly \& Associates, Inc., 2002

Understanding the Linux Virtual Memory Manager Bruce Perens Prentice Hall, 2004 Trang này cố ý để trống

[^1]: ATCA platform giới thiệu Chương 3.

[^2]: Bạn có thể cần cài minicom từ repository của distribution đang dùng. Chẳng hạn, trên Ubuntu, bạn chạy `sudo` `apt-get install minicom` để cài minicom trên máy desktop của mình.

[^3]: Server này và các server khác mà bạn sẽ sử dụng được trình bày chi tiết trong Chương 12, “Môi trường phát triển embedded”.

[^4]: `printk()` là function kernel chịu trách nhiệm hiển thị message lên system console.

[^5]: NFS và server cần khác trình bày Chương 12.

[^6]: Thực ra điều này không ngẫu nhiên, nhưng trong phạm vi thảo luận ở đây, chúng ta có thể xem như vậy. Chủ đề này sẽ được trình bày chi tiết hơn ở phần sau.

[^7]: Có nhiều loại công nghệ Flash. NOR Flash là một trong những loại được sử dụng phổ biến nhất trong các embedded system nhỏ.

[^8]: Hãy nhớ rằng bạn có thể đổi giá trị 1 thành 0 theo từng byte, nhưng phải xóa toàn bộ block để đổi bất kỳ bit nào từ 0 thành 1.

[^9]: Trực tiếp theo nghĩa logic. Mạch thực có thể có bus buffer hoặc bridge device, v.v.

[^10]: Chúng ta sẽ thảo luận chi tiết hơn về ramdisk file system trong Chương 9, “File system”.

[^11]: Các module Real-time clock và serial EEPROM thường được chọn để lưu trữ một lượng nhỏ dữ liệu trong nonvolatile storage.

[^12]: Trong phần thảo luận này, từ task được dùng để chỉ bất kỳ thread of execution nào, bất kể cơ chế được dùng để tạo, quản lý hay lập lịch cho nó.

[^13]: Có nhiều cuốn sách hay trình bày chi tiết về virtual memory system. Hãy xem phần cuối chương này để biết các tài liệu được đề xuất.

[^14]: Tuy nhiên hiếm lý do tốt để đổi.

[^15]: Thuật ngữ thread ở đây được dùng theo nghĩa chung để chỉ bất kỳ luồng instruction nào được thực hiện tuần tự.

[^16]: Thực tế, chương trình thậm chí còn không thể compile hoặc link, chứ chưa nói đến chạy. Chúng ta chỉ đang cố minh họa ý này!

[^17]: Package này đủ quan trọng để được dành riêng một chương. Chương 11, “BusyBox”, trình bày chi tiết về BusyBox.
