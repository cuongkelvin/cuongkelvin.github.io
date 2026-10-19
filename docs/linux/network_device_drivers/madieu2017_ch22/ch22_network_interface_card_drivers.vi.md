# Chương 22. Network Interface Card Driver

Ta đều biết networking vốn gắn liền với Linux kernel. Vài năm trước Linux chỉ được dùng vì network performance, nhưng giờ đã khác; Linux vượt xa một server và chạy trên hàng tỷ embedded device. Qua năm tháng, Linux có danh tiếng là network operating system tốt nhất. Dù vậy Linux không thể làm mọi thứ. Với vô số Ethernet controller hiện có, Linux không có cách nào khác ngoài expose API cho developer cần viết driver cho network device hoặc phát triển kernel networking nói chung. API cung cấp abstraction layer đủ dùng, bảo đảm tính tổng quát của code phát triển và khả năng port sang architecture khác. Chương này sẽ walk-through phần API phát triển Network Interface Card (NIC) driver và trình bày data structure, method của nó.

Trong chương này, ta trình bày:

- NIC driver data structure và tìm hiểu socket buffer structure chính

- NIC driver architecture, mô tả method, cùng packet transmission và reception

- Phát triển dummy NIC driver để kiểm thử

## Driver Data Structure

Khi làm việc với NIC device, cần thao tác hai data structure:

- Structure `struct sk_buff`, định nghĩa trong `include/linux/skbuff.h`, là data structure nền tảng trong Linux networking code; cần include vào code:

```
#include <linux/skbuff.h>
```

Mỗi packet gửi hoặc nhận đều được xử lý bằng data structure này.

- Structure `struct net_device`; mọi NIC device được biểu diễn trong kernel bằng structure này. Đây là interface nơi dữ liệu đi qua. Định nghĩa trong `include/linux/netdevice.h`, cũng cần include vào code:

```
#include <linux/netdevice.h>
```

File khác cần include là `include/linux/etherdevice.h` cho function liên quan MAC và Ethernet-related (như `alloc_etherdev()`) và `include/linux/ethtool.h` để hỗ trợ `ethtool`:

```
#include <linux/ethtool.h>
#include <linux/etherdevice.h>
```

### Socket Buffer Structure

Structure này bọc mọi packet đi qua NIC:

```
struct sk_buff {
  struct sk_buff * next;
  struct sk_buff * prev;
  ktime_t tstamp;
  struct rb_node     rbnode; /* used in netem & tcp stack */
  struct sock * sk;
  struct net_device * dev;
  unsigned int       len;
  unsigned int       data_len;
  __u16              mac_len;
  __u16              hdr_len;
  unsigned int len;
  unsigned int data_len;
  __u16 mac_len;
  __u16 hdr_len;
  __u32 priority;
  dma_cookie_t dma_cookie;
  sk_buff_data_t tail;
  sk_buff_data_t end;
  unsigned char * head;
  unsigned char * data;
  unsigned int truesize;
  atomic_t users;
};
```

Sau đây giải thích các phần tử:

- `next` và `prev` : Biểu diễn buffer tiếp theo và trước đó trong list.

- `sk`: Socket gắn với packet này.

- `tstamp`: Thời điểm packet đến/đi.

- `rbnode`: Thay thế cho `next`/`prev`, biểu diễn trong red-black tree.

- `dev`: Biểu diễn device packet đến/đi qua. Field gắn với hai field khác không liệt kê ở đây, `input_dev` và `real_dev`. Chúng theo dõi device gắn packet. Vì vậy `input_dev` luôn chỉ device mà từ đó nhận packet.

- `len`: Tổng số byte trong packet. Socket buffer (SKB) gồm linear data buffer và tùy chọn tập một hoặc nhiều region gọi là room. Nếu có room như vậy, `data_len` giữ tổng số byte của data area.

- `mac_len`: Giữ độ dài MAC header.

- `csum`: Chứa checksum của packet.

- `priority`: Biểu diễn packet priority trong QoS.

- `truesize`: Theo dõi số byte system memory packet tiêu thụ, gồm memory của chính structure `struct sk_buff`.

- `users`: Dùng reference counting cho SKB object.

- `Head`: `Head`, `data` và `tail` là pointer tới các region (room) khác nhau trong socket buffer.

- `end`: Trỏ tới cuối socket buffer.

Chỉ vài phần tử của structure được trình bày ở đây. Mô tả đầy đủ trong `include/linux/skbuff.h`., header file cần include để làm việc với socket buffer.

#### Cấp phát Socket Buffer

Cấp phát socket buffer hơi phức tạp vì cần ít nhất ba function khác nhau:

- Trước hết, toàn bộ cấp phát memory phải dùng function `netdev_alloc_skb()`

- Tăng và align header room bằng function `skb_reserve()`

- Mở rộng used data area của buffer (sẽ chứa packet) bằng function `skb_put()`.

Hãy xem sơ đồ sau:

![Figure](images/ch22/fig22-01.png)

Quy trình cấp phát Socket Buffer

1\. Cấp phát buffer đủ lớn chứa packet cùng Ethernet header bằng function `netdev_alloc_skb()`:

```
struct sk_buff *netdev_alloc_skb(struct net_device *dev,
                                   unsigned int length)
```

Function trả `NULL` khi thất bại. Do đó dù cấp phát memory, `netdev_alloc_skb()` có thể gọi từ atomic context. Vì Ethernet header dài 14 byte, cần alignment để CPU không gặp vấn đề hiệu năng khi truy cập phần buffer đó. Tên phù hợp cho tham số `header_len` nên là `header_alignment`, vì dùng cho alignment. Giá trị thường là 2; vì vậy kernel định nghĩa macro riêng `NET_IP_ALIGN` trong `include/linux/skbuff.h`:

```
#define NET_IP_ALIGN 2
```

2\. Bước hai reserve aligned memory cho header bằng giảm tail room. Function thực hiện là `skb_reserve()`:

```
void skb_reserve(struct sk_buff *skb, int len)
```

3\. Bước cuối mở rộng used data area của buffer cho bằng packet size, bằng function `skb_put()`. Function trả pointer tới byte đầu data area:

```
unsigned char *skb_put(struct sk_buff *skb, unsigned int len)
```

Socket buffer cấp phát phải chuyển tới layer kernel-networking. Đây là bước cuối life cycle của socket buffer. Cần dùng function `netif_rx_ni()`:

```
int netif_rx_ni(struct sk_buff *skb)
```

Ta trình bày cách dùng các bước trên trong phần packet reception của chương.

### Network Interface Structure

Network interface biểu diễn trong kernel bằng instance của structure `struct net_device`, định nghĩa trong `include/linux/netdevice.h`:

```
struct net_device {
   char name[IFNAMSIZ];
   char *ifalias;
   unsigned long mem_end;
   unsigned long mem_start;
   unsigned long base_addr;
   int irq;
   netdev_features_t features;
   netdev_features_t hw_features;
   netdev_features_t  wanted_features;
   int ifindex;
   struct net_device_stats stats;
   atomic_long_t rx_dropped;
   atomic_long_t  tx_dropped;
   const struct net_device_ops *netdev_ops;
   const struct ethtool_ops *ethtool_ops;
   unsigned int flags;
   unsigned int priv_flags;
   unsigned char link_mode;
      unsigned char if_port;
   unsigned char dma;
   unsigned int mtu;
   unsigned short type;
   /* Interface address info. */
   unsigned char perm_addr[MAX_ADDR_LEN];
   unsigned char addr_assign_type;
   unsigned char addr_len;
   unsigned short neigh_priv_len;
   unsigned short dev_id;
   unsigned short dev_port;
   unsigned long last_rx;
   /* Interface address info used in eth_type_trans() */
   unsigned char *dev_addr;

   struct device dev;
   struct phy_device *phydev;
};
```

Structure `struct net_device` thuộc các kernel data structure phải cấp phát động, có allocation function riêng. NIC cấp phát trong kernel bằng function `alloc_etherdev()`:

```
struct net_device *alloc_etherdev(int sizeof_priv);
```

Function trả `NULL` khi thất bại. Tham số `sizeof_priv` biểu diễn memory size cần cấp phát cho private data structure gắn NIC này, lấy được bằng function `netdev_priv()`:

```
void *netdev_priv(const struct net_device *dev)
```

Với structure `struct priv_struct` là private structure của ta, sau đây là cách cấp phát network device cùng private data structure:

```
struct net_device *net_dev;
struct priv_struct *priv_net_struct;
net_dev = alloc_etherdev(sizeof(struct priv_struct));
my_priv_struct = netdev_priv(dev);
```

Network device không dùng phải giải phóng bằng function `free_netdev()`, cũng giải phóng memory cho private data. Chỉ gọi sau khi device đã hủy đăng ký khỏi kernel:

```
void free_netdev(struct net_device *dev)
```

Sau khi hoàn tất và điền structure `net_device`, phải gọi `register_netdev()` trên nó. Function giải thích phía sau trong phần Driver method. Hiện chỉ cần nhớ function đăng ký network device với kernel để dùng được. Vì vậy phải bảo đảm device thực sự xử lý được network operation trước khi gọi:

```
int register_netdev(struct net_device *dev)
```

## Device Method

Network device thuộc loại không xuất hiện trong directory `/dev` (khác block, input hoặc char device). Vì vậy như mọi device loại đó, NIC driver expose tập chức năng để hoạt động. Kernel expose operation thực hiện trên network interface qua structure `struct net_device_ops`, là field của structure `struct net_device` biểu diễn network device (`dev->netdev_ops`). Field `struct net_device_ops` mô tả như sau:

```
struct net_device_ops {
   int (*ndo_init)(struct net_device *dev);
   void (*ndo_uninit)(struct net_device *dev);
   int (*ndo_open)(struct net_device *dev);
   int (*ndo_stop)(struct net_device *dev);
   netdev_tx_t (*ndo_start_xmit) (struct sk_buff *skb,
                              struct net_device *dev);
   void (*ndo_change_rx_flags)(struct net_device *dev, int flags);
   void (*ndo_set_rx_mode)(struct net_device *dev);
   int (*ndo_set_mac_address)(struct net_device *dev, void *addr);
   int (*ndo_validate_addr)(struct net_device *dev);
   int (*ndo_do_ioctl)(struct net_device *dev,
                             struct ifreq *ifr, int cmd);
   int (*ndo_set_config)(struct net_device *dev, struct ifmap *map);
   int (*ndo_change_mtu)(struct net_device *dev, int new_mtu);
   void (*ndo_tx_timeout) (struct net_device *dev);

   struct net_device_stats* (*ndo_get_stats)(
   struct net_device *dev);
};
```

Hãy xem ý nghĩa mỗi phần tử:

- `int (*ndo_init)(struct net_device *dev)` và `void(*ndo_uninit)(struct net_device *dev)`: Lần lượt là function khởi tạo/hủy khởi tạo bổ sung, thực hiện khi driver gọi `register_netdev()`/`unregister_netdev()` để đăng ký/hủy đăng ký network device với kernel. Phần lớn driver không cung cấp vì công việc thực do function `ndo_open()` và `ndo_stop()` làm.

- `int (*ndo_open)(struct net_device *dev)`: Chuẩn bị và mở interface. Interface mở mỗi khi tiện ích `ip` hoặc `ifconfig` kích hoạt. Trong method này driver phải request/map/register system resource cần (I/O port, IRQ, DMA, v.v.), bật hardware và setup khác device yêu cầu.

- `int (*ndo_stop)(struct net_device *dev)`:Kernel thực hiện khi interface đưa xuống (ví dụ `ifconfig <name>` `down`, v.v.). Function phải đảo operation đã làm trong `ndo_open()`.

- `int (*ndo_start_xmit) (struct sk_buff *skb, struct net_device` `*dev)`: Method gọi mỗi khi kernel muốn gửi packet qua interface này.

- `void (*ndo_set_rx_mode)(struct net_device *dev)`: Method gọi để đổi interface address list filter mode, multicast hoặc promiscuous. Khuyến nghị cung cấp function.

- `void (*ndo_tx_timeout)(struct net_device *dev)`: Kernel gọi khi packet transmission không hoàn tất trong khoảng hợp lý, thường `dev->watchdog` tick. Driver phải kiểm tra chuyện gì xảy ra, xử lý và tiếp tục truyền.

- `struct net_device_stats *(*get_stats)(struct net_device *dev)`: Method trả device statistic. Đây là thông tin thấy khi chạy `netstat -i` hoặc `ifconfig`.

Mô tả trên bỏ qua nhiều phần tử. Mô tả structure đầy đủ trong file `include/linux/netdevice.h`. Thực ra chỉ `ndo_start_xmit` bắt buộc, nhưng nên cung cấp nhiều helper hook tương ứng feature của device.

### Mở và đóng

Kernel gọi function `ndo_open()` mỗi khi network interface được user có quyền (ví dụ admin) cấu hình bằng userspace utility như `ifconfig` hoặc `ip`.

Như network device operation khác, function `ndo_open()` nhận object `struct` `net_device` làm tham số; từ đó driver phải lấy object device-specific lưu trong field `priv` khi cấp phát object `net_device`.

Network controller thường raise interrupt khi nhận packet hoặc hoàn tất packet transmission. Driver cần đăng ký interrupt handler, được gọi mỗi khi controller raise interrupt. Có thể đăng ký trong routine `init()`/`probe()` hoặc function `open`. Một số device cần bật interrupt bằng thiết lập special register trong hardware. Khi đó request interrupt trong function `probe` và chỉ đặt/xóa enable bit trong method `open`/`close`.

Tổng hợp việc function `open` cần làm:

1\. Cập nhật interface MAC address (nếu user đổi và device cho phép).

2\. Reset hardware nếu cần và đưa ra khỏi mode low-power.

3\. Request resource cần (I/O memory, DMA channel, IRQ).

4\. Map IRQ và đăng ký interrupt handler.

5\. Kiểm tra interface link status.

6\. Gọi `netif_start_queue()` trên device để kernel biết device sẵn sàng truyền packet.

Ví dụ function `open` như sau:

```
/*
 * This routine should set everything up new at each open, even
 * registers that should only need to be set once at boot, so that
 * there is non-reboot way to recover if something goes wrong.
 */
static int enc28j60_net_open(struct net_device *dev)
{
   struct priv_net_struct *priv = netdev_priv(dev);

   if (!is_valid_ether_addr(dev->dev_addr)) {
         [...] /* Maybe print a debug message ? */
         return -EADDRNOTAVAIL;
   }
   /*
 * Reset the hardware here and take it out of low
 * power mode
 */
   my_netdev_lowpower(priv, false);

   if (!my_netdev_hw_init(priv)) {
         [...] /* handle hardware reset failure */
         return -EINVAL;
   }

   /* Update the MAC address (in case user has changed it)
    * The new address is stored in netdev->dev_addr field
 */
set_hw_macaddr_registers(netdev, MAC_REGADDR_START,
netdev->addr_len, netdev->dev_addr);

   /* Enable interrupts */
   my_netdev_hw_enable(priv);

   /* We are now ready to accept transmit requests from
    * the queueing layer of the networking.
    */
   netif_start_queue(dev);

   return 0;
}
```

`netif_start_queue()` chỉ cho upper layer gọi routine `ndo_start_xmit` của device. Nói cách khác, báo kernel device sẵn sàng xử lý transmit request.

Ngược lại closing method chỉ cần đảo operation thực hiện khi mở device:

```
/* The inverse routine to net_open(). */
static int enc28j60_net_close(struct net_device *dev)
{
   struct priv_net_struct *priv = netdev_priv(dev);
   my_netdev_hw_disable(priv);
   my_netdev_lowpower(priv, true);

    /**
     *   netif_stop_queue - stop transmitted packets
     *
     *   Stop upper layers calling the device ndo_start_xmit routine.
     *   Used for flow control when transmit resources are unavailable.
     */
   netif_stop_queue(dev);

   return 0;
}
```

`netif_stop_queue()` đảo việc `netif_start_queue()` làm, bảo kernel ngừng gọi routine `ndo_start_xmit` của device. Ta không còn xử lý transmit request được.

### Xử lý Packet

Xử lý packet gồm truyền và nhận packet. Đây là tác vụ chính của network interface driver. Transmission chỉ việc gửi outgoing frame, reception chỉ frame đi vào.

Có hai cách điều khiển trao đổi networking data: polling hoặc interrupt. Polling, một dạng interrupt timer-driven, là kernel liên tục kiểm tra theo interval cho trước xem device có thay đổi không. Ngược lại interrupt mode để kernel không làm gì, lắng nghe IRQ line và chờ device báo thay đổi qua IRQ. Trao đổi dữ liệu Interrupt-driven có thể tăng system overhead khi traffic cao; vì vậy một số driver kết hợp hai method. Phần kernel cho phép kết hợp gọi New API (NAPI), dùng polling khi traffic cao, interrupt management IRQ-driven khi traffic trở lại bình thường. Driver mới nên dùng NAPI nếu hardware hỗ trợ. Tuy nhiên chương không trình bày NAPI mà tập trung method interrupt-driven.

#### Packet Reception

Khi packet đến network interface card, driver phải dựng socket buffer mới quanh nó và copy vào field `sk_buff->data`. Kiểu copy không thực sự quan trọng, cũng dùng DMA được. Driver thường biết dữ liệu mới đến qua interrupt. Khi NIC nhận packet, raise interrupt để driver xử lý; driver phải kiểm tra interrupt status register của device, tìm lý do thực (RX ok, RX error, v.v.). Bit tương ứng event raise interrupt được đặt trong status register.

Phần khó là cấp phát và dựng socket buffer. May thay đã trình bày ở phần đầu chương. Vậy hãy đi ngay vào RX handler mẫu. Driver phải cấp phát `sk_buff` đúng số packet nhận:

```
/*
 * RX handler
 * This function is called in the work responsible of packet
 * reception (bottom half) handler. We use work because access to
 * our device (which sit on a SPI bus) may sleep
 */
static int my_rx_interrupt(struct net_device *ndev)
{
   struct priv_net_struct *priv = netdev_priv(ndev);
   int pk_counter, ret;

   /* Let's get the number of packet our device received */
   pk_counter = my_device_reg_read(priv, REG_PKT_CNT);
   if (pk_counter > priv->max_pk_counter) {
         /* update statistics */
         priv->max_pk_counter = pk_counter;
   }
   ret = pk_counter;

   /* set receive buffer start */
   priv->next_pk_ptr = KNOWN_START_REGISTER;
   while (pk_counter-- > 0)
         /*
* By calling this internal helper function in a "while"
* loop, packets get extracted one by one from the device
* and forwarder to the network layer.
*/
         my_hw_rx(ndev);

   return ret;
}
```

Helper sau chịu trách nhiệm lấy một packet từ device, chuyển vào kernel network và giảm packet counter:

```
/*
 * Hardware receive function.
 * Read the buffer memory, update the FIFO pointer to
 * free the buffer.
 * This function decrements the packet counter.
 */
static void my_hw_rx(struct net_device *ndev)
{
   struct priv_net_struct *priv = netdev_priv(ndev);
   struct sk_buff *skb = NULL;
   u16 erxrdpt, next_packet, rxstat;
   u8 rsv[RSV_SIZE];
   int packet_len;

   packet_len = my_device_read_current_packet_size();
   /* Can't cross boundaries */
   if ((priv->next_pk_ptr > RXEND_INIT)) {
         /* packet address corrupted: reset RX logic */
         [...]
         /* Update RX errors stats */
         ndev->stats.rx_errors++;
         return;
   }
   /* Read next packet pointer and rx status vector
    * This is device-specific
    */
   my_device_reg_read(priv, priv->next_pk_ptr, sizeof(rsv), rsv);

   /* Check for errors in the device RX status reg,
    * and update error stats accordingly
    */
   if(an_error_is_detected_in_device_status_registers())
         /* Depending on the error,
          * stats.rx_errors++;
          * ndev->stats.rx_crc_errors++;
          * ndev->stats.rx_frame_errors++;
          * ndev->stats.rx_over_errors++;
          */
   } else {
         skb = netdev_alloc_skb(ndev, len + NET_IP_ALIGN);
         if (!skb) {
               ndev->stats.rx_dropped++;
         } else {
               skb_reserve(skb, NET_IP_ALIGN);
               /*
                 * copy the packet from the device' receive buffer
                 * to the socket buffer data memory.
                 * Remember skb_put() return a pointer to the
                 * beginning of data region.
                 */
               my_netdev_mem_read(priv,
                     rx_packet_start(priv->next_pk_ptr),
                     len, skb_put(skb, len));
               /* Set the packet's protocol ID */
               skb->protocol = eth_type_trans(skb, ndev);
               /* update RX statistics */
               ndev->stats.rx_packets++;
               ndev->stats.rx_bytes += len;

               /* Submit socket buffer to the network layer */
               netif_rx_ni(skb);
         }
   }
   /* Move the RX read pointer to the start of the next
    * received packet.
    */
   priv->next_pk_ptr = my_netdev_update_reg_next_pkt();
}
```

Dĩ nhiên lý do duy nhất gọi RX handler trong deferred job là device nằm trên SPI bus. Với MMIO device, mọi operation trên có thể làm trong hwriq. Xem NXP FEC driver ở `drivers/net/ethernet/freescale/fec.c` để biết cách thực hiện.

#### Packet Transmission

Khi kernel cần gửi packet ra interface, gọi method `ndo_start_xmit` của driver, phải trả `NETDEV_TX_OK` khi thành công hoặc `NETDEV_TX_BUSY` khi thất bại; khi đó không được làm gì socket buffer vì nó vẫn thuộc network queuing layer lúc trả lỗi. Nghĩa là không sửa SKB field, không giải phóng SKB, v.v. Function được spinlock bảo vệ khỏi concurrent call. Phần lớn packet transmission là bất đồng bộ. `sk_buff` của packet truyền được upper layer điền. Field `data` chứa packet cần gửi. Driver phải trích packet từ `sk_buff->data`, ghi vào device hardware FIFO hoặc đặt vào temporary TX buffer (nếu device cần lượng dữ liệu nhất định trước gửi) trước khi ghi FIFO. Chỉ thực sự gửi khi FIFO đạt threshold (thường driver định nghĩa hoặc datasheet cung cấp), hoặc khi driver chủ động khởi truyền bằng đặt bit (dạng trigger) trong special register. Vì vậy driver cần báo kernel không bắt đầu transmission đến khi hardware sẵn sàng nhận dữ liệu mới. Thông báo bằng function `netif_stop_queue()`:

```
void netif_stop_queue(struct net_device *dev)
```

Sau khi gửi packet, network interface card raise interrupt. Interrupt handler phải kiểm tra lý do. Với transmission interrupt, cập nhật thống kê (`net_device->stats.tx_errors` và `net_device->stats.tx_packets`), báo kernel device rảnh để gửi packet mới. Thông báo bằng `netif_wake_queue()`:

```
void netif_wake_queue(struct net_device *dev)
```

Tóm lại, packet transmission chia hai phần:

- Operation `The ndo_start_xmit`, báo kernel device bận, thiết lập mọi thứ và bắt đầu transfer

- TX interrupt handler, cập nhật TX statistic và báo kernel device lại khả dụng

Function `ndo_start_xmit` cơ bản phải gồm các bước:

1\. Gọi `netif_stop_queue()` trên network device để báo kernel device sẽ bận truyền dữ liệu.

2\. Ghi nội dung `sk_buff->data` vào device FIFO.

3\. Trigger transmission (chỉ dẫn device bắt đầu truyền).

Operation (2) và (3) có thể khiến device trên slow bus sleep (ví dụ SPI), cần defer sang work structure. Đây là trường hợp ví dụ của ta.

Khi packet chuyển xong, TX interrupt handler phải làm:

4\. Tùy device memory mapped hay nằm trên bus có access function có thể sleep, operation sau phải làm trực tiếp trong handler `hwirq` hoặc schedule trong job (hoặc threaded IRQ):

1\. Kiểm tra interrupt có phải transmission interrupt

2\. Đọc transmission descriptor status register, xem packet status

3\. Tăng error statistic nếu truyền gặp vấn đề

4\. Tăng statistic packet truyền thành công

5\. Khởi động transmission queue để kernel gọi lại method `ndo_start_xmit` của driver bằng function `netif_wake_queue()`.

Tổng hợp thành đoạn sample code ngắn:

```
/* Somewhere in the code */
INIT_WORK(&priv->tx_work, my_netdev_hw_tx);

static netdev_tx_t my_netdev_start_xmit(struct sk_buff *skb,
                           struct net_device *dev)
{
   struct priv_net_struct *priv = netdev_priv(dev);

   /* Notify the kernel our device will be busy */
   netif_stop_queue(dev);

   /* Remember the skb for deferred processing */
   priv->tx_skb = skb;

   /* This work will copy data from sk_buffer->data to
    * the hardware's FIFO and start transmission
    */
   schedule_work(&priv->tx_work);

   /* Everything is OK */
   return NETDEV_TX_OK;
}
The work is described below:
/*
 * Hardware transmit function.
 * Fill the buffer memory and send the contents of the
 * transmit buffer onto the network
 */
static void my_netdev_hw_tx(struct priv_net_struct *priv)
{
   /* Write packet to hardware device TX buffer memory */
   my_netdev_packet_write(priv, priv->tx_skb->len,
priv->tx_skb->data);

/*
 * does this network device support write-verify?
 * Perform it
 */
[...];

   /* set TX request flag,
 * so that the hardware can perform transmission.
 * This is device-specific
 */
   my_netdev_reg_bitset(priv, ECON1, ECON1_TXRTS);
}
```

TX interrupt management được trình bày phần tiếp theo.

### Ví dụ Driver

Có thể tổng hợp khái niệm trước đó trong fake Ethernet driver sau:

```
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/errno.h>
#include <linux/init.h>
#include <linux/netdevice.h>
#include <linux/etherdevice.h>
#include <linux/ethtool.h>
#include <linux/skbuff.h>
#include <linux/slab.h>
#include <linux/of.h>                   /* For DT*/
#include <linux/platform_device.h>      /* For platform devices */

struct eth_struct {
    int bar;
    int foo;
    struct net_device *dummy_ndev;
};
static int fake_eth_open(struct net_device *dev) {
    printk("fake_eth_open called\n");
    /* We are now ready to accept transmit requests from
    * the queueing layer of the networking.
    */
   netif_start_queue(dev);
    return 0;
}

static int fake_eth_release(struct net_device *dev) {
    pr_info("fake_eth_release called\n");
    netif_stop_queue(dev);
    return 0;
}

static int fake_eth_xmit(struct sk_buff *skb, struct net_device *ndev) {
    pr_info("dummy xmit called...\n");
    ndev->stats.tx_bytes += skb->len;
    ndev->stats.tx_packets++;

    skb_tx_timestamp(skb);
   dev_kfree_skb(skb);
   return NETDEV_TX_OK;
}

static int fake_eth_init(struct net_device *dev)
{
    pr_info("fake eth device initialized\n");
    return 0;
};


static const struct net_device_ops my_netdev_ops = {
     .ndo_init = fake_eth_init,
     .ndo_open = fake_eth_open,
     .ndo_stop = fake_eth_release,
     .ndo_start_xmit = fake_eth_xmit,
     .ndo_validate_addr    = eth_validate_addr,
};


static const struct of_device_id fake_eth_dt_ids[] = {
    { .compatible = "packt,fake-eth", },
    { /* sentinel */ }
};


static int fake_eth_probe(struct platform_device *pdev)
{
    int ret;
    struct eth_struct *priv;
    struct net_device *dummy_ndev;

    priv = devm_kzalloc(&pdev->dev, sizeof(*priv), GFP_KERNEL);
    if (!priv)
        return -ENOMEM;

    dummy_ndev = alloc_etherdev(sizeof(struct eth_struct));
    dummy_ndev->if_port = IF_PORT_10BASET;
    dummy_ndev->netdev_ops = &my_netdev_ops;
    /* If needed, dev->ethtool_ops = &fake_ethtool_ops; */

    ret = register_netdev(dummy_ndev);
    if(ret) {
        pr_info("dummy net dev: Error %d initializing card ...", ret);
        return ret;
    }

    priv->dummy_ndev = dummy_ndev;
    platform_set_drvdata(pdev, priv);
    return 0;
}


static int fake_eth_remove(struct platform_device *pdev)
{
    struct eth_struct *priv;
   priv = platform_get_drvdata(pdev);
   pr_info("Cleaning Up the Module\n");
    unregister_netdev(priv->dummy_ndev);
    free_netdev(priv->dummy_ndev);

   return 0;
}

static struct platform_driver mypdrv = {
    .probe      = fake_eth_probe,
    .remove     = fake_eth_remove,
    .driver     = {
        .name     = "fake-eth",
        .of_match_table = of_match_ptr(fake_eth_dt_ids),
        .owner    = THIS_MODULE,
    },
};
module_platform_driver(mypdrv);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("John Madieu <john.madieu@gmail.com>");
MODULE_DESCRIPTION("Fake Ethernet driver");
```

Khi module load và device match, Ethernet interface được tạo trên hệ thống. Trước hết xem lệnh `dmesg` hiển thị:

```
# dmesg
[...]
[146698.060074] fake eth device initialized
[146698.087297] IPv6: ADDRCONF(NETDEV_UP): eth0: link is not ready
```

Nếu chạy `ifconfig -a`, interface được in trên màn hình:

```
# ifconfig -a
[...]
eth0 Link encap:Ethernet HWaddr 00:00:00:00:00:00
BROADCAST MULTICAST MTU:1500 Metric:1
RX packets:0 errors:0 dropped:0 overruns:0 frame:0
TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
collisions:0 txqueuelen:1000
RX bytes:0 (0.0 B) TX bytes:0 (0.0 B)
```

Cuối cùng có thể cấu hình interface, gán IP address để hiển thị bằng `ifconfig`:

```
# ifconfig eth0 192.168.1.45
# ifconfig
[...]
eth0 Link encap:Ethernet HWaddr 00:00:00:00:00:00
inet addr:192.168.1.45 Bcast:192.168.1.255 Mask:255.255.255.0
BROADCAST MULTICAST MTU:1500 Metric:1
RX packets:0 errors:0 dropped:0 overruns:0 frame:0
TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
collisions:0 txqueuelen:1000
RX bytes:0 (0.0 B) TX bytes:0 (0.0 B)
```

### Status và Control

Device control là tình huống kernel cần chủ động đổi interface property hoặc đáp ứng user action. Có thể dùng operation expose qua structure `struct net_device_ops` như đã trình bày, hoặc công cụ control khác là ethtool, yêu cầu driver thêm tập hook mới được nói ở phần tiếp theo. Ngược lại status báo state của interface.

#### Interrupt Handler

Đến đây chỉ xử lý hai interrupt: packet mới đến và truyền outgoing packet hoàn tất. Nhưng hardware interface hiện nay thông minh hơn, báo status cho sanity purpose hoặc data transfer purpose. Vì vậy network interface cũng sinh interrupt báo lỗi, link status change, v.v. Phải xử lý tất cả trong interrupt handler.

Handler `hwrirq` như sau:

```
static irqreturn_t my_netdev_irq(int irq, void *dev_id)
{
   struct priv_net_struct *priv = dev_id;

   /*
    * Can't do anything in interrupt context because we need to
    * block (spi_sync() is blocking) so fire of the interrupt
    * handling workqueue.
    * Remember, we access our netdev registers through SPI bus
    * via spi_sync() call.
    */
   schedule_work(&priv->irq_work);

   return IRQ_HANDLED;
}
```

Vì device nằm trên SPI bus, mọi thứ defer vào `work_struct`, định nghĩa như sau:

```
static void my_netdev_irq_work_handler(struct work_struct *work)
{
   struct priv_net_struct *priv =
         container_of(work, struct priv_net_struct, irq_work);
   struct net_device *ndev = priv->netdev;
   int intflags, loop;

   /* disable further interrupts */
   my_netdev_reg_bitclear(priv, EIE, EIE_INTIE);

   do {
         loop = 0;
         intflags = my_netdev_regb_read(priv, EIR);
         /* DMA interrupt handler (not currently used) */
         if ((intflags & EIR_DMAIF) != 0) {
               loop++;
               handle_dma_complete();
               clear_dma_interrupt_flag();
         }
         /* LINK changed handler */
         if ((intflags & EIR_LINKIF) != 0) {
               loop++;
               my_netdev_check_link_status(ndev);
               clear_link_interrupt_flag();
         }
         /* TX complete handler */
         if ((intflags & EIR_TXIF) != 0) {
               bool err = false;
               loop++;
               priv->tx_retry_count = 0;
               if (locked_regb_read(priv, ESTAT) & ESTAT_TXABRT)
                     clear_tx_interrupt_flag();
         /* TX Error handler */
         if ((intflags & EIR_TXERIF) != 0) {
               loop++;
               /*
                * Reset TX logic by setting/clearing appropriate
                 * bit in the right register
                 */
               [...]

               /* Transmit Late collision check for retransmit */
               if (my_netdev_cpllision_bit_set())
                     /* Handlecollision */
                     [...]
         }
         /* RX Error handler */
         if ((intflags & EIR_RXERIF) != 0) {
               loop++;
               /* Check free FIFO space to flag RX overrun */
               [...]
         }
         /* RX handler */
         if (my_rx_interrupt(ndev))
               loop++;
   } while (loop);

   /* re-enable interrupts */
   my_netdev_reg_bitset(priv, EIE, EIE_INTIE);
}
```

#### Hỗ trợ Ethtool

Ethtool là tiện ích nhỏ kiểm tra và tinh chỉnh setting của network interface Ethernet-based. Có thể điều khiển tham số như:

- Speed

- Media type

- Duplex operation

- Lấy/đặt nội dung EEPROM register

- Hardware check summing

- Wake-on-LAN

Driver cần hỗ trợ ethtool phải include `<linux/ethtool.h>`. Dựa trên structure `struct ethtool_ops`, core của tính năng, chứa tập method hỗ trợ ethtool operation. Phần lớn tương đối đơn giản; xem `include/linux/ethtool.h` để biết chi tiết.

Để hỗ trợ ethtool đầy đủ trong driver, cần điền structure `ethtool_ops` và gán vào field `.ethtool_ops` của structure `struct` `net_device`:

```
my_netdev->ethtool_ops = &my_ethtool_ops;
```

Cũng dùng macro `SET_ETHTOOL_OPS` được. Lưu ý ethtool method có thể gọi cả khi interface down.

Ví dụ các driver sau hỗ trợ ethtool:

- `drivers/net/ethernet/microchip/enc28j60.c`

- `drivers/net/ethernet/freescale/fec.c`

- `drivers/net/usb/rtl8150.c`

## Driver Method

Driver method là function `probe()` và `remove()`. Chịu trách nhiệm đăng ký/hủy đăng ký network device với kernel. Driver phải cung cấp chức năng cho kernel qua device method bằng structure `struct` `net_device`. Đây là operation thực hiện được trên network interface:

```
static const struct net_device_ops my_netdev_ops = {
   .ndo_open         = my_netdev_open,
   .ndo_stop         = my_netdev_close,
   .ndo_start_xmit   = my_netdev_start_xmit,
   .ndo_set_rx_mode  = my_netdev_set_multicast_list,
   .ndo_set_mac_address    = my_netdev_set_mac_address,
   .ndo_tx_timeout   = my_netdev_tx_timeout,
   .ndo_change_mtu   = eth_change_mtu,
   .ndo_validate_addr      = eth_validate_addr,
};
```

Operation trên là thứ phần lớn driver triển khai.

### Function probe

Function `probe` khá cơ bản, chỉ cần thực hiện `init` sớm cho device rồi đăng ký network device với kernel.

Nói cách khác function `probe` phải:

1\. Cấp phát network device cùng private data bằng function `alloc_etherdev()` (với hỗ trợ `netdev_priv()`).

2\. Khởi tạo private data field (mutex, spinlock, work\_queue, v.v.). Nên dùng work queue (và mutex) nếu device nằm trên bus có access function có thể sleep (ví dụ SPI). Khi đó `hwirq` chỉ cần acknowledge kernel code và schedule job thao tác device. Giải pháp khác là threaded IRQ. Nếu device MMIO, dùng spinlock bảo vệ critical section và bỏ work queue.

3\. Khởi tạo tham số và chức năng bus-specific (SPI, USB, PCI, v.v.).

4\. Request và map resource (I/O memory, DMA channel, IRQ).

5\. Nếu cần, sinh random MAC address và gán cho device.

6\. Điền netdev property bắt buộc (hoặc hữu ích): `if_port`, `irq`, `netdev_ops`, `ethtool_ops`, v.v.

7\. Đưa device vào state low-power (function `open()` đưa ra khỏi mode).

8\. Cuối cùng gọi `register_netdev()` trên device.

Với SPI network device, function `probe` như sau:

```
static int my_netdev_probe(struct spi_device *spi)
{
   struct net_device *dev;
   struct priv_net_struct *priv;
   int ret = 0;

   /* Allocate network interface */
   dev = alloc_etherdev(sizeof(struct priv_net_struct));
   if (!dev)
         [...] /* handle -ENOMEM error */

   /* Private data */
   priv = netdev_priv(dev);

   /* set private data and bus-specific parameter */
   [...]

   /* Initialize some works */
   INIT_WORK(&priv->tx_work, data_tx_work_handler);
   [...]
   /* Devicerealy init, only few things */
   if (!my_netdev_chipset_init(dev))
         [...] /* handle -EIO error */

   /* Generate and assign random MAC address to the device */
   eth_hw_addr_random(dev);
   my_netdev_set_hw_macaddr(dev);

   /* Board setup must set the relevant edge trigger type;
    * level triggers won't currently work.
    */
   ret = request_irq(spi->irq, my_netdev_irq, 0, DRV_NAME, priv);
   if (ret < 0)
         [...]; /* Handle irq request failure */

   /* Fill some netdev mandatory or useful properties */
   dev->if_port = IF_PORT_10BASET;
   dev->irq = spi->irq;
   dev->netdev_ops = &my_netdev_ops;
   dev->ethtool_ops = &my_ethtool_ops;

   /* Put device into sleep mode */
   My_netdev_lowpower(priv, true);

   /* Register our device with the kernel */
   if (register_netdev(dev))
         [...]; /* Handle registration failure error */

   dev_info(&dev->dev, DRV_NAME " driver registered\n");

   return 0;
}
```

Toàn chương lấy nhiều cảm hứng từ enc28j60 của Microchip. Có thể xem code ở `drivers/net/ethernet/microchip/enc28j60.c`.

Function `register_netdev()` nhận object `struct net_device` hoàn chỉnh, thêm vào kernel interface; trả 0 khi thành công, error code âm khi thất bại. Object `struct net_device` nên lưu trong bus device structure để truy cập sau. Vì vậy nếu net device thuộc global private structure, phải đăng ký structure đó.

Lưu ý tên device trùng có thể khiến đăng ký thất bại.

### Unload Module

Đây là cleaning function dựa trên hai function. Driver release function phải như sau:

```
static int my_netdev_remove(struct spi_device *spi)
{
   struct priv_net_struct *priv = spi_get_drvdata(spi);

   unregister_netdev(priv->netdev);
   free_irq(spi->irq, priv);
   free_netdev(priv->netdev);

   return 0;
}
```

Function `unregister_netdev()` xóa interface khỏi hệ thống, kernel không còn gọi method; `free_netdev()` giải phóng memory chính structure `struct net_device`, memory cho private data và memory cấp phát nội bộ liên quan network device. Lưu ý không bao giờ tự giải phóng `netdev->priv`.

## Tổng kết

Chương giải thích mọi thứ cần để viết NIC device driver. Dù dựa trên network interface nằm trên SPI bus, nguyên tắc giống USB hoặc PCI network interface. Cũng có thể dùng dummy driver cung cấp để kiểm thử. Sau khi đọc, NIC driver không còn là bí ẩn với bạn.
