# Lời giới thiệu

## ***“Sao bạn lại muốn làm*** **thế?”**

Đó là năm 1985, và tôi đang ngồi trên một chiếc xe buýt thuê ở thành phố New York, đi tới một buổi tiếp đón báo chí cùng với một đám những kẻ tự cao tự đại khác của giới truyền thông đang bồn chồn không yên. Khi ấy tôi mới chỉ bắt đầu sự nghiệp nhà báo công nghệ của mình (với vai trò biên tập viên kỹ thuật cho tạp chí *PC Tech Journal*), và cuốn sách đầu tiên của tôi vẫn còn cách đó nhiều tháng nữa. Tình cờ tôi ngồi cạnh một cây bút/bậc thầy (guru) về lập trình đã có tiếng tăm, người mà tôi rất nể phục và tôi cứ huyên thuyên với ông ta về chuyện này chuyện nọ. Tôi muốn bỏ câu này đi; nó chẳng thêm được gì mấy cho cuốn sách, và dù ông ta có khó chịu đến đâu, mặc dù chúng ta không nêu tên ông ta, giờ đây tôi đã hiểu vì sao ông ta lại khó chịu đến vậy: Ông ta sống và làm việc trong một nền văn hóa hoàn toàn khác với tôi.

Trong lúc trò chuyện, tôi tình cờ buột miệng nói rằng mình là một tín đồ cuồng nhiệt của Turbo Pascal, và điều tôi thật sự muốn làm là học cách viết các chương trình Turbo Pascal sử dụng giao diện người dùng Microsoft Windows mới toanh. Ông ta nhăn mũi và nhếch mép cười méo xệch, trước khi thốt ra Câu Hỏi Khét Tiếng:

“Sao bạn lại muốn làm *thế*?”

Trước đó tôi chưa từng nghe câu hỏi này (dù về sau tôi sẽ còn nghe nó rất nhiều lần), và nó khiến tôi sững người. Tại sao ư? Bởi vì, ừm, bởi vì…tôi muốn biết nó *hoạt động* như thế nào.

“Hừ. Đó là việc của C.”

Bàn thêm cũng chẳng đưa tôi đi đến đâu theo hướng Pascal cả. Nhưng sau một hồi dò hỏi, tôi hiểu ra rằng bạn *không thể* viết ứng dụng Windows bằng Turbo Pascal. Điều đó là bất khả. Hoặc là…vị cây bút/bậc thầy lập trình kia không biết cách làm. Có lẽ là cả hai. Tôi chưa bao giờ biết được sự thật vào thời điểm năm 1985 ấy. (Delphi đã trả lời dứt điểm câu hỏi đó vào năm 1995.) Nhưng tôi đã học được ý nghĩa của Câu Hỏi Khét Tiếng.

Hãy ghi nhớ kỹ: Khi ai đó hỏi bạn, “Sao bạn lại muốn làm *thế*?” thì điều họ thật sự muốn nói là thế này: “Bạn đã hỏi tôi cách làm một việc mà hoặc là bất khả khi dùng những công cụ tôi ưa thích, hoặc là hoàn toàn nằm ngoài kinh nghiệm của tôi, nhưng tôi không muốn mất mặt bằng cách thừa nhận điều đó. Vậy thì…dạo này đội Blackhawks chơi thế nào nhỉ?”

Tôi đã nghe nó lặp đi lặp lại suốt nhiều năm:

Hỏi: Làm sao để tôi thiết lập một C string sao cho có thể đọc được độ dài của nó mà không cần quét qua nó?

Đáp: Sao bạn lại muốn làm *thế?*

Hỏi: Làm sao để tôi viết một subroutine bằng assembly language có thể được gọi từ Turbo Pascal?

Đáp: Sao bạn lại muốn làm *thế?*

Hỏi: Làm sao để tôi viết ứng dụng Windows bằng assembly language?

Đáp: Sao bạn lại muốn làm *thế?*

Bạn hiểu ý rồi đấy. Câu trả lời cho Câu Hỏi Khét Tiếng lúc nào cũng như nhau, và nếu có bao giờ những kẻ láu cá đó hỏi bạn câu ấy, hãy đáp trả càng nhanh càng tốt: *vì tôi muốn biết nó hoạt động như thế nào*.

Đó là một câu trả lời hoàn toàn đầy đủ. Đó là câu trả lời mà tôi đã dùng trong mọi lần, ngoại trừ một lần cách đây khá nhiều năm, khi tôi đưa ra ý định viết một cuốn sách dạy người ta lập trình bằng assembly language như là trải nghiệm lập trình *đầu tiên* của họ.

Hỏi: Trời đất ơi, sao bạn lại muốn làm *thế?*

Đáp: Bởi vì đó là cách tốt nhất hiện có để xây dựng những kỹ năng cần thiết nhằm hiểu được *toàn bộ phần còn lại* của vũ trụ lập trình hoạt động như thế nào.

Làm một lập trình viên, trên hết mọi thứ, là một điều: Đó là hiểu được mọi thứ hoạt động như thế nào. Hơn nữa, học để trở thành lập trình viên gần như hoàn toàn là một quá trình học xem mọi thứ hoạt động ra sao. Việc này có thể được thực hiện ở nhiều cấp độ khác nhau, tùy thuộc vào công cụ bạn đang dùng. Nếu bạn lập trình bằng Visual Basic, bạn phải hiểu một số thứ hoạt động như thế nào, nhưng nhìn chung những thứ đó chỉ gói gọn bên trong chính Visual Basic. Rất nhiều bộ máy bị che giấu bởi lớp mà Visual Basic đặt vào giữa lập trình viên và máy tính. (Điều này cũng đúng với Delphi, Lazarus, Java, Python, và nhiều môi trường lập trình very high-level khác.) Nếu bạn dùng một C compiler, bạn ở gần máy hơn rất nhiều, nên bạn thấy được nhiều hơn hẳn phần bộ máy đó—và do vậy, bạn phải hiểu nó hoạt động như thế nào thì mới dùng được nó. Tuy nhiên, vẫn còn khá nhiều thứ bị che giấu, ngay cả với một lập trình viên C dày dạn.

Ngược lại, nếu bạn làm việc với assembly language, bạn ở gần máy hết mức có thể. Assembly language không che giấu *gì cả*, và không giữ lại chút sức mạnh nào. Dĩ nhiên, mặt trái là chẳng có lớp phép màu nào giữa bạn và máy để tha thứ cho mọi sự thiếu hiểu biết và “lo liệu” mọi thứ giúp bạn. Nếu bạn không hiểu một thứ gì đó hoạt động ra sao, bạn coi như chết đứng—trừ khi bạn biết đủ để tự mình tìm ra lời giải.

Đó là một điểm then chốt: Mục tiêu của tôi khi viết cuốn sách này không hoàn toàn là dạy bạn assembly language *tự thân nó*. Nếu cuốn sách này có một chỉ thị tối thượng nào đó, thì đó là truyền đạt một sự tò mò có kỷ luật về cỗ máy nằm bên dưới, cùng với một chút bối cảnh cơ bản để từ đó bạn có thể bắt đầu khám phá cỗ máy ở những tầng thấp nhất của nó—điều đó, và sự tự tin để dốc hết sức mình. Đây là những thứ khó, nhưng chẳng có gì mà bạn không thể làm chủ được nếu có đủ sự tập trung, kiên nhẫn, và thời gian cần thiết—mà tôi xin cảnh báo trước, thời gian đó có thể là đáng kể.

Thật ra, điều tôi thực sự đang dạy bạn ở đây là cách để học.

## ***Những gì bạn sẽ cần***

Để lập trình theo cách tôi định dạy, bạn sẽ cần một máy tính Intel 64-bit chạy một bản phân phối (distribution) Linux 64-bit. Bản tôi dùng khi chuẩn bị cuốn sách này là Linux Mint Cinnamon V20. 3 Una. “Una” ở đây là tên mã (code name) của phiên bản Linux Mint này. Nó chẳng là gì khác ngoài một cách nói ngắn gọn cho “Linux Mint 20.3.” Tôi khuyên dùng Mint; nó ít gây bất ngờ khó chịu cho tôi hơn bất kỳ distro nào khác mà tôi từng dùng—và tôi đã dùng Linux chỗ này chỗ kia kể từ khi nó mới xuất hiện. Tôi không nghĩ việc bạn dùng graphical shell nào quan trọng lắm. Tôi thích Cinnamon, nhưng bạn có thể dùng bất cứ thứ gì bạn thích hoặc quen thuộc.

Bạn cần sử dụng Linux ở mức người dùng một cách tương đối thành thạo. Tôi không thể dạy bạn cách cài đặt, cấu hình và chạy Linux trong cuốn sách này. Nếu bạn chưa quen với Linux, hãy kiếm một cuốn tài liệu hướng dẫn (tutorial) và làm theo từ đầu đến cuối. Có rất nhiều tài liệu như vậy trên mạng.

Bạn sẽ cần một phần mềm miễn phí tên là SASM, là một môi trường phát triển tích hợp (integrated development environment - IDE) đơn giản để lập trình assembly. Về cơ bản, nó gồm một editor, một hệ thống build, và một front end cho debugger chuẩn của Linux là `gdb`. Bạn cũng sẽ cần một assembler miễn phí tên là NASM.

Bạn không cần phải biết trước cách tải về, cài đặt và cấu hình những công cụ này bởi vì, vào những thời điểm thích hợp, tôi sẽ trình bày toàn bộ việc cài đặt và cấu hình công cụ cần thiết.

Xin lưu ý rằng những bản hiện thực Unix khác không dựa trên Linux kernel có thể không hoạt động chính xác theo cùng một cách ở bên dưới. Chẳng hạn, BSD Unix dùng những quy ước khác để thực hiện system call, và các phiên bản Unix khác như Solaris thì nằm ngoài kinh nghiệm của tôi.

Hãy nhớ rằng *cuốn sách này nói về architecture x64*. Trong chừng mực x64 bao hàm x86, tôi cũng sẽ dạy các thành phần của architecture x86. Khoảng cách giữa x86 32-bit và x64 64-bit hẹp hơn *rất nhiều* so với khoảng cách giữa x86 16-bit và x86 32-bit. Nếu bạn đã có nền tảng vững chắc về x86 32-bit, bạn sẽ lướt qua phần lớn cuốn sách này như ngựa phi nước đại. Nếu bạn làm được vậy, tuyệt—chỉ xin bạn nhớ rằng cuốn sách này dành cho những người mới bắt đầu lập trình trên CPU Intel.

Cũng hãy nhớ rằng cuốn sách này bị nhà xuất bản giới hạn về kích thước: Giấy, mực và bìa đâu phải miễn phí. Điều đó có nghĩa là tôi phải thu hẹp phạm vi những gì tôi dạy và giải thích trong các giới hạn ấy. Tôi ước gì mình có đủ chỗ để trình bày hệ thống con toán học AVX (AVX math subsystem). Nhưng tôi không có. Dù vậy, tôi dám cá rằng một khi đã đi hết cuốn sách này, bạn có thể tự mình tìm hiểu được phần lớn về nó.

## ***Kế hoạch tổng thể***

Cuốn sách này bắt đầu từ điểm khởi đầu, và ý tôi là đúng *điểm khởi đầu*. Có thể bạn đã ở đó rồi, hoặc đã vượt xa nó. Tôi tôn trọng điều đó. Tôi vẫn nghĩ rằng sẽ chẳng hại gì nếu bạn bắt đầu từ chương đầu tiên và đọc qua tất cả các chương theo thứ tự. Ôn lại là có ích, và này—có thể bạn sẽ nhận ra rằng mình không biết *nhiều đến thế* như mình tưởng. (Tôi gặp chuyện này suốt!)

Nhưng nếu thời gian là thứ quý giá, thì đây là bản tóm tắt nhanh (cheat sheet):

- Nếu bạn đã hiểu những ý tưởng nền tảng của lập trình máy tính, hãy bỏ qua [Chương 1](ch01_it_s_all_in_the_plan.vi.md).
- Nếu bạn đã hiểu những ý tưởng đằng sau các hệ cơ số khác ngoài hệ thập phân (đặc biệt là hexadecimal và binary), hãy bỏ qua [Chương 2](ch02_alien_bases.vi.md).
- Nếu bạn đã nắm được bản chất bên trong của máy tính (memory, CPU architecture, v.v.) hãy bỏ qua [Chương 3](ch03_lifting_the_hood.vi.md).
- Nếu bạn đã hiểu memory addressing của x64, hãy bỏ qua [Chương 4](ch04_location_location_location.vi.md).
- Không. Dừng lại. Gạch câu đó đi. Ngay cả khi bạn đã hiểu memory addressing của x64, *hãy đọc [Chương 4](ch04_location_location_location.vi.md)*.

Gạch đầu dòng cuối cùng nằm đó, và được nhấn mạnh, là có lý do: *Lập trình assembly language là chuyện về memory addressing*. Nếu bạn không hiểu memory addressing, thì chẳng có gì khác bạn học được trong assembly sẽ giúp ích cho bạn dù chỉ một…bit. Vì vậy, đừng bỏ qua [Chương 4](ch04_location_location_location.vi.md) cho dù bạn biết hay nghĩ rằng mình biết những gì khác đi nữa. Hãy bắt đầu từ đó, và theo nó đến tận cùng. Memory addressing xuất hiện thường xuyên trong suốt phần còn lại của cuốn sách. Nó thực sự là trái tim của chủ đề này.

Hãy nạp mọi chương trình ví dụ, assemble từng chương trình, và chạy tất cả chúng. Hãy cố gắng hiểu từng dòng một trong mọi chương trình. Đừng tin điều gì một cách mù quáng. Hơn nữa, đừng dừng lại ở đó. Hãy thay đổi các chương trình ví dụ khi mọi thứ bắt đầu trở nên có nghĩa với bạn. Hãy thử những cách tiếp cận khác nhau. Hãy thử những thứ mà tôi không đề cập. Hãy táo bạo. Không, cứ quậy tung lên—bit thì chẳng có cảm xúc, và điều tệ nhất có thể xảy ra là Linux ném ra một segmentation fault, thứ có thể làm hại chương trình của bạn nhưng không làm hại Linux. Chỉ có một điều kiện là khi bạn thử điều gì đó, hãy cố gắng hiểu vì sao nó *không* chạy một cách rõ ràng như khi bạn hiểu tất cả những thứ khác chạy được. Hãy Single-step qua một chương trình trong debugger của SASM, ngay cả khi chương trình chạy đúng. *Hãy ghi chép lại*.

Rốt cuộc, đó chính là điều tôi hướng tới: chỉ cho bạn con đường để hiểu được mọi ngóc ngách, dù xa xôi đến đâu, của máy tính đang làm gì và tất cả các bộ phận của nó phối hợp với nhau như thế nào. Điều này không có nghĩa là tôi sẽ tự mình giải thích mọi ngóc ngách đó—chẳng ai sống đủ lâu để làm việc ấy bởi vì ngành tính toán không còn đơn giản nữa—nhưng nếu bạn rèn luyện được tính kỷ luật của việc kiên nhẫn nghiên cứu và thử nghiệm, có lẽ bạn sẽ tự mình tìm ra được. Rốt cuộc, đó là cách duy nhất để học nó: tự mình học. Sự chỉ dẫn mà bạn tìm thấy—từ bạn bè, trên Net, trong những cuốn sách như cuốn này—chỉ là sự chỉ dẫn và dầu mỡ bôi trơn cho trục bánh xe. Bạn phải quyết định ai sẽ là chủ, bạn hay cỗ máy, và biến điều đó thành sự thật. Lập trình viên assembly là những lập trình viên duy nhất có thể thực sự tự nhận mình là bậc thầy làm chủ, và đó là một sự thật đáng để suy ngẫm.

## ***Đôi lời về quy ước viết hoa***

Assembly language khác thường trong số các ngôn ngữ lập trình ở chỗ không có một tiêu chuẩn chung nào về việc phân biệt chữ hoa chữ thường (case-sensitivity). Trong ngôn ngữ C, mọi identifier đều case-sensitive, và tôi đã từng thấy những assembler hoàn toàn không nhận ra sự khác biệt giữa chữ hoa và chữ thường. NASM, assembler mà tôi trình bày trong cuốn sách này, chỉ case-sensitive đối với các programmer-defined identifier. Tuy nhiên, các instruction mnemonic và tên của các register thì *không* phân biệt chữ hoa chữ thường.

Có những thông lệ trong tài liệu về assembly language, và một trong những thông lệ đó là viết các CPU instruction mnemonic bằng chữ hoa trong phần văn bản của chương và bằng chữ thường trong các file source code cũng như các đoạn code xen kẽ trong văn bản. Tôi sẽ theo thông lệ đó ở đây. Trong phần văn bản thảo luận, tôi sẽ nói về `MOV` và `CALL` và `CMP`. Trong code ví dụ, chúng sẽ là `mov` và `call` và `cmp`. Các đoạn code và listing sẽ được in bằng font monospace Courier-style. Khi được nhắc đến trong văn bản, các register sẽ được viết hoa nhưng không dùng font Courier, và viết thường trong các đoạn code và listing.

Có hai lý do cho điều này:

- Trong phần văn bản thảo luận, các mnemonic cần phải nổi bật. Rất dễ để mất dấu chúng giữa một dòng thác những từ mixed-case thông thường.
- Để đọc và học từ những tài liệu và source code hiện có bên ngoài cuốn sách này, bạn cần có khả năng đọc assembly language một cách dễ dàng, bất kể nó được viết bằng chữ hoa, chữ thường hay lẫn lộn cả hai. Việc trở nên thoải mái với những cách khác nhau để diễn đạt cùng một thứ là điều quan trọng.

## ***Hãy nhớ vì sao bạn ở đây***

Dù sao đi nữa. Dù bạn chọn bắt đầu cuốn sách từ đâu, thì cũng đã đến lúc lên đường. Chỉ cần nhớ rằng bất cứ thứ gì chắn ngang trước mặt bạn, dù đó là những kẻ láu cá, cỗ máy, hay sự thiếu kinh nghiệm của chính bạn, thì điều cần luôn giữ ở vị trí hàng đầu trong tâm trí là thế này: *Bạn ở đây để tìm hiểu xem nó hoạt động như thế nào*.

Bắt đầu thôi.

Jeff Duntemann

Scottsdale, Arizona

Ngày 24 tháng Năm, 2023
