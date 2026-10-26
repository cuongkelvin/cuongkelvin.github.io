# B Các package VHDL chuẩn

Sau nhiều năm được Bộ Quốc phòng Mỹ phát triển, vào tháng Hai năm 1986 toàn bộ quyền đối với VHDL đã được chuyển giao cho Institute of Electrical and Electronics Engineers (IEEE), tổ chức từ đó đến nay tiếp tục quá trình chuẩn hóa ngôn ngữ này.

Sau một số bước chuẩn hóa ngôn ngữ diễn ra vào các năm 1987, 1993, 2000, 2002 và 2008, VHDL giờ đây bao gồm một tập lớn các package mà, một khi được include vào code của bạn, sẽ cho bạn khả năng dùng nhiều hằng số toán học, function số học, overloaded operator, function chuyển đổi kiểu, các kiểu signal mở rộng và nhiều thứ khác nữa.

Các package thư viện chính của ngôn ngữ VHDL mà có lẽ bạn sẽ cần dùng trong sự nghiệp kỹ sư của mình có thể được include vào code thông qua các statement sau:

```vhdl
library IEEE;
-- essential IEEE libraries
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;

-- more IEEE libraries
use IEEE.numeric_signed.all;
use IEEE.numeric_unsigned.all;

use IEEE.numeric_bit.all;
use IEEE.math_real.all;
use IEEE.math_complex.all;
```

Ví dụ, việc include package std_logic_1164 vào code của bạn sẽ cho bạn khả năng dùng nhiều data type như std_logic hoặc std_logic_vector. Listing sau trình bày một ví dụ code đơn giản về một số trong rất nhiều lợi ích của việc dùng các thư viện này.

Listing B.1: Ví dụ về các operator và kiểu có sẵn khi dùng một số package IEEE.

```vhdl
-- typical packages declaration
library IEEE;
use ieee.std_logic_1164.all ;
use ieee.numeric_std.all ;

-- entity
entity my_blk is
    port (  IN1, IN2  : in  std_logic;
            CLK, CLR  : in  std_logic;
            OUT1      : out std_logic);
end my_blk;

-- architecture
architecture arch of my_blk is
signal A,B: unsigned(7 downto 0);--note how for internal signals the
signal Y1 : unsigned(7 downto 0);--unsigned and integer types replaced
signal Y2 : unsigned(8 downto 0);--the simpler std_logic_vector
signal X  : integer range 0 to 255;

begin
   sync_proc: process(CLK,CLR)
   begin
     if CLR = '1' then
        OUT1 <= '0';
     elsif rising_edge(CLK) then --std_logic_1164 gives rising_edge()
       Y1 <= A + B + unsigned("0" & IN1);--numeric_std defines addition
                                         --for unsigned types.

       Y2<= resize(A, Y2'length) + B + ("0" & IN1);

       X <= to_integer(A); --numeric_std gives to_integer()

        OUT1 <= IN1 AND IN2;
     end if;
   end process sync_proc;
end arch;
```

Như đã thấy rõ từ listing trước, việc include các thư viện chuẩn chính cho phép bạn viết code VHDL rất mạnh. Một cheat-sheet khá hữu ích về các thư viện chuẩn VHDL và những gì chúng có thể mang lại có thể được tìm thấy trong Phụ lục D.

Các thư viện được IEEE chuẩn hóa nâng cao đáng kể khả năng của ngôn ngữ VHDL, mang lại cho bạn một danh sách dài các function mà bạn có thể tự do dùng trong source code VHDL của mình. Danh sách các thư viện này không thể được đưa vào đây vì lý do bản quyền, nhưng toàn bộ source code của các thư viện IEEE đều có sẵn miễn phí cho bạn tại link sau:

```
http://standards.ieee.org/downloads/1076/1076.2-1996/
```

Ngoài ra, cũng có thể duyệt và tải xuống các thư viện VHDL đó từ website GHDL:

```
http://ghdl.free.fr
```

Cuối cùng, công cụ phát triển phần mềm (ví dụ Xilinx Vivado) mà bạn dùng để synthesis code VHDL của mình cũng sẽ bao gồm các thư viện này. Chỉ cần xem nhanh source code là bạn sẽ có ý niệm khá rõ về những gì mình có thể dùng và cách dùng chúng. Ví dụ, xem nhanh thư viện math_real.vhdl, có tại:

```
http://standards.ieee.org
```

sẽ cho bạn thấy rằng hằng số kiểu real MATH_PI = 3.1415926 có sẵn để dùng ngay khi bạn include dòng use IEEE.math_real.all;. Function căn bậc hai SQRT() chỉ là một ví dụ khác.

## B.1 Các thư viện chuẩn IEEE

Trong VHDL, các phép toán số học cơ bản được định nghĩa cho data type integer và data type natural. Để có nhiều quyền kiểm soát hơn trong quá trình synthesis đối với các định dạng dữ liệu khác nhau, các thư viện khác đã được phát triển và đưa vào chuẩn IEEE.

Thư viện numeric_std mở rộng VHDL chuẩn bằng cách thêm các data type signed và unsigned cùng với các phép toán số học cho chúng. Các thư viện này là các package chuẩn IEEE và hành vi của chúng được quy định bởi chuẩn, nhờ đó bảo đảm tính tương thích. Trong cuốn sách này, chúng tôi đặc biệt khuyến nghị dùng thư viện numeric_std thay vì thư viện std_logic_arith của Synopsys.

Như một hệ quả tự nhiên, chúng tôi khuyến nghị dùng các kiểu unsigned, signed và integer thay vì kiểu std_logic_vector đơn giản hơn cho nhiều nhu cầu mà bạn có thể gặp. Hãy xem Listing B.1 để có en example *(ghi chú: sách in "en example"; đúng là "an example")* về cách dùng khôn ngoan kiểu unsigned hoặc kiểu integer thay vì kiểu std_logic_vector.

## B.2 Các thư viện Non-standard

Nếu bạn thường dùng google cho mục đích học tập, bạn sẽ sớm phát hiện ra rằng việc dùng thư viện non-standard:

```
library ieee;
ieee.std_logic_arith.all;
```

là phổ biến một cách đáng ngạc nhiên trong giới lập trình viên VHDL.

Thư viện std_logic_arith, cũng như các thư viện std_logic_unsigned và std_logic_signed, được Synopsys viết và đóng gói để cung cấp các chức năng lập trình VHDL mở rộng. Dùng các thư viện này giúp loại bỏ nhu cầu chuyển đổi dữ liệu và, chẳng hạn, cho phép bạn viết:

```
a_logic_vector <= a_logic_vector + 1;
```

Bất chấp lợi thế lớn mà các thư viện non-standard này có vẻ mang lại cho bạn, việc dùng chúng không được xem là một thói quen tốt. Vì các vấn đề tương thích trong quá trình synthesis, chúng tôi đặc biệt khuyên không nên dùng các thư viện này.
