# *Chương 11*: Giao tiếp với device driver (Interfacing with Device Drivers)

Kernel device driver là cơ chế qua đó phần cứng bên dưới được đưa ra cho phần còn lại của hệ thống. Là một lập trình viên hệ thống nhúng, bạn cần biết các device driver này khớp vào kiến trúc tổng thể như thế nào và cách truy cập chúng từ các chương trình user space. Hệ thống của bạn có lẽ sẽ có một số phần cứng mới lạ, và bạn sẽ phải tìm ra cách truy cập chúng. Trong nhiều trường hợp, bạn sẽ thấy đã có sẵn device driver cho mình, và bạn có thể đạt được mọi thứ mình muốn mà không cần viết bất kỳ code kernel nào. Chẳng hạn, bạn có thể thao tác các chân GPIO và LED bằng các file trong `sysfs`, và có những thư viện bạn có thể dùng để truy cập các serial bus, bao gồm **SPI** (**Serial Peripheral Interface**) và **I**2**C** (**Inter-Integrated Circuit**).

Có nhiều nơi để tìm hiểu cách viết một device driver, nhưng ít nơi cho bạn biết vì sao bạn lại muốn làm vậy và những lựa chọn bạn có khi làm điều đó. Đây là điều tôi muốn đề cập ở đây. Tuy nhiên, hãy nhớ rằng đây không phải là một cuốn sách chuyên về viết kernel device driver, và thông tin được đưa ra ở đây là để giúp bạn định hướng trong lãnh địa này chứ không nhất thiết để bạn định cư ở đó. Có nhiều sách và bài viết hay sẽ giúp bạn viết device driver, một số được liệt kê ở cuối chương này trong mục *Đọc thêm*.

Trong chương này, chúng ta sẽ đề cập các chủ đề sau:

- Vai trò của device driver
- Character device
- Block device
- Network device
- Tìm hiểu về driver lúc runtime
- Tìm device driver phù hợp
- Device driver trong user space
- Viết một kernel device driver
- Khám phá cấu hình phần cứng

Hãy bắt đầu!

## Yêu cầu kỹ thuật

Để làm theo các ví dụ trong chương này, hãy bảo đảm bạn có những thứ sau:

- Một hệ thống host Linux-based
- Một đầu đọc thẻ microSD và thẻ
- Một BeagleBone Black
- Một nguồn điện DC 5V 1A
- Một cáp Ethernet và port để kết nối mạng

Toàn bộ code cho chương này có thể được tìm thấy trong thư mục `Chapter11` của repository GitHub của sách: [https://github.com/PacktPublishing/Mastering-Embedded-Linux-Programming-Third-Edition](https://github.com/PacktPublishing/Mastering-Embedded-Linux-Programming-Third-Edition).

## Vai trò của device driver

Như tôi đã đề cập trong [*Chương 4*](ch04_configuring_and_building_the_kernel.vi.md), *Cấu hình và build kernel*, một trong các chức năng của kernel là đóng gói nhiều giao diện phần cứng của một hệ thống máy tính và trình bày chúng theo một cách nhất quán cho các chương trình user space. Kernel có các framework được thiết kế để giúp viết device driver dễ dàng, device driver là đoạn code làm trung gian giữa kernel ở trên và phần cứng ở dưới. Một device driver có thể được viết để điều khiển các thiết bị vật lý như một UART hay một MMC controller, hoặc nó có thể đại diện cho một thiết bị ảo như null device (`/dev/null`) hay một ramdisk. Một driver có thể điều khiển nhiều thiết bị cùng loại.

Code kernel device driver chạy ở mức đặc quyền cao, như phần còn lại của kernel. Nó có toàn quyền truy cập không gian địa chỉ processor và các thanh ghi phần cứng. Nó có thể xử lý interrupt và các lần truyền DMA. Nó cũng có thể tận dụng hạ tầng kernel tinh vi cho đồng bộ hóa và quản lý bộ nhớ. Tuy nhiên, bạn nên biết rằng điều này có mặt trái; nếu có gì trục trặc trong một driver có bug, nó có thể trục trặc nghiêm trọng và làm sập hệ thống. Do đó, có một nguyên tắc là device driver nên đơn giản nhất có thể, chỉ cung cấp thông tin cho các application nơi các quyết định thực sự được đưa ra. Bạn thường nghe điều này được diễn đạt là *không có chính sách trong kernel*. Việc đặt ra chính sách chi phối hành vi tổng thể của hệ thống là trách nhiệm của user space. Chẳng hạn, nạp kernel module để phản ứng với các sự kiện bên ngoài, như cắm một thiết bị USB mới, là trách nhiệm của chương trình user space `udev`, không phải của kernel. Kernel chỉ cung cấp một phương tiện để nạp kernel module.

Trong Linux, có ba loại device driver chính:

- **Character**: Loại này dành cho I/O không buffer với một tập function phong phú và một layer mỏng giữa code application và driver. Đây là lựa chọn đầu tiên khi hiện thực device driver tùy biến.
- **Block**: Loại này có một giao diện được may đo cho block I/O tới và từ các thiết bị mass storage. Có một layer buffering dày được thiết kế để việc đọc và ghi đĩa nhanh nhất có thể, điều khiến nó không phù hợp cho bất cứ thứ gì khác.
- **Network**: Loại này tương tự block device nhưng được dùng để truyền và nhận các network packet thay vì các disk block.

Cũng có một loại thứ tư thể hiện dưới dạng một nhóm file trong một trong các pseudo filesystem. Chẳng hạn, bạn có thể truy cập GPIO driver qua một nhóm file trong `/sys/class/gpio`, như tôi sẽ mô tả ở phần sau của chương này. Hãy bắt đầu bằng việc xem xét ba loại thiết bị cơ bản này chi tiết hơn.

## Character device

Character device được nhận diện trong user space bằng một file đặc biệt gọi là **device node**. Tên file này được ánh xạ tới một device driver bằng major number và minor number gắn với nó. Nói chung, **major number** ánh xạ device node tới một device driver cụ thể, trong khi **minor number** cho driver biết giao diện nào đang được truy cập. Chẳng hạn, device node của serial port đầu tiên trên Arm Versatile PB tên là `/dev/ttyAMA0`, và nó có major number `204` và minor number `64`. Device node cho serial port thứ hai có cùng major number, vì nó được xử lý bởi cùng device driver, nhưng minor number là `65`. Chúng ta có thể thấy các số của cả bốn serial port từ danh sách thư mục ở đây:

```
# ls -l /dev/ttyAMA*
crw-rw---- 1 root root 204, 64 Jan 1 1970 /dev/ttyAMA0
crw-rw---- 1 root root 204, 65 Jan 1 1970 /dev/ttyAMA1
crw-rw---- 1 root root 204, 66 Jan 1 1970 /dev/ttyAMA2
crw-rw---- 1 root root 204, 67 Jan 1 1970 /dev/ttyAMA3
```

Danh sách các major number và minor number tiêu chuẩn có thể được tìm thấy trong tài liệu kernel ở `Documentation/devices.txt`. Danh sách này không được cập nhật thường xuyên và không bao gồm device `ttyAMA` được mô tả trong đoạn trên. Dù vậy, nếu bạn xem source code kernel trong `drivers/tty/serial/amba-pl011.c`, bạn sẽ thấy nơi các major number và minor number được khai báo:

```
#define SERIAL_AMBA_MAJOR 204
#define SERIAL_AMBA_MINOR 64
```

Khi có nhiều hơn một instance của một thiết bị, như với driver `ttyAMA`, quy ước để tạo tên device node là lấy một base name, `ttyAMA`, và nối thêm số instance từ `0` tới `3` trong ví dụ này.

Như tôi đã đề cập trong [*Chương 5*](ch05_building_a_root_filesystem.vi.md), *Xây dựng root filesystem*, các device node có thể được tạo theo vài cách:

- `devtmpfs`: Device node được tạo khi device driver đăng ký một giao diện thiết bị mới bằng một base name do driver cung cấp (`ttyAMA`) và một số instance.
- `udev` hoặc `mdev` (không có `devtmpfs`): Về cơ bản giống với `devtmpfs`, ngoại trừ việc một chương trình daemon user space phải trích tên thiết bị từ `sysfs` và tạo node. Tôi sẽ nói về `sysfs` sau.
- `mknod`: Nếu bạn đang dùng các device node tĩnh, chúng được tạo thủ công bằng `mknod`.

Từ các con số tôi đã dùng ở đây, bạn có thể có ấn tượng rằng cả major number và minor number đều là số 8-bit trong khoảng 0 tới 255. Thực tế, từ Linux 2.6 trở đi, major number dài 12 bit, cho các số hợp lệ từ 1 tới 4,095, và minor number là 20 bit, từ 0 tới 1,048,575.

Khi bạn mở một character device node, kernel kiểm tra xem major number và minor number có nằm trong một dải được một character device driver đăng ký hay không. Nếu có, nó chuyển lời gọi cho driver; nếu không, lời gọi open thất bại. Device driver có thể trích minor number để tìm ra giao diện phần cứng nào cần dùng.

Để viết một chương trình truy cập một device driver, bạn phải có chút hiểu biết về cách nó hoạt động. Nói cách khác, một device driver không giống một file: những gì bạn làm với nó thay đổi trạng thái của thiết bị. Một ví dụ đơn giản là bộ sinh số pseudorandom, `urandom`, trả về các byte dữ liệu ngẫu nhiên mỗi lần bạn đọc nó. Đây là một chương trình làm đúng điều này (bạn sẽ tìm thấy code trong `MELP/Chapter11/read-urandom`):

```
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
int main(void)
{
   int f;
   unsigned int rnd;
   int n;
   f = open("/dev/urandom", O_RDONLY);
   if (f < 0) {
      perror("Failed to open urandom");
      return 1;
   }
   n = read(f, &rnd, sizeof(rnd));
   if (n != sizeof(rnd)) {
      perror("Problem reading urandom");
      return 1;
   }
   printf("Random number = 0x%x\n", rnd);
   close(f);
   return 0;
}
```

Điều hay ở mô hình driver Unix là một khi chúng ta biết có một device tên `urandom`, mỗi lần chúng ta đọc từ nó, nó trả về một tập dữ liệu pseudorandom mới, nên chúng ta không cần biết gì thêm về nó. Chúng ta chỉ cần dùng các function tiêu chuẩn như `open(2)`, `read(2)` và `close(2)`.

> **Mẹo**
>
> Bạn có thể dùng các function stream I/O là `fopen(3)`, `fread(3)` và `fclose(3)` thay thế, nhưng việc buffering ngầm trong các function này thường gây ra hành vi không mong muốn. Chẳng hạn, `fwrite(3)` thường chỉ ghi vào buffer user space, không ghi tới thiết bị. Bạn sẽ cần gọi `fflush(3)` để buộc buffer được ghi ra. Vì vậy, tốt nhất là không dùng các function stream I/O khi gọi device driver.

Hầu hết device driver dùng giao diện character. Các thiết bị mass storage là một ngoại lệ đáng chú ý. Đọc và ghi đĩa đòi hỏi một giao diện block để có tốc độ tối đa.

## Block device

Block device cũng được gắn với một device node, device node này cũng có major number và minor number.

> **Mẹo**
>
> Dù character device và block device được nhận diện bằng major number và minor number, chúng nằm trong các namespace khác nhau. Một character driver có major number `4` không hề liên quan tới một block driver có major number `4`.

Với block device, major number được dùng để nhận diện device driver và minor number được dùng để nhận diện partition. Hãy xem MMC driver trên BeagleBone Black làm ví dụ:

```
# ls -l /dev/mmcblk*
brw-rw---- 1 root disk 179, 0 Jan 1 2000 /dev/mmcblk0
brw-rw---- 1 root disk 179, 1 Jan 1 2000 /dev/mmcblk0p1
brw-rw---- 1 root disk 179, 2 Jan 1 2000 /dev/mmcblk0p2
brw-rw---- 1 root disk 179, 8 Jan 1 2000 /dev/mmcblk1
brw-rw---- 1 root disk 179, 16 Jan 1 2000 /dev/mmcblk1boot0
brw-rw---- 1 root disk 179, 24 Jan 1 2000 /dev/mmcblk1boot1
brw-rw---- 1 root disk 179, 9 Jan 1 2000 /dev/mmcblk1p1
brw-rw---- 1 root disk 179, 10 Jan 1 2000 /dev/mmcblk1p2
```

Ở đây, `mmcblk0` là khe thẻ microSD, có một thẻ với hai partition, và `mmcblk1` là chip eMMC, cũng có hai partition. Major number của MMC block driver là `179` (bạn có thể tra nó trong `devices.txt`). Các minor number được dùng theo dải để nhận diện các thiết bị MMC vật lý khác nhau, và các partition của phương tiện lưu trữ nằm trên thiết bị đó. Trong trường hợp MMC driver, các dải là tám minor number mỗi thiết bị: các minor number từ `0` tới `7` dành cho thiết bị đầu tiên, các số từ `8` tới `15` dành cho thiết bị thứ hai, v.v. Trong mỗi dải, minor number đầu tiên đại diện cho toàn bộ thiết bị dưới dạng các sector thô, và các số khác đại diện cho tối đa bảy partition. Trên chip eMMC, có hai vùng nhớ 128 KiB được dành riêng cho bootloader sử dụng. Chúng được đại diện bởi hai device gọi là `mmcblk1boot0` và `mmcblk1boot1`, và chúng có minor number lần lượt là `16` và `24`.

Một ví dụ khác, bạn có lẽ biết SCSI disk driver, gọi là `sd`, được dùng để điều khiển một loạt đĩa dùng tập lệnh SCSI, bao gồm SCSI, SATA, USB mass storage và **Universal Flash Storage (UFS)**. Nó có major number `8` và các dải 16 minor number cho mỗi giao diện (hay đĩa). Các minor number từ `0` tới `15` dành cho giao diện đầu tiên với các device node tên `sda` tới `sda15`, các số từ `16` tới `31` dành cho đĩa thứ hai với các device node `sdb` tới `sdb15`, v.v. Điều này tiếp tục tới đĩa thứ 16 từ `240` tới `255` với tên node `sdp`. Có các major number khác được dành riêng cho chúng vì đĩa SCSI rất phổ biến, nhưng chúng ta không cần bận tâm về điều đó ở đây.

Cả MMC block driver và SCSI block driver đều mong đợi tìm thấy một partition table ở đầu đĩa. Partition table được tạo bằng các tiện ích như `fdisk`, `sfdisk` và `parted`.

Một chương trình user space có thể mở và tương tác trực tiếp với một block device qua device node. Tuy nhiên, đây không phải việc thường làm, và thường chỉ được làm để thực hiện các thao tác quản trị như tạo partition, format một partition với một filesystem, và mount. Khi filesystem đã được mount, bạn tương tác gián tiếp với block device qua các file trong filesystem đó.

Hầu hết block device sẽ có một kernel driver hoạt động được, nên chúng ta hiếm khi cần tự viết. Điều tương tự áp dụng cho network device. Giống như một filesystem trừu tượng hóa các chi tiết của một block device, network stack loại bỏ nhu cầu tương tác trực tiếp với một network device.

## Network device

Network device không được truy cập qua device node, và chúng không có major number và minor number. Thay vào đó, một network device được kernel cấp một cái tên, dựa trên một chuỗi và một số instance. Đây là một ví dụ về cách một network driver đăng ký một giao diện:

```
my_netdev = alloc_netdev(0, "net%d", NET_NAME_UNKNOWN, netdev_setup);
ret = register_netdev(my_netdev);
```

Lệnh này tạo một network device tên `net0` lần đầu nó được gọi, `net1` lần thứ hai, v.v. Các tên phổ biến hơn bao gồm `lo`, `eth0` và `wlan0`. Lưu ý rằng đây là tên nó bắt đầu với; các device manager, như `udev`, có thể đổi nó thành tên khác về sau.

Thông thường, tên network interface chỉ được dùng khi cấu hình mạng bằng các tiện ích, như `ip` và `ifconfig`, để thiết lập một địa chỉ mạng và route. Sau đó, bạn tương tác gián tiếp với network driver bằng cách mở socket và để network layer quyết định cách route chúng tới đúng giao diện.

Tuy nhiên, có thể truy cập network device trực tiếp từ user space bằng cách tạo một socket và dùng các lệnh `ioctl` được liệt kê trong `include/linux/sockios.h`. Chẳng hạn, chương trình này dùng `SIOCGIFHWADDR` để truy vấn driver lấy địa chỉ phần cứng (MAC) (code nằm trong `MELP/Chapter11/show-mac-addresses`):

```
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/ioctl.h>
#include <linux/sockios.h>
#include <net/if.h>
int main(int argc, char *argv[])
{
   int s;
   int ret;
   struct ifreq ifr;
   int i;
   if (argc != 2) {
      printf("Usage %s [network interface]\n", argv[0]);
      return 1;
   }
   s = socket(PF_INET, SOCK_DGRAM, 0);
   if (s < 0) {
      perror("socket");
      return 1;
   }
   strcpy(ifr.ifr_name, argv[1]);
   ret = ioctl(s, SIOCGIFHWADDR, &ifr);
   if (ret < 0) {
      perror("ioctl");
      return 1;
   }
   for (i = 0; i < 6; i++)
      printf("%02x:", (unsigned char)ifr.ifr_hwaddr.sa_data[i]);
   printf("\n");
   close(s);
   return 0;
}
```

Chương trình này nhận một tên network interface làm đối số. Sau khi mở một socket, chúng ta sao chép tên interface vào một struct và truyền struct đó vào lời gọi `ioctl` trên socket, trước khi in ra địa chỉ MAC kết quả.

Giờ chúng ta đã biết ba loại device driver là gì, làm sao liệt kê các driver khác nhau đang được dùng trên hệ thống?

## Tìm hiểu về driver lúc runtime

Một khi bạn có một hệ thống Linux đang chạy, việc biết những device driver nào đã được nạp và chúng đang ở trạng thái nào là hữu ích. Bạn có thể tìm hiểu được nhiều bằng cách đọc các file trong `/proc` và `/sys`.

Trước hết, bạn có thể liệt kê các character device driver và block device driver hiện đang được nạp và đang hoạt động bằng cách đọc `/proc/devices`:

```
# cat /proc/devices
Character devices:
  1 mem
  2 pty
  3 ttyp
  4 /dev/vc/0
  4 tty
  4 ttyS
  5 /dev/tty
  5 /dev/console
  5 /dev/ptmx
  7 vcs
 10 misc
 13 input
 29 fb
 81 video4linux
 89 i2c
 90 mtd
116 alsa
128 ptm
136 pts
153 spi
180 usb
189 usb_device
204 ttySC
204 ttyAMA
207 ttymxc
226 drm
239 ttyLP
240 ttyTHS
241 ttySiRF
242 ttyPS
243 ttyWMT
244 ttyAS
245 ttyO
246 ttyMSM
247 ttyAML
248 bsg
249 iio
250 watchdog
251 ptp
252 pps
253 media
254 rtc
Block devices:
259 blkext
  7 loop
  8 sd
 11 sr
 31 mtdblock
 65 sd
 66 sd
 67 sd
 68 sd
 69 sd
 70 sd
 71 sd
128 sd
129 sd
130 sd
131 sd
132 sd
133 sd
134 sd
135 sd
179 mmc
```

Với mỗi driver, bạn có thể thấy major number và base name. Tuy nhiên, điều này không cho bạn biết mỗi driver được gắn với bao nhiêu thiết bị. Nó chỉ hiển thị `ttyAMA` nhưng không cho bạn manh mối nào về việc nó có được gắn với bốn serial port thật hay không. Tôi sẽ quay lại điều đó sau khi chúng ta xem `sysfs`.

Tất nhiên, network device không xuất hiện trong danh sách này, vì chúng không có device node. Thay vào đó, bạn có thể dùng các công cụ như `ifconfig` hoặc `ip` để có danh sách network device:

```
# ip link show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state
UNKNOWN mode DEFAULT
 link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: eth0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc
pfifo_fast state DOWN mode DEFAULT qlen 1000
 link/ether 54:4a:16:bb:b7:03 brd ff:ff:ff:ff:ff:ff
3: usb0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc
pfifo_fast state UP mode DEFAULT qlen 1000
 link/ether aa:fb:7f:5e:a8:d5 brd ff:ff:ff:ff:ff:ff
```

Bạn cũng có thể tìm hiểu về các thiết bị gắn trên bus USB hoặc PCI bằng các lệnh well-known `lsusb` và `lspci`. Có thông tin về chúng trong các manual page tương ứng và rất nhiều hướng dẫn trực tuyến, nên tôi sẽ không mô tả chúng thêm ở đây.

Thông tin thực sự thú vị nằm trong `sysfs`, chủ đề tiếp theo chúng ta sẽ đề cập.

### Lấy thông tin từ sysfs

Bạn có thể định nghĩa `sysfs` theo cách câu nệ là một biểu diễn của các kernel object, thuộc tính và quan hệ. Một kernel object là một **thư mục**, một thuộc tính là một **file**, và một quan hệ là một **symbolic link** từ object này tới object khác. Từ góc nhìn thực tế hơn, vì mô hình Linux device driver biểu diễn tất cả thiết bị và driver dưới dạng kernel object, bạn có thể thấy cái nhìn của kernel về hệ thống bày ra trước mắt bằng cách xem trong `/sys`, như được thể hiện ở đây:

```
# ls /sys
block class devices fs module
bus dev firmware kernel power
```

Trong bối cảnh khám phá thông tin về thiết bị và driver, tôi sẽ xem ba trong số các thư mục này: `devices`, `class` và `block`.

#### Các thiết bị – /sys/devices

Đây là cái nhìn của kernel về các thiết bị đã được phát hiện kể từ lúc boot và cách chúng được kết nối với nhau. Nó được tổ chức ở top level theo system bus, nên những gì bạn thấy thay đổi tùy hệ thống. Đây là bản giả lập QEMU của Arm Versatile:

```
# ls /sys/devices
platform software system tracepoint virtual
```

Có ba thư mục có mặt trên mọi hệ thống:

- `system/`: Thư mục này chứa các thiết bị ở trung tâm của hệ thống, bao gồm CPU và clock.
- `virtual/`: Thư mục này chứa các thiết bị memory-based. Bạn sẽ tìm thấy các memory device xuất hiện dưới dạng `/dev/null`, `/dev/random` và `/dev/zero` trong `virtual/mem`. Bạn sẽ tìm thấy loopback device, `lo`, trong `virtual/net`.
- `platform/`: Đây là chỗ catch-all cho các thiết bị không được kết nối qua một hardware bus thông thường. Đây có thể là gần như mọi thứ trên một thiết bị nhúng.

Các thiết bị khác xuất hiện trong các thư mục tương ứng với các system bus thực. Chẳng hạn, PCI root bus, nếu có, xuất hiện dưới dạng `pci0000:00`.

Điều hướng trong cấu trúc phân cấp này khá khó, vì nó đòi hỏi chút hiểu biết về topology của hệ thống, và các đường dẫn trở nên khá dài và khó nhớ. Để cuộc sống dễ dàng hơn, `/sys/class` và `/sys/block` cung cấp hai cái nhìn khác về các thiết bị.

#### Các driver – /sys/class

Đây là cái nhìn về các device driver được trình bày theo loại của chúng. Nói cách khác, nó là một cái nhìn phần mềm thay vì phần cứng. Mỗi thư mục con đại diện cho một class driver và được hiện thực bởi một component của driver framework. Chẳng hạn, các thiết bị UART được quản lý bởi layer `tty`, và bạn sẽ tìm thấy chúng trong `/sys/class/tty`. Tương tự, bạn sẽ tìm thấy các network device trong `/sys/class/net`, các input device như bàn phím, touchscreen và chuột trong `/sys/class/input`, v.v.

Có một symbolic link trong mỗi thư mục con cho mỗi instance của loại thiết bị đó, trỏ tới biểu diễn của nó trong `/sys/device`.

Lấy một ví dụ cụ thể, hãy xem các serial port trên Versatile PB. Trước hết, chúng ta có thể thấy có bốn port:

```
# ls -d /sys/class/tty/ttyAMA*
/sys/class/tty/ttyAMA0 /sys/class/tty/ttyAMA2
/sys/class/tty/ttyAMA1 /sys/class/tty/ttyAMA3
```

Mỗi thư mục là một biểu diễn của kernel object gắn với một instance của một giao diện thiết bị. Nhìn vào một trong các thư mục này, chúng ta có thể thấy các thuộc tính của object, được biểu diễn dưới dạng file, và các quan hệ với các object khác, được biểu diễn bằng link:

```
# ls /sys/class/tty/ttyAMA0
close_delay flags line uartclk
closing_wait io_type port uevent
custom_divisor iomem_base power xmit_fifo_size
dev iomem_reg_shift subsystem
device irq type
```

Link tên `device` trỏ tới hardware object của thiết bị. Link tên `subsystem` trỏ ngược về subsystem cha, `/sys/class/tty`. Các mục thư mục còn lại là thuộc tính. Một số đặc thù cho serial port, chẳng hạn `xmit_fifo_size`, trong khi các thuộc tính khác áp dụng cho nhiều loại thiết bị, chẳng hạn interrupt number, `irq`, và device number, `dev`. Một số file thuộc tính ghi được và cho phép bạn tinh chỉnh các tham số trong driver lúc runtime.

Thuộc tính `dev` đặc biệt thú vị. Nếu bạn xem giá trị của nó, bạn sẽ thấy như sau:

```
# cat /sys/class/tty/ttyAMA0/dev
204:64
```

Đây là major number và minor number của thiết bị này. Thuộc tính này được tạo khi driver đăng ký giao diện này. Chính từ file này mà `udev` và `mdev` tìm ra major number và minor number của device driver.

#### Các block driver – /sys/block

Còn một cái nhìn nữa về device model quan trọng với cuộc thảo luận này: cái nhìn block driver mà bạn sẽ tìm thấy trong `/sys/block`. Có một thư mục con cho mỗi block device. Ví dụ này được lấy từ một BeagleBone Black:

```
# ls /sys/block
loop0 loop4 mmcblk0 ram0 ram12 ram2 ram6
loop1 loop5 mmcblk1 ram1 ram13 ram3 ram7
loop2 loop6 mmcblk1boot0 ram10 ram14 ram4 ram8
loop3 loop7 mmcblk1boot1 ram11 ram15 ram5 ram9
```

Nếu bạn xem vào `mmcblk1`, là chip eMMC trên board này, bạn sẽ thấy các thuộc tính của giao diện và các partition bên trong nó:

```
# ls /sys/block/mmcblk1
alignment_offset ext_range mmcblk1p1 ro
bdi force_ro mmcblk1p2 size
capability holders power slaves
dev inflight queue stat
device mmcblk1boot0 range subsystem
discard_alignment mmcblk1boot1 removable uevent
```

Vậy kết luận là bạn có thể tìm hiểu được nhiều về các thiết bị (phần cứng) và các driver (phần mềm) có mặt trên một hệ thống bằng cách đọc `sysfs`.

## Tìm device driver phù hợp

Một board nhúng điển hình dựa trên một thiết kế tham chiếu từ nhà sản xuất với các thay đổi để phù hợp với một application cụ thể. BSP đi kèm reference board nên hỗ trợ tất cả các ngoại vi trên board đó. Nhưng rồi bạn tùy biến thiết kế, có lẽ bằng cách thêm một cảm biến nhiệt độ gắn qua I2C, vài đèn và nút bấm kết nối qua các chân GPIO, một display panel qua giao diện MIPI, hoặc nhiều thứ khác. Công việc của bạn là tạo một kernel tùy biến để điều khiển tất cả những thứ này, nhưng bạn bắt đầu tìm device driver hỗ trợ tất cả các ngoại vi này ở đâu?

Nơi hiển nhiên nhất để tìm là trang hỗ trợ driver trên website của nhà sản xuất, hoặc bạn có thể hỏi trực tiếp họ. Theo kinh nghiệm của tôi, cách này hiếm khi cho kết quả bạn muốn; các nhà sản xuất phần cứng không đặc biệt Linux-savvy, và họ thường cho bạn thông tin gây hiểu lầm. Họ có thể có các driver proprietary dưới dạng binary blob, hoặc họ có thể có source code nhưng cho một phiên bản kernel khác với phiên bản bạn có. Vì vậy, cứ thử con đường này. Cá nhân tôi luôn cố tìm một driver open source cho nhiệm vụ đang làm.

Có thể đã có hỗ trợ trong kernel của bạn: có hàng nghìn driver trong Linux mainline và có nhiều driver vendor-specific trong các vendor kernel. Hãy bắt đầu bằng cách chạy `make menuconfig` (hoặc `xconfig`) và tìm tên hoặc mã sản phẩm. Nếu bạn không tìm thấy kết quả khớp chính xác, hãy thử các tìm kiếm chung hơn, tính đến việc hầu hết driver xử lý một loạt sản phẩm cùng một họ. Tiếp theo, hãy thử tìm trong code ở thư mục `drivers` (`grep` là bạn của bạn ở đây).

Nếu bạn vẫn không có driver, bạn có thể thử tìm trực tuyến và hỏi trong các diễn đàn liên quan để xem có driver cho một phiên bản Linux mới hơn không. Nếu tìm thấy, bạn nên nghiêm túc cân nhắc cập nhật BSP để dùng kernel mới hơn. Đôi khi, điều này không thực tế, và vì vậy có thể phải nghĩ tới việc backport driver vào kernel của bạn. Nếu các phiên bản kernel tương tự nhau, việc này có thể dễ, nhưng nếu chúng cách nhau hơn 12 tới 18 tháng, thì nhiều khả năng code sẽ đã thay đổi tới mức bạn sẽ phải viết lại một phần driver để tích hợp nó với kernel của mình. Nếu tất cả các lựa chọn này đều thất bại, bạn sẽ phải tự tìm giải pháp bằng cách viết kernel driver còn thiếu. Tuy nhiên, điều này không phải lúc nào cũng cần thiết. Chúng ta sẽ xem điều này trong mục tiếp theo.

## Device driver trong user space

Trước khi bắt đầu viết một device driver, hãy dừng lại một chút để cân nhắc liệu nó có thực sự cần thiết không. Có các device driver chung cho nhiều loại thiết bị phổ biến cho phép bạn tương tác trực tiếp với phần cứng từ user space, mà không cần viết một dòng code kernel nào. Code user space chắc chắn dễ viết và debug hơn. Nó cũng không bị GPL chi phối, dù tôi không cho rằng tự bản thân điều đó là một lý do tốt để làm theo cách này.

Các driver này thuộc hai nhóm lớn: những driver bạn điều khiển qua các file trong `sysfs`, bao gồm GPIO và LED, và các serial bus đưa ra một giao diện chung qua một device node, chẳng hạn I2C.

### GPIO

**General-Purpose Input/Output** (**GPIO**) là dạng giao diện số đơn giản nhất vì nó cho bạn truy cập trực tiếp tới từng chân phần cứng riêng lẻ, mỗi chân có thể ở một trong hai trạng thái: high hoặc low. Trong hầu hết trường hợp, bạn có thể cấu hình chân GPIO là input hoặc output. Bạn thậm chí có thể dùng một nhóm chân GPIO để tạo các giao diện mức cao hơn như I2C hay SPI bằng cách thao tác từng bit bằng phần mềm, một kỹ thuật gọi là **bit banging**. Hạn chế chính là tốc độ và độ chính xác của các vòng lặp phần mềm và số chu kỳ CPU bạn muốn dành cho chúng. Nói chung, khó đạt được độ chính xác timer tốt hơn một mili giây trừ khi bạn cấu hình một kernel real-time, như chúng ta sẽ thấy trong [*Chương 21*](ch21_real_time_programming.vi.md), *Lập trình Real-Time*. Các use case phổ biến hơn cho GPIO là đọc nút nhấn và cảm biến số và điều khiển LED, motor và relay.

Hầu hết SoC có rất nhiều bit GPIO, được gom lại trong các thanh ghi GPIO, thường là 32 bit mỗi thanh ghi. Các bit GPIO On-chip được định tuyến tới các chân GPIO trên package chip qua một multiplexer, gọi là **pin mux**. Có thể có thêm các chân GPIO off-chip trong chip quản lý nguồn, và trong các GPIO extender chuyên dụng, kết nối qua bus I2C hoặc SPI. Tất cả sự đa dạng này được xử lý bởi một kernel subsystem gọi là `gpiolib`, thực ra không phải một thư viện mà là hạ tầng mà các GPIO driver dùng để đưa I/O ra theo một cách nhất quán. Có các chi tiết về hiện thực của `gpiolib` trong source kernel ở `Documentation/gpio`, và code của bản thân các driver nằm trong `drivers/gpio`.

Các application có thể tương tác với `gpiolib` qua các file trong thư mục `/sys/class/gpio`. Đây là ví dụ về những gì bạn sẽ thấy trong đó trên một board nhúng điển hình (một BeagleBone Black):

```
# ls /sys/class/gpio
export gpiochip0 gpiochip32 gpiochip64 gpiochip96 unexport
```

Các thư mục tên `gpiochip0` tới `gpiochip96` đại diện cho bốn thanh ghi GPIO, mỗi thanh ghi có 32 bit GPIO. Nếu bạn xem trong một trong các thư mục `gpiochip`, bạn sẽ thấy như sau:

```
# ls /sys/class/gpio/gpiochip96
base label ngpio power subsystem uevent
```

File tên `base` chứa số của chân GPIO đầu tiên trong thanh ghi, trong khi `ngpio` chứa số bit trong thanh ghi. Trong trường hợp này, `gpiochip96/base` là 96 và `gpiochip96/ngpio` là 32, cho bạn biết nó chứa các bit GPIO từ 96 tới 127. Có thể có một khoảng trống giữa GPIO cuối cùng trong một thanh ghi và GPIO đầu tiên trong thanh ghi tiếp theo.

Để điều khiển một bit GPIO từ user space, trước hết bạn phải export nó từ kernel space, điều bạn có thể làm bằng cách ghi số GPIO vào `/sys/class/gpio/export`. Ví dụ này cho thấy quá trình cho GPIO 53, được nối tới user LED 0 trên BeagleBone Black:

```
# echo 53 > /sys/class/gpio/export
# ls /sys/class/gpio
export gpio53 gpiochip0 gpiochip32 gpiochip64 gpiochip96 unexport
```

Giờ có một thư mục mới, `gpio53`, chứa các file bạn cần để điều khiển chân.

> **Lưu ý quan trọng**
>
> Nếu bit GPIO đã bị kernel chiếm, bạn sẽ không thể export nó theo cách này.

Thư mục `gpio53` chứa các file sau:

```
# ls /sys/class/gpio/gpio53
active_low direction power uevent
device edge subsystem value
```

Chân bắt đầu là input. Để đổi nó thành output, ghi `out` vào file `direction`. File value chứa trạng thái hiện tại của chân, là `0` cho low và `1` cho high. Nếu nó là output, bạn có thể đổi trạng thái bằng cách ghi `0` hoặc `1` vào `value`. Đôi khi, ý nghĩa của low và high bị đảo ngược trong phần cứng (các kỹ sư phần cứng thích làm kiểu việc đó), nên ghi `1` vào `active_low` đảo ngược ý nghĩa của `value` để điện áp thấp được báo là `1` và điện áp cao được báo là `0`.

Bạn có thể gỡ một GPIO khỏi sự điều khiển của user space bằng cách ghi số GPIO vào `/sys/class/gpio/unexport`.

#### Xử lý interrupt từ GPIO

Trong nhiều trường hợp, một input GPIO có thể được cấu hình để tạo interrupt khi nó đổi trạng thái, điều cho phép bạn chờ interrupt thay vì polling trong một vòng lặp phần mềm kém hiệu quả. Nếu bit GPIO có thể tạo interrupt, tồn tại một file tên `edge`. Ban đầu, nó có giá trị `none`, nghĩa là nó không tạo interrupt. Để enable interrupt, bạn có thể đặt nó thành một trong các giá trị sau:

- `rising`: Interrupt ở cạnh lên
- `falling`: Interrupt ở cạnh xuống
- `both`: Interrupt ở cả cạnh lên và cạnh xuống
- `none`: Không có interrupt (mặc định)

Nếu bạn muốn chờ một cạnh xuống trên GPIO 48, trước hết bạn phải enable interrupt:

```
# echo 48 > /sys/class/gpio/export
# echo falling > /sys/class/gpio/gpio48/edge
```

Để chờ một interrupt từ GPIO, hãy làm theo các bước sau:

1. Đầu tiên, gọi `epoll_create` để tạo cơ chế thông báo `epoll`:

   ```
   int ep;
   ep = epoll_create(1);
   ```

2. Tiếp theo, `open` GPIO và `read` giá trị ban đầu của nó:

   ```
   int f;
   int n;
   char value[4];
   f = open("/sys/class/gpio/gpio48/value", O_RDONLY | O_NONBLOCK);
   […]
   n = read(f, &value, sizeof(value));
   if (n > 0) {
        printf("Initial value value=%c\n",
              value[0]);
        lseek(f, 0, SEEK_SET);
   }
   ```

3. Gọi `epoll_ctl` để đăng ký file descriptor của GPIO với `POLLPRI` làm sự kiện:

   ```
   struct epoll_event ev, events;
   ev.events = EPOLLPRI;
   ev.data.fd = f;
   int ret;
   ret = epoll_ctl(ep, EPOLL_CTL_ADD, f, &ev);
   ```

4. Cuối cùng, chờ một interrupt bằng function `epoll_wait`:

   ```
   while (1) {
        printf("Waiting\n");
        ret = epoll_wait(ep, &events, 1, -1);
        if (ret > 0) {
              n = read(f, &value, sizeof(value));
              printf("Button pressed: value=%c\n", value[0]);
              lseek(f, 0, SEEK_SET);
        }
   }
   ```

Source code đầy đủ của chương trình này, cũng như một `Makefile` và script cấu hình GPIO, có thể được tìm thấy trong thư mục `MELP/Chapter11/gpio-int/` đi kèm archive code của sách.

Dù chúng ta có thể đã dùng `select` và `poll` để xử lý interrupt, khác với hai system call kia, hiệu năng của `epoll` không suy giảm nhanh khi số file descriptor được giám sát tăng lên.

Giống GPIO, LED có thể được truy cập từ `sysfs`. Tuy nhiên, giao diện khác biệt rõ rệt.

### LED

LED thường được điều khiển qua một chân GPIO, nhưng có một kernel subsystem khác cung cấp sự điều khiển chuyên biệt hơn dành riêng cho mục đích này. Kernel subsystem `leds` thêm khả năng đặt độ sáng, nếu LED có khả năng đó, và nó có thể xử lý các LED được kết nối theo những cách khác ngoài một chân GPIO đơn giản. Nó có thể được cấu hình để kích hoạt LED theo một sự kiện, chẳng hạn truy cập block device hoặc chỉ là một heartbeat, để cho thấy thiết bị đang hoạt động. Bạn sẽ phải cấu hình kernel với tùy chọn `CONFIG_LEDS_CLASS` và với các hành động LED trigger phù hợp với bạn. Có thêm thông tin trong `Documentation/leds/`, và các driver nằm trong `drivers/leds/`.

Giống GPIO, LED được điều khiển qua một giao diện trong `sysfs` ở thư mục `/sys/class/leds`. Trong trường hợp BeagleBone Black, tên của các LED được mã hóa trong device tree theo dạng `devicename:colour:function`, như được thể hiện ở đây:

```
# ls /sys/class/leds
beaglebone:green:heartbeat beaglebone:green:usr2
beaglebone:green:mmc0 beaglebone:green:usr3
```

Bây giờ, chúng ta có thể xem các thuộc tính của một trong các LED:

```
# cd /sys/class/leds/beaglebone\:green\:usr2
# ls
brightness max_brightness subsystem uevent
device power trigger
```

Lưu ý rằng shell cần các dấu backslash ở đầu để escape các dấu hai chấm trong đường dẫn.

File `brightness` điều khiển độ sáng của LED và có thể là một số giữa `0` (tắt) và `max_brightness` (sáng hoàn toàn). Nếu LED không hỗ trợ độ sáng trung gian, bất kỳ giá trị non-zero nào cũng bật nó. File tên `trigger` liệt kê các sự kiện kích hoạt LED bật. Danh sách trigger là implementation-dependent. Đây là một ví dụ:

```
# cat trigger
none mmc0 mmc1 timer oneshot heartbeat backlight gpio [cpu0]
default-on
```

Trigger hiện được chọn được hiển thị trong ngoặc vuông. Bạn có thể đổi nó bằng cách ghi một trong các trigger khác vào file. Nếu bạn muốn điều khiển LED hoàn toàn qua `brightness`, hãy chọn `none`. Nếu bạn đặt `trigger` thành `timer`, hai file phụ sẽ xuất hiện cho phép bạn đặt thời gian bật và tắt tính bằng mili giây:

```
# echo timer > trigger
# ls
brightness delay_on max_brightness subsystem uevent
delay_off device power trigger
# cat delay_on
500
# cat /sys/class/leds/beaglebone:green:heartbeat/delay_off
500
```

Nếu LED có phần cứng timer on-chip, việc nhấp nháy diễn ra mà không cần ngắt CPU.

### I2C

I2C là một bus 2-wire tốc độ thấp đơn giản, phổ biến trên các board nhúng, thường được dùng để truy cập các ngoại vi không nằm trên SoC, chẳng hạn display controller, camera sensor, GPIO extender, v.v. Có một chuẩn liên quan gọi là **system management bus** (**SMBus**) có trên PC, được dùng để truy cập các cảm biến nhiệt độ và điện áp. SMBus là một tập con của I2C.

I2C là một giao thức master-slave, với master là một hoặc nhiều host controller trên SoC. Các slave có một địa chỉ 7-bit được nhà sản xuất gán (đọc data sheet), cho phép tới 128 node mỗi bus, nhưng 16 địa chỉ được dành riêng, nên thực tế chỉ cho phép 112 node. Master có thể khởi tạo các transaction đọc hoặc ghi với một trong các slave. Thường thì byte đầu tiên được dùng để chỉ định một thanh ghi trên slave, trong khi các byte còn lại là dữ liệu được đọc từ hoặc ghi vào thanh ghi đó.

Có một device node cho mỗi host controller; chẳng hạn, SoC này có bốn:

```
# ls -l /dev/i2c*
crw-rw---- 1 root i2c 89, 0 Jan 1 00:18 /dev/i2c-0
crw-rw---- 1 root i2c 89, 1 Jan 1 00:18 /dev/i2c-1
crw-rw---- 1 root i2c 89, 2 Jan 1 00:18 /dev/i2c-2
crw-rw---- 1 root i2c 89, 3 Jan 1 00:18 /dev/i2c-3
```

Giao diện thiết bị cung cấp một loạt lệnh `ioctl` để truy vấn host controller và gửi các lệnh `read` và `write` tới các slave I2C. Có một package tên `i2c-tools`, dùng giao diện này để cung cấp các công cụ command-line cơ bản để tương tác với các thiết bị I2C. Các công cụ như sau:

- `i2cdetect`: Liệt kê các I2C adapter và dò bus.
- `i2cdump`: Dump dữ liệu từ tất cả các thanh ghi của một ngoại vi I2C.
- `i2cget`: Đọc dữ liệu từ một slave I2C.
- `i2cset`: Ghi dữ liệu vào một slave I2C.

Package `i2c-tools` có sẵn trong Buildroot và Yocto Project, cũng như hầu hết các bản phân phối chính thống. Vì vậy, miễn là bạn biết địa chỉ và giao thức của slave, viết một chương trình user space để nói chuyện với thiết bị là đơn giản. Ví dụ sau cho thấy cách đọc bốn byte đầu tiên từ EEPROM AT24C512B, được gắn trên BeagleBone Black ở I2C bus 0. Nó có địa chỉ slave `0x50` (code cho việc này nằm trong `MELP/Chapter11/i2c-example`):

```
#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <linux/i2c-dev.h>
#define I2C_ADDRESS 0x50
int main(void)
{
   int f;
   int n;
   char buf[10];
   f = open("/dev/i2c-0", O_RDWR);
   /* Set the address of the i2c slave device */
   ioctl(f, I2C_SLAVE, I2C_ADDRESS);
   /* Set the 16-bit address to read from to 0 */
   buf[0] = 0; /* address byte 1 */
   buf[1] = 0; /* address byte 2 */
   n = write(f, buf, 2);
   /* Now read 4 bytes from that address */
   n = read(f, buf, 4);
   printf("0x%x 0x%x0 0x%x 0x%x\n",
   buf[0], buf[1], buf[2], buf[3]);
   close(f);
   return 0;
}
```

Chương trình này giống `i2cget` ngoại trừ việc địa chỉ và các byte thanh ghi được đọc đều được hardcode thay vì được truyền vào làm đối số. Chúng ta có thể dùng `i2cdetect` để khám phá địa chỉ của mọi ngoại vi trên một I2C bus. `i2cdetect` có thể để các ngoại vi I2C ở trạng thái xấu hoặc khóa bus, nên reboot sau khi dùng nó là một thói quen tốt. Data sheet của một ngoại vi cho chúng ta biết các thanh ghi ánh xạ tới cái gì. Với thông tin đó, chúng ta có thể dùng `i2cset` để ghi vào các thanh ghi của nó qua I2C. Các lệnh I2C này có thể dễ dàng được chuyển thành một thư viện các function C để giao tiếp với ngoại vi.

> **Lưu ý quan trọng**
>
> Có thêm thông tin về hiện thực I2C của Linux trong `Documentation/i2c/dev-interface`. Các host controller driver nằm trong `drivers/i2c/busses`.

Một giao thức truyền thông phổ biến khác là **Serial Peripheral Interface (SPI)**, dùng một bus 4-wire.

### SPI

Bus SPI tương tự I2C nhưng nhanh hơn nhiều, lên tới hàng chục MHz. Giao diện dùng bốn dây với các đường gửi và nhận riêng, cho phép nó hoạt động full duplex. Mỗi chip trên bus được chọn bằng một đường chip select chuyên dụng. Nó thường được dùng để kết nối tới các touchscreen sensor, display controller và các thiết bị serial NOR flash.

Giống I2C, nó là một giao thức master-slave, với hầu hết SoC hiện thực một hoặc nhiều master host controller. Có một SPI device driver chung, mà bạn có thể enable qua cấu hình kernel `CONFIG_SPI_SPIDEV`. Nó tạo một device node cho mỗi SPI controller, cho phép bạn truy cập các chip SPI từ user space. Các device node có tên `spidev[bus].[chip select]`:

```
# ls -l /dev/spi*
crw-rw---- 1 root root 153, 0 Jan 1 00:29 /dev/spidev1.0
```

Để xem ví dụ dùng giao diện `spidev`, vui lòng tham khảo code ví dụ trong `Documentation/spi`.

Cho đến giờ, các device driver chúng ta đã thấy đều có hỗ trợ upstream lâu năm trong Linux kernel. Vì các device driver này đều là chung (GPIO, LED, I2C và SPI), truy cập chúng từ user space là đơn giản. Đến một lúc nào đó, bạn sẽ gặp một phần cứng thiếu kernel device driver tương thích. Phần cứng đó có thể là trung tâm của sản phẩm của bạn (chẳng hạn Lidar, SDR, v.v.). Cũng có thể có một FPGA in-between SoC và phần cứng này. Trong những hoàn cảnh này, bạn có thể không còn cách nào khác ngoài viết (các) kernel module của riêng mình.

## Viết một kernel device driver

Cuối cùng, khi bạn đã dùng hết tất cả các lựa chọn user space trước đó, bạn sẽ thấy mình phải viết một device driver để truy cập một phần cứng gắn vào thiết bị của bạn. Character driver là linh hoạt nhất và nên đáp ứng 90% mọi nhu cầu của bạn; network driver áp dụng nếu bạn đang làm việc với một network interface và block driver dành cho mass storage. Nhiệm vụ viết một kernel driver rất phức tạp và nằm ngoài phạm vi cuốn sách này. Có một số tài liệu tham khảo ở cuối sẽ giúp bạn trên đường đi. Trong mục này, tôi muốn phác thảo các lựa chọn có sẵn để tương tác với một driver – một chủ đề thường không được đề cập – và cho bạn thấy bộ khung trơ trụi của một character device driver.

### Thiết kế giao diện character driver

Giao diện character driver chính dựa trên một dòng byte, như bạn có với một serial port. Tuy nhiên, nhiều thiết bị không khớp với mô tả này: chẳng hạn một controller cho cánh tay robot cần các function để di chuyển và xoay từng khớp. May mắn là có những cách khác để giao tiếp với device driver ngoài `read` và `write`:

- `ioctl`: Function `ioctl` cho phép bạn truyền hai đối số cho driver, và chúng có thể mang bất kỳ ý nghĩa nào bạn muốn. Theo quy ước, đối số đầu tiên là một lệnh, chọn một trong vài function trong driver, trong khi đối số thứ hai là một con trỏ tới một cấu trúc, đóng vai trò container cho các tham số input và output. Đây là một tấm canvas trống cho phép bạn thiết kế bất kỳ giao diện chương trình nào bạn thích. Nó khá phổ biến khi driver và application gắn kết chặt chẽ và được viết bởi cùng một nhóm. Tuy nhiên, `ioctl` đã bị deprecated trong kernel, và bạn sẽ thấy khó để bất kỳ driver nào có cách dùng mới của `ioctl` được chấp nhận upstream. Các kernel maintainer không thích `ioctl` vì nó làm code kernel và code application phụ thuộc lẫn nhau quá mức, và khó giữ cả hai đồng bộ qua các phiên bản kernel và kiến trúc.
- `sysfs`: Đây là cách được ưa chuộng để làm mọi việc hiện nay, với một ví dụ tốt là giao diện GPIO được mô tả trước đó. Ưu điểm là nó phần nào self-documenting, miễn là bạn chọn tên mô tả cho các file. Nó cũng có thể script được vì nội dung file thường là chuỗi văn bản. Mặt khác, yêu cầu mỗi file chỉ chứa một giá trị khiến khó đạt được atomicity nếu bạn cần thay đổi nhiều hơn một giá trị cùng lúc. Ngược lại, `ioctl` truyền tất cả đối số của nó trong một cấu trúc, trong một lời gọi function duy nhất.
- `mmap`: Bạn có thể truy cập trực tiếp các kernel buffer và các thanh ghi phần cứng bằng cách map bộ nhớ kernel vào user space, nhờ đó bỏ qua kernel. Bạn có thể vẫn cần một ít code kernel để xử lý interrupt và DMA. Có một subsystem đóng gói ý tưởng này, gọi là `uio`, viết tắt của **user I/O**. Có thêm tài liệu trong `Documentation/DocBook/uio-howto`, và có các driver ví dụ trong `drivers/uio`.
- `sigio`: Bạn có thể gửi một signal từ một driver bằng kernel function tên `kill_fasync()` để thông báo cho application về một sự kiện, chẳng hạn input đã sẵn sàng hoặc một interrupt được nhận. Theo quy ước, signal tên `SIGIO` được dùng, nhưng có thể là bất kỳ signal nào. Bạn có thể xem một số ví dụ trong UIO driver, `drivers/uio/uio.c`, và trong RTC driver, `drivers/char/rtc.c`. Vấn đề chính là khó viết các signal handler đáng tin cậy trong user space, và vì vậy nó vẫn là một cơ chế little-used.
- `debugfs`: Đây là một pseudo filesystem khác biểu diễn dữ liệu kernel dưới dạng file và thư mục, tương tự `proc` và `sysfs`. Khác biệt chính là `debugfs` không được chứa thông tin cần cho hoạt động bình thường của hệ thống; nó chỉ dành cho thông tin debug và trace. Nó được mount bằng `mount -t debugfs debug /sys/kernel/debug`. Có một mô tả tốt về `debugfs` trong tài liệu kernel `Documentation/filesystems/debugfs.txt`.
- `proc`: Filesystem `proc` đã bị deprecated cho mọi code mới trừ khi nó liên quan tới process, vốn là mục đích ban đầu dự định cho filesystem này. Tuy nhiên, bạn có thể dùng `proc` để công bố bất kỳ thông tin nào bạn chọn. Và, khác với `sysfs` và `debugfs`, nó có sẵn cho các module non-GPL.
- `netlink`: Đây là một họ giao thức socket. `AF_NETLINK` tạo một socket liên kết kernel space với user space. Ban đầu nó được tạo ra để các công cụ mạng có thể giao tiếp với code mạng của Linux để truy cập routing table và các chi tiết khác. Nó cũng được `udev` dùng để chuyển sự kiện từ kernel tới daemon `udev`. Nó rất hiếm khi được dùng trong các device driver thông thường.

Có nhiều ví dụ về tất cả các filesystem trên trong source code kernel, và bạn có thể thiết kế các giao diện thực sự thú vị cho code driver của mình. Quy tắc phổ quát duy nhất là *nguyên tắc ít gây ngạc nhiên nhất*. Nói cách khác, những người viết application dùng driver của bạn nên thấy mọi thứ hoạt động theo một cách logic, không có điểm kỳ quặc hay lạ lùng nào.

### Cấu tạo của một device driver

Đã đến lúc gom một số sợi chỉ lại với nhau bằng cách xem code của một device driver đơn giản.

Đây là phần đầu của một device driver tên `dummy`, tạo bốn device có thể được truy cập qua `/dev/dummy0` tới `/dev/dummy3`:

```
#include <linux/kernel.h>
#include <linux/module.h>
#include <linux/init.h>
#include <linux/fs.h>
#include <linux/device.h>
#define DEVICE_NAME "dummy"
#define MAJOR_NUM 42
#define NUM_DEVICES 4
static struct class *dummy_class;
```

Tiếp theo, chúng ta sẽ định nghĩa các function `dummy_open()`, `dummy_release()`, `dummy_read()` và `dummy_write()` cho giao diện character device:

```
static int dummy_open(struct inode *inode, struct file *file)
{
   pr_info("%s\n", __func__);
   return 0;
}
static int dummy_release(struct inode *inode, struct file *file)
{
   pr_info("%s\n", __func__);
   return 0;
}
static ssize_t dummy_read(struct file *file,
 char *buffer, size_t length, loff_t * offset)
{
   pr_info("%s %u\n", __func__, length);
   return 0;
}
static ssize_t dummy_write(struct file *file,
 const char *buffer, size_t length, loff_t * offset)
{
   pr_info("%s %u\n", __func__, length);
   return length;
}
```

Sau đó, chúng ta cần khởi tạo một cấu trúc `file_operations` và định nghĩa các function `dummy_init()` và `dummy_exit()`, được gọi khi driver được nạp và gỡ:

```
struct file_operations dummy_fops = {
   .owner = THIS_MODULE,
   .open = dummy_open,
   .release = dummy_release,
   .read = dummy_read,
   .write = dummy_write,
};
int __init dummy_init(void)
{
   int ret;
   int i;
   printk("Dummy loaded\n");
   ret = register_chrdev(MAJOR_NUM, DEVICE_NAME, &dummy_fops);
   if (ret != 0)
      return ret;
   dummy_class = class_create(THIS_MODULE, DEVICE_NAME);
   for (i = 0; i < NUM_DEVICES; i++) {
      device_create(dummy_class, NULL,
                    MKDEV(MAJOR_NUM, i), NULL, "dummy%d", i);
   }
   return 0;
}
void __exit dummy_exit(void)
{
   int i;
   for (i = 0; i < NUM_DEVICES; i++) {
      device_destroy(dummy_class, MKDEV(MAJOR_NUM, i));
   }
   class_destroy(dummy_class);
   unregister_chrdev(MAJOR_NUM, DEVICE_NAME);
   printk("Dummy unloaded\n");
}
```

Ở cuối code, các macro tên `module_init` và `module_exit` chỉ định các function được gọi khi module được nạp và gỡ:

```
module_init(dummy_init);
module_exit(dummy_exit);
```

Ba macro kết thúc tên `MODULE_*` thêm một số thông tin cơ bản về module:

```
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Chris Simmonds");
MODULE_DESCRIPTION("A dummy driver");
```

Thông tin này có thể được truy xuất từ kernel module đã biên dịch bằng lệnh `modinfo`. Source code đầy đủ của driver có thể được tìm thấy trong thư mục `MELP/Chapter11/dummy-driver`, đi kèm archive code của sách.

Khi module được nạp, function `dummy_init()` được gọi. Bạn có thể thấy thời điểm nó trở thành một character device khi nó gọi `register_chrdev`, truyền một con trỏ tới `struct file_operations`, chứa các con trỏ tới bốn function mà driver hiện thực. Dù `register_chrdev` cho kernel biết có một driver với major number `42`, nó không nói gì về class của driver, và vì vậy nó sẽ không tạo một mục trong `/sys/class`.

Không có một mục trong `/sys/class`, device manager không thể tạo device node. Vì vậy, vài dòng code tiếp theo tạo một device class, `dummy`, và bốn device thuộc class đó tên `dummy0` tới `dummy3`. Kết quả là thư mục `/sys/class/dummy` được tạo khi driver được khởi tạo, chứa các thư mục con `dummy0` tới `dummy3`. Mỗi thư mục con chứa một file, `dev`, chứa major number và minor number của device. Đây là tất cả những gì một device manager cần để tạo device node: `/dev/dummy0` tới `/dev/dummy3`.

Function `dummy_exit()` phải giải phóng các tài nguyên mà `dummy_init()` đã chiếm, ở đây nghĩa là giải phóng device class và major number.

Các file operation của driver này được hiện thực bởi `dummy_open()`, `dummy_read()`, `dummy_write()` và `dummy_release()`, và chúng được gọi khi một chương trình user space gọi lần lượt `open(2)`, `read(2)`, `write(2)` và `close(2)`. Chúng chỉ in một kernel message để bạn có thể thấy chúng đã được gọi. Bạn có thể minh họa điều này từ command line bằng lệnh `echo`:

```
# echo hello > /dev/dummy0
dummy_open
dummy_write 6
dummy_release
```

Trong trường hợp này, các message xuất hiện vì tôi đã đăng nhập vào console, và kernel message được in ra console theo mặc định. Nếu bạn không đăng nhập vào console, bạn vẫn có thể xem kernel message bằng lệnh `dmesg`.

Source code đầy đủ của driver này chưa tới 100 dòng, nhưng đủ để minh họa mối liên kết giữa một device node và code driver hoạt động thế nào; device class được tạo ra như thế nào, cho phép một device manager tự động tạo device node khi driver được nạp; và dữ liệu được di chuyển giữa user space và kernel space như thế nào. Tiếp theo, bạn cần build nó.

### Biên dịch kernel module

Tại thời điểm này, bạn có một ít code driver mà bạn muốn biên dịch và test trên hệ thống target. Bạn có thể sao chép nó vào cây source kernel và sửa các makefile để build nó, hoặc bạn có thể biên dịch nó dưới dạng module out of tree. Hãy bắt đầu bằng việc build out of tree.

Bạn sẽ cần một makefile đơn giản dùng kernel build system để làm tất cả phần việc nặng nhọc:

```
LINUXDIR := $(HOME)/MELP/build/linux
obj-m := dummy.o
all:
     make ARCH=arm CROSS_COMPILE=arm-cortex_a8-linux-gnueabihf- \
     -C $(LINUXDIR) M=$(shell pwd)
clean:
     make -C $(LINUXDIR) M=$(shell pwd) clean
```

Đặt `LINUXDIR` thành thư mục kernel cho thiết bị target mà bạn sẽ chạy module trên đó. Code `obj-m := dummy.o` sẽ gọi build rule của kernel để lấy source file, `dummy.c`, và tạo một kernel module, `dummy.ko`. Tôi sẽ chỉ cho bạn cách nạp kernel module trong mục tiếp theo.

> **Lưu ý quan trọng**
>
> Kernel module không tương thích nhị phân giữa các bản phát hành và cấu hình kernel: module sẽ chỉ nạp được trên kernel mà nó được biên dịch cùng.

Nếu bạn muốn build một driver trong cây source kernel, quy trình khá đơn giản. Chọn một thư mục phù hợp với loại driver bạn có. Driver này là một character device cơ bản, nên tôi sẽ đặt `dummy.c` trong `drivers/char`. Sau đó, sửa makefile trong thư mục đó, và thêm một dòng để build driver vô điều kiện dưới dạng module, như sau:

```
obj-m += dummy.o
```

Ngoài ra, bạn có thể thêm dòng sau để build nó vô điều kiện dưới dạng builtin:

```
obj-y += dummy.o
```

Nếu bạn muốn làm cho driver thành tùy chọn, bạn có thể thêm một tùy chọn `menu` vào file `Kconfig` và làm cho việc biên dịch phụ thuộc vào tùy chọn cấu hình, như tôi đã mô tả trong [*Chương 4*](ch04_configuring_and_building_the_kernel.vi.md), *Cấu hình và build kernel*, trong mục *Tìm hiểu cấu hình kernel*.

### Nạp kernel module

Bạn có thể nạp, gỡ và liệt kê module bằng các lệnh đơn giản lần lượt là `insmod`, `lsmod` và `rmmod`. Ở đây, chúng đang nạp driver `dummy`:

```
# insmod /lib/modules/4.8.12-yocto-standard/kernel/drivers/dummy.ko
# lsmod
 Tainted: G
dummy 2062 0 - Live 0xbf004000 (O)
# rmmod dummy
```

Nếu module được đặt trong một thư mục con trong `/lib/modules/<kernel release>`, bạn có thể tạo một **modules dependency database** bằng lệnh `depmod -a`, như sau:

```
# depmod -a
# ls /lib/modules/4.8.12-yocto-standard
kernel   modules.alias   modules.dep   modules.symbols
```

Thông tin trong các file `modules.*` được lệnh `modprobe` dùng để định vị một module theo tên thay vì đường dẫn đầy đủ. `modprobe` có nhiều tính năng khác, tất cả đều được mô tả trong manual page `modprobe(8)`.

Giờ chúng ta đã viết và nạp dummy kernel module, làm sao để nó nói chuyện với một phần cứng thực? Chúng ta cần bind driver với phần cứng đó hoặc qua device tree hoặc qua platform data. Khám phá phần cứng và liên kết phần cứng đó với một device driver là chủ đề của mục tiếp theo.

## Khám phá cấu hình phần cứng

Dummy driver minh họa cấu trúc của một device driver, nhưng nó thiếu tương tác với phần cứng thật vì nó chỉ thao tác các cấu trúc bộ nhớ. Device driver thường được viết để tương tác với phần cứng. Một phần của việc đó là có khả năng khám phá phần cứng ngay từ đầu, nhớ rằng nó có thể ở các địa chỉ khác nhau trong các cấu hình khác nhau.

Trong một số trường hợp, bản thân phần cứng cung cấp thông tin. Các thiết bị trên một bus có thể khám phá được như PCI hay USB có một chế độ truy vấn, trả về các yêu cầu tài nguyên và một định danh duy nhất. Kernel so khớp định danh và có thể cả các đặc tính khác với các device driver và ghép chúng với nhau.

Tuy nhiên, hầu hết các khối phần cứng trên một board nhúng không có định danh như vậy. Bạn phải tự cung cấp thông tin dưới dạng một **device tree** hoặc dưới dạng các cấu trúc C gọi là **platform data**.

Trong driver model tiêu chuẩn của Linux, device driver tự đăng ký với subsystem thích hợp: PCI, USB, open firmware (device tree), platform device, v.v. Việc đăng ký bao gồm một định danh và một callback function, gọi là function `probe`, được gọi nếu có sự khớp giữa ID của phần cứng và ID của driver. Với PCI và USB, ID dựa trên vendor ID và product ID của thiết bị; với device tree và platform device, nó là một cái tên (một chuỗi văn bản).

### Device tree

Tôi đã giới thiệu cho bạn về device tree trong [*Chương 3*](ch03_all_about_bootloaders.vi.md), *Tất cả về bootloader*. Ở đây, tôi muốn cho bạn thấy các Linux device driver móc nối với thông tin này như thế nào.

Làm ví dụ, tôi sẽ dùng board Arm Versatile, `arch/arm/boot/dts/versatile-ab.dts`, trong đó Ethernet adapter được định nghĩa ở đây:

```
net@10010000 {
   compatible = "smsc,lan91c111";
   reg = <0x10010000 0x10000>;
   interrupts = <25>;
};
```

Hãy đặc biệt chú ý tới thuộc tính `compatible` của node này. Giá trị chuỗi này sẽ xuất hiện lại sau trong source code của Ethernet adapter. Chúng ta sẽ học thêm về device tree trong [*Chương 12*](ch12_prototyping_with_breakout_boards.vi.md), *Làm prototype với breakout board*.

### Platform data

Khi không có hỗ trợ device tree, có một phương pháp dự phòng để mô tả phần cứng bằng các cấu trúc C, gọi là platform data.

Mỗi phần cứng được mô tả bởi `struct platform_device`, có một tên và một con trỏ tới một mảng tài nguyên. Loại của tài nguyên được xác định bởi các flag, bao gồm:

- `IORESOURCE_MEM`: Đây là địa chỉ vật lý của một vùng nhớ.
- `IORESOURCE_IO`: Đây là địa chỉ vật lý hoặc số port của các thanh ghi I/O.
- `IORESOURCE_IRQ`: Đây là interrupt number.

Đây là một ví dụ về platform data cho một Ethernet controller lấy từ `arch/arm/mach-versatile/core.c`, đã được biên tập lại cho rõ ràng:

```
#define VERSATILE_ETH_BASE 0x10010000
#define IRQ_ETH 25
static struct resource smc91x_resources[] = {
 [0] = {
   .start = VERSATILE_ETH_BASE,
   .end = VERSATILE_ETH_BASE + SZ_64K - 1,
   .flags = IORESOURCE_MEM,
},
 [1] = {
   .start = IRQ_ETH,
   .end = IRQ_ETH,
   .flags = IORESOURCE_IRQ,
},
};
static struct platform_device smc91x_device = {
  .name = "smc91x",
  .id = 0,
  .num_resources = ARRAY_SIZE(smc91x_resources),
  .resource = smc91x_resources,
};
```

Nó có một vùng nhớ 64 KB và một interrupt. Platform data phải được đăng ký với kernel, thường là khi board được khởi tạo:

```
void __init versatile_init(void)
{
   platform_device_register(&versatile_flash_device);
   platform_device_register(&versatile_i2c_device);
   platform_device_register(&smc91x_device);
   […]
```

Platform data được thể hiện ở đây tương đương về chức năng với device tree source trước đó, ngoại trừ trường `name`, đóng vai trò thay cho thuộc tính `compatible`.

### Liên kết phần cứng với device driver

Trong mục trước, bạn đã thấy một Ethernet adapter được mô tả bằng device tree và bằng platform data như thế nào. Code driver tương ứng nằm trong `drivers/net/ethernet/smsc/smc91x.c`, và nó hoạt động với cả device tree lẫn platform data. Đây là code khởi tạo, một lần nữa đã được biên tập lại cho rõ ràng:

```
static const struct of_device_id smc91x_match[] = {
   { .compatible = "smsc,lan91c94", },
   { .compatible = "smsc,lan91c111", },
   {},
};
MODULE_DEVICE_TABLE(of, smc91x_match);
static struct platform_driver smc_driver = {
   .probe = smc_drv_probe,
   .remove = smc_drv_remove,
   .driver = {
      .name = "smc91x",
      .of_match_table = of_match_ptr(smc91x_match),
   },
};
static int __init smc_driver_init(void)
{
   return platform_driver_register(&smc_driver);
}
static void __exit smc_driver_exit(void)
{
   platform_driver_unregister(&smc_driver);
}
module_init(smc_driver_init);
module_exit(smc_driver_exit);
```

Khi driver được khởi tạo, nó gọi `platform_driver_register()`, trỏ tới `struct platform_driver`, trong đó có một callback tới một function `probe`, một tên driver, `smc91x`, và một con trỏ tới `struct of_device_id`.

Nếu driver này được cấu hình bởi device tree, kernel sẽ tìm sự khớp giữa thuộc tính `compatible` trong node device tree và chuỗi được phần tử compatible của cấu trúc trỏ tới. Với mỗi lần khớp, nó gọi function `probe`.

Mặt khác, nếu nó được cấu hình qua platform data, function `probe` sẽ được gọi cho mỗi lần khớp với chuỗi được `driver.name` trỏ tới.

Function `probe` trích thông tin về giao diện:

```
static int smc_drv_probe(struct platform_device *pdev)
{
   struct smc91x_platdata *pd = dev_get_platdata(&pdev->dev);
   const struct of_device_id *match = NULL;
   struct resource *res, *ires;
   int irq;
   res = platform_get_resource(pdev, IORESOURCE_MEM, 0);
   ires platform_get_resource(pdev, IORESOURCE_IRQ, 0);
   […]
   addr = ioremap(res->start, SMC_IO_EXTENT);
   irq = ires->start;
   […]
}
```

Các lời gọi tới `platform_get_resource()` trích thông tin bộ nhớ và `irq` từ device tree hoặc platform data. Việc map bộ nhớ và cài interrupt handler là việc của driver. Tham số thứ ba, bằng không trong cả hai trường hợp trên, có tác dụng nếu có nhiều hơn một tài nguyên thuộc loại cụ thể đó.

Device tree cho phép bạn cấu hình nhiều hơn chỉ các dải bộ nhớ và interrupt cơ bản. Có một đoạn code trong function `probe` trích các tham số tùy chọn từ device tree. Trong đoạn này, nó lấy thuộc tính `register-io-width`:

```
match = of_match_device(of_match_ptr(smc91x_match), &pdev->dev);
if (match) {
   struct device_node *np = pdev->dev.of_node;
   u32 val;
   […]
   of_property_read_u32(np, "reg-io-width", &val);
   […]
}
```

Với hầu hết driver, các binding cụ thể được ghi tài liệu trong `Documentation/devicetree/bindings`. Với driver cụ thể này, thông tin nằm trong `Documentation/devicetree/bindings/net/smsc911x.txt`.

Điều chính cần nhớ ở đây là driver nên đăng ký một function `probe` và đủ thông tin để kernel gọi `probe`, khi nó tìm thấy sự khớp với phần cứng mà nó biết. Mối liên kết giữa phần cứng được device tree mô tả và device driver được thực hiện qua thuộc tính `compatible`. Mối liên kết giữa platform data và một driver được thực hiện qua tên.

## Tóm tắt

Device driver có nhiệm vụ xử lý các thiết bị, thường là phần cứng vật lý nhưng đôi khi là các giao diện ảo, và trình bày chúng cho user space theo một cách nhất quán và hữu ích. Linux device driver thuộc ba nhóm lớn: character, block và network. Trong ba nhóm, giao diện character driver là linh hoạt nhất và vì vậy, phổ biến nhất. Linux driver khớp vào một framework gọi là driver model, được đưa ra qua `sysfs`. Gần như toàn bộ trạng thái của các thiết bị và driver đều có thể thấy trong `/sys`.

Mỗi hệ thống nhúng có tập giao diện phần cứng và yêu cầu riêng độc nhất. Linux cung cấp driver cho hầu hết các giao diện tiêu chuẩn, và bằng cách chọn đúng cấu hình kernel, bạn có thể có một board target hoạt động rất nhanh. Điều này để lại cho bạn các component non-standard, mà bạn sẽ phải tự thêm hỗ trợ thiết bị cho chúng.

Trong một số trường hợp, bạn có thể né vấn đề bằng cách dùng các driver chung cho GPIO, I2C, v.v., và viết code user space để làm công việc. Tôi khuyên đây là điểm khởi đầu, vì nó cho bạn cơ hội làm quen với phần cứng mà không cần viết code kernel. Viết kernel driver không đặc biệt khó, nhưng bạn cần code cẩn thận để không làm tổn hại sự ổn định của hệ thống.

Cho đến giờ, tôi đã nói về việc viết code kernel driver; nếu bạn đi theo con đường này, chắc chắn bạn sẽ muốn biết cách kiểm tra nó có hoạt động đúng không và phát hiện mọi bug. Tôi sẽ đề cập chủ đề đó trong [*Chương 19*](ch19_debugging_with_gdb.vi.md), *Debug với GDB*.

[*Chương 13*](ch13_starting_up_the_init_program.vi.md), *Khởi động – Chương trình init*, hoàn toàn nói về việc khởi tạo user space và các lựa chọn khác nhau bạn có cho chương trình `init`, từ BusyBox đơn giản tới các hệ thống phức tạp hơn.

## Đọc thêm

Các tài liệu sau chứa thêm thông tin về các chủ đề đã được giới thiệu trong chương này:

- *Linux Kernel Development*, *3rd Edition*, của Robert Love
- *Linux Weekly News* (Tin tức Linux hằng tuần): [https://lwn.net/Kernel](https://lwn.net/Kernel)
- *Async IO on Linux: select, poll, and epoll,* của Julia Evans: [https://jvns.ca/blog/2017/06/03/async-io-on-linux--select--poll--and-epoll](https://jvns.ca/blog/2017/06/03/async-io-on-linux--select--poll--and-epoll)
- *Essential Linux Device Drivers,* *1st Edition*, của Sreekrishnan Venkateswaran
