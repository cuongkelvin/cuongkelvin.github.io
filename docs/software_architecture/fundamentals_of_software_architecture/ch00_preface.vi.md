<a id="ch-preface"></a>

# Lời nói đầu

<a id="id673"></a>

## Lời nói đầu cho ấn bản thứ hai

“Chà, nhiều thứ quá!”

Khi bắt tay viết ấn bản thứ hai của *Fundamentals of Software Architecture*, chúng tôi có một vài ý tưởng về những điều muốn bổ sung chi tiết và cải thiện so với ấn bản đầu tiên, nhưng giống như rất nhiều dự án phần mềm, nó cứ lớn dần lên.

Một trong những mục tiêu chúng tôi đã đạt được là làm cho các phần về style nhất quán hơn, khiến chúng hữu ích hơn cho việc so sánh. Chúng tôi cũng thực hiện một số thay đổi đối với các đánh giá dạng sao để thêm các mục và một vài hạng mục mới, và bổ sung các mục mới về các cân nhắc cloud, data topology, team topology và governance cho mỗi architectural style. Trong quá trình đó, chúng tôi đã bổ sung lớn vào một số chương về các chủ đề phổ biến, như Chương [15](ch15_event_driven_architecture_style.vi.md#ch-style-eda) và [18](ch18_microservices_architecture.vi.md#ch-style-microservices), và thêm một chương mới ([Chương 11](ch11_the_modular_monolith_architecture_style.vi.md#ch-style-modular-mono)) về architectural style modular monolith.

Chúng tôi cũng thêm một số chương hoàn toàn mới đề cập các architectural pattern trong [Chương 20](ch20_architectural_patterns.vi.md#ch-architectural-patterns), các điểm giao thoa của architecture trong [Chương 26](ch26_architectural_intersections.vi.md#ch-architecture-intersections), và việc xem xét lại các định luật software architecture của chúng tôi (trong đó có một hệ quả mới và một định luật mới) trong [Chương 27](ch27_the_laws_of_software_architecture_revisited.vi.md#ch-laws-revisited).

<a id="id674"></a>

## Lời nói đầu cho ấn bản thứ nhất

> **Tiên đề (Axiom)**
>
> Một phát biểu hay mệnh đề được coi là đã được xác lập, được chấp nhận hay self-evidently (hiển nhiên) đúng.

Các nhà toán học tạo ra các lý thuyết dựa trên tiên đề—những giả định cho những điều đúng không thể tranh cãi. Các kiến trúc sư phần mềm cũng xây dựng lý thuyết trên nền các tiên đề, nhưng thế giới phần mềm, ừm, *mềm* hơn toán học: những điều cơ bản tiếp tục thay đổi với tốc độ nhanh, kể cả các tiên đề mà chúng ta đặt lý thuyết của mình lên trên.

Hệ sinh thái phát triển phần mềm tồn tại trong một trạng thái cân bằng động liên tục: trong khi nó tồn tại ở một trạng thái cân bằng tại bất kỳ thời điểm nào, nó thể hiện hành vi *động* trong dài hạn. Một ví dụ hiện đại tuyệt vời về bản chất của hệ sinh thái này là sự trỗi dậy của containerization và những thay đổi đi kèm: các công cụ như [Kubernetes](https://kubernetes.io) không tồn tại một thập kỷ trước, vậy mà giờ có cả những hội nghị phần mềm chỉ để phục vụ người dùng của nó. Hệ sinh thái phần mềm thay đổi một cách hỗn loạn: một thay đổi nhỏ gây ra một thay đổi nhỏ khác; khi lặp lại hàng trăm lần, nó tạo ra một hệ sinh thái mới.

Các kiến trúc sư có trách nhiệm quan trọng là chất vấn các giả định và tiên đề còn sót lại từ các thời kỳ trước. Nhiều cuốn sách về software architecture được viết trong một thời kỳ chỉ hơi giống thế giới hiện tại. Thực tế, các tác giả tin rằng chúng ta phải thường xuyên chất vấn các tiên đề cơ bản, dưới ánh sáng của các thực hành kỹ thuật được cải tiến, các hệ sinh thái vận hành, các quy trình phát triển phần mềm—mọi thứ tạo nên trạng thái cân bằng động, lộn xộn nơi kiến trúc sư và developer làm việc mỗi ngày.

Những người quan sát cẩn thận software architecture theo thời gian đã chứng kiến một sự tiến hóa của các khả năng. Bắt đầu với các thực hành kỹ thuật của [Extreme Programming](http://www.extremeprogramming.org), tiếp tục với continuous delivery, cuộc cách mạng DevOps, microservices, containerization, và giờ là các tài nguyên cloud-based, tất cả những đổi mới này đã dẫn đến các khả năng và trade-offs mới. Khi các khả năng thay đổi, góc nhìn của kiến trúc sư về ngành cũng thay đổi theo. Trong nhiều năm, định nghĩa tongue-in-cheek (nửa đùa nửa thật) của software architecture là “những thứ khó thay đổi về sau.” Về sau, architecture style microservices xuất hiện, trong đó *sự thay đổi* là một cân nhắc thiết kế first-class.

Mỗi thời kỳ mới đòi hỏi các thực hành, công cụ, phép đo, pattern mới và vô số thay đổi khác. Cuốn sách này nhìn software architecture dưới ánh sáng hiện đại, tính đến mọi đổi mới trong thập kỷ qua, cùng với một số metric và thước đo mới phù hợp với các cấu trúc và góc nhìn mới ngày nay.

Phụ đề của cuốn sách chúng tôi là “A Modern Engineering Approach” (Một cách tiếp cận kỹ thuật hiện đại). Developer từ lâu đã mong muốn biến phát triển phần mềm từ một *nghề thủ công*, nơi các nghệ nhân lành nghề có thể tạo ra những tác phẩm one-off, thành một ngành *kỹ thuật*, vốn hàm ý tính lặp lại được, sự chặt chẽ và phân tích hiệu quả. Mặc dù kỹ thuật phần mềm vẫn tụt hậu so với các ngành kỹ thuật khác nhiều bậc độ lớn (công bằng mà nói, phần mềm là một ngành rất non trẻ so với hầu hết các loại kỹ thuật khác), các kiến trúc sư đã có những cải tiến lớn, mà chúng tôi sẽ thảo luận. Đặc biệt, các thực hành kỹ thuật Agile hiện đại đã cho phép những bước tiến lớn về các loại hệ thống mà kiến trúc sư thiết kế.

Chúng tôi cũng đề cập vấn đề cực kỳ quan trọng là *trade-off analysis* (phân tích đánh đổi). Là một developer phần mềm, rất dễ trở nên say mê một công nghệ hay cách tiếp cận cụ thể. Nhưng kiến trúc sư phải luôn tỉnh táo đánh giá cái tốt, cái xấu và cái tệ hại của mọi lựa chọn, và hầu như không có gì trong thế giới thực mang lại những lựa chọn nhị phân tiện lợi—mọi thứ đều là trade-off. Với góc nhìn thực dụng này, chúng tôi cố gắng loại bỏ các phán xét giá trị về công nghệ và thay vào đó tập trung vào phân tích trade-offs để trang bị cho độc giả con mắt phân tích đối với các lựa chọn công nghệ.

Cuốn sách này sẽ không biến ai đó thành kiến trúc sư phần mềm chỉ sau một đêm—đó là một lĩnh vực tinh tế với nhiều khía cạnh. Chúng tôi muốn cung cấp cho các kiến trúc sư hiện tại và đang lên một cái nhìn tổng quan hiện đại tốt về software architecture và nhiều khía cạnh của nó, từ cấu trúc đến soft skill. Mặc dù cuốn sách này đề cập các pattern well-known, chúng tôi chọn một cách tiếp cận mới, dựa vào các bài học kinh nghiệm, công cụ, thực hành kỹ thuật và các nguồn đầu vào khác. Chúng tôi lấy nhiều tiên đề hiện có trong software architecture và suy nghĩ lại chúng dưới ánh sáng của hệ sinh thái hiện tại, và thiết kế các architecture có tính đến bối cảnh hiện đại.

<a id="id675"></a>

## Quy ước dùng trong cuốn sách này

Các quy ước trình bày chữ sau được dùng trong cuốn sách này:

***Chữ nghiêng***

Chỉ các thuật ngữ mới, URL, địa chỉ email, tên file và phần mở rộng file.

**`Constant width`**

Dùng cho các listing chương trình, cũng như bên trong đoạn văn để chỉ các phần tử chương trình như tên biến hay tên hàm, cơ sở dữ liệu, kiểu dữ liệu, biến môi trường, câu lệnh và từ khóa.

> **Mẹo**
>
> Phần tử này biểu thị một mẹo hay gợi ý.

> **Lưu ý**
>
> Phần tử này biểu thị một lưu ý chung.

> **Cảnh báo**
>
> Phần tử này biểu thị một cảnh báo hay lời nhắc thận trọng.

<a id="id676"></a>

## Tài liệu bổ sung

Truy cập [*http://fundamentalsofsoftwarearchitecture.com*](http://fundamentalsofsoftwarearchitecture.com) để có các tài nguyên bổ sung cho cuốn sách này.

Nếu bạn có câu hỏi kỹ thuật hay gặp vấn đề khi dùng các ví dụ code, vui lòng gửi email tới [*bookquestions@oreilly.com*](mailto:bookquestions@oreilly.com).

Cuốn sách này ở đây để giúp bạn hoàn thành công việc. Nói chung, nếu code ví dụ được cung cấp cùng cuốn sách này, bạn có thể dùng nó trong chương trình và tài liệu của mình. Bạn không cần liên hệ với chúng tôi để xin phép trừ khi bạn sao chép một phần đáng kể của code. Ví dụ, viết một chương trình dùng vài đoạn code từ cuốn sách này không cần xin phép. Bán hay phân phối các ví dụ từ sách của O’Reilly thì cần xin phép. Trả lời một câu hỏi bằng cách trích dẫn cuốn sách này và trích code ví dụ không cần xin phép. Đưa một lượng đáng kể code ví dụ từ cuốn sách này vào tài liệu sản phẩm của bạn thì cần xin phép.

Chúng tôi trân trọng, nhưng nói chung không đòi hỏi, việc ghi nguồn. Việc ghi nguồn thường bao gồm tên sách, tác giả, nhà xuất bản và ISBN. Ví dụ: “*Fundamentals of Software Architecture*, Second Edition, by Mark Richards and Neal Ford (O’Reilly). Copyright 2025 Mark Richards and Neal Ford, 978-1-098-17551-1.”

Nếu bạn cảm thấy việc dùng các ví dụ code của mình nằm ngoài phạm vi sử dụng hợp lý hay sự cho phép nêu trên, cứ thoải mái liên hệ với chúng tôi tại [*permissions@oreilly.com*](mailto:permissions@oreilly.com).

<a id="id677"></a>

## O’Reilly Online Learning

> **Lưu ý**
>
> Trong hơn 40 năm, [*O’Reilly Media*](http://oreilly.com) đã cung cấp đào tạo, kiến thức và hiểu biết về công nghệ và kinh doanh để giúp các công ty thành công.

Mạng lưới chuyên gia và nhà đổi mới độc đáo của chúng tôi chia sẻ kiến thức và chuyên môn của họ qua sách, bài viết và nền tảng học trực tuyến của chúng tôi. Nền tảng học trực tuyến của O’Reilly cho bạn quyền truy cập on-demand vào các khóa đào tạo trực tiếp, các lộ trình học in-depth, các môi trường lập trình tương tác và một bộ sưu tập khổng lồ văn bản và video từ O’Reilly và 200+ nhà xuất bản khác. Để biết thêm thông tin, vui lòng truy cập [*http://oreilly.com*](http://oreilly.com).

<a id="id678"></a>

## Cách liên hệ với chúng tôi

Vui lòng gửi nhận xét và câu hỏi về cuốn sách này tới nhà xuất bản:

- O’Reilly Media, Inc.
- 1005 Gravenstein Highway North
- Sebastopol, CA 95472
- 800-889-8969 (tại Hoa Kỳ hay Canada)
- 707-827-7019 (quốc tế hay nội địa)
- 707-829-0104 (fax)
- [*support@oreilly.com*](mailto:support@oreilly.com)
- [*https://oreilly.com/about/contact.html*](https://oreilly.com/about/contact.html)

Chúng tôi có một trang web cho cuốn sách này, nơi chúng tôi liệt kê errata, ví dụ và mọi thông tin bổ sung. Bạn có thể truy cập trang này tại [*https://oreil.ly/fundamentals-of-software-architecture-2e*](https://oreil.ly/fundamentals-of-software-architecture-2e).

Để biết tin tức và thông tin về sách và khóa học của chúng tôi, hãy truy cập [*https://oreilly.com*](https://oreilly.com).

Tìm chúng tôi trên LinkedIn: [*https://linkedin.com/company/oreilly-media*](https://linkedin.com/company/oreilly-media).

Xem chúng tôi trên YouTube: [*https://youtube.com/oreillymedia*](https://youtube.com/oreillymedia).

<a id="id679"></a>

## Lời cảm ơn

Mark và Neal xin cảm ơn tất cả những người đã tham dự các lớp học, workshop, phiên hội nghị và buổi gặp mặt nhóm người dùng của chúng tôi, cũng như tất cả những người đã lắng nghe các phiên bản của tài liệu này và đưa ra phản hồi vô giá. Chúng tôi cũng xin cảm ơn đội ngũ xuất bản tại O’Reilly, những người đã giúp việc viết sách trở nên ít vất vả nhất có thể. Đặc biệt, chúng tôi xin cảm ơn các biên tập viên ấn bản đầu tiên, Alicia Young và Virginia Wilson, và biên tập viên ấn bản thứ hai, Sarah Grey.

<a id="id680"></a>

### Lời cảm ơn từ Mark Richards

Ngoài những lời cảm ơn ở trên, tôi xin cảm ơn người vợ đáng yêu của tôi, Rebecca. Việc em gánh vác mọi việc khác ở nhà và hy sinh cơ hội làm cuốn sách của riêng mình đã cho phép anh nhận thêm các hợp đồng tư vấn và diễn thuyết tại nhiều hội nghị và lớp đào tạo hơn, cho anh cơ hội thực hành và mài giũa tài liệu cho cuốn sách này. Em là tuyệt vời nhất.

<a id="id681"></a>

### Lời cảm ơn từ Neal Ford

Tôi xin cảm ơn đại gia đình của tôi, Thoughtworks với tư cách một tập thể, và Rebecca Parsons cùng Martin Fowler với tư cách những thành viên riêng lẻ của nó. Thoughtworks là một nhóm người phi thường, những người tạo ra giá trị cho khách hàng đồng thời luôn để mắt tới lý do mọi thứ hoạt động để chúng tôi có thể cải tiến chúng. Thoughtworks đã hỗ trợ cuốn sách này theo nhiều cách và tiếp tục nuôi dưỡng những Thoughtworker thách thức và truyền cảm hứng mỗi ngày. Tôi cũng xin cảm ơn câu lạc bộ cocktail khu phố của chúng tôi vì những lần thoát khỏi thói quen thường nhật. Cuối cùng, tôi xin cảm ơn vợ tôi, Candy, người mà sự bao dung cho những việc như viết sách và diễn thuyết hội nghị dường như không có giới hạn. Trong nhiều thập kỷ, cô ấy đã giữ cho tôi vững vàng và đủ tỉnh táo để hoạt động, và tôi hy vọng cô ấy sẽ tiếp tục như vậy trong nhiều thập kỷ nữa với tư cách tình yêu của đời tôi.
