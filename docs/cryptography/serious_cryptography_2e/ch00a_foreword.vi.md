# Lời tựa cho ấn bản đầu tiên (Foreword to the First Edition)

Nếu đã đọc một hai cuốn sách về computer security, có lẽ bạn đã gặp một quan điểm phổ biến về lĩnh vực cryptography. Người ta nói: “Cryptography là mắt xích mạnh nhất trong chuỗi.” Quả là một lời khen lớn, nhưng nó cũng phần nào mang ý xem nhẹ. Nếu cryptography thật sự là phần mạnh nhất trong hệ thống của bạn, thì việc gì phải bỏ thời gian cải thiện nó khi còn rất nhiều phần khác của hệ thống sẽ được lợi nhiều hơn từ sự quan tâm của bạn?

Nếu có một điều tôi mong bạn rút ra được từ cuốn sách này, thì đó là quan điểm ấy về cryptography đã bị lý tưởng hóa; phần lớn nó chỉ là một huyền thoại. Trên lý thuyết, cryptography rất mạnh, nhưng trong thực tế, cryptography cũng dễ thất bại như bất kỳ khía cạnh nào khác của một hệ thống bảo mật. Điều này đặc biệt đúng khi các cryptographic implementation được phát triển bởi những người không phải chuyên gia, thiếu sự cẩn trọng hoặc kinh nghiệm cần thiết, như trường hợp của nhiều hệ thống cryptography đang được triển khai hiện nay. Và tệ hơn nữa: khi các cryptographic implementation thất bại, chúng thường thất bại theo những cách ngoạn mục có một không hai.

Nhưng vì sao bạn nên quan tâm, và vì sao lại là cuốn sách này?

Khi tôi bắt đầu làm việc trong lĩnh vực applied cryptography cách đây gần hai thập kỷ, thông tin dành cho các software developer thường rời rạc và lỗi thời. Các cryptographer phát triển algorithm và protocol, còn các cryptographic engineer triển khai chúng để tạo ra những cryptographic library khó hiểu, ít tài liệu, được thiết kế chủ yếu cho các chuyên gia khác. Đã từng có—và vẫn luôn có—một khoảng cách rất lớn giữa những người biết và hiểu các cryptographic algorithm với những người sử dụng chúng (hoặc phớt lờ chúng và tự chịu rủi ro). Trên thị trường có một vài cuốn sách giáo khoa khá tốt, nhưng số cuốn cung cấp công cụ hữu ích cho người làm thực tế còn ít hơn nữa.

Kết quả không mấy tốt đẹp. Tôi đang nói đến những vụ bị xâm phạm mang các nhãn như “CVE” và “Severity: High”, và trong một vài trường hợp đáng báo động, là những vụ tấn công trình bày trên các bộ slide có đóng dấu “TOP SECRET”. Có thể bạn đã quen với một vài ví dụ nổi tiếng hơn, dù chỉ vì chúng đã ảnh hưởng đến những hệ thống bạn đang dựa vào. Nhiều vấn đề trong số này xảy ra vì cryptography tinh tế và thanh lịch về mặt toán học, và vì các chuyên gia cryptography đã không chia sẻ kiến thức của họ với những engineer thực sự viết phần mềm.

May thay, điều này đã bắt đầu thay đổi, và cuốn sách này là một biểu hiện của sự thay đổi đó.

Serious Cryptography được viết bởi một trong những chuyên gia hàng đầu về applied cryptography, nhưng nó không nhắm đến các chuyên gia khác. Nó cũng không nhằm mục đích là một bản tổng quan hời hợt về lĩnh vực này. Ngược lại, sách chứa một phần thảo luận kỹ lưỡng và up-to-date về cryptographic engineering, được thiết kế để giúp những người làm thực tế định làm việc trong lĩnh vực này làm tốt hơn. Trong những trang sách này, bạn sẽ học không chỉ cách các cryptographic algorithm hoạt động mà còn cách dùng chúng trong các hệ thống thực.

Cuốn sách bắt đầu bằng việc khám phá nhiều cryptographic primitive then chốt, bao gồm các algorithm cơ bản như block cipher, public encryption scheme, hash function và random number generator. Mỗi chương đưa ra các ví dụ chạy được về cách các algorithm hoạt động và những gì bạn nên hoặc không nên làm. Các chương cuối đề cập những chủ đề nâng cao như TLS, cũng như tương lai của cryptography—cần làm gì sau khi quantum computer xuất hiện và làm phức tạp cuộc sống của chúng ta.

Dù không cuốn sách nào có thể giải quyết mọi vấn đề của chúng ta, một chút kiến thức có thể giúp ích rất nhiều. Cuốn sách này chứa rất nhiều kiến thức. Có lẽ đủ để khiến cryptography thực tế, đã được triển khai, đáp ứng được những kỳ vọng cao mà rất nhiều người đặt vào nó.

Chúc bạn đọc vui.

Matthew D. Green

Phó Giáo sư Khoa học Máy tính (Associate Professor of Computer Science)

Information Security Institute

Johns Hopkins University
