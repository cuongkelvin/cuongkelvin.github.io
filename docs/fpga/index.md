# FPGA

Sổ tay ghi chép trong quá trình tự học FPGA và VHDL, từ nền lập trình phần mềm chuyển sang.

## Theo sách *Getting Started with FPGAs*

Bản dịch kèm ghi chú riêng, bổ sung các ví dụ VHDL cụ thể và thông số phần cứng đang dùng.

- [**Chương 1 — Gặp gỡ FPGA**](01-gap-go-fpga.md) — tư duy song song vs tuần tự, cơ chế nạp bitstream, so sánh FPGA / vi điều khiển / ASIC, Verilog vs VHDL
- [**Chương 3 — Đại số Boolean và bảng tra LUT**](03-dai-so-boolean-va-lut.md) — các cổng logic, toán tử trong VHDL và luật ưu tiên, bên trong một LUT-6

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
