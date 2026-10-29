# 24 Đối thoại tổng kết về Memory Virtualization

Sinh viên: (Nuốt nước bọt) Chà, nhiều nội dung thật đấy.

Giáo sư: Đúng, rồi sao?

Sinh viên: Thế làm sao em nhớ hết được đây? Thầy biết đấy, để đi thi ấy?

Giáo sư: Trời ơi, thầy hy vọng đó không phải lý do em cố ghi nhớ chúng.

Sinh viên: Vậy thì vì sao ạ?

Giáo sư: Thôi nào, thầy tưởng em hiểu hơn thế. Em đang học một điều gì đó ở đây, để khi bước ra thế giới, em hiểu các hệ thống thực sự hoạt động như thế nào.

Sinh viên: Hmm... thầy cho em một ví dụ được không?

Giáo sư: Được chứ! Hồi học cao học, có lần thầy và các bạn đo thời gian memory access, và thỉnh thoảng các con số cao hơn rất nhiều so với dự kiến; bọn thầy nghĩ mọi dữ liệu đều nằm gọn trong hardware cache second-level, em hiểu chứ, nên đáng lẽ truy cập phải thật nhanh.

Sinh viên: (gật đầu)

Giáo sư: Bọn thầy không hiểu chuyện gì đang xảy ra. Vậy làm gì trong trường hợp đó? Dễ thôi, hỏi giáo sư! Thế là bọn thầy đến hỏi một giáo sư, người nhìn vào đồ thị bọn thầy tạo ra rồi chỉ nói “TLB”. Aha! Dĩ nhiên rồi, TLB miss! Sao bọn thầy không nghĩ đến nhỉ? Một mô hình tốt về cách virtual memory hoạt động giúp chẩn đoán đủ loại vấn đề hiệu năng thú vị.

Sinh viên: Em nghĩ mình hiểu rồi. Em đang cố xây dựng những mô hình trong đầu về cách mọi thứ hoạt động, để khi ra ngoài tự làm việc, em không ngạc nhiên khi hệ thống không hoàn toàn hoạt động như mong đợi. Thậm chí em phải có thể dự đoán hệ thống sẽ hoạt động thế nào chỉ bằng cách suy nghĩ về nó.

Giáo sư: Chính xác. Vậy em đã học được gì? Mô hình trong đầu em về cách virtual memory hoạt động gồm những gì?

Sinh viên: Em nghĩ giờ mình đã hiểu khá rõ chuyện gì xảy ra khi một process tham chiếu memory, mà như thầy đã nói nhiều lần, điều đó xảy ra mỗi lần instruction fetch cũng như các lệnh load và store tường minh.

Giáo sư: Nghe tốt đấy — nói thêm đi.

Sinh viên: Có một điều em sẽ luôn nhớ là các address ta thấy trong một user program, chẳng hạn viết bằng C...

Giáo sư: Còn ngôn ngữ nào khác nữa sao?

Sinh viên: (tiếp tục) ... Vâng, em biết thầy thích C. Em cũng vậy! Dù sao, như em đang nói, giờ em thực sự hiểu rằng mọi address ta có thể quan sát trong một program đều là virtual address; với tư cách programmer, em chỉ được cung cấp ảo giác về vị trí của data và code trong memory. Trước đây em thấy in được address của một pointer thật hay, nhưng giờ lại thấy bực — đó chỉ là virtual address! Em không thấy được physical address thực sự nơi dữ liệu nằm.

Giáo sư: Đúng, OS chắc chắn che giấu điều đó với em. Còn gì nữa?

Sinh viên: Em nghĩ TLB là một bộ phận thực sự then chốt, cung cấp cho hệ thống một hardware cache nhỏ chứa các address translation. Page table thường khá lớn nên nằm trong memory lớn và chậm. Không có TLB đó, program chắc chắn chạy chậm hơn rất nhiều. Có vẻ TLB thực sự khiến memory virtualization trở nên khả thi. Em không thể tưởng tượng xây dựng hệ thống mà thiếu nó! Và em rùng mình khi nghĩ đến một program có working set vượt quá phạm vi bao phủ của TLB: với từng ấy TLB miss, chắc khó mà nhìn nổi.

Giáo sư: Đúng, hãy che mắt trẻ con lại! Ngoài TLB, em học được gì?

Sinh viên: Giờ em cũng hiểu page table là một trong những data structure cần biết; tuy nhiên, nó chỉ là data structure, có nghĩa gần như bất kỳ cấu trúc nào cũng dùng được. Ta bắt đầu với các cấu trúc đơn giản như array (còn gọi là linear page table), rồi tiến tới các bảng multi-level (trông giống tree), và cả những thứ kỳ lạ hơn như pageable page table trong kernel virtual memory. Tất cả chỉ để tiết kiệm một chút memory!

Giáo sư: Quả vậy.

Sinh viên: Và còn một điều quan trọng nữa: em học được rằng các cấu trúc address translation phải đủ linh hoạt để hỗ trợ những gì programmer muốn làm với address space. Các cấu trúc như bảng multi-level rất phù hợp về mặt này; chúng chỉ tạo không gian cho bảng khi user cần một phần address space, nên rất ít lãng phí. Những cách trước đó, như base và bounds register đơn giản, chưa đủ linh hoạt; các cấu trúc phải phù hợp với điều user kỳ vọng và mong muốn từ virtual memory system.

Giáo sư: Góc nhìn hay đấy. Thế còn tất cả những gì ta học về swapping xuống disk?

Sinh viên: Chắc chắn nghiên cứu chúng rất thú vị, và biết page replacement hoạt động thế nào cũng tốt. Một số policy cơ bản khá hiển nhiên (chẳng hạn LRU), nhưng xây dựng virtual memory system thực sự có vẻ thú vị hơn, như ta đã thấy trong nghiên cứu tình huống VMS. Nhưng không hiểu sao em thấy mechanism thú vị hơn, còn policy thì ít hơn.

Giáo sư: Ồ, vì sao vậy?

Sinh viên: Như thầy nói, cuối cùng giải pháp tốt nhất cho các vấn đề policy rất đơn giản: mua thêm memory. Nhưng cần hiểu mechanism để biết mọi thứ thực sự hoạt động ra sao. Nhắc đến chuyện đó...

Giáo sư: Sao nào?

Sinh viên: Máy em dạo này chạy hơi chậm... và memory chắc chắn cũng không đắt đến thế...

Giáo sư: Ôi được rồi, được rồi! Đây, vài đồng. Đi mua cho mình ít DRAM đi, đồ keo kiệt.

Sinh viên: Cảm ơn thầy! Em sẽ không bao giờ swap xuống disk nữa — hoặc nếu có, ít nhất em sẽ biết thực sự đang xảy ra chuyện gì!
