# Linux

Sổ tay ghi chép trong quá trình tự học lập trình hệ thống trên Linux.

## Theo sách *Linux Kernel Programming*

Bản dịch tiếng Việt, kèm hình minh họa của sách.

- [**Chương 1 — Giới thiệu nhanh**](linux_kernel_programming/ch01_linux_kernel_programming_a_quick_introduction.vi.md) — dựng kernel workspace, lấy mã nguồn ví dụ của sách
- [**Chương 2 — Build kernel 6.x từ mã nguồn, phần 1**](linux_kernel_programming/ch02_building_the_6_x_linux_kernel_from_source_part_1.vi.md) — lấy và giải nén cây mã nguồn, cấu hình kernel, Kconfig và thêm mục menu riêng
- [**Chương 3 — Build kernel 6.x từ mã nguồn, phần 2**](linux_kernel_programming/ch03_building_the_6_x_linux_kernel_from_source_part_2.vi.md) — build image và module, initramfs, GRUB, build cho Raspberry Pi
- [**Chương 4 — Kernel module đầu tiên, phần 1**](linux_kernel_programming/ch04_writing_your_first_kernel_module_part_1.vi.md) — kiến trúc kernel, LKM, `printk` và kernel log, Makefile cho module
- [**Chương 5 — Kernel module đầu tiên, phần 2**](linux_kernel_programming/ch05_writing_your_first_kernel_module_part_2.vi.md) — cross-compile, giấy phép module, tham số module, tự load khi boot, bảo mật, coding style
- [**Chương 6 — Tiến trình và luồng trong kernel**](linux_kernel_programming/ch06_kernel_internals_essentials_processes_and_threads.vi.md) — process và interrupt context, VAS, stack user/kernel, `task_struct` và `current`, duyệt task list
- [**Chương 7 — Quản lý bộ nhớ bên trong kernel**](linux_kernel_programming/ch07_memory_management_internals_essentials.vi.md) — VM split, VAS của tiến trình và kernel, KASLR, tổ chức bộ nhớ vật lý
- [**Chương 8 — Cấp phát bộ nhớ trong kernel, phần 1**](linux_kernel_programming/ch08_kernel_memory_allocation_for_module_authors_part_1.vi.md) — page allocator, slab allocator, giới hạn của `kmalloc`
- [**Chương 9 — Cấp phát bộ nhớ trong kernel, phần 2**](linux_kernel_programming/ch09_kernel_memory_allocation_for_module_authors_part_2.vi.md) — custom slab cache, `vmalloc()`, chọn API cấp phát, memory reclaim, OOM killer
- [**Chương 10 — CPU scheduler, phần 1**](linux_kernel_programming/ch10_the_cpu_scheduler_part_1.vi.md) — cơ chế lập lịch, trực quan hóa luồng thực thi, policy và priority của thread
- [**Chương 11 — CPU scheduler, phần 2**](linux_kernel_programming/ch11_the_cpu_scheduler_part_2.vi.md) — CPU affinity, đặt policy và priority, cgroup, chạy Linux như RTOS
- [**Chương 12 — Đồng bộ hóa trong kernel, phần 1**](linux_kernel_programming/ch12_kernel_synchronization_part_1.vi.md) — critical section, mutex vs spinlock, locking và interrupt, lỗi thường gặp
- [**Chương 13 — Đồng bộ hóa trong kernel, phần 2**](linux_kernel_programming/ch13_kernel_synchronization_part_2.vi.md) — `atomic_t`/`refcount_t`, reader-writer spinlock, false sharing, per-CPU và RCU, memory barrier
