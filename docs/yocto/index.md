# Yocto

Sổ tay ghi chép trong quá trình tự học Yocto Project để build hệ điều hành Linux tùy biến cho thiết bị nhúng.

## Theo sách *Embedded Linux Development Using Yocto Project*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Đi từ lần build ảnh đầu tiên tới tự viết layer, recipe và đưa sản phẩm lên board thật.

- [**Lời nói đầu**](./1%3A%20Embedded_Linux_Development_Using_Yocto_Project/ch00_preface.vi.md) — giới thiệu sách
- [**Chương 1–3 — Bắt đầu**](./1%3A%20Embedded_Linux_Development_Using_Yocto_Project/ch01_meeting_the_yocto_project.vi.md) — Yocto Project là gì, build ảnh đầu tiên với Poky, dùng giao diện web Toaster
- [**Chương 4–5 — BitBake**](./1%3A%20Embedded_Linux_Development_Using_Yocto_Project/ch04_meeting_the_bitbake_tool.vi.md) — công cụ build trung tâm của Yocto và cách nó xử lý metadata, task, phụ thuộc
- [**Chương 6–8 — Bên trong quá trình build**](./1%3A%20Embedded_Linux_Development_Using_Yocto_Project/ch06_detailing_the_temporary_build_directory.vi.md) — thư mục build tạm, đóng gói package, cú pháp metadata của BitBake
- [**Chương 9–10 — Phát triển và gỡ lỗi**](./1%3A%20Embedded_Linux_Development_Using_Yocto_Project/ch09_developing_with_the_yocto_project.vi.md) — SDK và quy trình phát triển ứng dụng, các công cụ debug đi kèm
- [**Chương 11–13 — Layer và recipe**](./1%3A%20Embedded_Linux_Development_Using_Yocto_Project/ch11_exploring_external_layers.vi.md) — dùng layer bên ngoài, tạo layer riêng, tùy biến recipe có sẵn
- [**Chương 14 — Tuân thủ GPL**](./1%3A%20Embedded_Linux_Development_Using_Yocto_Project/ch14_achieving_gpl_compliance.vi.md) — quản lý giấy phép và mã nguồn khi phát hành sản phẩm
- [**Chương 15–16 — Chạy trên phần cứng và giả lập**](./1%3A%20Embedded_Linux_Development_Using_Yocto_Project/ch15_booting_our_custom_embedded_linux.vi.md) — boot ảnh tự build trên board thật, tăng tốc phát triển bằng QEMU
- [**Chương 17 — Kinh nghiệm thực tế**](./1%3A%20Embedded_Linux_Development_Using_Yocto_Project/ch17_best_practices.vi.md) — các thói quen tốt khi làm dự án dùng Yocto

## Theo sách *Yocto Project Customization for Linux*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Tập trung vào việc tùy biến Yocto: viết recipe, quản lý layer, thêm phần cứng mới.

- [**Giới thiệu**](./2%3A%20yocto_project_customization_book/ch00d_introduction.vi.md) — mục tiêu của sách, kèm các trang về tác giả, người hiệu đính và lời cảm ơn
- [**Chương 1–2 — Chuẩn bị**](./2%3A%20yocto_project_customization_book/ch01_setting_up_the_building_environment.vi.md) — dựng môi trường build, tải mã nguồn
- [**Chương 3–5 — Nền tảng Yocto**](./2%3A%20yocto_project_customization_book/ch03_yocto_project_basics.vi.md) — khái niệm cơ bản, các công cụ đi kèm, cách BitBake hoạt động bên trong
- [**Chương 6–7 — Recipe và layer**](./2%3A%20yocto_project_customization_book/ch06_recipes.vi.md) — cấu trúc recipe, tạo và quản lý layer
- [**Chương 8 — Thêm phần cứng mới**](./2%3A%20yocto_project_customization_book/ch08_adding_new_hardware.vi.md) — hỗ trợ board và thiết bị mới
- [**Chương 9–12 — Viết recipe cho từng loại**](./2%3A%20yocto_project_customization_book/ch09_c_application_recipes.vi.md) — ứng dụng C, ứng dụng Python, các loại recipe khác, recipe cho image
- [**Chương 13 — Tối ưu và kinh nghiệm**](./2%3A%20yocto_project_customization_book/ch13_optimizations_and_best_practices.vi.md) — tăng tốc build và các thói quen tốt

## Theo sách *Embedded Linux Development Using Yocto Cookbook*

Bản dịch tiếng Việt bản thứ hai, kèm hình minh họa của sách. Viết theo dạng công thức: mỗi mục là một việc cụ thể cần làm với Yocto.

- [**Mở đầu**](./3%3A%20Embedded_Linux_Development_Using_Yocto_Cookbook_2e/ch00c_preface.vi.md) — lời nói đầu, kèm lời giới thiệu và danh sách người đóng góp
- [**Chương 1 — Hệ thống build**](./3%3A%20Embedded_Linux_Development_Using_Yocto_Cookbook_2e/ch01_the_build_system.vi.md) — dựng và cấu hình môi trường build Yocto
- [**Chương 2 — Layer BSP**](./3%3A%20Embedded_Linux_Development_Using_Yocto_Cookbook_2e/ch02_the_bsp_layer.vi.md) — hỗ trợ board: bootloader, kernel, device tree
- [**Chương 3 — Layer phần mềm**](./3%3A%20Embedded_Linux_Development_Using_Yocto_Cookbook_2e/ch03_the_software_layer.vi.md) — thêm và tùy biến gói phần mềm trong image
- [**Chương 4 — Phát triển ứng dụng**](./3%3A%20Embedded_Linux_Development_Using_Yocto_Cookbook_2e/ch04_application_development.vi.md) — SDK và quy trình viết ứng dụng cho thiết bị
- [**Chương 5 — Debug, tracing và profiling**](./3%3A%20Embedded_Linux_Development_Using_Yocto_Cookbook_2e/ch05_debugging_tracing_and_profiling.vi.md) — các công cụ gỡ lỗi và đo hiệu năng trên hệ thống Yocto
