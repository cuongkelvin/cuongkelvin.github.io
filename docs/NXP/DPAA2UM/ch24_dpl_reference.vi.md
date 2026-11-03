# Chương 24 Tham chiếu Data Path Layout (DPL)

Hệ thống không cần tạo và hủy DPAA2 object một cách động, và việc thiết kế hệ thống có thể đơn giản hơn nếu topology các DPAA2 object được khai báo tĩnh lúc boot. MC có khả năng đọc một cấu trúc dữ liệu nhị phân tên là Data Path Layout (DPL), mô tả tập object ban đầu được tạo khi hệ thống khởi tạo; nó chỉ được xử lý một lần khi MC khởi tạo.

DPL dựa trên một file nguồn dạng text có cú pháp tương tự file device tree source, và được biên dịch bằng DTC (Device Tree Compiler) thành một cấu trúc nhị phân (blob). Cấu trúc nhị phân này được chương trình boot của SoC (ví dụ U-Boot) nạp làm đầu vào cho MC. Mục đích của DPL không phải là mô tả thuộc tính phần cứng, mà là mô tả topology ban đầu và thuộc tính của các logical object mà MC cần tạo.

Mục này mô tả cú pháp DPL. Cú pháp file nguồn DPL là một ‘cây’ các node có tên và các property. Node chứa các property (cặp tên và giá trị), và có thể có thêm các node con.

## 24.1 Cấu trúc DPL ở mức cao

Cấu trúc DPL gồm ba node cấp cao nhất:

- “containers”—định nghĩa tập container ban đầu trong hệ thống, trong đó mỗi container đại diện cho một software context khác nhau cần DPAA2 object. Node này cũng cho biết cách gán ban đầu các DPAA2 object và tài nguyên cho các container khác nhau.
- “objects”—định nghĩa tập DPAA2 object ban đầu và thuộc tính của chúng.
- “connections”—định nghĩa kết nối giữa các DPAA2 network object; cho phép người dùng thiết lập topology mạng cần thiết.

Ngoài ra, DPL chứa phiên bản DPL trong property “dpl-version”, cho phép firmware MC nhận diện và phân tích các file DPL kiểu cũ. Trong revision này, phiên bản DPL là 10.

Ví dụ – cấu trúc DPL ở mức cao:

```
/dts-v1/;
/ {
          dpl-version = <10>;
          containers {
                    . . .
          };
          objects {
                    . . .
          };
          connections {
                    . . .
          };
};
```

Các section sau mô tả chi tiết hơn từng node cấp cao nhất.

## 24.2 Node: containers

Node “containers” chứa tập ICID pool ban đầu của MC, cùng tập container ban đầu với các tài nguyên và object DPAA2 được gán cho chúng; node “containers” không có property riêng.

### 24.2.1 Node con: dprc

Node “dprc” chỉ định một instance của Data Path Resource Container (DPRC), trong đó container ID được chỉ định trong tên node “dprc@\<id>”. Node “dprc” gồm ba phần: các property của container, và hai node con: “resources” và “objects”.

**Table 91. Các property của node “dprc”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| parent | R | “dprc@\<id>”, hoặc “none” | Phân cấp container được thiết lập bằng cách chỉ định container ID cha, hoặc dùng “none” nếu đây là container cấp gốc |
| icid | O | \<uint16_t><br>hoặc<br>“DPRC_GET_ICID_FROM_POOL” | Chọn một giá trị ICID cụ thể cho container con, hoặc dùng “DPRC_GET_ICID_FROM_POOL” (giá trị mặc định) để MC cấp phát ICID từ pool các giá trị ICID còn trống |
| portal_id | O | \<int><br>hoặc<br>“DPRC_GET_PORTAL_ID_FROM_POOL” | MC command portal chính cho container này, hoặc dùng “DPRC_GET_PORTAL_ID_FROM _POOL” (giá trị mặc định) để MC cấp phát portal ID từ pool các portal còn trống |
| options | O | Có thể chọn không hoặc nhiều option, phân cách bằng dấu phẩy, từ danh sách dưới đây. Nếu bỏ property này, không option nào được đặt. |   |
|   |   | “DPRC_CFG_OPT_SPAWN_ALLOWED” | Container được phép tạo các container con của riêng nó |
|   |   | “DPRC_CFG_OPT_ALLOC_ALLOWED” | Container được phép cấp phát tài nguyên từ container cha; nếu không đặt, container chỉ được dùng tài nguyên từ các pool của chính nó. Đây là chính sách toàn cục của container, nhưng container cha có thể ghi đè và đặt quota cụ thể cho từng loại tài nguyên. |
|   |   | “DPRC_CFG_OPT_TOPOLOGY_CHANGES_ALLOWED” | Software context gắn với container này được phép thực hiện các thay đổi topology, như connect hoặc disconnect các object |
|   |   | “DPRC_CFG_OPT_AIOP” | Container được gắn với AIOP |
|   |   | “DPRC_CFG_OPT_IRQ_CFG_ALLOWED” | Software context gắn với container này được phép đặt cấu hình IRQ cho các object |
| label | O | tối đa 16 ký tự | Label của container |

#### 24.2.1.1 Node con: resources

Node “resources” liệt kê việc gán tài nguyên cụ thể cho container. Node “resources” không có property riêng, và chỉ chứa các node con “res”.

##### 24.2.1.1.1 Node con: res

Node “res@\<n>” khai báo một lần gán tài nguyên cụ thể; có thể khai báo nhiều node “res” trong một node “resources”. Giá trị \<n> không có ý nghĩa.

**Table 92. Các property của node “res”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| type | R | Tên resource pool (chỉ chỉ định một từ danh sách dưới đây).<br>Lưu ý rằng các loại resource pool có thể khác nhau giữa các biến thể SoC. |   |
|   |   | “mcp” | Các MC portal |
|   |   | “swp” | Các QBMan SW portal |
|   |   | “bp” | Các QBMan buffer pool |
|   |   | “fq” | Các QBMan frame queue |
|   |   | “qpr” | Các QBMan queuing priority record |
|   |   | “qd” | Các QBMan queuing destination |
|   |   | “cg” | Các QBMan congestion group |
|   |   | “swpch” | Các QBMan software portal channel |
|   |   | “cqch” | Các QBMan class queue channel |
|   |   | “rplr” | Các QBMan replication list record |
|   |   | “ifp.wr0” | Các WRIOP interface profile |
|   |   | “kp.wr0.ctlue” | Các WRIOP CTLU egress key profile |
|   |   | “kp.wr0.ctlui” | Các WRIOP CTLU ingress key profile |
|   |   | “prp.wr0.ctlue” | Các WRIOP CTLU egress parser profile |
|   |   | “prp.wr0.ctlui” | Các WRIOP CTLU ingress parser profile |
|   |   | “plcy.wr0.ctlui” | Các WRIOP CTLU ingress policy table |
|   |   | “plcye.wr0.ctlui” | Các WRIOP CTLU ingress policy entry |
|   |   | “kp.aiop0.ctlu” | Các AIOP CTLU key profile |
|   |   | “kp.aiop0.mflu” | Các AIOP MFLU key profile |
|   |   | “prp.aiop0.ctlu” | Các AIOP CTLU parser profile |
|   |   | “prp.aiop0.mflu” | Các AIOP MFLU parser profile |
|   |   | “dcp.aiop.ch | Các AIOP channel của direct connected portal |
| num | R | \<uint32_t> | Số tài nguyên cần gán |
| options | O | Chỉ chọn một trong các option cấp phát tài nguyên dưới đây, hoặc không chọn (bỏ property này hoặc đặt bằng <0>). Lưu ý ảnh hưởng tới property ‘id_base_align’. |   |
|   |   | “DPRC_RES_REQ_OPT_EXPLICIT” | Cho biết các tài nguyên yêu cầu là tường minh và liên tiếp, với base ID như chỉ định bởi property ‘id_base_align’ |
|   |   | “DPRC_RES_REQ_OPT_ALIGNED” | Cho biết base ID của tài nguyên cần căn theo giá trị chỉ định bởi property ‘id_base_align’ |
| id_base_align | R | \<int> | Trong trường hợp gán tường minh, cho biết resource ID cơ sở (đầu tiên) cho việc cấp phát.<br>Trong trường hợp gán có căn chỉnh (và không tường minh), cho biết mức căn chỉnh yêu cầu cho (các) resource ID; đặt bằng <0> nếu không cần căn chỉnh đặc biệt. |

#### 24.2.1.2 Node con: objects

Node “objects” liệt kê việc gán object cụ thể cho container. Node “objects” không có property riêng, và chỉ chứa các node con “obj”.

##### 24.2.1.2.1 Node con: obj

Node “obj@\<n>” khai báo một lần gán object cụ thể; có thể khai báo nhiều node “obj” trong một node “objects”. Giá trị \<n> không có ý nghĩa.

**Table 93. Các property của node “obj”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| obj_name | R | “\<object>@\<id>”<br><br>Ví dụ: “dpni@3”, “dpsw@5” | Tên và ID của object |
| plugged | O | <0> hoặc <1> | Cho biết object có được coi là đã cắm (plugged) vào container hay không. Giá trị mặc định là <1>. Nếu bỏ property này, object được coi là đã cắm. |
| label | O | tối đa 16 ký tự | Label của object |

##### 24.2.1.2.2 Node con: obj_set

Node “obj_set@\<n>” khai báo một tập gán object cụ thể; có thể khai báo nhiều node “obj_set” trong một node “objects”. Giá trị \<n> không có ý nghĩa.

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| type | R | tối đa 16 ký tự<br><br>Ví dụ: “dpni”, “dpsw” | Loại object |
| ids | R | \<Mảng int> | Các ID yêu cầu cho các object trong tập |

Ví dụ – khai báo container cấp gốc DPRC-1, với ICID 11, hai option cấu hình, command portal chính 7, các command portal bổ sung 15-16, và một số DPAA2 object được gán cho DPRC: một tập bốn DPNI object (với ID: 1,2,5,30) và một DPBP object (với ID=1 và một label):

```
dprc@1 {
          parent = "none";
          icid = <11>;
          portal_id = <7>;
          options = "DPRC_CFG_OPT_SPAWN_ALLOWED", "DPRC_CFG_OPT_ALLOC_ALLOWED";
          resources {
                    res@1 {
                              type = "mcp";
                              num = <2>;
                              options = <1>;
                              id_base_align = <15>;
                    };
          };
          objects {
                    obj_set@1{
                              type = "dpni";
                              ids = <1 2 5 30>;
                    };
                    obj@1{
                              obj_name = "dpbp@1";
                              label = “my label”;
                    };
          };
};
```

## 24.3 Node: objects

Node “objects” cấp cao nhất, không nên nhầm với node con của node “dprc”, chứa tập object ban đầu được MC tạo trong lúc boot. Node “objects” không có property riêng, và chỉ chứa các node con chỉ định các thuộc tính object khác nhau. Các object trong mục này được gán cho bất kỳ container nào đã khai báo trước đó trong mục “containers”.

Các object khai báo trong DPL được tạo trong lúc MC khởi tạo, và KHÔNG cần tạo lại sau đó bằng các command CREATE. Các object này sẵn dùng cho các software context tương ứng bằng cách gửi command OPEN cho từng object.

### 24.3.1 Node con: dpni

**Table 94. Các property của node “dpni”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| options | O | Có thể chọn một hoặc nhiều option, phân cách bằng dấu phẩy, từ danh sách dưới đây. |   |
|   |   | "DPNI_OPT_TX_FRM_RELEASE" | Hãy tham khảo mô tả các |
|   |   | "DPNI_OPT_NO_MAC_FILTER" | field trong command DPNI_CREATE. |
|   |   | "DPNI_OPT_HAS_POLICING" |   |
|   |   | "DPNI_OPT_SHARED_CONGESTION" |   |
|   |   | "DPNI_OPT_HAS_KEY_MASKING" |   |
|   |   | "DPNI_OPT_NO_FS" |   |
|   |   | “DPNI_OPT_HAS_OPR” |   |
|   |   | “DPNI_OPT_OPR_PER_TC” |   |
|   |   | “DPNI_OPT_SINGLE_SENDER” |   |
|   |   | “DPNI_OPT_CUSTOM_CG” |   |
|   |   | “DPNI_OPT_CUSTOM_OPR” |   |
|   |   | “DPNI_OPT_SHARED_HASH_KEY” |   |
|   |   | “DPNI_OPT_SHARED_FS” |   |
|   |   | “DPNI_OPT_STASHING_DIS” |   |
| fs_entries | O | 0 – 1024 |   |
| vlan_filter_entries | O | 0 – 16 |   |
| mac_filter_entries | O | 0 – 64 |   |
| num_queues | O | 1 – 16 (LS2085, LS2088, LS1088) / 32 (LX2160) |   |
| num_tcs | O | 1 – 16 |   |
| qos_entries | O | 0 – 64 |   |
| num_rx_tcs | O | 0 – 8 |   |
| num_cgs | O | 0 - 128 |   |
| num_opr | O | 0 - 128 |   |
| dist_key_size | O | 1 - 56 |   |
| num_channels | O | 1 - 16 |   |

Ví dụ – khai báo DPNI-1 object với bộ lọc địa chỉ MAC (16 mục), bộ lọc VLAN (16 mục), và hỗ trợ QoS cho 3 traffic class và 32 mục trong bảng QoS.

```
dpni@1{
          options = “”;
          mac_filter_entries = <16>;
          vlan_filter_entries = <16>;
          num_tcs = <3>;
          qos_entries = <32>;
};
```

### 24.3.2 Node con: dpio

Node “dpio” chỉ định một instance của Data Path I/O (DPIO) object, trong đó DPIO ID được chỉ định trong tên node “dpio@\<id>”.

**Table 95. Các property của node “dpio”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| channel_mode | R | Chỉ chọn một trong các option từ danh sách dưới đây |   |
|   |   | “DPIO_NO_CHANNEL” | Không có notification channel |
|   |   | “DPIO_LOCAL_CHANNEL” | Các notification gắn với DPIO này sẽ được nhận ở channel riêng của DPIO |
| num_priorities | O | \<uint8_t> | Số priority (1-8); chỉ có ý nghĩa nếu chọn “DPIO_LOCAL_CHANNEL”. Giá trị mặc định là 2. |

Ví dụ – khai báo DPIO-3 object với channel notification cục bộ và 8 priority class cho notification:

```
dpio@3{
          channel_mode = "DPIO_LOCAL_CHANNEL";
          num_priorities = <8>;
};
```

### 24.3.3 Node con: dpbp

Node “dpbp” chỉ định một instance của Data Path Buffer Pool (DPBP) object, trong đó DPBP ID được chỉ định trong tên node “dpbp@\<id>”.

**Table 96. Các property của node “dpbp”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| N/A |   |   |   |

Ví dụ – khai báo DPBP-5 object (không cần property nào khác):

```
dpbp@5{
};
```

### 24.3.4 Node con: dpcon

Node “dpcon” chỉ định một instance của Data Path Concentrator (DPCON) object, trong đó DPCON ID được chỉ định trong tên node “dpcon@\<id>”.

**Table 97. Các property của node “dpcon”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| num_priorities | R | \<uint8_t> | Số priority (1-8) cho việc lập lịch |

Ví dụ – khai báo DPCON-1 object với 4 priority class cho việc lập lịch.

```
dpcon@1{
          num_priorities = <4>;
};
```

### 24.3.5 Node con: dpci

Node "dpci” chỉ định một instance của Data Path Communication Interface (DPCI) object, trong đó DPCI ID được chỉ định trong tên node “dpci@\<id>”.

**Table 98. Các property của node “dpci”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| num_of_priorities | R | \<uint8_t> | Số receive priority (queue) cho DPCI; khoảng hợp lệ là 1-2. |

Ví dụ – khai báo DPCI-1 object với 2 receive priority.

```
dpci@1{
          num_of_priorities = <2>;
};
```

### 24.3.6 Node con: dpseci

Node ”dpseci” chỉ định một instance của Data Path SEC Interface (DPSECI) object, trong đó DPSECI ID được chỉ định trong tên node ”dpseci@\<id>”.

**Table 99. Các property của node “dpseci”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| priorities | R | < 1 đến 8 giá trị uint8_t phân cách bằng dấu cách> | Các priority cho việc xử lý của phần cứng SEC; priority hợp lệ được cấu hình bằng giá trị 1-8; nếu chỉ cần một priority, đặt priority thứ hai bằng 0. |
| num_tx_queues | O | \<uint8_t> | Số queue hướng tới SEC |
| num_rx_queues | O | \<uint8_t> | Số queue trả về từ SEC |

Ví dụ – khai báo DPSECI-1 object với 2 priority cho xử lý phần cứng.

```
dpseci@1{
          priorities = <2 5 1 2 3 4 3 1>;
};
```

### 24.3.7 Node con: dpdmux

Node “dpdmux” chỉ định một instance của Data Path DeMux (DPDMUX) object, trong đó DPDMUX ID được chỉ định trong tên node “dpdmux@\<id>”.

**Table 100. Các property của node “dpdmux”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| method | R | Định nghĩa phương thức của bảng địa chỉ DPDMUX. |   |
|   |   | “DPDMUX_METHOD_C_VLAN_MAC” | DeMux dựa trên C-VLAN và địa chỉ MAC |
|   |   | “DPDMUX_METHOD_MAC” | DeMux dựa trên địa chỉ MAC |
|   |   | “DPDMUX_METHOD_C_VLAN” | DeMux dựa trên C-VLAN |
|   |   | “DPDMUX_METHOD_S_VLAN” | DeMux dựa trên S-VLAN |
| manip | O | Thao tác biến đổi yêu cầu. Mặc định là “DPDMUX_MANIP_NONE” |   |
|   |   | “DPDMUX_MANIP_NONE” | Không biến đổi frame |
|   |   | “DPDMUX_MANIP_ADD_REMOVE_S_VLAN” | Thêm S-VLAN ở egress, gỡ nó ở ingress |
| num_ifs | R | \<uint16_t> | Số interface (không tính uplink interface) |
| default_if | O | \<uint16_t> | Interface ID của interface mặc định mong muốn. |
| options | O | Các option cấu hình DPDMUX; có thể chọn một hoặc nhiều option, phân cách bằng dấu phẩy, từ danh sách dưới đây. |   |
|   |   | “DPDMUX_OPT_BRIDGE_EN” | Bật bridging giữa các internal interface; chỉ được phép nếu “method” được chọn là “DPDMUX_METHOD_C_VLAN_MAC” hoặc “DPDMUX_METHOD_MAC” |
|   |   | “DPDMUX_OPT_AUTO_MAX_FRAME_LEN” | Khi flag này được đặt, độ dài frame tối đa của DPDMUX được tự động cập nhật bởi DPNI object được kết nối. |
|   |   | “DPDMUX_OPT_CLS_MASK_SUPPORT” | Điều khiển việc có hỗ trợ masking cho các rule phân loại tùy chỉnh hay không.<br>0 - không có masking, việc tra cứu luôn là khớp chính xác và look-up key gắn với frame phải khớp hoàn toàn với key trong bảng phân loại 1 - Có masking, look-up key gắn với frame chỉ cần khớp phần key của bảng tra cứu không bị mask. |
| max_dmat_entries | O | \<uint16_t> | Số mục tối đa trong bảng địa chỉ DPDMUX; 0 nghĩa là mặc định: 64 mục cho mỗi interface |
| max_mc_groups | O | \<uint16_t> | Số multicast group trong bảng DPDMUX; 0 nghĩa là mặc định: 32 multicast group |
| max_vlan_ids | O | \<uint16_t> | Số VLAN id tối đa cho phép trong hệ thống - chỉ có ý nghĩa khi làm việc với phương thức mac+vlan.<br>0 nghĩa là mặc định: 16 VLAN id |
| mem_size | O | \<uint16_t> | Số buffer 256byte được cấp cho buffer pool của DPDMUX. Nếu là 0, dùng giá trị mặc định (1024). |

Ví dụ – khai báo DPDMUX-1 object với 4 internal interface, không biến đổi, và demux dựa trên MAC và VLAN:

```
dpdmux@1{
          method = “DPDMUX_METHOD_C_VLAN_MAC”;
          manip = “DPDMUX_MANIP_NONE”;
          num_ifs = <4>;
};
```

### 24.3.8 Node con: dpsw

Node “dpsw” chỉ định một instance của Data Path Switch (DPSW) object, trong đó DPSW ID được chỉ định trong tên node “dpsw@\<id>”.

**Table 101. Các property của node “dpsw”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| num_ifs | R | \<uint16_t> | Số interface của switch |
| options | O | Bật/ tắt các tính năng của DPSW |   |
|   |   | “DPSW_OPT_FLOODING_DIS” | Tắt flooding |
|   |   | "DPSW_OPT_CTRL_IF_DIS" | Tắt control interface |
|   |   | "DPSW_OPT_FLOODING_METERING_DIS" | Tắt flooding metering |
|   |   | “DPSW_OPT_MULTICAST_DIS” | Tắt hỗ trợ Multicast |
|   |   | "DPSW_OPT_METERING_EN" | Bật metering |
|   |   | “DPSW_OPT_BP_PER_IF” | Buffer pool riêng cho mỗi interface. |
|   |   | "DPSW_OPT_LAG_DIS" | Dùng để tắt LAG. |
| max_vlans | O | \<uint16_t> | Số VLAN tối đa; 0 nghĩa là mặc định: 16 VLAN |
| max_fdbs | O | \<uint16_t> | Số FDB tối đa; 0 nghĩa là mặc định: 16 FDB |
| max_fdb_entries | O | \<uint16_t> | Số mục FDB cho bảng FDB mặc định; 0 nghĩa là mặc định: 1024 mục |
| fdb_aging_time | O | \<uint16_t> | Thời gian aging FDB mặc định cho bảng FDB mặc định; 0 nghĩa là mặc định: 300 giây |
| max_fdb_mc_groups | O | \<uint16_t> | Số multicast group trong mỗi bảng FDB; 0 nghĩa là mặc định: 32 multicast group |
| max_meters_per_if | O | \<uint8_t> | Số meter cho mỗi interface |
| mem_size | O | \<uint16_t> | Biểu thị số buffer 256 byte được cấp phát cho buffer pool của DPSW, hoặc cho mọi buffer pool nếu dùng option DPSW_OPT_BP_PER_IF. Nếu bằng 0, dùng giá trị mặc định, phụ thuộc vào số interface. |

Ví dụ – khai báo DPSW-1 object với 8 interface.

```
dpsw@1{
          num_ifs = <8>;
};
```

### 24.3.9 Node con: dpmac

Node "dpmac" chỉ định một instance của Data Path MAC (DPMAC) object, trong đó DPMAC ID được chỉ định trong tên node "dpmac@\<id>".

**Table 102. Các property của node "dpmac"**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| N/A |   |   |   |

Ví dụ — khai báo DPMAC-1.

```
          dpmac@1{
};
```

### 24.3.10 Node con: dpdcei

Node "dpdcei" chỉ định một instance của Data Path Data Compression Interface (DPDCEI) object, trong đó DPDCEI ID được chỉ định trong tên node "dpdcei@\<id>".

**Table 103. Các property của node "dpdcei"**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| engine | R | Khối DCE engine |   |
|   |   | DPDCEI_ENGINE_COMPRESSION | Engine nén |
|   |   | DPDCEI_ENGINE_DECOMPRESSION | Engine giải nén |
| priority | R | \<int> | Priority cho việc xử lý của phần cứng DCE (giá trị hợp lệ 1-8). |

Ví dụ — khai báo DPDCEI-1.

```
dpdcei@1{
```

engine = "DPDCEI_ENGINE_COMPRESSION";

```
          tx_priority = <1>;
};
```

### 24.3.11 Node con: dpdmai

Node "dpdmai" chỉ định một instance của Data Path DMA Interface (DPDMAI) object, trong đó DPDMAI ID được chỉ định trong tên node "dpmai@\<id>" *(ghi chú: đúng là dpdmai@\<id>)*.

**Table 104. Các property của node "dpdmai"**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| priorities | R | < 1 hoặc 2 giá trị uint8_t phân cách bằng dấu cách> | Các priority cho việc xử lý của phần cứng DMA; priority hợp lệ được cấu hình bằng giá trị 1-8; mục ngay sau mục hợp lệ cuối cùng cần đặt bằng 0. |

Ví dụ — khai báo DPDMAI-1.

```
dpdmai@1{
          priorities = <2 5>;
};
```

### 24.3.12 Node con: dpmcp

Node "dpmcp" chỉ định một instance của Data Path MC Portal (DPMCP) object, trong đó DPMCP ID được chỉ định trong tên node "dpmcp@\<id>".

**Table 105. Các property của node "dpmcp"**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| options | O | Các option cấu hình DPMCP; có thể chọn một hoặc nhiều option, phân cách bằng dấu phẩy, từ danh sách dưới đây. | Hãy tham khảo mô tả các field trong command DPMCP_CREATE. |
|   |   | “DPMCP_OPT_HIGH_PRIO_CMD_DIS” |   |

Ví dụ — khai báo DPMCP-1.

```
dpmcp@1{
};
```

### 24.3.13 Node con: dpaiop

Node "dpaiop" chỉ định một instance của Data Path AIOP (DPAIOP) object, trong đó DPAIOP ID được chỉ định trong tên node "dpaiop@\<id>".

**Table 106. Các property của node "dpaiop"**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| aiop_container_id | R | \<int> | ID container của AIOP |

Ví dụ — khai báo DPAIOP-1.

```
          dpaiop@1{
                    aiop_container_id = <1>;
};
```

### 24.3.14 Node con: dprtc

Node "dprtc" chỉ định một instance của Data Path Real Time Clock (DPRTC) object, trong đó DPRTC ID được chỉ định trong tên node "dprtc@\<id>". Chỉ nên định nghĩa một DPRTC object trong file DPL vì chỉ có một clock phần cứng.

Ví dụ — khai báo DPRTC-0.

```
dprtc@0{
};
```

## 24.4 Node: connections

Node “connections” chỉ định topology object ban đầu. Node “connections” không có property riêng, và chỉ chứa các node con chỉ định các kết nối cần thiết.

### 24.4.1 Node con: connection

Node “connection@\<n>” khai báo một kết nối giữa hai object; có thể khai báo nhiều node “connection” trong một node “connections”. Giá trị \<n> không có ý nghĩa. Kết nối hoàn toàn đối xứng về bản chất, do đó các property “endpoint1” và “endpoint2” dưới đây có thể hoán đổi – object nào được liệt kê là “endpoint1” và object nào là “endpoint2” không có ý nghĩa gì.

**Table 107. Các property của node “connection”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| endpoint1 | R | “\<object>@\<id>” hoặc “\<object>@\<id>/if@\<if_id>” | Tên và ID của object cần kết nối với object endpoint2; với các object có nhiều interface (như DPSW), phải chỉ định cả interface ID |
| endpoint2 | R | Ví dụ: “dpni@3”, “dpsw@5/if@1” | Tên và ID của object đối tác cần kết nối với object thứ nhất; với các object có nhiều interface (như DPSW), phải chỉ định cả interface ID |
| committed_rate | O | \<uint32_t> | Tốc độ cam kết (Mbits/s) |
| max_rate | O | \<uint32_t> | Tốc độ tối đa (Mbits/s) |

Ví dụ – thiết lập một kết nối giữa DPNI-1 và DPMAC-2, và một kết nối khác giữa DPMAC-3 và interface #1 của DPSW-1:

```
connections {
          connection@1{
                    endpoint1 = "dpni@1";
                    endpoint2 = "dpmac@2";
          };
          connection@2{
                    endpoint1 = "dpsw@1/if@1";
                    endpoint2 = "dpmac@3";
          };
};
```
