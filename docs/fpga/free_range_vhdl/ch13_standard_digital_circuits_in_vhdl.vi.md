# 13 Các mạch số chuẩn trong VHDL

Như bạn đã biết hoặc sẽ sớm nhận ra, ngay cả mạch số phức tạp nhất cũng được tạo thành từ một tập tương đối nhỏ các mạch số chuẩn cộng với một số signal điều khiển đi kèm. Danh sách các mạch số chuẩn này là một tập lẫn lộn các thiết bị tổ hợp và tuần tự như MUX, decoder, counter, comparator, register, v.v. Nghệ thuật digital design bằng VHDL xoay quanh việc chọn đúng và ghép nối đúng các thiết bị này. Việc thực sự tạo ra và test các thiết bị này được de-emphasized.

Cách tiếp cận hiệu quả nhất để tận dụng các mạch số chuẩn bằng VHDL là dùng code có sẵn cho các thiết bị này và sửa chúng theo nhu cầu của thiết kế cụ thể của bạn. Cách tiếp cận này cho phép bạn tận dụng kiến thức VHDL hiện có để thiết kế các mạch số phức tạp một cách nhanh chóng và hiệu quả. Các listing sau trình bày một tập các thiết bị số chuẩn và code VHDL dùng để mô tả chúng. Các mạch sau được thể hiện với nhiều kích thước và độ rộng khác nhau. Lưu ý rằng các mô tả mạch sau là những mô tả VHDL có thể có nhưng hoàn toàn không phải là những mô tả duy nhất. Tuy nhiên, chúng cung cấp điểm khởi đầu để bạn sửa theo nhu cầu thiết kế của riêng mình.

## 13.1 RET D Flip-flop - Model Behavioral

```vhdl
---------------------------------------------------
--  D flip-flop: RET D flip-flop with single output
--
--  Required signals:
---------------------------------------------------
--  CLK,D: in  std_logic;
--  Q:     out std_logic;
---------------------------------------------------
process (CLK)
begin
   if (rising_edge(CLK)) then
      Q <= D;
   end if;
end process;
--
```

## 13.2 FET D Flip-flop với Preset bất đồng bộ Active-low - Model Behavioral

```vhdl
---------------------------------------------------------------
--  D flip-flop: FET D flip-flop with asynchronous preset. The
--  preset input takes precedence over the synchronous input.
--
--  Required signals:
---------------------------------------------------------------
--  CLK,D,S: in  std_logic;
--  Q:       out std_logic;
---------------------------------------------------------------
process (CLK,S)
begin
   if (S = '0') then
      Q <= '1';
   elsif (falling_edge(CLK)) then
      Q <= D;
   end if;
end process;
--
```

## 13.3 Register 8-Bit với Load Enable - Model Behavioral

```vhdl
-----------------------------------------------
--  Register: 8-bit Register with load enable.
--
--  Required signals:
-----------------------------------------------
--  CLK,LD: in  std_logic;
--  D_IN:   in  std_logic_vector(7 downto 0);
--  D_OUT:  out std_logic_vector(7 downto 0);
-----------------------------------------------
process (CLK)
begin
   if (rising_edge(CLK)) then
      if (LD = '1') then   -- positive logic for LD
         D_OUT <= D_IN;
      end if;
   end if;
end process;
--
```

## 13.4 Up/Down Counter đồng bộ - Model Behavioral

```vhdl
 1
 2   ----------------------------------------------------------
 3   -- Counter: synchronous up/down counter with asynchronous
 4   -- reset and synchronous parallel load.
 5   ----------------------------------------------------------
 6   -- library declaration
 7   library IEEE;
 8   use IEEE.std_logic_1164.all;
 9   use IEEE.numeric_std.all;
10
11   entity COUNT_8B is
12      port ( RESET,CLK,LD,UP : in  std_logic;
13                         DIN : in  std_logic_vector (7 downto 0);
14                       COUNT : out std_logic_vector (7 downto 0));
15   end COUNT_8B;
16   architecture my_count of COUNT_8B is
17      signal  t_cnt : unsigned(7 downto 0); -- internal counter signal
18   begin
19      process (CLK, RESET)
20      begin
21         if (RESET = '1') then
22            t_cnt <= (others => '0');  -- clear
23         elsif (rising_edge(CLK)) then
24            if (LD = '1') then     t_cnt <= unsigned(DIN);  -- load
25            else
26               if (UP = '1') then  t_cnt <= t_cnt + 1; -- incr
27               else                t_cnt <= t_cnt - 1; -- decr
28               end if;
29            end if;
30         end if;
31      end process;
32      COUNT <= std_logic_vector(t_cnt);
33   end my_count;
34   --
```

Hãy xem Phụ lục C để có danh sách đầy đủ các function chuyển đổi kiểu như các function ở dòng 24 và dòng 32 của code ở trên.

## 13.5 Shift register với parallel load đồng bộ - Model Behavioral

```vhdl
------------------------------------------------------------------
-- Shift Register: unidirectional shift register with synchronous
-- parallel load.
--
-- Required signals:
------------------------------------------------------------------
-- CLK, D_IN:   in  std_logic;
-- P_LOAD:      in  std_logic;
-- P_LOAD_DATA: in  std_logic_vector(7 downto 0);
-- D_OUT:       out std_logic;
--
-- Required intermediate signals:
signal REG_TMP: std_logic_vector(7 downto 0);
------------------------------------------------------------------
process (CLK)
begin
   if (rising_edge(CLK)) then
      if (P_LOAD = '1') then
         REG_TMP <= P_LOAD_DATA;
      else
         REG_TMP <= REG_TMP(6 downto 0) & D_IN;
      end if;
   end if;
   D_OUT <= REG_TMP(7);
end process;
--
```

## 13.6 Comparator 8-Bit - Model Behavioral

```vhdl
------------------------------------------------------------------
-- Comparator: Implemented as a behavioral model. The outputs
-- include equals, less than and greater than status.
--
-- Required signals:
------------------------------------------------------------------
-- CLK:           in  std_logic;
-- A_IN, B_IN:    in  std_logic_vector(7 downto 0);
-- ALB, AGB, AEB: out std_logic
------------------------------------------------------------------
process(CLK)
begin
   if ( A_IN < B_IN ) then ALB <= '1';
   else ALB <= '0';
   end if;

   if ( A_IN > B_IN ) then AGB <= '1';
   else AGB <= '0';
   end if;

   if ( A_IN = B_IN ) then AEB <= '1';
   else AEB <= '0';
   end if;
end process;
--
```

## 13.7 Decoder BCD sang 7-Segment - Model Data-Flow

```vhdl
--------------------------------------------------------------------
-- BCD to 7-Segment Decoder: Implemented as combinatorial circuit.
-- Outputs are active low; Hex outputs are included. The SSEG format
-- is ABCDEFG (segA, segB etc.)
--
-- Required signals:
--------------------------------------------------------------------
-- BCD_IN: in  std_logic_vector(3 downto 0);
-- SSEG:   out std_logic_vector(6 downto 0);
--------------------------------------------------------------------
with BCD_IN select
   SSEG <= "0000001" when "0000",   -- 0
           "1001111" when "0001",   -- 1
           "0010010" when "0010",   -- 2
           "0000110" when "0011",   -- 3
           "1001100" when "0100",   -- 4
           "0100100" when "0101",   -- 5
           "0100000" when "0110",   -- 6
           "0001111" when "0111",   -- 7
           "0000000" when "1000",   -- 8
           "0000100" when "1001",   -- 9
           "0001000" when "1010",   -- A
           "1100000" when "1011",   -- b
           "0110001" when "1100",   -- C
           "1000010" when "1101",   -- d
           "0110000" when "1110",   -- E
           "0111000" when "1111",   -- F
           "1111111" when others;   -- turn off all LEDs
--
```

## 13.8 Multiplexer 4:1 - Model Behavioral

```vhdl
----------------------------------------------------------------
-- A 4:1 multiplexer implemented as behavioral model using case
-- statement.
--
-- Required signals:
----------------------------------------------------------------
-- SEL:        in  std_logic_vector(1 downto 0);
-- A, B, C, D: in  std_logic;
-- MUX_OUT:    out std_logic;
----------------------------------------------------------------
process (SEL, A, B, C, D)
begin
   case SEL is
      when "00" => MUX_OUT <= A;
      when "01" => MUX_OUT <= B;
      when "10" => MUX_OUT <= C;
      when "11" => MUX_OUT <= D;
      when others => (others => '0');
   end case;
end process;
--
```

## 13.9 Multiplexer 4:1 - Model Data-Flow

```vhdl
------------------------------------------------------------
-- A 4:1 multiplexer implemented as data-flow model using a
-- selective signal assignment statement.
--
-- Required signals:
------------------------------------------------------------
-- SEL:        in  std_logic_vector(1 downto 0);
-- A, B, C, D: in  std_logic;
-- MUX_OUT:    out std_logic;
------------------------------------------------------------
with SEL select
   MUX_OUT <= A when "00",
              B when "01",
              C when "10",
              D when "11",
              (others => '0') when others;
--
```

## 13.10 Decoder

```vhdl
-------------------------------------------------------------------
-- Decoder: 3:8 decoder with active high outputs implemented as
-- combinatorial circuit with selective signal assignment statement
--
-- Required signals:
-------------------------------------------------------------------
-- D_IN: in  std_logic_vector(2 downto 0);
-- FOUT: out std_logic_vector(7 downto 0);
-------------------------------------------------------------------
with D_IN select
   F_OUT <= "00000001" when "000",
            "00000010" when "001",
            "00000100" when "010",
            "00001000" when "011",
            "00010000" when "100",
            "00100000" when "101",
            "01000000" when "110",
            "10000000" when "111",
            "00000000" when others;
--
```
