# Phụ lục B. Các lệnh U-Boot có thể cấu hình

U-Boot có hơn 70 lệnh cấu hình được. Bảng B-1 tổng hợp từ U-Boot snapshot gần đây. Ngoài ra nhiều lệnh không chuẩn, một số phụ thuộc hardware cụ thể hoặc thử nghiệm. Để có danh sách đầy đủ up-to-date, xem source code. Lệnh ở đây định nghĩa trong header file `.../include/config_cmd_all.h` từ U-Boot source directory top-level.

BẢNG B-1 Các lệnh U-Boot có thể cấu hình

| Command set | Lệnh |
|---|---|
| `CONFIG_CMD_AMBAPP` | In tổng quan thông tin AMBA Bus Plug \& Play |
| `CONFIG_CMD_ASKENV` | Nhắc nhập environment variable |
| `CONFIG_CMD_AT91_SPIMUX` | Chưa triển khai trong U-Boot source gần đây |
| `CONFIG_CMD_AUTOSCRIPT` | Hỗ trợ Autoscript |
| `CONFIG_CMD_BDI` | Bdinfo: hiển thị board information |
| `CONFIG_CMD_BEDBUG` | Gồm BedBug debugger |
| `CONFIG_CMD_BMP` | Hỗ trợ BMP |
| `CONFIG_CMD_BOOTD` | Bootd: boot lệnh mặc định |
| `CONFIG_CMD_BSP` | Function Board-specific |
| `CONFIG_CMD_CACHE` | Lệnh icache, dcache |
| `CONFIG_CMD_CDP` | Cisco Discovery Protocol |
| `CONFIG_CMD_CONSOLE` | coninfo: hiển thị console info |
| `CONFIG_CMD_DATE` | Hỗ trợ RTC, ngày/giờ, v.v. |
| `CONFIG_CMD_DHCP` | Hỗ trợ DHCP |
| `CONFIG_CMD_DIAG` | Chẩn đoán |
| `CONFIG_CMD_DISPLAY` | Hỗ trợ display |
| `CONFIG_CMD_DOC` | Hỗ trợ Disk-on-chip |
| `CONFIG_CMD_DTT` | Nhiệt kế và thermostat số |
| `CONFIG_CMD_ECHO` | Echo argument |
| `CONFIG_CMD_EDITENV` | Sửa environment variable tương tác |
| `CONFIG_CMD_EEPROM` | Hỗ trợ read/write EEPROM |
| `CONFIG_CMD_ELF` | Lệnh load/boot ELF (VxWorks) |
| `CONFIG_CMD_EXT2` | Hỗ trợ EXT2 |
| `CONFIG_CMD_FAT` | Hỗ trợ FAT |
| `CONFIG_CMD_FDC` | Hỗ trợ floppy disk |
| `CONFIG_CMD_FDOS` | Hỗ trợ Floppy DOS |
| `CONFIG_CMD_FLASH` | flinfo, erase, protect |
| `CONFIG_CMD_FPGA` | Hỗ trợ FPGA configuration |
| `CONFIG_CMD_HWFLOW` | RTS/CTS hardware flow control |
| `CONFIG_CMD_I2C` | Hỗ trợ I2C serial bus |
| `CONFIG_CMD_IDE` | Hỗ trợ IDE hard disk |
| `CONFIG_CMD_IMI` | iminfo |
| `CONFIG_CMD_IMLS` | Liệt kê mọi image tìm thấy |
| `CONFIG_CMD_IMMAP` | Hỗ trợ IMMR dump |
| `CONFIG_CMD_IRQ` | irqinfo |
| `CONFIG_CMD_ITEST` | Kiểm tra integer (và string) |
| `CONFIG_CMD_JFFS2` | Hỗ trợ JFFS2 |
| `CONFIG_CMD_KGDB` | kgdb |
| `CONFIG_CMD_LICENSE` | In văn bản GPL license |
| `CONFIG_CMD_LOADB` | loadb |
| `CONFIG_CMD_LOADS` | loads |
| `CONFIG_CMD_MEMORY` | md, mm, nm, mw, cp, cmp, crc, base, loop, mtest |
| `CONFIG_CMD_MFSL` | Hỗ trợ Microblaze FSL |
| `CONFIG_CMD_MG_DISK` | Hỗ trợ Mflash |
| `CONFIG_CMD_MII` | Hỗ trợ MII |
| `CONFIG_CMD_MISC` | Function khác như sleep |
| `CONFIG_CMD_MMC` | Hỗ trợ MMC |
| `CONFIG_CMD_MTDPARTS` | Hỗ trợ quản lý MTD partition |
| `CONFIG_CMD_NAND` | Hỗ trợ NAND |
| `CONFIG_CMD_NET` | bootp, tftpboot, rarpboot |
| `CONFIG_CMD_NFS` | Hỗ trợ NFS |
| `CONFIG_CMD_ONENAND` | Hỗ trợ OneNAND subsystem |
| `CONFIG_CMD_PCI` | pciinfo |
| `CONFIG_CMD_PCMCIA` | Hỗ trợ PCMCIA |
| `CONFIG_CMD_PING` | Hỗ trợ Ping |
| `CONFIG_CMD_PORTIO` | Port I/O |
| `CONFIG_CMD_REGINFO` | Dump register |
| `CONFIG_CMD_REISER` | Hỗ trợ Reiserfs |
| `CONFIG_CMD_RUN` | Chạy command trong environment variable |
| `CONFIG_CMD_SAVEENV` | Lệnh lưu environment |
| `CONFIG_CMD_SAVES` | Lưu S record dump |
| `CONFIG_CMD_SCSI` | Hỗ trợ SCSI |
| `CONFIG_CMD_SDRAM` | In SDRAM DIMM SPD info |
| `CONFIG_CMD_SETEXPR` | Đặt environment variable từ eval expression |
| `CONFIG_CMD_SETGETDCR` | Hỗ trợ DCR trên 4xx |
| `CONFIG_CMD_SNTP` | Hỗ trợ SNTP |
| `CONFIG_CMD_SOURCE` | Chạy script (source) từ memory |
| `CONFIG_CMD_SPI` | Tiện ích SPI |
| `CONFIG_CMD_TERMINAL` | Khởi động terminal emulator trên port |
| `CONFIG_CMD_UNIVERSE` | Hỗ trợ Tundra Universe |
| `CONFIG_CMD_UNZIP` | Giải nén memory region |
| `CONFIG_CMD_USB` | Hỗ trợ USB |
| `CONFIG_CMD_VFD` | Hỗ trợ VFD (TRAB) |
| `CONFIG_CMD_XIMG` | Load phần của multi-image |
