# CHƯƠNG 6: CÁC MODULE FPGA PHỔ BIẾN (COMMON FPGA MODULES)

Làm việc với một chip FPGA có cảm giác rất giống như khi bạn xây dựng với những viên gạch **LEGO**: bạn chỉ sở hữu một số lượng giới hạn các viên gạch nhỏ ban đầu (bảng tra LUT và Flip-flop), nhưng bằng cách sắp xếp và ghép nối chúng một cách tinh tế, bạn có thể tạo ra những hệ thống vô cùng phức tạp. 

Ở mức thấp nhất, bạn làm việc trực tiếp với **LUTs** và **Flip-flops**. Ở mức cao hơn một chút, có những khối xây dựng cơ bản (building blocks) xuất hiện lặp đi lặp lại trong hầu hết mọi thiết kế FPGA: **Bộ chọn (Multiplexer - Mux)**, **Bộ giải chọn (Demultiplexer - Demux)**, **Thanh ghi dịch (Shift Register)**, **Bộ nhớ RAM** và **Bộ đệm FIFO (First In, First Out)**.

Mỗi thành phần này đều cực kỳ phổ biến. Trong thực tế, gần như chắc chắn mọi dự án FPGA bạn từng thực hiện sẽ sử dụng một hoặc nhiều khối cấu trúc này. Trong chương này, chúng ta sẽ tìm hiểu nguyên lý hoạt động của từng khối xây dựng cơ bản và cách lập trình chúng bằng cả **Verilog** và **VHDL**. Với mỗi thành phần, bạn sẽ tạo ra một module độc lập hoàn chỉnh có thể tái sử dụng bất cứ lúc nào trong các dự án tương lai.

---

## 1. Bộ Chọn và Bộ Giải Chọn (Multiplexers and Demultiplexers)

**Bộ chọn (Multiplexer)** và **Bộ giải chọn (Demultiplexer)** là các linh kiện mạch điện cho phép bạn điều hướng và lựa chọn giữa hai hoặc nhiều tín hiệu dữ liệu.

* **Bộ chọn (Multiplexer - viết tắt là Mux):** Có **nhiều tín hiệu đầu vào**, và bạn sử dụng các chân chọn (**Selector**) để quyết định tín hiệu đầu vào nào sẽ được đưa ra **một đầu ra duy nhất**.
* **Bộ giải chọn (Demultiplexer - viết tắt là Demux):** Là quá trình ngược lại của Mux. Nó nhận **một tín hiệu đầu vào duy nhất**, và bạn chọn đưa tín hiệu đó đến **một trong nhiều đầu ra**.

Mux và Demux có vô số ứng dụng thực tế. Ví dụ, một bộ Mux có thể dùng để chọn tốc độ cho quạt gió: công tắc chuyển đổi ba nấc (thấp - trung bình - cao) đóng vai trò là chân chọn Mux để quyết định mức công suất nào được gửi tới bộ điều khiển quạt. Một bộ Demux có thể kết hợp với một công tắc chọn để bật 1 trong 4 đèn LED: chỉ có duy nhất một đèn LED được bật tại một thời điểm, nhưng bạn có thể chỉ định chính xác đèn nào sẽ sáng.

---

### Bộ Chọn 4-1 (4-1 Multiplexer)

Hãy cùng xem xét cách tạo một bộ chọn 4-1 trên FPGA (4 đầu vào dữ liệu, 1 đầu ra). Logic này có thể áp dụng tương tự cho bộ chọn có số lượng đầu vào bất kỳ (2-1, 8-1, 16-1...).

```
                      ┌───────────────┐
         i_Data0 ────>│               │
         i_Data1 ────>│   4-1 Mux     │────> o_Data
         i_Data2 ────>│               │
         i_Data3 ────>│               │
                      └───────────────┘
                        ^           ^
                        │           │
                     i_Sel1      i_Sel0
```

Bộ Mux 4-1 có 4 đầu vào dữ liệu: `i_Data0`, `i_Data1`, `i_Data2`, `i_Data3`. Ở bên phải là đầu ra duy nhất `o_Data`. Ở phía dưới là 2 chân chọn: `i_Sel1` và `i_Sel0` (Sel là viết tắt của *Select*). Vì có 4 đầu vào (`2^2 = 4`), chúng ta cần đúng 2 bit chọn để bao phủ tất cả các trường hợp.

#### Bảng Chân Lý Cho Mux 4-1 (Table 6-1):

| `i_Sel1` | `i_Sel0` | Đầu ra `o_Data` |
| :---: | :---: | :---: |
| `0` | `0` | `i_Data0` |
| `0` | `1` | `i_Data1` |
| `1` | `0` | `i_Data2` |
| `1` | `1` | `i_Data3` |

Nói một cách ngắn gọn: khi `i_Sel1` và `i_Sel0` đều bằng `0`, `o_Data` nhận giá trị của `i_Data0`. Khi `i_Sel1 = 0` và `i_Sel0 = 1`, đầu ra nhận `i_Data1`. Khi `i_Sel1 = 1` và `i_Sel0 = 0`, đầu ra nhận `i_Data2`. Và khi cả hai chân chọn đều bằng `1`, đầu ra nhận `i_Data3`.

> **GHI CHÚ:** Vì Mux có chức năng chọn lựa tín hiệu nên chúng thường được gọi là bộ chọn (selectors). Trong VHDL, `select` là một từ khóa dành riêng dùng để tạo bộ Mux.

#### Mã Nguồn Lập Trình Mux 4-1:

##### Verilog:
```verilog
assign o_Data = !i_Sel1 & !i_Sel0 ? i_Data0 :
                !i_Sel1 &  i_Sel0 ? i_Data1 :
                 i_Sel1 & !i_Sel0 ? i_Data2 : i_Data3;
```

##### VHDL:
```vhdl
o_Data <= i_Data0 when i_Sel1 = '0' and i_Sel0 = '0' else
          i_Data1 when i_Sel1 = '0' and i_Sel0 = '1' else
          i_Data2 when i_Sel1 = '1' and i_Sel0 = '0' else
          i_Data3;
```

* **Phiên bản Verilog:** Sử dụng toán tử điều kiện ba ngôi `? :` (ternary operator). Đây là cú pháp viết tắt cho các biểu thức điều kiện mà không cần dùng lệnh `if...else`. Nó đánh giá điều kiện trước dấu `?`; nếu đúng, nó chọn giá trị trước dấu `:`; nếu sai, nó chọn giá trị sau dấu `:`. Việc nối chuỗi nhiều toán tử `?` giúp xử lý gọn gàng từng tổ hợp bit chọn.
* **Phiên bản VHDL:** Sử dụng chuỗi câu lệnh `when / else`. Cú pháp VHDL tường minh và dễ đọc hơn, trong khi Verilog ngắn gọn hơn. Trong cả hai ngôn ngữ, chuỗi kiểm tra logic sẽ được đánh giá lần lượt cho đến khi gặp điều kiện đúng.

Dạng `when ... else` xét **lần lượt**, điều kiện nào đúng trước thì thắng — nó mang tính ưu tiên. VHDL còn một cách viết thứ hai đúng với bản chất "chọn" hơn, dùng chính từ khoá `select` mà ghi chú trên nhắc tới: gom hai bit chọn thành một vector rồi tra từng giá trị.

```vhdl
with i_Sel select
  o_Data <= i_Data0 when "00",
            i_Data1 when "01",
            i_Data2 when "10",
            i_Data3 when others;
```

`when others` là bắt buộc, vì mỗi bit `std_logic` có 9 giá trị chứ không phải 2 (kể cả `'U'`, `'X'`) — bỏ nó đi, GHDL báo `missing choice(s)`. Với mux đủ bốn nhánh thì hai cách viết tổng hợp ra cùng một mạch, chỉ khác cách đọc.

---

### Bộ Giải Chọn 1-4 (1-4 Demultiplexer)

Một bộ Demux 1-4 có sơ đồ khối dạng "đối gương" với Mux 4-1:

```
                      ┌───────────────┐
                      │               │────> o_Data0
                      │               │────> o_Data1
         i_Data ─────>│   1-4 Demux   │────> o_Data2
                      │               │────> o_Data3
                      └───────────────┘
                        ^           ^
                        │           │
                     i_Sel1      i_Sel0
```

Bộ Demux nhận 1 đầu vào dữ liệu `i_Data` ở bên trái và 2 chân chọn `i_Sel1`, `i_Sel0` để quyết định kênh nào trong số 4 đầu ra (`o_Data0` đến `o_Data3`) sẽ nhận dữ liệu này.

#### Bảng Chân Lý Cho Demux 1-4 (Table 6-2):

| `i_Sel1` | `i_Sel0` | `o_Data3` | `o_Data2` | `o_Data1` | `o_Data0` |
| :---: | :---: | :---: | :---: | :---: | :---: |
| `0` | `0` | 0 | 0 | 0 | `i_Data` |
| `0` | `1` | 0 | 0 | `i_Data` | 0 |
| `1` | `0` | 0 | `i_Data` | 0 | 0 |
| `1` | `1` | `i_Data` | 0 | 0 | 0 |

Khi một kênh đầu ra không được chọn, nó sẽ bị vô hiệu hóa và gán về mức `0`.

#### Mã Nguồn Lập Trình Demux 1-4:

##### Verilog:
```verilog
assign o_Data0 = (!i_Sel1 && !i_Sel0) ? i_Data : 1'b0;
assign o_Data1 = (!i_Sel1 &&  i_Sel0) ? i_Data : 1'b0;
assign o_Data2 = ( i_Sel1 && !i_Sel0) ? i_Data : 1'b0;
assign o_Data3 = ( i_Sel1 &&  i_Sel0) ? i_Data : 1'b0;
```

##### VHDL:
```vhdl
o_Data0 <= i_Data when (i_Sel1 = '0' and i_Sel0 = '0') else '0';
o_Data1 <= i_Data when (i_Sel1 = '0' and i_Sel0 = '1') else '0';
o_Data2 <= i_Data when (i_Sel1 = '1' and i_Sel0 = '0') else '0';
o_Data3 <= i_Data when (i_Sel1 = '1' and i_Sel0 = '1') else '0';
```

Trong thực tế, vì Mux và Demux có thể được tạo ra chỉ bằng vài dòng mã đơn giản, bạn hiếm khi tạo một file module riêng chỉ để khởi tạo một Mux/Demux đơn lẻ. Thay vào đó, bạn sẽ viết trực tiếp đoạn mã Mux/Demux này vào ngay trong module cần sử dụng nó.

Riêng dự án #5 ở mục 3 lại gọi demux như một module riêng (`entity work.Demux_1_To_4`), nên cần bản đầy đủ có entity. Sách có, nhưng dễ bỏ sót khi chỉ chép bốn dòng gán ở trên:

```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity Demux_1_To_4 is
  port (
    i_Data  : in  std_logic;
    i_Sel0  : in  std_logic;
    i_Sel1  : in  std_logic;
    o_Data0 : out std_logic;
    o_Data1 : out std_logic;
    o_Data2 : out std_logic;
    o_Data3 : out std_logic
  );
end entity Demux_1_To_4;

architecture RTL of Demux_1_To_4 is
begin
  o_Data0 <= i_Data when i_Sel1 = '0' and i_Sel0 = '0' else '0';
  o_Data1 <= i_Data when i_Sel1 = '0' and i_Sel0 = '1' else '0';
  o_Data2 <= i_Data when i_Sel1 = '1' and i_Sel0 = '0' else '0';
  o_Data3 <= i_Data when i_Sel1 = '1' and i_Sel0 = '1' else '0';
end architecture RTL;
```

---

## 2. Thanh Ghi Dịch (The Shift Register)

**Thanh ghi dịch (Shift Register)** là một chuỗi các Flip-flop được nối tiếp nhau: đầu ra `Q` của Flip-flop trước nối vào đầu vào `D` của Flip-flop sau, tất cả cùng dùng chung một nguồn xung nhịp Clock.

```
i_Data ───> [ Flip-Flop 0 ] ───> [ Flip-Flop 1 ] ───> [ Flip-Flop 2 ] ───> [ Flip-Flop 3 ] ───> o_Data
                 ^                    ^                    ^                    ^
                 │                    │                    │                    │
Clk ─────────────┴────────────────────┴────────────────────┴────────────────────┘
```

Mỗi Flip-flop thêm vào chuỗi sẽ làm trễ tín hiệu đúng **1 chu kỳ xung nhịp (clock cycle)**.

---

### Các Ứng Dụng Chính Của Thanh Ghi Dịch:

#### 1. Làm Trễ Dữ Liệu (Delaying Data)
Đây là ứng dụng phổ biến nhất của thanh ghi dịch. Độ trễ thường dùng để **căn chỉnh thời gian (time alignment)** giữa các luồng dữ liệu. 

Ví dụ, khi bạn đưa dữ liệu qua một khối tính toán toán học phức tạp, khối đó có thể mất 4 chu kỳ Clock mới cho ra kết quả. Nếu bạn cần kết hợp kết quả đầu ra này với dữ liệu đầu vào gốc, bạn phải đưa dữ liệu đầu vào gốc qua một thanh ghi dịch 4-bit để làm trễ nó đúng 4 chu kỳ Clock tương ứng.

##### Mã Nguồn Tạo Thanh Ghi Dịch Làm Trễ 4 Chu Kỳ:

###### Verilog:
```verilog
reg [3:0] r_Shift = 4'b0000;

always @(posedge i_Clk)
begin
  r_Shift[0]   <= i_Data_To_Delay;
  r_Shift[3:1] <= r_Shift[2:0]; // Mẹo gán dịch đồng thời các bit
end

assign o_Delayed_Data = r_Shift[3];
```

###### VHDL:
```vhdl
signal r_Shift : std_logic_vector(3 downto 0) := (others => '0');

process (i_Clk)
begin
  if rising_edge(i_Clk) then
    r_Shift(0)          <= i_Data_To_Delay;
    r_Shift(3 downto 1) <= r_Shift(2 downto 0);
  end if;
end process;

o_Delayed_Data <= r_Shift(3);
```

Cú pháp gán mảng `r_Shift[3:1] <= r_Shift[2:0]` là một mẹo viết ngắn gọn thay cho 3 dòng gán riêng lẻ:
```verilog
r_Shift[3] <= r_Shift[2];
r_Shift[2] <= r_Shift[1];
r_Shift[1] <= r_Shift[0];
```
Dữ liệu tại bit `r_Shift[3]` chính là bản sao của `i_Data_To_Delay` nhưng bị dịch trễ đúng **4 chu kỳ xung nhịp**.

---

#### 2. Chuyển Đổi Nối Tiếp và Song Song (Serial & Parallel Conversion)

* **Nối tiếp sang Song song (Serial to Parallel):** Dùng trong các chuẩn giao tiếp nối tiếp như **UART**, **SPI**, **I2C**. Dữ liệu đi vào từng bit một theo từng chu kỳ Clock. Sau 8 chu kỳ Clock, 8 Flip-flop trong thanh ghi dịch sẽ chứa đủ 1 byte dữ liệu song song (8-bit) sẵn sàng được xử lý.
* **Song song sang Nối tiếp (Parallel to Serial):** Nạp đồng thời 1 byte dữ liệu song song vào thanh ghi, sau đó dịch xuất từng bit ra ngoài ở mỗi chu kỳ Clock.

---

#### 3. Thanh Ghi Dịch Phản Hồi Tuyến Tính (Linear Feedback Shift Register - LFSR)

**LFSR** là một dạng thanh ghi dịch đặc biệt, trong đó đầu ra của một số Flip-flop (gọi là các điểm trích - **taps**) được đưa qua cổng **XNOR** (hoặc XOR) để tính toán bit phản hồi quay trở lại đầu vào của bit 0.

```
              ┌───────────────────────┐
              │                       │
              v                       │
           ┌──────┐                   │
           │ XNOR │<───────┐          │
           └──────┘        │          │
              │            │          │
              v            │          │
          ┌───────┐    ┌───────┐    ┌───────┐
Clk ─────>│ Bit 0 │───>│ Bit 1 │───>│ Bit 2 │
          └───────┘    └───────┘    └───────┘
```

##### Đặc tính của LFSR:

1. **Tạo chuỗi số giả ngẫu nhiên (Pseudorandom):** Giá trị nhị phân hiển thị trên chuỗi Flip-flop biến đổi giống như ngẫu nhiên. Tuy nhiên nó là *giả ngẫu nhiên* vì từ một trạng thái hiện tại, bạn luôn dự đoán chính xác trạng thái tiếp theo.
2. **Số trạng thái tối đa (Maximum Period):** Đối với một LFSR độ dài N bit, số chu kỳ tối đa để nó duyệt qua tất cả các tổ hợp trước khi lặp lại là `2^N − 1`. Ví dụ: LFSR 3-bit có `2^3 − 1 = 7` trạng thái, 4-bit có `15`, 22-bit có `2^22 − 1 = 4.194.303`.

> **Tại sao lại là `2^N − 1` mà không phải `2^N`?**
> Nếu LFSR rơi vào trạng thái cấm (đối với cổng XNOR là trạng thái toàn 1: `111`), ở chu kỳ tiếp theo cổng XNOR của `1` và `1` sẽ ra `1`, các bit dịch sang cũng là `1` → LFSR sẽ bị "mắc kẹt" vĩnh viễn ở trạng thái `111`. Do đó, một LFSR N bit chạy qua `2^N − 1` trạng thái hợp lệ.

##### Bảng Chu Kỳ Của LFSR 3-bit (Table 6-5):

| Chu kỳ Clock | Dữ liệu nhị phân | Giá trị thập phân |
| :---: | :---: | :---: |
| 0 | `000` | 0 |
| 1 | `001` | 1 |
| 2 | `011` | 3 |
| 3 | `110` | 6 |
| 4 | `101` | 5 |
| 5 | `010` | 2 |
| 6 | `100` | 4 |
| 7 | `000` | 0 (Lặp lại vòng tuần hoàn) |

Bảng này đã chạy lại bằng GHDL với đúng đoạn mã VHDL bên dưới: `001, 011, 110, 101, 010, 100` rồi về `000` — khớp từng hàng.

##### Ứng Dụng Của LFSR:
Do tiêu tốn **cực kỳ ít tài nguyên LUT và Flip-flop**, LFSR được sử dụng rộng rãi để làm **bộ đếm giá rẻ (low-utilization counter)**, bộ tạo mẫu kiểm thử (test pattern generator), bộ xáo trộn dữ liệu (data scrambler) và trong mã hóa mật mã (cryptography).

##### Mã Nguồn Lập Trình LFSR 3-bit:

###### Verilog:
```verilog
module LFSR_3Bit (
  input        i_Clk,
  output [2:0] o_LFSR_Data
);

  reg [2:0] r_LFSR = 3'b000;
  wire      w_XNOR;

  always @(posedge i_Clk)
  begin
    // Dịch các bit và ghép bit phản hồi w_XNOR vào bit 0
    r_LFSR <= {r_LFSR[1:0], w_XNOR};
  end

  // Tính toán bit phản hồi XNOR giữa Bit 2 và Bit 1
  assign w_XNOR = ~(r_LFSR[2] ^ r_LFSR[1]);
  assign o_LFSR_Data = r_LFSR;

endmodule
```

###### VHDL:
```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity LFSR_3Bit is
  port (
    i_Clk       : in  std_logic;
    o_LFSR_Data : out std_logic_vector(2 downto 0)
  );
end entity LFSR_3Bit;

architecture RTL of LFSR_3Bit is
  signal r_LFSR : std_logic_vector(2 downto 0) := (others => '0');
  signal w_XNOR : std_logic;
begin

  process (i_Clk)
  begin
    if rising_edge(i_Clk) then
      -- Ghép chuỗi bằng toán tử &
      r_LFSR <= r_LFSR(1 downto 0) & w_XNOR;
    end if;
  end process;

  w_XNOR <= not (r_LFSR(2) xor r_LFSR(1));
  o_LFSR_Data <= r_LFSR;

end architecture RTL;
```

Dòng `:= (others => '0')` ở khai báo `r_LFSR` không phải tuỳ chọn. Bỏ nó đi, mô phỏng khởi đầu ở `'U'`, XNOR của `'U'` vẫn là `'U'`, và thanh ghi kẹt ở `'U'` mãi mãi — đã thử với bản 22 bit: sau 100 cạnh xung nhịp mọi bit vẫn `'U'`, xung `Done` không bao giờ lên. Trên chip thật flip-flop khởi động ở 0 nên mạch vẫn chạy, nhưng testbench của bạn thì không. Bản VHDL `LFSR_22` trong sách gốc thiếu đúng dòng này; bản in ở mục 3 đã thêm vào.

---

## 3. Dự Án #5: Nhấp Nháy LED Có Chọn Lọc (Project #5: Selectively Blinking an LED)

Yêu cầu dự án: Làm nhấp nháy 4 đèn LED trên bo mạch phát triển, nhưng **chỉ có đúng 1 đèn LED nhấp nháy tại một thời điểm**. Người dùng sử dụng 2 nút nhấn để chọn đèn LED nào sẽ nhấp nháy.

#### Bảng Chọn LED (Table 6-6):

| `i_Switch_2` | `i_Switch_1` | Đèn LED được chọn | Tín hiệu |
| :---: | :---: | :---: | :---: |
| 0 | 0 | **D1** | `o_LED_1` |
| 0 | 1 | **D2** | `o_LED_2` |
| 1 | 0 | **D3** | `o_LED_3` |
| 1 | 1 | **D4** | `o_LED_4` |

---

### Phân Tích Vấn Đề Tần Số Xung Nhịp

* Mạch đồng hồ trên bo mạch Nandland Go Board chạy ở tần số **25 MHz** (25,000,000 chu kỳ/giây). Nếu đưa thẳng tín hiệu xung nhịp này ra đèn LED, đèn LED sẽ chớp với tốc độ 25 triệu lần/giây — mắt người sẽ chỉ thấy đèn sáng liên tục.
* Chúng ta cần một tín hiệu đảo trạng thái ở tần số mắt người quan sát được: **2 đến 4 Hz** (mỗi 0.25 giây đảo trạng thái 1 lần).

### Giải Pháp 1: Dùng LFSR 22-bit Làm Bộ Đếm Giá Rẻ
Một LFSR 22-bit chạy hết chu kỳ sau `2^22 − 1 = 4.194.303` chu kỳ. Ở xung nhịp 25 MHz, thời gian lặp là `4.194.303 / 25.000.000 Hz ≈ 0,168 giây`.

Mỗi khi LFSR quay trở lại trạng thái ban đầu (`000...0`), nó phát ra một xung **`Done`** (kéo dài đúng 1 chu kỳ Clock). Xung `Done` này được đưa vào kích hoạt chân Enable của một Flip-flop để lật trạng thái output, tạo ra tín hiệu sóng vuông có tần số khoảng **3 Hz**. Tín hiệu 3 Hz này đi vào bộ Demux 1-4 để dẫn ra đèn LED tương ứng.

Trên bo QMTech 50 MHz, cùng LFSR này lặp sau `0,084 giây`, đèn lật ở khoảng **6 Hz** — vẫn nhìn được. Nhưng bo lõi QMTech chỉ có **một** LED và **một** nút người dùng, không đủ cho 4 LED + 2 nút của dự án này. Muốn chạy trên bo thì bỏ demux, nối thẳng `r_LFSR_Toggle` ra LED; còn mạch đầy đủ thì kiểm bằng mô phỏng — toàn bộ mã VHDL trong mục này đã chạy qua GHDL.

```
                      ┌───────────────────────────────────────────────────────────┐
                      │ Demux LFSR Project Top                                    │
                      │                                                           │
                      │   ┌──────┐  Done  ┌───┐ Toggle  ┌───────────┐             │
Clk (25MHz) ─────────>│──>│ LFSR │───────>│D Q│────────>│ 1-4 Demux │────> D1..D4 (LEDs)
                      │   └──────┘        │En │         └───────────┘             │
                      │                     ^                 ^                   │
                      │                     │                 │                   │
SW1, SW2 ────────────>│─────────────────────┴─────────────────┘                   │
                      └───────────────────────────────────────────────────────────┘
```

---

### Mã Nguồn Dự Án #5 (Phương Pháp LFSR):

#### 1. Module Cấp Cao (`Demux_LFSR_Project_Top`):

##### Verilog:
```verilog
module Demux_LFSR_Project_Top (
  input  i_Clk,
  input  i_Switch_1,
  input  i_Switch_2,
  output o_LED_1,
  output o_LED_2,
  output o_LED_3,
  output o_LED_4
);

  wire w_LFSR_Done;
  reg  r_LFSR_Toggle = 1'b0;

  // Khởi tạo LFSR 22-bit
  LFSR_22 LFSR_Inst (
    .i_Clk(i_Clk),
    .o_LFSR_Data(), // Để trống đầu ra không dùng
    .o_LFSR_Done(w_LFSR_Done)
  );

  // Tạo tín hiệu đảo trạng thái 3 Hz
  always @(posedge i_Clk)
  begin
    if (w_LFSR_Done)
      r_LFSR_Toggle <= ~r_LFSR_Toggle;
  end

  // Khởi tạo Demux 1-4
  Demux_1_To_4 Demux_Inst (
    .i_Data(r_LFSR_Toggle),
    .i_Sel1(i_Switch_2),
    .i_Sel0(i_Switch_1),
    .o_Data0(o_LED_1),
    .o_Data1(o_LED_2),
    .o_Data2(o_LED_3),
    .o_Data3(o_LED_4)
  );

endmodule
```

> **Mẹo Tự Động Cắt Bỏ Logic Rác (Pruning):** Để ý trong đoạn code trên, cổng `.o_LFSR_Data()` được để trống. Trình tổng hợp FPGA rất thông minh: khi thấy một tín hiệu đầu ra không nối đi đâu, nó sẽ tự động **cắt bỏ (prune)** các đường dây và phần cứng thừa, giúp bạn tái sử dụng module thoải mái mà không sợ tốn Flip-flop!

##### VHDL:
```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity Demux_LFSR_Project_Top is
  port (
    i_Clk      : in  std_logic;
    i_Switch_1 : in  std_logic;
    i_Switch_2 : in  std_logic;
    o_LED_1    : out std_logic;
    o_LED_2    : out std_logic;
    o_LED_3    : out std_logic;
    o_LED_4    : out std_logic
  );
end entity Demux_LFSR_Project_Top;

architecture RTL of Demux_LFSR_Project_Top is
  signal w_LFSR_Done   : std_logic;
  signal r_LFSR_Toggle : std_logic := '0';
begin

  LFSR_Inst: entity work.LFSR_22
    port map (
      i_Clk        => i_Clk,
      o_LFSR_Data  => open, -- Dùng từ khóa open trong VHDL
      o_LFSR_Done  => w_LFSR_Done
    );

  process (i_Clk)
  begin
    if rising_edge(i_Clk) then
      if w_LFSR_Done = '1' then
        r_LFSR_Toggle <= not r_LFSR_Toggle;
      end if;
    end if;
  end process;

  Demux_Inst: entity work.Demux_1_To_4
    port map (
      i_Data  => r_LFSR_Toggle,
      i_Sel1  => i_Switch_2,
      i_Sel0  => i_Switch_1,
      o_Data0 => o_LED_1,
      o_Data1 => o_LED_2,
      o_Data2 => o_LED_3,
      o_Data3 => o_LED_4
    );

end architecture RTL;
```

---

#### 2. Module LFSR 22-bit (`LFSR_22`):

##### Verilog:
```verilog
module LFSR_22 (
  input         i_Clk,
  output [21:0] o_LFSR_Data,
  output        o_LFSR_Done
);

  reg [21:0] r_LFSR = 22'b0;
  wire       w_XNOR;

  always @(posedge i_Clk)
  begin
    r_LFSR <= {r_LFSR[20:0], w_XNOR};
  end

  // Bit phản hồi XNOR từ Bit 21 và Bit 20
  assign w_XNOR = ~(r_LFSR[21] ^ r_LFSR[20]);
  
  // Phát xung Done khi toàn bộ r_LFSR = 0
  assign o_LFSR_Done = (r_LFSR == 22'b0);
  assign o_LFSR_Data = r_LFSR;

endmodule
```

##### VHDL:
```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity LFSR_22 is
  port (
    i_Clk       : in  std_logic;
    o_LFSR_Data : out std_logic_vector(21 downto 0);
    o_LFSR_Done : out std_logic
  );
end entity LFSR_22;

architecture RTL of LFSR_22 is
  signal r_LFSR : std_logic_vector(21 downto 0) := (others => '0'); -- sách thiếu khởi tạo
  signal w_XNOR : std_logic;
begin

  process (i_Clk)
  begin
    if rising_edge(i_Clk) then
      r_LFSR <= r_LFSR(20 downto 0) & w_XNOR;
    end if;
  end process;

  -- Bit phản hồi XNOR từ Bit 21 và Bit 20
  w_XNOR      <= r_LFSR(21) xnor r_LFSR(20);

  -- Phát xung Done khi toàn bộ r_LFSR = 0
  o_LFSR_Done <= '1' when r_LFSR = "0000000000000000000000" else '0';
  o_LFSR_Data <= r_LFSR;

end architecture RTL;
```

Sách dùng toán tử `xnor` có sẵn của VHDL-93, tương đương `not (a xor b)` ở bản 3 bit. Mô phỏng bằng GHDL đếm được đúng **4.194.303** chu kỳ giữa hai xung `Done` liên tiếp — tức là cặp điểm trích bit 21 và bit 20 cho chu kỳ tối đa; chọn cặp khác chưa chắc được vậy.

---

### Giải Pháp 2: Dùng Bộ Đếm Truyền Thống (`Count_And_Toggle`)

Mặc dù LFSR tiết kiệm phần cứng, điểm yếu của nó là **không linh hoạt**. Bạn chỉ có thể chọn số chu kỳ đếm dạng `2^N − 1`. Nếu bạn muốn đếm chính xác **4.000.000 chu kỳ** (0,16 giây ở 25 MHz), LFSR không làm được: nấc thấp hơn kế tiếp là 21 bit, chỉ đếm được `2^21 − 1 = 2.097.151`, mọi giá trị nằm giữa 2.097.151 và 4.194.303 đều ngoài tầm với.

Giải pháp linh hoạt hơn là dùng bộ đếm truyền thống `Count_And_Toggle` với tham số tùy chỉnh `COUNT_LIMIT`:

#### Mã Nguồn Module `Count_And_Toggle`:

##### Verilog:
```verilog
module Count_And_Toggle #(parameter COUNT_LIMIT = 25000000) (
  input  i_Clk,
  input  i_Enable,
  output o_Toggle
);

  reg [$clog2(COUNT_LIMIT)-1:0] r_Counter = 0;
  reg r_Toggle = 1'b0;

  always @(posedge i_Clk)
  begin
    if (i_Enable)
    begin
      if (r_Counter == COUNT_LIMIT - 1)
      begin
        r_Toggle  <= ~r_Toggle;
        r_Counter <= 0;
      end
      else
      begin
        r_Counter <= r_Counter + 1;
      end
    end
  end

  assign o_Toggle = r_Toggle;

endmodule
```

##### VHDL:
```vhdl
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity Count_And_Toggle is
  generic (
    COUNT_LIMIT : integer := 25000000
  );
  port (
    i_Clk    : in  std_logic;
    i_Enable : in  std_logic;
    o_Toggle : out std_logic
  );
end entity Count_And_Toggle;

architecture RTL of Count_And_Toggle is
  signal r_Counter : integer range 0 to COUNT_LIMIT - 1 := 0;
  signal r_Toggle  : std_logic := '0';
begin

  process (i_Clk)
  begin
    if rising_edge(i_Clk) then
      if i_Enable = '1' then
        if r_Counter = COUNT_LIMIT - 1 then
          r_Toggle  <= not r_Toggle;
          r_Counter <= 0;
        else
          r_Counter <= r_Counter + 1;
        end if;
      end if;
    end if;
  end process;

  o_Toggle <= r_Toggle;

end architecture RTL;
```

Mạch này chính là bộ đếm tự quay về 0 ở ngưỡng mà chương 4 đã nói; mô phỏng với `COUNT_LIMIT => 4` thấy `o_Toggle` lật đúng mỗi 4 cạnh. Cho QMTech 50 MHz, muốn lật mỗi 0,25 giây thì `COUNT_LIMIT => 12500000`, bộ đếm 24 bit.

---

### So Sánh Hai Phương Pháp (LFSR vs. Bộ Đếm)

Khi tổng hợp hai phương pháp trên chip Lattice iCE40, báo cáo tài nguyên ghi nhận:

* **Phương pháp LFSR:** Tiêu tốn **23 Flip-flops (1%)** và **13 LUTs (1%)**.
* **Phương pháp Bộ đếm truyền thống:** Tiêu tốn **24 Flip-flops (1%)** và **36 LUTs (2%)**.

#### Đánh giá từ chuyên gia:
Dùng LFSR tiết kiệm được 1 Flip-flop và 23 LUTs. Tuy nhiên, các FPGA hiện đại có hàng nghìn đến hàng triệu LUTs. Việc tiết kiệm 1% tài nguyên nhưng đánh đổi lại code khó đọc hơn và mất đi tính linh hoạt là điều không nên ngoại trừ các ứng dụng cực kỳ nhạy cảm về phần cứng. Lựa chọn giải pháp đơn giản, linh hoạt và dễ bảo trì luôn là ưu tiên hàng đầu của một kỹ sư FPGA giỏi!

---

## 4. Bộ Nhớ Truy Cập Ngẫu Nhiên (Random Access Memory - RAM)

**Bộ nhớ RAM (Random Access Memory)** cho phép lưu trữ dữ liệu bên trong FPGA và đọc lại bất cứ lúc nào tại bất kỳ địa chỉ nào. Thuật ngữ *Random Access* (truy cập ngẫu nhiên) có nghĩa là bạn có thể đọc ô nhớ vị trí 0, và ngay chu kỳ sau đọc ngay ô nhớ vị trí cuối cùng mà không cần theo thứ tự.

RAM được phân thành hai loại chính:

1. **Single-port RAM (RAM 1 cổng):** Chỉ có 1 giao diện chung. Tại 1 chu kỳ Clock, bạn chỉ có thể chọn **Đọc OR Ghi**, không thể làm cả hai cùng lúc.
2. **Dual-port RAM (RAM 2 cổng):** Có 2 giao diện đọc/ghi độc lập. Cho phép **vừa Đọc vừa Ghi đồng thời** tại 2 địa chỉ khác nhau trong cùng một chu kỳ Clock.

```
                  ┌───────────────────────────────┐
                  │ Dual-Port RAM                 │
   i_Wr_Clk ─────>│                               │<───── i_Rd_Clk
  i_Wr_Addr ─────>│ Write Port          Read Port │<───── i_Rd_Addr
    i_Wr_DV ─────>│                               │<───── i_Rd_En
  i_Wr_Data ─────>│ Width: 8 bits                 │─────> o_Rd_DV
                  │ Depth: 16 locations           │─────> o_Rd_Data
                  └───────────────────────────────┘
```

### Chi Tiết Tín Hiệu Giao Diện RAM 2 Cổng:

* **Ghi (Write Port):** `i_Wr_Clk` (xung nhịp ghi), `i_Wr_Addr` (địa chỉ ghi), `i_Wr_DV` (xung cho phép ghi), `i_Wr_Data` (dữ liệu ghi vào).
* **Đọc (Read Port):** `i_Rd_Clk` (xung nhịp đọc), `i_Rd_Addr` (địa chỉ đọc), `i_Rd_En` (xung cho phép đọc), `o_Rd_DV` (cờ báo dữ liệu đọc hợp lệ), `o_Rd_Data` (dữ liệu đọc ra).

---

### Mã Nguồn Module RAM 2 Cổng (`RAM_2Port`):

#### Verilog:
```verilog
module RAM_2Port #(
  parameter WIDTH = 8,
  parameter DEPTH = 256
) (
  // Cổng Ghi
  input                  i_Wr_Clk,
  input  [$clog2(DEPTH)-1:0] i_Wr_Addr,
  input                  i_Wr_DV,
  input  [WIDTH-1:0]     i_Wr_Data,
  
  // Cổng Đọc
  input                  i_Rd_Clk,
  input  [$clog2(DEPTH)-1:0] i_Rd_Addr,
  input                  i_Rd_En,
  output reg             o_Rd_DV,
  output reg [WIDTH-1:0] o_Rd_Data
);

  // Mảng 2 chiều lưu trữ RAM
  reg [WIDTH-1:0] r_RAM [0:DEPTH-1];

  // Khối logic Ghi (Write Process)
  always @(posedge i_Wr_Clk)
  begin
    if (i_Wr_DV)
    begin
      r_RAM[i_Wr_Addr] <= i_Wr_Data;
    end
  end

  // Khối logic Đọc (Read Process)
  always @(posedge i_Rd_Clk)
  begin
    o_Rd_Data <= r_RAM[i_Rd_Addr];
    o_Rd_DV   <= i_Rd_En;
  end

endmodule
```

#### VHDL:
```vhdl
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity RAM_2Port is
  generic (
    WIDTH : integer := 8;
    DEPTH : integer := 256
  );
  port (
    -- Cổng Ghi
    i_Wr_Clk  : in  std_logic;
    i_Wr_Addr : in  std_logic_vector;
    i_Wr_DV   : in  std_logic;
    i_Wr_Data : in  std_logic_vector(WIDTH-1 downto 0);

    -- Cổng Đọc
    i_Rd_Clk  : in  std_logic;
    i_Rd_Addr : in  std_logic_vector;
    i_Rd_En   : in  std_logic;
    o_Rd_DV   : out std_logic;
    o_Rd_Data : out std_logic_vector(WIDTH-1 downto 0)
  );
end entity RAM_2Port;

architecture RTL of RAM_2Port is
  type t_RAM is array (0 to DEPTH-1) of std_logic_vector(WIDTH-1 downto 0);
  signal r_RAM : t_RAM;
begin

  -- Logic Ghi
  process (i_Wr_Clk)
  begin
    if rising_edge(i_Wr_Clk) then
      if i_Wr_DV = '1' then
        r_RAM(to_integer(unsigned(i_Wr_Addr))) <= i_Wr_Data;
      end if;
    end if;
  end process;

  -- Logic Đọc
  process (i_Rd_Clk)
  begin
    if rising_edge(i_Rd_Clk) then
      o_Rd_Data <= r_RAM(to_integer(unsigned(i_Rd_Addr)));
      o_Rd_DV   <= i_Rd_En;
    end if;
  end process;

end architecture RTL;
```

Hai chỗ đáng chú ý trong bản VHDL. Thứ nhất, hai cổng địa chỉ khai `std_logic_vector` **không ghi độ rộng** — VHDL-93 cho phép, độ rộng lấy theo tín hiệu nối vào lúc instantiate (sách ghi chú "sized at higher level"); GHDL biên dịch bình thường, và FIFO ở mục 5 tận dụng điều này để nối địa chỉ đúng số bit theo `DEPTH`. Thứ hai, khối đọc gán `o_Rd_Data` **ở mọi cạnh xung nhịp**, không phụ thuộc `i_Rd_En` — nên `o_Rd_Data` chỉ có nghĩa đúng chu kỳ `o_Rd_DV = '1'`, chu kỳ sau nó đã là ô nhớ khác. Testbench đầu tiên viết cho chương này dính đúng lỗi này: kiểm chậm một cạnh, đọc ra toàn giá trị kế tiếp.

### RAM Được Tổng Hợp Thành Phần Cứng Nào Trên FPGA?
Công cụ tổng hợp sẽ đưa ra quyết định dựa trên **kích thước của RAM**:

* **RAM dung lượng nhỏ (VD: 4 locations × 8 bits):** Sẽ được tổng hợp từ các **Flip-flops** rời.
* **RAM dung lượng lớn (VD: 256 locations × 8 bits trở lên):** Trình tổng hợp sẽ tự động chuyển sang sử dụng các khối **Block RAM (BRAM)** cứng chuyên dụng tích hợp sẵn trên chip để tiết kiệm Flip-flop cho các tác vụ logic khác.

Trên Xilinx 7-series ranh giới này có thêm một nấc: RAM nhỏ không thành flip-flop rời mà thành **distributed RAM** — chính LUT trong slice loại SLICEM được dùng làm ô nhớ (nhớ lại chương 3: LUT bản chất là 64 ô SRAM). RAM lớn mới vào **Block RAM** 36 Kb; XC7A35T có 50 khối, tổng 1.800 Kb. Điều kiện để công cụ suy ra Block RAM là đọc **đồng bộ** như đoạn mã trên — `o_Rd_Data` gán trong process có xung nhịp. Nếu đọc tổ hợp (`o_Rd_Data <= r_RAM(...)` ngoài process), công cụ buộc phải dùng distributed RAM vì Block RAM không có đường đọc không xung nhịp. Con số cụ thể trên Vivado chưa chạy, nằm trong danh sách cần kiểm.

---

## 5. Bộ Đệm FIFO (First In, First Out)

**FIFO (First In, First Out)** là cấu trúc bộ nhớ đệm dữ liệu theo nguyên tắc **"Vào trước, Ra trước"** — dữ liệu nào nạp vào đầu tiên sẽ là dữ liệu được lấy ra đầu tiên. Nó giống như hình ảnh ô tô đi qua một đường hầm: chiếc xe nào vào hầm trước sẽ ra khỏi hầm trước.

```
   Write Data (Vào) ───>  [ Dữ liệu 1 | Dữ liệu 2 | Dữ liệu 3 ]  ───> Read Data (Ra)
                          <───────────────────────────────────
                                       Depth
```

### Các Ứng Dụng Sống Còn Của FIFO:

1. **Bộ đệm tốc độ:** Làm vùng đệm dữ liệu giữa bên sản xuất dữ liệu (producer) và bên tiêu thụ dữ liệu (consumer) chạy khác tốc độ.
2. **Giao tiếp bộ nhớ ngoài:** Gom dữ liệu trước khi đẩy ra bộ nhớ LPDDR hoặc ghi vào thẻ microSD.
3. **Chuyển vùng xung nhịp (Clock Domain Crossing - CDC):** Truyền dữ liệu an toàn giữa hai khối logic chạy trên hai nguồn xung nhịp khác nhau.

Lưu ý ngay: bản FIFO ở cuối mục này chỉ có **một** xung nhịp (`i_Clk`), không dùng cho việc chuyển vùng xung nhịp được. Sách cũng nói rõ FIFO hai xung nhịp là chuyện nâng cao, để dành sau.

---

### HAI QUY TẮC "VÀNG" SỐNG CÒN KHÔNG ĐƯỢC VI PHẠM KHI DÙNG FIFO:

> 1. **KHÔNG BAO GIỜ ghi vào một FIFO đã ĐẦY (`Full`).**
> 2. **KHÔNG BAO GIỜ đọc từ một FIFO đang TRỐNG (`Empty`).**

Vi phạm hai quy tắc này là **nguyên nhân gây ra những lỗi bug tồi tệ nhất** trong thiết kế FPGA: dữ liệu bị đè (corrupted) hoặc đọc ra dữ liệu rác, rất khó phát hiện trên dạng sóng!

---

### Sơ Đồ Khối Và Danh Sách Tín Hiệu Chi Tiết Của FIFO (Figure 6-9):

```
                  ┌───────────────────────────────┐
                  │ FIFO                          │
   i_Wr_Clk ─────>│                               │<───── i_Rd_Clk
    i_Wr_DV ─────>│ Write Port          Read Port │<───── i_Rd_En
  i_Wr_Data ─────>│                               │─────> o_Rd_DV
 i_AF_Level ─────>│ Width                         │─────> o_Rd_Data
  o_AF_Flag <─────│ Depth                         │<───── i_AE_Level
     o_Full <─────│                               │─────> o_AE_Flag
                  │                               │─────> o_Empty
                  └───────────────────────────────┘
```

#### Giải Thích Tín Hiệu Báo Cờ Đặc Biệt Của FIFO:

* `o_Full`: Báo cờ bằng `1` khi FIFO lấp đầy 100% sức chứa. Phía truyền dữ liệu phải **ngắt ngay lập tức**.
* `o_Empty`: Báo cờ bằng `1` khi FIFO hoàn toàn trống. Phía đọc **không được đọc**.
* `i_AF_Level` & `o_AF_Flag` (Almost Full - Suýt đầy): Báo cờ khi số lượng dữ liệu chạm ngưỡng cảnh báo suýt đầy (VD: đặt level = `Depth − 4`). Giúp ngắt truyền dữ liệu theo luồng (bursts) an toàn trước khi cờ `Full` kịp bật.
* `i_AE_Level` & `o_AE_Flag` (Almost Empty - Suýt trống): Báo cờ khi số lượng dữ liệu nhỏ hơn hoặc bằng ngưỡng cài đặt (VD: đặt level = 4). Giúp đảm bảo có đủ một lượng dữ liệu tối thiểu sẵn sàng trước khi bên đọc bắt đầu rút dữ liệu ra.

##### Bảng Ví Dụ Trạng Thái Các Cờ Trong FIFO 12 Ô Nhớ (Figure 6-10):

| Số dữ liệu trong FIFO (`Count`) | `o_Empty` | `o_AE_Flag` (Level=4) | `o_AF_Flag` (Level=8) | `o_Full` |
| :---: | :---: | :---: | :---: | :---: |
| **0** | **1** | **1** | 0 | 0 |
| **4** | 0 | **1** | 0 | 0 |
| **5** | 0 | 0 | 0 | 0 |
| **7** | 0 | 0 | 0 | 0 |
| **8** | 0 | 0 | **1** | 0 |
| **12** | 0 | 0 | **1** | **1** |

Bảng này đã mô phỏng lại với bản VHDL bên dưới (`DEPTH => 12`, `i_AE_Level => 4`, `i_AF_Level => 8`): sáu hàng khớp hết. Có một điều cần nói thẳng: **code trong sách gốc không khớp với bảng của chính nó**. Sách viết `o_AF_Flag <= '1' when r_Count > DEPTH - i_AF_Level` và `o_AE_Flag <= '1' when r_Count < i_AE_Level`; theo đó với level 8 cờ AF phải bật từ 5 phần tử chứ không phải 8, và AE tắt ngay ở 4. Bản ở đây viết theo lời giải thích và bảng (`>=` và `<=`), vì đó là ý tác giả mô tả, và đã kiểm bằng mô phỏng.

---

### Mã Nguồn Lập Trình Module FIFO (`FIFO_Single_Clock`):

Module này bọc lấy RAM 2 cổng và quản lý hai con trỏ địa chỉ `r_Wr_Addr`, `r_Rd_Addr` cùng biến đếm số phần tử `r_Count`.

#### Verilog:
```verilog
module FIFO_Single_Clock #(
  parameter WIDTH = 8,
  parameter DEPTH = 256
) (
  input                  i_Clk,
  input                  i_Rst_L, // Reset active-low
  
  // Giao diện Ghi
  input                  i_Wr_DV,
  input  [WIDTH-1:0]     i_Wr_Data,
  input  [$clog2(DEPTH):0] i_AF_Level,
  output                 o_AF_Flag,
  output                 o_Full,
  
  // Giao diện Đọc
  input                  i_Rd_En,
  output                 o_Rd_DV,
  output [WIDTH-1:0]     o_Rd_Data,
  input  [$clog2(DEPTH):0] i_AE_Level,
  output                 o_AE_Flag,
  output                 o_Empty
);

  reg [$clog2(DEPTH)-1:0] r_Wr_Addr = 0;
  reg [$clog2(DEPTH)-1:0] r_Rd_Addr = 0;
  reg [$clog2(DEPTH):0]   r_Count   = 0;

  // Khởi tạo RAM 2 Cổng nội bộ
  RAM_2Port #(
    .WIDTH(WIDTH),
    .DEPTH(DEPTH)
  ) RAM_Inst (
    .i_Wr_Clk(i_Clk),
    .i_Wr_Addr(r_Wr_Addr),
    .i_Wr_DV(i_Wr_DV && !o_Full), // Ngăn ghi khi Full
    .i_Wr_Data(i_Wr_Data),
    .i_Rd_Clk(i_Clk),
    .i_Rd_Addr(r_Rd_Addr),
    .i_Rd_En(i_Rd_En && !o_Empty), // Ngăn đọc khi Empty
    .o_Rd_DV(o_Rd_DV),
    .o_Rd_Data(o_Rd_Data)
  );

  // Quản lý con trỏ và bộ đếm r_Count
  always @(posedge i_Clk or negedge i_Rst_L)
  begin
    if (!i_Rst_L)
    begin
      r_Wr_Addr <= 0;
      r_Rd_Addr <= 0;
      r_Count   <= 0;
    end
    else
    begin
      // Tăng địa chỉ Ghi
      if (i_Wr_DV && !o_Full)
      begin
        r_Wr_Addr <= (r_Wr_Addr == DEPTH-1) ? 0 : r_Wr_Addr + 1;
      end

      // Tăng địa chỉ Đọc
      if (i_Rd_En && !o_Empty)
      begin
        r_Rd_Addr <= (r_Rd_Addr == DEPTH-1) ? 0 : r_Rd_Addr + 1;
      end

      // Cập nhật biến đếm r_Count
      if ((i_Wr_DV && !o_Full) && !(i_Rd_En && !o_Empty))
        r_Count <= r_Count + 1;
      else if (!(i_Wr_DV && !o_Full) && (i_Rd_En && !o_Empty))
        r_Count <= r_Count - 1;
    end
  end

  // Logic tổ hợp gán cờ báo hiệu
  assign o_Full    = (r_Count == DEPTH);
  assign o_Empty   = (r_Count == 0);
  assign o_AF_Flag = (r_Count >= i_AF_Level);
  assign o_AE_Flag = (r_Count <= i_AE_Level);

endmodule
```

#### VHDL:
```vhdl
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity FIFO_Single_Clock is
  generic (
    WIDTH : integer := 8;
    DEPTH : integer := 256
  );
  port (
    i_Clk      : in  std_logic;
    i_Rst_L    : in  std_logic;
    
    -- Ghi
    i_Wr_DV    : in  std_logic;
    i_Wr_Data  : in  std_logic_vector(WIDTH-1 downto 0);
    i_AF_Level : in  integer range 0 to DEPTH;
    o_AF_Flag  : out std_logic;
    o_Full     : out std_logic;
    
    -- Đọc
    i_Rd_En    : in  std_logic;
    o_Rd_DV    : out std_logic;
    o_Rd_Data  : out std_logic_vector(WIDTH-1 downto 0);
    i_AE_Level : in  integer range 0 to DEPTH;
    o_AE_Flag  : out std_logic;
    o_Empty    : out std_logic
  );
end entity FIFO_Single_Clock;

architecture RTL of FIFO_Single_Clock is
  -- Số bit địa chỉ đủ để đánh số DEPTH ô nhớ (trần của log2), tính lúc elaborate
  function clog2(n : integer) return integer is
    variable r : integer := 0;
    variable v : integer := 1;
  begin
    while v < n loop
      v := v * 2;
      r := r + 1;
    end loop;
    return r;
  end function;
  constant ADDR_W : integer := clog2(DEPTH);

  signal r_Wr_Addr : integer range 0 to DEPTH-1 := 0;
  signal r_Rd_Addr : integer range 0 to DEPTH-1 := 0;
  signal r_Count   : integer range 0 to DEPTH   := 0;

  -- Địa chỉ dạng vector để nối vào RAM_2Port (port map không nhận biểu thức ở VHDL-93)
  signal w_Wr_Addr : std_logic_vector(ADDR_W-1 downto 0);
  signal w_Rd_Addr : std_logic_vector(ADDR_W-1 downto 0);

  signal w_Full    : std_logic;
  signal w_Empty   : std_logic;
  signal w_Wr_En   : std_logic;
  signal w_Rd_En   : std_logic;
begin

  w_Wr_Addr <= std_logic_vector(to_unsigned(r_Wr_Addr, ADDR_W));
  w_Rd_Addr <= std_logic_vector(to_unsigned(r_Rd_Addr, ADDR_W));

  w_Full  <= '1' when r_Count = DEPTH else '0';
  w_Empty <= '1' when r_Count = 0 else '0';
  
  w_Wr_En <= i_Wr_DV and not w_Full;
  w_Rd_En <= i_Rd_En and not w_Empty;

  -- Instantiation RAM_2Port
  RAM_Inst: entity work.RAM_2Port
    generic map (
      WIDTH => WIDTH,
      DEPTH => DEPTH
    )
    port map (
      i_Wr_Clk  => i_Clk,
      i_Wr_Addr => w_Wr_Addr,
      i_Wr_DV   => w_Wr_En,
      i_Wr_Data => i_Wr_Data,
      i_Rd_Clk  => i_Clk,
      i_Rd_Addr => w_Rd_Addr,
      i_Rd_En   => w_Rd_En,
      o_Rd_DV   => o_Rd_DV,
      o_Rd_Data => o_Rd_Data
    );

  process (i_Clk, i_Rst_L)
  begin
    if i_Rst_L = '0' then
      r_Wr_Addr <= 0;
      r_Rd_Addr <= 0;
      r_Count   <= 0;
    elsif rising_edge(i_Clk) then
      if w_Wr_En = '1' then
        if r_Wr_Addr = DEPTH-1 then
          r_Wr_Addr <= 0;
        else
          r_Wr_Addr <= r_Wr_Addr + 1;
        end if;
      end if;

      if w_Rd_En = '1' then
        if r_Rd_Addr = DEPTH-1 then
          r_Rd_Addr <= 0;
        else
          r_Rd_Addr <= r_Rd_Addr + 1;
        end if;
      end if;

      if w_Wr_En = '1' and w_Rd_En = '0' then
        r_Count <= r_Count + 1;
      elsif w_Wr_En = '0' and w_Rd_En = '1' then
        r_Count <= r_Count - 1;
      end if;
    end if;
  end process;

  o_Full    <= w_Full;
  o_Empty   <= w_Empty;
  o_AF_Flag <= '1' when r_Count >= i_AF_Level else '0';
  o_AE_Flag <= '1' when r_Count <= i_AE_Level else '0';

end architecture RTL;
```

Hai thay đổi so với bản dịch thẳng từ sách, cả hai đều vì GHDL từ chối biên dịch bản gốc. Thứ nhất, không được đặt biểu thức `std_logic_vector(to_unsigned(r_Wr_Addr, 8))` ngay trong `port map` — VHDL-93 đòi actual phải là tên tín hiệu hoặc biểu thức tĩnh (lỗi `actual expression must be globally static`), nên phải gán ra hai tín hiệu `w_Wr_Addr`, `w_Rd_Addr` trước rồi mới nối. Thứ hai, số `8` cứng trong `to_unsigned(..., 8)` chỉ đúng khi `DEPTH = 256`; hàm `clog2` tính số bit địa chỉ từ `DEPTH` lúc elaborate, và nhờ cổng địa chỉ của `RAM_2Port` không ghi độ rộng, mọi `DEPTH` đều nối khớp — đã thử với 12 và 256.

Khác với sách, bản này tự chặn ghi khi đầy và đọc khi trống (`w_Wr_En`, `w_Rd_En`) thay vì tin người dùng tuân thủ hai quy tắc vàng; mô phỏng ghi thêm lúc `o_Full = '1'` thấy dữ liệu không bị đè. Đổi lại, sách giữ `o_Rd_Data` cho tới lần đọc sau, còn bản này — vì RAM đọc mỗi cạnh — chỉ bảo đảm `o_Rd_Data` trong chu kỳ `o_Rd_DV = '1'`.

---

## 6. Tóm Tắt Chương (Summary)

Trong chương này, bạn đã học cách xây dựng các module cấu trúc cơ bản vô cùng quan trọng trong thiết kế phần cứng FPGA:

1. **Bộ chọn (Mux) và Bộ giải chọn (Demux):** Điều hướng và chuyển mạch tín hiệu dữ liệu.
2. **Thanh ghi dịch (Shift Register):** Tạo độ trễ tín hiệu, chuyển đổi nối tiếp/song song và tạo chuỗi giả ngẫu nhiên bằng **LFSR**.
3. **RAM 2 Cổng (Dual-Port RAM):** Lưu trữ dữ liệu truy cập ngẫu nhiên sử dụng Flip-flop hoặc Block RAM (BRAM).
4. **Bộ đệm FIFO:** Xếp hàng dữ liệu vào trước ra trước, quản lý an toàn bằng hai quy tắc vàng và các cờ báo hiệu `Full`, `Empty`, `Almost Full`, `Almost Empty`.

Với các viên gạch xây dựng nền tảng này, bạn đã sẵn sàng kết nối chúng lại để tạo nên những hệ thống phần cứng quy mô lớn và chuyên nghiệp hơn!

Thêm vào đó, từ góc độ thực hành với GHDL và bo QMTech:

* **Mọi mã VHDL trong chương đã chạy qua GHDL**: chuỗi LFSR 3 bit khớp bảng 6-5, LFSR 22 bit đúng 4.194.303 chu kỳ, bộ đếm lật đúng ngưỡng, FIFO khớp sáu hàng bảng cờ và trả dữ liệu đúng thứ tự.
* **Thanh ghi LFSR phải có giá trị khởi tạo**, nếu không mô phỏng kẹt ở `'U'` — sách thiếu ở bản 22 bit.
* **`port map` ở VHDL-93 không nhận biểu thức** — chuyển đổi kiểu phải gán ra tín hiệu trước; bản FIFO trong sách không biên dịch được vì vậy.
* **Code FIFO trong sách không khớp bảng cờ của sách** — bản ở đây theo bảng.
* **Dự án #5 cần 4 LED + 2 nút**, bo lõi QMTech chỉ có 1 + 1: chạy mô phỏng, hoặc rút gọn còn một LED. Ở 50 MHz LFSR 22 bit lật đèn ~6 Hz, bộ đếm cần `COUNT_LIMIT => 12500000` cho 0,25 giây.
* **RAM nhỏ trên Xilinx thành distributed RAM (LUT), RAM lớn thành Block RAM** — với điều kiện đọc đồng bộ.
