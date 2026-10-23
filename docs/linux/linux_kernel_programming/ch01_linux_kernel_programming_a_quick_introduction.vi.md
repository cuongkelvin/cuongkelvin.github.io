# Chương 1. Lập trình Linux kernel – Giới thiệu nhanh

Xin chào và chào mừng bạn đến với cuốn sách học lập trình Linux kernel này! Cuốn sách, hiện ở lần xuất bản thứ hai, được viết với mục đích rõ ràng là giúp bạn học phát triển Linux kernel theo cách thiết thực, hands-on, đồng thời cung cấp nền tảng lý thuyết cần thiết để bạn có cái nhìn well-rounded về chủ đề rộng lớn và thú vị này. Sách chủ đích tập trung vào phát triển kernel thông qua framework Loadable Kernel Module (LKM) mạnh mẽ. Lý do là nhiều, nếu không muốn nói là phần lớn, dự án và sản phẩm thực tế/trong ngành liên quan đến phát triển tính năng kernel và/hoặc device driver đều được thực hiện theo cách này.

Trọng tâm được đặt vào cả việc hands-on lẫn việc hiểu đủ sâu về internals của hệ điều hành Linux. Theo đó, chúng ta đề cập mọi nội dung từ build Linux kernel từ source code cho đến tìm hiểu và làm việc với các chủ đề phức tạp như synchronization bên trong kernel.

Để dẫn dắt bạn trên hành trình thú vị này, chúng tôi chia cuốn sách thành ba phần. Phần đầu trình bày những kiến thức cơ bản về thiết lập workspace phù hợp để phát triển kernel, build kernel hiện đại từ source code và viết kernel module đầu tiên của bạn.

Phần tiếp theo, một phần then chốt, sẽ giúp bạn hiểu các chi tiết thiết yếu về kernel internals. Nội dung bao gồm Linux kernel architecture, task structure, user-mode stack và kernel-mode stack, cùng memory management. Memory management là chủ đề quan trọng và thú vị mà chúng tôi dành trọn ba chương để trình bày (đề cập internals ở mức độ đủ sâu và quan trọng là cách cấp phát, giải phóng kernel memory hiệu quả một cách cụ thể). Cơ chế hoạt động bên trong và các chi tiết chuyên sâu của CPU (task) scheduling trên hệ điều hành Linux khép lại phần này.

Phần cuối của sách đề cập chủ đề nâng cao hơn là kernel synchronization – một yêu cầu thiết yếu để thiết kế và viết code chuyên nghiệp trên Linux kernel. Chúng tôi dành trọn hai chương để trình bày các nội dung then chốt trong chủ đề này.

Cuốn sách sử dụng Linux kernel 6.1 Long Term Support (LTS) của cộng đồng kernel. Đây là kernel sẽ được bảo trì (cả sửa lỗi lẫn vá bảo mật) từ tháng 12 năm 2022 đến hết tháng 12 năm 2026. Hơn nữa, Civil Infrastructure Project (CIP) đã chọn 6.1 làm bản phát hành SLTS (Super LTS) và dự kiến bảo trì trong 10 năm, đến tháng 8 năm 2033. Đây là điểm then chốt, bảo đảm nội dung cuốn sách tiếp tục phù hợp và có giá trị trong nhiều năm tới.

Chúng tôi rất tin tưởng vào phương pháp hands-on, với khoảng 40 kernel module (bên cạnh một số user app và shell script, gấp đôi lần xuất bản đầu tiên!) trên kho GitHub của sách để việc học trở nên sống động, vui vẻ, thiết thực, thú vị và hữu ích. (Liên kết: `https://github.com/PacktPublishing/Linux-Kernel-Programming_2E`)

Chúng tôi cũng rất khuyến khích bạn sử dụng cuốn sách đồng hành, Linux Kernel Programming Part 2 – Char Device Drivers and Kernel Synchronization: Create user-kernel interfaces, work with peripheral I/O, and handle hardware interrupts. Đây là tài liệu nhập môn tuyệt vời, industry-aligned, về viết character driver `misc`, thực hiện I/O trên bộ nhớ chip ngoại vi và xử lý hardware interrupt. Bạn có thể nhận miễn phí phiên bản sách điện tử kèm bản in, hoặc cũng có thể tìm sách điện tử này trong kho GitHub tại: `https://github.com/PacktPublishing/Linux-Kernel-Programming/tree/master/Linux-Kernel-Programming-(Part-2)`.

Chúng tôi thực sự hy vọng bạn học được nhiều điều và yêu thích cuốn sách này. Được rồi, bây giờ hãy chuyển sang chủ đề trước mắt và tìm hiểu cách thiết lập kernel workspace phù hợp, để bạn có thể tận dụng tối đa cuốn sách qua những buổi hands-on.

## Thiết lập kernel workspace

Để tận dụng tối đa cuốn sách, điều rất quan trọng là trước tiên bạn phải thiết lập môi trường workspace mà chúng ta sẽ dùng xuyên suốt sách. Chương này sẽ hướng dẫn chính xác cách thực hiện và bắt đầu.

Do giới hạn về dung lượng, bạn có thể tìm nội dung đầy đủ và mở rộng của chương này trong kho GitHub của sách, tại đây: `http://www.packtpub.com/sites/default/files/downloads/9781803232225_Online_Chapter.pdf`. Tôi đề nghị bạn tải xuống và đọc toàn bộ. Nội dung tiếp theo ở đây là phần giới thiệu cho chương đầu tiên của chúng ta. Xin cảm ơn!

Trong chương này, chúng ta sẽ cài một bản phân phối Linux (hay “distro”) gần đây dưới dạng máy ảo (Virtual Machine – VM), rồi thiết lập để có đầy đủ các gói phần mềm cần thiết. Chúng ta cũng sẽ clone source code của sách từ kho GitHub. Hơn nữa, chương này còn giới thiệu một vài dự án hữu ích sẽ hỗ trợ bạn trên hành trình thú vị khám phá Linux kernel.

Ngay từ đầu, có một điều tôi muốn nhấn mạnh: cách tốt nhất để học một điều gì đó là thông qua thực nghiệm, hands-on, không chỉ tin lời bất kỳ ai về bất kỳ điều gì mà phải tự thử và trải nghiệm. Vì vậy, cuốn sách cung cấp nhiều thí nghiệm hands-on và ví dụ kernel code mà bạn có thể, và thực sự phải, tự mình thử. Điều này sẽ giúp ích rất nhiều để bạn thực sự tiến bộ, học sâu và hiểu các khía cạnh khác nhau của phát triển Linux kernel và driver. Vì thế, hãy nhớ:

Hãy học bằng thực nghiệm! Đồng thời, hãy mạnh dạn, dám làm và thử nghiệm!

Chúng ta sẽ trình bày chi tiết các chủ đề sau trong chương này, giúp bạn thiết lập môi trường làm việc:

- Chạy Linux dưới dạng máy ảo khách

- Cài đặt Linux khách x86\_64

- Các dự án hữu ích bổ sung

## Yêu cầu kỹ thuật

Bạn sẽ cần một máy tính để bàn hoặc laptop hiện đại, tốt nhất là có cấu hình mạnh. Ubuntu Desktop đưa ra một số yêu cầu hệ thống tối thiểu được khuyến nghị để cài đặt và sử dụng bản phân phối tại đây: `https://help.ubuntu.com/community/Installation/SystemRequirements`. Tôi chắc chắn khuyên bạn chọn hệ thống vượt xa các khuyến nghị tối thiểu – hệ thống mạnh nhất trong khả năng bạn có thể sử dụng. Lý do là thực hiện các công việc như build Linux kernel từ source code là công việc tiêu tốn nhiều bộ nhớ và CPU-intensive. Rõ ràng, hệ thống host càng có nhiều RAM, CPU càng mạnh và dung lượng đĩa càng lớn thì càng tốt!

Như bất kỳ nhà phát triển kernel dày dạn nào, tôi cho rằng làm việc trên hệ thống Linux chạy trực tiếp trên phần cứng là tốt nhất. Tuy nhiên, với cuốn sách này, chúng tôi không thể giả định rằng bạn luôn có sẵn một máy riêng chạy Linux trực tiếp trên phần cứng. Vì vậy, chúng ta sẽ giả định bạn làm việc trên Linux khách. Làm việc trong máy ảo khách cũng bổ sung một lớp cách ly, nhờ đó tăng tính an toàn. Tất nhiên, nhược điểm là hiệu năng; làm việc trên máy Linux high-spec chạy trực tiếp trên phần cứng có thể nhanh gấp đôi so với máy ảo!

## Clone kho source code của sách

Toàn bộ source code của sách được cung cấp miễn phí trên GitHub tại `https://github.com/PacktPublishing/Linux-Kernel-Programming_2E`. Bạn có thể clone và làm việc với source code bằng cách clone cây `git` như sau:

```
git clone https://github.com/PacktPublishing/Linux-Kernel-Programming_2E
```

Source code được tổ chức theo từng chương. Mỗi chương được biểu diễn bằng một thư mục – ví dụ, `ch1/` chứa source code cho chương này. Gốc source tree có một số mã dùng chung cho tất cả các chương, chẳng hạn các tệp source code `convenient.h` và `klib.c`, cùng những tệp khác.

Để duyệt code hiệu quả, tôi rất khuyến khích bạn luôn tạo index cho các code base bằng `ctags` hoặc `cscope`, hoặc cả hai. Ví dụ, để thiết lập index `ctags` trên một source tree, chỉ cần `cd` đến gốc source tree rồi gõ `ctags -R`. Nếu chưa làm, hãy đầu tư thời gian học các công cụ duyệt code như `cscope` và `ctags`.

Trừ khi có ghi chú khác, kết quả chạy mã chúng tôi trình bày trong sách là kết quả trên máy ảo khách Ubuntu 22.04 LTS x86\_64 (chạy dưới Oracle VirtualBox 7.0). Bạn cần hiểu rằng do khác biệt giữa các bản phân phối (thường nhỏ) – và ngay cả trong cùng bản phân phối nhưng khác phiên bản – kết quả trong sách có thể không hoàn toàn khớp những gì bạn thấy trên hệ thống Linux của mình.

Đến đây, tôi để bạn tự tải xuống (từ kho GitHub của sách) và đọc đầy đủ Chương 1, rồi tiếp tục thiết lập kernel workspace như mô tả trong đó.

Khi bạn hoàn tất, tôi sẽ giả định môi trường làm việc cho các chương tiếp theo đã sẵn sàng. Tuyệt vời. Tiếp theo, hãy cùng tiến vào khám phá thế giới đầy thử thách của phát triển Linux kernel; hành trình kernel của bạn sắp bắt đầu! Hai chương tiếp theo sẽ hướng dẫn cách tải xuống, giải nén, cấu hình và build Linux kernel từ source code.

## Tìm hiểu thêm trên Discord

Để tham gia cộng đồng Discord của sách – nơi bạn có thể chia sẻ phản hồi, đặt câu hỏi cho tác giả và tìm hiểu các bản phát hành mới – hãy quét mã QR bên dưới:

`https://packt.link/SecNet`
