<a id="_idParaDest-336"></a>

# Chương 23: Build System (Build Systems)

Với các lập trình viên chúng ta, build một dự án và chạy các thành phần khác nhau của nó là bước đầu tiên trong việc phát triển một tính năng mới hay sửa một bug được báo cáo trong một dự án. Thực tế, điều này không chỉ giới hạn ở C hay C++; gần như mọi dự án có một thành phần được viết bằng một ngôn ngữ lập trình biên dịch, như C, C++, Java hay Go, đều cần được build trước.

Do đó, việc có thể build một dự án phần mềm nhanh chóng và dễ dàng là một nhu cầu cơ bản mà gần như mọi bên làm việc trong pipeline sản xuất phần mềm đều cần, dù họ là developer, tester, integrator, kỹ sư DevOps, hay thậm chí bộ phận hỗ trợ khách hàng.

Hơn thế nữa, khi bạn tham gia một nhóm với tư cách người mới, điều đầu tiên bạn làm là build code base mà bạn sẽ làm việc. Xét tất cả những điều này, rõ ràng là việc đề cập khả năng build một dự án phần mềm là chính đáng, xét tầm quan trọng của nó trong quá trình phát triển phần mềm.

Lập trình viên cần build code base thường xuyên để xem kết quả các thay đổi của họ. Build một dự án chỉ với một vài source file có vẻ dễ dàng và nhanh chóng, nhưng khi số lượng source file tăng lên (và tin tôi đi, điều đó xảy ra), việc build một code base thường xuyên trở thành một trở ngại thực sự cho các tác vụ phát triển. Do đó, một cơ chế phù hợp để build một dự án phần mềm là then chốt.

Người ta từng viết shell script để build một số lượng lớn source file. Dù nó đã hoạt động, việc giữ các script đủ tổng quát để được dùng trong các dự án phần mềm khác nhau tốn rất nhiều công sức và bảo trì. Sau đó, khoảng năm 1976 tại Bell Labs, *build system* đầu tiên (hay ít nhất là một trong những build system sớm nhất), tên là *Make*, đã<a id="_idIndexMarker1703"></a> được phát triển và nó được dùng trong các dự án nội bộ.

Sau đó, Make được dùng trên quy mô lớn trong mọi dự án C và C++, và thậm chí trong các dự án khác mà C/C++ n-ot (không phải) là ngôn ngữ chính.

Trong chương này, chúng ta sẽ nói về các *build system* và *build script generator* được dùng rộng rãi cho các dự án C và C++. Trong chương này, chúng ta sẽ nói về các chủ đề sau:

- Trước tiên, chúng ta sẽ xem build system là gì và chúng tốt cho việc gì.
- Sau đó, chúng ta sẽ trình bày Make là gì và Makefile nên được dùng như thế nào.
- CMake là chủ đề tiếp theo. Bạn sẽ đọc về build script generator và bạn sẽ học cách viết các file `CMakeLists.txt` đơn giản.
- Chúng ta sẽ xem Ninja là gì và nó khác với Make như thế nào.
- Chương cũng sẽ khám phá CMake nên được dùng như thế nào để sinh ra các build script Ninja.
- Chúng ta sẽ đi sâu vào Bazel là gì và nó nên được dùng như thế nào. Bạn sẽ học về các file `WORKSPACE` và `BUILD` và chúng nên được viết như thế nào trong một trường hợp sử dụng đơn giản.
- Cuối cùng, bạn sẽ được cung cấp các link tới một số bản so sánh already-published (đã được công bố) về các build system khác nhau.

Lưu ý rằng các công cụ build được dùng trong chương này đều cần được cài đặt trên hệ thống của bạn từ trước. Các tài nguyên và tài liệu phù hợp hẳn có sẵn trên internet, vì những công cụ build này đang được dùng trên quy mô lớn.

Trong phần đầu tiên, chúng ta sẽ khám phá build system thực sự là gì.

<a id="_idParaDest-337"></a>

## Build system là gì?

Nói đơn giản, một build system là <a id="_idIndexMarker1704"></a>một tập chương trình và các file văn bản đồng hành cùng nhau build một code base phần mềm. Ngày nay, mỗi ngôn ngữ lập trình có tập build system riêng của nó. Chẳng hạn, trong Java, bạn có *Ant*, *Maven*, *Gradle*, v.v. Nhưng "build một code base" có nghĩa là gì?

Build một code base có nghĩa là tạo ra các sản phẩm cuối cùng từ các source file. Ví dụ, đối với một code base C, các sản phẩm cuối cùng có thể là executable file, shared object file hay static library, và mục tiêu của một build system C là tạo ra những sản phẩm này từ các source file C có trong code base. Chi tiết của các thao tác cần thiết cho mục đích này phụ thuộc rất nhiều vào ngôn ngữ lập trình hay các ngôn ngữ có trong code base.

Nhiều build system hiện đại, đặc biệt trong các dự án được viết bằng một *JVM language* như Java hay Scala, cung cấp thêm một dịch vụ.

Chúng <a id="_idIndexMarker1705"></a>cũng thực hiện *dependency management* (quản lý phụ thuộc). Điều này có nghĩa là build system phát hiện các phụ thuộc của code base đích, và nó tải về tất cả chúng và dùng các artifact đã tải về trong *build process*. Điều này rất tiện lợi, đặc biệt nếu có rất nhiều phụ thuộc trong một dự án, điều thường thấy trong các code base lớn.

Chẳng hạn, *Maven* là một trong những <a id="_idIndexMarker1706"></a>build system nổi tiếng nhất cho các dự án Java; nó dùng các file XML và hỗ trợ dependency<a id="_idIndexMarker1707"></a> management. Không may là chúng ta không có công cụ tuyệt vời nào cho dependency management trong các dự án C/C++. Tại sao chúng ta chưa có các build system Maven-like cho các dự án C/C++ là một vấn đề còn tranh cãi, nhưng việc chúng chưa được phát triển có thể là dấu hiệu cho thấy chúng ta không cần chúng.

Một khía cạnh khác của một build system là khả năng build một dự án khổng lồ với nhiều module bên trong. Dĩ nhiên, điều này khả thi bằng shell script và viết các *Makefile* đệ quy đi qua mọi mức module, nhưng chúng ta đang nói về sự hỗ trợ nội tại cho một nhu cầu như vậy. Không may là Make không cung cấp điều này một cách nội tại. Tuy nhiên, một công cụ build nổi tiếng khác, CMake, có cung cấp điều đó. Chúng ta sẽ nói thêm về điều này trong phần dành cho CMake.

Tính đến ngày nay, nhiều dự án vẫn dùng Make làm build system mặc định, tuy nhiên, thông qua việc dùng CMake. Thật vậy, đây là một trong những điểm khiến CMake rất quan trọng, và bạn cần học nó trước khi tham gia một dự án C/C++. Lưu ý rằng CMake không chỉ giới hạn ở C và C++ và có thể được dùng trong các dự án dùng nhiều ngôn ngữ lập trình khác nhau.

Trong phần sau, chúng ta sẽ thảo luận build system Make và cách nó build một dự án. Chúng tôi sẽ đưa ra một ví dụ về một dự án C multi-module và dùng nó trong suốt chương này để minh họa các build system khác nhau có thể được dùng như thế nào để build dự án này.

<a id="_idParaDest-338"></a>

## Make

Build system Make <a id="_idIndexMarker1708"></a>dùng Makefile. Một Makefile là<a id="_idIndexMarker1709"></a> một file văn bản có tên "Makefile" (chính xác như vậy và không có phần mở rộng nào) trong một thư mục source, và nó <a id="_idIndexMarker1710"></a>chứa các *build target* và các lệnh cho Make biết cách build code base hiện tại.

Hãy bắt đầu với một dự án C multi-module đơn giản và trang bị Make cho nó. Shell box sau cho thấy các file và thư mục có trong dự án. Như bạn có thể thấy, nó có một module tên là `calc`, và một module khác tên là `exec` đang dùng nó.

Output của module `calc` sẽ là một static object library, và output của module `exec` là một executable file:

```
$ tree ex23_1
ex23_1/
├── calc
│   ├── add.c
│   ├── calc.h
│   ├── multiply.c
│   └── subtract.c
└── exec
    └── main.c
2 directories, 5 files
$
```

*Shell Box 23-1: Các file và thư mục có trong dự án đích*

Nếu chúng ta muốn build<a id="_idIndexMarker1711"></a> dự án trên mà không dùng build system, chúng ta phải chạy các lệnh sau để build các sản phẩm của nó. Lưu ý rằng chúng ta đã dùng Linux làm nền tảng đích cho dự án này:

```
$ mkdir -p out
$ gcc -c calc/add.c -o out/add.o
$ gcc -c calc/multiply.c -o out/multiply.o
$ gcc -c calc/subtract.c -o out/subtract.o
$ ar rcs out/libcalc.a out/add.o out/multiply.o out/subtract.o
$ gcc -c -Icalc exec/main.c -o out/main.o
$ gcc -Lout out/main.o -lcalc -o out/ex23_1.out
$
```

*Shell Box 23-2: Build dự án đích*

Như bạn có thể thấy, dự án có hai artifact: một static library, `libcalc.a`, và một executable file, `ex23_1.out`. Nếu bạn không biết cách biên dịch một dự án C, hay các lệnh trên lạ lẫm với bạn, hãy đọc *Chương 2*, *Biên dịch và Liên kết (Compilation and Linking)*, và *Chương 3*, *Object File*.

Lệnh đầu tiên trong *Shell Box 23-2* tạo một thư mục tên là out. Thư mục này được dự định chứa mọi relocatable object file và các sản phẩm cuối cùng.

Sau đó, ba lệnh tiếp theo dùng `gcc` để biên dịch các source file trong thư mục `calc` và tạo ra các relocatable object file tương ứng của chúng. Sau đó, những object file này được dùng trong lệnh thứ năm để tạo ra static library `libcalc.a`.

Cuối cùng, hai lệnh cuối biên dịch file `main.c` từ thư mục exec và cuối cùng link nó cùng với `libcalc.a` để tạo ra executable file cuối cùng, `ex23_1.out`. Lưu ý rằng mọi file này đều được đặt bên trong thư mục out.

Các lệnh trên có thể tăng lên khi số lượng source file tăng lên. Chúng ta có thể duy trì các lệnh<a id="_idIndexMarker1712"></a> trên trong một shell script file gọi là một *build script*, nhưng có một số khía cạnh mà chúng ta nên suy nghĩ trước:

- Liệu chúng ta có chạy cùng các<a id="_idIndexMarker1713"></a> lệnh trên mọi nền tảng không? Có một số chi tiết khác nhau ở các compiler và môi trường khác nhau; do đó, các lệnh có thể khác nhau từ hệ thống này sang hệ thống khác. Trong kịch bản đơn giản nhất, chúng ta nên duy trì các shell script khác nhau cho các nền tảng khác nhau. Khi đó, điều đó thực chất có nghĩa là script của chúng ta không *portable*.
- Điều gì xảy ra khi một thư mục mới hay một module mới được thêm vào dự án? Chúng ta có cần thay đổi build script không?
- Điều gì xảy ra với build script nếu chúng ta thêm các source file mới?
- Điều gì xảy ra nếu chúng ta cần một sản phẩm mới, như một library mới hay một executable file mới?

Một build system tốt <a id="_idIndexMarker1714"></a>nên xử lý mọi hay hầu hết các tình huống đã nêu ở trên. Hãy trình bày Makefile đầu tiên của chúng ta. File này sẽ build dự án trên và tạo ra các sản phẩm của nó. Mọi file được viết cho các build system, trong phần này và các phần sau, đều có thể được dùng để build dự án cụ thể này và không gì hơn.

Code box sau cho thấy nội dung của Makefile đơn giản nhất mà chúng ta có thể viết cho dự án trên:

```
build:
    mkdir -p out
    gcc -c calc/add.c -o out/add.o
    gcc -c calc/multiply.c -o out/multiply.o
    gcc -c calc/subtract.c -o out/subtract.o
    ar rcs out/libcalc.a out/add.o out/multiply.o out/subtract.o
    gcc -c -Icalc exec/main.c -o out/main.o
    gcc -Lout -lcalc out/main.o -o out/ex23_1.out
clean:
    rm -rfv out
```

*Code Box 23-1 [Makefile-very-simple]: Một Makefile rất đơn giản được viết cho dự án đích*

Makefile trên chứa hai target: `build` và `clean`. Target có một tập lệnh, nên được thực thi khi target được gọi. Tập lệnh này được gọi là *recipe* (công thức) của target.

Để chạy các lệnh trong một Makefile, chúng ta cần dùng lệnh `make`. Bạn cần nói với lệnh `make`<a id="_idIndexMarker1715"></a> target nào cần chạy, nhưng nếu bạn để trống, make luôn thực thi target đầu tiên.

Để build dự án trên bằng Makefile, chỉ cần sao chép các dòng từ *Code Box 23-1* vào một file tên là `Makefile` và đặt nó ở thư mục gốc của dự án. Nội dung của thư mục dự án nên tương tự những gì chúng ta thấy trong shell box sau:

```
$ tree ex23_1
ex23_1/
├── Makefile
├── calc
│   ├── add.c
│   ├── calc.h
│   ├── multiply.c
│   └── subtract.c
└── exec
    └── main.c
2 directories, 6 files
$
```

*Shell Box 23-3: Các file và thư mục có trong dự án đích sau khi thêm Makefile*

Sau đó, bạn chỉ cần chạy lệnh make. Chương trình `make` tự động tìm file `Makefile` trong thư mục hiện tại và thực thi target đầu tiên của nó. Nếu chúng ta muốn chạy target `clean`, chúng ta sẽ phải dùng lệnh `make clean`. Target `clean` có thể được dùng để xóa các file được tạo ra trong quá trình build, và bằng cách này, chúng ta có thể bắt đầu một bản build mới từ đầu.

Shell box sau cho thấy kết quả của việc chạy lệnh `make`:

```
$ cd ex23_1
$ make
mkdir -p out
gcc -c -Icalc exec/main.c -o out/main.o
gcc -c calc/add.c -o out/add.o
gcc -c calc/multiply.c -o out/multiply.o
gcc -c calc/subtract.c -o out/subtract.o
ar rcs out/libcalc.a out/add.o out/multiply.o out/subtract.o
gcc -Lout -lcalc out/main.o -o out/ex23_1.out
$
```

*Shell Box 23-4: Build dự án đích bằng Makefile rất đơn giản*

Bạn có thể hỏi, "Khác biệt giữa một build script (được viết bằng shell script) và Makefile trên là gì?" Bạn hỏi điều này là đúng! Makefile trên không thể hiện cách mà chúng ta<a id="_idIndexMarker1716"></a> thường dùng Make để build các dự án của mình.

Thực tế, Makefile trên là một cách dùng ngây thơ build system Make, và nó không tận dụng các tính năng mà chúng ta biết Make có thể cung cấp.

Nói cách khác, cho đến giờ, một Makefile rất giống một shell script, và chúng ta vẫn có thể chỉ dùng shell scripting (dù, dĩ nhiên, điều đó sẽ tốn nhiều công sức hơn). Giờ chúng ta đi đến điểm mà Makefile trở nên thú vị và thực sự khác biệt.

Makefile sau vẫn đơn giản, nhưng nó giới thiệu thêm các khía cạnh của build system Make mà chúng ta quan tâm:

```
CC = gcc
build: prereq out/main.o out/libcalc.a
    ${CC} -Lout -lcalc out/main.o -o out/ex23_1.out
prereq:
    mkdir -p out
out/libcalc.a: out/add.o out/multiply.o out/subtract.o
    ar rcs out/libcalc.a out/add.o out/multiply.o out/subtract.o
out/main.o: exec/main.c calc/calc.h
    ${CC} -c -Icalc exec/main.c -o out/main.o
out/add.o: calc/add.c calc/calc.h
    ${CC} -c calc/add.c -o out/add.o
out/subtract.o: calc/subtract.c calc/calc.h
    ${CC} -c calc/subtract.c -o out/subtract.o
out/multiply.o: calc/multiply.c calc/calc.h
    ${CC} -c calc/multiply.c -o out/multiply.o
clean: out
    rm -rf out
```

*Code Box 23-2 [Makefile-simple]: Một Makefile mới, nhưng vẫn đơn giản, được viết cho dự án đích*

Như bạn có thể thấy, chúng ta có thể khai báo một biến trong một Makefile và dùng nó ở nhiều chỗ khác nhau, giống như chúng ta đã khai báo CC trong code box trên. Biến, cùng với điều kiện trong một Makefile, cho phép chúng ta viết các hướng dẫn build linh hoạt với ít công sức hơn so với việc viết một shell script đạt được cùng sự linh hoạt.

Một tính năng tuyệt vời khác của Makefile là khả năng include các Makefile khác. Bằng cách này, bạn có thể tận dụng các Makefile hiện có mà bạn đã viết trong các dự án trước.

Như bạn có thể thấy trong <a id="_idIndexMarker1717"></a>Makefile trên, mỗi Makefile có thể có nhiều target. Target bắt đầu ở đầu một dòng và kết thúc bằng một dấu hai chấm, ":". Một ký tự tab *phải* được dùng để thụt lề mọi instruction bên trong một target (recipe) để chương trình `make` nhận ra chúng. Đây là điều tuyệt vời về target: chúng có thể phụ thuộc vào các target khác.

Ví dụ, trong Makefile trên, target `build` phụ thuộc vào các target `prereq`, `out /main.o` và `out/libcalc.a`. Khi đó, bất cứ khi nào target `build` được gọi, trước tiên, các target mà nó phụ thuộc sẽ được kiểm tra, và nếu chúng chưa được tạo ra, thì những target đó sẽ được gọi trước. Giờ, nếu bạn chú ý hơn tới các target trong Makefile trên, bạn hẳn có thể thấy luồng thực thi giữa các target.

Đây chắc chắn là điều mà chúng ta thiếu trong một shell script; rất nhiều cơ chế luồng điều khiển (vòng lặp, điều kiện, v.v.) sẽ cần thiết để làm một shell script hoạt động như thế này. Makefile ít dài dòng hơn và mang tính khai báo hơn, và đó là lý do tại sao chúng ta dùng chúng. Chúng ta chỉ muốn khai báo những gì cần được build, và chúng ta không cần biết về con đường mà nó đi qua để được build. Dù điều này không hoàn toàn đạt được bằng việc dùng Make, nó là một sự khởi đầu để có một build system đầy đủ tính năng.

Một tính năng khác của các target trong một Makefile là nếu chúng đang tham chiếu tới một file hay một thư mục trên đĩa, như `out/multiply.o`, chương trình `make` kiểm tra các sửa đổi gần đây đối với file hay thư mục đó, và nếu không có sửa đổi nào kể từ lần build trước, nó bỏ qua target đó. Điều này cũng đúng với phụ thuộc của `out/multiply.o`, vốn là `calc/multiply.c`. Nếu source file `calc/multiply.c` chưa bị thay đổi gần đây và nó đã được biên dịch trước đó, việc biên dịch lại nó là vô nghĩa. Đây lại là một tính năng mà bạn không thể đơn giản có được bằng việc viết shell script.

Nhờ có tính năng này, bạn chỉ biên dịch các source file đã bị sửa đổi từ lần build trước, và điều này giảm một lượng biên dịch khổng lồ cho các source chưa bị thay đổi kể từ lần build trước. Dĩ nhiên, tính năng này sẽ hoạt động sau khi toàn bộ dự án đã được biên dịch ít nhất một lần. Sau đó, chỉ các source bị sửa đổi mới kích hoạt một lần biên dịch hay link.

Một điểm then chốt khác trong Makefile trên là target `calc/calc.h`. Như bạn có thể thấy, có nhiều<a id="_idIndexMarker1718"></a> target, hầu hết là source file, phụ thuộc vào header file `calc/calc.h`. Do đó, dựa trên chức năng chúng tôi đã giải thích trước đây, một sửa đổi đơn giản đối với header file có thể kích hoạt nhiều lần biên dịch cho các source file phụ thuộc vào header file đó.

Đây chính xác là lý do tại sao chúng ta cố chỉ include các header file cần thiết trong một source file, và dùng forward declaration ở bất cứ đâu có thể thay vì include. Forward declaration thường không được thực hiện trong các source file vì ở đó, chúng ta thường cần truy cập định nghĩa thực sự của một structure hay một hàm, nhưng nó có thể dễ dàng được thực hiện trong các header file.

Có nhiều phụ thuộc giữa các header file thường dẫn đến các thảm họa build. Ngay cả một sửa đổi nhỏ đối với một header file được include bởi nhiều header file khác, và rốt cuộc được include bởi nhiều source file, cũng có thể kích hoạt việc build toàn bộ dự án hay một thứ gì đó ở quy mô đó. Điều này thực chất sẽ làm giảm chất lượng phát triển cũng như khiến developer phải chờ hàng phút giữa các lần build.

Makefile trên vẫn quá dài dòng. Chúng ta phải thay đổi các target bất cứ khi nào chúng ta thêm một source file mới. Chúng ta kỳ vọng thay đổi Makefile khi thêm một source file mới, nhưng không phải bằng việc thêm một target mới và thay đổi cấu trúc tổng thể của một Makefile. Điều này thực chất ngăn chúng ta tái sử dụng cùng Makefile trong một dự án khác tương tự dự án hiện tại.

Hơn thế nữa, nhiều target theo cùng một mẫu, và chúng ta có thể tận dụng tính năng *pattern matching* có sẵn trong <a id="_idIndexMarker1719"></a>Make để giảm số lượng target và viết ít code hơn trong một Makefile. Đây là một siêu tính năng khác của Make mà hiệu quả của nó bạn không thể dễ dàng đạt được bằng việc viết shell script.

Makefile sau sẽ là Makefile cuối cùng của chúng ta cho dự án này, nhưng vẫn không phải là Makefile tốt nhất mà một chuyên gia Make có thể viết:

```
BUILD_DIR = out
OBJ = ${BUILD_DIR}/calc/add.o \
                ${BUILD_DIR}/calc/subtract.o \
                ${BUILD_DIR}/calc/multiply.o \
                ${BUILD_DIR}/exec/main.o
CC = gcc
HEADER_DIRS = -Icalc
LIBCALCNAME = calc
LIBCALC = ${BUILD_DIR}/lib${LIBCALCNAME}.a
EXEC = ${BUILD_DIR}/ex23_1.out
build: prereq ${BUILD_DIR}/exec/main.o ${LIBCALC}
    ${CC} -L${BUILD_DIR} -l${LIBCALCNAME} ${BUILD_DIR}/exec/main.o -o ${EXEC}
prereq:
    mkdir -p ${BUILD_DIR}
    mkdir -p ${BUILD_DIR}/calc
    mkdir -p ${BUILD_DIR}/exec
${LIBCALC}: ${OBJ}
    ar rcs ${LIBCALC} ${OBJ}
${BUILD_DIR}/calc/%.o: calc/%.c
    ${CC} -c ${HEADER_DIRS} $< -o $@
${BUILD_DIR}/exec/%.o: exec/%.c
    ${CC} -c ${HEADER_DIRS} $< -o $@
clean: ${BUILD_DIR}
    rm -rf ${BUILD_DIR}
```

*Code Box 23-3 [Makefile-by-pattern]: Một Makefile mới được viết cho dự án đích dùng pattern matching*

Makefile<a id="_idIndexMarker1720"></a> trên dùng pattern matching trong các target của nó. Biến `OBJ` giữ một danh sách các relocatable object file kỳ vọng, và nó được dùng ở mọi chỗ khác khi cần một danh sách object file.

Đây không phải là một cuốn sách về cách pattern matching của Make hoạt động, nhưng bạn có thể thấy rằng có một loạt ký tự đại diện, như `%`, `$<` và `$@`, được dùng trong các mẫu.

Chạy Makefile trên sẽ tạo ra cùng kết quả như các Makefile khác, nhưng chúng ta có thể tận dụng các tính năng hay khác nhau mà Make cung cấp, và rốt cuộc có một Make script có thể tái sử dụng và bảo trì được.

Shell box sau cho thấy cách chạy Makefile trên và output là gì:

```
$ make
mkdir -p out
mkdir -p out/calc
mkdir -p out/exec
gcc -c -Icalc exec/main.c -o out/exec/main.o
gcc -c -Icalc calc/add.c -o out/calc/add.o
gcc -c -Icalc calc/subtract.c -o out/calc/subtract.o
gcc -c -Icalc calc/multiply.c -o out/calc/multiply.o
ar rcs out/libcalc.a out/calc/add.o out/calc/subtract.o out/calc/multiply.o out/exec/main.o
gcc -Lout -lcalc out/exec/main.o -o out/ex23_1.out
$
```

*Shell Box 23-5: Build dự án đích bằng Makefile cuối cùng*

Trong các phần<a id="_idIndexMarker1721"></a> sau, chúng ta sẽ nói về CMake, một công cụ tuyệt vời để sinh ra các Makefile thực sự. Thực tế, một thời gian sau khi Make trở nên phổ biến, một thế hệ công cụ build mới đã xuất hiện, *build script generator*, vốn <a id="_idIndexMarker1722"></a>có thể sinh ra Makefile hay script từ các build system khác dựa trên một mô tả cho trước. CMake là một trong số đó, và nó có lẽ là công cụ phổ biến nhất.

> **Lưu ý**:
>
> Đây là link chính để<a id="_idIndexMarker1723"></a> đọc thêm về GNU Make, vốn là bản triển khai của Make được tạo ra [for the GNU project: https://www.gnu.org/software/make/manual](https://www.gnu.org/software/make/manual/html_node/index.html)/html_node/index.html (cho dự án GNU).

<a id="_idParaDest-339"></a>

## CMake – không phải là một build system!

CMake là một build script <a id="_idIndexMarker1724"></a>generator và đóng vai trò như một generator cho các build system khác như Make và Ninja. Việc viết các Makefile hiệu quả và cross-platform là một công việc tẻ nhạt và phức tạp. CMake hay các công cụ<a id="_idIndexMarker1725"></a> tương tự, như *Autotools*, được phát triển để cung cấp các build script cross-platform được tinh chỉnh kỹ như Makefile hay các build file Ninja. Lưu ý rằng Ninja là một build system khác và sẽ được giới thiệu trong phần tiếp theo.

> **Lưu ý**:
>
> Bạn có thể đọc thêm[ <a id="_idIndexMarker1726"></a>about Autotools here: https://www.gnu.org/software/automake/manual/html_node/Aut](https://www.gnu.org/software/automake/manual/html_node/Autotools-Introduction.html)otools-Introduction.html (về Autotools tại đây).

Dependency <a id="_idIndexMarker1727"></a>management cũng quan trọng, điều không được Makefile cung cấp. Những công cụ generator này cũng có thể kiểm tra các phụ thuộc đã cài đặt và sẽ không sinh ra các build script nếu một phụ thuộc cần thiết bị thiếu trong hệ thống. Kiểm tra các compiler và phiên bản của chúng, và tìm vị trí của chúng, các tính năng được hỗ trợ của chúng, v.v. đều là một phần những gì các công cụ này làm trước khi sinh ra một build script.

Giống như Make, vốn tìm một file tên là `Makefile`, CMake tìm một file tên là `CMakeLists.txt`. Bất cứ nơi nào bạn tìm thấy file này trong một dự án, điều đó có nghĩa là CMake có thể được dùng để sinh ra các Makefile phù hợp. May mắn thay, và không giống Make, CMake hỗ trợ các module lồng nhau. Nói cách khác, bạn có thể có nhiều `CMakeLists.txt` trong các thư mục khác như một phần dự án của bạn <a id="_idIndexMarker1728"></a>và tất cả chúng đều có thể được tìm thấy và các Makefile phù hợp sẽ được sinh ra cho tất cả chúng, chỉ bằng cách chạy CMake ở thư mục gốc của dự án.

Hãy tiếp tục phần này bằng việc thêm hỗ trợ CMake vào dự án ví dụ của chúng ta. Cho mục đích này, chúng ta thêm ba file `CMakeLists.txt`. Tiếp theo, bạn có thể thấy hệ thống phân cấp của dự án sau khi thêm những file này:

```
$ tree ex23_1
ex23_1/
├── CMakeLists.txt
├── calc
│   ├── CMakeLists.txt
│   ├── add.c
│   ├── calc.h
│   ├── multiply.c
│   └── subtract.c
└── exec
    ├── CMakeLists.txt
    └── main.c
2 directories, 8 files
$
```

*Shell Box 23-6: Hệ thống phân cấp dự án sau khi đưa vào ba file CMakeLists.txt*

Như bạn có thể thấy, chúng ta có ba file `CMakeLists.txt`: một ở thư mục gốc, một ở thư mục `calc`, và file còn lại ở thư mục `exec`. Code box sau cho thấy nội dung của file `CMakeLists.txt` có ở thư mục gốc. Như bạn có thể thấy, nó thêm các thư mục con `calc` và `exec`.

Những thư mục con này phải có một file `CMakeLists.txt` bên trong và, thực tế, chúng có, theo thiết lập của chúng ta:

```
cmake_minimum_required(VERSION 3.8)
include_directories(calc)
add_subdirectory(calc)
add_subdirectory(exec)
```

*Code Box 23-4 [CMakeLists.txt]: File CMakeLists.txt có ở thư mục gốc của dự án*

File CMake trên thêm thư mục `calc` vào các thư mục `include` sẽ được compiler C dùng <a id="_idIndexMarker1729"></a>khi biên dịch các source file. Như chúng tôi đã nói trước đây, nó cũng thêm hai thư mục con: `calc` và `exec`. Những thư mục này có các file `CMakeLists.txt` riêng giải thích cách biên dịch nội dung của chúng. Sau đây là file `CMakeLists.txt` có ở thư mục `calc`:

```
add_library(calc STATIC
  add.c
  subtract.c
  multiply.c
)
```

*Code Box 23-5 [calc/CMakeLists.txt]: File CMakeLists.txt có ở thư mục calc*

Như bạn có thể thấy, nó chỉ là một *target declaration* (khai báo target) đơn giản cho target `calc`, nghĩa là chúng ta cần có một static library tên là `calc` (thực ra là `libcalc.a` sau khi build) nên chứa các relocatable object file tương ứng cho các source file `add.c`, `subtract.c` và `multiply.c`. Lưu ý rằng các target CMake thường biểu diễn các sản phẩm cuối cùng của một code base. Do đó, riêng đối với module `calc`, chúng ta chỉ có một sản phẩm, đó là một static library.

Như bạn có thể thấy, không có gì khác được chỉ định cho target `calc`. Chẳng hạn, chúng ta đã không chỉ định phần mở rộng của static library hay tên file của library (dù chúng ta có thể). Mọi cấu hình khác cần thiết để build module này hoặc được kế thừa từ file `CMakeLists.txt` cha hoặc đã được lấy từ cấu hình mặc định của chính CMake.

Ví dụ, chúng ta biết rằng phần mở rộng cho shared object file khác nhau trên Linux và macOS. Do đó, nếu target là một shared library, không cần chỉ định phần mở rộng như một phần của khai báo target. CMake có thể xử lý chính khác biệt platform-specific (đặc thù nền tảng) này, và shared object file cuối cùng sẽ có phần mở rộng đúng dựa trên nền tảng mà nó đang được build trên đó.

File `CMakeLists.txt` sau là file có ở thư mục `exec`:

```
add_executable(ex23_1.out
  main.c
)
target_link_libraries(ex23_1.out
  calc
)
```

*Code Box 23-6 [exec/CMakeLists.txt]: File CMakeLists.txt có ở thư mục exec*

Như bạn có thể thấy, target được khai báo trong `CMakeLists.txt` trên là một executable, và nó nên được link với target `calc` đã được khai báo trong một file `CMakeLists.txt` khác.

Điều này thực sự cho bạn sức mạnh để tạo các library ở một góc của dự án và dùng chúng ở một góc khác chỉ bằng cách viết một số directive.

Giờ là lúc cho<a id="_idIndexMarker1730"></a> bạn thấy cách sinh ra một Makefile dựa trên file `CMakeLists.txt` có ở thư mục gốc. Lưu ý rằng chúng ta làm điều này trong một thư mục riêng tên là `build` để giữ các relocatable object file và object file cuối cùng thu được tách biệt khỏi các source thực sự.

Nếu bạn đang <a id="_idIndexMarker1731"></a>dùng một hệ thống **source control management** (**SCM**) như *git*, bạn có thể bỏ qua thư mục `build` vì nó nên được sinh ra trên mỗi nền tảng riêng rẽ. Các file duy nhất quan trọng là các file `CMakeLists.txt`, vốn luôn được giữ trong một source control repository.

Shell box sau minh họa cách sinh ra các build script (trong trường hợp này là một Makefile) cho file `CMakeLists.txt` có ở thư mục gốc:

```
$ cd ex23_1
$ mkdir -p build
$ cd build
$ rm -rfv *
...
$ cmake ..
-- The C compiler identification is GNU 7.4.0
-- The CXX compiler identification is GNU 7.4.0
-- Check for working C compiler: /usr/bin/cc
-- Check for working C compiler: /usr/bin/cc -- works
-- Detecting C compiler ABI info
-- Detecting C compiler ABI info - done
-- Detecting C compile features
-- Detecting C compile features - done
-- Check for working CXX compiler: /usr/bin/c++
-- Check for working CXX compiler: /usr/bin/c++ -- works
-- Detecting CXX compiler ABI info
-- Detecting CXX compiler ABI info - done
-- Detecting CXX compile features
-- Detecting CXX compile features - done
-- Configuring done
-- Generating done
-- Build files have been written to: .../extreme_c/ch23/ex23_1/build
$
```

*Shell Box 23-7: Sinh ra một Makefile dựa trên file CMakeLists.txt có ở thư mục gốc*

Như bạn có thể thấy từ<a id="_idIndexMarker1732"></a> output, lệnh CMake đã có thể phát hiện các compiler đang hoạt động, thông tin ABI của chúng (để biết thêm về ABI, hãy tham khảo *Chương 3*, *Object File*), các tính năng của chúng, v.v., và cuối cùng nó đã sinh ra một Makefile trong thư mục `build`.

> **Lưu ý**:
>
> Trong *Shell Box 23-7*, chúng ta đã giả định rằng có thể đã có thư mục `build` sẵn; do đó, chúng ta đã xóa mọi nội dung của nó trước.

Bạn có thể thấy nội dung của thư mục `build` và Makefile được sinh ra:

```
$ ls
CMakeCache.txt  CMakeFiles  Makefile  calc  cmake_install.cmake  exec
$
```

*Shell Box 23-8: Makefile được sinh ra trong thư mục build*

Giờ bạn đã có một Makefile trong thư mục `build`, bạn có thể tự do chạy lệnh make. Nó sẽ lo việc biên dịch và hiển thị tiến trình của nó một cách đẹp mắt cho bạn.

Lưu ý rằng bạn nên ở trong thư mục `build` trước khi chạy lệnh `make`:

```
$ make
Scanning dependencies of target calc
[ 16%] Building C object calc/CMakeFiles/calc.dir/add.c.o
[ 33%] Building C object calc/CMakeFiles/calc.dir/subtract.c.o
[ 50%] Building C object calc/CMakeFiles/calc.dir/multiply.c.o
[ 66%] Linking C static library libcalc.a
[ 66%] Built target calc
Scanning dependencies of target ex23_1.out
[ 83%] Building C object exec/CMakeFiles/ex23_1.out.dir/main.c.o
[100%] Linking C executable ex23_1.out
[100%] Built target ex23_1.out
$
```

*Shell Box 23-9: Thực thi Makefile được sinh ra*

Hiện nay, nhiều dự án lớn dùng CMake, và bạn có thể build các source của chúng bằng ít nhiều cùng các <a id="_idIndexMarker1733"></a>lệnh mà chúng tôi đã cho thấy trong các shell box trước. *Vim* là một dự án như vậy. Thậm chí bản thân CMake cũng được build bằng CMake sau khi có một hệ thống CMake tối thiểu được build bởi Autotools! CMake giờ có rất nhiều phiên bản và tính năng và sẽ cần cả một cuốn sách để thảo luận chúng một cách chi tiết sâu rộng.

> **Lưu ý**:
>
> Link sau là tài liệu chính thức <a id="_idIndexMarker1734"></a>của phiên bản CMake mới nhất và nó có thể giúp bạn có ý niệm về cách nó [works and what features it has: https://cmake.](https://cmake.org/cmake/help/latest/index.html)org/cmake/help/latest/index.html (hoạt động và nó có những tính năng gì).

Lưu ý cuối cùng trong phần này, CMake có thể tạo các build script file cho Microsoft Visual Studio, Xcode của Apple, và các môi trường phát triển khác.

Trong phần sau, chúng ta sẽ thảo luận build system Ninja, một lựa chọn thay thế nhanh cho Make đang có đà phát triển gần đây. Chúng tôi cũng giải thích CMake có thể được dùng như thế nào để sinh ra các build script file Ninja thay vì Makefile.

<a id="_idParaDest-340"></a>

## Ninja

Ninja là một lựa chọn thay thế<a id="_idIndexMarker1735"></a> cho Make. Tôi ngần ngại gọi nó là một sự thay thế hoàn toàn, nhưng nó là một lựa chọn nhanh hơn. Nó đạt được hiệu năng cao bằng cách loại bỏ một số tính năng mà Make cung cấp, như xử lý chuỗi, vòng lặp và pattern matching.

Ninja có ít chi phí phụ hơn nhờ loại bỏ những tính năng này, và vì vậy, không khôn ngoan khi viết các build script Ninja từ đầu.

Viết các script Ninja có thể được so sánh với việc viết shell script, mà nhược điểm của nó chúng tôi đã giải thích trong phần trước. Đó là lý do tại sao nên dùng nó cùng với một công cụ build script generator như CMake.

Trong phần này, chúng tôi cho thấy Ninja có thể được dùng như thế nào khi các build script Ninja được CMake sinh ra. Do đó, trong phần này, chúng ta sẽ không đi qua cú pháp của Ninja, như chúng ta đã làm cho Makefile. Đó là vì chúng ta sẽ không tự viết chúng; thay vào đó, chúng ta sẽ yêu cầu CMake sinh ra chúng cho chúng ta.

> **Lưu ý**:
>
> Để biết thêm thông tin về cú pháp Ninja, hãy theo link này: https://ninja-build.org/manual.html#_writing_your_own_ninja_files.

Như chúng tôi đã giải thích trước đây, tốt nhất là dùng một build script generator để tạo ra các build script file Ninja. Trong shell box sau, bạn có thể thấy cách dùng CMake để sinh ra một build script Ninja, `build.ninja`, thay vì một Makefile cho dự án đích của chúng ta:

```
$ cd ex23_1
$ mkdir -p build
$ cd build
$ rm -rfv *
...
$ cmake -GNinja ..
-- The C compiler identification is GNU 7.4.0
-- The CXX compiler identification is GNU 7.4.0
-- Check for working C compiler: /usr/bin/cc
-- Check for working C compiler: /usr/bin/cc -- works
-- Detecting C compiler ABI info
-- Detecting C compiler ABI info - done
-- Detecting C compile features
-- Detecting C compile features - done
-- Check for working CXX compiler: /usr/bin/c++
-- Check for working CXX compiler: /usr/bin/c++ -- works
-- Detecting CXX compiler ABI info
-- Detecting CXX compiler ABI info - done
-- Detecting CXX compile features
-- Detecting CXX compile features - done
-- Configuring done
-- Generating done
-- Build files have been written to: .../extreme_c/ch23/ex23_1/build
$
```

*Shell Box 23-10: Sinh ra build.ninja dựa trên CMakeLists.txt có ở thư mục gốc*

Như bạn có thể thấy, chúng ta đã truyền tùy chọn `-GNinja` để cho CMake biết rằng chúng ta đang yêu cầu các build<a id="_idIndexMarker1737"></a> script file Ninja thay vì Makefile. CMake sinh ra file `build.ninja` và bạn có thể tìm thấy nó trong thư mục `build` như sau:

```
$ ls
CMakeCache.txt  CMakeFiles  build.ninja  calc  cmake_install.cmake  exec  rules.ninja
$
```

*Shell Box 23-11: build.ninja được sinh ra trong thư mục build*

Để biên dịch dự án, chỉ cần chạy lệnh `ninja` như sau. Lưu ý rằng giống như chương trình `make` tìm `Makefile` trong thư mục hiện tại, chương trình `ninja` tìm `build.ninja` trong thư mục hiện tại:

```
$ ninja
[6/6] Linking C executable exec/ex23_1.out
$
```

*Shell Box 23-12: Thực thi build.ninja được sinh ra*

Trong phần sau, chúng ta sẽ nói về *Bazel*, một build system khác có thể được dùng để build các dự án C và C++.

<a id="_idParaDest-341"></a>

## Bazel

Bazel là một build system <a id="_idIndexMarker1738"></a>được phát triển tại Google để đáp ứng nhu cầu nội bộ về một build system nhanh và có khả năng mở rộng có thể build bất kỳ dự án nào bất kể ngôn ngữ lập trình là gì. Bazel hỗ trợ build các dự án C, C++, Java, Go và Objective-C. Hơn thế nữa, nó có thể được dùng để build các dự án Android và iOS.

Bazel trở thành mã nguồn mở vào khoảng năm 2015. Nó là một build system, nên nó có thể được so sánh với Make và Ninja, nhưng không phải CMake. Gần như mọi dự án mã nguồn mở của Google đều dùng Bazel cho việc build. Ví dụ, chúng ta có thể kể tên chính *Bazel*, *gRPC*, *Angular*, *Kubernetes* và *TensorFlow*.

Bazel được viết bằng Java. Nó nổi tiếng với việc build song song và có khả năng mở rộng, và nó thực sự tạo ra khác biệt trong các dự án lớn. Build song song cũng có sẵn trong Make và Ninja, cả hai đều bằng cách truyền tùy chọn `-j` (tuy nhiên Ninja mặc định là song song).

> **Lưu ý**:
>
> Tài liệu chính thức[ntation <a id="_idIndexMarker1739"></a>of Bazel can be found here: https://docs.bazel.buil](https://docs.bazel.build/versions/master/bazel-overview.html)d/versions/master/bazel-overview.html (của Bazel có thể được tìm thấy ở đây).

Cách dùng Bazel tương tự những gì chúng ta đã làm cho Make và Ninja. Bazel đòi hỏi hai loại file có mặt trong một dự án: các file `WORKSPACE` và `BUILD`. File `WORKSPACE` nên ở thư mục gốc, và các file `BUILD` nên được đặt vào các module cần được build như một phần của cùng workspace (hay dự án). Điều này ít nhiều tương tự trường hợp với CMake, nơi chúng ta có ba file `CMakeLists.txt` được phân bố trong dự án, nhưng lưu ý rằng, ở đây, bản thân Bazel là build system và chúng ta sẽ không sinh ra bất kỳ build script nào cho một build system khác.

Nếu chúng ta muốn thêm hỗ trợ Bazel vào dự án của mình, chúng ta nên có được hệ thống phân cấp sau trong dự án:

```
$ tree ex23_1
ex23_1/
├── WORKSPACE
├── calc
│   ├── BUILD
│   ├── add.c
│   ├── calc.h
│   ├── multiply.c
│   └── subtract.c
└── exec
    ├── BUILD
    └── main.c
2 directories, 8 files
$
```

*Shell Box 23-13: Hệ thống phân cấp dự án sau khi đưa vào các file Bazel*

Nội dung của file `WORKSPACE` sẽ trống trong ví dụ của chúng ta. Nó thường được dùng để chỉ thư mục gốc của code base. Lưu ý rằng bạn cần tham khảo tài liệu để xem những file này, `WORKSPACE` và `BUILD`, nên được lan truyền khắp code base như thế nào nếu bạn có thêm các module lồng nhau và sâu hơn.

Nội dung của file `BUILD` chỉ ra các target nên được build trong thư mục (hay module) đó. Code box sau cho thấy file `BUILD` cho module `calc`:

```
c_library(
  name = "calc",
  srcs = ["add.c", "subtract.c", "multiply.c"],
  hdrs = ["calc.h"],
  linkstatic = True,
  visibility = ["//exec:__pkg__"]
)
```

*Code Box 23-7 [calc/BUILD]: File BUILD có ở thư mục calc*

Như bạn thấy, một target mới, `calc`, được khai báo. Nó là một static library và chứa ba source file có trong <a id="_idIndexMarker1741"></a>thư mục. Library cũng hiển thị với các target nằm trong thư mục `exec`.

Hãy xem file `BUILD` trong thư mục exec:

```
cc_binary(
  name = "ex23_1.out",
  srcs = ["main.c"],
  deps = [
    "//calc:calc"
  ],
  copts = ["-Icalc"]
)
```

*Code Box 23-8 [exec/BUILD]: File BUILD có ở thư mục exec*

Với các file trên ở đúng chỗ của chúng, giờ chúng ta có thể chạy Bazel và build dự án. Bạn cần đi tới thư mục gốc của dự án. Lưu ý rằng không cần có một thư mục build như chúng ta đã làm cho CMake:

```
$ cd ex23_1
$ bazel build //...
INFO: Analyzed 2 targets (14 packages loaded, 71 targets configured).
INFO: Found 2 targets...
INFO: Elapsed time: 1.067s, Critical Path: 0.15s
INFO: 6 processes: 6 linux-sandbox.
INFO: Build completed successfully, 11 total actions
$
```

*Shell Box 23-14: Build dự án ví dụ bằng Bazel*

Giờ, nếu bạn nhìn vào thư mục `bazel-bin` có ở thư mục gốc, bạn hẳn có thể tìm thấy các sản phẩm:

```
$ tree bazel-bin
bazel-bin
├── calc
│   ├── _objs
│   │   └── calc
│   │       ├── add.pic.d
│   │       ├── add.pic.o
│   │       ├── multiply.pic.d
│   │       ├── multiply.pic.o
│   │       ├── subtract.pic.d
│   │       └── subtract.pic.o
│   ├── libcalc.a
│   └── libcalc.a-2.params
└── exec
    ├── _objs
    │   └── ex23_1.out
    │       ├── main.pic.d
    │       └── main.pic.o
    ├── ex23_1.out
    ├── ex23_1.out-2.params
    ├── ex23_1.out.runfiles
    │   ├── MANIFEST
    │   └── __main__
    │       └── exec
    │           └── ex23_1.out -> .../bin/exec/ex23_1.out
    └── ex23_1.out.runfiles_manifest
9 directories, 15 files
$
```

*Shell Box 23-15: Nội dung của bazel-bin sau khi chạy build*

Như bạn có thể thấy trong <a id="_idIndexMarker1742"></a>danh sách trên, dự án được build thành công, và các sản phẩm đã được định vị.

Trong phần tiếp theo, chúng ta sẽ khép lại thảo luận trong chương này và so sánh các build system khác nhau tồn tại cho các dự án C và C++.

<a id="_idParaDest-342"></a>

## So sánh các build system

Trong chương này, chúng tôi đã cố gắng<a id="_idIndexMarker1743"></a> giới thiệu ba trong số các build system well-known và được dùng rộng rãi nhất. Chúng tôi cũng đã giới thiệu CMake như một build script generator. Bạn nên biết rằng có các build system khác có thể được dùng để build các dự án C và C++.

Lưu ý rằng lựa chọn build system của bạn nên được coi là một cam kết long-term (dài hạn); nếu bạn bắt đầu một dự án với một build system cụ thể, sẽ tốn công sức đáng kể để thay đổi nó sang một build system khác.

Các build system có thể được so sánh dựa trên nhiều thuộc tính khác nhau. Dependency management, khả năng xử lý một hệ thống phân cấp phức tạp gồm các dự án lồng nhau, tốc độ build, khả năng mở rộng, tích hợp với các dịch vụ hiện có, sự linh hoạt để thêm logic mới, v.v. đều có thể được dùng để đưa ra một sự so sánh công bằng. Tôi sẽ không kết thúc cuốn sách này bằng một sự so sánh các build system vì đó là một công việc tẻ nhạt, và, hơn thế nữa, đã có một số bài viết trực tuyến tuyệt vời trình bày chủ đề này.

Một trang Wiki hay trên <a id="_idIndexMarker1744"></a>Bitbucket thực hiện một sự so sánh ưu/nhược điểm về các build system có sẵn, cùng với các hệ thống build script[ generator systems can be found here: https://bitbucket.o](https://bitbucket.org/scons/scons/wiki/SconsVsOtherBuildTools)rg/scons/scons/wiki/SconsVsOtherBuildTools (generator, có thể được tìm thấy ở đây).

Lưu ý rằng kết quả của một sự so sánh có thể khác nhau với mỗi người. Bạn nên chọn một build system dựa trên <a id="_idIndexMarker1745"></a>các yêu cầu của dự án và các tài nguyên có sẵn cho bạn. Các link sau dẫn tới các tài nguyên bổ sung có thể[ be used for further study and comparison:](https://www.reddit.com/r/cpp/comments/8zm66h/an_overview_of_build_systems_mostly_for_c_projects/) (được dùng để nghiên cứu và so sánh thêm:)

[https://www.reddit.com/r/cpp/comments/8zm66h/an_overv](https://www.reddit.com/r/cpp/comments/8zm66h/an_overview_of_build_systems_mostly_for_c_projects/)i[ew_of_build_systems_mostly_for_c_projects/](https://github.com/LoopPerfect/buckaroo/wiki/Build-Systems-Comparison)

[https://github.com/LoopPer](https://github.com/LoopPerfect/buckaroo/wiki/Build-Systems-Comparison)f[ect/buckaroo/wiki/Build-Systems-Comparison](https://medium.com/@julienjorge/an-overview-of-build-systems-mostly-for-c-projects-ac9931494444)

[https://medium.com/@julienjorge/an-overview-of-build](https://medium.com/@julienjorge/an-overview-of-build-systems-mostly-for-c-projects-ac9931494444)-systems-mostly-for-c-projects-ac9931494444

<a id="_idParaDest-343"></a>

## Tóm tắt

Trong chương này, chúng ta đã thảo luận các công cụ build phổ biến có sẵn để build một dự án C hay C++. Trong chương này:

- Chúng ta đã thảo luận nhu cầu về một build system.
- Chúng tôi đã giới thiệu Make, một trong những build system lâu đời nhất có sẵn cho các dự án C và C++.
- Chúng tôi đã giới thiệu Autotools và CMake, hai build script generator nổi tiếng.
- Chúng tôi đã cho thấy CMake có thể được dùng như thế nào để sinh ra các Makefile cần thiết.
- Chúng ta đã thảo luận Ninja và chúng tôi đã cho thấy CMake có thể được dùng như thế nào để sinh ra các build script Ninja.
- Chúng tôi đã minh họa Bazel có thể được dùng như thế nào để build một dự án C.
- Cuối cùng, chúng tôi đã cung cấp một số link tới một số thảo luận trực tuyến về việc so sánh các build system khác nhau.

<a id="_idParaDest-344"></a>

## Lời kết (Epilogue)

Và những lời cuối cùng ...

Nếu bạn đang đọc điều này, điều đó có nghĩa là hành trình của chúng ta đã đến hồi kết! Chúng ta đã đi qua nhiều chủ đề và khái niệm trong cuốn sách này, và tôi hy vọng rằng hành trình này đã giúp bạn trở thành một lập trình viên C giỏi hơn. Dĩ nhiên, nó không thể cho bạn kinh nghiệm; bạn phải có được điều đó bằng việc làm việc trên nhiều dự án khác nhau. Các phương pháp và mẹo chúng ta đã thảo luận trong cuốn sách này sẽ nâng cao trình độ chuyên môn của bạn, và điều này sẽ cho phép bạn làm việc trên các dự án nghiêm túc hơn. Giờ bạn đã biết thêm về các hệ thống phần mềm, từ một góc nhìn rộng hơn, và sở hữu một kiến thức top-notch (hàng đầu) về cách hoạt động bên trong.

Dù cuốn sách này nặng và dài hơn những gì bạn thường đọc, nó vẫn không thể trình bày mọi chủ đề có trong C, C++ và lập trình hệ thống. Do đó, một gánh nặng vẫn còn trên vai tôi; hành trình chưa kết thúc! Tôi muốn tiếp tục làm việc trên thêm nhiều chủ đề Extreme, có lẽ là những lĩnh vực cụ thể hơn, như Asynchronous I/O, Advanced Data Structures, Socket Programming, Distributed Systems, Kernel Development và Functional Programming, theo thời gian.

Hy vọng gặp lại bạn trong hành trình tiếp theo!

Kamran
