# <a id="Page_501"></a>PHỤ LỤC B Tài liệu tham khảo một phần instruction x64

Tùy theo cách bạn đếm, architecture x64 giờ có hơn 1,000 machine instruction. Đừng hoảng sợ: rất nhiều machine instruction trong số đó có thể chỉ được hệ điều hành dùng ở protected mode. Một số lượng lớn trong số chúng triển khai toán floating-point, thứ mà vì lý do chỗ trang tôi không thể trình bày trong cuốn sách này. Khá nhiều cái được chuyên biệt hóa cao cho những việc như mã hóa và giải mã nhanh.

Trong phụ lục này, tôi sẽ trình bày những bản tóm tắt ngắn về các machine instruction thông dụng nhất, những instruction mà bạn có khả năng dùng nhiều nhất khi còn là người mới bắt đầu viết các chương trình userspace. Nếu bạn muốn một tài liệu tham khảo instruction đầy đủ hơn (và hoàn toàn có thẩm quyền), hãy xem tài liệu instruction set của Intel:

`https://software.intel.com/en-us/download/intel-64-and-ia-32-architectures-sdm-combined-volumes-1-2a-2b-2c-2d-3a-3b-3c-3d-and-4`

Hãy dự tính dành chút thời gian với nó: file PDF dài 5,060 trang.

Hoặc nếu điều đó quá sức (đúng là vậy), có thể tìm thấy một bản chắt lọc hữu ích trên web của tài liệu Intel ở đây:

`www.felixcloutier.com/x86/index.html`

Site này về cơ bản cho phép bạn nhấp quanh và tìm các instruction bạn đang tìm và giúp bạn khỏi phải tải về và lục lọi trong một tài liệu khổng lồ duy nhất.

<a id="Page_502"></a>

<a id="head-2-9"></a>

## Những gì đã bị loại khỏi x64

Trong quá trình tiến hóa của các CPU x86, các instruction đã được thêm vào và loại bỏ qua mỗi thế hệ. Hầu hết chúng khá bí hiểm, nhưng có vài instruction mà bạn có thể đã học khi là người mới bắt đầu trong kỷ nguyên 32-bit mà giờ không còn khả dụng. Hầu hết những instruction now-obsolete này có từ những bản triển khai x86 sớm nhất. Sau đây là những instruction phổ biến nhất:

- Các instruction toán BCD: `AAA`, `AAS`, `AAD`, `AAM`, `DAA` và `DAS`. Những instruction này đã không cần thiết trong nhiều thập kỷ, và chúng chiếm chỗ quý giá trong việc mã hóa instruction binary.
- Các instruction push-all và pop-all: `PUSHA`, `POPA`, `PUSHAD` và `POPAD`. Giờ có 16 register general-purpose, mỗi register có kích thước 8 byte. Đó là rất nhiều dữ liệu để di chuyển cùng một lúc. Giờ các register phải được push và pop riêng lẻ.
- Instruction `JCXZ`, nhảy khi CX=0. Đây là một instruction 16-bit cổ xưa. Chức năng của nó giờ được chia sẻ bởi `JRCXZ` (nhảy khi RCX=0) và `JECXZ` (nhảy khi ECX=0.)
- Instruction `PUSHFD`, push register `EFLAGS` lên stack. Giờ hãy dùng `PUSHFQ`, push register `RFLAGS` lên stack.
- Instruction `POPFD`, pop một double word (32 bit) từ đỉnh stack vào register `EFLAGS`. Công việc của nó giờ được thực hiện bằng `POPFQ`, pop một quadword (64 bit) từ đỉnh stack vào register `RFLAGS`.

<a id="head-2-10"></a>

## Kết quả flag

Mỗi instruction có một bản tóm tắt flag trông như thế này. Các dấu sao có mặt sẽ thay đổi tùy instruction:

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
*   ? ? * * * * *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

Chín flag quan trọng nhất đều được biểu diễn ở đây. Một dấu sao cho biết instruction trên trang đó ảnh hưởng đến flag đó. Một khoảng trống bên dưới tiêu đề flag có nghĩa là instruction không ảnh hưởng đến flag đó theo bất kỳ cách nào. Nếu một flag bị ảnh hưởng theo một cách được định nghĩa, nó sẽ bị ảnh hưởng theo các quy tắc sau:

- **OF:** Được set nếu kết quả quá lớn để vừa với destination operand.
- **DF:** Được set bởi `STD`; được clear bởi `CLD`.
- <a id="Page_503"></a>**IF:** Được set bởi `STI`; được clear bởi `CLI`. Không được dùng trong lập trình userspace và có thể bỏ qua.
- **TF:** Dành cho debugger; không được dùng trong lập trình userspace và có thể bỏ qua.
- **SF:** Được set khi dấu của kết quả buộc destination operand trở thành âm.
- **ZF:** Được set nếu kết quả của một phép toán bằng không. Nếu kết quả khác không, ZF bị clear.
- **AF:** Auxiliary carry được dùng cho toán BCD 4-bit. Được set khi một phép toán gây ra một carry ra khỏi một đại lượng BCD 4-bit. Không được dùng trong công việc x64, vì các instruction BCD không còn khả dụng trong các CPU x64.
- **PF:** Được set nếu số bit 1 trong byte thấp của kết quả là chẵn; bị clear nếu số bit 1 trong byte thấp của kết quả là lẻ. Được dùng trong các ứng dụng truyền thông dữ liệu nhưng ít dùng cho việc khác.
- **CF:** Được set nếu kết quả của một phép cộng hay phép shift mang một bit ra ngoài destination operand; ngược lại thì bị clear. Có thể được set thủ công bằng `STC` và được clear thủ công bằng `CLC` khi CF phải ở một trạng thái biết trước trước khi một phép toán bắt đầu.

Một số instruction buộc một số flag nhất định trở thành không xác định. Những flag này được chỉ ra bằng một dấu chấm hỏi bên dưới tiêu đề flag. “Không xác định” có nghĩa là *đừng trông cậy vào việc nó ở bất kỳ trạng thái cụ thể nào*. Cho đến khi bạn biết rằng một flag ở trạng thái không xác định đã chuyển sang một trạng thái xác định nhờ hành động của một instruction khác, đừng kiểm tra hay dùng trạng thái của flag theo bất kỳ cách nào khác.

Để có một hình thể hiện chi tiết mọi flag, hãy xem [Hình 7.2](ch07_following_your_instructions.vi.md#c07-fig-0002) trong [Chương 7](ch07_following_your_instructions.vi.md).

<a id="head-2-11"></a>

## Size specifier

Có một vấn đề vốn có trong việc truy cập memory data từ assembly language: instruction đang xét tác động lên bao nhiêu memory data? Giả sử bạn muốn tăng một vị trí trong memory:

```
inc [rdi+4]
```

Vậy bạn đang tăng một byte, một word, một double-word hay một quadword? Từ instruction như được viết, không có cách nào biết được, và NASM sẽ bắt lỗi bạn. Nhưng có một lối thoát dễ dàng. NASM nhận biết một số *size specifier*, khi được dùng với memory data sẽ cho NASM biết kích thước của phép toán. Đó là `BYTE`, `WORD`, `DWORD` và `QWORD`. Chúng lần lượt chỉ định kích thước dữ liệu là 8, 16, 32 và 64 byte. Specifier `BYTE` sẽ coi một lần truy cập memory là một đại lượng 8-bit, và tương tự với những cái khác. Instruction INC không đúng có thể được sửa bằng cách thêm một size specifier thích hợp:

```
inc qword [rdi+4]
```

Giờ chúng ta biết rằng chúng ta đang tăng một giá trị 64-bit bắt đầu tại effective address RDI+4. Quy tắc này áp dụng cho mọi instruction x64 chỉ nhận một operand duy nhất: `INC`, `DEC`, `NOT`, `NEG`, `SHR`, `SHL`, `ROR` và `ROL`. Khi bạn đang tác động lên memory, bạn cần một size specifier.

Với các instruction nhận hai operand, vấn đề tinh tế hơn. Trong bất kỳ dạng nào của một instruction two-operand trong đó một operand là một lần truy cập memory và operand kia là một register, NASM suy ra kích thước của lần truy cập từ kích thước của register. Ví dụ:

```
mov [rdi+rbx*8],rcx
```

Ở đây, NASM thấy register 64-bit RCX và do đó di chuyển 64 bit trong RCX từ RCX tới 8 byte bắt đầu tại `[RDI+RBX*8]`. Có thể dùng bất kỳ effective address hợp lệ nào. Điều tương tự cũng đúng với các dạng instruction di chuyển dữ liệu từ memory vào một register:

```
mov r15,[rbp]
```

Vì R15 là một register 64-bit, NASM biết phải di chuyển 8 byte bắt đầu tại `[RBP]` vào R15. Không cần thả vào một size specifier, mặc dù có một size specifier không cần thiết không phải lúc nào cũng là một error.

Trường hợp duy nhất khác mà size specifier là bắt buộc là khi một operand nằm trong memory và operand kia là một hằng số literal:

```
mov word [rdi],42
```

Dạng này sao chép giá trị 42 vào một word (hai byte) memory bắt đầu tại address trong RDI. Dĩ nhiên, một hằng số literal không thể là destination operand, vì vậy trong những dạng instruction như vậy, hằng số literal phải *luôn* là source operand.

Để tiết kiệm chỗ, tôi không cố giải thích điều này trên trang của mọi instruction trong tài liệu tham khảo này. Điều bạn nên làm là nhìn chằm chằm vào dạng của một instruction và tự hỏi, *thứ gì ở đây cho NASM biết kích thước của lần truy cập memory?* Nếu có một register làm một trong hai operand, điều đó cho NASM biết lần truy cập có kích thước của register. Nếu source operand là một hằng số literal, hoặc nếu operand duy nhất là một tham chiếu memory, bạn cần một size specifier. Và nếu bạn đoán sai và không thêm size specifier ở chỗ cần, NASM sẽ cho bạn biết.

<a id="head-2-12"></a>

## Chỉ mục instruction

| INSTRUCTION | TRANG THAM KHẢO | TRANG VĂN BẢN | CPU |
|---|---|---|---|
|  |  |  |  |
| ADC |  |  |  |
| ADD |  |  |  |
| AND |  |  |  |
| BT |  |  | 386+ |
| CALL |  |  |  |
| CLC |  | Chỉ ở đây |  |
| CLD |  |  |  |
| CMP |  |  |  |
| DEC |  |  |  |
| INC |  |  |  |
| INT |  |  |  |
| IRET |  |  |  |
| J? |  |  |  |
| JECXZ |  |  | x64+ |
| JMP |  |  |  |
| JRCXZ |  |  | x64+ |
| LEA |  |  |  |
| LOOP |  |  |  |
| LOOPNZ/LOOPNE |  |  |  |
| LOOPZ/LOOPE |  |  |  |
| MOV |  |  |  |
| MUL |  |  |  |
| NEG |  |  |  |
| NOP |  | Chỉ ở đây |  |
| NOT |  |  |  |
| OR |  |  |  |
| POP |  |  |  |
| POPF |  |  |  |
| POPFQ |  |  | x64+ |
| PUSH |  |  |  |
| PUSHF |  |  |  |
| PUSHFQ |  |  | x64+ |
| RET |  |  |  |
| ROL |  |  |  |
| ROR |  |  |  |
| SBB |  | Chỉ ở đây |  |
| SHL |  |  |  |
| SHR |  |  |  |
| STC |  | Chỉ ở đây |  |
| STD |  |  |  |
| STOS |  |  |  |
| SUB |  |  |  |
| SYSCALL |  |  | x64+ |
| XCHG |  |  |  |
| XLAT |  |  |  |
| XOR |  |  |  |

<a id="Page_507"></a>

<a id="head-2-13"></a>

## ADC: Cộng số học có carry

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
*       * * * * *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
ADC r/m8,i8
ADC r/m16,i16
ADC r/m32,i32      386+
ADC r/m64,i32      x64+   NOTE: ADC r/m64X,i64 is NOT valid!
ADC r/m8,r8
ADC r/m16,r16
ADC r/m32,r32      386+
ADC r/m64,r64      x64+
ADC r/m16,i8
ADC r/m32,i8
ADC r/m64,i8       x64+
ADC r8,r/m8
ADC r16,r/m16
ADC r32,r/m32      386+
ADC r64,r/m64      x64+
ADC AL,i8
ADC AX,i16
ADC EAX,i32        386+
ADC RAX,i32        x64+   NOTE: ADC RAX,i64 is NOT valid!
```

### Ví dụ

```
ADC BX,DI
ADC EAX,5
ADC AX,0FFFFH
ADC AL,42H
ADC RBP,17H
ADC QWORD [RBX+RSI+Inset],5
```

### Ghi chú

`ADC` cộng source operand và Carry flag vào destination operand, và sau phép toán, kết quả thay thế destination operand. Phép cộng là một phép cộng số học, và carry cho phép các phép cộng multiple-precision qua vài register hay vị trí memory. (Để cộng mà không tính đến Carry flag, hãy dùng instruction `ADD`.) Mọi flag bị ảnh hưởng đều được set theo phép toán. Quan trọng nhất, nếu kết quả không vừa với destination operand, Carry flag được set thành 1.

<a id="Page_509"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-14"></a>

## ADD: Cộng số học

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
*       * * * * *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
ADD r/m8,i8
ADD r/m16,i16
ADD r/m32,i32       386+
ADD r/m64,i32       x64+  NOTE: ADD r/m64,i64 is NOT valid!
ADD r/m16,i8
ADD r/m32,i8        386+
ADD r/m64,i8        x64+
ADD r/m8,r8
ADD r/m16,r16
ADD r/m32,r32       386+
ADD r/m64,r64       x64+
ADD r8,r/m8
ADD r16,r/m16
ADD r32,r/m32       386+
ADD r64,r/m64       x64+
ADD AL,i8
ADD AX,i16
ADD EAX,i32         386+
ADD RAX,i32         x64+  NOTE: ADD RAX,i64 is NOT valid!
```

### Ví dụ

```
ADD BX,DI
ADD AX,0FFFFH
ADD AL,42H
ADD [EDI],EAX
AND QWORD [RAX],7BH
```

### Ghi chú

`ADD` cộng source operand vào destination operand, và sau phép toán, kết quả thay thế destination operand. Phép cộng là một phép cộng số học và *không* tính đến Carry flag. (Để cộng có dùng Carry flag, hãy dùng instruction `ADC` Add with Carry.) Mọi flag bị ảnh hưởng đều được set theo phép toán. Quan trọng nhất, nếu kết quả không vừa với destination operand, Carry flag được set thành 1.

<a id="Page_511"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-15"></a>

## AND: AND logic

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
*       * * ? * *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
AND r/m8,i8
AND r/m16,i16
AND r/m32,i32      386+
AND r/m64,i32      x64+   NOTE: AND r/m64,i64 is NOT valid!
AND r/m16,i8
AND r/m32,i8       386+
AND r/m64,i8       x64+
AND r/m8,r8
AND r/m16,r16
AND r/m32,r32      386+
AND r/m64,r64      x64+
AND r8,r/m8
AND r16,r/m16
AND r32,r/m32      386+
AND r64,r/m64      x64+
AND AL,i8
AND AX,i16
AND EAX,i32        386+
AND RAX,i32        x64+ NOTE: AND RAX,i64 is NOT valid!
```

### Ví dụ

```
AND BX,DI
AND EAX,5
AND AX,0FFFFH
AND AL,42H
AND [BP+SI],DX
AND QWORD [RDI],42
AND QWORD [RBX],0B80000H
```

### Ghi chú

`AND` thực hiện phép toán logic AND trên hai operand của nó. Một khi phép toán hoàn tất, kết quả thay thế destination operand. AND được thực hiện trên cơ sở bit-by-bit, sao cho bit 0 của nguồn được AND với bit 0 của đích, bit 1 của nguồn được AND với bit 1 của đích, và cứ thế. Phép toán AND cho ra 1 nếu *cả hai* operand đều là 1; và 0 chỉ khi *một trong hai* operand là 0. Lưu ý rằng phép toán làm cho Auxiliary carry flag trở thành không xác định. CF và OF bị clear về 0, và các flag bị ảnh hưởng khác được set theo kết quả của phép toán.

<a id="Page_513"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-16"></a>

## BT: Kiểm tra bit

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
                *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
BT r/m16,r16       386+
BT r/m32,r32       386+
BT r/m64,r64       x64+
BT r/m16,i8        386+
BT r/m32,i8        386+
BT r/m64,i8        x64+
```

### Ví dụ

```
BT AX,CX
BT EAX,EDX
BT RAX,5
BT [RAX+RDX],RCX
```

### Ghi chú

BT sao chép một bit được chỉ định duy nhất từ operand bên trái vào Carry flag, nơi nó có thể được kiểm tra hoặc được đưa trở lại vào một đại lượng bằng một trong các instruction shift/rotate. Bit nào được sao chép được chỉ định bởi operand bên phải. BT không thay đổi operand nào.

Khi operand bên phải là một giá trị immediate 8-bit, giá trị đó chỉ định số thứ tự của bit cần được sao chép. Trong `BT AX,5`, bit 5 của AX được sao chép vào CF. Khi giá trị immediate vượt quá kích thước của operand bên trái, giá trị được biểu diễn theo modulo kích thước của operand bên trái. Nghĩa là, vì không có 66 bit trong EAX, `BT EAX,66` lấy ra khỏi giá trị immediate bao nhiêu lần 32 có thể lấy, và phần còn lại là số thứ tự bit. (Ở đây là 2.) Khi operand bên phải *không phải* là một giá trị immediate, operand bên phải không chỉ chỉ định bit cần kiểm tra mà còn một offset tính từ tham chiếu memory trong operand bên trái. Điều này phức tạp và không được trình bày đầy đủ trong cuốn sách này. Hãy xem một phần thảo luận chi tiết trong một tài liệu tham khảo assembly language đầy đủ.

<a id="Page_515"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-17"></a>

## CALL: Gọi procedure

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
     <none>        IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
CALL d16           Not valid in x64
CALL d32           Not valid prior to x64
CALL r/m16         Not valid in x64
CALL r/m32         Not valid in x64
CALL r/m64         Not valid prior to x64
```

### Ví dụ

```
CALL DoSomething
CALL RAX
CALL QWORD [EBX+ECX+16]
```

### Ghi chú

`CALL` chuyển quyền điều khiển tới một address procedure. Trước khi chuyển quyền điều khiển, `CALL` push address của instruction ngay sau nó lên stack. Điều này cho phép một instruction `RET` (xem thêm) pop return address vào RIP và do đó trả quyền điều khiển về instruction ngay sau instruction `CALL`.

Ngoài `CALL` hiển nhiên tới một label được định nghĩa, `CALL` có thể chuyển quyền điều khiển tới một address trong một register general-purpose 64-bit (r64) và cũng tới một address nằm trong memory. Điều này được thể hiện trong cột Legal Forms là m64. `CALL m64` hữu ích cho việc tạo các jump table gồm các address procedure. D32 đơn giản là một displacement không dấu 32-bit được dùng trong hầu hết các lời gọi tới label procedure. Ở long mode 64-bit, một displacement d32 được sign-extended lên 64 bit.

Có vài biến thể nữa của instruction `CALL` với những điều khoản để làm việc với các cơ chế bảo vệ của hệ điều hành. Chúng không được trình bày ở đây, và để biết thêm thông tin, bạn nên xem một tài liệu nâng cao hoặc một tài liệu tham khảo assembly language đầy đủ.

<a id="Page_517"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-18"></a>

## CLC: Clear Carry Flag (CF)

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
                *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
CLC
```

### Ví dụ

```
CLC
```

### Ghi chú

`CLC` đơn giản đặt Carry flag (CF) về trạng thái bị clear (0). Hãy dùng `CLC` trong những tình huống mà Carry flag *phải* ở một trạng thái bị clear biết trước trước khi công việc bắt đầu, như khi bạn đang rotate một chuỗi word hay byte bằng các instruction rotate `RCL` và `RCR`.

<a id="Page_518"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-19"></a>

## CLD: Clear Direction Flag (DF)

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
  *                IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
CLD
```

### Ví dụ

```
CLD
```

### Ghi chú

`CLD` đơn giản đặt Direction flag (DF) về trạng thái bị clear (0). Điều này ảnh hưởng đến việc điều chỉnh được thực hiện bởi các string instruction lặp như `STOS`, `SCAS` và `MOVS`. Khi DF = 0, con trỏ đích được tăng, và được giảm khi DF = 1. DF được set thành 1 bằng instruction `STD`.

<a id="Page_519"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-20"></a>

## CMP: So sánh số học

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
*       * * * * *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
CMP r/m8,i8
CMP r/m16,i16
CMP r/m32,i32      386+
CMP r/m64,i32      x64+   NOTE: CMP RAX,i64 is NOT valid!
CMP r/m16,i8
CMP r/m32,i8       386+
CMP r/m64,i8       x64+
CMP r/m8,r8
CMP r/m16,r16
CMP r/m32,r32      386+
CMP r/m64,r64      x64+
CMP r8,r/m8
CMP r16,r/m16
CMP r32,r/m32      386+
CMP r64,r/m64      x64+
CMP AL,i8
CMP AX,i16
CMP EAX,i32        386+
CMP RAX,i32        x64+   NOTE: CMP RAX,i64 is NOT valid!
```

### Ví dụ

```
CMP RAX,5
CMP AL,19H
CMP EAX,ECX
CMP QWORD [RBX+RSI+inset],0B80000H
```

### Ghi chú

`CMP` so sánh hai phép toán của nó và set các flag để cho biết kết quả của phép so sánh. *Destination operand không bị ảnh hưởng*. Bản thân phép toán giống hệt phép trừ số học nguồn khỏi đích không có borrow (`SUB`), chỉ khác là kết quả không thay thế đích. Thông thường, `CMP` được theo sau bởi một trong các instruction conditional jump; tức là, `JE` để nhảy nếu các operand bằng nhau; `JNE` nếu chúng không bằng nhau; và cứ thế.

<a id="Page_521"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-21"></a>

## DEC: Giảm operand

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
*       * * * *    IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
DEC r/m8
DEC r/m16
DEC r/m32          386+
DEC r/m64          x64+
```

### Ví dụ

```
DEC AL
DEC AX
DEC EAX
DEC QWORD [RBX+RSI]
```

### Ghi chú

`DEC` trừ 1 khỏi operand duy nhất của nó và *không* ảnh hưởng đến Carry flag CF. Hãy cẩn thận với điều đó; một error phổ biến là cố dùng CF sau một instruction `DEC` như thể nó là `SUB`.

`DEC` tác động lên các dạng memory data *phải* được dùng với một size specifier dữ liệu như `BYTE`, `WORD`, `DWORD` và `QWORD`. Xem các ví dụ được cho ở trên.

<a id="Page_522"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-22"></a>

## DIV: Chia số nguyên không dấu

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
?       ? ? ? ? ?  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
DIV r/m8    Dividend in AX. Quotient in AL; remainder in AH.
DIV r/m16   Dividend in EAX. Quotient in AX; remainder in DX.
DIV r/m32   386+ Dividend in EAX:EDX. Quotient in EAX; remainder in EDX.
DIV r/m64   x64+ Dividend in RAX:RDX. Quotient in RAX; remainder in RDX.
```

### Ví dụ

```
DIV AL
DIV AX
DIV EAX
DIV QWORD [RDI+RSI] Don't use A or D regs in an effective address!
```

### Ghi chú

`DIV` chia số bị chia ngầm định cho số chia tường minh được chỉ định làm operand duy nhất của `DIV`. Khi chia cho các đại lượng 8-bit, số bị chia được giả định nằm trong AX. Khi chia cho các đại lượng 16-bit, 32-bit và 64-bit, số bị chia được giả định nằm trong hai register, cho phép một phạm vi tính toán lớn hơn nhiều. Phần có trọng số nhỏ nhất của số bị chia được đặt vào register “A” (AX / EAX / RAX), và phần có trọng số lớn nhất của số bị chia được đặt vào register “D” (DX / EDX / RDX). Lưu ý rằng ngay cả khi số bị chia không có phần “cao”, register “D” vẫn bị `DIV` xóa về 0 và không thể được dùng để giữ các giá trị độc lập trong khi một instruction `DIV` được thực thi. Để biết thêm về `DIV`, hãy xem phần thảo luận ở [Chương 7](ch07_following_your_instructions.vi.md) tại tr. [203].

Hãy nhớ rằng khi operand là một giá trị memory, bạn *phải* đặt một trong các type specifier `BYTE`, `WORD`, `DWORD` hoặc `QWORD` trước operand. Cũng lưu ý từ mục “Legal Forms” rằng không có dạng hợp lệ nào dùng một giá trị immediate với bất kỳ kích thước nào.

`DIV` không để lại thông tin nào trong các flag. Tuy nhiên, lưu ý rằng OF, SF, ZF, AF, PF và CF trở thành không xác định sau một instruction `DIV`.

<a id="Page_524"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-23"></a>

## INC: Tăng operand

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
*       * * * *    IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
INC r/m8
INC r/m16
INC r/m32          386+
INC r/m64          x64+
```

### Ví dụ

```
INC AL
INC EAX
INC QWORD [RBP]
INC QWORD [RBX+RSI]
```

### Ghi chú

`INC` cộng 1 vào operand duy nhất của nó và *không* ảnh hưởng đến Carry flag CF. Hãy cẩn thận với điều đó; một error phổ biến là cố dùng CF sau một instruction `INC` như thể nó là `ADD`.

`INC` tác động lên các dạng memory data *phải* được dùng với một size specifier dữ liệu như `BYTE`, `WORD`, `DWORD` và `QWORD`. Xem hai ví dụ được cho ở trên.

<a id="Page_525"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-24"></a>

## J??: Nhảy nếu điều kiện được thỏa mãn

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

|  |  |  |
|---|---|---|
| **Dạng hợp lệ** | **Mô tả** | **Nhảy nếu các flag là** |
| `JA/JNBE d8 d32` | `Jump If Above / Jump If Not Below Or Equal` | `CF=0 AND ZF=0` |
| `JAE/JNB d8 d32` | `Jump If Above Or Equal / Jump If Not Below` | ` CF=0` |
| `JB/JNAE d8 d32` | `Jump If Below / Jump If Not Above Or Equal` | ` CF=1` |
| `JBE/JNA d8 d32` | `Jump If Below Or Equal / Jump If Not Above` | ` CF=1 OR ZF=1` |
| `JC d8 d32` | `Jump If Carry; synonym for JNAE & JB` | `CF=1` |
| `JNC d8 d32` | `Jump If Not Carry` | `CF=0` |
| `JE/JZ d8 d32 ` | `Jump If Equal / Jump If Zero` | ` ZF=1` |
| `JNE/JNZ d8 d32` | `Jump If Not Equal / Jump If Not Zero ` | ` ZF=0` |
| `JG/JNLE d8 d32` | `Jump If Greater / Jump If Not Less Or Equal` | `ZF=0 AND SF=OF` |
| `JGE/JNL d8 d32` | `Jump If Greater Or Equal / Jump If Not Less` | `SF=OF` |
| `JL/JNGE d8 d32` | `Jump If Less / Jump If Not Greater Or Equal` | `SF≠OF` |
| `JLE/JNG d8 d32` | `Jump If Less Than Or Equal/Jump If Not Greater ZF=1 OR SF≠OF` |  |
| `JO d8 d32` | ` Jump If Overflow` | ` OF=1` |
| `JNO d8 d32 ` | `Jump If Not Overflow` | ` OF=0` |
| `JP/JPE d8 d32` | ` Jump If Parity Set / Jump If Parity Even` | ` PF=1` |
| `JNP/JPO d8 d32` | `Jump If Parity Cleared / Jump If Parity Odd` | `PF=0` |
| `JS d8 d32` | ` Jump If Sign Flag Set` | ` SF=1` |
| `JNS d8 d32` | ` Jump If Sign Flag Cleared` | ` SF=0` |

### Ví dụ

```
JB HalfSplit    ;Jumps if CF=1
JLE TooLow      ;Jumps if ZF=1 AND SF=OF
JG NEAR WayOut  ;Jumps to a 32-bit displacement in 32-bit and
                ; 64-bit protected modes
```

### Ghi chú

Theo mặc định, mọi instruction này thực hiện một short jump d8 (127 byte về phía trước hoặc 128 byte về phía sau) nếu một điều kiện nào đó đúng, hoặc rơi xuống nếu điều kiện không đúng. Mọi dạng hợp lệ cũng hỗ trợ một displacement 32-bit (d32) để thực hiện một jump tới bất cứ đâu trong code segment. Hầu hết các instruction jump này cũng có thể nhận một displacement 16-bit, nhưng *không* ở protected mode 64-bit. Tôi đã bỏ các thẻ d16 để làm cho bảng đơn giản hơn. Để dùng một displacement 32-bit, bạn phải đặt sau instruction conditional jump từ hạn định `NEAR`, từ này bảo assembler dùng một displacement 32-bit khi sinh code binary. Hãy nhớ rằng không có displacement 64-bit.

Các điều kiện đều liên quan đến flag, và các điều kiện flag đang xét được cho ở bên phải mnemonic và phần mô tả của nó, dưới tiêu đề “Jump If Flags Are.”

Thường có hai từ đồng nghĩa cho một conditional jump duy nhất. Ví dụ, `JE` và `JZ` là cùng một instruction, có nghĩa là Jump if ZF is set. Các từ đồng nghĩa có ở đó để giúp bạn hiểu code: nhảy nếu phép so sánh trước đó cho thấy các tham số bằng nhau, hoặc nhảy nếu zero flag được set.

<a id="Page_527"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-25"></a>

## JECXZ: Nhảy nếu ECX=0

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
JECXZ d8           386+
```

### Ví dụ

```
JECXZ AllDone      ; Label AllDone must be within +127 or -128 bytes.
```

### Ghi chú

Vài instruction dùng ECX làm count register, và `JECXZ` cho phép bạn kiểm tra và nhảy để xem ECX đã về 0 hay chưa. Jump chỉ có thể là một short jump (tức là không quá 127 byte về phía trước hoặc 128 byte về phía sau) và sẽ được thực hiện nếu ECX = 0 vào thời điểm instruction được thực thi. Nếu ECX là bất kỳ giá trị nào khác 0, việc thực thi rơi xuống instruction tiếp theo. Xem thêm các instruction “Jump on Condition”.

`JECXZ` thường được dùng nhất để bỏ qua điều kiện ECX = 0 khi dùng instruction `LOOP`. Vì `LOOP` giảm ECX trước khi kiểm tra ECX = 0, nếu bạn vào một vòng lặp được `LOOP` chi phối với ECX = 0, rốt cuộc bạn sẽ lặp vòng lặp 2,147,483,648 (2<sup>32</sup>) lần, do đó cần `JECXZ`. Nếu bạn dùng `LOOP` và nó có vẻ bị treo, hãy kiểm tra điều này trước.

<a id="Page_528"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-26"></a>

## JRCXZ: Nhảy nếu RCX=0

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
JRCXZ d8           x64+
```

### Ví dụ

```
JRCXZ AllDone      ; Label AllDone must be within +127 or -128 bytes.
```

### Ghi chú

Instruction này hoạt động giống hệt `JECXZ` ngoại trừ việc register được kiểm tra là RCX, không phải ECX. Vì nó kiểm tra RCX, `JRCXZ` chỉ khả dụng trong các bộ xử lý x64.

`JRCXZ` thường được dùng nhất để bỏ qua điều kiện RCX = 0 khi dùng instruction `LOOP`. Vì `LOOP` giảm RCX trước khi kiểm tra RCX = 0, nếu bạn vào một vòng lặp được `LOOP` chi phối với RCX = 0, rốt cuộc bạn sẽ lặp vòng lặp 2<sup>64</sup> lần, do đó cần `JRCXZ`. (Nếu bạn dùng `LOOP` và nó có vẻ làm treo chương trình, hãy kiểm tra điều này trước.)

<a id="Page_529"></a>

```
m8 = 8-bit memory data               m16 = 16-bit memory data
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-27"></a>

## JMP: Nhảy không điều kiện

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
JMP d8             In 64-bit mode, displacement sign-extended to 64 bits
JMP d16            Not supported in 64-bit long mode
JMP d32            In 64-bit mode, displacement sign-extended to 64 bits
JMP r/m16          Not supported in 64-bit long mode
JMP r/m32          386+; Not supported in 64-bit long mode
JMP r/m64          x64+
```

### Ví dụ

```
JMP RightCloseBy   Label ; RightCloseBy must be +127 or -128 bytes.
JMP EAX            ; Not supported in 64-bit mode
JMP RDX
JMP QWORD [RBX+EDI+17]
```

### Ghi chú

JMP chuyển quyền điều khiển một cách vô điều kiện tới đích được cho làm operand duy nhất. Ở mode 64-bit, ngoài các label được định nghĩa, JMP có thể chuyển quyền điều khiển tới một offset có dấu 8-bit tính từ RIP, một offset có dấu 32-bit tính từ RIP, hoặc một address tuyệt đối 64-bit (hoặc dưới dạng immediate hoặc gián tiếp thông qua một register hay memory). Dạng m64 hữu ích cho việc tạo jump table trong memory, trong đó một jump table là một mảng address. Ví dụ, `JMP [RBX+RDI+17]` sẽ chuyển quyền điều khiển tới address 64-bit được tìm thấy tại address based-indexed-displacement `[RBX+RDI+17]`.

Không flag nào bị ảnh hưởng và, không giống `CALL`, không có return address nào được push lên stack. Lưu ý rằng có thêm các dạng `JMP` cho các mode khác và công việc kỳ lạ ở các mức đặc quyền cao hơn userspace. Hãy xem một tài liệu tham khảo instruction của Intel để biết thêm chi tiết.

<a id="Page_531"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-28"></a>

## LEA: Nạp effective address

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
LEA r16,m
LEA r32,m          386+
LEA r64,m          x64+
```

### Ví dụ

```
LEA RBP,MyVariable   ; Loads address expressed by MyVariable to RBP
LEA R15,[RAX+RDX*4+17] ; Loads effective address from calculation to R15
```

### Ghi chú

`LEA` suy ra address của source operand và nạp offset đó vào destination operand. Destination operand phải là một register và *không thể* là memory. Source operand phải là một memory operand, nhưng nó có thể có bất kỳ kích thước nào. Address được lưu trong destination operand là address của byte đầu tiên của nguồn trong memory, và kích thước của nguồn trong memory không quan trọng.

Đây là một cách tốt, gọn gàng để đặt address của một biến vào một register trước một lời gọi procedure hay một system call. Xem `SYSCALL`.

`LEA` cũng có thể được dùng để thực hiện toán trên register, vì address được chỉ định trong operand thứ hai được *tính* nhưng không được *truy cập*. Do đó address có thể là một address mà chương trình của bạn không có quyền truy cập. Bất kỳ phép toán nào có thể được biểu diễn như một phép tính address hợp lệ đều có thể được thực hiện bằng `LEA`.

Đây là một trong số ít chỗ mà NASM không đòi hỏi một size specifier trước một operand cung cấp một memory address, một lần nữa vì `LEA` tính address nhưng không di chuyển dữ liệu nào tới hoặc từ address đó.

<a id="Page_532"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-29"></a>

## LOOP: Lặp cho đến khi CX/ECX/RCX=0

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
LOOP d8            386+ if using ECX for the counter; 64+ if using RCX
```

### Ví dụ

```
LOOP AllDone       ; Label AllDone must be within +127 or -128 bytes.
```

### Ghi chú

`LOOP` là một instruction kết hợp giảm bộ đếm, kiểm tra và nhảy. Nó dùng CX làm bộ đếm ở các mode 16-bit, ECX ở các mode 32-bit, hoặc RCX ở các mode 64-bit. Hoạt động của `LOOP` về mặt logic giống hệt nhau ở cả ba mode, và tôi dùng việc lập trình 64-bit làm ví dụ ở đây.

`LOOP` đơn giản hóa code bằng cách đóng vai một instruction `DEC RCX`, một instruction `CMP RCX,0` và một instruction `JZ` trong một, được thực thi theo thứ tự đó. Một số đếm lặp vòng lặp phải được nạp ban đầu vào RCX. Khi instruction `LOOP` được thực thi, nó *trước tiên* giảm RCX. Sau đó nó kiểm tra xem RCX = 0 hay không. Nếu RCX *không* bằng 0, `LOOP` chuyển quyền điều khiển tới displacement 8-bit được chỉ định làm operand của nó:

```
      MOV RCX,17    ; Loop 17 times
DoIt: CALL CrunchIt
      CALL StuffIt
      LOOP DoIt
```

Ở đây, hai lời gọi procedure `CALL` sẽ được thực hiện 17 lần. Trong 16 lượt đầu tiên, RCX vẫn sẽ khác không, và `LOOP` sẽ chuyển quyền điều khiển tới DoIt. Tuy nhiên, ở lượt thứ 17, `LOOP` sẽ giảm RCX về 0 rồi rơi xuống instruction kế tiếp theo trình tự khi nó kiểm tra CX.

`LOOP` *không* thay đổi flag nào, ngay cả khi RCX được giảm về 0. *Cảnh báo:* hãy để ý các điều kiện ban đầu của bạn! Nếu bạn đang ở mode 16-bit và CX ban đầu bằng 0, `LOOP` sẽ giảm nó xuống 65,535 (0FFFFH) rồi thực hiện vòng lặp 65,535 lần. Tệ hơn, nếu bạn đang làm việc ở protected mode 32-bit và vào một vòng lặp với ECX = 0, vòng lặp sẽ được thực hiện hơn 2 *tỷ* lần, có thể đủ lâu để trông giống như hệ thống bị treo. Nếu bạn đang dùng RCX, chà, vòng lặp sẽ chạy 2<sup>64</sup> lần, điều đó *sẽ* là hệ thống bị treo.

<a id="Page_534"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-30"></a>

## LOOPNZ/LOOPNE: Lặp cho đến khi CX/ECX/RCX=0 và ZF=0

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
LOOPNZ d8          386+ if using ECX for the counter; 64+ if using RCX
LOOPNE d8          386+ if using ECX for the counter; 64+ if using RCX
```

### Ví dụ

```
LOOPNZ AllDone     ; Label AllDone must be within +127 or -128 bytes.
```

### Ghi chú

`LOOPNZ` và `LOOPNE` là từ đồng nghĩa và sinh ra opcode giống hệt nhau. Giống như `LOOP`, chúng dùng CX, ECX hoặc RCX tùy theo “bit-ness” của CPU. Trong công việc 64-bit, `LOOPNZ`/`LOOPNE` giảm RCX và nhảy tới vị trí được chỉ định trong operand đích nếu RCX khác 0 và Zero flag ZF bằng 0. Ngược lại, việc thực thi rơi xuống instruction tiếp theo.

Điều này có nghĩa là vòng lặp gần như được ZF điều khiển. Nếu ZF vẫn bằng 0, vòng lặp được lặp cho đến khi register bộ đếm được giảm về 0. Nhưng ngay khi ZF được set thành 1, vòng lặp kết thúc. Hãy nghĩ về nó là “Loop While Not Zero Flag.”

Hãy nhớ rằng *bản thân* `LOOPNZ` và `LOOPNE` không ảnh hưởng đến ZF. Một instruction nào đó bên trong vòng lặp (thường là một trong các string instruction) phải làm điều gì đó để ảnh hưởng đến ZF để kết thúc vòng lặp trước khi CX/ECX/RCX đếm ngược về 0.

<a id="Page_535"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-31"></a>

## LOOPZ/LOOPE: Lặp cho đến khi CX/ECX/RCX=0 và ZF=1

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
LOOPZ d8           386+ if using ECX for the counter; 64+ if using RCX
LOOPE d8           386+ if using ECX for the counter; 64+ if using RCX
```

### Ví dụ

```
LOOPZ AllDone      ; Label AllDone must be within +127 or -128 bytes.
```

### Ghi chú

`LOOPZ` và `LOOPE` là từ đồng nghĩa và sinh ra opcode giống hệt nhau. Giống như `LOOP`, chúng dùng CX, ECX hoặc RCX tùy theo “bit-ness” hiện tại của CPU. Trong công việc 64-bit, `LOOPZ`/`LOOPE` trước tiên giảm RCX và nhảy tới vị trí được chỉ định trong operand đích nếu RCX khác 0 và Zero flag ZF bằng 1. Ngược lại, việc thực thi rơi xuống instruction tiếp theo.

Điều này có nghĩa là vòng lặp gần như được ZF điều khiển. Nếu ZF vẫn bằng 1, vòng lặp được lặp cho đến khi register bộ đếm được giảm về 0. Nhưng ngay khi ZF bị clear về 0, vòng lặp kết thúc. Hãy nghĩ về nó là “Loop While Zero Flag.”

Hãy nhớ rằng *bản thân* `LOOPZ`/`LOOPE` không ảnh hưởng đến ZF. Một instruction nào đó bên trong vòng lặp (thường là một trong các string instruction) phải làm điều gì đó để đưa ZF về không để kết thúc vòng lặp trước khi CX/ECX/RCX đếm ngược về 0.

<a id="Page_536"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-32"></a>

## MOV: Sao chép operand phải vào operand trái

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
MOV r/m8,r8
MOV r/m16,r16
MOV r/m32,r32      386+
MOV r/m64,r64      x64+
MOV r8,r/m8
MOV r16,r/m16
MOV r32,r/m32      386+
MOV r64,r/m64      x64+
MOV r/m8,i8
MOV r/m16,i8
MOV r/m16,i16
MOV r/m32,i8       386+
MOV r/m32,i32      386+
MOV r/m64,i8       x64+
MOV r/m64,i64      x64+
MOV r8,i8
MOV r16,i16
MOV r32,i32        386+
MOV r64,i64        x64+
```

### Ví dụ

```
MOV AX,BP
MOV R14,RDX
MOV [EBP],EAX
MOV RAX,[RDX]
MOV RBP,17H
MOV QWORD [RBX+RSI+Inset],5
```

### Ghi chú

`MOV` có lẽ là instruction most-used trong mọi instruction. Source operand (bên phải) được sao chép vào operand bên trái (đích). Source operand không bị thay đổi. Các flag không bị ảnh hưởng.

Lưu ý rằng có thêm các dạng `MOV` xử lý segment : offset addressing, thứ không được dùng trong userspace x64 và tôi không trình bày trong cuốn sách này. Hãy xem tài liệu Intel để biết thêm thông tin.

<a id="Page_538"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-33"></a>

## MOVS: Di chuyển chuỗi

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
MOVSB
MOVSW
MOVSD
MOVSQ
```

### Ví dụ

```
MOVSB              ;Copies byte at [RSI] to [RDI]
MOVSW              ;Copies word at [RSI] to [RDI]
MOVSD              ;Copies double word at [RSI] to [RDI]
REP MOVSB          ;Copies memory region starting at [RSI] to region
                   ;  starting at [RDI], for RCX repeats, one byte
                   ;  at a time
```

### Ghi chú

`MOVS` sao chép memory theo các khúc 8-bit (`MOVSB`), 16-bit (`MOVSW`), 32-bit (`MOVSD`) hoặc 64-bit (`MOVSQ`), từ address được lưu trong RSI tới address được lưu trong RDI. Mnemonic mà bạn dùng trong bốn cái này nói về kích thước của các khúc, *không phải* mode bạn đang dùng. Ví dụ, bạn có thể dùng `MOVSB` ở long mode x64 nếu cần di chuyển dữ liệu từng byte một. Nếu bạn cần di chuyển dword, hãy dùng `MOVSD`, v.v.

Bằng cách đặt một số đếm lặp thao tác (*không phải* số đếm byte, word, dword hay qword!) vào RCX và đặt prefix `REP` trước mnemonic, `MOVS` có thể thực hiện một lần sao chép “machine-gun” tự động dữ liệu từ một vùng memory bắt đầu tại `[RSI]` tới một vùng memory bắt đầu tại `[RDI]`.

Sau mỗi thao tác sao chép, RSI và RDI được điều chỉnh (xem đoạn tiếp theo) 1 (cho các thao tác 8-bit), 2 (cho các thao tác 16-bit), 4 (cho các thao tác 32-bit) hoặc 8 (cho các thao tác 64-bit) và RCX được giảm đi 1. Đừng quên rằng RCX đếm *thao tác* (số lần một mục dữ liệu được sao chép từ nguồn tới đích) chứ *không phải* byte!

*Điều chỉnh* có nghĩa là tăng RSI và RDI nếu Direction flag bị clear (bởi CLD) hoặc giảm RSI và RDI nếu Direction flag đã được set (bởi STD). Do đó Direction flag DF xác định thao tác sao chép của bạn di chuyển up-memory nếu DF bị clear (0) hay down-memory nếu DF được set (1).

Có thêm các dạng của prefix `REP` (`REPE`, `REPNE`, `REPZ` và `REPNZ`) bổ sung khả năng kết thúc một thao tác `MOVS` trước khi register đếm về 0, bằng cách kiểm tra trạng thái của Zero flag ZF. Những dạng bổ sung đó không được trình bày trong cuốn sách này. Hãy xem tài liệu Intel để biết chi tiết.

<a id="Page_540"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-34"></a>

## MOVSX: Sao chép có sign extension

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
MOVSX r16,r/m8     386+
MOVSX r32,r/m8     386+
MOVSX r64,r/m8     x64+
MOVSX r32,r/m16    386+
MOVSX r64,r/m16    x64+
```

### Ví dụ

```
MOVSX AX,AL
MOVSX CX,BYTE [EDI]       ; Acts on the byte at EDI
MOVSX ECX,DL
MOVSX RSI,QWORD [RBX+RDI] ; Acts on the doubleword at EBX+EDI
```

### Ghi chú

`MOVSX` hoạt động như `MOV` nhưng sao chép giá trị từ source operand tới destination operand có sign extension. Nghĩa là, nó mang sign bit của source operand nhỏ hơn tới sign bit của destination operand lớn hơn. Bằng cách này, ví dụ, một giá trị có dấu 16-bit trong AX sẽ vẫn là một giá trị có dấu khi được sao chép vào register 32-bit EDX hoặc register 64-bit RDX. Không có sign extension, sign bit của AX sẽ đơn giản trở thành một bit khác trong giá trị binary được sao chép vào RDX, và giá trị trong RDX sẽ chẳng giống gì giá trị được cho là giống hệt trong AX.

Destination operand phải là một register. `MOVSX` có thể sao chép dữ liệu *từ* một vị trí memory, nhưng không thể *tới* một vị trí memory. Cũng lưu ý rằng destination operand phải là một giá trị rộng hơn source operand; tức là, `MOVSX` sẽ sao chép từ một giá trị 8-bit hay 16-bit sang một giá trị 32-bit, nhưng không phải từ 16-bit sang 16-bit, cũng như từ 32-bit sang 32-bit.

`MOVSX` chỉ có mặt trong 386 và các CPU sau này. Nó không ảnh hưởng đến flag nào.

<a id="Page_542"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-35"></a>

## MUL: Nhân số nguyên không dấu

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
*       ? ? ? ? *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
MUL r/m8         Dividend in AX. Quotient in AL; remainder in AH.
MUL r/m16        Dividend in EAX. Quotient in AX; remainder in DX.
MUL r/m32  386+  Dividend in EAX:EDX. Quotient in EAX; remainder in EDX.
MUL r/m64  x64+  Dividend in RAX:RDX. Quotient in RAX; remainder in RDX.
```

### Ví dụ

```
MUL CH              ; AL * CH --> AX
MUL BX              ; AX * BX --> DX:AX
MUL ECX             ; EAX * ECX --> EDX:EAX
MUL DWORD [EBX+EDI] ; EAX * [EBX+EDI] --> EDX:EAX
MUL QWORD [R14]     ; RAX * [R14] --> RDX:RAX
```

### Ghi chú

`MUL` nhân operand duy nhất của nó với AL, AX, EAX hoặc RAX, và kết quả được đặt vào AX, vào DX:AX, vào EDX:EAX hoặc vào RDX:RAX. Nếu `MUL` được cho một operand 8-bit (hoặc một register 8-bit hoặc một memory operand 8-bit), kết quả sẽ được đặt vào AX. Điều này có nghĩa là AH sẽ bị ảnh hưởng, ngay cả khi kết quả vừa trọn vẹn trong AL.

Tương tự, nếu `MUL` được cho một operand 16-bit, kết quả sẽ được đặt vào DX:AX, *ngay cả khi toàn bộ kết quả vừa trong AX!* Rất dễ quên rằng `MUL` ảnh hưởng đến DX trong phép nhân 16-bit, EDX trong phép nhân 32-bit, và RDX trong phép nhân 64-bit. Hãy ghi nhớ điều đó! Ngoài ra, nếu bạn đang nhân một giá trị trong memory, bạn phải thêm size specifier `BYTE`, `WORD`, `DWORD` hoặc `QWORD`.

Lưu ý: rất dễ cho rằng `IMUL` giống hệt `MUL` ngoại trừ khả năng hoạt động trên giá trị có dấu của IMUL. Không phải vậy: `IMUL` có nhiều dạng instruction hợp lệ hơn và phức tạp hơn đáng kể so với `MUL`. Để biết thêm chi tiết, hãy xem tài liệu Intel.

Carry flag và Overflow flag bị clear về 0 nếu giá trị kết quả bằng 0; ngược lại, cả hai được set thành 1. Hãy nhớ rằng SF, ZF, AF và PF trở thành không xác định sau MUL.

<a id="Page_544"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-36"></a>

## NEG: Negate (Two's Complement; tức là nhân với −1)

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
*       * * * * *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
NEG r/m8
NEG r/m16
NEG r/m32          386+
NEG r/m64          x64+
```

### Ví dụ

```
NEG CH
NEG BX
NEG ECX
NEG DWORD [EBX]
NEG QWORD [R14+RDI*4]
```

### Ghi chú

`NEG` là thứ tương đương trong assembly language của việc nhân một giá trị với 1. Hãy nhớ rằng phép phủ định *không* giống như việc đơn giản đảo từng bit trong operand. (Một instruction khác, `NOT`, làm việc đó.) Quá trình này cũng được biết đến là việc sinh ra *two's complement* của một giá trị. Two's complement của một giá trị cộng với giá trị đó cho ra không.

−1 = $FF; −2 = $FE; −3 = $FD; and so forth.

Nếu operand bằng 0, CF bị clear, và ZF được set; ngược lại, CF được set, và ZF bị clear. Nếu operand chứa giá trị âm lớn nhất đối với kích thước operand, operand không thay đổi, nhưng OF và CF được set. SF được set nếu kết quả là âm, nếu không SF bị clear. PF được set nếu 8 bit low-order của kết quả chứa một số chẵn bit được set (1); ngược lại, PF bị clear.

`NEG` tác động lên các dạng memory data *phải* được dùng với một size specifier dữ liệu như `BYTE`, `WORD`, `DWORD` và `QWORD`. Xem hai ví dụ được cho ở trên.

<a id="Page_546"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-37"></a>

## NOP: Không thao tác

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
NOP
```

### Ví dụ

```
NOP ;AllDone   ; NOP replaces a jump instruction for debugging purposes,                ; but the
 parameter is commented out, since NOP                ; can't take a label
 as a parameter.
```

### Ghi chú

`NOP`, machine instruction easiest-to-understand trong mọi machine instruction của họ x86/x64-family, đơn giản là không làm gì. Công việc của nó là chiếm chỗ trong các chuỗi instruction. Các flag không bị ảnh hưởng. `NOP` được dùng để “NOP bỏ” các machine instruction trong khi debug, để lại chỗ cho các lời gọi procedure hay interrupt trong tương lai.

Thời xa xưa, `NOP` được dùng để độn các vòng lặp định thời. Điều này hợp lý trên bề mặt nhưng không còn làm được nữa. Các CPU hiện đại có khả năng thực hiện nhiều tối ưu context-sensitive khác nhau trên code đang thực thi bên trong CPU. *Việc dự đoán assembly-time chính xác thời gian thực thi instruction không còn khả thi nữa!*

<a id="Page_547"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-38"></a>

## NOT: NOT logic (one's complement)

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
NOT r/m8
NOT r/m16
NOT r/m32          386+
NOT r/m64          x64+
```

### Ví dụ

```
NOT CL
NOT DX
NOT ECX
NOT DWORD [EDI]
NOT QWORD [RDI+RCX*4]
```

### Ghi chú

`NOT` đảo từng bit riêng lẻ bên trong operand một cách riêng biệt. Nghĩa là, mọi bit từng là 1 trở thành 0, và mọi bit từng là 0 trở thành 1. Đây là phép toán “logical NOT” hay “one's complement”. Hãy xem instruction `NEG` cho phép phủ định, hay phép toán two's complement.

Sau khi thực thi `NOT`, giá trị FFH sẽ trở thành 0; giá trị AAH sẽ trở thành 55H. Lưu ý rằng Zero flag *không* bị ảnh hưởng, ngay cả khi `NOT` ép operand của nó về 0.

`NOT` tác động lên các dạng memory data *phải* được dùng với một size specifier dữ liệu như `BYTE`, `WORD`, `DWORD` và `QWORD`. Xem hai ví dụ được cho ở trên.

<a id="Page_548"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-39"></a>

## OR: OR logic

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
*       * * ? * *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
OR r/m8,i8
OR r/m16,i16
OR r/m32,i32       386+
OR r/m64,i32       x64+  NOTE: OR r/m64,i64 is NOT valid!
OR r/m16,i8
OR r/m32,i8        386+
OR r/m64,i8        x64+
OR r/m8,r8
OR r/m16,r16
OR r/m32,r32       386+
OR r/m64,r64       x64+
OR r8,r/m8
OR r16,r/m16
OR r32,r/m32       386+
OR r64,r/m64       x64+
OR AL,i8
OR AX,i16
OR EAX,i32         386+
OR RAX,i32         x64+  NOTE: OR RAX,i64 is NOT valid!
```

### Ví dụ

```
OR BX,DI
OR EAX,5
OR AX,0FFFFH
OR AL,42H
OR [BP+SI],DX
OR [RDI],RAX
OR QWORD [RBX],0B80000H
```

### Ghi chú

`OR` thực hiện phép toán logic OR giữa hai operand của nó. Một khi phép toán hoàn tất, kết quả thay thế destination operand. OR được thực hiện trên cơ sở bit-by-bit, sao cho bit 0 của nguồn được OR với bit 0 của đích, bit 1 của nguồn được OR với bit 1 của đích, và cứ thế. Phép toán OR cho ra 1 nếu một trong các operand là 1; và 0 chỉ khi cả hai operand đều là 0. Lưu ý rằng instruction `OR` làm cho Auxiliary Carry flag trở thành không xác định. CF và OF bị clear về 0, và các flag bị ảnh hưởng khác được set theo kết quả của phép toán.

<a id="Page_550"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-40"></a>

## POP: Sao chép đỉnh stack vào operand

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
POP m16
POP m32   32-bit CPUs only: not valid in x64 mode
POP m64   x64+
POP r16
POP r32   32-bit CPUs only: not valid in x64 mode
POP r64   x64+
```

### Ví dụ

```
POP DX
POP RCX
POP QWORD [RDI]
POP QWORD [RDI+RCX*4]
```

### Ghi chú

Không thể pop một mục 8-bit ra khỏi stack. Cũng hãy nhớ rằng *đỉnh stack* được định nghĩa (ở các mode 16-bit) là word tại address SS:SP, và không có cách nào ghi đè điều đó bằng prefix. Ở các mode 32-bit, đỉnh stack là `DWORD` tại [ESP]. Ở mode 64-bit, đỉnh stack là `QWORD` tại [RSP]. Các dạng 32-bit của `POP` không hợp lệ ở mode 64-bit. Có một cặp instruction riêng, `PUSHF/D/Q` và `POPF/D/Q`, để push và pop register Flags.

`POP` tác động lên các dạng memory data *phải* được dùng với một size specifier dữ liệu như `BYTE`, `WORD`, `DWORD` và `QWORD`. Xem các ví dụ được cho ở trên.

Có vài dạng `POP` để pop segment register, nhưng những dạng này không thể được dùng trong lập trình userspace. Để biết chi tiết, hãy xem tài liệu Intel.

<a id="Page_552"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-41"></a>

## POPF/D/Q: Sao chép đỉnh stack vào register flag

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
* * * * * * * * *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
POPF
POPFD              32-bit CPUs only: Invalid in 64-bit mode
POPFQ              x64+
```

### Ví dụ

```
POPF               ;Pops 16-bit top of stack into the FLAGS register
POPFD              ;Pops 32-bit top of stack into the EFLAGS register
POPFQ              ;Pops 64-bit top of stack into the RFLAGS register
```

### Ghi chú

Những instruction này pop dữ liệu ở đỉnh stack vào register flag thích hợp với mode. `POPF` pop 16 bit vào register FLAGS. `POPFD` pop 32 bit vào EFLAGS. `POPFQ` pop 64 bit vào RFLAGS. Stack pointer được tăng 2 sau `POPF`, 4 sau `POPFD`, và 8 sau `POPFQ`. `POPF` có thể được dùng ở mode 64-bit, nếu `PUSHF` đã được thực hiện trước đó. Hãy nhớ rằng RFLAGS chứa EFLAGS, register này đến lượt nó lại chứa FLAGS. Khi bạn pop 16 bit trên cùng ra khỏi stack bằng `POPF`, bạn đang pop những bit đó vào 16 bit thấp nhất của cả EFLAGS lẫn RFLAGS.

`POPFD` không hợp lệ ở mode 64-bit.

Push và pop các flag CPU là một chuyện tinh tế và phức tạp hơn bạn có thể nghĩ. Nó chủ yếu được hệ điều hành làm và không thường được làm trong lập trình userspace. Để biết chi tiết, hãy xem tài liệu Intel.

<a id="Page_553"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-42"></a>

## PUSH: Push operand lên đỉnh stack

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
PUSH r/m16
PUSH r/m32         32-bit CPUs only; not valid in 64-bit mode
PUSH r/m64         x64+
PUSH i16
PUSH i32           32-bit CPUs only; not valid in 64-bit mode
PUSH i64           x64+
```

### Ví dụ

```
PUSH DX
PUSH R13
PUSH QWORD 5
PUSH QWORD 034F001h
```

### Ghi chú

`PUSH` giảm stack pointer rồi sao chép operand của nó lên stack. Sau đó stack pointer trỏ tới dữ liệu mới. (Trước khi stack được dùng, stack pointer trỏ tới memory trống.) Không thể push dữ liệu 8-bit lên stack. Cũng hãy nhớ rằng *đỉnh stack* được định nghĩa (ở các mode 16-bit) là word tại address SS:SP, và không có cách nào ghi đè điều đó bằng prefix. Ở các mode 32-bit, đỉnh stack là `DWORD` tại`[ESP]`. Ở mode 64-bit, đỉnh stack là `QWORD` tại `[RSP]`. Các dạng 32-bit không hợp lệ trong x64. Có một bộ instruction riêng, `PUSHF/D/Q` và `POPF/D/Q`, để push và pop các register FLAGS/EFLAGS/RFLAGS.

`PUSH` tác động lên các dạng memory data *phải* được dùng với một size specifier dữ liệu như `BYTE`, `WORD`, `DWORD` và `QWORD`. Xem các ví dụ được cho ở trên.

Có những dạng `PUSH` đặc biệt để push segment register, nhưng những dạng đó không được liệt kê ở đây vì chúng không thể được dùng trong lập trình userspace Linux thông thường.

<a id="Page_555"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-43"></a>

## PUSHF/D/Q: Push các flag lên stack

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
PUSHF
PUSHFD             32-bit CPUs only: Invalid in 64-bit mode
PUSHFQ             x64+
```

### Ví dụ

```
PUSHF              ;Pushes 16-bit FLAGS register onto the stack
PUSHFD             ;Pushes 32-bit EFLAGS register onto the stack
PUSHFQ             ;Pushes 64-bit RFLAGS register onto the stack
```

### Ghi chú

Ba instruction này push register FLAGS/EFLAGS/RFLAGS lên stack. `PUSHF` push register FLAGS 16-bit. `PUSHFD` push EFLAGS 32-bit. `PUSHFQ` push RFLAGS 64-bit. Stack pointer được giảm *trước khi* các giá trị flag được push lên stack. Hãy nhớ rằng RFLAGS chứa EFLAGS, register này đến lượt nó lại chứa FLAGS. Khi bạn pop 16 bit trên cùng ra khỏi stack bằng `POPF`, bạn đang pop những bit đó vào 16 bit thấp nhất của cả EFLAGS lẫn RFLAGS.

`PUSHFD` không hợp lệ ở mode 64-bit.

Push và pop các flag CPU là một chuyện tinh tế, và phức tạp hơn bạn có thể nghĩ. Nó chủ yếu được hệ điều hành làm và không thường được làm trong lập trình userspace. Để biết chi tiết, hãy xem tài liệu Intel.

<a id="Page_556"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-44"></a>

## RET: Trả về từ procedure

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
     <none>        IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
RET
RETN
RET i16
RETN i16
```

### Ví dụ

```
RET
RET 16             ; Removes 2 64-bit (8 byte) parameters from the stack
```

### Ghi chú

Có hai loại trả về từ procedure: Near và Far, trong đó Near là bên trong code segment hiện tại và Far là tới một code segment khác. Đây không phải là vấn đề ở protected mode 32-bit và 64-bit, nơi chỉ có một code segment trong code userspace và mọi lời gọi và trả về đều là Near. Thông thường, dạng `RET` được dùng, và assembler phân giải nó thành một opcode trả về Near hoặc Far để khớp với việc định nghĩa procedure dùng specifier `NEAR` hay `FAR` nếu có. Có thể chỉ định `RETN` cho các lần trả về Near khi cần.

`RET` có thể nhận một operand cho biết bao nhiêu byte không gian stack sẽ được giải phóng khi trả về từ procedure. Con số này được trừ khỏi stack pointer để xóa các mục dữ liệu đã được push lên stack để procedure dùng ngay trước lời gọi procedure. Hãy đảm bảo bạn tính đúng giá trị immediate, nếu không stack sẽ bị hỏng và có lẽ sẽ kích hoạt một segmentation fault.

Có thêm các biến thể của instruction `RET` với những điều khoản để làm việc với các cơ chế bảo vệ của hệ điều hành. Chúng không được trình bày ở đây, và để biết thêm thông tin, bạn nên xem một tài liệu nâng cao hoặc một tài liệu tham khảo assembly language đầy đủ.

<a id="Page_558"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-45"></a>

## ROL/ROR: Rotate trái/Rotate phải

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
*               *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
ROL/ROR r/m8,1
ROL/ROR r/m16,1
ROL/ROR r/m32,1    386+
ROL/ROR r/m64,1    x64+
ROL/ROR r/m8,CL
ROL/ROR r/m16,CL
ROL/ROR r/m32,CL   386+
ROL/ROR r/m64,CL   x64+
ROL/ROR r/m8,i8    286+
ROL/ROr r/m16,i8   286+
ROL/ROR r/m32,i8   386+
ROL/ROR m/m64,i8   x64+
```

### Ví dụ

```
ROL/ROR AX,1
ROL/ROR DWORD {EBX+ESI],9
ROL/ROR R14,17
ROL/ROR QWORD [BPI],CL
```

### Ghi chú

`ROL` và `ROR` rotate các bit bên trong destination operand sang trái (`ROL`) và sang phải (`ROR`), trong đó bên trái là về phía bit có trọng số lớn nhất (MSB) và bên phải là về phía bit có trọng số nhỏ nhất (LSB). Một phép rotate là một phép shift (xem `SHL` và `SHR`) có quấn vòng: với `ROL`, bit ngoài cùng bên trái của operand được dịch vào bit ngoài cùng bên phải, và mọi bit ở giữa được dịch sang trái một bit. Đi theo chiều ngược lại, với `ROR`, bit ngoài cùng bên phải của operand được dịch vào bit ngoài cùng bên trái, với mọi bit khác di chuyển sang phải một bit. Ngoại trừ hướng mà phép shift đi theo, `ROL` giống hệt `ROR`, đó là lý do tôi trình bày cả hai instruction trên cùng một trang.

Số vị trí bit được dịch có thể được chỉ định hoặc như một giá trị immediate 8-bit hoặc bằng giá trị trong CL—*không phải* CX/ECX/RCX. (8086 và 8088 chỉ có thể dùng các dạng dịch theo giá trị immediate 1.) Lưu ý rằng mặc dù CL có thể nhận một giá trị tới 255, việc dịch theo bất kỳ giá trị nào lớn hơn kích thước word gốc là vô nghĩa. 286 và các CPU sau này giới hạn số thao tác shift được thực hiện ở kích thước word gốc, ngoại trừ khi chạy ở Virtual 86 mode.

Với `ROL`, bit ngoài cùng bên trái được sao chép vào CF ở mỗi thao tác shift. Với `ROR`, bit ngoài cùng bên phải được sao chép vào CF ở mỗi thao tác shift. Với cả `ROL` lẫn `ROR`, OF được sửa đổi *chỉ* bởi các dạng shift-by-one. Sau các dạng shift-by-CL, *OF trở thành không xác định*. Tuy nhiên, nếu số bit cần dịch bằng 0, không flag nào bị ảnh hưởng.

`ROL` hay `ROR` tác động lên các dạng memory data *phải* được dùng với một size specifier dữ liệu như `BYTE`, `WORD`, `DWORD` và `QWORD`. Xem các ví dụ được cho ở trên.

Mặc dù tôi không cho chúng một trang riêng ở đây, `RCL` và `RCR` hoạt động theo cùng cách, ngoại trừ việc Carry flag CF là một phần của phép rotate, về bản chất là thêm một bit vào phép rotate.

<a id="Page_560"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-46"></a>

## SBB: Trừ số học có borrow

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
*       * * * * *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
SBB r/m8,i8
SBB r/m16,i16
SBB r/m32,i32      386+
SBB r/m64,i32      x64+  NOTE: SBB r/m64,i64 is NOT valid!
SBB r/m16,i8
SBB r/m32,i8       386+
SBB r/m64,i8       x64+
SBB r/m8,r8
SBB r/m16,r16
SBB r/m32,r32      386+
SBB r/m64,r64      x64+
SBB r8,r/m8
SBB r16,r/m16
SBB r32,r/m32      386+
SBB r64,r/m64      x64+
SBB AL,i8
SBB AX,i16
SBB EAX,i32        386+
SBB RAX,i32        x64+  NOTE: SBB RAX,i64 is NOT valid!
```

### Ví dụ

```
SBB DX,DI
SBB AX,04B2FH
SBB AL,CBH
SBB BP,19H
SBB DWORD [ESI],EAX
SBB QWORD [RAX],7BH
```

### Ghi chú

`SBB` thực hiện một phép trừ có borrow, trong đó source operand được trừ khỏi destination operand, rồi Carry flag được trừ khỏi kết quả. Kết quả sau đó thay thế destination operand. Nếu kết quả là âm, Carry flag được set. Để trừ mà không tính đến Carry flag (tức là không borrow), hãy dùng instruction `SUB`.

<a id="Page_562"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-47"></a>

## SHL/SHR: Shift trái/Shift phải

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
*       * * ? * *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
SHL/SHR r/m8,1
SHL/SHR r/m16,1
SHL/SHR r/m32,1    386+
SHL/SHR r/m64,1    x64+
SHL/SHR r/m8,CL
SHL/SHR r/m16,CL
SHL/SHR r/m32,CL   386+
SHL/SHR r/m64,CL   x64+
SHL/SHR r/m8,i8    286+
SHL/SHR r/m16,i8   286+
SHL/SHR r/m32,i8   386+
SHL/SHR m/m64,i8   x64+
```

### Ví dụ

```
SHL/SHR AX,1
SHL/SHR DWORD {EDX+ESI],4
SHL/SHR R12,15
SHL/SHR QWORD [RDI],CL
```

### Ghi chú

`SHL` và `SHR` dịch các bit trong destination operand của chúng theo một số đếm được cho trong source operand. `SHL` dịch các bit bên trong destination operand sang trái, trong đó bên trái là về phía bit có trọng số lớn nhất (MSB). `SHR` dịch các bit bên trong destination operand sang phải, trong đó bên phải là về phía bit có trọng số nhỏ nhất (LSB).Số vị trí bit được dịch có thể được chỉ định hoặc như một giá trị immediate 8-bit hoặc bằng giá trị trong CL—*không phải* CX/ECX/RCX. (8086 và 8088 bị giới hạn ở giá trị immediate 1.) Lưu ý rằng mặc dù CL có thể nhận một giá trị tới 255, việc dịch theo bất kỳ giá trị nào lớn hơn kích thước word gốc là vô nghĩa. 286 và các CPU sau này giới hạn số thao tác shift được thực hiện ở kích thước word gốc ngoại trừ khi chạy ở Virtual 86 mode.

Với `SHL`, bit ngoài cùng bên trái của operand được dịch vào CF; bit ngoài cùng bên phải bị clear về 0. Với `SHR`, bit ngoài cùng bên phải được dịch vào CF; bit ngoài cùng bên trái bị clear về 0. Auxiliary Carry flag AF trở thành không xác định sau cả `SHL` lẫn `SHR`. OF được sửa đổi *chỉ* bởi các dạng shift-by-one. Sau bất kỳ dạng shift-by-CL nào, OF trở thành không xác định.

`SHL` hay `SHR` tác động lên các dạng memory data *phải* được dùng với một size specifier dữ liệu như `BYTE`, `WORD`, `DWORD` và `QWORD`. Xem các ví dụ được cho ở trên.

`SHL` là từ đồng nghĩa với `SAL` (Shift Arithmetic Left). `SHR` là từ đồng nghĩa với `SAR` (Shift Arithmetic Right.) Ngoại trừ hướng mà phép shift đi theo, `SHL` giống hệt `SHR`.

<a id="Page_564"></a>

```
m8 = 8-bit memory data               m16 = 16-bit memory data
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-48"></a>

## STC: Set Carry Flag (CF)

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
                *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
STC
```

### Ví dụ

```
STC
```

### Ghi chú

`STC` đổi Carry flag CF sang một trạng thái được set biết trước (1). Hãy dùng nó trước một tác vụ nào đó cần một bit trong Carry flag. Instruction `CLC` tương tự và sẽ clear CF về một trạng thái biết trước là 0.

<a id="Page_565"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-49"></a>

## STD: Set Direction Flag (DF)

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
  *                IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
STD
```

### Ví dụ

```
STD
```

### Ghi chú

`STD` đơn giản đổi Direction flag DF sang trạng thái được set (1). Điều này ảnh hưởng đến việc điều chỉnh được thực hiện bởi các string instruction lặp như `STOS`, `SCAS` và `MOVS`. Thông thường, khi DF = 0, con trỏ đích được tăng, và được giảm khi DF = 1. DF được clear về 0 bằng instruction `CLD`.

<a id="Page_566"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-50"></a>

## STOS/B/W/D/Q: Lưu chuỗi

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
STOS m8
STOS m16
STOS m32
STOS m64
STOSB              ; For 8-bit operations
STOSW              ; For 16-bit operations
STOSD              ; For 32-bit operations
STOSQ              ; For 64-bit operations
```

### Ví dụ

```
STOSB              ; Stores AL to [EDI/RDI]
REP STOSB          ; Stores AL to [EDI/RDI] and up, for ECX/RCX repeats
STOSW              ; Stores AX to [EDI/RDI]
STOSD              ; Stores EAX to [EDI/RDI]
REP STOSQ          ; Stores RAX to [EDI/RDI] and up, for ECX/RCX repeats
```

### Ghi chú

`STOS` lưu AL (cho các thao tác lưu 8-bit), AX (cho các thao tác 16-bit), và EAX (cho các thao tác 32-bit) hoặc RAX (cho các thao tác 64-bit) vào vị trí tại `[EDI]` / `[RDI]`. Với các mode legacy 16-bit, ES phải chứa segment address của đích và không thể bị ghi đè. Với protected mode 32-bit và x64, mọi segment đều trùng nhau, và do đó ES không cần được chỉ định một cách tường minh. Tương tự, DI, EDI hoặc RDI phải luôn chứa offset đích. Dạng `STOS` phải luôn có một operand chỉ định một vị trí memory và kích thước. Các dạng `STOSB`, `STOSW`, `STOSD` và `STOSQ` chứa kích thước của thao tác trong mnemonic của chúng, và operand của chúng là ngầm định, với thao tác lưu đi tới một memory address trong EDI hoặc RDI.

Bằng cách đặt một số đếm lặp thao tác (*không phải* số đếm byte!) vào CX/ECX/RCX và đặt prefix `REP` trước mnemonic, `STOS` có thể thực hiện một lần lưu “machine-gun” tự động AL/AX/EAX/RAX vào các vị trí memory liên tiếp bắt đầu tại address ban đầu `[DI]`, `[EDI]` hoặc `[RDI]`. Sau mỗi lần lưu, register DI/EDI/RDI được điều chỉnh (xem đoạn tiếp theo) 1 (cho các thao tác lưu 8-bit), 2 (cho các thao tác lưu 16-bit), 4 (cho các thao tác lưu 32-bit), hoặc 8 (cho các thao tác lưu 64-bit, và CX/ECX/RCX được giảm đi 1. Đừng quên rằng CX/ECX/RCX đếm *thao tác* (số lần một mục dữ liệu được lưu vào memory) chứ *không phải* byte!

*Điều chỉnh* có nghĩa là tăng nếu Direction flag bị clear (bởi `CLD`) hoặc giảm nếu Direction flag đã được set (bởi `STD`).

<a id="Page_568"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-51"></a>

## SUB: Trừ số học

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
*       * * * * *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
SUB r/m8,i8
SUB r/m16,i16
SUB r/m32,i32      386+
SUB r/m64,i32      x64+   NOTE: SUB r/m64,i64 is NOT valid!
SUB r/m16,i8
SUB r/m32,i8       386+
SUB r/m64,i8       x64+
SUB r/m8,r8
SUB r/m16,r16
SUB r/m32,r32      386+
SUB r/m64,r64      x64+
SUB r8,r/m8
SUB r16,r/m16
SUB r32,r/m32      386+
SUB r64,r/m64      x64+
SUB AL,i8
SUB AX,i16
SUB EAX,i32        386+
SUB RAX,i32        x64+   NOTE: SUB RAX,i64 is NOT valid!
```

### Ví dụ

```
SUB AX,DX
SUB AL,DL
SUB EBP,17
SUB RAX,0FFFBH  ; The i32 value is sign-extended to 64 bits
                ;   before the operation
SUB DWORD [EDI],EAX
AND QWORD [RAX],7BH ; The i32 value is sign-extended to 64 bits
                    ;   before the operation

```

### Ghi chú

`SUB` thực hiện một phép trừ không có borrow, trong đó source operand được trừ khỏi destination operand, và kết quả thay thế destination operand. Nếu kết quả là âm, Carry flag CF được set.

Ở mode 64-bit, các source operand 32-bit được sign-extended lên 64 bit trước khi phép trừ diễn ra.

Phép trừ Multiple-precision có thể được thực hiện bằng cách đặt sau `SUB` một `SBB` (Subtract with Borrow), instruction tính đến Carry flag như một borrow số học.

<a id="Page_570"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-52"></a>

## SYSCALL: System call nhanh vào Linux

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
      <none>       IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
SYSCALL
```

### Ví dụ

```
SYSCALL
```

### Ghi chú

`SYSCALL` thực hiện một lời gọi nhanh tới một routine service của hệ điều hành được định nghĩa trước. (Điều này *không* bao gồm các lời gọi vào thư viện C!) Nó chỉ khả dụng ở mode 64-bit. Hiện có 335 routine service như vậy. Những routine này không có tên mà được chọn bằng một con số. Thông thường, các register được nạp số của routine service mong muốn và các giá trị phù hợp với routine service được chọn trước khi `SYSCALL` được thực thi.

`SYSCALL` làm hỏng RCX và R11. Mọi register khác được bảo toàn. Để có danh sách các system call Linux x64 khả dụng, hãy xem các site này, vốn còn khả dụng vào ngày xuất bản ấn bản này năm 2023:

`https://blog.rchapman.org/posts/Linux_System_Call_Table_for_x86_64`

`https://hackeradam.com/x86-64-linux-syscalls`

`SYSCALL` thay thế giao thức gọi `INT 80` trong Linux 32-bit. Hãy nhớ rằng số hiệu của các system call x64 *không* giống với số hiệu từ Linux x86 32-bit!

<a id="Page_571"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-53"></a>

## XCHG: Hoán đổi operand

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
     <none>        IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
XCHG r/m8,r8
XCHG r/m16,r16
XCHG r/m32,r32     386+
XCHG r/m64,r64     x64+
XCHG r8,r/m8
XCHG r16,r/m16
XCHG r32,r/m32     386+
XCHG r64,r/m64     x64+
XCHG AX,r16
XCHG EAX,r32       386+
XCHG RAX,r64       x64+
XCHG r16,AX
XCHG r32,EAX       386+
XCHG r64,RAX       x64+
```

### Ví dụ

```
XCHG AL,AH
XCHG EAX,EBX
XCHG R12,[RSI+Offset]
XCHG [RDI],RDX
```

### Ghi chú

`XCHG` hoán đổi nội dung của hai operand của nó. Hai operand phải có cùng kích thước.

<a id="Page_572"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-54"></a>

## XLAT: Dịch byte thông qua bảng

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
     <none>        IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
XLAT
XLATB
```

### Ví dụ

```
XLAT               ; 32-bit: Loads AL with byte table entry at EBX+AL
XLAT               ; 64-bit: Loads AL with byte table entry at RBX+AL
```

### Ghi chú

`XLAT` và từ đồng nghĩa của nó `XLATB` thực hiện một phép dịch bảng của giá trị 8-bit trong AL. Mọi operand đều là ngầm định. Giá trị trong AL được coi là index vào một bảng trong memory, nằm tại address chứa trong EBX (ở mode 32-bit) hoặc RBX (ở mode x64). Khi `XLAT` được thực thi, giá trị tại `[EBX+AL]` / `[RBX+AL]` thay thế giá trị trước đó trong AL. AL được hard-coded như một implicit operand; không register nào khác có thể được dùng.

Bảng nằm tại address 32-bit hay 64-bit trong EBX/RBX không nhất thiết phải dài 256 byte, nhưng một giá trị trong AL lớn hơn độ dài của bảng sẽ dẫn đến một giá trị không xác định được đặt vào AL.

<a id="Page_573"></a>

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```

<a id="head-2-55"></a>

## XOR: Exclusive OR

### Flag bị ảnh hưởng

```
O D I T S Z A P C  OF: Overflow flag  TF: Trap flag AF: Aux carry
F F F F F F F F F  DF: Direction flag SF: Sign flag PF: Parity flag
*       * * ? * *  IF: Interrupt flag ZF: Zero flag CF: Carry flag
```

### Dạng hợp lệ

```
XOR r/m8,i8
XOR r/m16,i16
XOR r/m32,i32      386+
XOR r/m64,i32      x64+  NOTE: XOR r/m64,i64 is NOT valid!
XOR r/m16,i8
XOR r/m32,i8       386+
XOR r/m64,i8       x64+
XOR r/m8,r8
XOR r/m16,r16
XOR r/m32,r32      386+
XOR r/m64,r64      x64+
XOR r8,r/m8
XOR r16,r/m16
XOR r32,r/m32      386+
XOR r64,r/m64      x64+
XOR AL,i8
XOR AX,i16
XOR EAX,i32        386+
XOR RAX,i32        x64+ NOTE: XOR RAX,i64 is NOT valid!
```

### Ví dụ

```
XOR BX,DI
XOR EAX,5
XOR AX,0FFFFH
XOR AL,42H
XOR [BP+SI],DX
XOR [RDI],RAX
XOR QWORD [RBX],0B80000H
```

### Ghi chú

`XOR` thực hiện một phép toán logic exclusive OR bitwise giữa hai operand của nó. Một khi phép toán hoàn tất, kết quả thay thế destination operand. Phép toán XOR được thực hiện trên cơ sở bit-by-bit, sao cho bit 0 của nguồn được XOR với bit 0 của đích, bit 1 của nguồn được XOR với bit 1 của đích, và cứ thế. Phép toán XOR cho ra 1 nếu các operand khác nhau và 0 nếu các operand giống nhau. Lưu ý rằng instruction `XOR` làm cho Auxiliary Carry flag AF trở thành không xác định. CF và OF bị clear về 0, và các flag bị ảnh hưởng khác được set theo kết quả của phép toán.

Khi `XOR` được dùng giữa một giá trị 64-bit và một giá trị immediate, giá trị immediate không thể có kích thước 64-bits. Giá trị immediate chỉ có thể có kích thước 32 bit.

Thực hiện `XOR` giữa một register và chính nó là một cách phổ biến để xóa một register về 0. Không có dạng nào để dùng `XOR` trên một giá trị memory với chính nó, vì chỉ một trong hai operand của `XOR` có thể là một giá trị memory. Do đó, `XOR` không thể được dùng để đưa một vị trí memory về không.

```
m8 = 8-bit memory data             m16 = 16-bit memory data
m32 = 32-bit memory data           m64 = 64-bit memory data
i8  = 8-bit immediate data         i16 = 16-bit immediate data
i32 = 32-bit immediate data        i64 = 64-bit immediate data
d8 = 8-bit signed displacement     d16 = 16-bit signed displacement
d32 = 32-bit unsigned displacement NOTE: There is no 64-bit displacement
r8 = AL AH BL BH CL CH DL DH       r16 = AX BX CX DX BP SP SI DI
r32 = EAX EBX ECX EDX EBP ESP ESI EDI
r64 = RAX RBX RCX RDX RBP RSP RSI RDI R8 R9 R10 R11 R12 R13 R14 R15
```
