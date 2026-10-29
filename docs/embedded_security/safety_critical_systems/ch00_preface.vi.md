<a id="pix"></a>

<a id="preface1"></a>

# Lời nói đầu

Tôi viết cuốn sách này cho những người thiết kế, hiện thực và kiểm chứng hệ thống, những người có kinh nghiệm trong phát triển phần mềm nhúng nói chung nhưng đang đứng trước viễn cảnh phải bàn giao một ứng dụng safety-critical. Cụ thể, cuốn sách hướng tới những người đang tạo ra một sản phẩm phải thỏa mãn một hoặc nhiều tiêu chuẩn quốc tế liên quan đến các ứng dụng safety-critical.

## Phần mềm và an toàn

Giới truyền thông dường như rất thích mô tả những máy xạ trị đã chiếu sai liều cho bệnh nhân, những chiếc ô tô tăng tốc mất kiểm soát, những tên lửa phải bị phá hủy vì một dấu phẩy bị thiếu trong code FORTRAN,<a id="fn2_1apreface1b"></a>[<sup>1</sup>](#fn2_1a) và nhiều sự cố software-induced tương tự khác.

Ít được ghi lại hơn là những lần mà, khi phần cứng đã hỏng, phần mềm lại *ngăn chặn* được một thảm họa. Một ví dụ là chiếc Airbus đã hạ cánh xuống sông Hudson, Mỹ, vào tháng Giêng năm 2009 sau khi phần cứng của các động cơ bị hỏng. Nếu phần mềm điều khiển bay không tiếp tục hoạt động, gần như chắc chắn đã có thiệt hại lớn về nhân mạng. Vì vậy, cán cân phần cứng/phần mềm không hoàn toàn one-sided.

Tôi hy vọng cuốn sách này cung cấp cho bạn một số ý tưởng giúp tăng tỷ lệ những sự cố mà phần mềm đã cứu vãn tình thế.

## Tài liệu tham khảo

Tôi đã liệt kê các tài liệu tham khảo để đọc thêm ở cuối mỗi chương. Với một vài ngoại lệ có phần ngẫu hứng (ví dụ, bài báo năm 1834 của Lardner về lập trình đa dạng (diverse programming) và bài báo năm 1837 của Babbage về máy tính toán), tôi chỉ đưa vào những nguồn mà bản thân tôi thấy hữu ích khi phát triển phần mềm. Tôi tin rằng mọi bài báo tôi tham chiếu đều có thể được tải xuống miễn phí (và hợp pháp) từ Internet. Trong một số trường hợp, ví dụ bài báo gốc năm 1960 của Kálmán mà [Chương 11](ch11_error_detection_and_handling.vi.md) có nhắc đến, bạn có lựa chọn hoặc trả tiền cho tạp chí gốc để lấy bài báo, hoặc vào website của cơ sở giáo dục liên quan và tải nó xuống miễn phí.

<a id="fn2_1a"></a>

[<sup>1</sup>](#fn2_1apreface1b)Được gán cho nhiều tàu vũ trụ khác nhau, khi thì Mariner, khi thì Mercury.

Tôi thường xuyên nhắc đến nhiều tiêu chuẩn quốc tế khác nhau. Các tiêu chuẩn này liên tục được sửa đổi và, khi tôi tham chiếu đến một tiêu chuẩn, ý tôi là các phiên bản sau:

| Tiêu chuẩn | Tên | Năm |
|---|---|---|
| DO-333 | Formal Methods Supplement to DO-178C and DO-278A | 2011 |
| EN 50126-2 | Railway Applications — The specification | 2017 |
|  | and demonstration of RAMS |  |
| EN 50716 | Railway Applications — Requirements for | 2023 |
|  | software development |  |
| IEC 61508 | Functional safety of electrical/electronic/ | Xem bên dưới |
|  | programmable electronic safety-related systems |  |
| IEC TS 61508-3-1 | Reuse of pre-existing software elements | 2016 |
|  | to implement all or part of a safety function |  |
| IEC TS 61508-3-2 | Requirements and guidance in the use of | 2024 |
|  | mathematical and logical techniques for |  |
|  | establishing exact properties of software |  |
|  | and its documentation |  |
| IEC 61882 | Hazard and operability studies — Application Guide | 2016 |
| IEC 62304 | Medical device software — Software life cycle processes | 2006 |
| IEEE 754 | Standard for Floating-Point Arithmetic | 2019 |
| IEEE 24765 | Systems and software engineering — Vocabulary | 2017 |
| ISO 14971 | Medical devices — Application of risk | 2019 |
|  | management to medical devices (and A11 2021) |  |
| ISO 21448 | Road vehicles — Safety of the intended functionality | 2022 |
| ISO 26262 | Road vehicles — Functional safety | 2018 |
| ISO 29119-1 | Software and systems engineering — Software testing | 2022 |
| ISO/PAS 8800 | Road vehicles — Safety and artificial intelligence | 2024 |
| ISO/PAS 8926 | Road vehicles — Functional safety: Use of | 2024 |
|  | pre-existing software architectural elements |  |
| UL 4600 | Standard for evaluation of Autonomous Products | 2023 |

Vào lúc tôi đang viết những dòng này, phiên bản thứ ba của IEC 61508 chỉ còn vài tháng nữa là được phát hành. Tôi tham chiếu IEC 61508 204 lần trong cuốn sách này và đã cân nhắc ba lựa chọn:

1. Tiếp tục dùng phiên bản 2010 của tiêu chuẩn.
2. Hoãn phiên bản này của cuốn sách cho đến khi phiên bản mới của tiêu chuẩn xuất hiện.
3. Dự đoán những gì sẽ có trong phiên bản mới của tiêu chuẩn.

Tôi cảm thấy lựa chọn 1 sẽ khiến cuốn sách này lỗi thời rất nhanh, nên đã loại bỏ nó.

Mọi thứ trong lĩnh vực phần mềm safety-critical đang thay đổi nhanh đến mức tôi không muốn trì hoãn, nên tôi đã loại bỏ lựa chọn 2.

Chỉ còn lại lựa chọn 3. Tôi là thành viên của mirror committee của Standards Council of Canada cho tiêu chuẩn IEC 61508, có quyền truy cập các bản nháp của phiên bản mới. Tôi đã sử dụng bản “Committee Draft for Vote” (CDV) và, trừ khi tôi nói rõ là IEC 61508:2010 (có kèm năm), các tham chiếu đều là tới những gì nhiều khả năng sẽ có trong phiên bản thứ ba. Khó có khả năng sẽ có những thay đổi kỹ thuật đáng kể đối với bản CDV trước khi phát hành, nhưng nếu có, tôi xin lỗi vì sự nhầm lẫn. Cụ thể, tôi có thể tham chiếu mục B.3.4.5 của tiêu chuẩn và, vào lúc nó được xuất bản, mục đó có thể đã chuyển sang mục B.3.4.6.

## Công cụ

Tôi đã dùng C và Rust cho các ví dụ code, vì vậy một chút kiến thức về các ngôn ngữ đó sẽ hữu ích, nhưng các ví dụ đều ngắn và những lập trình viên quen với bất kỳ ngôn ngữ lập trình nào cũng có thể đọc được.

Đây đó tôi có nhắc đến một công cụ cụ thể. Nhìn chung, tôi nhắc đến các công cụ open-source, không phải vì chúng luôn vượt trội so với các sản phẩm thương mại tương đương, mà vì sẽ không phù hợp nếu nhắc đến nhà cung cấp thương mại này thay vì nhà cung cấp khác trừ khi tôi đã tiến hành so sánh cẩn thận các sản phẩm cạnh tranh.

## Cách viết số

Phiên bản thứ ba của IEC 61508 đã tuân theo chỉ thị IEC/ISO về cách biểu diễn các con số.<a id="fn2_2apreface1b"></a>[<sup>2</sup>](#fn2_2a) Theo chỉ thị đó:

1. phải dùng dấu phẩy làm dấu phân cách thập phân, và
2. phải dùng dấu cách để phân tách từng nhóm ba chữ số ở cả hai phía của dấu phân cách thập phân.

Trong các phiên bản trước của cuốn sách này, tôi đã dùng quy ước dùng dấu chấm làm dấu phân cách thập phân và dấu phẩy để phân tách hàng nghìn. Trong phiên bản này, tôi đã tuân theo chỉ thị IEC/ISO. Vì vậy, trong cuốn sách này (cũng như trong IEC 61508):

|  |  |
|---|---|
| 12 345 | nghĩa là mười hai nghìn ba trăm bốn mươi lăm |
| 12,5 | nghĩa là mười hai rưỡi |
| $2 , 333 \; 33$ | nghĩa là một số rất gần với hai và một phần ba |

Cũng theo chỉ thị đó, tôi viết năm không có dấu phân cách (2026 chứ không phải 2 026). Tôi dùng dấu chấm làm dấu phân cách thập phân trong chương trình và không đặt dấu phân cách hàng nghìn trong tên các tiêu chuẩn (vì vậy, ISO 26262 chứ không phải ISO 26 262).

<a id="fn2_2a"></a>

[<sup>2</sup>](#fn2_2apreface1b)Có thể lấy miễn phí tại [http://www.iso.ch/sdis/directives](http://www.iso.ch/sdis/directives)

<a id="pxii"></a>Lưu ý rằng một số sơ đồ trong cuốn sách này hiển thị output của nhiều công cụ khác nhau, và hầu hết các công cụ này dùng dấu chấm làm dấu phân cách thập phân. Ví dụ, [Hình 17.9](ch17_semi_formal_verification.vi.md#fig17_9) ở trang 214 đưa ra output của một công cụ Petri net và các con số được hiển thị với dấu chấm làm dấu phân cách. Tôi không nghĩ rằng các hình này gây ra sự mơ hồ nào.

## Phiên bản thứ ba của cuốn sách này

Phiên bản đầu tiên của cuốn sách này ra đời năm 2015, và thế giới phần mềm nhúng safety-critical đã thay đổi đáng kể kể từ đó. Phiên bản thứ hai ra đời năm 2020 và tốc độ thay đổi tiếp tục tăng lên. Khi chuẩn bị phiên bản thứ ba này, tôi nhận thức được rằng:

- SOTIF, Safety of the Intended Functionality, ngày càng trở nên quan trọng. Cụ thể, việc nhấn mạnh vào ước lượng tỷ lệ hỏng hóc (failure rate) ít quan trọng hơn vì hầu hết các tình huống nguy hiểm xảy ra khi không có gì bị hỏng.
- UL 4600 đã tạo ra một tiền lệ mới trong các tiêu chuẩn goal-based: xem [Mục 3.7.2](ch03_safety_standards_and_certification.vi.md#sec3_7_2). ISO/PAS 8800 cũng mang màu sắc goal-based và vì vậy tôi càng tin chắc hơn rằng đây là hướng đi đúng đắn.
- Goal-Structuring Notation (GSN) đã được cập nhật để hỗ trợ sự nghi ngờ (doubt) trong một lập luận Safety Case.
- machine learning đã trở nên phổ biến hơn nữa.
- Rust đang trở thành một ngôn ngữ được lựa chọn cho các hệ thống safety-critical. Vào thời điểm viết sách, Safety-Critical Rust Consortium đang làm việc *“để hỗ trợ việc sử dụng có trách nhiệm ngôn ngữ lập trình Rust trong phần mềm safety-critical.”* Ngôn ngữ D đã không trở thành xu hướng chủ đạo như tôi đã dự đoán trong các phiên bản trước của cuốn sách này.
- phiên bản thứ ba của IEC 61508 sắp được phát hành.

## Lời cảm ơn

Phiên bản 1 của cuốn sách này phát triển từ một khóa đào tạo three-day mà tôi đã giảng dạy khi còn là nhân viên QNX cho các công ty xây dựng hệ thống phần mềm nhúng cho ô tô, xe tải hạng nặng, thiết bị y tế, hệ thống đường sắt, hệ thống tự động hóa công nghiệp, v.v. Tôi biết ơn ban quản lý QNX, đặc biệt là những người quản lý trực tiếp của tôi, Jeff Baker và Adam Mallory, vì đã cho tôi không gian để phát triển nhiều ý tưởng của mình, và vì đã cho phép tôi dùng tài liệu đào tạo của mình làm nền tảng cho cuốn sách này.

<a id="pxiii"></a>Có nhiều người mà tôi cần cảm ơn vì đã cung cấp cho tôi các ý tưởng và thách thức. Trong số đó có (theo thứ tự bảng chữ cái) Dave Banham, Ernst Munter, Jeff Baker, John Bell, John Hudepohl, Martin Lloyd, Mike Parsons, Patrick Lee, Peter Bernard Ladkin, Rob Paterson, Will Snipes và Yi Zheng.

Tôi cũng cảm ơn vợ tôi, Alison, người đã đọc từng chữ với cây bút chì trong tay. Tôi không thể đếm được cô ấy đã dùng mòn bao nhiêu cây bút chì để đưa cuốn sách này về một hình hài mà cô ấy thấy chấp nhận được. Tôi cảm ơn cô ấy và Alex Woolliams vì đã proof-reading, và Elva Nilsen vì những hiểu biết sâu sắc của cô ấy về quy trình công nhận (accreditation).

## Về tác giả

Ở một mức độ nào đó, tôi đã được định hình bởi ba sự kiện.

Sự kiện đầu tiên tôi có thể xác định ngày chính xác: tôi về nhà từ trường đại học sau khi hoàn thành học kỳ đầu tiên của năm nhất một khóa đại học về toán thuần túy. Trước khi rời trường đi nghỉ, tôi đã vớ ngẫu nhiên một cuốn sách trên kệ trong phòng sinh hoạt chung của khoa toán. Tôi mở nó vào đêm Giáng sinh và lần đầu tiên gặp các kết quả bất toàn (incompleteness) của Kurt Gödel. Những kết quả này không được dạy ở trường trung học, và sức mạnh trí tuệ trong lập luận của Gödel giáng vào tôi như một cỗ xe khổng lồ. Tôi quay lại trường sau kỳ nghỉ với quyết tâm học loại toán học này và đã có cơ hội tuyệt vời được dự các buổi tutorial của Imre Lakatos tại London School of Economics. Ngay cả bây giờ, khi tôi đã biết nhiều hơn về bối cảnh của các kết quả của Gödel, tôi vẫn nghĩ rằng chúng là đỉnh cao của sự sáng tạo trí tuệ trong thế kỷ 20.

Sự kiện gần đây nhất là vào năm 2002 khi, nhất thời hứng lên, tôi quyết định học 24 bài hát tạo nên song cycle *Winterreise* của Franz Schubert. Hai mươi ba năm sau, tôi vẫn đang luyện chúng với Alison đệm đàn, và, thỉnh thoảng, cảm thấy như mình đã nhấc được một cái nắp và được phép nhìn trộm vào chiều sâu cảm xúc mênh mông của chúng.

Sự kiện ở giữa liên quan trực tiếp hơn đến cuốn sách này và được kể lại trong [Giai thoại 1](ch01_introduction.vi.md#aned1) ở trang 4. Sự kiện này đã truyền cảm hứng cho tôi nghiên cứu việc phát triển phần mềm cho các hệ thống safety-critical.

Có vẻ lạ khi liên kết các kết quả của Gödel, phần mềm safety-critical và *Winterreise,* nhưng tôi cảm thấy mỗi thứ đều đại diện cho một thách thức trí tuệ first-rank.

**Chris Hobbs**
