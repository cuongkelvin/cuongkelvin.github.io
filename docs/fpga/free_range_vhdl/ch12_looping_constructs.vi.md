# 12 Các looping construct

Khi các mạch bạn được yêu cầu thiết kế ngày càng phức tạp, bạn sẽ thấy mình tìm kiếm thêm chức năng và tính linh hoạt từ VHDL. Có lẽ bạn sẽ tìm thấy thứ mình cần trong các looping construct khác nhau, đây lại là một dạng statement VHDL nữa. Chương này cung cấp mô tả về một số loại looping construct và một số chi tiết về cách dùng chúng.

Có hai loại vòng lặp trong VHDL: vòng lặp for và vòng lặp while. Tên của các vòng lặp này hẳn có vẻ quen thuộc từ kinh nghiệm của bạn với các ngôn ngữ lập trình máy tính higher-level. Nói chung, bạn có thể tận dụng kinh nghiệm trước đây với các loại vòng lặp này khi mô tả hành vi của mạch số. Phần dễ chịu là vì hai loại vòng lặp này đều là sequential statement, chúng chỉ có thể xuất hiện bên trong process. Bạn cũng sẽ có thể áp dụng tư duy thuật toán và kỹ năng thiết kế mà bạn đã phát triển khi viết code bằng các ngôn ngữ máy tính higher-level cho các mạch bạn sẽ mô tả bằng VHDL. Cú pháp có khác một chút nhưng các khái niệm lập trình có cấu trúc cơ bản là như nhau.

## 12.1 Vòng lặp for và while

Mục đích của một loop construct là cho phép một số instruction code diễn ra lặp đi lặp lại (hết lần này đến lần khác). Hai loại vòng lặp này tất nhiên cùng có chức năng đó. Như bạn có lẽ còn nhớ từ việc lập trình ngôn ngữ higher-level, cú pháp của ngôn ngữ cho phép bạn dùng một trong hai loại vòng lặp trong bất kỳ tình huống nào bằng cách sửa code đôi chút. Điều tương tự cũng đúng trong VHDL. Nhưng dù bạn có thể khéo léo trong cách thiết kế code VHDL, cách tiếp cận tốt nhất là làm cho code dễ đọc và dễ hiểu. Ghi nhớ khái niệm này giúp chúng ta thấy được những khác biệt về chức năng giữa vòng lặp for và vòng lặp while. Khác biệt cơ bản này có thể được làm nổi bật rõ nhất bằng cách xem code trong Listing 12.1.

Listing 12.1: Cấu trúc cơ bản của vòng lặp for và vòng lặp while.

```vhdl
-- for loop                         |  -- while loop
my_label: for index in a_range loop |  my_label: while (condition) loop
    sequential statements...        |       sequential statements...
end loop my_label;                  |  end loop my_label;
```

Khác biệt chính giữa hai vòng lặp này nằm ở số lần lặp mà các vòng lặp sẽ thực hiện. Khác biệt này có thể được phân loại theo việc mạch sẽ kết thúc các lần lặp dưới những điều kiện nào. Nếu bạn biết số lần lặp mà vòng lặp cần, bạn nên dùng vòng lặp for. Như bạn sẽ thấy trong các ví dụ tiếp theo, vòng lặp for cho phép bạn nêu tường minh số lần lặp mà vòng lặp thực hiện.

Vòng lặp while nên được dùng khi bạn không biết số lần lặp mà vòng lặp cần thực hiện. Trong trường hợp này, vòng lặp dừng lặp khi các điều khoản nêu trong mệnh đề điều kiện không được thỏa mãn. Dùng các vòng lặp theo cách này là một thói quen lập trình tốt. Các loop label được liệt kê bằng chữ nghiêng để chỉ ra rằng chúng là tùy chọn. Luôn nên dùng các label này để làm rõ code VHDL đi kèm. Dùng loop label là một ý đặc biệt hay khi dùng các vòng lặp lồng nhau và khi áp dụng các loop control statement.

### 12.1.1 Vòng lặp for

Dạng cơ bản của vòng lặp for đã được trình bày trong Listing 12.1. Vòng lặp này dùng một dạng giá trị index nào đó để lặp qua một phạm vi các giá trị rời rạc. Có hai lựa chọn có thể áp dụng cho phạm vi các giá trị rời rạc: 1) phạm vi có thể được chỉ định trong statement vòng lặp for hoặc 2) vòng lặp có thể dùng một phạm vi đã được khai báo trước đó. Dưới đây là một ví dụ.

```vhdl
for cnt_val in 0 to 24 loop
   -- sequential_statements
end loop;
type my_range is range 0 to 24;
--
for cnt_val in my_range loop
   -- sequential_statements
end loop;
```

```vhdl
for cnt_val in 24 downto 0 loop
   -- sequential_statements
end loop;
```

```vhdl
type my_range is range 24 downto 0;
--
for cnt_val in my_range loop
   -- sequential_statements
end loop
```

Variable index dùng trong vòng lặp for có một số đặc điểm lạ được liệt kê dưới đây. Dù VHDL synthesizer của bạn sẽ có thể đánh dấu các lỗi này, bạn vẫn nên ghi nhớ chúng khi dùng vòng lặp for và bạn sẽ tiết kiệm cho mình được rất nhiều thời gian debug. Cũng lưu ý rằng phần thân vòng lặp đã được thụt lề để code dễ đọc hơn. Tăng khả năng đọc của code luôn là điều tốt.

• Variable index không cần được khai báo, thực tế việc này được thực hiện ngầm định.

• Không thể thực hiện assignment cho variable index. Tuy nhiên, variable index có thể được dùng trong các phép tính bên trong phần thân vòng lặp.

• Variable index chỉ có thể bước qua vòng lặp với bước tăng là một.

• Identifier dùng cho variable index có thể trùng với một variable hay signal khác; sẽ không xảy ra xung đột tên. Variable index thực chất sẽ che các identifier cùng tên bên trong phần thân vòng lặp. Dùng cùng một identifier cho hai giá trị khác nhau là thói quen lập trình tồi và nên tránh.

• Phạm vi được chỉ định cho index (khi được chỉ định bên ngoài phần khai báo vòng lặp) có thể thuộc bất kỳ enumerated type nào.

Và cuối cùng, như trong listing trước, vòng lặp for cũng có thể được hiện thực bằng tùy chọn downto. Tùy chọn này hợp lý hơn khi phạm vi được chỉ định trong phần khai báo vòng lặp for.

### 12.1.2 Vòng lặp while

Vòng lặp while phần nào đơn giản hơn vòng lặp for vì chúng không chứa variable index. Khác biệt chính giữa vòng lặp for và vòng lặp while là phần khai báo vòng lặp for có chứa một tiêu chí kết thúc vòng lặp built-in. Điều đầu tiên bạn nên nhớ về vòng lặp while là code đi kèm nên có cách nào đó để thoát khỏi vòng lặp. Các ví dụ về vòng lặp while được trình bày trong listing sau. Không cần phải nói, code VHDL xuất hiện trong listing tiếp theo ở bên phải lẽ ra nên được viết bằng một vòng lặp for thay vì vòng lặp while, vì số lần lặp thực ra đã biết.

```vhdl
constant max_fib : integer := 2000;
variable fib_sum : integer := 1;
variable tmp_sum : integer := 0;

while (fib_sum < max_fib) loop
   fib_sum := fib_sum + tmp_sum;
   tmp_sum := fib_sum;
end loop;
--
```

```vhdl
constant max_num : integer := 10;
variable fib_sum : integer := 1;
variable tmp_sum : integer := 0;
variable int_cnt : integer := 0;

while (int_cnt < max_num) loop
   fib_sum := fib_sum + tmp_sum;
   tmp_sum := fib_sum;
   int_cnt := int_cnt + 1;
end loop;
```

### 12.1.3 Loop control: statement next và exit

Tương tự các ngôn ngữ máy tính higher-level, VHDL cung cấp một số tùy chọn loop control bổ sung. Các tùy chọn này gồm statement next và statement exit. Các statement này giống với các statement tương ứng trong ngôn ngữ higher-level ở khả năng điều khiển vòng lặp. Hai loop-control construct này có thể được dùng trong cả vòng lặp for lẫn vòng lặp while.

#### Statement next

Statement next cho phép vòng lặp bỏ qua các statement còn lại trong phần thân vòng lặp và bắt đầu ngay lần lặp tiếp theo. Trong vòng lặp for, variable index được tự động tăng trước khi bắt đầu lần lặp sắp tới. Trong vòng lặp while, người lập trình phải tự bảo đảm vòng lặp hoạt động đúng khi dùng statement next. Có hai dạng statement next và cả hai dạng đều được trình bày trong listing tiếp theo. Đây là hai ví dụ dùng statement next và không nhất thiết thể hiện một thói quen lập trình tốt, cũng không thực sự chứa code có ý nghĩa.

```vhdl
variable my_sum : integer := 0;
--
for cnt_val in 0 to 50 loop
   if (my_sum = 20) then
      next;
   end if;
   my_sum := my_sum + 1;
end loop;
```

```vhdl
variable my_sum : integer := 0;
--
while (my_sum < 300) loop
   next when (my_sum = 20);
   my_sum := my_sum + 1;
end loop;
--

-- Required signals:
--
    --------------------------------------------------------------

-- SEL:        in  std_logic_vector
    (1 downto 0);
-- A, B, C, D: in  std_logic;
-- MUX_OUT:    out std_logic;
--
    --------------------------------------------------------------

process (SEL, A, B, C, D)
begin
   case SEL is
      when "00" => MUX_OUT <= A;
      when "01" => MUX_OUT <= B;
      when "10" => MUX_OUT <= C;
      when "11" => MUX_OUT <= D;
      when others => MUX_OUT <= (
          others => '0');
   end case;
end process;
```

*(ghi chú: sách in nguyên như vậy — listing ví dụ `next` kèm theo một đoạn mã MUX (`-- Required signals:` … `end process;`) không liên quan tới ví dụ; giữ nguyên như sách)*

#### Statement exit

Statement exit cho phép kết thúc ngay vòng lặp và có thể được dùng trong cả vòng lặp for lẫn vòng lặp while. Khi gặp statement exit trong luồng code, quyền điều khiển được trả về cho statement đứng sau statement end loop gắn với vòng lặp đó. Statement exit cũng hoạt động trong các vòng lặp lồng nhau. Hai dạng của statement exit giống với hai dạng của statement next. Các ví dụ về những dạng này được cung cấp trong listing tiếp theo.

```vhdl
variable my_sum : integer := 0;
--
for cnt_val in 0 to 50 loop
   if (my_sum = 20) then
      exit;
   end if;
   my_sum := my_sum + 1;
end loop;
```

```vhdl
variable my_sum : integer := 0;
--
while (my_sum < 300) loop
   exit when (my_sum = 20);
   my_sum := my_sum + 1;
end loop;
--
--
```
