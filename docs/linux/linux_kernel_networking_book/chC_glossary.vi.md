# Phụ lục C. Thuật ngữ

Danh sách thuật ngữ sau được trình bày trong sách.

ACL—Asynchronous Connection-oriented Link. Một Bluetooth protocol.

ADB — Android Debug Bridge.

AVDTP—Audio/Video Distribution Transport Protocol. Một Bluetooth protocol.

AEAD—Authenticated Encryption with Associated Data.

AES-NI—AES instruction set.

AH—Authentication Header protocol. Dùng trong IPsec, có protocol number 51.

AID—Association ID. Số duy nhất wireless client nhận khi associate với Access Point. Do Access Point gán, nằm trong khoảng 1–2007.

AMP—Alternate MAC/PHY.

AMPDU—Aggregated Mac Protocol Data Unit. Một dạng packet aggregation trong IEEE 802.11n.

AMSDU—Aggregated Mac Service Data Unit. Một dạng packet aggregation trong IEEE 802.11n.

AOSP—Android Open Source Project.

AP—Access Point. Trong wireless network, là wireless device mà wireless client associate vào, cho phép chúng kết nối với wired network.

API—Application Programming Interface. Tập method và data structure định nghĩa interface tới software layer, như interface cho library.

ABRO—Authoritative Border Router Option. Được thêm cho Neighbour Discovery Optimization của IPv6. Xem RFC 6775.

ABS—Android Builders Summit.

ARO—Address Registration Option. Được thêm cho Neighbour Discovery Optimization của IPv6. Xem RFC 6775.

ARP—Address Resolution Protocol. Protocol dùng tìm ánh xạ từ network address (như IPv4 address) sang link layer address (như Ethernet address 48-bit).

ARPD—ARP daemon. Userspace daemon triển khai chức năng ARP.

Ashmem—Android shared memory.

ASM—Any-Source Multicast. Trong mô hình any-source, bạn không chỉ định muốn nhận multicast traffic từ một source address cụ thể hay một tập address.

BA—Cơ chế Block Acknowledgement dùng trong IEEE 802.11n.

BGP—Border Gateway Protocol. Một core routing protocol.

BLE—Bluetooth Low Energy.

BNEP—Bluetooth Network Encapsulation Protocol.

BTH—Base Transport Header. InfiniBand header dài 12 byte. Chỉ định source và destination QP, operation, packet sequence number và partition.

CM—Communication Manager trong InfiniBand stack.

CIDR—Classless Inter-Domain Routing. Cách cấp phát Internet address dùng trong inter-domain routing.

CQ—Completion Queue (InfiniBand).

CRIU — Checkpoint/Restore In Userspace. CRIU là công cụ software chủ yếu triển khai trong userspace, cho phép freeze process đang chạy và checkpoint vào filesystem dưới dạng tập file. Sau đó có thể dùng file để restore và chạy ứng dụng từ điểm đã freeze. Xem `http://criu.org/Main_Page`.

CSMA/CD—Carrier Sense Multiple Access/Collision Detection. Media Access Control method dùng trong Ethernet network.

CSMA/CA—Carrier Sense Multiple Access/Collision Avoidance. Media Access Control method dùng trong wireless network.

CT—Connection Tracking. Netfilter layer làm nền tảng cho NAT.

DAD—Duplicate Address Detection. DAD là cơ chế giúp phát hiện L3 address trùng nhau trên các host khác nhau trong LAN.

DAC—Duplicate Address Confirmation. ICMPv6 type được thêm trong RFC 6775, có giá trị số 158.

DAR—Duplicate Address Request. ICMPv6 type được thêm trong RFC 6775, có giá trị số 157.

DCCP—Datagram Congestion Control Protocol. Transport layer protocol không tin cậy, congestion-controlled. Ví dụ, dùng DCCP phù hợp cho ứng dụng cần delay thấp và chấp nhận mất dữ liệu mức nhỏ, như ứng dụng telephony và streaming media.

DHCP—Dynamic Host Configuration Protocol. Protocol cấu hình network device parameter như IP address, default route và một hoặc nhiều DNS server address.

DMA—Direct Memory Access.

DNAT—Destination NAT. NAT thay đổi destination address.

DNS—Domain Name System. Hệ thống chuyển domain name sang IP address.

DSCP—Differentiated Services Code Point. Cơ chế phân loại.

DVMRP—Distance Vector Multicast Routing Protocol. Protocol định tuyến multicast datagram. Phù hợp dùng trong autonomous system. Định nghĩa trong RFC 1075 năm 1988.

ECN—Explicit Congestion Notification. Xem RFC 3168, “Bổ sung Explicit Congestion Notification (ECN) cho IP.”

EDR—Enhanced Data Rate.

EGP—Exterior Gateway Protocol. Routing protocol hiện được coi là lỗi thời. Được chính thức hóa lần đầu trong RFC 827 năm 1982.

ERTM—Enhanced Retransmission Mode. Protocol tin cậy có error control và flow control, dùng trong Bluetooth.

ESP—Encapsulating Security Payload. Dùng trong IPsec, có protocol number 50.

ETH—Extended Transport Header: InfiniBand header có size từ 4 đến 28 byte. Header biểu diễn một họ header bổ sung có thể hiện diện tùy class của service và operation được dùng.

ETSI—European Telecommunications Standards Institute.

FCS—Frame Check Sequence

FIB—Forwarding Information Base. Database chứa thông tin routing table.

FMR—Fast Memory Region (InfiniBand).

FSF—Free Software Foundation.

FTP—File Transfer Protocol. Protocol truyền file giữa hai host, dựa trên TCP.

GCC—GNU Compiler Collection.

GID—Global Identifier.

GMP—Group Management Protocol. Thuật ngữ chỉ cả IGMP và MLD. Xem RFC 4604, mục 1.

GRE—Generic Routing Encapsulation. Tunneling protocol.

GRH—Global Routing Header. InfiniBand header dài 40 byte. Mô tả source và destination port bằng GID, có format giống IPv6 header.

GRO—Generic Receive Offload. Kỹ thuật gộp incoming packet lúc nhận thành packet lớn hơn để cải thiện hiệu năng.

GSO—Generic Segmentation Offload. Kỹ thuật segment outgoing packet ở vị trí gần network driver nhất có thể hoặc ngay trong network driver, thay vì transport layer.

GUID—Global Unique Identifier.

HAL—Hardware Abstraction Layer.

HCA—Host Channel Adapter.

HCI—Host Controller Interface. Ví dụ dùng trong Bluetooth, PCI, v.v.

HDP—Health Device Profile. Dùng bởi Bluetooth.

HFP—Hands-Free Profile. Dùng bởi Bluetooth.

HoL Blocking—Head-of-line blocking là hiện tượng performance-limiting xảy ra khi hàng packet bị packet đầu tiên chặn lại, ví dụ trong nhiều request của HTTP pipelining.

HPC—High Performance Computing. Quản lý computer resource theo cách đạt hiệu năng cao cho tác vụ nặng như giải quyết vấn đề large-scale trong khoa học, kỹ thuật hoặc kinh tế.

HS—High Speed.

HTTP—Hypertext Transfer Protocol. Protocol cơ bản để truy cập World Wide Web.

HWMP— Hybrid Wireless Mesh Protocol. Routing protocol dùng trong wireless Mesh network, gồm hai loại routing: on-demand routing và proactive routing.

iWARP—Internet Wide Area RDMA Protocol.

iSER—iSCSI extension for RDMA.

IANA—Internet Assigned Numbers Authority. Chịu trách nhiệm IP addressing, phối hợp toàn cầu DNS Root cùng symbol và number IP-related khác. Do Internet Corporation for Assigned Names and Numbers (ICANN) vận hành.

IBTA—InfiniBand Trade Association.

ICMP—Internet Control Message Protocol. IP protocol cho control message và informational message. Tiện ích well-known `ping` dựa trên ICMP. ICMP protocol được biết là dùng trong nhiều loại security DoS attack như Smurf attack.

ICE—Interactive Connectivity Establishment. Quy định trong RFC 5245. Protocol cho NAT traversal.

ICRC—Invariant CRC. InfiniBand header dài 4 byte. Bao phủ mọi field không được thay đổi khi packet đi trong subnet.

IDS—Intrusion Detection System.

IoT—Internet of Things. Kết nối mạng các vật thể hằng ngày.

IEEE—Institute of Electrical and Electronics Engineers.

IGMP—Internet Group Management Protocol. Multicast group membership protocol.

IKE—Internet Key Exchange. Protocol thiết lập IPsec Security Association.

IOMMU—I/O Memory Management Unit.

IP—Internet Protocol. Addressing và routing protocol chính cho Internet. IPv4 lần đầu quy định trong RFC 791 năm 1981, IPv6 lần đầu quy định trong RFC 1883 năm 1995.

IPoIB—IP over InfiniBand.

IPS—Intrusion Prevention System.

ISAKMP—Internet Security Association \& Key Management Protocol.

IOCTL—Input/Output Control. System call cung cấp truy cập từ userspace vào kernel.

IPC—Inter Process Communication. Có nhiều cơ chế IPC khác nhau như shared memory semaphore, message queue, v.v.

IPCOMP—IP Payload Compression Protocol. Compression protocol nhằm giảm size dữ liệu gửi qua network connection chậm. Dùng IPComp tăng overall communication performance giữa hai network node.

IPsec—IP security. Tập protocol do IETF phát triển để trao đổi packet an toàn qua IP protocol. IPsec bắt buộc trong IPv6 theo IPv6 specification, tùy chọn trong IPv4, dù nhiều operating system cũng triển khai trong IPv4. IPsec dùng hai encryption mode: Transport và Tunnel.

IPVS—IP Virtual Server. Linux kernel load balancing infrastructure, hỗ trợ IPv4 và IPv6. Xem `http://www.linuxvirtualserver.org/software/ipvs.html`.

ISR—Interrupt Service Routine. Interrupt handler được gọi khi nhận interrupt.

ISM—Industrial, scientific, and medical radio band.

jumbo frames—Packet có size tối đa 9K. Một số network interface cho phép dùng MTU tối đa 9K. Dùng jumbo frame có thể cải thiện network performance trong một số trường hợp như bulk data transfer.

KVM—Kernel-based Virtual Machine. Dự án Linux virtualization.

LACP—Link Aggregation Control Protocol.

LAN—Local Area Network. Mạng kết nối một khu vực giới hạn như tòa nhà văn phòng.

LID—Local Identifier. Giá trị 16-bit do Subnet Manager gán cho mọi subnet port (InfiniBand).

L2CAP—Logical Link Control and Adaptation Protocol. Dùng trong Bluetooth.

L2TP—Layer 2 Tunneling Protocol dùng bởi VPN. L2TPv3 quy định trong RFC 3931 (RFC 5641 có một số cập nhật).

LKML—Linux Kernel Mailing List.

LLCP —Logical Link Control Protocol. Dùng bởi NFC.

LLN—Low-power and Lossy Network.

LoWPAN—Low-power Wireless Personal Area Network.

LMP—Link Management Protocol. Điều khiển radio link giữa hai Bluetooth device.

LPM—Longest Prefix Match. Algorithm dùng bởi routing subsystem.

LRH—Local Routing Header. InfiniBand header dài 8 byte. Nhận diện local source và destination port của packet. Cũng chỉ định QoS attribute yêu cầu (SL và VL) của message.

LRO—Large Receive Offload.

LR-WPAN—Low-Rate Wireless Personal Area Network. Dùng trong IEEE 802.15.4.

LSB—Least significant bit.

LSRR—Loose Source Record Route.

LTE—Long Term Evolution.

MAC—Media Access Control. Sublayer của Data Link Layer (L2) trong OSI model.

MAD—Management Datagram (InfiniBand). MFC—Multicast Forwarding Cache. Data structure trong kernel gồm multicast forwarding entry.

MIB—Management Information Base.

MLD—Multicast Listener Discovery protocol. Cho mỗi IPv6 router phát hiện sự hiện diện của multicast listener. MLD protocol quy định trong RFC 3810 năm 2004.

MLME—MAC Layer Management Entity. Thành phần trong IEEE 802.11 management layer chịu trách nhiệm thao tác như scanning, authentication, association và reassociation.

MR—Memory Region (InfiniBand).

MSF—Multicast Source Filtering. Tính năng đặt filter để drop multicast traffic từ source ngoài các source được kỳ vọng.

MSI—Message Signaled Interrupts.

MSS—Maximum Segment Size. Tham số TCP protocol.

MTU—Maximum transmission unit. Size packet lớn nhất network protocol có thể truyền.

MW—Memory Window (InfiniBand).

NAP—Network Access Point.

NAPI—New API. Kỹ thuật để network driver dùng polling thay vì interrupt-driven. NAPI trình bày trong Chương 1.

NAT—Network Address Translation. Layer chịu trách nhiệm sửa IP header. Trong Linux, hỗ trợ IPv6 NAT được merge trong kernel 3.7.

NAT-T—NAT traversal.

NCI—NFC Controller Interface.

ND / NDISC—Neighbour Discovery Protocol. Dùng trong IPv6. Tác vụ gồm: phát hiện network node trên cùng link, autoconfiguration địa chỉ, tìm Link Layer address của node khác và duy trì reachability information về node khác.

NFC—Near Field Communication.

NDEF—NFC Data Exchange Format.

NIC—Network Interface Card, còn gọi Network Interface Controller hoặc Network Adapter. Hardware network device.

NUMA—Non-Uniform Memory Access.

NPP—NDEF Push Protocol.

NPAR—NIC Partitioning. Công nghệ cho phép chia network card (NIC) traffic thành partition.

NUD—Network Unreachability Detection. Cơ chế chịu trách nhiệm xác định có đến được neighbour không.

OBEX—Object Exchange. Protocol trao đổi binary object giữa device, dùng trong Bluetooth.

OEM—Original Equipment Manufacturer.

OFA—OpenFabrics Alliance.

OCF—Open Cryptography Framework.

OHA—Open Handset Alliance.

OOTB—Out of the Blue packet (thuật ngữ SCTP protocol). Packet là OOTB nếu có cấu trúc đúng (tức không checksum error), nhưng receiver không nhận diện được SCTP association mà packet thuộc về (xem mục 8.4 trong RFC 4960).

OPP—Object Push Profile. Dùng bởi Bluetooth.

OSI Model—Open Systems Interconnection.

OSPF—Open Shortest Path First. Interior gateway routing protocol phát triển cho IP network.

PADI—PPPoE Active Discovery Initiation.

PADO—PPPoE Active Discovery Offer.

PADR—PPPoE Active Discovery Request.

PADS—PPPoE Active Discovery Session.

PADT—PPPoE Active Discovery Terminate.

PAN—Personal Area Networking. Profile dùng trong Bluetooth.

PCI—Peripheral Component Interconnect. Bus để gắn device. Nhiều network interface card là PCI device.

PD—Protection Domain.

PHDC—Personal Health Device Communication. Dùng bởi NFC.

PID—Process Identifier.

PIM—Protocol Independent Multicast Protocol. Multicast routing protocol.

PIM-SM—Protocol Independent Multicast—Sparse Mode.

PLME—Physical Layer Management Entity trong IEEE 802.11.

PM—Power Management.

PPP—Point To Point data link protocol. Protocol giao tiếp trực tiếp giữa hai host.

PPPoE—PPP over Ethernet. PPPoE protocol quy định trong RFC 2516 năm 1999.

PERR—Path Error. Message thông báo lỗi nào đó trong wireless Mesh network routing.

PREP—Path Reply. Unicast packet gửi trả lời PREQ message trong wireless Mesh network.

PREQ—Path Request. Broadcast packet gửi khi tìm địa chỉ nào đó trong wireless Mesh network.

PSK—Preshared Key. Qdisc—Queuing Disciplines.

QP—Queue Pair (InfinBand).

RA—Router Alert. Một IPv4 option. Thông báo transit router kiểm tra kỹ hơn nội dung IP packet. Dùng bởi nhiều protocol như IGMP, MLD, v.v.

RANN—Root Announcement. Broadcast packet do Root Mesh point gửi định kỳ trong wireless Mesh network.

RARP—Reverse Address Resolution Protocol. Protocol tìm ánh xạ từ link layer address (như Ethernet address 48-bit) sang network address (như IPv4 address).

RC—QP transport type trong InfiniBand.

RDMA—Remote Direct Memory Access. Truy cập memory trực tiếp từ host này sang host khác.

RDS—Reliable Datagram Socket. Connectionless protocol tin cậy do Oracle phát triển.

RFC—Request For Comments. Tài liệu quy định Internet specification, communication protocol, procedure và event. Quy trình chuẩn hóa RFC được ghi tại `http://tools.ietf.org/html/rfc2026`, “Quy trình tiêu chuẩn Internet.”

RFID—Radio Frequency ID.

RFCOMM—Radio Frequency Communications protocol. Dùng trong Bluetooth.

RFS—Receive Flow Steering.

RIP—Routing Information Protocol: Routing protocol distance-vector.

RoCE—RDMA over Converged Ethernet.

RP—Rendezvous Point.

RPL—IPv6 Routing Protocol for Low-Power and Lossy Networks. RPL protocol quy định trong RFC 6550.

RPDB—Routing Policy DataBase.

RPF—Reverse Path Filter. Kỹ thuật nhằm ngăn source address spoofing.

RPC—Remote Procedure Call.

RPS—Receive Packet Steering.

RS—Router Solicitations.

RSA—Cryptography algorithm. RSA viết tắt của Ron Rivest, Adi Shamir và Leonard Adleman, những người phát triển nó.

RTP—Real-time Transport Protocol. Protocol truyền audio và video qua IP network.

RTR—Ready To Receive. State trong InfiniBand QP State Machine.

RTS—Ready To Send. State trong InfiniBand QP State Machine.

SA—Security Association. Quan hệ logic giữa hai host gồm các tham số như cryptographic key, cryptographic algorithm, SPI, v.v.

SACK—Selective Acknowledgments. Xem RFC 2018, “TCP Selective Acknowledgment Option,” năm 1996.

SAD—Security Association Database.

SAR—Segmentation and Reassembly.

SBC—Session Border Controllers.

SCO—Synchronous Connection Oriented link. Một Bluetooth protocol.

SDP—Service Discovery Protocol. Dùng trong Bluetooth.

SCTP—Stream Control Transmission Protocol. Transport protocol có tính năng của cả UDP và TCP.

SE—Security Element (NFC).

SIG—Special Interest Group.

SIP—Session Initiation Protocol. Signaling protocol cho VoIP, nhằm tạo và sửa VoIP session.

SLAAC—Stateless Address autoconfiguration. Quy định trong RFC 4862.

SKB —Socket Buffer. Kernel data structure biểu diễn network packet (triển khai bằng structure `sk_buff`, `include/linux/skbuff.h`).

SL—Service Level. QoS trong InfiniBand triển khai bằng SL to VL mapping và resource cho mỗi VL.

SLAAC—Stateless Address Autoconfiguration.

SM—Subnet Manager.

SMA—Subnet Management Agent.

SME—System Management Entity trong IEEE 802.11.

SMP—Symmetrical Multiprocessing. Kiến trúc có từ hai processor giống nhau nối với một shared main memory duy nhất.

SNAT—Source NAT. NAT thay đổi source address.

SNEP—Simple NDEF Exchange Protocol (SNEP) để trao đổi dữ liệu NDEF-formatted.

SNMP—Simple Network Management Protocol.

SPI—Security Parameter Index. Dùng bởi IPsec.

SPD—Security Policy Database.

SQD—Send Queue Drained. State trong InfiniBand QP State Machine.

SQE—Send Queue Error. State trong InfiniBand QP State Machine.

SRP—SCSI RDMA protocol.

SR-IOV—Single Root I/O Virtualization. Specification cho phép PCIe device xuất hiện thành nhiều physical PCIe device riêng biệt.

SRQ—Shared Receive Queue (InfiniBand).

SSM—Source Specific Multicast.

STUN —Session Traversal Utilities for NAT.

SSP—Secure Simple Pairing. Security feature Bluetooth v2.1 yêu cầu. TCP—Transmission Control Protocol. TCP protocol là transport protocol thường dùng nhất trên Internet hiện nay. Nhiều protocol chạy trên TCP, gồm FTP, HTTP, v.v. TCP quy định trong RFC 793 năm 1981; qua các năm sau đó có nhiều protocol update, variation và bổ sung cho base TCP protocol.

TIPC—Transparent Inter-process Communication protocol. Xem `http://tipc.sourceforge.net/`.

TOS —Type Of Service.

TSO—TCP Segmentation Offload.

TTL—Time To Live. Counter trong IPv4 header (tương ứng trong IPv6 gọi Hop Limit), giảm tại mỗi forwarding device. Khi counter về 0, ICMP Time Exceeded được gửi trả và packet bị loại bỏ. Cả member `ttl` của IPv4 header và member `hop_limit` của IPv6 header đều là field 8-bit.

TURN—Traversal Using Relays around NAT.

UC—Unreliable Connected. QP transport type trong InfiniBand.

UD—Unreliable Datagram. QP transport type trong InfiniBand.

UDP—User Datagram Protocol. UDP là protocol không tin cậy vì không bảo đảm packet được giao cho upper layer protocol. UDP không có handshaking phase, khác TCP. UDP header đơn giản, chỉ gồm 4 field: source port, destination port, checksum và length.

USAGI—UniverSAl playGround for Ipv6. Dự án phát triển IPv6 và IPsec stack (cho cả IPv4 và IPv6) cho Linux kernel.

UTS—Unix Time-sharing System.

VCRC—Variant CRC. InfiniBand header dài 2 byte. Bao phủ mọi field của packet.

VETH—Virtual Ethernet. Network driver cho phép giao tiếp giữa hai network device trong các network namespace khác nhau.

VoIP—Voice Over IP.

VFS—Virtual File System.

VL—Virtual Lanes. Cơ chế tạo nhiều virtual link trên một physical link duy nhất.

VLAN—Virtual Local Area Network.

VPN—Virtual Private Network.

VXLAN—Virtual Extensible Local Area Network. VXLAN là standard protocol truyền Layer 2 Ethernet packet qua UDP. Cần VXLAN vì có trường hợp firewall chặn tunnel và chẳng hạn chỉ cho TCP/UDP traffic.

WDS—Wireless Distribution System.

WLAN—Wireless LAN.

WOL—Wake On LAN.

WSN—Wireless Sensor Networks.

XRC—eXtended Reliable Connected. QP transport type trong InfiniBand.

XFRM—IPsec Transformer. Linux kernel framework xử lý IPsec transformation. Hai data structure cơ bản nhất của XFRM framework là XFRM policy và XFRM state.
