# Chương 28 Các hạn chế đã biết

## 28.1 Reset các MC object có FQ gắn với một channel

Tuy MC hỗ trợ reset từng object riêng lẻ, có một số tình huống nó chỉ hoạt động trong một số cấu hình nhất định.

Command reset có thể thất bại trên các MC object nối với một DPCON hoặc các object có đích FQ được cấu hình tới một channel DPIO/DPCON (ví dụ DPNI) nếu các FQ tương ứng không rỗng. Cách khắc phục là đặt mọi object góp vào channel đó trong cùng một container, kể cả các DPIO và DPCON object. DPRC_RESET sẽ xử lý reset cho mọi object chứa trong nó và xóa đúng các FQ gắn với channel DPIO/DPCON.

Hạn chế này bắt nguồn từ một hạn chế của QMan.

## 28.2 Cấu hình lại các FQ gắn với một channel

Hạn chế này có cùng nguyên nhân gốc với Section 28.1, “Reset các MC object có FQ gắn với một channel,” nhưng người dùng thấy được nó khi cố cấu hình lại một RX queue trước đó đã được cấu hình tới một channel DPCON.

Cách khắc phục giống như ở Section 28.1, “Reset các MC object có FQ gắn với một channel.”

## 28.3 DPSW - Link Aggregation

- LAG group chỉ có thể cấu hình với các port từ một trong hai tập sau: {1, 2, 3, 4, 9, 10, 11, 12} hoặc {5, 6 ,7 ,8, 13, 14, 15, 16}, trong đó các ID là DPMAC ID.

E.g.:

LAG group 1: {1, 3, 9, 12} - được hỗ trợ

LAG group 2: {3, 4, 7, 8} - không được hỗ trợ

- LAG group chỉ có thể cấu hình với các port thuộc cùng một instance CEETM. Nếu không, command sẽ trả về lỗi.
- Interface đầu tiên được thêm vào một LAG group không thể bị gỡ khỏi group trước các interface khác. Command sẽ trả về lỗi trong trường hợp này
- Các counter frame TX của slave port truy vấn qua API dpsw_get_if_counters hiển thị 0; mọi frame TX được đếm bởi các counter của master interface (xem chương DPSW để biết chi tiết về master port và slave port). Các counter MAC được tăng đúng cho mọi port trong LAG group.

## 28.4 DPSPARSER

Command DPSPARSER_DESTROY không hủy DPSPARSER object.

DPSPARSER_APPLY_SPB phải được gọi trước khi áp dụng DPL.

## 28.5 DPSW - LS2080/85 drop mọi packet IPv6

Bảng ACL sẽ drop mọi packet IPv6 trên LS2080/85, bất kể có thêm ACL rule nào hay không.

## 28.6 DPSW & DPDMUX - Xử lý interrupt

Với các phiên bản MC từ 10.26.0 đến 10.32.0, do một bug trong việc xử lý interrupt bên trong MC, người dùng được khuyên yêu cầu mọi nguồn interrupt trên DPSW và DPDMUX object khi gọi dpsw_get_irq_status hoặc dpdmux_get_irq_status. Nếu không thay đổi như vậy, MC sẽ không gửi interrupt báo link thay đổi tới ứng dụng, cuối cùng dẫn tới ứng dụng không biết link trên các port đã up.
