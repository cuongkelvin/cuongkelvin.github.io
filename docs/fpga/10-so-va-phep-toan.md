# CHƯƠNG 10: BIỂU DIỄN SỐ VÀ PHÉP TOÁN SỐ HỌC TRÊN FPGA (NUMBERS AND MATH)

## 1. Giới Thiệu (Introduction)

FPGA nổi tiếng với hai ưu thế lớn: **tốc độ tính toán số học nhanh** và **khả năng thực thi song song**. Khi kết hợp hai yếu tố này lại, FPGA có thể vượt xa hiệu năng của các vi điều khiển (CPU) truyền thống trong các tác vụ xử lý tín hiệu số (DSP), lọc tín hiệu, và xử lý ảnh.

Tuy nhiên, trong ngôn ngữ mô tả phần cứng như Verilog hay VHDL, việc xử lý số học chứa đựng rất nhiều **cạm bẫy (pitfalls)**. Không giống như lập trình phần mềm trên CPU (nơi trình biên dịch tự động quản lý kiểu dữ liệu và ngăn xếp), trên FPGA, bạn phải quản lý trực tiếp từng bit, từng phép dịch chuyển và từng kiểu dữ liệu số. 

Chương này sẽ cung cấp cho bạn bức tranh toàn cảnh và **6 Quy tắc vàng** để làm chủ các phép toán số học (Cộng, Trừ, Nhân, Chia, Số dấu chấm tĩnh) trên FPGA một cách an toàn và tối ưu tài nguyên nhất. Sách chứng minh từng quy tắc bằng một testbench 24 ví dụ; ở blog này toàn bộ 24 ví dụ đó đã chạy lại bằng GHDL, kết quả in ngay dưới mỗi nhóm.

---

## 2. Kiểu Dữ Liệu Số (Numerical Data Types)

Giống như bất kỳ ngôn ngữ lập trình nào, bạn có thể biểu diễn số dưới dạng số nguyên (integer) hoặc số có phần thập phân (floating-point / fixed-point). Việc chọn đúng kiểu dữ liệu và **độ rộng bit (bit width)** cho tín hiệu là cực kỳ quan trọng:

* Nếu chọn độ rộng bit quá nhỏ: Dữ liệu sẽ bị tràn (wraparound) hoặc bị cắt gọt (truncation), dẫn đến kết quả sai lệch nghiêm trọng.
* Nếu chọn độ rộng bit quá lớn: FPGA sẽ tiêu tốn những tài nguyên LUT, Flip-flop và DSP quý giá một cách vô ích.

Trong C, các kiểu dữ liệu bị cố định ở mức 8, 16, 32 hay 64 bit (`uint8_t`, `uint16_t`, `uint32_t`). Ngược lại, Verilog và VHDL cho phép bạn khai báo tín hiệu với **độ rộng bit tùy ý tuyệt đối** (chẳng hạn 3-bit, 9-bit, 15-bit hay 23-bit).

### Biểu Diễn Số Có Dấu vs. Số Không Dấu (Signed vs. Unsigned)

* **Số không dấu (Unsigned):** Tất cả các bit được dùng để biểu diễn giá trị dương (hoặc 0). Dùng cho các bộ đếm thời gian, địa chỉ bộ nhớ, chu kỳ xung nhịp.
* **Số có dấu (Signed):** Bit có giá trị cao nhất (Most Significant Bit - MSB) được dùng làm **bit dấu (Sign bit)**:
  * Bit MSB = `0`: Số dương.
  * Bit MSB = `1`: Số âm.

Trong Verilog và VHDL, mặc định các tín hiệu khai báo dạng `reg [2:0]` hay `std_logic_vector(2 downto 0)` đều được hiểu là **Unsigned**. Để khai báo số Signed:

* **Verilog:** `reg signed [2:0] counter;`
* **VHDL:** `signal counter : signed(2 downto 0);` *(cần khai báo `use ieee.numeric_std.all;` ở đầu tệp)*. Sách dặn thêm: đừng dùng gói `std_logic_arith` — không phải chuẩn IEEE, dễ sai hơn `numeric_std`. (Bộ mã AES của công ty mà blog này từng xem dùng đúng gói đó.)

#### Bảng So Sánh Giá Trị 3-Bit Unsigned vs. Signed:

| Chuỗi Bit | Giá trị Decimal Unsigned | Giá trị Decimal Signed |
| :---: | :---: | :---: |
| `000` | 0 | 0 |
| `001` | 1 | 1 |
| `010` | 2 | 2 |
| `011` | 3 | 3 |
| `100` | 4 | **-4** |
| `101` | 5 | **-3** |
| `110` | 6 | **-2** |
| `111` | 7 | **-1** |

* **Dải giá trị Unsigned (N bit):** `0 → 2^N − 1`. Với 3 bit: `0 → 7`.
* **Dải giá trị Signed (N bit):** `−2^(N−1) → 2^(N−1) − 1`. Với 3 bit: `−4 → 3`.

Khai `signed` là đánh đổi: mất bốn số dương 4–7, được bốn số âm −1…−4. Dữ liệu vẫn là 3 bit như cũ, chỉ cách đọc khác đi.

### Phép Lấy Bù 2 (Two's Complement)
Để tìm giá trị thập phân âm của một chuỗi bit Signed (hoặc ngược lại):

1. **Đảo ngược tất cả các bit** (`0` thành `1`, `1` thành `0`).
2. **Cộng thêm 1** vào kết quả.
3. Thêm dấu âm (`-`).

*Ví dụ:* Chuỗi bit Signed `101` (bit MSB = 1 -> Số âm).

* Đảo bit: `101` → `010`.
* Cộng 1: `010 + 1 = 011` (bằng 3 thập phân).
* Giá trị biểu diễn là **−3**.

Chiều ngược lại cũng vậy: muốn ghi −1 bằng 3 bit, lấy 1 = `001`, đảo thành `110`, cộng 1 thành `111` — đúng hàng cuối bảng trên. Sách còn mẹo không cần cộng: đi từ bit thấp nhất sang trái, giữ nguyên tới hết số 1 đầu tiên, đảo toàn bộ phần còn lại. Ví dụ `100010100` → giữ `100` cuối, đảo `100010` thành `011101` → `011101100` = 236, nên số gốc là −236.

*Lưu ý:* FPGA không thực sự phải chạy phép đảo bit + 1 này để hiểu số âm. Bản chất phần cứng chỉ xử lý các bit 0 và 1, việc giải thích chuỗi bit là Signed hay Unsigned do trình tổng hợp quản lý.

### Quy Định Kích Thước Tín Hiệu (Sizing Signals Appropriately)

#### Bảng Định Kích Thước N-bit Tổng Hợp:

| Độ rộng Bit (N) | Kiểu | Giá trị Min | Bit Min | Giá trị Max | Bit Max |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **2** | Unsigned<br>Signed | 0<br>-2 | `00`<br>`10` | 3<br>1 | `11`<br>`01` |
| **3** | Unsigned<br>Signed | 0<br>-4 | `000`<br>`100` | 7<br>3 | `111`<br>`011` |
| **4** | Unsigned<br>Signed | 0<br>-8 | `0000`<br>`1000` | 15<br>7 | `1111`<br>`0111` |
| **5** | Unsigned<br>Signed | 0<br>-16 | `00000`<br>`10000` | 31<br>15 | `11111`<br>`01111` |
| **6** | Unsigned<br>Signed | 0<br>-32 | `000000`<br>`100000` | 63<br>31 | `111111`<br>`011111` |
| **7** | Unsigned<br>Signed | 0<br>-64 | `0000000`<br>`1000000` | 127<br>63 | `1111111`<br>`0111111` |
| **8** | Unsigned<br>Signed | 0<br>-128 | `00000000`<br>`10000000` | 255<br>127 | `11111111`<br>`01111111` |

Quá nhỏ thì **quấn vòng (wraparound)**: bộ đếm 3 bit unsigned ở 7 tăng thêm 1 sẽ về 0, không lên 8 — chương 6 đã thấy với `integer range` GHDL dừng hẳn, còn `unsigned` thì lặng lẽ quay về 0. Quá lớn thì tốn tài nguyên, nhưng sách nói thà lớn còn hơn nhỏ; công cụ tổng hợp thông minh còn tự cắt các bit cao không bao giờ dùng và báo kiểu `Pruning register counter` — thấy cảnh báo đó là gợi ý nên khai lại cho vừa.

#### Mẹo Định Kích Thước Động (Dynamic Sizing):
Thay vì cố định cứng số bit (ví dụ `[4:0]` cho bộ nhớ 32 ô), hãy để độ rộng đi theo tham số: đổi `DEPTH` từ 32 lên 1.024 thì mã vẫn đúng, còn khai cứng 8 bit (tối đa 255) thì gãy. Chương 6 đã dùng đúng cách này cho FIFO:

* **Verilog:** `reg [$clog2(DEPTH)-1:0] r_Index;`
* **VHDL:** `signal r_Index : integer range 0 to DEPTH-1;`

### Chuyển Đổi Kiểu Dữ Liệu Trong VHDL (Converting Between Types)

Vì VHDL là ngôn ngữ định kiểu cực kỳ nghiêm ngặt (strongly typed), bạn phải chuyển đổi kiểu dữ liệu thủ công thông qua thư viện `numeric_std`:

1. **Unsigned/Signed → Integer:** chỉ cần `to_integer()`, kích cỡ và dấu đã biết từ đầu vào.
   * `out_int <= to_integer(in_unsigned);`
   * `out_int <= to_integer(in_signed);`
2. **Integer → Unsigned/Signed/std_logic_vector:** phải cho biết độ rộng đích; lấy bằng thuộc tính `'length` của tín hiệu đích thay vì gõ số, để đổi độ rộng không phải sửa chỗ chuyển.
   * `out_un  <= to_unsigned(in_int, out_un'length);`
   * `out_sg  <= to_signed(in_int, out_sg'length);`
   * `out_slv <= std_logic_vector(to_unsigned(in_int, out_slv'length));` — số dương
   * `out_slv <= std_logic_vector(to_signed(in_int, out_slv'length));` — số âm
3. **std_logic_vector → Unsigned/Signed/Integer:** sang `unsigned`/`signed` chỉ là ép kiểu; sang `integer` phải nói rõ coi chuỗi bit là có dấu hay không trước.
   * `out_un  <= unsigned(in_slv);`
   * `out_sg  <= signed(in_slv);`
   * `out_int <= to_integer(unsigned(in_slv));`
   * `out_int <= to_integer(signed(in_slv));`

Verilog không cần những bước này vì định kiểu lỏng — tiện lúc viết, nhưng cũng vì thế mà nó để lọt lỗi mà VHDL sẽ chặn, như các ví dụ dưới đây cho thấy.

---

## 3. Thực Hiện Các Phép Toán Số Học (Performing Math Operations)

Cách tốt nhất để hiểu các quy tắc là xem ví dụ. Sách dựng một testbench tên `Math_Examples` chạy hàng chục phép tính, cho thấy làm đúng ra sao và làm sai thì hỏng ở đâu. Sách cũng nhắc: với mã có toán, testbench là công cụ cực mạnh, hãy nhét vào đó cả giá trị nhỏ nhất và lớn nhất để ép thiết kế lộ lỗi.

### Khung Testbench `Math_Examples`

Dưới đây là bản VHDL đầy đủ, đã chạy qua GHDL ở chuẩn 93. Sách dùng hai thứ của VHDL-2008 — `to_string` và `finish` — nên bản này thay bằng `integer'image` (viết thêm một hàm `str` cho số thực) và `wait;`. Các ví dụ đặt ngay trong process; đọc mã trước, giải thích ở từng mục sau:

```vhdl
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity Math_Examples is
end entity Math_Examples;

architecture test of Math_Examples is
  -- Ba bản str() cho ba kiểu: VHDL-93 không có to_string, dùng 'image
  function str(val : in unsigned) return string is
  begin
    return integer'image(to_integer(val));
  end function str;
  function str(val : in signed) return string is
  begin
    return integer'image(to_integer(val));
  end function str;
  function str(val : in real) return string is
    variable n : integer := integer(val * 1000.0);  -- in 3 chữ số thập phân
    variable s : string(1 to 1) := " ";
  begin
    if n < 0 then s := "-"; n := -n; end if;
    return s & integer'image(n / 1000) & "." & integer'image((n mod 1000) / 100)
           & integer'image((n mod 100) / 10) & integer'image(n mod 10);
  end function str;
begin
  process is
    variable i1_u4, i2_u4, o_u4 : unsigned(3 downto 0);
    variable i1_u5, i2_u5, o_u5 : unsigned(4 downto 0);
    variable i1_s4, i2_s4, o_s4 : signed(3 downto 0);
    variable i1_s5, i2_s5, o_s5 : signed(4 downto 0);
    variable i1_u6, i2_u6, o_u6 : unsigned(5 downto 0);
    variable i1_u8, i2_u8, o_u8 : unsigned(7 downto 0);
    variable i1_s8, i2_s8, o_s8 : signed(7 downto 0);
    variable real1, real2, real3 : real;
  begin
    -- Unsigned + Unsigned = Unsigned (vi phạm quy tắc 1)
    i1_u4 := "1001"; i2_u4 := "1011"; o_u4 := i1_u4 + i2_u4;
    report "Ex01: " & str(i1_u4) & " + " & str(i2_u4) & " = " & str(o_u4);
    i1_s4 := "1001"; i2_s4 := "1011"; o_s4 := i1_s4 + i2_s4;
    report "Ex02: " & str(i1_s4) & " + " & str(i2_s4) & " = " & str(o_s4);
    -- sửa: mở rộng trước khi cộng
    i1_u4 := "1001"; i2_u4 := "1011";
    i1_u5 := resize(i1_u4, i1_u5'length); i2_u5 := resize(i2_u4, i2_u5'length); o_u5 := i1_u5 + i2_u5;
    report "Ex03: " & str(i1_u5) & " + " & str(i2_u5) & " = " & str(o_u5);
    i1_s4 := "1001"; i2_s4 := "1011";
    i1_s5 := resize(i1_s4, i1_s5'length); i2_s5 := resize(i2_s4, i2_s5'length); o_s5 := i1_s5 + i2_s5;
    report "Ex04: " & str(i1_s5) & " + " & str(i2_s5) & " = " & str(o_s5);
    -- trừ
    i1_u4 := "1001"; i2_u4 := "1011";
    i1_u5 := resize(i1_u4, i1_u5'length); i2_u5 := resize(i2_u4, i2_u5'length); o_u5 := i1_u5 - i2_u5;
    report "Ex05: " & str(i1_u5) & " - " & str(i2_u5) & " = " & str(o_u5);
    i1_s5 := signed(resize(i1_u4, i1_s5'length)); i2_s5 := signed(resize(i2_u4, i2_s5'length)); o_s5 := i1_s5 - i2_s5;
    report "Ex06: " & str(i1_s5) & " - " & str(i2_s5) & " = " & str(o_s5);
    -- nhân (Ex07/08 vi phạm quy tắc 4, xem đoạn riêng bên dưới)
    i1_u4 := "1001"; i2_u4 := "1011"; o_u8 := i1_u4 * i2_u4;
    report "Ex09: " & str(i1_u4) & " * " & str(i2_u4) & " = " & str(o_u8);
    i1_s4 := "1000"; i2_s4 := "0111"; o_s8 := i1_s4 * i2_s4;
    report "Ex10: " & str(i1_s4) & " * " & str(i2_s4) & " = " & str(o_s8);
    -- nhân với luỹ thừa 2 bằng dịch trái
    i1_u8 := to_unsigned(3, i1_u8'length);
    o_u8 := shift_left(i1_u8, 1); report "Ex11: " & str(i1_u8) & " * 2 = " & str(o_u8);
    o_u8 := shift_left(i1_u8, 2); report "Ex12: " & str(i1_u8) & " * 4 = " & str(o_u8);
    o_u8 := shift_left(i1_u8, 4); report "Ex13: " & str(i1_u8) & " * 16 = " & str(o_u8);
    -- chia cho luỹ thừa 2 bằng dịch phải
    i1_u8 := to_unsigned(128, i1_u8'length);
    o_u8 := shift_right(i1_u8, 1); report "Ex14: " & str(i1_u8) & " / 2 = " & str(o_u8);
    o_u8 := shift_right(i1_u8, 2); report "Ex15: " & str(i1_u8) & " / 4 = " & str(o_u8);
    o_u8 := shift_right(i1_u8, 4); report "Ex16: " & str(i1_u8) & " / 16 = " & str(o_u8);
    i1_u8 := to_unsigned(15, i1_u8'length);
    o_u8 := shift_right(i1_u8, 1); report "Ex17: " & str(i1_u8) & " / 2 = " & str(o_u8);
    o_u8 := shift_right(i1_u8, 2); report "Ex18: " & str(i1_u8) & " / 4 = " & str(o_u8);
    o_u8 := shift_right(i1_u8, 3); report "Ex19: " & str(i1_u8) & " / 8 = " & str(o_u8);
    -- dấu chấm tĩnh: U3.1 + U4.0 (vi phạm quy tắc 5)
    i1_u4 := "0011"; i2_u4 := "0011";
    i1_u5 := resize(i1_u4, i1_u5'length); i2_u5 := resize(i2_u4, i2_u5'length); o_u5 := i1_u5 + i2_u5;
    real1 := real(to_integer(i1_u5)) / 2.0; real2 := real(to_integer(i2_u5)); real3 := real(to_integer(o_u5)) / 2.0;
    report "Ex20: " & str(real1) & " + " & str(real2) & " = " & str(real3);
    -- sửa 1: cắt U3.1 -> U4.0 (mất phần lẻ)
    i1_u4 := "0011"; i2_u4 := "0011"; i1_u4 := shift_right(i1_u4, 1);
    i1_u5 := resize(i1_u4, i1_u5'length); i2_u5 := resize(i2_u4, i2_u5'length); o_u5 := i1_u5 + i2_u5;
    real1 := real(to_integer(i1_u5)); real2 := real(to_integer(i2_u5)); real3 := real(to_integer(o_u5));
    report "Ex21: " & str(real1) & " + " & str(real2) & " = " & str(real3);
    -- sửa 2: mở rộng U4.0 -> U4.1 (giữ đủ)
    i1_u4 := "0011"; i2_u4 := "0011";
    i1_u6 := resize(i1_u4, i1_u6'length); i2_u6 := resize(i2_u4, i2_u6'length); i2_u6 := shift_left(i2_u6, 1);
    o_u6 := i1_u6 + i2_u6;
    real1 := real(to_integer(i1_u6)) / 2.0; real2 := real(to_integer(i2_u6)) / 2.0; real3 := real(to_integer(o_u6)) / 2.0;
    report "Ex22: " & str(real1) & " + " & str(real2) & " = " & str(real3);
    -- nhân dấu chấm tĩnh
    i1_u4 := "0101"; i2_u4 := "1011"; o_u8 := i1_u4 * i2_u4;
    real1 := real(to_integer(i1_u4)) / 4.0; real2 := real(to_integer(i2_u4)) / 2.0; real3 := real(to_integer(o_u8)) / 8.0;
    report "Ex23: " & str(real1) & " * " & str(real2) & " = " & str(real3);
    i1_s4 := "0110"; i2_s4 := "1010"; o_s8 := i1_s4 * i2_s4;
    real1 := real(to_integer(i1_s4)) / 4.0; real2 := real(to_integer(i2_s4)); real3 := real(to_integer(o_s8)) / 4.0;
    report "Ex24: " & str(real1) & " * " & str(real2) & " = " & str(real3);
    wait;
  end process;
end test;
```

Hai điều cần để ý trong khung này. Thứ nhất, tên tín hiệu mang nghĩa: tiền tố `i`/`o` là đầu vào/đầu ra của phép tính, hậu tố `_u4`/`_s5` là unsigned 4 bit / signed 5 bit — đặt tên như vậy thì không phải lật lên khai báo để nhớ kiểu và độ rộng. Thứ hai, mọi thứ là **`variable`** gán bằng `:=` chứ không phải `signal`: chương 4 đã nói `signal` chỉ cập nhật khi process tạm dừng, nên gán rồi `report` ngay sẽ in giá trị cũ; `variable` có hiệu lực tức thì. Sách tách hẳn một khung về chuyện này (*blocking vs non-blocking*): Verilog gán `<=` rồi `$display` ngay sẽ in giá trị cũ, phải dùng `=` hoặc chèn `#1`; trong thiết kế thì ngược lại, luôn dùng gán không chặn `<=` cho flip-flop, chỉ testbench mới cần gán chặn để in đúng lúc.

Ba hàm `str` cùng tên nhưng khác kiểu tham số là **nạp chồng (overloading)**: VHDL chọn bản theo kiểu đưa vào. Cách này dùng được cả cho toán tử `+`, `−`, nhưng sách khuyên đừng.

### A. Phép Cộng (Addition)

Cộng nhị phân y như cộng tay ở tiểu học, từ phải sang trái, có nhớ:

```text
    0010           1001
  + 1000         + 1011
  ------         ------
   01010          10100
```

Kết quả của hai số 4 bit rộng 5 bit. Ví dụ bên phải cho thấy vì sao bit thứ năm không bỏ được: `1001 + 1011` ra `10100`; nếu đầu ra chỉ 4 bit thì còn `0100` — sai hẳn.

> **QUY TẮC VÀNG #1 (Phép Cộng):**
> Khi thực hiện phép cộng, độ rộng bit của kết quả đầu ra phải **lớn hơn ít nhất 1 bit** so với đầu vào lớn nhất (trước khi mở rộng dấu). Sau khi mở rộng dấu (Sign extension), độ rộng bit của tất cả đầu vào và đầu ra phải khớp nhau.

Sách cố ý chưa nói các chuỗi bit trên là có dấu hay không — vì **phép cộng làm y hệt nhau** bất kể cách đọc, miễn kích cỡ đúng. Nhưng xem lại ví dụ bên trái với kiểu signed: `0010` là 2, `1000` là −8, tổng phải là −6, mà `01010` đọc ra 10. Lỗi ở chỗ chưa **mở rộng dấu**: tăng số bit mà giữ nguyên giá trị và dấu, bằng cách lặp lại bit cao nhất. `1000` thành `11000`, `0010` thành `00010`; cộng lại ra `11010` = −6, đúng.

#### Mở Rộng Dấu (Sign Extension):

* **Với Unsigned:** Thêm bit `0` vào vị trí MSB (`1000` → `01000`).
* **Với Signed:** Lặp lại bit MSB hiện tại (`1000` → `11000`; `0010` → `00010`).

Verilog tự mở rộng dấu khi bạn gán tổng hai số 4 bit vào đầu ra 5 bit. VHDL định kiểu chặt, đầu vào và đầu ra của `+` phải **cùng độ rộng**, nên bạn phải tự mở rộng bằng `resize()` trước — dài dòng hơn, nhưng mỗi bước đều được kiểm, ít chỗ sai hơn về sau. Đó là bốn ví dụ đầu của testbench; kết quả GHDL:

```text
Ex01: 9 + 11 = 4       -- 4 bit + 4 bit vào 4 bit: mất bit 16, sai
Ex02: -7 + -5 = 4      -- signed cũng sai y vậy
Ex03: 9 + 11 = 20      -- resize lên 5 bit: đúng
Ex04: -7 + -5 = -12    -- resize giữ dấu: đúng
```

Ex01 và Ex02 vi phạm quy tắc 1: `1001 + 1011` cho 4 nghĩa là bit nặng 16 đã rơi (4 + 16 = 20). Ex03 và Ex04 sửa bằng đầu ra 5 bit; VHDL phải `resize(i1_u4, i1_u5'length)` cho cả hai đầu vào — `'length` thay cho con số 5 để mã không gãy khi đổi độ rộng.

> **QUY TẮC VÀNG #2:**
> Luôn luôn **đồng nhất kiểu dữ liệu** (Signed với Signed, Unsigned với Unsigned) giữa các đầu vào và đầu ra. Không bao giờ trộn lẫn Signed và Unsigned trong cùng một phép toán.

VHDL ép bạn tuân thủ: viết `o_u4 := i1_u4 + i2_s4;` (unsigned cộng signed) thì GHDL từ chối ngay lúc biên dịch với `no function declarations for operator "+"` — không có phép `+` nào nhận cặp kiểu đó. Verilog thì cho qua, lặng lẽ coi đầu vào signed là unsigned và có thể cho đáp số sai; viết Verilog phải tự canh.

### B. Phép Trừ (Subtraction)

Trừ chính là cộng với số âm: `2 − 8` là `2 + (−8)`, nên mọi điều trên vẫn đúng. Có một bẫy riêng: trừ hai số unsigned mà kết quả âm thì không có chỗ chứa dấu.

> **QUY TẮC VÀNG #3:**
> Khi thực hiện phép trừ, **luôn luôn sử dụng kiểu dữ liệu Signed** cho cả đầu vào và đầu ra (kể cả khi bạn nghĩ rằng kết quả sẽ không bao giờ ra số âm).

Quy tắc 1 cũng áp cho phép trừ: đầu ra rộng hơn ít nhất 1 bit, mở rộng dấu trước. Hai ví dụ trong testbench:

```text
Ex05: 9 - 11 = 30      -- unsigned trừ unsigned: -2 không chứa được, quấn thành 30
Ex06: 9 - 11 = -2      -- đổi sang signed 5 bit: đúng
```

Ex06 trong VHDL có một bước đáng xem: `i1_s5 := signed(resize(i1_u4, i1_s5'length));` — `resize` mở rộng trước (bit cao nhất chắc chắn là 0), rồi mới ép sang `signed`; thứ tự đó bảo đảm giá trị không đổi khi đổi kiểu. Verilog chỉ cần gán thẳng 4 bit unsigned vào 5 bit signed.

### C. Phép Nhân (Multiplication)

Nhân là cộng lặp lại (4 × 3 = 4 + 4 + 4). Việc đầu tiên là định cỡ đầu ra:

> **QUY TẮC VÀNG #4:**
> Khi thực hiện phép nhân, độ rộng bit của kết quả đầu ra phải **bằng hoặc lớn hơn tổng độ rộng bit của các đầu vào** (trước khi mở rộng dấu).
> *Ví dụ:* Nhân tín hiệu 4 bit với tín hiệu 4 bit → đầu ra ít nhất **8 bit**.

Nhân tay `111 × 11` (7 × 3) ra `10101` = 21, đúng 3 + 2 = 5 bit. Đọc hai số đó là signed thì là (−1) × (−1), phải ra +1, nhưng `10101` signed là −11 — lại chuyện chưa mở rộng dấu: mở cả hai thành `11111` rồi nhân, kết quả `000000001`, cắt còn 5 bit là `00001` = 1. Khác với cộng trừ, với phép nhân **công cụ tự lo mở rộng dấu**, bạn chỉ cần khai đúng cỡ đầu ra.

```text
Ex07: 9 * 11 = 3       -- Verilog: 4 bit × 4 bit nhét vào 4 bit, sai (99 mất bit cao)
Ex08: -8 * 7 = -8      -- Verilog: sai
Ex09: 9 * 11 = 99      -- đầu ra 8 bit: đúng
Ex10: -8 * 7 = -56     -- đúng
```

Hai dòng đầu là kết quả Verilog trong sách. VHDL **không cho** viết Ex07/Ex08: `numeric_std` trả về tích rộng bằng tổng hai độ rộng, gán vào biến 4 bit là lệch cỡ. ModelSim của sách chặn ngay lúc biên dịch (`Length of expected is 4; length of actual is 8`); GHDL 0.37 trên máy này để biên dịch qua rồi **dừng lúc chạy** với `bound check failure` ở đúng dòng đó. Cách nào thì bạn cũng không nhận được đáp số sai mà không biết — còn Verilog thì có.

#### Phép Nhân Với Lũy Thừa Của 2 (Shift Left):

Nhân với `2^N` chỉ cần **dịch trái N bit**, không cần mạch nhân: `0011` (3) dịch trái 2 thành `1100` (12) = 3 × 4. Đúng cho cả signed lẫn unsigned.

* **Verilog:** `o_u8 = i_u8 << 2;`
* **VHDL:** `o_u8 := shift_left(i1_u8, 2);`

```text
Ex11: 3 * 2 = 6
Ex12: 3 * 4 = 12
Ex13: 3 * 16 = 48
```

Sách nói thêm: không nhất thiết phải tự viết dịch bit — viết `* 4` với hằng số, công cụ tổng hợp thường đủ khôn để tự đổi thành dịch trái.

### D. Phép Chia (Division)

Chia không đơn giản như ba phép trên: có dư, có phần lẻ, và ngốn tài nguyên, nhất là ở xung nhịp cao. Lời khuyên chung của sách: **tránh được thì tránh**.

> **Câu chuyện "Phép chia triệu đô" (The Million-Dollar Divide):** Tác giả kể lại sự cố dự án khi phải thêm một phép chia vào chip FPGA thế hệ cũ đã đầy tài nguyên. Để nhét vừa phép chia này, công ty buộc phải nâng cấp lên dòng FPGA đắt tiền hơn trên hàng loạt sản phẩm, làm tiêu tốn thêm hơn 1 triệu USD chi phí phần cứng!

Nếu buộc phải chia, có ba cách giảm giá:

#### 1. Chia cho lũy thừa của 2 bằng dịch phải

Dịch phải N bit là chia cho `2^N`. Kết quả **làm tròn xuống**: phần lẻ bị bỏ.

* **Verilog:** `o_u8 = i_u8 >> 1;`
* **VHDL:** `o_u8 := shift_right(i1_u8, 1);`

```text
Ex14: 128 / 2 = 64
Ex15: 128 / 4 = 32
Ex16: 128 / 16 = 8
Ex17: 15 / 2 = 7       -- đúng ra 7,5
Ex18: 15 / 4 = 3       -- đúng ra 3,75
Ex19: 15 / 8 = 1
```

Ex17 là `00001111` dịch thành `00000111`: 7,5 không có chỗ ghi 0,5 nên thành 7. Không ngờ tới thì đây là nguồn lỗi.

#### 2. Bảng tính sẵn (Precalculated Table)

Nếu tập đầu vào nhỏ, tính trước mọi thương rồi cất vào mảng 2 chiều (chương 8 đã dùng mảng 2 chiều). Ví dụ chia số 1–7 cho số 1–7:

| ÷ | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | 1.00 | 0.50 | 0.33 | 0.25 | 0.20 | 0.17 | 0.14 |
| **2** | 2.00 | 1.00 | 0.67 | 0.50 | 0.40 | 0.33 | 0.29 |
| **3** | 3.00 | 1.50 | 1.00 | 0.75 | 0.60 | 0.50 | 0.43 |
| **4** | 4.00 | 2.00 | 1.33 | 1.00 | 0.80 | 0.67 | 0.57 |
| **5** | 5.00 | 2.50 | 1.67 | 1.25 | 1.00 | 0.83 | 0.71 |
| **6** | 6.00 | 3.00 | 2.00 | 1.50 | 1.20 | 1.00 | 0.86 |
| **7** | 7.00 | 3.50 | 2.33 | 1.75 | 1.40 | 1.17 | 1.00 |

*Bảng 10-3: Bảng chia tính sẵn — hàng là số bị chia, cột là số chia; 5/6 ở hàng 5 cột 6 là 0,83*

Không có phép toán nào xảy ra, chỉ là tra chỉ số. Bảng lớn thì vào Block RAM và một phép chia tốn đúng **một chu kỳ** (đọc RAM, chương 6). Nhưng một RAM chỉ đọc một địa chỉ mỗi chu kỳ: muốn hai phép chia cùng lúc phải nhân đôi bảng — tốn BRAM, không mở rộng tốt; nếu chịu chia lần lượt thì một bảng dùng chung qua khối **trọng tài** như chương 7 nói. (Số 0,33 và 0,50 ghi vào FPGA kiểu gì — mục 5 trả lời.)

#### 3. Dùng nhiều chu kỳ xung nhịp

Nếu chịu được chờ, chia bằng các phép đơn giản hơn qua nhiều chu kỳ: cộng dồn số chia vào chính nó cho tới khi vượt số bị chia, đếm số lần, rồi trừ ra phần dư. Có nhiều thuật toán khác (tìm "division algorithms on FPGA"), nhưng điểm chung: đổi tài nguyên lấy thời gian, và **không biết trước bao nhiêu chu kỳ** mới có kết quả — khác với pipeline ở chương 7, nơi vẫn có một kết quả mỗi chu kỳ chỉ là trễ vài nhịp. Cần kết quả mỗi chu kỳ thì phải quay về hai cách trên.

---

## 4. Cách FPGA Thực Thi Các Phép Toán (Hardware Implementation)

Lớp điện tử số dạy nửa cộng, cộng đầy đủ ghép từ XOR và AND — thú vị, nhưng với FPGA hiện đại bạn **không bao giờ** phải tự ghép chúng: viết `+` và tin công cụ tổng hợp.

| Phép toán | Linh kiện phần cứng được tổng hợp trên FPGA |
| :--- | :--- |
| **Cộng / Trừ** | **LUT** (trên Xilinx có thêm chuỗi carry trong slice, chương 4 mục 6). |
| **Nhân với lũy thừa 2 (dịch bit)** | Sách nói flip-flop (thanh ghi dịch); với lượng dịch cố định thì chỉ là **nối dây**, không tốn gì. |
| **Nhân nói chung** | Khối **DSP** (chương 9: DSP48E1 trên 7-series) hoặc chuỗi LUT nếu hết DSP. |
| **Chia** | Thanh ghi (dịch phải), **Block RAM** (bảng tra), hoặc LUT (thuật toán nhiều chu kỳ). |

Ngoài bốn phép trên còn sin, cos, căn bậc hai… — làm được trên FPGA nhưng ngoài phạm vi sách; thuật toán quen thuộc là **CORDIC** (tìm "FPGA CORDIC" trên GitHub). Một hướng khác là đẩy phép tính sang **bộ xử lý**: ngoài chip, hoặc trong chip — lõi cứng (ARM trong các SoC FPGA) hay lõi mềm ghép từ LUT. Việc này thiên về chuyển dữ liệu hơn là toán (cần FIFO vào/ra), và bộ xử lý giỏi số thực hơn FPGA nhiều, nói ở mục sau.

---

## 5. Làm Việc Với Số Thập Phân (Fixed-Point vs. Floating-Point)

Có hai hệ thống biểu diễn số có phần lẻ:

1. **Số dấu chấm động (Floating-Point):** Dấu chấm "trôi" theo độ chính xác cần thiết; 32 bit biểu diễn được dải rất rộng — số rất nhỏ với độ chính xác cao hoặc số rất lớn với độ chính xác thấp. Gần như mọi CPU dùng kiểu này. FPGA làm được, nhưng thường tốn nhiều tài nguyên hơn.
2. **Số dấu chấm tĩnh (Fixed-Point):** Cố định số bit phần nguyên và số bit phần lẻ. Phần lớn toán trên FPGA dùng kiểu này, vì **các phép toán nhị phân không đổi gì cả** — vẫn là cộng trừ nhân chia số nguyên như trên, chỉ cách đọc kết quả khác.

Ý tưởng: 3 bit, lâu nay ta coi mỗi nấc là 1. Nhưng có thể quy ước mỗi nấc là 0,5: `001` là 0,5, `010` là 1,0, `011` là 1,5… Bit thấp nhất thành phần lẻ, hai bit còn lại là phần nguyên.

### Ký Hiệu Q Dành Cho Số Dấu Chấm Tĩnh

Ký hiệu Q chuẩn (`Q1.2`: 1 bit nguyên, 2 bit lẻ) ngầm hiểu là có dấu; FPGA dùng cả hai loại nên sách thêm chữ đầu **U**/**S**:

* **`U3.1`:** Unsigned, 3 bit nguyên, 1 bit lẻ (tổng 4 bit), độ phân giải `1/2 = 0,5`.
* **`S2.2`:** Signed, 2 bit nguyên, 2 bit lẻ (tổng 4 bit), độ phân giải `1/4 = 0,25`.
* **`U4.8`:** Unsigned, 4 bit nguyên, 8 bit lẻ (tổng 12 bit).

Giá trị thật = giá trị nguyên của chuỗi bit chia cho `2^(số bit lẻ)`: `111` ở U2.1 là 7/2 = 3,5; ở U0.3 là 7/8 = 0,875.

| Bit | U3.0 | U2.1 (÷2) | U1.2 (÷4) | U0.3 (÷8) |
| :---: | :---: | :---: | :---: | :---: |
| `000` | 0 | 0.0 | 0.00 | 0.000 |
| `001` | 1 | 0.5 | 0.25 | 0.125 |
| `010` | 2 | 1.0 | 0.50 | 0.250 |
| `011` | 3 | 1.5 | 0.75 | 0.375 |
| `100` | 4 | 2.0 | 1.00 | 0.500 |
| `101` | 5 | 2.5 | 1.25 | 0.625 |
| `110` | 6 | 3.0 | 1.50 | 0.750 |
| `111` | 7 | 3.5 | 1.75 | 0.875 |

*Bảng 10-4: 3 bit unsigned đọc theo bốn định dạng*

| Bit | S3.0 | S2.1 (÷2) | S1.2 (÷4) | S0.3 (÷8) |
| :---: | :---: | :---: | :---: | :---: |
| `000` | 0 | 0.0 | 0.00 | 0.000 |
| `001` | 1 | 0.5 | 0.25 | 0.125 |
| `010` | 2 | 1.0 | 0.50 | 0.250 |
| `011` | 3 | 1.5 | 0.75 | 0.375 |
| `100` | −4 | −2.0 | −1.00 | −0.500 |
| `101` | −3 | −1.5 | −0.75 | −0.375 |
| `110` | −2 | −1.0 | −0.50 | −0.250 |
| `111` | −1 | −0.5 | −0.25 | −0.125 |

*Bảng 10-5: 3 bit signed đọc theo bốn định dạng — cột S3.0 chính là bảng 10-1, các cột sau chia cho 2, 4, 8*

Thói quen tác giả khuyên: **ghi định dạng vào comment** ở mỗi phép tính, kiểu `-- U2.1 + U2.1 = U3.1`, nhất là khi nhiều phép nối tiếp và độ rộng đổi dần.

### Phép Cộng / Trừ Số Dấu Chấm Tĩnh

> **QUY TẮC VÀNG #5:**
> Khi cộng hoặc trừ hai số dấu chấm tĩnh, **độ rộng bit phần lẻ của hai đầu vào BẮT BUỘC PHẢI KHỚP NHAU**.

Số bit lẻ quyết định "cân nặng" của từng bit; lệch nhau thì cộng hai thứ khác cân. Ví dụ cộng `U3.1` (1,5 = `0011`) với `U4.0` (3,0 = `0011`) mà cứ cộng thẳng:

```text
Ex20:  1.500 +  3.000 =  3.000     -- sai: hai đầu vào khác số bit lẻ
```

(Để in số dấu chấm tĩnh, phải đổi sang `real` rồi chia cho `2^(bit lẻ)` — vì thế testbench có `real(to_integer(i1_u5)) / 2.0`.) Hai cách sửa, cả hai có trong testbench:

```text
Ex21:  1.000 +  3.000 =  4.000     -- cắt U3.1 thành U4.0: dịch phải 1, mất 0,5
Ex22:  1.500 +  3.000 =  4.500     -- mở U4.0 thành U4.1: dịch trái 1, giữ đủ
```

Ex21 dịch phải đầu vào thứ nhất để bỏ phần lẻ — phép cộng đúng, nhưng 1,5 đã thành 1,0: đó là làm tròn xuống. Ex22 tốt hơn: dịch trái đầu vào thứ hai, thêm một bit 0 ở cuối, `U4.0` thành `U4.1` — giờ nó rộng 5 bit, phải `resize` trước khi dịch kẻo rơi bit cao, và đầu ra phải 6 bit theo quy tắc 1. Kết quả 4,5, không mất gì. Muốn giữ độ chính xác thì **mở rộng, đừng cắt**. Phép trừ dấu chấm tĩnh theo đúng các quy tắc này, sách không ví dụ thêm.

### Phép Nhân Số Dấu Chấm Tĩnh

Nhân **không cần** dịch cho khớp phần lẻ; nhân thẳng, chỉ cần định dạng đầu ra đúng:

> **QUY TẮC VÀNG #6:**
> Khi nhân hai số dấu chấm tĩnh, định dạng kết quả đầu ra được tính bằng cách **cộng riêng số bit phần nguyên** và **cộng riêng số bit phần lẻ** của hai đầu vào.

`Định dạng đầu ra = (I1 + I2).(F1 + F2)` — `U3.5 × U1.7 = U4.12`, `S3.0 × S2.4 = S5.4`. Quy tắc 4 vẫn được tôn trọng (tổng độ rộng), chỉ là phần nguyên và phần lẻ cộng riêng.

```text
Ex23:  1.250 *  5.500 =  6.875     -- U2.2 (0101) × U3.1 (1011) = U5.3: chia 4, chia 2, chia 8 để in
Ex24:  1.500 * -6.000 = -9.000     -- S2.2 (0110) × S4.0 (1010) = S6.2
```

---

## 6. Tóm Tắt 6 Quy Tắc Vàng Số Học Trên FPGA (Summary)

Quan trọng hơn việc biết LUT hay DSP làm phép nào, là biết **chuỗi bit đang biểu diễn gì**: có dấu hay không, số nguyên hay dấu chấm tĩnh.

1. **Quy tắc #1:** Khi cộng hoặc trừ, kết quả đầu ra phải lớn hơn ít nhất 1 bit so với đầu vào lớn nhất (trước khi mở rộng dấu). Sau khi mở rộng dấu, độ rộng bit tất cả đầu vào và đầu ra phải khớp nhau.
2. **Quy tắc #2:** Đồng nhất kiểu dữ liệu (Signed/Unsigned) giữa tất cả các đầu vào và đầu ra.
3. **Quy tắc #3:** Khi thực hiện phép trừ, luôn luôn dùng kiểu dữ liệu Signed.
4. **Quy tắc #4:** Khi thực hiện phép nhân, độ rộng bit đầu ra phải bằng hoặc lớn hơn tổng độ rộng bit của các đầu vào.
5. **Quy tắc #5:** Khi cộng hoặc trừ số dấu chấm tĩnh, độ rộng bit phần lẻ của các đầu vào phải khớp nhau.
6. **Quy tắc #6:** Khi nhân số dấu chấm tĩnh, cộng riêng số bit phần nguyên và cộng riêng số bit phần lẻ của hai đầu vào để xác định định dạng đầu ra.

Sách nói sáu quy tắc này không gói hết mọi ngóc ngách, nhưng theo đúng thì gần như chắc có đáp số đúng; và với toán, **luôn viết test**.

Thêm vào đó, từ góc độ thực hành với GHDL:

* **Cả 24 ví dụ của sách đã chạy lại ở VHDL-93**, kết quả khớp từng số; chỉ phải thay `to_string` và `finish` của VHDL-2008.
* **VHDL chặn hai lỗi mà Verilog cho qua**: trộn signed/unsigned → `no function declarations for operator "+"`; tích 8 bit gán vào 4 bit → ModelSim chặn lúc biên dịch, GHDL `bound check failure` lúc chạy.
* **Testbench toán dùng `variable` và `:=`**, vì `signal` chưa kịp cập nhật khi `report` — đúng bài `signal` vs `variable` ở chương 4.
* **Số thực không dùng trong thiết kế**: chương 9 đã thấy `* 1.6` không biên dịch được; cách thật là dấu chấm tĩnh — nhân với 410 rồi dịch phải 8 chính là `U8.0 × U0.8 = U8.8` rồi lấy phần nguyên.

---
