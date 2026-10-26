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

## Theo sách *Computer Systems: A Programmer's Perspective*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Nhìn hệ thống máy tính từ phía lập trình viên: dữ liệu, mã máy, bộ nhớ, liên kết, tiến trình và I/O.

- [**Chương 1 — Một vòng quanh hệ thống máy tính**](computer_systems_a_programmers_perspective/ch01_a_tour_of_computer_systems.vi.md) — tổng quan đường đi của một chương trình từ mã nguồn tới khi chạy
- [**Chương 2 — Biểu diễn thông tin**](computer_systems_a_programmers_perspective/ch02_representing_and_manipulating_information.vi.md) — số nguyên có dấu và không dấu, phép toán bit, dấu chấm động
- [**Chương 3 — Chương trình ở mức máy**](computer_systems_a_programmers_perspective/ch03_machine_level_representation_of_programs.vi.md) — hợp ngữ x86-64, điều khiển luồng, hàm, mảng và struct
- [**Chương 4 — Kiến trúc bộ xử lý**](computer_systems_a_programmers_perspective/ch04_processor_architecture.vi.md) — tập lệnh Y86-64, thiết kế bộ xử lý tuần tự và pipeline
- [**Chương 5 — Tối ưu hiệu năng chương trình**](computer_systems_a_programmers_perspective/ch05_optimizing_program_performance.vi.md) — cách viết code để trình biên dịch và CPU chạy nhanh hơn
- [**Chương 6 — Phân cấp bộ nhớ**](computer_systems_a_programmers_perspective/ch06_the_memory_hierarchy.vi.md) — công nghệ lưu trữ, tính cục bộ, cache và ảnh hưởng tới hiệu năng
- [**Chương 7 — Liên kết**](computer_systems_a_programmers_perspective/ch07_linking.vi.md) — symbol, relocation, thư viện tĩnh và động
- [**Chương 8 — Luồng điều khiển ngoại lệ**](computer_systems_a_programmers_perspective/ch08_exceptional_control_flow.vi.md) — exception, tiến trình, signal
- [**Chương 9 — Bộ nhớ ảo**](computer_systems_a_programmers_perspective/ch09_virtual_memory.vi.md) — dịch địa chỉ, ánh xạ bộ nhớ, cấp phát động
- [**Chương 10 — I/O mức hệ thống**](computer_systems_a_programmers_perspective/ch10_system_level_io.vi.md) — Unix I/O, file descriptor, I/O có đệm
- [**Chương 11 — Lập trình mạng**](computer_systems_a_programmers_perspective/ch11_network_programming.vi.md) — mô hình client-server, socket, một web server nhỏ
- [**Chương 12 — Lập trình đồng thời**](computer_systems_a_programmers_perspective/ch12_concurrent_programming.vi.md) — tiến trình, I/O multiplexing, thread, đồng bộ hóa
- [**Phụ lục A — Xử lý lỗi**](computer_systems_a_programmers_perspective/appA_error_handling.vi.md) — các hàm bọc xử lý lỗi dùng trong sách

## Theo sách *Computer Architecture: A Quantitative Approach*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Kiến trúc máy tính nhìn qua con số: đo, so sánh và khai thác song song ở mọi tầng.

- [**Chương 1 — Nền tảng thiết kế định lượng**](computer_architecture_a_quantitative_approach/ch01_fundamentals_of_quantitative_design_and_analysis.vi.md) — xu hướng công nghệ, năng lượng, chi phí, đo và báo cáo hiệu năng
- [**Chương 2 — Thiết kế phân cấp bộ nhớ**](computer_architecture_a_quantitative_approach/ch02_memory_hierarchy_design.vi.md) — tối ưu cache nâng cao, công nghệ bộ nhớ, bộ nhớ ảo và máy ảo
- [**Chương 3 — Song song mức lệnh**](computer_architecture_a_quantitative_approach/ch03_instruction_level_parallelism_and_its_exploitation.vi.md) — lập lịch động, dự đoán rẽ nhánh, thực thi suy đoán, đa phát lệnh
- [**Chương 4 — Song song mức dữ liệu**](computer_architecture_a_quantitative_approach/ch04_data_level_parallelism_in_vector_simd_and_gpu_architectures.vi.md) — kiến trúc vector, SIMD và GPU
- [**Chương 5 — Song song mức luồng**](computer_architecture_a_quantitative_approach/ch05_thread_level_parallelism.vi.md) — đa xử lý bộ nhớ chia sẻ, cache coherence, đồng bộ hóa
- [**Chương 6 — Máy tính quy mô kho dữ liệu**](computer_architecture_a_quantitative_approach/ch06_warehouse_scale_computers.vi.md) — kiến trúc, chi phí và hiệu quả của các trung tâm dữ liệu lớn
- [**Phụ lục A–K**](computer_architecture_a_quantitative_approach/appA_instruction_set_principles.vi.md) — nguyên lý tập lệnh, ôn tập bộ nhớ, pipeline, lưu trữ, hệ nhúng, mạng kết nối, vector, VLIW, đa xử lý lớn, số học, khảo sát các ISA

## Theo sách *Operating Systems: Three Easy Pieces*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Hệ điều hành chia thành ba mảnh lớn: ảo hóa, đồng thời và lưu trữ bền vững.

- [**Mở đầu**](operating_systems_three_easy_pieces/ch01_a_dialogue_on_the_book.vi.md) — đối thoại giới thiệu sách và tổng quan về hệ điều hành
- [**Phần I — Ảo hóa**](operating_systems_three_easy_pieces/ch03_a_dialogue_on_virtualization.vi.md) — tiến trình, lập lịch CPU, không gian địa chỉ, phân đoạn, phân trang, TLB, swap (chương 3–24)
- [**Phần II — Đồng thời**](operating_systems_three_easy_pieces/ch25_a_dialogue_on_concurrency.vi.md) — thread, lock, condition variable, semaphore, lỗi đồng thời thường gặp, lập trình hướng sự kiện (chương 25–34)
- [**Phần III — Lưu trữ bền vững**](operating_systems_three_easy_pieces/ch35_a_dialogue_on_persistence.vi.md) — thiết bị I/O, ổ đĩa, RAID, file system, journaling, LFS, toàn vẹn dữ liệu (chương 35–45)
- [**Hệ phân tán**](operating_systems_three_easy_pieces/ch46_a_dialogue_on_distribution.vi.md) — hệ phân tán cơ bản, NFS, AFS (chương 46–50)
- [**Phụ lục A–I**](operating_systems_three_easy_pieces/appA_a_dialogue_on_virtual_machine_monitors.vi.md) — máy ảo, monitor, bài lab, SSD dựa trên flash
