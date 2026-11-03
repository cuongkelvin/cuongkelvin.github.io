# Chương 27 Logging và Debugging

27.1 MC console trong Uboot

27.2 MC/AIOP console trong Linux

Các option cấu hình kernel

Option FSL_LS2_CONSOLE dùng để bật/tắt MC/AIOP console trong Linux.

Đọc console trong Linux

Trong Linux, MC console có thể đọc từ /dev/fsl_mc_console và AIOP console có thể đọc từ /dev/fsl_aiop_console.

Ví dụ:

cat /dev/fsl_mc_console

cat /dev/fsl_aiop_console
