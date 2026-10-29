# Lời nói đầu (Preface)

Vài năm trước, embedded hẳn là từ đồng nghĩa với một hệ thống nhỏ, resource-constrained và chuyên dụng. Ngày nay, rất dễ tìm thấy embedded system có 1 GB memory trở lên, nhiều storage, và hardware accelerator chuyên dụng cho những việc như đồ họa, video, mật mã, thậm chí cả các hệ thống multicore 64-bit high-end.

Không gian embedded được chia thành các hệ thống nhỏ dựa trên microcontroller (microcontroller-based), là hậu duệ trực tiếp của các embedded system vài năm trước, và một thế hệ mới các hệ thống embedded Linux-based đòi hỏi bộ công cụ, kỹ năng và workflow khác để phát triển.

Kể từ khi lần xuất bản đầu của cuốn sách này ra đời, mảng embedded Linux bắt đầu chịu ảnh hưởng từ các kỹ sư trẻ xuất thân từ phong trào maker, những người quen với việc làm prototype nhanh sản phẩm và ý tưởng bằng hardware Raspberry Pi-like và các distribution PC-like như Debian, cũng như từ sự nổi lên của Internet of Things như một lực lượng mang tính đột phá. Điều này đã đẩy vấn đề bảo mật của các thiết bị embedded always-available, cloud-connected lên tuyến đầu, nhưng cũng làm mờ ranh giới giữa các hệ thống embedded Linux chuyên nghiệp và sản phẩm của người chơi nghiệp dư.

Dù vậy, các embedded system chuyên nghiệp có một tập yêu cầu riêng, chung cho tất cả:

- Đặc tả công nghiệp, độ bền vững và độ tin cậy

- Ứng dụng chuyên dụng được tối ưu

- Bảo đảm về bảo mật

- Cập nhật over-the-air từ xa và an toàn

- Các cân nhắc về quản lý năng lượng

- Thời gian khởi động nhanh

- Giao diện người dùng đồ họa

- Một mức độ nhất định về khả năng real-time

- Duy trì dòng sản phẩm lâu dài cho cả hardware lẫn software, thường trên 5 năm.

Khi thiết kế sản phẩm embedded với các yêu cầu trên, rõ ràng hardware dành cho giáo dục và các distribution desktop-oriented sẽ không bao giờ cung cấp được mức kiểm soát, khả năng cấu hình và sự linh hoạt cần thiết để thiết kế một sản phẩm embedded chuyên nghiệp.

Đó là lý do Yocto Project vẫn là công cụ build embedded Linux được chọn cho các hệ thống chuyên nghiệp. Sự linh hoạt và khả năng mở rộng của nó cho phép build các sản phẩm embedded Linux từ low-end resource-constrained đến high-end, và điều chỉnh software cho phù hợp.

Trong lần xuất bản mới này, nội dung đã được rà soát toàn bộ và cập nhật lên bản phát hành Yocto Project 2.4, đồng thời thêm nội dung mới để đề cập một số thay đổi và xu hướng xuất hiện từ khi lần xuất bản đầu ra đời.

## Cuốn sách này dành cho ai

Cuốn sách này là cách lý tưởng để các embedded developer đang học về embedded Linux và Yocto project trở nên thành thạo và mở rộng hiểu biết, với các ví dụ có thể áp dụng ngay vào việc phát triển embedded.

Các embedded Yocto developer giàu kinh nghiệm sẽ tìm thấy những góc nhìn mới về phương pháp làm việc và năng lực phát triển ARM-specific.

## Nội dung cuốn sách

`Chapter 1`, The Build System, mô tả và sử dụng build system Poky rồi mở rộng nó sang Freescale BSP Community layer. Chương này cũng mô tả các cấu hình và tính năng thông dụng của build system để tối ưu việc build target image, bao gồm việc dùng Toaster và Docker.

`Chapter 2`, The BSP Layer, hướng dẫn người đọc tùy biến BSP cho sản phẩm của riêng mình. Sau đó chương giải thích cách cấu hình, sửa đổi, build và debug boot loader U-Boot, Linux kernel và device tree của nó.

`Chapter 3`, The Software Layer, mô tả quy trình tạo một software layer mới để chứa ứng dụng, service mới hoặc các sửa đổi cho package có sẵn; giải thích các phương pháp tối ưu kích thước và bảo mật cho cả Linux kernel lẫn root filesystem; và bàn về một quy trình release để tuân thủ license.

`Chapter 4`, Application Development, mở đầu bằng việc giới thiệu cả SDK chuẩn lẫn SDK mở rộng (extensible), và đi sâu vào phát triển ứng dụng, bao gồm các graphical backend và môi trường phát triển khác nhau như Eclipse và Qt Creator, cùng việc tạo recipe cho các ngôn ngữ lập trình khác nhau.

`Chapter 5`, Debugging, Tracing and Profiling, bàn về các công cụ và kỹ thuật debug, và khám phá các chức năng tracing mà Linux kernel cung cấp cùng một số công cụ tracing và profiling ở user space sử dụng chúng.

## Để tận dụng tối đa cuốn sách này

Cuốn sách giả định bạn có kiến thức làm việc cơ bản về hệ thống GNU/Linux và các ứng dụng như bash shell và các shell tương tự, cũng như các công cụ chuẩn như grep, patch và diff. Các ví dụ đã được kiểm thử trên hệ thống Ubuntu 16.04 LTS, nhưng có thể dùng bất kỳ Linux distribution nào được Yocto project hỗ trợ.

Cuốn sách được sắp xếp theo workflow phát triển thông thường của một sản phẩm embedded Linux, nhưng các chương, thậm chí từng recipe riêng lẻ, đều có thể đọc độc lập.

Các recipe theo cách tiếp cận thực tế, hands-on, dùng một hệ thống i.MX6-based của NXP là Wandboard Quad làm hardware nền. Tuy nhiên, có thể dùng bất kỳ hardware i.MX-based nào khác để làm theo các ví dụ.

### Tải các file code ví dụ

Bạn có thể tải các file code ví dụ của cuốn sách này từ tài khoản của bạn tại `www.packtpub.com`. Nếu bạn mua sách ở nơi khác, có thể truy cập `www.packtpub.com/support` và đăng ký để nhận file qua email.

Bạn có thể tải các file code theo các bước sau:

1. Đăng nhập hoặc đăng ký tại `www.packtpub.com`.

2. Chọn tab SUPPORT.

3. Nhấn vào Code Downloads & Errata.

4. Nhập tên sách vào ô Search và làm theo hướng dẫn trên màn hình.

Sau khi tải file về, hãy bảo đảm bạn giải nén hoặc trích xuất thư mục bằng phiên bản mới nhất của:

- WinRAR/7-Zip cho Windows

- Zipeg/iZip/UnRarX cho Mac

- 7-Zip/PeaZip cho Linux

Code bundle của cuốn sách cũng được lưu trên GitHub tại `https://github.com/PacktPublishing/Embedded-Linux-Development-Using-Yocto-Project-Cookbook-Second-Edition`. Chúng tôi cũng có các code bundle khác từ kho sách và video phong phú của mình tại `https://github.com/PacktPublishing/`. Hãy xem thử!

### Tải ảnh màu

Chúng tôi cũng cung cấp một file PDF chứa ảnh màu của các screenshot/sơ đồ dùng trong sách. Bạn có thể tải tại đây: `http://www.packtpub.com/sites/default/files/downloads/EmbeddedLinuxDevelopmentUsingYoctoProjectCookbookSecondEdition_ColorImages.pdf`.

### Các quy ước được dùng

Có một số quy ước văn bản được dùng trong toàn bộ cuốn sách.

`CodeInText`: Chỉ các từ code trong văn bản, tên bảng database, tên thư mục, tên file, phần mở rộng file, pathname, URL giả, dữ liệu người dùng nhập và Twitter handle. Đây là một ví dụ: "Trong trường hợp này, cả `imx6q.dtsi` và ;`imx6qdl-wandboard-revd1.dtsi` đều được phủ lên (overlay) bằng nội dung của `imx6qp-wandboard-revd1.dts`."

Một khối code được trình bày như sau:

```
#include "imx6q-wandboard-revd1.dts"
#include "imx6qp.dtsi"
/ {
        model = "Wandboard i.MX6QuadPlus rev.D1";
};
```

Khi chúng tôi muốn bạn chú ý tới một phần cụ thể của khối code, các dòng hoặc mục liên quan được in đậm:

```
# Allow override of WANDBOARD_GITHUB_MIRROR to make use of
# local repository easier
WANDBOARD_GITHUB_MIRROR ?= "git://github.com/wandboard-org/linux.git"
```

Mọi dữ liệu nhập hoặc output command-line được viết như sau:

```
$ cd /opt/yocto/fsl-community-bsp/wandboard/tmp/deploy/sdk/
$ ./poky-glibc-x86_64-core-image-minimal-cortexa9hf-neon-toolchain-2.4.sh
```

Bold: Chỉ một thuật ngữ mới, một từ quan trọng, hoặc các từ bạn thấy trên màn hình. Ví dụ, các từ trong menu hoặc hộp thoại xuất hiện trong văn bản như thế này. Đây là một ví dụ: "Build project bằng cách vào Project \| Build Project."

> Cảnh báo hoặc ghi chú quan trọng xuất hiện như thế này.

> Mẹo và thủ thuật xuất hiện như thế này.

## Liên hệ

Phản hồi từ độc giả luôn được hoan nghênh.

Phản hồi chung: Gửi email tới `feedback@packtpub.com` và ghi tên sách trong tiêu đề thư. Nếu bạn có câu hỏi về bất kỳ khía cạnh nào của cuốn sách, hãy gửi email cho chúng tôi tại `questions@packtpub.com`.

Errata: Dù chúng tôi đã hết sức cẩn thận để bảo đảm nội dung chính xác, sai sót vẫn có thể xảy ra. Nếu bạn phát hiện một lỗi trong cuốn sách, chúng tôi sẽ rất biết ơn nếu bạn báo cho chúng tôi. Hãy truy cập `www.packtpub.com/submit-errata`, chọn sách của bạn, nhấn vào link Errata Submission Form và nhập chi tiết.

Vi phạm bản quyền: Nếu bạn bắt gặp bất kỳ bản sao bất hợp pháp nào của các tác phẩm của chúng tôi dưới bất kỳ hình thức nào trên Internet, chúng tôi sẽ rất biết ơn nếu bạn cung cấp cho chúng tôi địa chỉ hoặc tên website. Hãy liên hệ với chúng tôi tại `copyright@packtpub.com` kèm link tới tài liệu đó.

Nếu bạn muốn trở thành tác giả: Nếu có một chủ đề mà bạn có chuyên môn và bạn muốn viết hoặc đóng góp cho một cuốn sách, hãy truy cập `authors.packtpub.com`.

### Đánh giá

Hãy để lại đánh giá. Sau khi đã đọc và dùng cuốn sách này, sao bạn không để lại đánh giá trên trang web nơi bạn đã mua nó? Những độc giả tiềm năng khi đó có thể xem và dùng ý kiến khách quan của bạn để quyết định mua, chúng tôi ở Packt có thể hiểu bạn nghĩ gì về sản phẩm của chúng tôi, và các tác giả có thể xem phản hồi của bạn về cuốn sách của họ. Cảm ơn bạn!

Để biết thêm thông tin về Packt, hãy truy cập `packtpub.com`.
