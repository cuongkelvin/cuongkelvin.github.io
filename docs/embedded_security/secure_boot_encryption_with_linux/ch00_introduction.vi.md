# Giới thiệu

Các hệ thống embedded hiện đại Linux-based—từ các bộ điều khiển công nghiệp và nền tảng ô tô đến các thiết bị IoT high-value—là tuyến đầu của bảo mật số. Thế nhưng, nhiều hệ thống trong số đó dựa vào những mô hình bảo mật thất bại vì không củng cố các bản triển khai bảo mật. Ngay khi một kẻ tấn công tinh vi xâm nhập được bootloader hoặc hệ điều hành để giành quyền root, quyền kiểm soát máy thường bị mất. Encryption key, các bí mật của hệ thống và tính toàn vẹn của code lập tức bị phơi bày, khiến toàn bộ thiết bị bị xâm phạm. Đối với các sản phẩm mission-critical, đây là một lỗ hổng không thể chấp nhận được.

Cuốn sách này là hướng dẫn kỹ thuật toàn diện giúp bạn vượt ra ngoài các biện pháp bảo mật truyền thống để xây dựng một hệ thống mà ở đó tính toàn vẹn và các bí mật là root-proof. Mục tiêu là trang bị cho bạn khả năng đưa ra những sản phẩm có một Chain-of-Trust có thể chứng minh được, không thể bị xâm phạm, cùng với cơ chế bảo vệ encryption key an toàn.

## Cuốn sách này đề cập đến những gì

Cuốn sách bắt đầu bằng việc trình bày cách tận dụng **Linux Key-Management Facility (Keyring)** để quản lý những dữ liệu mật mã nhạy cảm nhất, niêm phong (seal) các key để chúng không thể bị đọc hoặc bị lộ, ngay cả khi kẻ tấn công đã giành được toàn quyền root. Các key tiêu chuẩn trong Linux sẽ được giới thiệu, nhưng các giải pháp quản lý key vendor-specific với những tính năng thú vị cũng sẽ được xem xét. Sau đó, sách sẽ minh họa một số cách dùng điển hình của các key này cho secure boot.

Tiếp theo, sách sẽ mô tả chi tiết secure boot là gì (và không phải là gì), mô tả cách **Chain-of-Trust** hoạt động và một chuỗi secure boot nên trông như thế nào. Không chỉ vậy, sách còn phân tích các vấn đề liên quan đến việc sản xuất hệ thống mới, cũng như cách phân phối các bản cập nhật trong khi vẫn luôn tuân thủ những gì một hệ thống secure boot tốt cần làm.

Mặc dù việc triển khai secure boot mang tính vendor-specific rất cao, phần cuối của cuốn sách này sẽ cố gắng minh họa, theo cách tổng quát nhất có thể, các bản triển khai real-world có thể hoạt động như thế nào: một theo schema **Rescue boot** và một theo schema **A/B boot**.

Như một phần bổ sung cuối cùng, cuốn sách cũng sẽ trình bày một số ý tưởng về cách một hệ thống chống can thiệp (tamper prevention) tốt khi làm việc cùng Secure Boot nên hoạt động, cùng một số cân nhắc về việc quản lý environment của bootloader.

Dưới đây là phần giới thiệu ngắn về từng chương:

- *Chương* [1](ch01_linux_cryptography.vi.md)*—Mật mã học trong Linux*: Chương này đóng vai trò lớp nền tảng, giải thích cách cryptographic subsystem của Linux kernel hoạt động. Chương giới thiệu sự khác biệt giữa **signature key** (dùng để xác minh tính toàn vẹn và tính xác thực, là trung tâm của Secure Boot) và **encryption key** (dùng cho tính bảo mật), rồi trình bày **Linux Key-Management Facility (Keyring)**—kho lưu trữ an toàn cho các cryptographic key bên trong kernel. Chương giải thích in-depth về user key, trusted key, v.v., nêu chi tiết cách chúng được tích hợp với phần cứng (ví dụ như TPM, OPTEE và các thiết bị bảo mật khác) để ngăn key bị lộ ngay cả khi kẻ tấn công giành được quyền root. Người đọc sẽ học các bước thực hành và những tương tác với kernel cần thiết để lưu trữ, quản lý và sử dụng các bí mật theo cách khiến chúng không thể bị truy cập bởi các tiến trình user-space đã bị xâm phạm.
- *Chương* [2](ch02_what_secure_boot_is_and_what_it_is_not.vi.md)*—Secure Boot là gì (và KHÔNG phải là gì)*: Đây là một chương then chốt, tập trung vào cơ chế cốt lõi để đạt được bảo mật root-proof thông qua cơ chế Secure Boot. Chương trình bày chi tiết khái niệm **Chain-of-Trust** và cho thấy nó hoạt động như thế nào ở từng bước của quá trình boot đối với một hệ thống Linux-based. Chương này cũng giải thích các quy trình sản xuất tại nhà máy và cập nhật hệ thống nên được triển khai như thế nào để tương thích với các yêu cầu của Chain-of-Trust.
- *Chương* [3](ch03_real_implementations.vi.md)*—Các bản triển khai thực tế*: Chương này trình bày một bản triển khai thực tế của Chain-of-Trust trong hai kịch bản khác nhau: schema **Rescue** (khi chúng ta cần một cách đáng tin cậy để khôi phục trạng thái xuất xưởng) và schema **A/B** (khi chúng ta cần cập nhật hệ thống trong lúc nó đang chạy). Chương giải thích một lần boot bình thường hoạt động ra sao, việc sản xuất tại nhà máy có thể hoạt động ra sao, và việc cập nhật hệ thống có thể được triển khai ra sao trong cả hai trường hợp.
- *Chương* [4](ch04_final_considerations.vi.md)*—Những cân nhắc cuối cùng*: Chương này đưa ra các ví dụ thực hành về việc tạo ra encryption key và signing key một cách hiệu quả cho hai dòng CPU real-world cụ thể (dòng i.MX và STM32MP1), vốn dùng hai cơ chế khác nhau để lưu trữ các bí mật của hệ thống: **cách tiếp cận Fuse-Centric và Hybrid**, cùng với phần thảo luận về những vấn đề license tiềm ẩn mà developer có thể gặp phải khi thiết kế một hệ thống an toàn.

Sau đó là phần giới thiệu ngắn về các phụ lục:

- *Phụ lục A: Ghi chú về phát hiện can thiệp (Tamper Detection)*: Mặc dù tamper detection không phải là một phần của secure boot, nó chắc chắn có liên hệ chặt chẽ với secure boot. Thực tế, các CPU hỗ trợ tính năng này thường dừng chuỗi boot khi xảy ra một sự kiện can thiệp (và tất cả các key đều bị xóa trắng). Đó là lý do chúng tôi thêm phụ lục này, trong đó chúng tôi sẽ trình bày một số ý tưởng về cách một **tamper event** nên được xử lý bên trong secure boot.
- *Phụ lục B: Bảo vệ các bí mật qua các giai đoạn boot*: Trong phụ lục này, chúng tôi sẽ trình bày một số vấn đề có thể gặp liên quan đến **U-Boot environment**, vốn là một vùng memory dạng văn bản thuần có thể tương tác với các giai đoạn tiếp theo (chẳng hạn như kernel hoặc các ứng dụng user space). Do bản chất không an toàn của nó, nếu không được quản lý đúng cách, nó có thể bị lợi dụng để khai thác Chain-of-Trust.

## Bạn sẽ học được gì

Khi đọc xong cuốn sách này, bạn sẽ có được kiến thức kỹ thuật nâng cao và các kỹ năng thực hành để thiết kế, triển khai và duy trì một hệ thống embedded Linux high-assurance và an toàn. Cụ thể, bạn sẽ học cách

- *Sử dụng Linux Key-Management Facility (Keyring)*: Học cách triển khai và quản lý các bí mật mật mã bằng Keyring an toàn của kernel, bảo đảm các key không thể bị truy cập bởi các tiến trình user space, kể cả những tiến trình có quyền root.
- *Sử dụng Linux Crypto API*: Hiểu và sử dụng cryptographic subsystem của kernel thông qua các interface như socket AF_ALG cho các thao tác hashing, ký và mã hóa an toàn, với khả năng tăng tốc bằng phần cứng.
- *Thiết lập một Chain-of-Trust không thể phá vỡ*: Triển khai một cách tỉ mỉ một Chain-of-Trust xác minh tính toàn vẹn và tính xác thực của mọi thành phần hệ thống, từ Root-of-Trust phần cứng ban đầu và pre-bootloader (ví dụ U-Boot SPL) cho đến bước nạp Linux kernel cuối cùng.
- *Đạt được Full-Disk Encryption trong suốt*: Tích hợp Keyring an toàn với các công nghệ như dm-crypt để mã hóa root filesystem, bảo đảm tính bảo mật dữ liệu cho toàn bộ hệ điều hành trong khi các key được quản lý an toàn ở cấp kernel.
- *Hiểu chính xác bản triển khai Linux Secure Boot là gì*: Điều này cho phép bạn thiết kế đúng cách các biện pháp phòng thủ trước những mối đe dọa tinh vi như bootkit tồn tại lâu dài và việc chèn code độc hại.

Được viết cho các developer embedded Linux giàu kinh nghiệm và các security architect, cuốn sách này không chỉ là một bản tổng quan—nó là một cẩm nang kỹ thuật. Bằng cách làm chủ các kỹ thuật ở cấp phần cứng low-level, ở cấp bootloader và các kỹ thuật kernel-centric được trình bày chi tiết trong những trang sách này, bạn sẽ được trang bị để xây dựng các sản phẩm Linux-based có khả năng chống chịu trước những bootkit tinh vi nhất và việc thực thi code trái phép.

## Bạn cần gì cho cuốn sách này

Sau đây là các điều kiện tiên quyết để việc học đạt hiệu quả.

### Điều kiện tiên quyết về software

Về software, bạn cần biết ngôn ngữ C và có một số kỹ năng về Bash và Python.

Phần lớn các ví dụ được thực hiện trên Ubuntu 22.04, nhưng bạn cũng có thể dùng một phiên bản Ubuntu Long-Term Support (LTS) mới hơn hoặc một hệ thống Debian-based với ít chỉnh sửa. Ngoài ra, bạn có thể dùng một bản phân phối GNU/Linux khác, nhưng sẽ cần bạn bỏ ra một chút công sức, chủ yếu liên quan đến việc cài đặt các công cụ cần thiết, các phụ thuộc thư viện và việc quản lý package. Các ví dụ thực hành được thực hiện trên hệ thống embedded đã được triển khai cho Yocto Scarthgap, nhưng bạn có thể dùng bất kỳ release nào mới hơn.

Các hệ thống ngoài như Windows, macOS hoặc tương tự không được đề cập trong cuốn sách này.

### Điều kiện tiên quyết về hardware

Trong cuốn sách này, chúng tôi đã dùng cả một máy PC-x86 thông thường 64 bit để build code và ba hệ thống embedded dựa trên các CPU iMX8 (có trang bị thiết bị CAAM), iMX9 và STM32MP1; tuy nhiên, bạn có thể dùng một bộ kit embedded khác có Yocto (hoặc một bản phân phối embedded phù hợp) để tái hiện những gì có trong sách (dĩ nhiên là trừ khi cần đến CAAM; trong những trường hợp đó, bạn phải dùng một CPU CAAM-equipped).

## Quy ước

Trong cuốn sách này, bạn sẽ gặp nhiều kiểu chữ dùng để phân biệt các loại thông tin khác nhau. Dưới đây là một số ví dụ về các kiểu chữ này và giải thích ý nghĩa của chúng.

### Output dài, code và dòng lệnh

Khi cần trình bày một phần của output dài (hoặc nội dung file), tôi có thể cắt bớt phần văn bản non-relevant bằng cách thay nó bằng ba dấu chấm, để nguyên phần nội dung quan trọng, như trong ví dụ dưới đây:

```
$ cat very_long_file.txt
Line 1
Line 2
Line 3
...
Line 999
Line 1000
...
```

Trong output ở trên, các dòng sau `Line 3` cho đến `Line 999` đã bị cắt bớt, cũng như các dòng sau `Line 1000`.

Các từ thuộc code trong văn bản, tên thư mục, tên file, phần mở rộng file, đường dẫn, URL giả và dữ liệu người dùng nhập vào được trình bày như sau: “Để xem các thông điệp kernel ở trên, chúng ta có thể dùng cả hai lệnh `dmesg` và `tail -f /var/ log/kern.log`.”

Một khối code được trình bày như sau:

```
#include <stdio.h>
int main(int argc, char *argv[])
{
        printf("Hello World!\n");
        return 0;
}
```

trong đó phần thụt lề có thể gồm tám hoặc bốn dấu cách để dễ đọc nhất.

Mọi dòng lệnh—trong cả hai trường hợp, dù tôi cần chạy một lệnh có đặc quyền hay một lệnh non-privileged—đều được viết như sau:

```
$ cat /etc/lsb-release
```

Lý do là điều kiện này có thể thay đổi. Bạn nên chạy lệnh phù hợp với tư cách người dùng root hoặc thông qua `sudo` khi hệ thống của bạn yêu cầu.

Cũng lưu ý rằng vì lý do giới hạn không gian trong sách, bạn có thể gặp những dòng lệnh rất dài như sau:

```
$ echo "Very secret message" | openssl enc -aes-256-cbc -e -K 0123
456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef -iv 0
123456789abcdef0123456789abcdef > /tmp/secret.enc
```

Tuy nhiên, nói chung, để dễ đọc hơn, tôi sẽ ngắt dòng lệnh như dưới đây:

```
$ echo "Very secret message" | \
    openssl enc -aes-256-cbc -e \
    -K 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef \
    -iv 0123456789abcdef0123456789abcdef > /tmp/secret.enc
```

Tuy nhiên, trong một số trường hợp đặc biệt, bạn có thể gặp các dòng output bị ngắt như sau:

```
$ openssl dgst -sha256 < /tmp/id.txt
SHA2-256(stdin)= 5e2ea0c72053ce80c13549b2c6e3365098d5bc61015b39908c78709
0f70189d9
```

Đáng tiếc là những dòng này không thể dễ dàng được thể hiện trong một cuốn sách in, vì vậy bạn nên coi chúng như một dòng duy nhất.

## Các quy ước khác

Thuật ngữ mới và các từ quan trọng được trình bày bằng chữ **in đậm** hoặc *in nghiêng*. Những chữ bạn thấy trên màn hình, ví dụ trong menu hoặc hộp thoại, xuất hiện trong văn bản như thế này: `Clicking the Next button moves you to the next screen string`.

Các cảnh báo hoặc ghi chú quan trọng xuất hiện trong một khung như thế này:

> **Các mẹo và thủ thuật xuất hiện như thế này.**
