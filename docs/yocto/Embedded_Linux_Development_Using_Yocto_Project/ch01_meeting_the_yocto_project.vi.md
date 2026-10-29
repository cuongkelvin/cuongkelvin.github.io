# Chương 1: Làm quen với Yocto Project (Meeting the Yocto Project)

Chương này giới thiệu với bạn về **Yocto Project**. Những khái niệm chính của dự án được bàn ở đây sẽ liên tục được dùng trong suốt cuốn sách. Ngoài ra, chúng ta sẽ bàn ngắn gọn về lịch sử của Yocto Project, OpenEmbedded, Poky, BitBake, metadata và lược đồ đánh phiên bản. Vậy, hãy thắt dây an toàn, và chào mừng bạn lên tàu!

## Yocto Project là gì?

Yocto Project là một nhóm làm việc của Linux Foundation và được định nghĩa như sau:

> Yocto Project là một dự án cộng tác mã nguồn mở giúp các developer tạo ra những hệ thống Linux-based tùy chỉnh được thiết kế cho các sản phẩm embedded, bất kể architecture phần cứng của sản phẩm là gì. Yocto Project cung cấp một bộ công cụ linh hoạt và một môi trường phát triển cho phép các developer thiết bị embedded trên khắp thế giới cộng tác với nhau thông qua các công nghệ, software stack, cấu hình và thực hành tốt nhất được chia sẻ, dùng để tạo ra những Linux image được may đo riêng này.
>
> Hàng nghìn developer trên toàn thế giới đã nhận ra rằng Yocto Project mang lại lợi thế cho cả việc phát triển hệ thống lẫn phát triển ứng dụng, lợi ích về lưu trữ và quản lý, cùng với các tùy chỉnh dùng cho tốc độ, footprint và mức sử dụng memory. Dự án này là một chuẩn mực khi nói đến việc cung cấp các embedded software stack. Dự án cho phép tùy chỉnh phần mềm và trao đổi build cho nhiều nền tảng phần cứng, cũng như các software stack có thể được bảo trì và mở rộng.
>
> \- Yocto Project Overview and Concepts Manual

Yocto Project là một dự án cộng tác mã nguồn mở. Dự án cung cấp các template, công cụ và phương pháp giúp chúng ta tạo ra những hệ thống Linux-based tùy chỉnh cho các sản phẩm embedded, bất kể architecture phần cứng là gì. Nó có thể tạo ra các bản phân phối Linux được may đo riêng dựa trên các thư viện chuẩn C `glibc` và `musl`, cùng các toolchain **Real-Time Operating System** (**RTOS**) cho việc phát triển bare-metal, như cách Zephyr Project đang làm.

Do được một thành viên của Linux Foundation quản lý, dự án giữ được tính độc lập với các tổ chức thành viên; các tổ chức này tham gia theo nhiều cách và cung cấp nguồn lực cho dự án.

Dự án được thành lập vào năm 2010 như một sự cộng tác của nhiều nhà sản xuất phần cứng, các hệ điều hành mã nguồn mở, các nhà cung cấp và các công ty điện tử, nhằm giảm trùng lặp công việc và cung cấp nguồn lực cùng thông tin phục vụ cả người dùng mới lẫn người dùng có kinh nghiệm. Trong số các nguồn lực này có OpenEmbedded Core, thành phần hệ thống cốt lõi do dự án OpenEmbedded cung cấp.

Yocto Project tập hợp nhiều công ty, cộng đồng, dự án và công cụ có cùng một mục đích – build các sản phẩm embedded Linux-based. Những bên liên quan này cùng chung một con thuyền, được thúc đẩy bởi nhu cầu của cộng đồng mình để làm việc cùng nhau.

## Phác họa Yocto Project

Để dễ hiểu các nhiệm vụ và kết quả của Yocto Project, chúng ta có thể dùng phép so sánh với một cỗ máy tính toán. Đầu vào là một tập dữ liệu mô tả những gì chúng ta muốn, tức là đặc tả của chúng ta. Ở đầu ra, chúng ta có sản phẩm embedded Linux-based mong muốn.

Đầu ra gồm các thành phần của hệ điều hành. Nó bao gồm Linux kernel, bootloader và root filesystem (`rootfs`), được đóng gói và sắp xếp để hoạt động cùng nhau.

Các công cụ của Yocto Project có mặt ở tất cả các bước trung gian để tạo ra gói `rootfs` kết quả và các sản phẩm bàn giao khác. Các thành phần phần mềm đã được build trước đó sẽ được dùng lại giữa các lần build – ứng dụng, thư viện hay bất kỳ thành phần phần mềm nào.

Khi không thể dùng lại, các thành phần phần mềm được build theo đúng thứ tự và với cấu hình mong muốn, bao gồm cả việc fetch source code cần thiết từ các repository tương ứng của chúng, như The Linux Kernel Archives ([www.kernel.org](http://www.kernel.org)), GitHub, BitBucket và GitLab.

Các công cụ của Yocto Project tự chuẩn bị môi trường build, các tiện ích và toolchain của mình, nhờ đó giảm sự phụ thuộc vào phần mềm trên host. Các tiện ích, phiên bản và tùy chọn cấu hình độc lập với bản phân phối Linux trên host, giảm tối đa số tiện ích trên host mà quá trình build phải dựa vào, trong khi vẫn tạo ra cùng một kết quả. Một hệ quả tinh tế nhưng thiết yếu là tính tất định tăng lên đáng kể và giảm các dependency vào build host, nhưng thời gian của những lần build first-time lại tăng lên.

BitBake và OpenEmbedded Core nằm dưới sự bảo trợ của dự án OpenEmbedded, trong khi một số dự án, như Poky, nằm dưới sự bảo trợ của Yocto Project. Tất cả chúng bổ sung cho nhau và đóng những vai trò cụ thể trong hệ thống. Chúng ta sẽ hiểu chính xác cách chúng phối hợp với nhau trong chương này và trong suốt cuốn sách.

## Liên minh giữa dự án OpenEmbedded và Yocto Project

Dự án OpenEmbedded được thành lập vào khoảng tháng Một năm 2003, khi một số developer cốt lõi của dự án **OpenZaurus** bắt đầu làm việc với build system mới. Ngay từ đầu, build system OpenEmbedded đã là một bộ lập lịch task tên là BitBake, được lấy cảm hứng và dựa trên hệ thống package **Gentoo Portage**. Nhờ đó, dự án nhanh chóng phát triển bộ sưu tập phần mềm và danh sách machine được hỗ trợ.

Do việc phát triển hỗn loạn và thiếu phối hợp, rất khó dùng OpenEmbedded trong những sản phẩm đòi hỏi một code base ổn định và trau chuốt hơn, và đó chính là cách bản phân phối Poky ra đời. Poky khởi đầu là một tập con của build system OpenEmbedded, và có một code base trau chuốt và ổn định hơn trên một tập architecture giới hạn. Ngoài ra, kích thước nhỏ gọn hơn cho phép Poky phát triển những công nghệ nổi bật, như các plugin IDE và việc tích hợp **Quick Emulator** (**QEMU**), những thứ vẫn còn được dùng đến nay.

Yocto Project và dự án OpenEmbedded đã hợp nhất nỗ lực của mình vào một build system cốt lõi gọi là OpenEmbedded Core. Nó dùng những gì tốt nhất của cả Poky lẫn OpenEmbedded, nhấn mạnh việc tăng cường sử dụng các thành phần bổ sung, metadata và các tập con. Vào khoảng tháng Mười Một năm 2010, Linux Foundation công bố rằng Yocto Project sẽ tiếp tục công việc này dưới dạng một dự án Linux Foundation-sponsored.

## Tìm hiểu Poky

Poky là bản phân phối tham chiếu mặc định của Yocto Project, dùng công nghệ build system của OpenEmbedded. Nó gồm một bộ sưu tập các công cụ, file cấu hình và dữ liệu recipe (được gọi là metadata). Nó platform-independent và thực hiện cross-compiling bằng công cụ BitBake, OpenEmbedded Core và một tập metadata mặc định, như minh họa trong hình sau. Ngoài ra, nó cung cấp cơ chế để build và kết hợp hàng nghìn dự án mã nguồn mở phân tán nhằm tạo thành một Linux software stack hoàn chỉnh, nhất quán và có thể tùy chỉnh hoàn toàn.

Mục tiêu chính của Poky là cung cấp mọi tính năng mà một developer embedded cần.

![](images/B19361_01_01.jpg)

*Hình 1.1 – Các thành phần chính của Poky*

### BitBake

BitBake là một bộ lập lịch task và hệ thống thực thi, có nhiệm vụ parse code Python và Shell Script. Code được parse sẽ tạo ra và chạy các task, tức là một tập các bước được sắp xếp theo các dependency của code.

BitBake đánh giá toàn bộ metadata hiện có, quản lý việc mở rộng biến động, các dependency và việc sinh code. Ngoài ra, nó theo dõi tất cả các task để bảo đảm chúng hoàn tất, tận dụng tối đa tài nguyên xử lý nhằm giảm thời gian build và tăng khả năng dự đoán. Việc phát triển BitBake diễn ra trong mailing list [https://lists.openembedded.org/g/bitbake-devel](https://lists.openembedded.org/g/bitbake-devel), và source code nằm trong thư mục con `bitbake` của Poky.

### OpenEmbedded Core

Metadata collection OpenEmbedded Core cung cấp bộ máy của build system Poky. Nó cung cấp các tính năng cốt lõi và hướng tới việc tổng quát và gọn nhẹ nhất có thể. Nó hỗ trợ mười architecture bộ xử lý khác nhau (ARM, ARM64, x86, x86-64, PowerPC, PowerPC 64, MIPS, MIPS64, RISC-V32 và RISC-V 64), và chỉ hỗ trợ những nền tảng có thể được QEMU emulate.

Việc phát triển được tập trung tại mailing list [https://lists.openembedded.org/g/openembedded-core](https://lists.openembedded.org/g/openembedded-core) ([mailto:openembedded-core@lists.openembedded.org](mailto:openembedded-core@lists.openembedded.org)), và metadata của nó được đặt trong thư mục con `meta` của Poky.

### Metadata

Metadata bao gồm các recipe và file cấu hình. Nó gồm một tập hỗn hợp các file văn bản Python và Shell Script, tạo nên một công cụ vô cùng linh hoạt. Poky dùng metadata này để mở rộng OpenEmbedded Core và có hai layer khác nhau, là những tập con metadata khác, như sau:

- `meta-poky`: Layer này cung cấp các chính sách phân phối mặc định và được hỗ trợ, nhận diện thương hiệu về mặt hình ảnh, và thông tin theo dõi metadata (người bảo trì, trạng thái upstream, v.v.). Mục đích là để làm một template được tuyển chọn kỹ, có thể được những người build bản phân phối dùng làm điểm khởi đầu cho bản phân phối tùy chỉnh của họ.
- `meta-yocto-bsp`: Layer này cung cấp **Board Support Package** (**BSP**) được dùng làm phần cứng tham chiếu cho việc phát triển Yocto Project và cho quy trình **Quality Assurance** (**QA**).

*Chương 8*, *Đi sâu vào metadata của BitBake*, khám phá metadata chi tiết hơn và đóng vai trò tài liệu tham khảo khi chúng ta viết các recipe của mình.

## Các bản phát hành của Yocto Project

Yocto Project có một bản phát hành sau mỗi sáu tháng, vào tháng Tư và tháng Mười. Chu kỳ phát hành này bảo đảm dòng phát triển liên tục, đồng thời tạo ra những thời điểm tăng cường kiểm thử và tập trung vào tính ổn định. Một bản phát hành trở thành bản **Stable** hoặc bản **Long-Term Support** (**LTS**) bất cứ khi nào bản phát hành đó sẵn sàng.

Thời gian hỗ trợ khác nhau đáng kể giữa bản stable và bản LTS. Bản stable được hỗ trợ trong 7 tháng, tức là có 1 tháng hỗ trợ chồng lấn cho mỗi bản stable. Bản LTS có thời gian hỗ trợ tối thiểu là 2 năm, và có thể được kéo dài thêm. Sau khi thời gian hỗ trợ chính thức kết thúc, bản phát hành chuyển sang hỗ trợ **Community** và cuối cùng đi đến **End Of Life** (**EOL**).

Khi thời gian hỗ trợ chính thức của một bản phát hành kết thúc, bản phát hành đó có thể được hỗ trợ Community nếu có một thành viên cộng đồng đứng ra làm người bảo trì cộng đồng. Cuối cùng, một bản phát hành chuyển sang EOL khi source code không có thay đổi nào trong 2 tháng, hoặc khi người bảo trì cộng đồng không còn là thành viên đang hoạt động.

Sơ đồ sau cho thấy hai chu kỳ phát hành:

![](images/B19361_01_Table_1.jpg)

*Hình 1.2 – Các chu kỳ phát hành Stable hoặc LTS*

*Bảng 1.1* đưa ra phiên bản, tên mã, ngày phát hành và mức hỗ trợ hiện tại của Yocto Project, như sau. Bảng cập nhật có tại [https://wiki.yoctoproject.org/wiki/Releases](https://wiki.yoctoproject.org/wiki/Releases):

| **Tên mã** | **Phiên bản** | **Ngày phát hành** | **Mức hỗ trợ** |
|---|---|---|---|
| Mickledore | 4.2 | April 2023 | Tương lai (đến October 2023) |
| Langdale | 4.1 | October 2022 | Stable (đến May 2023) |
| Kirkstone | 4.0 | May 2022 | LTS (tối thiểu đến April 2024) |
| Honister | 3.4 | October 2021 | EOL |
| Hardknott | 3.3 | April 2021 | EOL |
| Gatesgarth | 3.2 | Oct 2020 | EOL |
| Dunfell | 3.1 | April 2020 | LTS (đến April 2024) |
| Zeus | 3.0 | October 2019 | EOL |
| Warrior | 2.7 | April 2019 | EOL |
| Thud | 2.6 | Nov 2018 | EOL |
| Sumo | 2.5 | April 2018 | EOL |
| Rocko | 2.4 | Oct 2017 | EOL |
| Pyro | 2.3 | May 2017 | EOL |
| Morty | 2.2 | Nov 2016 | EOL |
| Krogoth | 2.1 | Apr 2016 | EOL |
| Jethro | 2.0 | Nov 2015 | EOL |
| Fido | 1.8 | Apr 2015 | EOL |
| Dizzy | 1.7 | Oct 2014 | EOL |
| Daisy | 1.6 | Apr 2014 | EOL |
| Dora | 1.5 | Oct 2013 | EOL |
| Dylan | 1.4 | Apr 2013 | EOL |
| Danny | 1.3 | Oct 2012 | EOL |
| Denzil | 1.2 | Apr 2012 | EOL |
| Edison | 1.1 | Oct 2011 | EOL |
| Bernard | 1.0 | Apr 2011 | EOL |
| Laverne | 0.9 | Oct 2010 | EOL |

*Bảng 1.1 – Danh sách các phiên bản Yocto Project*

## Tóm tắt

Chương này đã đưa ra cái nhìn tổng quan về mối liên hệ giữa dự án OpenEmbedded và Yocto Project, các thành phần tạo nên Poky, và cách dự án bắt đầu. Chương tiếp theo sẽ giới thiệu workflow của Poky với các bước để tải về, cấu hình và chuẩn bị môi trường build Poky, và cách để build image đầu tiên rồi chạy nó bằng QEMU.
