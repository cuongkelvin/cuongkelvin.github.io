# Computer Science

Sổ tay ghi chép về nền tảng khoa học máy tính: thiết kế số và kiến trúc máy tính.

## Theo sách *Digital Design and Computer Architecture: RISC-V Edition*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Đi từ cổng logic tới một bộ xử lý RISC-V hoàn chỉnh.

- [**Chương 1 — Từ 0 đến 1**](digital_design_and_computer_architecture/ch01_from_zero_to_one.vi.md) — trừu tượng số, hệ đếm, cổng logic, transistor CMOS, công suất tiêu thụ
- [**Chương 2 — Thiết kế logic tổ hợp**](digital_design_and_computer_architecture/ch02_combinational_logic_design.vi.md) — phương trình và đại số Boolean, logic nhiều tầng, giá trị X và Z, bìa Karnaugh, timing
- [**Chương 3 — Thiết kế logic tuần tự**](digital_design_and_computer_architecture/ch03_sequential_logic_design.vi.md) — latch và flip-flop, thiết kế đồng bộ, máy trạng thái hữu hạn, timing, song song
- [**Chương 4 — Ngôn ngữ mô tả phần cứng**](digital_design_and_computer_architecture/ch04_hardware_description_languages.vi.md) — mô tả logic tổ hợp và tuần tự, mô hình cấu trúc, FSM, module tham số hóa, testbench
- [**Chương 5 — Các khối xây dựng số**](digital_design_and_computer_architecture/ch05_digital_building_blocks.vi.md) — mạch số học, biểu diễn số, khối tuần tự, mảng bộ nhớ, mảng logic
- [**Chương 6 — Kiến trúc**](digital_design_and_computer_architecture/ch06_architecture.vi.md) — hợp ngữ và mã máy RISC-V, lập trình, sự phát triển của RISC-V, so sánh với x86
- [**Chương 7 — Vi kiến trúc**](digital_design_and_computer_architecture/ch07_microarchitecture.vi.md) — phân tích hiệu năng, bộ xử lý single-cycle, multicycle và pipeline, vi kiến trúc nâng cao
- [**Chương 8 — Hệ thống bộ nhớ**](digital_design_and_computer_architecture/ch08_memory_systems.vi.md) — phân tích hiệu năng bộ nhớ, cache, virtual memory
- [**Chương 9 — Hệ thống I/O nhúng**](digital_design_and_computer_architecture/ch09_embedded_i_o_systems.vi.md) — memory-mapped I/O, I/O trên hệ nhúng, ngoại vi của vi điều khiển
- [**Phụ lục A — Hiện thực hệ thống số**](digital_design_and_computer_architecture/chA_digital_system_implementation.vi.md) — logic 74xx, logic khả trình, ASIC, datasheet, các họ logic, đóng gói, đường truyền
- [**Phụ lục B — Tóm tắt tập lệnh RISC-V**](digital_design_and_computer_architecture/chB_risc_v_instruction_set_summary.vi.md) — bảng tra nhanh tập lệnh
- [**Phụ lục C — Lập trình C**](digital_design_and_computer_architecture/chC_c_programming.vi.md) — nhập môn C dành cho người thiết kế phần cứng: biên dịch, biến, toán tử và hơn nữa

## Theo sách *Computer Organization and Design: RISC-V Edition*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Giải thích máy tính được tổ chức thế nào, từ tập lệnh tới pipeline, bộ nhớ và xử lý song song.

- [**Chương 1 — Trừu tượng hóa và công nghệ**](computer_organization_and_design_riscv/ch01_computer_abstractions_and_technology.vi.md) — tám ý tưởng lớn, bên trong máy tính, công nghệ chế tạo, đo hiệu năng, power wall, chuyển sang đa nhân
- [**Chương 2 — Tập lệnh**](computer_organization_and_design_riscv/ch02_instructions_language_of_the_computer.vi.md) — phép toán và toán hạng, số có dấu, mã hóa lệnh RISC-V, rẽ nhánh, gọi hàm
- [**Chương 3 — Số học**](computer_organization_and_design_riscv/ch03_arithmetic_for_computers.vi.md) — cộng, trừ, nhân, chia, dấu chấm động, tính toán song song trên dữ liệu con
- [**Chương 4 — Bộ xử lý**](computer_organization_and_design_riscv/ch04_the_processor.vi.md) — xây dựng datapath, pipeline, data hazard và forwarding, control hazard
- [**Chương 5 — Phân cấp bộ nhớ**](computer_organization_and_design_riscv/ch05_large_and_fast_exploiting_memory_hierarchy.vi.md) — công nghệ bộ nhớ, cache, đo và cải thiện hiệu năng cache, máy ảo, virtual memory
- [**Chương 6 — Bộ xử lý song song**](computer_organization_and_design_riscv/ch06_parallel_processors_from_client_to_cloud.vi.md) — phân loại SISD, SIMD, MIMD, đa luồng phần cứng, đa nhân, GPU, cluster và mạng kết nối
- [**Phụ lục A — Cơ bản về thiết kế logic**](computer_organization_and_design_riscv/appA_the_basics_of_logic_design.vi.md) — cổng logic, logic tổ hợp, mạch số học, clock, flip-flop và phần tử nhớ
- [**Phụ lục B — Đồ họa và GPU**](computer_organization_and_design_riscv/appB_graphics_and_computing_gpus.vi.md) — kiến trúc và lập trình GPU, hệ thống bộ nhớ, ví dụ thực tế
- [**Phụ lục C — Ánh xạ điều khiển sang phần cứng**](computer_organization_and_design_riscv/appC_mapping_control_to_hardware.vi.md) — hiện thực khối điều khiển bằng logic tổ hợp và vi chương trình
- [**Phụ lục D — Khảo sát kiến trúc RISC**](computer_organization_and_design_riscv/appD_a_survey_of_risc_architectures.vi.md) — so sánh chế độ địa chỉ, định dạng lệnh và lệnh riêng của các kiến trúc RISC
- [**Thuật ngữ**](computer_organization_and_design_riscv/glossary.vi.md) — bảng thuật ngữ của sách
- [**Đáp án phần tự kiểm tra**](computer_organization_and_design_riscv/answers_to_check_yourself.vi.md) — đáp án các câu hỏi tự kiểm tra theo từng chương
