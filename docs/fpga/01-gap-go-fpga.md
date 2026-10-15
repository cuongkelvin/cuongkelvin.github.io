# CHƯƠNG 1: GẶP GỠ FPGA (MEET THE FPGA)
## Bản Dịch Đầy Đủ, Chi Tiết & Toàn Diện (Full Translation & Detailed Technical Guide)

---

## 1. Mở Đầu: Khái Niệm Nền Tảng Về FPGA (Introduction & Fundamental Concepts)

FPGA, viết tắt của **Field Programmable Gate Array** (Mảng cổng logic lập trình được theo trường / thực địa), là một loại mạch tích hợp (IC - Integrated Circuit) bán dẫn có khả năng xử lý vô cùng mạnh mẽ.

* **Field Programmable (Lập trình được ngoài thực địa):** Thể hiện rằng FPGA có thể được lập trình hoặc tái lập trình lại cấu hình mạch điện ngay sau khi đã được xuất xưởng và triển khai ngoài thực địa (tức là không cần phải gửi trả chip về nhà máy bán dẫn để sản xuất lại).
* **Gate Array (Mảng cổng logic):** Thể hiện rằng cấu trúc của FPGA được cấu tạo từ một lưới hai chiều (2D grid) chứa một lượng khổng lồ các cổng logic — những đơn vị xử lý logic kỹ thuật số nền tảng.

### Tên Gọi Và Sự Tiến Hóa Của Kiến Trúc
Tên gọi này thực chất có phần mang tính lịch sử. Thực tế hiện nay, một số dòng FPGA không thể tái lập trình lại ngoài thực địa (chỉ lập trình một lần - OTP), và hầu hết các FPGA hiện đại không còn chỉ là một mảng chứa các cổng logic đơn thuần nữa. Chúng tinh vi và phức tạp hơn thế rất nhiều. Dù vậy, tên gọi FPGA vẫn tồn tại qua nhiều thập kỷ và làm nổi bật đặc tính độc nhất vô nhị của chúng: **tính linh hoạt phi thường (incredible flexibility)**.

Ứng dụng của FPGA thực sự chỉ bị giới hạn bởi trí tưởng tượng của người thiết kế.
* **Vi điều khiển (Microcontrollers):** Được thiết kế với một tập hợp các tính năng phần cứng cố định (mạch cứng); bạn chỉ có thể thực hiện một chức năng nếu tính năng đó đã được nhà sản xuất tích hợp sẵn trên chip.
* **FPGA:** Mảng cổng logic của FPGA giống như một **"tờ giấy trắng" (blank slate)** mà bạn có thể tự do thiết lập cấu hình, nạp mã, và tái lập trình liên tục để biến con chip thành bất kỳ mạch điện kỹ thuật số nào bạn muốn với rất ít rào cản.

Tuy nhiên, sự tự do tuyệt đối này không đi kèm miễn phí mà đòi hỏi những sự đánh đổi về chi phí, độ phức tạp, và kỹ năng thiết kế phần cứng đặc thù.

---

## 2. Tư Duy Song Song vs. Tư Duy Tuần Tự (Parallel vs. Serial Thinking)

Học cách thiết kế trên FPGA đòi hỏi một **thay đổi căn bản trong tư duy** so với lập trình phần mềm truyền thống.

### Lập Trình Phần Mềm Truyền Thống (Tư Duy Tuần Tự - Serial)
Trong lập trình phần mềm thông thường (như viết mã C, C++, Python, hay Java), quy trình xử lý mang tính **nối tiếp / tuần tự**:
1. Đầu tiên, dòng lệnh A chạy.
2. Sau khi dòng A hoàn thành, dòng lệnh B mới chạy.
3. Cuối cùng, dòng C chạy.

Nguyên nhân là do mã nguồn phần mềm được biên dịch để chạy trên một bộ xử lý trung tâm (**CPU / Processor**). Về bản chất, CPU là một **máy chạy tuần tự (serial machine)** — nó thực hiện từng lệnh một tại một thời điểm (single instruction at a time).

### Thiết Kế Trên FPGA (Tư Duy Song Song - Parallel)
Ngược lại hoàn toàn, FPGA vận hành theo cơ chế **song song thực sự (true parallelism)**: **mọi khối mạch điện, mọi dòng logic đều diễn ra đồng thời tại cùng một thời điểm**.

Việc nắm vững sự khác biệt giữa tư duy nối tiếp và tư duy song song là nền tảng sống còn khi làm việc với FPGA:
* Khi bạn học được cách giải quyết bài toán bằng phương pháp song song, năng lực tư duy kỹ thuật tổng thể của bạn sẽ tăng lên một tầm cao mới.
* Tư duy song song này không chỉ áp dụng cho FPGA mà còn mở rộng sang nhiều lĩnh vực kỹ thuật khác, giúp bạn nhìn nhận bài toán dưới những góc nhìn hoàn toàn mới.
* Việc chuyển đổi từ tư duy tuần tự sang tư duy song song chính là kỹ năng cốt lõi nhất để trở thành một kỹ sư thiết kế FPGA thực thụ.

---

## 3. Tư Duy Song Song Nhìn Từ Code Thực Tế

Mục trên đã nói tư duy song song là gì về mặt khái niệm. Nhưng khi ngồi gõ VHDL thì nó hiện ra ở ba chỗ rất cụ thể, và đây chính là ba chỗ dân lập trình phần mềm hiểu sai nhiều nhất.

### A. Vòng Lặp `for` Không Phải Là Lặp — Nó Là Nhân Bản Mạch

```vhdl
for i in 0 to 7 loop
    <một full adder>
end loop;
```

Đoạn mã này **không** chạy 8 lần theo thời gian. Nó có nghĩa là: *"đặt 8 bộ full adder lên chip"*. Tám khối mạch vật lý nằm cạnh nhau, hoạt động đồng thời, cho ra kết quả trong **cùng một chu kỳ xung nhịp**.

Hệ quả: viết `for i in 0 to 999 loop` với thân vòng lặp là một phép nhân 16 bit sẽ cần **1000 bộ nhân**. Chip XC7K325T chỉ có 840 khối DSP. Thiết kế **không tổng hợp được**.

> **Quy tắc ghi nhớ:**
> Tổng phần cứng = (số vòng lặp) × (phần cứng trong thân vòng lặp).

Trong phần mềm, vòng lặp tốn **thời gian**. Trong phần cứng, vòng lặp tốn **diện tích**.

### B. Instantiation Không Phải Là Gọi Hàm

```vhdl
u1 : entity work.adder_1b port map(...);
u2 : entity work.adder_1b port map(...);
```

Hai dòng này **không phải** gọi cùng một hàm hai lần. Chúng là lệnh hàn **hai khối mạch riêng biệt** lên chip:

| | Gọi hàm trong C | Instantiation trong VHDL |
| :--- | :--- | :--- |
| Gọi 2 lần | vẫn dùng chung 1 đoạn mã | **sinh ra 2 khối mạch vật lý** |
| Thời điểm xảy ra | khi chương trình chạy tới dòng đó | **không có "thời điểm"** — mạch tồn tại từ giây đầu tới giây cuối |
| Tài nguyên | 1 bản mã trong bộ nhớ | tốn gấp đôi LUT / flip-flop |

Hình dung đúng: instantiation giống như **hàn một linh kiện lên bo mạch**, không phải gọi lệnh.

### C. Mọi Thiết Kế Đều Là Một Bài Toán Đánh Đổi Diện Tích ↔ Thời Gian

Cùng một bộ cộng 8 bit, có hai cách làm hoàn toàn khác nhau:

| Phương án | Số full adder | Số chu kỳ xung nhịp |
| :--- | :---: | :---: |
| Trải phẳng (parallel / unrolled) | **8** | 1 |
| Tuần tự 2 bit mỗi nhịp (serial) | **2** | 4 |

Kết quả giống hệt nhau, chỉ khác chỗ trả giá. Đây là dạng đánh đổi xuất hiện ở **mọi** quyết định thiết kế FPGA, từ bộ cộng vài bit cho tới khối xử lý gói tin 10 Gbps.

Điểm thú vị: bản tuần tự thường **chạy được ở tần số cao hơn**, vì đường logic tổ hợp ngắn hơn. Nên "mất 4 chu kỳ" không đồng nghĩa với "chậm hơn 4 lần".

---

## 4. Lập Trình Mức Thấp Nhất Về Phần Cứng (Lowest Level Hardware Design)

Làm việc với FPGA mang lại sự hào hứng rất lớn. Khi bạn xây dựng một thiết kế phần cứng bằng các ngôn ngữ mô tả phần cứng (**HDL**) như **Verilog** hay **VHDL**, bạn đang viết mã ở **mức thấp nhất có thể trong kỹ thuật máy tính**:
* Bạn đang trực tiếp tạo ra các **kết nối vật lý**, các **đường dây dẫn thực sự (actual wires)** giữa các linh kiện điện tử và các chân vào/ra (I/O pins) trên chip.
* Điều này mang lại cho bạn quyền kiểm soát tuyệt đối trên từng bit dữ liệu và từng chu kỳ xung nhịp, cho phép giải quyết hầu như mọi bài toán kỹ thuật số.
* Mức độ lập trình này thấp hơn rất nhiều so với việc viết code cho một vi điều khiển đã có sẵn CPU.

Nhờ đó, học FPGA là con đường tốt nhất để hiểu sâu sắc cách thức mạch logic kỹ thuật số thực sự vận hành trong các ứng dụng thực tế, mang lại cho bạn sự tôn trọng và thấu hiểu đối với độ phức tạp của ngay cả những vi mạch tích hợp đơn giản nhất.

---

## 5. Cơ Chế Tái Lập Trình: Điều Gì Thực Sự Xảy Ra Khi Nạp Bitstream

Mục 1 nói FPGA "tái lập trình được", nhưng cơ chế bên dưới mới là chỗ dễ hiểu sai nhất.

**Nạp bitstream không hề đấu lại một transistor nào.**

Toàn bộ transistor, dây dẫn kim loại và các công tắc đã được khắc cứng lên silicon từ lúc sản xuất, vĩnh viễn không thay đổi. Thứ duy nhất thay đổi là **nội dung của vài chục triệu ô nhớ SRAM cấu hình** nằm rải khắp chip. Mỗi ô nhớ đó giữ 1 bit, và bit đó:

* hoặc là **một ô trong bảng tra của LUT** (quyết định LUT cho ra 0 hay 1 tại tổ hợp đầu vào đó),
* hoặc là **chân điều khiển của một transistor truyền** tại nút giao dây (quyết định hai đoạn dây có thông nhau hay không).

Nói cách khác: *"lập trình FPGA" thực chất là ghi giá trị vào một đống ô nhớ.* Phần cứng vật lý giống hệt nhau ở mọi thiết kế.

### So Sánh Hai Kiểu "Lập Trình Lại"

| | Thay đổi cái gì |
| :--- | :--- |
| **CPU / Vi điều khiển** | Giữ nguyên mạch. Chỉ đổi **dữ liệu điều khiển mạch** — tức chương trình nằm trong bộ nhớ |
| **FPGA** | Đổi **chính mạch điện** |

### Hệ Quả Thực Tế: Mất Điện Là Mất Sạch

Vì cấu hình nằm trong SRAM (bộ nhớ bay hơi), **ngắt nguồn là toàn bộ thiết kế biến mất**. Board phải nạp lại từ chip Flash QSPI mỗi lần bật nguồn, hoặc nạp tay qua JTAG trong lúc phát triển.

Đây là điểm khác biệt lớn với vi điều khiển, nơi chương trình nằm trong Flash và tồn tại vĩnh viễn.

### Cái Giá Phải Trả

Mỗi cổng logic trong thiết kế phải đi qua một LUT, rồi đi qua nhiều transistor truyền tại các nút giao dây. Chính vì vậy FPGA **chậm hơn và tốn điện hơn ASIC** cùng chức năng khoảng một bậc (one order of magnitude).

Đổi lại: sửa thiết kế mất vài phút, thay vì làm lại con chip mất vài tháng và vài triệu USD.

---

## 6. Lịch Sử Phát Triển Của FPGA (A Brief History of FPGAs)

### Chiếc FPGA Đầu Tiên
* **XC2064:** Chiếc FPGA đầu tiên trên thế giới được công ty **Xilinx** ra mắt vào năm **1985**.
* **Năng lực:** Cực kỳ sơ khai, chỉ chứa vỏn vẹn **800 cổng logic (gates)** — một con số nhỏ bé so với hàng triệu đến hàng tỷ phép toán cổng logic trên các FPGA hiện đại.
* **Giá thành:** Rất đắt đỏ, có giá khoảng **55 USD** vào thời điểm đó (tương đương khoảng **145 USD** ngày nay sau khi điều chỉnh lạm phát).
* **Tầm ảnh hưởng:** XC2064 đã khai sinh ra cả một ngành công nghiệp bán dẫn hoàn toàn mới. Xilinx cùng với Altera đã trở thành hai gã khổng lồ thống trị thị trường FPGA suốt hơn 30 năm.

### Sự Tiến Hóa Về Chức Năng
* **Thập niên 1980:** Các FPGA đời đầu chỉ làm các tác vụ Boolean đơn giản như thực hiện phép toán OR giữa 2 chân đầu vào và đưa kết quả ra chân đầu ra. Trước khi có FPGA, muốn làm việc này người ta phải gắn các chip cổng logic rời (discrete logic gates) lên bảng mạch PCB. Nếu cần thêm phép AND, lại phải gắn thêm chip khác, khiến bo mạch bị lấp đầy bởi các linh kiện rời rạc. Khi FPGA xuất hiện, **một chip duy nhất có thể thay thế hàng loạt linh kiện rời**, giúp tiết kiệm diện tích PCB, giảm chi phí và cho phép tái lập trình lại mạch khi yêu cầu dự án thay đổi.
* **Sự ra đời của Hard IP:** Qua nhiều năm, FPGA được tích hợp thêm các khối phần cứng chuyên dụng gọi là **Hard IP (Hard Intellectual Property)**. Đây là các mạch điện cứng cố định được tối ưu hóa cho một tác vụ cụ thể (trái ngược với *Soft IP* được dựng từ mảng logic lập trình được).
    * Ví dụ: Các khối Hard IP trong FPGA hiện đại cho phép giao tiếp trực tiếp tốc độ cao với bộ nhớ DDR, USB-C, Ethernet, SerDes... Một số giao diện tốc độ cao như USB-C hoàn toàn không thể thực hiện được nếu không có mạch Hard IP chuyên dụng.
    * Các nhà sản xuất thậm chí còn tích hợp cả các nhân xử lý CPU chuyên dụng (gọi là **Hard Processors** như nhân ARM) ngay bên trong con chip FPGA để vừa chạy mã C thông thường vừa kết nối trực tiếp với mảng logic lập trình được.

### Bối Cảnh Thị Trường Và Các Thương Vụ Mua Bán - Sáp Nhập (M&A)
Thị trường FPGA đã trải qua những bước chuyển mình lịch sử thông qua các thương vụ sáp nhập khổng lồ:
* **2015:** **Intel** thâu tóm **Altera** với giá **16,7 tỷ USD**.
* **2020:** Tập đoàn sản xuất chip **AMD** mua lại **Xilinx** với giá kỷ lục **35 tỷ USD**.
* *Ý nghĩa:* Việc hai tập đoàn CPU lớn nhất thế giới quyết định mua lại hai công ty FPGA hàng đầu cho thấy tầm nhìn chiến lược: khi giới hạn của CPU đạt ngưỡng, việc kết hợp nhân CPU với phần cứng tái lập trình dạng FPGA trên cùng một gói chip là hướng đi tương lai của điện toán hiệu năng cao.

Các tên tuổi khác trên thị trường:
* **Lattice Semiconductor:** Rất thành công ở phân khúc FPGA nhỏ, giá rẻ và tiêu thụ ít điện năng. Lattice lựa chọn không tham gia cuộc đua tốn kém ở phân khúc cao cấp với AMD và Intel. Ngày nay, cộng đồng mã nguồn mở cực kỳ ưa chuộng chip Lattice (như dòng iCE40, ECP5) vì cấu trúc của chúng đã được giải mã đảo ngược (reverse-engineered) để dùng các công cụ lập trình mã nguồn mở hoàn toàn.
* **Actel:** Một công ty tầm trung nổi tiếng với các FPGA chịu bức xạ/chống lỗi dùng trong không gian. Actel được Microsemi mua lại vào năm 2010 với giá 430 triệu USD, sau đó Microsemi lại được **Microchip Technology** thâu tóm vào năm 2018.

---

## 7. Các Ứng Dụng Phổ Biến Của FPGA (Popular FPGA Applications)

FPGA hiện đại với dung lượng lớn và độ linh hoạt cao hiện diện trong nhiều ngành công nghiệp mũi nhọn:

1. **Viễn thông (Telecommunications):** FPGA là thành phần cốt lõi trong các trạm phát sóng di động (cell phone towers), trạm gốc 4G/5G, chịu trách nhiệm xử lý tín hiệu số thu phát và định tuyến lưu lượng internet tốc độ cao mang dữ liệu tới điện thoại thông minh.
2. **Tài chính & Giao dịch tần suất cao (High-Frequency Trading - HFT):** Các quỹ đầu tư sử dụng thuật toán tự động để mua bán cổ phiếu trong thời gian cực ngắn. Trong HFT, việc thực hiện lệnh nhanh hơn đối thủ dù chỉ vài phần triệu giây (microseconds) cũng mang lại lợi thế tài chính khổng lồ. Với **độ trễ cực thấp (ultra-low latency)** và khả năng tái lập trình thuật toán trực tiếp trên phần cứng, FPGA là lựa chọn số 1 trong ngành công nghiệp mà mỗi millisecond đều trị giá hàng triệu USD.
3. **Xử lý Video & Màn hình hiển thị:** Dùng trong thiết bị truyền hình, chỉnh sửa video chuyên nghiệp yêu cầu băng thông dữ liệu khổng lồ để xử lý luồng video 4K/8K thời gian thực.
4. **Hàng không vũ trụ & Quốc phòng:** Dùng trong radar, hệ thống định vị vệ tinh, xử lý tín hiệu vô tuyến nhờ độ tin cậy cao và khả năng chống bức xạ.
5. **Tổng quát:** FPGA là ứng cử viên hàng đầu cho bất kỳ bài toán kỹ thuật số nào đòi hỏi:
    * **Băng thông dữ liệu khổng lồ (High bandwidth).**
    * **Độ trễ xử lý cực thấp (Low latency).**
    * **Năng lực tính toán song song lớn (High processing capability).**

---

## 8. So Sánh Các Linh Kiện Logic Số: FPGA vs. Vi Điều Khiển vs. ASIC

Mặc dù có năng lực mạnh mẽ, FPGA vẫn là một công nghệ chuyên biệt (niche) khi đặt bên cạnh **Vi điều khiển (Microcontroller)** và **ASIC**. Việc lựa chọn linh kiện nào là một bài phân tích đánh đổi kỹ thuật gọi là **Trade Study**.

```
[Bảng Phổ Linh Kiện Logic Số]:
+----------------------+-----------------------+-----------------------+
|    VI ĐIỀU KHIỂN     |         FPGA          |         ASIC          |
| (Linh hoạt phần mềm) | (Linh hoạt phần cứng) | (Cố định hoàn toàn)   |
+----------------------+-----------------------+-----------------------+
```

### A. FPGA vs. Vi Điều Khiển (Microcontrollers)

Vi điều khiển có mặt ở khắp mọi nơi: từ điều khiển tivi, máy pha cà phê, đồ chơi trẻ em cho đến bo mạch Arduino (chạy chip Atmel/Microchip).

#### Tại sao Vi điều khiển phổ biến hơn FPGA?
1. **Chi phí (Cost):** Ngành điện tử tiêu dùng cực kỳ nhạy cảm về giá. Vi điều khiển có vô số biến thể được tối ưu hóa cho từng mục đích cụ thể. Nếu sản phẩm chỉ cần 1 bộ ADC, 2 cổng USB và 30 chân GPIO, nhà sản xuất có thể chọn đúng loại vi điều khiển có chính xác cấu hình đó mà không phải trả tiền thừa cho bất kỳ tính năng nào khác.
2. **Đường đi tuyến (Routing) của FPGA:** Để tạo nên tính linh hoạt "tờ giấy trắng", FPGA phải chứa một mạng lưới đường dây dẫn nội bộ khổng lồ (gọi là *routing* hoặc *interconnect*). Mạng lưới routing này làm tăng diện tích chip, tăng chi phí và độ phức tạp. Người dùng phải trả tiền cho sự linh hoạt mà đôi khi họ không dùng hết.
3. **Sản lượng (Quantity):** Vi điều khiển được sản xuất với sản lượng hàng chục triệu đơn vị nên giá thành trên mỗi chip rất rẻ (thường dưới 1 USD). FPGA sản xuất sản lượng thấp hơn nên giá đơn vị cao hơn.
4. **Độ dễ sử dụng & Thời gian phát triển (Ease of Use & Time-to-Market):** Vi điều khiển viết bằng ngôn ngữ C là lập trình ở mức cao (high-level), có thể chạy dự án cơ bản trong vài giờ. Trong khi đó, viết Verilog/VHDL cho FPGA là ở mức rất thấp (low-level)—tương tự như việc bạn phải tự tay xếp từng viên gạch LEGO thay vì dùng các bộ dựng sẵn. Điều này kéo dài thời gian thiết kế và tăng chi phí nhân công.
5. **Mức tiêu thụ điện năng (Power Consumption):** Vi điều khiển được tối ưu hóa nên tiêu thụ cực kỳ ít điện (một viên pin AAA có thể chạy chuột Bluetooth hàng tháng). FPGA với mạng lưới routing phức tạp tiêu tốn nhiều điện năng hơn hẳn.

#### Khi nào chọn FPGA thay vì Vi điều khiển?
Khi bài toán đòi hỏi **Tốc độ** và **Tính linh hoạt**:
1. **Băng thông (Bandwidth):** FPGA có thể di chuyển luồng dữ liệu hàng trăm Gigabits/giây từ các giao diện USB-C, Ethernet, PCIe, camera mà không vi điều khiển nào có thể chạm tới.
2. **Tốc độ tính toán song song:** CPU của vi điều khiển xử lý tuần tự từng phép tính. FPGA có thể chạy **hàng trăm phép nhân-cộng đồng thời trong cùng một chu kỳ xung nhịp** (rất phù hợp cho lọc tín hiệu số DSP, xử lý ảnh).
3. **Tính linh hoạt giao diện (Flexibility):** Nếu thiết kế đòi hỏi cấu hình độc lạ (như cần tới 16 giao diện ADC), không có vi điều khiển nào trên thị trường đáp ứng được, nhưng FPGA có thể dễ dàng cấu hình để thực hiện điều đó.

---

### B. FPGA vs. ASIC (Application-Specific Integrated Circuits)

ASIC là vi mạch tích hợp được thiết kế cố định cho một ứng dụng duy nhất.

1. **Chi phí NRE (Nonrecurring Engineering Cost):** ASIC đòi hỏi chi phí trả trước ban đầu cực kỳ lớn để đúc chip tại nhà máy bán dẫn (fab), thường từ vài triệu đến hàng chục triệu USD.
2. **Sản lượng & Kinh tế học:**
    * *Sản lượng nhỏ (dưới vài chục nghìn chip):* FPGA thắng thế vì không tốn chi phí NRE ban đầu.
    * *Sản lượng lớn (hàng triệu chip):* ASIC thắng tuyệt đối vì chi phí sản xuất mỗi chip tiếp theo cực kỳ rẻ (dưới 1 USD/chip, so với FPGA thường trên 10–50 USD/chip).
3. **Sửa lỗi ngoài thực địa (Field Programmability):** FPGA có thể nạp lại code để sửa lỗi bất cứ lúc nào. ASIC nếu bị lỗi sau khi đúc chip sẽ bị hỏng toàn bộ đợt sản xuất và mất trắng chi phí NRE; do đó ASIC đòi hỏi quy trình **Verification (Xác minh thiết kế)** cực kỳ tốn kém và nghiêm ngặt trước khi đi đúc chip.
4. **Điện năng & Tốc độ:** ASIC được tối ưu hóa ở mức bán dẫn cho đúng một tác vụ duy nhất nên tiêu thụ ít điện năng hơn và đạt tốc độ tối đa nhỉnh hơn FPGA.
5. **Mối quan hệ hỗ trợ:** Trong thực tế, các công ty thường dùng FPGA để làm **mẫu thử nghiệm (prototype)** cho thiết kế ASIC. Mã Verilog/VHDL viết và kiểm thử sạch lỗi trên FPGA sẽ được tái sử dụng trực tiếp để đúc ra chip ASIC.

#### Câu Chuyện Bitcoin: Minh Hoạ Hoàn Hảo Cho Chuỗi CPU → FPGA → ASIC

Đây là ví dụ có thật gói gọn toàn bộ phần so sánh ba loại chip:

```
CPU  →  FPGA  →  ASIC
```

1. **Giai đoạn CPU:** Khi Bitcoin mới xuất hiện, người ta đào bằng máy tính cá nhân. Tốn rất nhiều điện cho mỗi đồng đào được.
2. **Giai đoạn FPGA:** Người ta nhận ra có thể lập trình FPGA để đào, tiêu thụ ít điện hơn CPU đáng kể. Vì tiền điện là chi phí lớn nhất, đào bằng FPGA **lãi hơn**.
3. **Giai đoạn ASIC:** Cuối cùng người ta nhận ra ASIC đào nhanh hơn và tốn ít điện hơn FPGA rất nhiều. Khoản tiết kiệm điện đủ lớn để bù lại chi phí NRE hàng triệu USD.

**Kết quả:** ngày nay Bitcoin được đào gần như hoàn toàn bằng ASIC chuyên dụng.

Bài học rút ra: khi bài toán đã **ổn định** và **sản lượng đủ lớn**, ASIC luôn thắng. FPGA là lựa chọn đúng ở giai đoạn bài toán còn đang thay đổi hoặc sản lượng còn thấp.

---

### C. Bảng So Sánh Tổng Hợp (Table 1-1: Comparing Digital Logic Components)

| Tiêu chí | FPGA | Vi điều khiển (Microcontroller) | ASIC |
| :--- | :--- | :--- | :--- |
| **Chi phí (Sản lượng thấp)** | Trung bình (Moderate) | Rẻ (Cheap) | Rất đắt (Expensive) |
| **Chi phí (Sản lượng cao)** | Trung bình (Moderate) | Rẻ (Cheap) | Rẻ (Cheap) |
| **Tốc độ (Speed)** | Nhanh (Fast) | Trung bình (Moderate) | Cực nhanh (Fast+) |
| **Mức tiêu thụ điện (Power)**| Trung bình (Moderate) | Thấp (Low) | Thấp (Low) |
| **Tính linh hoạt (Flexibility)**| Cao (High) | Thấp (Low) | Không có (None) |
| **Độ dễ sử dụng (Ease of use)**| Trung bình (Medium) | Dễ (Easy) | Phức tạp (Difficult) |

---

## 9. Hai Ngôn Ngữ Mô Tả Phần Cứng: Verilog Và VHDL

Hai ngôn ngữ chính dùng để thiết kế phần cứng cho FPGA và ASIC là **Verilog** và **VHDL**. Chúng được gọi là **HDL (Hardware Description Languages)**.

Khác với ngôn ngữ lập trình phần mềm, khi bạn viết mã HDL, bạn đang trực tiếp **mô tả cấu trúc mạch điện, cổng logic và dây dẫn vật lý** bên trong chip.

### A. VHDL
* **Tên đầy đủ:** *VHSIC Hardware Description Language* (trong đó VHSIC là *Very High-Speed Integrated Circuit*).
* **Nguồn gốc:** Được Bộ Quốc phòng Mỹ (DoD) phát triển từ năm 1983 dựa trên ngôn ngữ Ada.
* **Đặc điểm:**
    * Ngôn ngữ **định kiểu mạnh (strongly typed)**: đòi hỏi khai báo cực kỳ chính xác và chặt chẽ về kiểu dữ liệu và độ rộng bit, nếu không trình biên dịch sẽ báo lỗi. Viết VHDL tốn nhiều công sức gõ bàn phím hơn.
    * **Không phân biệt** chữ hoa và chữ thường (case-insensitive).

### B. Verilog
* **Nguồn gốc:** Được phát triển bởi công ty Gateway Design Automation vào năm 1984, cú pháp vay mượn nhiều từ ngôn ngữ lập trình C.
* **Đặc điểm:**
    * Ngôn ngữ **định kiểu yếu (weakly typed)**: mã nguồn ngắn gọn hơn, linh hoạt hơn, dễ tiếp cận hơn đối với dân lập trình phần mềm.
    * **Có phân biệt** chữ hoa và chữ thường (case-sensitive).

Lưu ý thực tế: vì Verilog phân biệt hoa thường nên `RxDone` và `rxDone` là **hai tín hiệu hoàn toàn khác nhau**. Đây là nguồn gốc của những lỗi rất khó truy vết. VHDL không gặp vấn đề này.

### C. Xu Hướng Sử Dụng Theo Địa Lý Và Ngành Nghề
Cả hai ngôn ngữ đều có năng lực thiết kế phần cứng hoàn toàn tương đương nhau. Việc chọn học ngôn ngữ nào thường phụ thuộc vào khu vực và ngành công nghiệp:
* **Mỹ:** Ngành quốc phòng/hàng không vũ trụ chuộng VHDL, trong khi các công ty thương mại/Silicon Valley chuộng Verilog (và SystemVerilog).
* **Châu Âu (Đức, Pháp):** VHDL chiếm ưu thế vượt trội.
* **Châu Á (Trung Quốc, Hàn Quốc, Nhật Bản):** Verilog phổ biến hơn nhiều.

*(Lưu ý: Tất cả các dự án thực hành trong cuốn sách này đều được cung cấp song song bằng cả mã Verilog và VHDL).*

---

## 10. Phần Cứng Thực Tế Đang Dùng

Ghi lại thông số hai board để khỏi phải tra lại datasheet mỗi lần.

| | QMTech Core Board | ALINX AX7325B |
| :--- | :--- | :--- |
| Chip | XC7A35T (**Artix-7**) | XC7K325T (**Kintex-7**) |
| Part number | `xc7a35tftg256-1` | `xc7k325tffg900-2` |
| Logic cell | ~33.000 | ~326.000 |
| Xung nhịp onboard | **50 MHz**, chân N11 | 200 MHz vi sai (+156.25, +125 MHz) |
| LED | chân E6 | 4 LED, LED1 = chân A22 |
| Nút nhấn | chân K5 | 2 nút active-low, KEY1 = chân AG27 |
| Reset | chân B7 (active-low) | — |
| IOSTANDARD | `LVCMOS33` | tuỳ bank |
| Ngoại vi | DDR3 + daughterboard (LED 7 đoạn, VGA, Ethernet, UART, SD) | 4×SFP+ 10G, QSFP+ 40G, PCIe x8, DDR3 2GB |
| **Vivado bản miễn phí** | **Có hỗ trợ** | **Không** — cần bản Enterprise |
| Thời gian build một thiết kế nhỏ | 1–3 phút | 15–30 phút |

**Kết luận chọn board để học:** dùng QMTech XC7A35T trước.

Hai lý do:

1. **Vivado ML Standard (miễn phí) hỗ trợ Artix-7**, còn XC7K325T thì không — phải mua license Enterprise.
2. **Build nhanh hơn 10 lần.** Khi đang học, tốc độ vòng lặp sửa–nạp–thử quan trọng hơn mọi thứ khác. Chờ 30 phút mỗi lần sửa một dòng là cách nhanh nhất để bỏ cuộc.

Board AX7325B để dành cho giai đoạn sau, khi đụng tới SFP+ 10G và DDR3 — lúc đó chuyện license là việc của công ty.

---

## 11. Công Cụ Đang Dùng

| Công cụ | Dùng để | Ghi chú |
| :--- | :--- | :--- |
| **GHDL** | Phân tích cú pháp và mô phỏng VHDL trên Ubuntu | Máy hiện tại thiếu `numeric_std` bản v08 → **không dùng cờ `--std=08`**, chạy chuẩn mặc định (VHDL-93) |
| **GTKWave** | Xem dạng sóng từ file `.ghw` / `.vcd` | |
| **Vivado ML Standard** | Tổng hợp, place & route, nạp bitstream | Khi cài chỉ cần tick device family **Artix-7** cho nhẹ (~30 GB) |

Lưu ý riêng của GHDL ở chuẩn VHDL-93: **không nhận ký tự có dấu, kể cả trong comment**. Gõ comment tiếng Việt có dấu sẽ báo lỗi `invalid character, even in a comment`.

---

## 12. Tóm Tắt Chương (Summary)

Chương này đã mang đến cái nhìn toàn cảnh về FPGA:
1. **Bản chất FPGA:** Mảng cổng logic lập trình được mang lại tính linh hoạt tuyệt đối như một "tờ giấy trắng".
2. **Tư duy thiết kế:** Chuyển đổi từ tư duy nối tiếp (software/CPU) sang tư duy song song (hardware/FPGA). Cụ thể trong code: `for` là nhân bản mạch, instantiation là hàn linh kiện, và mọi thiết kế đều là bài toán đánh đổi diện tích ↔ thời gian.
3. **Cơ chế tái lập trình:** Nạp bitstream chỉ là ghi giá trị vào các ô nhớ SRAM cấu hình, không đấu lại transistor nào. Hệ quả: mất điện là mất sạch.
4. **Vị trí công nghệ:** FPGA lấp đầy khoảng trống giữa Vi điều khiển (rẻ, dễ dùng nhưng chậm) và ASIC (cực nhanh, tiết kiệm điện nhưng chi phí NRE đắt đỏ và không sửa được lỗi).
5. **Ngôn ngữ thiết kế:** Giới thiệu hai ngôn ngữ HDL chuẩn mực là Verilog và VHDL.
6. **Phần cứng và công cụ:** Học trên QMTech XC7A35T trước vì Vivado miễn phí hỗ trợ và build nhanh hơn 10 lần.
