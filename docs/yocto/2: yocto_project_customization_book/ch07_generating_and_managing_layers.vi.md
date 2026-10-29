# Chương 7. Tạo và quản lý layer (Generating and Managing Layers)

Bắt đầu từ chương này, chúng ta bước vào phần thứ ba của sách, nơi chúng ta có thể thấy cách thực sự tùy biến hệ thống Yocto mới cài, như được nhà cung cấp hardware phát hành.

Trong chương này, chúng ta sẽ tập trung vào việc định nghĩa một layer mới, nơi có thể thêm machine mới và recipe mới (hoặc tùy biến recipe từ các layer khác) để tùy biến một bản phân phối Yocto đang chạy cho một kit embedded. Điều này sẽ rút ngắn time to market cho hardware tùy biến.

## 7.1 Bố cục điển hình (A Typical Layout)

Như đã giới thiệu trong Mục 3.2, mỗi layer cung cấp các loại cấu hình khác nhau cho một distribution (tức là cấu hình machine hoặc distro, v.v.), và best practice quy định rằng chúng ta nên tách riêng các loại cấu hình này vào layer của chúng.

Tuy nhiên, ngoài những điều này, mọi layer thường trông như dưới đây:

```
$ cd sources/meta-freescale
$ ls
COPYING.MIT  custom-licenses       recipes-dpaa        recipes-security
EULA         dynamic-layers        recipes-dpaa2       recipes-support
LICENSE      recipes-bsp           recipes-extended    scripts
README       recipes-connectivity  recipes-fsl         wic
SCR          recipes-core          recipes-graphics
classes      recipes-devtools      recipes-kernel
conf         recipes-downgrade     recipes-multimedia
```

Thông thường, một layer chứa

- Một hoặc nhiều file license: Thường có tên `COPYING.MIT`, `EULA`, `LICENSE` , v.v. Các file này nằm trong thư mục gốc của mỗi layer hoặc trong các thư mục được chỉ định (ví dụ, layer `meta-freescale` lưu các file license bổ sung trong thư mục `custom-licenses`).

- Một file `README`: Dù không phải là must-have, best practice là thêm một file `README` vào mỗi layer, mô tả layer dùng để làm gì, các layer mà nó phụ thuộc và các thông tin hữu ích khác về layer. Ví dụ, trong file `README` ở trên, chúng ta có thể thấy nội dung như dưới đây:

  ```
  $ cat README
  OpenEmbedded/Yocto BSP layer for Freescale's platforms
  ======================================================

  This layer provides support for Freescale's platforms for use with
  OpenEmbedded and/or Yocto.

  This layer depends on:

  URI: git://git.openembedded.org/openembedded-core
  branch: kirkstone
  revision: HEAD

  Contributing
  ------------
  Please submit any patches against the meta-freescale layer by
  using the GitHub pull-request feature.  Fork the repo, make a
  branch, do the work, rebase from upstream, create the pull
  request.

  For some useful guidelines to be followed when submitting patches,
  please refer to:
  http://openembedded.org/wiki/Commit_Patch_Message_Guidelines

  Pull requests will be discussed within the GitHub pull-request
  infrastructure. If you want to get informed on new PRs and the
  follow-up discussions please use the GitHub's notification system.

  Mailing list:

      https://lists.yoctoproject.org/g/meta-freescale

  Source code:

      https://github.com/Freescale/meta-freescale
  ```

- Class file: Mọi file `.bbclass` đều nằm trong thư mục con `classes` của layer.

- File cấu hình: Mọi file `.conf` đều nằm trong thư mục con `conf` của layer. Trong thư mục này, chúng ta thấy các file cấu hình của layer (file `conf/layer.conf`), có thể có các file machine (`conf/machine/*.conf`) và distribution (`conf/distro/*.conf`), cùng mọi file cấu hình hữu ích khác và/hoặc các include file (`.inc`).

- File recipe: Mỗi recipe được lưu trong một thư mục riêng mang chính tên recipe, tất cả được nhóm trong các thư mục có tên với tiền tố `recipes-`. Nội dung trong các thư mục recipe có thể khác nhau, và nói chung, các thư mục này chứa file recipe (`.bb`), file recipe append (`.bbappend`), các thư mục distro-specific cho file cấu hình, v.v. Ví dụ:

  ```
  $ cd meta-freescale
  $ ls recipes-devtools/
  devregs  imx-usb-loader  qemu  qoriq-cst  utp-com  uuu
  $ tree recipes-devtools/uuu/
  recipes-devtools/uuu/
  ├── files
  │   └── 0001-remove-unnecessary-libzip-dependency.patch
  └── uuu_git.bb

  1 directory, 2 files
  ```

- Các thư mục tùy biến riêng: Chúng ta có thể có nhiều thư mục, nơi có thể tìm thấy các script hữu ích hoặc các file cấu hình bổ sung cho các công cụ tùy biến của layer, file tài liệu, v.v.

> Để đưa ra một ví dụ về các thư mục cuối cùng này có thể trông như thế nào, trong chương này chúng ta sẽ định nghĩa một thư mục `scripts` tùy biến trong layer tùy biến của mình, nơi chúng ta sẽ thêm các script tiện ích.

## 7.2 Tạo một layer mới (Creating a New Layer)

Dù tạo một layer mới bằng tay không quá khó (chúng ta phải tạo vài thư mục và vài file cấu hình), việc tạo layer mới bằng script `bitbake-layers` với subcommand `create-layer` đơn giản hơn và ít error-prone hơn.

Usage message được trình bày dưới đây:

```
$ bitbake-layers create-layer -h
NOTE: Starting bitbake server...
usage: bitbake-layers create-layer [-h] [--layerid LAYERID]
                                   [--priority PRIORITY]
                                   [--example-recipe-name EXAMPLERECIPE]
                                   [--example-recipe-version VERSION]
                                   layerdir
Create a basic layer

positional arguments:
  layerdir              Layer directory to create

options:
  -h, --help            show this help message and exit
  --layerid LAYERID, -i LAYERID
                        Layer id to use if different from layername
  --priority PRIORITY, -p PRIORITY
                        Priority of recipes in layer
  --example-recipe-name EXAMPLERECIPE, -e EXAMPLERECIPE
                        Filename of the example recipe
  --example-recipe-version VERSION, -v VERSION
                        Version number for the example recipe
```

Vì vậy, ví dụ, để tạo một layer mới tên là `meta-cy`, chúng ta có thể thực thi lệnh tiếp theo:

```
$ bitbake-layers create-layer ../sources/meta-cy
NOTE: Starting bitbake server...
Add your new layer with 'bitbake-layers add-layer ../sources/meta-cy'
```

> Lưu ý rằng chúng ta dùng chuỗi `../sources/meta-cy` cho `layerdir` vì chúng ta đang thực thi `bitbake-layers` trong `imx8mp-build directory`, và mọi layer mới nên nằm trong thư mục source.
>
> Đây không phải là quy tắc cố định, nhưng làm như vậy, bạn có thể nhóm mọi layer dưới cùng một thư mục cha.

Bây giờ, nếu xem thư mục layer mới được tạo, chúng ta sẽ thấy nội dung như dưới đây:

```
$ cd ../sources/meta-cy
$ ls
COPYING.MIT  README  conf  recipes-example
```

Ở đây, điều thực sự quan trọng cần chú ý nằm trong thư mục `conf`:

```
$ ls conf/
layer.conf
```

Trong `layer.conf file`, tức là file cấu hình của layer, chúng ta sẽ thấy nội dung như dưới đây:

```
$ cat conf/layer.conf
# We have a conf and classes directory, add to BBPATH
BBPATH .= ":${LAYERDIR}"

# We have recipes-* directories, add to BBFILES
BBFILES += "${LAYERDIR}/recipes-*/*/*.bb \
            ${LAYERDIR}/recipes-*/*/*.bbappend"

BBFILE_COLLECTIONS += "meta-cy"
BBFILE_PATTERN_meta-cy = "^${LAYERDIR}/"
BBFILE_PRIORITY_meta-cy = "6"

LAYERDEPENDS_meta-cy = "core"
LAYERSERIES_COMPAT_meta-cy = "kirkstone"
```

Dưới đây là giải thích ngắn gọn về ý nghĩa của các thiết lập trên:

- `BBPATH`: Biến này thêm thư mục gốc của layer vào search path của BitBake. Nhờ biến này, BitBake tìm thấy class file (`.bbclass`), file cấu hình (`.conf`), file recipe (`.bb` và `.bbappend`) và các file được đưa vào bằng câu lệnh include và require (`.inc`).

> Lưu ý rằng BitBake dùng file đầu tiên khớp tên được tìm thấy trong `BBPATH`, tương tự cách biến `PATH` được dùng cho các binary. Vì vậy khuyến nghị developer dùng tên class file và file cấu hình duy nhất trong các layer tùy biến của mình.

- `BBFILES`: Định nghĩa vị trí của mọi recipe trong layer. Thông thường, chúng ta không cần thay đổi thiết lập này, vì gần như đã thành chuẩn rằng recipe và các file append nằm trong các thư mục có tiền tố là chuỗi `recipes-` và nằm trong một thư mục bên dưới chúng.

- `BBFILE_COLLECTIONS`: Được dùng để liệt kê tên của các layer đã cấu hình trong Yocto build system. Các tên này được dùng để tìm các biến `BBFILE_*` khác được trình bày dưới đây.

> Mọi biến sau đây đều phải có hậu tố là tên của layer cụ thể.

- `BBFILE_PATTERN`: Được expansion để khớp các file từ `BBFILES` trong một layer cụ thể, thường được chỉ định qua `LAYERDIR`, như trong ví dụ trên.

- `BBFILE_PRIORITY`: Xác lập độ ưu tiên dùng cho các recipe trong layer khi quá trình build tìm thấy các recipe cùng tên ở các layer khác nhau. Giá trị biến càng lớn thì quyền ưu tiên càng cao, bất kể phiên bản của recipe (biến `PV`). Ví dụ, một layer có recipe với giá trị `PV` cao hơn nhưng có `BBFILE_PRIORITY` được đặt với quyền ưu tiên thấp hơn thì vẫn có quyền ưu tiên thấp hơn.

- `LAYERDEPENDS`: Liệt kê mọi layer, cách nhau bằng dấu cách, mà layer hiện tại phụ thuộc vào (nếu có). Chúng ta có thể tùy chọn chỉ định một phiên bản layer cụ thể cho một phụ thuộc bằng cách thêm nó vào cuối tên layer. Ví dụ:

  ```
  LAYERDEPENDS_layer = "layer2 (=3)"
  ```

  Khi đó chúng ta yêu cầu phiên bản 3 của `layer2`, và một lỗi sẽ được tạo ra nếu số phiên bản không khớp (hoặc nếu thiếu bất kỳ phụ thuộc nào).

- `LAYERSERIES_COMPAT`: Liệt kê các bản phát hành Yocto Project mà phiên bản hiện tại tương thích. Biến này là một cách tốt để phát hiện khi một layer không được bảo trì tốt (tức là chưa được kiểm thử với các bản phát hành Yocto mới).

Hơn nữa, không được trình bày trong ví dụ trên vì chúng là tùy chọn, chúng ta có thể có

- `LAYERVERSION`: Một biến tùy chọn để chỉ định phiên bản của một layer dưới dạng một số duy nhất. Khi đó, số này có thể được dùng trong `LAYERDEPENDS` của một layer khác (trong file `conf/layer.conf` của layer đó) để phụ thuộc vào một phiên bản cụ thể của layer chúng ta.

- `LAYERRECOMMENDS`: Tương tự `LAYERDEPENDS`, nó liệt kê các layer, cách nhau bằng dấu cách, được khuyến nghị dùng cùng layer hiện tại.

Tốt, giờ chúng ta đã biết chính xác các biến này dùng để làm gì, và vì layer của chúng ta nên có quyền ưu tiên hơn các layer khác, tốt hơn là đặt giá trị độ ưu tiên cao hơn cho nó. Để làm vậy, chúng ta có thể dùng lệnh `bitbake-` `layers show-layers` để tìm giá trị cao nhất được định nghĩa trong hệ thống rồi đặt đúng giá trị `BBFILE_PRIORITY_meta-cy`:

```
$ bitbake-layers show-layers
NOTE: Starting bitbake server...
layer                 path                                  priority
====================================================================
meta      .../imx-yocto-bsp/sources/poky/meta                    5
meta-poky .../imx-yocto-bsp/sources/poky/meta-poky               5
meta-oe   .../imx-yocto-bsp/sources/meta-openembedded/meta-oe    5
...
meta-engicam-nxp .../imx-yocto-bsp/sources/meta-engicam-nxp      6
```

> Output ở trên đã được rút gọn để dễ đọc hơn. Thật vậy, mọi đường dẫn của layer đều không bị cắt bằng `...` và là đường dẫn tuyệt đối, ví dụ, `/home/giometti/yocto/imx-yocto-` `bsp/sources/meta-openembedded/meta-oe`.

Ở đây, chúng ta có thể dễ dàng thấy rằng trong ví dụ của mình, có thể yên tâm dùng `15` làm độ ưu tiên cao hơn.

Hơn nữa, vì hệ thống embedded tùy biến của chúng ta được phát triển từ development kit của Engicam, tốt hơn là báo cho Yocto build system biết rằng layer của chúng ta cũng phụ thuộc vào layer `meta-engicam`.

Vì vậy, chúng ta phải thực hiện các sửa đổi sau:

```
--- sources/meta-cy/conf/layer.conf
+++ sources/meta-cy/conf/layer.conf
@@ -7,7 +7,7 @@

 BBFILE_COLLECTIONS += "meta-cy"
 BBFILE_PATTERN_meta-cy = "^${LAYERDIR}/"
-BBFILE_PRIORITY_meta-cy = "6"
+BBFILE_PRIORITY_meta-cy = "15"

-LAYERDEPENDS_meta-cy = "core"
+LAYERDEPENDS_meta-cy = "core meta-engicam-nxp"
 LAYERSERIES_COMPAT_meta-cy = "kirkstone"
```

Sau đó, file `layer.conf` của chúng ta sẽ trông như sau:

```
$ cat meta-cy/conf/layer.conf
# We have a conf and classes directory, add to BBPATH
BBPATH .= ":${LAYERDIR}"

# We have recipes-* directories, add to BBFILES
BBFILES += "${LAYERDIR}/recipes-*/*/*.bb \
            ${LAYERDIR}/recipes-*/*/*.bbappend"

BBFILE_COLLECTIONS += "meta-cy"
BBFILE_PATTERN_meta-cy = "^${LAYERDIR}/"
BBFILE_PRIORITY_meta-cy = "15"

LAYERDEPENDS_meta-cy = "core meta-engicam-nxp"
LAYERSERIES_COMPAT_meta-cy = "kirkstone"
```

Giờ mọi thứ đã sẵn sàng, và chúng ta đã sẵn sàng thêm layer mới vào Yocto build system.

## 7.3 Thêm một layer (Adding a Layer)

Mọi layer đều nằm trong một thư mục, và để thêm nó vào Yocto build system, chúng ta cần lệnh `bitbake-layers add-layer` như dưới đây:

```
$ bitbake-layers add-layer ../sources/meta-cy
NOTE: Starting bitbake server...
```

> Lưu ý rằng chúng ta đã dùng một đường dẫn tương đối vì đã thực thi lệnh trên trong build directory.

Thao tác này sẽ thay đổi `conf/bblayers.conf` trong build directory của chúng ta. Để kiểm chứng, chúng ta chỉ cần xem file đó:

```
$ cat conf/bblayers.conf
LCONF_VERSION = "7"

BBPATH = "${TOPDIR}"
BSPDIR := "${@os.path.abspath(os.path.dirname(d.getVar('FILE', True))
+ '/../..')}"
...
BBLAYERS += "/home/giometti/yocto/imx-yocto-bsp/sources/meta-cy"
```

Một cách hữu ích khác để kiểm tra thiết lập mới này là dùng lệnh `bitbake-layers show-layers`, như dưới đây:

```
$ bitbake-layers show-layers
NOTE: Starting bitbake server...
layer                 path                                  priority
====================================================================
meta      .../imx-yocto-bsp/sources/poky/meta                    5
meta-poky .../imx-yocto-bsp/sources/poky/meta-poky               5
meta-oe   .../imx-yocto-bsp/sources/meta-openembedded/meta-oe    5
...
meta-engicam-nxp .../imx-yocto-bsp/sources/meta-engicam-nxp      6
meta-cy   .../imx-yocto-bsp/sources/meta-cy                     15
```

> Ở đây output cũng đã được thay đổi để dễ đọc hơn, như ở trên! Thật vậy, bạn đọc cũng có thể có một mục cho workspace, không được trình bày ở đây.

Ở đây, chúng ta cũng có thể kiểm chứng rằng mình đã có độ ưu tiên đã đặt ở mục trước. Để kiểm tra nhanh các phụ thuộc của layer, chúng ta có thể dùng lệnh `bitbake-layers layerindex-show-depends` như dưới đây:

```
$ bitbake-layers layerindex-show-depends meta-cy
NOTE: Starting bitbake server...
ERROR: Missing dependency selinux (HEAD)
ERROR: Missing dependency webserver (HEAD)
Layer                                              Git repository (bran
ch)                                 Subdirectory
=======================================================================
local:HEAD:openembedded-core                       https://git.yoctopro
ject.org/git/poky (HEAD)            meta
  required by: meta-cy meta-engicam-nxp
local:HEAD:meta-engicam-nxp                        https://github.com/e
ngicam-stable/meta-engicam-nxp.git (kirkstone)
  required by: meta-cy
local:HEAD:meta-cy                                 file:///home/giomett
i/yocto/imx-yocto-bsp/sources/meta-cy (<unknown>)
```

> Output của lệnh trên thực sự rất lớn; đó là lý do chúng ta đã sắp xếp lại một số thông tin trong output ở trên. Bạn đọc có thể nhận được định dạng khác trên hệ thống của mình.

Trong output trên, chúng ta có thêm nhiều thông tin về thiết lập hiện tại của build system. Trước tiên, chúng ta thấy các phụ thuộc đã đặt được thiết lập đúng, sau đó có thể thấy các layer mà layer mới của chúng ta phụ thuộc vào đến từ các remote repository, và chúng ta cũng biết branch hiện tại của chúng. Layer mới của chúng ta có giá trị `file:///home/giometti/yocto/imx-yocto-bsp/sources/meta-cy (<unknown>)` trong trường `Git repository` `(branch)` vì chúng ta chưa tạo git repository cho nó. Tuy nhiên, chúng ta có thể sửa bằng cách làm như dưới đây:

```
$ cd /home/giometti/yocto/imx-yocto-bsp/sources/meta-cy
$ git init
Initialized empty Git repository in /home/giometti/yocto/imx-yocto-bsp/
sources/meta-cy/.git/
```

> Trên một số hệ thống, sau lệnh này, bạn đọc có thể nhận được warning message sau:
>
> ```
> hint: Using 'master' as the name for the initial branch. This
> hint: default branch name is subject to change. To configure the
> hint: initial branch name to use in all of your new repositories,
> hint: which will suppress this warning, call:
> hint:
> hint: git config --global init.defaultBranch <name>
> hint:
> hint: Names commonly chosen instead of 'master' are 'main', 'trunk'
> hint: and 'development'. The just-created branch can be renamed via
> hint: this command:
> hint:
> hint: git branch -m <name>
> ```
>
> Nếu vậy, chúng ta chỉ cần làm theo những gì hint message nói để sửa.
>
> Tuy nhiên, trong sách này, chúng ta tiếp tục mà không làm việc đó, và khi đó branch mặc định của chúng ta vẫn có tên là `master`.
>
> Tuy nhiên, để đổi tên branch, chúng ta có thể dùng lệnh `git branch` `(-m` \| `-M) [<oldbranch>] <newbranch>`.

Sau đó chúng ta tiếp tục bằng cách thêm mọi file trong thư mục hiện tại vào Git repository mới:

```
$ git add .
$ git commit -m "Initial commit"
[master 0828270] Initial commit
 Date: Fri Nov 17 10:47:42 2023 +0000
 4 files changed, 84 insertions(+)
 create mode 100644 COPYING.MIT
 create mode 100644 README
 create mode 100644 conf/layer.conf
 create mode 100644 recipes-example/example/example_0.1.bb
```

Giờ Git repository local cho layer mới đã được tạo, và khi đó chúng ta có thể push nó lên một vị trí remote bằng cách tạo repository trên một remote host (trong ví dụ của chúng ta, có một repository mới được tạo tại `https://github.com/giometti/meta-cy`). Sau đó chúng ta thực thi lệnh tiếp theo:

```
$ git push -u origin master
Enumerating objects: 9, done.
Counting objects: 100% (9/9), done.
Delta compression using up to 24 threads
Compressing objects: 100% (6/6), done.
Writing objects: 100% (9/9), 1.81 KiB | 1.81 MiB/s, done.
Total 9 (delta 0), reused 0 (delta 0), pack-reused 0
To github.com:giometti/meta-cy.git
 * [new branch]      master -> master
Branch 'master' set up to track remote branch 'master' from 'origin'.
```

Bây giờ, nếu thực thi lại lệnh `bitbake-layers layerindex-show-depends`, chúng ta thấy dòng liên quan đến layer mới đã thay đổi và remote Git repository được báo ra:

```
$ bitbake-layers layerindex-show-depends meta-cy
...
local:HEAD:meta-cy                                 ssh://git@github.com
:giometti/meta-cy.git (master)
```

Bây giờ, để kiểm chứng layer mới đã hoạt động, chúng ta có thể thử compile recipe mới `example_0.1.bb` đã được thêm vào khi tạo layer. Để làm vậy, chúng ta chỉ cần thực thi `bitbake` để deploy recipe `example` mới như dưới đây:

```
$ bitbake example
```

Nếu mọi thứ OK, chúng ta sẽ thấy build system bắt đầu compile recipe, và khi xong chúng ta sẽ thấy kết quả như dưới đây:

```
...
NOTE: Executing Tasks
***********************************************
*                                             *
*  Example recipe created by bitbake-layers   *
*                                             *
***********************************************
NOTE: Tasks Summary: Attempted 747 tasks of which 731 didn't need to be
 rerun and all succeeded.
```

Tuyệt! Layer mới đã sẵn sàng và hoạt động!

## 7.4 Thêm các script tùy biến (Adding Custom Scripts)

Giờ layer tùy biến mới đã sẵn sàng, nhưng trước khi bắt đầu định nghĩa machine hoặc recipe mới, chúng ta nên xem cách thêm các script tùy biến để làm những task hữu ích và thông thường.

Ở một mục trên, chúng ta đã giới thiệu khả năng một layer định nghĩa các thư mục tùy biến, và một trong số đó là thư mục `scripts`. Vậy hãy tạo nó trong layer của mình:

```
$ cd ../sources/meta-cy/
$ mkdir scripts
```

Sau đó chúng ta cũng có thể thêm một chương trình ví dụ nhỏ như dưới đây:

```
$ cat > scripts/cy-test << __EOF
#!/bin/bash
echo "\$(basename \$0): hello world!"
__EOF
$ chmod +x scripts/cy-test
```

Script mới này có thể được thực thi như dưới đây:

```
$ ./scripts/cy-test
cy-test: hello world!
```

Tuy nhiên, làm theo cách này không phải là điều chúng ta muốn! Thật vậy, chúng ta muốn rằng khi đã vào môi trường Yocto, có thể thực thi mọi script trong thư mục mới này chỉ bằng cách gõ tên của chúng. Để làm vậy, chúng ta nên xem script `setup-environment`, script thực sự làm việc này; cụ thể, chúng ta có thể thấy đoạn code sau:

```
$ cat ../setup-environment
...
OEROOT=$PWD/sources/poky
if [ -e $PWD/sources/oe-core ]; then
    OEROOT=$PWD/sources/oe-core
fi

. $OEROOT/oe-init-build-env $CWD/$1 > /dev/null
...
```

Ở đây, biến `OEROOT` được đặt, vì vậy chúng ta có thể đặt vào đây code đặc biệt của mình để thiết lập đúng biến `PATH` của Bash như dưới đây:

```
--- ../setup-environment
+++ ../setup-environment
@@ -138,6 +138,10 @@
     return 1
 fi

+# Add specific CY's defines and set the script directory in PATH
+export CY_METADIR="$PWD/sources/meta-cy"
+export PATH="$CY_METADIR/scripts:$PATH"
+
 OEROOT=$PWD/sources/poky
 if [ -e $PWD/sources/oe-core ]; then
     OEROOT=$PWD/sources/oe-core
```

Bây giờ chúng ta phải thoát rồi re-enter vào môi trường Yocto bằng cách đóng terminal hiện tại rồi source lại file setup- environment, như dưới đây:

```
$ cd imx-yocto-bsp
$ source setup-environment imx8mp-build
```

Sau đó biến mới sẽ có sẵn:

```
$ echo $CY_METADIR
/home/giometti/yocto/imx-yocto-bsp/sources/meta-cy
$ echo $PATH
/home/giometti/yocto/imx-yocto-bsp/sources/poky/scripts:/home/giometti/
yocto/imx-yocto-bsp/sources/poky/bitbake/bin:/home/giometti/yocto/imx-y
octo-bsp/sources/meta-cy/scripts:/sbin:/usr/sbin:...
```

Và chương trình `cy-test` sẽ thực thi được chỉ bằng cách gõ tên của nó:

```
$ cy-test
cy-test: hello world!
```

Tại thời điểm này, chúng ta có thể cân nhắc thêm một file khác, nơi có thể đặt mọi hàm tiện ích của mình. File mới (nằm trong meta layer `meta-cy` của chúng ta) được trình bày dưới đây:

```
$ cat scripts/cy-misc.inc
#!/bin/bash
#
if [[ "${BASH_SOURCE[0]}" = "${0}" ]] ; then
        echo "Don't call me directly! Just source me" >&2
        exit 1
fi

__RED='\033[0;31m'
__YELLOW="\e[33m"
__GREEN='\033[0;32m'
__NC='\033[0m' # No Color

# **********************************************************************
# * Exported API
# **********************************************************************

NAME=$(basename $0)

function fatal() {
        echo -e "$__RED$NAME$__NC: $@" >&2
        exit 1
}

function warn() {
        echo -e "$__YELLOW$NAME$__NC: $@"
}
function info() {
        echo -e "$__GREEN$NAME$__NC: $@"
}

function good() {
        echo -e "$__GREEN$@$__NC"
}

function bad() {
        echo -e "$__RED$@$__NC"
}

return 0
```

File rất sơ đẳng, và nó định nghĩa một số hàm đặc biệt để in các chuỗi đẹp mắt trên terminal. Nó cũng định nghĩa một biến Bash mới tên là `CY_METADIR`, có thể được dùng trong các script mới để chỉ tới thư mục chứa layer mới.

> Một environment variable thú vị và được dùng rộng rãi khác do các init script này định nghĩa là `BUILDDIR`; nó trỏ tới build directory chính. Trong ví dụ của chúng ta, ta có
>
> ```
> $ echo $BUILDDIR
> /home/giometti/yocto/imx-yocto-bsp/imx8mp-build
> ```
>
> Xem phần dưới của mục này để biết một số cách dùng khả dĩ.

Để dùng file mới này, chúng ta có thể viết lại chương trình `cy-test` như dưới đây:

```
$ cat scripts/cy-test
#!/bin/bash

CY_MISC_SH_FILE="cy-misc.inc"
if ! . $(dirname $0)/$CY_MISC_SH_FILE ; then
        echo "$0: fatal error! Cannot source $CY_MISC_SH_FILE"
        exit 1
fi

info "hello world!"
info "CY_METADIR=$CY_METADIR"

exit 0
```

Bây giờ, nếu thực thi lại nó, chúng ta sẽ có kết quả như dưới đây:

```
$ cy-test
cy-test: hello world!
cy-test: CY_METADIR=/home/giometti/yocto/imx-yocto-bsp/sources/meta-cy
```

> Trên các terminal hỗ trợ màu, bạn đọc sẽ thấy tiền tố `cy-test` màu xanh lá.

### 7.4.1 Xem xét biến (Inspecting Variables)

Từ Mục 4.1.3, chúng ta đã biết rằng để đọc một biến BitBake từ command line, chúng ta có thể dùng lệnh sau:

```
$ bitbake -e recipe | grep "VARIABLE="
```

trong đó `recipe` là tên một recipe (có thể tùy chọn nếu muốn xem một biến chung thay vì biến của một recipe), còn `VARIABLE` là tên biến. Tuy nhiên, một sơ đồ đầy đủ hơn được trình bày dưới đây:

```
$ bitbake -e recipe | grep "^\(export \)\?VARIABLE="
```

Lý do là, như đã thấy trong Mục 5.1.1, một số biến có thể được export, và khi đó, lúc được liệt kê, chúng có chuỗi `export` đứng trước.

Vì vậy, ví dụ, để lấy giá trị của biến chung `DL_DIR`, chúng ta có thể làm như sau:

```
$ bitbake -e | grep "^\(export \)\?DL_DIR="
DL_DIR="/home/giometti/Projects/DL_ARCHIVES/yocto/"
```

còn để lấy giá trị của `S` khi package `devmem2` được compile, chúng ta có thể làm như dưới đây:

```
$ bitbake -e devmem2 | grep "^\(export \)\?S="
S ="/home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/work/armv8a-poky
-linux/devmem2/2.0-r0/git"
```

Một biến hữu ích khác là `IMAGE_ROOTFS`, biến trỏ tới thư mục nơi root filesystem được build. Ví dụ, khi image `engicam-` `evaluation-image-mx8` đã được build bằng lệnh:

```
$ bitbake engicam-evaluation-image-mx8
```

thì chúng ta có thể xem giá trị của nó để biết Yocto build system đã tạo root filesystem cho target machine ở đâu:

```
$ bitbake -e engicam-evaluation-image-mx8 | \
                      grep "^\(export \)\?IMAGE_ROOTFS="
IMAGE_ROOTFS="/home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/work/
imx8mp_icore-poky-linux/engicam-evaluation-image-mx8/1.0-r0/rootfs"
$ ls /home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/work/imx8mp_ic
ore-poky-linux/engicam-evaluation-image-mx8/1.0-r0/rootfs
bin   dev  home  media  opt   run   srv  tmp         usr
boot  etc  lib   mnt    proc  sbin  sys  unit_tests  var
```

Mặt khác, nếu muốn xem Yocto build system đã tạo các package IPKG cho một recipe nhất định ở đâu, chúng ta có thể xem biến `PKGWRITEDIRIPK` như dưới đây:

```
$ bitbake -e devmem2 | grep "^\(export \)\?PKGWRITEDIRIPK="
PKGWRITEDIRIPK="/home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/wor
k/armv8a-poky-linux/devmem2/2.0-r0/deploy-ipks"
$ ls /home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/work/armv8a-po
ky-linux/devmem2/2.0-r0/deploy-ipks
armv8a
$ ls /home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/work/armv8a-po
ky-linux/devmem2/2.0-r0/deploy-ipks/armv8a/
devmem2-dbg_2.0-r0_armv8a.ipk  devmem2-src_2.0-r0_armv8a.ipk
devmem2-dev_2.0-r0_armv8a.ipk  devmem2_2.0-r0_armv8a.ipk
```

> Lưu ý rằng, như với ví dụ image ở trên, file package `devmem2` phải được deploy bằng
>
> ```
> $ bitbake devmem2
> ```
>
> Cũng lưu ý rằng các file IPKG thường nằm trong một thư mục con theo machine, trùng với `MACHINE`, nhưng không phải trong mọi trường hợp (đây là một trong những trường hợp đặc biệt như vậy).

Mọi điều này gợi ý chúng ta tạo một tiện ích mới, có thể gọi là `cy-vars`, có thể xem xét mọi biến này bằng các lệnh đơn giản. Một bản triển khai khả dĩ được trình bày trong file `meta-cy/scripts/cy-vars`, có thể lấy từ Git repository của chúng tôi tại `https://github.com/Apress/Yocto-Project-Customization-for-Linux`.

Nếu thực thi tiện ích, chúng ta có output sau:

```
$ cy-vars
usage: cy-vars <group>|<var> [<recipe>]
where <group> can be:
        bitbake             - main bitbake\'s variables
        main                - main Yocto\'s variables
        names               - package names
        dirs                - package directories
        image               - final image's variables
        virtual             - virtual packages
```

Vì vậy, để đọc các biến BitBake chung, chúng ta có thể thực thi lệnh sau:

```
$ cy-vars bitbake
BBFILES=" /home/giometti/yocto/imx-yocto-bsp/sources/poky/meta/recipes-
*/*/*.bb /home/giometti/yocto/imx-yocto-bsp/sources/poky/meta-poky/reci
pe...
```

còn để lấy danh sách các biến thư mục chính cho recipe `devmem2`, chúng ta có thể làm như dưới đây:

```
$ cy-vars dirs devmem2
B="/home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/work/armv8a-poky
-linux/devmem2/2.0-r0/git"
D="/home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/work/armv8a-poky
-linux/devmem2/2.0-r0/image"
S="/home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/work/armv8a-poky
-linux/devmem2/2.0-r0/git"
T="/home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/work/armv8a-poky
-linux/devmem2/2.0-r0/temp"
export base_bindir="/bin"
export base_libdir="/lib"
export base_sbindir="/sbin"
export bindir="/usr/bin"
export datadir="/usr/share"
export docdir="/usr/share/doc"
export includedir="/usr/include"
...
export sysconfdir="/etc"
export systemd_system_unitdir="/lib/systemd/system"
export systemd_unitdir="/lib/systemd"
export systemd_user_unitdir="/usr/lib/systemd/user"
target_datadir="/usr/share"
```

Phần cốt lõi của script này được trình bày dưới đây:

```
$ cat scripts/cy-vars
...
case $varid in
bitbake)
        regex="BBPATH\|BBFILES\|BBLAYERS\|"
        regex+="BB_ENV_PASSTHROUGH\|BB_ENV_PASSTHROUGH_ADDITIONS\|BB_PRES
ERVE_ENV\|"
        regex+="BSPDIR\|"
        regex+="BB_DEFAULT_TASK\|BB_GENERATE_MIRROR_TARBALLS"
        ;;
...
dirs)
        regex="S\|B\|D\|T\|"
        regex+="base_bindir\|base_libdir\|base_sbindir\|"
        regex+="bindir\|datadir\|docdir\|includedir\|infodir\|libdir\|"
        regex+="libexecdir\|localedir\|localstatedir\|mandir\|sbindir\|"
        regex+="servicedir\|sharedstatedir\|sysconfdir\|"
        regex+="nonarch_base_libdir\|nonarch_libdir\|target_datadir\|"
        regex+="systemd_system_unitdir\|systemd_unitdir\|systemd_user_uni
tdir"
        ;;
...
esac

bitbake -e $recipe | grep --color "^\(export \)\?\($regex\)="

exit 0
```

trong đó biến `regex` chứa một regular expression tùy theo dữ liệu người dùng nhập.

Trong các chương sau, lệnh này sẽ được dùng nhiều, vì vậy bạn đọc có thể hiểu cách dùng nó trong các tình huống khác nhau.

### 7.4.2 Xem xét package (Inspecting Packages)

Trong quá trình phát triển, và vì thế cũng trong sách này, chúng ta có thể cần tìm vị trí một package mới (một file `.ipk`), xem một package chứa gì, hoặc lấy một số thông tin về nó. Trong mọi trường hợp này, chúng ta có thể dùng các lệnh khác nhau để giải quyết vấn đề, nhưng có thể nhóm chúng trong một script đặc biệt mà chúng ta có thể gọi là `cy-ipk`.

Script này có thể lấy từ Git repository của chúng tôi, và khi được thực thi, nó hiển thị thông điệp sau:

```
$ cy-ipk
usage:
       cy-ipk find <name> [<name> ...]
       cy-ipk recipe <name> [<name> ...]
       cy-ipk depends <name> [<name> ...]
       cy-ipk inspect|get-info <file.ipk>
```

Khi chỉ định subcommand `find`, chúng ta chỉ đơn giản gọi công cụ `find` trên `BUILDDIR`, một environment variable trỏ tới build directory hiện tại:

```
find)
        info "searching in $BUILDDIR..."
        cd $BUILDDIR
        shift
        for n in $@ ; do
                find tmp/deploy/ipk/ -name "${n}*"
        done
        exit 0
        ;;
```

Ví dụ, các package `devmem2` đã tạo trước đó có thể được tìm thấy bằng lệnh dưới đây:

```
$ cy-ipk find devmem2
cy-ipk: searching in /home/giometti/yocto/imx-yocto-bsp/imx8mp-build...
tmp/deploy/ipk/armv8a/devmem2-dbg_2.0-r0_armv8a.ipk
tmp/deploy/ipk/armv8a/devmem2-dev_2.0-r0_armv8a.ipk
tmp/deploy/ipk/armv8a/devmem2_2.0-r0_armv8a.ipk
tmp/deploy/ipk/armv8a/devmem2-src_2.0-r0_armv8a.ipk
```

Subcommand `recipe` được dùng để tìm recipe cung cấp package đầu vào. Ví dụ, package `devmem2` được cung cấp bởi recipe cùng tên:

```
$ cy-ipk recipe devmem2
package devmem2 is provided by: devmem2
```

Nhưng, như chúng ta sẽ thấy trong các chương tiếp theo, package `python3-debugger` được cung cấp bởi recipe `python3`, như dưới đây:

```
$ cy-ipk recipe python3-debugger
package python3-debugger is provided by: python3
```

> Nhớ lại lệnh `bitbake-layers show-recipes` `recipename` được trình bày trong Mục 4.2, bạn đọc có thể thấy rằng nếu thực thi
>
> ```
> $ bitbake-layers show-recipes python3-debugger
> ```
>
> chúng ta không nhận được output hợp lệ nào, còn nếu thực thi lệnh sau, chúng ta sẽ biết recipe `python` cũng nằm ở đâu:
>
> ```
> $ bitbake-layers show-recipes python3
> ...
> === Matching recipes: ===
> python3:
>   meta                 3.10.7
> ```

Phần cốt lõi của subcommand này được trình bày dưới đây:

```
recipe)
    shift
    for n in $@ ; do
        echo -n "package $n is provided by: "
        oe-pkgdata-util lookup-recipe $n
    done
    exit 0
    ;;
```

Và chúng ta có thể thấy mẹo ở đây là dùng lệnh `oe-pkgdata-util lookup-recipe`.

Một thông tin hữu ích khác là những package nào mà một recipe phụ thuộc vào; ví dụ, bằng lệnh tiếp theo, chúng ta liệt kê mọi phụ thuộc package của package có tên `python3-debugger`:

```
$ cy-ipk depends python3-debugger
package python3-debugger depends on: python3-core python3-pprint python
3-shell python3-stringold
```

Một lần nữa, chúng ta kết hợp `oe-pkgdata-util list-pkgs` và `oe-pkgdata-util read-value RDEPENDS` để giải quyết vấn đề:

```
depends)
    shift
    for n in $@ ; do
        if ! oe-pkgdata-util list-pkgs $n 2>/dev/null 1>&2 ; then
            warn "cannot find package $n!"
            continue
        fi
        echo -n "package $n depends on: "
        oe-pkgdata-util read-value RDEPENDS $n
    done
    exit 0
    ;;
```

Lệnh thứ nhất được dùng để kiểm tra dữ liệu đầu vào là tên package hợp lệ, còn lệnh thứ hai được dùng để đọc nội dung `RDEPENDS` của một package mong muốn.

Bây giờ, hai subcommand cuối cùng là `inspect` và `get-info`. Subcommand thứ nhất có thể được dùng để xem bên trong một file `.ipk` có gì, như dưới đây:

```
$ cy-ipk inspect tmp/deploy/ipk/armv8a/devmem2_2.0-r0_armv8a.ipk
drwxr-xr-x root/root         0 2022-05-30 16:07 ./usr/
drwxr-xr-x root/root         0 2022-05-30 16:07 ./usr/bin/
-rwxr-xr-x root/root     10208 2022-05-30 16:07 ./usr/bin/devmem2
```

còn khi dùng subcommand thứ hai, chúng ta có thể đọc thông tin IPKG:

```
$ cy-ipk get-info tmp/deploy/ipk/armv8a/devmem2_2.0-r0_armv8a.ipk
Package: devmem2
Version: 2.0-r0
Description: Program to read/write from/to any location in memory
 Program to read/write from/to any location in memory.
Section: base
Priority: optional
Maintainer: NXP <lauren.post@nxp.com>
License: GPL-2.0-or-later
Architecture: armv8a
OE: devmem2
Depends: libc6 (>= 2.35)
Source: devmem2_2.0.bb
```

Lưu ý rằng cả hai subcommand đều cần một file (chứ không chỉ một tên package); lý do là chúng dùng lệnh `dpkg` để làm nhiệm vụ của mình, như dưới đây:

```
inspect)
    dpkg -c $BUILDDIR/$name
    exit 0
    ;;

get-info)
    dpkg -f $BUILDDIR/$name
    exit 0
    ;;
```

Giờ bạn đọc hẳn đã rõ rằng định dạng IPKG chỉ là một định dạng DEB-like (đơn giản hóa), và nó có thể được quản lý bằng tiện ích `dpkg`. Nếu xem usage message của `dpkg`, chúng ta thấy rằng option argument `-c` được dùng để lấy danh sách file của DEB (và IPKG), còn `-f` được dùng để lấy dữ liệu thông tin của package:

```
$ dpkg --help
...
Use dpkg with -b, --build, -c, --contents, -e, --control, -I, --info,
  -f, --field, -x, --extract, -X, --vextract, --ctrl-tarfile,
  --fsys-tarfile
on archives (type dpkg-deb --help).
...
```

Các option argument này sau đó được dùng trong tiện ích của chúng ta để lấy thông tin cần thiết từ một file `.ipk`.

### 7.4.3 Xem xét image (Inspecting Images)

Về việc xem xét Yocto image cuối cùng, chúng ta có thể cung cấp công cụ `cy-image`:

```
$ cy-image
usage:
       cy-image find-path <image> <pathname> [<pathname> ...]
       cy-image chk-pkg <image> <package> [<package> ...]
```

Subcommand thứ nhất có thể được dùng để tìm package nào cung cấp một đường dẫn mong muốn. Ví dụ, nếu muốn biết những package nào cung cấp các file `/etc/fstab`, `/var/lost.log`, `/usr/bin/vi` và `/bin/zcat`, chúng ta có thể dùng lệnh dưới đây:

```
$ cy-image find-path engicam-evaluation-image-mx8 /etc/fstab \
                             /var/lost.log /bin/vi /bin/zcat
cy-image: searching in /home/giometti/yocto/imx-yocto-bsp/imx8mp-build/
tmp/work/imx8mp_icore-poky-linux/engicam-evaluation-image-mx8/1.0-r0/ro
otfs...
pathname /etc/fstab is provided by: base-files
pathname /var/lost.log is provided by: not found
pathname /bin/vi is provided by: busybox [symlink: /bin/busybox.nosuid]
pathname /bin/zcat is provided by: gzip [symlink: /bin/zcat.gzip]
```

Subcommand được triển khai như dưới đây:

```
find-path)
    # Read BitBake variables
    vars=$(cy-vars 'IMAGE_ROOTFS' $name)
    img_rootfs=$(get IMAGE_ROOTFS $vars)

    # Find packages
    [ -d $img_rootfs ] || \
        fatal "rootfs image directory $img_rootfs doesn't exist!" \
            "Please generate it with 'bitbake $name' and then rerun"
    info "searching in $img_rootfs..."
    for p in $@ ; do
        # Resolve any symlinks
        real_path=$(readlink ${img_rootfs}$p || true)
        [ -z "$real_path" ] && real_path=$p
        echo -n "pathname $p is provided by: "
        if n=$(oe-pkgdata-util find-path $real_path 2>&1) ; then
             good ${n%%:*} $([ "$real_path" != "$p" ] && echo " [symlink
: $real_path]")
        else
            bad not found
        fi
    done
    exit 0
    ;;
```

Bạn đọc nên lưu ý ở đây rằng chúng ta không thể chỉ dùng lệnh `oe-pkgdata-util find-path`, vì nó không thể phân giải symbolic link. Thật vậy, các đường dẫn `/bin/vi` và `/bin/zcat` đều là symbolic link, lần lượt tới các file `/bin/busybox.nosuid` và `/bin/zcat.gzip`, và nếu truyền chúng cho `oe-` `pkgdata-util` thay vì các file mà chúng trỏ tới, chúng ta sẽ không nhận được gì:

```
$ oe-pkgdata-util find-path /bin/vi
ERROR: Unable to find any package producing path /bin/vi
$ oe-pkgdata-util find-path /bin/zcat
ERROR: Unable to find any package producing path /bin/zcat
```

Đó là lý do chúng ta phải phân giải symbolic link trước rồi mới truyền các file thật cho lệnh `oe-pkgdata-util find-path`.

Chúng ta có thể nhận được error message sau:

```
$ cy-image find-path engicam-evaluation-image-mx8 /etc/fstab \
                             /var/lost.log /bin/vi /bin/zcat
cy-image: rootfs image directory /home/giometti/yocto/imx-yocto-bsp/imx
8mp-build/tmp/work/imx8mp_icore-poky-linux/engicam-evaluation-image-mx8
/1.0-r0/rootfs doesn't exist! Please generate it with 'bitbake engicam-
evaluation-image-mx8' and then rerun
```

Trong trường hợp này, chúng ta chỉ cần làm những gì chính error message gợi ý.

Mặt khác, nếu phải kiểm tra xem một hoặc nhiều package (được cung cấp trên command line) có mặt trong một image hay không, chúng ta có thể dùng subcommand `chk-pkg` như trong ví dụ sau:

```
$ cy-image chk-pkg engicam-evaluation-image-mx8 devmem2 \
                                  python3-debugger python3-shell
cy-image: searching in /home/develop/Projects-OLD/packt/Customizing_Yoc
to/yocto/imx-yocto-bsp/imx8mp-build...
package devmem2 is present
package python3-debugger is not present
package python3-shell is present
```

Subcommand được triển khai như dưới đây:

```
chk-pkg)
        # Read BitBake variables
        vars=$(cy-vars 'MACHINE\|IMAGE_LINK_NAME' $name)
        machine=$(get MACHINE $vars)
        link_name=$(get IMAGE_LINK_NAME $vars)

        # Compose manifest pathname
        man_img="tmp/deploy/images/$machine/${link_name}.manifest"
        [ -f $BUILDDIR/$man_img ] || \
                fatal "manifest file $man_img doesn't exist!" \
                        "Please generate it with 'bitbake $name' and
 then rerun"
        info "searching in $BUILDDIR..."

        for p in $@ ; do
                echo -n "package $p is "
                if grep -q $p $BUILDDIR/$man_img ; then
                        good present
                else
                        bad not present
                fi
        done
        exit 0
        ;;
```

Để làm nhiệm vụ của mình, subcommand dùng manifest file được tạo cho mỗi Yocto image. Mỗi lần chúng ta yêu cầu Yocto build system tạo một image, nó cũng tạo manifest file này, file chứa mọi package đã cài cùng một số thông tin kèm theo, như dưới đây:

```
$ cat /home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/deploy/images
/imx8mp-icore/engicam-evaluation-image-mx8-imx8mp-icore.manifest
acl armv8a 2.3.1-r0
acl-dbg armv8a 2.3.1-r0
acl-dev armv8a 2.3.1-r0
adwaita-icon-theme-symbolic all 41.0-r0
alsa-conf armv8a-mx8mp 1.2.6.1-r0
alsa-plugins-dbg armv8a 1.2.6-r0
alsa-plugins-pulseaudio-conf armv8a 1.2.6-r0
alsa-state imx8mp_icore 0.2.0-r5
alsa-state-dbg imx8mp_icore 0.2.0-r5
alsa-states imx8mp_icore 0.2.0-r5
alsa-tools armv8a 1.2.5-r0
alsa-tools-dbg armv8a 1.2.5-r0
...
```

> Đây là file được biến `IMAGE_MANIFEST` trình bày trong Mục 6.5.2 tham chiếu tới.

Nếu một package đã được cài trong image, thì nó được liệt kê ở đây cùng machine tương thích và bản phát hành. Ví dụ, package `alsa-state` bản phát hành `0.2.0-r5` được cài, và nó chỉ dành cho machine `imx8mp_icore`, còn package `acl` dành cho các machine `armv8a` (tương thích với `imx8mp_icore`), và package `adwaita-icon-theme-symbolic` tương thích với mọi machine.

Vì vậy, khi đã lấy được manifest file của một image, chúng ta chỉ cần kiểm tra xem tên một package có (hay không) trong danh sách.

Ngay cả với subcommand này, chúng ta cũng có thể nhận được error message như dưới đây:

```
$ cy-image chk-pkg engicam-evaluation-image-mx8 devmem2 \
                                  python3-debugger python3-shell
cy-image: manifest file tmp/deploy/images/imx8mp-icore/engicam-evaluati
on-image-mx8-imx8mp-icore.manifest doesn't exist! Please generate it with
'bitbake engicam-evaluation-image-mx8' and then rerun
```

Nếu vậy, như đã làm trước đó, chúng ta chỉ cần làm theo gợi ý trong thông điệp và chạy `'bitbake engicam-evaluation-image-mx8'` để tạo manifest file.

### 7.4.4 Xem xét các Git repository (Inspecting the Git Repositories)

Vì chúng ta sẽ tùy biến một Yocto image, chúng ta phải thận trọng theo dõi mọi thứ mình thay đổi, và dùng Git là Right-Thing. Tuy nhiên, chúng ta có nhiều Git repository cần theo dõi, và làm việc đó bằng tay có thể rủi ro; đó là lý do chúng tôi đã phát triển tiện ích `cy-gitchk`.

Tiện ích này rất khéo; chúng ta chỉ cần thực thi nó như dưới đây:

```
$ cy-gitchk
cy-gitchk: ====== base ======
cy-gitchk: ====== meta-browser ======
cy-gitchk: ====== meta-clang ======
cy-gitchk: ====== meta-cy ======
cy-gitchk: ====== meta-engicam-nxp ======
cy-gitchk: ====== meta-freescale ======
cy-gitchk: ====== meta-freescale-3rdparty ======
cy-gitchk: ====== meta-freescale-distro ======
cy-gitchk: ====== meta-imx ======
cy-gitchk: ====== meta-nxp-demo-experience ======
cy-gitchk: ====== meta-openembedded ======
cy-gitchk: ====== meta-qt6 ======
cy-gitchk: ====== meta-timesys ======
cy-gitchk: ====== meta-virtualization ======
cy-gitchk: ====== poky ======
```

Nếu nó chỉ trả về thông điệp trên, điều đó có nghĩa là mọi thứ đều đã cập nhật trong mỗi repository. Ngoài ra, chúng ta có thể lấy danh sách mọi repository trong bản phân phối Yocto để kiểm tra rằng tính năng tự phát hiện hoạt động đúng.

Mặt khác, chúng ta đã thực hiện một số sửa đổi cho Yocto Project của mình, vì vậy nên mong đợi một output khác! Ví dụ, vào thời điểm viết sách, output của `cy-gitchk` trông như dưới đây:

```
$ cy-gitchk
cy-gitchk: ====== base ======
 M setup-environment
cy-gitchk: ====== meta-browser ======
cy-gitchk: ====== meta-clang ======
cy-gitchk: ====== meta-cy ======
AM scripts/cy-test
?? scripts/cy-gitchk
?? scripts/cy-image
?? scripts/cy-image.OK
?? scripts/cy-ipk
?? scripts/cy-misc.inc
?? scripts/cy-vars
cy-gitchk: ====== meta-engicam-nxp ======
 M conf/machine/imx8mp-icore.conf
?? classes/
?? recipes-example/
...
```

> Bạn đọc nên lưu ý rằng output này có thể khác tùy theo cách layer `meta-cy` (và có thể cả các layer khác) đã được thay đổi trong quá trình đọc sách.

Trong output trên, chúng ta có thể thấy trong `base`, file `setup-environment` đã bị sửa; đó là khi chúng ta thêm sửa đổi ở Mục 7.4. Hơn nữa, chúng ta thấy `imx8mp-icore.conf` cũng đã bị sửa, đó là khi chúng ta thực hiện bản build đầu tiên và thay đổi cấu hình machine mặc định ở Mục 2.3 để đặt đúng memory layout.

Về layer tùy biến `meta-cy`, chúng ta có thể thấy file `cy-test` hiện đang được Git theo dõi nhưng đã bị thay đổi, còn các file khác được đánh dấu `??` thì Git chưa biết.

Bạn đọc có thể hiểu rằng, bằng cách này, họ có thể xem nhanh và đáng tin cậy trạng thái của mọi Git repository. Tuy nhiên, một số người có thể nhận thấy tính năng này thực sự giống tính năng chúng ta đã thấy ở Mục 2.6 khi dùng lệnh `repo`. Tuy nhiên, họ nên tính đến những gì chúng ta đã nói ở đó, tức là `repo` sẽ hiển thị các sửa đổi trong mọi layer có trong manifest, còn layer của Engicam thì không có ở đó! Vì vậy, đây là một giải pháp tốt hơn, hoạt động trong mọi điều kiện.

## 7.5 Tóm tắt (Summary)

Trong chương này, chúng ta đã thấy cách tạo một meta layer tùy biến, nơi có thể đặt mọi tùy biến của mình. Và chúng ta đã bắt đầu thêm một số thông tin vào nó, đặc biệt là các tiện ích mới có thể dùng trong các chương tiếp theo của sách để làm các task lặp đi lặp lại một cách đáng tin cậy.

Tuy nhiên, mục tiêu của chúng ta không chỉ là tạo một layer mới hay chỉ thêm recipe mới vào đó (điều này dù sao cũng được giải thích từ Chương 9 trở đi), mà còn là quản lý các machine mới.

Thật vậy, compile code cho một development kit có thể hữu ích trong giai đoạn phát triển ban đầu, nhưng sớm hay muộn, chúng ta sẽ cần thử code của mình trên machine tùy biến được phát triển từ development kit. Vì vậy hãy chuyển sang chương tiếp theo để xem cách thực hiện bước quan trọng này.

