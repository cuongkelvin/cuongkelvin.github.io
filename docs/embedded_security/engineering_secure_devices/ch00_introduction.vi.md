# <a id="page_xxi"></a>LỜI GIỚI THIỆU

Kết nối internet, các mô hình kinh doanh số và dịch vụ data-driven, truy cập từ xa và phân tích dữ liệu—tất cả đều góp phần tạo ra nhiều nhu cầu và thách thức khác nhau trong gần như mọi ngành công nghiệp. Nói đơn giản, hầu hết các sản phẩm hiện đại đều cần một loại máy tính nào đó được tích hợp vào bên trong. Cụ thể hơn, chúng thường đòi hỏi một *embedded system*, tức là một hệ thống điện tử bao gồm một đơn vị xử lý, memory và các interface input/output được nhúng bên trong một hệ thống cơ khí hay điện tử lớn hơn.

Các lĩnh vực ứng dụng của embedded system cực kỳ rộng. Chúng được dùng trong các bộ điều khiển, cảm biến và cơ cấu chấp hành (actuator) trong tự động hóa công nghiệp, giao thông vận tải và các hệ thống hạ tầng trọng yếu. Phần cứng truyền thông và mạng như router, switch và trạm gốc (base station) cũng dựa trên chúng. Trên thị trường tiêu dùng, các sản phẩm điển hình có embedded system bao gồm máy giặt thông minh, hệ thống sưởi thông minh và máy chơi game. Ngay cả những tấm thẻ nhựa mà chúng ta dùng cho ngân hàng và kiểm soát ra vào tòa nhà cũng có thể được coi là một loại embedded system.

<a id="page_xxii"></a>So với máy tính cá nhân (PC) và các hệ thống server, những thiết bị này thường phải đối mặt với các ràng buộc, như nhu cầu giữ chi phí sản xuất thấp hay phải chạy trên phần cứng có năng lực tính toán từ thấp đến trung bình, bên cạnh các lựa chọn khá hạn chế về khả năng input và output. Embedded system được dùng trong những lĩnh vực rất cụ thể, đôi khi trọng yếu, và chúng thường hoạt động với rất ít tương tác của người dùng, nếu có. Hơn nữa, những thiết bị này được xây dựng từ rất nhiều loại phần cứng, firmware và hệ điều hành khác nhau đang được dùng trong các sản phẩm, nhà sản xuất và ngành công nghiệp khác nhau.

Ngoài những hạn chế đó, việc đưa thêm các yêu cầu bảo mật vào bài toán không làm cho cuộc sống của một kỹ sư embedded system dễ dàng hơn. Việc phát triển các biện pháp bảo mật cho những thiết bị này, môi trường ứng dụng đặc thù của chúng và tài nguyên hạn chế của chúng dẫn đến những nhiệm vụ đầy thách thức cho các kiến trúc sư (architect) và developer. Như thể tất cả những điều này vẫn chưa đủ, trong nhiều trường hợp, embedded system còn phải đối mặt với những kẻ tấn công vật lý, vốn là một mô hình tấn công mạnh hơn so với, ví dụ, việc truy cập từ xa vào các dịch vụ cloud hay web.

<a id="ch00lev1_1"></a>

## Hiện trạng bảo mật của embedded system

Nếu chúng ta nhìn vào các lĩnh vực ứng dụng và ngành công nghiệp khác nhau, hiện trạng các biện pháp bảo mật trong embedded system khác nhau rất nhiều. Ví dụ, các giải pháp smart card cho truyền hình trả tiền (pay-TV) đã phải đối mặt với các vụ gian lận từ những năm 1990. Nếu người ta có thể vượt qua các thuật toán xáo trộn (scrambling và shuffling), họ có thể xem pay-TV miễn phí. Ngoài ra, nếu kẻ tấn công nhân bản thành công những smart card đó, họ có thể bán chúng với giá thấp hơn, dẫn đến thất thu doanh thu cho nhà cung cấp gốc. Vì mô hình kinh doanh bị đe dọa, nhận thức về bảo mật của các công ty này tương đối cao, và các khoản đầu tư và phát triển tương ứng cho bảo mật smart card được ưu tiên.

Một lĩnh vực embedded system khác trong ngành giải trí cũng cho thấy một mô thức tương tự: máy chơi game. Mối quan tâm tự nhiên của các nhà sản xuất máy chơi game là chỉ những đĩa game gốc mới có thể được chơi trên thiết bị của họ. Nếu kẻ tấn công chạy được các đĩa nhân bản, mô hình kinh doanh sẽ bị ảnh hưởng. Sau khi cộng đồng reverse engineering bắt đầu quan tâm đến việc phân tích máy chơi game, điều mà chẳng hạn đã dẫn đến cuốn sách nổi tiếng *Hacking the Xbox* của Andrew Huang (No Starch Press, 2003), ngành công nghiệp đã phản ứng bằng cách tăng cường các cơ chế bảo mật. Kết quả là họ đạt được một mức bảo mật embedded system vững chắc, đòi hỏi kẻ tấn công phải đầu tư rất nhiều tài nguyên, chuyên môn và công cụ tinh vi để vượt qua thành công các biện pháp bảo vệ.

Tuy nhiên, trong các lĩnh vực ứng dụng khác của embedded system, các thành phần không có những tính năng bảo mật trưởng thành như vậy. Năm 2016, điều này trở nên khá rõ ràng với việc phát hiện malware *Mirai*, vốn khai thác hàng trăm nghìn thiết bị internet of things (IoT), chủ yếu là camera IP và router gia đình, biến chúng thành các botnet thực hiện những cuộc tấn công distributed denial-of-service (DDoS) khổng lồ nhắm vào các website. Hơn nữa, các tập hợp lỗ hổng được đặt tên là *Ripple20* và *Amnesia:33* đã cho thấy nhiều điểm yếu khác nhau trong các TCP/IP stack dành cho embedded system vào năm 2020. Theo <a id="page_xxiii"></a>ước tính, hơn 15 triệu thiết bị đã bị ảnh hưởng, từ thiết bị y tế đến tự động hóa tòa nhà đến các hệ thống điều khiển công nghiệp (ICS).

Thật kỳ lạ, các thiết bị được dùng trong tự động hóa công nghiệp và hạ tầng trọng yếu, nơi tính bền vững (robustness) và độ tin cậy là then chốt, cũng có những danh sách to-do về bảo mật dài dằng dặc. Mặc dù các báo cáo về sự cố *Stuxnet* năm 2010 là một wake-up call (hồi chuông cảnh tỉnh) cho các nhà sản xuất thiết bị tự động hóa công nghiệp, hơn 10 năm sau, thị trường vẫn còn thiếu đáng kể các thiết bị well-protected (được bảo vệ tốt). Năm 2022, một tập hợp lỗ hổng trong các thành phần công nghệ vận hành (operational technology, OT) đã được công bố dưới tên *OT:ICEFALL*. Các tác giả mô tả những thất bại trong kỹ thuật bảo mật là *insecurity by design* (thiếu an toàn ngay từ thiết kế) vì các sản phẩm được phân tích thiếu cả những biện pháp kiểm soát bảo mật cơ bản nhất.

<a id="ch00lev1_2"></a>

## Các yêu cầu, luật và tiêu chuẩn mới nổi

Nghe có vẻ lạ, nhưng nếu không có những sự cố, lỗ hổng và cuộc tấn công này, có lẽ chỉ tồn tại một mức nhận thức bảo mật không đáng kể. Tuy nhiên, vì chúng ta đã chứng kiến nhiều vấn đề như vậy trong 20 năm qua, đồng thời kết nối trực tuyến, dịch vụ số và phân tích dữ liệu ngày càng trở nên quan trọng đối với các công ty, cybersecurity “đột nhiên” đã trở thành một yêu cầu—ví dụ, trong quy trình mua sắm.

Điều này không có nghĩa là khách hàng ngay lập tức thể hiện kiến thức bảo mật sâu rộng và toàn diện, nhưng họ ngày càng đòi hỏi các phân tích rủi ro, biện pháp bảo vệ, hay một tập hợp (ngẫu nhiên) các tiêu chuẩn mà nhà sản xuất sản phẩm phải đáp ứng. Theo kinh nghiệm của tôi trong bối cảnh công nghiệp, điều này đôi khi khởi đầu cho việc trao đổi giữa khách hàng và nhà sản xuất để tìm ra một sự thỏa hiệp giữa nhu cầu thực tế về bảo mật và chi phí đi kèm, đây có thể là một cuộc thảo luận hợp lý và hiệu quả cho cả hai bên.

Mặt khác, các chính phủ ngày càng quan tâm đến việc xây dựng luật quốc gia và ký kết các thỏa thuận quốc tế thúc đẩy những yêu cầu bảo mật cơ bản mà mọi sản phẩm trên thị trường đều phải đáp ứng. Ở châu Âu, Cybersecurity Act (CSA) năm 2019 nhằm thiết lập một khung chứng nhận bảo mật cho mọi sản phẩm và dịch vụ được bán tại Liên minh châu Âu, và Cyber Resilience Act (CRA) năm 2024 quy định các yêu cầu cybersecurity cho các sản phẩm có yếu tố số. Tiêu chuẩn châu Âu ETSI EN 303 645 đã định nghĩa các yêu cầu bảo mật cơ sở, đặc biệt cho các sản phẩm IoT tiêu dùng. Ở bờ bên kia Đại Tây Dương, Sắc lệnh Hành pháp (Executive Order) 14028 của Biden từ tháng Năm năm 2021 đi theo một hướng tương tự và nhằm cải thiện cybersecurity trong các thiết bị IoT và giải pháp phần mềm. National Institute of Standards and Technology (NIST) đã đưa ra các khuyến nghị về việc dán nhãn cybersecurity cho những sản phẩm này.

Song song đó, các liên minh trong nhiều ngành công nghiệp cố gắng thống nhất các tiêu chuẩn bảo mật chung trong lĩnh vực của họ. Một ví dụ nổi bật là tiêu chuẩn 62443 của International Electrotechnical Commission (IEC), nhắm vào bảo mật ICS và IoT công nghiệp (IIoT). Nó kết hợp các yêu cầu bảo mật cho nhà vận hành, nhà tích hợp hệ thống và nhà sản xuất thành phần, cho phép có một góc nhìn bảo mật thống nhất và liên kết về các hệ thống công nghiệp. Về kỹ thuật <a id="page_xxiv"></a>thiết bị an toàn, Part 4-1 và 4-2 của IEC 62443 là liên quan nhất: Part 4-1 đề cập các thực hành cho một quy trình phát triển an toàn, và Part 4-2 liên quan đến các yêu cầu bảo mật kỹ thuật của sản phẩm.

<a id="ch00lev1_3"></a>

## Ai nên đọc cuốn sách này?

Nếu bạn là một kiến trúc sư embedded system tham gia vào các cuộc thảo luận với khách hàng như đã mô tả ở trên, cuốn sách này cung cấp cho bạn kiến thức cần thiết để tranh luận ngang hàng với các đối tác của mình.

Nếu bạn là một kỹ sư embedded system hay một developer IoT chịu trách nhiệm hiện thực các tính năng bảo mật và bạn muốn biết lý do đằng sau những tính năng này cũng như các trở ngại điển hình, cuốn sách này sẽ chuẩn bị cho bạn hành trình phía trước.

Nếu bạn là một phần của quy trình requirements engineering cho một sản phẩm hay làm kiểm thử embedded system trong công việc day-to-day, cuốn sách này sẽ giúp bạn hiểu giá trị của một số tính năng bảo mật nhất định và tại sao các đồng nghiệp của bạn từ nhóm phát triển có thể ngần ngại hiện thực chúng.

Nếu bạn là một sinh viên và thắc mắc tại sao nhiều biện pháp bảo vệ không thể được coi là đương nhiên trong các sản phẩm IoT, cuốn sách này sẽ xác nhận rằng bạn có tư duy đúng, và bạn sẽ học được rằng bảo mật embedded system là một nhiệm vụ quan trọng nhưng đôi khi tẻ nhạt.

Và nếu, vài phút trước, có ai đó hét vào mặt bạn, “Chúng ta cần hiện thực cái bảo mật thiết bị c\*\*\*\*\*\* này! NGAY!!!” thì hãy hít một hơi thật sâu, hủy mọi cuộc hẹn và đọc kỹ cuốn sách này. Sau đó, bạn sẽ sẵn sàng cho một cuộc thảo luận thân thiện, khách quan về “bảo mật.”

<a id="ch00lev1_4"></a>

## Cuốn sách này đề cập những gì?

Nội dung của cuốn sách này dựa trên kinh nghiệm hands-on và những hiểu biết nghiên cứu của tôi trong 15 năm qua trong lĩnh vực bảo mật embedded system.

Trong **[Phần I: Nền tảng (Fundamentals)](part1_fundamentals.vi.md#part01)**, bạn sẽ học kiến thức nền tảng liên quan đến việc thực hiện một vòng đời phát triển an toàn và cách cryptography được sử dụng.

**[Chương 1: Quy trình phát triển an toàn (Secure Development Process)](ch01_secure_development_process.vi.md#ch01)** Trình bày các yếu tố cơ bản cần thiết để tuân theo nguyên tắc security by design trong một quy trình phát triển sản phẩm.

**[Chương 2: Cryptography](ch02_cryptography.vi.md#ch02)** Tóm tắt những điều cốt yếu về cryptography liên quan đến kỹ thuật bảo mật thực tiễn.

**[Phần II: Các khối xây dựng bảo mật thiết bị (Device Security Building Blocks)](part2_device_security_building_blocks.vi.md#part02)** trình bày chi tiết các khối xây dựng vật lý và logic cơ bản cho bảo mật embedded system.

**[Chương 3: Random Number Generator](ch03_random_number_generators.vi.md#ch03)** Đi sâu vào lĩnh vực kỳ diệu của tính ngẫu nhiên, nhấn mạnh tầm quan trọng của nó đối với bảo mật, và đưa ra các gợi ý thực tế về cách sinh và đánh giá dữ liệu ngẫu nhiên.

**[Chương 4: Hiện thực cryptography (Cryptographic Implementations)](ch04_cryptographic_implementations.vi.md#ch04)** Thảo luận các lựa chọn hiện thực cho các thuật toán cryptography và tác động tương ứng lên các thuộc tính như performance.

**[Chương 5: Lưu trữ dữ liệu bí mật và secure memory (Confidential Data Storage and Secure Memory)](ch05_confidential_data_storage_and_secure_memory.vi.md#ch05)** Tập trung vào việc lưu trữ những lượng dữ liệu nhỏ và lớn theo cách an toàn, bí mật.

**[Chương 6: Định danh thiết bị an toàn (Secure Device Identity)](ch06_secure_device_identity.vi.md#ch06)** Liên quan đến việc tạo và quản lý các định danh duy nhất cho embedded system.

**[Chương 7: Giao tiếp an toàn (Secure Communication)](ch07_secure_communication.vi.md#ch07)** Trình bày các biện pháp bảo vệ state-of-the-art cho các kênh giao tiếp, và trả lời các câu hỏi thường gặp về việc hiện thực chúng trên embedded system.

**[Phần III: Các khái niệm bảo mật thiết bị nâng cao (Advanced Device Security Concepts)](part3_advanced_device_security_concepts.vi.md#part03)** tập trung vào các khái niệm bảo vệ toàn diện liên quan đến các thiết bị IoT an toàn.

**[Chương 8: Secure Boot và tính toàn vẹn hệ thống (Secure Boot and System Integrity)](ch08_secure_boot_and_system_integrity.vi.md#ch08)** Trình bày các cân nhắc bảo mật trong giai đoạn vận hành nhạy cảm khi một embedded system đang khởi động.

**[Chương 9: Cập nhật firmware an toàn (Secure Firmware Update)](ch09_secure_firmware_update.vi.md#ch09)** Mô tả sự phức tạp của việc cung cấp các bản cập nhật phần mềm cho sản phẩm với bảo mật được đặt lên hàng đầu.

**[Chương 10: Architecture thiết bị bền vững (Robust Device Architecture)](ch10_robust_device_architecture.vi.md#ch10)** Thảo luận câu hỏi làm thế nào để tiếp tục vận hành các process trọng yếu khi đang bị tấn công.

**[Chương 11: Kiểm soát và quản lý truy cập (Access Control and Management)](ch11_access_control_and_management.vi.md#ch11)** Xem xét việc hạn chế user và process trên một thiết bị và các hệ quả thực tế của nó.

**[Chương 12: Giám sát hệ thống (System Monitoring)](ch12_system_monitoring.vi.md#ch12)** Hoàn tất cuốn sách bằng cách khám phá các biện pháp cho phép bạn phát hiện và phân tích các bất thường hay các cuộc tấn công trên embedded system.

Khi đọc cuốn sách này, hãy nhớ rằng mục tiêu của bạn không chỉ nên là hấp thụ càng nhiều kiến thức kỹ thuật càng tốt mà còn là hiểu *khi nào* và *tại sao* các biện pháp bảo mật thiết bị có ý nghĩa.

<a id="ch00lev1_5"></a>

## Một lưu ý về các case study trong cuốn sách này

Một số chương trong cuốn sách này chứa các case study thực tế. Mục đích của chúng *không phải* là làm các ví dụ copy-and-paste để dễ dàng tái hiện trên thiết bị của riêng bạn hay thậm chí để dùng cho phát triển sản phẩm thật. Điều đó sẽ đòi hỏi một mức chi tiết vượt ngoài phạm vi của cuốn sách này, và những hiểu biết bảo mật liên quan sẽ biến mất trong một biển các vấn đề hiện thực.

Một số case study minh họa khoảng cách giữa lý thuyết và thế giới thực đầy lộn xộn. Một số khác cho thấy ưu điểm hay nhược điểm của các lựa chọn hiện thực khác nhau, và một số case study chỉ cung cấp một bối cảnh ứng dụng cụ thể giúp bạn hiểu các ý tưởng và khái niệm đã nêu trước đó.

<a id="page_xxvi"></a>Như đã đề cập trước đó, embedded system là một lớp thiết bị đa dạng, và processor, memory và interface của chúng cũng vậy. Để có một thiết bị minh họa hợp lý—không quá cao cấp, không quá nhỏ bé và hạn chế—tôi đã chọn một nền tảng phần cứng có performance trung bình, đồng thời có các biện pháp bảo mật hardware-based có thể được phân tích trong các case study thực tế: board đánh giá STM32MP157F-DK2 của STMicroelectronics (ST). (Xin nói rõ, tôi không có liên hệ gì với ST.)

Bất cứ khi nào nói đến hệ điều hành cho các embedded system medium- and high-performance (performance trung bình và cao), Linux là lựa chọn tự nhiên. Nó được dùng trong ô tô, máy rửa bát, các bộ điều khiển logic khả trình (PLC), TV, hệ thống giám sát năng lượng, và cả trong các case study của cuốn sách này. Cụ thể, tôi đã dùng bản phân phối OpenSTLinux của ST với Linux kernel 5.15.
