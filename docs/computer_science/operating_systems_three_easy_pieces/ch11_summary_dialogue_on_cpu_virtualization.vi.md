# 11 Đối thoại tổng kết về CPU Virtualization

Giáo sư: Vậy, Sinh viên, em có học được gì không?

Sinh viên: Thưa Giáo sư, có vẻ đây là câu hỏi gài sẵn. Em nghĩ thầy chỉ muốn em nói “có.”

Giáo sư: Đúng thế. Nhưng vẫn là câu hỏi thật lòng. Thôi nào, nương tay cho giáo sư một chút được không?

Sinh viên: Được rồi, được rồi. Em nghĩ có học được vài điều. Đầu tiên, em học một chút về cách OS virtualize CPU. Có nhiều mechanism quan trọng phải hiểu để nắm được: trap và trap handler, timer interrupt, cùng cách OS và hardware phải cẩn thận lưu và khôi phục trạng thái khi chuyển giữa các process.

Giáo sư: Tốt, tốt!

Sinh viên: Nhưng các tương tác đó có vẻ hơi phức tạp; làm sao em học thêm được ạ?

Giáo sư: Câu hỏi hay. Thầy nghĩ không gì thay được thực hành; chỉ đọc về những điều này chưa giúp em hiểu chúng một cách đầy đủ. Hãy làm các dự án của học phần, thầy cá rằng tới cuối em sẽ phần nào thấy mọi thứ hợp lý.

Sinh viên: Nghe được đấy. Em còn có thể nói gì với thầy nữa?

Giáo sư: Trong hành trình hiểu mechanism cơ bản, em có cảm nhận được triết lý của OS không?

Sinh viên: Ừm... em nghĩ có. Dường như OS khá đa nghi. Nó muốn bảo đảm luôn nắm quyền điều khiển máy. Dù muốn chương trình chạy hiệu quả nhất có thể (vì thế mới có toàn bộ lý do đằng sau limited direct execution), OS cũng muốn có thể nói “À! Đừng vội thế bạn ơi” khi process sai sót hoặc độc hại. Sự đa nghi chi phối và chắc chắn giữ OS nắm quyền máy. Có lẽ vì thế ta xem OS là resource manager.

Giáo sư: Đúng vậy — có vẻ em bắt đầu xâu chuỗi mọi thứ rồi! Tốt lắm.

Sinh viên: Cảm ơn thầy. Giáo sư: Còn policy bên trên mechanism thì sao — có bài học thú vị nào không?

Sinh viên: Chắc chắn có. Có lẽ hơi hiển nhiên, nhưng hiển nhiên cũng tốt. Như đưa job ngắn lên đầu queue — em biết đó là ý hay từ lần mua kẹo cao su ở cửa hàng, người phía trước có thẻ tín dụng không dùng được. Phải nói, ông ấy chẳng phải job ngắn.

Giáo sư: Nghe hơi thiếu lịch sự với người tội nghiệp đó đấy. Còn gì nữa?

Sinh viên: Có thể xây dựng scheduler thông minh cố giống cả SJF lẫn RR cùng lúc — MLFQ khá hay. Xây dựng scheduler thực tế có vẻ khó.

Giáo sư: Thật vậy. Vì thế đến nay vẫn tranh cãi nên dùng scheduler nào; chẳng hạn những cuộc chiến Linux giữa CFS, BFS và O(1). Và không, tôi sẽ không nói đầy đủ tên BFS.

Sinh viên: Em cũng không yêu cầu thầy nói đâu! Những cuộc chiến policy này có vẻ kéo dài mãi; có thực sự tồn tại một câu trả lời đúng không ạ?

Giáo sư: Có lẽ không. Dù sao chính metric cũng mâu thuẫn: nếu scheduler tốt về turnaround time thì tệ về response time và ngược lại. Như Lampson nói, có lẽ mục tiêu không phải tìm lời giải tốt nhất mà tránh thảm họa.

Sinh viên: Hơi buồn nhỉ.

Giáo sư: Kỹ thuật tốt có thể như vậy. Nhưng cũng có thể truyền cảm hứng! Thực sự tùy góc nhìn. Cá nhân thầy nghĩ có tinh thần thực tiễn là điều tốt, và người có tinh thần thực tiễn nhận ra rằng không phải mọi vấn đề đều có lời giải gọn gàng, dễ dàng. Còn gì thu hút em không?

Sinh viên: Em rất thích ý tưởng lách scheduler; có lẽ đáng tìm hiểu lần sau chạy job trên dịch vụ EC2 của Amazon. Có thể em lấy trộm được vài cycle từ khách hàng khác không hề hay biết (và quan trọng hơn là OS-ignorant)!

Giáo sư: Có vẻ thầy đã tạo ra một con quái vật rồi! Em biết đấy, thầy không muốn được gọi là Giáo sư Frankenstein.

Sinh viên: Nhưng chẳng phải đó là mục đích sao? Khiến chúng em hào hứng đến mức tự tìm hiểu? Khơi ngọn lửa và những điều như vậy?

Giáo sư: Thầy đoán là vậy. Nhưng thầy không nghĩ cách đó lại có tác dụng!
