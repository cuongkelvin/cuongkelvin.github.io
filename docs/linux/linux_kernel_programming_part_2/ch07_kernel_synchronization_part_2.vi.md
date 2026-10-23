# Chương 7. Kernel synchronization - Phần 2

Chương này tiếp tục thảo luận từ chương trước về kernel synchronization và xử lý concurrency trong kernel nói chung. Nếu chưa đọc, tôi đề nghị bạn đọc chương trước rồi tiếp tục chương này.

Ở đây, chúng ta tiếp tục tìm hiểu chủ đề rộng lớn về kernel synchronization và xử lý concurrency khi ở kernel space. Như trước, nội dung hướng đến nhà phát triển kernel và/hoặc device driver. Trong chương này, chúng ta sẽ đề cập:

- Dùng các interface atomic\_t và refcount\_t

- Dùng các RMW atomic operator

- Dùng reader-writer spinlock

- Ảnh hưởng của cache và false sharing

- Lập trình Lock-free với per-CPU variable

- Lock debugging trong kernel

- Memory barrier – giới thiệu

## Dùng các interface atomic\_t và refcount\_t

Trong method `open` (và nơi khác) của chương trình demo misc character device driver đơn giản (`miscdrv_rdwr/miscdrv_rdwr.c`), chúng ta định nghĩa và thao tác hai số nguyên static toàn cục `ga` và `gb`:

```
static int ga, gb = 1;
[...]
ga++; gb--;
```

Đến đây, bạn hẳn đã thấy rõ rằng điều này — nơi chúng ta thao tác những số nguyên này — là bug tiềm ẩn nếu để nguyên: đó là shared writable data (ở shared state) và do đó là critical section, nên cần được bảo vệ khỏi truy cập đồng thời. Bạn hiểu rồi; vì vậy, chúng ta đã dần cải thiện. Trong chương trước, khi hiểu vấn đề, trong chương trình `ch12/1_miscdrv_rdwr_mutexlock/1_miscdrv_rdwr_mutexlock.c`, trước hết chúng ta dùng mutex lock để bảo vệ critical section. Sau đó, bạn học được rằng dùng spinlock để bảo vệ non-blocking critical section như thế này (tốt hơn nhiều) so với mutex về hiệu năng; vì vậy, trong driver tiếp theo, `ch12/2_miscdrv_rdwr_spinlock/2_miscdrv_rdwr_spinlock.c`, chúng ta dùng spinlock thay thế:

```
spin_lock(&lock1);
ga++; gb--;
spin_unlock(&lock1);
```

Điều đó tốt, nhưng vẫn có thể làm tốt hơn! Thao tác trên số nguyên toàn cục hóa ra rất phổ biến trong kernel (hãy nghĩ đến reference counter hoặc resource counter được tăng giảm, v.v.), đến mức kernel cung cấp một lớp operator gọi là refcount operator và atomic integer operator hay interface; chúng được thiết kế rất chuyên biệt để thao tác atomically (an toàn và không thể chia cắt) chỉ trên số nguyên.

### Interface refcount\_t mới hơn so với atomic\_t cũ hơn

Ngay khi bắt đầu chủ đề này, cần đề cập: từ kernel 4.11, có một tập interface mới và much-improved được đặt tên là API `refcount_t`, dành cho reference counter của object trong kernel space. Nó cải thiện đáng kể mức độ bảo mật của kernel (qua bảo vệ Integer OverFlow (IoF) và Use After Free (UAF) tốt hơn nhiều, cùng các bảo đảm memory ordering mà API `atomic_t` cũ không có). Interface `refcount_t`, giống một số công nghệ bảo mật khác dùng trên Linux, bắt nguồn từ công việc của The PaX Team – `https://pax.grsecurity.net/` (đã được gọi là `PAX_REFCOUNT`). Dù vậy, thực tế là (tại thời điểm viết) các interface `atomic_t` cũ vẫn được dùng rất nhiều trong kernel core và driver (đang dần được chuyển đổi, từ interface `atomic_t` cũ sang mô hình và tập API `refcount_t` mới). Vì vậy, trong chủ đề này, chúng ta trình bày cả hai, chỉ ra khác biệt và đề cập API `refcount_t` nào thay thế API `atomic_t` ở nơi áp dụng được. Hãy xem interface `refcount_t` như một biến thể của interface `atomic_t` (cũ), chuyên dành cho reference counting.

Khác biệt chính giữa operator `atomic_t` và `refcount_t` là nhóm trước hoạt động trên signed integer, còn nhóm sau về cơ bản được thiết kế chỉ hoạt động trên đại lượng `unsigned int`; cụ thể hơn, và điều này quan trọng, nó chỉ hoạt động trong một khoảng được chỉ định nghiêm ngặt: `1` đến `UINT_MAX-1` (hoặc `[1..INT_MAX]` khi `!CONFIG_REFCOUNT_FULL`). Kernel có config option tên `CONFIG_REFCOUNT_FULL`; nếu đặt, nó thực hiện xác thực reference count “đầy đủ” (chậm hơn và kỹ lưỡng hơn). Điều này có lợi cho bảo mật nhưng có thể làm giảm nhẹ hiệu năng (mặc định điển hình là tắt config này; guest Ubuntu x86\_64 của chúng ta cũng vậy).

Không thể đặt biến `refcount_t` thành `0` hoặc âm, hoặc thành `[U]INT_MAX` trở lên; điều này tốt cho việc ngăn integer underflow/overflow và do đó ngăn bug thuộc lớp use-after-free trong nhiều trường hợp! (Thực ra không phải không thể; nó khiến một warning (ồn ào) được phát qua macro `WARN()`.) Hãy nghĩ xem, biến `refcount_t` chỉ dành cho reference counting của kernel object, không làm gì khác.

Do đó, đây đúng là hành vi cần thiết; reference counter phải bắt đầu bằng giá trị dương (thường là `1` khi object vừa được tạo instance), được tăng (hoặc cộng thêm) mỗi khi code lấy một reference, và được giảm (hoặc trừ đi) mỗi khi code bỏ hay rời một reference đến object. Bạn được kỳ vọng thao tác reference counter cẩn thận (ghép tương ứng các lần get và put), luôn giữ giá trị trong khoảng hợp lệ.

Khá non-intuitively, ít nhất với triển khai refcount generic arch-independent, các API `refcount_t` được triển khai nội bộ trên tập API `atomic_t`. Ví dụ, API `refcount_set()` — đặt atomically giá trị refcount thành tham số được truyền — được triển khai như sau trong kernel:

```
// include/linux/refcount.h
/**
 * refcount_set - set a refcount's value
 * @r: the refcount
 * @n: value to which the refcount will be set
 */
static inline void refcount_set(refcount_t *r, unsigned int n)
{
    atomic_set(&r->refs, n);
}
```

Đây là một wrapper mỏng trên `atomic_set()` (sẽ trình bày ngay sau đây). Câu hỏi thường gặp hiển nhiên ở đây là: vậy vì sao còn dùng refcount API? Có một vài lý do:

- Counter bão hòa tại giá trị `REFCOUNT_SATURATED` (mặc định được đặt thành `UINT_MAX`) và sẽ không thay đổi khi đã đến đó. Điều này rất quan trọng: nó tránh counter wrap, vốn có thể gây những bug UAF kỳ lạ và không đáng có; điều này thậm chí được xem là một bản sửa bảo mật quan trọng (`https://kernsec.org/wiki/index.php/Kernel_Protections/refcount_t`).

- Một số refcount API mới thực sự cung cấp bảo đảm memory ordering; cụ thể, các API `refcount_t` — so với họ hàng `atomic_t` cũ — cùng các bảo đảm memory ordering mà chúng cung cấp được mô tả rõ tại `https://www.kernel.org/doc/html/latest/core-api/refcount-vs-atomic.html#refcount-t-api-compared-to-atomic-t` (hãy xem nếu bạn quan tâm chi tiết low-level).

- Ngoài ra, cần hiểu rằng các triển khai refcount arch-dependent (khi tồn tại; ví dụ x86 có, còn ARM không) có thể khác với triển khai generic previously-mentioned.

Chính xác memory ordering là gì và ảnh hưởng đến chúng ta thế nào? Thực tế đây là chủ đề phức tạp, và tiếc rằng chi tiết nội bộ nằm ngoài phạm vi cuốn sách. Bạn nên biết kiến thức cơ bản: tôi đề nghị đọc về Linux-Kernel Memory Model (LKMM), bao gồm processor memory ordering và nhiều nội dung khác. Chúng tôi giới thiệu tài liệu tốt tại đây: Explanation of the Linux-Kernel Memory Model (`https://github.com/torvalds/linux/blob/master/tools/memory-model/Documentation/explanation.txt`).

### Các interface atomic\_t và refcount\_t đơn giản hơn

Về interface `atomic_t`, cần đề cập rằng mọi cấu trúc `atomic_t` sau chỉ dành cho số nguyên 32-bit; tất nhiên, khi số nguyên 64-bit đã phổ biến, atomic integer operator 64-bit cũng có sẵn. Thường chúng giống hệt phiên bản 32-bit về ngữ nghĩa, chỉ khác tên (`atomic_foo()` trở thành `atomic64_foo()`). Vì vậy, kiểu dữ liệu chính cho atomic integer 64-bit gọi là `atomic64_t` (còn gọi là `atomic_long_t`). Mặt khác, interface `refcount_t` phục vụ cả số nguyên 32-bit và 64-bit. Bảng sau đặt cạnh nhau cách khai báo và khởi tạo biến `atomic_t` và `refcount_t` để bạn đối chiếu:

|  | atomic\_t (cũ hơn, chỉ 32-bit) | refcount\_t (mới hơn, cả 32-bit và 64-bit) |
|---|---|---|
| Header file cần include | `<linux/atomic.h>` | `<linux/refcount.h>` |
| Khai báo và khởi tạo biến | `static atomic_t gb =` `ATOMIC_INIT(1);` | `static refcount_t gb =` `REFCOUNT_INIT(1);` |

Bảng 17.1 – Interface atomic\_t cũ hơn so với refcount\_t mới hơn cho reference counting: header và init

Tập đầy đủ mọi API `atomic_t` và `refcount_t` có sẵn trong kernel khá lớn; để mục này đơn giản và rõ ràng, chúng ta chỉ liệt kê một số interface (atomic 32-bit) và `refcount_t` thường dùng hơn trong bảng sau (chúng thao tác trên biến generic `atomic_t` hoặc `refcount_t`, `v`):

| Thao tác | Interface atomic\_t (cũ hơn) | Interface refcount\_t (mới hơn) \[khoảng: 0 đến \[U\]INT\_MAX\] |
|---|---|---|
| Header file cần include | `<linux/atomic.h>` | `<linux/refcount.h>` |
| Khai báo và khởi tạo biến | `static atomic_t v` `= ATOMIC_INIT(1);` | `static refcount_t v` `= REFCOUNT_INIT(1);` |
| Đọc atomically giá trị hiện tại của `v` | `int` `atomic_read(atomic_t` `*v)` | `unsigned int` `refcount_read(const` `refcount_t *v)` |
| Đặt atomically `v` thành giá trị `i` | `void` `atomic_set(atomic_t` `*v, i)` | `void refcount_set(refcount_t` `*v, int i)` |
| Tăng atomically giá trị `v` thêm `1` | `void` `atomic_inc(atomic_t` `*v)` | `void refcount_inc(refcount_t` `*v)` |
| Giảm atomically giá trị `v` đi `1` | `void` `atomic_dec(atomic_t` `*v)` | `void refcount_dec(refcount_t` `*v)` |
| Cộng atomically giá trị `i` vào `v` | `void atomic_add(i,` `atomic_t *v)` | `void refcount_add(int i,` `refcount_t *v)` |
| Trừ atomically giá trị `i` khỏi `v` | `void atomic_sub(i,` `atomic_t *v)` | `void refcount_sub(int i,` `refcount_t *v)` |
| Cộng atomically giá trị `i` vào `v` và trả về kết quả | `int` `atomic_add_return(i,` `atomic_t *v)` | `bool` `refcount_add_not_zero(int i,` `refcount_t *v)` (không khớp hoàn toàn; cộng `i` vào `v` trừ khi nó bằng `0`.) |
| Trừ atomically giá trị `i` khỏi `v` và trả về kết quả | `int` `atomic_sub_return(i,` `atomic_t *v)` | `bool` `refcount_sub_and_test(int i,` `refcount_t *r)` (không khớp hoàn toàn; trừ `i` khỏi `v` rồi kiểm tra; trả về `true` nếu refcount kết quả bằng `0`, nếu không trả `false`.) |

Bảng 17.2 – Interface atomic\_t cũ hơn so với refcount\_t mới hơn cho reference counting: API

Giờ bạn đã thấy một số macro và API `atomic_t` và `refcount_t`; hãy xem nhanh vài ví dụ sử dụng trong kernel.

#### Ví dụ dùng refcount\_t trong kernel code base

Trong một demo kernel module về kernel thread (`ch15/kthread_simple/kthread_simple.c`), chúng ta tạo kernel thread rồi dùng inline function `get_task_struct()` để đánh dấu task structure của kernel thread đang được sử dụng. Như bạn có thể đoán, routine `get_task_struct()` tăng reference counter của task structure — một biến `refcount_t` tên `usage` — qua API `refcount_inc()`:

```
// include/linux/sched/task.h
static inline struct task_struct *get_task_struct(struct task_struct *t)
{
    refcount_inc(&t->usage);
    return t;
}
```

Routine ngược lại, `put_task_struct()`, thực hiện giảm reference counter sau đó. Routine thực tế được nó dùng nội bộ, `refcount_dec_and_test()`, kiểm tra giá trị refcount mới đã giảm về `0` chưa; nếu có, trả về `true`, và điều này có nghĩa không ai tham chiếu task structure. Lời gọi `__put_task_struct()` giải phóng nó:

```
static inline void put_task_struct(struct task_struct *t)
{
    if (refcount_dec_and_test(&t->usage))
        __put_task_struct(t);
}
```

Một ví dụ khác về refcounting API được dùng trong kernel nằm ở `kernel/user.c` (giúp theo dõi số process, file, v.v. mà người dùng đã yêu cầu qua một per-user structure):

![Figure 7.1](images/ch07/fig07-01.png)

Hình 7.1 – Ảnh chụp việc dùng các interface refcount\_t trong kernel/user.c

Hãy tra tài liệu interface API `refcount_t` (`https://www.kernel.org/doc/html/latest/driver-api/basics.html#reference-counting`); `refcount_dec_and_lock_irqsave()` trả về `true` và giữ spinlock với interrupt bị vô hiệu hóa nếu có thể giảm reference counter về `0`, nếu không trả về `false`.

Bài tập cho bạn là chuyển driver code trước, `ch16/2_miscdrv_rdwr_spinlock/miscdrv_rdwr_spinlock.c`, sang dùng refcount; nó có các số nguyên `ga` và `gb`, được bảo vệ bằng spinlock khi đọc hoặc ghi. Bây giờ, hãy biến chúng thành refcount variable và dùng API `refcount_t` thích hợp khi thao tác. Cẩn thận! Đừng để giá trị ra ngoài khoảng cho phép `[0..[U]INT_MAX]`! (Nhớ rằng khoảng là `[1..UINT_MAX-1]` với full refcount validation (bật `CONFIG_REFCOUNT_FULL`) và `[1..INT_MAX]` khi không phải full validation (mặc định)). Làm vậy thường dẫn đến macro `WARN()` được gọi (code cho demo trong Hình 7.1 không có trong GitHub repository):

![Figure 7.2](images/ch07/fig07-02.png)

Hình 7.2 – (Một phần) ảnh chụp macro WARN() được kích hoạt khi cố đặt sai biến refcount\_t thành \<= 0

Kernel có hạ tầng kiểm thử thú vị và hữu ích gọi là Linux Kernel Dump Test Module (LKDTM); xem `drivers/misc/lkdtm/refcount.c` để biết nhiều test case chạy trên refcount interface mà bạn có thể học hỏi... Để bạn biết thêm, cũng có thể dùng LKDTM qua fault injection framework của kernel để kiểm thử và đánh giá phản ứng của kernel trước các tình huống lỗi (xem tài liệu tại đây: Provoking crashes with Linux Kernel Dump Test Module (LKDTM) – `https://www.kernel.org/doc/html/latest/fault-injection/provoke-crashes.html#provoking-crashes-with-linux-kernel-dump-test-module-lkdtm`).

Các atomic interface đã trình bày đều thao tác trên số nguyên 32-bit; còn 64-bit thì sao? Phần tiếp theo sẽ nói điều đó.

### Atomic integer operator 64-bit

Như đã đề cập lúc bắt đầu chủ đề, tập integer operator `atomic_t` đã trình bày đều thao tác trên số nguyên 32-bit truyền thống (thảo luận này không áp dụng cho interface `refcount_t` mới; chúng vốn hoạt động trên cả đại lượng 32-bit và 64-bit). Rõ ràng, khi hệ thống 64-bit hiện trở thành chuẩn thay vì ngoại lệ, cộng đồng kernel cung cấp tập atomic integer operator giống hệt cho số nguyên 64-bit. Khác biệt như sau:

- Khai báo atomic integer 64-bit dưới dạng biến kiểu `atomic64_t` (tức `atomic_long_t`).

- Với mọi operator, dùng tiền tố `atomic64_` thay cho `atomic_`.

Vậy hãy xét các ví dụ:

- Thay cho `ATOMIC_INIT()`, dùng `ATOMIC64_INIT()`.

- Thay cho `atomic_read()`, dùng `atomic64_read()`.

- Thay cho `atomic64_dec_if_positive()`, dùng `atomic64_dec_if_positive()`.

Các chuẩn ngôn ngữ C và C++ gần đây — C11 và C++11 — cung cấp atomic operations library giúp nhà phát triển triển khai atomicity dễ hơn nhờ hỗ trợ ngầm của ngôn ngữ; chúng ta không đi sâu khía cạnh này ở đây. Có thể tìm tài liệu tham khảo tại đây (C11 cũng có gần như các tương đương như vậy): `https://en.cppreference.com/w/c/atomic`.

Lưu ý rằng mọi routine này — cả atomic `_operators` 32-bit lẫn 64-bit — đều độc lập kiến trúc. Một điểm quan trọng cần nhắc lại là bất kỳ và mọi thao tác trên atomic integer đều phải được thực hiện bằng cách khai báo biến là `atomic_t` và dùng các method được cung cấp. Điều này bao gồm khởi tạo và cả thao tác đọc (số nguyên). Về triển khai nội bộ, một atomic integer operator `foo()` thường là macro trở thành inline function, rồi gọi hàm arch-specific `arch_foo()`. Như thường lệ, xem qua kernel documentation chính thức về atomic operator luôn là ý hay (trong kernel source tree, nằm ở đây: `Documentation/atomic_t.txt`; truy cập `https://www.kernel.org/doc/Documentation/atomic_t.txt`). Tài liệu phân loại gọn gàng nhiều atomic integer API thành những tập riêng. Để bạn biết thêm, vấn đề memory ordering arch-specific có ảnh hưởng đến triển khai nội bộ. Ở đây, chúng ta không đi sâu internals. Nếu quan tâm, hãy tham khảo trang trên kernel documentation chính thức tại `https://www.kernel.org/doc/html/v4.16/core-api/refcount-vs-atomic.html#refcount-t-api-compared-to-atomic-t` (ngoài ra, chi tiết memory ordering vượt phạm vi cuốn sách; xem kernel documentation tại `https://www.kernel.org/doc/Documentation/memory-barriers.txt` để biết thêm).

Ở đây chúng ta chưa cố trình bày mọi atomic API và refcount API (thực sự không cần thiết); kernel documentation chính thức đã bao quát:

- Interface `atomic_t`:

- Semantics and Behavior of Atomic and Bitmask Operations (`https://www.kernel.org/doc/html/v5.4/core-api/atomic_ops.html#semantics-and-behavior-of-atomic-and-bitmask-operations`)

- Tham khảo API: Atomics (`https://www.kernel.org/doc/html/latest/driver-api/basics.html#atomics`)

- Interface `refcount_t` (mới hơn) cho reference counting của kernel object:

- API `refcount_t` so với `atomic_t` (`https://www.kernel.org/doc/html/latest/core-api/refcount-vs-atomic.html#refcount-t-api-compared-to-atomic-t`)

- Tham khảo API: Reference counting (`https://www.kernel.org/doc/html/latest/driver-api/basics.html#reference-counting`)

Hãy chuyển sang cách dùng cấu trúc điển hình khi làm driver — Read Modify Write (RMW). Đọc tiếp!

## Dùng các RMW atomic operator

Cũng có tập atomic operator nâng cao hơn gọi là RMW API. Trong nhiều cách dùng (liệt kê ở mục tới) có thực hiện atomic RMW operation trên bit, nói cách khác thực hiện bitwise operation atomically (an toàn, không thể chia cắt). Với tư cách người viết device driver thao tác device register hay peripheral register, bạn thực sự sẽ dùng điều này.

Nội dung mục này giả định bạn có ít nhất kiến thức cơ bản về truy cập peripheral device (chip) memory và register; đã trình bày chi tiết trong `Chapter 3`, Làm việc với Hardware I/O Memory. Hãy bảo đảm hiểu trước khi đi tiếp.

Bạn rất thường cần thực hiện bit operation trên register, với các toán tử phổ biến nhất là bitwise `AND &` và bitwise `OR` `|`. Mục đích là sửa giá trị register bằng cách set hoặc clear một số bit trong nó. Vấn đề là chỉ thực hiện các thao tác C để query hoặc set device register vẫn chưa đủ. Đúng vậy: đừng quên các vấn đề concurrency! Hãy đọc tiếp để biết đầy đủ câu chuyện.

### RMW atomic operation – thao tác device register

Trước hết nhắc nhanh kiến thức cơ bản: byte có 8 bit, đánh số từ bit `0`, Least Significant Bit (LSB), đến bit `7`, Most Significant Bit (MSB). (Thực ra được định nghĩa chính thức thành macro `BITS_PER_BYTE` trong `include/linux/bits.h`, cùng vài định nghĩa thú vị khác.)

Register cơ bản là phần memory nhỏ trong peripheral device; thường kích thước, register bit width, là 8, 16 hoặc 32 bit. Device register cung cấp thông tin control, status và khác, thường lập trình được. Thực tế phần lớn công việc người viết driver là lập trình device register thích hợp để device làm gì đó, và truy vấn. Để cụ thể, xét device giả tưởng có hai register: status register và control register, mỗi cái rộng 8 bit. (Thực tế mọi device hay chip có datasheet cung cấp đặc tả chi tiết chip và hardware register-level; đây là tài liệu thiết yếu cho người viết driver). Người thiết kế hardware thường gom nhiều register tuần tự trong phần memory lớn hơn; gọi register banking. Có base address của register đầu và offset đến mỗi register sau giúp định địa chỉ register bất kỳ dễ dàng (ở đây không đi sâu cách register được “map” vào virtual address space trên OS như Linux). Ví dụ register (hoàn toàn giả tưởng) có thể mô tả trong header file:

```
#define REG_BASE        0x5a00
#define STATUS_REG      (REG_BASE+0x0)
#define CTRL_REG        (REG_BASE+0x1)
```

Bây giờ, giả sử để bật device giả định, datasheet cho biết chúng ta có thể đặt bit `7`, tức MSB, của control register thành `1`. Như mọi người viết driver sẽ nhanh chóng học được, có một trình tự chuẩn khi sửa register:

1\. Đọc giá trị register hiện tại vào temporary variable.

2\. Sửa variable thành giá trị mong muốn.

3\. Ghi variable trở lại register.

Thường gọi RMW sequence; tốt, viết (pseudo)code như sau:

```
turn_on_dev()
{
    u8 tmp;

    tmp = ioread8(CTRL_REG);  /* read: current register value into tmp */
    tmp |= 0x80;              /* modify: set bit 7 (MSB) */
    iowrite8(tmp, CTRL_REG);  /* write: new tmp value into register */
}
```

(Để bạn biết thêm, routine thực tế dùng trên Linux MMIO — memory-mapped I/O — là `ioread[8|16|32]()` và `iowrite[8|16|32]()`.)

Một điểm then chốt ở đây là cách này chưa đủ tốt, vì có concurrency và data race! Hãy nghĩ xem: register, cả CPU register lẫn device register, thực chất là một global shared writable memory location. Vì vậy, truy cập nó tạo thành critical section mà bạn phải bảo vệ khỏi concurrent access. Cách thực hiện khá đơn giản: ít nhất hiện tại, có thể sử dụng spinlock. Sửa pseudocode trước để chèn các API `spin_[un]lock()` vào critical section, tức RMW sequence, là việc đơn giản. Tuy nhiên, có một cách còn tốt hơn để đạt data safety khi làm việc với đại lượng nhỏ như số nguyên mà chúng ta đã trình bày: atomic operator! Linux còn đi xa hơn, cung cấp tập atomic API cho cả hai trường hợp sau:

- Atomic non-RMW operation (đã thấy trong mục Dùng các interface atomic\_t và refcount\_t)

- Các atomic RMW operation bao gồm nhiều loại operator, có thể phân thành các nhóm riêng: arithmetic, bitwise, swap (exchange), reference counting, miscellaneous và barrier

Đừng phát minh lại bánh xe; kernel documentation (`https://www.kernel.org/doc/Documentation/atomic_t.txt`) có đủ thông tin. Chỉ trình bày phần liên quan, trích trực tiếp từ `Documentation/atomic_t.txt` trong kernel code base:

```
// Documentation/atomic_t.txt
[ ... ]
Non-RMW ops:
  atomic_read(), atomic_set()
  atomic_read_acquire(), atomic_set_release()


RMW atomic operations:


Arithmetic:
  atomic_{add,sub,inc,dec}()
  atomic_{add,sub,inc,dec}_return{,_relaxed,_acquire,_release}()
  atomic_fetch_{add,sub,inc,dec}{,_relaxed,_acquire,_release}()


Bitwise:
  atomic_{and,or,xor,andnot}()
  atomic_fetch_{and,or,xor,andnot}{,_relaxed,_acquire,_release}()


Swap:
  atomic_xchg{,_relaxed,_acquire,_release}()
  atomic_cmpxchg{,_relaxed,_acquire,_release}()
  atomic_try_cmpxchg{,_relaxed,_acquire,_release}()


Reference count (but please see refcount_t):
  atomic_add_unless(), atomic_inc_not_zero()
  atomic_sub_and_test(), atomic_dec_and_test()
Misc:
  atomic_inc_and_test(), atomic_add_negative()
  atomic_dec_unless_positive(), atomic_inc_unless_negative()
[ ... ]
```

Tốt; giờ biết RMW (và non-RMW) operator, hãy thực hành — tiếp theo xem dùng RMW operator cho bit operation.

#### Dùng RMW bitwise operator

Ở đây, chúng ta tập trung vào sử dụng các RMW bitwise operator và để bạn tự khám phá những loại khác qua kernel documentation đã đề cập. Vì vậy, hãy nghĩ lại cách viết ví dụ pseudocode hiệu quả hơn. Chúng ta có thể đặt bất kỳ bit nào thành `1` trong register hoặc memory item bằng API `set_bit()`:

```
void set_bit(unsigned int nr, volatile unsigned long *p);
```

Thao tác này atomically — an toàn, không thể chia cắt — đặt bit thứ `nr` của `p` thành `1`. (Thực tế device register (và có thể device memory) được map vào kernel virtual address space nên hiển thị như RAM location — như địa chỉ `p` ở đây. Gọi MMIO, cách phổ biến để người viết driver map và làm việc với device memory.)

Vì vậy, dùng RMW atomic operator, có thể an toàn đạt điều trước đã thử (sai) — bật device (giả tưởng) — bằng một dòng code:

```
set_bit(7, CTRL_REG);
```

Bảng sau tóm tắt RMW bitwise atomic API phổ biến:

| RMW bitwise atomic API | Chú thích |
|---|---|
| `void set_bit(unsigned int nr, volatile` `unsigned long *p);` | Atomically set (đặt thành `1`) bit thứ `nr` của `p`. |
| `void clear_bit(unsigned int nr, volatile` `unsigned long *p)` | Atomically clear (đặt thành `0`) bit thứ `nr` của `p`. |
| `void change_bit(unsigned int nr,` `volatile unsigned long *p)` | Atomically toggle bit thứ `nr` của `p`. |
| Các API sau trả về giá trị trước của bit được thao tác (nr) |  |
| `int test_and_set_bit(unsigned int nr,` `volatile unsigned long *p)` | Atomically set bit thứ `nr` của `p`, trả giá trị trước (kernel API doc tại `https://www.kernel.org/doc/htmldocs/kernel-api/API-test-and-set-bit.html`). |
| `int test_and_clear_bit(unsigned int nr,` `volatile unsigned long *p)` | Atomically clear bit thứ `nr` của `p`, trả giá trị trước. |
| `int test_and_change_bit(unsigned int nr,` `volatile unsigned long *p)` | Atomically toggle bit thứ `nr` của `p`, trả giá trị trước. |

Bảng 17.3 – RMW bitwise atomic API phổ biến

Cẩn thận: các atomic API không chỉ atomic đối với CPU core đang chạy, mà giờ đối với tất cả/core khác. Thực tế, ngụ ý nếu thực hiện atomic operation song song trên nhiều CPU, tức chúng (có thể) race, thì đó là critical section và phải bảo vệ bằng lock (thường spinlock)!

Thử vài RMW atomic API giúp tự tin dùng; làm trong mục sau.

#### Dùng bitwise atomic operator – ví dụ

Xem nhanh kernel module minh họa RMW atomic bit operator của Linux kernel (`ch13/1_rmw_atomic_bitops`). Cần hiểu operator có thể làm việc trên mọi memory, cả register (CPU hay device) hoặc RAM; ở đây thao tác static global variable đơn giản (tên `mem`) trong LKM ví dụ. Rất đơn giản; hãy xem:

```
// ch13/1_rmw_atomic_bitops/rmw_atomic_bitops.c
[ ... ]
#include <linux/spinlock.h>
#include <linux/atomic.h>
#include <linux/bitops.h>
#include "../../convenient.h"
[ ... ]
static unsigned long mem;
static u64 t1, t2;
static int MSB = BITS_PER_BYTE - 1;
DEFINE_SPINLOCK(slock);
```

Include header cần, khai báo và khởi tạo vài global variable (chú ý biến `MSB` dùng `BIT_PER_BYTE`). Dùng macro đơn giản `SHOW()` hiển thị formatted output bằng printk. Code path `init` làm việc thực tế:

```
[ ... ]
#define SHOW(n, p, msg) do {                                   \
    pr_info("%2d:%27s: mem : %3ld = 0x%02lx\n", n, msg, p, p); \
} while (0)
[ ... ]
static int __init atomic_rmw_bitops_init(void)
{
    int i = 1, ret;

    pr_info("%s: inserted\n", OURMODNAME);
    SHOW(i++, mem, "at init");

    setmsb_optimal(i++);
    setmsb_suboptimal(i++);

    clear_bit(MSB, &mem);
    SHOW(i++, mem, "clear_bit(7,&mem)");

    change_bit(MSB, &mem);
    SHOW(i++, mem, "change_bit(7,&mem)");

    ret = test_and_set_bit(0, &mem);
    SHOW(i++, mem, "test_and_set_bit(0,&mem)");
    pr_info(" ret = %d\n", ret);

    ret = test_and_clear_bit(0, &mem);
    SHOW(i++, mem, "test_and_clear_bit(0,&mem)");
    pr_info(" ret (prev value of bit 0) = %d\n", ret);

    ret = test_and_change_bit(1, &mem);
    SHOW(i++, mem, "test_and_change_bit(1,&mem)");
    pr_info(" ret (prev value of bit 1) = %d\n", ret);

    pr_info("%2d: test_bit(%d-0,&mem):\n", i, MSB);
    for (i = MSB; i >= 0; i--)
        pr_info(" bit %d (0x%02lx) : %s\n", i, BIT(i), test_bit(i,
&mem)?"set":"cleared");

    return 0; /* success */
}
```

Các RMW atomic operator được sử dụng ở đây được in đậm. Một phần quan trọng của ví dụ minh họa này là cho thấy sử dụng RMW bitwise atomic operator không chỉ dễ hơn nhiều mà còn nhanh hơn nhiều so với cách truyền thống, trong đó chúng ta tự thực hiện RMW operation trong phạm vi được spinlock bảo vệ. Dưới đây là hai function cho hai cách tiếp cận:

```
/* Set the MSB; optimally, with the set_bit() RMW atomic API */
static inline void setmsb_optimal(int i)
{
    t1 = ktime_get_real_ns();
    set_bit(MSB, &mem);
    t2 = ktime_get_real_ns();
    SHOW(i, mem, "set_bit(7,&mem)");
    SHOW_DELTA(t2, t1);
}
/* Set the MSB; the traditional way, using a spinlock to protect the RMW
 * critical section  */
static inline void setmsb_suboptimal(int i)
{
    u8 tmp;

    t1 = ktime_get_real_ns();
    spin_lock(&slock);
    /* critical section: RMW : read, modify, write */
    tmp = mem;
    tmp |= 0x80; // 0x80 = 1000 0000 binary
    mem = tmp;
    spin_unlock(&slock);
    t2 = ktime_get_real_ns();

    SHOW(i, mem, "set msb suboptimal: 7,&mem");
    SHOW_DELTA(t2, t1);
}
```

Gọi các hàm sớm trong method `init`; chú ý lấy timestamp (qua routine `ktime_get_real_ns()`), hiển thị thời gian qua macro `SHOW_DELTA()` (định nghĩa trong header `convenient.h`). Đây là output:

![Figure 7.3](images/ch07/fig07-03.png)

Hình 7.3 – Ảnh chụp output LKM ch13/1\_rmw\_atomic\_bitops, thể hiện một số atomic RMW operator hoạt động

(Tôi chạy demo LKM trên guest VM Ubuntu 20.04 x86\_64.) Cách hiện đại — qua RMW atomic bitwise API `set_bit()` — trong lần chạy mẫu chỉ mất 415 nanosecond; cách truyền thống chậm hơn khoảng 265 lần! Code (qua `set_bit()`) cũng đơn giản hơn nhiều...

Có liên quan phần nào đến atomic bitwise operator, phần tiếp theo xem xét rất ngắn gọn các API hiệu quả cao có trong kernel để tìm kiếm trong bitmask, một thao tác hóa ra khá phổ biến trong kernel.

### Tìm kiếm bitmask hiệu quả

Nhiều thuật toán phụ thuộc tìm bitmask thật nhanh; nhiều scheduling algorithm (như `SCHED_FIFO` và `SCHED_RR`, đã học trong tài liệu đồng hành Linux Kernel Programming - Chương 10, CPU Scheduler – Phần 1, và Chương 11, CPU Scheduler – Phần 2) thường cần nội bộ. Triển khai hiệu quả trở nên quan trọng (đặc biệt code path performance-sensitive OS-level). Vì vậy kernel có vài API scan bitmask cho trước (prototype trong `include/asm-generic/bitops/find.h`):

- `unsigned long find_first_bit(const unsigned long` `*addr, unsigned long size)`: Tìm bit được set đầu tiên trong memory region; trả bit number của bit được set đầu tiên, nếu không (không bit nào set) trả `@size`.

- `unsigned long find_first_zero_bit(const unsigned long` `*addr, unsigned long size)`: Tìm bit bị clear đầu tiên trong memory region; trả bit number của bit clear đầu tiên, nếu không (không bit nào clear) trả `@size`.

- Routine khác gồm `find_next_bit()`, `find_next_and_bit()`, `find_last_bit()`.

Xem header \<`linux/bitops.h>` còn thấy macro thú vị khác như `for_each_{clear,set}_bit{_from}()`.

## Dùng reader-writer spinlock

Hãy hình dung một đoạn kernel code hoặc driver code đang tìm kiếm trong một global doubly linked circular list lớn, có vài nghìn node. Vì data structure này là global, được chia sẻ và có thể ghi, việc truy cập nó tạo thành critical section cần bảo vệ.

Giả sử việc tìm kiếm trong list là một non-blocking operation, bạn thường sử dụng spinlock để bảo vệ critical section. Một cách tiếp cận đơn giản có thể đề xuất không dùng lock vì chúng ta chỉ đọc data trong list, không cập nhật nó. Nhưng dĩ nhiên, như đã học, ngay cả việc đọc shared writable data cũng phải được bảo vệ để tránh thao tác ghi vô ý xảy ra đồng thời, dẫn đến dirty read hoặc torn read. Vì vậy, chúng ta kết luận cần spinlock và hình dung pseudocode có dạng như sau:

```
spin_lock(mylist_lock);
for (p = &listhead; (p = next_node(p)) != &listhead; ) {
    << ... search for something ...
         found? break out ... >>
}
spin_unlock(mylist_lock);
```

Vậy vấn đề là gì? Dĩ nhiên là hiệu năng! Hãy tưởng tượng nhiều thread trên multicore system đi đến đoạn code này gần như cùng lúc. Mỗi thread cố lấy spinlock, nhưng chỉ một thread thắng cuộc lấy được, duyệt toàn bộ list rồi unlock, cho phép thread tiếp theo tiếp tục. Nói cách khác, đúng như dự kiến, việc thực thi giờ được tuần tự hóa, làm mọi thứ chậm đi đáng kể. Nhưng không thể tránh điều đó, hay vẫn có thể?

Đây là lúc reader-writer spinlock phát huy vai trò. Cơ chế locking này yêu cầu mọi thread đọc data được bảo vệ phải yêu cầu read lock, còn bất kỳ thread nào cần ghi vào list phải yêu cầu exclusive write lock. Read lock được cấp ngay cho thread yêu cầu, miễn là hiện không có write lock. Thực chất, cơ chế này cho phép mọi reader truy cập data đồng thời, nghĩa là không có việc khóa thực sự giữa các reader. Điều này ổn khi chỉ có reader. Ngay khi một writer thread xuất hiện, nó yêu cầu write lock. Lúc này, ngữ nghĩa locking thông thường được áp dụng: writer phải đợi mọi reader unlock. Sau đó, writer lấy exclusive write lock và tiếp tục. Vì vậy, nếu reader hoặc writer khác cố truy cập, chúng buộc phải spin chờ writer unlock.

Vì vậy, trong những tình huống mà kiểu truy cập data có thao tác đọc rất thường xuyên, thao tác ghi hiếm và critical section khá dài, reader-writer spinlock là lựa chọn giúp cải thiện hiệu năng, tức performance-enhancing.

### Reader-writer spinlock interface

Nếu đã sử dụng spinlock, việc dùng biến thể reader-writer khá đơn giản. Kiểu data của lock được trừu tượng hóa thành structure `rwlock_t` thay cho `spinlock_t`, và về tên API, chỉ cần thay `spin` bằng `read` hoặc `write`:

```
#include <linux/rwlock.h>
rwlock_t mylist_lock;
```

API cơ bản nhất của reader-writer spinlock:

```
void read_lock(rwlock_t *lock);
void write_lock(rwlock_t *lock);
```

Ví dụ layer `tty` của kernel có code xử lý Secure Attention Key (SAK); SAK là tính năng bảo mật, ngăn hack credential Trojan horse-type bằng kill mọi process gắn với TTY device. Xảy ra khi người dùng nhấn SAK (`https://www.kernel.org/doc/html/latest/security/sak.html`). Khi thực sự xảy ra (nhấn SAK, mặc định map vào chuỗi `Alt-SysRq-k`), trong code path phải duyệt mọi task, kill toàn session và mọi thread có TTY device đang mở. Để làm cần lấy reader-writer spinlock `tasklist_lock` ở read mode. Code liên quan (cắt bớt) sau, tô nổi bật `read_[un]lock()` trên `tasklist_lock`:

```
// drivers/tty/tty_io.c
void __do_SAK(struct tty_struct *tty)
{
    [...]
    read_lock(&tasklist_lock);
    /* Kill the entire session */
    do_each_pid_task(session, PIDTYPE_SID, p) {
        tty_notice(tty, "SAK: killed process %d (%s): by session\n",
task_pid_nr(p), p->comm);
        group_send_sig_info(SIGKILL, SEND_SIG_PRIV, p, PIDTYPE_SID);
    } while_each_pid_task(session, PIDTYPE_SID, p);
    [...]
    /* Now kill any processes that happen to have the tty open */
    do_each_thread(g, p) {
        [...]
    } while_each_thread(g, p);
    read_unlock(&tasklist_lock);
```

Ghi chú, trong tài liệu đồng hành Linux Kernel Programming - Chương 6, mục Kiến thức thiết yếu về Kernel Internals, Process và Thread, Duyệt task list, đã làm tương tự: viết kernel module (`https://github.com/PacktPublishing/Linux-Kernel-Programming/blob/master/ch6/foreach/thrd_showall/thrd_showall.c`) duyệt mọi thread trong task list, xuất vài chi tiết mỗi thread. Giờ hiểu concurrency, lẽ ra phải lấy chính lock này — `tasklist_lock` — reader-writer spinlock bảo vệ task list? Có, nhưng không hoạt động (`insmod(8)` thất bại với thông báo `thrd_showall: Unknown` `symbol tasklist_lock (err -2)`). Tất nhiên vì biến `tasklist_lock` không export nên kernel module không dùng được. Ví dụ khác về reader-writer spinlock trong kernel code base, filesystem `ext4` dùng khi làm việc với extent status tree. Không đi sâu ở đây; chỉ nói reader-writer spinlock (trong inode structure, `inode->i_es_lock`) được dùng khá nhiều bảo vệ extent status tree khỏi data race (`fs/ext4/extents_status.c`).

Có nhiều ví dụ trong kernel source tree; nhiều nơi ở network stack gồm ping code (`net/ipv4/ping.c`) dùng `rwlock_t`, routing table lookup, neighbor, PPP code, filesystem, v.v.

Giống spinlock thường, có biến thể reader-writer spinlock API: `{read,write}_lock_irq{save}()` ghép với `{read,write}_unlock_irq{restore}()` tương ứng, cùng interface `{read,write}_{un}lock_bh()`. Lưu ý ngay read IRQ lock cũng disable kernel preemption.

### Lưu ý thận trọng

Với reader-writer spinlock, vẫn có những vấn đề. Một vấn đề điển hình là writer có thể bị starvation khi bị block để chờ nhiều reader. Hãy nghĩ xem: giả sử ba reader thread đang giữ reader-writer lock. Một writer xuất hiện và muốn lấy lock. Nó phải đợi cả ba reader unlock. Nhưng nếu trong lúc đó có thêm reader đến, điều hoàn toàn có thể xảy ra, thì sao? Điều này trở thành vấn đề nghiêm trọng với writer vì nó phải chờ lâu hơn nữa, thực chất là bị starvation. Có thể cần instrument hoặc profile cẩn thận các code path liên quan để xác định liệu đây có thực sự là nguyên nhân hay không.

Không chỉ vậy, cache effect — gọi cache ping-pong — có thể và thường xảy ra khi nhiều reader thread trên CPU core khác nhau đọc cùng shared state song song (khi giữ reader-writer lock); thực tế thảo luận trong mục Ảnh hưởng của cache và false sharing). Kernel documentation về spinlock (`https://www.kernel.org/doc/Documentation/locking/spinlocks.txt`) nói tương tự. Trích trực tiếp: “LƯU Ý! reader-writer lock cần nhiều atomic memory operation hơn spinlock đơn giản. Trừ khi reader critical section dài, tốt hơn chỉ dùng spinlock.” Thực tế cộng đồng kernel đang loại bỏ reader-writer spinlock nhiều nhất có thể, chuyển sang kỹ thuật lock-free tốt hơn (như RCU - Read Copy Update, công nghệ lock-free nâng cao). Vì vậy không nên dùng tùy tiện reader-writer spinlock.

Kernel documentation gọn và đơn giản về spinlock (chính Linus Torvalds viết), rất đáng đọc, tại: `https://www.kernel.org/doc/Documentation/locking/spinlocks.txt`.

### reader-writer semaphore

Trước đã đề cập semaphore object (`Chapter 6`, Kernel Synchronization – Phần 1, mục Semaphore và mutex), so sánh với mutex. Đã hiểu tốt hơn đơn giản dùng mutex. Ở đây chỉ ra trong kernel, cũng như reader-writer spinlock, có reader-writer semaphore. Use case và semantics tương tự reader-writer spinlock. Macro/API liên quan (trong `<linux/rwsem.h>`) là `{down,up}_{read,write}_{trylock,killable}()`. Ví dụ phổ biến trong cấu trúc `struct mm_struct` (nằm trong task structure), một member là reader-writer semaphore: `struct rw_semaphore mmap_sem;`.

Để kết thúc phần thảo luận này, chúng ta chỉ đề cập thêm một vài synchronization mechanism liên quan trong kernel. Một cơ chế được sử dụng nhiều khi phát triển ứng dụng user space, đặc biệt với Pthreads framework trong Linux user space, là Condition Variable (CV). Nói ngắn gọn, nó cho phép từ hai thread trở lên đồng bộ với nhau dựa trên giá trị của một data item hoặc một state cụ thể. Cơ chế tương đương trong Linux kernel được gọi là completion mechanism. Hãy tìm chi tiết về cách sử dụng trong kernel documentation tại `https://www.kernel.org/doc/html/latest/scheduler/completion.html#completions-wait-for-completion-barrier-apis`.

Sequence lock được sử dụng trong những tình huống chủ yếu là ghi, trái với các lock reader-write spinlock/semaphore phù hợp cho những tình huống chủ yếu là đọc, nơi số lần ghi vượt xa số lần đọc trên biến được bảo vệ. Như bạn có thể hình dung, điều này không quá phổ biến; một ví dụ tốt về sử dụng sequence lock là cập nhật biến global `jiffies_64`.

Ai tò mò, code cập nhật global `jiffies_64` bắt đầu tại `kernel/time/tick-sched.c:tick_do_update_jiffies64()`. Hàm xác định có cần cập nhật jiffies không, nếu có gọi `do_timer(++ticks);` để thực sự cập nhật. Suốt lúc đó API `write_seq[un]lock(&jiffies_lock);` bảo vệ critical section write-critical.

## Ảnh hưởng của cache và false sharing

Processor hiện đại sử dụng nhiều cấp cache memory song song bên trong để tăng tốc đáng kể khi làm việc với memory. Chúng ta đã đề cập ngắn gọn trong tài liệu đồng hành Linux Kernel Programming - Chương 8, Cấp phát Kernel Memory cho người viết Module – Phần 1, phần Cấp phát slab memory. CPU hiện đại thực sự không đọc và ghi RAM trực tiếp. Khi software yêu cầu đọc một byte RAM từ một địa chỉ, CPU thực tế đọc nhiều byte, cả một cacheline thường gồm 64 byte, từ địa chỉ bắt đầu vào các CPU cache như L1, L2 và L3, tức cấp 1, 2 và 3. Nhờ vậy, truy cập những phần tử tiếp theo trong memory liên tục nhanh hơn rất nhiều vì trước tiên các cache được kiểm tra, lần lượt L1, L2 rồi L3, khiến cache hit có khả năng xảy ra cao. Lý do nhanh hơn nhiều rất đơn giản: truy cập CPU cache memory thường mất một đến vài nanosecond, tức single-digit, còn truy cập RAM có thể mất từ 50 đến 100 nanosecond. Dĩ nhiên, điều này phụ thuộc hardware cụ thể và số tiền bạn sẵn sàng bỏ ra!

Nhà phát triển software tận dụng hiện tượng này bằng những việc như:

- Giữ member quan trọng của data structure cạnh nhau (hy vọng trong một cacheline) và ở đầu structure

- Padding structure member để không vượt khỏi cacheline (đã trình bày trong tài liệu đồng hành Linux Kernel Programming - Chương 8, Cấp phát Kernel Memory cho người viết Module – Phần 1, mục Data structure – vài mẹo thiết kế)

Tuy nhiên có rủi ro và mọi thứ có thể sai. Ví dụ hai biến khai báo: `u16 ax = 1, bx = 2;` (`u16` là unsigned integer 16-bit).

Vì được khai báo liền nhau, rất có thể các biến sẽ nằm trong cùng một CPU cacheline ở runtime. Để hiểu vấn đề, hãy xét ví dụ sau: một multicore system có hai CPU core, mỗi core có hai CPU cache L1 và L2, cùng một L3 cache dùng chung. Thread T1 làm việc với biến `ax`, còn thread T2 đồng thời làm việc với biến `bx` trên một CPU core khác. Hãy nghĩ xem: khi T1 chạy trên CPU `0` truy cập `ax` từ main memory (RAM), các CPU cache của nó được nạp các giá trị hiện tại của cả `ax` lẫn `bx` vì chúng nằm trong cùng cacheline! Tương tự, khi T2 chạy trên CPU `1` truy cập `bx` từ RAM, các CPU cache của nó cũng được nạp giá trị hiện tại của cả hai biến. Hình 7.4 minh họa tình huống này về mặt khái niệm:

![Figure 7.4](images/ch07/fig07-04.png)

Hình 7.4 – Mô tả khái niệm CPU cache memory khi T1 và T2 làm việc song song trên hai biến liền nhau, mỗi thread trên một biến riêng

Đến đây mọi thứ vẫn ổn; nhưng nếu T1 thực hiện một thao tác, chẳng hạn `ax ++`, trong khi T2 đồng thời thực hiện `bx ++`, thì sao? Nhân tiện, bạn có thể thắc mắc vì sao chúng không dùng lock. Điều thú vị là chuyện đó không liên quan đến phần thảo luận này: không có data race vì mỗi thread truy cập một biến khác nhau. Vấn đề nằm ở việc chúng ở trong cùng một CPU cacheline.

Vấn đề nằm ở cache coherency. Processor hoặc hệ điều hành phối hợp với processor phải giữ cho cache và RAM đồng bộ, nhất quán với nhau; mọi chi tiết này đều rất arch-dependent. Vì vậy, ngay khi T1 sửa `ax`, cacheline tương ứng của CPU `0` phải được invalidate, tức một thao tác flush CPU cacheline từ cache của CPU `0` đến RAM diễn ra để cập nhật RAM bằng giá trị mới. Ngay sau đó, cũng phải có cập nhật từ RAM-to-CPU `1` đến cache để giữ mọi thứ nhất quán!

Nhưng cacheline cũng chứa `bx`, và như đã nói, T2 cũng đã sửa `bx` trên CPU `1`. Vì vậy, gần như cùng lúc, cacheline của CPU `1` được flush đến RAM với giá trị mới của `bx`, sau đó cập nhật đến cache của CPU `0`; trong suốt quá trình này, unified L3 cache cũng được đọc và cập nhật. Như bạn có thể hình dung, mọi cập nhật những biến này gây ra rất nhiều lưu lượng giữa cache và RAM, khiến data nảy qua lại. Thực tế, điều này thường được gọi là cache ping-pong! Hiệu ứng rất có hại, làm xử lý chậm đáng kể. Hiện tượng này được gọi là false sharing. Nhận ra false sharing mới là phần khó: chúng ta phải tìm những biến nằm trên shared cacheline được các context khác nhau, như thread hoặc những context khác, cập nhật đồng thời.

Thú vị là triển khai trước của data structure then chốt ở memory management layer, `include/linux/mmzone.h:struct zone`, gặp chính false sharing: hai spinlock khai báo liền nhau! Đã sửa từ lâu (nói ngắn về memory zone trong tài liệu đồng hành Linux Kernel Programming - Chương 7, Kiến thức thiết yếu về Memory Management Internals, mục Tổ chức physical RAM/zone).

Bạn sửa false sharing này như thế nào? Rất đơn giản: chỉ cần bảo đảm các biến nằm đủ xa nhau để chắc chắn chúng không dùng chung cacheline. Các byte padding giả thường được chèn giữa các biến cho mục đích này. Bạn cũng nên xem các tài liệu về false sharing trong phần Đọc thêm.

## Lập trình Lock-free với per-CPU variable

Như đã học, khi thao tác trên shared writable data, critical section phải được bảo vệ bằng một cách nào đó. Locking có lẽ là kỹ thuật phổ biến nhất để thực hiện việc bảo vệ này. Tuy nhiên, mọi thứ không hoàn toàn thuận lợi vì hiệu năng có thể giảm. Để hiểu vì sao, hãy xét một vài hình ảnh so sánh với lock. Một hình ảnh là chiếc phễu có cuống chỉ đủ rộng cho một thread đi qua mỗi lần, không hơn. Hình ảnh khác là một trạm thu phí duy nhất trên đường cao tốc đông đúc hoặc đèn giao thông ở giao lộ bận rộn. Những ví dụ này giúp hình dung vì sao locking có thể tạo bottleneck, trong các trường hợp nghiêm trọng khiến hiệu năng giảm đến mức rất chậm. Tệ hơn, các tác động xấu có thể tăng lên trên multicore system high-end có vài trăm core; thực chất, locking không mở rộng tốt.

Một vấn đề khác là lock contention: một lock cụ thể được acquire thường xuyên đến mức nào? Tăng số lock trong hệ thống có lợi ích là giảm contention đối với một lock giữa hai hoặc nhiều process hay thread. Điều này được gọi là lock proficiency. Tuy nhiên, cách này cũng không mở rộng vô hạn: đến một mức nào đó, có hàng nghìn lock trên hệ thống, thực tế là trường hợp Linux kernel, không phải điều tốt vì khả năng xuất hiện deadlock tinh vi tăng đáng kể. Vì vậy, tồn tại nhiều thách thức: vấn đề hiệu năng, deadlock, nguy cơ priority inversion, convoying và những vấn đề khác. Convoying xảy ra khi do lock ordering, các code path nhanh phải chờ code path chậm hơn đã lấy trước một lock mà chúng cũng cần. Phát triển kernel lên một mức mở rộng cao hơn nữa đòi hỏi sử dụng các lock-free algorithm và triển khai chúng trong kernel. Điều này dẫn đến nhiều kỹ thuật sáng tạo, trong đó có per-CPU (PCP) data, lock-free data structure theo thiết kế và RCU.

Tuy nhiên, trong cuốn sách này, chúng ta chỉ chọn trình bày tương đối chi tiết per-CPU như một kỹ thuật lập trình lock-free. Chi tiết về RCU và lock-free data structure liên quan theo thiết kế nằm ngoài phạm vi sách. Hãy tham khảo phần Đọc thêm của chương này để có những tài liệu hữu ích về RCU, ý nghĩa và cách sử dụng nó trong Linux kernel.

### Per-CPU variable

Như tên gọi, biến per-CPU hoạt động bằng cách giữ một bản sao của biến, tức data item liên quan, cho mỗi CPU đang hoạt động trên hệ thống. Thực chất, chúng ta loại bỏ vùng gây vấn đề concurrency, tức critical section, bằng cách tránh chia sẻ data giữa các thread. Với kỹ thuật per-CPU data, vì mỗi CPU tham chiếu đến bản sao data của riêng mình, thread chạy trên processor đó có thể thao tác mà không lo race. Điều này gần tương tự biến cục bộ: vì chúng nằm trên private stack của mỗi thread, chúng không được chia sẻ giữa các thread, nên không có critical section và không cần locking. Ở đây, nhu cầu locking cũng bị loại bỏ, khiến nó trở thành một kỹ thuật lock-free!

Hãy nghĩ xem: nếu chạy trên hệ thống có bốn CPU core đang hoạt động, một biến per-CPU về cơ bản là array gồm bốn phần tử. Phần tử `0` biểu diễn giá trị data trên CPU thứ nhất, phần tử `1` biểu diễn giá trị trên CPU core thứ hai, v.v. Hiểu điều này, bạn sẽ thấy các biến per-CPU cũng gần tương tự cách triển khai Thread Local Storage (TLS) của Pthreads trong user space, nơi mỗi thread tự động nhận một bản sao của biến TLS đánh dấu bằng từ khóa `__thread`. Trong cả trường hợp đó lẫn trường hợp biến per-CPU ở đây, điều cần nhớ là chỉ sử dụng biến per-CPU cho data item nhỏ. Lý do là data item được sao chép thành một instance cho mỗi CPU core; trên hệ thống high-end có vài trăm core, overhead sẽ tăng. Chúng ta đề cập một số ví dụ sử dụng per-CPU trong kernel code base ở phần Sử dụng Per-CPU trong kernel. Khi làm việc với biến per-CPU, bạn phải sử dụng các helper method, gồm macro và API do kernel cung cấp, không cố truy cập trực tiếp, tương tự những gì đã thấy với refcount và atomic operator.

#### Làm việc với per-CPU

Chúng ta hãy tiếp cận các helper API và macro, tức các method cho per-CPU data, bằng cách chia phần thảo luận thành hai phần. Trước tiên, bạn sẽ học cách cấp phát, khởi tạo rồi giải phóng một per-CPU data item. Sau đó, bạn sẽ học cách làm việc với nó, tức đọc và ghi.

##### Cấp phát, khởi tạo và giải phóng per-CPU variable

Nhìn chung, có hai loại biến per-CPU: được cấp phát tĩnh và được cấp phát động. Các biến per-CPU được cấp phát tĩnh ngay tại compile time, thường qua một trong các macro `DEFINE_PER_CPU` hoặc `DECLARE_PER_CPU`. Sử dụng macro `DEFINE` cho phép cấp phát và khởi tạo biến. Dưới đây là ví dụ cấp phát một số nguyên làm biến per-CPU:

```
#include <linux/percpu.h>
DEFINE_PER_CPU(int, pcpa);      // signature: DEFINE_PER_CPU(type, name)
```

Trên hệ thống bốn CPU core chẳng hạn, về khái niệm khi khởi tạo như sau:

![Figure 7.5](images/ch07/fig07-05.png)

Hình 7.5 – Biểu diễn khái niệm per-CPU data trên hệ thống bốn CPU live

Dĩ nhiên, cách triển khai thực tế phức tạp hơn đáng kể; hãy tham khảo phần Đọc thêm của chương này để biết thêm về cách triển khai bên trong. Nói ngắn gọn, sử dụng các biến per-CPU giúp cải thiện hiệu năng trên các code path time-sensitive vì những lý do sau:

- Tránh lock tốn kém làm performance-busting.

- Việc truy cập và thao tác trên biến per-CPU được bảo đảm duy trì trên một CPU core cụ thể. Điều này loại bỏ các hiệu ứng cache tốn kém như cache ping-pong và false sharing, đã trình bày trong phần Ảnh hưởng của cache và false sharing.

Cấp phát động per-CPU data qua wrapper macro `alloc_percpu()` hoặc `alloc_percpu_gfp()`, chỉ truyền kiểu dữ liệu object cần cấp phát per-CPU, với macro sau truyền thêm allocation flag `gfp`:

```
alloc_percpu[_gfp](type [,gfp]);
```

Routine bên dưới `__alloc_per_cpu[_gfp]()` export qua `EXPORT_SYMBOL_GPL()` (nên chỉ dùng khi LKM phát hành GPL-compatible license).

Như đã học, các biến thể API resource-managed `devm_*()` cho phép bạn sử dụng thuận tiện các routine này để cấp phát memory, thường khi viết driver. Kernel sẽ lo việc giải phóng, giúp ngăn các tình huống memory leak. Macro `devm_alloc_percpu(dev, type)` cho phép sử dụng cơ chế này như phiên bản resource-managed của `__alloc_percpu()`.

Memory cấp phát qua routine trên phải giải phóng sau bằng API `void free_percpu(void __percpu *__pdata)`.

##### Thực hiện I/O (đọc và ghi) trên per-CPU variable

Dĩ nhiên, câu hỏi then chốt là chính xác bạn truy cập, tức đọc, và cập nhật, tức ghi, các biến per-CPU như thế nào? Kernel cung cấp một số helper routine cho việc này; hãy xét một ví dụ đơn giản để hiểu cách thực hiện. Chúng ta định nghĩa một biến per-CPU kiểu integer và sau đó muốn truy cập, in giá trị hiện tại của nó. Bạn cần hiểu rằng vì là per-CPU, giá trị được lấy sẽ được tính tự động, hay auto-calculated, dựa trên CPU core mà code đang chạy. Nói cách khác, nếu code sau chạy trên core `1`, về thực chất giá trị `pcpa[1]` được fetch. Cách triển khai không chính xác như vậy; đây chỉ là mô tả khái niệm:

```
DEFINE_PER_CPU(int, pcpa);
int val;
[ ... ]
val = get_cpu_var(pcpa);
pr_info("cpu0: pcpa = %+d\n", val);
put_cpu_var(pcpa);
```

Cặp macro `{get,put}_cpu_var()` cho lấy/sửa per-CPU value an toàn của per-CPU variable cho trước (tham số). Quan trọng hiểu code giữa `get_cpu_var()` và `put_cpu_var()` (hay tương đương) thực chất là critical section — atomic context — nơi disable kernel preemption, cấm mọi blocking (hay sleeping). Nếu làm bất cứ gì block (sleep) ở đây là kernel bug. Ví dụ xem khi cố cấp phát memory bằng `vmalloc()` trong cặp macro `get_cpu_var()`/`put_cpu_var()`:

```
void *p;
val = get_cpu_var(pcpa);
p = vmalloc(20000);
pr_info("cpu1: pcpa = %+d\n", val);
put_cpu_var(pcpa);
vfree(p);
[ ... ]

$ sudo insmod <whatever>.ko
$ dmesg
[ ... ]
BUG: sleeping function called from invalid context at mm/slab.h:421
[67641.443225] in_atomic(): 1, irqs_disabled(): 0, pid: 12085, name:
thrd_1/1
[ ... ]
$
```

(Nhân tiện gọi wrapper `printk()` (hay `pr_<foo>()`) trong critical section như đang làm là ổn vì non-blocking.) Vấn đề là API `vmalloc()` có thể blocking; có thể sleep (thảo luận chi tiết trong tài liệu đồng hành Linux Kernel Programming - Chương 9, Cấp phát Kernel Memory cho người viết Module – Phần 2, mục Tìm hiểu và dùng kernel API vmalloc()), trong khi code giữa cặp `get_cpu_var()`/`put_cpu_var()` phải atomic, non-blocking.

Bên trong, macro `get_cpu_var()` gọi `preempt_disable()` để disable kernel preemption, còn `put_cpu_var()` hoàn tác việc này bằng cách gọi `preempt_enable()`. Như đã thấy trong các chương về CPU scheduling của tài liệu đồng hành Linux Kernel Programming, các lời gọi này có thể lồng nhau và kernel duy trì biến `preempt_count` để xác định kernel preemption thực sự đang enabled hay disabled. Kết luận là bạn phải ghép cặp cẩn thận các macro `{get,put}_cpu_var()` khi sử dụng. Ví dụ, nếu gọi macro `get` hai lần, cũng phải gọi macro `put` tương ứng hai lần.

`get_cpu_var()` là lvalue nên có thể thao tác; ví dụ tăng per-CPU variable `pcpa`, chỉ cần:

```
get_cpu_var(pcpa) ++;
put_cpu_var(pcpa);
```

Cũng có thể lấy per-CPU value hiện tại (an toàn) qua macro:

```
per_cpu(var, cpu);
```

Vậy để lấy per-CPU variable `pcpa` cho mỗi CPU core hệ thống, dùng:

```
for_each_online_cpu(i) {
    val = per_cpu(pcpa, i);
    pr_info(" cpu %2d: pcpa = %+d\n", i, val);
}
```

Để biết thêm, luôn có thể dùng macro `smp_processor_id()` xác định đang chạy CPU core nào; thực tế chính cách macro `convenient.h:PRINT_CTX()` làm.

Theo cách tương tự, kernel cung cấp các routine làm việc với pointer đến các biến cần là per-CPU, gồm các macro `{get,put}_cpu_ptr()` và `per_cpu_ptr()`. Các macro này được sử dụng nhiều khi làm việc với per-CPU data structure thay vì chỉ một số nguyên đơn giản. Chúng ta lấy an toàn pointer đến structure của CPU hiện đang chạy và sử dụng nó qua `per_cpu_ptr()`.

#### Per-CPU – kernel module ví dụ

hands-on sample per-CPU demo kernel module chắc chắn giúp dùng tính năng mạnh này (code: `ch13/2_percpu`). Ở đây định nghĩa và dùng hai per-CPU variable:

- per-CPU integer cấp phát và khởi tạo tĩnh

- per-CPU data structure cấp phát động

Để minh họa các biến per-CPU theo một cách thú vị, chúng ta hãy làm như sau: cho kernel module minh họa tạo ra hai kernel thread, gọi là `thrd_0` và `thrd_1`. Sau khi tạo, chúng ta sử dụng CPU mask và API để gắn affinity của kernel thread `thrd_0` với CPU `0`, và kernel thread `thrd_1` với CPU `1`. Vì vậy, chúng chỉ được schedule chạy trên những core này; dĩ nhiên, phải kiểm thử code trên VM có ít nhất hai CPU core.

Các code snippet sau minh họa cách chúng ta định nghĩa và sử dụng các biến per-CPU. Chúng tôi bỏ phần code tạo kernel thread và thiết lập CPU affinity mask vì chúng không liên quan đến phạm vi chương này; tuy vậy, điều quan trọng là phải đọc toàn bộ code và thử chạy nó!

```
// ch13/2_percpu/percpu_var.c
[ ... ]
/*--- The per-cpu variables, an integer 'pcpa' and a data structure --- */
/* This per-cpu integer 'pcpa' is statically allocated and initialized to 0
*/
DEFINE_PER_CPU(int, pcpa);

/* This per-cpu structure will be dynamically allocated via alloc_percpu()
*/
static struct drv_ctx {
    int tx, rx; /* here, as a demo, we just use these two members,
                   ignoring the rest */
    [ ... ]
} *pcp_ctx;
[ ... ]

static int __init init_percpu_var(void)
{
    [ ... ]
    /* Dynamically allocate the per-cpu structures */
    ret = -ENOMEM;
    pcp_ctx = (struct drv_ctx __percpu *) alloc_percpu(struct drv_ctx);
    if (!pcp_ctx) {
        [ ... ]
}
```

Vì sao không dùng resource-managed `devm_alloc_percpu()`? Có, nên dùng khi phù hợp; nhưng ở đây không viết driver đúng nghĩa, không có pointer `struct device *dev` sẵn, là tham số đầu bắt buộc của `devm_alloc_percpu()`.

Nhân tiện, tôi gặp một vấn đề khi viết kernel module này: để đặt CPU mask nhằm thay đổi CPU affinity của từng kernel thread, kernel API là function `sched_setaffinity()`. Đáng tiếc, function này không được export nên chúng ta không thể sử dụng. Vì vậy, chúng ta thực hiện một cách rõ ràng được xem là hack: lấy address của function không hợp tác qua `kallsyms_lookup_name()`, hoạt động khi `CONFIG_KALLSYMS` được định nghĩa, rồi gọi qua function pointer. Cách này hoạt động nhưng chắc chắn không phải cách viết code đúng.

Ý tưởng thiết kế của chúng ta là tạo hai kernel thread và để mỗi thread thao tác khác nhau trên các biến data per-CPU. Nếu đây là các global variable thông thường, nó chắc chắn tạo thành critical section và dĩ nhiên cần lock. Nhưng ở đây, chính vì các biến là per-CPU và chúng ta bảo đảm các thread chạy trên core riêng, chúng ta có thể cập nhật chúng đồng thời với data khác nhau! Kernel thread worker routine như sau; argument của nó là số hiệu thread, `0` hoặc `1`. Theo đó, chúng ta rẽ nhánh và thao tác trên per-CPU data: kernel thread đầu tăng số nguyên ba lần, còn kernel thread thứ hai giảm nó ba lần.

```
/* Our kernel thread worker routine */
static int thrd_work(void *arg)
{
    int i, val;
    long thrd = (long)arg;
    struct drv_ctx *ctx;
    [ ... ]

    /* Set CPU affinity mask to 'thrd', which is either 0 or 1 */
    if (set_cpuaffinity(thrd) < 0) {
        [ ... ]
    SHOW_CPU_CTX();

    if (thrd == 0) { /* our kthread #0 runs on CPU 0 */
        for (i=0; i<THRD0_ITERS; i++) {
            /* Operate on our perpcu integer */
            val = ++ get_cpu_var(pcpa);
            pr_info(" thrd_0/cpu0: pcpa = %+d\n", val);
            put_cpu_var(pcpa);

            /* Operate on our perpcu structure */
            ctx = get_cpu_ptr(pcp_ctx);
            ctx->tx += 100;
            pr_info(" thrd_0/cpu0: pcp ctx: tx = %5d, rx = %5d\n",
                ctx->tx, ctx->rx);
            put_cpu_ptr(pcp_ctx);
        }
    } else if (thrd == 1) { /* our kthread #1 runs on CPU 1 */
        for (i=0; i<THRD1_ITERS; i++) {
            /* Operate on our perpcu integer */
            val = -- get_cpu_var(pcpa);
            pr_info(" thrd_1/cpu1: pcpa = %+d\n", val);
            put_cpu_var(pcpa);
            /* Operate on our perpcu structure */
            ctx = get_cpu_ptr(pcp_ctx);
            ctx->rx += 200;
            pr_info(" thrd_1/cpu1: pcp ctx: tx = %5d, rx = %5d\n",
                ctx->tx, ctx->rx);
            put_cpu_ptr(pcp_ctx);
        }
    }
    disp_vars();
    pr_info("Our kernel thread #%ld exiting now...\n", thrd);
    return 0;
}
```

Tác động runtime thú vị; xem kernel log:

![Figure 7.6](images/ch07/fig07-06.png)

Hình 7.6 – Ảnh chụp kernel log khi LKM ch13/2\_percpu/percpu\_var chạy

Trong ba dòng output cuối Hình 7.6, thấy tóm tắt giá trị per-CPU data variable trên CPU `0` và CPU `1` (hiển thị qua hàm `disp_vars()`). Rõ ràng per-CPU integer `pcpa` (và data structure `pcp_ctx`) có giá trị khác như dự kiến, không locking tường minh.

Kernel module vừa minh họa sử dụng macro `for_each_online_cpu(i)` để hiển thị giá trị các biến per-CPU trên mỗi online CPU. Tiếp theo, nếu VM có sáu CPU nhưng bạn chỉ muốn hai CPU hoạt động ở runtime thì sao? Có nhiều cách thực hiện; một cách là truyền parameter `maxcpus=n` cho kernel của VM khi boot. Bạn có thể kiểm tra parameter có ở đó hay không bằng cách xem `/proc/cmdline`:

```
$ cat /proc/cmdline
BOOT_IMAGE=/boot/vmlinuz-5.4.0-llkd-dbg
root=UUID=1c4<...> ro console=ttyS0,115200n8
console=tty0  quiet splash 3 maxcpus=2
```

Chú ý đang chạy custom debug kernel `5.4.0-llkd-dbg`.

#### Dùng Per-CPU trong kernel

Per-CPU variable được dùng khá nhiều trong Linux kernel; trường hợp thú vị là triển khai macro `current` trên x86 (đã trình bày dùng macro `current` trong tài liệu đồng hành Linux Kernel Programming - Chương 6, Kiến thức thiết yếu về Kernel Internals – Process và Thread, mục Truy cập task structure với current). Thực tế `current` được tra (và đặt) thường xuyên; giữ per-CPU bảo đảm truy cập lock-free! Code triển khai:

```
// arch/x86/include/asm/current.h
[ ... ]
DECLARE_PER_CPU(struct task_struct *, current_task);
static __always_inline struct task_struct *get_current(void)
{
    return this_cpu_read_stable(current_task);
}
#define current get_current()
```

Macro `DECLARE_PER_CPU()` khai báo biến `current_task` làm per-CPU variable kiểu `struct task_struct *`. Inline function `get_current()` gọi helper `this_cpu_read_stable()` trên per-CPU variable này, đọc giá trị `current` trên CPU core đang chạy (đọc comment tại `https://elixir.bootlin.com/linux/v5.4/source/arch/x86/include/asm/percpu.h#L383` để biết routine). Tốt, nhưng FAQ: per-CPU variable `current_task` được cập nhật ở đâu? Nghĩ xem: kernel phải đổi (cập nhật) `current` mỗi khi context switch sang task khác. Đúng vậy; thực sự cập nhật trong context-switching code (`arch/x86/kernel/process_64.c:__switch_to()`; tại `https://elixir.bootlin.com/linux/v5.4/source/arch/x86/kernel/process_64.c#L504`):

```
__visible __notrace_funcgraph struct task_struct *
__switch_to(struct task_struct *prev_p, struct task_struct *next_p)
{
    [ ... ]
    this_cpu_write(current_task, next_p);
    [ ... ]
}
```

Tiếp theo thử nhanh cho thấy dùng per-CPU trong kernel code base qua `__alloc_percpu()`: chạy `cscope -d` ở root kernel source tree (giả định đã build index `cscope` qua `make cscope`). Trong menu `cscope`, dưới prompt `Find functions calling this function:`, gõ `__alloc_percpu`. Kết quả:

![Figure 7.7](images/ch07/fig07-07.png)

Hình 7.7 – (Một phần) ảnh chụp output cscope -d thể hiện kernel code gọi API \_\_alloc\_percpu()

Tất nhiên chỉ danh sách một phần dùng per-CPU trong kernel code base, chỉ theo dõi qua underlying API `__alloc_percpu()`. Tìm hàm gọi `alloc_percpu[_gfp]()` (wrapper trên `__alloc_percpu[_gfp]()`) cho nhiều kết quả hơn.

Đến đây hoàn tất thảo luận kỹ thuật và API kernel synchronization, hãy kết thúc chương bằng lĩnh vực then chốt: công cụ và mẹo debug locking issue trong kernel code!

## Lock debugging trong kernel

Kernel có nhiều cách giúp debug tình huống khó về kernel-level locking issue, deadlock là một loại chính.

Nếu chưa, hãy bảo đảm đọc trước nền tảng synchronization, locking và hướng dẫn deadlock ở chương trước (`Chapter 6`, Kernel Synchronization – Phần 1, đặc biệt các mục Exclusive execution và atomicity, Các vấn đề concurrency trong Linux kernel).

Với mọi tình huống debug, có những thời điểm debugging khác nhau nên có thể dùng công cụ/kỹ thuật khác nhau. Nói rất tổng quát, bug có thể được nhận thấy và debug tại vài thời điểm khác nhau (thực sự trong Software Development Life Cycle (SDLC)):

- Trong phát triển

- Sau phát triển nhưng trước phát hành (kiểm thử, Quality Assurance (QA), v.v.)

- Sau phát hành nội bộ

- Sau phát hành, ngoài thực địa

Một lời nhắc nhở well-known nhưng đáng tiếc là đúng: bug được phát hiện càng “xa” giai đoạn phát triển thì chi phí sửa càng lớn! Vì vậy, bạn thực sự nên cố gắng tìm và sửa bug sớm nhất có thể!

Sách tập trung phát triển kernel, nên ở đây tập trung vài công cụ/kỹ thuật debug locking issue lúc phát triển.

Quan trọng: Kỳ vọng giờ bạn chạy debug kernel, tức kernel cố tình configure cho phát triển/debug. Hiệu năng giảm, nhưng ổn — đang săn bug! Đã trình bày configure debug kernel điển hình trong tài liệu đồng hành Linux Kernel Programming - Chương 5, Viết kernel module đầu tiên – LKM Phần 2, mục Configure debug kernel, và cung cấp sample kernel configuration file tại `https://github.com/PacktPublishing/Linux-Kernel-Programming/blob/master/ch5/kconfigs/sample_kconfig_llkd_dbg.config`. Chi tiết configure debug kernel cho lock debugging ngay phần tiếp.

### Configure debug kernel cho lock debugging

Vì liên quan và quan trọng với lock debugging, xem nhanh điểm chính từ tài liệu Linux Kernel patch submission checklist (`https://www.kernel.org/doc/html/v5.4/process/submit-checklist.html`) liên quan nhất thảo luận enable debug kernel (đặc biệt lock debugging):

```
// https://www.kernel.org/doc/html/v5.4/process/submit-checklist.html
[...]
12. Has been tested with CONFIG_PREEMPT, CONFIG_DEBUG_PREEMPT,
CONFIG_DEBUG_SLAB, CONFIG_DEBUG_PAGEALLOC, CONFIG_DEBUG_MUTEXES,
CONFIG_DEBUG_SPINLOCK, CONFIG_DEBUG_ATOMIC_SLEEP, CONFIG_PROVE_RCU and
CONFIG_DEBUG_OBJECTS_RCU_HEAD all simultaneously enabled.
13. Has been build- and runtime tested with and without CONFIG_SMP and
CONFIG_PREEMPT.

16. All codepaths have been exercised with all lockdep features enabled.
[ ... ]
```

Dù không trình bày trong sách, phải nhắc dynamic memory error detector rất mạnh Kernel Address SANitizer (KASAN). Ngắn gọn, dùng compile-time instrumentation-based dynamic analysis để bắt memory-related bug phổ biến (cả GCC và Clang). ASan (Address Sanitizer), kỹ sư Google đóng góp, giám sát/phát hiện memory issue trong user space app (trình bày khá chi tiết, so sánh valgrind trong sách Hands-On System Programming for Linux). Tương đương kernel, KASAN, có từ kernel 4.0 cho x86\_64 và AArch64 (ARM64, từ Linux 4.4). Chi tiết (enable, dùng) trong kernel documentation (`https://www.kernel.org/doc/html/v5.4/dev-tools/kasan.html#the-kernel-address-sanitizer-kasan`); rất khuyến nghị bật trong debug kernel.

Như tài liệu đồng hành Linux Kernel Programming - Chương 2, Build Linux kernel 5.x từ Source – Phần 1, có thể configure Linux kernel theo nhu cầu. Ở đây (root kernel source tree 5.4.0), thực hiện `make` `menuconfig`, đến menu `Kernel hacking / Lock Debugging (spinlocks,` `mutexes, etc...)` (Hình 7.8, chụp guest VM Ubuntu 20.04 LTS x86\_64):

![Figure 7.8](images/ch07/fig07-08.png)

Hình 7.8 – Ảnh chụp (cắt bớt) menu kernel hacking / Lock Debugging (spinlocks, mutexes, etc...) với các mục cần cho debug kernel được bật

Hình 7.8 là ảnh chụp (cắt bớt) menu `<Kernel hacking > Lock Debugging` `(spinlocks, mutexes, etc...)` với các mục cần cho debug kernel được bật.

Thay vì tương tác với từng menu item và chọn nút `<Help>` để xem ý nghĩa của nó, cách đơn giản hơn nhiều để lấy cùng thông tin trợ giúp là xem bên trong Kconfig file liên quan, vốn mô tả menu. Ở đây, đó là `lib/Kconfig.debug`, nơi chứa mọi menu debug-related. Trong trường hợp cụ thể này, hãy tìm chuỗi `menu "Lock Debugging (spinlocks, mutexes,` `etc...)"`, nơi bắt đầu phần `Lock Debugging`, xem bảng sau.

Bảng sau tóm tắt mỗi kernel lock debugging configuration option giúp debug gì (không trình bày tất cả, một số trích trực tiếp file `lib/Kconfig.debug`):

| Tiêu đề menu lock debugging | Chức năng |
|---|---|
| Lock debugging: chứng minh locking đúng (`CONFIG_PROVE_LOCKING`) | Kernel option `lockdep` – bật để có chứng minh liên tục tính đúng lock mọi lúc. Mọi khả năng deadlock locking-related được báo trước khi thực sự xảy ra; rất hữu ích! (Giải thích chi tiết ngay sau.) |
| Thống kê dùng lock (`CONFIG_LOCK_STAT`) | Theo dõi lock contention point (giải thích chi tiết ngay sau). |
| RT mutex debugging, phát hiện deadlock (`CONFIG_DEBUG_RT_MUTEXES`) | “Cho phép tự động phát hiện và báo vi phạm rt mutex semantics, deadlock (lockup) liên quan rt mutex.” |
| Spinlock và `rw-lock` debugging: kiểm tra cơ bản (`CONFIG_DEBUG_SPINLOCK`) | Bật (cùng `CONFIG_SMP`) giúp bắt thiếu khởi tạo spinlock và lỗi spinlock phổ biến khác. |
| Mutex debugging: kiểm tra cơ bản (`CONFIG_DEBUG_MUTEXES`) | “Cho phép phát hiện và báo vi phạm mutex semantics.” |
| RW semaphore debugging: kiểm tra cơ bản (`CONFIG_DEBUG_RWSEMS`) | Cho phép phát hiện/báo RW semaphore lock và unlock không khớp. |
| Lock debugging: phát hiện giải phóng live lock sai (`CONFIG_DEBUG_LOCK_ALLOC`) | “Kiểm tra held lock (spinlock, rwlock, mutex hay rwsem) có bị kernel giải phóng sai qua memory-freeing routine (`kfree(), kmem_cache_free(),` `free_pages(), vfree()`, v.v.), live lock bị khởi tạo lại sai qua `spin_lock_init()/mutex_init()`/v.v., hoặc còn lock được giữ khi task exit không.” |
| Kiểm tra sleep trong atomic section (`CONFIG_DEBUG_ATOMIC_SLEEP`) | “Nếu chọn Y, các routine có thể sleep sẽ báo rất ồn nếu gọi trong atomic section: khi giữ spinlock, trong rcu read side critical section, trong preempt disabled section, trong interrupt, v.v...” |
| Locking API self-tests boot-time (`CONFIG_DEBUG_LOCKING_API_SELFTESTS`) | “Chọn Y nếu muốn kernel chạy self-test ngắn lúc boot. self-test kiểm tra các loại locking bug phổ biến có được debugging mechanism phát hiện không. (Nếu disable lock debugging tất nhiên không phát hiện.) Bao quát locking API: spinlock, rwlock, mutex và rwsem.” |
| Torture test cho locking (`CONFIG_LOCK_TORTURE_TEST`) | “Cung cấp kernel module chạy torture test trên kernel locking primitive. Có thể build module sau trên running kernel cần kiểm thử nếu muốn.” (Có thể build inline với '`Y`' hoặc ngoài dạng module với '`M`')." |

Bảng 17.4 – Kernel lock debugging configuration option điển hình và ý nghĩa

Như gợi ý, bật tất cả/phần lớn lock debug option trong debug kernel dùng phát triển, kiểm thử là ý hay. Tất nhiên có thể chậm thực thi đáng kể (và dùng nhiều memory); như cuộc sống, trade-off phải quyết định: phát hiện locking issue, error, deadlock phổ biến đổi lấy tốc độ. Nên sẵn sàng hơn mức thông thường để chấp nhận trade-off này, đặc biệt phát triển (hay refactor) code.

### Lock validator lockdep – bắt locking issue sớm

Linux kernel có một tính năng cực kỳ hữu ích mà người phát triển kernel nên tận dụng: công cụ xác minh tính đúng đắn của locking hoặc dependency giữa các lock ở runtime, gọi tắt là lockdep. Ý tưởng cơ bản là runtime `lockdep` tham gia mỗi khi có hoạt động locking trong kernel, từ việc lấy hoặc release bất kỳ kernel-level lock nào đến một locking sequence gồm nhiều lock. Những hoạt động này được theo dõi hoặc ánh xạ; đoạn tiếp theo trình bày thêm về tác động hiệu năng và cách giảm nó. Bằng cách áp dụng các quy tắc locking đúng đã được biết rõ, tức well-known, như gợi ý trong phần Hướng dẫn locking và deadlock ở chương trước, `lockdep` đưa ra kết luận về tính đúng đắn của những gì đã thực hiện.

Điều hay là `lockdep` đạt chứng minh toán học (hay closure) 100% lock sequence đúng hay không. Trích trực tiếp kernel documentation (`https://www.kernel.org/doc/html/v5.4/locking/lockdep-design.html`):

“Validator đạt ‘closure’ toán học hoàn hảo (chứng minh tính đúng locking): với mỗi locking sequence đơn giản, độc lập, single-task xảy ra ít nhất một lần trong vòng đời kernel, chứng minh chắc chắn 100% rằng không tổ hợp và timing nào của các sequence này gây bất kỳ lớp deadlock liên quan lock nào.”

Hơn nữa, `lockdep` cảnh báo qua các macro `WARN*()` về mọi vi phạm thuộc những nhóm locking bug sau: deadlock hoặc lock inversion, circular lock dependency và hard IRQ/soft IRQ safe/unsafe locking bug. Thông tin này rất quý giá: xác minh code bằng `lockdep` có thể tiết kiệm hàng trăm giờ làm việc bị lãng phí bằng cách phát hiện sớm vấn đề locking. Để bạn biết thêm, `lockdep` theo dõi mọi lock và locking sequence, hay lock chain, của chúng; có thể xem qua `/proc/lockdep_chains`.

Một vài lời về giảm tác động đến hiệu năng: bạn có thể hình dung rằng với hàng nghìn hoặc nhiều hơn các lock instance, xác minh từng lock sequence sẽ chậm đến mức vô lý. Thực tế, đây là nhiệm vụ có algorithmic time complexity bậc `O(N^2)`! Cách đó sẽ không khả thi, nên `lockdep` chỉ xác minh mỗi tình huống locking một lần, ngay lần đầu nó xảy ra. Ví dụ, trên một code path, lock A được lấy rồi đến lock B; đây được gọi là lock sequence hoặc lock chain. Nó nhận biết điều này bằng cách duy trì một hash 64-bit cho mỗi lock chain gặp phải.

Cách tiếp cận sơ khai từ user space: một cách rất đơn giản và chắc chắn không được bảo đảm để thử phát hiện deadlock là sử dụng GNU `ps(1)` trong user space. Lệnh `ps -LA -o state,pid,cmd | grep "^D"` in mọi thread ở state `D`, tức uninterruptible sleep (`TASK_UNINTERRUPTIBLE`). Trạng thái này có thể do deadlock, nhưng cũng có thể không; nếu kéo dài lâu, khả năng deadlock cao hơn. Hãy thử! Dĩ nhiên, `lockdep` là giải pháp tốt hơn nhiều. Lưu ý cách này chỉ hoạt động với GNU `ps`, không phải những phiên bản nhẹ như `busybox ps`.

Công cụ user space hữu ích khác `strace(1)` và `ltrace(1)` — lần lượt trace chi tiết mọi system call và library call của process (hay thread); có thể bắt process/thread treo, xem kẹt đâu (`strace -p` `PID` đặc biệt hữu ích trên process treo).

Một điểm khác bạn cần hiểu rõ là `lockdep` sẽ cảnh báo về locking sai xét về mặt toán học ngay cả khi không có deadlock thực sự xảy ra ở runtime! `lockdep` cung cấp bằng chứng rằng tồn tại vấn đề có thể gây bug, chẳng hạn deadlock hoặc unsafe locking, tại một thời điểm trong tương lai nếu không được sửa. Nó thường hoàn toàn đúng, nên hãy xem xét nghiêm túc và sửa vấn đề. Tuy nhiên, thông thường không có gì trong software đúng 100% ở mọi thời điểm: nếu bug xuất hiện ngay trong code `lockdep` thì sao? Thậm chí có tùy chọn config `CONFIG_DEBUG_LOCKDEP`. Điều quan trọng là chúng ta, những người phát triển, phải đánh giá tình huống cẩn thận và kiểm tra false positive.

Tiếp, `lockdep` làm trên lock class; đơn giản lock “logic” khác instance “physical”. Ví dụ open file data structure kernel, `struct` `file`, có hai lock — mutex và spinlock — mỗi cái được `lockdep` xem là lock class. Dù vài nghìn instance `struct file` trong memory lúc runtime, `lockdep` chỉ theo class. Thêm chi tiết thiết kế nội bộ `lockdep`, tham khảo kernel documentation chính thức (`https://www.kernel.org/doc/html/v5.4/locking/lockdep-design.html`).

### Ví dụ – bắt deadlock bug với lockdep

Ở đây, chúng ta giả định đến lúc này bạn đã build và đang chạy một debug kernel có bật `lockdep`, như được mô tả chi tiết trong phần Cấu hình debug kernel để debug lock. Hãy xác minh rằng nó thực sự được bật:

```
$ uname -r
5.4.0-llkd-dbg
$ grep PROVE_LOCKING /boot/config-5.4.0-llkd-dbg
CONFIG_PROVE_LOCKING=y
$
```

Tốt! Giờ hands-on deadlock, xem `lockdep` giúp bắt. Đọc tiếp!

#### Ví dụ 1 – bắt self deadlock bug với lockdep

Với ví dụ đầu tiên, chúng ta hãy quay lại một kernel module trong tài liệu đồng hành Linux Kernel Programming - Chương 6, Kiến thức thiết yếu về Kernel Internals – Process và Thread, phần Duyệt task list, tại `https://github.com/PacktPublishing/Linux-Kernel-Programming/blob/master/ch6/foreach/thrd_showall/thrd_showall.c`. Ở đó, chúng ta lặp qua từng thread, in một số chi tiết từ task structure của nó. Liên quan đến điều này, dưới đây là code snippet lấy tên thread; hãy nhớ tên nằm trong một member của task structure có tên `comm`:

```
// ch6/foreach/thrd_showall/thrd_showall.c
static int showthrds(void)
{
    struct task_struct *g = NULL, *t = NULL; /* 'g' : process ptr; 't':
thread ptr */
    [ ... ]
    do_each_thread(g, t) { /* 'g' : process ptr; 't': thread ptr */
        task_lock(t);
        [ ... ]
        if (!g->mm) {    // kernel thread
            snprintf(tmp, TMPMAX-1, " [%16s]", t->comm);
        } else {
            snprintf(tmp, TMPMAX-1, " %16s ", t->comm);
        }
        snprintf(buf, BUFMAX-1, "%s%s", buf, tmp);
        [ ... ]
```

Cách này hoạt động, nhưng có vẻ có một cách tốt hơn: thay vì tra trực tiếp tên thread bằng `t->comm` như ở đây, kernel cung cấp các helper routine `{get,set}_task_comm()` để lấy và đặt tên task. Vì vậy, chúng ta viết lại code để sử dụng helper macro `get_task_comm()`. Tham số đầu tiên là buffer chứa tên, được giả định đã cấp phát memory; tham số thứ hai là pointer đến task structure của thread mà bạn đang truy vấn tên. Code snippet sau lấy từ `ch13/3_lockdep/buggy_thrdshow_eg/thrd_showall_buggy.c`:

```
// ch13/3_lockdep/buggy_lockdep/thrd_showall_buggy.c
static int showthrds_buggy(void)
{
    struct task_struct *g, *t; /* 'g' : process ptr; 't': thread ptr */
    [ ... ]
    char buf[BUFMAX], tmp[TMPMAX], tasknm[TASK_COMM_LEN];
    [ ... ]
    do_each_thread(g, t) { /* 'g' : process ptr; 't': thread ptr */
        task_lock(t);
        [ ... ]
        get_task_comm(tasknm, t);
        if (!g->mm) // kernel thread
            snprintf(tmp, sizeof(tasknm)+3, " [%16s]", tasknm);
        else
            snprintf(tmp, sizeof(tasknm)+3, " %16s ", tasknm);
        [ ... ]
```

Khi được biên dịch và insert vào kernel trên hệ thống kiểm thử của chúng ta, may mắn là một VM, module có thể gây hành vi kỳ lạ hoặc thậm chí khiến hệ thống treo! Khi thực hiện, tôi đã lấy được kernel log qua `dmesg(1)` trước khi hệ thống hoàn toàn mất phản hồi.

Nếu hệ thống của bạn treo ngay khi insert LKM thì sao? Đó là một ví dụ về khó khăn của kernel debugging! Một cách có thể thử, đã hiệu quả với tôi khi thử chính ví dụ này trên Fedora 29 VM x86\_64, là reboot VM bị treo rồi tra kernel log bằng tiện ích mạnh mẽ `journalctl(1)` của systemd với lệnh `journalctl --since="1 hour ago"`; lúc này, bạn có thể thấy các printk từ `lockdep`. Tuy nhiên, đáng tiếc là không bảo đảm phần kernel log quan trọng đã được lưu xuống đĩa tại thời điểm treo để `journalctl` có thể lấy lại. Đó là lý do sử dụng tính năng kdump của kernel, rồi thực hiện postmortem analysis trên kernel dump image file bằng `crash(8)`, có thể cứu nguy. Xem các tài liệu về sử dụng `kdump` và crash trong phần Đọc thêm của chương này.

Xem kernel log rõ: `lockdep` bắt (self) deadlock (thể hiện phần output liên quan trong ảnh):

![Figure 7.9](images/ch07/fig07-09.png)

Hình 7.9 – (Một phần) ảnh chụp kernel log sau khi nạp module có bug; lockdep bắt self deadlock!

Mặc dù còn nhiều chi tiết theo sau, bao gồm stack backtrace của kernel stack thuộc `insmod(8)` vì đó là process context trong trường hợp này, các giá trị register, v.v., những gì thấy trong hình trước đã đủ để suy ra điều xảy ra. Rõ ràng, `lockdep` báo `insmod/2367 is trying to acquire lock:`, tiếp theo là `but task is` `already holding lock:`. Sau đó, hãy xem kỹ Hình 7.9: lock mà `insmod` đang giữ là `(p->alloc_lock)`. Tạm thời bỏ qua phần theo sau; chúng ta sẽ giải thích ngay sau đây. Routine thực sự cố acquire lock, hiển thị sau `at:`, là `__get_task_comm+0x28/0x50`. Bây giờ chúng ta đã có manh mối: hãy xác định chính xác điều xảy ra khi gọi `get_task_comm()`. Chúng ta thấy đó là một macro, wrapper quanh worker routine thực sự `__get_task_comm()`. Code của nó như sau:

```
// fs/exec.c
char *__get_task_comm(char *buf, size_t buf_size, struct task_struct *tsk)
{
    task_lock(tsk);
    strncpy(buf, tsk->comm, buf_size);
    task_unlock(tsk);
    return buf;
}
EXPORT_SYMBOL_GPL(__get_task_comm);
```

À, vấn đề nằm ở đây: function `__get_task_comm()` cố acquire lại chính lock mà chúng ta đang giữ, gây ra self deadlock! Chúng ta đã acquire nó ở đâu? Hãy nhớ rằng ngay dòng code đầu tiên sau khi vào vòng lặp trong kernel module có bug, chúng ta gọi `task_lock(t)`. Chỉ vài dòng sau, chúng ta gọi `get_task_comm()`, bên trong nó lại cố acquire chính lock đó: kết quả là self deadlock:

```
do_each_thread(g, t) {   /* 'g' : process ptr; 't': thread ptr */
    task_lock(t);
    [ ... ]
    get_task_comm(tasknm, t);
```

Hơn nữa tìm lock cụ thể dễ; tra code routine `task_lock()`:

```
// include/linux/sched/task.h */
static inline void task_lock(struct task_struct *p)
{
    spin_lock(&p->alloc_lock);
}
```

Bây giờ mọi thứ đã rõ: đó là spinlock có tên `alloc_lock` bên trong task structure, đúng như `lockdep` thông báo. Báo cáo của `lockdep` có một số ký hiệu khó hiểu. Hãy xét các dòng sau:

```
[ 1021.449384] insmod/2367 is trying to acquire lock:
[ 1021.451361] ffff88805de73f08 (&(&p->alloc_lock)->rlock){+.+.}, at:
__get_task_comm+0x28/0x50
[ 1021.453676]
               but task is already holding lock:
[ 1021.457365] ffff88805de73f08 (&(&p->alloc_lock)->rlock){+.+.}, at:
showthrds_buggy+0x13e/0x6d1 [thrd_showall_buggy]
```

Bỏ qua timestamp, con số ở cột ngoài cùng bên trái của dòng thứ hai trong code block trước là lightweight hash 64-bit dùng để nhận diện lock sequence cụ thể này. Lưu ý nó giống hệt hash trong dòng tiếp theo, nên chúng ta biết cùng một lock đang được thao tác! `{+.+.}` là ký hiệu của lockdep cho state mà lock được acquire: `+` có nghĩa lock được acquire với IRQ bật, `.` có nghĩa lock được acquire với IRQ tắt và không ở IRQ context, v.v. Các ký hiệu được giải thích trong kernel documentation tại `https://www.kernel.org/doc/Documentation/locking/lockdep-design.txt`; chúng ta chỉ đề cập đến đây.

Steve Rostedt có bài trình bày chi tiết diễn giải output `lockdep` tại Linux Plumber's Conference (2011); slide hữu ích, khám phá deadlock đơn giản/phức tạp và cách `lockdep` phát hiện: Lockdep: How to read its cryptic output (`https://blog.linuxplumbersconf.org/2011/ocw/sessions/153`).

##### Sửa lỗi

Bây giờ đã hiểu vấn đề, chúng ta sửa nó như thế nào? Xem và diễn giải báo cáo của lockdep trong Hình 7.9, cách sửa khá đơn giản. Như đã đề cập, spinlock `alloc_lock` của task structure đã được lấy ở đầu vòng lặp `do-while` qua `task_lock(t)`. Vì vậy, hãy bảo đảm unlock nó trước khi gọi routine `get_task_comm()`, vốn lấy và release cùng lock này ở bên trong, rồi thực hiện `get_task_comm()` và lock lại sau đó.

Ảnh sau (Hình 7.10) cho thấy khác biệt (qua tiện ích `diff(1)`) giữa phiên bản cũ có bug (`ch13/3_lockdep/buggy_thrdshow_eg/thrd_showall_buggy.c`) và mới sửa (`ch13/3_lockdep/fixed_lockdep/thrd_showall_fixed.c`):

![Figure 7.10](images/ch07/fig07-10.png)

Hình 7.10 – (Một phần) ảnh chụp phần khác biệt chính giữa phiên bản có bug và đã sửa của demo LKM thrdshow

Tốt; tiếp ví dụ bắt AB-BA deadlock!

#### Ví dụ 2 – bắt AB-BA deadlock với lockdep

Để có thêm một ví dụ, chúng ta hãy xem kernel module minh họa cố tình tạo circular dependency, cuối cùng dẫn đến deadlock. Code nằm tại `ch13/3_lockdep/deadlock_eg_AB-BA`. Module này dựa trên module trước đó của chúng ta, `ch13/2_percpu`; như bạn còn nhớ, chúng ta tạo hai kernel thread và dùng một phiên bản `sched_setaffinity()` đã chỉnh sửa để bảo đảm mỗi kernel thread chạy trên một CPU core riêng, thread đầu trên CPU core `0` và thread thứ hai trên core `1`.

Bằng cách này, chúng ta có concurrency. Bây giờ, bên trong các thread, chúng ta cho chúng làm việc với hai spinlock `lockA` và `lockB`. Hiểu rằng đang có process context với từ hai lock trở lên, chúng ta ghi lại và tuân theo quy tắc lock ordering: lấy lockA trước, sau đó lấy lockB. Vì vậy, dưới đây là một cách không nên thực hiện:

```
kthread 0 on CPU #0                kthread 1 on CPU #1
  Take lockA                           Take lockB
     <perform work>                       <perform work>
                                          (Try and) take lockA
                                          < ... spins forever :
                                                DEADLOCK ... >
(Try and) take lockB
< ... spins forever :
      DEADLOCK ... >
```

Tất nhiên AB-BA deadlock kinh điển! Vì chương trình (thực ra kernel thread 1) bỏ qua lock ordering (khi module parameter `lock_ooo` là `1`), deadlock. Code liên quan (không trình bày toàn chương trình; clone GitHub repository sách tại `https://github.com/PacktPublishing/Linux-Kernel-Programming` và tự thử):

```
// ch13/3_lockdep/deadlock_eg_AB-BA/deadlock_eg_AB-BA.c
[ ... ]
/* Our kernel thread worker routine */
static int thrd_work(void *arg)
{
    [ ... ]
   if (thrd == 0) { /* our kthread #0 runs on CPU 0 */
        pr_info(" Thread #%ld: locking: we do:"
            " lockA --> lockB\n", thrd);
        for (i = 0; i < THRD0_ITERS; i ++) {
            /* In this thread, perform the locking per the lock ordering
'rule';
             * first take lockA, then lockB */
            pr_info(" iteration #%d on cpu #%ld\n", i, thrd);
            spin_lock(&lockA);
            DELAY_LOOP('A', 3);
            spin_lock(&lockB);
            DELAY_LOOP('B', 2);
            spin_unlock(&lockB);
            spin_unlock(&lockA);
        }
```

Kernel thread `0` làm đúng, theo lock ordering; code liên quan kernel thread `1` (tiếp code trên):

```
   [ ... ]
   } else if (thrd == 1) { /* our kthread #1 runs on CPU 1 */
        for (i = 0; i < THRD1_ITERS; i ++) {
            /* In this thread, if the parameter lock_ooo is 1, *violate*
the
             * lock ordering 'rule'; first (attempt to) take lockB, then
lockA */
            pr_info(" iteration #%d on cpu #%ld\n", i, thrd);
            if (lock_ooo == 1) {        // violate the rule, naughty boy!
                pr_info(" Thread #%ld: locking: we do: lockB -->
lockA\n",thrd);
                spin_lock(&lockB);
                DELAY_LOOP('B', 2);
                spin_lock(&lockA);
                DELAY_LOOP('A', 3);
                spin_unlock(&lockA);
                spin_unlock(&lockB);
            } else if (lock_ooo == 0) { // follow the rule, good boy!
                pr_info(" Thread #%ld: locking: we do: lockA -->
lockB\n",thrd);
                spin_lock(&lockA);
                DELAY_LOOP('B', 2);
                spin_lock(&lockB);
                DELAY_LOOP('A', 3);
                spin_unlock(&lockB);
                spin_unlock(&lockA);
            }
    [ ... ]
```

Build/chạy với kernel module parameter `lock_ooo` bằng `0` (mặc định); theo lock ordering, mọi thứ ổn:

```
$ sudo insmod ./deadlock_eg_AB-BA.ko
$ dmesg
[10234.023746] deadlock_eg_AB-BA: inserted (param: lock_ooo=0)
[10234.026753] thrd_work():115: *** thread PID 6666 on cpu 0 now ***
[10234.028299] Thread #0: locking: we do: lockA --> lockB
[10234.029606] iteration #0 on cpu #0
[10234.030765] A
[10234.030766] A
[10234.030847] thrd_work():115: *** thread PID 6667 on cpu 1 now ***
[10234.031861] A
[10234.031916] B
[10234.032850] iteration #0 on cpu #1
[10234.032853] Thread #1: locking: we do: lockA --> lockB
[10234.038831] B
[10234.038836] Our kernel thread #0 exiting now...
[10234.038869] B
[10234.038870] B
[10234.042347] A
[10234.043363] A
[10234.044490] A
[10234.045551] Our kernel thread #1 exiting now...
$
```

Bây giờ, chạy với kernel module parameter `lock_ooo` được đặt thành `1`, chúng ta thấy hệ thống bị khóa cứng đúng như dự kiến! Chúng ta đã vi phạm quy tắc lock ordering và trả giá bằng system deadlock. Lần này, reboot VM rồi chạy `journalctl --since="10 min ago"` giúp tôi lấy được báo cáo của lockdep:

```
======================================================
WARNING: possible circular locking dependency detected
5.4.0-llkd-dbg #2 Tainted: G OE
------------------------------------------------------
thrd_0/0/6734 is trying to acquire lock:
ffffffffc0fb2518 (lockB){+.+.}, at: thrd_work.cold+0x188/0x24c
[deadlock_eg_AB_BA]

but task is already holding lock:
ffffffffc0fb2598 (lockA){+.+.}, at: thrd_work.cold+0x149/0x24c
[deadlock_eg_AB_BA]

which lock already depends on the new lock.
[ ... ]
other info that might help us debug this:

 Possible unsafe locking scenario:

       CPU0                    CPU1
       ----                    ----
  lock(lockA);
                               lock(lockB);
                               lock(lockA);
  lock(lockB);

 *** DEADLOCK ***

[ ... lots more output follows ... ]
```

Báo cáo `lockdep` tuyệt vời. Xem dòng sau `Possible` `unsafe locking scenario:`; thể hiện gần chính xác điều xảy ra runtime — out-of-order (ooo) locking sequence trên `CPU1 : lock(lockB); -->` `lock(lockA);`! Vì `lockA` đã được kernel thread trên CPU `0` lấy, kernel thread trên CPU `1` spin mãi — nguyên nhân gốc AB-BA deadlock.

Hơn nữa, khá thú vị là ngay sau khi insert module với `lock_ooo` đặt thành `1`, kernel còn phát hiện một soft lockup bug. Printk được gửi đến console ở log level `KERN_EMERG`, cho phép chúng ta nhìn thấy nó ngay cả khi hệ thống có vẻ treo. Nó thậm chí hiển thị các kernel thread liên quan nơi vấn đề phát sinh. Một lần nữa, output này lấy trên Ubuntu 20.04 LTS VM x86\_64 của tôi, chạy custom debug kernel 5.4.0:

```
Message from syslogd@seawolf-VirtualBox at Dec 24 11:01:51 ...
kernel:[10939.279524] watchdog: BUG: soft lockup - CPU#0 stuck for 22s!
[thrd_0/0:6734]
Message from syslogd@seawolf-VirtualBox at Dec 24 11:01:51 ...
kernel:[10939.287525] watchdog: BUG: soft lockup - CPU#1 stuck for 23s!
[thrd_1/1:6735]
```

(Để biết thêm, code phát hiện và xuất thông báo trên tại `kernel/watchdog.c:watchdog_timer_fn()`).

Ghi chú thêm: output `/proc/lockdep_chains` cũng “chứng minh” đã lấy (hay tồn tại) locking sequence sai:

```
$ sudo cat /proc/lockdep_chains
[ ... ]
irq_context: 0
[000000005c6094ba] lockA
[000000009746aa1e] lockB
[ ... ]
irq_context: 0
[000000009746aa1e] lockB
[000000005c6094ba] lockA
```

Nhớ `lockdep` chỉ báo một lần — lần đầu quy tắc lock trên kernel lock bất kỳ bị vi phạm.

### lockdep – annotation và vấn đề

Kết thúc bằng vài điểm nữa về infrastructure `lockdep` mạnh mẽ.

#### lockdep annotation

Trong user space, bạn hẳn quen sử dụng macro rất hữu ích `assert()`. Ở đó, bạn assert một biểu thức Boolean, tức một điều kiện, ví dụ `assert(p == 5);`. Nếu assertion đúng ở runtime, không có gì xảy ra và việc thực thi tiếp tục. Khi assertion sai, process bị abort và thông báo qua `printf()` đến `stderr` chỉ rõ assertion nào thất bại và ở đâu. Điều này cho phép người phát triển kiểm tra những điều kiện mà họ kỳ vọng ở runtime. Vì vậy, assertion rất có giá trị: chúng giúp phát hiện bug!

Theo cách tương tự, `lockdep` cho phép người phát triển kernel assert rằng một lock đang được giữ tại một điểm cụ thể qua macro `lockdep_assert_held()`. Đây được gọi là lockdep annotation. Định nghĩa macro được trình bày ở đây:

```
// include/linux/lockdep.h
#define lockdep_assert_held(l) do { \
        WARN_ON(debug_locks && !lockdep_is_held(l)); \
    } while (0)
```

Assertion thất bại tạo warning qua `WARN_ON()`. Điều này rất có giá trị vì cho biết lock `l` lẽ ra phải đang được giữ nhưng thực tế không phải vậy. Cũng lưu ý rằng những assertion này chỉ hoạt động khi bật lock debugging. Đây là mặc định khi lock debugging được bật trong kernel; nó chỉ bị tắt khi có lỗi trong `lockdep` hoặc phần khác của kernel locking infrastructure. Thực tế, kernel code base sử dụng annotation `lockdep` ở khắp nơi, trong cả core code lẫn driver code. Có một vài biến thể của assertion `lockdep` dạng `lockdep_assert_held*()` cùng những macro ít dùng `lockdep_*pin_lock()`.

#### Vấn đề lockdep

Có thể phát sinh vài vấn đề khi dùng `lockdep`:

- Load và unload module lặp lại có thể khiến vượt giới hạn lock class nội bộ của `lockdep`. Theo giải thích trong kernel documentation, load kernel module `x.ko` tạo một tập lock class mới cho tất cả các lock của nó, trong khi unload `x.ko` không loại bỏ chúng; chúng thực tế được tái sử dụng. Vì vậy, hoặc tránh load và unload module liên tục, hoặc reset hệ thống.

- Đặc biệt trong những trường hợp data structure có số lock rất lớn, chẳng hạn array các structure, việc không khởi tạo đúng từng lock có thể dẫn đến lock-class overflow trong `lockdep`.

Integer `debug_locks` đặt `0` mỗi khi disable lock debugging (ngay debug kernel); có thể thông báo `*WARNING* lock debugging` `disabled!! - possibly due to a lockdep warning`. Có thể do `lockdep` đã warning trước. Reboot hệ thống rồi thử lại.

Dù sách dựa kernel 5.4 LTS, tính năng mạnh (rất gần thời điểm viết) đã merge vào kernel 5.8: Kernel Concurrency Sanitizer (KCSAN). Data race detector cho Linux kernel qua compile-time instrumentation. Thêm chi tiết trong bài LWN: Finding race conditions with KCSAN, LWN, tháng 10 năm 2019 (`https://lwn.net/Articles/802128/`) và Concurrency bugs should fear the big bad data-race detector (part 1), LWN, tháng 4 năm 2020 (`https://lwn.net/Articles/816850/`).

Để biết thêm, có nhiều công cụ bắt locking bug/deadlock trong user space app. Gồm `helgrind` well-known (Valgrind suite), TSan (Thread Sanitizer) cung cấp compile-time instrumentation kiểm tra data race trong multithreaded application, và chính lockdep; có thể cho lockdep hoạt động user space (dạng library)! Hơn nữa framework \[e\]BPF hiện đại có frontend `deadlock-bpfcc(8)`. Thiết kế riêng tìm potential deadlock (lock order inversion) trong running process (hay thread).

### Lock statistics

Một lock có thể chịu contention: một context muốn acquire lock nhưng lock đã được lấy, nên nó phải chờ unlock. Contention cao có thể gây bottleneck hiệu năng nghiêm trọng. Kernel cung cấp lock statistics để dễ xác định các lock có contention cao. Hãy bật lock statistics bằng tùy chọn kernel configuration `CONFIG_LOCK_STAT`. Nếu không bật, entry `/proc/lock_stat` sẽ không có, là trường hợp thường gặp trên phần lớn distribution kernel.

Lock stats code tận dụng `lockdep` chèn hook vào locking code path (hook `__contended`, `__acquired`, `__released`) thu thống kê tại điểm quan trọng. Kernel documentation gọn về lock statistics (`https://www.kernel.org/doc/html/latest/locking/lockstat.html#lock-statistics`) truyền đạt điều này (và hơn nữa) bằng state diagram hữu ích; hãy tra.

#### Xem lock stats

Mẹo nhanh và lệnh thiết yếu xem lock statistics (tất nhiên giả định bật `CONFIG_LOCK_STAT`):

| Làm gì? | Lệnh |
|---|---|
| Xóa lock stats | `sudo sh -c "echo 0 > /proc/lock_stat"` |
| Enable lock stats | `sudo sh -c "echo 1 >` `/proc/sys/kernel/lock_stat"` |
| Disable lock stats | `sudo sh -c "echo 0 >` `/proc/sys/kernel/lock_stat"` |

Tiếp demo đơn giản xem locking statistics: viết Bash script rất đơn giản `ch13/3_lockdep/lock_stats_demo.sh` (xem code trong GitHub repo). Xóa và enable locking statistics, rồi chỉ chạy lệnh `cat` `/proc/self/cmdline`. Thực sự kích hoạt chuỗi code sâu trong kernel (chủ yếu `fs/proc`); cần tra nhiều global — shared writable — data structure. Là critical section nên acquire lock. Script disable lock stats rồi grep locking statistics để thấy vài lock, lọc phần còn lại:

```
egrep "alloc_lock|task|mm" /proc/lock_stat
```

Khi chạy, nhận output (cũng trên VM Ubuntu 20.04 LTS x86\_64 chạy custom debug kernel 5.4.0):

![Figure 7.11](images/ch07/fig07-11.png)

Hình 7.11 – Ảnh chụp script lock\_stats\_demo.sh chạy, hiển thị một số lock statistics

Output trong Hình 7.11 khá dài theo chiều ngang nên bị xuống dòng. Thời gian được hiển thị bằng microsecond. Field `class name` là lock class; chúng ta có thể thấy nhiều lock gắn với task structure và memory structure, `task_struct` và `mm_struct`! Thay vì lặp lại tài liệu, chúng tôi hướng bạn đến kernel documentation về lock statistics, giải thích từng field trước đó như `con-bounces`, `waittime*`, v.v., cùng cách diễn giải output. Gợi ý: `con` viết tắt của contended. Đúng như dự kiến, trong trường hợp đơn giản ở Hình 7.11, chúng ta thấy những điều sau:

- Field đầu `class_name` là lock class; thấy tên (symbolic) lock.

- Thực sự không lock contention (field 2, 3).

- Wait time (`waittime*`, field 3 đến 6) bằng 0.

- Field `acquisitions` (#9) là tổng lần acquire (lấy) lock; dương (thậm chí hơn 300 với mm\_struct semaphore `&mm->mmap_sem*`).

- Bốn field cuối, 10 đến 13, là thống kê lock hold time tích lũy (`holdtime-{min|max|total|avg}`). Ở đây thấy lock mm\_struct `mmap_sem*` có average hold time dài nhất.

- (Chú ý task structure spinlock `alloc_lock` cũng được lấy; đã gặp mục Ví dụ 1 – bắt self deadlock bug với lockdep).

Tra lock contention nhiều nhất hệ thống bằng `sudo grep` `":" /proc/lock_stat | head`. Tất nhiên đây là từ lần locking statistics reset (xóa) gần nhất.

Lưu ý lock statistics có thể disable vì lock debugging disable; ví dụ gặp:

```
$ sudo cat /proc/lock_stat
lock_stat version 0.4
*WARNING* lock debugging disabled!! - possibly due to a lockdep warning
```

Warning này có thể khiến phải reboot hệ thống.

Tốt, gần xong! Kết thúc chương bằng trình bày ngắn memory barrier.

## Memory barrier – giới thiệu

Cuối cùng nhưng không kém phần quan trọng, chúng ta hãy đề cập ngắn gọn đến một vấn đề khác: memory barrier. Nó có nghĩa là gì? Đôi khi, luồng chạy chương trình trở nên khó xác định đối với lập trình viên vì microprocessor, memory controller và compiler có thể sắp xếp lại các thao tác đọc và ghi memory. Trong phần lớn trường hợp, những “thủ thuật” này vô hại và giúp tối ưu hóa. Nhưng có những trường hợp, thường qua ranh giới hardware như giữa các CPU core trên multicore system, hoặc giữa CPU và peripheral device theo cả hai chiều trên UniProcessor (UP), không được phép sắp xếp lại; phải tuân theo trình tự load và store memory ban đầu đã được dự định. Memory barrier, thường là các machine-level instruction được nhúng trong macro `*mb*()`, là cách ngăn việc sắp xếp lại như vậy. Nó buộc cả CPU, memory controller và compiler sắp xếp instruction hoặc data theo trình tự mong muốn. Có thể chèn memory barrier vào code path bằng các macro sau: `#include <asm/barrier.h>`:

- `rmb()`: Chèn read (hay load) memory barrier vào instruction stream

- `wmb()`: Chèn write (hay store) memory barrier vào instruction stream

- `mb()`: General memory barrier; trích trực tiếp kernel documentation (`https://www.kernel.org/doc/Documentation/memory-barriers.txt`): “General memory barrier bảo đảm mọi LOAD/STORE operation chỉ định trước barrier sẽ có vẻ xảy ra trước mọi LOAD/STORE operation chỉ định sau barrier, xét đối với thành phần khác của hệ thống.”

Memory barrier bảo đảm nếu instruction hay data access trước chưa thực thi, các thao tác sau không thực thi, giữ ordering. Trong một số dịp (hiếm), DMA có thể là trường hợp, người viết driver dùng memory barrier. Khi dùng DMA, quan trọng đọc kernel documentation (`https://www.kernel.org/doc/Documentation/DMA-API-HOWTO.txt`). Chỉ nơi dùng và nguy hiểm khi không dùng; xem ví dụ sau để biết thêm.

Đặt memory barrier đúng thường khá khó hiểu với nhiều người, nên tham khảo technical reference manual liên quan của processor/peripheral đang viết driver để biết chi tiết. Ví dụ Raspberry Pi có SoC dòng Broadcom BCM2835; xem peripheral manual — BCM2835 ARM Peripherals (`https://www.raspberrypi.org/app/uploads/2012/02/BCM2835-ARM-Peripherals.pdf`), mục 1.3, Peripheral access precautions for correct memory ordering — giúp biết khi nào nên/không nên dùng memory barrier.

### Ví dụ dùng memory barrier trong device driver

Ví dụ network driver Realtek 8139 “fast Ethernet”. Để truyền network packet qua DMA, trước phải thiết lập DMA (transmit) descriptor object. Với hardware cụ thể (NIC chip), DMA descriptor object định nghĩa:

```
// drivers/net/ethernet/realtek/8139cp.c
struct cp_desc {
    __le32 opts1;
    __le32 opts2;
    __le64 addr;
};
```

DMA descriptor object có tên `struct cp_desc` chứa ba “word”. Mỗi word đều phải được khởi tạo. Để DMA controller diễn giải descriptor chính xác, thường rất quan trọng là các thao tác ghi vào DMA descriptor được quan sát theo đúng thứ tự mà người viết driver dự định. Memory barrier được sử dụng để bảo đảm điều này. Thực tế, kernel documentation liên quan, Dynamic DMA mapping Guide tại `https://www.kernel.org/doc/Documentation/DMA-API-HOWTO.txt`, yêu cầu chúng ta bảo đảm như vậy. Ví dụ, khi thiết lập DMA descriptor, bạn phải viết code như sau để có hành vi chính xác trên mọi platform:

```
desc->word0 = address;
wmb();
desc->word1 = DESC_VALID;
```

Vậy xem DMA transmit descriptor được thiết lập thực tế (bởi driver code Realtek 8139):

```
// drivers/net/ethernet/realtek/8139cp.c
[ ... ]
static netdev_tx_t cp_start_xmit([...])
{
    [ ... ]
    len = skb->len;
    mapping = dma_map_single(&cp->pdev->dev, skb->data, len,
PCI_DMA_TODEVICE);
    [ ... ]
    struct cp_desc *txd;
    [ ... ]
    txd->opts2 = opts2;
    txd->addr = cpu_to_le64(mapping);
    wmb();
    opts1 |= eor | len | FirstFrag | LastFrag;
    txd->opts1 = cpu_to_le32(opts1);
    wmb();
    [...]
```

Driver tuân theo yêu cầu trong datasheet của chip: các word `txd->opts2` và `txd->addr` phải được lưu vào memory trước, sau đó mới lưu word `txd->opts1`. Vì thứ tự thực hiện những thao tác ghi này quan trọng, driver sử dụng write memory barrier `wmb()`. Ngoài ra, để bạn biết thêm, RCU cũng sử dụng các memory barrier thích hợp để thực thi memory ordering. Hơn nữa, việc sử dụng các macro `READ_ONCE()` và `WRITE_ONCE()` trên từng biến hoàn toàn bảo đảm compiler và CPU thực hiện điều bạn mong muốn. Chúng ngăn compiler optimization khi cần, sử dụng memory barrier khi cần và bảo đảm cache coherency khi nhiều thread trên các core khác nhau đồng thời truy cập biến liên quan.

Chi tiết tham khảo kernel documentation về memory barrier (`https://www.kernel.org/doc/Documentation/DMA-API-HOWTO.txt`). Có mục chi tiết WHERE ARE MEMORY BARRIERS NEEDED?. Tin tốt là phần lớn được xử lý bên dưới; với người viết driver, chỉ khi làm như thiết lập DMA descriptor hay bắt đầu/kết thúc giao tiếp CPU-to-peripheral (và ngược lại) mới có thể cần barrier.

Một điều cuối cùng, cũng là câu hỏi thường gặp đáng tiếc: sử dụng từ khóa `volatile` có làm các vấn đề concurrency biến mất một cách kỳ diệu không? Dĩ nhiên là không. Từ khóa `volatile` chỉ yêu cầu compiler vô hiệu hóa các tối ưu hóa thông thường quanh biến đó vì những thành phần ngoài code path này cũng có thể sửa biến đánh dấu `volatile`, chỉ vậy thôi. Điều này thường cần thiết và hữu ích khi làm việc với MMIO. Liên quan đến memory barrier, compiler sẽ không sắp xếp lại các thao tác đọc hoặc ghi trên biến `volatile` so với những biến volatile khác. Tuy nhiên, atomicity là một khái niệm riêng, không được bảo đảm bằng việc sử dụng từ khóa `volatile`.

## Tổng kết

Bạn thấy đấy!? Chúc mừng, bạn đã làm được, hoàn tất cuốn sách!

Trong chương này, chúng ta tiếp tục chương trước trong quá trình tìm hiểu kernel synchronization. Bạn đã học cách thực hiện locking trên số nguyên hiệu quả và an toàn hơn qua cả `atomic_t` lẫn interface mới hơn `refcount_t`. Trong đó, bạn học cách áp dụng RMW sequence điển hình một cách atomic và an toàn cho công việc phổ biến của người viết driver: cập nhật device register. Sau đó, chúng ta trình bày reader-writer spinlock, thú vị và hữu ích nhưng có một số lưu ý. Bạn thấy việc vô tình tạo vấn đề hiệu năng do các caching side effect không mong muốn dễ đến mức nào, bao gồm false sharing và cách tránh. Tiếp theo, chúng ta trình bày tương đối chi tiết lock-free algorithm và kỹ thuật lập trình, một lợi ích lớn cho người phát triển, tập trung vào các biến per-CPU trong Linux kernel. Điều quan trọng là học cách sử dụng chúng cẩn thận, đặc biệt những dạng nâng cao như RCU. Cuối cùng, bạn học memory barrier là gì và thường được sử dụng ở đâu.

Hành trình dài làm việc trong Linux kernel và các lĩnh vực liên quan, như device driver, giờ đã thực sự bắt đầu. Tuy nhiên, hãy hiểu rằng nếu không thực hành hands-on liên tục và thực sự làm việc với những tài liệu này, thành quả sẽ nhanh chóng phai đi. Tôi khuyến khích bạn tiếp tục gắn bó với các chủ đề này và những chủ đề khác. Khi kiến thức và kinh nghiệm tăng lên, đóng góp cho Linux kernel hoặc bất kỳ open source project nào cũng là một việc có ý nghĩa mà bạn nên thực hiện.

## Câu hỏi

Kết thúc, đây danh sách câu hỏi kiểm tra kiến thức nội dung chương: `https://github.com/PacktPublishing/Linux-Kernel-Programming/tree/master/questions`. Có lời giải một số câu trong GitHub repo sách: `https://github.com/PacktPublishing/Linux-Kernel-Programming/tree/master/solutions_to_assgn`.

## Đọc thêm

Để giúp tìm hiểu sâu bằng tài liệu hữu ích, cung cấp danh sách khá chi tiết tham khảo/link trực tuyến (đôi khi cả sách) trong tài liệu Further reading của GitHub repository sách. Tài liệu tại: `https://github.com/PacktPublishing/Linux-Kernel-Programming/blob/master/Further_Reading.md`.
