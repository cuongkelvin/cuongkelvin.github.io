# Lời tựa

Cryptography là một thành phần then chốt của hạ tầng thông tin ngày nay; chính nó cho phép các hệ thống thông tin phân tán tồn tại và hoạt động đúng. Không có nó, người dùng sẽ không thể tự xác thực một cách an toàn với các website, truyền thông an toàn sẽ không tồn tại, và quyền riêng tư sẽ không thể đạt được.

Hơn nữa, số lượng ứng dụng của cryptography đã tăng mạnh, khi các kỹ thuật cryptographic mới được phát minh và được chứng minh là an toàn. Chẳng hạn, giao dịch an toàn bằng các cryptocurrency như bitcoin đòi hỏi cryptography hiện đại. Một ví dụ khác, các bệnh viện giờ có thể chia sẻ thông tin về bệnh nhân theo cách bảo vệ quyền riêng tư của bệnh nhân, đồng thời cho phép bệnh viện áp dụng các phương pháp thống kê đánh giá hiệu quả của các phương pháp điều trị mới trên tập hợp bệnh nhân.

Chúng tôi giới thiệu cuốn sách này trong lớp Applied Cryptography của chúng tôi ở MIT. Lớp này khoảng một nửa là sinh viên đại học và một nửa là học viên sau đại học; các sinh viên khóa trước đã nói giáo trình này rất xuất sắc. Thật tuyệt khi có ấn bản mới này. Cách tiếp cận trong giáo trình này mang tính thực dụng và engineering-oriented hơn là theory-oriented. Nó dùng được cả cho việc học trên lớp lẫn self-study.

Ấn bản này của Understanding Cryptography có rất nhiều nội dung mới; cuốn sách đã dày thêm gần 50% so với ấn bản đầu tiên. Một phần của sự mở rộng này là do lĩnh vực đã mở rộng (về kỹ thuật), bao gồm các bài tập mới, và một phần là do bổ sung các tài liệu tham khảo và thảo luận mới (về lịch sử).

Đặc biệt đáng chú ý là việc đưa vào nội dung mới về “quantum cryptography”: các cryptosystem được thiết kế đặc biệt để chống lại các tấn công dựa trên việc dùng máy tính lượng tử. Thuật toán của Shor (1994) đã chỉ ra rằng các thuật toán cryptographic dựa trên độ khó của việc phân tích tích của hai số nguyên tố, hoặc dựa trên độ khó của việc tính discrete logarithm, đều dễ bị tổn thương trước các tấn công polynomial-time dùng tính toán lượng tử. Nếu và khi máy tính lượng tử trở nên khả dụng, các phương pháp cryptographic như RSA hay các cryptosystem elliptic-curve sẽ trở nên dễ bị tổn thương. Xét thời gian chuẩn bị dài cần thiết để thay thế các cryptosystem đang được dùng, việc lập kế hoạch cho một change-over sang các thuật toán “quantum-resistant” đã bắt đầu. Viện Tiêu chuẩn và Công nghệ Quốc gia (Hoa Kỳ) đã hội tụ về các tiêu chuẩn khả dĩ dựa trên ba bài toán khó cụ thể; giáo trình này đề cập cả ba cách tiếp cận. Thật vậy, giáo trình này có thể là giáo trình đầu tiên đề cập PQC (post-quantum cryptography).

Giáo trình này cũng có nội dung cập nhật về cryptography “truyền thống” (non-public-key). Chẳng hạn, nó có nội dung mới và/hoặc cập nhật về cryptographic hash function (bao gồm SHA-2 và SHA-3), stream cipher (bao gồm Salsa20 và ChaCha), và các mode of operation (bao gồm các mode authenticated encryption).

Tóm lại, tôi rất khuyến nghị cuốn sách này cho việc giảng dạy trên lớp ở cả bậc đại học lẫn sau đại học; nó có thể dễ dàng được bổ sung cho các sinh viên thiên về lý thuyết hơn. Cuốn sách này cũng được khuyến nghị cho self-study, cho bất kỳ ai muốn tự cập nhật up-to-date xem lĩnh vực thú vị này đang đi về đâu.

Tháng Mười Hai 2023 Ron Rivest
