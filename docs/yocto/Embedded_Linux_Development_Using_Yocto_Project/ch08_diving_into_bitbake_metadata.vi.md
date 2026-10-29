# Chương 8: Đi sâu vào metadata của BitBake (Diving into BitBake Metadata)

Đến thời điểm này của cuốn sách, chúng ta đã biết cách tạo image và package cũng như cách dùng package feed – về cơ bản, mọi thứ chúng ta phải biết để dùng Poky ở mức đơn giản. Từ đây, chúng ta sẽ học cách điều khiển hành vi của Poky để hoàn thành mục tiêu của mình và đạt được lợi ích tối đa từ Yocto Project nói chung.

Chương này sẽ giúp nâng cao hiểu biết của chúng ta về cú pháp metadata của BitBake. Chúng ta sẽ học cách dùng các toán tử của BitBake để thay đổi nội dung của biến, mở rộng biến, v.v. Đây là những khái niệm then chốt mà chúng ta có thể dùng để tạo các recipe của mình và thực hiện việc tùy chỉnh mà chúng ta sẽ học trong các chương tiếp theo.

## Tìm hiểu metadata của BitBake

Lượng metadata mà BitBake sử dụng là rất lớn. Vì vậy, để có được lợi ích tối đa từ Poky, chúng ta phải nắm vững nó. Như đã học trong *Chương 4*, *Làm quen với công cụ BitBake*, metadata bao gồm ba lĩnh vực chính:

- **Cấu hình** (các file `.conf`): Các file cấu hình định nghĩa nội dung toàn cục để cấu hình cách các class và recipe sẽ hoạt động.
- **Class** (các file `.bbclass`): Class có thể được kế thừa để bảo trì dễ dàng hơn, thúc đẩy việc dùng lại code và tránh trùng lặp code.
- **Recipe** (các file `.bb` hoặc `.bbappend`): Các recipe mô tả những task cần chạy và cung cấp thông tin cần thiết để BitBake có thể tạo ra chuỗi task cần thiết. Chúng là loại metadata được dùng phổ biến nhất, vì chúng định nghĩa các biến và task cho recipe. Các loại recipe phổ biến nhất tạo ra package và image.

Các class và recipe dùng code hỗn hợp Python và Shell Script, được BitBake parse, tạo ra một số lượng khổng lồ các task và trạng thái cục bộ vẫn phải được thực thi sau khi parse.

Chúng ta cũng sẽ học về các toán tử và khái niệm thiết yếu mà chúng ta cần để build các recipe của mình.

### Làm việc với metadata

Cú pháp mà metadata của BitBake sử dụng có thể gây hiểu nhầm và đôi khi khó lần theo. Tuy nhiên, chúng ta có thể kiểm tra giá trị của từng biến trong dữ liệu recipe BitBake-generated, pre-processed bằng tùy chọn của `bitbake` (`-e` hoặc `--environment`), như sau:

![](images/Figure_8.01_B19361.jpg)

*Hình 8.1 – Cách hiển thị môi trường BitBake*

Để hiểu cách BitBake hoạt động, hãy tham khảo *BitBake User Manual* ([https://docs.yoctoproject.org/bitbake/2.0](https://docs.yoctoproject.org/bitbake/2.0)). Các phần sau sẽ trình bày phần lớn cú pháp thường được dùng trong recipe.

#### Phép gán biến cơ bản

Việc gán một biến có thể được thực hiện như sau:

![](images/Figure_8.02_B19361.jpg)

*Hình 8.2 – Một ví dụ về phép gán biến*

Trong ví dụ trên, giá trị của biến `FOO` được gán là `bar`. Phép gán biến là cốt lõi của cú pháp metadata BitBake, vì hầu hết các ví dụ đều dùng biến.

#### Mở rộng biến

BitBake hỗ trợ tham chiếu biến. Cú pháp rất giống Shell Script, như sau:

![](images/Figure_8.03_B19361.jpg)

*Hình 8.3 – Một ví dụ về mở rộng biến*

Ví dụ trên cho kết quả `A` chứa `aValue` và `B` chứa `before-aValue-after`. Một điều quan trọng cần ghi nhớ là biến chỉ được mở rộng khi nó được dùng, như sau:

![](images/Figure_8.04_B19361.jpg)

*Hình 8.4 – Các biến chỉ được mở rộng khi được dùng*

*Hình 8.4* minh họa *lazy evaluation* được dùng trong việc đánh giá của BitBake. Giá trị của biến `B` là `before-${A}-after` cho đến khi một task cần giá trị của biến. Biến `A` đã được gán là `aNewValue` ở dòng 3; do đó, `B` được đánh giá thành `before-aNewValue-after`.

#### Gán giá trị nếu biến chưa được gán, dùng ?=

Khi cần gán một biến chỉ khi biến đó vẫn chưa được gán, có thể dùng toán tử `?=`. Đoạn code sau cho thấy cách dùng nó:

![](images/Figure_8.05_B19361.jpg)

*Hình 8.5 – Một ví dụ về giá trị* *(ghi chú: caption trong sách bị thiếu chữ)*

Hành vi tương tự xảy ra nếu có nhiều phép gán `?=` cho cùng một biến. Lần dùng đầu tiên của toán tử `?=` chịu trách nhiệm gán biến. Hãy xem ví dụ sau:

![](images/Figure_8.06_B19361.jpg)

*Hình 8.6 – Một ví dụ về phép gán thứ hai bị bỏ qua*

Biến `A` đã được gán là `value` ở dòng 1, trước phép gán `ignoredAsAlreadyAssigned` ở dòng 2, phép gán này bị bỏ qua.

Chúng ta cần lưu ý rằng toán tử `=` mạnh hơn toán tử `?=`, vì nó gán giá trị bất kể trạng thái trước đó của biến, như sau:

![](images/Figure_8.07_B19361.jpg)

*Hình 8.7 – Một ví dụ cho thấy toán tử ?= yếu hơn toán tử =*

Do đó, biến `A` được gán là `changeValue`.

#### Gán giá trị mặc định dùng ??=

Việc dùng toán tử `??=` nhằm cung cấp một giá trị mặc định cho một biến và là một phiên bản yếu hơn của toán tử `?=`.

Hãy xem đoạn code sau:

![](images/Figure_8.08_B19361.jpg)

*Hình 8.8 – Một ví dụ về cách gán giá trị mặc định*

Ở dòng 1, giá trị mặc định của `A` được gán là `firstValue`, rồi ở dòng 2, giá trị mặc định của `A` được đổi thành `secondValue`. Vì không có phép gán nào khác cho biến `A`, giá trị cuối cùng là `secondValue`.

`?=` là một toán tử gán, như đã thấy trước đó, và được ưu tiên hơn toán tử `??=`, như có thể thấy trong ví dụ sau:

![](images/Figure_8.09_B19361.jpg)

*Hình 8.9 – Một ví dụ về toán tử ??= yếu hơn toán tử ?=*

Giá trị cuối cùng của biến `A` là `thirdValue`, vì không có phép gán nào được thực hiện cho đến dòng 3.

#### Mở rộng biến tức thời

Toán tử `:=` được dùng khi cần buộc một biến được mở rộng ngay lập tức. Nó khiến nội dung của biến được mở rộng ngay lập tức thay vì khi biến được dùng, như sau:

![](images/Figure_8.10_B19361.jpg)

*Hình 8.10 – Một ví dụ về mở rộng biến tức thời*

Giá trị của `B` được gán ngay lập tức, ở dòng 2, và mở rộng thành `aValue-after`. Tuy nhiên, giá trị của `C` chỉ được gán khi được dùng và khi đó được đặt thành `newValue`, vì giá trị `A` đã được đặt ở dòng 3.

#### Append và prepend danh sách

Toán tử `+=`, được gọi là *list appending*, thêm một giá trị mới vào sau giá trị ban đầu, phân cách bằng một dấu cách, như sau:

![](images/Figure_8.11_B19361.jpg)

*Hình 8.11 – Một ví dụ về list appending*

Trong ví dụ này, giá trị cuối cùng của `A` là `originalValue appendedValue`.

Toán tử `=+`, được gọi là *list prepending*, thêm một giá trị mới vào trước giá trị ban đầu, phân cách bằng một dấu cách, như sau:

![](images/Figure_8.12_B19361.jpg)

*Hình 8.12 – Một ví dụ về list prepending*

Trong ví dụ này, giá trị cuối cùng của `A` là `prependedValue originalValue`.

#### Append và prepend chuỗi

Toán tử `.=`, được gọi là *string appending*, thêm một giá trị mới vào sau giá trị ban đầu, không có dấu cách thêm, như sau:

![](images/Figure_8.13_B19361.jpg)

*Hình 8.13 – Một ví dụ về string appending*

Trong ví dụ này, giá trị cuối cùng của `A` là `originalValueAppendedValue`.

Toán tử `=.`, được gọi là *string prepending*, thêm giá trị mới vào trước giá trị ban đầu, không có dấu cách thêm, như sau:

![](images/Figure_8.14_B19361.jpg)

*Hình 8.14 – Một ví dụ về string prepending*

Trong ví dụ này, giá trị cuối cùng của `A` là `prependedValueOriginalValue`.

#### Các toán tử :append và :prepend

Toán tử `:append` thêm một giá trị mới vào sau giá trị ban đầu, không có dấu cách thêm, như sau:

![](images/Figure_8.15_B19361.jpg)

*Hình 8.15 – Một ví dụ về cách dùng toán tử :append*

Trong ví dụ này, giá trị cuối cùng của `A` là `originalValueAppendedValue`.

Toán tử `:prepend` thêm giá trị mới vào trước giá trị ban đầu, không có dấu cách thêm, như sau:

![](images/Figure_8.16_B19361.jpg)

*Hình 8.16 – Một ví dụ về cách dùng toán tử :prepend*

Trong ví dụ này, giá trị cuối cùng của `A` là `prependedValueOriginalValue`.

Có thể bạn đã nhận thấy rằng các toán tử `:append` và `:prepend` giống với các toán tử string appending (`.=`) và prepending (`=.`). Tuy vậy, có một khác biệt tinh tế giữa cách các toán tử `:append` và `:prepend` và các toán tử string appending và string prepending được parse, như sau:

![](images/Figure_8.17_B19361.jpg)

*Hình 8.17 – Một ví dụ về khác biệt giữa :append và toán tử .=*

Dùng toán tử `:append` sẽ xếp thao tác vào hàng đợi để thực thi, việc này xảy ra sau phép gán ở *dòng 2*, khiến `A` trở thành `valueAppendedValue`. Toán tử `.=` có tác dụng ngay lập tức, nên phép gán ở *dòng 4* thay thế giá trị được đặt ở *dòng 3*, khiến `B` trở thành `value`.

#### Xóa phần tử khỏi danh sách

Toán tử `:remove` loại bỏ một phần tử danh sách khỏi nội dung ban đầu. Ví dụ, hãy xem như sau:

![](images/Figure_8.18_B19361.jpg)

*Hình 8.18 – Một ví dụ về cách dùng toán tử :remove*

Trong ví dụ này, `A` giờ là `value1 value3`. Toán tử `:remove` coi giá trị của biến là một danh sách các chuỗi phân cách bằng dấu cách, nhờ đó toán tử có thể xóa một hoặc nhiều phần tử khỏi danh sách. Lưu ý rằng mọi thao tác append và prepend đều đã hoàn tất khi `:remove` được thực thi.

#### Các tập metadata có điều kiện

BitBake cung cấp một cách easy-to-use để viết metadata có điều kiện thông qua một cơ chế gọi là **override**.

Biến `OVERRIDES` chứa các giá trị phân cách bằng dấu hai chấm (`:`) và được đánh giá từ trái sang phải. Mỗi giá trị là một mục mà chúng ta muốn có metadata có điều kiện.

Hãy xem ví dụ tiếp theo:

![](images/Figure_8.19_B19361.jpg)

*Hình 8.19 – Một ví dụ về biến OVERRIDES*

Override `linux` kém cụ thể hơn `arm` và `mymachine`. Ví dụ sau cho thấy cách chúng ta có thể dùng `OVERRIDES` để đặt biến `A` một cách có điều kiện:

![](images/Figure_8.20_B19361.jpg)

*Hình 8.20 – Một ví dụ về việc dùng OVERRIDES để đặt giá trị có điều kiện*

Trong ví dụ này, `A` sẽ là `linuxSpecificValue`, do điều kiện `linux` có trong `OVERRIDES`.

#### Append có điều kiện

BitBake cũng hỗ trợ append và prepend biến, dựa trên việc một thứ gì đó có nằm trong `OVERRIDES` hay không, như trong ví dụ sau:

![](images/Figure_8.21_B19361.jpg)

*Hình 8.21 – Một ví dụ về việc dùng OVERRIDES để append có điều kiện*

Trong ví dụ trên, `A` được đặt thành `value armValue`.

#### Include file

BitBake cung cấp hai directive để include file – `include` và `require`.

Với từ khóa `include`, BitBake cố gắng chèn file tại vị trí của từ khóa, vì vậy nó là tùy chọn. Giả sử đường dẫn được chỉ định trên dòng `include` là đường dẫn tương đối; khi đó, BitBake định vị instance đầu tiên mà nó có thể tìm thấy trong `BBPATH`. Ngược lại, từ khóa `require` báo lỗi `ParseError` nếu không thể tìm thấy file được yêu cầu.

> **Mẹo**
>
> Quy ước thường được áp dụng trong Yocto Project là dùng một file `.inc` để chia sẻ code chung giữa hai hoặc nhiều file recipe.

#### Mở rộng biến bằng Python

BitBake giúp việc dùng code Python trong mở rộng biến trở nên dễ dàng với cú pháp sau:

![](images/Figure_8.22_B19361.jpg)

*Hình 8.22 – Một ví dụ về cú pháp mở rộng Python*

Điều này mang lại sự linh hoạt to lớn cho người dùng. Chúng ta có thể thấy một lời gọi hàm Python trong ví dụ sau:

![](images/Figure_8.23_B19361.jpg)

*Hình 8.23 – Một ví dụ về lệnh Python để in ngày hiện tại*

Kết quả là biến `A` chứa ngày hôm nay.

#### Định nghĩa metadata thực thi được

Các metadata recipe (`.bb`) và file class (`.bbclass`) có thể dùng code Shell Script, như sau:

![](images/Figure_8.24_B19361.jpg)

*Hình 8.24 – Một ví dụ về định nghĩa task*

Việc định nghĩa task giống hệt việc đặt một biến, ngoại trừ việc biến này lại là code Shell Script thực thi được. Khi viết code task, chúng ta không nên dùng các tính năng Bash hoặc Zsh-specific, vì các task chỉ có thể dựa vào các tính năng POSIX-compatible. Khi còn nghi ngờ, một cách tuyệt vời để kiểm tra code của bạn có an toàn hay không là dùng Dash shell để thử nó.

Một cách khác để chèn code là dùng code Python, như sau:

![](images/Figure_8.25_B19361.jpg)

*Hình 8.25 – Một ví dụ về định nghĩa task Python*

Việc định nghĩa task là tương tự, nhưng nó đánh dấu task là Python để BitBake biết cách chạy nó cho phù hợp.

#### Định nghĩa hàm Python trong namespace toàn cục

Khi cần tạo một giá trị cho một biến hoặc cho mục đích khác, việc này có thể được thực hiện nhanh chóng trong các recipe (`.bb`) và class (`.bbclass`) bằng code tương tự như sau:

![](images/Figure_8.26_B19361.jpg)

*Hình 8.26 – Một ví dụ code xử lý giá trị biến trong code Python*

Thông thường, chúng ta cần truy cập datastore của BitBake khi viết một hàm Python. Vì vậy, một quy ước chung trong toàn bộ metadata là dùng một đối số tên là `d` để trỏ tới datastore của BitBake. Nó thường nằm ở tham số cuối cùng của hàm.

Trong *Hình 8.26*, chúng ta hỏi datastore giá trị của biến `SOMECONDITION` ở dòng 2 và trả về một giá trị tùy theo nó.

Ví dụ này cho kết quả là giá trị của biến `DEPENDS` chứa `dependencyWithConditon` *(ghi chú: đúng là `dependencyWithCondition`)*.

#### Hệ thống kế thừa

Directive `inherit` chỉ định những class chức năng nào mà recipe (`.bb`) của chúng ta cung cấp một cơ chế kế thừa sơ khai *(ghi chú: câu trong sách bị ghép sai ngữ pháp; bản dịch dịch sát câu gốc)*, giống như các ngôn ngữ lập trình object-oriented. Ví dụ, chúng ta có thể trừu tượng hóa các task liên quan đến việc dùng các công cụ build Autoconf và Automake và đưa chúng vào class để các recipe của chúng ta dùng lại. Một `.bbclass` cho trước được định vị bằng cách tìm `classes/filename.bbclass` trong `BBPATH`. Vì vậy, trong một recipe dùng Autoconf hoặc Automake, chúng ta có thể dùng như sau:

![](images/Figure_8.27_B19361.jpg)

*Hình 8.27 – Một ví dụ về cách kế thừa một class*

Dòng 1 trong *Hình 8.27* chỉ thị BitBake dùng `inherit autotools.bbclass`, cung cấp các task mặc định hoạt động tốt cho hầu hết các project Autoconf- hoặc Automake-based.

## Tóm tắt

Trong chương này, chúng ta đã học chi tiết về cú pháp metadata của BitBake, các toán tử của nó để thao tác nội dung biến, và mở rộng biến, kèm theo một số ví dụ sử dụng.

Trong chương tiếp theo, chúng ta sẽ học cách dùng Poky để tạo các công cụ compile bên ngoài và tạo ra một `root` filesystem phù hợp cho việc phát triển trên target.
