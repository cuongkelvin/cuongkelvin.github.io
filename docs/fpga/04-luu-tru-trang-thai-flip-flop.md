# CHƯƠNG 4: LƯU TRỮ TRẠNG THÁI BẰNG FLIP-FLOP (STORING STATE WITH THE FLIP-FLOP)

Song song với bảng tra **Look-Up Table (LUT)**, thành phần cốt lõi và quan trọng thứ hai bên trong một chip FPGA chính là **Flip-Flop**. Flip-flop mang lại cho FPGA khả năng ghi nhớ hoặc lưu trữ **trạng thái (state)**. Trong chương này, chúng ta sẽ khám phá cách thức hoạt động của Flip-flop và tìm hiểu lý do tại sao chúng lại đóng vai trò sống còn đối với sự vận hành của FPGA.

Flip-flop bù đắp cho điểm hạn chế lớn nhất của bảng tra LUT. Bảng tra LUT tạo ra đầu ra ngay lập tức dựa trên các đầu vào hiện tại. Nếu chỉ có duy nhất LUT để làm việc, FPGA của bạn có thể thực hiện tất cả các phép toán đại số Boolean mà bạn mong muốn, nhưng các đầu ra sẽ chỉ được quyết định dựa trên các đầu vào ở thời điểm hiện tại. FPGA sẽ hoàn toàn không có bất kỳ khái niệm nào về trạng thái trong quá khứ của nó. Điều này sẽ tạo ra sự hạn chế cực kỳ lớn. Việc thiết kế một bộ đếm (counter) sẽ trở nên bất khả thi, vì một bộ đếm đòi hỏi phải biết giá trị trước đó để tăng lên; việc lưu trữ kết quả của một phép toán số học thành một biến số cũng tương tự. Ngay cả một khái niệm quan trọng như **thời gian** cũng là điều bất khả thi nếu chỉ dùng LUT; bạn chỉ có thể tính toán các giá trị dựa trên thời điểm *hiện tại*, chứ không phải bất kỳ điều gì trong *quá khứ*. Flip-flop chính là chìa khóa mở ra những khả năng quan trọng này, đó là lý do tại sao nó cực kỳ thiết yếu đối với hoạt động của FPGA.

---

## 1. Cách Flip-Flop Hoạt Động (How a Flip-Flop Works)

Một Flip-flop lưu trữ trạng thái dưới dạng mức điện áp cao (high) hoặc thấp (low), tương ứng với giá trị nhị phân `1` hoặc `0` (hoặc giá trị Đúng/Sai). Nó thực hiện việc này bằng cách kiểm tra định kỳ giá trị ở đầu vào, chuyển giá trị đó ra đầu ra và **giữ nguyên (hold)** ở đó. 

Hãy xem xét sơ đồ cơ bản của một **D Flip-Flop** (Data Flip-Flop) trong **Hình 4-1**. D Flip-Flop là loại Flip-flop phổ biến nhất trong các FPGA, và chúng là trọng tâm của chương này (từ đây về sau, chúng ta sẽ gọi tắt là Flip-flop).

```
        +------------+
  D --->| D        Q |---> Q
 En --->| En         |
Clk --->| >          |
        +------------+
```
*Hình 4-1: Sơ đồ khối của một D Flip-Flop*

Dấu `>` ở chân xung nhịp là cách vẽ chữ của ký hiệu tam giác nhỏ trong sơ đồ mạch: nó báo rằng chân này **kích theo cạnh** (edge-triggered) — flip-flop chỉ phản ứng đúng lúc xung nhịp chuyển mức, không phải suốt lúc xung nhịp ở mức cao. Hai chân `D` và `En` không có tam giác vì chúng đọc theo mức.

Hãy chú ý rằng linh kiện này có ba đầu vào ở phía bên trái và một đầu ra ở phía bên phải:

* **Đầu vào `D` (Data):** Đặt ở phía trên bên trái, là đầu vào dữ liệu của Flip-flop, nơi dữ liệu đi vào dưới dạng các số 0 hoặc 1.
* **Đầu vào xung nhịp (`>` / Clock):** Đặt ở phía dưới bên trái, biểu diễn bằng ký hiệu giống dấu lớn hơn (`>`), dùng để đồng bộ hóa hoạt động của Flip-flop. Theo các khoảng thời gian định kỳ, tín hiệu xung nhịp sẽ kích hoạt Flip-flop lấy giá trị từ đầu vào dữ liệu `D` và chuyển sang đầu ra `Q`.
* **Đầu vào cho phép xung nhịp (`En` / Clock Enable):** Đặt ở giữa bên trái. Miễn là tín hiệu `En` ở mức cao (1), tín hiệu xung nhịp sẽ tiếp tục kích hoạt Flip-flop cập nhật đầu ra. Tuy nhiên, nếu đầu vào `En` chuyển xuống mức thấp (0), Flip-flop sẽ bỏ qua các tín hiệu xung nhịp và dữ liệu đầu vào, về bản chất là **đóng băng (freeze)** giá trị đầu ra hiện tại.

Để hiểu rõ hơn về cách thức vận hành của Flip-flop, chúng ta cần xem xét kỹ hơn tín hiệu đi vào đầu vào xung nhịp.

> **THUẬT NGỮ LINH KIỆN FLIP-FLOP**
> Linh kiện được trình bày trong Hình 4-1—một Flip-flop có chân cho phép xung nhịp (`En`)—không phải lúc nào cũng được gọi là Flip-flop theo nghĩa lý thuyết thuần túy. Các nhà sản xuất FPGA như AMD (Xilinx) và Intel thực tế sử dụng thuật ngữ Flip-flop trong tài liệu kỹ thuật của họ, nhưng một tên gọi chính xác hơn về mặt kỹ thuật là **clocked D latch**. Tuy nhiên, việc tranh cãi tên gọi nào tốt hơn không mang lại nhiều giá trị; trong cuốn sách này, chúng ta sẽ sử dụng thuật ngữ thực tế trong ngành điện tử mà các nhà sản xuất FPGA sử dụng và gọi các linh kiện này là **Flip-flop**.

**Lưu ý về khung trên.** Câu "tên gọi chính xác hơn là clocked D latch" là ý của tác giả sách, nhưng nó **đi ngược định nghĩa chuẩn** trong các giáo trình mạch số và cũng ngược với chính mục 4 của chương này. Theo định nghĩa chuẩn: **latch** nhạy theo *mức* (trong suốt khi chân cho phép đang kích hoạt, đầu ra bám theo đầu vào liên tục), còn **flip-flop** nhạy theo *cạnh* (chỉ chốt tại khoảnh khắc chuyển cạnh của xung nhịp). Linh kiện trong Hình 4-1 chốt dữ liệu tại cạnh lên nên đúng nghĩa là **flip-flop**, và các nhà sản xuất gọi vậy là chính xác. Mục 4 của chương sẽ dựa đúng vào sự phân biệt này để giải thích vì sao latch nguy hiểm còn flip-flop thì không — nếu coi hai thứ là một thì toàn bộ mục 4 không còn ý nghĩa. Bạn cứ dùng định nghĩa chuẩn.

---

### Tín Hiệu Xung Nhịp (The Clock Signal)

Một **tín hiệu xung nhịp (Clock signal)**, thường được gọi ngắn gọn là **Clock**, là một tín hiệu kỹ thuật số liên tục luân phiên giữa mức cao (1) và mức thấp (0), như được minh họa trong **Hình 4-2**. Tín hiệu này thường được cung cấp bởi một linh kiện điện tử chuyên dụng nằm bên ngoài chip FPGA (như bộ dao động thạch anh). 

Xung nhịp là chìa khóa cho cách thức vận hành của FPGA: nó kích hoạt các linh kiện khác, chẳng hạn như Flip-flop, thực hiện nhiệm vụ của chúng. Nếu bạn hình dung FPGA như một bộ bánh răng, thì xung nhịp giống như bánh răng lớn quay tất cả các bánh răng còn lại. Nếu bánh răng chính không quay, các bánh răng khác cũng sẽ đứng yên. Bạn cũng có thể coi xung nhịp như **trái tim** của hệ thống, vì nó giữ nhịp đập cho toàn bộ FPGA. Mỗi Flip-flop trong FPGA sẽ được cập nhật theo từng nhịp đập của xung nhịp.

```
              |<-- Chu kỳ (period) -->|
              ┌───────────┐           ┌───────────┐           ┌───────────┐      
Clk  ─────────┘           └───────────┘           └───────────┘           └──────
              ^           ^           ^
          cạnh lên   cạnh xuống   cạnh lên
          (rising)   (falling)    (rising)
```
*Hình 4-2: Dạng sóng của tín hiệu xung nhịp (Clock) — mức cao và mức thấp dài bằng nhau, tức duty cycle 50%*

Hãy chú ý các đường thẳng đứng trong biểu đồ tín hiệu xung nhịp, nơi tín hiệu nhảy từ mức thấp lên mức cao hoặc từ mức cao xuống mức thấp. Những sự thay đổi đột ngột này của tín hiệu được gọi là **các cạnh (edges)**:

* Khi xung nhịp chuyển từ mức thấp (0) lên mức cao (1), nó được gọi là **cạnh lên (rising edge)** hoặc cạnh dương (positive edge).
* Khi xung nhịp chuyển từ mức cao (1) xuống mức thấp (0), nó được gọi là **cạnh xuống (falling edge)**.

Các Flip-flop theo quy chuẩn chung được kích hoạt tại **mỗi cạnh lên** của xung nhịp: bất kỳ khi nào tín hiệu xung nhịp chuyển từ thấp lên cao, Flip-flop sẽ cập nhật đầu ra `Q` để khớp với đầu vào dữ liệu `D`.

> **GHI CHÚ:** Mặc dù có thể kích hoạt Flip-flop bằng cạnh xuống của xung nhịp, nhưng cách này ít phổ biến hơn nhiều so với việc sử dụng cạnh lên.

Mỗi xung nhịp có một **chu kỳ nhiệm vụ (duty cycle)**, tức là tỷ lệ thời gian mà tín hiệu ở mức cao. Ví dụ, một tín hiệu có chu kỳ nhiệm vụ 25% sẽ ở mức cao trong 1/4 thời gian và ở mức thấp trong 3/4 thời gian. Hầu hết các xung nhịp, bao gồm cả tín hiệu trong Hình 4-2, đều có chu kỳ nhiệm vụ **50%**: một nửa thời gian bật, một nửa thời gian tắt.

Xung nhịp cũng có một **tần số (frequency)**, là số chu kỳ lặp lại từ thấp lên cao và quay trở lại (gọi là 1 chu kỳ) trong vòng một giây. Tần số được đo bằng **Hertz (Hz)**, tức số chu kỳ trên mỗi giây. Bạn có thể quen thuộc với tần số CPU máy tính được đo bằng Gigahertz (GHz), trong đó 1 GHz bằng 1 tỷ Hz. Các FPGA không thường xuyên chạy nhanh đến mức đó. Phổ biến hơn, các tín hiệu xung nhịp của FPGA chạy trong khoảng từ hàng chục đến hàng trăm Megahertz (MHz), trong đó 1 MHz bằng 1 triệu Hz. Ví dụ, xung nhịp trên bo mạch Nandland Go Board chạy ở tần số **25 MHz** (25 triệu chu kỳ trên mỗi giây).

Một cách khác để mô tả tốc độ của xung nhịp là đề cập đến **chu kỳ (period)** của nó, tức là khoảng thời gian diễn ra của một chu kỳ xung nhịp đơn lẻ. Bạn có thể tính chu kỳ bằng công thức:

```
Chu kỳ = 1 / Tần số
```

Trong trường hợp của bo mạch Go Board (chạy 25 MHz), chu kỳ xung nhịp là:

```
T = 1 / 25.000.000 Hz = 40 ns
```

Bo mạch QMTech XC7A35T chạy **50 MHz**, nên chu kỳ của nó là:

```
T = 1 / 50.000.000 Hz = 20 ns
```

Con số 20 ns này sẽ dùng tới khi viết ràng buộc xung nhịp cho Vivado ở mục sau.

---

### Flip-Flop Trong Thực Tế (A Flip-Flop in Action)

Một Flip-flop hoạt động dựa trên các sự chuyển biến cạnh ở đầu vào xung nhịp của nó. Như đã đề cập trước đó, khi Flip-flop nhìn thấy một cạnh lên của xung nhịp, nó sẽ kiểm tra trạng thái của tín hiệu đầu vào dữ liệu `D` và **sao chép (replicate)** nó ra đầu ra `Q`—với điều kiện chân cho phép `En` đang ở mức cao. 

Quá trình này được gọi là **registering** (ghi nhận/chốt dữ liệu vào thanh ghi). Nhờ thuật ngữ này, một nhóm các Flip-flop được gọi là một **thanh ghi (register)**, và mở rộng ra, một Flip-flop đơn lẻ cũng có thể được gọi là một **thanh ghi 1-bit (one-bit register)**. Một Flip-flop đứng riêng lẻ có khả năng chốt được đúng 1 bit dữ liệu.

Để thấy quá trình chốt dữ liệu diễn ra như thế nào trong thực tế, chúng ta sẽ xem xét một vài ví dụ về đầu vào của Flip-flop và các đầu ra tương ứng. Đầu tiên, hãy xem **Hình 4-3**.

```
           1         2         3    
           ┌────┐    ┌────┐    ┌────
Clk   ─────┘    └────┘    └────┘    
                ┌───────────────────
D     ──────────┘                   
                     ┌──────────────
Q     ───────────────┘              
```
*Hình 4-3: Ví dụ 1 về hành vi chốt dữ liệu của Flip-flop — vẽ từ mô phỏng GHDL*

Hình này hiển thị 3 dạng sóng:

* Dạng sóng trên cùng (`Clk`) đại diện cho tín hiệu xung nhịp của FPGA.
* Dạng sóng ở giữa (`D`) là đầu vào dữ liệu của Flip-flop.
* Dạng sóng dưới cùng (`Q`) là đầu ra của Flip-flop.

Hãy giả định rằng chân cho phép `En` luôn ở mức cao, nên Flip-flop luôn được kích hoạt. Chúng ta có thể thấy các dạng sóng qua 3 chu kỳ xung nhịp; cạnh lên của mỗi chu kỳ xung nhịp được đánh số 1, 2, và 3. 

Ở khoảng giữa cạnh lên thứ nhất và cạnh lên thứ hai của xung nhịp, đầu vào `D` chuyển từ mức thấp lên mức cao. Tuy nhiên, hãy chú ý rằng **đầu ra `Q` không lập tức chuyển lên mức cao ngay khi đầu vào thay đổi**. Thay vào đó, Flip-flop phải mất một khoảng thời gian để ghi nhận sự thay đổi ở đầu vào. Cụ thể, phải **chờ đến cạnh lên xung nhịp tiếp theo (cạnh lên thứ 2)** thì đầu ra của Flip-flop mới đi theo đầu vào.

Flip-flop nhìn vào dữ liệu đầu vào và làm cho đầu ra khớp với đầu vào **chỉ tại thời điểm cạnh lên của xung nhịp**, tuyệt đối không bao giờ thay đổi ở khoảng giữa các cạnh. Trong trường hợp này, tại cạnh lên của chu kỳ xung nhịp thứ 2, đầu ra `Q` thấy `D` đã lên mức cao. Tại thời điểm này, `Q` nhận cùng giá trị với `D`. Ở cạnh lên thứ 3, `Q` lại tiếp tục kiểm tra giá trị của `D` và ghi nhận nó. Vì `D` không thay đổi, `Q` giữ nguyên ở mức cao. `Q` cũng đã kiểm tra `D` tại cạnh lên thứ nhất, nhưng vì cả `D` và `Q` đều đang ở mức thấp tại thời điểm đó, `Q` không thay đổi.

Bây giờ hãy xem xét **Hình 4-4**, hiển thị phản ứng của Flip-flop trong một kịch bản khác.

```
           1         2         3         4         5         6
           ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌
Clk   ─────┘    └────┘    └────┘    └────┘    └────┘    └────┘
                ┌───────────────────┐                         
D     ──────────┘                   └─────────────────────────
                     ┌───────────────────┐                    
Q     ───────────────┘                   └────────────────────
```
*Hình 4-4: Ví dụ 2 về hành vi của Flip-flop qua nhiều chu kỳ — vẽ từ mô phỏng GHDL*

Ở đây, chúng ta lại thấy Flip-flop hoạt động qua nhiều chu kỳ xung nhịp (giả định `En` luôn bằng 1). Giữa cạnh lên 1 và 2, đầu vào `D` từ thấp lên cao. Tại cạnh lên 2, `Q` thấy `D` lên cao nên `Q` cũng lật trạng thái từ thấp lên cao. Tại cạnh lên 3, `Q` thấy `D` vẫn ở mức cao nên giữ nguyên mức cao. Giữa cạnh lên 3 và 4, `D` chuyển xuống mức thấp, và đầu ra `Q` tương tự chuyển xuống mức thấp tại cạnh lên 4. Tại cạnh lên cuối cùng (thứ 5), `D` vẫn ở mức thấp nên `Q` giữ nguyên mức thấp.

Các ví dụ trước đều giả định chân `En` ở mức cao. Bây giờ hãy xem điều gì xảy ra khi chân `En` không phải lúc nào cũng ở mức cao. **Hình 4-5** hiển thị chính xác các dạng sóng `Clk` và `D` giống hệt Hình 4-4, nhưng tín hiệu `En` chỉ ở mức cao duy nhất tại cạnh lên thứ 3.

```
           1         2         3         4         5         6
           ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌
Clk   ─────┘    └────┘    └────┘    └────┘    └────┘    └────┘
                            ┌─────┐                           
En    ──────────────────────┘     └───────────────────────────
                ┌───────────────────┐                         
D     ──────────┘                   └─────────────────────────
                               ┌──────────────────────────────
Q     ─────────────────────────┘                              
```
*Hình 4-5: Hành vi của Flip-flop khi kết hợp tín hiệu cho phép xung nhịp (`En`) — vẽ từ mô phỏng GHDL*

Khi tín hiệu `En` tham gia vào, một đầu ra `Q` hoàn toàn khác sẽ được tạo ra:

* `Q` không còn "nhìn thấy" `D` đã lên mức cao ở chu kỳ xung nhịp thứ 2 nữa, bởi vì tín hiệu `En` đang ở mức thấp tại thời điểm đó.
* Thay vào đó, `Q` chỉ thay đổi đầu ra từ thấp lên cao tại chu kỳ xung nhịp thứ 3, khi tín hiệu `En` lên mức cao.
* Tại chu kỳ xung nhịp thứ 4, `D` đã xuống mức thấp, nhưng `Q` **không đi theo `D`**. Thay vào đó, `Q` tiếp tục giữ nguyên mức cao. Điều này là do tín hiệu `En` đã xuống mức thấp, **khóa cứng (locking)** giá trị đầu ra tại chỗ. Flip-flop sẽ không ghi nhận bất kỳ sự thay đổi nào từ `D` sang `Q` nữa.

Những ví dụ này minh họa hành vi của Flip-flop, cho thấy hoạt động của Flip-flop được điều phối bởi xung nhịp ra sao. Ngoài ra, chúng ta đã thấy việc tắt chân `En` cho phép Flip-flop **duy trì trạng thái (retain state)** ngay cả khi đầu vào `D` biến động. Điều này mang lại cho Flip-flop khả năng lưu trữ dữ liệu trong một khoảng thời gian dài.

---

### Chuỗi Các Flip-Flop (A Chain of Flip-Flops)

Các Flip-flop thường được nối chuỗi lại với nhau, trong đó đầu ra từ Flip-flop này đi trực tiếp vào đầu vào dữ liệu của Flip-flop tiếp theo. Ví dụ, **Hình 4-6** hiển thị một chuỗi gồm 4 Flip-flop (ký hiệu từ `test1` đến `test4`, giả định luôn được cho phép).

```
        +-------+     +-------+     +-------+     +-------+
------> |D     Q|---->|D     Q|---->|D     Q|---->|D     Q|------>
        |test1  |     |test2  |     |test3  |     |test4  |
Clk --->|>      |---->|>      |---->|>      |---->|>      |
        +-------+     +-------+     +-------+     +-------+
```
*Hình 4-6: Chuỗi nối tiếp 4 Flip-flop*

Cả 4 Flip-flop đều được điều khiển bởi cùng một tín hiệu xung nhịp. Xung nhịp đồng bộ hóa hoạt động của chúng: tại mỗi cạnh lên của xung nhịp, cả 4 Flip-flop sẽ đồng thời kiểm tra giá trị ở đầu vào của mình và chốt giá trị đó ra đầu ra.

Giả sử Flip-flop `test1` ghi nhận một sự thay đổi ở đầu vào của nó. **Hình 4-7** minh họa cách sự thay đổi đó lan truyền qua chuỗi Flip-flop cho đến khi ra tới đầu ra của `test4`.

```
              1         2         3         4         5         6     
              ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌────┐
Clk      ─────┘    └────┘    └────┘    └────┘    └────┘    └────┘    └
                   ┌──────────────────────────────────────────────────
test1_d  ──────────┘                                                  
                        ┌─────────────────────────────────────────────
test1_q  ───────────────┘                                             
                                  ┌───────────────────────────────────
test2_q  ─────────────────────────┘                                   
                                            ┌─────────────────────────
test3_q  ───────────────────────────────────┘                         
                                                      ┌───────────────
test4_q  ─────────────────────────────────────────────┘               
```
*Hình 4-7: Sự lan truyền tín hiệu đầu vào qua chuỗi Flip-flop — vẽ từ mô phỏng GHDL*

Biểu đồ hiển thị dạng sóng cho xung nhịp, đầu vào/đầu ra của Flip-flop `test1` (`test1_d` và `test1_q`), và đầu ra của từng Flip-flop tiếp theo:

* Tại cạnh lên thứ nhất (số 1), `test1_d` ở mức thấp nên `test1_q` giữ mức thấp.
* Phải đến cạnh lên thứ 2, Flip-flop đầu tiên mới "thấy" đầu vào đã chuyển sang mức cao và chốt ra đầu ra `test1_q`.
* Đầu ra `test1_q` cũng chính là đầu vào của Flip-flop `test2`, nhưng hãy chú ý rằng đầu ra `test2_q` **không lập tức chuyển sang mức cao** khi `test1_q` chuyển sang mức cao. Thay vào đó, `test2_q` chỉ chuyển sang mức cao sau đó 1 chu kỳ xung nhịp, tại cạnh lên thứ 3.
* Tiếp theo, tại cạnh lên thứ 4, chúng ta thấy `test3_q` lên mức cao, và cuối cùng tại cạnh lên thứ 5, `test4_q` lên mức cao và giữ nguyên ở đó.

Bằng cách thêm 3 Flip-flop đằng sau `test1`, chúng ta đã **làm trễ (delayed)** đầu ra đi đúng **3 chu kỳ xung nhịp** khi tín hiệu lan truyền qua chuỗi. Mỗi Flip-flop bổ sung trong chuỗi sẽ tạo ra thêm **1 chu kỳ xung nhịp độ trễ**. Kỹ thuật tạo độ trễ tín hiệu bằng cách thêm một chuỗi Flip-flop là một phương pháp thiết kế rất hữu ích khi làm việc với FPGA. Các kỹ sư thường nối chuỗi Flip-flop để tạo mạch hoãn/lưu giữ dữ liệu trong một khoảng thời gian, hoặc chuyển đổi dữ liệu từ nối tiếp (serial) sang song song (parallel) và ngược lại.

> **CÁC LOẠI FLIP-FLOP KHÁC**
> Trong chương này, chúng ta tập trung vào **D Flip-Flop**. Nếu bạn đã từng học môn Kỹ thuật Xung Số / Mạch Logic ở trường đại học, rất có thể giảng viên đã dành nhiều thời gian nói về các loại Flip-flop khác như **T Flip-Flop** và **JK Flip-Flop**. Tuy nhiên, trong thực tế phát triển FPGA, bạn hầu như không cần phải biết về các loại Flip-flop này, vì hầu hết các chip FPGA hiện đại đều được cấu tạo từ D Flip-Flop. Vì lý do đó, tác giả sẽ không làm bạn quá tải với thông tin về cách hoạt động của các loại Flip-flop khác, mặc dù việc biết sự tồn tại của chúng cũng là điều tốt.

---

## 2. Dự Án #3: Nhấp Nháy Đèn LED (Project #3: Blinking an LED)

Bây giờ bạn đã biết cách Flip-flop hoạt động, chúng ta sẽ đưa hai Flip-flop vào thực hành trong một dự án mà FPGA phải ghi nhớ thông tin về trạng thái của chính nó. Cụ thể, chúng ta sẽ **đảo trạng thái (toggle)** của một đèn LED mỗi khi một nút nhấn được **nhả ra (released)**. Nếu đèn LED đang tắt trước khi nhả nút, nó sẽ bật lên; nếu đèn LED đang bật, nó sẽ tắt đi.

Dự án này sử dụng **2 Flip-flop**:

1. **Flip-flop thứ nhất (`r_LED_1`):** Dùng để ghi nhớ trạng thái của đèn LED (đang bật hay tắt). Không có bộ nhớ này, FPGA sẽ không có cách nào biết liệu nó có nên đảo trạng thái LED mỗi khi nhả nút hay không; nó sẽ không biết đèn LED đang bật (cần tắt) hay đang tắt (cần bật).
2. **Flip-flop thứ hai (`r_Switch_1`):** Dùng để giúp FPGA phát hiện thời điểm nút nhấn được nhả ra. Cụ thể, chúng ta tìm kiếm **cạnh xuống (falling edge)** của tín hiệu điện từ nút nhấn: sự chuyển biến từ mức cao (1) xuống mức thấp (0).

Một cách tuyệt vời để tìm cạnh xuống trong FPGA là chốt tín hiệu đó bằng cách cho nó đi qua một Flip-flop. Khi giá trị đầu vào của Flip-flop (giá trị chưa chốt - unregistered value) bằng `0`, nhưng giá trị đầu ra trước đó (giá trị đã chốt - registered value) bằng `1`, chúng ta biết rằng một cạnh xuống vừa xảy ra! 

Cạnh xuống của nút nhấn không được nhầm lẫn với cạnh lên của xung nhịp; chúng ta vẫn đang sử dụng cạnh lên của xung nhịp để điều khiển tất cả các Flip-flop. **Hình 4-8** minh họa mẫu tín hiệu cần tìm kiếm.

```
                1         2         3         4         5         6
                ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌
i_Clk      ─────┘    └────┘    └────┘    └────┘    └────┘    └────┘
                   ┌───────────────────┐                           
i_Switch_1 ────────┘                   └───────────────────────────
                          ┌───────────────────┐                    
r_Switch_1 ───────────────┘                   └────────────────────
                                              ^
                                      Cạnh lên được khoanh tròn:
                                      i_Switch_1 = 0 và r_Switch_1 = 1
```
*Hình 4-8: Mạch phát hiện cạnh xuống bằng Flip-flop — vẽ từ mô phỏng GHDL*

Ở đây:

* `i_Clk` là tín hiệu xung nhịp.
* `i_Switch_1` đại diện cho tín hiệu điện từ nút nhấn đi vào Flip-flop.
* `r_Switch_1` là đầu ra của Flip-flop đó.

Tại cạnh lên xung nhịp được khoanh tròn, chúng ta có thể thấy `i_Switch_1` đang ở mức thấp (0), nhưng `r_Switch_1` vẫn đang ở mức cao (1). Mẫu tín hiệu này chính là cách chúng ta phát hiện cạnh xuống. Một điều cần lưu ý là mặc dù `r_Switch_1` sẽ xuống mức thấp ở cạnh lên xung nhịp đó, nhưng khi logic đánh giá trạng thái của `r_Switch_1` tại đúng cạnh lên đó, nó vẫn "nhìn thấy" `r_Switch_1` ở mức cao. Chỉ sau một độ trễ nhỏ, đầu ra của `r_Switch_1` mới chuyển xuống mức thấp theo trạng thái của `i_Switch_1`.

Dự án này cũng đòi hỏi một số logic nằm giữa hai Flip-flop, sẽ được thực hiện dưới dạng một bảng tra LUT. Đây sẽ là cái nhìn đầu tiên của bạn về cách Flip-flop và LUT phối hợp với nhau bên trong FPGA để hoàn thành công việc. **Hình 4-9** hiển thị sơ đồ khối tổng thể cho dự án này.

```
             +---------------------------------------+
             | FPGA                                  |
             |                                       |
SW1 -------->|---> [ Mạch phát hiện cạnh xuống ] --->|---> D1 (LED)
             |                                       |
             +---------------------------------------+
```
*Hình 4-9: Sơ đồ khối Dự án #3*

Đầu ra của một trong các nút nhấn trên bo mạch (SW1) đi vào FPGA, nơi mạch phát hiện cạnh xuống được triển khai. Đầu ra của logic này điều khiển một trong các đèn LED trên bo mạch (D1).

---

### Viết Mã Nguồn (Writing the Code)

Chúng ta có thể viết mã đảo trạng thái LED bằng Verilog hoặc VHDL như sau:

#### Mã nguồn Verilog:

```verilog
module LED_Toggle_Project (
  input  i_Clk,
  input  i_Switch_1,
  output o_LED_1
);

  reg r_LED_1    = 1'b0; // [1]
  reg r_Switch_1 = 1'b0; // [1]

  always @(posedge i_Clk) // [2]
  begin
    r_Switch_1 <= i_Switch_1; // [3]

    // Kiểm tra xem nút nhấn đã nhả ra chưa (Cạnh xuống)
    if (i_Switch_1 == 1'b0 && r_Switch_1 == 1'b1) // [4]
    begin
      r_LED_1 <= ~r_LED_1; // [5]
    end
  end

  assign o_LED_1 = r_LED_1;

endmodule
```

#### Mã nguồn VHDL:

```vhdl
library ieee;
use ieee.std_logic_1164.all;

entity LED_Toggle_Project is
  port (
    i_Clk      : in  std_logic;
    i_Switch_1 : in  std_logic;
    o_LED_1    : out std_logic
  );
end entity LED_Toggle_Project;

architecture RTL of LED_Toggle_Project is
  signal r_LED_1    : std_logic := '0'; -- [1]
  signal r_Switch_1 : std_logic := '0'; -- [1]
begin

  process (i_Clk) -- [2]
  begin
    if rising_edge(i_Clk) then
      r_Switch_1 <= i_Switch_1; -- [3]

      -- Kiểm tra xem nút nhấn đã nhả ra chưa (Cạnh xuống)
      if i_Switch_1 = '0' and r_Switch_1 = '1' then -- [4]
        r_LED_1 <= not r_LED_1; -- [5]
      end if;
    end if;
  end process;

  o_LED_1 <= r_LED_1;

end architecture RTL;
```

#### Phân tích chi tiết mã nguồn:

1. **Khai báo tín hiệu [1]:** Chúng ta bắt đầu bằng cách định nghĩa hai đầu vào (`i_Clk` và `i_Switch_1`) và một đầu ra (`o_LED_1`). Sau đó, chúng ta tạo hai tín hiệu `r_LED_1` và `r_Switch_1` bằng từ khóa `reg` (viết tắt của register) trong Verilog hoặc `signal` trong VHDL. Cuối cùng, các tín hiệu này sẽ được tổng hợp thành các Flip-flop (thanh ghi), vì vậy chúng ta thêm tiền tố `r_` vào tên của chúng. Việc dán nhãn cho bất kỳ tín hiệu nào bạn biết sẽ trở thành thanh ghi bằng dạng `r_signal_name` là một thói quen lập trình rất tốt.

2. **Khối Always / Process [2]:** Chúng ta khởi tạo khối `always` (Verilog) hoặc `process` (VHDL). Loại khối code này được kích hoạt bởi sự thay đổi của một hoặc nhiều tín hiệu được chỉ định trong **danh sách nhạy (sensitivity list)** đặt trong ngoặc đơn. Trong trường hợp này, khối nhạy với tín hiệu xung nhịp `i_Clk`. Cụ thể, khối này sẽ được kích hoạt mỗi khi xung nhịp chuyển từ 0 lên 1 (tại mỗi cạnh lên xung nhịp). Trong Verilog, chúng ta chỉ định điều này bằng từ khóa `posedge` (positive edge) ngay trong danh sách nhạy: `always @(posedge i_Clk)`. Trong VHDL, chúng ta chỉ đưa tên tín hiệu vào danh sách nhạy `process (i_Clk)` và kiểm tra cạnh lên ở hai dòng phía dưới bằng `if rising_edge(i_Clk) then`.

3. **Tạo Flip-flop thứ nhất [3]:** Bên trong khối `always`/`process`, chúng ta lấy tín hiệu đầu vào `i_Switch_1` và chốt vào `r_Switch_1`. Dòng mã này sẽ sinh ra một Flip-flop có `i_Switch_1` ở đầu vào `D`, `r_Switch_1` ở đầu ra `Q`, và `i_Clk` đi vào đầu vào xung nhịp. Đầu ra của Flip-flop này sẽ tạo ra độ trễ 1 chu kỳ xung nhịp đối với bất kỳ sự thay đổi nào ở đầu vào. Điều này mang lại cho chúng ta quyền truy cập vào **trạng thái trước đó** của nút nhấn, vốn cần thiết để phát hiện cạnh xuống.

4. **Kiểm tra cạnh xuống [4]:** Tiếp theo, chúng ta kiểm tra xem nút nhấn đã được nhả ra chưa bằng cách so sánh trạng thái hiện tại (`i_Switch_1`) với trạng thái trước đó (`r_Switch_1`). Nếu trạng thái hiện tại bằng `0` và trạng thái trước đó bằng `1`, chúng ta đã phát hiện một cạnh xuống (nút nhấn vừa nhả). Mạch so sánh `AND` này sẽ được thực hiện bằng một bảng tra LUT.

> **ĐIỀU BẤT NGỜ VỀ PHÉP GÁN PHI PHONG TỎA (`<=`)**
> Bạn có thể nhận ra một điều kỳ lạ: Đầu tiên chúng ta gán `r_Switch_1 <= i_Switch_1` [3], sau đó lại kiểm tra `if (i_Switch_1 == 1'b0 && r_Switch_1 == 1'b1)` [4]. Bạn có thể nghĩ rằng vì vừa gán `i_Switch_1` cho `r_Switch_1`, chúng sẽ luôn bằng nhau và câu lệnh `if` sẽ không bao giờ đúng? **Sai!** Các phép gán trong khối `always` hoặc `process` sử dụng toán tử `<= ` được gọi là **phép gán phi phong tỏa (non-blocking assignment)**. Chúng không xảy ra ngay lập tức! Thay vào đó, tất cả các phép gán sẽ diễn ra đồng thời tại cạnh lên của xung nhịp. Nếu tại cạnh lên xung nhịp `i_Switch_1` đang bằng 0 và `r_Switch_1` đang bằng 1, câu lệnh `if` sẽ được đánh giá là ĐÚNG, ngay cả khi `r_Switch_1` đồng thời chuyển từ 1 về 0 để khớp với `i_Switch_1`.

**Đính chính thuật ngữ cho người viết VHDL.** Hành vi mô tả trong khung trên là **đúng cho cả hai ngôn ngữ**, nhưng cái tên thì không. *Non-blocking assignment* (phép gán phi phong tỏa) là thuật ngữ **chỉ có trong Verilog**, nơi nó đối lập với *blocking assignment* viết bằng dấu `=`.

**VHDL không có cặp khái niệm này.** Trong VHDL, `<=` đơn giản là *phép gán tín hiệu* (signal assignment), và việc nó có hiệu lực muộn là hệ quả của cơ chế cập nhật signal theo delta cycle, chứ không phải của một loại phép gán đặc biệt nào.

Cặp khái niệm đối lập trong VHDL là **`signal` dùng `<=`** (có hiệu lực muộn) và **`variable` dùng `:=`** (có hiệu lực ngay). Mục 3 sẽ trình bày kỹ sự khác biệt này — nó quan trọng hơn nhiều so với tên gọi. Nếu bạn tìm trên mạng cụm "non-blocking assignment VHDL", kết quả trả về sẽ chỉ gây nhầm lẫn, vì chuẩn VHDL không dùng từ đó.

5. **Đảo trạng thái LED [5]:** Khi đi vào bên trong câu lệnh `if`, chúng ta đảo trạng thái của đèn LED. Thao tác này tạo ra Flip-flop thứ hai trong dự án. Chúng ta lấy giá trị hiện tại của `r_LED_1`, đảo ngược nó (phép NOT `~` / `not`), và lưu kết quả trở lại vào Flip-flop. Đầu ra của Flip-flop sẽ đi qua một LUT (đóng vai trò như cổng NOT) rồi phản hồi trở lại đầu vào `D` của chính Flip-flop đó. Bằng cách này, nếu đèn LED đang bật nó sẽ tắt, và ngược lại.

---

### Thêm Ràng Buộc (Adding Constraints)

Sau khi mã nguồn đã sẵn sàng, đã đến lúc chạy các công cụ để biên dịch file ảnh FPGA và nạp vào bo mạch. Đầu tiên, vì dự án này có sử dụng xung nhịp, bạn cần thêm tệp ràng buộc thời gian báo cho công cụ FPGA biết về **chu kỳ xung nhịp (clock period)**. 

Chu kỳ xung nhịp báo cho công cụ phân tích thời gian (timing analyzer) biết có bao nhiêu thời gian khả dụng để đi tuyến đường dây (route) giữa các Flip-flop. Khi tốc độ xung nhịp tăng lên, FPGA sẽ khó đáp ứng yêu cầu thời gian (meet timing) hơn. Với các xung nhịp chậm ở dải hàng chục Megahertz, bạn sẽ không gặp bất kỳ vấn đề nào. Thông thường, chỉ khi làm việc với các xung nhịp nhanh hơn 100 MHz, bạn mới bắt đầu gặp phải các vấn đề về thời gian (timing issues).

Để thêm tệp ràng buộc xung nhịp trong iCEcube2:

1. Nhấp chuột phải vào **Constraint Files** bên dưới mục Synthesis Tool và chọn tệp `.sdc` (Synopsys Design Constraints) để thêm vào dự án.
2. Tệp `.sdc` chứa câu lệnh định nghĩa chu kỳ xung nhịp (ví dụ với Go Board 25 MHz = 40 ns):
   ```text
   create_clock -period 40.00 -name {i_Clk} [get_ports {i_Clk}]
   ```
3. Cập nhật tệp ràng buộc chân vật lý `.pcf` để bổ sung chân cắm cho tín hiệu xung nhịp đầu vào:
   ```text
   set_io i_Clk 15
   ```
   *(Kiểm tra sơ đồ nguyên lý schematic của bo mạch để chọn đúng số chân xung nhịp, ví dụ chân 15 trên Go Board).*

#### Bản Tương Đương Trên Vivado + QMTech XC7A35T

Vivado gộp cả hai loại ràng buộc vào **một file `.xdc` duy nhất**, không tách `.sdc` và `.pcf` như iCEcube2. Cú pháp khai báo xung nhịp thì gần giống hệt, vì cả hai đều bắt nguồn từ chuẩn SDC của Synopsys.

Bo QMTech chạy **50 MHz**, tức chu kỳ **20 ns**:

```tcl
# Rang buoc xung nhip: 50 MHz = chu ky 20 ns
create_clock -period 20.000 -name sys_clk [get_ports i_clk]

# Chan vat ly
set_property PACKAGE_PIN N11 [get_ports i_clk]
set_property IOSTANDARD LVCMOS33 [get_ports i_clk]

set_property PACKAGE_PIN K5 [get_ports i_switch]
set_property IOSTANDARD LVCMOS33 [get_ports i_switch]

set_property PACKAGE_PIN E6 [get_ports o_led]
set_property IOSTANDARD LVCMOS33 [get_ports o_led]
```

Thiếu dòng `create_clock`, Vivado vẫn build được nhưng **không phân tích thời gian** — nó không biết tín hiệu nào là xung nhịp nên bỏ qua mọi đường đồng bộ. Thiết kế có thể trượt timing mà công cụ không hề cảnh báo. Với 50 MHz thì gần như chắc chắn vẫn chạy, nhưng đây là thói quen phải có từ đầu.

---

### Biên Dịch và Nạp Chip (Building and Programming the FPGA)

Khi bạn chạy quá trình biên dịch (Build), công cụ sẽ xuất ra Báo cáo Tổng hợp (Synthesis Report) có thông tin như sau:

```text
Number of Registers bits: 2 (0%)
Number of Clocks:         1
Number of LUTs:           1 (0%)
```

Báo cáo này cho chúng ta biết:

* Thiết kế sử dụng **2 bit thanh ghi**, nghĩa là có **2 Flip-flop** được sinh ra. Đúng như dự đoán của chúng ta!
* Thiết kế sử dụng **1 LUT**. Bảng tra LUT đơn lẻ này đảm nhận cả phép toán AND (so sánh cạnh xuống) và phép toán NOT (đảo trạng thái LED).
* Công cụ đã nhận diện chính xác tín hiệu `i_Clk` là một tín hiệu xung nhịp.

Sau khi biên dịch thành công, hãy nạp tệp `.bin` vào bo mạch qua Diamond Programmer. Hãy thử bấm nút nhấn nhiều lần—bạn sẽ thấy đèn LED đảo trạng thái bật hoặc tắt mỗi khi bạn nhả nút nhấn. Bạn đã kích hoạt thành công những Flip-flop đầu tiên của mình!

> **LƯU Ý THỰC TẾ:** Bạn có thể nhận thấy một điều kỳ lạ: Đèn LED đôi khi không đảo trạng thái ổn định ở mỗi lần nhả nút. Đừng nghĩ rằng FPGA không nhận tín hiệu nhả nút, mà thực tế là đèn LED đã đảo trạng thái **2 hoặc nhiều lần liên tiếp quá nhanh** khiến mắt người không thể nhận ra! Nguyên nhân đến từ đặc tính cơ học của nút nhấn—hiện tượng **dội phím (bouncing)**. Chúng ta sẽ tìm hiểu bản chất và cách khắc phục bằng mạch lọc dội phím trong Chương 5.

---

### Chạy Dự Án Này Trên QMTech XC7A35T

Mạch trên chạy được trên bo QMTech, nhưng có ba điều khác biệt cần biết trước.

#### 1. Cạnh xuống nghĩa là BẤM, không phải nhả

Chương 2 mục 3.5 đã chỉ ra bo QMTech dùng điện trở kéo lên còn bo trong sách dùng kéo xuống, nên giá trị đọc được ở chân nút là ngược nhau. Hệ quả cho dự án này: **cạnh xuống trên QMTech xảy ra lúc bấm, không phải lúc nhả**.

Cùng một đoạn mã, nhưng đèn sẽ đảo trạng thái ngay khi bạn bấm xuống. Mạch không sai, chỉ là phần cứng ngược nhau. Muốn giữ đúng hành vi "đảo khi nhả" như sách thì đổi điều kiện phát hiện thành cạnh lên.

#### 2. Thiếu mạch đồng bộ hoá — lỗi không bao giờ thấy trong mô phỏng

Đây là thứ sách không nhắc tới, và nó nghiêm trọng hơn chuyện dội phím.

Tín hiệu `i_switch` đến từ ngón tay bạn, **hoàn toàn không liên quan gì tới xung nhịp**. Sớm muộn gì nó cũng đổi trạng thái đúng vào cửa sổ setup/hold của flip-flop — một khoảng rất hẹp quanh cạnh lên xung nhịp, cỡ vài trăm picosecond với chip 7-series (con số chính xác tùy cấp tốc độ và điều kiện nhiệt độ, tra trong datasheet). Khi đó flip-flop rơi vào trạng thái nửa vời gọi là **metastability**: đầu ra không phải `0` cũng không phải `1`, mà lơ lửng ở giữa trong một khoảng thời gian không đoán trước được.

Nguy hiểm nằm ở chỗ `i_switch` trong mạch này đi vào **hai nơi cùng lúc**: vào flip-flop `r_switch` và vào phép so sánh phát hiện cạnh. Nếu giá trị đang lơ lửng, hai nơi đó có thể "đọc" ra hai kết quả khác nhau. Mạch bước vào tổ hợp trạng thái mà logic không cho phép tồn tại.

Tệ nhất là **mô phỏng luôn PASS**. Công cụ mô phỏng không mô hình hoá metastability, nó luôn cho ra `0` hoặc `1` dứt khoát. Lỗi chỉ xuất hiện trên bo thật, vài giờ mới một lần, không tái hiện được.

Cách chữa chuẩn là cho tín hiệu đi qua **hai flip-flop nối tiếp** trước khi dùng:

```vhdl
signal sw_ff1, sw_ff2 : std_logic := '1';
...
process (i_clk)
begin
  if rising_edge(i_clk) then
    sw_ff1 <= i_switch;    -- tang hy sinh, co the lo lung
    sw_ff2 <= sw_ff1;      -- co tron 1 chu ky de on dinh
    ...
    -- tu day tro di CHI dung sw_ff2, khong dung i_switch nua
  end if;
end process;
```

Flip-flop thứ nhất có thể rơi vào trạng thái lơ lửng, nhưng nó có trọn một chu kỳ xung nhịp để tự ổn định trước khi flip-flop thứ hai lấy mẫu. Xác suất còn lơ lửng sau khoảng đó nhỏ tới mức thời gian trung bình giữa hai lần lỗi tính bằng hàng triệu năm.

Cái giá phải trả là trễ thêm hai chu kỳ — với nút bấm thì chẳng đáng gì.

Quy tắc cần thuộc: **mọi tín hiệu đi từ ngoài chip vào** — nút nhấn, công tắc, UART RX, tín hiệu từ miền xung nhịp khác — đều phải qua hai flip-flop trước khi dùng. Và chỉ được dùng đầu ra của flip-flop thứ hai, ở mọi nơi trong thiết kế.

#### 3. Con số dội phím cho bo 50 MHz

Sách hẹn giải quyết dội phím ở chương 5. Chỉ cần nhớ trước con số: nút cơ khí nảy 1–10 ms, mà chu kỳ xung nhịp của bo là 20 ns, nên ngưỡng lọc cho 10 ms là **500.000 chu kỳ**.

Con số đó lớn tới mức mô phỏng không chạy nổi — nên khi viết mạch lọc, để ngưỡng thành tham số `generic`: mô phỏng đặt 5, nạp lên bo đặt 500.000.

#### Thứ tự ghép ba khối

```
i_switch --> [ 2 FF dong bo ] --> [ loc doi phim ] --> [ phat hien canh ] --> dao LED
             (chong metastable)    (loc nhieu co hoc)   (muc 2 cua chuong nay)
```

Mỗi khối làm đúng một việc và có thể dùng lại ở dự án khác. Dự án #3 trong sách mới chỉ có khối thứ ba.

---

## 3. Logic Tổ Hợp vs. Logic Tuần Tự (Combinational Logic vs. Sequential Logic)

Có hai loại logic chính diễn ra bên trong một FPGA: **Logic Tổ hợp (Combinational Logic)** và **Logic Tuần tự (Sequential Logic)**.

| Tiêu chí | Logic Tổ Hợp (Combinational Logic) | Logic Tuần Tự (Sequential Logic) |
| :--- | :--- | :--- |
| **Đầu ra phụ thuộc vào** | **Duy nhất các đầu vào ở thời điểm hiện tại**, không có bộ nhớ lưu trữ quá khứ. | **Cả đầu vào hiện tại VÀ trạng thái đầu ra trước đó**. |
| **Thành phần phần cứng** | Được tạo thành từ các bảng tra **LUTs**. | Được tạo thành từ **Flip-Flops** (kết hợp với LUTs). |
| **Sự kiện kích hoạt** | Thay đổi ngay lập tức khi đầu vào thay đổi. | Chờ đến **cạnh lên của xung nhịp Clock** mới cập nhật đầu ra. |
| **Tên gọi khác** | *Combinatorial logic* | *Synchronous logic* |

Rất khó để nhận biết một đoạn code Verilog/VHDL sẽ sinh ra LUT (Logic tổ hợp) hay Flip-flop (Logic tuần tự). Đặc biệt, một khối `always` (Verilog) hoặc `process` (VHDL) có thể định nghĩa cả hai loại logic này. Hãy so sánh hai ví dụ sau:

#### Ví dụ 1: Khối Always / Process Tổ hợp (Combinational)

* **Verilog:**
  ```verilog
  always @ (input_1 or input_2)
  begin
    and_gate <= input_1 & input_2;
  end
  ```
* **VHDL:**
  ```vhdl
  process (input_1, input_2)
  begin
    and_gate <= input_1 and input_2;
  end process;
  ```
* **Kết quả:** Đoạn mã này **chỉ sinh ra LUTs**, hoàn toàn không sinh ra bất kỳ Flip-flop nào vì danh sách nhạy không chứa xung nhịp Clock.

#### Ví dụ 2: Khối Always / Process Tuần tự (Sequential)

* **Verilog:**
  ```verilog
  always @ (posedge i_Clk)
  begin
    and_gate <= input_1 & input_2;
  end
  ```
* **VHDL:**
  ```vhdl
  process (i_Clk)
  begin
    if rising_edge(i_Clk) then
      and_gate <= input_1 and input_2;
    end if;
  end process;
  ```
* **Kết quả:** Danh sách nhạy giờ đây chứa xung nhịp `i_Clk`. Đoạn mã trở thành Logic tuần tự: Nó vẫn sử dụng 1 LUT để thực hiện phép toán AND, nhưng đầu ra sẽ được **chốt qua một Flip-flop** đồng bộ theo xung nhịp Clock.

> **LỜI KHUYÊN CHO NGƯỜI MỚI BẮT ĐẦU**
> Khi viết mã nguồn FPGA, bạn **chỉ nên tạo các khối `always` / `process` tuần tự** (danh sách nhạy chỉ chứa duy nhất `i_Clk` hoặc `i_Clk` + `i_Reset`). Các khối `always`/`process` tổ hợp rất dễ gây ra lỗi sinh **Latch ngoài ý muốn**.
> Đối với các logic tổ hợp thuần túy, hãy viết chúng **bên ngoài** khối `always`/`process`: dùng từ khóa `assign` trong Verilog hoặc phép gán `<=` trực tiếp trong VHDL.

### Riêng Của VHDL: `signal` và `variable`

Khung "Điều bất ngờ về phép gán phi phong tỏa" ở mục 2 giải thích vì sao `r_switch_1 <= i_switch_1` rồi ngay sau đó so sánh `r_switch_1` vẫn cho kết quả đúng: phép gán chỉ có hiệu lực **sau khi process kết thúc**.

Verilog chỉ có một cơ chế đó. VHDL thì có **hai**, và phân biệt được chúng là điều kiện để viết được nhiều loại mạch.

| | `signal` | `variable` |
| :--- | :--- | :--- |
| Toán tử gán | `<=` | `:=` |
| Thời điểm có hiệu lực | **sau khi process ngủ** | **ngay lập tức** |
| Khai báo ở đâu | architecture | trong process, giữa `process(...)` và `begin` |
| Phạm vi nhìn thấy | mọi process đều thấy | chỉ process đó |
| Nối ra port được không | **được** | không |

Khác biệt này quyết định ở một tình huống cụ thể: **tích luỹ trong vòng lặp**.

```vhdl
-- SAI: ca 8 vong deu doc gia tri CU cua sum, cuoi cung chi tang 1
signal sum : integer;
for i in 0 to 7 loop
    if input(i) = '1' then sum <= sum + 1; end if;
end loop;

-- DUNG: variable co hieu luc ngay, vong sau doc duoc ket qua vong truoc
process (input)
    variable cnt : integer range 0 to 8;
begin
    cnt := 0;                       -- phai dat lai moi lan process chay
    for i in 0 to 7 loop
        if input(i) = '1' then cnt := cnt + 1; end if;
    end loop;
    output <= std_logic_vector(to_unsigned(cnt, 4));
end process;
```

Quy tắc phân biệt: nếu các bước nằm **trong cùng một lần process chạy** và bước sau cần kết quả bước trước thì phải dùng `variable`. Nếu mỗi bước nằm ở **một chu kỳ xung nhịp khác nhau** thì `signal` hoàn toàn ổn, vì giữa hai lần đọc đã cách nhau cả một chu kỳ.

Một hiểu nhầm phổ biến cần dẹp bỏ: **không phải `signal` sinh ra flip-flop còn `variable` thì không.** Cả hai đều có thể thành flip-flop hoặc thành dây. Thứ quyết định là **giá trị đó có cần sống sót qua cạnh xung nhịp hay không**, chứ không phải từ khóa dùng để khai báo.

### Không Gán Thì Giữ Nguyên — Cách Sinh Ra Chân `En`

Mục 1 đã giới thiệu chân cho phép `En` của flip-flop ở mức phần cứng. Mục 4 sẽ nhắc lại nó như một tác dụng phụ may mắn giúp tránh latch. Nhưng đây còn là một **kỹ thuật dùng có chủ ý**, và là thành ngữ xuất hiện nhiều nhất khi viết mạch tuần tự.

Luật rất gọn: trong process có xung nhịp, **signal nào không được gán trong một nhánh thì giữ nguyên giá trị cũ**. Công cụ tổng hợp thường hiện thực điều đó bằng chân cho phép `CE` của flip-flop; với điều kiện giữ phức tạp hơn thì nó có thể dựng một MUX phản hồi thay vì dùng `CE`. Dù bằng cách nào, hành vi nhìn từ mã nguồn vẫn như nhau.

```vhdl
if rising_edge(i_clk) then
    if count = NGUONG then
        -- khong gan count o day -> no DUNG YEN o NGUONG
        o_done <= '1';
    else
        count <= count + 1;
    end if;
end if;
```

Bộ đếm trên tự dừng khi chạm ngưỡng mà không cần thêm cờ hay logic nào. Cùng kỹ thuật đó cho phép viết tín hiệu enable:

```vhdl
if rising_edge(i_clk) then
    if i_en = '1' then
        count <= count + 1;     -- khong co nhanh else
    end if;                      -- -> en = 0 thi count dung yen
end if;
```

Lưu ý luật này **chỉ đúng trong process có xung nhịp**. Trong process tổ hợp, "giữ nguyên giá trị cũ" chính là định nghĩa của latch — thứ phải tránh bằng mọi giá, như mục 4 sẽ trình bày.

### Vì Sao Cần Tín Hiệu `r_LED_1` Riêng

Trong mã nguồn Dự án #3, bạn có thể thắc mắc tại sao phải tạo `r_LED_1` rồi mới gán `o_LED_1 <= r_LED_1`, thay vì thao tác thẳng trên `o_LED_1`.

Lý do là một luật của VHDL: **port kiểu `out` chỉ ghi được, không đọc lại được.** Mà mạch này cần đọc giá trị hiện tại của đèn để đảo nó — `not r_LED_1`. Nếu viết `o_LED_1 <= not o_LED_1;` thì trình biên dịch báo lỗi.

Vì vậy mẫu hình này xuất hiện ở hầu hết mọi thiết kế VHDL có trạng thái: một signal nội bộ giữ trạng thái, cộng một dòng gán ra port ở cuối.

(Verilog không có hạn chế này nên mã Verilog của cùng dự án ngắn hơn một dòng. Chuẩn VHDL-2008 cũng đã bỏ hạn chế, nhưng nhiều công cụ vẫn mặc định chạy chuẩn cũ.)

---

## 4. Mối Nguy Hiểm Của Latch (The Dangers of Latches)

Một **Latch** là một linh kiện kỹ thuật số có khả năng lưu trữ trạng thái **mà không cần sử dụng xung nhịp (clockless)**. 

Mặc dù Latch thực hiện chức năng tương tự như Flip-flop (lưu trữ trạng thái), nhưng cách làm của nó hoàn toàn khác vì không có xung nhịp điều phối. Latch cực kỳ nguy hiểm và thường vô tình được sinh ra khi bạn viết logic tổ hợp không cẩn thận. Trong suốt sự nghiệp của mình, tác giả chưa bao giờ cố tình tạo Latch, mà chỉ vô tình tạo ra do lỗi viết code!

Các công cụ FPGA gặp rất nhiều khó khăn trong việc phân tích mối quan hệ thời gian (timing) của Latch. Nếu mã nguồn của bạn sinh ra Latch, các công cụ tổng hợp sẽ phát ra các cảnh báo nghiêm trọng.

### Latch Được Sinh Ra Như Thế Nào?

Latch được sinh ra khi bạn viết một khối `always`/`process` tổ hợp (hoặc phép gán điều kiện) bị **thiếu phép gán (incomplete assignment)**—nghĩa là đầu ra không được chỉ định giá trị trong *tất cả* các trường hợp đầu vào có thể xảy ra.

Hãy xem xét Bảng chân lý trong **Bảng 4-1**:

#### Bảng 4-1: Bảng Chân Lý Sinh Ra Latch

| Đầu vào A | Đầu vào B | Đầu ra Q |
| :---: | :---: | :---: |
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | **Không xác định (Undefined)** |

Khi cả hai đầu vào `A=1` và `B=1`, chúng ta không tuyên bố đầu ra `Q` sẽ là gì. Trong trường hợp này, công cụ tổng hợp FPGA sẽ tự suy luận rằng: *"Vì người dùng không nói rõ đầu ra là gì khi `A=1, B=1`, nên mình phải giữ nguyên trạng thái đầu ra trước đó"*. Hành vi giữ nguyên giá trị mà không có xung nhịp chính là bản chất của **Latch**!

#### Ví dụ mã nguồn SAI gây ra Latch:

* **Verilog (Đừng viết code như thế này!):**
  ```verilog
  always @ (i_A or i_B) // 1: Khối tổ hợp (không có Clock)
  begin
    if (i_A == 1'b0 && i_B == 1'b0)
      o_Q <= 1'b0;
    else if ((i_A == 1'b0 && i_B == 1'b1) || (i_A == 1'b1 && i_B == 1'b0))
      o_Q <= 1'b1;
    // BỊ THIẾU NHÁNH ELSE CHO TRƯỜNG HỢP i_A==1 && i_B==1 !
  end
  ```

* **VHDL (Đừng viết code như thế này!):**
  ```vhdl
  process (i_A, i_B) -- 1: Khối tổ hợp (không có Clock)
  begin
    if (i_A = '0' and i_B = '0') then
      o_Q <= '0';
    elsif (i_A = '0' and i_B = '1') or (i_A = '1' and i_B = '0') then
      o_Q <= '1';
    end if; -- BỊ THIẾU ELSE !
  end process;
  ```

Khi tổng hợp đoạn mã lỗi này, công cụ tổng hợp sẽ phát cảnh báo:
```text
@W: CL118 : Latch generated from always block for signal o_Q; possible missing assignment in an if or case statement.
```

### Cách Phòng Tránh Latch:

1. **Cách 1 (Bổ sung đầy đủ nhánh `else`):** Đảm bảo bao phủ 100% tất cả các trường hợp đầu vào trong khối tổ hợp.
2. **Cách 2 (Khuyên dùng - Chuyển sang khối tuần tự có Clock):**
   ```verilog
   always @(posedge i_Clk) // Khối tuần tự đồng bộ Clock
   begin
     if (i_A == 1'b0 && i_B == 1'b0)
       o_Q <= 1'b0;
     else if ((i_A == 1'b0 && i_B == 1'b1) || (i_A == 1'b1 && i_B == 1'b0))
       o_Q <= 1'b1;
   end
   ```
   Khi chuyển sang khối tuần tự có xung nhịp, `o_Q` sẽ trở thành một **Flip-flop an toàn** thay vì Latch. Công cụ sẽ tận dụng chân cho phép `En` của Flip-flop để khóa giữ giá trị cũ khi `A=1, B=1` một cách hoàn toàn dự đoán được!

3. **Lưu ý đối với VHDL:** Cú pháp gán điều kiện `when` bên ngoài khối process cũng có thể sinh Latch nếu thiếu nhánh `else` cuối cùng:
   ```vhdl
   -- SAI (Sinh Latch):
   o_Q <= '0' when (i_A = '0' and i_B = '0') else
          '1' when (i_A = '0' and i_B = '1') else
          '1' when (i_A = '1' and i_B = '0'); -- Thiếu else cho case 1,1
   ```

---

## 5. Reset Một Flip-Flop (Resetting a Flip-Flop)

Flip-flop có thêm một đầu vào đặc biệt gọi là chân **Set/Reset** (hoặc gọi ngắn gọn là Reset). Chân này dùng để khôi phục Flip-flop về trạng thái mặc định ban đầu (0 hoặc 1) khi FPGA mới cắm nguồn hoặc khi hệ thống cần khởi động lại (như Reset máy trạng thái, đưa bộ đếm về 0).

Có hai loại Reset:

### 1. Reset Đồng Bộ (Synchronous Reset)
Reset đồng bộ **chỉ có tác dụng tại cạnh lên của xung nhịp Clock**.

* **Verilog:**
  ```verilog
  always @(posedge i_Clk) // 1: Chỉ nhạy với Clock
  begin
    if (i_Reset)          // 2: Kiểm tra Reset trước
      o_Q <= 1'b1;        // Reset về 1
    else                  // 3: Hoạt động bình thường
      o_Q <= i_Data;
  end
  ```

* **VHDL:**
  ```vhdl
  process (i_Clk)
  begin
    if rising_edge(i_Clk) then
      if i_Reset = '1' then
        o_Q <= '1';
      else
        o_Q <= i_Data;
      end if;
    end if;
  end process;
  ```

### 2. Reset Bất Đồng Bộ (Asynchronous Reset)
Reset bất đồng bộ **có tác dụng ngay lập tức** khi tín hiệu Reset được kích hoạt, không cần chờ cạnh lên của xung nhịp.

* **Verilog:**
  ```verilog
  always @(posedge i_Clk or posedge i_Reset) // 1: Thêm i_Reset vào sensitivity list
  begin
    if (i_Reset)                             // 2: Kiểm tra Reset trước Clock
      o_Q <= 1'b1;
    else                                     // 3: Hoạt động bình thường
      o_Q <= i_Data;
  end
  ```

* **VHDL:**
  ```vhdl
  process (i_Clk, i_Reset) -- 1: Thêm i_Reset vào sensitivity list
  begin
    if i_Reset = '1' then -- 2: Kiểm tra Reset trước
      o_Q <= '1';
    elsif rising_edge(i_Clk) then -- 3: Kiểm tra Clock sau
      o_Q <= i_Data;
    end if;
  end process;
  ```

> **LƯU Ý:** Tín hiệu Reset có thể là Active High (kích hoạt mức 1) hoặc Active Low (kích hoạt mức 0, thường ký hiệu là `i_Reset_L` hoặc `i_Reset_n`). Lựa chọn giữa Reset đồng bộ hay bất đồng bộ nên tham khảo Hướng dẫn sử dụng (User Guide) của dòng chip FPGA bạn chọn, vì nhà sản xuất đã tối ưu phần cứng cho từng loại cụ thể.

### Trên Xilinx 7-Series: Hạn Chế Reset Càng Nhiều Càng Tốt

Lời khuyên "tham khảo User Guide của hãng" ở trên dẫn tới một kết luận có thể gây bất ngờ với dòng Artix-7 và Kintex-7: **đừng dùng reset nếu không thật sự cần.**

Lý do là flip-flop trên Xilinx 7-series **có sẵn giá trị khởi tạo nạp từ bitstream**. Khi FPGA nạp cấu hình lúc bật nguồn, mọi flip-flop đã được đặt về đúng giá trị bạn khai trong mã nguồn:

```vhdl
signal r_led : std_logic := '0';   -- gia tri nay nam trong bitstream
```

Nghĩa là mạch đã khởi động ở trạng thái xác định mà không cần một tín hiệu reset nào. Đây là điểm khác với ASIC, nơi flip-flop bật lên ở trạng thái ngẫu nhiên nên bắt buộc phải có reset.

Hai cái giá của việc lạm dụng reset:

* **Tốn đường định tuyến.** Tín hiệu reset nối tới hàng nghìn flip-flop, chiếm tài nguyên dây mà lẽ ra dành cho dữ liệu.
* **Chặn một số tối ưu hoá.** Công cụ không gộp được flip-flop vào khối chuyên dụng như Block RAM hay DSP nếu chúng mang reset không cần thiết. Riêng reset **bất đồng bộ** còn hạn chế nhiều hơn reset đồng bộ.

Nguyên tắc thực dụng:

* Reset những gì **điều khiển hành vi** — cờ trạng thái, bộ đếm, thanh ghi nhớ của máy trạng thái.
* **Không** reset những gì chỉ là **dữ liệu sẽ bị ghi đè** — thanh ghi dịch, bộ đệm, đường ống dữ liệu.
* Nếu phải dùng, ưu tiên reset **đồng bộ** hơn bất đồng bộ.

Có một chỗ giá trị khởi tạo không thay được cho reset: **trong mô phỏng**. Signal chưa khởi tạo mang giá trị `'U'`, và `not 'U'` vẫn là `'U'` — mạch đảo trạng thái sẽ không bao giờ ra `0` hay `1`. Vì vậy luôn khai giá trị khởi tạo ngay tại dòng khai báo signal, kể cả khi không định dùng reset.

---

## 6. Bảng Tra LUT và Flip-Flop Trên FPGA Thực Tế (LUTs and Flip-Flops on a Real FPGA)

Để có cái nhìn cụ thể hơn về cách LUT và Flip-flop thực sự được nối dây với nhau trong một chip FPGA thật, hãy xem sơ đồ cấu trúc từ Bảng thông số (Datasheet) của dòng FPGA Lattice iCE40 LP/HX trong **Hình 4-10**.

```
+---------------------------------------------------------------------------------------+
| Programmable Logic Block (PLB)                                                        |
|                                                                                       |
|  +--------------+     +------------------------------------------------------------+  |
|  | Logic Cell 1 | --> | Shared Block-Level Controls (Clock, Enable, Set/Reset)     |  |
|  +--------------+     |                                                            |  |
|  | Logic Cell 2 |     |  +------------------------------------------------------+  |  |
|  +--------------+     |  | Logic Cell (Phóng to)                                |  |  |
|  | Logic Cell 3 |     |  |                                                      |  |  |
|  +--------------+     |  |   [Carry Logic]                                      |  |  |
|  | Logic Cell 4 |     |  |         |                                            |  |  |
|  +--------------+     |  |   I0->  v                                            |  |  |
|  | Logic Cell 5 |     |  |   I1-> [ LUT4 ] ----> D                              |  |  |
|  | (Phóng to)   |====>|  |   I2->          |    EN -> [ DFF ] -------> Out      |  |  |
|  +--------------+     |  |   I3->          |    SR -> (D Flip-Flop)            |  |  |
|  | Logic Cell 6 |     |  |                                                      |  |  |
|  +--------------+     |  +------------------------------------------------------+  |  |
|  | Logic Cell 7 |     +------------------------------------------------------------+  |
|  +--------------+                                                                     |
|  | Logic Cell 8 |                                                                     |
|  +--------------+                                                                     |
+---------------------------------------------------------------------------------------+
```
*Hình 4-10: Cấu trúc LUT và Flip-flop trong một Logic Cell của chip FPGA Lattice iCE40*

Mọi họ chip FPGA, dù đến từ Lattice, AMD (Xilinx) hay Intel (Altera), đều có sơ đồ kiến trúc tương tự trong datasheet:

* Lattice gọi khối xây dựng cơ bản này là **PLB (Programmable Logic Block)**.
* AMD gọi là **CLB (Configurable Logic Block)**.
* Intel gọi là **ALM (Adaptive Logic Module)**.

Nhìn vào sơ đồ:

1. Mỗi khối **PLB** chứa **8 Logic Cells (LCs)**.
2. Phóng to một Logic Cell: Bên trong chứa **1 bảng tra 4 đầu vào (LUT4)** và **1 D Flip-Flop (DFF)** màu xám đậm. 
3. Các chân của DFF khớp chính xác với những gì chúng ta đã học: đầu vào dữ liệu `D`, đầu vào cho phép `EN`, đầu vào xung nhịp (`>`), và đầu vào `SR` (Set/Reset).
4. Bên cạnh đó là khối **Carry Logic** giúp tăng tốc các phép toán số học như cộng, trừ, so sánh.

Khối PLB này được nhân bản (copy-paste) hàng nghìn lần trên chip FPGA để cung cấp đủ số lượng LUTs và Flip-flops đáp ứng mọi thiết kế phần cứng của bạn!

### Cấu Trúc Tương Đương Trên Xilinx 7-Series

Chip Artix-7 và Kintex-7 có cách tổ chức khác về chi tiết nhưng giống hệt về nguyên lý. Thay vì "PLB chứa 8 logic cell", Xilinx chia thành hai cấp:

```
+--------------------------------------------------+
| CLB (Configurable Logic Block)                   |
|                                                  |
|  +--------------------+  +--------------------+  |
|  | SLICE              |  | SLICE              |  |
|  |                    |  |                    |  |
|  |  4 x LUT6          |  |  4 x LUT6          |  |
|  |  8 x Flip-flop     |  |  8 x Flip-flop     |  |
|  |  Carry chain       |  |  Carry chain       |  |
|  |  MUX ghep LUT      |  |  MUX ghep LUT      |  |
|  +--------------------+  +--------------------+  |
+--------------------------------------------------+
```

Đối chiếu ba hãng:

| | Lattice iCE40 | **AMD (Xilinx) 7-Series** | Intel (Altera) |
| :--- | :--- | :--- | :--- |
| Tên khối lớn | PLB | **CLB** | **LAB** |
| Đơn vị con bên trong | 8 Logic Cell | **2 Slice** | **ALM** |
| Bảng tra | LUT**4** | **LUT6** | LUT thích ứng |
| Flip-flop mỗi bảng tra | 1 | **2** | 2 |
| Chuỗi carry | có | có | có |

Lưu ý một điểm so với đoạn liệt kê phía trên: đoạn đó ghi *"Intel gọi khối xây dựng cơ bản là ALM"*, nhưng đối chiếu cho chính xác thì **ALM tương đương với Slice**, còn khối tương đương CLB của Intel mới là **LAB (Logic Array Block)**. Một LAB chứa nhiều ALM, giống như một CLB chứa hai Slice. Chi tiết này không ảnh hưởng tới nội dung chương, nhưng cần biết đúng nếu bạn đọc datasheet của Intel.

Khác biệt đáng nhớ nhất là tỉ lệ **hai flip-flop cho mỗi LUT** thay vì một như iCE40 — đó là lý do số flip-flop trên chip Xilinx luôn gấp đôi số LUT.

Số lượng thực tế trên hai bo mạch đang dùng:

| Chip | LUT6 | Flip-flop |
| :--- | :---: | :---: |
| **XC7A35T** (QMTech) | ~20.800 | ~41.600 |
| **XC7K325T** (AX7325B) | ~203.800 | ~407.600 |

Dự án #3 dùng **2 flip-flop và 1 LUT** trong số hơn bốn mươi nghìn flip-flop của XC7A35T.

---

## 7. Tóm Tắt Chương (Summary)

Trong chương này, bạn đã tìm hiểu về thành phần cốt lõi thứ hai của FPGA: **Flip-Flop**. Bạn đã nắm vững các kiến thức quan trọng:

* Flip-flop cho phép FPGA lưu giữ trạng thái (state) và bộ nhớ bằng cách chốt dữ liệu tại các cạnh lên của tín hiệu xung nhịp Clock.
* Sự khác biệt giữa **Logic Tổ hợp** (chỉ dùng LUT, cập nhật tức thì) và **Logic Tuần tự** (dùng Flip-flop + Clock, đồng bộ theo nhịp).
* Cách ứng dụng Flip-flop để phát hiện **cạnh xuống (falling edge)** của nút nhấn và thiết kế Dự án #3 đảo trạng thái LED.
* Mối nguy hiểm của **Latch** và cách phòng tránh bằng cách viết các khối logic tuần tự đúng quy chuẩn.
* Cách thiết lập **Reset đồng bộ** và **Reset bất đồng bộ** cho Flip-flop.
* Kiến trúc phần cứng thực tế ghép cặp 1 LUT4 + 1 DFF bên trong từng Logic Cell của FPGA.

Thêm vào đó, từ góc độ thực hành với VHDL trên Vivado và bo QMTech XC7A35T:

* **Trên QMTech, cạnh xuống nghĩa là BẤM nút chứ không phải nhả**, vì bo dùng điện trở kéo lên còn bo trong sách dùng kéo xuống. Cùng một đoạn mã, hành vi ngược nhau.
* **Dự án #3 thiếu mạch đồng bộ hoá.** Tín hiệu nút bấm bất đồng bộ với xung nhịp, phải cho qua **hai flip-flop nối tiếp** trước khi dùng, nếu không sẽ gặp metastability. Đây là loại lỗi mô phỏng **không bao giờ bắt được** — luôn PASS trên máy, chỉ sai trên bo thật.
* **Chuỗi xử lý nút nhấn đầy đủ gồm ba khối:** đồng bộ hoá → lọc dội phím → phát hiện cạnh. Sách mới chỉ có khối cuối.
* **Ngưỡng lọc dội phím ở 50 MHz là 500.000 chu kỳ** cho 10 ms. Nên để ngưỡng thành `generic` để mô phỏng đặt giá trị nhỏ, lên bo đặt giá trị thật.
* **VHDL có `signal` và `variable`**, khác nhau ở thời điểm có hiệu lực. Tích luỹ trong vòng lặp thì bắt buộc dùng `variable` — dùng `signal` sẽ chỉ tăng được đúng một lần. Nhưng cả hai đều có thể thành flip-flop — thứ quyết định là giá trị có cần sống sót qua cạnh xung nhịp hay không, chứ không phải từ khóa khai báo.
* **Trong process có xung nhịp, signal không được gán trong một nhánh thì giữ nguyên giá trị.** Công cụ hiện thực bằng chân `En` của flip-flop. Đây là cách viết bộ đếm tự dừng ở ngưỡng và tín hiệu enable — thành ngữ dùng nhiều nhất khi viết mạch tuần tự. Nhưng trong process **tổ hợp** thì chính hành vi đó lại là latch.
* **Port `out` không đọc lại được ở VHDL-93**, nên mọi mạch có trạng thái đều cần một signal nội bộ rồi gán ra port ở cuối.
* **Trên Xilinx 7-Series nên hạn chế reset.** Flip-flop đã có giá trị khởi tạo nạp từ bitstream nên mạch khởi động ở trạng thái xác định sẵn. Reset thừa tốn định tuyến và chặn tối ưu hoá. Nhưng vẫn luôn khai giá trị khởi tạo cho signal, vì mô phỏng cần nó để thoát khỏi `'U'`.
* **Vivado dùng một file `.xdc` duy nhất** cho cả ràng buộc xung nhịp lẫn chân vật lý. Với 50 MHz: `create_clock -period 20.000 -name sys_clk [get_ports i_clk]`.
* **Kiến trúc Xilinx là CLB gồm 2 slice, mỗi slice có 4 LUT6 + 8 flip-flop.** Tỉ lệ hai flip-flop cho mỗi LUT giải thích vì sao chip luôn có số flip-flop gấp đôi số LUT.

---
*Tài liệu được dịch và tổng hợp chi tiết 1-1 từ cuốn sách "Getting Started with FPGAs" (Russell Merrick).*
