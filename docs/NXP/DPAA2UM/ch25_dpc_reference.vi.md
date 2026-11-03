# Chương 25 Tham chiếu Data Path Configuration (DPC)

MC có khả năng đọc một cấu trúc dữ liệu nhị phân tên là Data Path Configuration (DPC), mô tả cấu hình board ban đầu khi hệ thống khởi tạo; nó chỉ được xử lý một lần trước khi MC khởi tạo.

DPC dựa trên một file nguồn dạng text có cú pháp tương tự file device tree source, và được biên dịch bằng DTC (Device Tree Compiler) thành một cấu trúc nhị phân (blob). Cấu trúc nhị phân này được chương trình boot của SoC (ví dụ U-Boot) nạp làm đầu vào cho MC. Mục đích của DPC là cung cấp cho MC thông tin về các ràng buộc cấu hình DPAA của hệ thống hoặc board hiện tại.

Mục này mô tả cú pháp DPC. Cú pháp file nguồn DPC là một ‘cây’ các node có tên và các property. Node chứa các property (cặp tên và giá trị), và có thể có thêm các node con.

## 25.1 Cấu trúc DPC ở mức cao

Cấu trúc DPC gồm các node cấp cao nhất sau:

- “mc_general”—chứa cấu hình chung cho firmware MC, như các option logging.
- “resources”—chứa tập tài nguyên hệ thống ban đầu cho MC.
- “controllers”—có thể dùng để ghi đè cấu hình mặc định của các DPAA controller.
- “board_info”—chứa các ràng buộc phần cứng khác nhau của board.
- “memory”—cung cấp thêm thông tin cho MC về các bộ nhớ hiện có, ví dụ DP-DDR.

Ví dụ – cấu trúc DPC ở mức cao:

```
/dts-v1/;
/ {
          mc_general {
                    . . .
          };
          resources {
                    . . .
          };
          controllers {
                    . . .
          };
          board_info {
                    . . .
          };
          memory {
                    . . .
          };
};
```

Các section sau mô tả chi tiết hơn từng node cấp cao nhất.

## 25.2 Node: mc_general

Node “mc_general” chứa cấu hình chung cho firmware MC, như các option logging cho log trong DDR (node con: log) và log trên UART console (node con: console).

### 25.2.1 Node con: log

Node “log” chỉ định cấu hình của log được lưu đệm trong DDR.

**Table 108. Các property của node “log”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| mode | O | “LOG_MODE_ON” | đặt chế độ log ON hoặc OFF. |
|   |   | “LOG_MODE_OFF” | mặc định là “LOG_MODE_ON” |
| level | O | “LOG_LEVEL_GLOBAL” | đặt mức log yêu cầu |
|   |   | “LOG_LEVEL_DEBUG” |   |
|   |   | “LOG_LEVEL_INFO” |   |
|   |   | “LOG_LEVEL_WARNING” |   |
|   |   | “LOG_LEVEL_ERROR” |   |
|   |   | “LOG_LEVEL_CRITICAL” |   |
|   |   | “LOG_LEVEL_ASSERT” |   |
| level-\<module> | O | “LOG_LEVEL_GLOBAL” | đặt mức log yêu cầu cho |
|   |   | “LOG_LEVEL_DEBUG” | \<module> (xem ví dụ dưới đây) |
|   |   | “LOG_LEVEL_INFO” |   |
|   |   | “LOG_LEVEL_WARNING” |   |
|   |   | “LOG_LEVEL_ERROR” |   |
|   |   | “LOG_LEVEL_CRITICAL” |   |
| timestamp | O | “LOG_TIMESTAMP_ON” | bật đóng dấu thời gian cho mọi |
|   |   | “LOG_TIMESTAMP_OFF” | command gửi tới MC (xem ví dụ dưới đây) Note |

Note: Việc đóng dấu thời gian chỉ được bật nếu mode = “LOG_MODE_ON” và level = “LOG_LEVEL_INFO” hoặc mức thấp hơn. Giá trị hiển thị tính bằng microsecond. Mặc định, đóng dấu thời gian là OFF.

Ví dụ – khai báo chế độ log ON với mức log ‘debug’:

```
log {
          mode = “LOG_MODE_ON”;
          level = “LOG_LEVEL_DEBUG”;
};
```

Ví dụ – như ví dụ trước, nhưng đặt mức riêng cho DPNI và DPMAC:

```
log {
          mode = “LOG_MODE_ON”;
          level = “LOG_LEVEL_DEBUG”;
          level-DPNI = "LOG_LEVEL_ERROR"
          level-DPMAC = "LOG_LEVEL_INFO"
};
```

Ví dụ – bật đóng dấu thời gian với mức log ‘info’:

```
log {
          mode = “LOG_MODE_ON”;
          level = “LOG_LEVEL_INFO”;
          timestamp = "LOG_TIMESTAMP_ON";
};
```

### 25.2.2 Node con: console

Node “console” chỉ định cấu hình của log trên UART console.

Nếu CONSOLE_MODE_ON, mọi command đều mất nhiều thời gian hơn để thực thi!

Mức log và mức log theo module giống với các giá trị đặt trong node con: log.

**Table 109. Các property của node “console”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| mode | O | “CONSOLE_MODE_ON” | đặt chế độ log console ON hoặc OFF. |
|   |   | “CONSOLE_MODE_OFF” | mặc định là “LOG_MODE_OFF” |
| uart_id | O | 1 - 4 | đặt UART ID mong muốn |

Ví dụ – khai báo chế độ console ON trên UART ID 2:

```
console {
          mode = “CONSOLE_MODE_ON”;
          uart_id = <2>;
};
```

## 25.3 Node: resources

Node “resources” chứa tập tài nguyên hệ thống ban đầu cho MC.

### 25.3.1 Node con: icid_pools

Node “icid_pools” chỉ định tập ICID pool ban đầu cho MC. MC dùng các ICID pool để gán giá trị ICID cho container mới được tạo. Có thể khai báo nhiều node “icid_pool”. Mỗi “icid_pool” được định nghĩa bằng một node con như sau:

#### 25.3.1.1 Node con: icid_pool

Với mỗi “icid_pool”, tên node là “icid_pool@\<id>”.

**Table 110. Các property của node “icid_pool”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| base_icid | R | \<uint32_t> | Giá trị đầu tiên trong dải ICID |
| num | R | \<int> | Số ICID liên tiếp trong pool |

Ví dụ – khai báo hai icid pool:

```
icid_pools {
          icid_pool@1 {
                    base_icid = <0>;
                    num = <10>;
          };
          icid_pool@2 {
                    base_icid = <30>;
                    num = <100>;
          };
};
```

## 25.4 Node: controllers

Node “controllers” có thể dùng để ghi đè cấu hình mặc định của các DPAA controller.

### 25.4.1 Node con: qbman

Node “qbman” có thể dùng để ghi đè một số mục được chọn trong cấu hình mặc định của QBMan controller.

**Table 111. Các property của node “qbman”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| total_bman_buffers | O | \<uint32_t> | Chỉ định tổng số buffer mà BMan cần quản lý.<br>Mặc định là 900K buffer.<br>Tham số này ảnh hưởng tới kích thước bộ nhớ tối thiểu MC cần để hoạt động đúng (xem Table 3-1 để biết chi tiết).<br>Giá trị tối đa được chấp nhận là 0x9EB100 (10400000 ở hệ thập phân) |
| wq_ch_conversion | O | \<uint16_t> | Chỉ định số WQ channel cần chuyển từ chế độ 8-WQ (với 8 priority) sang chế độ 2-WQ (với 2 priority). Một channel 8-WQ sẽ được chuyển thành bốn channel 2-WQ. Mặc định là 0. |
| pfdr_peb_size_kb | O | \<uint32_t> | Cấu hình kích thước mà các mục PFDR (Packet Frame Descriptor Record) chiếm trong PEB.<br>Giá trị hỗ trợ: 128, 256, 512, 1024 |
| oree_mode | O | OREE_MODE_ON/ OREE_MODE_OFF | Dùng để bật truy cập bộ nhớ ngoài cho Order Restoration. Nó sẽ tăng số packet có thể duy trì thứ tự từ 512 lên 2048. |

Ví dụ – khai báo QBMAN:

```
qbman {
          total_bman_buffers = <1000000>;
          wq_ch_conversion = <8>;
          pfdr_peb_size_kb = <128>;
          oree_mode = OREE_MODE_ON;
};
```

## 25.5 Node: board_info

Node “board_info” chứa các ràng buộc phần cứng khác nhau của board.

### 25.5.1 Node con: ports

Node “ports” chỉ định cấu hình riêng theo board của các port phần cứng.

#### 25.5.1.1 Node con: mac

Để biết thêm về các giao thức ethernet được hỗ trợ trên mỗi MAC, xem 2.1.1.2, “Data Path MAC (DPMAC).

Với mỗi MAC, tên node là “mac@\<id>”.

**Table 112. Các property của node “mac”**

| Property | Bắt buộc/ Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| link_type | O | Các loại link của MAC.<br>Các option này chọn nguồn mà firmware MC dùng để báo trạng thái link cho DPMAC interface này. Nếu không chỉ định property này, giá trị mặc định là "MAC_LINK_TYPE_FIXED". Các DPAA2 object nối với DPMAC này, như DPNI, thấy một trạng thái link đã được trừu tượng hóa do MC truyền đạt qua API DPNI_GET_LINK_STATE, và không biết về các nguồn khác nhau mà MC dùng để lấy thông tin link. |   |
|   |   | “MAC_LINK_TYPE_NONE” | DPMAC interface này bị MC tắt |
|   |   | “MAC_LINK_TYPE_FIXED” | Thông tin trạng thái link của DPMAC này được firmware MC lấy bằng cách định kỳ poll PCS trên MDIO bus nội của interface. Với các interface không đi qua khối SerDes (RGMII), link luôn được báo là up. Tốc độ link được báo là tốc độ tối đa mà interface hỗ trợ. PCS auto-negotiation được bật mặc định và có thể điều khiển qua property "pcs_autoneg". Ở chế độ này, firmware MC có quyền sở hữu độc quyền cả MDIO bus nội lẫn việc báo trạng thái link. |
|   |   | “MAC_LINK_TYPE_PHY” | Thông tin trạng thái link của DPMAC này được lấy từ bên ngoài firmware MC, và được truyền tới MC qua API DPMAC_SET_LINK_STATE. Ở chế độ này, firmware MC không truy cập MDIO bus nội của interface. Ví dụ, một hệ điều hành chạy trên GPP có thể lấy trạng thái link từ PCS trên MDIO bus nội, hoặc từ một PHY nối với MDIO bus ngoài, rồi truyền thông tin cho MC. |
|   |   | “MAC_LINK_TYPE_RECYC LE” | Khi dùng loại này cho MAC, port vật lý gắn với nó sẽ được dùng làm recycle port. |
|   |   | "MAC_LINK_TYPE_BACKP LANE" | MAC được chỉ định được dùng trong cấu hình Backplane với một trong các giao thức KR sau: 10GBase-KR, 25GBase-KR, 40GBase-KR.<br>Về cơ bản, dùng loại link này sẽ bỏ qua cấu hình serdes trong firmware MC cho lane này và để Backplane kernel driver áp dụng cấu hình serdes đúng theo link KR mong muốn. |
| port_mac_address | O | <uint8_t uint8_t uint8_t uint8_t uint8_t uint8_t> | Địa chỉ MAC dùng trên port vật lý này |
| pcs_autoneg | O | on/off | Chỉ có cho SGMII.<br>Khi bật, port có thể tự đàm phán tốc độ. |
| fec_mode | O | Chế độ fec của DPMAC<br>mặc định là “rs” | Chỉ cấu hình được cho các interface 25G |
|   |   | “none” | RS-FEC (bật mặc định) bị tắt |
|   |   | “rs” | Cấu hình chế độ RS-FEC (Clause 91) |
|   |   | “fc” | Cấu hình chế độ FC-FEC (Clause 74) (chưa được hỗ trợ) |
| enet_if | O | “MAC_ENET_IF_1000BASE X” | Cấu hình port ở chế độ 1000BASE-X. |
|   |   | “XFI” | Ethernet 10GBase-R |
|   |   | “USXGMII” | Ethernet 10G USXGMII |
|   |   | “CAUI” | Hoạt động 25GBase-R |
|   |   | “SGMII” | Cấu hình interface ở chế độ Serial Gigabit MII, hỗ trợ tốc độ tới 1G (kết quả auto-negotiation) và 2.5G. |
| serdes_cfg | O | “default” | Đây là cấu hình mặc định. |
|   |   | “sfi” | Có thể dùng với các interface XFI và XLAUI4 từ SerDes tương thích SFI, hiện có trên SoC LX2. Đây là chế độ hoạt động mặc định của các interface XFI, còn các interface XLAUI4 mặc định chạy với biên độ đầy đủ và không de-emphasis.<br>Mode này sẽ áp các thiết lập equalization để đưa giao diện điện vào trong đặc tả SFI. |
|   |   | “custom” | Cho phép người dùng cấu hình thủ công loại equalization, amplitude, và các thiết lập preq và post1q.<br>Có thể dùng với mọi interface trừ RGMII. |
| Với chế độ serdes_cfg “custom”, có các thiết lập sau. Nếu một hoặc nhiều tham số dưới đây không được chỉ định, sẽ dùng giá trị mặc định của giao thức SerDes. |   |   |   |
| serdes_eq | O | \<uint8_t> | Số mức equalization TX |
| serdes_amp | O | \<uint8_t> | Giảm biên độ truyền tổng thể |
| serdes_preq | O | \<uint8_t> | Cường độ drive của bit chuyển trạng thái TX full swing tới precursor |
| serdes_post1q | O | \<uint8_t> | Cường độ drive của bit chuyển mức full swing sang post-cursor thứ nhất |
| max_rate | O | Tham số max_rate cho một node MAC<br>Tham số này chỉ định max_rate sẽ đạt được khi dùng port này. Nếu cung cấp giá trị này, firmware MC sẽ cấp phát tài nguyên để hỗ trợ tốc độ lấy từ file DPC. Nếu không cung cấp, MC sẽ cấp phát tài nguyên cho port tương ứng để hỗ trợ tốc độ tối đa có thể. Option này dùng để quản lý việc dùng tài nguyên nội bộ (như FIFO nội) khi ứng dụng không định dùng hết băng thông của port.<br>Ví dụ: nếu port hỗ trợ 100G nhưng ứng dụng chỉ cần 50G, người thiết kế sẽ chỉ định điều này trong tham số max_rate. MC sẽ cấp phát cho port này tài nguyên cần cho 50G thay vì cấp phát tài nguyên để hỗ trợ 100G. |   |
|   |   | “1G” | Tốc độ tối đa 1G. |
|   |   | “2.5G” | Tốc độ tối đa 2.5G. |
|   |   | “5G” | Tốc độ tối đa 5G. |
|   |   | “10G” | Tốc độ tối đa 10G. |
|   |   | “20G” | Tốc độ tối đa 20G. |
|   |   | “25G” | Tốc độ tối đa 25G. |
|   |   | “40G” | Tốc độ tối đa 40G. |
|   |   | “50G” | Tốc độ tối đa 50G. |
|   |   | “100G” | Tốc độ tối đa 100G. |
| ceetm_instance | O | 0, 1 | Cấu hình instance CEETM dùng để thực hiện kết nối với port này. Cần thiết để cân bằng việc cấp phát tài nguyên QBMAN khi ứng dụng dùng các dpni object có nhiều hơn một channel. |

Ví dụ 1– khai báo hai mac, mac-1 là fixed link và mac-3 dùng PHY ngoài:

```
ports {
          mac@1 {
```

link_type = “MAC_LINK_TYPE_FIXED”;

```
};
mac@3 {
```

link_type = “MAC_LINK_TYPE_PHY”;

```
          port_mac_address = <0x00 0x04 0x9F 0x01 0x03 0x94>;
};
mac@5 {
```

link_type = “MAC_LINK_TYPE_NONE”;

```
          port_mac_address = <0x00 0x04 0x9F 0x01 0x03 0x94>;
          fec_mode = “none”;
};
mac@6 {
```

link_type = “MAC_LINK_TYPE_NONE”;

```
                              port_mac_address = <0x00 0x04 0x9F 0x01 0x03 0x94>;
                              fec_mode = “none”;
                              enet_if = “USXGMII”
                    };
};
```

Ví dụ 2 - khai báo hai mac, mac-3 là XFI trên LX2 dùng cấu hình serdes “sfi” và mac-4 là USXGMII dùng cấu hình serdes “custom”. Đồng thời đặt max_rate của mac-4 là 5G.

```
ports {
          mac@3 {
```

link_type = “MAC_LINK_TYPE_PHY”;

```
          port_mac_address = <0x00 0x04 0x9F 0x01 0x03 0x94>;
          serdes_cfg = “sfi”;
};
mac@4 {
```

link_type = “MAC_LINK_TYPE_PHY”;

```
                              port_mac_address = <0x00 0x04 0x9F 0x01 0x03 0x94>;
                              enet_if = “USXGMII”;
                              serdes_cfg = “custom”;
                              serdes_eq = <1>;
                              serdes_amp = <0>;
                              serdes_preq = <0>;
                              serdes_post1q = <0>;
                              max_rate = <5000>;
                    };
};
```

### 25.5.2 Node con: recycle_ports

Node “recycle_ports” cho phép giảm lượng FIFO tiêu thụ cho các recycle port bằng cách giảm tốc độ của chúng và không vượt quá tổng kích thước FIFO có sẵn. Kích thước FIFO phụ thuộc thiết bị. Không phải lúc nào cũng bắt buộc chỉ định cả hai trong file DTC.

Mặc định, firmware MC cấu hình 2 x RECYCLE port và cấp phát FIFO cho mỗi port theo cả hướng ingress và egress. Mỗi RECYCLE được định mức như một port 50G, nghĩa là số FIFO được cấp phát bằng số FIFO dành cho một port 50G (trên mỗi hướng).

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| max_rate | O | Việc phân bổ FIFO dựa trên tốc độ port vật lý. |   |
|   |   | “1G” | 0x02F |
|   |   | “2.5G” | 0x02F |
|   |   | “5G” | 0x033 |
|   |   | “10G” | 0x037 |
|   |   | “20G” | 0x03F |
|   |   | “25G” | 0x03F |
|   |   | “40G” | 0x07F |
|   |   | “50G” | 0x07F |
|   |   | “100G” | 0x0FF |

```
          recycle_ports {
                    recycle@2 {
                              max_rate = “10G”;
                    };
                    recycle@1 {
                              max_rate = “10G”;
                    };
};
```

## 25.6 Node: memory

Node “memory” chứa thông tin về các bộ nhớ hiện có trên board. Các property này có thể giúp cấp phát bộ nhớ hệ thống hiệu quả. Các property được trình bày trong bảng sau.

**Table 113. Các property của node “memory”**

| Property | Bắt buộc / Tùy chọn | Giá trị mong đợi | Mô tả |
|---|---|---|---|
| dpddr_size | O | \<uint32_t> | Chỉ định kích thước DP-DDR tùy chỉnh. Lưu ý rằng nếu giá trị là ‘0’ thì MC sẽ không dùng bộ nhớ này cho tài nguyên AIOP. |
| mc_sys_ddr_start_address | O | <uint32_t uint32_t> | Báo cho MC địa chỉ bắt đầu thực tế của phân vùng DDR hệ thống được cấp cho tài nguyên MC và AIOP. |
| mc_sys_ddr_end_address | O | <uint32_t uint32_t> | Báo cho MC địa chỉ kết thúc thực tế của phân vùng DDR hệ thống được cấp cho tài nguyên MC và AIOP. |

Ví dụ – Đặt kích thước bộ nhớ DP-DDR bằng ‘0’ và cung cấp giới hạn tùy chỉnh cho vùng MC trong DDR hệ thống:

```
memory {
          dpddr_size = <0x0>;
          mc_sys_ddr_start_address = <0x83 0xa000000f>;
          mc_sys_ddr_end_address = <0x83 0xffe00000>;
};
```
