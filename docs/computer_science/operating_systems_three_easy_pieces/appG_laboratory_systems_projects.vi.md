# G Phòng lab: Systems project

Chương này đưa ra một số ý tưởng systems project. Ta thường làm khoảng sáu hay bảy project trong học kỳ 15-week, tức khoảng hai tuần một project. Những project đầu thường làm cá nhân, những project cuối theo nhóm hai người.

Mỗi học kỳ, project theo cùng dàn ý này nhưng thay đổi chi tiết để thú vị và khiến việc “chia sẻ” code giữa các học kỳ khó hơn (đâu có ai làm thế!). Ta còn dùng Moss [M94] để tìm kiểu “chia sẻ” đó.

Về chấm điểm, ta thử nhiều cách, mỗi cách có ưu nhược điểm. Demo thú vị nhưng tốn thời gian. Automated test script tốn ít thời gian hơn nhưng cần hết sức cẩn thận để kiểm tra kỹ corner case thú vị. Xem web page của sách để biết thêm; nếu muốn automated test script, chúng tôi sẵn lòng chia sẻ.

## G.1 Project nhập môn

Project đầu giới thiệu systems programming. Bài tập thường là viết biến thể tiện ích sort với ràng buộc khác nhau. Chẳng hạn sắp xếp text data, binary data và những project tương tự đều hợp lý. Để hoàn thành, phải làm quen một số system call (và error code trả về), dùng vài data structure đơn giản, không nhiều hơn.

## G.2 UNIX shell

Sinh viên xây dựng biến thể UNIX shell. Họ học process management và cách những thứ bí ẩn như pipe, redirect thực sự hoạt động. Biến thể gồm tính năng lạ, như redirection symbol còn nén output bằng gzip. Biến thể khác là batch mode cho user gom vài request rồi thực thi, có thể theo scheduling discipline khác nhau.

## G.3 Library Memory-allocation

Project tìm hiểu quản lý một phần memory bằng cách xây dựng library memory-allocation thay thế (như malloc() và free() nhưng tên khác). Sinh viên học dùng mmap() lấy một phần anonymous memory, rồi tìm hiểu pointer rất kỹ để xây free list đơn giản (hoặc phức tạp hơn) quản lý không gian. Biến thể gồm best/worst fit, buddy và những allocator khác.

## G.4 Nhập môn concurrency

Project giới thiệu concurrent programming với POSIX thread. Xây library thread-safe đơn giản: list, hash table và data structure phức tạp hơn là bài tập tốt để thêm lock vào code real-world. Đo performance của cách coarse-grained so với fine-grained. Các biến thể tập trung vào data structure khác nhau, có thể phức tạp hơn.

## G.5 Concurrent web server

Project tìm hiểu concurrency trong ứng dụng real-world. Sinh viên lấy web server đơn giản (hoặc tự xây) rồi thêm thread pool để phục vụ request đồng thời. Thread pool phải có kích thước cố định, dùng producer/consumer bounded buffer chuyển request từ main thread tới pool worker cố định. Học cách dùng thread, lock, condition variable xây server thực. Biến thể gồm scheduling policy cho thread.

## G.6 File system checker

Project tìm hiểu data structure on-disk và consistency của chúng. Sinh viên xây file system checker đơn giản. Dùng debugfs trên Linux để tạo image file-system thực; duyệt qua và bảo đảm mọi thứ ổn. Để khó hơn, sửa cả vấn đề tìm thấy. Biến thể tập trung vào loại vấn đề khác nhau: pointer, link count, dùng indirect block, v.v.

## G.7 File system defragmenter

Project tìm hiểu data structure on-disk và ảnh hưởng performance. Nên cung cấp cho sinh viên một số image file-system có vấn đề fragmentation đã biết; sinh viên duyệt image, tìm file không được bố trí tuần tự. Ghi image “defragmented” mới khắc phục vấn đề, có thể báo thêm thống kê.

## G.8 Concurrent file server

Project kết hợp concurrency, file system và chút networking, distributed system. Sinh viên xây concurrent file server đơn giản. Protocol nên giống NFS, với lookup, read, write, stat. Lưu file trong một disk image duy nhất (được thiết kế dưới dạng file). Có vô số biến thể với định dạng on-disk và network protocol khác nhau được đề xuất.

## Tài liệu tham khảo

[M94] “Moss: A System for Detecting Software Plagiarism” Alex Aiken

Có tại: http://theory.stanford.edu/˜aiken/moss/
