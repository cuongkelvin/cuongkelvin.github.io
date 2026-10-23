# Chương 12. Môi trường phát triển embedded

## Trong chương này

- 12\.1 Môi trường Cross-Development 306

- 12\.2 Yêu cầu host system 311

- 12\.3 Hosting target board 312

- 12\.4 Tổng kết 322

Cấu hình và dịch vụ sẵn có trên host development system

có thể ảnh hưởng rất lớn đến thành công của lập trình viên embedded. Chương này

khảo sát yêu cầu riêng của môi trường cross-development

và một số công cụ, kỹ thuật mà lập trình viên embedded cần

biết để làm việc hiệu quả.

Bắt đầu bằng môi trường cross-development điển hình. Dùng

ví dụ “Hello World” quen thuộc, chúng ta trình bày khác biệt quan trọng giữa

ứng dụng host-based và ứng dụng nhắm embedded system. Cũng xem

khác biệt toolchain phát triển ứng dụng native và embedded.

Sau đó trình bày yêu cầu host system, chi tiết cách dùng một số thành

phần quan trọng. Kết thúc chương bằng ví dụ

target board được phục vụ bởi host network-based.

## 12.1 Môi trường Cross-Development

Lập trình viên mới làm quen với phát triển embedded thường gặp khó khăn với các khái niệm và sự khác biệt giữa môi trường native và cross-development. Thực tế, một hệ thống thường có ba compiler và ba hoặc nhiều hơn phiên bản standard header file, chẳng hạn `stdlib.h`. Việc debug ứng dụng trên target embedded system có thể khó khăn nếu thiếu các công cụ và tiện ích host-based phù hợp. Bạn phải quản lý và tách riêng những file, utility được thiết kế để chạy trên host system với những file, utility định sử dụng trên target.

Khi dùng thuật ngữ host trong ngữ cảnh này, chúng ta muốn nói đến development workstation đặt trên bàn của bạn và chạy Linux desktop distribution mà bạn yêu thích.[^1] Ngược lại, thuật ngữ target chỉ embedded hardware platform của bạn. Vì vậy, native development là việc biên dịch và build ứng dụng trên host system và để chạy trên chính hệ thống đó. Cross-development là việc biên dịch và build ứng dụng trên host system để chạy trên embedded system. Ghi nhớ các định nghĩa này sẽ giúp bạn theo dõi chính xác nội dung xuyên suốt chương.

Hình 12-1 trình bày cách bố trí một môi trường cross-development điển hình. Host PC được nối với target board qua một hoặc nhiều physical connection. Thuận tiện nhất là target có cả serial port lẫn Ethernet port. Sau này, khi thảo luận kernel debugging, bạn sẽ nhận ra serial port thứ hai có thể rất hữu ích.

![Figure 12-1](images/ch12/fig12-01.png)

HÌNH 12-1 Thiết lập Cross-development

Trong tình huống phổ biến nhất, lập trình viên có một serial terminal trên host nối với RS-232 serial port, có thể thêm một hoặc nhiều telnet hoặc SSH terminal session đến target board và một hoặc nhiều debug session dùng Ethernet làm phương tiện kết nối. Cấu hình cross-development này mang lại tính linh hoạt cao. Ý tưởng cơ bản là host system cung cấp năng lực xử lý để chạy compiler, debugger, editor và các utility khác, còn target chỉ thực thi ứng dụng được thiết kế cho nó. Bạn hoàn toàn có thể chạy compiler và debugger trên target system, nhưng chúng ta giả định host system có nhiều resource hơn, bao gồm năng lực processor, RAM, disk storage và Internet connectivity. Thực tế, không hiếm target embedded board không có human-input device hoặc output display.

### 12.1.1 “Hello World” embedded

Một hệ thống cross-development được cấu hình đúng che giấu nhiều chi tiết phức tạp khỏi lập trình viên ứng dụng thông thường. Xem một ví dụ đơn giản sẽ giúp làm rõ và giải thích một phần những điều bí ẩn này. Khi biên dịch chương trình “Hello World” đơn giản, toolchain, gồm compiler, linker và các utility liên quan, đưa ra nhiều giả định về host system đang dùng để build và chương trình đang được biên dịch. Thực ra, đó không phải giả định mà là tập hợp quy tắc compiler tham chiếu để build binary chính xác.

Listing 12-1 tái hiện chương trình “Hello World” đơn giản.

LISTING 12-1 Hello World một lần nữa

```
#include <stdio.h>

int main(int argc, char **argv)
{
    printf(“Hello World\n”);
    return 0;
}
```

Ngay cả người chỉ thỉnh thoảng lập trình ứng dụng cũng nhận ra một số điểm quan trọng về source file C này. Trước hết, function `printf()` được tham chiếu nhưng không được định nghĩa trong file. Nếu bỏ directive `#include` chứa prototype của function `printf()`, compiler sẽ phát thông báo quen thuộc sau:

```
hello.c:5: warning: implicit declaration of function ‘printf’
```

Điều này đặt ra vài câu hỏi thú vị:

- File `stdio.h` nằm đâu và được tìm thế nào?

- Function object code của `printf()` lưu đâu trên hệ thống, tham chiếu này được giải quyết thế nào trong binary executable?

Dường như compiler tự biết cách ghép thành một binary file chính xác có thể thực thi từ command line. Để mọi việc phức tạp hơn, executable cuối cùng còn chứa startup và shutdown prologue code mà chúng ta không bao giờ thấy nhưng linker tự động đưa vào. Prologue này xử lý các chi tiết như environment và argument được truyền đến chương trình, các công việc chuẩn bị khi startup và shutdown, xử lý exit, cùng nhiều việc khác.

Để build “Hello World”, có thể gọi compiler đơn giản trên command-line như:

```
$ gcc -o hello hello.c
```

Lệnh này tạo binary executable file tên `hello`, có thể được thực thi trực tiếp từ command line. Các giá trị mặc định mà compiler tham chiếu chỉ dẫn nơi tìm include file. Tương tự, linker biết cách giải quyết tham chiếu đến function `printf()` bằng cách đưa vào tham chiếu đến library định nghĩa function đó. Tất nhiên, đó là standard C library.

Chúng ta có thể truy vấn toolchain để xem một số giá trị mặc định đã được sử dụng. Listing 12-2 trình bày một phần output của `cpp` khi được truyền flag `-v`. Có thể bạn đã biết `cpp` là thành phần C preprocessor của GNU gcc toolchain. Chúng tôi đã thêm một chút định dạng, chỉ gồm khoảng trắng, để nội dung dễ đọc hơn.

LISTING 12-2 Search directory mặc định của native `cpp`

```
$ cpp -v /dev/null
Reading specs from /usr/lib/gcc-lib/i386-redhat-linux/3.3.3/specs
Configured with: ../configure --prefix=/usr
--mandir=/usr/share/man --infodir=/usr/share/info
--enable-shared --enable-threads=posix --disable-checking
--disable-libunwind-exceptions --with-system-zlib
--enable-__cxa_atexit -host=i386-redhat-linux

Thread model: posix
gcc version 3.3.3 20040412 (Red Hat Linux 3.3.3-7)
 /usr/lib/gcc-lib/i386-redhat-linux/3.3.3/cc1 -E -quiet -v -
ignoring nonexistent directory “/usr/i386-redhat-linux/include”

#include “...” search starts here:
#include <...> search starts here:
 /usr/local/include
 /usr/lib/gcc-lib/i386-redhat-linux/3.3.3/include
 /usr/include
End of search list.
/usr/lib/
```

Truy vấn đơn giản này cung cấp một số thông tin hữu ích. Trước hết, chúng ta thấy cách compiler được cấu hình bằng tiện ích `./configure` quen thuộc. Thread model mặc định là `posix`, quyết định thread library mà ứng dụng được link đến nếu sử dụng threading function. Cuối cùng, bạn thấy các search directory mặc định dành cho directive `#include`.

Nhưng nếu chúng ta muốn build `hello.c` cho một architecture khác, chẳng hạn Power Architecture, thì sao? Khi biên dịch ứng dụng cho Power Architecture target bằng cross-compiler trên host machine, chúng ta phải bảo đảm compiler không sử dụng các host include directory hoặc library path mặc định. Sử dụng cross-compiler được cấu hình đúng là bước đầu tiên; có một môi trường cross-development well-designed là bước thứ hai.

Listing 12-3 là output của một toolchain open-source cross-development phổ biến tên Embedded Linux Development Kit (ELDK), do Denx Software Engineering tập hợp và duy trì. Bản cài đặt cụ thể này được cấu hình cho Power Architecture 82xx toolchain. Một lần nữa, chúng tôi đã thêm khoảng trắng vào output để dễ đọc.

LISTING 12-3 Search directory mặc định Cross-Search

```
$ ppc_82xx-cpp -v /dev/null
Reading specs from /opt/eldk/usr/bin/..
/lib/gcc-lib/ppc-linux/3.3.3/specs

Configured with: ../configure --prefix=/usr
--mandir=/usr/share/man --infodir=/usr/share/info
--enable-shared --enable-threads=posix --disable-checking
--with-system-zlib --enable-__cxa_atexit --with-newlib
--enable-languages=c,c++ --disable-libgcj
--host=i386-redhat-linux -target=ppc-linux

Thread model: posix

gcc version 3.3.3 (DENX ELDK 3.1.1 3.3.3-10)
 /opt/eldk/usr/bin/../lib/gcc-lib/ppc-linux/3.3.3/cc1
-E -quiet -v -iprefix /opt/eldk/usr/bin/..
/lib/gcc-lib/ppc-linux/3.3.3/ -D__unix__ -D__gnu_linux__
-D__linux__ -Dunix -D__unix -Dlinux -D__linux -Asystem=unix
-Asystem=posix - -mcpu=603

ignoring nonexistent directory “/opt/eldk/usr/ppc-linux/sys-include”
ignoring nonexistent directory “/opt/eldk/usr/ppc-linux/include”
#include “...” search starts here:

#include <...> search starts here:
 /opt/eldk/usr/lib/gcc-lib/ppc-linux/3.3.3/include
 /opt/eldk/ppc_82xx/usr/include

End of search list.
```

Ở đây, bạn có thể thấy các search path mặc định cho include directory đã được điều chỉnh để trỏ đến các phiên bản cross thay vì native include directory. Chi tiết tưởng chừng khó hiểu này rất quan trọng để có thể phát triển ứng dụng và biên dịch open source package cho embedded system. Đây là một trong những chủ đề dễ gây nhầm lẫn nhất, ngay cả với lập trình viên ứng dụng giàu kinh nghiệm nhưng mới làm quen embedded system.

## 12.2 Yêu cầu host system

Development workstation của bạn phải có một số thành phần và hệ thống quan trọng. Trước hết, bạn cần một cross toolchain được cấu hình đúng. Bạn có thể tự tải xuống và biên dịch một toolchain hoặc sử dụng một trong nhiều commercial toolchain có sẵn. Việc tự build toolchain nằm ngoài phạm vi cuốn sách; tuy nhiên, có một số tài liệu tham khảo tốt về chủ đề này. Xem phần cuối chương để biết các tài liệu được đề xuất.

Thành phần quan trọng tiếp theo bạn cần là một Linux distribution dành cho architecture của embedded system. Distribution này gồm hàng trăm đến có thể hàng nghìn file tạo nên nội dung các file system trên embedded system. Một lần nữa, bạn có thể tự build hoặc lấy một distribution thương mại. Một trong những open source embedded system distribution phổ biến hơn là ELDK đã đề cập. ELDK có sẵn cho nhiều target Power Architecture, ARM và các embedded target khác. Chủ đề tự build embedded Linux distribution từ đầu cần riêng một cuốn sách có độ dày tương đương, nên nằm ngoài phạm vi thảo luận. Chúng ta giới thiệu open source build system trong Chương 16, “Open source build system”.

Tóm lại development host cần bốn khả năng riêng biệt:

- Cross toolchain và library

- Target system package, gồm chương trình, utility, library

- Host tool như editor, debugger, utility

- Server để hosting target board, như phần tiếp

Nếu bạn cài một embedded Linux development environment ready-built trên workstation, dù là sản phẩm thương mại hay bản miễn phí từ cộng đồng open source, toolchain và các thành phần đã được cấu hình sẵn để hoạt động cùng nhau. Ví dụ, toolchain đã được cấu hình với các directory search path mặc định khớp với vị trí target header file và system library trên development workstation. Tình huống trở nên phức tạp hơn nhiều nếu bạn cần hỗ trợ nhiều architecture và processor trên development workstation. Đây là lý do các commercial embedded Linux distribution tồn tại.

### 12.2.1 Hardware debug probe

Ngoài các thành phần vừa liệt kê, bạn nên cân nhắc một hình thức debugging hardware-assisted. Giải pháp này gồm hardware probe nối đến host, thường qua Ethernet, và nối đến target qua debug connector trên board. Có nhiều giải pháp sẵn có. Chuẩn thực tế trong cộng đồng Linux vẫn là Abatron BDI-3000. Chủ đề này được trình bày chi tiết trong Chương 14, “Kỹ thuật debug kernel”.

## 12.3 Hosting target board

Xem Hình 12-1, bạn sẽ thấy Ethernet connection từ board target-embedded đến hệ thống host-development. Kết nối này không hoàn toàn bắt buộc; thực tế, một số embedded device nhỏ hơn không có Ethernet interface. Tuy nhiên, đây là ngoại lệ. Việc có Ethernet connection trên target board rất xứng đáng với chi phí silicon bỏ ra! Nó cho phép cấu hình NFS root mount, có thể tiết kiệm nhiều ngày hoặc nhiều tuần phát triển.

Trong quá trình phát triển embedded Linux kernel, bạn sẽ biên dịch và tải kernel cùng root file system xuống embedded board nhiều lần. Nhiều embedded development system và bootloader hỗ trợ TFTP và giả định lập trình viên sẽ sử dụng nó. TFTP là một giao thức nhẹ để chuyển file giữa TFTP server và TFTP client qua Ethernet, tương tự FTP.

Sử dụng TFTP từ bootloader để load kernel sẽ giúp bạn tiết kiệm vô số giờ chờ tải xuống qua serial, ngay cả khi sử dụng serial baud rate cao. Việc load root file system hoặc ramdisk image còn có thể mất nhiều thời gian hơn, vì các image này có thể đạt kích thước hàng chục megabyte hoặc lớn hơn tùy yêu cầu của bạn. Thời gian đầu tư vào việc cấu hình và sử dụng TFTP chắc chắn sẽ mang lại lợi ích, và tác giả rất khuyến nghị việc này. Rất ít thiết kế thiếu chỗ để bố trí Ethernet port trong quá trình phát triển, ngay cả khi không lắp các linh kiện của port này khi sản xuất.

### 12.3.1 TFTP server

Việc cấu hình TFTP trên Linux development host không khó. Tất nhiên, các chi tiết có thể khác nhau tùy Linux distribution mà bạn chọn cho development workstation. Những hướng dẫn được trình bày ở đây dựa trên các desktop Linux distribution phổ biến.

TFTP là một TCP/IP service cần được bật trên workstation. Để bật TFTP service, bạn phải cấu hình workstation phản hồi các TFTP packet đến. Cách dễ nhất là chạy một TFTP server daemon. Phần lớn desktop Linux distribution hiện đại cung cấp nhiều package để triển khai service này. Các ví dụ ở đây sử dụng TFTP server của HPA làm cơ sở. Bạn có thể tải server này tại ftp://ftp.kernel.org/pub/software/network/tftp.

Trên Ubuntu hiện đại và hệ thống Debian-based khác, cài HPA TFTP server như sau:[^2]

```
$ sudo apt-get install tftpd-hpa
```

Việc cấu hình TFTP server này rất dễ. Trên Ubuntu và một số distribution khác, server có một configuration file duy nhất tên là `/etc/default/tftpd-hpa`. Bạn cần tùy chỉnh file này theo các yêu cầu cụ thể của mình. Listing 12-4 trình bày một ví dụ điển hình về configuration file đó.

LISTING 12-4 Cấu hình TFTP

```
#Defaults for tftpd-hpa
RUN_DAEMON=”yes”
OPTIONS=”-l -c -s /tftpboot”
```

Việc đầu tiên bạn phải làm là bật service. Khi bạn mới cài đặt package `tftpd-hpa`, `RUN_DAEMON` có giá trị mặc định là `“no”`. Để bật service, bạn phải đổi giá trị mặc định `“no”` thành `“yes”`, như trong Listing 12-4.

Dòng thứ hai định nghĩa các command-line option cho chính daemon, thường là `/usr/sbin/in.tftpd`. Switch `-s` yêu cầu `in.tftpd` chuyển sang directory được chỉ định, `/tftpboot`, khi khởi động, khiến directory này trở thành root của TFTP server. Flag `-c` cho phép tạo file mới. Điều này hữu ích để ghi file từ target lên server. BDI-3000, được trình bày sau trong sách, có khả năng này và tính năng đó không hoạt động nếu thiếu `-c`. Argument `-l` yêu cầu TFTP daemon chạy nền và lắng nghe các TFTP packet đến trên TFTP port.

Sau khi sửa configuration file phải restart TFTP server để có hiệu lực:

```
$ sudo /etc/init.d/tftpd-hpa restart
```

Dù cách nào, tham khảo tài liệu distribution để biết tùy chọn bật TFTP server phù hợp.

### 12.3.2 BOOTP/DHCP server

Có DHCP server trên development host giúp đơn giản hóa việc quản lý cấu hình embedded target. Chúng ta đã xác định những lý do nên có Ethernet interface trên target hardware. Khi Linux boot trên target board, nó cần cấu hình Ethernet interface trước khi interface sử dụng được. Hơn nữa, nếu target board dùng cấu hình NFS root mount, Linux cần cấu hình Ethernet interface của target trước khi quá trình boot có thể hoàn tất. Chúng ta đã trình bày chi tiết NFS trong Chương 9, “File system”.

Nhìn chung Linux dùng hai phương pháp khởi tạo Ethernet/IP interface lúc boot:

- Hard-code Ethernet interface parameter trên Linux kernel command line hoặc default configuration, như cấu hình IP tĩnh.

- Cấu hình kernel tự phát hiện network setting lúc boot.

Vì những lý do dễ thấy, lựa chọn thứ hai linh hoạt hơn. DHCP hoặc BOOTP là giao thức mà target và server sử dụng để tự động xác định các network setting. Để biết chi tiết về hai giao thức DHCP và BOOTP, xem phần cuối chương này.

DHCP server kiểm soát việc gán IP address cho những IP subnet mà nó đã được cấu hình phục vụ và những DHCP hoặc BOOTP client được cấu hình tham gia. DHCP server lắng nghe request từ DHCP client, chẳng hạn target board, rồi gán địa chỉ cùng thông tin liên quan khác cho client trong quá trình boot. Bạn có thể khảo sát một DHCP exchange điển hình, xem Listing 12-5, bằng cách khởi chạy DHCP server với debug switch `-d` rồi quan sát output khi target machine yêu cầu cấu hình.

LISTING 12-5 Trao đổi DHCP điển hình

```
tgt> DHCPDISCOVER from 00:09:5b:65:1d:d5 via eth0
svr> DHCPOFFER on 192.168.0.9 to 00:09:5b:65:1d:d5 via eth0
tgt> DHCPREQUEST for 192.168.0.9 (192.168.0.1) from \
       00:09:5b:65:1d:d5 via eth0
svr> DHCPACK on 192.168.0.9 to 00:09:5b:65:1d:d5 via eth0
```

Trình tự bắt đầu khi client (target) phát một broadcast frame để tìm DHCP server. Bước này được thể hiện qua message DHCPDISCOVER. Server phản hồi bằng cách đề nghị cấp một IP address cho client, nếu server đã được cấu hình và bật để làm việc đó. Message DHCPOFFER thể hiện phản hồi này. Sau đó, client phản hồi bằng cách kiểm tra IP address này trong phạm vi cục bộ. Việc kiểm tra bao gồm gửi DHCPREQUEST packet đến DHCP server, như trong hình. Cuối cùng, server phản hồi bằng cách xác nhận việc gán IP address cho client, qua đó hoàn tất quá trình tự động cấu hình target.

Một điểm thú vị là client được cấu hình đúng sẽ ghi nhớ địa chỉ gần nhất mà DHCP server đã gán cho nó. Trong lần boot tiếp theo, client sẽ bỏ qua giai đoạn DHCPDISCOVER và chuyển thẳng sang DHCPREQUEST, với giả định rằng nó có thể sử dụng lại IP address mà server đã gán trước đó. Linux kernel trong quá trình boot không có khả năng này và phát cùng một trình tự message mỗi lần boot.

Việc cấu hình DHCP server trên host không khó. Như thường lệ, chúng tôi khuyên bạn tham khảo tài liệu đi kèm desktop Linux distribution của mình. Trên Red Hat hoặc Fedora, configuration entry cho một target có thể giống như Listing 12-6.

LISTING 12-6 Cấu hình DHCP server mẫu

```
# Example DHCP Server configuration
allow bootp;

subnet 192.168.1.0 netmask 255.255.255.0 {
 default-lease-time 1209600;     # two weeks
  option routers 192.168.1.1;
  option domain-name-servers 1.2.3.4;
  group {
    host pdna1 {
      hardware ethernet 00:30:bd:2a:26:1f;
      fixed-address 192.168.1.68;
      filename “uImage-pdna”;
      option root-path “/home/chris/sandbox/pdna-target”;
    }
  }
}
```

Đây là một ví dụ đơn giản, chỉ nhằm minh họa loại thông tin mà bạn có thể truyền đến target system. Host definition này xác định mapping one-to-one giữa target MAC address và IP address được gán cho target đó. Ngoài IP address cố định, bạn còn có thể truyền các thông tin khác đến target. Trong ví dụ này, các địa chỉ default router và DNS server được truyền đến target, cùng với tên của một file do bạn chọn và root path để kernel mount NFS root file system từ đó. Bootloader có thể sử dụng filename này để load kernel image từ TFTP server. Bạn cũng có thể cấu hình DHCP server cấp IP address từ một dải định sẵn, nhưng sử dụng địa chỉ cố định như trong Listing 12-6 rất thuận tiện.

Trước hết, bạn phải bật DHCP server trên Linux development workstation. Thao tác này thường được thực hiện qua main menu hoặc command line. Tham khảo tài liệu Linux distribution để biết các bước phù hợp với môi trường của bạn. Ví dụ, để bật DHCP server trên Fedora Core Linux, chỉ cần nhập lệnh sau tại root command prompt:

```
$ /etc/init.d/dhcpd start
```

hoặc

```
$ /etc/init.d/dhcpd restart
```

Bạn phải thực hiện thao tác này mỗi khi khởi động development workstation, trừ khi bạn cấu hình service tự khởi động. Tham khảo tài liệu đi kèm distribution để biết cách thực hiện. Thông thường, bạn sẽ tìm thấy mục hướng dẫn bật service hoặc nội dung tương tự. Trong ví dụ này, dhcpd được xem là một system service.

Việc cài đặt DHCP server có nhiều chi tiết cần chú ý. Vì vậy, trừ khi server nằm trên private network, bạn nên trao đổi với system administrator trước khi đưa DHCP server của mình vào hoạt động. Nếu dùng chung corporate LAN, rất có thể bạn sẽ gây ảnh hưởng đến DHCP service sẵn có của mạng đó.

### 12.3.3 NFS server

Dùng NFS root mount cho target board là công cụ phát triển rất mạnh. Một số ưu điểm cấu hình khi phát triển:

- Root file system không size-restricted bởi tài nguyên board giới hạn như Flash memory.

- Thay đổi application file lúc phát triển sẵn có ngay trên target.

- Có thể debug, boot kernel trước khi phát triển, debug root file system.

Các bước thiết lập NFS server khác nhau tùy desktop Linux distribution bạn sử dụng. Cũng như các service khác được mô tả trong chương này, bạn phải tham khảo tài liệu Linux distribution để biết chi tiết phù hợp với cấu hình của mình. NFS service phải được khởi động từ startup script, graphical menu hoặc command line. Ví dụ, lệnh khởi động NFS service tại root command prompt trên Fedora Core Linux desktop như sau:

```
$ /etc/init.d/nfs start
```

hoặc

```
$ /etc/init.d/nfs restart
```

Chú ý Ubuntu mới hơn và distribution khác đổi lệnh này thành `/etc/init.d/nfs-kernel-server`.

Bạn phải thực hiện thao tác này mỗi khi khởi động desktop Linux workstation. (Service này và các service khác có thể tự khởi động khi boot. Hãy tham khảo tài liệu desktop Linux distribution của bạn.) Ngoài việc bật service, kernel phải được biên dịch với hỗ trợ NFS. Mặc dù DHCP và TFTP đều là user space utility, NFS cần được kernel hỗ trợ. Điều này áp dụng cho cả development workstation và target board. Hình 12-2 trình bày các configuration option dành cho NFS trong kernel. Chú ý rằng có các option hỗ trợ cả NFS server lẫn client. Cũng cần chú ý option “Root file system on NFS”. Target kernel phải được cấu hình option này để thực hiện NFS root mount.

![Figure 12-2](images/ch12/fig12-02.png)

HÌNH 12-2 Kernel configuration cho NFS

NFS server lấy chỉ dẫn từ exports file trên development workstation, thường `/etc/exports`. Listing 12-7 là exports entry đơn giản.

LISTING 12-7 File NFS `exports` đơn giản

```
$ cat /etc/exports
# /etc/exports
/home/chris/sandbox/coyote-target \ *(rw,sync,no_root_squash,no_all_squash,no_sub-
tree_check)
/home/chris/sandbox/pdna-target \ *(rw,sync,no_root_squash,no_all_squash,no_sub-
tree_check)
/home/chris/workspace \ *(rw,sync,no_root_squash,no_all_squash,no_subtree_check)
```

Các entry này cho phép client mount từ xa bất kỳ directory nào trong ba directory được trình bày. Các thuộc tính sau phần chỉ định directory yêu cầu NFS server chấp nhận kết nối từ mọi IP address (`*`) và mount directory tương ứng với các thuộc tính được cho, tức read/write với `no_root_squash`. Thuộc tính sau cho phép client có root privilege thực hiện các quyền đó trên directory được chỉ định. Điều này thường cần thiết khi làm việc với embedded system, vì bạn thường chỉ có root account.

Thuộc tính `no_all_squash` bảo đảm uid và gid trong các NFS request đến được tôn trọng thay vì bị map sang anonymous account mặc định. Thuộc tính `no_subtree_check` tắt subtree checking trên server, có thể cải thiện hiệu năng và độ tin cậy trong một số trường hợp. Tham khảo tài liệu NFS server và man page của exports file để biết thêm thông tin.

Bạn có thể kiểm tra cấu hình NFS ngay trên workstation. Giả sử bạn đã bật NFS service, đồng nghĩa với việc bật cả thành phần NFS server lẫn client, bạn có thể mount một NFS export cục bộ như khi mount bất kỳ file system nào khác:

```
# mount -t nfs localhost:/home/chris/workspace /mnt/remote
```

Nếu lệnh thành công và file trong `.../workspace` có sẵn tại `/mnt/remote`, NFS server configuration hoạt động.

### 12.3.4 NFS root mount cho target

Việc mount target bằng NFS root mount không khó và, như đã đề cập ở những phần khác, đây là một cấu hình rất hữu ích trong quá trình phát triển. Tuy nhiên, một số chi tiết phải được thiết lập chính xác thì cấu hình này mới hoạt động. Các bước cần thực hiện như sau:

1\. Cấu hình NFS server và export target file system đúng cho architecture.

2\. Cấu hình target kernel với NFS client service, root file system on NFS.

3\. Bật autoconfiguration kernel-level cho Ethernet interface target.

4\. Cung cấp target Ethernet IP configuration bằng kernel command line hoặc static kernel configuration option.

5\. Cung cấp kernel command line bật NFS.

Chúng ta đã trình bày kernel configuration trong Hình 12-2 khi giải thích cấu hình NFS server. Bạn phải bảo đảm cấu hình target kernel đã bật NFS client service; đặc biệt, bạn phải bật option Root file system on NFS. Cụ thể, hãy bảo đảm kernel có `CONFIG_NFS_FS=y` và `CONFIG_ROOT_NFS=y`. Rõ ràng, bạn không thể cấu hình NFS dưới dạng loadable module nếu định boot bằng NFS root mount.

Autoconfiguration Kernel-level là một TCP/IP configuration option trong tab Networking của kernel configuration utility. Hãy bật `CONFIG_IP_PNP` trong target kernel. Khi chọn option này, bạn sẽ thấy thêm một số option cấu hình tự động. Chọn BOOTP hoặc DHCP như mô tả. Hình 12-3 minh họa kernel configuration cho autoconfiguration kernel-level.

![Figure 12-3](images/ch12/fig12-03.png)

HÌNH 12-3 Autoconfiguration Kernel-level

Sau khi server và target kernel đã được cấu hình, bạn phải cung cấp target Ethernet configuration bằng một trong những phương pháp đã thảo luận. Nếu bootloader hỗ trợ kernel command line, đây là cách dễ nhất. Kernel command line hỗ trợ NFS root mount có thể như sau:

```
console=ttyS0,115200 root=/dev/nfs rw ip=dhcp \
   nfsroot=192.168.1.9:/home/chris/sandbox/pdna-target
```

### 12.3.5 Ví dụ NFS root mount U-Boot

U-Boot là một ví dụ về bootloader hỗ trợ kernel command line có thể cấu hình. Sử dụng tính năng nonvolatile environment của U-Boot, bạn có thể lưu command line trong một parameter được đặt tên riêng cho mục đích này. Để bật NFS command line trong U-Boot, thực hiện như sau; toàn bộ nội dung phải nằm trên một dòng của serial terminal:

```
setenv bootargs console=ttyS0,115200 root=/dev/nfs rw \
   ip=dhcp nfsroot=192.168.1.9:/home/chris/sandbox/pdna-target
```

Sau đó load kernel bằng TFTP server. Listing 12-8 cho dạng có thể thấy trên Power Architecture embedded target.

LISTING 12-8 Load kernel bằng TFTP server

```
=> tftpboot 200000 uImage-pdna      <<< Entered at U-Boot prompt
Using FEC ETHERNET device
TFTP from server 192.168.1.9; our IP address is 192.168.1.68
Filename ‘uImage-pdna’.
Load address: 0x200000
Loading: ##################################################
         ##################################################
         #########################################
done
Bytes transferred = 911984 (dea70 hex)
=>
```

Khi boot kernel, bạn sẽ thấy bằng chứng rõ ràng về cấu hình NFS root mount. Listing 12-9 trình bày lại output được chọn từ các kernel boot message để minh họa hoạt động này. Output đã được định dạng, lược bỏ nhiều dòng và thêm khoảng trắng để dễ đọc.

LISTING 12-9 Boot với NFS root mount

```
Uncompressing Kernel Image ... OK
Linux version 2.6.14 (chris@pluto) (gcc version 3.3.3
(DENX ELDK 3.1.1 3.3.3-10)) #1 Mon Jan 2 11:58:48 EST 2006
.
.
Kernel command line: console=ttyS0,115200 root=/dev/nfs rw
nfsroot=192.168.1.9:/home/chris/sandbox/pdna-target ip=dhcp
.
.
Sending DHCP requests ... OK
IP-Config: Got DHCP answer from 192.168.1.9, my address is 192.168.1.68
IP-Config: Complete:
      device=eth0, addr=192.168.1.68, mask=255.255.255.0,
      gw=255.255.255.255, host=192.168.1.68, domain=,
      nis-domain=(none), bootserver=192.168.1.9,
      rootserver=192.168.1.9,
      rootpath=/home/chris/sandbox/pdna-target
.
.
Looking up port of RPC 100003/2 on 192.168.1.9
Looking up port of RPC 100005/1 on 192.168.1.9
VFS: Mounted root (nfs filesystem).
.
.


BusyBox v0.60.5 (2005.06.07-07:03+0000) Built-in shell (msh)
Enter ‘help’ for a list of built-in commands.

#
```

Trong Listing 12-9 đầu tiên thấy kernel banner, rồi kernel command line. Chúng ta chỉ định bốn mục:

- Console device (`/dev/console`)

- Root device (`/dev/nfs`)

- NFS root path (`/home/chris/sandbox/pdna-target`)

- Phương pháp IP autoconfiguration kernel-level (`dhcp`)

Ngay sau đó, chúng ta thấy kernel thử thực hiện autoconfiguration kernel-level qua DHCP, bắt đầu bằng console message “Sending DHCP requests”. Khi server phản hồi và quá trình trao đổi hoàn tất, kernel hiển thị cấu hình đã xác định trong các dòng tiếp theo. Từ listing, bạn có thể thấy DHCP server đã gán IP address 192.168.1.68 cho target. Hãy so sánh các thiết lập lấy tự động với cấu hình DHCP server trong Listing 12-6. Bạn có thể dùng cấu hình tương tự để gán IP address và NFS root path cho target.

Khi kernel hoàn tất IP autoconfiguration, nó có thể mount root file system bằng các parameter được cung cấp. Bạn có thể thấy điều này qua ba dòng kết thúc bằng message của VFS (virtual file subsystem), thông báo rằng NFS root file system đã được mount. Sau khi NFS root file system được mount, quá trình initialization hoàn tất như mô tả trong Chương 5, “Khởi tạo kernel”.

Bạn cũng có thể truyền các IP setting của target đến kernel theo cách tĩnh, thay vì để kernel lấy chúng từ DHCP hoặc BOOTP server. Các IP setting có thể được truyền trực tiếp qua kernel command line. Trong trường hợp này, kernel command line có thể tương tự như sau:

```
console=console=ttyS0,115200 \
   ip=192.168.1.68:192.168.1.9::255.255.255.0:pdna:eth0:off \
   root=/dev/nfs rw nfsroot=192.168.1.9:/home/chris/pdna-target
```

## 12.4 Tổng kết

Chương này cung cấp kiến thức nền tảng để build và cấu hình một development workstation phù hợp cho công việc phát triển embedded. Chúng ta đã giới thiệu một số server quan trọng, cùng thông tin về cách cài đặt và cấu hình chúng. Cuối chương, chúng ta đã tìm hiểu một trong những công cụ mạnh nhất dành cho lập trình viên embedded: NFS server.

- Nhiều tính năng của development environment giúp nâng cao đáng kể hiệu quả của embedded cross-development. Phần lớn những tính năng này thuộc nhóm tool và utility. Chúng ta sẽ trình bày chi tiết khía cạnh này trong chương tiếp theo về development tool.

- Development host cấu hình đúng là tài sản thiết yếu cho lập trình viên embedded.

- Toolchain dùng cross-development phải cấu hình đúng khớp target Linux environment của host system.

- Development host phải có các target component mà toolchain và binary utility tham chiếu, bao gồm target header file, library, target binary và configuration file liên quan. Nói cách khác, bạn cần tập hợp hoặc lấy một embedded Linux distribution.

- Cấu hình các target server như TFTP, DHCP và NFS giúp tăng đáng kể năng suất của lập trình viên embedded Linux. Chương này đã giới thiệu ví dụ cấu hình cho từng loại server.

### 12.4.1 Gợi ý đọc thêm

Tài liệu GCC trực tuyến http://gcc.gnu.org/onlinedocs/

Build và test gcc/glibc cross toolchain http://kegel.com/crosstool/

“The TFTP Protocol, Version 2” RFC 1350 www.ietf.org/rfc/rfc1350.txt?number=1350

“Bootstrap Protocol (BOOTP)” RFC 951 www.ietf.org/rfc/rfc0951.txt?number=951

“Dynamic Host Configuration Protocol” RFC 2131 www.ietf.org/rfc/rfc2131.txt?number=2131 Trang này được cố ý để trống

[^1]: Webster’s định nghĩa điều vô lý là “ý tưởng phi lý hoặc trái lẽ thường”. Theo tác giả, phát triển embedded Linux platform trên host non-Linux/UNIX là vô lý.

[^2]: Đừng nhầm package này với TFTP client package có tên tftp-hpa.
