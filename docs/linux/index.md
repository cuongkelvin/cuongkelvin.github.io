# Linux

Sổ tay ghi chép trong quá trình tự học lập trình hệ thống trên Linux.

## Theo sách *The Linux Programming Interface*

Bản dịch tiếng Việt, giữ thuật ngữ gốc tiếng Anh ở những chỗ quen dùng.

- [**Chương 1 — Lịch sử và các tiêu chuẩn**](the-linux-programming-interface/ch01_history_and_standards_vi.md) — nguồn gốc UNIX và C, BSD vs System V, dự án GNU và Linux kernel, POSIX, SUSv3/SUSv4, Linux Standard Base
- [**Chương 2 — Các khái niệm cơ bản**](the-linux-programming-interface/ch02_fundamental_concepts_vi.md) — kernel và shell, user/group, cây thư mục và link, file descriptor, tiến trình, memory mapping, thư viện tĩnh/chia sẻ, IPC, signal, thread, session và terminal, `/proc`
- [**Chương 3 — Các khái niệm lập trình hệ thống**](the-linux-programming-interface/ch03_system_programming_concepts_vi.md) — system call vs hàm thư viện, glibc, xử lý lỗi và `errno`, các hàm dùng chung trong ví dụ của sách, feature test macro, kiểu dữ liệu hệ thống, tính di động
- [**Chương 4 — File I/O: mô hình I/O phổ quát**](the-linux-programming-interface/ch04_file_io_the_universal_io_model_vi.md) — `open()` và các cờ `O_*`, lỗi khi mở file, `read()`/`write()`/`close()`, `lseek()` và file hole, `ioctl()`
