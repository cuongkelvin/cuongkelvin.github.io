# NXP

Sổ tay ghi chép về tài liệu của NXP cho các SoC Layerscape: Linux distribution, quá trình boot, secure boot và kiến trúc mạng DPAA2. Bản dịch tiếng Việt, kèm hình minh họa của tài liệu gốc.

## Layerscape LDP User Guide

Hướng dẫn dùng Layerscape Linux Distribution POC: dựng môi trường, bootloader, kernel, công nghệ mạng QorIQ, ảo hóa, quản lý năng lượng và real-time Linux trên các board Layerscape.

- [Title Page](LLDPUG/ch00_title.vi.md)
- [1. Layerscape LDP Overview](LLDPUG/ch01_layerscape_ldp_overview.vi.md)
- [2. Acronyms and Abbreviations](LLDPUG/ch02_acronyms_and_abbreviations.vi.md)
- [3. Release Notes](LLDPUG/ch03_release_notes.vi.md)
- [4. Getting Started](LLDPUG/ch04_getting_started_with_layerscape_ldp.vi.md)
- [5. Bootloaders](LLDPUG/ch05_bootloaders.vi.md)
- [6. Security](LLDPUG/ch06_security.vi.md)
- [7. Linux Kernel](LLDPUG/ch07_linux_kernel.vi.md)
- [8. QorIQ Networking Technologies](LLDPUG/ch08_qoriq_networking_technologies.vi.md)
- [9. Linux User Space](LLDPUG/ch09_linux_user_space.vi.md)
- [10. Virtualization](LLDPUG/ch10_virtualization.vi.md)
- [11. Power Management](LLDPUG/ch11_power_management.vi.md)
- [12. PREEMPT_RT Real-Time Linux](LLDPUG/ch12_preempt_rt_real_time_linux.vi.md)
- [13. Revision History](LLDPUG/ch13_revision_history.vi.md)
- [14. Note About the Source Code](LLDPUG/ch14_note_about_the_source_code_in_the_document.vi.md)
- [15. Legal Information](LLDPUG/ch15_legal_information.vi.md)

## ARM64 Kernel Booting Process

Boot loader cần chuẩn bị gì để boot kernel ARM64, bố cục bộ nhớ ảo, vector ngắt, FDT mapping và các bước kernel tự khởi động.

- [ARM64 Kernel Booting Process](ARM64_Kernel_Booting_Process/ARM64_Kernel_Booting_Process.vi.md)

## Secure Boot

Thiết lập secure boot cho các nền tảng QorIQ: khái niệm xác thực image bằng chữ ký số, tạo PBL, CSF header, ESBC image và các bước triển khai.

- [Secure Boot on PBL Platforms (Prototype)](Setting_up_Secure_Boot_on_PBL_Based_Platforms_in_Prototype_Stage/Setting_up_Secure_Boot_on_PBL_Based_Platforms_in_Prototype_Stage.vi.md): ví dụ trên LS1043
- [Secure Boot on LS1028ARDB](Setting_up_Secure_Boot_on_LS1028ARDB_Platform/Setting_up_Secure_Boot_on_LS1028ARDB_Platform.vi.md)

## AN5199 – DPAA1 to DPAA2 Transition

Application note so sánh DPAA2 với DPAA1, dành cho người đã quen DPAA1 muốn nắm những khác biệt chính trước khi chuyển sang thiết bị DPAA2.

- [AN5199 – DPAA1 to DPAA2 Transition](AN5199/AN5199.vi.md)

## DPAA2 User Manual

Kiến trúc DPAA2 và Management Complex (MC): quá trình boot, MC firmware, command portal, từng DPAA2 object (DPNI, DPIO, DPSW, DPMAC…), file DPL/DPC, kịch bản sử dụng và debug.

- [Title Page](DPAA2UM/ch00_title.vi.md)
- [1. Introduction](DPAA2UM/ch01_introduction.vi.md)
- [2. Overview](DPAA2UM/ch02_overview.vi.md)
- [3. Boot and Initialization](DPAA2UM/ch03_boot_and_initialization_process.vi.md)
- [4. MC Firmware Versions](DPAA2UM/ch04_mc_firmware_versions.vi.md)
- [5. Management Command Portals](DPAA2UM/ch05_management_command_portals.vi.md)
- [6. DPRC – Resource Container](DPAA2UM/ch06_dprc.vi.md)
- [7. DPNI – Network Interface](DPAA2UM/ch07_dpni.vi.md)
- [8. DPBP – Buffer Pool](DPAA2UM/ch08_dpbp.vi.md)
- [9. DPIO – Data Path I/O](DPAA2UM/ch09_dpio.vi.md)
- [10. DPDBG – Debugging](DPAA2UM/ch10_dpdbg.vi.md)
- [11. DPCON – Concentrator](DPAA2UM/ch11_dpcon.vi.md)
- [12. DPCI – Communication Interface](DPAA2UM/ch12_dpci.vi.md)
- [13. DPDMUX – Network DeMux](DPAA2UM/ch13_dpdmux.vi.md)
- [14. DPSW – L2 Switch](DPAA2UM/ch14_dpsw.vi.md)
- [15. DPMAC – MAC](DPAA2UM/ch15_dpmac.vi.md)
- [16. DPRTC – Real Time Clock](DPAA2UM/ch16_dprtc.vi.md)
- [17. DPSECI – SEC Interface](DPAA2UM/ch17_dpseci.vi.md)
- [18. DPDCEI – DCE Interface](DPAA2UM/ch18_dpdcei.vi.md)
- [19. DPDMAI – DMA Interface](DPAA2UM/ch19_dpdmai.vi.md)
- [20. DPAIOP – AIOP Control](DPAA2UM/ch20_dpaiop.vi.md)
- [21. DPMCP – MC Portal](DPAA2UM/ch21_dpmcp.vi.md)
- [22. DPSPARSER – Soft Parser](DPAA2UM/ch22_dpsparser.vi.md)
- [23. Memory Map and Registers](DPAA2UM/ch23_memory_map_and_register_definition.vi.md)
- [24. DPL Reference](DPAA2UM/ch24_dpl_reference.vi.md)
- [25. DPC Reference](DPAA2UM/ch25_dpc_reference.vi.md)
- [26. Use Case Scenarios](DPAA2UM/ch26_use_case_scenarios.vi.md)
- [27. Logging and Debugging](DPAA2UM/ch27_logging_and_debugging.vi.md)
- [28. Known Limitations](DPAA2UM/ch28_known_limitations.vi.md)
- [A. Revision History](DPAA2UM/appA_revision_history.vi.md)
