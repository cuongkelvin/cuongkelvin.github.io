<a id="idm45798382804872"></a>

# Lời nói đầu (Preface)

Khi hai trong số các tác giả, Neal và Mark, đang viết cuốn *Fundamentals of Software Architecture*, chúng tôi <a id="idm45798382802840"></a><a id="idm45798382979640"></a><a id="idm45798382979080"></a>liên tục gặp những ví dụ phức tạp trong architecture mà chúng tôi muốn đề cập nhưng lại quá khó. Mỗi ví dụ không đưa ra giải pháp dễ dàng nào mà chỉ là một tập hợp các trade-offs lộn xộn. Chúng tôi gác những ví dụ đó sang một đống mà chúng tôi gọi là “The Hard Parts” (Những phần khó). Khi cuốn sách đó hoàn thành, chúng tôi nhìn vào đống phần khó giờ đã khổng lồ và cố tìm hiểu: *vì sao những vấn đề này lại khó giải quyết đến vậy trong các architecture hiện đại*?

Chúng tôi lấy tất cả các ví dụ và giải quyết chúng như những kiến trúc sư, áp dụng phân tích trade-off cho từng tình huống, nhưng cũng chú ý đến quy trình chúng tôi dùng để đi đến các trade-offs. Một trong những phát hiện sớm của chúng tôi là tầm quan trọng ngày càng tăng của dữ liệu trong các architecture decision: ai có thể/nên truy cập dữ liệu, ai có thể/nên ghi vào nó, và làm sao quản lý sự tách biệt giữa dữ liệu phân tích (analytical) và dữ liệu vận hành (operational). Vì vậy, chúng tôi đã mời các chuyên gia trong những lĩnh vực đó tham gia cùng, điều cho phép cuốn sách này kết hợp đầy đủ việc ra quyết định từ cả hai góc độ: từ architecture đến dữ liệu và từ dữ liệu đến architecture.

Kết quả là cuốn sách này: một tập hợp các vấn đề khó trong software architecture hiện đại, các trade-offs khiến các quyết định trở nên khó khăn, và rốt cuộc là một hướng dẫn có minh họa để chỉ cho bạn cách áp dụng cùng phân tích trade-off đó cho các vấn đề riêng của bạn.

<a id="idm45798382975672"></a>

## Quy ước dùng trong cuốn sách này (Conventions Used in This Book)

Cuốn sách này dùng các quy ước trình bày sau:

***Italic***

Biểu thị thuật ngữ mới, URL, địa chỉ email, tên file và đường dẫn file.

**`Constant width`**

Được dùng cho các listing chương trình, cũng như trong đoạn văn để chỉ các phần tử chương trình như tên biến hoặc tên hàm, database, kiểu dữ liệu, biến môi trường, câu lệnh và từ khóa.

****`Constant width bold`****

Thể hiện lệnh hoặc văn bản khác mà người dùng phải gõ đúng nguyên văn.

***`Constant width italic`***

Thể hiện văn bản cần được thay bằng giá trị user-supplied (do người dùng cung cấp) hoặc bằng giá trị được xác định theo ngữ cảnh.

> **Mẹo**
>
> Phần tử này biểu thị một mẹo hoặc gợi ý.

<a id="idm45798382928328"></a>

## Dùng code ví dụ (Using Code Examples)

Tài liệu bổ sung (code ví dụ, bài tập, v.v.) có thể tải về tại [*http://architecturethehardparts.com*](http://architecturethehardparts.com).<a id="idm45798382924856"></a>

Nếu bạn có câu hỏi kỹ thuật hoặc gặp vấn đề khi dùng code ví dụ, vui lòng gửi email tới [*bookquestions@oreilly.com*](mailto:bookquestions@oreilly.com).

Cuốn sách này ở đây để giúp bạn hoàn thành công việc. Nhìn chung, nếu code ví dụ được cung cấp kèm cuốn sách này, bạn có thể dùng nó trong chương trình và tài liệu của mình. Bạn không cần liên hệ để xin phép trừ khi bạn tái tạo một phần đáng kể của code. Ví dụ, viết một chương trình dùng vài đoạn code từ cuốn sách này không cần xin phép. Bán hoặc phân phối các ví dụ từ sách của O’Reilly thì cần xin phép. Trả lời một câu hỏi bằng cách trích dẫn cuốn sách này và trích code ví dụ không cần xin phép. Đưa một lượng đáng kể code ví dụ từ cuốn sách này vào tài liệu sản phẩm của bạn thì cần xin phép.

Chúng tôi trân trọng, nhưng nhìn chung không yêu cầu, việc ghi nguồn. Một ghi nguồn thường bao gồm tựa sách, tác giả, nhà xuất bản và ISBN. Ví dụ: “*Software Architecture: The Hard Parts* của Neal Ford, Mark Richards, Pramod Sadalage và Zhamak Dehghani (O’Reilly). Copyright 2022 Neal Ford, Mark Richards, Pramod Sadalage và Zhamak Dehghani, 978-1-492-08689-5.”

Nếu bạn cảm thấy việc dùng code ví dụ của mình nằm ngoài phạm vi sử dụng hợp lý hoặc sự cho phép nêu trên, cứ thoải mái liên hệ với chúng tôi tại [*permissions@oreilly.com*](mailto:permissions@oreilly.com).

<a id="idm45798397463160"></a>

## Học trực tuyến O’Reilly (O’Reilly Online Learning)

> **Lưu ý**
>
> Trong hơn 40 năm, [*O’Reilly Media*](http://oreilly.com) đã cung cấp đào tạo, kiến thức và hiểu biết về công nghệ và kinh doanh để giúp các công ty thành công.

Mạng lưới chuyên gia và nhà đổi mới độc đáo của chúng tôi chia sẻ kiến thức và chuyên môn qua sách, bài báo và nền tảng học trực tuyến của chúng tôi. Nền tảng học trực tuyến của O’Reilly cho bạn quyền truy cập on-demand vào các khóa đào tạo trực tiếp, các lộ trình học in-depth, môi trường lập trình tương tác, và một bộ sưu tập khổng lồ văn bản và video từ O’Reilly và 200+ nhà xuất bản khác. Để biết thêm thông tin, hãy truy cập [*http://oreilly.com*](http://oreilly.com).

<a id="idm45798382951928"></a>

## Cách liên hệ với chúng tôi (How to Contact Us)

Vui lòng gửi ý kiến và câu hỏi về cuốn sách này tới nhà xuất bản:

- O’Reilly Media, Inc.
- 1005 Gravenstein Highway North
- Sebastopol, CA 95472
- 800-998-9938 (tại Hoa Kỳ hoặc Canada)
- 707-829-0515 (quốc tế hoặc trong nước)
- 707-829-0104 (fax)

Chúng tôi có một trang web cho cuốn sách này, nơi chúng tôi liệt kê errata, ví dụ, và mọi thông tin bổ sung. Bạn có thể truy cập trang này tại [*https://oreil.ly/sa-the-hard-parts*](https://oreil.ly/sa-the-hard-parts).

Gửi email tới [*bookquestions@oreilly.com*](mailto:bookquestions@oreilly.com) để góp ý hoặc đặt câu hỏi kỹ thuật về cuốn sách này.

Để biết tin tức và thông tin về sách và khóa học của chúng tôi, hãy truy cập [*http://oreilly.com*](http://oreilly.com).

Tìm chúng tôi trên Facebook: [*http://facebook.com/oreilly*](http://facebook.com/oreilly)

Theo dõi chúng tôi trên Twitter: [*http://twitter.com/oreillymedia*](http://twitter.com/oreillymedia)

Xem chúng tôi trên YouTube: [*http://youtube.com/oreillymedia*](http://youtube.com/oreillymedia)

<a id="idm45798382951304"></a>

## Lời cảm ơn (Acknowledgments)

Mark và Neal xin cảm ơn tất cả những người đã tham dự các lớp học (hầu như hoàn toàn trực tuyến), workshop, phiên hội nghị và buổi gặp mặt nhóm người dùng của chúng tôi, cũng như tất cả những người khác đã nghe các phiên bản của tài liệu này và đưa ra phản hồi vô giá. Lặp lại trên tài liệu mới đặc biệt khó khăn khi chúng tôi không thể làm trực tiếp, nên chúng tôi trân trọng những người đã góp ý cho nhiều lần lặp. Chúng tôi cảm ơn team xuất bản tại O’Reilly, những người đã làm cho trải nghiệm này dễ chịu nhất có thể đối với việc viết một cuốn sách. Chúng tôi cũng cảm ơn một vài ốc đảo ngẫu nhiên sanity-preserving (giữ sự tỉnh táo) và idea-sparking (khơi ý tưởng) có những cái tên như Pasty Geeks và Hacker B&B.

Cảm ơn những người đã review kỹ thuật cho cuốn sách của chúng tôi—Vanya Seth, Venkat Subramanian, Joost van Weenen, Grady Booch, Ruben Diaz, David Kloet, Matt Stein, Danilo Sato, James Lewis và Sam Newman. Những hiểu biết và phản hồi giá trị của các bạn đã giúp kiểm chứng nội dung kỹ thuật và làm cho cuốn sách tốt hơn.

Chúng tôi đặc biệt muốn ghi nhận nhiều người lao động và gia đình bị ảnh hưởng bởi đại dịch toàn cầu bất ngờ. Là những người lao động tri thức, chúng tôi chỉ gặp những bất tiện chẳng đáng là bao so với sự gián đoạn và tàn phá khổng lồ đối với rất nhiều bạn bè và đồng nghiệp ở mọi tầng lớp xã hội. Sự cảm thông và lòng biết ơn của chúng tôi đặc biệt gửi tới những nhân viên y tế, nhiều người trong số họ chưa bao giờ nghĩ sẽ ở tuyến đầu của một thảm kịch toàn cầu khủng khiếp nhưng đã đối mặt với nó một cách cao thượng. Lời cảm ơn chung của chúng tôi không bao giờ có thể diễn tả đầy đủ.

<a id="idm45798382822744"></a>

### Lời cảm ơn của Mark Richards (Acknowledgments from Mark Richards)

Ngoài những lời cảm ơn ở trên, tôi một lần nữa cảm ơn người vợ đáng yêu của tôi, Rebecca, vì đã chịu đựng tôi qua thêm một dự án sách nữa. Sự ủng hộ và lời khuyên không ngừng của em đã giúp cuốn sách này thành hiện thực, ngay cả khi điều đó có nghĩa là phải bớt thời gian làm cuốn tiểu thuyết của riêng em. Em là cả thế giới với anh, Rebecca. Tôi cũng cảm ơn người bạn tốt và đồng tác giả Neal Ford. Cộng tác với anh về tài liệu cho cuốn sách này (cũng như cuốn trước) thực sự là một trải nghiệm giá trị và bổ ích. Anh là, và sẽ luôn là, bạn của tôi.

<a id="idm45798382946408"></a>

### Lời cảm ơn của Neal Ford (Acknowledgments from Neal Ford)

Tôi xin cảm ơn đại gia đình của mình, Thoughtworks như một tập thể, và Rebecca Parsons cùng Martin Fowler như những cá nhân trong đó. Thoughtworks là một nhóm người phi thường, luôn tạo ra giá trị cho khách hàng trong khi vẫn để mắt đến lý do vì sao mọi thứ hoạt động để chúng tôi có thể cải thiện chúng. Thoughtworks đã hỗ trợ cuốn sách này theo nhiều cách và tiếp tục nuôi dưỡng những Thoughtworker luôn thách thức và truyền cảm hứng cho tôi mỗi ngày. Tôi cũng cảm ơn câu lạc bộ cocktail trong khu phố vì những lần thoát khỏi thói quen thường ngày, bao gồm các buổi gặp ngoài trời hằng tuần, giữ khoảng cách xã hội đã giúp tất cả chúng tôi vượt qua quãng thời gian kỳ lạ vừa trải qua. Tôi cảm ơn người bạn long-time Norman Zapien, người không bao giờ ngừng mang đến những cuộc trò chuyện thú vị. Cuối cùng, tôi cảm ơn vợ tôi, Candy, người tiếp tục ủng hộ lối sống khiến tôi chăm chú vào những thứ như viết sách thay vì vào những con mèo của chúng tôi quá nhiều.

<a id="idm45798382943912"></a>

### Lời cảm ơn của Pramod Sadalage (Acknowledgments from Pramod Sadalage)

Tôi cảm ơn vợ tôi, Rupali, vì tất cả sự ủng hộ và thấu hiểu, và hai cô con gái đáng yêu, Arula và Arhana, vì sự động viên; bố yêu cả hai con. Mọi công việc tôi làm sẽ không thể thực hiện được nếu không có những khách hàng tôi làm việc cùng và các hội nghị đã giúp tôi lặp lại trên các khái niệm và nội dung. Tôi cảm ơn AvidXchange, khách hàng gần đây nhất mà tôi đang làm việc cùng, vì sự hỗ trợ và cung cấp không gian tuyệt vời để lặp lại trên các khái niệm mới. Tôi cũng cảm ơn Thoughtworks vì sự hỗ trợ liên tục trong cuộc đời tôi, và Neal Ford, Rebecca Parsons và Martin Fowler vì là những người thầy tuyệt vời; các bạn làm cho tôi trở thành một người tốt hơn. Cuối cùng, cảm ơn bố mẹ tôi, đặc biệt là mẹ tôi, Shobha, người tôi nhớ mỗi ngày. *Con nhớ mẹ, MẸ ơi*.

<a id="idm45798382836664"></a>

### Lời cảm ơn của Zhamak Dehghani (Acknowledgments from Zhamak Dehghani)

Tôi cảm ơn Mark và Neal vì lời mời rộng mở đóng góp vào công trình tuyệt vời này. Sự đóng góp của tôi cho cuốn sách này sẽ không thể có được nếu không có sự ủng hộ liên tục của chồng tôi, Adrian, và sự kiên nhẫn của con gái tôi, Arianna. Tôi yêu cả hai người.
