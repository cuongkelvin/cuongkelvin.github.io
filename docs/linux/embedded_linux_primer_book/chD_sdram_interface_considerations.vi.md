# Phụ lục D. Các cân nhắc về SDRAM interface

## Trong phụ lục này

- D.1 SDRAM cơ bản 572

- D.2 Clocking 574

- D.3 Thiết lập SDRAM 575

- D.4 Tổng kết 580

Thoạt nhìn, lập trình SDRAM controller có thể là tác vụ

rất khó. Thực tế có nhiều công nghệ Synchronous Dynamic Random

Access Memory (DRAM). Trong hành trình never-ending tìm hiệu

năng, mật độ, nhiều architecture và mode hoạt động

đã phát triển.

Chúng ta khảo sát AMCC PowerPC 405GP processor cho thảo luận

SDRAM interface. Bạn có thể muốn có User’s Manual

để tham khảo khi khám phá vấn đề SDRAM interfacing.

Tài liệu tham chiếu phần cuối phụ lục.

## D.1 SDRAM cơ bản

Để hiểu cách thiết lập SDRAM, bạn phải hiểu những nguyên lý cơ bản về hoạt động của SDRAM device. Không đi sâu vào chi tiết hardware design, một SDRAM device được tổ chức thành ma trận các cell, trong đó một số address bit dành cho row addressing và một số khác dành cho column addressing, như trong Hình D-1.

Bên trong memory matrix, mạch điện khá phức tạp. Một ví dụ đơn giản hóa về thao tác đọc như sau: một memory location được tham chiếu bằng cách đặt row address lên các row address line, sau đó đặt column address lên các column address line. Sau một khoảng thời gian, dữ liệu lưu tại vị trí được xác định bởi các row input và column input được cung cấp cho processor trên data bus.

Processor xuất row address lên SDRAM address bus và assert tín hiệu Row Address Select (RAS). Sau một khoảng trễ ngắn được lập trình trước để mạch SDRAM ghi nhận row address, processor xuất column address và assert tín hiệu Column Address Select (CAS). Chính SDRAM controller chuyển địa chỉ physical memory thực tế thành row address và column address. Nhiều SDRAM controller cho phép cấu hình độ rộng của row và column; PPC405GP là một ví dụ. Phần sau sẽ cho thấy các giá trị này phải được cấu hình trong quá trình thiết lập SDRAM controller.

![Figure D-1](images/chD/figD-01.png)

HÌNH D-1 SDRAM block diagram đơn giản hóa

Ví dụ này đã được đơn giản hóa rất nhiều, nhưng các khái niệm vẫn giống nhau. Chẳng hạn, một burst read đọc bốn memory location cùng lúc và xuất một chu kỳ RAS và CAS duy nhất. Mạch SDRAM bên trong tự động tăng column address cho ba vị trí tiếp theo của burst read, nhờ đó processor không phải phát bốn chu kỳ CAS riêng biệt. Đây chỉ là một ví dụ về tối ưu hiệu năng. Cách tốt nhất để hiểu điều này là nắm vững các chi tiết của một memory chip thực tế. Mục cuối của phụ lục đề cập một ví dụ về data sheet well-written.

### D.1.1 SDRAM refresh

Một SDRAM được cấu thành từ một transistor và một capacitor. Transistor cung cấp điện tích, còn nhiệm vụ của capacitor là giữ lại (lưu trữ) giá trị của từng cell. Vì những lý do nằm ngoài phạm vi phần thảo luận này, capacitor chỉ có thể giữ giá trị trong một thời gian ngắn. Một nguyên lý cơ bản của dynamic memory là các capacitor biểu diễn từng cell phải được nạp điện lại định kỳ để duy trì giá trị của chúng. Quá trình này được gọi là SDRAM refresh.

Refresh cycle là một memory cycle đặc biệt, không đọc dữ liệu từ memory cũng không ghi dữ liệu vào memory. Nó chỉ thực hiện thao tác refresh cần thiết. Một trách nhiệm chính của SDRAM controller là bảo đảm các refresh cycle được phát đúng lúc để đáp ứng yêu cầu của chip.

Nhà sản xuất chip quy định các refresh interval tối thiểu, và người thiết kế có trách nhiệm bảo đảm những khoảng thời gian đó. Thông thường, có thể cấu hình trực tiếp SDRAM controller để chọn refresh interval. PowerPC 405GP được trình bày ở đây có một register dành riêng cho mục đích này. Bạn sẽ tìm hiểu về nó ngay sau đây.

## D.2 Clocking

Thuật ngữ synchronous có nghĩa là các chu kỳ đọc và ghi dữ liệu của SDRAM device diễn ra đồng bộ với clock signal từ CPU. Single data rate (SDR) SDRAM được đọc và ghi ở mỗi SDRAM clock cycle. Dual data rate (DDR) SDRAM được đọc và ghi hai lần trong mỗi clock cycle: một lần ở rising edge và một lần ở falling edge của clock.

Các processor hiện đại có clocking subsystem phức tạp. Nhiều processor có nhiều clock rate dùng cho các phần khác nhau của hệ thống. Một processor điển hình sử dụng một clock source crystal-generated có tần số low-frequency tương đối thấp làm clock signal chính. Một phase-locked loop (PLL) bên trong processor tạo ra primary clock của CPU, tức clock rate mà chúng ta nói đến khi so sánh tốc độ processor. Vì CPU thường chạy nhanh hơn memory subsystem rất nhiều, processor tạo ra một clock có tần số bằng một ước số của main CPU clock để cấp cho SDRAM subsystem. Bạn cần cấu hình tỷ lệ clock này phù hợp với tổ hợp CPU và SDRAM cụ thể của mình.

Clock của processor và memory subsystem phải được cấu hình chính xác để SDRAM hoạt động đúng. Processor manual có một mục về thiết lập và quản lý clock. Bạn nên tham khảo mục đó để thiết lập đúng cho board design cụ thể của mình.

AMCC 405GP là một processor điển hình xét về tập tính năng của nó. Nó nhận một clock input source crystal-generated duy nhất và tạo ra nhiều clock bên trong và bên ngoài theo yêu cầu của các subsystem. Nó tạo clock cho CPU, PCI interface, Onboard Peripheral Bus (OPB), Processor Local Bus (PLB), Memory Clock (MemClk), cùng một số clock nội bộ cho các peripheral như timer block và UART block. Bảng D-1 minh họa một cấu hình điển hình.

BẢNG D-1 Clock configuration mẫu

| Clock | Rate | Giải thích |
|---|---|---|
| Crystal reference | 33MHz | Reference nền tảng cấp processor. |
| CPU clock | 133MHz | Từ internal PLL, điều khiển bằng hardware pin strapping và register setting. |
| PLB clock | 66MHz | Được tạo từ CPU clock và cấu hình thông qua hardware pin strapping cùng các thiết lập register. Được dùng để trao đổi dữ liệu trên processor local bus nội bộ giữa các module high-speed của processor. |
| OPB clock | 66MHz | Được tạo từ PLB clock và cấu hình thông qua các thiết lập register. Được dùng để kết nối nội bộ các peripheral không cần kết nối high-speed. |
| PCI clock | 33MHz | Từ PLB clock, cấu hình register. |
| MemClk | 100MHz | Trực tiếp điều khiển SDRAM chip. Từ CPU clock, cấu hình register. |

Các quyết định về thiết lập clock thường phải được đưa ra ngay trong giai đoạn hardware design. Những pin strapping option xác định cấu hình clock ban đầu khi processor được cấp nguồn. Bạn thường có thể kiểm soát một phần các derived clock bằng cách đặt divider bit có thể truy cập thông qua các internal register của processor dành riêng cho việc điều khiển clock và subsystem. Trong ví dụ dựa trên 405GP ở đây, cấu hình clock cuối cùng được quyết định bởi pin strapping và firmware configuration. Bootloader có trách nhiệm đặt các divider ban đầu và mọi clock option khác có thể cấu hình thông qua processor register bit từ rất sớm sau khi cấp nguồn.

## D.3 Thiết lập SDRAM

Sau khi cấu hình các clock, bước tiếp theo là cấu hình SDRAM controller. Controller có thể khác nhau rất nhiều giữa các processor, nhưng kết quả cuối cùng luôn giống nhau: bạn phải cung cấp các giá trị clocking và timing chính xác để kích hoạt và tối ưu hiệu năng của SDRAM subsystem.

Cũng như những nội dung khác trong cuốn sách, không gì thay thế được hiểu biết chi tiết về hardware bạn đang cố cấu hình. Điều này đặc biệt đúng với SDRAM. Việc tìm hiểu thiết kế SDRAM nằm ngoài phạm vi phụ lục này, nhưng bạn cần hiểu một số nguyên lý cơ bản. Nhiều data sheet về SDRAM device do nhà sản xuất cung cấp có các mô tả kỹ thuật hữu ích. Bạn nên làm quen với nội dung của những data sheet đó. Bạn không cần có bằng kỹ thuật hardware để hiểu phải làm gì nhằm cấu hình đúng SDRAM subsystem, nhưng vẫn cần đạt được một mức độ hiểu biết nhất định.

Chúng ta sẽ khảo sát cách SDRAM controller trên processor 405GP được cấu hình bởi bootloader U-Boot đã trình bày trong Chương 7, “Bootloader”. Hãy nhớ từ Chương 7 rằng U-Boot cung cấp một hook để khởi tạo SDRAM từ startup code viết bằng assembly language trong file `start.S`, thuộc CPU directory 4xx-specific. Xem Mục 7.4.5, “Khởi tạo Board-Specific”, trong Chương 7. Listing D-1 trình bày function `sdram_init()` từ file `.../cpu/ppc4xx/sdram.c` của U-Boot.

LISTING D-1 `ppc4xx sdram_init()` từ U-Boot

```
01 void sdr7am_init(void)
02 {
03         ulong sdtr1;
04         ulong rtr;
05         int i;
06
07         /*
08          * Support for 100MHz and 133MHz SDRAM
09          */
10         if (get_bus_freq(0) > 100000000) {
11                 /*
12                  * 133 MHz SDRAM
13                  */
14                 sdtr1 = 0x01074015;
15                 rtr = 0x07f00000;
16         } else {
17                 /*
18                  * default: 100 MHz SDRAM
19                  */
20                 sdtr1 = 0x0086400d;
21                 rtr = 0x05f00000;
22         }
23
24         for (i=0; i<N_MB0CF; i++) {
25                 /*
26                  * Disable memory controller.
27                  */
28                 mtsdram0(mem_mcopt1, 0x00000000);
29
30                 /*
31                  * Set MB0CF for bank 0.
32                  */
33                 mtsdram0(mem_mb0cf, mb0cf[i].reg);
34                 mtsdram0(mem_sdtr1, sdtr1);
35                 mtsdram0(mem_rtr, rtr);
36
37                 udelay(200);
38
39                 /*
40                  * Set memory controller options reg, MCOPT1.
41                  * Set DC_EN to ‘1’ and BRD_PRF to ‘01’ for 16 byte PLB Burst
42                  * read/prefetch.
43                  */
44                 mtsdram0(mem_mcopt1, 0x80800000);
45
46                 udelay(10000);
47
48                 if (get_ram_size(0, mb0cf[i].size) == mb0cf[i].size) {
49                         /*
50                          * OK, size detected -> all done
51                          */
52                         return;
53                 }
54         }
55 }
```

Thao tác đầu tiên đọc pin strapping trên processor 405GP để xác định giá trị thiết kế của SDRAM clock. Trong trường hợp này, chúng ta có thể thấy hai giá trị được hỗ trợ: 100MHz và 133MHz. Dựa trên lựa chọn đó, các constant được chọn để sử dụng ở phần sau của function khi đặt các register bit thích hợp trong SDRAM controller.

Bắt đầu từ dòng 24, một loop được dùng để đặt parameter cho từng kích thước trong tối đa năm kích thước memory được định nghĩa trước. Hiện tại, U-Boot có logic hỗ trợ một memory bank duy nhất với kích thước 4MB, 16MB, 32MB, 64MB hoặc 128MB. Các kích thước này được định nghĩa trong table có tên `mb0cf` tại `.../cpu/ppc4xx/sdram.c`. Table liên kết một constant với từng kích thước memory dựa trên giá trị cần thiết trong memory bank configuration register của 405GP. Loop thực hiện những việc sau:

```
for (i = each possible memory bank size, largest first) {
    select timing constant based on SDRAM clock speed;
    disable SDRAM memory controller;
    configure bank 0 with size[i], timing constants[i]
    re-enable SDRAM memory controller;

    run simple memory test to dynamically determine size;
      /* This is done using get_ram_size() */
    if ( tested size == configured size )
        done;
}
```

Logic đơn giản này điền các timing constant chính xác vào SDRAM controller dựa trên SDRAM clock speed và kích thước memory bank đã cấu hình từ table hard-coded trong U-Boot. Với phần giải thích này, bạn có thể dễ dàng đối chiếu các bank configuration value bằng reference manual của 405GP. Với DRAM có kích thước 64MB, memory bank control register được đặt như sau:

```
Memory Bank 0 Control Register = 0x000a4001
```

PowerPC 405GP User’s Manual mô tả field Bảng D-2 cho memory bank 0 control register.

BẢNG D-2 Các field Memory Bank 0-3 Configuration Register của 405GP

| Field | Value | Giải thích |
|---|---|---|
| Bank Address (BA) | 0x00 | Starting memory address bank này. |
| Size (SZ) | 0x4 | Kích thước memory bank—ở đây 64MB. |
| Addressing Mode (AM) | 0x2 | Xác định cách tổ chức memory, bao gồm số row bit và column bit. Trong trường hợp này, Mode 2 tương ứng với 12 row address bit, 9 hoặc 10 column address bit và tối đa bốn SDRAM bank nội bộ. Dữ liệu này được cung cấp trong một bảng của 405GP User’s Manual. |
| Bank Enable (BE) | 0x1 | Enable bit cho bank register cấu hình. 405GP có bốn memory bank configuration register. |

Designer phải xác định value trong bảng dựa memory module dùng

trên board.

Hãy xem một ví dụ về timing để tìm hiểu chi tiết hơn các timing requirement của SDRAM controller điển hình. Giả sử SDRAM clock speed là 100MHz và kích thước memory là 64MB, các timing constant được function `sdram_init()` trong Listing D-1 lựa chọn như sau:

```
SDRAM Timing Register          = 0x0086400d
Refresh Timing Register        = 0x05f00000
```

PowerPC 405GP User’s Manual mô tả field Bảng D-3 cho SDRAM Timing Register.

BẢNG D-3 Các field SDRAM Timing Register của 405GP

| Field | Value | Giải thích |
|---|---|---|
| CAS Latency (CASL) | 0x1 | SDRAM CAS latency. Giá trị này được lấy trực tiếp từ thông số kỹ thuật của SDRAM chip. Đây là độ trễ tính theo clock cycle mà chip yêu cầu, kể từ khi lệnh `read` được phát (CAS signal) cho đến khi dữ liệu có trên data bus. Trong trường hợp này, 0x1 biểu thị hai clock cycle, theo 405GP User’s Manual. |
| Precharge Command to Next Activate (PTA) | 0x1 | Lệnh SDRAM Precharge vô hiệu hóa một row nhất định. Ngược lại, lệnh Activate kích hoạt một row nhất định để truy cập sau đó, chẳng hạn trong một burst cycle. Timing parameter này bảo đảm khoảng thời gian tối thiểu giữa Precharge và Activate cycle tiếp theo; khoảng thời gian đó do SDRAM chip quy định. Giá trị chính xác phải được lấy từ thông số kỹ thuật của SDRAM chip. Trong trường hợp này, 0x1 biểu thị hai clock cycle, được xác định từ 405GP User’s Manual. |
| Read/Write to Precharge Command Minimum (CTP) | 0x2 | Timing parameter này bảo đảm độ trễ tối thiểu giữa một lệnh SDRAM read hoặc write và lệnh Precharge tiếp theo. Giá trị chính xác phải được lấy từ thông số kỹ thuật của SDRAM chip. Trong trường hợp này, 0x2 biểu thị ba clock cycle, được xác định từ 405GP User’s Manual. |
| SDRAM Command Leadoff (LDF) | 0x1 | Timing parameter này bảo đảm độ trễ tối thiểu từ khi phát address cycle hoặc command cycle đến bank select cycle. Giá trị chính xác phải được lấy từ thông số kỹ thuật của SDRAM chip. Trong trường hợp này, 0x1 biểu thị hai clock cycle, được xác định từ 405GP User’s Manual. |

Timing parameter cuối cùng được cấu hình bởi ví dụ U-Boot trong Listing D-1 là giá trị refresh timing register. Register này yêu cầu một field duy nhất xác định refresh interval do SDRAM controller thực hiện. Field biểu diễn interval được xử lý như một counter đơn giản chạy ở SDRAM clock frequency. Trong ví dụ ở đây, chúng ta giả sử SDRAM clock frequency là 100MHz. Giá trị được lập trình vào register trong ví dụ là `0x05f0_0000`. Từ PowerPC 405GP User’s Manual, chúng ta xác định giá trị này sẽ tạo ra một refresh request mỗi 15,2 microsecond. Cũng như các timing parameter khác, giá trị này được quyết định bởi thông số kỹ thuật của SDRAM chip.

Một SDRAM chip điển hình cần một refresh cycle cho mỗi row. Mỗi row phải được refresh trong khoảng thời gian tối thiểu do nhà sản xuất quy định. Với chip được tham chiếu ở mục cuối phụ lục, nhà sản xuất quy định 8.192 row phải được refresh sau mỗi 64 millisecond. Điều này đòi hỏi tạo một refresh cycle mỗi 7,8 microsecond để đáp ứng thông số kỹ thuật của device cụ thể đó.

## D.4 Tổng kết

SDRAM device rất phức tạp. Phụ lục này trình bày một ví dụ đơn giản để giúp bạn tìm hiểu những điểm phức tạp khi thiết lập SDRAM controller. Các SDRAM controller thực hiện một chức năng thiết yếu và phải được thiết lập chính xác. Không gì thay thế được việc đi sâu vào một specification và hiểu kỹ thông tin được trình bày. Hai tài liệu mẫu được tham chiếu trong phụ lục là những điểm khởi đầu rất tốt.

### D.4.1 Gợi ý đọc thêm

AMCC 405GP Embedded Processor User’s Manual AMCC Corporation www.amcc.com/Embedded/

Micron Technology, Inc. Synchronous DRAM MT48LC64M4A2 Data Sheet http://download.micron.com/pdf/datasheets/dram/sdram/256MSDRAM.pdf
