# Chương 5. Bên trong BitBake (BitBake Internals)

Trong chương trước, chúng ta đã xem phần giới thiệu về những công cụ được dùng nhiều nhất (và hữu ích nhất) của Yocto Project, và đã giới thiệu cách dùng lệnh `bitbake`. Giờ là lúc đi sâu tìm hiểu lệnh nền tảng này hoạt động thế nào, nó dùng các biến ra sao và thực thi các task của nó như thế nào.

Thật vậy, mỗi biến hoặc task được định nghĩa trong một file cấu hình hoặc class file, và được BitBake quản lý, đều có cú pháp riêng, có những điểm tương đồng với nhiều ngôn ngữ khác nhưng cũng có một số đặc điểm độc đáo. Vì mục tiêu của sách là học cách tùy biến một Yocto image bằng cách định nghĩa một machine mới, thêm hoặc sửa recipe và các thao tác quan trọng khác trong môi trường Yocto, chúng ta cần hiểu bitbake diễn giải các file này như thế nào.

## 5.1 Quản lý biến (Variable Management)

Như đã thấy trong các chương trước, biến là đối tượng đầu tiên mà mọi Yocto developer nên biết, nhưng một khía cạnh quan trọng khác của biến là cách chúng có thể được gán và thao tác.

Tuy nhiên, để làm vậy, chúng ta cần dễ dàng thực thi một số code BitBake, và để làm điều đó, chúng ta có thể tạo một recipe cơ bản để thực thi các ví dụ. Recipe mới này có thể được đặt trong layer Engicam như dưới đây:

```
$ cd sources/meta-engicam-nxp/recipes-core
$ mkdir cy-test
$ cat > cy-test/cy-test_0.1.bb <<__EOF__
DESCRIPTION = "Recipe created to run simple code"
LICENSE = "MIT"
# Do not change above this line!

do_show_result() {
    bbplain "Hello World!"
}

# Do not change below this line!
do_show_result[nostamp] = "1"
addtask show_result
__EOF__
```

Việc này sẽ tạo một recipe ví dụ chỉ đơn giản hiển thị thông điệp `Hello` `World!`. Nếu nhớ lại những gì đã nói trong chương trước về lệnh `bitbake` (xem Mục 4.1), chúng ta sẽ biết rằng bằng lệnh dưới đây, chúng ta thực thi task `do_show_result` trong recipe target `cy-test`:

```
$ bitbake -c show_result cy-test
...
NOTE: Executing Tasks
Hello World!
NOTE: Tasks Summary: Attempted 1 tasks of which 0 didn't need to be rer
un and all succeeded.
```

Không đi vào chi tiết lúc này, rõ ràng lệnh `bbplain` chỉ in một chuỗi ra standard output, và khi đó chúng ta có thể dùng nó để hiển thị các thông điệp hữu ích để kiểm thử code.

> Về các thiết lập `do_show_result[nostamp] = "1"` và `addtask show_result`, chúng cần thiết (thiết lập sau) để định nghĩa một task mới trong môi trường `bitbake` và (thiết lập trước) để buộc thực thi task mỗi lần chúng ta dùng lệnh `bitbake` để thực thi task nhiều lần.
>
> Các khái niệm này sẽ được giải thích rõ ở phần sau của chương.

Giờ chúng ta đã có một công cụ tuyệt vời để kiểm chứng những gì sẽ giải thích trong các mục tiếp theo!

### 5.1.1 Phép gán cơ bản và expansion (Basic Assignments and Expansion)

Ví dụ sau đặt `VARIABLE` thành `value`. Phép gán này xảy ra ngay khi câu lệnh được parse. Nó được gọi là hard assignment.

```
VARIABLE = "value"
```

Như mong đợi, nếu đưa dấu cách ở đầu hoặc cuối vào phép gán, các dấu cách này được giữ lại:

```
VARIABLE = " value"
VARIABLE = "value "
```

> Bạn đọc nên chú ý tới việc giữ lại ký tự dấu cách này, vì nó được dùng rộng rãi trong các file cấu hình Yocto để chỉ định danh sách file, giá trị, thiết lập cấu hình, v.v.

Như bạn đọc có thể hình dung, đặt `VARIABLE` thành `””` sẽ đặt nó thành chuỗi rỗng, còn đặt biến thành `“ “` (chỉ một ký tự trắng) sẽ đặt nó thành một dấu cách, đây không phải là cùng một thiết lập!

Một điều quan trọng khác cần chỉ ra là chúng ta có thể dùng dấu nháy đơn thay cho dấu nháy kép khi đặt giá trị của biến. Làm như vậy cho phép chúng ta dùng các giá trị chứa ký tự dấu nháy kép:

```
VARIABLE = 'this is a special "value" for VARIABLE'
```

> Người dùng Bourne shell nên chú ý rằng trong cú pháp của BitBake, dấu nháy đơn hoạt động giống hệt dấu nháy kép ở mọi khía cạnh khác, tức là chúng không chặn việc expansion biến.

Để kiểm tra giá trị thực tế của một biến, chúng ta có thể dùng lệnh `bitbake` dưới đây (như đã giới thiệu trong Mục 4.1.2):

```
$ bitbake -e | grep 'ARCH_DEFAULT_KERNELIMAGETYPE='
ARCH_DEFAULT_KERNELIMAGETYPE="zImage"
```

Lệnh này hiển thị giá trị các biến sau khi các file cấu hình đã được parse.

Nếu xem output của lệnh `bitbake -e` ở trên, chúng ta cũng có thể thấy một số biến có tiền tố là từ khóa `export`, như dưới đây:

```
$ bitbake -e | grep 'CC='
export BUILD_CC="gcc "
export CC="aarch64-poky-linux-gcc  -march=armv8-a+crc+crypto -fstack-pr
otector-strong  -O2 -D_FORTIFY_SOURCE=2 -Wformat -Wformat-security -Wer
ror=format-security --sysroot=/home/giometti/yocto/imx-yocto-bsp/imx8mp
-build/tmp/work/armv8a-poky-linux/defaultpkgname/1.0-r0/recipe-sysroot"
```

Các biến này được export vào environment của các task đang chạy; điều này có nghĩa là chúng nhìn thấy được bên trong thân task. Để hiểu rõ cơ chế này hoạt động thế nào, hãy xét ví dụ sau:

```
export VAR1
VAR1 = "value 1"
VAR2 = "value 2"

do_show_result() {
    VAR1="$VAR1 + data"
    bbplain "var1 = $VAR1"
    bbplain "var1 = ${VAR1}"
    bbplain "var2 = $VAR2"
    bbplain "var2 = ${VAR2}"
}
```

> Đoạn code trên có thể được đặt trong meta layer của Engicam cho đến khi chúng ta có meta layer riêng. Vì vậy chúng ta có thể đặt đoạn code dưới đây vào một file tên là `cy-test_0.1.bb` trong thư mục `meta-engicam-` `nxp/recipes-core/cy-test/`, như dưới đây:
>
> ```
> $ cat meta-engicam-nxp/recipes-core/cy-test/cy-test_0.1.bb
> DESCRIPTION = "Recipe created to run simple code"
> LICENSE = "MIT"
> # Do not change above this line!
>
> export VAR1
> VAR1 = "value 1"
> VAR2 = "value 2"
>
> do_show_result() {
>     VAR1="$VAR1 + data"
>     bbplain "var1 = $VAR1"
>     bbplain "var1 = ${VAR1}"
>     bbplain "var2 = $VAR2"
>     bbplain "var2 = ${VAR2}"
> }
>
> # Do not change below this line!
> do_show_result[nostamp] = "1"
> addtask show_result
> ```
>
> Bạn đọc nên thay đổi file recipe trên bằng cách thay đoạn code giữa hai comment `# Do not change above this` `line!` và `# Do not change below this line!`, và giữ nguyên phần code còn lại, như từ khóa `addtask` hoặc variable flag `do_show_result[nostamp]`, vì chúng sẽ được giải thích sau. Hơn nữa, trong các ví dụ sau, vì lý do dung lượng, chúng ta sẽ chỉ trình bày phần code cần đặt vào file recipe chứ không trình bày toàn bộ file nữa.

Nếu thực thi task `do_show_result` như đã giải thích ở trên, chúng ta có output sau:

```
$ bitbake -c show_result cy-test
...
NOTE: Executing Tasks
var1 = value 1 + data
var1 = value 1
var2 =
var2 = value 2
NOTE: Tasks Summary: Attempted 1 tasks of which 0 didn't need to be rerun and
all succeeded.
```

> Bắt đầu từ đây, cũng vì lý do dung lượng, chúng ta sẽ không trình bày lệnh `bitbake -c show_result cy-test` cũng như các thông điệp `NOTE:` nữa, mà chỉ trình bày output của `bbplain`.

Vì chỉ `VAR1` được export (và việc `export VAR1` xuất hiện trước hay sau các phép gán cho `VAR1`, hoặc chúng ta dùng dạng kết hợp như `export VAR1 = "value 1"`, đều không quan trọng), còn `VAR2` thì không, nên dạng `$VAR1` được thay trong thân task bằng giá trị chứa trong biến `VAR1`, còn `$VAR2` cho ra một chuỗi rỗng.

Bạn đọc nên lưu ý kỹ ở đây rằng `bitbake` không expansion `$VAR1` vì nó thiếu cặp ngoặc nhọn (`{}`) bắt buộc; thay vào đó, nó được shell expansion. Thật vậy, chúng ta có thể gán lại nội dung `VAR1` trong task bằng `VAR1="$VAR1 + data"`. Mặt khác, `bitbake` expansion `${VAR1}`; đó là lý do ở dòng đầu tiên chúng ta có chuỗi `value 1 + data`, còn ở dòng thứ hai chúng ta chỉ có `value 1`, là giá trị thực tế của biến được export.

Có thể xét tương tự với việc expansion `$VAR2` và `${VAR2}`, và đó là lý do chúng ta có output khác nhau ở dòng thứ ba và thứ tư.

Dù sao, chúng ta có thể tìm các thay đổi đối với một biến nhất định trong một recipe cụ thể bằng command line sau:

```
$ bitbake recipename -e | grep 'VARIABLENAME='
```

Lệnh này kiểm tra giá trị thực tế của biến `VARIABLENAME` khi recipe `recipename` được build.

Các biến có thể tham chiếu nội dung của biến khác bằng một cú pháp giống như expansion biến trong Bourne shell. Ví dụ, nếu xem file `conf/local.conf`, chúng ta có thể thấy biến `BB_DISKMON_DIRS` được đặt như dưới đây:

```
$ cat conf/local.conf
...
BB_DISKMON_DIRS ??= "\
    STOPTASKS,${TMPDIR},1G,100K \
    STOPTASKS,${DL_DIR},1G,100K \
    STOPTASKS,${SSTATE_DIR},1G,100K \
    STOPTASKS,/tmp,100M,100K \
    HALT,${TMPDIR},100M,1K \
    HALT,${DL_DIR},100M,1K \
    HALT,${SSTATE_DIR},100M,1K \
    HALT,/tmp,10M,1K"
...
```

Tuy nhiên, nếu yêu cầu bitbake hiển thị giá trị thực tế của nó, chúng ta có output sau:

```
$ bitbake -e | grep 'BB_DISKMON_DIRS='
BB_DISKMON_DIRS="    STOPTASKS,/home/giometti/yocto/imx-yocto-bsp/imx8m
p-build/tmp,1G,100K     STOPTASKS,/home/giometti/DL_ARCHIVES/yocto/,1G,
100K     STOPTASKS,/home/giometti/yocto/imx-yocto-bsp/imx8mp-build/ssta
te-cache,1G,100K     STOPTASKS,/tmp,100M,100K     HALT,/home/giometti/y
octo/imx-yocto-bsp/imx8mp-build/tmp,100M,1K     HALT,/home/giometti
 DL_ARCHIVES/yocto/,100M,1K     HALT,/home/giometti/yocto/imx-yocto-bsp
/imx8mp-build/sstate-cache,100M,1K     HALT,/tmp,10M,1K"
```

> Lưu ý rằng khi chỉ định đường dẫn, chúng ta không nên dùng ký tự dấu ngã (`~`) làm lối tắt cho home directory. Làm vậy có thể khiến `bitbake` không nhận ra đường dẫn, vì nó không expansion ký tự này theo cách mà shell làm. Thay vào đó, hãy cung cấp đường dẫn đầy đủ hơn như ở trên.

Chúng ta đã nói rằng, không giống Bourne shell, cặp ngoặc nhọn là bắt buộc, tức là chỉ `${VAR}` chứ không phải `$VAR` mới được nhận ra là expansion của biến `VAR`. Hơn nữa, trong BitBake, toán tử equal-to (`=`) không expansion ngay các tham chiếu biến ở phía right-hand. Thay vào đó, việc expansion được hoãn lại cho đến khi biến được gán thực sự được dùng. Kết quả phụ thuộc vào giá trị hiện tại của các biến được tham chiếu. Chúng ta có thể đối chiếu hành vi này với toán tử expansion biến tức thì (`:=`), toán tử khiến nội dung của biến được expansion ngay lập tức, thay vì khi biến thực sự được dùng.

Một điều quan trọng khác cần nhớ là nếu cú pháp expansion biến được dùng trên một biến không tồn tại, chuỗi sẽ được giữ nguyên. Ví dụ, với phép gán sau, `VAR` được expansion thành chuỗi nguyên văn `“${FOO}”` chừng nào `FOO` không tồn tại:

```
VAR = "${FOO}"
```

> Hành vi này trái ngược với GNU Make, nơi các biến chưa định nghĩa được expansion thành rỗng.

Để chứng minh, chúng ta có thể dùng recipe `cy-test`, vì vậy hãy đặt thiết lập trên vào đó như dưới đây:

```
VAR = "${FOO}"

do_show_result() {
    bbplain "var = ${VAR}"
}
```

Sau đó thực thi `bitbake` với option argument `-e` để xem `VAR` được expansion thế nào:

```
$ bitbake -e -c show_result cy-test | grep '^VAR='
VAR="\${FOO}"
```

Lưu ý rằng nếu thực thi task `do_show_result` như đã làm ở trên, chúng ta có output sau:

```
var =
```

Lý do là khi được thực thi, shell thực hiện expansion thành chuỗi rỗng.

### 5.1.2 Đặt giá trị mặc định (Setting Default Values)

Nếu xem lại file `conf/local.conf`, chúng ta có thể thấy đoạn code sau:

```
$ cat conf/local.conf
MACHINE ??= 'imx8mp-icore-cy'
DISTRO ?= 'fsl-imx-xwayland'
...
```

Toán tử giá trị mặc định `?=` được dùng cho biến `DISTRO` ở trên tạo ra một phép gán mềm hơn cho biến. Loại phép gán này cho phép định nghĩa một biến nếu nó chưa được định nghĩa khi câu lệnh được parse, nhưng giữ nguyên giá trị nếu biến đã có giá trị. Trong ví dụ trên, nếu `DISTRO` đã được đặt vào lúc câu lệnh này được parse, biến giữ nguyên giá trị của nó, nhưng nếu `DISTRO` chưa được đặt, biến được đặt thành `fsl-imx-xwayland`.

> Phép gán trên là tức thì. Do đó, nếu có nhiều phép gán `?=` cho cùng một biến, phép gán đầu tiên trong số đó sẽ được dùng.

Mặt khác, toán tử giá trị mặc định yếu `??=` được dùng cho biến `MACHINE` là giá trị mà biến đó sẽ được expansion thành nếu không có giá trị nào được gán cho nó qua bất kỳ toán tử gán nào khác. Toán tử này có hiệu lực ngay lập tức, thay thế mọi giá trị mặc định yếu đã được định nghĩa trước đó. Tức là, nếu `MACHINE` hoàn toàn chưa được đặt, biến được đặt thành `imx8mp-icore-cy`, nhưng nếu biến đã được đặt qua bất kỳ toán tử gán nào khác, nó giữ nguyên giá trị thực tế của mình.

Khác biệt giữa `?=` và `??=` là toán tử sau giống `?=` ngoại trừ việc giá trị được gán ở cuối quá trình parse. Thật vậy, nếu dùng các thiết lập sau:

```
VAR ?= "value 1"
VAR ?= "value 2"
VAR = "value 3"
do_show_result() {
    bbplain "var = ${VAR}"
}
```

và thực thi `bitbake`, chúng ta có output sau:

```
$ bitbake -c show_result cy-test
var = value 3
```

điều này được mong đợi vì ở phép gán cuối chúng ta dùng `=`; tuy nhiên, nếu bỏ nó đi:

```
VAR ?= "value 1"
VAR ?= "value 2"

do_show_result() {
    bbplain "var = ${VAR}"
}
```

thì giá trị được gán thay đổi như dưới đây:

```
var = value 1
```

vì phép gán `?=` thứ hai không có tác dụng. Mặt khác, nếu làm tương tự với `??=` như dưới đây:

```
VAR ??= "value 1"
VAR ??= "value 2"
VAR = "value 3"

do_show_result() {
    bbplain "var = ${VAR}"
}
```

giá trị được gán là `value 3` như mong đợi, nhưng nếu bỏ phép gán cuối:

```
VAR ??= "value 1"
VAR ??= "value 2"

do_show_result() {
    bbplain "var = ${VAR}"
}
```

giá trị được gán là `value 2`; tức là giá trị cuối cùng.

### 5.1.3 Append, prepend và remove (Appending, Prepending, and Removal)

Những toán tử khác được dùng rộng rãi trong các file cấu hình của Yocto Project là các toán tử append và prepend. Trong bitbake, chúng ta có nhiều toán tử như vậy:

- Append (`+=`) và prepend (`=+`) có dấu cách:<br>Các toán tử này có hiệu lực ngay trong khi parse, và chúng chèn một dấu cách giữa giá trị hiện tại và giá trị được prepend hoặc append.

- Append (`.=`) và prepend (`=.`) không có dấu cách:<br>Các toán tử này có hiệu lực ngay trong khi parse, và chúng không chèn dấu cách giữa giá trị hiện tại và giá trị được prepend hoặc append.

> Bạn đọc nên chú ý sự khác biệt này vì, như đã nói, việc thêm hay không thêm một dấu cách có thể gây lỗi hoặc cấu hình sai trong khi parse recipe!

- Append và prepend bằng cú pháp kiểu override: Chúng ta cũng có thể append và prepend giá trị của một biến bằng cú pháp kiểu override, như trong ví dụ dưới đây:

  ```
  FOO = "foo"
  FOO:append = " appended"
  BAR = "bar"
  BAR:prepend = "prepended-"
  ```

  Biến `FOO` trở thành `”foo appended”`, và `BAR` trở thành `”prepended-bar”` (cú pháp kiểu override sẽ được giải thích rõ trong chương này ở Mục 5.3.1). Lưu ý rằng khi dùng cú pháp này, không có dấu cách nào được chèn vào!

Hơn nữa, các toán tử này khác với các toán tử `:=`, `.=`, `=.`, `+=` và `=+` ở chỗ tác dụng của chúng được áp dụng vào thời điểm expansion biến chứ không được áp dụng ngay lập tức. Điều này có nghĩa là, ví dụ, nếu một class `foo.bbclass` cần thêm giá trị `val` vào biến `FOO`, và một recipe dùng `foo.bbclass` như sau:

```
inherit foo
FOO = "initial"
```

Nếu `foo.bbclass` dùng dạng `FOO += " val"`, thì giá trị cuối cùng của `FOO` sẽ là `initial`, đây không phải là điều mong muốn, vì khi class file được parse, toán tử `+=` có hiệu lực ngay lập tức và `FOO` được đặt thành `val`, sau đó toán tử `=` được parse, và giá trị trước đó bị ghi đè bằng chuỗi `initial`.

Để thử nghiệm, chúng ta có thể làm như sau, bằng cách tạo một file `.bbclass` đơn giản trong thư mục layer `meta-engicam-nxp` như dưới đây:

```
$ mkdir classes
$ cat > classes/foo.bbclass <<__EOF__
FOO += " val"
__EOF
```

Sau đó chúng ta có thể đặt đoạn code trên vào recipe `cy-test`:

```
inherit foo
FOO = "initial"

do_show_result() {
    bbplain "foo = '${FOO}'"
}
```

Bây giờ, nếu thực thi task `do_show_result`, chúng ta có kết quả như mong đợi:

```
$ bitbake -c show_result cy-test
...
foo = 'initial'
```

Mặt khác, nếu `foo.bbclass` dùng dạng `FOO:append = ” val”`, thì giá trị cuối cùng của `FOO` sẽ là `“initial val”`, đúng như dự định, vì việc expansion biến được thực hiện khi toán tử `=` được xử lý, rồi sau đó mới append.

Vậy hãy thay đổi code của `foo.bbclass` như dưới đây:

```
$ cat classes/foo.bbclass
FOO:append = " val"
```

Sau đó, khi re-execute task, chúng ta có output sau:

```
foo = 'initial val'
```

Một toán tử hữu ích khác có thể dùng trong file cấu hình là cú pháp remove kiểu override, có thể được dùng để bỏ giá trị khỏi danh sách.

Như đã nói, trong các recipe Yocto, chúng ta có thể gặp các danh sách được định nghĩa như dưới đây:

```
FOO = "123 456 789 123456 123 456 123 456"
```

Và trong trường hợp muốn bỏ một số phần tử trong danh sách, ví dụ chuỗi `123`, chúng ta có thể dùng cú pháp dưới đây:

```
FOO:remove = "123"
```

Thật vậy, chỉ định một giá trị cần remove sẽ khiến mọi lần xuất hiện của giá trị đó bị bỏ khỏi biến. Trong ví dụ của chúng ta, `FOO` trở thành `“456` `789 123456 456 456“` (chú ý dấu cách ở đầu và các dấu cách đôi giữa `123456` và hai lần xuất hiện của `456`).

Chúng ta cũng có thể bỏ nhiều phần tử cùng lúc, như dưới đây:

```
BAR = " abc def ghi abcdef abc def abc def def"
BAR:remove = " \
    def \
    abc \
    ghi \
"
```

Trong trường hợp này, `BAR` trở thành `“ abcdef “` (chú ý các dấu cách ở đầu và cuối).

> Khác với các toán tử `:append` và `:prepend` ở trên, không cần thêm dấu cách ở đầu hoặc cuối giá trị, nhưng giống các toán tử `:append` và `:prepend`, `:remove` được áp dụng vào thời điểm expansion biến.

Để thử nghiệm các toán tử này, chúng ta có thể dùng recipe `cy-test` bằng cách đặt đoạn code sau vào đó:

```
FOO = "123 456 789 123456 123 456 123 456"
FOO:remove = "123"
BAR = " abc def ghi abcdef abc def abc def def"
BAR:remove = " \
    def \
    abc \
    ghi \
"

do_show_result() {
    bbplain "foo = '${FOO}'"
    bbplain "bar = '${BAR}'"
}
```

Sau đó, nếu thực thi task `do_show_result` như ở trên, chúng ta có output sau:

```
foo = ' 456 789 123456  456  456'
bar = '    abcdef     '
```

Các chuỗi kết quả chính xác là những gì chúng ta mong đợi.

### 5.1.4 Unset biến và flag (Unsetting Variables and Flags)

Variable flag là cách BitBake triển khai các thuộc tính (property hay attribute) của biến. Đó là một cách gắn thêm thông tin vào một biến. Ví dụ, chúng ta đã thấy cách dùng các flag này trong file `sources/poky/meta/conf/documentation.conf` ở Mục 4.1.1, nơi có một số thiết lập như dưới đây:

```
do_build[doc] = "Default task for a recipe - depends on all other norma
l tasks required to 'build' a recipe"
do_clean[doc] = "Removes all output files for a target"
```

Vì vậy variable flag có dạng

```
variable_name[flag_name] = "value"
```

Chúng ta có thể định nghĩa variable flag của riêng mình; tuy nhiên, việc dùng các flag đã được định nghĩa trong Yocto build system là khá thông thường; thật vậy, BitBake có một tập variable flag đã định nghĩa sẵn cho recipe và class. Hơn nữa, task hỗ trợ một số flag kiểm soát nhiều chức năng khác nhau của task, như đã thấy ở trên trong recipe `cy-test`, đó là thiết lập:

```
do_show_result[nostamp] = "1"
```

Làm như vậy, chúng ta yêu cầu BitBake không tạo stamp file cho task, nghĩa là task luôn phải được thực thi.

Một variable flag khác được dùng rộng rãi là `noexec`:

```
do_show_result[noexec] = "1"
```

Nó đánh dấu task là rỗng, và khi đó task không được thực thi. Còn nhiều flag variable khác (xem Mục 5.2.2), nhưng ở đây trình bày hai flag thú vị: `postfuncs` và `prefuncs`. Chúng có thể được dùng như dưới đây:

```
do_fetch[postfuncs] += "fixup_distcc_mirror_tarball"
do_configure[prefuncs] += "copy_pci_source_from_kernel"
```

Chúng liệt kê các hàm cần gọi sau và trước khi task hoàn tất. Trong ví dụ trên, hàm `fixup_distcc_mirror_tarball` được thực thi sau `do_fetch`, và `copy_pci_source_from_kernel` được thực thi trước `do_configure`.

> Bạn đọc nên lưu ý rằng chúng ta có thể định nghĩa, append và prepend giá trị cho variable flag như trong ví dụ trên, vì vậy mọi phép toán cú pháp tiêu chuẩn đã nêu trước đó đều hoạt động với variable flag, ngoại trừ cú pháp kiểu override (tức là `:prepend`, `:append` và `:remove`).

Cuối cùng, phải nói rằng có thể bỏ hoàn toàn một biến hoặc một variable flag khỏi environment của BitBake bằng từ khóa `unset` như dưới đây:

```
unset FOO
unset BAR[doc]
```

Hai câu lệnh này bỏ biến `FOO` và flag variable `BAR[doc]`.

### 5.1.5 Dùng inline Python variable expansion (Using Inline Python Variable Expansion)

Trong một số recipe (hoặc thường gặp hơn là trong các class Yocto), chúng ta có thể cần dùng inline Python variable expansion để đặt biến thành các giá trị được tính toán.

Ví dụ, phép gán tiếp theo khiến biến `CURR_DATE` được đặt thành ngày hiện tại:

```
CURR_DATE = "${@time.strftime('%Y%m%d', time.gmtime())}"
```

Để thử nghiệm, chúng ta có thể dùng recipe `cy-test`:

```
CURR_DATE = "${@time.strftime('%Y%m%d%H%M%S', time.gmtime())}"

do_show_result() {
    bbplain "date = '${CURR_DATE}'"
}
```

Sau đó khi thực thi task `do_show_result`, chúng ta sẽ có output như dưới đây:

```
date = '20240322175040'
```

> Lưu ý rằng trong phép gán sau, hàm `foo()` được gọi mỗi lần biến `FOO` được expansion:
>
> ```
> FOO = "${@foo()}"
> ```
>
> còn khi dùng phép gán tức thì sau, hàm `foo()` chỉ được gọi một lần, ngay khi phép gán được parse:
>
> ```
> FOO := "${@foo()}"
> ```
>
> Điều này có thể dẫn đến lỗi.

Tuy nhiên, cách dùng phổ biến nhất của tính năng này là lấy giá trị các biến từ environment của BitBake (còn được gọi là internal data dictionary hoặc Datastore Variables và được truy cập qua `d.`). Đoạn code sau chọn nội dung của biến `DISTRO_NAME` hoặc `DISTRO` (nếu biến thứ nhất không được định nghĩa):

```
CURR_DISTRO = "${@d.getVar('DISTRO_NAME') or d.getVar('DISTRO')}"
```

Lưu ý rằng để đọc flag variable, chúng ta phải dùng một cú pháp hơi khác:

```
DOBUILD_DOC = "${@d.getVarFlag('do_build', 'doc', False)}"
```

Phương thức `getVar(“VAR”, expand)` trả về giá trị của biến `VAR` hoặc `None` nếu nó không tồn tại (dùng `expand=True` sẽ expansion giá trị), còn `getVarFlag(“VAR”, flag, expand)` trả về giá trị của flag variable `VAR[flag]` hoặc `None` nếu biến `VAR` hoặc `flag` được nêu tên không tồn tại (dùng `expand=True` sẽ expansion giá trị).

> Còn nhiều hàm khác để truy cập Datastore Variables; danh sách đầy đủ có tại `https://docs.yoctoproject.org/bitbake/2.2/bitbake-user-manual/bitbake-user-manual-metadata.html#functions-for-accessing-datastore-variables`.

Để thử nghiệm các hàm này, chúng ta vẫn có thể dùng recipe `cy-test` như dưới đây:

```
CURR_DISTRO = "${@d.getVar('DISTRO_NAME') or d.getVar('DISTRO')}"
DOBUILD_DOC = "${@d.getVarFlag('do_build', 'doc', False)}"

do_show_result() {
    bbplain "distro = '${CURR_DISTRO}'"
    bbplain "doc = '${DOBUILD_DOC}'"
}
```

Khi thực thi task trong recipe, output sẽ giống như dưới đây:

```
distro = 'NXP i.MX Release Distro'
doc = 'Default task for a recipe - depends on all other normal tasks re
quired to 'build' a recipe'
```

Giờ chúng ta có thể thử những gì đã được gợi ý trong Mục 4.1.3, tức là có thể đặt đoạn code sau vào recipe `cy-test`:

```
BAR := "${@d.getVar('BB_ORIGENV', False).getVar('BAR', True)}"

do_show_result() {
        bbplain "BAR = '${BAR}'"
}
```

> Chú ý phép gán `:=` ở trên; nếu đã dùng `=`, một lỗi sẽ phát sinh!

Sau đó, cách truyền một số thông tin từ command line là như dưới đây:

```
$ BAR="some value" bitbake -c show_result cy-test
...
BAR = 'some value'
```

Một ví dụ khác được dùng rộng rãi về các hàm inline Python được trình bày dưới đây, trong đó chúng ta có thể kiểm tra xem một biến có chứa một chuỗi cụ thể hay không bằng phương thức `bb.utils.contains()`:

```
CHK_DEBUG = "${@bb.utils.contains("IMAGE_FEATURES", \
                        "debug-tweaks", "debug", "no-debug", d)}"
```

Nếu biến `IMAGE_FEATURES` chứa chuỗi `debug-tweaks`, thì hàm trả về `debug`; nếu không, nó trả về `no-debug`. Để thử nghiệm, chúng ta có thể dùng đoạn code sau trong recipe `cy-test`:

```
CHK_DEBUG = "${@bb.utils.contains("IMAGE_FEATURES", \
                        "debug-tweaks", "debug", "no-debug", d)}"

do_show_result() {
        bbplain "IMAGE_FEATURES = '${IMAGE_FEATURES}'"
        bbplain "CHK_DEBUG = '${CHK_DEBUG}'"
}
```

Khi thực thi task, chúng ta sẽ có kết quả sau:

```
IMAGE_FEATURES = ' debug-tweaks package-management'
CHK_DEBUG = 'debug'
```

Chúng ta có thể tìm thấy nhiều hàm khác có thể gọi từ Python bằng cách xem source code của module BitBake, nằm trong thư mục `poky/bitbake/lib/bb`. Ví dụ, `poky/bitbake/lib/bb/utils.py` chứa hàm `bb.utils.contains()` vừa được thử nghiệm.

### 5.1.6 Dùng anonymous Python function (Using Anonymous Python Functions)

Anonymous Python function là các hàm đặc biệt mà chúng ta có thể định nghĩa trong một file recipe để đặt biến, hoặc thực hiện các thao tác khác bằng chương trình, trong khi parse. Ví dụ, đoạn sau đặt `VAR2` có điều kiện dựa trên giá trị của biến `VAR1`:

```
VAR1 = "value1"

do_show_result() {
        bbplain "var1 = ${VAR1}"
        bbplain "var2 = ${VAR2}"
}
python () {
    if d.getVar('VAR1') == 'value1':
        d.setVar('VAR2', 'value2')
}
```

Nếu đặt đoạn code trên vào recipe ví dụ, chúng ta sẽ có output sau:

```
...
var1 = value1
var2 = value2
...
```

còn nếu đặt `VAR1` thành `value3` và chạy lại phép thử, chúng ta sẽ có một output khác:

```
...
var1 = value3
var2 =
...
```

Lưu ý rằng một cách tương đương để đánh dấu một hàm là anonymous function là đặt cho nó tên `__anonymous`, thay vì không đặt tên. Vì vậy, ví dụ trên có thể được viết là

```
python __anonymous() {
    if d.getVar('VAR1') == 'value1':
        d.setVar('VAR2', 'value2')
}
```

Một điều quan trọng cần nhớ với anonymous Python function là chúng luôn chạy ở cuối quá trình parse, bất kể chúng được định nghĩa ở đâu, và nếu một recipe chứa nhiều anonymous function, chúng chạy theo đúng thứ tự được định nghĩa trong recipe.

Đặc biệt, các override và các toán tử override-style như `append`, `prepend`, v.v., được áp dụng trước khi anonymous function chạy. Có thể kiểm chứng điều này bằng đoạn code sau:

```
VAR = "var "
VAR:append = " from outside"
do_show_result() {
        bbplain "var = ${VAR}"
}

python __anonymous() {
    d.setVar("VAR", "var from anonymous")
}
```

Nếu thực thi recipe `cy-test`, chúng ta sẽ thấy `VAR` cuối cùng mang chuỗi `var from anonymous`, như dưới đây:

```
$ bitbake -f -c show_result cy-test
...
var = var from anonymous
...
```

Vì vậy hàm này có thể được dùng để sửa một số thiết lập ở cuối quá trình parse. Tuy nhiên, một cách dùng thú vị khác của các hàm này được trình bày trong layer poky, ở file `meta/recipes-core/meta/cve-update-db-native.bb`:

```
$ cat poky/meta/recipes-core/meta/cve-update-db-native.bb
...
python () {
    if not bb.data.inherits_class("cve-check", d):
        raise bb.parse.SkipRecipe("Skip recipe when cve-check class is
not loaded.")
}
...
```

Ở đây, anonymous function được dùng để kiểm tra xem class `cve-check` đã được kế thừa chưa và đưa ra một warning nếu có. Điều này nhằm nhấn mạnh rằng các hàm này không chỉ để đặt biến mà còn để thực hiện các hành động đặc biệt ở cuối quá trình parse.

### 5.1.7 Export biến (Exporting Variables)

Thỉnh thoảng, việc dùng các biến của BitBake trong một shell script có thể hữu ích; để làm vậy, chúng ta phải export biến vào environment của các task đang chạy bằng từ khóa `export`. Ví dụ, chúng ta có thể viết lại recipe `cy-` `test` như dưới đây:

```
export CURR_DATE = "${@time.strftime('%Y%m%d%H%M%S', time.gmtime())}"

do_show_result() {
    bbplain "date = '$CURR_DATE'"
}
```

Trong trường hợp này, BitBake không expansion `CURR_DATE` trong thân của `show_result` vì nó thiếu `{}` bắt buộc, nhưng shell expansion nó.

Bạn đọc nên chú ý tới khái niệm này! Trong Mục 5.2.1, chúng ta sẽ chứng minh rằng trong trường hợp này, hàm `do_show_result` được expansion thành

```
do_show_result() {
    bbplain "date = '$CURR_DATE'"
}
```

còn trong trường hợp trước, nó được expansion thành

```
do_show_result() {
    bbplain "date = '20240325141632'"
}
```

Vì vậy, bằng `export`, chúng ta có thể định nghĩa một biến mới có thể được dùng trong mỗi shell function vào thời điểm thực thi.

Lưu ý rằng cũng có thể định nghĩa biến rồi export nó (hoặc ngược lại); trong cả hai trường hợp, chúng ta đều có cùng kết quả. Trong output của `bitbake -e`, các biến được export vào environment có từ khóa `export` đứng trước, như chúng ta có thể dễ dàng kiểm chứng dưới đây:

```
$ bitbake -e cy-test | grep 'CURR_DATE='
export CURR_DATE="20240325141652"
```

Bạn đọc nên lưu ý ở đây rằng một command line chính xác hơn để lấy nội dung của một biến BitBake có thể là như sau:

```
bitbake -e cy-test | grep '^(export )?VARIABLE='
```

Lệnh này sẽ hoạt động trong cả hai trường hợp `VARIABLE` được export hay không.

## 5.2 Task (Tasks)

Giờ chúng ta đã biết mọi thứ về biến của BitBake, chúng ta phải xem chi tiết hơn về task. Cùng với biến, chúng rất quan trọng để hiểu cách recipe có thể chuyển source code thành một package hoặc thành một Yocto image.

### 5.2.1 Định nghĩa task mới (Defining New Tasks)

Task là đơn vị thực thi của BitBake, và chúng có thể là shell function hoặc Python function (theo kiểu BitBake) đã được nâng lên thành task bằng lệnh `addtask`, như đã thấy ở trên khi chúng ta định nghĩa task `show_result`.

Đối số thứ nhất của `addtask` là tên của hàm cần nâng một hàm BitBake đơn giản thành task, và có thể theo sau là một số phụ thuộc giữa task này và các task khác, như trong ví dụ dưới đây:

```
python do_printdate() {
    import time
    bb.plain(time.strftime('%Y%m%d%H%M%S', time.gmtime()))
}
addtask printdate after do_fetch before do_build
```

Task mới `do_printdate` sẽ được thực thi giữa các task `do_fetch` và `do_build` tùy theo danh sách task thực thi hiện tại (xem bên dưới). Task chỉ được hỗ trợ trong file recipe và class file (tức là trong các file `.bb` hoặc `.bbclass` và các file được include hoặc kế thừa từ các file này).

Lưu ý rằng nếu tên không bắt đầu bằng tiền tố `do_`, thì tiền tố này được ngầm thêm vào, nhằm áp đặt quy ước mọi tên task đều bắt đầu bằng chuỗi `do_`. Cũng lưu ý rằng thay vì dùng hàm Python `print()` quen thuộc, chúng ta đã dùng hàm `bb.plain()` để in thời gian hiện tại, tương tự như đã làm ở trên với `show_result` (hay task `do_show_result` – từ đây trở đi, hai tên này có thể dùng thay cho nhau). Vì vậy, ví dụ, một phiên bản Python của task thử nghiệm có thể như sau:

```
CURR_DATE = "${@time.strftime('%Y%m%d%H%M%S', time.gmtime())}"

python do_show_result() {
    curr_date = d.getVar('CURR_DATE', True)
    bb.plain("date = '%s'" % (curr_date))
}
```

> Lưu ý rằng trong phiên bản này chúng ta đã dùng thụt lề four-space thay vì tám; nếu không, mọi thứ vẫn hoạt động, nhưng chúng ta sẽ nhận được một warning như dưới đây:
>
> ```
> WARNING: python should use 4 spaces indentation, but found tabs in
>  example_0.1.bb, line 8
> ```

Nếu đặt đoạn code đó vào recipe `cy-test` và thực thi nó, chúng ta sẽ thấy kết quả như dưới đây:

```
date = '20240325135835'
```

Một lưu ý thú vị cần chỉ ra ở đây là những gì chúng ta nhận được nếu thay đối số `True` trong hàm `d.getVar()` bằng `False`, như dưới đây:

```
--- recipes-core/cy-test/cy-test_0.1.bb
+++ recipes-core/cy-test/cy-test_0.1.bb
@@ -5,7 +5,7 @@
 CURR_DATE = "${@time.strftime('%Y%m%d%H%M%S', time.gmtime())}"

 python do_show_result() {
-    curr_date = d.getVar('CURR_DATE', True)
+    curr_date = d.getVar('CURR_DATE', False)
     bb.plain("date = '%s'" % (curr_date))
 }
```

Làm như vậy, output của việc thực thi `bitbake` sẽ như dưới đây:

```
date = '${@time.strftime('%Y%m%d%H%M%S', time.gmtime())}'
```

Lần này, chúng ta nhận được nội dung của `CURR_DATE` mà không được expansion. Hành vi khác biệt này là vì với các shell task, BitBake ghi một shell script vào `${T}/run.do_taskname` rồi thực thi script đó. Shell script được tạo ra chứa mọi biến được export, và các shell function với mọi biến đã được expansion, như trong ví dụ dưới đây:

```
$ cat tmp/work/armv8a-poky-linux/cy-test/0.1-r0/temp/run.do_show_result
...
do_show_result() {
    bbplain "date = '20240325141632'"
}
...
```

còn với các Python task, BitBake thực thi task bên trong, và khi đó chúng ta có thể quyết định có expansion hay không. Nếu xem file `${T}/run.do_taskname` được tạo ra lúc này, chúng ta có đoạn code sau:

```
$ cat tmp/work/armv8a-poky-linux/cy-test/0.1-r0/temp/run.do_show_result
def do_show_result(d):
    curr_date = d.getVar('CURR_DATE', False)
    bb.plain("date = '%s'" % (curr_date))

do_show_result(d)
```

> Xem các hàm đã được expansion trong file run và output trong các file log (có tên `${T}/log.do_taskname`) là một kỹ thuật debug hữu ích.
>
> Hãy nhớ rằng để lấy giá trị của `T`, chúng ta có thể dùng command line sau:
>
> ```
> $ bitbake -e -c show_result cy-test | grep '^T='
> T="/home/giometti/yocto/imx-yocto-bsp/imx8mp-build/tmp/work/armv8a
> -poky-linux/cy-test/0.1-r0/temp"
> ```

Giờ chúng ta có thể chứng minh sự khác biệt giữa việc dùng hay không dùng từ khóa `export`. Ở trên chúng ta đã thấy rằng khi không có nó, hàm được expansion thành

```
$ cat tmp/work/armv8a-poky-linux/cy-test/0.1-r0/temp/run.do_show_result
...
do_show_result() {
    bbplain "date = '20240325141632'"
}
...
```

còn nếu dùng `export`, chúng ta có đoạn code sau:

```
$ bitbake cy-test
...
date = '20240326161459'
...
$ cat tmp/work/armv8a-poky-linux/cy-test/0.1-r0/temp/run.do_show_result
...
export CURR_DATE="20240326161459"
...
do_show_result() {
    bbplain "date = '$CURR_DATE'"
}
...
```

Trong đoạn code thứ nhất, chúng ta có một task `do_show_result` với thân cố định, còn trong đoạn code thứ hai, chúng ta có một biến mới `CURR_DATE` mà có thể tham chiếu từ một task khác ngoài `do_show_result`.

### 5.2.2 Hiểu cách thực thi task (Understanding Task Execution)

Để hiểu cách BitBake thực thi task, hãy thay đổi recipe `cy-test` một chút như dưới đây:

```
--- cy-test_0.1.bb
+++ cy-test_0.1.bb
@@ -9,5 +9,4 @@
 }
 # Do not change below this line!
-do_show_result[nostamp] = "1"
-addtask show_result
+addtask show_result after do_fetch before do_build
```

Trước đó chúng ta đã thấy rằng khi dùng `addtask` mà không chỉ định phụ thuộc (giả sử phụ thuộc chưa được thêm bằng cách khác), cách duy nhất để chạy task là chọn nó một cách tường minh bằng option argument `-c` của BitBake, như đã làm đến giờ. Thật vậy, nếu thử ví dụ mới này, chúng ta có thể thấy task `do_show_result` được tự động chạy đúng thứ tự trong danh sách task thực thi hiện tại:

```
$ bitbake cy-test
...
NOTE: Executing Tasks
date = '20240325153915'
Setscene tasks: 177 of 177
Currently  2 running tasks (735 of 747)  98% |######################## |
0: cy-test-0.1-r0 do_prepare_recipe_sysroot - 3s (pid 811992)
1: cy-test-0.1-r0 do_patch - 3s (pid 812000)
```

Tuy nhiên, như trước, task chỉ được thực thi lần đầu tiên chúng ta build recipe; lý do là BitBake coi task là up to date sau lần chạy đầu đó; mặt khác, chúng ta đã thấy rằng nếu muốn buộc task luôn chạy lại để thử nghiệm, chúng ta có thể dùng variable flag `nostamp`:

```
do_show_result[nostamp] = "1"
```

Nhưng giờ chúng ta đã bỏ dòng đó, vì vậy vẫn có thể đánh dấu tường minh task cần thực thi bằng cách cung cấp option argument `-f` cho `bitbake` như sau:

```
$ bitbake -f -c show_result cy-test
...
NOTE: Tainting hash to force rebuild of task /home/giometti/yocto/imx-y
octo-bsp/sources/meta-engicam-nxp/recipes-core/cy-test/cy-test_0.1.bb,
do_show_result
WARNING: /home/giometti/yocto/imx-yocto-bsp/sources/meta-engicam-nxp/re
cipes-core/cy-test/cy-test_0.1.bb:do_show_result is tainted from a forc
ed run
...
NOTE: Executing Tasks
date = '20240325155712'
NOTE: Tasks Summary: Attempted 2 tasks of which 1 didn't need to be rer
un and all succeeded.

Summary: There was 1 WARNING message.
```

Như đã giới thiệu ở một mục trước, có nhiều flag variable mà chúng ta có thể dùng để tùy biến việc thực thi và hành vi của task. Dưới đây là danh sách các flag được dùng nhiều nhất của task (tham khảo `https://docs.yoctoproject.org/bitbake/2.6/bitbake-user-manual/bitbake-user-manual-metadata.html#variable-flags` để có danh sách đầy đủ):

- `cleandirs`: Flag này làm rỗng các thư mục cần được tạo trước khi task chạy. Các thư mục đã tồn tại sẽ bị xóa rồi tạo lại để làm rỗng chúng.

- `depends`: Flag này kiểm soát các phụ thuộc inter-task. Ví dụ:

  ```
  do_compile[depends] += "u-boot:do_deploy rcw:do_deploy uefi:do_de
  ploy"
  ```

  Ở đây, mọi task `do_deploy` của các recipe `u-boot`, `rcw` và `uefi` phải hoàn tất trước khi task `do_compile` có thể thực thi.

- `deptask`: Flag này kiểm soát các phụ thuộc build-time của task. Ví dụ:

  ```
  do_configure[deptask] = "do_populate_sysroot"
  ```

  Ở đây, task `do_populate_sysroot` phải hoàn tất trước khi `do_configure` có thể thực thi.

- `rdepends` và `rdeptask`: Các flag này giống `depends` và `deptask` ở trên nhưng dành cho phụ thuộc runtime. Biến `PACKAGES` liệt kê các package runtime, và mỗi package có thể có các phụ thuộc runtime `RDEPENDS` và `RRECOMMENDS`. Một ví dụ có thể là

  ```
  do_package_write[rdeptask] = "do_package"
  ```

  Trong thiết lập trên, chúng ta chỉ định rằng task `do_package` của mỗi phần tử trong `RDEPENDS` phải hoàn tất trước khi `do_package_write` có thể thực thi.

- `dirs`: Flag này được dùng để liệt kê các thư mục cần được tạo trước khi task chạy. Các thư mục đã tồn tại được giữ nguyên, và thư mục cuối cùng được liệt kê được dùng làm working directory hiện tại của task. Ví dụ:

  ```
  do_deploy[dirs] = "${DEPLOYDIR} ${B}"
  ```

  Ở đây, `bitbake` tạo các thư mục được chỉ định trong các biến `DEPLOYDIR` và `B` trước khi task `do_deploy` chạy, đồng thời đặt working directory hiện tại của `do_deploy` thành thư mục trong `B`.

- `network`: Khi flag này được đặt thành `1`, nó cho phép một task truy cập mạng. Thật vậy, theo mặc định, chỉ task `do_fetch` được cấp quyền truy cập mạng (best practice nói rằng recipe không nên truy cập mạng bên ngoài `do_fetch`).

- `noexec`: Khi flag này được đặt thành `1`, nó đánh dấu task là rỗng, vì vậy không cần thực thi. Thông thường, flag này được dùng để vô hiệu hóa các task được định nghĩa ở nơi khác mà không cần thiết trong một recipe cụ thể, hoặc để thiết lập các task làm placeholder cho phụ thuộc.

- `nostamp`: Khi flag này được đặt thành `1`, nó báo cho BitBake không tạo stamp file cho một task, nghĩa là task luôn phải được thực thi. Tuy nhiên, chúng ta nên nhớ rằng mọi task phụ thuộc (có thể là gián tiếp) vào một task được đánh dấu như vậy cũng sẽ luôn được thực thi. Vì vậy chúng ta nên cẩn thận để tránh build lại không cần thiết.

- `postfuncs` và `prefuncs`: Danh sách các hàm cần gọi sau và trước khi task hoàn tất. Ví dụ:

  ```
  do_fetch[postfuncs] += "fixup_distcc_mirror_tarball"

  do_configure[prefuncs] += "copy_pci_source_from_kernel"
  ```

  Ở đây, `fixup_distcc_mirror_tarball` được thực thi sau `do_fetch`, và `copy_pci_source_from_kernel` được thực thi trước `do_configure`.

Một tính năng thú vị khác về việc thực thi task là khả năng định nghĩa nhiều task làm phụ thuộc khi gọi `addtask`. Ví dụ:

```
addtask package_write_tar before do_build \
                          after do_packagedata do_package
```

Ở đây, task `package_write_tar` phải đợi cho đến khi cả hai task `do_packagedata` và `do_package` hoàn tất.

Nói chung, thứ tự BitBake chạy các task được kiểm soát bởi task scheduler của nó, scheduler này có thể được cấu hình hoặc thậm chí định nghĩa lại bằng các bản triển khai tùy biến cho những trường hợp sử dụng cụ thể.

Dù các thiết lập này nằm ngoài phạm vi của sách, chúng ta có thể nói rằng để chọn tên scheduler dùng cho việc lập lịch các task của BitBake, chúng ta có thể dùng biến `BB_SCHEDULER` (xem `https://docs.yoctoproject.org/bitbake/2.8/bitbake-user-manual/bitbake-user-manual-ref-variables.html#term-BB_SCHEDULERS`).

### 5.2.3 Prepend, append và định nghĩa lại (Prepending, Appending, and Redefinition)

Cũng như với biến, chúng ta có thể append, prepend hoặc định nghĩa lại hoàn toàn một task. Và chúng ta có thể dễ dàng giải thích cách làm chỉ bằng vài ví dụ.

Hãy xét recipe `cy-test_0.1.bb` ban đầu của chúng ta:

```
$ cat meta-engicam-nxp/recipes-core/cy-test/cy-test_0.1.bb
DESCRIPTION = "Recipe created to run simple code"
LICENSE = "MIT"
# Do not change above this line!

do_show_result() {
    bbplain "Hello World!"
}

# Do not change below this line!
do_show_result[nostamp] = "1"
addtask show_result
```

Nếu thêm một file `.bbappend` như dưới đây và thử thực thi recipe, chúng ta sẽ thấy output thay đổi so với `Hello World!` quen thuộc:

```
$ cat meta-engicam-nxp/recipes-core/cy-test/cy-test_0.1.bbappend
do_show_result:prepend() {
    bbplain "------------"
}

do_show_result:append() {
    bbplain "I'm alive!!!"
    bbplain "------------"
}
```

Khi thực thi task, chúng ta sẽ có

```
$ bitbake -c show_result cy-test
...
------------
Hello World!
I'm alive!!!
------------
...
```

Giờ thì rõ ràng là bằng cách này, chúng ta có thể dễ dàng thêm một số hành động phụ vào task, điều này có thể rất hữu ích để tùy biến recipe của mình!

> Bạn đọc nên lưu ý rằng các toán tử append và prepend có tính cộng dồn, giống như `+=`, `=+`, v.v., vì vậy mọi append/prepend được áp dụng theo thứ tự chúng xuất hiện trong khi parse.

Mặt khác, chúng ta cũng có thể định nghĩa lại hoàn toàn một hàm chỉ bằng cách viết lại thân hàm. Nếu thêm một file `.bbappend` khác như dưới đây, chúng ta định nghĩa lại thân của task:

```
$ cat meta-engicam-nxp/recipes-core/cy-test/cy-test_%.bbappend
do_show_result() {
    bbplain "Ciao ragazzi"
}
```

> Lưu ý rằng chúng ta thêm file `cy-test_%.bbappend`, áp dụng cho mọi số phiên bản của recipe `cy-test`, chỉ để có thể chỉ định một tên file khác trong thư mục `cy-test`. Thông thường, chúng ta có thể làm tương tự bằng cách chỉ định một file `cy-test_0.1.bbappend` trong một layer khác.

Thật vậy, nếu thực thi lại BitBake như trên, giờ chúng ta sẽ có output sau:

```
$ bitbake -c show_result cy-test
...
------------
Ciao ragazzi
I'm alive!!!
------------
...
```

điều này chứng minh rằng task `do_show_result` đã được thay thế đúng.

### 5.2.4 Xóa một task (Deleting a Task)

Cũng như có thể thêm task, chúng ta có thể xóa chúng. Để làm vậy, chúng ta có thể dùng lệnh `deltask`. Ví dụ, để xóa task được dùng trong các mục trước, bạn sẽ dùng

```
deltask do_show_result
```

Không có gì nhiều để nói thêm về chủ đề này, ngoại trừ việc nếu xóa một task bằng lệnh `deltask` mà task đó có phụ thuộc, thì các phụ thuộc sẽ không được nối lại!

Ví dụ, hãy xét thiết lập sau:

```
addtask task1
addtask task2 after do_task1
addtask task3 after do_task2
```

Ở đây, `do_task3` phụ thuộc vào `do_task2`, task này lại phụ thuộc vào `do_task1`. Trong tình huống này, chúng ta có thể dùng `deltask` để xóa `do_task2` như dưới đây:

```
deltask do_task2
```

Làm như vậy, quan hệ phụ thuộc ngầm giữa `do_task3` và `do_task1` thông qua `do_task2` không còn tồn tại, và các phụ thuộc của `do_task3` không được cập nhật để bao gồm `do_task1`. Do đó, không bảo đảm rằng `do_task3` sẽ được thực thi sau `do_task1`.

Để tránh điều này, nếu muốn các phụ thuộc như vậy được giữ nguyên, chúng ta có thể dùng flag variable `noexec` để vô hiệu hóa task thay vì dùng lệnh `deltask` để xóa nó:

```
do_task2[noexec] = "1"
```

Bằng cách này, `do_task2` không được thực thi, và quan hệ phụ thuộc vẫn được giữ.

## 5.3 Cú pháp điều kiện (hay override) (Conditional Syntax (a.k.a. Overrides))

Khái niệm cú pháp điều kiện, cũng thường được gọi là override, là một cơ chế của BitBake cho phép các biến (hoặc task) được override có chọn lọc ở cuối quá trình parse.

Đây là một khái niệm thiết yếu mà mọi Yocto developer nên hiểu rõ. Đó là lý do chúng ta dành hẳn một mục cho nó.

### 5.3.1 Hiểu về override (Understanding the Overrides)

Bằng biến `OVERRIDES`, chúng ta có thể báo cho `bitbake` chọn có điều kiện một phiên bản cụ thể của một biến và append hoặc prepend có điều kiện giá trị của một biến. Biến `OVERRIDES` là một danh sách colon character–separated chứa các phần tử mà chúng ta muốn thỏa mãn điều kiện. Một ví dụ có thể là

```
OVERRIDES = "foo:bar:xyz"
```

Ở đây, biến `OVERRIDES` liệt kê ba override: `foo`, `bar` và `xyz`. Vì vậy, nếu có một biến có điều kiện theo `bar`, thì phiên bản `bar`-specific của biến được dùng thay cho phiên bản non-conditional.

> Lưu ý rằng override chỉ được dùng ký tự chữ thường, chữ số và dấu gạch ngang. Vì dấu hai chấm được dùng để ngăn cách các override với nhau và với tên biến, chúng không được phép có trong tên override.

Ở trên, chúng ta đã đặt `OVERRIDES` là

```
OVERRIDES = "foo:bar:xyz"
```

Bây giờ hãy xét biến TEST được đặt như dưới đây:

```
TEST = "default"
TEST:foo = "default for foo"
```

Biến `TEST` tự nó có giá trị mặc định là `default`, nhưng chúng ta chọn phiên bản `foo`-specific của biến `TEST` nhờ thiết lập `OVERRIDES`.

Các override được áp dụng theo thứ tự, vì vậy nếu chúng ta có

```
OVERRIDES = "foo:bar:xyz"
TEST = "default"
TEST:foo = "default foo"
TEST:bar = "default bar"
```

thì biến `TEST` sẽ được đặt thành `"default bar"`.

Chúng ta cũng có thể append và prepend vào giá trị của biến dựa trên việc một phần tử cụ thể có được liệt kê trong `OVERRIDES` hay không. Dưới đây là một ví dụ:

```
OVERRIDES = "foo:bar:xyz"
TEST = "default"
TEST:append:foo = " for foo"
TEST:prepend:bar = "bar "
```

Ở đây, mọi override được áp dụng theo thứ tự, vì vậy biến `TEST` sẽ được đặt thành `”bar default foo"`.

Dù có thể tự đặt `OVERRIDES`, cách dùng thông thường là dùng giá trị mặc định của `OVERRIDES`, bao gồm nhiều giá trị mặc định như được nêu trong file `bitbake.conf` như dưới đây:

```
$ cat sources/poky/meta/conf/bitbake.conf
...
# Overrides are processed left to right, so the ones that are named
# later take precedence.
# You generally want them to go from least to most specific. This means
# that:
# A variable '<foo>:arm' overrides a variable '<foo>' when
# ${TARGET_ARCH} is arm.
# A variable '<foo>:qemuarm' overrides '<foo>' and overrides '<foo>:arm'
# when ${MACHINE} is 'qemuarm'.
# If you use combination ie '<foo>:qemuarm:arm', then
# '<foo>:qemuarm:arm' will override '<foo>:qemuarm' and then '<foo>'
# will be overriden with that value from '<foo>:qemuarm'.
# And finally '<foo>:forcevariable' overrides any standard variable,
# with the highest priority.
# This works for functions as well, they are really just variables.
#
OVERRIDES = "${TARGET_OS}:${TRANSLATED_TARGET_ARCH}:pn-${PN}:${MACHINEO
VERRIDES}:${DISTROOVERRIDES}:${CLASSOVERRIDE}${LIBCOVERRIDE}:forcevaria
ble"
LIBCOVERRIDE ?= ""
CLASSOVERRIDE ?= "class-target"
DISTROOVERRIDES ?= "${@d.getVar('DISTRO') or ''}"
MACHINEOVERRIDES ?= "${MACHINE}"

FILESOVERRIDES = "${TRANSLATED_TARGET_ARCH}:${MACHINEOVERRIDES}:${DISTR
OOVERRIDES}"
...
```

Như chúng ta thấy ở trên, có nhiều thiết lập tự động được thực hiện trong biến đặc biệt này; cụ thể, chúng ta có

- `TARGET_OS` chỉ định hệ điều hành của target, và nó thường có thể được đặt thành `linux` cho các hệ thống glibc-based dựa trên GNU C Library, còn thường được đặt thành `linux-musl` cho Musl libC (cũng có thể có các giá trị khác).

- `TRANSLATED_TARGET_ARCH` là một biến được dùng khi cần kiến trúc hệ thống (tức là kiến trúc được chỉ định trong `TARGET_ARCH`) trong một giá trị không cho phép dấu gạch dưới, như trong tên file package (trong trường hợp này, các ký tự gạch ngang thay cho mọi ký tự gạch dưới).

- `pn-${PN}` là một thiết lập đặc biệt cho ra tiền tố `pn-` theo sau là tên recipe target (xem Mục 6.1 để biết thêm thông tin về biến `PN`). Ở phần dưới của mục này, chúng ta sẽ trình bày một số ví dụ sử dụng.

- `MACHINEOVERRIDES` là một danh sách colon-separated các machine override áp dụng cho machine hiện tại và các kiến trúc tương thích với nó. Rõ ràng, theo mặc định, danh sách này bao gồm giá trị của `MACHINE`.

- Ví dụ, trên hệ thống của chúng ta có các thiết lập sau, biểu diễn mọi loại machine tương thích với target `imx8mp-icore`:

  ```
  $ bitbake -e | grep 'MACHINEOVERRIDES='
  MACHINEOVERRIDES="aarch64:armv8a:use-nxp-bsp:imx-generic-bsp:imx-
  nxp-bsp:imxdrm:imxvpu:imaged:imxgpu2d:imxgpu3d:imxvulkan:mx8-gene
  ric-bsp:mx8-nxp-bsp:mx8m-generic-bsp:mx8m-nxp-bsp:mx8mp-generic-
  bsp:mx8mp-nxp-bsp:imx8mp-icore"
  PRISTINE_MACHINEOVERRIDES="aarch64:armv8a:use-nxp-bsp:mx8mp:imx8m
  p-icore"
  ```

- `DISTROOVERRIDES` là một danh sách colon-separated các override riêng cho distribution hiện tại. Như chúng ta thấy ở trên, danh sách này ban đầu được BitBake đặt thành `DISTRO` (hoặc một giá trị rỗng), nhưng có thể được sửa đổi sau đó.

- `CLASSOVERRIDE` chỉ định class override đặc biệt cần được áp dụng hiện tại (ví dụ, `class-target`, `class-` `native`, v.v.). Như chúng ta thấy ở trên, biến này nhận giá trị mặc định `class-target` từ file `bitbake.conf`.

  Dù các class của Yocto không được đề cập đầy đủ trong sách, cần nêu một lưu ý đặc biệt về một cách dùng khả dĩ. Thật vậy, trong một số recipe, chúng ta có thể cần một override cho phép cài thêm file, nhưng chỉ khi build cho target (được chỉ định bằng `class-target`):

  ```
  do_install:append:class-target() {
      install target.conf ${D}${sysconfdir}
  }
  ```

  hoặc khi build cho host (được chỉ định bằng `class-native`):

  ```
  do_install:append:class-native() {
      install native.conf ${D}${sysconfdir}
  }
  ```

> Xem Mục 11.6 để có ví dụ về cách dùng các class target và native.

- `LIBCOVERRIDE` chỉ định một số libC override đặc biệt. Theo mặc định, nó được đặt thành null, nhưng có thể được đặt thành `libc-` `musl` hoặc `libc-newlib` tùy theo các bản triển khai libC được dùng.

- Override `forcevariable` là override mạnh nhất có thể, và nó có thể được dùng để chỉ định một giá trị cưỡng bức.

Lưu ý cuối cùng về override liên quan đến việc cú pháp override, thường được dùng để sửa đổi biến theo machine và distro (machine- và distro-specific), đã thay đổi so với các bản phát hành cũ (trước Yocto Honister 3.4).

Cú pháp trước đây có dạng

```
PACKAGECONFIG_append_machine = " pkgfeature"
```

Kiểu cũ này đã được thay đổi để dấu hai chấm được dùng làm ký tự ngăn cách override thay cho dấu gạch dưới:

```
PACKAGECONFIG:append:machine = " pkgfeature"
```

Trong một số bản phát hành, BitBake hiện tại hỗ trợ cả hai cú pháp bằng cách thay thế ký tự trong khi xử lý biến, nhưng trong các bản phát hành BitBake tiếp theo, hỗ trợ cho cú pháp gạch dưới này sẽ bị bỏ. Trong những trường hợp này, một script giúp cho việc chuyển đổi được cung cấp tại `sources/poky/scripts/contrib/convert-overrides.py`. Khi đó chúng ta có thể chạy nó trên meta layer của mình như dưới đây:

```
$ sources/poky/scripts/contrib/convert-overrides.py our-meta-layer
```

Để làm một ví dụ override đơn giản, chúng ta vẫn có thể dùng recipe `cy-test_0.1.bb` với đoạn code sau:

```
TEST = "val"
TEST:pn-cy-test = "val example"

do_show_result() {
    bbplain "TEST = '${TEST}'"
}
```

Bây giờ, nếu thử build package `cy-test`, chúng ta sẽ thấy kết quả như dưới đây:

```
$ bitbake -c show_result cy-test
...
TEST = 'val example'
...
```

Lưu ý rằng nếu thử build bất kỳ recipe nào khác, thì `TEST` sẽ được đặt thành `val`.

### 5.3.2 Override theo machine và distro (Machine and Distros Overriding)

Ở trên chúng ta đã thấy rằng cơ chế nền tảng đằng sau cả `MACHINEOVERRIDES` lẫn `DISTROOVERRIDES` đơn giản là chúng được đưa vào giá trị mặc định của `OVERRIDES`. Vì vậy chúng ta có thể dùng chúng để thêm các override bổ sung áp dụng cho một machine hoặc một distro.

Một cách dùng điển hình của các biến này là định nghĩa một danh sách các thuộc tính hoặc tính năng chung mà một machine hoặc distro nên kế thừa; ví dụ, ở trên chúng ta đã thấy machine của mình, tức là machine dựa trên processor iMX8, định nghĩa như sau:

```
MACHINEOVERRIDES="aarch64:armv8a:use-nxp-bsp:imx-generic-bsp:imx-nxp-
bsp:imxdrm:imxvpu:imxgpu:imxgpu2d:imxgpu3d:imxvulkan:mx8-generic-bsp:mx8-
nxp-bsp:mx8m-generic-bsp:mx8m-nxp-bsp:mx8mp-generic-bsp:mx8mp-nxp-
bsp:imx8mp-icore"
```

Sau đó, bằng nhiều thiết lập như dưới đây (nằm trong file `sources/meta-freescale/conf/machine/include/imx-base.inc`), chúng ta có thể dễ dàng định nghĩa firmware phù hợp cho machine tùy theo việc machine `imx8mp-icore` của chúng ta tương thích với machine `mx8mp-generic-bsp`, v.v.:

```
# Firmware
MACHINE_FIRMWARE ?= ""
...
MACHINE_FIRMWARE:append:mx53-generic-bsp   = " firmware-imx-vpu-imx53 f
irmware-imx-sdma-imx53"
MACHINE_FIRMWARE:append:mx51-generic-bsp   = " firmware-imx-vpu-imx51 f
irmware-imx-sdma-imx51"
MACHINE_FIRMWARE:append:mx8mm-generic-bsp  = " linux-firmware-imx-sdma-
imx7d"
MACHINE_FIRMWARE:append:mx8mn-generic-bsp  = " linux-firmware-imx-sdma-
imx7d"
MACHINE_FIRMWARE:append:mx8mp-generic-bsp  = " linux-firmware-imx-sdma-
imx7d firmware-imx-easrc-imx8mn firmware-imx-xcvr-imx8mp firmware-sof-i
mx"
MACHINE_FIRMWARE:append:mx8mq-generic-bsp  = " linux-firmware-imx-sdma-
imx7d"
MACHINE_FIRMWARE:append:mx8qm-generic-bsp  = " firmware-imx-vpu-imx8"
MACHINE_FIRMWARE:append:mx8qxp-generic-bsp = " firmware-imx-vpu-imx8"
MACHINE_FIRMWARE:append:mx8dx-generic-bsp  = " firmware-imx-vpu-imx8"
MACHINE_FIRMWARE:append:imx-mainline-bsp   = " linux-firmware-imx-sdma-
imx6q linux-firmware-imx-sdma-imx7d firmware-imx-vpu-imx6q firmware-imx
-vpu-imx6d"
```

Loại machine override như vậy được dùng rộng rãi khắp Yocto source! Thật vậy, cơ chế này là cơ bản để dễ dàng sửa đổi biến nhằm hỗ trợ các machine khác nhau.

Giả sử chúng ta có một layer tên là `meta-mach` bổ sung hỗ trợ build một machine tên là `mach1` và một machine khác tên là `mach2`. Nếu cả hai machine đều cần phụ thuộc vào package `foo` nhưng chỉ `mach1` còn phụ thuộc vào package `bar`, chúng ta có thể dùng đoạn code sau:

```
DEPENDS = "foo"
DEPENDS:append:mach1 = " bar"
```

Bằng cách này, `DEPENDS` sẽ được đặt thành `”foo bar”` khi compile cho machine `mach1`, còn trong các trường hợp khác sẽ được đặt thành `”foo”`.

> Vì development kit của chúng ta dựa trên Yocto build system của Freescale, chúng ta nói vài lời giới thiệu biến `MACHINEOVERRIDES_EXTENDER`, có thể được dùng để dễ dàng nhóm các thiết lập khác nhau cho các nền tảng tương tự:
>
> ```
> $ cat sources/meta-freescale/classes/machine-overrides-extender.bbclass:
> #
> # This allow to grouping of different settings for similar
> # platforms.
> #
> # To indicate that a SoC contains following set of overrides, you
> # can use:
> #
> # MACHINEOVERRIDES_EXTENDER:soc = "group1:group2"
> #
> # However to indicate that an override replaces a set of other
> # overrides, you can use:
> #
> # MACHINEOVERRIDES_EXTENDER_FILTER_OUT:override = "group1 group2"
> ...
> ```
>
> Cú pháp đặc biệt này được dùng, ví dụ, trong layer `meta-imx` như dưới đây:
>
> ```
> $ cat meta-bsp/conf/machine/include/imx-base-extend.inc as below:
> ...
> # i.MX 8M Plus UltraLite
> MACHINEOVERRIDES_EXTENDER:mx8mpul:use-nxp-bsp = "imx-generic-bsp:i
> mx-nxp-bsp:imxfbdev:mx8-generic-bsp:mx8-nxp-bsp:mx8m-generic-bsp:m
> x8m-nxp-bsp:mx8mpul-generic-bsp:mx8mpul-nxp-bsp"
> MACHINEOVERRIDES_EXTENDER:mx8mpul:use-mainline-bsp = "imx-generic-
> bsp:imx-mainline-bsp:mx8-generic-bsp:mx8-mainline-bsp:mx8m-generic
> -bsp:mx8m-mainline-bsp:mx8mpul-generic-bsp:mx8mpul-mainline-bsp"
> ...
> ```
>
> Điều này có nghĩa là với `mx8mpul` (tức là CPU i.MX 8M Plus UltraLite), nếu đặt
>
> ```
> MACHINEOVERRIDES .= ":use-mainline-bsp"
> ```
>
> chúng ta chọn cùng lúc mọi machine override được định nghĩa bởi `MACHINEOVERRIDES_EXTENDER:mx8mpul:use-mainline-bsp`.
>
> Như chúng ta thấy, tính năng này khá hữu ích, nhưng chúng ta lưu ý rằng nó không portable! Vì vậy chúng ta không thể dùng nó trên các cách triển khai khác.

Về `DISTROOVERRIDES`, có rất ít cách dùng cơ chế này; tuy nhiên, nếu xem định nghĩa của distro `poky-tiny`, chúng ta có thể đọc thấy đoạn sau:

```
$ cat sources/poky/meta-poky/conf/distro/poky-tiny.conf
# Distribution definition for: poky-tiny
...
# Poky-tiny is intended to define a tiny Linux system comprised of a
# Linux kernel tailored to support each specific MACHINE and busybox.
# Poky-tiny sets some basic policy to ensure a usable system while still
# keeping the rootfs and kernel image as small as possible.
...
require conf/distro/poky.conf
require conf/distro/include/gcsections.inc

DISTRO = "poky-tiny"
DISTROOVERRIDES = "poky:poky-tiny"
TCLIBC = "musl"
```

Vì vậy chúng ta có thể dùng đoạn code sau để đặt có chọn lọc một phụ thuộc:

```
DEPENDS:append:poky-tiny = "foo"
```

> Vào thời điểm viết sách, không có cách dùng nào của loại override này cho distro `poky-tiny`.

### 5.3.3 Override theo task (Overriding by Tasks)

Một kiểu override khác (ít được dùng hơn nhưng đôi khi hữu ích) là khả năng đặt một biến trong environment của BitBake chỉ trong suốt thời gian của một task duy nhất. Để dễ hiểu điều chúng ta đang nói, có thể làm một ví dụ đơn giản bằng cách viết lại recipe `cy-test_0.1.bb` như dưới đây:

```
TEST = "val"
TEST:task-show-result = "val_1"
TEST:task-show-another-result = "val_2"

do_show_result() {
    bbplain "TEST = '${TEST}'"
}

do_show_another_result() {
    bbplain "TEST = '${TEST}'"
}

# Do not change below this line!
addtask show_result
do_show_result[nostamp] = "1"
addtask show_another_result
do_show_another_result[nostamp] = "1"
```

> Lưu ý rằng chúng ta đã thêm task mới `show_another_result`, và tên override được tạo bằng tiền tố `task-` theo sau là tên task, trong đó mọi ký tự gạch dưới (`_`) đã được thay bằng ký tự dấu trừ (`-`)!

Bây giờ, nếu thực thi task `show_result`, chúng ta có output sau:

```
$ bitbake -c show_result cy-test
...
TEST = 'val_1'
...
```

còn nếu thực thi task `show_another_result`, chúng ta có

```
$ bitbake -c show_another_result cy-test
...
TEST = 'val_2'
...
```

Tuy nhiên, hành vi này thực sự hữu ích khi được dùng với các task tiêu chuẩn như `configure`, `compile`, `build`, v.v.; trong những trường hợp này, chúng ta có thể dùng như sau:

```
TEST:task-configure = "val_1"
TEST:task-compile = "val_2"
TEST:task-build = "val_3"
```

Giờ `TEST` có giá trị `val_1` khi task `do_configure` được thực thi, giá trị `val_2` khi task `do_compile` được thực thi, và `val_3` trong `do_build`.

Cú pháp này cũng được dùng rộng rãi với các kết hợp khác (tức là `:prepend`, `:append` và `:remove`) như dưới đây:

```
EXTRA_OEMAKE:prepend:task-compile = "${PARALLEL_MAKE} "
```

Trong các thiết lập trên, `EXTRA_OEMAKE` sẽ được prepend thiết lập `${PARALLEL_MAKE}` chỉ trong task `do_compile`.

### 5.3.4 Override file (File Overriding)

Bên cạnh override biến, trong BitBake còn có override file. Loại override này rất thú vị, và nó có thể đơn giản hóa công việc của developer. Thật vậy, ví dụ, nhờ dùng nó, chúng ta có thể chỉ định các file khác nhau được đưa vào root filesystem tùy theo tên machine.

Như trước, để hiểu điều chúng ta đang nói, hãy xét trường hợp phải cài hai file `/etc/fstab` khác nhau tùy theo việc chúng ta đang tạo root filesystem cho machine `mach_foo` hay cho machine `mach_bar`. Để làm vậy, chúng ta có thể tạo một recipe, trong đó chỉ định file đặc biệt này trong biến `SRC_URI` (xem Mục 6.3.2 để có giải thích đầy đủ về biến này) như dưới đây:

```
SRC_URI += "file://fstab"
```

Bằng cách này, khi thực thi `bitbake`, nó sẽ cố lấy file `fstab` từ thư mục con `files` trong thư mục của recipe (thực ra nó còn tìm trong nhiều thư mục khác nữa, như chúng ta sẽ trình bày dưới đây, nhưng lúc này điều đó không quá quan trọng cho phần giải thích này). Tuy nhiên, nhờ cơ chế override file, nó cũng sẽ cố tìm các file `fstab` trong cả thư mục `files/${MACHINE}`! Vì vậy nếu dùng cấu trúc thư mục dưới đây, chúng ta có thể có các cấu hình chung và machine-specific:

```
$ tree files/
files/
├── mach_bar
│   └── fstab
├── mach_foo
│   └── fstab
└── fstab

2 directories, 3 files
```

Trong tình huống này, nếu `MACHINE` được đặt thành `mach_foo`, build system sẽ dùng file `files/mach_foo/fstab`, còn nếu `MACHINE` được đặt thành `mach_bar`, build system sẽ dùng file `files/mach_bar/fstab`. Cuối cùng, với mọi machine ngoài `mach_foo` và `mach_bar`, build system sẽ dùng file `files/fstab`.

Cơ chế này được điều khiển bởi biến `FILESPATH`, biến này lại được tạo ra từ những gì chúng ta đặt trong biến `FILESOVERRIDES`. Thật vậy:

- `FILESPATH` là một danh sách colon-separated chỉ định tập thư mục mặc định mà Yocto build system dùng khi tìm patch và file được chỉ định bởi mỗi `file:// URI` trong các câu lệnh `SRC_URI` của một recipe nhất định (xem Mục 6.3.2).

  Nó được đặt theo mặc định trong file `sources/poky/meta/classes/base.bbclass` như sau:

  ```
  $ cat sources/poky/meta/classes/base.bbclass
  ...
  FILESPATH = "${@base_set_filespath(["${FILE_DIRNAME}/${BP}", "${F
  ILE_DIRNAME}/${BPN}", "${FILE_DIRNAME}/files"], d)}"
  ...
  ```

  Biến `FILESPATH` được tự động mở rộng bằng các override từ biến `FILESOVERRIDES`, vì hàm `base_set_filespath()` được định nghĩa như dưới đây:

  ```
  $ cat sources/poky/meta/classes/utils.bbclass
  ...
  def base_set_filespath(path, d):
      filespath = []
      extrapaths = (d.getVar("FILESEXTRAPATHS") or "")
      # Remove default flag which was used for checking
      extrapaths = extrapaths.replace("__default:", "")
      # Don't prepend empty strings to the path list
      if extrapaths != "":
          path = extrapaths.split(":") + path
      # The ":" ensures we have an 'empty' override
      overrides = (":" + (d.getVar("FILESOVERRIDES") or "")).split(
  ":")
      overrides.reverse()
      for o in overrides:
          for p in path:
              if p != "":
                  filespath.append(os.path.join(p, o))
      return ":".join(filespath)
  ...
  ```

- Biến `FILESOVERRIDES` là một danh sách colon-separated để chỉ định một tập con của `OVERRIDES` được Yocto build system dùng để tạo `FILESPATH`, mặc định là

  ```
  FILESOVERRIDES = "${TRANSLATED_TARGET_ARCH}:${MACHINEOVERRIDES}:$

  {DISTROOVERRIDES}"
  ```

Tuy nhiên, có hai lưu ý quan trọng về các biến này cần xét đến:

1) Chúng ta phải tránh hand-edit biến `FILESPATH` cũng như biến `FILESOVERRIDES`; nếu muốn `bitbake` tìm trong các thư mục khác ngoài thư mục mặc định, chúng ta có thể mở rộng biến `FILESPATH` bằng biến `FILESEXTRAPATHS`.

2) Hãy lưu ý rằng các thư mục `FILESPATH` mặc định không ánh xạ tới các thư mục trong layer tùy biến nơi các append file (`.bbappend`) được dùng. Một lần nữa, nếu muốn `bitbake` tìm thấy các patch hoặc file nằm cùng các append file của mình, chúng ta lại cần dùng biến `FILESEXTRAPATHS`.

Như bạn đọc có thể hình dung, `FILESEXTRAPATHS` là một biến được dùng rộng rãi trong nhiều recipe và đặc biệt là trong nhiều append file! Nó là một danh sách colon-separated các đường dẫn được dùng để mở rộng search path, và best practice quy định rằng chúng ta nên dùng biến `FILESEXTRAPATHS` từ bên trong một file `.bbappend` như sau:

```
FILESEXTRAPATHS:prepend := "${THISDIR}/${PN}:"
```

Trong ví dụ trên, `bitbake` trước tiên tìm file trong một thư mục có cùng tên với append file tương ứng. Thật vậy, `THISDIR` là thư mục chứa file mà `bitbake` hiện đang parse, còn `PN` là tên file của recipe (xem Mục 6.1 để biết thêm thông tin về biến `PN`).

Một ví dụ thực tế thú vị nằm trong layer `meta-engicam`, về package psplash:

```
$ tree meta-engicam-nxp/recipes-core/psplash
meta-engicam-nxp/recipes-core/psplash
├── files
│   └── psplash-poky-img.h
└── psplash_git.bbappend

1 directory, 2 files
```

Trong append file, chúng ta chỉ có thiết lập sau:

```
$ cat meta-engicam-nxp/recipes-core/psplash/psplash_git.bbappend
FILESEXTRAPATHS:prepend := "${THISDIR}/files:"
```

Bằng cách này, chúng ta có thể chỉ định splash image tùy biến trong file `psplash-poky-img.h`, file này sẽ ghi đè file mặc định trong khi compile package.

Lưu ý rằng khi mở rộng `FILESEXTRAPATHS`, chúng ta phải chắc chắn dùng toán tử expansion tức thì (`:=`) để `bitbake` đánh giá `THISDIR` vào thời điểm gặp directive, chứ không phải vào một thời điểm nào đó sau này, khi việc expansion có thể cho ra một thư mục không chứa các file chúng ta cần. Hơn nữa, chúng ta phải đưa vào ký tự dấu hai chấm ngăn cách (`:`) ở cuối khi prepend, điều này là cần thiết vì chúng ta đang chỉ dẫn `bitbake` mở rộng đường dẫn bằng cách prepend các thư mục vào search path (tương tự như làm với biến `PATH` của Bash).

Một cách dùng khác của `FILESEXTRAPATHS` là

```
FILESEXTRAPATHS:prepend := "path_1:path_2:path_3:"
```

Để thêm nhiều đường dẫn hơn hoặc, như trong ví dụ cuối này, để mở rộng search path bằng một override MACHINE-specific:

```
FILESEXTRAPATHS:prepend:mach_foo := "${THISDIR}/${PN}:"
```

Tuy nhiên, câu lệnh trước đó thường không được dùng cho machine mà cho BSP, như được làm trong file `.bbappend` của package `wpa-supplicant` như dưới đây:

```
$ cat meta-imx/meta-bsp/recipes-connectivity/wpa-supplicant/wpa-supplica
nt_%.bbappend
FILESEXTRAPATHS:prepend:imx-nxp-bsp := "${THISDIR}/${PN}:"

DEPENDS += "readline"
```

Trong ví dụ này, mọi machine tương thích với `imx-nxp-bsp` sẽ áp dụng prepend (xem ở Mục 11.3 cách dùng kỹ thuật này để prepend đường dẫn trong các file `.bbappend`, sẽ được dùng cho các ví dụ thực tế).

## 5.4 Include, require và inherit một file (Including, Requiring, and Inheriting a File)

Trong các chương trước, chúng ta đã thấy rằng trong một số file recipe hoặc file cấu hình có một số đoạn code như dưới đây:

```
inherit cmake pkgconfig
```

hoặc như dưới đây:

```
require conf/machine/include/imx-base.inc
```

Lý do là BitBake cho phép các file này dùng chung chức năng hoặc thiết lập thông qua việc đưa vào các class file (`.bbclass`) hoặc include file (`.inc`). Ví dụ, ở trên, chúng ta báo cho chương trình `bitbake` biết rằng recipe của mình sẽ dùng các công cụ CMake và pkg-config để compile code. Khi đó nó phải đọc các file `cmake.bbclass` và `pkgconfig.bbclass`, nơi chứa phần hỗ trợ cho các công cụ đó. Trong ví dụ thứ hai, chúng ta báo cho `bitbake` đọc file `conf/machine/include/imx-base.inc` và xem nội dung của nó như thể được viết trong file gọi nó (và tạo ra lỗi nếu file không tồn tại).

Mục này trình bày các cơ chế mà BitBake cung cấp để cho phép chúng ta dùng chung chức năng giữa các recipe và file cấu hình. Cụ thể, các cơ chế bao gồm các directive `include`, `inherit`, `INHERIT` và `require`.

> Lưu ý rằng BitBake dùng biến `BBPATH` để tìm các include file và class file, sau đó nó tìm trong thư mục hiện tại. Hành vi này, cũng như với `FILESEXTRAPATHS`, hoạt động tương tự như với biến `PATH` của Bash.

### 5.4.1 Các directive include và require (The include and require Directives)

Directive này, giống như `#include` của C, khiến `bitbake` chèn file được chỉ định vào vị trí đó. Đường dẫn được chỉ định trên dòng include là đường dẫn tương đối, và BitBake tìm file đầu tiên mà nó có thể tìm thấy trong `BBPATH` hoặc thư mục hiện tại.

Về directive `require`, chúng ta có thể nói rằng nó hoạt động chính xác như `include`, nhưng nó tạo ra lỗi khi không tìm thấy file, còn `include` thì không. Do đó, khuyến nghị là nếu file được include được kỳ vọng phải tồn tại, chúng ta nên dùng `require` thay cho directive `include`. Nói đơn giản, chúng ta có thể nói rằng `require` được xử lý ở đầu recipe, vì vậy nó dành cho các phụ thuộc quan trọng. Còn `include` thường được dùng cho các file cấu hình có thể không có sẵn với các bản build khác nhau.

Một cách dùng điển hình là trong file `imx8mp-icore.conf` mà chúng ta đã thấy trong Mục 2.3:

```
$ cat meta-engicam-nxp/conf/machine/imx8mp-icore.conf
#@TYPE: Machine
#@NAME: NXP i.MX 8M Plus i.core
#@SOC: i.MX8MP
#@DESCRIPTION: Machine configuration for Engicam imx8mp-icore SOM
#@MAINTAINER: <support@engicam.com>

require include/imx8mp-engicam.inc
...
```

Làm như vậy, chúng ta có thể chắc chắn rằng khi BitBake parse file, nó cũng sẽ parse include file, nếu không sẽ phát sinh lỗi, ngăn chúng ta có các thiết lập sai cho machine.

### 5.4.2 Directive inherit (The inherit Directive)

Directive `inherit` được dùng để thêm một hoặc nhiều chức năng chứa trong class file mà một recipe cần. Ví dụ, như đã nói, nếu đặt vào file recipe câu lệnh `inherit cmake pkgconfig`, chúng ta báo cho BitBake đọc các file `cmake.bbclass` và `pkgconfig.bbclass`, nơi chứa phần hỗ trợ cho các công cụ CMake và pkg-config.

Lưu ý rằng có một số khác biệt giữa directive này và directive `include` (hoặc `require`):

1) Chúng ta có thể chỉ định nhiều hơn một class file cần kế thừa, và bỏ phần mở rộng `.bbclass` vì nó chỉ áp dụng cho class file.

2) BitBake chỉ hỗ trợ directive này khi được dùng trong recipe (file `.bb`) hoặc class file (file `.bbclass`).

3) BitBake vẫn tìm các file `.bbclass` được kế thừa bằng biến `BBPATH`, nhưng trong thư mục con `classes` của mỗi mục được chỉ định.

4) Chúng ta có thể kế thừa class file có điều kiện bằng cách dùng một biểu thức biến sau câu lệnh `inherit`. Ví dụ:

   ```
   VARNAME = "default_class"
   VARNAME:class_override = "overrided_class"
   inherit ${VARNAME}
   ```

> Lưu ý rằng nếu `VARNAME` không được định nghĩa, directive `inherit` sẽ tạo ra lỗi như dưới đây:
>
> ```
> ERROR: ParseError at /home/giometti/yocto/imx-yocto-bsp/sources/me
> ta-engicam-nxp/recipes-bsp/u-boot-engicam/u-boot-engicam_2022.04.b
> b:25: Could not inherit file classes/${VARNAME}.bbclass
> ERROR: Parsing halted due to errors, see error messages above
> ```

Giờ thì rõ ràng các directive `require` và `include` đã mô tả trước đó là một phương pháp đưa chức năng vào tổng quát hơn so với directive `inherit`. Directive này bị giới hạn chỉ nạp class file và chỉ được dùng trong file recipe hoặc class file. Hai directive tổng quát kia áp dụng được cho mọi loại chức năng hoặc cấu hình dùng chung hay được đóng gói khác không phù hợp với một class file.

Trước khi kết thúc mục này, chúng ta nên lưu ý rằng có thể kế thừa class file có điều kiện không chỉ bằng override mà còn bằng anonymous Python code, như dưới đây:

```
inherit ${@'classname' if condition else ''}
```

Với đoạn code trên, chúng ta yêu cầu BitBake kế thừa class có tên `classname` nếu `condition` là true; thật vậy, nếu biểu thức là false và được đánh giá thành chuỗi rỗng, câu lệnh không gây ra lỗi cú pháp vì nó trở thành một no-op.

Có thể tìm thấy một ví dụ về cách dùng trên trong layer poky, như dưới đây:

```
$ cat poky/meta/recipes-devtools/btrfs-tools/btrfs-tools_5.16.2.bb
...
inherit autotools-brokensep pkgconfig manpages
inherit ${@bb.utils.contains('PACKAGECONFIG', 'python', 'setuptools3-ba
se', '', d)}
...
```

Các class `autotools-brokensep`, `pkgconfig` và `manpages` được kế thừa vô điều kiện, còn class `setuptools3-base` chỉ được kế thừa nếu biến `PACKAGECONFIG` chứa thiết lập `python`.

### 5.4.3 Directive INHERIT (The INHERIT Directive)

Nếu directive `inherit` có chức năng bị giới hạn, thì `INHERIT` còn hạn chế hơn nữa! Thật vậy, nó không phải là phiên bản viết hoa của `inherit`, nó là một biến, và chỉ có thể được dùng để kế thừa một class khi được dùng trong một file cấu hình (`.conf`).

Một cách dùng phổ biến của directive này, ví dụ, là bật build history, tính năng khiến Yocto build system thu thập thông tin output của quá trình build và commit nó dưới dạng một commit duy nhất vào một Git repository. Tính năng này mặc định bị tắt, và để bật nó, chúng ta phải thêm câu lệnh `INHERIT` và đặt biến `BUILDHISTORY_COMMIT` thành `1` ở cuối `conf/local.conf` như dưới đây:

```
INHERIT += "buildhistory"
BUILDHISTORY_COMMIT = "1"
```

> Xem Mục 13.2 để biết thêm thông tin về chủ đề này.

Cũng như `inherit`, nếu muốn dùng directive này để kế thừa nhiều class, chúng ta có thể cung cấp chúng trên cùng một dòng như dưới đây:

```
INHERIT += "class1 class2"
```

## 5.5 Tóm tắt (Summary)

Trong chương này, chúng ta đã thấy BitBake hoạt động thế nào; chúng ta đã xem cách biến có thể được set và unset, hoặc cách chúng có thể được append và prepend. Chúng ta đã tìm hiểu task là gì, BitBake thực thi chúng thế nào và theo thứ tự nào, sau đó đã thấy sức mạnh của cú pháp điều kiện, và đã học về override, được dùng rộng rãi trong recipe và file cấu hình của Yocto Project. Cuối cùng, chúng ta đã học về nhiều directive đưa file vào mà có thể dùng để viết recipe hiệu quả hơn và dễ đọc hơn.

Giờ chúng ta đã sẵn sàng học cách viết recipe của Yocto Project, vì vậy có thể chuyển sang chương tiếp theo.

