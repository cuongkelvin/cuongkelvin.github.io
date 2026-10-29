# Yocto

Sổ tay ghi chép trong quá trình tự học Yocto Project để build hệ điều hành Linux tùy biến cho thiết bị nhúng.

## Theo sách *Embedded Linux Development Using Yocto Project*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Đi từ lần build ảnh đầu tiên tới tự viết layer, recipe và đưa sản phẩm lên board thật.

- [**Lời nói đầu**](Embedded_Linux_Development_Using_Yocto_Project/ch00_preface.vi.md) — giới thiệu sách
- [**Chương 1–3 — Bắt đầu**](Embedded_Linux_Development_Using_Yocto_Project/ch01_meeting_the_yocto_project.vi.md) — Yocto Project là gì, build ảnh đầu tiên với Poky, dùng giao diện web Toaster
- [**Chương 4–5 — BitBake**](Embedded_Linux_Development_Using_Yocto_Project/ch04_meeting_the_bitbake_tool.vi.md) — công cụ build trung tâm của Yocto và cách nó xử lý metadata, task, phụ thuộc
- [**Chương 6–8 — Bên trong quá trình build**](Embedded_Linux_Development_Using_Yocto_Project/ch06_detailing_the_temporary_build_directory.vi.md) — thư mục build tạm, đóng gói package, cú pháp metadata của BitBake
- [**Chương 9–10 — Phát triển và gỡ lỗi**](Embedded_Linux_Development_Using_Yocto_Project/ch09_developing_with_the_yocto_project.vi.md) — SDK và quy trình phát triển ứng dụng, các công cụ debug đi kèm
- [**Chương 11–13 — Layer và recipe**](Embedded_Linux_Development_Using_Yocto_Project/ch11_exploring_external_layers.vi.md) — dùng layer bên ngoài, tạo layer riêng, tùy biến recipe có sẵn
- [**Chương 14 — Tuân thủ GPL**](Embedded_Linux_Development_Using_Yocto_Project/ch14_achieving_gpl_compliance.vi.md) — quản lý giấy phép và mã nguồn khi phát hành sản phẩm
- [**Chương 15–16 — Chạy trên phần cứng và giả lập**](Embedded_Linux_Development_Using_Yocto_Project/ch15_booting_our_custom_embedded_linux.vi.md) — boot ảnh tự build trên board thật, tăng tốc phát triển bằng QEMU
- [**Chương 17 — Kinh nghiệm thực tế**](Embedded_Linux_Development_Using_Yocto_Project/ch17_best_practices.vi.md) — các thói quen tốt khi làm dự án dùng Yocto

## Theo sách *Yocto Project Customization for Linux*

Bản dịch tiếng Việt, kèm hình minh họa của sách. Tập trung vào việc tùy biến Yocto: viết recipe, quản lý layer, thêm phần cứng mới.

- [**Giới thiệu**](yocto_project_customization_book/ch00d_introduction.vi.md) — mục tiêu của sách, kèm các trang về tác giả, người hiệu đính và lời cảm ơn
- [**Chương 1–2 — Chuẩn bị**](yocto_project_customization_book/ch01_setting_up_the_building_environment.vi.md) — dựng môi trường build, tải mã nguồn
- [**Chương 3–5 — Nền tảng Yocto**](yocto_project_customization_book/ch03_yocto_project_basics.vi.md) — khái niệm cơ bản, các công cụ đi kèm, cách BitBake hoạt động bên trong
- [**Chương 6–7 — Recipe và layer**](yocto_project_customization_book/ch06_recipes.vi.md) — cấu trúc recipe, tạo và quản lý layer
- [**Chương 8 — Thêm phần cứng mới**](yocto_project_customization_book/ch08_adding_new_hardware.vi.md) — hỗ trợ board và thiết bị mới
- [**Chương 9–12 — Viết recipe cho từng loại**](yocto_project_customization_book/ch09_c_application_recipes.vi.md) — ứng dụng C, ứng dụng Python, các loại recipe khác, recipe cho image
- [**Chương 13 — Tối ưu và kinh nghiệm**](yocto_project_customization_book/ch13_optimizations_and_best_practices.vi.md) — tăng tốc build và các thói quen tốt
