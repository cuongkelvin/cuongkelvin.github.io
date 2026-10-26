<a id="_idParaDest-286"></a>

# Chương 20: Socket Programming

Trong chương trước, chúng ta đã thảo luận IPC single-host và đưa ra phần giới thiệu về socket programming. Trong chương này, chúng tôi muốn hoàn tất phần giới thiệu và đề cập sâu socket programming bằng một ví dụ client-server thật: dự án calculator (máy tính tính toán).

Thứ tự các chủ đề trong chương này có thể có vẻ hơi khác thường, nhưng mục đích là cho bạn hiểu rõ hơn về các loại socket khác nhau và cách chúng hoạt động trong một dự án thật. Trong chương này, chúng ta thảo luận các chủ đề sau:

- Trước tiên, chúng tôi đưa ra một bản điểm lại những gì chúng tôi đã giải thích trong chương trước. Lưu ý rằng bản điểm lại này chỉ là một tóm tắt ngắn, và bạn bắt buộc phải đọc phần thứ hai của chương trước dành cho socket programming.
- Trong phần tóm tắt, chúng ta thảo luận các loại socket khác nhau, các trình tự stream và datagram, và một số chủ đề khác thiết yếu cho việc tiếp tục ví dụ calculator của chúng ta.
- Ví dụ client-server, dự án calculator, được mô tả và phân tích đầy đủ. Điều này chuẩn bị cho chúng ta tiếp tục với các thành phần khác nhau trong ví dụ và trình bày code C.
- Như một thành phần then chốt của ví dụ, một library serializer/deserializer được phát triển. Library này sẽ biểu diễn giao thức chính được dùng giữa một calculator client và server của nó.
- Điều then chốt cần hiểu là một calculator client và một calculator server phải có khả năng giao tiếp qua bất kỳ loại socket nào. Do đó, chúng tôi trình bày các loại socket khác nhau<a id="_idIndexMarker1426"></a> được tích hợp trong ví dụ và làm điểm khởi đầu, **Unix domain socket** (**UDS**) được giới thiệu.
- Chúng tôi cho thấy trong ví dụ của mình chúng được dùng như thế nào để thiết lập một kết nối client-server trong một thiết lập single-host.
- Để tiếp tục với các loại socket khác, chúng ta thảo luận network socket. Chúng tôi trình bày cách TCP socket và UDP socket có thể được tích hợp trong dự án calculator.

Hãy bắt đầu chương với một bản tóm tắt những gì chúng ta biết về socket và socket programming nói chung. Rất khuyến khích bạn làm quen với nửa thứ hai của chương trước trước khi đi sâu vào chương này, vì chúng tôi giả định một số kiến thức pre-existing (có sẵn) ở đây.

<a id="_idParaDest-287"></a>

## Điểm lại socket programming

Trong phần này, chúng ta<a id="_idIndexMarker1427"></a> sẽ thảo luận socket là gì, các loại khác nhau của chúng là gì, và nói chung việc chúng ta nói rằng chúng ta đang làm socket programming có nghĩa là gì. Đây sẽ là một bản điểm lại ngắn, nhưng việc xây dựng nền tảng này là thiết yếu để chúng ta có thể tiếp tục vào thảo luận sâu hơn trong các phần tiếp theo.

Nếu bạn còn nhớ từ các chương trước, chúng ta có hai nhóm kỹ thuật IPC được hai hay nhiều process dùng để giao tiếp và chia sẻ dữ liệu. Nhóm thứ nhất chứa các kỹ thuật *pull-based* <a id="_idIndexMarker1428"></a>đòi hỏi một *medium* có thể truy cập được (như một shared memory hay một file thông thường) để lưu dữ liệu vào và lấy dữ liệu ra. Nhóm thứ hai<a id="_idIndexMarker1429"></a> chứa các kỹ thuật *push-based*. Những kỹ thuật này đòi hỏi một *channel* được thiết lập và channel nên<a id="_idIndexMarker1430"></a> có thể truy cập được bởi mọi process. Khác biệt chính giữa các nhóm này là về cách dữ liệu được lấy từ một medium trong các kỹ thuật pull-based, hay từ một channel trong các kỹ thuật push-based.

Nói đơn giản, trong các kỹ thuật pull-based, dữ liệu nên được kéo hay đọc từ medium, nhưng trong các kỹ thuật push-based, dữ liệu được đẩy hay chuyển giao tới process đọc một cách tự động. Trong các kỹ thuật pull-based, vì các process kéo dữ liệu từ một medium dùng chung, nó dễ gặp race condition nếu một số process có thể ghi vào medium đó.

Chính xác hơn về các kỹ thuật push-based, dữ liệu luôn được chuyển giao tới một buffer trong kernel và buffer đó có thể được process nhận truy cập thông qua việc dùng một descriptor (file hay socket).

Sau đó process nhận có thể hoặc bị chặn cho đến khi có dữ liệu mới trên descriptor đó hoặc nó có thể *poll* descriptor để xem kernel đã nhận được dữ liệu mới nào <a id="_idIndexMarker1431"></a>trên descriptor đó chưa và nếu chưa, tiếp tục với<a id="_idIndexMarker1432"></a> một công việc khác. Cách tiếp cận thứ nhất là *blocking I/O* và cách tiếp cận thứ hai là *non-blocking I/O* hay *asynchronous I/O*. Trong chương này, mọi kỹ thuật push-based<a id="_idIndexMarker1433"></a> đều dùng cách tiếp cận blocking.

Chúng ta biết rằng socket programming là một loại IPC đặc biệt thuộc nhóm thứ hai. Do đó, mọi IPC socket-based đều là push-based. Nhưng đặc điểm chính phân biệt socket programming với các kỹ thuật IPC push-based khác là thực tế rằng trong socket programming chúng ta dùng *socket*. Socket là<a id="_idIndexMarker1434"></a> các đối tượng đặc biệt trong các hệ điều hành Unix-like, kể cả trong Microsoft Windows vốn không Unix-like, biểu diễn các *channel two-way* (hai chiều).

Nói cách<a id="_idIndexMarker1435"></a> khác, một đối tượng socket duy nhất có thể được dùng cả để đọc từ lẫn ghi vào cùng một channel. Bằng cách này, hai process nằm ở hai <a id="_idIndexMarker1436"></a>phía của cùng một channel có thể có *giao tiếp two-way*.

Trong chương trước, chúng ta <a id="_idIndexMarker1437"></a>đã thấy rằng socket được biểu diễn bởi socket descriptor, giống như file được biểu diễn bởi file descriptor. Dù socket descriptor và file descriptor tương tự nhau ở một số điểm như thao tác I/O và việc *poll-able* (có thể poll), thực tế chúng khác nhau. Một socket descriptor duy nhất luôn biểu diễn một channel, nhưng một file descriptor có thể biểu diễn một medium như một file thông thường, hay một channel như một POSIX pipe. Do đó, một số thao tác liên quan đến file như seek không được hỗ trợ cho socket descriptor, và thậm chí cho một file descriptor khi nó biểu diễn một channel.

Giao tiếp Socket-based có thể là *connection-oriented* hay *connection-less*. Trong giao tiếp connection-oriented<a id="_idIndexMarker1438"></a>, channel biểu diễn một *stream* byte đang được truyền giữa hai<a id="_idIndexMarker1439"></a> process cụ thể, trong khi trong giao tiếp connection-less, *datagram* có thể được<a id="_idIndexMarker1440"></a> truyền dọc theo channel và không có kết nối cụ thể nào giữa hai process. Một số process có thể dùng cùng channel để chia sẻ state hay truyền dữ liệu.

Do đó, chúng ta có hai loại channel: *stream channel* và *datagram channel*. Trong một chương trình, mỗi stream channel được biểu diễn bởi một *stream socket* và mỗi datagram channel được biểu diễn bởi một *datagram socket*. Khi thiết lập một channel, chúng ta phải quyết định nó nên là stream hay datagram. Chúng ta sẽ thấy ngay rằng ví dụ calculator của chúng ta có thể hỗ trợ cả hai channel.

Socket có nhiều loại khác nhau. Mỗi loại socket tồn tại cho một cách dùng nhất định và một tình huống nhất định. Nói chung, chúng ta có hai loại socket: UDS<a id="_idIndexMarker1441"></a> và network socket. Như bạn có thể<a id="_idIndexMarker1442"></a> biết và như chúng tôi đã giải thích trong chương<a id="_idIndexMarker1443"></a> trước, UDS có thể được dùng bất cứ khi nào mọi process muốn tham gia một IPC đều nằm trên cùng một máy. Nói cách khác, UDS chỉ có thể được dùng trong các cách triển khai single-host.

Ngược lại, network socket có thể được dùng trong gần như mọi cách triển khai bất kể các process được triển khai như thế nào và chúng nằm ở đâu. Chúng có thể đều ở trên cùng một máy, hay chúng có thể được <a id="_idIndexMarker1444"></a>phân tán khắp một mạng. Trong trường hợp có một cách triển khai single-host, UDS được ưa chuộng hơn vì chúng nhanh hơn, và chúng có ít chi phí phụ hơn so với network socket. Trong ví dụ calculator của chúng ta, chúng tôi cung cấp hỗ trợ cho cả UDS lẫn network socket.

UDS và network socket có thể biểu diễn cả stream channel lẫn datagram channel. Do đó, chúng ta có bốn biến thể: UDS trên một stream channel, UDS trên một datagram channel, network socket trên một stream channel, và cuối cùng network socket trên một datagram channel. Cả bốn biến thể này đều được ví dụ của chúng ta trình bày.

Một network socket<a id="_idIndexMarker1445"></a> cung cấp một stream channel thường là một TCP socket. Đó<a id="_idIndexMarker1446"></a> là vì, phần lớn thời gian, chúng ta đang dùng TCP làm giao thức transport cho một socket như vậy. Tương tự, một network socket cung cấp một datagram channel thường là một UDP socket. Đó là vì, phần lớn thời gian, chúng ta đang dùng UDP làm giao thức transport cho một socket như vậy. Lưu ý rằng UDS socket cung cấp stream channel hay datagram channel đều không có tên cụ thể nào vì không có giao thức transport bên dưới.

Để viết code C thực tế cho các loại socket và channel khác nhau, tốt hơn là làm điều đó khi bạn đang làm việc trên một ví dụ thật. Về cơ bản đó là lý do tại sao chúng tôi đã chọn cách tiếp cận khác thường này. Bằng cách này, bạn sẽ nhận ra các phần chung giữa các loại socket và channel khác nhau, và chúng ta có thể trích xuất chúng thành các đơn vị code có thể được tái sử dụng. Trong phần tiếp theo, chúng ta sẽ thảo luận về dự án calculator và cấu trúc bên trong của nó.

<a id="_idParaDest-288"></a>

## Dự án calculator

Chúng tôi đang dành một phần riêng để <a id="_idIndexMarker1447"></a>giải thích mục đích của dự án calculator. Đây là một ví dụ dài và do đó sẽ hữu ích nếu có một nền tảng<a id="_idIndexMarker1448"></a> vững chắc trước khi đi sâu vào nó. Dự án nên giúp bạn đạt được các mục tiêu sau:

- Quan sát một ví dụ hoạt động đầy đủ có một số chức năng đơn giản và well-defined.
- Trích xuất các phần chung giữa các loại socket và channel khác nhau và có chúng thành một số library có thể tái sử dụng. Điều này giảm đáng kể lượng code chúng ta viết, và từ góc nhìn học tập, nó cho bạn thấy các ranh giới chung giữa các loại socket và channel khác nhau.
- Duy trì giao tiếp<a id="_idIndexMarker1449"></a> bằng một application protocol well-defined. Các ví dụ socket programming thông thường thiếu tính năng rất quan trọng này. Chúng thường đề cập các kịch bản giao tiếp rất đơn giản, và thường là one-time (một lần), giữa một client và server của nó.
- Làm việc trên một ví dụ có mọi thành phần cần thiết cho một chương trình client-server hoạt động đầy đủ như một application protocol, hỗ trợ các loại channel khác nhau, có serializer/deserializer, v.v., cho bạn một góc nhìn khác về socket programming.

Với tất cả những điều đã nói, chúng tôi sẽ trình bày dự án này như ví dụ chính trong chương này. Chúng ta làm điều đó từng bước, và tôi sẽ hướng dẫn bạn qua các bước khác nhau dẫn đến một dự án hoàn chỉnh và hoạt động được.

Bước đầu tiên là nghĩ ra một application protocol tương đối đơn giản và hoàn chỉnh. Giao thức này sẽ được dùng giữa các client và server. Như chúng tôi đã giải thích trước đây, không có một application protocol well-defined, hai bên không thể giao tiếp. Chúng có thể được kết nối và truyền dữ liệu vì đó là chức năng mà socket programming cung cấp, nhưng chúng không thể hiểu nhau.

Đó là lý do tại sao chúng ta phải dành một chút thời gian để hiểu application protocol được dùng trong dự án calculator. Trước khi nói về application protocol, hãy trình bày hệ thống phân cấp source có thể được thấy trong code base của dự án. Sau đó, chúng ta có thể tìm application protocol và library serializer/deserializer liên kết dễ hơn nhiều trong code base của dự án.

<a id="_idParaDest-289"></a>

### Hệ thống phân cấp source

Từ góc nhìn của một lập trình viên, POSIX socket programming API đối xử với mọi stream channel như nhau<a id="_idIndexMarker1451"></a> bất kể đối tượng socket liên kết là một UDS hay một network socket. Nếu bạn còn nhớ từ chương trước, đối với stream channel, chúng ta có các trình tự nhất định cho listener-side và cho connector-side, và những trình tự này vẫn như nhau cho các loại stream socket khác nhau.

Do đó, nếu bạn định hỗ trợ các loại socket khác nhau, cùng với các loại channel khác nhau, tốt hơn là trích xuất phần chung và viết nó một lần. Đó chính xác là cách tiếp cận mà chúng ta chọn đối với dự án calculator và đó là những gì bạn thấy trong source code. Do đó, có thể kỳ vọng thấy các library khác nhau trong dự án và một số trong đó chứa code chung được các phần khác của code tái sử dụng.

Giờ, đã đến lúc đi sâu vào <a id="_idIndexMarker1452"></a>code base. Trước hết, source code của dự án có thể được tìm thấy ở đây: https://github.com/PacktPublishing/Extreme-C/tree/master/ch20-socket-programming. Nếu bạn mở link và xem code base, bạn sẽ thấy có một số thư mục chứa nhiều source file. Hiển nhiên, chúng tôi không thể minh họa tất cả chúng vì việc này sẽ mất quá nhiều thời gian, nhưng chúng tôi sẽ giải thích các phần quan trọng của code. Bạn được khuyến khích xem code và đi qua nó, sau đó thử build và chạy nó; điều này sẽ cho bạn một ý niệm về cách ví dụ đã được phát triển.

Lưu ý rằng mọi code liên quan đến các ví dụ về UDS, UDP socket và TCP socket đều đã được đặt trong một hệ thống phân cấp duy nhất. Tiếp theo, chúng tôi sẽ giải thích hệ thống phân cấp source và các thư mục bạn tìm thấy trong code base.

Nếu bạn đi tới thư mục gốc của ví dụ và dùng lệnh `tree` để hiển thị các file và thư mục, bạn sẽ thấy thứ gì đó tương tự *Shell Box 20-1*.

Shell box sau minh họa cách clone GitHub repository của cuốn sách và cách di chuyển tới thư mục gốc của ví dụ:

```
$ git clone https://github.com/PacktPublishing/Extreme-C
Cloning into 'Extreme-C'...
...
Resolving deltas: 100% (458/458), done.
$ cd Extreme-C/ch20-socket-programming
$ tree
.
├── CMakeLists.txt
├── calcser
...
├── calcsvc
...
├── client
│   ├── CMakeLists.txt
│   ├── clicore
...
│   ├── tcp
│   │   ├── CMakeLists.txt
│   │   └── main.c
│   ├── udp
│   │   ├── CMakeLists.txt
│   │   └── main.c
│   └── Unix
│       ├── CMakeLists.txt
│       ├── datagram
│       │   ├── CMakeLists.txt
│       │   └── main.c
│       └── stream
│           ├── CMakeLists.txt
│           └── main.c
├── server
│   ├── CMakeLists.txt
│   ├── srvcore
...
│   ├── tcp
│   │   ├── CMakeLists.txt
│   │   └── main.c
│   ├── udp
│   │   ├── CMakeLists.txt
│   │   └── main.c
│   └── Unix
│       ├── CMakeLists.txt
│       ├── datagram
│       │   ├── CMakeLists.txt
│       │   └── main.c
│       └── stream
│           ├── CMakeLists.txt
│           └── main.c
└── types.h
18 directories, 49 files
$
```

*Shell Box 20-1: Clone code base của dự án calculator và liệt kê các file và thư mục*

Như bạn có thể thấy trong<a id="_idIndexMarker1454"></a> danh sách file và thư mục, dự án calculator được tạo nên từ một số phần, một số trong đó là library, và mỗi phần có thư mục riêng. Tiếp theo, chúng tôi giải thích những thư mục này:

- `/calcser`: Đây là<a id="_idIndexMarker1455"></a> library serializer/deserializer. Nó chứa các source file serialization/deserialization-related. Library này quy định application protocol được định nghĩa giữa một calculator client và một calculator server. Library này cuối cùng được build thành một file static library tên là `libcalcser.a`.
- `/calcsvc`: Library<a id="_idIndexMarker1456"></a> này chứa các source cho calculation service. *Calculation service* khác với process server. Service library này chứa chức năng cốt lõi của máy tính và nó không phụ thuộc vào việc đứng sau một process server và có thể được dùng riêng như một C library độc lập riêng biệt. Library này cuối cùng được build thành một file static library tên là `libcalcsvc.a`.
- `/server/srvcore`: Library này chứa các source chung giữa các process server stream và datagram, bất kể<a id="_idIndexMarker1458"></a> loại socket. Do đó, mọi process calculator server, dù dùng UDS hay network socket, và dù hoạt động trên stream channel hay datagram channel, đều có thể dựa vào phần chung này. Output cuối cùng của library này là một file static library tên là `libsrvcore.a`.
- `/server/unix/stream`: Thư mục<a id="_idIndexMarker1459"></a> này chứa các source cho một chương trình server dùng stream channel đằng sau một UDS. Kết quả build cuối cùng của thư mục này là một executable file tên là `unix_stream_calc_server`. Đây là một trong các executable output khả dĩ trong dự án này mà chúng ta có thể dùng để khởi động một calculator server, server này lắng nghe trên một UDS để nhận các kết nối stream.
- `/server/unix/datagram`: Thư mục <a id="_idIndexMarker1460"></a>này chứa các source cho một chương trình server dùng datagram channel đằng sau một UDS. Kết quả build cuối cùng của thư mục này là một executable file tên là `unix_datagram_calc_server`. Đây là một trong các executable output khả dĩ trong dự án này mà chúng ta có thể dùng để khởi động một calculator server, server này lắng nghe trên một UDS để nhận các thông điệp datagram.
- `/server/tcp`: Thư mục <a id="_idIndexMarker1461"></a>này chứa các source cho một chương trình server dùng stream channel đằng sau một TCP network socket. Kết quả build cuối cùng của thư mục này là một executable file tên là `tcp_calc_server`. Đây là một trong các executable output khả dĩ trong dự án này mà chúng ta có thể dùng để khởi động một calculator server, server này lắng nghe trên một TCP socket để nhận các kết nối stream.
- `/server/udp`: Thư mục <a id="_idIndexMarker1462"></a>này chứa các source cho một chương trình server dùng datagram channel đằng sau một UDP network socket. Kết quả build cuối cùng của thư mục này là một executable file tên là `udp_calc_server`. Đây là một trong các executable output khả dĩ trong dự án này mà chúng ta có thể dùng để khởi động một calculator server, server này lắng nghe trên một UDP socket để nhận các thông điệp datagram.
- `/client/clicore`: Library<a id="_idIndexMarker1464"></a> này chứa các source chung giữa các process client stream và datagram, bất kể loại socket. Do đó, mọi process calculator client, bất kể chúng dùng UDS hay network socket, và bất kể hoạt động trên stream channel hay datagram channel, đều có thể dựa vào phần chung này. Nó sẽ được build thành một file static library tên là `libclicore.a`.
- `/client/unix/stream`: Thư mục<a id="_idIndexMarker1465"></a> này chứa các source cho một chương trình client dùng stream channel đằng sau một UDS. Kết quả build cuối cùng của thư mục này là một executable file tên là `unix_stream_calc_client`. Đây là một trong các executable output khả dĩ trong dự án này mà <a id="_idIndexMarker1466"></a>chúng ta có thể dùng để khởi động một calculator client, client này kết nối tới một endpoint UDS và thiết lập một kết nối stream.
- `/client/unix/datagram`: Thư mục <a id="_idIndexMarker1467"></a>này chứa các source cho một chương trình client dùng datagram channel đằng sau một UDS. Kết quả build cuối cùng của thư mục này là một executable file tên là `unix_datagram_calc_client`. Đây là một trong các executable output khả dĩ trong dự án này mà chúng ta có thể dùng để khởi động một calculator client, client này kết nối tới một endpoint UDS và gửi một số thông điệp datagram.
- `/client/tcp`: Thư mục<a id="_idIndexMarker1468"></a> này chứa các source cho một chương trình client dùng stream channel đằng sau một TCP socket. Kết quả build cuối cùng của thư mục này là một executable file tên là `tcp_calc_client`. Đây là một trong các executable output khả dĩ trong dự án này mà chúng ta có thể dùng để khởi động một calculator client, client này kết nối tới một endpoint TCP socket và thiết lập một kết nối stream.
- `/client/udp`: Thư mục<a id="_idIndexMarker1469"></a> này chứa các source cho một chương trình client dùng datagram channel đằng sau một UDP socket. Kết quả build cuối cùng của thư mục này là một executable file tên là `udp_calc_client`. Đây là một trong các executable output khả dĩ trong dự án này mà chúng ta có thể dùng để khởi động một calculator client, client này kết nối tới một endpoint UDP socket và gửi một số thông điệp datagram.

<a id="_idParaDest-290"></a>

### Build dự án

Giờ chúng ta đã đi<a id="_idIndexMarker1470"></a> qua mọi thư mục trong dự án, chúng ta cần cho thấy cách build nó. Dự án dùng CMake, và bạn nên cài đặt nó trước khi tiếp tục build dự án.

Để build dự án, hãy chạy các lệnh sau trong thư mục gốc của chương:

```
$ mkdir -p build
$ cd build
$ cmake ..
...
$ make
...
$
```

*Shell Box 20-2: Các lệnh để build dự án calculator*

<a id="_idParaDest-291"></a>

### Chạy dự án

Không gì bằng việc chạy một dự án để tự mình thấy nó hoạt động như thế nào. Do đó, trước khi đi sâu vào chi tiết kỹ thuật, tôi muốn bạn khởi động một calculator server, rồi một calculator client, và cuối cùng xem chúng nói chuyện với nhau như thế nào.

Trước khi chạy các process, bạn cần có hai Terminal (hay shell) riêng biệt để nhập hai lệnh riêng biệt. Trong Terminal thứ nhất, để chạy một stream server lắng nghe trên UDS, hãy gõ lệnh sau.

Lưu ý rằng bạn cần ở trong thư mục `build` trước khi nhập lệnh sau. Thư mục `build` đã được tạo trong phần trước, *Build dự án (Build the Project)*:

```
$ ./server/unix/stream/unix_stream_calc_server
```

*Shell Box 20-3: Chạy một stream server lắng nghe trên một UDS*

Hãy bảo đảm server đang chạy. Trong Terminal thứ hai, hãy chạy stream client được build để dùng UDS:

```
$ ./client/unix/stream/unix_stream_calc_client
? (type quit to exit) 3++4
The req(0) is sent.
req(0) > status: OK, result: 7.000000
? (type quit to exit) mem
The req(1) is sent.
req(1) > status: OK, result: 7.000000
? (type quit to exit) 5++4
The req(2) is sent.
req(2) > status: OK, result: 16.000000
? (type quit to exit) quit
Bye.
$
```

*Shell Box 20-4: Chạy calculator client và gửi một số yêu cầu*

Như bạn thấy trong shell box trên, process client có command line riêng của nó. Nó nhận một số lệnh từ người dùng, chuyển chúng thành một số yêu cầu theo application<a id="_idIndexMarker1471"></a> protocol, và gửi chúng tới server để xử lý tiếp. Sau đó, nó chờ phản hồi và, ngay khi nhận được, in ra kết quả. Lưu ý rằng command line này là một phần của code chung được viết cho mọi client và do đó, bất kể loại channel hay loại socket mà client đang dùng, bạn luôn thấy command line của client.

Giờ, đã đến lúc nhảy vào chi tiết của application protocol và xem các thông điệp yêu cầu và phản hồi trông như thế nào.

<a id="_idParaDest-292"></a>

### Application protocol

Bất kỳ hai process nào muốn<a id="_idIndexMarker1472"></a> giao tiếp đều phải tuân theo một application protocol. Giao thức này có thể là tùy chỉnh, như dự án calculator, hay nó có thể là một trong các<a id="_idIndexMarker1473"></a> giao thức well-known như HTTP. Chúng ta gọi giao thức của mình là *calculator protocol*.

Calculator protocol là một giao thức variable-length. Nói cách khác, mỗi thông điệp có độ dài riêng và mỗi thông điệp nên được tách khỏi thông điệp tiếp theo bằng một delimiter. Chỉ có một loại thông điệp yêu cầu và một loại thông điệp phản hồi. Giao thức này cũng là dạng văn bản. Điều đó có nghĩa là chúng ta chỉ dùng các ký tự chữ-số cùng với một vài ký tự khác làm các ký tự hợp lệ trong các thông điệp yêu cầu và phản hồi. Nói cách khác, các thông điệp calculator là human-readable (con người đọc được).

Thông điệp yêu cầu có bốn <a id="_idIndexMarker1474"></a>trường: *request ID*, *method*, *first operand* (toán hạng thứ nhất) và *second operand* (toán hạng thứ hai). Mỗi yêu cầu có một ID độc nhất và server dùng ID này để liên kết một phản hồi với yêu cầu tương ứng của nó.

Method là một thao tác có thể được calculator service thực hiện. Tiếp theo, bạn có thể thấy header file `calcser/calc_proto_req.h`. File này mô tả thông điệp yêu cầu của calculator protocol:

```
#ifndef CALC_PROTO_REQ_H
#define CALC_PROTO_REQ_H
#include <stdint.h>
typedef enum {
  NONE,
  GETMEM, RESMEM,
  ADD, ADDM,
  SUB, SUBM,
  MUL, MULM,
  DIV
} method_t;
struct calc_proto_req_t {
  int32_t id;
  method_t method;
  double operand1;
  double operand2;
};
method_t str_to_method(const char*);
const char* method_to_str(method_t);
#endif
```

*Code Box 20-1 [calcser/calc_proto_req.h]: Định nghĩa của đối tượng yêu cầu calculator*

Như bạn có thể thấy, chúng ta có chín method được định nghĩa như một phần của giao thức. Là một máy tính tốt, máy tính của chúng ta <a id="_idIndexMarker1475"></a>có một memory nội bộ, và vì vậy chúng ta có các thao tác memory gắn với phép cộng, phép trừ và phép nhân.

Ví dụ, method `ADD` đơn giản cộng hai số thực, nhưng method `ADDM` là một biến thể của method `ADD` cộng hai số đó cùng với giá trị được lưu trong memory nội bộ, và cuối cùng nó cập nhật giá trị trong memory để dùng tiếp. Nó giống như khi bạn dùng nút memory trên máy tính để bàn của mình. Bạn có thể thấy nút đó được đánh dấu là +M.

Chúng ta cũng có một method đặc biệt để đọc và đặt lại memory nội bộ của máy tính. Phép chia không thể được thực hiện trên memory nội bộ, nên chúng ta không có biến thể nào khác.

Giả sử rằng client muốn tạo một yêu cầu với ID `1000`, dùng method `ADD`, và với `1.5` và `5.6` làm các operand. Trong C, nó cần tạo một đối tượng từ kiểu `calc_proto_req_t` (structure được khai báo trong header trên ở *Code Box 20-1*) và điền nó với các giá trị mong muốn. Tiếp theo, bạn có thể thấy cách làm điều đó:

```
struct calc_proto_req_t req;
req.id = 1000;
req.method = ADD;
req.operand1 = 1.5;
req.operand2 = 5.6;
```

*Code Box 20-2: Tạo một đối tượng yêu cầu calculator trong C*

Như chúng tôi đã giải thích trong chương trước, đối tượng `req` trong code box trên cần được serialize thành một thông điệp yêu cầu trước khi được gửi tới server. Nói cách khác, chúng ta cần<a id="_idIndexMarker1476"></a> serialize *đối tượng yêu cầu* (request object) trên thành *thông điệp yêu cầu* (request message) tương đương. Serializer trong dự án calculator, theo application protocol của chúng ta, serialize đối tượng `req` như sau:

```
1000#ADD#1.5#5.6$
```

*Code Box 20-3: Thông điệp đã serialize tương đương với đối tượng req được định nghĩa trong Code Box 20-2*

Như bạn có thể thấy, ký tự `#` được <a id="_idIndexMarker1477"></a>dùng làm *field delimiter* (dấu phân cách trường), và ký tự `$` được dùng làm *message separator* (dấu phân tách thông điệp). Ngoài ra, mỗi thông điệp yêu cầu có đúng bốn trường. Một đối tượng *deserializer* ở<a id="_idIndexMarker1478"></a> phía bên kia của channel dùng những sự thật này để phân tích các byte đến và khôi phục lại đối tượng yêu cầu.

Ngược lại, process server cần serialize đối tượng phản hồi khi trả lời một yêu cầu. Một đối tượng phản hồi calculator có ba trường: *request ID*, *status* (trạng thái) và *result* (kết quả). Request ID xác định yêu cầu tương ứng. Mỗi yêu cầu có một ID độc nhất và bằng cách này, server chỉ định yêu cầu mà nó muốn phản hồi.

Header file `calcser/calc_proto_resp.h` mô tả một phản hồi calculator nên trông như thế nào, và bạn có thể thấy nó trong code box sau:

```
#ifndef CALC_PROTO_RESP_H
#define CALC_PROTO_RESP_H
#include <stdint.h>
#define STATUS_OK              0
#define STATUS_INVALID_REQUEST 1
#define STATUS_INVALID_METHOD  2
#define STATUS_INVALID_OPERAND 3
#define STATUS_DIV_BY_ZERO     4
#define STATUS_INTERNAL_ERROR  20
typedef int status_t;
struct calc_proto_resp_t {
  int32_t req_id;
  status_t status;
  double result;
};
#endif
```

*Code Box 20-4 [calcser/calc_proto_resp.h]: Định nghĩa của đối tượng phản hồi calculator*

Tương tự, để tạo một *đối tượng phản hồi* (response object) cho đối tượng yêu cầu `req` trên, được đề cập trong *Code Box 20-2*, process server nên làm như sau:

```
struct calc_proto_resp_t resp;
resp.req_id = 1000;
resp.status = STATUS_OK;
resp.result = 7.1;
```

*Code Box 20-5: Tạo một đối tượng phản hồi cho đối tượng yêu cầu req được định nghĩa trong Code Box 20-2*

Đối tượng phản hồi trên được serialize như sau:

```
1000#0#7.1$
```

*Code Box 20-6: Thông điệp phản hồi đã serialize tương đương với đối tượng resp được tạo trong Code Box 20-5*

Một lần nữa, chúng ta dùng `#` làm field <a id="_idIndexMarker1479"></a>delimiter và `$` làm message separator. Lưu ý rằng status là dạng số, và nó chỉ ra sự thành công hay thất bại của yêu cầu. Trong trường hợp thất bại, nó là một số non-zero (khác không), và ý nghĩa của nó được mô tả trong header file phản hồi, hay chính xác hơn, trong calculator protocol.

Giờ, đã đến lúc nói thêm một chút về library serialization/deserialization và phần bên trong của nó trông như thế nào.

<a id="_idParaDest-293"></a>

### Library serialization/deserialization

Trong phần trước, chúng tôi<a id="_idIndexMarker1480"></a> đã mô tả các thông điệp yêu cầu và phản hồi<a id="_idIndexMarker1481"></a> trông như thế nào. Trong phần này, chúng ta sẽ nói thêm một chút về các thuật toán serializer và deserializer được dùng trong dự án calculator. Chúng ta sẽ dùng class `serializer`, với `calc_proto_ser_t` làm attribute structure của nó, để cung cấp các chức năng serialization và deserialization.

Như đã nói trước đây, những chức năng này được cung cấp cho các phần khác của dự án dưới dạng một static library tên là `libcalcser.a`. Ở đây, bạn có thể thấy public API của class `serializer` có trong `calcser/calc_proto_ser.h`:

```
#ifndef CALC_PROTO_SER_H
#define CALC_PROTO_SER_H
#include <types.h>
#include "calc_proto_req.h"
#include "calc_proto_resp.h"
#define ERROR_INVALID_REQUEST          101
#define ERROR_INVALID_REQUEST_ID       102
#define ERROR_INVALID_REQUEST_METHOD   103
#define ERROR_INVALID_REQUEST_OPERAND1 104
#define ERROR_INVALID_REQUEST_OPERAND2 105
#define ERROR_INVALID_RESPONSE         201
#define ERROR_INVALID_RESPONSE_REQ_ID  202
#define ERROR_INVALID_RESPONSE_STATUS  203
#define ERROR_INVALID_RESPONSE_RESULT  204
#define ERROR_UNKNOWN  220
struct buffer_t {
  char* data;
  int len;
};
struct calc_proto_ser_t;
typedef void (*req_cb_t)(
        void* owner_obj,
        struct calc_proto_req_t);
typedef void (*resp_cb_t)(
        void* owner_obj,
        struct calc_proto_resp_t);
typedef void (*error_cb_t)(
        void* owner_obj,
        const int req_id,
        const int error_code);
struct calc_proto_ser_t* calc_proto_ser_new();
void calc_proto_ser_delete(
        struct calc_proto_ser_t* ser);
void calc_proto_ser_ctor(
        struct calc_proto_ser_t* ser,
        void* owner_obj,
        int ring_buffer_size);
void calc_proto_ser_dtor(
        struct calc_proto_ser_t* ser);
void* calc_proto_ser_get_context(
        struct calc_proto_ser_t* ser);
void calc_proto_ser_set_req_callback(
        struct calc_proto_ser_t* ser,
        req_cb_t cb);
void calc_proto_ser_set_resp_callback(
        struct calc_proto_ser_t* ser,
        resp_cb_t cb);
void calc_proto_ser_set_error_callback(
        struct calc_proto_ser_t* ser,
        error_cb_t cb);
void calc_proto_ser_server_deserialize(
        struct calc_proto_ser_t* ser,
        struct buffer_t buffer,
        bool_t* req_found);
struct buffer_t calc_proto_ser_server_serialize(
        struct calc_proto_ser_t* ser,
        const struct calc_proto_resp_t* resp);
void calc_proto_ser_client_deserialize(
        struct calc_proto_ser_t* ser,
        struct buffer_t buffer,
        bool_t* resp_found);
struct buffer_t calc_proto_ser_client_serialize(
        struct calc_proto_ser_t* ser,
        const struct calc_proto_req_t* req);
#endif
```

*Code Box 20-7 [calcser/calc_proto_ser.h]: Public interface của class Serializer*

Ngoài các hàm constructor và destructor cần thiết để tạo và hủy một đối tượng <a id="_idIndexMarker1482"></a>serializer, chúng ta có một cặp hàm nên được process server dùng, và một cặp hàm khác nên được process client dùng.

Ở phía client, chúng ta serialize đối tượng yêu cầu và deserialize thông điệp phản hồi. Trong khi đó ở phía server, chúng ta deserialize thông điệp yêu cầu và serialize đối tượng phản hồi.

Ngoài các hàm serialization và deserialization, chúng ta có ba *callback function*:

- Một callback để nhận <a id="_idIndexMarker1483"></a>một đối tượng yêu cầu đã được deserialize từ channel bên dưới
- Một callback để nhận một đối tượng phản hồi đã được deserialize từ channel bên dưới
- Một callback để nhận lỗi khi một thao tác serialization hay deserialization thất bại

Những callback này được các process client và server dùng để nhận các yêu cầu và phản hồi đến và cả các lỗi được tìm thấy trong quá trình serialization và deserialization một thông điệp.

Giờ, hãy xem xét sâu hơn các hàm serialization/deserialization cho phía server.

<a id="_idParaDest-294"></a>

#### Các hàm serializer/deserializer Server-side

Chúng ta có hai hàm cho process server <a id="_idIndexMarker1485"></a>để serialize một đối tượng phản hồi và deserialize một thông điệp yêu cầu. Chúng ta bắt đầu với hàm serialization phản hồi.

Code box sau chứa code cho hàm serialization phản hồi `calc_proto_ser_server_serialize`:

```
struct buffer_t calc_proto_ser_server_serialize(
    struct calc_proto_ser_t* ser,
    const struct calc_proto_resp_t* resp) {
  struct buffer_t buff;
  char resp_result_str[64];
  _serialize_double(resp_result_str, resp->result);
  buff.data = (char*)malloc(64 * sizeof(char));
  sprintf(buff.data, "%d%c%d%c%s%c", resp->req_id,
          FIELD_DELIMITER, (int)resp->status, FIELD_DELIMITER,
      resp_result_str, MESSAGE_DELIMITER);
  buff.len = strlen(buff.data);
  return buff;
}
```

*Code Box 20-8 [calcser/calc_proto_ser.c]: Hàm serializer phản hồi server-side*

Như bạn có thể thấy, `resp` là một pointer tới một đối tượng phản hồi cần được serialize. Hàm này trả về một `buffer_t object`, được khai báo như sau trong header file `calc_proto_ser.h`:

```
struct buffer_t {
  char* data;
  int len;
};
```

*Code Box 20-9 [calcser/calc_proto_ser.h]: Định nghĩa của buffer_t*

Code serializer đơn giản và nó chủ yếu gồm một câu lệnh `sprintf` tạo thông điệp chuỗi phản hồi. Giờ, hãy xem hàm deserializer yêu cầu. Deserialization thường khó hiện thực hơn, và nếu bạn đi vào code base và theo dõi các lời gọi hàm, bạn sẽ thấy nó có thể phức tạp như thế nào.

*Code Box 20-9* chứa hàm deserialization yêu cầu:

```
void calc_proto_ser_server_deserialize(
    struct calc_proto_ser_t* ser,
    struct buffer_t buff,
    bool_t* req_found) {
  if (req_found) {
    *req_found = FALSE;
  }
  _deserialize(ser, buff, _parse_req_and_notify,
          ERROR_INVALID_REQUEST, req_found);
}
```

*Code Box 20-9 [calcser/calc_proto_ser.c]: Hàm deserialization yêu cầu server-side*

Hàm trên có vẻ đơn giản, nhưng thực tế nó dùng các hàm private `_deserialize` và `_parse_req_and_notify`. Những hàm này được định nghĩa trong file `calc_proto_ser.c`, chứa hiện thực thực sự của class `Serializer`.

Sẽ nặng nề <a id="_idIndexMarker1486"></a>và nằm ngoài phạm vi của cuốn sách này nếu đưa vào và thảo luận code chúng ta có cho các hàm private đã đề cập, nhưng để cho bạn một ý niệm, đặc biệt khi bạn muốn đọc source code, deserializer dùng một *ring buffer* có độ dài cố định và cố tìm `$` làm message separator.

Bất cứ khi nào nó tìm thấy `$`, nó gọi function pointer, mà trong trường hợp này trỏ tới hàm `_parse_req_and_notify` (argument thứ ba được truyền vào hàm `_deserialize`). Hàm `_parse_req_and_notify` cố trích xuất các trường và khôi phục đối tượng yêu cầu. Sau đó, nó thông báo cho *observer* đã đăng ký, trong trường hợp này là đối tượng server đang chờ một yêu cầu thông qua các callback function, để tiếp tục với đối tượng yêu cầu.

Giờ, hãy xem các hàm được dùng bởi phía client.

<a id="_idParaDest-295"></a>

#### Các hàm serializer/deserializer Client-side

Giống như đối với phía server, chúng ta có hai<a id="_idIndexMarker1487"></a> hàm ở phía client. Một để serialize đối tượng yêu cầu, và hàm kia dùng để deserialize phản hồi đến.

Chúng ta bắt đầu với serializer yêu cầu. Bạn có thể thấy định nghĩa trong *Code Box 20-10*:

```
struct buffer_t calc_proto_ser_client_serialize(
    struct calc_proto_ser_t* ser,
    const struct calc_proto_req_t* req) {
  struct buffer_t buff;
  char req_op1_str[64];
  char req_op2_str[64];
  _serialize_double(req_op1_str, req->operand1);
  _serialize_double(req_op2_str, req->operand2);
  buff.data = (char*)malloc(64 * sizeof(char));
  sprintf(buff.data, "%d%c%s%c%s%c%s%c", req->id, FIELD_DELIMITER,
          method_to_str(req->method), FIELD_DELIMITER,
          req_op1_str, FIELD_DELIMITER, req_op2_str,
          MESSAGE_DELIMITER);
  buff.len = strlen(buff.data);
  return buff;
}
```

*Code Box 20-10 [calcser/calc_proto_ser.c]: Hàm serialization yêu cầu client-side*

Như bạn có thể <a id="_idIndexMarker1488"></a>thấy, nó nhận một đối tượng yêu cầu và trả về một đối tượng `buffer`, hoàn toàn tương tự serializer phản hồi ở phía server. Nó thậm chí dùng cùng kỹ thuật; một câu lệnh `sprintf` để tạo thông điệp yêu cầu.

*Code Box 20-11* chứa hàm deserializer phản hồi:

```
void calc_proto_ser_client_deserialize(
    struct calc_proto_ser_t* ser,
    struct buffer_t buff, bool_t* resp_found) {
  if (resp_found) {
    *resp_found = FALSE;
  }
  _deserialize(ser, buff, _parse_resp_and_notify,
          ERROR_INVALID_RESPONSE, resp_found);
}
```

*Code Box 20-11 [calcser/calc_proto_ser.c]: Hàm deserialization phản hồi client-side*

Như bạn có thể thấy, cùng cơ chế được dùng, và một số hàm private tương tự đã được dùng. Rất khuyến khích đọc kỹ những source này, để hiểu rõ hơn cách các phần khác nhau của code đã được ghép lại với nhau để tái sử dụng tối đa các phần hiện có.

Chúng ta sẽ không đi sâu hơn thế này vào class `Serializer`; việc đào sâu vào code và tìm hiểu nó hoạt động như thế nào là tùy bạn.

Giờ chúng ta đã có serializer library, chúng ta có thể tiếp tục và viết các chương trình client và server. Có một library serialize các đối tượng và deserialize các thông điệp dựa trên một application protocol đã thống nhất là một bước sống còn trong việc viết phần mềm multi-process. Lưu ý rằng không quan trọng cách triển khai là single-host hay chứa nhiều host; các process nên có khả năng hiểu nhau, và các application protocol phù hợp nên đã được định nghĩa.

Trước khi nhảy vào code về socket programming, chúng tôi phải giải thích thêm một điều: calculator service. Nó nằm ở trung tâm của process server và nó thực hiện việc tính toán thực sự.

<a id="_idParaDest-296"></a>

### Calculator service

Calculator service<a id="_idIndexMarker1490"></a> là logic cốt lõi của ví dụ của chúng ta. Lưu ý rằng logic này nên hoạt động độc lập với cơ chế IPC bên dưới. Code sắp tới cho thấy khai báo của class calculator service.

Như bạn có thể thấy, nó được thiết kế theo cách mà nó có thể được dùng ngay cả trong một chương trình rất đơn giản, chỉ với một hàm `main`, sao cho nó thậm chí hoàn toàn không làm IPC nào:

```
#ifndef CALC_SERVICE_H
#define CALC_SERVICE_H
#include <types.h>
static const int CALC_SVC_OK = 0;
static const int CALC_SVC_ERROR_DIV_BY_ZERO = -1;
struct calc_service_t;
struct calc_service_t* calc_service_new();
void calc_service_delete(struct calc_service_t*);
void calc_service_ctor(struct calc_service_t*);
void calc_service_dtor(struct calc_service_t*);
void calc_service_reset_mem(struct calc_service_t*);
double calc_service_get_mem(struct calc_service_t*);
double calc_service_add(struct calc_service_t*, double, double b,
    bool_t mem);
double calc_service_sub(struct calc_service_t*, double, double b,
    bool_t mem);
double calc_service_mul(struct calc_service_t*, double, double b,
    bool_t mem);
int calc_service_div(struct calc_service_t*, double,
        double, double*);
#endif
```

*Code Box 20-12 [calcsvc/calc_service.h]: Public interface của class calculator service*

Như bạn có thể thấy, <a id="_idIndexMarker1491"></a>class trên thậm chí có các kiểu lỗi riêng. Các argument input là các kiểu C thuần, và nó hoàn toàn không phụ thuộc vào các class hay kiểu IPC-related hay serialization-related. Vì nó được cô lập như một logic độc lập, chúng ta biên dịch nó thành một static library độc lập tên là `libcalcsvc.a`.

Mọi process server đều phải dùng các đối tượng calculator service để thực hiện các phép tính thực sự. Những đối tượng này thường được gọi là các *service object*. Vì điều này, chương trình server cuối cùng phải được link với library này.

Một lưu ý quan trọng trước khi đi xa hơn: nếu, đối với một client cụ thể, các phép tính không cần một ngữ cảnh cụ thể, thì chỉ có một service object là đủ. Nói cách khác, nếu một service cho một client không đòi hỏi chúng ta nhớ bất kỳ state nào từ các yêu cầu trước của client đó, thì chúng ta<a id="_idIndexMarker1492"></a> có thể dùng một service object *singleton*. Chúng ta gọi đây là một *stateless service object*.

Ngược lại, nếu việc xử lý yêu cầu hiện tại đòi hỏi biết điều gì đó từ các yêu cầu trước, thì với mỗi client, chúng ta cần có một service object cụ thể. Đây là trường hợp đối với dự án calculator của chúng ta. Như bạn biết, máy tính có một memory nội bộ độc nhất cho mỗi client. Do đó, chúng ta <a id="_idIndexMarker1493"></a>không thể dùng cùng một đối tượng cho hai client. Những đối tượng này được biết đến là các *stateful service object*.

Để tóm tắt những gì chúng tôi đã nói ở trên, với mỗi client, chúng ta phải tạo một service object mới. Bằng cách này, mỗi client có máy tính riêng với memory nội bộ riêng. Các đối tượng calculator service <a id="_idIndexMarker1494"></a>là stateful và chúng cần nạp một số state (giá trị của memory nội bộ).

Giờ, chúng ta đang ở vị trí tốt để tiến lên và nói về các loại socket khác nhau, với các ví dụ được đưa ra trong ngữ cảnh của dự án calculator.

<a id="_idParaDest-297"></a>

## Unix domain socket

Từ chương trước, chúng ta biết<a id="_idIndexMarker1496"></a> rằng nếu chúng ta định thiết lập một kết nối giữa hai process trên cùng một máy, UDS là một trong những lựa chọn tốt nhất. Trong chương này, chúng ta đã mở rộng thảo luận và nói thêm một chút về các kỹ thuật IPC push-based, cũng như stream channel và datagram channel. Giờ là lúc tập hợp kiến thức của chúng ta từ các chương trước và chương hiện tại và xem UDS hoạt động.

Trong phần này, chúng ta có bốn tiểu mục dành cho các process ở phía listener hay phía connector và hoạt động trên một stream channel hay một datagram channel. Mọi process này đều đang dùng UDS. Chúng ta đi qua các bước chúng nên thực hiện để thiết lập channel, dựa trên các trình tự chúng ta đã thảo luận trong chương trước. Là process đầu tiên, chúng ta bắt đầu với<a id="_idIndexMarker1497"></a> process listener hoạt động trên một stream channel. Đây sẽ là *stream server*.

<a id="_idParaDest-298"></a>

### UDS stream server

Nếu bạn còn nhớ từ<a id="_idIndexMarker1498"></a> chương trước, chúng ta có một số trình tự cho phía listener và phía connector trong một giao tiếp transport. Một server đứng ở vị trí của một listener. Do đó, nó nên theo trình tự listener. Cụ thể hơn, vì chúng ta đang nói về stream channel trong phần này, nó nên theo một trình tự stream listener.

Như một phần của trình tự đó, server cần tạo một đối tượng socket trước. Trong dự án calculator của chúng ta, process stream server muốn nhận các kết nối qua một UDS phải theo cùng trình tự.

Đoạn code sau nằm trong hàm main của chương trình calculator server, và như có thể thấy trong *Code Box 20-13*, process trước tiên tạo một đối tượng `socket`:

```
int server_sd = socket(AF_UNIX, SOCK_STREAM, 0);
if (server_sd == -1) {
  fprintf(stderr, "Could not create socket: %s\n", strerror(errno));
  exit(1);
}
```

*Code Box 20-13 [server/unix/stream/main.c]: Tạo một đối tượng stream UDS*

Như bạn có thể thấy, hàm `socket` được dùng để tạo một đối tượng socket. Hàm này được include từ `<sys/socket.h>`, vốn là một POSIX header. Lưu ý rằng đây chỉ là một đối tượng socket, và chưa được xác định liệu đây sẽ là một client socket hay một server socket. Chỉ các lời gọi hàm tiếp theo mới xác định điều này.

Như chúng tôi đã giải thích trong<a id="_idIndexMarker1500"></a> chương trước, mỗi đối tượng socket có ba attribute. Những attribute này được xác định bởi ba argument được truyền cho hàm `socket`. Những argument này lần lượt chỉ định address family, type và protocol được dùng trên đối tượng socket đó.

Theo trình tự stream<a id="_idIndexMarker1501"></a> listener và đặc biệt đối với UDS, sau khi tạo đối tượng socket, chương trình server phải bind nó tới một *socket file*. Do đó, bước tiếp theo là bind socket tới một socket file. *Code Box 20-14* đã được dùng trong dự án calculator để bind đối tượng socket tới một file nằm tại một đường dẫn được xác định trước được chỉ định bởi mảng ký tự `sock_file`:

```
struct sockaddr_un addr;
memset(&addr, 0, sizeof(addr));
addr.sun_family = AF_UNIX;
strncpy(addr.sun_path, sock_file, sizeof(addr.sun_path) - 1);
int result = bind(server_sd, (struct sockaddr*)&addr, sizeof(addr));
if (result == -1) {
  close(server_sd);
  fprintf(stderr, "Could not bind the address: %s\n", strerror(errno));
  exit(1);
}
```

*Code Box 20-14 [server/unix/stream/main.c]: Bind một đối tượng stream UDS tới một socket file được chỉ định bởi mảng char sock_file*

Code trên có hai bước. Bước thứ nhất là tạo một instance, tên là `addr`, thuộc kiểu `struct sockaddr_un` và sau đó khởi tạo nó bằng cách trỏ nó tới một socket file. Ở bước thứ hai, đối tượng `addr` được truyền cho hàm `bind` để cho nó biết socket file nào nên được *bind* tới đối tượng socket<a id="_idIndexMarker1502"></a>. Lời gọi hàm `bind` chỉ thành công nếu không có đối tượng socket nào khác được bind tới cùng <a id="_idIndexMarker1503"></a>socket file. Do đó, với UDS, hai đối tượng socket, có lẽ ở trong các process khác nhau, không thể được bind tới cùng một socket file.

> **Lưu ý**:
>
> Trong Linux, UDS có thể được bind tới các *abstract socket address*. Chúng hữu ích chủ yếu khi không có filesystem nào được mount để dùng cho việc có một socket file. Một chuỗi bắt đầu bằng một ký tự null, `\0`, có thể được dùng để khởi tạo address structure, `addr` trong code box trên, và sau đó tên được cung cấp được bind tới đối tượng socket bên trong kernel. Tên được cung cấp nên độc nhất trong hệ thống và không đối tượng socket nào khác nên được bind tới nó.

Một lưu ý thêm về đường dẫn socket file, độ dài của đường dẫn không thể vượt quá 104 byte trên hầu hết các hệ thống Unix. Tuy nhiên, trong các hệ thống Linux, độ dài này là 108 byte. Lưu ý rằng biến chuỗi giữ đường dẫn socket file luôn bao gồm thêm một ký tự null ở cuối như một mảng `char` trong C. Do đó, thực chất, 103 và 107 byte có thể được dùng cho đường dẫn socket file tùy theo hệ điều hành.

Nếu hàm `bind` trả về `0`, điều đó có nghĩa là việc bind đã thành công, và bạn có thể tiếp tục cấu hình kích thước của *backlog*; bước tiếp theo trong trình tự stream listener sau khi bind endpoint.

Code sau cho thấy backlog được cấu hình như thế nào cho stream calculator server lắng nghe trên một UDS:

```
result = listen(server_sd, 10);
if (result == -1) {
  close(server_sd);
  fprintf(stderr, "Could not set the backlog: %s\n", strerror(errno));
  exit(1);
}
```

*Code Box 20-15 [server/unix/stream/main.c]: Cấu hình kích thước backlog cho một stream socket đã được bind*

Hàm `listen` cấu hình kích thước backlog cho một socket đã được bind. Như chúng tôi đã giải thích trong chương trước, khi một process server bận không thể chấp nhận thêm client đến nào, một số lượng nhất định các client này có thể chờ trong backlog cho đến khi chương trình server có thể xử lý chúng. Đây là một bước thiết yếu trong việc chuẩn bị một stream socket trước khi chấp nhận các client.

Theo những gì chúng ta có trong trình tự stream listener, sau khi có stream socket được bind và<a id="_idIndexMarker1504"></a> có kích thước backlog được cấu hình, chúng ta có thể bắt đầu <a id="_idIndexMarker1505"></a>chấp nhận các client mới. *Code Box 20-16* cho thấy các client mới có thể được chấp nhận như thế nào:

```
while (1) {
  int client_sd = accept(server_sd, NULL, NULL);
  if (client_sd == -1) {
    close(server_sd);
    fprintf(stderr, "Could not accept the client: %s\n",
        strerror(errno));
    exit(1);
  }
  ...
}
```

*Code Box 20-16 [server/unix/stream/main.c]: Chấp nhận các client mới trên một stream listener socket*

Phép màu là hàm `accept`, trả về một đối tượng socket mới bất cứ khi nào một client mới được nhận. Đối tượng socket được trả về tham chiếu tới stream channel bên dưới giữa server và client được chấp nhận. Lưu ý rằng mỗi client có stream channel riêng, và do đó có socket descriptor riêng.

Lưu ý rằng nếu stream listener socket là blocking (mặc định là vậy), hàm `accept` sẽ chặn việc thực thi cho đến khi một client mới được nhận. Nói cách khác, nếu không có client đến nào, thread gọi hàm `accept` bị chặn phía sau nó.

Giờ, đã đến lúc xem các bước trên cùng nhau ở một chỗ. Code box sau cho thấy stream server từ dự án calculator, lắng nghe trên một UDS:

```
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <unistd.h>
#include <stdlib.h>
#include <pthread.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <stream_server_core.h>
int main(int argc, char** argv) {
  char sock_file[] = "/tmp/calc_svc.sock";
  // ----------- 1. Create socket object ------------------
  int server_sd = socket(AF_UNIX, SOCK_STREAM, 0);
  if (server_sd == -1) {
    fprintf(stderr, "Could not create socket: %s\n",
            strerror(errno));
    exit(1);
  }
  // ----------- 2. Bind the socket file ------------------
  // Delete the previously created socket file if it exists.
  unlink(sock_file);
  // Prepare the address
  struct sockaddr_un addr;
  memset(&addr, 0, sizeof(addr));
  addr.sun_family = AF_UNIX;
  strncpy(addr.sun_path, sock_file, sizeof(addr.sun_path) - 1);
  int result = bind(server_sd,
          (struct sockaddr*)&addr, sizeof(addr));
  if (result == -1) {
    close(server_sd);
    fprintf(stderr, "Could not bind the address: %s\n",
            strerror(errno));
    exit(1);
  }
  // ----------- 3. Prepare backlog ------------------
  result = listen(server_sd, 10);
  if (result == -1) {
    close(server_sd);
    fprintf(stderr, "Could not set the backlog: %s\n",
            strerror(errno));
    exit(1);
  }
  // ----------- 4. Start accepting clients ---------
 accept_forever(server_sd);
  return 0;
}
```

*Code Box 20-17 [server/unix/stream/main.c]: Hàm main của stream calculator service lắng nghe trên một endpoint UDS*

Sẽ dễ dàng<a id="_idIndexMarker1506"></a> tìm các khối code thực hiện các bước đã nêu trong việc khởi tạo một server socket. Thứ duy nhất còn thiếu là code client-accepting (chấp nhận client). Code thực sự để chấp nhận các client mới được đặt trong một hàm riêng<a id="_idIndexMarker1507"></a> gọi là `accept_forever`. Lưu ý rằng hàm này là blocking và chặn main thread cho đến khi server dừng.

Trong code box sau, bạn có thể thấy định nghĩa của hàm `accept_forever`. Hàm này là một phần của library chung của server nằm trong thư mục `srvcore`. Hàm này nên ở đó vì định nghĩa của nó vẫn như nhau cho các stream socket khác như TCP socket. Do đó, chúng ta có thể tái sử dụng logic hiện có thay vì viết lại nó:

```
void accept_forever(int server_sd) {
  while (1) {
    int client_sd = accept(server_sd, NULL, NULL);
    if (client_sd == -1) {
      close(server_sd);
      fprintf(stderr, "Could not accept the client: %s\n",
              strerror(errno));
      exit(1);
    }
    pthread_t client_handler_thread;
    int* arg = (int *)malloc(sizeof(int));
    *arg = client_sd;
    int result = pthread_create(&client_handler_thread, NULL,
 &client_handler, arg);
    if (result) {
      close(client_sd);
      close(server_sd);
      free(arg);
      fprintf(stderr, "Could not start the client handler thread.\n");
      exit(1);
    }
  }
}
```

*Code Box 20-18 [server/srvcore/stream_server_core.c]: Hàm chấp nhận các client mới trên một stream socket lắng nghe trên một endpoint UDS*

Như bạn có thể thấy trong code box trên, khi chấp nhận một client mới, chúng ta sinh ra một thread mới chịu trách nhiệm <a id="_idIndexMarker1508"></a>xử lý client. Việc này thực chất bao gồm đọc byte từ channel của client, truyền các byte đã đọc vào deserializer, và tạo ra<a id="_idIndexMarker1509"></a> các phản hồi phù hợp nếu một yêu cầu đã được phát hiện.

Tạo một thread mới cho mỗi client thường là mẫu cho mọi process server hoạt động trên một stream channel blocking, bất kể loại socket là gì. Do đó, trong những trường hợp sử dụng như vậy, multithreading và mọi chủ đề xung quanh trở nên vô cùng quan trọng.

> **Lưu ý**:
>
> Đối với các stream channel non-blocking<a id="_idIndexMarker1510"></a>, một cách tiếp cận khác được biết đến là *event loop* thường được dùng.

Khi bạn có đối tượng socket của một client, bạn có thể dùng nó để đọc từ client, cũng như ghi tới client. Nếu chúng ta theo con đường mà chúng ta đã đi cho đến giờ trong library `srvcore`, bước tiếp theo là xem companion function của thread của một client; `client_handler`. Hàm này có thể được tìm thấy cạnh `accept_forever` trong code base. Tiếp theo, bạn có thể thấy code box chứa định nghĩa của hàm:

```
void* client_handler(void *arg) {
  struct client_context_t context;
  context.addr = (struct client_addr_t*)
      malloc(sizeof(struct client_addr_t));
  context.addr->sd = *((int*)arg);
  free((int*)arg);
  context.ser = calc_proto_ser_new();
  calc_proto_ser_ctor(context.ser, &context, 256);
  calc_proto_ser_set_req_callback(context.ser, request_callback);
  calc_proto_ser_set_error_callback(context.ser, error_callback);
  context.svc = calc_service_new();
  calc_service_ctor(context.svc);
 context.write_resp = &stream_write_resp;
  int ret;
  char buffer[128];
  while (1) {
    int ret = read(context.addr->sd, buffer, 128);
    if (ret == 0 || ret == -1) {
      break;
    }
    struct buffer_t buf;
    buf.data = buffer; buf.len = ret;
 calc_proto_ser_server_deserialize(context.ser, buf, NULL);
  }
  calc_service_dtor(context.svc);
  calc_service_delete(context.svc);
  calc_proto_ser_dtor(context.ser);
  calc_proto_ser_delete(context.ser);
  free(context.addr);
  return NULL;
}
```

*Code Box 20-19 [server/srvcore/stream_server_core.c]: Companion function của thread client-handling (xử lý client)*

Có<a id="_idIndexMarker1511"></a> nhiều chi tiết<a id="_idIndexMarker1512"></a> liên quan đến code trên, nhưng có một vài chi tiết quan trọng mà tôi muốn đề cập. Như bạn thấy, chúng ta đang dùng hàm `read` để đọc các khối từ client. Nếu bạn còn nhớ, hàm `read` nhận một file descriptor nhưng ở đây chúng ta đang truyền một socket descriptor. Điều này cho thấy, bất chấp những khác biệt giữa file descriptor và socket descriptor, đối với các hàm I/O, chúng ta có thể dùng cùng API.

Trong code trên, chúng ta đọc các khối byte từ input và chúng ta truyền chúng cho deserializer bằng cách gọi hàm `calc_proto_ser_server_deserialize`. Có thể gọi hàm này ba hay bốn lần trước khi có một yêu cầu được deserialize đầy đủ. Điều này phụ thuộc rất nhiều vào kích thước khối mà bạn đọc từ input và độ dài của các thông điệp được truyền trên channel.

Một lưu ý thêm, mỗi client có đối tượng serializer riêng. Điều này cũng đúng với đối tượng calculator service. Những đối tượng này được tạo và hủy trong cùng thread.

Và lưu ý cuối cùng về code box trên, chúng ta đang dùng một hàm để ghi các phản hồi lại cho client. Hàm đó là `stream_write_response` và nó được dùng trên một stream socket. Hàm này có thể được tìm thấy trong cùng file với các code box trên. Tiếp theo, bạn có thể thấy định nghĩa của hàm này:

```
void stream_write_resp(
        struct client_context_t* context,
        struct calc_proto_resp_t* resp) {
  struct buffer_t buf =
      calc_proto_ser_server_serialize(context->ser, resp);
  if (buf.len == 0) {
    close(context->addr->sd);
    fprintf(stderr, "Internal error while serializing response\n");
    exit(1);
  }
  int ret = write(context->addr->sd, buf.data, buf.len);
  free(buf.data);
  if (ret == -1) {
    fprintf(stderr, "Could not write to client: %s\n",
            strerror(errno));
 close(context->addr->sd);
    exit(1);
  } else if (ret < buf.len) {
    fprintf(stderr, "WARN: Less bytes were written!\n");
    exit(1);
  }
}
```

*Code Box 20-20 [server/srvcore/stream_server_core.c]: Hàm được dùng để ghi các phản hồi lại cho client*

Như bạn thấy trong<a id="_idIndexMarker1515"></a> code trên, chúng ta đang dùng hàm `write` để ghi một thông điệp lại cho client. Như chúng ta biết, hàm `write` có thể nhận file descriptor, nhưng có vẻ như socket descriptor cũng có thể được dùng. Vì vậy, điều đó cho thấy rõ rằng POSIX I/O API hoạt động cho cả file descriptor lẫn socket descriptor.

Phát biểu<a id="_idIndexMarker1516"></a> trên cũng đúng với hàm `close`. Như bạn có thể thấy, chúng ta đã dùng nó để kết thúc một kết nối. Chỉ cần truyền socket descriptor là đủ trong khi chúng ta biết rằng nó cũng hoạt động cho file descriptor.

Giờ chúng ta đã đi qua một số phần quan trọng nhất của UDS stream server và chúng ta có một ý niệm về cách nó hoạt động, đã đến lúc tiếp tục và thảo luận về UDS stream client. Chắc chắn, có nhiều chỗ trong code mà chúng ta chưa thảo luận nhưng bạn nên dành thời gian và đi qua chúng.

<a id="_idParaDest-299"></a>

### UDS stream client

Giống như chương trình server<a id="_idIndexMarker1517"></a> được mô tả trong phần trước, client cũng<a id="_idIndexMarker1518"></a> cần tạo một đối tượng socket trước. Hãy nhớ rằng giờ chúng ta cần theo trình tự stream connector. Nó dùng cùng đoạn code như server, với chính xác cùng các argument, để chỉ ra rằng nó cần một UDS. Sau đó, nó cần kết nối tới process server bằng cách chỉ định một endpoint UDS, tương tự cách server đã làm. Khi stream channel được thiết lập, process client có thể dùng socket descriptor đã mở để đọc từ và ghi vào channel.

Tiếp theo, bạn có thể thấy hàm `main` của stream client kết nối tới một endpoint UDS:

```
int main(int argc, char** argv) {
  char sock_file[] = "/tmp/calc_svc.sock";
  // ----------- 1. Create socket object ------------------
  int conn_sd = socket(AF_UNIX, SOCK_STREAM, 0);
  if (conn_sd == -1) {
    fprintf(stderr, "Could not create socket: %s\n",
            strerror(errno));
    exit(1);
  }
  // ----------- 2. Connect to server ---------------------
  // Prepare the address
  struct sockaddr_un addr;
  memset(&addr, 0, sizeof(addr));
  addr.sun_family = AF_UNIX;
  strncpy(addr.sun_path, sock_file, sizeof(addr.sun_path) - 1);
  int result = connect(conn_sd,
          (struct sockaddr*)&addr, sizeof(addr));
  if (result == -1) {
    close(conn_sd);
    fprintf(stderr, "Could no connect: %s\n", strerror(errno));
    exit(1);
  }
  stream_client_loop(conn_sd);
  return 0;
}
```

*Code Box 20-21 [client/unix/stream/main.c]: Hàm main của stream client kết nối tới một endpoint UDS*

Như bạn có thể thấy, phần đầu của code rất giống code server nhưng sau đó, client gọi <a id="_idIndexMarker1519"></a>`connect` thay vì `bind`. Lưu ý rằng code chuẩn bị address giống hệt như của server.

Khi `connect`<a id="_idIndexMarker1520"></a> trả về thành công, nó đã liên kết socket descriptor `conn_sd` với channel đã mở. Do đó, từ giờ trở đi, `conn_sd` có thể được dùng để giao tiếp với server. Chúng ta truyền nó cho hàm `stream_client_loop`, vốn khởi động command line của client và thực hiện phần còn lại của các hành động được client thực hiện. Nó là một hàm blocking chạy client cho đến khi nó thoát.

Lưu ý rằng client cũng dùng các hàm `read` và `write` để truyền thông điệp qua lại từ và tới server. *Code Box 20-22* chứa định nghĩa của hàm `stream_client_loop`, vốn là một phần của library chung của client được mọi stream client dùng, bất kể loại socket và được chia sẻ giữa UDS và TCP socket. Như bạn thấy, nó dùng hàm `write` để gửi một thông điệp yêu cầu đã serialize tới server:

```
void stream_client_loop(int conn_sd) {
  struct context_t context;
  context.sd = conn_sd;
 context.ser = calc_proto_ser_new();
  calc_proto_ser_ctor(context.ser, &context, 128);
  calc_proto_ser_set_resp_callback(context.ser, on_response);
  calc_proto_ser_set_error_callback(context.ser, on_error);
  pthread_t reader_thread;
  pthread_create(&reader_thread, NULL,
 stream_response_reader, &context);
  char buf[128];
  printf("? (type quit to exit) ");
  while (1) {
    scanf("%s", buf);
    int brk = 0, cnt = 0;
    struct calc_proto_req_t req;
    parse_client_input(buf, &req, &brk, &cnt);
    if (brk) {
      break;
    }
    if (cnt) {
      continue;
    }
    struct buffer_t ser_req =
        calc_proto_ser_client_serialize(context.ser, &req);
    int ret = write(context.sd, ser_req.data, ser_req.len);
    if (ret == -1) {
      fprintf(stderr, "Error while writing! %s\n",
              strerror(errno));
      break;
    }
    if (ret < ser_req.len) {
      fprintf(stderr, "Wrote less than anticipated!\n");
      break;
    }
    printf("The req(%d) is sent.\n", req.id);
  }
  shutdown(conn_sd, SHUT_RD);
  calc_proto_ser_dtor(context.ser);
  calc_proto_ser_delete(context.ser);
 pthread_join(reader_thread, NULL);
  printf("Bye.\n");
}
```

*Code Box 20-22 [client/clicore/stream_client_core.c]: Hàm thực thi một stream client*

Như bạn có thể thấy trong <a id="_idIndexMarker1523"></a>code trên, mỗi process client chỉ có một đối tượng serializer và điều đó hợp lý. Điều này ngược với process server, nơi mỗi client có một đối tượng serializer riêng.

Hơn thế nữa, process client <a id="_idIndexMarker1524"></a>sinh ra một thread riêng để đọc các phản hồi từ phía server. Đó là vì việc đọc từ process server là một tác vụ blocking và nó nên được thực hiện trong một luồng thực thi riêng.

Trong main thread, chúng ta có command line của client, nhận input từ người dùng qua Terminal. Như bạn thấy, main thread join thread đọc khi thoát và nó chờ thread đó hoàn tất.

Một lưu ý thêm về code trên, process client dùng cùng I/O API để đọc từ và ghi vào stream channel. Như chúng tôi đã nói trước đây, các hàm `read` và `write` được dùng và cách dùng hàm `write` có thể được thấy trong *Code Box 20-22*.

Trong phần sau, chúng ta nói về datagram channel nhưng vẫn dùng UDS cho mục đích đó. Chúng ta bắt đầu với datagram server trước.

<a id="_idParaDest-300"></a>

### UDS datagram server

Nếu bạn còn nhớ<a id="_idIndexMarker1525"></a> từ chương trước, các process datagram có các trình tự listener và connector<a id="_idIndexMarker1526"></a> riêng về việc truyền transport. Giờ là lúc minh họa một datagram server có thể được phát triển dựa trên UDS như thế nào.

Theo trình tự datagram listener, process cần tạo một đối tượng socket trước. Code box sau minh họa điều đó:

```
int server_sd = socket(AF_UNIX, SOCK_DGRAM, 0);
if (server_sd == -1) {
  fprintf(stderr, "Could not create socket: %s\n",
          strerror(errno));
  exit(1);
}
```

*Code Box 20-23 [server/unix/datagram/main.c]: Tạo một đối tượng UDS được dùng để hoạt động trên một datagram channel*

Bạn thấy rằng chúng ta đã dùng `SOCK_DGRAM` thay vì `SOCK_STREAM`. Điều này có nghĩa là đối tượng socket sẽ hoạt động trên một datagram channel. Hai argument còn lại vẫn như nhau.

Là bước thứ hai trong trình tự datagram listener, chúng ta cần bind socket tới một endpoint UDS. Như chúng tôi đã nói trước đây, đây là một socket file. Bước này giống hệt như đối với stream server, và do đó chúng tôi không minh họa nó dưới đây và bạn có thể thấy nó trong *Code Box 20-14*.

Đối với một process datagram listener, những bước này là những bước duy nhất cần được thực hiện, và không có backlog nào gắn với một datagram socket cần được cấu hình. Hơn thế nữa, không có giai đoạn client-accepting vì chúng ta không thể có các kết nối stream trên một số channel 1-to-1 (một-một) riêng.

Tiếp theo, bạn có thể thấy hàm `main` của datagram server lắng nghe trên một endpoint UDS, trong dự án calculator:

```
int main(int argc, char** argv) {
  char sock_file[] = "/tmp/calc_svc.sock";
  // ----------- 1. Create socket object ------------------
 int server_sd = socket(AF_UNIX, SOCK_DGRAM, 0);
  if (server_sd == -1) {
    fprintf(stderr, "Could not create socket: %s\n",
            strerror(errno));
    exit(1);
  }
  // ----------- 2. Bind the socket file ------------------
  // Delete the previously created socket file if it exists.
  unlink(sock_file);
  // Prepare the address
  struct sockaddr_un addr;
  memset(&addr, 0, sizeof(addr));
  addr.sun_family = AF_UNIX;
  strncpy(addr.sun_path, sock_file, sizeof(addr.sun_path) - 1);
 int result = bind(server_sd,
 (struct sockaddr*)&addr, sizeof(addr));
  if (result == -1) {
    close(server_sd);
    fprintf(stderr, "Could not bind the address: %s\n",
            strerror(errno));
    exit(1);
  }
  // ----------- 3. Start serving requests ---------
 serve_forever(server_sd);
  return 0;
}
```

*Code Box 20-24 [server/unix/datagram/main.c]: Hàm main của datagram server lắng nghe trên một endpoint UDS*

Như bạn biết, datagram channel là connection-less, và chúng không hoạt động như stream channel. Nói cách khác, không thể <a id="_idIndexMarker1529"></a>có một kết nối 1-to-1<a id="_idIndexMarker1530"></a> riêng giữa hai process. Do đó, các process chỉ có thể truyền datagram dọc theo channel. Một process client chỉ có thể gửi một số datagram riêng lẻ và độc lập và tương tự, process server chỉ có thể nhận datagram và gửi lại một số datagram khác làm phản hồi.

Vì vậy, điều then chốt về một datagram channel là các thông điệp yêu cầu và phản hồi nên vừa trong một datagram duy nhất. Nếu không, chúng không thể được chia giữa hai datagram và server hay client không thể xử lý thông điệp. May mắn thay, các thông điệp của chúng ta trong dự án calculator hầu hết đủ ngắn để vừa trong một datagram duy nhất.

Kích thước của một datagram phụ thuộc rất nhiều vào channel bên dưới. Ví dụ, đối với datagram UDS, điều này khá linh hoạt vì nó diễn ra qua kernel, nhưng đối với UDP socket, bạn bị ràng buộc vào cấu hình của mạng. Về UDS, link sau có thể [ding the UDS the following link can give you a better idea of how to set the correct size: https://stackov](https://stackoverflow.com/questions/21856517/whats-the-practical-limit-on-the-size-of-single-packet-transmitted-over-domain)erflow.com/questions/21856517/whats-the-practical-limit-on-the-size-of-single-packet-transmitted-over-domain (cho bạn ý niệm tốt hơn về cách đặt kích thước đúng).

Một khác biệt khác mà chúng ta có thể đề cập về datagram socket và stream socket là I/O API được dùng để truyền dữ liệu dọc theo chúng. Trong khi các hàm `read` và `write` vẫn có thể được dùng cho datagram socket giống như stream socket, chúng ta dùng các hàm khác để đọc từ và gửi tới một datagram channel. Các hàm `recvfrom` và `sendto` thường được dùng.

Đó là vì trong stream socket, channel là riêng, và khi bạn ghi vào một channel, cả hai đầu đều được xác định. Đối với datagram socket, chúng ta chỉ có một channel đang được dùng bởi nhiều<a id="_idIndexMarker1531"></a> bên. Do đó, chúng ta có thể mất dấu process sở hữu một datagram cụ thể. Những hàm này có thể theo dõi và gửi datagram lại cho process mong muốn.

Tiếp theo, bạn có thể tìm thấy định nghĩa cho hàm `serve_forever` được dùng trong *Code Box 20-24* ở cuối hàm `main`. Hàm này thuộc về library chung của server và đặc thù cho datagram server, bất kể loại socket. Bạn có thể thấy rõ hàm `recvfrom` đã được dùng như thế nào:

```
void serve_forever(int server_sd) {
  char buffer[64];
  while (1) {
    struct sockaddr* sockaddr = sockaddr_new();
    socklen_t socklen = sockaddr_sizeof();
    int read_nr_bytes = recvfrom(server_sd, buffer,
            sizeof(buffer), 0, sockaddr, &socklen);
    if (read_nr_bytes == -1) {
      close(server_sd);
      fprintf(stderr, "Could not read from datagram socket: %s\n",
              strerror(errno));
      exit(1);
    }
    struct client_context_t context;
 context.addr = (struct client_addr_t*)
        malloc(sizeof(struct client_addr_t));
    context.addr->server_sd = server_sd;
    context.addr->sockaddr = sockaddr;
    context.addr->socklen = socklen;
 context.ser = calc_proto_ser_new();
    calc_proto_ser_ctor(context.ser, &context, 256);
    calc_proto_ser_set_req_callback(context.ser, request_callback);
    calc_proto_ser_set_error_callback(context.ser, error_callback);
    context.svc = calc_service_new();
    calc_service_ctor(context.svc);
 context.write_resp = &datagram_write_resp;
    bool_t req_found = FALSE;
    struct buffer_t buf;
    buf.data = buffer;
    buf.len = read_nr_bytes;
    calc_proto_ser_server_deserialize(context.ser, buf, &req_found);
    if (!req_found) {
      struct calc_proto_resp_t resp;
      resp.req_id = -1;
      resp.status = ERROR_INVALID_RESPONSE;
      resp.result = 0.0;
      context.write_resp(&context, &resp);
    }
    calc_service_dtor(context.svc);
    calc_service_delete(context.svc);
    calc_proto_ser_dtor(context.ser);
    calc_proto_ser_delete(context.ser);
    free(context.addr->sockaddr);
    free(context.addr);
  }
}
```

*Code Box 20-25 [server/srvcore/datagram_server_core.c]: Hàm xử lý các datagram có trong library chung của server, dành riêng cho datagram server*

Như bạn thấy trong code box trên, datagram server là một chương trình single-threaded và không có <a id="_idIndexMarker1532"></a>multithreading nào xung quanh nó. Hơn thế nữa, nó thao tác trên mỗi datagram một cách riêng lẻ và độc lập. Nó nhận một datagram, deserialize nội dung của nó và tạo đối tượng yêu cầu, xử lý<a id="_idIndexMarker1533"></a> yêu cầu qua service object, serialize đối tượng phản hồi và đặt nó vào một datagram mới, và gửi nó lại cho process sở hữu datagram ban đầu. Nó thực hiện cùng chu trình hết lần này đến lần khác cho mọi datagram đến.

Lưu ý rằng mỗi datagram có đối tượng serializer riêng và service object riêng. Chúng ta có thể thiết kế điều này theo cách mà chúng ta chỉ có một serializer và một service object cho mọi datagram. Đây có thể là một điều thú vị để bạn suy nghĩ về việc nó khả thi như thế nào và tại sao điều đó có thể không khả thi cho dự án calculator. Đây là một thảo luận có thể tranh luận và bạn có thể nhận được các ý kiến khác nhau từ những người khác nhau.

Lưu ý rằng trong *Code Box 20-25*, chúng ta lưu address client của một datagram khi nhận nó. Sau đó, chúng ta có thể dùng address này để ghi trực tiếp lại cho client đó. Đáng để xem cách chúng ta ghi datagram lại cho client gửi. Giống như stream server, chúng ta đang dùng một hàm cho mục đích này. *Code Box 20-26* cho thấy định nghĩa của hàm `datagram_write_resp`. Hàm này nằm trong library chung của datagram server cạnh hàm `serve_forever`:

```
void datagram_write_resp(struct client_context_t* context,
        struct calc_proto_resp_t* resp) {
  struct buffer_t buf =
      calc_proto_ser_server_serialize(context->ser, resp);
  if (buf.len == 0) {
    close(context->addr->server_sd);
    fprintf(stderr, "Internal error while serializing object.\n");
    exit(1);
  }
  int ret = sendto(context->addr->server_sd, buf.data, buf.len,
      0, context->addr->sockaddr, context->addr->socklen);
  free(buf.data);
  if (ret == -1) {
    fprintf(stderr, "Could not write to client: %s\n",
            strerror(errno));
 close(context->addr->server_sd);
    exit(1);
  } else if (ret < buf.len) {
    fprintf(stderr, "WARN: Less bytes were written!\n");
    close(context->addr->server_sd);
    exit(1);
  }
}
```

*Code Box 20-26 [server/srvcore/datagram_server_core.c]: Hàm ghi datagram lại cho các client*

Bạn có thể thấy rằng chúng ta dùng address client đã lưu và chúng ta truyền nó cho hàm `sendto` cùng với thông điệp phản hồi đã serialize<a id="_idIndexMarker1534"></a>. Phần còn lại được hệ điều hành lo và datagram được gửi trực tiếp lại cho<a id="_idIndexMarker1535"></a> client gửi.

Giờ chúng ta đã biết đủ về datagram server và socket nên được dùng như thế nào, hãy xem datagram client, vốn đang dùng cùng loại socket.

<a id="_idParaDest-301"></a>

### UDS datagram client

Từ góc nhìn kỹ thuật, stream<a id="_idIndexMarker1536"></a> client và datagram client <a id="_idIndexMarker1537"></a>rất giống nhau. Điều đó có nghĩa là bạn sẽ thấy gần như cùng cấu trúc tổng thể nhưng với một số khác biệt liên quan đến việc truyền datagram thay vì hoạt động trên một stream channel.

Nhưng có một khác biệt lớn giữa chúng, và điều này khá độc nhất và đặc thù cho các datagram client kết nối tới các endpoint UDS.

Khác biệt là datagram client cần bind một socket file, giống như chương trình server, để nhận các datagram được gửi tới nó. Điều này không đúng với các datagram client dùng network socket, như bạn sẽ thấy ngay sau đây. Lưu ý rằng client nên bind một socket file khác, chứ không phải socket file của server.

Lý do chính đằng sau khác biệt này là thực tế rằng chương trình server cần một address để gửi phản hồi lại, và nếu datagram client không bind một socket file, không có endpoint nào được bind tới socket file của client. Nhưng đối với network socket, một client luôn có một socket descriptor tương ứng được bind tới một IP address và một port, nên vấn đề này không thể xảy ra.

Nếu chúng ta gạt khác biệt này sang một bên, chúng ta có thể thấy code giống nhau đến mức nào. Trong *Code Box 20-26*, bạn có thể thấy hàm `main` của datagram calculator client:

```
int main(int argc, char** argv) {
  char server_sock_file[] = "/tmp/calc_svc.sock";
  char client_sock_file[] = "/tmp/calc_cli.sock";
  // ----------- 1. Create socket object ------------------
  int conn_sd = socket(AF_UNIX, SOCK_DGRAM, 0);
  if (conn_sd == -1) {
    fprintf(stderr, "Could not create socket: %s\n",
            strerror(errno));
    exit(1);
  }
  // ----------- 2. Bind the client socket file ------------
  // Delete the previously created socket file if it exists.
  unlink(client_sock_file);
  // Prepare the client address
  struct sockaddr_un addr;
  memset(&addr, 0, sizeof(addr));
  addr.sun_family = AF_UNIX;
  strncpy(addr.sun_path, client_sock_file,
          sizeof(addr.sun_path) - 1);
 int result = bind(conn_sd,
 (struct sockaddr*)&addr, sizeof(addr));
  if (result == -1) {
    close(conn_sd);
    fprintf(stderr, "Could not bind the client address: %s\n",
            strerror(errno));
    exit(1);
  }
  // ----------- 3. Connect to server --------------------
  // Prepare the server address
  memset(&addr, 0, sizeof(addr));
  addr.sun_family = AF_UNIX;
  strncpy(addr.sun_path, server_sock_file,
          sizeof(addr.sun_path) - 1);
 result = connect(conn_sd,
 (struct sockaddr*)&addr, sizeof(addr));
  if (result == -1) {
    close(conn_sd);
    fprintf(stderr, "Could no connect: %s\n", strerror(errno));
    exit(1);
  }
 datagram_client_loop(conn_sd);
  return 0;
}
```

*Code Box 20-26 [server/srvcore/datagram_server_core.c]: Hàm ghi datagram lại cho các client*

Như chúng tôi đã giải thích trước đó, và như<a id="_idIndexMarker1539"></a> có thể thấy trong code, client cần bind một socket file. Và dĩ nhiên, chúng ta phải gọi một hàm khác để khởi động vòng lặp client, ở cuối hàm `main`. Datagram client gọi hàm `datagram_client_loop`.

Nếu bạn nhìn vào<a id="_idIndexMarker1540"></a> hàm `datagram_client_loop`, bạn vẫn thấy nhiều điểm tương đồng giữa stream client và datagram client. Bất chấp những khác biệt nhỏ, một khác biệt lớn là việc dùng các hàm `recvfrom` và `sendto` thay cho các hàm `read` và `write`. Cùng giải thích được đưa ra cho những hàm này trong phần trước vẫn đúng cho datagram client.

Giờ là lúc nói về network socket. Như bạn sẽ thấy, hàm `main` trong các chương trình client và server là code duy nhất thay đổi khi chuyển từ UDS sang network socket.

<a id="_idParaDest-302"></a>

## Network socket

Socket<a id="_idIndexMarker1541"></a> address family khác được dùng rộng rãi là `AF_INET`. Nó đơn giản chỉ bất kỳ channel nào được thiết lập trên một kết nối mạng. Không giống các UDS stream socket và datagram socket, vốn không có tên giao thức nào được gán cho chúng, có hai giao thức well-known trên network socket. TCP socket thiết lập một stream channel giữa mỗi hai process, và UDP socket thiết lập một datagram channel có thể được dùng bởi một số process.

Trong các phần sau, chúng tôi sẽ giải thích cách phát triển chương trình dùng TCP socket và UDP socket và xem một số ví dụ thật trong dự án calculator.

<a id="_idParaDest-303"></a>

### TCP server

Một chương trình dùng một TCP socket để<a id="_idIndexMarker1542"></a> lắng nghe và chấp nhận một số client, nói cách <a id="_idIndexMarker1543"></a>khác là một TCP server, khác với một stream server lắng nghe trên một endpoint UDS ở hai điểm: thứ nhất, nó chỉ định một address family khác, `AF_INET` thay vì `AF_UNIX`, khi gọi hàm `socket`. Và thứ hai, nó dùng một structure khác cho socket address cần thiết cho việc bind.

Bất chấp hai khác biệt này, mọi thứ khác sẽ như nhau đối với một TCP socket về mặt thao tác I/O. Chúng ta nên lưu ý rằng một TCP socket là một stream socket, do đó code được viết cho một stream socket dùng UDS cũng nên hoạt động cho một TCP socket.

Nếu chúng ta quay lại dự án calculator, chúng ta kỳ vọng thấy những khác biệt chỉ trong các hàm `main` nơi chúng ta tạo đối tượng socket và bind nó tới một endpoint. Ngoài điều đó, phần còn lại của code nên giữ nguyên. Thực tế, đây là những gì chúng ta thực sự thấy. Code box sau chứa hàm `main` của TCP calculator server:

```
int main(int argc, char** argv) {
  // ----------- 1. Create socket object ------------------
  int server_sd = socket(AF_INET, SOCK_STREAM, 0);
  if (server_sd == -1) {
    fprintf(stderr, "Could not create socket: %s\n",
            strerror(errno));
    exit(1);
  }
  // ----------- 2. Bind the socket file ------------------
  // Prepare the address
 struct sockaddr_in addr;
  memset(&addr, 0, sizeof(addr));
  addr.sin_family = AF_INET;
  addr.sin_addr.s_addr = INADDR_ANY;
  addr.sin_port = htons(6666);
  ...
  // ----------- 3. Prepare backlog ------------------
  ...
  // ----------- 4. Start accepting clients ---------
 accept_forever(server_sd);
  return 0;
}
```

*Code Box 20-27 [server/tcp/main.c]: Hàm main của TCP calculator client*

Nếu bạn so sánh<a id="_idIndexMarker1544"></a> code trên với hàm `main` thấy trong *Code Box 20-17*, bạn sẽ nhận thấy những khác biệt chúng tôi đã giải thích trước đó. Thay vì dùng structure `sockaddr_un `, chúng ta đang dùng structure `sockaddr_in` cho<a id="_idIndexMarker1545"></a> address endpoint được bind. Hàm `listen` được dùng như nhau, và thậm chí cùng hàm `accept_forever` đã được gọi để xử lý các kết nối đến.

Lưu ý cuối cùng, về các thao tác I/O trên một TCP socket, vì một TCP socket là một stream socket, nó kế thừa mọi thuộc tính từ một stream socket; do đó, nó có thể được dùng giống như bất kỳ stream socket nào khác. Nói cách khác, cùng các hàm `read`, `write` và `close` có thể được dùng.

Giờ hãy nói về TCP client.

<a id="_idParaDest-304"></a>

### TCP client

Một lần nữa, mọi thứ nên<a id="_idIndexMarker1546"></a> rất giống stream client hoạt động <a id="_idIndexMarker1547"></a>trên một UDS. Những khác biệt được đề cập trong phần trước vẫn đúng cho một TCP socket ở phía connector. Các thay đổi một lần nữa chỉ giới hạn ở hàm `main`.

Tiếp theo, bạn có thể thấy hàm `main` của TCP calculator client:

```
int main(int argc, char** argv) {
  // ----------- 1. Create socket object ------------------
  int conn_sd = socket(AF_INET, SOCK_STREAM, 0);
  if (conn_sd == -1) {
    fprintf(stderr, "Could not create socket: %s\n",
            strerror(errno));
    exit(1);
  }
  // ------------ 2. Connect to server-- ------------------
  // Find the IP address behind the hostname
  ...
  // Prepare the address
 struct sockaddr_in addr;
  memset(&addr, 0, sizeof(addr));
  addr.sin_family = AF_INET;
  addr.sin_addr = *((struct in_addr*)host_entry->h_addr);
  addr.sin_port = htons(6666);
  ...
 stream_client_loop(conn_sd);
  return 0;
}
```

*Code Box 20-27 [server/tcp/main.c]: Hàm main của TCP calculator server*

Các thay đổi <a id="_idIndexMarker1548"></a>rất giống những gì chúng ta đã thấy cho chương trình TCP server<a id="_idIndexMarker1549"></a>. Một address family khác và một socket address structure khác đã được dùng. Ngoài điều đó, phần còn lại của code là như nhau, và do đó chúng ta không cần thảo luận chi tiết về TCP client.

Vì TCP socket là stream socket, chúng ta có thể dùng cùng code chung để xử lý các client mới. Bạn có thể thấy điều này qua việc gọi hàm `stream_client_loop`, vốn là một phần của library chung của client trong dự án calculator. Giờ, bạn hẳn đã hiểu tại sao chúng ta trích xuất hai library chung, một cho các chương trình client và một cho các chương trình server, để viết ít code hơn. Khi chúng ta có thể dùng cùng code cho hai kịch bản khác nhau, luôn tốt nhất là trích xuất nó thành một library và tái sử dụng nó trong các kịch bản.

Hãy xem các chương trình UDP server và client; chúng ta sẽ thấy rằng chúng ít nhiều tương tự những gì chúng ta đã thấy đối với các chương trình TCP.

<a id="_idParaDest-305"></a>

### UDP server

UDP socket là network <a id="_idIndexMarker1552"></a>socket. Ngoài ra, chúng là datagram <a id="_idIndexMarker1553"></a>socket. Do đó, chúng ta kỳ vọng quan sát thấy mức độ tương đồng cao giữa code chúng ta đã viết cho TCP server cùng với code chúng ta đã viết cho datagram server hoạt động trên một UDS.

Ngoài ra, khác biệt chính giữa một UDP socket và một TCP socket, bất kể được dùng trong một chương trình client hay server, là thực tế rằng loại socket là `SOCK_DGRAM` cho UDP socket. Address family vẫn như nhau, vì cả hai đều là network socket. Code box sau chứa hàm main của calculator UDP server:

```
int main(int argc, char** argv) {
  // ----------- 1. Create socket object ------------------
  int server_sd = socket(AF_INET, SOCK_DGRAM, 0);
  if (server_sd == -1) {
    fprintf(stderr, "Could not create socket: %s\n",
            strerror(errno));
    exit(1);
  }
  // ----------- 2. Bind the socket file ------------------
  // Prepare the address
 struct sockaddr_in addr;
  memset(&addr, 0, sizeof(addr));
  addr.sin_family = AF_INET;
  addr.sin_addr.s_addr = INADDR_ANY;
  addr.sin_port = htons(9999);
  ...
  // ----------- 3. Start serving requests ---------
 serve_forever(server_sd);
  return 0;
}
```

*Code Box 20-28 [server/udp/main.c]: Hàm main của UDP calculator server*

Lưu ý rằng UDP socket <a id="_idIndexMarker1554"></a>là datagram socket. Do đó, mọi code được viết cho datagram socket hoạt động trên UDS vẫn hợp lệ với chúng. Chẳng hạn, chúng ta phải dùng các hàm `recvfrom` và `sendto` để làm việc với UDP socket. Vì vậy, như bạn <a id="_idIndexMarker1555"></a>có thể thấy, chúng ta đã dùng cùng hàm `serve_forever` để phục vụ các datagram đến. Hàm này là một phần của library chung của server được dùng để chứa code datagram-related.

Chúng ta đã nói đủ về code của UDP server. Hãy xem code của UDP client trông như thế nào.

<a id="_idParaDest-306"></a>

### UDP client

Code UDP client rất<a id="_idIndexMarker1556"></a> giống code TCP client, nhưng nó dùng một <a id="_idIndexMarker1557"></a>loại socket khác và nó gọi một hàm khác để xử lý các thông điệp đến, vốn là cùng hàm mà datagram client dựa trên UDS đã dùng. Bạn có thể thấy hàm `main` sau:

```
int main(int argc, char** argv) {
  // ----------- 1. Create socket object ------------------
  int conn_sd = socket(AF_INET, SOCK_DGRAM, 0);
  if (conn_sd == -1) {
    fprintf(stderr, "Could not create socket: %s\n",
            strerror(errno));
    exit(1);
  }
  // ------------ 2. Connect to server-- ------------------
  ...
  // Prepare the address
  ...
 datagram_client_loop(conn_sd);
  return 0;
}
```

*Code Box 20-28 [client/udp/main.c]: Hàm main của UDP calculator client*

Đó là khái niệm cuối cùng cho chương này. Trong chương này, chúng ta đã đi qua các loại socket well-known khác nhau và cùng với đó, chúng tôi đã cho thấy các trình tự listener và connector cho cả stream channel lẫn datagram channel có thể được hiện thực trong C như thế nào.

Có nhiều điều trong dự án calculator mà chúng ta thậm chí chưa nói đến. Do đó, rất khuyến khích đi qua code, tìm những chỗ đó, và cố gắng đọc và hiểu nó. Có một ví dụ hoạt động đầy đủ có thể giúp bạn xem xét các khái niệm trong các ứng dụng thật.

<a id="_idParaDest-307"></a>

## Tóm tắt

Trong chương này, chúng ta đã đi qua các chủ đề sau:

- Chúng tôi đã giới thiệu các loại giao tiếp, channel, medium và socket khác nhau trong phần điểm lại các kỹ thuật IPC.
- Chúng ta đã khám phá một dự án calculator bằng việc mô tả application protocol của nó và thuật toán serialization mà nó dùng.
- Chúng tôi đã minh họa UDS có thể được dùng như thế nào để thiết lập một kết nối client-server, và chúng tôi đã cho thấy chúng được dùng như thế nào trong dự án calculator.
- Chúng ta đã thảo luận các stream channel và datagram channel được thiết lập bằng Unix domain socket, một cách riêng rẽ.
- Chúng tôi đã minh họa TCP socket và UDP socket có thể được dùng như thế nào để tạo một IPC channel client-server, và chúng ta đã dùng chúng trong ví dụ calculator.

Chương tiếp theo là về việc tích hợp C với các ngôn ngữ lập trình khác. Bằng cách làm như vậy, chúng ta có thể có một library C được nạp và dùng trong một ngôn ngữ lập trình khác như Java. Trong chương tiếp theo, chúng ta trình bày việc tích hợp với C++, Java, Python và Golang.
