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

## Theo sách *Linux Kernel Programming Part 2*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Tập trung vào character device driver và đồng bộ hóa.

- [**Chương 1 — Misc character device driver đơn giản**](linux_kernel_programming_part_2/ch01_writing_a_simple_misc_character_device_driver.vi.md) — viết misc driver, chép dữ liệu giữa kernel và user space, lưu ý bảo mật
- [**Chương 2 — Giao tiếp user-kernel**](linux_kernel_programming_part_2/ch02_user_kernel_communication_pathways.vi.md) — procfs, sysfs, debugfs, netlink socket, `ioctl`, bảng so sánh các cách
- [**Chương 3 — Hardware I/O memory**](linux_kernel_programming_part_2/ch03_working_with_hardware_i_o_memory.vi.md) — truy cập vùng nhớ phần cứng, memory-mapped I/O và port-mapped I/O
- [**Chương 4 — Xử lý hardware interrupt**](linux_kernel_programming_part_2/ch04_handling_hardware_interrupts.vi.md) — cấp phát IRQ, viết interrupt handler, threaded interrupt, top half và bottom half
- [**Chương 5 — Kernel timer, thread và workqueue**](linux_kernel_programming_part_2/ch05_working_with_kernel_timers_threads_and_workqueues.vi.md) — delay trong kernel, kernel timer, kernel thread, workqueue
- [**Chương 6 — Đồng bộ hóa trong kernel, phần 1**](linux_kernel_programming_part_2/ch06_kernel_synchronization_part_1.vi.md) — critical section, mutex vs spinlock, locking và interrupt
- [**Chương 7 — Đồng bộ hóa trong kernel, phần 2**](linux_kernel_programming_part_2/ch07_kernel_synchronization_part_2.vi.md) — `atomic_t`/`refcount_t`, reader-writer spinlock, false sharing, per-CPU, lock debugging, memory barrier

## Theo sách *Understanding the Linux Kernel*

Bản dịch tiếng Việt, kèm hình minh họa của sách.

- [**Chương 1 — Giới thiệu**](understanding_the_linux_kernel/ch01_introduction.vi.md) — Linux so với các kernel Unix-like khác, khái niệm hệ điều hành, tổng quan filesystem và kernel Unix
- [**Chương 2 — Đánh địa chỉ bộ nhớ**](understanding_the_linux_kernel/ch02_memory_addressing.vi.md) — segmentation và paging, ở mức phần cứng và trong Linux
- [**Chương 3 — Tiến trình**](understanding_the_linux_kernel/ch03_processes.vi.md) — process, lightweight process và thread, process descriptor, process switch, tạo và hủy process
- [**Chương 4 — Interrupt và exception**](understanding_the_linux_kernel/ch04_interrupts_and_exceptions.vi.md) — IDT, xử lý exception và interrupt, softirq, tasklet, work queue
- [**Chương 5 — Đồng bộ hóa trong kernel**](understanding_the_linux_kernel/ch05_kernel_synchronization.vi.md) — các primitive đồng bộ, bảo vệ cấu trúc dữ liệu kernel, ví dụ chống race condition
- [**Chương 6 — Đo thời gian**](understanding_the_linux_kernel/ch06_timing_measurements.vi.md) — mạch clock và timer, kiến trúc timekeeping, software timer, system call về thời gian
- [**Chương 7 — Lập lịch tiến trình**](understanding_the_linux_kernel/ch07_process_scheduling.vi.md) — policy và thuật toán lập lịch, runqueue, cân bằng tải trên đa xử lý
- [**Chương 8 — Quản lý bộ nhớ**](understanding_the_linux_kernel/ch08_memory_management.vi.md) — quản lý page frame, memory area liên tục và không liên tục
- [**Chương 9 — Không gian địa chỉ tiến trình**](understanding_the_linux_kernel/ch09_process_address_space.vi.md) — memory descriptor, memory region, page fault handler, heap
- [**Chương 10 — System call**](understanding_the_linux_kernel/ch10_system_calls.vi.md) — POSIX API, handler và service routine, vào và ra system call, truyền tham số
- [**Chương 11 — Signal**](understanding_the_linux_kernel/ch11_signals.vi.md) — tạo và chuyển giao signal, system call liên quan
- [**Chương 12 — Virtual Filesystem**](understanding_the_linux_kernel/ch12_the_virtual_filesystem.vi.md) — cấu trúc dữ liệu VFS, loại filesystem, pathname lookup, file locking
- [**Chương 13 — Kiến trúc I/O và device driver**](understanding_the_linux_kernel/ch13_i_o_architecture_and_device_drivers.vi.md) — device driver model, device file, character device driver
- [**Chương 14 — Block device driver**](understanding_the_linux_kernel/ch14_block_device_drivers.vi.md) — generic block layer, I/O scheduler, mở block device file
- [**Chương 15 — Page cache**](understanding_the_linux_kernel/ch15_the_page_cache.vi.md) — lưu block trong page cache, ghi dirty page xuống đĩa, `sync()` và `fsync()`
- [**Chương 16 — Truy cập file**](understanding_the_linux_kernel/ch16_accessing_files.vi.md) — đọc ghi file, memory mapping, direct I/O, asynchronous I/O
- [**Chương 17 — Thu hồi page frame**](understanding_the_linux_kernel/ch17_page_frame_reclaiming.vi.md) — thuật toán PFRA, reverse mapping, swapping
- [**Chương 18 — Filesystem Ext2 và Ext3**](understanding_the_linux_kernel/ch18_the_ext2_and_ext3_filesystems.vi.md) — cấu trúc dữ liệu trên đĩa và trong bộ nhớ, quản lý không gian đĩa, journaling của Ext3
- [**Chương 19 — Giao tiếp giữa tiến trình**](understanding_the_linux_kernel/ch19_process_communication.vi.md) — pipe, FIFO, System V IPC, POSIX message queue
- [**Chương 20 — Thực thi chương trình**](understanding_the_linux_kernel/ch20_program_execution.vi.md) — định dạng file thực thi, execution domain, họ hàm `exec`
