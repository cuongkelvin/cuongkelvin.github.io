# 1 Đối thoại về cuốn sách

Giáo sư: Chào mừng em đến với cuốn sách này! Cuốn sách có tên Operating Systems in Three Easy Pieces, và tôi ở đây để dạy em những điều cần biết về operating system. Tôi được gọi là “Giáo sư”; còn em là ai?

Sinh viên: Chào Giáo sư! Em được gọi là “Sinh viên”, chắc thầy cũng đoán ra rồi. Và em đã có mặt, sẵn sàng học hỏi!

Giáo sư: Tốt lắm. Em có câu hỏi nào không?

Sinh viên: Có chứ ạ! Vì sao sách lại có tên “Three Easy Pieces”?

Giáo sư: Câu này dễ thôi. Em biết đấy, Richard Feynman có những bài giảng Vật lý rất hay...

Sinh viên: Ồ! Người viết cuốn “Surely You’re Joking, Mr. Feynman” phải không ạ? Cuốn đó hay lắm! Cuốn này cũng sẽ hài hước như cuốn đó chứ ạ?

Giáo sư: Ừm... à, không. Cuốn đó rất hay, và tôi mừng vì em đã đọc nó. Hy vọng cuốn sách này sẽ giống các ghi chép bài giảng Vật lý của ông ấy hơn. Một số kiến thức cơ bản đã được tổng hợp trong cuốn sách có tên “Six Easy Pieces”. Ông ấy nói về Vật lý; còn chúng ta sẽ tìm hiểu Three Easy Pieces về một chủ đề thú vị là Operating Systems. Như vậy cũng hợp lý, vì Operating Systems chỉ khó bằng khoảng một nửa Vật lý thôi.

Sinh viên: À, em thích Vật lý, nên có lẽ như vậy cũng tốt. Những phần đó là gì ạ?

Giáo sư: Đó là ba ý tưởng then chốt mà chúng ta sẽ học: virtualization, concurrency và persistence. Khi tìm hiểu những ý tưởng này, chúng ta sẽ học đầy đủ về cách một operating system hoạt động, bao gồm cách nó quyết định chương trình nào sẽ chạy tiếp theo trên CPU, cách nó xử lý tình trạng quá tải memory trong một hệ thống virtual memory, cách virtual machine monitor hoạt động, cách quản lý thông tin trên đĩa, và thậm chí một chút về cách xây dựng distributed system vẫn hoạt động khi một số thành phần đã hỏng. Đại loại là những điều như vậy.

Sinh viên: Thật sự thì em chẳng hiểu thầy đang nói gì cả.

Giáo sư: Tốt! Điều đó có nghĩa là em đã vào đúng lớp rồi.

Sinh viên: Em còn một câu hỏi nữa: cách tốt nhất để học những điều này là gì ạ?

Giáo sư: Câu hỏi rất hay! Tất nhiên, mỗi người cần tự tìm ra cách phù hợp với mình, nhưng đây là cách tôi sẽ làm: đến lớp để nghe giáo sư giới thiệu nội dung. Sau đó, vào cuối mỗi tuần, đọc những ghi chép này để các ý tưởng thấm vào đầu em rõ hơn một chút. Tất nhiên, một thời gian sau (gợi ý: trước kỳ thi!), hãy đọc lại các ghi chép để củng cố kiến thức. Chắc chắn giáo sư của em cũng sẽ giao bài tập về nhà và các dự án, nên em cần làm những bài đó; đặc biệt, thực hiện các dự án trong đó em viết code thực tế để giải quyết vấn đề thực tế là cách tốt nhất để vận dụng những ý tưởng trong các ghi chép này. Như Khổng Tử từng nói...

Sinh viên: Ồ, em biết rồi! ‘Tôi nghe thì tôi quên. Tôi thấy thì tôi nhớ. Tôi làm thì tôi hiểu.’ Hoặc đại loại như vậy.

Giáo sư: (ngạc nhiên) Sao em biết tôi sắp nói gì?!

Sinh viên: Em thấy câu đó có vẻ hợp với mạch chuyện. Với lại, em rất hâm mộ Khổng Tử, và còn hâm mộ Tuân Tử hơn nữa; thực ra, Tuân Tử mới là nguồn dẫn phù hợp hơn cho câu nói này[^1].

Giáo sư: (sững sờ) À, tôi nghĩ chúng ta sẽ rất hợp nhau đấy! Quả thật là rất hợp nhau.

Sinh viên: Thưa Giáo sư – cho phép em hỏi thêm một câu nữa thôi. Những đoạn đối thoại này để làm gì ạ? Ý em là, đây chẳng phải chỉ là một cuốn sách thôi sao? Tại sao không trình bày thẳng nội dung luôn?

Giáo sư: À, câu hỏi hay, câu hỏi hay! Tôi nghĩ đôi khi sẽ hữu ích nếu ta tạm bước ra khỏi mạch trình bày để suy ngẫm một chút; những đoạn đối thoại này chính là những lúc như vậy. Vậy nên em và tôi sẽ cùng nhau tìm hiểu cho rõ tất cả những ý tưởng khá phức tạp này. Em sẵn sàng chứ?

Sinh viên: Vậy là chúng ta phải suy nghĩ ạ? Được thôi, em sẵn sàng. Ý em là, dù sao thì em còn có việc gì khác để làm đâu? Cuộc sống của em ngoài cuốn sách này cũng chẳng có gì nhiều.

Giáo sư: Đáng buồn là tôi cũng vậy. Thế thì bắt tay vào việc thôi!

---

[^1]: Theo trang web này (http://www.barrypopik.com/index.php/new_york_city/entry/tell_me_and_i_forget_teach_me_and_i_may_remember_involve_me_and_i_will_lear/), triết gia Nho học Tuân Tử nói: “Chưa nghe về một điều không bằng đã nghe; đã nghe không bằng đã thấy; đã thấy không bằng biết; biết không bằng đem ra thực hành.” Về sau, không rõ vì sao lời dạy này lại được gán cho Khổng Tử. Cảm ơn Jiao Dong (Rutgers) đã cho chúng tôi biết!
