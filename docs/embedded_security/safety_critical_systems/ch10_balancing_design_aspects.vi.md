<a id="p109"></a>

<a id="chapter10"></a>

# 10 Cân bằng các khía cạnh thiết kế

DOI: [10.1201/9781003598145-10](https://doi.org/10.1201/9781003598145-10)

> *Điều cốt lõi đối với các nhà toán học là architecture phải đúng. Trong tất cả những gì tôi đã làm về toán học, điểm mấu chốt là tìm ra architecture đúng. Nó giống như xây một cây cầu. Một khi các đường nét chính của kết cấu đã đúng, thì các chi tiết sẽ khớp vào một cách kỳ diệu. Vấn đề nằm ở thiết kế tổng thể.*
>
> Freeman Dyson

Các chương trong phần này của cuốn sách mô tả một số pattern về architecture và thiết kế. Các pattern chính được mô tả là:

- những pattern hữu ích cho việc phát hiện lỗi, bao gồm phát hiện bất thường (anomaly detection). Chúng được trình bày trong [Chương 11](ch11_error_detection_and_handling.vi.md).
- những pattern để xử lý lỗi nếu chúng xảy ra; xem [Chương 12](ch12_expecting_the_unexpected.vi.md).
- những pattern cho replication và diversification, bao gồm pattern “safety bag” hay diverse monitor; xem [Mục 13.7](ch13_replication_and_diversification.vi.md#sec13_7).

Việc chọn các pattern phù hợp đồng nghĩa với việc thừa nhận rằng nhiều đặc tính của một hệ thống kéo ngược chiều nhau — nhà thiết kế thỏa mãn đặc tính này bằng cái giá của đặc tính khác. Trade-offs cần được tính đến một cách có ý thức và các lý lẽ biện minh cần được ghi lại.

Tài liệu tham khảo [<a id="b10refbib10_1"></a>[1](#refbib10_1)] mà tôi viết cùng Akramul Azim đưa ra một số ví dụ về những sự giằng co này và chỉ ra sự khan hiếm các công cụ có sẵn để giúp một nhà phân tích giải quyết chúng.

<a id="sec10_1"></a>

## 10.1 Cân bằng availability/reliability

Sự phân biệt giữa availability và reliability được mô tả trong [Mục 2.1.6](ch02_terminology_of_safety.vi.md#sec2_1_6). Tóm lại, “available” nghĩa là server phản hồi kịp thời, còn “reliable” nghĩa là phản hồi của server là đúng.

Có thể nghĩ đến những hệ thống mà an toàn được duy trì nhờ reliability cao và những hệ thống khác mà an toàn đòi hỏi availability cao. Các hệ thống hoạt động ở chế độ offline thuộc loại thứ nhất. Đối với một thiết bị y tế tự động phân tích mẫu máu <a id="p110"></a>và nước tiểu của bệnh nhân trong phòng thí nghiệm, cách xa bệnh nhân thực tế, reliability sẽ quan trọng hơn availability. Nếu thiết bị thỉnh thoảng hỏng hoàn toàn, điều này sẽ gây bực bội và đặt thiết bị vào thế bất lợi về thương mại, nhưng nó sẽ không trực tiếp gây nguy hiểm cho bệnh nhân. Nếu nó không đáng tin cậy và cho ra kết quả sai, đặc biệt là false negative,<a id="fn10_110b"></a>[<sup>1</sup>](#fn10_1) thì điều này rất có thể gây nguy hiểm cho bệnh nhân.

Đối với nhiều hệ thống cung cấp functional safety, sự không đáng tin cậy thỉnh thoảng có thể được chấp nhận, trong khi sự không sẵn sàng thì nguy hiểm. Điều này đặc biệt đúng với các hệ thống cần hoạt động liên tục và có dùng các thuật toán self-correcting để giảm khả năng xảy ra tình huống nguy hiểm. Kalman filter — xem [Mục 11.3.5](ch11_error_detection_and_handling.vi.md#sec11_3_5) — là một ví dụ về thuật toán như vậy. Nếu thỉnh thoảng có giá trị không đáng tin cậy, chúng sẽ dần dần bị loại ra khỏi thuật toán theo thời gian mà không gây ra tình trạng nguy hiểm nào. Trong trường hợp này, sự không đáng tin cậy có thể được chấp nhận, trong khi sự không sẵn sàng thì không thể chấp nhận.

> Giai thoại 14 *Khi tôi bắt đầu làm việc với một công ty về thiết kế một thiết bị safety-critical, những câu hỏi đầu tiên tôi thường đặt ra là, “Nó hỏng thường xuyên đến mức nào thì chấp nhận được?” và “Cái nào quan trọng hơn: availability hay reliability của hệ thống?”*
>
> *Những câu trả lời ban đầu thường là “nó không bao giờ được hỏng” và “nó phải sẵn sàng 100% thời gian và phải đáng tin cậy 100%.”*
>
> *Đó không phải là những câu trả lời hữu ích.*

Việc cần có sự cân bằng giữa availability và reliability đặc biệt rõ ràng khi replication hoặc diversification được dùng trong architecture (xem [Chương 13](ch13_replication_and_diversification.vi.md)). Đưa cùng một thông tin cho hai subsystem có thể cải thiện reliability của kết quả nếu hai output được so sánh. Tuy nhiên, thiết kế two-out-of-two (2oo2) này làm giảm availability của hệ thống vì failure của bất kỳ subsystem nào cũng khiến toàn bộ hệ thống không hoạt động được. Nếu, thay vì so sánh cả hai output, output sẵn có đầu tiên được chấp nhận, thì availability của hệ thống tăng lên, nhưng reliability giảm đi.

Trong một số hệ thống, tầm quan trọng tương đối của availability và reliability có thể thay đổi động. Đối với một chiếc ô tô trên đường cao tốc ướt đang chạy 180 km/h, không rõ hành động an toàn nào có thể được thực hiện trong trường hợp hệ thống gặp vấn đề — phanh gấp có thể không an toàn. Trong trường hợp này, availability của hệ thống điều khiển có thể quan trọng hơn reliability. Tuy nhiên, khi cùng chiếc xe đó vào thành phố và giảm tốc xuống 50 km/h, reliability trong việc phát hiện người đi bộ, người đi xe đạp, v.v. có thể trở nên quan trọng hơn nhiều so với availability — thông thường dừng lại vẫn tốt hơn là lao vào một tình huống không chắc chắn.

<a id="fn10_1"></a>

[<sup>1</sup>](#fn10_110b)Chỉ ra rằng mẫu không có dấu hiệu bệnh trong khi thực tế là có.

<a id="sec10_2"></a>

<a id="p111"></a>

## 10.2 <a id="p111"></a>Cân bằng tính hữu dụng/an toàn

Tôi cố ý dùng thuật ngữ “usefulness” (tính hữu dụng) trong mục này để tránh làm quá tải thuật ngữ “availability,” vốn có lẽ sẽ là một từ quen thuộc hơn. Hãy xét một thiết bị tự động dừng một đoàn tàu khi một sự kiện nào đó xảy ra. Nếu, do một fault trong thiết bị, nó dừng đoàn tàu một cách không cần thiết, thiết bị vẫn có thể được coi là “available” vì nó đã chủ động giữ cho đoàn tàu an toàn. Tuy nhiên, đoàn tàu bị dừng không cần thiết thì không hữu dụng.

> Giai thoại 15 *Tôi thấy rằng đối với nhiều hệ thống, có những yêu cầu chi tiết về an toàn hệ thống, nhưng có ít hoặc không có yêu cầu nào về tính hữu dụng của hệ thống. Trong trường hợp này, tôi đề xuất rằng hệ thống được giữ ở trạng thái an toàn của nó vĩnh viễn (đoàn tàu không bao giờ chạy, máy bay không bao giờ cất cánh, v.v.). Điều này gây ra những tiếng phản đối ầm ĩ, nhưng tôi khẳng định rằng hệ thống thu được đáp ứng các yêu cầu được giao cho nhóm kỹ thuật.*
>
> *Bài học là, trước khi có thể cân bằng an toàn với tính hữu dụng, chúng ta cần có yêu cầu cho cả hai.*

Xây dựng một hệ thống rất an toàn là việc dễ đến tầm thường. Một đoàn tàu không bao giờ chạy là an toàn tuyệt đối, một máy bay không cất cánh là an toàn, đèn giao thông lúc nào cũng đỏ là an toàn, ít nhất cho đến khi người lái xe mất kiên nhẫn và bắt đầu phớt lờ chúng.

Sự cân bằng cần đạt được là giữa tính hữu dụng và an toàn, và đây là chỗ một hệ thống có reliability cao (ví dụ, 2oo2) có thể trở nên không thể chấp nhận được. Khái niệm “design safe state” được thảo luận trong [Mục 12.1](ch12_expecting_the_unexpected.vi.md#sec12_1) ở trang 138: đó là trạng thái mà hệ thống được thiết kế để chuyển sang nếu nó gặp một tình huống mà nó không được thiết kế để xử lý. Một thiết bị chuyển sang design safe state của nó thường trở nên vô dụng; tệ hơn là nó đặt áp lực lên hệ thống lớn hơn (môi trường của nó) mà nó được tích hợp vào. Điều này đặc biệt nguy hiểm khi hệ thống lớn hơn là một “accidental system” thuộc loại được mô tả ở trang 20. Trong trường hợp đó, ảnh hưởng của việc chuyển sang design safe state là không thể dự đoán.

Ngay cả khi việc thiết bị chuyển sang design safe state được hệ thống lớn hơn chấp nhận, việc chuyển này có lẽ chỉ thỉnh thoảng xảy ra và vì vậy có thể chưa được well-proven. Đặc biệt, đối với các hệ thống có người vận hành tham gia, việc thiết bị thường xuyên chuyển sang design safe state có thể khiến người vận hành bắt đầu lách qua các biện pháp an toàn: chèn cho các khóa liên động mở, v.v.

Vì những lý do này, sự cân bằng giữa khả năng sử dụng và an toàn cần được xem xét cẩn thận; thực tế có bốn trạng thái của hệ thống như được liệt kê trong <a id="b10tbl10_1"></a>[Bảng 10.1](#tbl10_1).

<a id="tbl10_1"></a>

<a id="tbl10_1"></a>*Bảng 10.1 Các trạng thái hệ thống[⏎](#b10tbl10_1)*

| Trạng thái | An toàn? | Hữu dụng? | Áp lực |  |
|---|---|---|---|---|
|  |  |  |  | **lên bên ngoài?** |
| A | Đang hoạt động, không có tình trạng nguy hiểm | Y | Y | N |
| B | Trạng thái an toàn, không có tình trạng nguy hiểm | Y | N | Y |
| C | Đang hoạt động, có tình trạng nguy hiểm | N | N | Y |
| D | Trạng thái an toàn, có tình trạng nguy hiểm | Y | N | Y |

Trạng thái A, hy vọng là, chế độ hoạt động bình thường của thiết bị: không có tình trạng nguy hiểm và hệ thống đang hoạt động. Trạng thái B xảy ra khi hệ thống chuyển sang design safe state vì nó tin rằng có một tình trạng nguy hiểm trong khi thực tế không có. Ở trạng thái B, hệ thống an toàn, nhưng vô dụng. Trạng thái C là tình huống đáng lo nhất; trạng thái này xảy ra khi hệ thống không chuyển sang design <a id="p112"></a>safe state khi có một tình trạng nguy hiểm xảy ra. Trạng thái D xảy ra khi tình trạng nguy hiểm được phát hiện và thiết bị chuyển đúng sang design safe state của nó.

Lưu ý rằng hệ thống chỉ hữu dụng ở một trong bốn trạng thái, trong khi nó an toàn ở ba trạng thái. Hệ thống 2oo2 đáng tin cậy được mô tả ở trên có thể chuyển sang trạng thái B quá thường xuyên đến mức khách hàng không chấp nhận được nếu chức năng của nó quá hair-triggered, chuyển sang design safe state bất cứ khi nào có một sự bất đồng thoáng qua giữa hai subsystem.

Sau phân tích khả năng sử dụng, nếu có cơ hội như vậy, có thể cho phép một trong các subsystem khởi động lại và đồng bộ lại sau một sự bất đồng giữa hai bộ xử lý. Nếu việc này có thể được thực hiện nhanh, nó có thể không làm suy yếu sự an toàn của hệ thống. Trong khoảng, chẳng hạn, 100 ms, một đoàn tàu high-speed di chuyển 10 mét và một thiết bị drug-dispensing giải phóng 3 $μ l$ thuốc. Nếu một trong các subsystem có thể lặp lại phép tính trong khoảng thời gian đó, thì từ góc độ an toàn, có thể tốt hơn nếu cho phép nó làm vậy, vì các hệ thống chuyển sang design safe state quá dễ dàng tự chúng có thể là một hazard. Đây là điều cần được xử lý trong hazard and risk analysis và trong failure analysis.

<a id="sec10_3"></a>

## 10.3 Cân bằng bảo mật/hiệu năng/an toàn

Chủ đề bảo mật đã trở nên đan xen với chủ đề an toàn. Trước đây, hầu hết các hệ thống cung cấp functional safety được giữ an toàn bằng sự cách ly vật lý — chúng được khóa về mặt vật lý trong buồng lái của một đoàn tàu, hoặc trong một electronic control unit (ECU) nhúng trong ô tô hay phòng mổ của bệnh viện.

Tình trạng ngây thơ này đã thay đổi nhanh chóng, và ngày nay hầu như mọi thiết bị đều cung cấp nhiều điểm xâm nhập cho một kẻ tấn công độc hại. Cổng USB, bàn phím người vận hành, Wi-Fi, Bluetooth, và, trong ô tô, ngay cả các kết nối áp suất lốp không dây và công cụ bảo trì đều cung cấp các điểm truy cập trực tiếp cho kẻ tấn công. Việc dựa vào tính toàn vẹn của các tín hiệu bên ngoài, như hệ thống định vị toàn cầu (GPS) và hệ thống thông tin di động toàn cầu (GSM), tạo ra các bề mặt tấn công cho việc gây nhiễu hoặc giả mạo.

Báo chí và các bài báo nghiên cứu đang đưa tin về các hệ thống trong ô tô bị những hacker bên đường chiếm quyền điều khiển. Xem, ví dụ, tài liệu tham khảo [<a id="b10refbib10_2"></a>[2](#refbib10_2)] của Sam Curry. Có lẽ <a id="p113"></a>ví dụ đầu tiên về một hacker gây ra tình huống không an toàn là vụ tấn công vào hệ thống quản lý chất thải được vi tính hóa của Maroochy Shire, Queensland năm 2000, khiến hàng triệu lít nước thải thô tràn ra các công viên và sông ngòi địa phương.

Khi giao tiếp vehicle-to-vehicle (V2V) và vehicle-to-infrastructure (V2I) trở nên phổ biến để tránh va chạm, thậm chí sẽ có nhiều bề mặt tấn công hơn được mở ra. Ngoài ra, khi phần mềm trong xe trở nên phức tạp hơn, các bản cập nhật phần mềm phải được phát hành ngày càng thường xuyên hơn, và mỗi bản cập nhật phần mềm đòi hỏi phải mở một cổng nào đó vào thiết bị. Tài liệu tham khảo [<a id="b10refbib10_3"></a>[3](#refbib10_3)] của Simon Burton *et al.* nhận diện bốn điểm tấn công chính vào hệ thống cảnh báo chệch làn đường của ô tô và nhắc nhở các nhà phát triển rằng các mối đe dọa bảo mật cần được đưa vào hazard and risk analysis và safety case của sản phẩm.

Tài liệu tham khảo [<a id="b10refbib10_4"></a>[4](#refbib10_4)] của Harold Thimbleby nắm bắt rất tốt sự giằng co giữa khả năng sử dụng, bảo mật và an toàn:

- *Khả năng sử dụng (usability) là làm cho hệ thống dễ dùng đối với mọi người.*
- *Bảo mật là làm cho hệ thống dễ dùng đối với những người được chỉ định và rất khó (nếu không nói là không thể) đối với mọi người khác.*
- *An toàn là ngăn những người đúng làm những điều xấu. Người tốt cũng có lúc sơ suất và mắc lỗi; trong một hệ thống an toàn, những lỗi đó không nên leo thang thành các sự cố đáng tiếc, tổn hại hoặc các vấn đề an toàn khác.*

*Những định nghĩa đơn giản và tương phản rõ nét này lập tức làm nảy sinh những sự giằng co. Một hệ thống bảo mật có thể không dễ dùng lắm. Đến lượt mình, điều này sẽ khuyến khích người dùng tìm các work-arounds để việc sử dụng hệ thống hằng ngày của họ ‘thân thiện với người dùng’ hơn. Vì vậy, một hệ thống bệnh viện có thể rốt cuộc là mọi người dùng chung một mật khẩu, vì việc này dễ hơn nhiều so với nhớ các mật khẩu riêng và đăng nhập, đăng xuất liên tục.*

Dĩ nhiên, nhận xét cuối cùng của Thimbleby, về việc con người tìm các work-arounds cho những tính năng an toàn hay bảo mật bất tiện, cũng áp dụng bên ngoài bệnh viện. Ví dụ, xe Tesla có các cảm biến chuyển động mắt và cảm biến vô lăng để bảo đảm rằng người lái đang ‘tập trung’ để chiếc xe có thể trao lại quyền điều khiển cho người lái trong một tình huống nguy hiểm. Kính râm có vẻ có thể vô hiệu hóa cảm biến chuyển động mắt và có thể mua những chiếc kẹp đặc biệt trên internet để đánh lừa các cảm biến vô lăng — lách qua tính năng an toàn.

Dễ thấy bảo mật kém có thể dẫn đến một hazard về an toàn như thế nào, nhưng một vấn đề với việc tăng cường bảo mật là nó hầu như luôn làm tổn hại hiệu năng hệ thống. Nếu một database được mã hóa để cải thiện bảo mật, nó sẽ mất nhiều thời gian hơn để truy cập; nếu một mật khẩu mạnh được áp đặt trên giao diện người vận hành của một thiết bị y tế, nó sẽ làm chậm việc truy cập.

Hiệu năng không phải là thứ có thể từ bỏ một cách nhẹ nhàng. Các quy định đòi hỏi camera reverse-facing trên ô tô phải sẵn sàng trong vòng vài trăm mili giây kể từ khi các hệ thống của xe được bật. Điều này có thể loại trừ một quá trình secure boot hoặc việc kiểm tra chữ ký trên software image lúc khởi động, qua đó làm giảm bảo mật của hệ thống.

Một nguồn mất an ninh không được bỏ qua là nhà phát triển có ý đồ xấu với quyền truy cập trực tiếp và hợp pháp vào source code của hệ thống. Khả năng này cần được công nhận trong hazard and risk analysis như một rủi ro tiềm tàng và cần có mitigation phù hợp để phát hiện nó. Điều này có thể khó hơn khi phần mềm được lấy từ một công ty khác hoặc từ phong trào open-source.

## 10.4 Cân bằng hiệu năng/reliability

Tăng reliability của một hệ thống thường có nghĩa là tăng chi phí sản phẩm và giảm hiệu năng vì sẽ phải dùng một dạng replication hoặc diversification nào đó — xem [Chương 13](ch13_replication_and_diversification.vi.md).

Time replication (lặp lại cùng một phép tính trên cùng phần cứng, có thể dùng recovery block hoặc coded processor) đặc biệt làm giảm hiệu năng hệ thống, nhưng các kỹ thuật khác để tăng xác suất nhận được phản hồi đúng từ hệ thống, như tắt caching trên bộ xử lý, cũng ảnh hưởng trực tiếp đến hiệu năng.

## 10.5 Cân bằng trong triển khai

Còn một sự cân bằng nữa mà người làm architecture hoặc nhà thiết kế cần xem xét. Khi các lập trình viên triển khai hệ thống, họ sẽ cần hướng dẫn về cách lập trình. Họ nên lập trình để đạt hiệu năng cao (code nhanh, tightly-knit), để dễ kiểm thử, để dễ bảo trì, để các công cụ phân tích tĩnh hoạt động hiệu quả, để phát hiện lỗi runtime hiệu quả, hay để code dễ đọc?

Những đòi hỏi này đi ngược chiều nhau. Code High-performance có khả năng kém dễ đọc hơn, kém dễ bảo trì hơn, ít có khả năng phát hiện lỗi runtime hơn và kém phù hợp với phân tích tĩnh chuyên sâu hơn so với code được viết riêng với những đặc tính đó trong đầu. Việc theo đuổi hiệu năng cao đặc biệt có thể làm giảm khả năng phát hiện lỗi runtime vì nó sẽ loại trừ việc dữ liệu được nhân bản, được lưu ở các dạng khác nhau, hoặc được bảo vệ bằng một check-sum. Việc kiểm tra những thứ này lúc runtime sẽ làm giảm hiệu năng của hệ thống.

Các lập trình viên cần biết các ưu tiên cho mỗi module họ tạo ra. Thiết kế của module A có thể chỉ định rằng nó không time-critical, và vì vậy các ưu tiên khi viết code, theo thứ tự ưu tiên, là độ bao phủ lỗi runtime, dễ kiểm thử, hiệu quả của các công cụ phân tích tĩnh, và dễ bảo trì. Module B có thể cần được lập trình để đạt tốc độ, ngay cả khi điều này có nghĩa là phải tốn nhiều công sức hơn để kiểm thử và bảo trì nó, và ngay cả khi sẽ phát hiện được ít lỗi runtime hơn.

Một khi các ưu tiên này đã được thiết lập cho mỗi module, các đặc tính thu được có thể được đưa vào failure model của hệ thống.

Trong thực tế, việc khiến các lập trình viên chú ý đến các ưu tiên đã được phân bổ có thể khó khăn — một số lập trình viên muốn làm anh hùng và khăng khăng viết code để đạt hiệu năng cao, bất kể thứ tự ưu tiên của các đặc tính khác. Một vấn đề khác phát sinh khi phát hiện ra rằng sự cân bằng phải thay đổi, thường là trong quá trình kiểm thử tích hợp. Ví dụ, kiểm thử tích hợp có thể phát hiện rằng một module mà lúc thiết kế không được cho là cần hiệu năng cao, lại cần hiệu năng đó. Điều này có thể đòi hỏi làm lại, không chỉ phần thiết kế, mà còn cả phần triển khai.

## 10.6 Tóm tắt

Việc thiết kế và triển khai bất kỳ hệ thống nào, nhưng đặc biệt là một hệ thống nhúng được thiết kế cho một ứng dụng safety-critical, đều phải chịu những sự cân bằng và đánh đổi. Một danh sách dài các yếu tố phải được cân bằng, bao gồm an toàn, hiệu năng, bảo mật, khả năng sử dụng, availability và reliability. Việc phân tích những yếu tố này nên được thực hiện một cách tường minh và mọi quyết định được đưa ra nên được ghi lại. Điều này cho phép những quyết định đó được xem xét lại dựa trên kinh nghiệm.

## Tài liệu tham khảo

<a id="refbib10_1"></a>[1] C. Hobbs and A. Azim, “Balancing Safety, Security, Functionality and Performance,” in *2013 Safety Critical Systems Symposium*, SSS ‘13, (Bristol, UK), Safety-Critical Systems Club, 2013.[⏎](#b10refbib10_1)

<a id="refbib10_2"></a>[2] Sam Curry, “Web Hackers vs. The Auto Industry: Critical Vulnerabilities in Ferrari, BMW, Rolls Royce, Porsche, and More.” [https://samcurry.net/web-hackers-vs-the-auto-industry](https://samcurry.net/web-hackers-vs-the-auto-industry), 2023. Accessed: 2024-11-20.[⏎](#b10refbib10_2)

<a id="refbib10_3"></a>[3] S. Burton, J. Likkei, P. Vembar, and M. Wolf, “Automotive Functional Safety = Safety + Security,” in *Proceedings of the First International Conference on Security of Internet of Things*, SecurIT ‘12, (New York, NY, USA), pp. 150–159, ACM, 2012.[⏎](#b10refbib10_3)

<a id="refbib10_4"></a>[4] H. Thimbleby, “Safety versus Security in Healthcare IT,” in *Addressing Systems Safety Challenges, Proceedings of the 22nd Safety-Critical Systems Symposium* (C. Dale and T. Anderson, eds.), pp. 133–146, 2014.[⏎](#b10refbib10_4)
