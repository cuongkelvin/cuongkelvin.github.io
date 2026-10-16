# CHƯƠNG 8: MÁY TRẠNG THÁI (THE STATE MACHINE)

## 1. Giới Thiệu Về Máy Trạng Thái (Introduction to State Machines)

**Máy trạng thái (State Machine)** hay **Máy trạng thái hữu hạn (Finite State Machine - FSM)** là mô hình thiết kế chuẩn mực và cốt lõi nhất để điều khiển chuỗi các hành động theo quy trình logic trong FPGA. Trong một máy trạng thái, một tác vụ phức tạp được chia nhỏ thành một chuỗi các giai đoạn gọi là **trạng thái (states)**. Hệ thống sẽ di chuyển qua các trạng thái này theo các đường đi đã định trước, thực hiện chuyển tiếp từ trạng thái này sang trạng thái khác dựa trên tín hiệu đầu vào hoặc các sự kiện kích hoạt.

Máy trạng thái được sử dụng vô cùng rộng rãi để tổ chức các hoạt động bên trong FPGA. Do đó, việc hiểu rõ nguyên lý hoạt động và phương pháp thiết kế FSM là bước đi quyết định để bạn có thể xây dựng các hệ thống thiết kế phần cứng phức tạp và tin cậy.

### Các Ví Dụ Trong Thực Tế
Trong đời sống thường ngày, có rất nhiều thiết bị quen thuộc hoạt động dựa trên mô hình máy trạng thái:

* **Thang máy:** Trạng thái của thang máy là tầng hiện tại mà nó đang dừng. Tín hiệu bấm nút gọi tầng của hành khách chính là đầu vào (sự kiện) kích hoạt thang máy đóng cửa, chạy động cơ di chuyển lên/xuống và chuyển sang trạng thái tầng mới.
* **Đèn giao thông:** Các trạng thái của hệ thống bao gồm: Đèn Đỏ, Đèn Xanh, Đèn Vàng. Chuyển tiếp giữa các trạng thái được điều khiển dựa trên sự kiện hết giờ của một bộ đếm thời gian (timer) hoặc tín hiệu từ cảm biến xe cộ.
* **Máy bán hàng tự động:** Trạng thái chờ nhận tiền, trạng thái kiểm tra đủ số dư, trạng thái nhả hàng và trạng thái thối tiền thừa.

### Tính Song Song Của Máy Trạng Thái Trên FPGA
Một ưu thế vượt trội của FPGA so với vi điều khiển (CPU) là khả năng xử lý **song song thực sự**. Bên trong một chip FPGA, bạn có thể thiết kế và khởi chạy **nhiều máy trạng thái hoàn toàn độc lập chạy đồng thời cùng một lúc**:

* Một máy trạng thái chuyên trách việc khởi tạo và quản lý bộ nhớ LPDDR ngoài chip.
* Một máy trạng thái chuyên nhận và giải mã luồng dữ liệu từ cảm biến camera.
* Một máy trạng thái khác đóng vai trò giao tiếp nối tiếp UART với vi điều khiển.

Tất cả các máy trạng thái này đều vận hành song song ở tốc độ xung nhịp phần cứng mà không hề làm suy giảm hiệu năng của nhau.

---

## 2. Trạng Thái, Chuyển Tiếp và Sự Kiện (States, Transitions, and Events)

Máy trạng thái vận hành xoay quanh 3 khái niệm nền tảng:

1. **Trạng thái (State):** Mô tả tình trạng hiện tại của hệ thống khi đang chờ thực hiện chuyển tiếp. Tại một thời điểm bất kỳ, máy trạng thái **chỉ có thể ở đúng một trạng thái duy nhất** (ví dụ: thang máy không thể ở hai tầng cùng một lúc). Vì số lượng trạng thái là có hạn nên mô hình này được gọi là *Máy trạng thái hữu hạn (FSM)*.
2. **Chuyển tiếp (Transition):** Hành động di chuyển từ trạng thái hiện tại sang một trạng thái khác (ví dụ: hành động đóng cửa và chạy động cơ thang máy).
3. **Sự kiện (Event):** Tín hiệu kích thích làm xuất hiện chuyển tiếp. Sự kiện có thể đến từ đầu vào bên ngoài (bấm nút) hoặc tín hiệu nội bộ (bộ đếm hết giờ). Sự kiện giống nhau có thể dẫn đến chuyển tiếp khác nhau tùy thuộc vào trạng thái hiện tại (bấm nút tầng 5 sẽ làm thang máy đi xuống nếu đang ở tầng 10, nhưng sẽ làm thang máy đi lên nếu đang ở tầng 1).
4. **Điều kiện bảo vệ (Guard Condition):** Biểu thức Boolean kiểm tra điều kiện để cho phép hoặc ngăn cản một chuyển tiếp diễn ra. Trong sơ đồ FSM, điều kiện bảo vệ thường được vẽ dưới dạng hình thoi.

```
     ┌──────────┐     Coin     ┌──────────┐
 ●──>│  Locked  │─────────────>│ Unlocked │
     │          │<─────────────│          │
     └──────────┘     Push     └──────────┘
       ↺ Push                    ↺ Coin
```
*Hình 8-1: Máy trạng thái của cửa xoay thu phí; chấm đen là trạng thái ban đầu, `↺` là chuyển tiếp quay về chính nó*

### Phân Tích Sơ Đồ FSM Cửa Xoay Thu Phí (Turnstile Example)

* **Trạng thái ban đầu:** `Locked` (Khóa) — thể hiện bằng dấu chấm đen dẫn vào. Đây là nơi máy đứng khi mới cấp nguồn hoặc khi người dùng bấm reset.
* **Khi ở trạng thái `Locked`:**
  * Nếu có sự kiện `Push` (người đi qua đẩy cửa): Hệ thống giữ nguyên trạng thái `Locked` (vòng lặp tại chỗ).
  * Nếu có sự kiện `Coin` (nhét xu): Hệ thống chuyển tiếp sang trạng thái `Unlocked`.
* **Khi ở trạng thái `Unlocked`:**
  * Nếu có sự kiện `Push` (người đẩy cửa đi qua): Hệ thống cho qua và chuyển tiếp trở về `Locked`.
  * Nếu có sự kiện `Coin` (tiếp tục nhét thêm xu): Hệ thống giữ nguyên trạng thái `Unlocked`.

Cửa xoay nghe tầm thường, nhưng đây là bài tập đúng cỡ để quen với cách tổ chức và vẽ một máy trạng thái. Với hệ thống nhiều trạng thái, nhiều sự kiện, viết ra tường minh như thế này là bắt buộc — sách nhắc rằng ngay một cái máy tính bỏ túi cũng cần máy trạng thái phức tạp bất ngờ.

---

## 3. Hiện Thực Máy Trạng Thái Trong Mã Nguồn Verilog và VHDL

Có 2 phương pháp phổ biến để lập trình FSM trên FPGA:

```
Hai khối (truyền thống):

  đầu vào ──>┌──────────────────────┐  r_Next_State  ┌──────────────────┐
             │ logic tổ hợp (LUT):  │───────────────>│ thanh ghi (FF):  │──┬──> r_Curr_State
             │ tính trạng thái kế   │                │ chốt ở cạnh clk  │  │
             └──────────────────────┘                └──────────────────┘  │
                       ▲                                                   │
                       └───────────────────────────────────────────────────┘

Một khối (khuyên dùng):

  đầu vào ──>┌───────────────────────────────────────┐
             │ process có clock: case + if, gán thẳng│──> r_SM_Main
             │ trạng thái kế vào thanh ghi           │
             └───────────────────────────────────────┘
```
*Hình 8-2: Hai cách tổ chức máy trạng thái*

### Phương Pháp 1: Sử Dụng 2 Khối `always` / `process` (Truyền Thống)

* **Khối 1 (Tuần tự - có Clock):** Chứa thanh ghi cập nhật `r_Next_State` vào `r_Curr_State` tại mỗi cạnh lên xung nhịp Clock.
* **Khối 2 (Tổ hợp - không có Clock):** Chứa lệnh `case` tính toán giá trị `r_Next_State` dựa trên trạng thái hiện tại và các tín hiệu đầu vào.

#### Mã nguồn Verilog (2 Khối):
```verilog
module Turnstile_FSM_2Block (
  input  i_Clk,
  input  i_Reset,
  input  i_Coin,
  input  i_Push,
  output o_Locked
);

  localparam LOCKED   = 1'b0;
  localparam UNLOCKED = 1'b1;

  reg r_Curr_State;
  reg r_Next_State;

  // Khối 1: Cập nhật trạng thái tuần tự
  always @(posedge i_Clk or posedge i_Reset)
  begin
    if (i_Reset)
      r_Curr_State <= LOCKED;
    else
      r_Curr_State <= r_Next_State;
  end

  // Khối 2: Logic tổ hợp xác định trạng thái tiếp theo
  always @(*)
  begin
    case (r_Curr_State)
      LOCKED: begin
        if (i_Coin)
          r_Next_State = UNLOCKED;
        else
          r_Next_State = LOCKED;
      end

      UNLOCKED: begin
        if (i_Push)
          r_Next_State = LOCKED;
        else
          r_Next_State = UNLOCKED;
      end

      default:
        r_Next_State = LOCKED;
    endcase
  end

  assign o_Locked = (r_Curr_State == LOCKED);

endmodule
```

#### Mã nguồn VHDL (2 Khối):
```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity Turnstile_FSM_2Block is
  port (
    i_Clk    : in  std_logic;
    i_Reset  : in  std_logic;
    i_Coin   : in  std_logic;
    i_Push   : in  std_logic;
    o_Locked : out std_logic
  );
end entity Turnstile_FSM_2Block;

architecture RTL of Turnstile_FSM_2Block is
  type t_State is (LOCKED, UNLOCKED);
  signal r_Curr_State : t_State := LOCKED;
  signal r_Next_State : t_State := LOCKED;
begin

  -- Khối 1: Cập nhật trạng thái tuần tự
  process (i_Clk, i_Reset)
  begin
    if i_Reset = '1' then
      r_Curr_State <= LOCKED;
    elsif rising_edge(i_Clk) then
      r_Curr_State <= r_Next_State;
    end if;
  end process;

  -- Khối 2: Logic tổ hợp xác định trạng thái tiếp theo
  process (r_Curr_State, i_Coin, i_Push)
  begin
    case r_Curr_State is
      when LOCKED =>
        if i_Coin = '1' then
          r_Next_State <= UNLOCKED;
        else
          r_Next_State <= LOCKED;
        end if;

      when UNLOCKED =>
        if i_Push = '1' then
          r_Next_State <= LOCKED;
        else
          r_Next_State <= UNLOCKED;
        end if;

      when others =>
        r_Next_State <= LOCKED;
    end case;
  end process;

  o_Locked <= '1' when r_Curr_State = LOCKED else '0';

end architecture RTL;
```

Sách viết khối tổ hợp gọn hơn bản trên: dòng đầu tiên gán mặc định `r_Next_State <= r_Curr_State;`, rồi trong `case` **chỉ viết những chuyển tiếp làm đổi trạng thái** (`Coin` ở `LOCKED`, `Push` ở `UNLOCKED`), không có nhánh `else`, không có `when others` — trình soạn thảo của tác giả còn nhắc "case đã đủ mọi lựa chọn, `others` là thừa". Gán mặc định ở đầu chính là cách chặn latch trong process tổ hợp mà chương 4 đã nói: mọi đường đi đều gán `r_Next_State`. Bản ở đây viết tường minh từng nhánh, cùng mạch; chọn kiểu nào tuỳ bạn, sách nói vậy. Một chi tiết khác: sách viết `if (i_Reset) then` cho `std_logic` — cú pháp VHDL-2008; GHDL chuẩn 93 trên máy này cần `if i_Reset = '1' then` như trên.

Trạng thái dùng **enumeration**: Verilog phải tự đánh số bằng `localparam` (SystemVerilog mới có enum tự động), VHDL khai `type t_State is (LOCKED, UNLOCKED)` và được đánh số theo thứ tự liệt kê — giống `enum` của C. Reset ở đây là **bất đồng bộ** (`i_Reset` nằm trong sensitivity list và được xét trước cạnh xung nhịp), đưa máy về `LOCKED` đúng như chấm đen trong Hình 8-1.

---

### Phương Pháp 2: Sử Dụng 1 Khối `always` / `process` Duy Nhất (Khuyên Dùng)

Gom toàn bộ logic kiểm tra sự kiện và chuyển trạng thái vào **đúng một khối tuần tự kích hoạt theo Clock**.

#### Mã nguồn Verilog (1 Khối):
```verilog
module Turnstile_FSM_1Block (
  input  i_Clk,
  input  i_Reset,
  input  i_Coin,
  input  i_Push,
  output o_Locked
);

  localparam LOCKED   = 1'b0;
  localparam UNLOCKED = 1'b1;

  reg r_SM_Main;

  always @(posedge i_Clk or posedge i_Reset)
  begin
    if (i_Reset)
      r_SM_Main <= LOCKED;
    else
    begin
      case (r_SM_Main)
        LOCKED: begin
          if (i_Coin)
            r_SM_Main <= UNLOCKED;
        end

        UNLOCKED: begin
          if (i_Push)
            r_SM_Main <= LOCKED;
        end

        default:
          r_SM_Main <= LOCKED;
      endcase
    end
  end

  assign o_Locked = (r_SM_Main == LOCKED);

endmodule
```

#### Mã nguồn VHDL (1 Khối):
```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity Turnstile_FSM_1Block is
  port (
    i_Clk    : in  std_logic;
    i_Reset  : in  std_logic;
    i_Coin   : in  std_logic;
    i_Push   : in  std_logic;
    o_Locked : out std_logic
  );
end entity Turnstile_FSM_1Block;

architecture RTL of Turnstile_FSM_1Block is
  type t_State is (LOCKED, UNLOCKED);
  signal r_SM_Main : t_State := LOCKED;
begin

  process (i_Clk, i_Reset)
  begin
    if i_Reset = '1' then
      r_SM_Main <= LOCKED;
    elsif rising_edge(i_Clk) then
      case r_SM_Main is
        when LOCKED =>
          if i_Coin = '1' then
            r_SM_Main <= UNLOCKED;
          end if;

        when UNLOCKED =>
          if i_Push = '1' then
            r_SM_Main <= LOCKED;
          end if;

        when others =>
          r_SM_Main <= LOCKED;
      end case;
    end if;
  end process;

  o_Locked <= '1' when r_SM_Main = LOCKED else '0';

end architecture RTL;
```

Hai bản làm **đúng một việc**, khác nhau thuần tuý về cách viết: toàn bộ logic của khối tổ hợp được dọn vào khối có xung nhịp, nên `case` được xét ở mỗi cạnh lên. Đã kiểm bằng GHDL: đưa cùng chuỗi sự kiện vào cả hai (Push lúc khoá, Coin, Coin lúc mở, Push, không sự kiện), `o_Locked` của hai bản trùng nhau ở từng bước.

#### Kiểm Thử Thiết Kế (Testing the Design)

Sách kèm testbench tự kiểm cho cửa xoay. Bản VHDL dưới đây giữ nguyên của sách, chỉ đổi dòng cuối `finish;` (cần VHDL-2008) thành `wait;` và chạy với `--stop-time=60ns` vì xung nhịp viết bằng `after` không tự dừng (chương 5 đã nói):

```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity Turnstile_Example_TB is
end entity Turnstile_Example_TB;

architecture test of Turnstile_Example_TB is
  signal r_Reset : std_logic := '1';
  signal r_Clk, r_Coin, r_Push : std_logic := '0';
  signal w_Locked : std_logic;
begin
  UUT : entity work.Turnstile_FSM_1Block
    port map (
      i_Clk    => r_Clk,
      i_Reset  => r_Reset,
      i_Coin   => r_Coin,
      i_Push   => r_Push,
      o_Locked => w_Locked);

  r_Clk <= not r_Clk after 1 ns;

  process is
  begin
    wait for 10 ns;
    r_Reset <= '0';
    wait for 10 ns;
    assert w_Locked = '1' severity failure;  -- reset xong phải đang khoá
    r_Coin <= '1';
    wait for 10 ns;
    assert w_Locked = '0' severity failure;  -- có xu thì mở
    r_Push <= '1';
    wait for 10 ns;
    assert w_Locked = '1' severity failure;  -- đẩy qua thì khoá lại
    r_Coin <= '0';
    wait for 10 ns;
    assert w_Locked = '1' severity failure;
    r_Push <= '0';
    wait for 10 ns;
    assert w_Locked = '1' severity failure;
    wait;  -- sách: finish; (VHDL-2008)
  end process;
end test;
```

Reset giữ mức cao từ đầu, 10 ns sau hạ xuống, rồi lần lượt lật các đầu vào và `assert` đầu ra mong đợi. Để ý bước thứ ba: `r_Coin` vẫn đang là 1 khi `r_Push` lên 1, máy đang `UNLOCKED` nên `Push` thắng và khoá lại — đúng sơ đồ. Testbench này đã chạy qua GHDL, không có assert nào nổ.

### So Sánh Đánh Giá Hai Phương Pháp

| Tiêu chí | Phương pháp 2 Khối (`always`/`process`) | Phương pháp 1 Khối (`always`/`process`) *(Khuyên dùng)* |
| :--- | :--- | :--- |
| **Cấu trúc** | **Khối 1:** Tuần tự cập nhật `r_Next_State` vào `r_Curr_State`.<br>**Khối 2:** Tổ hợp tính `r_Next_State` không có Clock. | Gom toàn bộ logic kiểm tra sự kiện và cập nhật thanh ghi vào **đúng 1 khối tuần tự đồng bộ Clock**. |
| **Tài nguyên** | Phân tách rõ LUTs (Khối tổ hợp) và Flip-flops (Khối tuần tự). | Kết hợp LUT và Flip-flop đồng bộ theo từng chu kỳ xung nhịp. |
| **Nguy cơ Latch** | **Rất cao.** Nếu trong khối tổ hợp gán thiếu trường hợp, trình tổng hợp sẽ tự động sinh Latch. | **Bằng 0.** Toàn bộ logic nằm trong khối có Clock, công cụ sẽ dùng chân Enable (`En`) giữ giá trị an toàn. |
| **Độ phức tạp** | Mã nguồn dài, rườm rà, quản lý 2 biến trạng thái `r_Curr_State` và `r_Next_State`. | Mã nguồn gọn gàng, trực quan, chỉ quản lý 1 biến trạng thái `r_SM_Main`. |

---

## 4. 4 Quy Tắc Vàng Khi Thiết Kế Máy Trạng Thái

1. **Một tệp nguồn chỉ chứa một máy trạng thái:** Giúp cô lập logic và đơn giản hóa quá trình tìm lỗi (debug).
2. **Luôn ưu tiên cấu trúc 1 khối `always`/`process`:** Tránh lỗi sinh Latch ngoài ý muốn và giúp phần mềm tổng hợp tối ưu phần cứng tốt hơn.
3. **Sử dụng Enumeration cho tên trạng thái:** Thay vì dùng các số `0, 1, 2` hoặc `S0, S1` vô nghĩa, hãy dùng tên mô tả rõ chức năng (`IDLE`, `PATTERN_SHOW`, `WINNER`) bằng `localparam` (Verilog) hoặc kiểu dữ liệu `type` tùy chỉnh (VHDL).
4. **Vẽ sơ đồ luồng FSM trước khi gõ mã:** Đảm bảo bao quát 100% các đường chuyển trạng thái trước khi lập trình.

---

## 5. Dự Án #6: Trò Chơi Trí Nhớ (Simon-Style Memory Game)

Dự án này ứng dụng FSM để xây dựng một trò chơi rèn luyện trí nhớ hoàn chỉnh trên bo mạch phát triển.

### Luật Chơi

* Hệ thống sẽ hiển thị một chuỗi chớp đèn LED ngẫu nhiên, ban đầu chỉ một đèn.
* Người chơi phải bấm các nút tương ứng để lặp lại chính xác chuỗi đèn đó.
* Nếu bấm đúng, điểm số tăng lên, chuỗi đèn dài thêm 1 bước và lặp lại. Mặc định chuỗi dài tối đa 7 bước; tham số `GAME_LIMIT` cho phép nâng tới 11.
* Nếu bấm sai, người chơi thua (`Game Over`).

Dự án dùng thêm một ngoại vi mới: **LED 7 đoạn** làm bảng điểm, hiện chữ **F** khi thua và **A** khi thắng. Sách lưu ý: bo của bạn không có 4 LED + 4 nút thì sửa mã cho vừa tài nguyên có sẵn; không có LED 7 đoạn thì cắm thêm qua Pmod. Bo lõi QMTech chỉ có một LED và một nút, nên ở blog này toàn bộ game được kiểm bằng **mô phỏng GHDL** (xem cuối mục).

### Lên Kế Hoạch Máy Trạng Thái (Planning the State Machine)

Theo đúng quy tắc vàng thứ tư, vẽ trước khi gõ. Hình 8-3 của sách vẽ lại:

```
 bấm SW1 + SW2 (reset) từ MỌI trạng thái ──> START
                                              │ nhả cả hai nút
                                              ▼
                     ┌────────────────> PATTERN_OFF <────────────────────┐
                     │                        │ hết giờ                   │
                     │                        ▼                           │
                     │                  PATTERN_SHOW ──(chưa hết chuỗi)───┘
                     │                        │ hết giờ, đã hết chuỗi
                     │                        ▼
                     │                   WAIT_PLAYER ──(bấm sai)──> LOSER: hiện F
                     │                        │ bấm đúng, hết chuỗi
                     │                        ▼
                     └──(điểm < GAME_LIMIT)── INCR_SCORE ──(điểm = GAME_LIMIT)──> WINNER: hiện A
```
*Hình 8-3: Máy trạng thái của game trí nhớ*

Đọc từ trên xuống. Reset đưa về `START` từ bất kỳ đâu — sách không vẽ mũi tên từ mọi trạng thái về `START` cho đỡ rối, nhưng ngầm hiểu là có. Ở `START` chờ người chơi nhả nút rồi sang `PATTERN_OFF`: tắt hết LED một khoảng, rồi `PATTERN_SHOW` bật một LED trong chuỗi một khoảng. Hết chuỗi thì sang `WAIT_PLAYER`, chưa hết thì về `PATTERN_OFF` để chớp LED kế tiếp. Vòng `PATTERN_OFF ↔ PATTERN_SHOW` tạo khoảng nghỉ giữa hai lần chớp — cần thiết, vì nếu chuỗi có hai LED giống nhau liền kề mà không nghỉ thì người chơi chỉ thấy một lần sáng dài. Hình thoi trong sơ đồ gốc giữa `PATTERN_SHOW` và `WAIT_PLAYER` là **điều kiện bảo vệ** "đã hết chuỗi chưa".

Ở `WAIT_PLAYER`, bấm sai thì sang `LOSER`; lặp lại đúng cả chuỗi thì sang `INCR_SCORE` — ở đó kiểm tra xem đã đủ `GAME_LIMIT` chưa: đủ thì `WINNER`, chưa thì về `PATTERN_OFF` chớp lại chuỗi dài hơn một bước. Sách nói rõ đây không phải cách chia duy nhất (có thể gộp `PATTERN_OFF` và `PATTERN_SHOW` làm một), nhưng là điểm cân bằng giữa số trạng thái và độ phức tạp của từng trạng thái. Quy tắc chung: **một trạng thái mà phải làm nhiều việc thì nên tách**.

### Tổ Chức Thiết Kế (Organizing the Design)

```
                                ┌───────────────────────────────────────────────────────────────┐
                                │                    State Machine Project Top                  │
                                │                                                               │
SW1..4 ───> [Debounce 1..4] ───>│   ┌───────────────────────────────────────────────────────┐   │
                                │   │                 State Machine Game                     │   │
                                │   │                                                       │   │───> D1..D4 (LED)
Clk 25 MHz ────────────────────>│───│───> [LFSR_22]  [Count_And_Toggle]  (máy 7 trạng thái)  │   │
                                │   └───────────────────────────────────────────────────────┘   │
                                │                               │ điểm 4 bit                    │
                                │                               ▼                               │
                                │                     [Binary_To_7Segment]                      │
                                │                               │                               │
                                └───────────────────────────────┼───────────────────────────────┘
                                                                ▼ 7 đoạn A..G
                                                       [ LED 7 đoạn ]
```
*Hình 8-4: Sơ đồ khối dự án #6*

Lần theo dòng dữ liệu: bốn nút bấm là công tắc cơ nên **dội phím** — việc đầu tiên với mỗi nút là cho qua `Debounce_Filter` của chương 5. Kế đến là module game chứa máy trạng thái; nó gọi hai module đã viết ở chương 6: `LFSR_22` tạo chuỗi giả ngẫu nhiên làm mẫu, và `Count_And_Toggle` đo thời gian mỗi lần chớp — chính việc lật của bộ đếm này kích chuyển trạng thái. Cuối cùng `Binary_To_7Segment` nhận điểm 4 bit và lái LED 7 đoạn.

### Module Giải Mã LED 7 Đoạn (`Binary_To_7Segment`)

LED 7 đoạn là bảy LED xếp thành số 8, đặt tên A–G:

```
     ─A─
    F   B
     ─G─
    E   C
     ─D─
```

Thường chỉ hiện 0–9, nhưng cũng hiện được chữ A–F cho 10–15. Từng đoạn điều khiển riêng, nên cần module dịch "số cần hiện" thành bảy tín hiệu. Mã của sách — đầu ra được **chốt bằng xung nhịp**, 7 cổng rời:

#### Mã nguồn Verilog (`Binary_To_7Segment.v`):
```verilog
module Binary_To_7Segment
  (input       i_Clk,
   input [3:0] i_Binary_Num,
   output      o_Segment_A,
   output      o_Segment_B,
   output      o_Segment_C,
   output      o_Segment_D,
   output      o_Segment_E,
   output      o_Segment_F,
   output      o_Segment_G);

  reg [6:0] r_Hex_Encoding;

  always @(posedge i_Clk)
  begin
    case (i_Binary_Num)
      4'b0000 : r_Hex_Encoding <= 7'b1111110; // 0x7E  0
      4'b0001 : r_Hex_Encoding <= 7'b0110000; // 0x30  1
      4'b0010 : r_Hex_Encoding <= 7'b1101101; // 0x6D  2
      4'b0011 : r_Hex_Encoding <= 7'b1111001; // 0x79  3
      4'b0100 : r_Hex_Encoding <= 7'b0110011; // 0x33  4
      4'b0101 : r_Hex_Encoding <= 7'b1011011; // 0x5B  5
      4'b0110 : r_Hex_Encoding <= 7'b1011111; // 0x5F  6
      4'b0111 : r_Hex_Encoding <= 7'b1110000; // 0x70  7
      4'b1000 : r_Hex_Encoding <= 7'b1111111; // 0x7F  8
      4'b1001 : r_Hex_Encoding <= 7'b1111011; // 0x7B  9
      4'b1010 : r_Hex_Encoding <= 7'b1110111; // 0x77  A
      4'b1011 : r_Hex_Encoding <= 7'b0011111; // 0x1F  b
      4'b1100 : r_Hex_Encoding <= 7'b1001110; // 0x4E  C
      4'b1101 : r_Hex_Encoding <= 7'b0111101; // 0x3D  d
      4'b1110 : r_Hex_Encoding <= 7'b1001111; // 0x4F  E
      4'b1111 : r_Hex_Encoding <= 7'b1000111; // 0x47  F
      default : r_Hex_Encoding <= 7'b0000000; // 0x00
    endcase
  end

  assign o_Segment_A = r_Hex_Encoding[6];
  assign o_Segment_B = r_Hex_Encoding[5];
  assign o_Segment_C = r_Hex_Encoding[4];
  assign o_Segment_D = r_Hex_Encoding[3];
  assign o_Segment_E = r_Hex_Encoding[2];
  assign o_Segment_F = r_Hex_Encoding[1];
  assign o_Segment_G = r_Hex_Encoding[0];

endmodule
```

#### Mã nguồn VHDL (`Binary_To_7Segment.vhd`):
```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity Binary_To_7Segment is
  port (
    i_Clk        : in  std_logic;
    i_Binary_Num : in  std_logic_vector(3 downto 0);
    o_Segment_A  : out std_logic;
    o_Segment_B  : out std_logic;
    o_Segment_C  : out std_logic;
    o_Segment_D  : out std_logic;
    o_Segment_E  : out std_logic;
    o_Segment_F  : out std_logic;
    o_Segment_G  : out std_logic);
end entity Binary_To_7Segment;

architecture RTL of Binary_To_7Segment is
  signal r_Hex_Encoding : std_logic_vector(6 downto 0) := (others => '0');
begin
  process (i_Clk) is
  begin
    if rising_edge(i_Clk) then
      case i_Binary_Num is
        when "0000" => r_Hex_Encoding <= "1111110"; -- 0x7E  0
        when "0001" => r_Hex_Encoding <= "0110000"; -- 0x30  1
        when "0010" => r_Hex_Encoding <= "1101101"; -- 0x6D  2
        when "0011" => r_Hex_Encoding <= "1111001"; -- 0x79  3
        when "0100" => r_Hex_Encoding <= "0110011"; -- 0x33  4
        when "0101" => r_Hex_Encoding <= "1011011"; -- 0x5B  5
        when "0110" => r_Hex_Encoding <= "1011111"; -- 0x5F  6
        when "0111" => r_Hex_Encoding <= "1110000"; -- 0x70  7
        when "1000" => r_Hex_Encoding <= "1111111"; -- 0x7F  8
        when "1001" => r_Hex_Encoding <= "1111011"; -- 0x7B  9
        when "1010" => r_Hex_Encoding <= "1110111"; -- 0x77  A
        when "1011" => r_Hex_Encoding <= "0011111"; -- 0x1F  b
        when "1100" => r_Hex_Encoding <= "1001110"; -- 0x4E  C
        when "1101" => r_Hex_Encoding <= "0111101"; -- 0x3D  d
        when "1110" => r_Hex_Encoding <= "1001111"; -- 0x4F  E
        when "1111" => r_Hex_Encoding <= "1000111"; -- 0x47  F
        when others => r_Hex_Encoding <= "0000000"; -- 0x00
      end case;
    end if;
  end process;

  o_Segment_A <= r_Hex_Encoding(6);
  o_Segment_B <= r_Hex_Encoding(5);
  o_Segment_C <= r_Hex_Encoding(4);
  o_Segment_D <= r_Hex_Encoding(3);
  o_Segment_E <= r_Hex_Encoding(2);
  o_Segment_F <= r_Hex_Encoding(1);
  o_Segment_G <= r_Hex_Encoding(0);
end architecture RTL;
```

Bảy bit của `r_Hex_Encoding` ứng với bảy đoạn: bit 6 là A, bit 5 là B, … bit 0 là G. Lấy số 7 làm ví dụ: cần sáng A, B, C và tắt phần còn lại, nên mã là `1110000` = 0x70. Gom bảy đoạn vào một thanh ghi rồi tách ra ngoài `case` tiết kiệm rất nhiều dòng so với gán bảy đầu ra ở từng nhánh. Bản dịch trước đây ghi số 9 là `1110011` (tắt đoạn D); sách là `1111011` — số 9 có gạch đáy. Cả 16 mã đã đối chiếu với sách và chạy qua GHDL.

### Module Cấp Cao Nhất (`State_Machine_Project_Top`)

Sách đặt mục tiêu cho module cấp cao nhất: **càng ít logic càng tốt**, lý tưởng là chỉ dây nối và instantiation; chức năng đẩy xuống các tầng dưới.

#### Mã nguồn Verilog:
```verilog
module State_Machine_Project_Top
  (input  i_Clk,
   // Nút bấm để nhập chuỗi
   input  i_Switch_1,
   input  i_Switch_2,
   input  i_Switch_3,
   input  i_Switch_4,
   // LED để hiện chuỗi
   output o_LED_1,
   output o_LED_2,
   output o_LED_3,
   output o_LED_4,
   // Bảng điểm: LED 7 đoạn
   output o_Segment2_A,
   output o_Segment2_B,
   output o_Segment2_C,
   output o_Segment2_D,
   output o_Segment2_E,
   output o_Segment2_F,
   output o_Segment2_G);

  localparam GAME_LIMIT     = 7;        // Tăng để game khó hơn
  localparam CLKS_PER_SEC   = 25000000; // Xung nhịp 25 MHz
  localparam DEBOUNCE_LIMIT = 250000;   // Lọc dội phím 10 ms

  wire w_Switch_1, w_Switch_2, w_Switch_3, w_Switch_4;
  wire w_Segment2_A, w_Segment2_B, w_Segment2_C, w_Segment2_D;
  wire w_Segment2_E, w_Segment2_F, w_Segment2_G;
  wire [3:0] w_Score;

  // Lọc dội phím cho cả bốn nút
  Debounce_Filter #(.DEBOUNCE_LIMIT(DEBOUNCE_LIMIT)) Debounce_SW1
    (.i_Clk(i_Clk), .i_Bouncy(i_Switch_1), .o_Debounced(w_Switch_1));
  Debounce_Filter #(.DEBOUNCE_LIMIT(DEBOUNCE_LIMIT)) Debounce_SW2
    (.i_Clk(i_Clk), .i_Bouncy(i_Switch_2), .o_Debounced(w_Switch_2));
  Debounce_Filter #(.DEBOUNCE_LIMIT(DEBOUNCE_LIMIT)) Debounce_SW3
    (.i_Clk(i_Clk), .i_Bouncy(i_Switch_3), .o_Debounced(w_Switch_3));
  Debounce_Filter #(.DEBOUNCE_LIMIT(DEBOUNCE_LIMIT)) Debounce_SW4
    (.i_Clk(i_Clk), .i_Bouncy(i_Switch_4), .o_Debounced(w_Switch_4));

  State_Machine_Game #(.CLKS_PER_SEC(CLKS_PER_SEC),
                       .GAME_LIMIT(GAME_LIMIT)) Game_Inst
    (.i_Clk(i_Clk),
     .i_Switch_1(w_Switch_1),
     .i_Switch_2(w_Switch_2),
     .i_Switch_3(w_Switch_3),
     .i_Switch_4(w_Switch_4),
     .o_Score(w_Score),
     .o_LED_1(o_LED_1),
     .o_LED_2(o_LED_2),
     .o_LED_3(o_LED_3),
     .o_LED_4(o_LED_4));

  Binary_To_7Segment Scoreboard
    (.i_Clk(i_Clk),
     .i_Binary_Num(w_Score),
     .o_Segment_A(w_Segment2_A),
     .o_Segment_B(w_Segment2_B),
     .o_Segment_C(w_Segment2_C),
     .o_Segment_D(w_Segment2_D),
     .o_Segment_E(w_Segment2_E),
     .o_Segment_F(w_Segment2_F),
     .o_Segment_G(w_Segment2_G));

  // Đảo đầu ra: trên Go Board đoạn sáng khi chân ở mức thấp
  assign o_Segment2_A = !w_Segment2_A;
  assign o_Segment2_B = !w_Segment2_B;
  assign o_Segment2_C = !w_Segment2_C;
  assign o_Segment2_D = !w_Segment2_D;
  assign o_Segment2_E = !w_Segment2_E;
  assign o_Segment2_F = !w_Segment2_F;
  assign o_Segment2_G = !w_Segment2_G;

endmodule
```

#### Mã nguồn VHDL:
```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity State_Machine_Project_Top is
  port (
    i_Clk        : in  std_logic;
    -- Nút bấm để nhập chuỗi
    i_Switch_1   : in  std_logic;
    i_Switch_2   : in  std_logic;
    i_Switch_3   : in  std_logic;
    i_Switch_4   : in  std_logic;
    -- LED để hiện chuỗi
    o_LED_1      : out std_logic;
    o_LED_2      : out std_logic;
    o_LED_3      : out std_logic;
    o_LED_4      : out std_logic;
    -- Bảng điểm: LED 7 đoạn
    o_Segment2_A : out std_logic;
    o_Segment2_B : out std_logic;
    o_Segment2_C : out std_logic;
    o_Segment2_D : out std_logic;
    o_Segment2_E : out std_logic;
    o_Segment2_F : out std_logic;
    o_Segment2_G : out std_logic);
end entity State_Machine_Project_Top;

architecture RTL of State_Machine_Project_Top is
  constant GAME_LIMIT     : integer := 7;        -- Tăng để game khó hơn
  constant CLKS_PER_SEC   : integer := 25000000; -- Xung nhịp 25 MHz
  constant DEBOUNCE_LIMIT : integer := 250000;   -- Lọc dội phím 10 ms
  signal w_Switch_1, w_Switch_2, w_Switch_3, w_Switch_4 : std_logic;
  signal w_Score : std_logic_vector(3 downto 0);
  signal w_Segment2_A, w_Segment2_B, w_Segment2_C, w_Segment2_D : std_logic;
  signal w_Segment2_E, w_Segment2_F, w_Segment2_G : std_logic;
begin

  Debounce_SW1 : entity work.Debounce_Filter
    generic map (DEBOUNCE_LIMIT => DEBOUNCE_LIMIT)
    port map (i_Clk => i_Clk, i_Bouncy => i_Switch_1, o_Debounced => w_Switch_1);
  Debounce_SW2 : entity work.Debounce_Filter
    generic map (DEBOUNCE_LIMIT => DEBOUNCE_LIMIT)
    port map (i_Clk => i_Clk, i_Bouncy => i_Switch_2, o_Debounced => w_Switch_2);
  Debounce_SW3 : entity work.Debounce_Filter
    generic map (DEBOUNCE_LIMIT => DEBOUNCE_LIMIT)
    port map (i_Clk => i_Clk, i_Bouncy => i_Switch_3, o_Debounced => w_Switch_3);
  Debounce_SW4 : entity work.Debounce_Filter
    generic map (DEBOUNCE_LIMIT => DEBOUNCE_LIMIT)
    port map (i_Clk => i_Clk, i_Bouncy => i_Switch_4, o_Debounced => w_Switch_4);

  Game_Inst : entity work.State_Machine_Game
    generic map (
      CLKS_PER_SEC => CLKS_PER_SEC,
      GAME_LIMIT   => GAME_LIMIT)
    port map (
      i_Clk      => i_Clk,
      i_Switch_1 => w_Switch_1,
      i_Switch_2 => w_Switch_2,
      i_Switch_3 => w_Switch_3,
      i_Switch_4 => w_Switch_4,
      o_Score    => w_Score,
      o_LED_1    => o_LED_1,
      o_LED_2    => o_LED_2,
      o_LED_3    => o_LED_3,
      o_LED_4    => o_LED_4);

  Scoreboard : entity work.Binary_To_7Segment
    port map (
      i_Clk        => i_Clk,
      i_Binary_Num => w_Score,
      o_Segment_A  => w_Segment2_A,
      o_Segment_B  => w_Segment2_B,
      o_Segment_C  => w_Segment2_C,
      o_Segment_D  => w_Segment2_D,
      o_Segment_E  => w_Segment2_E,
      o_Segment_F  => w_Segment2_F,
      o_Segment_G  => w_Segment2_G);

  -- Đảo đầu ra: trên Go Board đoạn sáng khi chân ở mức thấp
  o_Segment2_A <= not w_Segment2_A;
  o_Segment2_B <= not w_Segment2_B;
  o_Segment2_C <= not w_Segment2_C;
  o_Segment2_D <= not w_Segment2_D;
  o_Segment2_E <= not w_Segment2_E;
  o_Segment2_F <= not w_Segment2_F;
  o_Segment2_G <= not w_Segment2_G;

end RTL;
```

Bốn bộ lọc dội phím, rồi `State_Machine_Game` nhận các nút đã lọc nên có thể tin đầu vào ổn định; hai tham số `CLKS_PER_SEC` (số chu kỳ mỗi giây, để đổi xung nhịp mà không sửa bên trong) và `GAME_LIMIT` (độ dài chuỗi tối đa) đặt ở đây. Đầu ra của bộ giải mã bị **đảo** trước khi ra chân: tuỳ cách nối LED 7 đoạn trên bo, có thể cần mức thấp để đoạn sáng; không đúng thì bỏ `not` / `!`. Để ý `LFSR_22` và `Count_And_Toggle` không được gọi ở đây mà bên trong module game — đó là cách phân cấp hình thành.

### Phân Tích 7 Trạng Thái Trong `State_Machine_Game`

Sách trình bày module này từng đoạn; dưới đây là bản Verilog ghép lại nguyên văn và bản VHDL tương ứng, sau đó giải thích theo từng phần. Bản VHDL đã chạy qua GHDL với testbench chơi thật (xem *Kiểm thử* bên dưới).

#### Mã nguồn Verilog (`State_Machine_Game.v`):
```verilog
module State_Machine_Game #(parameter CLKS_PER_SEC = 25000000,
                            parameter GAME_LIMIT   = 6)
  (input        i_Clk,
   input        i_Switch_1,
   input        i_Switch_2,
   input        i_Switch_3,
   input        i_Switch_4,
   output reg [3:0] o_Score,
   output       o_LED_1,
   output       o_LED_2,
   output       o_LED_3,
   output       o_LED_4);

  localparam START        = 3'd0;
  localparam PATTERN_OFF  = 3'd1;
  localparam PATTERN_SHOW = 3'd2;
  localparam WAIT_PLAYER  = 3'd3;
  localparam INCR_SCORE   = 3'd4;
  localparam LOSER        = 3'd5;
  localparam WINNER       = 3'd6;

  reg [2:0] r_SM_Main;
  reg r_Toggle, r_Switch_1, r_Switch_2, r_Switch_3;
  reg r_Switch_4, r_Button_DV;
  reg [1:0] r_Pattern[0:10];              // Mảng 2 chiều: 2 bit x 11
  wire [21:0] w_LFSR_Data;
  reg [$clog2(GAME_LIMIT)-1:0] r_Index;   // Chỉ số vào chuỗi
  reg [1:0] r_Button_ID;
  wire w_Count_En, w_Toggle;

  always @(posedge i_Clk)
  begin
    // Reset game từ bất kỳ trạng thái nào
    if (i_Switch_1 & i_Switch_2)
      r_SM_Main <= START;
    else
    begin
      case (r_SM_Main)
        // Ở lại START cho tới khi người chơi nhả cả hai nút
        START:
          if (!i_Switch_1 & !i_Switch_2 & r_Button_DV)
          begin
            o_Score   <= 0;
            r_Index   <= 0;
            r_SM_Main <= PATTERN_OFF;
          end

        PATTERN_OFF:
          if (!w_Toggle & r_Toggle) // Cạnh xuống của timer
            r_SM_Main <= PATTERN_SHOW;

        // Hiện LED kế tiếp trong chuỗi
        PATTERN_SHOW:
          if (!w_Toggle & r_Toggle)
            if (o_Score == r_Index)
            begin
              r_Index   <= 0;
              r_SM_Main <= WAIT_PLAYER;
            end
            else
            begin
              r_Index   <= r_Index + 1;
              r_SM_Main <= PATTERN_OFF;
            end

        WAIT_PLAYER:
          if (r_Button_DV)
            if (r_Pattern[r_Index] == r_Button_ID && r_Index == o_Score)
            begin
              r_Index   <= 0;
              r_SM_Main <= INCR_SCORE;
            end
            else if (r_Pattern[r_Index] != r_Button_ID)
              r_SM_Main <= LOSER;
            else
              r_Index <= r_Index + 1;

        // Tăng điểm, ở đây đúng 1 chu kỳ
        INCR_SCORE:
        begin
          o_Score <= o_Score + 1;
          if (o_Score == GAME_LIMIT-1)
            r_SM_Main <= WINNER;
          else
            r_SM_Main <= PATTERN_OFF;
        end

        // Hiện 0xA, chờ game mới
        WINNER:
          o_Score <= 4'hA;

        // Hiện 0xF, chờ game mới
        LOSER:
          o_Score <= 4'hF;

        default:
          r_SM_Main <= START;
      endcase
    end
  end

  // Nạp LFSR vào r_Pattern khi đang ở START; mỗi 2 bit là một giá trị
  always @(posedge i_Clk)
  begin
    if (r_SM_Main == START)
    begin
      r_Pattern[0]  <= w_LFSR_Data[1:0];
      r_Pattern[1]  <= w_LFSR_Data[3:2];
      r_Pattern[2]  <= w_LFSR_Data[5:4];
      r_Pattern[3]  <= w_LFSR_Data[7:6];
      r_Pattern[4]  <= w_LFSR_Data[9:8];
      r_Pattern[5]  <= w_LFSR_Data[11:10];
      r_Pattern[6]  <= w_LFSR_Data[13:12];
      r_Pattern[7]  <= w_LFSR_Data[15:14];
      r_Pattern[8]  <= w_LFSR_Data[17:16];
      r_Pattern[9]  <= w_LFSR_Data[19:18];
      r_Pattern[10] <= w_LFSR_Data[21:20];
    end
  end

  // LED: sáng theo chuỗi khi đang PATTERN_SHOW, còn lại phản hồi theo nút bấm
  assign o_LED_1 = (r_SM_Main == PATTERN_SHOW && r_Pattern[r_Index] == 2'b00) ? 1'b1 : i_Switch_1;
  assign o_LED_2 = (r_SM_Main == PATTERN_SHOW && r_Pattern[r_Index] == 2'b01) ? 1'b1 : i_Switch_2;
  assign o_LED_3 = (r_SM_Main == PATTERN_SHOW && r_Pattern[r_Index] == 2'b10) ? 1'b1 : i_Switch_3;
  assign o_LED_4 = (r_SM_Main == PATTERN_SHOW && r_Pattern[r_Index] == 2'b11) ? 1'b1 : i_Switch_4;

  // Thanh ghi để phát hiện cạnh xuống (timer hết giờ, nút được nhả)
  always @(posedge i_Clk)
  begin
    r_Toggle   <= w_Toggle;
    r_Switch_1 <= i_Switch_1;
    r_Switch_2 <= i_Switch_2;
    r_Switch_3 <= i_Switch_3;
    r_Switch_4 <= i_Switch_4;

    if (r_Switch_1 & !i_Switch_1)
    begin
      r_Button_DV <= 1'b1;
      r_Button_ID <= 0;
    end
    else if (r_Switch_2 & !i_Switch_2)
    begin
      r_Button_DV <= 1'b1;
      r_Button_ID <= 1;
    end
    else if (r_Switch_3 & !i_Switch_3)
    begin
      r_Button_DV <= 1'b1;
      r_Button_ID <= 2;
    end
    else if (r_Switch_4 & !i_Switch_4)
    begin
      r_Button_DV <= 1'b1;
      r_Button_ID <= 3;
    end
    else
    begin
      r_Button_DV <= 1'b0;
      r_Button_ID <= 0;
    end
  end

  // Bộ đếm chỉ chạy khi đang hiện chuỗi
  assign w_Count_En = (r_SM_Main == PATTERN_SHOW || r_SM_Main == PATTERN_OFF);

  Count_And_Toggle #(.COUNT_LIMIT(CLKS_PER_SEC/4)) Count_Inst
    (.i_Clk(i_Clk),
     .i_Enable(w_Count_En),
     .o_Toggle(w_Toggle));

  // Dữ liệu ngẫu nhiên 22 bit
  LFSR_22 LFSR_Inst
    (.i_Clk(i_Clk),
     .o_LFSR_Data(w_LFSR_Data),
     .o_LFSR_Done());  // không dùng, để trống

endmodule
```

#### Mã nguồn VHDL (`State_Machine_Game.vhd`):
```vhdl
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity State_Machine_Game is
  generic (
    CLKS_PER_SEC : integer := 25000000;
    GAME_LIMIT   : integer := 6);
  port (
    i_Clk      : in  std_logic;
    i_Switch_1 : in  std_logic;
    i_Switch_2 : in  std_logic;
    i_Switch_3 : in  std_logic;
    i_Switch_4 : in  std_logic;
    o_Score    : out std_logic_vector(3 downto 0);
    o_LED_1    : out std_logic;
    o_LED_2    : out std_logic;
    o_LED_3    : out std_logic;
    o_LED_4    : out std_logic);
end entity State_Machine_Game;

architecture RTL of State_Machine_Game is
  type t_SM_Main is (START, PATTERN_OFF, PATTERN_SHOW,
                     WAIT_PLAYER, INCR_SCORE, LOSER, WINNER);
  signal r_SM_Main : t_SM_Main := START;
  signal w_Count_En, w_Toggle, r_Toggle : std_logic := '0';
  signal r_Switch_1, r_Switch_2, r_Switch_3, r_Switch_4, r_Button_DV : std_logic := '0';
  type t_Pattern is array (0 to 10) of std_logic_vector(1 downto 0);
  signal r_Pattern   : t_Pattern := (others => "00"); -- mang 2 chieu: 2 bit x 11
  signal w_LFSR_Data : std_logic_vector(21 downto 0);
  signal r_Index     : integer range 0 to GAME_LIMIT := 0;
  signal w_Index_SLV : std_logic_vector(7 downto 0);
  signal r_Button_ID : std_logic_vector(1 downto 0) := "00";
  signal r_Score     : unsigned(3 downto 0) := (others => '0');
begin

  process (i_Clk) is
  begin
    if rising_edge(i_Clk) then
      -- Reset game tu bat ky trang thai nao
      if i_Switch_1 = '1' and i_Switch_2 = '1' then
        r_SM_Main <= START;
      else
        case r_SM_Main is
          -- O lai START cho toi khi nguoi choi nha ca hai nut
          when START =>
            if i_Switch_1 = '0' and i_Switch_2 = '0' and r_Button_DV = '1' then
              r_Score   <= to_unsigned(0, r_Score'length);
              r_Index   <= 0;
              r_SM_Main <= PATTERN_OFF;
            end if;

          when PATTERN_OFF =>
            if w_Toggle = '0' and r_Toggle = '1' then -- canh xuong cua timer
              r_SM_Main <= PATTERN_SHOW;
            end if;

          -- Hien LED ke tiep trong chuoi
          when PATTERN_SHOW =>
            if w_Toggle = '0' and r_Toggle = '1' then
              if r_Score = r_Index then
                r_Index   <= 0;
                r_SM_Main <= WAIT_PLAYER;
              else
                r_Index   <= r_Index + 1;
                r_SM_Main <= PATTERN_OFF;
              end if;
            end if;

          when WAIT_PLAYER =>
            if r_Button_DV = '1' then
              if r_Pattern(r_Index) = r_Button_ID and unsigned(w_Index_SLV) = r_Score then
                r_Index   <= 0;
                r_SM_Main <= INCR_SCORE;
              elsif r_Pattern(r_Index) /= r_Button_ID then
                r_SM_Main <= LOSER;
              else
                r_Index <= r_Index + 1;
              end if;
            end if;

          -- Tang diem, o day dung 1 chu ky
          when INCR_SCORE =>
            r_Score <= r_Score + 1;
            if r_Score = GAME_LIMIT - 1 then  -- sach VHDL viet = GAME_LIMIT, xem ghi chu
              r_SM_Main <= WINNER;
            else
              r_SM_Main <= PATTERN_OFF;
            end if;

          when WINNER =>
            r_Score <= X"A"; -- hien chu A
          when LOSER =>
            r_Score <= X"F"; -- hien chu F
          when others =>
            r_SM_Main <= START;
        end case;
      end if;
    end if;
  end process;

  -- Nap LFSR vao r_Pattern khi dang o START; moi 2 bit la mot gia tri
  process (i_Clk) is
  begin
    if rising_edge(i_Clk) then
      if r_SM_Main = START then
        r_Pattern(0)  <= w_LFSR_Data(1 downto 0);
        r_Pattern(1)  <= w_LFSR_Data(3 downto 2);
        r_Pattern(2)  <= w_LFSR_Data(5 downto 4);
        r_Pattern(3)  <= w_LFSR_Data(7 downto 6);
        r_Pattern(4)  <= w_LFSR_Data(9 downto 8);
        r_Pattern(5)  <= w_LFSR_Data(11 downto 10);
        r_Pattern(6)  <= w_LFSR_Data(13 downto 12);
        r_Pattern(7)  <= w_LFSR_Data(15 downto 14);
        r_Pattern(8)  <= w_LFSR_Data(17 downto 16);
        r_Pattern(9)  <= w_LFSR_Data(19 downto 18);
        r_Pattern(10) <= w_LFSR_Data(21 downto 20);
      end if;
    end if;
  end process;

  w_Index_SLV <= std_logic_vector(to_unsigned(r_Index, w_Index_SLV'length));

  -- LED: sang theo chuoi khi dang PATTERN_SHOW, con lai phan hoi theo nut bam
  o_LED_1 <= '1' when (r_SM_Main = PATTERN_SHOW and r_Pattern(r_Index) = "00") else i_Switch_1;
  o_LED_2 <= '1' when (r_SM_Main = PATTERN_SHOW and r_Pattern(r_Index) = "01") else i_Switch_2;
  o_LED_3 <= '1' when (r_SM_Main = PATTERN_SHOW and r_Pattern(r_Index) = "10") else i_Switch_3;
  o_LED_4 <= '1' when (r_SM_Main = PATTERN_SHOW and r_Pattern(r_Index) = "11") else i_Switch_4;

  -- Thanh ghi de phat hien canh xuong (timer het gio, nut duoc nha)
  process (i_Clk) is
  begin
    if rising_edge(i_Clk) then
      r_Toggle   <= w_Toggle;
      r_Switch_1 <= i_Switch_1;
      r_Switch_2 <= i_Switch_2;
      r_Switch_3 <= i_Switch_3;
      r_Switch_4 <= i_Switch_4;
      if r_Switch_1 = '1' and i_Switch_1 = '0' then
        r_Button_DV <= '1'; r_Button_ID <= "00";
      elsif r_Switch_2 = '1' and i_Switch_2 = '0' then
        r_Button_DV <= '1'; r_Button_ID <= "01";
      elsif r_Switch_3 = '1' and i_Switch_3 = '0' then
        r_Button_DV <= '1'; r_Button_ID <= "10";
      elsif r_Switch_4 = '1' and i_Switch_4 = '0' then
        r_Button_DV <= '1'; r_Button_ID <= "11";
      else
        r_Button_DV <= '0'; r_Button_ID <= "00";
      end if;
    end if;
  end process;

  -- Bo dem chi chay khi dang hien chuoi
  w_Count_En <= '1' when (r_SM_Main = PATTERN_SHOW or r_SM_Main = PATTERN_OFF) else '0';

  Count_Inst : entity work.Count_And_Toggle
    generic map (COUNT_LIMIT => CLKS_PER_SEC / 4)
    port map (i_Clk => i_Clk, i_Enable => w_Count_En, o_Toggle => w_Toggle);

  LFSR_Inst : entity work.LFSR_22
    port map (i_Clk => i_Clk, o_LFSR_Data => w_LFSR_Data, o_LFSR_Done => open);

  o_Score <= std_logic_vector(r_Score);
end architecture RTL;
```

Đi qua từng phần, theo thứ tự sách giải thích.

**Khai báo.** Bảy trạng thái đánh số bằng enumeration; `r_SM_Main` cần 3 bit cho 7 trạng thái — Verilog khai `reg [2:0]`, VHDL chỉ cần khai kiểu `t_SM_Main` và được định cỡ tự động. `r_Pattern` là mảng 2 chiều **2 bit × 11 ô** = 22 bit, mỗi ô là một LED (00 là LED 1, 01 là LED 2, …), lần thứ hai gặp mảng 2 chiều sau RAM ở chương 6. Ví dụ nội dung của nó:

| Chỉ số | Nhị phân | LED / nút |
| :---: | :---: | :---: |
| 0 | 01 | 2 |
| 1 | 11 | 4 |
| 2 | 11 | 4 |
| 3 | 00 | 1 |
| 4 | 10 | 3 |
| 5 | 00 | 1 |
| 6 | 01 | 2 |
| 7 | 01 | 2 |
| 8 | 11 | 4 |
| 9 | 00 | 1 |
| 10 | 10 | 3 |

*Bảng 8-1: Một chuỗi mẫu trong `r_Pattern`*

22 bit của LFSR ánh xạ đúng vào 22 bit của mảng, nên chuỗi dài tối đa 11 — tác giả nói chơi tới mức đó rất khó nhớ; `GAME_LIMIT` quyết định độ dài thật, chỉnh từ module cấp cao.

**Reset.** `if i_Switch_1 = '1' and i_Switch_2 = '1'` nằm **ngoài** `case`, nên ở mọi cạnh xung nhịp đều kiểm trước: bấm cùng lúc nút 1 và 2 thì về `START` bất kể đang ở đâu. Tác giả thú nhận có nút thứ năm riêng cho reset thì dễ hơn, nhưng bo chỉ có bốn nút.

**`START`.** Chờ reset **được bỏ**: hai nút về 0 *và* `r_Button_DV` lên 1 (cờ "vừa có nút được nhả", nói ở dưới). Khi đó xoá điểm, xoá chỉ số, sang `PATTERN_OFF`. Bản dịch trước đây thoát `START` khi hai nút *đang* bấm — sai với sách, và cũng sai với logic reset ở trên (đang bấm thì câu `if` reset giữ chặt ở `START`).

**`PATTERN_OFF` và `PATTERN_SHOW`.** Cả hai chờ timer: cạnh xuống của `w_Toggle` (hiện tại 0, chu kỳ trước 1). Ở `PATTERN_SHOW` hết giờ thì hỏi `r_Score = r_Index` chưa — bằng nghĩa là đã chớp hết chuỗi của vòng này (vòng có điểm `s` chớp `s + 1` LED, chỉ số 0..s): đặt lại chỉ số, sang `WAIT_PLAYER`; chưa thì tăng chỉ số, về `PATTERN_OFF`.

**`WAIT_PLAYER`.** Chờ `r_Button_DV`. Ba khả năng: nút đúng *và* là nút cuối (chỉ số bằng điểm) → xoá chỉ số, sang `INCR_SCORE`; nút sai → `LOSER`; nút đúng nhưng chưa hết → tăng chỉ số, ở lại (không gán `r_SM_Main` thì nó giữ nguyên — chương 4 đã nói). VHDL phải đổi `r_Index` sang `unsigned` qua `w_Index_SLV` mới so với `r_Score` được; Verilog dễ tính hơn, so thẳng.

**`INCR_SCORE`.** Tăng điểm, ở đúng một chu kỳ, rồi hoặc `WINNER` hoặc về `PATTERN_OFF` chớp chuỗi dài hơn. Tác giả thừa nhận có thể nhét việc này vào `WAIT_PLAYER`, nhưng tách ra cho `WAIT_PLAYER` đỡ rối. **Một chỗ sách tự mâu thuẫn**: bản Verilog so `o_Score == GAME_LIMIT-1` (điểm mới = `GAME_LIMIT` thì thắng — đúng mô tả "chuỗi dài tới 7 là thắng"), bản VHDL so `r_Score = GAME_LIMIT` — thêm một vòng nữa mới thắng, và `r_Index` khai `range 0 to GAME_LIMIT` nên vẫn chạy được, chỉ là dài hơn một bước so với mô tả. Bản VHDL ở đây theo Verilog: `r_Score = GAME_LIMIT - 1`.

**`WINNER` / `LOSER`.** Đặt điểm thành `A` hoặc `F` và đứng yên; chỉ reset mới đưa ra khỏi đây. `when others` về `START` là thói quen tốt dù không bao giờ xảy ra.

**Nạp chuỗi.** Process riêng: khi đang `START`, mỗi cạnh xung nhịp lại chép 22 bit LFSR vào `r_Pattern`. LFSR đổi mỗi chu kỳ nên chuỗi "quay" liên tục; đúng cạnh người chơi nhả nút, máy rời `START` và chuỗi **đóng băng** cho cả ván. Đó là cách lấy ngẫu nhiên từ thời điểm bấm tay người.

**LED.** Bốn gán đồng thời: đang `PATTERN_SHOW` và ô hiện tại trỏ tới LED này thì sáng; ngoài lúc đó LED **theo nút tương ứng** — bấm nút nào, LED đó sáng, để người chơi thấy mình đang nhập gì. Bản dịch trước bỏ mất phần phản hồi này.

**Phát hiện cạnh xuống.** Vẫn dùng cạnh lên của xung nhịp; "cạnh xuống" là của tín hiệu đang xét. Chốt `w_Toggle` thành `r_Toggle` để bắt lúc timer hết giờ; chốt bốn nút để bắt lúc **nhả** nút (1 → 0 với bo của sách), khi đó bật `r_Button_DV` và ghi mã nút vào `r_Button_ID`; không có cạnh nào thì xoá cả hai. Tác giả chọn phản ứng lúc nhả chứ không lúc bấm, và nói đảo lại thì chơi thấy "không tự nhiên". Trên QMTech nút kéo lên, bấm là 0: cách gọn nhất là đảo tín hiệu ngay sau bộ lọc dội phím ở module cấp cao (`w_Switch_1 <= not ...`) để toàn bộ logic game giữ nguyên quy ước "1 = đang bấm".

**Bộ đếm và LFSR.** `Count_And_Toggle` với `COUNT_LIMIT = CLKS_PER_SEC/4` — mỗi pha chớp/nghỉ một phần tư giây; phép chia này là **hằng số tính lúc tổng hợp** (25.000.000 / 4 = 6.250.000), không có mạch chia nào trên chip. `i_Enable` chỉ bật ở hai trạng thái chớp, các lúc khác bộ đếm đứng yên — bản dịch trước gọi module mà **không nối `i_Enable`**, bộ đếm sẽ không bao giờ chạy và game kẹt ở `PATTERN_OFF`. `LFSR_22` để `o_LFSR_Done` trống (`open`); công cụ tự cắt logic không dùng, không tốn tài nguyên. Cuối cùng VHDL đổi `r_Score` (`unsigned`) sang `std_logic_vector` cho cổng ra.

### Kiểm Thử Game (Testing the Memory Game)

Sách kể bản cuối này là kết quả của nhiều vòng "nạp bo → chơi → thấy chưa ưng → sửa": ban đầu từ `START` nhảy thẳng `PATTERN_SHOW`, LED sáng ngay làm không biết game bắt đầu chưa, nên thêm `PATTERN_OFF` ở đầu; thời gian sáng ban đầu quá lâu, giảm xuống cho nhanh tay. Những thứ đó là *cảm giác*, mô phỏng không chỉ ra được. Nhưng tác giả vẫn viết một testbench giả lập bấm nút (có trên GitHub của sách, không tự kiểm) và nhờ nó bắt được vài lỗi lúc mới viết.

Ở blog này, vì bo QMTech không đủ nút và LED, bản VHDL trên được kiểm bằng một testbench GHDL **chơi thật**: đặt `CLKS_PER_SEC => 80` để mỗi pha chớp chỉ 20 chu kỳ, `GAME_LIMIT => 3`; testbench bấm-nhả SW1 + SW2 để bắt đầu, canh các đầu ra LED để **đọc chuỗi máy chớp**, rồi bấm-nhả lại đúng thứ tự. Kết quả:

```text
vòng 1: chuỗi 3      -> score = 1
vòng 2: chuỗi 3-4    -> score = 2
vòng 3: chuỗi 3-4-4  -> score = 10 (chữ A): THẮNG
chơi lại, bấm sai nút đầu tiên -> score = 15 (chữ F): THUA
bấm SW1 + SW2 giữa chừng -> về START, score = 0
```

Ba điều testbench này xác nhận mà đọc mã không chắc được: chuỗi dài thêm đúng một bước mỗi vòng và giữ nguyên phần đầu; `WINNER` đến đúng khi điểm chạm `GAME_LIMIT`; reset từ `LOSER` hoạt động. Cả hai bản VHDL `Binary_To_7Segment` và `State_Machine_Project_Top` ở trên cũng đã elaborate cùng `Debounce_Filter` chương 5 — toàn bộ phân cấp khớp cổng.

### Thêm Ràng Buộc Chân (Adding the Pin Constraints)

Có giao diện mới ở cấp cao nhất là phải thêm chân cho nó; quên thì công cụ tự chọn chân, gần như chắc chắn sai. Phải lần theo sơ đồ mạch từ LED 7 đoạn về chân FPGA. Ràng buộc của sách cho Go Board (iCEcube2, dạng `set_io`):

```text
set_io o_Segment2_A 100
set_io o_Segment2_B 99
set_io o_Segment2_C 97
set_io o_Segment2_D 95
set_io o_Segment2_E 94
set_io o_Segment2_F 8
set_io o_Segment2_G 96
```

Với Vivado, tương đương là một dòng `set_property PACKAGE_PIN <chân> [get_ports o_Segment2_A]` kèm `IOSTANDARD` cho mỗi cổng trong file `.xdc`, như chương 4. Bo lõi QMTech không có LED 7 đoạn; muốn chạy thật phải nối thêm qua header và tự tra chân.

### Kết Quả Tổng Hợp (Building and Programming the FPGA)

Trên iCE40 HX1K của Go Board (1.280 LUT, 1.280 flip-flop):

| | Verilog | VHDL |
| :--- | :---: | :---: |
| Flip-flop (không tính I/O) | 164 (12%) | 163 (12%) |
| LUT | 239 (18%) | 225 (17%) |

Hai ngôn ngữ cho kết quả sát nhau. Cả một game vài trăm dòng mã, dùng chưa tới 20% tài nguyên chính của một FPGA nhỏ. Tác giả thách: nâng `GAME_LIMIT` lên 11 xem có thắng nổi không. Số trên Vivado cho XC7A35T chưa chạy, nằm trong danh sách cần kiểm.

---

## 6. Tóm Tắt Chương (Summary)

Trong chương này, bạn đã học cách:

* Hiểu rõ khái niệm Máy Trạng Thái Hữu Hạn (FSM) và tính song song trên FPGA.
* So sánh chi tiết hai phương pháp viết FSM (2 khối vs. 1 khối) và nguyên nhân gây lỗi Latch.
* Áp dụng 4 quy tắc vàng khi lập trình FSM.
* Xây dựng dự án game Simon hoàn chỉnh bằng cách kết hợp FSM với bộ giải mã LED 7 đoạn, bộ lọc dội phím, bộ đếm thời gian và LFSR.

Thêm vào đó, từ góc độ thực hành với GHDL và bo QMTech:

* **Cả hai cách viết FSM cho cùng kết quả** — kiểm bằng cùng chuỗi sự kiện trên GHDL; testbench của sách chạy được ở VHDL-93 sau khi đổi `finish` thành `wait;`.
* **Game chạy đúng trong mô phỏng**: thắng ở đúng `GAME_LIMIT`, thua khi bấm sai, reset từ mọi trạng thái. Bản VHDL theo Verilog của sách ở điều kiện thắng (`GAME_LIMIT - 1`), vì bản VHDL của sách lệch một vòng.
* **Ba lỗi của bản dịch trước đã sửa**: thiếu `i_Enable` của bộ đếm (game kẹt), thoát `START` lúc đang bấm thay vì lúc nhả, LED mất phản hồi theo nút; cộng số 9 trên LED 7 đoạn.
* **Trên QMTech** nút kéo lên nên đảo tín hiệu sau bộ lọc dội phím để giữ quy ước "1 = bấm"; bo không đủ LED/nút/7 đoạn, kiểm bằng mô phỏng.
