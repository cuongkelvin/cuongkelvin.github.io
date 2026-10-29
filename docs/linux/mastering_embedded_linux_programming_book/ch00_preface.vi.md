# Lời nói đầu (Preface)

Linux đã là trụ cột của điện toán nhúng trong nhiều năm. Vậy mà có rất ít sách đề cập chủ đề này một cách tổng thể: cuốn sách này nhằm lấp khoảng trống đó. Thuật ngữ embedded Linux không well-defined và có thể được dùng cho hệ điều hành bên trong rất nhiều loại thiết bị, từ máy điều nhiệt, router Wi-Fi đến bộ điều khiển công nghiệp. Tuy nhiên, tất cả chúng đều được xây dựng trên cùng một nền phần mềm open source cơ bản. Đó là những công nghệ mà tôi mô tả trong cuốn sách này, dựa trên kinh nghiệm của tôi với tư cách là một kỹ sư.

Công nghệ không đứng yên. Ngành công nghiệp xoay quanh điện toán nhúng cũng chịu tác động của định luật Moore không kém gì điện toán phổ thông. Sự tăng trưởng theo hàm mũ mà định luật này hàm ý đã khiến một số lượng lớn đáng ngạc nhiên các thứ thay đổi kể từ khi ấn bản đầu tiên của cuốn sách này được xuất bản. Ấn bản thứ tư này được sửa đổi toàn diện để dùng các phiên bản mới nhất của những thành phần open source chính, bao gồm Linux 6.6, Yocto Project 5.0 Scarthgap và Buildroot 2024.02 LTS. Ngoài Autotools, cuốn sách giờ đây đề cập cả CMake, một build system hiện đại được dùng ngày càng nhiều trong những năm gần đây.

## Cuốn sách này dành cho ai

Cuốn sách này được viết cho các developer quan tâm đến điện toán nhúng và Linux, muốn mở rộng kiến thức sang các nhánh khác nhau của chủ đề này. Khi viết sách, tôi giả định bạn có hiểu biết cơ bản về command line của Linux, và với các ví dụ lập trình, có kiến thức làm việc với ngôn ngữ C và Python. Một số chương tập trung vào phần cứng của một target board nhúng, vì vậy sự quen thuộc với phần cứng và các giao tiếp phần cứng sẽ là một lợi thế rõ rệt trong những trường hợp đó.

## Cuốn sách này đề cập những gì

Chương 1, Bắt đầu, dựng bối cảnh bằng cách mô tả hệ sinh thái embedded Linux và các lựa chọn có sẵn cho bạn khi bắt đầu project.

Chương 2, Tìm hiểu về toolchain, mô tả các thành phần của một toolchain và nơi có thể lấy một toolchain dùng cho việc cross-compiling code cho target board của bạn.

Chương 3, Tất cả về bootloader, giải thích vai trò của bootloader trong việc nạp Linux kernel vào bộ nhớ, và dùng U-Boot làm ví dụ. Chương này cũng giới thiệu device tree như cơ chế được dùng để mã hóa chi tiết phần cứng trong hầu hết mọi hệ thống embedded Linux.

Chương 4, Cấu hình và build kernel, cung cấp thông tin về cách chọn một Linux kernel cho hệ thống nhúng và cấu hình nó cho phần cứng bên trong thiết bị. Chương này cũng đề cập cách port Linux sang phần cứng mới.

Chương 5, Xây dựng root filesystem, giới thiệu những ý tưởng đằng sau phần user space của một bản triển khai embedded Linux thông qua hướng dẫn step-by-step về cách cấu hình một root filesystem.

Chương 6, Chọn build system, đề cập hai build system embedded Linux thường dùng, Buildroot và The Yocto Project, vốn tự động hóa các bước được mô tả trong bốn chương trước.

Chương 7, Phát triển với Yocto, minh họa cách build system image trên nền một BSP layer có sẵn, phát triển các package phần mềm chạy trên board bằng extensible SDK của Yocto, và tự tạo bản phân phối embedded Linux của riêng bạn hoàn chỉnh với khả năng quản lý package lúc runtime.

Chương 8, Yocto bên trong, là một chuyến tham quan workflow build và kiến trúc của Yocto, bao gồm phần giải thích cách tiếp cận multi-layer độc đáo của Yocto. Chương này cũng phân tích những điều cơ bản về cú pháp và ngữ nghĩa của BitBake với các ví dụ từ những file recipe thực tế.

Chương 9, Xây dựng chiến lược lưu trữ, bàn về những thách thức khi quản lý bộ nhớ flash, bao gồm chip raw flash và các package embedded MMC (eMMC). Chương này mô tả các filesystem phù hợp với từng loại công nghệ.

Chương 10, Cập nhật phần mềm ngoài thực địa, xem xét nhiều cách cập nhật phần mềm sau khi thiết bị đã được triển khai, bao gồm cả các bản cập nhật Over-the-Air (OTA) được quản lý hoàn toàn. Các chủ đề chính được bàn đến là độ tin cậy và bảo mật.

Chương 11, Giao tiếp với device driver, mô tả cách các device driver của kernel tương tác với phần cứng bằng cách triển khai một driver đơn giản. Chương này cũng mô tả các cách khác nhau để gọi device driver từ user space.

Chương 12, Làm prototype với Add-On board, minh họa cách làm prototype phần cứng và phần mềm nhanh chóng bằng một image Debian pre-built cho BeaglePlay cùng với các add-on board ngoại vi của MikroElektronika.

Chương 13, Khởi động – Chương trình init, giải thích cách chương trình user space đầu tiên, `init`, khởi động phần còn lại của hệ thống. Chương này mô tả ba phiên bản của chương trình `init`, mỗi phiên bản phù hợp với một nhóm hệ thống nhúng khác nhau, từ sự đơn giản của `init` trong BusyBox, qua `init` của System V, đến công nghệ state-of-the-art hiện nay là `systemd`.

Chương 14, Quản lý điện năng, xem xét nhiều cách điều chỉnh Linux để giảm tiêu thụ điện năng, bao gồm dynamic frequency and voltage scaling, chọn các trạng thái idle sâu hơn, và system suspend. Mục tiêu là tạo ra các thiết bị chạy được lâu hơn với một lần sạc pin và cũng mát hơn.

Chương 15, Đóng gói Python, giải thích các lựa chọn có sẵn để đóng gói các module Python với nhau cho việc triển khai và khi nào nên dùng phương pháp này thay vì phương pháp khác. Chương này đề cập `pip`, virtual environment và `conda`.

Chương 16, Triển khai container image, giới thiệu các nguyên tắc của phong trào DevOps và minh họa cách áp dụng chúng vào embedded Linux. Đầu tiên, chúng ta dùng Docker để đóng gói một ứng dụng Python cùng với môi trường user space của nó bên trong một container image. Sau đó, chúng ta dùng GitHub Actions để thiết lập một pipeline CI/CD cho container image. Cuối cùng, chúng ta dùng Docker để thực hiện cập nhật phần mềm dạng container trên Raspberry Pi 4.

Chương 17, Tìm hiểu về process và thread, mô tả hệ thống nhúng từ góc nhìn của lập trình viên ứng dụng. Chương này xem xét process và thread, giao tiếp inter-process và các chính sách lập lịch.

Chương 18, Quản lý bộ nhớ, xem xét những ý tưởng đằng sau virtual memory và cách không gian địa chỉ được chia thành các memory mapping. Chương này cũng mô tả cách đo chính xác mức sử dụng bộ nhớ và cách phát hiện memory leak.

Chương 19, Debug với GDB, cho bạn thấy cách dùng GNU debugger, GDB, cùng với debug agent `gdbserver` để debug các ứng dụng chạy từ xa trên thiết bị target. Chương này tiếp tục cho thấy cách mở rộng mô hình này để debug code kernel, tận dụng các kernel debug stub, KGDB.

Chương 20, Profiling và tracing, đề cập các kỹ thuật có sẵn để đo hiệu năng hệ thống, bắt đầu từ profile của toàn hệ thống rồi tập trung vào những vùng cụ thể nơi các nút thắt đang gây ra hiệu năng kém. Chương này cũng mô tả cách dùng Valgrind để kiểm tra tính đúng đắn trong cách một ứng dụng dùng đồng bộ hóa thread và cấp phát bộ nhớ.

Chương 21, Lập trình Real-Time, cung cấp hướng dẫn chi tiết về lập trình real-time trên Linux bằng real-time kernel patch `PREEMPT_RT` vừa được merge gần đây.

## Để tận dụng tối đa cuốn sách này

Phần mềm được dùng trong cuốn sách này hoàn toàn là open source. Trong hầu hết các trường hợp, tôi đã dùng các phiên bản ổn định mới nhất có tại thời điểm viết. Dù tôi đã cố gắng mô tả các tính năng chính theo cách không version-specific, không tránh khỏi việc một số ví dụ sẽ cần điều chỉnh để chạy được với phần mềm về sau. Sau đây là phần cứng và phần mềm chính được dùng trong suốt cuốn sách:

- QEMU (Arm 64-bit)

- Raspberry Pi 4

- BeaglePlay

- Yocto Project 5.0 Scarthgap

- Buildroot 2024.02

- Toolchain Bootlin aarch64 glibc stable 2024.02-1

- Toolchain Arm GNU AArch32 bare-metal target (arm-none-eabi) 13.2.Rel1

- U-Boot v2024.04

- Linux kernel 6.6

Phát triển nhúng liên quan đến hai hệ thống: host, dùng để phát triển chương trình, và target, nơi chạy chúng. Với hệ thống host, tôi chọn Ubuntu 24.04 LTS vì nó được dùng rộng rãi và có bảo đảm bảo trì long-term. Bạn có thể quyết định chạy Linux trên Docker, một máy ảo, hoặc Windows Subsystem for Linux, nhưng hãy lưu ý rằng một số task, như build một bản phân phối bằng The Yocto Project, khá nặng và chạy tốt hơn trên một bản cài đặt Linux native.

Với target, tôi chọn emulator QEMU, Raspberry Pi 4 và BeaglePlay. Dùng QEMU nghĩa là bạn có thể thử hầu hết các ví dụ mà không phải đầu tư thêm phần cứng nào. Mặt khác, một số thứ hoạt động tốt hơn với phần cứng thật. Vì vậy, tôi chọn Raspberry Pi 4 vì nó rẻ, dễ mua và có sự hỗ trợ cộng đồng rất tốt. BeaglePlay thay thế BeagleBone Black được dùng trong các ấn bản trước của cuốn sách. Tất nhiên, bạn không bị giới hạn chỉ ở ba target này. Ý tưởng của cuốn sách là cung cấp cho bạn các giải pháp tổng quát cho các vấn đề để bạn có thể áp dụng chúng cho nhiều loại target board.

### Tải các file code ví dụ

Gói code của cuốn sách được lưu trên GitHub tại `https://github.com/PacktPublishing/Mastering-Embedded-Linux-Development`. Chúng tôi cũng có các gói code khác từ danh mục sách và video phong phú của mình tại `https://github.com/PacktPublishing`. Hãy xem thử!

### Tải các ảnh màu

Chúng tôi cũng cung cấp một file PDF chứa ảnh màu của các ảnh chụp màn hình/sơ đồ được dùng trong cuốn sách này. Bạn có thể tải nó tại đây: `https://packt.link/gbp/9781803232591`.

### Các quy ước được dùng

Có một số quy ước văn bản được dùng trong suốt cuốn sách này.

`CodeInText`: Chỉ các từ code trong văn bản, tên bảng cơ sở dữ liệu, tên thư mục, tên file, phần mở rộng file, đường dẫn, URL giả, input của người dùng và tài khoản Twitter. Ví dụ: “Thực thi lệnh `make menuconfig`:”

Một khối code được trình bày như sau:

```
require recipes-core/images/core-image-minimal.bb
IMAGE_INSTALL:append = " helloworld strace"
```

Mọi input hoặc output command-line được viết như sau:

```
$ bitbake -c populate_sdk nova-image
```

In đậm: Chỉ một thuật ngữ mới, một từ quan trọng, hoặc những từ bạn thấy trên màn hình. Ví dụ, các từ trong menu hoặc hộp thoại xuất hiện trong văn bản như thế này. Ví dụ: “Back out of External toolchain and open the Toolchain submenu.”

Cảnh báo hoặc lưu ý quan trọng xuất hiện như thế này.

Mẹo và thủ thuật xuất hiện như thế này.

## Liên hệ

Chúng tôi luôn hoan nghênh phản hồi từ độc giả.

Phản hồi chung: Gửi email tới `feedback@packtpub.com` và ghi tên sách trong tiêu đề thư. Nếu bạn có câu hỏi về bất kỳ khía cạnh nào của cuốn sách, hãy gửi email cho chúng tôi tại `questions@` `packtpub.com`.

Errata: Mặc dù chúng tôi đã hết sức cẩn thận để bảo đảm tính chính xác của nội dung, sai sót vẫn có thể xảy ra. Nếu bạn phát hiện một lỗi trong cuốn sách này, chúng tôi sẽ rất biết ơn nếu bạn báo cho chúng tôi. Hãy truy cập `http://www.packtpub.com/submit-errata`, nhấn Submit Errata và điền vào biểu mẫu.

Vi phạm bản quyền: Nếu bạn bắt gặp bất kỳ bản sao bất hợp pháp nào của các tác phẩm của chúng tôi dưới bất kỳ hình thức nào trên internet, chúng tôi sẽ rất biết ơn nếu bạn cung cấp cho chúng tôi địa chỉ hoặc tên website. Hãy liên hệ với chúng tôi tại `copyright@packtpub.com` kèm đường link tới tài liệu đó.

Nếu bạn muốn trở thành tác giả: Nếu có một chủ đề mà bạn có chuyên môn và bạn muốn viết hoặc đóng góp cho một cuốn sách, hãy truy cập `http://authors.packtpub.com/`.

## Chia sẻ suy nghĩ của bạn

Khi đã đọc xong Mastering Embedded Linux Development, Fourth Edition, chúng tôi rất muốn nghe suy nghĩ của bạn! Hãy `click here to go straight to the Amazon review page` cho cuốn sách này và chia sẻ phản hồi của bạn.

Đánh giá của bạn rất quan trọng với chúng tôi và cộng đồng công nghệ, và sẽ giúp chúng tôi bảo đảm mang đến nội dung chất lượng xuất sắc.

## Tải bản PDF miễn phí của cuốn sách này

Cảm ơn bạn đã mua cuốn sách này!

Bạn thích đọc khi đang di chuyển nhưng không thể mang sách in theo khắp nơi?

Bản eBook bạn mua không tương thích với thiết bị bạn chọn?

Đừng lo, giờ đây với mỗi cuốn sách Packt, bạn nhận được một phiên bản PDF DRM-free của cuốn sách đó mà không mất phí.

Đọc ở bất cứ đâu, bất cứ nơi nào, trên bất kỳ thiết bị nào. Tìm kiếm, copy và paste code từ những cuốn sách kỹ thuật yêu thích trực tiếp vào ứng dụng của bạn.

Ưu đãi không dừng ở đó, bạn có thể nhận quyền truy cập độc quyền vào các ưu đãi giảm giá, bản tin và nội dung miễn phí tuyệt vời trong hộp thư mỗi ngày.

Hãy làm theo các bước đơn giản sau để nhận các lợi ích:

1\. Quét mã QR hoặc truy cập link bên dưới:

![Image](images/ch00_preface/ch00-p036-1.png)

`https://packt.link/free-ebook/9781803232591`

2\. Gửi bằng chứng mua hàng của bạn.

3\. Vậy là xong! Chúng tôi sẽ gửi bản PDF miễn phí và các lợi ích khác trực tiếp đến email của bạn.
