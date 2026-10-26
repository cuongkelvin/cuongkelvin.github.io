# Kết luận: Chưa phải kết thúc, chỉ mới là khởi đầu

Bạn không bao giờ thực sự *học xong* assembly language.

Bạn có thể cải thiện kỹ năng của mình theo thời gian bằng cách đọc những cuốn sách hay về chủ đề này, bằng cách đọc code tốt do người khác viết, và trên hết, bằng cách tự mình viết và assemble thật nhiều, thật nhiều code. Nhưng sẽ không có lúc nào bạn có thể đứng lên và nói rằng tôi đã *biết* nó.

Bạn không nên cảm thấy tệ về điều này. Thực ra, tôi lấy được chút khích lệ khi thỉnh thoảng nghe rằng Michael Abrash, tác giả của *Zen of Assembly Language*, *Zen of Code Optimization*, và bộ tuyển tập khổng lồ *Michael Abrash's Graphics Programming Black Book*, đã học được điều gì đó mới về assembly language. Michael đã viết code assembly high-performance gần 40 năm và đã trở thành một trong hai hay ba lập trình viên assembly language giỏi nhất ở Tây bán cầu.

Nếu Michael vẫn còn đang học, liệu có hy vọng cho những người còn lại chúng ta không?

Câu hỏi sai. Câu hỏi *ngớ ngẩn*. Nếu Michael vẫn còn đang học, điều đó có nghĩa là *tất cả* chúng ta đều là học trò và sẽ luôn là học trò. Nó có nghĩa là hành trình chính là mục tiêu, và chừng nào chúng ta còn tiếp tục thăm dò, hack, mày mò và thử những điều chúng ta chưa từng thử trước đây, theo thời gian chúng ta sẽ nâng cao trình độ của lĩnh vực và tạo ra những chương trình có thể khiến những người tiên phong trong lĩnh vực của chúng ta phải há hốc miệng vào năm 1977.

Bởi vì mục đích không phải là chinh phục chủ đề mà là sống cùng nó và lớn lên cùng kiến thức của bạn về nó. Hành trình *chính là* mục tiêu, và với cuốn sách này, tôi đã cố gắng hết sức để giúp những người từng bị đông cứng vì sợ hãi khi nghĩ đến việc bắt đầu hành trình, những người nhìn chằm chằm vào sự phức tạp của tất cả và tự hỏi viên gạch đầu tiên trên Con Đường Gạch Vàng đó có thể nằm ở đâu.

Nó ở *đây*, chẳng cần gì hơn ngoài niềm tin chắc chắn rằng bạn có thể làm được.

Bạn có thể. Vấn đề không chỉ giới hạn ở assembly language. Hãy xem trải nghiệm của chính tôi: tôi ra trường vào năm suy thoái 1974 với tấm bằng cử nhân tiếng Anh loại xuất sắc (summa cum laude), và không có mấy triển vọng đáng tin cậy ngoài việc lái taxi. Tôi khéo léo xoay xở để vào làm việc cho Xerox Corporation, sửa máy photocopy. Sách thì vui, nhưng giấy tờ mới ra tiền—vì vậy tôi xách một túi đồ nghề và đã có một quãng thời gian tuyệt vời trong vài năm trước khi khéo léo xoay xở để có được một vị trí lập trình máy tính. (Tôi đã làm điều đó bằng cách nào? Tôi tự học lập trình…bằng cách đọc sách và thử nghiệm.)

Nhưng tôi sẽ không bao giờ quên khoảnh khắc khủng khiếp đầu tiên khi tôi nhìn qua vai một kỹ thuật viên lành nghề vào một chiếc máy photocopy model 660 đã tháo các tấm vỏ, và thấy một thứ trông như một cái hố không đáy gồm những cái cam nhỏ, bánh răng, trống và xích đĩa đang quay, lật và gạt các cơ cấu chấp hành công tắc qua lại. Bị sự phức tạp đó thôi miên, tôi quên không để ý rằng một tờ giấy đã được đưa qua máy và biến thành một bản sao của tài liệu gốc. Tôi khiếp sợ rằng mình sẽ không bao giờ học được tất cả những cái cam nhỏ đó làm gì, và đã bỏ lỡ sự đơn giản đầy an ủi của Bức Tranh Tổng Thể—rằng một chiếc máy photocopy thì tạo ra bản sao.

Đó là Điểm Khởi Đầu: khám phá Bức Tranh Tổng Thể. Hãy tạm bỏ qua những cái cam và bánh răng. Bạn có thể làm được. Hãy tìm ra điều gì quan trọng trong việc giữ cho Bức Tranh Tổng Thể gắn kết với nhau (hãy hỏi ai đó nếu điều đó không hiển nhiên) và nghiên cứu nó trước khi đi xuống những cái cam và bánh răng. Hãy định vị các quá trình đang diễn ra. Hãy chia Bức Tranh Tổng Thể thành các bức tranh con. Hãy xem mọi thứ lưu chuyển thế nào. Chỉ khi đó bạn mới nên tập trung vào một thứ nhỏ bé và lạc lõng trong mớ hỗn độn như một cái cam hay một công tắc riêng lẻ.

Đó là cách bạn chinh phục sự phức tạp, và đó là cách tôi đã trình bày assembly language trong cuốn sách này. Một số người có thể nói rằng tôi đã cắt xén instruction set, nhưng việc trình bày toàn bộ instruction set (khổng lồ) chưa bao giờ là mục tiêu thực sự ở đây.

Mục tiêu thực sự là chinh phục nỗi sợ của bạn trước sự phức tạp của chủ đề, bằng một vài phép ẩn dụ, rất nhiều hình vẽ và (điều này thực sự quan trọng!) một tâm hồn nhẹ nhõm.

Nó có hiệu quả không? Bạn hãy cho tôi biết. Tôi thực sự muốn biết.

<a id="head-2-56"></a>

## Giờ đi đâu tiếp?

Đôi khi người ta khó chịu với tôi vì cuốn sách này (đã tồn tại qua năm ấn bản kể từ năm 1990) không đi sâu hơn vào chủ đề. Tôi giữ vững quan điểm: *Cuốn sách này nói về những sự khởi đầu*, và tôi sẽ không cắt xén phần khởi đầu để thêm nhiều nội dung hơn vào phần cuối. (Sách chỉ có thể to đến một mức nào đó thôi!) Để đi xa hơn, bạn sẽ phải đặt cuốn sách này sang một bên và tự mình tiếp tục.

Cách tiếp cận chung của bạn nên giống như thế này:

1. Nghiên cứu Linux.
2. Nghiên cứu assembly language.
3. Viết code.
4. Viết thêm code.

Không thiếu sách hay về Linux. Có những cuốn sách cho người mới bắt đầu về hầu hết các bản phân phối phổ biến, bao gồm Linux Mint. Hãy xem trên Amazon và ở thư viện công cộng của bạn. Còn về cuốn sách tiếp theo của bạn về assembly language, đây là hai cuốn tôi có và khuyên dùng.

<a id="head-2-57"></a>

## *The Art of 64-bit Assembly* của Randall Hyde (No Starch Press, 2022)

Nếu bạn đang tìm cuốn sách tiếp theo về assembly language, hãy cân nhắc cuốn này. Đó là một trong những cuốn sách hay nhất hiện có. (Nó cũng khổng lồ, dày 1,001 trang!) Nó trình bày toàn bộ hệ thống con toán học AVX, nhiều chủ đề intermediate-to-advanced khác, và nhiều machine instruction hơn nữa. Một lưu ý: cuốn sách nhắm đến Windows và MASM assembler, và không phải mọi nội dung của nó đều áp dụng được cho Linux. IDE cần dùng là Visual Studio của Microsoft. (VS Code sẽ không dùng được.) Cuốn sách này cũng không trình bày ngôn ngữ High-Level Assembler (HLA) của chính Randy, vốn là trọng tâm của ấn bản năm 2003 của ông.

<a id="head-2-58"></a>

## *Modern x86 Assembly Language Programming* của David Kusswurm (Apress, 2018)

Tôi coi đây là một cuốn sách về các chủ đề nâng cao, nhưng là một cuốn hay. Một phần *khổng lồ* của cuốn sách nói về hệ thống con toán học AVX. Lập trình x64 cốt lõi được trình bày sơ qua ở phần đầu. Tiêu đề hơi gây hiểu lầm một chút: cuốn sách tập trung hoàn toàn vào các bộ xử lý x64. Nếu toán học tính toán khiến bạn tò mò, đây là phần trình bày AVX đầy đủ nhất mà tôi từng thấy trong một cuốn sách.

Hãy nhớ rằng các ấn bản ebook của sách máy tính có một thói quen xấu là làm xáo trộn các bảng, đoạn code và sơ đồ kỹ thuật. Dù tôi yêu thích ebook đến đâu, với các chủ đề kỹ thuật tôi luôn mua sách giấy.

<a id="head-2-59"></a>

## Bước ra khỏi Điểm Khởi đầu

Được rồi, với vài cuốn sách mới trong tay và một đêm ngon giấc phía sau, hãy tự mình khởi hành một chút. Hãy đặt cho mình một mục tiêu và cố gắng đạt được nó: một điều gì đó *khó*, chẳng hạn một tiện ích assembly language định vị tất cả các file trên một cây thư mục được chỉ định có một tên file mơ hồ (ambiguous) cho trước. Điều đó là đầy tham vọng đối với một người mới và sẽ cần chút nghiên cứu, học hỏi và (có lẽ) vài lần khởi đầu sai. Nhưng bạn có thể làm được, và một khi bạn làm được, bạn sẽ là một lập trình viên assembly language lành nghề thực thụ.

Trở thành bậc thầy đòi hỏi công sức và thời gian. Sách chỉ có thể đưa bạn đi xa đến một mức nào đó. Rốt cuộc, bạn sẽ phải là người thầy của chính mình và tự định hướng lộ trình học tập của mình. Ngày nay, làm chủ assembly có nghĩa là hiểu kernel của hệ điều hành và bộ máy low-level của nó, như device driver. Bạn sẽ cần học C thật tốt để làm được điều đó, nhưng không có cách nào khác. (Nhìn về phía trước, bạn cũng có thể cân nhắc học một ngôn ngữ mới tên là Rust, ngôn ngữ có thể—và nên—là ngôn ngữ thay thế C.) Ngày càng nhiều, làm chủ assembly cũng có thể bao gồm việc viết code chạy trên các graphics coprocessor high-performance như của Nvidia. Ngày nay, ngành công nghiệp game là động lực thúc đẩy điện toán desktop hiệu năng cao, và mặc dù viết phần mềm đồ họa high-performance là một thử thách rất khó, kết quả có thể ngoạn mục.

Nhưng dù rốt cuộc bạn đi theo hướng nào, *hãy tiếp tục lập trình*. Bất kể bạn viết loại code nào, bạn sẽ học được những điều trong khi viết nó dẫn đến những thử thách mới. Học một điều gì đó mới luôn đi kèm với việc nhận ra rằng còn rất nhiều điều nữa để học. Nghiên cứu là cần thiết, nhưng nếu không có thực hành liên tục và khá quyết liệt, nghiên cứu sẽ không giúp được gì, và kiến thức tĩnh không được củng cố bằng trải nghiệm real-world sẽ trở nên lỗi thời *cực kỳ* nhanh.

Đôi khi nó trở nên đáng sợ. Độ phức tạp của ngành tính toán dường như tăng gấp đôi sau mỗi vài năm. Dù vậy, hãy luôn tự nhủ: *Tôi có thể làm được điều này*.

Đi đến chỗ tin vào sự thật trong câu nói đó là bản chất của việc bước ra khỏi Điểm Khởi Đầu—và phần còn lại của con đường, giống như mọi con đường, được đi từng bước một.
