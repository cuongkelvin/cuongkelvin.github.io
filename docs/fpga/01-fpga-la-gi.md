# FPGA là gì

## Một câu

FPGA (*Field Programmable Gate Array*) là một **mảng logic cấu hình lại được**. Nó không chạy lệnh như CPU — nó **chính là mạch**.

- **Field programmable** — lập trình lại được ngay tại nơi sử dụng, không phải gửi về nhà máy
- **Gate array** — lưới hai chiều gồm rất nhiều khối logic

Tên này giờ hơi lỗi thời: FPGA hiện đại không còn chỉ là "mảng cổng đơn giản", và một số loại thậm chí không lập trình lại được. Nhưng tên đã quen.

---

## Khác biệt gốc: song song vs tuần tự

Đây là rào cản lớn nhất khi chuyển từ phần mềm sang. Mọi thứ khác suy ra từ đây.

**Phần mềm chạy tuần tự.** C biên dịch để chạy trên CPU, mà CPU là cỗ máy tuần tự — xử lý một lệnh tại một thời điểm. Thứ tự dòng code quyết định thứ tự thực thi.

**FPGA chạy song song.** Mọi khối mạch tồn tại đồng thời và hoạt động liên tục. Thứ tự viết trong file **không có ý nghĩa gì**.

> *"You're literally creating the physical connections, the actual wires, between electrical components and input/output pins on your device."*
> — Russell Merrick, *Getting Started with FPGAs*

### Hệ quả cụ thể

| | Phần mềm (C) | FPGA (VHDL/Verilog) |
|---|---|---|
| Cách chạy | lệnh nối lệnh theo thời gian | mọi khối chạy đồng thời, liên tục |
| Gọi hàm 2 lần | dùng lại cùng một đoạn mã | **nhân đôi phần cứng** |
| Vòng lặp | lặp theo thời gian | **trải phẳng ra không gian** |
| Thứ tự dòng code | quyết định thứ tự chạy | không quyết định gì (ngoài process) |
| Chi phí tính theo | trường hợp trung bình | **trường hợp xấu nhất** |
| Khai biến | xin RAM vài byte, giải phóng được | chiếm flip-flop vật lý, **vĩnh viễn** |

### Ví dụ 1 — vòng lặp

```vhdl
for i in 0 to 7 loop
    <một full adder>
end loop;
```

Dòng này **không** chạy 8 lần theo thời gian. Nó nghĩa là *"đặt 8 full adder lên chip"* — 8 khối mạch vật lý nằm cạnh nhau, chạy đồng thời, xong trong một chu kỳ clock.

Thử `for i in 0 to 999` với thân vòng là phép nhân 16 bit → cần 1000 bộ nhân. Chip XC7K325T có 840 DSP slice. **Không đủ.** Không tổng hợp được.

!!! warning "Quy tắc"
    `for` = **nhân bản mạch**, không phải lặp theo thời gian.

    Tổng phần cứng = số vòng × phần cứng trong thân vòng.

### Ví dụ 2 — instantiation

```vhdl
u1 : entity work.adder_1b port map(...);
u2 : entity work.adder_1b port map(...);
```

**Không phải** gọi hàm hai lần. Đây là hàn **hai khối mạch riêng biệt** lên chip. Tốn gấp đôi tài nguyên, cùng tồn tại từ giây đầu tới giây cuối. Không có "thời điểm gọi".

### Ví dụ 3 — đánh đổi diện tích ↔ thời gian

Bộ cộng 8 bit có hai cách làm:

| Cách | Full adder | Chu kỳ |
|---|:-:|:-:|
| Trải phẳng | **8** | 1 |
| Tuần tự 2 bit/nhịp | **2** | 4 |

Cùng kết quả, khác chỗ trả giá. Đánh đổi này xuất hiện ở **mọi** quyết định thiết kế FPGA.

---

## "Cấu hình lại được" nghĩa là gì

Chỗ này hay hiểu sai. Nạp bitstream **không đấu lại transistor nào**.

Transistor, dây dẫn và công tắc đã được khắc cứng lúc sản xuất, không đổi được. Cái thay đổi chỉ là **nội dung vài chục triệu ô nhớ SRAM cấu hình**, mỗi ô:

- hoặc là một bit trong bảng tra của LUT,
- hoặc là chân điều khiển một công tắc ở nút giao dây.

### Hai cách "lập trình lại"

| | Đổi cái gì |
|---|---|
| **CPU** | giữ nguyên mạch, đổi **dữ liệu điều khiển mạch** (chương trình trong RAM) |
| **FPGA** | đổi **chính mạch** |

### Hệ quả: mất điện là mất sạch

Cấu hình nằm trong SRAM → bay hơi. Board phải nạp lại từ Flash QSPI mỗi lần bật nguồn, hoặc nạp tay qua JTAG.

### Cái giá

Mỗi cổng logic phải đi qua LUT và qua các công tắc có transistor truyền. FPGA **chậm hơn và tốn điện hơn ASIC** cùng chức năng khoảng một bậc. Đổi lại: sửa thiết kế trong vài phút thay vì làm lại chip trong vài tháng.

---

## Hard IP vs soft IP

Khái niệm quan trọng, ảnh hưởng tới cách đọc datasheet.

| | Hard IP | Soft IP |
|---|---|---|
| Là gì | khối mạch **cứng** chuyên dụng, khắc sẵn | mạch dựng từ **LUT + FF** |
| Ví dụ | DSP, Block RAM, PLL/MMCM, transceiver GTX, bộ điều khiển PCIe, CPU cứng (Zynq) | bộ cộng, FSM, UART tự viết, soft-core RISC-V |
| Linh hoạt | không đổi được | tuỳ ý |
| Hiệu năng | cao hơn nhiều | thấp hơn |
| Số lượng | cố định trên chip | tuỳ tài nguyên còn lại |

FPGA hiện đại ngày càng nhiều hard IP. Giao tiếp USB-C hay DDR3 tốc độ cao **không thể** làm bằng logic thường — bắt buộc phải có hard IP.

Một số dòng còn nhúng hẳn **CPU cứng** vào trong FPGA (Xilinx Zynq, Intel SoC) để chạy Linux ngay trên chip.

---

## Lịch sử ngắn

| Năm | Sự kiện |
|:-:|---|
| **1985** | **XC2064** — FPGA đầu tiên, Xilinx. 800 cổng, giá \$55 (≈\$145 theo giá hôm nay) |
| 1983 | VHDL ra đời — Bộ Quốc phòng Mỹ, dựa trên ngôn ngữ Ada |
| 2010 | Microsemi mua Actel, \$430 triệu |
| 2015 | **Intel mua Altera, \$16,7 tỉ** |
| 2018 | Microchip mua Microsemi |
| 2020 | **AMD mua Xilinx, \$35 tỉ** |

Để so sánh: XC2064 có **800 cổng**. Chip XC7K325T có ~326.000 logic cell.

### Bốn hãng chính

- **AMD** (Xilinx cũ) — cao cấp: Artix / Kintex / Virtex / Zynq
- **Intel** (Altera cũ) — cao cấp: Cyclone / Arria / Stratix
- **Lattice** — nhỏ, rẻ, tiết kiệm điện. Cộng đồng mã nguồn mở đã dịch ngược được nên có toolchain miễn phí hoàn toàn
- **Microchip** (Microsemi/Actel cũ) — niche, chống bức xạ

Chuyện hai hãng CPU lớn nhất thế giới đều mua hãng FPGA cho thấy xu hướng: gắn một phần logic cấu hình được vào cạnh CPU.

---

## Ba loại chip số

### FPGA vs vi điều khiển

**Vi điều khiển thắng ở:**

- **Giá.** Ngành điện tử tiêu dùng cực nhạy giá. Vi điều khiển có **vô số biến thể** — cần đúng 1 ADC, 2 USB, 30 GPIO thì có con đúng vậy, không trả tiền cho tính năng thừa. FPGA thì tổng quát, và **mạng định tuyến** (routing) để hỗ trợ mọi khả năng chính là thứ đẩy giá lên.
- **Sản lượng.** Mua 10 triệu vi điều khiển rẻ hơn nhiều so với 100.000. FPGA sản xuất số lượng thấp hơn nên đắt hơn mỗi con.
- **Dễ dùng.** Dựng một thiết kế cơ bản trên vi điều khiển mất vài giờ. Trên FPGA phải tự thiết kế gần như mọi thứ.
- **Tiêu thụ điện.** Vi điều khiển tối ưu cho một mục đích nên cực tiết kiệm. FPGA với cả rừng routing **không có cửa** so sánh.

**FPGA thắng ở:**

- **Băng thông.** Hàng trăm Gbps không vấn đề. Vi điều khiển không bao giờ với tới.
- **Số phép tính/giây.** Vi điều khiển có một bộ xử lý, mọi phép tính chui qua đó. FPGA chạy **hàng trăm phép nhân cùng lúc**.
- **Linh hoạt.** Cần 16 giao tiếp ADC? Không vi điều khiển nào trên đời có. FPGA thì được.

### FPGA vs ASIC

| | FPGA | ASIC |
|---|---|---|
| Chi phí ban đầu (NRE) | ~0 | **hàng triệu USD** |
| Giá mỗi con (số lượng lớn) | >\$10 | **<\$1** |
| Sửa lỗi sau khi giao hàng | **được** (nạp lại) | **không** — vứt cả lô |
| Tiêu thụ điện | cao | thấp |
| Tốc độ | nhanh | nhanh hơn chút |
| Linh hoạt | cao | không |
| Thời gian phát triển | tuần–tháng | **năm** |

**Điểm hoà vốn:** vài chục nghìn con trở xuống thì FPGA thắng. Hàng triệu con thì ASIC.

!!! example "Câu chuyện Bitcoin"
    `CPU → FPGA → ASIC`

    Ban đầu đào bằng CPU. Rồi người ta nhận ra FPGA đào tốn ít điện hơn nên lãi hơn. Cuối cùng ASIC đào nhanh hơn và tốn ít điện hơn nữa, đủ để bù chi phí NRE.

    Ngày nay Bitcoin đào gần như hoàn toàn bằng ASIC.

**Hai thứ này đi đôi với nhau.** Công ty muốn làm ASIC thường **dựng prototype bằng FPGA trước**, sửa hết lỗi khi còn rẻ, rồi mới đem đi sản xuất. Code VHDL/Verilog dùng được cho cả hai — không phải viết lại.

Vì ASIC không sửa được, có hẳn một ngành gọi là **verification engineering** chỉ để chứng minh thiết kế đúng trước khi đem đi khắc.

### Bảng tổng hợp

| | FPGA | Vi điều khiển | ASIC |
|---|---|---|---|
| Giá (số lượng ít) | trung bình | **rẻ** | **đắt** |
| Giá (số lượng lớn) | trung bình | **rẻ** | **rẻ** |
| Tốc độ | nhanh | trung bình | **nhanh nhất** |
| Tiêu thụ điện | trung bình | **thấp** | **thấp** |
| Linh hoạt | **cao** | thấp | không |
| Dễ dùng | trung bình | **dễ** | **khó** |

---

## Khi nào dùng FPGA

**Điểm ngọt của FPGA:** sản lượng thấp **và** cần tốc độ cao (băng thông hoặc tính toán) **hoặc** cần giao tiếp độc đáo.

**Nên dùng:**

- Cần song song thật — hàng nghìn phép tính cùng lúc
- Cần độ trễ **xác định từng nanosecond**
- Giao tiếp tốc độ cao qua SerDes (SFP+, PCIe, JESD204)
- Số lượng ít tới trung bình, cần sửa được sau khi giao hàng
- Prototype ASIC

**Không nên dùng:**

- Logic tuần tự phức tạp, nhiều rẽ nhánh → CPU
- Số lượng cực lớn → ASIC
- Chạy pin, cần tiết kiệm điện → vi điều khiển
- Cần làm nhanh, yêu cầu hay đổi → vi điều khiển

Thuật ngữ cho việc cân nhắc này trong kỹ thuật: **trade study**.

---

## Ứng dụng thật

| Lĩnh vực | Vì sao FPGA |
|---|---|
| Viễn thông, trạm phát sóng | định tuyến lưu lượng, xử lý tín hiệu thời gian thực |
| **Giao dịch tài chính tốc độ cao** | nhanh hơn đối thủ vài µs = hàng triệu đô. Thuật toán đổi thì nạp lại |
| **Radar quân sự** | lọc tín hiệu phản xạ, thấy vật nhỏ cách hàng trăm dặm |
| Camera hồng ngoại | xử lý ảnh nhiệt, nhìn trong đêm |
| **Vũ trụ, vệ tinh** | lập trình dự phòng chống lỗi do bức xạ |
| Xử lý ảnh/video | hàng triệu pixel song song, nhiều màn hình 4K |
| **Gia tốc AI** | mạng nơ-ron là bài toán song song khổng lồ |
| Xử lý gói mạng (SmartNIC, firewall) | băng thông + độ trễ xác định |
| Prototype ASIC | chạy thử RTL trước khi tốn triệu đô |

Tóm lại: **bất kỳ bài toán điện tử số nào cần băng thông cao, độ trễ thấp, hoặc năng lực xử lý lớn.**

---

## Verilog vs VHDL

Cả hai gọi chung là **HDL** (*Hardware Description Language*). Nhìn giống ngôn ngữ lập trình nhưng **bản chất khác hẳn** — khi viết HDL, ta đang làm việc trực tiếp với dây, cổng logic và tài nguyên trên chip.

| | Verilog | VHDL |
|---|---|---|
| Ra đời | 1984 | **1983**, Bộ Quốc phòng Mỹ |
| Dựa trên | giống C | **Ada** |
| Tên đầy đủ | — | *VHSIC HDL* (Very High-Speed Integrated Circuit HDL) |
| Kiểu dữ liệu | **lỏng** | **chặt** — độ rộng và kiểu phải khớp chính xác |
| Độ dài code | ngắn hơn | dài hơn (nhiều ép kiểu) |
| Phân biệt hoa/thường | **CÓ** | **KHÔNG** |
| Dễ sai ngầm | dễ hơn | khó hơn — compiler bắt sớm |

!!! danger "Chi tiết dễ cắn"
    Verilog **phân biệt hoa thường** nên `RxDone` và `rxDone` là hai tín hiệu khác nhau — lỗi rất khó tìm.

    VHDL coi chúng là một.

**VHDL chặt kiểu** nghĩa là: cộng hai số phải khớp cả **độ rộng** lẫn **kiểu**, không thì lỗi khó hiểu. Thường phải tạo signal trung gian hoặc ép kiểu nhiều. Đây là lý do VHDL gõ nhiều hơn Verilog cho cùng chức năng.

### Phân bố địa lý

Theo Google Trends:

| Nơi | Thiên về |
|---|---|
| Mỹ — quốc phòng | **VHDL** |
| Mỹ — thương mại | **Verilog** |
| **Đức, Pháp** | **VHDL** rõ rệt |
| **Trung Quốc, Hàn Quốc** | **Verilog** rõ rệt |
| Ấn Độ | ngang nhau |

**Nguyên tắc chọn:** học cái mà **trường hoặc công ty của mình dùng**. Hai ngôn ngữ tương đương về sức mạnh.

Ngoài ra còn **SystemVerilog** — mở rộng của Verilog, dùng nhiều cho verification. Intel/AMD thiết kế CPU bằng nó.

---

## Chip đang có

| | QMTech Core Board | ALINX AX7325B |
|---|---|---|
| Chip | XC7A35T (**Artix-7**) | XC7K325T (**Kintex-7**) |
| Part number | `xc7a35tftg256-1` | `xc7k325tffg900-2` |
| Logic cell | ~33.000 | ~326.000 |
| Clock onboard | **50 MHz**, chân N11 | 200 MHz vi sai (+156.25, +125 MHz) |
| LED | chân E6 | 4 LED, LED1 = A22 |
| Nút | chân K5 | 2 nút active-low, KEY1 = AG27 |
| Reset | chân B7 (active-low) | — |
| IOSTANDARD | LVCMOS33 | tuỳ bank |
| Ngoại vi | DDR3 + daughterboard (7 đoạn, VGA, Ethernet, UART, SD) | 4×SFP+ 10G, QSFP+ 40G, PCIe x8, DDR3 2GB |
| **Vivado bản free** | **có** | **không** — cần Enterprise |
| Thời gian build | 1–3 phút | 15–30 phút |

!!! tip "Kết luận thực dụng"
    Học trên QMTech trước. Build nhanh nên vòng lặp sửa–thử nhanh, học nhanh hơn.

    AX7325B để dành khi nào đụng SFP+ và DDR3.

---

## Tóm tắt một màn hình

- FPGA = mảng logic cấu hình lại được. **Không chạy lệnh, nó LÀ mạch.**
- Phần mềm **tuần tự**, FPGA **song song**. Khác biệt gốc, mọi thứ khác suy ra từ đây.
- `for` = nhân bản mạch. Instantiation = hàn khối mạch. Không phải lặp, không phải gọi hàm.
- Chi phí tính theo **trường hợp xấu nhất**, không phải trung bình.
- Nạp bitstream = ghi vào ô nhớ SRAM cấu hình. Phần cứng không đổi. **Mất điện là mất sạch.**
- Hard IP = mạch cứng chuyên dụng. Soft IP = dựng từ LUT + FF.
- Mọi quyết định thiết kế là đánh đổi **diện tích ↔ thời gian**.
- Vi điều khiển thắng về **giá, điện, dễ dùng**. ASIC thắng về **giá ở sản lượng lớn, điện, tốc độ**. FPGA thắng về **linh hoạt và sản lượng thấp cần tốc độ cao**.
- VHDL **không** phân biệt hoa thường; Verilog **có**.
- FPGA chứa được CPU; CPU không chứa FPGA.

---

## Đọc thêm

- *Getting Started with FPGAs* — Russell Merrick, No Starch Press 2024, chương 1 "Meet the FPGA"
- AX7325B User Manual — alinx.com
- QMTech Artix-7 XC7A35T User Manual (Core Board + Daughter Board)
