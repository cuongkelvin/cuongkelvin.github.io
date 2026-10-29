# Linux

Sổ tay ghi chép trong quá trình tự học lập trình hệ thống trên Linux.

## Lộ trình đọc

Thứ tự đọc đề xuất: kernel, rồi driver, rồi network, rồi embedded, cuối cùng là Yocto. Đọc bản tiếng Việt; khi cần đối chiếu thì mở bản gốc tiếng Anh.

```
Kernel     1. Kaiwan LKP 2e          →  2. ULK3
Driver     3. Kaiwan LKP Part 2      →  4. Madieu 2022
Network    5. Benvenuti (cả cuốn)    →  6. Rosen  →  7. Network driver
Embedded   8. Embedded Linux Primer  →  9. Mastering Embedded Linux Development 4e
Yocto     10. ELDUYP 3e              → 11. Giometti 2025  →  12. Cookbook 2e (tra cứu)
```

| Bước | Giai đoạn | Sách | Đọc để nắm |
|---|---|---|---|
| 1 | Kernel | [Linux Kernel Programming 2e](linux_kernel_programming/ch01_linux_kernel_programming_a_quick_introduction.vi.md) | Build kernel, viết module, process và thread, bộ nhớ, scheduler, đồng bộ hóa trên kernel mới |
| 2 | Kernel | [Understanding the Linux Kernel 3e](understanding_the_linux_kernel/ch01_introduction.vi.md) | Cơ chế bên trong kernel ở mức sâu: địa chỉ bộ nhớ, process, interrupt, scheduling, VFS, page cache, IPC |
| 3 | Driver | [Linux Kernel Programming Part 2](linux_kernel_programming_part_2/ch01_writing_a_simple_misc_character_device_driver.vi.md) | Char driver, giao tiếp user space và kernel, I/O memory, interrupt, timer, workqueue |
| 4 | Driver | [Linux Device Driver Development 2e](linux_device_driver_development/ch01_introduction_to_kernel_development.vi.md) | Platform driver, device tree, I2C, SPI, regmap, DMA |
| 5 | Network | [Understanding Linux Network Internals](understanding_linux_network_internals_book/ch01_introduction.vi.md) | `sk_buff`, `net_device`, khởi tạo device, NAPI, nhận và gửi frame, protocol handler, bridging |
| 6 | Network | [Linux Kernel Networking](linux_kernel_networking_book/ch01_introduction.vi.md) | Netlink, IPv4, IPv6, routing, neighbouring, Netfilter, IPsec, TCP và UDP |
| 7 | Network | [Network device driver](network_device_drivers/ldd3_ch17/ch17_network_drivers.vi.md) | Viết network driver, thứ tự đọc ở ghi chú bên dưới |
| 8 | Embedded | [Embedded Linux Primer 2e](embedded_linux_primer_book/ch01_introduction.vi.md) | Khởi động kernel và user space, bootloader, file system, MTD, BusyBox, debug, real-time, USB, udev |
| 9 | Embedded | [Mastering Embedded Linux Development 4e](mastering_embedded_linux_programming_book/ch01_starting_out.vi.md) | Toàn bộ quy trình dựng hệ thống embedded Linux, ví dụ trên Raspberry Pi 4 |
| 10–12 | Yocto | [Ba quyển Yocto](../yocto/index.md) | Poky, BitBake, layer, recipe, thêm phần cứng mới, tra cứu theo công thức |

**Ghi chú**

- **Bước 1 và 2 bổ sung cho nhau.** Kaiwan cho cách làm thực tế trên kernel 6.1, ULK3 giải thích cơ chế sâu. ULK3 viết cho kernel 2.6.11 trên x86: phần segmentation và IDT không áp dụng cho ARM, scheduler O(1) đã được thay bằng CFS rồi EEVDF. Khi hai sách khác nhau, tin Kaiwan.
- **Bước 3 nối tiếp bước 1**, cùng tác giả. Bước 4 dùng bản Madieu 2022.
- **Bước 5 đọc trước Rosen** để nắm `sk_buff`, `net_device` và đường đi của frame trong kernel. Chỉ có chương 1–17; phần IPv4, neighbouring và routing của Benvenuti không dịch vì Rosen đã có, với code mới hơn.
- **Bước 7, thứ tự đọc network driver:**
    1. [LDD3 ch17](network_device_drivers/ldd3_ch17/ch17_network_drivers.vi.md): nắm khái niệm qua driver mẫu snull.
    2. [Madieu 2017 ch22](network_device_drivers/madieu2017_ch22/ch22_network_interface_card_drivers.vi.md): cách viết theo API mới.
    3. Đọc lại Benvenuti [ch09](understanding_linux_network_internals_book/ch09_interrupts_and_network_drivers.vi.md)–[ch11](understanding_linux_network_internals_book/ch11_frame_transmission.vi.md): chuyện gì xảy ra sau khi driver gọi `netif_rx` hoặc `napi_schedule`.
    4. [ELDD ch15](network_device_drivers/eldd_ch15/ch15_network_interface_cards.vi.md): tham khảo thêm.
- **Bước 8 và 9 đọc song song.** Đọc chương MEL 4e trước, rồi mở chương Primer tương ứng ở những phần Primer sâu hơn, theo bảng dưới.
- **Bước 9 dùng MEL 4e (2025)** thay cho MEL 3e vì mới hơn và ví dụ chạy trên Raspberry Pi 4.
- **Bước 10–12** đọc sau MEL 4e [ch06](mastering_embedded_linux_programming_book/ch06_selecting_a_build_system.vi.md)–[ch08](mastering_embedded_linux_programming_book/ch08_yocto_under_the_hood.vi.md).

**Bảng đọc kèm bước 8 và 9**

| Chủ đề | MEL 4e | Primer |
|---|---|---|
| Tổng quan | [ch01](mastering_embedded_linux_programming_book/ch01_starting_out.vi.md) | [ch01](embedded_linux_primer_book/ch01_introduction.vi.md)–[ch02](embedded_linux_primer_book/ch02_the_big_picture.vi.md) |
| Toolchain | [ch02](mastering_embedded_linux_programming_book/ch02_learning_about_toolchains.vi.md) | [ch12](embedded_linux_primer_book/ch12_embedded_development_environment.vi.md) |
| Bootloader | [ch03](mastering_embedded_linux_programming_book/ch03_all_about_bootloaders.vi.md) | [ch07](embedded_linux_primer_book/ch07_bootloaders.vi.md) |
| Kernel: cấu hình, build, khởi động | [ch04](mastering_embedded_linux_programming_book/ch04_configuring_and_building_the_kernel.vi.md) | [ch04](embedded_linux_primer_book/ch04_the_linux_kernel_a_different_perspective.vi.md)–[ch05](embedded_linux_primer_book/ch05_kernel_initialization.vi.md) |
| Root filesystem, BusyBox | [ch05](mastering_embedded_linux_programming_book/ch05_building_a_root_filesystem.vi.md) | [ch06](embedded_linux_primer_book/ch06_user_space_initialization.vi.md), [ch11](embedded_linux_primer_book/ch11_busybox.vi.md) |
| Build system | [ch06](mastering_embedded_linux_programming_book/ch06_selecting_a_build_system.vi.md)–[ch08](mastering_embedded_linux_programming_book/ch08_yocto_under_the_hood.vi.md) | [ch16](embedded_linux_primer_book/ch16_open_source_build_systems.vi.md) |
| Storage, flash, MTD | [ch09](mastering_embedded_linux_programming_book/ch09_creating_a_storage_strategy.vi.md) | [ch09](embedded_linux_primer_book/ch09_file_systems.vi.md)–[ch10](embedded_linux_primer_book/ch10_mtd_subsystem.vi.md) |
| Cập nhật phần mềm (OTA) | [ch10](mastering_embedded_linux_programming_book/ch10_updating_software_in_the_field.vi.md) | |
| Driver nhìn từ user space | [ch11](mastering_embedded_linux_programming_book/ch11_interfacing_with_device_drivers.vi.md) | [ch08](embedded_linux_primer_book/ch08_device_driver_basics.vi.md) |
| Prototype với board mở rộng | [ch12](mastering_embedded_linux_programming_book/ch12_prototyping_with_add_on_boards.vi.md) | |
| Init (BusyBox init, systemd…) | [ch13](mastering_embedded_linux_programming_book/ch13_starting_up_the_init_program.vi.md) | [ch06](embedded_linux_primer_book/ch06_user_space_initialization.vi.md) |
| Quản lý điện năng | [ch14](mastering_embedded_linux_programming_book/ch14_managing_power.vi.md) | |
| Python, container | [ch15](mastering_embedded_linux_programming_book/ch15_packaging_python.vi.md)–[ch16](mastering_embedded_linux_programming_book/ch16_deploying_container_images.vi.md) | |
| Process, thread, bộ nhớ | [ch17](mastering_embedded_linux_programming_book/ch17_learning_about_processes_and_threads.vi.md)–[ch18](mastering_embedded_linux_programming_book/ch18_managing_memory.vi.md) | |
| Debug với GDB | [ch19](mastering_embedded_linux_programming_book/ch19_debugging_with_gdb.vi.md) | [ch13](embedded_linux_primer_book/ch13_development_tools.vi.md)–[ch15](embedded_linux_primer_book/ch15_debugging_embedded_linux_applications.vi.md) |
| Profiling, tracing | [ch20](mastering_embedded_linux_programming_book/ch20_profiling_and_tracing.vi.md) | |
| Real-time | [ch21](mastering_embedded_linux_programming_book/ch21_real_time_programming.vi.md) | [ch17](embedded_linux_primer_book/ch17_linux_and_real_time.vi.md) |
| USB, udev | | [ch18](embedded_linux_primer_book/ch18_universal_serial_bus.vi.md)–[ch19](embedded_linux_primer_book/ch19_udev.vi.md) |

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

## Theo sách *Linux Kernel Programming Part 2*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Tập trung vào character device driver và đồng bộ hóa.

- [**Chương 1 — Misc character device driver đơn giản**](linux_kernel_programming_part_2/ch01_writing_a_simple_misc_character_device_driver.vi.md) — viết misc driver, chép dữ liệu giữa kernel và user space, lưu ý bảo mật
- [**Chương 2 — Giao tiếp user-kernel**](linux_kernel_programming_part_2/ch02_user_kernel_communication_pathways.vi.md) — procfs, sysfs, debugfs, netlink socket, `ioctl`, bảng so sánh các cách
- [**Chương 3 — Hardware I/O memory**](linux_kernel_programming_part_2/ch03_working_with_hardware_i_o_memory.vi.md) — truy cập vùng nhớ phần cứng, memory-mapped I/O và port-mapped I/O
- [**Chương 4 — Xử lý hardware interrupt**](linux_kernel_programming_part_2/ch04_handling_hardware_interrupts.vi.md) — cấp phát IRQ, viết interrupt handler, threaded interrupt, top half và bottom half
- [**Chương 5 — Kernel timer, thread và workqueue**](linux_kernel_programming_part_2/ch05_working_with_kernel_timers_threads_and_workqueues.vi.md) — delay trong kernel, kernel timer, kernel thread, workqueue
- [**Chương 6 — Đồng bộ hóa trong kernel, phần 1**](linux_kernel_programming_part_2/ch06_kernel_synchronization_part_1.vi.md) — critical section, mutex vs spinlock, locking và interrupt
- [**Chương 7 — Đồng bộ hóa trong kernel, phần 2**](linux_kernel_programming_part_2/ch07_kernel_synchronization_part_2.vi.md) — `atomic_t`/`refcount_t`, reader-writer spinlock, false sharing, per-CPU, lock debugging, memory barrier

## Theo sách *Linux Device Driver Development*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Tập trung vào viết driver cho thiết bị thật trên hệ nhúng.

- [**Chương 1 — Nhập môn phát triển kernel**](linux_device_driver_development/ch01_introduction_to_kernel_development.vi.md) — dựng môi trường, lấy mã nguồn, cấu hình và build kernel, build và cài module
- [**Chương 2 — Khái niệm cơ bản về kernel module**](linux_device_driver_development/ch02_understanding_linux_kernel_module_basic_concepts.vi.md) — khung module, build in-tree và out-of-tree, tham số module, export symbol, xử lý lỗi, in log
- [**Chương 3 — Các helper cốt lõi của kernel**](linux_device_driver_development/ch03_dealing_with_kernel_core_helpers.vi.md) — spinlock, mutex, wait queue, delay, timer và hrtimer, softirq, tasklet, workqueue, interrupt handler
- [**Chương 4 — Character device driver**](linux_device_driver_development/ch04_writing_character_device_drivers.vi.md) — major và minor, device node, đăng ký char device, các file operation, `poll` và `ioctl`
- [**Chương 5 — Device tree**](linux_device_driver_development/ch05_understanding_and_leveraging_the_device_tree.vi.md) — quy ước đặt tên, alias và label, biểu diễn địa chỉ thiết bị, resource
- [**Chương 6 — Device, driver và platform abstraction**](linux_device_driver_development/ch06_introduction_to_devices_drivers_and_platform_abstraction.vi.md) — cấu trúc device, driver và bus, cơ chế ghép device với driver, OF matching
- [**Chương 7 — Platform device và platform driver**](linux_device_driver_development/ch07_understanding_the_concept_of_platform_devices_and_drivers.vi.md) — cấp phát platform device, platform resource, probe, viết platform driver từ đầu
- [**Chương 8 — I2C device driver**](linux_device_driver_development/ch08_writing_i2c_device_drivers.vi.md) — adapter và client, API giao tiếp I2C, probe và remove, khai báo thiết bị
- [**Chương 9 — SPI device driver**](linux_device_driver_development/ch09_writing_spi_device_drivers.vi.md) — controller và device, truyền message, probe và remove, khai báo thiết bị
- [**Chương 10 — Cấp phát bộ nhớ trong kernel**](linux_device_driver_development/ch10_understanding_the_linux_kernel_memory_allocation.vi.md) — address space, VMA, MMU và TLB, page và slab allocator, `kmalloc` và `vmalloc`, PIO và MMIO, map bộ nhớ sang user space
- [**Chương 11 — DMA**](linux_device_driver_development/ch11_implementing_direct_memory_access_dma_support.vi.md) — DMA mapping, cache coherency, completion, DMA engine API, cyclic DMA, DT binding
- [**Chương 12 — Regmap API**](linux_device_driver_development/ch12_abstracting_memory_access_introduction_to_the_regmap_api_a_register_map_abstraction.vi.md) — cấu hình và khởi tạo Regmap, đọc ghi thanh ghi, cache, ví dụ SPI driver
- [**Chương 13 — Kernel IRQ framework**](linux_device_driver_development/ch13_demystifying_the_kernel_irq_framework.vi.md) — interrupt controller, lan truyền IRQ, chaining IRQ, per-CPU interrupt, SGI và IPI
- [**Chương 14 — Linux device model**](linux_device_driver_development/ch14_introduction_to_the_linux_device_model.vi.md) — cấu trúc bus, driver và device, kobject, kobj_type, kset, attribute trong sysfs
- [**Chương 15 — IIO framework**](linux_device_driver_development/ch15_digging_into_the_iio_framework.vi.md) — `iio_dev`, channel, triggered buffer, consumer trong kernel, ứng dụng IIO ở user space
- [**Chương 16 — Pin controller và GPIO**](linux_device_driver_development/ch16_getting_the_most_out_of_the_pin_controller_and_gpio_subsystems.vi.md) — pin control, GPIO controller driver, GPIO consumer theo descriptor, libgpiod, GPIO aggregator
- [**Chương 17 — Input subsystem**](linux_device_driver_development/ch17_leveraging_the_linux_kernel_input_subsystem.vi.md) — đăng ký input device, polled device, báo cáo input event, đọc event từ user space

## Theo sách *Understanding Linux Network Internals*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Tập trung vào tầng mạng bên trong kernel, từ driver card mạng tới bridging.

- [**Chương 1 — Giới thiệu**](understanding_linux_network_internals_book/ch01_introduction.vi.md) — thuật ngữ, các mẫu code hay gặp, công cụ user space, cách đọc mã nguồn
- [**Chương 2 — Các cấu trúc dữ liệu chính**](understanding_linux_network_internals_book/ch02_critical_data_structures.vi.md) — `sk_buff` và `net_device`
- [**Chương 3 — Giao tiếp user space với kernel**](understanding_linux_network_internals_book/ch03_user_space_to_kernel_interface.vi.md) — procfs và sysctl, `ioctl`, netlink
- [**Chương 4 — Notification chain**](understanding_linux_network_internals_book/ch04_notification_chains.vi.md) — định nghĩa chain, đăng ký và phát sự kiện, các chain của tầng mạng
- [**Chương 5 — Khởi tạo network device**](understanding_linux_network_internals_book/ch05_network_device_initialization.vi.md) — khởi tạo hệ thống và NIC, tham số module, virtual device
- [**Chương 6 — Tầng PCI và card mạng**](understanding_linux_network_internals_book/ch06_the_pci_layer_and_network_interface_cards.vi.md) — đăng ký driver PCI cho NIC, quản lý nguồn và Wake-on-LAN
- [**Chương 7 — Hạ tầng khởi tạo thành phần**](understanding_linux_network_internals_book/ch07_kernel_infrastructure_for_component_initialization.vi.md) — tham số lúc boot, mã khởi tạo module, các macro đánh dấu, tối ưu bộ nhớ
- [**Chương 8 — Đăng ký và khởi tạo device**](understanding_linux_network_internals_book/ch08_device_registration_and_initialization.vi.md) — khi nào đăng ký và hủy đăng ký, cấp phát `net_device`, trạng thái device
- [**Chương 9 — Interrupt và network driver**](understanding_linux_network_internals_book/ch09_interrupts_and_network_drivers.vi.md) — báo cho driver khi có frame đến, interrupt handler, `softnet_data`
- [**Chương 10 — Nhận frame**](understanding_linux_network_internals_book/ch10_frame_reception.vi.md) — hàng đợi, `netif_rx`, quản lý nghẽn, xử lý `NET_RX_SOFTIRQ`
- [**Chương 11 — Truyền frame**](understanding_linux_network_internals_book/ch11_frame_transmission.vi.md) — bật tắt việc truyền và đường đi của frame khi gửi
- [**Chương 12 — Tài liệu tham khảo về interrupt**](understanding_linux_network_internals_book/ch12_general_and_reference_material_about_interrupts.vi.md) — thống kê, tinh chỉnh qua /proc, danh sách hàm và file liên quan
- [**Chương 13 — Protocol handler**](understanding_linux_network_internals_book/ch13_protocol_handlers.vi.md) — tổ chức và đăng ký protocol handler, Ethernet so với IEEE 802.3
- [**Chương 14 — Bridging: khái niệm**](understanding_linux_network_internals_book/ch14_bridging_concepts.vi.md) — repeater, bridge và router, address learning, nhiều bridge
- [**Chương 15 — Bridging: Spanning Tree Protocol**](understanding_linux_network_internals_book/ch15_bridging_the_spanning_tree_protocol.vi.md) — bridge ID và port ID, BPDU, topology hoạt động, timer, thay đổi topology
- [**Chương 16 — Bridging: cài đặt trong Linux**](understanding_linux_network_internals_book/ch16_bridging_linux_implementation.vi.md) — bridge device, tạo và xóa bridge, thêm port, bật tắt bridge
- [**Chương 17 — Bridging: chủ đề khác**](understanding_linux_network_internals_book/ch17_bridging_miscellaneous_topics.vi.md) — công cụ cấu hình user space, tinh chỉnh qua /proc và /sys, thống kê

## Theo sách *Linux Kernel Networking*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Đi qua từng giao thức trong network stack của kernel, từ IPv4, IPv6 tới wireless và InfiniBand.

- [**Chương 1 — Giới thiệu**](linux_kernel_networking_book/ch01_introduction.vi.md) — tổng quan network stack, network device, cộng đồng phát triển
- [**Chương 2 — Netlink socket**](linux_kernel_networking_book/ch02_netlink_sockets.vi.md) — các họ netlink và generic netlink
- [**Chương 3 — ICMP**](linux_kernel_networking_book/ch03_internet_control_message_protocol_icmp.vi.md) — ICMPv4, ICMPv6 và ping socket
- [**Chương 4 — IPv4**](linux_kernel_networking_book/ch04_ipv4.vi.md) — header, nhận và gửi gói, multicast, IP option, phân mảnh và ghép mảnh
- [**Chương 5 — IPv4 routing**](linux_kernel_networking_book/ch05_the_ipv4_routing_subsystem.vi.md) — forwarding và FIB, tra bảng định tuyến, ICMP redirect
- [**Chương 6 — Định tuyến nâng cao**](linux_kernel_networking_book/ch06_advanced_routing.vi.md) — multicast routing, policy routing, multipath routing
- [**Chương 7 — Neighbouring subsystem**](linux_kernel_networking_book/ch07_linux_neighbouring_subsystem.vi.md) — lõi neighbouring, ARP cho IPv4, NDISC cho IPv6
- [**Chương 8 — IPv6**](linux_kernel_networking_book/ch08_ipv6.vi.md) — địa chỉ, header và extension header, autoconfiguration, nhận và gửi gói
- [**Chương 9 — Netfilter**](linux_kernel_networking_book/ch09_netfilter.vi.md) — framework, các hook, connection tracking
- [**Chương 10 — IPsec**](linux_kernel_networking_book/ch10_ipsec.vi.md) — IKE, mã hóa, XFRM framework, ESP, nhận và gửi gói IPsec
- [**Chương 11 — Giao thức tầng 4**](linux_kernel_networking_book/ch11_layer_4_protocols.vi.md) — socket, UDP, TCP, SCTP, DCCP
- [**Chương 12 — Wireless trong Linux**](linux_kernel_networking_book/ch12_wireless_in_linux.vi.md) — mac80211, MAC header 802.11, chế độ tiết kiệm năng lượng, MLME, 802.11n
- [**Chương 13 — InfiniBand**](linux_kernel_networking_book/ch13_infiniband.vi.md) — tổng quan RDMA và InfiniBand, các tài nguyên RDMA
- [**Chương 14 — Chủ đề nâng cao**](linux_kernel_networking_book/ch14_advanced_topics.vi.md) — network namespace, cgroup, busy poll, Bluetooth, 6LoWPAN, NFC, PCI
- [**Phụ lục A — Linux API**](linux_kernel_networking_book/chA_linux_api.vi.md) — tra cứu `sk_buff`, `net_device` và các đối tượng RDMA
- [**Phụ lục B — Quản trị mạng**](linux_kernel_networking_book/chB_network_administration.vi.md) — danh sách công cụ dòng lệnh để quản trị và debug mạng
- [**Phụ lục C — Thuật ngữ**](linux_kernel_networking_book/chC_glossary.vi.md) — bảng thuật ngữ của sách

## Chủ đề *Network device driver*

Ba chương về driver card mạng, lấy từ ba quyển sách khác nhau để đọc đối chiếu.

- [**LDD3 — Chương 17: Network driver**](network_device_drivers/ldd3_ch17/ch17_network_drivers.vi.md) — driver mẫu snull, kết nối với kernel, `net_device`, gửi và nhận gói, interrupt handler
- [**Essential Linux Device Drivers — Chương 15: Network interface card**](network_device_drivers/eldd_ch15/ch15_network_interface_cards.vi.md) — cấu trúc dữ liệu driver, giao tiếp với tầng giao thức, quản lý buffer, ví dụ Ethernet NIC
- [**Linux Device Drivers Development — Chương 22: NIC driver**](network_device_drivers/madieu2017_ch22/ch22_network_interface_card_drivers.vi.md) — cấu trúc dữ liệu driver, các method của device và driver

## Theo sách *Embedded Linux Primer*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Nhìn Linux từ góc độ hệ nhúng, từ bootloader, kernel tới công cụ debug.

- [**Chương 1 — Giới thiệu**](embedded_linux_primer_book/ch01_introduction.vi.md) — vì sao chọn Linux cho hệ nhúng, mã nguồn mở và GPL, các tổ chức chuẩn hóa
- [**Chương 2 — Bức tranh tổng thể**](embedded_linux_primer_book/ch02_the_big_picture.vi.md) — cấu tạo một hệ nhúng, lưu trữ, các bản phân phối embedded Linux
- [**Chương 4 — Linux kernel từ góc nhìn khác**](embedded_linux_primer_book/ch04_the_linux_kernel_a_different_perspective.vi.md) — cấu trúc mã nguồn, hệ thống build và cấu hình kernel
- [**Chương 5 — Khởi tạo kernel**](embedded_linux_primer_book/ch05_kernel_initialization.vi.md) — kernel image tổng hợp, luồng khởi động, tham số dòng lệnh, khởi tạo subsystem
- [**Chương 6 — Khởi tạo user space**](embedded_linux_primer_book/ch06_user_space_initialization.vi.md) — root file system, tiến trình init, initrd và initramfs, tắt máy
- [**Chương 7 — Bootloader**](embedded_linux_primer_book/ch07_bootloaders.vi.md) — vai trò bootloader, U-Boot và cách port, device tree blob
- [**Chương 8 — Cơ bản về device driver**](embedded_linux_primer_book/ch08_device_driver_basics.vi.md) — khái niệm driver, công cụ quản lý module, build ngoài cây mã nguồn, driver và GPL
- [**Chương 9 — File system**](embedded_linux_primer_book/ch09_file_systems.vi.md) — ext2, ext3, ext4, ReiserFS, JFFS2 và các file system khác
- [**Chương 10 — MTD subsystem**](embedded_linux_primer_book/ch10_mtd_subsystem.vi.md) — tổng quan MTD, phân vùng, công cụ, UBI
- [**Chương 11 — BusyBox**](embedded_linux_primer_book/ch11_busybox.vi.md) — giới thiệu, cấu hình và cách BusyBox hoạt động
- [**Chương 12 — Môi trường phát triển**](embedded_linux_primer_book/ch12_embedded_development_environment.vi.md) — cross-development, yêu cầu máy host, kết nối board đích
- [**Chương 13 — Công cụ phát triển**](embedded_linux_primer_book/ch13_development_tools.vi.md) — GDB, DDD, cscope, công cụ tracing và profiling, binary utility
- [**Chương 14 — Kỹ thuật debug kernel**](embedded_linux_primer_book/ch14_kernel_debugging_techniques.vi.md) — KGDB, debug có phần cứng hỗ trợ, xử lý khi kernel không boot
- [**Chương 15 — Debug ứng dụng embedded**](embedded_linux_primer_book/ch15_debugging_embedded_linux_applications.vi.md) — debug trên board, debug từ xa, thư viện chia sẻ, nhiều tác vụ
- [**Chương 16 — Build system mã nguồn mở**](embedded_linux_primer_book/ch16_open_source_build_systems.vi.md) — Scratchbox, Buildroot, OpenEmbedded
- [**Chương 17 — Linux và real time**](embedded_linux_primer_book/ch17_linux_and_real_time.vi.md) — khái niệm real time, kernel preemption, bản vá real-time, phân tích độ trễ
- [**Chương 18 — USB**](embedded_linux_primer_book/ch18_universal_serial_bus.vi.md) — tổng quan và cấu hình USB, sysfs, công cụ, debug USB
- [**Chương 19 — udev**](embedded_linux_primer_book/ch19_udev.vi.md) — phát hiện thiết bị, rule của udev, tùy biến hành vi
- [**Phụ lục A–F**](embedded_linux_primer_book/chA_gnu_public_license.vi.md) — giấy phép GPL, lệnh U-Boot, lệnh BusyBox, giao tiếp SDRAM, nguồn tài liệu, file cấu hình BDI-2000

## Theo sách *Mastering Embedded Linux Development* (bản 4)

Bản dịch tiếng Việt bản thứ tư của sách, kèm hình minh họa. Chia thành năm phần, từ các thành phần của một hệ embedded Linux tới gỡ lỗi và tối ưu hiệu năng.

- [**Lời nói đầu**](mastering_embedded_linux_programming_book/ch00_preface.vi.md) — giới thiệu sách
- [**Phần I — Các thành phần của embedded Linux**](mastering_embedded_linux_programming_book/part1_elements_of_embedded_linux.vi.md) — toolchain, bootloader, cấu hình và build kernel, root filesystem (chương 1–5)
- [**Phần II — Build image embedded Linux**](mastering_embedded_linux_programming_book/part2_building_embedded_linux_images.vi.md) — chọn build system, phát triển với Yocto và cách Yocto hoạt động bên trong (chương 6–8)
- [**Phần III — Kiến trúc hệ thống và quyết định thiết kế**](mastering_embedded_linux_programming_book/part3_system_architecture_and_design_decisions.vi.md) — chiến lược lưu trữ, cập nhật phần mềm từ xa, device driver, làm prototype với add-on board, chương trình init, quản lý điện năng (chương 9–14)
- [**Phần IV — Phát triển ứng dụng**](mastering_embedded_linux_programming_book/part4_developing_applications.vi.md) — đóng gói Python, triển khai container, process và thread, quản lý bộ nhớ (chương 15–18)
- [**Phần V — Gỡ lỗi và tối ưu hiệu năng**](mastering_embedded_linux_programming_book/part5_debugging_and_optimizing_performance.vi.md) — debug với GDB, profiling và tracing, lập trình real-time (chương 19–21)
