# Chương 26 Các kịch bản use case

26.1 Các bước kiểm tra 1000BASE-X trên LS1088A QDS

Tuy 1000Base-X không được hỗ trợ tường minh, MC hỗ trợ SGMII dùng auto-negotiation của 1000Base-X thay cho cơ chế của SGMII. Về mặt vật lý và điện, nó vẫn là SGMII, nhưng với phần mềm PCS thì nó trông như 1000Base-X.

## 26.1.1 Chuẩn bị

### 26.1.1.1 Phần cứng

- Board LS1088AQDS với LS1088A Rev 1.0
- Card riser SGMII Vitesse 4 port (SCH-24801 REVA1, với Vitesse PHY VSC8234)

### 26.1.1.2 Phần mềm và firmware

- Uboot từ LSDK1706
- MC binary hỗ trợ chế độ 1000BASE-X
- File DPC

### 26.1.1.3 RCW

- Serdes 1 = 0x15 (1133)

### 26.1.1.4 Thiết lập board

Để thiết lập board, làm theo các bước sau:

1. Cắm một card riser SGMII Vitesse vào slot 1 của LS1088AQDS

2. Nối PORT 3 (port dưới cùng) của card SGMII vào mạng công ty (hoặc máy host bất kỳ). PORT 3 của card SGMII lúc này được nối với DPMAC3@sgmii.

3. Ghi uboot vào QSPI (để nó boot) và MC binary vào QSPI ở offset 0xa00000.

## 26.1.2 Quy trình kiểm tra

### 26.1.2.1 Kiểm tra MC chế độ SGMII hoạt động với SGMII PHY

1. Kiểm tra SGMII hoạt động bình thường.

2. Trong DPC, đảm bảo có các node sau:

```
boards {
      ports {
                 mac@3 {
                            pcs_autoneg = "on";
                 };
      };
};
```

Trong trường hợp này, Ethernet interface mặc định của MC hỗ trợ chế độ SGMII, với auto negotiation ON.

3. Tạo dpc.dtb và ghi nó vào QSPI flash ở offset 0xe00000.

4. Boot uboot và đảm bảo MC được nạp đúng. (MC binary ở 0xa00000, DPC ở 0xe00000).

5. Chạy chuỗi lệnh sau và kiểm tra host còn sống.

```
=> setenv ipaddr <your_ip>
=> setenv serverip <host_ip>
=> setenv ethact DPMAC3@sgmii
=> ping $serverip
DPMAC3@sgmii Waiting for PHY auto negotiation to complete.. done
Using DPMAC3@sgmii device
host 10.81.55.3 is alive
```

### 26.1.2.2 Kiểm tra MC chế độ SGMII không hoạt động với 1000BaseX PHY

1. Chạy các lệnh sau trong U-Boot:

```
=> mdio list
FSL_MDIO0:
LS1088A_QDS_MDIO0:
1 - RealTek RTL8211F <--> DPMAC4@rgmii
LS1088A_QDS_MDIO1:
2 - RealTek RTL8211F <--> DPMAC5@rgmii
LS1088A_QDS_MDIO2:
1e - Vitesse VSC8234 <--> DPMAC7@sgmii
1f - Vitesse VSC8234 <--> DPMAC3@sgmii
=> mdio read DPMAC3@sgmii 0x17
Reading from bus LS1088A_QDS_MDIO2
PHY at address 1f:
23 - 0xa022
=> mdio write DPMAC3@sgmii 0x17 0xe024 # set PHY
to 1000BASE-X mode
=> mdio read DPMAC3@sgmii 0x0
Reading from bus LS1088A_QDS_MDIO2
PHY at address 1f:
0 - 0x1040
=> mdio write DPMAC3@sgmii 0x0 0x9040 # soft
reset PHY
=> mdio read DPMAC3@sgmii 0x17
Reading from bus LS1088A_QDS_MDIO2
PHY at address 1f:
23 - 0xe024
=> ping $serverip
DPMAC3@sgmii Waiting for PHY auto negotiation to complete.. done
Using DPMAC3@sgmii device
ARP Retry count exceeded; starting again
ping failed; host 10.81.55.3 is not alive
=>
```

### 26.1.2.3 Sửa DPC để MC hỗ trợ 1000BaseX

1. Sửa file DPC, để cấu hình MC hỗ trợ chế độ 1000BASE-X

```
boards {
      ports {
                 mac@3 {
                            enet_if = "1000BASEX";
                            pcs_autoneg = "on";
                 };
      };
};
```

Trong trường hợp này, Ethernet interface của MC hỗ trợ chế độ 1000BASE-X, với auto negotiation ON.

2. Tạo dpc.dtb và ghi nó vào QSPI flash ở offset 0xe00000

3. Reboot uboot, đảm bảo MC được nạp đúng. (MC binary ở 0xa00000, DPC ở 0xe00000)

4. Chạy chuỗi lệnh sau để đặt PHY sang chế độ 1000BASE-X, rồi ping host server. Ping sẽ thành công ở chế độ 1000BASE-X.

```
=> setenv ipaddr <board_ip>
=> setenv serverip <host_ip>
=> setenv ethact DPMAC3@sgmii
=> mdio list
FSL_MDIO0:
LS1088A_QDS_MDIO0:
1 - RealTek RTL8211F <--> DPMAC4@rgmii
LS1088A_QDS_MDIO1:
2 - RealTek RTL8211F <--> DPMAC5@rgmii
LS1088A_QDS_MDIO2:
1e - Vitesse VSC8234 <--> DPMAC7@sgmii
1f - Vitesse VSC8234 <--> DPMAC3@sgmii
=> mdio read DPMAC3@sgmii 0x17
Reading from bus LS1088A_QDS_MDIO2
PHY at address 1f:
23 - 0xa022
=> mdio write DPMAC3@sgmii 0x17 0xe024
# set PHY to 1000BASE-X mode
=> mdio read DPMAC3@sgmii 0x0
Reading from bus LS1088A_QDS_MDIO2
PHY at address 1f:
0 - 0x1040
=> mdio write DPMAC3@sgmii 0x0 0x9040
# soft reset PHY
=> mdio read DPMAC3@sgmii 0x17
Reading from bus LS1088A_QDS_MDIO2
PHY at address 1f:
23 - 0xe024
=> ping $serverip
Using DPMAC3@sgmii device
host 10.81.55.3 is alive
=>
```

## 26.2 Các bước kiểm tra PHYless trên LS1088A QDS

Firmware MC không cần cấu hình thêm để tạo kết nối PHYless.

### 26.2.1 Chuẩn bị

#### 26.2.1.1 Phần cứng

- 2 board LS1088AQDS, với LS1088A Rev 1.0. Các board được gắn nhãn Board A và Board B.
- Dùng 1 trong 4 port trên mỗi card riser SFP (700-26908 REV X1). Các card được gắn nhãn Card A và Card B.
- 2 module SFP Finisar, (FTLX8571D3BCL), và một cáp quang multi-mode crossover

OR

- Một Direct Attached Cable (Tyco Electronics, 2127934-3 D)

#### 26.2.1.2 Phần mềm và firmware

- Uboot có hỗ trợ SGMII PHYless
- MC binary hỗ trợ SGMII
- File DPC

#### 26.2.1.3 RCW

- Serdes 1 = 0x15 (1133)

#### 26.2.1.4 Thiết lập board

- Cắm card riser SFP A vào slot 1 của LS1088AQDS Board A
- Cắm card riser SFP B vào slot 1 của LS1088AQDS Board B
- Lắp module SFP Finisar vào SFP cage 3 (cage trên cùng) của cả Card A và Card B, và nối chúng bằng cáp quang multi-mode crossover. (Pic. 1)

OR

- Cắm mỗi đầu của Direct Attached Cable vào SFP cage 3 (cage trên cùng) của cả Card A và Card B (Pic. 2)

Ghi uboot, MC và DPC vào QSPI để uboot có thể boot và MC/DPC có thể được nạp.

**Figure 707. Cáp quang multi-mode crossover**

Ghi uboot, MC và DPC vào QSPI để uboot có thể boot và MC/DPC có thể được nạp.

**Figure 708. Cáp nối trực tiếp**

### 26.2.2 Quy trình kiểm tra

1. Thiết lập tham số mạng trên Board A.

```
=> setenv ethact DPMAC3@sgmii
=> setenv ipaddr 1.1.1.1
```

2. Thiết lập tham số mạng trên Board B.

Note: Vì IP server là giả, có thể cần cho Board B tftp một file giả từ server giả để nó có thể đáp lại ping.

```
=> setenv ethact DPMAC3@sgmii
=> setenv ipaddr 1.1.1.2
=> setenv serverip 1.1.1.10
```

3. Tftp một file giả trên Board B.

```
=> tftp afile
Using DPMAC3@sgmii device
TFTP from server 1.1.1.10; our IP address is 1.1.1.2
Filename 'afile'.
Load address: 0x90100000
Loading: *
```

4. Ping từ Board A tới Board B, trong khi Board B đang ở trạng thái polling. Để có được một Board B hoạt động.

```
=> ping 1.1.1.2
Using DPMAC3@sgmii device
host 1.1.1.2 is alive
```
