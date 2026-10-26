# H Phòng lab: Project xv6

Chương này đưa ra ý tưởng project liên quan kernel xv6. Kernel được MIT cung cấp, rất thú vị để khám phá; làm project còn khiến nội dung in-class liên quan trực tiếp hơn đến project. Những project này (có lẽ trừ hai project đầu) thường làm theo cặp, giúp việc khó là chăm chú nghiên cứu kernel dễ hơn đôi chút.

## H.1 Project nhập môn

Phần nhập môn thêm system call đơn giản vào xv6. Có nhiều biến thể, gồm system call đếm số system call đã xảy ra (mỗi system call một counter) hoặc call information-gathering khác. Sinh viên học cách system call thực sự diễn ra.

## H.2 Process và scheduling

Sinh viên xây scheduler phức tạp hơn round robin mặc định. Có nhiều biến thể, gồm Lottery scheduler hoặc feedback queue multi-level. Sinh viên học scheduler thực sự hoạt động và context switch diễn ra thế nào. Phần bổ sung nhỏ yêu cầu tìm cách để process trả error code thích hợp khi thoát, và truy cập error code ấy qua wait() system call.

## H.3 Nhập môn virtual memory

Ý tưởng cơ bản là thêm system call nhận virtual address rồi trả physical address đã dịch (hoặc báo address không hợp lệ). Nhờ vậy sinh viên thấy virtual memory system thiết lập page table mà không làm quá nhiều việc khó. Biến thể khác tìm hiểu cách thay đổi xv6 để dereference null-pointer thực sự tạo fault.

## H.4 Mapping Copy-on-write

Project thêm vào xv6 khả năng thực hiện fork() nhẹ, gọi là vfork(). Call mới không chỉ sao chép mapping mà thiết lập mapping copy-on-write tới page dùng chung. Khi tham chiếu page đó, kernel phải tạo bản sao thực và cập nhật page table tương ứng.

## H.5 Memory mapping

Project virtual memory khác là thêm một dạng file memory-mapped. Có lẽ dễ nhất là lazy page-in các code page từ executable; cách full-blown hơn là xây mmap() system call và toàn bộ hạ tầng cần để fault page từ disk vào khi dereference.

## H.6 Kernel thread

Project tìm hiểu cách thêm kernel thread vào xv6. System call clone() hoạt động gần giống fork nhưng dùng cùng address space. Sinh viên phải tìm cách triển khai, qua đó tạo kernel thread thực sự. Cũng nên xây thread library nhỏ bên trên, cung cấp lock đơn giản.

## H.7 Kernel thread nâng cao

Sinh viên xây thread library full-blown trên kernel thread của mình, thêm các loại lock (spin lock, lock ngủ khi processor không khả dụng) và condition variable. Kernel support cần thiết cũng được thêm.

## H.8 File system Extent-based

Project file system đầu thêm tính năng đơn giản vào file system cơ bản. Với file kiểu EXTENT, sinh viên đổi inode để lưu extent (cặp pointer, length) thay vì chỉ pointer. Đây là phần giới thiệu tương đối nhẹ về file system.

## H.9 Fast File System

Sinh viên chuyển file system xv6 cơ bản thành Berkeley Fast File System (FFS). Họ xây mkfs tool mới, thêm block group, policy block-allocation mới và ngoại lệ large-file. Các nền tảng hoạt động file system được hiểu sâu hơn.

## H.10 Journaling file system

Sinh viên thêm journaling layer sơ khai vào xv6. Với mỗi lần ghi file, journaling FS gom mọi dirty block và ghi record về cập nhật đang chờ vào log on-disk; chỉ sau đó mới sửa block tại chỗ. Sinh viên chứng minh hệ thống đúng bằng cách thêm crash point và cho thấy file system luôn phục hồi về state nhất quán.

## H.11 File system checker

Sinh viên xây file system checker đơn giản cho file system xv6. Họ học điều gì làm file system nhất quán và chính xác cách kiểm tra.
