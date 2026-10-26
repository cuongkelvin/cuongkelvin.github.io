<a id="_idParaDest-260"></a>

# Chương 19: Single-Host IPC và Socket

Trong chương trước, chúng ta đã thảo luận các kỹ thuật mà nhờ đó hai process có thể thao tác trên cùng một tài nguyên dùng chung một cách concurrent và theo kiểu được đồng bộ hóa. Trong chương này, chúng ta sẽ mở rộng những kỹ thuật này và giới thiệu một nhóm phương pháp mới cho phép hai process truyền dữ liệu. Những kỹ thuật này, cả những kỹ thuật được giới thiệu trong chương trước lẫn những kỹ thuật chúng ta sẽ thảo luận trong chương này, cùng được gọi <a id="_idIndexMarker1310"></a>là các kỹ thuật **Inter-Process Communication** (**IPC**).

Trong chương này và chương tiếp theo, chúng ta sẽ nói về các kỹ thuật IPC mà, khác với các phương pháp chúng ta đã thảo luận trong chương trước, có liên quan đến một kiểu *message passing* (truyền thông điệp) hay *signaling* (báo hiệu) giữa hai process. Các thông điệp được truyền không được lưu ở bất kỳ nơi dùng chung nào như một file hay một shared memory, thay vào đó chúng được phát ra và nhận bởi các process.

Trong chương này, chúng ta trình bày hai chủ đề chính. Thứ nhất, chúng ta củng cố các kỹ thuật IPC và thảo luận IPC single-host và POSIX API. Thứ hai, chúng ta bắt đầu giới thiệu socket programming và các chủ đề xung quanh. Những chủ đề này bao gồm mạng máy tính, mô hình listener-connector và các trình tự tồn tại để hai process thiết lập một kết nối.

Trong chương này, chúng ta sẽ thảo luận các chủ đề sau:

- Các kỹ thuật IPC khác nhau. Chúng tôi giới thiệu các kỹ thuật IPC push-based và pull-based và trong phần này, chúng tôi định nghĩa các kỹ thuật được thảo luận trong chương trước là các kỹ thuật IPC pull-based.
- Các giao thức giao tiếp (communication protocol) và các đặc điểm mà một giao thức thường có. Chúng tôi giới thiệu serialization và deserialization có nghĩa là gì và chúng góp phần vào một IPC hoạt động đầy đủ như thế nào.
- File descriptor và cách chúng đóng một vai trò then chốt trong việc thiết lập một IPC channel.
- API được phơi ra cho POSIX signal, POSIX pipe và POSIX message queue được thảo luận trong chương này. Với mỗi kỹ thuật, một ví dụ được cung cấp để minh họa cách dùng cơ bản.
- Mạng máy tính và cách hai process có thể giao tiếp qua một mạng hiện có.
- Mô hình listener-connector và cách hai process có thể thiết lập một kết nối transport qua một số mạng. Đây là cơ sở cho các thảo luận sau này của chúng ta về socket programming.
- Socket programming là gì và các đối tượng socket là gì.
- Các trình tự tồn tại cho mỗi process tham gia một kết nối listener-connector, và API mà chúng phải dùng từ POSIX socket library.

Trong phần đầu tiên, chúng ta sẽ xem lại các kỹ thuật IPC.

<a id="_idParaDest-261"></a>

## Các kỹ thuật IPC

Một kỹ thuật IPC<a id="_idIndexMarker1311"></a> nói chung chỉ bất kỳ phương tiện nào được các process dùng để giao tiếp và truyền dữ liệu. Trong chương trước, chúng ta đã thảo luận filesystem và shared memory như cách tiếp cận khởi đầu để chia sẻ dữ liệu giữa hai process. Lúc đó chúng ta chưa dùng thuật ngữ 'IPC' cho những kỹ thuật này, nhưng thực tế đó chính là chúng! Trong chương này, chúng ta sẽ thêm một vài kỹ thuật IPC nữa vào những kỹ thuật mà chúng ta đã gặp, nhưng chúng ta nên nhớ rằng chúng khác nhau ở một số điểm. Trước khi nhảy vào những khác biệt và cố gắng phân loại chúng, hãy liệt kê một số kỹ thuật IPC:

- Shared memory
- Filesystem (cả trên đĩa lẫn trong memory)
- POSIX signal
- POSIX pipe
- POSIX message queue
- Unix domain socket
- Internet socket (hay network socket)

Từ góc nhìn lập trình, các kỹ thuật shared memory và filesystem tương tự nhau ở một số điểm và vì vậy chúng có thể được đặt vào cùng một nhóm, được biết đến là các kỹ thuật IPC *pull-based*. Các kỹ thuật còn lại nổi bật và chúng có nhóm riêng. Chúng ta gọi chúng là các kỹ thuật IPC *push-based*. Chương này cùng với chương tiếp theo dành cho IPC push-based, và các kỹ thuật khác nhau được thảo luận.

Lưu ý rằng mọi kỹ thuật IPC đều chịu trách nhiệm truyền một số thông điệp giữa hai process. Vì chúng ta sẽ dùng thuật ngữ *message* (thông điệp) rất nhiều trong các đoạn sắp tới, đáng để định nghĩa nó trước.

Mỗi thông điệp chứa một chuỗi byte được ghép lại theo một interface, giao thức hay chuẩn well-defined. Cấu trúc của một thông điệp nên được cả hai process xử lý thông điệp đó biết, và nó thường được trình bày như một phần của một communication protocol.

Danh sách những khác biệt giữa các kỹ thuật pull-based và push-based<a id="_idIndexMarker1313"></a> có thể được thấy như sau:

- Trong các kỹ thuật pull-based, chúng ta có một tài nguyên dùng chung hay *medium* bên ngoài cả hai process và có sẵn trong user space. File, shared memory, và thậm chí một network service như<a id="_idIndexMarker1314"></a> một server **Network Filesystem** (**NFS**) đều có thể là tài nguyên dùng chung. Những medium này là chỗ chứa chính cho các thông điệp được các process tạo ra và tiêu thụ. Trong khi đó trong các kỹ thuật push-based, không có tài nguyên dùng chung hay medium như vậy và thay vào đó, có một *channel*. Các process gửi và nhận thông điệp qua channel này, và những thông điệp này không được lưu trong bất kỳ medium trung gian nào.

- Trong các kỹ thuật pull-based, mỗi process phải *kéo* (pull) các thông điệp có sẵn từ medium. Trong các kỹ thuật push-based, các thông điệp đến được *đẩy* (push, *chuyển giao*) tới đầu nhận.

- Trong các kỹ thuật pull-based, vì có một tài nguyên dùng chung hay medium, việc truy cập concurrent vào medium phải được đồng bộ hóa. Đó là lý do tại sao chúng ta đã khám phá các kỹ thuật synchronization khác nhau cho những kỹ thuật IPC như vậy trong chương trước. Lưu ý rằng điều này không đúng với các kỹ thuật push-based và không cần synchronization nào.

- Trong các kỹ thuật pull-based, các process có thể hoạt động độc lập. Đó là vì các thông điệp có thể được lưu trong một tài nguyên dùng chung và có thể được lấy sau. Nói cách khác, các process có thể hoạt động theo kiểu *async*. Ngược lại, trong một kỹ thuật IPC push-based, cả hai process nên đang chạy cùng lúc, và vì các thông điệp được đẩy ngay lập tức, process nhận có thể mất một số thông điệp đến nếu nó không hoạt động. Nói cách khác, các process hoạt động theo kiểu *sync*.

  > **Lưu ý**:
  >
  > Trong các kỹ thuật push-based, chúng ta có một message buffer tạm thời cho mỗi process giữ các thông điệp được đẩy đến. Message buffer này nằm trong kernel và sống chừng nào process còn đang chạy. Message buffer này có thể được truy cập một cách concurrent, nhưng synchronization phải được chính kernel bảo đảm.

Các thông điệp dù được truyền trong một IPC channel khi dùng một kỹ thuật push-based, hay được lưu trong một IPC medium khi dùng một kỹ thuật pull-based, đều nên có nội dung mà process nhận có thể hiểu được. Điều này có nghĩa là cả hai process – đầu gửi và đầu nhận – đều phải biết cách tạo và phân tích các thông điệp. Vì thông điệp được tạo nên từ byte, điều này ngụ ý rằng cả hai process đều phải biết cách chuyển một đối tượng (một văn bản hay video) thành một chuỗi byte, và cách khôi phục cùng đối tượng từ các byte nhận được. Chúng ta sẽ thấy ngay sau đây rằng inter-operability (khả năng tương tác) của các process được bảo đảm bởi một *communication protocol* chung được cả hai chấp nhận.

Trong phần sau, chúng ta sẽ thảo luận sâu hơn về communication protocol.

<a id="_idParaDest-262"></a>

## Communication protocol (giao thức giao tiếp)

Chỉ có một<a id="_idIndexMarker1315"></a> channel hay medium giao tiếp là không đủ. Hai bên muốn giao tiếp qua một channel dùng chung cũng cần hiểu nhau nữa! Một ví dụ rất đơn giản là khi hai người muốn nói chuyện với nhau bằng cùng một ngôn ngữ, như tiếng Anh hay tiếng Nhật. Ở đây, ngôn ngữ có thể được coi là giao thức được hai bên dùng để giao tiếp.

Trong ngữ cảnh IPC, các process không phải là ngoại lệ; chúng cần một ngôn ngữ chung để có thể giao tiếp. Về mặt kỹ thuật, chúng ta dùng thuật ngữ *protocol* (giao thức) để chỉ ngôn ngữ chung này giữa bất kỳ hai bên nào. Trong phần này, chúng ta sẽ thảo luận các communication protocol và các đặc điểm khác nhau của chúng như *message length* (độ dài thông điệp) và *message content* (nội dung thông điệp). Trước khi có thể nói về những đặc điểm này, chúng ta cần mô tả một communication protocol theo một nghĩa sâu hơn. Lưu ý rằng trọng tâm chính của chúng ta trong chương này là các kỹ thuật IPC; do đó, chúng ta chỉ nói về các communication protocol giữa hai process. Bất kỳ loại giao tiếp nào xảy ra giữa các bên khác ngoài process đều không thể được trình bày trong chương này.

Process chỉ có thể truyền byte. Điều này thực chất có nghĩa là mọi mẩu thông tin đều phải được chuyển thành một chuỗi byte trước khi được <a id="_idIndexMarker1316"></a>truyền bởi một trong các kỹ thuật IPC. Điều này<a id="_idIndexMarker1317"></a> được gọi là *serialization* hay *marshalling*. Một đoạn văn bản, một mẩu âm thanh, một bản nhạc, hay bất kỳ loại đối tượng nào khác đều phải được serialize trước khi được gửi qua một IPC channel, hay được lưu trong một IPC medium. Do đó, đối với các IPC communication protocol, điều này có nghĩa là các thông điệp được truyền giữa các process là một chuỗi byte theo một thứ tự rất cụ thể và well-defined.

Ngược lại, khi một process nhận một chuỗi byte từ một IPC channel, nó nên có khả năng <a id="_idIndexMarker1318"></a>tái tạo đối tượng ban đầu <a id="_idIndexMarker1319"></a>từ các byte đến. Điều này được gọi là *deserialization* hay *unmarshaling*.

Để giải thích serialization và deserialization trong cùng một luồng, khi một process muốn gửi một đối tượng tới một process khác qua bất kỳ IPC channel nào đã được thiết lập, process gửi trước tiên serialize đối tượng thành một mảng byte. Sau đó nó truyền mảng byte cho bên kia. Ở phía nhận, process deserialize các byte đến và nó khôi phục đối tượng đã gửi. Như bạn có thể thấy, những thao tác này là nghịch đảo của nhau, và chúng được cả hai đầu dùng để sử dụng một IPC channel byte-oriented nhằm truyền thông tin. Đây là điều bạn không thể tránh khỏi, và mọi công nghệ IPC-based (RPC, RMI, v.v.) đều dựa rất nhiều vào việc serialization và deserialization các đối tượng khác nhau. Từ giờ trở đi, chúng ta dùng thuật ngữ serialization để chỉ cả hai thao tác serialization và deserialization.

Lưu ý rằng serialization không<a id="_idIndexMarker1320"></a> chỉ giới hạn ở các kỹ thuật IPC push-based mà chúng ta đã thảo luận cho đến giờ. Trong các kỹ thuật IPC pull-based như filesystem hay shared memory, chúng ta vẫn cần serialization. Đó là vì các medium bên dưới trong những kỹ thuật này có thể lưu một chuỗi byte và nếu một process muốn lưu một đối tượng trong một file dùng chung, chẳng hạn, nó phải serialize đối tượng trước khi có thể lưu nó ở đó. Do đó, serialization là phổ quát với mọi kỹ thuật IPC; bất kể bạn đang dùng phương pháp IPC nào, bạn phải xử lý rất nhiều việc serialization và deserialization khi dùng channel hay medium bên dưới.

Việc chọn một communication protocol ngầm định quy định serialization vì, như một phần của một giao thức, chúng ta định nghĩa thứ tự byte rất cẩn thận. Điều này then chốt vì một đối tượng đã được serialize phải được deserialize trở lại cùng đối tượng ở phía nhận. Do đó, cả serializer lẫn deserializer đều phải tuân theo cùng các quy tắc được giao thức quy định. Có một serializer và deserializer không tương thích ở hai đầu thực chất có nghĩa là hoàn toàn không có giao tiếp, đơn giản vì đầu nhận không thể tái tạo đối tượng đã được truyền.

> **Lưu ý**:
>
> Đôi khi, chúng ta dùng thuật ngữ *parsing* như một từ đồng nghĩa với *deserialization*, nhưng thực tế chúng khác nhau về cơ bản.

Để làm thảo luận hữu hình hơn, hãy nói về một số ví dụ thật. Một web server và một web client <a id="_idIndexMarker1321"></a>giao tiếp bằng **Hyper Text Transfer Protocol** (**HTTP**). Do đó, cả hai bên đều cần dùng các HTTP serializer và deserializer tương thích để nói chuyện với nhau. Một ví dụ khác, hãy nói <a id="_idIndexMarker1322"></a>về giao thức **Domain Name Service** (**DNS**). Cả DNS client lẫn server đều phải dùng các serializer và deserializer tương thích để chúng có thể giao tiếp. Lưu ý rằng không giống HTTP, vốn có nội dung dạng văn bản, DNS là một giao thức binary. Chúng ta thảo luận điều này ngay trong các phần sắp tới.

Vì các thao tác serialization<a id="_idIndexMarker1323"></a> có thể được dùng trong nhiều thành phần khác nhau trong một dự án phần mềm, chúng thường được cung cấp dưới dạng một số library có thể được thêm vào bất kỳ thành phần nào muốn dùng chúng. Đối với các giao thức nổi tiếng như HTTP, DNS và FTP, có các library third-party well-known có thể được dùng mà không gặp rắc rối. Nhưng đối với các giao thức tùy chỉnh được thiết kế đặc biệt cho một dự án, các serialization library phải được chính nhóm viết.

> **Lưu ý:**
>
> Các giao thức Well-known như HTTP, FTP và DNS là các chuẩn và chúng được mô tả trong một số tài liệu mở chính thức <a id="_idIndexMarker1324"></a>gọi là **request for comments** (**RFC**). Ví dụ, giao thức HTTP/1.1 được mô tả trong RFC-2616. Một tìm kiếm Google đơn giản sẽ đưa bạn đến trang RFC.

Một lưu ý thêm về *serialization library*, chúng có thể được cung cấp bằng nhiều ngôn ngữ lập trình khác nhau. Lưu ý rằng bản thân một serialization cụ thể không phụ thuộc vào bất kỳ ngôn ngữ lập trình nào vì nó chỉ nói về thứ tự byte và chúng nên được diễn giải như thế nào. Do đó, các thuật toán serialization và deserialization có thể được phát triển bằng bất kỳ ngôn ngữ lập trình nào. Đó là một yêu cầu then chốt. Trong một dự án phần mềm lớn, chúng ta có thể có nhiều thành phần được viết bằng các ngôn ngữ lập trình khác nhau, và có những tình huống mà những thành phần này phải truyền thông tin. Do đó, chúng ta cần cùng các thuật toán serialization được viết bằng các ngôn ngữ khác nhau. Chẳng hạn, chúng ta có các HTTP serializer được viết bằng C, C++, Java, Python, v.v.

Để tóm tắt điểm chính của phần này, chúng ta cần một giao thức well-defined giữa hai bên để chúng có thể nói chuyện với nhau. Một IPC protocol là một chuẩn quy định toàn bộ việc giao tiếp phải diễn ra như thế nào và những chi tiết nào phải được tuân theo về thứ tự byte và ý nghĩa của chúng trong các thông điệp khác nhau. Chúng ta phải dùng một số thuật toán serialization để sử dụng một IPC channel byte-oriented nhằm truyền các đối tượng.

Trong phần sau, chúng tôi mô tả các đặc điểm của IPC protocol.

<a id="_idParaDest-263"></a>

### Đặc điểm của giao thức

Các IPC protocol<a id="_idIndexMarker1325"></a> có nhiều đặc điểm khác nhau. Nói ngắn gọn, mỗi giao thức có thể chỉ định một kiểu nội dung khác nhau cho các thông điệp được truyền qua một IPC channel. Trong một giao thức khác, các thông điệp có thể có độ dài cố định hay độ dài thay đổi. Một số giao thức quy định rằng các thao tác được cung cấp phải được sử dụng theo kiểu đồng bộ, trong khi có những giao thức cho phép cách dùng bất đồng bộ. Trong các phần sau, chúng ta sẽ trình bày những yếu tố phân biệt này. Lưu ý rằng các giao thức hiện có có thể được phân loại dựa trên những đặc điểm này.

<a id="_idParaDest-264"></a>

#### Kiểu nội dung

Các thông điệp được gửi <a id="_idIndexMarker1326"></a>qua IPC channel có thể có nội dung *văn bản* (textual) hay nội dung *binary* hay sự kết hợp của cả hai. Nội dung binary có các byte với giá trị trải trên mọi giá trị số khả dĩ từ 0 đến 255. Nhưng nội dung văn bản chỉ có các ký tự được dùng trong văn bản. Nói cách khác, chỉ các ký tự chữ-số cùng với một số ký hiệu được phép trong nội dung văn bản.

Dù nội dung văn bản có thể được coi là một trường hợp đặc biệt của nội dung binary, chúng ta cố gắng giữ chúng riêng biệt và đối xử với chúng khác nhau. Chẳng hạn, thông điệp văn bản là ứng viên tốt để được nén trước khi gửi, trong khi thông điệp binary có *compression ratio* (tỉ lệ nén: kích thước thực chia cho kích thước đã nén) kém. Thật tốt khi biết rằng một số giao thức hoàn toàn là văn bản, như JSON, và một số khác hoàn toàn binary, như DNS. Cũng có những giao thức như BSON và HTTP cho phép nội dung thông điệp là sự kết hợp của cả dữ liệu văn bản lẫn binary. Trong những giao thức này, các byte thô có thể được trộn với văn bản để tạo thành thông điệp cuối cùng.

Lưu ý rằng nội dung binary có thể được gửi dưới dạng văn bản. Có nhiều cách mã hóa khác nhau cho phép bạn biểu diễn nội dung binary bằng các ký tự văn bản. *Base64* là một trong những thuật toán *binary-to-text encoding* nổi tiếng nhất cho phép một sự chuyển đổi như vậy. Những thuật toán mã hóa này được dùng rộng rãi trong các giao thức thuần văn bản như JSON để gửi dữ liệu binary.

<a id="_idParaDest-265"></a>

#### Độ dài của thông điệp

Các thông điệp <a id="_idIndexMarker1327"></a>được tạo ra theo một IPC protocol có thể là *fixed-length* (độ dài cố định) hoặc *variable-length* (độ dài thay đổi). Với fixed-length, chúng tôi muốn nói rằng mọi thông điệp đều có cùng độ dài. Ngược lại, với variable-length, chúng tôi muốn nói rằng các thông điệp được tạo ra có thể có độ dài khác nhau. Việc nhận các thông điệp fixed-length hay variable-length có tác động trực tiếp lên phía nhận khi deserialize nội dung của một thông điệp. Dùng một giao thức luôn tạo ra các thông điệp fixed-length có thể giảm gánh nặng phân tích các thông điệp nhận được vì đầu nhận đã biết số byte mà nó nên đọc từ channel, và các thông điệp cùng kích thước thường (không phải luôn luôn) có cùng cấu trúc. Khi đọc các thông điệp fixed-length từ một IPC channel, nếu tất cả chúng đều theo cùng cấu trúc, chúng ta có một cơ hội tốt để dùng các structure C để tham chiếu tới những byte đó thông qua một số trường already-defined, tương tự những gì chúng ta đã làm cho các đối tượng được đặt trong shared memory ở chương trước.

Với các giao thức tạo ra thông điệp variable-length, việc tìm ra nơi một thông điệp riêng lẻ kết thúc không dễ dàng như vậy, và phía nhận bằng cách nào đó (mà chúng tôi sẽ giải thích ngay sau đây) nên quyết định xem nó đã đọc một thông điệp hoàn chỉnh hay cần đọc thêm byte từ channel. Lưu ý rằng đầu nhận có thể đọc nhiều khối từ channel trước khi đọc được một thông điệp hoàn chỉnh, và một khối duy nhất có thể chứa dữ liệu từ hai thông điệp kề nhau. Chúng ta sẽ thấy một ví dụ về điều này trong chương tiếp theo.

Vì hầu hết các giao thức là <a id="_idIndexMarker1328"></a>variable-length và bạn thường không có được sự xa xỉ khi làm việc với các thông điệp fixed-length, đáng để thảo luận các phương pháp mà các giao thức khác nhau chấp nhận để làm cho các thông điệp variable-length của chúng có thể phân biệt hay tách rời được. Nói cách khác, những giao thức này dùng một cơ chế để đánh dấu điểm kết thúc của một thông điệp và, bằng cách này, đầu nhận có thể dùng những dấu đó để biết rằng nó đã đọc được một thông điệp hoàn chỉnh. Tiếp theo, bạn có thể thấy một số phương pháp này:

- **Dùng một delimiter hay separator**: Một delimiter<a id="_idIndexMarker1329"></a> hay separator là một chuỗi<a id="_idIndexMarker1330"></a> byte (trong thông điệp binary) hay ký tự (trong thông điệp văn bản) chỉ ra điểm kết thúc của một thông điệp. Delimiter nên được chọn tùy theo nội dung của các thông điệp, vì nó nên dễ dàng phân biệt được với nội dung thực.
- **Length-prefix framing**: Trong những <a id="_idIndexMarker1331"></a>giao thức này, mỗi thông điệp có một tiền tố fixed-length (thường là 4 byte hay thậm chí hơn) mang số byte mà đầu nhận nên đọc để có một thông điệp hoàn chỉnh. Nhiều giao thức khác nhau như <a id="_idIndexMarker1332"></a>mọi giao thức **Tag-Value-Length** (**TLV**), với **Abstract Syntax Notation** (**ASN**) là một ví dụ, dùng kỹ thuật này.
- **Dùng một finite-state machine**: Những giao thức này tuân theo một *regular grammar* (văn phạm chính quy) có thể được mô hình hóa bằng một *finite-state machine* (máy hữu hạn trạng thái). Phía nhận nên biết văn phạm của<a id="_idIndexMarker1333"></a> giao thức, và nó nên dùng một deserializer phù hợp hoạt động dựa trên một finite-state machine để đọc một thông điệp hoàn chỉnh từ IPC channel.

<a id="_idParaDest-266"></a>

#### Tính tuần tự (Sequentiality)

Trong hầu hết <a id="_idIndexMarker1334"></a>các giao thức, chúng ta có một *conversation* (cuộc hội thoại) diễn ra giữa hai process tuân theo một sơ đồ *request-response*. Một trong các bên gửi một yêu cầu và bên kia trả lời. Sơ đồ này thường được dùng trong các kịch bản client-server. Process lắng nghe, thường là process server, chờ một thông điệp, và khi thông điệp được nhận, nó trả lời tương ứng.

Nếu giao thức là đồng bộ hay tuần tự, bên gửi (client) sẽ chờ cho đến khi bên lắng nghe (server) hoàn tất yêu cầu và gửi lại câu trả lời. Nói cách khác, bên gửi ở trong trạng thái *blocking* cho đến khi bên lắng nghe trả lời. Trong một giao thức bất đồng bộ, process gửi không bị chặn, và nó có thể tiếp tục với một tác vụ khác trong khi yêu cầu đang được bên lắng nghe xử lý. Tức là, bên gửi sẽ không bị chặn trong khi câu trả lời đang được chuẩn bị.

Trong một giao thức bất đồng bộ, nên có một cơ chế *pulling* hay *pushing*, cho phép bên gửi kiểm tra câu trả lời. Trong một kịch bản pulling, bên gửi sẽ thường xuyên hỏi bên lắng nghe về kết quả. Trong một kịch bản pushing, bên lắng nghe sẽ đẩy câu trả lời lại cho bên gửi qua cùng hay một channel giao tiếp khác.

Tính tuần tự của một<a id="_idIndexMarker1335"></a> giao thức không chỉ giới hạn ở các kịch bản request-response. Các ứng dụng nhắn tin thường dùng kỹ thuật này để có khả năng phản hồi tối đa cả ở server-side lẫn client-side.

<a id="_idParaDest-267"></a>

## Single-host communication (giao tiếp trên một host)

Trong phần này, chúng ta<a id="_idIndexMarker1336"></a> sẽ nói về IPC single-host. IPC Multiple-host sẽ là chủ đề thảo luận của chúng ta trong chương tiếp theo. Có bốn kỹ thuật chính có thể được các process dùng để giao tiếp khi chúng nằm trên cùng một máy:

- POSIX signal
- POSIX pipe
- POSIX message queue
- Unix domain socket

POSIX signal, không giống các kỹ thuật khác ở trên, không tạo ra một channel giao tiếp giữa các process, mà có thể được dùng như một cách để thông báo cho một process về một sự kiện. Trong một số kịch bản nhất định, những signal như vậy có thể được các process dùng để thông báo cho nhau về các sự kiện cụ thể trong hệ thống.

Trước khi nhảy vào kỹ thuật IPC đầu tiên, POSIX signal, hãy thảo luận về file descriptor. Ngoài POSIX signal, bất kể bạn dùng kỹ thuật IPC nào, bạn sẽ làm việc với một loại file descriptor nào đó. Do đó, giờ chúng ta sẽ dành một phần riêng cho chúng và thảo luận thêm về chúng.

<a id="_idParaDest-268"></a>

### File descriptor

Hai process đang giao tiếp <a id="_idIndexMarker1337"></a>có thể đang chạy hoặc trên cùng một máy hoặc trên hai máy khác nhau được kết nối bởi một mạng máy tính. Trong phần này và phần lớn chương này, trọng tâm của chúng ta là trường hợp thứ nhất, trong đó các process nằm trên cùng một máy. Đó là nơi file descriptor trở nên vô cùng quan trọng. Lưu ý rằng trong IPC multiple-host, chúng ta vẫn sẽ làm việc với file descriptor, nhưng chúng được gọi là *socket* ở đó. Chúng ta sẽ thảo luận chúng kỹ lưỡng trong chương sắp tới.

Một file descriptor<a id="_idIndexMarker1338"></a> là một handle trừu tượng tới một đối tượng trong hệ thống có thể được dùng để đọc và ghi dữ liệu. Như bạn có thể thấy, bất chấp cái tên, file descriptor có thể tham chiếu tới một phạm vi rộng các cơ chế có sẵn xử lý việc đọc và sửa đổi các byte stream.

File thông thường chắc chắn nằm trong số các đối tượng có thể được tham chiếu bởi file descriptor. Những file như vậy nằm trên các filesystem, hoặc trên một ổ cứng hoặc trong memory.

Những thứ khác có thể được tham chiếu và truy cập qua file descriptor là các thiết bị. Như chúng ta đã thấy trong *Chương 10*, *Unix - Lịch sử và Architecture*, mỗi thiết bị có thể được truy cập bằng một device file, thường được tìm thấy trong thư mục `/dev`.

Đối với các kỹ thuật IPC push-based, một file descriptor có thể biểu diễn một IPC channel. Trong trường hợp này, file descriptor có thể được dùng để đọc và ghi dữ liệu từ và tới channel được biểu diễn. Đó là lý do tại sao bước đầu tiên trong việc thiết lập một IPC channel là định nghĩa một số file descriptor.

Giờ bạn đã biết thêm về file descriptor và những gì chúng biểu diễn, chúng ta có thể tiếp tục và thảo luận kỹ thuật IPC đầu tiên có thể được dùng trong hệ thống multi-process single-host; tuy nhiên, POSIX signal không dùng file descriptor. Bạn sẽ nghe thêm về file descriptor trong các phần sau dành cho POSIX pipe và POSIX message queue. Hãy bắt đầu với POSIX signal.

<a id="_idParaDest-269"></a>

### POSIX signal

Trong các hệ thống POSIX, process<a id="_idIndexMarker1339"></a> và thread có thể gửi và nhận một số signal<a id="_idIndexMarker1340"></a> được định nghĩa trước. Một signal có thể được gửi bởi một process, hay một thread, hay bởi chính kernel. Signal thực ra dùng để thông báo cho một process hay một thread về một sự kiện hay lỗi. Ví dụ, khi hệ thống sắp được khởi động lại, hệ thống gửi một signal `SIGTERM` tới mọi process để cho chúng biết rằng việc khởi động lại đang diễn ra và chúng phải thoát ngay lập tức. Một khi một process nhận signal này, nó nên phản ứng tương ứng. Trong một số trường hợp, không cần làm gì, nhưng trong một số trường hợp, state hiện tại của process nên được lưu lại.

Bảng sau cho thấy các signal có sẵn trong một hệ thống Linux. Bảng được trích từ trang manual về signal của Linux[ manual page that can be found at http://www.man7.org/](http://www.man7.org/linux/man-pages/man7/signal.7.html)linux/man-pages/man7/signal.7.html:

```
 Signal      Standard   Action   Comment ───────────────────────────────────────────────────────────
SIGABRT      P1990      Core    Abort signal from abort(3)SIGALRM      P1990      Term    Timer signal from alarm(2)SIGBUS       P2001      Core    Bus error (bad memory access)SIGCHLD      P1990      Ign     Child stopped or terminated SIGCLD         -        Ign     A synonym for SIGCHLD SIGCONT      P1990      Cont    Continue if stopped SIGEMT         -        Term    Emulator trap SIGFPE       P1990      Core    Floating-point exception SIGHUP       P1990      Term    Hangup detected on controlling terminal                                 or death of controlling process SIGILL       P1990      Core    Illegal Instruction SIGINFO        -                A synonym for SIGPWR SIGINT       P1990      Term    Interrupt from keyboard SIGIO          -        Term    I/O now possible (4.2BSD)SIGIOT         -        Core    IOT trap. A synonym for SIGABRT SIGKILL      P1990      Term    Kill signal SIGLOST        -        Term    File lock lost (unused)SIGPIPE      P1990      Term    Broken pipe: write to pipe with no                                 readers; see pipe(7)SIGPOLL      P2001      Term    Pollable event (Sys V).                                Synonym for SIGIO SIGPROF      P2001      Term    Profiling timer expired SIGPWR         -        Term    Power failure (System V)SIGQUIT      P1990      Core    Quit from keyboard SIGSEGV      P1990      Core    Invalid memory reference SIGSTKFLT      -        Term    Stack fault on coprocessor (unused)SIGSTOP      P1990      Stop    Stop process SIGTSTP      P1990      Stop    Stop typed at terminal SIGSYS       P2001      Core    Bad system call (SVr4);                                see also seccomp(2)SIGTERM      P1990      Term    Termination signal SIGTRAP      P2001      Core    Trace/breakpoint trap SIGTTIN      P1990      Stop    Terminal input for background process SIGTTOU      P1990      Stop    Terminal output for background process SIGUNUSED      -        Core    Synonymous with SIGSYS SIGURG       P2001      Ign     Urgent condition on socket (4.2BSD)SIGUSR1      P1990      Term    User-defined signal 1 SIGUSR2      P1990      Term    User-defined signal 2 SIGVTALRM    P2001      Term    Virtual alarm clock (4.2BSD)SIGXCPU      P2001      Core    CPU time limit exceeded (4.2BSD);                                see setrlimit(2)SIGXFSZ      P2001      Core    File size limit exceeded (4.2BSD);                                see setrlimit(2)SIGWINCH       -        Ign     Window resize signal (4.3BSD, Sun)
```

*Bảng 19-1: Danh sách mọi signal có sẵn trong một hệ thống Linux*

Như bạn có thể thấy trong bảng trên, không phải mọi signal đều là POSIX, và Linux có các signal riêng của nó. Trong khi hầu hết các signal tương ứng với các sự kiện well-known, có hai POSIX signal <a id="_idIndexMarker1343"></a>có thể được người dùng định nghĩa. Điều này chủ yếu được dùng trong các kịch bản khi bạn muốn gọi một chức năng nhất định trong chương trình của mình trong khi process đang chạy. *Ví dụ 19.1* minh họa<a id="_idIndexMarker1344"></a> cách dùng signal và cách chúng có thể được xử lý trong một chương trình C. Tiếp theo, bạn có thể tìm thấy code cho *ví dụ 19.1*:

```
#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
void handle_user_signals(int signal) {
  switch (signal) {
    case SIGUSR1:
      printf("SIGUSR1 received!\n");
      break;
    case SIGUSR2:
      printf("SIGUSR2 received!\n");
      break;
    default:
      printf("Unsupported signal is received!\n");
  }
}
void handle_sigint(int signal) {
  printf("Interrupt signal is received!\n");
}
void handle_sigkill(int signal) {
  printf("Kill signal is received! Bye.\n");
  exit(0);
}
int main(int argc, char** argv) {
  signal(SIGUSR1, handle_user_signals);
  signal(SIGUSR2, handle_user_signals);
  signal(SIGINT, handle_sigint);
  signal(SIGKILL, handle_sigkill);
  while (1);
  return 0;
}
```

*Code Box 19-1 [ExtremeC_examples_chapter19_1.c]: Xử lý POSIX signal*

Trong ví dụ trên, chúng ta <a id="_idIndexMarker1345"></a>đã dùng hàm `signal` để<a id="_idIndexMarker1346"></a> gán các signal handler khác nhau cho một số signal cụ thể. Như bạn có thể thấy, chúng ta có một signal handler cho các signal user-defined, một handler cho signal `SIGINT`, và một cho signal `SIGKILL`.

Chương trình chỉ là một vòng lặp never-ending (không bao giờ kết thúc), và tất cả những gì chúng ta muốn làm là xử lý một số signal. Các lệnh sau cho thấy cách biên dịch và chạy ví dụ ở chế độ nền:

```
$ gcc ExtremeC_examples_chapter19_1.c -o ex19_1.out
$ ./ex19_1.out &
[1] 4598
$
```

*Shell Box 19-1: Biên dịch và chạy ví dụ 19.1*

Giờ chúng ta đã biết PID của chương trình, chúng ta có thể gửi cho nó một số signal. PID là 4598 và chương trình đang chạy ở chế độ nền. Lưu ý rằng PID sẽ khác với bạn. Bạn có thể dùng lệnh `kill` để gửi một signal tới một process. Lệnh sau được dùng để xem xét ví dụ trên:

```
$ kill -SIGUSR2 4598
SIGUSR2 received!
$ kill -SIGUSR1 4598
SIGUSR2 received!
$ kill -SIGINT 4598
Interrupt signal is received!
$ kill -SIGKILL 4598
$
[1]+  Stopped         ./ex19_1.out
$
```

*Shell Box 19-2: Gửi các signal khác nhau tới process chạy nền*

Như bạn có thể thấy, chương trình xử lý mọi signal ngoại trừ signal `SIGKILL`. `SIGKILL` không thể được xử lý bởi bất kỳ process nào và, thông thường, một parent process đã sinh ra process có thể được thông báo về việc con của nó bị kill.

Lưu ý rằng signal `SIGINT`, hay interrupt signal, có thể được gửi tới một chương trình foreground bằng cách nhấn `Ctrl` + `C`. Do đó, bất cứ khi nào bạn nhấn tổ hợp phím này, bạn thực sự đang gửi một interrupt signal tới chương trình đang chạy. Handler mặc định chỉ dừng chương trình, nhưng như bạn có thể thấy trong ví dụ trên, chúng ta có thể xử lý signal `SIGINT` và bỏ qua nó.

Ngoài khả năng gửi một <a id="_idIndexMarker1347"></a>signal tới một process bằng các lệnh shell<a id="_idIndexMarker1348"></a>, một process cũng có thể gửi một signal tới một process khác nếu nó biết PID của process đích. Bạn có thể dùng hàm `kill` (được khai báo trong `signal.h`), vốn làm chính xác điều tương tự như phiên bản command-line của nó. Nó nhận hai tham số: tham số thứ nhất là PID đích và tham số thứ hai là số signal. Một process hay một thread cũng có thể dùng các hàm `kill` hay `raise` để gửi một signal cho chính nó. Lưu ý rằng hàm `raise` gửi signal tới thread hiện tại. Những hàm này có thể khá hữu ích trong các kịch bản mà bạn muốn thông báo cho một phần khác của chương trình về một sự kiện.

Lưu ý cuối cùng về ví dụ trên là, như bạn đã thấy trong *Shell Box 19-2*, không quan trọng việc main thread đang bận với vòng lặp never-ending, các signal được chuyển giao một cách bất đồng bộ. Do đó, bạn có thể chắc chắn rằng bạn luôn nhận được các signal đến.

Giờ là lúc nói về POSIX pipe như một kỹ thuật IPC single-host khác có thể hữu ích trong một số hoàn cảnh nhất định.

<a id="_idParaDest-270"></a>

### POSIX pipe

POSIX Pipe<a id="_idIndexMarker1349"></a> trong Unix là <a id="_idIndexMarker1350"></a>các channel một chiều có thể được dùng giữa hai process cần trao đổi thông điệp. Khi tạo một POSIX pipe, bạn sẽ có hai file descriptor. Một file descriptor được dùng để ghi vào pipe, và file descriptor kia được dùng để đọc từ pipe. Ví dụ sau cho thấy cách dùng cơ bản của một POSIX pipe:

```
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
int main(int argc, char** argv) {
  int fds[2];
  pipe(fds);
  int childpid = fork();
  if (childpid == -1) {
    fprintf(stderr, "fork error!\n");
    exit(1);
  }
  if (childpid == 0) {
    // Child closes the read file descriptor
    close(fds[0]);
    char str[] = "Hello Daddy!";
    // Child writes to the write file descriptor
    fprintf(stdout, "CHILD: Waiting for 2 seconds ...\n");
    sleep(2);
    fprintf(stdout, "CHILD: Writing to daddy ...\n");
    write(fds[1], str, strlen(str) + 1);
  } else {
    // Parent closes the write file descriptor
    close(fds[1]);
    char buff[32];
    // Parent reads from the read file descriptor
    fprintf(stdout, "PARENT: Reading from child ...\n");
    int num_of_read_bytes = read(fds[0], buff, 32);
    fprintf(stdout, "PARENT: Received from child: %s\n", buff);
  }
  return 0;
}
```

*Code Box 19-2 [ExtremeC_examples_chapter19_2.c]: Ví dụ 19.2 về việc dùng một POSIX pipe*

Như bạn có thể thấy, ở dòng thứ hai của hàm `main`, chúng ta đã dùng hàm `pipe`. Như chúng tôi đã nói, nó nhận một mảng hai file descriptor và mở hai file descriptor, một để đọc từ pipe và cái kia để ghi vào nó. File descriptor thứ nhất, tại chỉ số 0, nên được dùng để đọc; và file descriptor thứ hai, tại chỉ số 1, nên được dùng để ghi vào pipe.

Để có hai process, chúng ta <a id="_idIndexMarker1351"></a>đã dùng fork API. Như chúng tôi đã giải thích trong *Chương 17*, *Process Execution*, fork API clone parent process và tạo một child process mới. Do đó, các file descriptor đã mở có sẵn cho child process sau khi gọi hàm `fork`.

Khi child process<a id="_idIndexMarker1352"></a> được sinh ra, parent process đi vào khối `else` và child process đi vào khối `if`. Trước tiên, mỗi process nên đóng file descriptor mà nó sẽ không dùng. Trong ví dụ này, cha muốn đọc từ pipe và con muốn ghi vào pipe. Đó là lý do tại sao parent process đóng file descriptor thứ hai (file descriptor ghi) và child process đóng file descriptor thứ nhất (file descriptor đọc). Lưu ý rằng một pipe là một chiều và giao tiếp ngược lại là không thể.

Shell box sau cho thấy output của ví dụ trên:

```
$ gcc ExtremeC_examples_chapter19_2.c -o ex19_2.out
$ ./ex19_2.out
PARENT: Reading from child ...
CHILD: Waiting for 2 seconds ...
CHILD: Writing to daddy ...
PARENT: Received from child: Hello Daddy!
$
```

*Shell Box 19-3: Output của việc chạy ví dụ 19.2*

Như bạn có thể thấy trong *Code Box 19-2*, cho các thao tác đọc và ghi, chúng ta dùng các hàm `read` và `write`. Như chúng tôi đã đề cập trước đây, trong IPC push-based, một file descriptor tham chiếu tới một byte channel, và khi bạn có một file descriptor trỏ tới một channel, bạn có thể dùng các hàm liên quan đến file descriptor. Các hàm `read` và `write` nhận một file descriptor và bất kể loại IPC channel nào ở phía sau, chúng thao tác trên channel bên dưới theo cùng một cách.

Trong ví dụ trước, chúng ta đã dùng fork API để sinh ra một process mới. Nếu một tình huống phát sinh trong đó chúng ta có hai process khác nhau được sinh ra riêng rẽ, câu hỏi là, làm thế nào chúng có thể giao tiếp qua một pipe dùng chung? Nếu một process yêu cầu truy cập một đối tượng pipe trong hệ thống, nó nên có file descriptor tương ứng. Có hai lựa chọn khả dụng:

- Một trong các process nên thiết lập pipe và chuyển các file descriptor tương ứng cho process kia.
- Các process nên dùng một named pipe.

Trong kịch bản thứ nhất, các process phải dùng một Unix domain socket channel để trao đổi file descriptor. Vấn đề là nếu một channel như vậy tồn tại giữa hai process, chúng có thể dùng nó cho việc giao tiếp tiếp theo và sẽ không cần thiết lập một channel khác (POSIX pipe) có API kém thân thiện hơn Unix domain socket.

Kịch bản thứ hai có vẻ <a id="_idIndexMarker1353"></a>hứa hẹn hơn. Một trong các process có thể dùng hàm `mkfifo` và tạo một queue file bằng cách cung cấp một đường dẫn. Sau đó, process thứ hai có thể dùng đường dẫn tới file đã được tạo và mở nó cho việc giao tiếp tiếp theo. Lưu ý rằng channel vẫn là một chiều và, tùy theo kịch bản, một trong các process nên mở file ở chế độ read-only và process kia nên mở nó ở chế độ write-only.

Thêm một điểm nữa nên được <a id="_idIndexMarker1354"></a>thảo luận về ví dụ trước. Như bạn có thể thấy, child process chờ 2 giây trước khi ghi vào pipe. Trong lúc đó, parent process bị chặn tại hàm `read`. Vì vậy, khi không có thông điệp nào được ghi vào pipe, process đọc từ pipe bị chặn.

Lưu ý cuối cùng trong phần này, chúng ta biết rằng POSIX pipe là push-based. Như chúng tôi đã giải thích trước đây, các kỹ thuật IPC push-based có một kernel buffer tạm thời tương ứng để giữ các thông điệp được đẩy đến. POSIX pipe không phải là ngoại lệ và kernel giữ các thông điệp đã ghi cho đến khi chúng được đọc. Lưu ý rằng nếu process sở hữu thoát, đối tượng pipe và kernel buffer tương ứng của nó bị hủy.

Trong phần sau, chúng ta sẽ thảo luận về POSIX message queue.

<a id="_idParaDest-271"></a>

### POSIX message queue

Các message queue Kernel-hosted<a id="_idIndexMarker1355"></a> (được kernel quản lý) là một phần của chuẩn POSIX. Chúng khác <a id="_idIndexMarker1356"></a>đáng kể với POSIX pipe ở nhiều điểm. Ở đây, chúng ta xem xét những khác biệt cơ bản:

- Các phần tử bên trong một pipe là byte. Thay vào đó, message queue giữ các thông điệp. Pipe không biết về bất kỳ cấu trúc nào có trong các byte đã ghi, trong khi message queue giữ các thông điệp thực sự và mỗi lời gọi hàm `write` dẫn đến một thông điệp mới được thêm vào hàng đợi. Message queue bảo toàn ranh giới giữa các thông điệp đã ghi. Để giải thích thêm, giả sử rằng chúng ta có ba thông điệp: thông điệp thứ nhất có 10 byte, thông điệp thứ hai có 20 byte, và thông điệp thứ ba có 30 byte. Chúng ta ghi những thông điệp này vào cả một POSIX pipe lẫn một POSIX message queue. Pipe chỉ biết rằng nó có 60 byte bên trong, và nó cho phép một chương trình đọc 15 byte. Nhưng message queue chỉ biết rằng nó có 3 thông điệp và nó không cho phép một chương trình đọc 15 byte vì chúng ta không có thông điệp nào với 15 byte.
- Pipe có một kích thước tối đa, với đơn vị là số byte. Thay vào đó, message queue có một số lượng thông điệp tối đa. Trong message queue, mỗi thông điệp có một kích thước tối đa tính theo byte.
- Mỗi message queue, giống như một named shared memory hay một named semaphore, mở một file. Dù những file này không phải là file thông thường, chúng có thể được các process tương lai dùng để truy cập cùng instance message queue.
- Message queue có thể được ưu tiên hóa, trong khi pipe không quan tâm đến độ ưu tiên của byte.

Và chúng có các thuộc tính chung sau:

- Cả hai đều một chiều. Để có giao tiếp hai chiều, bạn cần tạo hai instance pipe hay queue.
- Cả hai đều có dung lượng giới hạn; bạn không thể ghi bất kỳ số byte hay thông điệp nào bạn muốn.
- Cả hai đều được biểu diễn bằng file descriptor trong hầu hết các hệ thống POSIX; do đó, các hàm I/O như `read` và `write` có thể được dùng.
- Cả hai kỹ thuật đều *connection-less* (không kết nối). Nói cách khác, nếu hai process khác nhau ghi hai thông điệp khác nhau, có thể một trong số chúng đọc thông điệp của process kia. Nói cách khác, không có quyền sở hữu nào được định nghĩa cho các thông điệp và bất kỳ process nào cũng có thể đọc chúng. Đây sẽ là một vấn đề, đặc biệt khi có nhiều hơn một process thao tác trên cùng một pipe hay message queue một cách concurrent.

> **Lưu ý**:
>
> POSIX message queue được giải thích trong chương này không nên bị nhầm lẫn với các message queue broker được<a id="_idIndexMarker1357"></a> dùng trong architecture **Message Queue Middleware** (**MQM**).

Có nhiều tài nguyên <a id="_idIndexMarker1358"></a>trên internet giải thích POSIX message queue. Link sau giải thích POSIX message queue cụ thể cho hệ điều hành QNX, nhưng phần lớn nội dung vẫn áp dụng được cho các hệ thống POSIX khác: https://users.pja.edu.pl/~jms/qnx/help/watcom/clibref/mq_overview.html.

Giờ là lúc có <a id="_idIndexMarker1359"></a>một ví dụ. *Ví dụ 16.3* có cùng kịch bản như chúng ta đã có trong *ví dụ 16.2*, nhưng nó dùng một POSIX message queue thay vì một POSIX pipe. Mọi hàm liên quan đến POSIX message queue đều được khai báo trong header file `mqueue.h`. Chúng tôi sẽ giải thích một số hàm ngay sau đây.

Lưu ý rằng code sau không biên dịch được trên macOS vì OS/X không hỗ trợ POSIX message queue:

```
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <mqueue.h>
int main(int argc, char** argv) {
  // The message queue handler
  mqd_t mq;
  struct mq_attr attr;
  attr.mq_flags = 0;
  attr.mq_maxmsg = 10;
  attr.mq_msgsize = 32;
  attr.mq_curmsgs = 0;
  int childpid = fork();
  if (childpid == -1) {
    fprintf(stderr, "fork error!\n");
    exit(1);
  }
  if (childpid == 0) {
    // Child waits while the parent is creating the queue
    sleep(1);
    mqd_t mq = mq_open("/mq0", O_WRONLY);
    char str[] = "Hello Daddy!";
    // Child writes to the write file descriptor
    fprintf(stdout, "CHILD: Waiting for 2 seconds ...\n");
    sleep(2);
    fprintf(stdout, "CHILD: Writing to daddy ...\n");
    mq_send(mq, str, strlen(str) + 1, 0);
    mq_close(mq);
  } else {
    mqd_t mq = mq_open("/mq0", O_RDONLY | O_CREAT, 0644, &attr);
    char buff[32];
    fprintf(stdout, "PARENT: Reading from child ...\n");
    int num_of_read_bytes = mq_receive(mq, buff, 32, NULL);
    fprintf(stdout, "PARENT: Received from child: %s\n", buff);
    mq_close(mq);
    mq_unlink("/mq0");
  }
  return 0;
}
```

*Code Box 19-3 [ExtremeC_examples_chapter19_3.c]: Ví dụ 19.3 về việc dùng POSIX message queue*

Để biên dịch<a id="_idIndexMarker1360"></a> code trên, hãy chạy các lệnh sau. Lưu ý rằng code trên nên được link với library `rt` <a id="_idIndexMarker1361"></a>trên Linux:

```
$ gcc ExtremeC_examples_chapter19_3.c -lrt -o ex19_3.out
$
```

*Shell Box 19-4: Build ví dụ 19.3 trên Linux*

Shell box sau minh họa output của *ví dụ 19.3*. Như bạn có thể thấy, output giống hệt như chúng ta đã có cho *ví dụ 19.2* nhưng nó dùng POSIX message queue để thực hiện cùng logic mà chúng ta đã viết trong *ví dụ 19.2*:

```
$ ./ex19_3.out
PARENT: Reading from child ...
CHILD: Waiting for 2 seconds ...
CHILD: Writing to daddy ...
PARENT: Received from child: Hello Daddy!
$
```

*Shell Box 19-5: Chạy ví dụ 19.3 trên Linux*

Lưu ý rằng cả POSIX pipe lẫn message queue đều có một buffer giới hạn trong kernel. Do đó, ghi vào pipe và message queue mà không có một bên sử dụng đọc nội dung của chúng có thể dẫn đến việc mọi thao tác ghi bị chặn. Nói cách khác, bất kỳ lời gọi hàm `write` nào cũng sẽ vẫn bị chặn cho đến khi một bên sử dụng đọc một thông điệp từ message queue hay một số byte từ pipe.

Trong phần sau, chúng tôi sẽ giải thích ngắn gọn Unix domain socket. Chúng thường là lựa chọn đầu tiên khi kết nối hai process cục bộ trong một thiết lập single-host.

<a id="_idParaDest-272"></a>

### Unix domain socket

Một kỹ thuật khác<a id="_idIndexMarker1362"></a> có thể được một số process dùng để giao tiếp trong <a id="_idIndexMarker1363"></a>một cách triển khai single-host là dùng Unix domain socket. Chúng là loại socket đặc biệt chỉ hoạt động bên trong cùng một máy. Do đó, chúng khác với network socket, vốn cho phép hai process từ hai máy khác nhau nói chuyện với nhau qua một mạng hiện có. Unix domain socket có nhiều đặc điểm khiến chúng quan trọng và tinh vi so với POSIX pipe và POSIX message queue. Đặc điểm quan trọng nhất là thực tế rằng Unix domain socket là hai chiều. Do đó, một đối tượng socket duy nhất là đủ để đọc từ và ghi vào channel bên dưới. Nói cách khác, các channel được vận hành bởi Unix domain socket là full-duplex. Ngoài ra, Unix domain socket có thể vừa *session-aware* vừa *message-aware*. Điều này làm cho chúng còn linh hoạt hơn. Chúng ta sẽ thảo luận session-awareness và message-awareness trong các phần sau.

Vì Unix domain socket không thể được thảo luận mà không biết những điều cơ bản của socket programming, chúng ta sẽ không đi xa hơn thế này trong chương này. Thay vào đó, trong các phần sau, chúng tôi giới thiệu socket programming và các khái niệm xung quanh nó. Một thảo luận đầy đủ về Unix domain socket sẽ được đưa ra trong chương tiếp theo. Hãy bắt đầu với socket programming.

<a id="_idParaDest-273"></a>

## Giới thiệu socket programming

Trong chương này, chúng tôi <a id="_idIndexMarker1366"></a>đã quyết định thảo luận socket programming trước khi đi qua các ví dụ code C thật trong chương tiếp theo. Đó là vì có một số khái niệm cơ bản mà bạn cần biết trước khi nhảy vào code.

Socket programming có thể được thực hiện cả trên các cách triển khai single-host lẫn multi-host. Như bạn có thể đã đoán, socket programming trong một hệ thống single-host được thực hiện thông qua Unix domain socket. Trong một thiết lập multi-host, socket programming là về việc tạo và dùng network socket. Cả Unix socket lẫn network socket ít nhiều đều dùng cùng API và chia sẻ cùng các khái niệm, nên sẽ hợp lý khi trình bày chúng cùng nhau trong chương tiếp theo.

Một trong những khái niệm then chốt trước khi dùng network socket là mạng máy tính hoạt động như thế nào. Trong phần sau, chúng ta sẽ nói về điều này và giới thiệu với bạn mạng máy tính. Có nhiều thuật ngữ và khái niệm mà bạn nên biết trước khi có thể viết ví dụ socket programming đầu tiên.

<a id="_idParaDest-274"></a>

### Mạng máy tính

Cách tiếp cận <a id="_idIndexMarker1367"></a>chúng tôi chọn để giải thích các khái niệm mạng trong phần này khác với các tài liệu thông thường bạn có thể tìm thấy về chủ đề này. Mục tiêu của chúng tôi là tạo một sự hiểu biết cơ bản về cách mọi thứ hoạt động trong một mạng máy tính, đặc biệt là giữa hai process. Chúng tôi muốn nhìn khái niệm này từ góc nhìn của một lập trình viên. Và các tác nhân chính trong thảo luận của chúng ta là process, không phải máy tính. Do đó, bạn có thể thấy thứ tự các phần hơi lạ lúc đầu, nhưng nó sẽ giúp bạn nắm được ý tưởng về cách IPC hoạt động qua một mạng máy tính.

Lưu ý rằng phần này không nên được coi là một mô tả hoàn chỉnh về mạng máy tính và, dĩ nhiên, điều đó không thể được thực hiện trong vài trang và chỉ trong một phần.

<a id="_idParaDest-275"></a>

#### Physical layer (tầng vật lý)

Trước tiên, hãy quên<a id="_idIndexMarker1368"></a> process đi và chỉ xem xét các máy tính, hay đơn giản là các máy. Trước khi đi tiếp, lưu ý rằng chúng ta dùng nhiều thuật ngữ khác nhau để chỉ một máy tính trong một mạng. Chúng ta có thể gọi nó là một computer, machine, host, node, hay thậm chí một system. Dĩ nhiên, ngữ cảnh giúp bạn tìm ra ý nghĩa thực sự đằng sau một thuật ngữ cho trước.

Bước đầu tiên hướng tới việc có phần mềm multi-host là một số máy tính được kết nối với nhau qua một mạng hay, chính xác hơn, một mạng máy tính. Lúc này, hãy tập trung vào hai máy tính mà chúng ta muốn kết nối. Để kết nối hai máy vật lý này với nhau, chúng ta chắc chắn cần một loại medium vật lý nào đó như một đoạn dây hay một thiết lập không dây.

Dĩ nhiên, không có một medium vật lý như vậy (vốn không cần phải nhìn thấy được, như trong một mạng không dây), kết nối sẽ không thể có. Những kết nối vật lý này tương tự các con đường giữa các thành phố. Chúng ta sẽ bám theo phép so sánh này vì nó có thể giải thích rất sát những gì đang diễn ra bên trong một mạng máy tính.

Mọi thiết bị phần cứng cần thiết để kết nối hai máy về mặt vật lý đều được coi là một phần của *physical layer*. Đây là tầng đầu tiên và cơ bản nhất mà chúng ta khám phá. Không có tầng này, không thể truyền dữ liệu giữa hai máy tính và coi chúng là đã được kết nối. Mọi thứ trên tầng này đều không phải là vật lý và tất cả những gì bạn tìm thấy là một tập các chuẩn khác nhau về cách dữ liệu nên được truyền.

Hãy nói về tầng tiếp theo, link layer.

<a id="_idParaDest-276"></a>

#### Link layer (tầng liên kết)

Trong khi chỉ có<a id="_idIndexMarker1369"></a> các con đường là không đủ để giao thông di chuyển trên đó, điều tương tự cũng đúng với các kết nối vật lý giữa các máy tính. Để dùng các con đường, chúng ta cần luật lệ và quy định về phương tiện, biển báo, vật liệu, ranh giới, tốc độ, làn đường, hướng đi, v.v., và không có chúng, việc di chuyển trên đường sẽ hỗn loạn và có vấn đề. Các quy tắc tương tự cần thiết cho các kết nối vật lý trực tiếp giữa hai máy tính.

Trong khi các thành phần và thiết bị vật lý cần thiết để kết nối một số máy tính đều thuộc về physical layer, các quy định và giao thức bắt buộc chi phối cách dữ liệu được truyền dọc theo physical layer đều thuộc về một tầng trên gọi là *link layer*.

Là một phần của các quy định được các link protocol áp đặt, các thông điệp nên được chia thành các mảnh gọi là *frame*. Điều này tương tự các quy định trong một hệ thống đường bộ định nghĩa chiều dài tối đa của các phương tiện di chuyển trên một con đường nhất định. Bạn không thể lái một xe kéo 1 km-long (dài một kilomet) (giả sử điều đó khả thi về mặt vật lý) trên một con đường. Bạn phải chia nó thành các đoạn nhỏ hơn, hay thành các phương tiện nhỏ hơn. Tương tự, một mẩu dữ liệu dài nên được chia thành nhiều frame, và mỗi frame phải di chuyển trên mạng một cách tự do, độc lập với các frame khác.

Đáng đề cập rằng mạng có thể tồn tại giữa bất kỳ hai thiết bị tính toán nào. Chúng không nhất thiết phải là máy tính. Có nhiều thiết bị và máy móc trong công nghiệp có thể được kết nối với nhau để tạo thành một mạng. Mạng công nghiệp có các chuẩn riêng cho dây dẫn vật lý, đầu nối, đầu cuối, v.v., và chúng có các link protocol và chuẩn riêng.

Nhiều chuẩn mô tả những kết nối link như vậy, chẳng hạn, cách một máy tính để bàn có thể được kết nối với một máy công nghiệp. Một trong những link protocol nổi bật nhất được thiết kế để kết nối một số máy tính qua một dây dẫn là *Ethernet*. Ethernet mô tả mọi quy tắc và quy định chi phối việc truyền dữ liệu qua mạng máy tính. Chúng ta có một link protocol khác được dùng rộng rãi gọi là IEEE 802.11, chi phối các mạng không dây.

Một mạng gồm các máy tính (hay bất kỳ nhóm máy hay thiết bị tính toán đồng nhất nào khác) được kết nối bằng một kết nối vật lý thông qua một link protocol cụ thể được gọi là một **Local Area Network** (**LAN**). Lưu ý rằng bất kỳ thiết bị nào muốn tham gia một LAN đều phải dùng một thành phần<a id="_idIndexMarker1371"></a> vật lý gọi là *network adapter* hay **Network Interface Controller** (**NIC**) được gắn<a id="_idIndexMarker1372"></a> vào nó. Chẳng hạn, các máy tính muốn tham gia một mạng Ethernet phải có một *Ethernet NIC*.

Một máy tính có thể có nhiều NIC được gắn vào. Mỗi NIC có thể kết nối tới một LAN cụ thể, do đó một máy tính với ba NIC có thể kết nối tới ba LAN khác nhau đồng thời.

Cũng có thể máy tính đó dùng cả ba NIC của nó để kết nối tới cùng một LAN. Cách bạn cấu hình các NIC và cách bạn kết nối các máy tính tới các LAN khác nhau nên được thiết kế từ trước và một kế hoạch chính xác nên được chuẩn bị sẵn.

Mỗi NIC có một address cụ thể và độc nhất được định nghĩa bởi link protocol chi phối. Address này sẽ được dùng cho việc truyền dữ liệu giữa các node bên trong một LAN. Các giao thức Ethernet và IEEE 802.11<a id="_idIndexMarker1373"></a> định nghĩa một address **media access control** (**MAC**) cho mọi NIC tương thích. Do đó, bất kỳ Ethernet NIC hay Wi-Fi adapter IEEE 802.11 nào cũng nên có một MAC address độc nhất để tham gia một LAN tương thích. Bên trong một LAN, các MAC address được gán nên là độc nhất. Lưu ý rằng lý tưởng nhất, mọi MAC address nên độc nhất trên toàn cầu và không thể thay đổi. Tuy nhiên, điều này không đúng, và bạn thậm chí có thể đặt MAC address của một NIC.

Để tóm tắt những gì chúng tôi đã giải thích cho đến giờ, chúng ta có một chồng gồm hai tầng, physical layer bên dưới và link layer bên trên. Điều này đủ để kết nối một số máy tính trên một LAN duy nhất. Nhưng nó không dừng ở đây. Chúng ta cần một tầng khác trên hai tầng này để có thể kết nối các máy tính từ các LAN khác nhau có hoặc không có bất kỳ LAN trung gian nào ở giữa.

<a id="_idParaDest-277"></a>

#### Network layer (tầng mạng)

Cho đến giờ, chúng ta đã thấy rằng <a id="_idIndexMarker1374"></a>MAC address được dùng trong các Ethernet LAN để kết nối một số node. Nhưng điều gì xảy ra nếu hai máy tính từ hai LAN khác nhau cần kết nối với nhau? Lưu ý rằng những mạng LAN này không nhất thiết tương thích.

Chẳng hạn, một trong các LAN có thể là một mạng Ethernet có dây, trong khi LAN kia có thể là một mạng **fiber distributed data interface** (**FDDI**)<a id="_idIndexMarker1375"></a> chủ yếu dùng sợi quang làm physical layer. Một ví dụ khác là các máy công nghiệp được kết nối tới<a id="_idIndexMarker1376"></a> một LAN **Industrial Ethernet** (**IE**) cần kết nối tới máy tính của các nhân viên vận hành, vốn nằm trên một Ethernet LAN thông thường. Những ví dụ này và nhiều ví dụ khác cho thấy rằng chúng ta cần một tầng khác trên các giao thức đã nêu để kết nối các node khác nhau từ các LAN khác nhau. Lưu ý rằng chúng ta thậm chí cần tầng thứ ba này để kết nối các LAN tương thích. Điều này sẽ càng then chốt hơn nếu chúng ta sắp truyền dữ liệu từ một LAN sang một LAN khác (tương thích hay không đồng nhất) qua một số LAN trung gian. Chúng tôi giải thích thêm điều này trong các đoạn sắp tới.

Giống như frame trong link layer, chúng ta có *packet* trong *network layer*. Các thông điệp dài được chia thành các mảnh nhỏ hơn gọi là packet. Dù frame và packet chỉ hai khái niệm khác nhau trong hai tầng khác nhau, để đơn giản, chúng ta coi chúng là như nhau và chúng ta dùng thuật ngữ *packet* cho phần còn lại của chương này.

Như một khác biệt then chốt, bạn nên biết rằng frame đóng gói packet, nói cách khác, một frame chứa một packet. Chúng ta sẽ không đi sâu hơn về frame và packet, nhưng bạn có thể tìm thấy vô số nguồn trên internet mô tả các khía cạnh khác nhau của những khái niệm này.

*Network protocol* lấp đầy khoảng trống giữa các LAN khác nhau để kết nối chúng với nhau. Trong khi mỗi LAN có thể có physical layer cụ thể riêng và các chuẩn và giao thức link layer cụ thể riêng, network protocol chi phối nên là như nhau cho tất cả chúng. Nếu không, các LAN không đồng nhất (không tương thích) không thể kết nối với nhau. Network protocol nổi tiếng nhất hiện nay là **Internet Protocol** (**IP**). Nó được dùng rộng rãi trong các mạng máy tính lớn thường gồm các LAN Ethernet hay Wi-Fi nhỏ hơn. IP có hai phiên bản dựa trên độ dài address của nó: IPv4 và IPv6.

Nhưng làm thế nào hai máy tính từ hai LAN khác nhau có thể được kết nối? Câu trả lời nằm ở cơ chế *routing* (định tuyến). Để nhận dữ liệu từ một LAN bên ngoài, phải có một node *router*. Giả sử rằng chúng ta sẽ kết nối hai LAN khác nhau: LAN1 và LAN2. Một router đơn giản là một<a id="_idIndexMarker1377"></a> node khác nằm trong cả hai mạng nhờ có hai NIC. Một NIC ở trong LAN1 và NIC kia ở trong LAN2. Sau đó, một thuật toán routing đặc biệt quyết định packet nào cần chuyển và chúng nên được chuyển giữa các mạng như thế nào.

Với cơ chế routing, nhiều mạng có thể có một luồng dữ liệu hai chiều qua các node router. Để điều này xảy ra, bên trong mỗi LAN nên có một node router. Do đó, khi bạn muốn gửi dữ liệu tới một máy tính nằm ở một khu vực địa lý khác, có thể dữ liệu của bạn đang được truyền qua hàng chục router trước khi đến đích. Tôi sẽ không đi xa hơn thế này vào khái niệm routing, nhưng có vô số thông tin tuyệt vời về cơ chế này trên web.

> **Lưu ý**:
>
> Có một chương trình tiện ích gọi là *traceroute* cho phép bạn thấy các router giữa máy tính của bạn và máy tính đích.

Ở điểm này, hai host từ hai LAN khác nhau có thể được kết nối với nhau, có hoặc không có các LAN trung gian ở giữa. Mọi nỗ lực tiếp theo để tạo các kết nối cụ thể hơn nên được thực hiện trên tầng này. Do đó, mọi giao tiếp xảy ra giữa hai chương trình, nằm trên hai node khác nhau, phải diễn ra trên một chồng ba tầng giao thức: physical layer, link layer và cuối cùng là network layer. Nhưng chính xác thì điều đó có nghĩa là gì khi chúng ta nói rằng hai máy tính được kết nối với nhau?

Nói rằng hai node được kết nối thì hơi mơ hồ, ít nhất là với lập trình viên. Chính xác hơn, các hệ điều hành của những node này được kết nối với nhau, và chúng là các tác nhân truyền dữ liệu. Khả năng tham gia một mạng và nói chuyện với các node khác trong cùng LAN hay trong một LAN khác được mã hóa sẵn một cách nội tại trong hầu hết các hệ điều hành hiện tại. Các hệ điều hành Unix-based, vốn là trọng tâm chính của chúng ta trong cuốn sách này, đều là các hệ điều hành hỗ trợ mạng, và chúng có thể được cài đặt trên các node tham gia một mạng.

Linux, Microsoft Windows, và gần như mọi hệ điều hành hiện đại đều hỗ trợ mạng. Thật vậy, khó có khả năng một hệ điều hành có thể tồn tại nếu nó không thể hoạt động trong một mạng. Lưu ý rằng chính kernel, hay chính xác hơn là một đơn vị bên trong kernel, quản lý các kết nối mạng và, do đó, chính xác hơn khi nói rằng chức năng mạng thực sự được cung cấp bởi kernel.

Vì chức năng mạng được cung cấp bởi kernel, bất kỳ process nào trong user space cũng có thể hưởng lợi từ đó, và nó có thể được kết nối với một process khác nằm trên một node khác trong mạng. Là một lập trình viên, bạn không cần lo lắng về các tầng (physical, link và network layer) được kernel vận hành, và bạn có thể tập trung vào các tầng phía trên chúng, những tầng liên quan đến code của bạn.

Mỗi node trong một mạng IP có một IP address. Như chúng tôi đã nói trước đây, chúng ta có hai phiên bản IP<a id="_idIndexMarker1378"></a> address: **IP version 4** (**IPv4**) và **IP version 6** (**IPv6**). Một IPv4 address gồm bốn đoạn, mỗi đoạn có thể giữ một giá trị số từ 0 đến 255. Do đó, các IPv4<a id="_idIndexMarker1379"></a> address bắt đầu từ `0.0.0.0` và đi lên đến `255.255.255.255`. Như bạn có thể thấy, chúng ta chỉ cần 4 byte (hay 32 bit) để lưu <a id="_idIndexMarker1380"></a>một IPv4 address. Đối với IPv6 address, con số này lên tới 16 byte (hay 128 bit). Ngoài ra, chúng ta có IP address private và public, nhưng chi tiết nằm ngoài chủ đề của chương này rất xa. Chúng ta chỉ cần biết rằng mỗi node trong một mạng IP có một IP address độc nhất là đủ.

Dựa trên phần trước, trong một LAN duy nhất, mỗi node có một link layer address cùng với một IP address, nhưng chúng ta sẽ dùng IP address để tạo kết nối tới node đó chứ không phải link layer address. Ví dụ, trong một Ethernet LAN, mỗi node có hai address; một là MAC address và cái kia là IP address. MAC address được các link layer protocol dùng để truyền dữ liệu bên trong LAN, và IP address được các chương trình nằm trên các node khác nhau dùng để tạo các kết nối mạng hoặc bên trong cùng LAN hoặc qua một số LAN.

Chức năng chính của network layer là kết nối hai hay nhiều LAN. Điều này rốt cuộc sẽ dẫn đến một mạng lưới lớn các mạng được kết nối với nhau, và chúng tạo thành một mạng khổng lồ với nhiều mạng LAN riêng lẻ bên trong nó. Thực tế, một mạng như vậy tồn tại, và chúng ta biết nó là internet.

Giống như bất kỳ mạng nào khác, mỗi node có thể truy cập được trên internet đều phải có một IP address. Nhưng khác biệt chính giữa một node có thể truy cập được trên internet và một node không thể là một node internet phải có một public IP address, trong khi một node không thể truy cập qua internet thường có một private address.

Để đưa ra một ví dụ, mạng gia đình của bạn có thể được kết nối với internet, nhưng một node bên ngoài trên internet không thể kết nối tới laptop của bạn vì laptop của bạn có một private IP address chứ không phải một public IP address. Trong khi laptop của bạn vẫn có thể truy cập được bên trong mạng gia đình, nó không có sẵn trên internet. Do đó, nếu phần mềm của bạn sẽ có sẵn trên internet, nó nên được chạy trên một máy có một public IP address.

Có một lượng thông tin khổng lồ về mạng IP, và chúng ta sẽ không trình bày tất cả, nhưng là một lập trình viên, điều quan trọng là biết sự khác biệt giữa private address và public address.

Khi ở trong một mạng, việc bảo đảm kết nối giữa các node không phải là trách nhiệm của lập trình viên; nhưng việc có thể phát hiện các lỗi mạng được coi là một phần bộ kỹ năng của bạn. Điều này rất quan trọng vì nó có thể cho bạn biết một bug hay hành vi sai có gốc rễ trong code của bạn, hay đó là một vấn đề hạ tầng (hay mạng). Đó là lý do tại sao chúng ta phải đề cập thêm một số khái niệm và công cụ ở đây.

Công cụ cơ bản bảo đảm <a id="_idIndexMarker1381"></a>rằng hai host (node), dù trong cùng LAN hay nằm trên các LAN khác nhau, có khả năng truyền dữ liệu, hay chúng có thể "thấy" nhau, là công cụ *ping*. Bạn có thể đã biết về nó. Nó gửi một<a id="_idIndexMarker1382"></a> số packet **Internet Control Message Protocol** (**ICMP**) mà, nếu một câu trả lời được gửi lại, có nghĩa là host kia đang hoạt động, được kết nối và đang phản hồi.

> **Lưu ý**:
>
> ICMP là một network layer protocol khác chủ yếu được dùng để giám sát và quản lý các mạng IP-based trong trường hợp có các vấn đề và sự cố về kết nối hay chất lượng dịch vụ.

Giả sử bạn sẽ kiểm tra xem máy tính của bạn có thể thấy public IP address `8.8.8.8` không (điều mà nó nên thấy nếu được kết nối với internet). Các lệnh sau sẽ giúp bạn kiểm tra kết nối:

```
$ ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8): 56 data bytes
64 bytes from 8.8.8.8: icmp_seq=0 ttl=123 time=12.190 ms
64 bytes from 8.8.8.8: icmp_seq=1 ttl=123 time=25.254 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=123 time=15.478 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=123 time=22.287 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=123 time=21.029 ms
64 bytes from 8.8.8.8: icmp_seq=5 ttl=123 time=28.806 ms
64 bytes from 8.8.8.8: icmp_seq=6 ttl=123 time=20.324 ms
^C
--- 8.8.8.8 ping statistics ---
7 packets transmitted, 7 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 12.190/20.767/28.806/5.194 ms
$
```

*Shell Box 19-6: Dùng tiện ích ping để kiểm tra kết nối tới internet*

Như bạn có thể thấy trong output, nó nói rằng nó đã gửi 7 packet ICMP ping và không packet nào bị mất trong quá trình<a id="_idIndexMarker1383"></a> truyền. Điều này có nghĩa là hệ điều hành đằng sau IP address `8.8.8.8` đang hoạt động và phản hồi.

> **Lưu ý**:
>
> Public IP address `8.8.8.8` chỉ dịch vụ Google Public DNS. Có thể <a id="_idIndexMarker1384"></a>đọc thêm tại đây: https://en.wikipedia.org/wiki/Google_Public_DNS.

Trong phần này, chúng tôi đã giải thích hai máy tính có thể được kết nối qua một mạng như thế nào. Giờ, chúng ta đang tiến gần đến điểm mà hai process thực sự có thể được kết nối với nhau và truyền dữ liệu qua một số LAN. Cho mục đích này, chúng ta cần một tầng khác trên network layer. Đó là nơi lập trình mạng bắt đầu.

<a id="_idParaDest-278"></a>

#### Transport layer (tầng vận chuyển)

Cho đến giờ, chúng ta đã thấy rằng hai <a id="_idIndexMarker1385"></a>máy tính có thể được kết nối với nhau qua một chồng ba tầng: physical layer, link layer và network layer. Đối với giao tiếp inter-process, chúng ta thực sự cần hai process được kết nối và nói chuyện với nhau. Nhưng với hai máy tính được kết nối qua ba tầng này, chúng ta có thể có nhiều process chạy trên mỗi máy, và bất kỳ process nào chạy trên máy thứ nhất cũng có thể muốn thiết lập một kết nối với một process khác nằm trên máy thứ hai. Do đó, việc có một kết nối chỉ dựa trên network layer là quá chung chung để hỗ trợ nhiều kết nối riêng biệt được khởi tạo bởi các process khác nhau.

Đó là lý do tại sao chúng ta cần một tầng khác trên network layer. *Transport layer* có mặt ở đó để đáp ứng nhu cầu này. Trong khi các host được kết nối qua network layer, các process chạy trên những host đó có thể được kết nối qua transport layer được thiết lập trên network layer. Giống như bất kỳ tầng nào khác có các định danh độc nhất hay address độc nhất riêng, tầng này có một khái niệm mới làm định danh độc nhất của nó, thường được biết đến là một *port*. Chúng tôi sẽ giải thích thêm về điều này trong các phần sắp tới, nhưng trước đó, chúng tôi phải giải thích mô hình *listener-connector*, vốn cho phép hai bên giao tiếp qua một channel. Trong phần tiếp theo, chúng tôi bắt đầu giải thích mô hình này bằng cách đưa ra một phép so sánh giữa mạng máy tính và mạng điện thoại.

##### Phép so sánh với mạng điện thoại

Ví dụ tốt nhất để bắt đầu<a id="_idIndexMarker1386"></a> là **Public Switched Telephone Network** (hay **PSTN**). Dù sự tương đồng giữa mạng máy tính và mạng điện thoại <a id="_idIndexMarker1387"></a>có thể không có vẻ hứa hẹn lắm, có những điểm tương đồng mạnh mẽ cho phép chúng ta giải thích transport layer một cách hợp lý.

Trong phép so sánh của chúng ta, những người dùng mạng điện thoại giống như các process trong một mạng máy tính. Do đó, một cuộc gọi điện thoại tương đương với một *transport connection*. Mọi người chỉ có thể thực hiện cuộc gọi nếu hạ tầng cần thiết đã được lắp đặt. Điều này tương tự hạ tầng mạng nên có sẵn để cho phép các process giao tiếp.

Chúng ta giả định rằng hạ tầng bên dưới cần thiết đã có sẵn và nó hoạt động hoàn hảo và, dựa trên đó, chúng ta muốn có hai thực thể nằm trong những hệ thống này tạo một channel và truyền dữ liệu. Điều này tương tự hai người trong PSTN và hai process nằm trên hai host khác nhau trong một mạng máy tính.

Bất kỳ ai muốn dùng PSTN đều cần có một thiết bị điện thoại. Điều này tương tự yêu cầu có một NIC cho một node máy tính. Trên những thiết bị này, có nhiều tầng gồm các giao thức khác nhau. Những tầng xây dựng nên hạ tầng bên dưới này làm cho việc tạo một transport channel trở nên khả thi.

Giờ, trong PSTN, một trong các thiết bị điện thoại được kết nối với PSTN chờ cho đến khi nó nhận được một cuộc gọi. Chúng ta gọi đây là phía *listener* (bên lắng nghe). Lưu ý rằng một thiết bị điện thoại được cắm vào PSTN luôn chờ một tín hiệu gọi từ mạng và, ngay khi nhận được tín hiệu, nó đổ chuông.

Giờ, hãy nói về phía kia, phía thực hiện cuộc gọi. Lưu ý rằng việc thực hiện một cuộc gọi tương đương với việc tạo một transport channel. Phía kia cũng có một thiết bị điện thoại được dùng để thực hiện cuộc gọi. Listener có thể được truy cập qua một số điện thoại, có thể được coi là address của listener. Phía *connector* (bên kết nối) phải biết số điện thoại này để thực hiện cuộc gọi. Do đó, connector quay số điện thoại của listener và hạ tầng bên dưới cho listener biết rằng có một cuộc gọi đến.

Khi phía listener trả lời điện thoại, nó chấp nhận kết nối đến và một channel được thiết lập giữa listener và connector. Từ giờ trở đi, việc nói chuyện và tiếp tục cuộc thảo luận qua channel PSTN đã tạo tùy thuộc vào những người ngồi ở mỗi đầu. Lưu ý rằng nếu một trong các bên không thể hiểu ngôn ngữ của bên kia, việc giao tiếp không thể tiếp tục và một trong các bên gác máy, và channel sẽ bị hủy.

##### Giao tiếp transport Connection-less so với connection-oriented

Phép so sánh trên cố gắng giải thích giao tiếp transport trong một mạng máy tính nhưng, thực tế, nó mô tả *giao tiếp connection-oriented* (hướng kết nối). Ở đây, chúng tôi sẽ giới thiệu và mô tả một loại giao tiếp khác: *giao tiếp connection-less* (không kết nối). Nhưng trước đó, hãy xem xét sâu hơn giao tiếp connection-oriented.

Trong giao tiếp connection-oriented<a id="_idIndexMarker1389"></a>, một channel cụ thể và riêng được tạo ra cho một connector. Do đó, nếu chúng ta có một listener giao tiếp với ba connector, chúng ta có ba channel riêng. Không quan trọng thông điệp được truyền lớn đến đâu, thông điệp sẽ đến bên kia ở dạng đúng mà không mất mát gì bên trong channel. Nếu nhiều thông điệp được gửi tới cùng một vị trí, thứ tự của các thông điệp đã gửi được bảo toàn, và process nhận sẽ không nhận thấy bất kỳ xáo trộn nào trong hạ tầng bên dưới.

Như chúng tôi đã giải thích trong các phần trước, mọi thông điệp luôn được chia thành các khối nhỏ hơn gọi là packet khi được truyền qua một mạng máy tính. Tuy nhiên, trong một sơ đồ connection-oriented, không bên nào, cả listener lẫn connector, sẽ nhận thấy bất cứ điều gì về *packet switching* bên dưới. Ngay cả khi các packet đã gửi được nhận theo một thứ tự khác, hệ điều hành của bên nhận sẽ sắp xếp lại các packet để tái tạo thông điệp ở dạng thực của nó, và process nhận sẽ không nhận thấy gì.

Hơn thế nữa, nếu một trong các packet bị mất trong khi truyền, hệ điều hành của bên nhận sẽ yêu cầu nó lần nữa để khôi phục toàn bộ thông điệp. Ví dụ, **Transport Control Protocol** (**TCP**) là một giao thức transport <a id="_idIndexMarker1390"></a>layer hoạt động chính xác như chúng tôi đã giải thích ở trên. Do đó, các TCP channel là connection-oriented.

Cùng với các channel connection-oriented, chúng ta cũng có giao tiếp connection-less. Trong giao tiếp connection-oriented, chúng ta bảo đảm hai yếu tố: việc *chuyển giao* (delivery) các packet riêng lẻ, và *trình tự* (sequence) của các packet. Một giao thức transport connection-oriented như TCP bảo toàn đồng thời những yếu tố này. Ngược lại, một giao thức transport connection-less không bảo đảm chúng.

Nói cách khác, bạn có thể không có sự bảo đảm nào cho việc chuyển giao các packet riêng lẻ mà thông điệp được chia thành, hay bạn có thể không có sự bảo đảm rằng mọi packet sẽ theo đúng thứ tự. Hay bạn có thể không có cả hai! Chẳng <a id="_idIndexMarker1391"></a>hạn, **User Datagram Protocol** (**UDP**) không bảo đảm việc chuyển giao packet hay thứ tự của các packet. Lưu ý rằng sự bảo đảm tính đúng đắn của nội dung một packet riêng lẻ được cung cấp bởi giao thức ở network layer và link layer.

Giờ là lúc giải thích hai <a id="_idIndexMarker1392"></a>thuật ngữ thường được dùng trong lập trình mạng. *Stream* là chuỗi byte được truyền qua một channel connection-oriented. Điều này có nghĩa là việc truyền connection-less thực chất không cung cấp một stream dữ liệu. Chúng ta có một thuật ngữ cụ thể cho một đơn vị dữ liệu được truyền qua một channel connection-less. Chúng ta gọi nó là một *datagram*. Một datagram là một mẩu dữ liệu có thể được chuyển giao trọn vẹn trong một channel connection-less. Bất kỳ mẩu dữ liệu nào lớn hơn kích thước datagram tối đa đều không thể được chuyển giao chắc chắn hoặc trình tự cuối cùng có thể sai. Datagram là một khái niệm được định nghĩa trong transport layer, và nó là khái niệm tương ứng với packet trong network layer.

Chẳng hạn, đối với các UDP packet, có sự bảo đảm rằng mỗi UDP datagram (packet) riêng lẻ được truyền đúng, nhưng không thể nói gì thêm về mối tương quan giữa hai datagram (packet) kề nhau. Người ta chấp nhận rằng không có tính toàn vẹn nào nên tồn tại vượt ra ngoài một UDP datagram, nhưng điều này không đúng với TCP. Trong TCP, nhờ sự bảo đảm chuyển giao và bảo toàn trình tự của các packet đã gửi, chúng ta có thể gạt các packet riêng lẻ sang một bên và nhìn nó như một stream byte đang được truyền giữa hai process.

##### Các trình tự khởi tạo transport

Trong tiểu mục này, chúng ta<a id="_idIndexMarker1393"></a> sẽ nói về các bước mà mỗi process thực hiện để thiết lập một giao tiếp transport. Chúng ta có các trình tự khác nhau cho các sơ đồ connection-oriented và connection-less, nên chúng ta sẽ nói về chúng riêng rẽ trong hai tiểu mục tiếp theo. Lưu ý rằng khác biệt chỉ xuất hiện trong việc khởi tạo channel, và sau đó, cả hai bên sẽ dùng ít nhiều cùng API để đọc từ và ghi vào channel đã tạo.

Process listener luôn *bind* một endpoint (thường là một IP address cùng với một port) và process connector luôn *connect* tới endpoint đó. Điều này bất kể đó là một channel connection-oriented hay connection-less.

Lưu ý rằng trong các trình tự sau, chúng ta đã giả định rằng có một mạng IP được thiết lập giữa các máy tính chứa process listener và process connector.

##### Các trình tự khởi tạo Connection-less

Để thiết lập một <a id="_idIndexMarker1394"></a>channel giao tiếp connection-less, process listener sẽ làm những điều sau:

1. Process listener bind một port trên một trong các NIC hiện có, hay thậm chí tất cả chúng. Điều này có nghĩa là process listener yêu cầu hệ điều hành host của nó chuyển hướng dữ liệu đến tới port đó và, do đó, tới process listener. Port đơn giản là một số từ 0 đến 65535 (2 byte) và không được đã bị bind bởi một process listener khác. Cố bind một port đã được dùng dẫn đến một lỗi. Lưu ý rằng trong trường hợp bind một port trên một NIC cụ thể, hệ điều hành sẽ chuyển hướng mọi packet đến nhắm tới port đã bind đó và được nhận trên NIC cụ thể đó tới process listener.

1. Process chờ và đọc các thông điệp trở nên sẵn có trên channel đã tạo và phản hồi chúng bằng cách ghi lại vào channel.

Và process connector sẽ làm những điều sau:

1. Nó phải biết IP address và số port của process listener. Do đó, nó cố kết nối tới phía listener bằng cách cung cấp IP address và số port cho hệ điều hành host của nó. Nếu process đích không đang lắng nghe trên port được chỉ định, hay IP address trỏ tới một host không hợp lệ hay sai, kết nối sẽ thất bại.

1. Khi kết nối được thiết lập thành công, process connector có thể ghi vào channel và đọc từ nó theo gần như cùng một cách, nghĩa là cùng API mà process listener dùng.

Lưu ý rằng ngoài việc thực hiện các bước trên, process listener và process connector đều nên dùng cùng một giao thức transport, nếu không các thông điệp không thể được đọc và hiểu bởi các hệ điều hành host của chúng.

##### Các trình tự khởi tạo Connection-oriented

Trong một kịch bản connection-oriented, process listener <a id="_idIndexMarker1395"></a>sẽ theo trình tự sau để được khởi tạo:

1. Bind một port, giống như kịch bản connection-less đã giải thích trước đó. Port chính xác như đã giải thích trong phần trước và nó tuân theo cùng các ràng buộc.
2. Process listener tiếp tục bằng việc cấu hình kích thước *backlog* của nó. Backlog là một hàng đợi các kết nối đang chờ chưa được process listener chấp nhận. Trong giao tiếp connection-oriented, phía listener nên chấp nhận các kết nối đến trước khi có thể truyền bất kỳ dữ liệu nào. Sau khi cấu hình backlog, process listener đi vào *listening mode* (chế độ lắng nghe).

1. Giờ, process listener bắt đầu *accept* (chấp nhận) các kết nối đến. Đây là một bước thiết yếu trong việc thiết lập một transport channel. Chỉ sau khi chấp nhận một kết nối đến, chúng mới có thể truyền dữ liệu. Lưu ý rằng nếu process connector gửi một kết nối tới process listener, nhưng process listener không thể chấp nhận kết nối đó, nó sẽ vẫn ở trong backlog cho đến khi nó hoặc được chấp nhận hoặc *timed out* (hết thời gian chờ). Điều này có thể xảy ra khi process listener quá bận với các<a id="_idIndexMarker1396"></a> kết nối khác và nó không thể chấp nhận thêm kết nối mới nào. Khi đó, các kết nối đến sẽ chất đống trong backlog và khi backlog đầy, các kết nối mới sẽ bị hệ điều hành host từ chối ngay lập tức.

Trình tự của process connector rất giống những gì chúng tôi đã giải thích cho giao tiếp connection-less trong phần trước. Connector kết nối tới một endpoint nhất định bằng cách cung cấp IP address và port, và sau khi được process listener chấp nhận, nó có thể dùng cùng API để đọc từ và ghi vào channel connection-oriented.

Vì channel được thiết lập là connection-oriented, process listener có một channel riêng tới phía connector; do đó, chúng có thể trao đổi một stream byte không có giới hạn trên về số byte. Do đó, hai process có thể truyền một lượng dữ liệu khổng lồ, và tính đúng đắn của nó được bảo đảm bởi các giao thức transport và network chi phối.

Lưu ý cuối cùng về transport layer, chúng tôi đã đề cập rằng các process listener (bất kể channel bên dưới là connection-oriented hay connection-less) đều cần bind một endpoint. Riêng đối với UDP và TCP, endpoint này được tạo nên từ một IP address và một số port.

<a id="_idParaDest-279"></a>

#### Application layer (tầng ứng dụng)

Khi một transport<a id="_idIndexMarker1397"></a> channel được thiết lập giữa hai process nằm ở hai đầu khác nhau, chúng nên có thể nói chuyện với nhau. Với nói chuyện, chúng tôi muốn nói việc truyền một chuỗi byte mà cả hai đầu đều có thể hiểu. Như chúng tôi đã giải thích trong các phần trước của chương này, một communication protocol là cần thiết ở đây. Vì giao thức này nằm trong *application layer* và nó được các process (hay các ứng dụng chạy dưới dạng process) dùng, nó được gọi là một *application protocol*.

Trong khi không có nhiều giao thức được dùng trong các tầng link, network và transport và chúng hầu hết là well-known, chúng ta có vô số application protocol được dùng trong application layer. Điều này một lần nữa tương tự các mạng viễn thông. Trong khi không có nhiều chuẩn cho mạng điện thoại, số lượng ngôn ngữ mà mọi người dùng để giao tiếp rất lớn, và chúng khác nhau rất nhiều. Trong mạng máy tính, mọi ứng dụng chạy dưới dạng một process đều cần dùng một application protocol để giao tiếp với một process khác.

Do đó, các lập trình viên hoặc dùng một application protocol well-known như HTTP hay FTP hoặc họ phải dùng một application protocol tùy chỉnh được thiết kế và xây dựng nội bộ trong một nhóm.

Cho đến giờ, chúng ta đã thảo luận năm tầng; physical, link, network, transport và application. Giờ là lúc đặt tất cả chúng vào một thể thống nhất và dùng nó làm tham chiếu để thiết kế và triển khai mạng máy tính. Trong phần sau, chúng ta nói về internet protocol suite.

<a id="_idParaDest-280"></a>

#### Internet protocol suite

Mô hình mạng mà chúng ta thấy mỗi<a id="_idIndexMarker1398"></a> ngày và được áp dụng rộng rãi là **Internet Protocol Suite** (**IPS**). IPS chủ yếu được dùng trên internet, và vì gần như mọi máy tính đều muốn truy cập internet, chúng đã chấp nhận dùng IPS một cách phổ quát, dù nó không phải là chuẩn chính thức được ISO phê duyệt. Mô hình chuẩn cho mạng máy tính<a id="_idIndexMarker1399"></a> là mô hình **Open System Interconnections** (**OSI**), vốn mang tính lý thuyết hơn và gần như không bao giờ được triển khai và dùng công khai. IPS có các tầng sau. Lưu ý rằng các giao thức nổi bật trong mỗi tầng được đề cập trong danh sách sau:

- Physical layer
- Link layer: Ethernet, IEEE 802.11 Wi-Fi
- Internet layer: IPv4, IPv6 và ICMP
- Transport layer: TCP, UDP
- Application layer: Vô số giao thức như HTTP, FTP, DNS và DHCP, v.v.

Như bạn có thể thấy, các tầng có một sự tương ứng đẹp với các tầng mà chúng ta đã thảo luận trong chương này, nhưng chỉ với một ngoại lệ; network layer được đổi tên thành internet layer. Đó là vì trong IPS, các network protocol nổi bật trong tầng này chỉ là IPv4 và IPv6. Phần còn lại của các giải thích có thể được áp dụng cho các tầng IPS. IPS là mô hình chính mà chúng ta sẽ làm việc trong suốt cuốn sách này và trong môi trường làm việc thực tế.

Giờ chúng ta đã biết mạng máy tính hoạt động như thế nào, chúng ta đang ở vị trí tốt để tiếp tục và xem *socket programming* là gì. Trong phần còn lại của chương này và chương sắp tới, bạn sẽ thấy rằng có một sự tương ứng sâu sắc giữa các khái niệm được thảo luận trong transport layer và các khái niệm chúng ta có trong socket programming.

<a id="_idParaDest-281"></a>

### Socket programming là gì?

Giờ<a id="_idIndexMarker1400"></a> chúng ta đã biết về mô hình IPS và các tầng mạng khác nhau, việc giải thích socket programming là gì dễ hơn nhiều. Trước khi đi sâu vào các thảo luận kỹ thuật về socket programming, chúng ta nên định nghĩa nó là một kỹ thuật IPC cho phép chúng ta kết nối hai process nằm trên cùng một node hoặc trên hai node khác nhau có kết nối mạng giữa chúng. Nếu chúng ta gạt socket programming single-host sang một bên, dạng còn lại đòi hỏi chúng ta có một mạng đang hoạt động giữa hai node. Chính thực tế này gắn socket programming với mạng máy tính và mọi thứ chúng tôi đã giải thích cho đến giờ.

Để mang tính kỹ thuật hơn, chúng ta nên nói rằng socket programming chủ yếu diễn ra trong transport layer. Như chúng tôi đã nói, transport layer chịu trách nhiệm kết nối hai process qua một internet layer (network layer) hiện có. Do đó, transport layer là tầng then chốt để thiết lập một ngữ cảnh socket programming. Về cơ bản, đó là lý do tại sao bạn với tư cách lập trình viên nên biết thêm về transport layer và các giao thức khác nhau của nó. Một số bug socket programming-related có nguồn gốc từ transport channel bên dưới.

Trong socket programming, socket là công cụ chính để thiết lập một transport channel. Lưu ý rằng bất chấp những gì chúng ta đã thảo luận cho đến giờ, socket programming có thể vượt ra ngoài transport layer hay *process-to-process communication* và nó cũng có thể bao gồm internet layer (network layer) hay *host-to-host communication*. Điều này có nghĩa là chúng ta có thể có các socket internet-layer-specific cũng như các socket transport layer. Với điều này trong đầu, hầu hết các socket mà chúng ta thấy và làm việc là transport socket và trong phần còn lại của chương này và chương tiếp theo, chúng ta sẽ chủ yếu nói về transport socket.

<a id="_idParaDest-282"></a>

#### Socket là gì?

Như chúng tôi đã<a id="_idIndexMarker1401"></a> giải thích trong phần trước, transport layer là nơi socket programming thực sự diễn ra. Mọi thứ trên nó chỉ làm cho socket programming cụ thể hơn; tuy nhiên, channel bên dưới thực sự đã được thiết lập trong transport layer.

Chúng ta cũng đã thảo luận rằng kết nối internet (kết nối mạng) mà transport channel được thiết lập trên đó thực ra là kết nối giữa các hệ điều hành, hay cụ thể hơn là các kernel của những hệ điều hành đó. Do đó, phải có một khái niệm trong kernel đại diện cho một kết nối. Hơn thế nữa, có thể có nhiều kết nối được thiết lập, được khởi tạo hay được chấp nhận bởi cùng một kernel đơn giản vì có thể có nhiều process đang chạy và được host trong hệ điều hành đó và muốn có kết nối mạng.

Khái niệm mà chúng ta đang tìm kiếm là *socket*. Với mọi kết nối đã được thiết lập hay soon-to-be-established (sắp được thiết lập) trong một hệ thống, có một socket riêng định danh kết nối đó. Với một kết nối duy nhất được tạo giữa hai process, có đúng một socket ở mỗi bên chỉ cùng một kết nối. Như chúng tôi đã giải thích trước đây, một trong những socket này thuộc về phía connector và socket kia thuộc về phía listener. API cho phép chúng ta định nghĩa và quản lý một đối tượng socket được mô tả bởi *socket library* được hệ điều hành phơi ra.

Vì chúng ta chủ yếu đang nói về các hệ thống POSIX, chúng ta kỳ vọng có một socket library như vậy như một phần của POSIX API và, thực tế, chúng ta có một library như vậy. Trong phần còn lại của chương này, chúng ta thảo luận *POSIX socket library* và chúng tôi giải thích nó có thể được dùng như thế nào để thiết lập một kết nối giữa hai process.

<a id="_idParaDest-283"></a>

#### POSIX socket library

Mọi đối tượng socket<a id="_idIndexMarker1403"></a> có ba attribute: *domain*, *type* và *protocol*. Trong khi các trang manual của một hệ điều hành giải thích những attribute này rất tốt, chúng tôi muốn nói về một số giá trị thường được dùng cho những attribute này. Chúng ta bắt đầu với attribute domain, còn được biết đến là **address family** (**AF**) hay **protocol family** (**PF**). Một số giá trị được dùng rộng rãi có thể được thấy trong danh sách sau. Lưu ý rằng những address family này hỗ trợ cả kết nối transport connection-oriented lẫn connection-less.

- `AF_LOCAL` hay `AF_UNIX`: Đây là các local socket, chỉ hoạt động khi cả process connector lẫn listener<a id="_idIndexMarker1404"></a> đều<a id="_idIndexMarker1405"></a> nằm trên cùng một host.
- `AF_INET`: Những<a id="_idIndexMarker1406"></a> socket này cho phép hai process kết nối với nhau qua một kết nối IPv4.
- `AF_INET6`: Những<a id="_idIndexMarker1407"></a> socket này cho phép hai process kết nối với nhau qua một kết nối IPv6.

> **Lưu ý**:
>
> Trong một số hệ thống POSIX, trong các hằng được dùng cho attribute domain, bạn có thể thấy tiền tố `PF_` thay vì `AF_`. Thường thì các hằng `AF_` có cùng giá trị như các hằng `PF_`, nên chúng có thể được dùng thay thế cho nhau.

Trong chương tiếp theo, chúng tôi sẽ minh họa cách dùng các domain `AF_UNIX` và `AF_INET`, nhưng sẽ dễ dàng tìm thấy các ví dụ dùng domain `AF_INET6`. Ngoài ra, có thể có các address family đặc thù cho một hệ điều hành nhất định và không thể tìm thấy trên các hệ thống khác.

Các giá trị well-known nhất cho attribute type của một đối tượng socket như sau:

- `SOCK_STREAM`: Điều này có nghĩa là<a id="_idIndexMarker1409"></a> socket sẽ biểu diễn một giao tiếp transport connection-oriented bảo đảm việc chuyển giao, tính đúng đắn và thứ tự của nội dung đã gửi. Như chúng tôi đã giải thích stream trong các phần trước, thuật ngữ `STREAM` cũng gợi ý điều này. Lưu ý rằng, ở điểm này, bạn không thể dự đoán rằng giao thức transport bên dưới thực sự là TCP vì điều này không đúng với các local socket thuộc address family `AF_UNIX`.

- `SOCK_DGRAM`: Điều này có nghĩa là socket sẽ biểu diễn một giao tiếp transport connection-less. Lưu ý rằng <a id="_idIndexMarker1410"></a>thuật ngữ datagram, viết tắt là `DGRAM`, như chúng tôi đã giải thích trong các phần trước, chỉ một chuỗi byte không thể được xem như một stream. Thay vào đó, chúng có thể được xem như một số khối dữ liệu riêng lẻ được gọi là datagram. Trong một ngữ cảnh kỹ thuật hơn, một datagram biểu diễn một packet dữ liệu được truyền qua một mạng.

- `SOCK_RAW`: Một raw socket có thể <a id="_idIndexMarker1411"></a>biểu diễn cả channel connection-oriented lẫn connection-less. Khác biệt chính giữa `SOCK_RAW` và `SOCK_DGRAM` hay `SOCK_STREAM` là kernel thực sự biết về giao thức transport bên dưới được dùng (UDP hay TCP) và nó có thể phân tích một packet và trích xuất header và nội dung. Nhưng với một raw socket, nó không làm như vậy, và việc đọc và trích xuất các phần khác nhau tùy thuộc vào chương trình đã mở socket.

  Nói cách khác, khi dùng `SOCK_RAW`, các packet được chuyển giao trực tiếp tới chương trình và nó nên tự trích xuất và hiểu cấu trúc packet. Lưu ý rằng nếu channel bên dưới là một stream channel (connection-oriented), việc khôi phục các packet bị mất và sắp xếp lại packet không được kernel thực hiện, và chương trình nên tự làm chúng. Điều này ngụ ý rằng việc khôi phục và sắp xếp lại packet thực sự được kernel thực hiện khi bạn chọn TCP làm giao thức transport của mình.

Attribute thứ ba, protocol, định danh giao thức nên được dùng cho đối tượng socket. Vì hầu hết các address family, cùng với type, xác định một giao thức nhất định, attribute này có thể được hệ điều hành chọn khi tạo socket. Trong những hoàn cảnh mà chúng ta có nhiều giao thức khả dĩ, attribute này nên được định nghĩa.

Socket programming cung cấp giải pháp cho cả IPC single-host lẫn multiple-host. Nói cách khác, trong khi hoàn toàn có thể kết nối hai process nằm trên hai host khác nhau và trong hai LAN khác nhau bằng internet socket (network socket), cũng hoàn toàn có thể kết nối hai process nằm trên cùng một host bằng Unix domain socket.

Lưu ý cuối cùng trong phần này, chúng ta nên thêm rằng các kết nối socket là hai chiều và full-duplex. Điều này có nghĩa là cả hai bên đều có thể đọc từ và ghi vào channel bên dưới mà không ảnh hưởng đến đầu kia. Đây là một tính năng đáng mong muốn vì nó thường là một yêu cầu trong hầu hết các kịch bản IPC-related.

Giờ bạn đã được giới thiệu khái niệm socket, chúng ta phải xem lại các trình tự mà chúng tôi đã giải thích trong các phần trước về các process listener và connector. Nhưng lần này, chúng ta đi sâu vào chi tiết hơn và mô tả socket có thể được dùng như thế nào để thực hiện những trình tự này.

##### Xem lại các trình tự listener-connector

Như chúng tôi đã đề cập trước đây, <a id="_idIndexMarker1412"></a>trong mạng máy tính, trong gần như mọi kết nối, một trong các đầu luôn lắng nghe các kết nối đến, và đầu kia cố kết nối tới phía listener. Chúng ta cũng đã thảo luận một ví dụ về mạng điện thoại, giải thích cách một điện thoại được dùng để lắng nghe một cuộc gọi đến, và cách nó có thể được dùng để thực hiện cuộc gọi và kết nối tới các thiết bị đang lắng nghe khác. Một tình huống tương tự tồn tại trong socket programming. Ở đây, chúng ta muốn khám phá các trình tự nên được các process ở hai đầu khác nhau tuân theo để thiết lập một kết nối transport thành công.

Trong các tiểu mục sau, chúng ta sẽ đi sâu hơn vào chi tiết việc tạo socket và các thao tác khác nhau nên được thực hiện bởi cả hai process muốn tham gia một kết nối. Các trình tự được giải thích trong các tiểu mục sau cho các process listener và connector không phụ thuộc hạ tầng và hưởng lợi từ sự tổng quát hóa mà socket programming cung cấp trên các kết nối transport bên dưới khác nhau.

Như bạn hẳn còn nhớ, chúng ta đã thảo luận các trình tự listener và connector đối với giao tiếp connection-oriented và connection-less một cách riêng rẽ. Chúng ta chọn cùng cách tiếp cận ở đây, và trước tiên chúng ta bắt đầu với trình tự stream listener (connection-oriented).

###### Trình tự stream listener

Các bước sau <a id="_idIndexMarker1413"></a>nên được tuân theo bởi một<a id="_idIndexMarker1414"></a> process muốn lắng nghe các kết nối stream mới. Bạn đã được giới thiệu các giai đoạn binding, listening và accepting trong các phần trước, nhưng ở đây chúng ta sẽ nói về chúng từ góc nhìn socket programming. Lưu ý rằng hầu hết chức năng thực sự được kernel cung cấp và process chỉ cần gọi đúng các hàm từ socket library để đặt chính nó vào listening mode:

1. Process nên tạo một đối tượng socket bằng hàm `socket`. Đối tượng socket này thường được gọi là một *listener socket*. Đối tượng socket biểu diễn toàn bộ process listener, và nó sẽ được dùng để chấp nhận các kết nối mới. Tùy theo channel bên dưới, các argument được gửi cho hàm `socket` có thể khác nhau. Chúng ta có thể truyền hoặc `AF_UNIX` hoặc `AF_INET` làm address family của socket, nhưng chúng ta phải dùng `SOCK_STREAM` làm type của socket vì chúng ta sẽ có một stream channel. Attribute protocol của đối tượng socket có thể được hệ điều hành xác định. Ví dụ, nếu bạn chọn `AF_INET` và `SOCK_STREAM` cho một đối tượng socket, TCP sẽ được chọn mặc định cho attribute protocol.
2. Giờ, socket phải được bind tới một *endpoint* mà các process connector có thể với tới, bằng hàm `bind`. Chi tiết của endpoint được chọn phụ thuộc rất nhiều vào address family được chọn. Ví dụ, đối với một internet channel, endpoint nên là sự kết hợp của một IP address và một port. Đối với một Unix domain socket, endpoint nên là đường dẫn tới một *socket file* nằm trên filesystem.
3. Socket phải được cấu hình để lắng nghe. Ở đây, chúng ta dùng hàm `listen`. Như chúng tôi đã giải thích trước đây, nó đơn giản tạo một backlog cho listener socket. Backlog là một danh sách các kết nối đang chờ chưa được process listener chấp nhận. Trong khi process listener không thể chấp nhận các kết nối đến mới, kernel sẽ giữ các kết nối đến trong backlog tương ứng cho đến khi process listener rảnh và bắt đầu chấp nhận chúng. Một khi backlog đầy, mọi kết nối đến tiếp theo sẽ bị kernel từ chối. Chọn một kích thước nhỏ cho backlog có thể dẫn đến nhiều kết nối bị từ chối khi process listener bị quá tải và chọn một kích thước lớn có thể dẫn đến một đống kết nối đang chờ rốt cuộc sẽ bị timed out và ngắt kết nối. Kích thước backlog nên được chọn theo động thái của chương trình listener.

1. Sau khi cấu hình backlog, đã đến lúc chấp nhận các kết nối đến. Với mỗi kết nối đến, hàm `accept` nên được gọi. Do đó, có `accept` được gọi trong một vòng lặp never-ending là một mẫu được dùng rộng rãi. Bất cứ khi nào process listener ngừng chấp nhận các kết nối mới, các process connector được đặt vào backlog và một khi backlog đầy, chúng bị từ chối. Lưu ý rằng mỗi lời gọi hàm `accept` đơn giản lấy kết nối tiếp theo đang chờ trong backlog của socket. Nếu backlog trống và nếu listener socket được cấu hình là blocking, thì mọi lời gọi hàm `accept` sẽ bị chặn cho đến khi một kết nối mới đến.

Lưu ý rằng hàm `accept` trả về một đối tượng socket mới. Điều này có nghĩa là kernel dành một đối tượng socket <a id="_idIndexMarker1417"></a>độc nhất mới cho mỗi <a id="_idIndexMarker1418"></a>kết nối được chấp nhận. Nói cách khác, một process listener đã chấp nhận 100 client đang dùng ít nhất 101 socket: 1 cho listener socket và 100 socket cho các kết nối đến của nó. Socket được trả về từ hàm `accept` nên được dùng cho việc giao tiếp tiếp theo với client ngồi ở đầu kia của channel.

Lưu ý rằng trình tự lời gọi hàm này vẫn như nhau cho mọi loại IPC socket-based stream (connection-oriented). Trong chương tiếp theo, chúng tôi cho thấy các ví dụ thật về cách những bước này nên được lập trình bằng C. Trong tiểu mục tiếp theo, chúng ta xử lý trình tự stream connector.

###### Trình tự stream connector

Khi<a id="_idIndexMarker1419"></a> process connector muốn kết nối tới một process listener <a id="_idIndexMarker1420"></a>đã ở trong listening mode, nó nên theo trình tự sau. Lưu ý rằng process listener nên ở trong listening mode, nếu không kết nối sẽ bị kernel của host đích từ chối:

1. Process connector nên tạo một socket bằng cách gọi hàm `socket`. Socket này sẽ được dùng để kết nối tới process đích. Các đặc điểm của socket này nên tương tự hay ít nhất tương thích với những gì chúng ta đã đặt cho listener socket, nếu không, chúng ta không thể thiết lập một kết nối. Do đó, chúng ta cần đặt cùng address family mà chúng ta đã đặt cho listener socket. Và type nên vẫn là `SOCK_STREAM`.

1. Sau đó nó nên dùng hàm `connect` bằng cách truyền các argument định danh duy nhất endpoint của listener. Endpoint của listener nên có thể với tới được bởi process connector và nó nên đã được process đích làm cho sẵn có. Nếu hàm `connect` thành công, điều đó có nghĩa là kết nối đã được process đích chấp nhận. Trước điểm này, kết nối có thể đang chờ trong backlog của process đích. Nếu endpoint đích được chỉ định không có sẵn vì bất kỳ lý do gì, kết nối sẽ thất bại, và process connector sẽ nhận được một lỗi.

Giống như lời gọi hàm `accept` trong process listener, hàm `connect` trả về một đối tượng socket. Socket này định danh kết nối và nên được dùng cho việc giao tiếp tiếp theo với process listener. Trong chương sắp tới, chúng tôi sẽ đưa ra một minh họa các trình tự trên trong ví dụ máy tính tính toán (calculator).

###### Trình tự datagram listener

Một process datagram <a id="_idIndexMarker1421"></a>listener sẽ làm những điều sau để<a id="_idIndexMarker1422"></a> được khởi tạo:

1. Giống như stream listener, process datagram listener tạo một đối tượng socket bằng cách gọi hàm `socket`. Nhưng lần này, nó phải đặt attribute type của socket là `SOCK_DGRAM`.

1. Giờ listener socket đã được tạo, process listener nên bind nó tới một endpoint. Endpoint và các ràng buộc của nó rất giống đầu stream listener. Lưu ý rằng sẽ không có listening mode hay giai đoạn accepting cho một datagram listener socket vì channel bên dưới là connection-less, và chúng ta không thể có một session riêng cho mỗi kết nối đến.

Như đã giải thích, không có listening mode hay giai đoạn accepting với một datagram server socket. Ngoài ra, các datagram listener nên dùng các hàm `recvfrom` và `sendto` để đọc từ và ghi lại cho một process connector. Việc đọc vẫn có thể được thực hiện bằng hàm `read`, nhưng việc ghi các phản hồi không thể được thực hiện chỉ bằng một lời gọi hàm `write` đơn giản. Bạn sẽ thấy tại sao khi chúng ta xem ví dụ datagram listener trong chương sắp tới.

###### Trình tự datagram connector

Một datagram<a id="_idIndexMarker1423"></a> connector có gần như cùng trình tự như một<a id="_idIndexMarker1424"></a> stream connector. Khác biệt duy nhất là type của socket, vốn phải là `SOCK_DGRAM` cho datagram connector. Một trường hợp đặc biệt cho các datagram Unix domain connector socket là chúng phải bind tới một Unix domain socket file để nhận các phản hồi từ server. Chúng tôi sẽ giải thích thêm về điều này trong chương sắp tới như một phần của ví dụ datagram calculator khi dùng Unix domain socket.

Giờ chúng ta đã đi qua mọi trình tự khả dĩ, đã đến lúc giải thích socket và *socket descriptor* liên quan với nhau như thế nào. Đây là phần cuối cùng trong chương này, và bắt đầu chương tiếp theo, chúng tôi sẽ đưa ra các ví dụ C thật trình bày mọi trình tự.

<a id="_idParaDest-284"></a>

#### Socket có descriptor riêng của chúng!

Không giống các kỹ thuật IPC push-based<a id="_idIndexMarker1425"></a> khác làm việc với file descriptor, các kỹ thuật socket-based làm việc với các đối tượng socket. Mỗi đối tượng socket được tham chiếu bởi một giá trị số nguyên, vốn là một socket descriptor bên trong kernel. Socket descriptor này có thể được dùng để tham chiếu tới channel bên dưới.

Lưu ý rằng file descriptor và socket descriptor là khác nhau. File descriptor tham chiếu tới một file thông thường hay một device file trong khi socket descriptor tham chiếu tới các đối tượng socket được tạo bởi các lời gọi hàm `socket`, `accept` và `connect`.

Dù file descriptor và socket descriptor khác nhau, chúng ta vẫn có thể dùng cùng API hay tập hàm để đọc từ và ghi vào chúng. Do đó, có thể dùng các hàm `read` và `write` để làm việc với socket giống như file.

Những descriptor này có một điểm tương đồng khác; cả hai đều có thể được cấu hình là non-blocking thông qua cùng API. Các descriptor Non-blocking có thể được dùng để làm việc với file hay socket phía sau theo kiểu non-blocking.

<a id="_idParaDest-285"></a>

### Tóm tắt

Trong chương này, chúng ta đã bắt đầu nói về các kỹ thuật IPC cho phép hai process giao tiếp và truyền dữ liệu. Thảo luận của chúng ta trong chương này sẽ hoàn chỉnh trong chương sắp tới nơi chúng ta nói cụ thể về socket programming, và chúng tôi sẽ đưa ra nhiều ví dụ C thật khác nhau.

Trong chương này, chúng ta đã trình bày các chủ đề sau:

- Các kỹ thuật IPC Pull-based và push-based và chúng khác và giống nhau như thế nào.
- Chúng ta đã so sánh các kỹ thuật IPC single-host với các kỹ thuật IPC multiple-host.
- Bạn đã học về các communication protocol và các đặc điểm khác nhau của chúng.
- Chúng ta đã đi qua các khái niệm serialization và deserialization và cách chúng hoạt động để đáp ứng một communication protocol nhất định.
- Chúng tôi đã giải thích các đặc điểm nội dung, độ dài và tính tuần tự của giao thức có thể ảnh hưởng đến các process nhận như thế nào.
- Chúng tôi đã giải thích POSIX pipe và minh họa cách dùng chúng bằng một ví dụ.
- Bạn đã thấy POSIX message queue là gì và nó có thể được dùng như thế nào để cho phép hai process giao tiếp.
- Chúng tôi đã giải thích ngắn gọn Unix domain socket và các thuộc tính cơ bản của chúng.
- Chúng tôi đã giải thích mạng máy tính là gì và chồng các tầng mạng khác nhau có thể dẫn đến một kết nối transport như thế nào.
- Chúng tôi đã giải thích socket programming là gì.
- Chúng tôi đã giải thích các trình tự khởi tạo của các process listener và connector và các bước chúng thực hiện để được khởi tạo.
- Chúng ta đã so sánh file descriptor và socket descriptor.

Trong chương tiếp theo, chúng ta tiếp tục thảo luận về socket programming với trọng tâm là cung cấp các ví dụ C thật. Chúng tôi sẽ định nghĩa một ví dụ về một calculator client và một calculator server. Sau đó, chúng ta sẽ dùng cả Unix domain socket lẫn internet socket để thiết lập một giao tiếp client-server hoạt động đầy đủ giữa calculator client và server của nó.
