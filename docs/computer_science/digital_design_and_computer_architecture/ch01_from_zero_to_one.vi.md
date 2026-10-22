# 1 Từ zero đến one

- 1.1 Kế hoạch hành động
- 1.2 Nghệ thuật quản lý độ phức tạp
- 1.3 Digital abstraction
- 1.4 Hệ đếm
- 1.5 Logic gate
- 1.6 Bên dưới digital abstraction
- 1.7 CMOS transistor\*
- 1.8 Công suất tiêu thụ\*
- 1.9 Tóm tắt và nhìn về phía trước
- Bài tập
- Câu hỏi phỏng vấn

## 1.1 KẾ HOẠCH HÀNH ĐỘNG

Microprocessor đã cách mạng hóa thế giới của chúng ta trong ba thập kỷ qua. Laptop ngày nay có năng lực vượt xa một mainframe room-sized của những năm trước. Một ô tô hạng sang chứa khoảng 100 microprocessor. Các tiến bộ về microprocessor đã giúp điện thoại di động và Internet trở thành hiện thực, cải thiện y học vượt bậc và thay đổi cách tiến hành chiến tranh. Doanh số ngành semiconductor toàn cầu tăng từ 21 tỷ USD năm 1985 lên 400 tỷ USD năm 2020, và microprocessor chiếm một phần lớn trong doanh số đó. Chúng tôi tin rằng microprocessor không chỉ quan trọng về kỹ thuật, kinh tế và xã hội, mà bản thân nó còn là một phát minh hấp dẫn của con người. Khi đọc hết sách, bạn sẽ biết cách thiết kế và xây dựng microprocessor của riêng mình. Những kỹ năng học được trong quá trình đó sẽ chuẩn bị cho bạn thiết kế nhiều digital system khác.

![img_p026](images/ch01/img_p026.png)

Chúng tôi giả định bạn có hiểu biết cơ bản về điện, một chút kinh nghiệm lập trình và sự quan tâm thực sự đến những gì diễn ra bên trong máy tính. Sách tập trung thiết kế digital system, hoạt động trên 1 và 0. Bắt đầu với digital logic gate nhận 1 và 0 làm input, tạo 1 và 0 làm output. Tiếp đó tìm hiểu kết hợp logic gate thành module phức tạp hơn như adder và memory. Rồi chuyển sang lập trình assembly language, ngôn ngữ bản địa của microprocessor. Cuối cùng kết hợp gate thành microprocessor chạy các chương trình assembly này.

Ưu điểm lớn của digital system là các khối cấu thành khá đơn giản: chỉ 1 và 0. Chúng không đòi toán học rắc rối hay kiến thức vật lý sâu sắc. Thách thức của designer là kết hợp những khối đơn giản thành hệ thống phức tạp. Microprocessor có thể là hệ thống đầu tiên bạn xây dựng phức tạp đến mức không thể nắm toàn bộ trong đầu cùng lúc. Một chủ đề lớn xuyên suốt sách là cách quản lý độ phức tạp.

## 1.2 NGHỆ THUẬT QUẢN LÝ ĐỘ PHỨC TẠP

Một đặc điểm phân biệt engineer hoặc nhà khoa học máy tính với người ngoài ngành là cách tiếp cận có hệ thống để quản lý độ phức tạp. Digital system hiện đại được xây từ hàng triệu hoặc hàng tỷ transistor. Không ai có thể hiểu bằng cách viết phương trình mô tả chuyển động electron trong từng transistor rồi giải đồng thời tất cả. Bạn cần học quản lý độ phức tạp để hiểu cách xây microprocessor mà không sa lầy trong chi tiết.

### 1.2.1 Abstraction

Kỹ thuật then chốt để quản lý độ phức tạp là abstraction: giấu chi tiết khi không quan trọng. Có thể nhìn hệ thống ở nhiều mức abstraction. Ví dụ chính trị gia Mỹ chia thế giới thành thành phố, hạt, bang và quốc gia. Một hạt gồm nhiều thành phố; một bang gồm nhiều hạt. Khi tranh cử tổng thống, chính trị gia chủ yếu quan tâm cả bang bỏ phiếu thế nào hơn là từng hạt, nên bang là mức abstraction hữu ích nhất. Ngược lại, Census Bureau đo dân số từng thành phố, nên phải xét chi tiết ở mức abstraction thấp hơn.

![fig1_01](images/ch01/fig1_01.png)

Hình 1.1 Các mức abstraction của hệ thống tính toán điện tử

Hình 1.1 minh họa các mức abstraction của hệ thống máy tính điện tử cùng khối cấu thành điển hình ở mỗi mức. Thấp nhất là vật lý, chuyển động electron. Hành vi electron được mô tả bằng cơ học lượng tử và phương trình Maxwell. Hệ thống được xây bằng thiết bị điện tử như transistor (hay ngày xưa là vacuum tube). Chúng có điểm nối well-defined gọi terminal, có thể mô hình hóa bằng quan hệ điện áp và dòng điện đo tại từng terminal. Abstraction lên mức device cho phép bỏ qua từng electron. Mức tiếp theo là analog circuit, ghép device thành component như amplifier. Analog circuit nhận và xuất dải điện áp liên tục. Digital circuit như logic gate giới hạn điện áp vào các dải rời rạc dùng biểu diễn 0 và 1. Trong logic design, từ digital circuit xây cấu trúc phức tạp hơn như adder hay memory.

Microarchitecture nối mức logic với mức architecture. Mức architecture mô tả máy tính từ góc nhìn programmer. Ví dụ architecture Intel x86 trong microprocessor của phần lớn personal computer (PC) được định nghĩa bằng tập instruction và register (memory tạm lưu variable) programmer được phép dùng. Microarchitecture kết hợp logic element để thực thi instruction do architecture định nghĩa. Một architecture có thể được triển khai bằng nhiều microarchitecture với trade-offs khác nhau về giá, performance và công suất. Ví dụ Intel Core i7, Intel 80486 và AMD Athlon đều triển khai x86 bằng microarchitecture khác nhau.

Sang software, operating system xử lý chi tiết low-level như truy cập ổ cứng hoặc quản lý memory. Cuối cùng application software dùng các tiện ích operating system cung cấp để giải bài toán người dùng. Nhờ abstraction, bà của bạn có thể lướt Web mà không bận tâm dao động lượng tử electron hay tổ chức memory trong máy.

Sách tập trung mức abstraction từ digital circuit đến computer architecture. Khi làm ở một mức, nên biết đôi chút về mức ngay trên và dưới. Ví dụ nhà khoa học máy tính không thể tối ưu hoàn toàn code nếu không hiểu architecture đích. Device engineer không thể có trade-offs sáng suốt trong thiết kế transistor nếu không hiểu circuit sẽ dùng nó. Chúng tôi hy vọng sau khi đọc hết, bạn chọn được mức abstraction phù hợp bài toán và đánh giá ảnh hưởng lựa chọn thiết kế lên mức khác.

> Mỗi chương bắt đầu bằng icon abstraction, màu xanh đậm chỉ trọng tâm, các sắc xanh nhạt hơn chỉ chủ đề phụ.

> Ford giới thiệu Model T với tuyên ngôn táo bạo:
>
> Tôi sẽ xây ô tô cho số đông. Nó đủ lớn cho gia đình nhưng đủ nhỏ để cá nhân vận hành và chăm sóc. Nó sẽ làm bằng vật liệu tốt nhất, bởi những người giỏi nhất có thể thuê, theo thiết kế đơn giản nhất mà kỹ thuật hiện đại nghĩ ra. Nhưng giá sẽ thấp đến mức không người có lương khá nào không thể sở hữu—và cùng gia đình tận hưởng những giờ vui thú trong không gian rộng lớn của Chúa. \[My Life and Work, Samuel Crowther và Henry Ford, 1922\]

### 1.2.2 Discipline

Discipline là chủ ý giới hạn lựa chọn thiết kế để làm việc năng suất hơn ở mức abstraction cao hơn. Dùng bộ phận có thể thay thế lẫn nhau là ứng dụng quen thuộc. Ví dụ nổi tiếng ban đầu là sản xuất ô tô. Dù ô tô gas-powered hiện đại bắt nguồn từ Benz Patent-Motorwagen của Đức năm 1886, xe đời đầu được thợ lành nghề làm thủ công, quá trình time-consuming và đắt đỏ. Henry Ford tạo bước tiến then chốt năm 1908 bằng cách tập trung sản xuất hàng loạt với bộ phận thay thế lẫn nhau và dây chuyền lắp ráp chuyển động.

Discipline dùng bộ phận thay thế lẫn nhau cách mạng hóa ngành. Giới hạn component ở một tập chuẩn hóa với dung sai well-defined cho phép lắp ráp, sửa xe nhanh hơn nhiều, ít đòi kỹ năng hơn. Người chế tạo không còn bận tâm mức abstraction thấp như lắp cửa vào lỗ mở chưa chuẩn hóa. Model T Ford trở thành xe most-produced thời đó, bán hơn 15 triệu chiếc. Ví dụ discipline khác là câu nói nổi tiếng của Ford: “Khách hàng muốn xe sơn màu nào cũng được, miễn là màu đen.”

> ![note_p029](images/ch01/note_p029.png)
>
> Model T Ford Ảnh từ https://commons.wikimedia.org/wiki/File: TModel\_launch\_Geelong.jpg.

Trong sách, digital discipline rất quan trọng. Digital circuit dùng điện áp rời rạc, analog circuit dùng điện áp liên tục. Vì vậy digital circuit là tập con của analog circuit, theo nghĩa nào đó khả năng phải hạn chế hơn lớp analog rộng hơn. Tuy nhiên digital circuit dễ thiết kế hơn nhiều. Giới hạn ở digital circuit giúp dễ kết hợp component thành hệ thống tinh vi, cuối cùng vượt hệ thống analog trong nhiều application. Ví dụ TV số, compact disk (CD) và điện thoại di động đang thay thế tiền thân analog.

### 1.2.3 Ba chữ -Y

Ngoài abstraction và discipline, designer dùng ba “-y” quản lý độ phức tạp: hierarchy, modularity, regularity. Các nguyên tắc áp dụng cho cả software và hardware.

- Hierarchy chia hệ thống thành module, tiếp tục chia từng module đến khi các phần dễ hiểu.

- Modularity yêu cầu module có function và interface well-defined để dễ nối mà không có side effect ngoài dự kiến.

- Regularity tìm sự đồng nhất giữa module. Module chung được tái sử dụng nhiều lần, giảm số module riêng phải thiết kế.

Để minh họa ba “-y”, quay lại sản xuất ô tô. Ô tô là một trong những vật dụng phổ biến phức tạp nhất đầu thế kỷ 20. Theo hierarchy, có thể chia Model T Ford thành chassis, động cơ, ghế. Động cơ gồm bốn cylinder, carburetor, magneto và hệ làm mát. Carburetor gồm cửa nhiên liệu/không khí, choke, throttle, needle valve, v.v., như Hình 1.2. Cửa nhiên liệu làm từ khuỷu nối ren và coupling nut. Như vậy hệ thống phức tạp được chia đệ quy thành component đơn giản thay thế lẫn nhau, có thể sản xuất hàng loạt.

Modularity dạy rằng mỗi component nên có function và interface well-defined. Ví dụ coupling nut giữ đường cấp nhiên liệu với khuỷu nạp sao cho không rò nhưng dễ tháo khi thay đường cấp. Nó có đường kính, bước ren chuẩn, siết theo torque chuẩn bằng cờ lê chuẩn. Nhà sản xuất xe có thể mua từ nhiều nhà cung cấp miễn chỉ đúng kích thước. Modularity đòi không có side effect: nut không làm biến dạng khuỷu và tốt nhất nằm nơi siết/tháo được mà không tháo thiết bị khác trong động cơ.

![fig1_02](images/ch01/fig1_02.png)

Hình 1.2 Mặt cắt hệ nhiên liệu Model T, bên trái là nguồn nhiên liệu, bên phải là carburetor. (https://en.wikipedia.org/wiki/Ford\_Model\_T\_engine#/media/File:Pagé\_1917\_Model\_T\_ Ford\_Car\_Figure\_14.png)

Regularity dạy rằng bộ phận thay thế lẫn nhau là ý tưởng tốt. Carburetor rò có thể thay bằng bộ phận giống hệt. Carburetor được chế tạo hiệu quả trên dây chuyền thay vì làm thủ công tỉ mỉ.

> ![note_p030](images/ch01/note_p030.png)
>
> Charles Babbage, 1791–1871
>
> Học Cambridge University, kết hôn Georgiana Whitmore năm 1814. Phát minh Analytical Engine, máy tính cơ học đầu tiên thế giới. Cũng phát minh cowcatcher và cước bưu chính thống nhất. Thích mở khóa nhưng ghét nhạc công đường phố (ảnh do Fourmilab Switzerland cung cấp, www.fourmilab.ch).

Chúng ta sẽ quay lại hierarchy, modularity và regularity xuyên suốt sách.

## 1.3 DIGITAL ABSTRACTION

Phần lớn đại lượng vật lý liên tục. Ví dụ điện áp trên dây, tần số dao động hay vị trí khối vật đều liên tục. Ngược lại, digital system biểu diễn thông tin bằng variable discrete-valued—có số hữu hạn giá trị phân biệt.

Digital system đời đầu dùng variable mười giá trị rời rạc là Analytical Engine của Charles Babbage. Từ 1834 đến 1871, ông thiết kế và cố xây máy tính cơ học này. Nó dùng bánh răng mười vị trí đánh 0 đến 9, giống đồng hồ quãng đường cơ học ô tô. Hình 1.3 là prototype, mỗi row xử lý một digit. Ông chọn 25 row bánh răng, nên máy có độ chính xác 25-digit.

Khác máy Babbage, phần lớn máy tính điện tử dùng biểu diễn binary (two-valued): điện áp cao chỉ “1”, thấp chỉ “0”, vì phân biệt hai điện áp dễ hơn mười.

![fig1_03](images/ch01/fig1_03.png)

Hình 1.3 Analytical Engine của Babbage, còn xây dở khi ông mất năm 1871 (ảnh do Science Museum/Science and Society Picture Library cung cấp)

Lượng thông tin D trong variable rời rạc có N trạng thái phân biệt được đo bằng bit như sau

> ![note_p031](images/ch01/note_p031.png)
>
> George Boole, 1815–1864
>
> Sinh trong gia đình working-class, không đủ tiền học chính quy, Boole tự học toán rồi gia nhập giảng viên Queen’s College ở Ireland. Ông viết An Investigation of the Laws of Thought (1854), giới thiệu binary variable và ba logic operation cơ bản: AND, OR, NOT (ảnh do American Institute of Physics cung cấp).

D = log<sub>2</sub>N bits (1.1)

Binary variable mang log<sub>2</sub>2 = 1 bit thông tin. Thực vậy bit viết tắt binary digit. Mỗi bánh răng Babbage mang log<sub>2</sub>10 = 3.322 bit vì có một trong 2<sup>3.322</sup> = 10 vị trí. Signal liên tục về lý thuyết chứa lượng thông tin vô hạn vì nhận vô hạn giá trị. Thực tế noise và sai số đo giới hạn phần lớn signal liên tục ở 10 đến 16 bit. Nếu cần đo nhanh, lượng thông tin thấp hơn (ví dụ 8 bit).

Sách tập trung digital circuit dùng binary variable: 1 và 0. George Boole phát triển hệ logic thao tác binary variable, nay gọi Boolean logic. Mỗi variable là TRUE hoặc FALSE. Máy tính điện tử thường dùng điện áp dương biểu diễn “1”, zero volt biểu diễn “0”. Sách dùng “1”, “TRUE”, “HIGH” đồng nghĩa; tương tự “0”, “FALSE”, “LOW” thay nhau.

Điểm đẹp của digital abstraction là digital designer tập trung vào 1, 0, bỏ qua variable Boolean thực hiện bằng điện áp, bánh răng quay hay thậm chí mức chất lỏng thủy lực. Programmer làm việc không cần biết chi tiết hardware. Mặt khác hiểu hardware cho phép tối ưu software tốt hơn cho máy cụ thể.

Một bit không mang nhiều thông tin. Mục tiếp xem nhóm bit biểu diễn số. Các chương sau dùng nhóm bit biểu diễn chữ và chương trình.

## 1.4 HỆ ĐẾM

Bạn quen số decimal. Trong digital system gồm 1, 0, số binary hoặc hexadecimal thường thuận tiện hơn. Mục này giới thiệu các hệ đếm dùng suốt phần còn lại.

### 1.4.1 Số decimal

Ở tiểu học bạn học đếm và tính decimal. Như bạn (có lẽ) có mười ngón tay, có mười decimal digit: 0, 1, 2, …, 9. Ghép digit thành số dài hơn. Mỗi cột có trọng số gấp mười cột trước. Từ phải sang trái là 1, 10, 100, 1000, v.v. Decimal gọi cơ số 10. Cơ số viết bằng subscript sau số tránh nhầm khi dùng nhiều cơ số. Ví dụ Hình 1.4 cho số decimal 9742<sub>10</sub> viết thành tổng từng digit nhân trọng số cột tương ứng.

Số decimal N-digit biểu diễn một trong 10<sup>N</sup> khả năng: 0, 1, 2, 3, …, 10<sup>N</sup>− 1. Đây là range. Ví dụ số decimal three-digit biểu diễn một trong 1000 khả năng từ 0 đến 999.

### 1.4.2 Số binary

Bit biểu diễn 0 hoặc 1, ghép thành số binary. Mỗi cột có trọng số gấp đôi trước, nên binary cơ số 2. Từ phải sang trái, trọng số là 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, v.v. Nếu thường dùng binary, nhớ các lũy thừa hai đến 2<sup>16</sup> sẽ tiết kiệm thời gian.

![fig1_04](images/ch01/fig1_04.png)

Hình 1.4 Biểu diễn số decimal

Số binary N-bit biểu diễn một trong 2<sup>N</sup> khả năng: 0, 1, 2, 3, …, 2<sup>N</sup> − 1. Bảng 1.1 cho số binary 1-, 2-, 3-, 4-bit và decimal tương đương.

#### Ví dụ 1.1 CHUYỂN BINARY SANG DECIMAL

Chuyển số binary 10110<sub>2</sub> sang decimal.

Lời giải Hình 1.5 trình bày chuyển đổi.

Bảng 1.1 Số binary và decimal tương đương

| Số binary 1-Bit | Số binary 2-Bit | Số binary 3-Bit | Số binary 4-Bit | Decimal tương đương |
|---|---|---|---|---|
| 0 | 00 | 000 | 0000 | 0 |
| 1 | 01 | 001 | 0001 | 1 |
|  | 10 | 010 | 0010 | 2 |
|  | 11 | 011 | 0011 | 3 |
|  |  | 100 | 0100 | 4 |
|  |  | 101 | 0101 | 5 |
|  |  | 110 | 0110 | 6 |
|  |  | 111 | 0111 | 7 |
|  |  |  | 1000 | 8 |
|  |  |  | 1001 | 9 |
|  |  |  | 1010 | 10 |
|  |  |  | 1011 | 11 |
|  |  |  | 1100 | 12 |
|  |  |  | 1101 | 13 |
|  |  |  | 1110 | 14 |
|  |  |  | 1111 | 15 |

![fig1_05](images/ch01/fig1_05.png)

Hình 1.5 Chuyển số binary sang decimal

#### Ví dụ 1.2 CHUYỂN DECIMAL SANG BINARY

Chuyển số decimal 84<sub>10</sub> sang binary.

Lời giải Xác định mỗi cột kết quả binary là 1 hay 0. Có thể bắt đầu từ cột trái hoặc phải.

Từ trái, bắt đầu lũy thừa 2 lớn nhất không vượt số (ở đây 64). 84 ≥ 64 nên cột 64 là 1, còn 84 − 64 = 20. 20 \< 32 nên cột 32 là 0. 20 ≥ 16 nên cột 16 là 1, còn 20 − 16 = 4. 4 \< 8 nên cột 8 là 0. 4 ≥ 4 nên cột 4 là 1, còn 4 − 4 = 0. Vì vậy cột 2 và 1 phải là 0. Ghép lại, 84<sub>10</sub> = 1010100<sub>2</sub>.

Từ phải, chia liên tiếp cho 2, số dư đi vào từng cột. 84/2 = 42 nên cột 1 là 0. 42/2 = 21 nên cột 2 là 0. 21/2 = 10 dư 1 ở cột 4. 10/2 = 5 nên cột 8 là 0. 5/2 = 2 dư 1 ở cột 16. 2/2 = 1 nên cột 32 là 0. Cuối cùng 1/2 = 0 dư 1 ở cột 64. Một lần nữa, 84<sub>10</sub> = 1010100<sub>2</sub>.

### 1.4.3 Số hexadecimal

> Hexadecimal do IBM đặt năm 1963, từ hexi tiếng Hy Lạp (sáu) và decem Latin (mười). Từ chuẩn hơn dùng sexa Latin (sáu), nhưng sexadecimal nghe quá gợi tình.

Viết các số binary dài trở nên tẻ nhạt và dễ mắc lỗi. Một nhóm bốn bit biểu diễn một trong 2<sup>4</sup> = 16 khả năng. Vì vậy, đôi khi làm việc với cơ số 16, gọi là hexadecimal, thuận tiện hơn. Số hexadecimal dùng các digit từ 0 đến 9 cùng các chữ A đến F, như Bảng 1.2. Các cột trong cơ số 16 có trọng số 1, 16, 16<sup>2</sup> (hay 256), 16<sup>3</sup> (hay 4096), v.v.

#### Ví dụ 1.3 CHUYỂN HEXADECIMAL SANG BINARY VÀ DECIMAL

Chuyển số hexadecimal 2ED<sub>16</sub> sang binary và decimal.

Lời giải Chuyển giữa hexadecimal và binary dễ vì mỗi hexadecimal digit tương ứng trực tiếp bốn binary digit. 2<sub>16</sub> = 0010<sub>2</sub>, E<sub>16</sub> = 1110<sub>2</sub> và D<sub>16</sub> = 1101<sub>2</sub>, nên 2ED<sub>16</sub> = 001011101101<sub>2</sub>. Chuyển sang decimal cần phép tính Hình 1.6.

Bảng 1.2 Hệ đếm hexadecimal

| Hexadecimal digit | Decimal tương đương | Binary tương đương |
|---|---|---|
| 0 | 0 | 0000 |
| 1 | 1 | 0001 |
| 2 | 2 | 0010 |
| 3 | 3 | 0011 |
| 4 | 4 | 0100 |
| 5 | 5 | 0101 |
| 6 | 6 | 0110 |
| 7 | 7 | 0111 |
| 8 | 8 | 1000 |
| 9 | 9 | 1001 |
| A | 10 | 1010 |
| B | 11 | 1011 |
| C | 12 | 1100 |
| D | 13 | 1101 |
| E | 14 | 1110 |
| F | 15 | 1111 |

![fig1_06](images/ch01/fig1_06.png)

Hình 1.6 Chuyển hexadecimal sang decimal

#### Ví dụ 1.4 CHUYỂN BINARY SANG HEXADECIMAL

Chuyển số binary 1111010<sub>2</sub> sang hexadecimal.

Lời giải Chuyển đổi vẫn dễ. Đọc từ phải. Bốn least significant bit là 1010<sub>2</sub> = A<sub>16</sub>. Các bit tiếp là 111<sub>2</sub> = 7<sub>16</sub>. Vậy 1111010<sub>2</sub> = 7A<sub>16</sub>.

#### Ví dụ 1.5 CHUYỂN DECIMAL SANG HEXADECIMAL VÀ BINARY

Chuyển số decimal 333<sub>10</sub> sang hexadecimal và binary.

Lời giải Như chuyển decimal sang binary, chuyển decimal sang hexadecimal có thể từ trái hoặc phải.

Từ trái, bắt đầu lũy thừa 16 lớn nhất không vượt số (256). 333 chứa một lần 256 nên cột 256 là 1, còn 333 − 256 = 77. 77 chứa bốn lần 16 nên cột 16 là 4, còn 77 − 16 × 4 = 13. 13<sub>10</sub> = D<sub>16</sub> nên cột 1 là D. Tóm lại 333<sub>10</sub> = 14D<sub>16</sub>. Chuyển tiếp sang binary dễ như Ví dụ 1.3: 14D<sub>16</sub> = 101001101<sub>2</sub>.

Từ phải, chia liên tiếp 16; số dư đi vào từng cột. 333/16 = 20 dư 13<sub>10</sub> = D<sub>16</sub> ở cột 1. 20/16 = 1 dư 4 ở cột 16. 1/16 = 0 dư 1 ở cột 256. Kết quả vẫn 14D<sub>16</sub>.

### 1.4.4 Byte, nibble và những thứ liên quan

Nhóm tám bit gọi byte, biểu diễn một trong 2<sup>8</sup> = 256 khả năng. Kích thước object lưu trong computer memory thường đo bằng byte thay vì bit.

Nhóm bốn bit, nửa byte, gọi nibble; biểu diễn một trong 2<sup>4</sup> = 16 khả năng. Một hexadecimal digit lưu một nibble, hai digit lưu trọn byte. Nibble không còn là đơn vị phổ biến nhưng tên khá dễ thương.

> Microprocessor là processor xây trên một chip. Trước thập niên 1970, processor quá phức tạp để vừa một chip, nên mainframe processor làm từ board nhiều chip. Intel giới thiệu microprocessor 4-bit đầu tiên, 4004, năm 1971. Nay cả supercomputer tinh vi nhất cũng xây bằng microprocessor. Sách dùng microprocessor và processor thay nhau.

Microprocessor xử lý data theo nhóm gọi word. Kích thước word tùy architecture. Khi viết chương năm 2021, phần lớn máy có processor 64-bit, thao tác word 64-bit. Máy cũ xử lý word 32-bit cũng phổ biến. Microprocessor đơn giản hơn, nhất là trong đồ gia dụng như máy nướng bánh, dùng word 8- hoặc 16-bit.

Trong nhóm bit, bit cột 1 gọi least significant bit (lsb), đầu kia gọi most significant bit (msb), như Hình 1.7(a) với số binary 6-bit. Tương tự trong word, byte gọi từ least significant byte (LSB) đến most significant byte (MSB), như Hình 1.7(b) với số 4-byte viết bằng tám hexadecimal digit.

Trùng hợp tiện lợi: 2<sup>10</sup> = 1024 ≈ 10<sup>3</sup>. Vì vậy kilo (tiếng Hy Lạp là nghìn) chỉ 2<sup>10</sup>. Ví dụ 2<sup>10</sup> byte là một kilobyte (1 KB). Tương tự mega (triệu) chỉ 2<sup>20</sup> ≈ 10<sup>6</sup>, giga (tỷ) chỉ 2<sup>30</sup> ≈ 10<sup>9</sup>. Biết 2<sup>10</sup> ≈ 1 nghìn, 2<sup>20</sup> ≈ 1 triệu, 2<sup>30</sup> ≈ 1 tỷ và nhớ lũy thừa hai đến 2<sup>9</sup>, bạn dễ nhẩm mọi lũy thừa hai.

![fig1_07](images/ch01/fig1_07.png)

Hình 1.7 Bit và byte có trọng số thấp nhất, cao nhất

> Để phân biệt lũy thừa mười và hai, có naming convention riêng cho lũy thừa hai: 2<sup>10</sup> gọi kibi (Ki), 2<sup>20</sup> mebi (Mi), 2<sup>30</sup> gibi (Gi), 2<sup>40</sup> tebi (Ti), 2<sup>50</sup> pebi (Pi), 2<sup>60</sup> exbi (Ei), v.v. Ví dụ 2<sup>30</sup> byte là gibibyte (GiB).

#### Ví dụ 1.6 ƯỚC LƯỢNG LŨY THỪA HAI

Tìm giá trị gần đúng 2<sup>24</sup> không dùng máy tính.

Lời giải Tách số mũ thành bội mười và phần dư.

2<sup>24</sup> = 2<sup>20</sup> × 2<sup>4</sup>. 2<sup>20</sup> ≈ 1 triệu. 2<sup>4</sup> = 16. Vậy 2<sup>24</sup> ≈ 16 triệu. Chính xác là 2<sup>24</sup> = 16,777,216, nhưng 16 triệu đủ gần cho marketing.

> Memory On-chip và RAM đo theo lũy thừa hai, ổ cứng theo lũy thừa mười. Ví dụ RAM 32 GB (GiB) thực là 34,359,738,368 byte, còn 32 GB ổ cứng là 32,000,000 byte.

1024 byte gọi kilobyte (KB) hoặc kibibyte (KiB). 1024 bit gọi kilobit (Kb hay Kbit) hoặc kibibit (Kib hay Kibit). Tương tự MB / MiB, Mb/Mib, GB/GiB và Gb/Gib dùng cho hàng triệu, tỷ byte và bit. Memory capacity thường đo bằng byte. Tốc độ giao tiếp thường đo theo lũy thừa mười bit/giây. Ví dụ modem dial-up tối đa thường 56 kbit/giây, tức 56,000 bit/giây.

### 1.4.5 Phép cộng binary

Phép cộng binary rất giống phép cộng decimal nhưng dễ hơn, như Hình 1.8. Cũng như decimal, nếu tổng hai số lớn hơn khả năng chứa của một digit, ta nhớ 1 sang cột tiếp theo. Hình 1.8 so sánh phép cộng decimal và binary. Ở cột ngoài cùng bên phải Hình 1.8(a), 7 + 9 = 16 không vừa một digit vì lớn hơn 9. Vì vậy ghi digit cột 1 là 6, rồi nhớ digit cột 10 là 1 sang cột tiếp. Tương tự, trong binary, nếu tổng hai số lớn hơn 1 thì nhớ digit cột 2 sang cột tiếp. Ví dụ cột ngoài cùng bên phải Hình 1.8(b), tổng 1 + 1 = 2<sub>10</sub> = 10<sub>2</sub> không vừa một binary digit. Vì vậy ghi digit cột 1 (0), nhớ digit cột 2 (1) của kết quả sang cột kế. Ở cột thứ hai, tổng 1 + 1 + 1 = 3<sub>10</sub> = 11<sub>2</sub>. Một lần nữa, ghi digit cột 1 (1), nhớ digit cột 2 (1) sang cột tiếp. Vì lý do hiển nhiên, bit được nhớ sang cột bên cạnh gọi là carry bit.

![fig1_08](images/ch01/fig1_08.png)

Hình 1.8 Ví dụ cộng có carry: (a) decimal (b) binary

#### Ví dụ 1.7 PHÉP CỘNG BINARY

![fig1_09](images/ch01/fig1_09.png)

Hình 1.9 Ví dụ cộng binary

Tính 0111<sub>2</sub> + 0101<sub>2</sub>.

Lời giải Hình 1.9 cho tổng 1100<sub>2</sub>, carry màu xanh. Có thể kiểm tra bằng decimal: 0111<sub>2</sub> = 7<sub>10</sub>, 0101<sub>2</sub> = 5<sub>10</sub>. Tổng 12<sub>10</sub> = 1100<sub>2</sub>.

Digital system thường thao tác số digit cố định. Phép cộng overflow nếu kết quả quá lớn để vừa. Ví dụ số 4-bit có range \[0, 15\]. Cộng binary 4-bit overflow nếu vượt 15. Bit thứ năm bị bỏ, tạo kết quả sai trong bốn bit còn lại. Phát hiện overflow bằng kiểm carry ra khỏi cột most significant.

#### Ví dụ 1.8 PHÉP CỘNG CÓ OVERFLOW

Tính 1101<sub>2</sub> + 0101<sub>2</sub>. Có overflow không?

![fig1_10](images/ch01/fig1_10.png)

Hình 1.10 Ví dụ cộng binary có overflow

Lời giải Hình 1.10 cho tổng 10010<sub>2</sub>, vượt range số binary 4-bit. Nếu phải lưu bốn bit, bỏ most significant bit, còn kết quả sai 0010<sub>2</sub>. Nếu tính bằng số từ năm bit, kết quả 10010<sub>2</sub> đã đúng.

### 1.4.6 Số binary có dấu

Đến đây chỉ xét unsigned binary biểu diễn lượng dương. Thường muốn biểu diễn cả dương và âm, cần hệ binary khác. Có nhiều cách biểu diễn signed binary. Hai cách dùng rộng nhất là sign/magnitude và two’s complement.

Số Sign/Magnitude

Sign/magnitude trực quan vì giống cách viết số âm bằng dấu trừ rồi độ lớn. Số sign/magnitude N-bit dùng most significant bit làm dấu, N − 1 bit còn lại làm độ lớn (giá trị tuyệt đối). Sign bit 0 chỉ dương, 1 chỉ âm.

> Tên lửa Ariane 5 trị giá 7 tỷ USD phóng ngày 4 tháng 6 năm 1996 lệch hướng sau 40 giây, vỡ và nổ. Nguyên nhân là máy tính điều khiển overflow range 16-bit rồi crash.
>
> Code đã được kiểm thử kỹ trên Ariane 4. Nhưng Ariane 5 có động cơ nhanh hơn, tạo giá trị lớn hơn cho máy tính điều khiển, gây overflow.
>
> ![note_p039](images/ch01/note_p039.png)
>
> Ảnh do ESA/CNES/ARIANESPACE-Service Optique CS6 cung cấp.

#### Ví dụ 1.9 SỐ SIGN/MAGNITUDE

Viết 5 và −5 dưới dạng số sign/magnitude 4-bit.

Lời giải Cả hai có độ lớn 5<sub>10</sub> = 101<sub>2</sub>. Vì vậy 5<sub>10</sub> = 0101<sub>2</sub>, −5<sub>10</sub> = 1101<sub>2</sub>.

Đáng tiếc cộng binary thường không đúng cho sign/magnitude. Ví dụ cộng thường −5<sub>10</sub> + 5<sub>10</sub> cho 1101<sub>2</sub> + 0101<sub>2</sub> = 10010<sub>2</sub>, vô nghĩa.

Số sign/magnitude N-bit bao range \[−2<sup>N−1</sup> + 1, 2<sup>N−1</sup> − 1\]. Nó hơi lạ vì có cả +0 và −0, đều chỉ zero. Như dự đoán, hai biểu diễn cho cùng số có thể phiền phức.

Số Two’s Complement

Two’s complement giống unsigned binary, trừ trọng số most significant bit là −2<sup>N−1</sup> thay 2<sup>N−1</sup>. Nó khắc phục sign/magnitude: zero chỉ một biểu diễn, cộng thường hoạt động.

Trong two’s complement, zero viết toàn zero: 00…000<sub>2</sub>. Số dương lớn nhất có 0 ở most significant và 1 nơi khác: 01…111<sub>2</sub> = 2<sup>N−1</sup> − 1. Số âm nhỏ nhất có 1 ở most significant, 0 nơi khác: 10…000<sub>2</sub> = −2<sup>N−1</sup>. −1 viết toàn một: 11…111<sub>2</sub>.

Chú ý số dương có 0 ở most significant, số âm có 1, nên bit đó có thể xem là sign bit. Nhưng toàn số được diễn giải khác nhau giữa two’s complement và sign/magnitude.

> Kết quả đảo bit trong số gọi one’s complement. Ví dụ one’s complement của 0110111 là 1001000. Gọi vậy vì cộng hai số cho toàn 1: 0110111 + 1001000 = 1111111.

Đổi dấu số two’s complement (ví dụ +5 sang −5, −17 sang +17) bằng đảo mọi bit rồi cộng 1 vào least significant bit. Đây là phương pháp đổi dấu, hữu ích tìm biểu diễn số âm hoặc độ lớn số âm.

#### Ví dụ 1.10 BIỂU DIỄN TWO’S COMPLEMENT

CỦA SỐ ÂM

Tìm biểu diễn −2<sub>10</sub> dưới dạng two’s complement 4-bit.

Lời giải Bắt đầu biểu diễn độ lớn: +2<sub>10</sub> = 0010<sub>2</sub>. Để có −2<sub>10</sub>, đổi dấu bằng đảo bit rồi cộng 1. Đảo 0010<sub>2</sub> cho 1101<sub>2</sub>. 1101<sub>2</sub> + 1 = 1110<sub>2</sub>. Vậy −2<sub>10</sub> là 1110<sub>2</sub>.

> Trước đây đổi dấu được gọi “lấy two’s complement”. Nhưng chúng tôi thấy thuật ngữ đôi lúc khiến người đọc tưởng luôn phải “lấy two’s complement” khi dùng số two’s complement; không đúng! Đổi dấu chỉ đôi khi được dùng khi làm việc với số âm two’s complement.

#### Ví dụ 1.11 GIÁ TRỊ SỐ ÂM TWO’S COMPLEMENT

Tìm giá trị decimal của số two’s complement 4-bit 0x9 (tức 1001<sub>2</sub>).

Lời giải 1001<sub>2</sub> bắt đầu bằng 1 nên phải âm. Tìm độ lớn bằng đổi dấu: đảo bit rồi cộng 1. Đảo 1001<sub>2</sub> = 0110<sub>2</sub>. 0110<sub>2</sub> + 1 = 0111<sub>2</sub> = 7<sub>10</sub>. Vậy 1001<sub>2</sub> = −7<sub>10</sub>.

Two’s complement có ưu điểm nổi bật: cộng đúng cho cả số dương và âm. Nhớ rằng cộng số N-bit thì carry ra khỏi bit N (tức bit kết quả N + 1<sup>th</sup>) bị bỏ.

#### Ví dụ 1.12 CỘNG SỐ TWO’S COMPLEMENT

Tính (a) −2<sub>10</sub> + 1<sub>10</sub> và (b) −7<sub>10</sub> + 7<sub>10</sub> bằng two’s complement.

Lời giải (a) −2<sub>10</sub> + 1<sub>10</sub> = 1110<sub>2</sub> + 0001<sub>2</sub> = 1111<sub>2</sub> = −1<sub>10</sub>. (b) −7<sub>10</sub> + 7<sub>10</sub> = 1001<sub>2</sub> + 0111<sub>2</sub> = 10000<sub>2</sub>. Bỏ bit thứ năm, còn kết quả 4-bit đúng 0000<sub>2</sub>.

Phép trừ được thực hiện bằng lấy two’s complement của số thứ hai rồi cộng.

> Tên two’s complement xuất phát từ việc complement (số âm) được tìm bằng lấy 2<sup>N</sup> trừ số đó (gọi theo cơ số: two’s). Ví dụ để tạo complement 4-bit của 7 (tức −7), tính: 2<sup>4</sup> − 7 = 10000 − 0111 = (1111 + 1) − 0111 = (1111 − 0111) + 1 = 1000 + 1 = 1001. Đây là biểu diễn two’s complement 4-bit
>
> của −7. Chú ý bước cuối giống đổi dấu: đảo bit 0111 (thành 1000) rồi cộng 1.

#### Ví dụ 1.13 TRỪ SỐ TWO’S COMPLEMENT

Tính (a) 5<sub>10</sub> − 3<sub>10</sub> và (b) 3<sub>10</sub> − 5<sub>10</sub> bằng two’s complement 4-bit.

Lời giải (a) 3<sub>10</sub> = 0011<sub>2</sub>. Lấy two’s complement được −3<sub>10</sub> = 1101<sub>2</sub>. Cộng 5<sub>10</sub> + (−3<sub>10</sub>) = 0101<sub>2</sub> + 1101<sub>2</sub> = 0010<sub>2</sub> = 2<sub>10</sub>. Bỏ carry khỏi vị trí most significant vì lưu bốn bit. (b) Lấy two’s complement của 5<sub>10</sub> được −5<sub>10</sub> = 1011. Cộng 3<sub>10</sub> + (−5<sub>10</sub>) = 0011<sub>2</sub> + 1011<sub>2</sub> = 1110<sub>2</sub> = −2<sub>10</sub>.

Two’s complement của 0 tìm bằng đảo mọi bit (thành 11…111<sub>2</sub>) rồi cộng 1, được toàn 0, bỏ carry khỏi most significant bit. Vì vậy zero luôn biểu diễn toàn 0. Khác sign/magnitude, không có −0 riêng. Zero được coi dương vì sign bit bằng 0.

Như unsigned, số two’s complement N-bit biểu diễn một trong 2<sup>N</sup> giá trị, nhưng chia giữa dương và âm. Ví dụ unsigned 4-bit biểu diễn 16 giá trị 0 đến 15; two’s complement 4-bit cũng 16 giá trị, −8 đến 7. Tổng quát range N-bit là \[−2<sup>N−1</sup>, 2<sup>N−1</sup> − 1\]. Có thêm một số âm là hợp lý vì không có −0. Số âm nhỏ nhất 10…000<sub>2</sub> = −2<sup>N−1</sup> đôi khi gọi số kỳ lạ. Đảo bit thành 01…111<sub>2</sub> rồi cộng 1 lại cho 10…000<sub>2</sub>. Vậy số âm này không có số dương tương ứng.

Cộng hai số dương hoặc hai số âm N-bit có thể overflow nếu kết quả lớn hơn 2<sup>N−1</sup> − 1 hoặc nhỏ hơn −2<sup>N−1</sup>. Cộng một dương với một âm không bao giờ overflow. Khác unsigned, carry khỏi cột most significant không báo overflow. Thay vào đó overflow khi hai số có cùng sign bit nhưng kết quả có sign bit ngược lại.

#### Ví dụ 1.14 CỘNG SỐ TWO’S COMPLEMENT

CÓ OVERFLOW

Tính 4<sub>10</sub> + 5<sub>10</sub> bằng two’s complement 4-bit. Kết quả có overflow không?

Lời giải 4<sub>10</sub> + 5<sub>10</sub> = 0100<sub>2</sub> + 0101<sub>2</sub> = 1001<sub>2</sub> = −7<sub>10</sub>. Kết quả overflow range số dương two’s complement 4-bit, tạo số âm sai. Nếu dùng từ năm bit, 01001<sub>2</sub> = 9<sub>10</sub> là đúng.

Khi mở rộng two’s complement thêm bit, phải copy sign bit vào các vị trí most significant. Đây là sign extension. Ví dụ 3, −3 là two’s complement 4-bit 0011, 1101. Chúng được sign-extended thành bảy bit bằng copy sign bit vào ba bit mới phía trên: 0000011, 1111101, là biểu diễn 7-bit của 3, –3.

So sánh hệ đếm

Ba hệ binary dùng phổ biến nhất là unsigned, two’s complement, sign/magnitude. Bảng 1.3 so range N-bit. Two’s complement tiện vì biểu diễn cả integer dương và âm, cộng thường đúng cho mọi số. Trừ bằng đổi dấu số thứ hai rồi cộng. Trừ khi nói khác, giả định mọi signed binary dùng two’s complement.

Bảng 1.3 Range số N-bit

| Hệ | Range |
|---|---|
| Unsigned | \[0, 2<sup>N</sup> – 1\] |
| Two’s Complement | \[–2<sup>N–1</sup>, 2<sup>N–1</sup> – 1\] |
| Sign/Magnitude | \[–2<sup>N–1</sup> + 1, 2<sup>N–1</sup> – 1\] |

![fig1_11](images/ch01/fig1_11.png)

Hình 1.11 Trục số và encoding binary 4-bit

Hình 1.11 là trục giá trị 4-bit mỗi hệ. Unsigned trải \[0, 15\] theo thứ tự binary thường. Two’s complement trải \[−8, 7\]. Số không âm \[0, 7\] có cùng encoding unsigned. Số âm \[−8, −1\] được encode sao cho unsigned binary value lớn hơn biểu diễn số gần 0 hơn. Số kỳ lạ 1000 biểu diễn −8, không có dương tương ứng. Sign/magnitude trải \[−7, 7\]. Most significant bit làm dấu. Số dương \[1, 7\] cùng encoding unsigned. Số âm đối xứng nhưng sign bit được đặt. 0 biểu diễn cả 0000 và 1000. Vì hai biểu diễn 0, sign/magnitude N-bit chỉ biểu diễn 2<sup>N</sup> − 1 integer. Unsigned binary hoặc two's complement N-bit biểu diễn 2<sup>N</sup> integer.

## 1.5 LOGIC GATE

Đã biết binary variable biểu diễn thông tin, nay tìm hiểu digital system thao tác chúng. Logic gate là digital circuit đơn giản nhận một hoặc nhiều binary input và tạo binary output. Symbol thể hiện input và output. Input thường bên trái (hoặc trên), output bên phải (hoặc dưới). Digital designer thường dùng chữ đầu bảng chữ cái cho input, Y cho output. Quan hệ input/output mô tả bằng truth table hoặc Boolean equation. Truth table liệt kê input trái, output tương ứng phải; mỗi row cho một tổ hợp input. Boolean equation là biểu thức toán dùng binary variable.

![fig1_12](images/ch01/fig1_12.png)

Hình 1.12 NOT gate

### 1.5.1 NOT gate

NOT gate có input A, output Y như Hình 1.12. Output ngược input. Nếu A FALSE, Y TRUE; A TRUE, Y FALSE. Truth table và Boolean equation trong hình tóm tắt quan hệ. Gạch trên A đọc NOT, nên Y = $\overline{A}$ đọc “Y bằng NOT A”. NOT gate còn gọi inverter.

Sách khác dùng các notation NOT như Y = A′, Y = ¬A, Y = !A hoặc Y = \~A. Chúng ta chỉ dùng Y = $\overline{A}$, nhưng đừng bối rối nếu gặp notation khác.

![fig1_13](images/ch01/fig1_13.png)

Hình 1.13 Buffer

### 1.5.2 Buffer

Logic gate one-input khác gọi buffer, như Hình 1.13. Nó chỉ copy input sang output.

Xét logic, buffer không khác dây, có vẻ vô dụng. Nhưng xét analog, có thể có đặc tính mong muốn như cấp dòng lớn cho động cơ hoặc nhanh chóng đưa output tới nhiều gate. Đây là ví dụ cần xét nhiều mức abstraction để hiểu đầy đủ; digital abstraction giấu mục đích thật của buffer.

![fig1_14](images/ch01/fig1_14.png)

Hình 1.14 AND gate

Symbol tam giác chỉ buffer. Vòng tròn ở output gọi bubble, chỉ inversion như symbol NOT Hình 1.12.

### 1.5.3 AND gate

Logic gate Two-input thú vị hơn. AND gate Hình 1.14 tạo output Y TRUE khi và chỉ khi cả A, B TRUE; nếu không FALSE. Theo quy ước, input liệt kê 00, 01, 10, 11 như đếm binary. Boolean equation viết Y = A • B, Y = AB hoặc Y = A ∩ B. Symbol ∩ đọc “giao”, được nhà logic học ưa dùng. Chúng tôi thích Y = AB, đọc “Y bằng A AND B”, vì lười.

> Theo Larry Wall, người phát minh Perl, “ba đức tính chính của programmer là Lười biếng, Nóng ruột và Kiêu ngạo.”

### 1.5.4 OR gate

![fig1_15](images/ch01/fig1_15.png)

Hình 1.15 OR gate

OR gate Hình 1.15 cho output Y TRUE nếu A hoặc B (hoặc cả hai) TRUE. Boolean equation là Y = A + B hoặc Y = A ∪ B. Symbol ∪ đọc hợp, nhà logic học ưa dùng. Digital designer thường dùng +; Y = A + B đọc “Y bằng A OR B”.

### 1.5.5 Các gate Two-Input khác

Hình 1.16 cho logic gate two-input phổ biến khác. XOR (exclusive OR, đọc “ex-OR”) TRUE nếu A hoặc B TRUE nhưng không cả hai. Operation XOR ký hiệu ⊕, dấu cộng có vòng tròn. Gate nào cũng có thể thêm bubble để đảo. NAND làm NOT AND: TRUE trừ khi cả hai input TRUE. NOR làm NOT OR: TRUE nếu cả A, B không TRUE. XOR N-input đôi khi gọi parity gate, cho TRUE nếu số input TRUE là lẻ. Như gate two-input, các tổ hợp truth table được liệt kê theo thứ tự đếm.

> Cách ngớ ngẩn để nhớ symbol OR: bên input cong như miệng Pacman, nên gate đói và sẵn sàng ăn bất kỳ input TRUE nào tìm được!

![img_p044](images/ch01/img_p044.png)

![fig1_16](images/ch01/fig1_16.png)

Hình 1.16 Các logic gate two-input khác

#### Ví dụ 1.15 XNOR GATE

Hình 1.17 cho symbol và Boolean equation của XNOR two-input (đọc ex-NOR), đảo XOR. Hoàn thành truth table.

![fig1_17](images/ch01/fig1_17.png)

Hình 1.17 XNOR gate

Lời giải Hình 1.18 cho truth table. XNOR TRUE nếu cả input FALSE hoặc cả TRUE. XNOR two-input đôi khi gọi equality gate vì output TRUE khi input bằng nhau.

### 1.5.6 Gate Multiple-Input

Có nhiều Boolean function từ ba input. Phổ biến nhất AND, OR, XOR, NAND, NOR, XNOR. AND N-input cho TRUE khi toàn N input TRUE. OR N-input cho TRUE khi ít nhất một input TRUE.

![fig1_18](images/ch01/fig1_18.png)

Hình 1.18 Truth table XNOR

#### Ví dụ 1.16 NOR GATE THREE-INPUT

Hình 1.19 cho symbol và Boolean equation NOR three-input. Hoàn thành truth table.

![fig1_19](images/ch01/fig1_19.png)

Hình 1.19 NOR gate Three-input

Lời giải Hình 1.20 cho truth table. Output chỉ TRUE nếu không input nào TRUE.

#### Ví dụ 1.17 AND GATE FOUR-INPUT

Hình 1.21 cho symbol và Boolean equation AND four-input. Tạo truth table.

Lời giải Hình 1.22 cho truth table. Output chỉ TRUE nếu mọi input TRUE.

## 1.6 BÊN DƯỚI DIGITAL ABSTRACTION

Digital system dùng variable discrete-valued. Nhưng variable được biểu diễn bằng đại lượng vật lý liên tục như điện áp dây, vị trí bánh răng, mức chất lỏng trong cylinder. Vì vậy designer phải chọn cách liên hệ giá trị liên tục với rời rạc.

![fig1_20](images/ch01/fig1_20.png)

Hình 1.20 Truth table NOR Three-input

Ví dụ biểu diễn binary signal A bằng điện áp dây. Cho 0 volt (V) chỉ A = 0, 5 V chỉ A = 1. Hệ thực phải chịu một ít noise nên 4.97 V có lẽ cũng nên là A = 1. Nhưng 4.3 V? 2.8 V? 2.500000 V?

### 1.6.1 Supply voltage

Giả sử điện áp thấp nhất là 0 V, gọi ground hoặc GND. Cao nhất từ power supply thường gọi V<sub>DD.</sub> Công nghệ thập niên 1970, 1980 thường V<sub>DD</sub> = 5 V. Khi transistor nhỏ hơn, V<sub>DD</sub> giảm còn 3.3 V, 2.5 V, 1.8 V, 1.5 V, 1.2 V hoặc thấp hơn để tiết kiệm công suất và tránh quá tải transistor.

![fig1_21](images/ch01/fig1_21.png)

Hình 1.21 AND gate Four-input

### 1.6.2 Logic level

Ánh xạ continuous variable sang discrete binary variable bằng định nghĩa logic level như Hình 1.23. Gate đầu gọi driver, gate hai receiver. Output driver nối input receiver. Driver tạo output LOW (0) trong 0 đến V<sub>OL</sub>, hoặc HIGH (1) trong V<sub>OH</sub> đến V<sub>DD</sub>. Receiver nhận input 0 đến V<sub>IL</sub> coi LOW; nhận V<sub>IH</sub> đến V<sub>DD</sub> coi HIGH. Nếu vì noise hoặc component hỏng mà input vào forbidden zone giữa V<sub>IL</sub>, V<sub>IH</sub>, hành vi gate khó dự đoán. V<sub>OH</sub>, V<sub>OL</sub>, V<sub>IH</sub>, V<sub>IL</sub> gọi logic level high/low của output/input.

![fig1_22](images/ch01/fig1_22.png)

Hình 1.22 Truth table AND Four-input

### 1.6.3 Noise margin

Để receiver diễn giải đúng output driver, phải chọn V<sub>OL</sub> \< V<sub>IL</sub> và V<sub>OH</sub> \> V<sub>IH</sub>. Dù output nhiễm noise, input vẫn nhận đúng logic level. Noise margin (NM) là lượng noise có thể thêm vào output worst-case mà signal vẫn được coi input hợp lệ. Như Hình 1.23, noise margin low và high lần lượt là

NM<sub>L</sub> = V<sub>IL</sub> − V<sub>OL</sub> (1.2)

NM<sub>H</sub> = V<sub>OH</sub> − V<sub>IH</sub> (1.3)

![fig1_23](images/ch01/fig1_23.png)

Hình 1.23 Logic level và noise margin

> V<sub>DD</sub> là điện áp tại drain của transistor metal-oxide-semiconductor, dùng xây phần lớn chip hiện đại. Supply voltage đôi khi gọi V<sub>CC</sub>, điện áp collector của bipolar junction transistor dùng trong công nghệ chip cũ. Ground đôi khi gọi V<sub>SS</sub> vì là điện áp source transistor metal-oxide-semiconductor. Xem Mục 1.7 để biết thêm.

#### Ví dụ 1.18 TÍNH NOISE MARGIN

Xét inverter circuit Hình 1.24. V<sub>O1</sub> là output voltage inverter I1, V<sub>I2</sub> là input voltage inverter I2. Cả hai có: V<sub>DD</sub> = 5 V, V<sub>IL</sub> = 1.35 V, V<sub>IH</sub> = 3.15 V, V<sub>OL</sub> = 0.33 V, V<sub>OH</sub> = 3.84 V. Noise margin low/high là bao nhiêu? Circuit chịu được noise 1 V giữa V<sub>O1</sub> và V<sub>I2</sub> không?

![fig1_24](images/ch01/fig1_24.png)

Hình 1.24 Inverter circuit

Lời giải Noise margin inverter: NM<sub>L</sub> = V<sub>IL</sub> – V<sub>OL</sub> = (1.35 V − 0.33 V) = 1.02 V, NM<sub>H</sub> = V<sub>OH</sub> − V<sub>IH</sub> = (3.84 V − 3.15 V) = 0.69 V. Chịu noise 1 V khi output LOW (NM<sub>L</sub> = 1.02 V), không khi HIGH (NM<sub>H</sub> = 0.69 V). Ví dụ driver I1 xuất HIGH worst-case V<sub>O1</sub> = V<sub>OH</sub> = 3.84 V. Nếu noise làm giảm 1 V trước receiver thì V<sub>I2</sub> = (3.84 V − 1 V) = 2.84 V, thấp hơn input HIGH chấp nhận V<sub>IH</sub> = 3.15 V, nên receiver có thể không nhận đúng HIGH.

### 1.6.4 DC transfer characteristic

> DC chỉ hành vi khi input voltage giữ nguyên hoặc đổi đủ chậm để phần còn lại theo kịp. Tên bắt nguồn direct current, cách truyền điện trên đường dây điện áp không đổi. Ngược lại transient response là hành vi khi input đổi nhanh. Mục 2.9 tìm hiểu thêm transient response.

Để hiểu giới hạn digital abstraction phải đi sâu hành vi analog của gate. DC transfer characteristic mô tả output voltage theo input voltage khi input thay đổi đủ chậm để output theo kịp. Tên transfer characteristic vì mô tả quan hệ input/output voltage.

Inverter lý tưởng chuyển đột ngột tại V<sub>DD</sub>/2 như Hình 1.25(a). Với V(A) \< V<sub>DD</sub>/2, V(Y) = V<sub>DD</sub>. Với V(A) \> V<sub>DD</sub>/2, V(Y) = 0. Khi đó V<sub>IH</sub> = V<sub>IL</sub> = V<sub>DD</sub>/2. V<sub>OH</sub> = V<sub>DD</sub>, V<sub>OL</sub> = 0.

Inverter thực chuyển dần hơn giữa hai cực như Hình 1.25(b). Khi V(A) = 0, V(Y) = V<sub>DD</sub>. Khi V(A) = V<sub>DD</sub>, V(Y) = 0. Nhưng chuyển tiếp trơn và có thể không tập trung đúng V<sub>DD</sub>/2. Vậy định nghĩa logic level thế nào?

Vị trí hợp lý là nơi độ dốc dV(Y)/dV(A) bằng −1. Hai điểm gọi unity gain point. Chọn logic level ở đó thường tối đa noise margin. Nếu giảm V<sub>IL</sub>, V<sub>OH</sub> chỉ tăng ít. Nhưng tăng V<sub>IL</sub>, V<sub>OH</sub> giảm mạnh.

### 1.6.5 Static discipline

Để tránh input vào forbidden zone, digital logic gate được thiết kế tuân static discipline: với input hợp lệ logic, mọi circuit element tạo output hợp lệ logic.

Tuân static discipline, digital designer hy sinh tự do dùng analog circuit element tùy ý để đổi sự đơn giản, vững chắc của digital circuit. Nâng abstraction analog sang digital tăng năng suất bằng giấu chi tiết không cần.

![fig1_25](images/ch01/fig1_25.png)

Hình 1.25 DC transfer characteristic và logic level

Lựa chọn V<sub>DD</sub> và logic level tùy ý, nhưng gate giao tiếp phải tương thích. Vì vậy chia thành logic family, mọi gate trong family tuân static discipline khi dùng với gate cùng family. Chúng ráp như Lego nhờ supply voltage và logic level nhất quán.

Bốn logic family chính thập niên 1970–1990 là Transistor-Transistor Logic (TTL), Complementary Metal-Oxide-Semiconductor Logic (CMOS, đọc sea-moss), Low Voltage TTL Logic (LVTTL), Low Voltage CMOS Logic (LVCMOS). Bảng 1.4 so logic level. Từ đó family phân mảnh theo nhiều supply voltage thấp hơn. Phụ lục A.6 xem kỹ family phổ biến.

Bảng 1.4 Logic level của family 5 V và 3.3 V

| Logic family | V<sub>DD</sub> | V<sub>IL</sub> | V<sub>IH</sub> | V<sub>OL</sub> | V<sub>OH</sub> |
|---|---|---|---|---|---|
| TTL | 5 (4.75−5.25) | 0.8 | 2.0 | 0.4 | 2.4 |
| CMOS | 5 (4.5−6) | 1.35 | 3.15 | 0.33 | 3.84 |
| LVTTL | 3.3 (3−3.6) | 0.8 | 2.0 | 0.4 | 2.4 |
| LVCMOS | 3.3 (3−3.6) | 0.9 | 1.8 | 0.36 | 2.7 |

Bảng 1.5 Compatibility của logic family

|  |  | Receiver |  |  |
|---|---|---|---|---|
| Driver | TTL | CMOS | LVTTL | LVCMOS |
| TTL | OK | KHÔNG: V<sub>OH</sub> \< V<sub>IH</sub> | CÓ THỂ<sup>a</sup> | CÓ THỂ<sup>a</sup> |
| CMOS | OK | OK | CÓ THỂ<sup>a</sup> | CÓ THỂ<sup>a</sup> |
| LVTTL | OK | KHÔNG: V<sub>OH</sub> \< V<sub>IH</sub> | OK | OK |
| LVCMOS | OK | KHÔNG: V<sub>OH</sub> \< V<sub>IH</sub> | OK | OK |

<sup>a</sup>Miễn là mức HIGH 5 V không làm hỏng receiver input

#### Ví dụ 1.19 COMPATIBILITY CỦA LOGIC FAMILY

Logic family nào trong Bảng 1.4 giao tiếp đáng tin cậy với nhau?

> ![note_p049](images/ch01/note_p049.png)
>
> Robert Noyce, 1927–1990
>
> Sinh ở Burlington, Iowa. Nhận bằng B.A. vật lý Grinnell College và Ph.D. vật lý MIT. Biệt danh “Thị trưởng Silicon Valley” vì ảnh hưởng sâu rộng đến ngành.
>
> Đồng sáng lập Fairchild Semiconductor năm 1957, Intel năm 1968. Đồng phát minh integrated circuit. Nhiều engineer trong nhóm ông về sau lập công ty semiconductor quan trọng khác (ảnh © 2006, Intel Corporation. Được phép tái bản).

Lời giải Bảng 1.5 liệt kê những logic family có logic level tương thích. Lưu ý logic family 5 V như TTL hoặc CMOS có thể tạo output voltage HIGH tới 5 V. Nếu signal 5 V này lái input của logic family 3.3 V như LVTTL hoặc LVCMOS, nó có thể làm hỏng receiver, trừ khi receiver được thiết kế đặc biệt để “tương thích 5-volt”.

## 1.7 CMOS TRANSISTOR\*

Mục này và các mục khác đánh dấu \* là tùy chọn, không cần thiết để hiểu mạch trình bày chính của sách.

Analytical Engine làm từ bánh răng; máy tính điện đời đầu dùng relay hoặc vacuum tube. Máy hiện đại dùng transistor vì rẻ, nhỏ, đáng tin. Transistor là switch điều khiển điện, ON/OFF khi đặt điện áp hoặc dòng vào control terminal. Hai loại chính là bipolar junction transistor và metal-oxide-semiconductor field effect transistor (MOSFET hay MOS transistor, lần lượt đọc “mossfets”, “M-O-S”).

Năm 1958 Jack Kilby ở Texas Instruments xây integrated circuit đầu tiên chứa hai transistor. Năm 1959 Robert Noyce ở Fairchild Semiconductor đăng ký phương pháp nối nhiều transistor trên một silicon chip. Khi đó mỗi transistor khoảng 10 USD.

Nhờ hơn ba thập kỷ tiến bộ chế tạo chưa từng có, engineer nay đặt khoảng một tỷ MOSFET trên silicon chip 1-cm<sup>2</sup>, mỗi transistor dưới 10 microcent. Mật độ và chi phí tiếp tục cải thiện một bậc mười khoảng mỗi 8 năm. MOSFET nay cấu thành gần mọi digital system. Phần này nhìn dưới digital abstraction xem logic gate xây từ MOSFET thế nào.

### 1.7.1 Semiconductor

MOS transistor làm từ silicon, nguyên tử chủ yếu trong đá và cát. Silicon (Si) nhóm IV có bốn valence electron, liên kết bốn nguyên tử kề tạo crystal lattice. Hình 1.26(a) vẽ hai chiều cho dễ, nhưng lattice thực là tinh thể lập phương. Đường biểu thị covalent bond. Silicon tinh khiết dẫn kém vì mọi electron gắn trong bond. Nó dẫn tốt hơn khi thêm cẩn thận lượng nhỏ tạp chất gọi dopant atom. Dopant nhóm V như arsenic (As) có electron thừa không liên kết; electron dễ di chuyển, để lại dopant ion hóa As<sup>+</sup> như Hình 1.26(b). Electron mang điện âm nên arsenic gọi dopant n-type. Ngược lại dopant nhóm III như boron (B) thiếu electron, Hình 1.26(c). Electron thiếu gọi hole. Electron silicon lân cận có thể lấp bond thiếu, tạo dopant ion B<sup>−</sup>, để hole ở silicon lân cận. Hole tương tự di chuyển trong lattice. Vì thiếu điện âm nên hành xử như hạt điện dương, do đó boron gọi dopant p-type. Conductivity silicon thay đổi nhiều bậc mười theo nồng độ dopant, nên gọi semiconductor.

### 1.7.2 Diode

Junction giữa silicon p-type và n-type gọi diode. Vùng p-type là anode, n-type cathode như Hình 1.27. Điện áp anode cao hơn cathode thì forward biased, dòng từ anode qua cathode. Khi anode thấp hơn cathode thì reverse biased, không có dòng. Symbol diode trực quan cho thấy dòng chỉ một hướng.

![fig1_26](images/ch01/fig1_26.png)

Hình 1.26 Silicon lattice và dopant atom

![fig1_27](images/ch01/fig1_27.png)

Hình 1.27 Cấu trúc và symbol diode p-n junction

### 1.7.3 Capacitor

![fig1_28](images/ch01/fig1_28.png)

Hình 1.28 Symbol capacitor

Capacitor gồm hai conductor cách bởi insulator. Đặt điện áp V vào một conductor, nó tích điện Q, conductor kia tích −Q. Capacitance C là tỷ số điện tích/điện áp: C = Q/V. Capacitance tỷ lệ kích thước conductor, nghịch khoảng cách giữa chúng. Symbol như Hình 1.28.

> ![note_p051](images/ch01/note_p051.png)
>
> Kỹ thuật viên trong phòng sạch Intel mặc bộ đồ Gore-Tex để hạt từ tóc, da, quần áo không làm nhiễm transistor cực nhỏ trên silicon wafer (ảnh © 2006, Intel Corporation. Được phép tái bản).

Capacitance quan trọng vì nạp/xả conductor cần thời gian và năng lượng. Capacitance lớn làm circuit chậm và tốn năng lượng hơn. Tốc độ và năng lượng sẽ được bàn suốt sách.

### 1.7.4 Transistor nMOS và pMOS

MOSFET gồm nhiều lớp vật liệu dẫn/cách điện. Chế tạo trên silicon wafer mỏng phẳng đường kính khoảng 15 đến 30 cm. Bắt đầu wafer trần, qua các bước cấy dopant, tạo lớp mỏng silicon dioxide và silicon, lắng đọng kim loại. Giữa các bước tạo pattern để vật liệu chỉ ở nơi mong muốn. Vì transistor dài một phần micron[^1] và xử lý toàn wafer cùng lúc, chế tạo hàng tỷ transistor một lần không đắt. Xong thì cắt wafer thành hình chữ nhật gọi chip hoặc die chứa hàng nghìn, triệu, tỷ transistor. Kiểm thử rồi đóng package nhựa hoặc gốm có chân kim loại nối circuit board.

> ![note_p051_2](images/ch01/note_p051_2.png)
>
> Package dual-inline (DIP) 40-pin chứa chip nhỏ gần như khó thấy ở giữa, nối 40 chân kim loại, mỗi bên 20, bằng dây vàng mảnh hơn tóc (ảnh Kevin Mapp. © Harvey Mudd College).

MOSFET gồm lớp dẫn gọi gate trên insulator silicon dioxide (SiO<sub>2</sub>), trên silicon wafer gọi substrate. Ban đầu gate làm bằng kim loại nên tên metal-oxide-semiconductor. Quy trình hiện đại dùng polycrystalline silicon vì không chảy trong bước high-temperature sau. Silicon dioxide quen gọi thủy tinh, trong ngành thường chỉ gọi oxide. Cấu trúc metal-oxide-semiconductor tạo capacitor, lớp oxide mỏng cách điện gọi dielectric ngăn bản kim loại và semiconductor.

![fig1_29](images/ch01/fig1_29.png)

Hình 1.29 Transistor nMOS và pMOS

> Source và drain đối xứng vật lý. Nhưng nói điện tích từ source sang drain. nMOS mang electron, từ điện áp âm sang dương. pMOS mang hole, từ dương sang âm. Nếu vẽ sơ đồ điện áp dương nhất trên, âm nhất dưới, source điện tích âm nMOS là terminal dưới; source điện tích dương pMOS là terminal trên.

Có hai MOSFET: nMOS và pMOS (đọc “n-moss”, “p-moss”). Hình 1.29 cho cross-sections bằng cắt wafer rồi nhìn bên. Transistor n-type, gọi nMOS, có vùng dopant n-type cạnh gate gọi source và drain, xây trên substrate p-type. pMOS ngược lại: source và drain p-type trong substrate n-type.

MOSFET hành xử như switch voltage-controlled, gate voltage tạo điện trường bật/tắt kết nối source–drain. Tên field effect transistor bắt nguồn nguyên lý này. Bắt đầu tìm hiểu nMOS.

> ![note_p052](images/ch01/note_p052.png)
>
> Kỹ thuật viên cầm wafer 12-inch chứa hàng trăm microprocessor chip (ảnh © 2006, Intel Corporation. Được phép tái bản).

Substrate nMOS thường nối GND, điện áp thấp nhất. Xét gate cũng 0 V như Hình 1.30(a). Diode giữa source/drain và substrate reverse biased vì source/drain không âm. Không có đường dòng giữa source, drain nên transistor OFF. Nâng gate lên V<sub>DD</sub> như Hình 1.30(b): điện áp dương trên bản capacitor tạo điện trường hút điện dương trên bản trên, điện âm về bản dưới. Nếu đủ lớn, điện âm dưới gate nhiều đến mức vùng đảo p-type thành n-type, gọi channel. Nay có đường liên tục từ source n-type qua channel n-type tới drain n-type, electron đi từ source sang drain: transistor ON. Gate voltage cần để bật gọi threshold voltage V<sub>t</sub>, thường 0.3 đến 0.7 V.

![fig1_30](images/ch01/fig1_30.png)

Hình 1.30 Hoạt động transistor nMOS

> ![note_p053](images/ch01/note_p053.png)
>
> Gordon Moore, 1929–
>
> Sinh ở San Francisco. B.S. hóa học UC Berkeley, Ph.D. hóa học và vật lý Caltech. Đồng sáng lập Intel năm 1968 với Robert Noyce. Năm 1965 quan sát số transistor trên chip gấp đôi mỗi năm, gọi Moore’s Law. Từ 1975 số transistor gấp đôi mỗi hai năm.
>
> Hệ quả Moore’s Law là performance microprocessor gấp đôi mỗi 18 đến 24 tháng. Doanh số semiconductor cũng tăng hàm mũ; tiếc rằng công suất tiêu thụ cũng vậy.
>
> Moore’s Law thúc đẩy tiến bộ khó tin suốt 50 năm khi feature size giảm từ hơn 10 μm xuống 5 nm. Nhưng tiến bộ chậm lại vì tạo transistor nhỏ hơn nhiều bước sóng ánh sáng rất đắt. (Ảnh © 2006, Intel Corporation. Được phép tái bản.)

pMOS hoạt động ngược, có thể đoán từ bubble trên symbol Hình 1.31. Substrate nối V<sub>DD</sub>. Gate ở V<sub>DD</sub> thì pMOS OFF; gate ở GND, channel đảo thành p-type, pMOS ON.

MOSFET không phải switch hoàn hảo. nMOS truyền 0 tốt, 1 kém. Cụ thể gate nMOS ở V<sub>DD</sub>, source chỉ dao động 0 đến V<sub>DD</sub> − V<sub>t</sub> khi drain từ 0 đến V<sub>DD</sub>. Tương tự pMOS truyền 1 tốt, 0 kém. Nhưng sẽ thấy xây được logic gate chỉ dùng transistor ở chế độ tốt.

nMOS cần substrate p-type; pMOS cần substrate n-type. Để có cả hai trên chip, thường bắt đầu wafer p-type rồi cấy vùng n-type gọi well nơi đặt pMOS. Quy trình cung cấp cả hai gọi Complementary MOS hay CMOS, dùng chế tạo đại đa số transistor ngày nay.

Tóm lại CMOS cho hai switch điều khiển điện như Hình 1.31. Điện áp gate (g) điều khiển dòng giữa source (s), drain (d). nMOS OFF khi gate 0, ON khi 1. pMOS ngược: ON khi 0, OFF khi 1.

![fig1_31](images/ch01/fig1_31.png)

Hình 1.31 Switch model của MOSFET

### 1.7.5 CMOS NOT gate

Hình 1.32 là schematic NOT gate CMOS. Tam giác chỉ GND, thanh ngang V<sub>DD</sub>; nhãn sẽ bỏ ở schematic sau. nMOS N1 nối GND với output Y. pMOS P1 nối V<sub>DD</sub> với Y. Cả hai gate được điều khiển bởi input A.

![fig1_32](images/ch01/fig1_32.png)

Hình 1.32 Schematic NOT gate

Nếu A = 0, N1 OFF, P1 ON. Y nối V<sub>DD</sub>, không nối GND, được kéo lên logic 1. P1 truyền 1 tốt. Nếu A = 1, N1 ON, P1 OFF, Y kéo xuống logic 0. N1 truyền 0 tốt. Đối chiếu truth table Hình 1.12, circuit đúng là NOT gate.

![fig1_33](images/ch01/fig1_33.png)

Hình 1.33 Schematic NAND gate Two-input

### 1.7.6 Các CMOS logic gate khác

Hình 1.33 cho schematic NAND two-input. Trên sơ đồ, dây luôn nối ở junction three-way, chỉ nối tại four-way nếu có dấu chấm. nMOS N1, N2 nối tiếp, cả hai phải ON để kéo output xuống GND. pMOS P1, P2 song song, chỉ cần một ON để kéo lên V<sub>DD</sub>. Bảng 1.6 liệt kê hoạt động mạng pull-down, pull-up và output, chứng minh NAND. Ví dụ A = 1, B = 0: N1 ON, N2 OFF chặn đường Y–GND. P1 OFF, P2 ON tạo đường V<sub>DD</sub>–Y. Vậy Y kéo lên 1.

![fig1_34](images/ch01/fig1_34.png)

Hình 1.34 Dạng tổng quát của inverting logic gate

Hình 1.34 là dạng tổng quát xây inverting logic gate như NOT, NAND, NOR. nMOS truyền 0 tốt nên mạng pull-down nMOS giữa output và GND kéo xuống 0. pMOS truyền 1 tốt nên mạng pull-up pMOS giữa output và V<sub>DD</sub> kéo lên 1. Mạng gồm transistor nối tiếp hoặc song song. Song song thì ON nếu một transistor ON. Nối tiếp chỉ ON khi cả hai ON. Gạch chéo trên dây input chỉ gate có thể nhận nhiều input.

Bảng 1.6 Hoạt động NAND gate

| A | B | Pull-Down Network | Pull-Up Network | Y |
|---|---|---|---|---|
| 0 | 0 | OFF | ON | 1 |
| 0 | 1 | OFF | ON | 1 |
| 1 | 0 | OFF | ON | 1 |
| 1 | 1 | ON | OFF | 0 |

> Designer kinh nghiệm cho rằng thiết bị điện tử chạy vì chứa khói ma thuật. Bằng chứng là khi khói thoát ra, thiết bị ngừng chạy.

![img_p055](images/ch01/img_p055.png)

Nếu cả mạng pull-up và pull-down cùng ON, có short circuit giữa V<sub>DD</sub>, GND. Output có thể ở forbidden zone, transistor tiêu thụ công suất lớn có thể cháy. Ngược lại cả pull-up và pull-down cùng OFF, output không nối V<sub>DD</sub> hay GND: gọi floating. Giá trị lại undefined. Floating output thường không mong muốn nhưng Mục 2.6 cho cách đôi khi tận dụng.

Gate đúng phải có một mạng ON, mạng kia OFF mọi lúc để output HIGH hoặc LOW, không short/floating. Bảo đảm bằng quy tắc conduction complements: nMOS nối tiếp thì pMOS song song; nMOS song song thì pMOS nối tiếp.

![fig1_35](images/ch01/fig1_35.png)

Hình 1.35 Schematic NAND gate Three-input

#### Ví dụ 1.20 SCHEMATIC NAND THREE-INPUT

Vẽ schematic NAND gate three-input bằng CMOS transistor.

Lời giải NAND chỉ cho 0 khi cả ba input 1. Vậy mạng pull-down gồm ba nMOS nối tiếp. Theo conduction complements, pMOS song song. Gate như Hình 1.35; kiểm function bằng truth table.

![fig1_36](images/ch01/fig1_36.png)

Hình 1.36 Schematic NOR gate Two-input

#### Ví dụ 1.21 SCHEMATIC NOR TWO-INPUT

Vẽ schematic NOR gate two-input bằng CMOS transistor.

Lời giải NOR cho 0 nếu một input 1. Vậy pull-down hai nMOS song song. Theo conduction complements, pMOS nối tiếp. Hình 1.36 cho gate này.

#### Ví dụ 1.22 SCHEMATIC AND TWO-INPUT

![fig1_37](images/ch01/fig1_37.png)

Hình 1.37 Schematic AND gate Two-input

Vẽ schematic cho AND gate two-input.

Lời giải Không thể xây AND bằng một CMOS gate đơn. Nhưng NAND và NOT dễ xây. Vì vậy cách tốt nhất xây AND bằng CMOS transistor là NAND theo sau bởi NOT như Hình 1.37.

### 1.7.7 Transmission gate

Đôi khi designer thấy tiện dùng switch lý tưởng truyền tốt cả 0 và 1. Nhớ rằng nMOS truyền 0 tốt, pMOS truyền 1 tốt, nên ghép song song truyền tốt cả hai. Hình 1.38 là circuit gọi transmission gate hoặc pass gate. Hai phía gọi A, B vì switch hai chiều, không có phía input/output ưu tiên. Control signal gọi enable, EN và $\overline{EN}$. Khi EN = 0, $\overline{EN}$ = 1, cả transistor OFF: gate OFF hay disabled, A và B không nối. Khi EN = 1, $\overline{EN}$ = 0, gate ON hay enabled, mọi logic value truyền được giữa A và B.

![fig1_38](images/ch01/fig1_38.png)

Hình 1.38 Transmission gate

### 1.7.8 Logic Pseudo-nMOS

CMOS NOR N-input dùng N nMOS song song và N pMOS nối tiếp. Transistor nối tiếp chậm hơn song song, như resistor nối tiếp có resistance lớn hơn. Hơn nữa pMOS chậm hơn nMOS vì hole di chuyển trong silicon lattice chậm hơn electron. Vì vậy nMOS song song nhanh, pMOS nối tiếp chậm, nhất là nhiều transistor nối tiếp.

![fig1_39](images/ch01/fig1_39.png)

Hình 1.39 Gate pseudo-nMOS tổng quát

Logic Pseudo-nMOS thay chuỗi pMOS chậm bằng một pMOS yếu luôn ON, như Hình 1.39. Transistor này thường gọi weak pull-up. Kích thước vật lý được chọn để kéo Y HIGH yếu—chỉ khi không nMOS nào ON. Nếu bất kỳ nMOS ON, nó thắng weak pull-up và kéo Y đủ gần GND tạo logic 0.

![fig1_40](images/ch01/fig1_40.png)

Hình 1.40 NOR gate Pseudo-nMOS four-input

Ưu điểm pseudo-nMOS là xây NOR nhanh nhiều input. Ví dụ Hình 1.40 là NOR pseudo-nMOS four-input. Gate Pseudo-nMOS hữu ích cho một số memory và logic array trong Chương 5. Nhược điểm là có short circuit giữa V<sub>DD</sub> và GND khi output LOW; pMOS yếu và nMOS đều ON. Short circuit tiêu thụ công suất liên tục nên phải dùng pseudo-nMOS tiết chế.

Gate Pseudo-nMOS mang tên từ thập niên 1970 khi quy trình chế tạo chỉ có nMOS. Một nMOS yếu kéo output HIGH vì chưa có pMOS.

## 1.8 CÔNG SUẤT TIÊU THỤ\*

Công suất tiêu thụ là năng lượng dùng mỗi đơn vị thời gian, rất quan trọng trong digital system. Thời lượng pin hệ di động như điện thoại và laptop bị giới hạn bởi công suất. Ví dụ pin điện thoại chứa khoảng 10 watt-hours (W-hr), cung cấp 1 watt (W) trong 10 giờ hoặc 2 W trong 5 giờ, v.v. Để pin dùng cả ngày, tiêu thụ trung bình dưới 1 W. Laptop thường có pin 50 đến 100 W-hr, tiêu thụ dưới 10 W khi chạy bình thường, màn hình chiếm phần lớn. Công suất cũng quan trọng với hệ cắm điện vì tốn tiền, gây phát thải, và quá nóng nếu dùng quá nhiều. Desktop 200 W trong 8 giờ/ngày dùng khoảng 600 kilowatt-hours (kW-hr) mỗi năm. Giá trung bình 12 cent và phát thải một pound CO<sub>2</sub> mỗi kW-hr tương đương 72 USD/năm cùng 600 pound CO<sub>2</sub>.

> Bạn giúp hành tinh bằng cách bảo đảm máy tính sleep khi không dùng.

Digital system dùng cả dynamic power và static power. Dynamic power nạp capacitance khi signal đổi giữa 0, 1. Static power tiêu thụ ngay cả khi signal không đổi, hệ idle.

Logic gate và dây nối có capacitance. Năng lượng lấy từ nguồn để nạp capacitance C lên V<sub>DD</sub> là CV<sub>DD</sub><sup>2</sup>. Nếu chạy tần số f, tỷ phần cycle capacitor nạp/xả là α (activity factor), dynamic power là

P<sub>dynamic</sub> = αCV<sub>DD</sub><sup>2</sup>f (1.4)

Hình 1.41 minh họa activity factor. Hình 1.41(a) là clock signal tăng/giảm mỗi cycle, activity factor 1. Clock period giữa hai rising edge gọi T<sub>c</sub> (cycle time), nghịch đảo clock frequency f. Hình 1.41(b) là data signal chuyển một lần mỗi clock cycle. Đường song song trên timing diagram chỉ signal có thể high hoặc low; không quan tâm giá trị. Chỗ giao chỉ signal đổi một lần đầu mỗi cycle. Vậy activity factor 0.5 (tăng ở nửa cycle, giảm nửa còn lại). Hình 1.41(c) là random data đổi ở nửa cycle, giữ nguyên nửa kia, nên activity factor 0.25. Hệ thực thường có component idle không chuyển nên 0.1 điển hình hơn.

![fig1_41](images/ch01/fig1_41.png)

Hình 1.41 Minh họa activity factor

Hệ điện vẫn dùng ít dòng khi idle. Transistor OFF rò ít dòng. Một số circuit như gate pseudo-nMOS Mục 1.7.8 có đường V<sub>DD</sub>–GND cho dòng liên tục. Tổng static current I<sub>DD</sub> còn gọi leakage current hoặc quiescent supply current giữa V<sub>DD</sub>, GND. Static power tỷ lệ dòng này:

P<sub>static</sub> = I<sub>DD</sub>V<sub>DD</sub> (1.5)

### Ví dụ 1.23 CÔNG SUẤT TIÊU THỤ

Điện thoại có pin 8 W-hr, chạy 0.707 V. Giả sử khi dùng chạy 2 GHz. Tổng capacitance circuit là 10 nF (10<sup>−8</sup> Farad), activity factor 0.05. Khi thoại hoặc data hoạt động (10% thời gian sử dụng), nó phát thêm 3 W qua antenna. Khi không dùng, dynamic power gần zero vì tắt signal processing. Nhưng luôn dùng 100 mA quiescent current. Tìm thời lượng pin (a) không dùng, (b) dùng liên tục.

Lời giải Static power P<sub>static</sub> = (0.100 A)(0.707 V) = 71 milliwatt (mW).

(a) Không dùng thì đây là công suất duy nhất, thời lượng (8 W-hr)/(0.071 W) = 113 giờ (khoảng 5 ngày). (b) Khi dùng, dynamic power P<sub>dynamic</sub> = (0.05)(10<sup>−8</sup> F)(0.707 V)<sup>2</sup>(2 × 10<sup>9</sup> Hz) = 0.5 W. Công suất phát trung bình (3 W)(0.1) = 0.3 W.

Cộng static và công suất phát, tổng khi hoạt động 0.5 W + 0.071 W + 0.3 W = 0.871 W, thời lượng 8 W-hr/0.0871 W = 9.2 giờ. Ví dụ đơn giản hóa phần nào hoạt động thực nhưng minh họa ý chính về công suất.

## 1.9 TÓM TẮT VÀ NHÌN VỀ PHÍA TRƯỚC

Có 10 loại người trên đời: người biết đếm binary và người không biết.

Chương giới thiệu nguyên tắc hiểu và thiết kế hệ phức tạp. Dù thế giới thực analog, digital designer tự giới hạn vào tập con rời rạc các signal. Cụ thể binary variable chỉ có 0, 1, còn gọi FALSE, TRUE hoặc LOW, HIGH. Logic gate tính binary output từ một hay nhiều binary input. Một số gate phổ biến:

- NOT: Output TRUE khi input FALSE

- AND: Output TRUE khi mọi input TRUE

- OR: Output TRUE khi bất kỳ input TRUE

- XOR: Output TRUE khi số input TRUE là lẻ

Logic gate thường xây từ CMOS transistor, hành xử như switch điều khiển điện. nMOS ON khi gate 1; pMOS ON khi gate 0.

Chương 2 đến 5 tiếp tục digital logic. Chương 2 bàn combinational logic, output chỉ phụ thuộc input hiện tại. Các gate đã giới thiệu là ví dụ. Bạn sẽ học thiết kế nhiều gate thực hiện quan hệ input/output theo truth table hoặc Boolean equation. Chương 3 bàn sequential logic, output phụ thuộc cả input hiện tại và quá khứ. Register là sequential element phổ biến nhớ input trước. Finite state machine xây bằng register và combinational logic là cách mạnh để xây hệ phức tạp có hệ thống. Cũng học timing để phân tích tốc độ hệ. Chương 4 mô tả hardware description language (HDL), liên quan ngôn ngữ lập trình thường nhưng dùng mô phỏng/xây hardware thay software. Phần lớn digital system nay thiết kế bằng HDL. SystemVerilog và VHDL là hai ngôn ngữ phổ biến, được trình bày side-by-side. Chương 5 học khối combinational/sequential khác như adder, multiplier, memory.

Chương 6 chuyển computer architecture, mô tả processor RISC-V, microprocessor open-source mới phát triển, bắt đầu được phát triển rộng trong công nghiệp và học thuật. Architecture RISC-V định nghĩa bằng register và assembly language instruction set. Bạn học viết assembly cho RISC-V để giao tiếp bằng ngôn ngữ bản địa của processor.

Chương 7, 8 nối digital logic và computer architecture. Chương 7 khảo sát microarchitecture, cách bố trí digital building block như adder, register cần để tạo processor. Bạn học xây processor RISC-V riêng, thực tế ba microarchitecture minh họa trade-offs performance/chi phí. Performance tăng hàm mũ đòi memory system tinh vi hơn đáp ứng nhu cầu data vô tận. Chương 8 đi sâu memory system architecture. Chương 9 (web supplement—xem Lời nói đầu) mô tả giao tiếp peripheral như màn hình, Bluetooth radio, động cơ.

## Bài tập

Bài tập 1.1 Trong một đoạn văn, giải thích ít nhất ba mức abstraction được dùng bởi

(a) nhà sinh học nghiên cứu hoạt động tế bào.

(b) nhà hóa học nghiên cứu thành phần vật chất.

Bài tập 1.2 Trong một đoạn văn, giải thích cách dùng hierarchy, modularity, regularity bởi

(a) người thiết kế ô tô.

(b) doanh nghiệp quản lý hoạt động.

Bài tập 1.3 Ben Bitdiddle xây nhà. Giải thích cách dùng hierarchy, modularity, regularity tiết kiệm thời gian và tiền trong xây dựng.

Bài tập 1.4 Điện áp analog từ 0–5 V. Nếu đo chính xác ±50 mV, tối đa mang bao nhiêu bit thông tin?

Bài tập 1.5 Lớp học có đồng hồ treo tường cũ bị gãy kim phút.

(a) Nếu đọc kim giờ chính xác tới 15 phút gần nhất, đồng hồ cho bao nhiêu bit thông tin về giờ?

(b) Nếu biết trước hay sau trưa, bạn biết thêm bao nhiêu bit thông tin về giờ?

Bài tập 1.6 Người Babylon phát triển hệ sexagesimal (cơ số 60) khoảng 4000 năm trước. Một sexagesimal digit mang bao nhiêu bit? Viết 4000<sub>10</sub> theo sexagesimal thế nào?

Bài tập 1.7 Có thể biểu diễn bao nhiêu số khác nhau bằng 16 bit?

Bài tập 1.8 Số binary unsigned 32-bit lớn nhất là gì?

Bài tập 1.9 Số binary 16-bit lớn nhất biểu diễn được bằng

(a) unsigned?

(b) two’s complement?

(c) sign/magnitude?

Bài tập 1.10 Số binary 32-bit lớn nhất biểu diễn được bằng

(a) unsigned?

(b) two’s complement?

(c) sign/magnitude?

Bài tập 1.11 Số binary 16-bit nhỏ nhất (âm nhất) biểu diễn được bằng

(a) unsigned?

(b) two’s complement?

(c) sign/magnitude?

Bài tập 1.12 Số binary 32-bit nhỏ nhất (âm nhất) biểu diễn được bằng

(a) unsigned?

(b) two’s complement?

(c) sign/magnitude?

Bài tập 1.13 Chuyển các unsigned binary sau sang decimal. Trình bày cách tính.

(a) 1010<sub>2</sub>

(b) 110110<sub>2</sub>

(c) 11110000<sub>2</sub>

(d) 000100010100111<sub>2</sub>

Bài tập 1.14 Chuyển các unsigned binary sau sang decimal. Trình bày cách tính.

(a) 1110<sub>2</sub>

(b) 100100<sub>2</sub>

(c) 11010111<sub>2</sub>

(d) 011101010100100<sub>2</sub>

Bài tập 1.15 Làm lại Bài tập 1.13 nhưng chuyển hexadecimal.

Bài tập 1.16 Làm lại Bài tập 1.14 nhưng chuyển hexadecimal.

Bài tập 1.17 Chuyển các hexadecimal sau sang decimal. Trình bày cách tính.

(a) A5<sub>16</sub>

(b) 3B<sub>16</sub>

(c) FFFF<sub>16</sub>

(d) D0000000<sub>16</sub>

Bài tập 1.18 Chuyển các hexadecimal sau sang decimal. Trình bày cách tính.

(a) 4E<sub>16</sub>

(b) 7C<sub>16</sub>

(c) ED3A<sub>16</sub>

(d) 403FB001<sub>16</sub>

Bài tập 1.19 Làm lại Bài tập 1.17 nhưng chuyển unsigned binary.

Bài tập 1.20 Làm lại Bài tập 1.18 nhưng chuyển unsigned binary.

Bài tập 1.21 Chuyển các binary two’s complement sau sang decimal.

(a) 1010<sub>2</sub>

(b) 110110<sub>2</sub>

(c) 01110000<sub>2</sub>

(d) 10011111<sub>2</sub>

Bài tập 1.22 Chuyển các binary two’s complement sau sang decimal.

(a) 1110<sub>2</sub>

(b) 100011<sub>2</sub>

(c) 01001110<sub>2</sub>

(d) 10110101<sub>2</sub>

Bài tập 1.23 Làm lại Bài tập 1.21, giả định binary ở dạng sign/magnitude thay two’s complement.

Bài tập 1.24 Làm lại Bài tập 1.22, giả định binary ở dạng sign/magnitude thay two’s complement.

Bài tập 1.25 Chuyển các decimal sau sang unsigned binary.

(a) 42<sub>10</sub>

(b) 63<sub>10</sub>

(c) 229<sub>10</sub>

(d) 845<sub>10</sub>

Bài tập 1.26 Chuyển các decimal sau sang unsigned binary.

(a) 14<sub>10</sub>

(b) 52<sub>10</sub>

(c) 339<sub>10</sub>

(d) 711<sub>10</sub>

Bài tập 1.27 Làm lại Bài tập 1.25 nhưng chuyển hexadecimal.

Bài tập 1.28 Làm lại Bài tập 1.26 nhưng chuyển hexadecimal.

Bài tập 1.29 Chuyển các decimal sau sang two’s complement 8-bit hoặc chỉ ra số decimal overflow range.

(a) 42<sub>10</sub>

(b) −63<sub>10</sub>

(c) 124<sub>10</sub>

(d) −128<sub>10</sub>

(e) 133<sub>10</sub>

Bài tập 1.30 Chuyển các decimal sau sang two’s complement 8-bit hoặc chỉ ra số decimal overflow range.

(a) 24<sub>10</sub>

(b) −59<sub>10</sub>

(c) 128<sub>10</sub>

(d) −150<sub>10</sub>

(e) 127<sub>10</sub>

Bài tập 1.31 Làm lại Bài tập 1.29 nhưng chuyển sign/magnitude 8-bit.

Bài tập 1.32 Làm lại Bài tập 1.30 nhưng chuyển sign/magnitude 8-bit.

Bài tập 1.33 Chuyển các two’s complement 4-bit sau sang two’s complement 8-bit.

(a) 0101<sub>2</sub>

(b) 1010<sub>2</sub>

Bài tập 1.34 Chuyển các two’s complement 4-bit sau sang two’s complement 8-bit.

(a) 0111<sub>2</sub>

(b) 1001<sub>2</sub>

Bài tập 1.35 Làm lại Bài tập 1.33 nếu số unsigned thay two’s complement.

Bài tập 1.36 Làm lại Bài tập 1.34 nếu số unsigned thay two’s complement.

Bài tập 1.37 Cơ số 8 gọi octal. Chuyển từng số Bài tập 1.25 sang octal.

Bài tập 1.38 Cơ số 8 gọi octal. Chuyển từng số Bài tập 1.26 sang octal.

Bài tập 1.39 Chuyển từng octal sau sang binary, hexadecimal và decimal.

(a) 42<sub>8</sub>

(b) 63<sub>8</sub>

(c) 255<sub>8</sub>

(d) 3047<sub>8</sub>

Bài tập 1.40 Chuyển từng octal sau sang binary, hexadecimal và decimal.

(a) 23<sub>8</sub>

(b) 45<sub>8</sub>

(c) 371<sub>8</sub>

(d) 2560<sub>8</sub>

Bài tập 1.41 Có bao nhiêu two’s complement 5-bit lớn hơn 0? Bao nhiêu nhỏ hơn 0? Đáp án khác thế nào với sign/magnitude?

Bài tập 1.42 Có bao nhiêu two’s complement 7-bit lớn hơn 0? Bao nhiêu nhỏ hơn 0? Đáp án khác thế nào với sign/magnitude?

Bài tập 1.43 Word 32-bit có bao nhiêu byte? Word 32-bit có bao nhiêu nibble?

Bài tập 1.44 Word 64-bit có bao nhiêu byte?

Bài tập 1.45 DSL modem chạy 768 kbit/giây. Nhận bao nhiêu byte trong 1 phút?

Bài tập 1.46 USB 3.0 gửi 5 Gbit/giây. Gửi bao nhiêu byte trong 1 phút?

Bài tập 1.47 Nhà sản xuất ổ cứng dùng “megabyte” là 10<sup>6</sup> byte, “gigabyte” là 10<sup>9</sup> byte. Lưu được bao nhiêu GB thực (GiB) nhạc trên ổ 50 GB?

Bài tập 1.48 Ước lượng 2<sup>31</sup> không dùng máy tính.

Bài tập 1.49 Memory trên Pentium II tổ chức array bit chữ nhật 2<sup>8</sup> row, 2<sup>9</sup> column. Ước lượng số bit không dùng máy tính.

Bài tập 1.50 Vẽ trục số như Hình 1.11 cho unsigned, two’s complement, sign/magnitude 3-bit.

Bài tập 1.51 Vẽ trục số như Hình 1.11 cho unsigned, two’s complement, sign/magnitude 2-bit.

Bài tập 1.52 Cộng unsigned binary sau. Cho biết tổng overflow kết quả 4-bit không.

(a) 1001<sub>2</sub> + 0100<sub>2</sub>

(b) 1101<sub>2</sub> + 1011<sub>2</sub>

Bài tập 1.53 Cộng unsigned binary sau. Cho biết tổng overflow kết quả 8-bit không.

(a) 10011001<sub>2</sub> + 01000100<sub>2</sub>

(b) 11010010<sub>2</sub> + 10110110<sub>2</sub>

Bài tập 1.54 Làm lại Bài tập 1.52 với binary two’s complement.

Bài tập 1.55 Làm lại Bài tập 1.53 với binary two’s complement.

Bài tập 1.56 Chuyển các số decimal sau sang binary two’s complement 6-bit rồi cộng chúng. Cho biết tổng có overflow kết quả 6-bit hay không.

(a) 16<sub>10</sub> + 9<sub>10</sub>

(b) 27<sub>10</sub> + 31<sub>10</sub>

(c) −4<sub>10</sub> + 19<sub>10</sub>

(d) 3<sub>10</sub> + −32<sub>10</sub>

(e) −16<sub>10</sub> + −9<sub>10</sub>

(f) −27<sub>10</sub> + −31<sub>10</sub>

Bài tập 1.57 Làm lại Bài tập 1.56 với các số sau.

(a) 7<sub>10</sub> + 13<sub>10</sub>

(b) 17<sub>10</sub> + 25<sub>10</sub>

(c) −26<sub>10</sub> + 8<sub>10</sub>

(d) 31<sub>10</sub> + −14<sub>10</sub>

(e) −19<sub>10</sub> + −22<sub>10</sub>

(f) −2<sub>10</sub> + −29<sub>10</sub>

Bài tập 1.58 Cộng unsigned hexadecimal sau. Cho biết tổng overflow kết quả 8-bit (hai hex digit) không.

(a) 7<sub>16</sub> + 9<sub>16</sub>

(b) 13<sub>16</sub> + 28<sub>16</sub>

(c) AB<sub>16</sub> + 3E<sub>16</sub>

(d) 8F<sub>16</sub> + AD<sub>16</sub>

Bài tập 1.59 Cộng unsigned hexadecimal sau. Cho biết tổng overflow kết quả 8-bit (hai hex digit) không.

(a) 22<sub>16</sub> + 8<sub>16</sub>

(b) 73<sub>16</sub> + 2C<sub>16</sub>

(c) 7F<sub>16</sub> + 7F<sub>16</sub>

(d) C2<sub>16</sub> + A4<sub>16</sub>

Bài tập 1.60 Chuyển decimal sau sang binary two’s complement 5-bit rồi trừ. Cho biết hiệu overflow kết quả 5-bit không.

(a) 9<sub>10</sub> − 7<sub>10</sub>

(b) 12<sub>10</sub> − 15<sub>10</sub>

(c) −6<sub>10</sub> − 11<sub>10</sub>

(d) 4<sub>10</sub> − −8<sub>10</sub>

Bài tập 1.61 Chuyển decimal sau sang binary two’s complement 6-bit rồi trừ. Cho biết hiệu overflow kết quả 6-bit không.

(a) 18<sub>10</sub> − 12<sub>10</sub>

(b) 30<sub>10</sub> − 9<sub>10</sub>

(c) −28<sub>10</sub> − 3<sub>10</sub>

(d) −16<sub>10</sub> −21<sub>10</sub>

Bài tập 1.62 Trong hệ binary N-bit biased có bias B, số dương và âm biểu diễn bằng giá trị cộng B. Ví dụ 5-bit bias 15 biểu diễn 0 bằng 01111, 1 bằng 10000, v.v. Biased number đôi khi dùng trong toán floating-point, bàn Chương 5. Xét hệ binary biased 8-bit có bias 127<sub>10</sub>.

(a) Binary 10000010<sub>2</sub> biểu diễn decimal nào?

(b) Binary nào biểu diễn 0?

(c) Biểu diễn và giá trị của số âm nhất?

(d) Biểu diễn và giá trị của số dương lớn nhất?

Bài tập 1.63 Vẽ trục số như Hình 1.11 cho biased 3-bit bias 3 (xem định nghĩa Bài tập 1.62).

Bài tập 1.64 Trong binary coded decimal (BCD), bốn bit biểu diễn một decimal digit 0 đến 9. Ví dụ 37<sub>10</sub> viết 00110111<sub>BCD</sub>.

(a) Viết 289<sub>10</sub> bằng BCD.

(b) Chuyển 100101010001<sub>BCD</sub> sang decimal.

(c) Chuyển 01101001<sub>BCD</sub> sang binary.

(d) Giải thích vì sao BCD có thể hữu ích để biểu diễn số.

Bài tập 1.65 Trả lời câu sau về BCD (định nghĩa Bài tập 1.64).

(a) Viết 371<sub>10</sub> bằng BCD.

(b) Chuyển 000110000111<sub>BCD</sub> sang decimal.

(c) Chuyển 10010101<sub>BCD</sub> sang binary.

(d) Giải thích nhược điểm BCD so với binary.

Bài tập 1.66 Đĩa bay rơi trên đồng ngô Nebraska. FBI điều tra xác tìm thấy engineering manual có phương trình theo hệ đếm sao Hỏa: 325 + 42 = 411. Nếu đúng, bạn dự đoán người sao Hỏa có bao nhiêu ngón tay?

Bài tập 1.67 Ben Bitdiddle và Alyssa P. Hacker tranh luận. Ben: “Mọi integer lớn hơn zero chia hết sáu đều có đúng hai bit 1 trong binary.” Alyssa: “Không, nhưng mọi số đó có số bit 1 chẵn.” Bạn đồng ý Ben, Alyssa, cả hai hay không ai? Giải thích.

Bài tập 1.68 Ben Bitdiddle và Alyssa P. Hacker lại tranh luận. Ben nói: “Tôi có thể lấy two’s complement của một số bằng cách trừ 1 rồi đảo mọi bit của kết quả.” Alyssa nói: “Không, tôi có thể làm bằng cách xét từng bit của số, bắt đầu từ least significant bit. Khi tìm thấy bit 1 đầu tiên, đảo mọi bit tiếp sau.” Bạn đồng ý với Ben, Alyssa, cả hai hay không ai? Giải thích.

Bài tập 1.69 Viết chương trình bằng ngôn ngữ ưa thích (C, Java, Perl) chuyển binary sang decimal. Người dùng nhập unsigned binary, chương trình in decimal tương đương.

Bài tập 1.70 Làm lại Bài tập 1.69 nhưng chuyển cơ số b<sub>1</sub> bất kỳ sang b<sub>2</sub> theo người dùng. Hỗ trợ đến cơ số 16, dùng chữ cho digit lớn hơn 9. Người dùng nhập b<sub>1</sub>, b<sub>2</sub> rồi số cơ số b<sub>1</sub>. In số tương đương cơ số b<sub>2.</sub>

Bài tập 1.71 Vẽ symbol, Boolean equation và truth table cho

(a) OR gate three-input

(b) exclusive OR (XOR) gate three-input

(c) XNOR gate four-input

Bài tập 1.72 Vẽ symbol, Boolean equation và truth table cho

(a) OR gate four-input

(b) XNOR gate three-input

(c) NAND gate five-input

Bài tập 1.73 Majority gate cho TRUE khi và chỉ khi hơn nửa input TRUE. Hoàn thành truth table cho majority gate three-input Hình 1.42.

![fig1_42](images/ch01/fig1_42.png)

Hình 1.42 Majority gate Three-input

Bài tập 1.74 AND-OR (AO) gate three-input Hình 1.43 cho TRUE nếu cả A, B TRUE hoặc C TRUE. Hoàn thành truth table.

![fig1_43](images/ch01/fig1_43.png)

Hình 1.43 AND-OR gate Three-input

Bài tập 1.75 OR-AND-INVERT (OAI) gate three-input Hình 1.44 cho FALSE nếu C TRUE và A hoặc B TRUE. Nếu không cho TRUE. Hoàn thành truth table.

![fig1_44](images/ch01/fig1_44.png)

Hình 1.44 OR-AND-INVERT gate Three-input

Bài tập 1.76 Có 16 truth table khác nhau cho Boolean function hai variable. Liệt kê từng bảng. Đặt tên mô tả ngắn (OR, NAND, v.v.).

Bài tập 1.77 Có bao nhiêu truth table khác nhau cho Boolean function N variable?

Bài tập 1.78 Có thể gán logic level để device có transfer characteristic Hình 1.45 làm inverter không? Nếu có, input/output low/high (V<sub>IL</sub>, V<sub>OL</sub>, V<sub>IH</sub>, V<sub>OH</sub>) và noise margin (NM<sub>L</sub>, N<sub>H</sub>) là gì? Nếu không, giải thích.

![fig1_45](images/ch01/fig1_45.png)

Hình 1.45 DC transfer characteristic

Bài tập 1.79 Làm lại Bài tập 1.78 cho transfer characteristic Hình 1.46.

![fig1_46](images/ch01/fig1_46.png)

Hình 1.46 DC transfer characteristic

Bài tập 1.80 Có thể gán logic level để device có transfer characteristic Hình 1.47 làm buffer không? Nếu có, input/output low/high (V<sub>IL</sub>, V<sub>OL</sub>, V<sub>IH</sub>, V<sub>OH</sub>) và noise margin (NM<sub>L</sub>, NM<sub>H</sub>) là gì? Nếu không, giải thích.

![fig1_47](images/ch01/fig1_47.png)

Hình 1.47 DC transfer characteristic

Bài tập 1.81 Ben Bitdiddle phát minh một circuit có transfer characteristic như Hình 1.48 và muốn dùng nó làm buffer. Nó có hoạt động không? Vì sao có hoặc vì sao không? Anh muốn quảng cáo nó tương thích với logic LVCMOS và LVTTL. Buffer của Ben có nhận đúng input từ những logic family này không? Output của nó có lái đúng những logic family này không? Giải thích.

![fig1_48](images/ch01/fig1_48.png)

Hình 1.48 DC transfer characteristic buffer của Ben

Bài tập 1.82 Đi trong ngõ tối, Ben gặp gate two-input có transfer function Hình 1.49. Input A, B; output Y.

![fig1_49](images/ch01/fig1_49.png)

Hình 1.49 DC transfer characteristic Two-input

(a) Anh tìm thấy logic gate loại gì?

(b) Logic level high/low xấp xỉ là gì?

Bài tập 1.83 Làm lại Bài tập 1.82 cho Hình 1.50.

![fig1_50](images/ch01/fig1_50.png)

Hình 1.50 DC transfer characteristic Two-input

Bài tập 1.84 Phác circuit transistor-level cho CMOS gate sau. Dùng ít transistor nhất.

(a) NAND gate four-input

(b) OR-AND-INVERT gate three-input (Bài tập 1.75)

(c) AND-OR gate three-input (Bài tập 1.74)

Bài tập 1.85 Phác circuit transistor-level cho CMOS gate sau. Dùng ít transistor nhất.

(a) NOR gate three-input

(b) AND gate three-input

(c) OR gate two-input

Bài tập 1.86 Minority gate TRUE khi và chỉ khi dưới nửa input TRUE, còn lại FALSE. Phác circuit transistor-level cho CMOS minority gate three-input, dùng ít transistor nhất.

Bài tập 1.87 Viết truth table cho function gate Hình 1.51, hai input A, B. Function tên gì?

![fig1_51](images/ch01/fig1_51.png)

Hình 1.51 Schematic bí ẩn

Bài tập 1.88 Viết truth table cho function gate Hình 1.52, ba input A, B, C.

![fig1_52](images/ch01/fig1_52.png)

Hình 1.52 Schematic bí ẩn

Bài tập 1.89 Triển khai các gate three-input sau chỉ bằng logic gate pseudo-nMOS. Input A, B, C. Dùng ít transistor nhất.

(a) NOR gate three-input

(b) NAND gate three-input

(c) AND gate three-input

Bài tập 1.90 Resistor-Transistor Logic (RTL) dùng nMOS kéo output LOW, resistor yếu kéo HIGH khi không đường xuống ground hoạt động. NOT RTL như Hình 1.53. Phác RTL NOR three-input, dùng ít transistor nhất.

![fig1_53](images/ch01/fig1_53.png)

Hình 1.53 RTL NOT gate

## Câu hỏi phỏng vấn

Các câu này từng xuất hiện khi phỏng vấn việc digital design.

Câu hỏi 1.1 Phác circuit transistor-level cho CMOS NOR four-input.

Câu hỏi 1.2 Vua nhận 64 đồng vàng tiền thuế nhưng nghi một đồng giả. Ông gọi bạn tìm đồng giả. Bạn có cân hai đĩa đặt đồng mỗi bên. Cần cân bao nhiêu lần để tìm đồng giả nhẹ hơn?

Câu hỏi 1.3 Giáo sư, trợ giảng, sinh viên digital design và tân sinh viên ngôi sao chạy bộ cần qua cầu ọp ẹp đêm tối. Cầu chỉ chịu hai người mỗi lượt. Chỉ có một đèn pin, cầu quá dài để ném nên phải có người mang trở lại. Ngôi sao chạy qua trong 1 phút, sinh viên digital design 2 phút, trợ giảng 5 phút, giáo sư hay phân tâm mất 10 phút. Thời gian nhanh nhất để mọi người qua cầu?

[^1]: 1 μm = 1 micron = 10<sup>−6</sup> m.
