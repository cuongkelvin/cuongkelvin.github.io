# Thiết lập Secure Boot trên nền tảng LS1028ARDB

Tài liệu này giới thiệu các phương pháp và quy trình thiết lập secure boot cho nền tảng LS1028ARDB trong giai đoạn Development. Tài liệu giải thích khái niệm cơ bản về secure boot trên LS1028A; mô tả cách tạo ESBC image và CSF header cho secure boot và cách triển khai các image liên quan đến secure boot lên target; giới thiệu cách blow fuse OTPMK trong u-boot và qua CCS; giới thiệu cách ghi SRK hash key vào các mirror register qua CCS ở giai đoạn prototype; đưa ra cách xử lý sự cố khi secure boot thất bại mà không in ra thông báo nào trên UART console.

## Khái niệm cơ bản về Secure boot trên nền tảng LS1028A

Quá trình secure boot dùng một thủ tục kiểm tra chữ ký số để xác thực image. Thủ tục này kiểm tra bằng cách giải mã hash đã được ký bằng một RSA public key gắn với phần cứng. Sau đó hash này được so với hash vừa tính lại cho chính system image đó. Nếu so khớp, image được coi là xác thực.

Có các cặp RSA public key và private key: private key dùng để ký image, còn public key dùng để kiểm tra image trong giai đoạn ISBC và ESBC. Public key được nhúng trong header, còn hash của bảng SRK được ghi bằng fuse vào thanh ghi SRKH của SFP.

OTPMK (One Time Programmable Master Key) được dùng để mã hóa và giải mã các secret key bổ sung (cũng chỉ module SEC dùng được), các key này có thể dùng để bảo vệ dữ liệu bất kỳ.

Chain of Trust (CoT) bảo đảm chỉ những image xác thực/hợp lệ mới được chạy trên nền tảng. Việc xác thực image trong CoT được chia thành các giai đoạn sau.

Giai đoạn Pre-boot và Internal Secure Boot Code (ISBC)<br>
Trong giai đoạn development, đặt RCW[SB_EN] = 1 để boot hệ thống ở chế độ secure. Trong giai đoạn production, đặt bit ITS trong SFP để bảo đảm hệ thống hoạt động một cách an toàn và tin cậy. Khi fuse ITS của SFP đã bị blow thì không thể thay đổi được nữa. Service Processor là bus master đầu tiên chạy khi thiết bị ra khỏi reset. Nó là điểm khởi đầu của chain of trust trong secure boot. Service Processor thực thi các lệnh PBI. ISBC nằm trong Service Processor kiểm tra các lệnh PBI trước khi thực thi. ISBC cũng kiểm tra BL2 rồi nhả core master Armv8 của SoC (CPU 0) để chạy BL2 đã được kiểm tra.

Giai đoạn External Secure Boot Code (ESBC)<br>
Khác với ISBC nằm trong BootROM và không sửa được, ESBC có thể do bạn sửa.<br>
ESBC gồm:<br>
Image BL2, image này tiếp tục kiểm tra các image BL31, BL32 và BL33 (U-Boot)<br>
Image U-Boot, image này kiểm tra các image mà nó nạp. Ví dụ: Linux, DTB, firmware MC<br>
ESBC có thể dùng nguyên trạng, vì nó được cung cấp trong hệ thống secure boot do NXP đưa ra như một phần của LSDK. Hoặc bạn có thể dùng ESBC làm tham khảo để sửa hệ thống secure boot của mình.<br>
NXP đưa ra hai hệ thống secure boot:<br>
Kiểm tra ESBC image bằng NXP CSF header — còn gọi là NXP CoT cho ESBC image<br>
Kiểm tra ESBC image bằng chứng chỉ X509 — được bật trên nền tảng NXP qua TF-A — đáp ứng Trusted Board Boot Requirements (TBBR) do Arm khuyến nghị — còn gọi là Arm CoT cho ESBC image

## Build ATF image cho secure boot

Linux SDK cung cấp Code Signing Tool để hỗ trợ quá trình Secure boot. Công cụ CST có thể dùng để tạo RSA public key và private key, OTPMK và DRV key đã chèn mã hamming, CSF header cho một image, và để ký code bằng RSA private key.

```text
    $ git clone https://github.com/nxp-qoriq/cst.git
    $ cd cst/
    $ make
    $ ./gen_keys 1024
```

Build u-boot image cho secure boot bằng các lệnh sau.

```text
$ export CROSS_COMPILE=aarch64-linux-gnu-
$ export ARCH=arm64
$ make ls1028ardb_tfa_SECURE_BOOT_defconfig
$ make
```

Build atf image cho secure boot bằng lệnh sau *(ghi chú: trong lệnh, `SPD=opted` đúng là `SPD=opteed`)*

```text
make PLAT=<platform> TRUSTED_BOARD_BOOT=1 CST_DIR=$CST_DIR_PATH RCW=$RCW_BIN BL32=$TEE_BIN SPD=opted BL33=$UBOOT_SECURE_BIN pbl fip
```

Ví dụ:

```text
make -s -j4 fip pbl PLAT=ls1028ardb BOOT_MODE=flexspi_nor RCW=/home/nxa22585/data/flexbuild_lsdk2108_github/build/firmware/rcw/ls1028ardb/R_SQPP_0x85bb/rcw_1500_gpu600.bin
BL33=/home/nxa22585/data/flexbuild_lsdk2108_github/build/firmware/u-boot/ls1028ardb/uboot_ls1028ardb_tfa_SECURE_BOOT.bin TRUSTED_BOARD_BOOT=1 CST_DIR=/home/nxa22585/data/flexbuild_lsdk2108_github/components/apps/security/cst
```

Lấy SRK (Public Key) Hash như dưới đây trên console khi build atf image cho secure boot.

```text
************************************************
* Header File is with Signature appended
************************************************

Header File Created: /opt/samba/nxa22585/flexbuild_lsdk2108_github/components/firmware/atf/build/ls1028ardb/release/hdr_bl2

SRK (Public Key) Hash:
2bbcef9901ddcbf7ea146ab5113f67b405b75329ced05177bcf949462c2ee9da
          SFP SRKHR0 = 2bbcef99
          SFP SRKHR1 = 01ddcbf7
          SFP SRKHR2 = ea146ab5
          SFP SRKHR3 = 113f67b4
          SFP SRKHR4 = 05b75329
          SFP SRKHR5 = ced05177
          SFP SRKHR6 = bcf94946
          SFP SRKHR7 = 2c2ee9da
```

Các binary secure boot cho Arm CoT có trong thư mục atf:

```text
build/release/fip.bin
build/release/bl2_flexspi_nor_sec.pbl
```

Phần sau giới thiệu cách tạo RCW và PBI trong ATF image cho secure boot.

```text
$ git clone https://github.com/nxp-qoriq/rcw.git
$ cd rcw
$ git checkout -b LSDK-21.08 LSDK-21.08
$ ./rcw.py -r --rcwi=ls1028asi/ls1028a.rcwi -i ~/data/flexbuild_lsdk2108_github/components/firmware/atf/build/ls1028ardb/release/bl2_flexspi_nor_sec.pbl -o ~/data/a.rcw
```

Bạn sẽ thấy “SB_EN=1” trong file a.rcw.

Trong source code atf, file tools/nxp/pbl_ch3.mk, đoạn code sau được dùng để tạo các lệnh PBI cho secure boot.

```make
    # Add Block Copy command for bl2.bin to RCW
    ${CREATE_PBL} -r ${RCW} -i ${BUILD_PLAT}/bl2.bin -b ${BOOT_MODE} -c ${SOC_NUM} -d ${BL2_BASE} -e ${BL2_BASE}\
                -o ${BUILD_PLAT}/bl2_${BOOT_MODE}.pbl -f ${BL2_SRC_OFFSET};\

    # Add Block Copy command and Load CSF header command to RCW
    ${CREATE_PBL} -r ${BUILD_PLAT}/bl2_${BOOT_MODE}.pbl -i ${BUILD_PLAT}/hdr_bl2 -b ${BOOT_MODE} -c ${SOC_NUM} \
                -d ${BL2_HDR_LOC} -e ${BL2_HDR_LOC} -s -f ${BL2_HDR_SRC_OFFSET} \
                -o ${BUILD_PLAT}/rcw_sec.pbl

    # Sign and add "Load Security Header command to PBI commands
    $(Q)$(CST_DIR)/create_hdr_pbi --out ${BUILD_PLAT}/bl2_${BOOT_MODE}_sec.pbl --in ${BUILD_PLAT}/rcw_sec.pbl ${PBI_INPUT_FILE}
```

## Tạo CSF header cho secure boot của Linux tiny itb image

*Hãy sao chép các file sau vào thư mục CST và lưu chúng với tên bootscript, uImage.dtb, uImage.bin và kernel.itb.*<br>
*Sao chép bootscript*<br>
*Sao chép dtb*<br>
*Sao chép linux tiny itb*<br>
*Sao chép kernel*<br>
Sau đó chạy script sau để tạo secure boot header secboot_hdrs.bin

```text
$ ./scripts/platforms/ls1028_secboot_hdr.sh
```

Kết quả tương tự như sau.

```text
Input File is input_files/uni_sign/ls1028/input_kernel_secure

************************************************
* Header File is with Signature appended
************************************************

Header File Created: hdr_kernel.out

SRK (Public Key) Hash:
2bbcef9901ddcbf7ea146ab5113f67b405b75329ced05177bcf949462c2ee9da
          SFP SRKHR0 = 2bbcef99
          SFP SRKHR1 = 01ddcbf7
          SFP SRKHR2 = ea146ab5
          SFP SRKHR3 = 113f67b4
          SFP SRKHR4 = 05b75329
          SFP SRKHR5 = ced05177
          SFP SRKHR6 = bcf94946
          SFP SRKHR7 = 2c2ee9da
```

## Triển khai các image secure boot lên board target.

a. Flash binary PBL:

```text
=> tftp 0x82000000 bl2_flexspi_nor_sec.pbl;
=>sf probe 0:0; sf erase 0 +$filesize; sf write 0x82000000 0x0 $filesize;
```

b. Flash binary FIP:

```text
=> tftp 0x82000000 fip.bin;
=> sf probe 0:0; sf erase 0x100000 +$filesize; sf write 0x82000000 0x100000 $filesize;
```

c. Flash Kernel.itb

```text
=> tftp 0x82000000 lsdk2108_yocto_tiny_LS_arm64.itb
=> sf probe 0:0; sf erase 0x01000000 +$filesize; sf write 0x82000000 0x01000000 $filesize;
```

d. Flash CSF header cho Linux tiny itb image

```text
=> tftp 0x82000000 secboot_hdrs.bin
=> sf probe 0:0; sf erase 0x00600000 +$filesize; sf write 0x82000000 0x00600000 $filesize;
```

## Blow fuse OTPMK trong u-boot và qua CodeWarrior CCS

Blow OTPMK là việc bắt buộc để chạy secure boot cho cả giai đoạn Production lẫn Development.<br>
Vào thư mục công cụ CST và tạo OTPMK key bằng lệnh sau.

```text
$ ./gen_otpmk_drbg -b 2
```

Để blow OTPMK, cắm jumper vào J28 (TA_PROG_SFP) để cấp 1.8 V cho PROG_SFP.

Blow OTPMK từ u-boot:

```text
=>md 0x1e90014
      NOTE: 88000900
  8(8)000900 -> bits in () should be 8
```

ghi giá trị fuse OTPMK vào các shadow register

```text
=> mw.l 1e80234 a29a0b2c
=> mw.l 1e80238 2c8cd201
=> mw.l 1e8023c 84027ca8
=> mw.l 1e80240 8e13c7b9
=> mw.l 1e80244 a0b9d347
=> mw.l 1e80248 50ef2622
=> mw.l 1e8024c 98a92efd
=> mw.l 1e80250 ed53d1c3
```

kiểm tra lại trạng thái SNVS.

```text
=>md 1e90014
      NOTE: 80000900
      (1) 8(0)000900 -> bits in () should be 0
      (2) 80(000)900 -> bits in () would be all 0's
=>md 1e80024
      NOTE: 00000000
```

Blow OTPMK vào fuse nếu không thấy lỗi parity

```text
=>mw 1e80020 0x02
```

Tắt nguồn rồi bật lại board và kiểm tra SNVS đang ở trạng thái Check.

```text
md 1e90014
      NOTE: 80000900
```

Tắt nguồn board và tháo jumper trên J28 (TA_PROG_SFP).

Blow fuse OTPMK qua CodeWarrior CCS.<br>
Chạy các lệnh dưới đây từ ccs console:

```text
% delet all
% config cc cwtap:10.192.208.176      NOTE: change the CW TAP IP in your case
% show cc
% ccs::config_chain {ls1028a dap}
% display ccs::get_config_chain

// check initial SNVS state

% ccs::display_mem 21 0x1e90014 4 0 4

NOTE: <sap chain position>

NOTE: 88000900

(bin) 10 % ccs::display_mem 21 0x1e90014 4 0 4
                           +0       +4       +8       +C
[0x01E90014] 88000900 80000000 00000000 00000000


% ccs::write_mem 21 0x1e80234 4 0 0xa29a0b2c
% ccs::write_mem 21 0x1e80238 4 0 0x2c8cd201
% ccs::write_mem 21 0x1e8023c 4 0 0x84027ca8
% ccs::write_mem 21 0x1e80240 4 0 0x8e13c7b9
% ccs::write_mem 21 0x1e80244 4 0 0xa0b9d347
% ccs::write_mem 21 0x1e80248 4 0 0x50ef2622
% ccs::write_mem 21 0x1e8024c 4 0 0x98a92efd
% ccs::write_mem 21 0x1e80250 4 0 0xed53d1c3

% ccs::display_mem 21 0x1e90014 4 0 4

      NOTE: 80000900

% ccs::display_mem 21 0x1e80024 4 0 4
        NOTE: 00000000

% ccs::write_mem 21 0x1e80020 4 0 0x2
```

Tắt nguồn rồi bật lại board và kiểm tra SNVS đang ở trạng thái Check.

```text
% delet all
% config cc cwtap:10.192.208.176      NOTE: change the CW TAP IP in your case
% show cc

% ccs::config_chain {ls1028a dap}
% display ccs::get_config_chain

% ccs::display_mem 21 0x1e90014 4 0 4

NOTE: 80000900 means that OTPMK is blown successfully.

(bin) 191 % ccs::display_mem 86 0x1e90014 4 0 4
                           +0       +4       +8       +C
[0x01E90014] 80000900 80000000 00000000 00000000
```

## Ghi SRK hash key vào các mirror register qua CCS

Với secure boot từ FlexSPI NOR

```text
// Put the board into RSP (Reset Pause) – from CCS console

% delet all
% config cc cwtap:10.192.208.152
% show cc

% ccs::config_chain testcore
% jtag::lock
% jtag::state_move test_logic_reset

% jtag::scan_out ir 4 3
% jtag::scan_out dr 6 1
% jtag::scan_io ir 8 0x93
% jtag::scan_io dr 64 0x0

% jtag::scan_io ir 8 0x92
% jtag::scan_io dr 64 0x0

% jtag::set_pin 0 0
% after 100

% puts [jtag::scan_io ir 8 0x93]
% puts [jtag::scan_io dr 64 0x0000010071FF001F]

% jtag::set_pin 0 1
% jtag::unlock

// wait here for 2-3 secs to reset the board by above steps

// Use CCS commands to write SRK hash and get system out of Reset Pause State

% ccs::config_chain {ls1028a dap}
% display ccs::get_config_chain

% ccs::write_mem 2 0x7 0x001000D0 4 0 0x00080000
% ccs::stop_core 1

NOTE: for example, for following SRK Hash

SRK (Public Key) Hash:
461e00d93e0a80aea69f278d1dc2a1aa100d089cb1ccede0dfa4ad62c3448094
          SFP SRKHR0 = 461e00d9
          SFP SRKHR1 = 3e0a80ae
          SFP SRKHR2 = a69f278d
          SFP SRKHR3 = 1dc2a1aa
          SFP SRKHR4 = 100d089c
          SFP SRKHR5 = b1ccede0
          SFP SRKHR6 = dfa4ad62
          SFP SRKHR7 = c3448094

// Change the value to your SRK Hash values
% ccs::write_mem 1 0x1e80254 4 0 0x461e00d9
% ccs::write_mem 1 0x1e80258 4 0 0x3e0a80ae
% ccs::write_mem 1 0x1e8025c 4 0 0xa69f278d
% ccs::write_mem 1 0x1e80260 4 0 0x1dc2a1aa
% ccs::write_mem 1 0x1e80264 4 0 0x100d089c
% ccs::write_mem 1 0x1e80268 4 0 0xb1ccede0
% ccs::write_mem 1 0x1e8026c 4 0 0xdfa4ad62
% ccs::write_mem 1 0x1e80270 4 0 0xc3448094

% ccs::display_mem 1 0x1e80254 4 0 8
% ccs::run_core 1
% ccs::write_mem 2 0x7 0x001000D0 4 0 0x00040000
```

NOTE: sau khi chạy lệnh CCS cuối cùng, board sẽ secure boot từ FlexSPI NOR

Với secure boot từ SD:<br>
NOTE: với secure boot từ SD, đặt SW2[1:4] thành 1000

```text
// Put the board into RSP (Reset Pause)

        % delet all
        % config cc cwtap:10.192.208.152
        % show cc

% ccs::config_chain testcore
% jtag::lock
% jtag::state_move test_logic_reset

% jtag::scan_out ir 4 3
% jtag::scan_out dr 6 1
% jtag::scan_io ir 8 0x93
% jtag::scan_io dr 64 0x0

% jtag::scan_io ir 8 0x92
% jtag::scan_io dr 64 0x0

% jtag::set_pin 0 0
% after 100

% puts [jtag::scan_io ir 8 0x93]
% jtag::scan_io 1 64 0x00000103713F0011
% jtag::set_pin 0 1
% jtag::unlock

// wait here for 2-3 secs to reset the board by above steps

// Use CCS commands to write SRK hash and get system out of Reset Pause State

% ccs::config_chain {ls1028a dap}
% display ccs::get_config_chain

% ccs::write_mem 2 0x7 0x001000D0 4 0 0x00080000
% ccs::stop_core 1


        NOTE: for example, for following SRK Hash

SRK (Public Key) Hash:
461e00d93e0a80aea69f278d1dc2a1aa100d089cb1ccede0dfa4ad62c3448094
          SFP SRKHR0 = 461e00d9
          SFP SRKHR1 = 3e0a80ae
          SFP SRKHR2 = a69f278d
          SFP SRKHR3 = 1dc2a1aa
          SFP SRKHR4 = 100d089c
          SFP SRKHR5 = b1ccede0
          SFP SRKHR6 = dfa4ad62
          SFP SRKHR7 = c3448094

// // Change the value in blue background to your SRK Hash values
% ccs::write_mem 1 0x1e80254 4 0 0x461e00d9
% ccs::write_mem 1 0x1e80258 4 0 0x3e0a80ae
% ccs::write_mem 1 0x1e8025c 4 0 0xa69f278d
% ccs::write_mem 1 0x1e80260 4 0 0x1dc2a1aa
% ccs::write_mem 1 0x1e80264 4 0 0x100d089c
% ccs::write_mem 1 0x1e80268 4 0 0xb1ccede0
% ccs::write_mem 1 0x1e8026c 4 0 0xdfa4ad62
% ccs::write_mem 1 0x1e80270 4 0 0xc3448094

% ccs::display_mem 1 0x1e80254 4 0 8
% ccs::run_core 1
% ccs::write_mem 2 0x7 0x001000D0 4 0 0x00040000
```

NOTE: sau khi chạy lệnh CCS cuối cùng, u-boot secure từ SD sẽ boot

Hãy tham khảo console log secure boot sau.

```text
NOTICE:    4 GB DDR4, 32-bit, CL=11, ECC on
NOTICE:    BL2: v2.4(release):LSDK-21.08-0-g340b20bcb
NOTICE:    BL2: Built : 22:19:35, Aug 27 2021
NOTICE:    Initializing & configuring SEC block.
NOTICE:    Sec is already initialized and configured.
NOTICE:    Verifying RSA
NOTICE:    Verifying hash
NOTICE:    Verifying RSA
NOTICE:    Verifying hash
NOTICE:    Verifying RSA
NOTICE:    Verifying hash
NOTICE:    BL2: Booting BL31
NOTICE:    BL31: v2.4(release):LSDK-21.08-0-g340b20bcb
NOTICE:    BL31: Built : 22:19:45, Aug 27 2021
NOTICE:    Welcome to ls1028ardb BL31 Phase


U-Boot 2021.04-ge2eba0cd58 (Aug 27 2021 - 22:19:22 +0800)

SoC:    LS1028AE Rev1.0 (0x870b0010)
Clock Configuration:
        CPU0(A72):1500 MHz    CPU1(A72):1500 MHz
        Bus:      400  MHz    DDR:      1600 MT/s
Reset Configuration Word (RCW):
        00000000: 3c004010 00000030 00000000 00000000
        00000010: 00000000 018f0000 0030c000 00000000
        00000020: 03b035a0 00002580 00000000 00003296
        00000030: 00000000 00000010 00000000 00000000
        00000040: 00000000 00000000 00000000 00000000
        00000050: 00000000 00000000 00000000 00000000
        00000060: 00000000 00000000 200e705a 00000000
        00000070: bb580000 00000000
Model: NXP Layerscape 1028a RDB Board
Board: LS1028AE Rev1.0-RDB, Version: C, boot from SD
FPGA: v8 (RDB)
SERDES1 Reference : Clock1 = 100.00MHz Clock2 = 100.00MHz
DRAM:  3.9 GiB
DDR    3.9 GiB (DDR4, 32-bit, CL=11, ECC on)
Using SERDES1 Protocol: 47960 (0xbb58)
PCIe1: pcie@3400000 Root Complex: no link
PCIe2: pcie@3500000 Root Complex: no link
WDT:   Started with servicing (60s timeout)
MMC:   FSL_SDHC: 0, FSL_SDHC: 1
EEPROM: Invalid ID (ff ff ff ff)
In:    serial
Out:   serial
Err:   serial
SEC0:  RNG instantiated
Net:
Warning: enetc-0 (eth0) using random MAC address - fa:6e:04:23:2e:b5
eth0: enetc-0
Warning: enetc-2 (eth1) using random MAC address - 1e:92:6f:24:49:8a
, eth1: enetc-2, eth2: swp0, eth3: swp1, eth4: swp2, eth5: swp3
Trying load HDP firmware from SD..
switch to partitions #0, OK
mmc0 is current device
Device: FSL_SDHC
Manufacturer ID: 6f
OEM: 303
Name: SDABC
Bus Speed: 50000000
Mode: SD High Speed (50MHz)
Rd Block Len: 512
SD version 3.0
High Capacity: Yes
Capacity: 58.6 GiB
Bus Width: 4-bit
Erase Group Size: 512 Bytes
```

## Xử lý sự cố Secure boot.

Nếu không có thông báo nào in ra trên UART console, hãy dùng các bước sau để xử lý sự cố.

a. Kiểm tra SecMon_HP Status Register (0x1e90014), các bit OTPMK_ZERO phải bằng 0. SFP_SVHESR(0x1e80024) phải bằng 0, nếu không thì fuse OTPMK bạn đã blow có lỗi.<br>
b. Nếu fuse OTPMK đúng (xem Bước 1), kiểm tra thanh ghi SCRATCHRW3(0x 1E00208) để tìm lỗi.<br>
Về các mã lỗi ISBC Validation, hãy tham khảo “Table 42. ISBC error codes” trong user guide LSDK 21.08.
