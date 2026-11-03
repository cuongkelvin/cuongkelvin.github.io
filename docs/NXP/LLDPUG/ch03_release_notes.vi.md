# 3 Release notes

## 3.1 Có gì mới trong bản phát hành này

### 3.1.1 Danh sách thay đổi

- Userland Layerscape LDP của NXP:
  - NXP Layerscape LDP, gồm các package chính của Linux distro và các package của NXP
  - Toolchain: gcc-11.2, glibc-2.36,binutils-2.38, gdb-12.1
- Lõi Linux kernel và ảo hóa:
  - Cập nhật LTS kernel 6.1.1
- Driver Linux kernel:
- Data Plane Development Kit (DPDK):
  - Virtualization - OVS-DPDK
- Trust Firmware - A (TF-A):
- Bootloader U-Boot:
  - Cập nhật U-Boot v2022.04
  - AQR113C trên TWR-LS1021A, LS1088ARDB và LX2162AQDS
- Công cụ và tiện ích khác:
  - AQR113C firmware
  - Yocto bitbake

## 3.2 Ma trận hỗ trợ tính năng

Các bảng sau cho thấy những tính năng được hỗ trợ trong bản phát hành này. Tham khảo chú giải dưới đây để hiểu các mục trong bảng.

Chú giải:

- **Y** - Tính năng được phần mềm hỗ trợ
- **/** - Tính năng không được phần mềm hỗ trợ
- **na** - Phần cứng không có tính năng này

**Table 2. Các tính năng chính**

| Tính năng | LS1012A | LS1021A | LS1028A | LS1043A | LS1046A | LS1088A | LS2088A | LX2160A | LX2162A |
|---|---|---|---|---|---|---|---|---|---|
| 64-bit User space, BE | / | na | / | / | / | / | / | / | / |
| 32-bit User space, LE | / | Y | / | / | / | / | / | / | / |
| 64-bit User space, LE | Y | na | Y | Y | Y | Y | Y | Y | Y |
| 36b phys mem | na | Y | na | na | na | na | na | na | na |
| 40b phys mem | Y | na | Y | Y | Y | Y | Y | Y | Y |
| Data Plane Development Kit (DPDK)<br>- không gồm VPP | Y | / | Y | Y | Y | Y | Y | Y | Y |
| Hugetlbfs | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Management Complex | na | na | na | na | na | Y | Y | Y | Y |
| Open Portable Trust Execution Environment (OP-TEE) | Y | / | Y | Y | Y | Y | Y | Y | Y |
| Secure boot<br>(NXP CoT) | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Secure boot (Arm CoT) | na | na | na | na | na | na | na | Y | Y |
| Time Sensitive Network (TSN) | na | na | Y | na | na | na | na | na | na |
| USDPAA Applications | na | na | na | / | / | na | na | na | na |
| Trusted Firmware-A (TF-A) | Y | na | Y | Y | Y | Y | Y | Y | Y |
| Verified boot | na | na | na | na | na | na | na | na | Y |
| Warm reset | na | na | na | na | na | na | na | na | Y |

**Table 3. Ảo hóa, Container và Cô lập**

| Tính năng | LS1012A | LS1021A | LS1028A | LS1043A | LS1046A | LS1088A | LS2088A | LX2160A | LX2162A |
|---|---|---|---|---|---|---|---|---|---|
| KVM/QEMU | Y | na | Y | Y | Y | Y | Y | Y | Y |
| Gán trực tiếp các interface mạng on-chip | / | na | Y | na | na | Y | Y | Y | Y |
| Gán trực tiếp các thiết bị PCI | / | na | Y | / | / | Y | Y | Y | Y |
| LXC | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Libvirt | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| SMMU - cấu hình mặc định | na | / | Y | / | / | Y | Y | Y | Y |
| VFIO cho tài nguyên mạng | / | na | Y | na | na | Y | Y | Y | Y |
| Docker | Y | / | Y | Y | Y | Y | Y | Y | Y |

**Table 4. Driver Linux kernel**

| Tính năng | LS1012A | LS1021A | LS1028A | LS1043A | LS1046A | LS1088A | LS2088A | LX2160A | LX2162A |
|---|---|---|---|---|---|---|---|---|---|
| Audio - I2S, SAI | Y | Y | Y | na | na | na | na | na | na |
| CAAM DMA | Y | / | / | / | / | / | / | / | / |
| DCE | na | na | na | na | na | na | Y | Y | Y |
| DCU | na | Y | na | na | na | na | na | na | na |
| Display - eDP/DP, LCD | na | na | Y | na | na | na | na | na | na |
| DMA | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| DPAA1 - Ethernet, FMan, QMan, BMan | na | na | na | Y | Y | na | na | na | na |
| DPAA2 - Ethernet, L2 Switching, QBMan | na | na | na | na | na | Y | Y | Y | Y |
| eSDHC | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| ENETC | na | na | Y | na | na | na | na | na | na |
| FlexCAN | na | / | Y | na | na | na | na | Y | Y |
| FlexSPI | na | na | Y | na | na | na | na | Y | Y |
| GPU | na | na | Y | na | na | na | na | na | na |
| I2C | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| IEEE1588, linuxptp | na | Y | Y | Y | Y | Y | Y | Y | Y |
| IFC | na | Y | na | Y | Y | Y | Y | na | na |
| IMA-EVM | Y | / | / | Y | Y | Y | Y | / | / |
| TSN Ethernet Switch | na | na | Y | na | na | na | na | na | na |
| LPUART | na | Y | / | Y | Y | / | / | na | na |
| QSPI | Y | Y | na | Y | Y | Y | Y | na | na |
| PCIe RC | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| PCIe EP | / | / | / | Y | Y | Y | Y | Y | Y |
| PFE | Y | na | na | na | na | na | na | na | na |
| Power Management | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Preempt Real-Time | / | / | Y | Y | Y | Y | Y | Y | Y |
| SATA | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| SEC | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| dSPI | / | Y | / | Y | Y | / | Y | na | Y |
| TDM (QE) | na | na | na | Y | na | na | na | na | na |
| TSN | na | na | Y | na | na | na | na | na | na |
| USB | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| VeTSEC | na | Y | na | na | na | na | na | na | na |
| VFIO cho tài nguyên mạng | / | na | Y | na | na | Y | Y | Y | Y |
| Watchdog | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| GPIO | na | na | na | na | Y | Y | na | na | Y |
| EDAC | Y | Y | Y | Y | Y | Y | Y | Y | Y |

## 3.3 Các lỗi đã sửa, còn mở và đã đóng

Các loại lỗi được xử lý trong bản phát hành Layerscape LDP 6.1.1_1.0.0 được nêu dưới đây:

- Lỗi đã sửa: Đây là các lỗi có bản sửa phần mềm đã được tích hợp vào bản phát hành 'Fixed In'.

**Table 5. Các lỗi đã sửa trong bản phát hành Layerscape LDP 6.1.1_1.0.0**

| ID | Mô tả | Xử lý | Mở trong | Sửa trong |
|---|---|---|---|---|
| DPDK-1827 | Case ovs-host_20g_6c thất bại với tải 100%. | LSDK 19.09 |   |   |
| DPDK-2671 | Kiểm tra ICV thất bại với các thuật toán AES-XCBC IPSec và PDCP. | LSDK 21.08 |   |   |
| DPDK-3070 | Kiểm tra IPSEC ESN thất bại với bản triển khai raw buffer. | LSDK 21.08 |   |   |
| DPDK-3098 | Ethernet pause frame không được hỗ trợ trong DPDK. | LSDK 21.08 |   |   |
| DPDK-3599 | Không có dữ liệu throughput khi kiểm thử DPDK OVS trên nền tảng dpaa2 | 5.15.32-2.0.0 |   |   |
| DPDK-3607 | Chế độ IPSEC event không hoạt động trên LS1046ARDB | 5.15.32-2.0.0 |   |   |
| DPDK-3666 | Hiệu năng L3 forwarding giảm trên 1 core và throughput 2G trên LS1028ARDB | 5.15.52-2.1.0 |   |   |
| DPDK-3718 | QDMA bị treo khi đọc PCIe trên LS1046 ARDB. | 5.15.5-1.0.0 |   |   |
| DPDK-3719 | Cờ mbuf offload cho checksum L3/L4 không đúng |   | 5.15.32_2.0.0 |   |
| LF-2403 | Kết quả linux_ipv4_fwd_performance bị giảm từ frame size 64 đến 1518 trên các nền tảng DPAA2 | Fixed | LSDK 20.12 | 5.15.52-2.1.0 |
| LF-2595 | Test tsn_switch_802_1qav_performance thất bại trên LS1028ARDB | 5.10.72-2.2.0 |   |   |
| LF-2852 | Kernel thứ hai dùng kexec không boot được trên LX2160A. | Fixed | LSDK 20.04 | 5.15.52-2.1.0 |
| LF-3792 | Kexec không chuyển được sang kernel thứ hai trên LX2160ARDB | 5.10.72-2.2.0 |   |   |
| LF-3954 | Trong kdump, thiết bị usb không được probe trong kernel thứ hai. | LSDK 21.08 |   |   |
| LF-4266 | Chế độ IMA EVM fix và enforce không được hỗ trợ. | LSDK 20.12 |   |   |
| LF-4505 | Không có image firmware tổng hợp secure trên LX2160ARDB và LX2162 QQDS. Về tính năng secure boot, xem mục "Secure boot". | LSDK 21.08 |   |   |
| LF-4650 | Build fuse provisioning thất bại trên LS1043A và LS1046A. | LSDK 21.08 |   |   |
| LF-5105 | Probe các PCIe EP phía sau PCIe switch thất bại với u-boot. | LSDK 21.08 |   |   |
| LF-5134 | Firmware display không hoạt động trên LS1028 ARDB | 5.10.72-2.2.0 |   |   |
| LF-5284 | Sửa ánh xạ HNF-SNF và đo mức cải thiện hiệu năng DDR trên LX2160 ARDB | LSDK 21.08 |   |   |
| LF-5365 | Hiệu năng DPAA2 1588 SINGLE_STEP giảm | LSDK 21.08 |   |   |
| LF-6222 | Audio không hoạt động trên LS1028ARDB | 5.15.5-1.0.0 |   |   |
| LF-6294 | LX2120A không boot được | 5.15.32-2.0.0 |   |   |
| LF-6322 | IFC-NOR secure-boot thất bại với lỗi "BL2: Failed to load image" trên LS2088ARDB | 5.15.32-2.0.0 |   |   |
| LF-6323 | SD secure boot thất bại trên LX2160ARDB | 5.15.32-2.0.0 |   |   |
| LF-7599 | Service Weston không tự khởi động khi hệ thống boot trên LS1028ARDB. | 5.15.32-2.0.0 |   |   |
| LFU-155 | Trên LS1012AFRWY, driver Ethernet PHY không hoạt động tốt trong U-Boot. | LSDK 21.08 |   |   |
| LFU-340 | Trong secure boot, việc kiểm tra kernel itb bị crash khi boot. | 5.15.32-2.0.0 |   |   |
| LFU-346 | Trong secure boot, việc kiểm tra firmware pfe bị crash trên LS1012ARDB. | 5.15.32-2.0.0 |   |   |
| LFU-350 | SD secure boot thất bại trên TWR-LS1021A | 5.15.32-2.0.0 |   |   |
| QSDK-7971 | Header esbc_validate thất bại trong MC và DPC khi bắt đầu secure boot trên LS1088 ARDB | LSDK 21.08 |   |   |

- Lỗi còn mở: Các lỗi còn mở hiện chưa có cách giải quyết. Gợi ý cách khắc phục tạm thời được đưa ra khi có thể.

**Table 6. Các lỗi còn mở trong bản phát hành Layerscape LDP 6.1.1_1.0.0**

| ID | Mô tả | Xử lý | Mở trong | Cách khắc phục tạm thời |
|---|---|---|---|---|
| DPDK-2671 | Kiểm tra ICV thất bại với các thuật toán AES-XCBC IPSec và PDCP. | Open | 5.15.52-2.1.0 |   |
| DPDK-3070 | Kiểm tra IPSEC ESN thất bại với bản triển khai raw buffer | Open | 5.15.52-2.1.0 |   |
| DPDK-3098 | Ethernet pause frame không được hỗ trợ trong DPDK | Open | 5.15.52-2.1.0 |   |
| DPDK-3719 | Cờ mbuf offload cho checksum L3/L4 không đúng |   | 5.15.32\_2.0.0 |   |
| LF-2893 | Các chức năng cần PCI reset, như VFIO, chỉ hoạt động với các PCI endpoint hỗ trợ Function Level Reset (FLR). | Open | 5.15.52-2.1.0 |   |
| LF-2893/LF-2260 | Các chức năng cần PCI reset, như VFIO, chỉ hoạt động với các PCI endpoint hỗ trợ Function Level Reset (FLR). | Open | 5.15.52-2.1.0 |   |
| LF-3076 | Nên chạy hiệu năng Linux IPSec ở tần số core 2100MHz trên LS2088ARDB. | Open | 5.15.52-2.1.0 |   |
| LF-385 | Hiệu năng Linux IPSec giảm trên LS2088A RDB với LTS 5.4. | Open | LSDK 20.04 |   |
| LF-3360 | Các chức năng cần PCI reset, như VFIO, chỉ hoạt động với các PCI endpoint hỗ trợ Function Level Reset (FLR). | Open | 5.15.52-2.1.0 |   |
| LF-3981 | Trên LX2160ARDB, có kernel panic khi unbind dpni trong lúc kiểm thử qos trên Linux. |   | 5.10.35\_2.0.0 |   |
| LF-4151 | Trên LS1028ARDB và các nền tảng DPAA2, hệ thống có thể reset ngẫu nhiên sau khi sleep. | Open | LSDK 21.08 |   |
| LF-4162 | Ubuntu 20.04 có kexec-tools 2.0.18. Với phiên bản này, việc boot kernel thứ hai thất bại. | Open | 5.15.52-2.1.0 | Cài kexec-tools 2.0.21 trong Ubuntu 22.04. |
| LF-4222 | Ngoài các cipher single-pass sau, không có cipher nào khác được offload sang CAAM trên các nền tảng DPAA1:<br>- AES128-SHA1- AES128-SHA256- AES256- SHA1- AES256-SHA256 | Open | 5.15.52-2.1.0 |   |
| LF-4266 | Chế độ IMA EVM fix và enforce không được hỗ trợ. | Open | LSDK 20.12 |   |
| LF-4291 | Các thay đổi trong upstream kernel đối với qdisc pfifo_fast ảnh hưởng tới hiệu năng của các kịch bản mạng, làm giảm 10% đến 14% hiệu năng IP forwarding trên các nền tảng DPAA1. Các thay đổi này được thực hiện để tránh frame bị sai thứ tự. | Open | 5.15.52-2.1.0 | Commit upstream gây lỗi là "Revert "net: dev: introduce support for sch BYPASS for lockless qdisc"". Khi đưa lại commit gốc ("net: dev: introduce support for sch BYPASS for lockless qdisc"), hiệu năng trở lại như cũ (hết bị giảm). Mặt khác, thay đổi này có thể gây ra frame sai thứ tự trong một số kịch bản. Cách khắc phục tạm thời thứ hai để khôi phục hiệu năng là đổi queueing discipline từ pfifo_fast mặc định sang một qdisc khác, như fq_codel. Có thể cần cấu hình thêm cho qdisc. |
| LF-4505 | Không có image firmware tổng hợp secure trên LX2160ARDB và LX2162QQDS. Về tính năng secure boot, xem mục "Secure boot". | Open | 5.15.52-2.1.0 |   |
| LF-6686 | Interrupt job ring của Openssl không tăng sau khi kiểm thử openssl. |   | 5.15.32\_2.0.0 |   |
| LF-8092 | Iperf server bị call trace sau khi đặt MTU trên LS1028ARDB | Open | 5.15.71-2.2.0 |   |
| LF-8753 | Trên LS1043ARDB và LS1046ARDB, kexec\_kdump: không chuyển được sang kernel mới với image mặc định hoặc image build tùy biến. |   | 6.1.1\_1.0.0\_LDP |   |
| LF-8837 | Trên LS1012ARDB, Display: desktop không hiển thị bình thường trên một số màn hình sau khi đăng nhập hệ thống. |   | 6.1.1\_1.0.0\_LDP |   |
| LFU-155 | Trên LS1012AFRWY, driver Ethernet PHY không hoạt động tốt trong U-Boot. | Open | 5.15.52-2.1.0 |   |
| LFU-205 | Chưa bổ sung hỗ trợ cho mọi biến thể giao thức SerDes trong DM_ETH. Để dùng các giao thức dựa trên SGMII/QSGMII trên LS1088AQDS, hãy tắt DM_ETH và các config liên quan. | Open | 5.15.52-2.1.0 |   |
| QLINUX-11792 | Trên LS1043A và LS1046A, có call trace trên cổng quang khi kiểm thử tcp song song với driver DPAA1 upstream. | Open | LSDK 19.06 | Thêm boot parameter 'iommu. passthrough=1' khi dùng driver upstream |
| QLINUX-11797 | Không có hỗ trợ Kexec trên nền tảng LS1021A (Armv7). | Open | LSDK 19.06 |   |
| QSDK-7956 | Switch Felix của LS1028A bị ảnh hưởng bởi erratum A-050484 ("Ethernet flowcontrol not functional on L2 switch NPI port when XFH is used"). Trong cấu hình mặc định, khi control interface được cấu hình là cặp cổng 2.5 Gbps eno2/swp4 và các cổng ngoài chạy ở 1 Gbps, switch bị nghẽn với traffic gửi từ CPU tới các cổng switch. Các luồng traffic như iperf3 TCP có throughput thấp (~300 Mbps) do packet bị drop theo từng đợt khi nghẽn bên trong switch, kích hoạt các thuật toán điều khiển nghẽn của TCP. | Open | 5.15.52-2.1.0 | Cách khắc phục erratum A-050484 không có trong kernel v5.10, vì vậy để tránh vấn đề throughput TCP thấp<br>trong các kịch bản cần thiết, nên chuyển control interface của switch từ cặp cổng 2.5Gbps eno2/swp4 sang cặp cổng 1Gbps eno3/swp5, và dùng cặp cổng 2.5Gbps eno2/swp4 như một cổng dữ liệu thường. Với cấu hình này, có thể bật flow control trên cặp cổng 2.5Gbps, nhờ đó tránh được việc drop do nghẽn bên trong switch.<br>Để biết thêm chi tiết, xem "ENETC Ethernet and Felix switch drivers", và “ENETC Ethernet and Felix switch drivers” để biết các thay đổi chi tiết. |
| QSDK-7971 | Header esbc_validate thất bại trong MC và DPC khi bắt đầu secure boot trên LS1088ARDB | Open | 5.15.52-2.1.0 | Build image cho secure boot mà không dùng bitbake. Mọi image, kể cả binary DPC và MC, cần được ký bằng ứng dụng cst. |
| QSDK-8014 | Khi lặp lại các thao tác create/destroy/reset trên đối tượng dpdmai, MC firmware có thể rơi vào trạng thái không phản hồi, trong đó không thể gửi thêm lệnh nào, khiến các ứng dụng mạng không hoạt động cho đến khi reboot. | Open | LSDK 21.08 |   |
| QUEFI-1950/2033 | USXGMII không được hỗ trợ với UEFI ACPI | Open | LSDK 20.12 |   |
| QUEFI-1951 | QDMA không được hỗ trợ với UEFI ACPI | Open | LSDK 20.12 |   |
| QUEFI-2025 | AQR113C không được hỗ trợ trong UEFI shell trên LX2160ARDB revC. | Open | 5.15.52-2.1.0 |   |

- Lỗi đã đóng: Lỗi đã đóng là các lỗi có nguyên nhân gốc và bản sửa nằm ngoài phạm vi của Layerscape LDP.

  Không có lỗi đã đóng nào trong bản phát hành Layerscape LDP 6.1.1_1.0.0.
