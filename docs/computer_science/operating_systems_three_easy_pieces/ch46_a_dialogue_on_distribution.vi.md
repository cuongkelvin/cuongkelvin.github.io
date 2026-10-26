# 46 Đối thoại về Distribution

Giáo sư: Và thế là chúng ta đến với phần nhỏ cuối cùng trong thế giới operating system: distributed system. Vì ở đây không thể trình bày nhiều, thầy sẽ tranh thủ đưa một phần giới thiệu ngắn vào mục persistence này và chủ yếu tập trung vào distributed file system. Hy vọng như vậy là ổn!

Sinh viên: Nghe có vẻ ổn ạ. Nhưng chính xác distributed system là gì, thưa vị giáo sư vĩ đại và all-knowing?

Giáo sư: Thầy cá là em biết câu chuyện này sẽ diễn ra thế nào rồi...

Sinh viên: Có một quả đào ạ?

Giáo sư: Chính xác! Nhưng lần này nó ở xa em, nên có thể mất một lúc mới lấy được quả đào. Và có rất nhiều quả! Tệ hơn nữa, đôi khi có quả đào bị thối. Nhưng em muốn bảo đảm bất cứ ai cắn vào một quả đào cũng được thưởng thức một miếng đào ngon lành.

Sinh viên: Em thấy phép ví von bằng quả đào này ngày càng ít giúp ích.

Giáo sư: Thôi nào! Đây là lần cuối rồi, cứ thuận theo đi.

Sinh viên: Vâng ạ.

Giáo sư: Dù sao thì quên mấy quả đào đi. Xây dựng distributed system rất khó vì sự cố xảy ra liên tục. Message bị mất, máy ngừng hoạt động, disk làm corrupt data. Cứ như cả thế giới đang chống lại em!

Sinh viên: Nhưng em vẫn dùng distributed system suốt, đúng không ạ?

Giáo sư: Đúng! Em vẫn dùng. Và...?

Sinh viên: Dạ, có vẻ phần lớn thời gian chúng vẫn hoạt động. Suy cho cùng, khi em gửi search request tới google, thường chỉ trong nháy mắt đã có phản hồi với những kết quả rất hay! Khi dùng facebook hay Amazon và những dịch vụ khác cũng vậy. Giáo sư: Đúng, thật đáng kinh ngạc. Và chúng làm được như thế bất chấp tất cả những sự cố đang xảy ra! Những công ty đó xây dựng vô số cơ chế trong hệ thống để bảo đảm dù một số máy đã hỏng, toàn hệ thống vẫn hoạt động. Họ sử dụng nhiều kỹ thuật để làm điều này: replication, retry và nhiều thủ thuật khác mà con người đã phát triển qua thời gian để phát hiện và phục hồi sau sự cố.

Sinh viên: Nghe thú vị đấy ạ. Đến lúc thực sự học điều gì đó rồi chứ?

Giáo sư: Có vẻ là vậy. Bắt tay vào việc thôi! Nhưng trước hết phải làm việc cần làm đã... (cắn vào quả đào đang cầm, không may nó đã bị thối)
