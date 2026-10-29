# Chương 6. Recipe (Recipes)

Recipe chứa các chỉ dẫn về cách cấu hình, compile và triển khai một phần software nhất định. Hơn nữa, chúng chứa vị trí của source code và mọi patch cần áp dụng lên nó để điều chỉnh package cuối cùng cho Yocto Project. Nói ngắn gọn, các file này mô tả đầy đủ cách tạo một software package từ đầu!

Trong chương này, chúng ta sẽ có cái nhìn in-depth về những gì các file này có thể chứa và cách chúng ta nên viết chúng để có một file recipe hoạt động. Cụ thể, chương này sẽ giải thích cách tạo recipe và những gì recipe có thể chứa, sau đó bắt đầu từ Chương 9, chúng ta cũng sẽ đưa ra một số ví dụ thực tế để củng cố mọi khái niệm được trình bày ở đây.

Vậy hãy bắt đầu học cách viết file recipe.

## 6.1 Vị trí và quy ước đặt tên (Locating and Naming Conventions)

Như đã thấy trong Mục 3.4.4 (và trước đó trong khi cài đặt source), trong giai đoạn cấu hình, BitBake sẽ đặt biến `BBFILES`, biến định nghĩa danh sách các file recipe (`.bb`) cần parse, cùng với mọi append file (`.bbappend`) cần áp dụng. Vì vậy, chương trình `bitbake` parse các file này và lưu giá trị của các biến mà chúng định nghĩa vào data store của nó.

Chúng ta có thể đặt tên và vị trí cho các file recipe này tùy ý, nhưng nói chung chúng nên tuân theo quy ước đặt tên `recipes-` `category/name/name_version.bb`. Ví dụ, nếu xem layer `meta-networking` (trong thư mục `meta-openembedded`), chúng ta thấy cấu trúc sau:

```
$ ls sources/meta-openembedded/meta-networking/
COPYING.MIT  files                 recipes-devtools  recipes-netkit
MAINTAINERS  licenses              recipes-extended  recipes-protocols
README       recipes-connectivity  recipes-filter    recipes-support
classes      recipes-core          recipes-irc
conf         recipes-daemons       recipes-kernel
```

Ở đây, chúng ta có nhiều category recipe như `recipes-filter`, `recipes-protocols`, `recipes-daemons`, v.v., và ví dụ, trong thư mục cuối cùng, chúng ta thấy nội dung sau:

```
$ ls sources/meta-openembedded/meta-networking/recipes-daemons/
atftp       iscsi-initiator-utils  openhpi  pure-ftpd  vsftpd
autofs      keepalived             opensaf  radvd
cyrus-sasl  lldpd                  postfix  squid
igmpproxy   ncftp                  proftpd  tftp-hpa
ippool      networkd-dispatcher    ptpd     vb
```

Ở đây, embedded developer có thể nhận ra nhiều networking daemon. Khi đó, ví dụ, recipe tương ứng nằm trong thư mục `vsftpd` cùng mọi file cần thiết để build package `vsftpd`:

```
$ cd sources/meta-openembedded
$ tree meta-networking/recipes-daemons/vsftpd/
meta-networking/recipes-daemons/vsftpd/
├── files
│   ├── change-secure_chroot_dir.patch
│   ├── init
│   ├── volatiles.99_vsftpd
│   ├── vsftpd.conf
│   ├── vsftpd.ftpusers
│   ├── vsftpd.service
│   └── vsftpd.user_list
├── vsftpd-3.0.5
│   ├── 0001-sysdeputil.c-Fix-with-musl-which-does-not-have-utmpx.patch
│   ├── makefile-destdir.patch
│   ├── makefile-libs.patch
│   ├── makefile-strip.patch
│   ├── nopam.patch
│   ├── nopam-with-tcp_wrappers.patch
│   ├── vsftpd-2.1.0-filter.patch
│   └── vsftpd-tcp_wrappers-support.patch
└── vsftpd_3.0.5.bb

2 directories, 16 files
```

Bạn đọc nên chú ý rằng file recipe, tức là file có phần mở rộng `.bb`, được đặt tên `vsftpd_3.0.5.bb` vì recipe có sẵn dành cho bản phát hành 3.0.5 của daemon vsftpd (very secure FTP daemon).

Bạn đọc cũng nên chú ý rằng trong thư mục `meta-networking`, mọi recipe cho các dự án liên quan (trong ví dụ trên là mọi recipe của networking daemon) có thể dùng chung cùng một thư mục recipe (tức là `recipes-` `daemons`).

> Lưu ý rằng tên và category của recipe có thể chứa dấu gạch nối, nhưng dấu gạch nối không được phép trong phiên bản vì chúng được dùng để ngăn cách tên package với phiên bản của package!

Vì vậy, tên thông thường của file recipe là `name_version.bb`, trong đó `version` thường có dạng `XX.YY.ZZ`. Tuy nhiên, đây không phải là quy tắc cố định, và cần một lưu ý đặc biệt cho các dự án được theo dõi bằng công cụ quản lý revision, ví dụ như công cụ Git. Trong trường hợp này, recipe không tương ứng với một phiên bản đã phát hành của software, vì vậy `version` được đặt thành chuỗi `git`, và file recipe được đặt tên `name_git.bb`.

Cấu trúc cứng nhắc này được dùng trong environment của BitBake để tạo ra các biến `PN` và `PV`. Biến thứ nhất được dùng để chứa tên recipe (hoặc tên package kết quả – xem bên dưới để biết thêm thông tin), còn biến thứ hai chứa phiên bản của recipe, và cả hai đều được trích từ tên file recipe. Trong ví dụ trên, recipe có tên `vsftpd_3.0.5.bb`, khi đó `PN` sẽ được đặt thành `vsftpd`, còn giá trị mặc định của `PV` sẽ là `3.0.5`.

Tuy nhiên, với `PN`, đây không phải là quy tắc cố định; thật vậy, có những trường hợp đặc biệt (không được đề cập trong sách này) mà tên lưu trong `PN` cũng có thể chứa một hậu tố hoặc tiền tố đặc biệt. Thật vậy, như được chỉ rõ trong Reference Manual của Yocto Project tại `https://docs.yoctoproject.org/ref-manual/variables.html?highlight=srcrev#term-PN`, khi dùng Bash để build package cho native machine, `PN` được đặt thành `bash-native`, còn khi dùng `bash` để build package cho target và cho Multilib (được dùng để tạo các distro có thư viện cho các kiến trúc khác nhau bắt nguồn từ cùng source, ví dụ thư viện 32- và 64-bit), `PN` sẽ lần lượt là `bash` và `lib64-bash`.

Cũng lưu ý rằng `PV` thường không bị override trong một recipe, trừ khi recipe build một phiên bản không ổn định (hay phiên bản đang phát triển) từ một source code repository như Git hoặc Subversion. Trong trường hợp này, nó được viết lại như trong recipe của Netperf trong layer meta-openembedded, như dưới đây:

```
$ grep '^PV' meta-networking/recipes-support/netperf/netperf_git.bb
PV = "2.7.0+git${SRCPV}"
```

Trong ví dụ này, recipe nhắm tới bản phát hành Netperf 2.7.0 và thêm chuỗi `+git` theo sau là nội dung của biến `SRCPV`, biến chứa chuỗi phiên bản của package hiện tại được trích từ Git repository (thường là commit ID). Với Netperf, chúng ta có

```
bitbake -e netperf | grep PV=
PV="2.7.0+gitAUTOINC+3bc455b23f"
SRCPV="AUTOINC+3bc455b23f"
```

còn với vsftpd, chúng ta có

```
$ bitbake -e vsftpd | grep PV=
PV="3.0.5"
```

Mọi trường hợp đặc biệt này sẽ rõ ràng hơn và được giải thích tốt hơn trong các mục tiếp theo của sách.

## 6.2 Hiểu các chính sách phiên bản (Understanding Version Policies)

Khi đã hiểu recipe nên được đặt tên thế nào và nên được đặt ở đâu, một điều quan trọng cần biết là Yocto Project quản lý phiên bản của package như thế nào. Nếu xem file `sources/poky/meta/classes/package_ipk.bbclass`, nơi chứa code để build các package IPKG, chúng ta có thể có ý niệm về cách định nghĩa phiên bản của package:

```
...
    pe = d.getVar('PKGE')
    if pe and int(pe) > 0:
        fields.append(["Version: %s:%s-%s\n", ['PKGE', 'PKGV', 'PKGR']])
    else:
        fields.append(["Version: %s-%s\n", ['PKGV', 'PKGR']])
...
```

tức là bằng cách kết hợp các biến `PKGE`, `PKGV` và `PKGR`. Các biến này lần lượt là epoch, phiên bản và revision của mỗi package được build bởi recipe, và chúng mặc định bằng các biến `PE`, `PV` và `PG` *(ghi chú: đúng là `PR`)*. Cụ thể, chúng ta có như sau:

- `PE` là epoch của recipe, và theo mặc định biến này không được đặt. Biến này được dùng để có thể nâng cấp khi lược đồ đánh số phiên bản thay đổi theo một cách backward-incompatible nào đó (nó chỉ có thể có giá trị số nguyên).

- `PV` là phiên bản của recipe, và nó thường được trích từ tên file recipe. Ví dụ, như trong ví dụ ở mục trước, tên recipe là `vsftpd_3.0.5.bb`, khi đó giá trị mặc định của `PV` sẽ là `3.0.5`.

- `PR` là revision của recipe, và mặc định là `r0`. Theo quy ước, các revision tiếp theo của recipe có giá trị `r1`, `r2`, v.v. Nó nên được đặt lại thành `r0` khi `PV` tăng.

Như đã giới thiệu ở mục trước, `PV` thường không được đặt trong recipe trừ khi recipe được build từ một source code repository được quản lý bằng `git` (hoặc bất kỳ công cụ quản lý phiên bản nào khác). Trong những trường hợp như vậy, nên dùng một thiết lập đặc biệt cho `PV`, đặc biệt trong trường hợp không tương ứng với một phiên bản software đã phát hành (tức là không phải phiên bản đã gắn tag); biến `PV` nên bao gồm revision của `git` như dưới đây:

```
PV = "version+git${SRCPV}"
```

Ở đây, `version` nên là phiên bản đã phát hành gần nhất của software tính từ revision source hiện tại (chúng ta có thể dùng lệnh `git describe` để xác định điều này), còn `SRCPV` là chuỗi phiên bản của package hiện tại. Nó được chương trình `bitbake` tạo ra tùy theo công cụ được dùng để quản lý repository của source.

Định dạng này cũng hữu ích khi dùng biến `AUTOREV` để thiết lập recipe tự động tăng revision quản lý source trong biến `SRCREV`, trong quá trình phát triển, như dưới đây:

```
SRCREV = "${AUTOREV}"
```

> Trong các mục tiếp theo, chúng ta sẽ thấy cách dùng phổ biến của các biến này trong quá trình phát triển. Lúc này, bạn đọc nên lưu ý rằng `SRCREV` áp dụng cho Subversion và Git (và cả Mercurial lẫn Bazaar), và khi được dùng, nó gây ra một truy vấn tới remote repository mỗi lần BitBake parse recipe của chúng ta. Vì vậy, nếu muốn build một revision cố định và tránh việc truy vấn, chúng ta nên chỉ định một định danh revision đầy đủ như recipe của Netperf làm:
>
> ```
> $ grep SRCREV meta-networking/recipes-support/netperf/netperf_git
> .bb
> SRCREV = "3bc455b23f901dae377ca0a558e1e32aa56b31c4"
> ```
>
> Bạn đọc cũng nên lưu ý rằng nếu `SRCREV` được đặt thành `${AUTOREV}`, lệnh `devtool modify` có thể thất bại. Vì vậy hãy chắc chắn không có thiết lập đặc biệt này trước khi dùng `devtool` trên một recipe!

Ngoài những điều này, với các recipe thông thường, chúng ta thường đặt `PV` (hoặc `bitbake` làm việc đó cho chúng ta bằng cách đọc tên recipe) để chọn bản phát hành software mong muốn.

Cuối cùng, cần nói vài lời về `PR` và `PE`.

Về `PR`, chúng ta nên tính đến việc nó trở nên quan trọng khi một package manager cài package một cách động lên một image đã được build. Trong trường hợp này, `PR` (và theo đó là `PKGR`) có thể giúp package manager phân biệt package nào là mới nhất trong trường hợp nhiều package có cùng phiên bản (`PV` và `PKGV`). Một cách dùng điển hình của cơ chế này là khi có nhiều package cùng `PV` nhưng khác giá trị `PR`. Điều đó có nghĩa là tất cả chúng đều cài cùng một phiên bản upstream, nhưng các giá trị `PR` mới nhất có thể bao gồm, ví dụ, một số bản sửa lỗi.

> Giá trị của `PR` trước đây phải được đặt bằng tay, nhưng trong hầu hết các trường hợp, giờ chúng có thể được đặt và tăng tự động bởi một PR Server được kết nối với một package feed. Tuy nhiên, hành vi này không được đề cập trong sách, và bạn đọc có thể tìm thêm thông tin trong mục Working With a PR Service của Yocto Project Development Tasks Manual tại `https://docs.yoctoproject.org/3.2.3/dev-manual/dev-manual-common-tasks.html#working-with-a-pr-service`.

Mặt khác, một cách dùng điển hình của `PE` là khi `PV` thay đổi theo cách mà nó không tăng so với giá trị trước. Vì vậy chúng ta có thể dùng `PE` để bảo đảm package manager sẽ nâng cấp nó đúng. Thật vậy, khi `PE` được đặt thành một giá trị lớn hơn `0`, tên package được tạo thành từ

```
${PN}-${PE}_${PV}-${PR}
```

thay vì dạng thông thường:

```
${PN}-${PV}-${PR}
```

Mọi điều này đều nhằm bảo đảm phiên bản của recipe luôn được so sánh và sắp xếp đúng để việc nâng cấp hoạt động như mong đợi. Thật vậy, thông thường các phiên bản theo quy ước như 1.4 nâng cấp lên 1.5 diễn ra tự nhiên, nhưng một số phiên bản thì không. Ví dụ, 1.5rc2 (tức là phiên bản 1.5 Release Candidate 2) được sắp xếp đứng trước 1.5, và việc nâng cấp từ feed sẽ không diễn ra đúng!

> Để so sánh phiên bản, trong trường hợp package IPK, chương trình `opkg-compare-versions` từ package `opkg-utils` có thể hữu ích khi cố xác định hai số phiên bản so với nhau thế nào.

Trong ví dụ đặc biệt này, có hai cách giải quyết vấn đề:

1) Chúng ta có thể đặt `PE` thành `1`, hoặc một giá trị cao hơn, để áp đặt cách sắp xếp của mình.

2) Chúng ta có thể dùng toán tử dấu ngã (`~`), toán tử được sắp xếp đứng trước chuỗi rỗng, trong `PV` như

   ```
   PV = "1.5~rc2"
   ```

Bằng cách này, bản phát hành `1.5~rc2` đứng trước bản phát hành `1.5`.

> Có một cú pháp lịch sử có thể gặp, trong đó `PV` được đặt là tổ hợp của phiên bản trước cộng với phiên bản pre-release, ví dụ:
>
> ```
> PV = "1.4+1.5rc2".
> ```
>
> Đây là một cú pháp hợp lệ, nhưng dạng dấu ngã được ưa dùng hơn.

## 6.3 Cấu trúc recipe (Recipe Structure)

Khi đã hiểu cách đặt tên file recipe và package, cũng như cách quản lý phiên bản software, giờ chúng ta đã sẵn sàng xem một file recipe được cấu trúc như thế nào, tức là những biến nào nên dùng trong đó, khi nào và ở đâu có thể include file hoặc kế thừa class, v.v.

Mỗi lần viết một file recipe, chúng ta nên tuân theo thứ tự chung dưới đây (khi có thể):

- Mô tả chung: Trong phần này, chúng ta thấy mọi biến mô tả nội dung và code của recipe.

- Thông tin source code: Ở đây, chúng ta liệt kê mọi source (local hoặc remote) nơi phải lấy code.

- Quy tắc build: Ở đây, chúng ta phải thêm mọi quy tắc cần thiết để chuyển source thành file thực thi hoặc dữ liệu.

- Thông tin đóng gói: Ở đây chúng ta đặt mọi thông tin cần thiết để nhóm các file đã build thành các package hợp lệ của Yocto Project, sẵn sàng để cài lên target.

Một ví dụ thực tế về điều chúng ta đang nói được trình bày trong meta layer poky, ở thư mục `meta-skeleton/recipes-skeleton`, thư mục chứa nhiều recipe ví dụ hữu ích:

```
$ tree sources/poky/meta-skeleton/recipes-skeleton/hello-single/
sources/poky/meta-skeleton/recipes-skeleton/hello-single/
├── files
│   └── helloworld.c
└── hello_1.0.bb

1 directory, 2 files
```

Đây là một recipe hoạt động đầy đủ, trong đó mọi file cần thiết đều được lưu ở local. Recipe `hello_1.0.bb` trông như dưới đây:

```
$ cd sources/poky
$ cat meta-skeleton/recipes-skeleton/hello-single/hello_1.0.bb
DESCRIPTION = "Simple helloworld application"
SECTION = "examples"
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bc
f8506ecda2f7b4f302"

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

Phần mô tả chung chứa các thiết lập sau:

```
DESCRIPTION = "Simple helloworld application"
SECTION = "examples"
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bc
f8506ecda2f7b4f302"
```

còn phần thông tin source code chứa nội dung sau:

```
SRC_URI = "file://helloworld.c"
```

tiếp theo là phần quy tắc build:

```
S = "${WORKDIR}"

do_compile() {
        ${CC} ${LDFLAGS} helloworld.c -o helloworld
}

do_install() {
        install -d ${D}${bindir}
        install -m 0755 helloworld ${D}${bindir}
}
```

Trong recipe này, không có phần thông tin đóng gói vì Yocto build system có một số quy tắc ngầm để tạo package (và để làm nhiều task khác, như chúng ta sẽ thấy ở phần sau của sách), vì vậy không cần thêm quy tắc nào để hoàn thành công việc.

> Lưu ý rằng biến `COMMON_LICENSE_DIR` trỏ tới thư mục `meta/files/common-licenses` trong layer `poky`, nơi chứa các file license chung.

### 6.3.1 Mô tả chung (General Descriptions)

Như đã nói, trong phần này chúng ta có thể tìm thấy thông tin chung về package, và để làm vậy, có thể dùng các biến sau:

- `SUMMARY`: Mô tả one-line (72 ký tự hoặc ít hơn) của binary package dành cho các hệ thống đóng gói như `opkg`, `rpm` hoặc `dpkg`.

- `DESCRIPTION`: Mô tả mở rộng của binary package, có thể gồm nhiều dòng (tức là phiên bản mở rộng của `SUMMARY`). Chúng ta có thể bỏ qua nó, và trong trường hợp đó, nó mặc định bằng `SUMMARY`.

- `HOMEPAGE`: URL tới trang chủ của dự án upstream, nếu có.

- `BUGTRACKER`: URL tới website theo dõi bug của dự án upstream, nếu có. Yocto build system không dùng biến này, nhưng nó có thể hữu ích cho việc báo bug.

- `SECTION`: Chỉ định section mà các package nên được phân loại vào. Thông tin này không cần cho việc build code, nhưng các tiện ích quản lý package có thể dùng biến này để nhóm các package. Các giá trị thông thường được chỉ định ở đây là

  - `base`: Các package thuộc về hệ thống cơ bản, ví dụ init script, core utility, các system daemon tiêu chuẩn. v.v.

  - `doc`: Các package tài liệu như man page và file cấu hình mẫu.

  - `libs`: Thư viện runtime (không dùng cho phát triển – xem `devel`). Nó có thể có các subsection như `libs/network`, `libs/multimedia`, v.v., để phân loại thư viện tốt hơn.

  - `utils`: Các tiện ích chung.

  - `network`: Các package Networking-related.

  - `devel`: Các package Development-related như compiler, header, debugger, v.v. Nó có thể có các subsection như `devel/libs` (còn gọi là `libdevel`) dùng để lưu thư viện phát triển, `devel/python` cho code phát triển Python, v.v.

  - `shell`: Các package shell như `bash`, `zsh`, v.v.

  - `console`: Các package chứa ứng dụng chạy trên console, không có thư viện hay giao diện GUI-related để chạy. Nó có thể có các subsection như `console/utils`, `console/network`, `console/editors`, `console/multimedia`, `console/network`, v.v.

  - `kernel`: Các package Kernel-related. Các subsection thường được dùng là `kernel/modules` (kernel module out-of-tree) và `kernel/userland` (công cụ kernel được thực thi trong user space).

  - `bootloaders`: Các package chứa ứng dụng được dùng để nạp kernel sau khi boot.

  - `x11`: Các package liên quan đến ứng dụng X11 (hoặc đồ họa). Thông thường, các subsection của nó được dùng thay thế: `x11/base`, `x11/libs`, `x11/utils`, `x11/network`, v.v.

  - Các section khác như `fonts`, `games`, v.v.

> Để có ý niệm cơ bản về section là gì, chúng ta có thể xem trong file `bitbake.conf`:
>
> ```
> $ grep SECTION sources/poky/meta/conf/bitbake.conf
> SECTION = "base"
> SECTION:${PN}-doc = "doc"
> SECTION:${PN}-dev = "devel"
> SECTION:${PN}-staticdev = "devel"
> SECTION:${PN}-dbg = "devel"
> SECTION:${PN}-src = "devel"
> ```
>
> Như chúng ta thấy, theo mặc định, BitBake định nghĩa nhiều package cho mỗi recipe, mỗi package được gắn cố định vào một section phù hợp.

- `LICENSE` và `LIC_FILES_CHKSUM`: Biến thứ nhất được dùng để liệt kê các license áp dụng cho source, còn biến thứ hai chứa checksum của các file chứa các license đó (xem phần dưới của mục này để biết thêm thông tin về những gì có thể đưa vào các biến này).

Một bố cục điển hình cho phần mô tả chung này có thể thấy trong recipe của z-shell (`zsh`) nằm trong file `zsh_5.8.bb` trong layer `meta-openembedded`, được trình bày dưới đây:

```
$ cat sources/meta-openembedded/meta-oe/recipes-shells/zsh/zsh_5.8.bb
SUMMARY = "UNIX Shell similar to the Korn shell"
DESCRIPTION = "Zsh is a shell designed for interactive use, although \
               it is also a powerful scripting language. Many of the \
               useful features of bash, ksh, and tcsh were \
               incorporated into zsh; many original features were \
               added."
HOMEPAGE = "http://www.zsh.org"
SECTION = "base/shell"

LICENSE = "zsh"
LIC_FILES_CHKSUM = "file://LICENCE;md5=1a4c4cda3e8096d2fd483ff2f4514fec"
...
```

Điều thú vị cần chú ý ở đây là về hai biến cuối. Thật vậy, như chúng ta thấy, `LIC_FILES_CHKSUM` chứa thông tin để kiểm tra nội dung license và theo dõi thay đổi của nó bằng checksum. Nếu nội dung license thay đổi, quá trình build sẽ thất bại, và chúng ta có cơ hội xem lại các thay đổi đó.

Trừ khi `LICENSE` được đặt thành `CLOSE` *(ghi chú: đúng là `CLOSED`)*, chúng ta phải chỉ định một giá trị phù hợp cho `LIC_FILES_CHKSUM`, như trong ví dụ trên cho license của Zsh. Bằng các thiết lập trên cho `LIC_FILES_CHKSUM`, chúng ta báo cho Yocto build system biết rằng nội dung license nằm trong file `LICENCE` ở thư mục source, và giá trị checksum MD5 của nó là `1a4c4cda3e8096d2fd483ff2f4514fec`.

Có nhiều cú pháp khác nhau có thể dùng trong biến `LIC_FILES_CHKSUM`, và dưới đây là một ví dụ:

```
LIC_FILES_CHKSUM = " \
    file://COPYING;md5=xxxxxxxxxxxx \
    file://licfile1.txt;beginline=5;endline=29;md5=yyyyyyyyyyyyyyyy \
    file://source.c;endline=50;md5=zzzzzzzzzzzzzzzz \
...
```

Trước tiên, lưu ý rằng chúng ta có thể chỉ định nhiều file license cùng lúc, và bằng các từ khóa `beginline` và `endline` (các giá trị được tính là bao gồm cả hai đầu), chúng ta có thể giới hạn việc kiểm tra trong một phần của file. Điều này hữu ích khi nội dung license được viết trong một file lẫn với code. Ví dụ, nếu có nội dung file sau:

```
$ cat -n helloworld.c
     1        /*
     2         * Copyright 2024 Rodolfo Giometti <giometti@enneenne.com>
     3         *
     4         * Permission is hereby granted, free of charge, to any
     5         * person obtaining a copy of this software and associated
     6         * documentation files (the "Software"), to deal in the
     7         * Software without restriction, including without
     8         * limitation * the rights to use, copy, modify, merge,
     9         * publish, distribute, sublicense, and/or sell copies of
    10         * the Software, and to permit persons to whom the Software
    11         * is furnished to do so, subject to the following
    12         * conditions:
    13         *
    14         * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
    15         * KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
    16         * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
    17         * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
    18         * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    19         * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
    20         * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    21         * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
    22         * IN THE SOFTWARE.
    23         */
    24
    25        #include <stdio.h>
    26
    27        int main(void)
    28        {
    29                printf("Hello world!\n");
    30
    31                return 0;
    32        }
```

thì trong `LIC_FILES_CHKSUM`, chúng ta nên đặt như sau:

```
LIC_FILES_CHKSUM = " \
    file://helloworld.c;beginline=1;endline=23;md5=yyyyyyyyyyyyyyyy \
    "
```

> Lưu ý rằng nếu `beginline` là `1`, có thể bỏ qua nó.

Về những gì có thể dùng trong biến `LICENSE`, chúng ta phải tuân theo các quy tắc sau:

- Không dùng dấu cách trong tên từng license. Vì vậy, ví dụ, license GPL phiên bản 2.0 trở lên có thể được chỉ định bằng chuỗi `GPL-2.0-or-later`.

- Recipe có thể chỉ định nhiều hơn một tên license bằng cách ngăn cách chúng bằng ký tự pipe (`|`) khi có sự lựa chọn giữa các license, hoặc bằng ký tự ampersand (`&`) khi có nhiều license cho các phần khác nhau của source. Ví dụ:

  ```
  LICENSE = "LGPL-2.1-only | GPL-3.0-only"
  LICENSE = "MPL-1.0 & LGPL-2.1-only"
  ```

  Dòng đầu tiên trong ví dụ nói rằng người dùng có thể chọn phân phối theo LGPL phiên bản 2.1 hoặc GPL phiên bản 3, còn dòng thứ hai nói rằng hai license này bao trùm các phần khác nhau của source code.

  Với các license tiêu chuẩn, chúng ta có thể dùng tên các file trong layer poky ở thư mục `meta/files/common-licenses` hoặc tên các flag `SPDXLICENSEMAP` được định nghĩa trong file `meta/conf/licenses.conf`:

  ```
  $ cat sources/poky/meta/conf/licenses.conf
  ...
  SPDXLICENSEMAP[AGPL-3.0] = "AGPL-3.0-only"
  SPDXLICENSEMAP[AGPL-3.0+] = "AGPL-3.0-or-later"

  # BSD variations
  SPDXLICENSEMAP[BSD-0-Clause] = "0BSD"
  # GPL variations
  SPDXLICENSEMAP[GPL-1] = "GPL-1.0-only"
  SPDXLICENSEMAP[GPL-1+] = "GPL-1.0-or-later"
  SPDXLICENSEMAP[GPLv1] = "GPL-1.0-only"
  SPDXLICENSEMAP[GPLv1+] = "GPL-1.0-or-later"
  ...
  ```

- Với các recipe định nghĩa nhiều hơn một package có license khác nhau, chúng ta có thể chỉ định license theo từng package (per-package). Ví dụ, một software có code được cấp license GPLv2 nhưng tài liệu đi kèm được cấp GNU Free Documentation License 1.2 có thể được chỉ định như sau:

  ```
  LICENSE = "GFDL-1.2 & GPL-2.0-only"
  LICENSE:${PN} = "GPL-2.0.only"
  LICENSE:${PN}-doc = "GFDL-1.2"
  ```

> Xem Mục 6.3.4 để biết cách quản lý thông tin nhiều package, hoặc Mục 9.1 để có ví dụ thực tế.

- Trong trường hợp package độc quyền, chúng ta nên dùng từ khóa `CLOSED`, không cần chỉ định gì thêm.

### 6.3.2 Thông tin source code (Source Code Information)

Trong phần này, chúng ta cung cấp thông tin về cách lấy code, bản phát hành nào và những gì cần thiết để compile được nó. Để làm vậy, chúng ta có thể dùng các biến sau:

- `DEPENDS`: Liệt kê các phụ thuộc build-time của recipe. Các loại phụ thuộc này là những recipe khác có nội dung (tức là header và/hoặc shared library) cần cho recipe vào lúc build.

> Trong Yocto Project, điều quan trọng là hiểu sự khác nhau giữa phụ thuộc build-time và phụ thuộc runtime, loại sau có thể được chỉ định bằng biến `RDEPENDS`. Xem phần dưới của mục này để có giải thích đầy đủ về các khái niệm này.

- `PROVIDES`: Chứa một danh sách alias mà qua đó một recipe cụ thể có thể được biết đến trong Yocto build system.

- Theo mặc định, giá trị trong `PN` đã ngầm có trong danh sách này. Do đó, không cần thêm nó vào, nhưng chúng ta có thể thêm tên alias ở đây khi điều đó có thể hữu ích để thỏa mãn phụ thuộc của các recipe khác trong quá trình build (xem phần dưới của mục này để có một số ví dụ).

> Cũng như `DEPENDS` và `RDEPENDS`, `PROVIDES` cũng có biến tương ứng `RPROVIDES`, được dùng để chỉ định tên package nhằm thỏa mãn các phụ thuộc runtime được yêu cầu bởi `RDEPENDS`.

- `PV`: Như đã thấy ở trên, biến này lưu phiên bản của recipe, thường được trích từ tên file recipe trừ khi recipe build từ một source code repository (trong trường hợp đó, chúng ta phải đặt nó cho đúng như đã trình bày ở trên và như chúng ta sẽ làm ở phần sau của sách).

- Cũng lưu ý rằng `PV` là giá trị mặc định của biến `PKGV` đã giới thiệu ở trên.

- `SRC_URI`: Danh sách các file source. Giải thích đầy đủ về biến này thực sự phức tạp, vì vậy sẽ được làm ở phần dưới của mục này; lúc này, chúng ta có thể nói rằng đó là biến cho BitBake biết cần lấy những file nào cho quá trình build, lấy chúng như thế nào và từ đâu.

- Ví dụ, nếu cần fetch một tarball, áp dụng hai patch và đưa vào một file tùy biến, chúng ta có thể đặt đúng biến `SRC_URI` chỉ định tất cả các source đó!

- `SRCREV`: Như đã giới thiệu ở trên, đây là revision của source code được dùng để build package, và nó chỉ được dùng với Subversion, Git, Mercurial và Bazaar.

- `S`: Biến này trỏ tới vị trí trong build directory nơi chứa source code đã giải nén của recipe, và mặc định là `${WORKDIR}/${BPN}-${PV}` (`BPN` là tên recipe cơ sở – xem bên dưới). Điều quan trọng cần nhớ là nếu source tarball giải nén code vào một thư mục có tên khác `${BPN}-${PV}`, hoặc nếu source code được fetch từ một repository (Git, Subversion, v.v.), thì chúng ta phải đặt `S` trong recipe để build system biết nơi tìm source đã giải nén (xem bên dưới).

Giờ đã giới thiệu các biến này, chúng ta cần nói thêm về một số biến và đưa ra một số ví dụ để hiểu rõ hơn cách dùng chúng.

Hãy bắt đầu với `DEPENDS` và xét một recipe tên là `foo` chứa phép gán sau:

```
DEPENDS = "bar foo-native"
```

Tác dụng thực tế của phép gán này là mọi file được package `bar` cài đặt sẽ có sẵn trong staging directory phù hợp vào lúc task `do_configure` của `foo` chạy. Và mọi file được cài bởi phiên bản native của recipe `foo`, có tên là `foo-native`, sẽ sẵn sàng để được gọi vào lúc task `do_build` của recipe `foo` chạy.

Dù khá trực quan rằng khi chỉ định `bar` là phụ thuộc của `foo`, chúng ta nói với build system rằng để compile `foo` thì cần compile `bar` trước, nhưng việc chỉ định `foo-native` có thể dẫn đến kết quả mơ hồ hơn. Tuy nhiên, điều đó sẽ trở nên rõ ràng nếu xem `foo-native` là package chứa, ví dụ, một code generator mà chúng ta cần chạy trước khi bắt đầu compile `foo`. Thật vậy, code generator đó có thể tạo ra một số file mà compiler cần để tạo ra `foo`. Vì vậy, bằng cách chỉ định phụ thuộc `foo-native`, chúng ta báo cho build system biết cần compile phiên bản native của `foo` (tức là code chạy trên host) trước khi compile phiên bản `foo` cho target (một ví dụ được trình bày trong Mục 11.6.1).

> Trong trường hợp sau, tức là khi một ứng dụng `foo-native` nào đó được gọi, chúng ta có thể phải chỉ định thêm đường dẫn trong biến `PATH` của host để cho phép thực thi đúng trên host. Bằng cách chỉ định như sau, chúng ta có thể thêm các đường dẫn `${STAGING_BINDIR_NATIVE}/foo` và `${STAGING_BINDIR_NATIVE}/bar` vào đầu `PATH`:
>
> ```
> EXTRANATIVEPATH = "foo bar"
> ```
>
> trong đó `STAGING_BINDIR_NATIVE` thường trỏ tới thư mục con `/usr/bin` của thư mục `sysroot` dành cho build system trên host.

Giờ thì rõ ràng qua ví dụ trên rằng `DEPENDS` không chỉ là một danh sách tên recipe, mà là một danh sách các tên `PROVIDES`, vốn thường trùng với tên recipe. Hơn nữa, các phụ thuộc này có hiệu lực trong khi build package, vì chúng không thêm bất kỳ phụ thuộc runtime nào giữa các package được tạo ra bởi hai recipe.

> Để biết thêm thông tin về phụ thuộc runtime, bạn đọc nên xem các biến `RDEPENDS` và `RPROVIDES` trong Mục 6.3.4.

Về `PROVIDES`, nó được dùng để chỉ định một danh sách alias mà qua đó một recipe cụ thể có thể được biết đến. Ví dụ, hãy xem hai recipe `eudev_3.2.10.bb` và `systemd_250.5.bb` trong thư mục `sources/poky/meta/recipes-core`:

```
$ cat sources/poky/meta/recipes-core/udev/eudev_3.2.10.bb
SUMMARY = "eudev is a fork of systemd's udev"
HOMEPAGE = "https://wiki.gentoo.org/wiki/Eudev"
DESCRIPTION = "eudev is Gentoo's fork of udev, systemd's device file manager for
the Linux kernel. It manages device nodes in /dev and handles all user space
actions when adding or removing devices."
...
PROVIDES = "udev"
...
$ cat sources/poky/meta/recipes-core/systemd/systemd_250.5.bb
require systemd.inc

PROVIDES = "udev"
...
```

Trong cả hai recipe, `PROVIDES` đều được đặt thành `udev`, vì vậy cả hai recipe đều có thể có alias với tên chung là `udev`.

Điều này hữu ích khi nhiều hơn một package cung cấp một chức năng chung, và chúng ta muốn yêu cầu phụ thuộc vào chức năng đó thay vì vào tên package hiện thực nó.

> Khi build một package, tên recipe `PN` luôn được ngầm prepend vào `PROVIDES`, vì vậy các thiết lập ở trên với dấu `=` hoàn toàn hoạt động được; tuy nhiên, để tránh nhầm lẫn, chúng ta nên dùng dấu `+=` trực quan hơn.

Trong ví dụ, chức năng chung là `udev`, được cung cấp bởi cả package `eudev` lẫn `systemd`, vì vậy một recipe thứ ba cần chức năng `udev` có thể dùng thiết lập `DEPENDS` sau thay vì chỉ định một tên package:

```
DEPENDS = "udev"
```

Khi đó developer có thể xác định recipe nào được ưu tiên và do đó cung cấp chức năng được yêu cầu bằng biến `PREFERRED_PROVIDER` trong một file cấu hình như dưới đây:

```
PREFERRED_PROVIDER_udev = "systemd"
```

Điều này cho phép developer tách chức năng khỏi các package hiện thực chúng (điều này sẽ rõ ràng hơn từ Chương 8 trở đi).

Ngoài việc cung cấp recipe dưới các tên thay thế, cơ chế `PROVIDES` còn được dùng để hiện thực các virtual target. Các virtual target này đã được giới thiệu trong Mục 3.4.2 khi chúng ta nhắc đến các target `virtual/xserver` hoặc `virtual/kernel`, nơi chúng tương ứng với một chức năng cụ thể nào đó (trong ví dụ là X server và Linux). Các recipe cung cấp chức năng đang xét liệt kê các virtual target trong `PROVIDES`, còn các recipe phụ thuộc vào chức năng đang xét có thể đưa các virtual target vào `DEPENDS` để để ngỏ việc chọn provider. Như ở trên, biến `PREFERRED_PROVIDER` được dùng để chọn recipe cụ thể nào cung cấp một virtual target.

Bây giờ, là vấn đề cuối cùng của mục này, chúng ta nên có cái nhìn in-depth hơn về biến `SRC_URI`. Chúng ta đã nói rằng biến này cho BitBake biết cần lấy những file nào cho quá trình build và lấy chúng như thế nào. Tuy nhiên, đã đến lúc làm một số ví dụ để hiểu rõ cách dùng nó.

> Để giữ phần giải thích đơn giản và tập trung vào các chế độ sử dụng chính, chúng ta không trình bày mọi tổ hợp có thể có cho biến `SRC_URI`. Bạn đọc có thể xem `https://docs.yoctoproject.org/bitbake/2.6/bitbake-user-manual/bitbake-user-manual-ref-variables.html#term-SRC_URI` để có tài liệu tham khảo đầy đủ.

Trong biến `SRC_URI`, chúng ta có thể chỉ định một danh sách các URI protocol mà BitBake phải dùng để fetch code. Dưới đây là danh sách các protocol được dùng nhiều nhất (và cũng được dùng trong sách này):

- `file://`: Fetch các file từ máy local nơi recipe nằm (thường là một thư mục con trong thư mục chính của recipe)

- `ftp://`, `sftp://`, `http://` và `https://`: Fetch các file từ Internet, lần lượt dùng protocol FTP, SFTP, HTTP hoặc HTTPS

- `git://`: Fetch các file từ một Git revision control repository

Tùy theo protocol được chọn (hay, theo cách gọi trong Yocto Project, fetcher), có thể chỉ định nhiều tham số URL khác nhau, và dưới đây chúng ta sẽ trình bày một số ví dụ (một lần nữa, để có danh sách đầy đủ, bạn đọc có thể xem `https://docs.yoctoproject.org/bitbake/2.6/bitbake-user-` `manual/bitbake-user-manual-fetching.html#fetchers`).

Với `file://`, chúng ta có thể chỉ định một tên file tương đối hoặc tuyệt đối như dưới đây:

```
SRC_URI = "file://relative_filename"
SRC_URI = "file:///path/to/absolute_filename"
```

Nếu tên file là tương đối, tức là được chỉ định với hai dấu gạch chéo (`/`) sau `file:`, nội dung của biến `FILESPATH` được dùng theo cùng cách `PATH` được dùng để tìm file thực thi. Build system tìm lần lượt trong các thư mục sau, được giả định là thư mục con của thư mục chứa file recipe (`.bb`) hoặc append file (`.bbappend`). Nhiều tên được tìm theo mặc định (tức là đã có trong `FILESPATH`):

- `${BPN}`: Tên recipe cơ sở, không có hậu tố đặc biệt hay số phiên bản

- `${BP}-${BPN}-${PV}`: Tên recipe cơ sở và phiên bản, nhưng không có hậu tố đặc biệt nào của tên package

- `files`: Một thư mục tên là `files` nằm cạnh recipe hoặc append file

Nếu không tìm thấy file, nó được giả định là có sẵn trong thư mục do biến `DL_DIR` chỉ định. Ngược lại, nếu tên file là tuyệt đối, tức là được chỉ định với ba dấu gạch chéo (`/`) sau `file:`, chúng ta không có lựa chọn nào khác, và file phải được đặt đúng như chỉ định, nếu không sẽ lỗi.

> Lưu ý rằng nếu chỉ định một thư mục, toàn bộ thư mục đó sẽ được giải nén!

Dùng `ftp://`, `sftp://`, `http://` và `https://` khá hiển nhiên, và dưới đây là một số ví dụ:

```
SRC_URI = "ftp://example.com/tarball.lz"
SRC_URI = "sftp://host.example.com/dir/path.file.txt"
SRC_URI = "http://example.com/tarball.zip"
SRC_URI = "https://host.example.com/dir/path.file.xz"
```

Với fetcher ở trên, chúng ta cũng có thể chỉ định tham số `downloadfilename`, tham số cho phép fetcher lưu file đã tải về dưới một tên file tùy biến được chỉ định trong thư mục `DL_DIR`. Điều này hữu ích để tránh xung đột trong `DL_DIR` khi làm việc với nhiều file có cùng tên. Dưới đây là hai ví dụ đơn giản:

```
SRC_URI = https://somewhere.org/example/1.0.0/example;downloadfilename=
some-example-1.0.0.tgz"
SRC_URI = "http://www.netlib.org/benchmark/linpackc.new;downloadfilenam
e=linpacknew.c"
```

Ví dụ thứ nhất đổi tên file tải về `example` thành `some-example-1.0.0.tgz` phù hợp (và hữu ích) hơn, còn ví dụ thứ hai đổi cái tên ngớ ngẩn `linpackc.new` thành `linpacknew.c` hợp lý hơn.

Vì các tham số URL được ngăn cách bằng dấu chấm phẩy, điều này có thể gây mơ hồ khi parse các URL cũng chứa dấu chấm phẩy, ví dụ:

```
SRC_URI = "https://gcc.gnu.org/git/gitweb.cgi?p=gcc/gcc.git;a=snapshot;
h=bd5e88"
```

URL này nên được sửa bằng cách thay dấu chấm phẩy bằng ký tự ampersand (`&`) như dưới đây:

```
SRC_URI = "https://gcc.gnu.org/git/gitweb.cgi?p=gcc/gcc.git&a=snapshot&
h=bd5e88"
```

Trong hầu hết các trường hợp, cách này sẽ hoạt động, nhưng do bản chất của URL, chúng ta có thể phải chỉ định cả tên của file tải về:

```
SRC_URI = "https://gcc.gnu.org/git/gitweb.cgi?p=gcc/gcc.git&a=snapshot&
h=bd5e88;downloadfilename=gcc-2.1.bz2"
```

Như đã nói trước đó, nếu chỉ tới một archive trong fetcher, và nó giải nén code vào một thư mục có tên khác `${BPN}-${PV}` (giả sử nó giải nén vào `dir`), thì `S` nên được đặt tương ứng (như trong ví dụ):

```
S = "${WORKDIR}/dir"
```

Hơn nữa, trong những trường hợp đặc biệt, chúng ta có thể chỉ định username và password trong `SRC_URI` như dưới đây:

```
SRC_URI = "https://giometti:password@www.enneenne.com/secret/data.gz"
```

> Dạng tổng quát của một fetcher là
>
> ```
> SRC_URI = "<fetcher>://[user:[password]@]<location>/<path>;<param
> s>"
> ```
>
> Cũng lưu ý rằng với fetcher `sftp://`, password trong URI không được hỗ trợ; hãy dùng SSH key để xác thực.
>
> Hơn nữa, nếu biến `BB_CHECK_SSL_CERTS` được đặt thành `0`, việc kiểm tra SSL certificate sẽ bị tắt. Tất nhiên, biến này mặc định là `1`.

Tải file từ Web không đáng tin cậy, và tính toàn vẹn của file có tầm quan trọng then chốt cho việc tái tạo các bản build. Trong trường hợp này, code của fetcher có thể kiểm tra checksum SHA-256 và MD5 để bảo đảm các archive đã được tải về đúng. Chúng ta có thể chỉ định các checksum này bằng một số flag variable `SRC_URI[]`, như dưới đây:

```
SRC_URI[md5sum] = <value>
SRC_URI[sha256sum] = <value>
```

hoặc trực tiếp trong biến `SRC_URI` (tương tự `LIC_FILES_CHKSUM`) như dưới đây:

```
SRC_URI = "http://example.com/foo.tgz;md5sum=4a8e0f237e961fd7785d19d07f
db994d"
```

Điều này hữu ích khi có nhiều URI; tuy nhiên, trong trường hợp này, cũng có thể chỉ định checksum bằng cách đặt tên cho các URL như dưới đây:

```
SRC_URI = "http://example.com/foo.tgz;name=foo"
SRC_URI[foo.md5sum] = 4a8e0f237e961fd7785d19d07fdb994d
```

> Nếu `BB_STRICT_CHECKSUM` được đặt, mọi lần tải về không có checksum sẽ gây ra một error message.

Fetcher `git://` lấy code từ hệ thống quản lý source Git và tạo một bare clone của remote vào thư mục `GITDIR`, thường là `DL_DIR/git2`. Bare clone này sau đó được clone vào work directory trong giai đoạn unpack, khi một tree cụ thể được check out.

Fetcher này hỗ trợ nhiều tham số, và dưới đây là những tham số được dùng nhiều nhất (xem danh sách đầy đủ tại `https://docs.yoctoproject.org/bitbake/2.6/bitbake-user-manual/bitbake-user-manual-fetching.html#git-` `fetcher-git`):

- `protocol`: Được dùng để chỉ định protocol dùng để fetch file. Mặc định là `git` khi có hostname, còn nếu không có thì mặc định là `file`. Các giá trị hợp lệ khác là `http`, `https`, `ssh` và `rsync`.

- `destsuffix`: Chỉ định tên thư mục để đặt bản checkout. Mặc định là `git/` (xem bên dưới để có ví dụ mà tham số này có thể hữu ích).

- `branch`: Chỉ định branch (hoặc các branch – xem bên dưới) của Git tree cần clone. Mặc định là `master`.

- `tag` hoặc `rev`: Chỉ định một tag dùng cho checkout. Lưu ý rằng để phân giải đúng tag, BitBake phải truy cập mạng, vì vậy tag thường không được dùng.

- `nobranch`: Khi fetch source từ một Git repository, BitBake sẽ kiểm tra giá trị `SRCREV` so với branch được chỉ định; tuy nhiên, nếu cần bỏ qua việc kiểm tra này (trong trường hợp đang fetch một revision tương ứng với một tag không nằm trên branch nào), chúng ta có thể thêm thiết lập `nobranch=1`.

Các ví dụ điển hình của fetcher này ở dưới đây:

```
SRC_URI = "git://git.yoctoproject.org/git/poky;protocol=http"
SRC_URI = "git://github.com/asciidoc/asciidoc-py;protocol=https;branch=
main"
```

Cần một lưu ý đặc biệt cho protocol `ssh`. Thật vậy, URL được mong đợi trong `SRC_URI` khác với URL thường được truyền cho lệnh `git` `clone`. Ví dụ, để clone repository mesa qua SSH, chúng ta nên dùng lệnh dưới đây:

```
$ git clone git@gitlab.freedesktop.org:mesa/mesa.git
```

Tuy nhiên, trong `SRC_URI` chúng ta nên chỉ định như sau:

```
SRC_URI = "git://git@gitlab.freedesktop.org/mesa/mesa.git;branch=main;p
rotocol=ssh;..."
```

> Lưu ý rằng ký tự dấu hai chấm (`:`) đã được đổi thành dấu gạch chéo (`/`) trước đường dẫn tới project.

Như đã nói trước đó, khi dùng fetcher `git://`, biến `S` nên được đặt tương ứng:

```
S = "${WORKDIR}/git"
```

Và khi có nhiều hơn một repository cần tải, chúng ta có thể làm giống như recipe `tvm_0.7.0.bb`, như dưới đây:

```
$ cat sources/meta-imx/meta-ml/recipes-libraries/tvm/tvm_0.7.0.bb
...
SRCBRANCH = "lf-5.15.71_2.2.0"
TVM_SRC ?= "git://github.com/nxp-imx/eiq-tvm-imx.git;protocol=https"
SRC_URI = "${TVM_SRC};branch=${SRCBRANCH}\
               git://github.com/dmlc/dlpack;protocol=https;nobranch=1;d
estsuffix=${S}/3rdparty/dlpack;name=dlpack \
               git://github.com/dmlc/dmlc-core;protocol=https;nobranch=
1;destsuffix=${S}/3rdparty/dmlc-core;name=dmlc-core \
               git://github.com/agauniyal/rang;protocol=https;nobranch=
1;destsuffix=${S}/3rdparty/rang;name=rang \
               git://github.com/apache/incubator-tvm-vta;protocol=https
;nobranch=1;destsuffix=${S}/3rdparty/vta-hw;name=vta-hw \
               file://0001-tvm-CMakeLists.txt-Use-CMAKE-variables-for-l
ibs-inst.patch \
               file://tvm_runtime.pc.in \
"

SRCREV = "32c38730216147966f8d65f99b0c2d814fb8509b"
SRCREV_dlpack = "3ec04430e89a6834e5a1b99471f415fa939bf642"
SRCREV_dmlc-core = "6c401e242c59a1f4c913918246591bb13fd714e7"
SRCREV_rang = "cabe04d6d6b05356fa8f9741704924788f0dd762"
SRCREV_vta-hw = "87ce9acfae550d1a487746e9d06c2e250076e54c"

S = "${WORKDIR}/git"
...
```

Trong ví dụ này, chúng ta chỉ định nhiều Git repository để fetch, và nhờ dùng tham số `destsuffix`, chúng ta sẽ có cấu trúc thư mục cho source như dưới đây:

```
$ tree -L 1 tmp/work/armv8a-poky-linux/tvm/0.7.0-r0/git/3rdparty/
tmp/work/armv8a-poky-linux/tvm/0.7.0-r0/git/3rdparty/
├── cma
├── compiler-rt
├── dlpack
├── dmlc-core
├── libcrc
├── picojson
├── rang
└── vta-hw

8 directories, 0 files
```

Cũng lưu ý các biến `SRCREV_<name>` được dùng để chỉ định commit ID khác nhau cho mỗi repository.

Cuối cùng, vài lời về xác thực. Việc chỉ định password trực tiếp trong các URL `git://` không được hỗ trợ vì lý do bảo mật, và SSH key, các file `~/.netrc` và `~/.ssh/config` có thể dễ dàng được dùng làm giải pháp thay thế (bạn đọc có thể tìm thêm thông tin về các tùy chọn này trong tài liệu của SSH).

### 6.3.3 Quy tắc build (Building Rules)

Các quy tắc build được dùng để chỉ định mọi thông tin cần thiết để build source. Phần này chứa các biến phù hợp, chúng ta có thể chỉ định một số directive `inherit` để nạp các class hỗ trợ cụ thể (xem Mục 5.4.2) và các task build như `do_configure` hoặc `do_compile`, v.v., được giới thiệu dưới đây nhưng được giải thích trong mục riêng, Mục 6.4.

Về các biến, chúng phụ thuộc vào các build class được kế thừa, vì vậy ở đây chúng ta trình bày những biến được dùng nhiều nhất:

- `EXTRA_OECONF`: Dùng cho các tùy chọn bổ sung của configure script khi dùng Autotools.

- `EXTRA_OEMAKE`: Dùng cho các tùy chọn bổ sung của GNU make. Mặc định là chuỗi rỗng.

- `EXTRA_OECMAKE`: Dùng cho các tùy chọn bổ sung của CMake. Mặc định là chuỗi rỗng.

- `PACKAGECONFIG_CONFARGS`: Dùng cho các tùy chọn configure bổ sung. Nó không được dùng trực tiếp, mà thông qua `PACKAGECONFIG`.

- `PACKAGECONFIG`: Nhờ nó, chúng ta có thể bật hoặc tắt các tính năng của một recipe trên cơ sở per-recipe. Cách dùng biến này (và các flag variable liên quan) rất mạnh và được giải thích bên dưới.

- `COMPATIBLE_MACHINE`: Chứa một regular expression, được so khớp với `MACHINEOVERRIDES` (xem Mục 5.3.1), cho ra một hoặc nhiều target machine mà recipe tương thích.

Vì vậy, biến này có thể được dùng để ngăn recipe được build cho các machine mà recipe không tương thích (ví dụ như với các recipe kernel hoặc bootloader).

Biến `PACKAGECONFIG` được dùng để chỉ định một danh sách space-separated các tính năng cần bật. Sau đó nhiều flag variable chỉ định hành vi của mỗi tính năng bằng cách cung cấp tối đa sáu đối số phụ thuộc thứ tự (order-dependent), ngăn cách bằng dấu phẩy. Mỗi đối số có ý nghĩa như sau:

1) Các đối số bổ sung cần được thêm vào danh sách đối số của configure script (`EXTRA_OECONF` hoặc `PACKAGECONFIG_CONFARGS`) nếu tính năng được bật

2) Giống như 1 nhưng khi tính năng bị tắt

3) Các phụ thuộc build bổ sung cần được thêm vào `DEPENDS` nếu tính năng được bật

4) Giống như 3 nhưng cho `RDEPENDS`

5) Các khuyến nghị runtime bổ sung cần được thêm vào `RRECOMMENDS` (xem bên dưới) nếu tính năng được bật

6) Mọi thiết lập `PACKAGECONFIG` xung đột (tức là loại trừ lẫn nhau) với tính năng này

> Chúng ta có thể bỏ qua bất kỳ đối số nào tùy thích, nhưng phải giữ lại các dấu phẩy ngăn cách cho đến đối số cuối cùng. Ví dụ:
>
> ```
> PACKAGECONFIG[shared] = "--enable-shared"
> PACKAGECONFIG[strip] = ",--disable-stripping"
> ```
>
> Trong ví dụ thứ nhất, chúng ta chỉ đặt đối số đầu tiên, và không cần chỉ định dấu phẩy nào, còn trong ví dụ thứ hai, chúng ta đặt đối số thứ hai, vì vậy cần ít nhất dấu phẩy đầu tiên.

Một bộ khung cho thiết lập này có thể là như sau:

```
PACKAGECONFIG ??= "f1 f2 ..."
PACKAGECONFIG[f1] = "\
    --with-f1, --without-f1, \
    build-deps-for-f1, \
    runtime-deps-for-f1, runtime-recommends-for-f1, \
    packageconfig-conflicts-for-f1"
PACKAGECONFIG[f2] = "\
    --with-f2, --without-f2, \
...
```

Tuy nhiên, để hiểu rõ hơn cách nó hoạt động, một ví dụ thực tế là tốt nhất, vì vậy chúng ta có thể xem trong recipe `cups-filters` trong layer `meta-` `openembedded`, như dưới đây:

```
$ cat meta-openembedded/meta-oe/recipes-printing/cups/cups-filters.inc
...
PACKAGECONFIG[jpeg] = "--with-jpeg,--without-jpeg,jpeg"
PACKAGECONFIG[png] = "--with-png,--without-png,libpng"
PACKAGECONFIG[tiff] = "--with-tiff,--without-tiff,tiff"

PACKAGECONFIG ??= "${@bb.utils.contains('DISTRO_FEATURES', 'zeroconf',
'avahi', '', d)}"

PACKAGECONFIG[avahi] = "--enable-avahi,--disable-avahi,avahi"
PACKAGECONFIG[dbus] = "--enable-dbus,--disable-dbus,dbus"
...
```

Nếu chỉ định (có thể qua một append file) như sau:

```
PACKAGECONFIG = "jpeg tiff"
```

thì các đối số cấu hình được truyền cho `configure` là

```
--with-jpeg --without-png --with-tiff --disable-avahi --disable-dbus
```

Và trong `DEPENDS`, chúng ta có cả hai chuỗi `jpeg` và `tiff`.

Cũng lưu ý rằng recipe có thể auto-enable hỗ trợ `avahi` bằng cách xem `DISTRO_FEATURES` với hàm `bb.utils.contains()` (xem Mục 5.1.5).

Cơ chế này rất thuyết phục, và thông thường, nếu muốn thay đổi một khối `PACKAGECONFIG` có sẵn, chúng ta có thể làm theo hai cách:

- Tạo một append file cho recipe rồi đặt hoặc append giá trị của `PACKAGECONFIG`:

  ```
  PACKAGECONFIG = "f4 f5"
  PACKAGECONFIG:append = " f4"
  ```

- Dùng một file cấu hình như `local.conf` hoặc một file `distro.conf` cụ thể với một recipe override (xem Mục 5.3.1). Nếu giả sử recipe có tên `myrecipe`, chúng ta có thể làm như dưới đây:

  ```
  PACKAGECONFIG:pn-myrecipe = "f4 f5"
  PACKAGECONFIG:append:pn-myrecipe = " f4"
  ```

Về biến `COMPATIBLE_MACHINE`, tốt hơn nên làm một ví dụ thực tế. Trong recipe Jailhouse ở layer `meta-imx`, chúng ta có thể thấy thiết lập sau:

```
$ cat meta-imx/meta-sdk/recipes-extended/jailhouse/jailhouse_0.2.bb
...
COMPATIBLE_MACHINE = "(mx8m-nxp-bsp|mx8ulp-nxp-bsp|mx93-nxp-bsp)"
...
```

Bằng cách này, chúng ta ngăn việc compile recipe này cho các machine không tương thích với `mx8m-nxp-bsp`, `mx8ulp-nxp-bsp` hoặc `mx93-nxp-bsp`.

Sau khi thiết lập các biến ở trên, trong phần quy tắc build này, chúng ta cũng nên đặt các task của recipe, như `do_compile`, `do_install`, v.v. Một ví dụ tốt được trình bày trong recipe `avahi` ở layer `poky`:

```
$ cat poky/meta/recipes-connectivity/avahi/avahi_0.8.bb
...
do_configure:prepend() {
    # This m4 file will get in the way of our introspection.m4 with
    # special cross-compilation fixes
    rm "${S}/common/introspection.m4" || true
}
do_compile:prepend() {
    export GIR_EXTRA_LIBS_PATH="${B}/avahi-gobject/.libs:${B}/avahi-com
mon/.libs:${B}/avahi-client/.libs:${B}/avahi-glib/.libs"
}
...
do_install() {
        autotools_do_install
        rm -rf ${D}/run
        rm -rf ${D}${datadir}/dbus-1/interfaces
        test -d ${D}${datadir}/dbus-1 && rmdir --ignore-fail-on-non-empty
 ${D}${datadir}/dbus-1
        rm -rf ${D}${libdir}/avahi

        # Move example service files out of /etc/avahi/services so we
      # don't advertise ssh & sftp-ssh by default
        install -d ${D}${docdir}/avahi
        mv ${D}${sysconfdir}/avahi/services/* ${D}${docdir}/avahi
}
...
```

Trong ví dụ trên, chúng ta có một sự định nghĩa lại hoàn toàn task `do_install`, còn task `do_configure` và task `do_compile` được prepend với code đặc biệt.

Tuy nhiên, vì hầu hết các task thông thường đều có thân mặc định, hầu hết recipe đơn giản là không chỉ định gì ở đây (dù việc một recipe append, prepend hoặc viết lại một hoặc nhiều task là khá phổ biến). Vì đây là một chủ đề thiết yếu để hiểu cách viết recipe tốt, chúng ta sẽ thảo luận chi tiết nó trong Mục 6.4.

Bây giờ hãy đi tiếp để xem phần thông tin đóng gói của một recipe.

### 6.3.4 Thông tin đóng gói (Packaging Information)

Trong phần cuối này, chúng ta có thể đặt mọi thông tin cần thiết để tạo mọi package chứa các chương trình và dữ liệu liên quan cần để thực thi một task cụ thể. Các biến chúng ta có thể thấy ở đây được liệt kê dưới đây:

- `PACKAGES`: Chứa danh sách các package mà recipe tạo ra. Mặc định là danh sách sau, vì vậy trong trường hợp thông thường, chúng ta có thể để nguyên biến này (trong Mục 9.3, chúng ta sẽ trình bày cách dùng nó):

  ```
  ${PN}-src ${PN}-dbg ${PN}-staticdev ${PN}-dev ${PN}-doc
  ${PN}-locale ${PACKAGE_BEFORE_PN} ${PN}
  ```

  Các package này được Yocto build system tự động tạo ra, và chúng có thể được dùng cho mục đích debug (`-dev`, `-dbg` và `-src`), cho phát triển (`-dev` và `-staticdev`), cho tài liệu (`-doc`), v.v.

> Bằng `PACKAGE_BEFORE_PN`, chúng ta có thể chỉ định các package được tạo trước package mặc định có tên `PN`, để các package được thêm đó có thể lấy các file mà bình thường sẽ được đưa vào package mặc định.

- `FILES`: Chứa danh sách các file và thư mục được đặt vào một package. Bạn đọc nên chú ý rằng nó không thể được dùng trực tiếp, mà chỉ bằng cách cung cấp một package name override xác định package kết quả. Ví dụ:

  ```
  FILES:${PN} = "${bindir}/foo"
  FILES:${PN}-libs += "${libdir}/libfoo ${libdir}/libdir/libfoobar"
  ```

> Khi chỉ định file hoặc đường dẫn, chúng ta có thể dùng cú pháp glob của Python để khớp với nhiều file.

- `ALTERNATIVE`: Đôi khi, cùng một lệnh được cung cấp trong nhiều package. Trong tình huống này, build system cần dùng alternative system để tạo một lược đồ đặt tên binary khác, để các lệnh có thể cùng tồn tại. Trong biến này, chúng ta có thể liệt kê các lệnh trong một package cần lược đồ như vậy.

  Cũng như `FILES`, để dùng biến này, chúng ta phải cung cấp một package name override xác định package kết quả. Ví dụ, recipe `tar` có thiết lập alternative sau:

  ```
  $ cat poky/meta/recipes-extended/tar/tar_1.34.bb
  ...
  PACKAGES =+ "${PN}-rmt"
  FILES:${PN}-rmt = "${sbindir}/rmt*"

  inherit update-alternatives

  ALTERNATIVE_PRIORITY = "100"
  ALTERNATIVE:${PN} = "tar"
  ALTERNATIVE:${PN}-rmt = "rmt"
  ...
  ```

  Ở đây, chúng ta định nghĩa một package đặc biệt `tar-rmt`, và sau đó có thể thấy một ví dụ về các thiết lập `ALTERNATIVE` cho cả hai package `tar` và `tar-rmt` (xem bên dưới để có giải thích rõ hơn về cách dùng lược đồ alternative này).

- `CONFFILES`: Xác định các file cấu hình là một phần của package mà hệ thống quản lý package (PMS) nên xem là đặc biệt; nói cách khác, các file này có thể thay đổi sau khi cài đặt, và chúng ta không muốn đặt lại chúng trong quá trình cập nhật package; chúng ta muốn được cảnh báo trước khi PMS ghi đè chúng trong quá trình cập nhật.

  Một cách dùng khả dĩ của `CONFFILES` được trình bày dưới đây:

  ```
  CONFFILES:${PN} += " \
      ${sysconfdir}/file1.conf \
      ${sysconfdir}/file2.conf \
  "
  ```

  Có một mối quan hệ giữa các biến `CONFFILES` và `FILES`. Thật vậy, mọi file được liệt kê trong `CONFFILES` cũng phải có mặt trong `FILES`, vì các file cấu hình chỉ đơn giản được đánh dấu để PMS không ghi đè chúng.

- `RPROVIDES`: Chỉ định một danh sách alias tên package mà một package cũng cung cấp để thỏa mãn phụ thuộc runtime của các package khác, cả trong quá trình build lẫn trên target (như được chỉ định bởi `RDEPENDS` – xem bên dưới). Theo mặc định, tên của chính package đã ngầm có trong danh sách.

  Như với mọi biến package-controlling, chúng ta luôn phải dùng biến này với một package name override:

  ```
  RPROVIDES:${PN}-mkimage = "u-boot-mkimage"
  ```

- `RDEPENDS`: Chỉ định một danh sách phụ thuộc runtime của một package. Nó cũng luôn phải được dùng với một package name override; tuy nhiên, các loại phụ thuộc runtime thông thường nhất của package đều được tự động phát hiện và thêm vào, vì vậy hầu hết recipe không cần đặt `RDEPENDS` (xem bên dưới để có giải thích rõ hơn):

  ```
  RDEPENDS:${PN}-tftpd += "xinetd"
  ```

- `RRECOMMENDS`: Được dùng với một package name override; nó chỉ định một danh sách package mở rộng khả năng sử dụng của package đang được build. Các package được liệt kê ở đây không phải là phụ thuộc runtime của package (đã có `RDEPENDS` để làm việc đó), mà package dùng chúng để mở rộng khả năng sử dụng. Một lưu ý thú vị cho biến này là nó hỗ trợ định dạng sau:

  ```
  RRECOMMENDS:${PN} = "package (operator version)"
  ```

  trong đó `operator` có thể là `=`, `<`, `>`, `<=` hoặc `>=`. Ví dụ, đoạn sau thiết lập một khuyến nghị cho phiên bản 4.2 hoặc lớn hơn của package foo:

  ```
  RRECOMMENDS:${PN} = "foo (>= 4.2)"
  ```

- `RSUGGESTS`: Chỉ định một danh sách package bổ sung mà recipe gợi ý package manager cài vào thời điểm một package được cài (lưu ý rằng không phải package manager nào cũng hỗ trợ chức năng này!):

  ```
  RSUGGESTS:${PN} = "useful_package1 useful_package2"
  ```

- `RCONFLICTS`: Chỉ định một danh sách package xung đột với các package, vì vậy một package không thể được cài nếu các package xung đột không được gỡ bỏ trước:

  ```
  RCONFLICTS:${PN} = "conflicting_package1 conflicting_package2"
  ```

  Biến này hỗ trợ đánh phiên bản giống như `RRECOMMENDS`.

- `BBCLASSEXTEND`: Cho phép Yocto developer mở rộng một recipe để nó build các biến thể của software. Ví dụ, nó có thể được dùng để build một phiên bản native của recipe, tức là một bản sao của recipe được build riêng để chạy trên build system (chúng ta sẽ xem cách quản lý các recipe như vậy trong Mục 11.6).

Như đã thấy ở một mục trên với `PROVIDES` và `DEPENDS`, các biến `RDEPENDS` và `RPROVIDES` hoạt động theo cùng cách. Thật vậy, trong chính các recipe ở ví dụ trên, chúng ta cũng có thể thấy

```
$ cat poky/meta/recipes-core/udev/eudev_3.2.10.bb
SUMMARY = "eudev is a fork of systemd's udev"
HOMEPAGE = "https://wiki.gentoo.org/wiki/Eudev"
DESCRIPTION = "eudev is Gentoo's fork of udev, systemd's device file man
ager for the Linux kernel. It manages device nodes in /dev and handles a
ll user space actions when adding or removing devices."
...
RPROVIDES:${PN} = "hotplug udev"
...
$ cat poky/meta/recipes-core/systemd/systemd_250.5.bb
require systemd.inc
...
RPROVIDES:udev = "hotplug"
```

Cả hai recipe đều báo cho Yocto build system biết rằng chúng cung cấp chức năng `hotplug` lúc runtime. Vì vậy khi một package chỉ định `hotplug` trong thiết lập `RDEPENDS` của mình, build system sẽ tiếp tục đúng nếu ít nhất một trong các package trên có sẵn.

> Lưu ý rằng `RDEPENDS:${PN}-dev` theo mặc định tự động bao gồm `${PN}`, vì vậy chúng ta phải cẩn thận không vô tình bỏ `${PN}` khi sửa `RDEPENDS:${PN}-dev`. Để làm vậy, chúng ta nên dùng toán tử `+=` thay vì toán tử `=` trong recipe của mình.

Về lược đồ alternative, chúng ta đã thấy rằng nó phụ thuộc vào các biến `ALTERNATIVE`, nhưng không chỉ vậy; thật vậy, một ví dụ tốt nằm trong các recipe `systemd` (vẫn trong layer `poky`) như dưới đây:

```
$ cat poky/meta/recipes-core/systemd/systemd_250.5.bb:
...
ALTERNATIVE:${PN} = "halt reboot shutdown poweroff runlevel ${@bb.utils
.contains('PACKAGECONFIG', 'resolved', 'resolv-conf', '', d)}"

ALTERNATIVE_TARGET[resolv-conf] = "${sysconfdir}/resolv-conf.systemd"
ALTERNATIVE_LINK_NAME[resolv-conf] = "${sysconfdir}/resolv.conf"
ALTERNATIVE_PRIORITY[resolv-conf] ?= "50"

ALTERNATIVE_TARGET[halt] = "${base_bindir}/systemctl"
ALTERNATIVE_LINK_NAME[halt] = "${base_sbindir}/halt"
ALTERNATIVE_PRIORITY[halt] ?= "300"

ALTERNATIVE_TARGET[reboot] = "${base_bindir}/systemctl"
ALTERNATIVE_LINK_NAME[reboot] = "${base_sbindir}/reboot"
ALTERNATIVE_PRIORITY[reboot] ?= "300"
ALTERNATIVE_TARGET[shutdown] = "${base_bindir}/systemctl"
ALTERNATIVE_LINK_NAME[shutdown] = "${base_sbindir}/shutdown"
ALTERNATIVE_PRIORITY[shutdown] ?= "300"

ALTERNATIVE_TARGET[poweroff] = "${base_bindir}/systemctl"
ALTERNATIVE_LINK_NAME[poweroff] = "${base_sbindir}/poweroff"
ALTERNATIVE_PRIORITY[poweroff] ?= "300"

ALTERNATIVE_TARGET[runlevel] = "${base_bindir}/systemctl"
ALTERNATIVE_LINK_NAME[runlevel] = "${base_sbindir}/runlevel"
ALTERNATIVE_PRIORITY[runlevel] ?= "300"
...
```

Trước tiên, chúng ta nên chú ý cách có thể đặt biến một cách động tùy theo một số thiết lập đặc biệt trong `PACKAGECONFIG`, sau đó chúng ta có thể thấy rằng với mỗi tên alternative, chúng ta có thể chỉ định các flag variable sau:

- `ALTERNATIVE_LINK_NAME`: Được dùng để ánh xạ các lệnh trùng lặp tới vị trí thực tế. Một ví dụ tốt để làm rõ khái niệm này là lệnh bracket, có thể được cung cấp bởi cả package Coreutils lẫn BusyBox. Trong trường hợp này, chúng ta phải dùng biến `ALTERNATIVE_LINK_NAME` để chỉ định vị trí thực tế, như dưới đây:

  ```
  ALTERNATIVE_LINK_NAME[bracket] = "${bindir}/["
  ```

  Nếu không được chỉ định, nó mặc định là `${bindir}/name`.

- `ALTERNATIVE_TARGET`: Được dùng để tạo vị trí link mặc định cho các lệnh trùng lặp. Một ví dụ tốt nằm trong recipe `bash`:

  ```
  $ cat sources/poky/meta/recipes-extended/bash/bash.inc:
  ...
  ALTERNATIVE:${PN} = "bash sh"
  ALTERNATIVE_LINK_NAME[bash] = "${base_bindir}/bash"
  ALTERNATIVE_TARGET[bash] = "${base_bindir}/bash"
  ALTERNATIVE_LINK_NAME[sh] = "${base_bindir}/sh"
  ALTERNATIVE_TARGET[sh] = "${base_bindir}/bash.${BPN}"
  ALTERNATIVE_PRIORITY = "100"
  ...
  ```

  Ở đây, chúng ta định nghĩa hai alternative cho package `bash`, và với cả hai, chúng ta định nghĩa một `ALTERNATIVE_LINK_NAME` và một `ALTERNATIVE_TARGET`. Lưu ý rằng vì với tên alternative `bash`, `ALTERNATIVE_LINK_NAME` và `ALTERNATIVE_TARGET` giống nhau, nên target của `ALTERNATIVE_TARGET[bash]` được build system tự động append chuỗi `.${BPN}` (đó là lý do với `sh` chúng ta phải tự làm việc đó bằng tay).

  Nếu `ALTERNATIVE_TARGET` không được định nghĩa, thì nó mặc định bằng biến `ALTERNATIVE_LINK_NAME`.

  Các dạng cú pháp có thể dùng cho biến này là:

  ```
  ALTERNATIVE_TARGET = "target"
  ALTERNATIVE_TARGET[name] = "target"
  ALTERNATIVE_TARGET_pkg[name] = "target"
  ```

> Với dạng cuối, chúng ta muốn nói đến thứ như dưới đây:
>
> ```
> ALTERNATIVE_TARGET_${PN}  = "${bindir}/foo"
> ALTERNATIVE_TARGET_${PN}-lib  = "${libdir}/libfoo"
> ```

- `ALTERNATIVE_PRIORITY`: Được dùng để tạo độ ưu tiên mặc định cho các lệnh trùng lặp. Các dạng cú pháp có thể dùng cho biến này (như với `ALTERNATIVE_TARGET`) là:

  ```
  ALTERNATIVE_PRIORITY = "priority"
  ALTERNATIVE_PRIORITY[name] = "priority"
  ALTERNATIVE_PRIORITY_pkg[name] = "priority"
  ```

Trước khi kết thúc mục này, chúng ta nên nhắc đến các package `-dbg` và giải thích một điều có thể hữu ích, đặc biệt trong các giai đoạn phát triển. Theo mặc định, Yocto build system strip các symbol khỏi các binary mà nó đóng gói, vì vậy trong quá trình phát triển, hành vi này có thể gây khó khăn khi dùng một số công cụ debug. Chúng ta có thể ngăn điều đó bằng cách đặt biến `INHIBIT_PACKAGE_STRIP` thành `1` trong file cấu hình `local.conf`; tuy nhiên, thiết lập này sẽ làm tăng đáng kể kích thước image!

Tuy nhiên, chúng ta nên lưu ý rằng với mỗi package, build system cũng tạo ra package `-dbg` tương ứng, chứa cùng các file thực thi của package chính nhưng có đầy đủ debugging symbol. Vì vậy chúng ta có thể cài thủ công các package debug (`-dbg`) cho những ứng dụng sẽ debug và tiết kiệm dung lượng trên hệ thống.

Chúng ta cũng có thể yêu cầu build system auto-add các package `-dbg` cụ thể vào image hiện tại bằng cách append từng package debug vào `IMAGE_INSTALL`, hoặc bằng cách thêm mọi package debug qua image feature `dbg-` `pkgs` vào biến `EXTRA_IMAGE_FEATURES` trong `local.conf`. Ví dụ, trong file `conf/local.conf`, chúng ta có thể làm như dưới đây:

```
--- conf/local.conf
+++ conf/local.conf
@@ -23,6 +23,7 @@
 # Switch to Debian packaging and include package-management in the image
 PACKAGE_CLASSES = "package_ipk"
 EXTRA_IMAGE_FEATURES += "package-management"
+EXTRA_IMAGE_FEATURES += "dbg-pkgs"

 # Limiting HW resources
 BB_NUMBER_THREADS = "4"
```

> Lưu ý rằng thiết lập này sẽ làm tăng đáng kể kích thước image cuối cùng, vì vậy chúng ta sẽ cần một thẻ microSD lớn hơn để có thể ghi thành công toàn bộ image lên đó. Ví dụ, khi bật tính năng `dbg-pkgs`, lúc thử ghi lên thẻ microSD 8GB quen thuộc, chúng ta đã nhận được
>
> ```
> $ zstdcat tmp/deploy/images/imx8mp-icore-cy/engicam-evaluation-ima
> ge-mx8-imx8mp-icore-cy.wic.zst | sudo dd of=$DISK bs=8M conv=fdata
> sync status=progress
> 8025341952 bytes (8,0 GB, 7,5 GiB) copied, 14 s, 573 MB/s
> dd: error writing '/dev/sdd': No space left on device
> ...
> ```
>
> Vì vậy bạn đọc nên cân nhắc không bật nó trong `local.conf` hoặc dùng một thẻ microSD lớn hơn.

Ngoài ra, chúng ta cũng có thể chỉ định cách tách và đóng gói thông tin debug và source khi tạo các package debug để dùng, ví dụ, với GNU Project Debugger (GDB). Chúng ta có thể dùng biến `PACKAGE_DEBUG_SPLIT_STYLE` trong file cấu hình `local.conf` với các tùy chọn sau:

- `.debug`: Với tùy chọn này, mọi thông tin debug và source được đặt trong một file package `-dbg` duy nhất. Mọi file debug symbol được đặt trong một thư mục `.debug` cạnh các binary, sao cho nếu một binary được cài vào `/bin`, thì file debug symbol tương ứng được cài vào `/bin/.debug` (còn các file source được cài vào `/usr/src/debug`). Đây là hành vi mặc định nếu không có gì được định nghĩa (tuy nhiên, nó thường được distro Poky đặt – xem bên dưới).

> Chú ý ký tự dấu chấm (`.`) ở đầu tên tùy chọn.

- `debug-file-directory`: Tùy chọn này hoạt động như trên, nhưng giờ mọi file debug symbol được đặt hoàn toàn trong thư mục `/usr/lib/debug` và được phân tách theo đường dẫn nơi binary được cài. Giờ nếu một binary được cài vào `/bin`, thì các debug symbol tương ứng được cài vào `/usr/lib/debug/bin`.

- `debug-with-srcpkg`: Với tùy chọn này, mọi thông tin debug được đặt trong package `-dbg` tiêu chuẩn như với tùy chọn `.debug`, còn source được đặt trong một package `-src` riêng. Đây là thiết lập mặc định cho biến này, như được định nghĩa trong file `bitbake.conf` của Poky.

- `debug-without-src`: Tùy chọn này giống như trên, nhưng không có file source nào được đóng gói.

## 6.4 Các building task (The Building Tasks)

Nếu biến được dùng để bật hoặc tắt, đặt hoặc bỏ đặt các chức năng, thì các thực thể thực sự làm việc (như tạo package hoặc binary image) là task. Trong các chương trước, chúng ta đã thấy cách tạo một task và cách chạy nó, nhưng giờ là lúc xem những task cơ bản nào được tự động tạo mỗi lần chúng ta khởi động BitBake. Việc này là để tạo ra một package, hay tốt hơn là một Yocto image.

Trong sách này, chúng ta không phân tích mọi task như vậy (danh sách đầy đủ có thể xem tại `https://docs.yoctoproject.org/ref-manual/tasks.html#normal-recipe-build-tasks`), mà tập trung vào những task quan trọng nhất mà chúng ta có thể cần tùy biến để tạo một recipe mới. Thật vậy, mọi task cơ bản đều có thân mặc định đã làm điều gì đó tiêu chuẩn, nhưng chúng ta có thể cần thay đổi các mặc định đó cho phù hợp với nhu cầu của software mà chúng ta sẽ đóng gói.

Mọi thân mặc định (và thứ tự thực thi task) đều được định nghĩa trong base class ở file `sources/poky/meta/classes/base.bbclass`, và bạn đọc nên tham khảo file này để hiểu rõ Yocto Project hoạt động thế nào.

Trong sách này, chúng ta sẽ trình bày nhiều phần của file này để cho thấy mỗi task cơ bản được định nghĩa thế nào; tuy nhiên, như một phần giới thiệu ngắn, chúng ta nên lưu ý rằng thông thường một hàm của class được định nghĩa theo bố cục sau:

```
addtask taskname after do_taskdepends

# Flag variables
do_taskname[flag1] = "value1"
do_taskname[flag2] = "value2"
...

# Body
classname_do_taskname() {
    # Do some default actions
    ...
}
```

Trước tiên, chúng ta nên lưu ý rằng mọi hàm của task đều được đặt tên với tiền tố là tên class, theo sau là `do_` rồi đến một tên phù hợp. Tiếp theo, class có thể chỉ định một số hành vi đặc biệt của task bằng một hoặc nhiều flag variable cho task, sau đó nó dùng directive `addtask` để tạo task và cuối cùng chỉ định các phụ thuộc lẫn nhau với các task khác.

Tên hàm có một bố cục đặc biệt do cách một class có thể export hàm của nó trong BitBake. Thật vậy, để export một hàm được định nghĩa trong một class, BitBake dùng directive `EXPORT_FUNCTIONS`, vì vậy khi trong file `.bbclass` có câu lệnh sau, recipe kế thừa class sẽ thấy một task `do_taskname` mới:

```
EXPORT_FUNCTIONS do_taskname
```

> Trong directive `EXPORT_FUNCTIONS`, chúng ta có thể chỉ định nhiều hơn một hàm của class cần export. Ví dụ, trong `bass.bbclass` *(ghi chú: đúng là `base.bbclass`)* chúng ta có thể thấy
>
> ```
> EXPORT_FUNCTIONS do_fetch do_unpack do_configure do_compile do_ins
> tall do_package
> ```

Nếu muốn, recipe của chúng ta có thể thêm code vào đầu hoặc cuối hàm bằng các phép toán `prepend` hoặc `append`, hoặc có thể định nghĩa lại hoàn toàn hàm (như đã giải thích trong Mục 5.2.3). Tuy nhiên, nếu định nghĩa lại hàm, recipe không có cách nào gọi phiên bản của class của hàm đó. Đây là lúc directive `EXPORT_FUNCTIONS` phát huy vai trò của nó: nó cung cấp một cơ chế cho phép phiên bản hàm của recipe gọi phiên bản gốc của hàm.

Class định nghĩa hàm theo dạng `classname_taskname`; trong ví dụ của chúng ta, ta có `base_do_taskname`, sau đó, trong class file, chúng ta làm

```
EXPORT_FUNCTIONS do_taskname
```

Bây giờ, nếu recipe cần gọi phiên bản của class của task, nó nên gọi `base_do_taskname`. Chúng ta cũng có thể gọi có điều kiện phiên bản của class của hàm như sau:

```
do_foo() {
    if [ condition ] ; then
        # Call he do_taskname in base class
        base_do_taskname
    else
        # Do something else
        ...
    fi
}
```

Nhờ cơ chế này, một recipe có thể tự do chọn giữa hàm gốc, như được định nghĩa trong class file, và hàm đã sửa đổi trong recipe của chúng ta.

Giờ chúng ta có thể đi tiếp và có cái nhìn in-depth hơn về các task được định nghĩa trong base class.

### 6.4.1 Task do_fetch (The do_fetch Task)

Đây là task fetch source code bằng biến `SRC_URI` (và tiền tố của đối số của nó để xác định đúng module fetcher). Nó được định nghĩa như dưới đây:

```
addtask fetch

do_fetch[dirs] = "${DL_DIR}"
do_fetch[file-checksums] = "${@bb.fetch.get_checksum_file_list(d)}"
do_fetch[file-checksums] += " ${@get_lic_checksum_file_list(d)}"
do_fetch[vardeps] += "SRCREV"
do_fetch[network] = "1"
python base_do_fetch() {
    src_uri = (d.getVar('SRC_URI') or "").split()
    if not src_uri:
        return

    try:
        fetcher = bb.fetch2.Fetch(src_uri, d)
        fetcher.download()
    except bb.fetch2.BBFetchException as e:
        bb.fatal("Bitbake Fetcher Error: " + repr(e))
}
```

Thông thường, chúng ta không cần định nghĩa lại task này, nhưng biết nó hoạt động thế nào có thể hữu ích để giới thiệu một số thiết lập task hữu ích và để cân nhắc liệu có cần append lệnh trong các recipe tùy biến hay không.

Directive `addtask` chỉ tạo task mà không có thứ tự (đây là task đầu tiên được thực thi để tạo một package, vì vậy các task khác theo sau), còn trong phần flag variable chúng ta có

- `do_fetch[dirs] = "${DL_DIR}"`: Vì task này fetch một số code, chúng ta yêu cầu tạo download directory chính (các thư mục con sẽ được đối tượng `fetcher` tạo).

- `do_fetch[file-checksums] = "..."`: Thiết lập này được dùng để chỉ định (bởi đối tượng `fetcher` tùy theo thiết lập `SRC_URI`) một danh sách file cần kiểm tra trong khi tính checksum (giải thích chi tiết các khái niệm này nằm ngoài phạm vi của sách, và bạn đọc tò mò có thể xem user manual của BitBake).

- `do_fetch[vardeps] += "SRCREV"`: Được dùng để chỉ định sự phụ thuộc của task vào giá trị của biến `SRCREV`. Cụ thể, task sẽ được re-executed nếu giá trị của biến thay đổi.

- `do_fetch[network] = "1"`: Chỉ định rằng task có thể truy cập mạng (theo mặc định, các task không thể làm vậy).

Sau đó task chỉ đọc giá trị trong `SRC_URI` và, trong trường hợp này, gọi các hàm phù hợp để tải source.

### 6.4.2 Task do_unpack (The do_unpack Task)

Đây là task giải nén source code vào thư mục `WORKDIR` (thư mục làm việc), và nó được định nghĩa như dưới đây:

```
addtask unpack after do_fetch

do_unpack[dirs] = "${WORKDIR}"
do_unpack[cleandirs] = "${@d.getVar('S') if os.path.normpath(d.getVar('
S')) != os.path.normpath(d.getVar('WORKDIR')) else os.path.join('${S}',
 'patches')}"

python base_do_unpack() {
    src_uri = (d.getVar('SRC_URI') or "").split()
    if not src_uri:
        return

    try:
        fetcher = bb.fetch2.Fetch(src_uri, d)
        fetcher.unpack(d.getVar('WORKDIR'))
    except bb.fetch2.BBFetchException as e:
        bb.fatal("Bitbake Fetcher Error: " + repr(e))
}
```

Trước tiên, chúng ta nên lưu ý rằng giờ có thứ tự task trong directive `addtask`, và cụ thể, task `do_unpack` chạy sau `do_fetch`. Sau đó, như ở trên, chúng ta chỉ định rằng `WORKDIR` phải được tạo trước khi task chạy, nhưng giờ chúng ta còn nói rằng một thư mục rỗng mới phải được tạo trước khi task chạy, đó là thư mục `S` (nếu nó đã tồn tại, nó sẽ bị xóa rồi tạo lại để làm rỗng).

Sau đó, trong thân task, chúng ta có thể thấy cả task `do_fetch` và `do_unpack` cùng làm việc để fetch các file source và giải nén chúng vào build directory.

Task này, cũng như `do_fetch`, thường được dùng nguyên trạng và có thể được append.

### 6.4.3 Task do_configure (The do_configure Task)

Task này cấu hình source bằng cách bật và tắt mọi tùy chọn build-time và tùy chọn cấu hình cho software đang được build, và nó được định nghĩa như dưới đây:

```
addtask configure after do_patch

do_configure[dirs] = "${B}"

base_do_configure() {
    if [ -n "${CONFIGURESTAMPFILE}" -a -e "${CONFIGURESTAMPFILE}" ]; th
en
        if [ "`cat ${CONFIGURESTAMPFILE}`" != "${BB_TASKHASH}" ]; then
            cd ${B}
            if [ "${CLEANBROKEN}" != "1" -a \( -e Makefile -o -e makefi
le -o -e GNUmakefile \) ]; then
                oe_runmake clean
            fi
            # -ignore_readdir_race does not work correctly
            # with -delete; use xargs to avoid spurious
            # build failures
            find ${B} -ignore_readdir_race -name \*.la -type f -print0
| xargs -0 rm -f
        fi
    fi
    if [ -n "${CONFIGURESTAMPFILE}" ]; then
        mkdir -p `dirname ${CONFIGURESTAMPFILE}`
        echo ${BB_TASKHASH} > ${CONFIGURESTAMPFILE}
    fi
}
```

Phụ thuộc của task là chạy sau `do_patch`, và thư mục `B` là working directory của nó, còn về thân task, nó có thể trông phức tạp; tuy nhiên, hành vi mặc định của nó là chạy lệnh `oe_runmake clean` nếu tìm thấy file `Makefile`, `makefile` hoặc `GNUmakefile` và `CLEANBROKEN` không được đặt thành `1`. Ngược lại, nếu không tìm thấy file nào như vậy hoặc biến `CLEANBROKEN` được đặt thành `1`, task `do_configure` không làm gì cả.

Biến `CLEANBROKEN` có thể được dùng để chỉ định rằng lệnh `make clean` không hoạt động với software đang được build, và giờ thì khá rõ nó được dùng thế nào.

> Cần lưu ý rằng chúng ta đã nói về việc có chạy hay không lệnh `make` `clean` trong task `do_configure`, nhưng trong thân task chúng ta có lệnh `oe_runmake clean` (xem Mục 3.3.2).

Như mọi task trước, task này cũng thường không bị định nghĩa lại; thay vào đó, nó thường được điều khiển bằng cách đặt biến `EXTRA_OEMAKE` (mặc định rỗng) hoặc bằng cách định nghĩa lại nó thông qua việc kế thừa một class khác như class CMake (được định nghĩa trong file `cmake.bbclass` trong meta layer `poky`). Trong trường hợp sau, task được định nghĩa như sau:

```
cmake_do_configure() {
    if [ "${OECMAKE_BUILDPATH}" ]; then
        bbnote "cmake.bbclass no longer uses OECMAKE_BUILDPATH.  The de
fault behaviour is now out-of-tree builds with B=WORKDIR/build."
    fi

    if [ "${S}" = "${B}" ]; then
        find ${B} -name CMakeFiles -or -name Makefile -or -name cmake_i
nstall.cmake -or -name CMakeCache.txt -delete
    fi

    # Just like autotools cmake can use a site file to cache result that
    # need generated binaries to run
    if [ -e ${WORKDIR}/site-file.cmake ] ; then
        oecmake_sitefile="-C ${WORKDIR}/site-file.cmake"
    else
        oecmake_sitefile=
    fi

    cmake \
      ${OECMAKE_GENERATOR_ARGS} \
      $oecmake_sitefile \
      ${OECMAKE_SOURCEPATH} \
      -DCMAKE_INSTALL_PREFIX:PATH=${prefix} \
      -DCMAKE_INSTALL_BINDIR:PATH=${@os.path.relpath(d.getVar('bindir')
, d.getVar('prefix') + '/')} \
      -DCMAKE_INSTALL_SBINDIR:PATH=${@os.path.relpath(d.getVar('sbin\di
r'), d.getVar('prefix') + '/')} \
      -DCMAKE_INSTALL_LIBEXECDIR:PATH=${@os.path.relpath(d.getVar('libe
xecdir'), d.getVar('prefix') + '/')} \
      -DCMAKE_INSTALL_SYSCONFDIR:PATH=${sysconfdir} \
      -DCMAKE_INSTALL_SHAREDSTATEDIR:PATH=${@os.path.relpath(d.getVar('
sharedstatedir'), d.  getVar('prefix') + '/')} \
      -DCMAKE_INSTALL_LOCALSTATEDIR:PATH=${localstatedir} \
      -DCMAKE_INSTALL_LIBDIR:PATH=${@os.path.relpath(d.getVar('libdir')
, d.getVar('prefix') + '/')} \
      -DCMAKE_INSTALL_INCLUDEDIR:PATH=${@os.path.relpath(d.getVar('incl
udedir'), d.getVar('prefix') + '/')} \
      -DCMAKE_INSTALL_DATAROOTDIR:PATH=${@os.path.relpath(d.getVar('dat
adir'), d.getVar('prefix') + '/')} \
      -DPYTHON_EXECUTABLE:PATH=${PYTHON} \
      -DPython_EXECUTABLE:PATH=${PYTHON} \
      -DPython3_EXECUTABLE:PATH=${PYTHON} \
      -DLIB_SUFFIX=${@d.getVar('baselib').replace('lib', '')} \
      -DCMAKE_INSTALL_SO_NO_EXE=0 \
      -DCMAKE_TOOLCHAIN_FILE=${WORKDIR}/toolchain.cmake \
      -DCMAKE_NO_SYSTEM_FROM_IMPORTED=1 \
      -DCMAKE_EXPORT_NO_PACKAGE_REGISTRY=ON \
      -DFETCHCONTENT_FULLY_DISCONNECTED=ON \
      ${EXTRA_OECMAKE} \
      -Wno-dev
}
```

Một lần nữa, nếu dùng class này, chúng ta không cần định nghĩa lại task, nhưng nên dùng các biến được dùng trong thân của nó để điều khiển đúng công việc của nó. Tuy nhiên, thông thường biến duy nhất được dùng trong recipe là `EXTRA_OECMAKE`.

Hơn nữa, nếu software của chúng ta không cần được cấu hình, chúng ta có thể buộc task này không làm gì bằng cách định nghĩa nó như dưới đây ngay trong file recipe:

```
do_configure () {
    :
}
```

Bạn đọc nên nhớ rằng với Bash, ký tự dấu hai chấm (`:`) tương đương với lệnh `true`.

### 6.4.4 Task do_compile (The do_compile Task)

Task này chỉ compile source code. Định nghĩa của nó được trình bày dưới đây:

```
addtask compile after do_configure

do_compile[dirs] = "${B}"

base_do_compile() {
    if [ -e Makefile -o -e makefile -o -e GNUmakefile ]; then
        oe_runmake || die "make failed"
    else
        bbnote "nothing to compile"
    fi
}
```

Không có gì đặc biệt để nói ở đây, ngoài việc nó chạy sau `do_configure`. Working directory của nó là thư mục `B`, và hành vi mặc định của nó là chạy hàm `oe_runmake` nếu tìm thấy file `Makefile`, `makefile` hoặc `GNUmakefile`. Nếu không, nó không làm gì cả.

Task này có thể được định nghĩa lại bằng class CMake như dưới đây:

```
# To disable verbose cmake logs for a given recipe or globally config
# metadata e.g. local.conf add following
#
# CMAKE_VERBOSE = ""
#

CMAKE_VERBOSE ??= "VERBOSE=1"

# Then run do_compile again
cmake_runcmake_build() {
    bbnote ${DESTDIR:+DESTDIR=${DESTDIR} }${CMAKE_VERBOSE} cmake --buil
d '${B}' "$@" -- ${EXTRA_OECMAKE_BUILD}
    eval ${DESTDIR:+DESTDIR=${DESTDIR} }${CMAKE_VERBOSE} cmake --build
'${B}' "$@" -- ${EXTRA_OECMAKE_BUILD}
}

cmake_do_compile()  {
    cmake_runcmake_build --target ${OECMAKE_TARGET_COMPILE}
}
```

Vì software của chúng ta có thể không dùng cả `make` lẫn `cmake`, việc task này được định nghĩa lại trong recipe là khá phổ biến. Ví dụ, trong recipe của công cụ `devmem2`, chúng ta có thể đọc thấy thiết lập sau:

```
$ cat meta-openembedded/meta-oe/recipes-support/devmem2/devmem2_2.0.bb
...
CFLAGS += "-DFORCE_STRICT_ALIGNMENT"

do_compile() {
    ${CC} -o devmem2 devmem2.c ${CFLAGS} ${LDFLAGS}
}
...
```

Và nó hoạt động vì các biến `CC`, `CFLAGS` và `LDFLAGS` được Yocto build system đặt đúng khi task được thực thi.

> Chú ý toán tử `+=` được dùng để thêm một flag cho compiler thay vì dùng ký tự dấu bằng (`=`); nếu không, mọi `CFLAGS` của Yocto sẽ bị ghi đè!

### 6.4.5 Task do_install (The do_install Task)

Task này chép các file cần đóng gói vào khu vực chứa do biến `D` trỏ tới. Lưu ý rằng task này chạy với working directory hiện tại được đặt là `B`, tức là thư mục compile, và sau đó nó chuyển các file được tạo ra vào `D`.

Task `do_install` được định nghĩa như dưới đây:

```
addtask install after do_compile

do_install[dirs] = "${B}"
# Remove and re-create ${D} so that is it guaranteed to be empty
do_install[cleandirs] = "${D}"

base_do_install() {
    :
}
```

Ở đây, chúng ta thấy `do_install` được thực thi sau `do_compile` và theo mặc định, task không làm gì cả, vì vậy việc nó bị ghi đè bởi mọi recipe là khá thông thường. Tuy nhiên, điều này không hoàn toàn đúng trong trường hợp một recipe kế thừa một class làm việc đó thay cho nó; thật vậy, nếu kế thừa class CMake, chúng ta có thân mặc định sau:

```
cmake_do_install() {
    DESTDIR='${D}' cmake_runcmake_build --target ${OECMAKE_TARGET_INSTA
LL}
}
```

> Lưu ý rằng cả hai task `cmake_do_compile` và `cmake_do_install` đều dùng hàm nội bộ `cmake_runcmake_build()`.

Hơn nữa, chúng ta có thể dùng `EXTRA_OECMAKE` (và các biến liên quan khác) để chỉ dẫn `cmake` làm việc của nó. Tuy nhiên, một dạng thông thường của task `do_install` khi được định nghĩa lại trong một recipe có thể thấy trong file recipe `devmem2_2.0.bb`:

```
$ cat meta-openembedded/meta-oe/recipes-support/devmem2/devmem2_2.0.bb
...
do_install() {
    install -d ${D}${bindir}
    install devmem2 ${D}${bindir}
}
```

Lưu ý rằng vì `D` luôn được tạo lại rỗng, chúng ta phải tạo từng thư mục con nơi muốn cài file. Trong ví dụ trên, trước khi cài file thực thi `devmem2`, chúng ta phải tạo thư mục `bindir` trong `D`.

Khi cài file, chúng ta nên cẩn thận không đặt owner và group ID của các file được cài thành những giá trị không mong muốn; thật vậy, một số cách chép file (như lệnh `cp`) có thể giữ lại UID và/hoặc GID của file gốc, điều thường không phải là điều chúng ta muốn. Một số cách an toàn để cài file theo lưu ý này là như sau:

- Dùng tiện ích `install` như trong ví dụ trên, đây là cách được ưa dùng.

- Nếu muốn dùng lệnh `cp`, chúng ta luôn nên dùng tùy chọn `--no-preserve=ownership`.

- Nếu cần dùng lệnh `tar`, chúng ta luôn nên dùng `--no-same-owner option`, và cũng làm như vậy với mọi công cụ archive khác mà chúng ta muốn dùng.

Một cách dùng thú vị của phương pháp cuối cùng ở trên là trong class bin-package, nằm trong file `bin_package.bbclass` ở meta layer `poky`. Nó trông như sau:

```
$ cat sources/poky/meta/classes/bin_package.bbclass
...
# Common variable and task for the binary package recipe.
# Basic principle:
# * The files have been unpacked to ${S} by base.bbclass
# * Skip do_configure and do_compile
# * Use do_install to install the files to ${D}
#
# Note:
# The "subdir" parameter in the SRC_URI is useful when the input package
# is rpm, ipk, deb and so on, for example:
#
# SRC_URI = "http://foo.com/foo-1.0-r1.i586.rpm;subdir=foo-1.0"
#
# Then the files would be unpacked to ${WORKDIR}/foo-1.0, otherwise
# they would be in ${WORKDIR}.
#

# Skip the unwanted steps
do_configure[noexec] = "1"
do_compile[noexec] = "1"

# Install the files to ${D}
bin_package_do_install () {
    # Do it carefully
    [ -d "${S}" ] || exit 1
    if [ -z "$(ls -A ${S})" ]; then
        bbfatal bin_package has nothing to install. Be sure the SRC_URI
 unpacks into S.
    fi
    cd ${S}
    install -d ${D}${base_prefix}
    tar --no-same-owner --exclude='./patches' --exclude='./.pc' -cpf -
. \
        | tar --no-same-owner -xpf - -C ${D}${base_prefix}
}

FILES:${PN} = "/"

EXPORT_FUNCTIONS do_install
```

Đây là một class nhỏ, nhưng có đầy những ví dụ tốt! Như được nêu ở phần đầu, class này được thiết kế để dễ dàng quản lý binary package, tức là khi chúng ta chỉ phải cài binary mà không cần compile; thật vậy, cả task `do_configure` và `do_compile` đều bị ngăn thực thi bằng cách đặt flag variable `noexec` thành `1`.

Tùy chọn `subdir` trong `SRC_URI` được dùng để đặt đúng tên thư mục nơi các binary sẽ được bung ra. Task `do_install` sau đó được định nghĩa lại sao cho nó sẽ cài mọi file (trừ những gì nằm trong các thư mục `./patches` và `./.pc`) vào thư mục do `${D}${base_prefix}` trỏ tới, với thiết lập owner phù hợp. Task dùng cả hai lệnh `install` và `tar` (lệnh sau với tùy chọn `--no-same-owner`).

> Bạn đọc có thể xem Mục 11.5 để có ví dụ về cách dùng class này.

Lưu ý cuối cùng, chúng ta phải nhắc đến việc cài thư viện C. Thật vậy, trong trường hợp này, cách thông thường để làm việc đó được trình bày dưới đây:

```
do_install () {
    install -d ${D}${libdir}
    install -Dm 0755 ${B}/libleak.so ${D}${libdir}/libleak.so
}
```

Tuy nhiên, tốt hơn nên dùng hàm `oe_soinstall()`, hàm này còn kiểm tra thiết lập `soname`. Thật vậy, trong file `sources/poky/meta/classes/utils.bbclass`, nơi hàm được định nghĩa, chúng ta có thể thấy

```
oe_soinstall() {
    # Purpose: Install shared library file and
    #          create the necessary links
    # Example: oe_soinstall libfoo.so.1.2.3 ${D}${libdir}
    libname=`basename $1`
    case "$libname" in
        *.so)
            bbfatal "oe_soinstall: Shared library must haved versioned
filename (e.g. libfoo.so.1.2.3)"
            ;;
    esac
    install -m 755 $1 $2/$libname
    sonamelink=`${HOST_PREFIX}readelf -d $1 | grep 'Library soname:' |
sed -e 's/.*\[\(.*\)\].*/\1/'`
    if [ -z $sonamelink ]; then
        bbfatal "oe_soinstall: $libname is missing ELF tag 'SONAME'."
    fi
    solink=`echo $libname | sed -e 's/\.so\..*/.so/'`
    ln -sf $libname $2/$sonamelink
    ln -sf $libname $2/$solink
}
```

> Bạn đọc chưa biết thiết lập `soname` là gì có thể xem ví dụ ở Mục 9.2 để hiểu rõ hơn.

Như được nêu trong comment của hàm, chúng ta có thể dùng nó để viết lại task `do_install` ở trên như dưới đây:

```
do_install () {
    install -d ${D}${libdir}
    oe_soinstall ${B}/libleak.so ${D}${libdir}
}
```

Bằng cách này, chúng ta có thể chắc chắn mọi thứ được làm đúng, đồng thời tham số `soname` được kiểm tra một cách đáng tin cậy và các link tương ứng được tạo ra.

Tuy nhiên, hàm `oe_soinstall()` chỉ hoạt động với shared library, và trong trường hợp cần cài cả static library, chúng ta có thể dùng một tiện ích tổng quát hơn tên là `oe_libinstall()`. Nó được định nghĩa trong cùng file với `oe_soinstall()`, và để xem nó hoạt động thế nào, chúng ta có thể xem cách nó được định nghĩa:

```
$ cat poky/meta/classes/bin_package.bbclass
...
oe_libinstall() {
    # Purpose: Install a library, in all its forms
    # Example
    #
    # oe_libinstall libltdl ${STAGING_LIBDIR}/
    # oe_libinstall -C src/libblah libblah ${D}/${libdir}/
...
    while [ "$#" -gt 0 ]; do
        case "$1" in
                -C)
                        shift
                        dir="$1"
                        ;;
                -s)
                        silent=1
                        ;;
                -a)
                        require_static=1
                        ;;
                -so)
                        require_shared=1
                        ;;
                -*)
                        bbfatal "oe_libinstall: unknown option: $1"
                        ;;
                *)
                        break;
                        ;;
        esac
        shift
    done
    libname="$1"
    shift
    destpath="$1"
    if [ -z "$destpath" ]; then
        bbfatal "oe_libinstall: no destination path specified"
    fi
...
```

Hàm này, theo mặc định, cố cài cả shared library lẫn static library, thực hiện các kiểm tra phù hợp như `oe_soinstall()` làm. Tuy nhiên, nó có thể được điều khiển bằng các option argument đặc biệt để yêu cầu file shared library hoặc static library (nếu không thì báo lỗi) và để chỉ định một thư mục khác nơi nó phải tìm các file thư viện. Một ví dụ thực tế được trình bày trong recipe `tcp-wrappers_7.6.bb`, như dưới đây:

```
$ cat poky/meta/recipes-extended/tcp-wrappers/tcp-wrappers_7.6.bb
...
do_install () {
    oe_libinstall -a libwrap ${D}${libdir}
    oe_libinstall -C shared -so libwrap ${D}${base_libdir}
...
```

Dòng đầu tiên cài static library `libwrap` lấy từ thư mục do `B` trỏ tới, còn các file shared library được lấy từ thư mục `${B}/shared`.

> Lưu ý rằng `oe_libinstall()` tự tạo thư mục đích `${D}${libdir}`, còn hàm `oe_soinstall()` thì không.

Bạn đọc nên lưu ý rằng những gì đã nói cho đến giờ về việc cài shared (hoặc static) library là đúng; tuy nhiên, để làm việc một cách hoàn hảo, chúng ta cũng nên tính đến việc cài các header file cùng với các file binary. Thật vậy, để có thể compile dựa trên thư viện, chúng ta cũng cần các file này.

Vì vậy, một task `do_install` đầy đủ cho thư viện nên được định nghĩa như trong recipe `tcp-wrappers_7.6.bb`:

```
$ cat poky/meta/recipes-extended/tcp-wrappers/tcp-wrappers_7.6.bb
...
do_install () {
    oe_libinstall -a libwrap ${D}${libdir}
    oe_libinstall -C shared -so libwrap ${D}${base_libdir}
...
    install -d ${D}${includedir}
    install -m 0644 tcpd.h ${D}${includedir}/
...
}
```

Sau các file binary (man page và các file khác), recipe cài header file `tcpd.h` vào thư mục do `includedir` trỏ tới.

## 6.5 Build image (Building Images)

Cho đến giờ, chúng ta đã thảo luận về recipe nói chung mà không phân biệt recipe cho package và recipe cho image. Tuy nhiên, chúng là những khái niệm cực kỳ khác nhau!

Cả hai đều được BitBake dùng để build thứ gì đó, nhưng recipe cho package chứa chỉ dẫn để tạo một hoặc nhiều package chứa chương trình, file cấu hình và mọi file khác cần để một software cụ thể hoạt động, còn recipe cho image chứa chỉ dẫn để tạo một binary image chứa một OS hoàn chỉnh, tức là nhiều chương trình, cấu hình của chúng và các file dữ liệu. Nói đơn giản, một recipe cho image chứa một danh sách package.

> Thực ra, recipe cho image chứa chỉ dẫn để tạo một root filesystem. Nhưng nhờ một số thiết lập đặc biệt, chúng ta có thể tạo ra một binary image cuối cùng gồm root filesystem cùng các bootloader, kernel và mọi thứ cần đặt lên bộ lưu trữ để có một hệ thống hoạt động.

### 6.5.1 Core image recipe (The Core Image Recipe)

Nếu nhớ lại những gì đã làm trong Mục 2.2, khi thực thi file `imx-setup-release.sh`, chúng ta đã nhận được kết quả như dưới đây:

```
...
Welcome to Freescale Community BSP
...
You can now run 'bitbake <target>'

Common targets are:
    core-image-minimal
    meta-toolchain
    meta-toolchain-sdk
    adt-installer
    meta-ide-support
...
```

`core-image-minimal` là tên của image recipe tối thiểu được định nghĩa trong meta layer Poky, như dưới đây:

```
$ cat poky/meta/recipes-core/images/core-image-minimal.bb
SUMMARY = "A small image just capable of allowing a device to boot."

IMAGE_INSTALL = "packagegroup-core-boot ${CORE_IMAGE_EXTRA_INSTALL}"

IMAGE_LINGUAS = " "

LICENSE = "MIT"

inherit core-image

IMAGE_ROOTFS_SIZE ?= "8192"
IMAGE_ROOTFS_EXTRA_SPACE:append = "${@bb.utils.contains("DISTRO_FEATURE
S", "systemd", " + 4096", "", d)}"
```

Như chúng ta thấy, recipe rất sơ đẳng, và một số biến giống như trong package recipe. Tuy nhiên, điều tạo nên khác biệt ở đây là câu lệnh `inherit core-image` và mọi biến có tiền tố là chuỗi `IMAGE_`.

Để biết nó hoạt động thế nào, hãy xem class core-image. Nó nằm trong một file khá ngắn, chia thành hai vùng chính. Vùng đầu tiên trông như sau:

```
$ cat poky/meta/classes/core-image.bbclass
...
# IMAGE_FEATURES control content of the core reference images
#
# By default we install packagegroup-core-boot and
# packagegroup-base-extended packages; this gives us working (console
# only) rootfs.
#
# Available IMAGE_FEATURES:
#
# - weston              - Weston Wayland compositor
# - x11                 - X server
# - x11-base            - X server with minimal environment
# - x11-sato            - OpenedHand Sato environment
# - tools-debug         - debugging tools
...
# - ssh-server-dropbear - SSH server (dropbear)
# - ssh-server-openssh  - SSH server (openssh)
# - hwcodecs            - Install hardware acceleration codecs
...
FEATURE_PACKAGES_weston = "packagegroup-core-weston"
FEATURE_PACKAGES_x11 = "packagegroup-core-x11"
FEATURE_PACKAGES_x11-base = "packagegroup-core-x11-base"
FEATURE_PACKAGES_x11-sato = "packagegroup-core-x11-sato"
FEATURE_PACKAGES_tools-debug = "packagegroup-core-tools-debug"
...
FEATURE_PACKAGES_ssh-server-dropbear = "packagegroup-core-ssh-dropbear"
FEATURE_PACKAGES_ssh-server-openssh = "packagegroup-core-ssh-openssh"
FEATURE_PACKAGES_hwcodecs = "${MACHINE_HWCODECS}"
...
```

Đây là mọi image feature được hỗ trợ mà chúng ta có thể chỉ định trong biến `IMAGE_FEATURES`, cùng với giải thích tương ứng. Biến `FEATURE_PACKAGES` được dùng để định nghĩa một hoặc nhiều package cần đưa vào image khi một phần tử cụ thể được đưa vào `IMAGE_FEATURES`. Như trong ví dụ trên, khi đặt giá trị của nó, chúng ta phải append tên của feature, ví dụ, nếu đặt như sau:

```
FEATURE_PACKAGES_foo = "package1 package2"
```

Khi `foo` được thêm vào `IMAGE_FEATURES`, `package1` và `package2` sẽ được đưa vào image.

> Các package được cài qua các feature định nghĩa bằng biến `FEATURE_PACKAGES` thường là package group, tức là các recipe gom nhiều package lại với nhau. Khi đó, thay vì phải chỉ định tường minh từng package trong biến `IMAGE_INSTALL`, chúng ta có thể đơn giản chỉ định tên package group. Xem Mục 11.4 để biết thêm thông tin về chủ đề này.

Sau đó class core-image tiếp tục, và vùng thứ hai trông như sau:

```
...
# IMAGE_FEATURES_REPLACES_foo = 'bar1 bar2'
# Including image feature foo would replace the image features bar1 and
# bar2
IMAGE_FEATURES_REPLACES_ssh-server-openssh = "ssh-server-dropbear"
# Do not install openssh complementary packages if either
# packagegroup-core-ssh-dropbear or dropbear is installed to avoid
# openssh-dropbear conflict see [Yocto #14858] for more information
PACKAGE_EXCLUDE_COMPLEMENTARY:append = "${@bb.utils.contains_any('PACKA
GE_INSTALL', 'packagegroup-core-ssh-dropbear dropbear', 'openssh', '' ,
 d)}"
# IMAGE_FEATURES_CONFLICTS_foo = 'bar1 bar2'
# An error exception would be raised if both image features foo and
# bar1(or bar2) are included

MACHINE_HWCODECS ??= ""

CORE_IMAGE_BASE_INSTALL = '\
    packagegroup-core-boot \
    packagegroup-base-extended \
    \
    ${CORE_IMAGE_EXTRA_INSTALL} \
    '

CORE_IMAGE_EXTRA_INSTALL ?= ""

IMAGE_INSTALL ?= "${CORE_IMAGE_BASE_INSTALL}"

inherit image
```

Các biến `IMAGE_FEATURES_REPLACES` và `IMAGE_FEATURES_CONFLICTS` có thể được dùng để quản lý các thiết lập `IMAGE_FEATURES`, còn với `PACKAGE_EXCLUDE_COMPLEMENTARY`, chúng ta có thể ngăn các package cụ thể (bằng một regular expression khớp với các package muốn loại trừ) được cài khi đang cài các complementary package. Trong ví dụ trên, chúng ta yêu cầu build system không cài các complementary package của `openssh` nếu `packagegroup-core-ssh-dropbear` hoặc `dropbear` đã được cài, để tránh xung đột `openssh-dropbear`.

Cuối cùng, chúng ta có biến `IMAGE_INSTALL`, được dùng để chỉ định các package cần cài vào một image thông qua image class (được gọi bằng `inherit image` – xem bên dưới).

Tuy nhiên, khi dùng class core-image này, chúng ta không nên đặt trực tiếp biến này; thay vào đó, chúng ta nên dùng biến `CORE_IMAGE_BASE_INSTALL` bằng cách append thêm các package cần cài, như dưới đây:

```
CORE_IMAGE_BASE_INSTALL += "${@bb.utils.contains('DISTRO_FEATURES', 'x1
1', 'weston-xwayland matchbox-terminal', '', d)}"
```

> Lưu ý rằng chúng ta cũng có thể dùng biến `CORE_IMAGE_EXTRA_INSTALL`, biến cung cấp cùng chức năng như `CORE_IMAGE_BASE_INSTALL` (tức là chỉ định danh sách package bổ sung cần thêm vào image), nhưng nó có thể được dùng trong file cấu hình `local.conf`.

Ở cuối file `core-image-minimal.bb`, chúng ta có thể thấy các biến `IMAGE_ROOTFS_SIZE` và `IMAGE_ROOTFS_EXTRA_SPACE`, có thể được dùng để định nghĩa kích thước tính theo Kbyte của root filesystem image được tạo ra.

Kích thước cuối cùng của image được tạo ra (`final-rootfs-size)` được tính như sau:

```
final-rootfs-size = image-du * IMAGE_OVERHEAD_FACTOR
if (final-rootfs-size) < IMAGE_ROOTFS_SIZE:
    final-rootfs-size = IMAGE_ROOTFS_SIZE
final-rootfs-size += IMAGE_ROOTFS_EXTRA_SPACE
```

trong đó `image-du` là giá trị trả về của lệnh `du` trên root filesystem image. Các biến sau cùng này hữu ích để thêm dung lượng trống vào root filesystem cuối cùng nếu cần.

> Để ngăn `final-rootfs-size` quá lớn đối với kit embedded, chúng ta có thể dùng `IMAGE_ROOTFS_MAXSIZE` để chỉ định một giá trị tối đa mà nếu vượt quá sẽ phát sinh lỗi build.
>
> Hơn nữa, với `IMAGE_ROOTFS_ALIGNMENT`, chúng ta có thể chỉ định alignment cho file image cuối cùng tính theo Kbyte. Nếu kích thước image không phải là bội số của giá trị này, thì kích thước được làm tròn lên bội số gần nhất của giá trị đó (mặc định là `1`).

OK, đó là tất cả về class core-image. Vì vậy những gì chúng ta phải làm chỉ là liệt kê các package cần thiết trong `CORE_IMAGE_BASE_INSTALL`, như recipe `core-image-weston.bb` làm:

```
$ cat poky/meta/recipes-graphics/images/core-image-weston.bb
SUMMARY = "A very basic Wayland image with a terminal"

IMAGE_FEATURES += "splash package-management ssh-server-dropbear hwcode
cs weston"

LICENSE = "MIT"

inherit core-image

CORE_IMAGE_BASE_INSTALL += "gtk+3-demo"
CORE_IMAGE_BASE_INSTALL += "${@bb.utils.contains('DISTRO_FEATURES', 'x1
1', 'weston-xwayland matchbox-terminal', '', d)}"
...
```

Recipe này chỉ kế thừa class core-image rồi dùng biến `CORE_IMAGE_BASE_INSTALL` để liệt kê các package cần cài vào root filesystem.

### 6.5.2 Image class (The Image Class)

Khá rõ ràng rằng image recipe thực sự khác với package recipe thông thường, và mọi trick được dùng để tạo một binary image thay vì một binary package đều nằm trong file `poky/meta/classes/image.bbclass`.

Class này được mọi image class khác kế thừa, và dù có thể được dùng trực tiếp, nó thường được kế thừa khi chúng ta dùng một image class dẫn xuất (như class core-image ở trên). Điều này có nghĩa là image recipe đặt `IMAGE_INSTALL` để chỉ định các package cần cài vào một image thông qua class này. Tuy nhiên, image class dẫn xuất, thường được gọi là image helper class như class core-image đã thấy ở mục trước, có thể lấy các danh sách được dùng với `IMAGE_FEATURES` và chuyển chúng thành các mục auto- generated trong `IMAGE_INSTALL`, bổ sung vào nội dung mặc định của nó. Vì tất cả những lý do này, khi dùng biến này, tốt nhất là dùng nó như sau:

```
IMAGE_INSTALL:append = " package"
```

> Trước tiên, hãy chắc chắn đưa vào dấu cách giữa ký tự dấu nháy và đầu tên package! Sau đó, lưu ý rằng không nên dùng toán tử `+=` để append package vào `IMAGE_INSTALL`. Thật vậy, `core-image.bbclass` (một image class khác) thực hiện thiết lập sau:
>
> ```
> IMAGE_INSTALL ?= "${CORE_IMAGE_BASE_INSTALL}"
> ```
>
> Khởi tạo một biến bằng toán tử `?=` rồi dùng phép toán `+=` với nó sẽ dẫn đến hành vi không mong đợi khi được dùng trong `local.conf`. Hơn nữa, tùy theo hoàn cảnh, một image recipe có thể hoạt động hoặc không. Trong cả hai trường hợp, hành vi này trái với cách mà phần lớn người dùng mong đợi toán tử `+=` hoạt động.

Để làm việc của mình, image class định nghĩa lại một số task và vô hiệu hóa/xóa những task khác, như chúng ta có thể thấy trong file `image.bbclass` như dưới đây:

```
$ cat poky/meta/classes/image.bbclass
...
do_fetch[noexec] = "1"
do_unpack[noexec] = "1"
do_patch[noexec] = "1"
do_configure[noexec] = "1"
do_compile[noexec] = "1"
do_install[noexec] = "1"
deltask do_populate_lic
deltask do_populate_sysroot
do_package[noexec] = "1"
deltask do_package_qa
deltask do_packagedata
deltask do_package_write_ipk
deltask do_package_write_deb
deltask do_package_write_rpm
...
```

> Bạn đọc tinh ý hẳn đã nhận thấy rằng một số task bị xóa, còn những task khác chỉ đơn giản bị vô hiệu hóa bằng cách đặt flag `noexec`. Vì khi dùng directive `deltask`, ý chúng ta là những phụ thuộc task vô tình còn sót lại không còn cần thiết cũng như không còn được xử lý.

Hơn nữa, các task mới được thêm vào, ví dụ:

```
...
fakeroot python do_rootfs () {
    from oe.rootfs import create_rootfs
    from oe.manifest import create_manifest
    import logging
...
    # generate rootfs
    d.setVarFlag('REPRODUCIBLE_TIMESTAMP_ROOTFS', 'export', '1')
    create_rootfs(d, progress_reporter=progress_reporter, logcatcher=lo
gcatcher)
    progress_reporter.finish()
}
do_rootfs[dirs] = "${TOPDIR}"
do_rootfs[cleandirs] += "${IMAGE_ROOTFS} ${IMGDEPLOYDIR} ${S}"
do_rootfs[file-checksums] += "${POSTINST_INTERCEPT_CHECKSUMS}"
addtask rootfs after do_prepare_recipe_sysroot

fakeroot python do_image () {
    from oe.utils import execute_pre_post_process

    d.setVarFlag('REPRODUCIBLE_TIMESTAMP_ROOTFS', 'export', '1')
    pre_process_cmds = d.getVar("IMAGE_PREPROCESS_COMMAND")

    execute_pre_post_process(d, pre_process_cmds)
}
do_image[dirs] = "${TOPDIR}"
addtask do_image after do_rootfs
...
```

Các task `do_image` và `do_rootfs` lần lượt được dùng để bắt đầu quá trình tạo image và để tạo root filesystem (cấu trúc file và thư mục, binary image sau đó được tạo bởi các task khác; khi đó việc hoàn tất là nhờ task `do_image_complete`, không được trình bày ở đây).

Để hiểu rõ sự khác biệt này, bạn đọc nên xem hình ảnh tuyệt đẹp và thực sự giải thích rõ ràng từ Yocto Reference Manual tại `https://docs.yoctoproject.org/dev/_images/image-generation.png`, mô tả quá trình tạo image.

Chỉ cần nhìn qua hình ảnh đó lần đầu, chúng ta đã có thể hiểu rõ một image được tạo ra như thế nào. Dưới đây, chúng ta sẽ cố gắng hết sức mô tả các bước này:

1. Ban đầu, chúng ta có các source mirror nơi BitBake lấy code, và bằng các package recipe, nó tạo ra các package feed, tức là các package IPKG, RPM hoặc DEB.

2. Sau đó, trong task đặc biệt `do_rootfs`, nó tiến hành tạo root filesystem của target bằng các bước sau:

2.1. Bằng cách đọc các biến `IMAGES_` và `PACKAGE_`, BitBake tạo danh sách package cuối cùng truyền cho package manager để cài vào image (danh sách được lưu trong biến nội bộ `PACKAGE_INSTALL` – xem phần dưới của mục này về cách dùng đúng biến này).

2.2. Sau đó root filesystem cuối cùng được tạo tại vị trí do biến `IMAGE_ROOTFS` chỉ định (biến này không cấu hình được, vì vậy chúng ta đã không thay đổi nó).

2.3. Tại thời điểm này, một số task post-processing được thực thi. Theo mặc định, có một giai đoạn tối ưu hóa và một bước tạo Manifest (xem Mục 7.4.3 để biết thêm thông tin về Manifest).

Hơn nữa, qua `ROOTFS_POSTPROCESS_COMMAND`, chúng ta có thể chỉ định một danh sách các hàm cách nhau bằng dấu cách để gọi khi Yocto build system đã tạo xong root filesystem:

```
                ROOTFS_POSTPROCESS_COMMAND += "function;"
```

3. Khi task `do_rootfs` đã kết thúc, BitBake bắt đầu task `do_image`, task có mục tiêu chính là tạo binary image của root filesystem:

3.1. Tương tự như trên, bằng biến `IMAGE_PREPROCESS_COMMAND`, chúng ta có thể chỉ định một danh sách các hàm cách nhau bằng dấu cách để gọi trước khi Yocto build system tạo các file image output cuối cùng:

```
                IMAGE_PREPROCESS_COMMAND += "function;"
```

3.2. Tại thời điểm này, tùy theo biến `IMAGE_FSTYPES`, biến chỉ định các định dạng mà Yocto build system dùng trong khi build khi tạo root filesystem, nhiều task `do_image_*` được thực thi để tạo các file root filesystem cuối cùng.

3.3. Cuối cùng, bằng `IMAGE_POSTPROCESS_COMMAND`, chúng ta có thể chỉ định một danh sách các hàm cách nhau bằng dấu cách để gọi khi Yocto build system tạo xong các file image output cuối cùng:

```
                IMAGE_POSTPROCESS_COMMAND += "function;
```

> Lưu ý rằng định dạng đúng để chỉ định hàm trong các biến này có dấu chấm phẩy ở cuối; hơn nữa, an toàn hơn là thêm hàm của chúng ta bằng toán tử `+=` (hoặc `append`) thay vì dấu bằng (`=`) như dưới đây:
>
> ```
> IMAGE_POSTPROCESS_COMMAND += "function; ... "
> IMAGE_PREPROCESS_COMMAND:append = "function; ... "
> ```

Một ví dụ về cách dùng `IMAGE_PREPROCESS_COMMAND` được trình bày trong ví dụ sau:

```
$ cat meta-security/recipes-core/images/dm-verity-image-initramfs.bb
...
deploy_verity_hash() {
    install -D -m 0644 \
        ${STAGING_VERITY_DIR}/${DM_VERITY_IMAGE}.${DM_VERITY_IMAGE_TYPE
}.verity.env \
        ${IMAGE_ROOTFS}${datadir}/misc/dm-verity.env
}
IMAGE_PREPROCESS_COMMAND += "deploy_verity_hash;"
```

Lưu ý rằng cách duy nhất để chạy trước task `do_rootfs` là dùng câu lệnh `addtask`, như trong ví dụ sau:

```
$ cat meta-virtualization/recipes-extended/images/xen-image-minimal.bb
...
do_check_xen_state() {
    if [ "${@bb.utils.contains('DISTRO_FEATURES', 'xen', ' yes', 'no',
d)}" = "no" ]; then
        die "DISTRO_FEATURES does not contain 'xen'"
    fi
}

addtask check_xen_state before do_rootfs
...
```

Lưu ý cuối cùng về các biến này là chúng cũng có thể được dùng với override, như dưới đây:

```
$ cat meta-engicam-nxp/recipes-images/images/engicam-evaluation-image-m
x8.bb
...
ROOTFS_POSTPROCESS_COMMAND:append:mx8 = "fix_bcm43430;"

fix_bcm43430() {
    cd ${IMAGE_ROOTFS}/lib/firmware/brcm
    ln -sf brcmfmac43430-sdio.bin brcmfmac43430-sdio.engi,imx8-icore.bin
}
...
```

Bạn đọc nên lưu ý rằng để truyền đường dẫn root filesystem cho các lệnh trong các hàm mới, chúng ta có thể dùng biến `IMAGE_ROOTFS`, biến trỏ tới thư mục sẽ trở thành root filesystem image (biến này cũng được dùng trong task `do_rootfs`, và nó không cấu hình được, vì vậy chúng ta không phải thay đổi nó!).

Trong image class, chúng ta cũng có thể tìm thấy các biến hữu ích khác có thể đặt để cấu hình việc tạo Yocto image; ví dụ, dưới đây là danh sách những biến được dùng nhiều nhất:

- `IMAGE_NAME`: Chỉ định tên của các file image output, không có phần mở rộng. Mặc định là

  ```
  "${IMAGE_BASENAME}-${MACHINE}${IMAGE_VERSION_SUFFIX}"
  ```

  trong đó `IMAGE_BASENAME` thường mặc định là tên recipe (`PN`), còn `IMAGE_VERSION_SUFFIX` mặc định là chuỗi `"-${DATETIME}"`.

  `IMAGE_LINK_NAME`: Là một symbolic link tới `IMAGE_NAME`, không có phần phiên bản (`IMAGE_VERSION_SUFFIX`) trong tên; thật vậy, nó mặc định là `"${IMAGE_BASENAME}-${MACHINE}"`. Nó thường hữu ích để tham chiếu tới file image cuối cùng bằng một tên well-defined và không thay đổi.

- `IMAGE_FSTYPES`: Chỉ định các định dạng của root filesystem. Ví dụ, bằng cách đặt `IMAGE_FSTYPES =` `"ext4 tar.bz2"`, chúng ta yêu cầu build system tạo root filesystem bằng hai định dạng: .ext4 và .tar.bz2.

  Danh sách đầy đủ các định dạng image được hỗ trợ có thể xem tại `https://docs.yoctoproject.org/4.0.13/ref-manual/variables.html#term-IMAGE_TYPES`.

> Có hai khuyến nghị khi dùng biến này:
>
> 1) Nếu một recipe dùng dòng `inherit` `image`, thì nó phải đặt `IMAGE_FSTYPES` trước dòng này.
>
> 2) Recipe chỉ được dùng toán tử `+=` để thêm một hoặc nhiều tùy chọn vào biến `IMAGE_FSTYPES` (dùng :append hoặc :prepend có thể gây ra hành vi không mong đợi).

- `IMAGE_LINGUAS`: Chỉ định danh sách locale cần cài vào image. Mặc định là `"de-de fr-fr en-gb”`, vì vậy theo mặc định, các package `locale-base-de-ed` *(ghi chú: đúng là `locale-base-de-de`)*, `locale-` `base-fr-fr` và `locale-base-en-gb` được cài.

- `IMAGE_MANIFEST`: Chỉ định manifest file cho image. Tên file mặc định là

  ```
  "${IMGDEPLOYDIR}/${IMAGE_NAME}${IMAGE_NAME_SUFFIX}.manifest"
  ```

  trong đó `IMGDEPLOYDIR` trỏ tới một vùng làm việc tạm cho các file được deploy, còn `IMAGE_NAME_SUFFIX` mặc định là `.rootfs` để phân biệt file image với các file khác được tạo ra trong khi build image.

  Biến này chứa danh sách mọi package đã cài tạo nên image. Mỗi dòng của file này chứa thông tin package: tên package, kiến trúc package và phiên bản. Xem Mục 7.4.3 để có cách dùng thực tế file này.

Còn nhiều biến khác trong image class, và bạn đọc tò mò có thể xem trong file `image.bbclass`; về phạm vi của sách này, các biến được trình bày ở trên là đủ cho mục đích của chúng ta.

### 6.5.3 Tạo Initramfs (Generating Initramfs)

Initial RAM filesystem (thường được gọi là Initramfs) là một archive có thể được nén (thường ở định dạng cpio), được Linux kernel giải nén vào RAM trong một instance tmpfs đặc biệt, dùng làm root filesystem ban đầu.

Nó thường được dùng vì một số lý do:

1) Để mount một root filesystem mà kernel không thể mount trực tiếp. Thông thường, khi rootfs được mã hóa.

2) Để hỗ trợ các quy trình cập nhật hệ thống hoặc factory reset. Nếu cần ghi lại toàn bộ rootfs, chúng ta có thể làm việc đó bên trong một Initramfs rồi chuyển sang root filesystem mới.

3) Để làm một số việc nhanh hơn. Vì root filesystem được giải nén vào RAM, việc truy cập các ứng dụng user-space đầu tiên rất nhanh so với việc phải khởi tạo một block device (ví dụ, nó cho phép hiển thị một splash screen rất sớm khi boot).

Để tạo một Initramfs, trước tiên chúng ta phải tạo một recipe phù hợp để định nghĩa những gì build system phải đặt vào đó. Một ví dụ tốt được trình bày dưới đây:

```
$ cat poky/meta/recipes-core/images/core-image-minimal-initramfs.bb
# Simple initramfs image. Mostly used for live images.
DESCRIPTION = "Small image capable of booting a device. The kernel \
includes the Minimal RAM-based Initial Root Filesystem (initramfs), \
which finds the first 'init' program more efficiently."

INITRAMFS_SCRIPTS ?= "\
                      initramfs-framework-base \
                      initramfs-module-setup-live \
                      initramfs-module-udev \
                      initramfs-module-install \
                      initramfs-module-install-efi \
                     "
PACKAGE_INSTALL = "${INITRAMFS_SCRIPTS} ${VIRTUAL-RUNTIME_base-utils} u
dev base-passwd ${ROOTFS_BOOTSTRAP_INSTALL}"

# Do not pollute the initrd image with rootfs features
IMAGE_FEATURES = ""

export IMAGE_BASENAME = "${MLPREFIX}core-image-minimal-initramfs"
IMAGE_NAME_SUFFIX ?= ""
IMAGE_LINGUAS = ""

LICENSE = "MIT"

IMAGE_FSTYPES = "${INITRAMFS_FSTYPES}"
inherit core-image

IMAGE_ROOTFS_SIZE = "8192"
IMAGE_ROOTFS_EXTRA_SPACE = "0"
...
```

Trước tiên, chúng ta nên lưu ý rằng khi làm việc với một Initramfs image, chúng ta không dùng biến `IMAGE_INSTALL` để chỉ định các package cần cài. Thay vào đó, chúng ta nên dùng biến `PACKAGE_INSTALL`, biến cho phép recipe initial RAM filesystem dùng một tập package cố định và không bị ảnh hưởng bởi `IMAGE_INSTALL`.

Sau đó chúng ta thực hiện các thiết lập khác như làm rỗng `IMAGE_FEATURES` và `IMAGE_LINGUAS` (được dùng để chỉ định danh sách locale cần cài vào image) để không làm bẩn Initramfs image bằng các feature của root filesystem và giữ kích thước nhỏ nhất có thể. Hơn nữa, chúng ta đặt `IMAGE_FSTYPES` bằng `INITRAMFS_FSTYPES` (biến định nghĩa định dạng cho output image của Initramfs), thường được thiết lập trong một file cấu hình (mặc định là `cpio.gz`).

Bây giờ, để yêu cầu build system nhúng Initramfs mới vào kernel, chúng ta nên đặt biến `INITRAMFS_IMAGE_BUNDLE` thành `1` và đặt vào biến `INITRAMFS_IMAGE` tên của recipe cho Initramfs.

Thông thường, các thao tác này được làm trong một file cấu hình (thường là `distro.conf`), dù `INITRAMFS_IMAGE` cũng có thể được đặt trong một file recipe. Một ví dụ có thể như dưới đây:

```
INITRAMFS_IMAGE = "image-tiny-initramfs"
INITRAMFS_IMAGE_BUNDLE = "1"
```

Làm như vậy khiến Initramfs image được giải nén vào thư mục `${B}/usr/`, thư mục này lại được truyền cho `Makefile` của kernel qua biến `CONFIG_INITRAMFS_SOURCE`, cho phép Initramfs image được build vào kernel theo cách thông thường (một ví dụ thực tế về thiết lập này được trình bày trong Mục 12.6).

## 6.6 Best practice (Best Practices)

Cho đến giờ, chúng ta đã thấy recipe được tạo thành như thế nào, và trong Chương 12 chúng ta sẽ xem một số ví dụ thực tế. Tuy nhiên, trước khi kết thúc chương này, chúng ta sẽ liệt kê dưới đây một số best practice mà mọi Yocto developer giỏi nên làm khi viết recipe mới:

- Tránh để layer tùy biến của mình đè lên toàn bộ recipe từ các layer khác. Nói cách khác, chúng ta không nên chép toàn bộ một recipe vào layer của mình rồi sửa nó. Để tùy biến một recipe, tốt hơn nên dùng một append file (`.bbappend`) để override chỉ những phần của recipe gốc mà chúng ta cần sửa.

> Lưu ý rằng trong quá trình build, BitBake hiển thị lỗi nếu phát hiện một file `.bbappend` không có recipe tương ứng với tên khớp.

- Tránh trùng lặp include file. Nếu đưa vào một recipe mới cần một file được include từ layer khác, chúng ta nên dùng đường dẫn tương đối so với thư mục layer gốc để tham chiếu tới file đó.

  Một ví dụ là trong các recipe `netcat` và “netcat-openbsd”:

  ```
  $ cat meta-openembedded/meta-networking/recipes-support/netcat/ne
  tcat_0.7.1.bb
  require netcat.inc
  LICENSE = "GPL-2.0-only"
  ...
  cat meta-openembedded/meta-networking/recipes-support/netcat/netc
  at-openbsd_1.195.bb
  require netcat.inc
  SUMMARY = "OpenBSD Netcat"
  HOMEPAGE = "http://ftp.debian.org"
  LICENSE = "BSD-2-Clause"
  ...
  ```

  Cả hai recipe đều include file `netcat.inc` cho các thiết lập chung, rồi chúng định nghĩa các thiết lập tùy biến riêng.

  Việc include cũng nên được làm trong các file cấu hình như dưới đây:

  ```
  $ cat meta-freescale-3rdparty/conf/machine/imx7s-warp.conf
  #@TYPE: Machine
  #@NAME: WaRP7
  #@SOC: i.MX7S
  #@DESCRIPTION: Machine configuration for i.MX7S WaRP board.
  #@MAINTAINER: Pierre-Jean Texier <texier.pj2@gmail.com>

  MACHINEOVERRIDES =. "mx7:mx7d:"

  require conf/machine/include/imx-base.inc
  require conf/machine/include/arm/armv7a/tune-cortexa7.inc
  ...
  ```

  Các file được require này nằm trong các layer khác như dưới đây:

  ```
  $ cd sources
  find . -name imx-base.inc -o -name tune-cortexa7.inc
  ./meta-freescale/conf/machine/include/imx-base.inc
  ./poky/meta/conf/machine/include/arm/armv7a/tune-cortexa7.inc
  ```

- Đặt các file machine-specific ở các vị trí machine-specific. Khi có một hoặc nhiều file thay đổi theo một thiết lập machine cụ thể, chúng ta có thể đặt chúng vào các thư mục khác nhau, đặt tên theo từng machine. Như vậy chúng ta có thể chắc chắn một file machine-specific được dùng cho một machine cụ thể (xem ví dụ về file `/etc/fstab` trong Mục 5.3.4).

- Dùng các chương trình tiện ích khi có thể. Thay vì gọi trực tiếp `make`, chúng ta nên gọi `oe_runmake()`, hoặc nên dùng `install` trong task `do_install` như đã thấy ở trên, v.v.

- Dùng biến `COMPATIBLE_MACHINE` để ngăn recipe được build cho các machine mà recipe không tương thích.

## 6.7 Tóm tắt (Summary)

Trong chương này, chúng ta đã thấy các recipe để build package hoặc toàn bộ Yocto image được tạo thành như thế nào.

Chúng ta đã tìm hiểu những biến nào có thể gặp trong một recipe và các task có thể dùng để build package (hoặc root filesystem). Vì vậy giờ chúng ta đã sẵn sàng chuyển sang phần thứ ba của sách, nơi chúng ta bắt đầu làm các ví dụ thực tế về cách viết một layer mới, cách định nghĩa machine mới và cách viết recipe mới hoặc tùy biến recipe cũ.

