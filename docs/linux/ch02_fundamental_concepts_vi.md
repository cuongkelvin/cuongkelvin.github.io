#### Chương 2
### **CÁC KHÁI NIỆM CƠ BẢN**

Chương này giới thiệu một loạt các khái niệm liên quan đến lập trình hệ thống Linux. Chương này dành cho những người đọc chủ yếu làm việc với các hệ điều hành khác, hoặc những người mới chỉ có kinh nghiệm hạn chế với Linux hoặc một bản thực thi UNIX khác.

#### **2.1 Hệ điều hành cốt lõi: Kernel**

Thuật ngữ hệ điều hành (operating system) thường được sử dụng với hai nghĩa khác nhau:
* Chỉ toàn bộ gói phần mềm bao gồm phần mềm trung tâm quản lý tài nguyên của máy tính và tất cả các công cụ phần mềm chuẩn đi kèm, chẳng hạn như trình thông dịch dòng lệnh (command-line interpreters), giao diện người dùng đồ họa (graphical user interfaces), các tiện ích file, và các trình soạn thảo (editors).
* Nghĩa hẹp hơn, chỉ phần mềm trung tâm quản lý và phân bổ tài nguyên máy tính (tức là CPU, RAM, và các thiết bị).

Thuật ngữ kernel thường được sử dụng như một từ đồng nghĩa với nghĩa thứ hai, và chính với nghĩa này của thuật ngữ hệ điều hành mà chúng ta quan tâm trong cuốn sách này.

Mặc dù có thể chạy các chương trình trên máy tính mà không cần kernel, sự có mặt của kernel giúp đơn giản hóa đáng kể việc viết và sử dụng các chương trình khác, đồng thời tăng sức mạnh và tính linh hoạt cho các lập trình viên. Kernel thực hiện điều này bằng cách cung cấp một lớp phần mềm để quản lý các tài nguyên có hạn của máy tính.

File thực thi của Linux kernel thường nằm tại đường dẫn `/boot/vmlinuz`, hoặc một tên tương tự. Nguồn gốc của tên file này mang tính lịch sử. Trên các bản thực thi UNIX sớm, kernel được gọi là `unix`. Các bản thực thi UNIX sau này, có triển khai bộ nhớ ảo (virtual memory), đã đổi tên kernel thành `vmunix`. Trên Linux, tên file phản ánh tên hệ thống, với chữ `z` thay thế cho chữ `x` cuối cùng để biểu thị rằng kernel là một file thực thi nén (compressed executable).

#### **Các nhiệm vụ do kernel thực hiện**

Cùng với những việc khác, kernel thực hiện các nhiệm vụ sau:
* **Lập lịch tiến trình (Process scheduling)**: Một máy tính có một hoặc nhiều đơn vị xử lý trung tâm (CPU), giúp thực thi các chỉ thị của chương trình. Giống như các hệ thống UNIX khác, Linux là một hệ điều hành đa nhiệm chiếm hữu (preemptive multitasking operating system). Đa nhiệm (multitasking) có nghĩa là nhiều tiến trình (tức là các chương trình đang chạy) có thể đồng thời nằm trong bộ nhớ và mỗi tiến trình có thể nhận được sự sử dụng của (các) CPU. Định thời/Chiếm hữu (preemptive) có nghĩa là các quy tắc quyết định tiến trình nào nhận được sự sử dụng CPU và trong bao lâu được xác định bởi bộ lập lịch tiến trình của kernel (kernel process scheduler) (chuyển vì chính các tiến trình tự quyết định).
* **Quản lý bộ nhớ (Memory management)**: Mặc dù bộ nhớ máy tính rất khổng lồ so với tiêu chuẩn của một hoặc hai thập kỷ trước, kích thước của phần mềm cũng tăng lên tương ứng, do đó bộ nhớ vật lý (RAM) vẫn là một tài nguyên có hạn mà kernel phải chia sẻ giữa các tiến trình một cách công bằng và hiệu quả. Giống như hầu hết các hệ điều hành hiện đại, Linux sử dụng quản lý bộ nhớ ảo (virtual memory management) (Mục 6.4), một kỹ thuật mang lại hai ưu điểm chính:
  * Các tiến trình được cô lập lẫn nhau và cô lập với kernel, do đó một tiến trình không thể đọc hoặc sửa đổi bộ nhớ của một tiến trình khác hoặc của kernel.
  * Chỉ một phần của tiến trình cần được giữ trong bộ nhớ, nhờ đó giảm yêu cầu bộ nhớ của mỗi tiến trình và cho phép giữ nhiều tiến trình trong RAM đồng thời hơn. Điều này dẫn đến việc sử dụng CPU tốt hơn, vì nó làm tăng khả năng tại bất kỳ thời điểm nào cũng có ít nhất một tiến trình mà (các) CPU có thể thực thi.
* **Cung cấp một file system**: Kernel cung cấp một file system trên đĩa, cho phép các file được tạo, truy xuất, cập nhật, xóa, v.v.
* **Tạo và kết thúc các tiến trình**: Kernel có thể tải một chương trình mới vào bộ nhớ, cung cấp cho nó các tài nguyên (ví dụ: CPU, bộ nhớ, và quyền truy cập file) mà nó cần để chạy. Một thể hiện (instance) của một chương trình đang chạy như vậy được gọi là một tiến trình (process). Khi một tiến trình đã hoàn thành thực thi, kernel đảm bảo rằng các tài nguyên mà nó sử dụng được giải phóng để tái sử dụng cho các chương trình sau này.
* **Truy cập vào các thiết bị**: Các thiết bị (chuột, màn hình, bàn phím, ổ đĩa và băng từ, v.v.) kết nối với máy tính cho phép truyền thông tin giữa máy tính và thế giới bên ngoài, cho phép đầu vào (input), đầu ra (output), hoặc cả hai. Kernel cung cấp cho các chương trình một giao diện chuẩn hóa và đơn giản hóa việc truy cập vào thiết bị, đồng thời phân xử quyền truy cập của nhiều tiến trình vào từng thiết bị.
* **Mạng (Networking)**: Kernel truyền và nhận các tin nhắn mạng (packets) thay mặt cho các tiến trình người dùng. Nhiệm vụ này bao gồm việc định tuyến các gói tin mạng đến hệ thống đích.
* **Cung cấp giao diện lập trình ứng dụng system call (API)**: Các tiến trình có thể yêu cầu kernel thực hiện các nhiệm vụ khác nhau bằng cách sử dụng các điểm vào kernel (kernel entry points) được gọi là system calls. API system call của Linux là chủ đề chính của cuốn sách này. Mục [3.1](#page-22-0) chi tiết các bước xảy ra khi một tiến trình thực hiện một system call.

Ngoài các tính năng trên, các hệ điều hành đa người dùng (multiuser) như Linux nhìn chung cung cấp cho người dùng trừu tượng về một máy tính riêng ảo (virtual private computer); nghĩa là mỗi người dùng có thể đăng nhập vào hệ thống và hoạt động phần lớn độc lập với những người dùng khác. Ví dụ, mỗi người dùng có không gian lưu trữ đĩa riêng (home directory). Ngoài ra, người dùng có thể chạy các chương trình, mỗi chương trình nhận được một phần CPU và hoạt động trong không gian địa chỉ ảo riêng, và các chương trình này có thể truy cập độc lập vào thiết bị và truyền thông tin qua mạng. Kernel giải quyết các xung đột tiềm ẩn trong việc truy cập tài nguyên phần cứng, do đó người dùng và tiến trình nói chung không nhận thức được các xung đột này.

#### **Chế độ kernel và chế độ user (Kernel mode và User mode)**

Các kiến trúc bộ xử lý hiện đại thường cho phép CPU hoạt động ở ít nhất hai chế độ khác nhau: user mode và kernel mode (đôi khi còn được gọi là supervisor mode). Các lệnh phần cứng cho phép chuyển đổi từ chế độ này sang chế độ khác. Tương ứng, các vùng bộ nhớ ảo có thể được đánh dấu là thuộc user space hoặc kernel space. Khi chạy ở user mode, CPU chỉ có thể truy cập bộ nhớ được đánh dấu là nằm trong user space; các nỗ lực truy cập bộ nhớ trong kernel space sẽ dẫn đến một ngoại lệ phần cứng (hardware exception). Khi chạy ở kernel mode, CPU có thể truy cập cả user space và kernel memory space.

Một số thao tác chỉ có thể được thực hiện khi bộ xử lý đang hoạt động ở kernel mode. Các ví dụ bao gồm thực thi lệnh `halt` để dừng hệ thống, truy cập phần cứng quản lý bộ nhớ, và khởi tạo các thao tác I/O thiết bị. Bằng cách tận dụng thiết kế phần cứng này để đặt hệ điều hành vào kernel space, các nhà triển khai hệ điều hành có thể đảm bảo rằng các tiến trình người dùng không thể truy cập các lệnh và cấu trúc dữ liệu của kernel, hoặc thực hiện các thao tác ảnh hưởng tiêu cực đến hoạt động của hệ thống.

###### **Góc nhìn tiến trình và góc nhìn kernel về hệ thống**

Trong nhiều nhiệm vụ lập trình hàng ngày, chúng ta quen với việc suy nghĩ về lập trình theo cách hướng tiến trình (process-oriented). Tuy nhiên, khi xem xét các chủ đề khác nhau được đề cập sau trong cuốn sách này, sẽ rất hữu ích nếu điều chỉnh lại góc nhìn của chúng ta để xem xét mọi thứ từ quan điểm của kernel. Để làm rõ sự tương phản, bây giờ chúng ta xem xét mọi thứ trông như thế nào trước tiên từ góc nhìn tiến trình và sau đó từ góc nhìn kernel.

Một hệ thống đang chạy thường có rất nhiều tiến trình. Đối với một tiến trình, nhiều thứ xảy ra bất đồng bộ (asynchronously). Một tiến trình đang thực thi không biết khi nào nó sẽ hết thời gian (time out) tiếp theo, tiến trình nào khác sau đó sẽ được lập lịch cho CPU (và theo thứ tự nào), hoặc khi nào nó sẽ được lập lịch tiếp theo. Việc chuyển giao các tín hiệu (signals) và sự xảy ra của các sự kiện giao tiếp giữa các tiến trình (IPC) được trung gian bởi kernel, và có thể xảy ra bất kỳ lúc nào đối với một tiến trình. Nhiều thứ xảy ra một cách trong suốt (transparently) đối với một tiến trình. Một tiến trình không biết nó nằm ở đâu trong RAM hoặc, nói chung, liệu một phần cụ thể của không gian bộ nhớ của nó hiện đang thường trú trong bộ nhớ hay được giữ trong vùng swap (một vùng không gian đĩa dự trữ được sử dụng để bổ sung cho RAM của máy tính). Tương tự như vậy, một tiến trình không biết các file mà nó truy cập nằm ở đâu trên ổ đĩa; nó chỉ đơn giản tham chiếu đến các file bằng tên. Một tiến trình hoạt động trong sự cô lập; nó không thể giao tiếp trực tiếp với một tiến trình khác. Bản thân một tiến trình không thể tự tạo ra một tiến trình mới hoặc thậm chí tự kết thúc sự tồn tại của chính nó. Cuối cùng, một tiến trình không thể giao tiếp trực tiếp với các thiết bị đầu vào và đầu ra gắn liền với máy tính.

Trái lại, một hệ thống đang chạy có một kernel biết và kiểm soát mọi thứ. Kernel tạo điều kiện cho việc chạy tất cả các tiến trình trên hệ thống. Kernel quyết định tiến trình nào tiếp theo sẽ nhận được quyền truy cập CPU, khi nào nó làm như vậy, và trong bao lâu. Kernel duy trì các cấu trúc dữ liệu chứa thông tin về tất cả các tiến trình đang chạy và cập nhật các cấu trúc này khi các tiến trình được tạo ra, thay đổi trạng thái, và kết thúc. Kernel duy trì tất cả các cấu trúc dữ liệu mức thấp cho phép tên file được sử dụng bởi các chương trình được dịch thành các vị trí vật lý trên đĩa. Kernel cũng duy trì các cấu trúc dữ liệu ánh xạ bộ nhớ ảo của từng tiến trình vào bộ nhớ vật lý của máy tính và (các) vùng swap trên đĩa. Tất cả giao tiếp giữa các tiến trình được thực hiện thông qua các cơ chế do kernel cung cấp. Để phản hồi các yêu cầu từ tiến trình, kernel tạo ra các tiến trình mới và kết thúc các tiến trình hiện có. Cuối cùng, kernel (đặc biệt là các device driver) thực hiện tất cả giao tiếp trực tiếp với các thiết bị đầu vào và đầu ra, truyền thông tin đến và đi từ các tiến trình người dùng theo yêu cầu.

Sau này trong cuốn sách này, chúng ta sẽ nói những câu như "một tiến trình có thể tạo ra một tiến trình khác," "một tiến trình có thể tạo ra một pipe," "một tiến trình có thể ghi dữ liệu vào một file," và "một tiến trình có thể kết thúc bằng cách gọi `exit()`." Tuy nhiên, hãy nhớ rằng kernel trung gian tất cả các hành động như vậy, và các câu này chỉ là cách nói tắt cho "một tiến trình có thể yêu cầu kernel tạo ra một tiến trình khác," v.v.

##### **Thông tin bổ sung**

Các tài liệu hiện đại đề cập đến các khái niệm và thiết kế hệ điều hành, với sự tham chiếu đặc biệt đến các hệ thống UNIX, bao gồm [Tanenbaum, 2007], [Tanenbaum & Woodhull, 2006], và [Vahalia, 1996], tài liệu cuối cùng trong số này chứa nhiều chi tiết về kiến trúc bộ nhớ ảo. [Goodheart & Cox, 1994] cung cấp chi tiết về System V Release 4. [Maxwell, 1999] cung cấp danh sách có chú thích về các phần được chọn của Linux 2.2.5 kernel. [Lions, 1996] là bản trình bày chi tiết về mã nguồn UNIX Sixth Edition vẫn là một tài liệu giới thiệu hữu ích về nội tạng hệ điều hành UNIX. [Bovet & Cesati, 2005] mô tả việc triển khai Linux 2.6 kernel.



### **2.2 Shell**

Shell là một chương trình mục đích đặc biệt được thiết kế để đọc các lệnh do người dùng gõ vào và thực thi các chương trình thích hợp để phản hồi các lệnh đó. Một chương trình như vậy đôi khi được gọi là trình thông dịch lệnh (command interpreter).

Thuật ngữ login shell được sử dụng để chỉ tiến trình được tạo ra để chạy shell khi người dùng đăng nhập lần đầu tiên.

Mặc dù trên một số hệ điều hành trình thông dịch lệnh là một phần tích hợp của kernel, trên các hệ thống UNIX, shell là một tiến trình người dùng (user process). Nhiều shell khác nhau tồn tại, và những người dùng khác nhau (hoặc thậm chí một người dùng duy nhất) trên cùng một máy tính có thể đồng thời sử dụng các shell khác nhau. Một số shell quan trọng đã xuất hiện theo thời gian:

* **Bourne shell (sh)**: Đây là shell lâu đời nhất trong số các shell được sử dụng rộng rãi, và được viết bởi Steve Bourne. Nó là shell chuẩn cho Seventh Edition UNIX. Bourne shell chứa nhiều tính năng quen thuộc trong tất cả các shell: chuyển hướng I/O (I/O redirection), đường ống (pipelines), tạo tên file (globbing), biến (variables), thao tác trên các biến môi trường, thế lệnh (command substitution), thực thi lệnh ngầm (background command execution), và hàm (functions). Tất cả các bản thực thi UNIX sau này đều bao gồm Bourne shell bên cạnh bất kỳ shell nào khác mà chúng có thể cung cấp.
* **C shell (csh)**: Shell này được viết bởi Bill Joy tại University of California at Berkeley. Tên gọi này bắt nguồn từ sự giống nhau của nhiều cấu trúc điều khiển luồng của shell này với ngôn ngữ lập trình C. C shell đã cung cấp một số tính năng tương tác hữu ích không có trong Bourne shell, bao gồm lịch sử lệnh (command history), chỉnh sửa dòng lệnh (command-line editing), quản lý tác vụ (job control), và bí danh (aliases). C shell không tương thích ngược với Bourne shell. Mặc dù shell tương tác chuẩn trên BSD là C shell, các kịch bản shell (shell scripts) thường được viết cho Bourne shell để có tính di động trên tất cả các bản thực thi UNIX.
* **Korn shell (ksh)**: Shell này được viết làm bản kế thừa cho Bourne shell bởi David Korn tại AT&T Bell Laboratories. Trong khi duy trì tính tương thích ngược với Bourne shell, nó cũng tích hợp các tính năng tương tác tương tự như các tính năng do C shell cung cấp.
* **Bourne again shell (bash)**: Shell này là bản triển khai lại của dự án GNU cho Bourne shell. Nó cung cấp các tính năng tương tác tương tự như các tính năng có sẵn trong C shell và Korn shell. Các tác giả chính của bash là Brian Fox và Chet Ramey. Bash có lẽ là shell được sử dụng rộng rãi nhất trên Linux. (Trên Linux, Bourne shell, `sh`, thực tế được cung cấp bởi bash mô phỏng `sh` càng giống càng tốt.)

POSIX.2-1992 đã quy định một tiêu chuẩn cho shell dựa trên phiên bản Korn shell vào thời điểm đó. Ngày nay, Korn shell và bash đều tuân thủ POSIX, nhưng cung cấp một số mở rộng cho tiêu chuẩn, và nhiều mở rộng này khác nhau giữa hai shell.

Các shell được thiết kế không chỉ cho việc sử dụng tương tác, mà còn cho việc thông dịch các shell script, vốn là các file văn bản chứa các lệnh shell. Cho mục đích này, mỗi shell có các phương tiện thường gắn liền với các ngôn ngữ lập trình: biến, các câu lệnh vòng lặp và điều kiện, các lệnh I/O, và các hàm.

Mỗi shell thực hiện các nhiệm vụ tương tự, mặc dù có những biến thể về cú pháp. Trừ khi đề cập đến hoạt động của một shell cụ thể, chúng ta thường đề cập đến "shell", với sự hiểu rằng tất cả các shell đều hoạt động theo cách được mô tả. Hầu hết các ví dụ trong cuốn sách này yêu cầu shell đều sử dụng bash, nhưng, trừ khi có ghi chú khác, người đọc có thể giả định các ví dụ này hoạt động tương tự trong các shell kiểu Bourne khác.


### **2.3 User và Group**

Mỗi người dùng trên hệ thống được định danh duy nhất, và người dùng có thể thuộc về các nhóm (groups).

###### **User**

Mỗi người dùng của hệ thống có một tên đăng nhập duy nhất (username) và một ID người dùng dạng số tương ứng (UID). Đối với mỗi người dùng, những thông tin này được định nghĩa bởi một dòng trong file mật khẩu hệ thống, `/etc/passwd`, file này bao gồm các thông tin bổ sung sau:
* **Group ID**: ID nhóm dạng số của nhóm đầu tiên mà người dùng là thành viên.
* **Home directory**: thư mục ban đầu mà người dùng được đặt vào sau khi đăng nhập.
* **Login shell**: tên của chương trình sẽ được thực thi để thông dịch các lệnh của người dùng.

Bản ghi mật khẩu cũng có thể bao gồm mật khẩu của người dùng, dưới dạng mã hóa. Tuy nhiên, vì lý do bảo mật, mật khẩu thường được lưu trữ trong file mật khẩu ẩn (shadow password file) riêng biệt, file này chỉ có thể đọc được bởi người dùng có đặc quyền (privileged users).

###### **Group**

Vì mục đích quản trị — đặc biệt là để kiểm soát quyền truy cập vào file và các tài nguyên hệ thống khác — việc tổ chức người dùng thành các nhóm là rất hữu ích. Ví dụ, những người trong một nhóm làm việc trên một dự án duy nhất, và do đó chia sẻ một tập hợp các file chung, tất cả có thể được tạo thành thành viên của cùng một nhóm. Trong các bản thực thi UNIX sớm, một người dùng chỉ có thể là thành viên của một nhóm. BSD cho phép một người dùng đồng thời thuộc về nhiều nhóm, một ý tưởng đã được các bản thực thi UNIX khác và tiêu chuẩn POSIX.1-1990 tiếp nhận. Mỗi nhóm được định danh bởi một dòng duy nhất trong file nhóm hệ thống, `/etc/group`, file này bao gồm các thông tin sau:
* **Group name**: tên (duy nhất) của nhóm.
* **Group ID (GID)**: ID dạng số gắn liền với nhóm này.
* **User list**: danh sách phân tách bằng dấu phẩy gồm các tên đăng nhập của người dùng là thành viên của nhóm này (và những người không được định danh là thành viên của nhóm theo trường ID nhóm trong bản ghi file mật khẩu của họ).

###### **Superuser**

Một người dùng, được gọi là superuser, có các đặc quyền đặc biệt trong hệ thống. Tài khoản superuser có user ID 0, và thường có tên đăng nhập là `root`. Trên các hệ thống UNIX điển hình, superuser bỏ qua tất cả các kiểm tra quyền truy cập trong hệ thống. Do đó, ví dụ, superuser có thể truy cập bất kỳ file nào trong hệ thống, bất kể quyền trên file đó, và có thể gửi tín hiệu đến bất kỳ tiến trình người dùng nào trong hệ thống. Quản trị viên hệ thống (system administrator) sử dụng tài khoản superuser để thực hiện các nhiệm vụ quản trị khác nhau trên hệ thống.


#### **2.4 Phân cấp thư mục đơn, Thư mục, Link, và File**

Kernel duy trì một cấu trúc thư mục phân cấp duy nhất để tổ chức tất cả các file trong hệ thống. (Điều này trái ngược với các hệ điều hành như Microsoft Windows, nơi mỗi thiết bị đĩa có phân cấp thư mục riêng.) Ở gốc của phân cấp này là *root directory*, được đặt tên là `/` (slash). Tất cả các file và thư mục là con hoặc các hậu duệ xa hơn của root directory. Hình 2-1 chỉ ra một ví dụ về cấu trúc file phân cấp này.

```text
/                    (directory)
├── bin              (directory)
│   └── bash         (regular file)
├── boot             (directory)
│   └── vmlinuz      (regular file)
├── etc              (directory)
│   ├── group        (regular file)
│   └── passwd       (regular file)
├── home             (directory)
│   ├── avr          (directory)
│   │   └── java     (directory)
│   │       └── Go.java   (regular file)
│   └── mtk          (directory)
│       └── .bashrc  (regular file)
└── usr              (directory)
    └── include      (directory)
        ├── sys      (directory)
        │   └── types.h   (regular file)
        └── stdio.h  (regular file)
```

<span id="page-6-0"></span>**Hình 2-1:** Tập hợp con của phân cấp thư mục đơn trên Linux

###### **Các loại file**

Trong file system, mỗi file được đánh dấu bằng một *type* (loại), chỉ ra đó là loại file nào. Một trong những loại file này chỉ các file dữ liệu thông thường, thường được gọi là *regular file* hoặc *plain file* để phân biệt chúng với các loại file khác. Các loại file khác bao gồm thiết bị (devices), đường ống (pipes), sockets, thư mục (directories), và liên kết mềm/biểu tượng (symbolic links).

Thuật ngữ *file* thường được sử dụng để chỉ một file thuộc bất kỳ loại nào, chứ không chỉ riêng regular file.

###### **Thư mục và link**

Một *directory* (thư mục) là một file đặc biệt có nội dung dưới dạng một bảng gồm các tên file đi kèm với các tham chiếu đến các file tương ứng. Hiệp hội tên-file-cộng-tham-chiếu này được gọi là một *link* (liên kết), và các file có thể có nhiều link, và do đó có nhiều tên, trong cùng một thư mục hoặc trong các thư mục khác nhau.

Các thư mục có thể chứa các link đến cả các file và các thư mục khác. Các link giữa các thư mục thiết lập phân cấp thư mục được hiển thị trong Hình 2-1.

Mỗi thư mục chứa ít nhất hai mục nhập: `.` (dot), là một link đến chính thư mục đó, và `..` (dot-dot), là một link đến *parent directory* (thư mục cha) của nó, tức là thư mục ngay phía trên nó trong phân cấp. Mỗi thư mục, ngoại trừ root directory, đều có một thư mục cha. Đối với root directory, mục nhập dot-dot là một link đến chính root directory (do đó, `/..` tương đương với `/`).

###### **Symbolic link**

Giống như một link bình thường, một symbolic link cung cấp một tên thay thế cho một file. Nhưng trong khi một link bình thường là một mục nhập tên-file-cộng-con-trỏ trong danh sách thư mục, một symbolic link là một file được đánh dấu đặc biệt chứa tên của một file khác. (Nói cách khác, một symbolic link có một mục nhập tên-file-cộng-con-trỏ trong một thư mục, và file được chỉ tới bởi con trỏ chứa một chuỗi đặt tên cho một file khác.) File sau này thường được gọi là mục tiêu (target) của symbolic link, và người ta thường nói rằng symbolic link "trỏ" hoặc "tham chiếu" đến target file. Khi một đường dẫn (pathname) được chỉ định trong một system call, trong hầu hết các trường hợp, kernel tự động giải mã (dereferences/follows) từng symbolic link trong đường dẫn, thay thế nó bằng tên file mà nó trỏ tới. Quá trình này có thể diễn ra đệ quy nếu target của một symbolic link bản thân nó lại là một symbolic link. (Kernel áp đặt các giới hạn về số lần giải mã để xử lý khả năng xảy ra các chuỗi vòng lặp symbolic link.) Nếu một symbolic link tham chiếu đến một file không tồn tại, nó được gọi là một dangling link (liên kết treo).

Thường thì *hard link* và *soft link* được sử dụng như các thuật ngữ thay thế cho link bình thường và symbolic link. Lý do có hai loại link khác nhau được giải thích trong Chương 18.

###### **Tên file (Filenames)**

Trên hầu hết các file system của Linux, tên file có thể dài tới 255 ký tự. Tên file có thể chứa bất kỳ ký tự nào ngoại trừ dấu gạch chéo (`/`) và ký tự null (`\0`). Tuy nhiên, nên chỉ sử dụng các chữ cái và chữ số, cùng với các ký tự `.` (dấu chấm), `_` (gạch dưới), và `-` (gạch ngang). Tập hợp 65 ký tự này, `[-._a-zA-Z0-9]`, được gọi trong SUSv3 là *portable filename character set*.

Chúng ta nên tránh việc sử dụng các ký tự trong tên file không thuộc tập ký tự tên file di động vì các ký tự đó có thể có ý nghĩa đặc biệt trong shell, trong biểu thức chính quy (regular expressions), hoặc trong các ngữ cảnh khác. Nếu một tên file chứa các ký tự có ý nghĩa đặc biệt xuất hiện trong các ngữ cảnh như vậy, thì các ký tự này phải được escape; nghĩa là, được đánh dấu đặc biệt — thường bằng một dấu gạch chéo ngược (`\`) phía trước để chỉ ra rằng chúng không nên được diễn giải với các ý nghĩa đặc biệt đó. Trong ngữ cảnh không có cơ chế escape, tên file sẽ không thể sử dụng được.

Chúng ta cũng nên tránh các tên file bắt đầu bằng dấu gạch ngang (`-`), vì các tên file như vậy có thể bị nhầm lẫn với các tùy chọn (options) khi được chỉ định trong một lệnh shell.

##### **Đường dẫn (Pathnames)**

Một đường dẫn (pathname) là một chuỗi bao gồm một dấu gạch chéo đầu tiên tùy chọn (`/`) theo sau bởi một loạt các tên file được phân tách bằng dấu gạch chéo. Tất cả ngoại trừ tên file thành phần cuối cùng đều định danh một thư mục (hoặc một symbolic link giải mã thành một thư mục). Thành phần cuối cùng của một đường dẫn có thể định danh bất kỳ loại file nào, bao gồm cả thư mục. Chuỗi các tên file thành phần đứng trước dấu gạch chéo cuối cùng đôi khi được gọi là phần thư mục (directory part) của đường dẫn, trong khi tên đứng sau dấu gạch chéo cuối cùng đôi khi được gọi là phần file hoặc phần gốc (file/base part) của đường dẫn.

Một đường dẫn được đọc từ trái sang phải; mỗi tên file nằm trong thư mục được chỉ định bởi phần đứng trước của đường dẫn. Chuỗi `..` có thể được sử dụng ở bất kỳ đâu trong một đường dẫn để tham chiếu đến thư mục cha của vị trí đã được chỉ định cho đến mốc đó trong đường dẫn.

Một đường dẫn mô tả vị trí của một file trong phân cấp thư mục đơn, và có thể là tuyệt đối (absolute) hoặc tương đối (relative):
* **Đường dẫn tuyệt đối (Absolute pathname)**: bắt đầu bằng dấu gạch chéo (`/`) và chỉ định vị trí của một file so với root directory. Các ví dụ về đường dẫn tuyệt đối cho các file trong [Hình 2-1](#page-6-0) là `/home/mtk/.bashrc`, `/usr/include`, và `/` (đường dẫn của root directory).
* **Đường dẫn tương đối (Relative pathname)**: chỉ định vị trí của một file tương quan với thư mục làm việc hiện tại (current working directory) của một tiến trình (xem bên dưới), và được phân biệt với đường dẫn tuyệt đối bằng sự vắng mặt của dấu gạch chéo ở đầu. Trong [Hình 2-1](#page-6-0), từ thư mục `usr`, file `types.h` có thể được tham chiếu bằng cách sử dụng đường dẫn tương đối `include/sys/types.h`, trong khi từ thư mục `avr`, file `.bashrc` có thể được truy cập bằng đường dẫn tương đối `../mtk/.bashrc`.

#### **Thư mục làm việc hiện tại (Current working directory)**

Mỗi tiến trình có một thư mục làm việc hiện tại (đôi khi chỉ được gọi là thư mục làm việc của tiến trình hoặc thư mục hiện tại). Đây là "vị trí hiện tại" của tiến trình trong phân cấp thư mục đơn, và chính từ thư mục này mà các đường dẫn tương đối được diễn giải cho tiến trình.

Một tiến trình thừa kế thư mục làm việc hiện tại từ tiến trình cha của nó. Một login shell có thư mục làm việc hiện tại ban đầu được đặt thành vị trí được đặt tên trong trường home directory của mục nhập file mật khẩu của người dùng. Thư mục làm việc hiện tại của shell có thể được thay đổi bằng lệnh `cd`.

###### **Quyền sở hữu và quyền truy cập file**

Mỗi file có một user ID và group ID đi kèm định nghĩa người sở hữu file và nhóm mà nó thuộc về. Quyền sở hữu của một file được sử dụng để xác định quyền truy cập khả dụng cho người dùng của file.

Cho mục đích truy cập file, hệ thống chia người dùng thành ba nhóm: người sở hữu file (đôi khi được gọi là user của file), người dùng là thành viên của nhóm khớp với group ID của file (group), và phần còn lại của thế giới (other). Ba bit quyền có thể được đặt cho mỗi nhóm người dùng này (tạo thành tổng cộng chín bit quyền): quyền đọc (read permission) cho phép đọc nội dung file; quyền ghi (write permission) cho phép sửa đổi nội dung file; và quyền thực thi (execute permission) cho phép thực thi file, vốn là một chương trình hoặc một script được xử lý bởi một trình thông dịch nào đó (thường, nhưng không phải luôn luôn, là một trong các shell).

Các quyền này cũng có thể được đặt trên các thư mục, mặc dù ý nghĩa của chúng hơi khác một chút: quyền đọc cho phép liệt kê nội dung của (tức là các tên file trong) thư mục; quyền ghi cho phép thay đổi nội dung của thư mục (tức là có thể thêm, xóa, và thay đổi tên file); và quyền thực thi (đôi khi gọi là tìm kiếm - search) cho phép truy cập vào các file bên trong thư mục (tùy thuộc vào quyền trên chính các file đó).



### **2.5 Mô hình File I/O**

Một trong những tính năng nổi bật của mô hình I/O trên các hệ thống UNIX là khái niệm về tính phổ quát của I/O (universality of I/O). Điều này có nghĩa là cùng các system call (`open()`, `read()`, `write()`, `close()`, v.v.) được sử dụng để thực hiện I/O trên tất cả các loại file, bao gồm cả các thiết bị. (Kernel dịch các yêu cầu I/O của ứng dụng thành các thao tác filesystem hoặc device-driver thích hợp để thực hiện I/O trên file hoặc thiết bị đích.) Do đó, một chương trình sử dụng các system call này sẽ hoạt động trên bất kỳ loại file nào.

Kernel về cơ bản cung cấp một loại file: một luồng byte nối tiếp (sequential stream of bytes), mà trong trường hợp các file đĩa, đĩa, và thiết bị băng từ, có thể được truy cập ngẫu nhiên bằng cách sử dụng system call `lseek()`.

Nhiều ứng dụng và thư viện diễn giải ký tự dòng mới (newline - mã ASCII 10 thập phân, đôi khi còn gọi là linefeed) là kết thúc một dòng văn bản và bắt đầu một dòng khác. Các hệ thống UNIX không có ký tự kết thúc file (end-of-file character); kết thúc của một file được phát hiện bởi một thao tác `read` không trả về dữ liệu nào.

#### **File descriptors**

Các system call I/O tham chiếu đến các file đang mở bằng cách sử dụng một file descriptor, một số nguyên không âm (thường là nhỏ). Một file descriptor thường thu được bằng một tiếng gọi đến `open()`, nhận một đối số đường dẫn chỉ định một file mà trên đó I/O sẽ được thực hiện.

Thông thường, một tiến trình thừa kế ba file descriptor đang mở khi nó được khởi chạy bởi shell: descriptor 0 là standard input (stdin), file mà từ đó tiến trình lấy đầu vào; descriptor 1 là standard output (stdout), file mà tiến trình ghi đầu ra của nó vào; và descriptor 2 là standard error (stderr), file mà tiến trình ghi các thông báo lỗi và thông báo về các điều kiện bất thường hoặc ngoại lệ. Trong một shell hoặc chương trình tương tác, ba descriptor này thường được kết nối với terminal. Trong thư viện stdio, các descriptor này tương ứng với các luồng file `stdin`, `stdout`, và `stderr`.

#### **Thư viện stdio**

Để thực hiện file I/O, các chương trình C thường sử dụng các hàm I/O có trong thư viện C chuẩn. Tập hợp các hàm này, được gọi là thư viện stdio, bao gồm `fopen()`, `fclose()`, `scanf()`, `printf()`, `fgets()`, `fputs()`, v.v. Các hàm stdio được xếp lớp trên các system call I/O (`open()`, `close()`, `read()`, `write()`, v.v.).

Chúng ta giả định rằng người đọc đã quen thuộc với các hàm I/O chuẩn C (stdio), và không đề cập đến chúng trong cuốn sách này. Thông tin bổ sung về thư viện stdio có thể tìm thấy trong [Kernighan & Ritchie, 1988], [Harbison & Steele, 2002], [Plauger, 1992], và [Stevens & Rago, 2005].


### **2.6 Chương trình (Programs)**

Các chương trình thường tồn tại dưới hai dạng. Dạng thứ nhất là mã nguồn (source code), văn bản mà con người có thể đọc được bao gồm một loạt các câu lệnh được viết bằng một ngôn ngữ lập trình như C. Để được thực thi, mã nguồn phải được chuyển đổi sang dạng thứ hai: các chỉ thị ngôn ngữ máy nhị phân mà máy tính có thể hiểu được. (Điều này trái ngược với một script, vốn là một file văn bản chứa các lệnh để được xử lý trực tiếp bởi một chương trình như shell hoặc trình thông dịch lệnh khác.) Hai ý nghĩa của thuật ngữ chương trình thường được coi là đồng nghĩa, vì bước biên dịch và liên kết (compiling and linking) chuyển đổi mã nguồn thành mã máy nhị phân có ngữ nghĩa tương đương.

##### **Bộ lọc (Filters)**

Filter (bộ lọc) là tên thường được áp dụng cho một chương trình đọc đầu vào từ stdin, thực hiện một số biến đổi trên đầu vào đó, và ghi dữ liệu đã biến đổi ra stdout. Các ví dụ về bộ lọc bao gồm `cat`, `grep`, `tr`, `sort`, `wc`, `sed`, và `awk`.

#### **Đối số dòng lệnh (Command-line arguments)**

Trong C, các chương trình có thể truy cập các đối số dòng lệnh, là các từ được cung cấp trên dòng lệnh khi chương trình được chạy. Để truy cập các đối số dòng lệnh, hàm `main()` của chương trình được khai báo như sau:

```c
int main(int argc, char *argv[])
```

Biến `argc` chứa tổng số đối số dòng lệnh, và các đối số riêng lẻ khả dụng dưới dạng các chuỗi được trỏ tới bởi các thành viên của mảng `argv`. Chuỗi đầu tiên trong số các chuỗi này, `argv[0]`, định danh tên của chính chương trình.


### **2.7 Tiến trình (Processes)**

Nói một cách đơn giản nhất, một tiến trình (process) là một thể hiện của một chương trình đang thực thi. Khi một chương trình được thực thi, kernel tải mã của chương trình vào bộ nhớ ảo, phân bổ không gian cho các biến của chương trình, và thiết lập các cấu trúc dữ liệu sổ sách của kernel để ghi lại thông tin khác nhau (như process ID, trạng thái kết thúc, user IDs, và group IDs) về tiến trình.

Từ góc nhìn của kernel, các tiến trình là các thực thể mà giữa chúng kernel phải chia sẻ các tài nguyên khác nhau của máy tính. Đối với các tài nguyên có hạn, chẳng hạn như bộ nhớ, kernel ban đầu phân bổ một lượng tài nguyên cho tiến trình, và điều chỉnh sự phân bổ này trong suốt vòng đời của tiến trình để phản hồi các yêu cầu của tiến trình và yêu cầu tổng thể của hệ thống đối với tài nguyên đó. Khi tiến trình kết thúc, tất cả các tài nguyên như vậy được giải phóng để tái sử dụng bởi các tiến trình khác. Các tài nguyên khác, chẳng hạn như CPU và băng thông mạng, có thể tái tạo, nhưng phải được chia sẻ một cách công bằng giữa tất cả các tiến trình.

#### **Bố cục bộ nhớ tiến trình (Process memory layout)**

Một tiến trình được chia một cách logic thành các phần sau, được gọi là các segment:
* **Text**: các chỉ thị lệnh của chương trình.
* **Data**: các biến tĩnh được sử dụng bởi chương trình.
* **Heap**: một vùng mà từ đó các chương trình có thể phân bổ bộ nhớ bổ sung một cách động.
* **Stack**: một mảnh bộ nhớ tăng và giảm khi các hàm được gọi và trả về, và được sử dụng để phân bổ lưu trữ cho các biến cục bộ và thông tin liên kết cuộc gọi hàm.

#### **Tạo tiến trình và thực thi chương trình**

Một tiến trình có thể tạo ra một tiến trình mới bằng cách sử dụng system call `fork()`. Tiến trình gọi `fork()` được gọi là tiến trình cha (parent process), và tiến trình mới được gọi là tiến trình con (child process). Kernel tạo ra tiến trình con bằng cách nhân bản tiến trình cha. Tiến trình con thừa kế các bản sao của các segment data, stack, và heap của tiến trình cha, sau đó nó có thể sửa đổi độc lập với các bản sao của tiến trình cha. (Text của chương trình, được đặt trong bộ nhớ được đánh dấu là chỉ đọc, được chia sẻ bởi hai tiến trình.)

Tiến trình con tiếp tục thực thi một tập hợp các hàm khác nhau trong cùng một mã với tiến trình cha, hoặc, thường xuyên hơn, sử dụng system call `execve()` để tải và thực thi một chương trình hoàn toàn mới. Một cuộc gọi `execve()` phá hủy các segment text, data, stack, và heap hiện có, thay thế chúng bằng các segment mới dựa trên mã của chương trình mới.

Một số hàm thư viện C liên quan được xếp lớp trên `execve()`, mỗi hàm cung cấp một giao diện hơi khác một chút cho cùng một chức năng. Tất cả các hàm này đều có tên bắt đầu bằng chuỗi `exec`, và khi những điểm khác biệt không quan trọng, chúng ta sẽ sử dụng ký hiệu `exec()` để chỉ chung các hàm này. Tuy nhiên, hãy lưu ý rằng không có hàm thực sự nào có tên là `exec()`.

Thông thường, chúng ta sẽ sử dụng động từ "to exec" để mô tả thao tác được thực hiện bởi `execve()` và các hàm thư viện được xếp lớp trên nó.

#### **Process ID và parent process ID**

Mỗi tiến trình có một định danh tiến trình dạng số nguyên duy nhất (PID). Mỗi tiến trình cũng có một thuộc tính định danh tiến trình cha (PPID), định danh tiến trình đã yêu cầu kernel tạo ra tiến trình này.

#### **Kết thúc tiến trình và trạng thái kết thúc**

Một tiến trình có thể kết thúc theo một trong hai cách: bằng cách yêu cầu sự kết thúc của chính nó sử dụng system call `_exit()` (hoặc hàm thư viện liên quan `exit()`), hoặc bị tiêu diệt bởi việc chuyển giao một tín hiệu (signal). Trong cả hai trường hợp, tiến trình tạo ra một trạng thái kết thúc (termination status), một giá trị số nguyên không âm nhỏ khả dụng cho việc kiểm tra bởi tiến trình cha bằng cách sử dụng system call `wait()`. Trong trường hợp gọi `_exit()`, tiến trình chỉ định rõ ràng trạng thái kết thúc của chính nó. Nếu một tiến trình bị tiêu diệt bởi một tín hiệu, trạng thái kết thúc được đặt theo loại tín hiệu đã gây ra cái chết của tiến trình. (Đôi khi, chúng ta sẽ gọi đối số được truyền cho `_exit()` là exit status của tiến trình, phân biệt với termination status, vốn là giá trị được truyền cho `_exit()` hoặc một chỉ báo về tín hiệu đã tiêu diệt tiến trình.)

Theo quy ước, trạng thái kết thúc bằng 0 chỉ ra rằng tiến trình đã thành công, và trạng thái khác 0 chỉ ra rằng một số lỗi đã xảy ra. Hầu hết các shell làm cho trạng thái kết thúc của chương trình được thực thi gần nhất khả dụng thông qua một biến shell có tên là `$?`.

#### **Định danh user và group của tiến trình (Credentials)**

Mỗi tiến trình có một số user ID (UID) và group ID (GID) đi kèm. Chúng bao gồm:
* **Real user ID và real group ID**: Những ID này định danh user và group mà tiến trình thuộc về. Một tiến trình mới thừa kế các ID này từ tiến trình cha của nó. Một login shell lấy real user ID và real group ID của nó từ các trường tương ứng trong file mật khẩu hệ thống.
* **Effective user ID và effective group ID**: Hai ID này (kết hợp với các ID nhóm bổ sung được thảo luận ngay sau đây) được sử dụng để xác định các quyền mà tiến trình có khi truy cập các tài nguyên được bảo vệ chẳng hạn như các file và các đối tượng giao tiếp giữa các tiến trình. Thông thường, các effective ID của tiến trình có cùng giá trị với các real ID tương ứng. Thay đổi các effective ID là một cơ chế cho phép một tiến trình đảm nhận các đặc quyền của một user hoặc group khác, như được mô tả ngay sau đây.
* **Supplementary group IDs**: Các ID này định danh các nhóm bổ sung mà một tiến trình thuộc về. Một tiến trình mới thừa kế các ID nhóm bổ sung của nó từ tiến trình cha. Một login shell lấy các ID nhóm bổ sung của nó từ file nhóm hệ thống.

#### **Tiến trình đặc quyền (Privileged processes)**

Theo truyền thống, trên các hệ thống UNIX, một tiến trình đặc quyền (privileged process) là tiến trình có effective user ID bằng 0 (superuser). Một tiến trình như vậy bỏ qua các hạn chế quyền truy cập thường áp dụng bởi kernel. Trái lại, thuật ngữ unprivileged (hoặc nonprivileged) được áp dụng cho các tiến trình được chạy bởi những người dùng khác. Các tiến trình như vậy có effective user ID khác 0 và phải tuân theo các quy tắc quyền truy cập do kernel thực thi.

Một tiến trình có thể có đặc quyền vì nó được tạo ra bởi một tiến trình đặc quyền khác — ví dụ, bởi một login shell được khởi chạy bởi `root` (superuser). Một cách khác để một tiến trình trở nên có đặc quyền là thông qua cơ chế set-user-ID, cho phép một tiến trình đảm nhận một effective user ID giống với user ID của file chương trình mà nó đang thực thi.

#### **Capabilities**

Kể từ kernel 2.2, Linux chia các đặc quyền theo truyền thống dành cho superuser thành một tập hợp các đơn vị riêng biệt được gọi là capabilities. Mỗi thao tác đặc quyền được gắn liền với một capability cụ thể, và một tiến trình chỉ có thể thực hiện một thao tác nếu nó có capability tương ứng. Một tiến trình superuser truyền thống (effective user ID bằng 0) tương ứng với một tiến trình được bật tất cả các capabilities.

Cấp một tập hợp con các capabilities cho một tiến trình cho phép nó thực hiện một số thao tác thường được phép cho superuser, trong khi ngăn nó thực hiện các thao tác khác.

Capabilities được mô tả chi tiết trong Chương 39. Trong phần còn lại của cuốn sách, khi lưu ý rằng một thao tác cụ thể chỉ có thể được thực hiện bởi một tiến trình đặc quyền, chúng ta sẽ thường định danh capability cụ thể trong ngoặc đơn. Tên các capability bắt đầu bằng tiền tố `CAP_`, như trong `CAP_KILL`.

#### **Tiến trình init**

Khi khởi động hệ thống, kernel tạo ra một tiến trình đặc biệt được gọi là `init`, "cha của tất cả các tiến trình", bắt nguồn từ file chương trình `/sbin/init`. Tất cả các tiến trình trên hệ thống đều được tạo ra (sử dụng `fork()`) bởi `init` hoặc bởi một trong các hậu duệ của nó. Tiến trình `init` luôn có process ID bằng 1 và chạy với các đặc quyền superuser. Tiến trình `init` không thể bị tiêu diệt (ngay cả bởi superuser), và nó chỉ kết thúc khi hệ thống bị tắt. Nhiệm vụ chính của `init` là tạo và giám sát một loạt các tiến trình cần thiết cho một hệ thống đang chạy. (Để biết chi tiết, xem trang tài liệu hướng dẫn `init(8)`.)

###### **Tiến trình Daemon**

Một daemon là một tiến trình mục đích đặc biệt được tạo ra và xử lý bởi hệ thống theo cùng một cách như các tiến trình khác, nhưng được phân biệt bởi các đặc điểm sau:
* Nó sống lâu dài. Một tiến trình daemon thường được khởi chạy khi khởi động hệ thống và tiếp tục tồn tại cho đến khi hệ thống bị tắt.
* Nó chạy ngầm (in the background), và không có terminal điều khiển nào mà từ đó nó có thể đọc đầu vào hoặc ghi đầu ra.

Các ví dụ về tiến trình daemon bao gồm `syslogd`, ghi lại các thông báo trong nhật ký hệ thống (system log), và `httpd`, phục vụ các trang web qua Giao thức Truyền tải Siêu văn bản (HTTP).

###### **Danh sách môi trường (Environment list)**

Mỗi tiến trình có một danh sách môi trường (environment list), là một tập hợp các biến môi trường được duy trì trong bộ nhớ không gian người dùng của tiến trình. Mỗi phần tử của danh sách này bao gồm một tên và một giá trị đi kèm. Khi một tiến trình mới được tạo ra qua `fork()`, nó thừa kế một bản sao môi trường của tiến trình cha. Do đó, môi trường cung cấp một cơ chế cho tiến trình cha truyền thông tin đến tiến trình con. Khi một tiến trình thay thế chương trình mà nó đang chạy bằng `exec()`, chương trình mới thừa kế môi trường được sử dụng bởi chương trình cũ hoặc nhận một môi trường mới được chỉ định như một phần của cuộc gọi `exec()`.

Các biến môi trường được tạo bằng lệnh `export` trong hầu hết các shell (hoặc lệnh `setenv` trong C shell), như trong ví dụ sau:

```bash
$ export MYVAR='Hello world'
```

Bất cứ khi nào chúng ta trình bày một nhật ký phiên shell hiển thị đầu vào và đầu ra tương ứng, văn bản đầu vào luôn được in đậm. Đôi khi, chúng ta đưa câu nhận xét vào nhật ký dưới dạng văn bản in nghiêng, thêm các ghi chú về các lệnh được nhập hoặc đầu ra được tạo ra.

Các chương trình C có thể truy cập môi trường bằng một biến bên ngoài (`char **environ`), và các hàm thư viện khác nhau cho phép một tiến trình truy xuất và sửa đổi các giá trị trong môi trường của nó.

Các biến môi trường được sử dụng cho nhiều mục đích khác nhau. Ví dụ, shell định nghĩa và sử dụng một loạt các biến có thể được truy cập bởi các script và chương trình được thực thi từ shell. Chúng bao gồm biến `HOME`, chỉ định đường dẫn của thư mục đăng nhập của người dùng, và biến `PATH`, chỉ định danh sách các thư mục mà shell nên tìm kiếm khi tìm các chương trình tương ứng với các lệnh do người dùng nhập.

###### **Giới hạn tài nguyên (Resource limits)**

Mỗi tiến trình tiêu thụ các tài nguyên, chẳng hạn như các file đang mở, bộ nhớ, và thời gian CPU. Sử dụng system call `setrlimit()`, một tiến trình có thể thiết lập các giới hạn trên cho mức tiêu thụ các tài nguyên khác nhau của nó. Mỗi giới hạn tài nguyên như vậy có hai giá trị đi kèm: một giới hạn mềm (soft limit), giới hạn lượng tài nguyên mà tiến trình có thể tiêu thụ; và một giới hạn cứng (hard limit), là trần cho giá trị mà giới hạn mềm có thể được điều chỉnh. Một tiến trình không có đặc quyền có thể thay đổi giới hạn mềm của nó đối với một tài nguyên cụ thể thành bất kỳ giá trị nào trong khoảng từ 0 cho đến giới hạn cứng tương ứng, nhưng chỉ có thể hạ thấp giới hạn cứng của nó.

Khi một tiến trình mới được tạo ra với `fork()`, nó thừa kế các bản sao của các thiết lập giới hạn tài nguyên của tiến trình cha.

Các giới hạn tài nguyên của shell có thể được điều chỉnh bằng lệnh `ulimit` (`limit` trong C shell). Các thiết lập giới hạn này được thừa kế bởi các tiến trình con mà shell tạo ra để thực thi các lệnh.



### **2.8 Ánh xạ bộ nhớ (Memory Mappings)**

System call `mmap()` tạo ra một ánh xạ bộ nhớ mới trong không gian địa chỉ ảo của tiến trình gọi.

Các ánh xạ rơi vào hai loại:
* **File mapping**: ánh xạ một vùng của một file vào bộ nhớ ảo của tiến trình gọi. Khi đã được ánh xạ, nội dung của file có thể được truy cập bằng các thao tác trên các byte trong vùng bộ nhớ tương ứng. Các trang của ánh xạ sẽ tự động được tải từ file theo yêu cầu.
* Trái lại, **anonymous mapping** không có file tương ứng. Thay vào đó, các trang của ánh xạ được khởi tạo thành 0.

Bộ nhớ trong ánh xạ của một tiến trình có thể được chia sẻ với các ánh xạ trong các tiến trình khác. Điều này có thể xảy ra vì hai tiến trình ánh xạ cùng một vùng của một file hoặc vì một tiến trình con được tạo bởi `fork()` thừa kế một ánh xạ từ tiến trình cha của nó.

Khi hai hoặc nhiều tiến trình chia sẻ cùng các trang, mỗi tiến trình có thể nhìn thấy các thay đổi được thực hiện bởi các tiến trình khác đối với nội dung của các trang, tùy thuộc vào việc ánh xạ được tạo là private hay shared. Khi một ánh xạ là private, các sửa đổi đối với nội dung của ánh xạ không thể nhìn thấy đối với các tiến trình khác và không được chuyển qua file bên dưới. Khi một ánh xạ là shared, các sửa đổi đối với nội dung của ánh xạ có thể nhìn thấy đối với các tiến trình khác chia sẻ cùng ánh xạ và được chuyển qua file bên dưới.

Ánh xạ bộ nhớ phục vụ cho nhiều mục đích khác nhau, bao gồm khởi tạo segment text của tiến trình từ segment tương ứng của một file thực thi, phân bổ bộ nhớ mới (điền đầy số 0), file I/O (memory-mapped I/O), và giao tiếp giữa các tiến trình (qua một shared mapping).


### **2.9 Thư viện tĩnh và thư viện chia sẻ (Static và Shared Libraries)**

Một thư viện đối tượng (object library) là một file chứa mã đối tượng đã biên dịch cho một tập hợp các hàm (thường có liên quan logic với nhau) có thể được gọi từ các chương trình ứng dụng. Việc đặt mã cho một tập hợp các hàm trong một thư viện đối tượng duy nhất giúp đơn giản hóa các nhiệm vụ tạo và bảo trì chương trình. Các hệ thống UNIX hiện đại cung cấp hai loại thư viện đối tượng: thư viện tĩnh (static libraries) và thư viện chia sẻ (shared libraries).

#### **Thư viện tĩnh (Static libraries)**

Thư viện tĩnh (đôi khi còn được gọi là archives) là loại thư viện duy nhất trên các hệ thống UNIX sớm. Một thư viện tĩnh về cơ bản là một gói cấu trúc gồm các mô-đun đối tượng đã biên dịch. Để sử dụng các hàm từ một thư viện tĩnh, chúng ta chỉ định thư viện đó trong lệnh liên kết (link command) được sử dụng để xây dựng chương trình. Sau khi giải mã các tham chiếu hàm khác nhau từ chương trình chính đến các mô-đun trong thư viện tĩnh, linker trích xuất các bản sao của các mô-đun đối tượng được yêu cầu từ thư viện và chép chúng vào file thực thi kết quả. Chúng ta nói rằng một chương trình như vậy được liên kết tĩnh (statically linked).

Thực tế là mỗi chương trình được liên kết tĩnh bao gồm bản sao riêng của nó về các mô-đun đối tượng được yêu cầu từ thư viện tạo ra một số nhược điểm. Một là sự trùng lặp mã đối tượng trong các file thực thi khác nhau lãng phí không gian đĩa. Sự lãng phí bộ nhớ tương ứng xảy ra khi các chương trình được liên kết tĩnh sử dụng cùng một hàm thư viện được thực thi tại cùng một thời điểm; mỗi chương trình yêu cầu bản sao hàm của riêng nó thường trú trong bộ nhớ. Ngoài ra, nếu một hàm thư viện yêu cầu sửa đổi, thì sau khi biên dịch lại hàm đó và thêm nó vào thư viện tĩnh, tất cả các ứng dụng cần sử dụng hàm đã cập nhật phải được liên kết lại với thư viện.

#### **Thư viện chia sẻ (Shared libraries)**

Thư viện chia sẻ được thiết kế để giải quyết các vấn đề với thư viện tĩnh.

Nếu một chương trình được liên kết với một thư viện chia sẻ, thì thay vì chép các mô-đun đối tượng từ thư viện vào file thực thi, linker chỉ ghi một bản ghi vào file thực thi để chỉ ra rằng tại thời điểm chạy (run time) file thực thi cần sử dụng thư viện chia sẻ đó. Khi file thực thi được tải vào bộ nhớ tại thời điểm chạy, một chương trình được gọi là dynamic linker đảm bảo rằng các thư viện chia sẻ mà file thực thi yêu cầu được tìm thấy và tải vào bộ nhớ, và thực hiện liên kết tại thời điểm chạy để giải mã các cuộc gọi hàm trong file thực thi đến các định nghĩa tương ứng trong các thư viện chia sẻ. Tại thời điểm chạy, chỉ có một bản sao duy nhất mã của thư viện chia sẻ cần thường trú trong bộ nhớ; tất cả các chương trình đang chạy có thể sử dụng bản sao đó.

Thực tế là một thư viện chia sẻ chứa phiên bản biên dịch duy nhất của một hàm giúp tiết kiệm không gian đĩa. Nó cũng giúp đơn giản hóa đáng kể việc đảm bảo rằng các chương trình sử dụng phiên bản mới nhất của một hàm. Chỉ cần xây dựng lại thư viện chia sẻ với định nghĩa hàm mới sẽ khiến các chương trình hiện có tự động sử dụng định nghĩa mới khi chúng được thực thi lần tiếp theo.


#### <span id="page-15-0"></span> **2.10 Giao tiếp và đồng bộ hóa giữa các tiến trình (IPC và Synchronization)**

Một hệ thống Linux đang chạy bao gồm vô số tiến trình, nhiều tiến trình trong số đó hoạt động độc lập với nhau. Tuy nhiên, một số tiến trình hợp tác để đạt được mục đích dự định của chúng, và các tiến trình này cần các phương thức để giao tiếp với nhau và đồng bộ hóa các hành động của chúng.

Một cách để các tiến trình giao tiếp là đọc và ghi thông tin trong các file trên đĩa. Tuy nhiên, đối với nhiều ứng dụng, cách này quá chậm và không linh hoạt. Do đó, Linux, giống như tất cả các bản thực thi UNIX hiện đại, cung cấp một tập hợp phong phú các cơ chế giao tiếp giữa các tiến trình (IPC), bao gồm:
* **Signals (tín hiệu)**: được sử dụng để chỉ ra rằng một sự kiện đã xảy ra;
* **Pipes (đường ống)** (quen thuộc với người dùng shell dưới dạng toán tử `|`) và **FIFOs**: có thể được sử dụng để truyền dữ liệu giữa các tiến trình;
* **Sockets**: có thể được sử dụng để truyền dữ liệu từ tiến trình này sang tiến trình khác, trên cùng một máy tính chủ hoặc trên các máy chủ khác nhau được kết nối bằng mạng;
* **File locking (khóa file)**: cho phép một tiến trình khóa các vùng của một file nhằm ngăn các tiến trình khác đọc hoặc cập nhật nội dung file;
* **Message queues (hàng đợi thông điệp)**: được sử dụng để trao đổi các thông điệp (các gói dữ liệu) giữa các tiến trình;
* **Semaphores**: được sử dụng để đồng bộ hóa các hành động của các tiến trình; và
* **Shared memory (bộ nhớ chia sẻ)**: cho phép hai hoặc nhiều tiến trình chia sẻ một mảnh bộ nhớ. Khi một tiến trình thay đổi nội dung của bộ nhớ chia sẻ, tất cả các tiến trình khác có thể lập tức nhìn thấy các thay đổi.

Sự đa dạng phong phú của các cơ chế IPC trên các hệ thống UNIX, đôi khi có chức năng chồng chéo, một phần là do sự tiến hóa của chúng dưới các biến thể khác nhau của hệ thống UNIX và yêu cầu của các tiêu chuẩn khác nhau. Ví dụ, FIFOs và UNIX domain sockets về cơ bản thực hiện cùng một chức năng cho phép các tiến trình không liên quan trên cùng một hệ thống trao đổi dữ liệu. Cả hai đều tồn tại trong các hệ thống UNIX hiện đại vì FIFOs đến từ System V, trong khi sockets đến từ BSD.


### **2.11 Tín hiệu (Signals)**

Mặc dù chúng ta đã liệt kê chúng như một phương thức IPC trong mục trước, các tín hiệu thường được sử dụng trong một loạt các ngữ cảnh khác, và do đó xứng đáng được thảo luận dài hơn.

Các tín hiệu thường được mô tả là "ngắt phần mềm" (software interrupts). Sự xuất hiện của một tín hiệu thông báo cho một tiến trình biết rằng một sự kiện hoặc điều kiện ngoại lệ nào đó đã xảy ra. Có nhiều loại tín hiệu khác nhau, mỗi loại định danh một sự kiện hoặc điều kiện khác nhau. Mỗi loại tín hiệu được định danh bởi một số nguyên khác nhau, được định nghĩa bằng các tên biểu tượng có dạng `SIGxxxx`.

Các tín hiệu được gửi đến một tiến trình bởi kernel, bởi một tiến trình khác (với quyền thích hợp), hoặc bởi chính tiến trình đó. Ví dụ, kernel có thể gửi một tín hiệu đến một tiến trình khi một trong các điều sau xảy ra:
* Người dùng gõ ký tự ngắt (thường là Control-C) trên bàn phím;
* Một trong các tiến trình con của tiến trình đã kết thúc;
* Một bộ hẹn giờ (đồng hồ báo thức) do tiến trình đặt đã hết hạn; hoặc
* Tiến trình cố gắng truy cập một địa chỉ bộ nhớ không hợp lệ.

Trong shell, lệnh `kill` có thể được sử dụng để gửi một tín hiệu đến một tiến trình. System call `kill()` cung cấp phương tiện tương tự bên trong các chương trình.

Khi một tiến trình nhận được một tín hiệu, nó thực hiện một trong các hành động sau, tùy thuộc vào tín hiệu:
* Nó lờ đi (ignores) tín hiệu;
* Nó bị tiêu diệt (killed) bởi tín hiệu; hoặc
* Nó bị tạm dừng (suspended) cho đến khi sau đó được tiếp tục bởi việc nhận một tín hiệu mục đích đặc biệt.

Đối với hầu hết các loại tín hiệu, thay vì chấp nhận hành động mặc định của tín hiệu, một chương trình có thể chọn lờ tín hiệu đi (hữu ích nếu hành động mặc định cho tín hiệu là một cái gì đó khác ngoài việc lờ đi), hoặc thiết lập một trình xử lý tín hiệu (signal handler). Trình xử lý tín hiệu là một hàm do lập trình viên định nghĩa được tự động triệu gọi khi tín hiệu được chuyển giao đến tiến trình. Hàm này thực hiện một số hành động thích hợp với điều kiện đã tạo ra tín hiệu.

Trong khoảng thời gian từ lúc nó được tạo ra đến lúc nó được chuyển giao, một tín hiệu được gọi là đang chờ xử lý (pending) đối với một tiến trình. Thông thường, một tín hiệu đang chờ xử lý sẽ được chuyển giao ngay khi tiến trình nhận được lập lịch chạy tiếp theo, hoặc ngay lập tức nếu tiến trình đã và đang chạy. Tuy nhiên, cũng có thể chặn (block) một tín hiệu bằng cách thêm nó vào mặt nạ tín hiệu (signal mask) của tiến trình. Nếu một tín hiệu được tạo ra trong khi nó bị chặn, nó vẫn ở trạng thái pending cho đến khi sau đó được bỏ chặn (unblocked - tức là xóa khỏi signal mask).


### **2.12 Luồng (Threads)**

Trong các bản thực thi UNIX hiện đại, mỗi tiến trình có thể có nhiều luồng thực thi (threads of execution). Một cách để hình dung về các thread là như một tập hợp các tiến trình chia sẻ cùng bộ nhớ ảo, cũng như một loạt các thuộc tính khác. Mỗi thread đang thực thi cùng mã chương trình và chia sẻ cùng vùng data và heap. Tuy nhiên, mỗi thread có stack riêng chứa các biến cục bộ và thông tin liên kết cuộc gọi hàm.

Các thread có thể giao tiếp với nhau qua các biến toàn cục mà chúng chia sẻ. Threading API cung cấp các condition variables và mutexes, là các nguyên thủy cho phép các thread của một tiến trình giao tiếp và đồng bộ hóa các hành động của chúng, đặc biệt là việc sử dụng các biến chia sẻ. Các thread cũng có thể giao tiếp với nhau bằng các cơ chế IPC và đồng bộ hóa được mô tả trong [Mục 2.10](#page-15-0).

Những ưu điểm chính của việc sử dụng thread là chúng giúp dễ dàng chia sẻ dữ liệu (qua các biến toàn cục) giữa các thread hợp tác và một số thuật toán chuyển sang bản thực thi đa luồng (multithreaded) tự nhiên hơn là bản thực thi đa tiến trình (multiprocess). Hơn nữa, một ứng dụng đa luồng có thể tận dụng một cách trong suốt các khả năng xử lý song song trên phần cứng đa bộ xử lý.


#### **2.13 Nhóm tiến trình và Quản lý tác vụ Shell (Process Groups và Job Control)**

Mỗi chương trình được thực thi bởi shell được bắt đầu trong một tiến trình mới. Ví dụ, shell tạo ra ba tiến trình để thực thi đường ống lệnh sau (hiển thị danh sách các file trong thư mục làm việc hiện tại được sắp xếp theo kích thước file):

```bash
$ ls -l | sort -k5n | less
```

Tất cả các shell chính, ngoại trừ Bourne shell, cung cấp một tính năng tương tác được gọi là quản lý tác vụ (job control), cho phép người dùng đồng thời thực thi và thao tác trên nhiều lệnh hoặc đường ống. Trong các shell có job control, tất cả các tiến trình trong một đường ống được đặt trong một nhóm tiến trình (process group) hoặc tác vụ (job) mới. (Trong trường hợp đơn giản của một dòng lệnh shell chứa một lệnh duy nhất, một nhóm tiến trình mới chỉ chứa một tiến trình duy nhất được tạo ra.) Mỗi tiến trình trong một nhóm tiến trình có cùng một định danh nhóm tiến trình dạng số nguyên, giống với process ID của một trong các tiến trình trong nhóm, gọi là trưởng nhóm tiến trình (process group leader).

Kernel cho phép các hành động khác nhau, đáng chú ý là việc chuyển giao các tín hiệu, được thực hiện trên tất cả các thành viên của một nhóm tiến trình. Các shell job-control sử dụng tính năng này để cho phép người dùng tạm dừng hoặc tiếp tục tất cả các tiến trình trong một đường ống, như được mô tả trong mục tiếp theo.


#### **2.14 Session, Terminal điều khiển, và Tiến trình điều khiển**

Một session là một tập hợp các nhóm tiến trình (jobs). Tất cả các tiến trình trong một session có cùng một định danh session (session identifier). Một session leader là tiến trình đã tạo ra session, và process ID của nó trở thành session ID.

Các session được sử dụng chủ yếu bởi các shell có job control. Tất cả các nhóm tiến trình được tạo ra bởi một shell job-control đều thuộc về cùng một session với shell, vốn là session leader.

Các session thường có một terminal điều khiển (controlling terminal) đi kèm. Terminal điều khiển được thiết lập khi tiến trình session leader lần đầu tiên mở một thiết bị terminal. Đối với một session được tạo bởi một shell tương tác, đây là terminal mà người dùng đã đăng nhập. Một terminal có thể là terminal điều khiển của tối đa một session.

Hệ quả của việc mở terminal điều khiển là session leader trở thành tiến trình điều khiển (controlling process) cho terminal. Tiến trình điều khiển nhận được tín hiệu `SIGHUP` nếu sự ngắt kết nối terminal xảy ra (ví dụ: nếu cửa sổ terminal bị đóng).

Tại bất kỳ thời điểm nào, một nhóm tiến trình trong một session là nhóm tiến trình tiền cảnh (foreground process group / foreground job), nhóm này có thể đọc đầu vào từ terminal và gửi đầu ra tới nó. Nếu người dùng gõ ký tự ngắt (thường là Control-C) hoặc ký tự tạm dừng (thường là Control-Z) trên terminal điều khiển, thì driver của terminal sẽ gửi một tín hiệu tiêu diệt hoặc tạm dừng (tức là dừng) nhóm tiến trình tiền cảnh. Một session có thể có bất kỳ số lượng nhóm tiến trình hậu cảnh (background process groups / background jobs) nào, vốn được tạo ra bằng cách kết thúc một lệnh bằng ký tự và (`&`).

Các shell job-control cung cấp các lệnh để liệt kê tất cả các job, gửi tín hiệu đến các job, và di chuyển các job giữa foreground và background.


### **2.15 Pseudoterminal**

Một pseudoterminal là một cặp thiết bị ảo kết nối với nhau, được gọi là master và slave. Cặp thiết bị này cung cấp một kênh IPC cho phép dữ liệu được truyền theo cả hai hướng giữa hai thiết bị.

Điểm mấu chốt về một pseudoterminal là thiết bị slave cung cấp một giao diện hoạt động giống như một terminal, điều này giúp có thể kết nối một chương trình định hướng terminal đến thiết bị slave và sau đó sử dụng một chương trình khác kết nối với thiết bị master để điều khiển chương trình định hướng terminal đó. Đầu ra được ghi bởi chương trình điều khiển sẽ trải qua quá trình xử lý đầu vào thông thường được thực hiện bởi terminal driver (ví dụ: ở chế độ mặc định, ký tự carriage return được ánh xạ thành newline) và sau đó được chuyển làm đầu vào cho chương trình định hướng terminal kết nối với slave. Bất cứ điều gì mà chương trình định hướng terminal ghi vào slave sẽ được chuyển (sau khi thực hiện tất cả quá trình xử lý đầu ra terminal thông thường) làm đầu vào cho chương trình điều khiển. Nói cách khác, chương trình điều khiển đang thực hiện chức năng thường được thực hiện bởi người dùng tại một terminal thông thường.

Pseudoterminal được sử dụng trong nhiều ứng dụng khác nhau, đáng chú ý nhất là trong việc triển khai các cửa sổ terminal được cung cấp dưới đăng nhập X Window System và trong các ứng dụng cung cấp dịch vụ đăng nhập mạng, chẳng hạn như `telnet` và `ssh`.


#### **2.16 Ngày và Giờ**

Hai loại thời gian mà một tiến trình quan tâm là:
* **Thời gian thực (Real time)** được đo từ một mốc chuẩn nào đó (thời gian lịch - calendar time) hoặc từ một mốc cố định, thường là lúc bắt đầu, trong vòng đời của một tiến trình (thời gian trôi qua - elapsed / wall clock time). Trên các hệ thống UNIX, calendar time được đo bằng giây tính từ nửa đêm sáng ngày 1 tháng 1 năm 1970, Giờ Phối hợp Quốc tế (thường viết tắt là UTC), và được phối hợp trên điểm gốc cho các múi giờ được định nghĩa bởi đường kinh tuyến đi qua Greenwich, Anh. Ngày này, vốn gần với sự ra đời của hệ thống UNIX, được gọi là Epoch.
* **Thời gian tiến trình (Process time)**, còn được gọi là CPU time, là tổng lượng thời gian CPU mà một tiến trình đã sử dụng kể từ khi bắt đầu. CPU time được chia tiếp thành system CPU time, thời gian dành để thực thi mã ở kernel mode (tức là thực thi các system call và thực hiện các dịch vụ kernel khác thay mặt cho tiến trình), và user CPU time, thời gian dành để thực thi mã ở user mode (tức là thực thi mã chương trình bình thường).

Lệnh `time` hiển thị thời gian thực, system CPU time, và user CPU time tiêu tốn để thực thi các tiến trình trong một đường ống.


### **2.17 Kiến trúc Client-Server**

Tại nhiều điểm khác nhau trong cuốn sách này, chúng ta thảo luận về thiết kế và triển khai các ứng dụng client-server.

Một ứng dụng client-server là ứng dụng được chia thành hai tiến trình thành phần:
* **Client**: yêu cầu server thực hiện một số dịch vụ bằng cách gửi cho nó một thông điệp yêu cầu (request message); và
* **Server**: kiểm tra yêu cầu của client, thực hiện các hành động thích hợp, và sau đó gửi một thông điệp phản hồi (response message) trở lại cho client.

Đôi khi, client và server có thể tham gia vào một cuộc đối thoại mở rộng gồm các yêu cầu và phản hồi.

Thông thường, ứng dụng client tương tác với người dùng, trong khi ứng dụng server cung cấp quyền truy cập vào một số tài nguyên chia sẻ. Thường thì có nhiều thể hiện của các tiến trình client giao tiếp với một hoặc một vài thể hiện của tiến trình server.

Client và server có thể nằm trên cùng một máy tính chủ hoặc trên các máy chủ riêng biệt được kết nối qua mạng. Để giao tiếp với nhau, client và server sử dụng các cơ chế IPC được thảo luận trong [Mục 2.10](#page-15-0).

Các server có thể triển khai nhiều dịch vụ khác nhau, chẳng hạn như:
* Cung cấp quyền truy cập vào cơ sở dữ liệu hoặc tài nguyên thông tin chia sẻ khác;
* Cung cấp quyền truy cập vào một file từ xa qua mạng;
* Đóng gói một số logic nghiệp vụ (business logic);
* Cung cấp quyền truy cập vào một tài nguyên phần cứng chia sẻ (ví dụ: máy in); hoặc
* Phục vụ các trang web.

Đóng gói một dịch vụ trong một server duy nhất là hữu ích vì một số lý do, chẳng hạn như sau:
* **Hiệu quả (Efficiency)**: Có thể rẻ hơn khi cung cấp một thể hiện của một tài nguyên (ví dụ: máy in) được quản lý bởi một server hơn là cung cấp cùng một tài nguyên cục bộ trên mỗi máy tính.
* **Kiểm soát, điều phối, và bảo mật (Control, coordination, and security)**: Bằng cách giữ một tài nguyên (đặc biệt là tài nguyên thông tin) tại một vị trí duy nhất, server có thể điều phối quyền truy cập vào tài nguyên (ví dụ: để hai client không đồng thời cập nhật cùng một mẩu thông tin) hoặc bảo mật nó để nó chỉ khả dụng cho các client được chọn.
* **Hoạt động trong một môi trường dị thể (Heterogeneous environment)**: Trong một mạng, các client khác nhau, và server, có thể chạy trên các nền tảng phần cứng và hệ điều hành khác nhau.


#### **2.18 Realtime**

Các ứng dụng realtime là những ứng dụng cần phản hồi kịp thời đối với đầu vào. Thường thì, đầu vào như vậy đến từ một cảm biến bên ngoài hoặc một thiết bị đầu vào chuyên dụng, và đầu ra có dạng kiểm soát một số phần cứng bên ngoài. Các ví dụ về ứng dụng có yêu cầu phản hồi realtime bao gồm các dây chuyền lắp ráp tự động, cây ATM ngân hàng, và các hệ thống dẫn đường máy bay.

Mặc dù nhiều ứng dụng realtime yêu cầu phản hồi nhanh chóng đối với đầu vào, yếu tố quyết định là phản hồi được đảm bảo sẽ được chuyển giao trong một khoảng thời gian hạn định (deadline time) nhất định sau sự kiện kích hoạt.

Việc cung cấp khả năng phản hồi realtime, đặc biệt là nơi yêu cầu thời gian phản hồi ngắn, đòi hỏi sự hỗ trợ từ hệ điều hành bên dưới. Hầu hết các hệ điều hành không hỗ trợ nguyên bản điều này vì các yêu cầu về khả năng phản hồi realtime có thể xung đột với các yêu cầu của các hệ điều hành chia sẻ thời gian đa người dùng (multiuser timesharing operating systems). Các bản thực thi UNIX truyền thống không phải là hệ điều hành realtime, mặc dù các biến thể realtime đã được thiết kế. Các biến thể realtime của Linux cũng đã được tạo ra, và các kernel Linux gần đây đang tiến tới hỗ trợ nguyên bản đầy đủ cho các ứng dụng realtime.

POSIX.1b đã định nghĩa một số mở rộng cho POSIX.1 cho việc hỗ trợ các ứng dụng realtime. Chúng bao gồm I/O bất đồng bộ (asynchronous I/O), bộ nhớ chia sẻ (shared memory), các file được ánh xạ bộ nhớ (memory-mapped files), khóa bộ nhớ (memory locking), đồng hồ và bộ hẹn giờ realtime (realtime clocks and timers), các chính sách lập lịch thay thế (alternative scheduling policies), tín hiệu realtime (realtime signals), hàng đợi thông điệp (message queues), và semaphores. Mặc dù không đủ điều kiện khắt khe là realtime, hầu hết các bản thực thi UNIX hiện hỗ trợ một số hoặc tất cả các mở rộng này. (Trong suốt cuốn sách này, chúng ta mô tả các tính năng của POSIX.1b được Linux hỗ trợ.)

Trong cuốn sách này, chúng ta sử dụng thuật ngữ *real time* (hai từ) để chỉ khái niệm thời gian lịch hoặc thời gian trôi qua, và thuật ngữ *realtime* (một từ) để biểu thị một hệ điều hành hoặc ứng dụng cung cấp loại khả năng phản hồi được mô tả trong mục này.


### **2.19 File System /proc**

Giống như một số bản thực thi UNIX khác, Linux cung cấp một file system `/proc`, bao gồm một tập hợp các thư mục và file được mount dưới thư mục `/proc`.

File system `/proc` là một file system ảo cung cấp một giao diện cho các cấu trúc dữ liệu của kernel dưới dạng trông giống như các file và thư mục trên một file system. Điều này cung cấp một cơ chế dễ dàng để xem và thay đổi các thuộc tính hệ thống khác nhau. Ngoài ra, một tập hợp các thư mục có tên dạng `/proc/PID`, trong đó PID là một process ID, cho phép chúng ta xem thông tin về từng tiến trình đang chạy trên hệ thống.

Nội dung của các file `/proc` nói chung ở dạng văn bản mà con người có thể đọc được và có thể được parse bởi các shell script. Một chương trình có thể chỉ đơn giản mở và đọc từ, hoặc ghi vào, file mong muốn. Trong hầu hết các trường hợp, một tiến trình phải có đặc quyền để sửa đổi nội dung của các file trong thư mục `/proc`.

Khi chúng ta mô tả các phần khác nhau của giao diện lập trình Linux, chúng ta cũng sẽ mô tả các file `/proc` liên quan. Mục 12.1 cung cấp thêm thông tin chung về file system này. File system `/proc` không được quy định bởi bất kỳ tiêu chuẩn nào, và các chi tiết mà chúng ta mô tả mang tính đặc thù của Linux.


#### **2.20 Tóm tắt**

Trong chương này, chúng ta đã khảo sát một loạt các khái niệm cơ bản liên quan đến lập trình hệ thống Linux. Việc hiểu các khái niệm này sẽ cung cấp cho người đọc chưa có nhiều kinh nghiệm trên Linux hoặc UNIX đủ nền tảng để bắt đầu học lập trình hệ thống.
