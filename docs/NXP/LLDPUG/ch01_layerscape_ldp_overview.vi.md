# 1 Tổng quan Layerscape LDP

Layerscape Linux Distribution POC (LDP) là phần mềm hỗ trợ Linux cho các processor Layerscape dùng core ARM của NXP. Nó cung cấp các driver, công cụ và thư viện cần thiết để sử dụng các tính năng của processor Layerscape. Bản build Layerscape LDP dùng một meta layer dựa trên Yocto để tạo ra một image Proof of Concept (POC).

Layerscape LDP cung cấp bootloader hoạt động đầy đủ, một Linux kernel và các module dành riêng cho board, sẵn sàng dùng cùng nhau trong một cấu hình linh hoạt cho các nền tảng phần cứng tham chiếu cụ thể. Layerscape LDP đã được kiểm thử và đánh giá chất lượng tại NXP. Layerscape LDP là một hệ thống Linux hoàn chỉnh với các thành phần chính sau:

- Các thành phần firmware của NXP, gồm:
  - Trusted Firmware-A (TF-A), một bản triển khai tham chiếu của phần mềm secure world cho Armv7-A và Armv8-A
  - Các thành phần firmware ngoại vi của NXP cho DPAA1, DPAA2 và PPFE
- Các bootloader của NXP. Có hai loại được cung cấp:
  - U-Boot, dựa trên denx.de cộng thêm các patch
- Linux kernel của NXP, dựa trên upstream kernel.org cộng thêm các patch
- Các thành phần user space do NXP bổ sung
- Bộ file user space chuẩn của Linux distro (userland), gồm cả compiler và cross compiler

Lợi ích của việc dùng userland Layerscape LDP của NXP là dễ dàng có sẵn hàng nghìn package user space chuẩn của Linux. Trải nghiệm dùng Layerscape LDP tương tự như dùng Ubuntu, nhưng kernel, firmware và một số package đặc biệt của NXP được quản lý riêng.

**Ghi chú:** Để biết cách sửa đổi/cập nhật từng thành phần Layerscape LDP, như U-Boot, Linux kernel, DPL, DPC, trên một board thiết kế tham chiếu khi boot board từ một nguồn boot cụ thể, như QSPI hoặc SD, xem Section 4.7 tại NXP community.

**Truy cập Layerscape LDP**

Layerscape LDP được phân phối qua Git. Để build thành phần yocto, bạn phải clone manifest và cài Layerscape LDP lên một thiết bị lưu trữ dung lượng lớn như một bản tích hợp sẵn sàng dùng trên board tham chiếu hoặc board đánh giá của NXP. Bạn có thể build các thành phần NXP từ source bằng một script tên là bitbake hoặc cài từ các binary của thành phần NXP bằng flex-installer.

Để biết thêm chi tiết, xem các link dưới đây:

- Build các thành phần NXP: Section 4.
- Yocto project: Yocto projects.
- NXP Linux Yocto project: NXP Linux Yocto Project BSP for Desktop PoC.

**Package cho build host**

Build Yocto đòi hỏi cài các package thiết yếu lên build host của bạn.

Để build host, dùng lệnh sau:

```
$ sudo apt install gawk wget git diffstat unzip texinfo gcc build-essential chrpath socat cpio python3 python3-pip
 python3-pexpect xz-utils debianutils iputils-ping python3-git python3-jinja2 libegl1-mesa libsdl1.2-dev pylint3
 xterm python3-subunit mesa-common-dev zstd liblz4-tool
```

Để biết thêm về cách build Layerscape LDP, xem Section 4.5.

**Git tag của Layerscape LDP**

Các Git repository của Layerscape LDP dùng Git tag để đánh dấu những revision thành phần được kiểm thử phát hành cùng nhau. Dùng lệnh `git tag` để xem chúng và chọn một tag để checkout.
