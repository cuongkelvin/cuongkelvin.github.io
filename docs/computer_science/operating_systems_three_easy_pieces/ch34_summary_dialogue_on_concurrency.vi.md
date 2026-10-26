# 34 Đối thoại tổng kết về Concurrency

Giáo sư: Vậy, giờ em có đau đầu không?

Sinh viên: (uống hai viên Motrin) Dạ, hơi hơi. Thật khó hình dung tất cả những cách các thread có thể interleave.

Giáo sư: Đúng vậy. Thầy luôn kinh ngạc vì chỉ vài dòng code, khi có concurrent execution, lại có thể trở nên gần như không thể hiểu nổi.

Sinh viên: Em cũng vậy! Là một Computer Scientist mà không thể hiểu nổi năm dòng code thì thật đáng xấu hổ.

Giáo sư: Ôi, đừng cảm thấy tệ quá. Nếu đọc những bài báo đầu tiên về concurrent algorithm, em sẽ thấy đôi khi chúng cũng sai! Mà tác giả thường lại là giáo sư!

Sinh viên: (sửng sốt) Giáo sư cũng có thể ... ừm... sai ạ?

Giáo sư: Đúng, sự thật là vậy. Nhưng đừng nói với ai nhé — đó là một trong những bí mật nghề nghiệp của chúng ta.

Sinh viên: Em xin thề giữ bí mật. Nhưng nếu concurrent code khó suy nghĩ và khó viết cho đúng đến vậy, thì làm sao chúng ta viết được concurrent code chính xác?

Giáo sư: Đó mới là câu hỏi thực sự, phải không? Thầy nghĩ nên bắt đầu bằng vài điều đơn giản. Thứ nhất, hãy giữ mọi thứ đơn giản! Tránh những tương tác phức tạp giữa các thread, và dùng những cách well-known và tried-and-true để quản lý tương tác giữa các thread.

Sinh viên: Như locking đơn giản, và có thể là một producer-consumer queue?

Giáo sư: Chính xác! Đó là những mô hình phổ biến, và với những gì đã học, em phải có thể tạo ra các lời giải hoạt động được. Thứ hai, chỉ dùng concurrency khi thực sự cần thiết; hãy tránh nó bất cứ khi nào có thể. Không gì tệ hơn việc tối ưu hóa chương trình quá sớm.

Sinh viên: Em hiểu rồi — tại sao phải thêm thread khi không cần chúng?

Giáo sư: Chính xác. Thứ ba, nếu thực sự cần parallelism, hãy tìm nó ở những hình thức đơn giản hơn khác. Chẳng hạn, phương pháp Map-Reduce để viết code phân tích dữ liệu song song là một ví dụ xuất sắc về việc đạt được parallelism mà không phải xử lý những điều phức tạp khủng khiếp của lock, condition variable và những thứ khó chịu khác mà chúng ta đã nói tới. Sinh viên: Map-Reduce ạ? Nghe thú vị đấy — em sẽ phải tự đọc thêm về nó.

Giáo sư: Tốt! Em nên làm vậy. Cuối cùng, em sẽ phải tự đọc rất nhiều, vì những gì chúng ta cùng học chỉ có thể là phần giới thiệu sơ lược nhất về kho kiến thức phong phú ngoài kia. Đọc, đọc, rồi đọc thêm nữa! Sau đó hãy thử nghiệm, viết code, rồi lại viết thêm. Như Gladwell nói trong cuốn “Outliers”, em cần dành khoảng 10,000 giờ cho một việc để trở thành chuyên gia thực thụ. Em không thể làm tất cả những điều đó chỉ trong thời gian lên lớp!

Sinh viên: Chà, em không chắc điều đó khiến em nản lòng hay được khích lệ. Nhưng em sẽ cho rằng đó là điều thứ hai, và bắt tay vào việc! Đến lúc viết thêm concurrent code rồi...
