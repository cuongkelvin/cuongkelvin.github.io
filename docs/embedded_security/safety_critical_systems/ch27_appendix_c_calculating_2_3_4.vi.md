<a id="p335"></a>

<a id="appC"></a>

# C Tính (2+3)+4

DOI: [10.1201/9781003598145-27](https://doi.org/10.1201/9781003598145-27)

> *Nhưng ta vẫn sẽ làm cho sự bảo đảm thêm chắc chắn gấp đôi*
>
> William Shakespeare (Macbeth)

## C.1 Giới thiệu

Coded processing được mô tả trong [Mục 13.4.2.2](ch13_replication_and_diversification.vi.md#sec13_4_2_2). Phụ lục này đưa ra một ví dụ về cách kỹ thuật này có thể được áp dụng cho một phép tính phức tạp. Chúng ta sẽ giả định rằng đoạn code đang xét như sau (trong đó *a,b* và *c* đều là số nguyên và số học số nguyên có thể được thực hiện với độ chính xác bất kỳ):

```
a = b + c;
x = a + y;
```

Chúng ta sẽ giả định rằng, khi đi vào đoạn code này, $a = 17 , b = 2 , c = 3 , x = 23$ và $y = 4$. Chúng ta giả định rằng *a* và *x* đã được đặt bởi các phép tính trước đó. Vậy, chúng ta đang yêu cầu máy tính tính $x = ( 2 + 3 ) + 4$.

## C.2 Các lỗi cần được phát hiện

Coded processing được thiết kế để phát hiện ba loại lỗi:

1. AN code: phát hiện các thao tác sai và bit flip trong toán hạng.

   Ví dụ, một phép cộng bị đổi thành phép nhân do một bit flip trong instruction memory.

2. ANB code: còn phát hiện một bit flip trên bus địa chỉ khiến bộ xử lý lấy sai toán hạng.

   Ví dụ $\; a = b + c \;$ trở thành $\; a = d + c \;$ vì một lỗi định địa chỉ khiến chúng ta lấy *d* thay vì *b*.

3. ANBDmem code: còn phát hiện một bit flip trên bus địa chỉ khi lưu một giá trị, cho phép một giá trị cũ bị lấy ra.

   Ví dụ, $x = a + y$ lấy ra một giá trị cũ của *a* vì phép tính *a* trước đó đã được lưu sai vị trí.

## C.3 Phép tính

### C.3.1 Số học thông thường

Mặc dù không bắt buộc, sẽ thuận tiện nếu thực hiện phép tính bằng số học thông thường. Trong trường hợp này, chúng ta thấy rằng sau hai instruction:

$a = 2 + 3 = 5$

$x = 5 + 4 = 9$

Vậy chúng ta ngờ rằng câu trả lời cuối cùng là 9, nhưng chúng ta cần xác nhận điều đó.

### C.3.2 Coded processing

Như được mô tả trong [Mục 13.4.2](ch13_replication_and_diversification.vi.md#sec13_4_2), coded processing đòi hỏi chọn một giá trị *A*, thường là một số nguyên tố lớn. Theo bài báo của Hoffmann được tham chiếu trong [Chương 13](ch13_replication_and_diversification.vi.md), chúng ta sẽ giả định rằng $A = 58 \text{ } 659$ (không phải số nguyên tố). Điều này có nghĩa là xác suất chúng ta không phát hiện được một lỗi trong mỗi phép tính là $≈ \frac{1}{58 \; 659} ≈ 0 , 000 \; 017 \; 05$. Chúng ta phải tính đến điều này trong failure analysis, nhưng đó là một con số rất nhỏ.

Chúng ta cũng cần các số duy nhất gắn với *a,b,c,x* và *y* trong phương trình 13.2 ở trang 150. Chúng có thể được rút ra từ địa chỉ của chúng trong memory và chúng ta sẽ giả định rằng chúng là:

|  |  |  |  |  |
|---|---|---|---|---|
| ${B}_{a} = 354$ | ${B}_{b} = 735$ | ${B}_{c} = 129$ | ${B}_{x} = 824$ | ${B}_{y} = 116$ |

Giá trị hiện tại của *D* sẽ được giả định là 652, trước đó nó là 651 khi *a* và *x* được tính.

Với các giá trị này, chúng ta có thể tính các giá trị mã hóa của *b* và *c* cho phép tính đầu tiên:

${b}_{c} = A \times b + {B}_{b} + D = 58 \; 659 \times 2 + 735 + 652 = 118 \; 705$

${c}_{c} = A \times c + {B}_{c} + D = 58 \; 659 \times 3 + 129 + 652 = 176 \; 758$

Vì vậy, các giá trị tại thời điểm này như sau:

| Biến | Giá trị | Giá trị mã hóa | B | D khi mã hóa |
|---|---|---|---|---|
| a | 17 | 998 208 | 354 | 651 |
| b | 2 | 118 705 | 735 | 652 |
| c | 3 | 176 758 | 129 | 652 |
| x | 23 | 1 350 632 | 824 | 651 |
| y | 4 | 235 403 | 116 | 651 |

Với các giá trị mã hóa này của *b* và *c*, chúng ta có thể tính giá trị mã hóa của *a*:

$$\begin{array}{lll} {a}_{c} & = & {b}_{c} ⊕ {c}_{c} \\ & = & 118 \; 705 ⊕ 176 \; 758 \\ & = & 118 \; 705 + 176 \; 758 + ( 354 - 735 - 129 ) - 652 \\ & = & 294 \; 301 \end{array}$$

Phép kiểm tra đầu tiên cần thực hiện là $( {a}_{c} - {B}_{a} - D ) \; \; m o d \; \; A = 0$. Trong trường hợp này

$${a}_{c} - {B}_{a} - D = 294 \; 301 - 354 - 652 = 293 \; 295 = A \times 5$$

và vì vậy điều đó được xác nhận.

Nếu chúng ta cần giá trị trung gian của *a*, thì chúng ta có thể rút nó ra từ giá trị mã hóa bằng phép tính ở trên: nó bằng 5. Vì vậy, chúng ta có thể tin chắc rằng $2 + 3 = 5$. Tuy nhiên, nếu chúng ta không cần phiên bản đã giải mã của *a* thì có thể để nó ở dạng mã hóa cho phép tính tiếp theo (miễn là chúng ta không tăng D).

Tại thời điểm này, giả sử rằng, do một lỗi memory, chúng ta lấy ra giá trị cũ của *a* (giá trị 17, giá trị mã hóa 998 208) thay vì giá trị mới của nó và cộng nó với *y*. Trong trường hợp đó, giá trị mã hóa của *x* sẽ là 1 233 314 và ${x}_{c} - {B}_{a} - D$ không phải là bội số của *A*: lỗi đã được phát hiện!

Giả sử chúng ta lấy đúng giá trị của *a* (không có lỗi memory):

${a}_{c} = 294 \; 301$

${y}_{c} = A \times y + {B}_{y} + D = 58 \; 659 \times 4 + 116 + 652 = 235 \; 404$

Với các giá trị mã hóa này của *a* và *y*, chúng ta có thể tính giá trị mã hóa của *x*:

$$\begin{array}{lll} {x}_{c} & = & {a}_{c} ⊕ {y}_{c} \\ & = & 294 \; 301 ⊕ 235 \; 404 \\ & = & 294 \; 301 + 235 \; 404 + ( 824 - 354 - 116 ) - 652 \\ & = & 529 \; 407 \end{array}$$

Chúng ta cần kiểm chứng rằng $( {x}_{c} - {B}_{x} - D ) \; \; m o d \; \; A = 0$. Trong trường hợp này

$${x}_{c} - {B}_{x} - D = 529 \; 407 - 824 - 652 = 527 \; 931 = A \times 9$$

và vì vậy điều đó được xác nhận. Giờ chúng ta có thể tin chắc $≈ 99 , 998$ % rằng giá trị đúng của *x* sau khi hai phép tính đã được thực hiện là 9.

> Giai thoại 39 *Khi tôi viết phụ lục này, tôi đã mắc một lỗi trong các phép tính (thủ công). Coded processing đã nhận ra lỗi của tôi (tôi không nhận được một giá trị đã giải mã là bội số của A) nên tôi biết mình phải tính lại.*
