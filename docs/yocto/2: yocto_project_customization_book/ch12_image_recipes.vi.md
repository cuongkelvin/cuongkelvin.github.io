# Chương 12. Image recipe (Image Recipes)

Giờ chúng ta đã biết rõ cách viết recipe cho nhiều loại package, chúng ta cần xem cách viết một loại recipe quan trọng khác: image recipe. Thật vậy, loại recipe này hơi khác các loại đã thấy ở các chương trước vì chúng không tạo ra package, mà thay vào đó, chúng dùng package để tạo root filesystem image!

Trong chương này, chúng ta sẽ xem cách quản lý các recipe tạo ra root filesystem image.

## 12.1 File recipe tùy biến (Custom Recipe Files)

Như đã thấy trong Mục 6.5, chúng ta có thể định nghĩa một file `.bb` là image recipe bằng cách kế thừa class `core-image` và định nghĩa đúng `IMAGE_INSTALL`. Nói đơn giản, một image recipe có thể được viết như dưới đây:

```
$ cat $CY_METADIR/recipes-images/images/cy-image-minimal.bb
SUMMARY = "A small image just capable of allowing a device to boot."
LICENSE = "MIT"

IMAGE_INSTALL = "packagegroup-core-boot"
IMAGE_LINGUAS = " "

inherit core-image

IMAGE_ROOTFS_SIZE ?= "8192"
```

Định nghĩa software bằng một recipe tùy biến cho chúng ta toàn quyền kiểm soát nội dung của image, nhưng chúng ta phải chỉ dẫn đúng cho build system để có được một image chạy được. Thật vậy, chúng ta có thể tạo image bằng lệnh BitBake sau:

```
$ bitbake cy-image-minimal
...
0: cy-image-minimal-1.0-r0 do_rootfs - 2s (pid 128164)   0% |          |
...
```

Và kết quả cuối cùng sẽ là

```
$ basename -a $BUILDDIR/tmp/deploy/images/imx8mp-icore-cy/cy-image-mini
mal*
cy-image-minimal.env
cy-image-minimal-imx8mp-icore-cy-20240523130749.rootfs.manifest
cy-image-minimal-imx8mp-icore-cy-20240523130749.rootfs.tar.zst
cy-image-minimal-imx8mp-icore-cy-20240523130749.rootfs.wic.bmap
cy-image-minimal-imx8mp-icore-cy-20240523130749.rootfs.wic.zst
cy-image-minimal-imx8mp-icore-cy-20240523130749.testdata.json
cy-image-minimal-imx8mp-icore-cy.manifest
cy-image-minimal-imx8mp-icore-cy.tar.zst
cy-image-minimal-imx8mp-icore-cy.testdata.json
cy-image-minimal-imx8mp-icore-cy.wic.bmap
cy-image-minimal-imx8mp-icore-cy.wic.zst
cy-image-minimal-imx-imx-boot-bootpart.wks
```

Tuy nhiên, không chắc rằng kết quả sẽ được chuyển sang target machine và sẽ hoạt động. Đó là lý do, thông thường, để tùy biến một image recipe, developer thích dùng một trong các phương pháp chúng ta sẽ trình bày trong các mục tiếp theo.

Mặt khác, ví dụ này rất thú vị vì nó có thể được dùng để cho bạn đọc thấy cách thay đổi root filesystem bằng cách thay đổi đúng một image recipe. Vậy hãy xem root filesystem bằng cách bung archive mới được tạo:

```
$ mkdir /tmp/cy-image-minimal && \
    tar -xf $BUILDDIR/tmp/deploy/images/imx8mp-icore-cy/cy-image-minima
l-imx8mp-icore-cy.tar.zst \
        -C /tmp/cy-image-minimal
```

Trong thư mục tạm `/tmp/cy-image-minimal`, chúng ta có thể xem nội dung archive:

```
$ cd /tmp/cy-image-minimal && ls
bin   dev  home  media  proc  sbin  sys  usr
boot  etc  lib   mnt    run   srv   tmp  var
```

Và ví dụ, chúng ta có thể đọc nội dung một file như trong ví dụ sau:

```
$ cat etc/issue
NXP i.MX Release Distro 5.15-kirkstone
```

Hơn nữa, chúng ta có thể tìm một file được chỉ định:

```
$ ls usr/bin/strace
ls: cannot access 'usr/bin/strace': No such file or directory
```

Bây giờ chúng ta có thể tiến hành thay đổi recipe `cy-image-minimal` để đổi file `issue` và thêm lệnh `strace`. Để thêm `strace`, chúng ta nên sửa recipe như dưới đây:

```
--- cy-image-minimal.bb
+++ cy-image-minimal.bb
@@ -2,6 +2,7 @@
 LICENSE = "MIT"

 IMAGE_INSTALL = "packagegroup-core-boot"
+IMAGE_INSTALL += "strace"
 IMAGE_LINGUAS = " "

 inherit core-image
```

còn để thay đổi file `issue`, chúng ta có hai khả năng:

1) Chúng ta có thể thử tìm ra package nào cung cấp file `/etc/issue` bằng lệnh `oe-pkgdata-util` như dưới đây:

   ```
   $ oe-pkgdata-util find-path /etc/issue
   base-files: /etc/issue
   ```

   Sau đó chúng ta có thể tạo một file `.bbappend` phù hợp cho `base-files` để override file.

2) Hoặc chúng ta có thể dùng `ROOTFS_POSTPROCESS_COMMAND` để thay đổi file ngay sau khi root filesystem được tạo, bằng cách thêm đoạn code sau:

   ```
   --- cy-image-minimal.bb
   +++ cy-image-minimal.bb
   @@ -8,3 +8,9 @@
    inherit core-image

    IMAGE_ROOTFS_SIZE ?= "8192"
   +
   +CURR_DATE = "${@time.strftime('%Y%m%d%H%M%S', time.gmtime())}"
   +fix_issue() {
   +    echo "=== CY rootfs IMAGE [${CURR_DATE}] ===\n" >> ${IMAGE_R
   OOTFS}${sysconfdir}/issue
   +}
   +ROOTFS_POSTPROCESS_COMMAND = "fix_issue; "
   ```

   Hàm `fix_issue` được thực thi sau khi root filesystem đã được tạo, và nó chỉ đơn giản thay đổi file `issue`.

Trong ví dụ của chúng ta, chúng ta chọn cách thứ hai này, và sau mọi sửa đổi, chúng ta tạo lại image:

```
$ bitbake cy-image-minimal
```

Sau đó, để kiểm chứng mọi thứ có hoạt động tốt không, chúng ta phải re-explode archive của root filesystem:

```
$ rm -rf /tmp/cy-image-minimal
$ tar -xf $BUILDDIR/tmp/deploy/images/imx8mp-icore-cy/cy-image-minimal-
imx8mp-icore-cy.tar.zst \
        -C /tmp/cy-image-minimal
```

Giờ chương trình `strace` đã có mặt:

```
$ find /tmp/cy-image-minimal/ -name strace
/tmp/cy-image-minimal/usr/bin/strace
```

Và file `issue` đã được thay đổi như yêu cầu:

```
$ cat /tmp/cy-image-minimal/etc/issue
NXP i.MX Release Distro 5.15-kirkstone \n \l

=== CY rootfs IMAGE [20240523144953] ===
```

OK, mọi bước được trình bày ở đây đã giải quyết các vấn đề của chúng ta, nhưng như đã nói trước đó, nếu phải sửa một recipe không nằm trong meta layer của mình, chúng ta nên cân nhắc dùng append file. Vậy hãy chuyển sang mục tiếp theo.

## 12.2 Tùy biến bằng bbappend (Customizing by bbappend(ing))

Phương pháp khác để tạo một image tùy biến (thường được xem là cách làm tốt hơn) là dựa nó trên một image có sẵn. Thật vậy, chúng ta có thể muốn thêm các package cụ thể vào các image cụ thể hoặc chỉ thay đổi các thiết lập đã có, khi đó có thể dùng recipe đã có và thay đổi nó qua một file `.bbappend` đặt trong layer tùy biến của mình.

Lấy một ví dụ cơ bản, để trình bày kỹ thuật này, chúng ta có thể xét recipe well-known core-image-minimal.bb được trình bày dưới đây:

```
$ cat sources/poky/meta/recipes-core/images/core-image-minimal.bb
SUMMARY = "A small image just capable of allowing a device to boot."

IMAGE_INSTALL = "packagegroup-core-boot ${CORE_IMAGE_EXTRA_INSTALL}"

IMAGE_LINGUAS = " "

LICENSE = "MIT"

inherit core-image

IMAGE_ROOTFS_SIZE ?= "8192"
IMAGE_ROOTFS_EXTRA_SPACE:append = "${@bb.utils.contains("DISTRO_FEATURE
S", "systemd", " + 4096", "", d)}"
```

Để tạo nó nguyên trạng, chúng ta có thể làm như dưới đây:

```
$ bitbake core-image-minimal
```

Cuối cùng, chúng ta có thể xem nội dung root filesystem như đã làm ở mục trên:

```
$ mkdir /tmp/core-image-minimal && \
    tar -xf $BUILDDIR/tmp/deploy/images/imx8mp-icore-cy/core-image-mini
mal-imx8mp-icore-cy.tar.zst \
        -C /tmp/core-image-minimal
$ cd /tmp/core-image-minimal && ls
bin   dev  home  media  proc  sbin  sys  usr
boot  etc  lib   mnt    run   srv   tmp  var
```

Bây giờ, nếu muốn thêm lệnh `strace` vào image và thay đổi file `/etc/issue` theo cùng cách như ở mục trước, chúng ta có thể dùng một file `.bbappend` như dưới đây:

```
$ cat $CY_METADIR/recipes-images/images/core-image-minimal.bbappend
IMAGE_INSTALL:append = " strace"

CURR_DATE = "${@time.strftime('%Y%m%d%H%M%S', time.gmtime())}"
fix_issue() {
    echo "=== CY-version rootfs IMAGE [${CURR_DATE}] ===\n" >> ${IMAGE_R
OOTFS}${sysconfdir}/issue
}
ROOTFS_POSTPROCESS_COMMAND = "fix_issue; "
```

Lần này, chúng ta đã dùng toán tử `:append` để thêm package `strace` vào biến `IMAGE_INSTALL`, còn hàm `fix_issue` được định nghĩa như trước.

> Bạn đọc nên chú ý dấu cách ở đầu sau dấu nháy mở và trước tên package. Dấu cách này là bắt buộc vì toán tử `:append` không thêm dấu cách.

Bây giờ chúng ta có thể tạo lại image:

```
$ bitbake core-image-minimal
```

Rồi kiểm chứng mọi thứ đã sẵn sàng, vì vậy chúng ta phải xóa phiên bản image trước rồi bung lại archive:

```
$ rm -rf /tmp/core-image-minimal/
$ mkdir /tmp/core-image-minimal && \
    tar -xf $BUILDDIR/tmp/deploy/images/imx8mp-icore-cy/core-image-mini
mal-imx8mp-icore-cy.tar.zst \
        -C /tmp/core-image-minimal
```

Hơn nữa, chúng ta có thể kiểm chứng mọi thứ đã sẵn sàng theo cùng cách như trước:

```
$ find /tmp/core-image-minimal/ -name strace
/tmp/core-image-minimal/usr/bin/strace
$ cat /tmp/core-image-minimal/etc/issue
NXP i.MX Release Distro 5.15-kirkstone \n \l

=== CY-version rootfs IMAGE [20240524083824] ===
```

Bây giờ chúng ta có thể chuyển sang mục tiếp theo để xem một cách khác để tạo image recipe bằng cách clone một recipe đã có.

## 12.3 Clone và đổi tên (Cloning and Renaming)

Bằng giải pháp `.bbappend`, chúng ta có thể giải quyết phần lớn các vấn đề tùy biến thông thường. Tuy nhiên, đôi khi các thay đổi nhiều đến mức việc tạo một image dựa trên một image đã có, bằng cách clone file recipe vào layer tùy biến và đổi tên nó, có thể dễ hơn.

Chỉ để làm một ví dụ đơn giản, chúng ta có thể clone recipe `engicam-evaluation-image-mx8.bb` bằng cách chép nó vào meta layer của mình (và đặt một tên mới phù hợp):

```
$ cp meta-engicam-nxp/recipes-images/images/engicam-evaluation-image-mx
8.bb \
        $CY_METADIR/recipes-images/images/cy-evaluation-image-mx8.bb
```

Sau đó chúng ta có thể thay đổi nội dung recipe theo nhu cầu:

```
--- recipes-images/images/cy-evaluation-image-mx8.bb
+++ recipes-images/images/cy-evaluation-image-mx8.bb
@@ -1,8 +1,9 @@
 # Copyright (C) 2015 Freescale Semiconductor
 # Copyright 2017-2019 NXP
+# Copyright 2024 Rodolfo Giometti <giometti@enneenne.com>
 # Released under the MIT license (see COPYING.MIT for the terms)

-DESCRIPTION = "Engicam evaluation image"
+DESCRIPTION = "CY evaluation image"
 LICENSE = "MIT"

 inherit core-image
@@ -14,6 +15,13 @@
   ln -sf brcmfmac43430-sdio.bin brcmfmac43430-sdio.engi,imx8-icore.bin
 }

+ROOTFS_POSTPROCESS_COMMAND:append = "fix_issue;"
+CURR_DATE = "${@time.strftime('%Y%m%d%H%M%S', time.gmtime())}"
+
+fix_issue() {
+  echo "=== CY rootfs IMAGE [${CURR_DATE}] ===\n" >> ${IMAGE_ROOTFS}${s
ysconfdir}/issue
+}
+
 ## Select Image Features
 IMAGE_FEATURES += " \
         debug-tweaks \
```

Bây giờ chúng ta có thể tạo image mới như dưới đây:

```
$ bitbake cy-evaluation-image-mx8
...
Currently  1 running tasks (8898 of 8909)  99% |###################### |
0: cy-evaluation-image-mx8-1.0-r0 do_rootfs - 3s (pid 274357)
...
```

Nếu mọi thứ hoạt động tốt, chúng ta sẽ có các file sau trong không gian deploy:

```
$ basename -a $BUILDDIR/tmp/deploy/images/imx8mp-icore-cy/cy-evaluation
-image-mx8*
cy-evaluation-image-mx8.env
cy-evaluation-image-mx8-imx8mp-icore-cy-20240524090658.rootfs.manifest
cy-evaluation-image-mx8-imx8mp-icore-cy-20240524090658.rootfs.tar.zst
cy-evaluation-image-mx8-imx8mp-icore-cy-20240524090658.rootfs.wic.bmap
cy-evaluation-image-mx8-imx8mp-icore-cy-20240524090658.rootfs.wic.zst
cy-evaluation-image-mx8-imx8mp-icore-cy-20240524090658.testdata.json
cy-evaluation-image-mx8-imx8mp-icore-cy.manifest
cy-evaluation-image-mx8-imx8mp-icore-cy.tar.zst
cy-evaluation-image-mx8-imx8mp-icore-cy.testdata.json
cy-evaluation-image-mx8-imx8mp-icore-cy.wic.bmap
cy-evaluation-image-mx8-imx8mp-icore-cy.wic.zst
cy-evaluation-image-mx8-imx-imx-boot-bootpart.wks
```

OK, giờ để thử image mới được tạo, chúng ta phải ghi lại thẻ microSD như dưới đây:

```
$ zstdcat tmp/deploy/images/imx8mp-icore-cy/cy-evaluation-image-mx8-imx
8mp-icore-cy.wic.zst | \
    sudo dd of=<DISK> bs=8M conv=fdatasync status=progress
```

> Đừng quên thay `<DISK>` bằng block device của thẻ microSD của bạn!

Khi thẻ microSD đã sẵn sàng, chúng ta có thể kiểm tra mọi thứ có hoạt động như mong đợi không. Nếu boot hệ thống, trên serial console, chúng ta sẽ thấy output được trình bày dưới đây:

```
...
[  OK  ] Reached target Graphical Interface.
         Starting Record Runlevel Change in UTMP...
[  OK  ] Finished Record Runlevel Change in UTMP.

NXP i.MX Release Distro 5.15-kirkstone imx8mp-icore-cy ttymxc1

=== CY rootfs IMAGE [20240822105421] ===

imx8mp-icore-cy login:
```

Tuyệt! Giờ chúng ta đã có root filesystem tùy biến của riêng mình. Vì vậy có thể chuyển sang mục tiếp theo để xem cách thêm các tùy biến khác.

## 12.4 Tùy biến bằng file cấu hình (Customizing by Configuration Files)

Một cách thú vị khác để tùy biến một image là thêm package qua file cấu hình `local.conf` (hoặc qua bất kỳ file cấu hình có sẵn nào khác). Phương pháp này nói chung chỉ cho phép developer thêm package và không linh hoạt bằng việc tạo image tùy biến của riêng mình như đã thấy trong các ví dụ tùy biến trước.

Hơn nữa, chúng ta nên tính đến việc khi thêm package bằng biến local theo cách này, các thay đổi biến này có hiệu lực cho mọi bản build và do đó ảnh hưởng tới mọi image, điều có thể không phải là thứ chúng ta cần.

Ví dụ, nếu thêm dòng dưới đây vào file `local.conf`, chúng ta có thể thêm package `strace` vào mọi image:

```
IMAGE_INSTALL:append = " strace"
```

Tuy nhiên, có thể mở rộng cú pháp để biến chỉ áp dụng cho một image cụ thể, như trong ví dụ sau:

```
IMAGE_INSTALL:append:pn-cy-evaluation-image-mx8 = " strace"
```

Ví dụ này chỉ thêm `strace` vào image `cy-evaluation-image-mx8` của chúng ta.

> Lưu ý rằng để thêm một package qua `IMAGE_INSTALL` vào image bằng file cấu hình local, chúng ta nên dùng toán tử `:append`. Thật vậy, không khuyến khích dùng toán tử `+=` để append package vào `IMAGE_INSTALL` vì `core-image.bbclass` (một image class khác) thực hiện thiết lập sau:
>
> ```
> IMAGE_INSTALL ?= "${CORE_IMAGE_BASE_INSTALL}"
> ```
>
> Khởi tạo một biến bằng `?=` rồi dùng phép toán `+=` với nó sẽ dẫn đến hành vi không mong đợi khi được dùng trong `local.conf` (hoặc bất kỳ file cấu hình nào khác), và trong một image recipe cũng có thể thành công hoặc không tùy theo tình huống cụ thể. Trong cả hai trường hợp, hành vi này trái với cách mà phần lớn người dùng mong đợi toán tử `+=` hoạt động.

Một cách khác để phân biệt một cấu hình bằng file cấu hình có thể được thực hiện qua `bitbake` với option argument `-R`. Nếu nhớ lại những gì đã thấy trong Mục 4.1.2, bằng cách chỉ định option argument `-R`, chúng ta có thể yêu cầu `bitbake` đọc thêm một file cấu hình sau `bitbake.conf`:

```
$ bitbake -h
...
 -R POSTFILE, --postread=POSTFILE
                        Read the specified file after bitbake.conf.
...
```

Vì vậy chúng ta có thể compile image như trong ví dụ sau:

```
$ bitbake -R conf/cy-evaluation-image.conf cy-evaluation-image-mx8
```

trong đó trong file `conf/cy-evaluation-image.conf`, chúng ta có thể đặt mọi thiết lập muốn cung cấp cho target image được chỉ định. Chỉ cần thay đổi file `.conf`, chúng ta có thể thay đổi cấu hình image cuối cùng (một ví dụ thực tế về kỹ thuật này được trình bày trong Mục 13.1).

Cuối cùng, chúng ta nên nhắc đến `IMAGE_FEATURES`. Thông thường, chúng ta cấu hình biến này trong một image recipe để chọn danh sách các feature cần đưa vào image, nhưng có thể dùng nó từ file `local.conf` (dù best practice quy định rằng chúng ta không nên làm vậy mà hãy dùng `EXTRA_IMAGE_FEATURES` thay thế).

Như đã giới thiệu trong Mục 6.3.4 và 6.5.1, chúng ta có thể xem `IMAGE_FEATURES` (và `EXTRA_IMAGE_FEATURES`) là một biến chứa danh sách các công tắc báo cho build system tự động append một tập package nhất định, và/hoặc các cấu hình package khác nhau, vào biến `IMAGE_INSTALL`. Tùy theo base class của target image, chúng ta có một tập feature có thể chọn để thêm hoặc không vào image cuối cùng. Recipe có thể kiểm tra (và append) các feature cụ thể trong biến này để thay đổi cấu hình/quy trình build mặc định tương ứng.

Ví dụ, chúng ta có thể hình dung việc bật có chọn lọc các công cụ debug tùy theo image recipe như dưới đây:

```
EXTRA_IMAGE_FEATURES:append:pn-cy-evaluation-image-mx8 = " tools-debug"
```

> Hãy nhớ dấu cách thêm ở đầu chuỗi `tools-debug`!

Lấy một ví dụ đơn giản, chúng ta có thể thay đổi `local.conf` để làm vậy:

```
--- a/conf/local.conf
+++ b/conf/local.conf
@@ -23,6 +23,7 @@ ACCEPT_FSL_EULA = "1"
 PACKAGE_CLASSES = "package_ipk"
 EXTRA_IMAGE_FEATURES += "package-management"
 #EXTRA_IMAGE_FEATURES += "dbg-pkgs"
+EXTRA_IMAGE_FEATURES:append:pn-cy-evaluation-image-mx8 = " tools-debug"

 # Limiting HW resources
 BB_NUMBER_THREADS = "4"
```

Bây giờ, nếu kiểm tra nội dung của `EXTRA_IMAGE_FEATURES` khi tạo `cy-evaluation-image-mx8`, chúng ta sẽ có output sau:

```
$ cy-vars EXTRA_IMAGE_FEATURES cy-evaluation-image-mx8
EXTRA_IMAGE_FEATURES="debug-tweaks package-management tools-debug"
```

Mặt khác, nếu làm tương tự khi tạo image `engicam-evaluation-image-mx8`, chúng ta có

```
$ cy-vars EXTRA_IMAGE_FEATURES engicam-evaluation-image-mx8
EXTRA_IMAGE_FEATURES="debug-tweaks package-management"
```

Vì vậy chúng ta có đúng hành vi mong đợi.

## 12.5 Thay đổi cấu hình hệ thống (Changing the System Configuration)

Khi đã định nghĩa image tùy biến của mình (trong ví dụ của chúng ta là `cy-evaluation-image-mx8`), có thể thú vị khi xem một số kỹ thuật thông dụng (và hữu ích) để sửa một số thiết lập toàn cục, ví dụ thêm user của hệ thống (và mật khẩu của họ) hoặc cấu hình mạng, v.v.

### 12.5.1 Thêm user (Adding Users)

Trong trường hợp cần nhiều user hơn những user được định nghĩa mặc định trong một image recipe, chúng ta có thể xét recipe mẫu “useradd” trong meta layer `poky`:

```
$ cat poky/meta-skeleton/recipes-skeleton/useradd/useradd-example.bb
SUMMARY = "Example recipe for using inherit useradd"
DESCRIPTION = "This recipe serves as an example for using features fro
m useradd.bbclass"
SECTION = "examples"
...
```

Phần thú vị của recipe này được trình bày dưới đây:

```
...
PACKAGES =+ "${PN}-user3"

EXCLUDE_FROM_WORLD = "1"

inherit useradd

# You must set USERADD_PACKAGES when you inherit useradd. This
# lists which output packages will include the user/group
# creation code.
USERADD_PACKAGES = "${PN} ${PN}-user3"

# You must also set USERADD_PARAM and/or GROUPADD_PARAM when
# you inherit useradd.

# USERADD_PARAM specifies command line options to pass to the
# useradd command. Multiple users can be created by separating
# the commands with a semicolon. Here we'll create two users,
# user1 and user2:
USERADD_PARAM:${PN} = "-u 1200 -d /home/user1 -r -s /bin/bash user1; -u
 1201 -d /home/user2 -r -s /bin/bash user2"

# user3 will be managed in the useradd-example-user3 pacakge:
# As an example, we use the -P option to set clear text password for
# user3
USERADD_PARAM:${PN}-user3 = "-u 1202 -d /home/user3 -r -s /bin/bash -P
'user3' user3"

# GROUPADD_PARAM works the same way, which you set to the options
# you'd normally pass to the groupadd command. This will create
# groups group1 and group2:
GROUPADD_PARAM:${PN} = "-g 880 group1; -g 890 group2"

# Likewise, we'll manage group3 in the useradd-example-user3 package:
GROUPADD_PARAM:${PN}-user3 = "-g 900 group3"
...
```

Ngoài biến `EXCLUDE_FROM_WORLD`, có thể được dùng để loại một recipe khỏi các bản build world (tức là `bitbake world`), chúng ta thấy trong `PACKAGES` có package bổ sung `useradd-example-user3` được append. Sau đó cả hai package được thêm vào `USERADD_PACKAGES` để liệt kê cho Yocto build system biết những output package nào sẽ chứa code tạo user/group.

Biến `USERADD_PARAM` chỉ định các tùy chọn command-line cần truyền cho lệnh `useradd`. Trong ví dụ của chúng ta, hai user được tạo, và để chỉ định lệnh cho mỗi user, chúng ta ngăn cách các lệnh bằng dấu chấm phẩy. Cũng lưu ý rằng, bằng một override, chúng ta chỉ định các lệnh khác nhau cho mỗi package.

Tuy nhiên, để làm một ví dụ thực tế, chúng ta nên làm lại một chút recipe ví dụ ở trên như dưới đây:

```
$ cat $CY_METADIR/recipes-core/useradd/useradd-example.bb
SUMMARY = "Example recipe for using inherit useradd"
DESCRIPTION = "This recipe serves as an example for using features from
 useradd.bbclass"
SECTION = "examples"
...
# USERADD_PARAM specifies command line options to pass to the
# useradd command. Multiple users can be created by separating
# the commands with a semicolon. Here we'll create two users,
# user1 and user2:
USERADD_PARAM:${PN} = "-u 200 -d /home/user1 -r -s /bin/bash user1; -u
201 -d /home/user2 -r -s /bin/bash user2"

# user3 will be managed in the useradd-example-user3 pacakge:
# As an example, we use the -p option to set a password for user3
# obtained by using the command:
#     mkpasswd -m sha-512 'cY!pass1'
#     $6$E80GB11MDb1xon3p$Hwhz.yRgjcW33qIaOVksyckbwX7UxLqUXsfscAuGbfkM6
IYjlnnPoNHUdpQJYkEDNwLVjpm3xt1GKtWFmTnNv/
USERADD_PARAM:${PN}-user3 = "-u 202 -d /home/user3 -r -s /bin/bash -p '
\$6\$E80GB11MDb1xon3p\$Hwhz.yRgjcW33qIaOVksyckbwX7UxLqUXsfscAuGbfkM6IYj
lnnPoNHUdpQJYkEDNwLVjpm3xt1GKtWFmTnNv/' user3"

# GROUPADD_PARAM works the same way, which you set to the options
# you'd normally pass to the groupadd command. This will create
# groups group1 and group2:
GROUPADD_PARAM:${PN} = "-g 880 group1; -g 890 group2"

# Likewise, we'll manage group3 in the useradd-example-user3 package:
GROUPADD_PARAM:${PN}-user3 = "-g 900 group3"
```

Trong recipe trên, chúng ta đã định nghĩa lại home page của các user là `/home/user1`, `/home/user2` và `/home/user3`, và cũng đã dùng lệnh `mkpasswd` để tạo đúng một mật khẩu phù hợp với các bản phát hành mới nhất của lệnh `useradd`. Thật vậy, lệnh `useradd` không còn chấp nhận option argument `-P` để đặt mật khẩu của user nữa.

> Bạn đọc nên chú ý rằng output của `mkpasswd` như dưới đây:
>
> ```
> $ mkpasswd -m sha-512 'cY!pass1'
> $6$E80GB11MDb1xon3p$Hwhz.yRgjcW33qIaOVksyckbwX7UxLqUXsfscAuGbfkM6I
> YjlnnPoNHUdpQJYkEDNwLVjpm3xt1GKtWFmTnNv/
> ```
>
> còn giá trị được truyền cho option argument `-p` là
>
> ```
> '\$6\$E80GB11MDb1xon3p\$Hwhz.yRgjcW33qIaOVksyckbwX7UxLqUXsfscAuGbf
> kM6IYjlnnPoNHUdpQJYkEDNwLVjpm3xt1GKtWFmTnNv/'
> ```
>
> Trong chuỗi trên, mọi ký tự `$` đều được escape thành `\$`.

OK, giờ chúng ta có thể tạo các package mới:

```
$ bitbake useradd-example
```

Và nếu mọi thứ hoạt động tốt, chúng ta sẽ có kết quả như dưới đây:

```
$ cy-ipk find useradd-example
cy-ipk: searching in /home/giometti/yocto/imx-yocto-bsp/imx8mp-build...
tmp/deploy/ipk/armv8a/useradd-example_1.0-r1_armv8a.ipk
tmp/deploy/ipk/armv8a/useradd-example-dbg_1.0-r1_armv8a.ipk
tmp/deploy/ipk/armv8a/useradd-example-dev_1.0-r1_armv8a.ipk
tmp/deploy/ipk/armv8a/useradd-example-user3_1.0-r1_armv8a.ipk
```

Nếu xem bên trong các package mới, chúng ta có output sau:

```
$ cy-ipk inspect tmp/deploy/ipk/armv8a/useradd-example_1.0-r1_armv8a.ipk
drwxr-xr-x root/root         0 2011-04-05 23:00 ./usr/
drwxr-xr-x root/root         0 2011-04-05 23:00 ./usr/share/
drwxr-xr-x user1/group1      0 2011-04-05 23:00 ./usr/share/user1/
-rw-r--r-- user1/group1      0 2011-04-05 23:00 ./usr/share/user1/file1
-rw-r--r-- user1/group1      0 2011-04-05 23:00 ./usr/share/user1/file2
drwxr-xr-x user2/group2      0 2011-04-05 23:00 ./usr/share/user2/
-rw-r--r-- user2/group2      0 2011-04-05 23:00 ./usr/share/user2/file2
-rw-r--r-- user2/group2      0 2011-04-05 23:00 ./usr/share/user2/file3
$ cy-ipk inspect tmp/deploy/ipk/armv8a/useradd-example-user3_1.0-r1_arm
v8a.ipk
drwxr-xr-x root/root         0 2011-04-05 23:00 ./usr/
drwxr-xr-x root/root         0 2011-04-05 23:00 ./usr/share/
drwxr-xr-x user3/group3      0 2011-04-05 23:00 ./usr/share/user3/
-rw-r--r-- user3/group3      0 2011-04-05 23:00 ./usr/share/user3/file3
-rw-r--r-- user3/group3      0 2011-04-05 23:00 ./usr/share/user3/file4
```

đây chính xác là những gì chúng ta mong đợi. OK, giờ chúng ta có thể thêm các package này vào image như dưới đây:

```
--- recipes-images/images/cy-evaluation-image-mx8.bb
+++ recipes-images/images/cy-evaluation-image-mx8.bb
@@ -102,6 +102,8 @@
         ${ENGICAM_PKG} \
         ${EXTRA_PACKAGE_INSTALL} \
         ${G2D_SAMPLES} \
+        \
+        useradd-example useradd-example-user3 \
 "

 IMAGE_INSTALL += " \
```

Sau đó chúng ta phải tạo lại image:

```
$ bitbake cy-evaluation-image-mx8
```

Khi xong, chúng ta phải ghi lại thẻ microSD như đã làm ở trên để cập nhật image, rồi có thể kiểm chứng mọi user mới đã có mặt:

```
imx8mp-icore-cy login: root
root@imx8mp-icore-cy:~# id user1
uid=200(user1) gid=200(user1) groups=200(user1)
root@imx8mp-icore-cy:~# id user2
uid=201(user2) gid=201(user2) groups=201(user2)
root@imx8mp-icore-cy:~# id user3
uid=202(user3) gid=202(user3) groups=202(user3)
```

Chúng ta cũng có thể thử đăng nhập qua SSH để thử mật khẩu của user3 mà chúng ta đã đặt là `cY!pass1` như dưới đây:

```
$ ssh user3@192.168.32.132
user3@192.168.32.132's password:
user3@imx8mp-icore-cy:~$
```

> Bạn đọc nên nhớ đặt lại host key bằng lệnh này:
>
> ```
> $ ssh-keygen -f "/home/giometti/.ssh/known_hosts" -R "192.168.32.1
> 32"
> ```

Tuyệt, việc đăng nhập hoạt động như mong đợi. Sau đó chúng ta có thể kiểm tra home của user:

```
user3@imx8mp-icore-cy:~$ whoami
user3
user3@imx8mp-icore-cy:~$ pwd
/home/user3
user3@imx8mp-icore-cy:~$ ls -l
total 0
-rw-r--r-- 1 user3 group3 0 Mar  9  2018 file3
-rw-r--r-- 1 user3 group3 0 Mar  9  2018 file4
```

OK, mọi thứ đã sẵn sàng.

### 12.5.2 Thay đổi thiết lập của root (Changing Root’s Settings)

Nếu cần thay đổi (hoặc đặt) mật khẩu cho user root, chúng ta có thể làm như dưới đây:

```
inherit extrausers

EXTRA_USERS_PARAMS = " \
    ${@bb.utils.contains('IMAGE_FEATURES', 'debug-tweaks', '', "usermod
 -p '\$6\$VXgIp2C84GuR9Hjo\$NNHWN/RINO.qQLyOON2CIKN7f28SAMsgQ8hacDg59ig
6p6gHJVRMo/iybK81VRFwRZSj.B9qD3EcAnsQy.dLE.' root;", d)} \
"
```

Thiết lập rất giống như ở mục trên, nhưng lần này trước tiên chúng ta kiểm tra biến `IMAGE_FEATURES` xem có thiết lập `debug-tweaks` không, sau đó đặt `EXTRA_USERS_PARAMS` chứa lệnh `usermod`. Khi kế thừa class `extrausers`, biến này cung cấp các thao tác user và group image-level. Đây là một phương pháp toàn cục hơn để cung cấp cấu hình user và group so với việc dùng class `useradd`, class gắn cấu hình user và group với một recipe cụ thể.

Nếu xem `extrausers.bbclass` trong meta layer `poky`, chúng ta có danh sách các lệnh có thể cấu hình bằng `EXTRA_USERS_PARAMS`:

```
$ cat poky/meta/classes/extrausers.bbclass
# This bbclass is used for image level user/group configuration.
# Inherit this class if you want to make EXTRA_USERS_PARAMS effective.

# Below is an example showing how to use this functionality.
# IMAGE_CLASSES += "extrausers"
# EXTRA_USERS_PARAMS = "\
#     useradd -p '' tester; \
#     groupadd developers; \
#     userdel nobody; \
#     groupdel -g video; \
#     groupmod -g 1020 developers; \
#     usermod -s /bin/sh tester; \
# "
...
```

Trong trường hợp muốn thay đổi home directory của root, chúng ta có thể dùng biến `ROOT_HOME`. Nó mặc định là

```
$ bitbake -e cy-evaluation-image-mx8
...
#
# $ROOT_HOME
#   set /home/giometti/yocto/imx-yocto-bsp/sources/poky/meta/conf/bitbak
e.conf:87
#     [_defaultval] "/home/root"
ROOT_HOME="/home/root"
...
```

> Giá trị mặc định khác thường này, thay vì `/root` phổ biến hơn, có lẽ được dùng vì một số giải pháp embedded thích một root filesystem read-only và muốn giữ dữ liệu ghi được ở một nơi.

Chúng ta có thể override giá trị mặc định bằng cách đặt biến này trong bất kỳ layer nào hoặc trong file `local.conf`.

### 12.5.3 Đặt hostname tùy biến (Setting a Custom Hostname)

Theo mặc định, hostname được cấu hình (tức là tên trong `/etc/hostname`) trong một image giống với tên machine; thật vậy, nếu xem recipe `base-files`, chúng ta thấy các thiết lập sau:

```
$ cat sources/poky/meta/recipes-core/base-files/base-files_3.0.14.bb
...
# By default the hostname is the machine name. If the hostname is unset
# then a /etc/hostname file isn't written, suitable for environments
# with dynamic hostnames.
#
# The hostname can be changed outside of this recipe by using
# hostname:pn-base-files = "my-host-name".
hostname = "${MACHINE}"
...
```

Như được nêu ở trên, chúng ta có thể tùy biến tên này bằng cách thay đổi giá trị biến `hostname` trong recipe `base-files`, dùng append file hoặc file cấu hình. Trong trường hợp thứ nhất, chúng ta có thể làm như dưới đây:

```
hostname = "myhostname"
```

còn trong trường hợp thứ hai, chúng ta nên có thiết lập tiếp theo dùng một override:

```
hostname:pn-base-files = "myhostname"
```

Thiết lập này có thể hữu ích, ví dụ, để cố định một hostname chung tách rời khỏi tên machine, hoặc để append thêm thứ gì đó có ý nghĩa như dưới đây:

```
hostname:append:pn-base-files = "${@'-devel' if d.getVar('DEVELOPMENT'
) == '1' else ''}"
```

Trong trường hợp `DEVELOPMENT` được đặt thành `1`, thì `hostname` trở thành `${MACHINE}-devel` (chủ đề này sẽ được giải thích rõ hơn trong Mục 13.1).

### 12.5.4 Đặt cấu hình mạng mặc định (Setting the Default Network Configuration)

Như đã thấy từ các chương đầu (xem Mục 2.5), cấu hình mạng mặc định có thể có thiết lập sai; thật vậy, chúng ta đã cần tự thêm file sau để buộc Systemd thiết lập đúng cấu hình mạng:

```
# cat > /etc/systemd/network/50-eth0.network <<__EOF
[Match]
Name=eth0

[Network]
Address=192.168.32.132/24
Gateway=192.168.32.2
DNS=192.168.32.2
__EOF
```

Tuy nhiên, chúng ta muốn có sẵn một cấu hình mạng cố định trong image tùy biến của mình, vì vậy hãy xem cách làm việc đó.

Vấn đề chính ở đây không phải là cách cấu hình Systemd, vì chúng ta đã biết phải thêm file `50-eth0.network` ở trên, mà là recipe nào cần thay đổi cho phù hợp với nhu cầu.

Ở bước đầu tiên, chúng ta có thể xem các file trong thư mục `/etc/systemd/network/`:

```
# ls -l /etc/systemd/network/
total 4
-rw-r--r-- 1 root root 37 Mar  9  2018 89-unmanage.network
lrwxrwxrwx 1 root root  9 Mar  9  2018 99-default.link -> /dev/null
```

Vì vậy chúng ta có thể thử hỏi build system xem package nào tạo ra file đó:

```
$ oe-pkgdata-util find-path /etc/systemd/network/89-unmanage.network
systemd: /etc/systemd/network/89-unmanage.network
```

Sau đó chúng ta có thể xem các file recipe của `systemd`:

```
$ bitbake-layers show-appends systemd
...
=== Matching recipes: ===
systemd:
  meta                 1:250.5
```

Tuy nhiên, ở đó không có gì về file `89-unmanage.network`, vì vậy hãy thử tìm trong một số file `.bbappend`:

```
$ bitbake-layers show-appends systemd
...
=== Matched appended recipes ===
systemd_250.5.bb:
  /home/giometti/yocto/imx-yocto-bsp/sources/meta-imx/meta-bsp/recipes-
core/systemd/systemd_%.bbappend
```

Tuyệt! Giờ chúng ta đã tìm ra:

```
$ cat /home/giometti/yocto/imx-yocto-bsp/sources/meta-imx/meta-bsp/reci
pes-core/systemd/systemd_%.bbappend
FILESEXTRAPATHS:prepend := "${THISDIR}/${BPN}:"
SRC_URI += " \
            file://0001-systemd-udevd.service.in-Set-PrivateMounts-to-n
o-to-.patch \
            file://0020-logind.conf-Set-HandlePowerKey-to-ignore.patch \
            file://89-unmanage.network \
"

PACKAGECONFIG[unmanaged-network] = ""

do_install:append () {

    # Disable the assignment of the fixed network interface name
    install -d ${D}${sysconfdir}/systemd/network
    ln -s /dev/null ${D}${sysconfdir}/systemd/network/99-default.link

    # Configure the network as unmanaged
    if [ "${@bb.utils.filter('PACKAGECONFIG', 'unmanaged-network', d)}"
 ]; then
        install -Dm 0644 ${WORKDIR}/89-unmanage.network ${D}${sysconfdi
r}/systemd/network/
    fi
...
```

Vì vậy chúng ta có thể nghĩ đến việc đặt sửa đổi của mình ở đây; tuy nhiên, với Systemd, cách đúng để làm việc đó là dùng package `systemd-conf`. Thật vậy, nếu xem file recipe của nó, chúng ta sẽ thấy nội dung như dưới đây:

```
$ bitbake-layers show-recipes -f systemd-conf
...
=== Matching recipes: ===
/home/giometti/yocto/imx-yocto-bsp/sources/poky/meta/recipes-core/syste
md/systemd-conf_1.0.bb
$ cat /home/giometti/yocto/imx-yocto-bsp/sources/poky/meta/recipes-core
/systemd/systemd-conf_1.0.bb
SUMMARY = "Systemd system configuration"
DESCRIPTION = "Systemd may require slightly different configuration \
for different machines. For example, qemu machines require a longer \
DefaultTimeoutStartSec setting."
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COREBASE}/meta/COPYING.MIT;md5=3da9cfbcb78
8c80a0384361b4de20420"

PE = "1"

PACKAGECONFIG ??= "dhcp-ethernet"
PACKAGECONFIG[dhcp-ethernet] = ""
SRC_URI = "\
    file://journald.conf \
    file://logind.conf \
    file://system.conf \
    file://system.conf-qemuall \
    file://wired.network \
"

do_install() {
    install -D -m0644 ${WORKDIR}/journald.conf ${D}${systemd_unitdir}
/journald.conf.d/00-${PN}.conf
    install -D -m0644 ${WORKDIR}/logind.conf ${D}${systemd_unitdir}/l
ogind.conf.d/00-${PN}.conf
    install -D -m0644 ${WORKDIR}/system.conf ${D}${systemd_unitdir}/s
ystem.conf.d/00-${PN}.conf

        if ${@bb.utils.contains('PACKAGECONFIG', 'dhcp-ethernet', 'true
', 'false', d)}; then
                install -D -m0644 ${WORKDIR}/wired.network ${D}${systemd_un
itdir}/network/80-wired.network
        fi
}
...
```

Như chúng ta thấy ở trên, package này thực hiện nhiều thiết lập cấu hình cho Systemd; cụ thể, chúng ta nên chú ý rằng nếu `dhcp-ethernet` được chỉ định trong `PACKAGECONFIG`, thì file `wired.network` được cài. File này chứa các thiết lập sau:

```
$ cat /home/giometti/yocto/imx-yocto-bsp/sources/poky/meta/recipes-core
/systemd/systemd-conf/wired.network
[Match]
Type=ether
Name=!veth*
KernelCommandLine=!nfsroot
KernelCommandLine=!ip

[Network]
DHCP=yes

[DHCP]
UseMTU=yes
RouteMetric=10
ClientIdentifier=mac
```

đây là các thiết lập phù hợp để dùng giao thức DHCP trên mọi Ethernet interface trong hệ thống. Vì vậy, những gì chúng ta có thể làm ở đây là tạo một file `.bbappend` rỗng cho `systemd-conf` như dưới đây:

```
$ recipetool newappend $CY_METADIR systemd-conf
...
/home/giometti/yocto/imx-yocto-bsp/sources/meta-cy/recipes-core/systemd
/systemd-conf_1.0.bbappend
```

Sau đó chúng ta có thể thêm một file mới tên là `eth0.network`:

```
$ mkdir $CY_METADIR/recipes-core/systemd/systemd-conf/
$ cat > $CY_METADIR/recipes-core/systemd/systemd-conf/eth0.network <<__
EOF
[Match]
Name=eth0

[Network]
Address=192.168.32.132/24
Gateway=192.168.32.2
DNS=192.168.32.2
__EOF
```

Bây giờ chúng ta có thể chuẩn bị `.bbappend` để thêm file mới với tên phù hợp như dưới đây:

```
$ cat $CY_METADIR/recipes-core/systemd/systemd-conf_1.0.bbappend
FILESEXTRAPATHS:prepend := "${THISDIR}/systemd-conf:"

SRC_URI += " \
    file://eth0.network \
"

FILES:${PN} += " \
    ${sysconfdir}/systemd/network/50-eth0.network \
"

do_install:append() {
    install -d ${D}${sysconfdir}/systemd/network
    install -m 0644 ${WORKDIR}/eth0.network ${D}${sysconfdir}/systemd/n
etwork/50-eth0.network
}
```

Bạn đọc nên lưu ý rằng file `/etc/systemd/network/50-eth0.network` là một file mới mà chúng ta cũng phải thêm vào biến `FILES`.

Bây giờ chúng ta có thể tạo lại binary image để kiểm chứng mọi thứ hoạt động tốt:

```
$ bitbake cy-evaluation-image-mx8
```

Khi đã lập trình lại thẻ microSD như thường lệ, chúng ta sẽ thấy kết quả như dưới đây sau một lần boot mới:

```
# ip addr show dev eth0
4: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP g
roup default qlen
1000
    link/ether ca:1a:ab:a1:8e:d4 brd ff:ff:ff:ff:ff:ff
    inet 192.168.32.132/24 brd 192.168.32.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::c81a:abff:fea1:8ed4/64 scope link
       valid_lft forever preferred_lft forever
```

đây là cấu hình mặc định chúng ta muốn có lúc boot.

### 12.5.5 Tự động mount với fstab (automount fstab)

Một thiết lập hữu ích khác là về những bộ lưu trữ nào nên được tự động mount lúc boot. Ví dụ, trên machine của chúng ta, boot từ thẻ microSD, chúng ta có bảng mount sau:

```
# mount | grep mmcblk
/dev/mmcblk1p2 on / type ext4 (rw,relatime)
/dev/mmcblk2p1 on /run/media/boot-mmcblk2p1 type vfat (rw,relatime,gid=
6,fmask=0007,dmask=0007,allow_utime=0020,codepage=437,iocharset=iso8859
-1,shortname=mixed,errors=remount-ro)
/dev/mmcblk2p2 on /run/media/root-mmcblk2p2 type ext4 (rw,relatime)
/dev/mmcblk1p1 on /run/media/boot-mmcblk1p1 type vfat (rw,relatime,gid=
6,fmask=0007,dmask=0007,allow_utime=0020,codepage=437,iocharset=iso8859
-1,shortname=mixed,errors=remount-ro)
```

Mục đầu tiên là về root filesystem (và chúng ta sẽ không thay đổi nó), còn các mục khác là về việc phân vùng thẻ microSD (/`dev/mmcblk1`) và eMMC trên board (`dev/mmcblk2`). Dưới đây là các thiết lập hiện tại:

```
# fdisk -l /dev/mmcblk1
Disk /dev/mmcblk1: 7.51 GiB, 8068792320 bytes, 15759360 sectors
...
Device         Boot  Start      End  Sectors  Size Id Type
/dev/mmcblk1p1 *     16384   186775   170392 83.2M  c W95 FAT32 (LBA)
/dev/mmcblk1p2      196608 11777285 11580678  5.5G 83 Linux
# fdisk -l /dev/mmcblk2
Disk /dev/mmcblk2: 14.56 GiB, 15634268160 bytes, 30535680 sectors
...
Device         Boot  Start      End  Sectors  Size Id Type
/dev/mmcblk2p1 *     16384   186775   170392 83.2M  c W95 FAT32 (LBA)
/dev/mmcblk2p2      196608 10228353 10031746  4.8G 83 Linux
```

Điều chúng ta muốn có ở đây là partition đầu tiên của thẻ microSD được mount vào `/boot` lúc boot, và để làm vậy, chúng ta phải thay đổi file `/etc/fstab`, hiện được đặt như dưới đây:

```
# cat /etc/fstab
# stock fstab - you probably want to override this with a machine specific one

/dev/root     /                    auto       defaults              1  1
proc          /proc                proc       defaults              0  0
devpts        /dev/pts             devpts     mode=0620,ptmxmode=0666,g
id=5      0  0
tmpfs         /run                 tmpfs      mode=0755,nodev,nosuid,st
rictatime 0  0
tmpfs         /var/volatile        tmpfs      defaults              0  0

# uncomment this if your device has a SD/MMC/Transflash slot
#/dev/mmcblk0p1       /media/card          auto       defaults,sync,noa
uto  0  0
```

Như chúng ta thấy ở trên, đây là file `fstab` mặc định do recipe `base-files` cung cấp, như chúng ta có thể dễ dàng kiểm chứng như dưới đây:

```
$ oe-pkgdata-util find-path /etc/fstab
base-files: /etc/fstab
```

Vì vậy, cách dễ để thay đổi nó là dùng một file `.bbappend` phù hợp. Trước hết, chúng ta có thể lấy file `fstab` hiện tại và sửa nó cho phù hợp với nhu cầu, vì vậy có thể lấy file từ thư mục `IMAGE_ROOTFS`, nơi root filesystem được tạo ra ở local:

```
$ cy-vars image cy-evaluation-image-mx8
...
IMAGE_ROOTFS="/home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/work/
imx8mp_icore_cy-poky-linux/cy-evaluation-image-mx8/1.0-r0/rootfs"
...
```

Sau đó chúng ta có thể chép file vào một file tạm:

```
$ cp $BUILDDIR/tmp/work/imx8mp_icore_cy-poky-linux/cy-evaluation-image-
mx8/1.0-r0/rootfs/etc/fstab \
        /tmp/fstab
```

Và cuối cùng, chúng ta có thể thay đổi file cho phù hợp với nhu cầu, như dưới đây:

```
$ cat /tmp/fstab
# fstab for CY image

/dev/root      /                    auto      defaults              1  1
proc           /proc                proc      defaults              0  0
devpts         /dev/pts             devpts    mode=0620,ptmxmode=0666,g
id=5      0  0
tmpfs          /run                 tmpfs     mode=0755,nodev,nosuid,st
rictatime 0  0
tmpfs          /var/volatile        tmpfs     defaults              0  0
/dev/mmcblk1p1 /boot                auto      ro                    0  0
```

Sau đó chúng ta phải tạo file `.bbappend` bằng lệnh `recipetool` `appendfile`, như dưới đây:

```
$ recipetool appendfile $CY_METADIR /etc/fstab /tmp/fstab
...
NOTE: Writing append file /home/giometti/yocto/imx-yocto-bsp/sources/me
ta-cy/recipes-core/base-files/base-files_3.0.14.bbappend
NOTE: Copying fstab to /home/giometti/yocto/imx-yocto-bsp/sources/meta-
cy/recipes-core/base-files/base-files/fstab
```

File `.bbappend` mới sẽ có nội dung sau:

```
$ cat /home/giometti/yocto/imx-yocto-bsp/sources/meta-cy/recipes-core/b
ase-files/base-files_3.0.14.bbappend
FILESEXTRAPATHS:prepend := "${THISDIR}/${PN}:"
```

Điều này để báo cho BitBake dùng phiên bản file `fstab` của chúng ta. Bây giờ chúng ta có thể tạo lại image để thử các sửa đổi:

```
$ bitbake cy-evaluation-image-mx8
```

Khi đã ghi lại thẻ microSD, lúc boot chúng ta sẽ có trạng thái sau:

```
# cat /etc/fstab
# fstab for CY image

/dev/root      /                   auto       defaults              1  1
proc           /proc               proc       defaults              0  0
devpts         /dev/pts            devpts     mode=0620,ptmxmode=0666,g
id=5      0  0
tmpfs          /run                tmpfs      mode=0755,nodev,nosuid,st
rictatime 0  0
tmpfs          /var/volatile       tmpfs      defaults              0  0
/dev/mmcblk1p1 /boot               auto       ro                    0  0
```

Partition đầu tiên của thẻ microSD giờ đã được mount đúng vào `/boot`:

```
# mount | grep mmcblk
/dev/mmcblk1p2 on / type ext4 (rw,relatime)
/dev/mmcblk1p1 on /boot type vfat (ro,relatime,fmask=0022,dmask=0022,co
depage=437,iocharset=iso8859-1,shortname=mixed,errors=remount-ro)
/dev/mmcblk2p1 on /run/media/boot-mmcblk2p1 type vfat (rw,relatime,gid=
6,fmask=0007,dmask=0007,allow_utime=0020,codepage=437,iocharset=iso8859
-1,shortname=mixed,errors=remount-ro)
/dev/mmcblk2p2 on /run/media/root-mmcblk2p2 type ext4 (rw,relatime)
# ls /boot/
Image  imx8mp-icore-ctouch2.dtb  imx8mp-icore-cy-board.dtb  imx8mp-icore-
starterkit.dtb
```

Một thiết lập hữu ích khác liên quan đến bảng mount có thể là khả năng chặn một số automount do `udev` thực hiện. Thật vậy, quy tắc mặc định là tự động mount mọi thiết bị lưu trữ được kết nối với hệ thống; trên hệ thống của chúng ta, các partition eMMC được tự động mount vào `/run/media/boot-` `mmcblk2p1` và `/run/media/root-mmcblk2p2`, như được nêu ở trên. Vì vậy, để chặn hành vi này, chúng ta có thể dùng file `/etc/udev/mount.ignorelist`, trông như dưới đây:

```
# cat /etc/udev/mount.ignorelist
/dev/loop
/dev/ram
/dev/mtdblock
/dev/md
/dev/dm-*
```

Ở đây, chúng ta có thể chỉ định pattern mới `/dev/mmcblk*` để chặn automount cho mọi thiết bị MMC. Chúng ta có hai khả năng:

1) Chúng ta có thể thay đổi file này trong package cung cấp nó, package có thể được tìm như dưới đây:

   ```
   $ oe-pkgdata-util find-path /etc/udev/mount.ignorelist
   udev-extraconf: /etc/udev/mount.ignorelist
   ```

> Lưu ý rằng, cũng như với Systemd, chúng ta không nên thay đổi trực tiếp package `udev`, mà là package cấu hình đi kèm của nó.

2) Chúng ta có thể thêm một file duy nhất tên là `mmcblk.list` vào thư mục `/etc/udev/mount.ignorelist.d/`.

Giải pháp thứ nhất tương tự như trên, còn để làm giải pháp thứ hai, chúng ta phải tạo một file mới chứa pattern loại trừ rồi thực thi lệnh `recipetool newappend` để tạo một file `.bbappend` rỗng. Ví dụ, chúng ta có thể làm như sau:

```
$ recipetool newappend $CY_METADIR udev-extraconf
...
/home/giometti/yocto/imx-yocto-bsp/sources/meta-cy/recipes-core/udev/ud
ev-extraconf_1.1.bbappend
$ mkdir $CY_METADIR/recipes-core/udev/udev-extraconf/
echo '/dev/mmcblk*' > $CY_METADIR/recipes-core/udev/udev-extraconf/mmcb
lk.exclude.list
```

Bây giờ chúng ta phải thêm `mmcblk.exclude.list` vào `SRC_URI` rồi viết một thủ tục cài đặt phù hợp. File `.bbappend` sẽ trông như sau:

```
$ cat $CY_METADIR/recipes-core/udev/udev-extraconf_1.1.bbappend
FILESEXTRAPATHS:prepend := "${THISDIR}/${PN}:"
SRC_URI += "file://mmcblk.exclude.list"

do_install:append() {
    install -m 0644 ${WORKDIR}/mmcblk.exclude.list \
                   ${D}${sysconfdir}/udev/mount.ignorelist.d/mmcblk.list
}
```

Bây giờ chúng ta có thể tạo lại image:

```
$ bitbake cy-evaluation-image-mx8
```

rồi ghi lại thẻ microSD để kiểm tra mọi thứ đã sẵn sàng và hoạt động đúng:

```
# mount | grep mmcblk
/dev/mmcblk1p2 on / type ext4 (rw,relatime)
/dev/mmcblk1p1 on /boot type vfat (ro,relatime,fmask=0022,dmask=0022,cod
epage=437,iocharset=iso8859-1,shortname=mixed,errors=remount-ro)
```

Giờ chỉ các mục trong `/etc/fstab` được mount, còn các mục khác khớp pattern `/dev/mmcblk*` được bỏ qua đúng.

### 12.5.6 Giữ log và file tmp không bị mất (Getting Logs and tmp Files As Nonvolatile)

Thỉnh thoảng, việc log của hệ thống lưu trong `/var/log` hoặc thậm chí các file tạm trong `/tmp` được giữ lại qua các lần khởi động lại hệ thống có thể hữu ích. Thật vậy, theo mặc định, các thư mục này được mount trên một tmpfs, nên sau khi khởi động lại, mọi thứ lưu trong đó đều bị mất. Điều này xảy ra vì các biến `VOLATILE_LOG_DIR` và `VOLATILE_TMP_DIR` được đặt thành `yes`, nghĩa là `/var/log` và `/tmp` nằm như dưới đây:

```
# ls -l /var/log
lrwxrwxrwx  1 root root 12 Mar  9  2018 /var/log -> volatile/log
drwxrwxrwt  4 root root   80 Apr 28 17:42 volatile
# mount | egrep /tmp\|volatile
tmpfs on /tmp type tmpfs (rw,nosuid,nodev,size=1859012k,nr_inodes=10485
76)
tmpfs on /var/volatile type tmpfs (rw,relatime)
```

Tuy nhiên, chúng ta có thể override hành vi đó bằng cách đặt như dưới đây trong file cấu hình `distro.conf` của mình. Để thử các thiết lập này, chúng ta có thể tạo file cấu hình distro của mình bằng cách clone file distro hiện tại `fsl-imx-xwayland.conf`. Kết quả cuối cùng được trình bày dưới đây:

```
$ cd $CY_METADIR
$ cat conf/distro/cy-xwayland.conf
# i.MX DISTRO for Wayland with X11

include conf/distro/include/fsl-imx-base.inc
include conf/distro/include/fsl-imx-preferred-env.inc

DISTRO = "cy-xwayland"

# Remove conflicting backends
DISTRO_FEATURES:remove = "directfb "
DISTRO_FEATURES:append = " x11 wayland pam"
```

Bây giờ các sửa đổi cần thiết cho `VOLATILE_LOG_DIR` và `VOLATILE_TMP_DIR` là

```
--- a/conf/distro/cy-xwayland.conf
+++ b/conf/distro/cy-xwayland.conf
@@ -8,3 +8,7 @@ DISTRO = "fsl-imx-xwayland"
 # Remove conflicting backends
 DISTRO_FEATURES:remove = "directfb "
 DISTRO_FEATURES:append = " x11 wayland pam"
+
+# Set logs and tmp files as non-volatile
+VOLATILE_LOG_DIR = "no"
+VOLATILE_TMP_DIR = "no"
```

Mọi thứ giờ đã sẵn sàng, nhưng để các thay đổi có hiệu lực, chúng ta cần thay đổi các thiết lập `local.conf` như dưới đây:

```
--- a/conf/local.conf
+++ b/conf/local.conf
@@ -1,5 +1,5 @@
 MACHINE ??= 'imx8mp-icore-cy'
-DISTRO ?= 'fsl-imx-xwayland'
+DISTRO ?= 'cy-xwayland'
 PACKAGE_CLASSES ?= 'package_rpm'
 USER_CLASSES ?= "buildstats"
 PATCHRESOLVE = "noop"
```

Bây giờ chúng ta có thể re-execute `bitbake` và kiểm tra thiết lập `DISTRO` mới là đúng:

```
$ bitbake cy-evaluation-image-mx8
...
Build Configuration:
BB_VERSION           = "2.0.0"
BUILD_SYS            = "x86_64-linux"
NATIVELSBSTRING      = "universal"
TARGET_SYS           = "aarch64-poky-linux"
MACHINE              = "imx8mp-icore-cy"
DISTRO               = "cy-xwayland"
DISTRO_VERSION       = "5.15-kirkstone"
TUNE_FEATURES        = "aarch64 armv8a crc crypto"
TARGET_FPU           = ""
...
```

Bây giờ, sau khi lập trình lại thẻ microSD như thường lệ, chúng ta có kết quả sau:

```
root@imx8mp-icore:~# ls -l /var/log
total 340
drwxr-xr-x 2 root root   4096 Apr 29 09:02 ConsoleKit
lrwxrwxrwx 1 root root     39 Apr 28 17:42 README -> ../../usr/share/doc/
systemd/README.logs
-rw-r--r-- 1 root root   1481 Apr 29 09:04 auth.log
-rw-rw---- 1 root utmp      0 Apr 28 17:42 btmp
-rw-r--r-- 1 root root  81413 Apr 29 09:03 kern.log
-rw-rw-r-- 1 root utmp    296 Apr 29 09:04 lastlog
-rw-r--r-- 1 root root      0 Apr 29 09:02 mail.err
-rw-r--r-- 1 root root      0 Apr 29 09:02 mail.log
-rw-r--r-- 1 root root  80769 Apr 29 09:03 messages
drwx------ 2 root root   4096 Apr 28 17:42 private
-rw-r--r-- 1 root root 152525 Apr 29 09:04 syslog
-rw-rw-r-- 1 root utmp   8800 Apr 29 09:04 wtmp
root@imx8mp-icore:~# ls -l /tmp
total 76
-rw-r--r-- 1 root root 58435 Apr 29 08:58 g2d_opencl_kernel.bin
drwx------ 3 root root  4096 Apr 29 09:02 systemd-private-f5b7ef58804545
f0b2d207da0824936a-ninfod.service-RNkUrc
drwx------ 3 root root  4096 Apr 29 09:02 systemd-private-f5b7ef58804545
f0b2d207da0824936a-rdisc.service-jIkXyI
drwx------ 3 root root  4096 Apr 29 09:02 systemd-private-f5b7ef58804545
f0b2d207da0824936a-systemd-logind.service-CGiXIe
drwx------ 3 root root  4096 Apr 28 17:42 systemd-private-f5b7ef58804545
f0b2d207da0824936a-systemd-timesyncd.service-Vj2XyN
```

Điều này hỗ trợ cả hệ thống sysvinit- lẫn systemd-based.

> Trong Yocto 5.0 Scarthgap, các biến này vẫn còn, nhưng trong bản phát hành tiếp theo 5.1 (tên mã styhead) thì không. Để làm công việc của các biến này, chúng ta sẽ dùng biến mới `FILESYSTEM_PERMS_TABLES`, biến mặc định chứa giá trị `files/fs-perms-volatile-log.txt` và `files/fs-perms-volatile-tmp.txt`, nghĩa là lần lượt volatile log và volatile tmp được bật. Người dùng có thể tắt volatile log hoặc tmp bằng cách bỏ giá trị `files/fs-perms-volatile-log.txt` hoặc `files/fs-perms-volatile-tmp.txt`.

## 12.6 Thêm một Initramfs (Adding an Initramfs)

Trong Mục 6.5.3, chúng ta đã giới thiệu cách quản lý các thiết lập Yocto để có được một Initramfs từ một recipe image. Trong mục này, chúng ta sẽ áp dụng những gì đã nói trước đó lên kit embedded của mình để có một ví dụ thực tế về cách thực sự thêm một initramfs được tùy biến đầy đủ.

Có nhiều recipe initramfs ready-to-run trong Yocto Project, nhưng trong trường hợp cần một Initramfs tùy biến được hoàn toàn và thực sự gọn, chúng ta có thể dùng một recipe như dưới đây:

```
$ cat $CY_METADIR/recipes-initramfs/images/image-tiny-initramfs.bb
SUMMARY = "CY initramfs"
DESCRIPTION = "Embedded Linux initramfs [CY version]"
LICENSE = "MIT"
LIC_FILES_CHKSUM ?= "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0b
cf8506ecda2f7b4f302"

# Do not pollute the initrd image with rootfs features
IMAGE_FEATURES = ""
IMAGE_LINGUAS = ""

# Set image properties
IMAGE_FSTYPES = "${INITRAMFS_FSTYPES}"
IMAGE_ROOTFS_SIZE = "8192"
IMAGE_ROOTFS_EXTRA_SPACE = "0"

inherit core-image

# Packages to be installed
VIRTUAL-RUNTIME_dev_manager ?= "busybox-mdev"
PACKAGE_INSTALL = " \
        ${VIRTUAL-RUNTIME_base-utils} \
        ${VIRTUAL-RUNTIME_dev_manager} \
        ${ROOTFS_BOOTSTRAP_INSTALL} \
        tiny-initramfs \
"

BAD_RECOMMENDATIONS += "busybox-syslog"
```

Image recipe này chỉ cài các package tối thiểu cần để boot cộng thêm package `tiny-initramfs`, được định nghĩa như dưới đây:

```
$ cat $CY_METADIR/recipes-initramfs/tiny-initramfs/tiny-initramfs_1.0.bb
SUMMARY = "CY tiny initramfs framework"
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COREBASE}/meta/COPYING.MIT;md5=3da9cfbcb78
8c80a0384361b4de20420"

PR = "r0"
S = "${WORKDIR}"

SRC_URI = " \
        file://fstab \
        file://init \
"

do_install() {
        install -d ${D}/tmp
        install -d ${D}/mnt
        install -d ${D}/dev
        mknod -m 622 ${D}/dev/console c 5 1

        install -d ${D}/proc
        install -d ${D}/sys

        install -d ${D}/etc
        install ${WORKDIR}/fstab ${D}/etc/fstab

        install -m 0755 ${WORKDIR}/init ${D}/init
}
FILES:${PN} = " \
        /dev /dev/console \
        /proc /sys /tmp /mnt \
        /etc /etc/fstab \
        /init \
"
```

Recipe này chỉ cần shell interpreter do `image-tiny-initramfs` cung cấp để chạy, cộng thêm hai file; file thứ nhất, file `fstab`, dùng để định nghĩa các mount point tối thiểu cần dùng:

```
$ cat $CY_METADIR/recipes-initramfs/tiny-initramfs/tiny-initramfs/fstab
devtmpfs       /dev              devtmpfs          defaults        0        0
proc           /proc             proc              defaults        0        0
sysfs          /sys              sysfs             defaults        0        0
tmpfs          /tmp              tmpfs             defaults        0        0
```

Và file thứ hai, script `init`, đơn giản thực hiện các bước sau:

```
$ cat $CY_METADIR/recipes-initramfs/tiny-initramfs/tiny-initramfs/init
#!/bin/sh

export PATH=/usr/bin:/bin:/usr/sbin:/sbin

#
# Defines
#

NAME="init"
ROOT_DIR="/mnt/root"
ROOT_DEV="/dev/mmcblk1p2"
...
#
# Main
#

echo "$NAME: ***** Initramfs started *****"

# Mount filesystems into /etc/fstab
mount -a

# Do symlink for /etc/mtab
ln -s /proc/self/mounts /etc/mtab

init=$(get_cmdline_value init)
mkdir -p $ROOT_DIR
wait_for_blockdev $ROOT_DEV || fatal "no block device!"
mount $ROOT_DEV $ROOT_DIR || fatal "cannot mount real rootfs!"

echo "$NAME: booting real rootfs..."
move_mountpoint /dev /proc /sys /tmp
exec switch_root -c /dev/console $ROOT_DIR ${init:-/sbin/init}

# Something goes wrong? Time to die...
fatal "System hangs!"

# Can't happen
exit 1
```

Hàm `get_cmdline_value` trả về giá trị được đặt trong kernel command line cho biến `init` (thường không được định nghĩa hoặc mặc định là `/sbin/init`), còn hàm `wait_for_blockdev` được dùng để chờ một lúc trước khi thử mount block device chứa root filesystem thực sự cần dùng; lý do là một số thiết bị, ví dụ các thiết bị USB, cần một lúc trước khi trở nên hoạt động được.

Sau đó, hàm `move_mountpoint` chỉ thực hiện các bước sau để chuyển đúng các mount point được chỉ định sang root filesystem mới:

```
move_mountpoint() {
        for mp in $* ; do
                mount -o move $mp $ROOT_DIR$mp
        done
}
```

Tuy nhiên, các bước cốt lõi trong file trên là như sau:

1) Lệnh `mkdir` được dùng để tạo thư mục `/mnt/root`, nơi root filesystem thực sự được mount tạm thời.

2) Lệnh `mount $ROOT_DEV $ROOT_DIR`, lệnh thực sự thực hiện thao tác mount root filesystem thật.

3) Lệnh `switch_root` chuyển sang một filesystem khác làm gốc của cây mount rồi khởi động process `init` trong root filesystem thực sự.

Ví dụ của chúng ta rất sơ đẳng, nhưng trên các hệ thống production thực tế, chúng ta có thể thêm nhiều thao tác, như thực hiện cập nhật hoặc factory reset, mount root filesystem được mã hóa, v.v., trước khi thực thi các bước trên.

OK, giờ để thử Initramfs, chúng ta cần đặt đúng các biến `INITRAMFS_IMAGE` và `INITRAMFS_IMAGE_BUNDLE` như mô tả trong Mục 6.5.3. Để làm vậy, chúng ta định nghĩa một file `distro.conf` mới như dưới đây:

```
$ cat $CY_METADIR/conf/distro/cy-xwayland-initramfs.conf
require conf/distro/fsl-imx-xwayland.conf

INITRAMFS_IMAGE_BUNDLE = "1"
INITRAMFS_IMAGE = "image-tiny-initramfs"
```

Vì vậy chúng ta có một distribution giống với distribution được mô tả bởi `fsl-imx-xwayland.conf` nhưng có Initramfs của chúng ta nằm giữa bước kernel boot và bước thực thi root filesystem `cy-evaluation-image-mx8`.

Để tạo đúng kernel image, chúng ta cần thay đổi biến `DISTRO` trong file `conf/local.conf`:

```
--- conf/local.conf
+++ conf/local.conf
@@ -1,5 +1,5 @@
 MACHINE ??= 'imx8mp-icore-cy'
-DISTRO ?= 'fsl-imx-xwayland'
+DISTRO ?= 'cy-xwayland-initramfs'
 PACKAGE_CLASSES ?= 'package_rpm'
 USER_CLASSES ?= "buildstats"
 PATCHRESOLVE = "noop"
```

Sau đó chúng ta có thể thực thi `bitbake` như thường lệ:

```
$ bitbake cy-evaluation-image-mx8
...
Build Configuration:
BB_VERSION           = "2.0.0"
BUILD_SYS            = "x86_64-linux"
NATIVELSBSTRING      = "universal"
TARGET_SYS           = "aarch64-poky-linux"
MACHINE              = "imx8mp-icore-cy"
DISTRO               = "cy-xwayland-initramfs"
DISTRO_VERSION       = "5.15-kirkstone"
TUNE_FEATURES        = "aarch64 armv8a crc crypto"
TARGET_FPU           = ""
...
```

Trong output của lệnh, chúng ta có thể kiểm chứng `DISTRO` được đặt đúng. Khi việc tạo image kết thúc, chúng ta sẽ có các file sau:

```
$ ls $BUILDDIR/tmp/deploy/images/imx8mp-icore-cy/
Image
Image--5.15.71+git0+d1c9a311f7-r0-imx8mp-icore-cy-20240822151742.bin
Image-imx8mp-icore-cy.bin
Image-initramfs--5.15.71+git0+d1c9a311f7-r0-imx8mp-icore-cy-20240822151
742.binImage-initramfs-imx8mp-icore-cy.bin
...
image-tiny-initramfs-imx8mp-icore-cy-20240822151742.rootfs.cpio.gz
image-tiny-initramfs-imx8mp-icore-cy-20240822151742.rootfs.manifest
image-tiny-initramfs-imx8mp-icore-cy-20240822151742.testdata.json
image-tiny-initramfs-imx8mp-icore-cy.cpio.gz
image-tiny-initramfs-imx8mp-icore-cy.manifest
image-tiny-initramfs-imx8mp-icore-cy.testdata.json
...
```

File `image-tiny-initramfs-imx8mp-icore-cy.cpio.gz` chứa Initramfs của chúng ta, và các file khác có cùng tên tiền tố liên quan đến nó (chú ý file `.manifest`), còn file `Image-initramfs-imx8mp-icore-cy.bin` là kernel image giống `Image-imx8mp-icore-cy.bin` nhưng có Initramfs được gói kèm. Vì vậy, để thử mọi thứ có hoạt động tốt không, chúng ta có thể đơn giản thay file `Image` trong partition `boot` của thẻ microSD bằng file `Image-initramfs-` `imx8mp-icore-cy.bin`:

```
$ ls /media/giometti/boot/
Image                     imx8mp-icore-cy-board.dtb
imx8mp-icore-ctouch2.dtb  imx8mp-icore-starterkit.dtb
$ cp $BUILDDIR/tmp/deploy/images/imx8mp-icore-cy/Image-initramfs-imx8mp
-icore-cy.bin \
        /media/giometti/boot/Image
```

> Bạn đọc nên tính đến việc thư mục nơi hệ thống của họ mount partition `boot` sẽ khác `/media/giometti/boot`. Vì vậy họ nên viết lại lệnh trên cho phù hợp với nhu cầu.

Khi file `Image` đã được thay đúng, chúng ta có thể boot lại, và khi kernel đã boot xong, chúng ta sẽ thấy nội dung như dưới đây:

```
...
[    3.859587] Freeing unused kernel memory: 10880K
[    3.870595] Run /init as init process
init: ***** Initramfs started *****
[    4.410349] EXT4-fs (mmcblk1p2): recovery complete
[    4.477331] EXT4-fs (mmcblk1p2): mounted filesystem with ordered dat
a mode. O
pts: (null). Quota mode: none.
init: booting real rootfs...
[    5.122593] systemd[1]: System time before build time, advancing clo
ck.
[    5.171162] systemd[1]: systemd 250.5+ running in system mode (+PAM
-AUDIT -S
...
```

Chúng ta có thể thấy kernel chạy script `/init` của chúng ta, script này lại mount và thực thi root filesystem thực sự như trước.

> Có thể xảy ra trường hợp trong khi u-boot nạp kernel, nó hiển thị error message sau:
>
> ```
> ...
> 59437 bytes read in 5 ms (11.3 MiB/s)
> ## Flattened Device Tree blob at 43000000
>    Booting using the fdt blob at 0x43000000
> ERROR: FDT image overlaps OS image (OS=0x40400000..0x430e0000)
> u-boot=>
> ```
>
> Lý do là các địa chỉ nạp của kernel và device tree image không được cố định tốt. Kernel image mới với Initramfs gói kèm quá lớn để vừa trong bộ nhớ, vì vậy chúng ta giải quyết vấn đề bằng cách thực thi lệnh sau:
>
> ```
> u-boot=> setenv fdt_addr_r 0x44000000
> ```
>
> Sau đó chúng ta có thể tiếp tục boot bằng lệnh `boot`:
>
> ```
> u-boot=> boot
> ```

Khi root filesystem thực sự boot xong, mọi thứ sẽ hoạt động như thường lệ.

## 12.7 Tóm tắt (Summary)

Trong chương này, chúng ta đã thấy nhiều ví dụ thực tế về cách viết image recipe. Giờ chúng ta có thể viết image recipe từ đầu hoặc đơn giản bằng cách clone một recipe đã viết. Chúng ta cũng biết cách thay đổi một số cấu hình hệ thống thông dụng và cách thêm một Initramfs để thực hiện các thao tác đặc biệt trước khi boot root filesystem thực sự.

Bây giờ chúng ta có thể chuyển sang chương cuối cùng của sách để xem cách thực hiện một số tối ưu hóa hoặc tùy biến Yocto và một số best practice cho việc phát triển embedded với Yocto.

