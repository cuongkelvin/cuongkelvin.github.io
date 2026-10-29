# Giới thiệu (Introduction)

Máy tính embedded đã trở nên rất phức tạp trong vài năm gần đây, vì chúng được giao giải quyết rất nhiều bài toán phức tạp mà trước đây con người tự làm. Sự phức tạp này liên quan đến cả hardware lẫn software, và các hệ thống embedded hiện nay cần những OS rất phức tạp để hoạt động như mong đợi.

Yocto OS hiện là chuẩn trên thực tế cho phần lớn các hệ thống embedded trên khắp thế giới. Điều này là nhờ tính bền vững, khả năng cấu hình cao, số lượng software package sẵn có lớn và khả năng hỗ trợ nhiều nền tảng hardware bằng các cơ chế chung, nhờ vậy developer có thể triển khai hệ thống của mình với ít công sức, ngay cả trên những máy khác nhau.

Cuốn sách này trình bày cách Yocto build system (tức là cỗ máy của Yocto Project để build binary image từ source) hoạt động, và cách developer có thể dễ dàng (và nhanh chóng) đi từ các bản phân phối Yocto demo mà các hãng sản xuất chip (silicon vendor) cung cấp cho development kit của họ đến sản phẩm cuối cùng của mình. Sách đồng hành cùng developer từ bản phân phối Yocto demo đến bản phân phối Yocto cuối cùng bằng cách giải thích build system hoạt động như thế nào và thực hiện các ví dụ thực tế.

## Nội dung cuốn sách (What This Book Covers)

Cuốn sách này nói về Yocto Project, nhưng nó không phải là thêm một cuốn sách nữa nói về Yocto Project. Thật vậy, mục tiêu chính của sách không phải là giải thích Yocto Project hoạt động thế nào (dù sao vẫn phải giải thích một số điều, và việc này được làm trong phần thứ hai của sách), mà thay vào đó sách nói về cách developer có thể thay đổi một bản phân phối Yocto đã hoạt động (thường được phát triển cho development kit của một silicon vendor) để hỗ trợ hệ thống embedded của họ, vốn (thường) được phát triển dựa trên chính những development kit đó!

Vì vậy, cuốn sách có phần thứ nhất, trong đó tôi giới thiệu ngắn gọn một số thuật ngữ embedded thông dụng và trình bày bộ kit embedded mà tôi sẽ dùng trong sách để thực sự kiểm thử code ví dụ của mình trên hardware thật (tôi biết rõ rằng mình không thể bao quát mọi cấu hình hardware mà bạn đọc có thể làm việc cùng; vì thế tôi đã cố viết mọi ví dụ ở dạng tổng quát nhất có thể, để ngay cả khi bạn có cấu hình hardware khác, hy vọng bạn vẫn có thể dùng các ví dụ này trên hệ thống của mình).

Trong phần thứ nhất này, tôi cũng giải thích cách lấy Yocto source và cách thiết lập một cấu hình host machine khả dĩ để có thể build lại một Yocto image từ đầu.

Dưới đây là phần giới thiệu ngắn về từng chương thuộc phần thứ nhất này:

- Chương 1 – Setting Up the Building Environment bắt đầu bằng việc giới thiệu một số thuật ngữ thông dụng của thế giới lập trình embedded, sau đó trình bày development kit được dùng trong sách: EDIMM 2.0 STARTER KIT của Engicam. Tiếp theo, sau phần giới thiệu ngắn về board, chương thiết lập cả hai kênh giao tiếp serial và Ethernet để có thể đưa lệnh và code lên hardware thật. Cuối cùng, chương giải thích cách cài đặt một hệ thống phát triển hoàn chỉnh trên một host system GNU/Linux-based (trên cả máy thật lẫn máy giả lập).

- Chương 2 – Installing the Sources trình bày cách tải Yocto source và cách thiết lập một build environment hoạt động đầy đủ. Sau đó chương trình bày cách build một Yocto image từ đầu và cách cài đặt nó lên bộ kit embedded của chúng ta. Ở cuối chương có một số ghi chú về cách sửa kết nối mạng trên image mới, cùng một số ghi chú về cách cập nhật code.

Tiếp theo là phần thứ hai, có thể xem là phần lý thuyết của cuốn sách. Thật vậy, trong phần này, tôi sẽ giải thích một số lý thuyết về cách Yocto build system hoạt động và cách developer có thể dùng các công cụ sẵn có để quản lý source một cách đúng đắn cho phù hợp với nhu cầu của mình. Đây không phải là một cuốn manual đầy đủ (đã có một manual rất well-written và đầy đủ trên Internet tại `https://docs.yoctoproject.org/ref-manual/index.html`, nơi bạn đọc có thể tìm thấy bất cứ phần lý thuyết nào không được đề cập ở đây), nhưng tôi trình bày và giải thích những khái niệm mà chúng ta sẽ dùng trong sách, để sách có thể được dùng như một tài liệu tham khảo thực hành.

Dưới đây là phần giới thiệu ngắn về từng chương của phần lý thuyết này:

- Chương 3 – Yocto Project Basics giới thiệu những thông tin cơ bản về Yocto Project mà mọi Yocto developer nên biết để hiểu rõ hơn cách nó hoạt động. Đầu tiên, tôi sẽ giải thích Yocto Project là gì và các khái niệm cơ bản của nó. Tiếp theo, tôi sẽ trình bày các thành phần chính của Yocto, bắt đầu từ các file cấu hình chính và những biến mà chúng chứa.

- Chương 4 – Yocto Tools giới thiệu những lệnh Yocto được dùng nhiều nhất như BitBake, recipetool, devtool, v.v. Tất cả các lệnh này sau đó được dùng trong các chương tiếp theo để tạo hoặc quản lý recipe.

- Chương 5 – BitBake Internals trình bày cách thành phần chính của Yocto Project, có tên là BitBake, hoạt động, cách nó dùng biến và cách nó thực thi các task. BitBake có cú pháp riêng, có nhiều điểm tương đồng với một số ngôn ngữ lập trình khác. Nhưng nó cũng cung cấp một số tính năng độc đáo, và chúng ta cần hiểu BitBake diễn giải những đối tượng này như thế nào để có thể viết recipe hiệu quả và/hoặc quản lý bản phân phối Yocto.

- Chương 6 – Recipes trình bày cách viết recipe và cách recipe hoạt động, ví dụ như những biến và task nào chúng ta có thể đặt vào recipe và cách dùng chúng để tạo package hoặc root filesystem.

Cuối cùng là phần thứ ba, có thể xem là phần thực hành của cuốn sách. Thật vậy, ở đây tôi sẽ trình bày cách thực sự viết hoặc sửa recipe, hoặc cách định nghĩa một layer hay machine mới, và tôi sẽ trình bày một số best practice và cấu hình khả dĩ mà developer có thể dùng để cải thiện dự án của mình.

Dưới đây là phần giới thiệu ngắn về từng chương của phần thực hành này:

- Chương 7 – Generating and Managing Layers giải thích cách thêm một layer mới vào một Yocto build system có sẵn. Bằng cách này, developer có thể thêm các tùy biến và recipe của mình vào một layer riêng, nơi họ có toàn quyền kiểm soát hệ thống Yocto mới được phát triển.

- Chương 8 – Adding New Hardware trình bày cách tạo machine mới dựa trên những machine đã được định nghĩa, theo cách giảm thời gian phát triển cần thiết để định nghĩa hardware tùy biến mới. Các kỹ thuật được giải thích trong chương này sẽ rút ngắn time to market của hardware mới!

- Chương 9 – C Application Recipes tập trung vào recipe cho các chương trình viết bằng C (hoặc C++). Chương trình bày nhiều ví dụ về user space và thư viện, cùng với một dự án kernel space.

- Chương 10 – Python Application Recipes giải thích cách tạo recipe cho các dự án Python-based bằng cách đề xuất hai cách khác nhau để làm việc đó (qua setuptools3 hoặc qua pypi).

- Chương 11 – Miscellaneous Recipes đề cập đến nhiều vấn đề thường gặp trong embedded computing mà không thuộc về hai chương trước, ví dụ như cách lấy bản phát hành mới hơn của một chương trình, cách thêm một system service, hoặc cách triển khai native package (tức là cho host machine).

- Chương 12 – Image Recipes giải thích cách viết recipe để tạo root filesystem image, tức là cách gom nhiều package recipe lại với nhau để có một root filesystem chạy được cho các embedded machine của chúng ta.

- Chương 13 – Optimizations and Best Practices nêu một số gợi ý cuối cùng về cách cấu hình đúng Yocto build system của chúng ta để lưu lại toàn bộ source hoặc (ví dụ) về khả năng build dễ dàng một bản phát hành development hoặc production, v.v.

## Những gì bạn cần cho cuốn sách này (What You Need for This Book)

Sau đây là các điều kiện tiên quyết để học hiệu quả.

### Yêu cầu về software (Software Prerequisite)

Về software, bạn nên có một số hiểu biết về một text editor không đồ họa như `vi` hoặc `nano`. Dù giao diện đồ họa có thể được dùng bằng cách kết nối trực tiếp màn hình LCD, bàn phím và chuột vào kit embedded. Trong sách này, chúng ta giả định rằng bạn có thể thực hiện những sửa đổi nhỏ cho các file văn bản chỉ bằng một text editor.

Máy host, tức là máy tính bạn sẽ dùng để cross-compile code và/hoặc để quản lý các hệ thống embedded của mình, được giả định là chạy một bản phân phối GNU/Linux-based. Máy host PC của tôi chạy Ubuntu 22.04, nhưng bạn cũng có thể dùng một bản Ubuntu Long-Term Support (LTS) mới hơn hoặc một hệ thống Debian-based với ít sửa đổi. Ngoài ra, bạn có thể dùng một bản phân phối GNU/Linux khác nhưng cần bỏ thêm chút công sức, chủ yếu liên quan đến việc cài đặt các công cụ cần thiết, phụ thuộc thư viện và quản lý package.

Các hệ thống khác như Windows, macOS hoặc tương tự không được đề cập trong sách này.

Bạn cần biết C/C++ compiler hoạt động thế nào và cách quản lý một Makefile. Cuốn sách cũng sẽ trình bày một số kỹ thuật lập trình kernel, nhưng không nên xem chúng là một khóa học lập trình kernel. Bạn cần một cuốn sách phù hợp cho chủ đề đó! Tuy nhiên, mỗi ví dụ đều được giải thích kỹ, và bạn sẽ thấy nhiều tài liệu tham khảo được gợi ý.

Lưu ý cuối cùng, tôi giả định rằng bạn biết cách kết nối một board GNU/Linux-based với Internet để tải về một package hoặc một file bất kỳ.

### Yêu cầu về hardware (Hardware Prerequisite)

Trong sách này, toàn bộ code được phát triển và kiểm thử trên EDIMM 2.0 STARTER KIT do Engicam phát triển, nhưng bạn có thể dùng một kit embedded khác vì code có tính portable. Code sẽ compile được cho các hệ thống khác mà không gặp vấn đề gì. Tuy nhiên, có thể cần một số sửa đổi nhỏ để đưa đúng binary image lên các hệ thống này và khi tạo machine mới dựa trên một machine có sẵn.

## Quy ước (Conventions)

Trong sách này, bạn sẽ thấy nhiều kiểu trình bày chữ dùng để phân biệt các loại thông tin khác nhau. Dưới đây là một số ví dụ về các kiểu này và giải thích ý nghĩa của chúng.

### Output dài, code và command line (Long Outputs, Codes, and Command Lines)

Khi cần trình bày một phần của output dài (hoặc nội dung file), tôi có thể bỏ bớt phần chữ non-relevant bằng cách thay nó bằng ba dấu chấm, giữ nguyên phần nội dung quan trọng, như trong ví dụ dưới đây:

```
$ cat very_long_file.txt
Line 1
Line 2
Line 3
...
Line 999
Line 1000
...
```

Trong output trên, các dòng sau `Line 3` cho đến `Line 999` đã bị bỏ đi, cũng như các dòng sau `Line 1000`.

Từ thuộc về code trong văn bản, tên thư mục, tên file, phần mở rộng của file, đường dẫn, URL giả và dữ liệu người dùng nhập được trình bày như sau: “Để lấy các kernel message ở trên, chúng ta có thể dùng cả hai lệnh `dmesg` và `tail -f /var/log/kern.log`.”

Một khối code được trình bày như sau:

```
#include <stdio.h>
int main(int argc, char *argv[])
{
        printf("Hello World!\n");
        return 0;
}
```

trong đó phần thụt lề có thể gồm tám hoặc bốn dấu cách để dễ đọc nhất.

Mọi command-line input hoặc output được đưa ra trên máy host của tôi với tư cách người dùng non-privileged được viết như sau:

```
$ cat /etc/lsb-release
```

Khi cần đưa ra một lệnh với tư cách người dùng có đặc quyền (root) trên máy host, command-line input hoặc output được viết như sau:

```
# systemctl restart schroot
```

Bạn nên lưu ý rằng mọi lệnh cần đặc quyền cũng có thể được người dùng thông thường thực thi bằng lệnh `sudo` theo dạng

```
$ sudo <command>
```

Vì vậy lệnh trên có thể được người dùng thông thường thực thi như sau

```
$ sudo systemctl restart schroot
```

Cũng lưu ý rằng do giới hạn chỗ trong sách, bạn có thể gặp những command line rất dài như sau:

```
$ sudo apt install man python-is-python3 wget git gpg bzip2 chrpath cpio
diffstat file gcc g++ gawk gcc make zstd lz4 xz-utils python3-distutils
```

Tuy nhiên, nói chung, để dễ đọc hơn, tôi sẽ ngắt command line như dưới đây:

```
$ sudo apt install man python-is-python3 wget git gpg bzip2 \
  chrpath cpio diffstat file gcc g++ gawk gcc make zstd lz4 \
  xz-utils python3-distutils
```

Tuy nhiên, trong một số trường hợp đặc biệt, bạn có thể gặp những dòng output bị ngắt như sau:

```
$ ssh root@192.168.32.132
The authenticity of host '192.168.32.132 (192.168.32.132)' can't be esta
blished.
RSA key fingerprint is SHA256:EJPYPkw+lcPowlZnJosrrJMLO8QKCekVzJo62FBdLs
g.
...
```

Đáng tiếc là những dòng này không thể trình bày dễ dàng trong sách in, vì vậy bạn nên xem chúng như một dòng duy nhất.

### Usage message của các công cụ Yocto (Yocto Tools’ Usage Messages)

Với các công cụ Yocto, tôi thường thích trình bày usage message của công cụ, có thể được hiển thị bằng option argument `-h` (hoặc `--help`), như dưới đây:

```
$ devtool -h
NOTE: Starting bitbake server...
usage: devtool [--basepath BASEPATH] [--bbpath BBPATH] [-d] [-q]
               [--color COLOR] [-h]
               <subcommand> ...

OpenEmbedded development tool

options:
  --basepath BASEPATH   Base directory of SDK / build directory
  --bbpath BBPATH       Explicitly specify the BBPATH, rather than
getting it from the metadata
  -d, --debug           Enable debug output
  -q, --quiet           Print only errors
  --color COLOR         Colorize output (where COLOR is auto, always,
                        never)
  -h, --help            show this help message and exit

subcommands:
  Beginning work on a recipe:
    add                   Add a new recipe
    modify                Modify the source for an existing recipe
...
```

Tuy nhiên, hầu hết các công cụ có nhiều subcommand (như trên), vì vậy để lấy usage message riêng cho các subcommand này, bạn cũng phải gọi chúng với option argument `-h` (hoặc `--help`):

```
$ devtool add -h
NOTE: Starting bitbake server...
usage: devtool add [-h] [--same-dir | --no-same-dir] [--fetch URI]
          [--npm-dev] [--version VERSION] [--no-git]
          [--srcrev SRCREV | --autorev] [--srcbranch SRCBRANCH]
          [--binary] [--also-native] [--src-subdir SUBDIR]
          [--mirrors] [--provides PROVIDES]
          [recipename] [srctree] [fetchuri]
Adds a new recipe to the workspace to build a specified source tree. Can
optionally fetch a remote URI and unpack it to create the source tree.

arguments:
  recipename            Name for new recipe to add (just name – no
                        version, path or extension). If not specified,
                        will attempt to auto-detect it.
  srctree               Path to external source tree. If not specified, a
                        subdirectory of
                        /home/giometti/yocto/imx-yocto-bsp/imx8mp-build/
                        workspace/sources will be used.
  fetchuri              Fetch the specified URI and extract it to create
                        the source tree

options:
  -h, --help            show this help message and exit
  --same-dir, -s        Build in same directory as source
...
```

Tuy nhiên, tôi sẽ giải thích tất cả những khía cạnh này khi chúng được dùng trong sách.

### Thay đổi cú pháp Yocto qua các bản phát hành (Yocto Syntax Changes Across Releases)

Yocto Project có nhiều bản phát hành, và phần lớn các bản phát hành trước đây vẫn đang được dùng tích cực vào thời điểm viết sách này (trong thế giới embedded, thời gian trôi chậm hơn so với thế giới thực), vì vậy bạn nên chú ý đến ghi chú này.

Trước bản phát hành Yocto Project 3.4 (tên mã Honister), và chính xác hơn là trước BitBake 1.52, cú pháp cho `OVERRIDES` (được giải thích chi tiết trong Mục 5.3) dùng ký tự gạch dưới thay cho dấu hai chấm được dùng kể từ bản phát hành Honister. Điều này có nghĩa là một phép gán biến trước đây được viết như dưới đây:

```
SRC_URI_mx8m = "file://somefile"
SRC_URI_append = " file://somefile"
SRC_URI_append_mx8m = " file://somefile2"
```

kể từ bản phát hành Honister trở thành

```
SRC_URI:mx8m = "file://somefile"
SRC_URI:append = " file://somefile"
SRC_URI:append:mx8m = " file://somefile2"
```

vì `mx8m`, `append` và dạng kết hợp `append:mx8m` đều là thứ mà Yocto developer gọi là override.

Điều này áp dụng cho mọi cách dùng cú pháp override, như dưới đây:

```
SRC_URI_remove_mx8m = "file://somefile3"
SRC_URI_prepend_mx8m = "file://somefile4 "
FILES_${PN}-tools = "${bindir}/someprog"
IMAGE_CMD_tar = "tar"
SRCREV_pn-bash = "somerev"
BB_TASK_NICE_LEVEL_task-compile = '0'
```

thì giờ sẽ trở thành

```
SRC_URI:remove:mx8m = "file://somefile3"
SRC_URI:prepend:mx8m = "file://somefile4 "
FILES:${PN}-tools = "${bindir}/someprog"
IMAGE_CMD:tar = "tar"
SRCREV:pn-bash = "somerev"
BB_TASK_NICE_LEVEL:task-compile = '0'
```

Tuy nhiên, vì vẫn còn rất nhiều code và tài liệu cũ tồn tại khắp nơi, bạn vẫn có thể gặp nhiều code và tài liệu dùng `_append`, `_prepend`, `_remove` và các cú pháp override cũ khác. Nhưng giờ bạn đã được cảnh báo về điều này, và bạn có thể dễ dàng chuyển từ cú pháp này sang cú pháp kia để mọi thứ hoạt động đúng như mong đợi.

### Sửa đổi file (File Modifications)

Khi sửa một file văn bản, tôi sẽ dùng định dạng unified context diff, vì đây là cách rất hiệu quả và gọn để biểu diễn một sửa đổi văn bản. Có thể có được định dạng này bằng lệnh `diff` với option argument `-u` hoặc bằng lệnh `git diff`.

Lấy một ví dụ đơn giản, hãy xét đoạn văn bản sau là `file1.txt`:

```
This is the first line
This is the second line
This is the third line
...
This is the last line
```

Giả sử chúng ta phải sửa dòng thứ ba, như được làm nổi bật trong đoạn sau:

```
This is the first line
This is the second line
This is the new third line modified by me
...
This is the last line
```

Bạn có thể dễ dàng hiểu rằng mỗi lần lại trình bày toàn bộ file chỉ cho một sửa đổi đơn giản thì khá khó theo dõi và tốn chỗ. Tuy nhiên, bằng định dạng unified context diff, sửa đổi trên có thể được viết như sau:

```
--- a/file1.txt
+++ b/file1.txt
@@ -1,5 +1,5 @@
 This is the first line
 This is the second line
-This is the third line
+This is the new third line modified by me
 ...
 This is the last line
```

Giờ thì sửa đổi đã rõ ràng và được viết ở dạng gọn! Nó bắt đầu bằng một header two-line, trong đó file gốc đứng sau `---` và có tiền tố là chuỗi `a/`, còn file mới đứng sau `+++` và có tiền tố là chuỗi `b/`. Tiếp sau header là một hoặc nhiều change hunk chứa các dòng khác biệt giữa các file. Ví dụ trên chỉ có một hunk, trong đó các dòng không đổi bắt đầu bằng một ký tự dấu cách, các dòng cần thêm bắt đầu bằng ký tự `+`, còn các dòng cần bỏ bắt đầu bằng ký tự `–` (lưu ý rằng output trên không hoàn toàn giống những gì lệnh `diff -u` hoặc `git diff` trả về, nhưng nó vẫn ở định dạng unified context diff).

Ngoài ra, cũng vì lý do chỗ trong sách, hầu hết các patch trong sách đã được giảm thụt lề cho vừa bề rộng trang in; tuy nhiên, chúng vẫn hoàn toàn đọc được ở dạng đúng.

Để xem patch thật, bạn nên tham khảo các file được cung cấp trên GitHub.

### Kết nối serial và mạng (Serial and Network Connections)

Trong sách này, tôi sẽ chủ yếu dùng hai loại kết nối khác nhau để tương tác với kit embedded dùng để chạy các ví dụ: serial console và SSH terminal qua kết nối Ethernet.

Serial console chủ yếu được dùng để quản lý hệ thống từ command line, và nó được dùng nhiều để giám sát hệ thống, đặc biệt là để theo dõi các thông điệp khởi động (booting message).

SSH terminal khá giống serial console, dù không hoàn toàn như nhau (ví dụ, các booting message từ bootloader hoặc các kernel message không tự động xuất hiện trên terminal). Tuy nhiên, nó có thể được dùng giống như serial console để đưa lệnh và để sửa file từ command line.

Trong Mục 1.3, tôi sẽ giải thích chi tiết cách bạn có thể dùng các kết nối này để tương tác với kit embedded của mình từ một host machine Linux-based. Về phía target, dù rõ ràng chúng được nói theo kit embedded của tôi, chúng có thể dễ dàng được áp dụng với chút công sức trên mọi embedded machine chạy Yocto Project.

### Các quy ước khác (Other Conventions)

Thuật ngữ mới và các từ quan trọng được in đậm hoặc in nghiêng. Những chữ bạn thấy trên màn hình, ví dụ trong menu hoặc hộp thoại, xuất hiện trong văn bản giống như chuỗi `Clicking the Next button moves you to the next screen`.

Các cảnh báo hoặc ghi chú quan trọng xuất hiện trong một khung như thế này:

> Các mẹo và thủ thuật xuất hiện như thế này.

