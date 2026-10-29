<a id="p138"></a>

<a id="chapter12"></a>

# 12 Lường trước điều bất ngờ

DOI: [10.1201/9781003598145-12](https://doi.org/10.1201/9781003598145-12)

> *Lường trước điều bất ngờ cho thấy một trí tuệ hoàn toàn hiện đại.*
>
> Oscar Wilde

Chương này, vốn thảo luận về design safe state của hệ thống, phần nào là sự tiếp nối của chương trước về phát hiện lỗi. Theo nghĩa được dùng trong chương này, có một fault trong thiết kế cho phép hệ thống gặp phải một điều kiện không được lường trước trong quá trình thiết kế.

<a id="sec12_1"></a>

## 12.1 Design safe state

### 12.1.1 Định nghĩa design safe state

Đối với một hệ thống nhúng có các ràng buộc an toàn, chúng ta phải thừa nhận rằng phần mềm đôi khi sẽ gặp những tình huống mà nó không được thiết kế để xử lý. Những điều kiện này có thể xảy ra do sự hỏng ngẫu nhiên gây ra bởi phần cứng hoặc phần mềm (Heisenbug), hoặc có thể chỉ đơn giản là một tình huống không được lường trước trong thiết kế. Hành vi của hệ thống trong những điều kiện này phải được định nghĩa và phải được đưa vào safety manual đi kèm để nhà thiết kế của bất kỳ hệ thống lớn hơn nào tích hợp hệ thống này có thể phát hiện điều kiện đó và thực hiện hành động phù hợp.

Nếu một điều kiện bất ngờ xảy ra, hệ thống nên chuyển, nếu có thể, sang “design safe state” áp dụng được của nó, như được định nghĩa trong quá trình thiết kế hệ thống.

Đối với một số hệ thống, design safe state có thể hiển nhiên và không thay đổi theo thời gian. Đèn giao thông tại một giao lộ đông đúc có thể đều được đặt thành đỏ, và một hệ thống điều khiển phanh trên đoàn tàu có thể luôn đạp phanh.

Đối với các hệ thống khác, design safe state có thể không hiển nhiên như vậy và có thể thay đổi theo từng tình huống. Đối với một robot đang phẫu thuật, liệu robot chỉ đơn giản đứng yên (qua đó có thể chặn con người tiếp cận vết mổ) hay rút ra khỏi bệnh nhân (qua đó có thể gây tổn thương mô và để lại chảy máu bên trong) thì an toàn hơn?

Đối với cụm đồng hồ của ô tô, nếu phần mềm trong hệ thống đồ họa gặp một tình huống không lường trước, thì tốt nhất là làm trống màn hình, đóng băng thông tin trên màn hình, hay hiển thị thông tin hợp lý nhưng không đúng?<a id="p139"></a>

> Giai thoại 18 *Tôi từng lái xe ở tốc độ cao trên một con đường rất vắng vẻ vào một đêm tối thì bình ắc quy của xe đột nhiên hỏng, làm mất trợ lực lái và phanh, đồng thời tắt đèn pha và đèn chiếu sáng của bảng đồng hồ analogue. Thật hoảng hốt khi đột nhiên không còn bất kỳ chỉ báo nào về tốc độ của mình. Có lẽ sẽ phải thực hiện các thí nghiệm trong một simulator để xác định design safe state an toàn nhất cho một cụm đồng hồ trong các điều kiện lái xe khác nhau.*

Một ví dụ khác, hãy xét một hệ thống điều khiển phanh của ô tô như một phần của hệ thống phát hiện va chạm. Khi xe đang chạy 10 km/h trên một con đường phụ vắng vẻ, một design safe state phù hợp sẽ là đạp phanh. Ở 200 km/h trên một Autobahn đông đúc của Đức, việc đột ngột đạp phanh trên đường ướt có thể chính là điều sai lầm nhất nên làm.

Dù design safe state là gì, nó phải có ba đặc điểm:

1. Nó phải được hệ thống lớn hơn nhìn thấy từ bên ngoài một cách rõ ràng, không mơ hồ.
2. Nếu có thể, nó phải được đi vào trong một khoảng thời gian định trước, và được công bố, sau khi điều kiện được phát hiện.
3. Nó phải được ghi lại trong safety manual để nhà thiết kế sử dụng thành phần có thể đưa nó vào một thiết kế lớn hơn.

Việc lưu thông tin chẩn đoán khi đi vào design safe state cũng hữu ích để điều kiện đó có thể được điều tra. Trong một số hệ thống, đặc biệt là thiết bị y tế, việc thu thập dữ liệu chẩn đoán như vậy có thể là yêu cầu bắt buộc về mặt pháp lý.

Dù design safe state được định nghĩa tốt đến đâu, đôi khi hệ thống sẽ không thể đạt tới nó. Sự hỏng bên trong đã gây ra điều kiện bất ngờ có thể nghiêm trọng đến mức ngăn hệ thống thực hiện bất kỳ dạng hành động mạch lạc nào. Luôn có một mức phần cứng nào đó phải hoạt động đúng để cho phép ngay cả một tiến trình phần mềm đơn giản thực thi.

Việc biết design safe state của các thành phần cho phép nhà thiết kế tích hợp những thành phần đó vào một hệ thống lớn hơn lập kế hoạch tương ứng. Nếu việc chuyển sang design safe state khiến hệ thống loại bỏ input đã nhận và được giả định là đã được xử lý, thì điều này cũng phải được định nghĩa trong safety manual, để nhà thiết kế của hệ thống lớn hơn có thể xử lý điều kiện đó.

### 12.1.2 Design safe state và các tiêu chuẩn

Section 7.4 của ISO 26262-3 đề cập đến safe state của hệ thống và có câu, *“Nếu không thể đạt tới một safe state bằng một chuyển đổi trong một khoảng thời gian chấp nhận được, thì phải chỉ định một hoạt động khẩn cấp.”* Điều này có nghĩa là thời gian cần để đạt tới safe state cần được ước lượng hoặc đo và được cung cấp trong safety manual. Nhiều phần khác của ISO 26262 cũng chỉ định các yêu cầu liên quan đến design safe state. Đặc biệt, section 6 của [phần 4](part4_design_validation.vi.md) nhắc nhở các nhà thiết kế <a id="p140"></a>rằng hệ thống không chỉ phải có khả năng chuyển sang safe state của nó, mà còn phải có các cơ chế để giữ nó ở đó cho đến khi có hành động từ bên ngoài.

> Giai thoại 19 *Tôi từng làm việc với một công ty về một hệ thống phanh đường sắt. Design safe state là đạp phanh. Một khi điều này đã xảy ra, người lái không thể vô hiệu hóa nó và phải chờ đoàn tàu dừng hẳn. Sau đó người lái phải đứng dậy và đi bộ một đoạn ngược về phía sau đoàn tàu để reset hệ thống — đoàn tàu được giữ ở design safe state của nó cho đến khi có hành động từ bên ngoài.*

IEC 61508 cũng có nhiều tham chiếu đến design safe state và Annex D của [phần 3](part3_design_patterns.vi.md), vốn định nghĩa nội dung của safety manual, nói rõ rằng safety manual phải mô tả nó:

> *Design safe state: Trong một số hoàn cảnh nhất định, khi có failure có kiểm soát của ứng dụng hệ thống, element có thể trở về một design safe state. Trong những hoàn cảnh như vậy, định nghĩa chính xác của design safe state nên được chỉ định để bên tích hợp xem xét.*

### 12.1.3 Design safe state và failure nguy hiểm

Mục đích của design safe state là cung cấp cho nhà thiết kế một phương tiện để xử lý các điều kiện bất ngờ. Câu hỏi thường được đặt ra là liệu việc chuyển sang design safe state có cấu thành một failure nguy hiểm hay không và vì vậy có nên được tính đến trong việc tính failure rate cho safety integrity level (SIL) của IEC 61508 hay không.

Ví dụ, để đáp ứng các yêu cầu của SIL 3, phải chứng tỏ được tỷ lệ failure nguy hiểm nhỏ hơn ${10}^{- 7}$ failure mỗi giờ hoạt động. Nếu một hệ thống được thiết kế tồi đến mức, trung bình, cứ mỗi 1000 giờ nó lại gặp một điều kiện bất ngờ, nhưng luôn phát hiện điều kiện đó và chuyển sang design safe state của mình, thì hệ thống đó có đáp ứng các yêu cầu của SIL 3 không?

Điều này liên quan đến sự cân bằng tính hữu dụng/an toàn được thảo luận trong [Mục 10.2](ch10_balancing_design_aspects.vi.md#sec10_2). Có thể lập luận rằng, gần như theo định nghĩa, việc chuyển sang design safe state không nguy hiểm. Tuy nhiên, khi có thể, tôi đã cố gắng đưa nó vào phép tính IEC 61508 vì, mặc dù hệ thống lớn hơn nên được thiết kế để xử lý việc một thành phần chuyển sang design safe state, những lần chuyển như vậy sẽ luôn đặt áp lực lên hệ thống lớn hơn và đưa nó đến gần hơn một tình trạng nguy hiểm.

## 12.2 Phục hồi

### 12.2.1 Các kỹ thuật phục hồi

Khi phát hiện một điều kiện không lường trước, có hai hành động khả dĩ: cố gắng phục hồi hoặc chuyển thẳng sang design safe state. Việc phục hồi Software-based thường có nghĩa là thực thi các script từ một “recovery tree” có dạng:

> <a id="p141"></a>*Nếu tiến trình X báo rằng nó đã gặp một tình huống bất ngờ, thì kill các tiến trình X, Y và Z. Sau đó khởi động lại Z, chờ 200ms, khởi động lại Y, chờ cho đến khi cờ A đã được đặt, rồi khởi động lại X.*

Ý định là cố gắng bảo toàn càng nhiều trạng thái hệ thống càng tốt, hạn chế sự hỏng có thể gây ra do thông tin không hợp lệ được truyền sang một phần khác của hệ thống, rồi khởi động lại và đồng bộ lại các subsystem bị ảnh hưởng với càng ít gián đoạn system-level càng tốt.

### 12.2.2 Bạn có muốn phục hồi không?

Theo định nghĩa, bất kỳ nỗ lực nào để phục hồi từ một tình huống không lường trước đều có nghĩa là thực thi một thuật toán chưa được kiểm thử, và việc thực thi này sẽ xảy ra vào lúc trạng thái hệ thống ill-defined. Đối với nhiều hệ thống, có thể lập luận rằng việc thực thi code chưa được kiểm thử, triển khai một thuật toán chưa được kiểm thử, trên một hệ thống có trạng thái ill-defined và chắc chắn là bất ngờ, là không phù hợp cho một thiết bị safety-critical.

Khi cần phục hồi, tiến trình đang hỏng ở trong một trạng thái ill-defined mà các nhà thiết kế không lường trước. Việc phục hồi cũng đòi hỏi một mức co-operation nào đó từ tiến trình đã phát hiện ra sự không nhất quán. Mức co-operation thay đổi từ rất nhỏ (có lẽ chỉ là tránh can thiệp vào phần mềm phục hồi) đến đáng kể (báo cáo chi tiết vấn đề cho phần mềm phục hồi).

Khá thường xuyên, những nỗ lực phục hồi anh hùng như vậy nhằm tránh chuyển sang design safe state chỉ thành công *một phần*, để lại hệ thống trong một tình trạng tệ hơn so với trước đó.

Tôi chấp nhận rằng có những hệ thống mà việc phục hồi phải được thử, nhưng trong nhiều trường hợp, có thể tốt hơn nếu đi vào design safe state ngay lập tức.

### 12.2.3 Mô hình Crash-Only

Một mô hình chuyển sang design safe state là mô hình “crash-only” như được mô tả trong tài liệu tham khảo [<a id="b12refbib12_1"></a>[1](#refbib12_1)] của George Candea và Armando Fox. Như tên gọi gợi ý, khi phát hiện một điều kiện không lường trước, hệ thống chỉ đơn giản là crash. Điều này có một số ưu điểm:

- Nó chỉ dựa vào một phần nhỏ của hệ thống tiếp tục hoạt động; việc phục hồi thường phụ thuộc vào phần lớn hệ thống tiếp tục hoạt động.
- Nó định nghĩa hành vi vĩ mô đơn giản với ít trạng thái externally-visible. Điều này đơn giản hóa việc phát hiện cho hệ thống lớn hơn.
- Nó giảm thời gian ngừng hoạt động bằng cách loại bỏ gần như toàn bộ thời gian cần cho một lần tắt máy có trật tự, mặc dù vẫn có thể có lợi nếu lưu thông tin về sự kiện.
- Nó đơn giản hóa failure model bằng cách loại bỏ recovery tree.
- Nó giảm các tổ hợp failure cần kiểm chứng.

<a id="p142"></a>Có thể hữu ích nếu kết hợp mô hình crash-only với fast reboot (tài liệu tham khảo [<a id="b12refbib12_2"></a>[2](#refbib12_2)]) để giảm thiểu thời gian hệ thống không sẵn sàng. Tuy nhiên, điều này phải được kiểm soát chặt chẽ để ngăn việc khởi động lại liên tục khi gặp một lỗi phần cứng cố định.

## 12.3 Việc lường trước điều bất ngờ của các công ty ví dụ

Cả hai công ty hư cấu được giới thiệu trong [Chương 4](ch04_representative_companies.vi.md) đều cần định nghĩa một design safe state cho hệ thống của mình.

Beta Component Incorporated (BCI) đang cung cấp cho Alpha Device Corporation (ADC) một hệ điều hành, và ADC đã chỉ định trong hợp đồng rằng hệ điều hành phải được chứng nhận là phù hợp để dùng trong các thiết bị ASIL C theo ISO 26262.

Điều này có nghĩa là BCI sẽ phải cung cấp cho ADC một safety manual cho hệ điều hành, mô tả cách nó có thể được sử dụng an toàn và định nghĩa design safe state. BCI không biết thiết bị của ADC hoạt động thế nào trong ô tô, và vì vậy không thể điều chỉnh design safe state của mình theo một tình huống bên ngoài. Vì vậy, mô hình crash-only có khả năng là phù hợp.<a id="fn12_112b"></a>[<sup>1</sup>](#fn12_1)

ADC có một phân tích phức tạp hơn phải thực hiện. Chúng ta chưa định nghĩa thiết bị của ADC thực sự làm gì, nhưng ngay cả thiết bị đơn giản nhất cũng có thể đặt ra các câu hỏi về trạng thái nào có thể được coi là an toàn. Hãy xét bộ điều khiển cửa kính điện của ô tô. Khi người dùng nhấn một nút, cửa kính nên bắt đầu đóng. Nếu nó phát hiện lực cản (như tay hoặc cổ của một đứa trẻ), nó nên dừng lại. Có lẽ design safe state nên là mở cửa kính, nhưng điều đó có thể nguy hiểm trong một số tình huống: ví dụ, nếu chiếc xe đã bị lái xuống sông. ADC có thể cần thực hiện một hazard and risk analysis đầy đủ để xác định design safe state đúng cho các điều kiện khác nhau.

## 12.4 Tóm tắt

Việc định nghĩa (các) design safe state của một hệ thống hoặc thành phần không chỉ được các tiêu chuẩn yêu cầu, mà còn là một bài tập rất hữu ích để tập trung vào vai trò của nó trong thế giới thực. Việc không thể xác định design safe state khi hệ thống ở trong một tình huống cụ thể có thể cho thấy rằng các hazard và rủi ro gắn với thiết bị chưa được khám phá đầy đủ.

<a id="fn12_1"></a>

[<sup>1</sup>](#fn12_112b)Người ta đã chỉ ra rằng “crash-only” không phải là một thuật ngữ hay khi thảo luận về các hệ thống trong ô tô!

## Tài liệu tham khảo

<a id="refbib12_1"></a>[1] G. Candea and A. Fox, “Crash-only Software,” in *HOTOS'03: Proceedings of the 9th conference on Hot Topics in Operating Systems*, (Berkeley, CA, USA), pp. 12–12, USENIX Association, 2003.[⏎](#b12refbib12_1)

<a id="refbib12_2"></a>[2] G. Candea, S. Kawamoto, Y. Fujiki, A. Fox, and G. Friedman, “Microreboot — A Technique for Cheap Recovery,” 2004.[⏎](#b12refbib12_2)
