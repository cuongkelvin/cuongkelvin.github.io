# Chương 3 Quá trình boot và khởi tạo

Khởi tạo MC là một phần bắt buộc của quá trình boot – MC cấu hình các tài nguyên phần cứng then chốt của DPAA2, như QBMan, các port Ethernet và những tài nguyên khác cần đến sớm trong quá trình boot. Ví dụ, có thể cần một giao diện mạng để lấy OS image từ mạng; vì vậy việc khởi tạo MC phải xong trước khi image OS chính được nạp. Tín hiệu POR của SoC đưa DPAA2 về một trạng thái nghỉ đã biết, mọi tài nguyên DPAA2 chưa được khởi tạo và sẵn sàng để cấp phát; MC được giữ ở trạng thái boot hold-off (reset).

## 3.1 Nạp MC firmware

Bản thân MC firmware cần được lấy từ một nơi không cần đến các giao diện mạng DPAA2, có thể là bộ nhớ trên board, hoặc một vị trí trên mạng được truy cập qua một card mạng gắn thêm (ví dụ card mạng PCI-Express). MC cần được cấp phát một khối bộ nhớ cô lập lấy từ bộ nhớ chính của hệ thống để lưu firmware và cho DPAA dùng chung; vùng nhớ này không được để bất kỳ thiết bị nào khác truy cập sau khi MC khởi tạo, nhằm bảo đảm MC được cô lập và tin cậy. Chương trình boot của SoC (ví dụ U-Boot) phải cấu hình địa chỉ cơ sở và kích thước vùng nhớ riêng của MC trong các thanh ghi MCFBALR và MCFBAHR. Kích thước bộ nhớ cấp cho MC có thể cấu hình, nhưng phải là bội số của 256MB.

Chương trình boot phải kiểm tra tính xác thực của MC firmware trước khi nạp firmware vào vùng nhớ của MC; MC firmware được cung cấp ở định dạng image FIT (Flattened Image Tree), có kèm checksum và thông tin phiên bản, để chương trình boot chắc chắn nạp đúng image vào vùng nhớ của MC.

## 3.2 Data Path Configuration (DPC)

“Data Path Configuration” (DPC) dựa trên một file nguồn văn bản (tương tự DTS) và được biên dịch bằng DTC thành một cấu trúc nhị phân (blob, tương tự DTB). File DPC là đầu vào tùy chọn của MC, chứa thông tin riêng của board và của hệ thống, có thể ghi đè cấu hình phần cứng DPAA mặc định. File DPC cần được biên dịch thành blob nhị phân bằng công cụ DTC chuẩn. Với một số hệ thống, DPC có thể là tùy chọn.

Chương trình boot cần đặt DPC blob ở offset 0x00F00000 tính từ địa chỉ cơ sở bộ nhớ của MC (MCFBALR/HR).

## 3.3 Data Path Layout (DPL)

Nhiều hệ thống ít hoặc không cần tạo và hủy DPAA2 object một cách động. MC có thể dùng một cấu trúc dữ liệu gọi là “Data Path Layout” (DPL) – mô tả tập object cần tạo khi hệ thống khởi tạo.

DPL dựa trên một file nguồn văn bản (tương tự DTS) và được biên dịch bằng DTC thành một cấu trúc nhị phân (blob, tương tự DTB). Cấu trúc nhị phân này được chương trình boot nạp làm đầu vào tùy chọn cho MC. Khác với Linux Device Tree, mục đích của DPL không phải là mô tả thuộc tính phần cứng, mà là mô tả topology ban đầu của các object logic mà MC firmware cần tạo.

Tuy vậy, để đáp ứng nhu cầu của các hệ thống động hơn, MC cũng hỗ trợ thiết lập object một cách động. Vì thế, toàn bộ nội dung DPL đều được coi là tùy chọn – cùng một topology gồm các software context và object logic cũng có thể được tạo động. Một software context có thể, thông qua management portal của nó, tạo ra một software context con và gán object cho nó. Như được giải thích trong chương quản lý tài nguyên, phần mềm gốc/cha có thể áp đặt chính sách giới hạn lên các software context con của nó.

Chương trình boot cần đặt DPL blob ở offset 0x00F20000 tính từ địa chỉ cơ sở bộ nhớ của MC (MCFBALR/HR).

## 3.4 Khởi động MC

Sau khi nạp firmware, chương trình boot của SoC thôi kích hoạt các bit P1_RST_b và Mn_RST_b trong General Control Register 1 (GCR1) để đưa MC ra khỏi reset; MC lập tức bắt đầu lấy và thực thi firmware đã nạp.

Khi MC đã hoàn tất cấu hình của nó và cấu hình ban đầu của DPAA2, nó sẵn sàng phục vụ command từ GPP. MC báo cho chương trình boot của SoC biết việc khởi tạo đã xong bằng cách ghi vào field trạng thái MSC *(ghi chú: đúng là MCS)* trong General Status Register (GSR); nếu trạng thái trả về cho biết khởi tạo thành công, quá trình boot hệ thống có thể tiếp tục bình thường. Nếu MC trả về mã lỗi, subsystem DPAA2 không dùng được và cần dừng boot hệ thống để phân tích vấn đề.

Chương trình boot có thể yêu cầu MC hoãn việc xử lý DPL; điều này cho phép chương trình boot dùng một số MC object cho chính nó, bất kể DPL đã định nghĩa những object nào. Sau khi hoàn tất công việc, chương trình boot phải hủy mọi MC object nó đã tạo và báo MC nạp DPL của hệ thống.

Dưới đây là tóm tắt quy trình bắt tay (handshake) dự kiến giữa chương trình boot và MC:

1. Chương trình boot cấp phát bộ nhớ hệ thống cho MC, với kích thước N lần 256MB

2. Chương trình boot đặt MCFBALR và MCFBAHR bằng địa chỉ cơ sở vật lý của vùng nhớ cấp cho MC, và ghi MCFBALR[MEMSZ] để cho biết kích thước vùng nhớ đã cấp.

3. Chương trình boot nạp DPC blob ở offset 0x00F00000 tính từ địa chỉ cơ sở của MC firmware.

4. Chương trình boot nạp DPL blob ở offset 0x00F20000 tính từ địa chỉ cơ sở của MC firmware (tùy chọn).

5. Trước khi khởi động MC core, chương trình boot có thể đặt GSR[BC] bằng giá trị 0xDD (yêu cầu hoãn xử lý DPL). Nếu mã này không được đặt, DPL được triển khai ngay sau khi MC hoàn tất boot ban đầu (bỏ qua bước 7 và 8 bên dưới).

6. Chương trình boot khởi động MC bằng cách ghi vào GCR.

7. Nếu GSR[BC] đã được đặt để yêu cầu hoãn xử lý DPL, MC đặt GSR[MCS] thành trạng thái ready (0x1) hoặc trạng thái lỗi sau khi hoàn tất boot ban đầu. Nếu không có lỗi, chương trình boot có thể gửi MC command (qua MC portal #0) để tạo DPAA object cho chính nó dùng.

8. Sau khi chương trình boot xong các hoạt động mạng của nó, nó phải hủy mọi object đã tạo và xóa GSR – việc này báo cho MC triển khai DPL.

9. Khi MC triển khai DPL xong, nó lại đặt GSR[MCS] thành trạng thái ready (0x1) (hoặc báo trạng thái lỗi). Chương trình boot cần chờ trạng thái này rồi mới tiếp tục boot OS chính.

## 3.5 Yêu cầu bộ nhớ tối thiểu

Yêu cầu bộ nhớ tối thiểu của MC là:

- 128MB bộ nhớ cho các nền tảng LS108x và LS208x
- 256MB bộ nhớ cho nền tảng LX216x

Các giới hạn của MC tùy theo kích thước bộ nhớ:

**Table 3-1.**

| Bộ nhớ MC | Nền tảng | Giới hạn |
|---|---|---|
| 128M | LS108x LS208x | Bộ nhớ khả dụng nhỏ và tạo được ít object hơn.<br>Tổng số buffer có thể tồn tại đồng thời trong mọi queue cố định ở 320000. Tham số total_bman_buffers trong file DPC bị bỏ qua<br>AIOP không hoạt động: mọi cố gắng nạp và chạy ứng dụng AIOP sẽ làm hệ thống crash |
|   | LX216x | MC sẽ không khởi động |
| 256M | LS108x LS208x | Bộ nhớ khả dụng nhỏ và tạo được ít object hơn |
|   | LX216x | Bộ nhớ khả dụng nhỏ và tạo được ít object hơn.<br>Tổng số buffer có thể tồn tại đồng thời trong mọi queue bị giới hạn ở 640000. Nếu total_num_buffers trong file dpc lớn hơn 640000, MC sẽ boot thất bại.<br>Nếu file dpc không có total_num_buffers, MC sẽ dùng giá trị mặc định 640000. |
| 512M | - | Không có giới hạn liên quan đến bộ nhớ |

Mức tối thiểu của MC phụ thuộc vào tham số DPC total_bman_buffers. Tham số này được cung cấp trong file DPC và dùng để cấu hình số buffer tối đa mà QBMAN sẽ xử lý. Để xử lý các buffer này, QBMAN cần bộ nhớ DDR để lưu các cấu trúc nội bộ; kích thước vùng nhớ này phụ thuộc vào số buffer.

Bảng dưới đây cho biết yêu cầu bộ nhớ tối thiểu của MC tùy theo total_bman_buffers. Các giá trị này là mức bộ nhớ tối thiểu để MC hoạt động đúng. Nếu bật AIOP, cần tăng kích thước để có thêm bộ nhớ bổ sung.

**Table 3-2.**

| total_bman_buffers | Bộ nhớ MC tối thiểu |
|---|---|
| không có trong DPC | 256MB |
| nhỏ hơn 1310000 | 256MB |
| nhỏ hơn 2620000 | 512MB |
| nhỏ hơn 5240000 | 768MB |
| nhỏ hơn 10400000 | 1GB |
