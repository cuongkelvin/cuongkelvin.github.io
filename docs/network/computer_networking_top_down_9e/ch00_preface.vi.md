# Lời nói đầu (Preface)

Chào mừng bạn đến với ấn bản thứ chín của Computer Networking: A Top-Down Approach. Kể từ khi ấn bản đầu tiên được xuất bản 25 năm trước, cuốn sách của chúng tôi đã được dùng tại hàng nghìn trường cao đẳng và đại học, được dịch sang 14 ngôn ngữ, và được nhiều trăm nghìn sinh viên và người làm nghề trên khắp thế giới sử dụng. Chúng tôi đã nhận được phản hồi từ nhiều độc giả và vô cùng xúc động trước sự đón nhận tích cực đó.

## Có gì mới trong ấn bản thứ chín? (What’s New in the Ninth Edition?)

Chúng tôi cho rằng một lý do quan trọng cho thành công này là cuốn sách tiếp tục mang lại một cách tiếp cận mới mẻ và hợp thời cho việc giảng dạy mạng máy tính. Chúng tôi đã thực hiện các thay đổi trong ấn bản thứ chín này, nhưng cũng giữ nguyên những gì chúng tôi tin là các khía cạnh quan trọng nhất của cuốn sách (và các giảng viên cùng sinh viên đã dùng sách xác nhận điều đó): cách tiếp cận từ trên xuống (top-down), sự tập trung vào Internet, cách trình bày hiện đại về mạng máy tính, sự chú trọng cả nguyên lý lẫn thực hành, cùng văn phong và cách tiếp cận dễ tiếp cận. Dù vậy, ấn bản thứ chín đã được sửa đổi và cập nhật đáng kể.

Độc giả của các ấn bản trước có thể nhớ rằng khi chuyển từ ấn bản thứ sáu sang ấn bản thứ bảy, chúng tôi đã đào sâu phần trình bày về tầng mạng (network layer), mở rộng nội dung vốn trước đây nằm trong một chương duy nhất thành một chương mới tập trung vào thành phần so-called (được gọi là) “data plane” (mặt phẳng dữ liệu) của tầng mạng (Chương 4) và một chương mới tập trung vào “control plane” (mặt phẳng điều khiển) của tầng mạng (Chương 5). Thay đổi đó hóa ra là có tầm nhìn xa, vì software-defined networking (SDN — mạng định nghĩa bằng phần mềm), một trong những tiến bộ quan trọng và thú vị nhất của ngành mạng trong nhiều thập kỷ, đã được áp dụng nhanh chóng trong thực tế—đến mức khó có thể hình dung một phần nhập môn về mạng máy tính hiện đại mà không đề cập SDN. Khi chuyển từ ấn bản thứ bảy sang ấn bản thứ tám, chúng tôi đã cập nhật đáng kể tầng ứng dụng (Chương 2), đưa vào cách trình bày hiện đại về tầng giao vận (transport layer) trong Chương 3 bằng việc đề cập giao thức QUIC (khi đó còn mới), và mở rộng đáng kể phần trình bày về mạng di động 4G trong Chương 7. Những thay đổi này cũng tỏ ra có tầm nhìn xa, vì năm năm qua kể từ ấn bản thứ tám đã chứng kiến những tiến bộ quan trọng cả về hạ tầng application-layer (tầng ứng dụng) lẫn các giao thức transport-layer (tầng giao vận). Ngoài ra, với sự ra đời của Wi-Fi-6, mạng di động 5G, và quá trình software-i-zation (phần mềm hóa) của mạng di động, nhịp độ thay đổi trong mạng không dây và di động chỉ càng tăng tốc kể từ ấn bản thứ tám.

Những thay đổi quan trọng nhất trong ấn bản thứ chín này như sau:

• Chương 1 đã được cập nhật để phản ánh phạm vi và mức độ sử dụng ever-expanding (ngày càng mở rộng) của Internet và các ứng dụng của nó. Một xu hướng gần đây, giờ được phản ánh trong cả Chương 1 và 2, là sự tiến hóa liên tục của cấu trúc Internet: từ chỗ các ứng dụng người dùng giao tiếp với vô số server small-scale (quy mô nhỏ) qua một topology Internet multi-tiered (nhiều tầng), sang một cấu trúc phẳng hơn, trong đó các ứng dụng ngày càng giao tiếp với các server đặt gần người dùng cuối trong các datacenter do các “hyperscalar” vận hành hoặc trong các mạng phân phối nội dung lớn.

• Chương 2 đã được cập nhật để đề cập giao thức HTTP/3 mới và QUIC, đồng thời để các nguyên lý về độ tin cậy end-end (đầu cuối–đầu cuối) và điều khiển tắc nghẽn trong HTTP/3 cho Chương 3. Chương 2 cũng có nội dung mới về các mạng phân phối nội dung (content distribution network) và phần trình bày cập nhật về các dịch vụ streaming “over-the-top”, cả hai đều phản ánh mức độ phổ biến ever-increasing (ngày càng tăng) của các dịch vụ ứng dụng được cung cấp bởi hạ tầng application-level (mức ứng dụng) có khả năng mở rộng và phân tán.

• Trong Chương 3, phần trình bày nền tảng của chúng tôi về truyền dữ liệu tin cậy (reliable data transfer) vẫn giữ nguyên, nhưng phần trình bày về các nguyên lý điều khiển tắc nghẽn (congestion control) đã được cập nhật để cân bằng giữa các kỹ thuật điều khiển tắc nghẽn loss-based (dựa trên mất gói) truyền thống với các giao thức điều khiển tắc nghẽn mới hơn (đặc biệt là BBR) thực hiện điều khiển tắc nghẽn bằng cách đo độ trễ và throughput của kết nối. Chúng tôi cũng hoàn tất phần trình bày về QUIC (bắt đầu từ Chương 2), sau khi đã nghiên cứu các nguyên lý truyền dữ liệu tin cậy, quản lý kết nối và điều khiển tắc nghẽn trong chương này.

• Chương 4 đề cập data plane của network-layer (tầng mạng). Ngoài các cập nhật xuyên suốt, Mục 4.5 đã được tái cấu trúc để làm nổi bật các nguyên lý kiến trúc của Internet, trong khi vẫn đề cập các middlebox.

• Chương 5, đề cập control plane của network-layer, được cập nhật xuyên suốt và có nội dung mới về SDN, bao gồm control plane mạng Orion của Google như một nghiên cứu tình huống và bổ sung nội dung mới về “software-ization” (phần mềm hóa) việc điều khiển mạng. Phần trình bày riêng của chúng tôi về quản lý mạng, và đặc biệt là SNMP, đã được tinh gọn.

• Chương 6 có các cập nhật nhỏ xuyên suốt nhưng về cơ bản giữ nguyên. Chương có một mục mới về virtual extended LAN và phần trình bày cập nhật về mạng datacenter, phản ánh những thay đổi trong năm năm qua.

• Chương 7 đã trải qua thay đổi lớn nhất trong tất cả các chương ở ấn bản thứ chín này. Điều này phản ánh cả những thay đổi to lớn trong mạng không dây trong năm năm qua lẫn niềm tin của chúng tôi rằng mạng không dây đã trở thành một chủ đề không thể thiếu trong một khóa học nhập môn về mạng.

  Như mọi khi, chúng tôi vẫn chú trọng cả nguyên lý lẫn thực hành. Dù Chương 7 có một mục được mở rộng đáng kể (7.2) về các đặc tính kênh không dây và tầng vật lý không dây, trọng tâm của Chương 7 vẫn nằm vững chắc ở mạng không dây. Chương có nội dung mới về các mạng truy cập không dây (mạng LAN không dây WiFi, và 5G Radio Access Network), lập lịch link-layer (tầng liên kết), khám phá và truy cập mạng, tối ưu năng lượng thiết bị, mạng lõi 5G Core và việc software-i-zation (phần mềm hóa) các chức năng của nó, và tính di động. Bluetooth, vệ tinh LEOS, và mạng IoT cũng được đề cập.

• Chương 8, đề cập bảo mật mạng, có các cập nhật xuyên suốt. Có phần trình bày mới về Transport Layer Security 1.3, bảo mật WiFi WPA3, và xác thực cùng thỏa thuận khóa trong mạng WiFi và 5G.

Ngoài những thay đổi này, chúng tôi cũng đã cập nhật nhiều mục trong toàn bộ cuốn sách để phản ánh những thay đổi trên mọi mặt của ngành mạng. Trong một số trường hợp, chúng tôi cũng đã bỏ bớt nội dung của ấn bản trước. Như mọi khi, nội dung bị bỏ khỏi bản in luôn có thể được tìm thấy trên Companion Website của sách và trên website của các tác giả.

### Đối tượng độc giả (Audience)

Cuốn sách giáo khoa này dành cho khóa học đầu tiên về mạng máy tính. Nó có thể được dùng ở cả khoa khoa học máy tính lẫn khoa kỹ thuật điện. Về ngôn ngữ lập trình, cuốn sách chỉ giả định rằng sinh viên đã có kinh nghiệm với C, C++, Java hoặc Python (và ngay cả vậy cũng chỉ ở một vài chỗ). Dù cuốn sách này chính xác và mang tính phân tích hơn nhiều sách nhập môn mạng máy tính khác, nó hiếm khi dùng bất kỳ khái niệm toán học nào không được dạy ở trung học. Chúng tôi đã cố ý tránh dùng các khái niệm giải tích nâng cao, xác suất hay quá trình ngẫu nhiên (dù chúng tôi có đưa vào một số bài tập về nhà cho sinh viên có nền tảng nâng cao này). Do đó, cuốn sách phù hợp cho các khóa đại học và các khóa first-year (năm thứ nhất) sau đại học. Nó cũng sẽ hữu ích cho những người làm nghề trong ngành mạng.

## Điều gì khiến cuốn sách giáo khoa này độc đáo? (What Is Unique About This Textbook?)

Chủ đề mạng máy tính vô cùng phức tạp, bao gồm nhiều khái niệm, giao thức và công nghệ đan xen với nhau một cách tinh vi. Để đối phó với phạm vi và độ phức tạp này, nhiều sách mạng máy tính thường được tổ chức xoay quanh các “tầng” (layer) của một kiến trúc mạng. Với cách tổ chức theo tầng, sinh viên có thể nhìn xuyên qua độ phức tạp của mạng máy tính—họ học về các khái niệm và giao thức riêng biệt ở một phần của kiến trúc trong khi vẫn thấy bức tranh toàn cảnh về cách mọi phần khớp với nhau. Từ góc độ sư phạm, kinh nghiệm cá nhân của chúng tôi là cách tiếp cận theo tầng như vậy thực sự hiệu quả. Tuy nhiên, chúng tôi nhận thấy cách giảng dạy truyền thống—từ dưới lên; tức là từ tầng vật lý lên tầng ứng dụng—không phải là cách tiếp cận tốt nhất cho một khóa học hiện đại về mạng máy tính.

### Cách tiếp cận từ trên xuống (A Top-Down Approach)

Cuốn sách của chúng tôi đã mở ra hướng đi mới cách đây 25 năm bằng cách trình bày mạng theo kiểu top-down (từ trên xuống)—tức là bắt đầu từ tầng ứng dụng và đi dần xuống tầng vật lý. Phản hồi chúng tôi nhận được từ cả giảng viên lẫn sinh viên đã xác nhận rằng cách tiếp cận top-down này có nhiều ưu điểm và thực sự hiệu quả về mặt sư phạm. Thứ nhất, nó nhấn mạnh tầng ứng dụng (một “vùng tăng trưởng cao” trong ngành mạng). Thực tế, nhiều cuộc cách mạng gần đây trong mạng máy tính—bao gồm Web và streaming đa phương tiện—đã diễn ra ở tầng ứng dụng. Việc nhấn mạnh sớm các vấn đề application-layer khác với cách tiếp cận của hầu hết các sách khác, vốn chỉ có ít nội dung về các ứng dụng mạng, yêu cầu của chúng, các mô hình application-layer (ví dụ, client-server và peer-to-peer), và các giao diện lập trình ứng dụng.

Thứ hai, kinh nghiệm của chúng tôi với tư cách giảng viên (và của nhiều giảng viên đã dùng cuốn sách này) là việc dạy các ứng dụng mạng ngay gần đầu khóa học là một công cụ tạo động lực mạnh mẽ. Sinh viên rất hào hứng tìm hiểu cách các ứng dụng mạng hoạt động—những ứng dụng như e-mail, streaming video và Web, mà hầu hết sinh viên dùng hằng ngày. Một khi sinh viên hiểu các ứng dụng, họ có thể hiểu các dịch vụ mạng cần thiết để hỗ trợ những ứng dụng này. Đến lượt mình, sinh viên có thể xem xét các cách khác nhau mà những dịch vụ đó có thể được cung cấp và hiện thực ở các tầng thấp hơn. Do đó, đề cập ứng dụng sớm tạo động lực cho phần còn lại của cuốn sách.

Thứ ba, cách tiếp cận top-down cho phép giảng viên giới thiệu việc phát triển ứng dụng mạng ngay từ giai đoạn đầu. Sinh viên không chỉ thấy các ứng dụng và giao thức phổ biến hoạt động thế nào, mà còn học được việc tạo ra ứng dụng mạng và giao thức application-layer của riêng mình dễ dàng ra sao. Với cách tiếp cận top-down, sinh viên sớm tiếp xúc với các khái niệm lập trình socket, mô hình dịch vụ và giao thức—những khái niệm quan trọng xuất hiện trở lại ở mọi tầng tiếp theo. Bằng cách đưa ra các ví dụ lập trình socket bằng Python, chúng tôi làm nổi bật các ý tưởng trung tâm mà không làm sinh viên bối rối với code phức tạp. Sinh viên đại học ngành kỹ thuật điện và khoa học máy tính sẽ không gặp khó khăn gì khi đọc code Python.

### Tập trung vào Internet (An Internet Focus)

Dù chúng tôi đã bỏ cụm “Featuring the Internet” khỏi tựa sách từ ấn bản thứ tư, điều đó không có nghĩa là chúng tôi đã bỏ sự tập trung vào Internet. Thực ra, hoàn toàn ngược lại! Vì Internet đã trở nên phổ biến khắp nơi, chúng tôi cảm thấy bất kỳ sách giáo khoa mạng nào cũng phải tập trung đáng kể vào Internet, và do đó cụm từ này phần nào không còn cần thiết. Chúng tôi tiếp tục dùng kiến trúc và các giao thức của Internet làm phương tiện chính để nghiên cứu các khái niệm nền tảng của mạng máy tính. Tất nhiên, chúng tôi cũng đưa vào các khái niệm và giao thức từ các kiến trúc mạng khác. Nhưng tâm điểm rõ ràng là Internet, một thực tế được phản ánh qua việc chúng tôi tổ chức cuốn sách xoay quanh kiến trúc five-layer (năm tầng) của Internet: tầng ứng dụng, tầng giao vận, tầng mạng, tầng liên kết và tầng vật lý.

Một lợi ích khác của việc đặt Internet làm tâm điểm là hầu hết sinh viên khoa học máy tính và kỹ thuật điện đều háo hức tìm hiểu về Internet và các giao thức của nó. Họ biết rằng Internet là một công nghệ mang tính cách mạng và đột phá, và có thể thấy nó đang thay đổi sâu sắc thế giới của chúng ta. Với mức độ liên quan to lớn của Internet, sinh viên tự nhiên tò mò về những gì nằm “bên dưới nắp capo.” Do đó, giảng viên dễ dàng khiến sinh viên hào hứng với các nguyên lý cơ bản khi dùng Internet làm trọng tâm dẫn dắt.

### Giảng dạy các nguyên lý mạng (Teaching Networking Principles)

Hai trong số các đặc điểm độc đáo của cuốn sách—cách tiếp cận top-down và sự tập trung vào Internet—đã xuất hiện trong tựa sách. Nếu có thể chen thêm cụm từ thứ ba vào phụ đề, nó sẽ chứa từ principles (nguyên lý). Lĩnh vực mạng giờ đã đủ trưởng thành để có thể xác định một số vấn đề quan trọng mang tính nền tảng. Ví dụ, ở tầng giao vận, các vấn đề nền tảng bao gồm giao tiếp tin cậy trên một tầng mạng không tin cậy, thiết lập/ hủy kết nối và bắt tay (handshaking), điều khiển tắc nghẽn và điều khiển luồng, và ghép kênh (multiplexing). Ba vấn đề network-layer quan trọng mang tính nền tảng là xác định các đường đi “tốt” giữa hai router, kết nối một số lượng lớn các mạng không đồng nhất, và quản lý độ phức tạp của một mạng hiện đại. Ở tầng liên kết, một vấn đề nền tảng là chia sẻ một kênh đa truy cập. Trong bảo mật mạng, các kỹ thuật cung cấp tính bảo mật, xác thực và toàn vẹn thông điệp đều dựa trên các nền tảng mật mã học. Cuốn sách này xác định các vấn đề mạng nền tảng và nghiên cứu các cách tiếp cận để giải quyết những vấn đề đó. Sinh viên học các nguyên lý này sẽ có được kiến thức với “hạn sử dụng” dài—rất lâu sau khi nhiều chuẩn và giao thức mạng ngày nay đã lỗi thời, các nguyên lý mà chúng thể hiện vẫn sẽ quan trọng và có giá trị. Chúng tôi tin rằng sự kết hợp giữa việc dùng Internet để giúp sinh viên bước chân vào cửa rồi nhấn mạnh các vấn đề nền tảng và các cách tiếp cận giải quyết sẽ cho phép sinh viên nhanh chóng hiểu gần như bất kỳ công nghệ mạng nào.

### Tài nguyên cho sinh viên (Student Resources)

Tài nguyên cho sinh viên có trên Companion Website (CW) tại http://pearson.com/cs-resources, cũng như trên website của các tác giả, http://gaia.cs.umass.edu/kurose_ross. Tài nguyên bao gồm:

• Tài liệu kỹ thuật bổ sung. Khi thêm nội dung mới vào mỗi ấn bản, chúng tôi phải bỏ bớt một số chủ đề hiện có để giữ cuốn sách ở độ dài hợp lý. Nội dung xuất hiện trong các ấn bản trước vẫn đáng quan tâm, và do đó có thể được tìm thấy trên Website của sách.

• Bài tập lập trình. Website cũng cung cấp một số bài tập lập trình chi tiết, bao gồm xây dựng một Web server đa luồng, xây dựng một e-mail client có giao diện GUI, lập trình phía gửi và phía nhận của một giao thức truyền dữ liệu tin cậy, lập trình một thuật toán định tuyến phân tán, và nhiều bài khác.

• Bài thực hành Wireshark. Hiểu biết về các giao thức mạng có thể được đào sâu đáng kể bằng cách thấy chúng hoạt động thực tế. Website cung cấp nhiều bài tập Wireshark cho phép sinh viên thực sự quan sát chuỗi thông điệp được trao đổi giữa hai thực thể giao thức. Website có các bài thực hành Wire-shark riêng về HTTP, DNS, TCP, UDP, IP, ICMP, Ethernet, ARP, WiFi, TLS và về việc theo dõi mọi giao thức tham gia đáp ứng một request lấy trang Web. Chúng tôi sẽ tiếp tục bổ sung bài thực hành mới theo thời gian.

• Web site của nhà xuất bản. Companion Website chứa các VideoNotes— bài trình bày video về các chủ đề quan trọng xuyên suốt cuốn sách do các tác giả thực hiện, cũng như hướng dẫn giải các bài tập tương tự các bài ở cuối chương. Chúng tôi đã đưa sẵn lên Website các VideoNotes và bài tập trực tuyến cho Chương 1 đến 5. Như các ấn bản trước, Website có các hoạt hình tương tác minh họa nhiều khái niệm mạng then chốt. Giảng viên có thể tích hợp các tính năng tương tác này vào bài giảng hoặc dùng chúng như các bài thực hành nhỏ.

• Website của tác giả. Ngoài Companion Website, các tác giả duy trì một Website công khai, http://gaia.cs.umass.edu/kurose_ross, chứa các tài nguyên mở bao gồm các bài giảng video tương ứng với các mục trong cuốn sách này, thêm tài liệu tương tác cho sinh viên, và bản sao của tài liệu công khai từ Website của nhà xuất bản, như slide PowerPoint và tài liệu thực hành Wireshark. Sinh viên nói với chúng tôi rằng các video ngắn bao quát phần lớn các mục của sách, các bài kiểm tra kiến thức và các bài tập tương tác tạo ra (và trình bày lời giải cho) các bài tập tương tự một số bài end-of-chapter (cuối chương) được chọn đã đặc biệt có giá trị.

## Đặc điểm sư phạm (Pedagogical Features)

Mỗi chúng tôi đã dạy mạng máy tính hơn 30 năm. Cộng lại, chúng tôi mang đến cuốn sách này hơn 70 năm kinh nghiệm giảng dạy, trong thời gian đó chúng tôi đã dạy nhiều nghìn sinh viên. Chúng tôi cũng là những nhà nghiên cứu tích cực về mạng máy tính trong thời gian này. (Thực ra, Jim và Keith gặp nhau lần đầu khi còn là học viên thạc sĩ trong một khóa học mạng máy tính do Mischa Schwartz dạy năm 1979 tại Columbia University.) Chúng tôi nghĩ tất cả những điều này cho chúng tôi một góc nhìn tốt về việc ngành mạng đã đi qua đâu và nhiều khả năng sẽ đi về đâu trong tương lai. Dù vậy, chúng tôi đã cưỡng lại cám dỗ làm lệch nội dung cuốn sách theo các dự án nghiên cứu yêu thích của riêng mình. Chúng tôi nghĩ bạn có thể ghé thăm các trang Web cá nhân của chúng tôi nếu quan tâm đến nghiên cứu của chúng tôi. Do đó, cuốn sách này nói về mạng máy tính hiện đại—nó nói về các giao thức và công nghệ đương đại cũng như các nguyên lý nền tảng đằng sau những giao thức và công nghệ này. Chúng tôi cũng tin rằng học (và dạy!) về mạng có thể rất thú vị. Óc hài hước, việc dùng các phép so sánh, và các ví dụ real-world (thực tế) trong cuốn sách này hy vọng sẽ làm nội dung thú vị hơn.

## Tài liệu bổ trợ cho giảng viên (Supplements for Instructors)

Chúng tôi cung cấp một gói tài liệu bổ trợ đầy đủ để hỗ trợ giảng viên dạy khóa học này. Tài liệu này có thể được truy cập từ Instructor Resource Center của Pearson (http://www.pearsonhighered.com/irc). Ngoài ra còn có thêm tài liệu giảng dạy, bao gồm các bài thực hành Wireshark, bài tập lập trình, gói LMS (tương thích với Canvas, Moodle, Blackboard và D2L), bài giảng video, và bản sao slide Powerpoint, trên web site của các tác giả.

• Slide PowerPoint<sup>®</sup>. Chúng tôi cung cấp slide PowerPoint cho cả tám chương. Các slide đã được cập nhật theo ấn bản thứ chín này. Các slide trình bày chi tiết từng chương. Chúng dùng hình ảnh và hoạt hình (thay vì chỉ dựa vào các gạch đầu dòng văn bản đơn điệu) để làm slide thú vị và hấp dẫn về mặt thị giác. Chúng tôi cung cấp slide PowerPoint gốc để bạn có thể tùy chỉnh cho phù hợp nhất với nhu cầu giảng dạy của mình. Một số slide trong đó do các giảng viên khác từng dạy bằng sách của chúng tôi đóng góp.

• Lời giải. Chúng tôi cung cấp sách lời giải cho các bài tập về nhà trong sách, các bài tập lập trình và các bài thực hành Wireshark. Chúng tôi cũng đã phát triển các module LMS với các câu hỏi tương tự (nhưng khác) với các câu hỏi ôn tập và các bài tập end-of chapter, cũng như cho các bài thực hành Wireshark. Các module này được thiết kế để hoạt động với hầu hết các LMS lớn, bao gồm Canvas, Moodle, Blackboard và D2L. Xem Web site của các tác giả tại http://gaia.cs.umass.edu/kurose_ross/interactive để biết thêm thông tin.

## Sự phụ thuộc giữa các chương (Chapter Dependencies)

Chương đầu tiên của cuốn sách này trình bày một tổng quan self-contained (khép kín) về mạng máy tính. Giới thiệu nhiều khái niệm và thuật ngữ then chốt, chương này đặt nền móng cho phần còn lại của cuốn sách. Mọi chương khác đều phụ thuộc trực tiếp vào chương đầu tiên này. Sau khi hoàn thành Chương 1, chúng tôi khuyến nghị giảng viên dạy Chương 2 đến 6 theo thứ tự, theo triết lý top-down của chúng tôi. Mỗi chương trong năm chương này tận dụng nội dung từ các chương trước. Sau khi hoàn thành sáu chương đầu, giảng viên có khá nhiều sự linh hoạt. Không có sự phụ thuộc lẫn nhau giữa hai chương cuối, nên chúng có thể được dạy theo bất kỳ thứ tự nào. Tuy nhiên, hai chương cuối phụ thuộc vào nội dung của sáu chương đầu. Nhiều giảng viên dạy sáu chương đầu trước rồi dạy một trong hai chương cuối như “món tráng miệng.”

## Lời cuối: Chúng tôi rất muốn nghe ý kiến của bạn (One Final Note: We’d Love to Hear from You)

Chúng tôi khuyến khích sinh viên và giảng viên gửi e-mail cho chúng tôi bất kỳ góp ý nào về cuốn sách. Thật tuyệt vời khi chúng tôi nhận được phản hồi từ rất nhiều giảng viên và sinh viên trên khắp thế giới về bảy ấn bản đầu tiên. Chúng tôi đã đưa nhiều góp ý trong số đó vào các ấn bản sau. Chúng tôi cũng khuyến khích giảng viên gửi cho chúng tôi các bài tập về nhà mới (kèm lời giải) bổ sung cho các bài tập hiện có. Chúng tôi sẽ đăng chúng lên phần instructor-only (chỉ dành cho giảng viên) của Web site. Chúng tôi cũng khuyến khích giảng viên và sinh viên tạo các hoạt hình tương tác mới minh họa các khái niệm và giao thức trong cuốn sách này. Nếu bạn có một hoạt hình mà bạn nghĩ là phù hợp với cuốn sách, hãy gửi cho chúng tôi. Nếu hoạt hình (bao gồm ký hiệu và thuật ngữ) phù hợp, chúng tôi sẽ vui lòng đưa nó lên Web site của sách, kèm ghi nhận phù hợp cho các tác giả của hoạt hình.

Vậy, như câu nói quen thuộc, “Hãy cứ tiếp tục gửi thư cho chúng tôi nhé!” Nghiêm túc mà nói, hãy tiếp tục gửi cho chúng tôi các URL thú vị, chỉ ra lỗi đánh máy, phản bác bất kỳ khẳng định nào của chúng tôi, và cho chúng tôi biết điều gì hiệu quả và điều gì không. Hãy cho chúng tôi biết bạn nghĩ điều gì nên hoặc không nên đưa vào ấn bản tiếp theo. Gửi e-mail của bạn tới kurose@cs.umass.edu và keithwross@nyu.edu.

## Lời cảm ơn (Acknowledgments)

Kể từ khi chúng tôi bắt đầu viết cuốn sách này năm 1996, nhiều người đã giúp đỡ chúng tôi vô cùng quý báu và đã ảnh hưởng đến suy nghĩ của chúng tôi về cách tổ chức và giảng dạy một khóa học mạng tốt nhất. Chúng tôi muốn gửi LỜI CẢM ƠN LỚN tới tất cả những người đã giúp chúng tôi từ những bản nháp đầu tiên của cuốn sách cho đến ấn bản thứ chín này. Chúng tôi cũng rất biết ơn hàng nghìn độc giả trên khắp thế giới—sinh viên, giảng viên, người làm nghề—đã gửi cho chúng tôi suy nghĩ và góp ý về các ấn bản trước cũng như đề xuất cho các ấn bản tương lai. Đặc biệt cảm ơn:

- Al Aho (Columbia University)
- Hisham Al-Mubaid (University of Houston-Clear Lake)
- Pratima Akkunoor (Arizona State University)
- Paul Amer (University of Delaware)
- Shamiul Azom (Arizona State University)
- Lichun Bao (University of California at Irvine)
- Paul Barford (University of Wisconsin)
- Bobby Bhattacharjee (University of Maryland)
- Steven Bellovin (Columbia University)
- Pravin Bhagwat (Wibhu)
- Supratik Bhattacharyya (Amazon)
- Ernst Biersack (Eurécom Institute)
- Shahid Bokhari (University of Engineering & Technology, Lahore)
- Jean Bolot (Orange)
- Phuthipong Bovornkeeratiroj (University of Massachusetts, Amherst)
- Daniel Brushteyn (former University of Pennsylvania student)
- Ken Calvert (University of Kentucky)
- Evandro Cantu (Federal University of Santa Catarina)
- Jeff Case (SNMP Research International)
- Jeff Chaltas (Sprint)
- Kaushik Chowdhury (University of Texas)
- Vinton Cerf (Google)
- Byung Kyu Choi (Michigan Technological University)
- Bram Cohen (BitTorrent, Inc.)
- Constantine Coutras (Pace University)
- Lorrie Cranor (Carnegie-Mellon University)
- John Daigle (University of Mississippi)
- Edmundo A. de Souza e Silva (Federal University of Rio de Janeiro)
- Philippe Decuetos (former Eurecom Institute student)
- Antonio de la Oliva Delgado (U. Carlos III Madrid)
- Christophe Diot (Google)
- Prithula Dhunghel (Akamai)
- Deborah Estrin (Cornell University)
- Michalis Faloutsos (University of California at Riverside)
- Serge Fdida (Sorbonne University)
- Wu-chi Feng (Oregon Graduate Institute)
- Sally Floyd (ICIR, University of California at Berkeley)
- Paul Francis (Max Planck Institute)
- David Fullager (Netflix)
- Lixin Gao (University of Massachusetts)
- JJ Garcia-Luna-Aceves (University of California at Santa Cruz)
- Mario Gerla (University of California at Los Angeles)
- David Goodman (NYU-Poly)
- Yang Guo (Alcatel/Lucent Bell Labs)
- Tim Griffin (Cambridge University)
- Max Hailperin (Gustavus Adolphus College)
- Bruce Harvey (Florida A&M University, Florida State University)
- Michael Hatfield (University of Alaska)
- Carl Hauser (Washington State University)
- Rachelle Heller (George Washington University)
- Phillipp Hoschka (INRIA/W3C)
- Wen Hsin (Park University)
- Albert Huang (former University of Pennsylvania student)
- Cheng Huang (Microsoft Research)
- Esther A. Hughes (Virginia Commonwealth University)
- Soad Ibrahim (Old Dominion University)
- Van Jacobson (Google)
- Pinak Jain (former NYU-Poly student)
- Jobin James (University of California at Riverside)
- Sugih Jamin (University of Michigan)
- Atharva Kale (University of Massachusetts)
- Shivkumar Kalyanaraman (IBM Research, India)
- Jussi Kangasharju (University of Helsinki)
- Sneha Kasera (University of Utah)
- Wolfgang Kellerer (Technical University of Munich)
- Parviz Kermani (U. Massachusetts)
- Hyojin Kim (former University of Pennsylvania student)
- Leonard Kleinrock (University of California at Los Angeles)
- Ed Knightly (Rice University)
- David Kotz (Dartmouth College)
- Beshan Kulapala (Arizona State University)
- Rakesh Kumar (Bloomberg)
- Miguel A. Labrador (University of South Florida)
- Simon Lam (University of Texas)
- Steve Lai (Ohio State University)
- Tom LaPorta (Penn State University)
- Tim-Berners Lee (World Wide Web Consortium)
- Arnaud Legout (INRIA)
- Lee Leitner (Drexel University)
- Brian Levine (University of Massachusetts)
- Chunchun Li (former NYU-Poly student) Yong Liu (NYU-Poly)
- William Liang (former University of Pennsylvania student)
- Nahid Majd (California State University San Marcos)
- Willis Marti (Texas A&M University)
- Nick McKeown (Stanford University)
- Josh McKinzie (Park University)
- Deep Medhi (University of Missouri, Kansas City)
- Bob Metcalfe (International Data Group)
- Vishal Misra (Columbia University)
- Sue Moon (KAIST)
- Paul Mockapetris (Nominum)
- Jenni Moyer (Comcast)
- Erich Nahum (IBM Research)
- Katherine Nolin (Bridgewater State University)
- Deng Pan (Florida International University)
- Christos Papadopoulos (Colorado Sate University)
- Guru Parulkar (Open Networking Foundation)
- Craig Partridge (Colorado State University)
- Radia Perlman (Dell EMC)
- Jitendra Padhye (Microsoft Research)
- Vern Paxson (University of California at Berkeley)
- Kevin Phillips (Sprint)
- George Polyzos (Athens University of Economics and Business)
- Sriram Rajagopalan (Arizona State University)
- Krishnamurthy Raghunandan (Rutgers University)
- Ramachandran Ramjee (Microsoft Research)
- Ken Reek (Rochester Institute of Technology)
- Martin Reisslein (Arizona State University)
- Jennifer Rexford (Princeton University)
- Leon Reznik (Rochester Institute of Technology)
- Pablo Rodrigez (Telefonica)
- Sumit Roy (University of Washington)
- Catherine Rosenberg (University of Waterloo)
- Dan Rubenstein (Columbia University)
- Avi Rubin (Johns Hopkins University)
- Douglas Salane (John Jay College)
- Despina Saparilla (Cisco Systems)
- John Schanz (Comcast)
- Henning Schulzrinne (Columbia University)
- Mischa Schwartz (Columbia University)
- Pable Serrano Yanez-Mingot (U. Carlos III Madrid)
- Ardash Sethi (University of Delaware)
- Harish Sethu (Drexel University)
- K. Sam Shanmugan (University of Kansas)
- Prashant Shenoy (University of Massachusetts)
- Clay Shields (Georgetown University)
- Subin Shrestra (University of Pennsylvania)
- Bojie Shu (former NYU-Poly student)
- Mihail L. Sichitiu (NC State University)
- Peter Steenkiste (Carnegie Mellon University)
- Tatsuya Suda (University of California at Irvine)
- Kin Sun Tam (State University of New York at Albany)
- Violet Syrotiuk (Arizona State University)
- Don Towsley (University of Massachusetts)
- David Turner (California State University, San Bernardino)
- Amin Vahdat (Google)
- Nitin Vaidya (Georgetown University)
- Michele Weigle (Clemson University)
- David Wetherall (Google)
- Ira Winston (University of Pennsylvania)
- Di Wu (Sun Yat-sen University)
- Shirley Wynn (former NYU-Poly student)
- Raj Yavatkar (Google)
- Yechiam Yemini (Columbia University)
- Dian Yu (former NYU-Shanghai student)
- Ming Yu (State University of New York at Binghamton)
- Ellen Zegura (Georgia Institute of Technology)
- Honggang Zhang (Suffolk University)
- Hui Zhang (Carnegie Mellon University)
- Lixia Zhang (University of California at Los Angeles)
- Meng Zhang (former NYU-Poly student)
- Shuchun Zhang (former University of Pennsylvania student)
- Xiaodong Zhang (Ohio State University)
- ZhiLi Zhang (University of Minnesota)
- Phil Zimmermann (independent consultant)
- Mike Zink (University of Massachusetts)
- Cliff C. Zou (University of Central Florida)

Chúng tôi cũng muốn cảm ơn toàn bộ đội ngũ Pearson—đặc biệt là Tracy Johnson và Erin Sullivan—những người đã giúp ấn bản thứ chín này thành hiện thực (và đã phải chịu đựng hai tác giả rất khó tính dường như bẩm sinh không thể kịp hạn chót!). Cảm ơn các họa sĩ Janet Theurer và Patrice Rossi Calkin vì công sức tạo ra những hình vẽ đẹp trong các ấn bản trước, và cảm ơn Abhijeet Gope cùng đội ngũ vì công việc sản xuất tuyệt vời cho ấn bản này. Cuối cùng, lời cảm ơn đặc biệt nhất gửi tới các biên tập viên trước đây của chúng tôi tại Addison-Wesley và Pearson—Matt Goldstein, Michael Hirsch và Susan Hartman. Cuốn sách này sẽ không như hiện nay (và có lẽ đã không tồn tại) nếu không có sự quản lý khéo léo, sự khích lệ không ngừng, sự kiên nhẫn gần như vô hạn, óc hài hước và sự bền bỉ của họ.
