<a id="p3"></a>

<a id="chapter1"></a>

# 1 Giới thiệu

DOI: [10.1201/9781003598145-1](https://doi.org/10.1201/9781003598145-1)

> *Chúng ta đang bước vào một thế giới mới, nơi dữ liệu có thể quan trọng hơn phần mềm.*
>
> Tim O'Reilly

Đây là một cuốn sách về việc phát triển phần mềm nhúng để dùng trong những hệ thống có thể gây hại.

Theo truyền thống, các cuộc thảo luận về phần mềm nhúng thường bắt đầu bằng con số thống kê về việc một chiếc ô tô hiện đại có nhiều hơn một chiếc máy bay chở khách hiện đại bao nhiêu dòng code nhúng. Cũng theo truyền thống, người ta thường đưa vào một bài giảng đạo lý về chi phí tăng lên khi phát hiện bug muộn trong quá trình phát triển — đường cong chi phí theo hàm mũ well-known.

Điều ngăn tôi đi theo cách tiếp cận này là tôi đã đọc cuốn sách tuyệt vời của Laurent Bossavit, *The Leprechauns of Software Engineering* (tài liệu tham khảo [<a id="b1refbib1_1"></a>[1](#refbib1_1)]).<a id="fn1_11b"></a>[<sup>1</sup>](#fn1_1) cuốn sách đã thẳng tay điều tra một số định kiến “well-known” trong software engineering và phơi bày việc chúng thiếu cơ sở.

Cụ thể, Bossavit chỉ ra lập luận vòng quanh gắn với chi phí tăng theo hàm mũ của việc tìm và sửa bug muộn hơn trong quá trình phát triển: *“Software engineering là một quá trình xã hội, không phải một quá trình xảy ra tự nhiên — do đó nó có tính chất là những gì chúng ta tin về software engineering có tác động nhân quả lên những gì là thực trong software engineering.”* Nói cách khác, chính vì chúng ta kỳ vọng việc sửa bug muộn hơn trong quá trình phát triển sẽ tốn kém hơn nên chúng ta đã tạo ra những quy trình khiến điều đó thành sự thật.

Những nhận xét của Bossavit sẽ được viện dẫn nhiều lần trong cuốn sách này vì tôi hy vọng sẽ làm lung lay niềm tin của bạn vào những “leprechaun” khác gắn với phần mềm nhúng. Tôi cũng hy vọng rằng chúng ta có thể thoát khỏi câu thần chú về *“trăm triệu dòng code trong một chiếc ô tô hiện đại.”*

## 1.1 Văn hóa an toàn

Phần lớn cuốn sách này đề cập đến các khía cạnh kỹ thuật của việc xây dựng một sản phẩm có thể được chứng nhận theo một tiêu chuẩn quốc tế. Có một khía cạnh bổ sung, quan trọng của việc xây dựng một sản phẩm có thể gây hại — những trách nhiệm mà các <a id="p4"></a>nhà thiết kế, người hiện thực, kỹ sư kiểm chứng và người đánh giá (assessor) phải gánh vác. Rất dễ đọc các tiêu chuẩn an toàn một cách máy móc, và coi các yêu cầu của chúng như những chiếc vòng mà dự án phải nhảy qua, nhưng những tiêu chuẩn đó được viết ra để những người làm việc trong một văn hóa an toàn đã được thiết lập đọc. Chủ đề văn hóa an toàn được xem xét trong [Mục 2.1.2](ch02_terminology_of_safety.vi.md#sec2_1_2) ở trang 11.

<a id="fn1_1"></a>

[<sup>1</sup>](#fn1_11b)Lưu ý rằng các tài liệu tham khảo được liệt kê ở cuối mỗi chương.

<a id="aned1"></a>

> Giai thoại 1[⏎](ch02_terminology_of_safety.vi.md#b2aned1) *Lần đầu tiên tôi bắt đầu nghĩ về các khía cạnh safety-critical của một thiết kế là vào cuối những năm 1980, khi tôi đang quản lý việc phát triển một thiết bị viễn thông. Khi một kỹ thuật viên bảo trì làm việc trên thiết bị, phần mềm thực hiện một phép kiểm tra điện áp cao trên đường dây bên ngoài như một biện pháp an toàn. Nếu có điện áp cao, phần mềm từ chối đóng các relay nối thiết bị của kỹ thuật viên với đường dây.*
>
> *Một lập trình viên, khi đọc code tại bàn làm việc của mình, đã nhận ra rằng phép kiểm tra điện áp cao sẽ bị bỏ qua trong những điều kiện rất bất thường.*
>
> *Tôi chịu áp lực đáng kể từ ban quản lý phải xuất xưởng sản phẩm. Người ta chỉ ra rằng điện áp cao hiếm khi xuất hiện và, ngay cả khi có, thì cũng chỉ trong những tình huống khó xảy ra phép kiểm tra mới bị bỏ qua.*
>
> *Vào thời điểm đó, tôi không có trong tay kỹ thuật nào trong số những kỹ thuật được mô tả trong cuốn sách này để đánh giá tình hình và đưa ra một quyết định có lý lẽ và có thể biện minh được. Chính sự cố này đã đưa tôi bước lên con đường dài dẫn đến cuốn sách này.*

## 1.2 Lộ trình của chúng ta

Tôi đã cấu trúc cuốn sách này thành các phần sau:

Phần 1*Tài liệu bối cảnh.*

[Chương 2](ch02_terminology_of_safety.vi.md) giới thiệu một số thuật ngữ tôi dùng trong cuốn sách này. Điều này là cần thiết vì những từ thường được dùng thay thế cho nhau trong đời sống hằng ngày lại có nghĩa sắc nét hơn nhiều khi thảo luận về các hệ thống nhúng.

Một thiết bị được dùng trong một ứng dụng safety-critical có lẽ sẽ được phát triển theo các yêu cầu của một tiêu chuẩn quốc tế. Tài liệu tham khảo [<a id="b1refbib1_2"></a>[2](#refbib1_2)] của John McDermid và Andrew Rae chỉ ra rằng có vài trăm tiêu chuẩn liên quan đến kỹ thuật an toàn. Từ *smörgåsbord* này, tôi đã chọn một số ít để thảo luận trong [Chương 3](ch03_safety_standards_and_certification.vi.md), cụ thể là IEC 61508, liên quan đến các hệ thống công nghiệp và là nền tảng cho nhiều tiêu chuẩn khác; ISO 26262, mở rộng và chuyên biệt hóa IEC 61508 cho các hệ thống trong phương tiện giao thông đường bộ; EN 50716, bao quát các ứng dụng đường sắt; và UL 4600, đề cập đến các hệ thống tự hành.

Để cuộc thảo luận cụ thể hơn, trong [Chương 4](ch04_representative_companies.vi.md) tôi giới thiệu hai công ty hư cấu. Một công ty đang phát triển một thiết bị để bán vào thị trường safety-critical, và <a id="p5"></a>công ty kia cung cấp một thành phần cho thiết bị đó. Điều này cho phép tôi minh họa cách hai công ty này có thể làm việc cùng nhau trong khuôn khổ các tiêu chuẩn.

Phần 2*Dự án phát triển.*

[Chương 5](ch05_development_methodologies.vi.md) đề cập ngắn gọn đến các phương pháp phát triển khả dĩ, từ waterfall đến eXtreme programming.

[Chương 6](ch06_the_safety_case.vi.md) trình bày phân tích quan trọng nhất sẽ được thực hiện trong dự án: việc tạo ra safety case. Còn có những phân tích quan trọng khác và [Chương 7](ch07_foundational_analyses.vi.md) mô tả Hazard and Risk Analysis và Failure Analysis.

[Chương 8](ch08_using_pre_existing_software_components.vi.md) thảo luận các vấn đề gắn với việc tích hợp các thành phần bên ngoài (có thể là third-party và có thể là open-source) vào một thiết bị safety-critical.

Mặc dù cuốn sách này tập trung vào các thiết bị nhúng, đôi khi cần phải nhìn vào hệ thống mà thiết bị nhúng sẽ hoạt động bên trong. [Chương 9](ch09_the_device_within_the_system.vi.md) giới thiệu ngắn gọn một số kỹ thuật phù hợp cho hệ thống lớn hơn đó.

Phần 3*Các design pattern.*

Các tiêu chuẩn quốc tế khuyến nghị nhiều kỹ thuật khác nhau để áp dụng trong các giai đoạn architecture và thiết kế của dự án. Nhiều kỹ thuật trong số này thường được dùng trong bất kỳ hoạt động phát triển nào (ví dụ, tính gắn kết chặt (strong cohesion) bên trong một thành phần phần mềm và sự liên kết lỏng (loose coupling) giữa các thành phần), nhưng một số khác ít well-known hơn. [Chương 10](ch10_balancing_design_aspects.vi.md) đến [13](ch13_replication_and_diversification.vi.md) trình bày một số kỹ thuật ít phổ biến hơn đó.

Phần 4*Các kỹ thuật kiểm chứng thiết kế.*

Một thiết kế phải được kiểm tra để bảo đảm rằng, nếu được hiện thực đúng, thiết bị sẽ hoạt động như yêu cầu. [Chương 14](ch14_markov_models.vi.md) đến [18](ch18_formal_verification.vi.md) mô tả một số phương pháp để thực hiện việc kiểm chứng này.

Phần 5*Các kỹ thuật hiện thực.*

[Chương 19](ch19_coding_guidelines.vi.md) đến [21](ch21_static_analysis.vi.md) trình bày ưu điểm và nhược điểm của nhiều ngôn ngữ máy tính khác nhau và tính hữu ích (hoặc không hữu ích) của một số metric được thu thập trong quá trình hiện thực.

Phần 6*Các kỹ thuật kiểm chứng hiện thực.*

[Chương 22](ch22_integration_and_system_testing.vi.md) trình bày một số khía cạnh của kiểm thử tích hợp và kiểm thử hệ thống. Một nhiệm vụ thiết yếu, nhưng đôi khi bị bỏ qua, là chuẩn bị bằng chứng về việc các công cụ offline được sử dụng hoạt động đúng. Việc lập trình viên có viết ra code tốt hay không cũng chẳng còn ý nghĩa nếu compiler biên dịch nó sai. [Chương 23](ch23_the_offline_tools.vi.md) đưa ra một số hiểu biết về cách có thể thu thập bằng chứng như vậy.

Phần 7*Phụ lục.*

Tôi giới thiệu goal structuring notation (GSN) và Bayesian belief network (BBN) trong [Chương 7](ch07_foundational_analyses.vi.md) – nhưng để dành chi tiết về chúng lần lượt cho [Phụ lục A](ch25_appendix_a_goal_structuring_notation.vi.md) và [B](ch26_appendix_b_bayesian_belief_networks.vi.md).

<a id="p6"></a>[Phụ lục C](ch27_appendix_c_calculating_2_3_4.vi.md) đưa ra một ví dụ áp dụng kỹ thuật coded processing được mô tả trong [Chương 13](ch13_replication_and_diversification.vi.md) để tính (2+3)+4 (Tiết lộ trước: kết quả ra 9).

Cuối cùng, có một chút toán học đây đó trong cuốn sách này. [Phụ lục D](ch28_appendix_d_notations.vi.md) mô tả các ký hiệu tôi đã dùng.

Thứ tự các chương này dường như đang ngụ ý một phương pháp phát triển waterfall: đầu tiên chúng ta thiết kế, rồi hiện thực và cuối cùng kiểm chứng. Đó là một hàm ý gây hiểu lầm (xem [Chương 5](ch05_development_methodologies.vi.md) để biết suy nghĩ của tôi về các phương pháp phát triển), nhưng các chương trong một cuốn sách in thì phải xuất hiện theo một thứ tự định trước nào đó.

## 1.3 Lựa chọn các kỹ thuật để mô tả

Khi quyết định có đưa một công cụ hay kỹ thuật cụ thể vào cuốn sách này hay không, tôi đã dùng ba tiêu chí:

1. Nó được khuyến nghị trong một hoặc nhiều tiêu chuẩn quốc tế. Tôi tin rằng mình chỉ đưa vào một kỹ thuật không được khuyến nghị như vậy.
2. Nó không được dùng phổ biến ở phần lớn các công ty mà tôi đã đến thăm gần đây.
3. Bản thân tôi đã trực tiếp sử dụng nó.

## 1.4 Những thách thức ngày nay

Mặc dù hai thập kỷ qua đã chứng kiến sự phát triển to lớn của các công cụ và kỹ thuật mà chúng ta có thể áp dụng cho việc phát triển các hệ thống nhúng an toàn, những thách thức vẫn còn đó và những thách thức mới đang nổi lên.

### 1.4.1 Bảo mật

Trong quá khứ xa xưa, nhiều hệ thống nhúng được bảo vệ về mặt vật lý, vì được khóa trong buồng lái của một đoàn tàu hoặc sau một hàng rào có khóa trong xưởng sản xuất. Ngày nay hầu như mọi thiết bị điện tử đều hỗ trợ giao tiếp bên ngoài qua Wi-Fi, Bluetooth, ổ USB, hoặc từ vệ tinh GPS, và tất cả các kênh này đều là lỗ hổng bảo mật.

An toàn đan xen với bảo mật — hành vi của một thiết bị không bảo mật thực chất là không thể dự đoán được một khi hacker đã tìm ra một lỗ hổng. An toàn và bảo mật thường đối nghịch nhau (tăng cái này thì phải trả giá bằng cái kia: ví dụ, tấm biển khá khó hiểu *“Cửa thoát hiểm. Luôn khóa!”*) và sự cân bằng giữa chúng được thảo luận trong [Mục 10.3](ch10_balancing_design_aspects.vi.md#sec10_3). Có những động thái nhằm kết hợp safety case và security case; xem [Mục 6.15](ch06_the_safety_case.vi.md#sec6_15). Tuy nhiên, hiện chưa có phương pháp luận chung nào để kết hợp các vấn đề bảo mật và an toàn.

<a id="p7"></a>

### 1.4.2 <a id="p7"></a>Công cụ để cân bằng các nhu cầu về architecture

[Chương 10](ch10_balancing_design_aspects.vi.md) mô tả cách một nhà thiết kế cần cân bằng tính sẵn sàng (availability), độ tin cậy (reliability), hiệu năng, tính hữu dụng, bảo mật và an toàn của một hệ thống. Các đặc tính này tương tác với nhau, và một quyết định thiết kế ở một lĩnh vực ảnh hưởng đến tất cả các lĩnh vực khác. Tôi không biết công cụ nào có thể giúp một nhà phân tích thao tác các đặc tính hệ thống này và cân đo đánh đổi chúng với nhau.

### 1.4.3 Phát hiện lỗi phần cứng

Như được mô tả trong [Mục 13.4.1](ch13_replication_and_diversification.vi.md#sec13_4_1), phần cứng bộ xử lý và memory đã trở nên kém tin cậy hơn đáng kể trong hai thập kỷ qua. Điều này là do độ phức tạp ngày càng tăng của chip (hầu hết bộ xử lý đi kèm 20 trang *errata* trở lên), và kích thước cell giảm đi khiến chúng dễ bị cross-talk hơn (ví dụ, row-hammering như được mô tả trong tài liệu tham khảo [<a id="b1refbib1_3"></a>[3](#refbib1_3)] của Lucian Cojocar, *et al.*), nhiễu điện từ và các hiệu ứng thứ cấp của tia vũ trụ. Hơn nữa, các lỗ hổng bảo mật cơ bản trong thiết kế chip (ví dụ, các lỗ hổng Downfall, Inception, Meltdown, Spoiler, PrintNightmare và Spectra) ngày càng được phát hiện và khai thác nhiều hơn.

Tệ hơn nữa, phần lớn một bộ xử lý hiện đại, bao gồm cache và coprocessor, bị ẩn khỏi hệ điều hành và các chương trình ứng dụng, nên lỗi không thể được phát hiện trực tiếp, mà chỉ thông qua ảnh hưởng của chúng lên hoạt động của chương trình.

### 1.4.4 Dự đoán deadline

Nhiều hệ thống nhúng trong quá khứ rất đơn giản, và có thể thực hiện các phép tính off-line để chứng tỏ rằng một số deadline nhất định sẽ được đáp ứng trong mọi tình huống. Khi các ứng dụng real-time<a id="fn1_21b"></a>[<sup>2</sup>](#fn1_2) chuyển sang chạy cạnh các ứng dụng khác trên bộ xử lý multicore với instruction cache và data cache non-deterministic, những bảo đảm cứng này đã được thay bằng những bảo đảm có dạng “xác suất deadline *X* bị lỡ hai lần liên tiếp nhỏ hơn ${10}^{- 6}$ cho mỗi giờ hoạt động.”

Có rất ít công cụ ngoài discrete-event simulation (xem [Mục 17.2](ch17_semi_formal_verification.vi.md#sec17_2)) cho phép thực hiện những loại phép tính này.

<a id="sec1_4_5"></a>

### 1.4.5 Dữ liệu

Thế giới các hệ thống safety-critical chỉ mới gần đây bắt đầu coi trọng dữ liệu: dữ liệu cấu hình, dữ liệu huấn luyện, dữ liệu hiện thực (như các trọng số trong một mạng nơ-ron), dữ liệu kiểm chứng, v.v. Cho đến vài năm trước, việc phân tích có xu hướng tập trung vào hai khía cạnh của một hệ thống — phần cứng và phần mềm — và điều này được phản ánh trong cấu trúc của ISO 26262 và IEC 61508, vốn có các phần dành riêng cho những chủ đề đó.

<a id="fn1_2"></a>

[<sup>2</sup>](#fn1_21b)Để biết định nghĩa của “real-time,” xem trang 23.

IEC 61508-3 có nói rõ, *“Phần mềm vừa là code vừa là dữ liệu”* và có một phụ lục đề cập đến dữ liệu, nhưng đây không phải là một phần riêng của tiêu chuẩn ở cùng cấp <a id="p8"></a>với phần mềm và phần cứng, nó mang tính “informative” thay vì “normative”, và chỉ tập trung vào dữ liệu cấu hình.

Giờ đây người ta đang nhận ra rằng dữ liệu là một yếu tố quan trọng ngang bằng. Dưới sự chỉ đạo của Mike Parsons, Data Safety Initiative Working Group (DSIWG), một phần của Safety Critical Systems Club (SCSC), đã soạn ra các hướng dẫn hữu ích về việc sử dụng dữ liệu trong các hệ thống safety-critical: tài liệu tham khảo [<a id="b1refbib1_4"></a>[4](#refbib1_4)]. Annex H của bộ hướng dẫn chứa một danh sách lạnh người các ví dụ mà sinh mạng con người đã bị mất do lỗi dữ liệu, chứ không phải lỗi phần cứng hay phần mềm. Vụ rơi chiếc Airbus A400M được mô tả ở trang 22 của cuốn sách này là một ví dụ về việc dữ liệu, chứ không phải phần mềm, đã khiến một chiếc máy bay rơi.

### 1.4.6 Machine learning và món nợ trí tuệ

Theo truyền thống, con người đã nhận diện và phân tích các tình huống mà thiết bị nhúng sẽ hoạt động trong đó, và đã lập trình thiết bị để phản ứng đúng. Điều này đang trở nên bất khả thi. Ví dụ, một chiếc ô tô tự lái sẽ cần hoạt động hiệu quả và an toàn trong nhiều tình huống hơn số tình huống chúng ta có thể liệt kê.

Tôi đã lái xe nhiều nghìn giờ, nhưng chưa bao giờ (cho đến nay) gặp một người đàn ông mặc bộ đồ vịt Donald băng qua đường trước mặt mình. Tuy nhiên, nếu tôi gặp tình huống đó vào ngày mai, tôi sẽ biết cách phản ứng. Một chiếc ô tô tự lái sẽ xử lý nó thế nào?

Vào thời điểm viết sách, cộng đồng an toàn vẫn đang tiếp nhận những hàm ý của machine learning và nhiều tiêu chuẩn an toàn nói rõ là không đề cập đến chúng. Những đòi hỏi như *“Hãy chỉ cho tôi chính xác những dòng code sẽ dừng xe nếu có một con vịt cao hai mét phía trước”* sẽ không thể đáp ứng được. ISO/PAS 8800 được công bố vào tháng Mười Hai năm 2024 và đề cập đến việc sử dụng các hệ thống Artificial Intelligence cho các chức năng safety-critical trong phương tiện giao thông đường bộ.

Machine learning chỉ là một thách thức nảy sinh từ khả năng của chúng ta trong việc tạo ra những hệ thống ngày càng phức tạp mà chúng ta không thể mô tả và thậm chí không thể đặt ra yêu cầu cho chúng. Trong tài liệu tham khảo [<a id="b1refbib1_5"></a>[5](#refbib1_5)], Jonathan Zittrain trình bày ý tưởng rằng chúng ta ngày càng không thể giải thích các hệ thống của mình hoạt động thế nào, đặc biệt trong lĩnh vực machine learning: chúng có vẻ hoạt động, nhưng chúng ta không thể xác định chính xác bằng cách nào. Ông gọi điều này là “món nợ trí tuệ” (intellectual debt) và chỉ ra rằng chúng ta đã dùng aspirin để giảm đau từ năm 1897, nhưng mãi đến năm 1995 mới tìm ra cách nó hoạt động. Khi chúng ta không hiểu đầy đủ các hệ thống con của mình hoạt động thế nào, chúng ta có thể đưa ra sự bảo đảm gì cho hệ thống thu được khi kết hợp chúng lại?

### 1.4.7 Functional safety và SOTIF

Trước đây người ta cho rằng một hệ thống chỉ trở nên nguy hiểm khi một thành phần bị hỏng hoặc hoạt động sai. Như được mô tả trong [Mục 2.1.3](ch02_terminology_of_safety.vi.md#sec2_1_3) và [9.3](ch09_the_device_within_the_system.vi.md#sec9_3), các nghiên cứu đã đặt nghi vấn về điều này: hầu hết các tình huống nguy hiểm thực ra xảy ra khi mọi thứ đã hoạt động đúng như nó được thiết kế để hoạt động.

Lĩnh vực nghiên cứu này đã tạo ra thuật ngữ *Safety Of The Intended Functionality* (SOTIF) và sự cân bằng giữa functional safety (dựa trên hỏng hóc) và SOTIF vẫn chưa được tìm ra. [Mục 9.3](ch09_the_device_within_the_system.vi.md#sec9_3) ở trang 98 mô tả một ví dụ về một tình huống nguy hiểm xảy ra mặc dù mọi thành phần của hệ thống đều hoạt động hoàn hảo.

## Tài liệu tham khảo

<a id="refbib1_1"></a>[1] L. Bossavit, *The Leprechauns of Software Engineering: How Folklaw Turns into Fact and What to Do about It*. Leanpub, 2013.[⏎](#b1refbib1_1)

<a id="refbib1_2"></a>[2] J. McDermid and A. Rae, “Goal-Based Safety Standards: Promises and Pitfalls,” in *2012 Safety Critical Systems Symposium*, SSS ‘12, (Bristol, UK), Safety-Critical Systems Club, 2012.[⏎](#b1refbib1_2)

<a id="refbib1_3"></a>[3] L. Cojocar, K. Razavi, C. Giuffrida, and H. Bos, “Exploiting Correcting Codes: On the Effectiveness of ECC Memory against Rowhammer Attacks,” 2018.[⏎](#b1refbib1_3)

<a id="refbib1_4"></a>[4] Data Safety Initiative Working Group, *Data Safety Guidance*. [https://scsc.uk/SCSC-127J](https://scsc.uk/SCSC-127J): SCSC-127J, 2025.[⏎](#b1refbib1_4)

<a id="refbib1_5"></a>[5] J. Zittrain, *Intellectual Debt: With Great Power Comes Great Ignorance*, pp. 176–184. Cambridge Law Handbooks, Cambridge University Press, 2022.[⏎](#b1refbib1_5)
