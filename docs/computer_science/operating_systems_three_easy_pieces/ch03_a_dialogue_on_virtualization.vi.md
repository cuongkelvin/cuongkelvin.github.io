**Phần I Virtualization**

# 3 Đối thoại về virtualization

Giáo sư: Và thế là chúng ta đến với phần đầu tiên trong ba phần về operating system: virtualization.

Sinh viên: Nhưng virtualization là gì, thưa vị giáo sư đáng kính?

Giáo sư: Hãy tưởng tượng chúng ta có một quả đào.

Sinh viên: Một quả đào ạ? (không tin nổi)

Giáo sư: Đúng, một quả đào. Hãy gọi nó là quả đào vật lý. Nhưng chúng ta có nhiều người muốn ăn quả đào này. Điều chúng ta muốn là cho mỗi người cảm giác có một quả đào riêng, để ai cũng vui. Ta gọi những quả đào đưa cho họ là đào virtual; bằng cách nào đó, ta tạo ra nhiều quả đào virtual từ một quả đào vật lý duy nhất. Và điều quan trọng là: trong ảo giác này, mỗi người đều có cảm giác mình có một quả đào vật lý, nhưng thực tế thì không.

Sinh viên: Vậy là mình đang dùng chung quả đào mà thậm chí không biết điều đó ạ?

Giáo sư: Đúng! Chính xác.

Sinh viên: Nhưng chỉ có một quả đào thôi mà.

Giáo sư: Đúng. Rồi sao...?

Sinh viên: À, nếu em dùng chung một quả đào với người khác, em nghĩ mình sẽ nhận ra.

Giáo sư: À đúng! Nhận xét hay đấy. Nhưng với nhiều người ăn thì thế này: phần lớn thời gian họ đang chợp mắt hoặc làm việc khác, nên ta có thể lấy quả đào đi và đưa cho người khác một lúc. Nhờ vậy, ta tạo ra ảo giác có nhiều quả đào virtual, mỗi người một quả!

Sinh viên: Nghe như một khẩu hiệu tranh cử dở tệ. Thầy đang nói về máy tính, đúng không ạ?

Giáo sư: À, chú châu chấu nhỏ, em muốn có ví dụ cụ thể hơn. Ý hay đấy! Hãy xét tài nguyên cơ bản nhất: CPU. Giả sử hệ thống có một CPU vật lý (dù ngày nay thường có hai, bốn hoặc nhiều hơn). Virtualization lấy CPU duy nhất đó và làm cho các ứng dụng đang chạy trên hệ thống thấy như có nhiều CPU virtual. Vì vậy, dù mỗi ứng dụng nghĩ mình có CPU riêng để sử dụng, thực ra chỉ có một CPU. Và thế là OS đã tạo ra một ảo giác tuyệt đẹp: nó đã virtualize CPU.

Sinh viên: Chà! Nghe như phép thuật vậy. Thầy kể thêm đi! Nó hoạt động như thế nào ạ?

Giáo sư: Rồi em sẽ biết, chàng sinh viên trẻ, cứ từ từ. Có vẻ em đã sẵn sàng bắt đầu rồi.

Sinh viên: Em sẵn sàng rồi! À, cũng phần nào thôi. Phải thú thật là em hơi lo thầy lại bắt đầu nói về đào nữa.

Giáo sư: Đừng lo quá; tôi còn chẳng thích đào. Và thế là chúng ta bắt đầu...
