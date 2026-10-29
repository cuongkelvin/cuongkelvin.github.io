# Chương 11: Giao tiếp với device driver (Interfacing with Device Drivers)

Kernel device driver là cơ chế mà qua đó phần cứng bên dưới được trình bày cho phần còn lại của hệ thống. Là một developer hệ thống nhúng, bạn cần biết các device driver này khớp vào kiến trúc tổng thể như thế nào và cách truy cập chúng từ các chương trình user space. Hệ thống của bạn có lẽ sẽ có một số phần cứng mới lạ và bạn sẽ phải tìm ra cách truy cập chúng. Trong nhiều trường hợp, bạn sẽ thấy có sẵn device driver cho mình và bạn có thể đạt được mọi thứ mình muốn mà không cần viết bất kỳ code kernel nào. Ví dụ, bạn có thể thao tác các chân GPIO và LED bằng các file trong `sysfs`, và có các thư viện bạn có thể dùng để truy cập các bus serial, bao gồm SPI (Serial Peripheral Interface) và I2C (Inter-Integrated Circuit).

Có nhiều nơi để tìm hiểu cách viết một device driver, nhưng ít nơi cho bạn biết vì sao bạn muốn viết và các lựa chọn bạn có khi làm vậy. Đây là điều tôi muốn đề cập ở đây. Tuy nhiên, hãy nhớ rằng đây không phải là cuốn sách chuyên về viết kernel device driver, và thông tin ở đây nhằm giúp bạn định hướng trong lĩnh vực này chứ không nhất thiết là định cư ở đó. Có nhiều sách và bài blog tốt sẽ giúp bạn viết device driver, một số được liệt kê ở cuối chương này trong mục Tìm hiểu thêm.

Trong chương này, chúng ta sẽ đề cập các chủ đề sau:

- Vai trò của device driver

- Character device

- Block device

- Network device

- Tìm hiểu về driver lúc runtime

- Tìm đúng device driver

- Device driver trong user space

- Viết một kernel device driver

- Khám phá cấu hình phần cứng

## Yêu cầu kỹ thuật

Để làm theo các ví dụ, hãy bảo đảm bạn có những thứ sau:

- Một hệ thống host Linux-based

- Một đầu đọc thẻ microSD và thẻ

- Một BeaglePlay

- Một bộ nguồn USB-C 5V có khả năng cấp 3A

- Một cáp Ethernet và router có cổng trống để kết nối mạng

Code dùng trong chương này có trong thư mục của chương trong GitHub repository của cuốn sách: `https://github.com/PacktPublishing/Mastering-Embedded-Linux-Development/tree/main/Chapter11`.

## Vai trò của device driver

Như tôi đã nhắc trong Chương 4, một trong các chức năng của kernel là bao bọc nhiều giao diện phần cứng của một hệ thống máy tính và trình bày chúng một cách nhất quán cho các chương trình user space. Kernel có các framework được thiết kế để giúp dễ dàng viết một device driver, đoạn code làm trung gian giữa kernel ở trên và phần cứng ở dưới. Một device driver có thể được viết để điều khiển các thiết bị vật lý như UART hoặc MMC controller, hoặc nó có thể đại diện cho một thiết bị ảo như null device (`/dev/null`) hoặc một RAMdisk. Một driver có thể điều khiển nhiều thiết bị cùng loại.

Code kernel device driver chạy ở mức đặc quyền cao, giống như phần còn lại của kernel. Nó có toàn quyền truy cập không gian địa chỉ của bộ xử lý và các thanh ghi phần cứng. Nó có thể xử lý ngắt và truyền DMA. Nó cũng có thể dùng hạ tầng kernel tinh vi cho đồng bộ hóa và quản lý bộ nhớ. Tuy nhiên, bạn nên biết rằng có mặt trái của điều này; nếu có điều gì đó sai trong một driver có bug, nó có thể sai thật sự và làm sập hệ thống.

Do đó, có một nguyên tắc là device driver nên đơn giản nhất có thể, chỉ cung cấp thông tin cho các ứng dụng (nơi các quyết định thực sự được đưa ra). Bạn thường nghe điều này được diễn đạt là no policy in the kernel. User space có trách nhiệm đặt chính sách chi phối hành vi tổng thể của hệ thống. Ví dụ, nạp kernel module khi có sự kiện bên ngoài, như cắm một thiết bị USB mới, là trách nhiệm của chương trình user space `udev`, không phải của kernel. Kernel chỉ cung cấp một cách để nạp kernel module.

Trong Linux, có ba loại device driver chính:

- Character: Dành cho I/O không buffer với nhiều chức năng phong phú và một lớp mỏng giữa code ứng dụng và driver. Đây là lựa chọn đầu tiên khi triển khai các device driver tùy chỉnh.

- Block: Loại này có một giao diện được may đo cho block I/O tới và từ các thiết bị lưu trữ dung lượng lớn. Có một lớp buffer dày được thiết kế để làm việc đọc và ghi đĩa nhanh nhất có thể, điều khiến nó không phù hợp cho bất kỳ việc gì khác.

- Network: Loại này tương tự block device nhưng được dùng để truyền và nhận gói tin mạng thay vì block đĩa.

Cũng có một loại thứ tư tự trình bày dưới dạng một nhóm file trong một trong các pseudo filesystem. Ví dụ, bạn có thể truy cập driver GPIO qua một nhóm file trong `/sys/class/gpio`, như tôi sẽ mô tả ở phần sau của chương này. Hãy bắt đầu bằng việc xem chi tiết hơn ba loại thiết bị cơ bản này.

## Character device

Character device được nhận diện trong user space bằng một file đặc biệt gọi là device node. Tên file này được ánh xạ tới một device driver bằng major number và minor number gắn với nó. Nói chung, major number ánh xạ device node tới một device driver cụ thể, còn minor number cho driver biết giao diện nào đang được truy cập. Ví dụ, device node của cổng serial đầu tiên trên Arm Versatile PB có tên `/dev/ttyAMA0` và có major number là `204` và minor number là `64`. Device node của cổng serial thứ hai có cùng major number nhưng minor number là `65`. Chúng ta có thể thấy các số này cho cả bốn cổng serial trong danh sách thư mục:

```
# ls -l /dev/ttyAMA*
crw-rw---- 1 root root 204, 64    Jan  1 1970 /dev/ttyAMA0
crw-rw---- 1 root root 204, 65    Jan  1 1970 /dev/ttyAMA1
crw-rw---- 1 root root 204, 66    Jan  1 1970 /dev/ttyAMA2
crw-rw---- 1 root root 204, 67    Jan  1 1970 /dev/ttyAMA3
```

Danh sách các major number và minor number chuẩn có thể được tìm thấy trong tài liệu kernel tại `Documentation/admin-guide/devices.txt`. Danh sách này không được cập nhật thường xuyên và không bao gồm thiết bị `ttyAMA` được mô tả trong đoạn trước. Tuy vậy, nếu xem source code kernel trong `drivers/tty/serial/amba-pl011.c`, bạn sẽ thấy nơi các major number và minor number được khai báo:

```
#define SERIAL_AMBA_MAJOR 204
#define SERIAL_AMBA_MINOR 64
```

Khi có nhiều hơn một instance của một thiết bị, như với driver `ttyAMA`, quy ước đặt tên device node là lấy một tên gốc (`ttyAMA`) và nối thêm số instance từ `0` đến `3`.

Như tôi đã nhắc trong Chương 5, device node có thể được tạo theo nhiều cách:

- `devtmpfs`: Device node được tạo khi device driver đăng ký một giao diện thiết bị mới, dùng một tên gốc do driver cung cấp (`ttyAMA`) và một số instance.

- `udev` hoặc `mdev` (không có `devtmpfs`): Về bản chất giống `devtmpfs`, ngoại trừ việc một chương trình daemon user space phải trích xuất tên thiết bị từ `sysfs` và tạo node.

- `mknod`: Nếu bạn dùng device node tĩnh, chúng được tạo thủ công bằng `mknod`.

Có thể từ các con số tôi dùng ở đây, bạn có ấn tượng rằng cả major number và minor number đều là số 8-bit trong khoảng từ 0 đến 255. Thực ra, major number dài 12 bit, cho các major number hợp lệ từ 1 đến 4,095, và minor number dài 20 bit, từ 0 đến 1,048,575.

Khi bạn mở một character device node, kernel kiểm tra xem major number và minor number có nằm trong một dải được một character device driver đăng ký không. Nếu có, nó chuyển lời gọi cho driver; nếu không, lời gọi `open(2)` thất bại. Device driver có thể trích xuất minor number để biết cần dùng giao diện phần cứng nào.

Để viết một chương trình truy cập một device driver, bạn cần có một số hiểu biết về cách nó hoạt động. Nói cách khác, một device driver không giống một file: những gì bạn làm với nó thay đổi trạng thái của thiết bị. Một ví dụ đơn giản là bộ sinh số giả ngẫu nhiên `urandom`, trả về các byte dữ liệu ngẫu nhiên mỗi lần bạn đọc nó.

Sau đây là một chương trình làm đúng điều đó:

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

Bạn có thể tìm thấy source code đầy đủ và một recipe BitBake cho chương trình này trong thư mục `MELD/Chapter11/meta-device-drivers/recipes-local/read-urandom`.

Điều hay của driver model Unix là một khi biết có một thiết bị tên là `urandom`, thì mỗi lần đọc từ nó, nó trả về một tập dữ liệu giả ngẫu nhiên mới, vì vậy chúng ta không cần biết gì thêm về nó. Chúng ta chỉ cần dùng các hàm chuẩn như `open(2)`, `read(2)` và `close(2)`.

MẸO

Bạn có thể dùng các hàm stream I/O được gọi là `fopen(3)`, `fread(3)` và `fclose(3)` thay thế, nhưng việc buffer ngầm trong các hàm này thường gây ra hành vi không mong đợi. Ví dụ, `fwrite(3)` thường chỉ ghi vào buffer user space, không ghi vào thiết bị. Bạn cần gọi `fflush(3)` để buộc buffer được ghi ra. Vì vậy, tốt nhất là không dùng các hàm stream I/O khi gọi device driver.

Hầu hết các device driver dùng giao diện character. Các thiết bị lưu trữ dung lượng lớn là một ngoại lệ đáng chú ý. Đọc và ghi đĩa cần một giao diện block để có tốc độ tối đa.

## Block device

Block device cũng gắn với một device node có major number và minor number.

MẸO

Mặc dù character device và block device đều được nhận diện bằng major number và minor number, chúng nằm trong các namespace khác nhau. Một character driver với major number là 4 hoàn toàn không liên quan đến một block driver với major number là 4.

Với block device, major number được dùng để nhận diện device driver, còn minor number được dùng để nhận diện phân vùng. Hãy xem driver MMC trên BeaglePlay:

```
# ls -l /dev/mmcblk*
brw-rw---- 1 root disk 179,   0 Aug  7 13:25 /dev/mmcblk0
brw-rw---- 1 root disk 179, 256 Aug  7 13:25 /dev/mmcblk0boot0
brw-rw---- 1 root disk 179, 512 Aug  7 13:25 /dev/mmcblk0boot1
brw-rw---- 1 root disk 179,   1 Aug  7 13:25 /dev/mmcblk0p1
brw-rw---- 1 root disk 179,   2 Aug  7 13:25 /dev/mmcblk0p2
brw-rw---- 1 root disk 236,   0 Aug  7 13:25 /dev/mmcblk0rpmb
brw-rw---- 1 root disk 179, 768 Feb  4 09:42 /dev/mmcblk1
brw-rw---- 1 root disk 179, 769 Feb  4 09:42 /dev/mmcblk1p1
brw-rw---- 1 root disk 179, 770 Feb  4 09:42 /dev/mmcblk1p2
```

Ở đây, `mmcblk0` là chip eMMC, có hai phân vùng, và `mmcblk1` là khe thẻ microSD, có một thẻ cũng với hai phân vùng. Major number của MMC block driver là `179` (bạn có thể tra trong `devices.txt`). Các minor number được dùng theo dải để nhận diện các thiết bị MMC vật lý khác nhau và các phân vùng của phương tiện lưu trữ trên thiết bị đó. Trong trường hợp driver MMC, các dải là tám minor number cho mỗi thiết bị: các minor number từ `0` đến `7` dành cho thiết bị thứ nhất, các số từ `8` đến `15` dành cho thiết bị thứ hai, v.v. Trong mỗi dải, minor number đầu tiên đại diện cho toàn bộ thiết bị dưới dạng sector thô, và các số còn lại đại diện cho tối đa bảy phân vùng. Trên chip eMMC của BeaglePlay, có hai vùng nhớ 4 MB được dành riêng cho bootloader sử dụng. Chúng được đại diện bằng hai thiết bị được gọi là `mmcblk0boot0` và `mmcblk0boot1`, và có minor number lần lượt là `256` và `512`.

Một ví dụ khác, có lẽ bạn đã biết về driver đĩa SCSI được gọi là `sd`, được dùng để điều khiển nhiều loại đĩa dùng tập lệnh SCSI, bao gồm SCSI, SATA, USB mass storage và Universal Flash Storage (UFS). Nó có major number `8` và dải `16` minor number cho mỗi giao diện hoặc đĩa.

Các minor number từ `0` đến `15` dành cho giao diện thứ nhất với các device node có tên từ `sda` đến `sda15`; các số từ `16` đến `31` dành cho đĩa thứ hai với các device node từ `sdb` đến `sdb15`; v.v. Điều này tiếp tục đến đĩa thứ 16 từ `240` đến `255` với tên node `sdp`. Có các major number khác được dành riêng cho chúng vì đĩa SCSI rất phổ biến, nhưng chúng ta không cần lo về điều đó ở đây.

Cả block driver MMC và SCSI đều mong đợi tìm thấy một bảng phân vùng ở đầu đĩa. Bảng phân vùng được tạo bằng các tiện ích như `fdisk`, `sfidsk` và `parted`.

Một chương trình user space có thể mở và tương tác trực tiếp với một block device qua device node. Tuy nhiên, đây không phải là việc thường làm. Nó thường chỉ được làm để thực hiện các thao tác quản trị như tạo phân vùng, format một phân vùng bằng một filesystem, và mount. Khi filesystem đã được mount, bạn tương tác gián tiếp với block device qua các file trong filesystem đó.

Hầu hết các block device sẽ có một kernel driver hoạt động được, vì vậy chúng ta hiếm khi cần tự viết. Network device cũng vậy. Giống như filesystem trừu tượng hóa các chi tiết của block device, network stack loại bỏ nhu cầu tương tác trực tiếp với một network device.

## Network device

Network device không được truy cập qua device node, và chúng không có major number và minor number. Thay vào đó, một network device được kernel cấp một tên dựa trên một chuỗi và một số instance. Sau đây là một ví dụ về cách một network driver đăng ký một giao diện:

```
my_netdev = alloc_netdev(0, "net%d", NET_NAME_UNKNOWN, netdev_setup);
ret = register_netdev(my_netdev);
```

Lệnh này tạo một network device tên là `net0` ở lần gọi đầu tiên, `net1` ở lần thứ hai, v.v. Các tên phổ biến hơn bao gồm `lo`, `eth0`, `enp2s0`, `wlan0,` và `wlp1s0`. Lưu ý rằng đây là tên nó có lúc đầu; các device manager như `udev` có thể đổi nó thành tên khác về sau.

Thông thường, tên network interface chỉ được dùng khi cấu hình mạng bằng các tiện ích như `ip` để thiết lập địa chỉ mạng và route. Sau đó, bạn tương tác gián tiếp với network driver bằng cách mở socket và để network layer quyết định cách định tuyến chúng tới đúng giao diện.

Tuy nhiên, có thể truy cập network device trực tiếp từ user space bằng cách tạo một socket và dùng các lệnh `ioctl` được liệt kê trong `include/linux/sockios.h`. Sau đây là một chương trình dùng `SIOCGIFHWADDR` để truy vấn network driver lấy địa chỉ phần cứng (MAC):

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
  for (int i = 0; i < 6; i++) {
        printf("%02x:", (unsigned char)ifr.ifr_hwaddr.sa_data[i]);
    }

    printf("\n");
    close(s);
    return 0;
}
```

Bạn sẽ tìm thấy source code đầy đủ và một recipe BitBake cho chương trình này trong thư mục `MELD/Chapter11/meta-device-drivers/recipes-local/show-mac-address`. Chương trình `show-mac-address` nhận tên một network interface làm đối số. Sau khi mở một socket, chúng ta copy tên interface vào một struct và truyền struct đó vào lời gọi `ioctl` trên socket trước khi in ra địa chỉ MAC kết quả.

Giờ chúng ta đã biết ba loại device driver là gì, làm sao để liệt kê các driver khác nhau đang được dùng trên hệ thống?

## Tìm hiểu về driver lúc runtime

Khi đã có một hệ thống Linux đang chạy, việc biết device driver nào đã được nạp và chúng ở trạng thái nào là hữu ích. Bạn có thể biết được rất nhiều bằng cách đọc các file trong `/proc` và `/sys`.

Liệt kê các character device driver và block device driver hiện đang được nạp và hoạt động bằng cách đọc `/proc/devices`:

```
$ cat /proc/devices
Character devices:
  1 mem
  4 /dev/vc/0
  4 tty
  4 ttyS
  5 /dev/tty
  5 /dev/console
<…>
```

Với mỗi driver, bạn có thể thấy major number và tên gốc. Tuy nhiên, điều này không cho bạn biết mỗi driver được gắn với bao nhiêu thiết bị. Nó chỉ hiển thị `ttyAMA` nhưng không cho bạn manh mối nào về việc nó có được gắn với bốn cổng serial thật hay không. Tôi sẽ quay lại điều đó sau khi xem `sysfs`.

Network device không xuất hiện trong danh sách này vì chúng không có device node. Thay vào đó, bạn có thể dùng công cụ `ip` để có danh sách network device:

```
# ip link show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq qlen 1000
    link/ether 34:08:e1:85:07:d9 brd ff:ff:ff:ff:ff:ff
3: eth1: <BROADCAST,MULTICAST> mtu 1500 qdisc noop qlen 1000
    link/ether 7a:1f:d8:46:36:b1 brd ff:ff:ff:ff:ff:ff
```

Bạn cũng có thể tìm hiểu về các thiết bị gắn với bus USB hoặc PCI bằng các lệnh well-known `lsusb` và `lspci` tương ứng. Có thông tin về chúng trong các trang manual tương ứng và rất nhiều hướng dẫn trực tuyến, vì vậy tôi sẽ không mô tả thêm ở đây.

Thông tin thực sự thú vị nằm trong `sysfs`, chủ đề tiếp theo mà chúng ta sẽ đề cập.

### Lấy thông tin từ sysfs

Bạn có thể định nghĩa `sysfs` một cách sách vở là một biểu diễn của các kernel object, attribute và relationship. Một kernel object là một thư mục, một attribute là một file, và một relationship là một symbolic link từ object này tới object khác. Từ góc nhìn thực tế hơn, vì Linux device driver model biểu diễn mọi thiết bị và driver dưới dạng kernel object, bạn có thể thấy cái nhìn của kernel về hệ thống bày ra trước mắt bằng cách xem trong `/sys`:

```
# ls /sys
block     class     devices   fs        module
bus       dev       firmware  kernel    power
```

Trong bối cảnh khám phá thông tin về thiết bị và driver, tôi sẽ xem ba thư mục trong số này: `devices`, `class` và `block`.

#### Thiết bị – /sys/devices

Đây là cái nhìn của kernel về các thiết bị đã được phát hiện kể từ khi boot và cách chúng được nối với nhau. Nó được tổ chức ở cấp cao nhất theo system bus, vì vậy những gì bạn thấy khác nhau giữa các hệ thống. Sau đây là emulation QEMU của board Arm Versatile:

```
# ls /sys/devices
platform  software  system   tracepoint virtual
```

Có ba thư mục có mặt trên mọi hệ thống:

- `system/`: Chứa các thiết bị ở trung tâm của hệ thống, bao gồm CPU và clock.

- `virtual/`: Chứa các thiết bị memory-based. Bạn sẽ thấy các thiết bị bộ nhớ xuất hiện dưới dạng `/dev/null`, `/dev/random` và `/dev/zero` trong `virtual/mem`. Bạn cũng sẽ thấy thiết bị loopback `lo` trong `virtual/net`.

- `platform/`: Đây là nơi catch-all cho các thiết bị không được nối qua một bus phần cứng thông thường. Đây có thể là hầu hết mọi thứ trên một thiết bị nhúng.

Các thiết bị khác xuất hiện trong các thư mục tương ứng với các system bus thực tế. Ví dụ, PCI root bus, nếu có, xuất hiện dưới dạng `pci0000:00`.

Duyệt phân cấp này khá khó vì nó đòi hỏi một số hiểu biết về topology của hệ thống và các đường dẫn trở nên khá dài và khó nhớ. Để dễ dàng hơn, `/sys/class` và `/sys/block` cung cấp hai cái nhìn khác về các thiết bị.

#### Driver – /sys/class

Đây là một cái nhìn về các device driver được trình bày theo loại của chúng. Nói cách khác, đó là một góc nhìn phần mềm thay vì góc nhìn phần cứng. Mỗi thư mục con đại diện cho một lớp driver và được triển khai bởi một thành phần của driver framework. Ví dụ, các thiết bị UART được quản lý bởi layer `tty`, vì vậy bạn sẽ tìm thấy chúng trong `/sys/class/tty`. Tương tự, bạn sẽ tìm thấy network device trong `/sys/class/net`, các thiết bị input như bàn phím, touchscreen và chuột trong `/sys/class/input`, v.v.

Có một symbolic link trong mỗi thư mục con cho mỗi instance của loại thiết bị đó, trỏ tới biểu diễn của nó trong `/sys/device`.

Hãy xem các cổng serial trên Versatile PB. Chúng ta có thể thấy có bốn cổng:

```
# ls -d /sys/class/tty/ttyAMA*
/sys/class/tty/ttyAMA0    /sys/class/tty/ttyAMA2
/sys/class/tty/ttyAMA1    /sys/class/tty/ttyAMA3
```

Mỗi thư mục là một biểu diễn của kernel object gắn với một instance của một giao diện thiết bị. Nhìn vào bên trong một trong các thư mục này, chúng ta có thể thấy các attribute của object, được biểu diễn dưới dạng file, và các relationship với các object khác, được biểu diễn bằng link:

```
# ls /sys/class/tty/ttyAMA0
close_delay       flags             line            uartclk
closing_wait      io_type           port            uevent
custom_divisor    iomem_base        power           xmit_fifo_size
dev               iomem_reg_shift   subsystem
device            irq               type
```

Link có tên `device` trỏ tới hardware object của thiết bị. Link có tên `subsystem` trỏ ngược về subsystem cha tại `/sys/class/tty`. Các mục thư mục còn lại là các attribute. Một số dành riêng cho cổng serial, như `xmit_fifo_size`, trong khi các attribute khác áp dụng cho nhiều loại thiết bị, như `irq` cho số ngắt và `dev` cho số thiết bị. Một số file attribute ghi được và cho phép bạn tinh chỉnh các tham số trong driver lúc runtime.

Attribute `dev` đặc biệt thú vị. Nếu xem giá trị của nó, bạn sẽ thấy như sau:

```
# cat /sys/class/tty/ttyAMA0/dev
204:64
```

Đây là major number và minor number của thiết bị. Attribute này được tạo khi driver đăng ký giao diện. Chính từ file này mà `udev` và `mdev` tìm ra major number và minor number của device driver.

#### Block driver – /sys/block

Còn một cái nhìn nữa về device model quan trọng với cuộc thảo luận này: cái nhìn block driver mà bạn sẽ thấy trong `/sys/block`. Có một thư mục con cho mỗi block device. Danh sách này là từ một BeaglePlay:

```
# ls /sys/block
loop0   loop4   mmcblk0        ram0    ram12   ram2   ram6
loop1   loop5   mmcblk1        ram1    ram13   ram3   ram7
loop2   loop6   mmcblk0boot0   ram10   ram14   ram4   ram8
loop3   loop7   mmcblk0boot1   ram11   ram15   ram5   ram9
```

Nếu nhìn vào bên trong `mmcblk0`, chip eMMC trên board này, bạn sẽ thấy các attribute của giao diện và các phân vùng bên trong nó:

```
# ls /sys/block/mmcblk0
alignment_offset   events             holders       mmcblk0p2  ro
bdi                events_async       inflight      mq         size
capability         events_poll_msecs  integrity     power      slaves
dev                ext_range          mmcblk0boot0  queue      stat
device             force_ro           mmcblk0boot1  range      subsystem
discard_alignment  hidden             mmcblk0p1     removable  uevent
```

Tóm lại, bạn có thể biết được rất nhiều về các thiết bị (phần cứng) và driver (phần mềm) có trên một hệ thống bằng cách đọc `sysfs`.

## Tìm đúng device driver

Một board nhúng điển hình dựa trên một thiết kế tham chiếu của nhà sản xuất với các thay đổi để phù hợp với một ứng dụng cụ thể. BSP đi kèm reference board nên hỗ trợ mọi thiết bị ngoại vi trên board đó. Sau đó, bạn tùy chỉnh thiết kế, có thể bằng cách thêm một cảm biến nhiệt độ gắn qua I2C, một số đèn và nút bấm nối qua các chân GPIO, một màn hình hiển thị qua giao diện MIPI, hoặc nhiều thứ khác. Công việc của bạn là tạo một kernel tùy chỉnh để điều khiển tất cả những thứ này, nhưng bạn bắt đầu tìm device driver hỗ trợ tất cả các thiết bị ngoại vi này từ đâu?

Nơi hiển nhiên nhất để tìm là trang hỗ trợ driver trên website của nhà sản xuất, hoặc bạn có thể hỏi họ trực tiếp. Theo kinh nghiệm của tôi, cách này hiếm khi cho bạn kết quả mong muốn. Các nhà sản xuất phần cứng không đặc biệt Linux-savvy, và họ thường cho bạn thông tin gây hiểu nhầm. Họ có thể có driver độc quyền dưới dạng binary blob hoặc source code cho một phiên bản kernel khác với phiên bản bạn có. Vì vậy, hãy cứ thử con đường này. Cá nhân tôi luôn cố tìm một driver open-source cho công việc đang làm.

Có thể đã có hỗ trợ trong kernel của bạn: có hàng nghìn driver trong Linux mainline và có nhiều driver vendor-specific trong các kernel của nhà cung cấp. Hãy bắt đầu bằng việc chạy `make` `menuconfig` (hoặc `xconfig`) và tìm tên hoặc số hiệu sản phẩm. Nếu không tìm thấy kết quả khớp chính xác, hãy thử các tìm kiếm tổng quát hơn, vì hầu hết các driver xử lý nhiều sản phẩm cùng họ. Tiếp theo, hãy thử tìm trong code ở thư mục `drivers` (`grep` là bạn của bạn ở đây).

Nếu vẫn chưa có driver, bạn có thể thử tìm trực tuyến và hỏi trong các diễn đàn liên quan để xem có driver cho một phiên bản Linux mới hơn không. Nếu tìm thấy, bạn nên nghiêm túc cân nhắc cập nhật BSP để dùng kernel mới hơn. Đôi khi điều này không thực tế, vì vậy bạn có thể phải nghĩ đến việc backport driver về kernel của mình. Nếu các phiên bản kernel tương tự nhau, việc này có thể dễ, nhưng nếu chúng cách nhau hơn 12 đến 18 tháng, thì nhiều khả năng code đã thay đổi đến mức bạn sẽ phải viết lại một phần driver để tích hợp nó với kernel. Nếu tất cả các lựa chọn này thất bại, bạn sẽ phải tự tìm giải pháp bằng cách viết kernel driver còn thiếu. Tuy nhiên, điều này không phải lúc nào cũng cần thiết. Chúng ta sẽ xem một lựa chọn thay thế trong phần tiếp theo.

## Device driver trong user space

Trước khi bắt đầu viết một device driver, hãy dừng lại một chút để xem xét liệu nó có thực sự cần thiết không. Có các device driver tổng quát cho nhiều loại thiết bị phổ biến cho phép bạn tương tác trực tiếp với phần cứng từ user space mà không phải viết một dòng code kernel nào. Code user space chắc chắn dễ viết và debug hơn. Nó cũng không thuộc phạm vi GPL, mặc dù tôi không cảm thấy đó là lý do tốt để làm theo cách này.

Các driver này chia thành hai loại lớn: những driver bạn điều khiển qua các file trong `sysfs`, bao gồm GPIO và LED, và các bus serial cung cấp một giao diện tổng quát qua một device node, như I2C.

Hãy build một image Yocto cho BeaglePlay có cài sẵn một số ví dụ:

1\. Đi tới thư mục ở cấp trên thư mục nơi bạn đã clone Yocto một bậc:

```
$ cd ~
```

2\. Copy các layer meta-device-driver từ Git repo của cuốn sách:

```
$ cp -a MELD/Chapter11/meta-device-drivers .
```

3\. Thiết lập môi trường làm việc BitBake cho BeaglePlay:

```
$ source poky/oe-init-build-env build-beagleplay
```

4\. Lệnh này thiết lập một loạt biến môi trường và đưa bạn trở lại thư mục `build-beagleplay` mà bạn đã tạo nội dung trong phần Layer ở Chương 6. Hãy lặp lại bài tập thêm layer `meta-nova` của riêng bạn và build `core-image-minimal` cho BeaglePlay nếu từ đó bạn đã xóa công việc đó.

5\. Xóa layer `meta-nova`:

```
$ bitbake-layers remove-layer ../meta-nova
```

6\. Thêm layer `meta-device-drivers`:

```
$ bitbake-layers add-layer ../meta-device-drivers
```

7\. Xác nhận rằng cấu trúc layer được thiết lập đúng:

```
$ bitbake-layers show-layers
NOTE: Starting bitbake server...
layer                 path
priority
===================================================================
======
core                /home/frank/poky/meta                        5
yocto               /home/frank/poky/meta-poky                   5
yoctobsp            /home/frank/poky/meta-yocto-bsp              5
arm-toolchain       /home/frank/meta-arm/meta-arm-toolchain      5
meta-arm            /home/frank/meta-arm/meta-arm                5
meta-ti-bsp         /home/frank/meta-ti/meta-ti-bsp              6
device-drivers      /home/frank/meta-device-drivers              6
```

8\. Sửa `conf/local.conf` để các chương trình ví dụ và driver giả được cài đặt:

```
IMAGE_INSTALL:append = " read-urandom show-mac-address gpio-int i2c-
eeprom-read dummy-driver"
```

9\. Bật giao diện `/sys/class/gpio` kiểu cũ trong kernel:

```
$ bitbake -c menuconfig virtual/kernel
```

10\. Bảo đảm các tùy chọn `CONFIG_EXPERT`, `CONFIG_GPIO_SYSFS`, `CONFIG_DEBUG_FS` và `CONFIG_DEBUG_FS_ALLOW_ALL` được bật. Bảo đảm tùy chọn `CONFIG_KEYBOARD_GPIO` bị tắt.

11\. Bật giao diện `/sys/class/leds` trong kernel bằng cách bảo đảm các tùy chọn `CONFIG_LEDS_CLASS`, `CONFIG_LEDS_GPIO` và `CONFIG_LEDS_TRIGGER_TIMER` được bật.

12\. Lưu `.config` của kernel đã sửa đổi và thoát `menuconfig`.

13\. Build `core-image-minimal`:

```
$ bitbake core-image-minimal
```

Ghi image hoàn chỉnh lên thẻ microSD bằng balenaEtcher, cắm thẻ microSD vào BeaglePlay và boot nó như được mô tả trong phần Running the BeaglePlay target ở Chương 6.

### GPIO

General-Purpose Input/Output (GPIO) là dạng giao tiếp số đơn giản nhất vì nó cho bạn truy cập trực tiếp từng chân phần cứng riêng lẻ, mỗi chân có thể ở một trong hai trạng thái: cao hoặc thấp. Trong hầu hết các trường hợp, bạn có thể cấu hình chân GPIO là input hoặc output. Bạn thậm chí có thể dùng một nhóm chân GPIO để tạo các giao tiếp higher-level như I2C hoặc SPI bằng cách thao tác từng bit bằng phần mềm, một kỹ thuật gọi là bit banging. Hạn chế chính là tốc độ và độ chính xác của các vòng lặp phần mềm và số chu kỳ CPU bạn muốn dành cho chúng. Nhìn chung, khó đạt độ chính xác timer tốt hơn một mili giây trừ khi bạn cấu hình một kernel real-time, như chúng ta sẽ thấy trong Chương 21. Các trường hợp sử dụng GPIO phổ biến hơn là đọc nút nhấn và cảm biến số, và điều khiển LED, động cơ và relay.

Hầu hết các SoC có rất nhiều bit GPIO được nhóm lại trong các thanh ghi GPIO, thường là 32 bit mỗi thanh ghi. Các bit GPIO On-chip được dẫn ra các chân GPIO trên vỏ chip qua một bộ ghép kênh được gọi là pin mux. Có thể có thêm các chân GPIO off-chip trong chip quản lý nguồn và trong các GPIO extender chuyên dụng nối qua bus I2C hoặc SPI. Tất cả sự đa dạng này được xử lý bởi một subsystem kernel được gọi là `gpiolib`, thực ra không phải là một thư viện, mà là hạ tầng mà các GPIO driver dùng để trình bày I/O một cách nhất quán. Có chi tiết về bản triển khai của `gpiolib` trong source kernel dưới `Documentation/driver-api/gpio/`, và code của chính các driver nằm trong `drivers/gpio/`.

Các ứng dụng có thể tương tác với `gpiolib` qua các file trong thư mục `/sys/class/gpio/`. Đây là những gì bạn sẽ thấy trên một board nhúng điển hình như BeaglePlay:

```
# ls /sys/class/gpio
export       gpiochip512  gpiochip515  gpiochip539  gpiochip631  unexport
```

Các thư mục có tên từ `gpiochip512` đến `gpiochip631` đại diện cho bốn thanh ghi GPIO, mỗi thanh ghi có số bit GPIO khác nhau. Nếu nhìn vào một trong các thư mục `gpiochip`, bạn sẽ thấy như sau:

```
# ls /sys/class/gpio/gpiochip512
base       device     label      ngpio      power      subsystem  uevent
```

File tên là `base` chứa số của chân GPIO đầu tiên trong thanh ghi, còn `ngpio` chứa số bit trong thanh ghi. Trong trường hợp này, `gpiochip512/base` là `512` và `gpiochip512/ngpio` là `3`, cho bạn biết nó chứa các bit GPIO từ `512` đến `514`. Có thể có khoảng trống giữa GPIO cuối cùng trong một thanh ghi và GPIO đầu tiên trong thanh ghi tiếp theo.

Để điều khiển một bit GPIO từ user space, trước tiên bạn cần export nó từ kernel space, điều bạn có thể làm bằng cách ghi số GPIO vào `/sys/class/gpio/export`. Ví dụ này cho thấy quy trình với GPIO 640, được nối tới chân INT của đầu nối mikroBUS trên BeaglePlay:

```
# echo 640 > /sys/class/gpio/export
# ls /sys/class/gpio
export       gpiochip512  gpiochip539  unexport
gpio640      gpiochip515  gpiochip631
```

Giờ có một thư mục `gpio640` mới chứa các file bạn cần để điều khiển chân.

LƯU Ý QUAN TRỌNG

Nếu bit GPIO đã bị kernel chiếm, bạn sẽ không thể export nó theo cách này:

```
# echo 640 > /sys/class/gpio/export
bash: echo: write error: Device or resource busy
```

Thư mục `gpio640` chứa các file sau:

```
# ls /sys/class/gpio/gpio640
active_low  direction   power       uevent
device      edge        subsystem   value
```

Chân bắt đầu ở dạng input, điều hợp lệ cho chân INT (interrupt) của đầu nối mikroBUS. Để chuyển một GPIO thành output, hãy ghi `out` vào file `direction`. File `value` chứa trạng thái hiện tại của chân, là `0` cho mức thấp và `1` cho mức cao. Nếu là output, bạn có thể thay đổi trạng thái bằng cách ghi `0` hoặc `1` vào `value`. Đôi khi ý nghĩa của thấp và cao bị đảo ngược trong phần cứng (các kỹ sư phần cứng thích làm những chuyện như vậy), vì vậy ghi `1` vào `active_low` sẽ đảo ngược ý nghĩa của `value` để điện áp thấp được báo là `1` và điện áp cao được báo là `0`.

Ngược lại, bạn có thể gỡ một GPIO khỏi sự điều khiển của user space bằng cách ghi số GPIO vào `/sys/class/gpio/unexport`, như bạn đã làm với export.

#### Xử lý ngắt từ GPIO

Trong nhiều trường hợp, một GPIO input có thể được cấu hình để tạo ngắt khi nó thay đổi trạng thái. Điều này cho phép bạn chờ ngắt thay vì poll trong một vòng lặp phần mềm kém hiệu quả. Nếu bit GPIO có thể tạo ngắt, sẽ có một file tên là `edge`. Ban đầu, nó có giá trị là `none`, nghĩa là nó không tạo ngắt. Để bật ngắt, bạn có thể đặt nó thành một trong các giá trị sau:

- `rising`: Ngắt ở cạnh lên.

- `falling`: Ngắt ở cạnh xuống.

- `both`: Ngắt ở cả cạnh lên và cạnh xuống.

- `none`: Không có ngắt (mặc định).

Để xác định nút USR trên BeaglePlay được gán cho GPIO nào:

```
# cat /sys/kernel/debug/gpio | grep USR_BUTTON
 gpio-557 (USR_BUTTON          |sysfs               ) in  hi IRQ
```

Nếu muốn chờ một cạnh xuống trên GPIO 557 (nút USR), trước tiên bạn phải bật ngắt:

```
# echo 557 > /sys/class/gpio/export
# echo falling > /sys/class/gpio/gpio557/edge
```

Sau đây là một chương trình chờ ngắt từ GPIO:

```
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/epoll.h>
#include <sys/types.h>

int main(int argc, char *argv[])
{
    int ep;
    int f;
    struct epoll_event ev, events;
    char value[4];
    int ret;
    int n;

    ep = epoll_create(1);

    if (ep == -1) {
        perror("Can't create epoll");
        return 1;
    }

    f = open("/sys/class/gpio/gpio557/value", O_RDONLY | O_NONBLOCK);

    if (f == -1) {
        perror("Can't open gpio557");
        return 1;
    }

    n = read(f, &value, sizeof(value));

    if (n > 0) {
        printf("Initial value value=%c\n", value[0]);
        lseek(f, 0, SEEK_SET);
    }

    ev.events = EPOLLPRI;
    ev.data.fd = f;
    ret = epoll_ctl(ep, EPOLL_CTL_ADD, f, &ev);

    while (1) {
        printf("Waiting\n");
        ret = epoll_wait(ep, &events, 1, -1);
        if (ret > 0) {
            n = read(f, &value, sizeof(value));
            printf("Button pressed: value=%c\n", value[0]);
            lseek(f, 0, SEEK_SET);
        }
    }

    return 0;
}
```

Đây là cách code của chương trình `gpio-int` hoạt động. Đầu tiên, gọi `epoll_create` để tạo cơ chế thông báo `epoll`. Tiếp theo, mở GPIO và đọc giá trị ban đầu của nó. Gọi `epoll_ctl` để đăng ký file descriptor của GPIO với `POLLPRI` làm sự kiện. Cuối cùng, chờ ngắt bằng hàm `epoll_wait`. Khi bạn nhấn nút USR trên BeaglePlay, chương trình sẽ in ra `Button pressed:` theo sau là số byte và giá trị đọc được từ GPIO.

Mặc dù chúng ta có thể dùng `select` và `poll` để xử lý ngắt, khác với hai system call đó, hiệu năng của `epoll` không giảm nhanh khi số file descriptor được giám sát tăng lên.

Source code đầy đủ của chương trình này, cùng với một recipe BitBake và script cấu hình GPIO, có thể được tìm thấy bên trong thư mục `MELD/Chapter11/meta-device-drivers/recipes-local/gpio-int`.

Giống như GPIO, LED có thể được truy cập từ `sysfs`. Tuy nhiên, giao diện khác biệt đáng kể.

### LED

LED thường được điều khiển qua một chân GPIO, nhưng có một subsystem kernel khác cung cấp sự điều khiển chuyên biệt hơn dành riêng cho mục đích này. Subsystem kernel `leds` thêm khả năng đặt độ sáng, nếu LED có khả năng đó, và nó có thể xử lý các LED được nối theo những cách khác với một chân GPIO đơn giản. Nó có thể được cấu hình để kích hoạt LED theo một sự kiện, như truy cập block device hoặc một heartbeat, để cho thấy thiết bị đang hoạt động. Bạn sẽ phải cấu hình kernel với tùy chọn `CONFIG_LEDS_CLASS` và với các hành động LED trigger phù hợp với bạn. Có thêm thông tin trong `Documentation/leds/` và các driver nằm trong `drivers/leds/`.

Giống như GPIO, LED được điều khiển qua một giao diện `sysfs` trong thư mục `/sys/class/leds/`. Trong trường hợp BeaglePlay, tên các LED người dùng được mã hóa trong device tree ở dạng `:function`, như sau:

```
# ls /sys/class/leds
:cpu            :heartbeat      :wlan           mmc1::
:disk-activity  :lan            mmc0::          mmc2::
```

Giờ chúng ta có thể xem các attribute của một trong các LED:

```
# cd /sys/class/leds/\:heartbeat
# ls
brightness      invert          power           trigger
device          max_brightness  subsystem       uevent
```

Lưu ý rằng shell cần các dấu backslash ở đầu để escape mọi dấu hai chấm trong đường dẫn.

File `brightness` điều khiển độ sáng của LED và có thể là một số từ `0` (tắt) đến `max_brightness` (sáng hoàn toàn). Nếu LED không hỗ trợ độ sáng trung gian, bất kỳ giá trị non-zero nào cũng bật nó. File tên là `trigger` liệt kê các sự kiện kích hoạt LED bật. Danh sách trigger là implementation-dependent. Sau đây là một ví dụ:

```
# cat trigger
none kbd-scrolllock kbd-numlock <…> disk-write [heartbeat] cpu <…>
```

Trigger hiện được chọn được hiển thị trong dấu ngoặc vuông. Bạn có thể thay đổi nó bằng cách ghi một trong các trigger khác vào file. Nếu muốn điều khiển LED hoàn toàn qua độ sáng, hãy chọn `none`. Nếu đặt trigger thành `timer`, hai file bổ sung sẽ xuất hiện cho phép bạn đặt thời gian bật và tắt tính bằng mili giây:

```
# echo timer > trigger
# ls
brightness      delay_on        max_brightness  subsystem       uevent
delay_off       device          power           trigger
# cat delay_on
500
# cat delay_off
500
```

Nếu LED có phần cứng timer on-chip, việc nhấp nháy diễn ra mà không làm ngắt CPU.

### I2C

I2C là một bus 2-wire low-speed đơn giản, phổ biến trên các board nhúng. Nó thường được dùng để truy cập các thiết bị ngoại vi không nằm trên SoC như display controller, cảm biến camera, GPIO extender, v.v. Có một chuẩn liên quan được gọi là system management bus (SMBus), có trên PC và được dùng để truy cập các cảm biến nhiệt độ và điện áp. SMBus là một tập con của I2C.

I2C là một giao thức master-slave, với master là một hoặc nhiều host controller trên SoC. Slave có một địa chỉ 7-bit do nhà sản xuất gán (hãy đọc data sheet), cho phép tối đa 128 node mỗi bus, nhưng 16 địa chỉ được dành riêng, vì vậy thực tế chỉ cho phép 112 node. Master có thể khởi tạo các giao dịch đọc hoặc ghi với một trong các slave. Thường thì byte đầu tiên được dùng để chỉ định một thanh ghi trên slave, còn các byte còn lại là dữ liệu được đọc từ hoặc ghi vào thanh ghi đó.

Có một device node cho mỗi host controller. SoC này có năm:

```
# ls -l /dev/i2c*
crw-rw---- 1 root gpio 89, 0  Aug  7 13:25 /dev/i2c-0
crw-rw---- 1 root gpio 89, 1  Aug  7 13:25 /dev/i2c-1
crw-rw---- 1 root gpio 89, 2  Aug  7 13:25 /dev/i2c-2
crw-rw---- 1 root gpio 89, 3  Aug  7 13:25 /dev/i2c-3
crw-rw---- 1 root gpio 89, 5  Aug  7 13:25 /dev/i2c-5
```

Giao diện thiết bị cung cấp một loạt lệnh `ioctl` để truy vấn host controller và gửi các lệnh đọc và ghi tới các slave I2C. Có một package tên là `i2c-tools` dùng giao diện này để cung cấp các công cụ command-line cơ bản để tương tác với thiết bị I2C. Các công cụ như sau:

- `i2cdetect`: Liệt kê các adapter I2C và dò bus.

- `i2cdump`: Dump dữ liệu từ tất cả các thanh ghi của một thiết bị ngoại vi I2C.

- `i2cget`: Đọc dữ liệu từ một slave I2C.

- `i2cset`: Ghi dữ liệu vào một slave I2C.

Package `i2c-tools` có sẵn trong Buildroot và The Yocto Project cũng như hầu hết các bản phân phối chính thống. Viết một chương trình user space để giao tiếp với thiết bị khá đơn giản miễn là bạn biết địa chỉ và giao thức của slave. Ví dụ sau cho thấy cách đọc bốn byte đầu tiên từ EEPROM FT24C32A-ELR-T, được gắn trên BeaglePlay ở bus I2C 0. EEPROM có địa chỉ slave là `0x50`.

Sau đây là code của một chương trình đọc bốn byte đầu tiên từ một địa chỉ I2C:

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
    /* Open the adapter and set the address of the I2C device */
    f = open("/dev/i2c-0", O_RDWR);

    /* Set the address of the i2c slave device */
    ioctl(f, I2C_SLAVE, I2C_ADDRESS);

    /* Set the 16-bit address to read from to 0 */
    buf[0] = 0; /* address byte 1 */
    buf[1] = 0; /* address byte 2 */
    n = write(f, buf, 2);

/* Now read 4 bytes from that address */
    n = read(f, buf, 4);
    printf("0x%x 0x%x 0x%x 0x%x\n", buf[0], buf[1], buf[2], buf[3]);

    close(f);
    return 0;
}
```

Chương trình `i2c-eeprom-read` này in ra `0xaa 0x55 0x33 0x33` khi được thực thi trên BeaglePlay. Chuỗi four-byte đó là magic number của EEPROM. Source đầy đủ và một recipe BitBake cho chương trình này có thể được tìm thấy bên trong thư mục `MELD/Chapter11/meta-device-drivers/recipes-local/i2c-eeprom-read`.

Lưu ý rằng một thiết bị ở đầu bên kia của bus I2C có thể là little-endian hoặc big-endian. Little-endian và big-endian chỉ thứ tự của các byte trong một word dữ liệu. Một word 32-bit chứa bốn byte. Little-endian có nghĩa là byte ít quan trọng nhất nằm ở index 0 và byte quan trọng nhất nằm ở index 3. Ngược lại, big-endian có nghĩa là byte quan trọng nhất nằm ở index 0 và byte ít quan trọng nhất nằm ở index 3. Big-endian còn được gọi là network order, tương ứng với thứ tự các byte được truyền trên đường truyền trong các giao thức mạng.

Chương trình này giống `i2cget`, chỉ khác là địa chỉ và các byte thanh ghi được đọc đều được hardcode thay vì được truyền vào làm đối số. Chúng ta có thể dùng `i2cdetect` để khám phá địa chỉ của mọi thiết bị ngoại vi trên một bus I2C. `i2cdetect` có thể để các thiết bị ngoại vi I2C ở trạng thái xấu hoặc làm treo bus, vì vậy một thực hành tốt là reboot sau khi dùng nó. Data sheet của một thiết bị ngoại vi cho chúng ta biết các thanh ghi ánh xạ tới cái gì. Với thông tin đó, chúng ta có thể dùng `i2cset` để ghi vào các thanh ghi của nó qua I2C. Các lệnh I2C này có thể dễ dàng được chuyển thành một thư viện hàm C để giao tiếp với thiết bị ngoại vi.

LƯU Ý QUAN TRỌNG

Có thêm thông tin về bản triển khai I2C của Linux trong `Documentation/i2c/dev-interface.rst`. Các host controller driver nằm trong `drivers/i2c/busses/`.

Một giao thức truyền thông phổ biến khác là SPI, dùng một bus 4-wire.

### SPI

Bus SPI tương tự I2C nhưng nhanh hơn nhiều, tới hàng chục MHz. Giao diện dùng bốn dây với các đường gửi và nhận riêng biệt, cho phép nó hoạt động ở chế độ full duplex. Mỗi chip trên bus được chọn bằng một đường chip select riêng. Nó thường được dùng để nối với cảm biến touchscreen, display controller và các thiết bị flash NOR serial.

Giống như I2C, nó là một giao thức master-slave, với hầu hết các SoC triển khai một hoặc nhiều master host controller. Có một SPI device driver tổng quát mà bạn có thể bật qua cấu hình kernel `CONFIG_SPI_SPIDEV`. Driver này tạo một device node cho mỗi SPI controller, cho phép bạn truy cập các chip SPI từ user space. Các device node có tên `spidev<bus>.<chip select>`:

```
# ls -l /dev/spi*
crw-rw---- 1 root root 153, 0  Jan  1 00:29 /dev/spidev1.0
```

Để xem các ví dụ dùng giao diện `spidev`, hãy tham khảo code ví dụ trong `Documentation/spi/`.

Cho đến giờ, các device driver chúng ta đã thấy đều có hỗ trợ upstream lâu đời trong Linux kernel. Vì tất cả các device driver này đều tổng quát (GPIO, LED, I2C và SPI), việc truy cập chúng từ user space khá đơn giản. Đến một lúc nào đó, bạn sẽ gặp một phần cứng không có kernel device driver tương thích. Phần cứng đó có thể là trung tâm của sản phẩm (LiDAR, SDR, v.v.). Cũng có thể có một FPGA nằm giữa SoC và phần cứng này. Trong những hoàn cảnh này, bạn có thể không còn cách nào khác ngoài việc tự viết (các) kernel module.

## Viết một kernel device driver

Rốt cuộc, khi đã dùng hết các lựa chọn user space ở trên, bạn sẽ thấy mình phải viết một device driver để truy cập một phần cứng gắn với thiết bị. Character driver linh hoạt nhất và nên đáp ứng 90% mọi nhu cầu của bạn; network driver áp dụng nếu bạn làm việc với một network interface; còn block driver dành cho bộ lưu trữ dung lượng lớn. Task viết một kernel driver phức tạp và nằm ngoài phạm vi của cuốn sách này. Có một số tài liệu tham khảo ở cuối sẽ giúp bạn trên con đường đó. Trong phần này, tôi muốn phác thảo các lựa chọn có sẵn để tương tác với một driver – một chủ đề thường không được đề cập – và cho bạn thấy bộ khung trơ trọi của một character device driver.

### Thiết kế giao diện character driver

Giao diện character driver chính dựa trên một luồng byte, như bạn có với một cổng serial. Tuy nhiên, nhiều thiết bị không phù hợp với mô tả này: ví dụ, một controller cho cánh tay robot cần các hàm để di chuyển và xoay từng khớp. May mắn thay, có những cách khác để giao tiếp với device driver ngoài `read` và `write`:

- `ioctl`: Hàm `ioctl` cho phép bạn truyền hai đối số cho driver. Các đối số này có thể mang bất kỳ ý nghĩa nào bạn muốn. Theo quy ước, đối số thứ nhất là một lệnh chọn một trong nhiều hàm trong driver, còn đối số thứ hai là một con trỏ tới một cấu trúc đóng vai trò container cho các tham số input và output. Đây là một tấm canvas trắng cho phép bạn thiết kế bất kỳ giao diện chương trình nào bạn thích. Nó khá phổ biến khi driver và ứng dụng gắn bó chặt chẽ và được viết bởi cùng một nhóm. Tuy nhiên, `ioctl` đã bị deprecated trong kernel, và bạn sẽ thấy khó đưa bất kỳ driver nào có cách dùng `ioctl` mới được chấp nhận lên upstream. Các maintainer kernel không thích `ioctl` vì nó làm code kernel và code ứng dụng phụ thuộc lẫn nhau quá nhiều, và khó giữ cả hai đồng bộ qua các phiên bản kernel và kiến trúc.

- `sysfs`: Đây là cách được ưu tiên để làm mọi việc hiện nay, với một ví dụ tốt là giao diện LED được mô tả ở trên. Ưu điểm là nó phần nào self-documenting, miễn là bạn chọn tên mô tả rõ ràng cho các file. Nó cũng có thể dùng trong script vì nội dung file thường là chuỗi văn bản. Mặt khác, yêu cầu mỗi file chứa một giá trị duy nhất khiến khó đạt tính nguyên tử nếu bạn cần thay đổi nhiều giá trị cùng lúc. Ngược lại, `ioctl` truyền tất cả các đối số của nó trong một cấu trúc, qua một lời gọi hàm duy nhất.

- `mmap`: Bạn có thể truy cập trực tiếp các kernel buffer và thanh ghi phần cứng bằng cách ánh xạ bộ nhớ kernel vào user space, qua đó bỏ qua kernel. Bạn vẫn có thể cần một ít code kernel để xử lý ngắt và DMA. Có một subsystem bao bọc ý tưởng này được gọi là `uio`, viết tắt của user I/O. Có thêm tài liệu trong `Documentation/driver-api/uio-howto.rst` và có các driver ví dụ trong `drivers/uio/`.

- `sigio`: Bạn có thể gửi một signal từ một driver bằng hàm kernel tên là `kill_fasync()` để thông báo cho ứng dụng về một sự kiện như input đã sẵn sàng hoặc một ngắt được nhận. Theo quy ước, signal tên là `SIGIO` được dùng, nhưng có thể là bất kỳ signal nào. Bạn có thể xem một số ví dụ trong `drivers/uio/uio.c` và `drivers/char/rtc.c`. Vấn đề chính là khó viết các signal handler đáng tin cậy trong user space, vì vậy nó vẫn là một cơ chế little-used.

- `debugfs`: Đây là một pseudo filesystem khác biểu diễn dữ liệu kernel dưới dạng file và thư mục, giống `proc` và `sysfs`. Khác biệt chính là `debugfs` không được chứa thông tin cần cho hoạt động bình thường của hệ thống; nó chỉ dành cho thông tin debug và trace. Nó được mount qua `mount -t debugfs debug /sys/kernel/debug`. Có một mô tả tốt về `debugfs` trong `Documentation/filesystems/debugfs.rst`.

- `proc`: Filesystem `proc` đã bị deprecated cho mọi code mới trừ khi nó liên quan đến process, vốn là mục đích ban đầu của filesystem này. Tuy nhiên, bạn có thể dùng `proc` để công bố bất kỳ thông tin nào bạn chọn. Và, khác với `sysfs` và `debugfs`, nó có sẵn cho các module non-GPL.

- `netlink`: Đây là một họ giao thức socket. `AF_NETLINK` tạo một socket liên kết kernel space với user space. Ban đầu nó được tạo ra để các công cụ mạng có thể giao tiếp với code mạng của Linux để truy cập bảng định tuyến và các chi tiết khác. Nó cũng được `udev` dùng để truyền sự kiện từ kernel tới daemon `udev`. Nó rất hiếm khi được dùng trong các device driver thông thường.

Có nhiều ví dụ về tất cả các filesystem trên trong source code kernel, và bạn có thể thiết kế các giao diện thực sự thú vị cho code driver của mình. Quy tắc phổ quát duy nhất là nguyên tắc ít gây ngạc nhiên nhất (principle of least astonishment). Nói cách khác, những người viết ứng dụng dùng driver của bạn nên thấy mọi thứ hoạt động một cách logic, không có điều kỳ quặc hay bất thường nào.

### Cấu tạo của một device driver

Đã đến lúc kết nối một số mạch nội dung lại với nhau bằng cách xem code của một device driver đơn giản.

Sau đây là phần đầu của một device driver tên là `dummy`, tạo bốn thiết bị có thể được truy cập qua `/dev/dummy0` đến `/dev/dummy3`:

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

Tiếp theo, chúng ta sẽ định nghĩa các hàm `dummy_open()`, `dummy_release()`, `dummy_read()` và `dummy_write()` cho giao diện character device:

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

static ssize_t dummy_read(struct file *file, char *buffer, size_t length,
loff_t * offset)
{
    pr_info("%s %u\n", __func__, length);
    return 0;
}
static ssize_t dummy_write(struct file *file, const char *buffer, size_t
length, loff_t * offset)
{
    pr_info("%s %u\n", __func__, length);
    return length;
}
```

Sau đó, chúng ta cần khởi tạo một cấu trúc `file_operations` và định nghĩa các hàm `dummy_init()` và `dummy_exit()`, được gọi khi driver được nạp và gỡ:

```
struct file_operations dummy_fops = {
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

    if (ret != 0){
        return ret;
    }

    dummy_class = class_create(DEVICE_NAME);

    for (int i = 0; i < NUM_DEVICES; i++) {
        device_create(dummy_class, NULL, MKDEV(MAJOR_NUM, i), NULL,
"dummy%d", i);
    }

    return 0;
}
void __exit dummy_exit(void)
{
    int i;
    for (int i = 0; i < NUM_DEVICES; i++) {
        device_destroy(dummy_class, MKDEV(MAJOR_NUM, i));
    }

    class_destroy(dummy_class);

    unregister_chrdev(MAJOR_NUM, DEVICE_NAME);
    printk("Dummy unloaded\n");
}
```

Ở cuối code, các macro tên là `module_init` và `module_exit` chỉ định các hàm được gọi khi module được nạp và gỡ:

```
module_init(dummy_init);
module_exit(dummy_exit);
```

Ba macro cuối cùng, tên là `MODULE_*`, thêm một số thông tin cơ bản về module:

```
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Chris Simmonds");
MODULE_DESCRIPTION("A dummy driver");
```

Thông tin này có thể được lấy từ kernel module đã compile bằng lệnh `modinfo`. Source code đầy đủ, cùng với một `Makefile` cho driver này, có thể được tìm thấy bên trong thư mục `MELD/Chapter11/meta-device-drivers/recipes-kernel/dummy-driver`.

Khi module được nạp, hàm `dummy_init()` được gọi. Thời điểm nó trở thành một character device là khi nó gọi `register_chrdev`, truyền một con trỏ tới `struct` `file_operations` chứa các con trỏ tới bốn hàm mà driver triển khai. Mặc dù `register_chrdev` cho kernel biết có một driver với major number là `42`, nó không nói gì về class của driver, vì vậy nó sẽ không tạo một mục trong `/sys/class/`.

Không có mục trong `/sys/class/`, device manager không thể tạo device node. Vì vậy, vài dòng code tiếp theo tạo một device class tên là `dummy` và bốn thiết bị thuộc class đó tên là `dummy0` đến `dummy3`. Kết quả là thư mục `/sys/class/dummy/` được tạo, chứa các thư mục con `dummy0` đến `dummy3` khi driver được khởi tạo. Mỗi thư mục con chứa một file `dev` chứa major number và minor number của thiết bị. Đây là tất cả những gì một device manager cần để tạo các device node `/dev/dummy0` đến `/dev/dummy3`.

Hàm `dummy_exit()` phải giải phóng các tài nguyên mà `dummy_init()` đã chiếm bằng cách giải phóng device class và major number.

Các thao tác file của driver này được triển khai bởi `dummy_open()`, `dummy_read()`, `dummy_write()` và `dummy_release()`. Chúng được gọi khi một chương trình user space gọi `open(2)`, `read(2)`, `write(2)` và `close(2)` tương ứng. Chúng chỉ in một thông điệp kernel để bạn có thể thấy chúng đã được gọi. Bạn có thể minh họa điều này từ command line bằng lệnh `echo`:

```
# echo hello > /dev/dummy0
dummy_open
dummy_write 6
dummy_release
```

Trong trường hợp này, các thông điệp xuất hiện vì tôi đã đăng nhập vào console, và thông điệp kernel được in ra console theo mặc định. Nếu bạn không đăng nhập vào console, bạn vẫn có thể xem các thông điệp kernel bằng lệnh `dmesg`.

Source code đầy đủ của driver này chưa đến 100 dòng, nhưng đủ để minh họa cách liên kết giữa một device node và code driver hoạt động, cách device class được tạo, và cách dữ liệu được di chuyển giữa user space và kernel space. Tiếp theo, bạn cần build nó.

### Compile kernel module

Lúc này, bạn có một ít code driver mà bạn muốn compile và kiểm thử trên hệ thống target. Bạn có thể copy nó vào cây source kernel và sửa các makefile để build nó, hoặc có thể compile nó dưới dạng một module out of tree. Hãy bắt đầu bằng việc build out of tree.

Bạn sẽ cần một `Makefile` đơn giản dùng kernel build system để làm tất cả công việc nặng nhọc:

```
obj-m := dummy.o

SRC := $(shell pwd)

all:
        $(MAKE) -C $(KERNEL_SRC) M=$(SRC)

modules_install:
        $(MAKE) -C $(KERNEL_SRC) M=$(SRC) modules_install
clean:
        rm -f *.o *~ core .depend .*.cmd *.ko *.mod.c
        rm -f Module.markers Module.symvers modules.order
        rm -rf .tmp_versions Modules.symvers
```

Yocto đặt `KERNEL_SRC` thành thư mục kernel cho thiết bị target mà bạn sẽ chạy module trên đó. Code `obj-m := dummy.o` sẽ gọi quy tắc build của kernel để lấy file source `dummy.c` và tạo kernel module `dummy.ko`. Tôi sẽ cho bạn thấy cách nạp kernel module trong phần tiếp theo.

LƯU Ý QUAN TRỌNG

Kernel module không tương thích binary giữa các bản phát hành và cấu hình kernel: module sẽ chỉ nạp được trên kernel mà nó được compile cùng.

Nếu muốn build một driver trong cây source kernel, quy trình khá đơn giản. Hãy chọn một thư mục phù hợp với loại driver bạn có. Driver này là một character device cơ bản, vì vậy tôi sẽ đặt `dummy.c` vào `drivers/char/`. Sau đó, sửa makefile trong thư mục và thêm một dòng để build driver vô điều kiện dưới dạng module, như sau:

```
obj-m += dummy.o
```

Ngoài ra, bạn có thể thêm dòng sau để build nó vô điều kiện dưới dạng built-in:

```
obj-y += dummy.o
```

Nếu muốn driver là tùy chọn, bạn có thể thêm một tùy chọn menu vào file `Kconfig` và làm cho việc compile phụ thuộc vào tùy chọn cấu hình, như tôi đã mô tả trong phần Tìm hiểu cấu hình kernel ở Chương 4.

### Nạp kernel module

Bạn có thể nạp, liệt kê và gỡ module bằng các lệnh đơn giản `modprobe`, `lsmod` và `rmmod`. Ở đây, chúng đang nạp và gỡ dummy driver:

```
# modprobe dummy
# lsmod
Module                  Size  Used by
dummy                  12288  0
# rmmod dummy
```

Nếu module được đặt trong một thư mục con trong `/lib/modules/<kernel release>`, bạn có thể tạo một cơ sở dữ liệu dependency của module bằng lệnh `depmod -a`, như sau:

```
# depmod -a
# ls /lib/modules/6.12.9-ti-g8906665ace32
modules.alias              modules.builtin.modinfo    modules.softdep
modules.alias.bin          modules.dep                modules.symbols
modules.builtin            modules.dep.bin            modules.symbols.bin
modules.builtin.alias.bin  modules.devname            updates
modules.builtin.bin        modules.order
```

Thông tin trong các file `modules.*` được lệnh `modprobe` dùng để tìm một module theo tên thay vì đường dẫn đầy đủ. `modprobe` có nhiều tính năng khác, tất cả đều được mô tả trong trang manual `modprobe(8)`.

Giờ chúng ta đã viết và nạp dummy kernel module, làm sao để nó giao tiếp với một phần cứng thật? Chúng ta cần gắn driver với phần cứng đó qua device tree hoặc platform data. Khám phá phần cứng và liên kết phần cứng đó với một device driver là chủ đề của phần tiếp theo.

## Khám phá cấu hình phần cứng

Dummy driver minh họa cấu trúc của một device driver, nhưng nó không tương tác với phần cứng thật vì nó chỉ thao tác các cấu trúc bộ nhớ. Device driver thường được viết để tương tác với phần cứng. Một phần của việc đó là có khả năng phát hiện phần cứng ngay từ đầu, nhớ rằng nó có thể ở các địa chỉ khác nhau trong các cấu hình khác nhau.

Trong một số trường hợp, chính phần cứng cung cấp thông tin. Các thiết bị trên một bus có thể khám phá như PCI hoặc USB có một chế độ truy vấn trả về yêu cầu tài nguyên và một định danh duy nhất. Kernel khớp định danh và có thể cả các đặc tính khác với các device driver và ghép chúng lại.

Tuy nhiên, hầu hết các khối phần cứng trên một board nhúng không có định danh như vậy. Bạn phải tự cung cấp thông tin dưới dạng một device tree hoặc dưới dạng các cấu trúc C được gọi là platform data.

Trong driver model chuẩn của Linux, các device driver tự đăng ký với subsystem thích hợp: PCI, USB, open firmware (device tree), platform device, v.v. Việc đăng ký bao gồm một định danh và một hàm callback gọi là hàm `probe`, được gọi nếu có sự khớp giữa ID của phần cứng và ID của driver. Với PCI và USB, ID dựa trên ID nhà cung cấp và ID sản phẩm của thiết bị. Với device tree và platform device, đó là một tên (một chuỗi văn bản).

### Device tree

Tôi đã giới thiệu device tree trong Chương 3. Ở đây, tôi muốn cho bạn thấy các device driver Linux kết nối với thông tin này như thế nào.

Ví dụ, tôi sẽ dùng board Arm Versatile (`arch/arm/boot/dts/versatile-ab.dts`), với Ethernet adapter được định nghĩa ở đây:

```
net@10010000 {
   compatible = "smsc,lan91c111";
   reg = <0x10010000 0x10000>;
   interrupts = <25>;
};
```

Hãy đặc biệt chú ý đến property `compatible` của node này. Giá trị chuỗi này sẽ xuất hiện lại sau trong source code của Ethernet adapter. Chúng ta sẽ tìm hiểu thêm về device tree trong Chương 12.

### Platform data

Khi không có hỗ trợ device tree, có một phương pháp dự phòng để mô tả phần cứng bằng các cấu trúc C, được gọi là platform data.

Mỗi phần cứng được mô tả bằng `struct platform_device`, có một tên và một con trỏ tới một mảng tài nguyên. Loại tài nguyên được xác định bởi các flag, bao gồm:

- `IORESOURCE_MEM`: Đây là địa chỉ vật lý của một vùng bộ nhớ.

- `IORESOURCE_IO`: Đây là địa chỉ vật lý hoặc số cổng của các thanh ghi I/O.

- `IORESOURCE_IRQ`: Đây là số ngắt.

Sau đây là một ví dụ về platform data cho một Ethernet controller lấy từ `arch/arm/machversatile/core.c`, đã được biên tập lại cho rõ ràng:

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

Nó có một vùng nhớ 64 KB và một ngắt. Platform data thường được đăng ký với kernel khi board được khởi tạo:

```
void __init versatile_init(void)
{
   platform_device_register(&versatile_flash_device);
   platform_device_register(&versatile_i2c_device);
   platform_device_register(&smc91x_device);
<…>
```

Platform data được thể hiện ở đây tương đương về chức năng với device tree source ở trên, ngoại trừ trường `name`, thay thế cho property `compatible`.

### Liên kết phần cứng với device driver

Trong phần trước, bạn đã thấy cách một Ethernet adapter được mô tả bằng device tree hoặc platform data. Code driver tương ứng nằm trong `drivers/net/ethernet/smsc/smc91x.c` và nó hoạt động với cả device tree lẫn platform data.

Sau đây là code khởi tạo, một lần nữa đã được biên tập lại cho rõ ràng:

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

Khi driver được khởi tạo, nó gọi `platform_driver_register()` trỏ tới `struct platform_driver`, trong đó có một callback tới hàm `probe`, một tên driver là `smc91x` và một con trỏ tới `struct of_device_id`.

Nếu driver này được cấu hình bởi device tree, kernel sẽ tìm sự khớp giữa property `compatible` trong node device tree và chuỗi được phần tử compatible của cấu trúc trỏ tới. Với mỗi sự khớp, nó gọi hàm `probe`.

Mặt khác, nếu nó được cấu hình qua platform data, hàm probe sẽ được gọi cho mỗi sự khớp với chuỗi mà `driver.name` trỏ tới.

Hàm `probe` trích xuất thông tin về giao diện:

```
static int smc_drv_probe(struct platform_device *pdev)
{
   struct smc91x_platdata *pd = dev_get_platdata(&pdev->dev);
   const struct of_device_id *match = NULL;
   struct resource *res, *ires;
   int irq;

   res = platform_get_resource(pdev, IORESOURCE_MEM, 0);
   ires = platform_get_resource(pdev, IORESOURCE_IRQ, 0);
   <…>
   addr = ioremap(res->start, SMC_IO_EXTENT);
   irq = ires->start;
   <…>
}
```

Các lời gọi `platform_get_resource()` trích xuất thông tin bộ nhớ và `irq` từ device tree hoặc platform data. Driver có trách nhiệm map bộ nhớ và cài đặt interrupt handler. Tham số thứ ba (`0` trong cả hai trường hợp trên) phát huy tác dụng nếu có nhiều hơn một tài nguyên thuộc loại cụ thể đó.

Device tree cho phép bạn cấu hình nhiều thứ hơn là chỉ các dải bộ nhớ và ngắt cơ bản. Có một đoạn code trong hàm `probe` trích xuất các tham số tùy chọn từ device tree. Trong đoạn trích này, nó lấy property `register-io-width`:

```
match = of_match_device(of_match_ptr(smc91x_match), &pdev->dev);

if (match) {
   struct device_node *np = pdev->dev.of_node;
   u32 val;
   <…>
   of_property_read_u32(np, "reg-io-width", &val);
   <…>
}
```

Với hầu hết các driver, các binding cụ thể được ghi tài liệu trong `Documentation/devicetree/bindings/`. Với driver cụ thể này, thông tin nằm trong `Documentation/devicetree/bindings/net/smsc,lan9115.yaml`.

Điều chính cần nhớ ở đây là các driver nên đăng ký một hàm `probe` và đủ thông tin để kernel gọi `probe` khi nó tìm thấy sự khớp với phần cứng mà nó biết. Liên kết giữa phần cứng được device tree mô tả và device driver được thực hiện qua property `compatible`. Liên kết giữa platform data và một driver được thực hiện qua tên.

## Tóm tắt

Device driver có nhiệm vụ xử lý các thiết bị, thường là phần cứng vật lý nhưng đôi khi là các giao diện ảo, và trình bày chúng cho user space một cách nhất quán và hữu ích. Device driver Linux chia thành ba loại lớn: character, block và network. Trong ba loại, giao diện character driver linh hoạt nhất và vì vậy phổ biến nhất. Driver Linux khớp vào một framework được gọi là driver model, được trình bày qua `sysfs`. Gần như toàn bộ trạng thái của các thiết bị và driver đều hiển thị trong `/sys/`.

Mỗi hệ thống nhúng có tập giao diện phần cứng và yêu cầu riêng của nó. Linux cung cấp driver cho hầu hết các giao diện chuẩn, và bằng cách chọn đúng cấu hình kernel, bạn có thể có một target board hoạt động rất nhanh. Điều này để lại cho bạn các thành phần non-standard mà bạn sẽ phải tự thêm hỗ trợ thiết bị.

Trong một số trường hợp, bạn có thể né vấn đề bằng cách dùng các driver tổng quát cho GPIO, I2C và SPI, và thay vào đó, viết code user space để làm việc. Tôi khuyên đây là điểm khởi đầu vì nó cho bạn cơ hội làm quen với phần cứng mà không phải viết code kernel. Viết kernel driver không đặc biệt khó, nhưng bạn cần viết code cẩn thận để không làm tổn hại sự ổn định của hệ thống.

Tôi đã nói về việc viết code kernel driver: nếu đi theo con đường này, chắc chắn bạn sẽ muốn biết cách kiểm tra nó có hoạt động đúng không và phát hiện mọi bug. Tôi sẽ đề cập chủ đề đó trong Chương 19.

Chương tiếp theo minh họa các kỹ thuật làm prototype nhanh với single board computer và add-on board.

## Tìm hiểu thêm

- Linux Kernel Development, 3rd Edition, của Robert Love

- Linux Weekly News – `https://lwn.net/Kernel`

- Async IO on Linux: select, poll, and epoll, của Julia Evans – `https://jvns.ca/blog/2017/06/03/async-io-on-linux--select--poll--and-epoll/`

- Essential Linux Device Drivers, 1st Edition, của Sreekrishnan Venkateswaran

## Tham gia cộng đồng của chúng tôi trên Discord

Hãy tham gia không gian Discord của cộng đồng chúng tôi để thảo luận với các tác giả và những độc giả khác: `https://packt.link/embeddedsystems`
