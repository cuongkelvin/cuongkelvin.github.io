# Phụ lục B. Quản trị mạng

Phụ lục này điểm lại một số công cụ phổ biến nhất để quản trị mạng và debug. Các công cụ giúp ích nhiều trong việc tìm giải pháp cho vấn đề thường gặp và phát triển, debug, benchmark, phân tích, xử lý sự cố, nghiên cứu dự án mạng. Phần lớn có tài liệu rất tốt, dưới dạng man page hoặc wiki page, cùng nhiều nguồn thông tin khác trên Internet. Nhiều công cụ có mailing list hoạt động tích cực (cho user và developer) và bug reporting system. Một số công cụ thường dùng nhất được mô tả tại đây bằng mục đích và link liên quan, kèm ví dụ. Công cụ trong phụ lục xuất hiện theo thứ tự bảng chữ cái.

## arp

Lệnh này để quản lý ARP table. Ví dụ sử dụng:

Bạn có thể hiển thị ARP table bằng cách chạy `arp` từ command-line. `arp –n` hiển thị ARP table mà không name resolution.

Có thể thêm static entry vào ARP table bằng:

```
arp –s 192.168.2.10 00:e0:4c:11:22:33
```

Tiện ích `arp` thuộc package `net-tools`. Website: `http://net-tools.sourceforge.net`.

## arping

Tiện ích gửi ARP request. Flag `–D` dành cho Duplicate Address Detection (DAD). Tiện ích `arping` thuộc package `iputils`. Website: `http://www.skbuff.net/iputils/`.

## arptables

Công cụ userspace cấu hình rule cho ARP rules firewall Linux-based. Website: `http://ebtables.sourceforge.net/`.

## arpwatch

Công cụ userspace giám sát ARP traffic. Website: `http://ee.lbl.gov/`.

## ApacheBench (ab)

Tiện ích command-line đo hiệu năng HTTP web server. ApacheBench thuộc dự án mã nguồn mở Apache. Trong nhiều distribution (ví dụ Ubuntu), nó thuộc package `apache2-utils`. Ví dụ sử dụng:

`ab -n 100 http://www.google.com/`

Option `-n` là số request thực hiện trong benchmarking session.

## brctl

Tiện ích command-line quản trị Ethernet bridge, cho phép thiết lập bridge configuration. Tiện ích `brctl` thuộc package `bridge-utils`. Ví dụ sử dụng:

- `brctl addbr mybr`: Thêm bridge tên `mybr`.

- `brctl delbr mybr`: Xóa bridge tên `mybr`.

- `brctl addif mybr eth1`: Thêm interface `eth1` vào bridge.

- `brctl delif mybr eth1`: Xóa interface `eth1` khỏi bridge.

- `brctl show`: Hiển thị thông tin bridge và port gắn vào.

Maintainer của package `bridge-utils` là Stephen Hemminger. Có thể lấy repository `git` bằng:

```
git clone git://git.kernel.org/pub/scm/linux/kernel/git/shemminger/bridge-utils.git
```

Website: `http://www.linuxfoundation.org/collaborate/workgroups/networking/bridge`.

## conntrack-tools

Bộ công cụ userspace quản lý netfilter connection tracking. Gồm userspace daemon `conntrackd` và công cụ command-line `conntrack`. Website: `http://conntrack-tools.netfilter.org/`.

## crtools

Tiện ích checkpoint/restore process. Website: `http://criu.org/Installation`.

## ebtables

Công cụ userspace cấu hình rule cho bridging firewall Linux-based. Website: `http://ebtables.sourceforge.net/`.

## ether-wake

Tiện ích gửi Wake-On-LAN Magic Packet. Tiện ích `ether-wake` thuộc package `net-tools`.

## ethtool

Tiện ích `ethtool` cung cấp cách truy vấn hoặc điều khiển network driver và hardware setting, lấy thống kê, lấy thông tin chẩn đoán, v.v. Với `ethtool`, có thể điều khiển tham số Ethernet device như speed, duplex, auto-negotiation và flow control. Nhiều tính năng `ethtool` cần hỗ trợ trong network driver code.

Ví dụ:

- Output của `ethtool eth0:`

```
Settings for eth0:
        Supported ports: [ TP MII ]
        Supported link modes:   10baseT/Half 10baseT/Full
                                100baseT/Half 100baseT/Full
                                1000baseT/Half 1000baseT/Full
        Supported pause frame use: No
        Supports auto-negotiation: Yes
        Advertised link modes:  10baseT/Half 10baseT/Full
                                100baseT/Half 100baseT/Full
                                1000baseT/Half 1000baseT/Full
        Advertised pause frame use: Symmetric Receive-only
        Advertised auto-negotiation: Yes
        Speed: 10Mb/s
        Duplex: Half
        Port: MII
        PHYAD: 0
        Transceiver: internal
        Auto-negotiation: on
        Supports Wake-on: pumbg
        Wake-on: g
        Current message level: 0x00000033 (51)
                               drv probe ifdown ifup
        Link detected: no
```

- Lấy offload parameter bằng: `ethtool –k eth1`.

- Đặt offload parameter bằng: `ethtool –K eth1 offLoadParamater`.

- Truy vấn network device để lấy thông tin driver gắn kèm bằng: `ethtool -i eth1`.

- Hiển thị thống kê bằng: `ethtool -S eth1` (lưu ý không phải mọi network device driver đều triển khai tính năng này).

- Hiển thị permanent hardware (MAC) address: `ethtool -P eth0`.

Phát triển `ethtool` bằng cách gửi patch đến mailing list `netdev`. Maintainer của `ethtool` tại thời điểm viết sách là Ben Hutchings. Dự án `ethtool` được phát triển trên repository `git`. Có thể tải bằng: `git clone git://git.kernel.org/pub/scm/network/ethtool/ethtool.git`.

Website: `www.kernel.org/pub/software/network/ethtool/`.

## git

Distributed version control system do Linus Torvalds khởi xướng. Phát triển Linux kernel và nhiều dự án liên quan Linux được quản lý bằng `git`. Cũng có thể dùng lệnh `git send-email` để gửi patch qua mail. Website`:` `http://git-scm.com/`.

## hciconfig

Công cụ command-line cấu hình Bluetooth device. Với `hciconfig`, có thể hiển thị thông tin như Bluetooth interface type (BR/EDR hoặc AMP), Bluetooth address, flag, v.v. Công cụ `hciconfig` thuộc package `bluez`. Ví dụ:

```
hciconfig
hci0:   Type: BR/EDR  Bus: USB
        BD Address: 00:02:72:AA:FB:94  ACL MTU: 1021:7  SCO MTU: 64:1
        UP RUNNING PSCAN
        RX bytes:964 acl:0 sco:0 events:41 errors:0
        TX bytes:903 acl:0 sco:0 commands:41 errors:0
```

Website: `http://www.bluez.org/`.

## hcidump

Tiện ích command-line dump raw HCI data đi đến và đi từ Bluetooth device. Tiện ích `hcidump` thuộc package `bluez-hcidump`. Website: `http://www.bluez.org/`.

## hcitool

Tiện ích command-line cấu hình Bluetooth connection và gửi một số command đặc biệt tới Bluetooth device. Ví dụ, có thể quét Bluetooth device lân cận bằng: `hcitool scan`. Tiện ích `hcitool` thuộc package `bluez-hcidump`.

## ifconifg

Lệnh `ifconfig` cho phép cấu hình các network interface parameter, gồm IP address của device, MTU, MAC address, Tx queue length (`txqueuelen`), flag, v.v. Công cụ `ifconfig` thuộc package `net-tools`, cũ hơn package `iproute2` (trình bày phía sau phụ lục). Sau đây là ba ví dụ sử dụng:

- `ifconfig eth0 mtu 1300`: Đổi MTU thành 1300.

- `ifconfig eth0 txqueuelen 1100`: Đổi Tx Queue length thành 1100.

- `ifconfig eth0 –arp`: Tắt ARP protocol trên `eth0`.

Website: `http://net-tools.sourceforge.net`.

## ifenslave

Tiện ích gắn và tách slave network device với bonding device. Bonding là gộp nhiều physical Ethernet device thành một logical device, thường gọi Link aggregation/Trunking/Link bundling. Source file ở `Documentation/networking/ifenslave.c`. Ví dụ có thể gắn `eth0` vào bonding device `bond0` bằng:

```
ifenslave bond0 eth0
```

Tiện ích `ifenslave` thuộc package `iputils`, do Yoshifuji Hideaki duy trì. Website: `www.skbuff.net/iputils/`.

## iperf

Dự án `iperf` là dự án mã nguồn mở cung cấp benchmarking tool đo TCP và UDP bandwidth performance. Cho phép tinh chỉnh nhiều tham số. Công cụ `iperf` báo bandwidth, delay jitter và datagram loss. Ban đầu do Distributed Applications Support Team (DAST) tại National Laboratory for Applied Network Research (NLANR) phát triển bằng C++. Hoạt động theo mô hình client-server. Triển khai mới từ đầu, `iperf3`, không tương thích ngược với `iperf` ban đầu, có tại `https://code.google.com/p/iperf/`. `iperf3` được cho là có code base đơn giản hơn. Công cụ `iperf3` cũng báo CPU utilization trung bình của client và server.

### Sử dụng iperf

Sau đây là ví dụ đơn giản dùng `iperf` đo TCP performance. Trên một device (có IP address 192.168.2.104), chạy lệnh sau để khởi chạy phía server (mặc định là TCP socket trên port 5001):

```
iperf -s
```

Trên device thứ hai, chạy TCP client `iperf` để kết nối tới server `iperf`:

```
iperf -c 192.168.2.104
```

Phía client sẽ thấy:

```
------------------------------------------------------------
Client connecting to 192.168.2.104, TCP port 5001
TCP window size: 22.9 KByte (default)
------------------------------------------------------------
[  3] local 192.168.2.200 port 35146 connected with 192.168.2.104 port 5001
```

Time interval mặc định là 10 giây. Sau 10 giây, client ngắt kết nối, bạn thấy thông báo như sau trên terminal:

```
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0-10.3 sec  7.62 MBytes  6.20 Mbits/sec
```

Có thể tinh chỉnh nhiều tham số `iperf`, như:

- `–u`: Để dùng UDP socket.

- `-t`: Để dùng time interval khác tính bằng giây thay mặc định 10 giây.

- `-T`: Đặt TTL cho multicast (mặc định 1).

- `-B`: Bind vào host, interface hoặc multicast address.

Xem `man iperf`. Website: `http://iperf.sourceforge.net/`.

## iproute2

Package `iproute2` cung cấp nhiều công cụ tương tác giữa userspace và kernel networking subsystem. Công cụ well-known nhất là lệnh `ip`. Dựa trên netlink socket (trình bày ở Chương 2). Với

lệnh `ip`, có thể thực hiện nhiều thao tác trên phạm vi networking rộng, và lệnh có nhiều option; xem `man 8 ip`. Sau đây là ví dụ dùng lệnh `ip` cho các tác vụ:

- Cấu hình network device bằng `ip addr`:

- `ip addr add 192.168.0.10/24 dev eth0`: Đặt IP address trên `eth0`.

- `ip addr show`: Hiển thị địa chỉ mọi network interface (cả IPv4 và IPv6).

Xem `man ip address`.

- Cấu hình network device bằng `ip link`:

- `ip link add mybr type bridge`: Tạo bridge tên `mybr`.

- `ip link add name myteam type team`: Tạo teaming device tên `myteam`. (Teaming device driver tổng hợp nhiều physical Ethernet device thành một logical device, thực chất là bonding device mới. Teaming driver trình bày ở Chương 14.)

- `ip link set eth1 mtu 1450`: Đặt MTU của `eth1` bằng 1450.

Xem `man ip link`.

- Quản lý ARP table (IPv4) và NDISC table (IPv6):

- `ip neigh show`: Hiển thị cả IPv4 neighbouring table (ARP table) và IPv6 neighbouring table.

- `ip -6 neigh show`: Chỉ hiển thị IPv6 neighbouring table.

- `ip neigh flush dev eth0`: Xóa mọi entry khỏi neighboring table gắn với `eth0`.

- `ip neigh add 192.168.2.20 dev eth2 lladdr 00:11:22:33:44:55 nud permanent`: Thêm permanent neighbour entry (tương tự thêm static entry vào ARP table).

- `ip neigh change 192.168.2.20 dev eth2 lladdr 55:44:33:22:11:00 nud permanent`: Cập nhật neighbour entry.

Xem `man ip neighbour`.

- Quản lý tham số neighbour table:

- `ip ntable show`: Hiển thị tham số neighbour table.

- `ip ntable change name arp_cache locktime 1200 dev eth0`: Đổi tham số `locktime` cho IPv4 neighbouring table gắn với `eth0`.

Xem `man ip ntable`.

- Quản lý network namespace:

- `ip netns add myNamespace`: Thêm network namespace tên `myNamespace`.

- `ip netns del myNamespace`: Xóa network namespace tên `myNamespace`.

- `ip netns list`: Hiển thị mọi network namespace trên host.

- `ip netns monitor`: Hiển thị một dòng trên màn hình cho mỗi network namespace được thêm hoặc xóa bằng lệnh `ip netns`. Xem `man ip netns`.

- Cấu hình multicast address:

- `ip maddr show`: Hiển thị mọi multicast address trên host (cả IPv4 và IPv6).

- `ip maddr add 00:10:02:03:04:05 dev eth1`: Thêm multicast address trên `eth1`.

Xem `man ip maddress`.

- Giám sát netlink message. Ví dụ:

- `ip monitor route` hiển thị trên màn hình thông báo về network event như thêm hoặc xóa route.

Xem `man ip monitor`.

- Quản lý routing table:

- `ip route show`: Hiển thị routing table.

- `ip route flush dev eth1`: Xóa routing entry gắn với `eth1` khỏi routing table.

- `ip route add default via 192.168.2.1`: Thêm 192.168.2.1 làm default gateway.

- `ip route get 192.168.2.10`: Lấy route tới 192.168.2.10 và hiển thị.

Xem `man ip route`.

- Quản lý rule trong RPDB (Routing Policy DataBase). Ví dụ:

- `ip rule add tos 0x02 table 200`: Thêm rule đặt routing subsystem thực hiện lookup trong routing table 252 cho packet có TOS value 0x02 (TOS là field trong IPv4 header).

- `ip rule del tos 0x02 table 200`: Xóa rule chỉ định khỏi RPDB.

- `ip rule show`: Hiển thị rule trong RPDB.

Xem `man ip rule`.

- Quản lý TUN/TAP device:

- `ip tuntap add tun1 mode tun`: Tạo TUN device tên `tun1`.

- `ip tuntap del tun1 mode tun`: Xóa TUN device tên `tun1`.

- `ip tuntap add tap1 mode tap`: Tạo TAP device tên `tap1`.

- `ip tuntap del tap1 mode tap`: Xóa TAP device tên `tap1`.

- Quản lý IPsec policy:

- `ip xfrm policy show`: Hiển thị IPsec policy.

- `ip xfrm state show`: Hiển thị IPsec state.

Xem `man ip xfrm`.

Công cụ `ss` dùng dump socket statistic. Ví dụ, chạy

```
ss -t –a
```

sẽ hiển thị mọi TCP socket:

```
State       Recv-Q Send-Q          Local Address:Port              Peer Address:Port
LISTEN      0      32                          *:ftp                          *:*
LISTEN      0      128                         *:ssh                          *:*
LISTEN      0      128                 127.0.0.1:ipp                          *:*
ESTAB       0      0               192.168.2.200:ssh              192.168.2.104:52089
ESTAB       0      52              192.168.2.200:ssh              192.168.2.104:51352
ESTAB       0      0               192.168.2.200:ssh              192.168.2.104:51523
ESTAB       0      0               192.168.2.200:59532           107.21.231.190:http
LISTEN      0      128                        :::ssh                         :::*
LISTEN      0      128                       ::1:ipp                         :::*
CLOSE-WAIT  1      0                         ::1:48723                      ::1:ipp
```

Có các công cụ khác trong `iproute2`:

- `bridge`: Hiển thị/thao tác bridge address và device. Ví dụ:

- `bridge fdb show`: Hiển thị forwarding entry.

Xem `man bridge`.

- `genl`: Lấy thông tin (như id, header size, max attribute, v.v.) về generic netlink family đã đăng ký. Ví dụ, chạy `genl ctrl list` có thể cho kết quả:

```
Name: nlctrl
        ID: 0x10  Version: 0x2  header size: 0  max attribs: 7
        commands supported:
                #1:  ID-0x3
                Capabilities (0xe):
                  can doit; can dumpit; has policy

        multicast groups:
                #1:  ID-0x10  name: notify
```

- `lnstat`: Hiển thị Linux network statistic.

- `rtmon`: Giám sát Rtnetlink socket.

- `tc`: Hiển thị/thao tác traffic control setting. Ví dụ:

- `tc qdisc show`: Chạy lệnh này hiển thị queueing discipline (`qdisc`) entry nào được cài, ví dụ:

```
qdisc pfifo_fast 0: dev eth1 root refcnt 2 bands 3 priomap  1 2 . . .
```

- Kết quả cho thấy `pfifo_fast qdisc` gắn với network device `eth1`. `pfifo_fast qdisc`, classless queueing discipline, là `qdisc` mặc định trong Linux.

- `tc -s qdisc show dev eth1`: Hiển thị thống kê `qdisc` gắn với `eth1`.

Xem `man tc`.

Xem: Linux Advanced Routing \& Traffic Control HOWTO: `www.lartc.org/howto/`.

Phát triển `iproute2` bằng cách gửi patch đến mailing list `netdev`. Maintainer của `ethtool` tại thời điểm viết sách là Stephen Hemminger. `iproute2` được phát triển trên repository `git`, có thể tải bằng: `git clone git://git.kernel.org/pub/scm/linux/kernel/git/shemminger/iproute2.git`.

## iptables và iptables6

`iptables` và `iptables6` là công cụ quản trị để packet filtering và quản lý NAT lần lượt cho IPv4 và IPv6. Với `iptables`/`iptables6`, có thể định nghĩa list rule. Mỗi rule cho biết cần làm gì với packet (ví dụ loại bỏ hoặc chấp nhận). Mỗi rule chỉ định matching condition cho packet, ví dụ phải là UDP packet. Sau đây là ví dụ dùng lệnh `iptables`:

- `iptables -A INPUT -p tcp --dport=80 -j LOG --log-level 1`: Rule này nghĩa là incoming TCP packet có destination port 80 được dump vào syslog.

- `iptables –L`: Liệt kê mọi rule trong filter table. (Lệnh không đề cập table nên truy cập Filter table, là table mặc định.)

- `iptables –t nat –L`: Liệt kê mọi rule trong NAT table.

- `iptables –F`: Flush table được chọn.

- `iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE`: Đặt MASQUERADE rule.

Website: `www.netfilter.org/`.

## ipvsadm

Công cụ quản trị Linux Virtual Server. Website: `www.linuxvirtualserver.org/software/ipvs.html`.

## iw

Hiển thị/thao tác wireless device và cấu hình. Package `iw` dựa trên generic netlink socket (xem Chương 2). Ví dụ có thể thực hiện:

- `iw dev wlan0 scan`: Quét wireless device lân cận.

- `iw wlan0 station dump`: Hiển thị thống kê station.

- `iw list`: Lấy thông tin wireless device (như band information và thông tin 802.11n).

- `iw dev wlan0 get power_save` – lấy power save mode.

- `iw dev wlan0 set type ibss`: Đổi wireless interface mode thành ibss (Ad-Hoc).

- `iw dev wlan0 set type mesh`: Đổi wireless interface mode thành mesh mode.

- `iw dev wlan0 set type monitor`: Đổi wireless interface mode thành monitor mode.

- `iw dev wlan0 set type managed`: Đổi wireless interface mode thành managed mode.

Xem `man iw`. Gitweb: `http://git.kernel.org/cgit/linux/kernel/git/jberg/iw.git`. Website: `http://wireless.kernel.org/en/users/Documentation/iw`.

## iwconfig

Công cụ cũ để quản trị wireless device. `iwconfig` thuộc package `wireless-tools`, dựa trên IOCTL. Website: `www.hpl.hp.com/personal/Jean_Tourrilhes/Linux/Tools.html`.

## Dự án libreswan

Giải pháp IPsec software fork từ `openswan` version 2.6.38. Website: `http://libreswan.org/`.

## l2ping

Tiện ích command-line gửi L2CAP echo request và nhận phản hồi qua Bluetooth device. Tiện ích `l2ping` thuộc package `bluez`. Website: `www.bluez.org/`.

## lowpan-tools

Bộ tiện ích quản lý Linux LoWPAN stack. Website: `http://sourceforge.net/projects/linux-zigbee/files/linux-zigbee-sources/0.3/`.

## lshw

Tiện ích hiển thị thông tin hardware configuration của machine. Website: `http://ezix.org/project/wiki/HardwareLiSter`.

## lscpu

Tiện ích hiển thị thông tin CPU trên hệ thống. Dựa trên thông tin từ `/proc/cpuinfo` và `sysfs`. `lscpu` thuộc package `util-linux`.

## lspci

Tiện ích hiển thị thông tin PCI bus trong hệ thống và device kết nối với chúng. Đôi khi cần lấy thông tin PCI network device bằng lệnh `lspci`. Tiện ích `lspci` thuộc package `pciutils`. Website: `http://mj.ucw.cz/sw/pciutils/`.

## mrouted

Multicast routing daemon triển khai IPv4 Distance Vector Multicast Routing Protocol (DVMRP), quy định trong RFC 1075 năm 1988. Website: `http://troglobit.com/mrouted.html`.

## nc

Tiện ích command-line đọc và ghi dữ liệu qua mạng. `nc` thuộc package `nmap-ncat`. Website: `http://nmap.org/`.

## ngrep

Công cụ command-line dựa trên lệnh `grep` well-known, cho phép chỉ định extended expression để match với data payload của packet. Nhận diện TCP, UDP và ICMP trên Ethernet, PPP, SLIP, FDDI và null interface. Website: `http://ngrep.sourceforge.net/`.

## netperf

Netperf là networking benchmarking tool. Website: `www.netperf.org/netperf/`.

## netsniff-ng

`netsniff-ng` là networking toolkit thuộc dự án mã nguồn mở, có thể hỗ trợ phân tích network traffic, thực hiện stress test, sinh packet tốc độ rất cao, cùng các việc khác. Dùng PF\_PACKET RING zero-copy (TX và RX). Các công cụ cung cấp gồm:

- `netsniff-ng` là analyzer zero-copy nhanh, công cụ capture và replay `pcap`. Công cụ `netsniff-ng` là Linux-specific, không hỗ trợ operating system khác, khác nhiều công cụ trong phụ lục. Ví dụ: chạy `netsniff-ng --in eth1 --out dump.pcap -s -b 0` tạo file `pcap` mà `wireshark` hoặc `tcpdump` đọc được. Flag `–s` để im lặng, `–b` 0 để bind vào CPU 0. Xem `man netsniff-ng`.

- `trafgen` là tiện ích sinh network packet traffic hiệu năng cao, zero-copy.

- `ifpps` là tiện ích nhỏ cung cấp định kỳ thống kê networking và hệ thống từ kernel theo kiểu top-like. `ifpps` lấy dữ liệu trực tiếp từ file `procfs`.

- `bpfc` là Berkeley Packet Filter assembler và compiler nhỏ.

Lấy repository `git`: `git clone git://github.com/borkmann/netsniff-ng.git`. Website: `http://netsniff-ng.org/`.

## netstat

Công cụ `netstat` cho phép in multicast membership, routing table, network connection, interface statistic, socket state, v.v. Công cụ `netstat` thuộc package `net-tools`. Flag hữu ích:

- `netstat –s`: Hiển thị thống kê tổng hợp cho mỗi protocol.

- `netstat –g`: Hiển thị multicast group membership information cho IPv4 và IPv6.

- `netstat -r`: Hiển thị kernel IP routing table.

- `netstat –nl`: Hiển thị listening socket (flag `-n` để hiển thị numerical address thay vì thử xác định symbolic host, port hoặc user name).

- `netstat –aw`: Hiển thị mọi raw socket.

- `netstat –ax`: Hiển thị mọi Unix socket.

- `netstat –at`: Hiển thị mọi TCP socket.

- `netstat –au`: Hiển thị mọi UDP socket.

Website: `http://net-tools.sourceforge.net`.

## nmap (Network Mapper)

Nmap là dự án security mã nguồn mở cung cấp công cụ khám phá và thăm dò mạng cùng security/port scanner. Có tính năng như port scanning (phát hiện open port trên target host), OS detection, phát hiện MAC address, v.v. Ví dụ,

```
nmap www.google.com
```

có thể cho output như:

```
Starting Nmap 6.00 (http://nmap.org ) at 2013-09-26 16:37 IDT
Nmap scan report for www.google.com (212.179.154.227)
Host is up (0.013s latency).
Other addresses for www.google.com (not scanned): 212.179.154.221 212.179.154.251 212.179.154.232
212.179.154.237 212.179.154.216 212.179.154.231 212.179.154.241 212.179.154.247 212.179.154.222
212.179.154.226 212.179.154.236 212.179.154.246 212.179.154.212 212.179.154.217 212.179.154.242
Not shown: 998 filtered ports
PORT    STATE SERVICE
80/tcp  open  http
443/tcp open  https
Nmap done: 1 IP address (1 host up) scanned in 5.24 seconds
```

Tiện ích `nping` của `nmap` có thể sinh raw packet để ARP poisoning, networking stress test và Denial of Service attack, cũng như kiểm tra connectivity như tiện ích `ping` thông thường. Có thể dùng tiện ích `nping` đặt IP option trong traffic sinh ra. Xem `http://nmap.org/book/nping-man-ip-options.html`. Website: `http://nmap.org/`.

## openswan

Dự án mã nguồn mở triển khai giải pháp VPN IPsec-based. Dựa trên dự án FreeS/WAN. Website: `www.openswan.org/projects/openswan`.

## OpenVPN

Dự án mã nguồn mở triển khai VPN dựa trên SSL/TLS. Website: `www.openvpn.net/`.

## packeth

Công cụ sinh packet Ethernet-based cho Ethernet. Có cả GUI và CLI. Website: `http://packeth.sourceforge.net/packeth/Home.html`.

## ping

Tiện ích well-known kiểm tra connectivity bằng cách gửi ICMP ECHO request message. Sau đây là bốn option hữu ích cũng được đề cập trong sách:

- `-Q tos`: Cho phép đặt Quality Of Service bit trong ICMP packet. Đề cập trong phần giải thích filter `tshark` ở phụ lục này.

- `-R`: Đặt Record Route IP option (trình bày ở Chương 4).

- `-T`: Đặt timestamp IP option (trình bày ở Chương 4).

- `-f`: Flood ping.

- Xem `man ping` để biết thêm command-line option.

Tiện ích `ping` thuộc package `iputils`. Website: .`www.skbuff.net/iputils/`.

## pimd

Multicast daemon Protocol Independent Multicast - Sparse Mode (PIM-SM) v2 mã nguồn mở, nhẹ, stand-alone. Do Joachim Nilsson duy trì. Xem `http://troglobit.com/pimd.html`. Repository `git`: `https://github.com/troglobit/pimd/`.

## poptop

PPTP Server cho Linux. Website: `http://poptop.sourceforge.net/dox/`.

## ppp

PPP daemon mã nguồn mở. Repository `git`: `git://ozlabs.org/~paulus/ppp.git`. Website: `http://ppp.samba.org/download.html`.

## pktgen

Kernel module `pktgen` `(net/core/pktgen.c)` có thể sinh packet tốc độ rất cao. Giám sát và điều khiển bằng cách ghi vào entry `/proc/net/pktgen`. Với “HOWTO cho linux packet generator”, xem `Documentation/networking/pktgen.txt`.

## radvd

Đây là Router Advertisement Daemon cho IPv6. Là dự án mã nguồn mở do Reuben Hawkins duy trì. Có thể dùng cho IPv6 stateless autoconfiguration và renumbering. Website: `www.litech.org/radvd/`. Repository `git`: `https://github.com/reubenhwk/radvd`.

## route

Công cụ command-line quản lý routing table. Thuộc package `net-tools`, dựa trên IOCTL và cũ hơn package `iproute2`. Ví dụ:

- `route –n`: Hiển thị routing table mà không name resolving.

- `route add default gateway 192.168.1.1`: Thêm 192.168.1.1 làm default gateway.

- `route –C`: Hiển thị routing cache (lưu ý IPv4 routing cache bị xóa trong kernel 3.6; xem phần “IPv4 Routing Cache” ở Chương 5).

Xem `man route`.

## RP-PPPoE

PPP over Ethernet (PPPoE) client mã nguồn mở cho hệ thống Linux và Solaris. Website: `www.roaringpenguin.com/products/pppoe`.

## sar

Công cụ command-line thu thập và báo thống kê hoạt động hệ thống. Thuộc package `sysstat`. Ví dụ, chạy lệnh sau sẽ hiển thị thống kê CPU bốn lần với interval 1 giây và giá trị trung bình ở cuối:

```
sar 1 4
Linux 3.6.10-4.fc18.x86_64 (a)  10/22/2013      _x86_64_        (2 CPU)

07:47:10 PM     CPU     %user     %nice   %system   %iowait    %steal     %idle
07:47:11 PM     all      0.00      0.00      0.00      0.00      0.00    100.00
07:47:12 PM     all      0.00      0.00      0.00      0.00      0.00    100.00
07:47:13 PM     all      0.00      0.00      0.00      0.00      0.00    100.00
07:47:14 PM     all      0.00      0.00      0.50      0.00      0.00     99.50
Average:        all      0.00      0.00      0.13      0.00      0.00     99.87
```

Website: `http://sebastien.godard.pagesperso-orange.fr/`.

## smcroute

Công cụ command-line thao tác multicast routing. Website: `www.cschill.de/smcroute/`.

## snort

Dự án mã nguồn mở cung cấp network intrusion detection system (IDS) và network intrusion prevention system (IPS). Website: `www.snort.org/`.

## suricata

Dự án mã nguồn mở cung cấp IDS/IPS và network security monitoring engine. Website: `http://suricata-ids.org/`.

## strongSwan

Dự án mã nguồn mở triển khai giải pháp IPsec cho Linux, Android và operating system khác. Triển khai cả IKEv1 và IKEv2. Maintainer là Giáo sư Andreas Steffen. Website: `www.strongswan.org/`.

## sysctl

Tiện ích `sysctl` hiển thị kernel parameter (gồm network parameter) tại runtime. Cũng có thể đặt kernel parameter. Ví dụ `sysctl –a` hiển thị mọi kernel parameter. Tiện ích `sysctl` thuộc package `procps-ng`.

## taskset

Tiện ích command-line đặt hoặc lấy CPU affinity của process. Tiện ích `taskset` thuộc package `util-linux`.

## tcpdump

`Tcpdump` là protocol analyzer command-line mã nguồn mở, có tại `www.tcpdump.org`. Dựa trên C/C++ network traffic capture library tên `libpcap`. Như `wireshark`, có thể ghi kết quả vào file, đọc kết quả từ file và hỗ trợ filtering. Khác `wireshark`, không có front end GUI. Tuy nhiên output file đọc được bằng `wireshark`. Ví dụ sniffing bằng `tcpdump`:

```
tcpdump -i eth1
```

Website: `www.tcpdump.org`.

## top

Tiện ích `top` cung cấp góc nhìn real-time về hệ thống (tham số như memory usage, CPU usage, v.v.) và system summary. Tiện ích thuộc package `procps-ng`. Website: `https://gitorious.org/procps`.

## tracepath

Lệnh `tracepath` trace path đến destination address, phát hiện MTU dọc path. Với IPv6 destination address, có thể dùng `tracepath6`. Tiện ích `tracepath` thuộc package `iputils`. Website: `www.skbuff.net/iputils/`.

## traceroute

In path packet đi qua tới destination nào đó. Tiện ích `traceroute` dùng field Time To Live (TTL) của IP protocol để khiến host trên packet path trả ICMP TIME EXCEEDED response. Tiện ích `traceroute` trình bày ở Chương 3 về ICMP protocol. Website: `http://traceroute.sourceforge.net`.

## tshark

Tiện ích `tshark` cung cấp packet analyzer command-line. Thuộc package `wireshark`. Có nhiều command-line option. Ví dụ, có thể ghi output vào file bằng option `–w`. Có thể đặt nhiều filter cho packet filtering bằng `tshark`, một số có thể phức tạp (như sẽ thấy). Ví dụ đặt filter chỉ capture ICMPv4 packet:

```
tshark -R icmp
Capturing on eth1
17.609101 192.168.2.200 -> 81.218.16.241 ICMP 98 Echo (ping) request  id=0x0dc6, seq=1/256, ttl=64
17.617101 81.218.16.241 -> 192.168.2.200 ICMP 98 Echo (ping) reply    id=0x0dc6, seq=1/256, ttl=58
```

Cũng có thể đặt filter theo giá trị field trong IPv4 header. Ví dụ lệnh sau đặt filter theo DS field trong IPv4 header:

```
tshark -R "ip.dsfield==0x2"
```

Nếu từ terminal thứ hai gửi traffic có DS field bằng 0x2 trong IPv4 header (ví dụ có thể gửi bằng `ping –Q 0x2 destinationAdderss`), nó được `tshark` hiển thị trên màn hình.

Ví dụ lọc theo source MAC address:

```
tshark ether src host 00:e0:4c:11:22:33
```

Ví dụ lọc UDP packet có port trong port range 6000–8000:

```
tshark -R udp portrange 6000-8000
```

Ví dụ đặt filter capture traffic có source IP address 192.168.2.200 và port 80 (không nhất thiết chỉ là TCP traffic vì ở đây không đặt filter theo protocol cụ thể):

```
tshark -i eth1 -f "src host 192.168.2.200 and port 80"
```

## tunctl

`tunctl` là công cụ cũ hơn để tạo TUN/TAP device. Có tại `http://tunctl.sourceforge.net`. Lưu ý cũng có thể tạo hoặc xóa TUN/TAP device bằng lệnh `ip` (xem phần `iproute2` trước đó trong phụ lục) và công cụ command-line `openvpn` thuộc package `openvpn`:

```
openvpn --mktun --dev tun1
openvpn --rmtun --dev tun1
```

## udevadm

Có thể lấy network device type bằng cách chạy `udevadm` trên `sysfs` entry của nó. Ví dụ, nếu device có entry này dưới `sysfs`:

```
/sys/devices/virtual/net/eth1.100
```

thì có thể thấy DEVTYPE là VLAN:

```
udevadm info -q all -p  /sys/devices/virtual/net/eth1.100/

P: /devices/virtual/net/eth1.100
E: COMMENT=net device ()
E: DEVPATH=/devices/virtual/net/eth1.100
E: DEVTYPE=vlan
E: IFINDEX=4
E: INTERFACE=eth1.100
E: MATCHADDR=00:e0:4c:53:44:58
E: MATCHDEVID=0x0
    E: MATCHIFTYPE=1
    E: SUBSYSTEM=net
    E: UDEV_LOG=3
    E: USEC_INITIALIZED=28392625695
```

`udevadm` thuộc package `udev`. Website: `www.kernel.org/pub/linux/utils/kernel/hotplug/udev.html`.

## unshare

Tiện ích `unshare` cho phép tạo namespace và chạy chương trình trong namespace đó, không chia sẻ với parent. Tiện ích `unsare` thuộc package `util-linux`. Để biết các command-line option của tiện ích `unshare`, xem `man unshare`, Ví dụ sử dụng:

```
unshare -u /bin/bash
```

Lệnh này tạo UTS namespace.

```
unshare --net /bin/bash
```

Lệnh này tạo network namespace mới, trong đó process `bash` được khởi chạy. Gitweb: `http://git.kernel.org/cgit/utils/util-linux/util-linux.git`. Website: `http://userweb.kernel.org/~kzak/util-linux/`.

## vconfig

Tiện ích `vconfig` cho phép cấu hình VLAN (802.1q) interface. Ví dụ sử dụng:

- `vconfig add eth2 100`: Thêm VLAN interface. Tạo VLAN interface `eth2.100`.

- `vconfig rem eth2.100`: Xóa VLAN interface `eth2.100`.

- Lưu ý cũng có thể thêm và xóa VLAN interface bằng lệnh `ip`, ví dụ:

- `ip link add link eth0 name eth0.100 type vlan id 100`

- `vconfig set_egress_map eth2.100 0 4`: Map SKB priority 0 sang VLAN priority 4, để outgoing packet có SKB priority 0 được tag bằng 4 làm VLAN priority. VLAN priority mặc định là 0.

- `vconfig set_ingress_map eth2.100 1 5`: Map VLAN priority 5 sang SKB priority 1, để incoming packet có VLAN priority 5 được queue với SKB priority 1. SKB priority mặc định là 0.

Xem `man vconfig`. Lưu ý nếu hỗ trợ VLAN được compile thành kernel module thì phải load VLAN kernel module trước khi

thử thêm VLAN interface, bằng `modprobe 8021q`. Website: `www.candelatech.com/~greear/vlan.html`.

## wpa\_supplicant

Software mã nguồn mở cung cấp wireless supplicant cho Linux và OS khác. Hỗ trợ WPA và WPA2. Website: `http://hostap.epitest.fi/wpa_supplicant/`.

## wireshark

Dự án `wireshark` cung cấp analyzer (“sniffer”) miễn phí và mã nguồn mở. Có hai dạng: GUI front-end dựa trên GTK+ và command-line, tiện ích `tshark` (đề cập trước đó trong phụ lục). Có trên nhiều operating system và phát triển năng động: khi tính năng mới được thêm vào protocol hiện có và protocol mới được thêm, parser (“dissector”) mới được sửa hoặc thêm vào. Wireshark có nhiều tính năng:

- Cho phép định nghĩa nhiều filter (port, destination hoặc source address, protocol identifier, field trong header, v.v.).

- Cho phép sắp xếp kết quả theo nhiều tham số (protocol type, time, v.v.).

- Lưu sniffer output vào file/đọc sniffer output từ file.

- Đọc/ghi nhiều capture file format khác nhau: `tcpdump` (`libpcap`), Pcap NG, v.v.

- Capture Filter và Display Filter.

Kích hoạt sniffer `wireshark` hoặc `thsark` đưa network interface vào promiscuous mode để xử lý packet không dành cho local host. Có nhiều thông tin trong man page: `man wireshark` và `man tshark`. Có thể tìm hơn 75 sniff sample của các protocol khác nhau tại `http://wiki.wireshark.org/SampleCaptures`. Wireshark users mailing list: `www.wireshark.org/mailman/listinfo/wireshark-users`. Website: `www.wireshark.org`. Wiki: `http://wiki.wireshark.org/`.

## XORP

Dự án Open Source triển khai các routing protocol như BGP, IGMP, OLSR, OSPF, PIM và RIP. Tên XORP xuất phát từ eXtensible Open Router Platform. Website: `www.xorp.org/`.
