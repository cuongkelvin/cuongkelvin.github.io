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

Nhờ nhiều lợi ích kinh tế và kỹ thuật, ta đang thấy việc dùng Linux cho embedded device tăng mạnh. Xu hướng đã vượt qua gần như mọi thị trường và công nghệ. Linux được chọn cho embedded product trong public switched telephone network toàn cầu, global data network và wireless cellular handset, cũng như radio node controller và backhaul infrastructure vận hành các mạng này. Linux thành công trong ứng dụng ô tô, consumer product như game và PDA, printer, enterprise switch/router cùng nhiều sản phẩm khác. Hàng chục triệu điện thoại di động đang xuất xưởng trên thế giới với Linux làm operating system được chọn. Tỷ lệ sử dụng embedded Linux tiếp tục tăng, chưa thấy điểm dừng.

Sau đây là một số lý do embedded Linux tăng trưởng:

- Linux hỗ trợ vô số hardware device, có lẽ nhiều hơn mọi OS khác.

- Linux hỗ trợ rất nhiều application và networking protocol.

- Linux có khả năng mở rộng, từ device consumer-oriented nhỏ đến switch/router carrier-class lớn, heavy-iron.

- Linux có thể triển khai mà không phải trả royalty như embedded operating system độc quyền truyền thống.

- Linux thu hút rất nhiều developer hoạt động tích cực, cho phép nhanh chóng hỗ trợ hardware architecture, platform và device mới.

- Ngày càng nhiều hardware/software vendor, gồm gần như mọi chip manufacturer top-tier và independent software vendor (ISV), hỗ trợ Linux.

Vì các lý do này và lý do khác, ta thấy tốc độ sử dụng Linux tăng nhanh trong nhiều đồ gia dụng phổ biến, từ TV high-definition đến cellular handset.

## 1.2 Embedded Linux ngày nay

Không ngạc nhiên khi Linux tăng trưởng đáng kể trong lĩnh vực embedded. Thực tế việc bạn đọc sách cho thấy Linux đã chạm tới cuộc sống của bạn. Khó ước lượng market size vì nhiều công ty tiếp tục xây dựng embedded Linux distribution riêng.

LinuxDevices.com, cổng thông tin và tin tức phổ biến do Rick Lehrbaum sáng lập, hiện thuộc Ziff Davis, khảo sát thị trường embedded Linux hằng năm. Khảo sát mới nhất báo Linux trở thành operating system thống trị, được dùng trong hàng nghìn thiết kế mới mỗi năm. Thực tế gần một nửa người trả lời cho biết dùng Linux trong embedded design. Operating system phổ biến kế tiếp được báo chỉ khoảng một phần tám người dùng. Commercial operating system từng thống trị thị trường embedded được báo ít hơn một phần mười người dùng. Dù có lý do phản biện kết quả, không ai có thể bỏ qua đà phát triển thị trường embedded Linux hiện nay.

## 1.3 Mã nguồn mở và GPL

Một yếu tố nền tảng thúc đẩy dùng Linux là tính mã nguồn mở. Để có góc nhìn thú vị và sâu sắc về lịch sử, văn hóa phong trào mã nguồn mở, đọc sách của Eric S. Raymond được dẫn cuối chương.

Linux kernel được cấp phép theo GNU GPL[^1] (General Public License), dẫn tới quan niệm phổ biến Linux miễn phí. Thực tế đoạn hai GNU GPL Version 3 tuyên bố: “Khi nói phần mềm tự do, chúng tôi nói tới tự do, không phải giá cả.” Phần lớn professional development manager đồng ý: có thể tải Linux miễn phí, nhưng phát triển và triển khai OS bất kỳ trên embedded platform đều có chi phí (thường đáng kể). Linux không khác ở điểm này.

GPL ngắn và dễ đọc đáng ngạc nhiên. Sau đây là một số đặc điểm quan trọng nhất:

- License có tính self-perpetuating.

- License cho user tự do chạy chương trình.

- License cho user quyền nghiên cứu và sửa source code.

- License cho user quyền phân phối original code và sửa đổi của mình.

- License có tính lan truyền. Nói cách khác, cấp cùng quyền đó cho bất kỳ ai được bạn phân phối GPL software.

Khi software phát hành theo GPL, phải mãi mang license đó.[^2] Dù code sửa rất nhiều, điều license cho phép và thậm chí khuyến khích, GPL yêu cầu phát hành theo cùng license. Mục đích là bảo đảm tự do truy cập software, gồm bản sửa đổi (hay derived work như thường gọi).

Dù lấy software thế nào, GPL cấp licensee quyền phân phối không giới hạn, không phải trả royalty hoặc phí per-unit. Điều này không nghĩa vendor không thể thu tiền GPL software—đó là business practice hợp lý và phổ biến. Nghĩa là khi sở hữu GPL software, được phép sửa và phân phối lại dù là derived (modified) work hay không. Tuy nhiên theo GPL, tác giả modified work có nghĩa vụ phát hành theo GPL nếu quyết định làm vậy. Mọi phân phối derived work, như giao cho khách hàng, kích hoạt nghĩa vụ.

### 1.3.1 Miễn phí và tự do

Hai câu thường lặp lại khi nói tính “free” của mã nguồn mở: “free như tự do” và “free như bia miễn phí”. (Tác giả đặc biệt thích câu sau.) GPL tồn tại bảo đảm “free như tự do” cho tập software nhất định. Bảo đảm tự do dùng, nghiên cứu và sửa. Cũng bảo đảm tự do đó cho mọi người nhận modified code bạn phân phối. Khái niệm đã được hiểu khá rộng rãi.

Một hiểu nhầm thường nghe là Linux “free như bia miễn phí”. Có thể lấy Linux không mất tiền. Có thể tải Linux kernel trong vài phút. Nhưng như professional development manager hiểu, software bất kỳ tích hợp vào thiết kế đều gắn chi phí nhất định. Gồm thu nhận, tích hợp, sửa đổi, bảo trì và hỗ trợ. Thêm chi phí lấy và duy trì toolchain cấu hình đúng, library, application program cùng tool cross-development chuyên dụng tương thích architecture đã chọn, bạn nhanh chóng thấy phát triển software component và development environment cần để phát triển/triển khai embedded system Linux-based không phải việc đơn giản.

## 1.4 Tiêu chuẩn và tổ chức liên quan

Khi Linux tiếp tục tăng thị phần desktop, enterprise và embedded, tiêu chuẩn và tổ chức mới xuất hiện để tác động việc dùng/chấp nhận Linux. Phần này giới thiệu tiêu chuẩn bạn có thể muốn làm quen.

### 1.4.1 Linux Standard Base

Có lẽ tiêu chuẩn liên quan nhất với Linux distribution maintainer là Linux Standard Base (LSB). Mục tiêu thiết lập tập tiêu chuẩn tăng interoperability của application giữa Linux distribution khác nhau. Hiện LSB bao phủ nhiều architecture gồm IA32/64, Power Architecture 32- và 64-bit, AMD64, v.v. Tiêu chuẩn chia core component và architectural component riêng.

LSB quy định thuộc tính chung của Linux distribution, gồm object format, standard library interface, tập command/utility tối thiểu và hành vi, file system layout, system initialization, v.v.

Có thể tìm hiểu thêm LSB tại link cuối chương.

### 1.4.2 Linux Foundation

Theo website, Linux Foundation “là liên minh non-profit chuyên thúc đẩy Linux tăng trưởng”. Linux Foundation tài trợ công việc Linus Torvalds, người tạo Linux. Tài trợ nhiều working group định nghĩa tiêu chuẩn và tham gia phát triển feature hướng tới nhiều thuộc tính Linux platform quan trọng. Hai phần tiếp theo giới thiệu một số sáng kiến.

### 1.4.3 Carrier-Grade Linux

Nhiều nhà sản xuất networking và telecommunications equipment lớn nhất thế giới đang phát triển hoặc xuất xưởng thiết bị carrier-class chạy Linux làm operating system. Feature quan trọng của thiết bị carrier-class gồm reliability cao, availability cao và serviceability nhanh. Vendor thiết kế sản phẩm với redundant architecture hot-swap, feature fault-tolerant, clustering và thường cả hiệu năng real-time.

Working group Carrier Grade Linux của Linux Foundation tạo specification định nghĩa tập yêu cầu cho thiết bị carrier-class. Version hiện tại bao phủ bảy functional area:

- Availability—Yêu cầu tăng availability, gồm online maintenance operation, redundancy và status monitoring

- Clusters—Yêu cầu hỗ trợ redundant service như cluster membership management và data checkpointing

- Serviceability—Yêu cầu servicing và maintenance từ xa như SNMP và diagnostic monitoring cho quạt, power supply

- Performance—Yêu cầu định nghĩa performance/scalability, symmetric multiprocessing, latency, v.v.

- Standards—Yêu cầu định nghĩa tiêu chuẩn thiết bị CGL-compliant phải tuân thủ

- Hardware—Yêu cầu liên quan hardware high-availability như blade server và interface hardware-management

- Security—Yêu cầu cải thiện overall system security, bảo vệ khỏi các external threat

### 1.4.4 Mobile Linux Initiative: Moblin

Nhiều mobile handset (điện thoại di động) trên thị trường toàn cầu xây dựng quanh embedded Linux. Nhiều báo cáo cho biết hàng chục triệu handset xuất xưởng với Linux làm operating system platform. Điều chắc chắn duy nhất là còn nhiều hơn nữa. Hứa hẹn đây là một market segment bùng nổ nhất cho vai trò trước kia của proprietary operating system real-time. Điều này thể hiện rõ Linux sẵn sàng cho commercial embedded application.

Linux Foundation tài trợ working group ban đầu gọi Mobile Linux Initiative, nay là Moblin. Theo website Linux Foundation, mục đích đẩy nhanh dùng Linux trên mobile handset next-generation và portable device hội tụ voice/data khác. Trọng tâm gồm development tool, I/O và networking, memory management, multimedia, performance, power management, security và storage. Moblin website tại http://moblin.org. Có thể thử release như Fedora/Moblin tại http://fedoraproject.org/wiki/Features/FedoraMoblin, hoặc Ubuntu Moblin remix trên Dell Mini 10 Netbook của tác giả.

Bức tranh embedded Linux liên tục thay đổi. Khi chuẩn bị ấn bản thứ hai, dự án Moblin và Maemo hợp nhất thành MeeGo. Có thể tìm hiểu thêm, thậm chí tải MeeGo image thử tại http://meego.com/.

### 1.4.5 Service Availability Forum

Nếu xây sản phẩm cho môi trường coi trọng high reliability, availability và serviceability (RAS), nên biết Service Availability Forum (SA Forum). Tổ chức dẫn đầu định nghĩa tập interface chung để system management trong thiết bị carrier-grade và commercial equipment khác. Website tại www.saforum.org.

## 1.5 Tổng kết

Embedded Linux đã thắng cuộc đua. Thực tế có lẽ bạn có embedded Linux trong ô tô hoặc nhà. Chương xem lý do và xây góc nhìn cho tài liệu tiếp theo:

- Việc dùng Linux trong developer và manufacturer embedded product tiếp tục tăng tốc.

- Dùng Linux trong embedded device tiếp tục tăng với nhịp độ thú vị.

- Nhiều yếu tố thúc đẩy Linux tăng trưởng trong thị trường embedded.

- Một số tiêu chuẩn và tổ chức liên quan đang tác động embedded Linux.

### 1.5.1 Gợi ý đọc thêm

The Cathedral and the Bazaar Eric S. Raymond O’Reilly Media, Inc., 2001

Linux Standard Base Project http://www.linuxfoundation.org/collaborate/workgroups/lsb

Linux Foundation http://www.linuxfoundation.org/

[^1]: Xem http://www.gnu.org/licenses/gpl.html để đọc đầy đủ license.

[^2]: Nếu mọi copyright holder đồng ý, theo lý thuyết software có thể phát hành theo license mới. Thực sự rất khó xảy ra, đặc biệt với software base lớn có hàng nghìn contributor.
