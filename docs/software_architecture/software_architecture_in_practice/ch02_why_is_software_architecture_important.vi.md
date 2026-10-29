<a id="ch02"></a>

# 2. Vì sao software architecture quan trọng? (Why Is Software Architecture Important?)

> Ôi, xây dựng, xây dựng!<br>
> Đó là nghệ thuật cao quý nhất trong mọi nghệ thuật.<br>
> —Henry Wadsworth Longfellow

Nếu architecture là câu trả lời, thì câu hỏi là gì?

Chương này tập trung vào lý do vì sao architecture quan trọng từ góc nhìn kỹ thuật. Chúng ta sẽ xem xét mười ba lý do quan trọng nhất. Bạn có thể dùng những lý do này để thúc đẩy việc tạo ra một architecture mới, hoặc việc phân tích và tiến hóa architecture của một hệ thống hiện có.

1. Một architecture có thể kìm hãm hoặc hỗ trợ các quality attribute chủ đạo của một hệ thống.
2. Các quyết định được đưa ra trong một architecture cho phép bạn suy luận về và quản lý sự thay đổi khi hệ thống tiến hóa.
3. Việc phân tích một architecture cho phép dự đoán sớm các chất lượng của một hệ thống.
4. Một architecture được tài liệu hóa giúp tăng cường giao tiếp giữa các stakeholder.
5. Architecture là vật mang những quyết định thiết kế sớm nhất, và do đó most-fundamental, hardest-to-change.
6. Một architecture định nghĩa một tập các ràng buộc đối với việc triển khai về sau.
7. Architecture quyết định cấu trúc của một tổ chức, hoặc ngược lại.
8. Một architecture có thể cung cấp cơ sở cho phát triển tăng dần (incremental development).
9. Một architecture là artifact then chốt cho phép kiến trúc sư và quản lý dự án suy luận về chi phí và tiến độ.
10. Một architecture có thể được tạo ra như một model có thể chuyển giao và tái sử dụng, tạo thành trái tim của một product line.
11. Phát triển architecture-based tập trung sự chú ý vào việc lắp ráp các component, thay vì chỉ vào việc tạo ra chúng.
12. Bằng cách hạn chế các phương án thiết kế, architecture định hướng sự sáng tạo của developer, giảm độ phức tạp của thiết kế và hệ thống.
13. Một architecture có thể là nền tảng để đào tạo một thành viên mới của team.

Ngay cả khi bạn đã tin chúng tôi rằng architecture là quan trọng và không cần điểm đó được nhấn mạnh thêm 13 lần nữa, hãy coi 13 điểm này (tạo thành dàn ý cho chương này) như 13 cách hữu ích để dùng architecture trong một dự án, hoặc để biện minh cho các nguồn lực dành cho architecture.

<a id="sec2_1"></a>

## 2.1 Kìm hãm hoặc hỗ trợ các quality attribute của một hệ thống (Inhibiting or Enabling a System’s Quality Attributes)

Khả năng của một hệ thống trong việc đáp ứng các quality attribute mong muốn (hoặc bắt buộc) phần lớn được quyết định bởi architecture của nó. Nếu bạn không nhớ được gì khác từ cuốn sách này, hãy nhớ điều đó.

Mối quan hệ này quan trọng đến mức chúng tôi đã dành toàn bộ Phần 2 của cuốn sách để trình bày chi tiết thông điệp đó. Cho đến lúc đó, hãy ghi nhớ những ví dụ sau như một điểm khởi đầu:

- Nếu hệ thống của bạn đòi hỏi performance cao, thì bạn cần chú ý đến việc quản lý hành vi time-based của các element, việc chúng sử dụng tài nguyên dùng chung, và tần suất cũng như khối lượng giao tiếp giữa các element của chúng.
- Nếu modifiability quan trọng, thì bạn cần chú ý đến việc giao trách nhiệm cho các element và hạn chế các tương tác (coupling) của các element đó sao cho phần lớn các thay đổi đối với hệ thống sẽ chỉ ảnh hưởng đến một số ít element. Lý tưởng nhất, mỗi thay đổi sẽ chỉ ảnh hưởng đến một element duy nhất.
- Nếu hệ thống của bạn phải có security cao, thì bạn cần quản lý và bảo vệ giao tiếp giữa các element và kiểm soát element nào được phép truy cập thông tin nào. Bạn cũng có thể cần đưa các element chuyên biệt (như một cơ chế authorization) vào architecture để thiết lập một “vành đai” vững chắc chống xâm nhập.
- Nếu bạn muốn hệ thống của mình safe và secure, bạn cần thiết kế sẵn các biện pháp bảo vệ và cơ chế phục hồi.
- Nếu bạn tin rằng khả năng mở rộng performance (scalability of performance) sẽ quan trọng đối với sự thành công của hệ thống, thì bạn cần khoanh vùng việc sử dụng tài nguyên để dễ dàng đưa vào các thành phần thay thế higher-capacity, và bạn phải tránh hard-coding các giả định hoặc giới hạn về tài nguyên.
- Nếu các dự án của bạn cần khả năng bàn giao các tập con tăng dần của hệ thống, thì bạn phải quản lý việc sử dụng lẫn nhau giữa các component.
- Nếu bạn muốn các element từ hệ thống của mình có thể tái sử dụng trong các hệ thống khác, thì bạn cần hạn chế coupling giữa các element sao cho khi bạn tách một element ra, nó không mang theo quá nhiều ràng buộc với môi trường hiện tại đến mức không còn hữu ích.

Các chiến lược cho những quality attribute này và các quality attribute khác mang tính architecture ở mức cao nhất. Nhưng chỉ riêng một architecture không thể bảo đảm chức năng hay chất lượng mà hệ thống đòi hỏi. Các quyết định thiết kế hoặc triển khai kém ở khâu sau luôn có thể phá hỏng một thiết kế architecture đầy đủ. Như chúng tôi hay nói (*phần lớn* là đùa): Những gì architecture ban cho, implementation có thể lấy đi. Các quyết định ở mọi giai đoạn của vòng đời—từ thiết kế architecture đến viết code, triển khai và kiểm thử—đều ảnh hưởng đến chất lượng hệ thống. Do đó, chất lượng không hoàn toàn là một hàm của thiết kế architecture. Nhưng đó là nơi nó bắt đầu.

<a id="sec2_2"></a>

## 2.2 Suy luận về và quản lý sự thay đổi (Reasoning about and Managing Change)

Đây là một hệ quả của điểm trước.

Modifiability—mức độ dễ dàng khi thực hiện các thay đổi đối với một hệ thống— là một quality attribute (và do đó được bao hàm bởi các lập luận ở mục trước), nhưng nó là một chất lượng quan trọng đến mức chúng tôi đã dành cho nó một vị trí riêng trong Danh sách Mười ba (List of Thirteen). Cộng đồng phát triển phần mềm đang dần chấp nhận thực tế rằng khoảng 80 phần trăm tổng chi phí của một hệ thống phần mềm điển hình phát sinh *sau* lần deployment đầu tiên. Hầu hết các hệ thống mà mọi người làm việc đều đang ở giai đoạn này. Nhiều lập trình viên và nhà thiết kế phần mềm *không bao giờ* được làm việc với phát triển mới—họ làm việc dưới các ràng buộc của architecture hiện có và khối code hiện có. Gần như mọi hệ thống phần mềm đều thay đổi trong suốt vòng đời của chúng, để đáp ứng các tính năng mới, để thích nghi với môi trường mới, để sửa bug, v.v. Nhưng thực tế là những thay đổi này thường đầy khó khăn.

Mọi architecture, dù là gì đi nữa, đều chia các thay đổi có thể có thành ba loại: cục bộ (local), không cục bộ (nonlocal) và thuộc architecture (architectural).

- Một thay đổi local có thể được thực hiện bằng cách sửa đổi một element duy nhất—ví dụ, thêm một business rule mới vào một module pricing logic.
- Một thay đổi nonlocal đòi hỏi sửa đổi nhiều element nhưng giữ nguyên cách tiếp cận architecture bên dưới—ví dụ, thêm một business rule mới vào một module pricing logic, sau đó thêm các trường mới vào database mà business rule mới này đòi hỏi, rồi hiển thị kết quả của việc áp dụng quy tắc trong user interface.
- Một thay đổi architectural ảnh hưởng đến những cách thức cơ bản mà các element tương tác với nhau và có lẽ sẽ đòi hỏi các thay đổi trên khắp hệ thống—ví dụ, chuyển một hệ thống từ single-threaded sang multi-threaded.

Hiển nhiên, các thay đổi local là đáng mong muốn nhất, nên một architecture *hiệu quả* là architecture trong đó các thay đổi phổ biến nhất là local, và do đó dễ thực hiện. Các thay đổi nonlocal không đáng mong muốn bằng nhưng có ưu điểm là chúng thường có thể được thực hiện theo từng giai đoạn—tức là được triển khai dần—một cách có trật tự theo thời gian. Ví dụ, trước tiên bạn có thể thực hiện các thay đổi để thêm một quy tắc định giá mới, rồi thực hiện các thay đổi để thực sự deploy quy tắc mới.

Quyết định khi nào các thay đổi là cần thiết, xác định đường thay đổi nào có rủi ro thấp nhất, đánh giá hệ quả của các thay đổi được đề xuất, và phân xử trình tự và mức ưu tiên cho các thay đổi được yêu cầu đều đòi hỏi hiểu biết sâu rộng về các mối quan hệ, performance và hành vi của các software element của hệ thống. Tất cả những nhiệm vụ này đều là một phần trong bản mô tả công việc của một kiến trúc sư. Việc suy luận về architecture và phân tích architecture có thể cung cấp những hiểu biết cần thiết để đưa ra quyết định về các thay đổi được dự kiến. Nếu bạn không thực hiện bước này, và nếu bạn không chú ý duy trì tính toàn vẹn về khái niệm của architecture, thì gần như chắc chắn bạn sẽ tích lũy *architecture debt*. Chúng tôi đề cập đến chủ đề này trong [Chương 23](ch23_managing_architecture_debt.vi.md#ch23).

<a id="sec2_3"></a>

## 2.3 Dự đoán các chất lượng của hệ thống (Predicting System Qualities)

Điểm này suy ra từ hai điểm trước: Architecture không chỉ mang lại các chất lượng cho hệ thống, mà còn làm vậy theo một cách có thể dự đoán được.

Điều này có vẻ hiển nhiên, nhưng không nhất thiết phải như vậy. Khi đó, việc thiết kế một architecture sẽ chỉ là đưa ra một chuỗi các quyết định thiết kế gần như ngẫu nhiên, xây dựng hệ thống, kiểm thử các quality attribute, và cầu mong điều tốt nhất. Ối—không đủ nhanh hoặc dễ bị tấn công đến vô vọng? Bắt đầu vá víu thôi.

May mắn thay, *hoàn toàn có thể* đưa ra các dự đoán về chất lượng của một hệ thống chỉ dựa trên việc đánh giá architecture của nó. Nếu chúng ta biết rằng những loại quyết định architecture nhất định dẫn đến những quality attribute nhất định trong một hệ thống, thì chúng ta có thể đưa ra những quyết định đó và có lý do để kỳ vọng được đền đáp bằng các quality attribute tương ứng. Về sau, khi xem xét một architecture, chúng ta có thể xác định liệu những quyết định đó đã được đưa ra hay chưa, và tự tin dự đoán rằng architecture sẽ thể hiện các chất lượng tương ứng.

Điểm này và điểm trước, khi xét cùng nhau, có nghĩa là architecture phần lớn quyết định các chất lượng của hệ thống và—thậm chí tốt hơn!—chúng ta biết nó làm điều đó như thế nào, và chúng ta biết cách khiến nó làm điều đó.

Ngay cả khi bạn không thực hiện việc mô hình hóa phân tích định lượng đôi khi cần thiết để bảo đảm rằng một architecture sẽ mang lại các lợi ích đã định, nguyên lý đánh giá các quyết định dựa trên hệ quả quality attribute của chúng là vô giá, ít nhất là để phát hiện sớm các rắc rối tiềm ẩn.

<a id="sec2_4"></a>

## 2.4 Giao tiếp giữa các stakeholder (Communication among Stakeholders)

Một điểm được nêu trong [Chương 1](ch01_what_is_software_architecture.vi.md#ch01) là một architecture là một sự trừu tượng hóa, và điều đó hữu ích vì nó biểu diễn một model đơn giản hóa của toàn bộ hệ thống mà (không giống như vô số chi tiết của toàn bộ hệ thống) bạn có thể giữ trong đầu. Những người khác trong team của bạn cũng vậy. Architecture biểu diễn một sự trừu tượng hóa chung của một hệ thống mà hầu hết, nếu không phải tất cả, các stakeholder của hệ thống có thể dùng làm cơ sở để tạo ra sự hiểu biết lẫn nhau, đàm phán, đạt được đồng thuận và giao tiếp với nhau. Architecture—hoặc ít nhất là các phần của nó—đủ trừu tượng để hầu hết những người không chuyên về kỹ thuật có thể hiểu nó ở mức họ cần, đặc biệt là khi có sự hướng dẫn từ kiến trúc sư, nhưng sự trừu tượng hóa đó vẫn có thể được tinh chỉnh thành các đặc tả kỹ thuật đủ phong phú để dẫn dắt việc triển khai, tích hợp, kiểm thử và deployment.

Mỗi stakeholder của một hệ thống phần mềm—khách hàng, người dùng, quản lý dự án, người viết code, tester, v.v.—quan tâm đến những đặc điểm khác nhau của hệ thống chịu ảnh hưởng bởi architecture của nó. Ví dụ:

- người dùng quan tâm đến việc hệ thống nhanh, đáng tin cậy và sẵn sàng khi cần;
- khách hàng (người trả tiền cho hệ thống) quan tâm đến việc architecture có thể được triển khai đúng tiến độ và trong ngân sách;
- người quản lý lo lắng rằng (ngoài các mối quan tâm về chi phí và tiến độ) architecture sẽ cho phép các team làm việc phần lớn độc lập, tương tác theo những cách có kỷ luật và được kiểm soát; và
- kiến trúc sư lo lắng về các chiến lược để đạt được tất cả những mục tiêu đó.

Architecture cung cấp một ngôn ngữ chung trong đó các mối quan tâm khác nhau có thể được biểu đạt, đàm phán và giải quyết ở một mức có thể quản lý được về mặt trí tuệ, ngay cả với các hệ thống lớn, phức tạp. Không có một ngôn ngữ như vậy, thật khó để hiểu các hệ thống lớn đủ để đưa ra các quyết định sớm ảnh hưởng đến cả chất lượng lẫn tính hữu dụng. Việc phân tích architecture, như chúng ta sẽ thấy trong [Chương 21](ch21_evaluating_an_architecture.vi.md#ch21), vừa phụ thuộc vào mức giao tiếp này vừa tăng cường nó.

[Chương 22](ch22_documenting_an_architecture.vi.md#ch22), về tài liệu hóa architecture, đề cập sâu hơn đến các stakeholder và các mối quan tâm của họ.

> **“Điều gì xảy ra khi tôi nhấn nút này?”: Architecture như một phương tiện giao tiếp giữa các stakeholder (“What Happens When I Push This Button?”: Architecture as a Vehicle for Stakeholder Communication)**
>
> Buổi review dự án kéo dài lê thê. Dự án phát triển government-sponsored đang chậm tiến độ và vượt ngân sách, và nó đủ lớn để những sai sót này thu hút sự chú ý của Quốc hội Hoa Kỳ. Và giờ đây, chính phủ đang bù đắp cho sự lơ là trước đây bằng cách tổ chức một buổi review marathon come-one-come-all. Nhà thầu gần đây vừa trải qua một vụ mua lại, điều chẳng giúp ích gì cho tình hình. Đó là buổi chiều của ngày thứ hai, và chương trình nghị sự yêu cầu trình bày software architecture. Kiến trúc sư trẻ—một người học việc của kiến trúc sư trưởng của hệ thống—đang dũng cảm giải thích cách software architecture của hệ thống đồ sộ này sẽ cho phép nó đáp ứng các yêu cầu real-time, phân tán, high-reliability rất khắt khe. Anh ấy có một bài trình bày vững vàng và một architecture vững vàng để trình bày. Nó hợp lý và chặt chẽ. Nhưng khán giả—khoảng 30 đại diện chính phủ với các vai trò khác nhau trong việc quản lý và giám sát dự án gai góc này—đã mệt mỏi. Một số người trong số họ thậm chí còn nghĩ rằng có lẽ lẽ ra họ nên đi làm bất động sản thay vì phải chịu đựng thêm một buổi review marathon let’s-finally-get-it-right-this-time như thế này.
>
> Slide cho thấy, bằng ký hiệu box-and-line bán chính thức, các software element chính trong một view runtime của hệ thống. Các tên đều là từ viết tắt, không gợi ra ý nghĩa gì nếu không được giải thích, và kiến trúc sư trẻ đã giải thích. Các đường thể hiện luồng dữ liệu, việc truyền message và đồng bộ hóa process. Các element có dự phòng bên trong, như kiến trúc sư đang giải thích. “Trong trường hợp xảy ra lỗi,” anh ấy bắt đầu, dùng bút laser chỉ vào một trong các đường, “một cơ chế khởi động lại sẽ kích hoạt dọc theo đường này khi. . . .”
>
> “Điều gì xảy ra khi nút mode select được nhấn?” một người trong khán giả ngắt lời. Ông ấy là một người tham dự từ phía chính phủ, đại diện cho cộng đồng người dùng của hệ thống này.
>
> “Xin lỗi, ông nói gì ạ?” kiến trúc sư hỏi.
>
> “Nút mode select,” ông ấy nói. “Điều gì xảy ra khi anh nhấn nó?”
>
> “À, cái đó kích hoạt một sự kiện trong device driver, ở trên này,” kiến trúc sư bắt đầu, vừa nói vừa laser-pointing. “Sau đó nó đọc register và diễn giải mã sự kiện. Nếu đó là mode select, thì, nó báo hiệu cho blackboard, rồi đến lượt blackboard báo hiệu cho các object đã đăng ký sự kiện đó. . . .”
>
> “Không, ý tôi là hệ thống *làm* gì,” người hỏi ngắt lời. “Nó có reset các màn hình không? Và điều gì xảy ra nếu việc này xảy ra trong lúc hệ thống đang được cấu hình lại?”
>
> Kiến trúc sư trông hơi ngạc nhiên và tắt bút laser. Đây không phải là một câu hỏi về architecture, nhưng vì anh ấy là một kiến trúc sư và do đó thông thạo các yêu cầu, anh ấy biết câu trả lời. “Nếu command line đang ở chế độ setup, các màn hình sẽ reset,” anh ấy nói. “Nếu không, một thông báo lỗi sẽ được đưa lên control console, nhưng tín hiệu sẽ bị bỏ qua.” Anh ấy bật lại bút laser. “Giờ thì, cơ chế khởi động lại mà tôi đang nói đến. . . .”
>
> “À, tôi chỉ đang thắc mắc thôi,” người đại diện của người dùng nói. “Vì tôi thấy từ biểu đồ của anh rằng display console đang gửi signal traffic đến module target location.”
>
> “Điều gì *nên* xảy ra?” một thành viên khác trong khán giả hỏi, hướng về người hỏi đầu tiên. “Ông có thực sự muốn người dùng nhận được dữ liệu chế độ trong lúc nó đang cấu hình lại không?” Và trong 45 phút tiếp theo, kiến trúc sư chứng kiến khán giả chiếm hết khung giờ của mình để tranh luận xem hành vi đúng của hệ thống lẽ ra phải là gì trong các trạng thái bí hiểm khác nhau—một cuộc trao đổi hoàn toàn thiết yếu lẽ ra phải diễn ra khi các yêu cầu đang được xây dựng nhưng, vì lý do nào đó, đã không diễn ra.
>
> Cuộc tranh luận không thuộc về architecture, nhưng architecture (và cách biểu diễn đồ họa của nó) đã khơi mào cuộc tranh luận. Thật tự nhiên khi nghĩ về architecture như cơ sở giao tiếp giữa một số stakeholder ngoài kiến trúc sư và developer: Ví dụ, các nhà quản lý dùng architecture để lập team và phân bổ nguồn lực giữa các team. Nhưng người dùng thì sao? Suy cho cùng, architecture là vô hình đối với người dùng; tại sao họ lại bám lấy nó như một công cụ để hiểu hệ thống?
>
> Thực tế là họ có làm vậy. Trong trường hợp này, người hỏi đã ngồi qua hai ngày xem các viewgraph toàn về chức năng, vận hành, user interface và kiểm thử. Nhưng chính slide đầu tiên về architecture—dù ông ấy đã mệt và muốn về nhà—đã khiến ông ấy nhận ra mình không hiểu một điều gì đó. Việc tham dự nhiều buổi review architecture đã thuyết phục tôi rằng nhìn hệ thống theo một cách mới sẽ kích thích tư duy và đưa những câu hỏi mới lên bề mặt. Đối với người dùng, architecture thường đóng vai trò là cách mới đó, và các câu hỏi mà người dùng đặt ra sẽ mang tính hành vi. Trong một buổi đánh giá architecture đáng nhớ cách đây vài năm, các đại diện người dùng quan tâm nhiều hơn đến việc hệ thống sẽ làm gì hơn là nó sẽ làm điều đó như thế nào, và điều đó là tự nhiên. Cho đến thời điểm đó, sự tiếp xúc duy nhất của họ với nhà cung cấp là thông qua đội ngũ marketing. Kiến trúc sư là chuyên gia chính danh đầu tiên về hệ thống mà họ được tiếp cận, và họ đã không ngần ngại nắm lấy cơ hội.
>
> Tất nhiên, các đặc tả yêu cầu cẩn thận và kỹ lưỡng sẽ cải thiện được điều này, nhưng vì nhiều lý do, chúng không phải lúc nào cũng được tạo ra hoặc có sẵn. Khi thiếu chúng, một đặc tả của architecture thường đóng vai trò kích hoạt các câu hỏi và cải thiện sự rõ ràng. Có lẽ khôn ngoan hơn là nhận ra khả năng này thay vì chống lại nó.
>
> Đôi khi một buổi như vậy sẽ làm lộ ra các yêu cầu bất hợp lý, mà tính hữu dụng của chúng sau đó có thể được xem xét lại. Một buổi review kiểu này, nhấn mạnh sự cộng hưởng giữa yêu cầu và architecture, lẽ ra đã giải vây cho kiến trúc sư trẻ trong câu chuyện của chúng ta bằng cách dành cho anh ấy một chỗ trong toàn bộ buổi review để giải quyết loại thông tin đó. Và người đại diện người dùng đã không cảm thấy lạc lõng như cá trên cạn khi đặt câu hỏi của mình vào một thời điểm rõ ràng là không thích hợp.
>
> —PCC

<a id="sec2_5"></a>

## 2.5 Các quyết định thiết kế sớm (Early Design Decisions)

Software architecture là biểu hiện của các quyết định thiết kế sớm nhất về một hệ thống, và những ràng buộc sớm này có sức nặng to lớn đối với phần phát triển còn lại của hệ thống, việc deployment của nó và vòng đời bảo trì của nó. Đó cũng là thời điểm sớm nhất mà tại đó các quyết định thiết kế quan trọng ảnh hưởng đến hệ thống này có thể được xem xét kỹ lưỡng.

Bất kỳ thiết kế nào, trong bất kỳ ngành nào, cũng có thể được xem như một chuỗi các quyết định. Khi vẽ một bức tranh, người họa sĩ quyết định chất liệu cho tấm vải và chất liệu để vẽ—sơn dầu, màu nước, bút sáp—ngay cả trước khi bắt đầu bức tranh. Một khi bức tranh đã bắt đầu, các quyết định khác được đưa ra ngay lập tức: Đường nét đầu tiên ở đâu, độ dày của nó là bao nhiêu, hình dạng của nó ra sao? Tất cả những quyết định thiết kế sớm này đều có ảnh hưởng mạnh mẽ đến diện mạo cuối cùng của bức tranh, và mỗi quyết định ràng buộc nhiều quyết định theo sau. Mỗi quyết định, khi xét riêng lẻ, có thể có vẻ khá vô hại, nhưng đặc biệt là những quyết định sớm có sức nặng không tương xứng đơn giản vì chúng ảnh hưởng và ràng buộc rất nhiều thứ theo sau.

Thiết kế architecture cũng vậy. Một thiết kế architecture cũng có thể được xem như một tập các quyết định. Việc thay đổi những quyết định sớm này sẽ gây ra hiệu ứng gợn sóng, xét về các quyết định bổ sung giờ đây phải thay đổi theo. Đúng vậy, đôi khi architecture phải được refactor hoặc thiết kế lại, nhưng đây không phải là một nhiệm vụ mà chúng ta xem nhẹ—vì “gợn sóng” có thể biến thành một trận tuyết lở.

Những quyết định thiết kế sớm nào được thể hiện trong software architecture? Hãy xem xét:

- Hệ thống sẽ chạy trên một bộ xử lý hay được phân tán trên nhiều bộ xử lý?
- Phần mềm có được phân layer không? Nếu có, sẽ có bao nhiêu layer? Mỗi layer sẽ làm gì?
- Các component sẽ giao tiếp đồng bộ hay bất đồng bộ? Chúng sẽ tương tác bằng cách chuyển giao quyền điều khiển hay dữ liệu, hay cả hai?
- Thông tin chảy qua hệ thống có được mã hóa không?
- Chúng ta sẽ dùng hệ điều hành nào?
- Chúng ta sẽ chọn communication protocol nào?

Hãy tưởng tượng cơn ác mộng khi phải thay đổi bất kỳ quyết định nào trong số này hoặc vô số quyết định liên quan khác. Những quyết định như thế này bắt đầu định hình một số structure của architecture và các tương tác giữa chúng.

<a id="sec2_6"></a>

## 2.6 Các ràng buộc đối với việc triển khai (Constraints on Implementation)

Nếu bạn muốn implementation của mình tuân theo một architecture, thì nó phải tuân theo các quyết định thiết kế mà architecture quy định. Nó phải có tập các element mà architecture quy định; các element này phải tương tác với nhau theo cách mà architecture quy định; và mỗi element phải hoàn thành trách nhiệm của mình đối với các element khác như architecture quy định. Mỗi quy định này là một ràng buộc đối với người triển khai.

Những người xây dựng element phải thông thạo các đặc tả của element riêng của họ nhưng họ có thể không biết đến các tradeoff của architecture—architecture (hoặc kiến trúc sư) đơn giản là ràng buộc họ theo cách đáp ứng được các tradeoff đó. Một ví dụ kinh điển là khi một kiến trúc sư phân bổ ngân sách performance cho các phần mềm tham gia vào một chức năng lớn hơn nào đó. Nếu mỗi đơn vị phần mềm nằm trong ngân sách của nó, toàn bộ transaction sẽ đáp ứng yêu cầu performance của nó. Những người triển khai từng phần cấu thành có thể không biết ngân sách tổng thể, mà chỉ biết ngân sách của riêng họ.

Ngược lại, các kiến trúc sư không cần là chuyên gia về mọi khía cạnh của thiết kế algorithm hay những điểm phức tạp của ngôn ngữ lập trình—dù chắc chắn họ nên biết đủ để không thiết kế ra một thứ khó xây dựng. Tuy nhiên, kiến trúc sư là những người chịu trách nhiệm thiết lập, phân tích và thực thi các quyết định và tradeoff của architecture.

<a id="sec2_7"></a>

## 2.7 Ảnh hưởng đến cấu trúc tổ chức (Influences on Organizational Structure)

Architecture không chỉ quy định cấu trúc của hệ thống đang được phát triển, mà cấu trúc đó còn được khắc vào cấu trúc của dự án phát triển (và đôi khi vào cấu trúc của toàn bộ tổ chức). Phương pháp thông thường để chia công việc trong một dự án lớn là giao cho các nhóm khác nhau xây dựng các phần khác nhau của hệ thống. Cái gọi là (so-called) work-breakdown structure này của một hệ thống được thể hiện trong architecture qua work assignment structure được mô tả trong [Chương 1](ch01_what_is_software_architecture.vi.md#ch01). Vì architecture bao gồm sự phân rã rộng nhất của hệ thống, nó thường được dùng làm cơ sở cho work-breakdown structure. Đến lượt mình, work-breakdown structure quyết định các đơn vị lập kế hoạch, lập lịch và ngân sách; các kênh giao tiếp giữa các team; configuration control và tổ chức file-system; các kế hoạch và quy trình tích hợp và kiểm thử; và thậm chí cả những chi tiết vụn vặt của dự án như cách intranet của dự án được tổ chức và ai ngồi cạnh ai trong buổi dã ngoại của công ty. Các team giao tiếp với nhau dựa trên các interface specification cho element của họ. Hoạt động bảo trì, khi được khởi động, cũng sẽ phản ánh cấu trúc phần mềm, với các team được lập ra để bảo trì các element cụ thể từ architecture—database, business rule, user interface, device driver, v.v.

Một tác dụng phụ của việc thiết lập work-breakdown structure là đóng băng một số khía cạnh của software architecture. Một nhóm chịu trách nhiệm về một trong các hệ thống con có thể chống lại việc các trách nhiệm của mình bị phân bổ sang các nhóm khác. Nếu những trách nhiệm này đã được chính thức hóa trong một quan hệ hợp đồng, việc thay đổi trách nhiệm có thể trở nên tốn kém hoặc thậm chí dẫn đến kiện tụng.

Do đó, một khi architecture đã được thống nhất, việc sửa đổi đáng kể nó trở nên rất tốn kém—vì các lý do quản lý và kinh doanh. Đây là một lập luận (trong số nhiều lập luận) cho việc phân tích software architecture của một hệ thống lớn trước khi chốt một lựa chọn cụ thể.

<a id="sec2_8"></a>

## 2.8 Hỗ trợ phát triển tăng dần (Enabling Incremental Development)

Một khi architecture đã được định nghĩa, nó có thể đóng vai trò cơ sở cho phát triển tăng dần. Increment đầu tiên có thể là một hệ thống khung xương trong đó ít nhất một phần infrastructure—cách các element khởi tạo, giao tiếp, chia sẻ dữ liệu, truy cập tài nguyên, báo lỗi, ghi log hoạt động, v.v.—đã có mặt, nhưng phần lớn chức năng ứng dụng của hệ thống thì chưa.

Việc xây dựng infrastructure và xây dựng chức năng ứng dụng có thể song hành. Thiết kế và xây dựng một chút infrastructure để hỗ trợ một chút chức năng end-to-end; lặp lại cho đến khi xong.

Nhiều hệ thống được xây dựng như các hệ thống khung xương có thể được mở rộng bằng plug-ins, package hoặc extension. Các ví dụ bao gồm ngôn ngữ R, Visual Studio Code và hầu hết các trình duyệt web. Các extension, khi được thêm vào, cung cấp chức năng bổ sung vượt ra ngoài những gì có trong khung xương. Cách tiếp cận này hỗ trợ quá trình phát triển bằng cách bảo đảm hệ thống có thể chạy được từ sớm trong vòng đời sản phẩm. Độ trung thực của hệ thống tăng lên khi các extension được thêm vào, hoặc khi các phiên bản đầu được thay bằng các phiên bản hoàn chỉnh hơn của những phần phần mềm này. Trong một số trường hợp, các phần đó có thể là phiên bản low-fidelity hoặc prototype của chức năng cuối cùng; trong các trường hợp khác, chúng có thể là *surrogate* (vật thay thế) tiêu thụ và tạo ra dữ liệu ở tốc độ thích hợp nhưng hầu như không làm gì khác. Cùng nhiều lợi ích khác, điều này cho phép phát hiện sớm trong vòng đời sản phẩm các vấn đề tiềm ẩn về performance (và các vấn đề khác).

Thực hành này thu hút sự chú ý vào early 2000s thông qua các ý tưởng của Alistair Cockburn và khái niệm “walking skeleton” của ông. Gần đây hơn, nó đã được những người dùng MVP (minimum viable product) áp dụng như một chiến lược giảm rủi ro.

Lợi ích của phát triển tăng dần bao gồm việc giảm rủi ro tiềm ẩn trong dự án. Nếu architecture dành cho một họ các hệ thống liên quan, infrastructure có thể được tái sử dụng trên cả họ, làm giảm chi phí per-system của từng hệ thống.

<a id="sec2_9"></a>

## 2.9 Ước tính chi phí và tiến độ (Cost and Schedule Estimates)

Ước tính chi phí và tiến độ là một công cụ quan trọng đối với quản lý dự án. Chúng giúp quản lý dự án có được các nguồn lực cần thiết cũng như theo dõi tiến độ của dự án. Một trong những nhiệm vụ của kiến trúc sư là giúp quản lý dự án tạo ra các ước tính chi phí và tiến độ sớm trong vòng đời dự án. Dù các ước tính top-down hữu ích để đặt mục tiêu và phân bổ ngân sách, các ước tính chi phí dựa trên sự hiểu biết bottom-up về các phần của hệ thống thường chính xác hơn những ước tính chỉ dựa thuần túy trên kiến thức top-down về hệ thống.

Như chúng tôi đã nói, cấu trúc tổ chức và work-breakdown structure của một dự án hầu như luôn dựa trên architecture của nó. Mỗi team hoặc cá nhân chịu trách nhiệm về một hạng mục công việc sẽ có thể đưa ra các ước tính chính xác hơn cho phần của mình so với quản lý dự án, và sẽ cảm thấy có trách nhiệm hơn trong việc biến những ước tính đó thành hiện thực. Nhưng các ước tính chi phí và tiến độ tốt nhất thường sẽ xuất hiện từ sự đồng thuận giữa các ước tính top-down (do kiến trúc sư và quản lý dự án tạo ra) và các ước tính bottom-up (do các developer tạo ra). Cuộc thảo luận và đàm phán phát sinh từ quá trình này tạo ra một ước tính chính xác hơn nhiều so với việc chỉ dùng riêng một trong hai cách tiếp cận.

Sẽ có ích nếu các yêu cầu của hệ thống đã được review và xác nhận. Bạn càng có nhiều kiến thức up-front về phạm vi, các ước tính chi phí và tiến độ sẽ càng chính xác.

[Chương 24](ch24_the_role_of_architects_in_projects.vi.md#ch24) đi sâu vào việc sử dụng architecture trong quản lý dự án.

<a id="sec2_10"></a>

## 2.10 Model có thể chuyển giao và tái sử dụng (Transferable, Reusable Model)

Việc tái sử dụng được áp dụng càng sớm trong vòng đời, lợi ích có thể đạt được từ thực hành này càng lớn. Trong khi tái sử dụng code mang lại một lợi ích, việc tái sử dụng architecture mang lại cơ hội cho đòn bẩy to lớn đối với các hệ thống có yêu cầu tương tự. Khi các quyết định architecture có thể được tái sử dụng trên nhiều hệ thống, tất cả các hệ quả early-decision mà chúng tôi mô tả ở các mục trước cũng được chuyển sang những hệ thống đó.

Một product line hay family là một tập các hệ thống đều được xây dựng bằng cùng một tập tài sản dùng chung—software component, tài liệu yêu cầu, test case, v.v. Đứng đầu trong số các tài sản này là architecture được thiết kế để đáp ứng nhu cầu của cả họ. Các kiến trúc sư product-line chọn một architecture (hoặc một họ các architecture liên quan chặt chẽ) sẽ phục vụ mọi thành viên dự kiến của product line. Architecture định nghĩa những gì cố định cho mọi thành viên của product line và những gì có thể thay đổi.

Product line là một cách tiếp cận mạnh mẽ cho phát triển multi-system đã cho thấy lợi ích order-of-magnitude về time to market, chi phí, năng suất và chất lượng sản phẩm. Sức mạnh của architecture nằm ở trung tâm của mô hình này. Tương tự như các khoản đầu tư vốn khác, architecture cho product line trở thành tài sản dùng chung của tổ chức phát triển.

<a id="sec2_11"></a>

## 2.11 Architecture cho phép kết hợp các element được phát triển độc lập (Architecture Allows Incorporation of Independently Developed Elements)

Trong khi các mô hình phần mềm trước đây tập trung vào *lập trình* như hoạt động chính, với tiến độ được đo bằng số dòng code, phát triển architecture-based thường tập trung vào việc *kết hợp* hoặc *lắp ráp các element* có khả năng đã được phát triển riêng rẽ, thậm chí độc lập, với nhau. Việc kết hợp này khả thi vì architecture định nghĩa các element có thể được đưa vào hệ thống. Architecture ràng buộc các thay thế (hoặc bổ sung) có thể có theo cách chúng tương tác với môi trường, cách chúng nhận và trả lại quyền điều khiển, dữ liệu nào chúng tiêu thụ và tạo ra, cách chúng truy cập dữ liệu, và protocol nào chúng dùng để giao tiếp và chia sẻ tài nguyên. Chúng tôi trình bày chi tiết các ý tưởng này trong [Chương 15](ch15_software_interfaces.vi.md#ch15).

Các component thương mại off-the-shelf, phần mềm open source, các app có sẵn công khai và các networked service đều là ví dụ về các element được phát triển độc lập. Sự phức tạp và tính phổ biến của việc tích hợp nhiều element được phát triển độc lập vào hệ thống của bạn đã sinh ra cả một ngành công nghiệp công cụ phần mềm, chẳng hạn như Apache Ant, Apache Maven, MSBuild và Jenkins.

Đối với phần mềm, lợi ích có thể ở các dạng sau:

- Giảm time to market (dùng giải pháp có sẵn của người khác hẳn sẽ dễ hơn tự xây dựng giải pháp của riêng bạn)
- Tăng reliability (phần mềm được dùng rộng rãi hẳn đã được sửa hết bug)
- Chi phí thấp hơn (nhà cung cấp phần mềm có thể phân bổ chi phí phát triển trên toàn bộ khách hàng của mình)
- Tính linh hoạt (nếu element bạn muốn mua không quá special-purpose, nhiều khả năng nó có sẵn từ nhiều nguồn, điều này đến lượt nó làm tăng đòn bẩy mua hàng của bạn)

Một *open system* là hệ thống định nghĩa một tập các tiêu chuẩn cho các software element—cách chúng hành xử, cách chúng tương tác với các element khác, cách chúng chia sẻ dữ liệu, v.v. Mục tiêu của một open system là cho phép, và thậm chí khuyến khích, nhiều nhà cung cấp khác nhau có thể sản xuất element. Điều này có thể tránh được “vendor lock-in”, tình huống trong đó một nhà cung cấp duy nhất là bên duy nhất có thể cung cấp một element và tính giá cao cho việc đó. Open system được hiện thực nhờ một architecture định nghĩa các element và tương tác giữa chúng.

<a id="sec2_12"></a>

## 2.12 Hạn chế vốn từ vựng của các phương án thiết kế (Restricting the Vocabulary of Design Alternatives)

Khi các giải pháp architecture hữu ích được tập hợp lại, rõ ràng là dù các software element có thể được kết hợp theo những cách gần như vô hạn, vẫn có lợi khi tự nguyện giới hạn bản thân vào một số lượng tương đối nhỏ các lựa chọn element và tương tác giữa chúng. Bằng cách đó, chúng ta giảm thiểu độ phức tạp thiết kế của hệ thống đang xây dựng.

Một kỹ sư phần mềm không phải là một *artiste* (nghệ sĩ) nơi sự sáng tạo và tự do là tối thượng. Thay vào đó, kỹ thuật là về kỷ luật, và kỷ luật có được, một phần, bằng cách *hạn chế* vốn từ vựng của các phương án vào những giải pháp đã được chứng minh. Ví dụ về những giải pháp thiết kế đã được chứng minh này bao gồm tactic và pattern, sẽ được thảo luận rộng rãi trong Phần 2. Tái sử dụng các element off-the-shelf là một cách tiếp cận khác để hạn chế vốn từ vựng thiết kế của bạn.

Việc hạn chế vốn từ vựng thiết kế vào những giải pháp đã được chứng minh có thể mang lại các lợi ích sau:

- Tăng cường tái sử dụng
- Các thiết kế đều đặn và đơn giản hơn, dễ hiểu và dễ truyền đạt hơn, và mang lại kết quả có thể dự đoán một cách đáng tin cậy hơn
- Phân tích dễ hơn với độ tin cậy cao hơn
- Thời gian lựa chọn ngắn hơn
- Khả năng tương tác cao hơn

Các thiết kế chưa từng có tiền lệ thì rủi ro. Các thiết kế đã được chứng minh thì, ừm, đã được chứng minh. Điều này không có nghĩa là thiết kế phần mềm không bao giờ có thể đổi mới hoặc đưa ra các giải pháp mới mẻ và thú vị. Nó có thể. Nhưng những giải pháp này không nên được phát minh chỉ vì sự mới lạ; thay vào đó, chúng nên được tìm kiếm khi các giải pháp hiện có không đủ để giải quyết vấn đề trước mắt.

Các thuộc tính của phần mềm suy ra từ việc lựa chọn architectural tactic hoặc pattern. Các tactic và pattern đáng mong muốn hơn cho một vấn đề cụ thể sẽ cải thiện giải pháp thiết kế thu được, có thể bằng cách giúp phân xử các ràng buộc thiết kế xung đột dễ hơn, bằng cách tăng hiểu biết về các bối cảnh thiết kế chưa được hiểu rõ, và bằng cách giúp làm lộ ra những điểm không nhất quán trong yêu cầu. Chúng tôi sẽ thảo luận về architectural tactic và pattern trong Phần 2.

<a id="sec2_13"></a>

## 2.13 Cơ sở cho việc đào tạo (A Basis for Training)

Architecture, bao gồm cả mô tả cách các element tương tác với nhau để thực hiện hành vi được yêu cầu, có thể đóng vai trò là phần giới thiệu đầu tiên về hệ thống cho các thành viên mới của dự án. Điều này củng cố quan điểm của chúng tôi rằng một công dụng quan trọng của software architecture là hỗ trợ và khuyến khích giao tiếp giữa các stakeholder khác nhau. Architecture đóng vai trò là điểm tham chiếu chung cho tất cả những người này.

Module view là phương tiện tuyệt vời để cho ai đó thấy cấu trúc của một dự án: ai làm gì, team nào được giao phần nào của hệ thống, v.v. Component-and-connector view là lựa chọn tuyệt vời để giải thích cách hệ thống được kỳ vọng hoạt động và hoàn thành công việc của nó. Allocation view cho một thành viên mới của dự án thấy phần được giao cho họ nằm ở đâu trong môi trường phát triển hoặc deployment của dự án.

<a id="sec2_14"></a>

## 2.14 Tóm tắt (Summary)

Software architecture quan trọng vì nhiều lý do kỹ thuật và phi kỹ thuật. Danh sách Mười ba (List of Thirteen) của chúng tôi bao gồm các lợi ích sau:

1. Một architecture sẽ kìm hãm hoặc hỗ trợ các quality attribute chủ đạo của một hệ thống.
2. Các quyết định được đưa ra trong một architecture cho phép bạn suy luận về và quản lý sự thay đổi khi hệ thống tiến hóa.
3. Việc phân tích một architecture cho phép dự đoán sớm các chất lượng của một hệ thống.
4. Một architecture được tài liệu hóa giúp tăng cường giao tiếp giữa các stakeholder.
5. Architecture là vật mang những quyết định thiết kế sớm nhất. và do đó most-fundamental, hardest-to-change.
6. Một architecture định nghĩa một tập các ràng buộc đối với việc triển khai về sau.
7. Architecture quyết định cấu trúc của một tổ chức, hoặc ngược lại.
8. Một architecture có thể cung cấp cơ sở cho phát triển tăng dần.
9. Một architecture là artifact then chốt cho phép kiến trúc sư và quản lý dự án suy luận về chi phí và tiến độ.
10. Một architecture có thể được tạo ra như một model có thể chuyển giao và tái sử dụng, tạo thành trái tim của một product line.
11. Phát triển architecture-based tập trung sự chú ý vào việc lắp ráp các component, thay vì chỉ vào việc tạo ra chúng.
12. Bằng cách hạn chế các phương án thiết kế, architecture định hướng một cách hiệu quả sự sáng tạo của developer, giảm độ phức tạp của thiết kế và hệ thống.
13. Một architecture có thể là nền tảng để đào tạo một thành viên mới của team.

<a id="sec2_15"></a>

## 2.15 Đọc thêm (For Further Reading)

*The Software Architect Elevator: Redefining the Architect’s Role in the Digital Enterprise* của Gregor Hohpe mô tả khả năng độc đáo của kiến trúc sư trong việc tương tác với mọi người ở mọi cấp bên trong và bên ngoài một tổ chức, và tạo điều kiện cho giao tiếp giữa các stakeholder [Hohpe 20].

Bài báo “ông tổ” về architecture và tổ chức là của [Conway 68]. Định luật Conway (Conway’s law) phát biểu rằng “các tổ chức thiết kế hệ thống . . . bị ràng buộc phải tạo ra những thiết kế là bản sao của cấu trúc giao tiếp của chính các tổ chức đó.”

Khái niệm walking skeleton của Cockburn được mô tả trong *Agile Software Development: The Cooperative Game* [Cockburn 06].

Một ví dụ tốt về tiêu chuẩn open systems architecture là AUTOSAR, được phát triển cho ngành công nghiệp ô tô ([autosar.org](http://autosar.org/)).

Để có một cách trình bày toàn diện về việc xây dựng software product line, hãy xem [Clements 16]. Feature-based product line engineering là một cách tiếp cận hiện đại, automation-centered để xây dựng product line, mở rộng phạm vi từ phần mềm sang systems engineering. Một bản tóm tắt tốt có thể được tìm thấy tại [INCOSE 19].

<a id="sec2_16"></a>

## 2.16 Câu hỏi thảo luận (Discussion Questions)

1. Nếu bạn không nhớ được gì khác từ cuốn sách này, hãy nhớ . . . điều gì? Điểm thưởng nếu không nhìn trộm.
2. Với mỗi lý do trong 13 lý do vì sao architecture quan trọng được nêu trong chương này, hãy đứng ở lập trường phản biện: Hãy đề xuất một tập các hoàn cảnh mà trong đó architecture không cần thiết để đạt được kết quả đã nêu. Hãy biện minh cho lập trường của bạn. (Hãy cố đưa ra các hoàn cảnh khác nhau cho mỗi lý do trong 13 lý do.)
3. Chương này lập luận rằng architecture mang lại một số lợi ích hữu hình. Bạn sẽ đo lường các lợi ích của mỗi điểm trong 13 điểm như thế nào, trên một dự án cụ thể?
4. Giả sử bạn muốn đưa các thực hành architecture-centric vào tổ chức của mình. Ban quản lý của bạn cởi mở với ý tưởng này, nhưng muốn biết ROI của việc làm đó. Bạn sẽ trả lời như thế nào?
5. Hãy sắp xếp mức ưu tiên cho danh sách 13 lý do trong chương này theo một số tiêu chí có ý nghĩa với bạn. Hãy biện minh cho câu trả lời của bạn. Hoặc, nếu bạn chỉ có thể chọn hai hoặc ba lý do để thúc đẩy việc dùng architecture trong một dự án, bạn sẽ chọn những lý do nào và tại sao?
