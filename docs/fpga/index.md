# FPGA

Sổ tay ghi chép trong quá trình tự học FPGA và VHDL, từ nền lập trình phần mềm chuyển sang.

## Theo sách *Getting Started with FPGAs*

Bản dịch kèm ghi chú riêng, bổ sung các ví dụ VHDL cụ thể và thông số phần cứng đang dùng.

- [**Chương 1 — Gặp gỡ FPGA**](getting-started-with-fpgas/01-gap-go-fpga.md) — tư duy song song vs tuần tự, cơ chế nạp bitstream, so sánh FPGA / vi điều khiển / ASIC, Verilog vs VHDL
- [**Chương 3 — Đại số Boolean và bảng tra LUT**](getting-started-with-fpgas/03-dai-so-boolean-va-lut.md) — các cổng logic, toán tử trong VHDL và luật ưu tiên, bên trong một LUT-6
- [**Chương 4 — Lưu trữ trạng thái bằng flip-flop**](getting-started-with-fpgas/04-luu-tru-trang-thai-flip-flop.md) — xung nhịp, phát hiện cạnh, latch, reset, metastability, `signal` vs `variable`, kiến trúc CLB/slice
- [**Chương 5 — Kiểm tra mã nguồn bằng mô phỏng**](getting-started-with-fpgas/05-kiem-tra-ma-nguon-bang-mo-phong.md) — testbench, GHDL + GTKWave, lọc dội phím, `assert` và bốn mức severity, mô hình tham chiếu, `'U'` vs `'X'`
- [**Chương 6 — Các module FPGA phổ biến**](getting-started-with-fpgas/06-cac-module-fpga-pho-bien.md) — mux/demux, thanh ghi dịch, LFSR và bộ đếm, RAM hai cổng, FIFO với cờ Full/Empty/AF/AE
- [**Chương 7 — Synthesis, Place & Route và chuyển vùng xung nhịp**](getting-started-with-fpgas/07-synthesis-place-route-clock-domains.md) — mã không tổng hợp được, `for` vs bộ đếm, setup/hold, metastability, slack, pipelining, double-flop, CDC, FIFO hai xung nhịp
- [**Chương 8 — Máy trạng thái**](getting-started-with-fpgas/08-may-trang-thai.md) — trạng thái / chuyển tiếp / sự kiện, FSM một khối vs hai khối, bốn quy tắc, game trí nhớ kiểu Simon với LED 7 đoạn — mô phỏng chơi thật bằng GHDL
- [**Chương 9 — Các thành phần chuyên dụng (primitives)**](getting-started-with-fpgas/09-cac-thanh-phan-chuyen-dung-primitives.md) — inference / instantiation / GUI, Block RAM, khối DSP và số dấu chấm tĩnh, PLL/MMCM, tín hiệu `locked`
- [**Chương 10 — Số và phép toán**](getting-started-with-fpgas/10-so-va-phep-toan.md) — signed/unsigned, bù 2, định cỡ, chuyển kiểu VHDL, sáu quy tắc vàng cho cộng/trừ/nhân/chia, số dấu chấm tĩnh — 24 ví dụ của sách chạy lại bằng GHDL
- [**Chương 11 — Vào/ra: GPIO, DDR và SerDes**](getting-started-with-fpgas/11-io-gpio-serdes.md) — đệm I/O và OE, chân hai chiều `inout`/`'Z'`, điện áp bank, drive/slew, vi sai LVDS, ODDR, song song vs nối tiếp, mã Manchester, cách SerDes hoạt động

## Theo sách *Free Range VHDL*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Nhập môn VHDL ngắn gọn, tập trung vào cách nghĩ theo phần cứng.

- [**Chương 0 — Mục đích của sách**](free_range_vhdl/ch00_purpose_of_this_book.vi.md) — sách viết cho ai và nên đọc thế nào
- [**Chương 1 — Giới thiệu VHDL**](free_range_vhdl/ch01_introduction_to_vhdl.vi.md) — VHDL là gì, dùng để làm gì
- [**Chương 2 — Những điều bất biến của VHDL**](free_range_vhdl/ch02_vhdl_invariants.vi.md) — quy tắc cú pháp chung: phân biệt hoa thường, khoảng trắng, chú thích, đặt tên
- [**Chương 3 — Đơn vị thiết kế**](free_range_vhdl/ch03_vhdl_design_units.vi.md) — `entity` và `architecture`
- [**Chương 4 — Cách lập trình VHDL**](free_range_vhdl/ch04_vhdl_programming_paradigm.vi.md) — câu lệnh đồng thời, gán tín hiệu, `process`
- [**Chương 5 — Các kiểu mô tả architecture**](free_range_vhdl/ch05_standard_models_in_vhdl_architectures.vi.md) — mô tả data-flow, hành vi và cấu trúc
- [**Chương 6 — Toán tử**](free_range_vhdl/ch06_vhdl_operators.vi.md) — toán tử logic, quan hệ, số học, dịch bit
- [**Chương 7 — Mạch tuần tự**](free_range_vhdl/ch07_using_vhdl_for_sequential_circuits.vi.md) — flip-flop, cạnh xung nhịp, reset
- [**Chương 8 — Thiết kế máy trạng thái**](free_range_vhdl/ch08_finite_state_machine_design_using_vhdl.vi.md) — FSM kiểu Moore và Mealy
- [**Chương 9 — Mô hình cấu trúc**](free_range_vhdl/ch09_structural_modeling_in_vhdl.vi.md) — `component`, ghép nối module theo cấp
- [**Chương 10 — Thanh ghi và RTL**](free_range_vhdl/ch10_registers_and_register_transfer_level.vi.md) — thanh ghi và tư duy mức chuyển thanh ghi
- [**Chương 11 — Đối tượng dữ liệu**](free_range_vhdl/ch11_data_objects.vi.md) — `signal`, `variable`, `constant` và kiểu dữ liệu
- [**Chương 12 — Vòng lặp**](free_range_vhdl/ch12_looping_constructs.vi.md) — `for` và `while` trong VHDL
- [**Chương 13 — Mạch số chuẩn**](free_range_vhdl/ch13_standard_digital_circuits_in_vhdl.vi.md) — mô tả các mạch số thông dụng bằng VHDL
- [**Phụ lục A–E**](free_range_vhdl/appA_vhdl_reserved_words.vi.md) — từ khóa, package chuẩn, lời giải bài tập, thẻ tra cứu nhanh, người đóng góp

## Theo sách *Fundamentals of VHDL* (Pakdel)

Bản dịch tiếng Việt, kèm hình minh họa của sách. Học VHDL qua các dự án thực hành trên Vivado, đến cả machine learning trên FPGA.

- [**Chương 0 — Lời nói đầu**](fundamentals_of_vhdl_pakdel/ch00_preface.vi.md) — giới thiệu sách
- [**Chương 1 — Tổng quan**](fundamentals_of_vhdl_pakdel/ch01_overview.vi.md) — tổng quan FPGA và VHDL
- [**Chương 2 — Tạo project trong Vivado**](fundamentals_of_vhdl_pakdel/ch02_creating_a_project_in_vivado.vi.md) — các bước tạo và cấu hình project
- [**Chương 3 — Cấu trúc thiết kế VHDL**](fundamentals_of_vhdl_pakdel/ch03_the_vhdl_design_structure.vi.md) — khung một thiết kế VHDL
- [**Chương 4 — Câu lệnh và kiểu dữ liệu**](fundamentals_of_vhdl_pakdel/ch04_the_vhdl_statements_and_data_types.vi.md) — các câu lệnh và kiểu dữ liệu chính
- [**Chương 5 — Mô phỏng trong Vivado**](fundamentals_of_vhdl_pakdel/ch05_the_simulations_in_vivado.vi.md) — viết testbench và chạy mô phỏng
- [**Chương 6–8 — Dự án nút bấm và LED**](fundamentals_of_vhdl_pakdel/ch06_the_buttons_and_leds_project.vi.md) — nút bấm và LED, nháy LED, điều chỉnh độ sáng LED
- [**Chương 9–10 — Dự án UART**](fundamentals_of_vhdl_pakdel/ch09_the_uart_demonstration_project.vi.md) — giao tiếp UART, vào ra và truy cập thanh ghi qua UART
- [**Chương 11–12 — Dự án ADC và SPI**](fundamentals_of_vhdl_pakdel/ch11_the_adc_processing_project.vi.md) — xử lý tín hiệu ADC, giao tiếp SPI
- [**Chương 13 — Một số dự án khác**](fundamentals_of_vhdl_pakdel/ch13_some_miscellaneous_projects_with_vivado.vi.md) — các dự án nhỏ khác trên Vivado
- [**Chương 14–15 — Sinh VHDL từ Simulink**](fundamentals_of_vhdl_pakdel/ch14_generating_vhdl_code_using_simulink_hdl_coder.vi.md) — HDL Coder và sinh mã từ lưu đồ Simulink
- [**Chương 16–18 — Machine learning trên FPGA**](fundamentals_of_vhdl_pakdel/ch16_machine_learning_regression_model_on_fpga.vi.md) — mô hình hồi quy, phân loại nhị phân, triển khai mạng nơ-ron sâu

## Phần cứng đang dùng

| | QMTech Core Board | ALINX AX7325B |
|---|---|---|
| Chip | XC7A35T (Artix-7) | XC7K325T (Kintex-7) |
| Part number | `xc7a35tftg256-1` | `xc7k325tffg900-2` |
| Vivado bản miễn phí | có | không |

## Công cụ

- **GHDL + GTKWave** — mô phỏng trên Ubuntu. Máy hiện tại thiếu `numeric_std` bản v08 nên **không dùng `--std=08`**
- **Vivado ML Standard** — tổng hợp và nạp bitstream

## Nguồn tham khảo

- *Getting Started with FPGAs* — Russell Merrick, No Starch Press 2024
- AX7325B User Manual — alinx.com
- QMTech Artix-7 XC7A35T User Manual
