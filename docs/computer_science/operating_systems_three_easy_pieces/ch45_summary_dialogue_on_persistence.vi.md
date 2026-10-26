# 45 Đối thoại tổng kết về Persistence

Sinh viên: Chà, file system có vẻ thú vị(!), nhưng cũng phức tạp thật.

Giáo sư: Đó là lý do thầy và người bạn đời của mình nghiên cứu lĩnh vực này.

Sinh viên: Khoan đã. Thầy là một trong những giáo sư viết cuốn sách này ạ? Em cứ tưởng cả hai chúng ta chỉ là những nhân vật hư cấu, dùng để tóm tắt vài ý chính và có lẽ thêm chút hài hước khi học operating system.

Giáo sư: Ừm... à... có thể. Mà không phải chuyện của em! Thế em nghĩ ai đang viết những thứ này? (thở dài) Dù sao thì tiếp tục nào: em đã học được gì?

Sinh viên: Dạ, em nghĩ mình đã hiểu một trong những ý chính: quản lý data trong thời gian dài (một cách bền vững) khó hơn nhiều so với quản lý data không cần tồn tại bền vững (như những thứ trong memory). Suy cho cùng, nếu máy crash, nội dung memory biến mất! Nhưng những thứ trong file system phải tồn tại mãi mãi.

Giáo sư: Như bạn thầy, Kevin Hultquist, thường nói: “Mãi mãi là một khoảng thời gian dài”; dù lúc đó anh ấy đang nói về những chiếc cọc đặt bóng golf bằng nhựa, câu này đặc biệt đúng với đống rác trong phần lớn file system.

Sinh viên: Thầy hiểu ý em mà! Ít nhất cũng phải tồn tại trong thời gian dài. Và ngay cả những việc đơn giản, như cập nhật thiết bị persistent storage, cũng phức tạp vì phải quan tâm điều gì xảy ra nếu hệ thống crash. Recovery, điều em chưa từng nghĩ đến khi chúng ta virtualize memory, giờ lại trở nên rất quan trọng!

Giáo sư: Quá đúng. Cập nhật persistent storage từ trước đến nay vẫn luôn là vấn đề thú vị và đầy thách thức.

Sinh viên: Em còn được học những thứ hay như disk scheduling, các kỹ thuật data protection như RAID và cả checksum. Những thứ đó thật thú vị.

Giáo sư: Thầy cũng thích những chủ đề đó. Tuy nhiên, nếu thực sự tìm hiểu sâu, chúng có thể mang hơi hướng toán học. Hãy xem một số nghiên cứu mới nhất về erasure code nếu em muốn đau đầu.

Sinh viên: Em sẽ tìm hiểu ngay ạ. Giáo sư: (cau mày) Thầy nghĩ em đang nói mỉa. Vậy em còn thích điều gì khác?

Sinh viên: Em còn thích cả những suy nghĩ kỹ lưỡng đã được dành cho việc xây dựng các hệ thống technology-aware, như FFS và LFS. Thật hay! Hiểu đặc tính của disk có vẻ rất hữu ích. Nhưng điều đó còn quan trọng nữa không khi có Flash và tất cả những công nghệ mới nhất hiện nay?

Giáo sư: Câu hỏi hay! Và cũng nhắc thầy phải bắt tay vào viết chương Flash... (nguệch ngoạc ghi chú nhắc mình) ... Nhưng đúng vậy, ngay cả với Flash, tất cả những điều này vẫn có giá trị áp dụng, thật đáng kinh ngạc. Chẳng hạn, bên trong, Flash Translation Layer (FTL) sử dụng log-structuring để cải thiện performance và reliability của SSD Flash-based. Và suy nghĩ về locality luôn hữu ích. Vì vậy, dù công nghệ có thể thay đổi, nhiều ý tưởng chúng ta đã học vẫn tiếp tục hữu ích, ít nhất trong một thời gian nữa.

Sinh viên: Vậy thì tốt quá. Em vừa dành bao nhiêu thời gian học những thứ đó, nên không muốn tất cả lại thành công cốc!

Giáo sư: Các giáo sư đâu có làm vậy với em, phải không?
