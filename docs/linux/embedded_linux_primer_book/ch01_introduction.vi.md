# Chương 1. Giới thiệu

## Trong chương này

- 1\.1 Vì sao chọn Linux? 2

- 1\.2 Embedded Linux ngày nay 3

- 1\.3 Mã nguồn mở và GPL 3

- 1\.4 Tiêu chuẩn và tổ chức liên quan 5

- 1\.5 Tổng kết 8

Xu hướng rời xa embedded operating system độc quyền đang gây ra

khá nhiều xáo động trong phòng họp lãnh đạo của các công ty

embedded operating system (OS) truyền thống. Vì nhiều lý do well-founded, Linux đang

được chọn làm operating system cho nhiều sản phẩm ngoài

thế mạnh truyền thống là server application. Ví dụ về embedded system này gồm

điện thoại di động, DVD player, video game, máy ảnh kỹ thuật số, network switch,

và thiết bị wireless networking. Rất có thể Linux đã hiện diện trong nhà

hoặc ô tô của bạn. Linux thường được chọn làm embedded operating

system trong thiết bị như set-top box, TV high-definition, Blu-ray

DVD player, trung tâm thông tin giải trí ô tô và nhiều thiết bị gặp

trong cuộc sống hằng ngày.

## 1.1 Vì sao chọn Linux?

Nhờ nhiều lợi ích kinh tế và kỹ thuật, chúng ta đang chứng kiến sự tăng trưởng mạnh trong việc sử dụng Linux cho embedded device. Xu hướng này đã lan rộng ra hầu như mọi thị trường và công nghệ. Linux được sử dụng cho embedded product trong public switched telephone network toàn cầu, global data network và wireless cellular handset, cũng như radio node controller và backhaul infrastructure vận hành các mạng này. Linux đã thành công trong ứng dụng ô tô, sản phẩm tiêu dùng như game và PDA, printer, enterprise switch và router cùng nhiều sản phẩm khác. Hàng chục triệu điện thoại di động đang được xuất xưởng trên toàn thế giới với Linux là operating system được lựa chọn. Tỷ lệ sử dụng embedded Linux tiếp tục tăng và chưa có dấu hiệu dừng lại.

Sau đây là một số lý do embedded Linux tăng trưởng:

- Linux hỗ trợ vô số hardware device, có lẽ nhiều hơn mọi OS khác.

- Linux hỗ trợ rất nhiều application và networking protocol.

- Linux có khả năng mở rộng, từ device consumer-oriented nhỏ đến switch/router carrier-class lớn, heavy-iron.

- Linux có thể triển khai mà không phải trả royalty như embedded operating system độc quyền truyền thống.

- Linux thu hút rất nhiều developer hoạt động tích cực, cho phép nhanh chóng hỗ trợ hardware architecture, platform và device mới.

- Ngày càng nhiều hardware/software vendor, gồm gần như mọi chip manufacturer top-tier và independent software vendor (ISV), hỗ trợ Linux.

Vì các lý do này và lý do khác, ta thấy tốc độ sử dụng Linux tăng nhanh trong nhiều đồ gia dụng phổ biến, từ TV high-definition đến cellular handset.

## 1.2 Embedded Linux ngày nay

Không có gì ngạc nhiên khi Linux đã tăng trưởng đáng kể trong lĩnh vực embedded. Thực tế, việc bạn đang đọc cuốn sách này cho thấy Linux đã có ảnh hưởng đến cuộc sống của bạn. Khó ước tính quy mô thị trường vì nhiều công ty tiếp tục xây dựng embedded Linux distribution riêng.

LinuxDevices.com, cổng tin tức và thông tin phổ biến do Rick Lehrbaum thành lập, hiện thuộc sở hữu Ziff Davis, tiến hành khảo sát thị trường embedded Linux hằng năm. Trong khảo sát mới nhất, trang này báo cáo Linux đã trở thành operating system chiếm ưu thế, được sử dụng trong hàng nghìn thiết kế mới mỗi năm. Thực tế, gần một nửa số người trả lời cho biết sử dụng Linux trong một embedded design. Operating system phổ biến tiếp theo được cho biết chỉ có khoảng một phần tám số người trả lời sử dụng. Các operating system thương mại từng thống trị thị trường embedded được báo cáo là có ít hơn một phần mười số người trả lời sử dụng. Ngay cả khi có lý do tranh luận về các kết quả này, không ai có thể bỏ qua đà phát triển của thị trường embedded Linux hiện nay.

## 1.3 Mã nguồn mở và GPL

Một trong những yếu tố nền tảng thúc đẩy việc sử dụng Linux là tính open source. Để có góc nhìn hấp dẫn và sâu sắc về lịch sử cùng văn hóa của phong trào open source, hãy đọc cuốn sách của Eric S. Raymond được dẫn ở cuối chương này.

Linux kernel được cấp phép theo các điều khoản của GNU GPL[^1] (General Public License), dẫn đến quan niệm phổ biến rằng Linux miễn phí. Thực tế, đoạn thứ hai của GNU GPL Version 3 tuyên bố: “Khi nói đến phần mềm tự do, chúng tôi đề cập đến tự do, không phải giá cả.” Phần lớn người quản lý phát triển chuyên nghiệp đều đồng ý: bạn có thể download Linux miễn phí, nhưng phát triển và triển khai bất kỳ OS nào trên embedded platform đều có chi phí, thường là đáng kể. Linux không khác ở khía cạnh này.

GPL ngắn và dễ đọc đáng ngạc nhiên. Sau đây là một số đặc điểm quan trọng nhất:

- License có tính self-perpetuating.

- License cho user tự do chạy chương trình.

- License cho user quyền nghiên cứu và sửa source code.

- License cho user quyền phân phối original code và sửa đổi của mình.

- License có tính lan truyền. Nói cách khác, cấp cùng quyền đó cho bất kỳ ai được bạn phân phối GPL software.

Khi software được phát hành theo các điều khoản của GPL, nó phải luôn mang license đó.[^2] Ngay cả khi code được sửa đổi rất nhiều, điều được license cho phép và thậm chí khuyến khích, GPL vẫn yêu cầu code phải được phát hành theo cùng license. Mục đích của quy định này là bảo đảm quyền tự do truy cập software, bao gồm các phiên bản đã sửa đổi của software (hay derived work, như thường được gọi).

Bất kể software được lấy bằng cách nào, GPL cấp cho người được cấp phép quyền phân phối không giới hạn mà không có nghĩa vụ trả royalty hoặc phí per-unit. Điều này không có nghĩa vendor không thể thu tiền cho GPL software; đây là một thông lệ kinh doanh hợp lý và phổ biến. Nó có nghĩa là khi sở hữu GPL software, bạn được phép sửa đổi và phân phối lại, dù đó có phải derived (modified) work hay không. Tuy nhiên, theo GPL, tác giả của modified work có nghĩa vụ phát hành tác phẩm theo GPL nếu quyết định phát hành. Mọi việc phân phối derived work, chẳng hạn giao cho khách hàng, đều làm phát sinh nghĩa vụ này.

### 1.3.1 Miễn phí và tự do

Hai cụm từ phổ biến thường được nhắc lại khi thảo luận tính “free” của open source là “free as in freedom” và “free as in beer”. (Tác giả đặc biệt thích cụm thứ hai.) GPL tồn tại để bảo đảm “free as in freedom” cho một khối software cụ thể. Nó bảo đảm quyền tự do sử dụng, nghiên cứu và sửa đổi software. Nó cũng bảo đảm các quyền tự do này cho bất kỳ ai được bạn phân phối modified code. Khái niệm này đã được hiểu tương đối rộng rãi.

Một hiểu nhầm thường nghe là Linux “free as in beer”. Bạn có thể lấy Linux mà không mất tiền và download Linux kernel trong vài phút. Tuy nhiên, như mọi người quản lý phát triển chuyên nghiệp đều hiểu, bất kỳ software nào được tích hợp vào thiết kế cũng có các chi phí nhất định. Chúng gồm chi phí thu nhận, tích hợp, sửa đổi, bảo trì và hỗ trợ. Cộng thêm chi phí lấy và duy trì toolchain được cấu hình đúng, library, application program và các công cụ cross-development chuyên dụng tương thích với architecture đã chọn, bạn sẽ nhanh chóng thấy rằng phát triển các thành phần software cùng môi trường cần thiết để phát triển và triển khai embedded system Linux-based không phải một công việc đơn giản.

## 1.4 Tiêu chuẩn và tổ chức liên quan

Khi Linux tiếp tục tăng thị phần trong các phân khúc desktop, enterprise và embedded, những tiêu chuẩn và tổ chức mới đã xuất hiện để tác động đến việc sử dụng và chấp nhận Linux. Mục này giới thiệu các tiêu chuẩn mà bạn có thể muốn làm quen.

### 1.4.1 Linux Standard Base

Có lẽ tiêu chuẩn liên quan nhất đối với Linux distribution maintainer là Linux Standard Base (LSB). Mục tiêu của LSB là thiết lập một tập tiêu chuẩn giúp tăng khả năng tương tác của ứng dụng giữa các Linux distribution khác nhau. Hiện tại, LSB bao phủ một số architecture, bao gồm IA32/64, Power Architecture 32- và 64-bit, AMD64 cùng các architecture khác. Tiêu chuẩn được chia thành một thành phần cốt lõi và các thành phần architecture riêng.

LSB quy định các thuộc tính chung của Linux distribution, bao gồm object format, standard library interface, tập command và tiện ích tối thiểu cùng hành vi của chúng, file system layout, system initialization và các thuộc tính khác.

Có thể tìm hiểu thêm LSB tại link cuối chương.

### 1.4.2 Linux Foundation

Theo website của mình, Linux Foundation “là một liên minh non-profit chuyên thúc đẩy sự phát triển của Linux”. Linux Foundation tài trợ công việc của Linus Torvalds, người tạo ra Linux. Linux Foundation tài trợ một số working group để định nghĩa tiêu chuẩn và tham gia phát triển các feature hướng đến nhiều thuộc tính quan trọng của Linux platform. Hai mục tiếp theo giới thiệu một số sáng kiến đó.

### 1.4.3 Carrier-Grade Linux

Một số lượng đáng kể các nhà sản xuất thiết bị mạng và viễn thông lớn nhất thế giới đang phát triển hoặc xuất xưởng thiết bị carrier-class sử dụng Linux làm operating system. Những feature quan trọng của thiết bị carrier-class gồm độ tin cậy cao, tính sẵn sàng cao và khả năng bảo trì nhanh. Các vendor này thiết kế sản phẩm bằng kiến trúc dự phòng hot-swap, feature fault-tolerant, clustering và thường cả hiệu năng real-time.

Working group Carrier Grade Linux của Linux Foundation đã tạo một specification định nghĩa tập yêu cầu dành cho thiết bị carrier-class. Phiên bản hiện tại của specification bao phủ bảy lĩnh vực chức năng:

- Availability—Yêu cầu tăng availability, gồm online maintenance operation, redundancy và status monitoring

- Clusters—Yêu cầu hỗ trợ redundant service như cluster membership management và data checkpointing

- Serviceability—Yêu cầu servicing và maintenance từ xa như SNMP và diagnostic monitoring cho quạt, power supply

- Performance—Yêu cầu định nghĩa performance/scalability, symmetric multiprocessing, latency, v.v.

- Standards—Yêu cầu định nghĩa tiêu chuẩn thiết bị CGL-compliant phải tuân thủ

- Hardware—Yêu cầu liên quan hardware high-availability như blade server và interface hardware-management

- Security—Yêu cầu cải thiện overall system security, bảo vệ khỏi các external threat

### 1.4.4 Mobile Linux Initiative: Moblin

Một số mobile handset (điện thoại di động) có trên thị trường toàn cầu được xây dựng dựa trên embedded Linux. Nhiều báo cáo cho biết hàng chục triệu handset đã được xuất xưởng với Linux làm operating system platform. Điều chắc chắn duy nhất là số lượng sẽ tiếp tục tăng. Đây hứa hẹn là một trong những phân khúc thị trường bùng nổ nhất cho lĩnh vực vốn thuộc vai trò của một proprietary real-time operating system. Điều này cho thấy rõ mức độ sẵn sàng của Linux đối với các ứng dụng embedded thương mại.

Linux Foundation tài trợ một working group ban đầu tên là Mobile Linux Initiative, nay được gọi là Moblin. Theo website Linux Foundation, mục đích của nhóm là đẩy nhanh việc sử dụng Linux trên các mobile handset next-generation và những thiết bị di động hội tụ voice/data khác. Các lĩnh vực trọng tâm của working group này gồm development tool, I/O và networking, memory management, multimedia, performance, power management, security và storage. Website Moblin có tại http://moblin.org. Bạn có thể thử một Moblin release như Fedora/Moblin tại http://fedoraproject.org/wiki/Features/FedoraMoblin, hoặc Ubuntu Moblin remix có trên Dell Mini 10 Netbook của tác giả.

Bức tranh embedded Linux liên tục phát triển. Trong khi chuẩn bị ấn bản thứ hai này, các dự án Moblin và Maemo đã hợp nhất thành MeeGo. Bạn có thể tìm hiểu thêm về MeeGo, thậm chí download MeeGo image để thử, tại http://meego.com/.

### 1.4.5 Service Availability Forum

Nếu đang xây dựng sản phẩm cho những môi trường coi trọng độ tin cậy, tính sẵn sàng và khả năng bảo trì cao (RAS), bạn cần biết Service Availability Forum (SA Forum). Tổ chức này đóng vai trò dẫn đầu trong việc định nghĩa một tập interface chung phục vụ quản lý hệ thống trong thiết bị carrier-grade và các thiết bị thương mại khác. Website SA Forum có tại www.saforum.org.

## 1.5 Tổng kết

Embedded Linux đã giành chiến thắng trong cuộc đua. Thực tế, có thể bạn đã có embedded Linux trong ô tô hoặc nhà mình. Chương này xem xét các lý do và xây dựng góc nhìn cho nội dung tiếp theo:

- Việc dùng Linux trong developer và manufacturer embedded product tiếp tục tăng tốc.

- Dùng Linux trong embedded device tiếp tục tăng với nhịp độ thú vị.

- Nhiều yếu tố thúc đẩy Linux tăng trưởng trong thị trường embedded.

- Một số tiêu chuẩn và tổ chức liên quan đang tác động embedded Linux.

### 1.5.1 Gợi ý đọc thêm

The Cathedral and the Bazaar Eric S. Raymond O’Reilly Media, Inc., 2001

Linux Standard Base Project http://www.linuxfoundation.org/collaborate/workgroups/lsb

Linux Foundation http://www.linuxfoundation.org/

[^1]: Xem http://www.gnu.org/licenses/gpl.html để đọc đầy đủ license.

[^2]: Nếu tất cả chủ sở hữu bản quyền đồng ý, về lý thuyết software có thể được phát hành theo một license mới. Đây thực sự là tình huống rất khó xảy ra, đặc biệt với một software base lớn có hàng nghìn người đóng góp.
