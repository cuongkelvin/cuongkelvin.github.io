# FPGA

Sổ tay ghi chép trong quá trình tự học FPGA và VHDL, từ nền phần mềm chuyển sang.

Viết để **đọc lại cho nhớ** — nên nhiều bảng, mỗi ý một dòng, quy tắc in đậm.

## Nền tảng

- [**FPGA là gì**](01-fpga-la-gi.md) — song song vs tuần tự, cấu hình lại được nghĩa là gì, so sánh với vi điều khiển và ASIC, Verilog vs VHDL

## Phần cứng đang dùng

| | QMTech Core Board | ALINX AX7325B |
|---|---|---|
| Chip | XC7A35T (Artix-7) | XC7K325T (Kintex-7) |
| Part number | `xc7a35tftg256-1` | `xc7k325tffg900-2` |
| Vivado bản free | có | không |

## Công cụ

- **GHDL + GTKWave** — mô phỏng trên Ubuntu. Máy này thiếu `numeric_std` bản v08 nên **không dùng `--std=08`**
- **Vivado ML Standard** — tổng hợp và nạp bitstream

## Nguồn tham khảo

- *Getting Started with FPGAs* — Russell Merrick, No Starch Press 2024
- AX7325B User Manual — alinx.com
- QMTech Artix-7 XC7A35T User Manual
