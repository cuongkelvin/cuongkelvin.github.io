# CHƯƠNG 3: ĐẠI SỐ BOOLEAN VÀ BẢNG TRA LUT (BOOLEAN ALGEBRA AND THE LOOK-UP TABLE)
## Bản Dịch Đầy Đủ Chi Tiết & Hướng Dẫn Kỹ Thuật Toàn Tập

---

## 1. Giới Thiệu Về Đại Số Boolean Trong FPGA

Đại số Boolean là một lĩnh vực toán học và logic vô cùng thiết yếu để hiểu rõ nguyên lý vận hành của các thiết bị phần cứng như FPGA. Trong đại số Boolean, tất cả các giá trị đầu vào và đầu ra đều chỉ nhận hai trạng thái duy nhất: **đúng (true)** hoặc **sai (false)**, tương ứng với các con số nhị phân **1** và **0**, hoặc mức điện áp **cao (high)** và **thấp (low)**. Thay vì các phép toán số học thông thường như cộng, trừ, nhân, chia, đại số Boolean sử dụng các phép toán logic cơ bản như **AND**, **OR** và **NOT**. Mỗi phép toán này nhận một số lượng các giá trị 0 và 1 làm đầu vào, xử lý/đánh giá chúng và tạo ra kết quả đầu ra là 0 hoặc 1. Mọi môn học đại số sẽ trở nên đơn giản hơn rất nhiều nếu nó chỉ xoay quanh đại số Boolean!

Bạn có thể đã từng gặp các phép toán Boolean trong các ngôn ngữ lập trình phần mềm như C, C++ hoặc Python. Ví dụ, bạn có thể muốn chương trình của mình chỉ ghi dữ liệu vào một tệp khi người dùng bấm chọn đồng ý *và* tên tệp đó hợp lệ. Tương tự như vậy, bên trong một chip FPGA, bạn rất thường xuyên phải kiểm tra nhiều tín hiệu đầu vào đồng thời để quyết định trạng thái của một tín hiệu đầu ra. Giả sử bạn muốn bật một đèn LED khi người dùng nhấn một trong hai công tắc bất kỳ. FPGA có thể thực hiện điều này bằng cách sử dụng phép toán **OR**: nếu công tắc thứ nhất *hoặc* công tắc thứ hai (hoặc cả hai) cung cấp mức logic 1 ở đầu vào, FPGA sẽ xuất mức 1 ở đầu ra để cấp điện cho đèn LED phát sáng.

Đại số Boolean giúp thực hiện các tác vụ điều khiển đơn giản như thế này. Nhưng quan trọng hơn cả, **đại số Boolean mô tả tất cả các phép toán xử lý dữ liệu nền tảng bên trong FPGA của bạn**. Khi bạn xâu chuỗi đủ nhiều phép toán Boolean lại với nhau, bạn có thể thực hiện các phép tính số học phức tạp, lưu trữ dữ liệu, xử lý hình ảnh/video và nhiều hơn thế nữa. Bạn có thể làm được một số lượng công việc kinh ngạc chỉ bằng cách thao tác trên các chuỗi số 0 và 1.

Trong chương này, chúng ta sẽ khám phá cách biểu diễn các phép toán Boolean đơn giản bằng các **cổng logic (logic gates)**, và xem xét cách các cổng này kết hợp với nhau thành các phương trình đại số Boolean phức tạp hơn như thế nào. Sau đó, chúng ta sẽ tìm hiểu cách FPGA thực sự thực hiện các phép toán logic trong thực tế bằng cách gom chức năng của vô số cổng logic rời rạc vào một linh kiện vạn năng duy nhất gọi là **Bảng tra (Look-Up Table - LUT)**. Như bạn sẽ thấy, bảng tra chính là một trong hai thành phần quan trọng nhất bên trong cấu trúc của một con chip FPGA.

---

## 2. Các Cổng Logic và Bảng Chân Lý (Logic Gates and Their Truth Tables)

Khi thiết kế mạch điện tử trên FPGA, chúng ta biểu diễn các phép toán Boolean đơn giản bằng các **cổng logic (logic gates)** — những linh kiện nhận các tín hiệu điện làm đầu vào, thực hiện phép toán Boolean trên đó và tạo ra tín hiệu điện tương ứng ở đầu ra. Có các loại cổng logic khác nhau tương ứng với tất cả các phép toán Boolean: **AND**, **OR**, **NOT**, **XOR**, và **NAND**. Mỗi cổng logic này có thể được mô tả một cách định lượng bằng một **bảng chân lý (truth table)** — một bảng liệt kê tất cả các tổ hợp đầu vào có thể có cho một phương trình đại số Boolean và hiển thị kết quả đầu ra tương ứng.

Chúng ta sẽ thảo luận về từng cổng logic phổ biến và xem xét bảng chân lý của chúng ngay sau đây. Nhưng trước tiên, điều quan trọng là phải hiểu các con số 1 và 0 trong các bảng chân lý thực sự có ý nghĩa gì dưới góc độ điện tử. 

### Bản Chất Điện Áp Của Tín Hiệu Nhị Phân (Core Voltage)
Bên trong FPGA, dữ liệu kỹ thuật số được biểu diễn trực tiếp bằng mức điện áp thế tử:

* **Mức 0 (Low):** Được đại diện bởi mức điện áp **0 Volt** (GND).
* **Mức 1 (High):** Được đại diện bởi một mức điện áp cao hơn 0, gọi là **Điện áp lõi (Core Voltage)**. 

Mức điện áp lõi phụ thuộc vào từng họ chip FPGA cụ thể, nhưng đối với các FPGA hiện đại, nó thường nằm trong khoảng từ **0.8 Volt đến 1.2 Volt**. Khi chúng ta nói một tín hiệu ở mức cao (*high*), có nghĩa là đường dây dẫn đó đang ở mức điện áp lõi và đại diện cho giá trị dữ liệu nhị phân 1. Tương tự, một tín hiệu ở mức thấp (*low*) ở mức 0 Volt và đại diện cho giá trị dữ liệu nhị phân 0.

Với lưu ý này, hãy cùng xem xét chi tiết từng loại cổng logic.

---

### A. Cổng AND (AND Gates)

Cổng AND là cổng logic có đầu ra ở mức cao (1) khi và chỉ khi **tất cả** các đầu vào của nó đều ở mức cao (1). Chúng ta sẽ lấy ví dụ về một cổng AND 2 đầu vào, nhưng trong thực tế cổng AND có thể được thiết kế với số lượng đầu vào bất kỳ (3, 4, 8 đầu vào...). Đối với cổng AND 2 đầu vào, đầu ra ở mức cao khi đầu vào A *và* đầu vào B đều ở mức cao, do đó nó có tên gọi là cổng AND.

#### Bảng Chân Lý Cho Cổng AND 2 Đầu Vào:

| Đầu vào A | Đầu vào B | Đầu ra Q |
| :---: | :---: | :---: |
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

In trong bảng chân lý, các hàng thường được sắp xếp theo thứ tự nhị phân / thập phân tăng dần dựa trên các tổ hợp đầu vào. Trong trường hợp bảng chân lý AND ở trên:

* Hàng 1: Đầu vào A = 0, B = 0 → Biểu diễn nhị phân `b00` (thập phân 0).
* Hàng 2: Đầu vào A = 0, B = 1 → Biểu diễn nhị phân `b01` (thập phân 1).
* Hàng 3: Đầu vào A = 1, B = 0 → Biểu diễn nhị phân `b10` (thập phân 2).
* Hàng 4: Đầu vào A = 1, B = 1 → Biểu diễn nhị phân `b11` (thập phân 3).

Nếu cổng AND có nhiều đầu vào hơn, số hàng trong bảng chân lý sẽ tăng lên theo quy tắc `2ⁿ` (`n` là số đầu vào). Ví dụ, cổng AND 3 đầu vào sẽ có `2³ = 8` hàng trong bảng chân lý, chạy từ `b000` đến `b111` (từ 0 đến 7 trong hệ thập phân).

> **GHI CHÚ VỀ KÝ HIỆU ĐẦU RA Q:**
> Trong sơ đồ mạch logic, đầu ra của một cổng logic thường được ký hiệu bằng chữ cái **Q**. Quy ước này bắt nguồn từ nhà toán học người Anh **Alan Turing**, người đã sử dụng chữ cái Q để chỉ các trạng thái trong các cỗ máy Turing nổi tiếng của mình. Chữ Q đại diện cho từ *quanta* — chỉ một trạng thái rời rạc (chẳng hạn như 0 hoặc 1), thay vì một giá trị biến thiên liên tục trong đại số thông thường.

Mỗi cổng logic có một ký hiệu hình học đặc trưng riêng trong sơ đồ nguyên lý:
Cổng AND 2 đầu vào được vẽ với dạng hình vòm (chữ D): các đường tín hiệu đầu vào A và B đi vào ở cạnh phẳng bên trái, và đường tín hiệu đầu ra Q đi ra từ đỉnh vòm cong ở bên phải.

---

### B. Cổng OR (OR Gates)

Cổng OR là cổng logic có đầu ra ở mức cao (1) khi **bất kỳ** đầu vào nào của nó ở mức cao (1); nghĩa là khi đầu vào A *hoặc* đầu vào B (hoặc cả hai) ở mức cao.

#### Bảng Chân Lý Cho Cổng OR 2 Đầu Vào:

| Đầu vào A | Đầu vào B | Đầu ra Q |
| :---: | :---: | :---: |
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 1 |

Lưu ý rằng khi cả hai đầu vào A và B đều ở mức 1, đầu ra Q của cổng OR vẫn ở mức 1. Tất cả những gì cổng OR quan tâm là có ít nhất một đầu vào mang giá trị 1. Ký hiệu sơ đồ của cổng OR có hình chiếc lá cong nhọn ở đầu ra.

---

### C. Cổng NOT (NOT Gates / Inverters)

Cổng NOT có một đầu vào duy nhất và một đầu ra duy nhất. Loại cổng này đơn giản là **đảo ngược** trạng thái của tín hiệu đầu vào (đầu ra *không phải* là đầu vào), do đó nó còn được gọi là **Bộ đảo (Inverter)**.

#### Bảng Chân Lý Cho Cổng NOT:

| Đầu vào A | Đầu ra Q |
| :---: | :---: |
| 0 | 1 |
| 1 | 0 |

Bất kể giá trị tín hiệu đưa vào cổng NOT là gì, đầu ra sẽ luôn là giá trị logic ngược lại. 

Ký hiệu của cổng NOT là một hình tam giác chỉ sang phải với một **bong bóng tròn (bubble)** ở đỉnh tam giác. Bong bóng tròn này là ký hiệu quy chuẩn đại diện cho phép đảo logic. Bong bóng đảo này cũng xuất hiện ở đầu ra của các cổng NAND, NOR và đôi khi xuất hiện ngay tại các chân đầu vào của các khối chức năng.

---

### D. Cổng XOR (Exclusive OR Gates)

Đầu ra của cổng XOR (phát âm là *"ex-or"*, viết tắt của *Exclusive OR* — OR loại trừ) ở mức cao (1) khi **chỉ duy nhất một trong hai** đầu vào ở mức cao, nhưng **không phải cả hai**. Nói cách khác, cổng XOR kiểm tra sự hiện diện độc quyền của một trong hai đầu vào.

#### Bảng Chân Lý Cho Cổng XOR:

| Đầu vào A | Đầu vào B | Đầu ra Q |
| :---: | :---: | :---: |
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

Ký hiệu của cổng XOR trông tương tự như cổng OR, nhưng có thêm một đường cong phụ nằm song song ở phía bên trái của đường vào.

Mặc dù loại cổng này thoáng nhìn có vẻ ít phổ biến hơn AND hay OR, nhưng nó xuất hiện cực kỳ thường xuyên trong các mạch phần cứng thực tế. Ví dụ, các cổng XOR là thành phần cốt lõi để xây dựng mạch cộng nhị phân (Adder), mạch kiểm tra thặng dư chu kỳ (**CRC - Cyclic Redundancy Check**) dùng để xác minh tính toàn vẹn của dữ liệu truyền qua mạng, và các thuật toán mã hóa bảo mật.

---

### E. Cổng NAND (NAND Gates)

Cổng NAND (viết tắt của *NOT AND*) có kết quả đầu ra ngược lại hoàn toàn so với cổng AND. Ký hiệu sơ đồ của nó trông giống hệt cổng AND, chỉ khác là có thêm một bong bóng tròn đảo logic ở chân đầu ra.

Nếu cả hai đầu vào A và B đều ở mức 1, đầu ra Q sẽ bị đảo về mức 0. Trong tất cả các trường hợp còn lại, đầu ra Q luôn ở mức 1.

#### Bảng Chân Lý Cho Cổng NAND:

| Đầu vào A | Đầu vào B | Đầu ra Q |
| :---: | :---: | :---: |
| 0 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

Cổng NAND đóng vai trò đặc biệt quan trọng trong công nghệ bán dẫn vì chúng là cấu trúc linh kiện cơ sở để sản xuất bộ nhớ Flash dùng trong ổ đĩa USB, ổ cứng SSD và thẻ nhớ SD. Cổng NAND cũng chính là nguồn cảm hứng cho tên trang web kỹ thuật nổi tiếng của tác giả: `https://nandland.com`.

---

### F. Các Cổng Logic Khác (Other Gates)

Ngoài ra còn có các cổng logic phụ trợ khác như **NOR** (*NOT OR* - đảo của cổng OR) và **XNOR** (*Exclusive NOT OR* - đảo của cổng XOR). 

Ngoại trừ cổng NOT (chỉ có 1 đầu vào), tất cả các loại cổng logic nêu trên (AND, OR, NAND, NOR, XOR, XNOR) đều có thể được thiết kế với nhiều hơn 2 đầu vào.

---

## 3. Các Cổng Logic Trong Mã VHDL và Verilog (Logic Operators in Code)

Phần trên trình bày các cổng logic dưới dạng ký hiệu mạch và bảng chân lý. Khi viết mã, bạn gọi chúng bằng toán tử hoặc từ khóa của ngôn ngữ.

| Cổng | VHDL | Verilog |
| :--- | :---: | :---: |
| AND | `and` | `&` |
| OR | `or` | `\|` |
| NOT | `not` | `~` |
| XOR | `xor` | `^` |
| NAND | `nand` | `~&` |
| NOR | `nor` | `~\|` |
| XNOR | `xnor` | `~^` |

VHDL dùng **từ khóa tiếng Anh** cho cả bảy phép, đọc gần như tiếng người. Verilog dùng **ký hiệu** vay mượn từ C, viết ngắn hơn nhưng phải nhớ ký tự.

Một điểm cần lưu ý ở Verilog: ngôn ngữ này phân biệt giữa toán tử **theo bit** (`&`, `|`, `^`) và toán tử **logic** (`&&`, `||`, `!`). Khi làm việc với tín hiệu phần cứng, bạn gần như luôn dùng loại theo bit. VHDL không có sự phân biệt này nên không gặp bẫy đó.

### Thứ Tự Ưu Tiên Trong VHDL Khác Với Đại Số Boolean

Đây là chỗ dễ vấp nhất khi chuyển từ lý thuyết sang mã nguồn, và nó mâu thuẫn trực tiếp với quy tắc bạn sẽ học ở mục tiếp theo.

Trong **đại số Boolean**, phép AND có độ ưu tiên cao hơn phép OR, nên biểu thức `A · B + C` được hiểu là `(A · B) + C` mà không cần ngoặc.

Trong **VHDL thì không như vậy**. Sáu toán tử logic nhị phân đều nằm ở **cùng một mức ưu tiên**, và ngôn ngữ **cấm trộn hai loại khác nhau mà không có dấu ngoặc**:

```vhdl
q <= a and b or c;        -- LOI CU PHAP
q <= (a and b) or c;      -- DUNG
```

Nếu viết dòng đầu, GHDL sẽ báo:

```
only one type of logical operators may be used to combine relation
```

Quy tắc đầy đủ gồm ba phần, và phần thứ ba là cái ít người biết:

**Một — `not` nằm ở mức ưu tiên cao hơn**, tách khỏi nhóm sáu toán tử kia. Vì vậy nó không cần ngoặc khi đứng cạnh phép khác:

```vhdl
q <= not a and b;         -- DUNG, khong can ngoac
```

**Hai — `and`, `or`, `xor`, `xnor` có tính kết hợp** (associative), nên lặp lại cùng một toán tử thì viết liền thoải mái:

```vhdl
q <= a and b and c;       -- DUNG
q <= a xor b xor c;       -- DUNG
```

**Ba — `nand` và `nor` thì KHÔNG có tính kết hợp.** Đây là ngoại lệ dễ bất ngờ: ngay cả khi lặp lại chính nó, VHDL vẫn từ chối.

```vhdl
q <= a nand b nand c;     -- LOI, du cung mot toan tu
q <= (a nand b) nand c;   -- DUNG
```

GHDL báo lỗi rất rõ ràng ở trường hợp này:

```
sequence of 'nor' or 'nand' not allowed
('nor' and 'nand' are not associative)
```

Lý do nằm ở toán học chứ không phải ở ngôn ngữ: `(A nand B) nand C` **khác** `A nand (B nand C)`. Với AND hay OR thì đặt ngoặc kiểu nào cũng ra cùng kết quả, còn NAND và NOR thì không. VHDL bắt bạn nói rõ ý định thay vì chọn bừa một cách hiểu.

Thiết kế này thoạt nhìn phiền phức, nhưng nó loại bỏ hoàn toàn khả năng người đọc hiểu nhầm độ ưu tiên. Verilog thì ngược lại — có thứ tự ưu tiên giống C, nên `a & b | c` biên dịch được và được hiểu là `(a & b) | c`.

---

## 4. Kết Hợp Các Cổng Bằng Đại Số Boolean (Combining Gates with Boolean Algebra)

Trong thực tế, bạn sẽ muốn viết các đoạn mã phần cứng thực hiện các chức năng phức tạp hơn là một cổng logic đơn lẻ. Bạn có thể xâu chuỗi nhiều cổng logic lại với nhau để biểu diễn các phương trình đại số Boolean phức tạp và sử dụng toán Boolean để xác định kết quả đầu ra.

Trong đại số Boolean, mỗi phép toán logic có ký hiệu toán học chuẩn tương ứng:

| Ký hiệu Toán học | Phép toán Logic tương ứng |
| :---: | :---: |
| `*` hoặc `·` | **AND** |
| `+` | **OR** |
| `'` hoặc `Ā` | **NOT** |
| `^` hoặc `⊕` | **XOR** |

### Thứ Tự Ưu Tiên Phép Toán (Order of Operations)
Đại số Boolean tuân theo thứ tự ưu tiên thực hiện phép toán nghiêm ngặt:

1. Thực hiện phép toán **NOT** trước.
2. Thực hiện phép toán **AND** tiếp theo.
3. Thực hiện phép toán **OR** cuối cùng.

Giống như trong đại số thông thường, bạn có thể sử dụng **dấu ngoặc đơn `()`** để thay đổi thứ tự ưu tiên: bất kỳ biểu thức nào nằm trong dấu ngoặc đơn sẽ luôn được đánh giá và tính toán trước.

---

### Phân Tích Ví Dụ 1: Phương Trình 2 Đầu Vào
Xét phương trình Boolean:

```
Q = A·B + A'
```

Đọc bằng lời: *"Đầu ra Q bằng (A AND B) OR (NOT A)"*.

#### Bảng Chân Lý Cho Phương Trình `Q = A·B + A'`:

| Đầu vào A | Đầu vào B | Phép `A·B` | Phép `A'` | Đầu ra Q (`A·B + A'`) |
| :---: | :---: | :---: | :---: | :---: |
| 0 | 0 | 0 | 1 | **1** |
| 0 | 1 | 0 | 1 | **1** |
| 1 | 0 | 0 | 0 | **0** |
| 1 | 1 | 1 | 0 | **1** |

**Giải thích luồng tính toán:**

* **Hàng 1 (`A=0, B=0`):** `A' = 1`, `A·B = 0`. Phép OR giữa 0 và 1 cho ra `Q = 1`.
* **Hàng 2 (`A=0, B=1`):** `A' = 1`, `A·B = 0`. Phép OR giữa 0 và 1 cho ra `Q = 1`.
* **Hàng 3 (`A=1, B=0`):** `A' = 0`, `A·B = 0`. Phép OR giữa 0 và 0 cho ra `Q = 0`.
* **Hàng 4 (`A=1, B=1`):** `A' = 0`, `A·B = 1`. Phép OR giữa 1 và 0 cho ra `Q = 1`.

Như vậy, bất kỳ khi nào `A = 0`, hoặc khi cả `A` và `B` đều bằng 1, đầu ra `Q` sẽ bằng 1. Trường hợp duy nhất `Q = 0` là khi `A = 1` và `B = 0`.

---

### Phân Tích Ví Dụ 2: Phương Trình 3 Đầu Vào
Xét phương trình Boolean có 3 đầu vào:

```
Q = A + (C·B')
```

Vì có 3 đầu vào (`A, B, C`), bảng chân lý sẽ có `2³ = 8` hàng.

#### Bảng Chân Lý Cho Phương Trình `Q = A + (C·B')`:

| Hàng (Thập phân) | Đầu vào A | Đầu vào B | Đầu vào C | `B'` | `C·B'` | Đầu ra Q |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 0 | 0 | 0 | 0 | 1 | 0 | **0** |
| 1 | 0 | 0 | 1 | 1 | 1 | **1** |
| 2 | 0 | 1 | 0 | 0 | 0 | **0** |
| 3 | 0 | 1 | 1 | 0 | 0 | **0** |
| 4 | 1 | 0 | 0 | 1 | 0 | **1** |
| 5 | 1 | 0 | 1 | 1 | 1 | **1** |
| 6 | 1 | 1 | 0 | 0 | 0 | **1** |
| 7 | 1 | 1 | 1 | 0 | 0 | **1** |

**Giải thích luồng tính toán:**

1. Biểu thức trong ngoặc `(C·B')` thực hiện phép AND giữa `C` và đảo của `B`. Biểu thức này chỉ bằng 1 khi `C = 1` và `B = 0` (xuất hiện ở Hàng 1 và Hàng 5).
2. Phép toán vế ngoài là phép OR với `A`. Do đó, bất kỳ khi nào `A = 1` (ở các Hàng 4, 5, 6, 7), đầu ra `Q` lập tức bằng 1 mà không cần quan tâm đến `B` và `C`.
3. Kết hợp hai điều kiện trên, `Q = 1` ở các hàng 1, 4, 5, 6, 7. Các hàng còn lại (0, 2, 3) cho ra `Q = 0`.

---

> ### 💡 TỐI THIỂU HÓA LOGIC (LOGIC MINIMIZATION)
> Khi học đại số Boolean trong các khóa học lý thuyết mạch số, bạn sẽ thường gặp các kỹ thuật tối thiểu hóa logic như **Định lý De Morgan**, **Bìa Karnaugh (Karnaugh Maps)** và **Thuật toán Quine–McCluskey**. Đây là các công cụ toán học thủ công giúp rút gọn phương trình Boolean phức tạp thành dạng tối giản nhằm tiêu tốn ít cổng logic phần cứng nhất.
>
> **Thực tế trong ngành kỹ sư FPGA:** Bạn **không cần phải tự tay rút gọn phương trình hay làm Bìa Karnaugh**! Trong quy trình thiết kế FPGA hiện đại, các bộ công cụ phần mềm tổng hợp (**Synthesis Tools**) vô cùng thông minh. Chúng sẽ tự động phân tích mã Verilog/VHDL của bạn và ứng dụng các thuật toán tối ưu hóa logic phức tạp nhất để rút gọn biểu thức về mức tối thiểu. Tác giả chia sẻ rằng dù đã dành nhiều tuần ở trường đại học để giải Bìa Karnaugh bằng tay, nhưng trong suốt sự nghiệp làm kỹ sư thiết kế FPGA chuyên nghiệp, tác giả chưa bao giờ phải tự làm việc đó. Việc của bạn chỉ là viết mã Verilog/VHDL sạch, rõ nghĩa và để phần mềm tự làm phần việc tối ưu.

---

## 5. Bảng Tra - Look-Up Table (LUT)

Sau khi tìm hiểu về các cổng logic rời rạc (AND, OR, NOT...), có thể bạn sẽ bất ngờ khi biết rằng: **Các cổng logic này KHÔNG THỰC SỰ TỒN TẠI VẬT LÝ bên trong chip FPGA!**

Không có một "ngân hàng" chứa sẵn các cổng AND, OR rời rạc để bạn rút ra và nối dây lại với nhau. Thay vào đó, FPGA chứa một linh kiện vạn năng tinh vi hơn rất nhiều: **Bảng tra (Look-Up Table - LUT)**.

### LUT Hoạt Động Như Thế Nào?
Bảng tra (LUT) là một linh kiện phần cứng có thể được lập trình để giả lập **bất kỳ phương trình đại số Boolean nào**. Cho dù bạn cần một cổng AND, một cổng XOR, hay một phương trình kết hợp 3 cổng logic phức tạp như `Q = A + (C·B')`, một LUT duy nhất đều có thể được nạp bảng chân lý tương ứng để tái tạo chính xác kết quả đầu ra đó.

LUTs được phân loại dựa trên số lượng đầu vào mà chúng chấp nhận:

* **LUT-2:** LUT có 2 đầu vào (`2² = 4` vị trí nhớ bảng chân lý).
* **LUT-3:** LUT có 3 đầu vào (`2³ = 8` vị trí nhớ bảng chân lý).
* **LUT-4:** LUT có 4 đầu vào (`2⁴ = 16` vị trí nhớ bảng chân lý).
* **LUT-5 / LUT-6:** Các LUT cao cấp trên FPGA hiện đại của AMD (Xilinx) hay Intel (Altera).

Hầu hết các LUT tiêu chuẩn tạo ra **1 đầu ra duy nhất**.

```
[Mạch logic truyền thống tốn 3 cổng rời]:
Input A ----> [Cổng NOT] --\
Input B --------------------> [Cổng AND] --\
Input C ------------------------------------> [Cổng OR] ---> Output Q

[Mạch FPGA gói gọn trong 1 LUT-3 duy nhất]:
Input A --\
Input B ---> [ LUT-3 chứa Bảng Chân Lý 8 hàng ] ---> Output Q
Input C --/
```

Một chip FPGA điển hình chứa từ **hàng nghìn đến hàng triệu LUT** sẵn sàng được lập trình. Khi bạn viết mã Verilog hoặc VHDL ở mức cao (như so sánh 2 số, tăng bộ đếm), trình tổng hợp sẽ chia nhỏ logic đó thành các bảng chân lý và nạp vào các LUT trên chip. **LUT chính là thành phần cốt lõi đảm nhận phần logic tổ hợp (combinational logic) trong FPGA.**

### Bên Trong Một LUT Thực Sự Có Gì

Nói LUT "lập trình được để giả lập bất kỳ phương trình Boolean nào" là đúng, nhưng chưa trả lời được câu hỏi *bằng cách nào*. Câu trả lời đơn giản đến mức bất ngờ: **LUT không tính toán gì cả, nó chỉ tra bảng.**

Một LUT-6 gồm hai phần:

* **64 ô nhớ SRAM**, mỗi ô giữ 1 bit. Đây chính là 64 hàng của bảng chân lý, được nạp sẵn từ bitstream lúc khởi động.
* **Một cây MUX** chọn ra đúng một ô trong 64 ô đó.

Sáu đầu vào của LUT đóng vai trò **địa chỉ**, còn giá trị của ô nhớ tại địa chỉ ấy chính là đầu ra.

```
     64 o nho SRAM            Cay MUX              Dau ra
     (nap tu bitstream)
        +----+
        | 0  |---+
        | 1  |---|
        | 0  |---|   +------------------+
        | 1  |---+-->|                  |
        | .. |---|   |  chon 1 trong 64 |-----------> O
        | .. |---|   |                  |
        | 1  |---|   +--^--^--^--^--^--^+
        | 0  |---+      |  |  |  |  |  |
        +----+          I5 I4 I3 I2 I1 I0   (6 day vao)
```

Điều này nối thẳng với cơ chế đã trình bày ở Chương 1: cấu hình FPGA nằm trong các ô nhớ SRAM, và nạp bitstream chính là ghi giá trị vào những ô đó. Phần lớn số ô ấy là nội dung bảng tra của các LUT.

Vì nội dung bảng do bạn nạp vào, **cùng một LUT-6 có thể trở thành bất kỳ hàm logic nào của 6 biến**. Số hàm khác nhau có thể nạp là **2⁶⁴**, tức khoảng 18 tỉ tỉ. Cổng AND, cổng XOR, bộ MUX 4:1, bộ so sánh 3 bit — tất cả chỉ là những bảng khác nhau trong cùng một linh kiện.

Đó là toàn bộ ý nghĩa của chữ *Programmable* trong tên gọi FPGA: phần cứng giống hệt nhau ở mọi thiết kế, chỉ khác nội dung bảng.

### Dùng Ít Đầu Vào Hơn Vẫn Tốn Trọn Một LUT

Một hệ quả thực dụng mà bạn nên tận dụng: nếu hàm của bạn chỉ cần 2 biến, LUT-6 vẫn bị chiếm **trọn vẹn**. Các đầu vào thừa được nối cố định và bảng 64 bit được điền sao cho chúng không ảnh hưởng kết quả.

```vhdl
q <= a and b;                          -- 1 LUT
q <= (a and b) or (c and d) or e;      -- VAN la 1 LUT (5 bien)
```

Hai dòng trên tốn tài nguyên như nhau. Nói cách khác, **nhồi thêm logic vào cùng một LUT là miễn phí**, miễn tổng số biến không vượt quá 6.

Vì vậy đừng ngại viết biểu thức dài. Chỉ cần dè chừng khi nó vượt quá 6 biến.

Có một ngoại lệ đáng biết: LUT-6 của Xilinx còn hỗ trợ **chế độ kép**. Nó chia được thành hai LUT-5 dùng chung đầu vào, cho ra hai đầu ra riêng gọi là `O5` và `O6`. Nhờ vậy, trong một thiết kế lớn, Vivado có thể gộp *hai* hàm nhỏ khác nhau vào cùng một LUT vật lý, miễn chúng dùng chung không quá 5 biến.

Đây là việc công cụ tự làm, bạn không điều khiển được. Nhưng nó giải thích vì sao đôi khi báo cáo tài nguyên cho ra số LUT thấp hơn bạn nhẩm tay.

### Khi Hàm Có Nhiều Hơn 6 Đầu Vào

Lúc đó trình tổng hợp phải **ghép nhiều LUT thành cây nhiều tầng**. Ví dụ một hàm AND 12 biến:

```
 6 bien --> [ LUT ] --+
                      |--> [ LUT ] --> q
 6 bien --> [ LUT ] --+
          tang 1        tang 2
```

Ba LUT, hai tầng. Quy tắc chung: mỗi tầng gộp được 6 kết quả thành 1, nên hàm `N` biến cần khoảng `log₆N` tầng.

| Số biến | Số tầng | Số LUT (xấp xỉ) |
| :---: | :---: | :---: |
| 6 | 1 | 1 |
| 36 | 2 | 7 |
| 216 | 3 | 43 |

Ở cột giữa là thứ bạn phải để ý nhất. Mỗi tầng tăng thêm **độ trễ**: thời gian tín hiệu đi qua LUT (khoảng 0,1 ns) cộng thời gian đi qua dây nối sang tầng sau (thường lớn hơn, 0,2–1 ns tùy khoảng cách). Chuỗi nhiều tầng nối tiếp chính là **đường tới hạn (critical path)** — thứ giới hạn tần số tối đa của toàn bộ thiết kế.

Hai con số này đo hai thứ khác nhau và cần cân cả hai: **số LUT** quyết định bạn tốn bao nhiêu chỗ trên chip, **số tầng** quyết định mạch chạy được nhanh đến đâu.

### Số LUT Trên Các Chip Đang Dùng

| Chip | LUT-6 | Flip-flop | Logic cell |
| :--- | :---: | :---: | :---: |
| **XC7A35T** (QMTech) | ~20.800 | ~41.600 | 33.280 |
| **XC7K325T** (AX7325B) | ~203.800 | ~407.600 | 326.080 |

Để so sánh: chip FPGA đầu tiên XC2064 năm 1985 chỉ có 800 cổng logic.

Dự án #2 ở mục tiếp theo dùng đúng **1 LUT** trong số hơn hai mươi nghìn LUT của XC7A35T.

---

## 6. Dự Án #2: Thắp Sáng Đèn LED Bằng Cổng Logic (Project #2: Lighting an LED with Logic Gates)

Trong dự án này, bạn sẽ áp dụng kiến thức về đại số Boolean và bảng tra LUT để biến toàn bộ chip FPGA thành một **cổng AND duy nhất**: Đèn LED D1 chỉ phát sáng khi hai nút nhấn SW1 và SW2 được bấm đồng thời.

```
+-------------------------------------------------------------+
|                      FPGA Development Board                 |
|                                                             |
|  SW1 (Nút 1) ---\                                           |
|                  ===> [ LUT lập trình Cổng AND ] ===> LED D1|
|  SW2 (Nút 2) ---/                                           |
+-------------------------------------------------------------+
```

#### Bảng Chân Lý Cho Dự Án #2:

| Nút SW1 (Đầu vào 1) | Nút SW2 (Đầu vào 2) | Đèn LED D1 (Đầu ra Q) |
| :---: | :---: | :---: |
| 0 (Không nhấn) | 0 (Không nhấn) | **0 (Tắt)** |
| 0 (Không nhấn) | 1 (Nhấn SW2) | **0 (Tắt)** |
| 1 (Nhấn SW1) | 0 (Không nhấn) | **0 (Tắt)** |
| **1 (Nhấn SW1)** | **1 (Nhấn SW2)** | **1 (SÁNG)** |

---

### A. Viết Mã Nguồn (Writing the Code)

Tạo một tệp mã nguồn mới và gõ đoạn mã dưới đây:

#### Mã nguồn Verilog (`Logic_Gates_Project.v`):
```verilog
module Logic_Gates_Project (
  input  i_Switch_1,
  input  i_Switch_2,
  output o_LED_1
);

  // Thực hiện phép toán AND giữa 2 đầu vào nút nhấn và gán cho đầu ra LED
  assign o_LED_1 = i_Switch_1 & i_Switch_2;

endmodule
```

#### Mã nguồn VHDL (`Logic_Gates_Project.vhd`):
```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity Logic_Gates_Project is
  port (
    i_Switch_1 : in  std_logic;
    i_Switch_2 : in  std_logic;
    o_LED_1    : out std_logic
  );
end entity Logic_Gates_Project;

architecture RTL of Logic_Gates_Project is
begin

  -- Thực hiện phép toán AND giữa 2 đầu vào nút nhấn và gán cho đầu ra LED
  o_LED_1 <= i_Switch_1 and i_Switch_2;

end architecture RTL;
```

#### Phân Tích Mã Nguồn:

* Trong Verilog, toán tử `&` đại diện cho phép toán AND giữa hai tín hiệu nhị phân. Toán tử gán `assign` tạo ra kết nối tổ hợp trực tiếp từ kết quả phép AND ra chân `o_LED_1`.
* Trong VHDL, từ khóa `and` được dùng trực tiếp giữa hai tín hiệu kiểu `std_logic`, và toán tử gán `<=` chuyển kết quả ra chân đầu ra.

---

### B. Thêm Tệp Ràng Buộc Chân Vật Lý (`.pcf`)

Tệp ràng buộc chân ánh xạ các tín hiệu trong mã nguồn với số chân vật lý trên bo mạch (ví dụ cho Nandland Go Board):

```text
# Physical Constraints File (.pcf)
set_io i_Switch_1 53
set_io i_Switch_2 51
set_io o_LED_1    56
```

---

### C. Biên Dịch và Phân Tích Báo Cáo Tổng Hợp (Build & Synthesis Report)

Mở **iCEcube2**, tạo dự án mới, thêm tệp mã nguồn và tệp `.pcf`, sau đó chọn **Tool → Run All**. 

Sau khi biên dịch thành công, hãy mở **Synthesis Report** để xem kết quả tiêu tốn tài nguyên phần cứng:

```text
--- Resource Utilization Report for iCE40 HX1K ---

Number of IOs used:     3
Number of LUT4s used:   1 (0%)
```

#### Phân Tích Kết Quả:

1. **Number of IOs used = 3:** Công cụ xác nhận đã sử dụng 3 chân cắm vật lý (2 chân đầu vào cho `i_Switch_1`, `i_Switch_2` và 1 chân đầu ra cho `o_LED_1`).
2. **Number of LUT4s used = 1 (0%):** Công cụ tổng hợp đã biên dịch phép toán `&` / `and` thành đúng **1 Bảng tra 4 đầu vào (LUT4)**. Con số `(0%)` hiển thị vì chip iCE40 HX1K có tới **1,280 LUT4**, và việc dùng 1 LUT4 chỉ chiếm `1/1280 = 0,078%`, được phần mềm làm tròn xuống `0%`.

---

### D. Nạp Chip và Thử Nghiệm

1. Mở **Diamond Programmer**, chọn tệp `.bin` vừa xuất ra từ iCEcube2.
2. Nạp chương trình vào bo mạch phát triển qua cáp USB.
3. **Thử nghiệm:**
   * Nhấn riêng lẻ Nút 1 → Đèn LED D1 vẫn TẮT.
   * Nhấn riêng lẻ Nút 2 → Đèn LED D1 vẫn TẮT.
   * **Nhấn đồng thời cả Nút 1 và Nút 2** → Đèn LED D1 **SÁNG LÊN**!

#### Thử Nghiệm Mở Rộng:
Bạn có thể dễ dàng sửa mã nguồn để thử nghiệm các cổng logic khác:

* **Cổng OR:** Thay `&` bằng `|` (Verilog) hoặc `or` (VHDL) → Bấm 1 trong 2 nút là LED sáng.
* **Cổng XOR:** Thay `&` bằng `^` (Verilog) hoặc `xor` (VHDL) → Chỉ bấm duy nhất 1 nút thì LED sáng, bấm cả 2 nút thì LED tắt.

---

### E. Làm Dự Án Này Trên QMTech XC7A35T

Có một trở ngại thực tế: dự án cần **hai nút nhấn** để tạo cổng AND, nhưng core board QMTech chỉ có **một nút người dùng** (SW2 ở chân K5). Nút còn lại trên bo là `PROG_B`, dùng để nạp lại cấu hình chứ không đọc được từ thiết kế.

Bạn có ba lựa chọn:

1. **Mô phỏng bằng GHDL** thay vì nạp lên bo mạch. Đây là cách moa khuyên, và lý do nằm ở mục sau.
2. **Gắn daughterboard** của QMTech nếu nó có thêm nút nhấn.
3. **Nối nút ngoài** qua hai hàng header 64 chân trên core board.

#### Vì Sao Mô Phỏng Lại Tốt Hơn Ở Bài Này

Bấm nút bằng tay chỉ kiểm được vài tổ hợp, và bạn phải tự nhìn đèn rồi tự kết luận. Mô phỏng thì quét được **toàn bộ bảng chân lý** và tự so với kết quả mong đợi.

Với cổng AND 2 đầu vào, bảng chân lý có đúng 4 hàng — testbench phủ được 100%. Đó là thứ bấm nút không làm nổi.

Quy trình bốn lệnh:

```bash
ghdl -a logic_gates_project.vhd tb_logic_gates.vhd
ghdl -e tb_logic_gates
ghdl -r tb_logic_gates
```

Testbench tự kiểm (self-checking) cho bài này sẽ gán lần lượt 4 tổ hợp `00`, `01`, `10`, `11` vào hai đầu vào, và dùng `assert` để xác nhận đầu ra đúng với bảng chân lý. Chạy xong in ra PASS hoặc chỉ rõ tổ hợp nào sai.

Chủ đề testbench được trình bày đầy đủ ở Chương 5.

#### Đối Chiếu Báo Cáo Tài Nguyên Trên Vivado

Mục C ở trên đọc Synthesis Report của iCEcube2 với chip iCE40 HX1K. Trên Vivado quy trình tương đương như sau: sau khi chạy **Run Synthesis**, bạn mở **Reports → Report Utilization**, hoặc nhìn ngay khung **Project Summary**.

Bảng kết quả mong đợi cho dự án này trên XC7A35T:

| Tài nguyên | Dùng | Có sẵn |
| :--- | :---: | :---: |
| LUT | **1** | ~20.800 |
| Flip-flop | 0 | ~41.600 |
| IO | 3 | (tùy gói chip) |

Ba điểm đáng rút ra từ bảng này:

* **LUT = 1.** Trình tổng hợp đã gói toàn bộ phép AND vào đúng một bảng tra, giống hệt kết luận của sách với LUT4 trên iCE40. Chỉ khác là LUT của Xilinx có 6 đầu vào thay vì 4, nên bốn đầu vào còn lại bị bỏ trống.
* **Flip-flop = 0.** Thiết kế hoàn toàn là logic tổ hợp, không có gì cần ghi nhớ. Chương 4 sẽ bàn về linh kiện ngược lại.
* **IO = 3.** Hai chân vào cho nút, một chân ra cho đèn — khớp với số port trong entity.

Số chân IO khả dụng phụ thuộc vào **kiểu đóng gói** chứ không phải mã chip: cùng con XC7A35T nhưng gói CSG324 và gói FTG256 cho số chân khác hẳn nhau. Con số chính xác bạn đọc ngay trong báo cáo của Vivado, hoặc tra bảng package trong datasheet DS181 của dòng Artix-7.

---

## 7. Tóm Tắt Chương (Summary)

Trong chương này, bạn đã tìm hiểu về viên gạch nền tảng đầu tiên của FPGA: **Bảng tra Look-Up Table (LUT)**. Bạn đã nắm vững:

* Cách đại số Boolean biểu diễn logic số qua các số 0 và 1 (tương ứng với mức điện áp 0V và Điện áp lõi).
* Bảng chân lý và ký hiệu của các cổng logic chuẩn: AND, OR, NOT, XOR, NAND.
* Cách kết hợp nhiều cổng logic thành phương trình Boolean và thứ tự ưu tiên thực hiện phép toán.
* Lý do trình tổng hợp (Synthesis tool) tự động tối ưu hóa logic mà bạn không cần phải rút gọn bằng tay.
* Bản chất của **LUT** — phần cứng vạn năng có thể nạp bất kỳ bảng chân lý nào để thay thế các cổng logic rời rạc.
* Thực hành Dự án #2 biến FPGA thành cổng AND bằng 1 LUT4 duy nhất.

Thêm vào đó, từ góc độ thực hành với Vivado và chip Artix-7:

* **Toán tử logic trong VHDL** là bảy từ khóa `and`, `or`, `not`, `xor`, `nand`, `nor`, `xnor`. Verilog dùng ký hiệu `&`, `|`, `~`, `^` vay mượn từ C.
* **VHDL không áp dụng thứ tự ưu tiên của đại số Boolean.** Sáu toán tử nhị phân nằm cùng một mức, trộn hai loại khác nhau mà không có ngoặc là lỗi cú pháp — viết `(a and b) or c` chứ không viết `a and b or c`. Riêng `not` ở mức cao hơn nên không cần ngoặc, còn `nand` và `nor` thậm chí không lặp lại chính nó được vì chúng không có tính kết hợp.
* **Bên trong LUT-6 là 64 ô nhớ SRAM cộng một cây MUX.** Sáu đầu vào đóng vai địa chỉ, giá trị ô nhớ tại địa chỉ đó là đầu ra. LUT không tính toán, nó tra bảng.
* **Dùng 2 đầu vào hay 6 đầu vào đều tốn trọn một LUT.** Nhồi thêm logic vào cùng một LUT là miễn phí, miễn tổng số biến không quá 6.
* **Hàm nhiều hơn 6 biến phải ghép nhiều tầng LUT.** Số LUT quyết định diện tích chiếm trên chip; số tầng quyết định tốc độ tối đa, vì chuỗi tầng nối tiếp chính là đường tới hạn.
* **XC7A35T có khoảng 20.800 LUT-6**, XC7K325T có khoảng 203.800. Dự án #2 dùng đúng một cái.
* **Core board QMTech chỉ có một nút nhấn**, không đủ cho cổng AND hai đầu vào. Nên mô phỏng bằng GHDL — và cách đó còn tốt hơn vì quét được trọn vẹn bảng chân lý bốn hàng, thay vì bấm tay vài tổ hợp.

---

💡 Trong chương tiếp theo (**Chương 4: Lưu Trữ Trạng Thái Bằng Flip-Flop**), chúng ta sẽ khám phá viên gạch nền tảng quan trọng thứ hai của FPGA: **Flip-Flop** — linh kiện mang lại khả năng ghi nhớ dữ liệu và khái niệm thời gian cho FPGA!
