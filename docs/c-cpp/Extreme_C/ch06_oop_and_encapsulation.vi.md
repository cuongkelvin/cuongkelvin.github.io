<a id="_idParaDest-99"></a>

# Chương 06: OOP và Encapsulation (OOP and Encapsulation)

Có rất nhiều sách và bài viết tuyệt vời về chủ đề lập trình object-oriented hay OOP. Nhưng tôi không nghĩ rằng nhiều trong số đó đề cập cùng chủ đề này bằng một ngôn ngữ non-OOP như C! Làm sao điều đó lại có thể? Liệu chúng ta có thể viết các chương trình object-oriented bằng một ngôn ngữ lập trình không hỗ trợ nó không? Nói chính xác hơn, có thể viết một chương trình object-oriented bằng C không?

Câu trả lời ngắn gọn cho câu hỏi trên là có, nhưng trước khi giải thích làm thế nào, chúng ta cần giải thích tại sao. Chúng ta cần chia nhỏ câu hỏi và xem OOP thực sự có nghĩa là gì. Tại sao có thể viết một chương trình object-oriented bằng một ngôn ngữ không hề tuyên bố hỗ trợ object-orientation? Điều này có vẻ như một nghịch lý, nhưng không phải vậy, và nỗ lực của chúng ta trong chương này là giải thích tại sao điều đó khả thi và nó nên được thực hiện như thế nào.

Một câu hỏi khác có thể làm bạn bối rối là việc có những thảo luận như vậy và biết về OOP thì có ích gì khi bạn sẽ dùng C làm ngôn ngữ lập trình chính? Gần như mọi code base C trưởng thành hiện có như các kernel mã nguồn mở, hiện thực của các dịch vụ như HTTPD, Postfix, nfsd, ftpd, và nhiều library C khác như OpenSSL và OpenCV, đều được viết theo kiểu object-oriented. Điều này không có nghĩa là C là object-oriented; thay vào đó, cách tiếp cận mà những dự án này đã chọn để tổ chức cấu trúc bên trong của chúng đến từ một tư duy object-oriented.

Tôi rất khuyến khích đọc chương này cùng với ba chương tiếp theo và tìm hiểu thêm về OOP vì, thứ nhất, nó sẽ cho phép bạn suy nghĩ và thiết kế giống như các kỹ sư đã thiết kế những library được đề cập ở trên, và thứ hai, nó sẽ rất có lợi khi đọc source của những library như vậy.

C không hỗ trợ các khái niệm object-oriented như class, inheritance và virtual function trong cú pháp của nó. Tuy nhiên, nó có hỗ trợ các khái niệm object-oriented – theo một cách gián tiếp. Thực tế, gần như mọi ngôn ngữ máy tính trong suốt lịch sử đều đã hỗ trợ OOP một cách nội tại – từ rất lâu trước thời của Smalltalk, C++ và Java. Đó là vì trong mọi ngôn ngữ lập trình general-purpose đều phải có một cách để mở rộng các kiểu dữ liệu của nó và đó là bước đầu tiên hướng tới OOP.

C không thể và *không nên* hỗ trợ các tính năng object-oriented trong cú pháp của nó; không phải vì tuổi tác của nó, mà vì những lý do rất xác đáng mà chúng ta sẽ nói đến trong chương này. Nói đơn giản, bạn vẫn có thể viết một chương trình object-oriented bằng C, nhưng cần thêm một chút nỗ lực để vượt qua sự phức tạp.

Có một vài cuốn sách và bài viết về OOP trong C, và chúng thường cố gắng tạo ra một *type system* để viết class, hiện thực inheritance, polymorphism, và nhiều thứ khác, bằng C. Những cuốn sách này xem việc bổ sung hỗ trợ OOP như một tập hàm, macro và một preprocessor, tất cả đều có thể được dùng cùng nhau để viết các chương trình object-oriented bằng C. Đây sẽ không phải là cách tiếp cận chúng ta chọn trong chương này. Chúng ta sẽ không tạo ra một C++ mới từ C; thay vào đó, chúng ta muốn suy xét xem C có tiềm năng được dùng cho OOP như thế nào.

Người ta thường nói rằng OOP là một paradigm lập trình khác bên cạnh các paradigm thủ tục (procedural) và hàm (functional). Nhưng OOP còn hơn thế. OOP giống một cách suy nghĩ về và phân tích một vấn đề hơn. Nó là một thái độ đối với vũ trụ và hệ thống phân cấp của các đối tượng trong đó. Nó là một phần của phương pháp cổ xưa, nội tại và được kế thừa của chúng ta để hiểu và phân tích các thực thể vật lý và trừu tượng xung quanh. Nó cơ bản đến mức gắn liền với sự hiểu biết của chúng ta về tự nhiên.

Chúng ta luôn nghĩ về mọi vấn đề từ một góc nhìn object-oriented. OOP chỉ là việc áp dụng cùng góc nhìn mà con người luôn chấp nhận, nhưng lần này dùng một ngôn ngữ lập trình để giải quyết một vấn đề tính toán. Tất cả những điều này giải thích tại sao OOP là paradigm lập trình phổ biến nhất được dùng để viết phần mềm.

Chương này, cùng với ba chương tiếp theo, sẽ cho thấy rằng mọi khái niệm trong OOP đều có thể được hiện thực trong C – dù việc đó có thể phức tạp. Chúng ta biết rằng chúng ta có thể có OOP với C vì một số người đã làm điều đó rồi, đặc biệt là khi họ tạo ra C++ trên nền C, và vì họ đã xây dựng nhiều chương trình phức tạp và thành công bằng C theo kiểu object-oriented.

Những gì các chương này sẽ *không* gợi ý là một library hay tập macro nhất định mà bạn nên dùng để khai báo một class hay thiết lập một quan hệ inheritance hay làm việc với các khái niệm OOP khác. Ngoài ra, chúng ta sẽ không áp đặt bất kỳ phương pháp luận hay kỷ luật nào như các quy ước đặt tên cụ thể. Chúng ta sẽ đơn giản dùng C thuần để hiện thực các khái niệm OOP.

Lý do tại sao chúng ta dành **trọn bốn chương** cho OOP với C là vì lý thuyết nặng nề đằng sau hướng đối tượng (object orientation) và nhiều ví dụ khác nhau cần được khám phá để minh họa tất cả. Phần lớn lý thuyết thiết yếu đằng sau OOP sẽ được giải thích trong chương này, trong khi các chủ đề thực tiễn hơn sẽ được xử lý trong các chương tiếp theo. Với tất cả những điều đã nói, chúng ta cần thảo luận lý thuyết vì các khái niệm OOP thường mới mẻ với hầu hết các lập trình viên C lành nghề, kể cả những người có nhiều năm kinh nghiệm.

Bốn chương sắp tới cùng nhau trình bày gần như mọi thứ mà bạn có thể gặp trong OOP. Trong chương này, chúng ta sẽ thảo luận những điều sau:

- Trước hết, chúng tôi sẽ đưa ra định nghĩa cho những thuật ngữ cơ bản nhất được dùng trong tài liệu OOP. Chúng tôi sẽ định nghĩa class, object, attribute, behavior, method, domain, và nhiều hơn nữa. Những thuật ngữ này sẽ được dùng rất nhiều trong suốt bốn chương này. Chúng cũng sống còn đối với việc bạn hiểu các tài liệu OOP-related khác vì chúng là một phần chủ yếu của ngôn ngữ được chấp nhận của OOP.
- Phần đầu tiên của chương này không hoàn toàn về thuật ngữ; chúng tôi cũng sẽ thảo luận nhiều về nguồn gốc của hướng đối tượng và triết lý đằng sau nó, khám phá bản chất của tư duy object-oriented.
- Phần thứ hai của chương này dành cho C và tại sao nó không, và không thể, là object-oriented. Đây là một câu hỏi quan trọng nên được đặt ra và trả lời đúng đắn. Chủ đề này sẽ được thảo luận thêm trong *Chương 10*, *Unix – Lịch sử và Architecture*, nơi chúng ta sẽ khám phá Unix và mối quan hệ gần gũi của nó với C.
- Phần thứ ba của chương này nói về *encapsulation*, một trong những khái niệm cơ bản nhất của OOP. Nói đơn giản, nó là thứ cho phép bạn tạo ra các object và dùng chúng. Việc bạn có thể đặt biến và method bên trong một object đến trực tiếp từ encapsulation. Điều này được thảo luận kỹ lưỡng trong phần thứ ba, và một số ví dụ được đưa ra.
- Sau đó chương chuyển sang *information-hiding*, một thứ giống như hệ quả phụ (dù là một hệ quả rất quan trọng) của việc có encapsulation. Không có information-hiding, chúng ta sẽ không thể cô lập và tách rời các module phần mềm, và về thực chất chúng ta sẽ không thể cung cấp các API implementation-independent cho client. Đây là điều cuối cùng chúng ta thảo luận trong chương này.

Như đã đề cập, toàn bộ chủ đề sẽ trải qua bốn chương, với các chương tiếp theo bắt đầu từ quan hệ *composition*. Từ đó, các chương sắp tới sẽ trình bày *aggregation*, *inheritance*, *polymorphism*, *abstraction*.

Tuy nhiên, trong chương này, chúng ta sẽ bắt đầu với lý thuyết đằng sau OOP và xem cách chúng ta có thể trích xuất một object model từ quá trình suy nghĩ của mình về một thành phần phần mềm.

<a id="_idParaDest-100"></a>

## Tư duy Object-oriented

Như chúng ta đã nói trong phần giới thiệu chương, tư duy object-oriented là cách mà chúng ta chia nhỏ <a id="_idIndexMarker464"></a>và phân tích những gì bao quanh mình. Khi bạn nhìn một chiếc bình trên bàn, bạn có thể hiểu rằng chiếc bình và cái bàn là các object riêng biệt mà không cần phân tích nặng nề nào.

Một cách vô thức, bạn nhận thức được rằng có một đường biên giữa chúng ngăn cách chúng. Bạn biết rằng bạn có thể thay đổi màu của chiếc bình, và màu của cái bàn sẽ vẫn không đổi.

Những quan sát này cho chúng ta thấy rằng chúng ta nhìn môi trường của mình từ một góc nhìn object-oriented. Nói cách khác, chúng ta chỉ đang tạo ra một sự phản chiếu của thực tại object-oriented xung quanh trong tâm trí mình. Chúng ta cũng thấy điều này rất nhiều trong game máy tính, phần mềm mô hình 3D và phần mềm kỹ thuật, tất cả đều có thể bao gồm nhiều object tương tác với nhau.

OOP là việc đưa tư duy object-oriented vào thiết kế và phát triển phần mềm. Tư duy Object-oriented là cách mặc định để chúng ta xử lý môi trường xung quanh, và đó là lý do tại sao OOP đã trở thành paradigm được dùng phổ biến nhất để viết phần mềm.

Dĩ nhiên, có những vấn đề sẽ khó giải quyết nếu bạn đi theo cách tiếp cận object-oriented, và chúng sẽ được phân tích và giải quyết dễ hơn nếu bạn chọn một paradigm khác, nhưng những vấn đề này có thể được coi là tương đối hiếm.

Trong các phần sau, chúng ta sẽ tìm hiểu thêm về việc chuyển tư duy object-oriented thành việc viết code object-oriented.

<a id="_idParaDest-101"></a>

### Các khái niệm trong tâm trí (Mental concepts)

Bạn sẽ hard-pressed (khó lòng) tìm được một chương trình hoàn toàn thiếu ít nhất vài dấu vết của tư duy object-oriented <a id="_idIndexMarker465"></a>, ngay cả khi nó được viết bằng C hay một ngôn ngữ non-OOP nào khác. Nếu một con người viết một chương trình, nó sẽ tự nhiên là object-oriented. Điều này sẽ hiển nhiên ngay cả chỉ trong tên biến. Hãy xem ví dụ sau. Nó khai báo các biến cần thiết để giữ thông tin của 10 sinh viên:

```
  char*  student_first_names[10];
  char*  student_surnames[10];
   int   student_ages[10];
double   student_marks[10];
```

*Code Box 6-1: Bốn mảng có liên quan với nhau nhờ có tiền tố student_, theo một quy ước đặt tên, được dùng để giữ thông tin của 10 sinh viên*

Các khai báo có trong *Code Box 6-1* cho thấy cách chúng ta dùng tên biến để nhóm một số biến dưới cùng một khái niệm, mà trong trường hợp này là *sinh viên* (student). Chúng ta phải làm điều này; nếu không chúng ta sẽ bị rối bởi những cái tên tùy tiện không có ý nghĩa gì với tâm trí object-oriented của chúng ta. Giả sử rằng thay vào đó chúng ta có thứ gì đó như thế này:

```
  char*  aaa[10];
  char*  bbb[10];
   int   ccc[10];
double   ddd[10];
```

*Code Box 6-2: Bốn mảng với tên tùy tiện được dùng để giữ thông tin của 10 sinh viên!*

Dùng những tên biến như thấy trong *Code Box 6-2*, dù bạn có bao nhiêu kinh nghiệm lập trình, bạn phải thừa nhận rằng bạn sẽ gặp rất nhiều rắc rối khi xử lý điều này lúc viết một thuật toán. Việc đặt tên biến là – và luôn là – quan trọng, vì những <a id="_idIndexMarker466"></a>cái tên nhắc chúng ta về các khái niệm trong tâm trí và mối quan hệ giữa dữ liệu và những khái niệm đó. Bằng cách dùng kiểu đặt tên tùy tiện này, chúng ta đánh mất những khái niệm đó và các mối quan hệ của chúng trong code. Điều này có thể không gây vấn đề gì cho máy tính, nhưng nó làm phức tạp việc phân tích và gỡ rối cho các lập trình viên chúng ta và làm tăng khả năng chúng ta mắc lỗi.

Hãy làm rõ thêm ý của chúng ta về một khái niệm trong ngữ cảnh hiện tại. Một khái niệm là một hình ảnh trong tâm trí hay trừu tượng tồn tại trong tâm trí dưới dạng một suy nghĩ hay một ý tưởng. Một *khái niệm* có thể được hình thành bởi nhận thức về một thực thể real-world hoặc có thể đơn giản là hoàn toàn tưởng tượng và trừu tượng. Khi bạn nhìn một cái cây hay khi bạn nghĩ về một chiếc xe, hình ảnh tương ứng của chúng xuất hiện trong tâm trí dưới dạng hai khái niệm khác nhau.

Lưu ý rằng đôi khi chúng ta dùng thuật ngữ khái niệm trong một ngữ cảnh khác, như trong "các khái niệm object-oriented", vốn hiển nhiên không dùng từ khái niệm theo cùng cách với định nghĩa chúng ta vừa đưa ra. Từ khái niệm, khi được dùng liên quan đến các chủ đề technology-related, đơn giản chỉ các nguyên lý cần hiểu về một chủ đề. Lúc này, chúng ta sẽ dùng định nghĩa technology-related này.

Các khái niệm quan trọng đối với tư duy object-oriented vì nếu bạn không thể hình thành và duy trì sự hiểu biết về các object trong tâm trí, bạn không thể trích xuất chi tiết về những gì chúng biểu diễn và liên quan tới, và bạn không thể hiểu các mối quan hệ qua lại của chúng.

Vì vậy, tư duy object-oriented là việc suy nghĩ theo các khái niệm và mối quan hệ của chúng. Từ đó suy ra rằng nếu bạn muốn viết một chương trình object-oriented đúng đắn, bạn cần có sự hiểu biết đúng đắn về mọi object liên quan, các khái niệm tương ứng của chúng, và cả mối quan hệ của chúng, trong tâm trí mình.

Một bản đồ object-oriented được hình thành trong tâm trí bạn, gồm nhiều khái niệm và các mối quan hệ qua lại giữa chúng, không thể dễ dàng truyền đạt cho người khác, chẳng hạn khi tiếp cận một tác vụ theo nhóm. Hơn thế nữa, những khái niệm trong tâm trí như vậy dễ thay đổi và khó nắm bắt, và chúng có thể bị quên rất dễ dàng. Điều này cũng nhấn mạnh thêm thực tế rằng bạn sẽ cần các mô hình và các công cụ khác để biểu diễn, nhằm chuyển bản đồ tư duy của bạn thành những ý tưởng có thể truyền đạt được.

<a id="_idParaDest-102"></a>

### Bản đồ tư duy và object model

Trong phần này, chúng ta xem một ví dụ để hiểu thêm những gì chúng ta đã thảo luận cho đến giờ. Giả sử rằng chúng ta có một bản mô tả bằng văn bản về một khung cảnh. Mục đích của việc mô tả một thứ gì đó là <a id="_idIndexMarker468"></a>truyền đạt các khái niệm cụ thể liên quan tới người tiếp nhận. Hãy nghĩ theo cách này: người mô tả có một bản đồ trong <a id="_idIndexMarker469"></a>tâm trí sắp đặt các khái niệm khác nhau và cách chúng liên kết với nhau; mục đích của họ là truyền đạt bản đồ tư duy đó tới người tiếp nhận. Bạn có thể nói rằng đây ít nhiều là mục tiêu của mọi sự biểu đạt nghệ thuật; thực ra đó là những gì đang xảy ra khi bạn ngắm một bức tranh, nghe một bản nhạc hay đọc một cuốn tiểu thuyết.

Giờ chúng ta sẽ xem một bản mô tả bằng văn bản. Nó mô tả một lớp học. Hãy thả lỏng tâm trí và cố tưởng tượng những gì bạn đang đọc. Mọi thứ bạn thấy trong tâm trí là một khái niệm được truyền đạt bởi bản mô tả sau:

*Lớp học của chúng tôi là một căn phòng cũ với hai cửa sổ lớn. Khi bạn bước vào phòng, bạn có thể thấy các cửa sổ ở bức tường đối diện. Có một số ghế gỗ màu nâu ở giữa phòng. Có năm sinh viên đang ngồi trên ghế, và hai trong số họ là nam. Có một tấm bảng đen bằng gỗ màu xanh lá trên bức tường bên phải bạn, và giáo viên đang nói chuyện với các sinh viên. Ông là một người đàn ông lớn tuổi mặc áo sơ mi xanh dương.*

Giờ, hãy xem những khái niệm nào đã hình thành trong tâm trí chúng ta. Tuy nhiên, trước khi làm điều đó, hãy nhớ rằng trí tưởng tượng của bạn có thể chạy đi xa mà bạn không để ý. Vì vậy, hãy cố hết sức giới hạn bản thân trong phạm vi của bản mô tả. Ví dụ, tôi có thể tưởng tượng thêm và nói rằng các bạn nữ có tóc vàng. Nhưng điều đó không được đề cập trong bản mô tả, nên chúng ta sẽ không tính đến nó. Trong đoạn tiếp theo, tôi giải thích những gì đã hình thành trong tâm trí tôi, và trước khi tiếp tục, bạn cũng nên thử tự làm điều đó.

Trong tâm trí tôi, có năm khái niệm (hay hình ảnh trong tâm trí, hay object), mỗi khái niệm cho một sinh viên trong lớp. Cũng có năm khái niệm khác cho các chiếc ghế. Có một khái niệm khác cho gỗ và một khái niệm nữa cho kính. Và tôi biết rằng mọi chiếc ghế đều được làm từ gỗ. Đây là một mối quan hệ, giữa khái niệm gỗ và các khái niệm ghế. Ngoài ra, tôi biết rằng mọi sinh viên đều đang ngồi trên một chiếc ghế. Như vậy, có năm mối quan hệ – giữa ghế và sinh viên. Chúng ta có thể tiếp tục xác định thêm khái niệm và liên hệ chúng với nhau. Chẳng mấy chốc, chúng ta sẽ có một đồ thị khổng lồ và phức tạp mô tả mối quan hệ của hàng trăm khái niệm.

Giờ, hãy dừng lại một chút và xem bạn đã trích xuất các khái niệm và mối quan hệ của chúng khác biệt như thế nào. Đó là một bài học rằng mỗi người có thể làm điều này theo một cách khác nhau. Thủ tục này cũng xảy ra khi bạn muốn giải quyết một vấn đề cụ thể. Bạn cần tạo một bản đồ tư duy trước khi tấn công vấn đề. Đây là giai đoạn mà chúng ta gọi là *giai đoạn hiểu* (understanding phase).

Bạn giải quyết một vấn đề bằng một cách tiếp cận dựa trên các khái niệm của <a id="_idIndexMarker470"></a>vấn đề và mối quan hệ bạn tìm thấy giữa chúng. Bạn giải thích giải pháp của mình theo những khái niệm đó, và nếu ai đó muốn hiểu giải pháp của bạn, họ nên hiểu các khái niệm và mối quan hệ của chúng trước.

Bạn sẽ <a id="_idIndexMarker471"></a>ngạc nhiên nếu tôi nói với bạn rằng đây chính xác là những gì xảy ra khi bạn cố giải quyết một vấn đề bằng máy tính, nhưng đó chính xác là trường hợp này. Bạn chia vấn đề thành các object (giống như các khái niệm trong ngữ cảnh tâm trí) và mối quan hệ giữa chúng, rồi bạn cố viết một chương trình, dựa trên những object đó, rốt cuộc giải quyết được vấn đề.

Chương trình mà bạn viết mô phỏng các khái niệm và mối quan hệ của chúng như bạn có trong tâm trí. Máy tính chạy giải pháp, và bạn có thể kiểm chứng xem nó có hoạt động không. Bạn vẫn là người giải quyết vấn đề, nhưng giờ một chiếc máy tính là đồng nghiệp của bạn, vì nó có thể thực thi giải pháp của bạn, vốn giờ được mô tả dưới dạng một chuỗi instruction machine-level được dịch từ bản đồ tư duy của bạn, nhanh hơn và chính xác hơn nhiều.

Một chương trình object-oriented mô phỏng các khái niệm dưới dạng các object, và trong khi chúng ta tạo một bản đồ tư duy cho một vấn đề trong tâm trí, chương trình tạo một object model trong memory của nó. Nói cách khác, các thuật ngữ *khái niệm*, *tâm trí* và *bản đồ tư duy* lần lượt tương đương với *object*, *memory* và *object model*, nếu chúng ta so sánh một con người với một chương trình object-oriented. Đây là sự tương quan quan trọng nhất mà chúng tôi đưa ra trong phần này, liên hệ cách chúng ta suy nghĩ với một chương trình object-oriented.

Nhưng tại sao chúng ta lại dùng máy tính để mô phỏng bản đồ tư duy của mình? Vì máy tính giỏi khi nói đến tốc độ và độ chính xác. Đây là một câu trả lời rất kinh điển cho những câu hỏi như vậy, nhưng nó vẫn là một câu trả lời phù hợp cho câu hỏi của chúng ta. Tạo và duy trì một bản đồ tư duy lớn và object model tương ứng là một tác vụ phức tạp và là việc mà máy tính có thể làm rất tốt. Một ưu điểm khác, object model được tạo bởi một chương trình có thể được lưu trên đĩa và dùng sau này.

Một bản đồ tư duy có thể bị quên hay bị cảm xúc làm thay đổi, nhưng máy tính không có cảm xúc, và object model bền vững hơn nhiều so với suy nghĩ của con người. Đó là lý do tại sao chúng ta nên viết các chương trình object-oriented: để có thể chuyển các khái niệm trong tâm trí thành các chương trình và phần mềm hiệu quả.

> **Lưu ý**:
>
> Cho đến nay, chưa có gì được phát minh có thể tải xuống và lưu trữ một bản đồ tư duy từ tâm trí của ai đó – nhưng có lẽ trong tương lai thì có!

<a id="_idParaDest-103"></a>

### Object không nằm trong code

Nếu bạn nhìn vào memory của một chương trình object-oriented đang chạy, bạn sẽ thấy nó đầy các object, tất cả đều liên quan qua lại với nhau. Điều đó cũng giống với con người. Nếu bạn coi một con người như một <a id="_idIndexMarker472"></a>cỗ máy, bạn có thể nói rằng họ luôn hoạt động cho đến khi chết. Đó là một phép so sánh quan trọng. Object chỉ có thể tồn tại trong một chương trình đang chạy, cũng như khái niệm chỉ có thể tồn tại trong một tâm trí đang sống. Điều đó có nghĩa là bạn chỉ có object khi bạn có một chương trình đang chạy.

Điều này có vẻ như một nghịch lý vì khi bạn đang viết một chương trình (một chương trình object-oriented), chương trình chưa tồn tại và vì vậy không thể đang chạy! Vậy, làm sao chúng ta có thể viết code object-oriented khi không có chương trình đang chạy nào và không có object nào?

> **Lưu ý**:
>
> Khi bạn đang viết code object-oriented, không có object nào tồn tại. Các object được tạo ra một khi bạn build code thành một chương trình thực thi được và chạy nó.

OOP thực ra không phải là việc tạo ra object. Nó là việc tạo ra một tập instruction sẽ dẫn đến một object model hoàn toàn động khi chương trình được chạy. Vì vậy, code object-oriented phải có khả năng tạo, sửa đổi, liên kết, và thậm chí xóa các object, một khi đã được biên dịch và chạy.

Như vậy, viết code object-oriented là một tác vụ khó. Bạn cần tưởng tượng các object và mối quan hệ của chúng trước khi chúng tồn tại. Đây chính xác là lý do tại sao OOP có thể phức tạp và tại sao chúng ta cần một ngôn ngữ lập trình hỗ trợ object-orientation. Nghệ thuật tưởng tượng <a id="_idIndexMarker473"></a>một thứ chưa được tạo ra và mô tả hay thiết kế các chi tiết khác nhau của nó thường được gọi là *thiết kế* (design). Đó là lý do tại sao quá trình này thường được gọi là **object-oriented design** (**OOD**) trong lập trình object-oriented.

Trong code object-oriented, chúng ta chỉ lên kế hoạch tạo ra các object. OOP dẫn đến một tập instruction về việc khi nào và làm thế nào một object nên được tạo ra. Dĩ nhiên, nó không chỉ là việc tạo ra. Mọi thao tác liên quan đến một object đều có thể được mô tả chi tiết bằng một ngôn ngữ lập trình. Một ngôn ngữ OOP là một ngôn ngữ có một tập instruction (và quy tắc ngữ pháp) cho phép bạn viết và lên kế hoạch các thao tác object-related khác nhau.

Cho đến giờ, chúng ta đã thấy rằng có một sự tương ứng rõ ràng giữa các khái niệm trong tâm trí con người và các object trong memory của một chương trình. Vì vậy, phải có một sự tương ứng giữa các thao tác có thể được thực hiện trên khái niệm và object.

Mọi object đều có một vòng đời riêng. Điều này cũng đúng với các khái niệm trong tâm trí. Vào một lúc nào đó, một ý tưởng nảy ra trong đầu và tạo ra một hình ảnh trong tâm trí dưới dạng một khái niệm, và vào một lúc khác, nó phai nhạt đi. Điều tương tự cũng đúng với object. Một object được tạo dựng (constructed) vào một thời điểm và bị hủy (destructed) vào một thời điểm khác.

Lưu ý cuối cùng, một số khái niệm trong tâm trí rất vững chắc và bất biến (trái ngược với những khái niệm dễ thay đổi và nhất thời đến rồi đi). Có vẻ như những khái niệm này độc lập với mọi tâm trí <a id="_idIndexMarker474"></a>và đã tồn tại ngay cả khi không có tâm trí nào để hiểu chúng. Chúng chủ yếu là các khái niệm toán học. Số 2 là một ví dụ. Chúng ta chỉ có một số 2 trong toàn bộ vũ trụ! Thật đáng kinh ngạc. Nó có nghĩa là bạn và tôi có cùng một khái niệm về số 2 trong tâm trí; nếu chúng ta cố thay đổi nó, nó sẽ không còn là số 2 nữa. Đây chính xác là nơi chúng ta rời khỏi lãnh địa object-oriented, và bước vào một lãnh địa khác, đầy các object bất biến (immutable), vốn được mô tả dưới tên gọi paradigm *lập trình hàm* (functional programming).

<a id="_idParaDest-104"></a>

### Attribute của object

Mỗi khái niệm trong bất kỳ tâm trí nào đều có một số attribute gắn với nó. Nếu bạn còn nhớ, trong bản mô tả lớp học của chúng ta, chúng ta có một chiếc ghế, tên là *chair1*, màu nâu. Nói cách khác, mọi object <a id="_idIndexMarker475"></a>ghế đều có một attribute gọi là màu và nó là màu nâu đối với object *chair1*. Chúng ta biết rằng có bốn chiếc ghế khác trong lớp học, và chúng có các attribute màu có thể có các giá trị khác nhau. Trong bản mô tả của chúng ta, tất cả đều màu nâu, nhưng có thể trong một bản mô tả khác, một hoặc hai chiếc trong số đó màu vàng.

Một object có thể có nhiều hơn một attribute hay một tập attribute. Chúng ta gọi các giá trị được gán cho những attribute này, gộp lại, là *state* (trạng thái) của một object. State có thể được nghĩ đơn giản như một danh sách giá trị, mỗi giá trị thuộc về một attribute nhất định, gắn với một object. Một object có thể bị sửa đổi trong suốt vòng đời của nó. Một object như vậy được gọi là *mutable*. Điều này đơn giản có nghĩa là state có thể bị thay đổi trong suốt vòng đời của nó. Object cũng có thể là *stateless*, nghĩa là chúng không mang state nào (hay attribute nào).

Một object cũng có thể là *immutable*, giống hệt khái niệm (hay object) tương ứng với số 2, vốn không thể bị thay đổi — là immutable có nghĩa là state được xác định khi tạo dựng và không thể bị sửa đổi sau đó.

> **Lưu ý**:
>
> Một object stateless có thể được nghĩ như một object immutable vì state của nó không thể bị thay đổi trong suốt vòng đời. Thực tế, nó không có state nào để bị thay đổi.

Lưu ý cuối cùng, các object immutable đặc biệt quan trọng. Việc state của chúng không thể bị thay đổi là một ưu điểm, đặc biệt khi chúng được chia sẻ trong một môi trường multithreaded.

<a id="_idParaDest-105"></a>

### Domain

Mọi chương trình được viết để giải quyết một vấn đề cụ thể, ngay cả một vấn đề cực kỳ nhỏ, đều có một domain well-defined. Domain là một thuật ngữ lớn khác được dùng rộng rãi trong tài liệu software <a id="_idIndexMarker477"></a>engineering. Domain xác định các ranh giới mà trong đó phần mềm thể hiện chức năng của nó. Nó cũng xác định các yêu cầu mà phần mềm phải đáp ứng.

Một domain dùng một hệ thuật ngữ (glossary) cụ thể và được xác định trước để thực hiện sứ mệnh của nó và giữ các kỹ sư ở trong ranh giới của nó. Mọi người tham gia một dự án phần mềm đều nên biết về domain mà dự án của họ được định nghĩa trong đó.

Ví dụ, phần mềm ngân hàng thường được xây dựng cho một domain rất well-defined. Nó có một tập thuật ngữ well-known làm glossary, bao gồm tài khoản, tín dụng, số dư, chuyển khoản, khoản vay, lãi suất, v.v.

Định nghĩa của một domain được làm rõ bởi các thuật ngữ có trong glossary của nó; chẳng hạn, bạn sẽ không tìm thấy các thuật ngữ bệnh nhân, thuốc và liều lượng trong domain ngân hàng.

Nếu một ngôn ngữ lập trình không cung cấp phương tiện để làm việc với các khái niệm đặc thù của một domain nhất định (như các khái niệm bệnh nhân và thuốc trong domain chăm sóc sức khỏe), sẽ khó viết phần mềm cho domain đó bằng ngôn ngữ lập trình đó – không phải bất khả thi, nhưng chắc chắn phức tạp. Hơn nữa, phần mềm càng lớn, nó càng khó phát triển và bảo trì.

<a id="_idParaDest-106"></a>

### Quan hệ giữa các object

Các object có thể <a id="_idIndexMarker478"></a>inter-related (liên quan qua lại); chúng có thể tham chiếu tới nhau để biểu thị các mối quan hệ. Ví dụ, trong bản mô tả lớp học của chúng ta, object *student4* (sinh viên thứ tư) có thể liên quan tới object *chair3* (chiếc ghế thứ ba) theo một quan hệ tên là *ngồi trên* (sitting on). Nói cách khác, *student4* ngồi trên *chair3*. Bằng cách này, mọi object trong một hệ thống tham chiếu tới nhau và tạo thành một mạng lưới object gọi là object model. Như chúng ta đã nói trước đây, một object model là cái tương ứng với bản đồ tư duy mà chúng ta hình thành trong tâm trí.

Khi hai object có liên quan với nhau, một thay đổi trong state của một object có thể ảnh hưởng tới state của object kia. Hãy giải thích điều này bằng một ví dụ. Giả sử rằng chúng ta có hai object không liên quan, `p1` và `p2`, biểu diễn các pixel.

Object `p1` có một tập attribute như sau: `{x: 53, y: 345, red: 120, green: 45, blue: 178}`. Object `p2` có các attribute `{x: 53, y: 346, red: 79, green: 162, blue: 23}`.

> **Lưu ý:**
>
> Ký pháp chúng ta dùng gần giống nhưng không hoàn toàn giống **JavaScript Object Notation** hay **JSON**. Trong ký pháp này, các attribute của một object riêng lẻ được bao trong hai dấu ngoặc nhọn, và các attribute được phân tách bằng dấu phẩy. Mỗi attribute có một giá trị tương ứng được phân tách khỏi attribute bằng một dấu hai chấm.

Giờ, để <a id="_idIndexMarker479"></a>làm cho chúng có liên quan với nhau, chúng cần có thêm một attribute để biểu thị mối quan hệ giữa chúng. State của object `p1` sẽ thay đổi thành `{x: 53, y: 345, red: 120, green: 45, blue: 178, adjacent_down_pixel: p2}`, và state của `p2` sẽ thay đổi thành `{x: 53, y: 346, red: 79, green: 162, blue: 23, adjacent_up_pixel: p1}`.

Các attribute `adjacent_down_pixel` và `adjacent_up_pixel` biểu thị thực tế rằng những object pixel <a id="_idIndexMarker480"></a>này nằm kề nhau; các attribute `y` của chúng chỉ chênh nhau 1 đơn vị. Dùng những attribute bổ sung như vậy, các object nhận biết rằng chúng đang có quan hệ với các object khác. Chẳng hạn, `p1` biết rằng `adjacent_down_pixel` của nó là `p2`, và `p2` biết rằng `adjacent_up_pixel` của nó là `p1`.

Vì vậy, như chúng ta có thể thấy, nếu một mối quan hệ được hình thành giữa hai object, state của những object đó (hay danh sách các giá trị tương ứng với attribute của chúng) bị thay đổi. Như vậy, mối quan hệ giữa các object được tạo ra bằng cách thêm attribute mới cho chúng và vì vậy, mối quan hệ trở thành một phần của state của các object. Dĩ nhiên, điều này có những hệ quả đối với tính mutable hay immutable của những object này.

Lưu ý rằng tập con các attribute xác định state và tính immutable của một object có thể thay đổi từ domain này sang domain khác, và nó không nhất thiết bao gồm mọi attribute. Trong một domain, chúng ta có thể chỉ dùng các attribute non-referring (`x`, `y`, `red`, `green` và `blue`, trong ví dụ trên) làm state và trong một domain khác, chúng ta có thể kết hợp tất cả chúng cùng với các attribute tham chiếu (`adjacent_up_pixel` và` adjacent_down_pixel` trong ví dụ trên).

<a id="_idParaDest-107"></a>

### Các thao tác Object-oriented

Một ngôn ngữ OOP <a id="_idIndexMarker481"></a>cho phép chúng ta lên kế hoạch việc tạo dựng object, hủy object, và thay đổi state của một object trong một chương trình soon-to-be-running (sắp được chạy). Vậy, hãy bắt đầu bằng việc xem xét việc tạo dựng object.

> **Lưu ý:**
>
> Thuật ngữ *construction* (tạo dựng) đã được chọn cẩn thận. Chúng ta có thể dùng creation (tạo ra) hay building (xây dựng), nhưng những thuật ngữ này không được chấp nhận như một phần của hệ thuật ngữ chuẩn trong tài liệu OOP. Creation chỉ việc cấp phát memory cho một object, còn construction có nghĩa là việc khởi tạo các attribute của nó.

Có <a id="_idIndexMarker482"></a>hai cách để lên kế hoạch việc tạo dựng <a id="_idIndexMarker483"></a>một object:

- Cách tiếp cận thứ nhất là tạo dựng hoặc một object trống – một object *không có* attribute nào trong state của nó – hoặc, phổ biến hơn, một object với một tập attribute tối thiểu.
- Thêm attribute sẽ được xác định và bổ sung khi code đang được chạy. Dùng phương pháp này, cùng một object có thể có các attribute khác nhau trong hai lần thực thi khác nhau của cùng một chương trình, tùy theo những thay đổi có trong môi trường xung quanh.
- Mỗi object được đối xử như một thực thể riêng biệt, và bất kỳ hai object nào, ngay cả khi chúng có vẻ thuộc cùng một nhóm (hay class), nhờ có một danh sách attribute chung, đều có thể nhận được các attribute khác nhau trong state của chúng khi chương trình tiếp tục.
- Ví dụ, các object pixel đã đề cập `p1` và `p2` đều là pixel (hay cả hai đều thuộc cùng một class tên là `pixel`) vì chúng có cùng các attribute – `x`, `y`, `red`, `green` và `blue`. Sau khi hình thành một mối quan hệ, chúng sẽ có state khác nhau vì khi đó chúng có các attribute mới và khác nhau: `p1` có attribute `adjacent_down_pixel`, và `p2` có attribute `adjacent_up_pixel`.
- Cách tiếp cận này được dùng trong các ngôn ngữ lập trình như JavaScript, Ruby, Python, Perl và PHP. Hầu hết chúng là *ngôn ngữ lập trình thông dịch* (interpreted programming language), và các attribute được giữ dưới dạng một *map* (hay một *hash*) trong các cấu trúc dữ liệu nội bộ <a id="_idIndexMarker484"></a>có thể dễ dàng thay đổi vào lúc runtime. Kỹ thuật này thường được gọi là **prototype-based OOP**.
- Cách tiếp cận thứ hai là tạo dựng một object mà các attribute của nó được xác định trước và sẽ không thay đổi giữa chừng việc thực thi. Không được phép thêm attribute nào cho một object như vậy vào lúc runtime, và object sẽ giữ nguyên cấu trúc của nó. Chỉ giá trị của các attribute được phép thay đổi, và điều đó chỉ khả thi khi object là mutable.
- Để áp dụng cách tiếp cận này, một lập trình viên nên tạo một *object template* hay *class* được thiết kế trước, lưu giữ mọi attribute cần có mặt trong object vào lúc runtime. Sau đó, template này nên được biên dịch và đưa vào ngôn ngữ object-oriented vào lúc runtime.
- Trong nhiều ngôn ngữ lập trình, object template này được gọi là một class. Các ngôn ngữ lập trình như Java, C++ và Python dùng thuật ngữ này để chỉ các <a id="_idIndexMarker485"></a>object template của chúng. Kỹ thuật này thường được biết đến là **class-based OOP**. Lưu ý rằng Python hỗ trợ cả OOP prototype-based lẫn class-based.

> **Lưu ý:**
>
> Một class chỉ xác định danh sách các attribute có mặt trong một object chứ không xác định các giá trị thực tế được gán cho chúng vào lúc runtime.

Lưu ý rằng <a id="_idIndexMarker486"></a>một object và một *instance* là cùng một thứ, và chúng có thể được dùng thay thế cho nhau. Tuy nhiên, trong một số tài liệu, có thể có một vài khác biệt nhỏ giữa chúng. Cũng có một thuật ngữ khác, *reference*, đáng để đề cập và giải thích. Thuật ngữ object hay instance được dùng để chỉ vị trí thực tế được cấp phát trong memory cho các giá trị của object đó, trong khi một reference giống một pointer tham chiếu tới object đó. Vì vậy, chúng ta có thể có nhiều reference cùng tham chiếu tới một object. Nói chung, một object thường không có tên, nhưng một reference thì có tên.

> **Lưu ý:**
>
> Trong C, chúng ta có pointer là cú pháp tương ứng cho reference. Chúng ta cũng có cả Stack object lẫn Heap object. Một Heap object không có tên và chúng ta dùng pointer để tham chiếu tới nó. Ngược lại, một Stack object thực ra là một biến và do đó có tên.

Dù có thể dùng cả hai cách tiếp cận, C và đặc biệt là C++ được thiết kế chính thức theo cách hỗ trợ cách tiếp cận class-based. Do đó, khi một lập trình viên muốn tạo một object trong C hay C++, họ cần có một class trước. Chúng ta sẽ nói thêm về class và vai trò của nó trong OOP ở các phần sau.

Thảo luận sau có thể có vẻ hơi không liên quan, nhưng, thực tế, không phải vậy. Có hai trường phái tư tưởng về cách con người trưởng thành qua cuộc đời, và chúng khớp khá chính xác với các cách tiếp cận tạo dựng object mà chúng ta đã nói đến. Một trong những triết lý này nói rằng con người trống rỗng khi sinh ra và không có bản chất (hay state) nào.

Bằng việc sống và trải nghiệm những sự kiện tốt và xấu khác nhau trong cuộc đời, bản chất của họ bắt đầu lớn lên và phát triển thành một thứ có tính cách độc lập và trưởng thành. *Chủ nghĩa hiện sinh* (Existentialism) là một truyền thống triết học cổ vũ ý tưởng này.

Châm ngôn nổi tiếng của nó là "Hiện hữu có trước bản chất" (Existence precedes essence). Điều này đơn giản có nghĩa là con người trước tiên đi vào sự tồn tại và sau đó có được bản chất của mình qua trải nghiệm cuộc sống. Ý tưởng này cực kỳ gần với cách tiếp cận prototype-based của chúng ta đối với việc tạo dựng object, trong đó object được tạo dựng trống và sau đó phát triển vào lúc runtime.

Triết lý kia lâu đời hơn và chủ yếu được các tôn giáo cổ vũ. Trong triết lý này, con người được tạo ra dựa trên một hình mẫu (hay một bản chất), và hình mẫu này đã được xác định trước khi con người <a id="_idIndexMarker487"></a>đi vào sự tồn tại. Điều này giống nhất với cách mà chúng ta lên kế hoạch tạo dựng một object dựa trên một template hay class. Với tư cách là những người tạo ra object, chúng ta chuẩn bị một class, và sau đó một chương trình bắt đầu tạo các object theo class đó.

> **Lưu ý:**
>
> Có một sự tương ứng lớn giữa các cách tiếp cận mà con người trong tiểu thuyết hay truyện, bao gồm cả nguồn văn học lẫn lịch sử, dùng để vượt qua một khó khăn nhất định và các thuật toán mà chúng ta đã thiết kế trong khoa học máy tính để giải quyết những vấn đề tương tự. Tôi tin sâu sắc rằng cách con người sống và thực tại mà họ trải nghiệm hài hòa rất lớn với những gì chúng ta hiểu về thuật toán và cấu trúc dữ liệu trong khoa học máy tính. Thảo luận trên là một ví dụ tuyệt vời về sự hài hòa như vậy giữa OOP và Triết học.

Giống như việc tạo dựng object, việc hủy object diễn ra vào lúc runtime; chúng ta chỉ có quyền lên kế hoạch nó trong code. Mọi tài nguyên được một object cấp phát trong suốt vòng đời của nó nên được giải phóng khi nó bị hủy. Khi một object đang bị hủy, mọi object liên quan khác nên được thay đổi để chúng không còn tham chiếu tới object bị hủy nữa. Một object không nên có một attribute tham chiếu tới một object non-existent, nếu không chúng ta đánh mất *referential integrity* (tính toàn vẹn tham chiếu) trong object model của mình. Điều đó có thể dẫn đến các lỗi runtime như memory corruption hay segmentation fault, cũng như các lỗi logic như tính toán sai.

Việc sửa đổi một object (hay thay đổi state của một object) có thể diễn ra theo hai cách khác nhau. Nó có thể đơn giản là một thay đổi trong giá trị của một attribute hiện có hoặc nó có thể là việc thêm hay bớt một attribute vào/khỏi tập attribute trong object đó. Cách sau chỉ có thể xảy ra nếu chúng ta đã chọn cách tiếp cận prototype-based cho việc tạo dựng object. Hãy nhớ rằng việc thay đổi state của một object immutable bị cấm và thông thường, nó không được một ngôn ngữ object-oriented cho phép.

<a id="_idParaDest-108"></a>

### Object có behavior

Mỗi object, cùng <a id="_idIndexMarker488"></a>với các attribute của nó, có một danh sách chức năng nhất định mà nó có thể thực hiện. Chẳng hạn, một object xe hơi có thể tăng tốc, giảm tốc, rẽ, v.v. Trong OOP, những chức năng này luôn phù hợp với các yêu cầu của domain. Ví dụ, trong một object model ngân hàng, một khách hàng có thể yêu cầu mở một tài khoản mới nhưng không thể ăn. Dĩ nhiên, khách hàng là một con người và có thể ăn, nhưng chừng nào chức năng ăn không liên quan tới domain ngân hàng, chúng ta không coi nó là một chức năng cần thiết cho một object khách hàng.

Mọi chức năng <a id="_idIndexMarker489"></a>đều có thể thay đổi state của một object bằng cách thay đổi giá trị các attribute của nó. Một ví dụ đơn giản, một object xe hơi có thể tăng tốc. Tăng tốc là một chức năng của object xe hơi, và bằng việc tăng tốc, tốc độ của xe, một trong các attribute của nó, thay đổi.

Tóm lại, một object đơn giản là một nhóm attribute và chức năng. Trong các phần sau, chúng ta sẽ nói thêm về cách đặt những thứ này cùng nhau trong một object.

Cho đến giờ, chúng ta đã giải thích hệ thuật ngữ cơ bản cần thiết để nghiên cứu và hiểu OOP. Bước tiếp theo là giải thích khái niệm cơ bản về encapsulation. Nhưng, như một lúc nghỉ, hãy đọc về lý do tại sao C không thể là một ngôn ngữ OOP.

<a id="_idParaDest-109"></a>

## C không phải là object-oriented, nhưng tại sao?

C không phải là object-oriented, nhưng không phải vì tuổi tác của nó. Nếu tuổi tác là một lý do, chúng ta đã có thể tìm ra cách để làm nó object-oriented từ lâu rồi. Nhưng, như bạn sẽ thấy trong *Chương 12*, *Phiên bản C mới nhất (The Most Recent C)*, chuẩn mới nhất của ngôn ngữ lập trình C, C18, không cố gắng biến C thành một ngôn ngữ object-oriented.

Mặt <a id="_idIndexMarker490"></a>khác, chúng ta có C++, vốn là kết quả của mọi nỗ lực để có một ngôn ngữ OOP dựa trên C. Nếu số phận của C là bị thay thế bởi một ngôn ngữ object-oriented, thì sẽ không có nhu cầu nào về C ngày nay, chủ yếu là vì C++ – nhưng nhu cầu hiện tại về kỹ sư C cho thấy không phải vậy.

Một con người suy nghĩ theo cách object-oriented, nhưng một CPU thực thi các instruction machine-level vốn mang tính thủ tục. Một CPU chỉ thực thi một tập instruction lần lượt từng cái một, và thỉnh thoảng, nó phải nhảy, fetch và thực thi các instruction khác từ một address khác trong memory; khá giống với các lời gọi hàm trong một chương trình được viết bằng một ngôn ngữ lập trình thủ tục như C.

C không thể là object-oriented vì nó nằm trên ranh giới giữa hướng đối tượng (object orientation) và lập trình thủ tục. Hướng đối tượng là sự hiểu biết của con người về một vấn đề và việc thực thi thủ tục là những gì một CPU có thể làm. Do đó, chúng ta cần một thứ ở vị trí này và tạo nên ranh giới này. Nếu không, các chương trình high-level, vốn thường được viết theo cách object-oriented, không thể được dịch trực tiếp thành các instruction thủ tục để đưa vào CPU.

Nếu bạn nhìn vào các ngôn ngữ lập trình high-level như Java, JavaScript, Python, Ruby, v.v., chúng có một thành phần hay lớp trong architecture của chúng làm cầu nối giữa môi trường của chúng và library C thực sự có bên trong hệ điều hành (Standard C Library trong các hệ thống Unix-like và Win32 API trong các hệ thống Windows). Chẳng hạn, **Java Virtual Machine** (**JVM**) làm điều đó trong một nền tảng Java. Dù không phải <a id="_idIndexMarker492"></a>mọi môi trường này đều nhất thiết là object-oriented (ví dụ JavaScript hay Python có thể vừa thủ tục vừa object-oriented), chúng cần lớp này để dịch logic high-level của chúng thành các instruction thủ tục low-level.

<a id="_idParaDest-110"></a>

## Encapsulation

Trong các phần trước, chúng ta đã thấy rằng mỗi object có một tập attribute và một tập chức năng <a id="_idIndexMarker493"></a>gắn với nó. Ở đây, chúng ta sẽ nói về việc đặt những attribute và chức năng đó vào một thực thể gọi là object. Chúng ta làm điều này thông qua một quá trình gọi là *encapsulation* (đóng gói).

Encapsulation đơn giản có nghĩa là đặt những thứ liên quan cùng nhau vào một *capsule* (viên nang) biểu diễn một object. Nó diễn ra trước tiên trong tâm trí bạn, và sau đó nó nên được chuyển vào code. Khoảnh khắc bạn cảm thấy một object cần có một số attribute và chức năng, bạn đang thực hiện encapsulation trong tâm trí; encapsulation đó sau đó cần được chuyển xuống mức code.

Việc có khả năng encapsulate các thứ trong một ngôn ngữ lập trình là then chốt, nếu không việc giữ các biến liên quan cùng nhau trở thành một cuộc vật lộn không thể duy trì (chúng ta đã đề cập việc dùng quy ước đặt tên để làm điều này).

Một object được tạo nên từ một tập attribute và một tập chức năng. Cả hai đều nên được encapsulate vào capsule object. Trước tiên hãy nói về *attribute encapsulation*.

<a id="_idParaDest-111"></a>

### Attribute encapsulation

Như chúng ta đã thấy <a id="_idIndexMarker494"></a>trước đây, chúng ta luôn có thể dùng tên biến để thực hiện encapsulation và gắn các biến khác nhau lại với nhau và nhóm chúng dưới <a id="_idIndexMarker495"></a>cùng một object. Sau đây là một ví dụ:

```
int pixel_p1_x     = 56;
int pixel_p1_y     = 34;
int pixel_p1_red   = 123;
int pixel_p1_green = 37;
int pixel_p1_blue  = 127;
int pixel_p2_x     = 212;
int pixel_p2_y     = 994;
int pixel_p2_red   = 127;
int pixel_p2_green = 127;
int pixel_p2_blue  = 0;
```

*Code Box 6-3: Một số biến biểu diễn hai pixel được nhóm theo tên của chúng*

Ví dụ này cho thấy rõ cách tên biến được dùng để nhóm các biến dưới `p1` và `p2`, vốn theo một cách nào đó là các object *ngầm định* (implicit). Với ngầm định, chúng tôi muốn nói rằng lập trình viên là người duy nhất biết về sự tồn tại của những object như vậy; ngôn ngữ lập trình không biết gì về chúng.

Ngôn ngữ lập trình chỉ thấy 10 biến có vẻ độc lập với nhau. Đây sẽ là một mức encapsulation rất thấp, thấp đến mức nó sẽ không được chính thức <a id="_idIndexMarker496"></a>coi là encapsulation. Encapsulation bằng tên biến tồn tại trong mọi ngôn ngữ lập trình (vì bạn có thể đặt tên biến), ngay cả trong một assembly language.

Những gì chúng ta <a id="_idIndexMarker497"></a>cần là các cách tiếp cận cung cấp encapsulation *tường minh* (explicit). Với tường minh, chúng tôi muốn nói rằng cả lập trình viên lẫn ngôn ngữ lập trình đều biết về encapsulation và các capsule (hay object) tồn tại. Các ngôn ngữ lập trình không cung cấp *attribute encapsulation* tường minh rất khó dùng.

May mắn thay, C có cung cấp encapsulation tường minh, và đó là một trong những lý do tại sao chúng ta có thể viết rất nhiều chương trình object-oriented về bản chất bằng nó một cách ít nhiều dễ dàng. Mặt khác, như chúng ta sẽ thấy ngay trong phần tiếp theo, C không cung cấp behavior encapsulation tường minh, và chúng ta phải nghĩ ra một kỷ luật ngầm định để hỗ trợ điều này.

Lưu ý rằng việc có một tính năng tường minh như encapsulation trong một ngôn ngữ lập trình luôn là điều mong muốn. Ở đây, chúng ta chỉ nói về encapsulation, nhưng điều này có thể được mở rộng cho nhiều tính năng object-oriented khác, như inheritance và polymorphism. Những tính năng tường minh như vậy cho phép một ngôn ngữ lập trình bắt các lỗi liên quan vào lúc biên dịch thay vì lúc runtime.

Giải quyết lỗi vào lúc runtime là một cơn ác mộng, và vì vậy chúng ta nên luôn cố gắng bắt lỗi vào lúc biên dịch. Đây là ưu điểm chính của việc có một ngôn ngữ object-oriented, vốn hoàn toàn nhận thức được cách suy nghĩ object-oriented của chúng ta. Một ngôn ngữ object-oriented có thể tìm và báo cáo các lỗi và vi phạm trong thiết kế của chúng ta vào lúc biên dịch và giúp chúng ta khỏi phải giải quyết nhiều bug nghiêm trọng vào lúc runtime. Thật vậy, đây là lý do tại sao chúng ta thấy các ngôn ngữ lập trình ngày càng phức tạp hơn mỗi ngày – để làm mọi thứ trở nên tường minh với ngôn ngữ.

Không may là không phải mọi tính năng object-oriented đều tường minh trong C. Về cơ bản đó là lý do tại sao khó viết một chương trình object-oriented bằng C. Nhưng có nhiều tính năng tường minh hơn trong C++ và, thật vậy, đó là lý do tại sao nó được gọi là một ngôn ngữ lập trình object-oriented.

Trong C, structure cung cấp encapsulation. Hãy thay đổi code bên trong *Code Box 6-3*, và viết lại nó bằng structure:

```
typedef struct {
  int x, y;
  int red, green, blue;
} pixel_t;
pixel_t p1, p2;
p1.x = 56;
p1.y = 34;
p1.red = 123;
p1.green = 37;
p1.blue = 127;
p2.x = 212;
p2.y = 994;
p2.red = 127;
p2.green = 127;
p2.blue = 0;
```

*Code Box 6-4: Structure pixel_t và việc khai báo hai biến pixel_t*

Có một số điều quan trọng cần lưu ý về *Code Box 6-4*:

- Attribute encapsulation diễn ra khi chúng ta đặt các attribute `x`, `y`, `red`, `green` và `blue` vào một kiểu mới, `pixel_t`.
- Encapsulation luôn tạo ra một kiểu mới; attribute encapsulation làm điều này một cách đặc thù trong C. Điều này rất quan trọng cần lưu ý. Thực tế, đây là cách mà chúng ta làm cho encapsulation trở nên tường minh. Hãy lưu ý hậu tố `_t` ở cuối `pixel_t`. Trong C rất phổ biến việc thêm hậu tố `_t` vào cuối tên của các kiểu mới, nhưng nó không bắt buộc. Chúng tôi dùng quy ước này trong suốt cuốn sách.
- `p1` và `p2` sẽ là các object tường minh của chúng ta khi code này được thực thi. Cả hai đều có kiểu `pixel_t`, và chúng chỉ có các attribute được structure quy định. Trong C, và đặc biệt là C++, kiểu quy định các attribute cho các object của chúng.
- Kiểu mới, `pixel_t`, chỉ là các attribute của một class (hay object template). Hãy nhớ, từ "class" chỉ một template của các object chứa cả <a id="_idIndexMarker500"></a>attribute lẫn chức năng. Vì một structure C chỉ giữ attribute, nó không thể là cái tương ứng <a id="_idIndexMarker501"></a>cho một class. Không may là chúng ta không có khái niệm tương ứng cho class trong C; attribute và chức năng tồn tại riêng rẽ, và chúng ta liên hệ chúng với nhau một cách ngầm định trong code. Mọi class đều ngầm định đối với C và nó chỉ một structure duy nhất cùng với một danh sách hàm C. Bạn sẽ thấy thêm về điều này trong các ví dụ sắp tới, trong chương này và các chương sau.
- Như bạn thấy, chúng ta đang tạo dựng các object dựa trên một template (ở đây là structure của `pixel_t`), và template có các attribute được xác định trước mà một object nên có khi ra đời. Như chúng ta đã nói trước đây, structure chỉ lưu attribute chứ không lưu chức năng.
- Việc tạo dựng object rất giống với việc khai báo một biến mới. Kiểu đứng trước, sau đó là tên biến (ở đây là tên object). Khi khai báo một object, hai điều diễn ra gần như cùng lúc: trước tiên memory được cấp phát cho object (creation), và sau đó, các attribute được khởi tạo (construction) bằng các giá trị mặc định. Trong ví dụ trên, vì mọi attribute đều là số nguyên, giá trị số nguyên mặc định trong C sẽ được dùng, đó là 0.
- Trong C và nhiều ngôn ngữ lập trình khác, chúng ta dùng một dấu chấm (`.`) để truy cập một attribute bên trong một object, hay một mũi tên (`->`) khi truy cập các attribute của một structure một cách gián tiếp thông qua address của nó được lưu trong một pointer. Câu lệnh `p1.x` (hay `p1->x` nếu `p1` là một pointer) nên được đọc là *attribute x trong object p1*.

Như bạn đã biết đến giờ, attribute chắc chắn không phải là thứ duy nhất có thể được encapsulate vào object. Giờ là lúc xem cách các chức năng được encapsulate.

<a id="_idParaDest-112"></a>

### Behavior encapsulation

Một object <a id="_idIndexMarker502"></a>đơn giản là một capsule của các attribute và method. Method là một thuật ngữ chuẩn khác mà chúng ta thường dùng để chỉ một mẩu logic <a id="_idIndexMarker503"></a>hay chức năng được giữ trong một object. Nó có thể được coi như một hàm C có tên, danh sách argument và kiểu trả về. Attribute truyền tải *giá trị* và method truyền tải *behavior* (hành vi). Do đó, một object có một danh sách giá trị và có thể thực hiện những behavior nhất định trong một hệ thống.

Trong các ngôn ngữ object-oriented class-based như C++, rất dễ để nhóm một số attribute và method cùng nhau trong một class. Trong các ngôn ngữ prototype-based như JavaScript, chúng ta thường bắt đầu với một object trống (*ex nihilo*, hay "từ hư không") hoặc clone từ một object hiện có. Để có behavior trong object, chúng ta cần thêm method. Hãy xem ví dụ sau, giúp bạn hiểu sâu hơn về cách các ngôn ngữ lập trình prototype-based hoạt động. Nó được viết bằng JavaScript:

```
// Construct an empty object
var clientObj = {};
// Set the attributes
clientObj.name = "John";
clientObj.surname = "Doe";
// Add a method for ordering a bank account
clientObj.orderBankAccount = function () {
  ...
}
...
// Call the method
clientObj.orderBankAccount();
```

*Code Box 6-5: Tạo dựng một object client trong JavaScript*

Như bạn thấy trong ví dụ này, ở dòng thứ 2, chúng ta tạo một object trống. Trong hai dòng tiếp theo, chúng ta thêm hai attribute mới, `name` và `surname`, vào object. Và ở dòng tiếp theo, chúng ta thêm một method mới, `orderBankAccount`, trỏ tới một định nghĩa hàm. Dòng này thực ra là một phép gán. Ở vế right-hand (bên phải) là một *anonymous function* (hàm ẩn danh), vốn không có tên và được gán cho attribute `orderBankAccount` của object, ở vế left-hand (bên trái). Nói cách khác, chúng ta lưu một hàm vào attribute `orderBankAccount`. Ở dòng cuối cùng, method `orderBankAccount` của object được gọi. Ví dụ này là một minh họa tuyệt vời cho các ngôn ngữ lập trình prototype-based, vốn chỉ dựa vào việc có một object trống lúc đầu và không gì hơn.

Ví dụ trên sẽ khác đi trong một ngôn ngữ lập trình class-based. Trong những ngôn ngữ này, chúng ta bắt đầu bằng việc viết một class vì không có class, chúng ta không thể có object nào. Code box sau chứa ví dụ trước nhưng được viết bằng C++:

```
class Client {
public:
  void orderBankAccount() {
    ...
  }
  std::string name;
  std::string surname:
};
...
Client clientObj;
clientObj.name = "John";
clientObj.surname = "Doe";
...
clientObj.orderBankAccount ();
```

*Code Box 6-6: Tạo dựng object client trong C++*

Như bạn thấy, chúng ta đã bắt đầu bằng việc khai báo một class mới, `Client`. Ở dòng thứ 1, chúng ta khai báo một class, vốn ngay lập tức <a id="_idIndexMarker506"></a>trở thành một kiểu C++ mới. Nó giống một capsule và được bao quanh bởi dấu ngoặc nhọn. Sau khi khai báo class, chúng ta tạo dựng <a id="_idIndexMarker507"></a>object `clientObj` từ kiểu `Client`.

Ở các dòng tiếp theo, chúng ta đặt các attribute, và cuối cùng, chúng ta gọi method `orderBankAccount` trên object `clientObj`.

> **Lưu ý:**
>
> Trong C++, method thường được gọi là *member function* và attribute được gọi là *data member*.

Nếu bạn nhìn vào các kỹ thuật được các dự án C mã nguồn mở và well-known dùng để encapsulate một số thành phần, bạn sẽ nhận thấy rằng có một chủ đề chung giữa chúng. Trong phần còn lại của mục này, chúng tôi sẽ đề xuất một kỹ thuật behavior encapsulation dựa trên các kỹ thuật tương tự quan sát được trong những dự án như vậy.

Vì chúng ta sẽ <a id="_idIndexMarker508"></a>thường xuyên tham chiếu lại kỹ thuật này, tôi sẽ đặt cho nó một cái tên. Chúng ta gọi kỹ thuật này là **implicit encapsulation**. Nó là ngầm định vì nó không cung cấp một behavior encapsulation tường minh mà C biết đến. Dựa trên những gì chúng ta có cho đến giờ trong chuẩn ANSI C, không thể để C biết về class. Vì vậy, mọi kỹ thuật cố gắng giải quyết hướng đối tượng trong C đều phải là ngầm định.

Kỹ thuật implicit encapsulation đề xuất những điều sau:

- Dùng structure C để giữ các attribute của một object (attribute encapsulation tường minh). Những structure này được gọi là **attribute structure**.
- Đối với behavior <a id="_idIndexMarker509"></a>encapsulation, các hàm C được dùng. Những hàm này được gọi là **behavior function**. Như bạn có thể biết, chúng ta không thể có <a id="_idIndexMarker510"></a>hàm bên trong structure trong C. Vì vậy, những hàm này phải tồn tại bên ngoài attribute structure (behavior encapsulation ngầm định).
- Behavior function phải nhận một structure pointer làm một trong các argument của chúng (thường là argument đầu tiên hoặc cuối cùng). Pointer này trỏ tới attribute structure của object. Đó là vì behavior function có thể cần đọc hay sửa đổi các attribute của object, điều rất phổ biến.
- Behavior function nên có tên phù hợp để chỉ ra rằng chúng liên quan tới cùng một class object. Đó là lý do tại sao việc bám theo một quy ước đặt tên nhất quán rất quan trọng khi dùng kỹ thuật này. Đây là một trong hai quy ước đặt tên mà chúng tôi cố gắng bám theo trong các chương này để có một encapsulation rõ ràng. Quy ước kia là dùng hậu tố `_t` trong tên của các attribute structure. Tuy nhiên, dĩ nhiên, chúng tôi không bắt buộc chúng và bạn có thể dùng các quy ước đặt tên tùy chỉnh của riêng mình.
- Các câu lệnh khai báo tương ứng với behavior function thường được đặt trong cùng header file được dùng để giữ khai báo của <a id="_idIndexMarker511"></a>attribute structure. Header này được gọi là **declaration header**.
- Định nghĩa của các behavior function thường được đặt trong một hoặc nhiều source file riêng biệt include declaration header.

Lưu ý rằng với <a id="_idIndexMarker512"></a>implicit encapsulation, class có tồn tại, nhưng chúng là ngầm định và chỉ lập trình viên biết. Ví dụ sau, *ví dụ 6.1*, cho thấy cách dùng kỹ thuật này trong một chương trình C thật. Nó là về một object xe hơi <a id="_idIndexMarker513"></a>tăng tốc cho đến khi hết nhiên liệu và dừng lại.

Header file sau, trong *ví dụ 6.1*, chứa khai báo của kiểu mới `car_t`, vốn là attribute structure của class `Car`. Header cũng chứa các khai báo cần thiết cho các behavior function của class `Car`. Chúng tôi dùng cụm từ "class `Car`" để chỉ class ngầm định không có trong code C và nó bao gồm chung cả attribute structure lẫn các behavior function:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_6_1_H
#define EXTREME_C_EXAMPLES_CHAPTER_6_1_H
// This structure keeps all the attributes
// related to a car object
typedef struct {
  char name[32];
  double speed;
  double fuel;
} car_t;
// These function declarations are
// the behaviors of a car object
void car_construct(car_t*, const char*);
void car_destruct(car_t*);
void car_accelerate(car_t*);
void car_brake(car_t*);
void car_refuel(car_t*, double);
#endif
```

*Code Box 6-7 [ExtremeC_examples_chapter6_1.h]: Khai báo của attribute structure và các behavior function của class Car*

Như bạn thấy, attribute structure `car_t` có ba trường – `name`, `speed` và `fuel` – vốn là các attribute của object xe hơi. Lưu ý rằng `car_t` giờ là một kiểu mới trong C, và giờ chúng ta có thể khai báo các biến thuộc kiểu này. Các behavior function cũng thường được khai báo trong cùng header file, như bạn có thể thấy trong code box trên. Chúng bắt đầu bằng tiền tố `car_` để nhấn mạnh thực tế rằng tất cả chúng đều thuộc về cùng một class.

Một điều rất quan trọng về kỹ thuật implicit encapsulation: mỗi object có biến attribute structure độc nhất của riêng nó, nhưng mọi object đều chia sẻ cùng các behavior function. Nói cách khác, chúng ta phải tạo một biến riêng từ kiểu attribute structure cho mỗi object, nhưng chúng ta chỉ viết behavior function một lần và gọi chúng cho các object khác nhau.

Lưu ý rằng attribute structure `car_t` tự nó không phải là một class. Nó chỉ chứa các attribute của class `Car`. Tất cả các khai báo cùng nhau tạo nên class `Car` ngầm định. Bạn sẽ thấy thêm ví dụ về điều này khi chúng ta tiếp tục.

Có nhiều dự án mã nguồn mở nổi tiếng dùng kỹ thuật trên để viết code semi-object-oriented. Một ví dụ là `libcurl`. Nếu bạn xem source code của nó, bạn sẽ thấy rất nhiều structure và hàm bắt đầu bằng `curl_`. Bạn có thể tìm thấy danh sách <a id="_idIndexMarker516"></a>những hàm như vậy ở đây: [https://curl.haxx.se/libcurl/c/allfuncs.html](https://curl.haxx.se/libcurl/c/allfuncs.html).

Source file sau chứa định nghĩa của các behavior function trong ví dụ 6.1:

```
#include <string.h>
#include "ExtremeC_examples_chapter6_1.h"
// Definitions of the above functions
void car_construct(car_t* car, const char* name) {
  strcpy(car->name, name);
  car->speed = 0.0;
  car->fuel = 0.0;
}
void car_destruct(car_t* car) {
  // Nothing to do here!
}
void car_accelerate(car_t* car) {
  car->speed += 0.05;
  car->fuel -= 1.0;
  if (car->fuel < 0.0) {
    car->fuel = 0.0;
  }
}
void car_brake(car_t* car) {
  car->speed -= 0.07;
  if (car->speed < 0.0) {
    car->speed = 0.0;
  }
  car->fuel -= 2.0;
  if (car->fuel < 0.0) {
    car->fuel = 0.0;
  }
}
void car_refuel(car_t* car, double amount) {
  car->fuel = amount;
}
```

*Code Box 6-8 [ExtremeC_examples_chapter6_1.c]: Định nghĩa của các behavior function trong class Car*

Các behavior function của `Car` được định nghĩa trong *Code Box 6-8*. Như bạn có thể thấy, mọi hàm đều nhận một pointer `car_t` làm argument đầu tiên. Điều này cho phép hàm đọc và sửa đổi các attribute của một object. Nếu một hàm không nhận pointer tới một attribute structure, thì nó có thể được coi là một hàm C thông thường không biểu diễn behavior của một object.

Lưu ý rằng <a id="_idIndexMarker517"></a>khai báo của các behavior function thường nằm cạnh khai báo của attribute structure tương ứng. Đó là vì lập trình viên là người duy nhất chịu trách nhiệm duy trì sự tương ứng giữa attribute structure và các behavior function, và việc bảo trì <a id="_idIndexMarker518"></a>nên đủ dễ dàng. Đó là lý do tại sao việc giữ hai tập này gần nhau, thường trong cùng header file, giúp duy trì cấu trúc tổng thể của class, và giảm bớt khó khăn cho những nỗ lực sau này.

Trong code box sau, bạn sẽ tìm thấy source file chứa hàm `main` và thực hiện logic chính. Mọi behavior function sẽ được dùng ở đây:

```
#include <stdio.h>
#include "ExtremeC_examples_chapter6_1.h"
// Main function
int main(int argc, char** argv) {
  // Create the object variable
  car_t car;
  // Construct the object
  car_construct(&car, "Renault");
  // Main algorithm
  car_refuel(&car, 100.0);
  printf("Car is refueled, the correct fuel level is %f\n",
    car.fuel);
  while (car.fuel > 0) {
    printf("Car fuel level: %f\n", car.fuel);
    if (car.speed < 80) {
      car_accelerate(&car);
      printf("Car has been accelerated to the speed: %f\n",
  car.speed);
    } else {
      car_brake(&car);
      printf("Car has been slowed down to the speed: %f\n",
  car.speed);
    }
  }
  printf("Car ran out of the fuel! Slowing down ...\n");
  while (car.speed > 0) {
    car_brake(&car);
    printf("Car has been slowed down to the speed: %f\n",
      car.speed);
  }
  // Destruct the object
  car_destruct(&car);
  return 0;
}
```

*Code Box 6-9 [ExtremeC_examples_chapter6_1_main.c]: Hàm main của ví dụ 6.1*

Ở instruction đầu tiên trong hàm `main`, chúng ta đã khai báo biến `car` từ kiểu `car_t`. Biến `car` là object `car` đầu tiên của chúng ta. Ở dòng này, chúng ta đã cấp phát memory cho các attribute của object. Ở dòng tiếp theo, chúng ta tạo dựng object. Giờ ở dòng này, chúng ta đã khởi tạo các attribute. Bạn chỉ có thể khởi tạo một object khi có <a id="_idIndexMarker519"></a>memory được cấp phát cho các attribute của nó. Trong code, constructor nhận một argument thứ hai là tên của xe. Bạn có thể đã để ý rằng chúng ta đang truyền address của object `car` cho mọi behavior function `car_*`.

Sau đó trong vòng lặp `while`, hàm `main` đọc attribute `fuel` và kiểm tra xem giá trị <a id="_idIndexMarker520"></a>của nó có lớn hơn không hay không. Việc hàm `main`, vốn không phải là một behavior function, có thể truy cập (đọc và ghi) các attribute của `car` là một điều quan trọng. Chẳng hạn, các attribute `fuel` và `speed` là ví dụ về các attribute *public*, mà các hàm (code bên ngoài) khác với behavior function có thể truy cập. Chúng ta sẽ quay lại điểm này trong phần tiếp theo.

Trước khi rời hàm `main` và kết thúc chương trình, chúng ta đã hủy object `car`. Điều này đơn giản có nghĩa là các tài nguyên được object cấp phát đã được giải phóng ở giai đoạn này. Đối với object `car` trong ví dụ này, không có gì phải làm cho việc hủy nó, nhưng không phải lúc nào cũng vậy và việc hủy có thể có các bước cần tuân theo. Chúng ta sẽ thấy thêm về điều này trong các ví dụ sắp tới. Giai đoạn hủy là bắt buộc và ngăn memory leak trong trường hợp cấp phát Heap.

Sẽ <a id="_idIndexMarker521"></a>tốt nếu xem cách chúng ta có thể viết ví dụ trên bằng C++. Điều này sẽ giúp bạn hiểu sâu hơn về cách một ngôn ngữ OOP <a id="_idIndexMarker522"></a>hiểu class và object và cách nó giảm chi phí viết code object-oriented đúng đắn.

Code box sau, trong *ví dụ 6.2*, thể hiện header file chứa class `Car` trong C++:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_6_2_H
#define EXTREME_C_EXAMPLES_CHAPTER_6_2_H
class Car {
public:
  // Constructor
  Car(const char*);
  // Destructor
  ~Car();
  void Accelerate();
  void Brake();
  void Refuel(double);
  // Data Members (Attributes in C)
  char name[32];
  double speed;
  double fuel;
};
#endif
```

*Code Box 6-10 [ExtremeC_examples_chapter6_2.h]: Khai báo của class Car trong C++*

Đặc điểm chính của code trên là thực tế rằng C++ biết về class. Do đó, code trên minh họa một encapsulation tường minh; cả attribute encapsulation lẫn behavior encapsulation. Hơn thế nữa, C++ hỗ trợ nhiều khái niệm object-oriented hơn như constructor và destructor.

Trong code C++, mọi khai báo, cả attribute lẫn behavior, đều được encapsulate trong định nghĩa class. Đây là encapsulation tường minh. Hãy xem hai hàm đầu tiên mà chúng ta đã khai báo làm constructor và destructor của class. C không biết về constructor và destructor; nhưng C++ có một ký pháp cụ thể cho chúng. Chẳng hạn, destructor bắt đầu bằng ~ và nó có cùng tên với class.

Ngoài ra, như bạn có thể thấy, các behavior function thiếu argument pointer đầu tiên. Đó là vì tất cả chúng đều có quyền truy cập các attribute bên trong class. Code box tiếp theo thể hiện <a id="_idIndexMarker523"></a>nội dung của source file <a id="_idIndexMarker524"></a>chứa định nghĩa của các behavior function đã khai báo:

```
#include <string.h>
#include "ExtremeC_examples_chapter6_2.h"
Car::Car(const char* name) {
  strcpy(this->name, name);
  this->speed = 0.0;
  this->fuel = 0.0;
}
Car::~Car() {
  // Nothing to do
}
void Car::Accelerate() {
  this->speed += 0.05;
  this->fuel -= 1.0;
  if (this->fuel < 0.0) {
    this->fuel = 0.0;
  }
}
void Car::Brake() {
  this->speed -= 0.07;
  if (this->speed < 0.0) {
    this->speed = 0.0;
  }
  this->fuel -= 2.0;
  if (this->fuel < 0.0) {
    this->fuel = 0.0;
  }
}
void Car::Refuel(double amount) {
  this->fuel = amount;
}
```

*Code Box 6-11 [ExtremeC_examples_chapter6_2.cpp]: Định nghĩa của class Car trong C++*

Nếu bạn nhìn kỹ, bạn sẽ thấy rằng pointer `car` trong code C đã được thay thế bằng một pointer `this`, vốn là một từ khóa trong C++. Từ khóa `this` đơn giản có nghĩa là object hiện tại. Tôi sẽ không giải thích thêm về nó ở đây, nhưng nó là một cách khéo léo để loại bỏ argument pointer trong C và làm cho behavior function đơn giản hơn.

Và cuối cùng, code box <a id="_idIndexMarker526"></a>sau chứa hàm `main` dùng class trên:

```
// File name: ExtremeC_examples_chapter6_2_main.cpp
// Description: Main function
#include <iostream>
#include "ExtremeC_examples_chapter6_2.h"
// Main function
int main(int argc, char** argv) {
  // Create the object variable and call the constructor
  Car car("Renault");
  // Main algorithm
  car.Refuel(100.0);
  std::cout << "Car is refueled, the correct fuel level is "
    << car.fuel << std::endl;
  while (car.fuel > 0) {
    std::cout << "Car fuel level: " << car.fuel << std::endl;
    if (car.speed < 80) {
      car.Accelerate();
      std::cout << "Car has been accelerated to the speed: "
        << car.speed << std::endl;
    } else {
      car.Brake();
      std::cout << "Car has been slowed down to the speed: "
        << car.speed << std::endl;
    }
  }
  std::cout << "Car ran out of the fuel! Slowing down ..."
    << std::endl;
  while (car.speed > 0) {
    car.Brake();
    std::cout << "Car has been slowed down to the speed: "
      << car.speed << std::endl;
  }
  std::cout << "Car is stopped!" << std::endl;
  // When leaving the function, the object 'car' gets
  // destructed automatically.
  return 0;
}
```

*Code Box 6-12 [ExtremeC_examples_chapter6_2_main.cpp]: Hàm main của ví dụ 6.2*

Hàm `main` được viết cho C++ rất giống với hàm chúng ta đã viết cho C, ngoại trừ việc nó cấp phát <a id="_idIndexMarker527"></a>memory cho một biến class thay vì một biến structure.

Trong C, chúng ta không thể đặt <a id="_idIndexMarker528"></a>attribute và behavior function vào một gói mà C biết đến. Thay vào đó, chúng ta phải dùng file để nhóm chúng. Nhưng trong C++, chúng ta có một cú pháp cho gói này, đó là *định nghĩa class* (class definition). Nó cho phép chúng ta đặt data member (hay attribute) và member function (hay behavior function) ở cùng một chỗ.

Vì C++ biết về encapsulation, việc truyền argument pointer cho behavior function là thừa, và như bạn có thể thấy, trong C++, chúng ta không có argument pointer đầu tiên nào trong khai báo member function như những gì chúng ta thấy trong phiên bản C của class `Car`.

Vậy, điều gì đã xảy ra? Chúng ta đã viết một chương trình object-oriented bằng cả C, vốn là một ngôn ngữ lập trình thủ tục, và bằng C++, vốn là một ngôn ngữ object-oriented. Thay đổi lớn nhất là dùng `car.Accelerate()` thay vì `car_accelerate(&car)`, hay dùng `car.Refuel(1000.0)` thay vì `car_refuel(&car, 1000.0)`.

Nói cách khác, nếu chúng ta thực hiện một lời gọi như `func(obj, a, b, c, ...)` trong một ngôn ngữ lập trình thủ tục, chúng ta có thể thực hiện nó dưới dạng `obj.func(a, b, c, ...)` trong một ngôn ngữ object-oriented. Chúng tương đương nhau nhưng đến từ các paradigm lập trình khác nhau. Như chúng ta đã nói trước đây, có rất nhiều ví dụ về các dự án C dùng kỹ thuật này.

> **Lưu ý:**
>
> Trong *Chương 9*, *Abstraction và OOP trong C++*, bạn sẽ thấy rằng C++ dùng chính xác kỹ thuật trên để dịch các lời gọi hàm C++ high-level thành các lời gọi hàm C low-level.

Lưu ý cuối cùng, có một khác biệt quan trọng giữa C và C++ về việc hủy object. Trong C++, hàm destructor được gọi tự động bất cứ khi nào một object được cấp phát trên đỉnh Stack và nó sắp ra khỏi scope, giống như mọi biến Stack khác. Đây là một thành tựu lớn trong quản lý memory của C++, vì trong C, bạn có thể dễ dàng quên gọi hàm destructor và rốt cuộc gặp phải memory leak.

Giờ là lúc nói về các khía cạnh khác của encapsulation. Trong phần tiếp theo, chúng ta sẽ nói về một hệ quả của encapsulation: information-hiding.

<a id="_idParaDest-113"></a>

### Information hiding (che giấu thông tin)

Cho đến giờ, chúng ta đã <a id="_idIndexMarker531"></a>giải thích cách encapsulation gói các attribute (biểu diễn giá trị) và chức năng (biểu diễn behavior) cùng nhau để tạo thành object. Nhưng nó không dừng ở đó.

Encapsulation có <a id="_idIndexMarker532"></a>một mục đích hay hệ quả quan trọng khác, đó là *information-hiding*. Information-hiding là hành động bảo vệ (hay che giấu) một số attribute và behavior không nên hiển thị với thế giới bên ngoài. Với thế giới bên ngoài, chúng tôi muốn nói mọi phần của code không thuộc về các behavior của một object. Theo định nghĩa này, không code nào khác, hay đơn giản là không hàm C nào khác, có thể truy cập một attribute private hay một behavior private của một object nếu attribute hay behavior đó không phải là một phần của public interface của class.

Lưu ý rằng các behavior của hai object cùng kiểu, như `car1` và `car2` từ class `Car`, có thể truy cập các attribute của bất kỳ object nào cùng kiểu. Đó là do thực tế rằng chúng ta viết behavior function một lần cho mọi object trong một class.

Trong *ví dụ 6.1*, chúng ta đã thấy rằng hàm `main` dễ dàng truy cập các attribute `speed` và `fuel` trong attribute structure `car_t`. Điều này có nghĩa là mọi attribute trong kiểu `car_t` đều là public. Có một attribute hay behavior public có thể là một điều tồi vì nó có thể có một số long-lasting và nguy hiểm.

Hệ quả là, các chi tiết hiện thực có thể bị rò rỉ ra ngoài. Giả sử rằng bạn sẽ dùng một object xe hơi. Thông thường, điều quan trọng với bạn chỉ là nó có một behavior tăng tốc xe; và bạn không tò mò về việc nó được thực hiện như thế nào. Có thể có thậm chí nhiều attribute nội bộ hơn trong object góp phần vào quá trình tăng tốc, nhưng không có lý do hợp lệ nào để chúng phải hiển thị với logic sử dụng.

Chẳng hạn, lượng dòng điện được cấp cho bộ khởi động động cơ có thể là một attribute, nhưng nó chỉ nên là private đối với chính object. Điều này cũng đúng với một số behavior nội bộ của object. Ví dụ, việc phun nhiên liệu vào buồng đốt là một behavior nội bộ không nên hiển thị và truy cập được với bạn, nếu không, bạn có thể can thiệp vào nó và làm gián đoạn quá trình bình thường của động cơ.

Từ một góc nhìn khác, các chi tiết hiện thực (cách xe hoạt động) khác nhau giữa các nhà sản xuất xe hơi nhưng khả năng tăng tốc xe là một behavior được mọi nhà sản xuất xe hơi cung cấp. Chúng ta thường nói rằng khả năng tăng tốc xe là một phần của *public API* hay *public interface* của class `Car`.

Nói chung, code dùng một object trở nên phụ thuộc vào các attribute và behavior public của object đó. Đây là một mối lo ngại nghiêm trọng. Để rò rỉ một attribute nội bộ bằng cách khai báo nó là public lúc đầu và sau đó làm nó private có thể thực chất làm hỏng việc build của code phụ thuộc. Có thể kỳ vọng rằng các phần khác của code đang dùng attribute đó như một thứ public sẽ không biên dịch được sau thay đổi.

Điều này có nghĩa là bạn đã phá vỡ khả năng tương thích ngược (backward compatibility). Đó là lý do tại sao chúng ta chọn một cách tiếp cận thận trọng và làm cho từng attribute đều private theo mặc định cho đến khi chúng ta tìm thấy lý lẽ hợp lý để làm nó public.

Nói đơn giản, việc phơi ra code private từ một class về thực chất có nghĩa là thay vì phụ thuộc vào một public interface nhẹ nhàng, chúng ta đã phụ thuộc vào một hiện thực nặng nề. Những hệ quả này nghiêm trọng và có tiềm năng gây ra rất nhiều việc làm lại trong một dự án. Vì vậy, điều quan trọng là giữ các attribute và behavior private nhất có thể.

Code box sau, trong *ví dụ 6.3*, sẽ minh họa cách chúng ta có thể có các attribute và behavior private trong C. Ví dụ là về một class `List` được dùng để lưu một số giá trị số nguyên:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_6_3_H
#define EXTREME_C_EXAMPLES_CHAPTER_6_3_H
#include <unistd.h>
// The attribute structure with no disclosed attribute
struct list_t;
// Allocation function
struct list_t* list_malloc();
// Constructor and destructor functions
void list_init(struct list_t*);
void list_destroy(struct list_t*);
// Public behavior functions
int list_add(struct list_t*, int);
int list_get(struct list_t*, int, int*);
void list_clear(struct list_t*);
size_t list_size(struct list_t*);
void list_print(struct list_t*);
#endif
```

*Code Box 6-13 [ExtremeC_examples_chapter6_3.h]: Public interface của class List*

Những gì bạn thấy trong code box trên là cách chúng ta làm cho các attribute trở thành private. Nếu một source file khác, như file chứa hàm `main`, include header trên, nó sẽ không có quyền truy cập các attribute bên trong kiểu `list_t`. Lý do đơn giản. `list_t` chỉ là một khai báo không có định nghĩa, và chỉ với một khai báo structure, bạn không thể truy cập các trường của structure. Bạn thậm chí không thể <a id="_idIndexMarker535"></a>khai báo một biến từ nó. Bằng cách này, chúng ta bảo đảm information-hiding. Đây thực sự là một thành tựu lớn.

Một lần nữa, trước khi tạo và công bố một header file, bắt buộc phải double-check (kiểm tra kỹ) xem <a id="_idIndexMarker536"></a>chúng ta có cần phơi ra một thứ gì đó là public hay không. Bằng việc phơi ra một behavior public hay một attribute public, bạn sẽ tạo ra các phụ thuộc mà việc phá vỡ chúng sẽ khiến bạn tốn thời gian, công sức phát triển, và rốt cuộc là tiền bạc.

Code box sau minh họa định nghĩa thực sự của attribute structure `list_t`. Lưu ý rằng nó được định nghĩa bên trong một source file chứ không phải một header file:

```
#include <stdio.h>
#include <stdlib.h>
#define MAX_SIZE 10
// Define the alias type bool_t
typedef int bool_t;
// Define the type list_t
typedef struct {
  size_t size;
  int* items;
} list_t;
// A private behavior which checks if the list is full
bool_t __list_is_full(list_t* list) {
  return (list->size == MAX_SIZE);
}
// Another private behavior which checks the index
bool_t __check_index(list_t* list, const int index) {
  return (index >= 0 && index <= list->size);
}
// Allocates memory for a list object
list_t* list_malloc() {
  return (list_t*)malloc(sizeof(list_t));
}
// Constructor of a list object
void list_init(list_t* list) {
  list->size = 0;
  // Allocates from the heap memory
  list->items = (int*)malloc(MAX_SIZE * sizeof(int));
}
// Destructor of a list object
void list_destroy(list_t* list) {
  // Deallocates the allocated memory
  free(list->items);
}
int list_add(list_t* list, const int item) {
  // The usage of the private behavior
  if (__list_is_full(list)) {
    return -1;
  }
  list->items[list->size++] = item;
  return 0;
}
int list_get(list_t* list, const int index, int* result) {
  if (__check_index(list, index)) {
    *result = list->items[index];
    return 0;
  }
  return -1;
}
void list_clear(list_t* list) {
  list->size = 0;
}
size_t list_size(list_t* list) {
  return list->size;
}
void list_print(list_t* list) {
  printf("[");
  for (size_t i = 0; i < list->size; i++) {
    printf("%d ", list->items[i]);
  }
  printf("]\n");
}
```

*Code Box 6-14 [ExtremeC_examples_chapter6_3.c]: Định nghĩa của class List*

Mọi định nghĩa <a id="_idIndexMarker537"></a>mà bạn thấy trong code box trên đều là private. Logic bên ngoài sẽ dùng một object `list_t` không biết gì về các hiện thực trên, và header file là mẩu code duy nhất <a id="_idIndexMarker538"></a>mà code bên ngoài sẽ phụ thuộc vào.

Lưu ý rằng file trên thậm chí không include header file! Chừng nào các định nghĩa và chữ ký hàm khớp với các khai báo trong header file, đó là tất cả những gì cần thiết. Tuy nhiên, nên làm như vậy vì nó bảo đảm tính tương thích giữa các khai báo và các định nghĩa tương ứng của chúng. Như bạn đã thấy trong *Chương 2*, *Biên dịch và Liên kết (Compilation and Linking)*, các source file được biên dịch riêng rẽ và cuối cùng được link lại với nhau.

Thực tế, linker mang các định nghĩa private tới các khai báo public và tạo ra một chương trình hoạt động được từ chúng.

> **Lưu ý:**
>
> Chúng ta có thể dùng một ký pháp khác cho các behavior function private. Chúng ta dùng tiền tố `__` trong tên của chúng. Ví dụ, hàm `__check_index` là một hàm private. Lưu ý rằng một hàm private không có khai báo tương ứng nào trong header file.

Code box <a id="_idIndexMarker539"></a>sau chứa hàm `main` của *ví dụ 6.3*, tạo hai object list, điền vào list thứ nhất, và dùng list thứ hai <a id="_idIndexMarker540"></a>để lưu đảo ngược của list thứ nhất. Cuối cùng, nó in chúng ra:

```
#include <stdlib.h>
#include "ExtremeC_examples_chapter6_3.h"
int reverse(struct list_t* source, struct list_t* dest) {
  list_clear(dest);
  for (size_t i = list_size(source) - 1; i >= 0; i--) {
    int item;
    if(list_get(source, i, &item)) {
      return -1;
    }
    list_add(dest, item);
  }
  return 0;
}
int main(int argc, char** argv) {
  struct list_t* list1 = list_malloc();
  struct list_t* list2 = list_malloc();
  // Construction
  list_init(list1);
  list_init(list2);
  list_add(list1, 4);
  list_add(list1, 6);
  list_add(list1, 1);
  list_add(list1, 5);
  list_add(list2, 9);
  reverse(list1, list2);
  list_print(list1);
  list_print(list2);
  // Destruction
  list_destroy(list1);
  list_destroy(list2);
  free(list1);
  free(list2);
  return 0;
}
```

*Code Box 6-15 [ExtremeC_examples_chapter6_3_main.c]: Hàm main của ví dụ 6.3*

Như bạn có thể thấy trong code box trên, chúng ta đã viết các hàm `main` và `reverse` chỉ dựa <a id="_idIndexMarker541"></a>trên những thứ được khai báo trong header file. Nói cách khác, những hàm này chỉ dùng public API (hay public interface) của class `List`; các khai báo của attribute structure `list_t` và các behavior function của nó. Ví dụ này là một minh họa hay về cách phá vỡ các phụ thuộc và che giấu chi tiết hiện thực khỏi các phần khác của code.

> **Lưu ý:**
>
> Dùng public API, bạn có thể viết một chương trình biên dịch được, nhưng nó không thể trở thành một chương trình hoạt động thật sự trừ khi bạn cung cấp các object file tương ứng của phần private và link chúng lại với nhau.

Có <a id="_idIndexMarker542"></a>một số điểm liên quan đến code trên mà chúng ta khám phá chi tiết hơn ở đây. Chúng ta cần có một hàm `list_malloc` để cấp phát memory cho một object `list_t`. Sau đó, chúng ta có thể dùng hàm `free` để giải phóng memory đã cấp phát khi dùng xong object.

Bạn không thể dùng `malloc` trực tiếp trong ví dụ trên. Đó là vì nếu bạn định dùng `malloc` bên trong hàm `main`, bạn phải truyền `sizeof(list_t)` làm số byte cần được cấp phát. Tuy nhiên, bạn không thể dùng `sizeof` cho một kiểu chưa hoàn chỉnh.

Kiểu `list_t` được include từ header file là một *incomplete type* (kiểu chưa hoàn chỉnh) vì nó chỉ là một khai báo không cung cấp thông tin gì về các trường bên trong, và chúng ta không biết kích thước của nó khi biên dịch. Kích thước thực sẽ chỉ được xác định vào lúc link khi chúng ta biết các chi tiết hiện thực. Như một giải pháp, chúng ta phải định nghĩa hàm `list_malloc` và dùng `malloc` ở một nơi mà `sizeof(list_t)` được xác định.

Để build *ví dụ 6.3*, trước tiên chúng ta cần biên dịch các source. Các lệnh sau tạo ra các object file cần thiết trước giai đoạn linking:

```
$ gcc -c ExtremeC_examples_chapter6_3.c -o private.o
$ gcc -c ExtremeC_examples_chapter6_3_main.c -o main.o
```

*Shell Box 6-1: Biên dịch ví dụ 6.3*

Như bạn thấy, chúng ta đã <a id="_idIndexMarker544"></a>biên dịch phần private thành `private.o` và phần main thành `main.o`. Hãy nhớ rằng chúng ta không biên dịch header file. Các khai báo public trong header được include như một phần của object file `main.o`.

Giờ chúng ta cần link các object file trên lại với nhau, nếu không `main.o` một mình không thể trở thành một chương trình thực thi được. Nếu bạn cố tạo một executable file chỉ dùng `main.o`, bạn sẽ thấy các lỗi sau:

```
$ gcc main.o -o ex6_3.out
main.o: In function 'reverse':
ExtremeC_examples_chapter6_3_main.c:(.text+0x27): undefined reference to 'list_clear'
...
main.o: In function 'main':
ExtremeC_examples_chapter6_3_main.c:(.text+0xa5): undefined reference to 'list_malloc'
...                                                                                                                               collect2: error: ld returned 1 exit status
$
```

*Shell Box 6-2: Cố link ví dụ 6.3 chỉ bằng cách cung cấp main.o*

Bạn thấy rằng linker không thể tìm thấy định nghĩa của các hàm được khai báo trong header file. Cách đúng để link ví dụ như sau:

```
$ gcc main.o private.o -o ex6_3.out
$ ./ex6_3.out
[4 6 1 5 ]
[5 1 6 4 ]
$
```

*Shell Box 6-3: Link và chạy ví dụ 6.3*

Điều gì xảy ra nếu bạn thay đổi hiện thực đằng sau class `List`?

Giả sử, thay vì dùng một mảng, bạn dùng một linked list. Có vẻ như chúng ta không cần tạo lại `main.o`, vì nó <a id="_idIndexMarker545"></a>độc lập một cách gọn gàng với các chi tiết hiện thực của list mà nó dùng. Vì vậy, chúng ta chỉ cần biên dịch và tạo một object file mới cho hiện thực mới; ví dụ, `private2.o`. Sau đó, chúng ta chỉ cần link lại các object file và có được executable mới:

```
$ gcc main.o private2.o -o ex6_3.out
$ ./ex6_3.out
[4 6 1 5 ]
[5 1 6 4 ]
$
```

*Shell Box 6-4: Link và chạy ví dụ 6.3 với một hiện thực khác của class List*

Như bạn thấy, từ góc nhìn của người dùng, không có gì thay đổi, nhưng hiện thực bên dưới <a id="_idIndexMarker546"></a>đã được thay thế. Đó là một thành tựu lớn và cách tiếp cận này đang được dùng rất nhiều trong các dự án C.

Nếu chúng ta muốn không phải lặp lại giai đoạn linking trong trường hợp có một hiện thực list mới thì sao? Trong trường hợp đó, chúng ta có thể dùng một shared library (hay file `.so`) để chứa object file private. Sau đó, chúng ta có thể nạp nó một cách động vào lúc runtime, loại bỏ nhu cầu link lại executable. Chúng ta đã thảo luận về shared library trong *Chương 3*, *Object File*.

Ở đây, chúng ta kết thúc chương hiện tại và chúng ta sẽ tiếp tục thảo luận trong chương tiếp theo. Hai chương tiếp theo sẽ là về các mối quan hệ khả dĩ có thể tồn tại giữa hai class.

<a id="_idParaDest-114"></a>

## Tóm tắt

Trong chương này, các chủ đề sau đã được thảo luận:

- Chúng ta đã đưa ra một giải thích kỹ lưỡng về triết lý object-orientation và cách bạn có thể trích xuất một object model từ bản đồ tư duy của mình.
- Chúng ta cũng đã giới thiệu khái niệm domain và cách nó nên được dùng để lọc bản đồ tư duy để chỉ giữ lại các khái niệm và ý tưởng liên quan.
- Chúng ta cũng đã giới thiệu các attribute và behavior của một object đơn lẻ và cách chúng nên được trích xuất từ bản đồ tư duy hoặc từ các yêu cầu được đưa ra trong mô tả của một domain.
- Chúng ta đã giải thích tại sao C không thể là một ngôn ngữ OOP và khám phá vai trò của nó trong việc dịch các chương trình OOP thành các instruction assembly low-level rốt cuộc sẽ được chạy trên một CPU.
- Encapsulation, với tư cách là nguyên lý đầu tiên trong OOP, đã được thảo luận. Chúng ta dùng encapsulation để tạo các capsule (hay object) chứa một tập attribute (chỗ chứa cho giá trị) và một tập behavior (chỗ chứa cho logic).
- Information-hiding cũng đã được thảo luận, bao gồm cách nó có thể dẫn đến các interface (hay API) có thể được dùng mà không phải trở nên phụ thuộc vào hiện thực bên dưới.
- Trong khi thảo luận về information-hiding, chúng ta đã minh họa cách làm cho các attribute hay method trở thành private trong code C.

Chương tiếp theo sẽ là phần mở đầu cho thảo luận về các mối quan hệ khả dĩ giữa các class. Chúng ta bắt đầu *Chương 7*, *Composition và Aggregation*, bằng việc nói về quan hệ composition và sau đó, chúng ta tiếp tục với inheritance và polymorphism trong *Chương 8*, *Inheritance và Polymorphism*.
