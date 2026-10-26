# *Chương 7*: Phát triển với Yocto (Developing with Yocto)

Đưa Linux lên phần cứng chưa được hỗ trợ có thể là một quá trình vất vả. May mắn là Yocto cung cấp các **Board Support Package** (**BSP**) để khởi động việc phát triển embedded Linux trên các single-board computer phổ biến như BeagleBone Black và Raspberry Pi 4. Xây dựng trên một BSP layer có sẵn cho phép chúng ta nhanh chóng tận dụng các ngoại vi built-in phức tạp như Bluetooth và Wi-Fi. Trong chương này, chúng ta sẽ tạo một application layer tùy biến để làm đúng điều đó.

Tiếp theo, chúng ta sẽ xem workflow phát triển được hỗ trợ bởi extensible SDK của Yocto. Sửa phần mềm chạy trên thiết bị đích thường có nghĩa là phải thay thẻ SD. Vì build lại và triển khai lại toàn bộ image quá time-consuming, tôi sẽ chỉ cho bạn cách dùng `devtool` để nhanh chóng tự động hóa và lặp lại công việc. Trong lúc làm vậy, bạn sẽ học cách lưu công việc vào các layer của riêng mình để nó không bị mất.

Yocto không chỉ build image Linux mà còn cả bản phân phối Linux hoàn chỉnh. Chúng ta sẽ bàn về lý do bạn muốn làm điều đó trước khi đi qua các bước lắp ráp bản phân phối Linux của riêng mình. Nhiều lựa chọn chúng ta sẽ đưa ra bao gồm việc có thêm quản lý package lúc runtime hay không để phát triển application nhanh trên thiết bị đích. Điều này đi kèm cái giá là phải bảo trì một cơ sở dữ liệu package và một package server từ xa, điều tôi sẽ đề cập ở cuối.

Trong chương này, chúng ta sẽ đề cập các chủ đề sau:

- Xây dựng trên một BSP có sẵn
- Ghi lại thay đổi với `devtool`
- Build distro của riêng bạn
- Chuẩn bị một package server từ xa

Hãy bắt đầu!

## Yêu cầu kỹ thuật

Để làm theo các ví dụ trong chương này, hãy bảo đảm bạn có những thứ sau:

- Một hệ thống host Linux-based có ít nhất 60 GB dung lượng đĩa trống
- Bản phát hành Yocto 3.1 (Dunfell) LTS
- Etcher cho Linux
- Một đầu đọc thẻ microSD và thẻ
- A Raspberry Pi 4
- Một bộ nguồn USB-C 5V 3A
- Một cáp Ethernet và cổng để kết nối mạng
- Một router Wi-Fi
- Một smartphone có Bluetooth

Lẽ ra bạn đã build bản phát hành Yocto 3.1 (Dunfell) LTS trong [*Chương 6*](ch06_selecting_a_build_system.vi.md), *Chọn build system*. Nếu chưa, hãy tham khảo các mục *Compatible Linux Distribution* và *Build Host Packages* của hướng dẫn *Yocto Project Quick Build* ([https://www.yoctoproject.org/docs/current/brief-yoctoprojectqs/brief-yoctoprojectqs.html](https://www.yoctoproject.org/docs/current/brief-yoctoprojectqs/brief-yoctoprojectqs.html)) trước khi build Yocto trên host Linux theo hướng dẫn trong [*Chương 6*](ch06_selecting_a_build_system.vi.md).

Toàn bộ code cho chương này có thể được tìm thấy trong thư mục `Chapter07` của repository GitHub của cuốn sách: [https://github.com/PacktPublishing/Mastering-Embedded-Linux-Programming-Third-Edition](https://github.com/PacktPublishing/Mastering-Embedded-Linux-Programming-Third-Edition).

## Xây dựng trên một BSP có sẵn

Một layer **Board Support Package** (**BSP**) thêm hỗ trợ cho một thiết bị phần cứng cụ thể hoặc một họ thiết bị vào Yocto. Hỗ trợ này thường bao gồm bootloader, device tree blob, và các kernel driver bổ sung cần để boot Linux trên phần cứng cụ thể đó. Một BSP cũng có thể bao gồm mọi phần mềm user space bổ sung và firmware ngoại vi cần để enable và tận dụng đầy đủ mọi tính năng của phần cứng. Theo quy ước, tên BSP layer bắt đầu bằng prefix `meta-`, theo sau là tên machine. Tìm BSP tốt nhất cho thiết bị đích là bước đầu tiên để build một image bootable cho nó bằng Yocto.

OpenEmbedded layer index ([https://layers.openembedded.org/layerindex](https://layers.openembedded.org/layerindex)) là nơi tốt nhất để bắt đầu tìm các BSP chất lượng. Nhà sản xuất board hay silicon vendor của bạn cũng có thể cung cấp BSP layer. Yocto Project cung cấp một BSP cho mọi biến thể của Raspberry Pi. Bạn có thể tìm repository GitHub của BSP layer đó và mọi layer khác được Yocto project chứng thực trong các source repository của Yocto Project ([https://git.yoctoproject.org](https://git.yoctoproject.org)).

### Build một BSP có sẵn

Các bài tập sau giả định bạn đã clone hoặc giải nén bản phát hành Dunfell của Yocto vào một thư mục tên `poky` trong môi trường host. Trước khi tiếp tục, chúng ta cũng cần clone các layer phụ thuộc sau ở một cấp phía trên thư mục `poky` đó để các thư mục layer và `poky` nằm cạnh nhau:

```
$ git clone -b dunfell git://git.openembedded.org/meta-openembedded
$ git clone -b dunfell git://git.yoctoproject.org/meta-raspberrypi
```

Lưu ý rằng tên nhánh của các layer phụ thuộc khớp với bản phát hành Yocto để bảo đảm tương thích. Giữ cả ba bản clone cập nhật và đồng bộ với remote bằng các lệnh `git pull` định kỳ. Layer `meta-raspberrypi` là BSP cho mọi Raspberry Pi. Khi các phụ thuộc này đã sẵn sàng, bạn có thể build một image được tùy biến cho Raspberry Pi 4. Nhưng trước khi làm vậy, hãy khám phá các recipe cho các image generic của Yocto:

1. Đầu tiên, điều hướng tới thư mục nơi bạn đã clone Yocto:

   ```
   $ cd poky
   ```

2. Tiếp theo, đi xuống thư mục chứa các recipe cho các image tiêu chuẩn:

   ```
   $ cd meta/recipes-core/images
   ```

3. Liệt kê các recipe core image:

   ```
   $ ls -1 core*
   core-image-base.bb
   core-image-minimal.bb
   core-image-minimal-dev.bb
   core-image-minimal-initramfs.bb
   core-image-minimal-mtdutils.bb
   core-image-tiny-initramfs.bb
   ```

4. Hiển thị recipe `core-image-base`:

   ```
   $ cat core-image-base.bb
   SUMMARY = "A console-only image that fully supports the target device \
   hardware."

   IMAGE_FEATURES += "splash"

   LICENSE = "MIT"

   inherit core-image
   ```

   Lưu ý rằng recipe này kế thừa từ `core-image`, vì vậy nó import nội dung của `core-image.bbclass`, thứ chúng ta sẽ xem ở phần sau.

5. Hiển thị recipe `core-image-minimal`:

   ```
   $ cat core-image-minimal.bb
   SUMMARY = "A small image just capable of allowing a device to boot."
   IMAGE_INSTALL = "packagegroup-core-boot ${CORE_IMAGE_EXTRA_INSTALL}"
   IMAGE_LINGUAS = " "
   LICENSE = "MIT"
   inherit core-image
   IMAGE_ROOTFS_SIZE ?= "8192"
   IMAGE_ROOTFS_EXTRA_SPACE_append = "${@bb.utils.contains("DISTRO_FEATURES", "systemd", " + 4096", "" ,d)}"
   ```

   Giống `core-image-base`, recipe này cũng kế thừa từ class file `core-image`.

6. Hiển thị recipe `core-image-minimal-dev`:

   ```
   $ cat core-image-minimal-dev.bb
   require core-image-minimal.bb
   DESCRIPTION = "A small image just capable of allowing a device to boot and \
   is suitable for development work."
   IMAGE_FEATURES += "dev-pkgs"
   ```

   Lưu ý rằng recipe này require recipe `core-image-minimal` từ bước trước. Nhớ rằng directive `require` hoạt động gần giống `include`. Ngoài ra, lưu ý rằng `dev-pkgs` được nối vào danh sách `IMAGE_FEATURES`.

7. Đi lên thư mục `classes` dưới `poky/meta`:

   ```
   $ cd ../../classes
   ```

8. Cuối cùng, hiển thị class file `core-image`:

   ```
   $ cat core-image.bbclass
   ```

   Lưu ý danh sách dài các `IMAGE_FEATURES` có sẵn ở đầu class file này, bao gồm tính năng `dev-pkgs` đã nhắc ở trên.

Các image tiêu chuẩn như `core-image-minimal` và `core-image-minimal-dev` là machine-agnostic. Trong [*Chương 6*](ch06_selecting_a_build_system.vi.md), *Chọn build system*, chúng ta đã build `core-image-minimal` cho cả trình giả lập QEMU Arm và BeagleBone Black. Chúng ta cũng có thể dễ dàng build một image `core-image-minimal` cho Raspberry Pi 4. Ngược lại, một BSP layer bao gồm các image recipe dành cho một board hay một loạt board cụ thể.

Bây giờ, hãy xem recipe `rpi-test-image` bên trong BSP layer `meta-raspberrypi`, để thấy hỗ trợ cho Wi-Fi và Bluetooth được thêm vào `core-image-base` cho Raspberry Pi 4 như thế nào:

1. Đầu tiên, điều hướng tới một cấp phía trên thư mục nơi bạn đã clone Yocto:

   ```
   $ cd ../../..
   ```

2. Tiếp theo, đi xuống thư mục bên trong BSP layer `meta-raspberrypi`, nơi chứa các image recipe cho Raspberry Pi:

   ```
   $ cd meta-raspberrypi/recipes-core/images
   ```

3. Liệt kê các image recipe của Raspberry Pi:

   ```
   $ ls -1
   rpi-basic-image.bb
   rpi-hwup-image.bb
   rpi-test-image.bb
   ```

4. Hiển thị recipe `rpi-test-image`:

   ```
   $ cat rpi-test-image.bb
   # Base this image on core-image-base
   include recipes-core/images/core-image-base.bb
   COMPATIBLE_MACHINE = "^rpi$"

   IMAGE_INSTALL_append = " packagegroup-rpi-test"
   ```

   Lưu ý rằng biến `IMAGE_INSTALL` đã được ghi đè để nó có thể nối thêm `packagegroup-rpi-test` và đưa các package đó vào image.

5. Điều hướng tới thư mục `packagegroups` bên cạnh, dưới `meta-raspberrypi/recipes-core`:

   ```
   $ cd ../packagegroups
   ```

6. Cuối cùng, hiển thị recipe `packagegroup-rpi-test`:

   ```
   $ cat packagegroup-rpi-test.bb
   DESCRIPTION = "RaspberryPi Test Packagegroup"
   LICENSE = "MIT"
   LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4f302"
   PACKAGE_ARCH = "${MACHINE_ARCH}"
   inherit packagegroup
   COMPATIBLE_MACHINE = "^rpi$"
   OMXPLAYER  = "${@bb.utils.contains('MACHINE_FEATURES', 'vc4graphics', '', 'omxplayer', d)}"

   RDEPENDS_${PN} = "\
       ${OMXPLAYER} \
       bcm2835-tests \
       rpio \
       rpi-gpio \
       pi-blaster \
       python3-rtimu \
       python3-sense-hat \
       connman \
       connman-client \
       wireless-regdb-static \
       bluez5 \
   "
   RRECOMMENDS_${PN} = "\
       ${@bb.utils.contains("BBFILE_COLLECTIONS", "meta-multimedia", "bigbuckbunny-1080p bigbuckbunny-480p bigbuckbunny-720p", "", d)} \
       ${MACHINE_EXTRA_RRECOMMENDS} \
   "
   ```

   Lưu ý rằng các package `connman`, `connman-client` và `bluez5` có trong danh sách phụ thuộc runtime để Wi-Fi và Bluetooth được enable đầy đủ.

Cuối cùng, hãy build `rpi-test-image` cho Raspberry Pi 4:

1. Đầu tiên, điều hướng tới một cấp phía trên thư mục nơi bạn đã clone Yocto:

   ```
   $ cd ../../..
   ```

2. Tiếp theo, thiết lập môi trường làm việc BitBake:

   ```
   $ source poky/oe-init-build-env build-rpi
   ```

   Lệnh này đặt một loạt biến môi trường và đưa bạn vào thư mục `build-rpi` mới được tạo.

3. Sau đó, thêm các layer sau vào image:

   ```
   $ bitbake-layers add-layer ../meta-openembedded/meta-oe
   $ bitbake-layers add-layer ../meta-openembedded/meta-python
   $ bitbake-layers add-layer ../meta-openembedded/meta-networking
   $ bitbake-layers add-layer ../meta-openembedded/meta-multimedia
   $ bitbake-layers add-layer ../meta-raspberrypi
   ```

   Thứ tự thêm các layer này quan trọng vì các layer `meta-networking` và `meta-multimedia` đều phụ thuộc vào layer `meta-python`. Nếu `bitbake-layers add-layer` hoặc `bitbake-layers show-layers` bắt đầu thất bại do lỗi parse, hãy xóa thư mục `build-rpi` và bắt đầu lại bài tập này từ *Bước 1*.

4. Kiểm chứng rằng tất cả các layer cần thiết đã được thêm vào image:

   ```
   $ bitbake-layers show-layers
   ```

   Danh sách phải có tổng cộng tám layer: `meta`, `meta-poky`, `meta-yocto-bsp`, `meta-oe`, `meta-python`, `meta-networking`, `meta-multimedia` và `meta-raspberrypi`.

5. Quan sát các thay đổi mà các lệnh `bitbake-layers add-layer` ở trên đã thực hiện với `bblayers.conf`:

   ```
   $ cat conf/bblayers.conf
   ```

   Cùng tám layer từ bước trước phải được gán cho biến `BBLAYERS`.

6. Liệt kê các machine được BSP layer `meta-raspberrypi` hỗ trợ:

   ```
   $ ls ../meta-raspberrypi/conf/machine
   ```

   Lưu ý rằng có các cấu hình machine `raspberrypi4` và `raspberrypi4-64`.

7. Thêm dòng sau vào file `conf/local.conf`:

   ```
   MACHINE = "raspberrypi4-64"
   ```

   Dòng này ghi đè giá trị mặc định sau trong file `conf/local.conf`:

   ```
   MACHINE ??= "qemux86-64"
   ```

   Đặt biến `MACHINE` thành `raspberrypi4-64` bảo đảm rằng image chúng ta sắp build hoạt động cho Raspberry Pi 4.

8. Bây giờ, nối `ssh-server-openssh` vào danh sách `EXTRA_IMAGE_FEATURES` trong file `conf/local.conf`:

   ```
   EXTRA_IMAGE_FEATURES ?= "debug-tweaks ssh-server-openssh"
   ```

   Việc này thêm một SSH server vào image để truy cập qua mạng cục bộ.

9. Cuối cùng, build image:

   ```
   $ bitbake rpi-test-image
   ```

   Lần build đầu tiên có thể mất từ vài phút đến vài giờ, tùy theo số CPU core mà môi trường host có. `TARGET_SYS` phải là `aarch64-poky-linux`, còn `MACHINE` phải là `raspberrypi4-64`, vì image này nhắm tới 64-bit cho các core Arm Cortex-A72 trong Pi 4.

Khi image đã build xong, sẽ có một file tên `rpi-test-image-raspberrypi4-64.rootfs.wic.bz2` trong thư mục `tmp/deploy/images/raspberrypi4-64`:

```
$ ls -l tmp/deploy/images/raspberrypi4-64/rpi-test*wic.bz2
```

Lưu ý rằng `rpi-test-image-raspberrypi4-64.rootfs.wic.bz2` là một symbolic link trỏ tới file image thực tế trong cùng thư mục. Một số nguyên biểu thị ngày giờ build được nối vào tên file image trước phần mở rộng `wic.bz2`.

Bây giờ, ghi image đó lên thẻ microSD bằng Etcher và boot nó trên Raspberry Pi 4:

1. Cắm một thẻ microSD vào máy host.
2. Khởi chạy Etcher.
3. Click **Flash from file** từ Etcher.
4. Tìm image `wic.bz2` bạn đã build cho Raspberry Pi 4 và mở nó.
5. Click **Select target** từ Etcher.
6. Chọn thẻ microSD bạn đã cắm ở *Bước 1*.
7. Click **Flash** từ Etcher để ghi image.
8. Rút thẻ microSD ra khi Etcher đã flash xong.
9. Cắm thẻ microSD vào Raspberry Pi 4.
10. Cấp nguồn cho Raspberry Pi 4 qua cổng USB-C của nó.

Xác nhận Pi 4 đã boot thành công bằng cách cắm nó vào Ethernet và quan sát thấy các đèn hoạt động mạng nhấp nháy.

### Điều khiển Wi-Fi

Trong bài tập trước, chúng ta đã build một image bootable cho Raspberry Pi 4 có Ethernet, Wi-Fi và Bluetooth hoạt động. Giờ thiết bị đã boot và kết nối với mạng cục bộ qua Ethernet, hãy kết nối tới một mạng Wi-Fi gần đó. Chúng ta sẽ dùng `connman` cho bài tập này vì đó là thứ layer `meta-raspberrypi` đi kèm sẵn. Các BSP layer khác dựa vào các daemon cấu hình network interface khác như `systemd-networkd` và `NetworkManager`. Làm theo các bước sau:

1. Image chúng ta đã build có hostname là `raspberrypi4-64`, vì vậy bạn sẽ có thể `ssh` vào thiết bị với tư cách `root`:

   ```
   $ ssh root@raspberrypi4-64.local
   ```

   Nhập `yes` khi được hỏi có muốn tiếp tục kết nối không. Bạn sẽ không bị hỏi mật khẩu. Nếu không tìm thấy host nào ở `raspberrypi4-64.local`, hãy dùng một công cụ như `arp-scan` để tìm địa chỉ IP của Raspberry Pi 4 và `ssh` vào địa chỉ đó thay vì dùng hostname.

2. Khi đã vào, kiểm chứng rằng Wi-Fi driver có mặt:

   ```
   root@raspberrypi4-64:~# lsmod | grep 80211
   cfg80211              753664  1 brcmfmac
   rfkill                 32768  6 nfc,bluetooth,cfg80211
   ```

3. Khởi động `connman-client`:

   ```
   root@raspberrypi4-64:~# connmanctl
   connmanctl>
   ```

4. Bật Wi-Fi:

   ```
   connmanctl> enable wifi
   Enabled wifi
   ```

   Bỏ qua `"Error wifi: Already enabled"` nếu Wi-Fi đã bật.

5. Đăng ký `connmanctl` làm connection agent:

   ```
   connmanctl> agent on
   Agent registered
   ```

6. Quét các mạng Wi-Fi:

   ```
   connmanctl> scan wifi
   Scan completed for wifi
   ```

7. Liệt kê tất cả các mạng Wi-Fi có sẵn:

   ```
   connmanctl> services
   *AO Wired                ethernet_dca6320a8ead_cable
       RT-AC66U_B1_38_2G    wifi_dca6320a8eae_52542d41433636555f42315f33385f3247_managed_psk
       RT-AC66U_B1_38_5G    wifi_dca6320a8eae_52542d41433636555f42315f33385f3547_managed_psk
   ```

   `RT-AC66U_B1_38_2G` và `RT-AC66U_B1_38_5G` là SSID mạng Wi-Fi của một router ASUS. Danh sách của bạn sẽ khác. Phần `*AO` trước `Wired` chỉ ra rằng thiết bị hiện đang online qua Ethernet.

8. Kết nối tới một mạng Wi-Fi:

   ```
   connmanctl> connect wifi_dca6320a8eae_52542d41433636555f42315f33385f3547_managed_psk
   Agent RequestInput wifi_dca6320a8eae_52542d41433636555f42315f33385f3547_managed_psk
     Passphrase = [ Type=psk, Requirement=mandatory ]
   Passphrase? somepassword
   Connected wifi_dca6320a8eae_52542d41433636555f42315f33385f3547_managed_psk
   ```

   Thay service identifier sau `connect` bằng service identifier hay mạng đích của bạn từ bước trước. Thay `somepassword` bằng passphrase Wi-Fi của bạn.

9. Liệt kê lại các service:

   ```
   connmanctl> services
   *AO Wired                ethernet_dca6320a8ead_cable
   *AR RT-AC66U_B1_38_5G    wifi_dca6320a8eae_52542d41433636555f42315f33385f3547_managed_psk
       RT-AC66U_B1_38_2G    wifi_dca6320a8eae_52542d41433636555f42315f33385f3247_managed_psk
   ```

   Lần này, `*AR` xuất hiện trước SSID bạn vừa kết nối, chỉ ra rằng kết nối mạng này đã sẵn sàng. Ethernet được ưu tiên hơn Wi-Fi, vì vậy thiết bị vẫn online qua `Wired`.

10. Thoát `connman-client`:

    ```
    connmanctl> quit
    ```

11. Rút Raspberry Pi 4 khỏi Ethernet, nhờ đó đóng phiên `ssh`:

    ```
    root@raspberrypi4-64:~# client_loop: send disconnect: Broken pipe
    ```

12. Kết nối lại tới Raspberry Pi 4:

    ```
    $ ssh root@raspberrypi4-64.local
    ```

13. Khởi động lại `connman-client`:

    ```
    root@raspberrypi4-64:~# connmanctl
    connmanctl>
    ```

14. Liệt kê lại các service:

    ```
    connmanctl> services
    *AO RT-AC66U_B1_38_5G    wifi_dca6320a8eae_52542d41433636555f42315f33385f3547_managed_psk
    ```

    Hãy để ý rằng kết nối `Wired` giờ đã biến mất và SSID Wi-Fi bạn đã kết nối, trước đó ở trạng thái ready, giờ đã được nâng lên online.

Daemon `connman` lưu thông tin xác thực Wi-Fi vào một thư mục profile mạng dưới `/var/lib/connman`, thư mục này được giữ lại trên thẻ microSD. Điều này có nghĩa là `connman` sẽ tự động kết nối lại mạng Wi-Fi khi Raspberry Pi 4 boot. Không cần lặp lại các bước này sau khi tắt bật nguồn. Bạn có thể để Ethernet không cắm nếu muốn.

### Điều khiển Bluetooth

Ngoài các package `connman` và `connman-client`, layer `meta-raspberrypi` bao gồm `bluez5` làm Bluetooth stack. Tất cả các package này, cũng như các driver Bluetooth cần thiết, đều có trong `rpi-test-image`, image mà chúng ta đã build cho Raspberry Pi 4. Hãy cho Bluetooth chạy và thử ghép đôi nó với một thiết bị khác:

1. Cấp nguồn cho Raspberry Pi 4 và `ssh` vào:

   ```
   $ ssh root@raspberrypi4-64.local
   ```

2. Tiếp theo, kiểm chứng rằng các driver Bluetooth có mặt:

   ```
   root@raspberrypi4-64:~# lsmod | grep bluetooth
   bluetooth             438272  9 bnep
   ecdh_generic           24576  1 bluetooth
   rfkill                 32768  6 nfc,bluetooth,cfg80211
   ```

3. Khởi tạo driver HCI UART cho kết nối Bluetooth:

   ```
   root@raspberrypi4-64:~# btuart
   bcm43xx_init
   Flash firmware /lib/firmware/brcm/BCM4345C0.hcd
   Set Controller UART speed to 3000000 bit/s
   Device setup complete
   ```

4. Khởi động `connman-client`:

   ```
   root@raspberrypi4-64:~# connmanctl
   connmanctl>
   ```

5. Bật Bluetooth:

   ```
   connmanctl> enable bluetooth
   Enabled Bluetooth
   ```

   Bỏ qua `"Error bluetooth: Already enabled"` nếu Bluetooth đã bật.

6. Thoát `connman-client`:

   ```
   connmanctl> quit
   ```

7. Khởi động Bluetooth CLI:

   ```
   root@raspberrypi4-64:~# bluetoothctl
   Agent registered
   [CHG] Controller DC:A6:32:0A:8E:AF Pairable: yes
   ```

8. Yêu cầu default agent:

   ```
   [bluetooth]# default-agent
   Default agent request successful
   ```

9. Bật nguồn controller:

   ```
   [bluetooth]# power on
   Changing power on succeeded
   ```

10. Hiển thị thông tin về controller:

    ```
    [bluetooth]# show
    Controller DC:A6:32:0A:8E:AF (public)
    Name: BlueZ 5.55
    Alias: BlueZ 5.55
    Class: 0x00200000
    Powered: yes
    Discoverable: no
    DiscoverableTimeout: 0x000000b4
    Pairable: yes
    ```

11. Bắt đầu quét các thiết bị Bluetooth:

    ```
    [bluetooth]# scan on
    Discovery started
    [CHG] Controller DC:A6:32:0A:8E:AF Discovering: yes
    …
    [NEW] Device DC:08:0F:03:52:CD Frank's iPhone
    …
    ```

    Nếu smartphone của bạn ở gần và đã bật Bluetooth, nó sẽ xuất hiện trong danh sách dưới dạng thiết bị `[NEW]`. Phần `DC:08:0F:03:52:CD` cạnh `Frank's iPhone` là địa chỉ MAC Bluetooth của smartphone của tôi.

12. Dừng quét các thiết bị Bluetooth:

    ```
    [bluetooth]# scan off
    …
    [CHG] Controller DC:A6:32:0A:8E:AF Discovering: no
    Discovery stopped
    ```

13. Nếu bạn có iPhone đang mở, vào **Bluetooth** trong **Settings** để có thể chấp nhận yêu cầu ghép đôi từ Raspberry Pi 4.

14. Thử ghép đôi với smartphone:

    ```
    [bluetooth]# pair DC:08:0F:03:52:CD
    Attempting to pair with DC:08:0F:03:52:CD
    [CHG] Device DC:08:0F:03:52:CD Connected: yes
    Request confirmation
    [agent] Confirm passkey 936359 (yes/no):
    ```

    Thay `DC:08:0F:03:52:CD` bằng địa chỉ MAC Bluetooth của smartphone của bạn.

15. Trước khi nhập `yes`, chấp nhận yêu cầu ghép đôi từ smartphone:

    ![](images/B11566_07_01.jpg)

    *Hình 7.1 – Yêu cầu ghép đôi Bluetooth*

16. Nhập `yes` để xác nhận passkey:

    ```
    [agent] Confirm passkey 936359 (yes/no): yes
    [CHG] Device DC:08:0F:03:52:CD ServicesResolved: yes
    [CHG] Device DC:08:0F:03:52:CD Paired: yes
    Pairing successful
    [CHG] Device DC:08:0F:03:52:CD ServicesResolved: no
    [CHG] Device DC:08:0F:03:52:CD Connected: no
    ```

17. Kết nối tới smartphone:

    ```
    [bluetooth]# connect DC:08:0F:03:52:CD
    Attempting to connect to DC:08:0F:03:52:CD
    [CHG] Device DC:08:0F:03:52:CD Connected: yes
    Connection successful
    [CHG] Device DC:08:0F:03:52:CD ServicesResolved: yes
    Authorize service
    ```

    Một lần nữa, thay `DC:08:0F:03:52:CD` bằng địa chỉ MAC Bluetooth của smartphone của bạn.

18. Khi được yêu cầu cấp quyền cho service, nhập `yes`:

    ```
    [agent] Authorize service 0000110e-0000-1000-8000-00805f9b34fb (yes/no): yes
    [Frank's iPhone]#
    ```

Raspberry Pi 4 giờ đã được ghép đôi và kết nối với smartphone qua Bluetooth. Nó sẽ xuất hiện trong danh sách thiết bị Bluetooth của smartphone dưới tên **BlueZ 5.55**. Chương trình `bluetoothctl` có rất nhiều lệnh và submenu. Chúng ta mới chỉ chạm vào bề mặt. Tôi khuyên bạn nhập `help` và xem kỹ self-documentation để có ý niệm về những gì bạn có thể làm từ command line. Giống `connman`, Bluetooth stack **BlueZ** là một D-Bus service, vì vậy bạn có thể giao tiếp với nó bằng lập trình qua D-Bus từ Python hay các ngôn ngữ lập trình high-level khác dùng D-Bus binding.

### Thêm một layer tùy biến

Nếu bạn đang dùng Raspberry Pi 4 để làm prototype cho một sản phẩm mới, thì bạn có thể nhanh chóng tạo các image tùy biến của riêng mình bằng cách thêm package vào danh sách được gán cho biến `IMAGE_INSTALL_append` trong `conf/local.conf`. Dù kỹ thuật đơn giản này hoạt động, đến một lúc nào đó, bạn sẽ muốn bắt đầu phát triển ứng dụng nhúng của riêng mình. Làm sao build phần mềm bổ sung này để có thể đưa nó vào các image tùy biến? Câu trả lời là bạn phải tạo một layer tùy biến với một recipe mới để build phần mềm. Hãy bắt đầu:

1. Đầu tiên, điều hướng tới một cấp phía trên thư mục nơi bạn đã clone Yocto.

2. Tiếp theo, thiết lập môi trường làm việc BitBake:

   ```
   $ source poky/oe-init-build-env build-rpi
   ```

   Lệnh này đặt một loạt biến môi trường và đưa bạn trở lại thư mục `build-rpi`.

3. Tạo một layer mới cho application:

   ```
   $ bitbake-layers create-layer ../meta-gattd
   NOTE: Starting bitbake server...
   Add your new layer with 'bitbake-layers add-layer ../meta-gattd'
   ```

   Layer này có tên `meta-gattd` cho GATT daemon. Đặt tên layer tùy ý, nhưng hãy tuân theo quy ước prefix `meta-`.

4. Đi lên thư mục layer mới:

   ```
   $ cd ../meta-gattd
   ```

5. Xem cấu trúc file của layer:

   ```
   $ tree
   .
   ├── conf
   │   └── layer.conf
   ├── COPYING.MIT
   ├── README
   └── recipes-example
       └── example
           └── example_0.1.bb
   ```

6. Đổi tên thư mục `recipes-examples`:

   ```
   $ mv recipes-example recipes-gattd
   ```

7. Đổi tên thư mục `example`:

   ```
   $ cd recipes-gattd
   $ mv example gattd
   ```

8. Đổi tên file recipe `example`:

   ```
   $ cd gattd
   $ mv example_0.1.bb gattd_0.1.bb
   ```

9. Hiển thị file recipe đã đổi tên:

   ```
   $ cat gattd_0.1.bb
   ```

   Bạn sẽ muốn điền vào recipe này metadata cần để build phần mềm, bao gồm `SRC_URI` và các checksum `md5`.

10. Hiện tại, chỉ cần thay `gattd_0.1.bb` bằng recipe hoàn chỉnh mà tôi đã cung cấp cho bạn ở `MELP/Chapter07/meta-gattd/recipes-gattd/gattd_0.1.bb`.

11. Tạo một repository Git cho layer mới và push nó lên GitHub.

Giờ chúng ta đã có một layer tùy biến cho application, hãy thêm nó vào image làm việc:

1. Đầu tiên, điều hướng tới một cấp phía trên thư mục nơi bạn đã clone Yocto:

   ```
   $ cd ../../..
   ```

2. Clone layer của bạn hoặc layer `meta-gattd` của tôi từ GitHub:

   ```
   $ git clone https://github.com/fvasquez/meta-gattd.git
   ```

   Thay `fvasquez` bằng username GitHub của bạn và `meta-gattd` bằng tên repo layer của bạn.

3. Tiếp theo, thiết lập môi trường làm việc BitBake:

   ```
   $ source poky/oe-init-build-env build-rpi
   ```

   Lệnh này đặt một loạt biến môi trường và đưa bạn trở lại thư mục `build-rpi`.

4. Sau đó, thêm layer vừa clone vào image:

   ```
   $ bitbake-layers add-layer ../meta-gattd
   ```

   Thay `meta-gattd` bằng tên layer của bạn.

5. Kiểm chứng rằng tất cả các layer cần thiết đã được thêm vào image:

   ```
   $ bitbake-layers show-layers
   ```

   Danh sách phải có tổng cộng chín layer, bao gồm layer mới của bạn.

6. Bây giờ, thêm package bổ sung vào file `conf/local.conf`:

   ```
   CORE_IMAGE_EXTRA_INSTALL += "gattd"
   ```

   `CORE_IMAGE_EXTRA_INSTALL` là một biến tiện dụng được dùng để thêm package bổ sung vào một image kế thừa từ class `core-image`, như `rpi-test-image`. `IMAGE_INSTALL` là biến điều khiển những package nào được đưa vào bất kỳ image nào. Chúng ta không thể dùng `IMAGE_INSTALL += "gattd"` trong `conf/local.conf` vì nó thay thế phép gán lazy mặc định được thực hiện trong `core-image.bbclass`. Hãy dùng `IMAGE_INSTALL_append = " gattd"` hoặc `CORE_IMAGE_EXTRA_INSTALL += " gattd"` thay thế.

7. Cuối cùng, build lại image:

   ```
   $ bitbake rpi-test-image
   ```

Nếu phần mềm của bạn build và cài thành công, nó sẽ có trong image `rpi-test-image-raspberrypi4-64.rootfs.wic.bz2` hoàn chỉnh. Ghi image đó lên thẻ microSD và boot nó trên Raspberry Pi 4 để kiểm tra.

Thêm package vào `conf/local.conf` hợp lý trong những giai đoạn phát triển sớm nhất. Khi bạn sẵn sàng chia sẻ thành quả lao động với phần còn lại của nhóm, bạn nên tạo một image recipe và đặt package vào đó. Ở cuối chương trước, chúng ta đã đi trọn con đường và viết một recipe `nova-image` để thêm package `helloworld` vào `core-image-minimal`.

Giờ chúng ta đã dành khá nhiều thời gian test các image mới build trên phần cứng thật, đã đến lúc quay lại với phần mềm. Trong mục tiếp theo, chúng ta sẽ xem một công cụ được thiết kế để hợp lý hóa chu kỳ biên dịch, test và debug tẻ nhạt mà chúng ta đã quen khi phát triển phần mềm nhúng.

## Ghi lại thay đổi với devtool

Ở chương trước, bạn đã học cách tạo một recipe cho chương trình `helloworld` từ đầu. Cách tiếp cận copy-paste để đóng gói recipe có thể hiệu quả ban đầu, nhưng nó sẽ sớm trở nên rất khó chịu khi project lớn lên và số recipe bạn cần bảo trì tăng lên. Tôi ở đây để chỉ cho bạn một cách tốt hơn để làm việc với package recipe – cả recipe của bạn và các recipe được bên thứ ba đóng góp lên upstream. Nó được gọi là `devtool` và nó là nền tảng của extensible SDK của Yocto.

### Workflow phát triển

Trước khi bắt đầu với `devtool`, bạn cần bảo đảm mình làm việc trong một layer mới thay vì sửa recipe in-tree. Nếu không, bạn có thể dễ dàng ghi đè và mất hàng giờ liền công sức:

1. Đầu tiên, điều hướng tới một cấp phía trên thư mục nơi bạn đã clone Yocto.

2. Tiếp theo, thiết lập môi trường làm việc BitBake:

   ```
   $ source poky/oe-init-build-env build-mine
   ```

   Lệnh này đặt một loạt biến môi trường và đưa bạn vào thư mục `build-mine` mới.

3. Đặt `MACHINE` trong `conf/local.conf` cho Arm 64-bit:

   ```
   MACHINE ?= "quemuarm64"
   ```

4. Tạo layer mới:

   ```
   $ bitbake-layers create-layer ../meta-mine
   ```

5. Bây giờ, thêm layer mới:

   ```
   $ bitbake-layers add-layer ../meta-mine
   ```

6. Kiểm tra rằng layer mới đã được tạo ở nơi bạn muốn:

   ```
   $ bitbake-layers show-layers
   ```

   Danh sách phải có tổng cộng bốn layer; tức là `meta`, `meta-poky`, `meta-yocto-bsp` và `meta-mine`.

Để có trải nghiệm first-hand với các workflow phát triển, bạn sẽ cần một target để triển khai. Điều đó có nghĩa là build một image:

```
$ devtool build-image core-image-full-cmdline
```

Build một image đầy đủ mất vài giờ ở lần đầu. Khi xong, hãy boot nó:

```
$ runqemu qemuarm64 nographic
[…]
Poky (Yocto Project Reference Distro) 3.1.6 qemuarm64 ttyAMA0
qemuarm64 login: root
root@qemuarm64:~#
```

Bằng cách chỉ định tùy chọn `nographic`, chúng ta có thể chạy QEMU trực tiếp trong một shell riêng. Điều này giúp gõ phím dễ hơn so với phải xử lý output đồ họa được giả lập. Đăng nhập bằng `root`. Không có mật khẩu. Để thoát QEMU khi chạy ở chế độ `nographic`, nhập *Ctrl + A*, theo sau là `x`, vào shell của target. Tạm để QEMU chạy vì chúng ta cần nó cho các bài tập tiếp theo. Bạn có thể SSH vào VM này bằng `ssh root@192.168.7.2`.

`devtool` hỗ trợ ba workflow phát triển phổ biến:

- Thêm một recipe mới.
- Patch source được build bởi một recipe có sẵn.
- Nâng cấp một recipe để lấy phiên bản mới hơn của source upstream.

Khi bạn khởi động bất kỳ workflow nào trong số này, `devtool` tạo một workspace tạm để bạn thực hiện thay đổi. Sandbox này chứa các file recipe và source đã fetch. Khi bạn làm xong, `devtool` tích hợp thay đổi của bạn trở lại layer để workspace có thể bị hủy.

### Tạo một recipe mới

Giả sử có một phần mềm open source bạn muốn dùng mà chưa ai gửi BitBake recipe cho nó. Và giả sử phần mềm đó là container runtime nhẹ `bubblewrap`. Trong trường hợp này, bạn có thể tải một source tarball release của `bubblewrap` từ GitHub và tạo một recipe cho nó. Đó chính xác là điều `devtool add` làm.

Đầu tiên, `devtool add` tạo một workspace với repository Git cục bộ riêng. Bên trong thư mục workspace mới này, nó tạo một thư mục `recipes/bubblewrap` và giải nén nội dung tarball vào thư mục `sources/bubblewrap`. `devtool` biết các build system phổ biến như Autotools và CMake và sẽ cố hết sức tìm ra đây là loại project gì (Autotools, trong trường hợp `bubblewrap`). Sau đó nó dùng metadata đã parse và dữ liệu package đã build được cache từ các lần build BitBake trước để tìm ra giá trị của `DEPENDS` và `RDEPENDS`, cũng như những file cần inherit và require. Hãy bắt đầu:

1. Đầu tiên, mở một shell khác và điều hướng tới một cấp phía trên thư mục nơi bạn đã clone Yocto.

2. Tiếp theo, thiết lập môi trường BitBake:

   ```
   $ source poky/oe-init-build-env build-mine
   ```

   Lệnh này đặt một loạt biến môi trường và đưa bạn trở lại thư mục làm việc `build-mine`.

3. Sau đó, chạy `devtool add` với URL của source tarball release:

   ```
   $ devtool add https://github.com/containers/bubblewrap/releases/download/v0.4.1/bubblewrap-0.4.1.tar.xz
   ```

   Nếu mọi thứ diễn ra theo kế hoạch, `devtool add` sẽ tạo một recipe mà sau đó bạn có thể build.

4. Trước khi build recipe mới, hãy xem nó:

   ```
   $ devtool edit-recipe bubblewrap
   ```

   `devtool` sẽ mở `recipes/bubblewrap/bubblewrap_0.4.1.bb` trong một trình soạn thảo. Lưu ý rằng `devtool` đã điền sẵn các checksum `md5` cho bạn.

5. Thêm dòng này vào cuối `bubblewrap_0.4.1.bb`:

   ```
   FILES_${PN} += "/usr/share/*"
   ```

   Sửa mọi lỗi hiển nhiên, lưu thay đổi, và thoát trình soạn thảo.

6. Để build recipe mới, dùng lệnh sau:

   ```
   $ devtool build bubblewrap
   ```

7. Tiếp theo, triển khai file thực thi `bwrap` đã biên dịch lên trình giả lập target:

   ```
   $ devtool deploy-target bubblewrap root@192.168.7.2
   ```

   Lệnh này cài các build artifact cần thiết lên trình giả lập target.

8. Từ shell QEMU, chạy file thực thi `bwrap` mà bạn vừa build và triển khai:

   ```
   root@qemuarm64:~# bwrap --help
   ```

   Nếu bạn thấy một loạt self-documentation liên quan đến `bubblewrap`, thì việc build và triển khai đã thành công. Nếu không, hãy dùng `devtool` để lặp lại các bước sửa, build và triển khai cho đến khi bạn tin chắc `bubblewrap` hoạt động.

9. Khi đã hài lòng, dọn dẹp trình giả lập target:

   ```
   $ devtool undeploy-target bubblewrap root@192.168.7.2
   ```

10. Merge toàn bộ công việc trở lại layer của bạn:

    ```
    $ devtool finish -f bubblewrap ../meta-mine
    ```

11. Xóa các source còn sót lại khỏi workspace:

    ```
    $ rm -rf workspace/sources/bubblewrap
    ```

Nếu bạn nghĩ người khác có thể hưởng lợi từ recipe mới của bạn, hãy gửi một patch cho Yocto.

### Sửa source được build bởi một recipe

Giả sử bạn tìm thấy một bug trong **jq**, một JSON preprocessor command-line. Bạn tìm trong repository Git tại [https://github.com/stedolan/jq](https://github.com/stedolan/jq) và thấy rằng chưa ai báo cáo vấn đề này. Sau đó, bạn xem source code. Hóa ra bản sửa chỉ cần vài thay đổi code nhỏ, vì vậy bạn quyết định tự patch `jq`. Đó là lúc `devtool modify` phát huy tác dụng.

Lần này, khi `devtool` xem metadata đã cache của Yocto, nó thấy rằng đã có recipe cho `jq`. Giống `devtool add`, `devtool modify` tạo một workspace tạm mới với repository Git cục bộ riêng, nơi nó sao chép các file recipe và giải nén source upstream. `jq` được viết bằng C và nằm trong một layer OpenEmbedded có sẵn tên `meta-oe`. Chúng ta cần thêm layer này, cũng như các phụ thuộc của `jq`, vào image làm việc trước khi có thể sửa source của package:

1. Đầu tiên, xóa vài layer khỏi môi trường `build-mine`:

   ```
   $ bitbake-layers remove-layer workspace
   $ bitbake-layers remove-layer meta-mine
   ```

2. Tiếp theo, clone repository `meta-openembedded` từ GitHub:

   ```
   $ git clone -b dunfell https://github.com/openembedded/meta-openembedded.git ../meta-openembedded
   ```

3. Sau đó, thêm các layer `meta-oe` và `meta-mine` vào image:

   ```
   $ bitbake-layers add-layer ../meta-openembedded/meta-oe
   $ bitbake-layers add-layer ../meta-mine
   ```

4. Kiểm chứng rằng tất cả các layer cần thiết đã được thêm vào image:

   ```
   $ bitbake-layers show-layers
   ```

   Danh sách phải có tổng cộng năm layer; tức là `meta`, `meta-poky`, `meta-yocto-bsp`, `meta-oe` và `meta-mine`.

5. Thêm dòng sau vào `conf/local.conf` vì package `onig` là một phụ thuộc runtime của `jq`:

   ```
   IMAGE_INSTALL_append = " onig"
   ```

6. Build lại image:

   ```
   $ devtool build-image core-image-full-cmdline
   ```

7. Thoát QEMU bằng *Ctrl + A* và `x` từ shell kia và khởi động lại trình giả lập:

   ```
   $ runqemu qemuarm64 nographic
   ```

Giống nhiều công cụ patch khác, `devtool modify` dùng commit message của bạn để tạo tên file patch, vì vậy hãy giữ commit message ngắn gọn và có ý nghĩa. Nó cũng tự động tạo chính các file patch dựa trên lịch sử Git và tạo một file `.bbappend` với các tên file patch mới. Hãy nhớ prune và squash các commit Git để `devtool` chia công việc của bạn thành các file patch hợp lý:

1. Chạy `devtool modify` với tên package bạn muốn sửa:

   ```
   $ devtool modify jq
   ```

2. Thực hiện thay đổi code bằng trình soạn thảo ưa thích. Dùng workflow add và commit Git tiêu chuẩn để theo dõi những gì bạn đã làm.

3. Build source đã sửa bằng lệnh sau:

   ```
   $ devtool build jq
   ```

4. Tiếp theo, triển khai file thực thi `jq` đã biên dịch lên trình giả lập target:

   ```
   $ devtool deploy-target jq root@192.168.7.2
   ```

   Lệnh này cài các build artifact cần thiết lên trình giả lập target.

   Nếu kết nối thất bại, hãy xóa key cũ của trình giả lập, như được thể hiện ở đây:

   ```
   $ ssh-keygen -f "/home/frank/.ssh/known_hosts" \
   -R "192.168.7.2"
   ```

   Thay `frank` bằng username của bạn trong đường dẫn.

5. Từ shell QEMU, chạy file thực thi `jq` mà bạn vừa build và triển khai. Nếu bạn không còn tái hiện được bug, thì thay đổi đã có tác dụng. Nếu không, lặp lại các bước sửa, build và triển khai cho đến khi hài lòng.

6. Khi đã hài lòng, dọn dẹp trình giả lập target:

   ```
   $ devtool undeploy-target jq root@192.168.7.2
   ```

7. Merge toàn bộ công việc trở lại layer của bạn:

   ```
   $ devtool finish jq ../meta-mine
   ```

   Nếu merge thất bại vì cây source Git đang dirty, hãy xóa hoặc unstage mọi build artifact `jq` còn sót và thử lại `devtool finish`.

8. Xóa các source còn sót lại khỏi workspace:

   ```
   $ rm -rf workspace/sources/jq
   ```

Nếu bạn nghĩ người khác có thể hưởng lợi từ (các) patch của bạn, hãy gửi chúng cho các maintainer của project upstream.

### Nâng cấp một recipe lên phiên bản mới hơn

Giả sử bạn đang chạy một web server Flask trên thiết bị đích và một phiên bản Flask mới vừa được phát hành. Phiên bản Flask mới nhất này có một tính năng mới mà bạn nóng lòng muốn dùng. Thay vì chờ các maintainer recipe Flask nâng cấp lên phiên bản mới, bạn quyết định tự nâng cấp recipe. Bạn có thể nghĩ việc đó dễ như tăng số phiên bản trong file recipe, nhưng còn có các checksum `md5` liên quan. Thật tuyệt nếu quá trình tẻ nhạt này có thể được tự động hóa hoàn toàn đúng không? Đoán xem `devtool upgrade` để làm gì?

**Flask** là một thư viện Python 3, vì vậy image của bạn cần có Python 3, Flask và các phụ thuộc của Flask trước khi có thể nâng cấp nó. Để có tất cả những thứ đó, làm theo các bước sau:

1. Đầu tiên, xóa vài layer khỏi môi trường `build-mine`:

   ```
   $ bitbake-layers remove-layer workspace
   $ bitbake-layers remove-layer meta-mine
   ```

2. Tiếp theo, thêm các layer `meta-python` và `meta-mine` vào image:

   ```
   $ bitbake-layers add-layer ../meta-openembedded/meta-python
   $ bitbake-layers add-layer ../meta-mine
   ```

3. Kiểm chứng rằng tất cả các layer cần thiết đã được thêm vào image:

   ```
   $ bitbake-layers show-layers
   ```

   Danh sách phải có tổng cộng sáu layer; tức là `meta`, `meta-poky`, `meta-yocto-bsp`, `meta-oe`, `meta-python` và `meta-mine`.

4. Bây giờ, sẽ có rất nhiều module Python có sẵn để bạn dùng:

   ```
   $ bitbake -s | grep ^python3
   ```

   Một trong các module đó là `python3-flask`.

5. Hãy bảo đảm `python3` và `python3-flask` đang được build và cài trên image bằng cách tìm cả hai trong `conf/local.conf`. Nếu chúng không có ở đó, bạn có thể thêm cả hai bằng cách thêm dòng sau vào `conf/local.conf`:

   ```
   IMAGE_INSTALL_append = " python3 python3-flask"
   ```

6. Build lại image:

   ```
   $ devtool build-image core-image-full-cmdline
   ```

7. Thoát QEMU bằng *Ctrl + A* và `x` từ shell kia và khởi động lại trình giả lập:

   ```
   $ runqemu qemuarm64 nographic
   ```

   > **Lưu ý quan trọng**
   >
   > Tại thời điểm viết, phiên bản Flask đi kèm `meta-python` là 1.1.1 và phiên bản Flask mới nhất có trên PyPI là 1.1.2.

Giờ mọi mảnh ghép đã sẵn sàng, hãy nâng cấp:

1. Đầu tiên, chạy `devtool upgrade` với tên package và phiên bản đích cần nâng cấp lên:

   ```
   $ devtool upgrade python3-flask --version 1.1.2
   ```

2. Trước khi build recipe đã nâng cấp, hãy xem nó:

   ```
   $ devtool edit-recipe python3-flask
   ```

   `devtool` sẽ mở `recipes/python3/python3-flask_1.1.2.bb` trong một trình soạn thảo:

   ```
   inherit pypi setuptools3
   require python-flask.inc
   ```

   Không có gì version-specific cần thay đổi trong recipe này, vì vậy hãy lưu file mới và thoát trình soạn thảo.

3. Để build recipe mới, dùng lệnh này:

   ```
   $ devtool build python3-flask
   ```

4. Tiếp theo, triển khai module Flask mới lên trình giả lập target:

   ```
   $ devtool deploy-target python3-flask root@192.168.7.2
   ```

   Lệnh này cài các build artifact cần thiết lên trình giả lập target.

   Nếu kết nối thất bại, hãy xóa key cũ của trình giả lập, như được thể hiện ở đây:

   ```
   $ ssh-keygen -f "/home/frank/.ssh/known_hosts" \
   -R "192.168.7.2"
   ```

   Thay `frank` bằng username của bạn trong đường dẫn.

5. Từ shell QEMU, khởi chạy một REPL `python3` và kiểm tra phiên bản Flask nào đã được triển khai:

   ```
   root@qemuarm64:~# python3
   >>> import flask
   >>> flask.__version__
   '1.1.2'
   >>>
   ```

   Nếu nhập `flask.__version__` trong REPL trả về `'1.1.2'`, thì việc nâng cấp đã thành công. Nếu không, hãy dùng `devtool` để lặp lại các bước sửa, build và triển khai cho đến khi tìm ra điều gì sai.

6. Khi đã hài lòng, dọn dẹp trình giả lập target:

   ```
   $ devtool undeploy-target python3-flask root@192.168.7.2
   ```

7. Merge toàn bộ công việc trở lại layer của bạn:

   ```
   $ devtool finish python3-flask ../meta-mine
   ```

   Nếu merge thất bại vì cây source Git đang dirty, hãy xóa hoặc unstage mọi build artifact `python3-flask` còn sót và thử lại `devtool finish`.

8. Xóa các source còn sót lại khỏi workspace:

   ```
   $ rm -rf workspace/sources/python3-flask
   ```

Nếu bạn nghĩ người khác cũng có thể nóng lòng nâng cấp distro của họ lên phiên bản mới nhất của một package, hãy gửi một patch cho Yocto.

Cuối cùng, chúng ta đã đến với chủ đề cách build distro của riêng mình. Tính năng này là độc nhất của Yocto và rõ ràng không có trong Buildroot. Một **distro layer** là một abstraction mạnh mẽ có thể được chia sẻ giữa nhiều project nhắm tới các phần cứng khác nhau.

## Build distro của riêng bạn

Ở đầu chương trước, tôi đã nói với bạn rằng Yocto cho bạn khả năng build bản phân phối Linux tùy biến của riêng mình. Việc này được làm qua một distro layer như meta-poky. Như chúng ta đã thấy, bạn không cần distro layer riêng để build các image tùy biến của riêng mình. Bạn có thể đi rất xa mà không bao giờ phải sửa metadata phân phối nào của Poky. Nhưng nếu bạn muốn thay đổi chính sách distro (chẳng hạn tính năng, bản hiện thực C library, lựa chọn package manager, v.v.), thì bạn có thể chọn build distro của riêng mình.

Build distro của riêng bạn là một quá trình three-step:

1. Tạo một distro layer mới.
2. Tạo một file cấu hình distro.
3. Thêm recipe vào distro.

Nhưng trước khi đi vào chi tiết kỹ thuật về cách làm điều đó, hãy cân nhắc khi nào là lúc thích hợp để tự làm distro của riêng bạn.

### Khi nào nên và khi nào không nên

Thiết lập distro định nghĩa định dạng package (`rpm`, `deb` hoặc `ipk`), package feed, hệ thống `init` (`systemd` hoặc `sysvinit`), và các phiên bản package cụ thể. Bạn có thể tạo distro của riêng mình trong một layer mới bằng cách kế thừa từ Poky và ghi đè những gì cần thay đổi cho distro. Tuy nhiên, nếu bạn thấy mình thêm rất nhiều giá trị vào file `local.conf` của thư mục build ngoài các thiết lập cục bộ hiển nhiên (chẳng hạn đường dẫn tương đối), thì có lẽ đã đến lúc tạo distro của riêng bạn từ đầu.

### Tạo một distro layer mới

Bạn đã biết cách tạo một layer. Tạo một distro layer cũng không khác gì. Hãy bắt đầu:

1. Đầu tiên, điều hướng tới một cấp phía trên thư mục nơi bạn đã clone Yocto.

2. Tiếp theo, thiết lập môi trường làm việc BitBake:

   ```
   $ source poky/oe-init-build-env build-rpi
   ```

   Lệnh này đặt một loạt biến môi trường và đưa bạn trở lại thư mục `build-rpi` từ trước.

3. Xóa layer `meta-gattd` khỏi môi trường `build-rpi`:

   ```
   $ bitbake-layers remove-layer meta-gattd
   ```

4. Comment out hoặc xóa `CORE_IMAGE_EXTRA_INSTALL` khỏi `conf/local.conf`:

   ```
   #CORE_IMAGE_EXTRA_INSTALL += "gattd"
   ```

5. Tạo một layer mới cho distro của chúng ta:

   ```
   $ bitbake-layers create-layer ../meta-mackerel
   ```

6. Bây giờ, thêm layer mới vào cấu hình `build-rpi`:

   ```
   $ bitbake-layers add-layer ../meta-mackerel
   ```

Tên distro của chúng ta là `mackerel`. Tạo distro layer riêng cho phép chúng ta giữ chính sách distro tách biệt khỏi các package recipe (phần hiện thực).

### Cấu hình distro

Tạo file cấu hình distro trong thư mục `conf/distro` của distro layer `meta-mackerel`. Đặt cho nó cùng tên với distro (chẳng hạn `mackerel.conf`).

Đặt các biến bắt buộc `DISTRO_NAME` và `DISTRO_VERSION` trong `conf/distro/mackerel.conf`:

```
DISTRO_NAME = "Mackerel (Mackerel Embedded Linux Distro)"
DISTRO_VERSION = "0.1"
```

Các biến tùy chọn sau cũng có thể được đặt trong `mackerel.conf`:

```
DISTRO_FEATURES: Add software support for these features.
DISTRO_EXTRA_RDEPENDS: Add these packages to all images.
DISTRO_EXTRA_RRECOMMENDS: Add these packages if they exist.
TCLIBC: Select this version of the C standard library.
```

Khi đã xong với các biến đó, bạn có thể định nghĩa gần như mọi biến trong `conf/local.conf` mà bạn muốn cho distro của mình. Hãy xem các thư mục `conf/distro` của các distro khác, chẳng hạn của Poky, để thấy cách họ tổ chức mọi thứ, hoặc sao chép và dùng `conf/distro/defaultsetup.conf` làm template. Nếu bạn quyết định chia file cấu hình distro thành nhiều include file, hãy bảo đảm đặt chúng trong thư mục `conf/distro/include` của layer.

### Thêm recipe vào distro

Thêm metadata distro-related vào distro layer. Bạn sẽ muốn thêm recipe cho các file cấu hình bổ sung. Đây là các file cấu hình chưa được cài bởi một recipe có sẵn. Quan trọng hơn, bạn cũng sẽ muốn thêm các append file để tùy biến các recipe có sẵn và thêm file cấu hình của chúng vào distro.

### Quản lý package lúc runtime

Đưa một package manager vào các distro image rất tốt cho việc enable các bản cập nhật over-the-air an toàn và phát triển application nhanh. Khi nhóm của bạn làm việc với phần mềm thay đổi nhiều lần mỗi ngày, cập nhật package thường xuyên là một cách giữ mọi người đồng bộ và tiến lên. Cập nhật toàn bộ image là không cần thiết (chỉ một package thay đổi) và gây gián đoạn (cần reboot). Khả năng lấy package từ một server từ xa và cài chúng lên thiết bị đích được gọi là *runtime package management*.

Yocto hỗ trợ các định dạng package khác nhau (`rpm` và `ipk`) và các package manager khác nhau (`dnf` và `opkg`). Định dạng package bạn chọn cho distro quyết định package manager nào bạn có thể đưa vào.

Để chọn định dạng package cho distro, bạn có thể đặt biến `PACKAGE_CLASSES` trong file `conf` của distro. Thêm dòng này vào `meta-mackerel/conf/distro/mackerel.conf`:

```
PACKAGE_CLASSES ?= "package_ipk"
```

Bây giờ, hãy quay lại thư mục `build-rpi`:

```
$ source poky/oe-init-build-env build-rpi
```

Chúng ta đang nhắm tới Raspberry Pi 4, vì vậy hãy bảo đảm `MACHINE` vẫn được đặt tương ứng trong `conf/local.conf`:

```
MACHINE = "raspberrypi4-64"
```

Comment out `PACKAGE_CLASSES` trong `conf/local.conf` của thư mục build vì distro của chúng ta đã chọn `package_ipk`:

```
#PACKAGE_CLASSES ?= "package_rpm"
```

Để enable runtime package management, nối `"package-management"` vào danh sách `EXTRA_IMAGE_FEATURES` trong `conf/local.conf` của thư mục build:

```
EXTRA_IMAGE_FEATURES ?= "debug-tweaks ssh-server-openssh package-management"
```

Việc này sẽ cài một cơ sở dữ liệu package chứa tất cả các package từ bản build hiện tại lên distro image. Một cơ sở dữ liệu package được điền sẵn là tùy chọn vì bạn luôn có thể khởi tạo cơ sở dữ liệu package trên target sau khi distro image đã được triển khai.

Cuối cùng, đặt biến `DISTRO` trong file `conf/local.conf` của thư mục build thành tên distro của chúng ta:

```
DISTRO = "mackerel"
```

Việc này trỏ file `conf/local.conf` của thư mục build tới file cấu hình distro của chúng ta.

Cuối cùng, chúng ta đã sẵn sàng build distro:

```
$ bitbake -c clean rpi-test-image
$ bitbake rpi-test-image
```

Chúng ta đang build lại `rpi-test-image` với một định dạng package khác, vì vậy việc này sẽ mất một lúc. Lần này, các image hoàn chỉnh được đặt trong một thư mục khác:

```
$ ls tmp-glibc/deploy/images/raspberrypi4-64/rpi-test-image*wic.bz2
```

Ghi image lên thẻ microSD bằng Etcher và boot nó trên Raspberry Pi 4. Cắm nó vào Ethernet và SSH vào như bạn đã làm trước đó:

```
$ ssh root@raspberrypi4-64.local
```

Nếu kết nối thất bại, hãy xóa key cũ của Pi, như được thể hiện ở đây:

```
$ ssh-keygen -f "/home/frank/.ssh/known_hosts" \
-R "raspberrypi4-64.local"
```

Thay `frank` bằng username của bạn trong đường dẫn.

Khi đã đăng nhập, kiểm chứng rằng package manager `opkg` đã được cài:

```
root@raspberrypi4-64:~# which opkg
/usr/bin/opkg
```

Một package manager không hữu ích lắm nếu không có một package server từ xa để lấy package. Hãy xem điều đó tiếp theo.

## Chuẩn bị một package server từ xa

Thiết lập một package server HTTP từ xa và trỏ các client target tới nó dễ hơn bạn nghĩ. Cấu hình địa chỉ server client-side khác nhau giữa các package manager. Chúng ta sẽ cấu hình `opkg` thủ công trên Raspberry Pi 4.

Hãy bắt đầu với package server:

1. Đầu tiên, điều hướng tới một cấp phía trên thư mục nơi bạn đã clone Yocto.

2. Tiếp theo, thiết lập môi trường làm việc BitBake:

   ```
   $ source poky/oe-init-build-env build-rpi
   ```

   Lệnh này đặt một loạt biến môi trường và đưa bạn trở lại thư mục `build-rpi`.

3. Build package `curl`:

   ```
   $ bitbake curl
   ```

4. Điền package index:

   ```
   $ bitbake package-index
   ```

5. Tìm các file cài đặt package:

   ```
   $ ls tmp-glibc/deploy/ipk
   ```

   Sẽ có ba thư mục tên `aarch64`, `all` và `raspberrypi4_64` trong `ipk`. *Thư mục kiến trúc* là `aarch64`, còn *thư mục machine* là `raspberrypi4_64`. Tên hai thư mục này sẽ khác nhau, tùy theo cách image của bạn được cấu hình để build.

6. Điều hướng tới thư mục `ipk`, nơi chứa các file cài đặt package:

   ```
   $ cd tmp-glibc/deploy/ipk
   ```

7. Lấy địa chỉ IP của máy host Linux.

8. Khởi động package server HTTP:

   ```
   $ sudo python3 -m http.server --bind 192.168.1.69 80
   [sudo] password for frank:
   Serving HTTP on 192.168.1.69 port 80 (http://192.168.1.69:80/) ...
   ```

   Thay `192.168.1.69` bằng địa chỉ IP của máy host Linux của bạn.

Bây giờ, hãy cấu hình client target:

1. SSH lại vào Raspberry Pi 4:

   ```
   $ ssh root@raspberrypi4-64.local
   ```

2. Sửa `/etc/opkg/opkg.conf` để nó trông như thế này:

   ```
   src/gz all http://192.168.1.69/all
   src/gz aarch64 http://192.168.1.69/aarch64
   src/gz raspberrypi4_64 http://192.168.1.69/raspberrypi4_64
   dest root /
   option lists_dir /var/lib/opkg/lists
   ```

   Thay `192.168.1.69` bằng địa chỉ IP của máy host Linux của bạn.

3. Chạy `opkg update`:

   ```
   root@raspberrypi4-64:~# opkg update
   Downloading http://192.168.1.69/all/Packages.gz.
   Updated source 'all'.
   Downloading http://192.168.1.69/aarch64/Packages.gz.
   Updated source 'aarch64'.
   Downloading http://192.168.1.69/raspberrypi4_64/Packages.gz.
   Updated source 'raspberrypi4_64'.
   ```

4. Thử chạy `curl`:

   ```
   root@raspberrypi4-64:~# curl
   ```

   Lệnh sẽ thất bại vì `curl` chưa được cài.

5. Cài `curl`:

   ```
   root@raspberrypi4-64:~# opkg install curl
   Installing libcurl4 (7.69.1) on root
   Downloading http://192.168.1.69/aarch64/libcurl4_7.69.1-r0_aarch64.ipk.
   Installing curl (7.69.1) on root
   Downloading http://192.168.1.69/aarch64/curl_7.69.1-r0_aarch64.ipk.
   Configuring libcurl4.
   Configuring curl.
   ```

6. Kiểm chứng rằng `curl` đã được cài:

   ```
   root@raspberrypi4-64:~# curl
   curl: try 'curl --help' for more information
   root@raspberrypi4-64:~# which curl
   /usr/bin/curl
   ```

Khi bạn tiếp tục làm việc trong thư mục `build-rpi` từ máy host Linux, bạn có thể kiểm tra cập nhật từ Raspberry Pi 4:

```
root@raspberrypi4-64:~# opkg list-upgradable
```

Sau đó, bạn có thể áp dụng chúng:

```
root@raspberrypi4-64:~# opkg upgrade
```

Cách này nhanh hơn việc ghi lại image, thay thẻ microSD và reboot.

## Tóm tắt

Tôi biết đó là rất nhiều thứ phải tiếp thu. Và tin tôi đi – đây mới chỉ là khởi đầu. Yocto là một hang thỏ never-ending mà bạn không thể leo ra. Các recipe và công cụ liên tục thay đổi và phần lớn tài liệu, dù có rất nhiều, tiếc là đã lỗi thời. May mắn là có `devtool`, công cụ tự động hóa và loại bỏ phần lớn sự tẻ nhạt và lỗi của kiểu phát triển copy-paste. Nếu bạn dùng các công cụ được cung cấp và liên tục lưu công việc vào các layer của riêng mình, Yocto không nhất thiết phải đau đớn. Trước khi bạn kịp nhận ra, bạn sẽ đang tự làm distro layer và vận hành package server từ xa của riêng mình.

Package server từ xa chỉ là một cách để triển khai package và application. Chúng ta sẽ tìm hiểu một vài cách khác ở phần sau trong [*Chương 16*](ch16_packaging_python.vi.md), *Đóng gói Python*. Dù có tiêu đề như vậy, một số kỹ thuật chúng ta sẽ xem trong chương đó (chẳng hạn conda và Docker) áp dụng cho mọi ngôn ngữ lập trình. Dù package manager rất tốt cho việc phát triển, runtime package management không thường được dùng trên các hệ thống nhúng chạy trong sản xuất. Chúng ta sẽ xem xét kỹ các cơ chế cập nhật over-the-air dạng full image và containerized trong [*Chương 10*](ch10_updating_software_in_the_field.vi.md), *Cập nhật phần mềm ngoài thực địa*.

## Đọc thêm

Các tài liệu sau chứa thêm thông tin về các chủ đề đã được giới thiệu trong chương này:

- *Transitioning to a Custom Environment*, của Yocto Project: [https://www.yoctoproject.org/docs/transitioning-to-a-custom-environment](https://www.yoctoproject.org/docs/transitioning-to-a-custom-environment)
- *Yocto Project Development Manual*, của Scott Rifenbark: [https://www.yoctoproject.org/docs/latest/dev-manual/dev-manual.html](https://www.yoctoproject.org/docs/latest/dev-manual/dev-manual.html)
- *Using Devtool to Streamline Your Yocto Project Workflow*, của Tim Orling: [https://www.youtube.com/watch?v=CiD7rB35CRE](https://www.youtube.com/watch?v=CiD7rB35CRE)
- *Using a Yocto build workstation as a remote opkg repository*, của Jumpnow Technologies: [https://jumpnowtek.com/yocto/Using-your-build-workstation-as-a-remote-package-repository.html](https://jumpnowtek.com/yocto/Using-your-build-workstation-as-a-remote-package-repository.html)
