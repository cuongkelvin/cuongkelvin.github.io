Extreme C

Đưa bạn chạm đến giới hạn trong Concurrency, OOP và những khả năng tiên tiến nhất của C

Kamran Amini

![](images/Image1155.png)

BIRMINGHAM - MUMBAI

Extreme C

Copyright © 2019 Packt Publishing

Tất cả các quyền được bảo lưu. Không phần nào của cuốn sách này được phép sao chép, lưu trữ trong hệ thống truy xuất hoặc truyền tải dưới bất kỳ hình thức nào hay bằng bất kỳ phương tiện nào mà không có sự cho phép trước bằng văn bản của nhà xuất bản, ngoại trừ trường hợp các trích dẫn ngắn được đưa vào các bài viết phê bình hoặc bài đánh giá.

Mọi nỗ lực đã được thực hiện trong quá trình biên soạn cuốn sách này nhằm bảo đảm tính chính xác của thông tin được trình bày. Tuy nhiên, thông tin trong cuốn sách này được bán ra mà không có bảo đảm dưới bất kỳ hình thức nào, dù rõ ràng hay ngụ ý. Cả tác giả, Packt Publishing lẫn các đại lý và nhà phân phối của họ đều sẽ không chịu trách nhiệm đối với bất kỳ thiệt hại nào do cuốn sách này gây ra hoặc bị cáo buộc là gây ra trực tiếp hoặc gián tiếp.

Packt Publishing đã nỗ lực cung cấp thông tin nhãn hiệu thương mại về tất cả các công ty và sản phẩm được đề cập trong cuốn sách này bằng cách viết hoa phù hợp. Tuy nhiên, Packt Publishing không thể bảo đảm tính chính xác của thông tin này.

**Acquisition Editor:** Andrew Waldron

**Acquisition Editor – Peer Reviews:** Suresh Jain

**Content Development Editor:** Ian Hough

**Technical Editor:** Gaurav Gavas

**Project Editor:** Kishor Rit

**Proofreader:** Safis Editing

**Indexer:** Rekha Nair

**Presentation Designer:** Sandip Tadge

First published: Tháng 10 năm 2019

Production reference: 1301019

Xuất bản bởi Packt Publishing Ltd.

Livery Place

35 Livery Street

Birmingham B3 2PB, UK.

ISBN 978-1-78934-362-5

www.packt.com

![](images/Image1164.png)

[packt.com](https://subscribe.packtpub.com/)

Đăng ký thư viện kỹ thuật số trực tuyến của chúng tôi để có toàn quyền truy cập vào hơn 7,000 cuốn sách và video, cũng như các công cụ hàng đầu trong ngành giúp bạn lập kế hoạch phát triển cá nhân và thăng tiến trong sự nghiệp. Để biết thêm thông tin, vui lòng truy cập trang web của chúng tôi.

<a id="_idParaDest-1"></a>

# Tại sao nên đăng ký?

- Dành ít thời gian học hơn và nhiều thời gian viết code hơn với các eBook và Video thực hành từ hơn 4,000 chuyên gia trong ngành
- Học tập hiệu quả hơn với các Skill Plan được xây dựng dành riêng cho bạn
- Nhận một eBook hoặc video miễn phí mỗi tháng
- Khả năng tìm kiếm toàn diện để dễ dàng truy cập vào những thông tin quan trọng
- Sao chép và dán, in ấn, và đánh dấu nội dung

Bạn có biết rằng Packt cung cấp phiên bản eBook cho mọi cuốn sách được xuất bản, với các file PDF và ePub có sẵn không? Bạn có thể nâng cấp lên phiên bản eBook tại [www.Packt.com](http://www.Packt.com) và với tư cách là khách hàng mua sách in, bạn được hưởng mức giảm giá cho bản sao eBook. Hãy liên hệ với chúng tôi tại [customercare@packtpub.com](mailto:customercare@packtpub.com) để biết thêm chi tiết.

Tại [www.Packt.com](http://www.packtpub.com/), bạn cũng có thể đọc bộ sưu tập các bài viết kỹ thuật miễn phí, đăng ký nhận hàng loạt bản tin miễn phí và nhận các ưu đãi cùng chiết khấu độc quyền cho sách và eBook của Packt.

<a id="_idParaDest-2"></a>

## Những người đóng góp

<a id="_idParaDest-3"></a>

## Về tác giả

Kamran Amini là một chuyên gia cao cấp (senior professional) chuyên về phát triển embedded và kernel. Anh đã làm việc cho nhiều công ty well-known của Iran với tư cách là senior engineer, architect, consultant và CTO. Vào năm 2017, anh chuyển đến châu Âu để làm senior architect và engineer cho các công ty rất có uy tín như Jeppesen, Adecco, TomTom và ActiveVideo Networks. Trong thời gian sinh sống tại Amsterdam, anh đã viết cuốn sách này. Các lĩnh vực quan tâm chính của anh là lý thuyết tính toán (computation theory), hệ thống phân tán (distributed systems), machine learning, lý thuyết thông tin (information theory) và tính toán lượng tử (quantum computation). Song song với sự nghiệp chuyên môn, anh đang theo học ngành thiên văn học và khoa học hành tinh. Các lĩnh vực quan tâm học thuật của anh liên quan đến sự phát triển ban đầu của vũ trụ, hình học của các lỗ đen, lý thuyết trường lượng tử (quantum field theory) và lý thuyết dây (string theory).

Tôi muốn gửi lời cảm ơn tới mẹ tôi, bà Ehteram, người đã cống hiến cả cuộc đời để nuôi dạy tôi và em trai tôi, Ashkan. Tôi tin chắc rằng bà luôn luôn cổ vũ tôi.

Và tôi muốn gửi lời cảm ơn tới người vợ xinh đẹp và yêu dấu của tôi, Afsaneh, người đã luôn ủng hộ tôi trên từng bước đường, đặc biệt là trong suốt thời gian tôi thực hiện cuốn sách này. Nếu không có sự kiên nhẫn và động viên của cô ấy, tôi tin chắc rằng mình đã không thể đi xa được đến mức này.

<a id="_idParaDest-4"></a>

## Về những người đánh giá

**Aliakbar Abbasi** là một software developer với hơn sáu năm kinh nghiệm sử dụng nhiều công nghệ và ngôn ngữ lập trình khác nhau. Anh là một chuyên gia về OOP, C/C++ và Python. Anh thích đọc sách kỹ thuật và mở rộng kiến thức của mình về phát triển phần mềm. Hiện nay, anh sống tại Amsterdam cùng vợ và làm việc cho TomTom với tư cách là một senior software engineer.

**Rohit Talwalkar** là một software developer dày dạn kinh nghiệm và là chuyên gia về các ngôn ngữ C, C++ và Java. Anh từng làm việc trên các hệ điều hành độc quyền **RTOS** (**Real Time OS**), các thiết bị Windows và Windows Mobile, cùng nền tảng Android để phát triển các application, driver và service.

Anh đã nhận bằng B. Tech từ viện công nghệ uy tín Indian Institute of Technology tại Mumbai, có bằng thạc sĩ về computer science và hiện đang làm việc trong lĩnh vực mixed reality với vai trò application development lead engineer. Trước đây anh từng làm việc cho Motorola và BlackBerry, và hiện đang làm việc tại Magic Leap – công ty sản xuất kính mixed reality và chuyên về spatial computing. Trong quá khứ, Rohit từng tham gia đánh giá cuốn sách *C++ for the Impatient* của tác giả Brian Overland.

Tôi muốn gửi lời cảm ơn tới Tiến sĩ Clovis Tondo, người đã dạy tôi C, C++, Java và rất nhiều điều khác trong cuộc sống.
