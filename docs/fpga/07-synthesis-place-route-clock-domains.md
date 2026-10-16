# CHƯƠNG 7: TỔNG HỢP, ĐẶT VỊ TRÍ & ĐI TUYẾN VÀ CHUYỂN VÙNG XUNG NHỊP (SYNTHESIS, PLACE AND ROUTE, AND CROSSING CLOCK DOMAINS)

Trong Chương 2, chúng ta đã xem qua tổng quan về quy trình biên dịch FPGA để giúp bạn làm quen với việc chạy các công cụ cần thiết cho các dự án trong cuốn sách này. Bây giờ, chúng ta sẽ đi sâu hơn vào quy trình biên dịch để giúp bạn hiểu tường tận chính xác điều gì đang xảy ra khi bạn nhấn nút **Build FPGA**. Khi bạn đã nắm vững những gì công cụ FPGA đang thực hiện, bạn sẽ tránh được nhiều sai lầm phổ biến và viết được mã nguồn có độ tin cậy cực kỳ cao.

Như bạn đã biết từ Chương 2, sau khi viết xong mã Verilog hoặc VHDL, thiết kế FPGA sẽ trải qua ba giai đoạn: **Tổng hợp (Synthesis)**, **Đặt vị trí & Đi tuyến (Place and Route)**, và **Nạp chip (Programming)**. Nếu bất kỳ giai đoạn nào trong số này thất bại, toàn bộ quá trình biên dịch FPGA sẽ không thành công. Trong chương này, chúng ta sẽ tập trung vào hai giai đoạn đầu tiên. Chúng ta sẽ thảo luận chi tiết về quá trình tổng hợp, phân biệt rõ ràng giữa mã tổng hợp được (synthesizable) và mã không thể tổng hợp được (non-synthesizable). Sau đó, chúng ta sẽ xem xét lại quá trình đặt vị trí và đi tuyến, đồng thời khám phá một vấn đề rất phổ biến xuất hiện trong giai đoạn này: **lỗi thời gian (timing errors)**. Bạn sẽ học nguyên nhân gây ra các lỗi này và cách khắc phục chúng. Cuối cùng, chúng ta sẽ tìm hiểu chi tiết tình huống mà bạn dễ gặp phải lỗi thời gian nhất: khi các tín hiệu truyền qua lại giữa các phần của thiết kế FPGA chạy ở các tần số xung nhịp khác nhau. Bạn sẽ học cách **chuyển vùng xung nhịp (crossing clock domains)** một cách an toàn trong FPGA.

---

## **1. Quá Trình Tổng Hợp (Synthesis)**

**Tổng hợp (Synthesis)** là quá trình phân tích mã Verilog hoặc VHDL của bạn và chuyển đổi nó thành các linh kiện đơn giản (LUT, Flip-flop, Block RAM,...) thực sự tồn tại trên dòng chip FPGA cụ thể của bạn. Theo nghĩa này, một công cụ tổng hợp FPGA rất giống với một trình biên dịch (compiler) trong ngôn ngữ C, vốn nhận mã C và dịch thành các lệnh hợp ngữ đơn giản mà CPU có thể hiểu được.

Để quá trình này diễn ra chính xác, công cụ tổng hợp cần biết chính xác loại FPGA bạn đang sử dụng để nó biết những tài nguyên phần cứng nào đang có sẵn. Sau đó, vì các tài nguyên này là có hạn, nhiệm vụ của công cụ tổng hợp là tính toán cách sử dụng chúng một cách hiệu quả nhất có thể. Điều này được gọi là **tối ưu hóa logic (logic optimization)** hoặc **tối thiểu hóa logic (logic minimization)**, và nó là một phần quan trọng của quá trình tổng hợp. Như tôi đã đề cập ở Chương 3, bạn hoàn toàn không cần phải thực hiện tối ưu hóa logic bằng tay; bạn chỉ cần để việc đó cho công cụ tổng hợp xử lý. Tuy nhiên, điều đó không có nghĩa là việc viết mã nguồn thông minh tiết kiệm tài nguyên là không quan trọng. Việc hiểu rõ mã nguồn của bạn sẽ tổng hợp thành những linh kiện gì là kỹ năng cốt lõi để trở thành một kỹ sư FPGA giỏi.

Một kết quả đầu ra quan trọng của quá trình tổng hợp là **báo cáo sử dụng tài nguyên (utilization report)**, báo cho bạn biết bạn đã sử dụng bao nhiêu LUT, Flip-flop, Block RAM và các tài nguyên khác trong thiết kế của mình. Chúng ta đã xem qua các trích đoạn từ báo cáo sử dụng tài nguyên ở các chương trước; tôi khuyên bạn nên luôn đọc kỹ báo cáo này để đảm bảo rằng thực tế tiêu tốn phần cứng khớp với kỳ vọng của bạn.

---

### **Ghi Chú, Cảnh Báo và Lỗi (Notes, Warnings, and Errors)**

Quá trình tổng hợp thường tạo ra một số lượng rất lớn các ghi chú (notes) và cảnh báo (warnings), ngay cả khi nó chạy thành công. Khi không thành công, quá trình này sẽ tạo ra các lỗi (errors).

Lỗi đầu tiên bạn gặp hầu như luôn là **lỗi cú pháp (syntax error)** — thiếu dấu chấm phẩy, sai từ khoá. Công cụ chỉ ra file và dòng; với GHDL, quên dấu `;` sau khai báo port cho ra `design.vhd:4:45: missing ";" at end of port clause` — file, dòng 4, cột 45. Lời khuyên của sách đáng ghi nhớ cho mọi việc kỹ thuật: khi có một tràng lỗi, **sửa lỗi đầu tiên trước**, vì phần còn lại thường chỉ là hệ quả dây chuyền của nó; sửa xong chạy lại, lặp cho tới khi sạch.

*   **Ghi chú (Notes):** Chủ yếu mang tính thông tin, cho bạn biết công cụ đang hiểu mã nguồn của bạn như thế nào.
*   **Cảnh báo (Warnings):** Rất đáng để xem xét kỹ nhằm đảm bảo bạn không phạm sai lầm. Tuy nhiên, trong các thiết kế lớn có thể có hàng trăm cảnh báo, vì vậy chúng có thể gây ngợp. Một số công cụ cho phép bạn ẩn các cảnh báo một khi bạn đã kiểm tra và xác nhận chúng an toàn. Đây là một tính năng hữu ích giúp bạn tập trung vào các vấn đề thực sự.

#### **Cảnh báo Latch ngoài ý muốn (Inferred Latch Warning)**
Một cảnh báo đặc biệt quan trọng cần lưu ý là cảnh báo **sinh ra Latch ngoài ý muốn (inferred latch)**. Như bạn đã học ở Chương 4, Latch là linh kiện không tốt trong thiết kế FPGA. Chúng thường được tạo ra một cách vô ý, và các công cụ rất khó phân tích chúng trong bối cảnh thời gian (timing) của FPGA. Nếu bạn vô tình tạo ra một Latch, bạn sẽ nhận được thông báo cảnh báo trong quá trình tổng hợp dạng như sau:

```text
[Synth 8-327] inferring latch for variable 'o_test' [test_program.vhd:19]
```

Đừng bỏ qua cảnh báo này! Trừ khi bạn hoàn toàn chắc chắn rằng bạn thực sự muốn có Latch đó trong thiết kế của mình, bạn nên tìm cách loại bỏ nó. Tôi đã làm thiết kế FPGA nhiều năm và chưa bao giờ cần phải dùng đến Latch, vì vậy bạn phải có một lý do cực kỳ đặc biệt nếu định giữ lại nó.

#### **Lỗi vượt quá tài nguyên (Utilization Errors)**
Sau khi mã nguồn của bạn vượt qua bước kiểm tra cú pháp, lỗi phổ biến tiếp theo mà bạn sẽ gặp phải trong quá trình tổng hợp là **lỗi tài nguyên (utilization error)**, khi thiết kế của bạn đòi hỏi nhiều linh kiện hơn số lượng FPGA thực tế có sẵn. Ví dụ, nếu FPGA của bạn có 1,000 Flip-flop nhưng mã nguồn của bạn đòi hỏi 2,000 Flip-flop, bạn sẽ nhận được lỗi tài nguyên. Thiết kế đơn giản là không thể nhét vừa vào FPGA, do đó bạn cần suy nghĩ cách thu gọn mã nguồn để khởi tạo ít Flip-flop hơn.

> **Quy tắc vàng:** Hãy hướng tới việc sử dụng **không quá 80%** số lượng LUT hoặc Flip-flop có sẵn trên chip. Điều này sẽ giúp quá trình Đặt vị trí & Đi tuyến (Place and Route) dễ dàng đáp ứng các yêu cầu về thời gian (meet timing) hơn, đồng thời cho phép bạn linh hoạt chỉnh sửa hoặc thêm tính năng mới trong tương lai.

Nếu bạn gặp lỗi vượt tài nguyên, bạn có một vài hướng xử lý:

1.  **Chuyển sang dòng FPGA lớn hơn:** Nếu bo mạch của bạn cho phép hoặc bạn đang ở giai đoạn chọn chip, hãy chọn một phiên bản FPGA cùng họ có dung lượng lớn hơn.
2.  **Tối ưu hóa mã nguồn (Phân tích mã):** Xem xét liệu bạn có vô tình viết mã tiêu tốn quá nhiều tài nguyên hay không. Đây không phải là việc tối ưu hóa mức thấp để tiết kiệm 1 LUT hay 1 Flip-flop (công cụ đã tự làm việc đó), mà là tránh các phép toán tốn kém. Ví dụ, thực hiện phép chia (`/`) trực tiếp giữa hai số sẽ tạo ra một mạch toán cực kỳ cồng kềnh. Bạn có thể chuyển phép chia đó thành một bảng tra cứu trong bộ nhớ Block RAM. Việc này sử dụng Block RAM nhưng sẽ giải phóng một lượng lớn LUT và Flip-flop, giúp thiết kế vượt qua bước tổng hợp.
3.  **Dùng chung phần cứng (Hardware Sharing / Time-Sharing):** Trong FPGA, nếu bạn có 100 kênh dữ liệu cùng cần thực hiện phép tính cosin một lần mỗi giây, thay vì tạo 100 khối tính toán cosin riêng biệt cho 100 kênh, bạn có thể tạo **1 khối tính toán cosin duy nhất** và cho 100 kênh lần lượt chia sẻ sử dụng khối đó theo thời gian (mỗi kênh dùng 10 ms). Như vậy phần cứng chỉ cần khởi tạo 1 lần duy nhất thay vì 100 lần. Cách này chỉ dùng được khi còn dư thời gian để chia, và phải viết thêm một khối **trọng tài (arbiter)** điều phối ai được dùng lúc nào — khối trọng tài cũng hữu ích cho tài nguyên ngoài chip, ví dụ nhiều module cùng muốn ghi vào một thẻ microSD.
4.  **Bỏ bớt chức năng:** Nếu đã viết tối ưu mà vẫn không vừa, chỉ còn cách cắt tính năng — chuyển bớt việc sang vi điều khiển trên cùng bo mạch, hoặc nói thẳng với nhóm là không làm được. FPGA có giới hạn.

---

### **Mã Không Thể Tổng Hợp (Non-synthesizable Code)**

Một khái niệm quan trọng cần hiểu là không phải mọi dòng mã Verilog hay VHDL hợp lệ đều có thể tổng hợp thành mạch phần cứng thực tế trên FPGA. Một số cú pháp ngôn ngữ chỉ tồn tại để phục vụ việc **viết mô phỏng (simulation)** trong Testbench.

Nếu bạn cố tình đưa mã không thể tổng hợp vào thiết kế chính của FPGA, công cụ tổng hợp sẽ báo lỗi hoặc đơn giản là bỏ qua dòng mã đó, dẫn đến việc phần cứng hoạt động hoàn toàn khác so với khi bạn chạy mô phỏng.

Điều này cũng có mặt lợi: bạn được phép để mã mô phỏng ngay trong file thiết kế, ví dụ một `assert` kiểm tra không bao giờ ghi vào FIFO đầy, và công cụ tổng hợp sẽ bỏ qua nó. Để nói rõ ý đó với công cụ, bọc đoạn mã giữa hai chỉ thị `-- synthesis translate_off` và `-- synthesis translate_on` (viết trong comment, cả Verilog lẫn VHDL đều dùng được). Nhờ vậy không phải giữ hai bản mã riêng cho mô phỏng và tổng hợp.

Dưới đây là các trường hợp mã không thể tổng hợp phổ biến nhất:

#### **1. Theo dõi thời gian thực (Keeping Track of Time)**
Như bạn đã biết, FPGA không có khái niệm tự nhiên về thời gian. Chúng ta phải đo thời gian bằng cách **đếm chu kỳ xung nhịp (clock cycles)**. Tuy nhiên, cả Verilog và VHDL đều có các cú pháp tham chiếu trực tiếp đến thời gian:

*   Trong Verilog: `$time` (lấy mốc thời gian hiện tại), `#100` (tạo độ trễ 100 đơn vị thời gian).
*   Trong VHDL: `now` (lấy thời gian hiện tại), `wait for 100 ns;` (tạm dừng 100 ns).

Các tính năng này hoạt động hoàn hảo trong mô phỏng trên máy tính, nhưng **100% KHÔNG THỂ TỔNG HỢP** trên FPGA thật. Trình tổng hợp sẽ báo lỗi hoặc bỏ qua chúng hoàn toàn.

#### **2. In văn bản ra màn hình (Printing Text)**
Các lệnh in văn bản như:

*   Verilog: `$display("Hello World");`
*   VHDL: `report "Hello World";` hoặc `assert false report "Hello World" severity note;`

Các lệnh này chỉ hoạt động trong môi trường mô phỏng. Chúng không thể tổng hợp thành phần cứng vì trên con chip FPGA vật lý hoàn toàn không có khái niệm về màn hình console hay cửa sổ terminal.

#### **3. Thao tác với Tệp Tin (Working with Files)**
Trong hầu hết các trường hợp, bạn không thể tổng hợp mã Verilog hay VHDL có chứa các thao tác đọc hoặc ghi tệp tin như `$fopen()`, `$fwrite()` trong Verilog hay `file_open()`, `write()` trong VHDL. FPGA không có hệ điều hành hay hệ thống tệp (file system).

*   *Ngoại lệ duy nhất:* Một số trình tổng hợp cho phép đọc một tệp văn bản (`.txt` hoặc `.hex`) trong quá trình tổng hợp trên máy tính để **nạp dữ liệu khởi tạo ban đầu (preload)** cho bộ nhớ Block RAM.

#### **4. Vòng lặp `for` (Looping)**
Vòng lặp `for` **có thể tổng hợp được**, nhưng chúng hoạt động theo cách **hoàn toàn khác** so với những gì bạn nghĩ trong các ngôn ngữ lập trình phần mềm như C hay Python!

Trong C/Python, vòng lặp `for` thực thi các bước **tuần tự nối tiếp nhau theo thời gian** (bước 1 xong mới đến bước 2). Trong phần cứng FPGA tổng hợp, vòng lặp `for` được dùng làm cú pháp viết tắt để **nhân bản phần cứng song song** — tất cả các vòng lặp sẽ **thực thi đồng thời trong cùng một chu kỳ xung nhịp (single clock cycle)**!

Hãy xem ví dụ về thanh ghi dịch 4-bit:

##### **Viết thủ công (không dùng for):**

*Verilog:*
```verilog
always @(posedge i_Clk)
begin
  r_Shift[1] <= r_Shift[0];
  r_Shift[2] <= r_Shift[1];
  r_Shift[3] <= r_Shift[2];
end
```

*VHDL:*
```vhdl
process (i_Clk)
begin
  if rising_edge(i_Clk) then
    r_Shift(1) <= r_Shift(0);
    r_Shift(2) <= r_Shift(1);
    r_Shift(3) <= r_Shift(2);
  end if;
end process;
```

##### **Viết rút gọn bằng vòng lặp `for`:**

*Verilog:*
```verilog
integer i;
always @(posedge i_Clk)
begin
  for (i = 0; i < 3; i = i + 1)
  begin
    r_Shift[i+1] <= r_Shift[i];
  end
end
```

*VHDL:*
```vhdl
process (i_Clk)
begin
  if rising_edge(i_Clk) then
    for i in 0 to 2 loop
      r_Shift(i+1) <= r_Shift(i);
    end loop;
  end if;
end process;
```

**Sự thật quan trọng:** Cả hai cách viết trên đều tạo ra **chính xác cùng một cấu trúc phần cứng phần tử** và chạy trong **đúng 1 chu kỳ xung nhịp**. Vòng lặp `for` chỉ là cách viết ngắn gọn cho 3 lệnh gán song song.

> **Cảnh báo người mới bắt đầu:** Lỗi phổ biến nhất của người mới học là viết vòng lặp `for` trong khối `always`/`process` có xung nhịp và kỳ vọng mỗi vòng lặp sẽ tốn 1 chu kỳ Clock. Điều đó hoàn toàn sai! Trừ khi bạn đã cực kỳ thành thạo cách tổng hợp vòng lặp `for`, lời khuyên chân thành là **hãy tránh dùng vòng lặp `for` trong mã tổng hợp được**. Nếu muốn làm một công việc lặp lại theo thời gian, hãy dùng bộ đếm (Counter) kết hợp với câu lệnh `if`.

Sách cho luôn ví dụ cách viết đó. Giả sử trong C bạn muốn cộng 1 vào cả 10 phần tử của một mảng:

```c
for (i = 0; i < 10; i++)
  data[i] = data[i] + 1;
```

Muốn việc này diễn ra **lần lượt qua 10 chu kỳ** trên FPGA, thay vòng `for` bằng một tín hiệu chỉ số và một câu `if`:

```vhdl
process (i_Clk)
begin
  if rising_edge(i_Clk) then
    if r_Index < 10 then
      r_Data(r_Index) <= r_Data(r_Index) + 1;
      r_Index         <= r_Index + 1;
    end if;
  end if;
end process;
```

Câu `if` đóng vai trò điều kiện dừng của vòng lặp, `r_Index` là biến đếm, mỗi cạnh xung nhịp xử lý đúng một phần tử rồi tăng chỉ số. Đã chạy thử bằng GHDL với mảng 10 phần tử khởi đầu bằng 0: đúng 10 cạnh thì `r_Index` chạm 10 và cả 10 phần tử bằng 1. Quy tắc chung: muốn "lặp theo thời gian" thì luôn là **bộ đếm + `if`**, không bao giờ là `for`.

---

## **2. Đặt Vị Trí & Đi Tuyến (Place and Route)**

**Place and Route** là quá trình lấy thiết kế đã được tổng hợp (danh sách các LUT, Flip-flop, BRAM) và **ánh xạ chúng vào các vị trí vật lý thực tế** trên con chip FPGA cụ thể của bạn, sau đó nối các đường dây điện tử (routing) để liên kết tất cả lại với nhau.

Quá trình này gồm 2 bước riêng biệt:

1.  **Placement (Đặt vị trí):** Quyết định chính xác LUT hay Flip-flop nào trên chip sẽ đảm nhận vai trò nào trong thiết kế.
2.  **Routing (Đi tuyến):** Nối các đường dây dẫn kim loại nhỏ li ti bên trong chip để kết nối các linh kiện đã đặt. Bước đi tuyến này tốn rất nhiều thời gian tính toán của máy tính — đối với các thiết kế FPGA lớn, quá trình đi tuyến có thể mất **nhiều giờ đồng hồ**. Đây là lý do tại sao việc kiểm tra kỹ bằng mô phỏng trước khi biên dịch lại quan trọng đến vậy.

---

### **Các Ràng Buộc (Constraints)**

Để chạy quá trình Place and Route, bạn bắt buộc phải cung cấp ít nhất 2 loại tệp ràng buộc:

1.  **Ràng buộc chân (Pin Constraints):** Ánh xạ tên các tín hiệu trong mã Verilog/VHDL với các chân cắm vật lý (pin sites) trên vỏ chip FPGA (nối với đèn LED, nút nhấn, cổng giao tiếp trên bảng mạch PCB). Muốn biết chân nào nối đi đâu thì phải đọc sơ đồ mạch của bo — đọc được schematic là kỹ năng cần có của người làm FPGA.
2.  **Ràng buộc xung nhịp (Clock Constraints):** Khai báo tần số hoặc chu kỳ xung nhịp mà thiết kế của bạn sẽ vận hành (ví dụ: 25 MHz, 100 MHz); có nhiều vùng xung nhịp thì khai hết. Công cụ đi tuyến sẽ dựa vào tần số này để tính toán xem điện áp có đủ thời gian di chuyển qua các đường dây hay không.

Ngoài hai loại bắt buộc này còn có ràng buộc trễ vào/ra, ép đường đi tuyến cụ thể, và nhiều thứ khác. Với bo trong sách, hai loại trên nằm ở hai file `.pcf` và `.sdc`; với Vivado cả hai gộp vào một file `.xdc` như chương 4 mục 2 đã viết (`set_property PACKAGE_PIN` cho chân, `create_clock` cho xung nhịp).

---

### **Lỗi Thời Gian (Timing Errors)**

**Lỗi thời gian (Timing error)** xảy ra khi thiết kế và ràng buộc xung nhịp của bạn đòi hỏi các linh kiện và đường dây dẫn trên FPGA phải hoạt động ở tốc độ **nhanh hơn mức mà công cụ Place and Route có thể đảm bảo an toàn vật lý**.

Khi xảy ra lỗi thời gian, FPGA của bạn *có thể* vẫn hoạt động được ở nhiệt độ phòng, nhưng nó có thể bị lỗi bất ngờ khi nhiệt độ chip tăng lên hoặc điện áp nguồn bị sụt giảm. Công cụ biên dịch sẽ xuất hiện cảnh báo lỗi thời gian trong **Timing Report** — nhưng **vẫn cho bạn nạp chip**. Nó không chặn, vì không biết bạn sẽ chạy thiết kế trên bàn làm việc hay trên vệ tinh.

Tác giả kể một chuyện đáng nhớ: một sản phẩm camera có thiết kế FPGA đầy lỗi timing, người làm trước bỏ qua vì "chạy thử vài phút trên bàn thấy ổn". Ra sản phẩm, điểm ảnh thỉnh thoảng nháy, cảnh thỉnh thoảng giật, chỉ một số máy bị, mức độ mỗi máy mỗi khác. Mã không sai về chức năng; công cụ đã cảnh báo từ đầu rằng nó có thể không chạy đúng ở mọi điều kiện. Bài học: khi FPGA hành xử kỳ lạ, việc đầu tiên là mở lại báo cáo timing.

#### **Ba Giới Hạn Vật Lý Gây Ra Lỗi Thời Gian:**

Bên trong con chip thật, tín hiệu điện áp không di chuyển tức thời. Sách đưa con số ước lượng để hình dung: tín hiệu chạy trên dây khoảng **1 foot mỗi nanosecond (30 cm/ns)** — nghe như không đáng kể, nhưng cộng tổng chiều dài hàng nghìn sợi dây li ti trong chip lại thì thành con số rất lớn. (Con số đó là tốc độ ánh sáng; dây trong chip mảnh, có điện trở và điện dung nên thực tế chậm hơn nhiều — chỉ cần nhớ ý "có trễ, và trễ cộng dồn".) Ngoài ra, việc đi qua mỗi cổng logic (LUT) cũng làm trễ tín hiệu một khoảng thời gian nhỏ.

1.  **Thời gian thiết lập (Setup time - `t_su`):** Khoảng thời gian tín hiệu đầu vào `D` của Flip-flop bắt buộc phải **giữ ổn định trước** khi cạnh lên của xung nhịp xuất hiện.
2.  **Thời gian giữ (Hold time - `t_h`):** Khoảng thời gian tín hiệu đầu vào `D` phải **duy trì ổn định sau** khi cạnh lên của xung nhịp đi qua.
3.  **Trễ lan truyền (Propagation delay - `t_p`):** Thời gian điện áp di chuyển từ đầu ra `Q` của Flip-flop thứ nhất, đi qua đường dây dẫn và các cổng logic (LUT), để đến được đầu vào `D` của Flip-flop thứ hai.

```
                            ┌────────────────────
Clk          ───────────────┘
                            ^ cạnh lên
                    t_su    │   t_h
                 |<-------->|<------>|
D            ════╪══════════════════╪═════   D phải giữ nguyên trong cả cửa sổ này;
                 đổi giá trị ở đây là vi phạm setup hoặc hold
```
*Hình 7-1: Cửa sổ setup (`t_su`) trước cạnh lên và hold (`t_h`) sau cạnh lên*

#### **Trạng Thái Bất Ổn Định (Metastability)**
Nếu đầu vào dữ liệu đổi giá trị ngay trong cửa sổ `t_su` hoặc `t_h`, Flip-flop rơi vào **trạng thái bất ổn định (metastable)**: đầu ra có thể là 1, có thể là 0, hoặc lơ lửng ở giữa. Chương 4 đã nhắc tới hiện tượng này ở nút bấm; đây là chỗ sách giải thích gốc rễ của nó.

Hãy tưởng tượng một quả bóng được đặt chính xác trên đỉnh một ngọn đồi nhọn (Hình 7-3). Quả bóng có thể lăn sang bên trái (mức 0) hoặc bên phải (mức 1), không đoán được bên nào — một cơn gió nhẹ cũng quyết định; và cũng không đoán được **bao lâu** nó mới lăn xuống (**metastable resolution time**). Trong thời gian đó, đầu ra `Q` của Flip-flop lơ lửng ở mức điện áp giữa 0 và 1, khiến các mạch phía sau hoạt động hỗn loạn. Đến cạnh xung nhịp kế tiếp Flip-flop chốt lại và đầu ra chắc chắn đúng, nhưng trọn một chu kỳ trước đó thì không ai biết nó là gì.

```
                     o      ← quả bóng trên đỉnh: metastable
                    /‾\
                  /     \
                /         \
              /             \
            /                 \
     trạng thái 0          trạng thái 1
```
*Hình 7-3: Metastable là quả bóng chênh vênh trên đỉnh đồi — lăn bên nào, bao lâu mới lăn, đều không đoán được*

Metastable mang tính **xác suất**: có lỗi timing không có nghĩa chắc chắn hỏng, chỉ là *có thể* hỏng, và trong thiết kế FPGA thì "có thể" đã là không chấp nhận được. Điều cần nhớ: `t_su` và `t_h` là tính chất vật lý của con chip, bạn **không sửa được**. Thứ duy nhất trong tay bạn là trễ lan truyền `t_p`.

#### **Công Thức Tính Chu Kỳ Xung Nhịp Tối Thiểu:**
Để thiết kế giữa 2 Flip-flop không bị vi phạm thời gian, chu kỳ xung nhịp tối thiểu phải thỏa mãn:

`t_clk(min) = t_su + t_p`

trong đó `t_p` là trễ lan truyền **xấu nhất** giữa hai Flip-flop bất kỳ trong thiết kế — công cụ Place and Route phân tích mọi đường và báo những đường tệ nhất. Ví dụ của sách: mọi Flip-flop có `t_su = 2 ns`, đường tệ nhất có `t_p = 10 ns`, thì chu kỳ tối thiểu là `2 + 10 = 12 ns`, tức tần số tối đa `83,3 MHz`. Chạy chậm hơn thì thoải mái; ép lên `100 MHz` (chu kỳ `10 ns`) thì thiếu 2 ns và thiết kế **bị lỗi timing**.

---

### **Cách Khắc Phục Lỗi Thời Gian: Kỹ Thuật Chia Giai Đoạn (Pipelining)**

Vì `t_su` là thông số phần cứng cố định, chỉ còn hai cách: **giảm tần số xung nhịp**, hoặc **giảm trễ lan truyền `t_p`**. Cách đầu nghe hiển nhiên nhưng hiếm khi làm được — tần số thường do ngoại vi quyết định, không đổi tuỳ tiện. Nên trong thực tế gần như luôn là cách hai: chia logic thành nhiều tầng, gọi là **Pipelining**. Làm ít việc hơn giữa hai Flip-flop thì `t_p` ngắn hơn.

```
Chưa pipeline — quá nhiều logic giữa hai Flip-flop, t_p dài, trượt timing:

  ┌────┐     ┌──────────────────────────┐     ┌────┐
  │ FF │────>│   chia  +  cộng  +  nhân │────>│ FF │
  └────┘     └──────────────────────────┘     └────┘
             |<──────── 1 chu kỳ ────────>|

Đã pipeline — chèn Flip-flop giữa các phép toán, mỗi đoạn ngắn, đạt timing:

  ┌────┐   ┌──────┐   ┌────┐   ┌──────┐   ┌────┐   ┌──────┐   ┌────┐
  │ FF │──>│ chia │──>│ FF │──>│ cộng │──>│ FF │──>│ nhân │──>│ FF │
  └────┘   └──────┘   └────┘   └──────┘   └────┘   └──────┘   └────┘
           |<─ 1 ck ─>|        |<─ 1 ck ─>|        |<─ 1 ck ─>|
```
*Hình 7-5: Giảm trễ lan truyền bằng pipelining*

#### **Ví dụ Mã Nguồn So Sánh:**

##### **Mã chưa Pipelining:**

Sách tự nhận "không hiểu ai lại viết thế này", nhưng nó đủ để minh hoạ: chia, cộng, nhân trên cùng một dòng trong một process có xung nhịp, nghĩa là cả ba phải xong trong **một chu kỳ**.

*Verilog:*
```verilog
module timing_error
  (input            i_Clk,
   input [7:0]      i_Data,
   output reg [15:0] o_Data);
  reg [7:0] r0_Data = 0;
  always @(posedge i_Clk)
  begin
    r0_Data <= i_Data;
    o_Data  <= ((r0_Data / 3) + 1) * 5;
  end
endmodule
```

*VHDL:*
```vhdl
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity timing_error is
  port (
    i_Clk  : in  std_logic;
    i_Data : in  unsigned(7 downto 0);
    o_Data : out unsigned(15 downto 0));
end entity timing_error;

architecture RTL of timing_error is
  signal r0_Data : unsigned(7 downto 0) := (others => '0'); -- sách không khởi tạo
begin
  process (i_Clk) is
  begin
    if rising_edge(i_Clk) then
      r0_Data <= i_Data;
      o_Data  <= ((r0_Data / 3) + 1) * 5;
    end if;
  end process;
end RTL;
```

Chạy Place and Route với ràng buộc 100 MHz, sách nhận được báo cáo timing thế này (đã lược bớt):

```text
4.1::Critical Path Report for i_Clk
***********************************
Clock: i_Clk
Frequency: 89.17 MHz | Target: 100.00 MHz
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Path Begin : r0_Data_fast_5_LC_1_9_5/lcout
Path End   : o_DataZ0Z_7_LC_5_12_5/in3
Setup Constraint : 10000p
Path slack : -1215p
```

Đọc báo cáo: công cụ chỉ bảo đảm được **89,17 MHz** trong khi mục tiêu là 100 MHz. Nó chỉ rõ đường hỏng nặng nhất — tên tín hiệu bị dính thêm nhiều ký tự định vị linh kiện trên chip, nhưng vẫn nhận ra: bắt đầu ở `r0_Data`, kết thúc ở `o_Data`. **Slack** là khoảng dư của đường đó so với yêu cầu; slack **âm 1.215 ps** nghĩa là thiếu 1,215 ns — đúng bằng chênh lệch chu kỳ giữa 89,17 MHz và 100 MHz. Vivado trình bày khác nhưng cùng ý: *Report Timing Summary* cho **WNS (Worst Negative Slack)**, âm là trượt; bấm vào đường tệ nhất sẽ thấy Source/Destination tương ứng với Path Begin/End ở đây.

##### **Mã đã Pipelining:**

Biết đường hỏng là `r0_Data → o_Data`, ta cắt nó thành ba tầng bằng hai thanh ghi trung gian:

*Verilog:*
```verilog
module timing_error
  (input            i_Clk,
   input [7:0]      i_Data,
   output reg [15:0] o_Data);
  reg [7:0] r0_Data, r1_Data, r2_Data = 0;
  always @(posedge i_Clk)
  begin
    r0_Data <= i_Data;
    r1_Data <= r0_Data / 3;   // tầng 1: chia
    r2_Data <= r1_Data + 1;   // tầng 2: cộng
    o_Data  <= r2_Data * 5;   // tầng 3: nhân
  end
endmodule
```

*VHDL:*
```vhdl
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity timing_error is
  port (
    i_Clk  : in  std_logic;
    i_Data : in  unsigned(7 downto 0);
    o_Data : out unsigned(15 downto 0));
end entity timing_error;

architecture RTL of timing_error is
  signal r0_Data, r1_Data, r2_Data : unsigned(7 downto 0) := (others => '0');
begin
  process (i_Clk) is
  begin
    if rising_edge(i_Clk) then
      r0_Data <= i_Data;
      r1_Data <= r0_Data / 3;   -- tầng 1: chia
      r2_Data <= r1_Data + 1;   -- tầng 2: cộng
      o_Data  <= r2_Data * 5;   -- tầng 3: nhân
    end if;
  end process;
end RTL;
```

Chạy lại Place and Route, báo cáo của sách giờ là `Frequency: 110.87 MHz | Target: 100.00 MHz` — **đạt timing**, còn dư.

Hai ghi chú từ việc chạy thử bản VHDL bằng GHDL. Thứ nhất, cả hai bản cho cùng kết quả: với `i_Data = 200`, `((200 / 3) + 1) * 5 = 335`; bản thường có kết quả sau 2 cạnh xung nhịp, bản pipeline sau 4 — đúng "chậm thêm hai chu kỳ" mà sách nói. Thứ hai, dòng `:= (others => '0')` là của blog thêm vào: sách để thanh ghi không khởi tạo, và GHDL **dừng mô phỏng ngay cạnh đầu tiên** với `bound check failure` trong `numeric_std` vì chia `'U'` cho 3. Cùng bài học với LFSR ở chương 6 — thanh ghi trong VHDL phải có giá trị đầu nếu bạn muốn mô phỏng được. Về phép nhân: `r2_Data * 5` với `r2_Data` 8 bit cho kết quả **16 bit** (numeric_std đổi hằng số thành vector cùng độ rộng rồi nhân, kết quả gấp đôi), nên `o_Data` phải khai 16 bit như sách.

**Đánh giá:**

*   **Ưu điểm:** Độ trễ lan truyền `t_p` giữa mỗi tầng Flip-flop giảm xuống đáng kể, thiết kế đạt 100 MHz.
*   **Đánh đổi:** Tốn thêm Flip-flop trung gian (`r1_Data`, `r2_Data`) và kết quả đầu ra đầu tiên sẽ bị chậm 2 chu kỳ Clock. Tuy nhiên, hệ thống vẫn có thể nạp dữ liệu mới và cho ra kết quả mới ở **mỗi chu kỳ Clock** (throughput không đổi).

---

### **Lỗi Thời Gian Không Dự Đoán Được & Kỹ Thuật Double-Flopping**

Có hai tình huống mà công cụ Place and Route không thể tự động phát hiện lỗi thời gian, nhưng lại cực kỳ dễ gây ra hiện tượng bất ổn định (Metastability):

1.  **Lấy mẫu tín hiệu bất đồng bộ từ bên ngoài (như nút nhấn).**
2.  **Chuyển dữ liệu giữa các vùng xung nhịp khác nhau (Crossing Clock Domains).**

#### **Mạch Lấy Mẫu Bất Đồng Bộ (Double-Flopping Circuit):**
Khi người dùng bấm nút, thời điểm bấm nút hoàn toàn ngẫu nhiên và có thể rơi đúng vào khoảng thời gian `t_su`/`t_h` của Flip-flop đầu tiên. Công cụ Place and Route không biết gì về tín hiệu này nên **không báo lỗi timing** — chỉ có bạn mới lường trước được.

```
                          ┌───────┐                        ┌───────┐
tín hiệu bất ────────────>│  FF1  │───────────────────────>│  FF2  │────> tín hiệu an toàn
đồng bộ (nút)             │   >   │   có thể metastable    │   >   │      dùng trong thiết kế
                          └───┬───┘                        └───┬───┘
                              │                                │
Clk ──────────────────────────┴────────────────────────────────┘
```
*Hình 7-6: Double-flopping — hai Flip-flop nối tiếp cùng xung nhịp*

*   **Giải pháp:** Cho tín hiệu đi qua **2 Flip-flop nối tiếp nhau** chạy cùng xung nhịp Clock. Flip-flop 1 chấp nhận rủi ro bị Metastable; xác suất Flip-flop 2 *cũng* metastable nhỏ tới mức coi như bằng không, nên đầu ra của nó dùng được an toàn. Thêm Flip-flop thứ ba còn giảm xác suất nữa, nhưng giới chuyên môn đã kết luận hai là đủ. Đây đúng là mạch chương 4 mục 2 đã đưa cho nút bấm trên QMTech.

Với Vivado có một chi tiết nhỏ nhưng nên làm: đánh dấu hai Flip-flop đó bằng thuộc tính `ASYNC_REG` để công cụ biết chúng là bộ đồng bộ, đặt chúng sát nhau và không tối ưu gộp mất:

```vhdl
signal r1_Data, r2_Data : std_logic := '0';
attribute ASYNC_REG : string;
attribute ASYNC_REG of r1_Data, r2_Data : signal is "TRUE";
```

Cú pháp thuộc tính này là VHDL chuẩn (GHDL biên dịch bình thường, chỉ không làm gì với nó); tác dụng thật trên Vivado nằm trong danh sách cần kiểm.

---

## **3. Chuyển Vùng Xung Nhịp (Crossing Clock Domains - CDC)**

Một thiết kế FPGA hiện đại thường có nhiều vùng xung nhịp (Clock Domains) hoạt động bất đồng bộ ở các tần số khác nhau (ví dụ: vùng Camera chạy `25,725 MHz`, vùng hiển thị HDMI chạy `148,5 MHz`). Việc truyền dữ liệu qua lại giữa hai vùng xung nhịp này được gọi là **Clock Domain Crossing (CDC)**. Không có cách nào bảo đảm hai xung nhịp đó thẳng hàng với nhau — chúng trôi ra rồi trôi vào; ngay cả cặp nhìn như có quan hệ đẹp (50 MHz và 100 MHz) cũng không chắc khởi động cùng lúc. Ngoại lệ là khi cả hai sinh ra từ một **PLL** trong chip, chương 9 sẽ nói.

---

### **1. Truyền Từ Vùng Xung Nhịp Chậm Sang Vùng Nhanh (Slower to Faster)**

*   **Đặc điểm:** Tín hiệu ở vùng chậm tồn tại kéo dài qua nhiều chu kỳ của vùng xung nhịp nhanh.
*   **Giải pháp:** Áp dụng kỹ thuật **Double-flopping** — cho tín hiệu từ vùng chậm đi qua 2 Flip-flop chạy theo xung nhịp của vùng nhanh.

```
                  vùng chậm         │             vùng nhanh
                ┌───────┐           │   ┌───────┐         ┌───────┐
dữ liệu ───────>│  FF   │───────────┼──>│  FF1  │────────>│  FF2  │────> dùng được
                │   >   │           │   │   >   │         │   >   │      trong vùng nhanh
                └───┬───┘           │   └───┬───┘         └───┬───┘
Clk chậm ───────────┘               │       │                 │
Clk nhanh ──────────────────────────┼───────┴─────────────────┘
```
*Hình 7-7: Từ vùng chậm sang vùng nhanh — double-flop bằng xung nhịp của vùng nhanh*

*Verilog:*
```verilog
reg r1_Data, r2_Data;

always @(posedge i_Fast_Clk)
begin
  r1_Data <= i_Slow_Data; // Flip-flop 1 (chấp nhận rủi ro metastable)
  r2_Data <= r1_Data;     // Flip-flop 2 (đã ổn định an toàn)
end
```

*VHDL:*
```vhdl
process (i_Fast_Clk) is
begin
  if rising_edge(i_Fast_Clk) then
    r1_Data <= i_Slow_Data; -- Flip-flop 1 (chấp nhận rủi ro metastable)
    r2_Data <= r1_Data;     -- Flip-flop 2 (đã ổn định an toàn)
  end if;
end process;
```

Một lời khuyên của sách về cách tổ chức mã khi có hai vùng xung nhịp: **giữ hai vùng tách bạch**. Tín hiệu của vùng chậm ở một process, của vùng nhanh ở process khác, chỉ các tín hiệu băng qua mới được chạm vào cả hai. Tác giả còn để mã của mỗi vùng trong file riêng, để chắc không trộn nhầm.

---

### **2. Truyền Từ Vùng Xung Nhịp Nhanh Sang Vùng Chậm (Faster to Slower)**

*   **Nguy cơ nghiêm trọng:** Một xung tín hiệu tồn tại chỉ 1 chu kỳ ở vùng nhanh (`100 MHz`) có thể xuất hiện và biến mất hoàn toàn giữa hai cạnh lên của vùng chậm (`25 MHz`), khiến vùng chậm **hoàn toàn bỏ sót xung**!

*   **Giải pháp (Pulse Stretching):** Kéo dài độ rộng của xung tín hiệu ở vùng nhanh sao cho nó tồn tại **ít nhất 2 chu kỳ xung nhịp của vùng chậm** (ví dụ: kéo dài ít nhất 8 chu kỳ của `100 MHz`). Vì sao hai chứ không phải một: cạnh chậm đầu tiên có thể rơi đúng cửa sổ setup/hold và metastable, nhưng tới cạnh thứ hai thì chắc chắn ổn định. Kéo dài hơn nữa cũng được.

```
Time (ns)      0       40      80      120     160     200     240     
               |       |       |       |       |       |       | 
               ─┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐┌┐
fast_clk        └┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└┘└
                           ┌─┐                                   
fast_pulse     ────────────┘ └───────────────────────────────────
               ────┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌─
slow_clk           └───┘   └───┘   └───┘   └───┘   └───┘   └───┘ 
                                                                 
slow_sampled   ──────────────────────────────────────────────────
                                           ┌───────────────┐     
stretched      ────────────────────────────┘               └─────
                                               ┌───────────────┐ 
slow_sampled2  ────────────────────────────────┘               └─
```
*Hình 7-8 và 7-9 gộp — mô phỏng GHDL, mỗi ký tự 5 ns: `fast_pulse` dài 1 chu kỳ 100 MHz rơi giữa hai cạnh lên 25 MHz nên `slow_sampled` không bao giờ lên; `stretched` dài 8 chu kỳ nhanh thì `slow_sampled2` bắt được ở cạnh chậm kế tiếp*

---

### **3. Chuyển Luồng Dữ Liệu Bằng FIFO Hai Xung Nhịp (Dual-Clock FIFO)**

Khi cần truyền một khối dữ liệu lớn (như khung hình video) giữa hai vùng xung nhịp khác nhau, giải pháp chuẩn mực nhất là sử dụng bộ đệm **Dual-Clock FIFO**:

*   **Cổng ghi (Write Port):** Chạy theo `i_Wr_Clk` của vùng gửi dữ liệu.
*   **Cổng đọc (Read Port):** Chạy theo `i_Rd_Clk` của vùng nhận dữ liệu.

```
                     ┌───────────────────────────────────────┐
   Write Data ─────> │                                       │ ─────> Read Data
   i_Wr_Clk   ─────> │            Dual-Clock FIFO            │ <───── i_Rd_Clk
   i_Wr_DV    ─────> │   (cổng ghi theo xung nhịp ghi,       │ <───── i_Rd_En
   o_AF_Flag  <───── │    cổng đọc theo xung nhịp đọc)       │ ─────> o_Rd_DV
   o_Full     <───── │                                       │ ─────> o_AE_Flag
                     └───────────────────────────────────────┘ ─────> o_Empty
```

FIFO ở chương 6 chỉ có một xung nhịp. Bản hai xung nhịp khó hơn nhiều (hai con trỏ nằm ở hai vùng khác nhau), nên gần như luôn dùng **primitive** do hãng cung cấp — khối làm sẵn cho đúng dòng chip, mã gọi của Intel và AMD khác nhau; chương 9 nói về primitive. Trên Vivado đó là IP *FIFO Generator*, hoặc macro `xpm_fifo_async` gọi thẳng từ VHDL.

#### **Quy Tắc Quản Lý Luồng Dữ Liệu An Toàn:**
Hai quy tắc vàng của chương 6 vẫn nguyên: không ghi khi đầy, không đọc khi trống. Nhiều primitive FIFO xuất ra cả số phần tử đang có, nhưng tác giả khuyên **không dựa vào con số đó, cũng đừng dựa vào Full/Empty**, mà truyền theo từng khối (burst) cỡ cố định và dùng hai cờ:

1.  **Cờ Suýt Đầy (Almost Full - AF):** Đặt ngưỡng `AF_Level = DEPTH - Burst_Size`. Khi cờ `AF` bật lên, phía ghi lập tức tạm ngưng nạp dữ liệu, đảm bảo FIFO không bao giờ bị tràn (`Full`).
2.  **Cờ Suýt Trống (Almost Empty - AE):** Đặt ngưỡng `AE_Level = Burst_Size`. Khi cờ `AE` hạ xuống (báo hiệu trong FIFO đã tích đủ 1 khối dữ liệu), phía đọc mới bắt đầu rút dữ liệu ra ngoài, đảm bảo FIFO không bao giờ bị đọc rỗng (`Empty`).

Ví dụ của sách: một module ghi vào FIFO ở 33 MHz, phía đọc đổ ra bộ nhớ ngoài ở 110 MHz. Đọc nhanh hơn ghi nhiều nên phía đọc rảnh phần lớn thời gian; đặt `AE_Level = 50`, khi FIFO tích đủ 50 từ thì cờ AE từ 1 về 0, phía đọc rút đúng 50 từ rồi chờ tiếp. Làm được như vậy là bạn đang chuyển vùng xung nhịp đúng cách.

#### **Khai báo với công cụ rằng bạn đã xử lý CDC:**

Có nhiều xung nhịp thì phải khai tần số của **từng** xung nhịp trong ràng buộc. Công cụ sẽ phân tích cả các đường đi giữa hai vùng và báo lỗi timing cho chúng — vì nó thấy có khả năng vi phạm setup/hold. Nhưng bạn đã double-flop, kéo dài xung, dùng FIFO; công cụ không biết điều đó. Để báo cáo sạch, bạn phải thêm ràng buộc nói với công cụ rằng những đường đó là cố ý và đã được xử lý; cú pháp mỗi hãng mỗi khác, sách không đi sâu. Với Vivado đó là `set_clock_groups -asynchronous` giữa hai xung nhịp, hoặc `set_false_path` cho từng đường — hai lệnh XDC chuẩn, nhưng cách dùng cụ thể trên dự án nhiều xung nhịp chưa thử, để trong danh sách cần kiểm. Mục tiêu luôn là **không còn lỗi timing** trong báo cáo, và bạn chỉ được dùng ràng buộc nới lỏng ở đúng những đường mình đã xử lý.

---

## **Tóm Tắt Chương (Summary)**

Trong chương này, bạn đã tìm hiểu chuyên sâu về quy trình biên dịch phần cứng FPGA:

1.  **Tổng hợp (Synthesis):** Phân biệt mã tổng hợp được và không tổng hợp được (thời gian thực, in ấn console, thao tác file, vòng lặp `for`). Nguyên tắc sử dụng dưới 80% tài nguyên và các kỹ thuật chia sẻ phần cứng.
2.  **Đặt vị trí & Đi tuyến (Place and Route):** Hiểu rõ 3 giới hạn vật lý (`t_su`, `t_h`, `t_p`), hiện tượng bất ổn định **Metastability** và công thức `t_clk(min) = t_su + t_p`.
3.  **Khắc phục lỗi Timing:** Phương pháp **Pipelining** (chèn Flip-flop giảm `t_p`) và **Double-flopping** (lọc tín hiệu bất đồng bộ).
4.  **Chuyển vùng xung nhịp (CDC):** Kỹ thuật **Double-flopping** (từ chậm sang nhanh), **Kéo dài xung Pulse Stretching** (từ nhanh sang chậm) và sử dụng **Dual-Clock FIFO** điều khiển bằng cờ `AF`/`AE`; sau đó khai ràng buộc để công cụ biết các đường băng vùng đã được xử lý.

Thêm vào đó, từ góc độ thực hành với GHDL và Vivado:

*   **Lặp theo thời gian = bộ đếm + `if`**, không phải `for`; ví dụ `r_Index` đã chạy thử đúng 10 cạnh.
*   **Ví dụ `timing_error` của sách chạy đúng trên GHDL** (335 sau 2 cạnh, pipeline sau 4) *với điều kiện* thêm khởi tạo cho thanh ghi — sách không có, và GHDL sập ngay khi chia `'U'`.
*   **Hình xung bị bỏ sót / bắt được** ở mục CDC là mô phỏng thật, không vẽ tay: 1 chu kỳ 100 MHz lọt giữa hai cạnh 25 MHz, 8 chu kỳ thì bắt được.
*   **Vivado:** ràng buộc trong `.xdc`; báo cáo timing đọc WNS; bộ đồng bộ nên đánh dấu `ASYNC_REG`; đường băng vùng xung nhịp khai bằng `set_clock_groups -asynchronous` hoặc `set_false_path` — ba thứ sau chưa chạy thử trên máy, nằm trong danh sách cần kiểm.

---
