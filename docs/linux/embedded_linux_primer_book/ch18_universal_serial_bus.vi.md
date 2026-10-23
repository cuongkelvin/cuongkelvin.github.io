# Chương 18. Universal Serial Bus

## Trong chương này

- 18\.1 Tổng quan USB 488

- 18\.2 Cấu hình USB 495

- 18\.3 sysfs và đặt tên USB device 500

- 18\.4 Công cụ USB hữu ích 502

- 18\.5 USB subsystem phổ biến 508

- 18\.6 Debug USB 516

- 18\.7 Tổng kết 519

Theo bất kỳ thước đo nào, Universal Serial Bus (USB) cũng đã thành công vang dội.

USB ban đầu được thiết kế để khắc phục những hạn chế của các

I/O interface có trên PC architecture. Ngày nay, thật khó tìm được một thiết bị điện

tử tại siêu thị điện tử gần nhà mà không có USB port.

Máy ảnh kỹ thuật số, máy in, điện thoại di động, IP telephone và tất nhiên là bàn phím

cùng chuột là những ví dụ điển hình về thiết bị có USB interface. Tuy nhiên,

danh sách còn dài hơn nhiều so với suy đoán của người đọc thông thường. Ngay cả một số guitar

pedal của tôi cũng có USB interface!

Đã qua rồi thời bạn cần phần cứng input/output special-purpose cho

các thiết bị thông dụng. Lời hứa của USB thực sự đã trở thành hiện thực, khác với hàng loạt

công nghệ khác từng xuất hiện rồi biến mất. Thực tế, khi chuẩn bị ấn bản thứ hai này,

các Linux driver thử nghiệm đầu tiên dành cho USB 3.0 chỉ vừa

được phát hành. Đáng chú ý là Linux là OS đầu tiên có hỗ trợ này!

## 18.1 Tổng quan USB

Ban đầu, USB có thể trông khá phức tạp. Nó có rất nhiều device và khá nhiều loại embedded host controller. USB có một số chế độ hoạt động, và một controller cụ thể nằm trên processor hoặc bên ngoài processor có thể có nhiều chế độ hoạt động. Nếu từng xem toàn bộ danh sách USB configuration option trong một Linux kernel gần đây, bạn sẽ nhanh chóng nhận ra việc cấu hình có thể gây bối rối. Chúng ta có thể giảm bớt sự bối rối đó bằng cách hiểu một số khái niệm USB cơ bản.

### 18.1.1 USB physical topology

USB là một bus topology master/slave. Mỗi USB bus chỉ có thể có một master, được gọi là host controller. Hình 18-1 minh họa topology cơ bản.

![Figure 18-1](images/ch18/fig18-01.png)

HÌNH 18-1 USB topology đơn giản

Host controller luôn gắn với một root hub. Root hub cung cấp điểm kết nối đến host controller và các chức năng hub ở đỉnh USB hierarchy. Cách bố trí phổ biến nhất là tổ hợp host controller và root hub được đưa trực tiếp ra một connector ở mép board thông qua transceiver chip. Đây chính là connector mà người dùng cuối nhìn thấy.

Các device trong Hình 18-1 là endpoint, tức các thiết bị USB vật lý cắm vào USB hub. Một device có thể hỗ trợ một số chức năng, chẳng hạn audio interface cung cấp cả chức năng input và output. Khái niệm quan trọng ở đây là mỗi USB device cắm vào một và chỉ một hub ở phía upstream so với vị trí của nó trong topology.

Các device trên USB bus được vận hành theo cơ chế polling, do host controller điều khiển. Tại mỗi thời điểm, chỉ một device có thể giao tiếp trên bus theo chỉ dẫn của host controller. Specification có các cơ chế phân bổ một phần bandwidth xác định cho một chức năng cụ thể trong device.

Một trong những tính năng thành công nhất của USB là tính động và khả năng hot-swappable thực sự. Device có thể được cắm vào USB bus bất cứ lúc nào. Software chạy trên máy tính chứa host controller, tất nhiên là Linux, chịu trách nhiệm cấu hình các USB device khi chúng xuất hiện trong topology.

### 18.1.2 USB logical topology

Để hiểu rõ hơn các software component và data flow trong một USB system, việc hiểu logical topology của USB rất hữu ích. Hình 18-2 cho thấy cấu trúc logic của một USB device giả định.

![Figure 18-2](images/ch18/fig18-02.png)

HÌNH 18-2 Functional block diagram của USB device

Mỗi USB device có một số descriptor[^1] cho phép software khám phá khả năng và cấu hình chức năng. Mọi device phải có một device descriptor duy nhất, chứa thông tin như nhà sản xuất (`idVendor`), sản phẩm (`idProduct`), serial number (`iSerialNumber`) và số configuration (`bNumConfigurations`). Các identifier trong dấu ngoặc là tên field thực được tham chiếu trong USB 2.0 specification.

Mỗi configuration được xác định trong device descriptor đều có một configuration descriptor. Configuration descriptor chứa số interface (`bNumInterfaces`) có sẵn trong mỗi configuration và cũng cho biết công suất tối đa cần thiết khi hoạt động ở configuration này (`bMaxPower`). Thông thường, một USB device chỉ có một configuration. Tuy nhiên, một số device có thể có chế độ công suất cao và thấp, hoặc thậm chí nhiều chức năng khác nhau trong cùng một device. Những device này có thể chứa nhiều configuration. Hãy cắm iPod vào USB host và bạn sẽ thấy một ví dụ về nhiều configuration, interface và endpoint!

Mỗi interface được configuration descriptor mô tả đều có một interface descriptor. Interface descriptor chứa một field chỉ định device có bao nhiêu endpoint (`bNumEndpoints`). Endpoint 0 luôn được giả định là tồn tại và không được tính trong interface count. Interface descriptor cũng chứa thông tin mô tả interface class, subclass và protocol theo định nghĩa trong các USB specification.

USB endpoint là phần tử logic thực sự mà software giao tiếp trong quá trình USB device hoạt động. Mỗi endpoint do interface descriptor mô tả, ngoại trừ endpoint 0, đều chứa một endpoint descriptor. Endpoint descriptor xác định các communication parameter của endpoint, bao gồm endpoint address và các endpoint attribute mô tả đặc tính truyền dữ liệu từ mỗi endpoint.

Ở phần sau của chương này, chúng ta giới thiệu utility `lsusb`, cho phép bạn đọc những descriptor này.

Có thể tìm thêm chi tiết trong bản Universal Serial Bus specification đầy đủ được dẫn ở cuối chương này.

### 18.1.3 Các revision USB

USB 1.0 đã được giới thiệu từ hơn một thập kỷ trước. Tài liệu USB 2.0 specification hiện tại cho thấy lịch sử sửa đổi từ tận tháng 11 năm 1994, và khi đó đã là revision 0.7. Specification ban đầu quy định data transfer rate 12 megabit mỗi giây (Mbps), với tốc độ low-speed được xác định là 1,5 Mbps. Revision 2.0 của USB specification được hoàn tất vào tháng 4 năm 2000.[^2] USB 2.0 định nghĩa data transfer rate high-speed là 480 Mbps. Hiện đã có revision 3.0 của USB specification, quy định data transfer rate lên đến gigabit mỗi giây và bổ sung một mức tốc độ nữa: SuperSpeed.

Có thể khó nhớ sự khác biệt giữa full speed và high speed. Dưới đây là phần tóm tắt:

USB 1.0 Low speed 1.5 Mbps

USB 1.0 Full speed 12 Mbps

USB 2.0 High speed 480 Mbps

USB 3.0 Super speed 5 Gbps

### 18.1.4 USB connector

Trừ khi bạn là chuyên gia USB, sự đa dạng của các cấu hình USB connector và cable có thể gây bối rối. Loại connector quen thuộc nhất, được định nghĩa trong specification ban đầu, là USB A connector. Đây là connector hình chữ nhật quen thuộc thường thấy nhất trên laptop và desktop PC. Theo định nghĩa, đầu plug của USB A connector luôn hướng upstream, về phía host controller/root hub. Hình 18-3 cho thấy một USB A plug tiêu chuẩn.

![Figure 18-3](images/ch18/fig18-03.png)

HÌNH 18-3 USB A plug

Một peripheral (slave) device như máy in hoặc máy quét thường có USB B receptacle để nhận USB B plug, cũng được định nghĩa trong USB specification ban đầu. Một cable thông dụng để nối host, chẳng hạn PC, với peripheral, chẳng hạn máy in, có A plug ở một đầu và B plug ở đầu kia. B plug hẹp hơn A plug và có hình gần chữ D hơn là hình chữ nhật. Theo định nghĩa, USB B connector luôn hướng downstream, tức ra xa host controller/root hub. Hình 18-4 cho thấy một USB B plug.

![Figure 18-4](images/ch18/fig18-04.png)

HÌNH 18-4 USB B plug

Cũng có một số cấu hình plug thu nhỏ. Các device có kích thước nhỏ hơn như điện thoại di động và PDA đã tạo ra nhu cầu về plug và receptacle nhỏ hơn nữa. USB Mini-A connector đã bị specification coi là lỗi thời, mặc dù nó vẫn được sử dụng. Mini-B connector được sử dụng rộng rãi trên các peripheral device nhỏ.

Micro-USB specification định nghĩa thêm ba loại connector: Micro-B plug và receptacle, Micro-AB receptacle, cùng Micro-A plug. Micro-AB receptacle chỉ được dùng trên các thiết bị USB On-The-Go (OTG), sẽ được thảo luận ở phần sau.

Tóm lại về các connector A và B tiêu chuẩn: A receptacle luôn ở phía host (A plug luôn hướng upstream), còn B connector luôn ở phía peripheral (B plug luôn hướng downstream). Bảng 18-1 tóm tắt những đặc điểm này.

BẢNG 18-1 Tổng quan USB connector

| Connector | Plug | Receptacle |
|---|---|---|
| Dòng A | Hướng về host (hoặc hub) | Đóng vai trò output của host (hoặc hub) |
| Dòng B | Hướng về peripheral | Đóng vai trò input của peripheral (hoặc hub) |

### 18.1.5 USB cable assembly

Các USB specification mới nhất xác định rằng chỉ những cable assembly được liệt kê trong Bảng 18-2 mới tuân theo tiêu chuẩn.

BẢNG 18-2 USB cable và ứng dụng điển hình

| Cable type | Ứng dụng điển hình |
|---|---|
| Plug Standard-A tới plug Standard-B | Host tiêu chuẩn (PC) tới peripheral device như máy in |
| Plug Standard-A tới plug Mini-B | Host tiêu chuẩn (PC) tới peripheral có kích thước nhỏ như điện thoại di động hoặc máy ảnh |
| Cable gắn cố định với plug Standard-A | Dây nối của USB mouse hoặc keyboard |
| Plug Micro-A tới plug Micro-B | Peripheral OTG tới peripheral, chẳng hạn máy ảnh tới máy in |
| Plug Micro-A tới receptacle Standard-A | Adapter sang Micro-A, ví dụ để kết nối bàn phím với PDA |
| Plug Micro-B tới plug Standard-A | Host tới OTG device |
| Cable gắn cố định với plug Micro-A | Dây nối của peripheral có kích thước nhỏ |

Bạn có thể mua những loại cable assembly khác không được liệt kê ở đây. Chúng thường được cung cấp để giải quyết các trường hợp đặc biệt, chẳng hạn phần cứng lỗi thời hoặc được thiết kế sai. Ví dụ, BeagleBoard yêu cầu một adapter đặc biệt có Mini-A plug ở một đầu và USB-A receptacle ở đầu kia. Mini-A plug có pin 4 và 5 nối tắt với nhau; có vẻ transceiver trên BeagleBoard yêu cầu điều này để được cấu hình hoạt động ở host mode.

### 18.1.6 USB mode

Một trong những khía cạnh USB gây khó hiểu hơn cho người mới là các chế độ hoạt động khác nhau. Chúng ta nghe những thuật ngữ như USB On-The-Go (OTG), gadget và peripheral. Hy vọng đến đây chúng ta đã làm rõ sự khác biệt giữa các mức tốc độ và loại connector. Phần này trình bày ngắn gọn các chế độ của USB controller và device.

USB controller và receptacle trên một desktop PC tiêu chuẩn được gọi là USB host. Vì USB là bus master-slave, theo định nghĩa, một node trên USB bus phải cung cấp chức năng master. Node đó chính là host. Bạn sẽ nghe nó được gọi là host mode hoặc đơn giản là USB host. Host controller cùng root hub là phần cứng low-level vận hành USB master/slave bus protocol. USB host luôn là bus master.

Đầu còn lại của một USB network đơn giản là phía device. Đôi khi nó được gọi là USB gadget.[^3] Chức năng gadget trong Linux kernel đơn giản chỉ khả năng hoạt động như một device ở slave mode. Khi bước vào lĩnh vực embedded, bạn không còn có thể giả định rằng processing device đóng vai trò host. Chẳng hạn, bạn có thể có một điện thoại thông minh Linux-powered với USB connector và USB controller được thiết kế để hoạt động như device, tức phía slave của một USB link.

Nhiều embedded system cần hoạt động ở cả master (host) mode và slave (device) mode trên cùng một controller. Personal digital assistant (PDA) là một ví dụ điển hình cho yêu cầu này. PDA của bạn có thể cần kết nối với một USB host, chẳng hạn desktop PC, để đồng bộ dữ liệu với master database trên PC hoặc nhận bản cập nhật phần mềm. Mặt khác, bạn có thể muốn kết nối một USB keyboard với PDA để gõ thuận tiện hơn. Những USB device này phải có khả năng hoạt động ở cả host mode lẫn device mode. Điều này được gọi là USB On-The-Go (OTG). Một lợi ích bổ sung là USB OTG specification cho phép đổi vai trò on-the-fly mà không cần rút plug rồi kết nối lại ở chế độ ngược lại.

## 18.2 Cấu hình USB

Giống phần lớn chức năng không liên quan trực tiếp đến hoạt động cốt lõi của Linux kernel, chức năng USB là tùy chọn và phải được bật trong kernel configuration. Cũng như phần lớn chức năng phụ trợ khác, USB có thể được compile vào kernel image hoặc được cấu hình thành loadable module để load động vào kernel đã boot. Trong phần trình bày này, chúng ta sẽ sử dụng loadable module vì cách đó giúp làm rõ những thành phần cần thiết cho từng chức năng cụ thể.

Một trong những rào cản để cấu hình USB đúng cách đơn giản là số lượng option trong một kernel config USB thông thường. Trên một kernel rất gần đây được cấu hình allmodconfig,[^4] gần 300 device driver module, tức file `*.ko`, liên quan đến USB. Tất nhiên, nhiều driver trong số đó dành cho những USB device cụ thể, nhưng khi xem các USB configuration option, có thể thấy rõ rằng chỉ một chút know-how cũng giúp ích rất nhiều!

Trong các ví dụ sau, chúng ta sẽ xem xét Freescale Semiconductor i.MX31 Applications Processor trên nền tảng phát triển i.MX31 PDK. Đây là ví dụ thú vị vì nó chứa ba host controller có thể được cấu hình theo nhiều chế độ hoạt động khác nhau.

Hình 18-5 cho thấy một phần các USB configuration option từ một Linux kernel gần đây được cấu hình cho ARM architecture và Freescale Semiconductor i.MX31 PDK reference board.

![Figure 18-5](images/ch18/fig18-05.png)

HÌNH 18-5 Một phần cấu hình USB cho i.MX31

Có nhiều option hơn những gì có thể trình bày ở đây. Đây chỉ là các option ban đầu. Trước tiên, bạn phải chọn `USB_SUPPORT` để thấy các USB configuration option tiếp theo. Chú ý USB được chọn là M (module), nghĩa là kernel build system sẽ compile các USB driver thành loadable module.

Hãy xem cấu hình tối thiểu để USB hoạt động trên i.MX31. Với mọi USB configuration, module có tên `usbcore.ko` đều cần thiết. Nó được chọn tự động mỗi khi `CONFIG_USB` được chọn.[^5] Bạn có thể dễ dàng thấy điều này bằng cách xem makefile cho phần cốt lõi của USB driver support trong Listing 18-1. Makefile này nằm tại `.../drivers/usb/core/Makefile`.[^6]

LISTING 18-1 Makefile cho USB core

```
#
# Makefile for USB Core files and filesystem
#

usbcore-objs    := usb.o hub.o hcd.o urb.o message.o driver.o \
                   config.o file.o buffer.o sysfs.o endpoint.o \
                   devio.o notify.o generic.o quirks.o

ifeq ($(CONFIG_PCI),y)
        usbcore-objs    += hcd-pci.o
endif

ifeq ($(CONFIG_USB_DEVICEFS),y)
        usbcore-objs    += inode.o devices.o
endif

obj-$(CONFIG_USB)       += usbcore.o

ifeq ($(CONFIG_USB_DEBUG),y)
EXTRA_CFLAGS += -DDEBUG
endif
```

Xem những makefile điều khiển kernel build system luôn là cách rất tốt để tìm hiểu cần những thành phần nào, hoặc theo chiều ngược lại, cần những configuration option nào cho một chức năng cụ thể. Chẳng hạn, trong Listing 18-1, bạn thấy chúng ta cần bật `CONFIG_USB` để đưa `usbcore` vào build. Như đã học trong Chương 4, “Linux kernel: Một góc nhìn khác”, nếu `CONFIG_USB` được đặt thành `m`, device driver này được compile thành một loadable kernel module và cung cấp USB host support.

### 18.2.1 Khởi tạo USB

Sau khi boot i.MX31 với cấu hình tối thiểu, chúng ta có thể load module `usbcore` như sau:

```
# modprobe usbcore
```

Lệnh này load USB core module, thành phần xử lý các chức năng chung cho những driver còn lại trong tập hợp USB driver. Những chức năng này bao gồm công việc quản lý phụ trợ như đăng ký và hủy đăng ký các phần tử khác nhau, đồng thời cung cấp interface để điều khiển USB hardware. Điều đó loại bỏ phần lớn sự phức tạp khi viết driver cho USB hardware. Bạn có thể xem các public symbol bằng utility cross-nm của mình. Bạn đã tìm hiểu `nm` trong Chương 13, “Công cụ phát triển”. Dưới đây là ví dụ dùng cross-nm để hiển thị các USB registration function:

```
$ arm_v6_vfp_le-nm usbcore.ko  | grep T.*_register
0000adc0 T usb_register_dev
000094b0 T usb_register_device_driver
00009560 T usb_register_driver
0000fcf8 T usb_register_notify
```

`usbcore` cũng chứa các function xử lý buffer; hỗ trợ usbfs, hub class driver; và nhiều function khác phục vụ giao tiếp với USB controller bên dưới.

Bản thân `usbcore` không hữu ích lắm. Nó không chứa bất kỳ host controller driver low-level nào. Chúng là những module riêng và có thể khác nhau tùy phần cứng bạn sử dụng. Ví dụ, BeagleBoard chứa TI OMAP3530 Applications Processor có một controller built-in dual-role[^7]. Controller này là Inventra™ USB Hi-Speed Dual-Role Controller. Driver cho host controller này có tên `musb_hdrc`.

Trên nhiều platform, USB host controller được thiết kế để tuân theo Enhanced Host Controller Interface (EHCI),[^8] mô tả interface register-level cho một USB host controller industry-standard. Trong trường hợp này, khi được compile thành loadable module, driver có tên `ehci-hcd.ko`. Hãy xem điều gì xảy ra khi load driver đó trên Freescale i.MX31, như trong Listing 18-2.

LISTING 18-2 Cài USB host controller driver trên i.MX31

```
root@imx31:~# modprobe ehci-hcd
usbcore: registered new interface driver usbfs
usbcore: registered new interface driver hub
usbcore: registered new device driver usb
fsl-ehci fsl-ehci.0: Freescale On-Chip EHCI Host Controller
fsl-ehci fsl-ehci.0: new USB bus registered, assigned bus number 1
fsl-ehci fsl-ehci.0: irq 35, io mem 0x43f88200
fsl-ehci fsl-ehci.0: USB 2.0 started, EHCI 1.00, driver 10 Dec 2004
usb usb1: configuration #1 chosen from 1 choice
hub 1-0:1.0: USB hub found
hub 1-0:1.0: 1 port detected
fsl-ehci fsl-ehci.1: Freescale On-Chip EHCI Host Controller
fsl-ehci fsl-ehci.1: new USB bus registered, assigned bus number 2
fsl-ehci fsl-ehci.1: irq 36, io mem 0x43f88400
fsl-ehci fsl-ehci.1: USB 2.0 started, EHCI 1.00, driver 10 Dec 2004
usb usb2: configuration #1 chosen from 1 choice
hub 2-0:1.0: USB hub found
hub 2-0:1.0: 1 port detected
fsl-ehci fsl-ehci.2: Freescale On-Chip EHCI Host Controller
fsl-ehci fsl-ehci.2: new USB bus registered, assigned bus number 3
fsl-ehci fsl-ehci.2: irq 37, io mem 0x43f88000
fsl-ehci fsl-ehci.2: USB 2.0 started, EHCI 1.00, driver 10 Dec 2004
usb usb3: configuration #1 chosen from 1 choice
hub 3-0:1.0: USB hub found
hub 3-0:1.0: 1 port detected
```

Ở đây có nhiều thông tin hữu ích. Lưu ý rằng chúng ta đã đặt console log level để những thông báo này xuất hiện trên console. Trước tiên, chúng ta thấy các registration function của `usbcore` hoạt động. Có các thông báo đăng ký usbfs interface driver, hub interface driver và chính EHCI (usb host mode) driver. Bạn sẽ sớm tìm hiểu usbfs.

Tiếp theo, chúng ta thấy ba host controller được khởi tạo. Hãy nhớ Freescale i.MX31 Application Processor chứa ba USB controller riêng biệt. Chúng được enumerate thành `fsl-ehci.0`, `fsl-ehci.1` và `fsl-ehci.2`. Bạn có thể thấy interrupt (IRQ) được gán và base address của register file gắn với mỗi USB controller. Chú ý root hub được enumerate trong từng trường hợp. Root hub là một thành phần nền tảng của USB architecture và luôn gắn với host controller. Nó cần thiết để kết nối peripheral device, tức hub hoặc USB device khác, với host controller.

Cần lưu ý rằng chúng ta không phải cài riêng `usbcore` như ở đầu phần này. `modprobe` biết cách xác định các dependency cần thiết cho một module nhất định. Chỉ cần thực hiện lệnh sau:

```
# modprobe ehci-hcd
```

Lệnh này load dependency `usbcore` trước khi load driver `ehci-hcd`. Cơ chế này được giải thích trong Chương 8, “Kiến thức cơ bản về device driver”. Thực tế, trên nhiều platform sử dụng hệ thống udev, các bước này được udev tự động hóa. Nội dung này được trình bày trong Chương 19.

## 18.3 sysfs và đặt tên USB device

Như đã mô tả trong Chương 9, “File system”, sysfs file system về cơ bản là một cách nhìn vào các kernel object, hay kobject. Mỗi USB device đều được biểu diễn trong sysfs. Hãy xem `/sys/bus/usb/devices` trên bất kỳ hệ thống USB-enabled nào. Listing 18-3 cho thấy nội dung trên Freescale i.MX31 PDK board của tôi. Lưu ý rằng tôi đã rút gọn định dạng `ls -l` để vừa chiều rộng trang bằng cách bỏ mọi cột ngoại trừ filename.

LISTING 18-3 Output `/sys/bus/usb/devices` trên i.MX31

```
root@imx31:~# ls -l /sys/bus/usb/devices/
total 0
1-0:1.0 -> ../../../devices/platform/fsl-ehci.0/usb1/1-0:1.0
2-0:1.0 -> ../../../devices/platform/fsl-ehci.1/usb2/2-0:1.0
2-1 -> ../../../devices/platform/fsl-ehci.1/usb2/2-1
2-1.1 -> ../../../devices/platform/fsl-ehci.1/usb2/2-1/2-1.1
2-1.1:1.0 -> ../../../devices/platform/fsl-ehci.1/usb2/2-1/2-1.1/2-1.1:1.0
2-1:1.0 -> ../../../devices/platform/fsl-ehci.1/usb2/2-1/2-1:1.0
3-0:1.0 -> ../../../devices/platform/fsl-ehci.2/usb3/3-0:1.0
usb1 -> ../../../devices/platform/fsl-ehci.0/usb1
usb2 -> ../../../devices/platform/fsl-ehci.1/usb2
usb3 -> ../../../devices/platform/fsl-ehci.2/usb3
```

Tất cả entry trong `/sys/bus/usb/devices` đều là link đến những phần khác của sysfs hierarchy. Chú ý các tên bằng số, chẳng hạn `1-0:1.0`. Trong cách đặt tên này, số đầu tiên là root hub, tức cấp cao nhất của USB hierarchy cho bus cụ thể đó. Số thứ hai là port number mà một device nhất định kết nối vào. Số thứ ba, nằm sau dấu hai chấm, là configuration number của USB device, tiếp theo là interface number của device. Configuration và interface là các thành phần logic của mọi USB device, như đã mô tả trong Phần 18.1.2.

Tóm lại:

```
1-0:1.0
| | | |----- interface number
| | |------- configuration number
| |--------- hub port
|----------- root_hub
```

Nếu bổ sung hub vào topology, chúng được thêm vào device name bằng dấu chấm (.) theo sau là hub port number, nối chuỗi với upstream port. Ví dụ, nếu thêm một hub vào topology vừa trình bày, chúng ta có thể nhận được `1-0.2:1.0`. Điều này giả định có một downstream hub với ít nhất hai port và device cắm vào port số 2.

Nếu xem nội dung từng directory được liên kết, bạn có thể xác định thành phần nào đang được tham chiếu. Ví dụ, entry đầu tiên trong Listing 18-3 biểu diễn một logical USB interface. Bạn có thể nhận ra điều này bằng cách xem các file, cũng gọi là sysfs attribute, mà symbolic link `1-0:1.0.` trỏ đến. Nó chứa các entry từ interface descriptor như `bInterfaceNumber` và `bNumEndpoints`, đều là phần tử của USB 2.0 interface descriptor. Hai entry đầu tiên trong Listing 18-3 biểu diễn interface duy nhất gắn với hai trong số các USB controller/root hub nội bộ của Freescale i.MX31.

Entry thứ ba trong Listing 18-3 (`2-1`) biểu diễn một external hub được kết nối với USB bus thứ hai. Cụ thể, nó là biểu diễn của `struct usb_device` cho hub này.

Ba entry trong Listing 18-3 bắt đầu bằng `usb` biểu diễn chính các bus. Bạn thấy hệ thống này có ba bus vì Freescale i.MX31 processor có ba USB controller. Bus number là chữ số cuối trong tên `usb`. Các USB bus được đánh số bắt đầu từ 1.

Tóm lại, một số ví dụ:

- `3-0:1.0` biểu diễn một interface (`struct usb_interface`) kết nối với bus 3. Đây là root hub interface của bus 3.

- `2-1` biểu diễn một device (`struct usb_device`). Trong cấu hình của ví dụ này, đó là một external hub kết nối với root hub trên bus 2.

- `2-1.3` biểu diễn một downstream device (`struct usb_device`) của device `2-1`, được kết nối với port 3 của nó.

- `usb2` biểu diễn USB bus số 2 (cũng `struct usb_device`).

- `2-1.3.4:1.0` biểu diễn một interface, tức iPod của tôi, chạy ở configuration 1 và kết nối với port 4 của parent hub; hub đó kết nối với port 3 của parent của nó, rồi đến root hub trên bus 2!

## 18.4 Công cụ USB hữu ích

Một số tool và utility hữu ích có thể giúp bạn hiểu rõ hệ thống hơn, cấu hình driver và lấy thông tin chi tiết về USB subsystem. Phần này giới thiệu những công cụ đó.

### 18.4.1 USB file system

USB File System (USBFS) là một loại virtual file system khác. Nó chưa sẵn sàng để sử dụng cho đến khi bạn mount nó. Một số Linux system tự động mount USBFS, nhưng nhiều hệ thống thì không. Để sử dụng USBFS, bạn cũng phải bật nó trong kernel. Hãy chọn CONFIG\_USB\_DEVICEFS trong mục USB Support của kernel configuration. Lưu ý rằng hệ thống này đã deprecated, nhưng vẫn có trong các kernel gần đây và hữu ích để hiểu cấu hình USB của hệ thống. Vì một số utility phụ thuộc vào nó, có lẽ nó vẫn sẽ tồn tại thêm một thời gian.

Sau khi kernel được cấu hình cho USB\_DEVICEFS, vốn được bật mặc định trong phần lớn Linux distribution, bạn phải mount virtual file system này để sử dụng:

```
# mount -t usbfs usbfs /proc/bus/usb
```

Sau khi bật, bạn sẽ nhận được một listing tương tự Listing 18-4.

LISTING 18-4 Directory listing: `/proc/bus/usb`

```
root@imx31:~# ls -l /proc/bus/usb
total 0
dr-xr-xr-x 2 root root 0 Jun  7 14:00 001
-r--r--r-- 1 root root 0 Jun  7 14:36 devices
```

Sau khi mount USBFS, bạn có thể lấy một listing human-readable của các device được tìm thấy trong USB topology, như trong Listing 18-5.

LISTING 18-5 Output `/proc/bus/usb/devices`

```
root@imx31:~# cat /proc/bus/usb/devices
T:  Bus=03 Lev=00 Prnt=00 Port=00 Cnt=00 Dev#=  1 Spd=480 MxCh= 1
B:  Alloc=  0/800 us ( 0%), #Int=  0, #Iso=  0
D:  Ver= 2.00 Cls=09(hub  ) Sub=00 Prot=01 MxPS=64 #Cfgs=  1
P:  Vendor=0000 ProdID=0000 Rev= 2.06
S:  Manufacturer=Linux 2.6.24-335-g47af517 ehci_hcd
S:  Product=Freescale On-Chip EHCI Host Controller
S:  SerialNumber=fsl-ehci.2
C:* #Ifs= 1 Cfg#= 1 Atr=e0 MxPwr=  0mA
I:* If#= 0 Alt= 0 #EPs= 1 Cls=09(hub  ) Sub=00 Prot=00 Driver=hub
E:  Ad=81(I) Atr=03(Int.) MxPS=   4 Ivl=256ms

T:  Bus=02 Lev=00 Prnt=00 Port=00 Cnt=00 Dev#=  1 Spd=480 MxCh= 1
B:  Alloc=  0/800 us ( 0%), #Int=  1, #Iso=  0
D:  Ver= 2.00 Cls=09(hub  ) Sub=00 Prot=01 MxPS=64 #Cfgs=  1
P:  Vendor=0000 ProdID=0000 Rev= 2.06
S:  Manufacturer=Linux 2.6.24-335-g47af517 ehci_hcd
S:  Product=Freescale On-Chip EHCI Host Controller
S:  SerialNumber=fsl-ehci.1
C:* #Ifs= 1 Cfg#= 1 Atr=e0 MxPwr=  0mA
I:* If#= 0 Alt= 0 #EPs= 1 Cls=09(hub  ) Sub=00 Prot=00 Driver=hub
E:  Ad=81(I) Atr=03(Int.) MxPS=   4 Ivl=256ms

T:  Bus=02 Lev=01 Prnt=01 Port=00 Cnt=01 Dev#=  2 Spd=480 MxCh= 4
D:  Ver= 2.00 Cls=09(hub  ) Sub=00 Prot=01 MxPS=64 #Cfgs=  1
P:  Vendor=05e3 ProdID=0608 Rev= 7.02
S:  Product=USB2.0 Hub
C:* #Ifs= 1 Cfg#= 1 Atr=e0 MxPwr=100mA
I:* If#= 0 Alt= 0 #EPs= 1 Cls=09(hub  ) Sub=00 Prot=00 Driver=hub
E:  Ad=81(I) Atr=03(Int.) MxPS=   1 Ivl=256ms

T:  Bus=01 Lev=00 Prnt=00 Port=00 Cnt=00 Dev#=  1 Spd=480 MxCh= 1
B:  Alloc=  0/800 us ( 0%), #Int=  0, #Iso=  0
D:  Ver= 2.00 Cls=09(hub  ) Sub=00 Prot=01 MxPS=64 #Cfgs=  1
P:  Vendor=0000 ProdID=0000 Rev= 2.06
S:  Manufacturer=Linux 2.6.24-335-g47af517 ehci_hcd
S:  Product=Freescale On-Chip EHCI Host Controller
S:  SerialNumber=fsl-ehci.0
C:* #Ifs= 1 Cfg#= 1 Atr=e0 MxPwr=  0mA
I:* If#= 0 Alt= 0 #EPs= 1 Cls=09(hub  ) Sub=00 Prot=00 Driver=hub
E:  Ad=81(I) Atr=03(Int.) MxPS=   4 Ivl=256ms
```

Định dạng của bản hiển thị này được ghi trong `.../Documentation/usb/proc_usb_info.txt` thuộc kernel source tree. Tóm lại, mỗi dòng T mô tả một USB device mới. T là viết tắt của topology. Dòng T chứa thông tin bổ sung có thể được dùng để dựng sơ đồ topology của USB bus hiện tại. Theo thứ tự, mỗi dòng T chứa bus number (Bus), cấp trong hierarchy (Lev), parent level (Prnt), port trên parent device (Port), số device ở cấp này (Cnt), device number (Dev#), tốc độ (Spd) và số phần tử con tối đa (MxCh).

Các dòng bổ sung mô tả yêu cầu bandwidth (`B:`), device descriptor (`D:`), product ID (`P`:), các string descriptor gắn với device (`S:`), configuration descriptor (`C:`), interface descriptor (`I:`) và endpoint descriptor (`E:`).

### 18.4.2 Dùng usbview

Cách sử dụng thông tin này có giá trị nhất là dùng một chương trình dựng bus topology với những thông tin đó bên trong. Greg Kroah-Hartman đã viết một chương trình có tên `usbview`, hiện vẫn có trên nhiều Linux distribution. Nó sử dụng GTK library để hiển thị USB topology bằng đồ họa, chứa thông tin lấy từ usbfs file system. Tôi đã lấy chương trình đó và bỏ phần GTK để có thể chạy ở text mode trên embedded system không có đồ họa. Chương trình có trên website đi kèm cuốn sách này. Hãy tìm `usbview-text`.

Listing 18-6 cho thấy output của `usbview-text` khi chạy trên Freescale i.MX31. Output được rút gọn để chỉ hiển thị một device, trong trường hợp này là iPod của tôi. Device này chứa nhiều configuration và minh họa nhiều khái niệm chúng ta đã thảo luận đến đây.

LISTING 18-6 Output `usbview-text`

```
root@imx31:~# /tmp/usbview-text
Bus 2 Device 3  ******** New Device *********
Device Name: iPod
Manufacturer: Apple Inc.
Serial Number: 00xxxxxxxxxx
Speed: 480Mb/s (high)
USB Version:  2.00
Device Class: 00(>ifc )
Device Subclass: 00
Device Protocol: 00
Maximum Default Endpoint Size: 64
Number of Configurations: 2
Vendor Id: 05ac
Product Id: 1261
Revision Number:  0.01

Config Number: 1
    Number of Interfaces: 1
    Attributes: c0
    MaxPower Needed: 500mA

    Interface Number: 0
        Name: usb-storage
        Alternate Number: 0
        Class: 08(stor.)
        Sub Class: 06
        Protocol: 50
        Number of Endpoints: 2

            Endpoint Address: 83
            Direction: in
            Attribute: 2
            Type: Bulk
            Max Packet Size: 512
            Interval: 0ms

            Endpoint Address: 02
            Direction: out
            Attribute: 2
            Type: Bulk
            Max Packet Size: 512
            Interval: 0ms

Config Number: 2
    Number of Interfaces: 3
    Attributes: c0
    MaxPower Needed: 500mA

    Interface Number: 0
        Name:
        Alternate Number: 0
        Class: 01(audio)
        Sub Class: 01
        Protocol: 00
        Number of Endpoints: 0

    Interface Number: 1
        Name:
        Alternate Number: 0
        Class: 01(audio)
        Sub Class: 02
        Protocol: 00
        Number of Endpoints: 0

    Interface Number: 1
        Name:
        Alternate Number: 1
        Class: 01(audio)
        Sub Class: 02
        Protocol: 00
        Number of Endpoints: 1

            Endpoint Address: 81
            Direction: in
            Attribute: 1
            Type: Isoc
            Max Packet Size: 192
            Interval: 1ms

    Interface Number: 2
        Name:
        Alternate Number: 0
        Class: 03(HID  )
        Sub Class: 00
        Protocol: 00
        Number of Endpoints: 1

            Endpoint Address: 83
            Direction: in
            Attribute: 3
            Type: Int.
            Max Packet Size: 64
            Interval: 125us
```

Output này liệt kê thông tin từ các descriptor khác nhau, gồm device, configuration, interface và endpoint descriptor, của iPod đang xét. Điều đầu tiên cần chú ý là nó chứa hai configuration, biểu diễn một mass storage device và một device ghi, phát âm thanh.

Configuration 1 chứa một interface duy nhất với hai endpoint, cả hai đều được thiết kế để truyền bulk data, mỗi hướng một endpoint. Các endpoint này dùng để đọc và lưu dữ liệu trên Flash nội bộ được biểu diễn dưới dạng USB storage device.

Configuration 2 chứa ba interface. Interface 0 không chứa endpoint. Interface 1 chứa một endpoint là isochronous interface. Loại truyền này dành cho việc stream dữ liệu real-time như âm thanh hoặc video, chiếm một lượng bandwidth được định trước. Interface 2 chứa một endpoint duy nhất thuộc loại Interrupt. Kiểu truyền endpoint này được thiết kế để chuyển dữ liệu kịp thời nhưng tin cậy, chẳng hạn dữ liệu từ chuột hoặc bàn phím.

### 18.4.3 USB Utils (lsusb)

Package có tên usbutils cung cấp utility `lsusb`, với chức năng tương tự `lspci`. `lsusb` sử dụng `libusb`, nên library này phải có trên hệ thống trước khi bạn có thể sử dụng nó. Hãy kiểm tra để bảo đảm embedded distribution chứa cả hai package; phần lớn distribution đều có.

`lsusb` cho phép bạn enumerate tất cả USB bus trong hệ thống và hiển thị thông tin về từng device trên những bus đó. Listing 18-7 hiển thị physical bus topology bằng cách truyền flag `-t` cho `lsusb`.

LISTING 18-7 Physical topology USB bus

```
root@imx31:~# lsusb -t
/:  Bus 03.Port 1: Dev 1, Class=root_hub, Driver=fsl-ehci/1p, 480M
/:  Bus 02.Port 1: Dev 1, Class=root_hub, Driver=fsl-ehci/1p, 480M
    |__ Port 1: Dev 2, If 0, Class=hub, Driver=hub/4p, 480M
        |__ Port 1: Dev 3, If 0, Class=stor., Driver=usb-storage, 480M
/:  Bus 01.Port 1: Dev 1, Class=root_hub, Driver=fsl-ehci/1p, 480M
```

Tại đây, bạn có thể thấy cả ba bus của i.MX31, với một hub cắm vào bus thứ hai và iPod của tôi cắm vào port 1 của hub đó. Bạn cũng có thể hiển thị descriptor cho tất cả device hoặc chỉ nhắm đến một device duy nhất:

```
root@imx31:~# lsusb -s 2:3
Bus 002 Device 003: ID 05ac:1261 Apple, Inc. iPod Classic
```

Dạng lệnh `lsusb` này hiển thị device số 3 trên bus số 2. Thêm flag `-v` sẽ dump tất cả descriptor của device, tạo ra lượng dữ liệu quá lớn để trình bày thành listing ở đây. Tôi để bạn tự thực hiện bài tập này. Nếu có iPod, output sẽ khá thú vị vì nó có hai configuration cùng nhiều interface và endpoint.

## 18.5 USB subsystem phổ biến

Phần này giới thiệu những USB subsystem phổ biến hơn mà bạn có khả năng gặp. Phần lớn đều dễ thiết lập và sử dụng. Kết hợp với udev, được trình bày trong Chương 19, chúng có thể được tự động cấu hình và sẵn sàng sử dụng ngay sau khi bạn cắm USB device yêu thích vào.

Các phần sau trình bày chi tiết một USB class tiêu chuẩn theo định nghĩa trong USB Class Specification Documents. Mục đích của USB class tiêu chuẩn hóa là cho phép một class driver chung hỗ trợ nhiều loại device của các nhà cung cấp khác nhau. Khi nhà sản xuất device tuân theo class specification, bạn có thể vận hành device mà không cần một device driver vendor-specific, chỉ sử dụng class driver tương ứng.

### 18.5.1 USB mass storage class

Có lẽ USB “class”, hay subsystem, phổ biến nhất trong embedded system là USB mass storage. Nó cho phép sử dụng USB Flash drive bên ngoài và các peripheral khác có bộ lưu trữ nội bộ, hoặc ổ đĩa ngoài high-speed như Western Digital My Book™. USB storage phải được cấu hình trong kernel. Một khía cạnh dễ gây khó hiểu hơn là USB storage yêu cầu SCSI subsystem support. Thực tế, trên các kernel mới hơn, khi chọn kernel support cho USB mass storage, CONFIG\_SCSI và CONFIG\_BLK\_DEV\_HD tự động được chọn.

Như thường lệ, những module này có thể được compile tĩnh vào kernel hoặc được cấu hình thành dynamically loadable module. Trong các ví dụ này, chúng ta sẽ sử dụng module vì chúng minh họa rõ hơn các thành phần và do đó là cấu hình cần thiết để mọi thứ hoạt động đúng. Tất nhiên, đến đây bạn đã biết cần `usbcore` và `ehci-hcd` làm tập USB driver nền tảng. (Lưu ý rằng điều này giả định chúng ta tiếp tục sử dụng Freescale i.MX31 Applications Processor trong các ví dụ. Những board khác có thể cần host controller driver khác, chẳng hạn BeagleBoard sử dụng `musb_hdrc`.)

Để nhận diện device thuộc USB storage class, chúng ta cần đưa driver `usb_storage` vào. Tuy nhiên, driver này phụ thuộc vào `scsi_mod`, nên chúng ta cũng cần module đó. Nếu hệ thống được cấu hình đúng, `modprobe` có thể phát hiện dependency và load `scsi_mod` giúp bạn khi load `usb_storage`. Các dependency này nằm trong file `modules.dep`, được tìm thấy tại ``/lib/modules/`uname -r`/modules.dep``. Chỉ cần tìm `usb-storage` và bạn sẽ thấy các dependency được liệt kê trên cùng dòng.

Hãy xem kết quả trông như thế nào. Listing 18-8 cho thấy kết quả khi insert module `usb-storage`.

LISTING 18-8 Module cho `usb-storage`

```
root@imx31:~# modprobe usb-storage
SCSI subsystem initialized
Initializing USB Mass Storage driver...
usbcore: registered new interface driver usb-storage
USB Mass Storage support registered.
root@imx31:~# lsmod
Module                  Size  Used by
usb_storage            35872  0
scsi_mod               97552  1 usb_storage
ehci_hcd               30836  0
usbcore               129752  3 usb_storage,ehci_hcd
```

Bây giờ, nếu cắm một USB storage device vào hub port, nó sẽ được nhận diện là device `usb_storage` bởi driver `usb-storage`:

```
usb 2-1.2: new high speed USB device using fsl-ehci and address 6
usb 2-1.2: configuration #1 chosen from 2 choices
scsi1 : SCSI emulation for USB Mass Storage devices
scsi 1:0:0:0: Direct-Access     Apple    iPod    1.62 PQ: 0 ANSI: 0
```

Tuy nhiên, chúng ta cần thêm một driver để truy cập các partition trên USB storage device. Đây là lúc SCSI emulation layer tham gia. Driver `sd-mod` chịu trách nhiệm xử lý SCSI disk device. Sau khi load module này, disk device bên trong USB storage device được enumerate cùng tất cả partition trên device. Listing 18-9 cho thấy kết quả.

LISTING 18-9 Thêm driver `sd-mod`

```
root@imx31:~# modprobe sd_mod
sd 1:0:0:0: [sda] 19488471 4096-byte hardware sectors (79825 MB)
sd 1:0:0:0: [sda] Write Protect is off
sd 1:0:0:0: [sda] Assuming drive cache: write through
sd 1:0:0:0: [sda] 19488471 4096-byte hardware sectors (79825 MB)
sd 1:0:0:0: [sda] Write Protect is off
sd 1:0:0:0: [sda] Assuming drive cache: write through
 sda: sda1
sd 1:0:0:0: [sda] Attached SCSI removable disk
root@imx31:~# lsmod
Module                  Size  Used by
sd_mod                 20720  0
usb_storage            35872  0
scsi_mod               97552  2 sd_mod,usb_storage
ehci_hcd               30836  0
usbcore               129752  3 usb_storage,ehci_hcd
```

Bây giờ chúng ta đã có mọi thứ cần thiết để mount disk partition và truy cập nội dung của nó. Từ Listing 18-9, có thể thấy partition duy nhất trên USB storage device này được enumerate thành sda1. Giả sử đã có device node `/dev/sda1` và kernel support cho loại file system tương ứng, bây giờ chúng ta có thể mount device này:

```
# mount /dev/sda1 /your/favorite/mount/point
```

Khi udev được cài đặt và cấu hình đúng trên thiết bị embedded, toàn bộ việc tạo device node được thực hiện tự động. Chúng ta sẽ trình bày chi tiết udev trong chương tiếp theo. Để đầy đủ, chúng ta sẽ chỉ ra cách tạo device node này trên hệ thống nếu không có udev. Sysfs file system chứa một entry cho sda1:

```
root@imx31:~# find /sys -name sda1
/sys/block/sda/sda1
```

Sysfs entry này có một attribute tên `dev`. Attribute đó liệt kê major number và minor number mà kernel đã gán cho device `/dev/sda1`. Trên Freescale i.MX31 của tôi, các giá trị được gán là major=8, minor=1. Sử dụng thông tin này, chúng ta tạo một device node, sau đó có thể mount và truy cập partition. Listing 18-10 chứa kết quả cuối cùng.

LISTING 18-10 Tạo device node, mount SD device

```
root@imx31~:# cat /sys/block/sda/sda1/dev
8:1
root@imx31:~# mknod /dev/sda1 b 8 1
root@imx31:~# mkdir /media/disk
root@imx31:~# mount /dev/sda1 /media/disk
root@imx31:~# dir /media/disk
total 80
drwxr-xr-x 2 root root 16384 Oct 13  2008 Calendars
drwxr-xr-x 2 root root 16384 Oct 13  2008 Contacts
drwxr-xr-x 2 root root 16384 Oct 13  2008 Notes
drwxr-xr-x 2 root root 16384 Oct 13  2008 Recordings
drwxr-xr-x 8 root root 16384 Oct 13  2008 iPod_Control
```

`mknod` đã trình bày chi tiết Chương 8.

### 18.5.2 USB HID class

USB HID (Human Input Devices) có lẽ là USB device phổ biến nhất trên các máy desktop Linux, và đôi khi trên cả embedded system. HID device tương đối dễ sử dụng. Các configuration option cho USB HID support nằm trong Device Drivers --\> HID Devices của kernel configuration menu. Bạn cần bật `CONFIG_HID_SUPPORT`, `CONFIG_HID` và `CONFIG_USB_HID`. Đây là generic HID driver triển khai hỗ trợ HID class driver USB-defined. Chỉ cần insert module `usbhid`, `modprobe` tự động đưa vào dependency của nó là HID core driver (`hid`)`:`

```
root@imx31:~# modprobe usbhid
usbcore: registered new interface driver usbhid
usbhid: v2.6:USB HID core driver
root@imx31:~# lsmod
Module                  Size  Used by
usbhid                 18980  0
hid                    31428  1 usbhid
ehci_hcd               30836  0
usbcore               129752  3 usbhid,ehci_hcd
```

Khi đã có hạ tầng này, phần lớn HID device thông dụng như chuột, bàn phím và joystick tuân theo HID Class Driver specification sẽ được nhận diện và kích hoạt. Khi cắm Kensington USB wireless travel mouse của mình, tôi thấy:

```
usb 2-1.4: new low speed USB device using fsl-ehci and address 4
usb 2-1.4: configuration #1 chosen from 1 choice
input: Kensington USB Mouse as /devices/platform/fsl-ehci.1/usb2/2-1/
2-1.4/2-1.4:1.0/input/input2
input: USB HID v1.10 Mouse [Kensington Kensington USB Mouse] on
usb-fsl-ehci.1-1.4
```

Giống như đã làm với USB storage, chúng ta có thể tìm trong sysfs file system các device number mà kernel đã gán khi enumerate chuột. Vì đã biết các device number nằm trong attribute `dev`, chúng ta tìm một kết quả hợp lý:

```
root@imx31:~# find /sys -name dev | grep input
/sys/devices/platform/fsl-ehci.1/usb2/2-1/2-1.4/2-1.4:1.0/input/input2/event2/dev
/sys/devices/virtual/input/input0/event0/dev
/sys/devices/virtual/input/input1/event1/dev
```

Vì chúng ta cắm thiết bị chuột vào port 4 của một external hub, chúng ta chọn device có physical address 2-1.4:1-0:

```
root@imx31:~# cat /sys/devices/platform/fsl-ehci.1/usb2/2-1/2-1.4/2-1.4:1.0/input
```

➥`/input2/event2/dev`

```
13:66
```

Cuối cùng, chúng ta tạo device node bằng các device number này:

```
root@imx31:~# mknod /dev/mouse c 13 66
```

Bây giờ bạn đã sẵn sàng sử dụng device. Cũng như USB storage, nếu có cấu hình `udev` hoạt động được, như mô tả trong chương tiếp theo, bạn không cần tạo device node thủ công. Đó là công việc của `udev`.

### 18.5.3 USB CDC class driver

Các USB Communications Device Class (CDC) driver được thiết kế để cung cấp một driver framework chung cho toàn bộ các class thiết bị truyền thông thông dụng. Một số CDC class tiêu chuẩn đã được định nghĩa, bao gồm ATM, Ethernet, ISDN PSTN (điện thoại thông thường), thiết bị di động không dây, cable modem và những thiết bị tương tự.

Một trong những cách sử dụng tốt nhất của CDC class driver là chức năng Ethernet CDC. Trong quá trình phát triển, có Ethernet connectivity trên một thiết bị embedded vốn có thể không có Ethernet interface sẽ rất hữu ích. Có nhiều ví dụ về các thiết bị như vậy, chẳng hạn điện thoại di động và PDA.

Có hai cách khác nhau để thực hiện chức năng này. Một cách là thiết lập link point-to-point trực tiếp giữa host và peripheral device bằng USB cable tiêu chuẩn. Mô hình còn lại sử dụng một Ethernet “dongle”, về cơ bản là Ethernet interface có USB plug. Chúng ta sẽ xem xét cả hai phương pháp.[^9]

Thiết lập USB link trực tiếp giữa host và peripheral tương đối đơn giản. Tất nhiên, bạn phải có phần cứng phù hợp. Chẳng hạn, bạn không thể kết nối laptop PC với desktop PC chỉ bằng một USB cable. Đó là vì một đầu của mọi USB link phải là device “upstream”, tức host hoặc hub, còn đầu kia phải là device “downstream”, tức peripheral device hoặc “gadget”. Hãy nhớ rằng USB là protocol master-slave.

Chúng ta sẽ dùng BeagleBoard làm ví dụ về kết nối mạng trực tiếp USB-USB bằng CDC class driver. Bạn phải bật chức năng này trong kernel. Tất nhiên, bạn phải có host controller driver; với BeagleBoard, đó là `musb_hdrc.ko`. Driver này được bật bằng cách chọn `USB_MUSB_HDRC` trong beagle kernel config. Với BeagleBoard, bạn cũng phải chọn `TWL4030_USB`[^10] để bật USB transceiver. Bật peripheral mode bằng cách chọn `USB_GADGET_MUSB_HDRC` trong USB Gadget support. Cuối cùng, chọn hỗ trợ Ethernet Gadget (`USB_ETH`) trong USB Gadget Drivers. Đây là driver có CDC Ethernet support cho phía peripheral (slave) của link.

Trên desktop host hoặc laptop host, bạn cần load `usbnet.ko`. Trên phần lớn desktop distribution hiện đại, udev tự động thực hiện việc này sau khi bạn cắm USB cable từ BeagleBoard. Điều này giả định rằng bạn đã bật driver g\_ether của Beagle và cấu hình interface. Hãy xem việc đó diễn ra thế nào. Listing 18-11 cho thấy các bước liên quan.

LISTING 18-11 Cấu hình g\_ether Beagle

```
# modprobe twl4030_usb
twl4030_usb twl4030_usb: Initialized TWL4030 USB module
# modprobe g_ether
musb_hdrc: version 6.0, musb-dma, peripheral, debug=0
musb_hdrc: USB Peripheral mode controller at d80ab000 using DMA, IRQ 92
g_ether gadget: using random self ethernet address
g_ether gadget: using random host ethernet address
usb0: MAC ae:9e:55:32:0a:c9
usb0: HOST MAC c2:de:61:36:21:9c
g_ether gadget: Ethernet Gadget, version: Memorial Day 2008
g_ether gadget: g_ether ready
# lsmod
Module                  Size  Used by
g_ether                23664  0
musb_hdrc              35524  1 g_ether
twl4030_usb             5744  0
# ifconfig usb0 192.168.4.2
```

Sau khi load hai device driver như trong Listing 18-11, bạn sẽ nhận thấy một interface `usb0` đã được tạo và enumerate. `lsmod` cho biết các module được load sau những bước này. Chú ý rằng `modprobe` tự động load module `musb_hdrc`.

Bước cuối cùng là cấu hình interface với một IP address hợp lệ. Bây giờ Ethernet interface trên `usb0` đã sẵn sàng hoạt động. Khi USB cable từ BeagleBoard được kết nối với laptop Ubuntu 8.04 của tôi, các log entry thu được như sau:

```
usb 7-3: new high speed USB device using ehci_hcd and address 13
usb 7-3: configuration #1 chosen from 1 choice
usb0: register ‘cdc_ether’ at usb-0000:00:1d.7-3, CDC Ethernet Device,
32:89:fb:38:00:04
usbcore: registered new interface driver cdc_ether
ADDRCONF(NETDEV_CHANGE): usb0: link becomes ready
```

Chú ý rằng phía host của link đã tự động cài `cdc_ether.ko` và module dependency của nó, `usbnet.ko`. Trên laptop Ubuntu 8.04 của tôi:

```
$ lsmod | head -n 3
Module                  Size  Used by
cdc_ether               7168  0
usbnet                 20232  1 cdc_ether
```

Bây giờ chúng ta cấu hình interface host-side `usb0` với một IP address hợp lệ, dễ nhất là trên cùng subnet, và đã hoàn tất. Chúng ta đã có một Ethernet interface hoạt động từ BeagleBoard đến USB host interface trên laptop. Lưu ý rằng nếu laptop/desktop distribution không chạy udev vì một lý do khó tưởng tượng nào đó, hoặc không được cấu hình đúng, bạn sẽ phải load usbnet và cdc\_ether thủ công ở phía host của link. Nếu một peripheral device được cấu hình đúng như BeagleBoard được nối vào USB host port trên desktop/laptop host, việc load những module này sẽ tạo và enumerate một interface `usb0`.

### 18.5.4 USB network support

Một phương pháp khác để có Ethernet trên thiết bị embedded có USB port là dùng Ethernet “dongle” cắm vào USB host port. Các dongle này có sẵn ở nhiều cửa hàng điện tử và trên mạng. Dongle chúng ta sẽ dùng trong ví dụ tiếp theo được mua từ Radio Shack. Đây là một thiết bị không có gì đặc biệt, được sản xuất tại Trung Quốc và chứa ASIX chipset. Khi cắm vào USB host port, nó trở thành một Ethernet port hoạt động đầy đủ.

Bạn cần bật hỗ trợ chức năng này trong kernel. Với dongle cụ thể này, bạn phải bật USB\_USBNET và USB\_NET\_AX8817X. Các option này nằm trong Device Drivers --\> Network Devices --\> USB Network Support của kernel configuration utility. Sau khi load những USB driver low-level cần thiết, hãy load ASIX driver và cắm Ethernet dongle. ASIX driver được load như sau:

```
# modprobe asix
usbcore: registered new interface driver asix
# usb 1-1.3: new high speed USB device using musb_hdrc and address 3
usb 1-1.3: configuration #1 chosen from 1 choice
eth0 (asix): not using net_device_ops yet
eth0: register ‘asix’ at usb-musb_hdrc-1.3, ASIX AX88772 USB 2.0 Ethernet,
00:50:b6:03:c8:f8
```

Trước tiên, bạn thấy các thông báo từ USB support low-level, enumerate USB device mới (1-1.3). Sau đó, ASIX driver tiếp quản và tạo một Ethernet interface mới, `eth0`. Trừ khi bạn thay đổi các lựa chọn bằng cách truyền parameter cho ASIX module khi load, nó sẽ tạo cho bạn một Ethernet MAC address ngẫu nhiên.

Bước tiếp theo đơn giản là cấu hình interface với một IP address hợp lệ:

```
# ifconfig eth0 192.168.4.159
eth0: link up, 100Mbps, full-duplex, lpa 0xCDE1
eth0: link up, 100Mbps, full-duplex, lpa 0xCDE1
# ping 192.168.4.1
PING 192.168.4.1 (192.168.0.1) 56(84) bytes of data.
64 bytes from 192.168.4.1: icmp_seq=1 ttl=64 time=1002 ms
64 bytes from 192.168.4.1: icmp_seq=2 ttl=64 time=0.305 ms
64 bytes from 192.168.4.1: icmp_seq=3 ttl=64 time=0.336 ms
```

Chỉ có vậy!

## 18.6 Debug USB

Có nhiều debug option khi USB support được bật. Bật các thông báo debug chi tiết là cách tốt để biết điều gì đang diễn ra trong hệ thống. Bật USB\_DEBUG trong kernel configuration để xem thông báo debug từ `usbcore` và hub driver, vốn là một phần của `usbcore`. Bật USB\_ANNOUNCE\_NEW\_DEVICES sẽ tạo báo cáo cho mỗi device được cắm vào, liệt kê các chuỗi vendor, product, manufacturer và serial number từ descriptor của device. Cả hai option đều bật output đến syslog và nằm trong USB Support --\> Support for Host-side USB.

Listing 18-12 hiển thị các syslog entry sau khi bạn cắm Ethernet dongle từ ví dụ trước, với những debug configuration option vừa đề cập đã được compile vào kernel.

LISTING 18-12 Debug output khi cắm Ethernet dongle

```
user.info  kernel: usb 1-1.3: new high speed USB device using musb_hdrc
and address 3
user.debug kernel: usb 1-1.3: default language 0x0409
user.info  kernel: usb 1-1.3: New USB device found, idVendor=0b95, idProduct=7720
Jan  1 00:02:38 (none) user.info kernel: usb 1-1.3: New USB device strings:
Mfr=1, Product=2, SerialNumber=3
user.info  kernel: usb 1-1.3: Product: AX88772
user.info  kernel: usb 1-1.3: Manufacturer: ASIX Elec. Corp.
user.info  kernel: usb 1-1.3: SerialNumber: 000001
user.debug kernel: usb 1-1.3: uevent
user.debug kernel: usb 1-1.3: usb_probe_device
user.info  kernel: usb 1-1.3: configuration #1 chosen from 1 choice
user.debug kernel: usb 1-1.3: adding 1-1.3:1.0 (config #1, interface 0)
user.debug kernel: usb 1-1.3:1.0: uevent
user.debug kernel: drivers/usb/core/inode.c: creating file ‘003’
```

Phần lớn log entry đều self-explanatory. Bạn có thể thắc mắc về log entry cuối cùng thông báo tạo file `‘003’`. Bạn đặc biệt có thể bối rối khi không tìm thấy file này trên target system. Nó là một phần của usb device file system, usbfs, và chỉ hiển thị sau khi bạn mount usbfs như đã mô tả ở trên:

```
# mount -t usbfs usbfs /proc/bus/usb
```

Sau khi mount usbfs, bạn thấy file được tạo dưới `/proc/bus/usb/001`, biểu diễn USB interface vừa được khởi tạo. 001 là bus number, còn 003 biểu diễn device. File này không ở dạng human-readable; nó chứa dữ liệu từ các descriptor của USB interface.

Một số platform và driver có thể có debug option platform-specific. Chẳng hạn, các BeagleBoard kernel sử dụng driver `musb_hdrc` có thể được compile với chức năng debug. Bật `USB_MUSB_DEBUG` trong kernel configuration để có chức năng này. Để sử dụng, bạn phải truyền một debug level vào driver `musb_hdrc` khi load nó. Option cụ thể này có thể tạo thông tin debug chi tiết, bao gồm thông tin về mỗi USB message được gửi giữa các device. Bạn có thể nhớ rằng để truyền module parameter vào module, cần chỉ định nó trên command line `modprobe` hoặc trong các configuration file distribution-specific. Ví dụ này đặt debug level thành 3 trong driver `musb_hdrc`:

```
# modprobe musb_hdrc debug=3
```

### 18.6.1 usbmon

Nếu thích tìm hiểu chuyên sâu theo kiểu hard-core, bạn có thể thử `usbmon`. Đây là một USB packet sniffer khá giống `tcpdump`. Từ “packet” thực ra không được dùng trong USB, nhưng khái niệm là như nhau. `usbmon` cho phép bạn thu raw trace của các transfer giữa device trên USB bus. Chẳng hạn, nếu đang phát triển một USB device từ đầu, công cụ này có thể hữu ích.

Để dùng `usbmon`, trước tiên bạn phải bật DEBUG\_FS trong menu Kernel Hacking của kernel configuration. Bạn cũng phải bật USB\_MON, nằm trong Device Drivers --\> USB Support --\> Support for host side USB.

Sau khi bật, bạn phải mount debugfs file system như sau:

```
# mount -t debugfs debugfs /sys/kernel/debug
```

Sau đó, load driver `usbmon.ko`:

```
# modprobe usbmon
```

Sau khi hoàn tất, tracing được bật. Bạn thấy các debug socket mà driver `usbmon` tạo trong `/sys/kernel/debug/usbmon`. Kernel dump các packet vào những debug socket này. Giống `tcpdump`, chúng được dump theo text format, khiến chúng phần nào trở thành human-readable. Chỉ cần chạy `cat` trên một socket. Listing 18-13 cho thấy một vài dòng trace khi một USB Flash drive được cắm vào BeagleBoard đã bật `usbmon`.

LISTING 18-13 Trace `usbmon`

```
# cat /sys/kernel/debug/usbmon/0u
c717ee40 1830790883 C Ii:1:002:1 0:2048 1 D
c717ee40 1830790944 S Ii:1:002:1 -115:2048 1 <
c717e140 1830791005 S Ci:1:002:0 s a3 00 0000 0003 0004 4 <
c717e140 1830791249 C Ci:1:002:0 0 4 = 01010100
c717e140 1830791279 S Co:1:002:0 s 23 01 0010 0003 0000 0
c717e140 1830791524 C Co:1:002:0 0 0
c717e140 1830791554 S Co:1:002:0 s 23 03 0016 0003 0000 0
```

Process `cat` được khởi chạy trước khi USB Flash drive được cắm vào. Có Fifty-three dòng output được tạo, cho biết 53 USB packet[^11] đã được truyền. Định dạng và chi tiết của trace output này nằm ngoài phạm vi cuốn sách. Bạn có thể tham khảo write-up trong kernel source tree tại `.../Documentation/usb/usbmon.txt` để biết các chi tiết đó. Tuy nhiên, cần kiến thức chi tiết hơn về USB architecture nội bộ để hiểu đầy đủ. Cuối chương có các tài liệu tham khảo nếu bạn muốn tiến thêm một bước trong việc tìm hiểu USB.

### 18.6.2 Các thông tin USB hữu ích khác

Thường khi cắm một USB device vào host, bạn không thấy nhiều điều xảy ra. Có thể có nhiều lỗi, nhưng khả năng lớn nhất là không có device driver cho device đó. Nếu khi cắm USB device, bạn thấy những thông báo như sau trong syslog, điều đó có nghĩa là device đã được nhận diện, các descriptor đã được đọc và một configuration đã được chọn, nhưng Linux không tìm thấy device driver phù hợp:

```
usb 1-1.1: new high speed USB device using ehci_hcd and address 5
usb 1-1.1: configuration #1 chosen from 1 choice
```

Cách khắc phục là tìm và bật device driver phù hợp cho thiết bị USB của bạn. Tất nhiên, với vai trò lập trình viên embedded, có thể bạn phải tự viết một driver.

Mặc dù có vẻ hiển nhiên, các hệ thống phụ thuộc vào USB device như bàn phím hoặc chuột nên cấu hình những device driver này để link tĩnh vào kernel (`=y`). Điều này ngăn khả năng mất console khi remove một module mà hệ thống phụ thuộc vào.

## 18.7 Tổng kết

Chương này trình bày nền tảng để hiểu USB subsystem khá phức tạp. Nó mô tả topology và các khái niệm, đồng thời khảo sát cách cấu hình và sử dụng USB. Những USB subsystem được sử dụng phổ biến nhất cũng đã được thảo luận.

- Bạn có thể hiểu USB rõ hơn bằng cách xem xét physical topology và logical topology của nó.

- Các loại USB cable và connector khác nhau đã được trình bày.

- Một số ví dụ về cấu hình USB đã được trình bày.

- Sysfs được giới thiệu trong Chương 9, và cách sử dụng nó với USB được trình bày ở đây.

- Một số công cụ hữu ích để tìm hiểu và khắc phục sự cố USB đã được trình bày chi tiết.

- Các class driver bao gồm mass storage, HID và CDC đã được giới thiệu.

- Chương kết thúc bằng một số debug tool và gợi ý hữu ích.

### 18.7.1 Gợi ý đọc thêm

Universal Serial Bus System Architecture, 2nd Edition Don Anderson Mindshare, Inc., 2001

Enhanced Host Controller Interface Specification for Universal Serial Bus Version 1.0 Intel Corporation www.intel.com/technology/usb/download/ehci-r10.pdf

Essential Linux Device Drivers Chapter 11, “Universal Serial Bus” Sreekrishnan Venkateswaran Prentice Hall, 2008

Linux Device Drivers, 3rd Edition Chapter 13, “USB” Jonathan Corbet, Alessandro Rubini, Greg Kroah-Hartman O’Reilly, 2005 Universal Serial Bus Specification Revision 2.0, April 27, 2000 www.usb.org/developers/docs/usb\_20\_052709.zip

USB Approved Class Specification Documents www.usb.org/developers/devclass\_docs

[^1]: Các descriptor này được mô tả trong Chương 9, “File Systems”, của USB 2.0 specification, được dẫn ở cuối chương này.

[^2]: Theo lịch sử sửa đổi trong USB 2.0 specification hiện tại.

[^3]: Các lập trình viên Linux USB đặt ra thuật ngữ “gadget” để tránh nhầm lẫn với thuật ngữ “device” vốn được dùng quá nhiều, như trong device driver.

[^4]: Linux kernel make target này chủ yếu dành cho kiểm thử build, tạo một cấu hình sử dụng mọi module ở những nơi có thể.

[^5]: Bạn có thể nhớ từ các chương trước rằng configuration variable thực luôn bắt đầu bằng `CONFIG_`, nhưng phần này bị lược bỏ trong những GUI chúng ta dùng để cấu hình kernel. Ví dụ, `USB_SUPPORT` trong Hình 18-3 thực sự tương ứng với `CONFIG_USB_SUPPORT` trong kernel configuration file `.config`.

[^6]: Hãy nhớ rằng ký hiệu này mô tả vị trí file tính từ kernel directory top-level của bạn.

[^7]: Controller Dual-role có thể đóng vai trò USB host hoặc USB peripheral và chuyển đổi giữa hai chức năng khi đang hoạt động. Như bạn sẽ sớm tìm hiểu, điều này được gọi là USB On-The-Go (OTG).

[^8]: Tài liệu tham khảo cho EHCI specification này nằm ở cuối chương.

[^9]: Mặc dù có thể sử dụng các thành phần chung của CDC, việc dùng Ethernet dongle trong ví dụ sau không hoàn toàn thông qua một CDC class driver.

[^10]: Compile `TWL4030_USB` trực tiếp vào kernel (`=y`) thuận tiện hơn vì hầu như không có lý do để remove nó. Nó cần thiết cho mọi USB mode và chiếm rất ít dung lượng.

[^11]: Thuật ngữ “packet” không nằm trong từ vựng USB. Tuy nhiên, các chi tiết nằm ngoài phạm vi cuốn sách. Hãy xem tài liệu tham khảo cuối chương nếu bạn muốn tìm hiểu sâu hơn.
