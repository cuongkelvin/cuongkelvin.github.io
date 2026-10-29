# 3 Software Layer (The Software Layer)

Trong chương này, chúng ta sẽ đề cập các recipe sau:

- Khám phá nội dung của một image

- Thêm một software layer mới

- Chọn một phiên bản và provider package cụ thể

- Thêm các package được hỗ trợ

- Thêm package mới

- Thêm dữ liệu, script hoặc file cấu hình

- Quản lý user và group

- Dùng hệ thống khởi tạo sysvinit

- Dùng hệ thống khởi tạo systemd

- Cài các script cài đặt package

- Giảm kích thước Linux kernel image

- Giảm kích thước root filesystem image

- Root filesystem Memory-based

- Bảo mật root filesystem

- Phát hành software

- Phân tích hệ thống để tuân thủ license

- Làm việc với code open source và code độc quyền

## Giới thiệu

Khi các thay đổi hardware-specific đã được tiến hành, bước tiếp theo là tùy biến root filesystem của target, phần software chạy bên trên Linux kernel, còn gọi là Linux user space.

Cách tiếp cận thông thường là bắt đầu với một trong các core image có sẵn rồi vừa tối ưu vừa tùy biến nó theo nhu cầu của dự án embedded. Thông thường, các image được chọn làm điểm xuất phát là `core-image-base` cho một hệ thống headless, hoặc `core-image-sato` cho một hệ thống đồ họa, nhưng image nào cũng được.

Chương này sẽ cho bạn thấy cách thêm một software layer để chứa các thay đổi đó, và sẽ giải thích một số tùy biến thường gặp, như tối ưu kích thước. Chương cũng sẽ cho bạn thấy cách thêm package mới vào root filesystem, kể cả các cân nhắc về license.

## Khám phá nội dung của một image

Chúng ta đã thấy cách dùng tính năng build history để lấy danh sách package và file có trong image. Trong recipe này, chúng ta sẽ giải thích root filesystem được build như thế nào để có thể theo dõi các thành phần của nó.

### Chuẩn bị

Khi các package được build, chúng được đặt bên trong thư mục làm việc của project, thường là `tmp/work`, và được phân loại theo architecture của chúng. Ví dụ, trong một bản build `wandboard`, chúng ta thấy các thư mục sau:

- `all-poky-linux`: Thư mục này dùng cho các package architecture-independent

- `cortexa9hf-neon-poky-linux-gnueabi`: Thư mục này dùng cho các package `cortexa9` dùng hard floating point

- `cortexa9hf-neon-mx6qdl-poky-linux-gnueabi`: Thư mục này dùng cho các package `cortexa9` dùng hard floating point mà riêng cho architecture i.MX6

- `wandboard-poky-linux-gnueabi`: Thư mục này dùng cho các package machine-specific, trong trường hợp này là `wandboard`

- `x86_64-linux`: Thư mục này dùng cho các package tạo nên `sysroot` của host

- `x86_64-nativesdk-pokysdk-linux`: Thư mục này dùng cho các package host sẽ được đưa vào SDK, ví dụ các công cụ phát triển được Yocto build nhưng được dùng trên host native

BitBake sẽ build mọi package có trong danh sách dependency của nó bên trong thư mục riêng của từng package.

### Cách thực hiện...

Để tìm build directory của một package nhất định, chúng ta có thể chạy command sau:

```
$ bitbake -e <package> | grep ^WORKDIR=
```

Bên trong build directory, chúng ta thấy một số thư mục con (giả sử không dùng `rm_work`) mà build system dùng trong task đóng gói. Các thư mục con này gồm:

- `deploy-rpms`: Đây là thư mục lưu các package cuối cùng khi dùng định dạng package RPM mặc định. Chúng ta tìm ở đây các package riêng lẻ có thể sao chép local tới target và cài đặt. Các package này được sao chép vào thư mục `tmp/deploy` và cũng được dùng khi Yocto build root filesystem image.

- `image`: Đây là thư mục đích mặc định nơi task `do_install` cài các thành phần. Recipe có thể thay đổi nó bằng biến cấu hình `D`.

- `package`: Thư mục này chứa nội dung package thực tế, có thể khác với nội dung của thư mục image ở trên.

- `packages-split`: Đây là nơi nội dung được phân loại vào các thư mục con đặt tên theo package cuối cùng. Recipe có thể tách nội dung package thành nhiều package cuối cùng, như được chỉ định bởi biến `PACKAGES`. Một số package thông dụng ngoài tên package mặc định là:

  - `dbg`: Package này cài các thành phần dùng để debug

  - `dev`: Package này cài các thành phần dùng cho phát triển, như header và library

  - `staticdev`: Package này cài các library và header dùng cho biên dịch tĩnh

  - `doc`: Đây là nơi đặt tài liệu

  - `locale`: Package này cài các thành phần bản địa hóa

Các thành phần cần cài vào mỗi package được chọn bằng biến `FILES`. Ví dụ, để thêm vào package mặc định, bạn có thể thêm biến sau vào recipe:

```
FILES_${PN} += "${bindir}/file.bin"
```

Và để thêm vào package phát triển, bạn có thể dùng dòng sau:

```
FILES_${PN}-dev += "${libdir}/lib.so"
```

Các biến `libdir` và `bindir` được định nghĩa trong file cấu hình BitBake của Poky, `meta/conf/bitbake.conf`, cùng với các biến trợ giúp đường dẫn hữu ích khác.

### Cách hoạt động...

Khi Yocto build system đã build mọi package riêng lẻ trong danh sách dependency, nó chạy task `do_rootfs`, task này nạp dữ liệu vào sysroot và build root filesystem trước khi tạo các package image cuối cùng. Bạn có thể tìm vị trí của root filesystem bằng cách chạy:

```
$ bitbake -e core-image-minimal | grep ^IMAGE_ROOTFS=
```

> Lưu ý rằng biến `IMAGE_ROOTFS` không cấu hình được và không nên thay đổi.

Nội dung của thư mục này sau đó sẽ được chuẩn bị thành một image theo các loại image được cấu hình trong biến cấu hình `IMAGE_FSTYPES`. Nếu có thứ gì đã được cài vào thư mục này, nó sẽ được cài vào image cuối cùng.

## Thêm một software layer mới

Việc tùy biến root filesystem bao gồm thêm hoặc sửa nội dung vào image nền. Metadata cho nội dung này được đặt vào một hoặc nhiều software layer, tùy mức độ tùy biến cần thiết.

Một dự án embedded điển hình sẽ chỉ có một software layer chứa mọi tùy biến non-hardware-specific. Nhưng cũng có thể có thêm layer cho các graphical framework hoặc các thành phần system-wide.

### Chuẩn bị

Trước khi bắt đầu làm một layer mới, nên kiểm tra xem đã có ai cung cấp một layer tương tự chưa. Ngoài ra, nếu bạn đang cố tích hợp một dự án open source, hãy kiểm tra xem đã có layer chứa nó chưa. Có một chỉ mục các layer hiện có tại `http://layers.openembedded.org/`.

### Cách thực hiện...

Một software layer mới có thể được tạo theo cùng cách chúng ta đã làm cho BSP layer ở chương trước. Ví dụ, chúng ta có thể tạo một layer `meta-custom` mới bằng command `yocto-layer` như đã học trong recipe Creating a custom BSP layer ở `Chapter 2`, The BSP Layer. Từ thư mục `sources`, chạy command sau:

```
$ yocto-layer create custom
```

Như đã nói, công cụ `yocto-layer` sẽ thêm tiền tố `meta` vào layer.

Đừng quên thêm layer vào file `conf/bblayers.conf` của project và vào thư mục `conf` mẫu để nó có sẵn cho mọi project mới.

File cấu hình `conf/layer.conf` mặc định như sau:

```
# We have a conf and classes directory, add to BBPATH
BBPATH .= ":${LAYERDIR}"

# We have recipes-* directories, add to BBFILES
BBFILES += "${LAYERDIR}/recipes-*/*/*.bb \
        ${LAYERDIR}/recipes-*/*/*.bbappend"

BBFILE_COLLECTIONS += "custom"
BBFILE_PATTERN_custom = "^${LAYERDIR}/"
BBFILE_PRIORITY_custom = "6"
```

Chúng ta đã bàn về mọi biến liên quan trong đoạn này ở recipe Creating a custom BSP layer trong `Chapter 2`, The BSP Layer.

### Cách hoạt động...

Khi thêm nội dung vào một software layer mới, chúng ta cần nhớ rằng layer của mình cần hoạt động tốt với các layer khác trong Yocto project. Vì mục đích này, khi tùy biến recipe, chúng ta sẽ luôn dùng append file, và chỉ override recipe đã có nếu hoàn toàn chắc chắn không có cách nào thêm tùy biến cần thiết qua một append file.

Để giúp quản lý nội dung trên nhiều layer, chúng ta có thể dùng các tiện ích command-line `bitbake-layers` sau:

- `$ bitbake-layers show-layers`: Lệnh này sẽ hiển thị các layer đã cấu hình theo cách BitBake thấy chúng. Nó hữu ích để phát hiện lỗi trong file `conf/bblayer.conf`.

- `$ bitbake-layers show-recipes`: Command này sẽ hiển thị mọi recipe có sẵn và các layer cung cấp chúng. Có thể dùng nó để kiểm tra rằng BitBake thấy recipe bạn vừa tạo. Nếu nó không xuất hiện, hãy kiểm tra rằng cấu trúc filesystem khớp với cấu trúc được định nghĩa trong biến `BBFILES` của layer trong `conf/layer.conf`.

- `$ bitbake-layers show-overlayed`: Command này sẽ hiển thị mọi recipe bị một recipe khác cùng tên nhưng ở layer có priority cao hơn che đè (overlay). Nó giúp phát hiện xung đột recipe.

- `$ bitbake-layers show-appends`: Command này sẽ liệt kê mọi append file có sẵn và các file `recipe` mà chúng áp dụng lên. Có thể dùng nó để kiểm tra rằng BitBake thấy các append file của bạn. Ngoài ra, cũng như với recipe ở trên, nếu chúng không xuất hiện, bạn sẽ cần kiểm tra cấu trúc filesystem và biến `BBFILES` của layer.

- `$ bitbake-layers flatten <output_dir>`: Command này sẽ tạo một thư mục chứa nội dung của mọi layer đã cấu hình, không có các recipe bị che đè và với mọi append file đã được áp dụng. Đây là cách BitBake sẽ thấy metadata. Thư mục đã "làm phẳng" này hữu ích để phát hiện xung đột với metadata của layer bạn.

- `$ bitbake-layers show-cross-depends`: Command này sẽ hiển thị mọi dependency của recipe giữa các layer, ví dụ các recipe có biến `INHERIT`, `RRECOMMENDS`, `DEPENDS` hoặc `RDEPENDS` trỏ tới recipe từ một layer khác.

Command `bitbake-layers` cũng có thể được dùng để thêm và bỏ layer khỏi file `conf/bblayers.conf`:

- `$ bitbake-layers add-layer </path/to/layer>`: Command này sẽ thêm đường dẫn layer được chỉ định vào biến `BBLAYERS` trong `conf/bblayers.conf` của project

- `$ bitbake-layers remove-layer </path/to/layer>`: Command này sẽ bỏ đường dẫn layer được chỉ định khỏi biến `BBLAYERS` trong `conf/bblayers.conf` của project

Nó cũng có thể dùng OpenEmbedded Layer Index đã nhắc ở trên để tự động fetch và thêm layer cùng các dependency của nó vào project:

```
$ bitbake-layers layerindex-fetch <layer name>
```

Hoặc chỉ liệt kê các layer dependency từ index:

```
$ bitbake-layers layerindex-show-depends <layer name>
```

Layer mới sẽ được đặt bên trong layer `poky`.

### Còn nữa...

Đôi khi chúng ta sẽ thêm các tùy biến riêng cho một board hoặc machine. Chúng không phải lúc nào cũng hardware-related, nên có thể nằm trong BSP layer hoặc software layer.

Khi làm vậy, chúng ta sẽ cố giữ các tùy biến càng cụ thể càng tốt. Một ví dụ điển hình là tùy biến cho một machine hoặc một họ machine cụ thể. Nếu bạn cần thêm một patch cho machine `wandboard`, bạn sẽ dùng dòng code sau:

```
SRC_URI_append_wandboard = " file://mypatch.patch"
```

Và, nếu patch áp dụng được cho mọi board i.MX6-based, bạn có thể dùng dòng sau:

```
SRC_URI_append_mx6 = " file://mypatch.patch"
```

Để có thể dùng override theo họ machine, các file cấu hình machine cần có biến `MACHINEOVERRIDES`, chẳng hạn biến cho `wandboard` trong file cấu hình machine của layer `meta-freescale-3rdparty`, như sau:

```
conf/machine/wandboard.conf:MACHINEOVERRIDES =. "mx6:mx6dl:mx6q:"
```

Biến này được đưa vào như một phần của biến `OVERRIDES` mặc định như được định nghĩa trong `meta/conf/bitbake.conf` của layer `poky`:

```
OVERRIDES = "${TARGET_OS}:${TRANSLATED_TARGET_ARCH}:build-${BUILD_OS}:pn-
${PN}:${MACHINEOVERRIDES}:${DISTROOVERRIDES}:${CLASSOVERRIDE}:forcevariable
"
```

Cơ chế override cho phép chúng ta đặt biến có điều kiện như sau:

```
VARIABLE_override1_override2 = ""
```

Hoặc chúng ta có thể dùng cú pháp `_append`, `_prepend` và `_remove`:

```
VARIABLE_append_override1_override2 = ""
VARIABLE_prepend_override1_override2 = ""
VARIABLE_remove_override1_override2 = ""
```

BitBake sẽ tìm trong một đường dẫn định sẵn, tìm các file bên trong thư mục làm việc của package, được định nghĩa trong biến `FILESPATH` như một danh sách colon-separated. Cụ thể:

```
${BPN}-${PV}/${DISTRO}
${BPN}/${DISTRO}
files/${DISTRO}

${BPN}-${PV}/${MACHINE}
${BPN}/${MACHINE}
files/${MACHINE}

${BPN}-${PV}/${MACHINEOVERRIDES}
${BPN}/${MACHINEOVERRIDES}
files/${MACHINEOVERRIDES}

${BPN}-${PV}/${TARGET_ARCH}
${BPN}/${TARGET_ARCH}
files/${TARGET_ARCH}

${BPN}-${PV}/
${BPN}/
files/
```

Trong trường hợp cụ thể của `wandboard`, điều này tương ứng với:

```
${BPN}-${PV}/poky
${BPN}/poky
files/poky
${BPN}-${PV}/wandboard
${BPN}/wandboard
files/wandboard
${BPN}-${PV}/mx6q
${BPN}/mx6q
files/mx6q
${BPN}-${PV}/mx6dl
${BPN}/mx6dl
files/mx6dl
${BPN}-${PV}/mx6
${BPN}/mx6
files/mx6
${BPN}-${PV}/armv7a
${BPN}/armv7a
files/armv7a
${BPN}-${PV}/arm
${BPN}/arm
files/arm
${BPN}-${PV}/
${BPN}/
files/
```

Ở đây, `BPN` là tên package đã bỏ các tiền tố và hậu tố (như `nativesdk-`, `-native` và các tiền tố/hậu tố khác), còn `PV` là phiên bản package.

Tốt nhất là đặt patch ở vị trí cụ thể nhất trong số này, tức là `wandboard`, tiếp theo là `mx6q` hoặc `mx6dl`, `mx6`, `armv7a`, `arm`, và cuối cùng là các thư mục chung `BPN-PV`, `BPN` và `files`.

Lưu ý rằng search path tham chiếu tới vị trí của BitBake recipe, nên append file cần luôn thêm đường dẫn khi thêm nội dung. Append file của chúng ta có thể thêm thư mục vào search path này nếu cần bằng cách append hoặc prepend vào biến `FILESEXTRAPATHS` như sau:

```
FILESEXTRAPATHS_prepend := "${THISDIR}/folder:"
```

> Lưu ý toán tử immediate (`:=`) expand `THISDIR` ngay lập tức, và thao tác prepend đặt đường dẫn bạn thêm vào trước mọi đường dẫn khác để patch và file của bạn được tìm thấy trước tiên.
>
> Ngoài ra, chúng ta đã thấy các toán tử kiểu `+=` và `=+` trong file cấu hình, nhưng nên tránh dùng chúng trong file recipe và nên ưu tiên các toán tử append và prepend, như trong code ví dụ đã giải thích ở trên, để tránh vấn đề về thứ tự.

Hãy kết thúc bằng một tổng quan nhanh về cú pháp BitBake thông dụng. Các phép gán sau được đánh giá trước:

- `=` expand khi được dùng

- `:=` expand khi được parse

- `?=` expand ngay khi parse nếu đang rỗng

- `+=` append ngay khi parse, kèm dấu cách ở đầu

- `.=` append ngay khi parse, không có dấu cách

- `=+` prepend ngay khi parse, kèm dấu cách ở cuối

- `=.` prepend ngay khi parse, không có dấu cách

Sau khi BitBake đánh giá các phép gán ở trên, nó sẽ đánh giá cú pháp `_append` và `_prepend`. Cuối cùng, nó sẽ đánh giá phép gán `??=`, giống hệt `?=` ngoại trừ thứ tự parse.

Với giải thích này, sẽ dễ hiểu hơn tại sao các file cấu hình, được BitBake parse trước, dùng cú pháp `_append` và `_prepend` để các phép gán được trì hoãn, và các recipe cũng như class dùng weak symbol như `?=` được áp dụng giá trị mặc định. Ví dụ, nếu `conf/local.conf` dùng phép gán `=+`, một recipe dùng `?=` sẽ không được áp dụng giá trị mặc định.

### Xem thêm

- Xem recipe Building your first image ở `Chapter 1`, The Build System để có mô tả về thứ tự parse file của BitBake

- Để có tham chiếu đầy đủ về cú pháp BitBake, xem `Chapter 3`, Syntax and Operators trong BitBake User Manual của Yocto Project

## Chọn một phiên bản và provider package cụ thể

Các layer của chúng ta có thể cung cấp recipe cho các phiên bản khác nhau của cùng một package. Ví dụ, layer `meta-freescale` chứa một số loại Linux kernel recipe khác nhau:

- `linux-imx`: Recipe này tương ứng với kernel source i.MX BSP của NXP, được fetch từ `http://git.freescale.com/git/cgit.cgi/imx/linux-imx.git/`

- `linux-fslc-imx`: Đây là một fork từ kernel tree i.MX BSP của NXP với một bản phát hành ổn định và các patch của cộng đồng đã được áp dụng, được fetch từ `https://github.com/Freescale/linux-fslc`

- `linux-fslc`: Đây là một fork của Linux kernel mainline với các patch của cộng đồng, được fetch từ `https://github.com/Freescale/linux-fslc`

- `linux-qoriq`: Đây là một kernel có hỗ trợ các platform PowerPC-based QorIQ của NXP, được fetch từ `https://github.com/qoriq-open-source/linux.git`

Như đã nói trước đó, mọi recipe mặc định cung cấp tên package (ví dụ, `linux-imx` hoặc `linux-fslc`), nhưng mọi Linux recipe cũng phải cung cấp virtual package `virtual/kernel`. Build system sẽ phân giải `virtual/kernel` thành tên Linux recipe phù hợp nhất, có tính đến các yêu cầu của bản build, như machine mà nó đang build cho.

Và trong các recipe đó, ví dụ `linux-fslc` có cả phiên bản recipe 4.9 lẫn 4.14.

Trong mục này, chúng ta sẽ cho bạn thấy cách bảo Yocto build system build package và phiên bản cụ thể nào.

### Cách thực hiện...

Để chỉ định chính xác package muốn build, build system cho phép chúng ta chỉ định provider và phiên bản cần dùng.

#### Chọn provider nào để dùng như thế nào?

Chúng ta có thể cho BitBake biết recipe nào cần dùng bằng biến `PREFERRED_PROVIDER`. Để đặt preferred provider cho virtual package `virtual/kernel` trên machine `wandboard`, chúng ta sẽ thêm dòng sau vào file cấu hình machine của nó:

```
PREFERRED_PROVIDER_
virtual/kernel = "linux-fslc"
```

#### Chọn phiên bản nào để dùng như thế nào?

Trong một provider cụ thể, chúng ta cũng có thể cho BitBake biết phiên bản nào cần dùng bằng biến `PREFERRED_VERSION`. Ví dụ, để đặt một phiên bản `linux-fslc` cụ thể cho mọi machine i.MX6-based, chúng ta sẽ thêm dòng sau vào file `conf/local.conf`:

```
PREFERRED_VERSION_linux-fslc_mx6 = "4.9"
```

Wildcard `%` được chấp nhận để khớp với ký tự bất kỳ, như ta thấy ở đây:

```
PREFERRED_VERSION_linux-fslc_mx6 = "4.9%"
```

Dòng này sẽ khớp với mọi phiên bản kernel 4.9.x.

Tuy nhiên, phổ biến hơn là thấy loại cấu hình này trong các file cấu hình machine, trong trường hợp đó chúng ta sẽ không dùng phần append `_mx6`.

#### Chọn phiên bản nào không dùng như thế nào?

Chúng ta có thể dùng biến `DEFAULT_PREFERENCE` đặt bằng `-1` để chỉ định rằng một phiên bản sẽ không được dùng trừ khi được đặt tường minh bằng biến `PREFERRED_VERSION`. Điều này thường được dùng trong các phiên bản package đang phát triển:

```
DEFAULT_PREFERENCE = "-1"
```

## Thêm các package được hỗ trợ

Việc muốn thêm vào image các package mới đã có recipe sẵn trong một trong các Yocto layer đang dùng là rất thường gặp.

Khi target image mong muốn rất khác so với các core image được cung cấp, nên định nghĩa một image mới thay vì tùy biến image đã có.

Recipe này sẽ cho thấy cách tùy biến một image có sẵn bằng cách thêm các package được hỗ trợ vào nó, nhưng cũng cách tạo một image recipe hoàn toàn mới nếu cần.

### Chuẩn bị

Để tìm hiểu xem một package chúng ta cần có trong các layer đã cấu hình hay không, và các phiên bản cụ thể nào được hỗ trợ, chúng ta có thể dùng `bitbake-layers` từ build directory như đã thấy trước đó:

```
$ bitbake-layers show-recipes htop
htop:
 meta-oe              1.0.3
```

Ngoài ra, chúng ta cũng có thể dùng BitBake như sau:

```
$ bitbake -s | grep htop
htop                                                :1.0.3-r0
```

Hoặc chúng ta có thể dùng command Linux `find` trong thư mục `sources`:

```
$ find /opt/yocto/fsl-community-bsp/sources -type f -name "htop*.bb"
/opt/yocto/fsl-community-bsp/sources/meta-openembedded/meta-oe/recipes-
support/htop/htop_1.0.3.bb
```

Khi đã biết những package nào muốn đưa vào image cuối cùng, hãy xem cách thêm chúng vào image.

### Cách thực hiện...

Trong khi phát triển, chúng ta sẽ dùng file `conf/local.conf` của project để thêm tùy biến. Để thêm package vào mọi image, chúng ta có thể dùng dòng code sau:

```
IMAGE_INSTALL_append = " htop"
```

> Lưu ý rằng có một dấu cách sau dấu nháy đầu tiên để tách package mới khỏi các package đã có, vì toán tử append không thêm dấu cách.

Chúng ta cũng có thể giới hạn việc thêm cho một image cụ thể với:

```
IMAGE_INSTALL_append_pn-core-image-minimal = " htop"
```

Một cách khác để dễ dàng tùy biến là dùng các feature. Một feature là một nhóm logic các package. Ví dụ, chúng ta có thể tạo một feature mới tên là `debug-utils`, feature này sẽ thêm cả một bộ tiện ích debug. Chúng ta có thể định nghĩa feature trong một file cấu hình hoặc class như sau:

```
FEATURE_PACKAGES_debug-utils = "trace-cmd perf"
```

Sau đó chúng ta có thể thêm feature này vào image bằng cách thêm biến `EXTRA_IMAGE_FEATURES` vào file `conf/local.conf` như sau:

```
EXTRA_IMAGE_FEATURES += "debug-utils"
```

Nếu bạn thêm nó vào một image recipe, bạn sẽ dùng biến `IMAGE_FEATURES` thay vào đó.

Thông thường, các feature được thêm dưới dạng một recipe `packagegroup` thay vì được liệt kê từng package riêng lẻ. Hãy xem cách định nghĩa một recipe `packagegroup` trong file `recipes-core/packagegroups/packagegroup-debug-utils.bb`:

```
SUMMARY = "Debug applications packagegroup"

inherit packagegroup

RDEPENDS_${PN} = "\
    trace-cmd \
    perf \
"
```

Và sau đó bạn sẽ thêm nó vào biến `FEATURE_PACKAGES` như sau:

```
FEATURE_PACKAGES_debug-utils = "packagegroup-debug-utils"
```

Chúng ta có thể dùng `packagegroups` để tạo các ví dụ phức tạp hơn. Xem Yocto Project Development Manual tại `http://www.yoctoproject.org/docs/2.4/dev-manual/dev-manual.html` để biết chi tiết.

### Cách hoạt động...

Chúng ta có thể đi theo cả cách tiếp cận top-down lẫn bottom-up khi tùy biến image. Cách tiếp cận top-down sẽ bắt đầu bằng việc kế thừa hoặc append một trong các core image do Poky cung cấp rồi cấu hình thu gọn chúng, còn cách tiếp cận bottom-up sẽ định nghĩa một image recipe mới từ đầu và thêm feature dần dần.

Core image nhỏ nhất có trong Poky là `core-image-minimal`, được trình bày dưới đây:

```
IMAGE_INSTALL = "packagegroup-core-boot ${CORE_IMAGE_EXTRA_INSTALL}"
IMAGE_LINGUAS = " "
LICENSE = "MIT"
inherit core-image
IMAGE_ROOTFS_SIZE ?= "8192"
IMAGE_ROOTFS_EXTRA_SPACE_append = "${@bb.utils.contains("DISTRO_FEATURES",
"systemd", " + 4096", "" ,d)}"
```

Biến `IMAGE_LINGUAS` ở đây được dùng để chỉ định tập locale cần thêm vào image. Theo mặc định, BitBake định nghĩa nó là:

```
IMAGE_LINGUAS ?= "en-us en-gb"
```

Các core image được thiết kế để có thể tùy biến bằng cách thêm feature có chọn lọc dựa trên các biến sau:

- `MACHINE_FEATURES` là danh sách các feature mà hardware hỗ trợ và thường được cấu hình trong cấu hình machine. Class `core-image` sẽ thêm các software feature cho các machine feature được chỉ định.

- `DISTRO_FEATURES` là danh sách các software feature mà distribution hỗ trợ, được các package dùng để biên dịch có điều kiện. Ví dụ, các package có thể có hỗ trợ đồ họa dựa trên distro feature x11, hoặc hỗ trợ không dây dựa trên feature Wi-Fi.

- `IMAGE_FEATURES` là danh sách các feature cần đưa vào image. Các image feature được định nghĩa trong các `packagegroups`, mỗi packagegroup định nghĩa một tập package cung cấp chức năng cụ thể.

- `VIRTUAL-RUNTIME` là một biến được dùng để chọn giữa các package cung cấp cùng chức năng, ví dụ các init system `sysvinit` và `systemd`.

Ví dụ, chúng ta có thể bắt đầu với `core-image-minimal.bb` và tùy biến nó bằng cách thêm file image `meta-custom/recipes-core/images/custom-image.bb` sau:

```
require recipes-core/images/core-image-minimal.bb
IMAGE_FEATURES += "ssh-server-dropbear package-management"
```

Và sau đó build nó bằng cách:

```
$ bitbake custom-image
```

Tất nhiên, chúng ta cũng có thể định nghĩa một image mới từ đầu, dùng một trong các image có sẵn làm template. Một ví dụ có trong recipe Reducing the root filesystem image size ở chính chương này.

### Còn nữa...

Một cách cuối cùng để tùy biến image là thêm các shell function được thực thi sau khi image đã được tạo. Bạn làm điều này bằng cách thêm dòng sau vào image recipe hoặc file `conf/local.conf`:

```
ROOTFS_POSTPROCESS_COMMAND += "function1;...;functionN"
```

Bạn có thể dùng đường dẫn tới root filesystem trong command bằng biến `IMAGE_ROOTFS`.

Các class sẽ dùng biến `IMAGE_POSTPROCESS_COMMAND` thay cho `ROOTFS_POSTPROCESS_COMMAND`.

Các ví dụ sử dụng có thể tìm thấy trong feature `debug-tweaks` trong `rootfs-postcommands.bbclass` của Poky, khi image được tinh chỉnh để cho phép đăng nhập root password-less. Phương pháp này cũng thường được dùng để tùy biến mật khẩu root của target image.

#### Cấu hình package

Như đã thấy trong recipe Configuring the Linux kernel ở `Chapter 2`, The BSP Layer, một số package, như Linux kernel, cung cấp một menu cấu hình và có thể được cấu hình bằng command BitBake `menuconfig`.

Một package khác đáng nói có giao diện cấu hình là BusyBox, software well-known cho embedded system, cung cấp các công cụ Linux đã được rút gọn, phù hợp với các thiết bị resource-constrained. Chúng ta sẽ cho thấy cách cấu hình BusyBox, ví dụ để thêm `pgrep`, một công cụ tìm process ID theo tên.

Recipe BusyBox hỗ trợ configuration fragment, nên để cấu hình BusyBox, tất cả những gì cần làm là `bbappend` recipe trong custom layer của chúng ta. Để sinh configuration fragment, trước tiên chúng ta khởi chạy menu cấu hình với:

```
$ bitbake -c menuconfig busybox
```

Trong Process utilities, chọn pgrep.

Giờ chúng ta sinh một fragment `config` với:

```
$ bitbake -c diffconfig busybox
Config fragment has been dumped into:
 /opt/yocto/fsl-community-bsp/wandboard/tmp/work/cortexa9hf-neon-poky-
linux-gnueabi/busybox/1.24.1-r0/fragment.cfg
```

Và cuối cùng, chúng ta áp dụng thay đổi vào layer bằng append file sau: `recipes-core/busybox/busybox_1.24.1.bbappend`:

```
FILESEXTRAPATHS_prepend := "${THISDIR}/${PN}:"
SRC_URI += "file://fragment.cfg"
```

Với file `recipes-core/busybox/busybox/fragment.cfg` như sau:

```
CONFIG_PGREP=y
```

Việc tạo fragment `config` và append file có thể được tự động hóa với:

```
$ recipetool appendsrcfile </path/to/layer> busybox
</path/to/config/fragment>
```

Giờ chúng ta có thể sao chép package RPM vào target:

```
$ bitbake -e busybox | grep ^WORKDIR=
$ scp ${WORKDIR}/deploy-rpms/cortexa9hf_neon/busybox-1.24.1-
r0.cortexa9hf_neon.rpm root@<target_ip>:/tmp
```

Và cài package RPM trên target:

```
# rpm --force -U /tmp/busybox-1.24.1-r0.cortexa9hf_neon.rpm
```

Lưu ý rằng chúng ta đang ép cập nhật vì phiên bản package không tăng khi thay đổi cấu hình.

## Thêm package mới

Chúng ta đã thấy cách tùy biến image để có thể thêm các package được hỗ trợ vào nó. Khi không tìm được recipe có sẵn, hoặc cần tích hợp một software mới mà chúng ta đã phát triển, chúng ta sẽ cần tạo một Yocto recipe mới.

### Chuẩn bị

Có một số câu hỏi chúng ta cần tự hỏi trước khi bắt đầu viết một recipe mới:

- Source code được lưu ở đâu?

- Nó source-controlled hay được phát hành dưới dạng tarball?

- License của source code là gì?

- Nó dùng build system nào?

- Nó có cần cấu hình không?

- Chúng ta có thể cross-compile nó nguyên trạng không, hay nó cần được patch?

- Những file nào cần được deploy vào root filesystem, và chúng được đặt ở đâu?

- Có thay đổi hệ thống nào cần thực hiện không, như user mới hoặc các script `init`?

- Có dependency nào cần được cài vào `sysroot` từ trước không?

Khi đã biết câu trả lời cho các câu hỏi này, chúng ta sẵn sàng bắt đầu viết recipe.

### Cách thực hiện...

Tốt nhất là bắt đầu từ một template trống như template dưới đây thay vì bắt đầu từ một recipe tương tự rồi sửa nó, vì kết quả sẽ sạch hơn và chỉ chứa các chỉ dẫn thực sự cần thiết.

Một điểm xuất phát tốt cho việc thêm một recipe tối thiểu là:

```
SUMMARY = "The package description for the package management
   system"

LICENSE = "The package's licenses typically from
   meta/files/common-licenses/"
LIC_FILES_CHKSUM = "License checksum used to track open license
   changes"
DEPENDS = "Package list of build time dependencies"

SRC_URI = "Local or remote file or repository to fetch"
SRC_URI[md5sum] = "md5 checksums for all remote fetched files (not
   for repositories)"
SRC_URI[sha256sum] = "sha256 checksum for all remote fetched files
   (not for repositories)"

S = "Location of the source in the working directory, by default
   ${WORKDIR}/${PN}-${PV}."

inherit <class needed for some functionality>

# Task overrides, like do_configure, do_compile and do_install, or
   nothing.

# Package splitting (if needed).

# Machine selection variables (if needed).
```

### Cách hoạt động...

Chúng ta sẽ giải thích chi tiết hơn từng thành phần của recipe trong các mục sau.

#### License của package

Mọi recipe đều cần chứa biến `LICENSE`. Biến `LICENSE` cho phép bạn chỉ định nhiều license, license thay thế, và license per-package, như trong các ví dụ sau:

- Với các license thay thế `MIT` hoặc `GPLv2`, chúng ta sẽ dùng:

  ```
  LICENSE = "GPL-2.0 | MIT"
  ```

- Với cả license `ISC` lẫn `MIT`, chúng ta sẽ dùng:

  ```
  LICENSE = "ISC & MIT"
  ```

- Với các package được tách, tất cả là `GPLv2` ngoại trừ tài liệu được cấp phép theo Creative Commons, chúng ta sẽ dùng:

  ```
  LICENSE_${PN} = "GPLv2"
  LICENSE_${PN}-dev = "GPLv2"
  LICENSE_${PN}-dbg = "GPLv2"
  LICENSE_${PN}-doc = "CC-BY-2.0"
  ```

Các package open source thường có license đi kèm source code trong các file `README`, `COPYING` hoặc `LICENSE`, thậm chí trong header của source code.

Với các license open source, chúng ta cũng cần chỉ định `LIC_FILES_CHECKSUM` cho mọi license để build system có thể thông báo cho chúng ta khi license thay đổi. Để thêm nó, chúng ta tìm file hoặc phần file chứa license và cung cấp đường dẫn tương đối của nó từ thư mục chứa source, cùng một checksum MD5 cho nó. Ví dụ:

```
LIC_FILES_CHKSUM =
"file://${COMMON_LICENSE_DIR}/GPL-2.0;md5=801f80980d171dd6425610833a22dbe6"
```

Ví dụ này dùng một văn bản license GPL-2.0 từ thư mục common licenses của Poky (`meta/files/common-licenses`). Cách này có thể dùng thay thế khi package source không kèm license.

```
LIC_FILES_CHKSUM =
   "file://COPYING;md5=f7bdc0c63080175d1667091b864cb12c"
```

Ví dụ này trỏ tới một file `COPYING` có trong source.

```
LIC_FILES_CHKSUM =
   "file://usr/include/head.h;endline=7;md5=861ebad4adc7236f8d1905338
   abd7eb2"
LIC_FILES_CHKSUM =
   "file://src/file.c;beginline=5;endline=13;md5=6c7486b21a8524b1879f
   a159578da31e"
```

Cả hai ví dụ ở đây đều trỏ tới các đoạn trích từ source code file có chứa license.

Code độc quyền nên đặt license là `CLOSED`, và không cần `LIC_FILES_CHECKSUM` cho nó.

Bạn có thể dùng command `recipetool` để tạo một recipe skeleton, sau đó sửa tiếp cho hoàn chỉnh, với:

```
$ recipetool create -o helloworld.bb helloworld.c
```

Trong đó:

- `-o` là đường dẫn tới file cần tạo

- `-N` là tên package tùy chọn

- `-V` là phiên bản package tùy chọn

#### Fetch nội dung package

Biến `SRC_URI` liệt kê các file cần fetch. Build system sẽ dùng các fetcher khác nhau tùy theo tiền tố của file. Chúng có thể là:

- Các file local đi kèm metadata (dùng tiền tố `file://`). Nếu file local là một patch, biến `SRC_URI` có thể được mở rộng với các đối số patch-specific như:

  - `striplevel`: Patch strip level mặc định là 1 nhưng có thể thay đổi bằng đối số này

  - `patchdir`: Chỉ định vị trí thư mục để áp dụng patch, mặc định là source directory

  - `apply`: Đối số này điều khiển có áp dụng patch hay không, mặc định là có áp dụng

- Các file lưu trên server từ xa (thường là `http(s)://`, `ftp://` hoặc `ssh://`).

- Các file lưu trong repository từ xa (thường là `git://`, `svn://`, `hg://` hoặc `bzr://`). Những file này cũng cần một biến `SRCREV` để chỉ định revision.

Các file lưu trên server từ xa (không phải file local hay repository từ xa) cần chỉ định hai checksum. Nếu có nhiều file, chúng có thể được phân biệt bằng đối số name, ví dụ:

```
SRCREV = "04024dea2674861fcf13582a77b58130c67fccd8"
SRC_URI = "git://repo.com/git/ \
           file://fix.patch;name=patch \
           http://example.org/archive.data;name=archive"
SRC_URI[archive.md5sum] = "aaf32bde135cf3815aa3221726bad71e"
SRC_URI[archive.sha256sum] =
   "65be91591546ef6fdfec93a71979b2b108eee25edbc20c53190caafc9a92d4e7"
```

Thư mục source, `S`, chỉ định vị trí của các source file. Repository sẽ được checkout vào đây, hoặc tarball được giải nén tại vị trí này. Nếu tarball giải nén vào vị trí chuẩn `${BPN}-${PV}`, có thể bỏ qua nó vì đó là mặc định. Với repository, nó luôn cần được chỉ định, ví dụ:

```
S = "${WORKDIR}/git"
```

#### Chỉ định task override

Mọi recipe đều kế thừa class `base.bbclass`, class này lần lượt kế thừa `patch.bbclass` và `staging.bbclass`, và cùng nhau định nghĩa các task sau:

- `do_build`: Đây là task mặc định, theo mặc định chỉ thực thi tất cả các task còn lại.

- `do_fetch`: Method này fetch source code, chọn fetcher dựa trên biến `SRC_URI`. Các định dạng archive được tải vào `DL_DIR`, còn các định dạng Git được clone vào `DL_DIR/git2` và đóng thành tarball trong `DL_DIR`.

- `do_unpack`: Method này tạo `WORKDIR` tại `TMPDIR/work/<arch>/<PN>/<PV>`, và giải nén code trong thư mục làm việc tới vị trí được chỉ định bởi biến `S`, mặc định là `WORKDIR/<PN>-<PV>`.

- `do_patch`: Method này áp dụng mọi patch được chỉ định bằng `quilt` lên source đã giải nén.

- `do_configure`: Method này cấu hình source code nếu cần, ví dụ khi dùng các class `autotools` hoặc `cmake`, với các file cấu hình và makefile được ghi vào `B`, thường là `WORKDIR/build`. Theo mặc định nó không làm gì.

- `do_populate_lic`: Method này nạp thông tin license vào thư mục `TMPDIR/deploy/licenses/<PN>`.

- `do_compile`: Method này biên dịch source trong `S` và theo mặc định chạy GNU make target để tạo binary trong `B`. Các thư mục `sysroot` per-recipe riêng lẻ được nạp dữ liệu tại thời điểm này.

- `do_install`: Method này dùng pseudo để sao chép kết quả build từ build directory `B` tới thư mục đích `D`, thường là `WORKDIR/image`. Theo mặc định nó không làm gì.

- `do_package`: Method này tách các sản phẩm thành nhiều package trong `WORKDIR/packages-split`. Theo mặc định nó không làm gì.

- `do_populate_sysroot`: Method này nạp vào `WORKDIR/sysroot-destdir` các header file, shared object và file `packageconfig`.

- `do_package_write_rpm`: Method này tạo các package RPM, giả sử class package RPM mặc định được dùng, trong `TMPDIR/deploy/rpm`.

- `do_rootfs`: Với các image recipe kế thừa `image.bbclass`, method này cài các package RPM để tạo image `rootfs` cuối cùng trong `TMPDIR/work/<machine>/<image-name>/<PV>/rootfs`, cũng như sao chép các image cuối cùng vào `TMPDIR/deploy/images/<machine>`.

Task có thể bị override, append hoặc prepend. Chúng ta cũng có thể thêm task mới bằng `addtask`, bỏ một task bằng `deltask`, hoặc đơn giản là bỏ qua nó như sau:

```
do_task[noexec] = "1"
```

Thông thường, chỉ các task cấu hình, biên dịch và cài đặt bị override, và điều này phần lớn được thực hiện ngầm bằng việc kế thừa class `autotools`. Chúng ta sẽ bàn về các class khác nhau dùng cho phát triển ứng dụng trong `Chapter 4`, Application Development.

Với một recipe tùy biến không dùng build system, bạn cần cung cấp các chỉ dẫn cần thiết cho cấu hình (nếu có), biên dịch và cài đặt trong các override `do_configure`, `do_compile` và `do_install` tương ứng. Một ví dụ về loại recipe này, `meta-custom/recipes-example/helloworld/helloworld_1.0.bb`, được trình bày ở đây:

```
DESCRIPTION = "Simple helloworld application"
SECTION = "examples"
LICENSE = "MIT"
LIC_FILES_CHKSUM =
   "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4
f302"
SRC_URI = "file://helloworld.c"

S = "${WORKDIR}"

do_compile() {
             ${CC} ${LDFLAGS} helloworld.c -o helloworld
}

do_install() {
             install -d ${D}${bindir}
             install -m 0755 helloworld ${D}${bindir}
}
```

Source file `meta-custom/recipes-example/helloworld/helloworld-1.0/helloworld.c` như sau:

```
#include <stdio.h>

int main(void)
{
    return printf("Hello World");
}
```

Chúng ta sẽ khám phá các recipe ví dụ dùng những build system phổ biến nhất trong chương sau.

#### Cấu hình package

Yocto build system cung cấp biến `PACKAGECONFIG` để giúp cấu hình package bằng cách định nghĩa một số feature. Recipe của bạn định nghĩa từng feature như sau:

```
PACKAGECONFIG ??= "feature"
PACKAGECONFIG[feature] = "--with-feature,--without-feature,build-deps-
feature,rt-deps-feature"
```

Biến `PACKAGECONFIG` chứa một danh sách tên feature space-separated, và có thể được mở rộng hoặc override trong các file `bbappend`; hãy xem ví dụ sau:

```
PACKAGECONFIG_append = " feature1 feature2"
```

Để mở rộng hoặc override nó từ một file cấu hình distribution hoặc cấu hình local, bạn sẽ dùng cú pháp sau:

```
PACKAGECONFIG_pn-<package_name> = "feature1 feature2"
PACKAGECONFIG_append_pn-<package_name> = " feature1 feature2"
```

Sau đó, chúng ta mô tả mỗi feature bằng bốn đối số theo thứ tự:

- Các đối số cấu hình bổ sung (cho `EXTRA_OECONF`) khi feature được bật

- Các đối số cấu hình bổ sung (cho `EXTRA_OECONF`) khi feature bị tắt

- Các build dependency bổ sung (cho `DEPENDS`) khi feature được bật

- Các runtime dependency bổ sung (cho `RDEPENDS`) khi feature được bật

Bốn đối số này là tùy chọn, nhưng thứ tự cần được giữ bằng cách để lại các dấu phẩy xung quanh.

Ví dụ, recipe `wpa-supplicant` định nghĩa hai feature, `gnutls` và `openssl`, nhưng mặc định chỉ bật `gnutls`, như thấy ở đây:

```
PACKAGECONFIG ??= "gnutls"
PACKAGECONFIG[gnutls] = ",,gnutls libgcrypt"
PACKAGECONFIG[openssl] = ",,openssl"
```

#### Tách thành nhiều package

Việc tách nội dung recipe thành các package khác nhau phục vụ các nhu cầu khác nhau là phổ biến. Các ví dụ điển hình là đưa tài liệu vào một package `doc`, và header và/hoặc library vào một package `dev`. Chúng ta có thể làm điều này bằng biến `FILES` như sau:

```
FILES_${PN} += "List of files to include in the main package"
FILES_${PN}-dbg += "Optional list of files to include in the debug package"
FILES_${PN}-dev += "Optional list of files to include in the development
package"
FILES_${PN}-doc += "Optional list of files to include in the documentation
package"
```

#### Đặt các biến machine-specific

Mỗi recipe có một biến `PACKAGE_ARCH` phân loại recipe vào một package feed, như đã thấy trong recipe Exploring an image's contents. Phần lớn thời gian, chúng được Yocto build system tự động sắp xếp. Ví dụ, nếu recipe là một kernel, một kernel module recipe hoặc một image recipe, hay thậm chí nếu nó đang cross-compiling hoặc build ứng dụng native, Yocto build system sẽ đặt package architecture cho phù hợp.

BitBake cũng sẽ xem các machine override trong `SRC_URI` và điều chỉnh package architecture, và nếu recipe của bạn dùng class `allarch`, nó sẽ đặt package architecture thành `all`.

Vì vậy khi làm một recipe chỉ áp dụng cho một machine hoặc họ machine, hoặc chứa các thay đổi riêng cho một machine hoặc họ machine, chúng ta cần kiểm tra xem package có được phân loại vào package feed phù hợp không, và nếu không, chỉ định package architecture một cách tường minh trong chính recipe bằng dòng code sau:

```
PACKAGE_ARCH = "${MACHINE_ARCH}"
```

Ngoài ra, khi một recipe chỉ được parse cho các loại machine cụ thể, chúng ta chỉ định điều đó bằng biến `COMPATIBLE_MACHINE`. Ví dụ, để nó chỉ tương thích với các họ SoC `mxs`, `mx5` và `mx6`, chúng ta sẽ dùng dòng sau:

```
COMPATIBLE_MACHINE = "(mxs|mx5|mx6)"
```

## Thêm dữ liệu, script hoặc file cấu hình

Mọi recipe đều kế thừa base class với tập task mặc định cần chạy. Sau khi kế thừa base class, một recipe biết cách làm những việc như fetch và biên dịch.

Vì hầu hết recipe nhằm cài đặt một loại executable nào đó, base class biết cách build nó. Nhưng đôi khi tất cả những gì chúng ta muốn là cài dữ liệu, script hoặc file cấu hình vào filesystem.

Nếu dữ liệu hoặc cấu hình liên quan tới một ứng dụng, điều hợp lý nhất là đóng gói nó cùng với chính recipe của ứng dụng, và nếu thấy tốt hơn là cài riêng, chúng ta thậm chí có thể tách nó thành package riêng.

Nhưng có những lúc dữ liệu hoặc cấu hình không liên quan tới một ứng dụng; có thể nó áp dụng cho toàn hệ thống hoặc chúng ta chỉ muốn cung cấp một recipe riêng cho nó. Hoặc chúng ta thậm chí có thể muốn cài một số script ngôn ngữ thông dịch không cần biên dịch.

### Cách thực hiện...

Trong những trường hợp đó, recipe của chúng ta nên kế thừa class `allarch`, class được kế thừa bởi các recipe không tạo ra output architecture-specific.

Một ví dụ về loại recipe này, `meta-custom/recipes-example/example-data/example-data_1.0.bb`, có thể thấy ở đây:

```
DESCRIPTION = "Example of data or configuration recipe"
SECTION = "examples"
LICENSE = "GPLv2"
LIC_FILES_CHKSUM =
"file://${COMMON_LICENSE_DIR}/GPL-2.0;md5=801f80980d171dd6425610833a22dbe6"

SRCREV = "${AUTOREV}"
SRC_URI = "git://github.com/yoctocookbook2ndedition/examples.git \
           file://example.data"

S = "${WORKDIR}/git"
inherit allarch
do_compile[noexec] = "1"

do_install() {
        install -d ${D}${sysconfdir}
        install -d ${D}${sbindir}
        install -m 0755 ${WORKDIR}/example.data ${D}/${sysconfdir}/
        install -m 0755 ${S}/python-scripts/* ${D}/${sbindir}
}
```

Nó giả định rằng repository hư cấu `examples.git` chứa một thư mục `python-scripts` mà chúng ta muốn đưa vào root filesystem.

Một recipe ví dụ hoạt động được có trong source đi kèm cuốn sách.

### Còn nữa...

Khi chỉ muốn thay một file cụ thể trong filesystem, chúng ta có thể dùng tiện ích command-line `recipetool` để tự động tạo file `bbappend` cho mình. Để việc này hoạt động, package cần đã được build trước và có trong một target image. Cú pháp cần dùng là:

```
$ recipetool appendfile </path/to/layer> </path/to/file/in/target> <new-
file>
```

Một file điển hình cần thay là file `/etc/network/interfaces` chứa các thiết lập mạng. Chúng ta có thể thêm một file `append` vào `meta-custom` để thay nó bằng phiên bản mới với:

```
$ recipetool appendfile /opt/yocto/fsl-community-bsp/sources/meta-custom/
/etc/network/interfaces interfaces-new
```

## Quản lý user và group

Việc cần thêm hoặc sửa user và group trong filesystem cũng phổ biến. Recipe này giải thích cách làm điều đó.

### Chuẩn bị

Thông tin user được lưu trong file `/etc/passwd`, một file văn bản được dùng như database cho thông tin user của hệ thống. File `passwd` là human-readable.

Mỗi dòng trong đó tương ứng với một user trong hệ thống, và có định dạng sau:

```
<username>:<password>:<uid>:<gid>:<comment>:<home directory>:<login shell>
```

Hãy xem từng tham số của định dạng này:

- `username`: Một chuỗi duy nhất định danh user khi đăng nhập

- `uid`: User ID, một số mà Linux dùng để định danh user

- `gid`: Group ID, một số mà Linux dùng để định danh primary group của user

- `comment`: Các giá trị Comma-separated mô tả tài khoản, thường là thông tin liên hệ của user

- `home directory`: Đường dẫn tới home directory của user

- `login shell`: Shell được khởi động cho các lần đăng nhập tương tác

File `passwd` mặc định được lưu cùng package `base-passwd` và trông như sau:

```
root::0:0:root:/root:/bin/sh
daemon:*:1:1:daemon:/usr/sbin:/bin/sh
bin:*:2:2:bin:/bin:/bin/sh
sys:*:3:3:sys:/dev:/bin/sh
sync:*:4:65534:sync:/bin:/bin/sync
games:*:5:60:games:/usr/games:/bin/sh
man:*:6:12:man:/var/cache/man:/bin/sh
lp:*:7:7:lp:/var/spool/lpd:/bin/sh
mail:*:8:8:mail:/var/mail:/bin/sh
news:*:9:9:news:/var/spool/news:/bin/sh
uucp:*:10:10:uucp:/var/spool/uucp:/bin/sh
proxy:*:13:13:proxy:/bin:/bin/sh
www-data:*:33:33:www-data:/var/www:/bin/sh
backup:*:34:34:backup:/var/backups:/bin/sh
list:*:38:38:Mailing List Manager:/var/list:/bin/sh
irc:*:39:39:ircd:/var/run/ircd:/bin/sh
gnats:*:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/bin/sh
nobody:*:65534:65534:nobody:/nonexistent:/bin/sh
```

Mọi tài khoản đều bị tắt đăng nhập trực tiếp, được biểu thị bằng dấu sao trong trường `password`, ngoại trừ root, không có mật khẩu. Đó là vì theo mặc định, image được build với feature `debug-tweaks`, feature này bật đăng nhập password-less cho user root, cùng những thứ khác. Nếu mật khẩu root được bật, chúng ta sẽ thấy mật khẩu root đã mã hóa.

> Đừng quên bỏ feature `debug-tweaks` khỏi các image production.

Có một file `/etc/group` tương ứng được cài cùng lúc, chứa thông tin về các group hệ thống.

Image `core-image-minimal` không có bảo vệ shadow password, nhưng các image khác, như `core-image-full-cmdline`, thì có. Khi được bật, mọi trường mật khẩu chứa một `x`, và mật khẩu đã mã hóa được giữ trong file `/etc/shadow`, file chỉ super user mới truy cập được.

Bất kỳ user nào hệ thống cần mà không có trong danh sách đã thấy ở trên đều cần được tạo.

### Cách thực hiện...

Cách chuẩn để một recipe thêm hoặc sửa user hay group hệ thống là dùng class `useradd`, class này dùng các biến sau:

- `USERADD_PACKAGES`: Biến này chỉ định các package riêng lẻ trong recipe cần thêm user hoặc group. Với package chính, bạn sẽ dùng dòng sau:

  ```
  USERADD_PACKAGES = "${PN}"
  ```

- `USERADD_PARAM`: Biến này tương ứng với các đối số truyền cho command Linux `useradd`, để thêm user mới vào hệ thống.

- `GROUPADD_PARAM`: Biến này tương ứng với các đối số truyền cho command Linux `groupadd`, để thêm group mới vào hệ thống.

- `GROUPMEMS_PARAM`: Biến này tương ứng với các đối số truyền cho command Linux `groupmems`, command quản trị các thành viên của primary group của user.

Class `useradd` sẽ thêm shadow password vào hệ thống như một dependency.

Sau đây là một đoạn recipe ví dụ dùng class `useradd`:

```
inherit useradd

PASSWORD ?= "9PfNy0O1z0O5g"
USERADD_PACKAGES = "${PN}"
USERADD_PARAM_${PN} = "--system --create-home \
                       --groups tty \
                       --password ${PASSWORD} \
                       --user-group <newuser>"
```

Mật khẩu có thể được sinh trên host bằng tiện ích command-line Linux `mkpasswd`, được cài cùng package Ubuntu `whois`:

```
$ mkpasswd password
9VuPL5UF0N7lg
```

### Còn nữa...

Khi tạo user và group bằng class `useradd`, các giá trị `uid` và `gid` được gán động trong quá trình cài package. Nếu không muốn điều này, có một cách để gán các giá trị `uid` và `gid` tĩnh system-wide bằng cách cung cấp các file `passwd` và `group` của riêng bạn.

Để làm vậy, bạn cần định nghĩa biến `USERADDEXTENSION` trong file `conf/local.conf` như sau:

```
USERADDEXTENSION = "useradd-staticids"
```

Khi đó build system sẽ tìm trong biến `BBPATH` các file `files/passwd` và `files/group` để lấy giá trị `uid` và `gid`. Các file này có bố cục `passwd` chuẩn như đã định nghĩa ở trên, với trường `password` bị bỏ qua.

Tên file mặc định có thể được override bằng các biến `USERADD_UID_TABLES` và `USERADD_GID_TABLES`.

Bạn cũng cần định nghĩa như sau:

```
USERADD_ERROR_DYNAMIC = "error"
```

Điều này được làm để build system báo lỗi nếu không tìm thấy giá trị `uid` và `gid` cần thiết trong các file được cung cấp.

> Lưu ý rằng nếu bạn dùng class `useradd` trong một project đã được build, bạn sẽ cần xóa thư mục `tmp` và rebuild từ thư mục `sstate-cache`, nếu không sẽ gặp lỗi build.

Cũng có cách để thêm thông tin user và group không gắn với một recipe cụ thể mà với một image: bằng class `extrausers`. Nó được cấu hình bằng biến `EXTRA_USERS_PARAMS` trong một image recipe. Ví dụ, để đổi mật khẩu root thành `password`, nó được dùng như sau:

```
inherit extrausers

EXTRA_USERS_PARAMS = "\
  usermod -p 9PfNy0O1z0O5g root; \
  "
```

## Dùng initialization manager sysvinit

Initialization manager là một phần quan trọng của root filesystem. Nó là thứ đầu tiên kernel thực thi, và có trách nhiệm khởi động phần còn lại của hệ thống, và cũng quản lý việc tắt hệ thống.

Initialization manager thường do Linux distribution cố định. Distribution Poky cho phép bạn chọn giữa các initialization manager, được dùng nhiều nhất là System V init (`sysvinit`) và `systemd`. Distribution `poky-tiny` không có initialization manager và dùng BusyBox init để đọc trực tiếp file `inittab` và khởi chạy chương trình.

Hệ điều hành UNIX System V đã đưa ra một hệ thống khởi tạo, là nền tảng cho việc khởi tạo của Linux. Đã có một số nỗ lực gần đây nhằm thay thế nó, và `systemd` cuối cùng đã có đủ sức hút giữa các Linux distribution để được xem là kẻ kế nhiệm của `sysvinit`.

Recipe này sẽ giới thiệu initialization manager `sysvinit`.

### Chuẩn bị

`sysvinit` là initialization manager mặc định trong Yocto và đã được dùng trong Linux từ khi hệ điều hành này ra đời. Kernel được truyền một đối số command-line `init`, thường là `/sbin/init`, chương trình này sau đó được khởi chạy tới một runlevel mặc định, tức một trạng thái máy định nghĩa những process nào cần chạy. Process `init` này có PID 1 và là cha của mọi process.

Process `init` sẽ đọc một file `inittab` và tìm runlevel mặc định. File `inittab` mặc định được cài cùng package `sysvinit-inittab` và như sau:

```
# /etc/inittab: init(8) configuration.
# $Id: inittab,v 1.91 2002/01/25 13:35:21 miquels Exp $

# The default runlevel.
id:5:initdefault:

# Boot-time system configuration/initialization script.
# This is run first except when booting in emergency (-b) mode.
si::sysinit:/etc/init.d/rcS

# What to do in single-user mode.
~~:S:wait:/sbin/sulogin

# /etc/init.d executes the S and K scripts upon change
# of runlevel.
#
# Runlevel 0 is halt.
# Runlevel 1 is single-user.
# Runlevels 2-5 are multi-user.
# Runlevel 6 is reboot.

l0:0:wait:/etc/init.d/rc 0
l1:1:wait:/etc/init.d/rc 1
l2:2:wait:/etc/init.d/rc 2
l3:3:wait:/etc/init.d/rc 3
l4:4:wait:/etc/init.d/rc 4
l5:5:wait:/etc/init.d/rc 5
l6:6:wait:/etc/init.d/rc 6
# Normally not reached, but fallthrough in case of emergency.
z6:6:respawn:/sbin/sulogin
```

Sau đó, `init` chạy mọi script bắt đầu bằng S (`start scripts`) trong thư mục `/etc/rcS.d`, tiếp theo là mọi script bắt đầu bằng S trong thư mục `/etc/rcN.d`, trong đó `N` là giá trị runlevel. Khi hệ thống tắt, các script bắt đầu bằng K (`kill`) được thực thi.

Như vậy process `init` chỉ thực hiện việc khởi tạo rồi quên các process đi. Nếu có gì sai và các process bị kill, sẽ không ai quan tâm. Watchdog của hệ thống sẽ reboot hệ thống nếu nó không phản hồi; các ứng dụng gồm nhiều hơn một process thường cần một kiểu process monitor nào đó có thể phản ứng với tình trạng sức khỏe của hệ thống, nhưng `sysvinit` không cung cấp những cơ chế như vậy.

Tuy nhiên, `sysvinit` là một initialization manager well-understood và đáng tin cậy, và khuyến nghị là giữ nó trừ khi bạn cần tính năng bổ sung nào đó.

Giờ chúng ta sẽ xem cách làm cho `init` khởi chạy process mới. Chúng có thể là các process one-shot, daemon, tức là các process chạy nền, hoặc các ứng dụng.

### Cách thực hiện...

Khi dùng `sysvinit` làm initialization manager, Yocto cung cấp class `update-rc.d` như một helper để cài các script khởi tạo, để các service được khởi động và dừng khi cần.

Khi dùng class này, bạn cần chỉ định biến `INITSCRIPT_NAME` với tên script cần cài và biến `INITSCRIPT_PARAMS` với các tùy chọn truyền cho tiện ích `update-rc.d`. Bạn có thể tùy chọn dùng biến `INITSCRIPT_PACKAGES` để liệt kê các package chứa các script khởi tạo. Theo mặc định, biến này chỉ chứa package chính, và nếu có nhiều package, `INITSCRIPT_NAME` và `INITSCRIPT_PARAMS` cần được chỉ định cho từng package bằng override. Một đoạn ví dụ là:

```
INITSCRIPT_PACKAGES = "${PN}-httpd ${PN}-ftpd"
INITSCRIPT_NAME_${PN}-httpd = "httpd.sh"
INITSCRIPT_NAME_${PN}-ftpd = "ftpd.sh"
INITSCRIPT_PARAMS_${PN}-httpd = "defaults"
INITSCRIPT_PARAMS_${PN}-ftpd = "start 99 5 2 . stop 20 0 1 6 ."
```

Khi một script khởi tạo không gắn với một recipe cụ thể, chúng ta có thể thêm một recipe riêng cho nó. Ví dụ, recipe sau sẽ chạy một script `mount.sh`, trong file `recipes-example/sysvinit-mount/sysvinit-mount_1.0.bb`:

```
DESCRIPTION = "Initscripts for mounting filesystems"
LICENSE = "MIT"

LIC_FILES_CHKSUM =
   "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4
   f302"

SRC_URI = "file://mount.sh"

INITSCRIPT_NAME = "mount.sh"
INITSCRIPT_PARAMS = "start 09 S ."

inherit update-rc.d

S = "${WORKDIR}"

do_install () {
    install -d ${D}${sysconfdir}/init.d/
    install -c -m 755 ${WORKDIR}/${INITSCRIPT_NAME}
${D}${sysconfdir}/init.d/${INITSCRIPT_NAME}
}
```

Recipe này sẽ cài script `mount.sh` vào thư mục `/etc/init.d/` và sẽ tạo mọi symbolic link phù hợp bên trong các thư mục `/etc/rcN.d/`.

## Dùng initialization manager systemd

Thay cho `sysvinit`, bạn có thể cấu hình project để dùng `systemd` làm initialization manager. `systemd` không chỉ thực hiện khởi tạo hệ thống, nó còn quản lý các process hệ thống, và có nhiều tính năng hơn hẳn `sysvinit`.

Initialization manager `systemd` đang thay thế `sysvinit` và các initialization manager khác trong hầu hết Linux distribution. Tuy nhiên, việc áp dụng `systemd` trong các Linux distribution lớn không thiếu tranh cãi. Nhiều người xem `systemd` là một hệ thống quá phức tạp với một architecture rắc rối, đi ngược triết lý Unix về software modular đơn giản, ngắn gọn, rõ ràng và mở rộng được, dễ bảo trì và tái sử dụng cho mục đích khác.

`systemd` cũng có kích thước lớn so với `sysvinit`, dù nó có thể được thu nhỏ và tùy biến cho các dự án embedded. Một số tính năng của nó gắn chặt với các tính năng của kernel, và việc cập nhật nó có thể buộc phải cập nhật kernel, điều không phải lúc nào cũng khả thi với thiết bị embedded.

Tuy vậy, nó có tính năng khởi động service song song, giúp thời gian boot nhanh hơn, cung cấp dependency giữa các service, có security framework tốt hơn, và cung cấp software watchdog cho các process, cùng các tính năng khác.

Recipe này sẽ giới thiệu initialization manager `systemd`.

### Chuẩn bị

`systemd` dựa trên khái niệm unit, một sự trừu tượng hóa mọi thành phần liên quan tới việc khởi động và duy trì hệ thống, và target, nhóm các unit lại và có thể xem như tương đương với runlevel. Một số unit mà `systemd` định nghĩa là:

- Service

- Socket

- Device

- Mount point

- Snapshot

- Timer

- Path

Các target mặc định và runlevel tương đương của chúng được định nghĩa trong bảng sau:

| sysvinit | Runlevel | systemd target | Ghi chú |
|---|---|---|---|
| 0 | `runlevel0.target` | `poweroff.target` | Dừng hệ thống. |
| 1, s, single | `runlevel1.target` | `rescue.target` | Chế độ single user. |
| 2, 4 | `runlevel2.target`, `runlevel4.target` | `multi-user.target` | Runlevel User-defined/site-specific. Theo mặc định, giống hệt `3`. |
| 3 | `runlevel3.target` | `multi-user.target` | Đa người dùng, non-graphical. Người dùng thường có thể đăng nhập qua nhiều console hoặc qua mạng. |
| 5 | `runlevel5.target` | `graphical.target` | Đa người dùng, đồ họa. Thường có mọi service của runlevel 3 cộng thêm đăng nhập đồ họa. |
| 6 | `runlevel6.target` | `reboot.target` | Reboot hệ thống. |

Khi `systemd` được Linux kernel khởi động, nó chạy `default.target`, là một link tới `multi-user.target` hoặc `graphical.target`.

Initialization manager `systemd` được thiết kế để tương thích với `sysvinit`, kể cả việc dùng các init script của `sysvinit`.

Một số tính năng của `systemd` là:

- Khả năng song song hóa giúp thời gian boot nhanh hơn

- Khởi tạo service qua socket và D-Bus để service chỉ được khởi động khi cần

- Giám sát process, cho phép khôi phục khi process lỗi

- Snapshot và khôi phục trạng thái hệ thống

- Quản lý mount point

- Điều khiển unit theo kiểu transactional dependency-based, trong đó các unit thiết lập dependency giữa chúng

### Cách thực hiện...

Để cấu hình hệ thống dùng `systemd`, bạn cần thêm distribution feature `systemd` vào project bằng cách thêm dòng sau vào file cấu hình của distribution, dưới `sources/poky/meta-poky/conf/distro/poky.conf` cho distribution Poky mặc định, hoặc cục bộ trong file `conf/local.conf` của project:

```
DISTRO_FEATURES_append = " systemd"
```

> Lưu ý rằng cần có dấu cách sau dấu nháy mở.

```
VIRTUAL-RUNTIME_init_manager = "systemd"
```

Ví dụ cấu hình này cho phép bạn định nghĩa một image chính với `systemd` và một rescue image với `sysvinit`, miễn là nó không dùng biến `VIRTUAL-RUNTIME_init_manager`. Do đó, rescue image không thể dùng các recipe `packagegroup-core-boot` hoặc `packagegroup-core-full-cmdline`.

Để bỏ hoàn toàn `sysvinit` khỏi hệ thống, bạn sẽ làm như sau:

```
DISTRO_FEATURES_BACKFILL_CONSIDERED = "sysvinit"
VIRTUAL-RUNTIME_initscripts = ""
```

Feature backfilling là việc tự động mở rộng các machine feature và distribution feature để giữ tương thích ngược. Distribution feature `sysvinit` được tự động điền vào, nên để bỏ nó, chúng ta cần đưa nó vào blacklist bằng cách thêm nó vào biến `DISTRO_FEATURES_BACKFILL_CONSIDERED` như đã thấy ở trên.

> Nếu bạn đang dùng một project có sẵn và thay đổi biến `DISTRO_FEATURES` như giải thích ở trên, bạn sẽ cần xóa thư mục `tmp` và build từ `sstate-cache`, nếu không bản build sẽ thất bại.

### Còn nữa...

Không chỉ root filesystem cần được cấu hình, mà Linux kernel cũng cần được cấu hình cụ thể với mọi tính năng mà `systemd` yêu cầu. Có một danh sách dài các biến cấu hình kernel trong file `README` của source `systemd`. Ví dụ, để mở rộng cấu hình kernel tối thiểu mà chúng ta sẽ giới thiệu trong recipe Reducing the Linux kernel image size ở phần sau của chương này, để Wandboard hỗ trợ `systemd`, chúng ta sẽ cần thêm các thay đổi cấu hình sau vào file `arch/arm/configs/wandboard-custom-minimal_defconfig`:

```
+CONFIG_FHANDLE=y
+CONFIG_CGROUPS=y
+CONFIG_SECCOMP=y
+CONFIG_NET=y
+CONFIG_UNIX=y
+CONFIG_INET=y
+CONFIG_AUTOFS4_FS=y
+CONFIG_TMPFS=y
+CONFIG_TMPFS_POSIX_ACL=y
+CONFIG_SCHEDSTATS=y
-# CONFIG_PROC_SYSCTL is not set
-# CONFIG_PROC_PAGE_MONITOR is not set
-# CONFIG_SYSFS is not set
```

Cấu hình kernel mặc định được cung cấp cho Wandboard sẽ khởi chạy một image `core-image-minimal` của `systemd` không có vấn đề gì.

#### Cài các unit file của systemd

Yocto cung cấp class `systemd` như một helper để cài các unit file. Theo mặc định, unit file được cài vào đường dẫn `${systemd_unitdir}/system` trên thư mục đích.

Khi dùng class này, bạn cần chỉ định biến `SYSTEMD_SERVICE_${PN}` với tên unit file cần cài. Bạn có thể tùy chọn dùng biến `SYSTEMD_PACKAGES` để liệt kê các package chứa unit file. Theo mặc định, đó chỉ là package chính, và nếu có nhiều package, biến `SYSTEMD_SERVICE` cần được chỉ định bằng override.

Service được cấu hình để khởi chạy lúc boot theo mặc định, nhưng điều này có thể thay đổi bằng biến `SYSTEMD_AUTO_ENABLE`.

Một đoạn ví dụ là:

```
SYSTEMD_PACKAGES = "${PN}-syslog"
SYSTEMD_SERVICE_${PN}-syslog = "busybox-syslog.service"
SYSTEMD_AUTO_ENABLE = "disabled"
```

Một recipe ví dụ, `recipes-example/systemd-example/systemd-example_1.0.bb`, cho một service đơn giản, được giới thiệu tiếp theo:

```
DESCRIPTION = "Example systemd service"

LICENSE = "MIT"
LIC_FILES_CHKSUM =
"file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4f302"

SRC_URI = "\
    file://systemd-example.service \
    file://simple-service.c \
"
inherit systemd

S = "${WORKDIR}"

SYSTEMD_SERVICE_${PN} = "systemd-example.service"

do_compile () {
    ${CC} ${LDFLAGS} simple-service.c -o simple-service
}

do_install () {
    install -d ${D}${bindir}
    install -m 0755 ${WORKDIR}/simple-service ${D}${bindir}
    install -d ${D}${systemd_unitdir}/system
    install -m 0644 ${WORKDIR}/systemd-example.service
${D}${systemd_unitdir}/system
    sed -i -e 's,@BINDIR@,${bindir},g'
${D}${systemd_unitdir}/system/systemd-example.service
}
```

Recipe này cài unit service `systemd` sau:

```
[Unit]
Description=Example service

[Service]
Type=forking
ExecStart=@BINDIR@/simple-service


[Install]
WantedBy=multi-user.target
```

Nó cũng chạy một daemon skeleton rất đơn giản:

```
#include <unistd.h>
#include <syslog.h>

#define DAEMON_NAME "simpledaemon"

int main()
{
        setlogmask(LOG_UPTO(LOG_INFO));
        openlog(DAEMON_NAME, LOG_CONS | LOG_PERROR, LOG_USER);
        daemon(0,0);
        while (1)
        {
                syslog(LOG_INFO, "daemon running");
                sleep(10);
        }
        return 0;
}
```

### Xem thêm

- Thêm thông tin về `systemd` có tại `http://freedesktop.org/wiki/Software/systemd/`

## Cài các script cài đặt package

Các định dạng package được hỗ trợ, `.rpm`, `.ipk` và `.deb`, đều hỗ trợ việc thêm các script cài đặt có thể chạy vào những thời điểm khác nhau trong quá trình cài package. Trong recipe này, chúng ta sẽ xem cách cài chúng.

### Chuẩn bị

Có các loại script cài đặt khác nhau:

- Script Pre-installation (`pkg_preinst`): Được gọi trước khi package được giải nén

- Script Post-installation (`pkg_postinst`): Được gọi sau khi package được giải nén, và các dependency sẽ được cấu hình

- Script Pre-removal (`pkg_prerm`): Được gọi với các package đã cài hoặc ít nhất đã cài một phần

- Script Post-removal (`pkg_postrm`): Được gọi sau khi các file của package đã bị xóa hoặc thay thế

### Cách thực hiện...

Một đoạn ví dụ cho thấy việc cài một script pre-installation trong recipe như sau:

```
pkg_preinst_${PN} () {
    # Shell commands
}
```

Mọi script cài đặt đều hoạt động theo cùng cách, ngoại trừ việc các script post-installation có thể chạy trên host lúc tạo root filesystem image, trên target (cho những thao tác không thể thực hiện trên host), hoặc khi một package được cài trực tiếp trên target. Code sau cho thấy cách thêm một script post-installation vào recipe:

```
pkg_postinst_${PN} () {
    if [  x"$D" = "x" ]; then
         # Commands to execute on device
    else
         # Commands to execute on host
    fi
}
```

Nếu script post-installation thành công, package được đánh dấu là đã cài. Nếu script thất bại, package được đánh dấu là đã giải nén và script được thực thi khi image boot lại.

### Cách hoạt động...

Khi recipe định nghĩa một script cài đặt, class cho loại package cụ thể sẽ cài nó theo các quy tắc đóng gói của định dạng cụ thể đó.

Với script post-installation, khi chạy trên host, `D` được đặt là thư mục đích, nên phép so sánh sẽ thất bại. Nhưng `D` sẽ rỗng khi chạy trên target.

Một cách phổ biến khác để kiểm tra script có đang chạy trên thiết bị hay không là:

```
if test -n "$D"; then
  # Running on host
else
  # Running on target
fi
```

> Khuyến nghị thực hiện các script post-installation trên host nếu có thể, vì chúng ta cần tính tới việc một số root filesystem sẽ là read-only và do đó không thể thực hiện một số thao tác trên target.

## Giảm kích thước Linux kernel image

Trước hoặc song song với việc tùy biến root filesystem, các dự án embedded thường cần tối ưu kích thước image để giảm thời gian boot và lượng memory sử dụng.

Image nhỏ hơn nghĩa là ít không gian storage hơn, thời gian truyền ít hơn và thời gian nạp ít hơn, giúp tiết kiệm chi phí cả trong sản xuất lẫn cập nhật ngoài hiện trường.

Theo mặc định, Linux kernel image nén (`zImage`) cho Wandboard khoảng 6.2 MB. Recipe này sẽ cho thấy cách chúng ta có thể giảm kích thước đó.

### Cách thực hiện...

Một ví dụ về cấu hình kernel tối thiểu cho Wandboard có thể boot từ root filesystem trên thẻ microSD là file `arch/arm/configs/wandboard-custom-minimal_defconfig`:

```
CONFIG_KERNEL_XZ=y
# CONFIG_SWAP is not set
CONFIG_NO_HZ=y
CONFIG_HIGH_RES_TIMERS=y
CONFIG_CC_OPTIMIZE_FOR_SIZE=y
# CONFIG_KALLSYMS is not set
# CONFIG_PRINTK is not set
# CONFIG_BUG is not set
# CONFIG_ELF_CORE is not set
# CONFIG_BASE_FULL is not set
CONFIG_EMBEDDED=y
CONFIG_SLOB=y
CONFIG_ARCH_MXC=y
CONFIG_SOC_IMX6Q=y
# CONFIG_SWP_EMULATE is not set
CONFIG_ARM_ERRATA_814220=y
CONFIG_SMP=y
CONFIG_VMSPLIT_2G=y
CONFIG_AEABI=y
CONFIG_CPU_FREQ=y
# CONFIG_CPU_FREQ_STAT is not set
CONFIG_CPU_FREQ_DEFAULT_GOV_ONDEMAND=y
CONFIG_ARM_IMX6Q_CPUFREQ=y
CONFIG_CPU_IDLE=y
CONFIG_VFP=y
CONFIG_NEON=y
CONFIG_DEVTMPFS=y
CONFIG_DEVTMPFS_MOUNT=y
# CONFIG_INPUT_MOUSEDEV is not set
# CONFIG_INPUT_KEYBOARD is not set
# CONFIG_INPUT_MOUSE is not set
CONFIG_SERIAL_IMX=y
CONFIG_SERIAL_IMX_CONSOLE=y
# CONFIG_HWMON is not set
CONFIG_REGULATOR=y
CONFIG_REGULATOR_ANATOP=y
# CONFIG_USB_SUPPORT is not set
CONFIG_MMC=y
CONFIG_MMC_SDHCI=y
CONFIG_MMC_SDHCI_PLTFM=y
CONFIG_MMC_SDHCI_ESDHC_IMX=y
CONFIG_DMADEVICES=y
CONFIG_IMX_SDMA=y
CONFIG_EXT3_FS=y
# CONFIG_EXT3_FS_XATTR is not set
CONFIG_EXT4_FS=y
# CONFIG_PROC_SYSCTL is not set
# CONFIG_PROC_PAGE_MONITOR is not set
# CONFIG_SYSFS is not set
# CONFIG_ENABLE_WARN_DEPRECATED is not set
# CONFIG_ENABLE_MUST_CHECK is not set
# CONFIG_FTRACE is not set
# CONFIG_ARM_UNWIND is not set
```

Cấu hình này build một Linux kernel image nén (`zImage`) 867K cho một ELF image `vmlinux` 3.4 MB.

### Cách hoạt động...

Ngoài các cân nhắc về thiết kế hardware (như chạy Linux kernel từ NOR flash và execute in place (XIP) để tránh nạp image vào memory), bước đầu tiên trong tối ưu kích thước kernel là rà soát cấu hình kernel và bỏ mọi tính năng thừa.

Chúng ta có thể hiển thị tóm tắt kích thước kernel và module bằng script `ksum.py`. Chuyển tới thư mục của một Linux kernel source đã biên dịch, như đã giải thích ở `Chapter 2`, The BSP Layer, và chạy script từ thư mục gốc của Linux kernel:

```
$ cd /opt/yocto/linux-wandboard
$ /opt/yocto/fsl-community-bsp/sources/poky/scripts/tiny/ksum.py
Collecting object files recursively from /opt/yocto/linux-wandboard...
Collecting object files [DONE]
Totals:
vmlinux:
    text        data            bss             total
    14105252    969868          465400          15540520
modules (90):
    text        data            bss             total
    2059898     191819          20028           2271745
vmlinux + modules:
    text        data            bss             total
    16165150    1161687         485428          17812265
```

Để phân tích kích thước các khối của kernel, chúng ta dùng script `ksize.py`, script này cho output user-friendly. Như trước, chuyển tới thư mục của một Linux kernel source đã biên dịch và chạy script từ thư mục gốc của Linux kernel:

```
$ cd /opt/yocto/linux-wandboard
$ python2.7
/opt/yocto/fsl-community-bsp/sources/poky/scripts/tiny/ksize.py -d >
ksize.log
```

> Lưu ý rằng script sẽ không chạy đúng với Python 3, nên trình thông dịch Python 2.7 được dùng.

Báo cáo đi sâu tới từng driver riêng lẻ, giúp dễ xác định phần tiết kiệm được khi bỏ chúng. Một đoạn trích đã chỉnh sửa từ báo cáo như sau:

```
Linux Kernel                          total |       text       data
bss
-----------------------------------------------------------------------
vmlinux                             2158912 |    2021168      94736
43008
-----------------------------------------------------------------------
drivers/built-in.o                   656044 |     612008      31288
12748
fs/built-in.o                        423274 |     414798       2072
6404
kernel/built-in.o                    377027 |     353399      12572
11056
mm/built-in.o                        197932 |     188391       6037
3504
block/built-in.o                     120913 |     117081       2448
1384
lib/built-in.o                        91707 |      91534        112
61
init/built-in.o                       21834 |       7610      14160
64
firmware/built-in.o                    4570 |       4570          0
0
security/built-in.o                    3710 |       3694          8
8
-----------------------------------------------------------------------
sum                                 1897011 |    1793085      68697
35229
delta                                261901 |     228083      26039
7779
```

Trong báo cáo này, `vmlinux` là ELF image của Linux kernel, có thể tìm thấy trong Linux build directory.

Một số thứ chúng ta thường loại bỏ là:

1. Bỏ IPv6 (`CONFIG_IPV6`) và các tính năng mạng thừa khác

2. Bỏ block device (`CONFIG_BLOCK`) nếu không cần

3. Bỏ các tính năng mật mã (`CONFIG_CRYPTO`) nếu không dùng

4. Rà soát các loại filesystem được hỗ trợ và bỏ những loại không cần, như flash filesystem trên các thiết bị không có flash

5. Tránh dùng module và bỏ hỗ trợ module (`CONFIG_MODULES`) khỏi kernel nếu có thể

Một chiến lược tốt là bắt đầu với một kernel tối thiểu và thêm những thứ thiết yếu cho tới khi có một hệ thống chạy được. Bắt đầu với GNU make target `allnoconfig` và rà soát các mục cấu hình dưới `CONFIG_EXPERT` và `CONFIG_EMBEDDED` vì chúng không có trong thiết lập `allnoconfig`.

Một số thay đổi cấu hình có thể không hiển nhiên nhưng giảm đáng kể kích thước image mà không cần bỏ tính năng được liệt kê ở đây:

- Đổi phương pháp nén mặc định từ Lempel-Ziv-Oberhumer (LZO) sang XZ (`CONFIG_KERNEL_XZ`). Tuy vậy tốc độ giải nén sẽ thấp hơn một chút.

- Đổi allocator từ Unqueued Slab Allocator (SLUB) sang Simple List Of Blocks (SLOB) (`CONFIG_SLOB`) cho các embedded system nhỏ có ít memory.

- Không dùng high memory (`CONFIG_HIGHMEM`) trừ khi bạn có từ 4 GB memory trở lên.

Bạn cũng có thể muốn có cấu hình khác nhau cho hệ thống production và hệ thống phát triển, để có thể bỏ những thứ sau khỏi các image production:

- Hỗ trợ `printk` (`CONFIG_PRINTK`)

- Hỗ trợ tracing (`CONFIG_FTRACE`)

Về phía biên dịch, hãy tối ưu cho kích thước bằng `CONFIG_CC_OPTIMIZE_FOR_SIZE`.

Khi đã xong những điều cơ bản, chúng ta cần phân tích các kernel function để xác định thêm chỗ có thể giảm. Bạn có thể in danh sách đã sắp xếp các kernel symbol với lệnh sau:

```
$ nm --size-sort --print-size -r vmlinux | head
8023a87c 0000485c t imx6q_clocks_init
801f3ce8 000038a8 T hidinput_connect
800cc968 00002fb8 T __blockdev_direct_IO
80111fb8 0000263c t ext4_fill_super
8025c000 00002000 D init_thread_union
8021b440 00002000 r crc32table_le
80219440 00002000 r crc32table_be
80217440 00002000 r crc32ctable_le
801a5824 00001c84 t do_con_write.part.9
80273d6c 00001740 b ipu_data
```

Sau đó bạn cần xem kernel source để tìm cách tối ưu.

Không gian thực tế mà kernel chưa nén dùng trong memory có thể lấy được từ kernel log của một Wandboard đang chạy như sau:

```
$ dmesg | grep -A 3 "text"
      .text : 0x80008000 - 0x80a20538   (10338 kB)
      .init : 0x80a21000 - 0x80aae240   ( 565 kB)
      .data : 0x80ab0000 - 0x80b13644   ( 398 kB)
      .bss  : 0x80b13644 - 0x80b973fc   ( 528 kB)
```

Từ đây, section `.text` chứa code và dữ liệu hằng, section `.data` chứa dữ liệu khởi tạo cho các biến, và section `.bss` chứa mọi dữ liệu chưa khởi tạo. Section `.init` chứa các biến toàn cục chỉ dùng trong quá trình khởi tạo Linux, và được giải phóng sau đó như có thể thấy từ boot message sau của Linux kernel:

```
Freeing unused kernel memory: 564K (80a21000 - 80aae000)
```

Đang có những nỗ lực liên tục để giảm kích thước Linux kernel, nên các phiên bản kernel mới hơn được kỳ vọng sẽ nhỏ hơn và cho phép tùy biến tốt hơn để dùng trong embedded system.

## Giảm kích thước root filesystem

Các image có kích thước giảm được dùng song song với image production cho các việc như hệ thống cứu hộ và quy trình test sản xuất. Chúng cũng lý tưởng để được build thành image `initramfs`, tức là image mà Linux kernel mount từ memory, và thậm chí có thể được gộp vào một Linux kernel image binary duy nhất.

Theo mặc định, kích thước tarball root filesystem chưa giải nén của `core-image-minimal` cho Wandboard khoảng 13 MB, và `core-image-sato` khoảng 244 MB. Recipe này sẽ khám phá các phương pháp để giảm kích thước root filesystem.

### Cách thực hiện...

Một ví dụ về image nhỏ không bao gồm core image class và có thể được dùng làm nền cho một root filesystem image bottom-up có kích thước giảm, `recipes-core/images/image-small.bb`, được trình bày tiếp theo:

```
DESCRIPTION = "Minimal console-only image."

IMAGE_INSTALL= "\
        base-files \
        base-passwd \
        busybox \
        sysvinit \
        initscripts \
"

IMAGE_LINGUAS = " "

LICENSE = "MIT"

inherit image

IMAGE_ROOTFS_SIZE = "8192"
```

Recipe này tạo ra một root filesystem 4.8 MB. Bạn có thể làm nhỏ hơn nữa nếu dùng distribution `poky-tiny` bằng cách thêm dòng sau vào file `conf/local.conf`:

```
DISTRO = "poky-tiny"
```

Distribution `poky-tiny` thực hiện một loạt tối ưu kích thước có thể hạn chế tập package bạn có thể đưa vào image. Các tối ưu này gồm:

- Dùng thư viện `C` musl thay cho `glibc`

- Bỏ hỗ trợ ngôn ngữ bản địa

- Tinh gọn các distribution feature

- Dùng hệ thống `init` của BusyBox và device manager `mdev`

- Chỉ build một image `cpio` phù hợp cho một `initramfsimage-small`

- Làm rỗng `MACHINE_ESSENTIAL_EXTRA_RDEPENDS` để không package machine-specific nào được cài

- Bỏ các dependency Perl và Python

- Đưa vào blacklist một tập core image không build được với các hạn chế trên

Cần thêm dòng sau vào `conf/local.conf` để có thể build `image-small` với `poky-tiny`:

```
IMAGE_INSTALL_remove = "sysvinit"
```

Cần bỏ `sysvinit` vì `poky-tiny` dùng hệ thống `init` của BusyBox và bỏ `sysvinit DISTRO_FEATURE` bằng cách đưa nó vào blacklist trong `DISTRO_FEATURES_BACKFILL_CONSIDERED`, điều này ngăn nó được tự động thêm vào.

File cấu hình distribution `poky-tiny` cũng override provider `virtual/kernel` thành `linux-yocto-tiny`, mà như ta biết Wandboard không hỗ trợ, nên để build cho Wandboard chúng ta cũng cần tạo distribution `poky-tiny-custom` của riêng mình, được thêm vào layer `meta-custom` với file `conf/distro/poky-tiny-custom.conf` sau:

```
require conf/distro/poky-tiny.conf
PREFERRED_PROVIDER_virtual/kernel = "linux-wandboard"
```

Chúng ta đã thấy cách giảm kích thước Linux kernel trong recipe Reducing the Linux kernel image size.

Với `poky-tiny-custom`, kích thước root filesystem giảm thêm xuống khoảng 2.5 MB.

Khi kích thước root filesystem đã được tối ưu, kích thước cuối cùng của image phụ thuộc vào ba yếu tố:

- `rootfs-size`: Kích thước thực tế của root filesystem như được tính bằng command `du`, nhân với một hệ số overhead được định nghĩa bởi biến `IMAGE_OVERHEAD_FACTOR` (mặc định là 1.3).

- `minimum-rootfs-size`: Kích thước image tối thiểu được yêu cầu, tính bằng KB, được chỉ định bởi `IMAGE_ROOTFS_SIZE`. Nếu giá trị nhỏ hơn image tối thiểu được yêu cầu, giá trị sau sẽ được dùng.

- `extra-space`: Một khoảng trống thêm tính bằng KB được yêu cầu bằng biến `IMAGE_ROOTFS_EXTRA_SPACE`, được cộng vào giá trị trước. Theo mặc định, không có khoảng trống thêm nào được cộng.

Kích thước image cuối cùng dùng để sinh image `ext2/3/4` và `btrfs` được tính bằng cách cộng `extra-space` với `minimum-rootfs-size` hoặc `rootfs-size`, tùy giá trị nào lớn hơn, như biểu thức sau:

```
size = max(rootfs-size, minimum-rootfs-size) + extra-space
```

Kích thước image cuối cùng của recipe `image-small` này là 8 MB như được chỉ định bởi biến `IMAGE_ROOTFS_SIZE`.

Root filesystem cần không gian trống trên image để phục vụ các script post-installation và hệ thống quản lý package nếu có, và có lẽ cả để chứa dữ liệu ứng dụng. Có thể cung cấp không gian này bằng hệ số overhead hoặc bằng cách cố định khoảng trống thêm cần dùng.

### Cách hoạt động...

Bắt đầu với một image phù hợp, như `core-image-minimal`, phân tích các dependency như đã trình bày trong recipe Debugging the build system ở `Chapter 1`, The Build System, và quyết định dependency nào không cần. Bạn cũng có thể dùng kích thước file được liệt kê trong build history của image, như đã thấy trong recipe Using build history, cũng ở `Chapter 1`, The Build System, để phát hiện các file lớn nhất trong filesystem và rà soát chúng. Để sắp xếp kích thước file, xuất hiện ở cột thứ tư của file `files-in-image.txt`, theo thứ tự ngược, chúng ta có thể chạy:

```
$ sort -r -g  -k 4,4 files-in-image.txt -o sorted-files-in-image.txt
sorted-files-in-image.txt:
-rw-r--r-- root       root          7267688
./boot/zImage-4.1.44+g0d698de42426
-rwxr-xr-x root       root          2667248 ./usr/bin/trace
-rwxr-xr-x root       root          2667248 ./usr/bin/perf
-r-xr-xr-x root       root          1627632 ./usr/lib/libperl.so.5.24.1
-rwxr-xr-x root       root          1261024 ./usr/lib/libstdc++.so.6.0.24
-rwxr-xr-x root       root          1222352 ./lib/libc-2.26.so
-rwxr-xr-x root       root           867168 ./bin/bash.bash
-rw-r--r-- root       root           830424 ./usr/lib/libslang.so.2.3.1
-rwxr-xr-x root       root           797648
./usr/lib/libbfd-2.29.0.20170912.so
-rwxr-xr-x root       root           535396 ./bin/busybox.nosuid
-rwxr-xr-x root       root           525488 ./sbin/ldconfig
-rwxr-xr-x root       root           460144 ./lib/libm-2.26.so
-rw-r--r-- root       root           338696 ./boot/u-boot-wandboard-
v2017.09+gitAUTOINC+a6a15fedd1-r0.img
-rwxr-xr-x root       root           265796 ./usr/bin/trace-cmd
-rwxr-xr-x root       root           263592 ./usr/lib/libpcre.so.1.2.9
-rwxr-xr-x root       root           256356 ./usr/bin/udevadm
-rwxr-xr-x root       root           248212 ./sbin/udevd
```

Poky có một script `dirsize.py` báo cáo kích thước các thành phần của filesystem. Một đoạn trích từ output của nó (khi được khởi chạy từ thư mục `rootfs` trong thư mục `tmp`) là:

```
$ cd /opt/yocto/fsl-community-bsp/wandboard/tmp/work/wandboard-poky-linux-
gnueabi/core-image-minimal/1.0-r0/rootfs
$ /opt/yocto/fsl-community-bsp/sources/poky/scripts/tiny/dirsize.py
  12997690 .
   7943835 ./boot
       197 ./boot/extlinux
       197 ./boot/extlinux/extlinux.conf
   7267688 ./boot/zImage-4.1.44+g0d698de42426
    338696 ./boot/u-boot-wandboard-v2017.09+gitAUTOINC+a6a15fedd1-r0.img
     48128 ./boot/SPL-wandboard-v2017.09+gitAUTOINC+a6a15fedd1-r0
     43827 ./boot/imx6qp-wandboard-revd1.dtb
     42197 ./boot/imx6q-wandboard-revd1.dtb
     41167 ./boot/imx6q-wandboard.dtb
     41167 ./boot/imx6q-wandboard-revb1.dtb
     40956 ./boot/imx6dl-wandboard-revd1.dtb
     39906 ./boot/imx6dl-wandboard.dtb
     39906 ./boot/imx6dl-wandboard-revb1.dtb
   2958219 ./lib
```

Từ đây, chúng ta thấy thư mục `boot`, chứa `u-boot`, kernel, device tree và `extlinux.conf` dùng để boot hệ thống, là phần đóng góp lớn nhất vào kích thước filesystem.

Một số chỗ khác có thể tiết kiệm không gian trên một hệ thống console-only là:

- Dùng package manager IPK, vì nó nhẹ nhất, hoặc tốt hơn là bỏ hẳn feature `package-management` khỏi root filesystem production

- Dùng device manager `mdev` của BusyBox thay cho `udev` bằng cách chỉ định nó trong file `conf/local.conf` như sau:

  ```
  VIRTUAL-RUNTIME_dev_manager = "busybox-mdev"
  ```

  Lưu ý rằng cách này chỉ hoạt động với các core image có bao gồm `packagegroup-core-boot`

- Nếu chạy root filesystem trên một block device, hãy dùng ext2 thay cho ext3 hoặc ext4 không có journal

- Cấu hình BusyBox chỉ với các applet thiết yếu bằng cách cung cấp file cấu hình của riêng bạn trong một file `bbappend`

- Rà soát cấu hình `glibc`, có thể thay đổi qua biến cấu hình distribution `DISTRO_FEATURES_LIBC`

- Biên dịch ứng dụng với `-Os` để tối ưu kích thước

- Nếu dùng distribution Poky, cân nhắc chuyển sang một thư viện `C` nhẹ hơn `glibc` mặc định, như `musl`, một thư viện `C` mới MIT-licensed

  Để bật thư viện C `musl`, bạn sẽ thêm dòng sau vào file image: `TCLIBC = "musl"`.

## Root filesystem Memory-based

Early user space hay initial memory image, được biết tới là image `initramfs`, thường được dùng làm early user space với nhiệm vụ mount các filesystem phức tạp, chẳng hạn khi cần thiết lập một phân vùng mã hóa. Với use case đó, `initramfs` sẽ chuẩn bị root filesystem cuối cùng rồi thực hiện `switch_root`, thực chất là thay filesystem cũ bằng filesystem mới và chạy một `init` mới từ filesystem mới. `initramfs` cần chứa mọi công cụ cần để mount root filesystem cuối cùng.

Các cách dùng khác cho `initramfs` bao gồm hệ thống cứu hộ và hệ thống sản xuất.

Recipe này sẽ cho thấy cách cấu hình Yocto build system để build image `initramfs`.

### Chuẩn bị

Khi Linux kernel mount một file system từ storage vật lý, nó giữ một cache để truy cập nhanh. Một memory filesystem chỉ đơn giản là kernel cache này mà không có backing store.

Một `initramfs` là một file định dạng `cpio` nén mà kernel giải nén vào một memory filesystem và dùng làm root filesystem. Nó sẽ chạy chương trình `init` tìm thấy trong đó. `initramfs` này có thể được biên dịch vào kernel, để một binary duy nhất chứa cả kernel lẫn root filesystem, hoặc được truyền cho kernel như một file bên ngoài. Use case sau cần biên dịch vào hỗ trợ kernel `initrd` kiểu cũ.

### Cách thực hiện...

Chúng ta có thể chuyển recipe `image-small` đã giới thiệu trong recipe Reducing the root filesystem size thành một `initramfs`, như trong `recipes-core/images/image-small-initramfs.bb` ở đây:

```
DESCRIPTION = "Minimal console-only initramfs image."


PACKAGE_INSTALL= "\
        base-files \
        base-passwd \
        busybox \
        sysvinit \
        initscripts \
        ${ROOTFS_BOOTSTRAP_INSTALL} \
"

IMAGE_LINGUAS = " "

LICENSE = "MIT"

IMAGE_FEATURES = ""

export IMAGE_BASENAME = "image-small-initramfs"
IMAGE_FSTYPES = "${INITRAMFS_FSTYPES} ${INITRAMFS_FSTYPES}.u-boot"
inherit image

IMAGE_ROOTFS_SIZE = "8192"
```

Để boot `initramfs` như một file bên ngoài, chúng ta dừng target device tại prompt `u-boot` và làm như sau:

1. Cấu hình các thiết lập mạng:

   ```
   > env set ipaddr <target-ip-address>
   > env set serverip <server-ip-address>
   ```

2. Đặt nguồn file cho Linux kernel, device tree và `initramfs`:

   ```
   > env set image <kernel-image-name>
   > env set fdtfile <device tree blob name>
   > env set initrd_file <initramfs image name>
   ```

3. Nạp chúng vào memory tại các vị trí đã cấu hình sẵn:

   ```
   > tftpboot ${loadaddr} ${image}
   > tftpboot ${fdt_addr} ${fdtfile}
   > tftpboot ${ramdisk_addr} ${initrd_file}
   ```

4. Cuối cùng, boot bằng command `bootz`:

   ```
   > bootz ${loadaddr} ${ramdiskaddr} ${fdt_addr}
   ```

### Cách hoạt động...

Để Yocto build system build một file image `cpio` phù hợp để dùng làm `initramfs`, biến `IMAGE_FSTYPES` cần được cấu hình thành một trong các giá trị sau: `cpio.gz, cpio.tar`, `cpio.lz4`, `cpio.lzma` hoặc `cpio.xz`.

Trong image ở trên, `IMAGE_FSTYPES` được đặt là `cpio.gz.uboot` để build system sinh ra một file image `cpio` nén với header `u-boot`, phù hợp để nạp qua command u-boot `bootz`.

`INITRAMFS_FSTYPES` mặc định là `cpio.gz`, và cần được append để hỗ trợ bất kỳ định dạng nào khác.

Trong recipe này, chúng ta override biến `PACKAGE_INSTALL` bằng danh sách package muốn cài. Chúng ta cũng thêm `ROOTFS_BOOTSTRAP_INSTALL`, biến này thêm package run-postinstall để các script post installation được chạy đúng. Các image chuẩn dùng class `core-image` và biến `IMAGE_INSTALL` để thêm package và feature. Một `initramfs` thường muốn một danh sách package hardcode, nên chúng được thêm bằng cách đặt trực tiếp biến `PACKAGE_INSTALL`.

Chúng ta cũng làm rỗng `IMAGE_FEATURES` để không làm image lẫn thêm feature.

### Còn nữa...

Yocto build system cũng có thể được cấu hình để gộp `initramfs` vào Linux kernel bằng build system của kernel.

Để làm vậy, chúng ta cần định nghĩa tên image sẽ được dùng, thường trong một file cấu hình machine, như `conf/machine/wandboard.conf`, hoặc trong file cấu hình `conf/local.conf` như sau:

```
INITRAMFS_IMAGE = "<image name>"
```

Và sau đó chúng ta có thể bảo Yocto gộp image với kernel bằng cách thêm dòng sau vào file cấu hình `conf/local.conf`:

```
INITRAMFS_IMAGE_BUNDLE = "1"
```

Khi đó kernel class sẽ sao chép file `cpio` từ thư mục deploy vào build directory của Linux kernel, và build system của kernel sẽ dùng nó để tạo bundle gồm Linux image và root filesystem.

Để boot image đã gộp, chúng ta làm như sau:

1. Cấu hình các thiết lập mạng:

   ```
   > env set ipaddr <target-ip-address>
   > env set serverip <server-ip-address>
   ```

2. Đặt bundle Linux kernel và root filesystem cùng device tree:

   ```
   > env set image <kernel-image-name>
   > env set fdtfile <device tree blob name>
   ```

3. Nạp chúng vào memory tại các vị trí đã cấu hình sẵn:

   ```
   > tftpboot ${loadaddr} ${image}
   > tftpboot ${fdt_addr} ${fdtfile}
   ```

4. Cuối cùng, boot bằng command bootz:

   ```
   > bootz ${loadaddr} - ${fdt_addr}
   ```

Linux kernel sẽ phát hiện root filesystem được gộp kèm và mount nó lúc boot.

## Bảo mật root filesystem

Trong thời đại của các thiết bị internet-connected và Internet of Things, bảo mật trong thiết bị embedded là một cân nhắc quan trọng khi thiết kế một embedded system.

Trong recipe này, chúng ta sẽ bàn về hai trong số các framework được dùng thường xuyên nhất để tăng cường bảo mật cho root filesystem và cho thấy cách tích hợp chúng vào sản phẩm Yocto Project-based của bạn.

### Chuẩn bị

Linux hiện thực bảo mật file-level. Mỗi file có một tập thuộc tính truy cập cho user, group và others, và có thể được gán quyền đọc, ghi hoặc thực thi, cũng như một số mode đặc biệt.

Do đó việc truy cập filesystem dựa trên các user và group của hệ thống. Khi bạn liệt kê file bằng command `ls -l`, bạn thấy các thuộc tính file theo định dạng sau:

```
-rwxr-xr-x
```

Chữ cái đầu tiên là loại file, tiếp theo là các bộ ba quyền của user, group và other. File có thể được đọc, ghi và thực thi bởi user sở hữu nó, nhưng chỉ được đọc và thực thi bởi một user cùng group hoặc bởi một user khác không cùng group. Với thư mục, quyền thực thi nghĩa là có thể đi vào thư mục đó.

Có ba mode khác có thể dùng cho một số loại file nhất định:

- Bit setuid, cho phép chúng ta đổi effective user ID của một process thành user ID của chính file thay vì của user đã chạy nó. Nếu bit setuid được đặt, bit `x` sẽ đổi thành `s`. Nếu file không có quyền thực thi cho user, nó sẽ dùng chữ hoa `S` thay vào đó.

- Bit setgid, tương tự setuid ngoại trừ việc nó ảnh hưởng tới effective group ID. setuid không có tác dụng với thư mục, còn setgid làm cho các file được tạo bên trong thư mục kế thừa group của thư mục.

- Sticky bit, ảnh hưởng tới thư mục sao cho chỉ root hoặc chủ sở hữu file mới được phép thay đổi các file bên trong thư mục. Sticky bit được biểu diễn bằng `t`, hoặc chữ hoa `T` nếu quyền `x` được đặt.

Các access mode của file thường được biểu diễn ở dạng octal, ví dụ 0755. Mỗi chữ số là một nhóm bit file mode, trong đó số đầu tiên biểu diễn các bit file mode đặc biệt, với:

- 1: sticky bit

- 2: setgid

- 4: setuid

Kiểu truy cập file này được phân loại là Discretionary Access Control (DAC) vì nó cho phép user thay đổi thuộc tính kiểm soát truy cập của các object mà họ sở hữu. Process có real user ID (bạn là ai) và effective user ID (bạn đang hành động với tư cách ai), quyết định xem chúng có được truy cập một file dựa trên quyền của file hay không.

Mặt khác, Mandatory Access Control (MAC) hiện thực một cơ chế để giới hạn khả năng của user (subject) thực hiện thao tác trên object, trong đó cả subject lẫn object đều có một tập thuộc tính bảo mật và các quy tắc của hệ điều hành kiểm soát policy truy cập. User không thể sửa quyền truy cập. Trong mô hình này, subject thường là process hoặc thread, còn object là tài nguyên của hệ điều hành như file và thư mục, nhưng cũng có memory, socket, IPC và các thành phần khác.

Trong Linux, MAC được hiện thực bằng framework Linux Security Module (LSM), bên trên các policy DAC chuẩn. Khi DAC cho phép truy cập, LSM module được gọi để cuối cùng cho phép hoặc từ chối truy cập. Số lượng object mà LSM kiểm soát ngày càng tăng và bao gồm:

- Các thao tác filesystem

- Các thao tác mạng

- Các thao tác IPC

- Các thao tác task

LSM được nhiều framework bảo mật Linux sử dụng, trong đó có hai framework đáng chú ý nhất: Security Enhanced Linux (SELinux) và Simplified Mandatory Access Control Kernel (SMACK). Cả hai đều cần được cấu hình trong cấu hình kernel.

### Cách thực hiện...

SELinux phức tạp hơn và cần một policy được thiết kế cẩn thận để không làm tổn hại bảo mật. Quyền rất chi tiết trên hàng trăm loại kernel object khác nhau. Policy mặc định của nó (standard) rất hạn chế và phải được biên dịch và triển khai. Nó có các công cụ tốt để audit và tạo rule.

SMACK đi kèm một policy mặc định dễ dãi cùng kernel, policy này phải được mở rộng để đáp ứng các nhu cầu cụ thể. Thêm policy mới rất dễ nhưng các công cụ có sẵn không phong phú bằng của SELinux. Quyền cũng không chi tiết bằng SELinux. SMACK phù hợp với embedded system hơn SELinux, trừ khi cần độ chi tiết cao hơn.

Chúng ta sẽ cho thấy cách cấu hình cả SELinux lẫn SMACK.

#### Thiết lập SELinux

Trước tiên chúng ta sẽ cần thêm hỗ trợ trong Linux kernel cho framework bảo mật đã chọn. Để bật hỗ trợ SELinux, chúng ta cần cấu hình Linux kernel như đã giải thích ở mục Configuring the Linux kernel trong `Chapter 2`, The BSP Layer. Chúng ta có thể thêm các thay đổi sau vào defconfig của Wandboard trong một `bbappend` cho Linux kernel recipe:

```
CONFIG_AUDIT=y
CONFIG_SECURITY=y
CONFIG_SECURITY_NETWORK=y
CONFIG_SECURITY_SELINUX=y
```

Xem source code phát hành kèm cuốn sách để biết thêm chi tiết.

Layer `meta-selinux` bật hỗ trợ SELinux trên một Yocto image. Để dùng nó, trước tiên chúng ta cần clone nó vào thư mục `sources`:

```
$ cd /opt/yocto/fsl-community-bsp/sources
$ git clone git://git.yoctoproject.org/meta-selinux
```

> Tại thời điểm viết sách, layer `meta-selinux` chưa được cập nhật để hỗ trợ bản phát hành Yocto Project 2.4 (Rocko). Để image build được, chúng ta phải clone một phiên bản `meta-selinux` đã được patch thay cho phiên bản ở trên, như sau:
>
> ```
> $ git clone
> https://github.com/yoctocookbook2ndedition/meta-selinux.g
> it -b rocko
> ```

Sau đó chúng ta cũng cần thêm nó vào `conf/bblayers.conf`, như đã mô tả ở mục Creating a custom BSP layer trong `Chapter 2`, The BSP Layer. Layer này cũng phụ thuộc vào `meta-python`, là một phần của `meta-oe`, nên chúng ta cũng cần thêm nó vào `conf/bblayers.conf`:

```
+  ${BSPDIR}/sources/meta-selinux \
+  ${BSPDIR}/sources/meta-openembedded/meta-python \
```

Sau đó chúng ta cần thay đổi tường minh file cấu hình distribution để hỗ trợ một số feature bổ sung:

```
DISTRO_FEATURES_append = " pam selinux"
```

Cuối cùng, cần chọn một reference policy làm nền cho các tùy biến sau này. Layer `meta-selinux` hỗ trợ các policy sau:

- `minimum`, dễ dãi nhất với mức bảo vệ tối thiểu. Hỗ trợ một tập tối thiểu các daemon bị giới hạn (confined).

- `standard`, hỗ trợ cả các daemon bị giới hạn lẫn các khu vực khác như user.

- `mls`, có hỗ trợ bảo vệ multilevel security.

- `targeted`, hỗ trợ số lượng daemon lớn hơn, cũng như các khu vực khác như user.

- `mcs`, một chuẩn cho các hệ thống bảo vệ multicategory security.

Ví dụ, để chọn policy minimum, chúng ta thêm dòng sau vào file cấu hình `conf/local.conf`:

```
PREFERRED_PROVIDER_virtual/refpolicy ?= "refpolicy-minimum"
```

Layer `meta-selinux` bao gồm hai image có bật SELinux, `core-image-selinux-minimal` và `core-image-selinux`. Để thêm chức năng SELinux vào một image có sẵn, bạn có thể thêm dòng sau vào `conf/local.conf`:

```
IMAGE_INSTALL_append = " packagegroup-core-selinux"
```

Để build `core-image-selinux`, chuyển tới thư mục `fsl-community-bsp` và gõ:

```
$ source setup-environment wandboard
$ bitbake core-image-selinux
```

> Bạn có thể gặp lỗi sau khi build image này với distribution Poky:
>
> ```
> ERROR: cairo-1.14.10-r0 do_prepare_recipe_sysroot: The
> file /usr/lib/pkgconfig/wayland-egl.pc is installed by
> both mesa and imx-gpu-viv, aborting
> ```
>
> Để khắc phục, hãy bỏ distribution feature `wayland` trong `conf/local.conf` như sau:
>
> ```
> DISTRO_FEATURES_remove = "wayland"
> ```

> Hãy nhớ rằng nếu bạn thay đổi biến `DISTRO_FEATURES` như giải thích ở trên, bạn cần xóa thư mục `tmp` và build với `sstate-cache`, nếu không bản build sẽ thất bại.
>
> Chúng ta sẽ học cách chọn giữa các graphical backend khác nhau có trong FSL community BSP ở `Chapter 4`, Application Development.

Image `core-image-selinux` sẽ gán lại nhãn (relabel) filesystem theo policy mới khi boot vì nó có recipe `selinux-autorelabel`; chúng ta sẽ thấy các message sau khi boot:

```
Checking SELinux security contexts:
 * First booting, filesystem will be relabeled...
 * Relabel done, rebooting the system.
```

Với `core-image-selinux-minimal`, việc gán lại nhãn cần được kích hoạt thủ công sau khi boot vào một hệ thống SELinux-enabled bằng:

```
# fixfiles -f -F relabel
```

Sau khi boot, chúng ta có thể xác minh SELinux đã được bật và đang enforcing bằng cách:

```
$ sestatus
SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux root directory:         /etc/selinux
Loaded policy name:             minimum
Current mode:                   permissive
Mode from config file:          permissive
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Memory protection checking:     requested (insecure)
Max kernel policy version:      29
```

> Policy minimum của `meta-selinux` hiện chỉ boot được ở chế độ permissive và sẽ cần được tinh chỉnh để chuyển sang chế độ enforcing.

#### Thiết lập SMACK

Để bật hỗ trợ SMACK, chúng ta cần cấu hình Linux kernel như đã giải thích ở mục Configuring the Linux kernel trong `Chapter 2`, The BSP Layer. Chúng ta có thể thêm các thay đổi sau vào `defconfig` của Wandboard trong một `bbappend` cho Linux kernel recipe:

```
+CONFIG_SECURITY=y
+CONFIG_SECURITY_SMACK=y
+CONFIG_AUDIT=y
```

Xem source code phát hành kèm cuốn sách để biết thêm chi tiết.

Layer `meta-security-smack`, một phần của `meta-intel-iot-security`, bật hỗ trợ SMACK trên một Yocto image. Để dùng nó, trước tiên chúng ta cần clone nó vào thư mục `sources`:

```
$ cd /opt/yocto/fsl-community-bsp/sources
$ git clone git://github.com/01org/meta-intel-iot-security
```

Sau đó chúng ta cũng cần thêm nó vào `conf/bblayers.conf`, như đã mô tả ở mục Creating a custom BSP layer trong `Chapter 2`, The BSP Layer, bằng cách thêm dòng sau:

```
+  ${BSPDIR}/sources/meta-intel-iot-security/meta-security-smack \
```

Sau đó chúng ta cần cấu hình file `conf/local.conf` để dùng nó như sau:

```
OVERRIDES .= ":smack"
DISTRO_FEATURES_append = " smack"
```

Chúng ta cũng sẽ cài thêm một số ứng dụng user space để làm việc với SMACK:

```
CORE_IMAGE_EXTRA_INSTALL += "coreutils smack-userspace"
```

Cuối cùng, chúng ta có thể build core image mà mình chọn.

### Cách hoạt động...

Hãy xem chi tiết hơn cách cả hai framework bảo mật hoạt động.

#### Tìm hiểu SELinux

Khi SELinux đã được cấu hình, nó có thể ở một trong ba chế độ:

- Disabled: SELinux không kiểm soát truy cập

- Permissive: SELinux cho phép mọi truy cập nhưng ghi log các vi phạm truy cập

- Enforcing: SELinux đang tích cực kiểm soát truy cập

Chế độ có thể được đặt trong kernel command-line, trong file cấu hình SELinux, hoặc bằng các công cụ command-line `getenforce`/`setenforce`.

Linux kernel command-line chấp nhận các tham số SELinux-related sau:

- `selinux=0` hoặc `selinux=1`: Lần lượt tắt hoặc bật SELinux

- `enforcing=0` hoặc `enforcing=1`: Boot vào chế độ permissive (mặc định của kernel) hoặc vào chế độ enforcing

Root filesystem chứa một file cấu hình tại `/etc/selinux/config` với biến `SELINUX` điều khiển chế độ bảo mật:

- `SELINUX=disabled`

- `SELINUX=permissive`

- `SELINUX=enforcing`

Khi ở chế độ enforcing, SELinux mặc định không cho phép truy cập nào, và các rule phải được tạo và nạp để cho phép các hành động cụ thể. Một tập rule được gọi là một SELinux policy. Các SELinux policy thường gồm hàng nghìn rule, và việc viết chúng là một thách thức.

Mỗi object chứa một security context được lưu trong các trường extended attribute của inode, gồm:

- Một user gắn với một subject hoặc object (`root`, `user_u` hoặc `system_u`).

- Một role định nghĩa một tập quyền được cấp cho user (`object_r` hoặc `system_r`).

- Một domain (cho process) hoặc type (cho object) là tổ hợp các subject và object có thể tương tác với nhau. Chúng dùng hậu tố `_t`.

Trên một hệ thống SELinux-enabled, `ls -Z` liệt kê các context dưới dạng `<user>:<role>:<type>`, ví dụ:

```
-rw-r--r-- root root root:object_r:user_home_t file.txt
```

Các rule allow có bốn thành phần:

- source-type

- target-type

- object-class

- permissions

Ví dụ, một process có domain type `user_t` có thể đọc, thực thi và stat (`getattr`) một file object có type `bin_t` với rule sau:

```
allow user_t bin_t : file {read execute getattr};
```

Các file policy này cần được biên dịch từ source thành định dạng binary module (dùng công cụ `checkmodule`) và được nạp vào kernel lúc boot, sớm trong quá trình boot, từ `/etc/selinux`. Lần boot SELinux đầu tiên là một deployment boot, gán lại nhãn toàn bộ root filesystem theo policy rồi tự reboot. Policy có thể được quản lý bằng công cụ command-line `semodule`.

#### Tìm hiểu SMACK

SMACK dùng thuật ngữ label để mô tả cái mà SELinux gọi là security context. Đây là các chuỗi không có cấu trúc, case-sensitive, dài tối đa 23 ký tự. Mọi subject và object đều được gán một label. Label được lưu dưới dạng extended attribute trên các object filesystem, và dưới dạng tag Commercial Internet Protocol Security Option (CIPSO) trong header của gói IP. Việc ánh xạ label sang giá trị CIPSO được thực hiện bởi tiện ích `smackcipso`, tiện ích này định dạng dữ liệu và ghi nó vào `/sys/fs/smack/cipso`.

Tiện ích `chsmack` cho phép chúng ta hiển thị hoặc đặt giá trị extended attribute. Ví dụ, bạn có thể hiển thị smack label của một file với:

```
# chsmack /bin/cat
cat access="_"
```

Process có thể đọc SMACK label của chúng từ `/proc/<pid>/attr/current`.

Một số label định sẵn là:

- `_`: Một ký tự gạch dưới

- `^`: Một ký tự mũ (circumflex)

- `?`: Một ký tự dấu hỏi

- `@`: Một ký tự a còng

Mọi task đều được gán một label, với `_` được dùng cho các task hệ thống.

Cấu hình SMACK được thực hiện qua filesystem `smackfs`. Layer `meta-security-smack` không mount nó theo mặc định, nhưng chúng ta có thể thêm `recipes-core/base-files/base-files_%.bbappend` sau vào custom layer để làm điều đó:

```
do_install_append () {
   cat >> ${D}${sysconfdir}/fstab <<EOF
  # Mount smackfs
  smackfs /sys/fs/smackfs smackfs defaults 0 0
  EOF
}
```

Khác với SELinux, hỗ trợ SMACK của Linux kernel đã có sẵn một policy mặc định.

SMACK dùng hỗ trợ audit của kernel (`CONFIG_AUDIT`) để ghi log các vi phạm truy cập, theo mặc định ghi log mọi truy cập bị từ chối. Điều này có thể thay đổi trong `/sys/fs/smackfs/logging`, trong đó:

- `0` là không ghi log

- `1` ghi log các sự kiện bị từ chối (mặc định)

- `2` ghi log các sự kiện được chấp nhận

- `3` ghi log cả sự kiện bị từ chối lẫn được chấp nhận

Các rule của SMACK như sau:

1. Subject có label `*` bị từ chối mọi truy cập tới object

2. Subject có label `^` được phép truy cập `rx` tới object

3. Object có label `_` được phép truy cập `rx`

4. Object có label `*` được phép mọi truy cập

5. Mọi truy cập của subject tới object có cùng label đều được phép

6. Mọi truy cập được cho phép tường minh trong rule set đã nạp đều được phép

7. Các truy cập khác bị từ chối

Rule được lưu dưới `/etc/smack/accesses` và trông như sau:

```
<subject-label> <object-label> <accesses>
```

Rule được nạp bằng tiện ích `smackload`, tiện ích này định dạng dữ liệu và ghi nó vào `/sys/fs/smack/load`.

Quyền truy cập có thể là:

- Đọc (`r`)

- Ghi (`w`)

- Thực thi (`x`)

- Append (`a`)

- Transmute (`t`) (cho phép các ứng dụng có label khác nhau chia sẻ dữ liệu trong một thư mục, cho phép file kế thừa label từ thư mục thay vì từ process)

- Không có quyền truy cập (`-`)

Rule có thể được thêm bằng tiện ích `chsmack` hoặc vào `/etc/smack/accesses.d/`.

### Xem thêm

- Thêm thông tin về SELinux có tại trang web của dự án: `http://selinuxproject.org/`.

- Tài liệu kernel về SMACK có trong tài liệu của kernel source. Với các phiên bản kernel mới, có thể truy cập trực tuyến tại `https://www.kernel.org/doc/html/latest/admin-guide/LSM/Smack.html`.

- Các package security-related chung có thể hữu ích khi hardening một hệ thống Linux có trong layer meta-security. Nội dung của nó được mô tả trong `http://git.yoctoproject.org/cgit/cgit.cgi/meta-security/tree/README`.

## Phát hành software

Khi phát hành một sản phẩm dựa trên Yocto project, chúng ta phải cân nhắc rằng mình đang build trên nền rất nhiều dự án open source khác nhau, mỗi dự án có yêu cầu license khác nhau.

Tối thiểu, sản phẩm embedded của bạn sẽ chứa một bootloader (có lẽ là u-boot), Linux kernel và một root filesystem với một hoặc nhiều ứng dụng. Cả u-boot lẫn Linux kernel đều được cấp phép theo General Public License version 2 (GPLv2), và root filesystem có thể chứa nhiều chương trình với các license khác nhau.

Mọi license open source đều cho phép bạn bán một sản phẩm thương mại có trộn lẫn license độc quyền và license mở, miễn là chúng độc lập và sản phẩm tuân thủ mọi license open source. Chúng ta sẽ bàn về việc open source và code độc quyền cùng tồn tại trong recipe Working with open source and proprietary code ở phần sau.

Khi phát triển ứng dụng open source, điều quan trọng là cân nhắc kỹ license mà software sẽ được phát hành theo. Việc lấy các đoạn code từ những dự án open source khác, hoặc dùng một thư viện open source có sẵn, là rất phổ biến. Khi làm vậy, bạn có thể cần kế thừa license từ dự án kia, như được tóm tắt trong bảng tại:

```
https://www.gnu.org/licenses/gpl-faq.html#AllCompatibility
```

Theo nguyên tắc chung, software theo license GPLv3 sẽ chỉ có thể được cộng đồng free software tái sử dụng. Một license LGPLv3 sẽ cho phép bạn đưa vào code từ các license dễ dãi như MIT hoặc Apache 2.0, nhưng LGPLv2.1 sẽ cho phép code được hầu hết free software sử dụng. Để code có thể được tái sử dụng kể cả bởi các dự án thương mại, hãy chọn một license dễ dãi như MIT.

Điều quan trọng là hiểu mọi hệ quả về license trước khi phát hành sản phẩm ra công chúng. Yocto Project cung cấp các công cụ giúp việc xử lý các yêu cầu license dễ dàng hơn.

### Chuẩn bị

Trước tiên chúng ta cần chỉ rõ những yêu cầu cần tuân thủ để phân phối một sản phẩm được build bằng Yocto Project. Với các license open source hạn chế nhất, điều này thường có nghĩa là:

- Phân phối source code, kể cả các sửa đổi

- Phân phối văn bản license

- Phân phối các công cụ dùng để build và chạy software

### Cách thực hiện...

Chúng ta có thể dùng các class `archiver` và `license` để cung cấp các sản phẩm cần được phân phối để tuân thủ license. Chúng ta có thể cấu hình bản build để:

- Cung cấp source gốc chưa patch dưới dạng tarball

- Cung cấp các patch để áp dụng lên source gốc

- Cung cấp các recipe dùng để build source

- Cung cấp văn bản license đôi khi phải đi kèm binary (theo một số license)

Để dùng class `archiver` cung cấp source, patch và recipe như đã nêu, chúng ta thêm dòng sau vào file `conf/local.conf`:

```
INHERIT += "archiver"
ARCHIVER_MODE[src] = "original"
ARCHIVER_MODE[diff] = "1"
ARCHIVER_MODE[recipe] = "1"
```

Để cấu hình class `license` cung cấp thông tin license, chúng ta làm như sau:

```
COPY_LIC_MANIFEST = "1"
COPY_LIC_DIRS = "1"
```

Source sẽ được cung cấp trong thư mục `tmp/deploy/sources` theo một cấu trúc thư mục con theo package.

Với Wandboard, chúng ta thấy các thư mục sau dưới `tmp/deploy/sources`:

- `allarch-poky-linux`

- `arm-poky-linux-gnueabi`

- `x86_64-linux`

Và tìm xem những gì được phân phối cho source Linux kernel, một package GPLv2, chúng ta thấy nó dưới `tmp/deploy/sources/arm-poky-linux-gnueabi/linux-wandboard-4.1-2.0.x-r0`:

- `defconfig`

- `linux-wandboard-4.1-2.0.x-r0.tar.gz`

- Các patch được các layer khác nhau áp dụng lên source, cả dưới dạng từng patch riêng lẫn một unified diff duy nhất

- `linux-wandboard-4.1-2.0.x-r0-recipe.tar.gz`

Vậy là chúng ta có cấu hình kernel, source tarball, các patch được áp dụng theo thứ tự, và các recipe dùng để build nó, gồm:

- `linux-wandboard_4.1-2.0.x.bb`

- `linux-wandboard_4.1-2.0.x.bbappend`

- `linux-wandboard.inc`

Và văn bản license của các package sẽ được đưa vào dưới `tmp/deploy/licenses`, theo một cấu trúc thư mục con theo package. Ví dụ với `linux-wandboard`, chúng ta thấy:

- File `COPYING` có trong source Linux kernel

- `generic_GPLv2`, một bản sao của license GPLv2

- `recipeinfo`, một file văn bản chứa thông tin phiên bản của recipe

Thông tin license cũng sẽ được đưa vào root filesystem dưới `/usr/share/common-licenses`, theo một cấu trúc thư mục theo package. Một điều cần cân nhắc về văn bản license là nó được thêm khi image được build. Nếu cần thêm một package mới cùng license của nó mà không rebuild image, ví dụ bằng cách cài một package RPM mới, chúng ta sẽ cần làm như sau:

```
LICENSE_CREATE_PACKAGE = "1"
```

Điều này tạo một package `${PN}-lic` mới cho mọi recipe, cài văn bản license dưới `/usr/share/licenses`. Nhờ đó chúng ta có thể cài cả package lẫn license của nó ở chế độ standalone.

Cấu hình này sẽ cung cấp sản phẩm cho mọi package được build, nhưng điều chúng ta thực sự muốn là chỉ cung cấp chúng cho những package mà license của chúng yêu cầu.

Chắc chắn chúng ta không muốn phân phối một cách mù quáng toàn bộ nội dung thư mục sources as-is, vì nó cũng sẽ chứa source độc quyền của chúng ta, thứ mà rất có thể ta không muốn phân phối.

Chúng ta có thể cấu hình class `archiver` chỉ cung cấp source cho các package `GPL` và `LGPL` với lệnh sau:

```
COPYLEFT_LICENSE_INCLUDE = "GPL* LGPL*"
COPYLEFT_LICENSE_EXCLUDE = "CLOSED Proprietary"
```

Ngoài ra, với một sản phẩm embedded, chúng ta thường chỉ quan tâm tới software đi kèm chính sản phẩm, nên có thể giới hạn loại recipe để chỉ archive các target image, với dòng sau:

```
COPYLEFT_RECIPE_TYPES = "target"
```

Chúng ta nên xin tư vấn pháp lý để quyết định package nào có license khiến việc phân phối source là bắt buộc.

Còn có các tùy chọn cấu hình khác, như cung cấp source đã patch hoặc đã cấu hình thay vì source gốc và patch tách riêng, hoặc source RPM thay vì source tarball. Xem class `archiver` để biết thêm chi tiết.

### Còn nữa...

Chúng ta cũng có thể chọn phân phối toàn bộ môi trường build. Cách tốt nhất để làm điều này thường là công bố các BSP layer và software layer lên một Git repository công khai. Khi đó software layer có thể cung cấp `bblayers.conf.sample` và `local.conf.sample`, có thể dùng để thiết lập các build directory ready-to-use.

### Xem thêm

- Có những yêu cầu khác chưa được bàn ở đây, như cơ chế được chọn để phân phối. Khuyến nghị bạn xin tư vấn pháp lý trước khi phát hành sản phẩm để bảo đảm mọi nghĩa vụ license đã được đáp ứng.

## Phân tích hệ thống để tuân thủ license

Yocto build system giúp dễ dàng cung cấp thông tin audit cho các cố vấn pháp lý. Recipe này sẽ giải thích cách làm.

### Cách thực hiện...

Dưới `tmp/deploy/licenses`, chúng ta thấy một danh sách thư mục các package (kèm license tương ứng của chúng) và một thư mục `image` chứa manifest của package và license.

Với image ví dụ đã giảm kích thước ở trên, `image-small`, chúng ta có như sau:

```
tmp/deploy/licenses/image-small-initramfs-wandboard-
<timestamp>/package.manifest
base-files
base-passwd
busybox
busybox-syslog
busybox-udhcpc
initscripts
initscripts-functions
libc6
run-postinsts
sysvinit
sysvinit-inittab
sysvinit-pidof
update-alternatives-opkg
update-rc.d
```

Và đoạn trích tương ứng của file `tmp/deploy/licenses/image-small-initramfs-wandboard-<timestamp>/license.manifest` như sau:

```
PACKAGE NAME: base-files
PACKAGE VERSION: 3.0.14
RECIPE NAME: base-files
LICENSE: GPLv2
PACKAGE NAME: base-files-lic
PACKAGE VERSION: 3.0.14
RECIPE NAME: base-files
LICENSE: GPLv2
```

Các file này có thể được dùng để phân tích mọi package khác nhau tạo nên root filesystem. Chúng ta cũng có thể audit chúng để bảo đảm tuân thủ license khi phát hành sản phẩm ra công chúng.

### Còn nữa...

Bạn có thể bảo Yocto build system tránh cụ thể một số license bằng biến cấu hình `INCOMPATIBLE_LICENSE`. Cách dùng thông thường là tránh các license kiểu GPLv3- bằng cách thêm dòng sau vào file `conf/local.conf`:

```
INCOMPATIBLE_LICENSE = "GPL-3.0 LGPL-3.0 AGPL-3.0"
```

Điều này sẽ build các image `core-image-minimal` và `core-image-base` miễn là không có image feature bổ sung nào được đưa vào.

## Làm việc với code open source và code độc quyền

Việc một sản phẩm embedded được build trên nền một hệ thống open source như hệ thống do Yocto build, và bao gồm software độc quyền mang lại giá trị gia tăng và tạo nét riêng cho sản phẩm, là phổ biến. Phần độc quyền này thường chứa tài sản trí tuệ và cần được bảo vệ, và điều quan trọng là hiểu nó có thể cùng tồn tại với code open source như thế nào.

Recipe này sẽ bàn về một số ví dụ các package open source thường thấy trên sản phẩm embedded và sẽ giải thích ngắn gọn cách dùng software độc quyền cùng với chúng.

### Cách thực hiện...

Các license open source có thể chia đại thể thành hai loại tùy theo việc chúng là:

- Permissive (dễ dãi): Tương tự các license Internet Software Consortium (ISC), MIT và BSD. Chúng đi kèm ít yêu cầu và chỉ đòi hỏi chúng ta giữ lại thông báo bản quyền và thông báo bảo hành giới hạn.

- Restrictive (hạn chế): Tương tự GPL, ràng buộc chúng ta không chỉ phân phối source code và các sửa đổi, kèm theo chính binary hoặc vào một thời điểm sau, mà còn phân phối các công cụ để build, cài đặt và chạy source.

Tuy nhiên, một số license có thể "lây" các điều kiện của chúng sang các sửa đổi và tác phẩm phái sinh, thường được gọi là viral license, trong khi các license khác thì không. Ví dụ, nếu bạn link ứng dụng với code GPL-licensed, ứng dụng của bạn cũng sẽ bị ràng buộc bởi GPL.

Tính "lây nhiễm" của GPL đã khiến một số người dè dặt khi dùng software GPL-licensed, nhưng điều quan trọng cần lưu ý là software độc quyền có thể chạy cùng software GPL miễn là các điều khoản license được hiểu và tôn trọng.

Ví dụ, vi phạm license GPLv2 có nghĩa là mất quyền phân phối code GPLv2 trong tương lai, ngay cả khi việc phân phối sau đó là GPLv2-compliant. Trong trường hợp này, cách duy nhất để có thể phân phối lại code là xin phép những người giữ bản quyền.

### Cách hoạt động...

Tiếp theo, chúng ta sẽ đưa ra hướng dẫn về các yêu cầu license cho một số package open source thường được dùng trong sản phẩm embedded. Đây không phải là tư vấn pháp lý, và như đã nói trước đó, nên thực hiện audit pháp lý phù hợp cho sản phẩm trước khi phát hành công khai.

#### Bootloader U-Boot

U-Boot được cấp phép theo GPLv2, nhưng bất kỳ chương trình nào được nó khởi chạy đều không kế thừa license của nó. Vì vậy, ví dụ bạn có thể tự do dùng U-Boot để khởi chạy một hệ điều hành độc quyền. Tuy nhiên, sản phẩm cuối cùng của bạn phải tuân thủ GPLv2 đối với U-Boot, nên phải cung cấp source code U-Boot và các sửa đổi.

#### Linux kernel

Linux kernel cũng được cấp phép theo GPLv2. Bất kỳ ứng dụng nào chạy trong user space của Linux kernel đều không kế thừa license của nó, nên bạn có thể tự do chạy software độc quyền trên Linux. Tuy nhiên, các Linux kernel module là một phần của Linux kernel và do đó phải tuân thủ GPLv2. Ngoài ra, sản phẩm cuối cùng của bạn phải phát hành source Linux kernel và các sửa đổi, kể cả các module bên ngoài chạy trong sản phẩm.

#### glibc

Thư viện GNU `C` phiên bản 2.26 có trong Yocto Project 2.4 được cấp phép theo Lesser General Public License v2.1 (LGPLv2.1), cho phép dynamic linking mà không kế thừa license. Vì vậy code độc quyền của bạn có thể dynamic link với `glibc`, nhưng tất nhiên bạn vẫn phải tuân thủ LGPL đối với `glibc`. Tuy nhiên, lưu ý rằng việc static link ứng dụng sẽ làm nó bị "lây" LGPL.

#### musl

Thư viện `C` musl được cấp phép theo MIT license, một license software dễ dãi có rất ít hạn chế về việc tái sử dụng, miễn là các điều khoản MIT license và thông báo bản quyền được đưa vào. Do đó code độc quyền của bạn có thể link với musl mà không bị lây license.

#### BusyBox

BusyBox cũng được cấp phép theo GPLv2. License này cho phép software non-related chạy cùng nó, nên software độc quyền của bạn có thể tự do chạy cùng BusyBox. Như trước, bạn phải tuân thủ GPLv2 đối với BusyBox và phân phối source cùng các sửa đổi của nó.

#### Qt framework

Qt được cấp phép theo ba license khác nhau. Bạn có thể chọn muốn dùng license thương mại (trong trường hợp này, ứng dụng độc quyền của bạn được bảo vệ, đổi lại là license per-developer cộng phí bản quyền), license LGPL (như đã bàn ở trên, cũng sẽ bảo vệ software độc quyền của bạn bằng cách cho phép dynamic linking ứng dụng miễn là bạn tuân thủ LGPL cho chính Qt framework), hay GPLv3 (sẽ bị ứng dụng của bạn kế thừa).

Phiên bản LGPL của thư viện Qt đã thay đổi theo từng bản phát hành software:

- Trong Qt5.3, hầu hết các module theo LGPLv2.1, với một vài module commercial-only

- Từ Qt5.4, các module mới được phát hành theo LGPLv3, license này cũng được thêm làm một lựa chọn cho các module cũ hơn

- Qt5.7 bỏ hỗ trợ LGPLv2.1, với các lựa chọn duy nhất là thương mại, GPLv3 hoặc LGPLv3

- Mô hình license cho Qt5.9, phiên bản có trong Yocto 2.4, không thay đổi nên vẫn cho phép thương mại, GPLv3 hoặc LGPLv3

LGPLv3 là phiên bản mở rộng của LGPLv2.1, về cơ bản thêm vào một điều khoản gọi là anti-tivoization, yêu cầu chúng ta cho phép source code đã sửa đổi chạy được trên thiết bị cũng như cung cấp hướng dẫn cho việc đó. Khi dùng Yocto Project, điều này có thể thực hiện bằng cách cung cấp SDK để build source thư viện Qt, cùng một cách để deploy nó, có thể là qua một bản cập nhật package. Lưu ý rằng điều này chỉ áp dụng cho thư viện Qt, không cho ứng dụng dynamic link với nó, nên hệ thống nên được thiết kế sao cho ứng dụng Qt dùng thư viện không có quyền truy cập vào các phần quan trọng của hệ thống, ví dụ bằng một SELinux policy well-designed như đã giải thích trong recipe Securing the root filesystem ở chương này.

Chi tiết về các mô hình license hiện tại của Qt có tại `https://www1.qt.io/licensing-comparison/`.

#### Hệ thống X Windows

Source `X.Org` được cấp phép theo các license dễ dãi MIT-style. Vì vậy, software độc quyền của bạn được tự do dùng nó theo bất kỳ cách nào, miễn là việc sử dụng được nêu rõ và thông báo bản quyền được giữ lại.

### Còn nữa...

Hãy xem cách tích hợp code proprietary-licensed của chúng ta vào Yocto build system. Khi chuẩn bị recipe cho ứng dụng, chúng ta có thể chọn một số cách tiếp cận về license:

- Đánh dấu `LICENSE` là closed. Đây là trường hợp thông thường cho một ứng dụng độc quyền. Chúng ta dùng dòng sau:

  ```
  LICENSE = "CLOSED"
  ```

- Đánh dấu `LICENSE` là proprietary và kèm một loại thỏa thuận license nào đó. Điều này thường được làm khi phát hành binary kèm một loại thỏa thuận người dùng cuối được tham chiếu trong recipe. Ví dụ, layer `meta-freescale` dùng loại license này để tuân thủ End User License Agreement của Freescale. Một ví dụ là:

  ```
  LICENSE = "Proprietary"
  LIC_FILES_CHKSUM =
  "file://EULA.txt;md5=93b784b1c11b3fffb1638498a8dde3f6"
  ```

- Cung cấp nhiều lựa chọn license, như một license open source và một license thương mại. Trong trường hợp này, biến `LICENSE` được dùng để chỉ định các license mở, còn biến `LICENSE_FLAGS` được dùng cho các license thương mại. Một ví dụ điển hình là package `gstreamer1.0-plugins-ugly` trong Poky:

  ```
  LICENSE = "GPLv2+ & LGPLv2.1+ & LGPLv2+"
  LICENSE_FLAGS = "commercial"
  LIC_FILES_CHKSUM =
  "file://COPYING;md5=a6f89e2100d9b6cdffcea4f398e37343 \
  file://tests/check/elements/xingmux.c;beginline=1;endline=21;md5=4c
  771b8af188724855cb99cadd390068"
  ```

Khi biến `LICENSE_FLAGS` được đặt trong một recipe, package sẽ không được build trừ khi license đó cũng xuất hiện trong biến `LICENSE_FLAGS_WHITELIST`, thường được định nghĩa trong file `conf/local.conf`. Với ví dụ trên, chúng ta sẽ thêm dòng này:

```
LICENSE_FLAGS_WHITELIST = "commercial"
```

Các biến `LICENSE` và `LICENSE_FLAGS_WHITELIST` có thể khớp chính xác để khớp rất hẹp, hoặc khớp rộng, như trong ví dụ trên, khớp mọi license bắt đầu bằng từ `commercial`. Để khớp hẹp, tên package phải được thêm vào sau tên license; ví dụ, nếu chúng ta chỉ muốn đưa vào whitelist package `gstreamer1.0-plugins-ugly` từ ví dụ trên mà không gì khác, chúng ta có thể dùng dòng sau:

```
LICENSE_FLAGS_WHITELIST = "commercial_gstreamer1.0-plugins-ugly"
```

### Xem thêm

- Bạn nên tham khảo từng license cụ thể để hiểu đầy đủ các yêu cầu mà chúng đặt ra. Bạn có thể tìm danh sách đầy đủ các license open source và tài liệu của chúng tại `http://spdx.org/licenses/`.
