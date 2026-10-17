# CHƯƠNG 11: GIAO TIẾP DỮ LIỆU VÀO/RA BẰNG GPIO, DDR VÀ SERDES (GETTING DATA IN AND OUT WITH I/O AND SERDES)

## 1. Giới Thiệu Về Chân Vào/Ra Trên FPGA (Introduction to FPGA I/O)

Cho đến thời điểm này, bạn đã học cách xử lý logic bên trong chip FPGA — từ các cổng logic cơ bản, bảng tra LUT, Flip-flop, thanh ghi dịch, máy trạng thái, cho đến các phép toán số học phức tạp. Đó cũng là phần lớn công việc thiết kế FPGA. Nhưng chuyện gì xảy ra ở **rìa chip**, nơi dữ liệu đi vào và đi ra?

Tác giả nói thẳng từ kinh nghiệm: đưa dữ liệu vào ra FPGA phức tạp đến bất ngờ, và **phần lớn những lỗi khó nhất** nằm ở đây. Đây cũng là ranh giới giữa "người phần mềm" và "người phần cứng": bạn phải hiểu tín hiệu điện mình đang nối vào — điện áp bao nhiêu, đơn cực hay vi sai, làm sao gửi dữ liệu ở tốc độ gigabit — để cấu hình chân đúng. Không có nền điện tử cũng học được những điều cơ bản ở chương này.

Mỗi chip FPGA được bao quanh bởi hàng chục đến hàng nghìn chân cắm vật lý (**Physical Pins**). Các chân này được kết nối với các khối logic chuyên dụng gọi là **Khối Vào/Ra (Input/Output Blocks - IOB)** hoặc **I/O Cell** nằm ở phần rìa ngoài cùng của silicon.

```
┌───────────────────────────────────────────────────────────────────────┐
│                             CHIP FPGA                                 │
│   ┌───────┐   ┌───────┐   ┌───────┐   ┌───────┐   ┌───────┐           │
│   │ I/O   │   │ I/O   │   │ I/O   │   │ I/O   │   │ I/O   │   <─── chân I/O vật lý
│   │ Cell  │   │ Cell  │   │ Cell  │   │ Cell  │   │ Cell  │        ở rìa chip
│   └───┬───┘   └───┬───┘   └───┬───┘   └───┬───┘   └───┬───┘           │
│       │           │           │           │           │               │
│   ┌───┴───────────┴───────────┴───────────┴───────────┴───┐           │
│   │             Mạng lưới đi tuyến nội bộ                 │           │
│   │             (Internal Interconnect)                   │           │
│   └───┬───────────┬───────────┬───────────┬───────────┬───┘           │
│       │           │           │           │           │               │
│   ┌───┴───┐   ┌───┴───┐   ┌───┴───┐   ┌───┴───┐   ┌───┴───┐           │
│   │ LUT / │   │  DSP  │   │ Block │   │ LUT / │   │  PLL  │   <─── lõi logic
│   │  FF   │   │ Block │   │  RAM  │   │  FF   │   │       │        bên trong
│   └───────┘   └───────┘   └───────┘   └───────┘   └───────┘           │
└───────────────────────────────────────────────────────────────────────┘
```

Chương này đi qua chân GPIO và đệm I/O, chân hai chiều, các đặc tính điện của chân (điện áp, dòng, slew, vi sai), kỹ thuật DDR, rồi tới **SerDes** — thứ cho phép FPGA nuốt dữ liệu ở tốc độ gigabit.

---

## 2. Chân Vào/Ra Đa Năng (General Purpose I/O - GPIO)

Hầu hết chân của FPGA là **GPIO (General Purpose Input/Output)**: dùng được làm đầu vào số hoặc đầu ra số. Các dự án trong sách đã dùng chúng cho nút bấm và LED mà chưa hỏi chúng hoạt động ra sao. Tác giả kể lúc mới vào nghề không ngờ chân I/O có nhiều "núm vặn" đến thế; với thiết kế tốc độ cao, toàn vẹn tín hiệu bắt đầu từ chính cái chân.

### A. Đệm I/O (I/O Buffers)

Chân nối vào FPGA qua **đệm (buffer)** — phần tử mạch cách ly đầu vào với đầu ra. Nhờ đệm mà một chân cấu hình được thành vào hoặc ra, thậm chí đổi chiều ngay khi FPGA đang chạy. Sơ đồ rút gọn của sách (Hình 11-1, trên FPGA Intel):

```
              ┌──────────┐                    ┌───────────────────────────┐
              │          │   đường ra         │   đệm (buffer)            │
              │          │───────────────────>│──>│▷│──┐                  │      ┌───┐
              │   GPIO   │   OE               │   đệm ra│                  │──────│ X │ chân vật lý
              │  (logic  │───────────────────>│ bật/tắt │                  │      └───┘
              │  bên     │   đường vào        │         │                  │
              │  trong)  │<───────────────────│<──│◁│──┘                  │
              │          │                    │   đệm vào                 │
              └──────────┘                    └───────────────────────────┘
```
*Hình 11-1: GPIO rút gọn — hai tam giác là đệm ra (chỉ sang phải) và đệm vào (chỉ sang trái); `OE` bật tắt đệm ra*

Đường quan trọng nhất là **OE (output enable)**. `OE = 1`: đệm ra lái chân theo dữ liệu trên đường ra. `OE = 0`: đệm ra ngắt, đầu ra của nó thành **trở kháng cao** (high-impedance, hi-Z, tri-state) — gần như không nhận dòng, không ảnh hưởng gì tới chân; chân do tín hiệu bên ngoài quyết định, và đệm vào đọc nó đưa vào trong. Bảng chân lý của đệm ra:

| Đầu vào đệm | OE | Đầu ra đệm |
| :---: | :---: | :---: |
| 0 | 0 | Z |
| 1 | 0 | Z |
| 0 | 1 | 0 |
| 1 | 1 | 1 |

*Bảng 11-1: Bảng chân lý đệm ra — `OE = 0` thì ra `Z` bất kể đầu vào*

Trong các dự án của sách, cổng khai `in`/`out` (VHDL) hay `input`/`output` (Verilog) ở cấp cao nhất; công cụ tổng hợp nhìn chiều của từng tín hiệu mà đặt `OE` cố định 0 hoặc 1, rồi Place and Route gán tín hiệu vào chân theo file ràng buộc. Đó là cách GPIO thành chân vào hoặc chân ra riêng.

Bổ sung ngoài sách: trong I/O cell thật còn có flip-flop đặt sát chân (ILOGIC/OLOGIC trên Xilinx 7-series) để chốt dữ liệu ngay tại rìa, giảm trễ đường đi vào lõi; và điện trở kéo lên/kéo xuống nội bộ cho chân để trống — chương 4 đã gặp khi bàn nút bấm QMTech kéo lên. Cả hai đều bật bằng file ràng buộc.

### B. Chân Hai Chiều Cho Giao Tiếp Bán Song Công (Bidirectional, Half-Duplex)

Phần lớn chân cố định một chiều, nhưng GPIO có thể là **hai chiều**: muốn phát thì kéo `OE` lên và đặt dữ liệu lên đường ra; muốn nhận thì kéo `OE` xuống, đệm ra về tri-state và FPGA "lắng nghe" chân. Chân như vậy là một **bộ thu phát (transceiver)**.

Chân hai chiều dùng cho **bán song công (half-duplex)**: hai thiết bị dùng chung một đường dây, ai cũng phát được nhưng **mỗi lúc chỉ một bên**, bên kia nghe. Ngược lại **song công (full-duplex)** cần hai đường dây, mỗi chiều một đường, hai bên phát cùng lúc. Hình ảnh quen thuộc là bộ đàm: chỉ nói được khi giữ nút, và phải nói "Over" để báo tới lượt người kia. Trên dây điện, hai bên không chia lượt thì **va chạm dữ liệu** và cả hai nhận rác; vì vậy cần **giao thức** — ai được mở đầu, lúc nào bên kia được trả lời, có khi còn phát hiện va chạm và gửi lại. Bán song công phức tạp hơn nhưng rất phổ biến: **I²C** (inter-integrated circuit) là giao thức bán song công dùng ở vô số chip — ADC, DAC, gia tốc kế, cảm biến nhiệt, vi điều khiển — vì đơn giản và chỉ cần **hai chân**: xung nhịp và dữ liệu (nên còn gọi là TWI, two-wire interface).

### C. Lập Trình Chân Hai Chiều Trong Verilog Và VHDL

Sách chỉ cho hai dòng cốt lõi; dưới đây là module đầy đủ theo đúng mẫu đó, đã chạy qua GHDL:

#### Mã nguồn Verilog:
```verilog
module IO_Bidirectional (
  input      i_Clk,
  input      i_Enable_Output, // 1 = phát (output), 0 = nhận (input, chân về Z)
  input      i_Data_To_Write, // dữ liệu muốn đẩy ra
  output reg o_Data_Read,     // dữ liệu đọc được từ chân
  inout      io_SDA           // chân vật lý hai chiều
);

  // Enable = 1: lái io_SDA bằng dữ liệu; Enable = 0: thả chân (Z)
  assign io_SDA = (i_Enable_Output) ? i_Data_To_Write : 1'bz;

  // Luôn đọc trạng thái thật trên chân
  always @(posedge i_Clk)
  begin
    o_Data_Read <= io_SDA;
  end

endmodule
```

#### Mã nguồn VHDL:
```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity IO_Bidirectional is
  port (
    i_Clk           : in    std_logic;
    i_Enable_Output : in    std_logic;
    i_Data_To_Write : in    std_logic;
    o_Data_Read     : out   std_logic;
    io_SDA          : inout std_logic
  );
end entity IO_Bidirectional;

architecture RTL of IO_Bidirectional is
begin

  -- Đệm 3 trạng thái cho chân hai chiều io_SDA
  io_SDA <= i_Data_To_Write when i_Enable_Output = '1' else 'Z';

  -- Đọc dữ liệu từ chân io_SDA đồng bộ theo Clock
  process(i_Clk)
  begin
    if rising_edge(i_Clk) then
      o_Data_Read <= io_SDA;
    end if;
  end process;

end architecture RTL;
```

Chân khai bằng từ khoá **`inout`**; nó phải được gán vào một chân vật lý trong file ràng buộc. Phía nhận chỉ là một phép gán đọc từ chân. Phía phát dùng toán tử ba ngôi (Verilog) hay `when … else` (VHDL): lái dữ liệu ra khi `enable = 1`, không thì lái **`'Z'`**. Mẫu này rất phổ biến; công cụ tổng hợp nhận ra ngay và suy ra một đệm I/O có `OE`.

Sách lưu ý một điều dễ quên: **dữ liệu bạn phát ra cũng bị bạn nhận vào**, vì đường đọc nối thẳng vào chân — FPGA "nghe chính mình nói". Phía nhận phải bỏ qua chân khi `enable = 1`. Mô phỏng GHDL với một "thiết bị ngoài" lái cùng dây xác nhận cả bốn tình huống:

```text
FPGA phát tx=1: pin='1' rx='1'   (rx nghe chính mình)
FPGA phát tx=0: pin='0' rx='0'
en=0, ngoài không lái: pin='Z'
ngoài lái 1: pin='1' rx='1'      ngoài lái 0: pin='0' rx='0'
XUNG ĐỘT, cả hai cùng lái: pin='X'
```

Dòng cuối là va chạm dữ liệu nói ở trên, hiện ra trong mô phỏng thành `'X'` — chương 5 đã nói `'X'` nghĩa là hai nguồn lái một dây. Trên bo thật, đó là hai chân đẩy ngược nhau, nóng chip.

### D. Quy Tắc Về Tri-State Trong FPGA Hiện Đại

Điều này sách không nói nhưng cần biết: đệm ba trạng thái **chỉ tồn tại ở chân I/O vật lý**. Bên trong lõi FPGA hiện đại (AMD, Intel, Lattice) không còn bus ba trạng thái nội bộ; gán `'Z'` cho một tín hiệu nội bộ thì công cụ tổng hợp chuyển thành **mux** (Vivado báo rõ trong log). Nên chỉ dùng `'Z'` cho cổng `inout` ở cấp cao nhất.

---

## 3. Đặc Tính Điện Của Chân (Electrical Characteristics)

Mỗi chân GPIO có nhiều thông số điện đặt riêng được. Sách nói ba thứ — điện áp hoạt động, cường độ lái, tốc độ chuyển mức — rồi đến vi sai. Ngoài ra còn open-drain, kéo lên/kéo xuống, điện trở đầu cuối… Tài liệu phải tra là **I/O user guide** của dòng chip (với 7-series là UG471).

### A. Điện Áp Hoạt Động Và Bank (Operating Voltage, VCCIO)

Điện áp hoạt động quy định chân lái mức 1 ở bao nhiêu volt, và nhận mức 1 ở bao nhiêu volt. Phổ biến nhất: 0 V là 0, **3,3 V** là 1 — chuẩn **LVCMOS33** (low-voltage CMOS). Chuẩn cũ **TTL** dùng 5 V cho mức 1, ngày nay ít gặp trên FPGA vì nhiều chip không chịu được 5 V. Còn **LVCMOS25** dùng 2,5 V, **LVCMOS18** 1,8 V… Một FPGA điển hình hỗ trợ khoảng **một tá** chuẩn đơn cực (single-ended — tín hiệu so với đất) như vậy, và chừng ấy chuẩn vi sai.

Các chân gom thành **bank**, mỗi bank có một điện áp cấp chung gọi là **VCCIO** (Xilinx gọi VCCO). Chip có thể có tám bank, bank 1 chạy 1,8 V, bank 2 chạy 3,3 V, bank 3 chạy 2,5 V — nhưng **mọi chân trong một bank phải cùng điện áp**: không đặt LVCMOS33 cạnh LVCMOS25 trong cùng bank được, vì một cái cần VCCIO 3,3 V, cái kia 2,5 V. Khi soát sơ đồ mạch, luôn kiểm từng bank; trộn thì công cụ Place and Route báo lỗi hoặc cảnh báo rất gắt. Trên QMTech, chân xung nhịp, nút và LED đều khai `LVCMOS33` trong `.xdc` (chương 4) vì bank đó nối 3,3 V.

> **Cảnh báo phần cứng:** nối tín hiệu 5 V (TTL, nhiều board Arduino) thẳng vào chân FPGA 3,3 V không qua mạch chuyển mức là vượt điện áp tối đa của chân, có thể hỏng chân hoặc cả chip. Con số chính xác cho 7-series nằm trong DS181 (mục absolute maximum), đã ghi vào danh sách cần kiểm.

### B. Cường Độ Lái (Drive Strength)

Cường độ lái là dòng tối đa (mA) chân có thể hút vào hoặc đẩy ra; đặt 8 mA thì chân chịu được 8 mA mỗi chiều. Đặt riêng từng chân, đủ cho mạch nối vào. Phần lớn trường hợp **để mặc định**, chỉ chỉnh khi cần dòng lớn.

### C. Tốc Độ Chuyển Mức (Slew Rate)

Slew rate là tốc độ cho phép tín hiệu ra đổi từ 0 lên 1 hay ngược lại, thường đặt định tính: nhanh, vừa, chậm. Cũng **để mặc định**, trừ khi giao tiếp với linh kiện cần tốc độ dữ liệu rất cao thì chọn nhanh nhất — nhưng slew nhanh tăng nhiễu cho cả hệ thống, không cần thì đừng.

### D. Tín Hiệu Vi Sai (Differential Signaling)

Tín hiệu **vi sai** gửi dữ liệu bằng **hai dây so với nhau**, không so với đất; **đơn cực** là một dây so với đất:

```
Đơn cực (LVCMOS):
   thiết bị 1 ──── dữ liệu (0 V / 3,3 V) ────> thiết bị 2
   thiết bị 1 ──── đất chung ──────────────── thiết bị 2      ← không mang dữ liệu, chỉ để cùng mốc

Vi sai (LVDS):
   thiết bị 1 ○─── dây + ────────────────────> ┐
                                                │ bên nhận đọc HIỆU (+) − (−):
   thiết bị 1 ──── dây − ────────────────────> ┘ dương hơn ngưỡng = 1, âm hơn ngưỡng = 0
   (không cần dây đất chung)
```
*Hình 11-3: Đơn cực và vi sai; vòng tròn nhỏ ở đầu dây + là ký hiệu cặp vi sai, giống bong bóng của cổng NOT ở chương 3*

Ở đơn cực, dây đất không mang dữ liệu nhưng cần để hai bên cùng mốc; thêm đường dữ liệu chỉ cần thêm một dây, dùng chung đất. Ở vi sai, bên nhận so hiệu điện áp hai dây: dương hơn một ngưỡng là 1, âm hơn ngưỡng là 0. Chuẩn **LVDS** (TIA/EIA-644) quy định hiệu khoảng **±350 mV** — thấp hơn nhiều so với đơn cực, nên **tốn ít điện** hơn.

Giá phải trả: **gấp đôi dây**. 10 đường dữ liệu đơn cực cần 10 dây (cộng ít nhất 1 dây đất); vi sai cần 20 dây (không cần đất) — tốn tiền, đầu nối to hơn. Đổi lại ba lợi thế:

1. **Chống nhiễu điện từ (EMI).** Dây là ăng-ten nhỏ hứng đủ thứ — lò vi sóng, điện thoại, đường điện — thành gai điện áp trên dây. Với đơn cực, gai đủ lớn làm 0 thành 1. Với vi sai, gai đập lên **cả hai dây như nhau**, hiệu không đổi — nhiễu tự triệt.
2. **Không cần chung mốc đất.** Đất không phải lúc nào cũng đúng 0 V, và hai thiết bị xa nhau rất khó giữ chung mốc; có hệ thống còn nổi, cách ly hẳn với đất. Vì thế vi sai dùng cho khoảng cách xa: **RS-485** truyền 10 Mb/s được gần **1 dặm**, đơn cực không thể.
3. **Nhanh hơn.** Chuyển từ 0 lên 1 phải kéo dây qua cả biên độ điện áp, mất thời gian (slew); biên độ càng lớn càng cần nhiều dòng, càng chậm. LVCMOS33 vung 3,3 V, LVDS chỉ ±350 mV — nên gần như mọi ứng dụng tốc độ cao (USB, SATA, Ethernet) đều vi sai. Mục SerDes nói tiếp.

Bổ sung ngoài sách: đường vi sai tốc độ cao cần **điện trở đầu cuối 100 Ω** giữa hai dây ở bên nhận để tín hiệu không phản xạ ngược; FPGA hiện đại có sẵn điện trở này trong chip, Xilinx bật bằng thuộc tính `DIFF_TERM` trong `.xdc`. Con số và thuộc tính nằm trong danh sách cần kiểm.

### E. Đặt Các Thông Số Này Ở Đâu (How to Modify Pin Settings)

Tất cả nằm trong **file ràng buộc vật lý** — chính file gán tín hiệu vào chân. Ví dụ của sách với Lattice:

```text
LOCATE COMP "o_Data" SITE "A13";
IOBUF PORT "o_Data" IO_TYPE=LVCMOS33 DRIVE=8 SLEWRATE=FAST;
```

Dòng đầu gán `o_Data` vào chân A13; dòng sau đặt chuẩn LVCMOS33, dòng lái 8 mA, slew nhanh. Cú pháp mỗi hãng mỗi khác — tra *constraints user guide* của chip, hoặc đặt bằng GUI. Với Vivado, cùng ý đó là các thuộc tính trên cổng trong `.xdc`:

```tcl
set_property PACKAGE_PIN E6       [get_ports o_led]
set_property IOSTANDARD  LVCMOS33 [get_ports o_led]
set_property DRIVE       8        [get_ports o_led]
set_property SLEW        FAST     [get_ports o_led]
```

Hai dòng đầu chương 4 đã dùng; hai dòng sau chưa thử trên máy, trong danh sách cần kiểm.

---

## 4. Truyền Nhanh Hơn Với DDR (Faster Data Transmission with Double Data Rate)

Từ đầu sách tới giờ, tín hiệu đồng bộ theo **cạnh lên** xung nhịp. Với **DDR (double data rate)**, dữ liệu đổi ở **cả cạnh lên lẫn cạnh xuống** — cùng tần số xung nhịp, gửi được gấp đôi dữ liệu:

```
Time (ns)  0         20        40        60        
           |         |         |         |    
                ┌────┐    ┌────┐    ┌────┐    
clk        ─────┘    └────┘    └────┘    └────
SDR             D0        D1        D2        
DDR             D0   D1   D2   D3   D4   D5   
```
*Hình 11-4: SDR gửi 3 bit (D0–D2) trong 3 chu kỳ; DDR gửi 6 bit (D0–D5) — mô phỏng GHDL, mỗi ký tự 2 ns*

Kỹ thuật này nổi tiếng nhờ bộ nhớ **LPDDR** (low-power double data rate) trong máy tính và điện thoại: đổi dữ liệu ở hai cạnh tức là tăng gấp đôi băng thông.

Muốn dùng DDR ở chân ra thì cần đệm **ODDR**. Chi tiết tuỳ hãng, nhưng tác giả khuyên **instantiate thẳng trong mã** vì cấu hình không phức tạp. Mẫu của AMD (sách lấy từ Virtex-7 Library Guide; cùng primitive `ODDR` có trên mọi 7-series, kể cả Artix-7 của QMTech):

#### Verilog:
```verilog
ODDR #(
  .DDR_CLK_EDGE("OPPOSITE_EDGE"),
  .INIT(1'b0),      // giá trị đầu của Q
  .SRTYPE("SYNC")   // reset đồng bộ hay bất đồng bộ
) ODDR_inst (
  .Q(Q),     // đầu ra DDR, nối ra chân
  .C(C),     // xung nhịp
  .CE(CE),   // clock enable
  .D1(D1),   // dữ liệu ra ở cạnh lên
  .D2(D2),   // dữ liệu ra ở cạnh xuống
  .R(R),     // reset
  .S(S)      // set
);
```

#### VHDL:
```vhdl
ODDR_inst : ODDR
  generic map (
    DDR_CLK_EDGE => "OPPOSITE_EDGE",
    INIT         => '0',      -- giá trị đầu của Q
    SRTYPE       => "SYNC")   -- reset đồng bộ hay bất đồng bộ
  port map (
    Q  => Q,    -- đầu ra DDR, nối ra chân
    C  => C,    -- xung nhịp
    CE => CE,   -- clock enable
    D1 => D1,   -- dữ liệu ra ở cạnh lên
    D2 => D2,   -- dữ liệu ra ở cạnh xuống
    R  => R,    -- reset
    S  => S);   -- set
```

Không cần hiểu từng dòng; quan trọng nhất là `Q` nối ra chân, và hai đầu vào `D1`, `D2` thay phiên: `D1` ra ở cạnh lên, `D2` ở cạnh xuống. Hình 11-4 ở trên chính là mô hình hành vi của việc đó (GHDL không có thư viện `unisim` của Xilinx nên không chạy được primitive thật; mô phỏng dùng một process cập nhật ở cả `rising_edge` lẫn `falling_edge`). DDR tăng tốc được một bậc; muốn bay thật thì cần **SerDes**.

---

## 5. SerDes (Serializer / Deserializer)

**SerDes** là primitive có trên *một số* FPGA, chuyên đưa dữ liệu vào ra ở tốc độ **gigabit mỗi giây**. Ý tưởng: lấy luồng dữ liệu song song, đổi thành nối tiếp để truyền nhanh; bên nhận đổi lại thành song song. Nghe ngược đời — gửi từng bit lại nhanh hơn gửi nhiều bit cùng lúc — nhưng đó là phép màu của SerDes, giải thích ở dưới. SerDes thường gọi là **bộ thu phát (transceiver)** vì vừa gửi vừa nhận, và gần như luôn **song công**: một đường phát ra, một đường nhận vào, không đổi chiều như chân hai chiều ở trên.

Đây là tính năng khiến FPGA hợp với những việc nuốt dữ liệu khổng lồ. Camera 1.920 × 1.080, 32 bit mỗi điểm ảnh, 60 khung hình/giây: nhân ra `1.920 × 1.080 × 32 × 60 ≈ 3,98 Gb/s` dữ liệu thô chưa nén — và có camera 4K 120 Hz còn hơn. Hay mạng: gói Ethernet hàng trăm gigabit, nhiều SerDes cùng chạy để định tuyến. Chân I/O thường không thể làm vậy.

### A. Song Song Và Nối Tiếp (Parallel vs. Serial)

**Song song** là nhiều kênh (dây), dữ liệu chia ra các kênh; **nối tiếp** là một kênh, từng bit một:

```
Song song đồng bộ 8 bit — gửi 0x63 = 01100011 trong MỘT chu kỳ:

  thiết bị 1 ── clk ──────────────> thiết bị 2
             ── D7 = 0 ──────────>
             ── D6 = 1 ──────────>
             ── D5 = 1 ──────────>
             ── D4 = 0 ──────────>
             ── D3 = 0 ──────────>
             ── D2 = 0 ──────────>
             ── D1 = 1 ──────────>
             ── D0 = 1 ──────────>

Nối tiếp đồng bộ — cùng 0x63 trong TÁM chu kỳ, một dây:

  thiết bị 1 ── clk ──────────────> thiết bị 2
             ── data: 0 1 1 0 0 0 1 1 ──>   (một bit mỗi chu kỳ)
```
*Hình 11-5: Giao diện song song và nối tiếp; "đồng bộ" nghĩa là có dây xung nhịp đi kèm dữ liệu*

Song song gửi cả byte một chu kỳ, nối tiếp mất tám — vậy song song phải luôn nhanh hơn? Thực tế song song **đụng trần vật lý** khi băng thông tăng, nên ngày nay hiếm. Ai từng dùng cổng máy in LPT hay khe **PCI** đời đầu thì đó là song song, và cả hai đều đã biến mất. Lịch sử PCI cho thấy vì sao: PCI đầu chạy **33 MHz × 32 bit = 1.056 Mb/s = 132 MB/s**, đủ cho thập niên 1990. Cần hơn thì nhân đôi xung nhịp lên 66 MHz → 264 MB/s; chưa đủ, nhân đôi độ rộng lên 64 bit → 528 MB/s. Rồi hết đường: muốn 128 bit thì đầu nối dài cả gang tay, đi dây trên mạch in thành ác mộng; muốn tăng xung nhịp thì vướng **lệch xung nhịp (clock skew)** — một dây clock phải tới 128 flip-flop ở bên nhận, chương 7 đã nói tín hiệu không đi tức thời, nên clock tới flip-flop bit 0 và bit 127 ở hai thời điểm khác nhau; tần số càng cao, lệch đó càng đủ gây metastable.

Gốc rễ là phải gửi **một dây xung nhịp riêng** bên cạnh dữ liệu. Giải pháp: nhét xung nhịp vào trong dữ liệu, gửi **nối tiếp** thành một tín hiệu duy nhất.

### B. Tín Hiệu Tự Xung Nhịp Và Mã Manchester (Self-Clocking Signals)

Gộp xung nhịp và dữ liệu làm một gọi là **tín hiệu tự xung nhịp** (nhúng clock vào data). Clock tới đúng lúc data tới — chúng là một — nên không còn lệch, và tần số tăng được rất nhiều. Có nhiều **cách mã hoá** để làm việc này: Manchester, HDLC, 8B/10B… Sách lấy **mã Manchester** vì đơn giản nhất: **XOR xung nhịp với dữ liệu**.

```
Time (ns)  0         20        40        60        80        100       120       
           |         |         |         |         |         |         |     
                ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌
clk        ─────┘    └────┘    └────┘    └────┘    └────┘    └────┘    └────┘
                          ┌───────────────────┐                   ┌──────────
data       ───────────────┘                   └───────────────────┘          
                ┌────┐         ┌────┐    ┌─────────┐    ┌────┐         ┌────┐
manchester ─────┘    └─────────┘    └────┘         └────┘    └─────────┘    └
```
*Hình 11-6: Mã Manchester = `data xor clk` — mô phỏng GHDL với dữ liệu 0,1,1,0,0,1; mỗi ký tự 2 ns*

Trong mỗi chu kỳ, data là 0 hoặc 1, còn clk cao nửa đầu rồi thấp nửa sau; tín hiệu Manchester vì thế **luôn đổi mức giữa chu kỳ**: data 0 → cao rồi thấp, data 1 → thấp rồi cao. Bảng chân lý chính là XOR hai đầu vào:

| Data | Clock | Manchester |
| :---: | :---: | :---: |
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

*Bảng 11-2: XOR — ra 1 khi đúng một đầu vào là 1*

Bên nhận tách clock ra khỏi data bằng một XOR và chút logic — gọi là **khôi phục xung nhịp (clock data recovery, CDR)** — rồi dùng clock vừa tách làm xung nhịp cho flip-flop chốt data vừa tách: đồng bộ hoàn hảo, không còn lệch, tốc độ đẩy lên xa hơn song song nhiều.

Manchester không dùng cho SerDes hiện đại, nhưng nó có hai tính chất mà mọi mã hoá SerDes đều phải có. Một, **luôn có chuyển mức mỗi chu kỳ** kể cả khi dữ liệu toàn 0 — bên nhận cần chuyển mức để khoá vào luồng, không thì không biết dữ liệu đang chạy 3 Gb/s hay 1,5 Gb/s hay đứng im. Hai, **cân bằng DC**: số lần cao bằng số lần thấp. Dây thật có điện dung, điện cảm, điện trở; ở gigabit, dây bị "sạc" lên như tụ nếu cao quá lâu, kéo xuống tốn năng lượng hơn — nên phải giữ cân bằng.

### C. Cách SerDes Hoạt Động (How SerDes Works)

```
 BÊN PHÁT (serializer)                                        BÊN NHẬN (deserializer)
 ┌──────────────────────────────────┐                        ┌──────────────────────────────────┐
 │ data in ══>┌────────────────┐    │    kênh truyền         │    ┌──────┐   ┌────────────────┐ │
 │ (song song)│ hoá nối tiếp + │───>│ tầng ra  ──────────────>│ tầng vào ─┬──>│ CDR  │──>│ nối tiếp → song│══> data out
 │            │ mã hoá (8B/10B)│    │ (đệm vi sai, │ đồng, cáp│   (điều   │   │ tách │   │ song + giải mã │ │ (song song)
 │ clk in ──>┌┴────┐           │    │  chỉnh tín   │ quang    │   chỉnh)  └──>│ clock│   │                │──> clk out
 │           │ PLL │───────────┘    │  hiệu)       │          │               └──────┘   └────────────────┘ │
 │           └─────┘                │              │          │                                              │
 └──────────────────────────────────┘              │          └──────────────────────────────────────────────┘
```
*Hình 11-7: Sơ đồ khối SerDes rút gọn — PLL tạo xung nhịp tốc độ cao, hoá nối tiếp và mã hoá, tầng ra vi sai, kênh, tầng vào, CDR tách clock rồi dùng chính clock đó chốt dữ liệu*

Đọc từ trái sang. **PLL** riêng của bộ thu phát lấy xung nhịp tham chiếu `clk in` tạo ra xung nhịp chạy bộ hoá nối tiếp — nó quyết định tốc độ SerDes. Dữ liệu vào **song song** (sách vẽ 4 dây, thực tế bao nhiêu cũng được); bộ hoá nối tiếp **mã hoá** rồi đẩy ra luồng nối tiếp: 4 bit ở 250 MHz thành **1 Gb/s**. Mã 8B/10B đổi 8 bit thành 10 bit để bảo đảm chuyển mức và cân bằng DC — tức **20% phụ phí**, muốn 1 Gb/s dữ liệu thật phải chạy dây 1,2 Gb/s. (Ethernet 10G dùng 64b/66b, phụ phí chỉ 3%.) **Tầng ra** là đệm **vi sai** — vì mọi lý do ở mục 3 — kèm điều chỉnh tín hiệu. **Kênh** cũng phải tối ưu: dây đồng phải kiểm soát trở kháng; hoặc **cáp quang**, gửi ánh sáng thay vì điện, toàn vẹn tín hiệu tuyệt vời và miễn nhiễm EMI nhưng đắt hơn. Bên nhận, **tầng vào** điều chỉnh tín hiệu, đưa cho cả **CDR** lẫn khối giải mã; CDR tách clock, rồi bộ giải nối tiếp dùng chính clock đó để lấy mẫu dữ liệu từ cùng tín hiệu — nghe lạ nhưng đó là cách SerDes chạy. Cuối cùng dữ liệu ra lại song song: 4 dây ở 250 MHz như ban đầu.

1 Gb/s giờ không còn nhanh. Tốc độ càng tăng, mọi mắt xích — điện trở, điện dung, điện cảm nhỏ xíu, cả cái đầu nối USB — đều ảnh hưởng toàn vẹn tín hiệu và đều phải tối ưu. SerDes là tính năng đinh của FPGA hiện đại, nhưng "gửi dữ liệu nhanh" hoá ra là cả một chuỗi: hoá nối tiếp, phát, nhận, giải nối tiếp — và vẫn đang vật lộn với vật lý.

Với hai bo của blog này: bo lõi QMTech XC7A35T gói FTG256 **không có** bộ thu phát GTP theo bảng gói chip trong DS180 (nằm trong danh sách cần kiểm), nên SerDes không thử được trên nó. Bo AX7325B (Kintex-7 XC7K325T) có 16 **GTX** nối ra 4 khe SFP+ 10G và QSFP+ — đúng thứ chương này mô tả, và là nơi mục tiêu dài hạn của blog (Ethernet 10G + DMA) sẽ diễn ra. Trên Xilinx, bộ thu phát được tạo bằng IP *7 Series FPGAs Transceivers Wizard*, với PLL, 8B/10B hoặc 64B/66B, CDR đều nằm trong primitive `GTXE2`.

---

## 6. Tóm Tắt Chương (Summary)

Làm FPGA giỏi cần hiểu I/O — chỗ kỹ sư FPGA đứng giữa điện tử và phần mềm. Chương này đã đi qua:

* **Đệm I/O và GPIO:** đệm ra với `OE`, đệm vào; `in`/`out` quyết định `OE`; bảng chân lý đệm ra.
* **Chân hai chiều:** `inout` + `'Z'` cho bán song công (I²C); FPGA nghe chính mình khi phát; tri-state chỉ có ở chân, trong lõi là mux.
* **Đặc tính điện:** điện áp (LVCMOS33/25, TTL), bank cùng VCCIO, drive strength, slew rate, và vi sai (LVDS ±350 mV: chống nhiễu, không cần chung đất, nhanh hơn, nhưng gấp đôi dây); đặt tất cả trong file ràng buộc.
* **DDR:** dữ liệu ở cả hai cạnh xung nhịp, đệm ODDR với `D1`/`D2`.
* **SerDes:** song song đụng trần (PCI), nhúng clock vào data (Manchester = XOR, cần chuyển mức và cân bằng DC), CDR tách clock, PLL – hoá nối tiếp – vi sai – kênh – CDR – giải nối tiếp; 8B/10B 20% phụ phí.

Thêm vào đó, từ góc độ thực hành với GHDL và hai bo của blog:

* **Chân hai chiều đã mô phỏng** với hai nguồn lái: phát, thả về `'Z'`, nhận, và va chạm ra `'X'`.
* **Hình DDR và Manchester sinh từ VCD**, không vẽ tay; ODDR thật không chạy được trên GHDL vì thiếu `unisim`.
* **QMTech FTG256 không có GTP**, AX7325B có GTX + SFP+ — SerDes là chương nối sang mục tiêu 10G.
* **Bốn mục cần Vivado/datasheet** trong danh sách kiểm: GTP của gói FTG256, điện áp tối đa chân 7-series, thuộc tính `DRIVE`/`SLEW`/`DIFF_TERM`, ODDR trên Artix-7.

Đến đây là hết phần chính của sách. Hai phụ lục (các bo mạch Lattice và chuyện xin việc FPGA) không dịch, vì bo đã chọn khác và phần sau không thuộc phạm vi blog này. Những "lời khuyên lộ trình" từng có ở bản dịch trước là của người dịch chứ không phải tác giả, nên đã bỏ.
