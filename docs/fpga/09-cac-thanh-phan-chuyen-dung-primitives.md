# CHƯƠNG 9: CÁC THÀNH PHẦN CHUYÊN DỤNG (USEFUL FPGA PRIMITIVES)

Cho đến thời điểm này, bạn đã tìm hiểu về hai thành phần phần cứng cơ bản nhất bên trong một FPGA: **Bảng tra LUT (Look-Up Table)** và **Mạch lật Flip-Flop**. Hai thành phần đa năng này đóng vai trò là "những lực lượng lao động chính" giải quyết hầu hết mọi tác vụ logic trong FPGA. Tuy nhiên, ngoài LUT và Flip-Flop, trên chip FPGA còn tích hợp các khối phần cứng chuyên dụng cứng (**dedicated components**) được thiết kế tối ưu riêng cho các tác vụ phức tạp.

Các khối phần cứng chuyên dụng này thường được gọi là **Primitives** (thành phần nguyên thủy), hoặc đôi khi được gọi là **Hard IP** (Intellectual Property phần cứng) hay các **Cores** cứng.

Làm việc với Primitives giúp bạn khai thác tối đa hiệu năng của FPGA. Trong thực tế phát triển FPGA hiện đại, rất nhiều công việc thiết kế xoay quanh việc kết nối các khối Primitives có sẵn này lại với nhau, kết hợp với mã nguồn tùy chỉnh cho các logic đặc thụ của ứng dụng.

Trong chương này, chúng ta sẽ khám phá 3 khối Primitives quan trọng nhất trên FPGA:

1. **Block RAM (BRAM):** Khối bộ nhớ dung lượng lớn tích hợp.
2. **DSP Block (Digital Signal Processing):** Khối xử lý tín hiệu số & tính toán toán học tốc độ cao.
3. **Phase-Locked Loop (PLL):** Vòng bám pha dùng để quản lý và tạo xung nhịp đồng hồ.

Bạn sẽ học được vai trò của từng Primitive, cách tạo ra chúng bằng mã **Verilog / VHDL** (thông qua Suy luận - Inference hoặc Khởi tạo trực tiếp - Instantiation), cũng như cách sử dụng công cụ giao diện đồ họa **GUI** của phần mềm biên dịch.

Sách nhấn mạnh: ba primitive này quan trọng nhất trên các FPGA cao cấp hơn iCE40, và phần lớn độ phức tạp của Vivado hay Quartus nằm ở việc tạo và nối dây chúng. Với bo QMTech, số lượng trên XC7A35T theo datasheet DS180: **50 Block RAM** 36 Kb (1.800 Kb), **90 khối DSP48E1**, **5 cụm xung nhịp CMT** (mỗi cụm một MMCM và một PLL). Ba con số này nằm trong danh sách cần kiểm bằng Report Utilization.

---

## 1. Cách Tạo Các Thành Phần Primitives (How to Create Primitives)

Có 3 phương pháp chính để tạo và đưa một Primitive vào thiết kế FPGA của bạn:

```
                  ┌───────────────────────────────────────────────┐
                  │ Cách Tạo Primitives Trong Thiết Kế FPGA       │
                  └───────────────────────────────────────────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │                                 │                                 │
        v                                 v                                 v
[1. Suy Luận (Inference)]    [2. Khởi Tạo Trực Tiếp (Instantiation)]  [3. Dùng GUI Phần Mềm]
 - Viết code Verilog/VHDL      - Khởi tạo trực tiếp template           - Sử dụng trình hướng
   chuẩn.                        mẫu của nhà sản xuất.                   dẫn Wizard trong IDE.
 - Trình tổng hợp tự hiểu      - Chỉ định chính xác từng chân.         - Dễ dùng, tránh lỗi cấu
   và chuyển thành Primitive.  - Tính di động (portability) thấp.        hành phức tạp.
```

### A. Phương Pháp Suy Luận (Inference)
Trong các chương trước, chúng ta đã viết mã Verilog hoặc VHDL và để công cụ tổng hợp (**Synthesis Tool**) tự động quyết định cách chuyển đổi đoạn code đó thành các thành phần tương ứng trên FPGA. Chúng ta tin tưởng công cụ sẽ tự hiểu khi nào cần tạo một Flip-flop hay một LUT. Quá trình này gọi là **Inference (Suy luận)** — trình tổng hợp dự đoán ý đồ của lập trình viên dựa trên cấu trúc mã nguồn.

* **Ưu điểm:** Mã nguồn mang tính di động cao (generic code), có thể biên dịch trên chip của AMD (Xilinx), Intel (Altera) hay Lattice mà không cần sửa đổi.
* **Hạn chế:** Một số Primitives phức tạp (như PLL) không thể suy luận được từ mã nguồn thông thường.

---

### B. Khởi Tạo Trực Tiếp (Instantiation)

**Khởi tạo trực tiếp (Instantiation)** là việc khai báo và gọi một Primitive dựa trên tệp mẫu (template) mã nguồn do nhà sản xuất FPGA cung cấp. Khởi tạo một Primitive trông giống như việc bạn gọi một submodule trong Verilog/VHDL, nhưng module này không phải do bạn viết mà được tích hợp sẵn trong thư viện phần cứng của phần mềm.

#### Ví Dụ 1: Khởi Tạo Trực Tiếp Khối Block RAM (RAMB18E1 trên chip AMD/Xilinx)

##### Mã Nguồn Verilog:
```verilog
// Khởi tạo trực tiếp khối Block RAM RAMB18E1 trên chip AMD
RAMB18E1 #(
  .RDADDR_COLLISION_HWCONFIG("DELAYED_WRITE"), // "PERFORMANCE" hoặc "DELAYED_WRITE"
  .SIM_DEVICE("7SERIES")
) RAMB18E1_inst (
  .DOADO(DOADO),         // Đầu ra dữ liệu Cổng A (16-bit)
  .DOPADOP(DOPADOP),     // Đầu ra bit Parity Cổng A (2-bit)
  .ADDRARDADDR(ADDRARDADDR), // Địa chỉ đọc/ghi Cổng A (14-bit)
  .CLKARDCLK(CLKARDCLK),     // Xung nhịp Cổng A
  .ENARDEN(ENARDEN),         // Tín hiệu Cho phép (Enable) Cổng A
  .WEA(WEA)                  // Tín hiệu Cho phép Ghi (Write Enable) Cổng A
  // Các chân kết nối khác bị lược bỏ cho gọn...
);
```

##### Mã Nguồn VHDL:
```vhdl
-- Khởi tạo trực tiếp khối Block RAM RAMB18E1 trên chip AMD
RAMB18E1_inst : RAMB18E1
  generic map (
    RDADDR_COLLISION_HWCONFIG => "DELAYED_WRITE", -- "PERFORMANCE" hoặc "DELAYED_WRITE"
    SIM_DEVICE                => "7SERIES"
  )
  port map (
    DOADO       => DOADO,       -- Đầu ra dữ liệu Cổng A
    DOPADOP     => DOPADOP,     -- Đầu ra Parity
    ADDRARDADDR => ADDRARDADDR, -- Địa chỉ
    CLKARDCLK   => CLKARDCLK,   -- Xung nhịp
    ENARDEN     => ENARDEN,     -- Tín hiệu Enable
    WEA         => WEA          -- Tín hiệu Write Enable
  );
```

Bản trong sách dài gấp nhiều lần: hàng chục generic (`DOA_REG`, `INIT_00`…`INIT_3F` để nạp sẵn nội dung, `RAM_MODE`, `READ_WIDTH_A`, `WRITE_MODE_A`…) và đủ chân của cả hai cổng A/B. Sách nói rõ không cần hiểu từng dòng, chỉ cần thấy instantiation trông ra sao; bản rút gọn ở trên giữ đúng tên generic và tên chân thật của Xilinx. Tác giả lấy mẫu này từ *AMD Libraries Guide*; trong Vivado, cùng mẫu đó có sẵn ở **Tools → Language Templates → VHDL → Device Primitive Instantiation**, không phải tra mạng.

#### Ví Dụ 2: Khởi Tạo Trực Tiếp 1 D Flip-Flop Chuyên Dụng (FDSE trên chip AMD)

Ngay cả một thành phần đơn giản như D Flip-Flop cũng có thể được khởi tạo trực tiếp bằng template:

##### Mã Nguồn Verilog:
```verilog
FDSE #(
  .INIT(1'b0) // Giá trị khởi tạo ban đầu của thanh ghi (1'b0 hoặc 1'b1)
) FDSE_inst (
  .Q(Q),      // Đầu ra dữ liệu 1-bit
  .C(C),      // Đầu vào xung nhịp Clock 1-bit
  .CE(CE),    // Đầu vào cho phép xung nhịp Clock Enable 1-bit
  .S(S),      // Đầu vào Set đồng bộ 1-bit
  .D(D)       // Đầu vào dữ liệu 1-bit
);
```

##### Mã Nguồn VHDL:
```vhdl
FDSE_inst : FDSE
  generic map (
    INIT => '0' -- Giá trị khởi tạo ban đầu ('0' hoặc '1')
  )
  port map (
    Q  => Q,   -- Đầu ra dữ liệu
    C  => C,   -- Đầu vào xung nhịp
    CE => CE,  -- Đầu vào Clock Enable
    S  => S,   -- Đầu vào Set đồng bộ
    D  => D    -- Đầu vào dữ liệu
  );
```

#### Đánh Giá Phương Pháp Instantiation:

* **Ưu điểm:** Cho phép lập trình viên kiểm soát chính xác 100% từng chân kết nối và tham số của phần cứng mà không phải phụ thuộc vào việc "đoán" của trình tổng hợp.
* **Nhược điểm:**
  1. Mã nguồn cực kỳ rườm rà và tốn nhiều dòng code.
  2. Dễ gây lỗi nếu nối sai một trong hàng chục chân tín hiệu.
  3. **Mất tính di động:** Template `RAMB18E1` chỉ tồn tại trên chip AMD/Xilinx; chip Intel hay Lattice sử dụng tên gọi và cấu trúc Primitive hoàn toàn khác. Thậm chí trong cùng một hãng, mẫu có thể chỉ đúng cho một nhóm dòng chip (`RAMB18E1` là của 7-series; UltraScale dùng `RAMB18E2`).

---

### C. Phương Pháp Sử Dụng Giao Diện Đồ Họa (The GUI Approach)

Hầu hết các bộ công cụ IDE phát triển FPGA chuyên nghiệp (như AMD Vivado, Intel Quartus, Lattice Diamond) đều tích hợp sẵn trình tạo module đồ họa (**IP Catalog / Module Generator Wizard**).

Trình tạo GUI cho phép bạn:

* Lựa chọn Primitive mong muốn từ thư viện.
* Điền các tham số (độ rộng bit, độ sâu bộ nhớ, chế độ Reset, file nạp ban đầu) qua các ô nhập liệu và hộp kiểm (checkbox/radio button).
* Quan sát trực quan sơ đồ khối tín hiệu đầu vào/đầu ra ngay trên màn hình.
* Tự động sinh ra tệp mã nguồn bọc (wrapper) an toàn để đưa vào dự án.

Sách cũng nêu mặt trái: muốn đổi một thông số là phải mở lại wizard chạy từ đầu; thiết kế có nhiều primitive tạo bằng GUI thì việc chỉnh sửa thành tẻ nhạt và tốn thời gian. Trên Vivado, phần này là **IP Catalog** (Block Memory Generator cho BRAM, Multiplier cho DSP, Clocking Wizard cho PLL/MMCM).

> **Lưu ý:** Phần mềm **iCEcube2** không có trình tạo GUI Primitive vì nó được tối ưu riêng cho dòng chip nhỏ iCE40 (vốn chủ yếu dùng LUT và Flip-Flop). Nhưng trên các dòng chip lớn hơn (như ECP5, MachXO2), công cụ **Lattice Diamond** cung cấp trình GUI rất mạnh mẽ.

---

## 2. Khối Bộ Nhớ Block RAM (The Block RAM - BRAM)

### A. Giới Thiệu Khối Block RAM
**Block RAM (BRAM)** là các khối bộ nhớ phần cứng chuyên dụng tích hợp sẵn rải rác trên bề mặt chip FPGA. Bên cạnh LUT và Flip-Flop, BRAM là thành phần Primitive phổ biến thứ 3 trên FPGA.

Các ứng dụng phổ biến của BRAM:

* Lưu trữ dữ liệu cố định (Read-Only Memory - ROM) như bảng mã hóa, thông số hiệu chuẩn.
* Lưu tạm bộ đệm dữ liệu từ các thiết bị ngoại vi tốc độ cao (ADC, Camera, Ethernet).
* Làm vùng xếp hàng dữ liệu giữa hai vùng xung nhịp khác nhau (Dual-Clock FIFO).

```
   [Dữ liệu ngoại vi (ADC/Camera)] 
                  │
                  v
       ┌────────────────────┐
       │   Block RAM (BRAM) │ <───> [Các khối Logic / LUTs]
       └────────────────────┘
                  │
                  v
        [Đưa ra bộ nhớ ngoài DDR/SD Card]
```

---

### B. Dung Lượng Thực Tế Của BRAM So Với Bộ Nhớ Ngoài
Một hiểu lầm phổ biến của người mới bắt đầu là nghĩ FPGA có rất nhiều bộ nhớ nội bộ. Hãy nhìn vào bảng thông số dòng chip **Intel Cyclone V** (mỗi khối M10K chứa 10 Kb, nên tên gọi là M10K):

| Dòng Chip | Số lượng khối M10K | Tổng dung lượng BRAM (Kb) | Tương đương KiloByte (KB) |
| :---: | :---: | :---: | :---: |
| **5CEA2** | 176 khối | 1,760 Kb | ~220 KB |
| **5CEA4** | 308 khối | 3,080 Kb | ~385 KB |
| **5CEA5** | 446 khối | 4,460 Kb | ~557 KB |

> **Nhận xét quan trọng:** Chip lớn nhất **5CEA5** có 446 khối BRAM nhưng tổng dung lượng chỉ đạt **4.460 Kilobit — khoảng 0,56 Megabyte, chưa đến 1 MB**. Trong khi đó, một chiếc thẻ nhớ MicroSD 32 GB giá chừng 10 USD chứa dung lượng gấp hàng chục nghìn lần (32 GB so với 0,56 MB là khoảng 57.000 lần).
> **Kết luận:** Block RAM trên FPGA không được thiết kế để lưu trữ dữ liệu khối lượng lớn lâu dài, mà chỉ đóng vai trò là **vùng đệm tốc độ cao (high-speed buffer)** cho dữ liệu tạm thời.

---

### C. Tính Năng và Hạn Chế Của Block RAM

1. **Cố định kích thước nguyên khối:** Mỗi khối BRAM có dung lượng cố định (sách nói 16 Kb/khối là phổ biến). Nếu bạn khai báo một bộ nhớ nhỏ 4Kb, trình tổng hợp vẫn phải dành riêng **1 khối BRAM đầy đủ** cho nó và không thể chia nhỏ 1 khối BRAM ra cho 2 module độc lập khác nhau. Xilinx 7-series có một ngoại lệ đáng biết: khối là **36 Kb** nhưng tách được thành **hai nửa 18 Kb độc lập** (đó là lý do có cả `RAMB36E1` lẫn `RAMB18E1`); dưới 18 Kb thì không chia tiếp được nữa.
2. **Cấu hình độ rộng/độ sâu linh hoạt:** Một khối BRAM 16Kb có thể được cấu hình thành nhiều hình dạng:
   * 16,384 ô × 1 bit
   * 2,048 ô × 8 bit
   * 512 ô × 32 bit
3. **Tự động ghép tầng (Cascading):** Nếu bạn khai báo một RAM dung lượng 16 KB (128 Kb), phần mềm tổng hợp sẽ tự động ghép 8 khối BRAM 16Kb nối tiếp nhau thành 1 khối bộ nhớ duy nhất mà bạn không cần viết code ghép nối thủ công.
4. **Phát hiện và Sửa lỗi (ECC - Error Detection and Correction):** BRAM dành sẵn vài bit dư để tự phát hiện và sửa lỗi đảo bit (bit flip) xảy ra ngay trong ô nhớ; số lỗi sửa được thường ít hơn số lỗi phát hiện được, và tất cả tự động, bạn không phải làm gì. Trên 7-series tính năng này chỉ có ở khối 36 Kb dùng rộng 64 bit (8 bit ECC cho 64 bit dữ liệu, kiểu Hamming sửa 1 lỗi / phát hiện 2 lỗi).
5. **Nạp dữ liệu ban đầu (ROM Initialization):** Bạn có thể đọc một tệp văn bản (chứa mã Hex/Binary) trong quá trình tổng hợp để nạp sẵn dữ liệu ban đầu vào BRAM.

---

### D. Phương Pháp Khởi Tạo BRAM (Inference vs GUI)
Tác giả khuyến nghị nên ưu tiên **Suy luận (Inference)** bằng cách viết mảng 2D chuẩn trong Verilog/VHDL (như module `RAM_2Port` ở Chương 6). Mảng có vào BRAM hay không tuỳ kích thước: bộ nhớ 16 byte (16 × 8 = 128 bit) gần như chắc chắn thành Flip-flop, vì chiếm cả khối 16 Kb cho 128 bit là vô lý; ngưỡng cụ thể tuỳ công cụ. Cách duy nhất để biết là **bạn** mở báo cáo tài nguyên sau khi tổng hợp — ví dụ của sách:

```text
--snip--
Number of registers:      1204 out of 84255 (1%)
--snip--
Number of LUT4s:          1925 out of 83640 (2%)
--snip--
Number of block RAMs:     3 out of 208 (1%)
```

Dòng cuối cho biết số BRAM dùng; nếu nó bằng 0 thì bộ nhớ của bạn đã thành Flip-flop. Chương 6 đã nói thêm điều kiện riêng của Xilinx: đọc phải **đồng bộ** thì mới suy ra được Block RAM, và bộ nhớ nhỏ sẽ thành distributed RAM (LUT) chứ không phải Flip-flop rời. Sách còn khuyên: nếu ngại suy luận bộ nhớ lớn, hay cần FIFO hai xung nhịp, thì dùng GUI là chắc nhất.

---

## 3. Khối Xử Lý Tín Hiệu Số (Digital Signal Processing - DSP Block)

### A. Tín Hiệu Tương Tự vs Tín Hiệu Số (Analog vs Digital Signals)
Thế giới tự nhiên (âm thanh, hình ảnh, sóng vô tuyến) tồn tại dưới dạng **tín hiệu tương tự (Analog)** liên tục. Để FPGA xử lý, tín hiệu tương tự phải đi qua bộ chuyển đổi **ADC (Analog-to-Digital Converter)** để lấy mẫu thành chuỗi các số nhị phân rời rạc theo thời gian.

```
Tín hiệu Analog (Liên tục) ───> [Bộ ADC lấy mẫu] ───> Tín hiệu Số (Chuỗi số nhị phân) ───> [FPGA DSP]
```

---

### B. Các Tác Vụ DSP Phổ Biến

#### 1. Khuếch đại tín hiệu (Gain / Volume Control):
Giả sử bạn nhận được tín hiệu âm thanh kỹ thuật số quá nhỏ, bạn muốn tăng âm lượng lên 1,6 lần. Sách viết ý đó bằng một dòng:

```
gain_adjusted <= input_signal * 1.6;
```

Trình tổng hợp sẽ phát hiện phép nhân này và tự động gán nó vào một khối **DSP Block**.

Dòng trên là **giả mã**, không phải VHDL chạy được: `unsigned` không nhân được với số thực, GHDL báo `no function declarations for operator "*"`. Cách làm thật là số dấu chấm tĩnh (chương 10): nhân với một số nguyên rồi dịch bit — 1,6 ≈ 410/256, nên nhân với 410 rồi bỏ 8 bit thấp:

```vhdl
prod          <= input_signal * to_unsigned(410, 16);  -- 16 bit × 16 bit = 32 bit
gain_adjusted <= prod(23 downto 8);                    -- chia 256
```

Đã chạy GHDL: vào 1000, ra 1601 (1,6016 lần). Phép nhân số nguyên này mới là thứ công cụ đẩy vào DSP.

#### 2. Bộ lọc số (Digital Filters - LPF):
Bộ lọc thông thấp (Low-Pass Filter) loại bỏ nhiễu tần số cao bằng cách thực hiện hàng loạt phép Nhân và Cộng đồng thời trên các mẫu dữ liệu liên tiếp.

#### 3. Xử lý Video (Làm mờ ảnh - Video Blurring):
Để làm mờ một khung hình video, FPGA thay mỗi điểm ảnh bằng trung bình (Cộng + Nhân hệ số) của các điểm ảnh lân cận — phải làm trên hàng triệu điểm ảnh cùng lúc, và phải xong trước khi khung hình kế tiếp tới, vì video là nhiều khung hình mỗi giây.

---

### C. Kiến Trúc Bên Trong Của Một DSP Block (DSP Tile)

```
        ┌────────────────────────────────────────────────────────┐
        │              Sơ đồ khối DSP rút gọn (AMD)              │
        │                                                        │
Data A ─┼─>[ thanh ghi ]──┐                                      │
        │                 ▼                                      │
Data D ─┼─>[ thanh ghi ]─>( +/− pre-adder )──┐                   │
        │                                    ▼                   │
Data B ─┼─>[ thanh ghi ]───────────────────>( × bộ nhân )        │
        │                                          │             │
        │                                          ▼             │
Data C ─┼─>[ thanh ghi ]───────────────────>( ALU cộng/trừ )     │
        │                                          │             │
        │                                          ▼             │
        │                               [ thanh ghi đầu ra ]─────┼──> kết quả
        └────────────────────────────────────────────────────────┘
```
*Hình 9-4: Sơ đồ khối một DSP của AMD, dạng rút gọn — bốn đầu vào, pre-adder, bộ nhân, ALU, thanh ghi đầu ra*

Khối DSP không chỉ chứa 1 bộ nhân, mà là một cụm tính toán toán học hoàn chỉnh gồm:

1. **Khối cộng tiền xử lý (Pre-adder):** Thực hiện cộng/trừ 2 đầu vào trước khi đưa vào bộ nhân.
2. **Bộ nhân phần cứng (Multiplier):** Trái tim của khối, nhân ở tốc độ rất cao.
3. **Đơn vị Logic Toán học (ALU):** Cộng/trừ thêm sau bộ nhân; đưa kết quả quay lại đầu vào ở chu kỳ sau thì thành **MAC (Multiply-Accumulate)** — phép toán đặc trưng của DSP.
4. **Thanh ghi đầu ra (Output Registers):** Bật lên để chốt kết quả, giúp đạt timing ở tốc độ dữ liệu cao.

Sách không ghi độ rộng bit, vì mỗi hãng mỗi khác; bản dịch trước ghi "DSP48E2, 27×18" là số của dòng UltraScale. Chip trên QMTech là 7-series, khối tên **DSP48E1**: pre-adder 25 bit, bộ nhân **25 × 18** bit có dấu, ALU và bộ tích luỹ **48 bit**; XC7A35T có 90 khối. Tần số tối đa tuỳ cấp tốc độ, tra DS181 chứ đừng tin một con số tròn. Trên Cyclone V của sách, mỗi khối DSP có hai bộ nhân 18 × 18, nên datasheet ghi số bộ nhân gấp đôi số khối: 5CEA2 có 25 khối, 5CEA4 có 66, 5CEA5 có 150.

---

### D. So Sánh Hiệu Năng: DSP Block vs LUTs

Trình tạo GUI trên phần mềm cho phép bạn chọn thực hiện phép nhân bằng **DSP Block** hoặc bằng **LUTs**:

| Tiêu chí | Thực hiện bằng DSP Block | Thực hiện bằng LUTs |
| :--- | :--- | :--- |
| **Tiêu tốn tài nguyên** | Tiết kiệm tối đa LUTs và Flip-flops cho các logic khác. | Tiêu tốn hàng trăm LUTs và Flip-flops. |
| **Tốc độ xung nhịp** | Nhanh hơn nhiều, vì là mạch cứng tối ưu cho phép nhân. | Chậm hơn, dễ bị lỗi thời gian (Timing Errors). |
| **Giới hạn số lượng** | Số lượng khối DSP trên chip có hạn (Cyclone V 5CEA2: 25 khối; XC7A35T: 90). | Giới hạn bởi tổng số LUTs trên chip. |

Không có DSP cũng không sao: phép nhân và cộng vẫn làm được bằng LUT, chỉ tốn tài nguyên và chậm hơn — chương 10 bàn tiếp. Với Vivado, viết `a * b` trên kiểu `signed`/`unsigned` của `numeric_std` là đủ để công cụ suy ra DSP48; muốn ép hay cấm thì có thuộc tính `use_dsp`. Việc này chưa chạy thử, nằm trong danh sách cần kiểm.

---

## 4. Khối Vòng Bám Pha (Phase-Locked Loop - PLL)

### A. Tại Sao Cần PLL Trái Tim Tạo Xung Nhịp?
Trên bo mạch phát triển, bạn chỉ có **một con chip thạch anh duy nhất** cấp xung nhịp cố định (25 MHz trên Go Board, 50 MHz trên QMTech).

Tuy nhiên, trong một hệ thống thực tế:

* Màn hình HDMI đòi hỏi xung nhịp **148.5 MHz**.
* Bộ nhớ RAM ngoài đòi hỏi xung nhịp **100 MHz**.
* Khối điều khiển chính chạy ở **25 MHz**.

Nếu không có PLL, bạn sẽ phải hàn thêm 3 con chip thạch anh khác nhau lên bo mạch, và muốn đổi tần số là phải thay linh kiện. **PLL chính là Primitive giúp bạn tổng hợp và tạo ra nhiều tần số xung nhịp khác nhau từ 1 nguồn xung nhịp gốc duy nhất, chỉ bằng vài dòng cấu hình.** Không phải FPGA nào cũng có PLL, nhưng đa số có ít nhất một; Cyclone V 5CEA2 và 5CEA4 có bốn, 5CEA5 có sáu. Xilinx 7-series gom xung nhịp vào các cụm **CMT**, mỗi cụm có một **MMCM** và một **PLL** — MMCM là bản mạnh hơn (dịch pha tinh hơn, nhiều đầu ra hơn); XC7A35T có 5 cụm.

---

### B. Nguyên Lý Hoạt Động Của PLL

```
                       ┌───────────────────────────────────────┐
                       │           Phase-Locked Loop           │
                       │                                       │
Ref Clk In (10 MHz) ──>│──> [ nhân ×3 ] ──> [ chia /2 ] ───────┼──> Output Clk (15 MHz)
                       │                                       │
Reset ────────────────>│──> [ khối khoá pha ] ─────────────────┼──> Locked (1 = sẵn sàng)
                       └───────────────────────────────────────┘
```

1. **Tổng hợp Tần số (Frequency Synthesis):**
   * PLL nhận xung nhịp tham chiếu (**Reference Clock**) đầu vào.
   * Sử dụng các hệ số nhân số nguyên (M) và chia số nguyên (D) để tạo ra tần số đầu ra theo công thức:
     f_out = f_ref * (M / D)
   * *Ví dụ:* Muốn tạo xung 15 MHz từ nguồn 10 MHz: PLL nhân 3 (thành 30 MHz), sau đó chia 2 để đạt 15 MHz.
   * *Lưu ý:* Vì M và D phải là số nguyên, bạn không thể tạo ra tần số bất kỳ: π MHz từ 10 MHz là bất khả, vì π không phải tỉ số của hai số nguyên.

2. **Dịch Pha Tín Hiệu (Phase Shifting):**
   PLL có thể tạo ra các bản sao xung nhịp bị lệch pha 90°, 180°, hay 270° so với xung nhịp gốc. Thiết kế đơn giản hiếm khi cần, nhưng có thể cần khi giao tiếp với linh kiện ngoài chip như bộ nhớ.

```
Time (ns) 0                   40                  80                  
          |                   |                   |                   
          ──────────┐         ┌─────────┐         ┌─────────┐         
clk                 └─────────┘         └─────────┘         └─────────
               ┌─────────┐         ┌─────────┐         ┌─────────┐    
clk_90    ─────┘         └─────────┘         └─────────┘         └────
                    ┌─────────┐         ┌─────────┐         ┌─────────
clk_180   ──────────┘         └─────────┘         └─────────┘         
                         ┌─────────┐         ┌─────────┐         ┌────
clk_270   ───────────────┘         └─────────┘         └─────────┘    
```
*Hình 9-9: Dịch pha 90°, 180°, 270° — mô phỏng GHDL với chu kỳ 40 ns, mỗi ký tự 2 ns*

   Mỗi 90° là trễ thêm một phần tư chu kỳ. Để ý `clk_180` chính là `clk` đảo ngược (đổi cao thành thấp); đủ 360° thì về như cũ. Pha cũng có thể âm (sớm hơn), và dịch được góc bất kỳ chứ không chỉ bội của 90°. Sách lưu ý thiết kế đơn giản hiếm khi cần dịch pha; chỗ hay cần là giao tiếp bộ nhớ ngoài.

3. **Tín Hiệu Báo Khóa Pha (`Locked` Output):**
   Khi mới cấp nguồn hoặc sau khi Reset, PLL cần một khoảng thời gian ngắn để tần số đầu ra ổn định. Khi tần số đã hoàn toàn ổn định và khóa pha thành công, chân `Locked` sẽ bật lên mức 1.
   * **Quy tắc thiết kế an toàn:** Tất cả các module phần cứng sử dụng xung nhịp từ PLL phải được **giữ ở trạng thái Reset** cho đến khi tín hiệu `Locked` của PLL chuyển lên mức 1! Kéo chân `Reset` của PLL lên thì `Locked` rơi về 0 và mọi module phía sau lại vào reset.
   * **Đã dùng PLL thì dùng cho tất cả:** sách khuyên mọi xung nhịp trong thiết kế đều lấy từ đầu ra PLL, kể cả phần chạy đúng tần số của thạch anh — tạo thêm một đầu ra cùng tần số thay vì nối thẳng thạch anh vào. Khi đó quan hệ giữa các xung nhịp được kiểm soát chặt, và `Locked` phản ánh đúng trạng thái của *mọi* xung nhịp trong chip.

---

### C. Khởi Tạo PLL Bằng Trình GUI (Được Khuyên Dùng 100%)

Khác với BRAM hay DSP, **PLL KHÔNG THỂ suy luận (infer) tự động từ mã nguồn Verilog/VHDL**. Lập trình viên bắt buộc phải tạo PLL bằng **GUI Wizard** hoặc Khởi tạo trực tiếp (Instantiation).

Tác giả **khuyên dùng GUI** khi tạo PLL vì:

* Trình GUI sẽ tự động tính toán các hệ số nhân/chia M, D phức tạp.
* Nếu bạn yêu cầu một tần số không thể tạo ra chính xác, GUI báo ngay. Ví dụ của sách trên Lattice Diamond: tham chiếu 30 MHz, muốn bốn đầu ra 30, 60, 15 và 89 MHz — ba đầu ra đầu đúng như yêu cầu, còn 89 MHz với sai số 0,0% thì báo lỗi; nới sai số lên 2,0% công cụ mới chọn được 90 MHz. Quyết định 90 có dùng được không là việc của bạn; không được thì đổi tham chiếu hoặc dùng PLL thứ hai.
* Tránh được các lỗi cấu hình sai tham số khiến PLL không thể khóa pha trên phần cứng thật — khởi tạo trực tiếp rất dễ chọn nhầm bộ tham số không tương thích mà không ai báo.

Tạo xong, báo cáo tài nguyên sẽ xác nhận, ví dụ `Number of PLLs: 1 out of 4 (25%)`. Trên Vivado việc này là IP **Clocking Wizard**: nhập 50 MHz từ chân N11 của QMTech, chọn tần số ra, nó sinh một module có cổng `clk_in1`, `clk_out1`, `reset`, `locked`. Chưa chạy thử trên bo, nằm trong danh sách cần kiểm.

---

## 5. Tóm Tắt Chương (Summary)

Trong chương này, bạn đã tìm hiểu các khối phần cứng Primitive chuyên dụng trên FPGA:

1. **Cách tạo Primitives:** Phân biệt giữa Suy luận (Inference), Khởi tạo trực tiếp (Instantiation), và Sử dụng phần mềm đồ họa (GUI).
2. **Block RAM (BRAM):** Khối bộ nhớ đệm tốc độ cao tích hợp sẵn; cách tính dung lượng, các tính năng tự động ghép tầng (cascading) và nạp dữ liệu ban đầu.
3. **DSP Block:** Khối tính toán toán học phần cứng chứa Pre-adder, bộ nhân và ALU (trên 7-series: 25 × 18 và 48 bit); giúp thực hiện các phép toán song song tốc độ cao cho audio, video và bộ lọc số.
4. **Phase-Locked Loop (PLL):** Khối tổng hợp xung nhịp; cho phép tạo nhiều tần số và dịch pha từ 1 nguồn thạch anh duy nhất; vai trò sống còn của tín hiệu `Locked` trong việc kiểm soát Reset hệ thống.

Thêm vào đó, cho XC7A35T trên QMTech (theo DS180, chưa đối chiếu Vivado): 50 Block RAM 36 Kb tách được thành 18 Kb, 90 DSP48E1 (25 × 18), 5 cụm CMT với MMCM + PLL; BRAM suy luận từ mảng đọc đồng bộ, DSP suy luận từ `*` trên `signed`/`unsigned`, PLL/MMCM tạo bằng Clocking Wizard. Và một điều kiểm được ngay bằng GHDL: `* 1.6` trong sách là giả mã — số thực phải đổi thành nhân số nguyên rồi dịch bit.

---
