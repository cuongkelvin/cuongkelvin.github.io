# 4 Bắt đầu với Layerscape LDP

## 4.1 Yêu cầu hệ thống host

Thiết lập hệ thống host như sau:

1. Cài Ubuntu 20.04 LTS lên máy host:

   a. Lấy quyền sudo bằng cách chạy lệnh:

   `sudoedit /etc/sudoers`

   b. Thêm một dòng:

   <`account-name`> `ALL=(ALL:ALL) NOPASSWD: ALL`

2. Để build NXP Layerscape LDP userland cho target kiến trúc arm64/armhf, môi trường mạng của người dùng phải truy cập được server chính thức của Ubuntu.

### 4.1.1 Cách đặt HTTP proxy trong Ubuntu

Nếu máy Linux host của bạn nằm trong một subnet cần HTTP(s) proxy để truy cập Internet bên ngoài, hãy đặt các biến môi trường `http_proxy` và `https_proxy` như dưới đây:

1. Đặt proxy trong `~/.bashrc` (cho người dùng hiện tại) hoặc trong `/etc/profile.d/proxy.sh` (cho mọi người dùng), sau đó chạy source `~/.bashrc` hoặc `source /etc/profile.d/proxy.sh` để áp dụng các thiết lập.

   ```
   export http_proxy="http://<account>:<password>@<domain>:<port>"
   export https_proxy="https://<account>:<password>@<domain>:<port>"
   ```

2. Đặt proxy trong `/etc/apt/apt.conf`

   ```
   Acquire::http::Proxy "http://<account>:<password>@<domain>:<port>";
   Acquire::https::Proxy "https://<account>:<password>@<domain>:<port>";
   ```

## 4.2 Tải và triển khai các image Layerscape LDP trong môi trường Linux bằng flex-installer

Bạn có thể dễ dàng build Layerscape LDP từ source bằng Yocto bitbake. Đây là một engine thực thi task tổng quát cho phép chạy hiệu quả các task shell và Python, đồng thời làm việc trong các ràng buộc phụ thuộc phức tạp giữa các task.

Để build Layerscape LDP từ source, xem Section 4.5.

Table 7 liệt kê và giải thích các tùy chọn lệnh dùng trong các lệnh `flex-installer`.

**Table 7. Các tùy chọn lệnh flex-installer**

| Tùy chọn lệnh | Mô tả | Giá trị được hỗ trợ |
|---|---|---|
| `-m <machine>` | Chỉ tên board. | ls1012afrwy, ls1021atwr, ls1028ardb, ls1043ardb, ls1046ardb, ls1046afrwy, ls1088ardb, ls2088ardb, lx2160ardb_rev2, lx2162aqds |
| `-f <firmware>` | Chỉ image firmware. | firmware\_\<machine>_\<boottype>.img |
| `-b <boot_`<br>`partition>` | Chỉ image bootpartition. Có một bộ image bootpartition cho mỗi phiên bản Linux kernel và nền tảng (64-bit) mà Layerscape LDP hỗ trợ. | boot_LS_arm64_lts\_\<version>.tgz |
| `-B, --bootpart` | Chỉ định số partition boot để thay giá trị mặc định (partition boot mặc định là partition thứ 2) | Ví dụ,<br>-B 1 hoặc<br>--bootpart=1 |
| `-r <rootfs>` | Chỉ NXP Layerscape LDP userland. Có các image rootfs khác nhau cho userland mặc định và userland Edgescale. | ls-image-main-\<machine>.tar.gz<br>Ví dụ, \<machine> = ls1028ardb:<br>ls-image-desktop-ls1028ardb.tar.gz |
| `-R, --rootpart` | Chỉ định số partition root để thay giá trị mặc định (partition root mặc định là partition thứ 4) | Ví dụ, chỉ định partition thứ ba làm partition root:<br>-R 3 hoặc<br>--rootpart=3 |
| `-d <device>` | Chỉ thiết bị lưu trữ (SD, USB hoặc SATA)<br>Ghi chú:<br>• Dùng lệnh `cat /proc/partitions` để xem danh sách thiết bị và dung lượng của chúng, để bảo đảm đã chọn đúng tên thiết bị.<br>• Ổ lưu trữ SD/USB/SATA trên Linux PC được nhận là `/dev/sdX`, trong đó X là một chữ cái như a, b, c. Hãy chọn đúng tên thiết bị, vì dữ liệu trên thiết bị này sẽ bị thay thế.<br>• Nếu máy Linux host hỗ trợ đọc/ghi thẻ SD trực tiếp mà không cần thêm đầu đọc thẻ SD, tên thiết bị của thẻ SD thường là `mmcblk0`. | /dev/\<device_name> |
| `-e <dtb>` | Tùy chọn ‘-e dtb' được dùng cho UEFI theo cách DTB. Tham số này cài grub.cfg, efi.fd<br>Không cần thêm tùy chọn '-e' trong trường hợp U-Boot là bootloader mặc định | dtb, không cần tùy chọn này trong trường hợp U-Boot là bootloader |
| `-u <url>` | Chỉ định URL của web server distro để thay URL mặc định khi tự động tải distro. | URL của web server distro |

**Ghi chú:**

- Firmware tổng hợp dựa trên U-Boot phải được ghi vào thiết bị flash (không phải thẻ SD) trên LS2088ARDB/LS1012ARDB/LS1012AFRWY; không có giới hạn trên các board Layerscape khác.
- Người dùng có thể cài rootfs của distro và tarball bootpartition vào thẻ SD (hoặc đĩa USB/SATA) trên mọi board Layerscape.
- Để chạy lệnh flex-installer trên ổ lưu trữ đích gắn với một board tham chiếu, bạn phải boot board với TinyLinux và bật network interface.

  Để biết chi tiết, tham khảo To deploy Layerscape LDP images on a reference board running TinyLinux.

- Để triển khai các image Layerscape LDP tùy biến tại chỗ lên ổ lưu trữ đích gắn với một máy Linux host hoặc một board tham chiếu.

  **Cách dùng:**

  ```
  $ flex-installer -b <boot_partition> -r <rootfs> -f <firmware> -d <device>
  ```

  Để xem danh sách giá trị được hỗ trợ cho `<boot_partition>`, `<rootfs>`, `<firmware>` và `<device>`, xem Table 7. **Ví dụ:** Với ls1043ardb:

  ```
  $ flex-installer -b boot_ls1043ardb_lts_6.1.tgz -r ls-image-
  mainls1043ardb.tar.gz -f firmware_ls1043ardb_sdboot.img -d /dev/sdX
  ```

- Để triển khai các image Layerscape LDP tùy biến trên một board tham chiếu đang chạy TinyLinux
  1. Sau khi board tham chiếu tự động boot, hãy kiểm tra board tham chiếu boot vào TinyLinux hay boot vào distribution dựa trên userland Layerscape LDP. TinyLinux là một rootfs ramdisk không tùy biến được, được triển khai trên bộ nhớ flash của board tham chiếu. Rootfs này vừa trong image firmware trên flash nên được gọi là tiny.
     - Nếu board tham chiếu boot vào TinyLinux, chuyển sang bước #3.
     - Nếu board tham chiếu boot vào distribution dựa trên Layerscape LDP, nghĩa là một distribution cũ hơn dựa trên Yocto có thể đã có sẵn trên thiết bị lưu trữ cắm vào board tham chiếu. Trong trường hợp này, làm bước #2 trước để buộc board boot vào TinyLinux.
  2. Buộc board tham chiếu boot vào TinyLinux.
     - Reboot board và dừng autoboot để vào U-Boot prompt.
     - Đặt Ethernet Interface

       ```
       =>pri bootcmd
       bootcmd=env exists mcinitcmd && mmcinfo; mmc read 0x80001000 0x6800 0x800;
        env exists mcinitcmd && env exists secureboot  && mmc read 0x806C0000
        0x3600 0x20 && esbc_validate 0x806C0000;env exists mcinitcmd && fsl_mc
        lazyapply dpl 0x80001000;run distro_bootcmd;run sd_bootcmd;env exists
        secureboot && esbc_halt;
       2, run bootcmd (from the info above)
       =>mmc read 0x80001000 0x6800 0x800
       => fsl_mc lazyapply dpl 0x80001000
       ```

     - Nhập lệnh sau tại U-Boot prompt để boot board vào môi trường TinyLinux để chạy flex-installer:

       ```
       => run sd_bootcmd   (for SD/eMMC boot)
       => run nor_bootcmd  (for IFC-NOR boot)
       => run qspi_bootcmd (for QSPI-NOR boot)
       => run xspi_bootcmd (for FlexSPI-NOR boot)
       ```

  3. Đăng nhập TinyLinux với `root` và bật một network interface.

     Gán địa chỉ IP động:

     ```
     #: ifconfig -a
      #: udhcpc -i eth0 ( or eth1 ,etc.)  c
     ```

     Gán địa chỉ IP tĩnh:

     ```
     $ ifconfig <port name in TinyLinux> <IP address> netmask <netmask address>
      up
     ```

     Tên port trong Linux TinyLinux ứng với từng port trên vỏ board tham chiếu được nêu trong mục "\<board> reference information" ở phần **Quick start guide** của từng board.

  4. Dùng flex-installer để tạo và format các partition cho thiết bị lưu trữ (USB/SATA/SD).

     ```
     $ flex-installer -i pf -d <device> # use default partition_list
     ```

     Or

     ```
     $ flex-installer -i pf -d <device> -p <partition_list> # specify custom
      partition_list
     ```

     Để xem danh sách giá trị được hỗ trợ cho `<device>`, xem Table 7.

  5. Đổi đường dẫn hiện tại sang Partition 4 của thiết bị lưu trữ đích.

     ```
     $ cd /mnt/mmcblk0p4 (or /mnt/sdx4)
     ```

  6. Tải `bootpartition_<arch>_<version>.tgz` và `rootfs_<version>_<distrotype>_<distroscale>_<arch>.tgz` bằng lệnh `wget` hoặc `scp`.
  7. Triển khai bootpartition và Layerscape LDP userland lên thiết bị đích bằng lệnh dưới đây:

     ```
     flex-installer -f <firmware> -b <boottgz> -r <rootfs> -d <device>
     ```

     Để xem danh sách giá trị được hỗ trợ cho `<firmware>`, `<rootfs>` và `<device>`, xem Table 7.

     **Ví dụ:**

     ```
     $ flex-installer -b boot_ls1043ardb_lts_6.1.tgz -r ls-image-
     mainls1043ardb.tar.gz -f firmware_ls1043ardb_sdboot.img -d /dev/sdX
     ```

- Để chỉ cài firmware tổng hợp lên ổ lưu trữ đích trên một máy Linux host hoặc một board tham chiếu.

  **Cách dùng:**

  ```
  $ flex-installer -f <firmware> -d <device>
  ```

  Để xem danh sách giá trị được hỗ trợ cho `<firmware>`, `<device>`, xem Table 7.

  **Ví dụ:**

  ```
  $ flex-installer -f firmware_ls1046ardb_sdboot.img -d /dev/sdx
  ```

- Để chia partition và format thiết bị lưu trữ đích với số lượng và kích thước partition chỉ định thay vì dùng các partition mặc định.

  **Cách dùng:**

  ```
  flex-installer -i pf -p <partitions-list> -d <device>
  ```

  Để xem danh sách giá trị được hỗ trợ cho `<device>`, xem Table 7.

  **Ví dụ:**

  ```
  $ flex-installer -f firmware_ls1043ardb_sdboot.img -b
   boot_ls1043ardb_lts_6.1.tgz -r ls-image-
  main-ls1043ardb.tar.gz -d /dev/sdX
  ```

## 4.3 Tải và triển khai firmware tổng hợp Layerscape LDP trong môi trường Windows

Để tải và triển khai firmware tổng hợp Layerscape LDP trong môi trường Windows, thực hiện các bước sau:

**Ghi chú:** Các bước sau đã được kiểm chứng trên Windows 10.

1. Tải công cụ **DD for Windows** và cài đặt nó. http://download.si-linux.co.jp/dd_for_windows/DDWin_Ver0998.zip
2. Tạo một thư mục (ví dụ, C:/Layerscape_LDP) và sao chép firmware tổng hợp bạn đã build trong Windows Subsystem Linux (WSL) vào đó.
3. Chạy lệnh `cmd` của Windows và đổi thư mục làm việc hiện tại sang thư mục vừa tạo.

   ```
   C:\Windows\System32> cd C:/LDP
   C:\LDP> dir
   ```

4. Chạy lệnh Windows `copy /b sd_pt_4k.img + <composite_image>` `<new_composite_image>` để ghép image bảng partition với firmware tổng hợp.

   ```
   C:\LDP> copy /b sd_pt_4k.img + firmware_ls1028ardb_sdboot.img
    firmware_ls1028ardb_sdboot_4k.img
   ```

   Image mới `firmware_ls1028ardb_sdboot_4k.img` được tạo ra.

5. Chạy công cụ **DD for Windows** với quyền `administrator`.
6. Bấm Choose disk Choose file, rồi Restore để ghi firmware tổng hợp vừa tạo vào thẻ SD đích.
7. Rút thẻ SD khỏi máy Windows host và cắm vào board đích.
8. Đặt DIP switch để boot từ SD hoặc chạy `run sd_bootcmd` tại U-Boot prompt.
9. Đăng nhập TinyDistro với `root` và cài distro Layerscape LDP bằng flex-installer.

   Để xem thêm hướng dẫn, xem Section 4.6.

## 4.4 Triển khai các image Layerscape LDP lên board bằng flex-installer

Thực hiện các bước sau để triển khai các image Layerscape LDP lên board bằng một thiết bị lưu trữ tháo rời được, có thể gắn vào một máy Linux host tại chỗ:

1. Gắn thiết bị lưu trữ tháo rời vào máy Linux host.
2. Cài ﬂex-installer để triển khai các image Layerscape LDP (chỉ cần làm một lần):

   ```
   $ git clone https://github.com/nxp-imx/meta-nxp-desktop.git -b
    lf-6.1.1-1.0.0-langdale
   $ cp meta-nxp-desktop/scripts/flex-installer_1.14.2110.lf /usr/bin/flex-
   installer
   $ sudo chmod a+x /usr/bin/flex-installer
   $ which flex-installer
   ```

3. Chạy lệnh `ﬂex-installer` sau để cài Layerscape LDP:

   ```
   $ flex-installer -i pf -d <device>;
   $ flex-installer -f <firmware_xxx.img> -b <boot_xxx.tgz> -r <ls-image-
   mainxxx.tar.gz> -d <device>
   ```

   **Ghi chú:**

   - Dùng lệnh `cat /proc/partitions` để xem danh sách thiết bị và dung lượng của chúng, để bảo đảm chọn đúng tên thiết bị.
   - Ổ lưu trữ SD/USB/SATA trên Linux PC được nhận là /dev/sdX, trong đó X là một chữ cái như a, b,

     c. Hãy bảo đảm chọn đúng tên thiết bị, vì dữ liệu trên thiết bị này sẽ bị thay thế.

   - Nếu máy Linux host hỗ trợ đọc/ghi thẻ SD trực tiếp mà không cần thêm đầu đọc thẻ SD, tên thiết bị của thẻ SD thường là `mmcblk0`.
4. Rút thiết bị lưu trữ tháo rời khỏi Linux host và cắm vào board tham chiếu.

   Bảo đảm thiết lập DIP switch trên board đúng để boot từ phương tiện boot mong muốn.

5. Bật nguồn board. Hệ thống tự động boot vào hệ thống distro Layerscape.

   Dùng thông tin đăng nhập mặc định sau để đăng nhập vào hệ thống distro Layerscape:

   ```
   – user/user
   ```

## 4.5 Build Layerscape LDP bằng Yocto bitbake

Mục này giới thiệu các bước chi tiết để build Layerscape LDP bằng Yocto bitbake. Bản build Layerscape LDP dùng một meta layer dựa trên Yocto để tạo ra một image Proof of Concept (POC), và nó hoạt động cùng layer phát hành Layerscape (meta-qoriq). Nó dùng lại framework phát hành Linux BSP để quản lý và tạo bootloader U-Boot, image Linux kernel và root file system Layerscape trong bản build image.

**Ghi chú:** Phiên bản phát hành được quản lý bởi Layerscape Yocto SDK Manifest.

Bản build Layerscape LDP gồm build main và build desktop. Build main áp dụng cho mọi SoC Layerscape, còn build desktop chỉ áp dụng cho LS1028ARDB.

### 4.5.1 Package cho host

Một bản build Yocto Project cần một số package phải được cài cho bản build Yocto Project.

Để thiết lập bản build Yocto Project, hãy xem Yocto Project Quick Start và kiểm tra các package phải được cài cho máy build của bạn.

Các package host thiết yếu của Yocto project như dưới đây:

```
$ sudo apt-get install gawk wget git-core diffstat unzip texinfo gcc-multilib \
build-essential chrpath socat cpio python python3 python3-pip python3-pexpect \
xz-utils debianutils iputils-ping python3-git python3-jinja2 libegl1-mesa
 libsdl1.2-dev \
pylint3 xterm rsync curl
```

### 4.5.2 Tải Yocto bitbake

Yocto project dùng OpenEmbedded (OE) để build host, và project dùng bitbake để build một image Linux hoàn chỉnh. Các thành phần bitbake và OE được kết hợp thành build host tham chiếu, trước đây gọi là poky. Repo là một công cụ xây dựng trên Git. Để có poky và các công cụ bitbake, hãy tải repository poky và các công cụ bitbake bằng công cụ repo.

```
$ repo init -u https://github.com/nxp-qoriq/yocto-sdk -b langdale -m ls-6.1.1-1.0.0_distro.xml
$ repo sync
./-setup-env -m <boards>
Supported boards
================
ls1012ardb
ls1012afrwy
ls1021atwr
ls1043ardb
ls1046ardb
ls1046afrwy
ls1088ardb-pb
ls1028ardb
ls2088ardb
lx2160ardb-rev2
lx2162aqds
```

### 4.5.3 Build image Layerscape LDP bằng bitbake

Để build image tùy biến với các cấu hình khác thay vì thiết lập mặc định, bạn có thể triển khai trực tiếp firmware tổng hợp Layerscape LDP đã build sẵn và userland distro lên thiết bị lưu trữ trên board đích bằng Yocto bitbake.

Để build image Layerscape LDP, chạy lệnh sau:

```
$ bitbkake ls-image-lite
$ bitbake ls-image-main  # (if machine=ls1028ardb, should  bitbake ls-image-desktop )
```

### 4.5.4 Các lệnh bitbake

Bảng sau liệt kê các lệnh để build Layerscape LDP bằng bitbake.

**Table 8. Các lệnh bitbake**

| STT | Đối tượng build | Lệnh | Mô tả |
|---|---|---|---|
| 1 | Build tự động cho board cụ thể | `$ DISTRO=fsl-qoriq-distro MACHINE=<machine> source distro-setup-env`<br>`$ bitbake <distro_type>`<br>Ví dụ:<br>`$ DISTRO=fsl-qoriq-distro MACHINE=ls1028ardb source distro-setup-env`<br>`$ bitbake ls-image-main` | Tự động build Kernel và các thành phần ứng dụng cho board cụ thể.<br>\<machine> có thể là ls1012ardb, ls1012afrwy, ls1021atwr, ls1028ardb, ls1043ardb, ls1046ardb, ls1088ardb\_pb, ls2088ardb, lx2160ardb_rev2, lx2162aqds<br>`<distro_type>` có thể là<br>`bitbake ls-image-main`<br>`bitbake ls-image-desktop`<br>`bitbake ls-image-lite`<br>`bitbake ls-image-tiny` |
| 2 | Build ATF và U-Boot | `bitbake qoriq-atf` | Tự động build image ATF cùng RCW và bootloader (U-Boot hoặc UEFI) phụ thuộc. |
| 3 | Build một thành phần cụ thể | `bitbake <component>`<br>Ví dụ:<br>`bitbake dpdk`<br>`bitbake vpp`<br>`bitbake perf`<br>`bitbake ovs-dpdk`<br>`bitbake fmc`<br>`bitbake openssl`<br>`bitbake opencv` | Để build một hoặc nhiều thành phần, chạy lệnh:<br>`bitbake <component>` |
| 4 | Build nhiều thành phần ứng dụng cho một subsystem cụ thể | `bitbake <subsystem>`<br>Ví dụ:<br>`bitbake packagegroup-fsl-tools-core` | Người dùng có thể sửa hoặc thêm thành phần tùy biến trong các file tương ứng, ví dụ, `meta-qoriq/recipes-`<br>`fsl/packagegroups/packag`<br>`egroup-fsl-tools-core.bb` |
|   | Build các | `bitbake <distro_type>` | Tạo rootfs distro theo loại và quy mô distro chỉ định. |
|   | userland distro khác nhau | `bitbake ls-image-lite` | Build image lite với cấu hình tối ưu. |
| 5 |   | `bitbake ls-image-main` | Build image main cho tính năng mạng. |
|   |   | `bitbake ls-image-desktop` | Build image desktop chỉ cho một board cụ thể. |
|   |   | `bitbake fsl-image-mfgtool` | Build image yocto tiny với số công cụ hạn chế. |
|   | Clean các | `bitbake -c clean <recipe_name/target_name>` | Xóa mọi file output của một target. |
| 6 | image khác nhau | `bitbake -c cleanall <recipe_name/target_name>` | Xóa mọi file output, shared state cache và các file source đã tải về của một target. |
|   |   | `bitbake -c cleansstate <recipe_name/target_name>` | Xóa mọi file output và shared state cache của một target. |

### 4.5.5 Tạo firmware tổng hợp Layerscape LDP

Firmware tổng hợp Layerscape LDP gồm RCW/PBL, ATF, Bootloader (U-Boot hoặc UEFI), secure header, firmware Ethernet MAC/PHY, dtb, kernel và tiny initrd RFS. Firmware tổng hợp có thể được ghi ở offset 0x0 trong thiết bị flash hoặc ở offset block# 8 trong thẻ SD/eMMC.

**Ghi chú:** Arm CoT chỉ được hỗ trợ cho các nền tảng LX2160ARDB Rev2 và LX2162AQDS.

**Cách dùng**:

```
$ bitbake qoriq-composite-firmware
```

### 4.5.6 Tạo tarball

Trong tarball này, boot image chứa `dtb`, `image`, `secure-boot header` và `kernel` module. `boottgz` được ghi vào boot part2.

Dùng lệnh dưới đây để tạo tarball này trong Yocto bitbake.

**Cách dùng**:

```
$ bitbake generate-boottgz
```

### 4.5.7 Build TF-A cùng RCW và U-Boot/UEFI

Các nền tảng Layerscape hỗ trợ TF-A (Trusted Firmware-A), cung cấp một bản triển khai tham chiếu của phần mềm secure world cho Armv7-A và Armv8-A.

`bitbake` có thể tự động build RCW, U-Boot/UEFI, OPTEE và CST phụ thuộc để tạo các binary TF-A, các image `bl2.pbl` và `fip.bin` cho các nền tảng Layerscape.

Dùng các lệnh dưới đây để build ATF cùng RCW và U-Boot/UEFI trong Yocto bitbake.

**Ghi chú:** Arm CoT chỉ được hỗ trợ cho các nền tảng LX2160ARDB Rev2 và LX2162AQDS.

**Cách dùng**:

```
Usage:
bitbake qoriq-atf
```

**Ghi chú:** Nếu muốn dùng RCW khác thay vì RCW mặc định, bạn có thể cấu hình lại biến `rcw_<boottype>` trong `sources/meta-qoriq/recipes-bsp/secure-boot/secure-boot-qoriq//manifest`, rồi chạy `bitbake linux-firmware -c cleanall; bitbake qoriq-atf` để tạo image ATF mới với RCW chỉ định. Nếu bạn đã sửa source code U-Boot, RCW hoặc ATF, bitbake có thể tự động compile lại chúng với source đã sửa.

### 4.5.8 Build Linux kernel bằng bitbake

Ngoài việc build kernel Layerscape LDP theo cách độc lập (xem Section 7.4), có thể dễ dàng build tự động kernel Layerscape LDP bằng lệnh bitbake.

Để build kernel, dùng lệnh sau:

```
bitbake linux-qoriq
```

### 4.5.9 Build các thành phần ứng dụng trong Yocto bitbake

Các lệnh sau là một số ví dụ build thành phần ứng dụng.

**Cách dùng**:

```
$ bitbake <component>
```

**Ví dụ**:

**Cách dùng**:

```
bitbake dpdk
bitbake pktgen-dpdkbitbake vppbitbake fmcbitbake restoolbitbake tsntool
bitbake opencv
```

Hệ thống reboot và tự động boot vào hệ thống Layerscape Linux với kernel tùy biến mới.

### 4.5.10 Triển khai image mới sau khi sửa source code của các thành phần NXP tại chỗ

1. Clean các image ứng dụng cũ bằng lệnh:

   ```
   $ bitbake <component_name> -c cleanall
   ```

2. Sửa các file bitbake của thành phần trong thư mục `components/apps/<subsystem>/<component-name>` theo nhu cầu. Bước này không bắt buộc.
3. Build thành phần và tạo tarball nén của thành phần ứng dụng. Bạn có thể tìm các image đã compile trong thư mục `build-desktop/tmp/deploy/images`:

   ```
   $ bitbake <component_name> -c compile -f
   ```

### 4.5.11 Build các userland khác nhau với package tùy biến

Layerscape LDP hỗ trợ nhiều loại userland distro ở các quy mô khác nhau để phù hợp với nhiều use case; bạn có thể chọn userland distro phù hợp với nhu cầu.

- Layerscape LDP Main Userland.
- Layerscape LDP Lite Userland.
- Layerscape LDP Desktop Userland.

**Layerscape LDP Main Userland**

Userland main mặc định của Layerscape LDP gồm các package main dựa trên Linux distro và các package của NXP, có thể được tạo bằng lệnh sau:

```
$ bitbake ls-image-main
```

**Layerscape LDP Lite Userland**

Userland lite của Layerscape LDP gồm các package Linux distro và một vài package của NXP, có thể được tạo bằng lệnh sau:

```
$ bitbake ls-image-lite
```

**Layerscape LDP Desktop Userland**

Userland desktop của Layerscape LDP gồm các package GNOME desktop của Linux distro và một số package của NXP cho các nền tảng có GPU (ví dụ, LS1028A và nền tảng i.MX).

GNOME desktop được khởi chạy tự động theo mặc định; cần khởi chạy weston thủ công nếu cần weston. Người dùng có thể tạo và triển khai userland desktop của Linux distro bằng lệnh sau:

```
$ bitbake ls-image-desktop
```

### 4.5.12 Thêm một machine tùy biến trong Yocto bitbake dựa trên bản phát hành Layerscape LDP

Để thêm một machine tùy biến, thực hiện các bước dưới đây:

Ví dụ, LS1043AXX dựa trên SoC LS1043A.

1. Chạy `repo init` và `repo sync` để lấy mọi Git repository của các thành phần Layerscape LDP trong lần đầu.
2. Thêm config trong yocto bitbake cho machine mới:

   Thêm node ls1043axx trong `conf/machine/ls1043axx.conf`.

### 4.5.13 Nâng cấp distro Layerscape LDP hiện có bằng Yocto bitbake trên host

Để chỉ cập nhật boot partition (với kernel và module tùy biến) trên thẻ SD gắn với máy host hoặc board Arm đích:

```
$ flex-installer -b boot_<machine>_lts_6.1.tgz -d /dev/mmcblk0 (or /dev/sdx)
```

Để chỉ cập nhật tarball rootfs trên thẻ SD gắn với máy host hoặc board Arm đích:

```
$ flex-installer -r ls-image-main-<machine>.tar.gz -d /dev/mmcblk0 (or /dev/sdx)
```

Để cập nhật cả bootpartition và rootfs trên thẻ SD gắn với máy host hoặc board Arm đích:

```
$ flex-installer -b <boot_partition> -r <rootfs> -d /dev/mmcblk0 (or /dev/sdx)
```

## 4.6 Tải image TinyDistro lên board Layerscape bằng ﬂex-installer

Thực hiện các bước sau để tải image TinyDistro lên board Layerscape bằng ﬂex-installer:

1. Gắn thiết bị lưu trữ tháo rời vào máy Linux host.
2. Cài ﬂex-installer để triển khai các image TinyDistro (chỉ cần làm một lần):

   ```
   $ git clone https://github.com/nxp-imx/meta-nxp-desktop.git -b
    lf-6.1.1-1.0.0-langdale
   $ cp meta-nxp-desktop/scripts/flex-installer_1.14.2110.lf /usr/bin/flex-
   installer
   $ sudo chmod a+x /usr/bin/flex-installer
   $ which flex-installer
   ```

3. Chạy lệnh `ﬂex-installer` sau để cài image TinyDistro:

   ```
   $ flex-installer -i pf -d <device>;
   $ flex-installer -f <firmware_xxx.img> -d <device>
   ```

4. Rút thiết bị lưu trữ tháo rời khỏi Linux host và cắm vào board tham chiếu.
5. Bảo đảm thiết lập DIP switch trên board đúng để boot từ phương tiện boot mong muốn.
6. Bật nguồn board và vào U-Boot để cấp phát Ethernet interface:

   ```
   => pri bootcmd
   bootcmd=env exists mcinitcmd && mmcinfo; mmc read 0x80001000 0x6800 0x800;
    env exists mcinitcmd && env exists secureboot && mmc read
   0x806C0000 0x3600 0x20 && esbc_validate 0x806C0000;env exists mcinitcmd &&
    fsl_mc lazyapply dpl 0x80001000;run distro_bootcmd;run sd_bootcmd;env
   exists secureboot && esbc_halt;
   => mmc read 0x80001000 0x6800 0x800
   => fsl_mc lazyapply dpl 0x80001000
   ```

7. Chạy một trong các lệnh sau, tùy trường hợp:

   -
     ```
     => run sd_bootcmd (for SD/eMMC boot)
     ```

   -
     ```
     => run nor_bootcmd (for IFC-NOR boot)
     ```

   -
     ```
     => run qspi_bootcmd (for QSPI-NOR boot)
     ```

   -
     ```
     => run xspi_bootcmd (for FlexSPI-NOR boot)
     ```

8. Đăng nhập TinyDistro với “root/root” và bật một network interface:

   ```
   $ ifgonfig -a
   # Dynamic IP address assignment:
   $ udhcpc -i <port_name_in_TinyDistro>
   # Static IP address assignment:
   $ ifconfig <port_name_in_TinyDistro> <IP_address> netmask <netmask_address>
    up
   ```

9. Tải image của board:

   ```
   $ wget <httpserver>/flex-installer.sh && chmod a+x flex-installer.sh && sudo
    mv flex-installer.sh /usr/bin/flex-installer
   $ wget <httpserver>/<firmware_xxx.img>
   $ wget <httpserver>/<ls-image-main-xxx.tar.gz>
   ```

10. Chạy lệnh `ﬂex-installer` sau để cài image Layerscape:

    ```
    $ fdisk -l
    $ flex-installer -i pf -d <device>;
    $ flex-installer -f <firmware_xxx.img> -b <boot_xxx.tgz> -r <ls-image-
    mainxxx.tar.gz> -d <device>
    ```

11. Reboot trong hệ thống TinyDistro.

    ```
    $ reboot
    ```

## 4.7 Quick start guide cho các board Layerscape

Mục này mô tả:

- Quick start guide cho FRWY-LS1012A
- Quick start guide cho LS1012ARDB
- Quick start guide cho TWR-LS1021A
- Quick start guide cho LS1028ARDB
- Quick start guide cho LS1043ARDB
- Quick start guide cho FRWY-LS1046A
- Quick start guide cho LS1046ARDB
- Quick start guide cho LS1088ARDB
- Quick start guide cho LS2088ARDB
- Quick start guide cho LX2160ARDB Rev2
- Quick start guide cho LX2162AQDS

### 4.7.1 Quick start guide cho FRWY-LS1012A

Mục này giải thích:

- Giới thiệu
- Thông tin tham chiếu FRWY-LS1012A
- Ghi image firmware tổng hợp Layerscape LDP

#### 4.7.1.1 Giới thiệu

Các mục sau mô tả quy trình ghi firmware tổng hợp Layerscape LDP cho FRWY-LS1012A. Đồng thời, mục này giải thích quy trình cho use case phổ biến nhất: tải và triển khai các image mặc định của Layerscape LDP lên FRWY-LS1012A bằng flex-installer. Để biết thêm thông tin, xem Section 4.2.

Để biết thêm thông tin về các thành phần khác nhau của board, cũng như cách cấu hình và boot board, xem Layerscape LS1012A Freeway Board Getting Started Guide.

#### 4.7.1.2 Thông tin tham chiếu FRWY-LS1012A

Mục này cung cấp thông tin chung về FRWY-LS1012A, có thể hữu ích để tham chiếu khi thực hiện các bước triển khai Layerscape LDP ở phần sau.

##### 4.7.1.2.1 Bảng ánh xạ cổng Ethernet

Bảng dưới đây cho thấy ánh xạ giữa nhãn trên FRWY-LS1012A, port trong U-Boot và port trong Linux.

**Table 9. Ánh xạ cổng Ethernet**

| Nhãn trên board | Port trong U-Boot | Port trong Linux |
|---|---|---|
| ETH1 | pfe_eth0 | eth0 |
| ETH2 | pfe_eth1 | eth1 |

##### 4.7.1.2.2 Memory map của hệ thống

Trong U-Boot 64-bit, địa chỉ vật lý và địa chỉ hiệu dụng được ánh xạ 1:1. Sau khi hệ thống khởi động, bootloader ánh xạ địa chỉ vật lý và địa chỉ hiệu dụng như trong bảng sau:

| Địa chỉ vật lý bắt đầu | Địa chỉ vật lý kết thúc | Loại bộ nhớ | Kích thước |
|---|---|---|---|
| `0x00_0000_0000` | `0x00_000F_FFFF` | Secure boot ROM | 1 MB |
| `0x00_0100_0000` | `0x00_0FFF_FFFF` | CCSR | 240 MB |
| `0x00_1000_0000` | `0x00_1000_FFFF` | OCRAM1 | 64 KB |
| `0x00_1001_0000` | `0x00_1001_FFFF` | OCRAM2 | 64 KB |
| `0x00_4000_0000` | `0x00_47FF_FFFF` | QSPI | 128 MB |
| `0x00_8000_0000` | `0x00_FFFF_FFFF` | DRAM | 2 GB |
| `0x40_0000_0000` | `0x47_FFFF_FFFF` | PCI Express1 | 32G |

##### 4.7.1.2.3 Các tùy chọn boot được hỗ trợ

FRWY-LS1012A hỗ trợ các tùy chọn boot sau:

- QSPI NOR Flash

  **Ghi chú:** QSPI NOR flash là tùy chọn boot duy nhất có trên FRWY-LS1012A.

FRWY-LS1012A hỗ trợ bộ nhớ flash nối tiếp single/dual/quad-SPI Winbond W25M161AWEIT trên board, với 16 Mbit NOR và 1 Gbit NAND trong một chip.

```
U-Boot 2020.04-21450-gbde1a7f (Sep 18 2020 - 21:55:22 +0800)
SoC: LS1012AE Rev2.0 (0x87040020)
Clock Configuration:
        CPU0(A53):1000 MHz
        Bus: 250 MHz DDR: 1000 MT/s
Reset Configuration Word (RCW):
        00000000: 0800000a 00000000 00000000 00000000
        00000010: 33050000 c000000c 40000000 00001800
        00000020: 00000000 00000000 00000000 000c47f2
        00000030: 00000000 1082a120 00000096 00000000
DRAM: 958 MiB
Using SERDES1 Protocol: 13061 (0x3305)
MMC: FSL_SDHC: 0, FSL_SDHC: 1
Loading Environment from SPI Flash... SF: Detected w25q16dw with page size 256
 Bytes, erase size 4 KiB, total 2 MiB
OK
In: serial
Out: serial
Err: serial
Model: FRWY-LS1012A Board
Board: FRWY-LS1012A Version: RevC Net: SF: Detected w25q16dw with page size 256
 Bytes, erase size 4 KiB, total 2 MiB
PFE class pe firmware for Linux
PFE tmu pe firmware for Linux
PFE class pe firmware for u-boot
PFE tmu pe firmware for u-boot
eth0: pfe_eth0, eth1: pfe_eth1
```

#### 4.7.1.3 Ghi image firmware tổng hợp Layerscape LDP

Để ghi image firmware tổng hợp Layerscape LDP vào QSPI NOR flash trên FRWY-LS1012A:

1. Sao chép firmware trên máy host sang TFTP server.

   ```
   cp <build>/tmp/deploy/image/ls1021afrwy/firmware_ls1012afrwy_qspiboot.img ~/
   tftp/
   ```

2. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_ls1012afrwy_qspiboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     ```
     => load mmc <device:part> $load_addr firmware_ls1012afrwy_qspiboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1012afrwy_qspiboot.img
     ```

     Or

     ```
     => load usb <device:part> $load_addr firmware_ls1012afrwy_qspiboot.img
     ```

     Or

     ```
     => load scsi <device:part> $load_addr firmware_ls1012afrwy_qspiboot.img
     ```

   **Ghi chú:**

   Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

   ```
   => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
   ```

   Ví dụ:

   ```
   => load mmc 0:2 $load_addr firmware_ls1012afrwy_qspiboot.img
   ```

   Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

   ```
   => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
   ```

   Ví dụ:

   ```
   => fatload mmc 0:2 $load_addr firmware_ls1012afrwy_qspiboot.img
   ```

   Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

   ```
   => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
   ```

   Ví dụ:

   ```
   => ext2load mmc 0:2 $load_addr firmware_ls1012afrwy_qspiboot.img
   ```

   Lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

3. Ghi firmware vào QSPI NOR flash.

   ```
   => sf probe 0:0
   => sf erase 0 +$filesize && sf write $load_addr 0 $filesize
   ```

4. Reset và boot board từ QSPI NOR flash. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.

   ```
   => reset
   ```

#### 4.7.1.4 Tải image TinyDistro lên board Layerscape bằng ﬂex-installer

Thực hiện các bước sau để tải image TinyDistro lên board Layerscape bằng ﬂex-installer:

1. Gắn thiết bị lưu trữ tháo rời vào máy Linux host.
2. Cài ﬂex-installer để triển khai các image TinyDistro (chỉ cần làm một lần):

   ```
   $ git clone https://github.com/nxp-imx/meta-nxp-desktop.git -b
    lf-6.1.1-1.0.0-langdale
   $ cp meta-nxp-desktop/scripts/flex-installer_1.14.2110.lf /usr/bin/flex-
   installer
   $ sudo chmod a+x /usr/bin/flex-installer
   $ which flex-installer
   ```

3. Chạy lệnh `ﬂex-installer` sau để cài image TinyDistro:

   ```
   $ flex-installer -i pf -d <device>;
   $ flex-installer -f <firmware_xxx.img> -d <device>
   ```

4. Rút thiết bị lưu trữ tháo rời khỏi Linux host và cắm vào board tham chiếu.
5. Bảo đảm thiết lập DIP switch trên board đúng để boot từ phương tiện boot mong muốn.
6. Bật nguồn board và vào U-Boot để cấp phát Ethernet interface:

   ```
   => pri bootcmd
   bootcmd=env exists mcinitcmd && mmcinfo; mmc read 0x80001000 0x6800 0x800;
    env exists mcinitcmd && env exists secureboot && mmc read
   0x806C0000 0x3600 0x20 && esbc_validate 0x806C0000;env exists mcinitcmd &&
    fsl_mc lazyapply dpl 0x80001000;run distro_bootcmd;run sd_bootcmd;env
   exists secureboot && esbc_halt;
   => mmc read 0x80001000 0x6800 0x800
   => fsl_mc lazyapply dpl 0x80001000
   ```

7. Chạy một trong các lệnh sau, tùy trường hợp:

   -
     ```
     => run sd_bootcmd (for SD/eMMC boot)
     ```

   -
     ```
     => run nor_bootcmd (for IFC-NOR boot)
     ```

   -
     ```
     => run qspi_bootcmd (for QSPI-NOR boot)
     ```

   -
     ```
     => run xspi_bootcmd (for FlexSPI-NOR boot)
     ```

8. Đăng nhập TinyDistro với “root/root” và bật một network interface:

   ```
   $ ifgonfig -a
   # Dynamic IP address assignment:
   $ udhcpc -i <port_name_in_TinyDistro>
   # Static IP address assignment:
   $ ifconfig <port_name_in_TinyDistro> <IP_address> netmask <netmask_address>
    up
   ```

9. Tải image của board:

   ```
   $ wget <httpserver>/flex-installer.sh && chmod a+x flex-installer.sh && sudo
    mv flex-installer.sh /usr/bin/flex-installer
   $ wget <httpserver>/<firmware_xxx.img>
   $ wget <httpserver>/<ls-image-main-xxx.tar.gz>
   ```

10. Chạy lệnh `ﬂex-installer` sau để cài image Layerscape:

    ```
    $ fdisk -l
    $ flex-installer -i pf -d <device>;
    $ flex-installer -f <firmware_xxx.img> -b <boot_xxx.tgz> -r <ls-image-
    mainxxx.tar.gz> -d <device>
    ```

11. Reboot trong hệ thống TinyDistro.

    ```
    $ reboot
    ```

### 4.7.2 Quick start guide cho LS1012ARDB

Mục này giải thích:

- Giới thiệu
- Thông tin tham chiếu LS1012ARDB
- Ghi image firmware tổng hợp Layerscape LDP

#### 4.7.2.1 Giới thiệu

Các mục sau mô tả quy trình ghi firmware tổng hợp Layerscape LDP cho LS1012ARDB. Đồng thời, mục này giải thích quy trình cho use case phổ biến nhất: tải và triển khai các image mặc định của Layerscape LDP lên LS1012ARDB bằng flex-installer. Để biết thêm thông tin, xem Section 4.2.

Để biết thêm thông tin về các thành phần khác nhau của board, cũng như cách cấu hình và boot board, xem LS1012A Reference Design Board Getting Started Guide.

#### 4.7.2.2 Thông tin tham chiếu LS1012ARDB

Mục này cung cấp thông tin chung về LS1012ARDB, có thể hữu ích để tham chiếu khi thực hiện các bước triển khai Layerscape LDP ở phần sau.

##### 4.7.2.2.1 Bảng ánh xạ cổng Ethernet

Bảng dưới đây cho thấy cách các cổng Ethernet được ánh xạ sang Linux, U-Boot và nhãn trên hộp 1U.

| Nhãn trên hộp 1U | Tên port trong U-Boot | Tên port trong userland dựa trên Linux | Ghi chú |
|---|---|---|---|
| ETH_1 | pfe_eth0 | eth0 | 1G SGMII |
| ETH_2 | pfe_eth1 | eth1 | 1G RGMII |

Các hình sau cho thấy mặt trước và mặt sau vỏ LS1012ARDB:

##### 4.7.2.2.2 Memory map của hệ thống

| Địa chỉ vật lý bắt đầu | Địa chỉ vật lý kết thúc | Loại bộ nhớ | Kích thước |
|---|---|---|---|
| `0x00_0000_0000` | `0x00_000F_FFFF` | Secure Boot ROM | 1 MB |
| `0x00_0100_0000` | `0x00_0FFF_FFFF` | CCSR | 240 MB |
| `0x00_1000_0000` | `0x00_1000_FFFF` | OCRAM1 | 64 KB |
| `0x00_1001_0000` | `0x00_1001_FFFF` | OCRAM2 | 64 KB |
| `0x00_4000_0000` | `0x00_5FFF_FFFF` | QSPI | 512 MB |
| `0x00_8000_0000` | `0x00_FFFF_FFFF` | DRAM | 2 GB |
| `0x08_8000_0000` | `0x0F_FFFF_FFFF` | DRAM2 | 30G |
| `0x40_0000_0000` | `0x47_FFFF_FFFF` | PCI Express1 | 32G |

##### 4.7.2.2.3 Các tùy chọn boot được hỗ trợ

LS1012ARDB hỗ trợ các tùy chọn boot sau:

- QSPI NOR flash

##### 4.7.2.2.4 Các tùy chọn switch trên board

RDB có các switch người dùng chọn được để đánh giá các tùy chọn boot khác nhau cho thiết bị LS1012A, như trong bảng dưới đây ('0' là OFF, '1' là ON).

**Table 10. Boot từ QSPI NOR flash bank1**

|   | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| SW1 | 1 | 0 | 1 | 0 | 0 | 1 | 1 | 0 |
| SW2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**Table 11. Boot từ QSPI NOR flash bank2**

|   | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| SW1 | 1 | 0 | 1 | 0 | 0 | 1 | 1 | 0 |
| SW2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |

##### 4.7.2.2.5 Cách dùng flash bank

LS1012ARDB hỗ trợ bộ nhớ flash nối tiếp quad-SPI Spansion S25FS512SAGMFI011 trên board, dung lượng 64 MB. Có hai bank ảo trên RDB, có thể chọn qua thiết lập DIP switch (xem Table 1 và Table 2 ở trên).

Để bảo vệ U-Boot mặc định trong QSPI NOR flash bank1, NXP dùng quy ước triển khai các image đang làm việc vào QSPI NOR flash bank2, rồi chuyển sang QSPI NOR flash bank2 để kiểm thử. Việc chuyển sang flash2 có thể làm bằng phần mềm qua các lệnh I2C, thực chất là hoán đổi QSPI NOR flash bank1 với QSPI NOR flash bank2. Cách này bảo vệ QSPI NOR flash bank1 và giữ cho board luôn boot được trong mọi trường hợp.

```
U-Boot 2020.04-21450-gbde1a7f (Sep 18 2020 - 21:58:27 +0800)
SoC:  LS1012AE Rev2.0 (0x87040020)
Clock Configuration:
       CPU0(A53):1000 MHz
       Bus:      250  MHz  DDR:      1000 MT/s
Reset Configuration Word (RCW):
       00000000: 0800000a 00000000 00000000 00000000
       00000010: 35080000 c000000c 40000000 00001800
       00000020: 00000000 00000000 00000000 00014571
       00000030: 00000000 18c2a120 00000096 00000000
DRAM:  958 MiB
Using SERDES1 Protocol: 13576 (0x3508)
MMC:   FSL_SDHC: 0, FSL_SDHC: 1
Loading Environment from SPI Flash... SF: Detected s25fs512s with page size 256
 Bytes, erase size 256 KiB, total 64 MiB
OK
In:    serial
Out:   serial
Err:   serial
Model: LS1012A RDB Board
Board: LS1012ARDB Version: RevE, boot from QSPI: bank2
Net:   SF: Detected s25fs512s with page size 256 Bytes, erase size 256 KiB,
 total 64 MiB
PFE class pe firmware for Linux
PFE tmu pe firmware for Linux
PFE class pe firmware for u-boot
PFE tmu pe firmware for u-boot
eth0: pfe_eth0, eth1: pfe_eth1
=>
```

**Cách boot từ QSPI NOR flash bank2**

**Ghi chú:**

Có thể dùng I2C IO-expander để ghi đè thiết lập DIP switch trên board.

1. Để kiểm tra bank nào đã boot, xem log U-Boot. Bạn sẽ thấy "QSPI: bank 1" hoặc "QSPI: bank2" được in ra trong log.

   Ví dụ: Board: LS1012ARDB Version: unknown, boot from QSPI: bank1

2. Lệnh i2C để chuyển từ QSPI NOR flash bank1 sang QSPI NOR flash bank2 **“ i2c mw 0x24 0x7 0xfc;** i2c mw 0x24 0x3 0xf5 “
3. Ghi QSPI flash theo flash layout
4. Để boot từ QSPI NOR flash bank2, gõ lệnh “`reset`**”**.
5. Để quay lại QSPI NOR flash bank1 từ QSPI NOR flash bank2, tắt/bật nguồn board hoặc dùng **“i2c** **mw 0x24 0x3 0xf4 “** rồi nhập lệnh “`reset`”.

#### 4.7.2.3 Ghi image firmware tổng hợp Layerscape LDP

Để ghi image firmware tổng hợp Layerscape LDP vào QSPI NOR flash trên LS1012ARDB:

1. Sao chép firmware trên máy host sang TFTP server.

   ```
   cp <build>/tmp/deploy/image/ls1012ardb/firmware_ls1012ardb_qspiboot.img ~/
   tftp/
   ```

2. Reset board để boot từ QSPI NOR flash 1. Kiểm tra thông báo trong log U-Boot.

   ```
   Board: LS1012ARDB Version: unknown, boot from QSPI: bank1
   ```

3. Chuyển từ QSPI NOR flash 1 sang flash 2:

   ```
   => i2c mw 0x24 0x7 0xfc
   => i2c mw 0x24 0x3 0xf5
   ```

4. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_ls1012ardb_qspiboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     ```
     => load mmc <device:part> $load_addr firmware_ls1012ardb_qspiboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1012ardb_qspiboot.img
     ```

     Or

     ```
     => load usb <device:partition> $load_addr firmware_ls1012ardb_qspiboot.img
     ```

     Or

     ```
     => load scsi <device:partition> $load_addr firmware_ls1012ardb_qspiboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1012ardb_qspiboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_ls1012ardb_qspiboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_ls1012ardb_qspiboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

5. Ghi firmware vào QSPI NOR flash 2.

   ```
   => sf probe 0:0
   => sf erase 0 +$filesize && sf write $load_addr 0 $filesize
   ```

6. Reset và boot board từ QSPI NOR flash 2. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.

   ```
   => reset
   ```

### 4.7.3 Quick start guide cho TWR-LS1021A

Mục này giải thích:

- Giới thiệu
- Thông tin tham chiếu TWR-LS1021A
- Ghi image firmware tổng hợp Layerscape LDP

#### 4.7.3.1 Giới thiệu

Các mục sau mô tả quy trình ghi firmware tổng hợp Layerscape LDP cho TWR-LS1021A. Đồng thời, mục này giải thích quy trình cho use case phổ biến nhất: tải và triển khai các image mặc định của Layerscape LDP lên TWR-LS1021A bằng flex-installer. Để biết thêm thông tin, xem Section 4.2.

Để biết thêm thông tin về các thành phần khác nhau của board, cũng như cách cấu hình và boot board, xem TWR-LS1021A Reference Design Board Getting Started Guide.

#### 4.7.3.2 Thông tin tham chiếu TWR-LS1021A

Mục này cung cấp thông tin chung về TWR-LS1021A, có thể hữu ích để tham chiếu khi thực hiện các bước triển khai Layerscape LDP ở phần sau.

##### 4.7.3.2.1 Bảng ánh xạ cổng

Bảng dưới đây cho thấy ánh xạ giữa tên port trong U-Boot và tên port trong Linux TinyDistro.

| Tên port trong U-Boot | Tên port trong TinyDistro |
|---|---|
| eTSEC1 | eth0 |
| eTSEC2 | eth1 |
| eTSEC3 | eth2 |

##### 4.7.3.2.2 Memory map của hệ thống

| Địa chỉ vật lý bắt đầu | Địa chỉ vật lý kết thúc | Loại bộ nhớ | Kích thước |
|---|---|---|---|
| `0x0100_0000` | `0x0FFF_FFFF` | CCSR | 240 MB |
| `0x1000_0000` | `0x1000_FFFF` | OCRAM0 | 64 KB |
| `0x1001_0000` | `0x1001_FFFF` | OCRAM1 | 64 KB |
| `0x2000_0000` | `0x20FF_FFFF` | DCSR | 16 MB |
| `0x4000_0000` | `0x5FFF_FFFF` | QSPI | 512 MB |
| `0x6000_0000` | `0x67FF_FFFF` | NOR Flash | 128 MB |
| `0x7FB0_0000` | `0x7FB0_0FFF` | Board CPLD | 4 KB |
| `0x8000_0000` | `0xFFFF_FFFF` | DDR | 2 GB |

##### 4.7.3.2.3 Các tùy chọn boot được hỗ trợ

TWR-LS1021A hỗ trợ các tùy chọn boot sau:

- NOR
- SD

##### 4.7.3.2.4 Các tùy chọn switch trên board

RDB có các switch người dùng chọn được để đánh giá các tùy chọn boot khác nhau cho thiết bị TWR-LS1021A, như trong bảng dưới đây ('0' là OFF, '1' là ON).

| Nguồn boot | SW2\[1:8\] | SW3\[1:8\] |
|---|---|---|
| NOR bank 0 (mặc định) | 10001111 | 01100101 |
| NOR bank 1 | 10001111 | 01101101 |
| Thẻ SD | 00101111 | 01100101 |

Lưu ý rằng việc đổi cấu hình thiết bị boot khỏi thiết lập mặc định có thể cần thêm thay đổi trong RCW hoặc trong các code image khác. Về quy ước đặt tên RCW cho TWR-LS1021A, xem https:// github.com/nxp-qoriq/rcw/blob/master/ls1021atwr/README.

##### 4.7.3.2.5 Cách dùng flash bank

TWR-LS1021A có một tính năng đặc biệt cho phép chia một NOR flash thành nhiều phần gọi là “bank”. Việc này được thực hiện bằng logic ở mức board, sửa đổi các tín hiệu địa chỉ. Vì về mặt vật lý chỉ có một NOR flash, các bank đôi khi được gọi là bank "ảo". Lợi ích của tính năng này là cho phép triển khai độc lập nhiều bộ image lên cùng một NOR flash. Điều này rất hữu ích trong quá trình phát triển, vì image U-Boot ở một bank có thể được dùng để ghi một bộ image vào bank khác. Nếu các image mới có lỗi, các image cũ vẫn hoạt động. NOR flash trên TWR-LS1021A được chia thành hai bank, gọi là bank 0 và bank 1. Để xác định bank hiện tại, xem ví dụ log U-Boot dưới đây:

```
U-Boot 2020.04-gbde1a7f952 (Sep 27 2020 - 17:36:54 +0800)
CPU: Freescale LayerScape LS1021E, Version: 2.0, (0x87081120)
Clock Configuration:
        CPU0(ARMV7):1200 MHz,
        Bus:300 MHz, DDR:800 MHz (1600 MT/s data rate),
Reset Configuration Word (RCW):
        00000000: 0608000c 00000000 00000000 00000000
        00000010: 30000000 00007900 e0025a00 21046000
        00000020: 00000000 00000000 00000000 18000000
        00000030: 00080000 481b7340 00000000 00000000
Model: LS1021A TWR Board
Board: LS1021ATWR
CPLD: V3.2
PCBA: V2.0
VBank: 1
DRAM: 1 GiB
Using SERDES1 Protocol: 48 (0x30)
Firmware 'Microcode version 0.0.1 for LS1021a r1.0' for 1021 V1.0
QE: uploading microcode 'Microcode for LS1021a r1.0' version 0.0.1
Flash: 128 MiB
MMC: FSL_SDHC: 0
Loading Environment from Flash... OK
EEPROM: NXID v16777216
In: serial
Out: serial
Err: serial
SEC0: RNG instantiated
Net: eth0: ethernet@2d10000, eth1: ethernet@2d50000, eth2: ethernet@2d90000
=>
```

##### 4.7.3.2.6 Chuyển đổi tùy chọn boot

Có thể chuyển đổi tùy chọn boot trong U-Boot bằng các lệnh sau:

- Chuyển sang NOR bank 0 (mặc định):

  ```
  =>boot_bank 0
  ```

- Chuyển sang NOR bank 1:

  ```
  =>boot_bank 1
  ```

#### 4.7.3.3 Ghi image firmware tổng hợp Layerscape LDP

Phần này giải thích các bước ghi image firmware NOR vào IFC NOR flash trên TWR-LS1021A và ghi image firmware SD vào thẻ SD trên TWR-LS1021A.

Để ghi image firmware NOR tổng hợp Layerscape LDP vào IFC NOR flash trên TWR-LS1021A, thực hiện các bước sau:

1. Sao chép firmware trên máy host sang TFTP server.

   ```
   $ cp <build>/tmp/deploy/image/ls1021atwr/firmware_ls1021atwr_norboot.img ~/
   tftp/
   ```

2. Reboot board từ NOR bank 0 và dừng autoboot để vào U-Boot prompt.
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_ls1021atwr_norboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     ```
     => load mmc <device:part> $load_addr firmware_ls1021atwr_norboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1021atwr_norboot.img
     ```

     or

     ```
     => load usb <device:part> $load_addr firmware_ls1021atwr_norboot.img
     ```

     or

     ```
     => load scsi <device:part> $load_addr firmware_ls1021atwr_norboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1021atwr_norboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_ls1021atwr_norboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_ls1021atwr_norboot.img
     ```

     Lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Để ghi firmware tổng hợp vào IFC NOR flash, thực hiện các bước sau:
   - Để ghi bank thay thế:

     ```
     => protect off 64000000 +$filesize && erase 64000000 +$filesize && cp.b
      $load_addr 64000000 $filesize
     ```

   - Để ghi bank hiện tại:

     ```
     => protect off 60000000 +$filesize && erase 60000000 +$filesize && cp.b
      $load_addr 60000000 $filesize
     ```

5. Reset và boot board từ IFC NOR flash. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.
   - Để boot từ NOR flash bank 1.

     ```
     => boot_bank 1
     ```

   - Để boot từ NOR flash bank 0.

     ```
     => boot_bank 0
     ```

Để ghi image firmware SD tổng hợp Layerscape LDP vào thẻ SD trên TWR-LS1021A, thực hiện các bước sau:

1. Sao chép firmware trên máy host sang TFTP server.

   ```
   cp <build>/tmp/deploy/image/ls1021atwr/firmware_ls1021atwr_sdboot.img ~/tftp/
   ```

2. Reboot board từ NOR bank 0 và dừng autoboot để vào U-Boot prompt.
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_ls1021atwr_sdboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     ```
     => load mmc <device:part> $load_addr firmware_ls1021atwr_sdboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1021atwr_sdboot.img
     ```

     or

     ```
     => load usb <device:partition> $load_addr firmware_ls1021atwr_sdboot.img
     ```

     or

     ```
     => load scsi <device:part> $load_addr firmware_ls1021atwr_sdboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1021atwr_sdboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_ls1021atwr_sdboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_ls1021atwr_sdboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Ghi firmware vào thẻ SD.

   ```
   => mmc dev 0; mmc write $load_addr 8 1f000
   ```

5. Bảo đảm thiết lập DIP switch trên board là để boot từ thẻ SD.
6. Reset và boot board từ SD card. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.

### 4.7.4 Quick start guide cho LS1028ARDB

Mục này giải thích:

- Giới thiệu
- Thông tin tham chiếu LS1028ARDB
- Ghi image firmware tổng hợp Layerscape LDP

#### 4.7.4.1 Giới thiệu

Các mục sau mô tả quy trình ghi firmware tổng hợp Layerscape LDP cho LS1028ARDB. Đồng thời, mục này giải thích quy trình cho use case phổ biến nhất: tải và triển khai các image mặc định của Layerscape LDP lên LS1028ARDB bằng flex-installer. Để biết thêm thông tin, xem Section 4.2.

Để biết thêm thông tin về các thành phần khác nhau của board, cũng như cách cấu hình và boot board, xem LS1028A Reference Design Board Getting Started Guide.

#### 4.7.4.2 Thông tin tham chiếu LS1028ARDB

Mục này cung cấp thông tin chung về LS1028ARDB, có thể hữu ích để tham chiếu khi thực hiện các bước triển khai image Layerscape LDP được nêu ở các mục sau.

##### 4.7.4.2.1 Bảng ánh xạ cổng Ethernet

| Tên port trên vỏ | Tên port trong U-Boot | Tên port trong TinyDistro dựa trên Yocto | Tên port trong userland dựa trên Linux | Mô tả |
|---|---|---|---|---|
| 1G MAC1 | enetc-0 | eno0 | eno0 | ENETC PF 0 nối qua SGMII trên lane A của SoC |
| 1G SWP0 | swp0 | swp0 | swp0 | Port 0 của Ethernet switch<br>Các port mặt trước của switch đều nối qua QSGMII trên lane B của SoC |
| 1G SWP1 | swp1 | swp1 | swp1 | Port 1 của Ethernet switch |
| 1G SWP2 | swp2 | swp2 | swp2 | Port 2 của Ethernet switch |
| 1G SWP3 | swp3 | swp3 | swp3 | Port 3 của Ethernet switch |

##### 4.7.4.2.2 Memory map của hệ thống

**Table 12. Memory map của hệ thống**

| Địa chỉ bắt đầu | Địa chỉ kết thúc | Kích thước | Cấp phát | Ghi chú |
|---|---|---|---|---|
| 0x0000_0000_0000 | 0x0000_000F_FFFF | 1 MB | CCSR - Boot ROM | 64 KB |
| 0x0000_0010_0000 | 0x0000_00FF_FFFF | 15 MB | Reserved |   |
| 0x0000_0100_0000 | 0x0000_0FFF_FFFF | 240 MB | CCSR |   |
| 0x0000_1000_0000 | 0x0000_10FF_FFFF | 16 MB | Reserved |   |
| 0x0000_1100_0000 | 0x0000_11FF_FFFF | 16 MB | Reserved |   |
| 0x0000_1200_0000 | 0x0000_13FF_FFFF | 32 MB | Reserved |   |
| 0x0000_1400_0000 | 0x0000_17FF_FFFF | 64 MB | Reserved |   |
| 0x0000_1800_0000 | 0x0000_181F_FFFF | 2 MB | OCRAM | 128 KB |
| 0x0000_1820_0000 | 0x0000_182F_FFFF | 1 MB | Reserved |   |
| 0x0000_1830_0000 | 0x0000_18FF_FFFF | 13 MB | Reserved |   |
| 0x0000_1900_0000 | 0x0000_19FF_FFFF | 16 MB | CoreSight STM | 16 MB |
| 0x0000_1A00_0000 | 0x0000_1BFF_FFFF | 32 MB | Reserved |   |
| 0x0000_1C00_0000 | 0x0000_1CFF_FFFF | 16 MB | Reserved |   |
| 0x0000_1D00_0000 | 0x0000_1FFF_FFFF | 48 MB | Reserved |   |
| 0x0000_2000_0000 | 0x0000_2FFF_FFFF | 256 MB | FlexSPI Region #1 | Thêm không gian FlexSPI ở dưới |
| 0x0000_3000_0000 | 0x0000_3FFF_FFFF | 256 MB | Reserved |   |
| 0x0000_4000_0000 | 0x0000_5FFF_FFFF | 512 MB | Reserved |   |
| 0x0000_6000_0000 | 0x0000_7FFF_FFFF | 512 MB | Reserved |   |
| 0x0000_8000_0000 | 0x0000_9FFF_FFFF | 512 MB | GPP DRAM Region #1(0-2 GB) |   |
| 0x0000_A000_0000 | 0x0000_BFFF_FFFF | 512 MB |   |   |
| 0x0000_C000_0000 | 0x0000_DFFF_FFFF | 512 MB |   |   |
| 0x0000_E000_0000 | 0x0000_FFFF_FFFF | 512 MB |   |   |
| 0x0001_0000_0000 | 0x0001_EFFF_FFFF | 3.75 GB | Reserved |   |
| 0x0001_F000_0000 | 0x0001_F07F_FFFF | 8 MB | Không gian cấu hình ECAM | Embedded RC +EPECAM (256 MB) |
| 0x0001_F080_0000 | 0x0001_F09F_FFFF | 2 MB | Không gian register block |   |
| 0x0001_F0A0_0000 | 0x0001_F7FF_FFFF | 118 MB | Reserved |   |
| 0x0001_F800_0000 | 0x0001_F83F_FFFF | 4 MB | Reserved |   |
| 0x0001_F840_0000 | 0x0001_FBFF_FFFF | 60 MB | Reserved |   |
| 0x0001_FC00_0000 | 0x0001_FC3F_FFFF | 4 MB | Reserved |   |
| 0x0001_FC40_0000 | 0x0001_FFFF_FFFF | 60 MB | Reserved |   |
| 0x0002_0000_0000 | 0x0003_FFFF_FFFF | 8 GB | Reserved |   |
| 0x0004_0000_0000 | 0x0004_0FFF_FFFF | 256 MB | SPI Hole |   |
| 0x0004_1000_0000 | 0x0004_FFFF_FFFF | 3.75 GB | FlexSPI Region #2 (256 MB - 4 GB) | 3.75 GB |
| 0x0005_0000_0000 | 0x0005_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0006_0000_0000 | 0x0006_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0007_0000_0000 | 0x0007_3FFF_FFFF | 1 GB | DCSR |   |
| 0x0007_4000_0000 | 0x0007_FFFF_FFFF | 3 GB | Reserved |   |
| 0x0008_0000_0000 | 0x0008_1FFF_FFFF | 512 MB | Reserved |   |
| 0x0008_2000_0000 | 0x000B_FFFF_FFFF | 15.5 GB | Reserved |   |
| 0x000C_0000_0000 | 0x000F_FFFF_FFFF | 16 GB | Reserved |   |
| 0x0010_0000_0000 | 0x001F_FFFF_FFFF | 64 GB | Reserved |   |
| 0x0020_0000_0000 | 0x0020_7FFF_FFFF | 2 GB | Reserved |   |
| 0x0020_8000_0000 | 0x003F_FFFF_FFFF | 126 GB | GPP DRAM Region #2 |   |
| 0x0040_0000_0000 | 0x005F_FFFF_FFFF | 128 GB | Reserved |   |
| 0x0060_0000_0000 | 0x007F_FFFF_FFFF | 128 GB | GPP DRAM Region #3 |   |
| 0x0080_0000_0000 | 0x0087_FFFF_FFFF | 32 GB | PCI Express 1 | I/O tốc độ cao (0x0080_0000_0000 - 0x00FF_FFFF_FFFF) |
| 0x0088_0000_0000 | 0x008F_FFFF_FFFF | 32 GB | PCI Express 2 |   |

##### 4.7.4.2.3 Các tùy chọn boot được hỗ trợ

LS1028ARDB hỗ trợ các tùy chọn boot sau:

- FlexSPI NOR flash (ở các mục sau gọi là "FSPI" hoặc "FSPI flash"). CS là Chip Select.
- eMMC
- Thẻ SD (SDHC1)

##### 4.7.4.2.4 Các tùy chọn switch trên board

Board LS1028ARDB hỗ trợ các switch người dùng chọn được để đánh giá các tùy chọn boot khác nhau cho thiết bị LS1028A, như trong bảng dưới đây ('0' là OFF, '1' là ON).

| Nguồn boot | SW2\[1:8\] | SW3\[1:8\] | SW5\[1:8\] |
|---|---|---|---|
| FSPI NOR (mặc định) | 1111_1000 | 1111_0000 | 0011_1001 |
| Thẻ SD (SDHC1) | 1000_1000 | 1111_0000 | 0011_1001 |
| eMMC | 1001_1000 | 1111_0000 | 0011_1001 |

Ngoài thiết lập switch ở trên, hãy bảo đảm các thiết lập jumper sau là đúng.

**Table 13. Thiết lập jumper của LS1028ARDB**

| Jumper | Loại | Tên/chức năng | Mô tả |
|---|---|---|---|
| J6 | Connector 1x2 chân | Bật TA_BB_EN | Open: chân TA_BB_TMP_DETECT_B ở mức High (giá trị mặc định)<br>Shorted: chân TA_BB_TMP_DETECT_B ở mức Low |
| J7 | Connector 1x2 chân | VBAT_EN | Open: Tắt pin dự phòng cho TA_BB_VDD (giá trị mặc định)<br>Shorted: Bật pin dự phòng cho TA_BB\_VDD |
| J27 | Connector 1x2 chân | Điều khiển điện áp PROG_MTR (chỉ dành cho NXP) | Open: chân PROG_MTR bị tắt nguồn (giá trị mặc định)<br>Shorted: chân PROG_MTR được cấp nguồn từ OVDD (1.8 V) |
| J28 | Connector 1x2 chân | Điều khiển điện áp TA_PROG_SFP (chỉ dành cho NXP) | Open: chân TA_PROG_SFP bị tắt nguồn (giá trị mặc định)<br>Shorted: chân TA_PROG_SFP được cấp nguồn từ OVDD (1.8 V) |

##### 4.7.4.2.5 Chip-select của FlexSPI NOR Flash

FlexSPI NOR flash là đích đơn giản và tiện lợi để triển khai image nên được dùng thường xuyên.

Lợi ích của tính năng này là cho phép triển khai độc lập nhiều bộ image lên cùng một NOR flash. Điều này rất hữu ích trong quá trình phát triển, vì bạn có thể dùng image U-Boot ở một chip-select để ghi một bộ image vào chip-select khác. Nếu các image mới có lỗi, các image cũ vẫn hoạt động để bạn triển khai image đã sửa.

Logic trên board thường cho phép truy cập NOR flash từ các tùy chọn CS (chip select) khác nhau. Mỗi CS được nối với các thiết bị flash riêng. U-Boot in ra CS nào được nạp. Output có dạng như sau.

```
=> NOTICE:  Fixed DDR on board
NOTICE:  4 GB DDR4, 32-bit, CL=11, ECC on
NOTICE:  BL2: v1.5(release):LSDK-20.12-Internal
NOTICE:  BL2: Built : 07:04:31, Nov 14 2020
NOTICE:  BL2: Booting BL31
NOTICE:  BL31: v1.5(release):LSDK-20.12-Internal
NOTICE:  BL31: Built : 07:04:34, Nov 14 2020
NOTICE:  Welcome to LS1028 BL31 Phase
U-Boot 2020.04-gc7ec91b1f4 (Nov 14 2020 - 07:04:19 +0800)
SoC:  LS1028AE Rev1.0 (0x870b0010)
Clock Configuration:
       CPU0(A72):1500 MHz  CPU1(A72):1500 MHz
       Bus:      400  MHz  DDR:      1600 MT/s
Reset Configuration Word (RCW):
       00000000: 3c004010 00000030 00000000 00000000
       00000010: 00000000 018f0000 0030c000 00000000
       00000020: 020031a0 00002580 00000000 00003296
       00000030: 00000000 00000010 00000000 00000000
       00000040: 00000000 00000000 00000000 00000000
       00000050: 00000000 00000000 00000000 00000000
       00000060: 00000000 00000000 200e705a 00000000
       00000070: bb580000 00000000
Model: NXP Layerscape 1028a RDB Board
Board: LS1028AE Rev1.0-RDB, Version: C, boot from NOR
FPGA: v5 (RDB)
SERDES1 Reference : Clock1 = 100.00MHz Clock2 = 100.00MHz
DRAM:  3.9 GiB
DDR    3.9 GiB (DDR4, 32-bit, CL=11, ECC on)
Using SERDES1 Protocol: 47960 (0xbb58)
PCIe1: pcie@3400000 Root Complex: no link
PCIe2: pcie@3500000 Root Complex: no link
WDT:   Started with servicing (60s timeout)
MMC:   FSL_SDHC: 0, FSL_SDHC: 1
Loading Environment from SPI Flash... SF: Detected mt35xu02g with page size 256
 Bytes, erase size 128 KiB, total 256 MiB
OK
EEPROM: NXID v1
In:    serial
Out:   serial
Err:   serial
Net:   eth0: enetc-0, eth2: enetc-2, eth4: swp0, eth5: swp1, eth6: swp2, eth7:
 swp3
=>
```

Có thể chuyển đổi tùy chọn boot trong U-Boot bằng các câu lệnh sau.

- Chuyển sang FlexSPI NOR flash (mặc định):

  ```
  =>qixis_reset
  ```

- Chuyển sang SD:

  ```
  =>qixis_reset sd
  ```

- Chuyển sang eMMC:

  ```
  =>qixis_reset emmc
  ```

#### 4.7.4.3 Ghi image firmware tổng hợp Layerscape LDP

Phần này giải thích các bước ghi image firmware FlexSPI NOR vào FlexSPI NOR flash trên LS1028ARDB và ghi image firmware SD/eMMC vào thẻ SD/eMMC trên LS1028ARDB.

Để ghi image firmware tổng hợp Layerscape LDP vào FlexSPI NOR flash trên LS1028ARDB:

1. Sao chép firmware trên máy host sang TFTP server.

   ```
   $ cp <build>/tmp/deploy/image/ls1028ardb/firmware_ls1028ardb_xspiboot.img ~/
   tftp/
   ```

2. Reboot board từ FlexSPI NOR flash và dừng autoboot để vào U-Boot prompt.
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_ls1028ardb_xspiboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     ```
     => load mmc <device:part> $load_addr firmware_ls1028ardb_xspiboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1028ardb_xspiboot.img
     ```

     Or

     ```
     => load usb <device:part> $load_addr firmware_ls1028ardb_xspiboot.img
     ```

     Or

     ```
     => load scsi <device:part> $load_addr firmware_ls1028ardb_xspiboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1028ardb_xspiboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_ls1028ardb_xspiboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_ls1028ardb_xspiboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Ghi firmware vào FlexSPI NOR flash.

   ```
   => sf probe 0:0
   => sf erase 0 +$filesize && sf write $load_addr 0 $filesize
   ```

5. Reset và boot board từ FlexSPI NOR flash. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.

   ```
   => qixis_reset
   ```

Để ghi image firmware tổng hợp Layerscape LDP vào SD/eMMC trên LS1028ARDB:

1. Sao chép firmware trên máy host sang TFTP server.
   - Với boot từ SD:

     ```
     $ cp <build>/tmp/deploy/image/ls1028ardb/firmware_ls1028ardb_sdboot.img ~/
     tftp/
     ```

   - Với boot từ eMMC:

     ```
     cp <build>/tmp/deploy/image/ls1028ardb/firmware_ls1028ardb_emmcboot.img ~/
     tftp/
     ```

2. Reboot board từ FlexSPI NOR flash và dừng autoboot để vào U-Boot prompt.
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     Với boot từ SD:

     ```
     => tftp $load_addr firmware_ls1028ardb_sdboot.img
     ```

     Với boot từ eMMC:

     ```
     => tftp $load_addr firmware_ls1028ardb_emmcboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     Với boot từ SD:

     ```
     => load mmc <device:part> $load_addr firmware_ls1028ardb_sdboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1028ardb_sdboot.img
     ```

     or

     ```
     => load usb <device:part> $load_addr firmware_ls1028ardb_sdboot.img
     ```

     or

     ```
     => load scsi <device:partition> $load_addr firmware_ls1028ardb_sdboot.img
     ```

     Với boot từ eMMC:

     ```
     => load mmc <device:part> $load_addr firmware_ls1028ardb_emmcboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1028ardb_emmcboot.img
     ```

     or

     ```
     => load usb <device:part> $load_addr firmware_ls1028ardb_emmcboot.img
     ```

     or

     ```
     => load scsi <device:part> $load_addr firmware_ls1028ardb_emmcboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1028ardb_emmcboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_ls1028ardb_emmcboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_ls1028ardb_emmcboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Ghi firmware vào SD card.

   ```
   => mmc dev 0;mmc write $load_addr 8 1fff8
   ```

5. Ghi firmware vào eMMC card.

   ```
   => mmc dev 1;mmc write $load_addr 8 1fff8
   ```

6. Reset và boot board từ SD/eMMC card. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.
   - Với boot từ SD:

     ```
     => qixis_reset sd
     ```

   - Với boot từ eMMC:

     ```
     => qixis_reset emmc
     ```

### 4.7.5 Quick start guide cho LS1043ARDB

Mục này giải thích:

- Giới thiệu
- Thông tin tham chiếu LS1043ARDB
- Thông tin khôi phục LS1043ARDB
- Ghi image firmware tổng hợp Layerscape LDP
- Công cụ Frame Manager Configuration (FMC)

#### 4.7.5.1 Giới thiệu

Các mục sau mô tả quy trình ghi firmware tổng hợp Layerscape LDP cho LS1043ARDB. Đồng thời, mục này giải thích quy trình cho use case phổ biến nhất: tải và triển khai các image mặc định của Layerscape LDP lên LS1043ARDB bằng flex-installer. Để biết thêm thông tin, xem Section 4.2.

Để biết thêm thông tin về các thành phần khác nhau của board, cũng như cách cấu hình và boot board, xem LS1043A Reference Design Board Getting Started Guide.

Để xem danh sách hướng dẫn ngắn giúp bạn sửa/cập nhật từng thành phần Layerscape LDP như binary TF-A, Linux kernel, microcode DPAA1 FMan trên LS1043ARDB khi boot board từ một nguồn boot cụ thể, như NOR, NAND hoặc SD, xem NXP community.

#### 4.7.5.2 Thông tin tham chiếu LS1043ARDB

Mục này cung cấp thông tin chung về LS1043ARDB, có thể hữu ích để tham chiếu khi thực hiện các bước triển khai Layerscape LDP ở phần sau.

##### 4.7.5.2.1 Bảng ánh xạ cổng

Tên port trong Linux TinyDistro ứng với từng port trong sáu port trên vỏ board tham chiếu được nêu trong bảng dưới đây.

| Tên port trên vỏ | Tên port trong U-Boot | Tên port trong Tinydistro | Tên port trong Linux |
|---|---|---|---|
| QSGMII.P0 | FM1@DTSEC1 | eth0 | fm1-mac1 |
| QSGMII.P1 | FM1@DTSEC2 | eth1 | fm1-mac2 |
| QSGMII.P2 | FM1@DTSEC3 | eth2 | fm1-mac5 |
| QSGMII.P3 | FM1@DTSEC4 | eth3 | fm1-mac6 |
| RGMII1 | FM1@DTSEC5 | eth4 | fm1-mac3 |
| RGMII2 | FM1@DTSEC6 | eth5 | fm1-mac4 |
| 10G Copper | FM1@TGEC1 | eth6 | fm1-mac9 |

##### 4.7.5.2.2 Memory map của hệ thống

| Địa chỉ vật lý bắt đầu | Địa chỉ vật lý kết thúc | Loại bộ nhớ | Kích thước |
|---|---|---|---|
| 0x00_0000_0000 | 0x00_000F_FFFF | Secure Boot ROM | 1 MB |
| 0x00_0100_0000 | 0x00_0FFF_FFFF | CCSRBAR | 240 MB |
| 0x00_1000_0000 | 0x00_1000_FFFF | OCRAM0 | 64 KB |
| 0x00_1001_0000 | 0x00_1001_FFFF | OCRAM1 | 64 KB |
| 0x00_2000_0000 | 0x00_20FF_FFFF | DCSR | 16 MB |
| 0x00_6000_0000 | 0x00_67FF_FFFF | IFC - NOR Flash | 128 MB |
| 0x00_7E80_0000 | 0x00_7E80_FFFF | IFC - NAND Flash | 64 KB |
| 0x00_7FB0_0000 | 0x00_7FB0_0FFF | IFC - FPGA | 4 KB |
| 0x00_8000_0000 | 0x00_FFFF_FFFF | DRAM1 | 2 GB |

##### 4.7.5.2.3 Các tùy chọn boot được hỗ trợ

LS1043ARDB hỗ trợ các tùy chọn boot sau:

- NOR
- NAND
- SD

##### 4.7.5.2.4 Các tùy chọn switch trên board

RDB có các switch người dùng chọn được để đánh giá các tùy chọn boot khác nhau cho thiết bị LS1043A, như trong bảng dưới đây ('0' là OFF, '1' là ON).

| Nguồn boot | SW3\[1:8\] | SW4\[1:8\] | SW5\[1:8\] |
|---|---|---|---|
| NOR bank 0 (mặc định) | 10110011 | 00010010 | 10100010 |
| NOR bank 4 | 10110011 | 00010010 | 10100110 |
| Thẻ SD | 10110011 | 00100000 | 00100010 |
| NAND | 10110011 | 10000010 | 10100110 |

##### 4.7.5.2.5 Các bank (ảo) của NOR Flash

LS1043ARDB có một tính năng đặc biệt cho phép chia một NOR flash thành nhiều phần gọi là “bank”. Việc này được thực hiện bằng logic ở mức board, sửa đổi các tín hiệu địa chỉ. Vì về mặt vật lý chỉ có một NOR flash, các bank đôi khi được gọi là bank "ảo". Lợi ích của tính năng này là cho phép triển khai độc lập nhiều bộ image lên cùng một NOR flash. Điều này rất hữu ích trong quá trình phát triển, vì image U-Boot ở một bank có thể được dùng để ghi một bộ image vào bank khác. Nếu các image mới có lỗi, các image cũ vẫn hoạt động. Logic trên board thường cho phép chia NOR flash thành tối đa 8 bank, nhưng NOR flash trên LS1043ARDB được chia làm hai nửa, gọi là bank 0 và bank 4. Có thể chuyển bank bằng phần mềm qua các lệnh cpld. Để xác định bank hiện tại, xem ví dụ log U-Boot dưới đây:

```
U-Boot 2020.04-gc7ec91b1f4 (Nov 12 2020 - 06:46:07 +0800)
SoC: LS1043AE Rev1.1 (0x87920011)
Clock Configuration:
        CPU0(A53):1600 MHz
        CPU1(A53):1600 MHz
        CPU2(A53):1600 MHz
        CPU3(A53):1600 MHz
        Bus: 400 MHz DDR: 1600 MT/s FMAN: 500 MHz
Reset Configuration Word (RCW):
        00000000: 08100010 0a000000 00000000 00000000
        00000010: 14550002 80004012 e0025000 c1002000
        00000020: 00000000 00000000 00000000 00038800
        00000030: 00000000 00001101 00000096 00000001
Model: LS1043A RDB Board
Board: LS1043ARDB, boot from vBank 4
CPLD: V2.0
PCBA: V6.0
SERDES Reference Clocks:
SD1_CLK1 = 156.25MHZ, SD1_CLK2 = 100.00MHZ
DRAM: 1.9 GiB (DDR4, 32-bit, CL=11, ECC off)
Using SERDES1 Protocol: 5205 (0x1455)
SEC0: RNG instantiated
Firmware 'Microcode version 0.0.1 for LS1021a r1.0' for 1021 V1.0
QE: uploading microcode 'Microcode for LS1021a r1.0' version 0.0.1
Flash: 128 MiB
NAND: 512 MiB
MMC: FSL_SDHC: 0
Loading Environment from Flash... OK
EEPROM: NXID v1
In: serial
Out: serial
Err: serial
Net: Fman1: Uploading microcode version 106.4.18
PCIe1: pcie@3400000 disabled
PCIe2: pcie@3500000 Root Complex: no link
PCIe3: pcie@3600000 Root Complex: x1 gen1
e1000: 00:15:17:5c:63:d5
        FM1@DTSEC1, FM1@DTSEC2, FM1@DTSEC3, FM1@DTSEC4, FM1@DTSEC5, FM1@DTSEC6,
 FM1@TGEC1, e1000#0
[PRIME]
Warning: e1000#0 MAC addresses don't match:
Address in SROM is 00:15:17:5c:63:d5
Address in environment is 00:e0:0c:00:22:07
Warning: e1000#0 failed to set MAC address
=>
=>
```

##### 4.7.5.2.6 Chuyển đổi tùy chọn boot

Có thể chuyển đổi boot trong U-Boot bằng các lệnh sau:

- Chuyển sang NOR bank 0 (mặc định):

  ```
  =>cpld reset
  ```

- Chuyển sang NOR bank 4:

  ```
  =>cpld reset altbank
  ```

- Chuyển sang NAND:

  ```
  =>cpld reset nand
  ```

- Chuyển sang SD:

  ```
  =>cpld reset sd
  ```

#### 4.7.5.3 Thông tin khôi phục LS1043ARDB

Nếu board LS1043ARDB không boot được từ NOR bank 0, bạn có thể khôi phục NOR bank 0 từ NOR bank 4 theo các bước sau:

1. Chạy lệnh:

   ```
   $ cp <build>/tmp/deploy/image/ls1043ardb/firmware_ls1043ardb_norboot.img ~/
   tftp
   ```

2. Boot LS1043ARDB từ NOR bank 4 với thiết lập switch sau:

   `SW3 = 10110011`, `SW4 = 00010010`, `SW5 = 10100110`

3. Ghi NOR bank 0 từ NOR bank 4:

   ```
   => tftp $load_addr firmware_ls1043ardb_norboot.img => protect off 64000000 +
   $filesize && erase 64000000 +$filesize && cp.b $load_addr 64000000 $filesize
   ```

4. Reset và boot board từ NOR bank 0:

   ```
   => cpld reset
   ```

**Ghi chú:** Nếu LS1043ARDB không boot được từ cả hai NOR bank, bạn cần khôi phục board bằng **CodeWarrior for LS Series, Arm v8 ISA**. Về các bước khôi phục board bằng công cụ CodeWarrior, xem mục "8.6 Board Recovery" trong ARM V8 ISA, Targeting Manual.

#### 4.7.5.4 Ghi image firmware tổng hợp Layerscape LDP

Phần này giải thích các bước ghi image firmware NOR vào IFC NOR flash trên LS1043ARDB và ghi image firmware SD vào thẻ SD trên LS1043ARDB.

Để ghi image firmware NOR tổng hợp Layerscape LDP vào IFC NOR flash trên LS1043ARDB:

1. Sao chép firmware trên máy host sang TFTP server.

   ```
   $ cp <build>/tmp/deploy/image/ls1043ardb/firmware_ls1043ardb_norboot.img ~/
   tftp
   ```

2. Reboot board từ NOR flash bank 0 và dừng autoboot để vào U-Boot prompt.
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_ls1043ardb_norboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     ```
     => load mmc <device:part> $load_addr firmware_ls1043ardb_norboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1043ardb_norboot.img
     ```

     or

     ```
     => load usb <device:part> $load_addr firmware_ls1043ardb_norboot.img
     ```

     or

     ```
     => load scsi <device:partition> $load_addr firmware_ls1043ardb_norboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1043ardb_norboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_ls1043ardb_norboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_ls1043ardb_norboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Ghi firmware tổng hợp vào IFC NOR flash.
   - Để ghi bank thay thế:

     ```
     => protect off 64000000 +$filesize && erase 64000000 +$filesize && cp.b
      $load_addr 64000000 $filesize
     ```

   - Để ghi bank hiện tại:

     ```
     => protect off 60000000 +$filesize && erase 60000000 +$filesize && cp.b
      $load_addr 60000000 $filesize
     ```

5. Reset và boot board từ IFC NOR flash. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.
   - Để boot từ NOR flash bank 0.

     ```
     => cpld reset
     ```

   - Để boot từ NOR flash bank 4.

     ```
     => cpld reset altbank
     ```

Để ghi image firmware SD tổng hợp Layerscape LDP vào thẻ SD trên LS1043ARDB:

1. Sao chép firmware trên máy host sang TFTP server.

   ```
   $ cp <build>/tmp/deploy/image/ls1043ardb/firmware_ls1043ardb_sdboot.img ~/
   tftp/
   ```

2. Reboot board từ NOR flash bank 0 và dừng autoboot để vào U-Boot prompt.
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_ls1043ardb_sdboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     ```
     => load mmc <device:part> $load_addr firmware_ls1043ardb_sdboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1043ardb_sdboot.img
     ```

     or

     ```
     => load usb <device:partition> $load_addr firmware_ls1043ardb_sdboot.img
     ```

     or

     ```
     => load scsi <device:part> $load_addr firmware_ls1043ardb_sdboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1043ardb_sdboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_ls1043ardb_sdboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_ls1043ardb_sdboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Ghi firmware vào thẻ SD.

   ```
   => mmc dev 0; mmc write $load_addr 8 1f000
   ```

5. Reset và boot board từ SD card. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.

   ```
   => cpld reset sd
   ```

#### 4.7.5.5 Công cụ Frame Manager Configuration (FMC)

Theo mặc định, FMan đã được cấu hình cho Parse-Classify-Distribute (PCD). Nghĩa là không cần người dùng làm gì thêm, FMan sẽ đưa các frame nhận được từ cùng một flow vào cùng một receive queue. Điều này tránh vấn đề sai thứ tự Rx packet và cải thiện hiệu năng.

Cấu hình FMan mặc định này dùng các file cấu hình và file policy được cung cấp trong NXP Layerscape LDP để thực hiện PCD. Các file này ở định dạng xml và được tạo với mục tiêu giữ thứ tự packet theo từng flow. Với LS1043ARDB, các file này nằm ở đường dẫn sau:

```
/etc/fmc/config/private/ls1043ardb/RR_FQPP_1455
```

Tuy nhiên, nếu người dùng muốn áp dụng cấu hình khác với cấu hình mặc định, người dùng cần chạy lệnh sau sau khi board boot vào Linux.

1. Đổi thư mục sang thư mục cha của các file cấu hình và file policy tùy biến của người dùng
2. Chạy lệnh của công cụ FMC:

   ```
   $ fmc –c <config.xml> –p <policy.xml> –a
   ```

### 4.7.6 Quick start guide cho FRWY-LS1046A

Mục này giải thích:

- Giới thiệu
- Thông tin tham chiếu FRWY-LS1046A
- Ghi image firmware tổng hợp Layerscape LDP

#### 4.7.6.1 Giới thiệu

Các mục sau mô tả quy trình ghi firmware tổng hợp Layerscape LDP cho FRWY-LS1046A. Đồng thời, mục này giải thích quy trình cho use case phổ biến nhất: tải và triển khai các image mặc định của Layerscape LDP lên FRWY-LS1046A bằng flex-installer. Để biết thêm thông tin, xem Section 4.2.

Để biết thêm thông tin về các thành phần khác nhau của board, cũng như cách cấu hình và boot board, xem Layerscape FRWY-LS1046A Board Getting Started Guide.

#### 4.7.6.2 Thông tin tham chiếu FRWY-LS1046A

Mục này cung cấp thông tin chung về FRWY-LS1046A. Thông tin này có thể hữu ích để tham chiếu khi thực hiện các bước triển khai image Layerscape LDP được nêu ở các mục sau.

##### 4.7.6.2.1 Bảng ánh xạ cổng Ethernet

| Tên port trên vỏ | Tên port trong U-Boot | Tên port trong Tinydistro | Tên port trong Linux | Mô tả |
|---|---|---|---|---|
| 1G PORT1 | FM1@DTSEC1 | fm1-mac1 | eth1 | Interface đồng QSGMII |
| 1G PORT2 | FM1@DTSEC5 | fm1-mac5 | eth2 | Interface đồng QSGMII |
| 1G PORT3 | FM1@DTSEC6 | fm1-mac6 | eth3 | Interface đồng QSGMII |
| 1G PORT4 | FM1@DTSEC10 | fm1-mac10 | eth4 | Interface đồng QSGMII |

##### 4.7.6.2.2 Memory map của hệ thống

**Table 14. Memory map của hệ thống**

| Địa chỉ bắt đầu | Tên module | Kích thước | Truy cập được với địa chỉ x-bit |   |   |
|---|---|---|---|---|---|
| (Hex) |   |   | 32 | 36 | 40 |
| 00_0000_0000 | Secure Boot ROM | 1 MB | Y | Y | Y |
| 00_0010_0000 | Extended Boot ROM | 15 MB | Y | Y | Y |
| 00_0100_0000 | CCSR Register Space | 240 MB | Y | Y | Y |
| 00_1000_0000 | OCRAM1 | 64 KB | Y | Y | Y |
| 00_1001_0000 | OCRAM2 | 64 KB | Y | Y | Y |
| 00_1004_0000 | Reserved | 65408 KB | Y | Y | Y |
| 00_1100_0000 | Reserved | 16 MB | Y | Y | Y |
| 00_1200_0000 | STM | 16 MB | Y | Y | Y |
| 00_1300_0000 | Reserved | 208 MB | Y | Y | Y |
| 00_2000_0000 | DCSR | 64 MB | Y | Y | Y |
| 00_2400_0000 | Reserved | 448 MB | Y | Y | Y |
| 00_4000_0000 | QuadSPI | 512 MB | Y | Y | Y |
| (Hex) |   |   | 32 | 36 | 40 |
| 00_6000_0000 | IFC region 1(0 - 512 MB) | 512 MB | Y | Y | Y |
| 00_8000_0000 | DRAM1 (0 - 2 GB) | 2 GB | Y | Y | Y |
| 01_0000_0000 | Reserved | 0.0625 GB | N | Y | Y |
| 01_0400_0000 | Reserved | 3.9375 GB | N | Y | Y |
| 02_0000_0000 | Reserved | 1 GB | N | Y | Y |
| 02_4000_0000 | Reserved | 7 GB | N | Y | Y |
| 04_0000_0000 | Reserved | 0.25 GB | N | Y | Y |
| 04_1000_0000 | Reserved | 0.25 GB | N | Y | Y |
| 04_2000_0000 | Reserved | 0.25 GB | N | Y | Y |
| 04_3000_0000 | Reserved | 1.25 GB | N | Y | Y |
| 04_8000_0000 | Reserved | 2 GB | N | Y | Y |
| 05_0000_0000 | QMan S/W Portal | 128 MB | N | Y | Y |
| 05_0800_0000 | BMan S/W Portal | 128 MB | N | Y | Y |
| 05_1000_0000 | Reserved | 4 GB - 256 MB | N | Y | Y |
| 06_0000_0000 | Reserved | 0.5 GB | N | Y | Y |
| 06_2000_0000 | IFC region 2 (512 MB - 4 GB) | 3.5 GB | N | Y | Y |
| 07_0000_0000 | Reserved | 4 GB | N | Y | Y |
| 08_0000_0000 | Reserved | 2 GB | N | Y | Y |
| 08_8000_0000 | DRAM2 | 30 GB | N | Y | Y |
| 10_0000_0000 | Reserved | 64 GB | N | Y | Y |
| 20_0000_0000 | Reserved | 128 GB | N | N | Y |
| 40_0000_0000 | PCI Express 1 | 32 GB | N | N | Y |
| 48_0000_0000 | PCI Express 2 | 32 GB | N | N | Y |
| 50_0000_0000 | PCI Express 3 | 32 GB | N | N | Y |
| 58_0000_0000 | Reserved | 160 GB | N | N | Y |
| 80_0000_0000 | Reserved | 32 GB | N | N | Y |
| 88_0000_0000 | DRAM3 (32 - 512 GB) | 480 GB | N | N | Y |

##### 4.7.6.2.3 Các tùy chọn boot được hỗ trợ

Board FRWY-LS1046A hỗ trợ các tùy chọn boot sau:

- QSPI NOR flash (ở các mục sau gọi là "QSPI" hoặc "QSPI flash"). CS là chip select.
- Thẻ Micro-SD (SDHC1)

##### 4.7.6.2.4 Các tùy chọn switch trên board

Board FRWY-LS1046A có các switch người dùng chọn được để đánh giá các tùy chọn boot khác nhau cho thiết bị LS1046A, như trong bảng dưới đây ('0' là OFF, '1' là ON).

| Nguồn boot | SW1\[1:10\] |
|---|---|
| QSPI NOR (mặc định) | 0_0100_0100_0 |
| Thẻ Micro-SD (SDHC1) | 0_0100_0000_0 |

**Ghi chú:**

Người dùng chỉ có thể chuyển giữa QSPI NOR và Micro-SD bằng thiết lập switch; không có lệnh nào để chuyển giữa chúng.

Ngoài thiết lập switch ở trên, hãy bảo đảm các thiết lập jumper sau là đúng.

**Table 15. Thiết lập jumper của FRWY-LS1046A**

| Ký hiệu linh kiện | Loại jumper | Mô tả | Thiết lập jumper |
|---|---|---|---|
| J72 | Connector 1x2 | Header chọn UART | • Open: cổng UART1 được truy cập từ xa qua một header 1x4 (J73)<br>• Shorted: một connector USB 2.0 micro AB (J58) được nối với cổng UART1 qua một bridge USB-to-UART (thiết lập mặc định) |
| J8 | Connector 1x2 | Header chọn điện áp VDD | • Open: VDD = 0.9 V<br>• Shorted: VDD = 1 V (thiết lập mặc định) |
| J14 | Connector 1x2 | Header chọn chế độ reset | • Open: chân RESET_REQ_B của processor bị ngắt kết nối<br>• Shorted: chân RESET_REQ_B kích hoạt reset hệ thống khi được assert (thiết lập mặc định) |
| J11 | Connector 1x2 | Header điều khiển điện áp PROG_MTR (chỉ dành cho NXP) | • Open: chân PROG_MTR của processor bị tắt nguồn (thiết lập mặc định)<br>• Shorted: chân PROG_MTR được cấp nguồn từ OVDD (1.8 V) |
| J9 | Connector 1x2 | Header điều khiển điện áp TA_BB_VDD | • Open: chân TA_BB_VDD của processor bị tắt nguồn<br>• Shorted: chân TA_BB_VDD được cấp nguồn từ VDD (1/0.9 V) (thiết lập mặc định) |

##### 4.7.6.2.5 QSPI NOR flash

QSPI NOR flash là đích đơn giản và tiện lợi để triển khai image; vì vậy, đây là phương tiện phổ biến nhất để triển khai image. Khi board boot từ QSPI, log U-Boot có dạng như sau:

```
U-Boot 2020.04-gc7ec91b1f4 (Nov 17 2020 - 15:26:56 +0800)
SoC:  LS1046AE Rev1.0 (0x87070010)
Clock Configuration:
       CPU0(A72):1600 MHz  CPU1(A72):1600 MHz  CPU2(A72):1600 MHz
       CPU3(A72):1600 MHz
       Bus:      600  MHz  DDR:      2100 MT/s  FMAN:     700  MHz
Reset Configuration Word (RCW):
       00000000: 0c150010 0e000000 00000000 00000000
       00000010: 30400506 00800012 40025000 c1000000
       00000020: 00000000 00000000 00000000 00038800
       00000030: 20044100 24003101 00000096 00000001
Model: LS1046A FRWY Board
Board: LS1046AFRWY, Rev: A, boot from QSPI
SD1_CLK1 = 100.00MHZ, SD1_CLK2 = 100.00MHZ
DRAM:  3.9 GiB (DDR4, 64-bit, CL=15, ECC on)
SEC0: RNG instantiated
Using SERDES1 Protocol: 12352 (0x3040)
Using SERDES2 Protocol: 1286 (0x506)
NAND:  512 MiB
MMC:   FSL_SDHC: 0
Loading Environment from SPI Flash... SF: Detected mt25qu512a with page size 256
 Bytes, erase size 64 KiB, total 64 MiB
OK
EEPROM: NXID v1
In:    serial
Out:   serial
Err:   serial
Net:   SF: Detected mt25qu512a with page size 256 Bytes, erase size 64 KiB,
 total 64 MiB
Fman1: Uploading microcode version 106.4.18
PCIe1: pcie@3400000 disabled
PCIe2: pcie@3500000 Root Complex: no link
PCIe3: pcie@3600000 Root Complex: no link
FM1@DTSEC1, FM1@DTSEC5, FM1@DTSEC6, FM1@DTSEC10
=>
```

#### 4.7.6.3 Ghi image firmware tổng hợp Layerscape LDP

Phần này giải thích các bước ghi image firmware QSPI NOR vào QSPI NOR flash trên FRWY-LS1046A và ghi image firmware SD vào thẻ SD trên FRWY-LS1046A.

Để ghi image firmware tổng hợp Layerscape LDP vào QSPI NOR flash trên FRWY-LS1046A:

1. Sao chép firmware trên máy host sang tftp server.

   ```
   $ cp <build>/tmp/deploy/image/ls1046frwy/firmware_ls11046afrwy_qspiboot.img
    ~/tftp/
   ```

2. Reboot board từ QSPI NOR flash và dừng autoboot để vào U-Boot prompt.
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_ls1046afrwy_qspiboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD hoặc USB)

     ```
     => load mmc <device:part> $load_addr firmware_ls1046afrwy_qspiboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1046afrwy_qspiboot.img
     ```

     Or

     ```
     => load usb <device:part> $load_addr firmware_ls1046afrwy_qspiboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1046afrwy_qspiboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_ls1046afrwy_qspiboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_ls1046afrwy_qspiboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Ghi firmware vào QSPI NOR flash.

   ```
   => sf probe 0:0
   => sf erase 0 +$filesize && sf write $load_addr 0 $filesize
   ```

5. Bảo đảm thiết lập switch trên board là cho QSPI NOR flash rồi tắt/bật nguồn board. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.

Để ghi image firmware tổng hợp Layerscape LDP vào thẻ SD trên FRWY-LS1046A:

1. Sao chép firmware trên máy host sang tftp server.

   ```
   $ cp <build>/tmp/deploy/image/ls1046afrwy/firmware_ls1046afrwy_sdboot.img ~/
   tftp/
   ```

2. Reboot board từ QSPI NOR flash và dừng autoboot để vào U-Boot prompt.
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_ls1046afrwy_sdboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD hoặc USB)

     ```
     => load mmc <device:part> $load_addr firmware_ls1046afrwy_sdboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1046afrwy_sdboot.img
     ```

     or

     ```
     => load usb <device:part> $load_addr firmware_ls1046afrwy_sdboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1046afrwy_sdboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_ls1046afrwy_sdboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_ls1046afrwy_sdboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Ghi firmware vào SD card.

   ```
   => mmc dev 0; mmc write $load_addr 8 1f000
   ```

5. Bảo đảm thiết lập switch trên board là để boot từ SD rồi tắt/bật nguồn board. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.

#### 4.7.6.4 Công cụ Frame Manager Configuration (FMC)

Theo mặc định, FMan đã được cấu hình cho Parse-Classify-Distribute (PCD). Nghĩa là không cần người dùng làm gì thêm, FMan sẽ đưa các frame nhận được từ cùng một flow vào cùng một receive queue. Điều này tránh vấn đề sai thứ tự Rx packet và cải thiện hiệu năng.

Cấu hình FMan mặc định này dùng các file cấu hình và file policy được cung cấp trong NXP Layerscape LDP để thực hiện PCD. Các file này ở định dạng xml và được tạo với mục tiêu giữ thứ tự packet theo từng flow. Với FRWY-LS1046A, các file này nằm ở đường dẫn sau:

```
/etc/fmc/config/private/ls1046afrwy/NN_NNQNNPNP_3040_0506
```

Tuy nhiên, nếu người dùng muốn áp dụng cấu hình khác với cấu hình mặc định, người dùng cần chạy lệnh sau sau khi board boot vào Linux.

1. Đổi thư mục sang thư mục cha của các file cấu hình và file policy tùy biến của người dùng.
2. Chạy lệnh của công cụ FMC:

   ```
   $ fmc –c <config.xml> –p <policy.xml> –a
   ```

### 4.7.7 Quick start guide cho LS1046ARDB

Mục này giải thích:

- Giới thiệu
- Thông tin tham chiếu LS1046ARDB
- Thông tin khôi phục LS1046ARDB
- Ghi image firmware tổng hợp Layerscape LDP
- Công cụ Frame Manager Configuration (FMC)

#### 4.7.7.1 Giới thiệu

Các mục sau mô tả quy trình ghi firmware tổng hợp Layerscape LDP cho LS1046A. Đồng thời, mục này giải thích quy trình cho use case phổ biến nhất: tải và triển khai các image mặc định của Layerscape LDP lên LS1046A bằng flex-installer. Để biết thêm thông tin, xem Section 4.2.

Để biết thêm thông tin về các thành phần khác nhau của board, cũng như cách cấu hình và boot board, xem LS1046A Reference Design Board Getting Started Guide.

Để xem danh sách hướng dẫn ngắn giúp bạn sửa/cập nhật từng thành phần Layerscape LDP như U-Boot, Linux kernel, microcode DPAA1 FMan trên LS1046ARDB khi boot board từ một nguồn boot cụ thể, như QSPI hoặc SD, xem NXP community.

#### 4.7.7.2 Thông tin tham chiếu LS1046ARDB

Mục này cung cấp thông tin chung về LS1046ARDB, có thể hữu ích để tham chiếu khi thực hiện các bước triển khai Layerscape LDP ở phần sau.

##### 4.7.7.2.1 Bảng ánh xạ cổng Ethernet

Tên port trong Linux TinyDistro ứng với từng port trong sáu port trên vỏ board tham chiếu được nêu trong bảng dưới đây.

| Tên port trên vỏ | Tên port trong U-Boot | Tên port trong Linux (Tiny Distro) | Tên port trong Linux (userland NXP Layerscape LDP) |
|---|---|---|---|
| RGMII1 | FM1@DTSEC3 | eth0 | fm1-mac3 |
| RGMII2 | FM1@DTSEC4 | eth1 | fm1-mac4 |
| SGMII1 | FM1@DTSEC5 | eth2 | fm1-mac5 |
| SGMII2 | FM1@DTSEC6 | eth3 | fm1-mac6 |
| 10G Copper | FM1@TGEC1 | eth4 | fm1-mac9 |
| 10G SEP+ | FM1@TGEC2 | eth5 | fm1-mac10 |

##### 4.7.7.2.2 Memory map của hệ thống

| Địa chỉ vật lý bắt đầu | Địa chỉ vật lý kết thúc | Loại bộ nhớ | Kích thước |
|---|---|---|---|
| 0x00_0000_0000 | 0x00_000F_FFFF | Secure Boot ROM | 1 MB |
| 0x00_0100_0000 | 0x00_0FFF_FFFF | CCSRBAR | 240 MB |
| 0x00_1000_0000 | 0x00_1000_FFFF | OCRAM0 | 64 KB |
| 0x00_1001_0000 | 0x00_1001_FFFF | OCRAM1 | 64 KB |
| 0x00_2000_0000 | 0x00_20FF_FFFF | DCSR | 16 MB |
| 0x00_7E80_0000 | 0x00_7E80_FFFF | IFC - NAND Flash | 64 KB |
| 0x00_7FB0_0000 | 0x00_7FB0_0FFF | IFC - CPLD | 4 KB |
| 0x00_8000_0000 | 0x00_FFFF_FFFF | DRAM1 | 2 GB |
| 0x05_0000_0000 | 0x05_07FF_FFFF | QMan S/W Portal | 128 M |
| 0x05_0800_0000 | 0x05_0FFF_FFFF | BMan S/W Portal | 128 M |
| 0x08_8000_0000 | 0x09_FFFF_FFFF | DRAM2 | 6 GB |
| 0x40_0000_0000 | 0x47_FFFF_FFFF | PCI Express1 | 32G |
| 0x48_0000_0000 | 0x4F_FFFF_FFFF | PCI Express2 | 32G |
| 0x50_0000_0000 | 0x57_FFFF_FFFF | PCI Express3 | 32G |

##### 4.7.7.2.3 Các tùy chọn boot được hỗ trợ

LS1046ARDB hỗ trợ các tùy chọn boot sau:

- SD
- QSPI NOR flash

##### 4.7.7.2.4 Các tùy chọn switch trên board

RDB có các switch người dùng chọn được để đánh giá các tùy chọn boot khác nhau cho thiết bị LS1046A, như trong bảng dưới đây ('0' là OFF, '1' là ON).

| Nguồn boot | SW3\[1:8\] | SW4\[1:8\] | SW5\[1:8\] |
|---|---|---|---|
| QSPI NOR flash0 (mặc định) | 01000110 | 00111011 | 00100010 |
| QSPI NOR flash1 | 01001110 | 00111011 | 00100010 |
| Thẻ SD | 01000110 | 00111011 | 00100000 |

**Ghi chú:** Việc đổi cấu hình thiết bị boot khỏi thiết lập mặc định có thể cần thêm thay đổi trong RCW hoặc trong các code image khác.

Về quy ước đặt tên RCW cho LS1046ARDB, xem https://github.com/nxp-qoriq/rcw/blob/master/ls1046ardb/README.

##### 4.7.7.2.5 Các bank QSPI NOR flash

LS1046ARDB có hai QSPI NOR flash nối qua QSPI controller. Tại một thời điểm chỉ có một QSPI NOR flash dùng được, tùy theo thiết lập switch của board như ở mục trước. Các thiết lập switch này cũng có thể bị ghi đè bằng lệnh CPLD. Để bảo vệ U-Boot mặc định trong flash0, NXP dùng quy ước triển khai các image đang làm việc vào flash1, rồi chuyển sang flash1 để kiểm thử. Việc chuyển sang flash1 có thể làm bằng phần mềm qua lệnh CPLD, thực chất là hoán đổi flash0 với flash1. Cách này bảo vệ flash0 và giữ cho board luôn boot được trong mọi trường hợp. Để xác định bank hiện tại, xem ví dụ log U-Boot dưới đây (flash0 hiển thị là vBank 0 và flash1 hiển thị là vBank 4).

```
U-Boot 2020.04-21450-gbde1a7f (Sep 18 2020 - 22:10:28 +0800)
SoC: LS1046AE Rev1.0 (0x87070010)
Clock Configuration:
        CPU0(A72):1800 MHz
        CPU1(A72):1800 MHz
        CPU2(A72):1800 MHz
        CPU3(A72):1800 MHz
        Bus: 700 MHz DDR: 2100 MT/s FMAN: 800 MHz
Reset Configuration Word (RCW):
        00000000: 0e150012 10000000 00000000 00000000
        00000010: 11335559 40005012 40025000 c1000000
        00000020: 00000000 00000000 00000000 00238800
        00000030: 20124000 00003101 00000096 00000001
Model: LS1046A RDB Board
Board: LS1046ARDB, boot from QSPI vBank 4
CPLD: V2.2
PCBA: V2.0
SERDES Reference Clocks:
SD1_CLK1 = 156.25MHZ, SD1_CLK2 = 100.00MHZ
DRAM: 15.9 GiB (DDR4, 64-bit, CL=15, ECC on)
        DDR Chip-Select Interleaving Mode: CS0+CS1
SEC0: RNG instantiated
Using SERDES1 Protocol: 4403 (0x1133)
Using SERDES2 Protocol: 21849 (0x5559)
NAND: 512 MiB
MMC: FSL_SDHC: 0
Loading Environment from SPI Flash... SF: Detected s25fs512s with page size 256
 Bytes, erase size 256 KiB, total 64 MiB
OK
EEPROM: NXID v1
In: serial
Out: serial
Err: serial
Net: SF: Detected s25fs512s with page size 256 Bytes, erase size 256 KiB, total
 64 MiB
Fman1: Uploading microcode version 106.4.18
PCIe1: pcie@3400000 Root Complex: no link
PCIe2: pcie@3500000 Root Complex: no link
PCIe3: pcie@3600000 Root Complex: x1 gen1
e1000: 00:15:17:8a:c6:5b
        FM1@DTSEC3, FM1@DTSEC4, FM1@DTSEC5, FM1@DTSEC6, FM1@TGEC1, FM1@TGEC2,
 e1000#0 [PRIME]
Warning: e1000#0 MAC addresses don't match:
Address in SROM is 00:15:17:8a:c6:5b
Address in environment is 00:e0:0c:00:8e:06
Warning: e1000#0 failed to set MAC address
=>
=>
```

##### 4.7.7.2.6 Chuyển đổi tùy chọn boot

Có thể chuyển đổi boot trong U-Boot bằng các lệnh sau:

- Chuyển sang QSPI NOR flash0 (mặc định):

  ```
  =>cpld reset
  ```

- Chuyển sang QSPI NOR flash1:

  ```
  =>cpld reset altbank
  ```

- Chuyển sang SD:

  ```
  =>cpld reset sd
  ```

#### 4.7.7.3 Thông tin khôi phục LS1046ARDB

Nếu board LS1046ARDB không boot được từ QSPI NOR flash 0, bạn có thể khôi phục QSPI NOR flash 0 từ QSPI NOR flash 1 theo các bước sau:

1. Tải image firmware tổng hợp đã build sẵn:

   ```
   $ cp <build>/tmp/deploy/images/ls1043ardb/firmware_ls1046ardb_qspiboot.img ~/
   tftp
   ```

2. Boot LS1046ARDB từ QSPI NOR flash1 với thiết lập switch sau:

   `SW3 = 01001110`, `SW4 = 00111011`, `SW5 = 00100010`

3. Ghi QSPI NOR flash0 từ QSPI NOR flash1:

   ```
   => tftp $load_addr firmware_ls1046ardb_qspiboot.img
   => sf probe 0:1
   => sf erase 0 +$filesize && sf write $load_addr 0 $filesize
   ```

4. Reset và boot board từ QSPI NOR flash0:

   ```
   => cpld reset
   ```

**Ghi chú:** Nếu LS1046ARDB không boot được từ cả hai bank QSPI NOR flash, bạn cần khôi phục board bằng **CodeWarrior for LS Series, Arm v8 ISA**. Về các bước khôi phục board bằng công cụ CodeWarrior, xem mục "8.6 Board Recovery" trong ARM V8 ISA, Targeting Manual.

#### 4.7.7.4 Ghi image firmware tổng hợp Layerscape LDP

Phần này giải thích các bước ghi image firmware QSPI NOR vào QSPI NOR flash trên LS1046ARDB và ghi image firmware SD vào thẻ SD trên LS1046ARDB.

Để ghi image firmware tổng hợp Layerscape LDP vào QSPI NOR flash trên LS1046ARDB:

1. Sao chép firmware trên máy host sang tftp server.

   ```
   $ cp <build>/tmp/deploy/image/ls1046ardb/firmware_ls1046ardb_qspiboot.img ~/
   tftp/
   ```

2. Reboot board từ QSPI NOR flash 0 và dừng autoboot để vào U-Boot prompt.
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_ls1046ardb_qspiboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     ```
     => load mmc <device:part> $load_addr firmware_ls1046ardb_qspiboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1046ardb_qspiboot.img
     ```

     Or

     ```
     => load usb <device:part> $load_addr firmware_ls1046ardb_qspiboot.img
     ```

     Or

     ```
     => load scsi <device:part> $load_addr firmware_ls1046ardb_qspiboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1046ardb_qspiboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_ls1046ardb_qspiboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_ls1046ardb_qspiboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Ghi firmware vào QSPI NOR flash 1.

   ```
   => sf probe 0:1
   => sf erase 0 +$filesize && sf write $load_addr 0 $filesize
   ```

5. Reset và boot board từ QSPI NOR flash 1. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.

   ```
   => cpld reset altbank
   ```

Để ghi image firmware tổng hợp Layerscape LDP vào thẻ SD trên LS1046ARDB:

1. Sao chép firmware trên máy host sang tftp server.

   ```
   $ cp <build>/tmp/deploy/image/ls1046ardb/firmware_ls1046ardb_sdboot.img ~/
   tftp/
   ```

2. Reboot board từ QSPI NOR flash 0 và dừng autoboot để vào U-Boot prompt.
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_ls1046ardb_sdboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     ```
     => load mmc <device:part> $load_addr firmware_ls1046ardb_sdboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1046ardb_sdboot.img
     ```

     Or

     ```
     => load usb <device:part> $load_addr firmware_ls1046ardb_sdboot.img
     ```

     Or

     ```
     => load scsi <device:part> $load_addr firmware_ls1046ardb_sdboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1046ardb_sdboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_ls1046ardb_sdboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_ls1046ardb_sdboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Ghi firmware vào SD card.

   ```
   => mmc dev 0; mmc write $load_addr 8 1f000
   ```

5. Reset và boot board từ thẻ SD. Hệ thống sẽ tự động boot vào Tinydistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.

   ```
   => cpld reset sd
   ```

#### 4.7.7.5 Công cụ Frame Manager Configuration (FMC)

Theo mặc định, FMan đã được cấu hình cho Parse-Classify-Distribute (PCD). Nghĩa là không cần người dùng làm gì thêm, FMan sẽ đưa các frame nhận được từ cùng một flow vào cùng một receive queue. Điều này tránh vấn đề sai thứ tự Rx packet và cải thiện hiệu năng.

Cấu hình FMan mặc định này dùng các file cấu hình và file policy được cung cấp trong NXP Layerscape LDP của bản phát hành này để thực hiện PCD. Các file này ở định dạng xml và được tạo với mục tiêu giữ thứ tự packet theo từng flow. Với LS1046ARDB, các file này nằm ở đường dẫn sau:

```
/etc/fmc/config/private/ls1046ardb/RR_FFSSPPPH_1133_5559
```

Tuy nhiên, nếu người dùng muốn áp dụng cấu hình khác với cấu hình mặc định, người dùng cần chạy lệnh sau sau khi board boot vào Linux.

1. Đổi thư mục sang thư mục cha của các file cấu hình và file policy tùy biến của người dùng.
2. Chạy lệnh của công cụ FMC:

   ```
   $ fmc –c <config.xml> –p <policy.xml> –a
   ```

### 4.7.8 Quick start guide cho LS1088ARDB

Mục này giải thích:

- Giới thiệu
- Thông tin tham chiếu LS1088ARDB và LS1088ARDB-PB
- Thông tin khôi phục LS1088ARDB và LS1088ARDB-PB
- Ghi image firmware tổng hợp Layerscape LDP
- Bật các network interface DPAA2

#### 4.7.8.1 Giới thiệu

Các mục sau mô tả quy trình ghi firmware tổng hợp Layerscape LDP cho LS1088ARDB và LS1088ARDB-PB. Đồng thời, mục này giải thích quy trình cho use case phổ biến nhất: tải và triển khai các image mặc định của Layerscape LDP lên LS1088ARDB và LS1088ARDB-PB bằng flex-installer. Để biết thêm thông tin, xem Download and deploy Layerscape LDP images with flex-installer in Linux environment.

Để biết thêm thông tin về các thành phần khác nhau của board, cũng như cách cấu hình và boot board, xem LS1088A Reference Design Board (LS1088ARDB-PB) Getting Started Guide.

Để xem danh sách hướng dẫn ngắn giúp bạn sửa/cập nhật từng thành phần Layerscape LDP như U-Boot, Linux kernel, DPL, DPC trên LS1088ARDB/LS1088ARDB-PB khi boot board từ một nguồn boot cụ thể, như QSPI hoặc SD, xem NXP community.

#### 4.7.8.2 Thông tin tham chiếu LS1088ARDB và LS1088ARDB-PB

Mục này cung cấp thông tin chung về LS1088ARDB và LS1088ARDB-PB, có thể hữu ích để tham chiếu khi thực hiện các bước triển khai Layerscape LDP ở phần sau.

**Ghi chú:**

LS1088ARDB-PB là một biến thể của LS1088ARDB, vì vậy phần lớn thông tin giống LS1088ARDB. Các mục sau nêu các điểm khác nhau, nếu có.

##### 4.7.8.2.1 Bảng ánh xạ cổng Ethernet

Bảng dưới đây cho thấy ánh xạ giữa tên các cổng Ethernet in trên mặt trước vỏ với tên port trong U-Boot và Linux.

**Table 16. Ánh xạ tên cổng Ethernet**

| Tên port trên vỏ | Tên port trong Linux (Tiny Distro và userland Linux distro) | Tên port trong U-Boot | Mô tả |
|---|---|---|---|
| ETH0 | ethx | DPMAC2@xgmii | Interface đồng XFI |
| ETH1 | ethx | DPMAC1@xgmii | Interface quang XFI |
| ETH2 | ethx | DPMAC7@qsgmii | Interface đồng QSGMII |
| ETH3 | ethx | DPMAC8@qsgmii | Interface đồng QSGMII |
| ETH4 | ethx | DPMAC9@qsgmii | Interface đồng QSGMII |
| ETH5 | ethx | DPMAC10@qsgmii | Interface đồng QSGMII |
| ETH6 | ethx | DPMAC3@qsgmii | Interface đồng QSGMII |
| ETH7 | ethx | DPMAC4@qsgmii | Interface đồng QSGMII |
| ETH8 | Nếu có card PCIe cắm vào, nó được nhận là eth1.<br>Nếu không có PCIe, nó được nhận là eth0. | DPMAC5@qsgmii | Interface đồng QSGMII |
| ETH9 | ethx | DPMAC6@qsgmii | Interface đồng QSGMII |
| **Ghi chú**: Với các port khác, interface được tạo động trong Linux. Vì vậy, tên port được xác định theo thứ tự tạo. |   |   |   |

##### 4.7.8.2.2 Memory map của hệ thống

| Địa chỉ bắt đầu | Địa chỉ kết thúc | Kích thước | Cấp phát | Ghi chú |
|---|---|---|---|---|
| 0x0000_0000_0000 | 0x0000_000F_FFFF | 1 MB | CCSR - Boot ROM | 64 KB |
| 0x0000_0010_0000 | 0x0000_00FF_FFFF | 15 MB | Reserved |   |
| 0x0000_0100_0000 | 0x0000_0FFF_FFFF | 240 MB | CCSR |   |
| 0x0000_1000_0000 | 0x0000_10FF_FFFF | 16 MB | Reserved | SP alias không gian này sang DCSR. Không cấp phát. |
| 0x0000_1100_0000 | 0x0000_11FF_FFFF | 16 MB | Reserved | SP alias không gian này sang DCSR. Không cấp phát. |
| 0x0000_1200_0000 | 0x0000_13FF_FFFF | 32 MB | Reserved | SP alias không gian này sang DCSR. Không cấp phát. |
| 0x0000_1400_0000 | 0x0000_17FF_FFFF | 64 MB | Reserved |   |
| 0x0000_1800_0000 | 0x0000_181F_FFFF | 2 MB | OCRAM | 128 KB |
| 0x0000_1820_0000 | 0x0000_18FF_FFFF | 14 MB | Reserved |   |
| 0x0000_1900_0000 | 0x0000_19FF_FFFF | 16 MB | CoreSight STM | 16 MB |
| 0x0000_1A00_0000 | 0x0000_1BFF_FFFF | 32 MB | Reserved |   |
| 0x0000_1C00_0000 | 0x0000_1CFF_FFFF | 16 MB | Reserved |   |
| 0x0000_1D00_0000 | 0x0000_1FFF_FFFF | 48 MB | Reserved |   |
| 0x0000_2000_0000 | 0x0000_2FFF_FFFF | 256 MB | Quad SPI Region #1 (0-256 MB) | Thêm không gian QSPI dưới 256 MB |
| 0x0000_3000_0000 | 0x0000_3FFF_FFFF | 256 MB | IFC Region #1 (0-256 MB) | Thêm không gian IFC dưới 256 MB |
| 0x0000_4000_0000 | 0x0000_5FFF_FFFF | 512 MB | Reserved |   |
| 0x0000_6000_0000 | 0x0000_7FFF_FFFF | 512 MB | Reserved |   |
| 0x0000_8000_0000 | 0x0000_9FFF_FFFF | 512 MB | GPP DRAM Region #1 |   |
| 0c0000_A000_0000 | 0x0000_BFFF_FFFF | 512 MB | (0-2 GB) |   |
| 0x0000_C000_0000 | 0x0000_DFFF_FFFF | 512 MB |   |   |
| 0x0000_E000_0000 | 0x0000_FFFF_FFFF | 512 MB |   |   |
| 0x0001_0000_0000 | 0x0001_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0002_0000_0000 | 0x0003_FFFF_FFFF | 8 GB |   |   |
| 0x0004_0000_0000 | 0x0004_0FFF_FFFF | 256 MB | Hole | Không gian QSPI #1 ánh xạ chồng lên không gian này |
| 0x0004_1000_0000 | 0x0004_FFFF_FFFF | 3.75 GB | Quad SPI Region #2 (256 MB-4 GB) | 3.75 GB |
| 0x0005_0000_0000 | 0x0005_0FFF_FFFF | 256 MB | Hole | Không gian IFC #1 ánh xạ chồng lên không gian này |
| 0x0005_1000_0000 | 0x0005_FFFF_FFFF | 3.75 GB | IFC Region #2 (256 MB-4 GB) | 3.75 GB |
| 0x0006_0000_0000 | 0x0006_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0007_0000_0000 | 0x0007_3FFF_FFFF | 1 GB | DCSR |   |
| 0x0007_4000_0000 | 0x0007_FFFF_FFFF | 3 GB | Reserved |   |
| DPAA2 Portal Map |   |   |   |   |
| 0x0008_0000_0000 | 0x0008_03FF_FFFF | 64 MB | Reserved |   |
| 0x0008_0400_0000 | 0x0008_07FF_FFFF | 64 MB | Reserved |   |
| 0x0008_0800_0000 | 0x0008_0BFF_FFFF | 64 MB | Reserved |   |
| 0x0008_0C00_0000 | 0x0008_0FFF_FFFF | 64 MB | MC - 1024 portals | 32 MB (512 portal) |
| 0x0008_1000_0000 | 0x0008_17FF_FFFF | 128 MB | Reserved |   |
| 0x0008_1800_0000 | 0x0008_1FFF_FFFF | 128 MB | QBMAN portals | 128 MB |
| 0x0008_0000_0000 | 0x000B_FFFF_FFFF | 15.5 GB | Reserved |   |
| 0x000C_0000_0000 | 0x000F_FFFF_FFFF | 16 GB | Reserved |   |
| High-speed I/O (PCIe) |   |   |   |   |
| 0x0010_0000_0000 | 0x0011_FFFF_FFFF | 8 GB | Reserved |   |
| 0x0012_0000_0000 | 0x0013_FFFF_FFFF | 8 GB | Reserved |   |
| 0x0014_0000_0000 | 0x0015_FFFF_FFFF | 8 GB | Reserved |   |
| 0x0016_0000_0000 | 0x0017_FFFF_FFFF | 8 GB | Reserved |   |
| 0x0018_0000_0000 | 0x0019_FFFF_FFFF | 8 GB | Reserved |   |
| 0x001A_0000_0000 | 0x001B_FFFF_FFFF | 8 GB | Reserved |   |
| 0x001C_0000_0000 | 0x001D_FFFF_FFFF | 8 GB | Reserved |   |
| 0x001E_0000_0000 | 0x001F_FFFF_FFFF | 8 GB | Reserved |   |
| 0x0020_0000_0000 | 0x0027_FFFF_FFFF | 32 GB | PCIe1 |   |
| 0x0028_0000_0000 | 0x002F_FFFF_FFFF | 32 GB | PCIe2 |   |
| 0x0030_0000_0000 | 0x0037_FFFF_FFFF | 32 GB | PCIe3 |   |
| 0x0038_0000_0000 | 0x003F_FFFF_FFFF | 32 GB | Reserved |   |
| DPAA2 External address map |   |   |   |   |
| 0x0040_0000_0000 | 0x0040_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0041_0000_0000 | 0x0041_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0042_0000_0000 | 0x0042_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0043_0000_0000 | 0x0043_FFFF_FFFF | 4 GB | WRIOP access window |   |
| 0x0044_0000_0000 | 0x0047_FFFF_FFFF | 16 GB | Reserved |   |
| 0x0048_0000_0000 | 0x0048_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0049_0000_0000 | 0x0049_FFFF_FFFF | 4 GB | Reserved |   |
| 0x004A_0000_0000 | 0x004A_FFFF_FFFF | 4 GB | Reserved |   |
| 0x004B_0000_0000 | 0x004B_FFFF_FFFF | 4 GB | Reserved |   |
| 0x004C_0000_0000 | 0x004F_FFFF_FFFF | 16 GB | Packet Express Buffer | 1 MB |
| 0x0050_0000_0000 | 0x005F_FFFF_FFFF | 64 GB | Reserved |   |
| 0x0060_0000_0000 | 0x007F_FFFF_FFFF | 128 GB | Reserved |   |
| 0x0080_0000_0000 | 0x0080_7FFF_FFF | 2 GB | Hole |   |
| 0x0080_8000_0000 | 0x00FF_FFFF_FFFF | 510 GB | GPP DRAM Region #2 (2-512GB) |   |

##### 4.7.8.2.3 Các tùy chọn boot được hỗ trợ

LS1088ARDB và LS1088ARDB-PB hỗ trợ các tùy chọn boot sau:

- SD
- QSPI NOR Flash

  **Ghi chú:**

  - Khi boot từ SD, RCW, U-Boot và các thành phần firmware khác nằm trên thẻ SD, bắt đầu từ block 8.
  - Khi boot từ QSPI NOR flash, RCW, U-Boot và các thành phần firmware khác nằm trong flash, bắt đầu từ offset 0x0. Xem Layerscape LDP Memory Layout để biết thêm thông tin.

##### 4.7.8.2.4 Các tùy chọn switch trên board

Các RDB có các switch người dùng chọn được để đánh giá các tùy chọn boot khác nhau cho thiết bị LS1088A, như trong bảng dưới đây ('0' là OFF, '1' là ON).

**Ghi chú:** Mặc dù thiết lập switch trên board trong bảng dưới đây giống nhau cho LS1088ARDB và LS1088ARDB-PB, ý nghĩa của một số thiết lập có thể khác nhau. Xem “Switch settings” trong LS1088ARDB Getting Started Guide và “Switch configuration” trong LS1088ARDB-PB Getting Started Guide để biết mô tả chi tiết từng thiết lập switch.

| Nguồn boot | SW1\[1:8\] | SW2\[1:8\] | SW3\[1:8\] | SW4\[1:8\] | SW5\[1:8\] |
|---|---|---|---|---|---|
| QSPI NOR flash0 (mặc định) | 0011 0001 | X100 0000 | 1110 0010 | 1001 0011 | 0111 0000 |
| QSPI NOR flash1 | 0011 0001 | X100 0001 | 1110 0010 | 1001 0011 | 0111 0000 |
| Thẻ SD | 0010 0000 | 0100 0000 | 1110 0010 | 1001 0011 | 0111 0000 |

Lưu ý rằng việc đổi cấu hình thiết bị boot khỏi thiết lập mặc định có thể cần thêm thay đổi trong RCW hoặc trong các code image khác. Về quy ước đặt tên RCW cho LS1088ARDB, xem https:// github.com/nxp-qoriq/rcw/blob/master/ls1088ardb/README.

##### 4.7.8.2.5 Các bank QSPI NOR flash

LS1088ARDB và LS1088ARDB-PB có 2 QSPI NOR flash nối qua QSPI controller. Tại một thời điểm chỉ có một QSPI NOR flash dùng được, tùy theo thiết lập switch của board như ở mục trước. Các thiết lập switch này cũng có thể bị ghi đè bằng các lệnh qixis_reset trong U-Boot.

Để bảo vệ U-Boot mặc định trong flash0, NXP dùng quy ước triển khai các image đang làm việc vào flash1, rồi chuyển sang flash1 để kiểm thử. Việc chuyển sang flash1 có thể làm bằng phần mềm qua lệnh qixis_reset, thực chất là hoán đổi flash0 với flash1. Cách này bảo vệ flash0 và giữ cho board luôn boot được trong mọi trường hợp.

Để xác định bank hiện tại, xem ví dụ log U-Boot dưới đây:

```
U-Boot 2022.04+fsl+g181859317b (Nov 15 2022 - 06:28:05 +0000)
SoC: LS1088AE Rev1.0 (0x87030010)
Clock Configuration:
        CPU0(A53):1600 MHz CPU1(A53):1600 MHz CPU2(A53):1600 MHz
        CPU3(A53):1600 MHz CPU4(A53):1600 MHz CPU5(A53):1600 MHz
        CPU6(A53):1600 MHz CPU7(A53):1600 MHz
        Bus: 700 MHz DDR: 2100 MT/s
Reset Configuration Word (RCW):
        00000000: 4000541c 00000040 00000000 00000000
        00000010: 00000000 000a0000 00300000 00000000
        00000020: 016011a0 00002580 00000000 00000040
        00000030: 0000005b 00000000 00002403 00000000
        00000040: 00000000 00000000 00000000 00000000
        00000050: 00000000 00000000 00000000 00000000
        00000060: 00000000 00000000 00000011 000009e7
        00000070: 44110000 00509555
VID: Core voltage after adjustment is at 1026 mV
DRAM: 15.9 GiB
DDR 15.9 GiB (DDR4, 64-bit, CL=15, ECC on)
        DDR Chip-Select Interleaving Mode: CS0+CS1 Using SERDES1
Protocol: 29 (0x1d)
```

Có thể chuyển đổi tùy chọn boot trong U-Boot bằng các câu lệnh sau.

- Chuyển sang QSPI NOR flash 0 (mặc định):

  ```
  => qixis_reset
  ```

- Chuyển sang QSPI NOR flash 1:

  ```
  => qixis_reset altbank
  ```

- Chuyển sang SD:

  ```
  => qixis_reset sd
  ```

##### 4.7.8.2.6 Các biến môi trường U-Boot

- Các biến môi trường riêng cho DPAA2
  - **mcboottimeout:** Định nghĩa thời gian timeout khi boot Management Complex, tính bằng mili giây. Nếu biến này không được định nghĩa, giá trị lúc compile CONFIG_SYS_LS_MC_BOOT_TIMEOUT_MS sẽ là mặc định. Thông thường, người dùng không cần đặt biến này vì giá trị mặc định đã chấp nhận được.
  - **mcmemsize:** Định nghĩa lượng DDR hệ thống được Management Complex dùng. Nếu biến này không được định nghĩa, giá trị lúc compile 0x70000000 hay 1.75 GB sẽ là mặc định. Thông thường, người dùng không cần đặt biến này vì giá trị mặc định đã chấp nhận được.
  - **mcinitcmd:** Chứa các lệnh để tự động nạp và khởi động Management Complex trước khi U-Boot bắt đầu đếm ngược để boot. Nếu biến này được định nghĩa, nội dung của nó sẽ được chạy. Giá trị mặc định giả định rằng firmware Management Complex (MC) và file Data Path Control được lưu trong QSPI NOR/SD flash ở các địa chỉ cố định.
- Các biến môi trường không riêng cho DPAA2
  - bootcmd: Chứa các lệnh được tự động thực thi khi lệnh boot của U-Boot được chạy. Việc này diễn ra tự động khi người dùng không ngắt quá trình đếm ngược ban đầu của U-Boot.

Để biết thêm về lệnh distro boot của U-Boot, xem Section 5.3.2.

#### 4.7.8.3 Thông tin khôi phục LS1088ARDB và LS1088ARDB-PB

Nếu board LS1088ARDB/LS1088ARDB-PB không boot được từ QSPI NOR flash 0, bạn có thể khôi phục QSPI NOR flash 0 từ QSPI NOR flash 1 theo các bước sau:

1. Tải image firmware tổng hợp đã build sẵn:

   `$ cp <build>/tmp/deploy/image/ls1043ardb/firmware_ls1088ardb_pb_qspiboot.img ~/tftp` **Ghi chú:** Lưu ý rằng LS1088ARDB không còn được hỗ trợ từ bản phát hành Layerscape LDP 18.12 trở đi.

2. Boot LS1088ARDB/LS1088ARDB-PB từ QSPI NOR flash 1 với thiết lập switch sau:
   - SW1\[1:8\] = 0011 0001
   - SW2\[1:8\] = X100 0001
   - SW3\[1:8\] = 1110 0010
   - SW4\[1:8\] = 1001 0011
   - SW5\[1:8\] = 0111 0000
3. Ghi QSPI NOR flash 0 từ QSPI NOR flash 1:

   ```
   => sf probe 0:1
   => tftp $load_addr firmware_ls1088ardb_pb_qspiboot.img
   => sf erase 0x0 +$filesize && sf write $load_addr 0x0 $filesize
   ```

4. Reset và boot board từ QSPI NOR flash 0:

   ```
   => qixis_reset
   ```

**Ghi chú:** Nếu LS1088ARDB/LS1088ARDB-PB không boot được từ cả hai bank QSPI NOR flash, bạn cần khôi phục board bằng **CodeWarrior for LS Series, Arm v8 ISA**. Về các bước khôi phục board bằng công cụ CodeWarrior, xem mục "8.6 Board Recovery" trong ARM V8 ISA, Targeting Manual.

#### 4.7.8.4 Ghi image firmware tổng hợp Layerscape LDP

Phần này giải thích các bước ghi image firmware QSPI NOR vào QSPI NOR flash trên LS1088ARDB/LS1088ARDB-PB và ghi image firmware SD vào thẻ SD trên LS1088ARDB/LS1088ARDB-PB.

Để ghi image firmware tổng hợp Layerscape LDP vào QSPI NOR flash trên LS1088ARDB/LS1088ARDB-PB:

1. Sao chép firmware trên máy host sang TFTP server.

   ```
   $ cp <build>/tmp/deploy/image/ls1088ardb/firmware_ls1088ardb_qspiboot.img ~/
   tftp/
   ```

2. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_ls1088ardb_pb_qspiboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     ```
     => load mmc <dev:part> $load_addr firmware_ls1088ardb_pb_qspiboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1088ardb_pb_qspiboot.img
     ```

     or

     ```
     => load usb <dev:part> $load_addr firmware_ls1088ardb_pb_qspiboot.img
     ```

     or

     ```
     => load scsi <dev:part> $load_addr firmware_ls1088ardb_pb_qspiboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1088ardb_pb_qspiboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_ls1088ardb_pb_qspiboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_ls1088ardb_pb_qspiboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

3. re (từ website NXP) sang máy Linux host.

   ```
   $ Copy firmware on host machine to tftp server
   ```

   **Ghi chú:** Lưu ý rằng các image LS1088ARDB build sẵn không còn có từ bản phát hành Layerscape LDP 18.12 trở đi.

4. Reboot board từ QSPI NOR flash 0 và dừng autoboot để vào U-Boot prompt.
5. Ghi firmware vào QSPI NOR flash 1.

   ```
   => sf probe 0:1
   => sf erase 0 +$filesize && sf write $load_addr 0 $filesize
   ```

6. Reset và boot board từ QSPI NOR flash 1. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.

   ```
   => qixis_reset altbank
   ```

Để ghi image firmware tổng hợp Layerscape LDP vào thẻ SD trên LS1088ARDB/LS1088ARDB-PB:

1. Sao chép firmware trên máy host sang tftp server.

   ```
   $ cp <build>/tmp/deploy/image/ls1088ardb/firmware_ls1088ardb_sdboot.img ~/
   tftp/
   ```

   **Ghi chú:** Lưu ý rằng LS1088ARDB không còn được hỗ trợ từ bản phát hành Layerscape LDP 18.12 trở đi.

2. Reboot board từ QSPI NOR flash 0 và dừng autoboot để vào U-Boot prompt.
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_ls1088ardb_pb_sdboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     ```
     => load mmc <device:partition> $load_addr firmware_ls1088ardb_pb_sdboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1088ardb_pb_sdboot.img
     ```

     Or

     ```
     => load usb <device:part> $load_addr firmware_ls1088ardb_pb_sdboot.img
     ```

     Or

     ```
     => load scsi <dev:part> $load_addr firmware_ls1088ardb_pb_sdboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls1088ardb_pb_sdboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_ls1088ardb_pb_sdboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_ls1088ardb_pb_sdboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Ghi firmware vào SD card.

   ```
   => mmc dev 0; mmc write $load_addr 8 1f000
   ```

5. Reset và boot board từ SD card. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.

   ```
   => qixis_reset sd
   ```

#### 4.7.8.5 Bật các network interface DPAA2

Mục này mô tả quy trình bật các network interface DPAA2.

##### 4.7.8.5.1 Dùng lệnh Linux để liệt kê các network interface

Linux distribution boot với một file DPL mặc định, file này chỉ bật một network interface trên DPAA2 theo mặc định, dưới dạng một Ethernet interface chuẩn của kernel.

Chạy lệnh Linux chuẩn sau để lấy danh sách các interface đã bật.

`$ ip link show`

Interface mặc định có tên eth0 (hoặc eth1 nếu một network interface card PCI Express được phát hiện trước).

##### 4.7.8.5.2 Dùng các wrapper script của restool để liệt kê các đối tượng DPAA2

Các wrapper script dễ dùng được cung cấp trong `rootfs` của bản phát hành để hỗ trợ tạo động các DPNI và các phụ thuộc liên quan. Các wrapper script gọi các lệnh `restool`.

Để liệt kê các wrapper script có sẵn, nhập lệnh sau:

```
$ls-main
```

Các Ethernet interface có các đối tượng DPAA2 tương ứng gắn với chúng.

Để liệt kê data path network interface (DPNI) đã bật gắn với eth0 (hoặc eth1), chạy wrapper script restool sau:

```
$ ls-listni
dprc.1/dpni.0 (interface: eth1, end point: dpmac.5)
```

Kết quả này cho thấy có data path network interface tên dpni.0 thuộc resource container DPAA2 dprc.1. Đối tượng DPNI này ứng với interface tên eth1, được nối với dpmac.5.

Có thể dùng lệnh sau để liệt kê mọi đối tượng DPMAC có trong hệ thống và chúng được nối với cái gì (nếu có).

```
$ ls-listmac
    dprc.1/dpmac.10
    dprc.1/dpmac.9
    dprc.1/dpmac.8
    dprc.1/dpmac.7
    dprc.1/dpmac.6
    dprc.1/dpmac.5 (end point: dpni.0)
    dprc.1/dpmac.4
    dprc.1/dpmac.3
    dprc.1/dpmac.2
    dprc.1/dpmac.1
```

Để biết thêm về các đối tượng DPAA2 và restool, xem DPAA2-specific Software trong tài liệu Layerscape LDP.

##### 4.7.8.5.3 Thêm và hủy network interface

Như đã nói ở các mục trước, interface eth0 (hoặc eth1) ứng với data path network interface dpni.0, interface duy nhất được bật trong file DPL mặc định. Tuy nhiên, người dùng có thể cần bật nhiều hơn một network interface. Đồng thời, DPNI.0 được cấu hình với một tập tài nguyên tối thiểu – ví dụ, nó chỉ có thể nhận traffic trên một core qua một queue. Có thể tạo thêm các đối tượng DPNI đầy đủ tính năng bằng restool. Sau khi tạo các đối tượng này, cấu hình có thể được lưu vào một file DPL tùy biến.

Chạy lệnh dưới đây là cách đơn giản nhất để thêm một đối tượng DPNI và nối nó với một DPMAC. Trong trường hợp này, đối tượng DPNI được nối với dpmac.4, dùng các tùy chọn và đối số mặc định.

```
$ ls-addni dpmac.4
Created interface: eth0 (object:dpni.1, endpoint: dpmac.4)
```

Chạy lệnh sau để hiển thị thông tin về interface dpni.1 vừa tạo. Số queue được hiển thị là 8, mỗi core một queue cho 8 core có thể nhận traffic.

```
restool dpni info dpni.1
```

Nếu bạn muốn nối DPMAC5 (mặc định nối với dpni.0) với một data path network interface đầy đủ tính năng, thì trước hết bạn phải unbind và hủy interface hiện có bằng các lệnh dưới đây.

Unbind dpni.0 khỏi driver:

```
$ echo dpni.0 > /sys/bus/fsl-mc/drivers/fsl_dpaa2_eth/unbind
```

Hủy data path network interface dpni.0

```
$ restool dpni destroy dpni.0
dpni.0 is destroyed
```

Giờ thêm lại dpmac.5 bằng lệnh dưới đây. Mặc dù dpmac.5 lại được nối với dpni.0, giờ dpni.0 dùng 8 traffic queue để phân phối.

```
$ ls-addni dpmac.5
Created interface: eth0 (object:dpni.0, endpoint: dpmac.5)
```

**Ghi chú:** Lưu ý rằng trên SoC LS1088A, nếu dùng cấp phát tài nguyên mặc định của script ls-addni thì không thể tạo và nối DPNI với cả 10 DPMAC có sẵn. Nguyên nhân là theo mặc định, script ls-addni tạo một interface với 64 flow steering entry và 16 MAC entry. Vì SoC LS1088A có tổng cộng 2K CTLU entry (tài nguyên được các tham số fs_entries và mac_entries dùng), tài nguyên dễ bị chiếm hết và DPNI thứ 10 không được tạo. Giới hạn này không gặp trên các SoC dựa trên DPAA2 khác (LS2088A hoặc LX2160A) vì tài nguyên CTLU ở đó không khan hiếm.

Dưới đây là một trình tự tạo cả 10 interface mà không gặp lỗi.

```
for i in `seq 1 9`; do ls-addni "dpmac.$i"; done
# for the 10th interface use a lower number of pre-allocated resources (steering
 entries and mac entries)
ls-addni dpmac.10 -f=16 -m=8
```

Dưới đây là ví dụ chi tiết về cách tính cấp phát tài nguyên CTLU.

Một classification key, tùy kích thước, có thể trải trên nhiều CTLU entry. Ví dụ, một key 56 byte (đây là kích thước key cho các flow steering entry exact match) chiếm ba entry. Theo mặc định, khi một interface được tạo bằng ls-addni, 64 fs_entries được cấp phát trước. Nghĩa là tổng cộng 64 \* 3 = 192 entry được dùng cho một DPNI. Với 10 DPNI thì gấp 10 lần, tức 1920 entry. Một tham số mặc định khác tiêu tốn tài nguyên CTLU là mac_entries. Một mac_entry key tiêu tốn 1 CTLU entry. 16 MAC entry mặc định tiêu tốn 16 CTLU entry. Với 10 DPNI, 160 CTLU entry bị tiêu tốn. Cộng các số trên lại, ta được tổng cộng 2080 entry cho 10 DPNI, nhiều hơn mức tối đa 2K.

##### 4.7.8.5.4 Lưu cấu hình vào một file DPL tùy biến (Tùy chọn)

Sau khi tạo thêm các đối tượng DPNI, bạn có thể tạo một file DPL tùy biến bằng lệnh sau:

`$ restool dprc generate-dpl dprc.1 > <file_name>.dts`

**Ghi chú:** File DPL này ở định dạng \*.dts và được tạo trên board tham chiếu.

Bạn phải compile file \*.dts thu được bằng công cụ dtc để tạo file \*.dtb.

Để sao chép file DPL (\*.dts) sang một máy Linux host hoặc server bằng SCP và chuyển nó thành file \*.dtb, chạy lệnh sau:

`$ dtc -I dts -O dtb <file_name>.dts -o <file_name>.dtb`

**Ghi chú:** File DPL vừa tạo có thể được ghi lên board và dùng để boot vào Linux.

##### 4.7.8.5.5 Gán địa chỉ IP cho network interface

Có thể gán địa chỉ IP tĩnh cho network interface bằng các lệnh chuẩn ifconfig hoặc ip.

```
ifconfig <interface_name_in_Linux> <ip_address>
OR
ip address add <ip_address> dev <interface_name_in_linux>
```

Ngoài ra, cũng có thể gán địa chỉ IP tĩnh bằng netplan. Tạo một file tên “config.yaml” trong /etc/netplan. Dùng một trình soạn thảo văn bản, thêm các dòng sau vào file cấu hình này và lưu lại.

```
network:
  version: 2
  renderer: networkd
  ethernets:
    <interface_name_in_Linux>:
      addresses:
        - <ip_address>/24
```

Sau khi lưu file này, chạy lệnh sau để áp dụng cấu hình netplan này rồi reboot board.

```
sudo netplan apply
```

Khi board reboot xong, bật interface mong muốn bằng lệnh “`ifconfig <interface_name_in_Linux>` up” hoặc “ `ip link set <interface_name_in_Linux> up`”. Interface được gán địa chỉ IP đã nhập trong file “ `config.yaml`”. Netplan cũng có thể dùng để gán địa chỉ IP động bằng DHCP. Để gán IP động, thay nội dung file config.yaml bằng nội dung sau.

```
network:
  version: 2
  renderer: networkd
  ethernets:
    <interface_name_in_Linux>:
      dhcp4: true
```

Làm theo cùng quy trình như gán IP tĩnh bằng Netplan sau khi lưu file “`config.yaml`”.

### 4.7.9 Quick start guide cho LS2088ARDB

Mục này giải thích:

- Giới thiệu
- Thông tin tham chiếu LS2088ARDB
- Thông tin khôi phục LS2088ARDB
- Ghi image firmware tổng hợp Layerscape LDP
- Bật các network interface DPAA2

#### 4.7.9.1 Giới thiệu

Các mục sau mô tả quy trình ghi firmware tổng hợp Layerscape LDP cho LS2088ARDB. Đồng thời, mục này giải thích quy trình cho use case phổ biến nhất: tải và triển khai các image mặc định của Layerscape LDP lên LS2088ARDB bằng flex-installer. Để biết thêm thông tin, xem Section 4.2.

Để biết thêm thông tin về các thành phần khác nhau của board, cũng như cách cấu hình và boot board, xem LS2088ARDB board documentation.

#### 4.7.9.2 Thông tin tham chiếu LS2088ARDB

Mục này cung cấp thông tin chung về LS2088ARDB, có thể hữu ích để tham chiếu khi thực hiện các bước triển khai Layerscape LDP ở phần sau.

##### 4.7.9.2.1 Bảng ánh xạ cổng Ethernet

| Tên port trên vỏ | Tên port trong U-Boot | Tên port trong Linux (Tiny Distro và userland Linux distro) | Mô tả |
|---|---|---|---|
| ETH0 | DPMAC5@xgmii | eth0 theo mặc định (hoặc eth1 nếu network interface card PCI Express được phát hiện trước) | Interface đồng XFI |
| ETH1 | DPMAC6@xgmii | không bật theo mặc định | Interface đồng XFI |
| ETH2 | DPMAC7@xgmii | không bật theo mặc định | Interface đồng XFI |
| ETH3 | DPMAC8@xgmii | không bật theo mặc định | Interface đồng XFI |
| ETH4 | DPMAC1@xgmii | không bật theo mặc định | Interface đồng XFI |
| ETH5 | DPMAC2@xgmii | không bật theo mặc định | Interface đồng XFI |
| ETH6 | DPMAC3@xgmii | không bật theo mặc định | Interface đồng XFI |
| ETH7 | DPMAC4@xgmii | không bật theo mặc định | Interface đồng XFI |

##### 4.7.9.2.2 Memory map của hệ thống

| Địa chỉ bắt đầu | Địa chỉ kết thúc | Kích thước | Cấp phát | Ghi chú |
|---|---|---|---|---|
| 0x0000_0000_0000 | 0x0000_000F_FFFF | 1 MB | CCSR - Boot ROM | 64 KB |
| 0x0000_0010_0000 | 0x0000_00FF_FFFF | 15 MB | Reserved |   |
| 0x0000_0100_0000 | 0x0000_0FFF_FFFF | 240 MB | CCSR |   |
| 0x0000_1000_0000 | 0x0000_10FF_FFFF | 16 MB | Reserved |   |
| 0x0000_1100_0000 | 0x0000_11FF_FFFF | 16 MB | Reserved |   |
| 0x0000_1200_0000 | 0x0000_13FF_FFFF | 32 MB | Reserved |   |
| 0x0000_1400_0000 | 0x0000_17FF_FFFF | 64 MB | Reserved |   |
| 0x0000_1800_0000 | 0x0000_181F_FFFF | 2 MB | OCRAM | 128 KB |
| 0x0000_1820_0000 | 0x0000_18FF_FFFF | 14 MB | Reserved |   |
| 0x0000_1900_0000 | 0x0000_19FF_FFFF | 16 MB | CoreSight STM | 16 MB |
| 0x0000_1A00_0000 | 0x0000_1BFF_FFFF | 32 MB | Reserved |   |
| 0x0000_1C00_0000 | 0x0000_1CFF_FFFF | 16 MB | Reserved |   |
| 0x0000_1D00_0000 | 0x0000_1FFF_FFFF | 48 MB | Reserved |   |
| 0x0000_2000_0000 | 0x0000_2FFF_FFFF | 256 MB | Quad SPI Region #1 (0-256 MB) | Thêm không gian QSPI dưới 256 MB |
| 0x0000_3000_0000 | 0x0000_3FFF_FFFF | 256 MB | IFC Region #1 (0-256 MB) | Thêm không gian IFC dưới 256 MB |
| 0x0000_4000_0000 | 0x0000_5FFF_FFFF | 512 MB | Reserved |   |
| 0x0000_6000_0000 | 0x0000_7FFF_FFFF | 512 MB | Reserved |   |
| 0x0000_8000_0000 | 0x0000_9FFF_FFFF | 512 MB | GPP DRAM Region #1 (0-2 GB) |   |
| 0c0000_A000_0000 | 0x0000_BFFF_FFFF | 512 MB |   |   |
| 0x0000_C000_0000 | 0x0000_DFFF_FFFF | 512 MB |   |   |
| 0x0000_E000_0000 | 0x0000_FFFF_FFFF | 512 MB |   |   |
| 0x0001_0000_0000 | 0x0001_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0002_0000_0000 | 0x0003_FFFF_FFFF | 8 GB |   |   |
| 0x0004_0000_0000 | 0x0004_0FFF_FFFF | 256 MB | Hole | Không gian QSPI #1 ánh xạ chồng lên không gian này |
| 0x0004_1000_0000 | 0x0004_FFFF_FFFF | 3.75 GB | Quad SPI Region #2 (256 MB-4 GB) | 3.75 GB 0x0005_00 00_0000 0x0005_0 FFF_FFFF 256 |
|   |   | MB | Hole | Không gian IFC #1 ánh xạ chồng lên không gian này |
| 0x0005_1000_0000 | 0x0005_FFFF_FFFF | 3.75 GB | IFC Region #2 (256 MB-4 GB) | 3.75 GB |
| 0x0006_0000_0000 | 0x0006_FFFF_FFFF | 4GB | Reserved |   |
| 0x0007_0000_0000 | 0x0007_3FFF_FFFF | 1 GB | DCSR |   |
| 0x0007_4000_0000 | 0x0007_FFFF_FFFF | 3 GB | Reserved<br>DPAA2 Portal Map |   |
| 0x0008_0000_0000 | 0x0008_03FF_FFFF | 64 MB | Reserved |   |
| 0x0008_0400_0000 | 0x0008_07FF_FFFF | 64 MB | Reserved |   |
| 0x0008_0800_0000 | 0x0008_0BFF_FFFF | 64 MB | Reserved |   |
| 0x0008_0C00_0000 | 0x0008_0FFF_FFFF | 64 MB | MC - 1024 portals | 32 MB (512 portal) |
| 0x0008_1000_0000 | 0x0008_17FF_FFFF | 128 MB | Reserved |   |
| 0x0008_1800_0000 | 0x0008_1FFF_FFFF | 128 MB | QBMAN portals | 128 MB |
| 0x0008_0000_0000 | 0x000B_FFFF_FFFF | 15.5 GB | Reserved |   |
| 0x000C_0000_0000 | 0x000F_FFFF_FFFF | 16 GB | Reserved |   |
|   |   |   | I/O tốc độ cao (PCIe) | Xem chi tiết các IP cụ thể bên dưới |
| 0x0010_0000_0000 | 0x0011_FFFF_FFFF | 8 GB | Reserved |   |
| 0x0012_0000_0000 | 0x0013_FFFF_FFFF | 8 GB | Reserved |   |
| 0x0014_0000_0000 | 0x0015_FFFF_FFFF | 8 GB | Reserved |   |
| 0x0016_0000_0000 | 0x0017_FFFF_FFFF | 8 GB | Reserved |   |
| 0x0018_0000_0000 | 0x0019_FFFF_FFFF | 8 GB | Reserved |   |
| 0x001A_0000_0000 | 0x001B_FFFF_FFFF | 8 GB | Reserved |   |
| 0x001C_0000_0000 | 0x001D_FFFF_FFFF | 8 GB | Reserved |   |
| 0x001E_0000_0000 | 0x001F_FFFF_FFFF | 8 GB | Reserved |   |
| 0x0020_0000_0000 | 0x0027_FFFF_FFFF | 32 GB | PCIe1 |   |
| 0x0028_0000_0000 | 0x002F_FFFF_FFFF | 32 GB | PCIe2 |   |
| 0x0030_0000_0000 | 0x0037_FFFF_FFFF | 32 GB | PCIe3 |   |
| 0x0038_0000_0000 | 0x003F_FFFF_FFFF | 32 GB | PCIe4 |   |
|   |   |   | DPAA2 Ext address map |   |
| 0x0040_0000_0000 | 0x0040_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0041_0000_0000 | 0x0041_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0042_0000_0000 | 0x0042_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0043_0000_0000 | 0x0043_FFFF_FFFF | 4 GB | WRIOP access window |   |
| 0x0044_0000_0000 | 0x0047_FFFF_FFFF | 16 GB | Reserved |   |
| 0x0048_0000_0000 | 0x0048_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0049_0000_0000 | 0x0049_FFFF_FFFF | 4 GB | Reserved |   |
| 0x004A_0000_0000 | 0x004A_FFFF_FFFF | 4 GB | Reserved |   |
| 0x004B_0000_0000 | 0x004B_FFFF_FFFF | 4 GB | Reserved |   |
| 0x004C_0000_0000 | 0x004F_FFFF_FFFF | 16 GB | Packet express buffer | 4 MB |
| 0x0050_0000_0000 | 0x005F_FFFF_FFFF | 64 GB | Reserved |   |
| 0x0060_0000_0000 | 0x007F_FFFF_FFFF | 128 GB | DPAA2 DRAM |   |
| 0x0080_0000_0000 | 0x0080_7FFF_FFF | 2 GB | Hole |   |
| 0x0080_8000_0000 | 0x00FF_FFFF_FFFF | 510 GB | GPP DRAM Region #2 (2-512 GB) |   |

##### 4.7.9.2.3 Các tùy chọn boot được hỗ trợ

LS2088ARDB hỗ trợ các tùy chọn boot sau:

- Parallel NOR flash (ở các mục sau gọi là "NOR" hoặc "NOR flash")
- QSPI NOR flash (chỉ có trên RDB Rev E trở về sau)

##### 4.7.9.2.4 Các tùy chọn switch trên board

Các RDB có các switch người dùng chọn được để đánh giá các tùy chọn boot khác nhau cho thiết bị LS2088A, như trong bảng dưới đây ('0' là OFF, '1' là ON).

| Nguồn boot | SW5\[1:8\] | SW3\[1:8\] | SW4\[1:8\] | SW6\[1:8\] | SW7\[1:8\] | SW9\[1:8\] | SW8\[1:8\] |
|---|---|---|---|---|---|---|---|
| NOR flash bank0 (mặc định) | 1111 1111 | 0001 0010 | 1111 1111 | 1111 1111 | 0100 0010 | 0100 0000 | 0111 1111 |
| NOR flash bank4 | 1111 1111 | 0001 0010 | 1111 1111 | 1111 1111 | 0100 0010 | 0110 0000 | 0111 1111 |
| QSPI NOR flash | 1111 1111 | 0011 0001 | 0111 1111 | 1111 1111 | 0100 1010 | 0100 0000 | 0111 1111 |

Lưu ý rằng việc đổi cấu hình thiết bị boot khỏi thiết lập mặc định có thể cần thêm thay đổi trong RCW hoặc trong các code image khác. Về quy ước đặt tên RCW cho LS2088ARDB, xem https:// github.com/nxp-qoriq/rcw/blob/master/ls2088ardb/README.

Ngoài thiết lập switch ở trên, hãy bảo đảm các thiết lập jumper sau đúng với kiểu boot mong muốn (cho RDB Rev E trở về sau).

| Jumper | Thiết lập |
|---|---|
| J8 | Với QSPI-boot, qua qspi flash trên board: 1-2<br>Với QSPI-boot, qua qspi emulator: 2-3 |
| J14 | Với NOR-boot: 1-2<br>Với QSPI-boot: 2-3 |

##### 4.7.9.2.5 Các bank của NOR Flash

LS2088ARDB có một tính năng đặc biệt cho phép chia một NOR flash thành nhiều phần gọi là “bank”. Việc này được thực hiện bằng logic ở mức board, sửa đổi các tín hiệu địa chỉ. Vì về mặt vật lý chỉ có một NOR flash, các bank đôi khi được gọi là bank "ảo". Lợi ích của tính năng này là cho phép triển khai độc lập nhiều bộ image lên cùng một NOR flash. Điều này rất hữu ích trong quá trình phát triển, vì image U-Boot ở một bank có thể được dùng để ghi một bộ image vào bank khác. Nếu các image mới có lỗi, các image cũ vẫn hoạt động. Logic trên board thường cho phép chia NOR flash thành tối đa 8 bank, nhưng NOR flash trên LS2088ARDB được chia làm hai nửa, gọi là bank 0 và bank 4. Có thể chuyển bank bằng phần mềm qua các lệnh qixis_reset. Để xác định bank hiện tại, xem ví dụ log U-Boot dưới đây.

```
U-Boot 2022.04+fsl+g181859317b (Nov 15 2022 - 06:28:05 +0000)
SoC: LS2088AE Rev1.1 (0x87090011)
Clock Configuration:
 CPU0(A72):1800 MHz CPU1(A72):1800 MHz CPU2(A72):1800 MHz
 CPU3(A72):1800 MHz CPU4(A72):1800 MHz CPU5(A72):1800 MHz
 CPU6(A72):1800 MHz CPU7(A72):1800 MHz
 Bus: 700 MHz DDR: 1866.667 MT/s DP-DDR: 1600 MT/s
Reset Configuration Word (RCW):
 00000000: 483038b8 48480048 00000000 00000000
 00000010: 00000000 00000000 00a00000 00000000
 00000020: 01e01180 00002581 00000000 00000000
 00000030: 00400c0b 00000000 00000000 00000000
 00000040: 00000000 00000000 00000000 00000000
 00000050: 00000000 00000000 00000000 00000000
 00000060: 00000000 00000000 00027000 00000000
 00000070: 412a0000 00040000
Model: Freescale Layerscape 2080a RDB Board
Board: LS2088AE Rev1.1-RDB, Board Arch: V1,

Board version: F, boot from vBank: 4
FPGA: v1.22
```

Có thể chuyển bank trong NOR flash trong U-Boot bằng các câu lệnh sau.

- Boot từ bank mặc định (theo thiết lập switch):

  ```
  =>qixis_reset
  ```

- Chuyển sang bank thay thế:

  ```
  =>qixis_reset altbank
  ```

**Ghi chú:**

Không thể chuyển tùy chọn boot giữa parallel NOR boot và QSPI NOR boot bằng lệnh. Có thể chuyển tùy chọn boot bằng cách chỉnh thiết lập DIP switch và jumper trên Reference Design Board như ở trên.

##### 4.7.9.2.6 Các biến môi trường U-Boot

- Các biến môi trường riêng cho DPAA2
  - **mcmemsize:** Định nghĩa lượng DDR hệ thống được Management Complex dùng. Nếu biến này không được định nghĩa, giá trị lúc compile CONFIG_SYS_LS_MC_DRAM_BLOCK_MIN_SIZE sẽ là mặc định. Thông thường, người dùng không cần đặt biến này vì giá trị mặc định đã chấp nhận được.
- Các biến môi trường không riêng cho DPAA2
  - **bootcmd**: Chứa các lệnh được tự động thực thi khi lệnh boot của U-Boot được chạy. Việc này diễn ra tự động khi người dùng không ngắt quá trình đếm ngược ban đầu của U-Boot. Khi dùng bình thường, bootcmd nên chứa lệnh áp dụng file Data Path Layout (DPL) của Management Complex, vì việc này phải làm trước khi boot Linux. Khi boot từ NOR, Khi boot từ NOR, bootcmd mặc định là `bootcmd=env exists mcinitcmd && env exists secureboot` `&& esbc_validate 0x580780000; env exists mcinitcmd && fsl_mc lazyapply dpl` `0x580d00000;run distro_bootcmd;run nor_bootcmd; env exists secureboot &&` `esbc_halt;`

Để biết thêm về lệnh distro boot của U-Boot, xem Section 5.3.2.

#### 4.7.9.3 Thông tin khôi phục LS2088ARDB

Nếu board LS2088ARDB không boot được từ NOR bank 0, bạn có thể khôi phục NOR bank 0 từ NOR bank 4 theo các bước sau:

1. Tải image firmware tổng hợp đã build sẵn:

   ```
   $ cp <build>/tmp/deploy/image/ls1043ardb/firmware_ls2088ardb_norboot.img ~/
   tftp
   ```

2. Boot LS2088ARDB từ NOR bank 4 với thiết lập switch sau:
   - SW5\[1:8\] = 1111 1111
   - SW3\[1:8\] = 0001 0010
   - SW4\[1:8\] = 1111 1111
   - SW6\[1:8\] = 1111 1111
   - SW7\[1:8\] = 0100 0010
   - SW9\[1:8\] = 0110 0000
   - SW8\[1:8\] = 0111 1111
3. Ghi NOR bank 0 từ NOR bank 4:

   ```
   => tftp $load_addr firmware_ls2088ardb_norboot.img
   => protect off 584000000 +$filesize && erase 584000000 +$filesize && cp.b
    $load_addr 584000000 $filesize
   ```

4. Reset và boot board từ NOR bank 0:

   ```
   => qixis_reset
   ```

**Ghi chú:** Nếu LS2088ARDB không boot được từ cả hai NOR bank, bạn cần khôi phục board bằng **CodeWarrior for LS Series, Arm v8 ISA**. Về các bước khôi phục board bằng công cụ CodeWarrior, xem mục "8.6 Board Recovery" trong ARM V8 ISA, Targeting Manual.

#### 4.7.9.4 Ghi image firmware tổng hợp Layerscape LDP

Phần này giải thích các bước ghi image firmware NOR vào IFC NOR flash trên LS2088ARDB và ghi image firmware QSPI vào QSPI NOR flash trên LS2088ARDB.

Để ghi image firmware NOR tổng hợp Layerscape LDP vào IFC NOR flash trên LS2088ARDB:

1. Sao chép firmware trên máy host sang tftp server.

   ```
   $ cp <build>/tmp/deploy/image/ls2088ardb/firmware_ls2088ardb_norboot.img ~/
   tftp/
   ```

2. Bảo đảm thiết lập DIP switch và jumper trên board là cho IFC NOR flash. (Xem “ Section 4.7.9.2” để biết thiết lập switch và jumper.)
3. Reboot board từ NOR flash bank 0 và dừng autoboot để vào U-Boot prompt.
4. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_ls2088ardb_norboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     ```
     => load mmc <device:par> $load_addr firmware_ls2088ardb_norboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls2088ardb_norboot.img
     ```

     or

     ```
     => load usb <device:part> $load_addr firmware_ls2088ardb_norboot.img
     ```

     or

     ```
     => load scsi <device:part> $load_addr firmware_ls2088ardb_norboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls2088ardb_norboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_ls2088ardb_norboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_ls2088ardb_norboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

5. Ghi firmware tổng hợp vào IFC NOR flash.
   - Để ghi bank thay thế:

     ```
     => protect off 584000000 +$filesize && erase 584000000 +$filesize && cp.b
      a0000000 584000000 $filesize
     ```

   - Để ghi bank hiện tại:

     ```
     => protect off 580000000 +$filesize && erase 580000000 +$filesize && cp.b
      a0000000 580000000 $filesize
     ```

6. Reset và boot board từ IFC NOR flash. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.
   - Để boot từ NOR flash bank 0.

     ```
     => qixis_reset
     ```

   - Để boot từ NOR flash bank 4.

     ```
     => qixis_reset altbank
     ```

Để ghi image firmware tổng hợp Layerscape LDP vào QSPI NOR flash trên LS2088ARDB:

1. Sao chép firmware trên máy host sang tftp server.

   ```
   $ cp <build>/tmp/deploy/image/ls2088ardb/firmware_ls2088ardb-
   rev2_qspiboot.img ~/tftp/
   ```

2. Bảo đảm thiết lập DIP switch và jumper trên board là cho QSPI NOR flash. (Xem “ Section 4.7.9.2” để biết thiết lập switch và jumper.)
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_ls2088ardb_qspiboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     ```
     => load mmc <device:part> $load_addr firmware_ls2088ardb_qspiboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls2088ardb_qspiboot.img
     ```

     or

     ```
     => load usb <device:part> $load_addr firmware_ls2088ardb_qspiboot.img
     ```

     or

     ```
     => load scsi <device:part> $load_addr firmware_ls2088ardb_qspiboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_ls2088ardb_qspiboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_ls2088ardb_qspiboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_ls2088ardb_qspiboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Ghi firmware vào QSPI NOR flash.

   ```
   => sf probe 0:0
   => sf erase 0 +$filesize && sf write $load_addr 0 $filesize
   ```

5. Reset board. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.

   ```
   => reset
   ```

#### 4.7.9.5 Bật các network interface DPAA2

Mục này mô tả quy trình bật các network interface DPAA2.

##### 4.7.9.5.1 Dùng lệnh Linux để liệt kê các network interface

Linux distribution boot với một file DPL mặc định, file này chỉ bật một network interface trên DPAA2 theo mặc định, dưới dạng một Ethernet interface chuẩn của kernel. Chạy lệnh Linux chuẩn sau để lấy danh sách các interface đã bật.

```
$ ip link show
```

Interface mặc định có tên eth0 (hoặc eth1 nếu một network interface card PCI Express được phát hiện trước).

##### 4.7.9.5.2 Dùng các wrapper script của restool để liệt kê các đối tượng DPAA2

Các wrapper script dễ dùng được cung cấp trong rootfs của bản phát hành để hỗ trợ tạo động các DPNI và các phụ thuộc liên quan. Các wrapper script gọi các lệnh restool.

Nhập lệnh sau để xem danh sách các wrapper script có sẵn:

```
$ls-main
```

Các Ethernet interface có các đối tượng DPAA2 tương ứng gắn với chúng. Chạy wrapper script restool sau để liệt kê data path network interface (DPNI) đã bật gắn với eth0 (hoặc eth1).

```
$ ls-listni
dprc.1/dpni.0 (interface: eth1, end point: dpmac.5)
```

Kết quả này cho thấy có data path network interface tên dpni.0 thuộc resource container DPAA2 dprc.1. Đối tượng DPNI này ứng với interface tên eth1, được nối với dpmac.5.

Có thể dùng lệnh sau để liệt kê mọi đối tượng DPMAC có trong hệ thống và chúng được nối với cái gì (nếu có).

```
$ ls-listmac
    dprc.1/dpmac.8
    dprc.1/dpmac.7
    dprc.1/dpmac.6
    dprc.1/dpmac.5 (end point: dpni.0)
    dprc.1/dpmac.4
    dprc.1/dpmac.3
    dprc.1/dpmac.2
    dprc.1/dpmac.1
```

Để biết thêm về các đối tượng DPAA2 và restool, xem Section 8.3.

##### 4.7.9.5.3 Thêm và hủy network interface

Như đã nói ở các mục trước, interface eth0 (hoặc eth1) ứng với data path network interface dpni.0, interface duy nhất được bật trong file DPL mặc định. Tuy nhiên, người dùng có thể cần bật nhiều hơn một network interface. Đồng thời, DPNI.0 được cấu hình với một tập tài nguyên tối thiểu – ví dụ, nó chỉ có thể nhận traffic trên một core qua một queue. Có thể tạo thêm các đối tượng DPNI đầy đủ tính năng bằng restool. Sau khi tạo các đối tượng này, cấu hình có thể được lưu vào một file DPL tùy biến.

Chạy lệnh dưới đây là cách đơn giản nhất để thêm một đối tượng DPNI và nối nó với một DPMAC. Trong ví dụ này, đối tượng DPNI được nối với dpmac.4, dùng các tùy chọn và đối số mặc định.

```
$ ls-addni dpmac.4
Created interface: eth0 (object:dpni.1, endpoint: dpmac.4)
```

Chạy lệnh sau để hiển thị thông tin về interface dpni.1 vừa tạo. Số queue được hiển thị là 8, mỗi core một queue cho 8 core có thể nhận traffic.

```
restool dpni info dpni.1
```

Nếu bạn muốn nối DPMAC5 (mặc định nối với dpni.0) với một data path network interface đầy đủ tính năng, thì trước hết bạn phải unbind và hủy interface hiện có bằng các lệnh dưới đây.

Unbind dpni.0 khỏi driver

```
$ echo dpni.0 > /sys/bus/fsl-mc/drivers/fsl_dpaa2_eth/unbind
```

Hủy data path network interface dpni.0

```
$ restool dpni destroy dpni.0
dpni.0 is destroyed
```

Giờ thêm lại dpmac.5 bằng lệnh dưới đây. Mặc dù dpmac.5 lại được nối với dpni.0, giờ dpni.0 dùng 8 queue để phân phối traffic.

```
$ ls-addni dpmac.5
Created interface: eth0 (object:dpni.0, endpoint: dpmac.5)
```

##### 4.7.9.5.4 Lưu cấu hình vào một file DPL tùy biến (Tùy chọn)

Sau khi tạo thêm các đối tượng DPNI, có thể tạo một file DPL tùy biến bằng lệnh sau. File DPL này có định dạng \*.dts và được tạo trên board tham chiếu.

```
$ restool dprc generate-dpl dprc.1 > <file_name>.dts
```

File \*.dts thu được phải được compile bằng công cụ dtc để tạo file \*.dtb. Sao chép file này sang một máy Linux host hoặc server bằng SCP và chạy lệnh sau để chuyển nó thành file \*.dtb.

```
$ dtc -I dts -O dtb <file_name>.dts -o <file_name>.dtb
```

File DPL vừa tạo có thể được ghi lên board và dùng để boot vào Linux.

##### 4.7.9.5.5 Gán địa chỉ IP cho network interface

Có thể gán địa chỉ IP tĩnh cho network interface bằng các lệnh chuẩn ifconfig hoặc ip.

```
ifconfig <interface_name_in_Linux> <ip_address>
OR
ip address add <ip_address> dev <interface_name_in_linux>
```

Ngoài ra, cũng có thể gán địa chỉ IP tĩnh bằng netplan. Tạo một file tên “`config.yaml`” trong `/` `etc/netplan`. Dùng một trình soạn thảo văn bản, thêm các dòng sau vào file cấu hình này và lưu lại.

```
network:
  version: 2
  renderer: networkd
  ethernets:
    <interface_name_in_Linux>:
      addresses:
        - <ip_address>/24
```

Sau khi lưu file này, chạy lệnh sau để áp dụng cấu hình netplan này rồi reboot board.

```
sudo netplan apply
```

Khi board reboot xong, bật interface mong muốn bằng lệnh “`ifconfig <interface_name_in_Linux>` up” hoặc “ `ip link set <interface_name_in_Linux> up`”. Interface được gán địa chỉ IP đã nhập trong file “ `config.yaml`”.

Netplan cũng có thể dùng để gán địa chỉ IP động bằng DHCP. Để gán IP động, thay nội dung file config.yaml bằng nội dung sau.

```
network:
  version: 2
  renderer: networkd
  ethernets:
    <interface_name_in_Linux>:
      dhcp4: true
```

Làm theo cùng quy trình như gán IP tĩnh bằng Netplan sau khi lưu file “`config.yaml`”.

### 4.7.10 Quick start guide cho LX2160ARDB Rev2

Mục này giải thích:

- Giới thiệu
- Thông tin tham chiếu LX2160ARDB
- Thông tin khôi phục LX2160ARDB
- Ghi image firmware tổng hợp Layerscape LDP
- Bật các network interface DPAA2

#### 4.7.10.1 Giới thiệu

Các mục sau mô tả quy trình ghi firmware tổng hợp Layerscape LDP cho LX2160ARDB Rev2. Đồng thời, mục này giải thích quy trình cho use case phổ biến nhất: tải và triển khai các image mặc định của Layerscape LDP lên LX2160ARDB Rev2 bằng flex-installer. Để biết thêm thông tin, xem Section 4.2.

Để biết thêm thông tin về các thành phần khác nhau của board, cũng như cách cấu hình và boot board, xem LX2160A Reference Design Board Getting Started Guide.

#### 4.7.10.2 Thông tin tham chiếu LX2160ARDB

Mục này cung cấp thông tin chung về LX2160ARDB Rev2, có thể hữu ích để tham chiếu khi thực hiện các bước triển khai Layerscape LDP ở phần sau.

##### 4.7.10.2.1 Bảng ánh xạ cổng Ethernet

| Tên port trên vỏ | Tên port trong U-Boot | Tên port trong TinyDistro | Tên port trong Linux |
|---|---|---|---|
| 40G MAC2 | DPMAC2@xlaui4 | Tên interface sẽ là eth`n`. | PCIe : enp1s0 |
| 10G MAC3 | DPMAC3@xgmii | Ví dụ, eth0, eth1, v.v. | DPAA: ethx |
| 10G MAC4 | DPMAC4@xgmii | Eth0 : Nếu PCIe được kết nối, nếu không thì sẽ là bất kỳ interface |   |
| 25G MAC5 | DPMAC5@25g-aui | DPAA2 nào đang được kết nối. |   |
| 25G MAC6 | DPMAC6@25g-aui |   |   |
| 1G MAC17 | DPMAC17@rgmii-id |   |   |
| 1G MAC18 | DPMAC18@rgmii-id |   |   |

**Ghi chú:** Tên interface không cố định trên LX2160ARDB Rev2; tên được gán tùy theo interface nào đang hoạt động. Có thể kiểm tra tên interface bằng lệnh `ls-listni`.

```
root@TinyDistro:~# ls-listni
dprc.1/dpni.1 (interface: eth0, end point: dpmac.2)
dprc.1/dpni.0 (interface: eth1, end point: dpmac.17)
```

##### 4.7.10.2.2 Memory map của hệ thống

| Địa chỉ bắt đầu | Địa chỉ kết thúc | Kích thước | Cấp phát | Ghi chú |
|---|---|---|---|---|
| 0x0000_0000_0000 | 0x0000_000F_FFFF | 1 MB | CCSR - Boot ROM | 64 KB |
| 0x0000_0010_0000 | 0x0000_00FF_FFFF | 15 MB | Reserved |   |
| 0x0000_0100_0000 | 0x0000_0FFF_FFFF | 240 MB | CCSR |   |
| 0x0000_1000_0000 | 0x0000_10FF_FFFF | 16 MB | Reserved | SP alias không gian này sang DCSR. Không cấp phát. |
| 0x0000_1100_0000 | 0x0000_11FF_FFFF | 16 MB | Reserved | SP alias không gian này sang DCSR. Không cấp phát. |
| 0x0000_1200_0000 | 0x0000_13FF_FFFF | 32 MB | Reserved | SP alias không gian này sang DCSR. Không cấp phát. |
| 0x0000_1400_0000 | 0x0000_17FF_FFFF | 64 MB | Reserved |   |
| 0x0000_1800_0000 | 0x0000_181F_FFFF | 2 MB | OCRAM | 256 KB |
| 0x0000_1820_0000 | 0x0000_18FF_FFFF | 14 MB | Reserved |   |
| 0x0000_1900_0000 | 0x0000_19FF_FFFF | 16 MB | CoreSight STM |   |
| 0x0000_1A00_0000 | 0x0000_1BFF_FFFF | 32 MB | Reserved |   |
| 0x0000_1C00_0000 | 0x0000_1CFF_FFFF | 16 MB | Reserved |   |
| 0x0000_1D00_0000 | 0x0000_1FFF_FFFF | 48 MB | Reserved |   |
| 0x0000_2000_0000 | 0x0000_2FFF_FFFF | 256 MB | FlexSPI Region #1 |   |
| 0x0000_3000_0000 | 0x0000_3FFF_FFFF | 256 MB | Reserved |   |
| 0x0000_4000_0000 | 0x0000_5FFF_FFFF | 512 MB | Reserved |   |
| 0x0000_6000_0000 | 0x0000_7FFF_FFFF | 512 MB | Reserved |   |
| 0x0000_8000_0000 | 0x0000_9FFF_FFFF | 512 MB | GPP DRAM Region #1 |   |
| 0x0000_A000_0000 | 0x0000_BFFF_FFFF | 512 MB | (0-2 GB) |   |
| 0x0000_C000_0000 | 0x0000_DFFF_FFFF | 512 MB |   |   |
| 0x0000_E000_0000 | 0x0000_FFFF_FFFF | 512 MB |   |   |
| 0x0001_0000_0000 | 0x0001_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0002_0000_0000 | 0x0003_FFFF_FFFF | 8 GB |   |   |
| 0x0004_0000_0000 | 0x0004_0FFF_FFFF | 256 MB | FlexSPI Hole | Bị logic ánh xạ lại thu gọn để ghép với FlexSPI Region #1 |
| 0x0004_1000_0000 | 0x0004_FFFF_FFFF | 3.75 GB | FlexSPI Region #2 (256 MB-4 GB) | 3.75 GB |
| 0x0005_0000_0000 | 0x0005_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0006_0000_0000 | 0x0006_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0007_0000_0000 | 0x0007_3FFF_FFFF | 1 GB | DCSR |   |
| 0x0007_4000_0000 | 0x0007_FFFF_FFFF | 3 GB | Reserved |   |
| DPAA2 Portal Map |   |   |   |   |
| 0x0008_0000_0000 | 0x0008_03FF_FFFF | 64 MB | Reserved | 512 MB (0x0008_0000_0000- |
| 0x0008_0400_0000 | 0x0008_07FF_FFFF | 64 MB | Reserved | 0x0008\_<br>1FFF_FFFF) |
| 0x0008_0800_0000 | 0x0008_0BFF_FFFF | 64 MB | Reserved |   |
| 0x0008_0C00_0000 | 0x0008_0FFF_FFFF | 64 MB | MC - 1024 portals |   |
| 0x0008_1000_0000 | 0x0008_17FF_FFFF | 128 MB | Reserved |   |
| 0x0008_1800_0000 | 0x0008_1FFF_FFFF | 128 MB | QBMAN portals |   |
| 0x0008_2000_0000 | 0x000B_FFFF_FFFF | 15.5 GB | Reserved |   |
| 0x000C_0000_0000 | 0x000F_FFFF_FFFF | 16 GB | Reserved |   |
| DPAA2 External address map |   |   |   |   |
| 0x0010_0000_0000 | 0x0010_FFFF_FFFF | 4 GB | Reserved | (0x0010_0000_0000-0x001F\_ |
| 0x0011_0000_0000 | 0x0011_FFFF_FFFF | 4 GB | Reserved | FFFF_FFFF) |
| 0x0012_0000_0000 | 0x0012_FFFF_FFFF | 4 GB | Reserved |   |
| 0x0013_0000_0000 | 0x0013_FFFF_FFFF | 4 GB | WRIOP access window |   |
| 0x0014_0000_0000 | 0x001B_FFFF_FFFF | 32 GB | Reserved |   |
| 0x001C_0000_0000 | 0x001C_001F_FFFF | 2 MB | Packet express buffer |   |
| 0x001C_4000_0000 | 0x001F_FFFF_FFFF | 79 GB | Reserved |   |
| 0x0020_0000_0000 | 0x0020_7FFF_FFFF | 2 GB | DRAM Hole |   |
| 0x0020_8000_0000 | 0x003F_FFFF_FFFF | 126 GB | GPP DRAM Region #2 |   |
| 0x0040_0000_0000 | 0x005F_FFFF_FFFF | 128 GB | Reserved DRAM Hole Other "Normal" Memory | Bị logic ánh xạ lại sau MemNoC thu gọn để ghép DRAM Region #1 và #2 |
| 0x0060_0000_0000 | 0x007F_FFFF_FFFF | 128 GB | GPP DRAM Region #3 |   |
| I/O tốc độ cao (PCI Express) |   |   |   |   |
| 0x0080_0000_0000 | 0x0087_FFFF_FFFF | 32 GB | PCI Express 1 | (0x0080_0000_0000-0x00FF\_ |
| 0x0088_0000_0000 | 0x008F_FFFF_FFFF | 32 GB | PCI Express 2 | FFFF_FFFF) |
| 0x0090_0000_0000 | 0x0097_FFFF_FFFF | 32 GB | PCI Express 3 |   |
| 0x0098_0000_0000 | 0x009F_FFFF_FFFF | 32 GB | PCI Express 4 |   |
| 0x00A0_0000_0000 | 0x00A7_FFFF_FFFF | 32 GB | PCI Express 5 |   |
| 0x00A8_0000_0000 | 0x00AF_FFFF_FFFF | 32 GB | PCI Express 6 |   |

##### 4.7.10.2.3 Các tùy chọn boot được hỗ trợ

LX2160ARDB Rev2 hỗ trợ các tùy chọn boot sau:

- FlexSPI NOR flash (ở các mục sau gọi là "FSPI" hoặc "FSPI flash"). CS là Chip Select.
- eMMC
- Thẻ SD (SDHC1)

##### 4.7.10.2.4 Các tùy chọn switch trên board

Các RDB có các switch người dùng chọn được để đánh giá các tùy chọn boot khác nhau cho thiết bị LX2160A, như trong bảng dưới đây ('0' là OFF, '1' là ON).

| Nguồn boot | SW1\[1:8\] | SW2\[1:8\] | SW3\[1:8\] | SW4\[1:8\] |
|---|---|---|---|---|
| FSPI NOR CS0 (mặc định) | 1111 1000 | 0000 0110 | 1111 1100 | 1011 1000 |
| FSPI NOR CS1 | 1111 1001 | 0000 0110 | 1111 1100 | 1011 1000 |
| Thẻ SD (SDHC1) | 1000 1000 | 0000 0110 | 1111 1100 | 1011 1000 |
| eMMC | 1001 1000 | 0000 0110 | 1111 1100 | 1011 1000 |

**Ghi chú:** Nên bật switch SW4\[2\] \[1\] nếu người dùng muốn board bật nguồn ngay khi nguồn điện được bật. Điều này hữu ích khi board được dùng từ xa.

Việc đổi cấu hình thiết bị boot khỏi thiết lập mặc định có thể cần thêm thay đổi trong RCW hoặc trong các code image khác. Về quy ước đặt tên RCW cho LX2160ARDB Rev2, xem https:// github.com/nxp-qoriq/rcw/blob/master/lx2160ardb/README.

Ngoài thiết lập switch ở trên, hãy bảo đảm các thiết lập jumper sau là đúng.

**Table 17. Các jumper của LX2160ARDB Rev2**

| Jumper | Loại | Tên/chức năng | Mô tả |
|---|---|---|---|
| J6 | Connector 1x2 chân | Bật TA_BB_TMP_DETECT_B | Open: chân TA_BB_TMP_DETECT_B nối đất<br>Shorted: chân TA_BB_TMP_DETECT_B được cấp nguồn (thiết lập mặc định) |
| J7 | Connector 1x2 chân | Bật nguồn VBAT cho TA_BB_VDD | Không hỗ trợ. Không lắp J7. Xem LX2160A Reference Design Board Errata để biết thêm chi tiết. |
| J8 | Connector 1x2 chân | Điều khiển điện áp PROG_MTR (chỉ dành cho NXP) | Open: chân PROG_MTR bị tắt nguồn (thiết lập mặc định)<br>Shorted: chân PROG_MTR được cấp nguồn từ OVDD (1.8 V) |
| J9 | Connector 1x2 chân | Điều khiển điện áp TA_PROG_SFP (chỉ dành cho NXP) | Open: chân TA_PROG_SFP bị tắt nguồn (thiết lập mặc định)<br>Shorted: chân TA_PROG_SFP được cấp nguồn từ OVDD (1.8 V) |
| J31 | Connector 1x2 chân | Thiết lập chế độ USB1 | Open: USB1 hoạt động ở chế độ Device<br>Shorted: USB1 hoạt động ở chế độ Host (thiết lập mặc định) |
| J33 | Connector 1x2 chân | Thiết lập chế độ USB2 | Open: USB2 hoạt động ở chế độ On-The-Go (OTG) (thiết lập mặc định)<br>Shorted: USB2 hoạt động ở chế độ Host |
| J56 | Connector 2x3 chân | Truy cập GUI của Inphi CS4223 | Bình thường: 1-2 short, 5-6 short (thiết lập mặc định)<br>Chế độ GUI: 1-2 open, 5-6 open |
| J57 | Connector 1x2 chân | Bật GUI của Inphi CS4223 | Bình thường: Open (thiết lập mặc định)<br>Chế độ GUI: Short |
| J58 | Connector 1x2 chân | Tốc độ quạt | Open: 100% tốc độ<br>Short: 50% tốc độ (thiết lập mặc định) |

##### 4.7.10.2.5 Chip-select của FlexSPI NOR Flash

FlexSPI NOR flash là đích đơn giản và tiện lợi để triển khai image nên được dùng thường xuyên.

Lợi ích của tính năng này là cho phép triển khai độc lập nhiều bộ image lên cùng một NOR flash. Điều này hữu ích trong quá trình phát triển, vì bạn có thể dùng image U-Boot ở một chip-select để ghi một bộ image vào chip-select khác. Nếu các image mới có lỗi, các image cũ vẫn hoạt động để bạn triển khai image đã sửa.

Logic trên board thường cho phép truy cập NOR flash từ các tùy chọn CS (chip select) khác nhau. Mỗi CS được nối với các thiết bị NOR flash riêng; các CS đó gọi là DEV#0 và DEV#1. U-Boot in ra CS nào được nạp.

Sau đây là output mẫu:

```
U-Boot 2022.04+fsl+g181859317b (Nov 15 2022 - 06:28:05 +0000)
SoC: LX2160ACE Rev2.0 (0x87360020)
Clock Configuration:
      CPU0(A72):2200 MHz  CPU1(A72):2200 MHz  CPU2(A72):2200 MHz
      CPU3(A72):2200 MHz  CPU4(A72):2200 MHz  CPU5(A72):2200 MHz
      CPU6(A72):2200 MHz  CPU7(A72):2200 MHz  CPU8(A72):2200 MHz
      CPU9(A72):2200 MHz  CPU10(A72):2200 MHz  CPU11(A72):2200 MHz
      CPU12(A72):2200 MHz  CPU13(A72):2200 MHz  CPU14(A72):2200 MHz
      CPU15(A72):2200 MHz
      Bus:  750 MHz     DDR: 3200 MT/s
Reset Configuration Word (RCW):
      00000000: 5883833c 24580058 00000000 0000000
      00000010: 00000000 0c010000 00000000 00000000
      00000020: 390001a0 00002580 00000000 00000096
      00000030: 00000000 00000000 00000000 00000000
      00000040: 00000000 00000000 00000000 00000000
      00000050: 00000000 00000000 00000000 00000000
      00000060: 00000000 00000000 00027000 00000000
      00000070: 08b30010 00150020
Model: NXP Layerscape LX2160ARDB Board
Board: LX2160ACE Rev2.0-RDB, Board version: C, boot from SD
FPGA: v9.0
```

Có thể chuyển đổi tùy chọn boot trong U-Boot bằng các câu lệnh sau.

- Chuyển sang FlexSPI NOR flash 0 (mặc định):

  ```
  =>qixis_reset
  ```

- Chuyển sang FlexSPI NOR flash 1:

  ```
  =>qixis_reset altbank
  ```

- Chuyển sang SD:

  ```
  =>qixis_reset sd
  ```

- Chuyển sang eMMC:

  ```
  =>qixis_reset emmc
  ```

##### 4.7.10.2.6 Các biến môi trường U-Boot

Các biến môi trường riêng và không riêng cho DPAA2 được nêu dưới đây:

- Các biến môi trường riêng cho DPAA2
  - **mcboottimeout**: Định nghĩa thời gian timeout khi boot Management Complex, tính bằng mili giây. Nếu biến này không được định nghĩa, giá trị lúc compile `CONFIG_SYS_LS_MC_BOOT_TIMEOUT_MS` là mặc định. Thông thường, người dùng không cần đặt biến này vì giá trị mặc định đã chấp nhận được.
  - **mcmemsize**: Định nghĩa lượng DDR hệ thống được Management Complex dùng. Nếu biến này không được định nghĩa, giá trị lúc compile `CONFIG_SYS_LS_MC_DRAM_BLOCK_MIN_SIZE` là mặc định. Thông thường, người dùng không cần đặt biến này vì giá trị mặc định đã chấp nhận được.
  - **mcinitcmd**: Chứa các lệnh để tự động nạp và khởi động Management Complex trước khi U-Boot bắt đầu đếm ngược để boot. Nếu biến này được định nghĩa, nội dung của nó được `run`. Giá trị mặc định giả định rằng firmware Management Complex (MC) và file Data Path Control được lưu trong FlexSPI flash/SD ở các địa chỉ cố định. Giá trị mặc định khi boot từ FlexSPI là `mcinitcmd= sf probe 0:0 && sf` `read 0x80640000 0x640000 0x80000 && env exists secureboot && esbc_validate` `0x80640000 && esbc_validate 0x80680000; sf read 0x80a00000 0xa00000 0x300000 &&` `sf read 0x80e00000 0xe00000 0x100000; fsl_mc start mc 0x80a00000 0x80e00000`. Giá trị mặc định khi boot từ SD là `mcinitcmd=mmc read 0x80a00000 0x5000 0x1200;mmc` `read 0x80e00000 0x7000 0x800;env exists secureboot && mmc read 0x80640000` `0x3200 0x20 && mmc read 0x80680000 0x3400 0x20 && esbc_validate 0x80640000 &&` `esbc_validate 0x80680000 ;fsl_mc start mc 0x80a00000 0x80e00000`. Người dùng có thể đổi biến này khi cần để nạp các file MC từ nguồn khác ngoài FlexSPI vào DDR, rồi khởi động MC bằng lệnh fsl_mc. Ví dụ, các file có thể nằm trên một ổ đĩa.
- Các biến môi trường không riêng cho DPAA2
  - bootcmd: Chứa các lệnh được tự động thực thi khi lệnh boot của U-Boot được chạy. Việc này diễn ra tự động khi người dùng không ngắt quá trình đếm ngược ban đầu của U-Boot. Khi dùng bình thường, bootcmd nên chứa lệnh áp dụng file Data Path Layout (DPL) của Management Complex, vì việc này phải làm trước khi boot Linux. Khi boot từ FlexSPI NOR, bootcmd mặc định là `sf probe 0:0; sf read 0x806c0000 0x6c0000 0x40000; env exists mcinitcmd` `&& env exists secureboot && esbc_validate 0x806c0000; sf read 0x80d00000` `0xd00000 0x100000; env exists mcinitcmd && fsl_mc lazyapply dpl 0x80d00000; run` `distro_bootcmd; run xspi_bootcmd; env exists secureboot && esbc_halt;` Khi boot từ SD, bootcmd mặc định là `bootcmd=env exists mcinitcmd && mmcinfo; mmc` `read 0x80d00000 0x6800 0x800; env exists mcinitcmd && env exists secureboot` `&& mmc read 0x806C0000 0x3600 0x20 && esbc_validate 0x806C0000; env exists` `mcinitcmd && fsl_mc lazyapply dpl 0x80d00000; run distro_bootcmd; run` `sd_bootcmd; env exists secureboot && esbc_halt;`

Để biết thêm về lệnh distro boot của U-Boot, xem Section 5.3.2.

#### 4.7.10.3 Thông tin khôi phục LX2160ARDB

Nếu board LX2160ARDB Rev2 không boot được từ FSPI NOR bank #0, bạn có thể khôi phục FSPI NOR bank #0 từ FSPI NOR bank #1 theo các bước sau:

1. Tải image firmware tổng hợp đã build sẵn:

   ```
   cp <build>/tmp/deploy/image/ls1043ardb/firmware_lx2160ardb_rev2_xspiboot.img
    ~/tftp
   ```

2. Boot LX2160ARDB Rev2 từ FSPI NOR bank #1 với thiết lập switch sau:
   - SW1\[1:8\] = 1111 1001
3. Ghi FSPI NOR bank #0 từ FSPI NOR bank #1:

   ```
   => sf probe 0:1
   => tftp $load_addr firmware_lx2160ardb_rev2_xspiboot.img
   => sf erase 0x0 +$filesize && sf write $load_addr 0x0 $filesize
   ```

4. Đổi thiết lập switch về mặc định:
   - SW1\[1:8\] = 1111 1000
5. Reset board, board sẽ boot từ FSPI NOR bank #0:

   ```
   => reset
   ```

**Ghi chú:** Nếu LX2160ARDB Rev2 không boot được từ cả hai bank FlexSPI NOR flash, bạn cần khôi phục board bằng **CodeWarrior for LS Series, Arm v8 ISA**. Về các bước khôi phục board bằng công cụ CodeWarrior, xem mục "8.6 Board Recovery" trong ARM V8 ISA, Targeting Manual.

#### 4.7.10.4 Ghi image firmware tổng hợp Layerscape LDP

Phần này giải thích các bước ghi image firmware FlexSPI NOR vào FlexSPI NOR flash trên LX2160ARDB Rev2 và ghi image firmware SD/eMMC vào thẻ SD/eMMC trên LX2160ARDB Rev2.

Để ghi image firmware tổng hợp Layerscape LDP vào FlexSPI NOR flash trên LX2160ARDB Rev2:

1. Sao chép firmware trên máy host sang tftp server.

   ```
   $ cp <build>/tmp/deploy/image/lx2160ardb/firmware_lx2160ardb-
   rev2_xspiboot.img ~/tftp/
   ```

2. Reboot board từ FlexSPI NOR flash 0 và dừng autoboot để vào U-Boot prompt.
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau: Nạp firmware từ TFTP server

   ```
   For LX2160A Rev2:
   => tftp $load_addr firmware_lx2160ardb_rev2_xspiboot.img
   ```

   Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

   ```
   For LX2160A Rev2:
   => load mmc <device:partition> $load_addr
    firmware_lx2160ardb_rev2_xspiboot.img
   ```

   Ví dụ:

   ```
   For LX2160A Rev2:
   => load mmc 0:2 $load_addr firmware_lx2160ardb_rev2_xspiboot.img
   ```

   or

   ```
   For LX2160A Rev2:
   => load usb <device:part> $load_addr firmware_lx2160ardb_rev2_xspiboot.img
   ```

   or

   ```
   For LX2160A Rev2:
   => load scsi <device:part> $load_addr firmware_lx2160ardb_rev2_xspiboot.img
   ```

   **Ghi chú:**

   Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

   ```
   => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
   ```

   Ví dụ:

   ```
   For LX2160A Rev2:
   => load mmc 0:2 $load_addr firmware_lx2160ardb_rev2_xspiboot.img
   ```

   Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

   ```
   => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
   ```

   Ví dụ:

   ```
   For LX2160A Rev2:
   => fatload mmc 0:2 $load_addr firmware_lx2160ardb_rev2_xspiboot.img
   ```

   Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

   ```
   => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
   ```

   Ví dụ:

   ```
   For LX2160A Rev2:
   => ext2load mmc 0:2 $load_addr firmware_lx2160ardb_rev2_xspiboot.img
   ```

   Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Ghi firmware vào FlexSPI NOR flash 1.

   ```
   => sf probe 0:1 => sf erase 0 +$filesize && sf write $load_addr 0 $filesize
   ```

5. Reset và boot board từ FlexSPI NOR flash 1. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.

   ```
   => qixis_reset altbank
   ```

Để ghi image firmware tổng hợp Layerscape LDP vào SD/eMMC trên LX2160ARDB Rev2:

1. Sao chép firmware trên máy host sang tftp server.

   Với boot từ SD:

   ```
   For LX2160A Rev2:
   $ cp <build>/tmp/deploy/image/lx2160ardb/firmware_lx2160ardb-rev2_sdboot.img
    ~/tftp/
   ```

   Với boot từ eMMC:

   ```
   $ cp <build>/tmp/deploy/image/lx2160ardb/firmware_lx2160ardb-
   rev2_emmcboot.img ~/tftp/
   ```

2. Reboot board từ FlexSPI NOR flash 0 và dừng autoboot để vào U-Boot prompt.
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     Với boot từ SD:

     ```
     => tftp $load_addr firmware_lx2160ardb_rev2_sdboot.img
     ```

     Với boot từ eMMC:

     ```
     => tftp $load_addr firmware_lx2160ardb_rev2_emmcboot.img
     ```

   Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

   Với boot từ SD:

   ```
   => load mmc <dev:part> $load_addr firmware_lx2160ardb_rev2_sdboot.img
   ```

   Ví dụ:

   ```
   => load mmc 0:2 $load_addr firmware_lx2160ardb_rev2_sdboot.img
   ```

   or

   ```
   => load usb <dev:part> $load_addr firmware_lx2160ardb_rev2_sdboot.img
   ```

   or

   ```
   => load scsi <dev:part> $load_addr firmware_lx2160ardb_rev2_sdboot.img
   ```

   Với boot từ eMMC:

   ```
   => load mmc <dev:part> $load_addr firmware_lx2160ardb_rev2_emmcboot.img
   ```

   Ví dụ:

   ```
   => load mmc 0:2 $load_addr firmware_lx2160ardb_rev2_emmcboot.img
   ```

   or

   ```
   => load usb <dev:part> $load_addr firmware_lx2160ardb_rev2_emmcboot.img
   ```

   or

   ```
   => load scsi <dev:part> $load_addr firmware_lx2160ardb_rev2_emmcboot.img
   ```

   **Ghi chú:**

   Dùng lệnh sau nếu thẻ SD/eMMC được format/tạo bằng lệnh flex-installer của Layerscape LDP:

   ```
   => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
   ```

   Ví dụ:

   ```
   => load mmc 0:2 $load_addr firmware_lx2160ardb_rev2_sdboot.img
   ```

   Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

   ```
   => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
   ```

   Ví dụ:

   ```
   => fatload mmc 0:2 $load_addr firmware_lx2160ardb_rev2_sdboot.img
   ```

   Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

   ```
   => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
   ```

   Ví dụ:

   ```
   => ext2load mmc 0:2 $load_addr firmware_lx2160ardb_rev2_sdboot.img
   ```

   Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Ghi firmware vào SD card.

   ```
   => mmc dev 0; mmc write $load_addr 8 1fff8
   ```

5. Ghi firmware vào eMMC card.

   ```
   => mmc dev 1; mmc write $load_addr 8 1fff8
   ```

6. Reset và boot board từ thẻ SD. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời. Với boot từ SD:

   ```
   => qixis_reset sd
   ```

   Với boot từ eMMC:

   ```
   => qixis_reset emmc
   ```

#### 4.7.10.5 Bật các network interface DPAA2

Mục này mô tả quy trình bật các network interface DPAA2.

##### 4.7.10.5.1 Dùng lệnh Linux để liệt kê các network interface

Linux distribution boot với một file DPL mặc định, file này chỉ bật một network interface trên DPAA2 theo mặc định, dưới dạng một Ethernet interface chuẩn của kernel. Chạy lệnh Linux chuẩn sau để lấy danh sách các interface đã bật.

```
$ ip link show
```

Interface mặc định có tên eth0 (hoặc eth1 nếu một network interface card PCI Express được phát hiện trước).

##### 4.7.10.5.2 Dùng các wrapper script của restool để liệt kê các đối tượng DPAA2

Các wrapper script dễ dùng được cung cấp trong rootfs của bản phát hành để hỗ trợ tạo động các DPNI và các phụ thuộc liên quan. Các wrapper script gọi các lệnh restool.

Nhập lệnh sau để xem danh sách các wrapper script có sẵn:

```
$ls-main
```

Các Ethernet interface có các đối tượng DPAA2 tương ứng gắn với chúng. Chạy wrapper script restool sau để liệt kê data path network interface (DPNI) đã bật gắn với ni0 (hoặc ni1).

```
$ ls-listni
dprc.1/dpni.1 (interface: eth0, end point: dpmac.2)
dprc.1/dpni.0 (interface: eth1, end point: dpmac.17)
```

Kết quả này cho thấy có data path network interface tên dpni.0 thuộc resource container DPAA2 dprc.1. Đối tượng DPNI này ứng với interface tên ni0, được nối với dpmac.17.

Có thể dùng lệnh sau để liệt kê mọi đối tượng DPMAC có trong hệ thống và chúng được nối với cái gì (nếu có).

```
$ ls-listmac
dprc.1/dpmac.18
dprc.1/dpmac.17 (end point: dpni.0)
dprc.1/dpmac.6
dprc.1/dpmac.5
dprc.1/dpmac.4
dprc.1/dpmac.3
dprc.1/dpmac.2 (end point: dpni.1)
```

Để biết thêm về các đối tượng DPAA2 và restool, xem Section 8.3.

##### 4.7.10.5.3 Thêm và hủy network interface

Như đã nói ở các mục trước, interface ni0 ứng với data path network interface dpni.0, interface duy nhất được bật trong file DPL mặc định. Tuy nhiên, người dùng có thể cần bật thêm network interface. Có thể tạo thêm các đối tượng DPNI đầy đủ tính năng bằng restool. Sau khi tạo các đối tượng này, cấu hình có thể được lưu vào một file DPL tùy biến.

Chạy lệnh dưới đây là cách đơn giản nhất để thêm một đối tượng DPNI và nối nó với một DPMAC. Trong ví dụ này, đối tượng DPNI được nối với dpmac.4, dùng các tùy chọn và đối số mặc định.

```
$ ls-addni dpmac.4
Created interface: ni2 (object:dpni.2, endpoint: dpmac.4)
```

Chạy lệnh sau để hiển thị thông tin về interface dpni.2 vừa tạo. Số queue được hiển thị là 16, mỗi core một queue cho 16 core có thể nhận traffic.

```
$ restool dpni info dpni.2
dpni version: 7.8
dpni id: 2
plugged state: plugged
endpoint state: 0
endpoint: dpmac.4, link is down
link status: 0 - down
mac address: ae:ff:05:f9:8e:02
dpni_attr.options value is: 0
num_queues: 16
num_rx_tcs: 1
num_tx_tcs: 1
mac_entries: 16
vlan_entries: 0
qos_entries: 0
fs_entries: 64
qos_key_size: 0
fs_key_size: 56
ingress_all_frames: 0
ingress_all_bytes: 0
ingress_multicast_frames: 0
ingress_multicast_bytes: 0
ingress_broadcast_frames: 0
ingress_broadcast_bytes: 0
egress_all_frames: 0
egress_all_bytes: 0
egress_multicast_frames: 0
egress_multicast_bytes: 0
egress_broadcast_frames: 0
egress_broadcast_bytes: 0
ingress_filtered_frames: 0
ingress_discarded_frames: 0
ingress_nobuffer_discards: 0
egress_discarded_frames: 0
egress_confirmed_frames: 0
```

Nếu bạn muốn nối DPMAC17 (mặc định nối với dpni.0) với một data path network interface đầy đủ tính năng, thì trước hết bạn phải unbind và hủy interface hiện có bằng các lệnh dưới đây.

Unbind dpni.0 khỏi driver

```
$ echo dpni.0 > /sys/bus/fsl-mc/drivers/fsl_dpaa2_eth/unbind
```

Hủy data path network interface dpni.0

```
$ restool dpni destroy dpni.0
dpni.0 is destroyed
```

Giờ thêm lại dpmac.17 bằng lệnh dưới đây. Mặc dù dpmac.17 lại được nối với dpni.0, giờ dpni.0 dùng 16 queue để phân phối traffic.

```
$ ls-addni dpmac.17
Created interface: ni0 (object:dpni.0, endpoint: dpmac.17)
```

##### 4.7.10.5.4 Lưu cấu hình vào một file DPL tùy biến (Tùy chọn)

Sau khi tạo thêm các đối tượng DPNI, có thể tạo một file DPL tùy biến bằng lệnh sau. File DPL này có định dạng `*.dts` và được tạo trên board tham chiếu.

```
$ restool dprc generate-dpl dprc.1 > <file_name>.dts
```

File `*.dts` thu được phải được compile bằng công cụ dtc để tạo file .dtb. Sao chép file này sang một máy Linux host hoặc server bằng SCP và chạy lệnh sau để chuyển nó thành file .dtb.

```
$ dtc -I dts -O dtb <file_name>.dts -o <file_name>.dtb
```

File DPL vừa tạo có thể được ghi lên board và dùng để boot vào Linux.

##### 4.7.10.5.5 Gán địa chỉ IP cho network interface

Có thể gán địa chỉ IP tĩnh cho network interface bằng các lệnh chuẩn ifconfig hoặc ip.

```
$ ifconfig <interface_name_in_Linux> <ip_address>
OR
$ ip address add <ip_address> dev <interface_name_in_linux>
```

Ngoài ra, cũng có thể gán địa chỉ IP tĩnh bằng netplan. Tạo một file tên “`config.yaml`” trong `/` `etc/netplan`. Dùng một trình soạn thảo văn bản, thêm các dòng sau vào file cấu hình này và lưu lại.

```
network:
  version: 2
  renderer: networkd
  ethernets:
    <interface_name_in_Linux>:
      addresses:
        - <ip_address>/24
```

Sau khi lưu file này, chạy lệnh sau để áp dụng cấu hình netplan này rồi reboot board.

```
$ sudo netplan apply
```

Khi board reboot xong, bật interface mong muốn bằng lệnh “`ifconfig <interface_name_in_Linux>` up” hoặc “ `ip link set <interface_name_in_Linux> up`”. Interface được gán địa chỉ IP đã nhập trong file “ `config.yaml`”.

Netplan cũng có thể dùng để gán địa chỉ IP động bằng DHCP. Để gán IP động, thay nội dung file config.yaml bằng nội dung sau.

```
network:
  version: 2
  renderer: networkd
  ethernets:
    <interface_name_in_Linux>:
      dhcp4: true
```

Làm theo cùng quy trình như gán IP tĩnh bằng Netplan sau khi lưu file “`config.yaml`”.

### 4.7.11 Quick start guide cho LX2162AQDS

Mục này giải thích:

- Giới thiệu
- Thông tin tham chiếu LX2162AQDS
- Thông tin khôi phục LX2162AQDS
- Ghi image firmware tổng hợp Layerscape LDP

#### 4.7.11.1 Giới thiệu

Các mục sau mô tả quy trình ghi firmware tổng hợp Layerscape LDP cho LX2162AQDS. Đồng thời, mục này giải thích quy trình cho use case phổ biến nhất: tải và triển khai các image mặc định của Layerscape LDP lên LX2162AQDS bằng flex-installer. Để biết thêm thông tin, xem Section 4.2.

Để biết thêm thông tin về các thành phần khác nhau của board, cũng như cách cấu hình và boot board, xem LX2162A Reference Design Board Getting Started Guide.

#### 4.7.11.2 Thông tin tham chiếu LX2162AQDS

Mục này cung cấp thông tin chung về LX2162AQDS, có thể hữu ích để tham chiếu khi thực hiện các bước triển khai Layerscape LDP ở phần sau.

##### 4.7.11.2.1 Bảng ánh xạ cổng Ethernet

| Mezzanine Card | Tên port | dpmac | Tên port trong U-Boot | Tên port trong Tiny Distro | Tên port trong Linux |
|---|---|---|---|---|---|
| X-M8-100G | QSFP28 Cage | dpmac.3 | DPMAC3@25g-aui | eth5 | eth5 |
| (25G, 100G) |   | dpmac.4 | DPMAC4@25g-aui | eth4 | eth4 |
|   |   | dpmac.5 | DPMAC5@25g-aui | eth3 | eth3 |
|   |   | dpmac.6 | DPMAC6@25g-aui | eth2 | eth2 |
| X-M11-USXGMII<br>(10G) | Port 0<br>Port 1 | dpmac.3<br>dpmac.4 | DPMAC3@xgmii<br>DPMAC4@xgmii | eth5<br>eth4 | eth5<br>eth4 |
|   | Port 2 | dpmac.5 | DPMAC5@xgmii | eth3 | eth3 |
|   | Port 3 | dpmac.6 | DPMAC6@xgmii | eth2 | eth2 |
| X-M12-XFI | SFP+ 1 | dpmac.3 | NA | eth5 | eth5 |
| (10G) | SFP+ 2 | dpmac.4 | NA | eth4 | eth4 |
|   | SFP+ 3 | dpmac.5 | NA | eth3 | eth3 |
|   | SFP+ 4 | dpmac.6 | NA | eth2 | eth2 |
| NA<br>(1G) | RGMII1_BOTTOM | dpmac.17 | DPMAC17@rgmii-id | eth1 | eth1 |
| NA<br>(1G) | RGMII2_TOP | dpmac.18 | DPMAC18@rgmii-id | eth0 | eth0 |

**Ghi chú:**

- Giả định không có PCIe NIC nào được kết nối.
- Tên interface không cố định trên LX2162AQDS; tên được gán tùy theo interface nào đang hoạt động. Có thể kiểm tra tên interface bằng lệnh `ls-listni`.

  ```
  root@TinyDistro:~# ls-listni
  dprc.1/dpni.5 (interface: eth1, end point: dpmac.18)
  dprc.1/dpni.4 (interface: eth2, end point: dpmac.17)
  dprc.1/dpni.3 (interface: eth3, end point: dpmac.6)
  dprc.1/dpni.2 (interface: eth4, end point: dpmac.5)
  dprc.1/dpni.1 (interface: eth5, end point: dpmac.4)
  dprc.1/dpni.0 (interface: eth6, end point: dpmac.3)
  ```

##### 4.7.11.2.2 Memory map của hệ thống

Về system map của LX2162A, xem LX2162A Reference Manual.

LX2162A RM chỉ được cung cấp theo thỏa thuận bảo mật (NDA). Để yêu cầu quyền truy cập, liên hệ kỹ sư ứng dụng hiện trường (FAE) hoặc đại diện bán hàng NXP tại địa phương của bạn.

##### 4.7.11.2.3 Các tùy chọn boot được hỗ trợ

LX2162AQDS hỗ trợ các tùy chọn boot sau:

- FlexSPI NOR flash (ở các mục sau gọi là "XSPI" hoặc "XSPI flash"). CS là Chip Select.
- eMMC

  (SDHC2)

- Thẻ SD (SDHC1)

##### 4.7.11.2.4 Các tùy chọn switch trên board

Board có các switch người dùng chọn được để đánh giá các tùy chọn boot khác nhau cho thiết bị LX2162A, như trong bảng dưới đây ('0' là OFF, '1' là ON).

| SW6\[6:8\] | Ánh xạ thiết bị XSPI | SW_XMAP\[2:0\]:<br>• 000: Boot board từ thiết bị XSPI 0 (thiết lập mặc định)<br>• 001: Boot board từ thiết bị XSPI 1<br>• 010: Boot board từ QSPI emulator |
|---|---|---|
| SW1\[5:8\] | Vị trí RCW<br>CFG_RCW_SRC\[3:0\] | SW_RCWSRC\[3:0\]<br>• 1000: SDHC1: thẻ SD<br>• 1001: SDHC2: eMMC<br>• 1010: I2C (địa chỉ mở rộng)<br>• 1100: XSPI1A: XSPI serial NAND trang 2 kB<br>• 1101: XSPI1A: XSPI serial NAND trang 4 KB<br>• 1111: XSPI1A: XSPI serial NOR địa chỉ 24-bit (thiết lập mặc định)<br>• 0xxx: RCW cố định trong phần cứng |

Ngoài thiết lập switch ở trên, hãy bảo đảm các thiết lập jumper sau là đúng.

**Table 18. Thiết lập jumper mặc định**

| Ký hiệu jumper | Tên | Loại | Mô tả |
|---|---|---|---|
| J3 | FORCE ATX_ON | Header 1x2 chân | • Open: Hoạt động bình thường (thiết lập mặc định)<br>• Short: Buộc ATX-PS ON ở mức logic thấp |
| J8 | VDD_LP_BAT | Header 1x2 chân | • Open: VDD_LP_BAT bị tắt (thiết lập mặc định)<br>• Short: VDD_LP_BAT được bật |
| J9 | TA_BB_TMP_DET | Header 1x2 chân | • Open: Ngắt kết nối (thiết lập mặc định)<br>• Short: Kết nối |
| J13 | HOTRST | Header 1x2 chân | • Open: Reset FPGA khi bật nguồn (thiết lập mặc định)<br>• Short: Reset FPGA thủ công |
| J34 | PROG_MTR | Header 1x2 chân | • Open: chân PROG_MTR của LX2162A bị tắt nguồn (thiết lập mặc định)<br>• Short: Nối 1.8 V vào chân PROG\_MTR của LX2162A |
| J35 | PROG_SFP | Header 1x2 chân | • Open: chân PROG_SFP của LX2162A bị tắt nguồn (thiết lập mặc định)<br>• Short: Nối 1.8 V vào chân PROG\_SFP của LX2162A |
| J37 | FA_VDD | Header 1x2 chân | • Open: FA1_CVL = 0 V (thiết lập mặc định)<br>• Short: FA1_CVL = VDD |
| J38 | USB1_ID | Header 1x2 chân | • Open: Chế độ Device<br>• Short: Chế độ Host (thiết lập mặc định) |
| J58 | UART_LOOPBACK | Header 2x3 chân | • Short chân 1-3, 2-4: Tự loopback cho UART3 và UART4<br>• Short chân 1-2, 3-4: Nối chéo giữa UART3 và UART4 |
| J135 | 6901_MODE_SEL | Header 1x2 chân | • Open: 5P49V6901 được cấu hình bằng lập trình I2C (thiết lập mặc định)<br>• Short: Reserved |
| J136 | FA_VDDH | Header 1x2 chân | • Open: FA2_DVL = 0 V (thiết lập mặc định)<br>• Short: FA2_DVL = OVDD |

##### 4.7.11.2.5 Chip-select của FlexSPI NOR Flash

FlexSPI NOR flash là đích đơn giản và tiện lợi để triển khai image nên được dùng thường xuyên.

Lợi ích của tính năng này là cho phép triển khai độc lập nhiều bộ image lên cùng một NOR flash. Điều này hữu ích trong quá trình phát triển, vì bạn có thể dùng image U-Boot ở một chip-select để ghi một bộ image vào chip-select khác. Nếu các image mới có lỗi, các image cũ vẫn hoạt động để bạn triển khai image đã sửa.

Logic trên board thường cho phép truy cập NOR flash từ các tùy chọn CS (chip select) khác nhau. Mỗi CS được nối với các thiết bị NOR flash riêng; các CS đó gọi là DEV#0 và DEV#1. U-Boot in ra CS nào được nạp. Output có dạng như sau:

```
U-Boot 2022.04+fsl+g181859317b (Nov 15 2022 - 06:28:05 +0000)
SoC:  LX2162ACE Rev2.0 (0x87360820)
Clock Configuration:
       CPU0(A72):2000 MHz  CPU1(A72):2000 MHz  CPU2(A72):2000 MHz
       CPU3(A72):2000 MHz  CPU4(A72):2000 MHz  CPU5(A72):2000 MHz
       CPU6(A72):2000 MHz  CPU7(A72):2000 MHz  CPU8(A72):2000 MHz
       CPU9(A72):2000 MHz  CPU10(A72):2000 MHz  CPU11(A72):2000 MHz
       CPU12(A72):2000 MHz  CPU13(A72):2000 MHz  CPU14(A72):2000 MHz
       CPU15(A72):2000 MHz
       Bus:      650  MHz  DDR:      2900 MT/s
Reset Configuration Word (RCW):
       00000000: 50777734 20500050 00000000 00000000
       00000010: 00000000 0c010000 00000000 00000000
       00000020: 38c001a0 00002580 00000000 00000096
       00000030: 00000000 00000000 00000000 00000000
       00000040: 00000000 00000000 00000000 00000000
       00000050: 00000000 00000000 00000000 00000000
       00000060: 00000000 00000000 00027000 00000000
       00000070: 00510036 00050003
Model: NXP Layerscape LX2160AQDS Board (DTS 17.x)
Board: LX2162ACE Rev2.0-QDS, Board version: A, boot from SD
FPGA: v1 (LX2162AQDS_2020_0609_0802), build 265 on Tue Jun 09 13:02:54 2020
```

Có thể chuyển đổi tùy chọn boot trong U-Boot bằng các câu lệnh sau.

- Chuyển sang FlexSPI NOR flash 0 (mặc định):

  ```
  => qixis_reset
  ```

- Chuyển sang FlexSPI NOR flash 1:

  ```
  => qixis_reset altbank
  ```

- Chuyển sang SD:

  ```
  => qixis_reset sd
  ```

- Chuyển sang eMMC:

  ```
  => qixis_reset emmc
  ```

##### 4.7.11.2.6 Các biến môi trường U-Boot

Để biết thêm về lệnh distro boot của U-Boot, xem Section 5.3.2.

Các biến môi trường riêng cho DPAA2

- **mcboottimeout**: Định nghĩa thời gian timeout khi boot Management Complex, tính bằng mili giây. Nếu biến này không được định nghĩa, giá trị lúc compile `CONFIG_SYS_LS_MC_BOOT_TIMEOUT_MS` sẽ là mặc định. Thông thường, người dùng không cần đặt biến này vì giá trị mặc định đã chấp nhận được.
- **mcmemsize**: Định nghĩa lượng DDR hệ thống được Management Complex dùng. Nếu biến này không được định nghĩa, giá trị lúc compile `CONFIG_SYS_LS_MC_DRAM_BLOCK_MIN_SIZE` sẽ là mặc định. Thông thường, người dùng không cần đặt biến này vì giá trị mặc định đã chấp nhận được.
- **mcinitcmd**: Chứa các lệnh để tự động nạp và khởi động Management Complex trước khi U-Boot bắt đầu đếm ngược để boot. Nếu biến này được định nghĩa, nội dung của nó được `run`. Giá trị mặc định giả định rằng firmware Management Complex (MC) và file Data Path Control được lưu trong FlexSPI flash ở các địa chỉ cố định. Giá trị mặc định khi boot từ FlexSPI là `sf probe 0:0 && sf read 0x80640000` `0x640000 0x80000 && env exists secureboot && esbc_validate 0x80640000 &&` `esbc_validate 0x80680000; sf read 0x80a00000 0xa00000 0x300000 && sf read` `0x80e00000 0xe00000 0x100000; fsl_mc start mc 0x80a00000 0x80e00000l_mc start mc` `0x20a00000 0x20e00000`. Người dùng có thể đổi biến này khi cần để nạp các file MC từ nguồn khác ngoài FlexSPI vào DDR, rồi khởi động MC bằng lệnh fsl_mc. Ví dụ, các file có thể nằm trên một ổ đĩa.

Các biến môi trường không riêng cho DPAA2

**bootcmd**: Chứa các lệnh được tự động thực thi khi lệnh "boot" của U-Boot được chạy. Việc này diễn ra tự động khi người dùng không ngắt quá trình đếm ngược ban đầu của U-Boot. Khi dùng bình thường, bootcmd nên chứa lệnh áp dụng file Data Path Layout (DPL) của Management Complex, vì việc này phải làm trước khi boot Linux. Giá trị mặc định của bootcmd giả định file DPL được lưu trong FlexSPI flash ở một địa chỉ cố định. Mặc định là `sf probe 0:0; sf read 0x806c0000 0x6c0000 0x40000;` `env exists mcinitcmd && env exists secureboot && esbc_validate 0x806c0000; sf` `read 0x80d00000 0xd00000 0x100000; env exists mcinitcmd && fsl_mc lazyapply` `dpl 0x80d00000; run distro_bootcmd;run xspi_bootcmd; env exists secureboot &&` `esbc_halt`

##### 4.7.11.2.7 Cấu hình card adapter SDHC

Các bảng sau cho thấy chi tiết RCW và register QIXIS FPGA cho các adapter SDHC/eMMC khác nhau dùng với LX2162AQDS.

**Table 19. SDHC1 CONTROLLER#1**

| Adapter |   |   | Board MUX |   | RCW |   |   |   |   | SW9 | HW | Remark |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Agile P/N | Agile Name | CARD\_<br>ID | BRD<br>CFG5 | BRD<br>CFG11 | IIC2\_<br>PMUX<br>(RCW<br>\[354-<br>352\]) | IIC5\_<br>PMUX<br>(RCW<br>\[363-<br>361\]) | SDHC1\_<br>BASE\_<br>PMUX<br>(RCW<br>\[378-<br>376\]) | SDHC1\_<br>DIR\_<br>PMUX<br>(RCW<br>\[381-<br>379\]) | SDHC1\_<br>DS\_<br>PMUX<br>(RCW<br>\[839-<br>838\]) | \[8\] | Changes |   |
| 31421 | EMMC-51- ADAP | 0b000 | 0x20 | 0x0 | 0b000 | 0bxxx | 0b100 (8-bit) | 0b100 (8-bit) | 0b00 | 0 |   | Trên adapter, đặt shunt nối chân<br>2 và |
| Agile P/N | Agile Name | CARD\_<br>ID | BRD<br>CFG5 | BRD<br>CFG11 | IIC2\_<br>PMUX<br>(RCW<br>\[354-<br>352\]) | IIC5\_<br>PMUX<br>(RCW<br>\[363-<br>361\]) | SDHC1\_<br>BASE\_<br>PMUX<br>(RCW<br>\[378-<br>376\]) | SDHC1\_<br>DIR\_<br>PMUX<br>(RCW<br>\[381-<br>379\]) | SDHC1\_<br>DS\_<br>PMUX<br>(RCW<br>\[839-<br>838\]) | \[8\] | Changes |   |
|   |   |   |   |   |   |   |   |   |   |   |   | 3 trên header J1 |
| 28074 | EMMC-45- ADAP | 0b001 | 0x20 | 0x0 | 0b000 | 0bxxx | 0b000 hoặc 0b011 (4-bit) / 0b100 (8-bit) | 0bxxx (4-bit) / 0b100(8- bit) | 0bxx | 0 |   | Trên adapter, đặt shunt nối chân<br>2 và 3 trên header J1 |
| 28056 | SD-MMC-ADAPTOR | 0b010 | 0x60 | 0x0 | 0b110 | 0bxxx | 0b000 hoặc 0b011 (4-bit) | 0bxxx (4-bit) | 0bxx | 1 |   |   |
| 28075 | EMMC-44- ADAP | 0b011 | 0x20 | 0x0 | 0b000 | 0b010 | 0b000 hoặc 0b011 (4-bit) | 0bxxx (4-bit) | 0bxx | 0 | Tháo R874 và lắp R261 | Trên adapter, đặt shunt nối chân<br>2 và 3 trên header J1 |
| 29730 | EMMC-50- ADAP | 0b100 | 0x20 | 0x0 | 0b000 | 0bxxx | 0b100 (8-bit) | 0b100 (8-bit) | 0b00 | 0 |   | Trên adapter, đặt shunt nối chân<br>2 và 3 trên header J1 |
| 28073 | MMC-ADAPTOR | 0b101 | 0x60 | 0x0 | 0b110 | 0bxxx | 0b000 hoặc 0b011 (4-bit) / 0b100 (8-bit) | 0bxxx (4-bit) / 0b100(8- bit) | 0bxx | 0 |   |   |
| 28072 | SD-2-3- ADAPTOR | 0b110 | 0x60 | 0x30 | 0b110 | 0bxxx | 0b000 (4-bit) | 0bxxx (4-bit) | 0bxx | 1 |   |   |

**Table 20. SDHC1 CONTROLLER#2**

| Adapter |   |   | Board MUX | RCW |   |   | HW | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| Agile P/N | Tên Agile | CARD_ID | BRDCFG13 | IIC6_PMUX (RCW\[366-364\]) | SDHC2\_BASE_PMUX (RCW\[389-387\]) | SDHC2\_DAT74_PMUX (RCW\[386-384\]) | Thay đổi |   |
| 31421 | EMMC-51- ADAP | 0b000 | 0x0 | 0bxxx | 0b000 | 0b000 |   | Trên adapter, đặt shunt nối chân 2 và 3 trên header J1 |
| 28074 | EMMC-45- ADAP | 0b001 | 0x0 | 0bxxx | 0b000 | 0b000 |   | Trên adapter, đặt shunt nối chân 2 và 3 trên header J1 |
| 28075 | EMMC-44- ADAP | 0b011 | 0x0 | 0b010 | 0b000 | 0b000 | Tháo R875 và lắp R260 | Trên adapter, đặt shunt nối chân 2 và 3 trên header J1 |
| 29730 | EMMC-50- ADAP | 0b100 | 0x0 | 0bxxx | 0b000 | 0b000 |   | Trên adapter, đặt shunt nối chân 2 và 3 trên header J1 |
| 28073 | MMC-ADAPTOR | 0b101 | 0x0 | 0bxxx | 0b000 | 0b000 |   |   |

Bảng sau cho thấy các card adapter SDHC được phần mềm mặc định hỗ trợ.

|   | Card adapter SDHC | Chế độ tốc độ cao nhất |
|---|---|---|
| eSDHC1 | Thẻ SD revision 2.0/3.0 | UHS-I |
| eSDHC2 | Thẻ eMMC revision 5.1 | HS400 |
|   | Thẻ eMMC revision 4.5 | HS200 |
|   | Thẻ eMMC revision 4.4 | High speed |
|   | Thẻ eMMC revision 5.0 | HS400 |
|   | Thẻ MMC và thẻ SD đời cũ (3.3V) | Default speed<br>(Adapter giới hạn chỉ dùng thẻ MMC và thẻ SD đời cũ) |

**Các card adapter SDHC khác và cấu hình phần mềm**

Các card adapter SDHC khác cho eSDHC1 có thể hoạt động ở chế độ high-speed 4-bit với phần mềm mặc định (trừ thẻ SD/MMC cần cấu hình mới hoạt động). Để có hiệu năng đọc/ghi tốt nhất, tham khảo bảng sau để cấu hình phần mềm.

**eSDHC1**

| Card adapter SDHC | Thay đổi RCW | Thay đổi node device tree | Chế độ tốc độ cao nhất |
|---|---|---|---|
| Thẻ eMMC revision 5.1 | SDHC1_DIR_PMUX=4 | mmc-hs200-1_8v;<br>mmc-hs400-1_8v;<br>bus-width = <8>; | HS400 |
| Thẻ eMMC revision 4.5 | Với độ rộng 8-bit<br>SDHC1_DIR_PMUX=4 | mmc-hs200-1_8v;<br>Với độ rộng 8-bit<br>bus-width = <8>; | HS200 |
| Thẻ SD/MMC | Với độ rộng 8-bit<br>SDHC1_DIR_PMUX=4 | **Xóa các property**sd-uhs-sdr104;<br>sd-uhs-sdr50;<br>sd-uhs-sdr25;<br>sd-uhs-sdr12; **Với độ rộng 8-bit**<br>bus-width = <8>; | High speed |
| Thẻ eMMC revision 4.4 | Với độ rộng 8-bit<br>SDHC1_DIR_PMUX=4 | Với độ rộng 8-bit<br>bus-width = <8>; | High speed |
| Thẻ eMMC revision 5.0 | SDHC1_DIR_PMUX=4 | mmc-hs200-1_8v;<br>mmc-hs400-1_8v;<br>bus-width = <8>; | HS400 |
| Thẻ MMC và thẻ SD đời cũ (3.3V) | Với độ rộng 8-bit<br>SDHC1_DIR_PMUX=4 | Với độ rộng 8-bit<br>bus-width = <8>; | Default speed<br>(Adapter giới hạn chỉ dùng thẻ MMC và thẻ SD đời cũ) |

#### 4.7.11.3 Thông tin khôi phục LX2162AQDS

Nếu board LX2162AQDS không boot được từ XSPI NOR bank #0, bạn có thể khôi phục XSPI NOR bank #0 từ XSPI NOR bank #1 theo các bước sau:

1. Tải image firmware tổng hợp đã build sẵn:

   ```
   $ cp <build>/tmp/deploy/image/ls1043ardb/firmware_lx2162aqds_xspiboot.img ~/
   tftp
   ```

2. Boot LX2162AQDS từ XSPI NOR bank #1 với thiết lập switch sau:
   - SW1\[1:8\] = 00001111
   - SW6\[6:8\] = 001
3. Ghi XSPI NOR bank #0 từ XSPI NOR bank #1:

   ```
   => i2c mw 66 50 00; sf probe 0:0
   => tftp $load_addr firmware_lx2162aqds_xspiboot.img
   => sf erase 0x0 +$filesize && sf write $load_addr 0x0 $filesize
   ```

4. Đổi thiết lập switch về mặc định:
   - SW1\[1:8\] = 00001111
   - SW6\[6:8\] = 000
5. Reset board, board sẽ boot từ XSPI NOR bank #0:

   ```
   => reset
   ```

**Ghi chú:** Nếu LX2162AQDS không boot được từ cả hai bank FlexSPI NOR flash, bạn cần khôi phục board bằng **CodeWarrior for LS Series, Arm v8 ISA**. Về các bước khôi phục board bằng công cụ CodeWarrior, xem mục Board Recover trong ARM V8 ISA, Targeting Manual.

#### 4.7.11.4 Ghi image firmware tổng hợp Layerscape LDP

Phần này giải thích các bước ghi image firmware FlexSPI NOR vào FlexSPI NOR flash trên LX2162AQDS và ghi image firmware SD/eMMC vào thẻ SD/eMMC trên LX2162AQDS.

Để ghi image firmware tổng hợp Layerscape LDP vào FlexSPI NOR flash trên LX2162AQDS:

1. Sao chép firmware trên máy host sang TFTP server.

   ```
   $ cp <build>/tmp/deploy/image/lx2162aqds/firmware_lx2162aqds_qspiboot.img ~/
   tftp/
   ```

2. Reboot board từ FlexSPI NOR flash 0 và dừng autoboot để vào U-Boot prompt.
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     ```
     => tftp $load_addr firmware_lx2162aqds_xspiboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     ```
     => load mmc <device:part> $load_addr firmware_lx2162aqds_xspiboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_lx2162aqds_xspiboot.img
     ```

     or

     ```
     => load usb <device:part> $load_addr firmware_lx2162aqds_xspiboot.img
     ```

     or

     ```
     => load scsi <device:part> $load_addr firmware_lx2162aqds_xspiboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_lx2162aqds_xspiboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_lx2162aqds_xspiboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_lx2162aqds_xspiboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Ghi firmware vào FlexSPI NOR flash 1.

   ```
   => i2c mw 66 50 20; sf probe 0:0 => sf erase 0 +$filesize && sf write
    $load_addr 0 $filesize
   ```

5. Reset và boot board từ FlexSPI NOR flash 1. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời.

   ```
   => qixis_reset altbank
   ```

Để ghi image firmware tổng hợp Layerscape LDP vào SD/eMMC trên LX2162AQDS:

1. Sao chép firmware trên máy host sang tftp server.

   Với boot từ SD:

   ```
   $ cp <build>/tmp/deploy/image/lx2162aqds/firmware_llx2162aqds_sdboot.img ~/
   tftp/
   ```

   Với boot từ eMMC:

   ```
   $ cp <build>/tmp/deploy/image/lx2162aqds/firmware_llx2162aqds_emmcboot.img ~/
   tftp/
   ```

2. Reboot board từ FlexSPI NOR flash 0 và dừng autoboot để vào U-Boot prompt.
3. Trong U-Boot, tải firmware vào board tham chiếu bằng một trong các cách sau:
   - Nạp firmware từ TFTP server

     Với boot từ SD:

     ```
     => tftp $load_addr firmware_lx2162aqds_sdboot.img
     ```

     Với boot từ eMMC:

     ```
     => tftp $load_addr firmware_lx2162aqds_emmcboot.img
     ```

   - Nạp image firmware từ partition trên thiết bị lưu trữ dung lượng lớn (SD, USB hoặc SATA)

     Với boot từ SD:

     ```
     => load mmc <device:part> $load_addr firmware_lx2162aqds_sdboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_lx2162aqds_sdboot.img
     ```

     or

     ```
     => load usb <device:part> $load_addr firmware_lx2162aqds_sdboot.img
     ```

     ```
     => load scsi <device:part> $load_addr firmware_lx2162aqds_sdboot.img
     ```

     Với boot từ eMMC:

     ```
     => load mmc <device:part> $load_addr firmware_lx2162aqds_emmcboot.img
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_lx2162aqds_emmcboot.img
     ```

     or

     ```
     => load usb <device:part> $load_addr firmware_lx2162aqds_emmcboot.img
     ```

     or

     ```
     => load scsi <device:part> $load_addr firmware_lx2162aqd_emmcboot.img
     ```

     **Ghi chú:**

     Dùng lệnh sau nếu thẻ SD/eMMC được format/tạo bằng lệnh flex-installer của Layerscape LDP:

     ```
     => load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => load mmc 0:2 $load_addr firmware_lx2162aqds_sdboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Windows PC:

     ```
     => fatload <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => fatload mmc 0:2 $load_addr firmware_lx2162aqds_sdboot.img
     ```

     Dùng lệnh sau nếu thẻ SD được format/tạo trên Linux PC:

     ```
     => ext2load <interface> [<dev[:part]> [<addr> [<filename> [bytes [pos]]]]]
     ```

     Ví dụ:

     ```
     => ext2load mmc 0:2 $load_addr firmware_lx2162aqds_sdboot.img
     ```

     Ngoài ra, lưu ý rằng lệnh flex-installer của Layerscape LDP đặt các image vào partition thứ hai, nên `0:2` được dùng trong lệnh `load`. Nếu thẻ SD được format trên Windows PC hoặc Linux PC chỉ với một partition, thì phải dùng `0` thay cho `0:2` trong lệnh `fatload`/`ext2load`.

4. Ghi firmware vào SD card.

   ```
   => mmc dev 0; mmc write $load_addr 8 1fff8
   ```

5. Ghi firmware vào eMMC card.

   ```
   => mmc dev 1; mmc write $load_addr 8 1fff8
   ```

6. Reset và boot board từ thẻ SD. Hệ thống sẽ tự động boot vào TinyDistro (đăng nhập bằng root/root) hoặc distro Layerscape LDP (đăng nhập bằng user/user) có trên thiết bị lưu trữ tháo rời. Với boot từ SD:

   ```
   => qixis_reset sd
   ```

   Với boot từ eMMC:

   ```
   => qixis_reset emmc
   ```

## 4.8 Memory layout và userland của Layerscape LDP

### 4.8.1 Flash layout

Bảng sau cho thấy memory layout của các firmware được lưu trong thiết bị flash NOR/NAND/QSPI/XSPI hoặc thẻ SD trên mọi Reference Design Board Layerscape.

**Ghi chú:** Khi board boot từ NOR flash, NOR bank mà board boot từ đó được coi là "bank hiện tại" và bank kia được coi là "bank thay thế". Ví dụ, nếu LS1043ARDB boot từ NOR bank 4, để cập nhật một image trên NOR bank 0, bạn cần dùng dải địa chỉ của "bank thay thế", `0x64000000 - 0x64F00000`.

**Table 21. Memory layout thống nhất 64 MiB của các phương tiện NOR/QSPI/XSPI/NAND/SD cho firmware tổng hợp trên mọi**

**nền tảng Layerscape**

| Định nghĩa firmware |   | Kích thước tối đa | Offset trong flash (QSPI/XSPI/NAND flash) | Địa chỉ tuyệt đối (bank NOR hiện tại trên LS1043 ARDB, TWR-LS1021A) | Địa chỉ tuyệt đối (bank NOR thay thế trên LS1043 ARDB, TWR-LS1021A) | Địa chỉ tuyệt đối (bank NOR hiện tại trên LS2088 ARDB) | Địa chỉ tuyệt đối (bank NOR thay thế trên LS2088 ARDB) | Số block bắt đầu trên SD |
|---|---|---|---|---|---|---|---|---|
| RCW + PBI + BL2 (bl2\_\<boot_mode>. pbl)<sup>\[1\]</sup> |   | 1MiB<sup>\[2\]</sup> | 0x00000000 | 0x60000000 | 0x64000000 | 0x580000000 | 0x584000000 | 0x00008 |
| TF-A FIP image (BL31 + TEE (BL32) + U-Boot/UEFI (Bl33)) (fip. bin)<sup>\[3\]</sup> |   | 4MiB | 0x00100000 | 0x60100000 | 0x64100000 | 0x580100000 | 0x584100000 | 0x00800 |
| Môi trường firmware boot |   | 1MiB | 0x00500000 | 0x60500000 | 0x64500000 | 0x580500000 | 0x584500000 | 0x02800 |
| Các secure boot header |   | 128KiB | 0x00600000 | 0x60600000 | 0x64600000 | 0x580600000 | 0x584600000 | 0x03000 |
| DDR PHY FW hoặc reserved |   | 512KiB | 0x00800000 | 0x60800000 | 0x64800000 | 0x580800000 | 0x584800000 | 0x04000 |
| Header fuse provisioning |   | 512KiB | 0x00880000 | 0x60880000 | 0x64880000 | 0x580880000 | 0x584880000 | 0x04400 |
| DPAA1 FMan microcode |   | 256KiB | 0x00900000 | 0x60900000 | 0x64900000 | 0x580900000 | 0x584900000 | 0x04800 |
| QE firmware hoặc DP firmware |   | 256KiB | 0x00940000 | 0x60940000 | 0x64940000 | 0x580940000 | 0x584940000 | 0x04A00 |
| Ethernet PHY firmware |   | 256KiB | 0x00980000 | 0x60980000 | 0x64980000 | 0x580980000 | 0x584980000 | 0x04C00 |
| Script ghi image |   | 256KiB | 0x009C0000 | 0x609C0000 | 0x649C0000 | 0x5809C0000 | 0x5849C0000 | 0x04E00 |
| Firmware DPAA2-MC hoặc PFE |   | 3MiB | 0x00A00000 | 0x60A00000 | 0x64A00000 | 0x580A00000 | 0x584A00000 | 0x05000 |
| DPAA2 DPL |   | 1MiB | 0x00D00000 | 0x60D00000 | 0x64D00000 | 0x580D00000 | 0x584D00000 | 0x06800 |
| DPAA2 DPC |   | 1MiB | 0x00E00000 | 0x60E00000 | 0x64E00000 | 0x580E00000 | 0x584E00000 | 0x07000 |
| Device tree (UEFI cần) |   | 1MiB | 0x00F00000 | 0x60F00000 | 0x64F00000 | 0x580F00000 | 0x584F00000 | 0x07800 |
| Kernel | kernel-fsl- | 16MiB | 0x01000000 | 0x61000000 | 0x65000000 | 0x581000000 | 0x585000000 | 0x08000 |
| Ramdisk rfs | \<board>.itb | 32MiB | 0x02000000 | 0x62000000 | 0x66000000 | 0x582000000 | 0x586000000 | 0x10000 |

\[1\] Với bất kỳ cập nhật nào trong source code BL2 hoặc binary RCW, binary `bl2_<boot_mode>.pbl` cần được compile lại.

\[2\] Với thiết bị Flash (không boot từ SD), MaxSize là 1 MB. Với thiết bị SD/eMMC (boot từ SD), MaxSize là 1 MB-4 KB=1020 kB

\[3\] Với bất kỳ cập nhật nào trong các binary BL31, BL32 hoặc BL33, binary `fip.bin` cần được compile lại.

Firmware tổng hợp Layerscape LDP firmware\_\<machine>_\<bootloader>_\<boottype>.img chứa RCW, ATF, U-Boot/UEFI, secure boot header, firmware Ethernet PHY, device tree, kernel và tiny rootfs, như trong bảng trên; kernel-fsl-\<board>.itb gồm image kernel, device tree của nhiều board tham chiếu và rootfs_lsdk\_yocto_tiny_arm64.cpio.gz.

**Table 22. Memory layout 2MB của các phương tiện QSPI/SD trên nền tảng Layerscape LS1012AFRWY**

| Định nghĩa firmware | Kích thước tối đa | Vị trí | Số block bắt đầu trên SD |
|---|---|---|---|
| RCW+PBI+BL2 (bl2\_\<boot\_mode>.pbl) | 64 KB | 0x0000_0000 - 0x0000_FFFF | 0x00008 |
| Reserved | 64 KB | 0x0001_0000 - 0x0001_FFFF | 0x00080 |
| PFE firmware | 256 KB | 0x0002_0000 - 0x0005_FFFF | 0x00100 |
| FIP (BL31+BL32+BL33) | 1 MB | 0x0006_0000 - 0x000D_FFFF | 0x00300 |
| Biến môi trường | 64 KB | 0x001D_0000 - 0x001D_FFFF | 0x00E80 |
| Reserved | 64 KB | 0x001E_0000 - 0x001E_FFFF | 0x00F00 |
| Các secureboot header | 64 KB | 0x001F_0000 - 0x001F_FFFF | 0x00F80 |

Nói chung, không đổi offset mặc định của image thứ nhất (RCW + PBI + BL2) và image thứ hai (TF-A FIP image) để tránh làm board đích bị brick; bạn có thể đổi offset mặc định của các image khác để dùng layout riêng bằng cách sửa offset của các firmware trong \<bitbake-dir>/configs/board/common/memorylayout.cfg.

### 4.8.2 Layout lưu trữ trên SD/USB/SATA để triển khai image Layerscape LDP

Với lệnh 'flex-installer -i auto -m \<machine> -d \<device>', distro Layerscape LDP có thể được cài vào một đĩa lưu trữ SD/USB/SATA, đĩa này mặc định cần có ít nhất 16 GB dung lượng, theo layout sau.

**Table 23. Layout mặc định của thiết bị lưu trữ SD/USB/SATA để**

**triển khai image distro Layerscape LDP**

| Region<br>1 (RAW) 4KiB | Region 2 (RAW, chỉ boot từ SD) 64 MiB | Region 3 (**Partition-** **1** FAT/EXT4) 128 MiB | Region 4 (**Partition-** **2** EXT4) 2 GiB Boot Partition | Region 5<br>(**Partition-3** EXT4) 5 GiB Backup Partition | Region 6 (**Partition-4** EXT4) Primary RFS trên phần còn lại của đĩa |
|---|---|---|---|---|---|
| MBR/GPT | • RCW<br>• U-Boot hoặc UEFI<br>• TF-A<br>firmware<br>• QE/uQE firmware<br>• FMan hoặc MC firmware<br>• DPL và DPC firmware<br>• DTB<br>• kernel-fsl-\<board>.itb | • BOOTAA64.EFI, grub.cfg<br>• hoặc cho mục đích khác | • kernel<br>• dtb<br>• distro bootscript<br>• secure boot header<br>• firmware tổng hợp<br>• kernel-fsl-\<board>.itb<br>• rootfs | Backup partition<br>hoặc<br>distro thứ hai | Userland Layerscape LDP (Mặc định) |

Layout mặc định của đĩa đích được tạo theo mặc định "-p 4P=128M:2G:5G:-1"; nếu cần layout khác, bạn có thể chỉ định tùy chọn '-p' trong lệnh flex-installer, ví dụ flex-installer -i auto -p 4P=50M:2G:100M:-1 -m ls1046ardb -d /dev/mmcblk0. Khi đã đổi partition mặc định, cần đặt biến môi trường U-Boot devpart_boot cho boot partition (mặc định devpart_boot=2) và devpart_root cho partition rootfs (mặc định devpart_root=4 trong distro bootscript \<board>\_boot.scr); ví dụ, bạn có thể chạy 'setenv devpart_root 3; saveenv; boot' tại U-Boot prompt để boot distro đích từ partition 3 thay vì partition 4 mặc định.

Nếu muốn đổi bootargs mặc định cho kernel, bạn có thể chạy 'setenv othbootargs \<your_new_settings>' tại U-Boot prompt để thêm tùy chọn bootargs, rồi chạy 'saveenv; boot' để boot distro.

### 4.8.3 Userland Layerscape LDP

Layerscape LDP hỗ trợ nhiều loại userland distro ở các quy mô khác nhau để phù hợp với nhiều use case; theo mặc định hỗ trợ userland OS đầy đủ dựa trên Linux distro và userland tiny dựa trên Yocto.

Ba loại userland dựa trên Linux distro sau được hỗ trợ:

- Userland main dựa trên Layerscape LDP： Tích hợp nhiều package mạng từ repo main upstream và các package tùy biến của NXP, áp dụng cho mọi nền tảng Layerscape (có binary build sẵn để tải).

- Userland desktop dựa trên Layerscape LDP: Tích hợp các package GNOME desktop tùy biến và các package tùy biến của NXP với thư viện tăng tốc GPU cho ứng dụng đa phương tiện, áp dụng cho LS1028A và các nền tảng i.MX. Không phân phối binary build sẵn; người dùng có thể tự tạo bằng Yocto bitbake. GNOME desktop tự động khởi chạy theo mặc định, Weston không tự khởi chạy khi boot, người dùng có thể khởi chạy thủ công nếu cần.
- Userland lite dựa trên Layerscape LDP: Tích hợp các package cơ bản của Linux distro để có kích thước nhỏ hơn (có binary build sẵn để tải).

Để boot distro lớn từ thiết bị lưu trữ mặc định trong U-Boot:

```
=> boot
```

Để boot userland Layerscape LDP từ thiết bị lưu trữ USB/SD/SATA chỉ định trong U-Boot:

```
=> run bootcmd_usb0
or
=> run bootcmd_mmc1
or
=> run bootcmd_scsi0
```

Để boot TinyLinux trong U-Boot:

```
=> run sd_bootcmd
or
=> run nor_bootcmd
or
=> run qspi_bootcmd
or
=> run xspi_bootcmd
```

### 4.8.4 TinyDistro

TinyDistro `kernel-fsl-<board>.itb` mặc định gồm `kernel`, `dtb` và `initramfs` (`rootfs_tiny_<arch>.cpio.gz`). U-Boot nạp nó từ thiết bị flash (hoặc thẻ SD) vào RAM và boot từ RAM. Vì kích thước các kernel module quá lớn để cài vào tiny rootfs, theo mặc định TinyLinux không có kernel module. Bạn có thể cài `boot_LS_<arch>_lts_<version>.tgz` (trong đó kernel và module được triển khai để các distro khác nhau dùng lại) vào thẻ SD hoặc USB bằng flex-installer, boot TinyLinux rồi chạy lệnh `mount-modules` để tự động mount boot partition vào thư mục /boot và tạo symlink / lib/modules tới /boot/modules. Khi đó các kernel module đã sẵn sàng, ví dụ chạy "modprobe flexcan" để nạp module flexcan.

Userland main mặc định của Layerscape LDP là một userland lai dựa trên Linux distro 22.04, với các package/thành phần và cấu hình hệ thống của NXP. Bạn có thể chọn userland distro phù hợp theo nhu cầu.

Các userland được nêu trong bảng sau:

### 4.8.5 Chi tiết các userland distro

| Userland Layerscape LDP | Tên tarball userland | Kích thước | Lệnh build | Mô tả |
|---|---|---|---|---|
| Userland **main** Layerscape LDP | `ls-image-main-`<br>`<machine>.tar.gz` | ~760M | $ bitbake ls-image-main | Gồm các package main của Layerscape LDP và đầy đủ các package mạng và bảo mật của NXP (không có package đồ họa) cho các nền tảng Layerscape. |
| Userland **lite** Layerscape LDP | ls-image-lite-\<machine>.tar. gz | ~160M | $ bitbake ls-image-lite | Gồm các package cơ bản của Layerscape LDP và một phần package của NXP (restool, tsntool, fmc, net-tools, flex-installer, ccsr, v.v.). |
| Userland **desktop** Layerscape LDP | ls-image-desktop-\<machine>.tar.gz | ~1.1G | $ bitbake ls-image-desktop | Gồm các package GNOME desktop của Layerscape LDP và một phần package đồ họa của NXP, áp dụng cho các nền tảng có GPU (ví dụ, LS1028A và i.MX). |
| Userland **tiny** dựa trên Yocto | fsl-image-mfgtool-\<machine>.tar.gz | ~20M | $ bitbake fsl-image-mfgtool | Gồm các package cơ bản dựa trên Yocto và một phần package của NXP (restool, tsntool, fmc, net-tools, flex-installer, ccsr, v.v.). |

Để build một userland cụ thể từ source, xem các mục "How to build Layerscape LDP with Yocto bitbake", "How to build various userland with custom packages".

Mọi apt package trong userland main Layerscape LDP build sẵn đều từ repository LDP main, đã được NXP thẩm định pháp lý là có nguồn gốc tin cậy. Bạn có thể tự cài thêm apt package bằng lệnh sudo apt install \<package-name>. NXP không chịu trách nhiệm pháp lý nếu bạn phân phối công khai distro chứa package có nguồn gốc không tin cậy, như gstreamer1.0, python, v.v. nằm ở `/usr/share`.
