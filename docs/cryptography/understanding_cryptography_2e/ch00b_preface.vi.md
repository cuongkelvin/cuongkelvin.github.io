# Lời nói đầu

Đây là ấn bản thứ hai của Understanding Cryptography. Kể từ khi phát hành ấn bản đầu tiên năm 2009, chúng tôi đã rất cảm kích trước nhiều phản hồi tích cực nhận được từ độc giả khắp thế giới. Mục tiêu của chúng tôi luôn là làm cho chủ đề cryptography hấp dẫn nhưng cũng đầy thách thức trở nên dễ tiếp cận và thú vị để học. Các ý tưởng chủ chốt của cuốn sách là chúng tôi tập trung vào cryptography có tính ứng dụng thực tế cao, và phần toán học cần thiết có thể tiếp cận được với độc giả chỉ có nền tảng tối thiểu về giải tích ở mức college-level. Việc Understanding Cryptography đã được hàng trăm trường đại học trên mọi châu lục chọn làm giáo trình (nghĩa là, nếu chúng ta bỏ qua Nam Cực) và các phản hồi chúng tôi nhận được từ từng độc giả và giảng viên khiến chúng tôi tin rằng cách tiếp cận này đang hiệu quả.

Một điều đã thay đổi kể từ ấn bản đầu tiên là ngày càng hiển nhiên rằng cybersecurity quan trọng đến mức nào trong xã hội, giờ đây đã số hóa, của chúng ta. Ngày nay, dường như mọi khía cạnh trong đời sống riêng tư, tại nơi làm việc hay trong chính phủ đều đã phụ thuộc vào công nghệ thông tin theo cách này hay cách khác. Dù số hóa có thể mang lại nhiều lợi ích cho cá nhân và cho toàn xã hội, công nghệ thông tin phải đi kèm các cơ chế bảo mật mạnh để ngăn chặn các thao túng độc hại. Đây chính là lúc cryptography phát huy vai trò: Nó là một công cụ then chốt để xây dựng các giải pháp cybersecurity vững chắc. Vì mục đích này, các thuật toán cryptographic đã len lỏi vào vô số ứng dụng quanh chúng ta; các ví dụ trải từ mạng xã hội, smartphone và cloud server tới các hệ thống nhúng như thiết bị cấy ghép y tế, chìa khóa ô tô và hộ chiếu. Các ứng dụng mới nổi như xe tự lái và e-voting sẽ còn dựa nhiều hơn nữa vào các cơ chế bảo mật mạnh. Tất nhiên, cryptocurrency và blockchain cũng dựa nhiều vào các thuật toán cryptographic hiện đại.

## Tổng quan nội dung

Cuốn sách có nhiều đặc điểm khiến nó là một nguồn tài liệu độc đáo cho sinh viên, người làm thực tế và nhà nghiên cứu. Chúng tôi tập trung vào tính ứng dụng thực tế bằng cách giới thiệu phần lớn các thuật toán cryptographic được dùng trong các ứng dụng real-world hiện đại. Về các thuật toán symmetric, chúng tôi giới thiệu các block cipher AES, DES và triple-DES cũng như PRESENT, một ví dụ quan trọng về lightweight cipher. Chúng tôi cũng mô tả ba stream cipher phổ biến. Về asymmetric cryptography, chúng tôi đề cập cả ba họ public-key đang được dùng hiện nay: RSA, các scheme discrete logarithm và elliptic curve. Ngoài ra, cuốn sách giới thiệu hash function, digital signature và message authentication code, hay MAC. Vượt ra ngoài các thuật toán cryptographic cốt lõi, chúng tôi cũng thảo luận các chủ đề như mode of operation, security service và key management. Với mọi scheme cryptographic, chúng tôi đưa ra các ước lượng bảo mật up-to-date và khuyến nghị về độ dài key. Chúng tôi cũng thảo luận vấn đề quan trọng về hiện thực bằng software và hardware.

## Có gì mới

Ấn bản thứ hai đã được cập nhật lớn và đã tăng từ 350 trang của ấn bản đầu tiên lên hơn 500 trang. Nội dung mới đáng chú ý nhất là phần trình bày sâu rộng về post-quantum cryptography, hay PQC, trong Chương 12. Trong những năm tới, nhiều ứng dụng sẽ cần thay các scheme public-key truyền thống bằng các thuật toán PQC. Đây sẽ là thay đổi toàn diện nhất trong bức tranh cryptography mà chúng ta đã thấy trong nhiều thập kỷ. Chúng tôi hy vọng rằng phần giới thiệu của chúng tôi về ba họ PQC hứa hẹn nhất, tức là các scheme lattice-based, code-based và hash-based, sẽ hữu ích trong bối cảnh này. Ngoài PQC, ấn bản 2nd cũng đề cập các hash function SHA-2 và SHA-3, các stream cipher mới Salsa20 và ChaCha, và authenticated encryption. Xuyên suốt cuốn sách, các tham số bảo mật và các công trình liên quan đã được cập nhật, cũng như các mục Discussion and Further Reading ở cuối mỗi chương. Phần bài tập của cả 14 chương cũng đã được mở rộng.

## Cách dùng cuốn sách

Nội dung trong cuốn sách này đã phát triển qua nhiều năm và đã được “kiểm chứng trên lớp”. Chúng tôi đã dạy nó vừa như một khóa học cho sinh viên đại học năm cuối và học viên sau đại học ngành khoa học máy tính/toán/kỹ thuật điện, vừa như một khóa học first-year cho sinh viên chuyên ngành chương trình IT security của chúng tôi. Chúng tôi thấy rằng có thể dạy hầu hết các khái niệm được giới thiệu trong sách trong một khóa học two-semester, với 90 phút giảng bài cộng 90 phút buổi hỗ trợ với bài tập mỗi tuần (tổng cộng 10 tín chỉ ECTS). Trong một khóa học three-credit điển hình kiểu US-style, hoặc trong một khóa học one-semester ở châu Âu, một phần nội dung nên được bỏ bớt. Đây là một số lựa chọn hợp lý cho một khóa học one-semester:

Course Curriculum 1 (chương trình thứ nhất) Tập trung vào ứng dụng của cryptography, chẳng hạn trong một khóa học ứng dụng ngành khoa học máy tính hoặc một khóa học cơ sở cho các lớp bảo mật tiếp theo, chẳng hạn trong một chương trình cybersecurity. Một chương trình khả dĩ là: Chương 1; Mục 2.1–2.2; Chương 4; Mục 5.1; Chương 6; Mục 7.1–7.3; Mục 8.1–8.3; Mục 10.1–10.2; Mục 11.1–11.3; Mục 12.1 & 12.4; Mục 13.1; Mục 14.1–14.3.

Course Curriculum 2 (chương trình thứ hai) Tập trung vào các thuật toán cryptographic và nền tảng toán học của chúng, chẳng hạn như một khóa học lý thuyết ngành khoa học máy tính hoặc một khóa học crypto trong chương trình toán. Chương trình này cũng rất phù hợp để chuẩn bị cho một khóa học cryptography mang tính lý thuyết hơn: Chương 1; Chương 2; Chương 4; Chương 6; Chương 7; Mục 8.1 – 8.4; Chương 9; Mục 10.1–10.2; Mục 11.1–11.3; Mục 12.1, 12.2 & 12.4.

## Thông tin thêm

Có hai nguồn trực tuyến liên quan tới cuốn sách mà chúng tôi có thể giới thiệu. Thứ nhất, chúng tôi đã ghi hình khóa học nhập môn cryptography two-semester mà chúng tôi dạy tại Ruhr University Bochum (RUB). Đối tượng chính của lớp này là sinh viên first-year của chương trình IT Security của RUB, và chúng tôi đã cố làm nội dung dễ tiếp cận nhất có thể. Hơn 20 bài giảng có sẵn trên kênh YouTube “Introduction to Cryptography by Christof Paar”:

https://www.crypto-textbook.com/video

Mỗi bài giảng dài khoảng 80–90 phút và bám sát nội dung trong sách. (Với độc giả thích phiêu lưu hơn, cũng có một bộ video German-language trên kênh YouTube “Einführung in die Kryptographie von Christof Paar”.)

Thứ hai, chúng tôi giới thiệu website đi kèm sách, chứa các bộ slide cho giảng viên và lời giải cho các bài tập odd-numbers của sách:

https://www.crypto-textbook.com

Được đào tạo như những kỹ sư, chúng tôi đã làm việc trong lĩnh vực applied cryptography và bảo mật hơn 20 năm và hy vọng độc giả sẽ có nhiều niềm vui với lĩnh vực hấp dẫn này như chúng tôi đã có!

|  |  |
|---|---|
| Bochum, Đức | Christof Paar |
| Hamm, Đức | Jan Pelzl |
| Bochum, Đức | Tim Güneysu |
