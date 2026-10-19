# Chương 1. Giới thiệu

![Chapter 1 opener](images/ch01/ch01_opener.png)

Nghiên cứu source code của một dự án lớn giống như bước vào một vùng đất mới xa lạ, với những tập quán và kỳ vọng ngầm của riêng nó. Sẽ hữu ích nếu tìm hiểu trước một số quy ước chính và thử tương tác với cư dân ở đó, thay vì chỉ đứng ngoài quan sát.

Phần lớn chương này dành để giới thiệu một số programming pattern và thủ thuật phổ biến mà bạn sẽ thường gặp trong networking code.

Khi có thể, tôi khuyến khích bạn thử tương tác với một phần cụ thể của kernel networking code thông qua các công cụ user-space. Vì vậy, trong chương này, tôi sẽ chỉ dẫn một số nơi có thể tải các công cụ đó nếu chúng chưa được cài trên Linux distribution bạn ưa dùng, hoặc nếu bạn chỉ muốn nâng cấp chúng lên phiên bản mới nhất.

Tôi cũng sẽ mô tả một số công cụ giúp bạn tìm đường thuận lợi trong khối lượng kernel code khổng lồ. Cuối cùng, tôi sẽ giải thích ngắn gọn tại sao một kernel feature có thể không được tích hợp vào các kernel release chính thức, ngay cả khi nó được dùng rộng rãi trong cộng đồng Linux.

## Thuật ngữ cơ bản

Trong phần này, tôi sẽ giới thiệu những thuật ngữ và chữ viết tắt được sử dụng rộng rãi trong cuốn sách.

Các đại lượng Eight-bit thường được gọi là octet trong tài liệu networking. Tuy nhiên, trong sách này, tôi dùng thuật ngữ quen thuộc hơn là byte. Xét cho cùng, sách mô tả hành vi của kernel thay vì một network abstraction nào đó, và kernel developer đã quen suy nghĩ theo đơn vị byte.

Các thuật ngữ vector và array sẽ được dùng thay thế cho nhau.

Khi đề cập các layer của TCP/IP network stack, tôi sẽ dùng các chữ viết tắt L2, L3 và L4 để lần lượt chỉ link layer, network layer và transport layer.

Các con số này dựa trên mô hình OSI seven-layer nổi tiếng (dù không hẳn còn hiện hành). Trong phần lớn trường hợp, L2 đồng nghĩa với Ethernet, L3 với IP Version 4 hoặc 6, và L4 với UDP, TCP hoặc ICMP. Khi cần đề cập một protocol cụ thể, tôi sẽ dùng tên của nó (tức TCP) thay vì thuật ngữ protocol Ln tổng quát.

Trong các chương khác nhau, chúng ta sẽ xem cách các protocol nằm ở một layer cụ thể trong network stack nhận và truyền data unit. Trong những ngữ cảnh đó, các thuật ngữ ingress và input sẽ được dùng thay thế cho nhau. Điều tương tự áp dụng cho egress và output. Hoạt động nhận hoặc truyền một data unit có thể được gọi lần lượt bằng các chữ viết tắt RX và TX.

Một data unit có những tên khác nhau như frame, packet, segment và message, tùy layer sử dụng nó (xem Chương 13 để biết thêm chi tiết). Bảng 1-1 tóm tắt các chữ viết tắt chính bạn sẽ gặp trong sách.

Bảng 1-1. Các chữ viết tắt thường dùng trong sách

| Chữ viết tắt | Ý nghĩa |
|---|---|
| L2 | Link layer (ví dụ Ethernet) |
| L3 | Network layer (ví dụ IP) |
| L4 | Transport layer (ví dụ UDP/TCP/ICMP) |
| BH | Bottom half |
| IRQ | Interrupt |
| RX | Nhận |
| TX | Truyền |

## Các coding pattern phổ biến

Mỗi networking feature, giống bất kỳ kernel feature nào khác, chỉ là một cư dân bên trong kernel. Vì vậy, nó phải sử dụng memory, CPU và mọi shared resource khác một cách thích hợp và công bằng. Phần lớn feature không được viết thành những phần kernel code độc lập, mà tương tác ít nhiều với các kernel component khác tùy feature. Do đó, chúng cố gắng hết mức sử dụng những cơ chế tương tự để triển khai các chức năng tương tự (không cần phát minh lại bánh xe mỗi lần).

Một số yêu cầu là chung cho nhiều kernel component, chẳng hạn cần cấp phát nhiều instance của cùng một data structure type, cần theo dõi các reference tới một instance của data structure để tránh giải phóng memory không an toàn, v.v. Trong các mục tiếp theo, chúng ta sẽ xem những cách phổ biến trong Linux để xử lý các yêu cầu đó. Tôi cũng sẽ nói về các coding trick thường gặp khi duyệt kernel code.

Sách này dùng subsystem như một thuật ngữ tương đối rộng để mô tả tập hợp các file triển khai một nhóm feature chính — chẳng hạn IP hoặc routing — thường do cùng những người bảo trì và thay đổi đồng bộ với nhau. Trong phần còn lại của chương, tôi cũng sẽ dùng thuật ngữ kernel component để chỉ những subsystem này, vì các quy ước được thảo luận ở đây áp dụng cho phần lớn kernel, chứ không chỉ những phần liên quan networking.

### Các memory cache

Kernel dùng các function `kmalloc` và `kfree` để lần lượt cấp phát và giải phóng một memory block. Cú pháp của hai function này tương tự hai lời gọi tương ứng `malloc` và `free` trong thư viện libc user-space. Để biết thêm chi tiết về `kmalloc` và `kfree`, hãy tham khảo Linux Device Drivers (O’Reilly).

Một kernel component thường cấp phát nhiều instance của cùng một data structure type. Khi việc cấp phát và giải phóng dự kiến diễn ra thường xuyên, initialization routine của kernel component tương ứng (ví dụ `fib_hash_init` cho routing table) thường cấp phát một memory cache riêng để dùng cho các lần cấp phát. Khi một memory block được giải phóng, thực chất nó được trả về chính cache đã cấp phát nó.

Một số ví dụ về network data structure mà kernel duy trì memory cache riêng gồm:

Socket buffer descriptor

Cache này, do `skb_init` trong net/core/sk\_buff.c cấp phát, được dùng để cấp phát các buffer descriptor `sk_buff`. Structure `sk_buff` có lẽ là structure có số lần cấp phát và giải phóng cao nhất trong networking subsystem.

Các mapping của neighboring protocol

Mỗi neighboring protocol dùng một memory cache để cấp phát các data structure lưu address mapping L3-to-L2. Xem Chương 27.

Routing table

Routing code dùng hai memory cache cho hai data structure định nghĩa route. Xem Chương 32.

Sau đây là các kernel function chính dùng để xử lý memory cache:

`kmem_cache_create`

`kmem_cache_destroy`

Tạo và hủy một cache.

`kmem_cache_alloc`

`kmem_cache_free`

Cấp phát và trả một buffer về cache. Chúng thường được gọi qua wrapper, quản lý các yêu cầu cấp phát và giải phóng ở mức cao hơn. Ví dụ, yêu cầu giải phóng một instance của buffer `sk_buff` bằng `kfree_skb` cuối cùng chỉ gọi `kmem_cache_free` khi mọi reference tới buffer đã được giải phóng và các subsystem liên quan (chẳng hạn firewall) đã hoàn tất mọi thao tác dọn dẹp cần thiết.

Giới hạn số instance có thể được cấp phát từ một cache cụ thể (nếu có) thường được áp đặt bởi các wrapper quanh `kmem_cache_alloc`, và đôi khi có thể cấu hình bằng một parameter trong /proc.

Để biết thêm chi tiết về cách triển khai memory cache và cách chúng giao tiếp với slab allocator, hãy tham khảo Understanding the Linux Kernel (O’Reilly).

### Caching và hash table

Dùng cache để tăng hiệu năng là việc khá phổ biến. Trong networking code có cache cho mapping L3-to-L2 (chẳng hạn ARP cache được IPv4 sử dụng), cho routing table cache, v.v.

Cache lookup routine thường nhận một input parameter chỉ rõ liệu một cache miss có nên tạo một element mới và thêm nó vào cache hay không. Những lookup routine khác đơn giản là luôn thêm các element còn thiếu.

Cache thường được triển khai bằng hash table. Kernel cung cấp một tập data type, chẳng hạn list one-way và bidirectional, có thể dùng làm thành phần xây dựng các hash table đơn giản.

Cách chuẩn để xử lý các input được hash thành cùng một giá trị là đưa chúng vào một list. Duyệt list này mất nhiều thời gian hơn đáng kể so với lookup bằng hash key. Vì vậy, luôn cần giảm thiểu số input được hash thành cùng một giá trị.

Khi lookup time trên một hash table (có dùng cache hay không) là parameter quan trọng đối với subsystem sở hữu nó, subsystem có thể triển khai cơ chế tăng kích thước hash table để độ dài trung bình của collision list giảm xuống và lookup time trung bình được cải thiện. Xem ví dụ trong mục “Thay đổi kích thước động của các hash table per-netmask” ở Chương 34.

Bạn cũng có thể gặp các subsystem, như neighboring layer, thêm một thành phần ngẫu nhiên (được thay đổi thường xuyên) vào key dùng để phân phối element vào các bucket của cache. Cách này nhằm giảm thiệt hại từ các cuộc tấn công Denial of Service (DoS) tìm cách tập trung element của hash table vào một bucket duy nhất. Xem ví dụ trong mục “Caching” ở Chương 27.

### Reference count

Khi một đoạn code cố truy cập data structure đã được giải phóng, kernel không vui chút nào, và người dùng cũng hiếm khi hài lòng với phản ứng của kernel. Để tránh những vấn đề khó chịu đó, đồng thời giúp cơ chế garbage collection dễ triển khai và hiệu quả hơn (xem mục “Garbage collection” ở phần sau chương này), phần lớn data structure duy trì một reference count. Những cư dân tốt của kernel tăng và giảm reference count của từng data structure mỗi khi lần lượt lưu và giải phóng một reference tới structure đó. Với mỗi data structure type cần reference count, kernel component sở hữu structure thường export hai function dùng để tăng và giảm reference count. Những function đó thường được gọi lần lượt là `xxx_hold` và `xxx_release`. Đôi khi release function được gọi là `xxx_put` (ví dụ `dev_put` cho các structure `net_device`).

Dù muốn giả định kernel không có cư dân xấu, developer vẫn là con người, và do đó không phải lúc nào cũng viết code bug-free. Dùng reference count là một cơ chế đơn giản nhưng hiệu quả để tránh giải phóng các data structure still-referenced. Tuy nhiên, nó không phải lúc nào cũng giải quyết hoàn toàn vấn đề. Sau đây là hậu quả của việc quên cân bằng các lần tăng và giảm:

- Nếu giải phóng một reference tới data structure nhưng quên gọi function `xxx_release`, kernel sẽ không bao giờ cho phép giải phóng data structure đó (trừ khi một đoạn code lỗi khác tình cờ gọi nhầm release function thêm một lần!). Điều này dẫn tới memory dần cạn kiệt.

- Nếu lấy một reference tới data structure nhưng quên gọi `xxx_hold`, rồi sau đó tình cờ trở thành bên duy nhất giữ reference, structure sẽ bị giải phóng quá sớm vì reference của bạn không được tính đến. Trường hợp này chắc chắn có thể thảm khốc hơn trường hợp trước; lần cố truy cập structure tiếp theo có thể làm hỏng data khác hoặc gây kernel panic khiến toàn bộ hệ thống ngừng hoạt động ngay lập tức.

Khi một data structure cần bị loại bỏ vì lý do nào đó, các bên giữ reference có thể được thông báo rõ rằng nó sắp biến mất để họ có thể lịch sự giải phóng reference của mình. Điều này được thực hiện thông qua notification chain. Xem một ví dụ thú vị trong mục “Reference count” ở Chương 8.

Reference count trên một data structure thường có thể tăng khi:

- Có quan hệ chặt chẽ giữa hai data structure type. Khi đó, một structure thường duy trì một pointer được khởi tạo bằng address của structure còn lại.

- Một timer được khởi động mà handler của nó sẽ truy cập data structure. Khi timer được kích hoạt, reference count trên structure được tăng lên, vì điều bạn không hề muốn là data structure bị giải phóng trước khi timer hết hạn.

- Lookup thành công trên một list hoặc hash table trả về pointer tới element phù hợp. Trong phần lớn trường hợp, caller dùng kết quả trả về để thực hiện một công việc nào đó. Vì vậy, lookup routine thường tăng reference count trên element phù hợp và để caller giải phóng khi cần.

Khi reference cuối cùng tới một data structure được giải phóng, structure đó có thể được giải phóng vì không còn cần thiết, nhưng không nhất thiết phải như vậy.

Việc đưa vào sysfs filesystem mới đã giúp một phần đáng kể kernel code chú ý hơn tới reference count và sử dụng chúng nhất quán hơn.

### Garbage collection

Memory là resource dùng chung và có giới hạn, không nên bị lãng phí, đặc biệt trong kernel vì kernel không sử dụng virtual memory. Phần lớn kernel subsystem triển khai một dạng garbage collection để thu hồi memory do các data structure instance không dùng hoặc lỗi thời chiếm giữ. Tùy nhu cầu của từng feature, bạn sẽ thấy hai loại garbage collection chính:

Asynchronous

Loại garbage collection này không gắn với event cụ thể. Một timer hết hạn định kỳ gọi một routine quét qua tập data structure và giải phóng những structure được coi là đủ điều kiện xóa. Điều kiện khiến data structure có thể bị xóa phụ thuộc feature và logic của subsystem, nhưng một tiêu chí phổ biến là reference count bằng không.

Synchronous

Có những trường hợp thiếu memory không thể chờ asynchronous garbage collection timer kích hoạt, nên sẽ trigger garbage collection ngay lập tức. Tiêu chí chọn data structure đủ điều kiện xóa không nhất thiết giống tiêu chí của asynchronous cleanup (chẳng hạn có thể quyết liệt hơn). Xem ví dụ trong Chương 33.

Trong Chương 7, bạn sẽ thấy cách kernel thu hồi memory do các initialization routine sử dụng và không còn cần thiết sau khi chúng đã thực thi.

### Function pointer và Virtual Function Table (VFT)

Function pointer là cách thuận tiện để viết code C rõ ràng mà vẫn có được một số lợi ích của các ngôn ngữ object-oriented. Trong định nghĩa của một data structure type (object), bạn đưa vào một tập function pointer (method). Khi đó, một phần hoặc toàn bộ thao tác trên structure được thực hiện qua các function nhúng bên trong. Function pointer C-language trong data structure có dạng sau:

```c
struct sock {
    ...
    void    (*sk_state_change)(struct sock *sk);
    void    (*sk_data_ready)(struct sock *sk, int bytes);
    ...

};
```

Một lợi thế chính của function pointer là có thể khởi tạo chúng khác nhau tùy các tiêu chí và vai trò của object. Do đó, gọi `sk_state_change` thực chất có thể gọi những function khác nhau cho các socket `sock` khác nhau.

Function pointer được dùng rộng rãi trong networking code. Sau đây chỉ là một vài ví dụ:

- Khi ingress hoặc egress packet được routing subsystem xử lý, subsystem khởi tạo hai routine trong buffer data structure. Bạn sẽ thấy điều này trong Chương 35. Tham khảo Chương 2 để biết danh sách đầy đủ các function pointer trong data structure `sk_buff`.

- Khi packet sẵn sàng được truyền trên networking hardware, nó được chuyển cho function pointer `hard_start_xmit` của data structure `net_device`. Routine đó được khởi tạo bởi device driver gắn với device.

- Khi một L3 protocol muốn truyền packet, nó gọi một function pointer trong một tập. Các function pointer này đã được address resolution protocol gắn với L3 protocol khởi tạo thành một tập routine. Tùy routine thực tế được dùng để khởi tạo function pointer, có thể diễn ra address resolution L3-to-L2 trong suốt (ví dụ packet IPv4 đi qua ARP). Khi không cần address resolution, một routine khác được sử dụng. Xem Phần VI để biết thảo luận chi tiết về interface này.

Qua những ví dụ trên, chúng ta thấy function pointer có thể được dùng làm interface giữa các kernel component hoặc cơ chế tổng quát để gọi đúng function handler vào đúng thời điểm dựa trên kết quả công việc của subsystem khác. Có những trường hợp function pointer cũng được dùng như cách đơn giản để protocol, device driver hoặc bất kỳ feature nào khác tùy biến một hành động.

Hãy xem một ví dụ. Khi device driver đăng ký network device với kernel, nó đi qua một chuỗi bước cần thiết bất kể device type. Tại một thời điểm, nó gọi function pointer trên data structure `net_device` để cho phép device driver làm thêm công việc nếu cần. Device driver có thể khởi tạo function pointer đó bằng function của riêng mình, hoặc để pointer là NULL vì các bước mặc định do kernel thực hiện đã đủ.

Luôn cần kiểm tra giá trị của function pointer trước khi thực thi để tránh NULL pointer dereference, như trong đoạn trích từ `register_netdevice` sau:

```c
    if (dev->init && dev->init(dev) != 0) {
        ...
    }
```

Function pointer có một nhược điểm chính: khiến việc duyệt source code khó hơn một chút. Khi đi theo một code path cụ thể, cuối cùng bạn có thể phải tập trung vào một lời gọi function pointer. Trong những trường hợp đó, trước khi tiếp tục theo code path, bạn cần tìm hiểu function pointer đã được khởi tạo thế nào. Điều này có thể phụ thuộc các yếu tố khác nhau:

- Khi việc chọn routine để gán cho function pointer dựa trên một phần data cụ thể, chẳng hạn protocol xử lý data hoặc device driver nhận một packet cụ thể, việc suy ra routine sẽ dễ hơn. Ví dụ, nếu device được device driver drivers/net/3c59x.c quản lý, bạn có thể suy ra routine được dùng để khởi tạo một function pointer cụ thể của data structure `net_device` bằng cách đọc device initialization routine do device driver cung cấp.

- Ngược lại, khi việc chọn routine dựa trên logic phức tạp hơn, chẳng hạn trạng thái phân giải address mapping L3-to-L2, routine được dùng tại từng thời điểm phụ thuộc các external event không thể dự đoán.

Một tập function pointer được nhóm trong data structure thường được gọi là virtual function table (VFT). Khi VFT được dùng làm interface giữa hai subsystem chính, chẳng hạn protocol layer L3 và L4, hoặc khi VFT chỉ đơn giản được export làm interface cho một kernel component tổng quát (tập object), số function pointer trong đó có thể tăng lên rất nhiều để đáp ứng một dải rộng protocol hoặc feature khác. Cuối cùng, mỗi feature có thể chỉ dùng một vài function trong số nhiều function được cung cấp. Bạn sẽ thấy ví dụ trong Phần VI. Tất nhiên, nếu lạm dụng cách dùng VFT này, nó sẽ trở nên cồng kềnh và cần thiết kế lại đáng kể.

### Câu lệnh goto

Ít lập trình viên C thích câu lệnh `goto`. Không đi sâu vào lịch sử của `goto` (một trong những cuộc tranh luận lâu dài và nổi tiếng nhất trong lập trình máy tính), tôi sẽ tóm tắt một số lý do khiến `goto` thường không được khuyến khích, nhưng Linux kernel vẫn dùng nó.

Bất kỳ đoạn code dùng `goto` nào cũng có thể viết lại mà không cần nó. Dùng câu lệnh `goto` có thể giảm tính dễ đọc của code và khiến debugging khó hơn, vì tại bất kỳ vị trí nào sau `goto`, bạn không còn suy ra chắc chắn được những điều kiện đã dẫn việc thực thi tới đó.

Cho phép tôi dùng phép so sánh này: với bất kỳ node nào trong tree, bạn biết path từ root tới node đó. Nhưng nếu thêm những dây leo quấn ngẫu nhiên quanh các nhánh, bạn không còn luôn có một path duy nhất giữa root và các node khác nữa.

Tuy nhiên, vì ngôn ngữ C không cung cấp exception tường minh (và người ta cũng thường tránh chúng trong các ngôn ngữ khác do ảnh hưởng hiệu năng và độ phức tạp khi viết code), những câu lệnh `goto` được đặt cẩn thận có thể giúp dễ chuyển tới code xử lý các event không mong muốn hoặc bất thường. Trong kernel programming, đặc biệt networking, những event như vậy rất phổ biến, nên `goto` trở thành công cụ thuận tiện.

Tôi phải bảo vệ cách kernel dùng `goto` bằng cách chỉ ra rằng developer hoàn toàn không lạm dụng nó. Dù có hơn 30.000 lần xuất hiện, chúng chủ yếu được dùng để xử lý các return code khác nhau trong một function, hoặc thoát ra khỏi nhiều hơn một mức lồng nhau.

### Định nghĩa vector

Trong một số trường hợp, định nghĩa data structure có một block tùy chọn ở cuối. Đây là một ví dụ:

```c
struct abc {
    int age;
    char *name[20];
    ...
    char    placeholder[0];
}
```

Block tùy chọn bắt đầu tại `placeholder`. Lưu ý `placeholder` được định nghĩa là vector có kích thước 0. Điều này nghĩa là khi `abc` được cấp phát cùng block tùy chọn, `placeholder` trỏ tới đầu block. Khi không cần block tùy chọn, `placeholder` chỉ là pointer tới cuối structure; nó không chiếm không gian nào.

Do đó, nếu `abc` được nhiều đoạn code sử dụng, mỗi đoạn có thể dùng cùng định nghĩa cơ bản (tránh nhầm lẫn do làm cùng việc theo những cách hơi khác nhau), đồng thời mở rộng `abc` theo cách khác để tùy biến định nghĩa cho nhu cầu riêng.

Chúng ta sẽ gặp kiểu định nghĩa data structure này vài lần trong sách. Một ví dụ ở Chương 19.

### Chỉ thị có điều kiện (#ifdef và các chỉ thị cùng họ)

Đôi khi cần các chỉ thị có điều kiện cho compiler. Dùng quá nhiều có thể giảm tính dễ đọc của code, nhưng tôi có thể khẳng định Linux không lạm dụng chúng. Chúng xuất hiện vì nhiều lý do, nhưng điều chúng ta quan tâm là những chỉ thị dùng để kiểm tra kernel có hỗ trợ một feature cụ thể hay không. Công cụ cấu hình như make xconfig quyết định feature được compile vào kernel, hoàn toàn không được hỗ trợ, hay có thể load dưới dạng module.

Ví dụ về kiểm tra feature bằng các chỉ thị C preprocessor `#ifdef` hoặc `#if defined` gồm:

Đưa vào hoặc loại bỏ field khỏi định nghĩa data structure

```c
struct sk_buff {
    ...
#ifdef CONFIG_NETFILTER_DEBUG
    unsigned int nf_debug;
#endif
    ...
}
```

Trong ví dụ này, Netfilter debugging feature yêu cầu một field `nf_debug` trong structure `sk_buff`. Khi kernel không hỗ trợ Netfilter debugging (feature chỉ một số ít developer cần), không có lý do đưa field này vào, vì nó chỉ chiếm thêm memory cho mỗi network packet.

Đưa vào hoặc loại bỏ các đoạn code khỏi một function

```c
int ip_route_input(...)
{
    ...
        if (rth->fl.fl4_dst == daddr &&
            rth->fl.fl4_src == saddr &&
            rth->fl.iif == iif &&
            rth->fl.oif == 0 &&
#ifndef CONFIG_IP_ROUTE_FWMARK
            rth->fl.fl4_fwmark == skb->nfmark &&
#endif
            rth->fl.fl4_tos == tos) {
            ...
        }
}
```

Routing cache lookup routine `ip_route_input`, được mô tả trong Chương 33, chỉ kiểm tra giá trị tag do firewall đặt khi kernel đã được compile với hỗ trợ feature “IP: use netfilter MARK value as routing key”.

Chọn prototype thích hợp cho một function

```c
#ifdef CONFIG_IP_MULTIPLE_TABLES
struct fib_table * fib_hash_init(int id)
#else
struct fib_table * __init fib_hash_init(int id)
{
    ...
}
```

Trong ví dụ này, các chỉ thị được dùng để thêm tag `__init`[^1] vào prototype khi kernel không hỗ trợ Policy Routing.

Chọn định nghĩa thích hợp cho một function

```c
#ifndef CONFIG_IP_MULTIPLE_TABLES
...
static inline struct fib_table *fib_get_table(int id)
{
    if (id != RT_TABLE_LOCAL)
        return ip_fib_main_table;
    return ip_fib_local_table
}
...
#else
...
static inline struct fib_table *fib_get_table(int id)
{
    if (id == 0)
        id = RT_TABLE_MAIN;
    return fib_tables[id];
}
...
#endif
```

Lưu ý trường hợp này khác trường hợp trước. Ở trường hợp trước, phần thân function nằm ngoài các block `#ifdef`/`#endif`, trong khi ở đây mỗi block chứa định nghĩa hoàn chỉnh của function.

Việc định nghĩa hoặc khởi tạo variable và macro cũng có thể dùng conditional compilation.

Cần biết rằng một số function hoặc macro có nhiều định nghĩa, với việc lựa chọn tại compile time dựa trên preprocessor macro như các ví dụ trên. Nếu không, khi tìm định nghĩa function, variable hoặc macro, bạn có thể đang xem nhầm định nghĩa.

Xem Chương 7 để biết thảo luận về cách việc đưa vào các macro đặc biệt đã giảm sử dụng chỉ thị compiler có điều kiện trong một số trường hợp.

### Tối ưu hóa Compile-Time cho kiểm tra điều kiện

Phần lớn thời gian, khi kernel so sánh một variable với một giá trị bên ngoài để xem điều kiện có được đáp ứng hay không, kết quả rất có khả năng dự đoán được. Ví dụ, điều này khá phổ biến với code thực hiện sanity check. Kernel dùng các macro `likely` và `unlikely` để lần lượt bọc những phép so sánh có khả năng trả về kết quả true (1) hoặc false (0). Các macro này tận dụng một feature của gcc compiler cho phép tối ưu việc compile code dựa trên thông tin đó.

Đây là một ví dụ. Giả sử bạn cần gọi function `do_something`, và khi thất bại, phải xử lý bằng function `handle_error`:

```c
err = do_something(x,y,z);
if (err)
    handle_error(err);
```

Với giả định `do_something` hiếm khi thất bại, bạn có thể viết lại code như sau:

```c
err = do_something(x,y,z);
if (unlikely(err))
    handle_error(err);
```

Một ví dụ về tối ưu hóa nhờ các macro `likely` và `unlikely` là xử lý option trong IP header. IP option chỉ được dùng trong những trường hợp rất cụ thể, và kernel có thể yên tâm giả định phần lớn IP packet không mang IP option. Khi forward một IP packet, kernel cần xử lý option theo các quy tắc được mô tả trong Chương 18. Giai đoạn cuối cùng của việc forward IP packet do `ip_forward_finish` đảm nhiệm. Function này dùng macro `unlikely` để bọc điều kiện kiểm tra có IP option nào cần xử lý hay không. Xem mục “Function ip\_forward\_finish” trong Chương 20.

### Mutual exclusion

Locking được dùng rộng rãi trong networking code, và bạn có thể sẽ thấy nó trở thành vấn đề trong mọi chủ đề của sách. Mutual exclusion, locking mechanism và synchronization là chủ đề chung — rất thú vị và phức tạp — của nhiều loại lập trình, đặc biệt kernel programming. Qua nhiều năm, Linux đã đưa vào và tối ưu một số cách tiếp cận mutual exclusion. Vì vậy, phần này chỉ tóm tắt các locking mechanism xuất hiện trong networking code; tôi đề nghị bạn tham khảo những thảo luận chi tiết, high-quality trong Understanding the Linux Kernel và Linux Device Driver của O’Reilly.

Mỗi mutual exclusion mechanism là lựa chọn tốt nhất cho những hoàn cảnh cụ thể. Sau đây là tóm tắt ngắn các cách tiếp cận mutual exclusion khác nhau bạn sẽ thường gặp trong networking code:

Spin lock

Đây là lock mà tại một thời điểm chỉ một thread thực thi có thể giữ. Khi thread khác cố acquire lock, thread đó phải lặp cho tới khi lock được release. Do việc lặp gây lãng phí, spin lock chỉ được dùng trên multiprocessor system, và nhìn chung chỉ dùng khi developer dự kiến lock được giữ trong khoảng thời gian ngắn. Cũng vì gây lãng phí cho các thread khác, một thread thực thi không được sleep khi đang giữ spin lock.

Read-write spin lock

Khi cách dùng một lock có thể được phân loại rõ thành read-only và read-write, nên ưu tiên dùng read-write spin lock. Khác biệt giữa spin lock và read-write spin lock là với loại sau, nhiều reader có thể giữ lock cùng lúc. Tuy nhiên, tại một thời điểm chỉ một writer được giữ lock, và không reader nào acquire được lock khi nó đã do writer giữ. Vì reader được ưu tiên hơn writer, loại lock này hoạt động tốt khi số reader (hoặc số lần acquire lock read-only) lớn hơn nhiều số writer (hoặc số lần acquire lock read-write).

Khi lock được acquire ở mode read-only, không thể trực tiếp nâng lên mode read-write: phải release lock rồi acquire lại ở mode read-write.

Read-Copy-Update (RCU)

RCU là một trong những cơ chế mới nhất được cung cấp trong Linux để thực hiện mutual exclusion. Nó hoạt động khá tốt dưới những điều kiện cụ thể sau:

  - Yêu cầu lock Read-write hiếm hơn yêu cầu lock read-only.

  - Code giữ lock được thực thi atomically và không sleep.

  - Các data structure được lock bảo vệ được truy cập thông qua pointer.

Điều kiện đầu tiên liên quan hiệu năng, còn hai điều kiện kia là nền tảng cho nguyên lý hoạt động của RCU.

Lưu ý điều kiện đầu tiên gợi ý dùng read-write spin lock làm phương án thay thế RCU. Để hiểu tại sao RCU, khi phù hợp để sử dụng, lại có hiệu năng tốt hơn read-write spin lock, bạn cần xét những khía cạnh khác, chẳng hạn ảnh hưởng của processor cache trên SMP system.

Nguyên lý hoạt động đằng sau thiết kế RCU đơn giản nhưng mạnh mẽ. Để có mô tả rõ ràng về ưu điểm của RCU và mô tả ngắn về cách triển khai, hãy tham khảo bài viết do chính tác giả Paul McKenney công bố trên Linux Journal (http://linuxjournal.com/article/6993).[^2] Bạn cũng có thể tham khảo Understanding the Linux Kernel và Linux Device Drivers.

Một ví dụ về nơi dùng RCU trong networking code là routing subsystem. Lookup thường xuyên hơn update trên cache, và routine triển khai routing cache lookup không block giữa quá trình tìm kiếm. Xem Chương 33.

Kernel cung cấp semaphore nhưng chúng hiếm khi được dùng trong networking code mà sách này trình bày. Tuy nhiên, một ví dụ là code dùng để tuần tự hóa các thay đổi cấu hình, mà chúng ta sẽ thấy hoạt động trong Chương 8.

### Chuyển đổi giữa host order và network order

Data structure dài hơn một byte có thể được lưu trong memory theo hai định dạng: Little Endian và Big Endian. Định dạng thứ nhất lưu byte ít quan trọng nhất tại memory address thấp nhất, còn định dạng thứ hai làm ngược lại. Định dạng mà hệ điều hành như Linux sử dụng phụ thuộc processor đang dùng. Ví dụ, Intel processor tuân theo mô hình Little Endian, còn Motorola processor dùng mô hình Big Endian.

Giả sử máy Linux của chúng ta nhận IP packet từ một remote host. Vì không biết remote host đã dùng định dạng Little Endian hay Big Endian để khởi tạo protocol header, nó sẽ đọc header thế nào? Vì lý do này, mỗi protocol family phải định nghĩa “endianness” mà nó sử dụng. Chẳng hạn, TCP/IP stack tuân theo mô hình Big Endian.

Nhưng điều này vẫn để lại vấn đề cho kernel developer: phải viết code chạy được trên nhiều processor hỗ trợ các endianness khác nhau. Một số processor có thể có endianness trùng với incoming packet, nhưng những processor không trùng cần chuyển đổi sang endianness mà processor sử dụng.

Vì vậy, mỗi khi kernel cần đọc, lưu hoặc so sánh một field của IP header dài hơn một byte, trước hết phải chuyển nó từ network byte order sang host byte order hoặc ngược lại. Điều tương tự áp dụng cho các protocol khác của TCP/IP stack. Khi cả protocol lẫn local host đều là Big Endian, conversion routine chỉ là no-ops vì không cần chuyển đổi. Chúng luôn xuất hiện trong code để code có tính portable; chỉ bản thân conversion routine phụ thuộc platform. Bảng 1-2 liệt kê những macro chính dùng để chuyển đổi các field two-byte và four-byte.

Bảng 1-2. Các routine chuyển đổi Byte-ordering

| Macro | Ý nghĩa (short là 2 byte, long là 4 byte) |
|---|---|
| `htons` | Thứ tự byte Host-to-network (short) |
| `htonl` | Thứ tự byte Host-to-network (long) |
| `ntohs` | Thứ tự byte Network-to-host (short) |
| `ntohl` | Thứ tự byte Network-to-host (long) |

Các macro được định nghĩa trong generic header file include/linux/byteorder/generic.h. Sau đây là cách mỗi architecture điều chỉnh định nghĩa các macro đó dựa trên endianness của mình:

- Với mỗi architecture, có một file byteorder.h trong directory per-architecture include/asm-XXX/.

- File đó include include/linux/byteorder/big\_endian.h hoặc include/linux/byteorder/little\_endian.h, tùy endianness của processor.

- Cả little\_endian.h và big\_endian.h đều include generic file include/linux/byteorder/generic.h. Định nghĩa macro trong Bảng 1-2 dựa trên những macro khác được little\_endian.h và big\_endian.h định nghĩa khác nhau, và đó là cách endianness của architecture ảnh hưởng định nghĩa các macro trong Bảng 1-2.

Với mỗi macro `xxx` trong Bảng 1-2, có một macro tương ứng `__constant_xxx` dùng khi input field là constant value, chẳng hạn một element của enumeration list (xem ví dụ trong mục “Khởi tạo ARP Protocol” ở Chương 28). Lưu ý các macro trong Bảng 1-2 thường được dùng trong kernel code ngay cả khi input là constant value (xem ví dụ trong mục “Đặt Ethernet Protocol và Length” ở Chương 13).

Ở đầu phần này, chúng ta đã nói endianness quan trọng khi data field dài hơn một byte. Thực tế, endianness cũng quan trọng khi một field dài một hoặc nhiều byte được định nghĩa là tập hợp bitfield. Ví dụ, hãy xem IPv4 header trong Hình 18-2 ở Chương 18, và cách kernel định nghĩa structure `iphdr` trong include/linux/ip.h. Kernel định nghĩa `__LITTLE_ENDIAN_BITFIELD` và `__BIG_ENDIAN_BITFIELD` lần lượt trong các file little\_endian.h và big\_endian.h đã đề cập.

### Phát hiện bug

Một số function phải được gọi dưới các điều kiện cụ thể, hoặc không được gọi dưới những điều kiện nhất định. Kernel dùng các macro `BUG_ON` và `BUG_TRAP` để phát hiện trường hợp các điều kiện đó không được đáp ứng. Khi input condition của `BUG_TRAP` là false, kernel in warning message. Ngược lại, `BUG_ON` in error message và panic.

### Thống kê

Thu thập thống kê về số lần xuất hiện của những điều kiện cụ thể là thói quen tốt cho một feature, chẳng hạn cache lookup thành công và thất bại, memory allocation thành công và thất bại, v.v. Với mỗi networking feature thu thập thống kê, sách này liệt kê và mô tả từng counter.

### Đo thời gian

Kernel thường cần đo khoảng thời gian đã trôi qua kể từ một thời điểm cụ thể. Ví dụ, routine thực hiện công việc CPU-intensive thường nhường CPU sau một khoảng thời gian nhất định. Nó sẽ tiếp tục công việc khi được schedule thực thi lại. Điều này đặc biệt quan trọng trong kernel code, dù kernel hỗ trợ kernel preemption. Ví dụ phổ biến trong networking code là những routine triển khai garbage collection. Chúng ta sẽ gặp nhiều ví dụ trong sách.

Thời gian trôi qua trong kernel space được đo bằng tick. Một tick là khoảng thời gian giữa hai lần timer interrupt hết hạn liên tiếp. Timer đảm nhiệm nhiều công việc (chúng ta không quan tâm ở đây) và hết hạn đều đặn `HZ` lần mỗi giây. `HZ` là variable được code architecture-dependent khởi tạo. Ví dụ, nó được khởi tạo thành 1.000 trên máy i386. Điều này nghĩa là timer interrupt hết hạn 1.000 lần mỗi giây khi Linux chạy trên hệ thống i386, và khoảng cách giữa hai lần hết hạn liên tiếp là một millisecond.

Mỗi khi timer hết hạn, nó tăng global variable tên `jiffies`. Điều này nghĩa là tại mọi thời điểm, `jiffies` biểu diễn số tick kể từ khi hệ thống boot, và giá trị tổng quát `n`\*`HZ` biểu diễn `n` giây.

Nếu một function chỉ cần đo thời gian trôi qua, nó có thể lưu giá trị `jiffies` vào local variable rồi sau đó so sánh chênh lệch giữa `jiffies` và timestamp đó với một khoảng thời gian (biểu diễn bằng số tick) để biết bao nhiêu thời gian đã trôi qua kể từ lúc bắt đầu đo.

Ví dụ sau cho thấy một function cần thực hiện công việc nào đó nhưng không muốn giữ CPU quá một tick. Khi `do_something` báo công việc đã hoàn thành bằng cách đặt `job_done` thành giá trị khác không, function có thể return:

```c
unsigned long start_time = jiffies;
int job_done = 0;
do {
    do_something(&job_done);
    If (job_done)
        return;
while (jiffies - start_time < 1);
```

Để xem một vài ví dụ từ kernel code thực tế dùng `jiffies`, hãy xem mục “Xử lý backlog: Poll Virtual Function process\_backlog” trong Chương 10, hoặc mục “Asynchronous cleanup: function neigh\_periodic\_timer” trong Chương 27.

## Các công cụ User-Space

Có thể dùng nhiều công cụ khác nhau để cấu hình các networking feature trong Linux. Như đã đề cập ở đầu chương, bạn có thể sử dụng các công cụ này có chủ đích để tác động tới kernel nhằm học hỏi và khám phá ảnh hưởng của những thay đổi đó.

Sau đây là những công cụ tôi sẽ thường đề cập trong sách:

iputils

Ngoài lệnh `ping` quen thuộc từ lâu, iputils còn có `arping` (dùng để tạo ARP request), Network Router Discovery daemon `rdisc` và các công cụ khác.

net-tools

Đây là bộ networking tool, trong đó bạn có thể tìm thấy các công cụ well-known như ifconfig, route, netstat và arp, cùng ipmaddr, iptunnel, ether-wake, netplugd, v.v.

IPROUTE2

Đây là bộ công cụ cấu hình networking new-generation (dù đã tồn tại vài năm). Thông qua lệnh đa năng tên ip, bộ công cụ này có thể cấu hình IP address và routing cùng mọi feature nâng cao của routing, neighboring protocol, v.v.

Source code của IPROUTE2 có thể tải từ http://linux-net.osdl.org/index.php/Iproute2, còn những package khác có thể tải từ download server của phần lớn Linux distribution.

Các package này được đưa vào mặc định trên phần lớn (nếu không phải mọi) Linux distribution. Mỗi khi không hiểu kernel code xử lý một command từ user space thế nào, tôi khuyến khích bạn xem source code của công cụ user-space để biết command của người dùng được đóng gói và gửi tới kernel ra sao.

Tại những URL sau, bạn có thể tìm thấy tài liệu tốt về cách dùng các công cụ nói trên, cùng những mailing list đang hoạt động:[^3]

- http://lartc.org

- http://www.policyrouting.org

- http://www.netfilter.org

Nếu muốn theo dõi các thay đổi mới nhất trong networking code, hãy chú ý mailing list sau:

- The Linux Network Development List Archives (http://oss.sgi.com/projects/netdev/archive)

Những URL khác, cụ thể hơn sẽ được cung cấp trong các chương tương ứng.

## Duyệt source code

Linux kernel đã trở nên khá lớn, và duyệt code bằng người bạn cũ grep chắc chắn không còn là ý hay. Ngày nay, bạn có thể dựa vào nhiều phần mềm khác nhau để hành trình khám phá kernel code thuận lợi hơn.

Một công cụ tôi muốn gợi ý cho những ai chưa biết là cscope, có thể tải từ http://cscope.sourceforge.net. Đây là công cụ đơn giản nhưng mạnh mẽ để tìm kiếm, chẳng hạn nơi function hoặc variable được định nghĩa, nơi nó được gọi, v.v. Cài công cụ rất đơn giản và bạn có thể tìm mọi hướng dẫn cần thiết trên website.

Mỗi chúng ta đều có editor ưa thích, và có lẽ phần lớn đều yêu thích một dạng Emacs hoặc vi nào đó. Cả hai editor đều có thể dùng file đặc biệt gọi là file “tags” để người dùng di chuyển trong source code. (cscope cũng dùng database file tương tự.) Bạn có thể dễ dàng tạo những file này bằng target cùng tên trong makefile ở root của kernel source tree. Ba database TAGS, tags và cscope.out được tạo lần lượt bằng make TAGS, make tags và make cscope.[^4]

Lưu ý các file đó khá lớn, đặc biệt file được cscope dùng. Vì vậy, trước khi build file, hãy bảo đảm bạn còn nhiều dung lượng đĩa trống.

Nếu đã dùng công cụ điều hướng source khác thì tốt. Nhưng nếu chưa dùng công cụ nào và trước giờ vẫn lười tìm hiểu, đã đến lúc tạm biệt grep và dành 15 phút học cách dùng các công cụ trên — chúng rất đáng để bạn bỏ công.

### Dead code

Kernel, như mọi phần mềm lớn và thay đổi liên tục khác, có những đoạn code không còn được gọi. Đáng tiếc, bạn hiếm khi thấy comment trong code cho biết điều này. Đôi khi bạn có thể gặp khó khăn khi cố hiểu một function được dùng thế nào hoặc variable được khởi tạo ra sao, đơn giản vì đang xem dead code. Nếu may mắn, code đó không compile và bạn có thể đoán tình trạng out-of-date của nó. Những lúc khác, bạn có thể không may mắn như vậy.

Mỗi kernel subsystem được cho là phải có một hoặc nhiều maintainer phụ trách. Tuy nhiên, một số maintainer đơn giản là có quá nhiều code cần xem mà không đủ thời gian rảnh để làm. Những lúc khác, họ có thể đã mất hứng thú bảo trì subsystem nhưng không tìm được người thay thế vai trò. Vì vậy, nên nhớ điều này khi xem code có vẻ làm việc kỳ lạ hoặc đơn giản không tuân theo những quy tắc lập trình common-sense thông thường.

Trong sách này, bất cứ khi nào thích hợp, tôi đều cố chỉ cho bạn những function, variable và data structure field không được dùng, có thể vì chúng bị bỏ lại khi loại bỏ một feature hoặc được đưa vào cho một feature mới mà code chưa bao giờ hoàn tất.

## Khi một feature được cung cấp dưới dạng patch

Kernel networking code liên tục phát triển. Nó không chỉ tích hợp feature mới mà đôi khi các component hiện có còn thay đổi thiết kế để tăng tính modular và hiệu năng. Điều này rõ ràng khiến Linux rất hấp dẫn với vai trò hệ điều hành nhúng cho các sản phẩm network appliance (router, switch, firewall, load balancer, v.v.).

Vì bất kỳ ai cũng có thể phát triển feature mới cho Linux kernel, hoặc mở rộng hay triển khai lại feature hiện có, niềm vui lớn nhất của một developer “mở” là thấy công việc của mình được đưa vào kernel release chính thức. Tuy nhiên, đôi khi điều đó không thể thực hiện hoặc mất nhiều thời gian, ngay cả khi dự án có feature giá trị và được triển khai tốt. Những lý do phổ biến gồm:

- Code có thể không được viết theo hướng dẫn trong Documentation/CodingStyle.

- Một dự án lớn khác cung cấp cùng chức năng đã tồn tại một thời gian và được cộng đồng Linux cùng các kernel developer chủ chốt phụ trách khu vực kernel tương ứng chấp thuận.

- Có quá nhiều phần chồng lặp với kernel component khác. Trong trường hợp này, cách tốt nhất là loại bỏ chức năng dư thừa và dùng chức năng hiện có khi có thể, hoặc mở rộng chức năng hiện có để dùng được trong ngữ cảnh mới. Tình huống này nhấn mạnh tầm quan trọng của tính modular.

- Quy mô dự án và lượng công việc cần để bảo trì nó trong một kernel quick-changing có thể khiến developer của dự án mới giữ nó thành patch riêng và chỉ thỉnh thoảng phát hành phiên bản mới.

- Feature chỉ được dùng trong những tình huống rất cụ thể, bị xem là không cần thiết trong hệ điều hành general-purpose. Trong trường hợp này, patch riêng thường là giải pháp tốt nhất.

- Thiết kế tổng thể có thể không đáp ứng yêu cầu của một số kernel developer chủ chốt. Những chuyên gia này thường nắm bức tranh tổng thể về cả hiện trạng lẫn hướng phát triển của kernel. Họ thường yêu cầu thay đổi thiết kế để feature phù hợp với kernel một cách đúng đắn.

Đôi khi, khó loại bỏ hoàn toàn phần chồng lặp giữa các feature, chẳng hạn vì một feature linh hoạt đến mức những cách dùng khác nhau của nó chỉ rõ ràng sau một thời gian. Ví dụ, firewall có hook tại nhiều vị trí trong network stack. Điều này khiến các feature khác không cần tự triển khai việc filter hoặc mark data packet theo bất kỳ hướng nào: chúng chỉ cần dựa vào firewall. Tất nhiên, cách này tạo dependency (ví dụ nếu routing subsystem muốn mark traffic đáp ứng tiêu chí cụ thể, kernel phải có hỗ trợ firewall). Ngoài ra, firewall maintainer phải sẵn sàng chấp nhận những yêu cầu cải tiến hợp lý khi được xem là cần thiết cho các kernel feature khác. Tuy nhiên, lợi ích thường đáng để chấp nhận sự đánh đổi: ít code dư thừa hơn đồng nghĩa ít bug hơn, bảo trì code dễ hơn, code path đơn giản hơn và các lợi ích khác.

Một ví dụ về việc dọn dẹp phần feature chồng lặp gần đây là loại bỏ hỗ trợ stateless Network Address Translation (NAT) trong routing code ở kernel phiên bản 2.6. Các developer nhận ra hỗ trợ stateful NAT trong firewall linh hoạt hơn, vì vậy duy trì stateless NAT code không còn đáng công (dù nó nhanh hơn và dùng ít memory hơn). Lưu ý bất cứ lúc nào cũng có thể viết module mới cho Netfilter để cung cấp hỗ trợ stateless NAT nếu cần.

[^1]: Xem Chương 7 để biết mô tả về macro này.

[^2]: Để có thêm tài liệu, bạn có thể tham khảo URL sau do tác giả duy trì: http://www.rdrop.com/users/paulmck/rclock.

[^3]: Tôi không trình bày thiết kế firewall infrastructure trong sách này, nhưng thường chỉ ra vị trí các firewall hook khi phân tích nhiều network protocol và layer.

[^4]: Các file tags và TAGS được tạo với sự hỗ trợ của tiện ích ctags.
