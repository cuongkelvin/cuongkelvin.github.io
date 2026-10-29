<a id="chapter102"></a>

# 24 Kết luận

DOI: [10.1201/9781003598145-24](https://doi.org/10.1201/9781003598145-24)

Trong phần kết luận của phiên bản thứ hai của cuốn sách này, tôi đã nói rằng nhà thiết kế một hệ thống nhúng safety-critical đang ngồi ở tâm của một cơn bão đang mạnh lên nhanh chóng. Tôi không cảm thấy rằng mình cần thay đổi nhận định đó cho phiên bản thứ ba này. Cơn bão vẫn đang ở trên đầu chúng ta.

Phần cứng mà các chương trình của chúng ta chạy trên đó đã trở nên non-deterministic; cả phần cứng lẫn phần mềm của chúng ta đều đang tạo ra những lỗ hổng đang bị hacker khai thác; chúng ta không có công cụ nào giúp cân bằng tính hữu dụng, an toàn, bảo mật và hiệu năng; các cảm biến chúng ta dùng ngày càng dễ bị gây nhiễu và giả mạo; chúng ta không còn có thể chắc chắn rằng nghiên cứu failure là đang nghiên cứu an toàn, và *phần mềm* chúng ta đang tạo ra ngày càng trở thành *dữ liệu,* tức là các trọng số trong một mạng nơ-ron mà hành vi của nó chúng ta không thể hiểu được.

Chúng ta được yêu cầu làm việc với những nguyên liệu thô này và tạo ra những hệ thống đủ an toàn. Đây là một thách thức to lớn đòi hỏi ngành công nghiệp phải làm việc co-operatively với giới học thuật để tìm ra câu trả lời.

Tôi có một khuyến nghị cuối cùng: hãy tìm một bản *Software for Dependable Systems*, do National Research Council xuất bản.<a id="fn24_1102b"></a>[<sup>1</sup>](#fn24_1) Cuốn này có cả dưới dạng sách in (ISBN 978-0-309-10394-7) lẫn dạng tải về `pdf` miễn phí. Nó hơi lặp lại, nhưng nó mô tả những gì mà tôi đồng ý là ba chìa khóa cho việc phát triển phần mềm thành công và an toàn. Đó là “ba chữ E”:

- **Explicit Claims (Tuyên bố tường minh).** Không hệ thống nào đáng tin cậy trong mọi tình huống, và điều quan trọng là chúng ta, với tư cách nhà phát triển, và khách hàng của chúng ta biết chính xác chúng ta đang tuyên bố, và không tuyên bố, điều gì.
- **Evidence (Bằng chứng).** Phải có bằng chứng cụ thể để hỗ trợ lập luận an toàn của chúng ta.
- **Expertise (Chuyên môn).** Xây dựng một hệ thống an toàn là khó, và các nhà phát triển cần chuyên môn về phát triển phần mềm, về lĩnh vực mà sản phẩm sẽ hoạt động (y tế, công nghiệp, ô tô, đường sắt) và về bối cảnh safe-system rộng hơn. Mức chuyên môn này không dễ tìm.

Những thách thức được liệt kê ở trên sẽ thay đổi bản chất của các tuyên bố và bằng chứng, nhưng sự thay đổi lớn nhất sẽ phải nằm ở chuyên môn của các kỹ sư làm việc trên các thiết kế của chúng ta.

<a id="fn24_1"></a>

[<sup>1</sup>](#fn24_1102b)Không có chỗ nào trong cuốn sách nhắc đến việc Research Council đặt ở quốc gia nào. Đánh giá qua các tác giả, có vẻ đó là Anh hoặc Mỹ.

Khi bạn đặt cuốn sách này sang một bên và quay lại phát triển phần mềm, hãy bảo đảm rằng các tuyên bố của bạn là tường minh, bằng chứng của bạn vững chắc, và bạn duy trì chuyên môn của mình bằng cách theo dõi các nghiên cứu thực tiễn đang được công bố trên các tạp chí và tại các hội nghị hiện nay.
