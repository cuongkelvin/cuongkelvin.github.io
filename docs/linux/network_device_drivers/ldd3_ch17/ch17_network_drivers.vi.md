# Chương 17. Network Driver

![Chapter 17 opener](images/ch17/ch17_opener.png)

Sau khi trình bày char driver và block driver, giờ ta sẵn sàng bước sang networking. Network interface là class tiêu chuẩn thứ ba của Linux device; chương này mô tả cách chúng tương tác với phần còn lại của kernel.

Vai trò của network interface trong hệ thống tương tự một mounted block device. Block device đăng ký các disk và method của nó với kernel, sau đó “truyền” và “nhận” block theo yêu cầu thông qua request function. Tương tự, network interface phải đăng ký chính nó trong các kernel data structure cụ thể để được gọi khi packet được trao đổi với bên ngoài.

Có vài khác biệt quan trọng giữa mounted disk và packet-delivery interface. Trước hết, disk tồn tại dưới dạng special file trong directory /dev, còn network interface không có entry point như vậy. File operation thông thường (read, write, v.v.) không có ý nghĩa khi áp dụng cho network interface, nên không thể áp dụng cách tiếp cận Unix “mọi thứ đều là file”. Vì vậy network interface tồn tại trong namespace riêng và export tập operation khác.

Dù bạn có thể phản biện rằng ứng dụng dùng system call read và write khi dùng socket, các lời gọi đó tác động lên software object khác biệt với interface. Hàng trăm socket có thể được multiplex trên cùng physical interface.

Nhưng khác biệt quan trọng nhất là block driver chỉ hoạt động đáp ứng request từ kernel, còn network driver nhận packet bất đồng bộ từ bên ngoài. Vì vậy, trong khi block driver được yêu cầu gửi buffer về kernel, network device yêu cầu đẩy incoming packet vào kernel. Kernel interface cho network driver được thiết kế cho mode hoạt động khác biệt này.

Network driver cũng phải sẵn sàng hỗ trợ một số tác vụ quản trị, chẳng hạn thiết lập địa chỉ, sửa đổi transmission parameter và duy trì số liệu thống kê traffic cùng lỗi. API dành cho network driver phản ánh nhu cầu này, vì vậy trông hơi khác các interface mà chúng ta đã thấy đến đây.

Network subsystem của Linux kernel được thiết kế hoàn toàn độc lập protocol. Điều này áp dụng cho cả networking protocol (Internet protocol \[IP\] so với IPX hoặc protocol khác) và hardware protocol (Ethernet so với token ring, v.v.). Tương tác đúng giữa network driver và kernel xử lý mỗi lần một network packet; nhờ đó che giấu vấn đề protocol khỏi driver và che giấu physical transmission khỏi protocol một cách gọn gàng.

Chương này mô tả network interface kết hợp với phần còn lại của Linux kernel và cung cấp ví dụ dưới dạng modularized network interface memory-based, tên là (bạn đoán đúng) snull. Để đơn giản hóa, interface dùng Ethernet hardware protocol và truyền IP packet. Kiến thức từ việc xem snull có thể dễ dàng áp dụng cho protocol ngoài IP; viết driver non-Ethernet chỉ khác ở chi tiết nhỏ liên quan network protocol thực tế.

Chương không nói về IP numbering scheme, network protocol hoặc khái niệm networking tổng quát khác. Chủ đề này (thường) không phải điều driver writer quan tâm, và không thể cung cấp tổng quan thỏa đáng về networking technology trong chưa đến vài trăm trang. Độc giả quan tâm nên tham khảo sách khác về vấn đề networking.

Cần lưu ý thuật ngữ trước khi đi vào network device. Thế giới networking dùng octet để chỉ nhóm tám bit, thường là đơn vị nhỏ nhất networking device và protocol hiểu được. Thuật ngữ byte gần như không gặp trong ngữ cảnh này. Theo cách dùng tiêu chuẩn, ta dùng octet khi nói về networking device.

Thuật ngữ “header” cũng cần nhắc ngắn gọn. Header là tập byte (à, octet) thêm vào đầu packet khi đi qua các layer của networking subsystem. Khi ứng dụng gửi block dữ liệu qua TCP socket, networking subsystem chia dữ liệu thành packet và đặt TCP header ở đầu, mô tả vị trí mỗi packet trong stream. Level thấp hơn đặt IP header, dùng route packet đến destination, phía trước TCP header. Nếu packet đi qua medium Ethernet-like, Ethernet header do hardware diễn giải được đặt trước toàn bộ phần còn lại. Network driver (thường) không cần quan tâm higher-level header nhưng thường phải tham gia tạo hardware-level header.

## Cách thiết kế snull

Mục này thảo luận về các khái niệm thiết kế dẫn đến snull network interface. Mặc dù thông tin này có vẻ ít hữu ích, việc không hiểu nó có thể gây ra vấn đề khi bạn thử nghiệm với code mẫu.

Quyết định thiết kế đầu tiên và quan trọng nhất là sample interface độc lập với hardware thực, như phần lớn sample code trong sách. Ràng buộc dẫn đến thứ giống loopback interface. Tuy nhiên snull không phải loopback interface; nó mô phỏng hội thoại với remote host thực để minh họa rõ hơn tác vụ viết network driver. Linux loopback driver thực ra khá đơn giản, nằm trong drivers/net/loopback.c.

Tính năng khác của snull là chỉ hỗ trợ IP traffic. Đây là hệ quả cách interface hoạt động nội bộ—snull phải xem bên trong và diễn giải packet để mô phỏng đúng cặp hardware interface. Interface thực không phụ thuộc protocol đang truyền, và giới hạn này của snull không ảnh hưởng đoạn code trong chương.

### Gán IP Number

Snull module tạo hai interface. Chúng khác loopback đơn giản ở chỗ bất cứ thứ gì truyền qua một interface đều quay về interface kia, thay vì chính nó. Trông như có hai external link nhưng thực ra computer tự trả lời chính mình.

Đáng tiếc, không thể đạt hiệu ứng này chỉ bằng gán IP number vì kernel không gửi qua interface A packet hướng đến interface B của chính nó. Thay vào đó dùng loopback channel, không qua snull. Để thiết lập giao tiếp qua snull interface, source và destination address cần sửa trong lúc truyền dữ liệu. Nói cách khác, packet gửi qua interface này phải được interface kia nhận, nhưng receiver của outgoing packet không được nhận diện là local host. Điều tương tự áp dụng cho source address của received packet.

Để tạo “hidden loopback”, snull interface đảo least significant bit của octet thứ ba trong cả source và destination address; tức đổi cả network number và host number của class C IP number. Hiệu ứng cuối cùng là packet gửi tới network A (nối với `sn0`, interface đầu tiên) xuất hiện trên interface `sn1` dưới dạng packet thuộc network B.

Để tránh quá nhiều số, hãy gán symbolic name cho các IP number liên quan:

- `snullnet0` là network nối với interface `sn0`. Tương tự, `snullnet1` là network nối với `sn1`. Address của chúng chỉ được khác ở least significant bit của octet thứ ba. Các network phải có netmask 24-bit.

- `local0` là IP address gán cho interface `sn0`; thuộc `snullnet0`. Address gắn với `sn1` là `local1`. `local0` và `local1` phải khác ở least significant bit của octet thứ ba và ở octet thứ tư.

- `remote0` là một host trong `snullnet0`, có octet thứ tư giống octet thứ tư của `local1`. Mọi packet gửi đến `remote0` đều đến `local1` sau khi network address của packet được interface code sửa đổi. Host `remote1` thuộc `snullnet1`, có octet thứ tư giống octet thứ tư của `local0`.

Hoạt động snull interface thể hiện ở Hình 17-1, hostname gắn với mỗi interface in gần interface name.

![Figure 17-1](images/ch17/fig17-01.png)

Hình 17-1. Cách host nhìn các interface của nó

Sau đây là giá trị có thể dùng cho network number. Khi thêm các dòng vào /etc/networks, có thể gọi network bằng tên. Giá trị được chọn từ dải số dành cho private use.

```c
snullnet0       192.168.0.0
snullnet1       192.168.1.0
```

Sau đây là host number có thể thêm vào /etc/hosts:

```c
192.168.0.1   local0
192.168.0.2   remote0
192.168.1.2   local1
192.168.1.1   remote1
```

Đặc điểm quan trọng của các số này là host portion của `local0` giống host portion của `remote1`, và host portion của `local1` giống host portion của `remote0`. Bạn có thể sử dụng các số hoàn toàn khác miễn là vẫn giữ được mối quan hệ này.

Tuy nhiên, hãy cẩn thận nếu máy tính của bạn đã kết nối với một mạng. Các số bạn chọn có thể là địa chỉ Internet hoặc intranet thực; việc gán chúng cho interface sẽ ngăn giao tiếp với các host thực đó. Ví dụ, mặc dù các số vừa nêu không phải địa chỉ có thể được route trên Internet, chúng có thể đã được sử dụng trong private network của bạn.

Dù chọn số nào, có thể thiết lập interface đúng để hoạt động bằng các lệnh:

```c
ifconfig sn0 local0
ifconfig sn1 local1
```

Có thể cần thêm tham số `netmask 255.255.255.0` nếu address range được chọn không thuộc class C.

Lúc này có thể đến đầu “remote” của interface. Screendump sau cho thấy host đến `remote0` và `remote1` qua snull interface:

```c
morgana% ping -c 2 remote0
64 bytes from 192.168.0.99: icmp_seq=0 ttl=64 time=1.6 ms
64 bytes from 192.168.0.99: icmp_seq=1 ttl=64 time=0.9 ms
2 packets transmitted, 2 packets received, 0% packet loss

morgana% ping -c 2 remote1
64 bytes from 192.168.1.88: icmp_seq=0 ttl=64 time=1.8 ms
64 bytes from 192.168.1.88: icmp_seq=1 ttl=64 time=0.9 ms
2 packets transmitted, 2 packets received, 0% packet loss
```

Lưu ý rằng bạn không thể tiếp cận bất kỳ “host” nào khác thuộc hai mạng này, vì máy tính sẽ loại bỏ packet sau khi địa chỉ đã được sửa đổi và packet đã được nhận. Ví dụ, một packet gửi đến 192.168.0.32 sẽ đi ra qua `sn0` và xuất hiện trở lại tại `sn1` với destination address là 192.168.1.32, không phải một địa chỉ cục bộ của máy tính host.

### Physical Transport của Packet

Xét data transport, snull interface thuộc Ethernet class.

Snull mô phỏng Ethernet vì phần lớn network hiện có—ít nhất segment workstation nối vào—dựa trên Ethernet technology, dù là 10base-T, 100base-T hay Gigabit. Hơn nữa kernel cung cấp hỗ trợ tổng quát cho Ethernet device, không có lý do không dùng. Lợi thế làm Ethernet device lớn đến mức cả plip interface (interface dùng printer port) cũng khai báo là Ethernet device.

Lợi thế cuối của việc dùng Ethernet setup cho snull là có thể chạy tcpdump trên interface để xem packet đi qua. Quan sát interface bằng tcpdump là cách hữu ích để thấy hai interface hoạt động.

Như đã đề cập trước đó, snull chỉ hoạt động với IP packet. Giới hạn này xuất phát từ việc snull xem xét nội dung packet và thậm chí sửa đổi chúng để code hoạt động. Code sửa đổi source, destination và checksum trong IP header của mỗi packet mà không kiểm tra xem packet có thực sự mang thông tin IP hay không.

Sửa dữ liệu quick-and-dirty này phá hỏng packet non-IP. Muốn giao protocol khác qua snull phải sửa source code của module.

## Kết nối với Kernel

Ta bắt đầu xem structure của network driver bằng cách phân tích snull source. Có sẵn source code của vài driver giúp theo dõi và thấy Linux network driver real-world hoạt động thế nào. Để bắt đầu, đề xuất loopback.c, plip.c và e100.c theo độ phức tạp tăng dần. Tất cả nằm trong drivers/net thuộc kernel source tree.

### Đăng ký Device

Khi driver module load vào kernel đang chạy, nó yêu cầu resource và cung cấp chức năng; không có gì mới. Cách yêu cầu resource cũng không mới. Driver phải probe device và vị trí hardware (I/O port và IRQ line)—nhưng chưa đăng ký—như mô tả trong “Cài đặt Interrupt Handler” ở Chương 10. Cách network driver được module initialization function đăng ký khác char driver và block driver. Vì không có thứ tương đương major/minor number cho network interface, network driver không yêu cầu số như vậy. Thay vào đó chèn data structure cho mỗi interface mới phát hiện vào global list network device.

Mỗi interface được mô tả bằng một `struct net_device`, định nghĩa trong \<linux/netdevice.h\>. Snull driver giữ pointer đến hai structure (cho `sn0` và `sn1`) trong array đơn giản:

```c
struct net_device *snull_devs[2];
```

Structure `net_device`, giống nhiều kernel structure khác, chứa một kobject nên được reference-counted và export qua sysfs. Giống các structure tương tự, nó phải được cấp phát động. Kernel function được cung cấp để thực hiện việc cấp phát này là alloc\_netdev, có prototype như sau:

```c
struct net_device *alloc_netdev(int sizeof_priv,
                                const char *name,
                                void (*setup)(struct net_device *));
```

Ở đây `sizeof_priv` là size vùng “private data” của driver; với network device, vùng này cấp phát cùng structure `net_device`. Thực tế cả hai cấp phát chung trong một memory chunk lớn, nhưng driver author nên giả vờ không biết. `name` là tên interface thấy từ user space; có thể chứa `%d` kiểu printf-style. Kernel thay `%d` bằng interface number khả dụng tiếp theo. Cuối cùng, `setup` là pointer tới initialization function được gọi để thiết lập phần còn lại của structure `net_device`. Ta sẽ sớm nói tới initialization function; hiện chỉ cần biết snull cấp phát hai device structure như sau:

```c
snull_devs[0] = alloc_netdev(sizeof(struct snull_priv), "sn%d",
        snull_init);
snull_devs[1] = alloc_netdev(sizeof(struct snull_priv), "sn%d",
        snull_init);
if (snull_devs[0] = = NULL || snull_devs[1] = = NULL)
    goto out;
```

Như luôn luôn, phải kiểm tra return value để bảo đảm cấp phát thành công.

Networking subsystem cung cấp helper function bọc alloc\_netdev cho các interface type. Phổ biến nhất là alloc\_etherdev, định nghĩa trong \<linux/etherdevice.h\>:

```c
struct net_device *alloc_etherdev(int sizeof_priv);
```

Function cấp phát network device dùng `eth%d` cho đối số name. Cung cấp initialization function riêng (ether\_setup), đặt một số field `net_device` bằng giá trị phù hợp Ethernet device. Vì vậy không có initialization function driver-supplied cho alloc\_etherdev; driver chỉ cần tự khởi tạo theo yêu cầu ngay sau cấp phát thành công. Người viết driver cho device type khác có thể dùng helper function như alloc\_fcdev (định nghĩa trong \<linux/fcdevice.h\>) cho fiber-channel device, alloc\_fddidev (\<linux/fddidevice.h\>) cho FDDI device, hoặc alloc\_trdev (\<linux/trdevice.h\>) cho token ring device.

snull có thể sử dụng alloc\_etherdev mà không gặp vấn đề; chúng ta chọn alloc\_netdev để minh họa interface lower-level và có quyền kiểm soát tên được gán cho interface.

Khi structure `net_device` đã khởi tạo, hoàn tất quá trình chỉ cần truyền structure cho register\_netdev. Trong snull, lời gọi như sau:

```c
for (i = 0; i < 2;  i++)
    if ((result = register_netdev(snull_devs[i])))
        printk("snull: error %i registering device \"%s\"\n",
                result, snull_devs[i]->name);
```

Cảnh báo thông thường áp dụng: ngay khi gọi register\_netdev, driver có thể được gọi thao tác device. Vì vậy không đăng ký device đến khi mọi thứ đã khởi tạo đầy đủ.

### Khởi tạo từng Device

Chúng ta đã xem xét việc cấp phát và đăng ký các structure `net_device`, nhưng đã bỏ qua bước trung gian là khởi tạo đầy đủ structure đó. Lưu ý rằng `struct net_device` luôn được tạo tại runtime; nó không thể được thiết lập tại compile time theo cách của structure `file_operations` hoặc `block_device_operations`. Việc khởi tạo phải hoàn tất trước khi gọi register\_netdev. Structure `net_device` lớn và phức tạp; may mắn là kernel xử lý một số giá trị mặc định chung cho Ethernet thông qua function ether\_setup (được alloc\_etherdev gọi).

Vì snull dùng alloc\_netdev, nó có initialization function riêng. Phần core của function (snull\_init) như sau:

```c
ether_setup(dev); /* assign some of the fields */

dev->open            = snull_open;
dev->stop            = snull_release;
dev->set_config      = snull_config;
dev->hard_start_xmit = snull_tx;
dev->do_ioctl        = snull_ioctl;
dev->get_stats       = snull_stats;
dev->rebuild_header  = snull_rebuild_header;
dev->hard_header     = snull_header;
dev->tx_timeout      = snull_tx_timeout;
dev->watchdog_timeo = timeout;
/* keep the default flags, just add NOARP */
dev->flags           |= IFF_NOARP;
dev->features        |= NETIF_F_NO_CSUM;
dev->hard_header_cache = NULL;      /* Disable caching */
```

Code trên thực hiện việc khởi tạo structure `net_device` khá thông thường, chủ yếu là lưu các pointer trỏ đến những driver function khác nhau. Điểm khác thường duy nhất là thiết lập `IFF_NOARP` trong các flag. Điều này chỉ định rằng interface không thể sử dụng Address Resolution Protocol (ARP). ARP là một Ethernet protocol low-level, có nhiệm vụ chuyển IP address thành Ethernet medium access control (MAC) address. Vì các hệ thống “remote” do snull mô phỏng không thực sự tồn tại, không có hệ thống nào trả lời ARP request thay cho chúng. Thay vì làm snull phức tạp hơn bằng cách bổ sung một cách triển khai ARP, chúng ta chọn đánh dấu interface là không thể xử lý protocol đó. Phép gán cho `hard_header_cache` cũng có lý do tương tự: nó vô hiệu hóa việc cache các ARP reply không tồn tại trên interface này. Chủ đề này được thảo luận chi tiết trong mục “MAC Address Resolution” ở phần sau của chương.

Initialization code cũng đặt hai field (`tx_timeout` và `watchdog_timeo`) liên quan xử lý transmission timeout. Ta trình bày kỹ trong phần “Transmission Timeout”.

Giờ xem field khác của `struct net_device`, `priv`. Vai trò giống pointer `private_data` đã dùng cho char driver. Khác `fops->private_data`, pointer `priv` này cấp phát cùng structure `net_device`. Cũng không khuyến khích truy cập trực tiếp field `priv` vì hiệu năng và linh hoạt. Khi driver cần private data pointer, phải dùng function netdev\_priv. Vì vậy snull driver đầy khai báo như:

```c
struct snull_priv *priv = netdev_priv(dev);
```

Snull module khai báo data structure `snull_priv` để dùng cho `priv`:

```c
struct snull_priv {
    struct net_device_stats stats;
    int status;
    struct snull_packet *ppool;
    struct snull_packet *rx_queue;  /* List of incoming packets */
    int rx_int_enabled;
    int tx_packetlen;
    u8 *tx_packetdata;
    struct sk_buff *skb;
    spinlock_t lock;
};
```

Structure chứa, bên cạnh thành phần khác, instance `struct net_device_stats`, nơi tiêu chuẩn chứa interface statistic. Các dòng sau trong snull\_init cấp phát và khởi tạo `dev->priv`:

```c
priv = netdev_priv(dev);
memset(priv, 0, sizeof(struct snull_priv));
spin_lock_init(&priv->lock);
snull_rx_ints(dev, 1);      /* enable receive interrupts */
```

### Unload Module

Không có điều gì đặc biệt xảy ra khi module được unload. Module cleanup function chỉ hủy đăng ký các interface, thực hiện mọi thao tác dọn dẹp nội bộ cần thiết và trả structure `net_device` về hệ thống:

```c
void snull_cleanup(void)
{
    int i;

    for (i = 0; i < 2;  i++) {
        if (snull_devs[i]) {
            unregister_netdev(snull_devs[i]);
            snull_teardown_pool(snull_devs[i]);
            free_netdev(snull_devs[i]);
        }
    }
    return;
}
```

Lời gọi unregister\_netdev xóa interface khỏi hệ thống; free\_netdev trả structure `net_device` về kernel. Nếu còn reference đến structure ở đâu đó, nó có thể tiếp tục tồn tại, nhưng driver không cần quan tâm. Khi đã hủy đăng ký interface, kernel không còn gọi method của nó.

Lưu ý cleanup nội bộ (trong snull\_teardown\_pool) không được xảy ra trước khi hủy đăng ký device. Tuy nhiên phải trước khi trả structure `net_device` về hệ thống; khi đã gọi free\_netdev không thể reference thêm tới device hay private area.

## Chi tiết Structure net\_device

Structure `net_device` nằm ở trung tâm của network driver layer và cần được mô tả đầy đủ. Danh sách này mô tả tất cả field, chủ yếu để tham khảo thay vì học thuộc. Phần còn lại của chương mô tả ngắn gọn mỗi field ngay khi nó được sử dụng trong code mẫu, vì vậy bạn không cần liên tục quay lại mục này.

### Thông tin toàn cục

Phần đầu `struct net_device` gồm field sau:

`char name[IFNAMSIZ]`;

Tên của device. Nếu tên do driver thiết lập chứa format string `%d`, register\_netdev thay thế nó bằng một số để tạo tên duy nhất; các số được gán bắt đầu từ `0`.

`unsigned long state`;

Trạng thái của device. Field này chứa một số flag. Driver thường không thao tác trực tiếp với các flag này; thay vào đó, một tập utility function đã được cung cấp. Các function này sẽ sớm được thảo luận khi chúng ta tìm hiểu driver operation.

`struct net_device *next`;

Pointer đến device tiếp theo trong global linked list. Driver không nên chạm vào field.

`int (*init)(struct net_device *dev)`;

Một initialization function. Nếu pointer này được thiết lập, function được register\_netdev gọi để hoàn tất việc khởi tạo structure `net_device`. Phần lớn network driver hiện đại không còn sử dụng function này; thay vào đó, việc khởi tạo được thực hiện trước khi đăng ký interface.

### Thông tin Hardware

Các field sau chứa thông tin hardware low-level cho những device tương đối đơn giản. Chúng là phần còn lại từ thời kỳ đầu của Linux networking; phần lớn driver hiện đại có sử dụng chúng (có thể ngoại trừ `if_port`). Chúng được liệt kê ở đây để bảo đảm đầy đủ.

`unsigned long rmem_end`;

`unsigned long rmem_start`;

`unsigned long mem_end`;

`unsigned long mem_start`;

Thông tin device memory. Field giữ địa chỉ bắt đầu/kết thúc shared memory device dùng. Nếu device có receive và transmit memory khác nhau, field `mem` dùng cho transmit memory, `rmem` cho receive memory. Field `rmem` không được reference ngoài driver. Theo quy ước, field `end` đặt sao cho `end - start` là lượng onboard memory khả dụng.

`unsigned long base_addr`;

I/O base address của network interface. Field này, giống các field trước, được driver gán trong quá trình probe device. Lệnh ifconfig có thể được sử dụng để hiển thị hoặc sửa đổi giá trị hiện tại. `base_addr` có thể được gán tường minh trên kernel command line khi hệ thống boot (qua parameter `netdev=`) hoặc khi load module. Field này, giống các memory field mô tả ở trên, không được kernel sử dụng.

`unsigned char irq`;

Interrupt number được gán. Giá trị `dev->irq` được ifconfig in khi liệt kê interface. Thường đặt tại boot hoặc load time và sửa sau bằng ifconfig.

`unsigned char if_port`;

Port đang dùng trên multiport device. Ví dụ dùng với device hỗ trợ cả Ethernet connection coaxial (`IF_PORT_10BASE2`) và twisted-pair (`IF_PORT_100BASET`). Tập port type đã biết đầy đủ định nghĩa trong \<linux/netdevice.h\>.

`unsigned char dma`;

DMA channel do device cấp phát. Field này chỉ có ý nghĩa với một số peripheral bus, chẳng hạn ISA. Ngoài chính device driver, nó chỉ được sử dụng để cung cấp thông tin (trong ifconfig).

### Thông tin Interface

Phần lớn thông tin về interface được function ether\_setup thiết lập đúng, hoặc bởi setup function khác phù hợp với hardware type cụ thể. Ethernet card có thể dựa vào function general-purpose này cho phần lớn các field, nhưng `flags` và `dev_addr` là các field riêng của device và phải được gán tường minh tại thời điểm khởi tạo.

Một số interface non-Ethernet dùng helper function tương tự ether\_setup. drivers/net/net\_init.c export một số function như:

`void ltalk_setup(struct net_device *dev)`;

Thiết lập field cho LocalTalk device

`void fc_setup(struct net_device *dev)`;

Khởi tạo field cho fiber-channel device

`void fddi_setup(struct net_device *dev)`;

Cấu hình interface cho Fiber Distributed Data Interface (FDDI) network `void hippi_setup(struct net_device *dev)`; Chuẩn bị field cho High-Performance Parallel Interface (HIPPI) interconnect driver high-speed

`void tr_setup(struct net_device *dev)`;

Xử lý setup cho token ring network interface

Phần lớn device thuộc một class này. Tuy nhiên nếu của bạn hoàn toàn mới và khác biệt, phải tự gán các field:

`unsigned short hard_header_len`;

Hardware header length, tức số octet đứng đầu transmitted packet trước IP header hoặc protocol information khác. Giá trị `hard_header_len` là `14` (`ETH_HLEN`) cho Ethernet interface.

`unsigned mtu`;

Maximum transfer unit (MTU). Network layer dùng field này điều khiển packet transmission. Ethernet có MTU 1500 octet (`ETH_DATA_LEN`). Giá trị đổi được bằng ifconfig.

`unsigned long tx_queue_len`;

Số frame tối đa có thể queue trong transmission queue của device. ether\_setup đặt 1000 nhưng có thể đổi. Ví dụ plip dùng 10 để tránh lãng phí system memory (plip có throughput thấp hơn Ethernet interface thực).

`unsigned short type`;

Hardware type của interface. ARP dùng field `type` xác định hardware address type interface hỗ trợ. Giá trị đúng cho Ethernet interface là `ARPHRD_ETHER`, được ether\_setup đặt. Type được nhận diện định nghĩa trong \<linux/if\_arp.h\>.

`unsigned char addr_len`;

`unsigned char broadcast[MAX_ADDR_LEN]`;

`unsigned char dev_addr[MAX_ADDR_LEN]`;

Độ dài hardware (MAC) address và các hardware address của device. Địa chỉ Ethernet dài sáu octet (ở đây chúng ta nói đến hardware ID của interface board), còn broadcast address gồm sáu octet `0xff`; ether\_setup bảo đảm các giá trị này đúng. Ngược lại, device address phải được đọc từ interface board theo cách device-specific, và driver cần sao chép nó vào `dev_addr`. Hardware address được dùng để tạo Ethernet header đúng trước khi packet được chuyển cho driver để truyền. snull device không sử dụng physical interface và tự tạo hardware address riêng.

`unsigned short flags`;

`int features`;

Interface flag (chi tiết tiếp theo).

Field `flags` là bit mask gồm các bit value sau. Prefix `IFF_` viết tắt “interface flags”. Một số flag do kernel quản lý, số khác được interface đặt tại initialization time để khẳng định capability và feature khác. Flag hợp lệ, định nghĩa trong \<linux/if.h\>, là:

`IFF_UP`

Flag này read-only với driver. Kernel bật khi interface active và sẵn sàng truyền packet.

`IFF_BROADCAST`

Flag này (networking code duy trì) cho biết interface cho broadcast. Ethernet board có hỗ trợ.

`IFF_DEBUG`

Đánh dấu debug mode. Có thể dùng flag điều khiển độ chi tiết lời gọi printk hoặc mục đích debug khác. Dù hiện không driver in-tree nào dùng, user program có thể đặt/xóa qua ioctl và driver của bạn dùng được. Chương trình misc-progs/netifdebug dùng bật tắt flag.

`IFF_LOOPBACK`

Chỉ đặt flag trong loopback interface. Kernel kiểm tra `IFF_LOOPBACK` thay vì hardwire tên `lo` làm special interface.

`IFF_POINTOPOINT`

Flag báo interface nối tới link point-to-point. Driver hoặc đôi khi ifconfig đặt. Ví dụ plip và PPP driver đặt flag.

`IFF_NOARP`

Điều này có nghĩa là interface không thể thực hiện ARP. Ví dụ, các interface point-to-point không cần chạy ARP vì nó chỉ tạo thêm traffic mà không thu được thông tin hữu ích. snull hoạt động mà không có khả năng ARP, vì vậy nó thiết lập flag này.

`IFF_PROMISC`

Flag được networking code đặt để bật promiscuous operation. Mặc định Ethernet interface dùng hardware filter bảo đảm chỉ nhận broadcast packet và packet hướng tới hardware address của interface. Packet sniffer như tcpdump đặt promiscuous mode để lấy mọi packet đi trên transmission medium của interface.

`IFF_MULTICAST`

Driver đặt flag để đánh dấu interface có khả năng multicast transmission. ether\_setup đặt `IFF_MULTICAST` mặc định; nếu driver không hỗ trợ multicast phải xóa flag tại initialization time.

`IFF_ALLMULTI`

Flag yêu cầu interface nhận mọi multicast packet. Kernel đặt khi host multicast routing, chỉ nếu `IFF_MULTICAST` đặt. `IFF_ALLMULTI` là read-only với driver. Multicast flag dùng trong phần “Multicast” phía sau chương.

`IFF_MASTER`

`IFF_SLAVE`

Load equalization code dùng các flag này. Interface driver không cần biết.

`IFF_PORTSEL`

`IFF_AUTOMEDIA`

Các flag này cho biết device có khả năng chuyển đổi giữa nhiều media type, chẳng hạn unshielded twisted pair (UTP) và cáp Ethernet đồng trục. Nếu `IFF_AUTOMEDIA` được thiết lập, device tự động chọn medium phù hợp. Trong thực tế, kernel không sử dụng flag nào trong hai flag này.

`IFF_DYNAMIC`

Driver đặt flag này để chỉ báo address của interface có thể đổi. Hiện kernel không dùng.

`IFF_RUNNING`

Flag này cho biết interface ở trạng thái up và đang hoạt động. Nó chủ yếu tồn tại để tương thích với BSD; kernel ít sử dụng nó. Phần lớn network driver không cần quan tâm đến `IFF_RUNNING`.

`IFF_NOTRAILERS`

Linux không dùng flag nhưng giữ để tương thích BSD.

Khi chương trình đổi `IFF_UP`, device method open hoặc stop được gọi. Hơn nữa khi `IFF_UP` hay flag khác sửa, method set\_multicast\_list được gọi. Nếu driver cần hành động đáp ứng sửa flag, phải thực hiện trong set\_multicast\_list. Ví dụ khi đặt/xóa `IFF_PROMISC`, set\_multicast\_list phải thông báo onboard hardware filter. Trách nhiệm device method trình bày trong phần “Multicast”.

Driver thiết lập field `features` của structure `net_device` để thông báo cho kernel về các khả năng hardware đặc biệt của interface này. Chúng ta sẽ thảo luận một số feature; những feature khác nằm ngoài phạm vi cuốn sách. Tập đầy đủ gồm:

`NETIF_F_SG`

`NETIF_F_FRAGLIST`

Cả hai flag này điều khiển việc sử dụng scatter/gather I/O. Nếu interface có thể truyền một packet đã được chia thành nhiều memory segment riêng biệt, bạn cần thiết lập `NETIF_F_SG`. Dĩ nhiên, bạn phải thực sự triển khai scatter/gather I/O (chúng ta mô tả cách thực hiện trong mục “Scatter/Gather I/O”). `NETIF_F_FRAGLIST` cho biết interface có thể xử lý các packet đã được phân mảnh; chỉ loopback driver thực hiện điều này trong phiên bản 2.6.

Lưu ý rằng kernel không thực hiện scatter/gather I/O đến device của bạn nếu device không đồng thời cung cấp một hình thức tính checksum nào đó. Lý do là nếu kernel phải duyệt qua một packet đã phân mảnh (“nonlinear”) để tính checksum, nó cũng có thể sao chép dữ liệu và gộp packet cùng lúc.

`NETIF_F_IP_CSUM`

`NETIF_F_NO_CSUM`

`NETIF_F_HW_CSUM`

Các flag đều báo kernel không cần áp checksum cho một số hoặc mọi packet rời hệ thống qua interface. Đặt `NETIF_F_IP_CSUM` nếu interface checksum được IP packet nhưng không packet khác. Nếu interface không bao giờ cần checksum, đặt `NETIF_F_NO_CSUM`. Loopback driver đặt flag và snull cũng vậy; vì packet chỉ truyền qua system memory, (hy vọng!) không có cơ hội hỏng nên không cần kiểm tra. Nếu hardware tự checksumming, đặt `NETIF_F_HW_CSUM`.

`NETIF_F_HIGHDMA`

Đặt flag nếu device DMA được tới high memory. Không có flag, mọi packet buffer cung cấp cho driver được cấp phát trong low memory.

`NETIF_F_HW_VLAN_TX`

`NETIF_F_HW_VLAN_RX`

`NETIF_F_HW_VLAN_FILTER`

`NETIF_F_VLAN_CHALLENGED`

Option mô tả hardware hỗ trợ 802.1q VLAN packet. VLAN support ngoài nội dung chương. Nếu VLAN packet khiến device rối (thực sự không nên như vậy), đặt flag `NETIF_F_VLAN_CHALLENGED`.

`NETIF_F_TSO`

Đặt flag nếu device thực hiện được TCP segmentation offloading. TSO là feature nâng cao không thể trình bày ở đây.

### Device Method

Như char driver và block driver, mỗi network device khai báo function tác động lên nó. Operation thực hiện trên network interface liệt kê ở đây. Có thể để một số operation `NULL`; số khác thường không chạm tới vì ether\_setup gán method phù hợp.

Các device method cho network interface có thể được chia thành hai nhóm: cơ bản và tùy chọn. Các method cơ bản là những method cần thiết để có thể sử dụng interface; các method tùy chọn triển khai những chức năng nâng cao không bắt buộc. Sau đây là các method cơ bản:

`int (*open)(struct net_device *dev)`;

Mở interface. Interface được mở mỗi khi ifconfig kích hoạt nó. Method open cần đăng ký mọi system resource cần thiết (I/O port, IRQ, DMA, v.v.), bật hardware và thực hiện các bước thiết lập khác mà device yêu cầu.

`int (*stop)(struct net_device *dev)`;

Dừng interface. Interface dừng khi được đưa xuống. Function phải đảo ngược operation khi open.

`int (*hard_start_xmit) (struct sk_buff *skb, struct net_device *dev)`;

Method khởi đầu truyền packet. Packet đầy đủ (mọi protocol header) nằm trong socket buffer structure (`sk_buff`). Socket buffer giới thiệu phía sau chương.

`int (*hard_header) (struct sk_buff *skb, struct net_device *dev, unsigned`

`short type, void *daddr, void *saddr, unsigned len)`;

Function (gọi trước hard\_start\_xmit) dựng hardware header từ source và destination hardware address lấy trước đó; nhiệm vụ tổ chức thông tin truyền qua đối số thành hardware header device-specific phù hợp. eth\_header là default function cho interface Ethernet-like, ether\_setup gán field tương ứng.

`int (*rebuild_header)(struct sk_buff *skb)`;

Function dựng lại hardware header sau khi ARP resolution hoàn tất nhưng trước khi truyền packet. Default function Ethernet device dùng ARP support code điền thông tin thiếu vào packet.

`void (*tx_timeout)(struct net_device *dev)`;

Method được networking code gọi khi việc truyền packet không hoàn tất trong một khoảng thời gian hợp lý, với giả định rằng một interrupt đã bị bỏ lỡ hoặc interface bị treo. Method này cần xử lý vấn đề và tiếp tục truyền packet.

`struct net_device_stats *(*get_stats)(struct net_device *dev)`;

Method này được gọi mỗi khi một ứng dụng cần lấy số liệu thống kê cho interface, chẳng hạn khi chạy ifconfig hoặc netstat -i. Một cách triển khai mẫu cho snull được giới thiệu trong mục “Thông tin thống kê”.

`int (*set_config)(struct net_device *dev, struct ifmap *map)`;

Thay đổi cấu hình interface. Method này là entry point để cấu hình driver. I/O address và interrupt number của device có thể được thay đổi tại runtime bằng set\_config. System administrator có thể sử dụng khả năng này nếu không thể probe interface. Driver cho hardware hiện đại thường không cần triển khai method này.

Device operation còn lại là tùy chọn:

`int weight`;

`int (*poll)(struct net_device *dev; int *quota)`;

Method driver NAPI-compliant cung cấp để vận hành interface trong polled mode với interrupt tắt. NAPI (và field `weight`) trình bày trong phần “Giảm Receive Interrupt”.

`void (*poll_controller)(struct net_device *dev)`;

Function yêu cầu driver kiểm tra các event trên interface trong những tình huống interrupt bị vô hiệu hóa. Nó được sử dụng cho các tác vụ networking in-kernel cụ thể, chẳng hạn remote console và kernel debugging qua mạng.

`int (*do_ioctl)(struct net_device *dev, struct ifreq *ifr, int cmd)`;

Thực hiện ioctl command interface-specific. (Triển khai mô tả trong phần “Ioctl Command tùy chỉnh”.) Field tương ứng trong `struct net_device` có thể để `NULL` nếu interface không cần command interface-specific.

`void (*set_multicast_list)(struct net_device *dev)`;

Method được gọi khi multicast list của device hoặc flag thay đổi. Xem phần “Multicast” để biết chi tiết và triển khai mẫu.

`int (*set_mac_address)(struct net_device *dev, void *addr)`;

Function có thể triển khai nếu interface hỗ trợ đổi hardware address. Nhiều interface hoàn toàn không hỗ trợ. Số khác dùng triển khai mặc định eth\_mac\_addr (từ drivers/net/net\_init.c). eth\_mac\_addr chỉ copy address mới vào `dev->dev_addr` và chỉ khi interface không chạy. Driver dùng eth\_mac\_addr phải đặt hardware MAC address từ `dev->dev_addr` trong method open.

`int (*change_mtu)(struct net_device *dev, int new_mtu)`;

Function thực hiện thao tác khi maximum transfer unit (MTU) của interface thay đổi. Nếu driver cần làm điều gì đặc biệt khi người dùng thay đổi MTU, nó cần khai báo function riêng; nếu không, function mặc định xử lý phù hợp. snull có một template cho function này nếu bạn quan tâm.

`int (*header_cache) (struct neighbour *neigh, struct hh_cache *hh)`;

header\_cache được gọi điền structure `hh_cache` bằng kết quả ARP query. Gần như mọi driver Ethernet-like dùng được triển khai eth\_header\_cache mặc định.

`int (*header_cache_update) (struct hh_cache *hh, struct net_device *dev`,

`unsigned char *haddr)`;

Method cập nhật destination address trong structure `hh_cache` để đáp ứng thay đổi. Ethernet device dùng eth\_header\_cache\_update.

`int (*hard_header_parse) (struct sk_buff *skb, unsigned char *haddr)`;

Method hard\_header\_parse trích xuất source address từ packet chứa trong `skb` và sao chép địa chỉ đó vào buffer tại `haddr`. Giá trị trả về của function là độ dài của địa chỉ đó. Ethernet device thường sử dụng eth\_header\_parse.

### Utility Field

Các data field còn lại của `struct net_device` được interface dùng để lưu thông tin trạng thái hữu ích. Một số field được ifconfig và netstat sử dụng để cung cấp cho người dùng thông tin về cấu hình hiện tại. Vì vậy, interface cần gán giá trị cho các field này:

`unsigned long trans_start`;

`unsigned long last_rx`;

Các field lưu giá trị jiffies. Driver chịu trách nhiệm cập nhật các giá trị này tương ứng khi bắt đầu truyền và khi nhận được một packet. Giá trị `trans_start` được networking subsystem sử dụng để phát hiện tình trạng bộ truyền bị treo. `last_rx` hiện chưa được sử dụng, nhưng driver vẫn cần duy trì field này để sẵn sàng cho việc sử dụng trong tương lai.

`int watchdog_timeo`;

Thời gian tối thiểu (theo jiffies) phải qua trước khi networking layer quyết định transmission timeout xảy ra và gọi function tx\_timeout của driver.

`void *priv`;

Tương đương `filp->private_data`. Trong driver hiện đại, alloc\_netdev đặt field, không nên truy cập trực tiếp; dùng netdev\_priv thay thế.

`struct dev_mc_list *mc_list`;

`int mc_count`;

Field xử lý multicast transmission. `mc_count` là số item trong `mc_list`. Xem phần “Multicast” để biết thêm.

`spinlock_t xmit_lock`;

`int xmit_lock_owner`;

`xmit_lock` được dùng để tránh nhiều lời gọi đồng thời đến function hard\_start\_xmit của driver. `xmit_lock_owner` là số hiệu CPU đã lấy được `xmit_lock`. Driver không nên thay đổi các field này.

Có field khác trong `struct net_device` nhưng network driver không dùng.

## Mở và đóng

Driver của chúng ta có thể probe interface khi load module hoặc khi kernel boot. Tuy nhiên, trước khi interface có thể vận chuyển packet, kernel phải mở interface và gán cho nó một địa chỉ. Kernel mở hoặc đóng interface để đáp ứng lệnh ifconfig.

Khi ifconfig gán address cho interface, thực hiện hai tác vụ. Đầu tiên gán address bằng `ioctl(SIOCSIFADDR)` (Socket I/O Control Set Interface Address). Sau đó đặt bit `IFF_UP` trong `dev->flag` bằng `ioctl(SIOCSIFFLAGS)` (Socket I/O Control Set Interface Flags) để bật interface.

Đối với device, `ioctl(SIOCSIFADDR)` không làm gì. Không driver function nào được gọi—tác vụ độc lập device, kernel thực hiện. Tuy nhiên lệnh sau (`ioctl(SIOCSIFFLAGS)`) gọi method open của device.

Tương tự khi tắt interface, ifconfig dùng `ioctl(SIOCSIFFLAGS)` xóa `IFF_UP`, method stop được gọi.

Cả hai device method trả `0` khi thành công và giá trị âm thông thường khi lỗi.

Xét về code thực tế, driver phải thực hiện nhiều tác vụ giống char driver và block driver. open yêu cầu các system resource cần thiết và yêu cầu interface chuyển sang trạng thái up; stop tắt interface và giải phóng system resource. Tuy nhiên, network driver phải thực hiện thêm một số bước tại thời điểm open.

Đầu tiên phải copy hardware (MAC) address từ hardware device vào `dev->dev_addr` trước khi interface giao tiếp bên ngoài. Sau đó có thể copy hardware address vào device khi open. Snull software interface gán trong open; chỉ giả hardware number bằng ASCII string dài `ETH_ALEN`, độ dài Ethernet hardware address.

Method open cũng phải khởi động transmit queue của interface (cho phép nhận packet để truyền) khi sẵn sàng gửi dữ liệu. Kernel cung cấp function khởi động queue:

```c
void netif_start_queue(struct net_device *dev);
```

Code open của snull như sau:

```c
int snull_open(struct net_device *dev)
{
    /* request_region( ), request_irq( ), ....  (like fops->open) */

    /*
     * Assign the hardware address of the board: use "\0SNULx", where
     * x is 0 or 1. The first byte is '\0' to avoid being a multicast
     * address (the first byte of multicast addrs is odd).
     */
    memcpy(dev->dev_addr, "\0SNUL0", ETH_ALEN);
    if (dev = = snull_devs[1])
        dev->dev_addr[ETH_ALEN-1]++; /* \0SNUL1 */
    netif_start_queue(dev);
    return 0;
}
```

Như bạn thấy, khi không có hardware thực, method open có rất ít việc phải làm. Method stop cũng tương tự; nó chỉ đảo ngược các thao tác của open. Vì lý do này, function triển khai stop thường được gọi là close hoặc release.

```c
int snull_release(struct net_device *dev)
{
    /* release ports, irq and such -- like fops->close */

    netif_stop_queue(dev); /* can't transmit any more */
    return 0;
}
```

Function:

```c
void netif_stop_queue(struct net_device *dev);
```

ngược với netif\_start\_queue: nó đánh dấu device là không thể truyền thêm packet. Function này phải được gọi khi đóng interface (trong method stop), nhưng cũng có thể được dùng để tạm dừng việc truyền, như được giải thích trong mục tiếp theo.

## Packet Transmission

Tác vụ quan trọng nhất của network interface là truyền/nhận dữ liệu. Ta bắt đầu truyền vì dễ hiểu hơn một chút.

Transmission là gửi packet qua network link. Mỗi khi kernel cần truyền data packet, gọi method hard\_start\_transmit của driver để đặt dữ liệu lên outgoing queue. Mỗi packet kernel xử lý nằm trong socket buffer structure (`struct sk_buff`), định nghĩa ở \<linux/skbuff.h\>. Structure lấy tên từ Unix abstraction biểu diễn network connection là socket. Dù interface không liên quan socket, mỗi network packet thuộc socket trong network layer cao hơn; input/output buffer của socket là list structure `struct sk_buff`. Cùng structure `sk_buff` chứa network data xuyên suốt mọi Linux network subsystem, nhưng với interface socket buffer chỉ là packet.

Pointer đến `sk_buff` thường gọi `skb`, ta theo cách này trong sample code lẫn văn bản.

Socket buffer là một structure phức tạp, và kernel cung cấp một số function để thao tác với nó. Các function được mô tả ở phần sau trong mục “Socket Buffer”; hiện tại, một vài thông tin cơ bản về `sk_buff` là đủ để chúng ta viết một driver hoạt động được.

Socket buffer truyền cho hard\_start\_xmit chứa physical packet đúng như nó sẽ xuất hiện trên media, bao gồm đầy đủ các transmission-level header. Interface không cần sửa đổi dữ liệu được truyền. `skb->data` trỏ đến packet đang được truyền, và `skb->len` là độ dài của packet tính bằng octet. Tình huống này phức tạp hơn đôi chút nếu driver có thể xử lý scatter/gather I/O; chúng ta sẽ đề cập trong mục “Scatter/Gather I/O”.

Sau đây là snull packet transmission code; bộ phận physical transmission tách thành function khác vì mỗi interface driver phải triển khai theo hardware cụ thể đang điều khiển:

```c
int snull_tx(struct sk_buff *skb, struct net_device *dev)
{
    int len;
    char *data, shortpkt[ETH_ZLEN];
    struct snull_priv *priv = netdev_priv(dev);

    data = skb->data;
    len = skb->len;
    if (len < ETH_ZLEN) {
        memset(shortpkt, 0, ETH_ZLEN);
        memcpy(shortpkt, skb->data, skb->len);
        len = ETH_ZLEN;
        data = shortpkt;
    }
    dev->trans_start = jiffies; /* save the timestamp */

    /* Remember the skb, so we can free it at interrupt time */
    priv->skb = skb;

    /* actual deliver of data is device-specific, and not shown here */
    snull_hw_tx(data, len, dev);

    return 0; /* Our simple device can not fail */
}
```

Vì vậy, transmission function chỉ thực hiện một số sanity check trên packet và truyền dữ liệu qua function hardware-related. Tuy nhiên, cần chú ý cách xử lý khi packet cần truyền ngắn hơn độ dài tối thiểu mà media bên dưới hỗ trợ (với snull, đó là “Ethernet” ảo). Nhiều Linux network driver, cũng như driver trên các hệ điều hành khác, đã bị phát hiện làm rò rỉ dữ liệu trong tình huống này. Để tránh tạo ra lỗ hổng bảo mật đó, chúng ta sao chép các packet ngắn vào một array riêng, có thể được zero-pad tường minh đến đủ độ dài mà media yêu cầu. (Có thể đặt dữ liệu đó trên stack một cách an toàn vì độ dài tối thiểu, 60 byte, khá nhỏ).

Giá trị trả về của hard\_start\_xmit phải là `0` khi thành công; tại thời điểm đó, driver đã nhận trách nhiệm đối với packet, cần cố gắng hết sức để bảo đảm việc truyền thành công và phải giải phóng skb khi kết thúc. Giá trị trả về khác 0 cho biết hiện chưa thể truyền packet; kernel sẽ thử lại sau. Trong trường hợp này, driver cần dừng queue cho đến khi tình huống gây thất bại được giải quyết.

Function truyền “hardware-related” (snull\_hw\_tx) không được trình bày ở đây vì nó chỉ tập trung triển khai các thủ thuật của snull device, bao gồm thao tác source address và destination address, nên ít hữu ích với người viết network driver thực. Dĩ nhiên, function này có trong source code mẫu dành cho những người muốn tìm hiểu cách nó hoạt động.

### Điều khiển Transmission Concurrency

Function hard\_start\_xmit được bảo vệ khỏi các lời gọi đồng thời bằng một spinlock (`xmit_lock`) trong structure `net_device`. Tuy nhiên, ngay sau khi function trả về, nó có thể được gọi lại. Function trả về khi software đã hoàn tất việc chỉ dẫn hardware về việc truyền packet, nhưng quá trình truyền bằng hardware nhiều khả năng chưa hoàn tất. Điều này không gây vấn đề cho snull, vì nó thực hiện mọi công việc bằng CPU nên việc truyền packet hoàn tất trước khi transmission function trả về.

Ngược lại, các hardware interface thực truyền packet bất đồng bộ và chỉ có một lượng memory giới hạn để lưu outgoing packet. Khi memory đó cạn kiệt (với một số hardware, chỉ một packet đang chờ truyền cũng có thể gây ra điều này), driver cần yêu cầu networking system không bắt đầu thêm lần truyền nào cho đến khi hardware sẵn sàng nhận dữ liệu mới.

Thông báo này được thực hiện bằng cách gọi netif\_stop\_queue, function đã được giới thiệu để dừng queue. Sau khi dừng queue, driver phải sắp xếp để khởi động lại queue vào một thời điểm trong tương lai, khi nó lại có khả năng nhận packet để truyền. Để làm vậy, driver cần gọi:

```c
void netif_wake_queue(struct net_device *dev);
```

Function giống netif\_start\_queue nhưng còn thúc networking system bắt đầu truyền packet lại.

Phần lớn network hardware hiện đại duy trì một internal queue chứa nhiều packet cần truyền; nhờ đó, chúng có thể đạt hiệu năng mạng tốt nhất. Network driver cho các device này phải hỗ trợ nhiều transmission đang chờ tại một thời điểm, nhưng device memory có thể đầy bất kể hardware có hỗ trợ nhiều outstanding transmission hay không. Mỗi khi device memory đầy đến mức không còn chỗ cho packet lớn nhất có thể, driver cần dừng queue cho đến khi lại có vùng trống.

Nếu phải vô hiệu hóa việc truyền packet từ một vị trí ngoài function hard\_start\_xmit (chẳng hạn để đáp ứng một yêu cầu cấu hình lại), function bạn cần sử dụng là:

```c
void netif_tx_disable(struct net_device *dev);
```

Function khá giống netif\_stop\_queue nhưng bảo đảm khi trả về, method hard\_start\_xmit không chạy trên CPU khác. Queue có thể restart bằng netif\_wake\_queue như thường.

### Transmission Timeout

Phần lớn driver làm việc với hardware thực phải chuẩn bị việc đôi khi hardware không phản hồi. Interface có thể quên đang làm gì, hoặc hệ thống mất interrupt. Vấn đề phổ biến với một số device thiết kế cho personal computer.

Nhiều driver xử lý vấn đề này bằng cách thiết lập timer: nếu operation chưa hoàn tất khi timer hết hạn thì đã có vấn đề. Thực tế, network system là một tổ hợp phức tạp gồm các state machine được điều khiển bởi nhiều timer. Vì vậy, networking code có điều kiện thuận lợi để phát hiện transmission timeout trong quá trình hoạt động thường lệ.

Do đó, network driver không cần tự phát hiện những vấn đề này. Thay vào đó, chúng chỉ cần thiết lập một timeout period trong field `watchdog_timeo` của structure `net_device`. Khoảng thời gian này, tính bằng jiffies, cần đủ dài để tính đến các transmission delay bình thường (chẳng hạn collision do congestion trên network media).

Nếu thời gian hệ thống hiện tại vượt thời điểm `trans_start` của device ít nhất một timeout period, networking layer cuối cùng sẽ gọi method tx\_timeout của driver. Method này có nhiệm vụ thực hiện mọi thao tác cần thiết để giải quyết vấn đề và bảo đảm các transmission đã bắt đầu được hoàn tất đúng cách. Đặc biệt, driver không được mất dấu bất kỳ socket buffer nào mà networking code đã giao cho nó.

Snull mô phỏng được transmitter lockup, điều khiển bằng hai tham số load-time:

```c
static int lockup = 0;
module_param(lockup, int, 0);

static int timeout = SNULL_TIMEOUT;
module_param(timeout, int, 0);
```

Nếu driver được load với parameter `lockup=n`, một lockup được mô phỏng sau mỗi `n` packet được truyền, và field `watchdog_timeo` được đặt bằng giá trị `timeout` cho trước. Khi mô phỏng lockup, snull cũng gọi netif\_stop\_queue để ngăn các lần thử truyền khác xảy ra.

Snull transmission timeout handler như sau:

```c
void snull_tx_timeout (struct net_device *dev)
{
    struct snull_priv *priv = netdev_priv(dev);
    PDEBUG("Transmit timeout at %ld, latency %ld\n", jiffies,
            jiffies - dev->trans_start);
        /* Simulate a transmission interrupt to get things moving */
    priv->status = SNULL_TX_INTR;
    snull_interrupt(0, dev, NULL);
    priv->stats.tx_errors++;
    netif_wake_queue(dev);
    return;
}
```

Khi xảy ra transmission timeout, driver phải ghi nhận lỗi trong số liệu thống kê của interface và sắp xếp reset device về trạng thái hợp lệ để có thể truyền packet mới. Khi timeout xảy ra trong snull, driver gọi snull\_interrupt để bù interrupt “bị thiếu” và khởi động lại transmit queue bằng netif\_wake\_queue.

### Scatter/Gather I/O

Quá trình tạo một packet để truyền trên mạng bao gồm việc ghép nhiều phần. Dữ liệu packet thường phải được sao chép từ user space, và các header được sử dụng bởi nhiều level của network stack cũng phải được thêm vào. Việc ghép này có thể đòi hỏi sao chép khá nhiều dữ liệu. Tuy nhiên, nếu network interface sẽ truyền packet có thể thực hiện scatter/gather I/O, packet không cần được ghép thành một khối duy nhất và có thể tránh phần lớn việc sao chép đó. Scatter/gather I/O cũng cho phép truyền dữ liệu mạng theo kiểu “zero-copy” trực tiếp từ các buffer user-space.

Kernel không chuyển các scattered packet đến method hard\_start\_xmit trừ khi bit `NETIF_F_SG` đã được thiết lập trong field `features` của device structure. Nếu đã thiết lập flag đó, bạn cần xem một field “shared info” đặc biệt trong skb để biết packet gồm một hay nhiều fragment và tìm các scattered fragment khi cần. Một macro đặc biệt tên là skb\_shinfo được cung cấp để truy cập thông tin này. Bước đầu khi truyền các packet có thể đã phân mảnh thường có dạng như sau:

```c
if (skb_shinfo(skb)->nr_frags = = 0) {
    /* Just use skb->data and skb->len as usual */
}
```

Field `nr_frags` cho biết số fragment đã được sử dụng để tạo packet. Nếu bằng `0`, packet tồn tại dưới dạng một khối duy nhất và có thể được truy cập qua field `data` như thông thường. Nếu khác 0, driver phải duyệt qua và sắp xếp truyền từng fragment riêng. Field `data` của skb structure trỏ đến fragment đầu tiên, thay vì toàn bộ packet như trong trường hợp không phân mảnh. Độ dài fragment phải được tính bằng cách trừ `skb->data_len` khỏi `skb->len` (field này vẫn chứa độ dài toàn bộ packet). Các fragment còn lại nằm trong một array tên là `frags` trong shared information structure; mỗi entry trong `frags` là một structure `skb_frag_struct`:

```c
struct skb_frag_struct {
    struct page *page;
    __u16 page_offset;
    __u16 size;
};
```

Như bạn thấy, chúng ta lại làm việc với các structure `page` thay vì kernel virtual address. Driver cần lặp qua các fragment, map từng fragment cho một DMA transfer và không được quên fragment đầu tiên được skb trỏ đến trực tiếp. Dĩ nhiên, hardware phải ghép các fragment và truyền chúng thành một packet duy nhất. Lưu ý rằng nếu bạn đã thiết lập feature flag `NETIF_F_HIGHDMA`, một số hoặc tất cả fragment có thể nằm trong high memory.

## Packet Reception

Nhận dữ liệu từ mạng khó hơn truyền dữ liệu vì một `sk`\_`buff` phải được cấp phát và chuyển lên upper layer từ trong atomic context. Network driver có thể triển khai hai mode nhận packet: interrupt driven và polled. Phần lớn driver triển khai kỹ thuật interrupt-driven, và chúng ta trình bày kỹ thuật đó trước. Một số driver cho adapter high-bandwidth cũng có thể triển khai kỹ thuật polled; chúng ta xem xét cách này trong mục “Giảm Receive Interrupt”.

Cách triển khai snull tách các chi tiết “hardware” khỏi công việc quản lý device-independent. Vì vậy, function snull\_rx được gọi từ snull “interrupt” handler sau khi hardware đã nhận packet và packet đã nằm trong memory của máy tính. snull\_rx nhận một pointer trỏ đến dữ liệu và độ dài packet; trách nhiệm duy nhất của nó là gửi packet cùng một số thông tin bổ sung lên upper layer của networking code. Code này độc lập với cách lấy data pointer và độ dài.

```c
void snull_rx(struct net_device *dev, struct snull_packet *pkt)
{
    struct sk_buff *skb;
    struct snull_priv *priv = netdev_priv(dev);

    /*
     * The packet has been retrieved from the transmission
     * medium. Build an skb around it, so upper layers can handle it
     */
    skb = dev_alloc_skb(pkt->datalen + 2);
    if (!skb) {
        if (printk_ratelimit( ))
            printk(KERN_NOTICE "snull rx: low on mem - packet dropped\n");
        priv->stats.rx_dropped++;
        goto out;
    }
    memcpy(skb_put(skb, pkt->datalen), pkt->data, pkt->datalen);

    /* Write metadata, and then pass to the receive level */
    skb->dev = dev;
    skb->protocol = eth_type_trans(skb, dev);
    skb->ip_summed = CHECKSUM_UNNECESSARY; /* don't check it */
    priv->stats.rx_packets++;
    priv->stats.rx_bytes += pkt->datalen;
    netif_rx(skb);
  out:
    return;
}
```

Function đủ tổng quát để làm template cho network driver bất kỳ, nhưng cần giải thích trước khi tái dùng tự tin.

Bước đầu cấp phát buffer chứa packet. Lưu ý buffer allocation function (dev\_alloc\_skb) cần biết data length. Function dùng thông tin để cấp phát chỗ buffer. dev\_alloc\_skb gọi kmalloc với atomic priority nên dùng an toàn tại interrupt time. Kernel có interface khác cấp phát socket-buffer nhưng không cần giới thiệu tại đây; socket buffer giải thích chi tiết trong phần “Socket Buffer”.

Dĩ nhiên, giá trị trả về của dev\_alloc\_skb phải được kiểm tra, và snull có thực hiện việc đó. Tuy nhiên, chúng ta gọi printk\_ratelimit trước khi thông báo thất bại. Việc tạo hàng trăm hoặc hàng nghìn console message mỗi giây có thể làm toàn bộ hệ thống chậm đi và che khuất nguyên nhân thực sự của vấn đề; printk\_ratelimit giúp ngăn tình trạng này bằng cách trả về `0` khi đã có quá nhiều output gửi đến console và cần giảm tốc độ thông báo.

Khi đã có pointer `skb` hợp lệ, dữ liệu packet được sao chép vào buffer bằng cách gọi memcpy; function skb\_put cập nhật end-of-data pointer trong buffer và trả về một pointer trỏ đến vùng vừa được tạo.

Nếu đang viết một driver high-performance cho interface có thể thực hiện đầy đủ bus-mastering I/O, có một cách tối ưu đáng cân nhắc ở đây. Một số driver cấp phát socket buffer cho incoming packet trước khi nhận chúng, rồi chỉ dẫn interface đặt dữ liệu packet trực tiếp vào vùng của socket buffer. Networking layer hỗ trợ chiến lược này bằng cách cấp phát mọi socket buffer trong vùng DMA-capable (có thể nằm trong high memory nếu device có feature flag `NETIF_F_HIGHDMA` được thiết lập). Cách này tránh một thao tác sao chép riêng để điền socket buffer, nhưng đòi hỏi cẩn thận với kích thước buffer vì bạn không biết trước incoming packet lớn bao nhiêu. Việc triển khai method change\_mtu cũng quan trọng trong trường hợp này vì nó cho phép driver đáp ứng thay đổi về kích thước packet tối đa.

Network layer cần được cung cấp rõ một số thông tin trước khi có thể hiểu packet. Vì vậy, các field `dev` và `protocol` phải được gán trước khi buffer được chuyển lên trên. Ethernet support code export một helper function (eth\_type\_trans), tìm giá trị phù hợp để đặt vào `protocol`. Sau đó, chúng ta cần chỉ định việc tính checksum sẽ được thực hiện hoặc đã được thực hiện như thế nào trên packet (snull không cần tính checksum). Các policy có thể sử dụng cho `skb->ip_summed` là:

`CHECKSUM_HW`

Device đã checksum bằng hardware. Ví dụ hardware checksum là SPARC HME interface.

`CHECKSUM_NONE`

Checksum chưa được xác minh, system software phải thực hiện. Đây là mặc định của buffer mới cấp phát.

`CHECKSUM_UNNECESSARY`

Không checksum. Policy trong snull và loopback interface.

Có thể bạn tự hỏi vì sao phải chỉ định checksum status tại đây khi đã đặt flag trong field `features` của structure `net_device`. Vì flag `features` báo kernel cách device xử lý outgoing packet. Không dùng cho incoming packet, chúng phải được đánh dấu riêng.

Cuối cùng, driver cập nhật statistics counter để ghi nhận đã nhận được một packet. Statistics structure gồm nhiều field; quan trọng nhất là `rx_packets`, `rx_bytes`, `tx_packets` và `tx_bytes`, chứa số packet nhận, số packet truyền và tổng số octet được truyền. Tất cả field được mô tả chi tiết trong mục “Thông tin thống kê”.

Bước cuối cùng khi nhận packet được thực hiện bởi netif\_rx, chuyển socket buffer lên upper layer. netif\_rx thực tế trả về một giá trị integer; `NET_RX_SUCCESS` (`0`) nghĩa là packet đã được nhận thành công, còn bất kỳ giá trị nào khác đều cho biết có vấn đề. Ba giá trị trả về `NET_RX_CN_LOW`, `NET_RX_CN_MOD` và `NET_RX_CN_HIGH` cho biết các mức congestion tăng dần trong networking subsystem; `NET_RX_DROP` nghĩa là packet đã bị loại bỏ. Driver có thể dùng các giá trị này để dừng đưa packet vào kernel khi congestion cao, nhưng trong thực tế, phần lớn driver bỏ qua giá trị trả về của netif\_rx. Nếu đang viết driver cho device high-bandwidth và muốn phản ứng phù hợp với congestion, cách tốt nhất là triển khai NAPI, nội dung sẽ được trình bày sau phần thảo luận ngắn về interrupt handler.

## Interrupt Handler

Phần lớn hardware interface được điều khiển thông qua interrupt handler. Hardware interrupt processor để báo hiệu một trong hai event: một packet mới đã đến hoặc việc truyền một outgoing packet đã hoàn tất. Network interface cũng có thể tạo interrupt để báo lỗi, thay đổi trạng thái link và các event khác.

Interrupt routine thông thường phân biệt interrupt new-packet-arrived và thông báo done-transmitting bằng kiểm tra status register trên physical device. Snull tương tự nhưng status word triển khai bằng software trong `dev->priv`. Interrupt handler cho network interface như sau:

```c
static void snull_regular_interrupt(int irq, void *dev_id, struct pt_regs *regs)
{
    int statusword;
    struct snull_priv *priv;
    struct snull_packet *pkt = NULL;
    /*
     * As usual, check the "device" pointer to be sure it is
     * really interrupting.
     * Then assign "struct device *dev"
     */
    struct net_device *dev = (struct net_device *)dev_id;
    /* ... and check with hw if it's really ours */

    /* paranoid */
    if (!dev)
        return;

    /* Lock the device */
    priv = netdev_priv(dev);
    spin_lock(&priv->lock);

    /* retrieve statusword: real netdevices use I/O instructions */
    statusword = priv->status;
    priv->status = 0;
    if (statusword & SNULL_RX_INTR) {
        /* send it to snull_rx for handling */
        pkt = priv->rx_queue;
        if (pkt) {
            priv->rx_queue = pkt->next;
            snull_rx(dev, pkt);
        }
    }
    if (statusword & SNULL_TX_INTR) {
        /* a transmission is over: free the skb */
        priv->stats.tx_packets++;
        priv->stats.tx_bytes += priv->tx_packetlen;
        dev_kfree_skb(priv->skb);
    }

    /* Unlock the device and we are done */
    spin_unlock(&priv->lock);
    if (pkt) snull_release_buffer(pkt); /* Do this outside the lock! */
    return;
}
```

Tác vụ đầu handler là lấy pointer tới `struct net_device` đúng. Pointer thường từ `dev_id` nhận làm đối số.

Phần đáng chú ý của handler này xử lý tình huống “transmission done”. Trong trường hợp đó, số liệu thống kê được cập nhật và dev\_kfree\_skb được gọi để trả socket buffer không còn cần thiết về hệ thống. Thực tế, có ba biến thể của function này có thể được gọi:

`dev_kfree_skb(struct sk_buff *skb)`;

Dùng version này khi biết code không chạy trong interrupt context. Vì snull không có hardware interrupt thực, ta dùng version này.

`dev_kfree_skb_irq(struct sk_buff *skb)`;

Nếu biết giải phóng buffer trong interrupt handler, dùng version tối ưu cho trường hợp đó.

`dev_kfree_skb_any(struct sk_buff *skb)`;

Dùng version này nếu code liên quan có thể chạy trong interrupt hoặc noninterrupt context.

Cuối cùng nếu driver tạm dừng transmission queue, thường restart ở đây bằng netif\_wake\_queue.

Nhận packet khác truyền, không cần xử lý interrupt đặc biệt. Chỉ cần gọi snull\_rx (đã thấy).

## Giảm Receive Interrupt

Khi network driver được viết như mô tả ở trên, processor bị interrupt cho mỗi packet mà interface nhận được. Trong nhiều trường hợp, đây là mode hoạt động mong muốn và không gây vấn đề. Tuy nhiên, High-bandwidth interface có thể nhận hàng nghìn packet mỗi giây. Với interrupt load như vậy, hiệu năng tổng thể của hệ thống có thể bị ảnh hưởng.

Để cải thiện hiệu năng Linux trên các hệ thống high-end, các nhà phát triển networking subsystem đã tạo một interface thay thế tên là NAPI[^1], dựa trên polling. “Polling” có thể bị xem là một từ không hay trong giới phát triển driver, vì họ thường coi các kỹ thuật polling là thiếu tinh tế và kém hiệu quả. Tuy nhiên, polling chỉ kém hiệu quả nếu interface bị poll khi không có công việc cần làm. Khi hệ thống có một interface high-speed xử lý lượng traffic lớn, luôn còn packet cần xử lý. Không cần interrupt processor trong những tình huống này; chỉ cần định kỳ thu thập các packet mới từ interface.

Dừng receive interrupt có thể giảm đáng kể tải cho processor. Các driver NAPI-compliant cũng có thể được yêu cầu không đưa packet vào kernel nếu những packet đó chỉ bị networking code loại bỏ do congestion; điều này còn giúp cải thiện hiệu năng đúng lúc cần thiết nhất. Vì nhiều lý do, NAPI driver cũng ít có khả năng làm thay đổi thứ tự packet hơn.

Tuy nhiên không phải mọi device dùng được NAPI mode. Interface NAPI-capable phải lưu được nhiều packet (trên card hoặc DMA ring in-memory). Interface phải tắt được interrupt cho received packet trong khi vẫn interrupt cho truyền thành công và event khác. Còn vấn đề tinh tế khác khiến viết driver NAPI-compliant khó hơn; xem Documentation/networking/NAPI\_HOWTO.txt trong kernel source tree để biết chi tiết.

Tương đối ít driver triển khai NAPI interface. Tuy nhiên nếu viết driver cho interface có thể sinh rất nhiều interrupt, dành thời gian triển khai NAPI có thể đáng giá.

snull driver hoạt động ở NAPI mode khi được load với parameter `use_napi` đặt thành giá trị khác 0. Tại thời điểm khởi tạo, chúng ta phải thiết lập thêm một vài field của `struct net_device`:

```c
if (use_napi) {
    dev->poll        = snull_poll;
    dev->weight      = 2;
}
```

Field `poll` phải được đặt bằng polling function của driver; chúng ta sẽ sớm xem xét snull\_poll. Field `weight` mô tả tầm quan trọng tương đối của interface: lượng traffic cần được chấp nhận từ interface khi tài nguyên hạn chế. Không có quy tắc nghiêm ngặt về cách thiết lập parameter `weight`; theo quy ước, các Ethernet interface 10 MBps đặt `weight` bằng `16`, còn các interface nhanh hơn sử dụng `64`. Bạn không nên đặt `weight` lớn hơn số packet mà interface có thể lưu. Trong snull, chúng ta đặt `weight` bằng hai để minh họa deferred packet reception.

Bước tiếp theo để tạo một driver NAPI-compliant là thay đổi interrupt handler. Khi interface, vốn cần bắt đầu với receive interrupt được bật, báo hiệu một packet đã đến, interrupt handler không nên xử lý packet đó. Thay vào đó, nó cần vô hiệu hóa các receive interrupt tiếp theo và thông báo cho kernel rằng đã đến lúc bắt đầu poll interface. Trong snull “interrupt” handler, code phản hồi packet reception interrupt được thay đổi thành:

```c
if (statusword & SNULL_RX_INTR) {
    snull_rx_ints(dev, 0);  /* Disable further interrupts */
    netif_rx_schedule(dev);
}
```

Khi interface báo có packet, interrupt handler để packet đó trong interface; thao tác duy nhất cần thực hiện lúc này là gọi netif\_rx\_schedule, khiến method poll của chúng ta được gọi vào một thời điểm sau đó.

Method poll có prototype:

```c
int (*poll)(struct net_device *dev, int *budget);
```

Triển khai method poll của snull như sau:

```c
static int snull_poll(struct net_device *dev, int *budget)
{
    int npackets = 0, quota = min(dev->quota, *budget);
    struct sk_buff *skb;
    struct snull_priv *priv = netdev_priv(dev);
    struct snull_packet *pkt;

    while (npackets < quota && priv->rx_queue) {
        pkt = snull_dequeue_buf(dev);
        skb = dev_alloc_skb(pkt->datalen + 2);
        if (! skb) {
            if (printk_ratelimit( ))
                printk(KERN_NOTICE "snull: packet dropped\n");
            priv->stats.rx_dropped++;
            snull_release_buffer(pkt);
            continue;
        }
        memcpy(skb_put(skb, pkt->datalen), pkt->data, pkt->datalen);
        skb->dev = dev;
        skb->protocol = eth_type_trans(skb, dev);
        skb->ip_summed = CHECKSUM_UNNECESSARY; /* don't check it */
        netif_receive_skb(skb);

            /* Maintain stats */
        npackets++;
        priv->stats.rx_packets++;
        priv->stats.rx_bytes += pkt->datalen;
        snull_release_buffer(pkt);
    }
    /* If we processed all packets, we're done; tell the kernel and reenable ints */
    *budget -= npackets;
    dev->quota -= npackets;
    if (! priv->rx_queue) {
        netif_rx_complete(dev);
        snull_rx_ints(dev, 1);
        return 0;
    }
    /* We couldn't process everything. */
    return 1;
}
```

Phần trung tâm của function tạo một skb chứa packet; code này giống code chúng ta đã thấy trước đó trong snull\_rx. Tuy nhiên, có một số điểm khác biệt:

- Parameter `budget` cung cấp số packet tối đa mà chúng ta được phép chuyển vào kernel. Trong device structure, field `quota` cung cấp một giới hạn tối đa khác; method poll phải tuân theo giá trị nhỏ hơn trong hai giới hạn. Nó cũng cần giảm cả `dev->quota` và `*budget` theo số packet thực sự nhận được. Giá trị `budget` là số packet tối đa mà CPU hiện tại có thể nhận từ tất cả interface, trong khi `quota` là giá trị per-interface, thường bắt đầu bằng `weight` được gán cho interface tại thời điểm khởi tạo.

- Phải đưa packet vào kernel bằng netif\_receive\_skb thay netif\_rx.

- Nếu method poll có thể xử lý tất cả packet hiện có trong các giới hạn được cung cấp, nó cần re-enable receive interrupt, gọi netif\_rx\_complete để tắt polling và trả về `0`. Giá trị trả về `1` cho biết vẫn còn packet cần xử lý.

Networking subsystem bảo đảm method poll của một device cụ thể không được gọi đồng thời trên nhiều processor. Tuy nhiên, các lời gọi poll vẫn có thể xảy ra đồng thời với các lời gọi đến những device method khác của bạn.

## Thay đổi Link State

Theo định nghĩa, network connection làm việc với thế giới bên ngoài hệ thống cục bộ. Vì vậy, chúng thường chịu ảnh hưởng của các event bên ngoài và có thể chỉ tồn tại tạm thời. Networking subsystem cần biết khi nào network link chuyển sang up hoặc down và cung cấp một số function để driver truyền đạt thông tin đó.

Phần lớn công nghệ mạng có kết nối vật lý thực cung cấp một carrier state; sự hiện diện của carrier có nghĩa là hardware hiện diện và sẵn sàng hoạt động. Ví dụ, Ethernet adapter cảm nhận carrier signal trên dây; khi người dùng vấp phải cáp, carrier đó biến mất và link chuyển sang down. Theo mặc định, network device được giả định là có carrier signal. Tuy nhiên, driver có thể thay đổi trạng thái này một cách tường minh bằng các function sau:

```c
void netif_carrier_off(struct net_device *dev);
void netif_carrier_on(struct net_device *dev);
```

Nếu driver phát hiện mất carrier trên một device của nó, nó cần gọi netif\_carrier\_off để thông báo thay đổi này cho kernel. Khi carrier trở lại, cần gọi netif\_carrier\_on. Một số driver cũng gọi netif\_carrier\_off khi thực hiện thay đổi cấu hình lớn (chẳng hạn media type); sau khi adapter reset xong, carrier mới được phát hiện và traffic có thể tiếp tục.

Cũng có integer function:

```c
int netif_carrier_ok(struct net_device *dev);
```

Dùng kiểm tra carrier state hiện tại (phản ánh trong device structure).

## Socket Buffer

Chúng ta đã trình bày phần lớn các vấn đề liên quan đến network interface. Phần còn thiếu là thảo luận chi tiết hơn về structure `sk_buff`. Structure này nằm ở trung tâm network subsystem của Linux kernel; bây giờ chúng ta giới thiệu cả các field chính của structure và các function dùng để thao tác với nó.

Mặc dù không bắt buộc phải hiểu cấu trúc bên trong của `sk_buff`, khả năng xem nội dung của nó có thể hữu ích khi truy tìm vấn đề và tối ưu code. Ví dụ, nếu xem loopback.c, bạn sẽ thấy một cách tối ưu dựa trên hiểu biết về cấu trúc bên trong của `sk_buff`. Cảnh báo thông thường vẫn áp dụng ở đây: nếu viết code tận dụng hiểu biết về structure `sk_buff`, bạn cần chuẩn bị cho khả năng code đó không còn hoạt động trong các kernel release tương lai. Tuy nhiên, đôi khi lợi thế hiệu năng đủ để chấp nhận chi phí bảo trì bổ sung.

Chúng ta không mô tả toàn bộ structure ở đây, mà chỉ trình bày các field có thể được sử dụng trong driver. Nếu muốn tìm hiểu thêm, bạn có thể xem \<linux/skbuff.h\>, nơi structure được định nghĩa và các function được khai báo prototype. Có thể dễ dàng tìm thêm chi tiết về cách sử dụng field và function bằng cách tìm kiếm với grep trong kernel source code.

### Field quan trọng

Field giới thiệu ở đây là thứ driver có thể cần truy cập. Không liệt kê theo thứ tự đặc biệt.

`struct net_device *dev`;

Device nhận hoặc gửi buffer này.

`union { /*... */ } h`;

`union { /*... */ } nh`;

`union { /*... */} mac`;

Pointer tới các level header trong packet. Mỗi field union là pointer tới data structure type khác. `h` giữ pointer tới transport layer header (ví dụ `struct tcphdr *th`); `nh` chứa network layer header (như `struct iphdr *iph`); `mac` tập hợp pointer tới header link-layer (như `struct ethdr *ethernet`).

Nếu driver cần xem source address và destination address của một TCP packet, nó có thể tìm chúng trong `skb->h.th`. Xem header file để biết đầy đủ các header type có thể truy cập theo cách này.

Lưu ý network driver chịu trách nhiệm đặt pointer `mac` cho incoming packet. Thường eth\_type\_trans xử lý, nhưng driver non-Ethernet phải đặt trực tiếp `skb->mac.raw` như phần “Header Non-Ethernet”.

`unsigned char *head`;

`unsigned char *data`;

`unsigned char *tail`;

`unsigned char *end`;

Các pointer được sử dụng để định vị dữ liệu trong packet. `head` trỏ đến đầu vùng đã được cấp phát, `data` là vị trí bắt đầu các octet hợp lệ (và thường lớn hơn `head` một chút), `tail` là vị trí kết thúc các octet hợp lệ, còn `end` trỏ đến địa chỉ tối đa mà `tail` có thể đạt tới. Một cách nhìn khác là dung lượng buffer khả dụng bằng `skb->end - skb->head`, còn vùng dữ liệu hiện đang được sử dụng bằng `skb->tail - skb->data`.

`unsigned int len`;

`unsigned int data_len`;

`len` là độ dài toàn bộ dữ liệu trong packet, còn `data_len` là độ dài phần packet được lưu trong các fragment riêng. Field `data_len` bằng `0` trừ khi scatter/gather I/O đang được sử dụng.

`unsigned char ip_summed`;

Checksum policy cho packet. Driver đặt field trên incoming packet như phần “Packet Reception”.

`unsigned char pkt_type`;

Packet classification dùng khi giao packet. Driver chịu trách nhiệm đặt thành `PACKET_HOST` (packet cho tôi), `PACKET_OTHERHOST` (không, không cho tôi), `PACKET_BROADCAST` hoặc `PACKET_MULTICAST`. Ethernet driver không sửa rõ `pkt_type` vì eth\_type\_trans làm thay.

`shinfo(struct sk_buff *skb)`;

`unsigned int shinfo(skb)->nr_frags`;

`skb_frag_t shinfo(skb)->frags`;

Vì lý do hiệu năng, một số thông tin của skb được lưu trong một structure riêng nằm ngay sau skb trong memory. “Shared info” này, được gọi như vậy vì có thể được chia sẻ giữa các bản sao của skb trong networking code, phải được truy cập qua macro shinfo. Structure này có một số field, nhưng phần lớn nằm ngoài phạm vi cuốn sách. Chúng ta đã thấy `nr_frags` và `frags` trong mục “Scatter/Gather I/O”.

Các field còn lại trong structure không có gì đặc biệt đáng chú ý. Chúng được sử dụng để duy trì các buffer list, thống kê memory thuộc socket sở hữu buffer và thực hiện các công việc tương tự.

### Function thao tác Socket Buffer

Network device dùng structure `sk_buff` thao tác qua official interface function. Nhiều function thao tác socket buffer; sau đây là thứ đáng chú ý nhất:

`struct sk_buff *alloc_skb(unsigned int len, int priority)`;

`struct sk_buff *dev_alloc_skb(unsigned int len)`;

Cấp phát buffer. Function alloc\_skb cấp phát buffer và khởi tạo cả `skb->data`, `skb->tail` bằng `skb->head`. Function dev\_alloc\_skb là shortcut gọi alloc\_skb với priority `GFP_ATOMIC`, reserve vùng giữa `skb->head` và `skb->data`. Vùng dữ liệu này dùng tối ưu trong network layer, driver không nên chạm.

`void kfree_skb(struct sk_buff *skb)`;

`void dev_kfree_skb(struct sk_buff *skb)`;

`void dev_kfree_skb_irq(struct sk_buff *skb)`;

`void dev_kfree_skb_any(struct sk_buff *skb)`;

Giải phóng buffer. Kernel dùng nội bộ kfree\_skb. Driver nên dùng một dạng dev\_kfree\_skb: dev\_kfree\_skb cho noninterrupt context, dev\_kfree\_skb\_irq cho interrupt context, hoặc dev\_kfree\_skb\_any cho code chạy được cả hai.

`unsigned char *skb_put(struct sk_buff *skb, int len)`;

`unsigned char *__skb_put(struct sk_buff *skb, int len)`;

Cập nhật các field `tail` và `len` của structure `sk_buff`; các function này được sử dụng để thêm dữ liệu vào cuối buffer. Giá trị trả về của mỗi function là giá trị trước đó của `skb->tail` (nói cách khác, nó trỏ đến vùng dữ liệu vừa được tạo). Driver có thể dùng giá trị trả về để sao chép dữ liệu bằng cách gọi `memcpy(skb_put(...), data, len)` hoặc một thao tác tương đương. Khác biệt giữa hai function là skb\_put kiểm tra để bảo đảm dữ liệu vừa với buffer, còn \_\_skb\_put bỏ qua bước kiểm tra.

`unsigned char *skb_push(struct sk_buff *skb, int len)`;

`unsigned char *__skb_push(struct sk_buff *skb, int len)`;

Các function giảm `skb->data` và tăng `skb->len`. Chúng tương tự skb\_put, nhưng dữ liệu được thêm vào đầu packet thay vì cuối packet. Giá trị trả về trỏ đến vùng dữ liệu vừa được tạo. Các function được sử dụng để thêm hardware header trước khi truyền packet. Một lần nữa, \_\_skb\_push khác ở chỗ không kiểm tra xem có đủ vùng trống hay không.

`int skb_tailroom(struct sk_buff *skb)`;

Trả về lượng vùng trống khả dụng để thêm dữ liệu vào buffer. Nếu driver thêm nhiều dữ liệu hơn sức chứa của buffer, hệ thống sẽ panic. Mặc dù bạn có thể cho rằng một printk là đủ để báo lỗi, memory corruption gây hại cho hệ thống đến mức các nhà phát triển quyết định thực hiện hành động dứt khoát. Trong thực tế, bạn không cần kiểm tra vùng trống nếu buffer đã được cấp phát đúng. Vì driver thường biết kích thước packet trước khi cấp phát buffer, chỉ một driver bị lỗi nghiêm trọng mới thêm quá nhiều dữ liệu vào buffer, và panic có thể được xem là hình phạt xứng đáng.

`int skb_headroom(struct sk_buff *skb)`;

Trả lượng chỗ khả dụng trước `data`, tức bao nhiêu octet có thể “push” vào buffer.

`void skb_reserve(struct sk_buff *skb, int len)`;

Tăng cả `data` và `tail`. Function này có thể được dùng để dành trước headroom trước khi điền dữ liệu vào buffer. Phần lớn Ethernet interface dành trước hai byte ở đầu packet; nhờ đó, IP header được căn chỉnh tại ranh giới 16-byte, sau một Ethernet header dài 14-byte. snull cũng thực hiện điều này, mặc dù lệnh đó không được trình bày trong mục “Packet Reception” để tránh đưa thêm khái niệm vào thời điểm ấy.

`unsigned char *skb_pull(struct sk_buff *skb, int len)`;

Loại bỏ dữ liệu khỏi đầu packet. Driver không cần sử dụng function này, nhưng nó được đưa vào đây để bảo đảm đầy đủ. Function giảm `skb->len` và tăng `skb->data`; đây là cách hardware header (Ethernet hoặc tương đương) được loại bỏ khỏi đầu incoming packet.

`int skb_is_nonlinear(struct sk_buff *skb)`;

Trả true nếu skb tách thành nhiều fragment cho scatter/gather I/O.

`int skb_headlen(struct sk_buff *skb)`;

Trả độ dài segment đầu của skb (phần `skb->data` trỏ tới).

`void *kmap_skb_frag(skb_frag_t *frag)`;

`void kunmap_skb_frag(void *vaddr)`;

Nếu cần truy cập trực tiếp các fragment trong một nonlinear skb từ bên trong kernel, các function này thực hiện map và unmap chúng cho bạn. Một atomic kmap được sử dụng, vì vậy không thể map nhiều hơn một fragment tại một thời điểm.

Kernel định nghĩa function khác thao tác socket buffer nhưng dành cho networking code layer cao hơn, driver không cần.

## MAC Address Resolution

Vấn đề thú vị của Ethernet communication là gắn MAC address (hardware ID duy nhất của interface) với IP number thế nào. Phần lớn protocol có vấn đề tương tự nhưng tập trung trường hợp Ethernet-like. Để mô tả đầy đủ, trình bày ba tình huống: ARP, Ethernet header không ARP (như plip) và header non-Ethernet.

### Dùng ARP với Ethernet

Cách thông thường xử lý address resolution là Address Resolution Protocol (ARP). May thay kernel quản lý ARP, Ethernet interface không cần làm gì đặc biệt để hỗ trợ. Miễn `dev->addr` và `dev->addr_len` gán đúng khi open, driver không cần lo resolve IP number thành MAC address; ether\_setup gán device method đúng cho `dev->hard_header` và `dev->rebuild_header`.

Mặc dù kernel thường xử lý các chi tiết của address resolution và cache kết quả, nó vẫn yêu cầu interface driver hỗ trợ tạo packet. Xét cho cùng, driver biết các chi tiết của physical layer header, trong khi những người viết networking code cố gắng tách phần còn lại của kernel khỏi những kiến thức đó. Vì vậy, kernel gọi method hard\_header của driver để bố trí packet bằng kết quả ARP query. Thông thường, người viết Ethernet driver không cần biết quá trình này vì common Ethernet code xử lý mọi thứ.

### Override ARP

Các network interface point-to-point đơn giản, chẳng hạn plip, có thể hưởng lợi từ việc sử dụng Ethernet header trong khi tránh overhead do gửi ARP packet qua lại. Code mẫu trong snull cũng thuộc nhóm network device này. snull không thể sử dụng ARP vì driver thay đổi IP address trong packet đang được truyền, trong khi ARP packet cũng trao đổi IP address. Mặc dù chúng ta có thể dễ dàng triển khai một bộ tạo ARP reply đơn giản, việc minh họa cách xử lý trực tiếp các physical-layer header có giá trị hơn.

Nếu device muốn dùng hardware header thông thường mà không chạy ARP, cần override default method dev-\>hard\_header. Snull triển khai bằng function rất ngắn:

```c
int snull_header(struct sk_buff *skb, struct net_device *dev,
                unsigned short type, void *daddr, void *saddr,
                unsigned int len)
{
    struct ethhdr *eth = (struct ethhdr *)skb_push(skb,ETH_HLEN);

    eth->h_proto = htons(type);
    memcpy(eth->h_source, saddr ? saddr : dev->dev_addr, dev->addr_len);
    memcpy(eth->h_dest,   daddr ? daddr : dev->dev_addr, dev->addr_len);
    eth->h_dest[ETH_ALEN-1]   ^= 0x01;   /* dest is us xor 1 */
    return (dev->hard_header_len);
}
```

Function này lấy thông tin do kernel cung cấp và định dạng thành một standard Ethernet header. Nó cũng đảo một bit trong destination Ethernet address vì những lý do được mô tả ở phần sau.

Khi interface nhận packet, eth\_type\_trans dùng hardware header theo vài cách. Ta đã thấy lời gọi trong snull\_rx:

```c
skb->protocol = eth_type_trans(skb, dev);
```

Function trích xuất protocol identifier (`ETH_P_IP` trong trường hợp này) từ Ethernet header; nó cũng gán `skb->mac.raw`, loại bỏ hardware header khỏi dữ liệu packet bằng skb\_pull và thiết lập `skb->pkt_type`. Mục cuối mặc định là `PACKET_HOST` khi cấp phát `skb`, cho biết packet được gửi đến host này; eth\_type\_trans thay đổi nó để phản ánh Ethernet destination address. Nếu địa chỉ đó không khớp địa chỉ của interface nhận packet, field `pkt_type` được đặt thành `PACKET_OTHERHOST`. Sau đó, trừ khi interface ở promiscuous mode hoặc kernel đã bật packet forwarding, netif\_rx loại bỏ mọi packet có type `PACKET_OTHERHOST`. Vì lý do này, snull\_header cẩn thận làm cho destination hardware address khớp địa chỉ của interface “nhận”.

Nếu interface là link point-to-point, bạn không muốn nhận multicast packet ngoài dự kiến. Để tránh, nhớ destination address có octet đầu với `0` ở least significant bit (LSB) hướng tới một host (tức `PACKET_HOST` hoặc `PACKET_OTHERHOST`). Plip driver dùng `0xfc` làm octet đầu hardware address, snull dùng `0x00`. Cả hai tạo link point-to-point Ethernet-like hoạt động.

### Header Non-Ethernet

Chúng ta vừa thấy rằng hardware header chứa một số thông tin ngoài destination address, trong đó quan trọng nhất là communication protocol. Bây giờ chúng ta mô tả cách sử dụng hardware header để encapsulate thông tin liên quan. Nếu cần biết chi tiết, bạn có thể tìm chúng trong kernel source code hoặc tài liệu kỹ thuật của transmission medium cụ thể. Phần lớn người viết driver có thể bỏ qua phần thảo luận này và chỉ sử dụng cách triển khai Ethernet.

Lưu ý không phải protocol nào cũng cần cung cấp mọi thông tin. Link point-to-point như plip hoặc snull có thể tránh truyền toàn Ethernet header mà không mất tính tổng quát. Device method hard\_header, trước đó triển khai bằng snull\_header, nhận delivery information—cả protocol-level và hardware address—từ kernel. Cũng nhận protocol number 16-bit trong đối số `type`; ví dụ IP nhận diện bằng `ETH_P_IP`. Driver phải giao đúng cả packet data và protocol number cho receiving host. Link point-to-point có thể bỏ address khỏi hardware header, chỉ truyền protocol number vì giao packet bảo đảm độc lập source/destination address. Link IP-only thậm chí không cần truyền hardware header nào.

Khi packet được nhận ở đầu kia của link, receiving function trong driver cần thiết lập đúng các field `skb->protocol`, `skb->pkt_type` và `skb->mac.raw`.

`skb->mac.raw` là char pointer dùng bởi cơ chế address-resolution ở networking code layer cao hơn (như net/ipv4/arp.c). Phải trỏ tới machine address khớp `dev->type`. Device type value có thể có định nghĩa trong \<linux/if\_arp.h\>; Ethernet interface dùng `ARPHRD_ETHER`. Ví dụ cách eth\_type\_trans xử lý Ethernet header cho received packet:

```c
skb->mac.raw = skb->data;
skb_pull(skb, dev->hard_header_len);
```

Trong trường hợp đơn giản nhất (link point-to-point không header), `skb->mac.raw` có thể trỏ static buffer chứa hardware address của interface, `protocol` đặt `ETH_P_IP`, `packet_type` giữ mặc định `PACKET_HOST`.

Vì mỗi hardware type có đặc điểm riêng, khó đưa ra lời khuyên cụ thể hơn những gì đã thảo luận. Tuy nhiên, kernel có rất nhiều ví dụ. Chẳng hạn, hãy xem AppleTalk driver (drivers/net/appletalk/cops.c), các infrared driver (như drivers/net/irda/smc\_ircc.c) hoặc PPP driver (drivers/net/ppp\_generic.c).

## Ioctl Command tùy chỉnh

Ta thấy ioctl system call được triển khai cho socket; `SIOCSIFADDR` và `SIOCSIFMAP` là ví dụ “socket ioctl”. Giờ xem networking code dùng đối số thứ ba của system call thế nào.

Khi gọi ioctl system call trên socket, command number là symbol trong \<linux/sockios.h\>, function sock\_ioctl gọi trực tiếp function protocol-specific (“protocol” chỉ network protocol chính đang dùng, ví dụ IP hoặc AppleTalk).

Ioctl command không được protocol layer nhận diện chuyển sang device layer. Các ioctl command device-related nhận đối số thứ ba từ user space là `struct ifreq *`. Structure định nghĩa trong \<linux/if.h\>. Command `SIOCSIFADDR` và `SIOCSIFMAP` thực sự thao tác structure `ifreq`. Đối số thêm của `SIOCSIFMAP`, dù định nghĩa `ifmap`, chỉ là field của `ifreq`.

Ngoài lời gọi tiêu chuẩn, mỗi interface định nghĩa ioctl command riêng được. Ví dụ plip cho phép sửa internal timeout value qua ioctl. Ioctl implementation cho socket nhận diện 16 command private cho interface: từ `SIOCDEVPRIVATE` tới `SIOCDEVPRIVATE+15`.[^2]

Khi nhận diện một command, `dev->do_ioctl` được gọi trong interface driver liên quan. Function nhận cùng pointer `struct ifreq *` mà ioctl function general-purpose dùng:

```c
int (*do_ioctl)(struct net_device *dev, struct ifreq *ifr, int cmd);
```

Pointer `ifr` trỏ đến một kernel-space address chứa bản sao của structure do người dùng truyền vào. Sau khi do\_ioctl trả về, structure được sao chép trở lại user space; vì vậy, driver có thể dùng các private command để vừa nhận vừa trả dữ liệu.

Các command device-specific có thể chọn sử dụng các field trong `struct ifreq`, nhưng những field đó đã mang ý nghĩa được chuẩn hóa nên driver khó điều chỉnh structure cho phù hợp nhu cầu riêng. Field `ifr_data` là một phần tử `caddr_t` (một pointer) dành cho các nhu cầu device-specific. Driver và chương trình gọi các ioctl command của nó cần thống nhất cách sử dụng `ifr_data`. Ví dụ, pppstats sử dụng các command device-specific để truy xuất thông tin từ ppp interface driver.

Không cần trình bày cách triển khai do\_ioctl ở đây, nhưng với thông tin trong chương này và các ví dụ trong kernel, bạn có thể viết một function như vậy khi cần. Tuy nhiên, lưu ý rằng cách triển khai plip sử dụng `ifr_data` không đúng và không nên được dùng làm ví dụ cho cách triển khai ioctl.

## Thông tin thống kê

Method cuối cùng mà driver cần là get\_stats. Method này trả về một pointer trỏ đến số liệu thống kê của device. Cách triển khai khá đơn giản; bản được trình bày hoạt động ngay cả khi cùng một driver quản lý nhiều interface, vì số liệu thống kê được lưu trong device data structure.

```c
struct net_device_stats *snull_stats(struct net_device *dev)
{
    struct snull_priv *priv = netdev_priv(dev);
    return &priv->stats;
}
```

Công việc thực sự cần thiết để trả về số liệu thống kê có ý nghĩa nằm rải rác khắp driver, tại các vị trí cập nhật những field khác nhau. Danh sách sau trình bày các field đáng chú ý nhất trong `struct net_device_stats`:

`unsigned long rx_packets`;

`unsigned long tx_packets`;

Tổng số incoming và outgoing packet interface chuyển thành công.

`unsigned long rx_bytes`;

`unsigned long tx_bytes`;

Số byte interface nhận và truyền.

`unsigned long rx_errors`;

`unsigned long tx_errors`;

Số lần nhận và truyền bị lỗi. Có vô số vấn đề có thể xảy ra khi truyền packet, và structure `net_device_stats` bao gồm sáu counter cho các receive error cụ thể cùng năm counter cho transmit error. Xem \<linux/netdevice.h\> để biết danh sách đầy đủ. Nếu có thể, driver cần duy trì số liệu thống kê lỗi chi tiết vì chúng rất hữu ích cho system administrator khi truy tìm vấn đề.

`unsigned long rx_dropped`;

`unsigned long tx_dropped`;

Số packet drop khi nhận và truyền. Drop khi không có memory cho packet data. `tx_dropped` hiếm dùng.

`unsigned long collisions`;

Số collision do congestion trên medium.

`unsigned long multicast`;

Số multicast packet nhận.

Cần nhắc lại rằng method get\_stats có thể được gọi bất cứ lúc nào, ngay cả khi interface ở trạng thái down, vì vậy driver phải giữ lại thông tin thống kê trong suốt thời gian structure `net_device` tồn tại.

## Multicast

Multicast packet là một network packet dành cho nhiều host nhận, nhưng không phải tất cả host. Chức năng này được thực hiện bằng cách gán các hardware address đặc biệt cho những nhóm host. Packet gửi đến một trong các địa chỉ đặc biệt cần được tất cả host trong nhóm đó nhận. Với Ethernet, multicast address có bit thấp nhất của octet địa chỉ đầu tiên được thiết lập trong destination address, trong khi mỗi device board có bit đó bằng 0 trong hardware address riêng.

Phần khó xử lý host group và hardware address do ứng dụng và kernel thực hiện, interface driver không cần xử lý.

Việc truyền multicast packet khá đơn giản vì chúng trông giống mọi packet khác. Interface truyền chúng trên communication medium mà không xem destination address. Kernel mới là thành phần phải gán hardware destination address đúng; device method hard\_header, nếu được định nghĩa, không cần xem dữ liệu mà nó bố trí.

Kernel chịu trách nhiệm theo dõi các multicast address đang được quan tâm tại một thời điểm. Danh sách có thể thay đổi thường xuyên vì nó phụ thuộc vào các ứng dụng đang chạy và nhu cầu của người dùng tại thời điểm đó. Driver có nhiệm vụ nhận danh sách multicast address cần quan tâm và chuyển cho kernel mọi packet gửi đến những địa chỉ đó. Cách driver triển khai multicast list phần nào phụ thuộc vào cách hoạt động của hardware bên dưới. Xét về multicast, hardware thường thuộc một trong ba nhóm:

- Các interface không thể xử lý multicast. Chúng hoặc chỉ nhận packet gửi riêng đến hardware address của mình cùng các broadcast packet, hoặc nhận mọi packet. Chúng chỉ có thể nhận multicast packet bằng cách nhận tất cả packet, do đó có thể khiến hệ điều hành quá tải với số lượng lớn packet “không liên quan”. Thông thường, những interface này không được coi là có khả năng multicast, và driver không thiết lập `IFF_MULTICAST` trong `dev->flags`.

Interface Point-to-point là trường hợp riêng vì luôn nhận mọi packet, không hardware filtering.

- Các interface có thể phân biệt multicast packet với các packet khác (host-to-host hoặc broadcast). Có thể yêu cầu các interface này nhận mọi multicast packet rồi để software xác định địa chỉ có liên quan đến host này hay không. Overhead trong trường hợp này chấp nhận được vì số multicast packet trên một mạng thông thường khá ít.

- Các interface có thể phát hiện multicast address bằng hardware. Có thể truyền cho các interface này một danh sách multicast address cần nhận packet và yêu cầu bỏ qua các multicast packet khác. Đây là trường hợp tối ưu cho kernel vì không lãng phí thời gian processor để loại bỏ các packet “không liên quan” mà interface nhận được.

Kernel cố tận dụng tốt nhất khả năng của các interface high-level bằng cách hỗ trợ tối đa device class thứ ba, là class linh hoạt nhất. Vì vậy, kernel thông báo cho driver mỗi khi danh sách multicast address hợp lệ thay đổi và chuyển danh sách mới cho driver để nó cập nhật hardware filter theo thông tin mới.

### Kernel hỗ trợ Multicasting

Hỗ trợ multicast packet gồm nhiều thành phần: device method, data structure và device flag:

`void (*dev->set_multicast_list)(struct net_device *dev)`;

Device method được gọi mỗi khi danh sách machine address gắn với device thay đổi. Nó cũng được gọi khi `dev->flags` bị sửa đổi, vì một số flag (chẳng hạn `IFF_PROMISC`) cũng có thể yêu cầu lập trình lại hardware filter. Method nhận một pointer trỏ đến `struct net_device` làm đối số và trả về `void`. Driver không muốn triển khai method này có thể giữ field ở giá trị `NULL`.

`struct dev_mc_list *dev->mc_list`;

Linked list mọi multicast address gắn device. Định nghĩa structure thực tế giới thiệu cuối phần.

`int dev->mc_count`;

Số item trong linked list. Thông tin phần nào dư nhưng so `mc_count` với `0` là shortcut hữu ích kiểm tra list.

`IFF_MULTICAST`

Trừ khi driver đặt flag trong `dev->flags`, interface không được yêu cầu xử lý multicast packet. Tuy nhiên kernel gọi method set\_multicast\_list của driver khi `dev->flags` đổi vì multicast list có thể đã đổi khi interface không active.

`IFF_ALLMULTI`

Networking software thiết lập flag này trong `dev->flags` để yêu cầu driver lấy tất cả multicast packet từ mạng. Điều này xảy ra khi multicast routing được bật. Nếu flag được thiết lập, không nên dùng `dev->mc_list` để lọc multicast packet.

`IFF_PROMISC`

Flag đặt trong `dev->flags` khi interface vào promiscuous mode. Interface phải nhận mọi packet độc lập `dev->mc_list`.

Thông tin cuối driver developer cần là định nghĩa `struct dev_mc_list` trong \<linux/netdevice.h\>:

```c
struct dev_mc_list {
    struct dev_mc_list   *next;          /* Next address in list */
    __u8                 dmi_addr[MAX_ADDR_LEN]; /* Hardware address */
    unsigned char        dmi_addrlen;    /* Address length */
    int                  dmi_users;      /* Number of users */
    int                  dmi_gusers;     /* Number of groups */
};
```

Vì multicasting và hardware address độc lập với việc truyền packet thực tế, structure này có thể được sử dụng trên các cách triển khai mạng khác nhau; mỗi địa chỉ được nhận diện bằng một chuỗi octet và một độ dài, giống như `dev->dev_addr`.

### Triển khai điển hình

Cách tốt nhất mô tả thiết kế set\_multicast\_list là pseudocode.

Function sau là cách triển khai điển hình trong một driver full-featured (`ff`). Driver có đầy đủ tính năng theo nghĩa interface mà nó điều khiển có một hardware packet filter phức tạp, có thể lưu một table các multicast address mà host này cần nhận packet. Kích thước tối đa của table là `FF_TABLE_SIZE`.

Mọi function prefix `ff_` là placeholder cho operation hardware-specific:

```c
void ff_set_multicast_list(struct net_device *dev)
{
    struct dev_mc_list *mcptr;

    if (dev->flags & IFF_PROMISC) {
        ff_get_all_packets( );
        return;
    }
    /* If there's more addresses than we handle, get all multicast
    packets and sort them out in software. */
    if (dev->flags & IFF_ALLMULTI || dev->mc_count > FF_TABLE_SIZE) {
        ff_get_all_multicast_packets( );
        return;
    }
    /* No multicast?  Just get our own stuff */
    if (dev->mc_count = = 0) {
        ff_get_only_own_packets( );
        return;
    }
    /* Store all of the multicast addresses in the hardware filter */
    ff_clear_mc_list( );
    for (mc_ptr = dev->mc_list; mc_ptr; mc_ptr = mc_ptr->next)
        ff_store_mc_address(mc_ptr->dmi_addr);
    ff_get_packets_in_multicast_list( );
}
```

Cách triển khai này có thể được đơn giản hóa nếu interface không thể lưu một multicast table trong hardware filter dành cho incoming packet. Trong trường hợp đó, `FF_TABLE_SIZE` giảm về `0` và không cần bốn dòng code cuối.

Như đã đề cập trước đó, ngay cả interface không thể xử lý multicast packet cũng cần triển khai method set\_multicast\_list để nhận thông báo về những thay đổi trong `dev->flags`. Cách này có thể được gọi là cách triển khai “nonfeatured” (`nf`). Việc triển khai rất đơn giản, như đoạn code sau minh họa:

```c
void nf_set_multicast_list(struct net_device *dev)
{
    if (dev->flags & IFF_PROMISC)
        nf_get_all_packets( );
    else
        nf_get_only_own_packets( );
}
```

Triển khai `IFF_PROMISC` quan trọng vì nếu không user không chạy tcpdump hay network analyzer khác được. Ngược lại nếu interface chạy link point-to-point, hoàn toàn không cần set\_multicast\_list vì user luôn nhận mọi packet.

## Một số chi tiết khác

Mục này trình bày một vài chủ đề khác có thể hữu ích cho người viết network driver. Trong mỗi trường hợp, chúng ta chỉ cố gắng chỉ ra hướng tìm hiểu phù hợp. Để có cái nhìn đầy đủ về chủ đề, có lẽ bạn cũng cần dành thời gian nghiên cứu kernel source code.

### Hỗ trợ Media Independent Interface

Media Independent Interface (MII) là một chuẩn IEEE 802.3 mô tả cách Ethernet transceiver giao tiếp với network controller; nhiều sản phẩm trên thị trường tuân theo interface này. Nếu viết driver cho một controller MII-compliant, bạn có thể sử dụng generic MII support layer do kernel export để giảm công sức.

Để dùng generic MII layer, include \<linux/mii.h\>. Cần điền structure `mii_if_info` bằng thông tin physical ID transceiver, full duplex có hiệu lực không, v.v. Cũng cần hai method cho structure `mii_if_info`:

```c
int (*mdio_read) (struct net_device *dev, int phy_id, int location);
void (*mdio_write) (struct net_device *dev, int phy_id, int location, int val);
```

Như dự đoán, method phải triển khai giao tiếp với MII interface cụ thể.

Generic MII code cung cấp function truy vấn và đổi operating mode của transceiver; nhiều function thiết kế làm việc với tiện ích ethtool (phần tiếp theo). Xem \<linux/mii.h\> và drivers/net/mii.c để biết chi tiết.

### Hỗ trợ Ethtool

Ethtool là tiện ích cho system administrator nhiều quyền kiểm soát hoạt động network interface. Có thể điều khiển interface parameter như speed, media type, duplex operation, DMA ring setup, hardware checksumming, wake-on-LAN operation, v.v., nhưng chỉ nếu driver hỗ trợ ethtool. Tải ethtool từ http://sf.net/projects/gkernel/.

Các khai báo liên quan đến hỗ trợ ethtool nằm trong \<linux/ethtool.h\>. Phần cốt lõi là một structure có type `ethtool_ops`, chứa đầy đủ 24 method khác nhau để hỗ trợ ethtool. Phần lớn method tương đối đơn giản; xem \<linux/ethtool.h\> để biết chi tiết. Nếu driver đang sử dụng MII layer, bạn có thể dùng mii\_ethtool\_gset và mii\_ethtool\_sset để triển khai tương ứng các method get\_settings và set\_settings.

Để ethtool hoạt động với device, phải đặt pointer tới structure `ethtool_ops` trong structure `net_device`. Nên dùng macro `SET_ETHTOOL_OPS` (định nghĩa trong \<linux/netdevice.h\>). Lưu ý ethtool method có thể gọi cả khi interface down.

### Netpoll

“Netpoll” thêm tương đối muộn (2.6.5) vào network stack; mục đích cho kernel gửi/nhận packet khi có thể không dùng được đầy đủ network và I/O subsystem. Dùng cho feature như remote network console và remote kernel debugging. Hỗ trợ netpoll không bắt buộc nhưng có thể làm device hữu ích hơn trong tình huống nhất định. Phần lớn trường hợp cũng tương đối dễ hỗ trợ.

Driver triển khai netpoll phải triển khai method poll\_controller. Nhiệm vụ theo kịp mọi việc xảy ra trên controller khi không có device interrupt. Gần như mọi method poll\_controller có dạng:

```c
void my_poll_controller(struct net_device *dev)
{
    disable_device_interrupts(dev);
    call_interrupt_handler(dev->irq, dev, NULL);
    reenable_device_interrupts(dev);
}
```

Về bản chất method poll\_controller chỉ mô phỏng interrupt từ device cho trước.

## Tham khảo nhanh

Mục này cung cấp tài liệu tham khảo cho các khái niệm được giới thiệu trong chương. Nó cũng giải thích vai trò của từng header file mà driver cần include. Tuy nhiên, danh sách field trong các structure `net_device` và `sk_buff` không được lặp lại ở đây.

`#include <linux/netdevice.h>`

Header chứa định nghĩa `struct net_device`, `struct net_device_stats`, include vài header khác network driver cần.

`struct net_device *alloc_netdev(int sizeof_priv, char *name, void`

`(*setup)(struct net_device *)`;

`struct net_device *alloc_etherdev(int sizeof_priv)`;

`void free_netdev(struct net_device *dev)`;

Function cấp phát và giải phóng structure `net_device`.

`int register_netdev(struct net_device *dev)`;

`void unregister_netdev(struct net_device *dev)`;

Đăng ký và hủy đăng ký network device.

`void *netdev_priv(struct net_device *dev)`;

Function lấy pointer tới vùng driver-private của network device structure.

`struct net_device_stats`;

Structure giữ device statistic.

`netif_start_queue(struct net_device *dev)`;

`netif_stop_queue(struct net_device *dev)`;

`netif_wake_queue(struct net_device *dev)`;

Các function điều khiển việc chuyển packet đến driver để truyền. Không có packet nào được truyền cho đến khi netif\_start\_queue được gọi. netif\_stop\_queue tạm dừng việc truyền, còn netif\_wake\_queue khởi động lại queue và yêu cầu network layer bắt đầu truyền packet trở lại.

`skb_shinfo(struct sk_buff *skb)`;

Macro truy cập phần “shared info” của packet buffer.

`void netif_rx(struct sk_buff *skb)`;

Function có thể gọi (cả tại interrupt time) báo kernel đã nhận packet, encapsulate trong socket buffer.

`void netif_rx_schedule(dev)`;

Function báo kernel có packet và nên bắt đầu polling interface; chỉ driver NAPI-compliant dùng.

`int netif_receive_skb(struct sk_buff *skb)`;

`void netif_rx_complete(struct net_device *dev)`;

Function chỉ driver NAPI-compliant nên dùng. netif\_receive\_skb tương đương netif\_rx trong NAPI; đưa packet vào kernel. Khi driver NAPI-compliant nhận hết packet sẵn có, phải bật lại interrupt, gọi netif\_rx\_complete dừng polling.

`#include <linux/if.h>`

Được netdevice.h include, file khai báo interface flag (macro `IFF_`) và `struct ifmap`, có vai trò lớn trong ioctl implementation cho network driver.

`void netif_carrier_off(struct net_device *dev)`;

`void netif_carrier_on(struct net_device *dev)`;

`int netif_carrier_ok(struct net_device *dev)`;

Hai function đầu có thể được sử dụng để thông báo cho kernel xem hiện có carrier signal trên interface được chỉ định hay không. netif\_carrier\_ok kiểm tra carrier state được phản ánh trong device structure.

`#include <linux/if_ether.h>`

`ETH_ALEN`

`ETH_P_IP`

`struct ethhdr`;

Được netdevice.h include, if\_ether.h định nghĩa mọi macro `ETH_` biểu diễn octet length (như address length) và network protocol (như IP). Cũng định nghĩa structure `ethhdr`.

`#include <linux/skbuff.h>`

Định nghĩa `struct sk_buff`, structure liên quan và một số inline function thao tác buffer. Header được netdevice.h include.

`struct sk_buff *alloc_skb(unsigned int len, int priority)`;

`struct sk_buff *dev_alloc_skb(unsigned int len)`;

`void kfree_skb(struct sk_buff *skb)`;

`void dev_kfree_skb(struct sk_buff *skb)`;

`void dev_kfree_skb_irq(struct sk_buff *skb)`;

`void dev_kfree_skb_any(struct sk_buff *skb)`;

Function xử lý cấp phát/giải phóng socket buffer. Driver thường nên dùng variant `dev_` dành cho mục đích này.

`unsigned char *skb_put(struct sk_buff *skb, int len)`;

`unsigned char *__skb_put(struct sk_buff *skb, int len)`;

`unsigned char *skb_push(struct sk_buff *skb, int len)`;

`unsigned char *__skb_push(struct sk_buff *skb, int len)`;

Các function thêm dữ liệu vào một `skb`; skb\_put đặt dữ liệu ở cuối `skb`, còn skb\_push đặt dữ liệu ở đầu. Các phiên bản thông thường thực hiện kiểm tra để bảo đảm có đủ vùng trống; các phiên bản double-underscore bỏ qua những bước kiểm tra đó.

`int skb_headroom(struct sk_buff *skb)`;

`int skb_tailroom(struct sk_buff *skb)`;

`void skb_reserve(struct sk_buff *skb, int len)`;

Các function quản lý vùng trống trong một `skb`. skb\_headroom và skb\_tailroom lần lượt cho biết lượng vùng trống ở đầu và cuối một `skb`. skb\_reserve có thể được dùng để dành trước vùng trống ở đầu một `skb`; skb này phải đang rỗng.

`unsigned char *skb_pull(struct sk_buff *skb, int len)`;

skb\_pull “xóa” dữ liệu khỏi `skb` bằng điều chỉnh internal pointer.

`int skb_is_nonlinear(struct sk_buff *skb)`;

Function trả true nếu skb chia thành nhiều fragment cho scatter/gather I/O.

`int skb_headlen(struct sk_buff *skb)`;

Trả độ dài segment đầu của skb—phần `skb->data` trỏ tới.

`void *kmap_skb_frag(skb_frag_t *frag)`;

`void kunmap_skb_frag(void *vaddr)`;

Function cung cấp truy cập trực tiếp fragment trong nonlinear skb.

`#include <linux/etherdevice.h>`

`void ether_setup(struct net_device *dev)`;

Function đặt phần lớn device method thành triển khai general-purpose cho Ethernet driver. Cũng đặt `dev->flags`, gán tên `eth`x khả dụng tiếp theo cho `dev->name` nếu ký tự đầu tên là dấu cách hoặc ký tự `NULL`.

`unsigned short eth_type_trans(struct sk_buff *skb, struct net_device *dev)`;

Khi Ethernet interface nhận packet, có thể gọi function để đặt `skb->pkt_type`. Return value là protocol number thường lưu trong `skb->protocol`.

`#include <linux/sockios.h>`

`SIOCDEVPRIVATE`

Command đầu của 16 ioctl command mỗi driver triển khai để dùng riêng. Mọi network ioctl command định nghĩa trong sockios.h.

`#include <linux/mii.h>`

`struct mii_if_info`;

Khai báo và structure hỗ trợ driver của device triển khai MII standard.

`#include <linux/ethtool.h>`

`struct ethtool_ops`;

Khai báo và structure cho device làm việc với tiện ích ethtool.

[^1]: NAPI viết tắt “new API”; networking hacker giỏi tạo interface hơn đặt tên.

[^2]: Lưu ý theo \<linux/sockios.h\>, command `SIOCDEVPRIVATE` deprecated. Tuy nhiên chưa rõ thay bằng gì, nhiều driver in-tree vẫn dùng.
