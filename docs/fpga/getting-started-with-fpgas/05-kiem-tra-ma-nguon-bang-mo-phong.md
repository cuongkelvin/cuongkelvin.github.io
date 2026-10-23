# CHƯƠNG 5: KIỂM TRA MÃ NGUỒN BẰNG MÔ PHỎNG (TESTING YOUR CODE WITH SIMULATION)

Có hai cách để tìm ra những lỗi (bug) chắc chắn sẽ xuất hiện trong một thiết kế FPGA. Cách thứ nhất là nạp chương trình vào FPGA, cho nó chạy và quan sát kết quả — đây gọi là **tìm lỗi trên phần cứng (finding bugs on hardware)**. Cách thứ hai là sử dụng máy tính để đưa các trường hợp thử nghiệm (test cases) vào mã nguồn FPGA nhằm xem mã nguồn phản ứng như thế nào *trước khi* bạn thực sự nạp vào chip — đây gọi là **tìm lỗi bằng mô phỏng (finding bugs in simulation)**.

Đối với các dự án cực kỳ đơn giản, chẳng hạn như những dự án chúng ta đã khám phá từ đầu cuốn sách đến nay, việc nhảy thẳng vào lập trình cho FPGA mà không cần bất kỳ bước mô phỏng nào có thể là một lựa chọn chấp nhận được. Tuy nhiên, khi các thiết kế FPGA của bạn trở nên phức tạp hơn, việc tìm lỗi trên phần cứng sẽ trở nên cực kỳ khó khăn. Trong hầu hết mọi trường hợp, tìm lỗi trong môi trường mô phỏng dễ dàng hơn rất nhiều. Sau khi đã mô phỏng và sửa lỗi kỹ càng cho một thiết kế, không có cảm giác nào thỏa mãn hơn việc cuối cùng bạn nạp chương trình vào FPGA và thấy mọi thứ hoạt động hoàn hảo ngay từ lần đầu tiên.

Trong chương này, bạn sẽ học cách thức hoạt động của mô phỏng và hiểu tại sao nó lại là một bước thiết yếu trong quy trình thiết kế FPGA. Chúng ta sẽ khám phá một công cụ mô phỏng miễn phí và tôi sẽ giới thiệu khái niệm **Testbench** để cho bạn thấy cách viết mã thử nghiệm nhằm "ép tải" thiết kế của bạn. Bạn sẽ thực hành các khái niệm này bằng cách thêm một mạch lọc dội phím (debounce circuit) vào dự án đảo trạng thái đèn LED từ chương trước (Dự án #3) và chạy mô phỏng thiết kế đó. Cuối cùng, chúng ta sẽ xem xét khái niệm **xác minh thiết kế (verification)** — một quy trình chính quy và nghiêm ngặt hơn để kiểm thử các thiết kế FPGA và ASIC.

---

## 1. Tại Sao Mô Phỏng Lại Quan Trọng? (Why Simulation Matters)

Mô phỏng đóng vai trò quan trọng vì chiếc FPGA của bạn về bản chất là một **"chiếc hộp đen" (black box)**, như được minh họa trong **Hình 5-1**. Khi bạn nạp chương trình vào FPGA, bạn có thể thay đổi các đầu vào và nhìn thấy các đầu ra tương ứng, nhưng bạn hoàn toàn không thể thấy được chi tiết những gì đang diễn ra bên trong bản thân chiếc hộp đó. Bạn không thể theo dõi từng biến số hay đường đi của các tín hiệu dữ liệu khi chúng di chuyển bên trong chip FPGA.

```
       ┌───────────────────────┐
       │         FPGA          │
Inputs │   ┌───────────────┐   │ Outputs
──────>│───│       ?       │───│──────>
       │   │  (Black Box)  │   │
       │   └───────────────┘   │
       └───────────────────────┘
```
*Hình 5-1: Có gì bên trong chiếc hộp đen?*

Nếu có sự cố xảy ra bên trong chiếc hộp đen đó (và chắc chắn nó sẽ xảy ra), và đầu ra không đúng như những gì bạn kỳ vọng, việc tìm ra nguyên nhân sẽ cực kỳ gian nan. Giải pháp là sử dụng máy tính để mô phỏng lại các hoạt động bên trong của chiếc hộp đen theo cách mà bạn có thể dễ dàng theo dõi. Mô phỏng về mặt hiệu quả sẽ "mở tung" chiếc hộp đen FPGA của bạn ra để bạn quan sát tường tận mọi thứ bên trong.

Hãy để tôi kể cho bạn một ví dụ về việc mô phỏng có thể hữu ích như thế nào. Ở một công ty cũ tôi từng làm việc, có một đồng nghiệp đã cố gắng sửa lỗi cho thiết kế FPGA của anh ấy. Vì lý do nào đó, dữ liệu bị xáo trộn khi đi qua FPGA. Anh ấy đã mất nhiều tuần sử dụng máy hiện sóng (oscilloscope) và máy phân tích logic (logic analyzer) để trích xuất tín hiệu ra ngoài FPGA nhằm tìm xem lỗi phát sinh từ đâu. Tại một thời điểm, tôi hỏi anh ấy xem đã chạy mô phỏng thiết kế chưa. Anh ấy chưa từng làm: anh ấy không có kinh nghiệm về mô phỏng và cảm thấy không thể dành thời gian ra để học nó. Tôi đã lấy mã nguồn của anh ấy từ hệ thống quản lý phiên bản (revision control) và dựng một bản mô phỏng cho nó, và chỉ trong vài giờ, tôi đã tìm ra chính xác vấn đề.

Mô phỏng thiết kế cho phép bạn đưa nó vào các tình huống "ép tải" để xem nó phản ứng ra sao. Trong trường hợp đó, tôi đã có thể tái tạo lại đúng lỗi hỏng hóc trong mô phỏng và khắc phục sự cố cực kỳ nhanh chóng. Trớ trêu thay, trong khoảng thời gian mà người đồng nghiệp đó bỏ ra để cố gắng tìm lỗi trên phần cứng, anh ấy hoàn toàn có thể tự học cách viết mô phỏng một cách dễ dàng. Đây còn là một lựa chọn hấp dẫn hơn nhiều khi bạn cân nhắc rằng một khi đã biết cách mô phỏng hoạt động, bạn có thể tái sử dụng kiến thức đó từ dự án này sang dự án khác.

---

## 2. Các Công Cụ Mô Phỏng FPGA (FPGA Simulation Tools)

Có một số phần mềm mô phỏng FPGA phổ biến hiện nay. Các bộ công cụ tổng hợp và biên dịch FPGA thường đóng gói sẵn một trình mô phỏng đi kèm trong một gói tải xuống dung lượng lớn; các công ty sản xuất FPGA biết rằng kỹ sư của họ muốn chạy mô phỏng, và họ muốn tạo điều kiện thuận lợi cho việc đó. Các công cụ tích hợp này thường miễn phí và tiện lợi, nhưng chúng có thể nặng tới nhiều gigabyte và độ phức tạp của chúng có thể gây ngợp cho người mới bắt đầu.

Một giải pháp thay thế cho các bộ công cụ FPGA cồng kềnh là sử dụng một trình mô phỏng độc lập. Lợi ích của việc này là nếu bạn chuyển từ Intel (Altera) sang AMD (Xilinx), chẳng hạn, bạn không cần phải học lại một phần mềm hoàn toàn mới; trình mô phỏng của bạn vẫn giữ nguyên. Có hai công cụ mô phỏng độc lập phổ biến mà tôi thường khuyên dùng: **ModelSim** và **EDA Playground**. ModelSim có lẽ là trình mô phỏng thương mại phổ biến nhất. Nó có thể được tải xuống và cài đặt trên Windows và Linux. Bản có bản quyền đầy đủ rất đắt (tốn khoảng $2,000), nhưng có sẵn một phiên bản miễn phí bị giới hạn một số tính năng.

**EDA Playground**, trái lại, là một trình mô phỏng chạy trên nền web hoàn toàn miễn phí. Tôi khuyên bạn nên sử dụng nó khi mới bắt đầu học thiết kế FPGA vì một vài lý do. Thứ nhất, nó miễn phí. Thứ hai, vì chạy trên trình duyệt web nên không cần tải hay cài đặt phức tạp. Cuối cùng, EDA Playground cho phép bạn chia sẻ mã nguồn của mình với người khác chỉ thông qua một đường link web. Trong phạm vi cuốn sách này, chúng ta sẽ tập trung vào công cụ này.

Toàn bộ giao diện của EDA Playground tại địa chỉ edaplayground.com gồm hai khung hình mã nguồn chính:

* Khung bên phải (`design.sv` hoặc `design.vhd`): Nơi chứa mã nguồn thiết kế FPGA mà bạn muốn kiểm tra. Mã nguồn này thường được gọi là **UUT (Unit Under Test)** hoặc **DUT (Device Under Test)**.
* Khung bên trái (`testbench.sv` hoặc `testbench.vhd`): Nơi bạn viết **Testbench** — đoạn mã sẽ cấp tín hiệu và kích hoạt thiết kế FPGA của bạn trong quá trình mô phỏng.

Theo mặc định, EDA Playground được cấu hình cho các thiết kế **SystemVerilog/Verilog**, đó là lý do tại sao hai tệp mã nguồn có phần mở rộng `.sv`. Nếu bạn muốn chuyển sang cấu hình **VHDL**, chỉ cần chọn `VHDL` từ menu thả xuống trong mục **Testbench + Design** ở thanh công cụ bên trái.

> ### **SYSTEMVERILOG**
> SystemVerilog là một tập hợp mở rộng (superset) của Verilog, nghĩa là nó bao gồm tất cả các tính năng của Verilog và bổ sung thêm nhiều tính năng mới. Bất kỳ đoạn mã nào bạn viết bằng Verilog đều sẽ hoạt động bình thường trong SystemVerilog. SystemVerilog rất thường được sử dụng trong mô phỏng, ngay cả đối với các thiết kế VHDL. Có một vài lý do cho việc này. Thứ nhất, SystemVerilog cung cấp nhiều tính năng ngôn ngữ cấp cao như lớp (classes) và giao diện (interfaces), giúp việc tạo mã Testbench trở nên dễ dàng hơn và có khả năng tái sử dụng cao hơn giữa các dự án. Ngoài ra, nó cung cấp sự hỗ trợ toàn diện cho **assertions (câu lệnh khẳng định)**, một lợi thế lớn khi tạo bản mô phỏng. Trong VHDL và Verilog nguyên bản, khả năng hỗ trợ assertions hạn chế hơn nhiều.

Trước khi chạy mã trong EDA Playground, bạn cần chọn một công cụ mô phỏng (simulator tool) trong menu **Tools & Simulators**. Đây là phần mềm thực sự sẽ chạy mã của bạn trên đám mây. Bạn có thể chọn các công cụ thương mại như **Mentor Questa** hoặc **Aldec Riviera**.

### Công Cụ Dùng Trong Blog Này: GHDL + GTKWave

Sách chọn EDA Playground vì dễ bắt đầu. Blog này dùng **GHDL** và **GTKWave** — hai phần mềm mã nguồn mở chạy trên Ubuntu, không cần tài khoản hay mạng, và quan trọng hơn là chạy từ dòng lệnh nên gắn được vào script để chạy lại hàng loạt. Cặp này thay thế trọn vẹn những gì sách làm trên EDA Playground: GHDL đóng vai trình mô phỏng (chỗ sách chọn Mentor Questa hay Aldec Riviera), GTKWave đóng vai EPWave.

```bash
sudo apt install ghdl gtkwave
```

Một lần mô phỏng gồm ba bước, mỗi bước một lệnh:

| Bước | Lệnh | Làm gì |
|---|---|---|
| 1. Phân tích | `ghdl -a And_Gate_Project.vhd And_Gate_TB.vhd` | kiểm tra cú pháp, nạp vào thư viện `work` |
| 2. Elaborate | `ghdl -e And_Gate_TB` | dựng mạch từ entity cấp cao nhất |
| 3. Chạy | `ghdl -r And_Gate_TB --wave=and.ghw` | mô phỏng, ghi dạng sóng ra file |

Rồi mở dạng sóng bằng `gtkwave and.ghw`. Thay cho hai khung `design.vhd` / `testbench.vhd` của EDA Playground, bạn chỉ cần hai file `.vhd` tên gì cũng được, miễn là đưa vào bước 1 đúng thứ tự.

Ba điều hay vấp lúc đầu:

* Thứ tự file ở bước 1 quan trọng: file thiết kế phải đứng **trước** testbench, vì testbench gọi tới entity nằm trong thiết kế. Sửa file nào thì `-a` lại file đó, rồi `-e` và `-r` lại.
* Tham số cho `-e` và `-r` là **tên entity**, không phải tên file. Đây chính là ô "Top Entity" mà sách nhắc tới ở EDA Playground.
* Máy đang dùng thiếu `numeric_std` bản 2008 nên **không thêm `--std=08`**, chạy chuẩn VHDL-93 mặc định. Ở chuẩn này GHDL mặc định không chấp nhận ký tự có dấu, kể cả trong comment (báo `invalid character, even in a comment`). Comment trong blog viết có dấu cho dễ đọc, nên khi chép code về chạy hãy thêm cờ `--mb-comments` — và thêm vào **cả ba lệnh**, không chỉ `-a`: `ghdl -a --mb-comments f.vhd`, `ghdl -e --mb-comments tb`, `ghdl -r --mb-comments tb`. Lý do: bản GHDL mcode đọc lại file nguồn lúc elaborate, nên `-a` qua rồi mà `-e` vẫn báo `invalid character, even in a comment` nếu thiếu cờ. Đã thử với đủ 68 chữ cái có dấu.

Trong GTKWave, tên tín hiệu hiện toàn chữ thường (`r_in1`, `uut`) dù trong mã bạn viết hoa — VHDL không phân biệt hoa thường nên GHDL quy hết về chữ thường. Tín hiệu bên trong UUT nằm dưới nhánh `uut` của cây phân cấp bên trái; chọn tín hiệu rồi bấm **Insert**, sau đó `Ctrl+Alt+F` để dàn kín màn hình. Chạy lại mô phỏng xong thì `Ctrl+Shift+R` nạp lại file sóng mà không mất danh sách tín hiệu đã chọn.

---

## 3. Mô-đun Kiểm Tra - Testbench (The Testbench)

Mục đích của một Testbench là đặt khối logic UUT của bạn vào một môi trường mô phỏng để bạn có thể phân tích và kiểm tra xem nó có hoạt động đúng như kỳ vọng hay không. Đoạn mã Testbench sẽ khởi tạo (instantiate) UUT. Như được thể hiện trong **Hình 5-3**, Testbench cung cấp tất cả các đầu vào cần thiết cho UUT và theo dõi tất cả các đầu ra.

```
┌────────────────────────────────────┐
│             Testbench              │
│   ┌────────────────────────────┐   │
│   │      Unit Under Test       │   │
│==>│           (UUT)            │==>│
│   └────────────────────────────┘   │
└────────────────────────────────────┘
```
*Hình 5-3: Testbench bao bọc và cấp tín hiệu kích thích UUT để phân tích.*

Nếu UUT của bạn có đầu vào là tín hiệu xung nhịp (clock), Testbench sẽ cần tạo ra xung nhịp đó và đưa vào UUT. Tương tự, nếu có một giao diện dữ liệu đi vào UUT, Testbench sẽ cần tạo dữ liệu mẫu để cấp cho giao diện đó. Testbench giám sát mọi đầu ra từ UUT, cho phép nó thấy UUT phản ứng thế nào với dữ liệu đầu vào. Trong quá trình mô phỏng, bạn cũng có thể "soi" sâu vào bên trong bản thân UUT để xem tất cả các tín hiệu nội bộ của nó đang biến đổi ra sao — từng thanh ghi, xung nhịp, đường dây (wire), bộ nhớ — để đảm bảo mọi thứ hoạt động đúng thiết kế.

---

### Viết Một Testbench (Writing a Testbench)

Hãy cùng xem xét một ví dụ đơn giản bằng cách viết Testbench cho dự án Cổng AND ở Chương 3 (Dự án #2). Đầu tiên, để ôn lại, đây là mã nguồn gốc của dự án mà chúng ta muốn kiểm tra:

#### Mã nguồn Verilog (`And_Gate_Project.v`):
```verilog
module And_Gate_Project (
  input  i_Switch_1,
  input  i_Switch_2,
  output o_LED_1
);

  assign o_LED_1 = i_Switch_1 & i_Switch_2;

endmodule
```

#### Mã nguồn VHDL (`And_Gate_Project.vhd`):
```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity And_Gate_Project is
  port (
    i_Switch_1 : in  std_logic;
    i_Switch_2 : in  std_logic;
    o_LED_1    : out std_logic
  );
end entity And_Gate_Project;

architecture RTL of And_Gate_Project is
begin
  o_LED_1 <= i_Switch_1 and i_Switch_2;
end architecture RTL;
```

Nhập mã nguồn module/entity này vào khung `design.sv` hoặc `design.vhd` ở phía bên phải của EDA Playground. Để kiểm tra mã một cách hoàn chỉnh, chúng ta muốn kích thích nó để đảm bảo rằng đầu ra hoạt động đúng với **tất cả các tổ hợp đầu vào có thể có**. Trong trường hợp này, phạm vi các tổ hợp đầu vào rất nhỏ: vì chỉ có hai đầu vào nhị phân, chỉ có đúng 4 tổ hợp có thể có để kiểm tra. 

Chúng ta sẽ tạo một Testbench bằng Verilog và VHDL để khởi tạo UUT và đưa lần lượt 4 tổ hợp đầu vào này vào. Hãy nhập đoạn mã sau vào khung `testbench.sv` hoặc `testbench.vhd` trong EDA Playground:

#### Mã nguồn Verilog Testbench (`And_Gate_TB.sv`):
```verilog
module And_Gate_TB (); // [1] Không có cổng I/O đầu vào/đầu ra

  reg  r_In1 = 1'b0;
  reg  r_In2 = 1'b0;
  wire w_Out;

  // [2] Khởi tạo Unit Under Test (UUT)
  And_Gate_Project UUT (
    .i_Switch_1(r_In1),
    .i_Switch_2(r_In2),
    .o_LED_1(w_Out)
  );

  // [3] Khối khởi tạo kích thích tín hiệu
  initial begin
    // [4] Chỉ thị xuất file dạng sóng cho EPWave
    $dumpfile("dump.vcd");
    $dumpvars(0, And_Gate_TB);

    r_In1 = 1'b0;
    r_In2 = 1'b0;
    #10; // Tạm dừng 10 nanosecond

    r_In1 = 1'b0;
    r_In2 = 1'b1;
    #10;

    r_In1 = 1'b1;
    r_In2 = 1'b0;
    #10;

    r_In1 = 1'b1;
    r_In2 = 1'b1;
    #10;
  end

endmodule
```

#### Mã nguồn VHDL Testbench (`And_Gate_TB.vhd`):
```vhdl
library ieee;
use ieee.std_logic_1164.all;

-- [1] Entity Testbench không có chân I/O
entity And_Gate_TB is
end entity And_Gate_TB;

architecture RTL of And_Gate_TB is
  signal r_In1 : std_logic := '0';
  signal r_In2 : std_logic := '0';
  signal w_Out : std_logic;
begin

  -- [2] Khởi tạo Unit Under Test (UUT)
  UUT: entity work.And_Gate_Project
    port map (
      i_Switch_1 => r_In1,
      i_Switch_2 => r_In2,
      o_LED_1    => w_Out
    );

  -- [3] Khối process kích thích tín hiệu
  process begin
    r_In1 <= '0';
    r_In2 <= '0';
    wait for 10 ns;

    r_In1 <= '0';
    r_In2 <= '1';
    wait for 10 ns;

    r_In1 <= '1';
    r_In2 <= '0';
    wait for 10 ns;

    r_In1 <= '1';
    r_In2 <= '1';
    wait for 10 ns;

    wait; -- Tạm dừng process vĩnh viễn
  end process;

end architecture RTL;
```

#### Phân tích chi tiết đoạn mã:

1. **Module/Entity không có cổng I/O [1]:** Đây là lần đầu tiên chúng ta thấy một module Verilog hay entity VHDL **không khai báo bất kỳ đầu vào hay đầu ra nào**. Lý do là vì Testbench không kết nối với bất kỳ chân cắm vật lý bên ngoài nào; chính bản thân Testbench tạo ra và tự tiêu thụ các tín hiệu bên trong.
2. **Khởi tạo UUT [2]:** Chúng ta đưa UUT vào Testbench và nối các cổng đầu vào của UUT với `r_In1`, `r_In2` (biến đóng vai trò nguồn cấp tín hiệu). Đầu ra của UUT được nối với `w_Out` (đường dây giám sát). Tôi thích sử dụng tiền tố `w_` để chỉ các đường dây dẫn kết nối nội bộ.
3. **Khối cấp tín hiệu kích thích [3]:** Trong Verilog, chúng ta dùng khối `initial`, còn trong VHDL dùng khối `process`. Khối này bắt đầu chạy từ thời điểm t = 0ns của mô phỏng và thực thi lần lượt từng dòng từ trên xuống dưới. 
4. **Lệnh tạo độ trễ thời gian (`#10` / `wait for 10 ns;`):** Giữa mỗi lần thay đổi tín hiệu đầu vào, chúng ta chèn một khoảng tạm dừng 10ns. Điều này cho phép trình mô phỏng có thời gian cập nhật và hiển thị phản ứng của tín hiệu đầu ra `w_Out`. **Lưu ý cực kỳ quan trọng:** Các câu lệnh liên quan đến thời gian thực này **KHÔNG THỂ TỔNG HỢP (non-synthesizable)** thành mạch phần cứng thật trên FPGA, nhưng chúng hoạt động hoàn hảo trong môi trường mô phỏng.
5. **Chỉ thị `$dumpfile` / `$dumpvars` [4]:** Yêu cầu bắt buộc của EDA Playground đối với Verilog để xuất tệp dữ liệu dạng sóng `.vcd` phục vụ cho việc hiển thị đồ họa.

Về điểm 4, nói "cho trình mô phỏng có thời gian" là cách nói hình ảnh; bản chất khác một chút và nên hiểu cho đúng. Trình mô phỏng không cần thời gian thật để tính — nó cần **thời gian mô phỏng trôi qua**. Nhớ lại chương 4: `signal` chỉ nhận giá trị mới khi process tạm dừng. Nếu bỏ hết `wait for`, cả bốn cặp gán xảy ra ở cùng thời điểm 0 ns, chỉ cặp cuối cùng có hiệu lực, và dạng sóng của bạn là một đường thẳng. Mỗi `wait for 10 ns` vừa đẩy giá trị vào tín hiệu, vừa giữ nó đủ lâu để cổng AND kịp phản ứng và bạn nhìn thấy trên sóng.

Có một khác biệt giữa hai ngôn ngữ cần biết nếu bạn viết VHDL: khối `initial` của Verilog chạy đúng một lần rồi thôi, còn `process` của VHDL khi không có danh sách nhạy (sensitivity list) sẽ **chạy lại từ đầu** ngay khi tới `end process`. Vì thế dòng `wait;` cuối cùng không phải trang trí — không có nó, bốn tổ hợp sẽ lặp đi lặp lại vô tận và mô phỏng không bao giờ kết thúc. Đây là lỗi gặp ở ngay testbench đầu tiên của blog này.

---

### Chạy Testbench và Xem Dạng Sóng (Running a Testbench and Viewing Waveforms)

Chạy một Testbench sẽ tạo ra **dạng sóng (waveforms)** — biểu đồ trực quan thể hiện trạng thái lên/xuống của các tín hiệu theo trục thời gian. Dạng sóng là công cụ mạnh mẽ nhất để điều tra các lỗi thiết kế trong mô phỏng. EDA Playground tích hợp sẵn công cụ xem dạng sóng **EPWave**.

Để xem dạng sóng: Tích chọn **Open EPWave After Run** trên thanh công cụ bên trái. Đối với VHDL, điền tên entity cấp cao nhất vào ô **Top Entity** (ví dụ: `And_Gate_TB`). Sau đó chọn một trình mô phỏng và bấm nút **Run**. Biểu đồ dạng sóng xuất hiện như trong **Hình 5-4**.

Với GHDL, ba bước ở mục 2 làm đúng việc đó:

```bash
ghdl -a And_Gate_Project.vhd And_Gate_TB.vhd
ghdl -e And_Gate_TB
ghdl -r And_Gate_TB --wave=and.ghw
gtkwave and.ghw
```

```
Time (ns)  0         10        20        30        40        
           |         |         |         |         |
                               ┌────────────────────
r_In1      ────────────────────┘                    
                     ┌─────────┐         ┌──────────
r_In2      ──────────┘         └─────────┘          
                                         ┌──────────
w_Out      ──────────────────────────────┘          
                               ┌────────────────────
i_Switch_1 ────────────────────┘                    
                     ┌─────────┐         ┌──────────
i_Switch_2 ──────────┘         └─────────┘          
                                         ┌──────────
o_LED_1    ──────────────────────────────┘          
```
*Hình 5-4: Dạng sóng mô phỏng cổng AND — vẽ lại từ file VCD của GHDL, mỗi ký tự một nanosecond.*

Nhìn vào dạng sóng, chúng ta thấy tất cả các tín hiệu và mốc thời gian (tính bằng nanosecond) khi chúng chuyển trạng thái giữa 0 và 1:

* Ba tín hiệu phía trên (`r_In1`, `r_In2`, `w_Out`) thuộc về Testbench.
* Ba tín hiệu phía dưới (`i_Switch_1`, `i_Switch_2`, `o_LED_1`) thuộc về bên trong UUT.
* Vì chúng ta đã nối các tín hiệu của Testbench với UUT, dạng sóng của chúng hoàn toàn trùng khớp nhau.
* **Kết quả:** Đầu ra cổng AND (`o_LED_1` / `w_Out`) **chỉ lên mức 1 duy nhất trong khoảng thời gian từ 30ns đến 40ns**, khi cả hai đầu vào đều ở mức 1. Trong tất cả các khoảng thời gian khác, đầu ra giữ ở mức 0. UUT đã hoạt động hoàn toàn chính xác!

Đoạn testbench VHDL trên đã chạy lại bằng GHDL cho đúng kết quả này: `w_Out` lên 1 tại mốc 30 ns và giữ tới hết. Hai đầu vào thì bốn tổ hợp là vét cạn được bằng tay. Nhưng cách "gán, chờ, nhìn" này không mở rộng: bộ cộng nối tiếp 4 bit trong bài LAB 4 của blog có 17 bit đầu vào, tức 131.072 tổ hợp. Lúc đó bạn viết vòng lặp `for` lồng nhau trong testbench để sinh tổ hợp, và để máy so kết quả thay vì nhìn sóng — mục 5 sẽ nói cách so. Điểm cần nhớ: vòng `for` trong testbench **không tốn phần cứng** như vòng `for` trong thiết kế (chương 1 đã nói `for` trong thiết kế là nhân bản mạch), vì testbench không bao giờ được tổng hợp. Trong testbench, bạn được phép nghĩ như lập trình viên phần mềm.

---

## 4. Dự Án #4: Lọc Dội Phím Nút Nhấn (Project #4: Debouncing a Switch)

Trong Chương 4 (Dự án #3), chúng ta đã lập trình FPGA để đảo trạng thái đèn LED mỗi khi nhả nút nhấn. Tuy nhiên có một vấn đề: thao tác bấm nút không làm đèn LED đảo trạng thái một cách ổn định. Lý do là bất kỳ nút nhấn cơ học nào cũng chịu ảnh hưởng của hiện tượng **dội phím (bouncing)** — những biến động tín hiệu đóng/ngắt liên tục xảy ra khi lá đồng cơ học bên trong nút nhấn va chạm và nảy lên trước khi định hình ở trạng thái ổn định. **Hình 5-5** minh họa sự khác biệt giữa lý thuyết và thực tế. (Trên bo QMTech, như chương 4 mục 2 đã chỉ ra, cạnh xuống xảy ra lúc **bấm** chứ không phải lúc nhả, vì bo dùng điện trở kéo lên. Mọi lập luận bên dưới vẫn đúng nguyên, chỉ đổi chữ "nhả" thành "bấm".)

```
Kỳ vọng (lý thuyết):
                    ┌──────────────────────
Switch   ───────────┘

Thực tế (dội phím):
                    ┌┐ ┌┐┌┐ ┌┐  ┌───────────
Switch   ───────────┘└─┘└┘└─┘└──┘
                    |<── nảy 1-10 ms ──>|
```
*Hình 5-5: Hiện tượng dội phím (bouncing) ở nút nhấn cơ học.*

Mạch phát hiện cạnh xuống ở Dự án #3 tìm kiếm chuyển biến từ 1 xuống 0. Nhưng do dội phím, FPGA nhìn thấy **rất nhiều cạnh xuống chập chờn** trong một lần bấm nhả nút.

* Nếu số lượng cạnh xuống nhiễu là số lẻ, LED đảo trạng thái thành công.
* Nếu số lượng cạnh xuống nhiễu là số chẵn, LED đảo chẵn lần và quay về trạng thái cũ, khiến bạn tưởng nút bấm không ăn.

Để khắc phục hiện tượng này, chúng ta cần thêm một **mạch lọc dội phím (debounce filter)** cho nút nhấn — lập trình FPGA để nó **bỏ qua các xung nhiễu chập chờn** và chỉ chấp nhận tín hiệu khi nút nhấn đã giữ ổn định trong một khoảng thời gian nhất định. **Hình 5-6** hiển thị sơ đồ khối của dự án.

```
          Unfiltered       Filtered
SW1 ───> [ (Glitches) ] ───> [ Debounce ] ───> [ Logic Đảo LED ] ───> D1 (LED)
                             [  Switch  ]      [  (Chương 4)   ]
```
*Hình 5-6: Sơ đồ khối Dự án #4 - Lọc dội phím kết hợp với mạch đảo LED.*

---

### Đo Lường Thời Gian Trên FPGA (Measuring Time on an FPGA)

Để tạo bộ lọc dội phím, chúng ta phải đảm bảo tín hiệu nút nhấn giữ nguyên trạng thái liên tục trong một khoảng thời gian (ví dụ 10ms) trước khi cho phép đầu ra thay đổi. Tuy nhiên, việc đưa khái niệm thời gian vào FPGA đặt ra một thách thức lớn.

**Thời gian không tự nhiên tồn tại bên trong FPGA.** FPGA không tự biết bây giờ là mấy giờ hay làm sao để tự dừng lại 100ms. Mặc dù trong Verilog có cú pháp `$time` hay trong VHDL có từ khóa `now`, `#10`, `wait for 10 ns;`, những cú pháp này **100% KHÔNG THỂ TỔNG HỢP (non-synthesizable)** thành mạch phần cứng thật trên FPGA. Chúng sẽ bị công cụ tổng hợp báo lỗi hoặc bỏ qua.

**Giải pháp: Đếm chu kỳ xung nhịp (Counting Clock Cycles)**
Cách duy nhất để đo thời gian trên FPGA thật là **đếm số chu kỳ xung nhịp (clock cycles)**. Nếu bạn biết chu kỳ của xung nhịp gốc (clock period) và số chu kỳ đã trôi qua, bạn sẽ biết chính xác bao nhiêu thời gian đã trôi qua:

`Số chu kỳ cần đếm = Khoảng thời gian cần chờ / Chu kỳ xung nhịp`

Ví dụ với bo trong sách, xung nhịp 25 MHz tức chu kỳ 40 ns. Muốn chờ 10 ms (10.000.000 ns) để chắc phím đã hết dội:

`10.000.000 ns / 40 ns = 250.000 chu kỳ`

Bo QMTech chạy 50 MHz, chu kỳ 20 ns, nên cùng 10 ms đó là **500.000 chu kỳ** — đúng con số chương 4 mục 2 đã hẹn. Bộ đếm cần 19 bit (2^19 = 524.288) thay vì 18 bit như trong sách.

---

### Viết Mã Nguồn (Writing the Code)

Chúng ta xây dựng kiến trúc phân cấp: Module cấp cao `Debounce_Project_Top` sẽ kết nối module lọc dội phím `Debounce_Filter` với module đảo LED `LED_Toggle_Project` từ Chương 4.

Chúng ta sử dụng từ khóa **Parameter** (trong Verilog) hoặc **Generic** (trong VHDL) cho biến `DEBOUNCE_LIMIT = 250000`. Điều này cho phép thay đổi giới hạn đếm từ module cấp cao mà không cần sửa mã nguồn bên trong module bộ lọc.

#### Mã nguồn Verilog Top-Level (`Debounce_Project_Top.v`):
```verilog
module Debounce_Project_Top (
  input  i_Clk,
  input  i_Switch_1,
  output o_LED_1
);

  wire w_Debounced_Switch;

  // [1] Khởi tạo module lọc dội phím với tham số DEBOUNCE_LIMIT = 250000
  Debounce_Filter #(
    .DEBOUNCE_LIMIT(250000) // [2] Đếm 250,000 chu kỳ (10ms ở 25MHz)
  ) Debounce_Filter_Inst (
    .i_Clk(i_Clk),
    .i_Bouncy(i_Switch_1),
    .o_Debounced(w_Debounced_Switch)
  );

  // [3] Tái sử dụng module đảo LED từ Chương 4
  LED_Toggle_Project LED_Toggle_Inst (
    .i_Clk(i_Clk),
    .i_Switch_1(w_Debounced_Switch),
    .o_LED_1(o_LED_1)
  );

endmodule
```

#### Mã nguồn VHDL Top-Level (`Debounce_Project_Top.vhd`):
```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity Debounce_Project_Top is
  port (
    i_Clk      : in  std_logic;
    i_Switch_1 : in  std_logic;
    o_LED_1    : out std_logic
  );
end entity Debounce_Project_Top;

architecture RTL of Debounce_Project_Top is
  signal w_Debounced_Switch : std_logic;
begin

  -- [1] Khởi tạo module lọc dội phím
  Debounce_Filter_Inst: entity work.Debounce_Filter
    generic map (
      DEBOUNCE_LIMIT => 250000 -- [2] Đếm 250,000 chu kỳ (10ms)
    )
    port map (
      i_Clk       => i_Clk,
      i_Bouncy    => i_Switch_1,
      o_Debounced => w_Debounced_Switch
    );

  -- [3] Tái sử dụng module đảo LED
  LED_Toggle_Inst: entity work.LED_Toggle_Project
    port map (
      i_Clk      => i_Clk,
      i_Switch_1 => w_Debounced_Switch,
      o_LED_1    => o_LED_1
    );

end architecture RTL;
```

Tiếp theo là mã nguồn chi tiết của module lọc dội phím `Debounce_Filter`:

#### Mã nguồn Verilog (`Debounce_Filter.v`):
```verilog
module Debounce_Filter #(
  parameter DEBOUNCE_LIMIT = 250000
) (
  input  i_Clk,
  input  i_Bouncy,
  output o_Debounced
);

  // [1] Tính toán động độ rộng bit cho thanh ghi bộ đếm bằng $clog2
  reg [$clog2(DEBOUNCE_LIMIT)-1:0] r_Count = 0;
  reg r_State = 1'b0;

  always @(posedge i_Clk)
  begin
    // [2] Nếu đầu vào khác đầu ra và chưa đếm đủ thời gian
    if (i_Bouncy != r_State && r_Count < DEBOUNCE_LIMIT - 1)
    begin
      r_Count <= r_Count + 1; // Tăng bộ đếm
    end
    // [3] Khi tín hiệu ổn định liên tục đủ DEBOUNCE_LIMIT chu kỳ
    else if (r_Count == DEBOUNCE_LIMIT - 1)
    begin
      r_Count <= 0;
      r_State <= i_Bouncy;    // [5] Cập nhật trạng thái mới cho đầu ra
    end
    // [4] Nếu đầu vào giống đầu ra (tín hiệu đã ổn định)
    else
    begin
      r_Count <= 0;           // Reset bộ đếm về 0
    end
  end

  assign o_Debounced = r_State;

endmodule
```

#### Mã nguồn VHDL (`Debounce_Filter.vhd`):
```vhdl
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity Debounce_Filter is
  generic (
    DEBOUNCE_LIMIT : integer := 250000
  );
  port (
    i_Clk       : in  std_logic;
    i_Bouncy    : in  std_logic;
    o_Debounced : out std_logic
  );
end entity Debounce_Filter;

architecture RTL of Debounce_Filter is
  -- [1] Tự động định kích thước bộ đếm bằng thuộc tính range
  signal r_Count : integer range 0 to DEBOUNCE_LIMIT - 1 := 0;
  signal r_State : std_logic := '0';
begin

  process (i_Clk)
  begin
    if rising_edge(i_Clk) then
      -- [2] Nếu đầu vào khác đầu ra và chưa đếm đủ giới hạn
      if i_Bouncy /= r_State and r_Count < DEBOUNCE_LIMIT - 1 then
        r_Count <= r_Count + 1;
      -- [3] Khi bộ đếm chạm giới hạn
      elsif r_Count = DEBOUNCE_LIMIT - 1 then
        r_Count <= 0;
        r_State <= i_Bouncy; -- [5] Cập nhật trạng thái mới
      -- [4] Nếu đầu vào giống đầu ra
      else
        r_Count <= 0;
      end if;
    end if;
  end process;

  o_Debounced <= r_State;

end architecture RTL;
```

#### Giải thích thuật toán lọc dội phím:

1. **Tự động định kích thước thanh ghi bộ đếm [1]:** Trong Verilog, hàm `$clog2(DEBOUNCE_LIMIT)` (logarithm cơ số 2 lấy trần) tự động tính số bit tối thiểu cần thiết để chứa giá trị `250000` (`2^18 = 262.144`, tức 18 bit). Trong VHDL, cú pháp `range 0 to DEBOUNCE_LIMIT - 1` thực hiện điều tương tự. Sách nói mô phỏng sẽ "cảnh báo" nếu bộ đếm tràn; với GHDL thì mạnh hơn thế: nó **dừng hẳn mô phỏng** với lỗi `bound check failure` kèm số dòng (đã thử: gán 4 vào `integer range 0 to 3`). Đây là điểm cộng của kiểu `integer` có `range` so với `unsigned` — tràn số bị bắt tại chỗ thay vì âm thầm quay về 0.
2. **Theo dõi biến động [2]:** Nếu `i_Bouncy != r_State`, có nghĩa là nút bấm vừa được tác động hoặc đang dội nhiễu. Mạch giữ nguyên đầu ra `o_Debounced` và tăng bộ đếm `r_Count <= r_Count + 1`.
3. **Reset khi dội nhiễu giữa chừng [4]:** Nếu trong quá trình đếm, tín hiệu dội nhiễu quay ngược lại giá trị cũ (`i_Bouncy == r_State`), nhánh `else` được kích hoạt và reset `r_Count <= 0`. Bộ đếm buộc phải đếm lại từ đầu!
4. **Cập nhật đầu ra [3, 5]:** Chỉ khi tín hiệu giữ nguyên trạng thái mới liên tục đủ `DEBOUNCE_LIMIT` chu kỳ xung nhịp không bị ngắt quãng, bộ đếm mới chạm ngưỡng `DEBOUNCE_LIMIT - 1`, chốt giá trị mới vào `r_State` và xuất ra `o_Debounced`.

Có hai cách viết mạch lọc này và cả hai đều đúng. Sách so sánh **đầu vào với đầu ra** (`i_Bouncy /= r_State`): chỉ đếm khi đầu vào khác đầu ra, nên lúc nút nằm yên bộ đếm cũng nằm yên. Bài C1 của blog này so sánh **mẫu hiện tại với mẫu trước đó** (`btn_ff2 = pre_sw`): đếm mỗi khi tín hiệu giữ nguyên so với chu kỳ trước, đủ ngưỡng thì chốt. Cách của sách gọn hơn một flip-flop; cách kia dễ đọc hơn nếu bạn nghĩ theo hướng "ổn định liên tục N chu kỳ".

Điều quan trọng hơn là thứ sách vẫn chưa làm: `i_Bouncy` đi thẳng từ chân chip vào phép so sánh, không qua hai flip-flop đồng bộ như chương 4 mục 2 đã cảnh báo. Trong mô phỏng không bao giờ thấy hậu quả, nhưng trên bo thật thì phải đặt hai flip-flop đó **trước** bộ lọc — nói cách khác, `i_Bouncy` phải là đầu ra của flip-flop thứ hai. Bài C1 gộp luôn hai flip-flop vào trong cùng entity với bộ lọc.

---

### Tạo Testbench và Mô Phỏng (Creating the Testbench and Simulation)

Chúng ta viết Testbench giả lập một tín hiệu phím bấm bị dội nhiễu để kiểm tra module `Debounce_Filter`.

#### Mẹo cực hay cho kỹ sư FPGA:
Trong Testbench, chúng ta **ghi đè tham số `DEBOUNCE_LIMIT = 4`** (chỉ đếm 4 chu kỳ thay vì 250,000 chu kỳ). Logic thuật toán hoàn toàn giống nhau giữa 4 chu kỳ và 250,000 chu kỳ. Việc rút ngắn bộ đếm giúp mô phỏng chạy cực nhanh và biểu đồ dạng sóng rất dễ soi!

#### Mã nguồn Verilog Testbench (`Debounce_Filter_TB.sv`):
```verilog
module Debounce_Filter_TB ();

  reg  r_Clk = 1'b0;
  reg  r_Bouncy = 1'b0;
  wire w_Debounced;

  // [1] Tạo tín hiệu Clock mô phỏng (đảo trạng thái mỗi 2ns -> Chu kỳ 4ns)
  always #2 r_Clk = ~r_Clk;

  // [2] Khởi tạo UUT và ghi đè DEBOUNCE_LIMIT = 4
  Debounce_Filter #(
    .DEBOUNCE_LIMIT(4)
  ) UUT (
    .i_Clk(r_Clk),
    .i_Bouncy(r_Bouncy),
    .o_Debounced(w_Debounced)
  );

  initial begin
    $dumpfile("dump.vcd");
    $dumpvars(0, Debounce_Filter_TB);

    // [3] Đồng bộ hóa tín hiệu kích thích theo cạnh lên Clock
    r_Bouncy = 1'b0;
    @(posedge r_Clk);

    // [4] Giả lập 1 xung nhiễu dội phím ngắn (chỉ kéo dài 1 chu kỳ Clock)
    r_Bouncy = 1'b1;
    @(posedge r_Clk);
    // [5] Ngay lập tức rớt về 0
    r_Bouncy = 1'b0;
    @(posedge r_Clk);
    @(posedge r_Clk);

    // [6] Bây giờ giữ tín hiệu ở mức 1 liên tục qua nhiều chu kỳ Clock
    r_Bouncy = 1'b1;
    @(posedge r_Clk);
    @(posedge r_Clk);
    @(posedge r_Clk);
    @(posedge r_Clk);
    @(posedge r_Clk);
    @(posedge r_Clk);

    #20;
    $finish();
  end

endmodule
```

#### Mã nguồn VHDL Testbench (`Debounce_Filter_TB.vhd`):
```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity Debounce_Filter_TB is
end entity Debounce_Filter_TB;

architecture RTL of Debounce_Filter_TB is
  signal r_Clk       : std_logic := '0';
  signal r_Bouncy    : std_logic := '0';
  signal w_Debounced : std_logic;
begin

  -- [1] Tạo tín hiệu Clock mô phỏng (chu kỳ 4ns)
  r_Clk <= not r_Clk after 2 ns;

  -- [2] Khởi tạo UUT với DEBOUNCE_LIMIT = 4
  UUT: entity work.Debounce_Filter
    generic map (
      DEBOUNCE_LIMIT => 4
    )
    port map (
      i_Clk       => r_Clk,
      i_Bouncy    => r_Bouncy,
      o_Debounced => w_Debounced
    );

  process begin
    r_Bouncy <= '0';
    wait until rising_edge(r_Clk);

    -- [4] Xung nhiễu 1 chu kỳ
    r_Bouncy <= '1';
    wait until rising_edge(r_Clk);
    -- [5] Rớt về 0
    r_Bouncy <= '0';
    wait until rising_edge(r_Clk);
    wait until rising_edge(r_Clk);

    -- [6] Giữ mức 1 ổn định
    r_Bouncy <= '1';
    wait until rising_edge(r_Clk);
    wait until rising_edge(r_Clk);
    wait until rising_edge(r_Clk);
    wait until rising_edge(r_Clk);
    wait until rising_edge(r_Clk);

    wait for 20 ns;
    wait;
  end process;

end architecture RTL;
```

Testbench này có hai chỗ đáng dừng lại.

Thứ nhất, dòng `r_Clk <= not r_Clk after 2 ns;` là một phép gán đồng thời tự kích hoạt chính nó, nên xung nhịp **chạy mãi không dừng**. Process kích thích có `wait;` ở cuối, nhưng xung nhịp thì không có gì chặn. Sách vẫn ra được Hình 5-7 trên EDA Playground; còn với GHDL, đã thử, lệnh `ghdl -r` treo luôn không bao giờ thoát. Có hai cách xử lý:

```bash
ghdl -r Debounce_Filter_TB --wave=deb.ghw --stop-time=60ns
```

hoặc viết xung nhịp thành một process có điều kiện dừng, và bật cờ đó ở cuối process kích thích:

```vhdl
signal xong : boolean := false;
...
process begin
  while not xong loop
    r_Clk <= '0'; wait for 2 ns;
    r_Clk <= '1'; wait for 2 ns;
  end loop;
  wait;
end process;
```

Cách thứ hai tốt hơn vì testbench tự biết khi nào xong, không phụ thuộc vào ai gõ lệnh. Các testbench trong blog này dùng cách đó.

Thứ hai, để ý mẫu `r_Bouncy <= '1'; wait until rising_edge(r_Clk);`. Lệnh gán nằm **ngay sau** một cạnh lên (vì dòng `wait until` phía trên vừa trả về). Theo quy tắc chương 4 — tín hiệu chỉ cập nhật sau khi process tạm dừng — UUT không thấy giá trị mới ở cạnh vừa rồi, mà ở **cạnh kế tiếp**. Đó là lý do trong Hình 5-7 bộ đếm luôn phản ứng chậm một cạnh so với dòng `i_Bouncy`. Trong Verilog, mẫu tương đương `r_Bouncy = 1'b1; @(posedge r_Clk);` dùng phép gán tức thời nên có thể tranh chấp (race) với khối `always` của UUT; VHDL không có vấn đề đó nhờ cơ chế delta cycle.

#### Kết quả dạng sóng mô phỏng (Hình 5-7):
```
Time (ns)   0   4   8   12  16  20  24  28  32  36  
            |   |   |   |   |   |   |   |   |   |
              ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐
r_Clk       ──┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └
              ┌───┐       ┌──────────────────────
i_Bouncy    ──┘   └───────┘                      
                                          ┌──────
o_Debounced ──────────────────────────────┘      
r_Count     0     1   0       1   2   3   0      
```
*Hình 5-7: Dạng sóng kiểm thử bộ lọc dội phím — vẽ lại từ file VCD của GHDL, mỗi ký tự một nanosecond; dòng `r_Count` ghi giá trị tại cột nó bắt đầu đổi.*

**Phân tích dạng sóng:**

1. Khi `i_Bouncy` vọt lên 1 trong **đúng 1 chu kỳ Clock** rồi rớt xuống 0 (xung nhiễu dội phím): Bộ đếm `r_Count` tăng lên 1 rồi bị reset ngay về 0. Đầu ra `o_Debounced` **vẫn giữ nguyên ở mức 0** (bộ lọc đã loại bỏ nhiễu thành công!).
2. Khi `i_Bouncy` giữ ở mức 1 liên tục: Bộ đếm `r_Count` tăng dần từ 0, 1, 2, đến 3. Tại chu kỳ thứ 4, `o_Debounced` chuyển sang mức 1 chính xác! Mạch lọc dội phím hoạt động hoàn hảo.

Chạy bằng GHDL với `--stop-time=60ns` cho đúng chuỗi này. Cạnh lên rơi vào các mốc 2, 6, 10, 14, ... ns; `r_Count` đọc được lần lượt 0, 1, 0, 0, 1, 2, 3, 0 tại các cạnh đó, và `o_Debounced` lên 1 ở mốc 30 ns — cạnh thứ tư kể từ khi `i_Bouncy` giữ ổn định.

---

### Biên Dịch và Nạp Chip (Building and Programming the FPGA)

Sau khi mô phỏng thành công, tạo dự án mới trong iCEcube2, thêm 3 file `Debounce_Filter`, `Debounce_Project_Top`, `LED_Toggle_Project` cùng các file ràng buộc `.pcf` và `.sdc`.

Báo cáo tổng hợp (**Synthesis Report**) ghi nhận sự gia tăng tài nguyên tiêu tốn do có thêm thanh ghi bộ đếm 18-bit và các LUT so sánh trong bộ lọc. Tuy nhiên chip FPGA vẫn còn trống rất nhiều tài nguyên.

Nạp file `.bin` vào bo mạch qua Diamond Programmer và bấm thử phím — đèn LED hiện tại **đảo trạng thái cực kỳ mượt mà và chính xác 100%** ở mỗi lần bấm nhả nút!

Trên Vivado với bo QMTech, quy trình giống chương 4 mục 2: thêm ba file `.vhd` (`Debounce_Filter`, `Debounce_Project_Top`, `LED_Toggle_Project`) vào Design Sources, và file `.xdc` lấy từ dự án #3 vì chân xung nhịp, nút và đèn không đổi — nhưng tên port trong `get_ports` phải đổi cho khớp entity cấp cao nhất (`i_Clk`, `i_Switch_1`, `o_LED_1` thay vì `i_clk`, `i_switch`, `o_led` như chương 4), nếu không Vivado sẽ báo không tìm thấy port và để chân trôi nổi. Hai chỗ phải sửa so với sách: `DEBOUNCE_LIMIT => 500000` ở `generic map` của file top-level, và thêm hai flip-flop đồng bộ trước bộ lọc như đã nói ở trên. Sau Synthesis, mở Report Utilization sẽ thấy số flip-flop tăng lên vì bộ đếm 19 bit; con số cụ thể chưa chạy nên chưa ghi ở đây.

---

## 5. Testbench Tự Kiểm Tra (Self-Checking Testbenches)

Nhìn dạng sóng (waveform) bằng mắt thường để tìm lỗi rất tốn thời gian và dễ sót. Giải pháp nâng cao là viết **Self-Checking Testbench** — một đoạn code tự động kiểm tra kết quả và báo lỗi nếu đầu ra không đúng kỳ vọng.

Thành phần cốt lõi của một Self-Checking Testbench là câu lệnh **`assert` (Khẳng định)**.

Hãy bổ sung câu lệnh `assert` vào Testbench cổng AND từ đầu chương:

### Mã nguồn Verilog (SystemVerilog Assertions):
```verilog
  initial begin
    r_In1 = 1'b0; r_In2 = 1'b0; #10;
    // [1] Khẳng định w_Out phải bằng 0
    assert (w_Out == 1'b0) else $error("Error: Output should be 0!");

    r_In1 = 1'b0; r_In2 = 1'b1; #10;
    assert (w_Out == 1'b0) else $error("Error: Output should be 0!");

    r_In1 = 1'b1; r_In2 = 1'b0; #10;
    assert (w_Out == 1'b0) else $error("Error: Output should be 0!");

    r_In1 = 1'b1; r_In2 = 1'b1; #10;
    assert (w_Out == 1'b1) else $error("Error: Output should be 1!");
  end
```

### Mã nguồn VHDL Assertions:
```vhdl
  process begin
    r_In1 <= '0'; r_In2 <= '0'; wait for 10 ns;
    -- [1] Khẳng định w_Out phải bằng 0
    assert (w_Out = '0') report "Error: Output should be 0!" severity failure;

    r_In1 <= '0'; r_In2 <= '1'; wait for 10 ns;
    assert (w_Out = '0') report "Error: Output should be 0!" severity failure;

    r_In1 <= '1'; r_In2 <= '0'; wait for 10 ns;
    assert (w_Out = '0') report "Error: Output should be 0!" severity failure;

    r_In1 <= '1'; r_In2 <= '1'; wait for 10 ns;
    assert (w_Out = '1') report "Error: Output should be 1!" severity failure;

    wait;
  end process;
```

### Nếu câu lệnh `assert` bị vi phạm, trình mô phỏng sẽ in ngay dòng thông báo lỗi ra màn hình console:

* **Trong Verilog / SystemVerilog:**
  `# ASSERT: Error: ASRT_0301 testbench.sv(20): Immediate assert condition (w_Out==1'b1) FAILED at time: 10ns, scope: And_Gate_TB`
* **Trong VHDL:**
  `# ** Failure: Assertion violation. Time: 10 ns Iteration: 0 Process: /and_gate_tb/line__22 File: testbench.vhd`

Thông báo chỉ rõ **chính xác thời điểm xảy ra lỗi (10ns)** và **dòng code bị lỗi (dòng 20 hoặc 22)**. Nhờ đó bạn có thể nhảy thẳng đến thời điểm đó trên dạng sóng để sửa bug mà không phải ngồi dò từng nanosecond từ đầu!

Hai dòng trên là định dạng của ModelSim. GHDL in gọn hơn, theo mẫu `file:dòng:cột:@thời_điểm:(mức): thông_điệp`. Đây là kết quả thật khi cố ý sửa assert đầu tiên thành sai:

```
And_Gate_TB.vhd:18:5:@10ns:(assertion failure): Error: Output should be 0!
ghdl:error: assertion failed
ghdl:error: simulation failed
```

Đủ cả bốn thứ cần: file, dòng, thời điểm, và thông điệp bạn tự viết. Mã thoát của lệnh là 1, nên script có thể bắt được mà không cần đọc màn hình.

### Bốn Mức Severity Và Cách GHDL Phản Ứng

VHDL có bốn mức cho `assert`: `note`, `warning`, `error`, `failure`. Sách chỉ dùng `failure`, nhưng nên biết cả bốn vì chúng quyết định mô phỏng **dừng hay chạy tiếp** sau khi phát hiện lỗi. Đã thử trên GHDL 0.37 với bốn assert sai liên tiếp: ba mức đầu chỉ in rồi đi tiếp, chỉ `failure` mới dừng. Nghĩa là mặc định `severity error` **không dừng** mô phỏng — điều này ngược với tên gọi, và là chỗ dễ nhầm.

Chọn mức nào tùy mục đích:

* `failure` khi một lỗi là đủ để kết luận — như testbench cổng AND ở trên. Dừng ngay tại ca sai đầu tiên, nhìn sóng ngay chỗ đó.
* `error` hoặc `warning` khi bạn muốn **chạy hết** rồi mới xem tổng số ca sai — đây là cách phù hợp khi vét cạn hàng trăm nghìn tổ hợp, vì dừng ở ca sai đầu tiên thì bạn không biết lỗi là một ca lẻ hay cả một vùng.
* `note` và lệnh `report "..."` không kèm `assert` để in thông tin tiến độ, kiểu "da xong 1000 ca".

Một mẹo tận dụng điều này: cuối testbench đặt `assert false report "=== TEST PASSED ===" severity failure;` để mô phỏng tự dừng và in dòng kết luận. Hai dòng `assertion failed` / `simulation failed` phía sau không phải lỗi thật, chỉ là cách GHDL kết thúc.

### Mô Hình Tham Chiếu (Reference Model)

Testbench cổng AND viết tay từng kỳ vọng vì chỉ có bốn ca. Với bộ cộng nối tiếp 131.072 ca ở LAB 4, không ai viết tay. Cách làm là viết ngay trong testbench một **mô hình tham chiếu**: cùng một phép tính nhưng viết theo kiểu đơn giản nhất, không quan tâm phần cứng, ví dụ `resize(unsigned(a), W+1) + resize(unsigned(b), W+1)` cho phép cộng. Vòng lặp sinh tổ hợp, đưa vào UUT, chờ UUT xong, rồi `assert` kết quả của UUT bằng kết quả của mô hình. Mô hình tham chiếu được phép chậm, được phép dùng mọi thứ không tổng hợp được — nó chỉ cần đúng và dễ đọc.

Khi số ca lớn, in ra màn hình không còn thực tế. Gói `std.textio` cho phép ghi ra file: khai báo `file f : text open write_mode is "ket_qua.txt";`, mỗi dòng ghi bằng `write(l, string'("..."))` rồi `writeline(f, l)`. Testbench LAB 4 chỉ ghi các ca FAIL, nên file rỗng là tin tốt.

---

## 6. Trạng Thái Ban Đầu Của Tín Hiệu (Initial Signal Conditions)

Trong mô phỏng, nếu một biến/thanh ghi không được gán giá trị ban đầu, trình mô phỏng sẽ hiển thị nó dưới dạng **trạng thái không xác định (X)** — thể hiện bằng **đường màu đỏ** trên dạng sóng.

Chữ `X` ở đây là của Verilog. Trong VHDL, `std_logic` có tới chín giá trị và dành hẳn một ký hiệu riêng cho "chưa khởi tạo": **`'U'`** (uninitialized). Đã thử với GHDL: tín hiệu khai báo không có `:= '0'` thì đọc ra `'U'` cho tới khi được gán lần đầu. Còn `'X'` trong VHDL mang nghĩa khác — **xung đột**, khi hai nguồn cùng lái một dây với giá trị trái ngược (chương 4 đã gặp khi vi phạm quy tắc một dây một nguồn). Phân biệt được hai ký hiệu này giúp bạn đoán ngay loại lỗi: thấy `'U'` là quên khởi tạo hoặc quên reset, thấy `'X'` là có hai process cùng gán một tín hiệu.

Có 2 cách để đưa tín hiệu về trạng thái ban đầu xác định:

1. **Khởi tạo trực tiếp (Direct Initialization):**
   * Verilog: `reg r_State = 1'b0;`
   * VHDL: `signal r_State : std_logic := '0';`
   * *Hạn chế:* Không phải dòng chip FPGA nào cũng hỗ trợ nạp giá trị ban đầu vào Flip-flop khi mới cắm nguồn.
2. **Sử dụng tín hiệu Reset (Khuyên dùng):** Sử dụng chân Reset để đưa các Flip-flop về trạng thái mặc định. Đây là phương pháp chuẩn mực và có tính di động (portability) cao nhất trên mọi họ chip FPGA.

Với Xilinx 7-series thì hạn chế ở cách 1 không áp dụng: như chương 4 mục 5 đã nói, giá trị `:= '0'` được nạp thẳng vào flip-flop qua bitstream, và Xilinx còn khuyên hạn chế reset để tiết kiệm routing. Nên trên QMTech, khởi tạo trực tiếp là đủ cho các dự án trong sách; reset chỉ cần khi mạch phải quay về trạng thái đầu giữa chừng mà không tắt nguồn.

---

## 7. Tìm Lỗi Trực Tiếp Trên FPGA (On-FPGA Debugging)

Ngoài mô phỏng, các công cụ FPGA có cung cấp tính năng nhúng một bộ phân tích logic ảo (**Internal Logic Analyzer**) vào trực tiếp trong chip thật để soi tín hiệu nội bộ (AMD có **ILA** — Integrated Logic Analyzer, Intel có **Signal Tap**, Lattice có **Reveal**).

Tuy nhiên, tác giả khuyên **nên hạn chế tối đa phương pháp này** vì 3 nhược điểm lớn:

1. **Tốn tài nguyên:** Chiếm dụng một lượng lớn LUT, Flip-flop và Block RAM trên chip.
2. **Mất thời gian biên dịch lại:** Mỗi lần chọn đường tín hiệu mới để soi, bạn phải biên dịch lại toàn bộ dự án (tốn hàng chục phút).
3. **Hiệu ứng người quan sát (Observer Effect):** Việc chèn thêm bộ phân tích logic sẽ làm thay đổi cấu trúc đường dây đi tuyến (routing) trên chip. Nhiều lỗi thời gian hay xung đột tốc độ (race conditions) có thể **tự dưng biến mất** khi bạn bật tool debug, và xuất hiện trở lại khi bạn tắt tool debug!

---

## 8. Xác Minh Thiết Kế - Verification (Verification)

Trong các tập đoàn sản xuất chip lớn, quy trình kiểm tra không dừng lại ở mức Testbench đơn giản mà nâng lên thành một ngành riêng gọi là **Verification (Xác minh thiết kế)** do các kỹ sư Verification chuyên trách.

* **Sự cần thiết tuyệt đối với ASIC:** Đúc một con chip ASIC tốn hàng triệu USD. Nếu chip bị lỗi sau khi đúc ra từ nhà máy (fab), toàn bộ số tiền đó sẽ "bay màu". Do đó, các kỹ sư Verification phải kiểm tra hàng triệu tình huống ngẫu nhiên (corner cases) bằng SystemVerilog để đảm bảo chip 100% không có lỗi trước khi đem đi đúc.
* **Đối với FPGA:** Do FPGA có thể tái lập trình lại để sửa lỗi ngoài thực địa (Field Programmable), các dự án FPGA thường không đòi hỏi quy trình Verification quá đắt đỏ, ngoại trừ các chip **OTP (One-Time Programmable)** dùng trong ứng dụng hàng không vũ trụ hay quân sự.

---

## 9. Tóm Tắt Chương (Summary)

Trong chương này, bạn đã nắm vững:

* **Tầm quan trọng của mô phỏng:** Mở "chiếc hộp đen" FPGA để soi từng tín hiệu nội bộ.
* **Testbench & EPWave Waveform:** Cấp tín hiệu thử nghiệm và đọc kết quả trên dạng sóng.
* **Đo thời gian trên FPGA:** Cách duy nhất trên phần cứng thật là đếm chu kỳ xung nhịp (Clock cycles).
* **Mạch lọc dội phím (Debounce filter):** Loại bỏ nhiễu cơ học của nút nhấn.
* **Self-Checking Testbench:** Sử dụng câu lệnh `assert` để tự động phát hiện lỗi.
* **On-FPGA Debugging & Verification:** Hiểu được giới hạn của bộ phân tích logic nội bộ và vai trò của xác minh thiết kế.

Thêm vào đó, từ góc độ thực hành với GHDL và bo QMTech:

* **Ba lệnh `ghdl -a`, `-e`, `-r`** thay cho EDA Playground; tham số là tên entity, file thiết kế phân tích trước testbench, không dùng `--std=08` trên máy này, thêm `--mb-comments` vào cả `-a`, `-e`, `-r` vì comment có dấu.
* **Process không có sensitivity list chạy lặp lại mãi** — `wait;` cuối process kích thích là bắt buộc, và xung nhịp viết bằng `after` thì không bao giờ dừng: dùng `--stop-time` hoặc cờ `xong` trong process xung nhịp.
* **Gán ngay sau `wait until rising_edge`** thì UUT thấy giá trị ở cạnh kế tiếp, không phải cạnh vừa rồi.
* **Chỉ `severity failure` mới dừng GHDL**; `error` in rồi chạy tiếp. Vét cạn thì dùng `error` để thấy hết, kiểm nhanh thì dùng `failure`.
* **`'U'` là chưa khởi tạo, `'X'` là xung đột nguồn lái** — hai lỗi khác nhau, hai ký hiệu khác nhau.
* **Tràn `integer range` làm GHDL dừng với `bound check failure`**, không chỉ cảnh báo.
* **Trên QMTech: 500.000 chu kỳ cho 10 ms, bộ đếm 19 bit**, và hai flip-flop đồng bộ phải đứng trước bộ lọc.
