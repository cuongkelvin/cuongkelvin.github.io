# 12 Đối thoại về Memory Virtualization

Sinh viên: Vậy chúng ta học xong virtualization rồi ạ?

Giáo sư: Chưa!

Sinh viên: Ơ, có cần phản ứng mạnh thế đâu; em chỉ hỏi thôi. Sinh viên được khuyến khích làm vậy, đúng không?

Giáo sư: Giáo sư luôn nói vậy, nhưng thật ra ý là: hãy hỏi nếu câu hỏi hay và em thực sự đã suy nghĩ một chút.

Sinh viên: Thế thì cụt hứng quá.

Giáo sư: Nhiệm vụ hoàn thành. Dù sao, ta còn lâu mới xong virtualization! Em mới thấy cách virtualize CPU, nhưng thực sự còn con quái vật lớn đợi trong tủ: memory. Virtualize memory phức tạp và đòi hỏi hiểu nhiều chi tiết tinh vi hơn về tương tác giữa hardware và OS.

Sinh viên: Nghe hay đấy. Sao lại khó thế ạ?

Giáo sư: Có rất nhiều chi tiết, và em phải nắm rõ chúng để hình thành mô hình trong đầu về những gì đang diễn ra. Ta bắt đầu đơn giản với kỹ thuật cơ bản như base/bounds, rồi tăng dần độ phức tạp để xử lý thách thức mới, gồm chủ đề thú vị như TLB và page table multi-level. Cuối cùng, ta có thể mô tả hoạt động của virtual memory manager hiện đại fully-functional.

Sinh viên: Hay quá! Có mẹo nào cho sinh viên tội nghiệp ngập trong thông tin và thường xuyên sleep-deprived không ạ?

Giáo sư: Thiếu ngủ thì dễ: ngủ thêm (và tiệc tùng ít đi). Để hiểu virtual memory, bắt đầu từ điều này: mọi address do user program tạo đều là virtual address. OS chỉ cung cấp ảo giác cho mỗi process, cụ thể rằng nó có memory lớn và riêng; với hardware hỗ trợ, OS biến virtual address giả định thành physical address thực, nhờ đó tìm được thông tin mong muốn. Sinh viên: Vâng, em nghĩ nhớ được... (tự nhủ) mọi address từ user program đều virtual, mọi address từ user program đều virtual, mọi ...

Giáo sư: Em lẩm bẩm gì vậy?

Sinh viên: Không có gì ạ.... (ngừng lại ngượng ngùng) ... Dù sao, vì sao OS lại muốn cung cấp ảo giác này nhỉ?

Giáo sư: Chủ yếu để dễ sử dụng: OS cho mỗi chương trình cách nhìn rằng có address space lớn, liên tục để chứa code và dữ liệu; vì thế, là lập trình viên, em không bao giờ phải lo những điều như “nên lưu variable này ở đâu?” vì virtual address space lớn và có nhiều chỗ. Cuộc sống lập trình viên khó hơn nhiều nếu phải lo nhét mọi code và dữ liệu vào memory nhỏ chật chội.

Sinh viên: Còn lý do gì nữa ạ?

Giáo sư: Isolation và protection cũng rất quan trọng. Ta không muốn chương trình sai sót có thể đọc, hay tệ hơn, ghi đè memory chương trình khác, đúng không?

Sinh viên: Có lẽ không. Trừ khi chương trình do người mình không thích viết.

Giáo sư: Hừm.... Có lẽ cần thêm học phần đạo đức vào lịch học kỳ tới của em. Có lẽ học phần OS chưa truyền đúng thông điệp.

Sinh viên: Có lẽ nên vậy. Nhưng thầy nhớ rằng không phải em là người dạy chúng ta rằng phản ứng thích hợp của OS trước hành vi sai của process là kill process vi phạm!
