<a id="_idParaDest-181"></a>

# Chương 13: Concurrency

Trong suốt hai chương tiếp theo, chúng ta sẽ nói về *concurrency* (tính đồng thời) và nền tảng lý thuyết cần thiết để phát triển các chương trình concurrent, không chỉ trong C, mà nhất thiết cả trong các ngôn ngữ khác. Như vậy, hai chương này sẽ không chứa code C nào mà thay vào đó dùng pseudo-code để biểu diễn các hệ thống concurrent và các thuộc tính nội tại của chúng.

Chủ đề concurrency, do độ dài của nó, đã được chia thành hai chương. Trong chương này, chúng ta sẽ xem xét các khái niệm cơ bản về bản thân concurrency, trước khi chuyển sang *Chương 14*, *Synchronization*, nơi chúng ta sẽ thảo luận về các vấn đề concurrency-related và các cơ chế *synchronization* được dùng trong các chương trình concurrent để giải quyết các vấn đề đã nêu. Mục tiêu cuối cùng chung của hai chương này là cung cấp cho bạn đủ kiến thức lý thuyết để tiếp tục với các chủ đề multithreading và multi-processing được thảo luận trong các chương sắp tới.

Kiến thức nền tảng chúng ta xây dựng trong chương này cũng sẽ hữu ích khi làm việc với *POSIX threading library*, vốn được chúng ta dùng trong suốt cuốn sách này.

Trong chương đầu tiên về concurrency này, chúng ta sẽ tìm hiểu:

- Hệ thống parallel khác với hệ thống concurrent như thế nào
- Khi nào chúng ta cần concurrency
- *Task scheduler* là gì, và các thuật toán scheduling được dùng rộng rãi là gì
- Một chương trình concurrent được chạy như thế nào và các interleaving là gì
- Shared state là gì và các tác vụ khác nhau có thể truy cập nó như thế nào

Hãy bắt đầu tìm hiểu về concurrency bằng cách đưa ra một phần giới thiệu về khái niệm này, và hiểu một cách tổng quát nó có ý nghĩa gì với chúng ta.

<a id="_idParaDest-182"></a>

## Giới thiệu concurrency

Concurrency đơn giản có nghĩa là có nhiều mẩu logic bên trong một chương trình đang được thực thi đồng thời. Các hệ thống phần mềm hiện đại thường là concurrent, vì các chương trình cần chạy nhiều mẩu logic khác nhau cùng lúc. Như vậy, concurrency là thứ mà mọi chương trình ngày nay đều đang dùng ở một mức độ nhất định.

Chúng ta có thể nói rằng concurrency là một công cụ mạnh mẽ cho phép bạn viết các chương trình có thể quản lý các tác vụ khác nhau cùng lúc, và việc hỗ trợ cho nó thường nằm trong kernel, vốn là trái tim của hệ điều hành.

Có <a id="_idIndexMarker883"></a>rất nhiều ví dụ trong đó một chương trình thông thường quản lý nhiều công việc đồng thời. Ví dụ, bạn có thể lướt web trong khi tải file xuống. Trong trường hợp này, các tác vụ đang được thực thi một cách concurrent trong ngữ cảnh của process trình duyệt. Một ví dụ đáng chú ý khác là trong một kịch bản *video streaming*, như khi bạn đang xem một video trên YouTube. Trình phát video có thể đang tải các đoạn video tiếp theo trong khi bạn vẫn đang xem các đoạn đã được tải trước đó.

Ngay cả phần mềm word-processing (xử lý văn bản) đơn giản cũng có một số tác vụ concurrent chạy ở chế độ nền. Khi tôi viết chương này trên Microsoft Word, một trình kiểm tra chính tả và một trình định dạng đang chạy ở chế độ nền. Nếu bạn đang đọc điều này trên ứng dụng Kindle trên một iPad, bạn nghĩ những chương trình nào có thể đang chạy concurrent như một phần của chương trình Kindle?

Có nhiều chương trình được chạy cùng lúc nghe thật tuyệt vời, nhưng như hầu hết các công nghệ, concurrency mang lại một số vấn đề đau đầu bên cạnh những lợi ích của nó. Thật vậy, concurrency mang lại một số vấn đề đau đầu nhất trong lịch sử khoa học máy tính! Những "vấn đề đau đầu" này, mà chúng ta sẽ đề cập sau, có thể ẩn giấu trong một thời gian dài, thậm chí hàng tháng sau khi phát hành, và chúng thường khó tìm, khó tái tạo và khó giải quyết.

Chúng ta đã bắt đầu phần này bằng việc mô tả concurrency là việc có các tác vụ đang được thực thi cùng lúc, hay một cách concurrent. Mô tả này ngụ ý rằng các tác vụ đang được chạy song song, nhưng điều đó không hoàn toàn đúng. Một mô tả như vậy quá đơn giản, cũng như không chính xác, vì *việc concurrent khác với việc parallel*, và chúng ta chưa giải thích những khác biệt giữa hai điều này. Hai chương trình concurrent khác với hai chương trình parallel, và một trong những mục tiêu của chúng ta trong chương này là làm sáng tỏ những khác biệt này và đưa ra một số định nghĩa được dùng bởi tài liệu chính thức trong lĩnh vực này.

Trong các phần sau, chúng ta sẽ giải thích một số khái niệm concurrency-related cơ bản như *task*, *scheduling*, *interleaving*, *state* và *shared state*, vốn là một số thuật ngữ bạn sẽ gặp thường xuyên trong cuốn sách này. Đáng chỉ ra rằng hầu hết các khái niệm này là trừu tượng và có thể được áp dụng cho bất kỳ hệ thống concurrent nào, không chỉ trong C.

Để hiểu sự khác biệt giữa parallel và concurrent, chúng ta sẽ đề cập ngắn gọn về các hệ thống parallel.

Lưu ý rằng trong <a id="_idIndexMarker884"></a>chương này chúng ta giữ các định nghĩa đơn giản. Mục đích duy nhất của chúng ta là cho bạn một ý niệm cơ bản về cách các hệ thống concurrent hoạt động, vì đi xa hơn thế sẽ nằm ngoài phạm vi của cuốn sách về C này.

<a id="_idParaDest-183"></a>

## Parallelism (tính song song)

Parallelism đơn giản có nghĩa là có hai tác vụ chạy cùng lúc, hay *song song*. Cụm từ "song song" là yếu tố then chốt phân biệt parallelism với concurrency. Tại sao lại như vậy? Vì song song ngụ ý rằng hai việc đang xảy ra đồng thời. Đây không phải là trường hợp <a id="_idIndexMarker885"></a>trong một hệ thống concurrent; trong các hệ thống concurrent, bạn cần tạm dừng một tác vụ để cho tác vụ khác tiếp tục thực thi. Lưu ý rằng định nghĩa này có thể quá đơn giản và chưa đầy đủ đối với các hệ thống concurrent hiện đại, nhưng nó đủ để chúng tôi cho bạn một ý niệm cơ bản.

Chúng ta gặp parallelism thường xuyên trong cuộc sống hằng ngày. Khi bạn và bạn của bạn đang làm hai tác vụ riêng biệt đồng thời, những tác vụ đó đang được thực hiện song song. Để có một số tác vụ song song, chúng ta cần các *processing unit* (đơn vị xử lý) riêng biệt và cô lập, mỗi đơn vị được gán cho một tác vụ nhất định. Chẳng hạn, trong một hệ thống máy tính, mỗi *CPU core* là một đơn vị xử lý có thể xử lý một tác vụ tại một thời điểm.

Trong một phút, hãy nhìn bản thân như người đọc duy nhất của cuốn sách này. Bạn không thể đọc hai cuốn sách song song; bạn sẽ phải tạm dừng đọc một trong số chúng để đọc cuốn kia. Tuy nhiên, nếu bạn thêm bạn của mình vào, thì có thể đọc hai cuốn sách song song.

Điều gì sẽ xảy ra nếu bạn có cuốn sách thứ ba cần được đọc? Vì không ai trong hai bạn có thể đọc hai cuốn sách song song, một trong hai bạn sẽ cần tạm dừng đọc cuốn sách của mình để tiếp tục với cuốn thứ ba. Điều này đơn giản có nghĩa là hoặc bạn hoặc bạn của bạn cần phân chia thời gian một cách hợp lý để đọc cả ba cuốn sách.

Trong một hệ thống máy tính, phải có ít nhất hai đơn vị xử lý riêng biệt và độc lập để có hai tác vụ parallel được thực thi trên hệ thống đó. Các CPU hiện đại có một số *core* (lõi) bên trong, và những lõi đó là các đơn vị xử lý thực sự. Ví dụ, một CPU 4-core có 4 đơn vị xử lý, và do đó có thể hỗ trợ 4 tác vụ parallel được chạy đồng thời. Để đơn giản, trong chương này chúng ta sẽ giả định rằng CPU tưởng tượng của chúng ta chỉ có một lõi bên trong và do đó không thể thực hiện các tác vụ parallel. Sẽ có một số thảo luận về các CPU multi-core sau đó, trong các phần liên quan.

Giả sử rằng bạn có hai laptop với CPU tưởng tượng của chúng ta bên trong, với một chiếc đang phát một bản nhạc, và chiếc kia đang tìm lời giải cho một phương trình vi phân. Cả hai đều đang hoạt động song song, nhưng nếu bạn muốn chúng làm cả hai việc trên cùng một laptop chỉ dùng một CPU, và với một lõi, thì nó *không thể* là parallel và thực tế nó là concurrent.

Parallelism là về các tác vụ có thể được song song hóa. Điều này có nghĩa là thuật toán thực sự có thể được chia ra và chạy trên nhiều đơn vị xử lý. Nhưng hầu hết các thuật toán chúng ta viết, tính đến ngày nay, đều là *tuần tự* (sequential) và không song song về bản chất. Ngay cả trong multithreading, mỗi thread có một số instruction tuần tự không thể được chia thành một số *execution flow* (luồng thực thi) song song.

Nói cách khác, một thuật toán tuần tự không thể dễ dàng được hệ điều hành tự động chia thành một số luồng thực thi song song<a id="_idIndexMarker886"></a>, và việc này nên được một lập trình viên thực hiện. Do đó, với việc có một CPU multi-core, bạn vẫn cần gán mỗi luồng thực thi cho một lõi CPU nhất định, và trong lõi đó, nếu bạn có nhiều hơn một luồng được gán, bạn không thể có cả hai chạy song song, và bạn ngay lập tức quan sát thấy một hành vi concurrent.

Tóm lại, dĩ nhiên việc có hai luồng, mỗi luồng được gán cho một lõi khác nhau, có thể dẫn đến hai luồng song song, nhưng gán chúng cho chỉ một lõi sẽ dẫn đến hai luồng concurrent. Trong các CPU multi-core, chúng ta thực chất quan sát thấy một hành vi hỗn hợp, vừa song song giữa các lõi, vừa concurrent trên cùng một lõi.

Bất chấp ý nghĩa đơn giản và vô số ví dụ hằng ngày, parallelism là một chủ đề phức tạp và khó trong computer architecture. Thực tế, nó là một chủ đề học thuật tách biệt với concurrency, với các lý thuyết, sách và tài liệu riêng. Việc có được một hệ điều hành có thể chia một thuật toán tuần tự thành một số luồng thực thi song song là một lĩnh vực nghiên cứu mở và các hệ điều hành hiện tại không thể làm điều đó.

Như đã nêu, mục đích của chương này không phải là đi sâu vào parallelism, mà chỉ cung cấp một định nghĩa ban đầu cho khái niệm này. Vì thảo luận sâu hơn về parallelism nằm ngoài phạm vi của cuốn sách này, hãy bắt đầu với khái niệm concurrency.

Trước tiên, chúng ta sẽ nói về các hệ thống concurrent và nó thực sự có nghĩa là gì so với parallelism.

<a id="_idParaDest-184"></a>

## Concurrency

Bạn có thể <a id="_idIndexMarker887"></a>đã nghe về *multitasking* – chà, concurrency có cùng ý tưởng. Nếu hệ thống của bạn đang quản lý nhiều tác vụ cùng lúc, bạn cần hiểu rằng điều đó không nhất thiết có nghĩa là các tác vụ đang được chạy song song. Thay vào đó, có thể có một *task scheduler* ở giữa; nó đơn giản chuyển đổi rất nhanh giữa các tác vụ khác nhau và thực hiện một chút của mỗi tác vụ trong một khoảng thời gian khá nhỏ.

Điều này chắc chắn xảy ra khi bạn chỉ có một đơn vị xử lý. Trong phần còn lại của thảo luận trong phần này, chúng ta giả định rằng chúng ta đang hoạt động trên chỉ một đơn vị xử lý.

Nếu một task scheduler đủ *nhanh* và *công bằng*, bạn sẽ không để ý đến việc *chuyển đổi* giữa các tác vụ, và chúng sẽ có vẻ như đang chạy song song từ góc nhìn của bạn. Đó là phép màu của concurrency, và chính là lý do tại sao nó đang được dùng trong hầu hết các hệ điều hành được biết đến rộng rãi, bao gồm Linux, macOS và Microsoft Windows.

Concurrency có thể <a id="_idIndexMarker888"></a>được xem như một sự mô phỏng việc thực hiện các tác vụ song song, dùng một đơn vị xử lý duy nhất. Thực tế, toàn bộ ý tưởng có thể được gọi là một dạng parallelism nhân tạo. Đối với các hệ thống cũ chỉ có một CPU duy nhất, với chỉ một lõi, đó là một bước tiến lớn khi người ta có thể dùng lõi duy nhất đó theo kiểu multitasking.

Một lưu ý bên lề, *Multics* là một trong những hệ điều hành đầu tiên được thiết kế để multitask và quản lý các process đồng thời. Bạn sẽ nhớ rằng trong *Chương 10*, *Unix – Lịch sử và Architecture*, Unix đã được xây dựng dựa trên các ý tưởng có được từ dự án Multics.

Như chúng tôi đã giải thích trước đây, gần như mọi hệ điều hành đều có thể thực hiện các tác vụ concurrent thông qua multitasking, đặc biệt là các hệ điều hành POSIX-compliant, vì khả năng này được phơi ra rõ ràng trong chuẩn POSIX.

<a id="_idParaDest-185"></a>

## Đơn vị task scheduler

Như chúng tôi đã nói trước đây, mọi hệ điều hành multitasking đều cần có một đơn vị *task scheduler*, hay đơn giản là một *scheduler unit*, trong kernel của chúng. Trong phần này, chúng ta sẽ xem đơn vị <a id="_idIndexMarker889"></a>này hoạt động như thế nào và nó góp phần như thế nào vào việc thực thi liền mạch một số tác vụ concurrent.

Một số sự thật <a id="_idIndexMarker890"></a>về đơn vị task scheduler được liệt kê như sau:

- Scheduler có một *queue* (hàng đợi) cho các tác vụ đang chờ được thực thi. *Task* hay *job* đơn giản là các phần công việc cần được thực hiện trong các luồng thực thi riêng biệt.
- Hàng đợi này thường được *ưu tiên hóa* (prioritized), với các tác vụ high-priority được chọn bắt đầu trước.
- Đơn vị xử lý được task scheduler quản lý và chia sẻ giữa mọi tác vụ. Khi đơn vị xử lý rảnh (không có tác vụ nào đang dùng nó), task scheduler phải chọn một tác vụ khác từ hàng đợi của nó trước khi cho nó dùng đơn vị xử lý. Khi tác vụ kết thúc, nó giải phóng đơn vị xử lý và làm cho nó <a id="_idIndexMarker891"></a>sẵn có trở lại, rồi task scheduler chọn một tác vụ khác. Việc này tiếp diễn trong một vòng lặp liên tục. Điều này được gọi là *task scheduling*, và đó là trách nhiệm duy nhất của task scheduler.
- Có nhiều *scheduling algorithm* mà task scheduler có thể vận hành, nhưng tất cả chúng đều nên đáp ứng các yêu cầu cụ thể. Ví dụ, tất cả chúng đều nên *công bằng*, và không tác vụ nào nên bị *bỏ đói* (starved) trong hàng đợi do không được chọn trong một khoảng thời gian kéo dài.
- Dựa trên một *scheduling strategy* (chiến lược lập lịch) được chọn, scheduler nên hoặc dành một *time slice* hay *time quantum* cụ thể cho tác vụ để dùng đơn vị xử lý, hoặc thay vào đó, scheduler phải chờ tác vụ giải phóng đơn vị xử lý.
- Nếu scheduling strategy là *preemptive*, scheduler nên có khả năng cưỡng chế lấy lại lõi CPU từ tác vụ đang chạy để đưa nó cho tác vụ tiếp theo. Điều này được gọi là *preemptive scheduling*. Cũng có một cơ chế khác trong đó tác vụ tự nguyện giải phóng CPU, được gọi là *cooperative scheduling*.
- Các thuật toán preemptive scheduling cố gắng chia sẻ các *time slice* một cách đồng đều và công bằng giữa các tác vụ khác nhau. Các tác vụ được ưu tiên có thể được chọn thường xuyên hơn, hoặc chúng thậm chí có thể có time slice dài hơn tùy thuộc vào bản triển khai của scheduler.

Task là một khái niệm trừu tượng tổng quát, được dùng để chỉ bất kỳ phần công việc nào cần được thực hiện trong một hệ thống concurrent, không nhất thiết là một hệ thống máy tính. Chúng ta sẽ xem chính xác những hệ thống non-computer này là gì ngay sau đây. Tương tự, CPU không phải là loại tài nguyên duy nhất có thể được chia sẻ giữa các tác vụ. Con người đã lập lịch và ưu tiên hóa các tác vụ từ khi chúng ta tồn tại, khi chúng ta đối mặt với các tác vụ mà chúng ta không thể hoàn thành đồng thời. Trong vài đoạn tiếp theo, chúng ta sẽ xem xét một tình huống như vậy như một ví dụ tốt để hiểu scheduling.

Giả sử rằng chúng ta đang ở đầu thế kỷ hai mươi và chỉ có một bốt điện thoại trên phố, và 10 người đang chờ dùng điện thoại. Trong trường hợp này, 10 người này nên tuân theo một thuật toán scheduling để chia sẻ bốt điện thoại một cách công bằng giữa họ.

Trước hết, họ cần đứng thành một hàng. Đây là quyết định cơ bản nhất nảy ra trong tâm trí văn minh trong một tình huống như vậy – đứng vào hàng và chờ đến lượt mình. Tuy nhiên, chỉ điều này thôi là không đủ; chúng ta cũng cần một số quy định để hỗ trợ phương pháp này. Người đầu tiên, người đang dùng điện thoại, không thể nói chuyện lâu như họ muốn khi có chín người khác đang chờ bốt điện thoại. Người đầu tiên phải rời bốt sau một khoảng thời gian nhất định để nhường lượt cho người tiếp theo trong hàng.

Trong trường hợp hiếm <a id="_idIndexMarker893"></a>mà họ chưa kết thúc cuộc trò chuyện, người đầu tiên nên ngừng dùng điện thoại sau một khoảng thời gian nhất định, rời bốt, và quay lại cuối hàng. Sau đó họ phải chờ lượt tiếp theo để có thể tiếp tục cuộc nói chuyện. Bằng cách này, mỗi người trong 10 người sẽ cần tiếp tục vào bốt, cho đến khi họ đã hoàn thành cuộc trò chuyện của mình.

Đây chỉ là một ví dụ. Chúng ta gặp các ví dụ về việc chia sẻ tài nguyên giữa một số người tiêu dùng mỗi ngày, và con người đã phát minh ra nhiều cách để chia sẻ những tài nguyên này một cách công bằng giữa họ – trong phạm vi mà bản chất con người cho phép! Trong phần tiếp theo, chúng ta quay lại xem xét scheduling trong ngữ cảnh của một hệ thống máy tính.

<a id="_idParaDest-186"></a>

## Process và thread

Trong suốt cuốn sách này, chúng ta chủ yếu quan tâm đến task scheduling bên trong các hệ thống máy tính. Trong một hệ điều hành, các tác vụ là *process* hoặc *thread*. Chúng tôi sẽ giải thích chúng và những <a id="_idIndexMarker894"></a>khác biệt của chúng trong các chương sắp tới, nhưng lúc này, bạn nên biết rằng hầu hết các hệ điều hành đối xử với cả hai về cơ bản theo cùng một cách: như một số tác vụ cần <a id="_idIndexMarker895"></a>được thực thi một cách concurrent.

Một hệ điều hành cần dùng một task scheduler để chia sẻ các lõi CPU giữa nhiều tác vụ, dù là process hay thread, đang muốn dùng CPU để thực thi. Khi một process mới hay một thread mới được tạo ra, nó đi vào hàng đợi của scheduler như một tác vụ mới, và nó chờ có được một lõi CPU trước khi bắt đầu chạy.

Trong các trường hợp mà một *time-sharing* hay *preemptive scheduler* được áp dụng, nếu tác vụ không thể hoàn tất logic của mình trong một khoảng thời gian nhất định, thì lõi CPU sẽ bị task scheduler cưỡng chế lấy lại và tác vụ đi vào hàng đợi lần nữa, giống như trong kịch bản bốt điện thoại.

Trong trường hợp này, tác vụ nên chờ trong hàng đợi cho đến khi nó có được lõi CPU một lần nữa, và sau đó nó có thể tiếp tục chạy. Nếu nó không thể hoàn tất logic của mình trong vòng thứ hai, quá trình tương tự tiếp diễn cho đến khi nó có thể hoàn tất.

Mỗi lần một preemptive scheduler dừng một process giữa chừng khi đang chạy và đưa một process khác vào trạng thái đang chạy, người ta nói rằng một *context switch* đã xảy ra. Các context switch càng nhanh, người dùng càng cảm thấy như thể các tác vụ đang được chạy song song. Thú vị là, hầu hết các hệ điều hành ngày nay dùng một preemptive scheduler, điều sẽ là trọng tâm chính của chúng ta trong phần còn lại của chương này.

> Từ giờ trở đi, mọi scheduler đều được giả định là preemptive. Tôi sẽ nêu rõ trong những trường hợp không phải như vậy.

Khi một tác vụ đang chạy, nó có thể trải qua hàng trăm hay thậm chí hàng nghìn context switch trước khi kết thúc. Tuy nhiên, context switch có một đặc điểm rất kỳ lạ và độc nhất – chúng không thể *dự đoán* được. Nói cách khác, chúng ta không thể dự đoán khi nào, hay thậm chí tại instruction nào, một context switch sẽ xảy ra. Ngay cả trong hai lần chạy liên tiếp rất gần nhau của một chương trình trên cùng một nền tảng, các context switch sẽ xảy ra khác nhau.

Tầm quan trọng <a id="_idIndexMarker897"></a>của điều này, và tác động của nó, không thể bị cường điệu hóa; context switch không thể dự đoán được! Ngay sau đây, thông qua các ví dụ được đưa ra, bạn sẽ tự mình quan sát thấy các hệ quả của điều này.

Context switch cực kỳ không thể dự đoán, đến mức cách tốt nhất để đối phó với sự bất định này là giả định rằng xác suất có một context switch tại một instruction cụ thể là như nhau đối với mọi instruction. Nói cách khác, bạn nên kỳ vọng rằng mọi instruction đều có thể trải qua một context switch trong bất kỳ lần chạy nào. Điều này đơn giản có nghĩa là bạn có thể có những khoảng trống giữa việc thực thi bất kỳ hai instruction kề nhau nào.

Với những điều đã nói, giờ hãy tiếp tục và xem xét những điều chắc chắn duy nhất thực sự tồn tại trong một môi trường concurrent.

<a id="_idParaDest-187"></a>

## Ràng buộc Happens-before

Chúng ta đã xác lập trong phần trước rằng context switch không thể dự đoán được; có sự bất định về thời điểm chúng có khả năng xảy ra trong các chương trình của chúng ta. Bất chấp điều đó, có <a id="_idIndexMarker898"></a>sự chắc chắn về các instruction đang được thực thi một cách concurrent.

Hãy tiếp tục với một ví dụ đơn giản. Để bắt đầu, chúng ta sẽ làm việc trên cơ sở rằng chúng ta có một tác vụ giống như tác vụ bạn thấy tiếp theo trong *Code Box 13-1*, có năm instruction. Lưu ý rằng những instruction này là trừu tượng, và chúng không biểu diễn bất kỳ instruction thật nào như C hay machine instruction:

```
Task P {
    1. num = 5
    2. num++
    3. num = num – 2
    4. x = 10
    5. num = num + x
}
```

*Code Box 13-1: Một tác vụ đơn giản với 5 instruction*

Như bạn có thể thấy, các instruction có thứ tự, nghĩa là chúng *phải* được thực thi theo đúng thứ tự đã chỉ định để thỏa mãn mục đích của tác vụ. Chúng ta chắc chắn về điều này. Về mặt kỹ thuật, chúng ta nói rằng chúng ta có một *happens-before constraint* (ràng buộc xảy-ra-trước) giữa mọi hai instruction kề nhau. Instruction `num++` phải xảy ra trước `num = num - 2` và ràng buộc này phải luôn được thỏa mãn bất kể các context switch đang xảy ra như thế nào.

Lưu ý rằng chúng ta vẫn có sự bất định về khi nào các context switch sẽ xảy ra; điều then chốt cần nhớ là chúng có thể xảy ra ở bất cứ đâu giữa các instruction.

Ở đây, chúng tôi sẽ trình bày hai lần thực thi khả dĩ của tác vụ trên, với các context switch khác nhau:

```
Run 1:
  1. num = 5
  2. num++
>>>>> Context Switch <<<<<
  3. num = num – 2
  4. x = 10
>>>>> Context Switch <<<<<
  5. num = num + x
```

*Code Box 13-2: Một lần chạy khả dĩ của tác vụ trên cùng với các context switch*

Và đối với lần chạy thứ hai, nó được thực thi như sau:

```
Run 2:
  num = 5
  >> Context Switch <<
  num++
  num = num – 2
  >> Context Switch <<
  x = 10
  >> Context Switch <<
  num = num + x
```

*Code Box 13-3: Một lần chạy khả dĩ khác cùng với các context switch*

Như bạn có thể thấy trong *Code Box 13-2*, số lượng context switch và những chỗ chúng xảy ra đều có thể thay đổi trong mỗi lần chạy. Tuy nhiên, như chúng tôi đã nói trước đây, có những ràng buộc happens-before nhất định cần được tuân theo.

Đây là lý do chúng ta có thể có một hành vi tổng thể tất định cho một tác vụ cụ thể. Bất kể các context switch xảy ra như thế nào trong các lần chạy khác nhau, *overall state* (trạng thái tổng thể) của một tác vụ vẫn như nhau. Với overall state của một tác vụ, chúng tôi muốn nói tập các biến và các giá trị <a id="_idIndexMarker900"></a>tương ứng của chúng sau khi thực thi instruction cuối cùng trong tác vụ. Ví dụ, với tác vụ trên, chúng ta luôn có state cuối cùng, bao gồm biến `num` với giá trị `14`, và biến `x` với giá trị `10`, bất kể các context switch.

Bằng việc biết rằng overall state của một tác vụ đơn lẻ không thay đổi trong các lần chạy khác nhau, chúng ta có thể bị cám dỗ kết luận rằng do phải tuân theo thứ tự thực thi và các ràng buộc happens-before, concurrency không thể ảnh hưởng đến overall state của một tác vụ. Tuy nhiên, chúng ta nên cẩn thận về kết luận này.

Hãy giả định rằng chúng ta có một hệ thống các tác vụ concurrent, tất cả đều có quyền đọc/ghi trên một *shared resource* (tài nguyên dùng chung), chẳng hạn một biến. Nếu mọi tác vụ chỉ đọc biến dùng chung và không tác vụ nào sẽ ghi vào nó (thay đổi giá trị của nó), chúng ta có thể nói rằng bất kể các context switch đang xảy ra như thế nào, và bất kể bạn chạy các tác vụ bao nhiêu lần, chúng ta luôn có cùng kết quả. Lưu ý rằng điều này cũng đúng với một hệ thống các tác vụ concurrent hoàn toàn không có biến dùng chung nào.

Tuy nhiên, nếu chỉ một trong các tác vụ sẽ ghi vào biến dùng chung, thì các context switch do đơn vị task scheduler áp đặt sẽ ảnh hưởng đến overall state của mọi tác vụ. Điều này có nghĩa là nó có thể khác nhau từ lần chạy này sang lần chạy khác! Do đó, một cơ chế kiểm soát phù hợp nên được dùng để tránh bất kỳ kết quả không mong muốn nào. Tất cả điều này là do thực tế rằng context switch không thể dự đoán được, và các *intermediate state* (trạng thái trung gian) của các tác vụ có thể khác nhau từ lần chạy này sang lần chạy khác. Một intermediate state, trái ngược với overall state, là một tập các biến cùng với giá trị của chúng tại một instruction nhất định. Mỗi tác vụ chỉ có một overall state được xác định khi nó kết thúc, nhưng nó có vô số intermediate state tương ứng với các biến và giá trị của chúng sau khi thực thi một instruction nhất định.

Tóm lại, khi bạn có một hệ thống concurrent chứa một số tác vụ với một tài nguyên dùng chung có thể được ghi bởi bất kỳ tác vụ nào trong số đó, thì các lần chạy khác nhau của hệ thống sẽ cho ra các kết quả khác nhau. Do đó, các phương pháp *synchronization* phù hợp nên được dùng để triệt tiêu <a id="_idIndexMarker901"></a>ảnh hưởng của các context switch và có được cùng các kết quả tất định trong các lần chạy khác nhau.

Giờ chúng ta đã có một số khái niệm cơ bản của concurrency, vốn là chủ đề chủ đạo của chương này. Các khái niệm được giải thích trong phần này là nền tảng cho việc hiểu nhiều chủ đề, và bạn sẽ nghe chúng lặp đi lặp lại trong các phần và chương sau của cuốn sách này.

Bạn sẽ nhớ rằng chúng tôi cũng đã nói concurrency có thể gây vấn đề và đến lượt nó, nó có thể làm mọi thứ phức tạp hơn với chúng ta. Vậy, bạn có thể đang hỏi, khi nào chúng ta cần nó? Trong phần tiếp theo của chương này, chúng tôi sẽ trả lời câu hỏi đó.

<a id="_idParaDest-188"></a>

## Khi nào dùng concurrency

Dựa trên các <a id="_idIndexMarker902"></a>giải thích được đưa ra cho đến giờ, có vẻ như việc chỉ có một tác vụ ít gây vấn đề hơn việc có nhiều tác vụ làm cùng một việc một cách concurrent. Điều này khá đúng; nếu bạn có thể viết một chương trình chạy chấp nhận được mà không cần đưa concurrency vào, rất khuyến khích bạn làm như vậy. Có một số mẫu chung mà chúng ta có thể dùng để biết khi nào chúng ta phải dùng concurrency.

Trong phần này, chúng ta sẽ đi qua những mẫu chung này là gì, và chúng dẫn chúng ta tới việc chia một chương trình thành các luồng concurrent như thế nào.

Một chương trình, bất kể ngôn ngữ lập trình được dùng, đơn giản là một tập instruction cần được thực thi theo trình tự. Nói cách khác, một instruction cho trước sẽ không được thực thi cho đến khi instruction trước đó đã được thực thi. Chúng ta gọi khái niệm này là *sequential execution* (thực thi tuần tự). Không quan trọng instruction hiện tại mất bao lâu để kết thúc; instruction tiếp theo phải chờ cho đến khi instruction hiện tại đã hoàn tất. Người ta thường nói rằng instruction hiện tại đang *block* (chặn) instruction tiếp theo; điều này đôi khi được mô tả là instruction hiện tại là một *blocking instruction*.

Trong mọi chương trình, mọi instruction đều là blocking, và luồng thực thi là tuần tự trong mỗi luồng thực thi. Chúng ta chỉ có thể nói một chương trình đang chạy nhanh nếu mỗi instruction chặn instruction tiếp theo trong một khoảng thời gian tương đối ngắn, cỡ vài mili giây. Tuy nhiên, điều gì xảy ra nếu một blocking instruction mất quá nhiều thời gian (ví dụ 2 giây hay 2000 mili giây), hoặc thời gian mà nó mất không thể xác định được? Đây là hai mẫu cho chúng ta biết rằng chúng ta cần có một chương trình concurrent.

Để giải thích thêm, mọi blocking instruction đều tiêu tốn một khoảng thời gian khi cố gắng hoàn tất. Với chúng ta, kịch bản tốt nhất là một instruction cho trước mất một khoảng thời gian tương đối ngắn để hoàn tất và sau đó, instruction tiếp theo có thể được thực thi ngay lập tức. Tuy nhiên, không phải lúc nào chúng ta cũng may mắn như vậy.

Có những kịch bản nhất định mà chúng ta không thể xác định thời gian một blocking instruction mất để hoàn tất. Điều này thường xảy ra khi một blocking instruction đang chờ hoặc một sự kiện nhất định xảy ra, hoặc một số dữ liệu trở nên sẵn có.

Hãy tiếp tục <a id="_idIndexMarker903"></a>với một ví dụ. Giả sử rằng chúng ta có một chương trình server đang phục vụ một số chương trình client. Có một instruction trong chương trình server chờ một chương trình client kết nối. Từ góc nhìn của chương trình server, không ai có thể nói chắc khi nào một client mới sắp kết nối. Do đó, instruction tiếp theo không thể được thực thi ở phía server vì chúng ta không biết khi nào chúng ta sẽ xong với instruction hiện tại. Nó hoàn toàn phụ thuộc vào thời điểm mà một client mới cố kết nối.

Một ví dụ đơn giản hơn là khi bạn đọc một chuỗi từ người dùng. Từ góc nhìn của chương trình, không ai có thể nói chắc khi nào người dùng sẽ nhập input của họ; do đó, các instruction tương lai không thể được thực thi. Đây là *mẫu thứ nhất* dẫn đến một hệ thống các tác vụ concurrent.

Vậy thì, mẫu thứ nhất cho concurrency là khi bạn có một instruction có thể chặn luồng thực thi trong một khoảng thời gian không xác định. Ở điểm này, bạn nên chia luồng hiện có thành hai luồng hay tác vụ riêng biệt. Bạn sẽ làm điều này nếu bạn cần có các instruction sau được thực thi, và bạn không thể chờ instruction hiện tại hoàn tất trước. Quan trọng hơn đối với kịch bản này, chúng ta giả định rằng các instruction sau không phụ thuộc vào kết quả của việc các instruction hiện tại hoàn tất.

Bằng việc chia luồng trên thành hai tác vụ concurrent, trong khi một trong các tác vụ đang chờ blocking instruction hoàn tất, tác vụ kia có thể tiếp tục và thực thi những instruction đã bị chặn trong thiết lập non-concurrent trước đó.

Ví dụ sau mà chúng ta sẽ tập trung vào trong phần này cho thấy mẫu thứ nhất có thể dẫn đến một hệ thống các tác vụ concurrent như thế nào. Chúng ta sẽ dùng pseudo-code để biểu diễn các instruction trong mỗi tác vụ.

> **Lưu ý**:
>
> Không cần kiến thức trước về mạng máy tính để hiểu ví dụ sắp tới.

Ví dụ chúng ta sẽ tập trung vào là về một chương trình server có ba mục tiêu:

- Nó tính <a id="_idIndexMarker904"></a>tổng của hai số đọc từ một client và trả kết quả về cho client.
- Nó ghi số client đã được phục vụ vào một file một cách định kỳ, bất kể có client nào đang được phục vụ hay không.
- Nó cũng phải có khả năng phục vụ nhiều client cùng lúc.

Trước khi nói <a id="_idIndexMarker905"></a>về hệ thống concurrent cuối cùng thỏa mãn các mục tiêu trên, trước tiên hãy giả sử rằng trong ví dụ này chúng ta sẽ chỉ dùng một tác vụ (hay luồng) và sau đó chúng tôi sẽ cho thấy rằng một tác vụ duy nhất không thể đạt được các mục tiêu trên. Bạn có thể thấy pseudo-code cho chương trình server, trong một thiết lập single-task, trong *Code Box 13-4*:

```
Calculator Server {
    Task T1 {
        1. N = 0
        2. Prepare Server
        3. Do Forever {
        4.     Wait for a client C
        5.     N = N + 1
        6.     Read the first number from C and store it in X
        7.     Read the second number from C and store it in Y
        8.     Z = X + Y
        9.     Write Z to C
       10.     Close the connection to C
       11.     Write N to file
           }
    }
}
```

*Code Box 13-4: Một chương trình server hoạt động bằng một tác vụ duy nhất*

Như bạn có thể thấy, luồng duy nhất của chúng ta chờ một client trên mạng kết nối. Sau đó nó đọc hai số từ client, rồi tính tổng của chúng và trả nó về cho client. Cuối cùng, nó đóng kết nối client và ghi số client đã được phục vụ vào một file trước khi tiếp tục chờ client tiếp theo tham gia. Ngay sau đây, chúng tôi sẽ cho thấy rằng code trên không thể thỏa mãn các mục tiêu đã nêu của chúng ta.

Đoạn pseudo-code này chỉ chứa một tác vụ, `T1`. Nó có 12 dòng instruction, và như chúng tôi đã nói trước đây, chúng được thực thi tuần tự, và mọi instruction đều là blocking. Vậy, chính xác thì code này đang cho chúng ta thấy điều gì? Hãy đi qua nó:

- Instruction thứ nhất, `N = 0`, đơn giản và kết thúc rất nhanh.
- Instruction thứ hai, `Prepare Server`, được kỳ vọng kết thúc trong một khoảng thời gian hợp lý để nó sẽ không chặn việc thực thi của chương trình server.
- Instruction thứ ba chỉ là bắt đầu vòng lặp chính và nó nên kết thúc nhanh khi chúng ta tiến vào bên trong vòng lặp.
- Lệnh thứ tư, `Wait for a client C`, là một blocking instruction với thời gian hoàn tất không xác định. Do đó, các lệnh *5*, *6*, và phần còn lại sẽ không được thực thi. Vì vậy, có vẻ như chúng phải chờ một client mới tham gia, và chỉ sau đó, những instruction này mới có thể được thực thi.

Như chúng tôi đã nói trước đây, việc để các instruction *5* đến *10* chờ một client mới là bắt buộc. Nói cách khác, những instruction đó phụ thuộc vào output của instruction *4* và chúng không thể được thực thi <a id="_idIndexMarker906"></a>mà không có một client được chấp nhận. Tuy nhiên, instruction *11*, `Write N to file`, cần được thực thi bất kể có client hay không. Điều này được quy định bởi mục tiêu thứ hai mà chúng ta đã định nghĩa cho ví dụ này. Với cấu hình trên, chúng ta chỉ ghi `N` vào file nếu chúng ta có một client, mặc dù điều này đi ngược lại yêu cầu ban đầu của chúng ta, đó là, chúng ta ghi `N` vào file *bất kể* chúng ta có client hay không.

Code trên có một vấn đề khác trong luồng instruction của nó; cả hai instruction *6* và *7* đều có khả năng chặn luồng thực thi. Những instruction này chờ client nhập hai số, và vì việc này tùy thuộc vào client, chúng ta không thể dự đoán chính xác khi nào những instruction này sẽ kết thúc. Điều này ngăn chương trình tiếp tục thực thi.

Hơn thế nữa, những instruction này có khả năng chặn chương trình chấp nhận các client mới. Đó là vì luồng thực thi sẽ không đến được lệnh *4* lần nữa, nếu các lệnh *6* và *7* sẽ mất nhiều thời gian để hoàn tất. Do đó, chương trình server không thể phục vụ nhiều client cùng lúc, điều này một lần nữa không phù hợp với các mục tiêu đã định nghĩa của chúng ta.

Để giải quyết các vấn đề đã nêu, chúng ta cần chia tác vụ duy nhất của mình thành ba tác vụ concurrent mà cùng nhau sẽ thỏa mãn các yêu cầu của chúng ta cho chương trình server.

Trong pseudo-code sau trong *Code Box 13-5*, bạn sẽ tìm thấy ba luồng thực thi, `T1`, `T2` và `T3`, thỏa mãn các mục tiêu đã định nghĩa của chúng ta dựa trên một giải pháp concurrent:

```
Calculator Server {
    Shared Variable: N
    Task T1 {
        1. N = 0
        2. Prepare Server
        3. Spawn task T2
        4. Do Forever {
        5.     Write N to file
        6.     Wait for 30 seconds
           }
    }
    Task T2 {
        1. Do Forever {
        2.     Wait for a client C
        3.     N = N + 1
        4.     Spawn task T3 for C
           }
    }
    Task T3 {
        1. Read first number from C and store it in X
        2. Read first number from C and store it in Y
        3. Z = X + Y
        4. Write Z to C
        5. Close the connection to C
    }
}
```

*Code Box 13-5: Một chương trình server hoạt động bằng ba tác vụ concurrent*

Chương trình bắt đầu bằng việc thực thi tác vụ `T1`. `T1` được gọi là tác vụ chính của chương trình vì nó là tác vụ đầu tiên sẽ được thực thi. Hãy lưu ý rằng mỗi chương trình có ít nhất một <a id="_idIndexMarker907"></a>tác vụ và rằng mọi tác vụ khác đều được khởi tạo bởi tác vụ này, trực tiếp hoặc gián tiếp.

Trong code box trên, chúng ta có hai tác vụ khác được sinh ra bởi tác vụ chính, `T1`. Cũng có một biến dùng chung, `N`, lưu số client đã được phục vụ và có thể được truy cập (đọc hay ghi) bởi mọi tác vụ.

Chương trình bắt đầu với instruction đầu tiên trong tác vụ `T1`; qua đó, nó khởi tạo biến `N` bằng không. Sau đó instruction thứ hai chuẩn bị server. Trong instruction này, một số bước sơ bộ nên được thực hiện để chương trình server có thể chấp nhận các kết nối đến. Lưu ý rằng cho đến giờ chưa có tác vụ concurrent nào khác chạy bên cạnh tác vụ `T1`.

Instruction thứ ba trong tác vụ `T1` tạo một *instance* mới của tác vụ `T2`. Việc tạo một tác vụ mới thường nhanh và hầu như không mất thời gian. Do đó, tác vụ `T1` đi vào vòng lặp vô hạn ngay sau khi tạo tác vụ `T2`, nơi nó tiếp tục ghi giá trị của biến dùng chung `N` vào một file mỗi 30 giây. Đây là mục tiêu đầu tiên của chúng ta được định nghĩa cho chương trình server giờ đã được thỏa mãn. Dựa vào đó, mà không có bất kỳ sự gián đoạn hay chặn nào từ các instruction khác, tác vụ `T1` ghi giá trị của `N` vào một file một cách định kỳ, cho đến khi chương trình kết thúc.

Hãy nói về <a id="_idIndexMarker908"></a>tác vụ được sinh ra. Trách nhiệm duy nhất của tác vụ `T2` là chấp nhận các client đến ngay khi chúng gửi yêu cầu kết nối. Cũng đáng nhớ rằng mọi instruction trong tác vụ `T2` đều được chạy bên trong một vòng lặp vô hạn. Lệnh thứ hai trong tác vụ `T2` chờ một client mới. Ở đây, nó chặn các instruction khác trong tác vụ `T2` thực thi, nhưng điều này chỉ áp dụng cho các instruction trong tác vụ `T2`. Lưu ý rằng nếu chúng ta đã sinh ra hai instance của tác vụ `T2` thay vì một, việc có các instruction bị chặn trong một instance sẽ không chặn các instruction trong instance kia.

Các tác vụ concurrent khác, trong trường hợp này chỉ có `T1`, tiếp tục thực thi các instruction của chúng mà không bị chặn. Đây là những gì concurrency cho phép; trong khi một số tác vụ bị chặn vì một sự kiện nhất định, các tác vụ khác có thể tiếp tục công việc của chúng mà không bị gián đoạn. Như chúng tôi đã nói trước đây, điều này có một nguyên tắc thiết kế quan trọng ở cốt lõi: *Bất cứ khi nào bạn có một thao tác blocking mà hoặc thời gian kết thúc của nó không xác định, hoặc nó mất nhiều thời gian để hoàn tất, thì bạn nên chia tác vụ thành hai tác vụ concurrent*.

Giờ, giả sử rằng một client mới tham gia. Chúng ta đã thấy trong *Code Box 13-4*, trong phiên bản non-concurrent của chương trình server, rằng các thao tác đọc có thể chặn việc chấp nhận các client mới. Dựa trên nguyên tắc thiết kế mà chúng tôi vừa chỉ ra, vì các instruction đọc là blocking, chúng ta cần chia logic thành hai tác vụ concurrent, đó là lý do tại sao chúng ta đã đưa vào tác vụ `T3`.

Bất cứ khi nào một client mới tham gia, tác vụ `T2` sinh ra một instance mới của tác vụ `T3` để giao tiếp với client mới tham gia. Việc này được thực hiện bởi instruction *4* trong tác vụ `T2`, để nhắc bạn, đó là lệnh sau:

```
4.     Spawn task T3 for C
```

*Code Box 13-6: Instruction 4 trong tác vụ T2*

Điều quan trọng cần lưu ý là trước khi sinh ra một tác vụ mới, tác vụ `T2` tăng giá trị của biến dùng chung `N` như một dấu hiệu cho việc có một client mới được phục vụ. Một lần nữa, một instruction spawn khá nhanh và không chặn việc chấp nhận các client mới.

Trong tác vụ `T2`, khi instruction *4* kết thúc, vòng lặp tiếp tục, và nó quay lại instruction *2*, vốn chờ một client khác tham gia. Lưu ý rằng dựa trên pseudo-code mà chúng ta có, trong khi chúng ta chỉ có một instance của tác vụ `T1` và một instance của tác vụ `T2`, chúng ta có thể có nhiều instance của `T3` cho mỗi client.

Trách nhiệm duy nhất của tác vụ `T3` là giao tiếp với client và đọc các số input. Sau đó nó tiếp tục bằng việc tính tổng và gửi nó về cho client. Như đã chỉ ra trước đây, các blocking instruction bên trong tác vụ `T3` không thể chặn việc thực thi của các tác vụ khác, và hành vi blocking của nó bị giới hạn trong cùng instance của `T3`. Ngay cả các blocking instruction trong một instance cụ thể của `T3` cũng không thể chặn các instruction trong một instance khác của `T3`. Bằng cách này, chương trình server có thể thỏa mãn mọi mục tiêu mong muốn của chúng ta theo một cách concurrent.

Vậy, câu hỏi tiếp theo <a id="_idIndexMarker909"></a>có thể là, khi nào các tác vụ kết thúc? Chúng ta biết rằng nói chung, khi mọi instruction trong một tác vụ đã được thực thi, tác vụ kết thúc. Như đã nói, khi chúng ta có một vòng lặp vô hạn bao bọc mọi instruction bên trong một tác vụ, tác vụ sẽ không kết thúc, và vòng đời của nó phụ thuộc vào *parent task* (tác vụ cha) đã sinh ra nó. Chúng ta sẽ thảo luận cụ thể điều này đối với process và thread trong các chương sau. Vì mục đích của ví dụ, trong chương trình concurrent trên, tác vụ cha của mọi instance của `T3` là instance duy nhất của tác vụ `T2`. Như bạn có thể thấy, một instance cụ thể của tác vụ `T3` kết thúc hoặc khi nó đóng kết nối tới client sau khi đi qua hai instruction đọc blocking hoặc khi instance duy nhất của tác vụ `T2` kết thúc.

Trong một kịch bản hiếm nhưng khả dĩ, nếu mọi thao tác đọc mất quá nhiều thời gian để hoàn tất (và điều này có thể là cố ý hoặc vô tình), và số lượng client đến tăng nhanh, thì sẽ có một thời điểm mà chúng ta có quá nhiều instance của tác vụ `T3` đang chạy và tất cả chúng đều đang chờ client của mình cung cấp các số input. Tình huống này sẽ dẫn đến việc tiêu thụ một lượng tài nguyên đáng kể. Sau đó, sau một thời gian, với việc có ngày càng nhiều kết nối đến, hoặc chương trình server sẽ bị hệ điều hành kết thúc, hoặc nó đơn giản là không thể phục vụ thêm client nào.

Dù điều gì xảy ra trong trường hợp trên, chương trình server ngừng phục vụ các client. Khi điều này xảy ra, nó được gọi là một **denial of service** (**DoS**). Các hệ thống với các tác vụ concurrent nên được thiết kế theo cách vượt qua những tình huống cực đoan này vốn ngăn chúng phục vụ client một cách hợp lý.

> **Lưu ý**:
>
> Khi bị tấn công DoS, sự tắc nghẽn tài nguyên trên một máy server xảy ra nhằm hạ gục nó và làm nó non-responsive (không phản hồi). Các cuộc tấn công DoS thuộc về một nhóm các cuộc tấn công mạng cố gắng chặn một dịch vụ nhất định để làm nó không khả dụng với các client của nó. Chúng bao gồm một phạm vi rộng các cuộc tấn công, bao gồm cả *exploit*, với ý định làm ngừng một dịch vụ. Điều này thậm chí có thể bao gồm việc *flooding* (làm ngập) một mạng để hạ gục hạ tầng mạng.

Trong ví dụ trên về chương trình server, chúng tôi đã mô tả một tình huống trong đó chúng ta có một blocking instruction mà thời gian hoàn tất của nó không thể xác định được, và đây là mẫu thứ nhất cho việc dùng concurrency. Có một mẫu khác tương tự điều này, nhưng hơi khác.

Nếu một instruction <a id="_idIndexMarker910"></a>hay một nhóm instruction mất quá nhiều thời gian để hoàn tất, thì chúng ta có thể đặt chúng vào một tác vụ riêng và chạy tác vụ mới concurrent với tác vụ chính. Điều này khác với mẫu thứ nhất vì, trong khi chúng ta có một ước tính về thời gian hoàn tất, dù không chính xác lắm, chúng ta biết rằng nó sẽ không sớm xong.

Điều cuối cùng cần lưu ý về ví dụ trên, liên quan đến biến dùng chung `N`, là một trong các tác vụ, cụ thể là instance của tác vụ `T2`, có thể thay đổi giá trị của nó. Dựa trên các thảo luận trước đây của chúng ta trong chương này, hệ thống các tác vụ concurrent này do đó dễ gặp các vấn đề concurrency vì nó có một biến dùng chung có thể bị sửa đổi bởi một trong các tác vụ.

Điều quan trọng cần lưu ý là giải pháp chúng tôi đề xuất cho chương trình server còn xa mới hoàn hảo. Trong chương tiếp theo, bạn sẽ được giới thiệu các vấn đề concurrency, và qua đó bạn sẽ thấy rằng ví dụ trên mắc phải một vấn đề *data race* nghiêm trọng trên biến dùng chung `N`. Kết quả là, các cơ chế kiểm soát phù hợp nên được dùng để giải quyết các vấn đề do concurrency tạo ra.

Trong phần sau và cũng là phần cuối cùng trong chương này, chúng ta sẽ nói về các *state* được chia sẻ giữa một số tác vụ concurrent. Chúng tôi cũng sẽ giới thiệu khái niệm *interleaving* và các hệ quả quan trọng của nó đối với một hệ thống concurrent với một shared state có thể sửa đổi.

<a id="_idParaDest-189"></a>

## Shared state

Trong phần trước, chúng ta đã nói về các mẫu gợi ý rằng chúng ta cần một hệ thống tác vụ concurrent. Trước đó, chúng tôi cũng đã giải thích ngắn gọn cách sự bất định trong mẫu <a id="_idIndexMarker911"></a>context switch trong quá trình thực thi một số tác vụ concurrent, cùng với việc có một shared state có thể sửa đổi, có thể dẫn đến non-determinism (tính không tất định) xảy ra trong overall state của mọi tác vụ. Phần này đưa ra một ví dụ để minh họa non-determinism này có thể gây vấn đề như thế nào trong một chương trình đơn giản.

Trong phần này, chúng ta sẽ tiếp tục thảo luận và đưa vào *shared state* để xem chúng góp phần vào non-determinism mà chúng ta đã nói đến như thế nào. Là một lập trình viên, thuật ngữ *state* hẳn nhắc bạn về một tập biến và các giá trị tương ứng của chúng tại một thời điểm cụ thể. Do đó, khi chúng ta nói về *overall state* của một tác vụ, như chúng ta đã định nghĩa nó trong phần đầu tiên, chúng ta đang chỉ tập mọi biến non-shared hiện có, cùng với các giá trị tương ứng của chúng, tại chính xác thời điểm khi instruction cuối cùng của tác vụ đã được thực thi.

Tương tự, một *intermediate state* của một tác vụ là tập mọi biến non-shared hiện có, cùng với giá trị của chúng khi tác vụ đã thực thi một instruction nhất định. Do đó, một tác vụ có một intermediate state khác nhau cho mỗi instruction của nó, và số lượng intermediate state bằng số lượng instruction. Theo các định nghĩa của chúng ta, intermediate state cuối cùng giống với overall state của tác vụ.

Một shared state <a id="_idIndexMarker912"></a>cũng là một tập biến cùng với các giá trị tương ứng của chúng tại một thời điểm cụ thể có thể được đọc hay sửa đổi bởi một hệ thống các tác vụ concurrent. Một shared state không thuộc sở hữu của một tác vụ (nó không local đối với một tác vụ), và nó có thể được đọc hay sửa đổi bởi bất kỳ tác vụ nào đang chạy trong hệ thống, và dĩ nhiên vào bất kỳ lúc nào.

Nói chung, chúng ta không quan tâm đến các shared state read-only. Chúng thường an toàn để được đọc bởi nhiều tác vụ concurrent, và chúng không gây ra vấn đề nào. Tuy nhiên, một shared state có thể sửa đổi thường gây ra một số vấn đề nghiêm trọng nếu nó không được bảo vệ cẩn thận. Do đó, mọi shared state được trình bày trong phần này đều được coi là có thể bị sửa đổi bởi ít nhất một trong các tác vụ.

Hãy tự hỏi câu hỏi này: điều gì có thể sai nếu một shared state bị sửa đổi bởi một trong các tác vụ concurrent trong một hệ thống? Để trả lời điều này, chúng ta bắt đầu bằng việc đưa ra một ví dụ về một hệ thống gồm hai tác vụ concurrent truy cập một biến dùng chung duy nhất, mà trong trường hợp này là một biến số nguyên đơn giản.

Hãy giả sử rằng chúng ta có hệ thống sau như được hiển thị trong *Code Box 13-7*:

```
Concurrent System {
    Shared State {
        X : Integer = 0
    }

    Task P {
        A : Integer
            1. A = X
            2. A = A + 1
            3. X = A
            4. print X
    }
    Task Q {
        B : Integer
            1. B = X
            2. B = B + 2
            3. X = B
            4. print X
    }
}
```

*Code Box 13-7: Một hệ thống gồm hai tác vụ concurrent với một shared state có thể sửa đổi*

Giả sử rằng trong hệ thống trên, các tác vụ `P` và `Q` không được chạy concurrent. Do đó, chúng được thực thi tuần tự. Giả sử rằng các instruction trong `P` được thực thi trước, trước `Q`. Nếu đó là trường hợp, thì overall state của toàn bộ hệ thống, bất kể overall state của bất kỳ tác vụ riêng lẻ nào, sẽ là biến dùng chung `X` với giá trị 3.

Nếu bạn chạy <a id="_idIndexMarker913"></a>hệ thống theo thứ tự ngược lại, trước tiên là các instruction trong `Q` và sau đó là các instruction trong `P`, bạn sẽ có cùng overall state. Tuy nhiên, điều này thường không phải là trường hợp và việc chạy hai tác vụ khác nhau theo thứ tự đảo ngược có lẽ dẫn đến một overall state khác.

Như bạn có thể thấy, việc chạy những tác vụ này một cách tuần tự tạo ra một kết quả tất định mà không cần lo lắng về context switch.

Giờ, giả sử rằng chúng được chạy concurrent trên cùng một lõi CPU. Có nhiều kịch bản khả dĩ cho việc đưa các instruction của `P` và `Q` vào thực thi khi xem xét các context switch khác nhau xảy ra tại các instruction khác nhau.

Sau đây là một kịch bản khả dĩ:

```
     Task P     |    Task Scheduler   |    Task Q
----------------------------------------------------
                |    Context Switch   |
                |                     |  B = X
                |                     |  B = B + 2
                |    Context Switch   |
  A = X         |                     |
                |    Context Switch   |
                |                     |  X = B
                |    Context Switch   |
  A = A + 1     |                     |
  X = A         |                     |
                |    Context Switch   |
                |                     |  print X
                |    Context Switch   |
  print X       |                     |
                |    Context Switch   |
```

*Code Box 13-8: Một interleaving khả dĩ của các tác vụ P và Q khi chạy concurrent*

Kịch bản này chỉ là một trong nhiều kịch bản khả dĩ với các context switch xảy ra tại những chỗ nhất định. Mỗi kịch bản được gọi là một *interleaving* (sự đan xen). Vì vậy, đối với một hệ thống các tác vụ concurrent, có một số interleaving khả dĩ dựa trên những chỗ khác nhau mà context switch có thể xảy ra, và trong mỗi lần chạy chỉ một trong nhiều interleaving này sẽ xảy ra. Kết quả là, điều này khiến chúng không thể dự đoán được.

Đối với interleaving trên, như bạn có thể thấy trong cột đầu tiên và cột cuối cùng, thứ tự của các instruction và các ràng buộc happens-before được bảo toàn, nhưng có thể có những *khoảng trống* giữa các lần thực thi. Những khoảng trống này không thể dự đoán được, và khi chúng ta lần theo việc thực thi, interleaving trên dẫn đến một kết quả bất ngờ. Process `P` in ra giá trị `1` và process `Q` in ra giá trị `2`, trong khi người ta kỳ vọng rằng cả hai sẽ in ra `3` làm kết quả cuối cùng.

Lưu ý rằng trong <a id="_idIndexMarker914"></a>ví dụ trên, ràng buộc để chấp nhận kết quả cuối cùng đã được định nghĩa như sau – chương trình nên in ra hai số `3` trong output. Ràng buộc này có thể là một thứ khác, và độc lập với output nhìn thấy được của chương trình. Hơn thế nữa, tồn tại những ràng buộc then chốt khác nên giữ *bất biến* (invariant) khi đối mặt với các context switch không thể dự đoán. Những ràng buộc này có thể bao gồm việc không có bất kỳ *data race* hay *race condition* nào, hoàn toàn không có memory leak, hay thậm chí không crash. Tất cả những ràng buộc này quan trọng hơn nhiều so với output nhìn thấy được của chương trình. Trong nhiều ứng dụng thực tế, một chương trình thậm chí không có output nào cả.

Sau đây trong *Code Box 13-9* là một interleaving khác với một kết quả khác:

```
   Task P    |    Task Scheduler   |    Task Q
-------------------------------------------------
             |    Context Switch   |
             |                     |    B = X
             |                     |    B = B + 2
             |                     |    X = B
             |    Context Switch   |
 A = X       |                     |
 A = A + 1   |                     |
             |    Context Switch   |
             |                     |    print X
             |    Context Switch   |
 X = A       |                     |
 print X     |                     |
             |    Context Switch   |
```

*Code Box 13-9: Một interleaving khả dĩ khác của các tác vụ P và Q khi chạy concurrent*

Trong interleaving này, tác vụ `P` in ra `3`, nhưng tác vụ `Q` in ra `2`. Điều này xảy ra do thực tế rằng tác vụ `P` đã không đủ may mắn để cập nhật giá trị của biến dùng chung `X` trước context switch thứ ba. Do đó, tác vụ `Q` chỉ in ra giá trị của `X`, vốn là `2` vào thời điểm đó. Tình trạng này được gọi là một *data race* trên biến `X`, và chúng tôi giải thích thêm về điều này trong chương sắp tới.

Trong một chương trình C thật, chúng ta thường viết `X++` hay `X = X + 1` thay vì trước tiên sao chép `X` vào `A` rồi tăng `A`, và cuối cùng đặt nó trở lại `X`. Bạn sẽ thấy một ví dụ về điều này trong *Chương 15*, *Thực thi Thread (Thread Execution)*.

Điều này cho thấy rõ rằng một câu lệnh `X++` đơn giản trong C gồm ba instruction nhỏ hơn sẽ không được thực thi trong một time slice duy nhất. Nói cách khác, nó không phải là một *atomic instruction* (instruction nguyên tử), mà nó được tạo nên từ ba atomic instruction nhỏ hơn. Một atomic instruction không thể được chia thành các thao tác nhỏ hơn <a id="_idIndexMarker915"></a>và nó không thể bị gián đoạn bởi context switch. Chúng ta sẽ thấy thêm về điều này trong các chương sau về multithreading.

Có một điều khác cần xem xét về ví dụ trên. Trong ví dụ trên, các tác vụ `P` và `Q` không phải là các tác vụ duy nhất đang chạy trong hệ thống; cũng có các tác vụ khác đang được thực thi concurrent với các tác vụ `P` và `Q` của chúng ta, nhưng chúng ta đã không xét đến chúng trong phân tích của mình, và chúng ta chỉ thảo luận hai tác vụ đó. Tại sao lại như vậy?

Câu trả lời cho câu hỏi này dựa trên thực tế rằng các interleaving khác nhau giữa bất kỳ tác vụ nào trong hai tác vụ này và các tác vụ khác trong hệ thống không thể thay đổi các intermediate state của tác vụ `P` hay `Q`. Nói cách khác, các tác vụ khác không có shared state nào với `P` và `Q`, và như chúng tôi đã giải thích trước đây, khi không có tài nguyên dùng chung nào giữa một số tác vụ, các interleaving sẽ không quan trọng, như chúng ta có thể thấy trong trường hợp này. Do đó, chúng ta có thể giả định rằng không có tác vụ nào khác ngoài `P` và `Q` trong hệ thống giả định của chúng ta.

Ảnh hưởng duy nhất mà các tác vụ khác có lên `P` và `Q` là, nếu có quá nhiều tác vụ như vậy, chúng có thể làm việc thực thi của `P` và `Q` chậm hơn. Đó đơn giản là kết quả của việc có những khoảng trống dài giữa hai instruction liên tiếp trong `P` hay `Q`. Nói cách khác, lõi CPU cần được chia sẻ giữa nhiều tác vụ hơn. Do đó, các tác vụ `P` và `Q` sẽ cần chờ trong hàng đợi thường xuyên hơn bình thường, làm trì hoãn việc thực thi của chúng.

Dùng ví dụ này, bạn đã thấy ngay cả một shared state duy nhất giữa chỉ hai tác vụ concurrent cũng có thể dẫn đến việc thiếu tính tất định trong kết quả tổng thể như thế nào. Chúng tôi đã cho thấy các vấn đề gắn với việc thiếu tính tất định; chúng ta không muốn có một chương trình cho ra một kết quả khác nhau trong mỗi lần chạy. Các tác vụ trong ví dụ của chúng ta tương đối đơn giản, chứa bốn instruction tầm thường, nhưng các ứng dụng concurrent thực sự có mặt trong môi trường production phức tạp hơn thế này nhiều.

Hơn thế nữa, chúng ta có nhiều loại tài nguyên dùng chung khác nhau không nhất thiết nằm trong memory, như file hay các dịch vụ có sẵn trên mạng.

Tương tự, số lượng tác vụ cố truy cập một tài nguyên dùng chung có thể lớn, và do đó chúng ta cần nghiên cứu các vấn đề concurrency theo một nghĩa sâu hơn và tìm các cơ chế để mang lại tính tất định. Trong chương tiếp theo, chúng ta sẽ tiếp tục thảo luận bằng việc nói về các vấn đề concurrency và các giải pháp để khắc phục chúng.

Trước khi kết thúc chương này, hãy nói ngắn gọn về task scheduler và cách nó hoạt động. Nếu chúng ta chỉ có một lõi CPU, thì, tại bất kỳ thời điểm nào, chúng ta chỉ có thể có một tác vụ dùng lõi CPU đó.

Chúng ta cũng biết rằng bản thân task scheduler là một chương trình cần một phần của lõi CPU để được thực thi. Vậy, làm thế nào nó quản lý các tác vụ khác nhau để dùng lõi CPU khi một tác vụ khác đang dùng nó? Hãy giả sử rằng bản thân task scheduler đang dùng lõi CPU. Trước tiên, nó chọn một tác vụ từ hàng đợi của mình trước khi đặt một timer để một *timer interrupt* xảy ra, và sau đó nó rời lõi CPU và trao tài nguyên của mình cho tác vụ được chọn.

Giờ chúng ta đã giả định rằng task scheduler sẽ cho mỗi tác vụ một khoảng thời gian nhất định, có một thời điểm mà interrupt sẽ hành động, và lõi CPU dừng việc thực thi tác vụ hiện tại và ngay lập tức nạp task scheduler trở lại CPU. Giờ, scheduler lưu trạng thái mới nhất của tác vụ trước đó và nạp tác vụ tiếp theo từ hàng đợi. Tất cả những điều này tiếp diễn chừng nào kernel còn đang chạy. Đối với một máy có CPU với nhiều lõi, điều này có thể thay đổi, và kernel có thể dùng các lõi khác nhau trong khi lập lịch các tác vụ cho các lõi khác.

Trong phần này, chúng ta đã đi qua ngắn gọn khái niệm shared state và cách chúng tham gia vào các hệ thống concurrent. Các thảo luận sẽ được tiếp tục trong chương tiếp theo bằng việc nói về các vấn đề concurrency và các kỹ thuật synchronization.

<a id="_idParaDest-190"></a>

## Tóm tắt

Trong chương này, chúng ta đã đi qua những điều cơ bản của concurrency, và các khái niệm và thuật ngữ thiết yếu mà bạn cần biết để hiểu các chủ đề sắp tới về multithreading và multi-processing.

Cụ thể, chúng ta đã thảo luận những điều sau:

- Các định nghĩa về concurrency và parallelism – thực tế rằng mỗi tác vụ parallel cần có đơn vị xử lý riêng, trong khi các tác vụ concurrent có thể chia sẻ một bộ xử lý duy nhất.
- Các tác vụ concurrent dùng một đơn vị xử lý duy nhất trong khi một task scheduler quản lý thời gian xử lý và chia sẻ nó giữa các tác vụ khác nhau. Điều này sẽ dẫn đến một số context switch và các interleaving khác nhau cho mỗi tác vụ.
- Giới thiệu về các blocking instruction. Chúng tôi cũng đã giải thích các mẫu gợi ý khi nào chúng ta cần concurrency, và cách chúng ta có thể chia một tác vụ duy nhất thành hai hay ba tác vụ concurrent.
- Chúng tôi đã mô tả shared state là gì. Chúng tôi cũng đã cho thấy một shared state có thể dẫn đến các vấn đề concurrency nghiêm trọng như data race như thế nào khi nhiều tác vụ cố đọc và ghi cùng một shared state.

Trong chương tiếp theo, chúng ta hoàn tất thảo luận về chủ đề concurrency, và chúng tôi giải thích một số loại vấn đề mà bạn sẽ gặp phải trong một môi trường concurrent. Việc nói về các giải pháp cho các vấn đề concurrency-related cũng sẽ là một phần của các thảo luận trong chương tiếp theo.
