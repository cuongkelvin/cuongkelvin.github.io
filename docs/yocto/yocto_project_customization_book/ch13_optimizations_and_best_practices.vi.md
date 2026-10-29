# Chương 13. Tối ưu hóa và best practice (Optimizations and Best Practices)

Trong chương cuối cùng của sách này, chúng ta sẽ xem một số tối ưu hóa và best practice hữu ích mà một Yocto developer giỏi có thể dùng.

## 13.1 Bản phát hành development và production (Development and Production Releases)

Mọi developer giỏi đều biết tầm quan trọng của việc có thể dễ dàng chuyển đổi giữa bản phát hành development và production trong khi phát triển một software mới. Và với một bản phân phối Yocto cũng vậy. Thật vậy, trong quá trình phát triển, chúng ta có thể cần một số package có thể bị bỏ trong bản production để tiết kiệm dung lượng và/hoặc không làm bẩn image cuối cùng bằng các công cụ không cần thiết (hoặc nguy hiểm/không an toàn). Ví dụ, trong một image production, các công cụ như `i2cdetect`, `perf` hoặc `valgrind` nên bị bỏ; ngoài ra, nên tránh khả năng đăng nhập root không cần mật khẩu.

Vì tất cả những lý do này, trong mục này chúng ta sẽ đề xuất một số cấu hình khả dĩ mà developer có thể dễ dàng dùng để tạo một image development hoặc production.

Để tùy biến một image recipe, có hai nơi chính mà chúng ta có thể thao tác: trong các file cấu hình (`.conf`) hoặc trực tiếp trong file recipe. Vì vậy chúng ta phải kiểm tra kỹ các file cấu hình, đặc biệt là file `conf/local.conf`.

Trước khi bắt đầu thực hiện các sửa đổi, hãy kiểm tra xem thiết lập `local.conf` hiện tại có giống như sau không:

```
$ cat $BUILDDIR/conf/local.conf
MACHINE ??= 'imx8mp-icore-cy'
DISTRO ?= 'fsl-imx-xwayland'
PACKAGE_CLASSES ?= 'package_rpm'
EXTRA_IMAGE_FEATURES ?= "debug-tweaks"
USER_CLASSES ?= "buildstats"
PATCHRESOLVE = "noop"
BB_DISKMON_DIRS ??= "\
    STOPTASKS,${TMPDIR},1G,100K \
    STOPTASKS,${DL_DIR},1G,100K \
    STOPTASKS,${SSTATE_DIR},1G,100K \
    STOPTASKS,/tmp,100M,100K \
    HALT,${TMPDIR},100M,1K \
    HALT,${DL_DIR},100M,1K \
    HALT,${SSTATE_DIR},100M,1K \
    HALT,/tmp,10M,1K"
PACKAGECONFIG:append:pn-qemu-system-native = " sdl"
CONF_VERSION = "2"

DL_DIR = "/home/giometti/Projects/DL_ARCHIVES/yocto/"
ACCEPT_FSL_EULA = "1"

# Switch to IPKG packaging and include package-management in the image
PACKAGE_CLASSES = "package_ipk"
EXTRA_IMAGE_FEATURES += "package-management"
#EXTRA_IMAGE_FEATURES += "dbg-pkgs"

# Limiting HW resources
BB_NUMBER_THREADS = "4"
PARALLEL_MAKE = "-j 2"
```

Vì vậy việc đầu tiên cần làm là bỏ `debug-tweaks` trong biến `EXTRA_IMAGE_FEATURES`, vì thiết lập này nên được thực hiện tùy theo việc chúng ta đang build một image development hay production. Thật vậy, như đã nêu trong Mục 3.4.1, thiết lập như vậy được dùng để làm cho một image phù hợp cho việc phát triển, và vì thế truy cập ssh root có mật khẩu rỗng. Vì vậy các sửa đổi cần thiết được trình bày dưới đây:

```
--- conf/local.conf
+++ conf/local.conf
@@ -1,7 +1,6 @@
 MACHINE ??= 'imx8mp-icore-cy'
 DISTRO ?= 'fsl-imx-xwayland'
 PACKAGE_CLASSES ?= 'package_rpm'
-EXTRA_IMAGE_FEATURES ?= "debug-tweaks"
 USER_CLASSES ?= "buildstats"
 PATCHRESOLVE = "noop"
 BB_DISKMON_DIRS ??= "\
```

Bây giờ chúng ta có thể thay đổi image recipe tùy biến `cy-evaluation-image-mx8.bb` để chọn các image feature tùy theo một biến mới `CY_DEVELOPMENT`:

```
--- cy-evaluation-image-mx8.bb
+++ cy-evaluation-image-mx8.bb
@@ -6,6 +6,9 @@
 DESCRIPTION = "CY evaluation image"
 LICENSE = "MIT"

+CY_DEVELOPMENT ?= "0"
+OVERRIDES .= "${@bb.utils.contains('CY_DEVELOPMENT', '1', ':cy_develop
ment', '', d)}"
+
 inherit core-image

 ROOTFS_POSTPROCESS_COMMAND:append:mx8 = "fix_bcm43430;"
@@ -17,17 +20,19 @@

 ## Select Image Features
 IMAGE_FEATURES += " \
-        debug-tweaks \
-        tools-profile \
         splash \
-        tools-debug \
         ssh-server-dropbear \
-        tools-testapps \
         hwcodecs \
         ${@bb.utils.contains('DISTRO_FEATURES', 'wayland', 'weston', \
                 bb.utils.contains('DISTRO_FEATURES', 'x11', 'x11-base x11-s
ato', '', d), d)} \
 "
+IMAGE_FEATURES:append:cy_development = " \
+        debug-tweaks \
+        tools-profile \
+        tools-debug \
+        tools-testapps \
+"

 G2D_SAMPLES = ""
 G2D_SAMPLES:imxgpu2d = "imx-g2d-samples"
```

Bằng cách này, khi đặt giá trị mặc định cho `CY_DEVELOPMENT`, chúng ta có các thiết lập sau:

```
$ cy-vars 'OVERRIDES\|IMAGE_FEATURES' cy-evaluation-image-mx8
IMAGE_FEATURES="hwcodecs package-management splash ssh-server-dropbear
weston"
OVERRIDES="runtime-gnu:toolchain-gcc:linux:aarch64:pn-cy-evaluation-ima
gE-mx8:imx8mp-icore:aarch64:armv8a:use-nxp-bsp:imx-generic-bsp:imx-nxp-
bsP:imxdrm:imxvpu:imxgpu:imxgpu2d:imxgpu3d:imxvulkan:mx8-generic-bsp:mx
8-nXp-bsp:mx8m-generic-bsp:mx8m-nxp-bsp:mx8mp-generic-bsp:mx8mp-nxp-bsp
:imx8mp-icore-cy:fsl:class-target:libc-glibc:forcevariable"
```

Và biến `IMAGE_FEATURES` chỉ chứa các feature tối thiểu cần để chạy ứng dụng của chúng ta, còn khi đặt `CY_DEVELOPMENT` thành `1`, chúng ta có các thiết lập thay thế sau:

```
$ cy-vars 'OVERRIDES\|IMAGE_FEATURES' cy-evaluation-image-mx8
IMAGE_FEATURES="debug-tweaks hwcodecs package-management splash ssh-ser
ver-dropbear tools-debug tools-profile tools-testapps weston"
OVERRIDES="runtime-gnu:toolchain-gcc:linux:aarch64:pn-cy-evaluation-ima
ge-mx8:imx8mp-icore:aarch64:armv8a:use-nxp-bsp:imx-generic-bsp:imx-nxp-
Bsp:imxdrm:imxvpu:imxgpu:imxgpu2d:imxgpu3d:imxvulkan:mx8-generic-bsp:mx
8-nxp-bsp:mx8m-generic-bsp:mx8m-nxp-bsp:mx8mp-generic-bsp:mx8mp-nxp-bsp
:imx8mp-icore-cy:fsl:class-target:libc-glibc:forcevariable:cy_developme
nt"
```

Bây giờ chúng ta có thể thấy `OVERRIDES` chứa override `cy_development`, và điều này append vào `IMAGE_FEATURES` mọi feature development thường bị tắt.

> Lưu ý rằng để đặt `CY_DEVELOPMENT`, chúng ta có thể thay đổi file `.bb` và đặt
>
> ```
> CY_DEVELOPMENT = "1"
> ```
>
> Nhưng chúng ta cũng có thể để nguyên thiết lập trên trong file `.bb` rồi thay đổi nó bằng một file `.bbappend`!

Giải pháp này khá thanh lịch, nhưng có một nhược điểm: nó chỉ áp dụng cho image recipe! Thật vậy, nếu build một package riêng lẻ, thiết lập sẽ bị mất.

Để có một thiết lập toàn cục, tức là hoạt động mỗi lần chúng ta thực thi `bitbake` cho mọi recipe, chúng ta phải chuyển thiết lập `OVERRIDES` từ `cy-evaluation-image-mx8.bb` vào một file cấu hình đặc biệt. Vì vậy chúng ta nên có

```
--- cy-evaluation-image-mx8.bb
+++ cy-evaluation-image-mx8.bb
@@ -17,17 +17,19 @@

 ## Select Image Features
 IMAGE_FEATURES += " \
-        debug-tweaks \
-        tools-profile \
         splash \
-        tools-debug \
         ssh-server-dropbear \
-        tools-testapps \
         hwcodecs \
         ${@bb.utils.contains('DISTRO_FEATURES', 'wayland', 'weston', \
                 bb.utils.contains('DISTRO_FEATURES', 'x11', 'x11-base x11-s
ato', '', d), d)} \
 "

+IMAGE_FEATURES:append:cy_development = " \
+        debug-tweaks \
+        tools-profile \
+        tools-debug \
+        tools-testapps \
+"

 G2D_SAMPLES = ""
 G2D_SAMPLES:imxgpu2d = "imx-g2d-samples"
```

Rồi tạo một file cấu hình mới tên là `development.conf` với nội dung sau:

```
$ cat conf/development.conf
# Define the "development" override to enable special configuration
# settings in the form XXXXXX:development or XXXXXX:append:development.
OVERRIDES =. "development:"
```

Bây giờ, nếu thực thi `bitbake` như thường lệ, chúng ta có

```
$ bitbake -e | grep '^OVERRIDES='
OVERRIDES="runtime-gnu:toolchain-gcc:linux:aarch64:pn-defaultpkgname:im
X8mp-icore:aarch64:armv8a:use-nxp-bsp:imx-generic-bsp:imx-nxp-bsp:imxdr
M:imxvpu:imxgpu:imxgpu2d:imxgpu3d:imxvulkan:mx8-generic-bsp:mx8-nxp-bsp
:mx8m-generic-bsp:mx8m-nxp-bsp:mx8mp-generic-bsp:mx8mp-nxp-bsp:imx8mp-i
core-cy:fsl:class-target:libc-glibc:forcevariable"
```

còn nếu dùng option argument `-R` để yêu cầu `bitbake` đọc file được chỉ định sau `bitbake.conf`, chúng ta có

```
$ bitbake -e -R conf/development.conf | grep '^OVERRIDES='
OVERRIDES="runtime-gnu:toolchain-gcc:development:linux:aarch64:pn-defau
ltpkgname:imx8mp-icore:aarch64:armv8a:use-nxp-bsp:imx-generic-bsp:imx-n
xp-bsp:imxdrm:imxvpu:imxgpu:imxgpu2d:imxgpu3d:imxvulkan:mx8-generic-bsp
:mx8-nxp-bsp:mx8m-generic-bsp:mx8m-nxp-bsp:mx8mp-generic-bsp:mx8mp-nxp-
bsp:imx8mp-icore-cy:fsl:class-target:libc-glibc:forcevariable"
```

Vì vậy, nếu build image recipe như thường lệ, chúng ta có một image production:

```
$ bitbake -e cy-evaluation-image-mx8 | grep '^IMAGE_FEATURES='
IMAGE_FEATURES="hwcodecs package-management splash ssh-server-dropbear
weston"
```

Mặt khác, nếu cung cấp file cấu hình `conf/development.conf`, chúng ta có phiên bản development:

```
$ bitbake -e -R conf/development.conf cy-evaluation-image-mx8 | \
        grep '^IMAGE_FEATURES='
IMAGE_FEATURES="debug-tweaks hwcodecs package-management splash ssh-ser
ver-dropbear tools-debug tools-profile tools-testapps weston"
```

Lưu ý rằng mẹo này có thể được dùng trong mọi recipe được định nghĩa trong meta layer.

Tuy nhiên, như vậy vẫn chưa đủ; thật vậy, trong một số trường hợp, chúng ta có thể cần làm như dưới đây để đặt có điều kiện một variable flag:

```
UBOOT_CONFIG[sd] = "imx8mq_var_dart${@'_devel' if d.getVar('DEVELOPMENT
') == '1' else ''}_config,sdcard"
```

Thiết lập đặc biệt này được dùng để định nghĩa file cấu hình mặc định của U-Boot là file `imx8mq_var_dart_config` hoặc `imx8mq_var_dart_devel_config`, tùy theo biến `DEVELOPMENT` có được đặt thành `1` hay không.

Để tự động định nghĩa hành vi này, phiên bản cuối cùng của file `development.conf` nên là

```
$ cat conf/development.conf
# Define the "development" override to enable special configuration
# settings in the form XXXXXX:development or XXXXXX:append:development.
OVERRIDES =. "development:"

# Define the DEVELOPMENT variable to "1" in case of development mode to
# be used to enable special configuration settings in the form
# VARIABLE[flag] = "${@'true_setting' if d.getVar('DEVELOPMENT') == '1'
# else 'false_setting'}"
DEVELOPMENT:development = "1"
```

Bằng cách này, `DEVELOPMENT` được đặt đúng thành `1` mỗi lần file được đưa vào danh sách file cấu hình của BitBake.

Cho đầy đủ, nhớ lại những gì đã nói trong Mục 12.5.3, chúng ta cũng có thể thêm việc viết lại hostname, vì vậy phiên bản cuối cùng cho `conf/development.conf` có thể là

```
$ cat conf/development.conf
# Define the "development" override to enable special configuration
# settings in the form XXXXXX:development or XXXXXX:append:development.
OVERRIDES =. "development:"

# Define the DEVELOPMENT variable to "1" in case of development mode to
# be  used to enable special configuration settings in the form
# VARIABLE[flag] = "${@'true_setting' if d.getVar('DEVELOPMENT') == '1'
# else 'false_setting'}"
DEVELOPMENT:development = "1"
# Rewrite the hostname to signal the development release
hostname:append:pn-base-files = "${@'-devel' if d.getVar('DEVELOPMENT'
) == '1' else ''}"
```

Làm như vậy, hostname đổi thành `${MACHINE}-devel` trong giai đoạn development.

## 13.2 Cố định revision của mọi package (Fixing All Package Revision)

Trong Mục 6.2, chúng ta đã thấy rằng mỗi package có phiên bản cố định riêng được nêu trong tên recipe. Ví dụ, trong meta layer của chúng ta có các recipe `python3-memory-profiler_0.61.0.bb`, `dropbear_2022.83.bb` và `example_0.1.bb`, tham chiếu tới các phiên bản cụ thể và well-defined. Tuy nhiên, việc dùng một Git repository để chứa source là khá thông thường, và trong trường hợp này, recipe có hậu tố `_git` như `python3-pynmea2_git.bb`, `umrp_git.bb` và `lhello_git.bb` của chúng ta. Ở đây, số revision được ghi trong recipe ở biến `SRCREV`:

```
$ grep SRCREV $CY_METADIR/recipes-python/python3-pynmea2/python3-pynmea2_git.bb
SRCREV = "c546442d1ba38e488f47ef8a190eb5e890260aa2"
$ grep SRCREV $CY_METADIR/recipes-networking/umrp/umrp_git.bb
SRCREV = "fb193eac1a2df51fe42e19d4ea36bb0157bda09f"
$ grep SRCREV $CY_METADIR/recipes-example/lhello/lhello_git.bb
SRCREV = "9bcdf085b9b24794706d25f17ec814f05afdc3d2"
```

Nếu code đã ở trạng thái cuối cùng, mọi thứ có thể để nguyên. Tuy nhiên (đặc biệt trong khi phát triển một software tùy biến), chúng ta có thể cần `bitbake` lấy commit mới nhất trong một branch mỗi lần build recipe để có thể tiếp tục thử nghiệm. Để làm vậy, chúng ta phải đặt giá trị `${AUTOREV}` vào `SRCREV`, như dưới đây:

```
SRCREV = "${AUTOREV}"
```

> Bạn đọc nên nhớ những gì chúng ta đã nói trước đó trong sách về thiết lập trên và lệnh `devtool`: có thiết lập như vậy trong một recipe có thể khiến lệnh thất bại! Vì vậy nó phải được dùng cẩn thận.

Làm như vậy có thể dẫn đến việc có nhiều package ở tình trạng này khắp meta layer của chúng ta. Khi sẵn sàng chuyển từ giai đoạn development sang production, chúng ta phải đặt mọi commit ID đúng vào mọi `SRCREV` đang được đặt thành `${AUTOREV}`. Thao tác này có thể phiền phức và error-prone, vì vậy tốt hơn là làm tự động bằng Build History.

Build History của Yocto Project có thể giúp chúng ta làm nổi bật các thay đổi không mong đợi và có thể không mong muốn trong build output bằng cách tự động ghi lại thông tin về nội dung của mỗi package và image, rồi commit thông tin đó vào một Git repository local, nơi chúng ta có thể xem xét thông tin.

Phạm vi của mục này không phải là giải thích chi tiết framework Build History, mà chỉ những phần có thể dùng để giải quyết vấn đề tự động đặt biến `SRCREV`. Tuy nhiên, cần nói vài lời về nó để giải thích một chút cho bạn đọc cách nó hoạt động.

Trước tiên, để bật Build History, chúng ta phải kế thừa class `buildhistory` rồi đặt một vài biến trong file `conf/local.conf`, như dưới đây:

```
--- conf/local.conf
+++ conf/local.conf
@@ -26,3 +26,8 @@
 # Limiting HW resources
 BB_NUMBER_THREADS = "4"
 PARALLEL_MAKE = "-j 2"
+
+# Enable the Build History data
+INHERIT += "buildhistory"
+BUILDHISTORY_COMMIT = "1"
+BUILDHISTORY_FEATURES="image package task"
```

Biến `INHERIT` được dùng để bật việc kế thừa trong một file cấu hình (xem Mục 5.4.3), còn với các biến khác chúng ta có thể nói rằng

- `BUILDHISTORY_COMMIT` được dùng để bật việc commit build history output vào một Git repository local. Khi được đặt thành `1`, repository local này sẽ được class `buildhistory` (lưu trong `poky/meta/classes/buildhistory.bbclass`) tự động duy trì, và một commit sẽ được tạo ở mỗi bản build cho các thay đổi đối với mỗi thư mục con top-level của build history output (tùy theo các thiết lập trong `BUILDHISTORY_FEATURES`). Mặc định là `1`.

- `BUILDHISTORY_FEATURES` mặc định là chuỗi `image` `package sdk`, và nó được dùng để chỉ định các tính năng build history cần bật dưới dạng một danh sách space-separated. Các giá trị có thể dùng là

  - `image`: Bật phân tích nội dung của image (ví dụ, danh sách các package đã cài)

  - `package`: Bật phân tích nội dung của từng package

  - `sdk`: Bật phân tích nội dung của Software Development Kit (không được đề cập trong sách này)

  - `task`: Lưu một file cho mỗi task và liệt kê checksum SHA-256 cho mỗi file được staged

Trong ví dụ của chúng ta, chúng ta chỉ dùng hai biến này; tuy nhiên, còn những biến khác có thể dùng để tùy biến hoạt động của Build History. Những biến thú vị nhất là như sau:

- `BUILDHISTORY_COMMIT_AUTHOR` chỉ định tác giả dùng cho mỗi Git commit theo dạng `name <email@host>`. Mặc định là `buildhistory` `<buildhistory@${DISTRO}>`.

- `BUILDHISTORY_DIR` chỉ định thư mục lưu thông tin build history. Mặc định là `${TOPDIR}/buildhistory`.

OK, khi đã bật cơ chế Build History, chúng ta phải tạo lại image như dưới đây để buộc tạo dữ liệu build history của image:

```
$ bitbake -c cleanall cy-evaluation-image-mx8 && \
    bitbake cy-evaluation-image-mx8
```

Khi bản build kết thúc, thư mục mới `buildhistory` sẽ được tạo với nội dung sau:

```
$ tree buildhistory/
buildhistory/
├── images
│   └── imx8mp_icore_cy
│       └── glibc
│           └── cy-evaluation-image-mx8
│               ├── image-files
│               │   └── etc
│               │       ├── group
│               │       └── passwd
│               ├── build-id.txt
│               ├── depends.dot
│               ├── depends-nokernel.dot
│               ├── depends-nokernel-nolibc.dot
│               ├── depends-nokernel-nolibc-noupdate.dot
│               ├── depends-nokernel-nolibc-noupdate-nomodules.dot
│               ├── files-in-image.txt
│               ├── image-info.txt
│               ├── installed-package-info.txt
│               ├── installed-package-names.txt
│               ├── installed-package-sizes.txt
│               └── installed-packages.txt
├── task
│   ├── output
│   │   ├── cy-evaluation-image-mx8.image_complete
│   │   └── cy-evaluation-image-mx8.image_qa
│   └── tasksigs.txt
└── metadata-revs

8 directories, 18 files
```

Trong `buildhistory/task` lưu mọi output và signature của task (mời bạn đọc tự khám phá thư mục này), còn trong `buildhistory/images/imx8mp_icore_cy` lưu mọi thông tin về machine của chúng ta, và trong thư mục con `glibc/cy-evaluation-` `image-mx8` là mọi thông tin về image của chúng ta. Vậy hãy chuyển vào đó:

```
$ cd $BUILDDIR/buildhistory/images/imx8mp_icore_cy/glibc/cy-evaluation-
image-mx8/
$ ls
build-id.txt
depends.dot
depends-nokernel.dot
depends-nokernel-nolibc.dot
depends-nokernel-nolibc-noupdate.dot
depends-nokernel-nolibc-noupdate-nomodules.dot
files-in-image.txt
image-files
image-info.txt
installed-package-info.txt
installed-package-names.txt
installed-package-sizes.txt
installed-packages.txt
```

Trong `image-info.txt` có một số thông tin hữu ích về image:

```
$ cat image-info.txt
DISTRO = fsl-imx-xwayland
DISTRO_VERSION = 5.15-kirkstone
USER_CLASSES = buildstats meta-virt-cfg meta-virt-k8s-cfg meta-virt-xen
-cfg meta-virt-hosts
IMAGE_CLASSES = image_types_fsl license_image
IMAGE_FEATURES = debug-tweaks hwcodecs package-management splash ssh-se
rver-dropbear tools-debug tools-profile tools-testapps weston
IMAGE_LINGUAS = en-us en-gb
IMAGE_INSTALL = packagegroup-core-boot packagegroup-base-extended packa
gegroup-core-full-cmdline packagegroup-tools-bluetooth firmwared weston
-xwayland xterm alsa-utils brcm-patchram-plus cantest canutils devmem2
dosfstools e2fsprogs e2fsprogs-resize2fs engicam-emmc-tools ethtool evt
est firmware-imx-hdmi i2c-tools iproute2 ldd libgpiod libgpiod-tools li
nux-firmware-bcm43430 linux-firmware minicom parted serialtools usbutil
s zstd stress-ng packagegroup-fsl-tools-audio packagegroup-fsl-tools-gp
u packagegroup-fsl-tools-gpu-external packagegroup-fsl-tools-testapps p
ackagegroup-fsl-tools-benchmark packagegroup-imx-isp packagegroup-fsl-g
streamer1.0 packagegroup-fsl-gstreamer1.0-full imx-g2d-samples useradd-
example useradd-example-user3 tzdata jailhouse
BAD_RECOMMENDATIONS =
NO_RECOMMENDATIONS =
PACKAGE_EXCLUDE =
ROOTFS_POSTPROCESS_COMMAND = write_package_manifest; license_create_man
ifest;     ssh_allow_empty_password;  ssh_allow_root_login;  postinst_e
nable_logging;  rootfs_update_timestamp;   write_image_test_data;  set_
systemd_default_target; systemd_create_users; empty_var_volatile;   sor
t_passwd; rootfs_reproducible;
IMAGE_POSTPROCESS_COMMAND =  buildhistory_get_imageinfo ;
IMAGESIZE = 3419400
```

còn trong `files-in-image.txt` có danh sách đầy đủ mọi file chứa trong root filesystem:

```
$ head -20 files-in-image.txt
drwxr-xr-x root  root     4096 ./bin
-rwxr-xr-x root  root    22496 ./bin/arping
lrwxrwxrwx root  root       19 ./bin/ash -> /bin/busybox.nosuid
lrwxrwxrwx root  root       25 ./bin/base32 -> /usr/bin/base32.coreutils
lrwxrwxrwx root  root       25 ./bin/base64 -> /usr/bin/base64.coreutils
-rwxr-xr-x root  root  1284224 ./bin/bash.bash
lrwxrwxrwx root  root       14 ./bin/bash -> /bin/bash.bash
lrwxrwxrwx root  root       14 ./bin/busybox -> busybox.nosuid
-rwxr-xr-x root  root   690840 ./bin/busybox.nosuid
-rwsr-xr-x root  root    75840 ./bin/busybox.suid
lrwxrwxrwx root  root       18 ./bin/cat -> /bin/cat.coreutils
-rwxr-xr-x root  root    43328 ./bin/cat.coreutils
lrwxrwxrwx root  root       21 ./bin/chattr -> /bin/chattr.e2fsprogs
-rwxr-xr-x root  root    14328 ./bin/chattr.e2fsprogs
lrwxrwxrwx root  root       20 ./bin/chgrp -> /bin/chgrp.coreutils
-rwxr-xr-x root  root    76056 ./bin/chgrp.coreutils
lrwxrwxrwx root  root       20 ./bin/chmod -> /bin/chmod.coreutils
-rwxr-xr-x root  root    67872 ./bin/chmod.coreutils
lrwxrwxrwx root  root       20 ./bin/chown -> /bin/chown.coreutils
-rwxr-xr-x root  root    80152 ./bin/chown.coreutils
```

Điều này thực sự hữu ích để dễ dàng kiểm tra những file nào có mặt hay không trong root filesystem, còn trong `installed-package-sizes.txt` chúng ta có danh sách mọi package đã cài được sắp xếp theo kích thước:

```
$ head -20 installed-package-sizes.txt
815208       KiB        imx-gpu-sdk
360086       KiB        ltp
276669       KiB        linux-firmware
155101       KiB        linux-firmware-iwlwifi-misc
143500       KiB        linux-firmware-netronome
140275       KiB        boost-dev
74751        KiB        libnn-imx
74098        KiB        imx-test
43090        KiB        linux-firmware-ath11k
41191        KiB        kernel-image-image-5.15.71+gd1c9a311f7ef
37185        KiB        imx-gpu-viv-demos
36977        KiB        go-runtime
28782        KiB        libicudata70
24867        KiB        linux-firmware-liquidio
24116        KiB        vulkan-validationlayers
21979        KiB        linux-firmware-i915
21680        KiB        libc6-dbg
21679        KiB        valgrind
16049        KiB        linux-firmware-ibt-misc
16019        KiB        libvsc-imx
```

Hơn nữa, trong `installed-packages.txt` có một danh sách các package đã cài với đầy đủ tên file package và được sắp xếp theo tên:

```
$ head -20 installed-packages.txt
acl_2.3.1-r0_armv8a.ipk
acl-dev_2.3.1-r0_armv8a.ipk
adwaita-icon-theme-symbolic_41.0-r0_all.ipk
alsa-conf_1.2.6.1-r0_armv8a-mx8mp.ipk
alsa-plugins-pulseaudio-conf_1.2.6-r0_armv8a.ipk
alsa-state_0.2.0-r5_imx8mp_icore_cy.ipk
alsa-states_0.2.0-r5_imx8mp_icore_cy.ipk
alsa-tools_1.2.5-r0_armv8a.ipk
alsa-topology-conf_1.2.5.1-r0_all.ipk
alsa-ucm-conf_1.2.6.3-r0_all.ipk
alsa-utils-aconnect_1.2.6-r0_armv8a.ipk
alsa-utils-alsactl_1.2.6-r0_armv8a.ipk
alsa-utils-alsaloop_1.2.6-r0_armv8a.ipk
alsa-utils-alsamixer_1.2.6-r0_armv8a.ipk
alsa-utils-alsatplg_1.2.6-r0_armv8a.ipk
alsa-utils-alsaucm_1.2.6-r0_armv8a.ipk
alsa-utils_1.2.6-r0_armv8a.ipk
alsa-utils-amixer_1.2.6-r0_armv8a.ipk
alsa-utils-aplay_1.2.6-r0_armv8a.ipk
alsa-utils-aseqdump_1.2.6-r0_armv8a.ipk
```

Cuối cùng, file `depends.dot` chứa danh sách phụ thuộc đầy đủ của mọi package trong image theo định dạng file GraphViz DOT (xem `https://graphviz.org/`). Vì định dạng này human-readable, chúng ta có thể dễ dàng tìm ra, ví dụ, mọi phụ thuộc của package `packagegroup-base-alsa` chỉ bằng lệnh `grep`:

```
$ grep packagegroup-base-alsa depends.dot
"packagegroup-base-alsa" -> "alsa-state"
"packagegroup-base-alsa" -> "alsa-utils-alsactl"
"packagegroup-base-alsa" -> "alsa-utils-amixer"
"packagegroup-base-alsa" -> "kernel-module-snd-mixer-oss" [style=dotted]
"packagegroup-base-alsa" -> "kernel-module-snd-pcm-oss" [style=dotted]
"packagegroup-base" -> "packagegroup-base-alsa"
```

Ở đây, chúng ta có thể thấy package `packagegroup-base` phụ thuộc vào `packagegroup-base-alsa`, package này lại phụ thuộc vào các package `alsa-state`, `alsa-` `utils-alsactl`, `alsa-utils-amixer`, `kernel-module-snd-mixer-oss` và `kernel-module-snd-pcm-oss`.

OK, giờ đã biết rõ hơn một chút Build History là gì, chúng ta có thể dùng nó để liệt kê mọi package dùng `AUTOREV` trong biến `SRCREV` của chúng. Lệnh cần dùng là `buildhistory-collect-srcrevs`, có usage message như sau:

```
$ buildhistory-collect-srcrevs  -h
Usage:
    buildhistory-collect-srcrevs [options]

Collects the recorded SRCREV values from buildhistory and reports on them.

Options:
  -h, --help            show this help message and exit
  -a, --report-all      Report all SRCREV values, not just ones where
                        AUTOREV has been used
  -f, --forcevariable   Use forcevariable override for all output lines
  -p BUILDHISTORY_DIR, --buildhistory-dir=BUILDHISTORY_DIR
                        Specify path to buildhistory directory (defaults
                        to buildhistory/ under cwd)
```

Trước tiên, chúng ta phải lưu ý rằng thư mục `buildhistory` phải nằm trong working directory hiện tại (`cwd`), vì vậy chúng ta phải thực thi lệnh trong `BUILDDIR` hoặc với command argument `-p` (kèm một đối số phù hợp). Sau đó option argument `-a` (hay `--report-all`) có thể được dùng để lấy mọi giá trị `SRCREV` được lưu trong thư mục `buildhistory` chứ không chỉ những giá trị có dùng `AUTOREV`, còn option argument `-f` (hay `--forcevariable`) có thể được dùng để append override `forcevariable` vào mỗi dòng output, trong trường hợp chúng ta cần chắc chắn trước các override khác được áp dụng ở nơi khác, có thể dẫn đến các thiết lập không mong muốn.

> Trong trường hợp sau này, output có dạng
>
> ```
> $ buildhistory-collect-srcrevs -f
> # armv8a-poky-linux
> SRCREV:pn-umrp:forcevariable = "fb193eac1a2df51fe42e19d4ea36bb0157
> bda09f"
> ```
>
> Chú ý cách dùng override `forcevariable`.

OK, để trình bày một ví dụ đơn giản về cách dùng lệnh này, chúng ta nên sửa recipe `umrp_git.bb`, như dưới đây:

```
--- a/recipes-networking/umrp/umrp_git.bb
+++ b/recipes-networking/umrp/umrp_git.bb
@@ -8,7 +8,7 @@ LIC_FILES_CHKSUM = "file://LICENSE;md5=b234ee4d69f5fce4
486a80fdaf4a4263"
 SRC_URI = "git://github.com/giometti/umrp;protocol=https;branch=master"

 PV = "1.0+git${SRCPV}"
-SRCREV = "fb193eac1a2df51fe42e19d4ea36bb0157bda09f"
+SRCREV = "${AUTOREV}"

 S = "${WORKDIR}/git"
```

Rồi chúng ta có thể thêm package vào image đơn giản bằng cách thêm nó vào biến `IMAGE_INSTALL` như dưới đây:

```
--- recipes-images/images/cy-evaluation-image-mx8.bb
+++ recipes-images/images/cy-evaluation-image-mx8.bb
@@ -100,6 +100,7 @@

 IMAGE_INSTALL += " \
         tzdata \
+        umrp \
 "

 IMAGE_INSTALL:append:mx8m = "\
```

Bây giờ chúng ta nên xóa mọi dữ liệu build của `umrp` rồi tạo lại image:

```
$ bitbake -c cleanall umrp && bitbake cy-evaluation-image-mx8
...
0: umrp-1.0+gitAUTOINC+fb193eac1a-r0 do_compile - 0s (pid 1311053)  23
% |##        |
...
```

Như chúng ta thấy, `umrp` được tạo lại, và khi việc build kết thúc, một thư mục mới `packages` trong thư mục `buildhistory` đã được tạo liên quan đến package `umrp`:

```
$ tree buildhistory
buildhistory
├── images
│   └── imx8mp_icore_cy
...
├── packages
│   └── armv8a-poky-linux
│       └── umrp
│           ├── umrp
│           │   └── latest
│           ├── umrp-dbg
│           │   └── latest
│           ├── umrp-dev
│           │   └── latest
│           ├── umrp-doc
│           │   └── latest
│           ├── umrp-locale
│           │   └── latest
│           ├── umrp-src
│           │   └── latest
│           ├── umrp-staticdev
│           │   └── latest
│           ├── latest
│           └── latest_srcrev
├── task
│   ├── output
│   │   ├── cy-evaluation-image-mx8.image_complete
│   │   ├── cy-evaluation-image-mx8.image_qa
│   │   ├── umrp.deploy_source_date_epoch
│   │   ├── umrp.package
│   │   ├── umrp.packagedata
│   │   ├── umrp.package_qa
│   │   ├── umrp.package_write_ipk
│   │   └── umrp.populate_lic
│   └── tasksigs.txt
└── metadata-revs

18 directories, 33 files
```

> Cũng lưu ý rằng trong `task/output` một số file mới liên quan đến các task của `umrp` cũng đã được thêm.

Bây giờ chúng ta có thể thực thi lệnh `buildhistory-collect-srcrevs`:

```
$ buildhistory-collect-srcrevs
# armv8a-poky-linux
SRCREV:pn-umrp = "fb193eac1a2df51fe42e19d4ea36bb0157bda09f"
```

> Lưu ý rằng nếu thực thi `buildhistory-collect-srcrevs` kèm cả option argument `-a`, output không thay đổi vì chúng ta chưa tạo lại mọi package, và vì vậy chưa có dữ liệu Build History nào được tạo.

Output này có thể được dùng, khi giai đoạn development đã kết thúc, để đặt đúng các giá trị `SRCREV` của mọi package tùy biến, bằng cách đặt nó vào một file cấu hình riêng như dưới đây:

```
$ buildhistory-collect-srcrevs > conf/srcrev.conf
```

Sau đó chúng ta có thể yêu cầu `bitbake` đọc nó bằng option argument `-R`:

```
$ bitbake -R conf/srcrev.conf cy-evaluation-image-mx8
```

hoặc bằng cách include nó qua file `local.conf`, như dưới đây:

```
--- conf/local.conf
+++ conf/local.conf
@@ -31,3 +31,6 @@
 INHERIT += "buildhistory"
 BUILDHISTORY_COMMIT = "1"
 BUILDHISTORY_FEATURES="image package task"
+
+# Include SRCREV information (if present)
+include srcrev.conf
```

Làm như vậy, ngay cả khi trong recipe `AUTOREV` được chỉ định cho các biến `SRCREV`, chúng ta vẫn có thể đặt chúng thành một commit ID cố định.

> Directive `include` không yêu cầu file được chỉ định phải tồn tại, vì vậy file `srcrev.conf` có thể được yên tâm xóa tùy theo nhu cầu.

Lưu ý rằng khi image được tạo lại với các thiết lập này, output của `buildhistory-collect-srcrevs` lại rỗng! Và chúng ta phải xóa file `conf/srcrev.conf` rồi tạo lại package `umrp` để có output:

```
$ rm conf/srcrev.conf
$ bitbake -c cleanall umrp && bitbake umrp
$ buildhistory-collect-srcrevs
# armv8a-poky-linux
SRCREV:pn-umrp = "fb193eac1a2df51fe42e19d4ea36bb0157bda09f"
```

Vì vậy chúng ta phải chắc chắn tạo file này ở cuối giai đoạn development, hoặc phải đặt lại nó đúng cách để tránh một số cấu hình sai.

## 13.3 Tải về mọi thứ (Downloading Everything)

Trong Mục 2.3, chúng ta đã giới thiệu biến `DL_DIR`, có thể được dùng để chỉ định một download directory chung nơi mọi bản build có thể tải source của mình và nơi chúng có thể kiểm tra để tìm code đã tải trước đó. Tuy nhiên, trong một bản build, BitBake cũng sẽ lấy source từ các remote repository được quản lý bằng công cụ quản lý revision, ví dụ Git hoặc SVN. Theo mặc định, BitBake không lưu các source này vào `DL_DIR` vì lý do hiệu năng.

Trong trường hợp muốn có toàn bộ code ở local, chúng ta có thể chỉ dẫn BitBake tạo một archive cho mỗi source mà nó check out vào download directory, bằng cách thêm các thiết lập sau vào file `conf/local.conf`:

```
BB_GENERATE_MIRROR_TARBALLS = "1"
```

Làm như vậy, ở các bản build sau, nếu cần source, BitBake trước tiên sẽ tìm archive trong download directory trước khi thử fetch nó qua một source control manager.

> Lưu ý rằng khi bật thiết lập này, chúng ta có thể cần vài gigabyte dung lượng đĩa để lưu mọi source cần thiết để build ngay cả một image nhỏ!

Dùng các thiết lập này cho `DL_DIR` và `BB_GENERATE_MIRROR_TARBALLS` có thể cải thiện thời gian build Yocto Project nhờ giảm thời gian lấy source từ Internet. Hơn nữa, nó bảo đảm độ tin cậy và khả năng tái tạo của các bản build trong trường hợp, ví dụ, một server do `SRC_URI` trỏ tới tạm thời không truy cập được.

Thật vậy, chế độ hoạt động này thực chất là một bản build offline, và chúng ta có thể dùng nó để đơn giản tải mọi source cần để build image, qua đó cung cấp một cách để làm đầy `DL_DIR` mà không phải build gì cả. Điều này có thể được làm bằng option argument `--runonly` trong lệnh `bitbake`, như dưới đây:

```
$ bitbake --runonly=fetch cy-evaluation-image-mx8
```

Để kiểm tra rằng chúng ta đã tải mọi source cần thiết cho một bản build, có thể thêm tùy chọn `BB_NO_NETWORK` vào file `local.conf` rồi build lại image, như dưới đây:

```
$ echo 'BB_NO_NETWORK = "1"' >> conf/local.conf
$ bitbake cy-evaluation-image-mx8
```

Điều này tắt truy cập mạng và do đó gây ra lỗi nếu cần một source chưa được tải về.

## 13.4 Tạo một repo manifest tùy biến (Creating a Custom Repo Manifest)

Trong mục này, chúng ta sẽ xem chi tiết lệnh `repo` hoạt động thế nào và cách một repo Manifest có thể được dùng để chắc chắn rằng chúng ta có thể tạo ra các bản phát hành bất biến.

> Lưu ý rằng để chắc chắn có thể tạo lại một image từ đầu, chúng ta cũng nên cân nhắc tải mọi source như đã giải thích ở mục trước.

Trước tiên, chúng ta nên nói vài lời giải thích một repo Manifest được viết thế nào và cách thay đổi nó cho phù hợp với nhu cầu. Để làm vậy, chúng ta sẽ tạo một repo Manifest tùy biến bắt đầu từ Manifest của NXP, trong đó trước tiên chúng ta sẽ thêm meta layer của Engicam rồi đến meta layer tùy biến của mình.

Bước đầu tiên là clone manifest của NXP, và để làm vậy chúng ta có thể thực thi các lệnh sau:

```
$ cd /home/giometti/yocto
$ mkdir manifest && cd manifest
$ git clone https://github.com/nxp-imx/imx-manifest cy-manifest
Cloning into 'cy-manifest'...
remote: Enumerating objects: 2330, done.
remote: Counting objects: 100% (567/567), done.
remote: Compressing objects: 100% (160/160), done.
remote: Total 2330 (delta 463), reused 486 (delta 405), pack-reused 1763
Receiving objects: 100% (2330/2330), 612.75 KiB | 2.88 MiB/s, done.
Resolving deltas: 100% (1548/1548), done.
```

Sau đó chúng ta phải check out bản phát hành ban đầu. Nếu nhớ lại những gì đã làm trong Mục 2.1, chúng ta phải làm việc trên branch `imx-linux-kirkstone` như dưới đây:

```
$ cd cy-manifest/
$ git checkout -b cy-linux-kirkstone origin/imx-linux-kirkstone
Branch 'cy-linux-kirkstone' set up to track remote branch 'imx-linux-ki
rkstone' from 'origin'.
Switched to a new branch 'cy-linux-kirkstone'
$ git branch 'imx-linux-kirkstone'
```

Bằng cách này, chúng ta có một branch tùy biến tên là `cy-linux-kirkstone` và một branch tham chiếu tên là `imx-linux-kirkstone`.

> Branch sau này sẽ được dùng để dễ dàng hiển thị các sửa đổi của chúng ta so với manifest gốc của NXP.

Lệnh chúng ta đã dùng để lấy code của NXP là

```
$ repo init -u https://github.com/nxp-imx/imx-manifest -b imx-linux-kirks
tone -m imx-5.15.71-2.2.0.xml
```

Vì vậy Manifest của NXP nằm trong file `imx-5.15.71-2.2.0.xml`, và để clone nó, chúng ta có thể làm như dưới đây:

```
$ cp imx-5.15.71-2.2.0.xml cy-5.15.71-2.2.0.xml
$ git add cy-5.15.71-2.2.0.xml
$ git commit -s -m "Clone NXP manifest and create CY one"
```

File Manifest mới của chúng ta sẽ trông như sau:

```
$ cat cy-5.15.71-2.2.0.xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest>

  <default sync-j="2"/>

  <remote fetch="https://github.com/nxp-imx" name="nxp-imx"/>
  <remote fetch="https://github.com/OSSystems" name="OSSystems"/>
  <remote fetch="https://code.qt.io/yocto"  name="QT6"/>
  <remote fetch="https://github.com/TimesysGit"  name="Timesys"/>
  <remote fetch="https://github.com/kraj" name="clang"/>
  <remote fetch="https://github.com/Freescale" name="community"/>
  <remote fetch="https://github.com/openembedded" name="oe"/>
  <remote fetch="https://git.yoctoproject.org/git" name="yocto"/>
  <remote fetch="https://github.com/nxp-imx-support" name="imx-
support"
/>

  <project name="fsl-community-bsp-base" path="sources/base" remote="co
mmunity" revision="60f79f7af60537146298560079ae603260f0bd14" upstream="
kirkstone">
    <linkfile dest="README" src="README"/>
    <linkfile dest="setup-environment" src="setup-environment"/>
  </project>
  <project name="meta-browser" path="sources/meta-browser" remote="OSSy
stems" revision="e232c2e21b96dc092d9af8bea4b3a528e7a46dd6"/>
  <project name="meta-clang" path="sources/meta-clang" remote="clang" r
evision="c728c3f9168c8a4ed05163a51dd48ca1ad8ac21d" upstream="kirkstone"
/>
  <project name="meta-freescale" path="sources/meta-freescale" remote="
community" revision="c82d4634e7aba8bc0de73ce1dfc997b630051571" upstream
="kirkstone"/>
  <project name="meta-freescale-3rdparty" path="sources/meta-freescale-
3rdparty" remote="community" revision="5977197340c7a7db17fe3e02a4e014ad
997565ae" upstream="kirkstone"/>
  <project name="meta-freescale-distro" path="sources/meta-freescale-di
stro" remote="community" revision="d5bbb487b2816dfc74984a78b67f7361ce40
4253" upstream="kirkstone"/>
  <project name="meta-imx" path="sources/meta-imx" remote="nxp-imx" rev
ision="refs/tags/rel_imx_5.15.71_2.2.0" upstream="kirkstone-5.15.71-2.2
.0">
    <linkfile dest="imx-setup-release.sh" src="tools/imx-setup-release.
sh"/>
    <linkfile dest="README-IMXBSP" src="README"/>
  </project>

  <project name="meta-nxp-demo-experience" path="sources/meta-nxp-demo-
experience" remote="imx-support" revision="52eaf8bf42f8eda2917a1c8c0460
03c8c2c8f629" upstream="kirkstone-5.15.71-2.2.0"/>
  <project name="meta-openembedded" path="sources/meta-openembedded" re
mote="oe" revision="744a4b6eda88b9a9ca1cf0df6e18be384d9054e3" upstream=
"kirkstone"/>
  <project name="meta-qt6" path="sources/meta-qt6" remote="QT6" revisio
n="ed785a25d12e365d1054700d4fc94a053176eb14" upstream="6.3"/>
  <project name="meta-timesys" path="sources/meta-timesys" remote="Time
sys" revision="d1ad27bfacc937048e7f9084b17f4d7c917d2004" upstream="mast
er"/>
  <project name="meta-virtualization" path="sources/meta-virtualization
" remote="yocto" revision="9482648daf0bb42ff3475e7892542cf99f3b8d48" up
stream="master"/>
  <project name="poky" path="sources/poky" remote="yocto" revision="24a
3f7b3648185e33133f5d96b184a6cb6524f3d" upstream="kirkstone"/>
</manifest>
```

File XML này dễ đọc: trong phần tử `manifest` có định nghĩa Manifest, chia thành nhiều phần tử như

- `default`: Được dùng để đặt một số thiết lập mặc định bằng nhiều thuộc tính như

  - `remote`: Chỉ định giá trị remote mặc định cho các phần tử project không có thuộc tính remote riêng

  - `revision`: Chỉ định giá trị revision mặc định cho các phần tử project không có thuộc tính revision riêng

  - `sync-j`: Chỉ định số job song song mặc định dùng khi đồng bộ (nếu không được định nghĩa trong command line)

- `remote`: Chỉ định một Git URL được một hoặc nhiều project dùng chung. Phần tử này hỗ trợ các thuộc tính sau:

  - `fetch`: Chỉ định tiền tố Git URL, và thuộc tính `name` trong mỗi phần tử `project` được append vào tiền tố này để tạo thành URL thực tế dùng để clone project.

  - `name`: Chỉ định một tên ngắn duy nhất trong file Manifest này cho remote source. Các project có thể tham chiếu tới nó để trỏ tới Git server remote của mình.

- `project`: Chỉ định một Git repository duy nhất cần được clone vào workspace của repo client. Nó hỗ trợ các thuộc tính sau:

  - `name`: Chỉ định một tên duy nhất cho project này, tên này được append vào fetch URL của remote của nó để tạo URL thực tế, nơi fetch source. URL được tạo thành `<remote>/<name>.git`, vì vậy nó không được rỗng, không được là đường dẫn tuyệt đối hoặc dùng các thành phần đường dẫn `.` hoặc `..`.

  - `path`: Chỉ định một đường dẫn tương đối so với thư mục gốc của repo client, nơi đặt Git working directory của project này.

  - Tham số này là tùy chọn, và nếu vậy, thuộc tính `name` của project được dùng. Nếu được chỉ định, nó không được là đường dẫn tuyệt đối hoặc dùng các thành phần đường dẫn `.` hoặc `..`.

  - `remote`: Chỉ tới một phần tử remote đã được định nghĩa trước đó bằng cách tham chiếu tới `name` của nó.

  - `revision`: Chỉ định tên Git branch mà Manifest muốn theo dõi cho project này. Tuy nhiên, nó thường được dùng để chỉ định tag (dạng `refs/tags/tag_name`) hoặc commit ID (dưới dạng SHA-1 tường minh) cần fetch. Nó hữu ích để cố định một phiên bản cụ thể của mọi source trong Yocto build system.

  - `upstream`: Tên Git reference (thường là tên branch), nơi có thể tìm thấy tag hoặc commit ID được chỉ định trong `revision` ở trên.

- `copyfile`: Phần tử này có thể được chỉ định làm phần tử con của một `element` project, và nó được dùng để chép file `src` tới vị trí `dest` trong lệnh `repo sync`.

  File `src` là tương đối so với project, còn file `dest` là tương đối so với gốc của cây, và thư mục hoặc symlink không được phép trong các đối số này. Hơn nữa, việc chép từ các đường dẫn bên ngoài project hoặc tới các đường dẫn bên ngoài repo client cũng không được phép.

- `linkfile`: Phần tử này hoạt động giống `copyfile` và chạy cùng lúc, nhưng thay vì chép, nó tạo một symlink.

> Danh sách phần tử và thuộc tính này không đầy đủ, vì vậy để có mô tả đầy đủ về định dạng repo Manifest, bạn đọc nên tham khảo `https://gerrit.googlesource.com/git-repo/+/HEAD/docs/manifest-format.md`.

Để giải thích một chút về định dạng repo Manifest, chúng ta có thể phân tích một số định nghĩa trong file Manifest của mình. Ví dụ:

```
 <project name="meta-browser" path="sources/meta-browser" remote="OSSys
tems" revision="e232c2e21b96dc092d9af8bea4b3a528e7a46dd6"/>
```

Mục project này tham chiếu tới mục remote `OSSystems`, vì vậy Git URL là `https://github.com/OSSystems/meta-browser.git`, và source từ commit ID `e232c2e21b96dc092d9af8bea4b3a528e7a46dd6` sẽ được fetch vào thư mục `sources/meta-browser`. Thật vậy, chúng ta có

```
$ git -C sources/meta-browser/ log -1 --oneline
e232c2e (HEAD, m/imx-linux-kirkstone) cbindgen: upgrade to 0.23.0
```

Một ví dụ khác có thể là mục:

```
<project name="meta-imx" path="sources/meta-imx" remote="nxp-imx" revis
ion="refs/tags/rel_imx_5.15.71_2.2.0" upstream="kirkstone-5.15.71-2.2.0
">
```

Ở đây, mục project tham chiếu tới mục remote `nxp-imx`, vì vậy Git URL là `https://github.com/nxp-imx/meta-imx.git`, và source từ tag `rel_imx_5.15.71_2.2.0` trong branch `kirkstone-5.15.71-2.2.0` sẽ được fetch vào thư mục `sources/meta-imx`. Thật vậy, chúng ta có

```
$ git -C sources/meta-imx/ log -1 --oneline
9174c61f4d (HEAD, tag: rel_imx_5.15.71_2.2.0, nxp-imx/kirkstone-5.15.71
-2.2.0, m/imx-linux-kirkstone) Fix Yocto syntax error of i.MX 8M AB2 bo
ards [YOCIMX-7250]
```

Cuối cùng, một ví dụ rất thú vị là mục sau:

```
<project name="fsl-community-bsp-base" path="sources/base" remote="comm
unity" revision="60f79f7af60537146298560079ae603260f0bd14" upstream="ki
rkstone">
    <linkfile dest="README" src="README"/>
    <linkfile dest="setup-environment" src="setup-environment"/>
</project>
```

Ở đây, như trước, mục project tham chiếu tới mục remote community, vì vậy Git URL là `https://github.com/Freescale/fsl-community-bsp-base.git`, và source từ commit ID `60f79f7af60537146298560079ae603260f0bd14` trong branch `kirkstone` sẽ được fetch vào thư mục sources/base. Thật vậy, chúng ta có

```
$ git -C sources/base/ log -1 --oneline
60f79f7 (HEAD, m/imx-linux-kirkstone, community/kirkstone, community/ho
nister) setup-environment: Update NXP EULA reference
```

Tuy nhiên, lần này cấu trúc của project phức tạp hơn một chút so với trước vì có thêm hai phần tử `linkfile` được chỉ định. Điều này sẽ khiến, khi source đã được fetch, hai symlink tên là `README` và `setup-environment` được tạo ở gốc của cây, trỏ tới các file cùng tên trong thư mục local của project (tức là `sources/base`). Thật vậy, trong thư mục `imx-yocto-bsp`, chúng ta có

```
$ cd imx-yocto-bsp
$ ls -l README setup-environment
lrwxrwxrwx 1 giometti giometti 19 Nov 24  2023 README -> sources/base/R
EADME
lrwxrwxrwx 1 giometti giometti 30 Nov 24  2023 setup-environment -> sou
rces/base/setup-environment
```

OK, giờ đã biết rõ một file Manifest hoạt động thế nào, việc thêm meta layer của Engicam rất đơn giản. Mọi sửa đổi cần thiết được trình bày dưới đây:

```
--- a/cy-5.15.71-2.2.0.xml
+++ b/cy-5.15.71-2.2.0.xml
@@ -12,6 +12,7 @@
   <remote fetch="https://github.com/openembedded" name="oe"/>
   <remote fetch="https://git.yoctoproject.org/git" name="yocto"/>
   <remote fetch="https://github.com/nxp-imx-support" name="imx-support"/>
+  <remote fetch="https://github.com/engicam-stable" name="engicam-supp
ort"/>

   <project name="fsl-community-bsp-base" path="sources/base" remote="c
ommunity" revision="60f79f7af60537146298560079ae603260f0bd14" upstream=
"kirkstone">
     <linkfile dest="README" src="README"/>
@@ -34,4 +35,5 @@
   <project name="meta-timesys" path="sources/meta-timesys" remote="Tim
esys" revision="d1ad27bfacc937048e7f9084b17f4d7c917d2004" upstream="mas
ter"/>
   <project name="meta-virtualization" path="sources/meta-virtualizatio
n" remote="yocto" revision="9482648daf0bb42ff3475e7892542cf99f3b8d48" u
pstream="master"/>
   <project name="poky" path="sources/poky" remote="yocto" revision="24
a3f7b3648185e33133f5d96b184a6cb6524f3d" upstream="kirkstone"/>
+  <project name="meta-engicam-nxp" path="sources/meta-engicam-nxp" rem
ote="engicam-support" revision="983ed77473c8567045d88165a33c81c4ac8b4e8
9" upstream="kirkstone"/>
 </manifest>
```

Trong patch trên, chúng ta đã thêm một phần tử remote mới để chỉ tới URL hỗ trợ của Engicam, rồi một phần tử project mới để chỉ định tên của remote repository, commit ID và nơi đặt source.

Để kiểm tra mọi thứ có hoạt động tốt không, chúng ta cần commit các thay đổi như dưới đây:

```
$ git add cy-5.15.71-2.2.0.xml
$ git commit -s -m "cy-5.15.71-2.2.0.xml: add Engicam meta layer"
[cy-linux-kirkstone a8540b0] cy-5.15.71-2.2.0.xml: add Engicam meta lay
er
 1 file changed, 2 insertions(+)
```

Bây giờ chúng ta có thể thử tạo lại Yocto build system như dưới đây:

```
$ mkdir /tmp/manifest-test && cd /tmp/manifest-test
$ repo init -u /home/giometti/yocto/manifest/cy-manifest/ \
        -b cy-linux-kirkstone -m cy-5.15.71-2.2.0.xml
Downloading Repo source from https://gerrit.googlesource.com/git-repo

Your identity is: Rodolfo Giometti <giometti@enneenne.com>
If you want to change this, please re-run 'repo init' with --config-name

repo has been initialized in /tmp/manifest-test
```

> Lưu ý rằng, như đã nói trong Mục 2.1, nếu nhận được một warning message như dưới đây:
>
> ```
> ... A new version of repo (2.45) is available.
> ... New version is available at: /tmp/manifest-test/.repo/repo/rep
> o
> ... The launcher is run from: /usr/bin/repo
> !!! The launcher is not writable.  Please talk to your sysadmin or
>  distro
> !!! to get an update installed.
> ```
>
> chúng ta có thể cập nhật ứng dụng `repo` hoặc chỉ cần tiếp tục với phiên bản hiện tại.

```
$ repo sync
...
Fetching:  0% (0/14) 0:05 | 2 jobs | 0:04 meta-freescale @ sources/meta
-freescale
...
```

Bạn đọc nên chú ý rằng khi thực thi lệnh `repo` `init`

- Với option argument `-u`, chúng ta cung cấp thư mục lưu manifest tùy biến.

- Với option argument `-b`, chúng ta dùng branch tùy biến của mình.

- Với option argument `-m`, chúng ta dùng file manifest XML của mình.

còn trong khi thực thi lệnh `repo sync`, hai job đồng thời đã được khởi động như được định nghĩa trong thuộc tính `sync-j` của phần tử `default`.

Bây giờ chúng ta có thể kiểm tra mọi thứ đã sẵn sàng:

```
$ ls
imx-setup-release.sh  README  README-IMXBSP  setup-environment  sources
$ ls sources/
base              meta-freescale-3rdparty   meta-qt6
meta-browser      meta-freescale-distro     meta-timesys
meta-clang        meta-imx                  meta-virtualization
meta-engicam-nxp  meta-nxp-demo-experience  poky
meta-freescale    meta-openembedded
```

Chúng ta cũng có thể kiểm tra rằng đúng commit ID đã được dùng để fetch source của Engicam:

```
$ git -C sources/meta-engicam-nxp/ log -1 --oneline
983ed77 (HEAD, m/cy-linux-kirkstone) Updated UBoot SRCREV
```

OK, giờ chúng ta cần thêm meta layer tùy biến của mình. Tuy nhiên, trước khi làm vậy, chúng ta cần lưu sửa đổi trong `setup-environment` đã làm ở Mục 7.4:

```
$ cd $CY_METADIR
$ mkdir tools
$ cp ../../setup-environment tools/
$ git add tools/setup-environment
$ git commit -s -m "tools: add our custom setup-environment"
[master 66f43fc] tools: add our custom setup-environment
 1 file changed, 278 insertions(+)
 create mode 100755 tools/setup-environment
```

Meta layer của chúng ta giờ đã hoàn tất, vì vậy có thể push mọi thay đổi lên GitHub repository của mình:

```
$ git push -f -u origin
Enumerating objects: 215, done.
Counting objects: 100% (215/215), done.
Delta compression using up to 24 threads
Compressing objects: 100% (177/177), done.
Writing objects: 100% (215/215), 42.04 KiB | 4.20 MiB/s, done.
Total 215 (delta 48), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (48/48), done.
To github.com:giometti/meta-cy.git
 + 0828270...66f43fc master -> master
Branch 'master' set up to track remote branch 'master' from 'origin'.
```

Xét những gì đã nói ở trên về file Manifest, các sửa đổi cần thiết để thêm meta layer của chúng ta được trình bày dưới đây:

```
$ git diff
diff --git a/cy-5.15.71-2.2.0.xml b/cy-5.15.71-2.2.0.xml
index 38063d0..79da148 100644
--- a/cy-5.15.71-2.2.0.xml
+++ b/cy-5.15.71-2.2.0.xml
@@ -13,10 +13,10 @@
   <remote fetch="https://git.yoctoproject.org/git" name="yocto"/>
   <remote fetch="https://github.com/nxp-imx-support" name="imx-support
"/>
   <remote fetch="https://github.com/engicam-stable" name="engicam-supp
ort"/>
+  <remote fetch="https://github.com/giometti" name="cy-support"/>

   <project name="fsl-community-bsp-base" path="sources/base" remote="c
ommunity" revision="60f79f7af60537146298560079ae603260f0bd14" upstream=
"kirkstone">
     <linkfile dest="README" src="README"/>
-    <linkfile dest="setup-environment" src="setup-environment"/>
   </project>
   <project name="meta-browser" path="sources/meta-browser" remote="OSS
ystems" revision="e232c2e21b96dc092d9af8bea4b3a528e7a46dd6"/>
   <project name="meta-clang" path="sources/meta-clang" remote="clang"
revision="c728c3f9168c8a4ed05163a51dd48ca1ad8ac21d" upstream="kirkstone
"/>
@@ -36,4 +37,7 @@
   <project name="meta-virtualization" path="sources/meta-virtualizatio
n" remote="yocto" revision="9482648daf0bb42ff3475e7892542cf99f3b8d48" u
pstream="master"/>
   <project name="poky" path="sources/poky" remote="yocto" revision="24
a3f7b3648185e33133f5d96b184a6cb6524f3d" upstream="kirkstone"/>
   <project name="meta-engicam-nxp" path="sources/meta-engicam-nxp" rem
ote="engicam-support" revision="983ed77473c8567045d88165a33c81c4ac8b4e8
9" upstream="kirkstone"/>
+  <project name="meta-cy" path="sources/meta-cy" remote="cy-support" r
evision="4cca1f0aae0d545114776308e1b1b857c3e0a406" upstream="kirkstone">
+    <linkfile dest="setup-environment" src="tools/setup-environment"/>
+  </project>
 </manifest>
```

Trong patch trên, chúng ta nên chú ý rằng đã bỏ dòng:

```
-    <linkfile dest="setup-environment" src="setup-environment"/>
```

Lý do là chúng ta muốn dùng file `setup-environment` tùy biến của mình thay cho file trong repository `fsl-community-bsp-base`.

Bây giờ chúng ta chỉ cần commit các thay đổi:

```
$ git add cy-5.15.71-2.2.0.xml
$ git commit -s -m "cy-5.15.71-2.2.0.xml: add CY meta layer"
[cy-linux-kirkstone 5759997] cy-5.15.71-2.2.0.xml: add CY meta layer
 1 file changed, 4 insertions(+)
```

Để thử Manifest mới, chúng ta nên tạo lại thư mục tạm đã dùng trước đó:

```
$ cd /tmp/
$ rm -rf manifest-test/
$ mkdir manifest-test && cd manifest-test
```

Sau đó chúng ta có thể thực thi lại các lệnh `repo init` và `sync` như đã làm trước đó:

```
$ repo init -u /home/giometti/yocto/manifest/cy-manifest/ -b cy-linux-k
irkstone -m cy-5.15.71-2.2.0.xml
$ repo sync
```

Khi việc đồng bộ đã xong, chúng ta có thể kiểm tra mọi thứ đã sẵn sàng chưa:

```
$ ls
imx-setup-release.sh  README  README-IMXBSP  setup-environment  sources
$ ls sources/
base              meta-freescale            meta-openembedded
meta-browser      meta-freescale-3rdparty   meta-qt6
meta-clang        meta-freescale-distro     meta-timesys
meta-cy           meta-imx                  meta-virtualization
meta-engicam-nxp  meta-nxp-demo-experience  poky
```

Mọi thứ như trước, nhưng giờ chúng ta còn có layer `meta-cy` của mình! Chúng ta cũng có thể kiểm chứng nó đang ở đúng commit:

```
$ git -C sources/meta-cy/ log -1 --oneline
66f43fc (HEAD, m/cy-linux-kirkstone, cy-support/master) tools: add our
custom setup-environment
```

Chúng ta cũng có thể kiểm tra `setup-environment` có chứa các sửa đổi của chúng ta không:

```
$ grep CY_METADIR setup-environment
export CY_METADIR="$PWD/sources/meta-cy"
export PATH="$CY_METADIR/scripts:$PATH"
```

Tuyệt! Giờ mọi thứ có vẻ đã sẵn sàng... nhưng vẫn còn thiếu một thứ! Thật vậy, nếu thử tạo Yocto image CY tùy biến bằng các lệnh dưới đây, chúng ta nhận được

```
$ DISTRO=cy-xwayland MACHINE=imx8mp-icore-cy source imx-setup-release.s
h -b imx8mp-build
...
Your build environment has been configured with:

    MACHINE=imx8mp-icore-cy
    SDKMACHINE=i686
    DISTRO=cy-xwayland
    EULA=
BSPDIR=
BUILD_DIR=.
meta-freescale directory found
```

Lưu ý rằng lần này chúng ta đã chỉ định distro `cy-xwayland` và machine `imx8mp-icore-cy` của mình. Khi đó, nếu thử build một image như thường lệ, lỗi sau sẽ phát sinh:

```
$ bitbake core-image-minimal
...
ERROR:  OE-core's config sanity checker detected a potential misconfigu
ration.
    Either fix the cause of this error or at your own risk disable the
checker (see sanity.conf).
    Following is the list of potential problems / advisories:

    DISTRO 'cy-xwayland' not found. Please set a valid DISTRO in your l
ocal.conf
MACHINE=imx8mp-icore-cy is invalid. Please set a valid MACHINE in your
local.conf, environment or other configuration file.
...
```

Lý do là nếu xem file `conf/bblayers.conf`, cả meta layer của chúng ta lẫn của Engicam đều bị thiếu. Để nhanh chóng giải quyết vấn đề này, chúng ta có thể dùng lệnh `bitbake-layers add-layer` như đã thấy trong sách, nhưng chúng ta muốn mọi thứ đã được `repo` sửa sẵn. Để làm vậy, chúng ta cần clone và sửa script `imx-setup-release.sh` như đã làm với script `setup-environment`:

```
$ cd $CY_METADIR
$ cp ../meta-imx/tools/imx-setup-release.sh tools/
```

Sau đó chúng ta phải thay đổi script như dưới đây để thêm meta layer của Engicam và layer của chúng ta:

```
--- a/tools/imx-setup-release.sh
+++ b/tools/imx-setup-release.sh
@@ -188,6 +188,10 @@
 # Enable docker for mx8 machines
 echo "BBLAYERS += \"\${BSPDIR}/sources/meta-virtualization\"" >> conf/
bblayers.conf
+# Add Engicam and CY meta layers
+echo "BBLAYERS += \"\${BSPDIR}/sources/meta-engicam-nxp\"" >> conf/bbl
ayers.conf
+echo "BBLAYERS += \"\${BSPDIR}/sources/meta-cy\"" >> conf/bblayers.conf
+
 echo BSPDIR=$BSPDIR
 echo BUILD_DIR=$BUILD_DIR
```

Bây giờ chúng ta phải commit các sửa đổi để manifest tham chiếu tới:

```
$ git add tools/imx-setup-release.sh
$ git commit -m "tools: add custom imx-setup-release.sh"
[master 4cca1f0] tools: add custom imx-setup-release.sh
 1 file changed, 208 insertions(+)
 create mode 100755 tools/imx-setup-release.sh
```

File manifest giờ nên được sửa như dưới đây:

```
--- a/cy-5.15.71-2.2.0.xml
+++ b/cy-5.15.71-2.2.0.xml
@@ -25,7 +25,6 @@
   <project name="meta-freescale-distro" path="sources/meta-freescale-distro"
remote="community" revision="d5bbb487b2816dfc74984a78b67f7361ce404253"
upstream="kirkstone"/>

   <project name="meta-imx" path="sources/meta-imx" remote="nxp-imx" re
vision="refs/tags/rel_imx_5.15.71_2.2.0" upstream="kirkstone-5.15.71-2.2.0">
-    <linkfile dest="imx-setup-release.sh" src="tools/imx-setup-release.sh"/>
     <linkfile dest="README-IMXBSP" src="README"/>
   </project>

@@ -36,7 +35,8 @@
   <project name="meta-virtualization" path="sources/meta-virtualization"
remote="yocto" revision="9482648daf0bb42ff3475e7892542cf99f3b8d48"
upstream="master"/>
   <project name="poky" path="sources/poky" remote="yocto" revision="24
a3f7b3648185e33133f5d96b184a6cb6524f3d" upstream="kirkstone"/>
   <project name="meta-engicam-nxp" path="sources/meta-engicam-nxp" rem
ote="engicam-support" revision="983ed77473c8567045d88165a33c81c4ac8b4e8
9" upstream="kirkstone"/>
-  <project name="meta-cy" path="sources/meta-cy" remote="cy-support" r
evision="dcd463f76dc7fceb0b01e6cc8a03d78ab9abcef7" upstream="master">
+  <project name="meta-cy" path="sources/meta-cy" remote="cy-support" r
evision="4cca1f0aae0d545114776308e1b1b857c3e0a406" upstream="master">
     <linkfile dest="setup-environment" src="tools/setup-environment"/>
+    <linkfile dest="imx-setup-release.sh" src="tools/imx-setup-release.sh"/>
   </project>
 </manifest>
```

Trong patch trên, chúng ta đã thay commit ID cho layer `meta-cy` và thay symbolic link cho `imx-setup-release.sh` để trỏ tới script tùy biến của mình.

Tại thời điểm này, nếu thử thực thi lại `repo` với manifest mới như trên, chúng ta sẽ có trạng thái sau sau khi `repo sync`:

```
$ ls -l
...
lrwxrwxrwx  1 giometti giometti   42 Dec 29 11:17 imx-setup-release.sh
-> sources/meta-cy/tools/imx-setup-release.sh
lrwxrwxrwx  1 giometti giometti   39 Dec 29 11:17 setup-environment ->
sources/meta-cy/tools/setup-environment
...
```

Khi thực thi lại lệnh:

```
$ DISTRO=cy-xwayland MACHINE=imx8mp-icore-cy source \
        imx-setup-release.sh -b imx8mp-build
```

Giờ script tùy biến của chúng ta được thực thi và file `bblayers.conf` được tạo đúng:

```
$ cat conf/bblayers.conf
...
BBLAYERS += "${BSPDIR}/sources/meta-virtualization"
BBLAYERS += "${BSPDIR}/sources/meta-engicam-nxp"
BBLAYERS += "${BSPDIR}/sources/meta-cy"
```

Nếu thử tạo một image, mọi thứ sẽ hoạt động tốt:

```
$ bitbake core-image-minimal
...
Build Configuration:
BB_VERSION           = "2.0.0"
BUILD_SYS            = "x86_64-linux"
NATIVELSBSTRING      = "ubuntu-22.04"
TARGET_SYS           = "aarch64-poky-linux"
MACHINE              = "imx8mp-icore-cy"
DISTRO               = "cy-xwayland"
...
```

Và việc build có thể tiếp tục mà không có lỗi.

## 13.5 Kiểm tra Common Vulnerabilities and Exposures (CVE) (Checking for Common Vulnerabilities and Exposures (CVEs))

Embedded developer giỏi nên có khả năng viết code tuyệt vời và quản lý, cấu hình chương trình; tuy nhiên, họ cũng nên có khả năng sửa các lỗ hổng có thể có. Trong tình huống này, class cve-check có thể giúp ích.

Class này tìm các CVE đã biết (Common Vulnerabilities and Exposures từ `https://nvd.nist.gov/vuln`) trong khi build bằng BitBake. Để bật nó, chúng ta phải dùng biến `INHERIT` từ một file cấu hình (ví dụ trong `local.conf`):

```
--- a/conf/local.conf
+++ b/conf/local.conf
@@ -35,5 +35,10 @@
 BUILDHISTORY_COMMIT = "1"
 BUILDHISTORY_FEATURES="image package task"

+# Add CVE checks
+INHERIT += "cve-check"
+CVE_CHECK_SHOW_WARNINGS = "0"
+include cve-extra-exclusions.inc
+
 # Then include SRCREV information (if present)
 include srcrev.conf
```

trong đó `CVE_CHECK_SHOW_WARNINGS` có thể được dùng để chỉ định class cve-check có nên tạo warning message trên console khi tìm thấy các CVE chưa được patch hay không (giá trị mặc định là `1`; đó là lý do chúng ta đặt nó thành `0` để chặn chúng).

Câu lệnh `include cve-extra-exclusions.inc` được dùng để lọc bỏ các mục lỗi thời trong CVE database được biết là không ảnh hưởng tới software của Poky.

Bây giờ, nếu tạo lại image, chúng ta sẽ thấy `bitbake` đang tải CVE database:

```
$ bitbake cy-evaluation-image-mx8
...
1: cve-update-db-native-1.0-r0 do_fetch - 1s (pid 3881116)  13% |#     |
...
Complete CVE report summary created at: /home/giometti/yocto/imx-yocto-
bsp/imx8mp-build/tmp/log/cve/cve-summary
NOTE: Generating JSON CVE summary
Complete CVE JSON report summary created at: /home/giometti/yocto/imx-y
octo-bsp/imx8mp-build/tmp/log/cve/cve-summary.json
...
```

Sau khi build, như trên, các báo cáo output của CVE check có sẵn trong `tmp/deploy/cve` dưới dạng cả file text lẫn JSON, cùng các bản tóm tắt image-specific trong các file `tmp/deploy/images/MACHINE/DISTRO*.cve` hoặc `tmp/deploy/images/MACHINE/DISTRO*.json`. Trong ví dụ của chúng ta, ta có

```
$ ls tmp/deploy/images/imx8mp-icore-cy/cy-evaluation-image-mx8*.{cve,js
on}
...
tmp/deploy/images/imx8mp-icore-cy/cy-evaluation-image-mx8-imx8mp-icore-
cy.cve
tmp/deploy/images/imx8mp-icore-cy/cy-evaluation-image-mx8-imx8mp-icore-
cy.json
...
```

> Chúng ta cũng có thể tìm lỗ hổng trong các package cụ thể bằng cách truyền option argument `-c cve_check` cho BitBake. Ví dụ:
>
> ```
> $ bitbake -c cve_check strace
> ...
> Complete CVE report summary created at: /home/giometti/yocto/imx-y
> octo-bsp/imx8mp-build/tmp/log/cve/cve-summary
> NOTE: Generating JSON CVE summary
> Complete CVE JSON report summary created at: /home/giometti/yocto/
> imx-yocto-bsp/imx8mp-build/tmp/log/cve/cve-summary.json
> $ cat tmp/log/cve/cve-summary
> LAYER: meta
> PACKAGE NAME: strace
> PACKAGE VERSION: 5.16
> CVE: CVE-2000-0006
> CVE STATUS: Unpatched
> CVE SUMMARY: strace allows local users to read arbitrary files via
>  memory mapped file names.
> CVSS v2 BASE SCORE: 2.6
> CVSS v3 BASE SCORE: 0.0
> VECTOR: LOCAL
> MORE INFORMATION: https://nvd.nist.gov/vuln/detail/CVE-2000-0006
> ```
>
> Lưu ý rằng output này đã ghi đè output trước đó, vì vậy chúng ta phải thực thi lại lệnh `bitbake cy-evaluation-image-mx8` để khôi phục nội dung trước đó.

Khi build, CVE checker sẽ đưa ra các warning build-time cho mọi vấn đề được phát hiện ở các trạng thái:

- `Unpatched`: Có nghĩa là vấn đề CVE có vẻ ảnh hưởng tới thành phần software và phiên bản đang được compile, và chưa có patch nào được áp dụng để xử lý vấn đề.

- `Patched`: Có nghĩa là ngược lại, một patch xử lý vấn đề đã được áp dụng.

- `Ignored`: Có nghĩa là vấn đề có thể được bỏ qua.

Chúng ta có thể xem các giá trị này cho `cy-evaluation-image-mx8` bằng lệnh sau:

```
$ grep 'CVE STATUS:' tmp/deploy/images/imx8mp-icore-cy/cy-evaluation-im
age-mx8-imx8mp-icore-cy.cve | sort | uniq
CVE STATUS: Ignored
CVE STATUS: Patched
CVE STATUS: Unpatched
```

Trạng thái Patched của một lỗ hổng CVE được phát hiện từ các file patch có định dạng `CVE-YYYY-XXXXX.patch` trong biến `SRC_URI` và nhờ CVE metadata có định dạng `CVE: CVE-YYYY-XXXXX` trong commit message của file patch. Trong Yocto source của chúng ta, ví dụ, ta có

```
$ cd ../sources/
$ find . -name 'CVE-*.patch' | head -5
./meta-virtualization/recipes-containers/podman/podman/CVE-2022-27649.p
atch
./meta-openembedded/meta-networking/recipes-support/wireshark/files/CVE
-2022-3190.patch
./meta-openembedded/meta-networking/recipes-support/ntopng/files/CVE-20
21-36082.patch
./meta-openembedded/meta-networking/recipes-netkit/netkit-rsh/netkit-rs
h/CVE-2019-7282-and-CVE-2019-7283.patch
./meta-openembedded/meta-networking/recipes-netkit/netkit-telnet/files/
CVE-2020-10188.patch
```

Vì vậy, vấn đề CVE CVE-2020-10188 được đánh dấu là đã patch bởi patch có tên `CVE-2020-10188.patch` trong layer `meta-openembedded` cho package `netkit-telnet`, như dưới đây:

```
$ cat ./meta-openembedded/meta-networking/recipes-netkit/netkit-telnet/
files/CVE-2020-10188.patch
From 6ab007dbb1958371abff2eaaad2b26da89b3c74e Mon Sep 17 00:00:00 2001
From: Yi Zhao <yi.zhao@windriver.com>
Date: Fri, 24 Apr 2020 09:43:44 +0800
Subject: [PATCH] telnetd/utility.c: fix CVE-2020-10188

Upstream-Status: Backport
[Fedora: https://src.fedoraproject.org/rpms/telnet/raw/master/f/telnet-
0.17-overflow-exploit.patch]

CVE: CVE-2020-10188

Signed-off-by: Yi Zhao <yi.zhao@windriver.com>
---
 telnetd/utility.c | 32 +++++++++++++++++++++-----------
 1 file changed, 21 insertions(+), 11 deletions(-)
...
```

trong đó chúng ta cũng có thể thấy dòng có tag `CVE: CVE-2020-10188` và, nếu thực hiện một CVE check, ta có

```
$ bitbake -c cve_check netkit-telnet
...
Complete CVE report summary created at: /home/giometti/yocto/imx-yocto-
bsp/imx8mp-build/tmp/log/cve/cve-summary
...
$ cat $BUILDDIR/tmp/log/cve/cve-summary
LAYER: meta-networking
PACKAGE NAME: netkit-telnet
PACKAGE VERSION: 0.17
CVE: CVE-2020-10188
CVE STATUS: Patched
...
```

Mặt khác, nếu recipe liệt kê ID `CVE-YYYY-XXXXX` trong biến `CVE_CHECK_IGNORE`, thì trạng thái CVE được báo là ignored (có thể liệt kê nhiều CVE, cách nhau bằng dấu cách). Ví dụ, trong recipe glibc, chúng ta có

```
$ grep CVE_CHECK_IGNORE poky/meta/recipes-core/glibc/glibc_2.35.bb
CVE_CHECK_IGNORE += "CVE-2020-10029 CVE-2021-27645"
CVE_CHECK_IGNORE += "CVE-2019-1010022 CVE-2019-1010023 CVE-2019-1010024"
CVE_CHECK_IGNORE += "CVE-2019-1010025"
```

Trước khi kết thúc mục này, chúng ta nên lưu ý rằng CVE check này có thể báo false positive hoặc false negative! Đây không phải là một công cụ hoàn hảo. Trong trường hợp này, các vấn đề này có thể được giải quyết trong recipe bằng cách điều chỉnh tên CVE product bằng các biến `CVE_PRODUCT` và `CVE_VERSION`. Ví dụ, recipe của thư viện TIFF nêu rõ:

```
$ cat poky/meta/recipes-multimedia/libtiff/tiff_4.3.0.bb
SUMMARY = "Provides support for the Tag Image File Format (TIFF)"
...
CVE_PRODUCT = "libtiff"
...
# Tested with check from
# https://security-tracker.debian.org/tracker/CVE-2015-7313 and 4.3.0
# doesn't have the issue
CVE_CHECK_IGNORE += "CVE-2015-7313"
# These issues only affect libtiff post-4.3.0 but before 4.4.0,
# caused by 3079627e and fixed by b4e79bfa.
CVE_CHECK_IGNORE += "CVE-2022-1622 CVE-2022-1623"

# Issue is in jbig which we don't enable
CVE_CHECK_IGNORE += "CVE-2022-1210"
...
```

Ở đây, recipe định nghĩa lại giá trị mặc định của `CVE_PRODUCT` (được đặt là tên recipe đơn thuần, tức là giá trị trong `BPN`), điều này chuyển việc kiểm tra với CVE database sang chuỗi `libtiff` thay vì `tiff`.

> Cụ thể, trong biến `CVE_PRODUCT`, có thể chỉ định các cặp vendor và product bằng cú pháp sau:
>
> ```
> CVE_PRODUCT = "tuxera:ntfs-3g"
> ```
>
> trong đó, với recipe `ntfs-3g-ntfsprogs_2022.5.17.bb`, chuỗi `tuxera` là tên vendor trong CVE database, còn `ntfs-3g` là tên product.

Tương tự, nếu phiên bản recipe mặc định `PV` không khớp với số phiên bản của package trong các bản phát hành upstream hoặc trong CVE database, thì biến `CVE_VERSION` có thể được dùng để đặt số phiên bản tương thích với CVE database.

> Về độ tin cậy của công cụ này, bạn đọc nên chú ý lời cảnh báo được nêu trên trang Yocto Project Documentation tại `https://docs.yoctoproject.org/ref-manual/classes.html#cve-check`, nơi họ có thể đọc:
>
> Người dùng nên lưu ý rằng bảo mật là một quá trình, không phải một sản phẩm, và vì vậy việc kiểm tra CVE, phân tích kết quả, patch và cập nhật software cũng nên được làm như một quá trình thường xuyên. Dữ liệu và các giả định cần thiết để CVE checker phát hiện vấn đề một cách đáng tin cậy thường xuyên bị phá vỡ theo nhiều cách khác nhau. Những điều này chỉ có thể được phát hiện bằng cách xem xét chi tiết các vấn đề và lặp lại trên các báo cáo được tạo ra, đồng thời theo dõi những gì xảy ra ở các bản phân phối Linux khác và trong cộng đồng open source rộng lớn hơn.
>
> Chi tiết hơn có trong mục Checking for Vulnerabilities của Development Tasks Manual tại `https://docs.yoctoproject.org/dev-manual/vulnerabilities.html#checking-for-vulnerabilities`.

Bây giờ, để làm một ví dụ đơn giản về cách sửa một lỗ hổng được phát hiện, chúng ta có thể xét báo cáo sau:

```
$ cat tmp/deploy/images/imx8mp-icore-cy/cy-evaluation-image-mx8-imx8mp-
icore-cy.cve
...
LAYER: meta
PACKAGE NAME: libarchive
PACKAGE VERSION: 3.6.1
CVE: CVE-2022-36227
CVE STATUS: Unpatched
CVE SUMMARY: In libarchive before 3.6.2, the software does not check for an
error after calling calloc function that can return with a NULL pointer if the
function fails, which leads to a resultant NULL pointer dereference. NOTE:
the discoverer cites this CWE-476 remark but third parties dispute the code-
execution impact: "In rare circumstances, when NULL is equivalent to the 0x0
memory address and privileged code can access it, then writing or reading
memory is possible, which may lead to code execution."
CVSS v2 BASE SCORE: 0.0
CVSS v3 BASE SCORE: 9.8
VECTOR: NETWORK
MORE INFORMATION: https://nvd.nist.gov/vuln/detail/CVE-2022-36227
...
```

Trong tình huống này, chúng ta có thể xem URL được gợi ý `https://nvd.nist.gov/vuln/detail/CVE-2022-36227`, nơi sau một cuộc tìm kiếm sâu (và không dễ dàng), chúng ta phát hiện có thể tải một patch tại `https://github.com/obiwac/libarchive/commit/bff38efe8c110469c5080d387bec62a6ca15b1a5`. Để lấy raw patch từ website đó, chúng ta có thể dùng lệnh dưới đây:

```
$ wget https://github.com/obiwac/libarchive/commit/bff38efe8c110469c508
0d387bec62a6ca15b1a5.patch -O /tmp/CVE-2022-36227.patch
...
Saving to: '/tmp/CVE-2022-36227.patch'
...
```

Khi đã tải về, patch trông như sau:

```
$ cat /tmp/CVE-2022-36227.patch
From bff38efe8c110469c5080d387bec62a6ca15b1a5 Mon Sep 17 00:00:00 2001
From: obiwac <obiwac@gmail.com>
Date: Fri, 22 Jul 2022 22:41:10 +0200
Subject: [PATCH] libarchive: Handle a `calloc` returning NULL (fixes #1754)

---
 libarchive/archive_write.c | 8 ++++++++
 1 file changed, 8 insertions(+)
...
```

Sau đó chúng ta có thể thêm nó vào recipe qua một file `.bbappend`:

```
$ recipetool appendsrcfile $CY_METADIR libarchive \
        /tmp/CVE-2022-36227.patch
...
NOTE: Writing append file /home/giometti/yocto/imx-yocto-bsp/sources/me
ta-cy/recipes-extended/libarchive/libarchive_3.6.1.bbappend
NOTE: Copying CVE-2022-36227.patch to /home/giometti/yocto/imx-yocto-bs
p/sources/meta-cy/recipes-extended/libarchive/libarchive/CVE-2022-36227
.patch
```

Và meta layer của chúng ta giờ sẽ có một thư mục mới như dưới đây:

```
$ cd $CY_METADIR
$ tree recipes-extended/
recipes-extended/
└── libarchive
    ├── libarchive
    │   └── CVE-2022-36227.patch
    └── libarchive_3.6.1.bbappend

2 directories, 2 files
```

Sau đó, nếu build lại package và build lại một lần nữa với CVE check, chúng ta sẽ có

```
$ bitbake -c cleanall libarchive && bitbake libarchive
...
Complete CVE report summary created at: /home/giometti/yocto/imx-yocto-
bsp/imx8mp-build/tmp/log/cve/cve-summary
$ cat $BUILDDIR/tmp/log/cve/cve-summary
...
LAYER: meta
PACKAGE NAME: libarchive
PACKAGE VERSION: 3.6.1
CVE: CVE-2022-36227
CVE STATUS: Patched
...
```

đúng như mong đợi.

> Chúng ta đã dùng target `clean_all` chỉ để buộc tải lại toàn bộ và build lại package, nhưng có thể bỏ nó cho một lần build lại bình thường.

Trước khi kết thúc mục này, chúng ta nên nhắc rằng bắt đầu từ Yocto Scarthgap, công cụ này đã thay đổi. Cụ thể, khi chuẩn bị file patch, chúng ta phải thêm `CVE: CVE-YYYY-XXXXX` vào patch gốc, và cũng nên thêm tag `Upstream-Status:` với một link tới patch gốc và sign-off của những người làm việc trên backport.

Ví dụ, với package `yasm` trong layer `meta-oe`, trong Scarthgap chúng ta có file patch sau:

```
$ cat meta-openembedded/meta-oe/recipes-devtools/yasm/yasm/CVE-2023-319
75.patch
From b2cc5a1693b17ac415df76d0795b15994c106441 Mon Sep 17 00:00:00 2001
From: Katsuhiko Gondow <gondow@cs.titech.ac.jp>
Date: Tue, 13 Jun 2023 05:00:47 +0900
Subject: [PATCH] Fix memory leak in bin-objfmt (#231)

Upstream-Status: Backport [https://github.com/yasm/yasm/commit/b2cc5a16
93b17ac415df76d0795b15994c106441]
CVE: CVE-2023-31975
---
 modules/objfmts/bin/bin-objfmt.c | 4 ++++
 1 file changed, 4 insertions(+)
```

> Một thói quen tốt là đưa định danh CVE vào tên file patch, commit message của file patch, và tùy chọn vào commit message của recipe.

Mặt khác, nếu nhận thấy CVE có thể được đánh dấu là ignored, chúng ta phải dùng biến mới `CVE_STATUS` với một lý do phù hợp. Ví dụ, trong Scarthgap chúng ta có thể đọc thấy nội dung như dưới đây:

```
$ cat meta-openembedded/meta-oe/recipes-support/atop/atop_2.4.0.bb
SUMMARY = "Monitor for system resources and process activity"
...
CVE_STATUS[CVE-2011-3618] = "fixed-version: The CPE in the NVD database
 doesn't reflect correctly the vulnerable versions."
...
```

Nếu có nhiều CVE cùng trạng thái và lý do, chúng có thể được dùng chung bằng biến `CVE_STATUS_GROUPS`, như recipe glibc làm:

```
$ cat openembedded-core/meta/recipes-core/glibc/glibc_2.39.bb
...
require glibc.inc
require glibc-version.inc

# glibc https://web.nvd.nist.gov/view/vuln/detail?vulnId=CVE-2019-10100
22
# glibc https://web.nvd.nist.gov/view/vuln/detail?vulnId=CVE-2019-10100
23
# glibc https://web.nvd.nist.gov/view/vuln/detail?vulnId=CVE-2019-10100
24
CVE_STATUS_GROUPS = "CVE_STATUS_RECIPE"
CVE_STATUS_RECIPE = "CVE-2019-1010022 CVE-2019-1010023 CVE-2019-1010024"
CVE_STATUS_RECIPE[status] = "disputed: \
Upstream glibc maintainers dispute there is any issue and have no plans
 to address it further. \
this is being treated as a non-security bug and no real threat."
...
```

Cuối cùng, recipe có thể được CVE check bỏ qua hoàn toàn bằng cách đưa danh sách tên package (tức là biến `PN`) vào biến `CVE_CHECK_SKIP_RECIPE`.

## 13.6 Tóm tắt (Summary)

Trong chương này, chúng ta đã thấy cách tối ưu hóa và tùy biến các bản phân phối Yocto của mình, cùng một số best practice để quản lý code. Cuối cùng, chúng ta đã trình bày cách tạo một repo Manifest tùy biến để có thể cố định và tái tạo từ đầu một Yocto image hoàn chỉnh, rồi cách phát hiện và giải quyết các Common Vulnerabilities and Exposures (CVE) có thể có.

Giờ chúng ta đã sẵn sàng đạt được kết quả tốt nhất từ mọi hệ thống Yocto cần làm việc cùng!

Chúc bạn thành công.

