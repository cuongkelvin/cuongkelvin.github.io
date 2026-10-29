# Lời nói đầu (Preface)

Linux đã liên tục được dùng trong các sản phẩm cutting-edge, và các hệ thống embedded đã trở thành một phần gắn chặt trong danh mục công nghệ của nhân loại.

Yocto Project đang ở vị trí tối ưu để trở thành lựa chọn cho các dự án của bạn. Nó cung cấp một bộ công cụ phong phú giúp bạn dồn phần lớn sức lực và nguồn lực vào việc phát triển sản phẩm thay vì phát minh lại bánh xe.

Những công việc và yêu cầu thường gặp của các sản phẩm Linux-based embedded và của các nhóm phát triển là kim chỉ nam cho việc hình thành cuốn sách này. Ngoài ra, việc sách được viết bởi các thành viên đang hoạt động tích cực trong cộng đồng, với cách tiếp cận thực tế và thẳng thắn, là một bước đệm cho cả quá trình học của bạn lẫn dự án sản phẩm.

Trong ấn bản thứ ba này, cuốn sách đã được làm lại kỹ lưỡng để đưa vào phản hồi của độc giả từ các ấn bản trước và được mở rộng để giúp hiểu dễ hơn các khái niệm phức tạp liên quan đến Yocto Project, bên cạnh việc được cập nhật đầy đủ để phản ánh những thay đổi tính đến phiên bản Long Term Support 4.0 của Yocto Project (tên mã Kirkstone).

Hơn nữa, hai chương mới đã được thêm vào: một chương về việc dùng QEMU để đẩy nhanh việc phát triển sản phẩm nhờ emulation, và một chương về các hướng dẫn cho Yocto Project và cho dự án nói chung.

## Cuốn sách này dành cho ai

Cuốn sách này dành cho các kỹ sư và những người đam mê đã có kinh nghiệm với embedded Linux, muốn tìm hiểu các công cụ của Yocto Project để đánh giá, so sánh hoặc dùng trong một dự án. Cuốn sách nhằm giúp bạn nhanh chóng nắm bắt được công việc và tránh sa vào những cạm bẫy thường gặp trên con đường học.

## Cuốn sách này đề cập những gì

*Chương 1*, *Làm quen với Yocto Project*, trình bày những khái niệm và tiền đề đầu tiên để giới thiệu các phần của Yocto Project và các công cụ chính của nó.

*Chương 2*, *Build hệ thống Poky-Based của chúng ta*, giới thiệu môi trường cần thiết cho lần build đầu tiên.

*Chương 3*, *Dùng Toaster để build một image*, giới thiệu giao diện web user-friendly, có thể được dùng như một lớp bọc cấu hình và công cụ build.

*Chương 4*, *Làm quen với công cụ BitBake*, trình bày các khái niệm về metadata của BitBake.

*Chương 5*, *Nắm vững công cụ BitBake*, cho thấy cách BitBake quản lý các task và các dependency của chúng.

*Chương 6*, *Chi tiết về thư mục build tạm*, mô tả chi tiết thư mục output tạm của một lần build.

*Chương 7*, *Tìm hiểu cơ chế hỗ trợ đóng gói*, giải thích cơ chế đóng gói được dùng làm nền tảng để tạo và quản lý tất cả các binary package.

*Chương 8*, *Đi sâu vào metadata của BitBake*, mô tả chi tiết ngôn ngữ metadata của BitBake, thứ sẽ được dùng trong tất cả các chương khác.

*Chương 9*, *Phát triển với Yocto Project*, minh họa workflow cần thiết để có được một môi trường phát triển.

*Chương 10*, *Debug với Yocto Project*, cho thấy cách dùng Poky để tạo ra một môi trường debug và cách sử dụng môi trường đó.

*Chương 11*, *Khám phá các layer bên ngoài*, khám phá một trong những khái niệm quan trọng nhất của Yocto Project: tính linh hoạt của việc dùng các layer bên ngoài.

*Chương 12*, *Tạo các layer tùy chỉnh*, thực hành các bước tạo layer.

*Chương 13*, *Tùy chỉnh các recipe có sẵn*, trình bày các ví dụ về cách tùy chỉnh những recipe có sẵn.

*Chương 14*, *Tuân thủ GPL*, tóm tắt các công việc và khái niệm liên quan đến một sản phẩm tuân thủ copyleft.

*Chương 15*, *Boot hệ thống embedded Linux tùy chỉnh của chúng ta*, sử dụng các máy phần cứng thật và các công cụ của Yocto Project.

*Chương 16*, *Tăng tốc phát triển sản phẩm nhờ emulation – QEMU*, minh họa cách QEMU có thể đẩy nhanh việc phát triển sản phẩm.

*Chương 17*, *Các thực hành tốt nhất*, bàn về một số hướng dẫn về Yocto Project và các hướng dẫn project-related nói chung, dựa trên kinh nghiệm của tác giả.

## Để tận dụng tối đa cuốn sách này

Để hiểu cuốn sách này tốt hơn, điều rất quan trọng là bạn đã có sẵn một số kiến thức nền về những chủ đề không được đề cập hoặc chỉ được nhắc qua trong sách, như Git và kiến thức chung về Linux kernel cùng quá trình compile cơ bản của nó.

Để hiểu bức tranh tổng thể của Yocto Project trước khi đi vào các khái niệm kỹ thuật được trình bày chi tiết trong cuốn sách này, chúng tôi giới thiệu cuốn sách nhỏ mã nguồn mở *Heading for the Yocto Project*, có trong Git repository tại [https://git.io/vFUiI](https://git.io/vFUiI); nội dung của cuốn sách nhỏ này nhằm giúp người mới hiểu rõ hơn các mục tiêu của Yocto Project và những cách dùng tiềm năng của nó. Cuốn sách nhỏ này đưa ra cái nhìn tổng quan về dự án trước khi đi sâu vào chi tiết kỹ thuật về cách làm mọi thứ.

Bạn cần hiểu cơ bản cách dùng môi trường GNU/Linux và embedded Linux, cũng như các khái niệm chung được dùng trong phát triển, như compile, debug, deploy và cài đặt. Ngoài ra, có chút kinh nghiệm với shell script và Python là một lợi thế, vì đây là những ngôn ngữ lập trình cốt lõi được các công cụ của Yocto Project dùng rất nhiều.

Tuy nhiên, có thể bạn muốn tìm hiểu thêm về các chủ đề đó. Trong trường hợp này, chúng tôi giới thiệu cuốn sách *Mastering Embedded Linux Programming - Third Edition*, ISBN-13 978-1789530384, của Chris Simmonds.

Bạn không nên coi bất kỳ khái niệm còn thiếu nào – trong số những khái niệm chúng tôi đã liệt kê ở trên – là một trở ngại, mà là thứ bạn có thể học và đồng thời thực hành việc sử dụng chúng với cuốn sách này.

## Tải các hình ảnh màu

Chúng tôi cũng cung cấp một file PDF chứa các hình ảnh màu của các ảnh chụp màn hình và sơ đồ được dùng trong cuốn sách này. Bạn có thể tải tại đây: https://packt.link/lbpMD.

## Các quy ước được dùng

Cuốn sách này dùng một số quy ước về cách trình bày chữ.

`Code in text`: Biểu thị các từ là code trong văn bản, tên bảng database, tên folder, tên file, phần mở rộng file, đường dẫn, URL giả, dữ liệu người dùng nhập và Twitter handle. Đây là một ví dụ: “Ở dòng 8, `BBFILE_COLLECTIONS`, chúng ta yêu cầu BitBake tạo một metadata collection mới tên là `yocto`. Tiếp theo, ở dòng 9, `BBFILE_PATTERN_yocto`, chúng ta định nghĩa quy tắc để khớp tất cả các đường dẫn bắt đầu bằng `LAYERDIR` nhằm nhận diện metadata thuộc về collection `yocto`.”

Mọi input hoặc output command-line được viết như sau:

```
$ sudo dnf install gawk make wget tar bzip2 gzip python3 unzip perl patch diffutils diffstat git cpp gcc gcc-c++ glibc-devel texinfo chrpath ccache perl-Data-Dumper perl-Text-ParseWords perl-Thread-Queue perl-bignum socat python3-pexpect findutils which file cpio python python3-pip xz python3-GitPython python3-jinja2 SDL-devel xterm rpcgen mesa-libGL-devel perl-FindBin perl-File-Compare perl-File-Copy perl-locale zstd lz4
```

**Bold**: Biểu thị một thuật ngữ mới, một từ quan trọng hoặc những từ bạn thấy trên màn hình. Ví dụ, các từ trong menu hoặc hộp thoại xuất hiện dưới dạng **bold**. Đây là một ví dụ: “Sau đó, nhấn vào tab **Image recipes** để chọn image bạn muốn build.”

> **Mẹo hoặc lưu ý quan trọng**
>
> Xuất hiện như thế này.

## Liên hệ

Chúng tôi luôn hoan nghênh phản hồi từ độc giả.

**Phản hồi chung**: Nếu bạn có câu hỏi về bất kỳ khía cạnh nào của cuốn sách này, hãy email cho chúng tôi tại [customercare@packtpub.com](mailto:customercare@packtpub.com) và ghi tên cuốn sách trong tiêu đề thư.

**Errata**: Mặc dù chúng tôi đã hết sức cẩn thận để bảo đảm độ chính xác của nội dung, sai sót vẫn có thể xảy ra. Nếu bạn phát hiện một lỗi trong cuốn sách này, chúng tôi sẽ rất biết ơn nếu bạn báo cho chúng tôi. Vui lòng truy cập [www.packtpub.com/support/errata](http://www.packtpub.com/support/errata) và điền vào biểu mẫu.

**Vi phạm bản quyền**: Nếu bạn bắt gặp bất kỳ bản sao bất hợp pháp nào của các tác phẩm của chúng tôi dưới bất kỳ hình thức nào trên internet, chúng tôi sẽ rất biết ơn nếu bạn cung cấp cho chúng tôi địa chỉ hoặc tên website đó. Vui lòng liên hệ với chúng tôi tại [copyright@packt.com](mailto:copyright@packt.com) kèm link đến tài liệu đó.

**Nếu bạn quan tâm đến việc trở thành tác giả**: Nếu có một chủ đề mà bạn có chuyên môn và bạn quan tâm đến việc viết hoặc đóng góp cho một cuốn sách, hãy truy cập [authors.packtpub.com](http://authors.packtpub.com).

## Chia sẻ cảm nhận của bạn

Khi bạn đã đọc *Embedded Linux Development Using Yocto Project*, chúng tôi rất muốn nghe cảm nhận của bạn! Vui lòng [nhấn vào đây để đến thẳng trang đánh giá trên Amazon](https://packt.link/r/1804615064) của cuốn sách này và chia sẻ phản hồi của bạn.

Đánh giá của bạn rất quan trọng đối với chúng tôi và cộng đồng công nghệ, và sẽ giúp chúng tôi bảo đảm rằng mình đang mang đến nội dung có chất lượng xuất sắc.

## Tải miễn phí bản PDF của cuốn sách này

Cảm ơn bạn đã mua cuốn sách này!

Bạn có thích đọc mọi lúc mọi nơi nhưng không thể mang sách in theo khắp nơi? Bản eBook bạn mua có không tương thích với thiết bị bạn chọn không?

Đừng lo, giờ đây với mỗi cuốn sách của Packt, bạn được nhận miễn phí một bản PDF DRM-free của cuốn sách đó.

Đọc ở bất cứ đâu, bất cứ nơi nào, trên bất kỳ thiết bị nào. Tìm kiếm, copy và paste code từ những cuốn sách kỹ thuật bạn yêu thích thẳng vào ứng dụng của bạn.

Quyền lợi chưa dừng lại ở đó, bạn có thể nhận quyền truy cập độc quyền vào các ưu đãi giảm giá, bản tin và nội dung miễn phí tuyệt vời trong hộp thư mỗi ngày

Làm theo các bước đơn giản sau để nhận các quyền lợi:

1. Quét mã QR hoặc truy cập link dưới đây

![](images/B19361_QR_Free_PDF.jpg)

*[https://packt.link/free-ebook/9781804615065](https://packt.link/free-ebook/9781804615065)*

2. Gửi bằng chứng mua hàng của bạn
3. Vậy là xong! Chúng tôi sẽ gửi bản PDF miễn phí và các quyền lợi khác thẳng đến email của bạn
