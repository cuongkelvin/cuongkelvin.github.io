# Giới thiệu (Introduction)

Tôi viết cuốn sách này để nó là cuốn sách mà tôi ước mình có được khi bắt đầu học cryptography. Năm 2005, tôi đang học thạc sĩ gần Paris và đã háo hức đăng ký lớp crypto của học kỳ sắp tới. Đáng tiếc là lớp học bị hủy vì có quá ít sinh viên đăng ký. Các sinh viên lập luận rằng “Crypto khó quá”, rồi thay vào đó ồ ạt đăng ký các lớp computer graphics và database.

Kể từ đó, tôi đã nghe câu “crypto khó” hàng chục lần. Nhưng nó có thực sự khó đến vậy không? Để chơi một nhạc cụ, thành thạo một ngôn ngữ lập trình hay áp dụng thực tế bất kỳ lĩnh vực nào, bạn cần học một số khái niệm và ký hiệu, nhưng làm điều đó không đòi hỏi phải có bằng tiến sĩ. Điều tương tự cũng đúng với việc trở thành một cryptographer có năng lực. Có lẽ crypto bị coi là khó vì các cryptographer chưa dạy nó cho tốt.

Tôi cũng viết cuốn sách này vì cryptography đã mở rộng thành một lĩnh vực đa ngành. Để làm được bất cứ điều gì hữu ích và có ý nghĩa trong crypto, bạn cần hiểu các khái niệm xung quanh crypto: network và máy tính hoạt động ra sao, người dùng và hệ thống cần gì, và kẻ tấn công có thể lạm dụng các algorithm cùng implementation của chúng như thế nào. Nói cách khác, bạn cần có sự kết nối với thực tế.

## Cách tiếp cận của cuốn sách này

Tựa đề ban đầu của cuốn sách này là Crypto for Real, để nhấn mạnh cách tiếp cận practice-oriented, real-world, no-nonsense mà tôi theo đuổi. Tôi muốn làm cho cryptography trở nên dễ tiếp cận, không phải bằng cách đơn giản hóa nó quá mức mà bằng cách gắn nó với các ứng dụng thực tế. Tôi đưa ra các ví dụ source code và mô tả những bug thật cùng các câu chuyện kinh hoàng.

Bên cạnh sự kết nối rõ ràng với thực tế, những nền tảng khác của cuốn sách này là sự đơn giản và tính hiện đại. Tôi tập trung vào sự đơn giản trong hình thức hơn là trong nội dung: tôi trình bày những khái niệm không hề tầm thường mà không dùng hình thức toán học khô khan. Thay vào đó, tôi cố gắng truyền đạt sự hiểu biết về các ý tưởng cốt lõi của cryptography, điều quan trọng hơn việc nhớ một loạt phương trình. Để bảo đảm tính hiện đại của cuốn sách, tôi đề cập những phát triển và ứng dụng mới nhất của cryptography, chẳng hạn TLS 1.3 và post-quantum cryptography. Tôi không bàn chi tiết về các algorithm đã lỗi thời hoặc không an toàn như DES hay MD5. Một ngoại lệ là RC4, nhưng nó chỉ được đưa vào để giải thích nó yếu như thế nào và để cho thấy một stream cipher thuộc loại đó hoạt động ra sao.

Serious Cryptography không phải là một cuốn hướng dẫn về phần mềm crypto, cũng không phải là một bản tổng hợp các đặc tả kỹ thuật—những thứ bạn dễ dàng tìm thấy trên mạng. Thay vào đó, mục tiêu hàng đầu của nó là khiến bạn hào hứng với cryptography và dạy bạn các khái niệm nền tảng của nó trong quá trình đó.

## Cuốn sách này dành cho ai

Trong lúc viết, tôi thường hình dung người đọc là một developer đã từng tiếp xúc với cryptography nhưng vẫn cảm thấy mơ hồ và bực bội sau khi đọc những cuốn sách giáo khoa và bài báo nghiên cứu khó hiểu. Các developer thường cần—và muốn—nắm vững crypto hơn để tránh những lựa chọn thiết kế đáng tiếc, và tôi hy vọng cuốn sách này giúp được họ.

Nếu bạn không phải là developer, đừng lo! Cuốn sách không đòi hỏi kỹ năng viết code và phù hợp với bất kỳ ai hiểu những kiến thức cơ bản về khoa học máy tính và toán phổ thông (khái niệm về xác suất, modular arithmetic, v.v.).

Dù vậy, cuốn sách này vẫn có thể khiến người đọc e ngại, và dù tương đối dễ tiếp cận, nó vẫn đòi hỏi bạn bỏ công sức để thu được nhiều nhất từ nó. Tôi thích phép so sánh với việc leo núi: tác giả mở đường, cung cấp cho bạn dây thừng và rìu băng để công việc của bạn dễ dàng hơn, nhưng chính bạn phải tự leo lên. Học các khái niệm trong cuốn sách này đòi hỏi công sức nhưng rất xứng đáng.

## Cuốn sách này được tổ chức như thế nào

Cuốn sách có 15 chương, được chia một cách tương đối thành bốn phần. Các chương phần lớn độc lập với nhau, ngoại trừ Chương 9, chương đặt nền móng cho ba chương tiếp theo. Tôi khuyên bạn nên đọc ba chương đầu trước mọi thứ khác.

### Phần I: Các nền tảng (Fundamentals)

**Chương 1: Encryption** Giới thiệu khái niệm secure encryption, từ những cipher pen-and-paper yếu cho đến randomized encryption mạnh

**Chương 2: Randomness** Mô tả cách một pseudorandom generator hoạt động, điều gì khiến nó an toàn, và cách sử dụng nó một cách an toàn

**Chương 3: Cryptographic Security** Thảo luận các khái niệm security về mặt lý thuyết và thực tế, đồng thời so sánh provable security với probable security

### Phần II: Symmetric Crypto

**Chương 4: Block Ciphers** Đề cập các cipher xử lý message theo từng block, tập trung vào cipher nổi tiếng nhất, Advanced Encryption Standard (AES)

**Chương 5: Stream Ciphers** Trình bày các cipher tạo ra một dòng bit random-looking, được XOR với các message cần mã hóa

**Chương 6: Hash Functions** Thảo luận về những algorithm duy nhất không làm việc với secret key, hóa ra lại là những crypto building block phổ biến nhất

**Chương 7: Keyed Hashing** Giải thích điều gì xảy ra nếu bạn kết hợp một hash function với một secret key và điều này giúp xác thực message như thế nào

**Chương 8: Authenticated Encryption** Cho thấy một số algorithm có thể vừa mã hóa vừa xác thực một message, với các ví dụ như AES-GCM tiêu chuẩn

### Phần III: Asymmetric Crypto

**Chương 9: Hard Problems** Trình bày các khái niệm nền tảng đằng sau public-key encryption, sử dụng các khái niệm từ computational complexity

**Chương 10: RSA** Tận dụng factoring problem để xây dựng các encryption scheme và signature scheme an toàn chỉ với một phép toán số học đơn giản

**Chương 11: Diffie–Hellman** Mở rộng asymmetric cryptography sang khái niệm key agreement, trong đó hai bên thiết lập một giá trị bí mật chỉ bằng các giá trị không bí mật

**Chương 12: Elliptic Curves** Giới thiệu nhẹ nhàng về elliptic curve cryptography, loại asymmetric cryptography nhanh nhất

### Phần IV: Các ứng dụng (Applications)

**Chương 13: TLS** Tập trung vào Transport Layer Security (TLS), có thể nói là protocol quan trọng nhất trong network security

**Chương 14: Quantum and Post-Quantum** Trình bày các khái niệm của quantum computing và post-quantum cryptography

**Chương 15: Cryptocurrency Cryptography** Kết thúc bằng phần tổng quan về các cryptographic scheme nâng cao được dùng trong các ứng dụng blockchain

## Về ấn bản thứ hai

Ấn bản thứ hai này của Serious Cryptography ra đời bảy năm sau ấn bản đầu tiên. Kể từ đó, cryptography đã trải qua những thay đổi đáng kể. Ngày nay, thuật ngữ crypto thường gợi lên blockchain, Bitcoin và các cryptocurrency khác, hơn là bản thân cryptography. Bất chấp những lợi ích xã hội còn gây tranh cãi của các công nghệ này, không thể phủ nhận ảnh hưởng của chúng đối với sự tiến bộ của nghiên cứu và kỹ thuật cryptography. Nhận thức được điều này, tôi đã viết Chương 15, “Cryptocurrency Cryptography”, đi sâu vào những kỹ thuật cryptography hấp dẫn được dùng trong các ứng dụng blockchain, đại diện cho một số tiến bộ thú vị nhất trong lĩnh vực cryptography.

Tôi đã thay đổi đáng kể từng chương, cập nhật nội dung theo những phát triển mới của cryptography và cải thiện sự rõ ràng, súc tích của văn bản. Trong số những bổ sung quan trọng nhất: phần thảo luận về randomness của Linux kernel trong Chương 2 đã được cập nhật để mô tả hành vi mới của các interface /dev/random và /dev/urandom, Chương 12 có một mục mới về các signature scheme EdDSA và Ed25519, còn Chương 14 trình bày dự án Post-Quantum Cryptography Standardization của NIST.
