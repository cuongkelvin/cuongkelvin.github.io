# 6 Các operator của VHDL

Cho đến giờ chúng ta mới chỉ ngầm nhắc đến các operator có trong VHDL. Mục này trình bày danh sách đầy đủ các operator cũng như một vài ví dụ về cách dùng chúng. Danh sách đầy đủ các operator được trình bày trong Bảng 6.1. Tiếp theo là các mô tả ngắn gọn về một số operator ít hiển nhiên hơn. Dù bạn có thể chưa cần dùng ngay một số operator này, bạn nên biết rằng chúng tồn tại. Và dù có một số điều đặc biệt bạn nên biết về một số operator này, mục này không trình bày quá nhiều thông tin.

Các operator trong VHDL được chia thành bảy loại khác nhau: logical, relational, shift, adding, sign, multiplying và miscellaneous. Thứ tự của danh sách này phần nào quan trọng vì nó trình bày các operator theo thứ tự độ ưu tiên tăng dần. Chúng tôi nói ”phần nào” vì code VHDL của bạn không bao giờ nên dựa vào độ ưu tiên của operator để mô tả hành vi của mạch. Việc dựa vào các quy tắc ưu tiên khó nhớ có xu hướng làm code VHDL khó đọc và khó hiểu. Dùng dấu ngoặc đơn thoải mái là cách tiếp cận tốt hơn khi viết code VHDL.

| Loại operator |  |  |  |  |  |  |
|---|---|---|---|---|---|---|
| logical | and | or | nand | nor | xor | xnor |
| relational | = | /= | < | <= | > | >= |
| shift | sll | srl | sla | sra | rol | ror |
| adding | + | − | & |  |  |  |
| sign | + | − |  |  |  |  |
| multiplying | * | / | mod | rem |  |  |
| miscellaneous | ** | abs | not |  |  |  |

Bảng 6.1: Các operator của VHDL.

| Operator | Tên | Giải thích |
|---|---|---|
| A = B | equivalence | A có tương đương với B không? |
| A /= B | non-equivalence | A có không tương đương với B không? |
| A < B | less than | A có nhỏ hơn B không? |
| A <= B | less than or equal | A có nhỏ hơn hoặc bằng B không? |
| A > B | greater than | A có lớn hơn B không? |
| A >= B | greater than or equal | A có lớn hơn hoặc bằng B không? |

Bảng 6.2: Các relational operator của VHDL kèm giải thích ngắn.

Cột đầu tiên của Bảng 6.1 liệt kê các operator từ độ ưu tiên thấp nhất đến cao nhất, trong đó logical operator có độ ưu tiên thấp nhất. Dù có một thứ tự ưu tiên giữa các loại operator, không có thứ tự ưu tiên nào bên trong mỗi loại operator. Nói cách khác, các operator xuất hiện trong các hàng được trình bày không theo thứ tự cụ thể nào. Điều này có nghĩa là các operator được áp dụng lên các operand đã cho theo thứ tự chúng xuất hiện trong code VHDL tương ứng.

## 6.1 Logical operator

Các logical operator nhìn chung tự chúng đã self-explanatory. Chúng cũng đã được dùng xuyên suốt cuốn sách này. Điều duy nhất đáng lưu ý là operator not về mặt kỹ thuật không phải là một logical operator và được xếp vào nhóm miscellaneous operator, nhóm có độ ưu tiên cao nhất.

## 6.2 Relational operator

Các relational operator nhìn chung cũng self-explanatory. Nhiều operator trong số đó đã được dùng trong cuốn sách này. Danh sách đầy đủ các relational operator được cung cấp trong Bảng 6.2.

## 6.3 Shift operator

Có sẵn trong ieee.numeric_std hoặc ieee.numeric_bit, có ba loại shift operator: logical shift, arithmetic shift và rotation. Dù các operator này về cơ bản dịch bit theo hướng left-to-right hoặc right-to-left, có một vài khác biệt cơ bản được liệt kê dưới đây. Các shift operator được liệt kê trong Bảng 6.3.

| Operator |  | Tên | Ví dụ | Kết quả |
|---|---|---|---|---|
|  | sll | shift left logical | result <= ”10010101” sll 2 | ”01010100” |
| logical |  |  |  |  |
|  | srl | shift right logical | result <= ”10010101” srl 3 | ”00010010” |
|  | sla | shift left arithmetic | result <= ”10010101” sla 3 | ”10101111” |
| arithmetic |  |  |  |  |
|  | sra | shift right arithmetic | result <= ”10010101” sra 2 | ”11100101” |
|  | rol | rotate left | result <= ”10100011” rol 2 | ”10001110” |
| rotate |  |  |  |  |
|  | ror | rotate right | result <= ”10100011” ror 2 | ”11101000” |

Bảng 6.3: Các shift operator của VHDL kèm ví dụ.

• Cả hai logical shift đều đưa các bit không vào một đầu của operand chịu tác động của phép shift. Nói cách khác, các bit không được đưa vào một đầu của operand trong khi các bit về cơ bản bị mất ở đầu kia. Khác biệt giữa logical shift và arithmetic shift là trong arithmetic shift, sign-bit không bao giờ bị thay đổi và bit được đưa vào một đầu có thể khác. Vì vậy, với arithmetic shift left, bit cuối cùng bên phải được nhồi vào đầu bên phải của operand. Với arithmetic shift right, sign-bit (bit left-most) được lan truyền sang phải (giá trị của bit left-most được đưa vào đầu bên trái của operand).

• Các rotate operator lấy một bit từ một đầu của word và nhồi nó vào đầu kia. Phép toán này được thực hiện độc lập với giá trị của từng bit trong operand.

## 6.4 Các operator khác

Các nhóm operator khác thường được dùng với các kiểu số. Vì mục này không trình bày chi tiết các phép toán số, các operator được liệt kê ngắn gọn dưới đây trong Bảng 6.4. Các operator &, mod và rem được chú ý đặc biệt. Các operator này cũng bị giới hạn chỉ hoạt động trên những kiểu cụ thể, mà những kiểu đó cũng không được liệt kê ở đây.

## 6.5 Concatenation operator

Concatenation operator & thường là một operator hữu ích khi làm việc với mạch số. Có nhiều lúc bạn sẽ thấy cần ghép hai giá trị riêng biệt lại với nhau. Concatenation operator đã xuất hiện trong một số lời giải ví dụ trước đây. Một số ví dụ khác về concatenation operator được trình bày trong Listing 6.1.

Listing 6.1: Các ví dụ về concatenation operator.

```vhdl
signal A_val, B_val : std_logic_vector(3 downto 0);
signal C_val : std_logic_vector(5 downto 0);
signal D_val : std_logic_vector(7 downto 0);
------
C_val <= A_val & "00";
C_val <= "11" & B_val;
C_val <= '1' & A_val & '0';
D_val <= "0001" & C_val(3 downto 0);
D_val <= A_val & B_val;
```

## 6.6 Modulus operator và remainder operator

Cả remainder operator rem và modulus operator mod đều được áp dụng cho các kiểu integer và đều trả về một kiểu integer. Thường có sự nhầm lẫn về khác biệt giữa hai operator này và khác biệt trong cách chúng hoạt động trên số âm và số dương. Các định nghĩa mà VHDL dùng cho các operator này được trình bày trong Bảng 6.5, còn một vài ví dụ về các operator này được cung cấp trong Bảng 6.6. Một quy tắc chung mà nhiều người lập trình tuân theo là tránh dùng operator mod khi làm việc với số âm. Như bạn có thể thấy từ các ví dụ dưới đây, đáp án đôi khi counter-intuitive.

| Operator |  | Tên | Ghi chú |
|---|---|---|---|
|  | + | addition |  |
| adding | - | subtraction |  |
|  | & | concatenation | chỉ có thể hoạt động trên những kiểu cụ thể |
|  | + | identity | unary operator |
| sign |  |  |  |
|  | - | negation | unary operator |
|  | * | multiplication |  |
|  | / | division | thường bị giới hạn ở các lũy thừa của hai |
| multiplying |  |  |  |
|  | mod | modulus | chỉ có thể hoạt động trên những kiểu cụ thể |
|  | rem | remainder | chỉ có thể hoạt động trên những kiểu cụ thể |
|  | ** | exponentiation | thường bị giới hạn ở các lũy thừa của hai |
| miscellaneous |  |  |  |
|  | abs | absolute value |  |

Bảng 6.4: Tất cả các operator VHDL khác chưa được liệt kê cho đến giờ.

| Operator | Tên | Thỏa mãn các điều kiện này |
|---|---|---|
| rem | remainder | 1. dấu của (X rem Y) giống dấu của X |
|  |  | 2. abs (X rem Y) < abs (Y) |
|  |  | 3. (X rem Y) = (X - (X / Y) * Y) |
| mod | modulus | 1. dấu của (X mod Y) giống dấu của Y |
|  |  | 2. abs (X mod Y) < abs (Y) |
|  |  | 3. (X mod Y) = ( X * ( Y - N )) |
|  |  | với một integer N nào đó |

Bảng 6.5: Định nghĩa của các operator rem và mod. (abs = giá trị tuyệt đối)

## 6.7 Ôn lại gần như mọi thứ cho đến giờ

VHDL là một ngôn ngữ dùng để thiết kế, test và hiện thực mạch số. Các design unit cơ bản trong VHDL là entity và architecture, chúng tiêu biểu cho cách tiếp cận phân cấp tổng quát của VHDL. Entity biểu diễn sơ đồ black-box của mạch, hay interface của mạch với thế giới bên ngoài, còn architecture bao gồm mọi chi tiết khác về cách mạch hoạt động.

Architecture VHDL được tạo thành từ các statement mô tả hành vi của mạch số. Vì đây là một ngôn ngữ mô tả phần cứng, các statement trong VHDL chủ yếu được xem là thực thi concurrent. Ý tưởng concurrency là một trong những chủ đề chính của VHDL, đúng như người ta có thể mong đợi, vì một mạch số có thể được mô hình hóa như một tập logic gate hoạt động concurrent.

Các loại concurrent statement chính trong VHDL là concurrent signal assignment statement, conditional signal assignment statement, selected signal assignment statement và process statement. Process statement là một concurrent statement chỉ được tạo thành hoàn toàn từ các sequential statement. Các loại sequential statement chính là signal assignment statement, if statement và case statement. If statement là phiên bản sequential của conditional signal assignment statement, còn case statement là phiên bản sequential của selected signal assignment statement.

| rem | mod |
|---|---|
| 8 rem 5 = 3 | 8 mod 5 = 3 |
| -8 rem 5 = -3 | -8 mod 5 = 2 |
| 8 rem -5 = 3 | 8 mod -5 = -2 |
| -8 rem -5 = -3 | -8 mod -5 = -3 |

Bảng 6.6: Ví dụ về các operator rem và mod.

Các coding style trong VHDL thuộc các loại model data-flow, behavioral và structural. Việc chỉ dùng process statement cho thấy một model behavioral. Việc dùng concurrent signal assignment, conditional signal assignment và selective signal assignment cho thấy việc dùng một model data-flow. Code VHDL mô tả các mạch số phức tạp hơn nói chung sẽ chứa đặc điểm của cả tất cả các loại modeling này.

Vì bạn không nên bỏ chút công sức nào để ghi nhớ cú pháp VHDL, bạn nên luôn giữ một cheat sheet bên cạnh khi làm VHDL modeling. Phát triển một sự hiểu biết thực sự về VHDL mới là thứ sẽ biến bạn thành một người thiết kế phần cứng giỏi. Khả năng ghi nhớ cú pháp VHDL hầu như không chứng minh được gì.
