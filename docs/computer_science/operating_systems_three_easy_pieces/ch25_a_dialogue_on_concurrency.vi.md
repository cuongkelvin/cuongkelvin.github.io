**Phần II Concurrency**

# 25 Đối thoại về Concurrency

Giáo sư: Và như vậy, chúng ta đến với trụ cột thứ hai trong ba trụ cột của operating system: concurrency.

Sinh viên: Em tưởng có bốn trụ cột...?

Giáo sư: Không, đó là trong phiên bản cũ hơn của cuốn sách.

Sinh viên: Ừm... Được rồi. Vậy concurrency là gì, thưa vị giáo sư tuyệt vời?

Giáo sư: À, hãy tưởng tượng chúng ta có một quả đào —

Sinh viên: (ngắt lời) Lại đào nữa! Thầy có chuyện gì với những quả đào vậy?

Giáo sư: Em đã đọc T.S. Eliot chưa? The Love Song of J. Alfred Prufrock, “Liệu tôi có dám ăn một quả đào”, và tất cả những điều thú vị ấy?

Sinh viên: Có chứ ạ! Trong giờ tiếng Anh hồi trung học. Tuyệt lắm! Em rất thích đoạn mà —

Giáo sư: (ngắt lời) Chuyện này chẳng liên quan gì đến bài thơ đó — tôi chỉ thích đào thôi. Dù sao, hãy tưởng tượng có nhiều quả đào trên bàn và nhiều người muốn ăn chúng. Giả sử chúng ta làm như sau: trước tiên mỗi người dùng mắt chọn một quả đào, rồi cố lấy nó để ăn. Cách này có vấn đề gì?

Sinh viên: Hừm... có vẻ mình có thể nhìn thấy một quả đào mà người khác cũng nhìn thấy. Nếu họ đến trước, lúc mình đưa tay ra thì chẳng còn đào cho mình nữa!

Giáo sư: Chính xác! Vậy chúng ta nên làm gì?

Sinh viên: Có lẽ cần nghĩ ra cách tốt hơn. Chẳng hạn xếp hàng, rồi khi đến đầu hàng thì lấy một quả đào và tiếp tục việc của mình.

Giáo sư: Tốt! Nhưng cách của em có vấn đề gì?

Sinh viên: Trời, em phải làm hết mọi việc sao?

Giáo sư: Đúng.

Sinh viên: Được rồi, để em nghĩ. Trước đây chúng ta có nhiều người cùng lấy đào một lúc nên nhanh hơn. Nhưng theo cách của em, mỗi lần chỉ có một người lấy, điều này đúng nhưng chậm hơn khá nhiều. Có lẽ cách tốt nhất phải vừa nhanh vừa đúng. Giáo sư: Em thực sự bắt đầu khiến tôi ấn tượng. Thực ra em vừa nói tất cả những gì chúng ta cần biết về concurrency! Giỏi lắm.

Sinh viên: Em đã nói vậy sao? Em tưởng chúng ta chỉ đang nói về đào. Thầy nhớ nhé, thường đến đoạn này thầy lại chuyển câu chuyện sang máy tính.

Giáo sư: Đúng vậy. Xin lỗi em! Không bao giờ được quên những điều cụ thể. Hóa ra có một số loại chương trình mà chúng ta gọi là ứng dụng multi-threaded; mỗi thread giống như một tác nhân độc lập chạy trong chương trình, thực hiện công việc thay cho chương trình. Nhưng các thread này truy cập memory, và đối với chúng, mỗi vị trí memory giống như một trong những quả đào đó. Nếu chúng ta không phối hợp việc truy cập memory giữa các thread, chương trình sẽ không hoạt động như mong đợi. Em hiểu chứ?

Sinh viên: Cũng hơi hiểu. Nhưng tại sao chúng ta nói về điều này trong môn OS? Đó chẳng phải chỉ là lập trình ứng dụng sao?

Giáo sư: Câu hỏi hay! Thực ra có vài lý do. Thứ nhất, OS phải hỗ trợ ứng dụng multi-threaded bằng các primitive như lock và condition variable, mà chúng ta sẽ sớm tìm hiểu. Thứ hai, bản thân OS chính là chương trình concurrent đầu tiên — nó phải truy cập memory của mình thật cẩn thận, nếu không nhiều điều kỳ lạ và tồi tệ sẽ xảy ra. Thực sự có thể rất kinh khủng.

Sinh viên: Em hiểu rồi. Nghe có vẻ thú vị. Chắc còn nhiều chi tiết nữa phải không ạ?

Giáo sư: Đúng là còn...
