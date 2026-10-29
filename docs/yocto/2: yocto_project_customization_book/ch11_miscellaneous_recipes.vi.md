# Chương 11. Các recipe khác (Miscellaneous Recipes)

Trong chương này, chúng ta sẽ xem thêm một số ví dụ về recipe Yocto, bao quát nhiều vấn đề thường gặp trong embedded computing không thuộc về hai chương trước.

> Trước khi tiếp tục, bạn đọc nên chắc chắn rằng kit embedded của mình truy cập được qua serial console và network interface như đã giải thích trong Mục 1.3.

## 11.1 Thêm system service (Adding System Services)

Khi kernel đã boot xong, nó khởi động process đầu tiên với PID bằng 1, process này chịu trách nhiệm chuẩn bị hệ thống cho login prompt đầu tiên và, ở một mức độ nào đó, giúp quản lý một số process về sau.

Cụ thể, process so-called init này (hay đơn giản là init) chịu trách nhiệm khởi động mọi service cần thiết trong hệ thống, và như mọi embedded developer giỏi đều biết, trong mọi ứng dụng embedded đều có ít nhất một service chạy trên embedded machine. Vì vậy, điều thiết yếu là biết cách developer có thể thêm một service mới vào hệ thống Yocto của mình.

Ngày nay, có hai bản triển khai chính của init process này: Initd và Systemd. Yocto Project hỗ trợ cả hai, vì vậy trong sách này chúng ta sẽ trình bày cả hai, dù tập trung vào bản triển khai mới hơn và được dùng nhiều nhất, tức là Systemd.

### 11.1.1 Ghi chú về Initd (Notes on Initd)

Nếu một số bạn đọc vẫn đang dùng Initd trong hệ thống của mình, chúng ta có thể gợi ý họ xem recipe `service` trong meta layer `poky`:

```
$ cd sources/poky/meta-skeleton/recipes-skeleton/service
$ tree
.

├── service
│   ├── COPYRIGHT
│   ├── skeleton
│   └── skeleton_test.c
└── service_0.1.bb

1 directory, 4 files
```

Như chúng ta thấy, recipe chứa mọi thứ cần thiết để build một dummy service dựa trên Init; thật vậy, một daemon đơn giản được định nghĩa trong file `skeleton_test.c`, như dưới đây:

```
$ cat service/skeleton_test.c
#include <unistd.h>

/* This demo does nothing except for testing /etc/init.d/skeleton */

int main(int argc, char *argv[])
{
        daemon(0, 0);
        while (1) {
                sleep(1);
        }
        return 0;
}
```

còn file recipe `service_0.1.bb` được định nghĩa như dưới đây:

```
$ cat service_0.1.bb
SUMMARY = "The canonical example of init scripts"
SECTION = "base"
DESCRIPTION = "This recipe is a canonical example of init scripts"
LICENSE = "GPL-2.0-only"
LIC_FILES_CHKSUM = "file://${WORKDIR}/COPYRIGHT;md5=349c872e0066155e181
8b786938876a4"

SRC_URI = "file://skeleton \
           file://skeleton_test.c \
           file://COPYRIGHT \
           "

do_compile () {
        ${CC} ${CFLAGS} ${LDFLAGS} ${WORKDIR}/skeleton_test.c -o ${WORKDI
R}/skeleton-test
}

do_install () {
        install -d ${D}${sysconfdir}/init.d
        cat ${WORKDIR}/skeleton | \
          sed -e 's,/etc,${sysconfdir},g' \
              -e 's,/usr/sbin,${sbindir},g' \
              -e 's,/var,${localstatedir},g' \
              -e 's,/usr/bin,${bindir},g' \
              -e 's,/usr,${prefix},g' > ${D}${sysconfdir}/init.d/skeleton
        chmod a+x ${D}${sysconfdir}/init.d/skeleton

        install -d ${D}${sbindir}
        install -m 0755 ${WORKDIR}/skeleton-test ${D}${sbindir}/
}

RDEPENDS:${PN} = "initscripts"

CONFFILES:${PN} += "${sysconfdir}/init.d/skeleton"
```

Những điều thú vị cần nhấn mạnh ở đây là như sau:

- `LIC_FILES_CHKSUM` trỏ tới một file license tùy biến nằm trong source của dự án; đó là lý do định nghĩa của nó dùng `WORKDIR` để chỉ dẫn build system nơi tìm nội dung license.

  Trong tình huống này, để tính checksum cho một file nội dung license tùy biến, chúng ta có thể dùng lệnh `md5sum` như dưới đây:

  ```
  $ md5sum service/COPYRIGHT
  349c872e0066155e1818b786938876a4  service/COPYRIGHT
  ```

  Checksum được tạo ra bằng với checksum được chỉ định ở trên trong recipe.

- Vì dự án không có `Makefile`, task `do_compile` chứa command line để compile daemon; ngoài ra, trong `do_install`, các lời gọi `install` phù hợp được dùng để cài nó.

- Trong `do_install` cũng có việc cài file service `skeleton` (xem bên dưới) vào thư mục `${sysconfdir}/init.d/skeleton` (lưu ý rằng biến `sysconfdir` thường được phân giải thành `/etc`).

- Recipe phụ thuộc vào package `initscripts`, package cung cấp các script khởi tạo hệ thống cơ bản lúc khởi động (và ngược lại lúc tắt máy) cho hệ thống (xem recipe `poky/meta/recipes-core/initscripts/initscripts_1.0.bb`).

- Thiết lập biến `CONFFILES` được dùng để chỉ định file cấu hình của package như mô tả trong Mục 6.3.4.

Vì mọi service thường chạy dưới dạng daemon (dù có một số ngoại lệ), chúng ta cần một cách để dừng, khởi động hoặc truy vấn trạng thái của service; để làm vậy, Initd dùng các file đặc biệt, thường được gọi chính là service, được định nghĩa theo một định dạng đặc biệt, và `skeleton` được triển khai theo cách đó.

Nếu xem cấu trúc file, chúng ta có thể thấy đoạn code sau:

```
$ cat service/skeleton
#! /bin/sh
### BEGIN INIT INFO
# Provides:          skeleton
# Required-Start:    $local_fs
# Should-Start:
# Required-Stop:     $local_fs
# Should-Stop:
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Example initscript
# Description:       This file should be used to construct scripts to be
#                    placed in /etc/init.d
### END INIT INFO
...
```

Dù giải thích phần bên trong của Initd nằm ngoài phạm vi của sách, chúng ta có thể nói vài lời giải thích cách nó hoạt động về sau. Trong phần mô tả ở trên, chúng ta thông báo cho initscripts (tức là mọi script dùng để quản lý các service của Initd) rằng service của chúng ta nên chạy ở runlevel 2, 3, 4 và 5 khi khởi động và ở 0, 1 và 6 khi tắt máy. Hơn nữa, service yêu cầu các local filesystem được mount trước các giai đoạn chạy hoặc dừng.

> Runlevel là một trạng thái hoạt động đặt sẵn, được định nghĩa là một số nguyên duy nhất có thể nằm trong khoảng từ không đến sáu, trong một OS Unix-like. Mỗi trạng thái hoạt động xác định những chương trình nào có thể thực thi sau khi OS boot.

Sau đó file tiếp tục như dưới đây:

```
...
# The definition of actions: (From LSB 3.1.0)
# start         start the service
# stop          stop the service
# restart       stop and restart the service if the service is already
#               running, otherwise start the service
# try-restart   restart the service if the service is already running
# reload            cause the configuration of the service to be reloaded
#               without actually stopping and restarting the service
# force-reload  cause the configuration to be reloaded if the service
#               supports this, otherwise restart the service if it is
#               running
# status            print the current status of the service

# The start, stop, restart, force-reload, and status actions shall be
# supported by all init scripts; the reload and the try-restart actions
# are optional
...
```

Đây là một số thông tin về các hành động mặc định, tức là service nên làm gì khi chúng ta yêu cầu service dừng, khởi động, khởi động lại, v.v. Các hành động này được parse rồi thực thi ở phần cuối của file, như dưới đây:

```
...
case "$1" in
start)
        do_start
        ;;
stop)
        do_stop || exit $?
        ;;
status)
        status_of_proc
        ;;
restart)
        # Always start the service regardless the status of do_stop
        do_stop
        do_start
        ;;
try-restart|force-reload)
        # force-reload is the same as reload or try-restart according
        # to its definition, the reload is not implemented here, so
        # force-reload is the alias of try-restart here, but it should
        # be the alias of reload if reload is implemented.
        #
        # Only start the service when do_stop succeeds
        do_stop && do_start
        ;;
#reload)
        # If the "reload" action is implemented properly, then let the
        # force-reload be the alias of reload, and remove it from
        # try-restart|force-reload)
        #
        #do_reload
        #;;
*)
        echo "Usage: $0 {start|stop|status|restart|try-
restart|force-relo
ad}" >&2
        exit 3
        ;;
esac
```

Ví dụ, người dùng có thể yêu cầu initscripts khởi động hoặc dừng service của chúng ta bằng hai lệnh dưới đây:

```
# /etc/init.d/skeleton start
# /etc/init.d/skeleton stop
```

Và đây cũng chính là các lệnh mà Initd thực thi trong quy trình boot hoặc tắt máy.

### 11.1.2 Một ví dụ Systemd đơn giản (A Systemd Simple Example)

Phạm vi của mục này là cung cấp một service mới cho Systemd, làm cùng công việc như Initd nhưng theo một cách hoàn toàn khác. Và điều này cũng được khẳng định qua cách một recipe cho Systemd phải được triển khai.

Trong meta layer của mình, chúng ta có thể thêm một recipe mới như dưới đây:

```
$ cd $CY_METADIR
$ tree recipes-daemons/service/
recipes-daemons/service/
├── service
│   ├── COPYRIGHT
│   ├── skeleton.service
│   └── skeleton_test.c
└── service_0.2.bb

1 directory, 4 files
```

Dù có vẻ như không có gì thay đổi, thực ra có rất nhiều khác biệt, bắt đầu từ cách triển khai daemon. Thật vậy, chúng ta có như sau:

```
$ cd recipes-daemons/service/
$ cat service/skeleton_test.c
#include <unistd.h>

/* This demo does nothing except for testing the Systemd skeleton.servi
ce */
int main(int argc, char *argv[])
{
        while (1) {
              sleep(1);
        }
        return 0;
}
```

Trong đoạn code trên, chúng ta không có hàm `daemon()` vì Systemd có khả năng biến mọi process thành daemon rồi chạy nó. Tuy nhiên, cách thực thi một service cụ thể được định nghĩa trong file `skeleton.service`, file định nghĩa đầy đủ service mới. Dưới đây là một ví dụ về code demo của chúng ta:

```
$ cat service/skeleton.service
[Unit]
Description=The skeleton service

[Service]
Type=simple
Restart=always
RestartSec=1
ExecStart=/usr/sbin/skeleton-test

[Install]
WantedBy=multi-user.target
```

Một file có tên kết thúc bằng `.service` mã hóa thông tin về một process được Systemd kiểm soát và giám sát, tức là cách khởi động hoặc dừng service, trong những hoàn cảnh nào nó nên được tự động khởi động hoặc dừng, và thông tin về phụ thuộc và thứ tự cho các software liên quan. Nó được gọi là unit configuration. Cách viết các file này và mọi thiết lập cấu hình khả dĩ nằm ngoài phạm vi của sách, và bạn đọc có thể xem tài liệu đầy đủ tại `https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html`; tuy nhiên, ở đây chúng ta nên giải thích ít nhất những gì đã đặt vào file service ở trên.

Các mục cấu hình chung được cấu hình trong các section chung `Unit` và `Install`, còn các tùy chọn cấu hình service-specific được cấu hình trong section `Service`.

Với `Description`, chúng ta đặt một tiêu đề human-readable ngắn cho unit. Lưu ý rằng vì Systemd dùng nó làm nhãn user-visible cho unit, chuỗi này nên xác định unit thay vì mô tả nó, bất chấp tên gọi.

Trong `WantedBy`, có thể được dùng nhiều lần, chúng ta có thể chỉ định một danh sách space-separated các tên unit muốn service này chạy trước khi chúng khởi động. Đây là cách phổ biến nhất để chỉ định một unit nên được bật thế nào. Nói đơn giản, tùy chọn này được dùng để chỉ định phụ thuộc trong môi trường Systemd (xem `https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html`).

Ngoài hai section này, phần thú vị để hiểu cách một service có thể được định nghĩa trong Systemd nằm trong section `Service` ở trên. Ở đây, chúng ta có thể chỉ định nhiều directive để định nghĩa cách service hoạt động.

Những directive quan trọng nhất là

- `Type`: Phân loại service theo hành vi process và cách chạy thành daemon của chúng, và nó quan trọng vì nó cho Systemd biết cách quản lý đúng service và tìm ra trạng thái của nó. Directive `Type` hỗ trợ nhiều thiết lập; tuy nhiên, những thiết lập quan trọng nhất cho mục đích của chúng ta là

  - `simple`: Chỉ định rằng main process của service thực thi như một process bình thường và service bị dừng khi process kết thúc.

  - `forking`: Chỉ định rằng main process của service fork một child process, rồi parent process thoát gần như ngay lập tức. Vì vậy, ngược với những gì `simple` làm, thiết lập này cho Systemd biết process vẫn đang chạy dù parent đã thoát (đây là cách một daemon nên được thực thi).

  - `oneshot`: Được dùng cho các task one-off. Thật vậy, loại này cho biết process sẽ short-lived và Systemd nên đợi process thoát trước khi tiếp tục với các unit khác.

- `Restart`: Cho biết khi nào Systemd sẽ cố tự động khởi động lại service. Nó có thể được đặt thành các giá trị như `always`, `on-success`, `on-failure`, v.v. Các giá trị này sẽ kích hoạt việc khởi động lại tùy theo cách service bị dừng.

- `RestartSec`: Chỉ định khoảng thời gian tính bằng giây cần chờ trước khi cố khởi động lại service khi tính năng tự động khởi động lại service được bật.

- `ExecStart`: Chỉ định đường dẫn đầy đủ và các đối số của lệnh cần thực thi để khởi động process. Nó chỉ có thể được chỉ định một lần (ngoại trừ các service `oneshot`), và nếu đường dẫn tới lệnh có ký tự gạch ngang (`-`) đứng trước, các exit status khác không sẽ được chấp nhận mà không đánh dấu việc kích hoạt unit là thất bại.

- `ExecStop`: Ngược với `ExecStart`, nó cho biết lệnh cần để dừng service. Nếu không được cung cấp, process sẽ bị kill ngay lập tức khi service bị dừng.

- `ExecReload`: Đây là một directive tùy chọn cho biết lệnh cần để nạp lại cấu hình của service, nếu có.

> Các directive thú vị (và hữu ích) khác còn có `ExecStartPre`, `ExecStartPost` và `ExecStopPost`, có thể được dùng để thực thi một số lệnh trước hoặc sau các thao tác khởi động và dừng. Tuy nhiên, chúng không được trình bày ở đây vì lý do dung lượng, nhưng bạn đọc có thể đọc cách chúng hoạt động tại `https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html`.

Giờ hẳn đã rõ vì sao chúng ta dùng các thiết lập trên để định nghĩa service Systemd mới.

OK, giờ ở bước cuối cùng, chúng ta phải định nghĩa một recipe phù hợp trong một file `.bb` để tạo service mới. Một bản triển khai khả dĩ được trình bày dưới đây:

```
$ cat service_0.2.bb
SUMMARY = "Simple example of systemd service"
DESCRIPTION = "A simple example of the skeleton daemon installed as a s
ystemd service"
MAINTAINER = "Rodolfo Giometti <giometti@enneenne.com>"
SECTION = "base"
LICENSE = "GPL-2.0-only"
LIC_FILES_CHKSUM = "file://${WORKDIR}/COPYRIGHT;md5=349c872e0066155e181
8b786938876a4"

inherit systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "skeleton.service"

SRC_URI = " \
        file://skeleton.service \
        file://skeleton_test.c \
        file://COPYRIGHT \
"
do_compile () {
        ${CC} ${CFLAGS} ${LDFLAGS} ${WORKDIR}/skeleton_test.c -o ${WORK
DIR}/skeleton-test

}

do_install() {
        install -d ${D}/${systemd_unitdir}/system
        cat ${WORKDIR}/skeleton.service | \
          sed -e 's,/etc,${sysconfdir},g' \
              -e 's,/usr/sbin,${sbindir},g' \
              -e 's,/var,${localstatedir},g' \
              -e 's,/usr/bin,${bindir},g' \
              -e 's,/usr,${prefix},g' > \
                 ${D}/${systemd_unitdir}/system/skeleton.service

        install -d ${D}/${sbindir}
        install -m 0700 ${WORKDIR}/skeleton-test ${D}/${sbindir}/skelet
on-test
}

FILES:${PN} += "${systemd_unitdir}/system/skeleton.service"
```

Phần mô tả của recipe khá hiển nhiên, còn những điều thú vị bắt đầu từ directive `inherit systemd`, nơi chúng ta yêu cầu BitBake nạp class `systemd`. Class này dùng nhiều biến để chỉ định service mới nên hoạt động thế nào. Cụ thể, chúng ta có

- `SYSTEMD_AUTO_ENABLE`: Chỉ định service được nêu trong `SYSTEMD_SERVICE` có nên tự động khởi động hay không. Mặc định là `enable`, và chúng ta có thể tắt service bằng cách đặt biến thành `disable`.

- `SYSTEMD_DEFAULT_TARGET`: Đặt unit mặc định mà Systemd khởi động lúc boot. Thông thường, đây là `multi-` `user.target` hoặc `graphical.target`, và nó được đặt trong một image recipe, không phải trong package recipe.

- `SYSTEMD_PACKAGES`: Được dùng để liệt kê các package mà build system có thể tìm thấy các file unit của Systemd khi chúng không có trong package chính của recipe. Thật vậy, biến `SYSTEMD_PACKAGES` được đặt sao cho các file unit của Systemd được giả định nằm trong package chính của recipe, như dưới đây:

  ```
  SYSTEMD_PACKAGES ?= "${PN}"
  ```

- `SYSTEMD_SERVICE`: Chỉ định tên service Systemd cho một package. Để dùng nó, chúng ta phải dùng một package name override để chỉ ra package mà giá trị áp dụng. Trong trường hợp này, có thể chỉ định nhiều service, mỗi service cách nhau bằng một dấu cách.

Lưu ý cuối cùng, chúng ta không nên quên đặt đúng biến `FILES` để thêm file `skeleton.service`; nếu không, build system sẽ báo lỗi.

OK, giờ mọi thứ đã sẵn sàng, và chúng ta có thể bắt đầu tạo service mới bằng cách thực thi `bitbake` như dưới đây:

```
$ bitbake service
...
Currently  2 running tasks (734 of 746)  98% |######################## |
0: service-0.2-r0 do_prepare_recipe_sysroot - 0s (pid 941612)
1: service-0.2-r0 do_patch - 0s (pid 941625)
```

Nếu mọi thứ hoạt động tốt, recipe mới `service-0.2` được xử lý, và các package mới được tạo như dưới đây:

```
$ cy-ipk find service
cy-ipk: searching in /home/giometti/yocto/imx-yocto-bsp/imx8mp-build...
tmp/deploy/ipk/armv8a/service-dev_0.2-r0_armv8a.ipk
tmp/deploy/ipk/armv8a/service_0.2-r0_armv8a.ipk
tmp/deploy/ipk/armv8a/service-src_0.2-r0_armv8a.ipk
tmp/deploy/ipk/armv8a/service-dbg_0.2-r0_armv8a.ipk
```

Để xem thông tin của package, chúng ta có thể dùng công cụ `cy-ipk` như thường lệ:

```
$ cy-ipk get-info tmp/deploy/ipk/armv8a/service_0.2-r0_armv8a.ipk
Package: service
Version: 0.2-r0
Description: Simple example of systemd service
 A simple example of the skeleton daemon installed as a systemd service
Section: base
Priority: optional
Maintainer: Rodolfo Giometti <giometti@enneenne.com>
License: GPL-2.0-only
Architecture: armv8a
OE: service
Depends: libc6 (>= 2.35)
Source: service_0.2.bb
```

Sau đó chúng ta có thể chuyển package mới vào kit embedded:

```
$ scp $BUILDDIR/tmp/deploy/ipk/armv8a/service_0.2-r0_armv8a.ipk \
        root@192.168.32.132:/tmp/
```

Trên target machine, chúng ta có thể cài nó bằng công cụ `opkg`:

```
# opkg install /tmp/service_0.2-r0_armv8a.ipk
Installing service (0.2) on root
Configuring service.
```

> Trong khi cài package, chúng ta có thể nhận được nhiều thông điệp từ subsystem của Systemd như dưới đây:
>
> ```
> [   78.221247] systemd-sysv-generator[916]: SysV service '/etc/ini
> t.d/umountfs' lacks a native systemd unit file. Automatically gene
> rating a unit file for compatibility. Please update package to inc
> lude a native systemd unit file, in order to make it more safe and
>  robust.
> ```
>
> Chúng có thể được yên tâm bỏ qua.

Sau đó chúng ta có thể yêu cầu Systemd hiển thị trạng thái service mới bằng tiện ích `systemctl`:

```
# systemctl -l --no-pager status skeleton
* skeleton.service - The skeleton service
     Loaded: loaded (8;;file://imx8mp-icore-cy/lib/systemd/system/skele
ton.service/lib/systemd/system/skeleton.service8;;; enabled; vendor pre
set: enabled)
     Active: active (running) since Thu 2022-04-28 18:03:09 UTC; 10s ago
   Main PID: 919 (skeleton-test)
      Tasks: 1 (limit: 3197)
     Memory: 132.0K
     CGroup: /system.slice/skeleton.service
             `- 919 /usr/sbin/skeleton-test

Apr 28 18:03:09 imx8mp-icore-cy systemd[1]: Started The skeleton servic
e.
```

OK, mọi thứ đã sẵn sàng, nhưng trước khi kết thúc mục này, chúng ta cũng nên kiểm chứng rằng service sẽ khởi động lúc boot. Vậy hãy khởi động lại machine bằng lệnh `reboot`, rồi xem các booting message; chúng ta sẽ thấy nội dung như dưới đây:

```
...
[  OK  ] Started ISP i.MX 8Mplus daemon.
         Starting IPv6 Packet Filtering Framework...
         Starting IPv4 Packet Filtering Framework...
         Starting Network Time Service (one-shot ntpdate mode)...
         Starting Telephony service...
[  OK  ] Started The skeleton service.
...
```

Service mới của chúng ta đã được khởi động đúng! Và chúng ta có thể kiểm chứng điều đó bằng cách dùng lại công cụ `systemctl` sau khi đăng nhập với tư cách root:

```
# systemctl -l --no-pager status skeleton
* skeleton.service - The skeleton service
     Loaded: loaded (8;;file://imx8mp-icore-
cy/lib/systemd/system/skeleton.service/lib/sys
temd/system/skeleton.service8;;; enabled; vendor preset: disabled)
     Active: active (running) since Fri 2022-04-29 11:14:46 UTC; 1min
56s ago
   Main PID: 261 (skeleton-test)
      Tasks: 1 (limit: 3197)
     Memory: 140.0K
     CGroup: /system.slice/skeleton.service
             `- 261 /usr/sbin/skeleton-test

Apr 29 11:14:46 imx8mp-icore-cy systemd[1]: Started The skeleton servic
e.
```

Service mới của chúng ta đã được khởi động đúng lúc boot.

## 11.2 Lấy bản phát hành mới hơn (hoặc cũ hơn) (Getting Newer (or Older) Releases)

Một vấn đề thường gặp khác khi quản lý một OS phức tạp là nhu cầu cập nhật một package để sửa một số bug hoặc có chức năng mới. Trong tình huống này, Yocto build system cung cấp cho chúng ta những công cụ tốt để dễ dàng cập nhật một package lên bản phát hành mới hơn (hoặc cũ hơn nếu cần).

Công cụ đầu tiên là một subcommand của `devtool` có tên `check-upgrade-status`:

```
$ devtool check-upgrade-status -h
NOTE: Starting bitbake server...
usage: devtool check-upgrade-status [-h] [--all] [recipe ...]

Prints a table of recipes together with versions currently provided by
Recipes, and latest upstream versions, when there is a later version
available

arguments:
  recipe      Name of the recipe to report (omit to report upgrade info
              for all recipes)
...
```

Dưới đây là một ví dụ một phần của bảng báo cáo về mọi recipe:

```
$ devtool check-upgrade-status
...
INFO: bind          9.16.20  9.16.21 Armin Kuster <akuster808@gmail.com
>
INFO: inetutils     2.1      2.2     Tom Rini <trini@konsulko.com>
INFO: iproute2      5.13.0   5.14.0  Changhyeok Bae <changhyeok.bae@gma
il.com>
INFO: openssl       1.1.1l   3.0.0   Alexander Kanavin <alex.kanavin@gm
ail.com>
INFO: base-passwd   3.5.29   3.5.51  Anuj Mittal <anuj.mittal@intel.com
> cannot be updated due to: Version 3.5.38 requires cdebconf for update
-passwd utility
...
```

Chú ý lý do không nâng cấp recipe `base-passwd`. Trong ví dụ này, dù đã có phiên bản mới ở upstream, bạn không muốn dùng nó vì phụ thuộc vào `cdebconf` không dễ thỏa mãn. Các maintainer có thể nêu lý do được hiển thị bằng cách thêm biến `RECIPE_NO_UPDATE_REASON` vào recipe tương ứng. Xem recipe `base-passwd.bb` trong layer `poky` để có ví dụ:

```
$ cat poky/meta/recipes-core/base-passwd/base-passwd_3.5.29.bb
SUMMARY = "Base system master password/group files"
DESCRIPTION = "The master copies of the user database files (/etc/passw
d and /etc/group).  The update-passwd tool is also provided to keep the
 system databases synchronized with these master files."
HOMEPAGE = "https://launchpad.net/base-passwd"
SECTION = "base"
LICENSE = "GPL-2.0-only"
LIC_FILES_CHKSUM = "file://COPYING;md5=eb723b61539feef013de476e68b5c50a"

RECIPE_NO_UPDATE_REASON = "Version 3.5.38 requires cdebconf for update-
passwd utility"
...
```

Tuy nhiên, chúng ta biết chính xác package nào cần cập nhật, và có thể dùng subcommand `latest-version` như dưới đây:

```
$ devtool latest-version -h
NOTE: Starting bitbake server...
usage: devtool latest-version [-h] recipename

Queries the upstream server for what the latest upstream release is (for
git, tags are checked, for tarballs, a list of them is obtained, and one
with the highest version number is reported)

arguments:
  recipename  Name of recipe to query (just name - no version, path or
              extension)
...
```

> Lưu ý rằng subcommand này không nhận ra `RECIPE_NO_UPDATE_REASON` như `check-upgrade-status` ở trên. Thật vậy, nếu thực thi nó trên `base-passwd`, chúng ta không nhận được warning nào:
>
> ```
> $ devtool latest-version base-passwd
> ...
> INFO: Current version: 3.5.29
> INFO: Latest version: 3.6.3
> ```
>
> Vì vậy best practice là dùng cả hai công cụ trước khi bắt đầu cập nhật một package.

Ví dụ, chúng ta có thể lấy phiên bản mới nhất của package `dropbear`, như dưới đây:

```
$ devtool latest-version dropbear
...
URL transformed to HTTPS due to an HSTS policy
--2024-03-18 14:35:32--  https://matt.ucc.asn.au/dropbear/releases/
Resolving matt.ucc.asn.au (matt.ucc.asn.au)... 104.26.8.126, 104.26.9.1
26, 172.67.72.143, ...
Connecting to matt.ucc.asn.au (matt.ucc.asn.au)|104.26.8.126|:443... co
nnected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [text/html]
Saving to: '/tmp/wget-index-g4al2_73/wget-listing-3k45ri9r'

     0K .......... ...                                        483K=0.03s

2024-03-18 14:35:33 (483 KB/s) - '/tmp/wget-index-g4al2_73/wget-listing
-3k45ri9r' saved [13441]

INFO: Current version: 2020.81
INFO: Latest version: 2022.83
```

OK, giờ đã biết bản phát hành mới nhất của một package, chúng ta nên xem cách tiến hành cập nhật thực sự. Và để làm vậy, chúng ta có thể dùng subcommand `upgrade`, như dưới đây:

```
$ devtool upgrade -h
NOTE: Starting bitbake server...
usage: devtool upgrade [-h] [--version VERSION] [--srcrev SRCREV]
                       [--srcbranch SRCBRANCH] [--branch BRANCH]
                       [--no-patch]
                       [--no-overrides] [--same-dir | --no-same-dir]
                       [--keep-temp] [--keep-failure]
                       recipename [srctree]

Upgrades an existing recipe to a new upstream version. Puts the upgraded
recipe file into the workspace along with any associated files, and
extracts the source tree to a specified location (in case patches need
rebasing or adding to as a result of the upgrade).

arguments:
  recipename            Name of recipe to upgrade (just name - no
                        version, path or extension)
  srctree               Path to where to extract the source tree. If not
                        specified, a subdirectory of /home/giometti/yoct
                        o/imx-yocto-bsp/imx8mp-build/workspace/sources
                        will be used.

options:
  -h, --help            show this help message and exit
  --version VERSION, -V VERSION
                        Version to upgrade to (PV). If omitted, latest
                        upstream version will be determined and used, if
                        possible.
  --srcrev SRCREV, -S SRCREV
                        Source revision to upgrade to (useful when
                        fetching from an SCM such as git)
  --srcbranch SRCBRANCH, -B SRCBRANCH
                        Branch in source repository containing the
                        revision to use (if fetching from an SCM such as
                        git)
  --branch BRANCH, -b BRANCH
                        Name for new development branch to checkout
                        (default "devtool")
  --no-patch            Do not apply patches from the recipe to the new
                        source code
  --no-overrides, -O    Do not create branches for other override
                        configurations
  --same-dir, -s        Build in same directory as source
  --no-same-dir         Force build in a separate build directory
  --keep-temp           Keep temporary directory (for debugging)
  --keep-failure        Keep failed upgrade recipe and associated files
                        (for debugging)
```

Bằng công cụ này, chúng ta có thể (hy vọng là) dễ dàng cập nhật một package, vì nó đặt file recipe đã được nâng cấp vào workspace cùng mọi file liên quan. Sau đó source được giải nén, và trong trường hợp có patch, một lần rebase được tự động gọi.

Nói đơn giản, nếu may mắn, quy trình có thể kết thúc tự động; nếu không, chúng ta phải làm lại một số việc.

Để làm một ví dụ thực tế về cách nâng cấp thực sự, hãy dùng lệnh `devtool` `upgrade` trên package `dropbear` để chuyển sang bản phát hành `2022.83`. Recipe hiện tại nằm trong meta layer `poky`:

```
$ cat ./poky/meta/recipes-core/dropbear/dropbear_2020.81.bb
require dropbear.inc

SRC_URI[sha256sum] = "48235d10b37775dbda59341ac0c4b239b82ad6318c31568b9
85730c788aac53b"
```

Để xem nội dung biến `SRC_URI`, chúng ta phải xem file được require `dropbear.inc`:

```
$ cat ./poky/meta/recipes-core/dropbear/dropbear.inc
SUMMARY = "A lightweight SSH and SCP implementation"
...
SRC_URI = "http://matt.ucc.asn.au/dropbear/releases/dropbear-${PV}.tar.bz2 \
           file://0001-urandom-xauth-changes-to-options.h.patch \
           file://init \
           file://dropbearkey.service \
           file://dropbear@.service \
           file://dropbear.socket \
           file://dropbear.default \
           ${@bb.utils.contains('DISTRO_FEATURES', 'pam', '${PAM_SRC_UR
I}', '', d)} \
           ${@bb.utils.contains('PACKAGECONFIG', 'disable-weak-ciphers'
, 'file://dropbear-disable-weak-ciphers.patch', '', d)} "
...
```

Một số file patch được liệt kê, vì vậy chúng ta có thể gặp vấn đề khi áp dụng chúng lên bản phát hành mới. Tuy nhiên, chúng ta lạc quan và quyết định tiến hành. Để bắt đầu quy trình cập nhật, chúng ta thực thi lệnh `devtool` `upgrade` với option argument `-V` chỉ định bản phát hành muốn có (lưu ý rằng đôi khi chúng ta không cần bản phát hành mới nhất, và option argument `-V` giúp được việc đó):

```
$ devtool upgrade -V 2022.83 dropbear
...
INFO: Fetching http://matt.ucc.asn.au/dropbear/releases/dropbear-2022.8
3.tar.bz2...
...
INFO: Rebasing devtool onto 069d4ed47544b121abc70022804066026beb629f
WARNING: Command 'git rebase 069d4ed47544b121abc70022804066026beb629f'
failed:
Auto-merging default_options.h
CONFLICT (content): Merge conflict in default_options.h

You will need to resolve conflicts in order to complete the upgrade.
INFO: Upgraded source extracted to /home/giometti/yocto/imx-yocto-bsp/i
mx8mp-build/workspace/sources/dropbear
INFO: New recipe is /home/giometti/yocto/imx-yocto-bsp/imx8mp-build/wor
kspace/recipes/dropbear/dropbear_2022.83.bb
```

Subcommand `devtool` đã tải đúng source và bắt đầu rebase để cố áp dụng mọi patch trong recipe cũ. Tuy nhiên, chúng ta không may mắn, và việc rebase thất bại. Vì vậy chúng ta phải giải quyết các vấn đề. Để làm vậy, chúng ta phải chuyển tới nơi source đã được đặt:

```
$ cd $BUILDDIR/workspace/sources/dropbear
```

Sau đó chúng ta phải khởi động lại việc rebase như `devtool` đã làm:

```
$ git rebase 069d4ed47544b121abc70022804066026beb629f
Auto-merging default_options.h
CONFLICT (content): Merge conflict in default_options.h
error: could not apply af4067b... dropbear: new feature: disable-weak-c
iphers
hint: Resolve all conflicts manually, mark them as resolved with
hint: "git add/rm <conflicted_files>", then run "git rebase --continue".
hint: You can instead skip this commit: run "git rebase --skip".
hint: To abort and get back to the state before "git rebase", run "git
hint: rebase --abort".
Could not apply af4067b... dropbear: new feature: disable-weak-ciphers
```

> Lưu ý rằng commit ID có thể khác. Bạn đọc nên xét những gì mình nhận được trong thông điệp trên tại các dòng sau:
>
> ```
> ...
> INFO: Rebasing devtool onto 069d4ed47544b121abc70022804066026beb62
> 9f
> WARNING: Command 'git rebase 069d4ed47544b121abc70022804066026beb6
> 29f' failed:
> ...
> ```

Việc rebase dừng lại, trả về cùng lỗi như trên, khi đó chúng ta phải xem xét xung đột:

```
$ git diff
diff --cc default_options.h
index 33238ec,4bd7bd4..0000000
--- a/default_options.h
+++ b/default_options.h
@@@ -192,8 -162,8 +192,13 @@@ IMPORTANT: Some options will require "m

   * Small systems should generally include either curve25519 or ecdh f
or performance.
   * curve25519 is less widely supported but is faster
++<<<<<<< HEAD
 + */
 +#define DROPBEAR_DH_GROUP14_SHA1 1
++=======
+  */
+ #define DROPBEAR_DH_GROUP14_SHA1 0
++>>>>>>> af4067b (dropbear: new feature: disable-weak-ciphers)
  #define DROPBEAR_DH_GROUP14_SHA256 1
  #define DROPBEAR_DH_GROUP16 0
  #define DROPBEAR_CURVE25519 1
```

Vấn đề rất đơn giản, và patch sau sẽ giải quyết nó:

```
--- a/default_options.h
+++ b/default_options.h
@@ -193,7 +193,7 @@ IMPORTANT: Some options will require "make clean" after
changes */
  * Small systems should generally include either curve25519 or ecdh fo
r performance.
  * curve25519 is less widely supported but is faster
  */
-#define DROPBEAR_DH_GROUP14_SHA1 1
+#define DROPBEAR_DH_GROUP14_SHA1 0
 #define DROPBEAR_DH_GROUP14_SHA256 1
 #define DROPBEAR_DH_GROUP16 0
 #define DROPBEAR_CURVE25519 1
```

Sau đó, để đóng xung đột, chúng ta phải thêm các sửa đổi vào index rồi gọi `git rebase --continue` để chuyển sang bước tiếp theo:

```
$ git add default_options.h
$ git rebase --continue
ACCEPT commit text
[detached HEAD a8559da] dropbear: new feature: disable-weak-ciphers
 Author: Joseph Reynolds <joseph.reynolds1@ibm.com>
 1 file changed, 1 insertion(+), 1 deletion(-)
Successfully rebased and updated refs/heads/devtool.
```

Tuyệt! Các patch khác đã được áp dụng, và giờ việc rebase đã hoàn tất. Vì vậy chúng ta có thể kết thúc quy trình cập nhật bằng cách yêu cầu `devtool` chuyển package mới được cập nhật vào meta layer của mình, như dưới đây:

```
$ devtool finish dropbear meta-cy
...
INFO: Updating patch 0001-urandom-xauth-changes-to-options.h.patch
INFO: Updating patch 0005-dropbear-enable-pam.patch
INFO: Updating patch dropbear-disable-weak-ciphers.patch
INFO: Moving recipe file to /home/giometti/yocto/imx-yocto-bsp/sources/
meta-cy/recipes-core/dropbear
INFO: Leaving source tree /home/giometti/yocto/imx-yocto-bsp/imx8mp-bui
ld/workspace/sources/dropbear as-is; if you no longer need it then plea
se delete it manually
```

Bây giờ chúng ta có thể xem source của recipe mới bằng cách chuyển vào meta layer:

```
$ tree recipes-core/dropbear
recipes-core/dropbear
├── dropbear
│   ├── 0001-urandom-xauth-changes-to-options.h.patch
│   ├── 0005-dropbear-enable-pam.patch
│   ├── 0006-dropbear-configuration-file.patch
│   ├── dropbear
│   ├── dropbear.default
│   ├── dropbear-disable-weak-ciphers.patch
│   ├── dropbearkey.service
│   ├── dropbear@.service
│   ├── dropbear.socket
│   └── init
├── dropbear_2022.83.bb
└── dropbear.inc

1 directory, 12 files
```

Để thử code, chúng ta làm như thường lệ; trước tiên nên tạo package mới để kiểm tra mọi thứ vẫn hoạt động đúng:

```
$ bitbake dropbear
...
0: dropbear-2022.83-r0 do_compile - 0s (pid 965341)
...
```

Và trong trường hợp không có lỗi, chúng ta có thể tạo một Yocto image mới, image này giờ sẽ bao gồm package `dropbear` mới:

```
$ bitbake engicam-evaluation-image-mx8
```

> Ở đây, chúng ta cũng có thể dùng image `cy-evaluation-image-mx8` của mình để thử recipe mới.

Bây giờ chúng ta có thể ghi lại thẻ microSD với image mới; tuy nhiên, để chắc chắn phiên bản mới đã thực sự được cài, chúng ta có thể xem trong manifest file như đã giải thích trong Mục 7.4.3:

```
$ grep dropbear $BUILDDIR/tmp/deploy/images/imx8mp-icore-cy/engicam-eva
luation-image-mx8-imx8mp-icore-cy.manifest
dropbear armv8a 2022.83-r0
packagegroup-core-ssh-dropbear all 1.0-r1
```

OK, đúng bản phát hành. Bây giờ, ở bước cuối cùng, chúng ta phải chạy image mới và kiểm chứng mọi thứ vẫn đang chạy. Khi boot xong, chúng ta phải đăng nhập với tư cách root và kiểm tra lại bản phát hành của `dropbear`, như dưới đây:

```
# dropbear -V
Dropbear v2022.83
```

Trong trường hợp các thiết lập mạng bị mất, chúng ta nên khôi phục các thiết lập mặc định như đã giải thích trong Mục 1.3.2, sau đó phải thử một kết nối SSH:

```
$ ssh root@192.168.32.132
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle atta
ck)!
It is also possible that a host key has just been changed.
The fingerprint for the RSA key sent by the remote host is
SHA256:LzmhIlYZuOP0qGYGHOegNycfNUju/8VgCImJh/7ACsg.
Please contact your system administrator.
Add correct host key in /home/giometti/.ssh/known_hosts to get rid of t
his message.
Offending RSA key in /home/giometti/.ssh/known_hosts:104
  remove with:
  ssh-keygen -f "/home/giometti/.ssh/known_hosts" -R "192.168.32.132"
Host key for 192.168.32.132 has changed and you have requested strict c
hecking.
Host key verification failed.
```

Điều này đã được dự đoán vì chúng ta đã lập trình lại thẻ microSD với một image mới, vì vậy chỉ cần xóa các key gây lỗi khỏi danh sách và thử kết nối lại:

```
$ ssh-keygen -f "/home/giometti/.ssh/known_hosts" -R "192.168.32.132"
# Host 192.168.32.132 found: line 104
/home/giometti/.ssh/known_hosts updated.
Original contents retained as /home/giometti/.ssh/known_hosts.old
$ ssh root@192.168.32.132
The authenticity of host '192.168.32.132 (192.168.32.132)' can't be est
ablished.
RSA key fingerprint is SHA256:LzmhIlYZuOP0qGYGHOegNycfNUju/8VgCImJh/7AC
sg.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.32.132' (RSA) to the list of known
hosts.
root@imx8mp-icore-cy:~#
```

Tuyệt, giờ image của chúng ta có bản phát hành `dropbear` mới hơn.

## 11.3 Sửa (hoặc append) recipe có sẵn (Editing (or Appending) Existing Recipes)

Có nhiều cách để dễ dàng sửa một recipe có sẵn, và trong mục này chúng ta sẽ xem một số cách, bắt đầu từ việc dùng lệnh `recipetool` đã giới thiệu trong Mục 4.3.

### 11.3.1 Thêm file tùy biến (Adding Custom Files)

Lệnh đơn giản hơn để dùng khi muốn sửa một recipe có sẵn là như sau:

```
$ recipetool edit hello
```

Làm như vậy, chúng ta yêu cầu Yocto build system dùng editor ưa thích để hiển thị recipe của package `hello` (lệnh sẽ mở recipe chính và mọi file `.bbappend` liên quan!). Sau đó chúng ta có thể tiến hành thay đổi file gốc; tuy nhiên, như đã nói, thay đổi một recipe không nằm trong layer tùy biến của chúng ta không phải là cách tốt hơn để giải quyết vấn đề, mà tốt hơn là dùng giải pháp `.bbappend`. Khi đó chúng ta nên dùng lệnh tiếp theo:

```
$ recipetool newappend $CY_METADIR devmem2
NOTE: Starting bitbake server...
...
/home/giometti/yocto/imx-yocto-bsp/sources/meta-cy/recipes-support/devm
em2/devmem2_2.0.bbappend
```

Bằng cách này, chúng ta có một file `devmem2_2.0.bbappend` rỗng trong layer tùy biến, có thể dùng để thực hiện mọi sửa đổi cần thiết cho recipe mà không thay đổi file recipe gốc.

> Lưu ý rằng trong ví dụ, chúng ta có một file `.bbappend` có phiên bản, và để có một file áp dụng cho bất kỳ phiên bản recipe nào, chúng ta có thể thêm option argument `-w` như dưới đây:
>
> ```
> $ recipetool newappend -w $CY_METADIR devmem2
> NOTE: Starting bitbake server...
> ...
> /home/giometti/yocto/imx-yocto-bsp/sources/meta-cy/recipes-support
> /devmem2/devmem2_%.bbappend
> ```

Mặt khác, nếu chỉ muốn thay đổi recipe để thêm một file source mới, ví dụ một tiện ích tùy biến đơn giản để gọi công cụ `devmem2` ở trên, chúng ta có thể dùng subcommand `appendsrcfiles` như dưới đây:

```
$ recipetool appendsrcfiles $CY_METADIR devmem2 cy_devmem2
NOTE: Starting bitbake server...
...
NOTE: Writing append file /home/giometti/yocto/imx-yocto-bsp/sources/me
ta-cy/recipes-support/devmem2/devmem2_2.0.bbappend
NOTE: Copying cy_devmem2 to /home/giometti/yocto/imx-yocto-bsp/sources/
meta-cy/recipes-support/devmem2/devmem2/cy_devmem2
```

> Để chỉ thêm một file duy nhất, chúng ta cũng có thể dùng subcommand `appendsrcfile` của `recipetool`; tuy nhiên, phiên bản cho nhiều file tổng quát hơn.
>
> Hơn nữa, lưu ý rằng trong một số trường hợp, chúng ta có thể muốn thêm file vào `WORKDIR` thay vì `S`, và để làm vậy có thể dùng option argument `-W`. Bạn đọc nên nhớ rằng thư mục `S` là nơi đặt source, còn `WORKDIR` là nơi recipe đang được build. Vì vậy chọn tùy chọn sau cùng này có thể dẫn đến điều chúng ta không muốn.

trong đó file `cy_devmem2` hẳn đã có sẵn, và trong ví dụ này nó chứa code sau:

```
$ cat cy_devmem2
#!/bin/sh
echo "$0 - CY release"
devmem2 $@
```

Bây giờ trong layer tùy biến, chúng ta có cấu trúc thư mục mới sau:

```
$ cd $CY_METADIR
$ tree recipes-support/devmem2/
recipes-support/devmem2/
├── devmem2
│   └── cy_devmem2
└── devmem2_2.0.bbappend

1 directory, 2 files
```

trong đó file mới `devmem2_2.0.bbappend` chứa code sau:

```
$ cat $CY_METADIR/recipes-support/devmem2/devmem2_2.0.bbappend
SRC_URI += "file://cy_devmem2;subdir=git"

FILESEXTRAPATHS:prepend := "${THISDIR}/${PN}:"
```

> Lưu ý rằng, như ở trên, để có một `.bbappend` hợp lệ cho bất kỳ phiên bản recipe nào, chúng ta có thể dùng option argument `-w`.

Bây giờ, để file `cy_devmem2` được cài đúng vào root filesystem, chúng ta phải thêm một thủ tục cài đặt phù hợp. Để làm vậy, chúng ta phải append các chỉ dẫn phù hợp vào hàm `do_install()` bằng cách thêm các dòng sau vào `devmem2_2.0.bbappend`:

```
--- a/devmem2/devmem2_2.0.bbappend
+++ b/devmem2/devmem2_2.0.bbappend
@@ -4,3 +4,7 @@

 PACKAGE_ARCH = "${MACHINE_ARCH}"
+do_install:append() {
+    install -d ${D}${bindir}
+    install cy_devmem2 ${D}${bindir}
+}
```

Bằng cách này, `bitbake` sẽ thực thi hàm `do_install()` mặc định của recipe rồi đến hàm tùy biến của chúng ta, hàm thêm chương trình `my_devmem2` vào root filesystem.

Bây giờ, để kiểm tra mọi thứ có hoạt động tốt không, chúng ta có thể thử tạo file `.ipk` cho `devmem2` bằng lệnh tiếp theo:

```
$ bitbake devmem2
```

Package mới giờ hẳn đã được tạo:

```
$ cy-ipk find devmem2
cy-ipk: searching in /home/giometti/yocto/imx-yocto-bsp/imx8mp-build...
tmp/deploy/ipk/imx8mp_icore_cy/devmem2-src_2.0-r0_imx8mp_icore_cy.ipk
tmp/deploy/ipk/imx8mp_icore_cy/devmem2_2.0-r0_imx8mp_icore_cy.ipk
tmp/deploy/ipk/imx8mp_icore_cy/devmem2-dbg_2.0-r0_imx8mp_icore_cy.ipk
tmp/deploy/ipk/imx8mp_icore_cy/devmem2-dev_2.0-r0_imx8mp_icore_cy.ipk
```

Bây giờ, để kiểm chứng lệnh mới đã được thêm, chúng ta có thể dùng công cụ `cy-ipk` như thường lệ:

```
$ cy-ipk inspect tmp/deploy/ipk/imx8mp_icore_cy/devmem2_2.0-r0_imx8mp_i
core_cy.ipk
drwxr-xr-x root/root         0 2022-05-30 16:07 ./usr/
drwxr-xr-x root/root         0 2022-05-30 16:07 ./usr/bin/
-rwxr-xr-x root/root        44 2022-05-30 16:07 ./usr/bin/cy_devmem2
-rwxr-xr-x root/root     10208 2022-05-30 16:07 ./usr/bin/devmem2
```

OK, mọi thứ đã sẵn sàng. Vì vậy chúng ta có thể cài file package vào kit embedded bằng cách chép file sang đó:

```
$ scp tmp/deploy/ipk/imx8mp_icore_cy/devmem2_2.0-r0_imx8mp_icore_cy.ipk
 \
        root@192.168.32.132:/tmp/
```

rồi cài package:

```
# opkg install /tmp/devmem2_2.0-r0_imx8mp_icore_cy.ipk
Installing devmem2 (2.0) on root
Configuring devmem2.
```

> Lưu ý rằng trong trường hợp package `devmem2` bản phát hành 2.0-r0 đã có trên hệ thống, chúng ta sẽ gặp lỗi sau:
>
> ```
> * opkg_prepare_file_for_install: Refusing to load file '/tmp/devme
> m2_2.0-r0_imx8mp_icore_cy.ipk' as it matches the installed version
>  of devmem2 (2.0-r0).
> ```
>
> Trong trường hợp này, chúng ta có thể giải quyết bằng option argument `--force-reinstall` như dưới đây:
>
> ```
> # opkg install --force-reinstall /tmp/devmem2_2.0-r0_imx8mp_icore_
> cy.ipk
> ```

Giờ chúng ta hẳn đã có file tùy biến mới:

```
# cy_devmem2
/usr/bin/cy_devmem2 - CY release

Usage:  devmem2 { address } [ type [ data ] ]
        address : memory address to act upon
        type    : access operation type : [b]yte, [h]alfword, [w]ord,
[l]ong
        data    : data to be written
```

Tại thời điểm này, bạn đọc nên chú ý option argument `-m` của lệnh `recipetool appendsrcfiles`. Nó có thể được dùng khi các file mới muốn thêm vào recipe chỉ dành riêng cho một machine cụ thể, hoặc nếu chúng ta phải cài các phiên bản khác nhau của file tùy theo giá trị `MACHINE` hiện tại.

Trong trường hợp này, chúng ta có thể dùng một phiên bản sửa đổi của lệnh để có được việc file mới chỉ được thêm khi package được tạo cho machine `imx8mp-icore-cy`. Tuy nhiên, trước khi chạy lại `recipetool`, chúng ta phải xóa những gì đã làm, nếu không lần thực thi mới sẽ không chạy thành công:

```
$ rm -rf $CY_METADIR/recipes-support/devmem2
```

Sau đó chúng ta có thể dùng lệnh tiếp theo:

```
$ recipetool appendsrcfiles -m imx8mp-icore-cy $CY_METADIR \
        devmem2 cy_devmem2
NOTE: Starting bitbake server...
...
NOTE: Writing append file /home/giometti/yocto/imx-yocto-bsp/sources/me
ta-cy/recipes-support/devmem2/devmem2_2.0.bbappend
NOTE: Copying cy_devmem2 to /home/giometti/yocto/imx-yocto-bsp/sources/
meta-cy/recipes-support/devmem2/devmem2/imx8mp-icore-cy/cy_devmem2
```

> Lưu ý rằng `cy_devmem2` phải nằm trong working directory hiện tại.

Bây giờ, file `devmem2_2.0.bbappend` chứa nội dung sau:

```
$ cat $CY_METADIR/recipes-support/devmem2/devmem2_2.0.bbappend
SRC_URI += "file://cy_devmem2;subdir=git"

FILESEXTRAPATHS:prepend := "${THISDIR}/${PN}:"

PACKAGE_ARCH = "${MACHINE_ARCH}"
```

> Để có một recipe hoạt động, bạn đọc nên nhớ thêm lại hàm `do_install:append()`, như đã làm trước đó.

File `cy_devmem2` giờ được chép vào một thư mục đặc biệt như dưới đây:

```
$ tree recipes-support/devmem2/
recipes-support/devmem2/
├── devmem2
│   └── imx8mp-icore-cy
│       └── cy_devmem2
└── devmem2_2.0.bbappend
```

Nếu tạo lại package, chúng ta sẽ có cùng kết quả. Tuy nhiên, có thể có một vấn đề; thật vậy, nếu thử tạo package `devmem2` cho một machine khác, chúng ta có thể gặp lỗi sau:

```
$ MACHINE=imx8mp-icore bitbake devmem2
...
WARNING: /home/giometti/yocto/imx-yocto-bsp/sources/meta-openembedded/m
eta-oe/recipes-support/devmem2/devmem2_2.0.bb: Unable to get checksum f
or devmem2 SRC_URI entry cy_devmem2: file could not be found
...
WARNING: devmem2-2.0-r0 do_fetch: Failed to fetch URL file://cy_devmem2
;subdir=git, attempting MIRRORS if available
ERROR: devmem2-2.0-r0 do_fetch: Fetcher failure: Unable to find file fi
le://cy_devmem2;subdir=git anywhere. The paths that were searched were:
/home/giometti/yocto/imx-yocto-bsp/sources/meta-cy/recipes-support/devm
em2/devmem2/fsl
...  /home/giometti/yocto/imx-yocto-bsp/sources/meta-cy/recipes-support/d
evmem2/devmem2/imx8mp-icore
...  /home/giometti/yocto/imx-yocto-bsp/sources/meta-cy/recipes-support/d
evmem2/devmem2/
...  /home/giometti/yocto/imx-yocto-bsp/sources/meta-openembedded/meta-oe
/recipes-support/devmem2/files/
    /home/giometti/Projects/DL_ARCHIVES/yocto/
ERROR: devmem2-2.0-r0 do_fetch: Bitbake Fetcher Error: FetchError('Unab
le to fetch URL from any source.', 'file://cy_devmem2;subdir=git')
ERROR: Logfile of failure stored in: /home/giometti/yocto/imx-yocto-bsp
/imx8mp-build/tmp/work/imx8mp_icore-poky-linux/devmem2/2.0-r0/temp/log.
do_fetch.1456494
ERROR: Task (/home/giometti/yocto/imx-yocto-bsp/sources/meta-openembedd
ed/meta-oe/recipes-support/devmem2/devmem2_2.0.bb:do_fetch) failed with
 exit code '1'
NOTE: Tasks Summary: Attempted 732 tasks of which 731 didn't need to be
 rerun and 1 failed.

Summary: 1 task failed:
...
```

Lý do là Yocto build system đang cố tìm file `cy_devmem2` trong nhiều thư mục (xem những gì được nêu ở trên trong error message) mà không thành công. Khi chúng ta tạo package cho machine của mình, nó đã kiểm tra thành công trong thư mục `sources/meta-cy/recipes-support/devmem2/devmem2/imx8mp-icore-cy`, nơi chứa file. Nhưng giờ trong `sources/meta-cy/recipes-support/devmem2/devmem2/imx8mp-icore` không có gì, và trong thư mục cha cũng không (là một trong những vị trí mà hệ thống tìm)!

Một giải pháp khả dĩ là thêm một phiên bản chung của file `cy_devmem2` vào thư mục `recipes-support/devmem2/devmem2`, như dưới đây:

```
$ cp recipes-support/devmem2/devmem2/imx8mp-icore-cy/cy_devmem2 \
        recipes-support/devmem2/devmem2/
$ tree recipes-support/devmem2/
recipes-support/devmem2/
├── devmem2
│   ├── imx8mp-icore-cy
│   │   └── cy_devmem2
│   └── cy_devmem2
└── devmem2_2.0.bbappend

2 directories, 3 files
```

Nhưng điều này có nghĩa là file cũng sẽ được thêm cho các machine khác, những machine có thể không quan tâm đến việc dùng nó! Vì vậy, nếu muốn sửa đổi chỉ áp dụng cho machine của mình, chúng ta có thể dùng một số override trong file `.bbappend`, như dưới đây:

```
--- a/devmem2_2.0.bbappend
+++ b/devmem2_2.0.bbappend
@@ -4,7 +4,7 @@

 PACKAGE_ARCH = "${MACHINE_ARCH}"

-do_install:append() {
+do_install:append:imx8mp-icore-cy() {
     install -d ${D}${bindir}
     install cy_devmem2 ${D}${bindir}
 }
```

Trong tình huống này, các override sẽ chỉ có hiệu lực với machine `imx8mp-icore-cy`.

### 11.3.2 Thay đổi cấu hình mặc định (Changing the Default Configuration)

Một cách thực sự hữu ích khác để thay đổi một recipe là dùng subcommand `recipetool` `appendfile`.

Giả sử chúng ta cần thay đổi cấu hình hiện tại của daemon `ptpd`, vì trong hardware tùy biến của chúng ta, dữ liệu đến từ device `eth1` thay vì `eth0`. Nội dung hiện tại của file, như chúng ta có thể thấy trên kit embedded, là như sau:

```
# cat /etc/default/ptpd
#
# PTPD Configuration
#
# See man ptpd2 for arguments.
#
# Example arguments
PTPDARGS="-d 1 -i eth0"
```

Để thay đổi nó, chúng ta có thể đơn giản tạo một file mới `custom_ptpd` với các thiết lập đúng (tức là có `PTPDARGS="-d 1 -i eth1"`) rồi dùng lệnh dưới đây:

```
$ recipetool appendfile $CY_METADIR /etc/default/ptpd custom_ptpd
NOTE: Starting bitbake server...
...
NOTE: Writing append file /home/giometti/yocto/imx-yocto-bsp/sources/me
ta-cy/recipes-daemons/ptpd/ptpd_2.3.1.bbappend
NOTE: Copying custom_ptpd to /home/giometti/yocto/imx-yocto-bsp/sources
/meta-cy/recipes-daemons/ptpd/ptpd/ptpd.conf
```

> Lưu ý rằng lệnh có thể thất bại trong trường hợp `recipetool` không xác định được recipe nào đang cung cấp file và cách ghi đè nó bằng phiên bản của chúng ta. Bạn đọc nên chắc chắn rằng file `/etc/default/ptpd` có mặt trong root filesystem cuối cùng của mình. Xem phần dưới của mục này.

Như chúng ta thấy ở trên, lệnh đã cài file của chúng ta với đúng tên để nó được dùng khi build package cho hệ thống. Trong meta layer của mình, giờ chúng ta có thư mục con mới sau:

```
$ cd $CY_METADIR
$ tree recipes-daemons/ptpd
recipes-daemons/ptpd
├── ptpd
│   └── ptpd.conf
└── ptpd_2.3.1.bbappend

1 directory, 2 files
```

trong đó file `.bbappend` chứa thiết lập sau:

```
$ cat recipes-daemons/ptpd/ptpd_2.3.1.bbappend
FILESEXTRAPATHS:prepend := "${THISDIR}/${PN}:"
```

còn file cấu hình mới chính xác là file của chúng ta:

```
$ cat recipes-daemons/ptpd/ptpd/ptpd.conf
#
# PTPD Configuration - CY version
#
# See man ptpd2 for arguments.
#
# Example arguments
PTPDARGS="-d 1 -i eth1"
```

Bây giờ, để xem mọi thứ có hoạt động tốt không, chúng ta có thể tạo lại một image mới và kiểm chứng kết quả.

> Trên một số hệ thống, chúng ta có thể nhận được error message sau:
>
> ```
> $ recipetool appendfile $CY_METADIR /etc/default/ptpd custom_ptpd
> NOTE: Starting bitbake server...
> ...
> ERROR: Unable to find any package producing path /etc/default/ptp
> d - this may be because the recipe packaging it has not been buil
> t yet
> ```
>
> Lý do là, như được nêu trong error message, package chưa được build; vì vậy, nếu biết package đó là gì, chúng ta có thể build nó:
>
> ```
> $ bitbake ptpd
> ```
>
> Rồi thực thi lại lệnh ở trên.

### 11.3.3 Thay đổi một biến (Changing a Variable)

Trước khi kết thúc mục này, có thể thú vị khi xem một subcommand khác của `recipetool`, đó là `setvar`.

Giả sử chúng ta muốn thay đổi giá trị mặc định (hiện là `100`) của biến `ALTERNATIVE_PRIORITY` trong `i2c-tools` ở meta layer `poky`. Nó được đặt như dưới đây:

```
$ grep ALTERNATIVE_PRIORITY \
        sources/poky/meta/recipes-devtools/i2c-tools/i2c-tools_4.3.bb
ALTERNATIVE_PRIORITY = "100"
```

Và chúng ta có thể thay đổi nó chỉ bằng lệnh dưới đây:

```
$ recipetool setvar -r \
        sources/poky/meta/recipes-devtools/i2c-tools/i2c-tools_4.3.bb \
        ALTERNATIVE_PRIORITY '200'
```

> Chú ý option argument `-r` để chắc chắn rằng biến không được đặt trong bất kỳ include file nào, nếu có.

Tuy nhiên, việc này sẽ thay đổi một file bên ngoài layer tùy biến của chúng ta (điều chúng ta không muốn), vì vậy trước tiên chúng ta có thể tạo một file .bbappend rỗng:

```
$ recipetool newappend $CY_METADIR i2c-tools
NOTE: Starting bitbake server...
...
/home/giometti/yocto/imx-yocto-bsp/sources/meta-cy/recipes-devtools/i2c
-tools/i2c-tools_4.3.bbappend
```

Rồi đặt giá trị mong muốn vào đó:

```
$ recipetool setvar -r \
        $CY_METADIR/recipes-devtools/i2c-tools/i2c-tools_4.3.bbappend \
        ALTERNATIVE_PRIORITY '200'
```

Bây giờ, file `.bbappend` mới chứa nội dung sau:

```
$ cat $CY_METADIR/recipes-devtools/i2c-tools/i2c-tools_4.3.bbappend
ALTERNATIVE_PRIORITY = "200"
```

Chúng ta có thể kiểm chứng thiết lập mới có hiệu lực bằng cách xem giá trị của nó bằng `cy-vars` như dưới đây:

```
$ cy-vars ALTERNATIVE_PRIORITY i2c-tools
ALTERNATIVE_PRIORITY="200"
```

Biến được đặt thành giá trị mong đợi.

## 11.4 Thêm package group tùy biến (Adding Custom Package Groups)

Package group là các recipe có mục đích duy nhất là tạo phụ thuộc để đơn giản hóa việc tạo image. Thật vậy, một package group recipe gom nhiều package lại với nhau, và khi đó, thay vì phải chỉ định tường minh từng package trong biến `IMAGE_INSTALL`, chúng ta có thể đơn giản chỉ định tên package group.

Ví dụ, nếu nhớ lại những gì đã thấy trong Mục 6.5.1, nơi chúng ta nhắc đến recipe `core-image-minimal.bb` trong meta layer `poky`, chúng ta đã thấy một thiết lập như dưới đây:

```
$ cat poky/meta/recipes-core/images/core-image-minimal.bb
SUMMARY = "A small image just capable of allowing a device to boot."

IMAGE_INSTALL = "packagegroup-core-boot ${CORE_IMAGE_EXTRA_INSTALL}"
...
```

Như chúng ta thấy, `IMAGE_INSTALL` được khởi tạo với package `packagegroup-core-boot`, nhưng nếu xem recipe của nó, chúng ta có thể thấy đó không phải là một package recipe thông thường:

```
$ cat poky/meta/recipes-core/packagegroups/packagegroup-core-boot.bb
#
# Copyright (C) 2007 OpenedHand Ltd.
#

SUMMARY = "Minimal boot requirements"
DESCRIPTION = "The minimal set of packages required to boot the system"
PR = "r17"
PACKAGE_ARCH = "${MACHINE_ARCH}"

inherit packagegroup
...
RDEPENDS:${PN} = "\
    base-files \
    base-passwd \
    ${VIRTUAL-RUNTIME_base-utils} \
    ${@bb.utils.contains("DISTRO_FEATURES", "sysvinit", "${SYSVINIT_SCR
IPTS}", "", d)} \
    ${@bb.utils.contains("MACHINE_FEATURES", "keyboard", "${VIRTUAL-RUN
TIME_keymaps}", "", d)} \
    ${@bb.utils.contains("MACHINE_FEATURES", "efi", "${EFI_PROVIDER} ke
rnel", "", d)} \
    netbase \
    ${VIRTUAL-RUNTIME_login_manager} \
    ${VIRTUAL-RUNTIME_init_manager} \
    ${VIRTUAL-RUNTIME_dev_manager} \
    ${VIRTUAL-RUNTIME_update-alternatives} \
    ${MACHINE_ESSENTIAL_EXTRA_RDEPENDS}"

RRECOMMENDS:${PN} = "\
    ${VIRTUAL-RUNTIME_base-utils-syslog} \
    ${MACHINE_ESSENTIAL_EXTRA_RRECOMMENDS}"
```

Recipe trên kế thừa class `packagegroup` rồi định nghĩa một danh sách `RDEPENDS` và `RRECOMMENDS`.

> Lưu ý rằng recipe cũng định nghĩa lại biến `PACKAGE_ARCH`, biến được dùng để đặt kiến trúc của các package kết quả. Như được gợi ý trong Yocto Reference Manual tại `https://docs.yoctoproject.org/ref-manual/variables.html?highlight=kernel_devicetree_bundle#term-PACKAGE_ARCH`, nếu các package của chúng ta được build riêng cho target machine thay vì chung cho kiến trúc của machine, chúng ta nên thực hiện cùng thiết lập `PACKAGE_ARCH`.

Tuy nhiên, một ví dụ tốt về package group recipe là recipe `packagegroup-base.bb`, nằm cùng các package group recipe khác trong meta layer `poky`, ở thư mục `recipes-core/packagegroups`:

```
$ cat poky/meta/recipes-core/packagegroups/packagegroup-base.bb
SUMMARY = "Merge machine and distro options to create a basic machine t
ask/package"
PR = "r83"

#
# packages which content depend on MACHINE_FEATURES need to be
# MACHINE_ARCH
#
PACKAGE_ARCH = "${MACHINE_ARCH}"

inherit packagegroup

PACKAGES = ' \
            packagegroup-base \
            packagegroup-base-extended \
            packagegroup-distro-base \
            packagegroup-machine-base \
            \
            ${@bb.utils.contains("MACHINE_FEATURES", "acpi", "packagegr
oup-base-acpi", "",d)} \
            ${@bb.utils.contains("MACHINE_FEATURES", "alsa", "packagegr
oup-base-alsa", "", d)} \
...
#
# packagegroup-base contain stuff needed for base system (machine
# related)
#
RDEPENDS:packagegroup-base = "\
    packagegroup-distro-base \
    packagegroup-machine-base \
    \
    module-init-tools \
    ${@bb.utils.contains('MACHINE_FEATURES', 'apm', 'packagegroup-base-
apm', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'acpi', 'packagegroup-base
-acpi', '',d)} \
...
RRECOMMENDS:packagegroup-base = "\
    kernel-module-nls-utf8 \
    kernel-module-input \
    kernel-module-uinput \
    kernel-module-rtc-dev \
    kernel-module-rtc-proc \
    kernel-module-rtc-sysfs \
    kernel-module-unix"
...
```

Nhìn vào recipe, chúng ta có thể thấy biến `PACKAGES` liệt kê các package group package cần tạo. Sau đó câu lệnh `inherit packagegroup` đặt các giá trị mặc định phù hợp và tự động thêm các package `-dev`, `-dbg` và `-ptest` cho mỗi package được chỉ định trong câu lệnh `PACKAGES`.

> Thứ tự này rất quan trọng: dòng `inherit packagegroup` nên nằm gần đầu recipe, chắc chắn là trước câu lệnh `PACKAGES`.

Với mỗi package chỉ định trong `PACKAGES`, chúng ta có thể dùng các mục `RDEPENDS` và `RRECOMMENDS` để cung cấp danh sách package mà task package cha nên chứa.

Cũng chú ý cách recipe dùng các hàm `bb.utils.contains(}` *(ghi chú: đúng là `bb.utils.contains()`)* để thêm có chọn lọc nhiều package hơn vào danh sách `RDEPENDS` tùy theo các thiết lập trong `MACHINE_FEATURES`.

Một thiết lập thú vị khác cần xét trong recipe trên được trình bày dưới đây:

```
...
#
# packages added by distribution
#
SUMMARY:packagegroup-distro-base = "${DISTRO} extras"
DEPENDS_packagegroup-distro-base = "${DISTRO_EXTRA_DEPENDS}"
RDEPENDS:packagegroup-distro-base = "${DISTRO_EXTRA_RDEPENDS}"
RRECOMMENDS:packagegroup-distro-base = "${DISTRO_EXTRA_RRECOMMENDS}"
#
# packages added by machine config
#
SUMMARY:packagegroup-machine-base = "${MACHINE} extras"
SUMMARY:packagegroup-machine-base = "Extra packages required to fully support
${MACHINE} hardware"
RDEPENDS:packagegroup-machine-base = "${MACHINE_EXTRA_RDEPENDS}"
RRECOMMENDS:packagegroup-machine-base = "${MACHINE_EXTRA_RRECOMMENDS}"
...
```

Ở trên là một ví dụ rất thú vị về cách dùng các biến `DISTRO`, `MACHINE` và các biến anh em của chúng để định nghĩa phụ thuộc cho các package group `packagegroup-distro-base` và `packagegroup-machine-base`, liên quan đến các thiết lập distribution và machine hiện tại.

OK, giờ là lúc build một packagegroup recipe tùy biến. Dưới đây là một ví dụ đơn giản:

```
$ cat $CY_METADIR/recipes-core/packagegroup/packagegroup-cy.bb
SUMMARY = "Custom CY Package Groups"
MAINTAINER = "Rodolfo Giometti <giometti@enneenne.com>"

inherit packagegroup

PACKAGES = " \
    ${PN}-examples \
    ${PN}-apps \
"

SUMMARY:${PN}-examples = "Custom CY Examples Package Groups"
SECTION:${PN}-examples = "examples"
RDEPENDS:${PN}-examples = "\
    hello \
    lhello \
"

SUMMARY:${PN}-apps = "Custom CY Applications Package Groups"
SECTION:${PN}-apps = "utils"
RDEPENDS:${PN}-apps = "\
    log2cb \
    umrp \
"
```

Hai packagegroup package được tạo cùng các phụ thuộc của chúng. Để build một image dùng các packagegroup package này, chúng ta cần thêm `packagegroup-cy-examples` và/hoặc `packagegroup-cy-apps` vào `IMAGE_INSTALL`.

Tuy nhiên, ở bước đầu tiên, hãy tạo các package:

```
$ bitbake packagegroup-cy
```

Nếu mọi thứ hoạt động tốt, chúng ta sẽ có các package mới như dưới đây:

```
$ cy-ipk find packagegroup-cy
cy-ipk: searching in /home/giometti/yocto/imx-yocto-bsp/imx8mp-build...
tmp/deploy/ipk/all/packagegroup-cy-examples-ptest_1.0-r0_all.ipk
tmp/deploy/ipk/all/packagegroup-cy-apps-ptest_1.0-r0_all.ipk
tmp/deploy/ipk/all/packagegroup-cy-apps-dbg_1.0-r0_all.ipk
tmp/deploy/ipk/all/packagegroup-cy-apps_1.0-r0_all.ipk
tmp/deploy/ipk/all/packagegroup-cy-examples-dev_1.0-r0_all.ipk
tmp/deploy/ipk/all/packagegroup-cy-examples_1.0-r0_all.ipk
tmp/deploy/ipk/all/packagegroup-cy-apps-dev_1.0-r0_all.ipk
tmp/deploy/ipk/all/packagegroup-cy-examples-dbg_1.0-r0_all.ipk
```

Hơn nữa, chúng ta có thể xem thông tin package để kiểm chứng mọi thứ đã được thiết lập đúng:

```
$ cy-ipk get-info tmp/deploy/ipk/all/packagegroup-cy-examples_1.0-r0_al
l.ipk
Package: packagegroup-cy-examples
Version: 1.0-r0
Description: Custom CY Examples Package Groups
 Custom CY Package Groups.
Section: examples
Priority: optional
Maintainer: Rodolfo Giometti <giometti@enneenne.com>
License: MIT
Architecture: all
OE: packagegroup-cy
Depends: hello, lhello
Source: packagegroup-cy.bb
$ cy-ipk get-info tmp/deploy/ipk/all/packagegroup-cy-apps_1.0-r0_all.ipk
Package: packagegroup-cy-apps
Version: 1.0-r0
Description: Custom CY Applications Package Groups
 Custom CY Package Groups.
Section: utils
Priority: optional
Maintainer: Rodolfo Giometti <giometti@enneenne.com>
License: MIT
Architecture: all
OE: packagegroup-cy
Depends: log2cb, umrp
Source: packagegroup-cy.bb
```

Bạn đọc nên chú ý rằng không có file nào trong các archive file IPKG:

```
$ cy-ipk inspect tmp/deploy/ipk/all/packagegroup-cy-examples_1.0-r0_al
l.ipk
$ cy-ipk inspect tmp/deploy/ipk/all/packagegroup-cy-apps_1.0-r0_all.ipk
```

Output của cả hai lệnh đều rỗng. Lý do là chúng không cần cài gì mà chỉ định nghĩa các package phụ thuộc! Vì vậy cách dùng thực sự của chúng là khi được dùng trong một image recipe ở biến `IMAGE_INSTALL`.

## 11.5 Thêm binary package (Adding Binary Packages)

Binary package thường được dùng để chứa code đã compile sẵn hoặc binary image cần được cài nguyên trạng (tức là không compile và giữ nguyên cấu trúc thư mục).

Các package đặc biệt này có thể được tạo bằng class bin-package đã giới thiệu trong Mục 6.4.5, và một ví dụ được trình bày trong recipe `wireless-regdb` (Wireless Central Regulatory Domain Database) ở meta layer `poky`:

```
$ cat poky/meta/recipes-kernel/wireless-regdb/wireless-regdb_2022.08.12
.bb
SUMMARY = "Wireless Central Regulatory Domain Database"
HOMEPAGE = "https://wireless.wiki.kernel.org/en/developers/regulatory/c
rda"
SECTION = "net"
LICENSE = "ISC"
LIC_FILES_CHKSUM = "file://LICENSE;md5=07c4f6dea3845b02a18dc00c8c87699c"

SRC_URI = "https://www.kernel.org/pub/software/network/${BPN}/${BP}.tar
.xz"
SRC_URI[sha256sum] = "59c8f7d17966db71b27f90e735ee8f5b42ca3527694a8c5e6
e9b56bd379c3b84"

inherit bin_package allarch

do_install() {
    install -d -m0755 ${D}${nonarch_libdir}/crda
    install -d -m0755 ${D}${sysconfdir}/wireless-regdb/pubkeys
    install -m 0644 regulatory.bin ${D}${nonarch_libdir}/crda/regulator
y.bin
    install -m 0644 sforshee.key.pub.pem ${D}${sysconfdir}/wireless-reg
db/pubkeys/sforshee.key.pub.pem

    install -m 0644 -D regulatory.db ${D}${nonarch_base_libdir}/firmwar
e/regulatory.db
    install -m 0644 regulatory.db.p7s ${D}${nonarch_base_libdir}/firmwa
re/regulatory.db.p7s
}
...
```

Recipe chỉ tải file archive chứa các file binary rồi overload task `do_install` cho phù hợp với nhu cầu của nó. Tuy nhiên, để làm một ví dụ nhỏ, chúng ta có thể xét file archive sau, chứa một số file binary made-up:

```
$ tar tf examples/bindata/bindata-1.2.tar.gz
usr/
usr/share/
usr/share/bindata/
usr/share/bindata/data3.bin
usr/share/bindata/data2.bin
usr/share/bindata/data0.bin
usr/share/bindata/data1.bin
```

Chúng ta có thể giả định mọi đường dẫn đều đúng, và khi đó chỉ cần tạo một package với cùng cây thư mục. Để làm vậy, chúng ta có thể nhớ lại usage message của lệnh `recipetool create`:

```
$ recipetool create -h
...
  -b, --binary          Treat the source tree as something that should
                        be installed verbatim (no compilation, same
                        directory structure)
...
```

Trong tình huống này, lệnh chúng ta nên dùng được trình bày dưới đây:

```
$ recipetool create -b examples/bindata/bindata-1.2.tar.gz
NOTE: Starting bitbake server...
INFO: Fetching file:///home/giometti/yocto/examples/bindata/bindata-1.2
.tar.gz;subdir=${BPN}...
...
INFO: Recipe bindata_1.2.bb has been created; further editing may be re
quired to make it fully functional
```

Recipe mới được tạo chứa các thiết lập sau:

```
$ cat bindata_1.2.bb
...
LICENSE = "CLOSED"
LIC_FILES_CHKSUM = ""

SRC_URI = "file:///home/giometti/yocto/examples/bindata/bindata-${PV}.t
ar.gz;subdir=${BPN}"

inherit bin_package

INSANE_SKIP:${PN} += "already-stripped"
```

Code rất sơ đẳng; tuy nhiên, chúng ta nên dành chút thời gian nói về biến `INSANE_SKIP`. Biến này, được dùng trong class insane (xem class file `poky/meta/classes/insane.bbclass`), chỉ định các kiểm tra Questions/Answers (viết tắt là QA) cần bỏ qua cho một package cụ thể trong một recipe.

> Có nhiều kiểm tra được class này thực hiện, được liệt kê trong Yocto Reference Manual tại `https://docs.yoctoproject.org/ref-manual/classes.html#insane`.

Trong ví dụ của chúng ta, kiểm tra `already-stripped` được dùng để kiểm chứng rằng các binary được tạo ra chưa bị strip trước khi build system trích xuất debug symbol. Thật vậy, các dự án software upstream thường mặc định strip debug symbol khỏi binary output, và để việc debug hoạt động trên target bằng các package `-dbg`, việc strip này phải bị tắt.

Vì trong ví dụ của chúng ta, việc strip debug symbol là vô nghĩa, chúng ta cũng phải tắt kiểm tra này.

Bây giờ, để thử recipe mới, chúng ta phải chuyển nó vào meta layer rồi thực thi `bitbake` như dưới đây:

```
$ mkdir -p $CY_METADIR/recipes-example/bindata
$ mv bindata_1.2.bb $CY_METADIR/recipes-example/bindata/
$ cd $BUILDDIR/
$ bitbake bindata
...
NOTE: Executing Tasks
ERROR: bindata-1.2-r0 do_install: bin_package has nothing to install. B
e sure the SRC_URI unpacks into S.
ERROR: bindata-1.2-r0 do_install: ExecutionError('/home/giometti/yocto/
imx-yocto-bsp/imx8mp-build/tmp/work/armv8a-poky-linux/bindata/1.2-r0/te
mp/run.do_install.17833', 1, None, None)
...
Summary: 1 task failed:
  /home/giometti/yocto/imx-yocto-bsp/sources/meta-cy/recipes-example/bi
ndata/bindata_1.2.bb:do_install
```

Chúng ta gặp lỗi vì, như được gợi ý trong thông điệp trên, archive do `SRC_URI` trỏ tới không giải nén vào `S`. Thật vậy, chúng ta có

```
$ cy-vars S bindata
S="/home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/work/armv8a-poky
-linux/bindata/1.2-r0/bindata-1.2"
```

Và trong thư mục này không có gì:

```
$ ls /home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/work/armv8a-po
ky-linux/bindata/1.2-r0/bindata-1.2
```

Mọi file đã được bung ra trong

```
$ cd $BUILDDIR/tmp/work/armv8a-poky-linux/bindata/1.2-r0
$ tree bindata
bindata
└── usr
    └── share
        └── bindata
            ├── data0.bin
            ├── data1.bin
            ├── data2.bin
            └── data3.bin

3 directories, 4 files
```

Vì vậy recipe nên được làm lại như dưới đây:

```
--- a/recipes-example/bindata/bindata_1.2.bb
+++ b/recipes-example/bindata/bindata_1.2.bb
@@ -1,7 +1,7 @@
 LICENSE = "CLOSED"
 LIC_FILES_CHKSUM = ""

-SRC_URI = "file:///home/giometti/yocto/examples/bindata/bindata-${PV}.
tar.gz;subdir=${BPN}"
+SRC_URI = "file:///home/giometti/yocto/examples/bindata/bindata-${PV}.
tar.gz;subdir=${BPN}-${PV}"

 inherit bin_package
```

Lý do là biểu thức `${BPN}-${PV}` được phân giải thành `bindata-1.2`, đây cũng là tiền tố đúng cần dùng để tránh vấn đề trong trường hợp chúng ta quyết định build các bản phát hành khác nhau.

Bây giờ chúng ta có thể thử thực thi lại BitBake:

```
$ bitbake bindata
...
NOTE: Tasks Summary: Attempted 746 tasks of which 731 didn't need to be
 rerun and all succeeded.
...
```

OK, giờ chúng ta có thể kiểm chứng package đã được tạo:

```
$ cy-ipk find bindata
cy-ipk: searching in /home/giometti/yocto/imx-yocto-bsp/imx8mp-build...
tmp/deploy/ipk/armv8a/bindata-dev_1.2-r0_armv8a.ipk
tmp/deploy/ipk/armv8a/bindata-dbg_1.2-r0_armv8a.ipk
tmp/deploy/ipk/armv8a/bindata_1.2-r0_armv8a.ipk
```

và nó chứa đúng các file dữ liệu:

```
$ cy-ipk inspect tmp/deploy/ipk/armv8a/bindata_1.2-r0_armv8a.ipk
drwxr-xr-x root/root    0 2024-08-21 14:11 ./usr/
drwxr-xr-x root/root    0 2024-08-21 14:11 ./usr/share/
drwxr-xr-x root/root    0 2024-08-21 14:11 ./usr/share/bindata/
-rw-r--r-- root/root 4096 2024-08-21 14:11 ./usr/share/bindata/data0.bin
-rw-r--r-- root/root 4096 2024-08-21 14:11 ./usr/share/bindata/data1.bin
-rw-r--r-- root/root 4096 2024-08-21 14:11 ./usr/share/bindata/data2.bin
-rw-r--r-- root/root 4096 2024-08-21 14:11 ./usr/share/bindata/data3.bin
```

đây chính xác là điều chúng ta muốn.

## 11.6 Ghi chú về native recipe (Notes on Native Recipes)

Một số dự án có thể có quy trình compile phức tạp. Ví dụ, nếu nghĩ đến các language parser, chúng ta có thể có một giai đoạn đầu tiên trong đó parser generator (như Bison hoặc YACC) đọc cú pháp ngôn ngữ và tạo file chương trình C (file `.c`) chứa language parser giải mã cú pháp đó. Sau đó giai đoạn thứ hai mới thực hiện việc compile thực sự để tạo file thực thi cuối cùng.

Nói chung, bất cứ khi nào cần một hoặc nhiều giai đoạn được thực thi trên build host trước khi việc compile cuối cùng cho target có thể chạy, chúng ta phải dựa vào native recipe.

Hậu tố native xác định các recipe (và các biến thể của recipe) tạo ra file dành cho build host, thay vì target machine.

Trong mục này, chúng ta sẽ trình bày hai ví dụ về native recipe, một recipe cho chương trình C và một cho chương trình Python.

### 11.6.1 Native C code (Native C Code)

Một ví dụ thực tế và rất đơn giản về cách tạo native code cho một chương trình C được trình bày trong đoạn code sau:

```
$ cat $CY_METADIR/recipes-example/cy-nat/files/cy-tool.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>

int main(int argc, char *argv[]) {
        const size_t len = sysconf(_SC_PAGESIZE);
        char buf[len], *ptr;
        int nread, nwritten;

        while ((nread = read(STDIN_FILENO, buf, len)) > 0) {
              ptr = buf;
              while (nread > 0) {
                      nwritten = write(STDOUT_FILENO, ptr, nread);
                      if (nwritten < 0) {
                              perror("write:");
                              exit(EXIT_FAILURE);
                      }
                      nread -= nwritten;
                      ptr += nwritten;
              }
        }
        if (nread < 0) {
             perror("read:");
             exit(EXIT_FAILURE);
        }

        return 0;
}
```

Đây là một chương trình C đọc một số dữ liệu từ stdin rồi ghi dữ liệu đó ra stream stdout. Nói đơn giản, nó là một cách triển khai khác của `cat`.

Tuy nhiên, chúng ta có thể giả sử rằng nó phải được dùng để tạo một chương trình mới cho target machine theo cách này:

```
$ cy-tool < cy-tool.c > cy-target.c
```

Tức là khi được thực thi trên host, nó lấy file `cy-tool.c` và biến đổi nó thành `cy-target.c`, sau đó file sau cùng này có thể được compile và thực thi trên target.

Để giải quyết vấn đề này, chúng ta có thể dùng recipe sau:

```
$ cat $CY_METADIR/recipes-example/cy-nat/cy-nat_0.1.bb
LICENSE = "CLOSED"

SRC_URI = "file://cy-tool.c"

S = "${WORKDIR}"

do_install() {
    install -d ${D}${bindir}
}

do_compile:class-native() {
    ${CC} ${CFLAGS} ${LDFLAGS} cy-tool.c -o cy-tool
}

do_install:append:class-native() {
    install cy-tool ${D}${bindir}
}

DEPENDS:class-target = "cy-nat-native"

do_compile:append:class-target() {
    cy-tool < cy-tool.c > cy-target.c
    ${CC} ${CFLAGS} ${LDFLAGS} cy-target.c -o cy-target
}

do_install:append:class-target() {
    install cy-target ${D}${bindir}
}

BBCLASSEXTEND = "native"
```

Recipe có vẻ phức tạp, nhưng thực ra không phải vậy. Trước hết, chúng ta nên chú ý thiết lập biến `BBCLASSEXTEND` ở cuối. Nó cho phép chúng ta mở rộng một recipe để nó cũng build các biến thể của software.

Trong ví dụ của chúng ta, bằng cách đặt nó thành `native`, chúng ta yêu cầu build system tạo một biến thể native của recipe như `cy-nat-native`, là một bản sao của `cy-nat` nhưng được compile để chạy trên build system.

> Chúng ta có thể dùng nhiều biến thể, như `crosses`, tạo ra các package chạy trên host machine nhưng tạo ra binary chạy trên target (ví dụ, cross-compiler). Bạn đọc có thể tìm thêm thông tin bắt đầu từ `https://docs.yoctoproject.org/ref-manual/variables.html#term-BBCLASSEXTEND`.

Mẹo được cơ chế `BBCLASSEXTEND` dùng bên trong là viết lại giá trị biến và áp dụng override để thực hiện các hành động khác nhau và có các kết quả khác nhau. Ví dụ, biến `bindir`, nơi chúng ta nên cài binary, thay đổi tùy theo việc chúng ta đang compile cho host hay cho target machine. Hơn nữa, các override đặc biệt như `class-native` và `class-target` có thể được dùng để phân biệt các thiết lập hoặc thủ tục cho host hay cho target machine.

Trong tình huống này, hẳn đã rõ vì sao chúng ta định nghĩa hai task `do_install` như trên. Thật vậy, khi làm

```
do_install:append:class-native() {
    install cy-tool ${D}${bindir}
}
```

chúng ta yêu cầu build system cài file thực thi `cy-tool` vào thư mục do `bindir` chỉ định cho build machine, còn khi làm

```
do_install:append:class-target() {
    install cy-target ${D}${bindir}
}
```

chúng ta yêu cầu Yocto build system cài file thực thi `cy-target` vào thư mục do `bindir` chỉ định cho target machine (tất nhiên trỏ tới một đường dẫn khác!).

Mặt khác, khi tạo `bindir`, chúng ta có thể dùng một task mặc định như dưới đây:

```
do_install() {
    install -d ${D}${bindir}
}
```

> Lưu ý rằng chúng ta phải dùng các biến như `bindir`, v.v., để chỉ tới các thư mục cụ thể nhằm tránh các hành vi không mong đợi!
>
> Thật vậy, nếu xem task `do_install` được định nghĩa thế nào cho target, chúng ta có
>
> ```
> $ cat $BUILDDIR/tmp/work/armv8a-poky-linux/cy-nat/0.1-r0/temp/run.
> do_install
> ...
> # line: 7, file: /home/giometti/yocto/imx-yocto-bsp/sources/meta-c
> y/recipes-example/cy-nat/cy-nat_0.1.bb
> do_install() {
>     install -d /home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp
> /work/armv8a-poky-linux/cy-nat/0.1-r0/image/usr/bin
>     install cy-target /home/giometti/yocto/imx-yocto-bsp/imx8mp-bu
> ild/tmp/work/armv8a-poky-linux/cy-nat/0.1-r0/image/usr/bin
> }
> ...
> ```
>
> còn với host, chúng ta có
>
> ```
> $ cat $BUILDDIR/tmp/work/x86_64-linux/cy-nat-native/0.1-r0/temp/ru
> n.do_install
> ...
> # line: 7, file: /home/giometti/yocto/imx-yocto-bsp/sources/meta-c
> y/recipes-example/cy-nat/cy-nat_0.1.bb
> do_install() {
>     install -d /home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp
> /work/x86_64-linux/cy-nat-native/0.1-r0/image/home/giometti/yocto/
> imx-yocto-bsp/imx8mp-build/tmp/work/x86_64-linux/cy-nat-native/0.1
> -r0/recipe-sysroot-native/usr/bin
>     install cy-tool /home/giometti/yocto/imx-yocto-bsp/imx8mp-buil
> d/tmp/work/x86_64-linux/cy-nat-native/0.1-r0/image/home/giometti/y
> octo/imx-yocto-bsp/imx8mp-build/tmp/work/x86_64-linux/cy-nat-nativ
> e/0.1-r0/recipe-sysroot-native/usr/bin
> }
> ```

Bây giờ, để mọi thứ hoạt động, chúng ta cần chỉ định rằng target package phụ thuộc vào native package, và có thể làm việc đó bằng dòng dưới đây:

```
DEPENDS:class-target = "cy-nat-native"
```

Bằng cách này, Yocto build system biết rằng trước khi compile package `cy-nat`, nó phải compile package `cy-nat-native`.

OK, trong meta layer của mình, chúng ta sẽ có nội dung như dưới đây:

```
$ cd $CY_METADIR
$ tree recipes-example/cy-nat/
recipes-example/cy-nat/
├── files
│   └── cy-tool.c
└── cy-nat_0.1.bb

1 directory, 2 files
```

Sau đó chúng ta có thể thử recipe như thường lệ:

```
$ bitbake cy-nat
```

Nếu mọi thứ hoạt động tốt, chúng ta sẽ có package cuối cùng như dưới đây:

```
$ cy-ipk find cy-nat
cy-ipk: searching in /home/giometti/yocto/imx-yocto-bsp/imx8mp-build...
tmp/deploy/ipk/armv8a/cy-nat-dev_0.1-r0_armv8a.ipk
tmp/deploy/ipk/armv8a/cy-nat-dbg_0.1-r0_armv8a.ipk
tmp/deploy/ipk/armv8a/cy-nat-src_0.1-r0_armv8a.ipk
tmp/deploy/ipk/armv8a/cy-nat_0.1-r0_armv8a.ipk
```

Và khi xem package, chúng ta sẽ thấy chỉ có chương trình `cy-target`, đúng như mong đợi:

```
$ cy-ipk inspect tmp/deploy/ipk/armv8a/cy-nat_0.1-r0_armv8a.ipk
drwxr-xr-x root/root         0 2011-04-05 23:00 ./usr/
drwxr-xr-x root/root         0 2011-04-05 23:00 ./usr/bin/
-rwxr-xr-x root/root      6120 2011-04-05 23:00 ./usr/bin/cy-target
```

Công cụ `cy-tool` của chúng ta (được compile cho host) được đặt trong Yocto build system, ở một thư mục phù hợp, nơi các công cụ khác được lưu:

```
$ ls $BUILDDIR/tmp/work/armv8a-poky-linux/cy-nat/0.1-r0/recipe-sysroot-n
ative/usr/bin/
aarch64-poky-linux     infocmp               pseudo
arfile.py              infotocap             pseudodb
...
curl                   lzma                  rpmdb.real
curl-config            lzmadec               rpmgraph
cy-tool                lzmainfo              rpmgraph.real
...
```

### 11.6.2 Native Python code (Native Python Code)

Để cho thấy cách viết một recipe Python-native, chúng ta có thể dùng một chương trình C đơn giản được tạo ra bởi một Python script. Trong thư mục `examples/ecdemo`, chúng ta có thể thấy các file sau:

```
$ cd ~/yocto/examples/ecdemo/
$ ls
Makefile  gen_data.py  key.h  print_key.c
```

trong đó trong `Makefile` chúng ta có các chỉ dẫn sau:

```
$ cat Makefile
TARGET = print_key
CFLAGS = -Wall -O2
PYTHON ?= python3

all: $(TARGET)

$(TARGET): print_key.c key.c

key.c:
        $(PYTHON) gen_data.py

clean:
        rm -f *.o $(TARGET) key.c

PHONY: all clean
```

File target `print_key` là một file thực thi có được bằng cách compile hai file `.c` tên là `print_key.c` và `key.c`.

Bạn đọc nên chú ý rằng file `key.c` được tạo bằng lệnh sau:

```
$(PYTHON) gen_data.py
```

Thật vậy, để thực thi `gen_data.py`, chúng ta cần gọi Python interpreter, nhưng, như đã làm trong Chương 9 để gọi C compiler, chúng ta không gọi trực tiếp chương trình `python`, mà dùng environment variable `PYTHON` để chắc chắn đúng chương trình được `bitbake` gọi. Tuy nhiên, vì biến này không được định nghĩa mặc định trong một Bash environment bình thường như biến `CC`, chúng ta cần thiết lập đặc biệt `PYTHON ?= python3` để chắc chắn một giá trị mặc định được dùng.

Nội dung của `gen_data.py`, file tạo ra file `key.c`, chứa code sau:

```
$ cat gen_data.py
import os
import sys
import getopt
import struct

from fastecdsa import keys, curve

NAME = os.path.basename(sys.argv[0])

def c_print(file, name, data):
    file.write('uint8_t %s[SIGN_PUB_KEY_SIZE] = {\n' % name)
    for counter, v in enumerate(data):
        if counter % 8 == 0:
            file.write('\t');
        file.write('0x%02x, ' % v)
        if counter % 8 == 7:
            file.write('\n');
    file.write('\n};\n')

#
# Main
#

try:
    f = open("key.c", "w+")
except err:
    print(str(err))
    os.exit(1)

# generate a keypair (i.e. both keys) for curve P521
priv_key, pub_key = keys.gen_keypair(curve.P521)
print("pub x:", hex(pub_key.x))
print("pub y:", hex(pub_key.y))

xl = struct.unpack('B' * 66, pub_key.x.to_bytes(66, 'big'))
yl = struct.unpack('B' * 66, pub_key.y.to_bytes(66, 'big'))

f.write('#include "key.h"\n\n')
f.write('/*** Warning: auto-generated file! Do not modify ***/\n\n')
c_print(f, "pub_key_x", xl)
c_print(f, "pub_key_y", yl)

exit(0)
```

Những gì code này làm rất đơn giản: nó tạo một cặp key rồi tạo một đoạn code C chép public key vào hai mảng byte. Sau đó các mảng này được code trong `print_key.c` đọc và in ra standard output ở dạng hexadecimal. File này chỉ chứa đoạn code đơn giản sau:

```
$ cat print_key.c
#include <stdio.h>

#include "key.h"

void print_data(char *label, uint8_t *data)
{
        int i;

        printf("%s ", label);
        for (i = 0; i < SIGN_PUB_KEY_SIZE; i++)
                printf("%02x", data[i]);
        printf("\n");
}

int main(void)
{
        print_data("pub x: ", pub_key_x);
        print_data("pub y: ", pub_key_y);

        return 0;
}
```

còn trong file `key.h` chúng ta có

```
$ cat key.h
#ifndef _KEY_H
#define _KEY_H

#include <stdint.h>

#define SIGN_PUB_KEY_SIZE    66

extern uint8_t pub_key_x[SIGN_PUB_KEY_SIZE];
extern uint8_t pub_key_y[SIGN_PUB_KEY_SIZE];

#endif
```

Bây giờ, để có ý niệm về những gì code này thực hiện, chúng ta có thể compile và thực thi nó:

```
$ make
python3 gen_data.py
pub x: 0x18f73632029f79088fcdfb6672d77d75a00ff15ebb0afb26d538db17866a06
8555ee859b5c77f658e72435bc25cc77a205b797e4873258fd903f9b7122fe5996b2f
pub y: 0x1a0d3430e4a908fc9720f675bd1e2409350aba4730955267dcc0017e3f2303
29705e3d0941c2bc28302294deba456136890fd62145f0f7b0976786ff5e645d80156
cc -Wall -O2    print_key.c key.c   -o print_key
```

> Trong trường hợp gặp lỗi sau, điều đó có nghĩa là hệ thống của chúng ta thiếu hỗ trợ fastecdsa (xem Mục 10.3.2):
>
> ```
> Traceback (most recent call last):
>   File "/home/giometti/yocto/examples/ecdemo/gen_data.py", line 6,
>  in <module>
>     from fastecdsa import keys, curve
> ModuleNotFoundError: No module named 'fastecdsa'
> make: *** [Makefile:10: key.c] Error 1
> ```
>
> Chúng ta có thể giải quyết vấn đề này bằng lệnh sau để cài package vào host system:
>
> ```
> $ pip3 install fastecdsa
> ```
>
> Cũng lưu ý rằng việc có thể dùng các hàm fastecdsa trong Yocto build system là hữu ích, nơi chúng ta cần phiên bản native của package.

File được tạo ra chứa code sau:

```
$ cat key.c
#include "key.h"

/*** Warning: auto-generated file! Do not modify ***/

uint8_t pub_key_x[SIGN_PUB_KEY_SIZE] = {
        0x01, 0x8f, 0x73, 0x63, 0x20, 0x29, 0xf7, 0x90,
        0x88, 0xfc, 0xdf, 0xb6, 0x67, 0x2d, 0x77, 0xd7,
        0x5a, 0x00, 0xff, 0x15, 0xeb, 0xb0, 0xaf, 0xb2,
        0x6d, 0x53, 0x8d, 0xb1, 0x78, 0x66, 0xa0, 0x68,
        0x55, 0x5e, 0xe8, 0x59, 0xb5, 0xc7, 0x7f, 0x65,
        0x8e, 0x72, 0x43, 0x5b, 0xc2, 0x5c, 0xc7, 0x7a,
        0x20, 0x5b, 0x79, 0x7e, 0x48, 0x73, 0x25, 0x8f,
        0xd9, 0x03, 0xf9, 0xb7, 0x12, 0x2f, 0xe5, 0x99,
        0x6b, 0x2f,
};
uint8_t pub_key_y[SIGN_PUB_KEY_SIZE] = {
        0x01, 0xa0, 0xd3, 0x43, 0x0e, 0x4a, 0x90, 0x8f,
        0xc9, 0x72, 0x0f, 0x67, 0x5b, 0xd1, 0xe2, 0x40,
        0x93, 0x50, 0xab, 0xa4, 0x73, 0x09, 0x55, 0x26,
        0x7d, 0xcc, 0x00, 0x17, 0xe3, 0xf2, 0x30, 0x32,
        0x97, 0x05, 0xe3, 0xd0, 0x94, 0x1c, 0x2b, 0xc2,
        0x83, 0x02, 0x29, 0x4d, 0xeb, 0xa4, 0x56, 0x13,
        0x68, 0x90, 0xfd, 0x62, 0x14, 0x5f, 0x0f, 0x7b,
        0x09, 0x76, 0x78, 0x6f, 0xf5, 0xe6, 0x45, 0xd8,
        0x01, 0x56,
};
```

Các byte trong các mảng là những byte tạo nên public key được tạo ra. Vì vậy, nếu thực thi chương trình `print_key`, chúng ta sẽ có output sau:

```
$ ./print_key
pub x:  018f73632029f79088fcdfb6672d77d75a00ff15ebb0afb26d538db17866a06
8555ee859b5c77f658e72435bc25cc77a205b797e4873258fd903f9b7122fe5996b2f
pub y:  01a0d3430e4a908fc9720f675bd1e2409350aba4730955267dcc0017e3f2303
29705e3d0941c2bc28302294deba456136890fd62145f0f7b0976786ff5e645d80156
```

Giờ đã biết dự án demo này hoạt động thế nào, chúng ta đã sẵn sàng tạo recipe tương ứng bằng `devtool` như thường lệ:

```
$ devtool add ecdemo git:///home/giometti/yocto/examples/ecdemo/
...
INFO: Recipe /home/giometti/yocto/imx-yocto-bsp/imx8mp-
build/workspace/recipes/ecdem
o/ecdemo_git.bb has been automatically created; further editing may be
required to make it fully functional
```

Bây giờ chúng ta có thể sửa recipe được tạo bằng lệnh `devtool` `edit-recipe ecdemo` để nó giống với code được trình bày dưới đây:

```
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf
8506ecda2f7b4f302"

SRC_URI = "git:///home/giometti/yocto/examples/ecdemo/;branch=master"

PV = "1.0+git${SRCPV}"
SRCREV = "64af940badaa46fd4b5eb3b176aeddfc980db611"

S = "${WORKDIR}/git"

do_configure () {
        :
}

do_compile () {
        oe_runmake
}

do_install () {
        install -d ${D}/${bindir}
        install print_key ${D}/${bindir}/
}
```

Trong code trên, chúng ta chỉ sửa license và task `do_install`; các phần còn lại được giữ nguyên.

Bây giờ, nếu yêu cầu `devtool` build recipe, chúng ta sẽ có output sau:

```
$ devtool build ecdemo
...
NOTE: ecdemo: compiling from external source tree /home/giometti/yocto/
imx-yocto-bsp/imx8mp-build/workspace/sources/ecdemo
...
| DEBUG: Executing shell function do_compile
| NOTE: make -j 2
| /home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/work/armv8a-poky-
linux/ecdemo/1.0+git999-r0/recipe-sysroot-native/usr/bin/python3-native
/python3 gen_data.py
| Traceback (most recent call last):
|   File "/home/giometti/yocto/imx-yocto-bsp/imx8mp-build/workspace/sou
rces/ecdemo/gen_data.py", line 6, in <module>
|     from fastecdsa import keys, curve
| ModuleNotFoundError: No module named 'fastecdsa'
| make: *** [Makefile:9: key.c] Error 1
| ERROR: oe_runmake failed
| WARNING: exit code 1 from a shell command.
...
```

> Bạn đọc nên chú ý rằng biến `PYTHON` được expansion thành đúng đường dẫn của Python interpreter của Yocto Project.

Lỗi này đã được dự đoán, vì package phụ thuộc vào package fastecdsa mà chúng ta đã chuẩn bị trong Mục 10.3.2. Tuy nhiên, chúng ta cần phiên bản native của package đó, vì vậy nên thay đổi recipe như sau để hỗ trợ việc tạo native package:

```
--- a/python3-fastecdsa_2.3.2.bb
+++ b/python3-fastecdsa_2.3.2.bb
@@ -10,7 +10,7 @@
 PYPI_PACKAGE = "fastecdsa"
 SRC_URI[sha256sum] = "f35255a6d3e41109166b5d4b08866d5acbb99f2e1e64d3a7
e74c774664cda842"

-inherit pypi setuptools3_legacy
+inherit pypi setuptools3_legacy python3native

 do_install:append() {
         # Remove invalid UNKNOWN-0.0.0-py3.10.egg-info directory
@@ -27,3 +27,5 @@
 FILES:${PN}-tests = "${PYTHON_SITEPACKAGES_DIR}/fastecdsa/tests/"

 RDEPENDS:${PN}-tests = "${PN}"
+
+BBCLASSEXTEND = "native"
```

Thiết lập cho `BBCLASSEXTEND` tương tự như thiết lập ở mục trước, còn việc kế thừa class python3native là cần thiết để chắc chắn mọi biến Python-related được đặt đúng. Thật vậy, trong file `python3native.bbclass` chúng ta có thể thấy thiết lập `PYTHON`:

```
$ cat poky/meta/classes/python3native.bbclass
inherit python3-dir

PYTHON="${STAGING_BINDIR_NATIVE}/python3-native/python3"
EXTRANATIVEPATH += "python3-native"
DEPENDS:append = " python3-native "
...
```

Bây giờ chúng ta có thể yêu cầu BitBake build recipe `python3-fastecdsa-native` để chắc chắn mọi thứ vẫn compile đúng:

```
$ bitbake python3-fastecdsa-native
```

Sau đó chúng ta có thể cập nhật recipe của package ecdemo để thêm tường minh phụ thuộc khi compile:

```
--- a/workspace/recipes/ecdemo/ecdemo_git.bb
+++ b/workspace/recipes/ecdemo/ecdemo_git.bb
@@ -1,6 +1,8 @@
 LICENSE = "CLOSED"
 LIC_FILES_CHKSUM = ""

+DEPENDS = "python3-fastecdsa-native"
+
 SRC_URI = "git:///home/develop/Projects-OLD/packt/Customizing_Yocto/yo
cto/examples/ecdemo/;branch=master"
```

Bây giờ lệnh build sẽ thực thi thành công. Sau đó, để thử code, chúng ta có thể deploy nó:

```
$ devtool deploy-target -s ecdemo root@192.168.32.132
...
./
./usr/
./usr/bin/
./usr/bin/print_key
INFO: Successfully deployed /home/giometti/yocto/imx-yocto-bsp/imx8mp-b
uild/tmp/work/armv8a-poky-linux/ecdemo/1.0+git999-r0/image
```

Sau đó trên target, output sẽ giống như dưới đây:

```
# print_key
pub x:  009445b538e4af441c24622eceb46fab5db927435806b3c04e5acbc905ef61f
cd5b54b0d049e263f4658a955924a94be7a6f0667d39b5668b7a918fac6019b9d9e5c
pub y:  00e01d18911e9649a04b6c62e51e07ff0bd0d449f092aa35c3be74acdd82d32
5f558158598b8864f782371932a192fc109d10494338a099e3485b1814d531b9805d7
```

Bây giờ, để tạo recipe, chúng ta có thể dùng `devtool finish` như dưới đây:

```
$ devtool finish -f ecdemo $CY_METADIR/recipes-example
...
INFO: Updating SRCREV in recipe ecdemo_git.bb
INFO: Moving recipe file to /home/giometti/yocto/imx-yocto-bsp/sources/
meta-cy/recipes-example/ecdemo
INFO: Leaving source tree /home/giometti/yocto/imx-yocto-bsp/imx8mp-bui
ld/workspace/sources/ecdemo as-is; if you no longer need it then please
 delete it manually
```

Recipe giờ đã nằm trong meta layer của chúng ta:

```
$ cd $CY_METADIR
$ tree recipes-example/ecdemo/
recipes-example/ecdemo/
└── ecdemo_git.bb

0 directories, 1 file
```

## 11.7 Tóm tắt (Summary)

Trong chương này, chúng ta đã xem thêm các ví dụ về việc viết recipe để giải quyết các task thường gặp trong phát triển hệ thống embedded. Cùng với Chương 9 và 10, chúng ta hẳn đã bao quát gần như mọi vấn đề thường gặp mà một embedded developer có thể gặp khi viết recipe; tuy nhiên, còn thiếu một bước cuối cùng: viết recipe cho image.

Vì vậy đã đến lúc chuyển sang chương tiếp theo, nơi chúng ta có thể học cách làm việc đó qua nhiều ví dụ thực tế.

