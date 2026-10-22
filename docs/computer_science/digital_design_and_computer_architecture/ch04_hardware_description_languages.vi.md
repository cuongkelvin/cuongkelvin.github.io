![img_p193](images/ch04/img_p193.png)

# 4 Hardware description language

- 4.1 Giới thiệu
- 4.2 Combinational logic
- 4.3 Structural modeling
- 4.4 Sequential logic
- 4.5 Thêm về combinational logic
- 4.6 Finite state machine
- 4.7 Data type\*
- 4.8 Parameterized module\*
- 4.9 Testbenches
- 4.10 Tóm tắt
- Bài tập
- Câu hỏi phỏng vấn

## 4.1 GIỚI THIỆU

Đến đây, chúng ta đã tập trung thiết kế combinational và sequential digital circuit ở mức schematic. Quá trình tìm một tập logic gate hiệu quả để thực hiện function cho trước tốn nhiều công sức và dễ mắc lỗi: phải đơn giản hóa thủ công truth table hoặc Boolean equation, rồi chuyển finite state machine (FSM) thành gate bằng tay. Trong thập niên 1990, designer nhận thấy năng suất cao hơn nhiều nếu làm việc ở mức abstraction cao hơn, chỉ xác định logical function và để công cụ computer-aided design (CAD) tạo các gate đã tối ưu. Specification thường được viết bằng hardware description language (HDL). Hai HDL hàng đầu là SystemVerilog và VHDL.

![img_p194](images/ch04/img_p194.png)

SystemVerilog và VHDL được xây dựng trên các nguyên tắc tương tự nhưng có syntax khác nhau. Phần trình bày hai ngôn ngữ trong chương này được chia thành hai cột để so sánh side-by-side theo nghĩa đen, SystemVerilog bên trái và VHDL bên phải. Lần đọc đầu, hãy tập trung vào một trong hai ngôn ngữ. Khi đã biết một, bạn sẽ nhanh chóng làm chủ ngôn ngữ còn lại nếu cần.

Các chương tiếp theo trình bày hardware dưới cả dạng schematic và HDL. Nếu bỏ qua chương này và không học một HDL, bạn vẫn có thể nắm vững nguyên tắc computer organization từ schematic. Tuy nhiên, đại đa số hệ thống thương mại hiện được xây bằng HDL thay vì schematic. Nếu dự định làm digital design vào bất cứ lúc nào trong sự nghiệp, chúng tôi khuyến khích bạn học một trong hai HDL.

### 4.1.1 Module

Khối hardware có input và output gọi module. AND gate, multiplexer, priority circuit đều là ví dụ. Hai phong cách mô tả function chính là behavioral và structural. Behavioral model mô tả module làm gì. Structural model mô tả cách xây từ phần đơn giản hơn, ứng dụng hierarchy. Code SystemVerilog và VHDL trong Ví dụ HDL 4.1 minh họa behavioral description tính Boolean function Ví dụ 2.6, `y` = $\overline{\texttt{a}}$ $\overline{\texttt{b}}$ $\overline{\texttt{c}}$ + `a`$\overline{\texttt{b}}$ $\overline{\texttt{c}}$ + `a`$\overline{\texttt{b}}$`c`. Cả hai đặt tên module `sillyfunction`, ba input `a`, `b`, `c`, một output `y`.

> Một số người vẫn dùng Verilog, phiên bản ban đầu của SystemVerilog. Vì vậy website đi kèm có phiên bản chương mô tả Verilog (xem Lời nói đầu).

Như bạn có thể dự đoán, module là một ứng dụng tốt của modularity. Nó có interface well-defined gồm input và output, đồng thời thực hiện một function cụ thể. Cách viết code bên trong không quan trọng đối với người khác có thể sử dụng module, miễn là nó thực hiện đúng function.

### 4.1.2 Nguồn gốc ngôn ngữ

Các trường đại học gần như chia đều giữa hai lựa chọn ngôn ngữ cho môn học đầu tiên. Công nghiệp đang hướng tới SystemVerilog, nhưng nhiều công ty vẫn dùng VHDL, nên nhiều designer cần thông thạo cả hai. So với SystemVerilog, VHDL dài dòng và cồng kềnh hơn, như bạn có thể chờ đợi ở một ngôn ngữ được phát triển bởi hội đồng.

#### Ví dụ HDL 4.1 COMBINATIONAL LOGIC

SystemVerilog

```
module sillyfunction(input  logic a, b, c,
                     output  logic  y);

  assign y = ~a & ~b & ~c |
             a & ~b & ~c |
             a & ~b &   c;

endmodule
```

Module SystemVerilog bắt đầu bằng tên và danh sách input/output. Câu `assign` mô tả combinational logic. `~` chỉ NOT, `&` chỉ AND, `|` chỉ OR.

Signal `logic` như input/output là Boolean variable (0 hoặc 1). Chúng cũng có thể floating và undefined như Mục 4.2.8.

Type `logic` xuất hiện trong SystemVerilog, thay `reg` vốn gây nhầm lẫn dai dẳng trong Verilog. Nên dùng `logic` mọi nơi trừ signal nhiều driver. Signal nhiều driver gọi net, sẽ giải thích Mục 4.7.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity sillyfunction is
  port(a, b, c: in    STD_LOGIC;
       y:           out STD_LOGIC);
end;
architecture synth of sillyfunction is
begin
  y <= (not a and not b and not c) or
      (a and not b and not c) or
      (a and not b and c);
end;
```

Code VHDL có ba phần: mệnh đề dùng `library`, declaration `entity` và phần thân `architecture`. Mệnh đề `library` `use` sẽ bàn Mục 4.7.2. Declaration `entity` liệt kê tên module, input/output. Thân `architecture` định nghĩa module làm gì.

Signal VHDL như input/output phải có type declaration. Digital signal nên là `STD_LOGIC`. Signal `STD_LOGIC` nhận `'0'`, `'1'` cùng floating/undefined sẽ mô tả Mục 4.2.8. Type `STD_LOGIC` định nghĩa trong library `IEEE.STD_LOGIC_1164`, vì thế phải dùng library.

VHDL thiếu một thứ tự operation mặc định hợp lý giữa AND và OR, nên cần đặt ngoặc trong Boolean equation.

Cả hai ngôn ngữ đều hoàn toàn có khả năng mô tả mọi hardware system, và cả hai đều có những nét khác thường. Ngôn ngữ tốt nhất là ngôn ngữ đang được dùng tại nơi bạn làm việc hoặc ngôn ngữ khách hàng yêu cầu. Phần lớn CAD tool hiện cho phép trộn hai ngôn ngữ để các module khác nhau có thể được mô tả bằng ngôn ngữ khác nhau.

> Từ “bug” có trước máy tính. Năm 1878 Thomas Edison gọi “lỗi nhỏ và khó khăn” trong phát minh là “bug”.
>
> Computer bug thực đầu tiên là bướm đêm mắc giữa relay máy tính cơ điện Harvard Mark II năm 1947. Grace Hopper tìm thấy và ghi sự cố cùng con bướm, nhận xét “trường hợp thực tế đầu tiên tìm thấy bug”.
>
> ![note_p196](images/ch04/note_p196.png)
>
> Nguồn: Mục sổ tay do Naval Historical Center, US Navy cung cấp; ảnh số NII 96566-KN

### 4.1.3 Simulation và synthesis

Hai mục đích chính của HDL là logic simulation và synthesis. Trong simulation, input được áp vào module và output được kiểm tra để xác nhận module hoạt động đúng. Trong synthesis, mô tả module dạng văn bản được biến thành logic gate.

Simulation

Con người thường xuyên mắc lỗi. Những lỗi trong thiết kế hardware được gọi là bug. Loại bỏ bug khỏi digital system hiển nhiên quan trọng, đặc biệt khi khách hàng đang trả tiền và sinh mạng phụ thuộc hoạt động đúng. Kiểm thử hệ thống trong phòng thí nghiệm tốn thời gian. Tìm nguyên nhân lỗi có thể cực kỳ khó vì chỉ quan sát được signal đưa tới chân chip; không có cách quan sát trực tiếp bên trong chip. Sửa lỗi sau khi xây hệ thống có thể đắt đến mức tai hại. Ví dụ, sửa một integrated circuit cutting-edge tốn hơn một triệu USD và vài tháng. Bug FDIV (floating point division) tai tiếng trên Pentium buộc Intel thu hồi chip đã giao, tổng chi phí 475 triệu USD năm 1984. Logic simulation thiết yếu để kiểm thử hệ thống trước khi xây.

SystemVerilog

Gateway Design Automation phát triển Verilog làm ngôn ngữ riêng cho logic simulation năm 1984. Cadence mua Gateway năm 1989; Verilog thành open standard năm 1990 dưới Open Verilog International. Nó thành IEEE standard[^1] năm 1995. Năm 2005 mở rộng để sửa nét bất thường và hỗ trợ modeling/verification tốt hơn. Extension được gộp thành một chuẩn duy nhất, nay gọi SystemVerilog (IEEE STD 1800-2009). Tên file thường kết thúc `.sv`.

VHDL

VHDL viết tắt VHSIC Hardware Description Language. VHSIC lại viết tắt chương trình Very High Speed Integrated Circuits của Bộ Quốc phòng Mỹ.

Bộ Quốc phòng phát triển VHDL năm 1981 mô tả cấu trúc và chức năng hardware, bắt nguồn Ada. Ban đầu nhằm tài liệu hóa nhưng nhanh chóng dùng simulation/synthesis. IEEE chuẩn hóa năm 1987 rồi cập nhật nhiều lần. Chương dựa bản sửa 2008 (IEEE STD 1076-2008), đơn giản hóa nhiều mặt. Để dùng VHDL 2008 trong ModelSim, có thể cần đặt VHDL93 = 2008 trong modelsim.ini. File thường kết thúc `.vhd`.

![fig4_01](images/ch04/fig4_01.png)

Hình 4.1 Waveform simulation

Hình 4.1 là waveform simulation[^2] module `sillyfunction` trước, chứng minh hoạt động đúng. `y` TRUE khi `a`, `b`, `c` là 000, 100 hoặc 101 như Boolean equation.

Synthesis

Logic synthesis chuyển HDL code thành netlist mô tả hardware (logic gate và dây nối). Logic synthesizer có thể tối ưu giảm hardware cần. Netlist có thể là text file hoặc schematic giúp nhìn circuit. Hình 4.2 cho synthesis module `sillyfunction`.[^3] Chú ý ba AND gate three-input được đơn giản thành hai AND two-input, như tìm được bằng Boolean algebra trong Ví dụ 2.6.

> Synthesis tool gắn nhãn từng gate. Hình 4.2 là un5\_y, un8\_y và y.

Mô tả circuit bằng HDL giống code trong ngôn ngữ lập trình. Tuy nhiên, phải nhớ code nhằm biểu diễn hardware. SystemVerilog và VHDL là ngôn ngữ phong phú với nhiều command; không phải command nào cũng synthesize thành hardware được. Ví dụ, command in kết quả lên màn hình trong simulation không chuyển thành hardware. Vì mối quan tâm chính là xây hardware, chúng ta nhấn mạnh synthesizable subset của ngôn ngữ. Cụ thể, chia code thành synthesizable module và testbench. Module mô tả hardware. Testbench chứa code áp input, kiểm output đúng không, và in chênh lệch giữa output kỳ vọng với thực tế. Code testbench chỉ nhằm simulation, không synthesize được.

![fig4_02](images/ch04/fig4_02.png)

Hình 4.2 Circuit đã synthesize

Một trong những lỗi phổ biến nhất của người mới là coi HDL như chương trình máy tính thay vì cách viết gọn để mô tả digital hardware. Nếu không biết gần đúng HDL của mình phải synthesize thành hardware nào, có lẽ bạn sẽ không thích kết quả nhận được. Bạn có thể tạo hardware nhiều hơn cần thiết rất nhiều, hoặc viết code simulation đúng nhưng không triển khai thành hardware được. Thay vào đó, hãy suy nghĩ về hệ thống theo các khối combinational logic, register và finite state machine. Phác các khối trên giấy và chỉ cách nối trước khi bắt đầu viết code.

Theo kinh nghiệm chúng tôi, cách tốt nhất học HDL là qua ví dụ. HDL có các cách cụ thể mô tả từng lớp logic, gọi là idiom. Chương này dạy viết idiom đúng cho mỗi loại khối, rồi ghép chúng thành hệ thống hoạt động. Khi cần mô tả loại hardware cụ thể, tìm ví dụ tương tự và điều chỉnh theo mục đích. Chúng tôi không cố định nghĩa chặt chẽ toàn bộ syntax vì điều đó cực kỳ nhàm chán và thường khiến người học coi HDL là ngôn ngữ lập trình thay vì cách viết gọn hardware. Specification IEEE SystemVerilog/VHDL cùng nhiều sách khô khan nhưng toàn diện có đầy đủ chi tiết nếu bạn cần thêm về một chủ đề. (Xem phần Đọc thêm cuối sách.)

## 4.2 COMBINATIONAL LOGIC

Nhớ rằng chúng ta tự giới hạn thiết kế synchronous sequential circuit gồm combinational logic và register. Output combinational logic chỉ tùy input hiện tại. Phần này mô tả viết behavioral model bằng HDL.

### 4.2.1 Bitwise operator

Bitwise operator tác động signal single-bit hoặc bus nhiều bit. Ví dụ module `inv` trong Ví dụ HDL 4.2 mô tả bốn inverter nối bus 4-bit.

Endianness bus hoàn toàn tùy ý. (Nguồn thuật ngữ ở hộp bên Mục 6.6.1.) Ở đây cũng không quan trọng vì dãy inverter không quan tâm thứ tự bit. Nó chỉ quan trọng với operator như cộng, tổng một cột carry sang cột tiếp. Thứ tự nào cũng được miễn nhất quán. Sách dùng little-endian, `[N − 1:0]` trong SystemVerilog, `(N − 1 downto 0)` trong VHDL cho bus N-bit.

Sau mỗi ví dụ code là schematic do Synplify Premier synthesis tool tạo từ SystemVerilog. Hình 4.3 cho module `inv` thành dãy bốn inverter, symbol nhãn `y[3:0]`. Dãy nối bus input/output 4-bit. VHDL cũng tạo hardware tương tự.

Module `gates` trong Ví dụ HDL 4.3 minh họa bitwise operation trên bus 4-bit cho logic function cơ bản khác.

#### Ví dụ HDL 4.2 INVERTER

SystemVerilog

```
module  inv(input  logic [3:0] a,
            output logic [3:0] y);

  assign y = ~a;
endmodule
```

`a[3:0]` biểu diễn bus 4-bit. Từ most significant tới least significant là `a[3]`, `a[2]`, `a[1]`, `a[0]`. Đây gọi little-endian vì least significant có số bit nhỏ nhất. Có thể gọi `a[4:1],` khi đó `a[4]` most significant; hoặc `a[0:3]`, thứ tự most đến least là `a[0]`, `a[1]`, `a[2]`, `a[3]`. Đó gọi big-endian.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity inv is
  port(a: in   STD_LOGIC_VECTOR(3 downto 0);
       y: out STD_LOGIC_VECTOR(3 downto 0));
end;
architecture synth of inv is
begin
  y <= not a;
end;
```

VHDL dùng `STD_LOGIC_VECTOR` chỉ bus `STD_LOGIC`. `STD_LOGIC_VECTOR(3 downto 0)` là bus 4-bit. Most đến least significant là `a(3)`, `a(2)`, `a(1)`, `a(0)`. Đây là little-endian vì least significant có số nhỏ nhất. Có thể khai báo `STD_LOGIC_VECTOR(4 downto 1)`, bit 4 most significant; hoặc `STD_LOGIC_VECTOR(0 to 3)`, thứ tự là `a(0), a(1), a(2), and a(3)`. Đây gọi big-endian.

![fig4_03](images/ch04/fig4_03.png)

Hình 4.3 Circuit synthesize từ `inv`

#### Ví dụ HDL 4.3 LOGIC GATE

SystemVerilog

```
module gates(input  logic [3:0] a, b,
             output logic [3:0] y1, y2,
                                y3, y4, y5);

  /* five different two-input logic
     gates acting on 4-bit busses */
  assign y1 = a & b;         // AND
  assign y2 = a | b;         // OR
  assign y3 = a ^ b;         // XOR
  assign y4 = ~(a & b);      // NAND
  assign y5 = ~(a | b);      // NOR
endmodule
```

`~`, `^`, `|` là SystemVerilog operator, còn `a`, `b`, `y1` là operand. Kết hợp như `a & b` hoặc `~(a | b)` gọi expression. Command đầy đủ như `assign y4 = ~(a & b);` gọi statement.

`assign out = in1 op in2;` gọi continuous assignment statement, kết thúc dấu chấm phẩy. Khi input bên phải `=` đổi, output bên trái được tính lại. Vì vậy chúng mô tả combinational logic.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity gates is
port(a, b:   in    STD_LOGIC_VECTOR(3 downto 0);
     y1, y2, y3, y4,
     y5:     out STD_LOGIC_VECTOR(3 downto 0));
end;
architecture synth of gates is
begin
 –– five different two-input logic gates
 –– acting on 4-bit busses
 y1 <= a and b;
 y2 <= a or b;
 y3 <= a xor b;
 y4 <= a nand b;
 y5 <= a nor b;
end;
```

`not`, `xor`, `or` là VHDL operator, còn `a`, `b`, `y1` là operand. Kết hợp như `a and b` hoặc `a nor b` gọi expression. Command đầy đủ `y4 <= a nand b;` gọi statement.

`out <= in1 op in2;` gọi concurrent signal assignment statement. VHDL assignment kết thúc chấm phẩy. Khi input bên phải `<=` đổi, output bên trái tính lại. Vì vậy chúng mô tả combinational logic.

![fig4_04](images/ch04/fig4_04.png)

Hình 4.4 Circuit synthesize từ `gates`

### 4.2.2 Comment và khoảng trắng

Ví dụ `gates` đã cho cách định dạng comment. SystemVerilog và VHDL không khắt khe việc dùng khoảng trắng, tức space, tab và xuống dòng. Tuy nhiên, thụt lề đúng và dùng dòng trống giúp thiết kế không đơn giản trở nên dễ đọc. Hãy nhất quán cách dùng chữ hoa/thường và underscore trong tên signal, module. Sách này dùng toàn chữ thường. Tên module và signal không được bắt đầu bằng digit.

### 4.2.3 Reduction operator

Reduction operator ngụ ý gate multiple-input trên một bus. Ví dụ HDL 4.4 mô tả AND eight-input với input `a`<sub>`7`</sub>`, a`<sub>`6`</sub>`,...,a`<sub>`0`</sub>. Tương tự có OR, XOR, NAND, NOR, XNOR. Nhớ XOR multiple-input làm parity, TRUE nếu số input TRUE lẻ.

SystemVerilog

Comment SystemVerilog như C/Java. Bắt đầu `/*` tiếp tục, có thể nhiều dòng, đến `*/`. Bắt đầu `//` tiếp tục đến cuối dòng.

SystemVerilog case-sensitive. `y1` và `Y1` là signal khác nhau. Nhưng dùng signal chỉ khác case gây nhầm.

VHDL

Comment bắt đầu `/*` tiếp tục, có thể nhiều dòng, tới `*/`. Bắt đầu `––` tiếp tục đến cuối dòng.

VHDL không case-sensitive. `y1`, `Y1` cùng signal. Nhưng tool khác đọc file có thể case-sensitive, tạo bug khó chịu nếu tùy tiện trộn hoa/thường.

### 4.2.4 Conditional assignment

Conditional assignment chọn output trong các khả năng dựa input gọi condition. Ví dụ HDL 4.5 minh họa multiplexer 2:1 bằng conditional assignment.

#### Ví dụ HDL 4.4 AND EIGHT-INPUT

SystemVerilog

```
module  and8(input     logic  [7:0]  a,
             output  logic           y);

  assign y = &a;

  // &a is much easier to write than
  // assign y  =  a[7] & a[6] & a[5] & a[4] &
  //                  a[3] & a[2] & a[1] & a[0];
endmodule
```

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity and8 is
  port(a: in   STD_LOGIC_VECTOR(7 downto 0);
       y: out STD_LOGIC);
end;
architecture synth of and8 is
begin
  y <= and a;
  –– and a is much easier to write than
  –– y <= a(7) and a(6) and a(5) and a(4) and
  ––         a(3) and a(2) and a(1) and a(0);
end;
```

![fig4_05](images/ch04/fig4_05.png)

Hình 4.5 Circuit synthesize từ `and8`

#### Ví dụ HDL 4.5 MULTIPLEXER 2:1

SystemVerilog

Conditional operator `?:` dựa expression đầu chọn expression thứ hai hoặc ba. Expression đầu gọi condition. Nếu 1 chọn thứ hai; nếu 0 chọn thứ ba.

`?:` rất hữu ích mô tả multiplexer vì dựa input đầu chọn hai input còn lại. Code sau là idiom multiplexer 2:1 input/output 4-bit dùng conditional operator.

```
module mux2(input   logic [3:0] d0, d1,
            input     logic     s,
            output logic [3:0] y);

  assign y  =  s ? d1 : d0;
endmodule
```

Nếu `s` bằng 1 thì `y = d1`. Nếu `s` bằng 0 thì `y = d0`.

`?:` còn gọi ternary operator vì nhận ba input. C và Java dùng cùng mục đích.

VHDL

Conditional signal assignment thực hiện operation khác tùy condition, rất hữu ích mô tả multiplexer. Ví dụ multiplexer 2:1 chọn một trong hai input 4-bit.

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity mux2 is
   port(d0, d1: in   STD_LOGIC_VECTOR(3 downto 0);
        s:         in   STD_LOGIC;
        y:          out STD_LOGIC_VECTOR(3 downto 0));
end;
architecture synth of mux2 is
begin
  y <= d1 when s else d0;
end;
```

Conditional signal assignment đặt `y` bằng `d1` nếu `s` bằng 1; nếu không đặt `y` bằng `d0`. Trước VHDL 2008 phải viết `when s = '1'` thay `when s`.

![fig4_06](images/ch04/fig4_06.png)

Hình 4.6 Circuit synthesize từ `mux2`

Ví dụ HDL 4.6 là multiplexer 4:1 cùng nguyên tắc 2:1 Ví dụ 4.5. Hình 4.7 là schematic multiplexer 4:1 do synthesis tool tạo. Software dùng symbol khác sách trước đó: nhiều data input `(d)` và enable one-hot `(e)`. Khi một enable được assert, data tương ứng đi ra output. Ví dụ `s[1] = s[0] = 0`, AND dưới cùng `un1_s_5` cho 1, enable input dưới multiplexer, chọn `d0[3:0]`.

### 4.2.5 Internal variable

Thường tiện chia function phức tạp thành bước trung gian. Ví dụ full adder ở Mục 5.2.1 là circuit ba input, hai output theo phương trình:

#### Ví dụ HDL 4.6 MULTIPLEXER 4:1

SystemVerilog

Multiplexer 4:1 chọn một trong bốn input bằng conditional operator lồng nhau.

```
module mux4(input    logic [3:0] d0, d1, d2, d3,
            input      logic [1:0] s,
            output  logic [3:0] y);

  assign y  =  s[1]  ? (s[0] ? d3 : d2)
                     : (s[0] ? d1 : d0);
endmodule
```

Nếu `s[1]` bằng 1, chọn expression đầu `(s[0] ? d3 : d2)`, nó chọn `d3` hoặc `d2` theo `s[0]` (`y = d3` khi `s[0]` là 1, `d2` khi `s[0]` là 0). Nếu `s[1]` bằng 0, tương tự chọn expression hai, cho `d1` hoặc `d0` theo `s[0]`.

VHDL

Multiplexer 4:1 chọn một trong bốn input bằng nhiều mệnh đề `else` trong conditional signal assignment.

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity mux4 is
  port(d0, d1,
       d2, d3:  in   STD_LOGIC_VECTOR(3 downto 0);
       s:          in   STD_LOGIC_VECTOR(1 downto 0);
       y:            out STD_LOGIC_VECTOR(3 downto 0));
end;
architecture synth1 of mux4 is
begin
  y <= d0 when s = "00" else
      d1 when s = "01" else
      d2 when s = "10" else
      d3;
end;
```

VHDL cũng hỗ trợ selected signal assignment viết gọn chọn nhiều khả năng. Tương tự `switch/case` thay nhiều `if/else` trong một số ngôn ngữ. Multiplexer 4:1 có thể viết lại:

```
architecture synth2 of mux4 is
begin
  with s select y <=
    d0  when "00",
    d1  when "01",
    d2  when "10",
    d3  when others;
end;
```

![fig4_07](images/ch04/fig4_07.png)

Hình 4.7 Circuit synthesize từ `mux4`

S = A ⊕ B ⊕ C<sub>in</sub>

C<sub>out</sub> = AB + AC<sub>in</sub> + BC<sub>in</sub> (4.1)

Nếu định nghĩa signal trung gian P và G,

P = A ⊕ B (4.2) G = AB

có thể viết lại full adder như sau:

> Kiểm bằng điền truth table để tự xác nhận đúng.

S = P ⊕ C<sub>in</sub> (4.3)

C<sub>out</sub> = G + PC<sub>in</sub>

P, G gọi internal variable vì không input/output mà chỉ dùng bên trong module. Tương tự local variable ngôn ngữ lập trình. Ví dụ HDL 4.7 cho cách dùng.

Assignment HDL (`assign` SystemVerilog, `<=` VHDL) diễn ra đồng thời, khác C/Java evaluate theo thứ tự viết. Trong ngôn ngữ thường, S = P⊕ C<sub>in</sub> phải sau P = A⊕B vì chạy tuần tự. Trong HDL thứ tự không quan trọng. Như hardware, assignment được evaluate khi input, signal right-hand side, đổi giá trị bất kể thứ tự xuất hiện trong module.

### 4.2.6 Độ ưu tiên

Chú ý ngoặc trong tính `cout` Ví dụ HDL 4.7 cho C<sub>out</sub> = G + (P · C<sub>in</sub>) thay C<sub>out</sub> = (G + P) · C<sub>in</sub>. Không ngoặc thì thứ tự do ngôn ngữ. Ví dụ HDL 4.8 chỉ ưu tiên cao đến thấp, gồm arithmetic, shift, comparison operator sẽ định nghĩa Chương 5.

#### Ví dụ HDL 4.7 FULL ADDER

SystemVerilog

Trong SystemVerilog internal signal thường khai báo `logic`.

```
module fulladder(input   logic a, b, cin,
                 output logic s, cout);

  logic p, g;

  assign p = a ^ b;
  assign g = a & b;

  assign s = p ^ cin;
  assign cout = g | (p & cin);
endmodule
```

VHDL

Trong VHDL, signal biểu diễn internal variable có giá trị định nghĩa bằng concurrent signal assignment như `p <= a xor b;`

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity fulladder is
  port(a, b, cin: in    STD_LOGIC;
       s, cout:     out STD_LOGIC);
end;
architecture synth of fulladder is
  signal p, g: STD_LOGIC;
begin
  p <= a xor b;
  g <= a and b;
  s <= p xor cin;
  cout <= g or (p and cin);
end;
```

![fig4_08](images/ch04/fig4_08.png)

Hình 4.8 Circuit synthesize từ `fulladder`

Bảng 4.1 Độ ưu tiên operator SystemVerilog

|  | Operator | Ý nghĩa |
|---|---|---|
| Cao nhất | `~` | NOT |
|  | `*, /, %` | MUL, DIV, MOD |
|  | `+, –` | PLUS, MINUS |
|  | `<<, >>` | Logical shift trái/phải |
|  | `<<<, >>>` | Arithmetic shift trái/phải |
|  | `<, <=, >, >=` | So sánh thứ tự |
|  | `= =, !=` | So sánh bằng nhau |
| Thấp nhất | `&, ~&` | AND, NAND |
|  | `^, ~^` | XOR, XNOR |
|  | `\|, ~\|` | OR, NOR |
|  | `?:` | Có điều kiện |

Bảng 4.2 Độ ưu tiên operator VHDL

|  | Operator | Ý nghĩa |
|---|---|---|
| Cao nhất | `not` | NOT |
|  | `*, /, mod,` `rem` | MUL, DIV, MOD, REM |
|  | `+, –` | PLUS, MINUS |
|  | `rol, ror,` `srl, sll` | Rotate, logical shift |
| Thấp nhất | `<, <=, >, >=` | So sánh thứ tự |
|  | `=, /=` | So sánh bằng nhau |
|  | `and, or,` `nand, nor,` `xor, xnor` | Logical operation |

### 4.2.7 Số

Có thể chỉ số bằng binary, octal, decimal, hexadecimal (cơ số 2, 8, 10, 16). Kích thước, tức số bit, tùy chọn; thêm zero đầu cho đủ. Underscore bị bỏ qua, giúp chia số dài thành nhóm dễ đọc. Ví dụ HDL 4.9 giải thích từng ngôn ngữ.

#### Ví dụ HDL 4.8 ĐỘ ƯU TIÊN OPERATOR

SystemVerilog

Độ ưu tiên SystemVerilog giống mong đợi ở ngôn ngữ khác. Cụ thể AND ưu tiên hơn OR. Có thể tận dụng bỏ ngoặc:

```
assign cout = g | p & cin;
```

VHDL

VHDL ưu tiên nhân hơn cộng như mong đợi. Nhưng khác SystemVerilog, mọi logical operation (`and`, `or`, v.v.) ngang ưu tiên, khác Boolean algebra thường nghĩ. Vì vậy cần ngoặc. Nếu không, `cout <= g or p and cin` diễn giải trái sang phải thành `cout <= (g or p) and cin`.

Bảng 4.3 Số SystemVerilog

| Số | Bit | Cơ số | Giá trị | Được lưu |
|---|---|---|---|---|
| `3'b101` | 3 | 2 | 5 | 101 |
| `'b11` | ? | 2 | 3 | 000 … 0011 |
| `8'b11` | 8 | 2 | 3 | 00000011 |
| `8'b1010_1011` | 8 | 2 | 171 | 10101011 |
| `3'd6` | 3 | 10 | 6 | 110 |
| `6'o42` | 6 | 8 | 34 | 100010 |
| `8'hAB` | 8 | 16 | 171 | 10101011 |
| `42` | ? | 10 | 42 | 00 … 0101010 |

Bảng 4.4 Số VHDL

| Số | Bit | Cơ số | Giá trị | Được lưu |
|---|---|---|---|---|
| `3B"101"` | 3 | 2 | 5 | 101 |
| `B"11"` | 2 | 2 | 3 | 11 |
| `8B"11"` | 8 | 2 | 3 | 00000011 |
| `8B"1010_1011"` | 8 | 2 | 171 | 10101011 |
| `3D"6"` | 3 | 10 | 6 | 110 |
| `6O"42"` | 6 | 8 | 34 | 100010 |
| `8X"AB"` | 8 | 16 | 171 | 10101011 |
| `"101"` | 3 | 2 | 5 | 101 |
| `B"101"` | 3 | 2 | 5 | 101 |
| `X"AB"` | 8 | 16 | 171 | 10101011 |

### 4.2.8 Z và X

HDL dùng `z` chỉ floating value. `z` đặc biệt hữu ích cho tristate buffer có output float khi enable 0. Nhớ Mục 2.6.2: bus có thể do nhiều tristate buffer lái, chỉ một nên enable. Ví dụ HDL 4.10 cho idiom. Enable thì output như input, disable thì output gán floating (`z`).

Tương tự HDL dùng `x` chỉ logic level không hợp lệ. Nếu hai tristate buffer enable (hoặc gate khác) cùng lái bus về 0 và 1, kết quả `x`, chỉ contention. Nếu mọi tristate buffer

#### Ví dụ HDL 4.9 SỐ

SystemVerilog

Định dạng constant là `N'Bvalue`: `N` số bit, `B` chữ chỉ cơ số, `value` giá trị. Ví dụ `9'h25` chỉ số 9-bit giá trị 25<sub>16</sub> = 37<sub>10</sub> = 000100101<sub>2</sub>. SystemVerilog dùng `'b` binary, `'o` octal, `'d` decimal, `'h` hexadecimal.

Bỏ cơ số mặc định decimal. Bỏ kích thước, số có số bit bằng expression đang dùng nó. Zero tự thêm trước cho đủ. Ví dụ bus `w` 6-bit, `assign w = 'b11` cho `w` giá trị 000011. Tốt hơn chỉ tường minh kích thước. Ngoại lệ `'0`, `'1` là idiom điền mọi bit lần lượt 0, 1.

VHDL

Trong VHDL, số STD\_LOGIC viết binary trong nháy đơn: `'0'`, `'1'` chỉ logic 0, 1. Constant STD\_LOGIC\_VECTOR dạng `NB"value"`, `N` số bit, `B` chữ chỉ cơ số, `value` giá trị. Ví dụ `9X"25"` là 9-bit giá trị 25<sub>16</sub> =37<sub>10</sub> =000100101<sub>2</sub>. VHDL 2008 hỗ trợ `B` binary, `O` octal, `D` decimal, `X` hexadecimal.

Bỏ cơ số mặc định binary. Bỏ kích thước thì khớp số bit chỉ trong giá trị. Ví dụ `y <= X"7B"` đòi `y` signal 8-bit. Nếu `y` nhiều bit hơn, không thêm 0 bên trái mà compilation error. `others => '0'`, `others => '1'` là idiom điền mọi bit lần lượt 0, 1.

Đầu simulation, state node như output flip-flop được khởi tạo unknown (`x` SystemVerilog, `u` VHDL). Hữu ích tìm lỗi quên reset flip-flop trước khi dùng output.

Gate nhận floating input có thể cho output `x` khi không xác định được giá trị đúng. Tương tự illegal/uninitialized input có thể cho `x`. Ví dụ HDL 4.11 cho cách kết hợp giá trị trong gate.

#### Ví dụ HDL 4.10 TRISTATE BUFFER

SystemVerilog

```
module  tristate(input    logic  [3:0]  a,
                input   logic         en,
                output tri     [3:0] y);

  assign y  =  en ? a : 4'bz;
endmodule
```

Chú ý `y` khai báo `tri` thay `logic`. Signal `logic` chỉ một driver. Tristate bus nhiều driver nên khai báo net. Hai loại net là `tri`, `trireg`. Thường chỉ một driver active mỗi lúc, net nhận giá trị đó. Không driver active, `tri` float (`z`), `trireg` giữ giá trị trước. Không chỉ type input/output thì giả định `tri`. Output `tri` module này có thể làm input `logic` module khác. Mục 4.7 bàn net nhiều driver.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity tristate is
  port(a:    in   STD_LOGIC_VECTOR(3 downto 0);
       en: in   STD_LOGIC;
       y:    out  STD_LOGIC_VECTOR(3 downto 0));
end;
architecture synth of tristate is
begin
  y  <=  a when en else "ZZZZ";
end;
```

![fig4_09](images/ch04/fig4_09.png)

Hình 4.9 Circuit synthesize từ `tristate`

Bảng 4.5 Truth table AND SystemVerilog với `z` và `x`

| \& |  |  | A |  |  |
|---|---|---|---|---|---|
|  |  | `0` | `1` | `z` | `x` |
|  | `0` | `0` | `0` | `0` | `0` |
|  | `1` | `0` | `1` | `x` | `x` |
| B | `z` | `0` | `x` | `x` | `x` |
|  | `x` | `0` | `x` | `x` | `x` |

Bảng 4.6 Truth table AND VHDL với `z`, `x`, `u`

| AND |  |  |  | A |  |  |
|---|---|---|---|---|---|---|
|  |  | `0` | `1` | `z` | `x` | `u` |
|  | `0` | `0` | `0` | `0` | `0` | `0` |
|  | `1` | `0` | `1` | `x` | `x` | `u` |
| B | `z` | `0` | `x` | `x` | `x` | `u` |
|  | `x` | `0` | `x` | `x` | `x` | `u` |
|  | `u` | `0` | `u` | `u` | `u` | `u` |

#### Ví dụ HDL 4.11 TRUTH TABLE VỚI INPUT UNDEFINED VÀ FLOATING

SystemVerilog

Signal value SystemVerilog là `0`, `1`, `z`, `x`. Constant bắt đầu `z` hoặc `x` được thêm `z` hoặc `x` phía trước thay 0 để đủ độ dài khi cần.

Bảng 4.5 là truth table AND dùng cả bốn giá trị. Gate đôi khi xác định được output dù một số input unknown. Ví dụ `0 & z` trả `0` vì AND luôn `0` nếu một input `0`. Nếu không, input floating/invalid gây output invalid, hiển thị `x`.

VHDL

Signal STD\_LOGIC VHDL là `'0'`, `'1'`, `'z', 'x'` và `'u'`.

Bảng 4.6 cho AND với cả năm giá trị. Đôi khi gate xác định output dù có input unknown. Ví dụ `'0' and 'z'` trả `'0'` vì AND luôn `'0'` nếu một input `'0'`. Nếu không input floating/invalid cho output invalid, hiển thị `'x'`. Input chưa khởi tạo cho output chưa khởi tạo, hiển thị `'u'`.

Thấy `x` hoặc `u` trong simulation gần như luôn báo bug hoặc code chưa tốt. Trong circuit synthesize, tương ứng floating gate input, state chưa khởi tạo hoặc contention. Circuit có thể diễn giải `x` hoặc `u` ngẫu nhiên thành 0 hay 1, gây hành vi khó đoán.

### 4.2.9 Bit swizzling

Thường cần thao tác tập con bus hoặc concatenate signal thành bus. Các operation gọi chung bit swizzling. Ví dụ HDL 4.12 gán `y` giá trị 9-bit `c`<sub>`2`</sub>`c`<sub>`1`</sub>`d`<sub>`0`</sub>`d`<sub>`0`</sub>`d`<sub>`0`</sub>`c`<sub>`0`</sub>`101` bằng bit swizzling.

### 4.2.10 Delay

Có thể gắn các câu HDL với delay chỉ định theo đơn vị tùy ý. Chúng hữu ích trong simulation để dự đoán tốc độ circuit nếu delay có ý nghĩa, và trong debugging để hiểu quan hệ nhân quả: suy ra nguồn của output sai rất khó nếu mọi signal đổi đồng thời trong kết quả. Synthesis bỏ qua delay này; delay gate do synthesizer tạo phụ thuộc specification t<sub>pd</sub> và t<sub>cd</sub>, không phụ thuộc con số trong HDL code.

#### Ví dụ HDL 4.12 BIT SWIZZLING

SystemVerilog

```
assign y = {c[2:1], {3{d[0]}}, c[0], 3'b101};
```

Operator {} nối bus. `{3{d[0]}}` chỉ ba bản sao `d[0]`.

Đừng nhầm binary constant 3-bit `3'b101` với bus tên `b`. Phải chỉ độ dài 3 bit; nếu không có số zero đầu chưa biết có thể xuất hiện giữa `y`.

Nếu `y` rộng hơn 9 bit, zero được đặt ở most significant bit.

VHDL

```
y <= (c(2 downto 1), d(0), d(0), d(0), c(0), 3B"101");
```

Aggregate operator `()` nối bus. `y` phải là `STD_LOGIC_VECTOR` 9-bit.

Ví dụ khác cho sức mạnh aggregation VHDL. Giả sử `z` là `STD_LOGIC_VECTOR,` 8-bit, `z` được gán 10010110 bằng command aggregation sau.

```
z <= ("10", 4 => '1', 2 downto 1 =>'1', others =>'0')
```

`"10"` vào cặp bit đầu. 1 cũng đặt ở bit 4, 2, 1. Bit còn lại 0.

Ví dụ HDL 4.13 thêm delay vào function gốc Ví dụ 4.1, `y` = $\overline{\texttt{a}}$ $\overline{\texttt{b}}$ $\overline{\texttt{c}}$ + `a`$\overline{\texttt{b}}$ $\overline{\texttt{c}}$ + `a`$\overline{\texttt{b}}$`c`. Giả định inverter delay 1 ns, AND three-input 2 ns, OR three-input 4 ns. Hình 4.10 cho waveform, `y` chậm input 7 ns. Chú ý `y` unknown khi simulation bắt đầu.

![fig4_10](images/ch04/fig4_10.png)

Hình 4.10 Waveform simulation có delay (ModelSim simulator)

#### Ví dụ HDL 4.13 LOGIC GATE CÓ DELAY

SystemVerilog

```
'timescale 1ns/1ps
module example(input  logic a, b, c,
               output logic y);
  logic ab, bb, cb, n1, n2, n3;
  assign #1 {ab, bb, cb}  =   ~{a, b, c};
  assign #2  n1 = ab & bb & cb;
  assign #2  n2 = a & bb & cb;
  assign #2  n3 = a & bb & c;
  assign #4     y = n1 | n2 | n3;
endmodule
```

File SystemVerilog có thể có timescale directive chỉ giá trị mỗi time unit, dạng `'timescale unit/precision`. Ở đây mỗi unit 1 ns, precision 1 ps. Không có directive thì dùng mặc định (thường cả hai 1 ns). Symbol `#` chỉ số đơn vị delay, đặt trong `assign`, cũng như nonblocking (`<=`) và blocking (`=`) assignment sẽ bàn Mục 4.5.4.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity example is
  port(a, b, c: in    STD_LOGIC;
       y:           out STD_LOGIC);
end;
architecture synth of example is
  signal ab, bb, cb, n1, n2, n3: STD_LOGIC;
begin
  ab <= not a after 1 ns;
  bb <= not b after 1 ns;
  cb <= not c after 1 ns;
  n1 <= ab and bb and cb after 2 ns;
  n2 <= a and bb and cb after 2 ns;
  n3 <= a and bb and c after 2 ns;
  y     <= n1 or n2 or n3 after 4 ns;
end;
```

Trong VHDL, mệnh đề `after` chỉ delay, ở đây đơn vị nanosecond.

## 4.3 STRUCTURAL MODELING

Phần trước trình bày behavioral modeling, mô tả module theo quan hệ input/output. Phần này xem structural modeling, mô tả module theo cách nó được cấu thành từ những module đơn giản hơn.

Ví dụ HDL 4.14 ghép multiplexer 4:1 từ ba multiplexer 2:1. Mỗi bản sao 2:1 gọi instance. Nhiều instance phân biệt bằng tên, ở đây `lowmux, highmux`, `finalmux`. Đây là regularity, tái dùng 2:1 nhiều lần.

Ví dụ HDL 4.15 dùng structural modeling xây multiplexer 2:1 từ cặp tristate buffer. Tuy nhiên không khuyến nghị xây logic bằng tristate.

### Ví dụ HDL 4.14 STRUCTURAL MODEL CỦA MULTIPLEXER 4:1

SystemVerilog

```
module mux4(input   logic [3:0] d0, d1, d2, d3,
            input    logic [1:0] s,
            output  logic [3:0] y);

  logic [3:0] low, high;

  mux2 lowmux(d0, d1, s[0], low);
  mux2 highmux(d2, d3, s[0], high);
  mux2 finalmux(low, high, s[1], y);
endmodule
```

Ba instance `mux2` tên `lowmux`, `highmux`, `finalmux`. Module `mux2` phải định nghĩa nơi khác trong code—Ví dụ HDL 4.5, 4.15 hoặc 4.34.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity mux4 is
  port(d0, d1,
       d2, d3: in   STD_LOGIC_VECTOR(3 downto 0);
       s:         in   STD_LOGIC_VECTOR(1 downto 0);
       y:         out STD_LOGIC_VECTOR(3 downto 0));
end;
architecture struct of mux4 is
  component mux2
    port(d0,
         d1: in   STD_LOGIC_VECTOR(3 downto 0);
         s:  in   STD_LOGIC;
         y:   out STD_LOGIC_VECTOR(3 downto 0));
  end component;
  signal low, high: STD_LOGIC_VECTOR(3 downto 0);
begin
  lowmux:      mux2  port  map(d0, d1, s(0), low);
  highmux:   mux2  port     map(d2, d3, s(0), high);
  finalmux:  mux2  port   map(low, high, s(1), y);
end;
```

Architecture trước tiên khai báo port `mux2` bằng component declaration, cho tool VHDL kiểm component có cùng port với entity khai báo nơi khác, tránh lỗi đổi entity nhưng không đổi instance. Tuy nhiên declaration làm VHDL cồng kềnh.

Architecture của `mux4` tên `struct`, còn module behavioral Mục 4.2 tên `synth`. VHDL cho nhiều architecture (implementation) cùng entity, phân biệt theo tên. Tên không có ý nghĩa với CAD tool, nhưng `struct`, `synth` phổ biến. Code synthesizable thường chỉ một architecture/entity nên không bàn syntax cấu hình chọn architecture khi có nhiều.

![fig4_11](images/ch04/fig4_11.png)

Hình 4.11 Circuit synthesize từ `mux4`

Ví dụ HDL 4.16 cho module truy cập phần bus. Multiplexer 2:1 rộng 8-bit-wide xây từ hai multiplexer 2:1 4-bit đã định nghĩa, thao tác nibble thấp/cao của byte.

Nói chung, hệ thống phức tạp được thiết kế theo hierarchy. Hệ thống tổng thể được mô tả structural bằng instantiate các component chính. Mỗi component lại được mô tả structural từ building block của nó, tiếp tục đệ quy đến khi các phần đủ đơn giản để mô tả behavioral. Phong cách tốt là tránh, hoặc ít nhất giảm tối đa, trộn mô tả structural và behavioral trong cùng module.

#### Ví dụ HDL 4.15 STRUCTURAL MODEL CỦA MULTIPLEXER 2:1

SystemVerilog

```
module mux2(input   logic [3:0] d0, d1,
            input   logic             s,
            output tri      [3:0]  y);

  tristate t0(d0, ~s, y);
  tristate t1(d1, s, y);
endmodule
```

SystemVerilog cho expression như `~s` trong port list instance. Expression phức tạp tùy ý hợp lệ nhưng không khuyến khích vì khó đọc.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity mux2 is
  port(d0, d1: in   STD_LOGIC_VECTOR(3 downto 0);
      s:         in    STD_LOGIC;
      y:          out  STD_LOGIC_VECTOR(3 downto 0));
end;
architecture struct of mux2 is
   component tristate
     port(a:   in    STD_LOGIC_VECTOR(3 downto 0);
         en: in    STD_LOGIC;
         y:   out STD_LOGIC_VECTOR(3 downto 0));
   end component;
   signal sbar: STD_LOGIC;
begin
   sbar <= not s;
   t0:  tristate  port  map(d0, sbar, y);
   t1:  tristate  port  map(d1, s, y);
end;
```

VHDL không cho expression như `not s` trong port map instance. Vì vậy phải định nghĩa `sbar` thành signal riêng.

![fig4_12](images/ch04/fig4_12.png)

Hình 4.12 Circuit synthesize từ `mux2`

## 4.4 SEQUENTIAL LOGIC

HDL synthesizer nhận ra một số idiom và chuyển chúng thành sequential circuit cụ thể. Phong cách code khác có thể simulation đúng nhưng synthesize thành circuit có lỗi rõ ràng hoặc tinh vi. Phần này trình bày idiom đúng để mô tả register và latch.

### 4.4.1 Register

Đại đa số hệ thương mại hiện đại dùng register với D flip-flop positive edge-triggered. Ví dụ HDL 4.17 cho idiom.

Trong câu `always` SystemVerilog và `process` VHDL, signal giữ giá trị cũ tới khi event trong sensitivity list rõ ràng làm đổi. Vì thế code với sensitivity list phù hợp mô tả sequential circuit có memory. Ví dụ flip-flop chỉ có `clk` trong list, nhớ `q` cũ tới rising edge tiếp của `clk` dù `d` đổi giữa chừng.

Ngược lại continuous assignment SystemVerilog (`assign`) và concurrent assignment VHDL (`<=`) evaluate lại khi input right-hand side đổi, nên nhất thiết mô tả combinational logic.

#### Ví dụ HDL 4.16 TRUY CẬP PHẦN BUS

SystemVerilog

```
module mux2_8(input   logic [7:0] d0, d1,
              input    logic           s,
               output logic [7:0] y);

  mux2 lsbmux (d0[3:0], d1[3:0], s, y[3:0]);
  mux2 msbmux(d0[7:4], d1[7:4], s, y[7:4]);
endmodule
```

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity mux2_8 is
  port(d0, d1:  in   STD_LOGIC_VECTOR(7 downto 0);
       s:       in    STD_LOGIC;
       y:       out STD_LOGIC_VECTOR(7 downto 0));
end;
architecture struct of mux2_8 is
  component mux2
    port(d0, d1:  in   STD_LOGIC_VECTOR(3 downto 0);
         s:          in    STD_LOGIC;
         y:          out STD_LOGIC_VECTOR(3 downto 0));
  end component;
begin
  lsbmux: mux2
     port map(d0(3 downto 0), d1(3 downto 0),
             s, y(3 downto 0));
  msbmux: mux2
     port map(d0(7 downto 4), d1(7 downto 4),
             s, y(7 downto 4));
end;
```

![fig4_13](images/ch04/fig4_13.png)

Hình 4.13 Circuit synthesize từ `mux2_8`

### 4.4.2 Resettable register

Khi simulation bắt đầu hoặc mới cấp điện, output flop/register unknown, thể hiện `x` SystemVerilog, `u` VHDL. Nên dùng resettable register để powerup đặt hệ vào state biết trước. Reset có thể asynchronous hoặc synchronous. Nhớ rằng asynchronous reset cạnh lên kế tiếp của clock. Ví dụ HDL 4.18 cho idiom flip-flops reset asynchronous/synchronous. Phân biệt trên schematic có thể khó.

#### Ví dụ HDL 4.17 REGISTER

SystemVerilog

```
module  flop(input   logic       clk,
            input    logic [3:0] d,
            output  logic [3:0] q);

  always_ff @(posedge clk)
    q <= d;
endmodule
```

Nói chung câu `always` SystemVerilog có dạng

```
always @(sensitivity list)
  statement;
```

`statement` chỉ chạy khi event chỉ trong `sensitivity list` xảy ra. Ở đây là `q <= d` (đọc “`q` nhận `d`”). flip-flop copy `d` sang `q` tại positive edge, còn lại nhớ state cũ `q`. Sensitivity list còn gọi stimulus list.

`<=` gọi nonblocking assignment. Tạm coi như dấu `=` thường; Mục 4.5.4 trở lại điểm tinh tế hơn. Chú ý dùng `<=` thay `assign` trong câu `always`.

Như sẽ thấy, câu `always` có thể ngụ ý flip-flops, latch hoặc combinational logic tùy sensitivity list và statement. Linh hoạt nên dễ vô tình tạo sai hardware. SystemVerilog thêm `always_ff,` `always_latch`, `always_comb` giảm lỗi phổ biến. `always_ff` giống `always` nhưng chỉ ngụ ý flip-flops, cho tool cảnh báo nếu ngụ ý thứ khác.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity flop is
  port(clk:  in   STD_LOGIC;
       d:     in   STD_LOGIC_VECTOR(3 downto 0);
       q:     out STD_LOGIC_VECTOR(3 downto 0));
end;
architecture synth of flop is
begin
  process(clk) begin
    if rising_edge(clk) then
      q <= d;
    end if;
  end process;
end;
```

VHDL `process` có dạng

```
process(sensitivity list) begin
  statement;
end process;
```

`statement` chạy khi variable trong `sensitivity list` đổi. Ở đây câu `if` kiểm đổi có phải rising edge của `clk`. Nếu có `q <= d` (“`q` nhận `d`”). Vì thế flip-flop copy `d` sang `q` ở positive edge, còn lại nhớ state cũ `q`.

Idiom VHDL khác cho flip-flop là

```
process(clk) begin
  if clk'event and clk = '1' then
    q <= d;
  end if;
end process;
```

`rising_edge(clk)` đồng nghĩa `clk'event and`

```
clk = '1'.
```

![fig4_14](images/ch04/fig4_14.png)

Hình 4.14 Circuit synthesize từ `flop`

### 4.4.3 Enabled register

Enabled register chỉ đáp ứng clock khi enable assert. Ví dụ HDL 4.19 là enabled register reset asynchronous, giữ giá trị cũ nếu cả `reset`, `en` FALSE.

#### Ví dụ HDL 4.18 RESETTABLE REGISTER

SystemVerilog

```
module flopr(input  logic          clk,
             input   logic         reset,
             input   logic  [3:0]  d,
             output logic [3:0] q);

 // asynchronous reset
 always_ff @(posedge clk, posedge reset)
    if (reset) q <= 4'b0;
    else       q  <=  d;
endmodule

module flopr(input   logic           clk,
             input   logic          reset,
             input   logic [3:0] d,
             output logic [3:0] q);

 // synchronous reset
 always_ff @(posedge clk)
   if (reset)   q <= 4'b0;
   else         q <= d;
endmodule
```

Nhiều signal trong sensitivity list câu `always` ngăn bằng phẩy hoặc `or`. Chú ý `posedge` `reset` có trong flop asynchronous, không trong synchronous. Vậy asynchronous đáp ngay rising edge `reset`; synchronous đáp `reset` chỉ tại rising edge clock.

Vì module cùng tên `flopr`, chỉ đưa một trong hai vào thiết kế. Muốn cả hai phải đổi tên một module.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity flopr is
  port(clk, reset: in    STD_LOGIC;
       d:                in   STD_LOGIC_VECTOR(3 downto 0);
       q:                out STD_LOGIC_VECTOR(3 downto 0));
end;
architecture asynchronous of flopr is
begin
  process(clk, reset) begin
    if reset then
      q <= "0000";
    elsif rising_edge(clk) then
      q <= d;
    end if;
  end process;
end;
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity flopr is
  port(clk, reset: in    STD_LOGIC;
       d:                in    STD_LOGIC_VECTOR(3 downto 0);
       q:                out STD_LOGIC_VECTOR(3 downto 0));
end;
architecture synchronous of flopr is
begin
  process(clk) begin
    if rising_edge(clk) then
      if reset then q <= "0000";
      else q <= d;
      end if;
    end if;
  end process;
end;
```

Nhiều signal trong sensitivity list `process` ngăn bằng phẩy. `reset` có trong flop asynchronous, không trong synchronous. Asynchronous đáp ngay rising edge `reset`, còn synchronous đáp `reset` chỉ tại rising edge clock.

Như đã nói, tên architecture (`asynchronous`, `synchronous` ở đây) bị tool bỏ qua nhưng hữu ích người đọc. Cả hai mô tả entity `flopr`, chỉ chọn một. Muốn cả hai phải đổi tên một module.

![fig4_15](images/ch04/fig4_15.png)

Hình 4.15 Circuit synthesize từ `flopr`: (a) asynchronous reset, (b) synchronous reset

### 4.4.4 Nhiều register

![fig4_17](images/ch04/fig4_17.png)

Hình 4.17 Synchronizer circuit

Một câu `always/process` mô tả được nhiều phần hardware. Ví dụ synchronizer Mục 3.5.5 gồm hai flip-flops back-to-back như Hình 4.17. Ví dụ HDL 4.20 mô tả. Tại rising edge `clk`, copy `d` sang `n1`; đồng thời `n1` sang `q`.

#### Ví dụ HDL 4.19 RESETTABLE ENABLED REGISTER

SystemVerilog

```
module flopenr(input logic       clk,
               input  logic           reset,
               input  logic           en,
               input  logic [3:0] d,
               output logic [3:0] q);

 // asynchronous reset
 always_ff @(posedge clk, posedge reset)
   if          (reset) q <= 4'b0;
   else if  (en)       q <= d;
endmodule
```

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity flopenr is
  port(clk,
       reset,
       en: in    STD_LOGIC;
       d:   in   STD_LOGIC_VECTOR(3 downto 0);
       q:   out STD_LOGIC_VECTOR(3 downto 0));
end;
architecture asynchronous of flopenr is
–– asynchronous reset
begin
  process(clk, reset) begin
    if reset then
      q <= "0000";
    elsif rising_edge(clk) then
      if en then
        q <= d;
      end if;
    end if;
  end process;
end;
```

![fig4_16](images/ch04/fig4_16.png)

Hình 4.16 Circuit synthesize từ `flopenr`

#### Ví dụ HDL 4.20 SYNCHRONIZER

SystemVerilog

```
module sync(input  logic  clk,
            input    logic    d,
            output  logic    q);

 logic n1;

 always_ff @(posedge clk)
   begin
    n1 <= d; // nonblocking
    q <= n1; // nonblocking
   end
endmodule
```

Chú ý cần cấu trúc `begin/end` vì nhiều statement nằm trong câu `always`. Tương tự `{}` trong C hoặc Java. Không cần `begin/end` ở ví dụ `flopr` vì `if/else` tính là một statement.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity sync is
  port(clk: in   STD_LOGIC;
       d:    in   STD_LOGIC;
       q:    out STD_LOGIC);
end;
architecture good of sync is
  signal n1: STD_LOGIC;
begin
  process(clk)  begin
   if rising_edge(clk) then
       n1 <= d;
       q <= n1;
   end  if;
  end  process;
end;
```

`n1` phải khai báo `signal` vì là internal signal dùng trong module.

![fig4_18](images/ch04/fig4_18.png)

Hình 4.18 Circuit synthesize từ `sync`

### 4.4.5 Latch

Nhớ Mục 3.2.2: D latch transparent khi clock HIGH, data đi input sang output; opaque khi LOW, giữ state cũ. Ví dụ HDL 4.21 cho idiom.

Không phải synthesis tool nào cũng hỗ trợ latch tốt. Trừ khi biết tool hỗ trợ và có lý do chính đáng để dùng, hãy tránh latch, dùng flip-flops edge-triggered thay thế. Cũng cần bảo đảm HDL không ngụ ý latch ngoài ý muốn, điều rất dễ xảy ra khi bất cẩn. Nhiều tool cảnh báo khi tạo latch; nếu bạn không chờ đợi nó, hãy tìm bug trong HDL. Nếu không biết mình có định dùng latch hay không, có lẽ bạn đang tiếp cận HDL như ngôn ngữ lập trình và còn những vấn đề lớn hơn đang ẩn phía sau.

## 4.5 THÊM VỀ COMBINATIONAL LOGIC

Mục 4.2 dùng assignment mô tả behavioral combinational logic. Câu `always` SystemVerilog và `process` VHDL mô tả sequential circuit vì nhớ state cũ nếu không chỉ state mới. Nhưng `always/process` cũng mô tả behavioral combinational nếu sensitivity list đáp mọi input đổi và body cho output ở mọi tổ hợp. Ví dụ HDL 4.22 dùng `always/process` mô tả dãy bốn inverter (circuit Hình 4.3).

### Ví dụ HDL 4.21 D LATCH

SystemVerilog

```
module latch(input  logic          clk,
             input   logic [3:0] d,
             output logic [3:0] q);

 always_latch
  if (clk) q <= d;
endmodule
```

`always_latch` tương đương `always @(clk, d)`, là idiom ưu tiên mô tả latch. Evaluate khi `clk` hoặc `d` đổi. Nếu `clk` HIGH, `d` đi sang `q`, mô tả positive level-sensitive latch. Nếu không `q` giữ cũ. SystemVerilog có thể cảnh báo nếu khối `always_latch` không ngụ ý latch.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity latch is
   port(clk: in   STD_LOGIC;
       d:    in   STD_LOGIC_VECTOR(3 downto 0);
       q:     out STD_LOGIC_VECTOR(3 downto 0));
end;
architecture synth of latch is
begin
  process(clk, d) begin
    if clk = '1' then
     q <= d;
    end if;
  end  process;
end;
```

Sensitivity list gồm `clk` và `d` nên `process` evaluate khi `clk` hoặc `d` đổi. Nếu `clk` HIGH, `d` đi tới `q`.

![fig4_19](images/ch04/fig4_19.png)

Hình 4.19 Circuit synthesize từ `latch`

HDL hỗ trợ blocking/nonblocking assignment trong `always/process`. Nhóm blocking evaluate theo thứ tự code như ngôn ngữ lập trình thường. Nhóm nonblocking evaluate đồng thời; mọi statement evaluate trước khi bất kỳ signal left-hand side được cập nhật.

Ví dụ HDL 4.23 định nghĩa full adder dùng signal trung gian `p`, `g` tính `s`, `cout`. Tạo cùng circuit Hình 4.8 nhưng dùng `always/process` thay assignment.

Ví dụ 4.22, 4.23 dùng `always/` `process` chưa tốt cho combinational vì tốn dòng hơn assignment tương đương Ví dụ 4.2, 4.7. Nhưng `case`, `if` tiện cho logic phức tạp. Câu `case`, `if` phải trong `always/process`, sẽ xét mục tiếp.

#### Ví dụ HDL 4.22 INVERTER DÙNG `always/process`

SystemVerilog

```
module  inv(input   logic   [3:0]  a,
            output  logic  [3:0]  y);

 always_comb
   y = ~a;
endmodule
```

`always_comb` evaluate lại statement bên trong `always` khi signal right-hand side của `<=` hoặc `=` trong `always` đổi. Ở đây tương đương `always @(a)` nhưng tốt hơn vì tránh lỗi đổi tên/thêm signal trong `always`. Nếu code trong `always` không combinational, cảnh báo. `always_comb` tương đương `always @(*)` nhưng được ưu tiên.

`=` trong `always` gọi blocking assignment, khác nonblocking `<=`. Nên dùng blocking cho combinational, nonblocking cho sequential; Mục 4.5.4 bàn tiếp.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity inv is
  port(a: in    STD_LOGIC_VECTOR(3 downto 0);
       y:  out STD_LOGIC_VECTOR(3 downto 0));
end;
architecture proc of inv is
begin
  process(all)  begin
    y <= not a;
  end  process;
end;
```

`process(all)` evaluate lại các câu trong `process` khi bất kỳ signal trong `process` đổi. Tương đương `process(a)` nhưng tốt hơn vì tránh lỗi khi đổi tên/thêm signal trong `process`.

VHDL bắt buộc `begin`, `end process` dù `process` chỉ một assignment.

SystemVerilog

Trong `always` SystemVerilog, `=` chỉ blocking, `<=` nonblocking (còn gọi concurrent assignment).

Đừng nhầm với continuous assignment, tức `assign`. Câu `assign` phải ngoài `always`, cũng evaluate đồng thời.

VHDL

Trong `process` VHDL, `:=` blocking, `<=` nonblocking (concurrent). Đây là mục đầu giới thiệu `:=`.

Nonblocking gán cho output/signal. Blocking gán variable khai báo trong `process` (Ví dụ 4.23). `<=` cũng có thể ngoài `process`, khi đó evaluate đồng thời.

#### Ví dụ HDL 4.23 FULL ADDER DÙNG `always/process`

SystemVerilog

```
module fulladder(input   logic a, b, cin,
                 output logic  s, cout);
  logic p, g;

  always_comb
    begin
     p = a ^ b;                     // blocking
     g = a & b;                     // blocking
     s = p ^ cin;                   // blocking
     cout = g | (p & cin);          // blocking
    end
endmodule
```

Ở đây `always @(a, b, cin)` tương đương `always_comb`, nhưng `always_comb` tốt hơn vì tránh lỗi thiếu signal sensitivity list.

Vì lý do Mục 4.5.4, tốt nhất dùng blocking cho combinational. Ví dụ dùng blocking, tính `p`, rồi `g`, `s`, cuối `cout`.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity fulladder is
  port(a, b, cin: in   STD_LOGIC;
       s, cout:     out STD_LOGIC);
end;
architecture synth of fulladder is
begin
  process(all)
    variable p, g: STD_LOGIC;
  begin
    p := a xor b; –– blocking
    g := a and b; –– blocking
    s <= p xor cin;
    cout <= g or (p and cin);
  end  process;
end;
```

Ở đây `process(a, b, cin)` tương đương `process(all)`, nhưng `process(all)` tốt hơn vì tránh thiếu signal sensitivity list.

Vì lý do Mục 4.5.4, tốt nhất blocking cho intermediate variable trong combinational. Ví dụ blocking cho `p`, `g` để nhận mới trước khi dùng tính `s`, `cout` phụ thuộc chúng.

Vì `p`, `g` ở left-hand side blocking (`:=`) trong `process`, phải khai báo `variable` thay `signal`. Declaration `variable` ở trước `begin` trong process dùng nó.

### 4.5.1 Câu lệnh case

Ứng dụng tốt hơn của `always/process` cho combinational là decoder seven-segment display, tận dụng `case` phải nằm trong `always/process`.

Như thấy trong decoder seven-segment Ví dụ 2.10, thiết kế combinational lớn tẻ nhạt, dễ lỗi. HDL cải thiện lớn: chỉ function ở abstraction cao rồi tự synthesize thành gate. Ví dụ HDL 4.24 dùng `case` mô tả decoder seven-segment theo truth table. `case` làm action khác tùy input. Câu `case` ngụ ý combinational nếu mọi tổ hợp được định nghĩa; nếu không ngụ ý sequential vì output giữ cũ ở trường hợp undefined.

HDL decoder seven-segment synthesize thành read-only memory (ROM) chứa 7 output cho mỗi trong 16 input. Mục 5.5.6 bàn ROM.

Nếu bỏ `default` hoặc `others` khỏi `case`, decoder nhớ output cũ mỗi khi data 10–15. Hành vi này lạ với hardware.

Decoder thường cũng viết `case`. Ví dụ HDL 4.25 mô tả decoder 3:8.

### 4.5.2 Câu lệnh if

Câu `always/process` cũng có thể chứa `if`. Câu `if` có thể theo sau bởi `else`. Nếu xử lý mọi tổ hợp, ngụ ý combinational; nếu không tạo sequential như latch Mục 4.4.5.

#### Ví dụ HDL 4.24 DECODER SEVEN-SEGMENT DISPLAY

SystemVerilog

```
module sevenseg(input   logic [3:0] data,
                output logic [6:0] segments);
  always_comb
   case(data)
     //                                  abc_defg
     0:        segments  =  7'b111_1110;
     1:        segments  =  7'b011_0000;
     2:        segments  =  7'b110_1101;
     3:        segments  =  7'b111_1001;
     4:        segments  =  7'b011_0011;
     5:        segments  =  7'b101_1011;
     6:        segments  =  7'b101_1111;
     7:        segments  =  7'b111_0000;
     8:        segments  =  7'b111_1111;
     9:        segments  =  7'b111_0011;
     default:  segments = 7'b000_0000;
    endcase
  endmodule
```

`case` kiểm giá trị `data`. Khi `data` là 0, làm action sau dấu hai chấm, đặt `segments` thành 1111110. Tương tự kiểm tới 9 (chú ý cơ số mặc định 10).

Mệnh đề `default` tiện định nghĩa output mọi trường hợp chưa liệt kê, bảo đảm combinational.

Trong SystemVerilog, `case` phải trong `always`.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity seven_seg_decoder is
   port(data:         in    STD_LOGIC_VECTOR(3 downto 0);
        segments: out STD_LOGIC_VECTOR(6 downto 0));
end;
architecture synth of seven_seg_decoder is
begin
  process(all) begin
    case data is
     ––                            abcdefg
     when X"0"     => segments <= "1111110";
     when X"1"     => segments <= "0110000";
     when X"2"     => segments <= "1101101";
     when X"3"     => segments <= "1111001";
     when X"4"     => segments <= "0110011";
     when X"5"     => segments <= "1011011";
     when X"6"     => segments <= "1011111";
     when X"7"     => segments <= "1110000";
     when X"8"     => segments <= "1111111";
     when X"9"     => segments <= "1110011";
     when others => segments <= "0000000";
    end case;
  end process;
end;
```

`case` kiểm giá trị `data`. Khi `data` bằng `0`, làm action sau `=>`, đặt `segments` thành 1111110. `case` tương tự kiểm tới 9 (chú ý `X` chỉ hexadecimal). `others` tiện định nghĩa output mọi trường hợp khác, bảo đảm combinational.

Khác SystemVerilog, VHDL hỗ trợ selected signal assignment (Ví dụ 4.6), như `case` nhưng có thể ngoài process. Vì vậy ít lý do dùng process cho combinational.

![fig4_20](images/ch04/fig4_20.png)

Hình 4.20 Circuit synthesize từ `sevenseg`

#### Ví dụ HDL 4.25 DECODER 3:8

SystemVerilog

```
module  decoder3_8(input    logic   [2:0]   a,
                   output logic [7:0] y);

 always_comb
    case(a)
      3'b000:     y = 8'b00000001;
      3'b001:     y = 8'b00000010;
      3'b010:     y = 8'b00000100;
      3'b011:     y = 8'b00001000;
      3'b100:     y = 8'b00010000;
      3'b101:     y = 8'b00100000;
      3'b110:     y = 8'b01000000;
      3'b111:     y = 8'b10000000;
      default:  y = 8'bxxxxxxxx;
    endcase
endmodule
```

Ở đây `default` không tuyệt đối cần cho synthesis vì đã định nghĩa mọi input, nhưng thận trọng cho simulation nếu input `x` hay `z`.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity decoder3_8 is
  port(a: in    STD_LOGIC_VECTOR(2 downto 0);
       y: out STD_LOGIC_VECTOR(7 downto 0));
end;
architecture synth of decoder3_8 is
begin
  process(all) begin
   case a is
      when "000"    => y <= "00000001";
      when "001"    => y <= "00000010";
      when "010"    => y <= "00000100";
      when "011"    => y <= "00001000";
      when "100"    => y <= "00010000";
      when "101"    => y <= "00100000";
      when "110"    => y <= "01000000";
      when "111"    => y <= "10000000";
      when others => y <= "XXXXXXXX";
   end case;
  end process;
end;
```

Ở đây `others` không tuyệt đối cần cho synthesis vì mọi input đã định nghĩa, nhưng thận trọng simulation nếu input `x`, `z` hoặc `u`.

![fig4_21](images/ch04/fig4_21.png)

Hình 4.21 Circuit synthesize từ `decoder3_8`

#### Ví dụ HDL 4.26 PRIORITY CIRCUIT

SystemVerilog

```
module priorityckt(input  logic [3:0] a,
                   output logic [3:0] y);
  always_comb
   if         (a[3])  y = 4'b1000;
   else if (a[2]) y = 4'b0100;
   else if (a[1]) y = 4'b0010;
   else if (a[0]) y = 4'b0001;
   else                  y = 4'b0000;
endmodule
```

Trong SystemVerilog, `if` phải trong `always`.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity priorityckt is
  port(a: in    STD_LOGIC_VECTOR(3 downto 0);
       y: out STD_LOGIC_VECTOR(3 downto 0));
end;
architecture synth of priorityckt is
begin
  process(all)  begin
   if       a(3) then  y <= "1000";
   elsif a(2) then y <= "0100";
   elsif a(1) then y <= "0010";
   elsif a(0) then y <= "0001";
   else                    y <= "0000";
   end  if;
  end  process;
end;
```

Khác SystemVerilog, VHDL hỗ trợ conditional signal assignment (Ví dụ 4.6), như `if` nhưng có thể ngoài process. Vì vậy ít lý do dùng process mô tả combinational.

![fig4_22](images/ch04/fig4_22.png)

Hình 4.22 Circuit synthesize từ `priorityckt`

Ví dụ HDL 4.26 dùng `if` mô tả priority circuit Mục 2.4. Nhớ priority circuit N-input đặt output TRUE tương ứng input most significant TRUE.

### 4.5.3 Truth table có don’t care

Như Mục 2.7.3, truth table có thể có don’t care để đơn giản logic hơn. Ví dụ HDL 4.27 mô tả priority circuit có don’t care.

Synthesis tool tạo circuit hơi khác cho module này, Hình 4.23 so với Hình 4.22. Nhưng chúng tương đương logic.

### 4.5.4 Blocking và nonblocking assignment

Hướng dẫn trang 204 giải thích khi nào, cách dùng mỗi loại assignment. Không theo có thể viết code simulation có vẻ đúng nhưng synthesis hardware sai. Phần còn lại tùy chọn giải thích nguyên tắc phía sau.

#### Ví dụ HDL 4.27 PRIORITY CIRCUIT DÙNG DON’T CARE

SystemVerilog

```
module priority_casez(input  logic [3:0] a,
                      output logic [3:0] y);
  always_comb
    casez(a)
     4'b1???: y = 4'b1000;
     4'b01??: y = 4'b0100;
     4'b001?: y = 4'b0010;
     4'b0001: y = 4'b0001;
     default: y = 4'b0000;
    endcase
endmodule
```

`casez` giống `case` nhưng nhận `?` là don’t care.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity priority_casez is
  port(a: in   STD_LOGIC_VECTOR(3 downto 0);
       y: out STD_LOGIC_VECTOR(3 downto 0));
end;
architecture dontcare of priority_casez is
begin
  process(all)  begin
    case? a is
     when "1---" => y <= "1000";
     when "01--" => y <= "0100";
     when "001-" => y <= "0010";
     when "0001" => y <= "0001";
     when others => y <= "0000";
    end  case?;
  end  process;
end;
```

`case?` giống `case` nhưng nhận `–` là don’t care.

![fig4_23](images/ch04/fig4_23.png)

Hình 4.23 Circuit synthesize từ `priority_casez`

HƯỚNG DẪN BLOCKING VÀ NONBLOCKING ASSIGNMENT

SystemVerilog

1\. Dùng `always_ff @(posedge clk)` và nonblocking assignment

để mô hình hóa synchronous sequential logic.

```
always_ff @(posedge clk)
  begin
    n1 <= d; // nonblocking
    q <= n1; // nonblocking
  end
```

2\. Dùng continuous assignment mô hình hóa combinational

logic đơn giản.

```
assign y = s ? d1 : d0;
```

3\. Dùng `always_comb` và blocking assignment mô hình hóa

combinational logic phức tạp hơn, nơi câu

`always` hữu ích.

```
always_comb
  if         (a[3]) y = 4’b1000;
  else if (a[2]) y = 4’b0100;
  else if (a[1]) y = 4’b0010;
  else if (a[0]) y = 4’b0001;
  else                 y = 4’b0000;
```

4\. Không gán cùng signal trong nhiều hơn

một câu `always` hoặc continuous assignment.

VHDL

1\. Dùng `process(clk)` và nonblocking assignment mô hình hóa

synchronous sequential logic.

```
process(clk) begin
  if rising_edge(clk) then
    n1 <= d; –– nonblocking
    q <= n1; –– nonblocking
  end  if;
end process;
```

2\. Dùng concurrent assignment ngoài `process` để

mô hình hóa combinational logic đơn giản.

```
y <= d0 when s = '0' else d1;
```

3\. Dùng `process(all)` mô hình hóa combinational

logic phức tạp hơn, nơi `process` hữu ích. Dùng blocking

assignment cho internal variable.

```
process(all)
  variable p, g: STD_LOGIC;
begin
   p := a xor b; –– blocking
   g := a and b; –– blocking
   s <= p xor cin;
   cout <= g or (p and cin);
end process;
```

4\. Không gán cùng variable trong nhiều hơn

một `process` hoặc concurrent assignment.

Combinational logic\*

Full adder Ví dụ HDL 4.23 mô hình đúng bằng blocking. Phần này xem hoạt động và khác biệt nếu dùng nonblocking.

Giả sử `a`, `b`, `cin` ban đầu 0. `p`, `g`, `s`, `cout` cũng 0. Lúc nào đó `a` đổi thành 1, kích `always/process`. Bốn blocking assignment evaluate theo thứ tự đây. (Trong VHDL, `s`, `cout` được gán đồng thời.) Chú ý `p`, `g` nhận mới trước khi tính `s`, `cout` do blocking. Quan trọng vì muốn tính `s`, `cout` bằng giá trị mới `p`, `g`.

1\. `p` ← 1 ⊕ 0 = 1 2. `g` ← 1 ∙ 0 = 0

3\. `s` ← 1 ⊕ 0 = 1 4. `cout` ← 0 + 1 ∙ 0 = 0

Ngược lại, Ví dụ HDL 4.28 minh họa nonblocking.

Xét cùng trường hợp `a` tăng 0 lên 1, `b`, `cin` bằng 0. Bốn nonblocking evaluate đồng thời:

`p` ← 1 ⊕ 0 = 1 `g` ← 1 ∙ 0 = 0 `s` ← 0 ⊕ 0 = 0 `cout` ← 0 + 0 ∙ 0 = 0

#### Ví dụ HDL 4.28 FULL ADDER DÙNG NONBLOCKING ASSIGNMENT

SystemVerilog

```
// nonblocking assignments (not recommended)
module fulladder(input    logic a, b, cin,
                 output logic s, cout);
 logic p, g;

  always_comb
   begin
      p <= a ^ b; // nonblocking
      g <= a & b; // nonblocking

      s <= p ^ cin;
    cout <= g | (p & cin);
  end
endmodule
```

VHDL

```
–– nonblocking assignments (not recommended)
library IEEE; use IEEE.STD_LOGIC_1164.all;

entity fulladder is
  port(a, b, cin: in    STD_LOGIC;
       s, cout:    out STD_LOGIC);
end;

architecture nonblocking of fulladder is
  signal p, g: STD_LOGIC;
begin
  process(all) begin
   p <= a xor b; –– nonblocking
   g <= a and b; –– nonblocking
   s <= p xor cin;
   cout <= g or (p and cin);
  end process;
end;
```

Vì `p`, `g` ở left-hand side nonblocking trong `process`, phải khai báo `signal` thay `variable`. Declaration `signal` trước `begin` trong `architecture`, không trong `process`.

Chú ý `s` tính đồng thời `p`, nên dùng giá trị cũ `p`, không mới. Vì vậy `s` còn 0 thay vì 1. Nhưng `p` đổi 0 thành 1, kích `always/process` evaluate lần hai:

`p` ← 1 ⊕ 0 = 1 `g` ← 1 ∙ 0 = 0 `s` ← 1 ⊕ 0 = 1 `cout` ← 0 + 1 ∙ 0 = 0

Lần này `p` đã 1, nên `s` đổi đúng thành 1. Nonblocking cuối cùng đúng nhưng `always/process` phải evaluate hai lần, làm simulation chậm dù synthesis cùng hardware.

Một nhược điểm khác của nonblocking assignment khi mô hình combinational logic là HDL cho kết quả sai nếu quên đưa intermediate variable vào sensitivity list.

Tệ hơn, một số synthesis tool vẫn tạo hardware đúng dù sensitivity list sai gây simulation không đúng. Điều này dẫn đến mismatch giữa kết quả simulation và hoạt động thực của hardware.

Sequential logic\*

Synchronizer Ví dụ HDL 4.20 mô hình đúng bằng nonblocking. Rising edge copy `d` sang `n1` đồng thời `n1` sang `q`, mô tả đúng hai register. Ví dụ ban đầu `d` = 0, `n1` = 1, `q` = 0. Tại rising edge, hai assignment sau đồng thời, nên sau edge `n1` = 0, `q` = 1.

`n1`←`d` = 0 `q`←`n1` = 1

Ví dụ HDL 4.29 thử cùng module với blocking. Rising edge `clk` copy `d` sang `n1`, rồi giá trị mới `n1` sang `q`, khiến `d` xuất hiện sai tại cả `n1`, `q`. Assignment nối tiếp nên sau edge `q = n1` = 0.

1\. `n1` ←`d` = 0

2\. `q` ←`n1` = 0

SystemVerilog

Nếu sensitivity list `always` Ví dụ 4.28 viết `always @(a, b, cin)` thay `always_comb`, không evaluate lại khi `p` hoặc `g` đổi. Khi đó `s` sai ở 0 thay 1.

VHDL

Nếu sensitivity list process Ví dụ 4.28 viết `process(a, b, cin)` thay `process(all)`, không evaluate lại khi `p` hoặc `g` đổi. Khi đó `s` sai ở 0 thay 1.

Vì `n1` vô hình với ngoài, không ảnh hưởng `q`, synthesizer bỏ hoàn toàn như Hình 4.24.

Bài học của ví dụ là chỉ dùng nonblocking assignment trong câu `always/process` khi mô hình sequential logic. Đủ khéo léo, như đảo thứ tự assignment, bạn có thể làm blocking hoạt động đúng, nhưng blocking không đem lại lợi thế và chỉ thêm nguy cơ hành vi ngoài ý muốn. Một số sequential circuit không hoạt động với blocking bất kể thứ tự.

## 4.6 FINITE STATE MACHINE

Nhớ FSM gồm state register và hai khối combinational tính next state, output từ current state/input, như Hình 3.22. Mô tả HDL tương ứng chia ba phần: state register, next state logic, output logic.

### Ví dụ HDL 4.29 SYNCHRONIZER SAI VỚI BLOCKING ASSIGNMENT

SystemVerilog

```
// Bad implementation of a synchronizer using blocking
//    assignments

module syncbad(input    logic clk,
              input      logic  d,
              output logic q);

 logic  n1;

 always_ff @(posedge clk)
   begin
    n1 = d; // blocking
    q = n1; // blocking
   end
endmodule
```

VHDL

```
–– Bad implementation of a synchronizer using blocking
––    assignment

library IEEE; use IEEE.STD_LOGIC_1164.all;

entity syncbad is
  port(clk:in      STD_LOGIC;
       d:   in    STD_LOGIC;
       q:   out STD_LOGIC);
end;

architecture bad of syncbad is
begin
  process(clk)
   variable n1: STD_LOGIC;
  begin
   if rising_edge(clk) then
    n1 := d; –– blocking
    q <= n1;
   end  if;
  end  process;
end;
```

![fig4_24](images/ch04/fig4_24.png)

Hình 4.24 Circuit synthesize từ `syncbad`

Ví dụ HDL 4.30 mô tả FSM divide-by-3 Mục 3.4.2, có asynchronous reset khởi tạo. State register dùng idiom flip-flop thường. Khối next state và output là combinational.

Synthesis tool chỉ tạo block diagram và state transition diagram cho state machine, không hiển thị gate hoặc input/output trên cung/state. Vì vậy cẩn thận chỉ FSM đúng. Hình 4.25 FSM divide-by-3 tương tự Hình 3.28(b). Vòng đôi chỉ S0 là reset state. Implementation Gate-level của divide-by-3 đã cho Mục 3.4.2.

#### Ví dụ HDL 4.30 FINITE STATE MACHINE DIVIDE-BY-3

SystemVerilog

```
module divideby3FSM(input    logic clk,
                    input    logic reset,
                    output logic y);
   typedef enum logic [1:0] {S0, S1, S2} statetype;
  statetype  state,  nextstate;

  //  state  register
  always_ff @(posedge clk, posedge reset)
    if (reset) state <= S0;
    else           state <= nextstate;

  // next state logic
  always_comb
    case (state)
     S0:          nextstate = S1;
     S1:          nextstate = S2;
     S2:          nextstate = S0;
     default: nextstate = S0;
    endcase

  // output logic
  assign y = (state = = S0);
endmodule
```

`typedef` định nghĩa `statetype` là logic value two-bit với ba khả năng `S0`, `S1`, `S2`. `state`, `nextstate` là signal `statetype`.

Enumerated encoding mặc định theo số: `S0`=00, `S1`=01, `S2`=10. Người dùng có thể đặt tường minh nhưng tool coi là gợi ý, không bắt buộc. Ví dụ đoạn sau encode state bằng one-hot 3-bit:

```
typedef enum logic [2:0] {S0 = 3'b001, S1 = 3'b010, S2 = 3'b100}
statetype;
```

Chú ý dùng `case` định nghĩa state transition table. Vì next state combinational nên cần `default` dù state `2'b11` không nên xảy ra.

Output `y` bằng 1 khi state `S0`. Comparison `a = = b` là 1 nếu `a` bằng `b`, còn lại 0. Inequality `a != b` ngược lại: 1 nếu `a` khác `b`.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity divideby3FSM is
  port(clk, reset: in    STD_LOGIC;
       y:                 out STD_LOGIC);
end;
architecture synth of divideby3FSM is
  type statetype is (S0, S1, S2);
  signal state, nextstate: statetype;
begin
  –– state register
  process(clk, reset) begin
   if reset then state <= S0;
   elsif rising_edge(clk) then
     state <= nextstate;
   end if;
  end process;
  –– next state logic
  nextstate <= S1 when state = S0 else
              S2 when state = S1 else
              S0;
  –– output logic
  y <= '1' when state = S0 else '0';
end;
```

Ví dụ định nghĩa enumeration data type mới `statetype`, ba khả năng `S0`, `S1`, `S2`. `state`, `nextstate` là signal `statetype`. Dùng enumeration thay chọn encoding cho synthesizer tự tìm nhiều encoding chọn tốt nhất.

Trong HDL trên, output `y` là 1 khi `state` là `S0`. Inequality dùng `/=`. Muốn output 1 khi state bất cứ gì trừ `S0`, đổi thành `state /= S0`.

![fig4_25](images/ch04/fig4_25.png)

Hình 4.25 Circuit synthesize từ `divideby3fsm`

> Tool dùng encoding 3-bit `(Q[2:0])` thay 2-bit gợi ý trong SystemVerilog.

State đặt tên bằng enumeration thay tham chiếu binary value, giúp code dễ đọc và đổi.

Nếu vì lý do nào muốn HIGH ở S0, S1, sửa output logic như sau.

Hai ví dụ tiếp mô tả FSM nhận dạng mẫu ốc sên Mục 3.4.3. Code dùng `case`, `if` xử lý next state/output phụ thuộc input và current state. Có cả Moore và Mealy. Moore (Ví dụ 4.31) output chỉ theo current state; Mealy (4.32) theo cả state và input.

SystemVerilog

```
// output logic
assign y = (state = = S0 | state = = S1);
```

VHDL

```
–– output logic
y <= '1' when (state = S0 or state = S1) else '0';
```

#### Ví dụ HDL 4.31 MOORE FSM NHẬN DẠNG MẪU

SystemVerilog

```
module  patternMoore(input     logic  clk,
                    input    logic reset,
                    input    logic a,
                    output logic y);

  typedef enum logic [1:0] {S0, S1, S2} statetype;
  statetype state, nextstate;

  // state register
  always_ff @(posedge clk, posedge reset)
   if (reset) state <= S0;
   else           state <= nextstate;

  // next state logic
  always_comb
   case (state)
     S0: if (a) nextstate = S0;
         else     nextstate = S1;
     S1: if (a) nextstate = S2;
         else     nextstate = S1;
     S2: if (a) nextstate = S0;
         else     nextstate = S1;
     default:   nextstate = S0;
   endcase

  // output logic
  assign  y  =  (state  = =  S2);
endmodule
```

Nonblocking (`<=`) dùng trong state register mô tả sequential, blocking (`=`) trong next state mô tả combinational.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity patternMoore is
   port(clk, reset: in   STD_LOGIC;
        a:                 in     STD_LOGIC;
        y:                out STD_LOGIC);
end;
architecture synth of patternMoore is
  type statetype is (S0, S1, S2);
  signal state, nextstate: statetype;
begin
  –– state register
  process(clk, reset) begin
     if reset then                             state <= S0;
     elsif rising_edge(clk) then state <= nextstate;
     end  if;
  end process;
  –– next state logic
  process(all) begin
     case  state  is
      when S0 =>
       if a then nextstate <= S0;
       else          nextstate <= S1;
       end if;
      when S1 =>
       if a then nextstate <= S2;
       else          nextstate <= S1;
       end if;
      when S2 =>
       if a then nextstate <= S0;
       else          nextstate <= S1;
       end if;
      when others =>
                     nextstate <= S0;
    end case;
  end process;
  ––output logic
  y <= '1' when state = S2 else '0';
end;
```

![fig4_26](images/ch04/fig4_26.png)

Hình 4.26 Circuit synthesize từ `patternMoore`

## 4.7 DATA TYPE\*

Phần này giải thích sâu các điểm tinh tế type SystemVerilog/VHDL.

### Ví dụ HDL 4.32 MEALY FSM NHẬN DẠNG MẪU

SystemVerilog

```
module  patternMealy(input     logic  clk,
                    input      logic reset,
                    input    logic a,
                    output logic y);

  typedef enum logic {S0, S1} statetype;
  statetype state, nextstate;

  // state register
  always_ff @(posedge clk, posedge reset)
   if (reset) state <= S0;
   else           state <= nextstate;

  // next state logic
  always_comb
   case  (state)
     S0: if (a)  nextstate = S0;
         else    nextstate = S1;
     S1: if (a) nextstate = S0;
         else    nextstate = S1;
     default:   nextstate = S0;
   endcase

  // output logic
  assign  y  =  (a  &  state  = =  S1);
endmodule
```

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity patternMealy is
   port(clk, reset: in     STD_LOGIC;
       a:                in    STD_LOGIC;
       y:                out STD_LOGIC);
end;
architecture synth of patternMealy is
   type statetype is (S0, S1);
   signal state, nextstate: statetype;
begin
   –– state register
   process(clk, reset) begin
     if reset then                        state <= S0;
     elsif rising_edge(clk) then state <= nextstate;
     end if;
  end process;
  –– next state logic
  process(all) begin
    case state is
      when S0 =>
       if a then nextstate <= S0;
       else        nextstate <= S1;
       end if;
      when S1 =>
       if a then nextstate <= S0;
       else        nextstate <= S1;
       end if;
      when others =>
                   nextstate <= S0;
    end  case;
  end process;
  –– output logic
  y <= '1' when (a = '1' and state = S1) else '0';
end;
```

![fig4_27](images/ch04/fig4_27.png)

Hình 4.27 Circuit synthesize từ `patternMealy`

### 4.7.1 SystemVerilog

Trước SystemVerilog, Verilog chủ yếu dùng `reg`, `wire`. Dù tên như vậy, signal `reg` có thể gắn register hoặc không, gây nhầm lớn người học. SystemVerilog đưa `logic` loại nhầm; sách nhấn mạnh `logic`. Phần này giải thích kỹ `reg`, `wire` cho người cần đọc code cũ.

Trong Verilog, signal ở left-hand side `<=` hoặc `=` trong `always` phải khai báo `reg`. Nếu không nên `wire`. Vì vậy signal `reg` có thể là output flip-flop, latch hoặc combinational tùy sensitivity list và statement khối `always`.

Input/output port mặc định `wire` trừ khi type định nghĩa `reg`. Ví dụ sau là flip-flop Verilog thường. `clk`, `d` mặc định `wire`, `q` tường minh `reg` vì ở left-hand side `<=` trong `always`.

```
module flop(input            clk,
            input      [3:0] d,
            output reg [3:0] q);

  always @(posedge clk)
    q <= d;
endmodule
```

SystemVerilog đưa type `logic`. `logic` đồng nghĩa `reg`, tránh gây hiểu nhầm có thật là flip-flop không. Cũng nới rule `assign` và hierarchical port instantiation để `logic` dùng ngoài `always` nơi trước cần `wire`. Gần mọi signal có thể `logic`. Ngoại lệ nhiều driver (tristate bus) phải net như Ví dụ 4.10, để báo error thay giá trị `x` khi signal `logic` vô tình nối nhiều driver.

Net phổ biến nhất `wire` hoặc `tri`, đồng nghĩa nhưng `wire` thường khi một driver, `tri` khi nhiều. Vì vậy `wire` lỗi thời trong SystemVerilog do `logic` được ưu tiên một driver.

Net `tri` do một/nhiều driver lái cùng giá trị sẽ nhận giá trị đó. Không lái thì float (`z`). Nhiều driver lái giá trị khác (`0`, `1`, `x`) thì contention (`x`).

Net type khác có cách resolve khác khi không driver hoặc nhiều nguồn, hiếm dùng nhưng có thể thay nơi thường có `tri` (như signal nhiều driver). Bảng 4.7 mô tả từng loại.

Bảng 4.7 Net resolution

| Net type | Không driver | Driver xung đột |
|---|---|---|
| `tri` | `z` | `x` |
| `trireg` | `previous value` | `x` |
| `triand` | `z` | `0 if there are any 0` |
| `trior` | `z` | `1 if there are any 1` |
| `tri0` | `0` | `x` |
| `tri1` | `1` | `x` |

### 4.7.2 VHDL

Khác SystemVerilog, VHDL cưỡng chế type system chặt, bảo vệ khỏi vài lỗi nhưng đôi lúc cồng kềnh.

Dù quan trọng căn bản, `STD_LOGIC` không tích hợp trong VHDL mà thuộc library `IEEE.STD_LOGIC_1164`. Vì vậy mỗi file phải có library statement như ví dụ trước.

Hơn nữa `IEEE.STD_LOGIC_1164` thiếu operation cơ bản cộng, so sánh, shift, chuyển integer cho data `STD_` `LOGIC_VECTOR`. Cuối cùng chúng thêm vào VHDL 2008 trong `IEEE.NUMERIC_STD_UNSIGNED`.

VHDL còn có `BOOLEAN` hai giá trị `true`, `false`. `BOOLEAN` trả từ comparison như `s ='0'`, dùng conditional như `when`, `if`. Dù dễ nghĩ `BOOLEAN true` tương đương `STD_LOGIC '1'`, `BOOLEAN false` nghĩa `STD_LOGIC` '`0`', trước 2008 không thay nhau. Ví dụ code cũ phải viết

```
y <= d1 when (s = '1') else d0;
```

còn VHDL 2008, `when` tự chuyển `s` từ `STD_LOGIC` sang `BOOLEAN`, nên chỉ cần

```
y <= d1 when s else d0;
```

Ngay VHDL 2008 vẫn phải viết

```
q <= '1' when (state = S2) else '0';
```

thay vì

```
q  <=  (state = S2);
```

vì `(state = S2)` trả `BOOLEAN`, không gán trực tiếp cho signal `STD_LOGIC` `y` được.

Dù không khai báo signal `BOOLEAN`, comparison tự ngụ ý và conditional dùng chúng. Tương tự VHDL có `INTEGER` biểu diễn cả dương/âm. Signal type `INTEGER` bao ít nhất –(2<sup>31</sup> – 1) đến 2<sup>31</sup> – 1. Integer làm index bus. Ví dụ câu

```
y <= a(3) and a(2) and a(1) and a(0);
```

0, 1, 2, 3 là integer làm index chọn bit signal `a`. Không index bus trực tiếp bằng `STD_LOGIC` hoặc `STD_LOGIC_VECTOR`; phải chuyển thành `INTEGER`. Ví dụ dưới multiplexer 8:1 chọn bit bằng index 3-bit. Function `TO_INTEGER` trong `IEEE.NUMERIC_STD_UNSIGNED` chuyển `STD_LOGIC_VECTOR` sang `INTEGER` cho giá trị dương (unsigned).

```
library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD_UNSIGNED.all;
entity mux8 is
  port(d: in  STD_LOGIC_VECTOR(7 downto 0);
         s: in  STD_LOGIC_VECTOR(2 downto 0);
        y: out STD_LOGIC);
end;
architecture synth of mux8 is
begin
  y  <=   d(TO_INTEGER(s));
end;
```

VHDL nghiêm việc port `out` chỉ output. Ví dụ code AND two- và three-input sau bất hợp lệ vì `v` là output, cũng dùng tính `w`.

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity  and23  is
  port(a, b, c: in STD_LOGIC;
       v, w: out   STD_LOGIC);
end;

architecture synth of and23 is
begin
  v  <=   a  and  b;
  w  <=   v  and  c;
end;
```

VHDL có port đặc biệt `buffer` giải quyết. Signal nối `buffer` hành xử output nhưng cũng dùng được trong module. Entity sửa như sau. Verilog/SystemVerilog không hạn chế này, không cần port `buffer`. VHDL 2008 bỏ hạn chế, cho đọc port `out`.

![fig4_28](images/ch04/fig4_28.png)

Hình 4.28 Circuit synthesize từ `and23`

```
entity and23 is
  port(a,    b,  c:  in  STD_LOGIC;
       v:   buffer      STD_LOGIC;
       w:    out            STD_LOGIC);
end;
```

Phần lớn operation như cộng, trừ, Boolean giống nhau dù signed/unsigned. Nhưng so độ lớn, nhân, arithmetic right shift khác giữa signed two’s complement và unsigned binary. Chương 5 xét các operation. Ví dụ HDL 4.33 cho cách chỉ signal là signed.

## 4.8 PARAMETERIZED MODULE\*

Đến đây module có input/output fixed-width. Ví dụ phải định nghĩa riêng multiplexer 2:1 4- và 8-bit-wide. HDL cho độ rộng biến đổi bằng parameterized module.

Ví dụ HDL 4.34 khai báo multiplexer 2:1 parameterized mặc định 8, rồi tạo multiplexer 4:1 8- và 12-bit.

### Ví dụ HDL 4.33 (a) UNSIGNED MULTIPLIER (b) SIGNED MULTIPLIER

SystemVerilog

```
// 4.33(a): unsigned multiplier
module multiplier(input    logic [3:0] a, b,
                  output logic [7:0] y);
  assign y = a * b;
endmodule

// 4.33(b): signed multiplier
module multiplier(input    logic signed [3:0] a, b,
                  output logic signed [7:0] y);

  assign y = a * b;
endmodule
```

SystemVerilog mặc định signal unsigned. Thêm modifier `signed` (như `logic signed [3:0] a`) khiến signal `a` được xem signed, tức two’s complement.

VHDL

```
–– 4.33(a): unsigned multiplier
library IEEE; use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD_UNSIGNED.all;

entity multiplier is
  port(a, b: in     STD_LOGIC_VECTOR(3 downto 0);
       y:       out STD_LOGIC_VECTOR(7 downto 0));
end;

architecture synth of multiplier is
begin
  y <= a * b;
end;
```

VHDL dùng library `NUMERIC_STD_UNSIGNED` làm arithmetic/comparison trên `STD_LOGIC_VECTOR`, xem vector unsigned.

```
use IEEE.NUMERIC_STD_UNSIGNED.all;
```

VHDL cũng định nghĩa type `UNSIGNED`, `SIGNED` trong `IEEE.NUMERIC_STD`, nhưng cần type conversion ngoài phạm vi chương.

#### Ví dụ HDL 4.34 MULTIPLEXER 2:1 N-BIT PARAMETERIZED

SystemVerilog

```
module mux2
  #(parameter width = 8)
   (input     logic [width–1:0] d0, d1,
    input     logic                     s,
    output  logic [width–1:0] y);

    assign y = s ? d1 : d0;
endmodule
```

SystemVerilog cho câu `#(parameter . . .)` trước input/output định nghĩa parameter. Câu `parameter` gồm mặc định (`8`) của parameter tên `width`. Số bit input/output có thể theo parameter.

```
module mux4_8(input   logic [7:0] d0, d1, d2, d3,
              input   logic [1:0] s,
               output logic [7:0] y);

  logic [7:0] low, hi;

  mux2 lowmux(d0, d1, s[0], low);
  mux2 himux(d2, d3, s[0], hi);
  mux2 outmux(low, hi, s[1], y);
endmodule
```

Multiplexer 4:1 8-bit instantiate ba multiplexer 2:1 với độ rộng mặc định.

Ngược lại multiplexer 4:1 12-bit `mux4_12` phải override mặc định bằng `#( )` trước tên instance như sau.

```
module mux4_12(input    logic [11:0] d0, d1, d2, d3,
               input    logic [1:0]    s,
               output logic [11:0] y);

  logic [11:0] low, hi;

  mux2 #(12) lowmux(d0, d1, s[0], low);
  mux2 #(12) himux(d2, d3, s[0], hi);
  mux2 #(12) outmux(low, hi, s[1], y);
endmodule
```

Đừng nhầm `#` chỉ delay với `#(...)` định nghĩa/override parameter.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity mux2 is
  generic(width: integer := 8);
  port(d0,
   d1: in    STD_LOGIC_VECTOR(width–1 downto 0);
   s:   in    STD_LOGIC;
   y:   out STD_LOGIC_VECTOR(width–1 downto 0));
end;
architecture synth of mux2 is
begin
  y <= d1 when s else d0;
end;
```

Câu `generic` gồm mặc định (`8`) của `width`, giá trị integer.

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity mux4_8 is
  port(d0, d1, d2,
       d3: in     STD_LOGIC_VECTOR(7 downto 0);
        s:    in     STD_LOGIC_VECTOR(1 downto 0);
        y:    out STD_LOGIC_VECTOR(7 downto 0));
end;
architecture struct of mux4_8 is
  component mux2
   generic(width: integer := 8);
   port(d0,
         d1: in    STD_LOGIC_VECTOR(width-1 downto 0);
         s:    in    STD_LOGIC;
         y:    out STD_LOGIC_VECTOR(width-1 downto 0));
  end component;
  signal low, hi: STD_LOGIC_VECTOR(7 downto 0);
begin
  lowmux: mux2   port   map(d0, d1, s(0), low);
  himux:       mux2    port    map(d2,  d3,  s(0),  hi);
  outmux: mux2   port   map(low, hi, s(1), y);
end;
```

Multiplexer 4:1 8-bit `mux4_8` instantiate ba multiplexer 2:1 độ rộng mặc định.

Ngược lại multiplexer 4:1 12-bit `mux4_12` phải override mặc định bằng `generic map` như sau.

```
lowmux: mux2 generic map(12)
            port map(d0, d1, s(0), low);
himux:       mux2  generic  map(12)
            port map(d2, d3, s(0), hi);
outmux: mux2 generic map(12)
            port map(low, hi, s(1), y);
```

![fig4_29](images/ch04/fig4_29.png)

Hình 4.29 Circuit synthesize từ `mux4_12`

Ví dụ HDL 4.35 cho decoder, ứng dụng parameterized module tốt hơn nữa. Decoder N:2<sup>N</sup> lớn khó chỉ bằng `case`, nhưng dễ bằng parameterized code đặt bit output đúng thành 1. Cụ thể blocking đặt tất cả 0, rồi đổi bit đúng thành 1.

HDL cũng có `generate` tạo lượng hardware biến đổi theo parameter. `generate` hỗ trợ loop `for`, câu `if` xác định bao nhiêu loại hardware. Ví dụ HDL 4.36 dùng `generate` tạo AND N-input từ chuỗi AND two-input. Reduction operator dĩ nhiên gọn hơn nhưng ví dụ minh họa nguyên tắc hardware generator.

#### Ví dụ HDL 4.35 DECODER N:2<sup>N</sup> PARAMETERIZED

SystemVerilog

```
module decoder
  #(parameter N = 3)
   (input     logic [N–1:0]        a,
     output logic [2**N–1:0] y);

  always_comb
    begin
      y = 0;
      y[a] = 1;
   end
endmodule
```

`2**N` chỉ 2<sup>N</sup>.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
use IEEE. NUMERIC_STD_UNSIGNED.all;

entity decoder is
  generic(N: integer := 3);
  port(a: in     STD_LOGIC_VECTOR(N–1 downto 0);
       y: out STD_LOGIC_VECTOR(2**N–1 downto 0));
end;

architecture synth of decoder is
begin
  process(all)
  begin
   y <= (OTHERS => '0');
   y(TO_INTEGER(a)) <= '1';
  end process;
end;
```

`2**N` chỉ 2<sup>N</sup>.

Hãy thận trọng với câu `generate`; rất dễ vô tình tạo một lượng hardware lớn!

## 4.9 TESTBENCH

Testbench là HDL module kiểm module khác gọi device under test (DUT). Nó áp input vào DUT và lý tưởng là kiểm output đúng. Pattern input/output mong muốn gọi test vector.

> Một số tool gọi module cần kiểm là unit under test (UUT).

Xét kiểm module `sillyfunction` Mục 4.1.1 tính `y` = $\overline{\texttt{a}}$ $\overline{\texttt{b}}$ $\overline{\texttt{c}}$ + `a`$\overline{\texttt{b}}$ $\overline{\texttt{c}}$ + `a`$\overline{\texttt{b}}$`c`. Module đơn giản, có thể exhaustive testing bằng cả tám test vector.

### Ví dụ HDL 4.36 AND GATE N-INPUT PARAMETERIZED

SystemVerilog

```
module andN
  #(parameter width = 8)
   (input     logic [width–1:0] a,
    output logic                         y);

  genvar  i;
  logic [width–1:0] x;

  generate
    assign x[0] = a[0];
    for(i=1; i<width; i=i+1) begin: forloop
      assign x[i] = a[i] & x[i–1];
    end

  endgenerate

  assign y = x[width–1];
endmodule
```

Câu `for` lặp `i` = 1, 2, …, `width–1` tạo nhiều AND liên tiếp. Sau `begin` trong loop `generate` `for` phải có `a` : và nhãn tùy ý (ở đây `forloop`).

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity andN is
  generic(width: integer := 8);
  port(a: in    STD_LOGIC_VECTOR(width–1 downto 0);
       y: out STD_LOGIC);
end;
architecture synth of andN is
  signal x: STD_LOGIC_VECTOR(width–1 downto 0);
begin
  x(0) <= a(0);
  gen: for i in 1 to width-1 generate
    x(i) <= a(i) and x(i-1);
  end generate;
  y <= x(width–1);
end;
```

Không cần khai báo generate loop variable `i`.

![fig4_30](images/ch04/fig4_30.png)

Hình 4.30 Circuit synthesize từ `andN`

Ví dụ HDL 4.37 minh họa testbench đơn giản. Nó instantiate DUT rồi áp input. Blocking assignment và delay được dùng để áp input đúng thứ tự. Người dùng phải xem kết quả simulation và tự kiểm tra output đúng. Testbench được mô phỏng như HDL module khác, nhưng không synthesize được.

Kiểm tra output đúng rất tẻ nhạt và error-prone. Hơn nữa, xác định output đúng dễ hơn nhiều khi còn nhớ rõ thiết kế. Nếu sửa nhỏ và phải kiểm lại vài tuần sau, xác định output đúng trở nên phiền phức. Cách tốt hơn nhiều là viết self-checking testbench như Ví dụ HDL 4.38.

Viết code cho từng test vector cũng tẻ nhạt, nhất là module cần nhiều vector. Cách còn tốt hơn là đặt test vector trong file riêng. Testbench chỉ đọc từ file, áp input test vector lên DUT, đợi, kiểm output DUT khớp output vector và lặp tới cuối file.

#### Ví dụ HDL 4.37 TESTBENCH

SystemVerilog

```
module testbench1();
 logic a, b, c, y;

 // instantiate device under test
 sillyfunction dut(a, b, c, y);

 // apply inputs one at a time
 initial begin
   a = 0; b = 0; c = 0; #10;
   c = 1;                     #10;
   b = 1; c = 0;            #10;
   c = 1;                     #10;
   a = 1; b = 0; c = 0; #10;
   c = 1;                     #10;
   b = 1; c = 0;            #10;
   c = 1;                     #10;
 end
endmodule
```

Câu `initial` chạy body khi simulation bắt đầu. Ở đây áp 000 rồi đợi 10 time unit; áp 001 đợi thêm 10, tiếp tới đủ tám input. Chỉ nên dùng `initial` trong testbench simulation, không module cần synthesize hardware thực. Hardware không thể kỳ diệu chạy chuỗi bước đặc biệt lúc bật.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity testbench1 is –– no inputs or outputs
end;
architecture sim of testbench1 is
  component sillyfunction
     port(a, b, c: in   STD_LOGIC;
          y:          out STD_LOGIC);
  end component;
  signal a, b, c, y: STD_LOGIC;
begin
  –– instantiate device under test
  dut: sillyfunction port map(a, b, c, y);
  –– apply inputs one at a time
  process begin
    a <= '0'; b <= '0'; c <= '0'; wait for 10 ns;
    c <= '1';                                wait for 10 ns;
    b <= '1'; c <= '0';                 wait for 10 ns;
    c <= '1';                                  wait for 10 ns;
    a <= '1'; b <= '0'; c <= '0'; wait for 10 ns;
    c <= '1';                               wait for 10 ns;
    b <= '1'; c <= '0';                 wait for 10 ns;
    c <= '1';                              wait for 10 ns;
    wait;  –– wait  forever
  end process;
```

```
end;
```

`process` đầu áp pattern 000 đợi 10 ns, rồi 001 đợi thêm 10 ns, tiếp tới đủ tám input.

Cuối cùng process đợi vô hạn, nếu không sẽ bắt đầu lại và lặp pattern test vector.

Ví dụ HDL 4.39 minh họa testbench đó. Nó tạo clock bằng `always/process` không sensitivity list để evaluate liên tục. Đầu simulation đọc vector từ text file và pulse `reset` hai cycle. Dù clock/reset không cần cho combinational, vẫn có vì quan trọng với sequential DUT. `example.txt` là file test vector, input và output kỳ vọng binary:

#### Ví dụ HDL 4.38 SELF-CHECKING TESTBENCH

SystemVerilog

```
module testbench2();
  logic a, b, c, y;

  // instantiate device under test
  sillyfunction dut(a, b, c, y);

  // apply inputs one at a time
  // checking results
  initial begin
   a = 0; b = 0; c = 0; #10;
   assert (y = = = 1) else $error("000 failed.");
   c = 1;     #10;
   assert (y = = = 0) else $error("001 failed.");
   b = 1; c = 0;   #10;
   assert (y = = = 0) else $error("010 failed.");
   c = 1;      #10;
   assert (y = = = 0) else $error("011 failed.");
   a = 1; b = 0; c = 0; #10;
   assert (y = = = 1) else $error("100 failed.");
   c = 1;      #10;
   assert (y = = = 1) else $error("101 failed.");
   b = 1; c = 0;      #10;
   assert (y = = = 0) else $error("110 failed.");
   c = 1;     #10;
   assert (y = = = 0) else $error("111 failed.");
  end
endmodule
```

Câu `assert` SystemVerilog kiểm condition true không. Nếu không, chạy `else`. System task `$error` trong `else` in thông báo assertion failure. Synthesis bỏ qua `assert`.

SystemVerilog so `==` hoặc `!=` hiệu quả giữa signal không có `x`, `z`. Testbench dùng `== =`, `!= =` lần lượt so bằng/khác vì đúng với operand có thể `x`, `z`.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity testbench2 is –– no inputs or outputs
end;
architecture sim of testbench2 is
  component sillyfunction
   port(a, b, c: in     STD_LOGIC;
        y:            out STD_LOGIC);
  end component;
  signal a, b, c, y: STD_LOGIC;
begin
  –– instantiate device under test
  dut: sillyfunction port map(a, b, c, y);
  –– apply inputs one at a time
  –– checking results
  process begin
   a <= '0'; b <= '0'; c <= '0'; wait for 10 ns;
     assert y = '1' report "000  failed.";
   c <= '1';                               wait for 10 ns;
     assert y = '0' report "001  failed.";
   b <= '1'; c <= '0';                 wait for 10 ns;
     assert y = '0' report "010  failed.";
   c <= '1';                               wait for 10 ns;
     assert y = '0' report "011  failed.";
   a <= '1'; b <= '0'; c <= '0'; wait for 10 ns;
     assert y = '1' report "100 failed.";
   c <= '1';                               wait for 10 ns;
     assert y = '1' report "101 failed.";
   b <= '1'; c <= '0';                 wait for 10 ns;
     assert y = '0' report "110  failed.";
   c <= '1';                               wait for 10 ns;
     assert y = '0' report "111  failed.";
   wait; ––   wait forever
 end process;
end;
```

Câu `assert` kiểm condition, in message trong `report` nếu không thỏa. `assert` chỉ có ý nghĩa simulation, không synthesis.

```
000_1
001_0
010_0
011_0
100_1
101_1
110_0
111_0
```

Input mới áp tại rising edge, output kiểm tại falling edge. Error báo ngay khi xảy ra. Cuối simulation in tổng test vector đã áp và số lỗi.

Testbench Ví dụ 4.39 quá mức cho circuit đơn giản này. Nhưng dễ đổi kiểm circuit phức tạp: sửa `example.txt`, instantiate DUT mới, đổi vài dòng đặt input/kiểm output.

## 4.10 TÓM TẮT

Hardware description language (HDL) là công cụ cực kỳ quan trọng của digital designer hiện đại. Khi học SystemVerilog hoặc VHDL, bạn chỉ định digital system nhanh hơn nhiều so với vẽ toàn bộ schematic. Debug cycle thường nhanh hơn vì chỉ cần sửa code thay nối lại schematic tẻ nhạt. Tuy nhiên, debug cycle bằng HDL có thể dài hơn nhiều nếu không hình dung rõ hardware mà code ngụ ý.

### Ví dụ HDL 4.39 TESTBENCH VỚI TEST VECTOR FILE

SystemVerilog

```
module testbench3();
  logic              clk,  reset;
  logic              a, b, c, y, yexpected;
  logic [31:0]    vectornum, errors;
  logic [3:0]       testvectors[10000:0];

  // instantiate device under test
  sillyfunction dut(a, b, c, y);

  // generate clock
  always
   begin
     clk = 1; #5; clk = 0; #5;
   end

  // at start of test, load vectors
  // and pulse reset
  initial
   begin
     $readmemb("example.txt", testvectors);
     vectornum = 0; errors = 0;
     reset = 1; #22; reset = 0;
   end

  // apply test vectors on rising edge of clk
  always @(posedge clk)
   begin
     #1; {a, b, c, yexpected} = testvectors[vectornum];
   end

  // check results on falling edge of clk
  always @(negedge clk)
    if (~reset) begin // skip during reset
     if (y ! = = yexpected) begin // check result
        $display("Error: inputs = %b", {a, b, c});
        $display(" outputs = %b (%b expected)", y, yexpected);
        errors = errors + 1;
     end
     vectornum = vectornum + 1;
     if (testvectors[vectornum] = = = 4'bx) begin
       $display("%d tests completed with %d errors",
                vectornum, errors);
       $stop;
     end
    end
endmodule
```

`$readmemb` đọc file binary vào array `testvectors`. `$readmemh` tương tự nhưng đọc hexadecimal.

Khối code tiếp đợi một time unit sau rising edge (tránh nhầm clock/data cùng đổi), rồi đặt ba input và output kỳ vọng theo bốn bit test vector hiện tại.

Testbench so output tạo ra `y` với kỳ vọng `yexpected`, in error nếu không khớp. `%b`, `%d` chỉ in binary, decimal. `$display` là system task in cửa sổ simulator. Ví dụ `$display ("%b %b",` `y, yexpected);` in hai giá trị `y`, `yexpected` binary. `%h` in hexadecimal.

Lặp đến khi hết vector hợp lệ trong array `testvectors`. `$stop` dừng simulation.

Dù module hỗ trợ đến 10,001 test vector, sẽ dừng sau tám vector trong file.

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
use IEEE.STD_LOGIC_TEXTIO.ALL; use STD.TEXTIO.all;

entity testbench3 is –– no inputs or outputs
end;

architecture sim of testbench3 is
  component sillyfunction
    port(a, b, c: in   STD_LOGIC;
         y:          out STD_LOGIC);
  end component;
  signal a, b, c, y:     STD_LOGIC;
  signal y_expected: STD_LOGIC;
  signal clk, reset:   STD_LOGIC;
begin
 –– instantiate device under test
 dut: sillyfunction port map(a, b, c, y);

 –– generate clock
 process begin
   clk <= '1'; wait for 5 ns;
   clk <= '0'; wait for 5 ns;
 end process;

 –– at start of test, pulse reset
 process begin
   reset <= '1'; wait for 27 ns; reset <= '0';
   wait;
 end process;

 –– run tests
 process is
   file tv: text;
   variable L: line;
   variable vector_in: std_logic_vector(2 downto 0);
   variable dummy: character;
   variable vector_out: std_logic;
   variable vectornum: integer := 0;
   variable errors: integer := 0;
 begin
   FILE_OPEN(tv, "example.txt", READ_MODE);
   while not endfile(tv) loop

     –– change vectors on rising edge
     wait until rising_edge(clk);

     –– read the next line of testvectors and split into pieces
     readline(tv, L);
     read(L, vector_in);
       read(L, dummy); –– skip over underscore
    read(L, vector_out);
    (a, b, c) <= vector_in(2 downto 0) after 1 ns;
    y_expected <= vector_out after 1 ns;

    -- check results on falling edge
    wait until falling_edge(clk);

    if y /= y_expected then
      report "Error: y = " & std_logic'image(y);
      errors := errors + 1;
    end if;

    vectornum := vectornum + 1;
  end loop;

  -- summarize results at end of simulation
  if (errors = 0) then
    report "NO ERRORS -- " &
          integer'image(vectornum) &
          " tests completed successfully."
          severity failure;
  else
    report integer'image(vectornum) &
          " tests completed, errors = " &
          integer'image(errors)
          severity failure;
  end if;
 end process;
end;
```

Code VHDL dùng lệnh đọc file ngoài phạm vi chương nhưng cho hình dung self-checking testbench.

HDL được dùng cho cả simulation và synthesis. Logic simulation là cách mạnh mẽ kiểm thử hệ thống trên máy tính trước khi chuyển thành hardware. Simulator cho kiểm giá trị signal nội bộ có thể không đo được trên hardware vật lý. Logic synthesis chuyển HDL code thành digital logic circuit.

Điều quan trọng nhất khi viết HDL code là bạn đang mô tả hardware thực, không viết chương trình máy tính. Lỗi người mới phổ biến nhất là viết code mà không nghĩ hardware định tạo. Nếu không biết hardware mình ngụ ý, gần như chắc chắn không nhận được điều mong muốn. Hãy bắt đầu bằng block diagram hệ thống, xác định phần combinational logic, phần sequential circuit hoặc finite state machine, v.v. Sau đó viết HDL từng phần, dùng idiom đúng để ngụ ý loại hardware cần.

## Bài tập

Bài sau có thể làm bằng HDL ưa thích. Nếu có simulator, kiểm thiết kế, in waveform và giải thích chứng minh hoạt động. Nếu có synthesizer, synthesize code, in circuit diagram và giải thích vì sao đúng kỳ vọng.

Bài tập 4.1 Phác schematic circuit mô tả bởi HDL sau. Đơn giản hóa để có ít gate nhất.

Bài tập 4.2 Phác schematic circuit mô tả bởi HDL sau. Đơn giản hóa để có ít gate nhất.

SystemVerilog

```
module exercise1(input    logic a, b, c,
                 output logic y, z);

  assign y = a & b & c | a & b & ~c | a & ~b & c;
  assign z = a & b | ~a & ~b;
endmodule
```

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity exercise1 is
  port(a, b, c: in    STD_LOGIC;
       y, z:      out   STD_LOGIC);
end;
architecture synth of exercise1 is
begin
  y <= (a and b and c) or (a and b and not c) or
      (a and not b and c);
  z <= (a and b) or (not a and not b);
end;
```

Bài tập 4.3 Viết HDL module tính XOR four-input. Input `a`<sub>`3:0`</sub>, output `y`.

Bài tập 4.4 Viết self-checking testbench cho Bài 4.3. Tạo file chứa đủ 16 test case. Mô phỏng chứng minh đúng. Thêm lỗi vào file, cho thấy testbench báo mismatch.

SystemVerilog

```
module exercise2(input    logic [3:0] a,
                 output logic [1:0] y);
  always_comb
   if          (a[0]) y = 2'b11;
   else if (a[1]) y = 2'b10;
   else if (a[2]) y = 2'b01;
   else if (a[3]) y = 2'b00;
   else                  y = a[1:0];
endmodule
```

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity exercise2 is
  port(a: in    STD_LOGIC_VECTOR(3 downto 0);
       y: out STD_LOGIC_VECTOR(1 downto 0));
end;
architecture synth of exercise2 is
begin
  process(all)  begin
   if        a(0) then y <= "11";
   elsif   a(1)  then  y  <=  "10";
   elsif   a(2)  then  y  <=  "01";
   elsif   a(3)  then  y  <=  "00";
   else                    y <=  a(1 downto 0);
   end  if;
  end  process;
end;
```

Bài tập 4.5 Viết module `minority`, ba input `a`, `b`, `c`, một output `y` TRUE nếu ít nhất hai input FALSE.

Bài tập 4.6 Viết module decoder hexadecimal seven-segment display, xử lý A, B, C, D, E, F và 0–9.

Bài tập 4.7 Viết self-checking testbench cho Bài 4.6. File chứa đủ 16 case. Mô phỏng chứng minh đúng, thêm lỗi vào file và cho thấy báo mismatch.

Bài tập 4.8 Viết module multiplexer 8:1 tên `mux8`, input `s`<sub>`2:0`</sub>, `d0`, `d1`, `d2`, `d3`, `d4`, `d5`, `d6`, `d7`, output `y`.

Bài tập 4.9 Viết structural module tính `y` = `a`$\overline{\texttt{b}}$ + $\overline{\texttt{b}}$$\overline{\texttt{c}}$ + $\overline{\texttt{a}}$`bc` bằng multiplexer logic. Dùng multiplexer 8:1 Bài 4.8.

Bài tập 4.10 Làm lại Bài 4.9 bằng multiplexer 4:1 và số NOT gate tùy cần.

Bài tập 4.11 Mục 4.5.4 nói synchronizer mô tả đúng bằng blocking nếu đúng thứ tự. Nghĩ một sequential circuit đơn giản không thể mô tả đúng bằng blocking bất kể thứ tự.

Bài tập 4.12 Viết module priority circuit eight-input.

Bài tập 4.13 Viết module decoder 2:4.

Bài tập 4.14 Viết module decoder 6:64 bằng ba instance decoder 2:4 Bài 4.13 và một nhóm AND gate three-input.

Bài tập 4.15 Viết module triển khai Boolean equation Bài 2.13.

Bài tập 4.16 Viết module triển khai circuit Bài 2.26.

Bài tập 4.17 Viết module triển khai circuit Bài 2.27.

Bài tập 4.18 Viết module triển khai logic function Bài 2.28. Chú ý kỹ cách xử lý don’t care.

Bài tập 4.19 Viết module triển khai function Bài 2.35.

Bài tập 4.20 Viết module triển khai priority encoder Bài 2.36.

Bài tập 4.21 Viết module triển khai priority encoder sửa đổi Bài 2.37.

Bài tập 4.22 Viết module triển khai converter binary-to-thermometer Bài 2.38.

Bài tập 4.23 Viết module triển khai function days-in-month Câu hỏi 2.2.

Bài tập 4.24 Phác state transition diagram cho FSM trong HDL sau.

SystemVerilog

```
module fsm2(input    logic clk, reset,
            input    logic a, b,
            output logic y);

 logic [1:0] state, nextstate;

 parameter  S0 =  2'b00;
 parameter  S1 =  2'b01;
 parameter  S2 =  2'b10;
 parameter  S3 =  2'b11;

 always_ff @(posedge clk, posedge reset)
   if (reset) state <= S0;
   else           state <= nextstate;

 always_comb
   case (state)
    S0: if (a ^ b) nextstate = S1;
       else           nextstate = S0;
    S1: if (a & b) nextstate = S2;
       else           nextstate = S0;
    S2: if (a | b) nextstate = S3;
       else           nextstate = S0;
    S3: if (a | b) nextstate = S3;
       else           nextstate = S0;
   endcase

 assign y = (state = = S1) | (state = = S2);
endmodule
```

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164.all;
entity fsm2 is
  port(clk, reset: in    STD_LOGIC;
       a, b:             in    STD_LOGIC;
       y:                out STD_LOGIC);
end;
architecture synth of fsm2 is
  type statetype is (S0, S1, S2, S3);
  signal state, nextstate: statetype;
begin
  process(clk, reset) begin
   if reset then state <= S0;
   elsif rising_edge(clk) then
     state <= nextstate;
   end if;
  end process;
  process(all) begin
   case state is
    when S0 => if (a xor b) then
                  nextstate <= S1;
              else nextstate <= S0;
              end if;
    when S1 => if (a and b) then
                  nextstate <= S2;
              else nextstate <= S0;
              end if;
    when S2 => if (a or b) then
                  nextstate <= S3;
              else nextstate <= S0;
              end if;
    when S3 => if (a or b) then
                  nextstate <= S3;
              else nextstate <= S0;
              end if;
   end case;
  end process;
  y <= '1' when((state = S1) or (state = S2))
      else '0';
end;
```

Bài tập 4.25 Phác state transition diagram cho FSM trong HDL sau. FSM kiểu này dùng trong branch predictor của một số microprocessor.

SystemVerilog

```
module fsm1(input    logic clk, reset,
            input    logic taken, back,
            output logic predicttaken);

 logic [4:0] state, nextstate;

 parameter  S0 = 5'b00001;
 parameter   S1 = 5'b00010;
 parameter  S2 = 5'b00100;
 parameter  S3 = 5'b01000;
 parameter  S4 = 5'b10000;

 always_ff @(posedge clk, posedge reset)
   if (reset) state <= S2;
   else           state <= nextstate;

 always_comb
   case (state)
    S0:  if (taken) nextstate = S1;
         else           nextstate = S0;
    S1: if (taken)  nextstate = S2;
         else          nextstate = S0;
    S2: if (taken)  nextstate = S3;
         else          nextstate = S1;
    S3: if (taken)  nextstate = S4;
         else          nextstate = S2;
    S4: if (taken)  nextstate = S4;
         else          nextstate = S3;
    default:            nextstate = S2;
   endcase

 assign predicttaken = (state  = = S4) |
                      (state  = = S3) |
                      (state  = = S2 & back);
endmodule
```

VHDL

```
library IEEE; use IEEE.STD_LOGIC_1164. all;
entity fsm1 is
  port(clk, reset:       in     STD_LOGIC;
       taken, back:     in     STD_LOGIC;
       predicttaken: out STD_LOGIC);
end;
architecture synth of fsm1 is
  type statetype is (S0, S1, S2, S3, S4);
  signal state, nextstate: statetype;
begin
  process(clk, reset) begin
   if reset then state <= S2;
   elsif rising_edge(clk) then
     state <= nextstate;
   end if;
  end process;
process(all) begin
   case state is
     when S0 => if taken then
                   nextstate <= S1;
               else nextstate <= S0;
               end if;
     when S1 => if taken then
                   nextstate <= S2;
               else nextstate <= S0;
               end if;
     when S2 => if taken then
                   nextstate <= S3;
               else nextstate <= S1;
               end if;
     when S3 => if taken then
                   nextstate <= S4;
               else nextstate <= S2;
               end if;
     when S4 => if taken then
                   nextstate <= S4;
               else nextstate <= S3;
               end if;
     when others =>    nextstate <= S2;
   end case;
  end process;
  –– output logic
  predicttaken <= '1' when
                ((state = S4) or (state = S3) or
                (state = S2 and back = '1'))
  else '0';
end;
```

Bài tập 4.26 Viết module cho SR latch.

Bài tập 4.27 Viết module JK flip-flop, input clk, J, K, output Q. Rising edge giữ Q cũ nếu J = K = 0; đặt Q = 1 nếu J = 1, reset Q = 0 nếu K = 1, đảo Q nếu J = K = 1.

Bài tập 4.28 Viết module latch Hình 3.18. Một assignment mỗi gate. Delay mỗi gate 1 unit hoặc 1 ns. Simulation chứng minh đúng. Rồi tăng delay inverter. Delay dài bao nhiêu thì race condition gây latch sai?

Bài tập 4.29 Viết module traffic light controller Mục 3.4.1.

Bài tập 4.30 Viết ba module cho traffic light controller chế độ diễu hành đã phân rã ở Ví dụ 3.8. Tên `controller`, `mode`, `lights`, input/output như Hình 3.33(b).

Bài tập 4.31 Viết module mô tả circuit Hình 3.42.

Bài tập 4.32 Viết module FSM có state transition Hình 3.69 Bài 3.22.

Bài tập 4.33 Viết module FSM có state transition Hình 3.70 Bài 3.23.

Bài tập 4.34 Viết module traffic light controller cải tiến Bài 3.24.

Bài tập 4.35 Viết module ốc sên con Bài 3.25.

Bài tập 4.36 Viết module máy bán soda Bài 3.26.

Bài tập 4.37 Viết module Gray code counter Bài 3.27.

Bài tập 4.38 Viết module UP/DOWN Gray code counter Bài 3.28.

Bài tập 4.39 Viết module FSM Bài 3.29.

Bài tập 4.40 Viết module FSM Bài 3.30.

Bài tập 4.41 Viết module serial two’s complementer Câu hỏi 3.2.

Bài tập 4.42 Viết module circuit Bài 3.31.

Bài tập 4.43 Viết module circuit Bài 3.32.

Bài tập 4.44 Viết module circuit Bài 3.33.

Bài tập 4.45 Viết module circuit Bài 3.34. Có thể dùng full adder Mục 4.2.5.

### Bài tập SystemVerilog

Các bài sau riêng cho SystemVerilog.

Bài tập 4.46 Khai báo signal `tri` trong SystemVerilog nghĩa là gì?

Bài tập 4.47 Viết lại module `syncbad` Ví dụ 4.29. Dùng nonblocking nhưng sửa code để có synchronizer đúng với hai flip-flop.

Bài tập 4.48 Xét hai module SystemVerilog sau. Function giống nhau không? Phác hardware từng cái ngụ ý.

```
module code1(input  logic clk, a, b, c,
             output logic y);
  logic x;
  always_ff @(posedge clk) begin
    x <= a & b;
    y <= x | c;
  end
endmodule

module code2(input  logic a, b, c, clk,
             output logic y);

  logic x;

  always_ff @(posedge clk) begin
    y <= x | c;
    x <= a & b;
  end
endmodule
```

Bài tập 4.49 Làm lại Bài 4.48 nếu thay \<= bằng = ở mọi assignment.

Bài tập 4.50 Các module sau chứa lỗi tác giả từng thấy sinh viên mắc trong lab. Giải thích và sửa từng lỗi.

(a)

```
module latch(input logic        clk,
             input logic [3:0] d,
             output reg  [3:0] q);
  always  @(clk)
    if (clk) q <= d;
endmodule
```

(b)

```
module gates(input  logic [3:0] a, b,
             output logic [3:0] y1, y2, y3, y4, y5);
  always  @(a)
    begin
     y1 = a & b;
     y2 = a | b;
     y3 = a ^ b;
     y4 = ~(a & b);
     y5 = ~(a | b);
    end
endmodule
```

(c)

```
module mux2(input  logic [3:0] d0, d1,
            input  logic        s,
            output logic [3:0] y);
   always @(posedge s)
    if (s) y <= d1;
    else   y <= d0;
endmodule
```

(d)

```
module twoflops(input  logic clk,
                input  logic d0, d1,
                output logic q0, q1);
   always @(posedge clk)
     q1 = d1;
     q0 = d0;
 endmodule
```

(e)

```
module FSM(input  logic clk,
           input    logic  a,
           output logic out1, out2);

    logic  state;

    // next state logic and register (sequential)
    always_ff @(posedge clk)
     if  (state  = =  0)  begin
         if (a)  state  <= 1;
     end else begin
         if (~a) state <= 0;
     end
    always_comb // output logic (combinational)
     if (state = = 0) out1 = 1;
     else             out2 = 1;
endmodule
```

(f)

```
module priority(input   logic [3:0] a,
                output logic [3:0] y);

   always_comb
     if       (a[3]) y = 4'b1000;
     else if (a[2]) y = 4'b0100;
     else if (a[1]) y = 4'b0010;
     else if (a[0]) y = 4'b0001;
endmodule
```

(g)

```
module divideby3FSM(input  logic clk,
                    input     logic  reset,
                    output logic  out);

   logic [1:0] state, nextstate;

   parameter S0  = 2'b00;
   parameter S1  = 2'b01;
   parameter S2  =  2'b10;

   // state register
   always_ff @(posedge clk, posedge reset)
     if (reset) state <= S0;
     else           state <= nextstate;

   // next state logic
   always  @(state)
     case  (state)
       S0: nextstate =  S1;
       S1: nextstate =  S2;
       S2: nextstate =  S0;
     endcase

   // output logic
   assign out = (state = = S2);
endmodule
```

(h)

```
module mux2tri(input   logic [3:0] d0, d1,
               input   logic             s,
               output tri      [3:0] y);
   tristate t0(d0, s, y);
   tristate t1(d1, s, y);
endmodule
```

(i)

```
module floprsen(input  logic      clk,
                input  logic          reset,
                input  logic          set,
                input  logic  [3:0]  d,
                output  logic  [3:0]  q);
   always_ff @(posedge clk, posedge reset)
     if (reset) q <= 0;
     else            q <= d;
   always  @(set)
     if (set)     q <= 1;
endmodule
```

(j)

```
module and3(input    logic   a, b, c,
            output logic y);

   logic  tmp;
   always @(a, b, c)
   begin
     tmp <= a & b;
     y    <= tmp & c;
   end
endmodule
```

### Bài tập VHDL

Các bài sau riêng cho VHDL.

Bài tập 4.51 Trong VHDL vì sao cần viết

```
q <= '1' when state = S0 else '0';
```

thay vì chỉ

```
q <= (state = S0);
```

Bài tập 4.52 Mỗi module VHDL sau chứa lỗi. Cho gọn chỉ cho architecture; giả định mệnh đề dùng `library` và declaration `entity` đúng. Giải thích lỗi và sửa.

(a)

```
architecture synth of latch is
begin
  process(clk) begin
    if clk = '1' then q <= d;
    end if;
  end process;
end;
```

(b)

```
architecture proc of gates is
begin
  process(a) begin
   Y1 <= a and b;
   y2 <= a or b;
   y3 <= a xor b;
   y4 <= a nand b;
   y5 <= a nor b;
 end process;
end;
```

(c)

```
architecture synth of flop is
begin
 process(clk)
   if rising_edge(clk) then
     q <= d;
end;
```

(d)

```
architecture synth of priority is
begin
  process(all)  begin
   if         a(3) then y <= "1000";
   elsif a(2) then y <= "0100";
   elsif  a(1) then y <= "0010";
   elsif  a(0) then y <= "0001";
   end if;
  end  process;
end;
```

(e)

```
architecture synth of divideby3FSM is
   type statetype is (S0, S1, S2);
   signal state, nextstate: statetype;
begin
  process(clk, reset) begin
     if reset then state <= S0;
     elsif rising_edge(clk) then
      state <= nextstate;
     end  if;
  end  process;

  process(state)  begin
    case state is
      when S0 => nextstate <= S1;
      when S1 => nextstate <= S2;
      when S2 => nextstate <= S0;
    end  case;
  end  process;
  q <= '1' when state = S0 else '0';
end;
```

(f)

```
 architecture struct of mux2 is
   component  tristate
     port(a:   in    STD_LOGIC_VECTOR(3 downto 0);
         en:  in      STD_LOGIC;
         y:    out STD_LOGIC_VECTOR(3 downto 0));
   end  component;

 begin
  t0: tristate port map(d0, s, y);
  t1: tristate port map(d1, s, y);
end;
```

(g)

```
architecture asynchronous of floprs is
begin
  process(clk, reset) begin
    if reset then
     q <= '0';
    elsif rising_edge(clk) then
     q <= d;
    end  if;
  end  process;

  process(set)  begin
    if set then
       q <= '1';
    end  if;
  end  process;
end;
```

## Câu hỏi phỏng vấn

Các bài sau là câu hỏi từng dùng phỏng vấn digital design.

Câu hỏi 4.1 Viết một dòng HDL gate bus 32-bit tên `data` bằng signal `sel`, tạo `result` 32-bit. Nếu `sel` TRUE, `result =` `data`; nếu không, `result` toàn 0.

Câu hỏi 4.2 Giải thích blocking và nonblocking assignment trong SystemVerilog khác nhau, cho ví dụ.

Câu hỏi 4.3 Câu SystemVerilog sau làm gì?

```
assign result = |(data[15:0] & 16'hC820);
```

[^1]: Institute of Electrical and Electronics Engineers (IEEE) là hội nghề nghiệp chịu trách nhiệm nhiều chuẩn máy tính, gồm Wi-Fi (802.11), Ethernet (802.3), floating-point (754).

[^2]: Simulation chương dùng ModelSim PE Student Edition Version 10.3c. Chọn vì dùng thương mại nhưng có bản sinh viên miễn phí dung lượng 10,000 dòng code.

[^3]: Synthesis chương dùng Synplify Premier của Synopsys. Nhưng có nhiều tool khác như trong Vivado và Quartus, công cụ Xilinx/Intel miễn phí synthesize HDL sang field programmable
