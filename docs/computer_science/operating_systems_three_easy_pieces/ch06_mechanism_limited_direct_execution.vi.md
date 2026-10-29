# 6 Mechanism: Limited Direct Execution

Để virtualize CPU, operating system phải bằng cách nào đó chia sẻ CPU vật lý giữa nhiều job dường như đang chạy cùng lúc. Ý tưởng cơ bản rất đơn giản: chạy một process trong một khoảng thời gian ngắn, rồi chạy process khác, cứ như vậy. Bằng cách time sharing CPU theo cách này, ta đạt được virtualization.

Tuy nhiên, việc xây dựng mechanism virtualization như vậy đặt ra một số thách thức. Thứ nhất là hiệu năng: làm thế nào triển khai virtualization mà không gây thêm overhead quá mức cho hệ thống? Thứ hai là quyền điều khiển: làm thế nào chạy các process hiệu quả mà vẫn giữ quyền điều khiển CPU? Quyền điều khiển đặc biệt quan trọng với OS vì nó chịu trách nhiệm về tài nguyên; nếu không có quyền điều khiển, process có thể cứ chạy mãi và chiếm cả máy, hoặc truy cập thông tin mà nó không được phép truy cập. Vì vậy, đạt hiệu năng cao trong khi vẫn giữ quyền điều khiển là một trong những thách thức trọng tâm khi xây dựng operating system.

> MẤU CHỐT:
>
> LÀM THẾ NÀO ĐỂ VIRTUALIZE CPU HIỆU QUẢ MÀ VẪN GIỮ QUYỀN ĐIỀU KHIỂN
>
> OS phải virtualize CPU hiệu quả trong khi vẫn giữ quyền điều khiển hệ thống. Để làm vậy, cần cả hỗ trợ hardware lẫn operating-system. OS thường tận dụng một phần hỗ trợ hardware được lựa chọn khéo léo để hoàn thành công việc hiệu quả.

## 6.1 Kỹ thuật cơ bản: Limited Direct Execution

Để chương trình chạy nhanh như mong đợi, không ngạc nhiên khi những người phát triển OS nghĩ ra một kỹ thuật mà ta gọi là limited direct execution. Phần “direct execution” của ý tưởng rất đơn giản: chỉ việc chạy chương trình trực tiếp trên CPU. Vì vậy, khi OS muốn bắt đầu chạy chương trình, nó tạo một process entry trong process list, cấp phát một ít memory, load code chương trình vào memory (từ đĩa), xác định entry point (tức routine main() hoặc thứ tương tự), nhảy đến đó và bắt đầu chạy code của người dùng. Hình 6.1 cho thấy protocol direct execution cơ bản này (hiện chưa có giới hạn), dùng call và return thông thường để nhảy đến main() của chương trình rồi sau đó quay lại kernel.

| OS | Chương trình |
|---|---|
| Tạo entry trong process list |  |
| Cấp phát memory cho chương trình |  |
| Load chương trình vào memory |  |
| Thiết lập stack với argc/argv |  |
| Xóa các register |  |
| Thực hiện call main() |  |
|  | Chạy main() |
|  | Thực hiện return từ main |
| Giải phóng memory của process |  |
| Xóa khỏi process list |  |

Hình 6.1: Protocol Direct Execution (chưa có giới hạn)

Nghe đơn giản, phải không? Nhưng cách này làm nảy sinh một số vấn đề trên hành trình virtualize CPU. Vấn đề đầu tiên rất đơn giản: nếu chỉ chạy chương trình, làm thế nào OS bảo đảm chương trình không làm điều ta không muốn, trong khi vẫn chạy nó hiệu quả? Vấn đề thứ hai: khi một process đang chạy, operating system dừng nó rồi chuyển sang process khác như thế nào để thực hiện time sharing cần cho virtualization CPU?

Khi trả lời các câu hỏi này bên dưới, ta sẽ hiểu rõ hơn nhiều những gì cần để virtualize CPU. Khi phát triển các kỹ thuật này, ta cũng sẽ thấy phần “limited” trong tên gọi xuất phát từ đâu; nếu không giới hạn chương trình đang chạy, OS sẽ chẳng kiểm soát được gì và do đó “chỉ là một thư viện” — một tình cảnh thật đáng buồn cho một operating system đầy tham vọng!

## 6.2 Vấn đề #1: Restricted operation

Direct execution có ưu điểm rõ ràng là nhanh; chương trình chạy native trên CPU hardware nên thực thi nhanh như mong đợi. Nhưng chạy trên CPU dẫn đến một vấn đề: nếu process muốn thực hiện restricted operation nào đó, như gửi I/O request đến đĩa hoặc truy cập thêm tài nguyên hệ thống như CPU hay memory, thì sao?

> MẤU CHỐT: LÀM THẾ NÀO ĐỂ THỰC HIỆN RESTRICTED OPERATION
>
> Process phải có khả năng thực hiện I/O và một số restricted operation khác, nhưng không được trao toàn quyền điều khiển hệ thống. OS và hardware có thể phối hợp thực hiện điều đó như thế nào?
>
> MẸO: SỬ DỤNG PROTECTED CONTROL TRANSFER
>
> Hardware hỗ trợ OS bằng cách cung cấp các execution mode khác nhau. Trong user mode, ứng dụng không có toàn quyền truy cập tài nguyên hardware. Trong kernel mode, OS có quyền truy cập toàn bộ tài nguyên của máy. Hardware cũng cung cấp các instruction đặc biệt để trap vào kernel và return-from-trap trở lại chương trình user-mode, cùng những instruction cho phép OS báo cho hardware biết trap table nằm ở đâu trong memory.

Một cách đơn giản là để mọi process làm bất cứ điều gì chúng muốn về I/O và các thao tác liên quan. Tuy nhiên, làm vậy sẽ khiến ta không thể xây dựng nhiều loại hệ thống mong muốn. Ví dụ, nếu muốn xây dựng file system kiểm tra permission trước khi cấp quyền truy cập file, ta không thể cứ cho phép mọi user process gửi I/O đến đĩa; nếu làm vậy, process có thể đọc hoặc ghi toàn bộ đĩa, và mọi protection sẽ mất tác dụng.

Vì vậy, cách ta chọn là đưa vào một processor mode mới, gọi là user mode; code chạy trong user mode bị giới hạn những gì có thể làm. Ví dụ, khi chạy trong user mode, process không thể gửi I/O request; nếu làm vậy, processor sẽ phát sinh exception; sau đó OS có thể sẽ kill process.

Đối lập với user mode là kernel mode, nơi operating system (hay kernel) chạy. Trong mode này, code đang chạy có thể làm những gì nó muốn, bao gồm privileged operation như gửi I/O request và thực thi mọi loại restricted instruction.

Tuy nhiên, ta vẫn còn một thách thức: user process nên làm gì khi muốn thực hiện privileged operation nào đó, chẳng hạn đọc từ đĩa? Để hỗ trợ điều này, gần như mọi hardware hiện đại đều cho phép user program thực hiện system call. Đi tiên phong trên các máy đời đầu như Atlas [K+61,L78], system call cho phép kernel cung cấp một cách cẩn trọng một số chức năng then chốt cho user program, như truy cập file system, tạo và hủy process, giao tiếp với process khác và cấp phát thêm memory. Phần lớn operating system cung cấp vài trăm lời gọi (xem chuẩn POSIX để biết chi tiết [P10]); các hệ thống Unix ban đầu cung cấp tập con gọn hơn, khoảng hai mươi lời gọi.

Để thực hiện system call, chương trình phải thực thi một trap instruction đặc biệt. Instruction này đồng thời nhảy vào kernel và nâng privilege level lên kernel mode; khi đã vào kernel, hệ thống có thể thực hiện mọi privileged operation cần thiết (nếu được phép), nhờ đó làm công việc mà process gọi yêu cầu. Khi xong, OS gọi một instruction return-from-trap đặc biệt; như bạn có thể đoán, nó quay về user program gọi hàm, đồng thời hạ privilege level trở lại user mode.

Hardware cần cẩn thận một chút khi thực thi trap: phải bảo đảm lưu đủ các register của bên gọi để có thể quay về đúng khi OS thực thi instruction return-from-trap. Ví dụ trên x86, processor sẽ push program counter, flag và một vài register khác lên kernel stack per-process; return-from-trap sẽ pop các giá trị này khỏi stack và tiếp tục thực thi chương trình user-mode (xem tài liệu hệ thống Intel [I11] để biết chi tiết). Các hệ thống hardware khác dùng quy ước khác, nhưng khái niệm cơ bản tương tự giữa các nền tảng.

> THÔNG TIN THÊM: VÌ SAO SYSTEM CALL TRÔNG GIỐNG PROCEDURE CALL
>
> Bạn có thể thắc mắc vì sao lời gọi system call, như open() hoặc read(), trông hệt một procedure call C thông thường; nghĩa là, nếu trông giống procedure call, làm thế nào hệ thống biết đó là system call và thực hiện đúng mọi việc? Lý do đơn giản: nó là procedure call, nhưng ẩn bên trong procedure call đó là trap instruction nổi tiếng. Cụ thể hơn, khi gọi open() chẳng hạn, bạn đang thực hiện procedure call vào thư viện C. Ở đó, dù là open() hay bất kỳ system call nào khác được cung cấp, thư viện dùng calling convention agreed-upon với kernel để đặt các argument của open vào vị trí well-known (ví dụ trên stack hoặc trong register cụ thể), cũng đặt system-call number vào vị trí well-known (một lần nữa là trên stack hoặc register), rồi thực thi trap instruction nói trên. Code trong thư viện sau trap lấy ra các return value và trả quyền điều khiển cho chương trình đã thực hiện system call. Vì vậy, các phần thư viện C thực hiện system call được hand-coded bằng assembly, vì chúng cần tuân thủ quy ước cẩn thận để xử lý đúng argument và return value, cũng như thực thi trap instruction hardware-specific. Giờ bạn đã biết vì sao bản thân mình không phải viết code assembly để trap vào OS; đã có người viết phần assembly đó cho bạn.

Có một chi tiết quan trọng chưa được đề cập trong thảo luận này: làm thế nào trap biết phải chạy code nào trong OS? Rõ ràng process gọi không thể chỉ định address để nhảy đến (như khi thực hiện procedure call); làm vậy sẽ cho phép chương trình nhảy đến bất kỳ đâu trong kernel, rõ ràng là ý tưởng tồi (hãy tưởng tượng nhảy vào code truy cập file nhưng ngay sau bước kiểm tra permission; thực ra, khả năng như vậy có lẽ cho phép lập trình viên khôn khéo khiến kernel chạy những chuỗi code tùy ý [S07]). Vì vậy, kernel phải kiểm soát cẩn thận code nào được thực thi khi có trap.

Kernel làm vậy bằng cách thiết lập trap table lúc boot. Khi máy boot, nó ở privileged mode (kernel mode), do đó có thể tự do cấu hình hardware của máy theo nhu cầu. Vì vậy, một trong những việc đầu tiên OS làm là báo cho hardware biết phải chạy code nào khi những exceptional event nhất định xảy ra. Ví dụ, code nào nên chạy khi có hard-disk interrupt, khi có keyboard interrupt hoặc khi chương trình thực hiện system call? OS báo cho hardware vị trí các trap handler này, thường bằng một loại instruction đặc biệt. Khi được thông báo, hardware ghi nhớ vị trí các handler cho đến lần reboot tiếp theo, nhờ đó biết phải làm gì (tức nhảy đến code nào) khi xảy ra system call và exceptional event khác.

| OS khi boot | Hardware |
|---|---|
| (kernel mode) |  |
| khởi tạo trap table |  |
|  | ghi nhớ address của... |
|  | syscall handler |

| OS khi chạy | Hardware | Chương trình |
|---|---|---|
| (kernel mode) |  | (user mode) |
| Tạo entry trong process list |  |  |
| Cấp phát memory cho chương trình |  |  |
| Load chương trình vào memory |  |  |
| Thiết lập user stack với argv |  |  |
| Điền reg/PC vào kernel stack |  |  |
| return-from-trap |  |  |
|  | khôi phục regs từ kernel stack |  |
|  | chuyển sang user mode |  |
|  | nhảy đến main |  |
|  |  | Chạy main() |
|  |  | ... |
|  |  | Thực hiện system call |
|  |  | trap vào OS |
|  | lưu regs vào kernel stack |  |
|  | chuyển sang kernel mode |  |
|  | nhảy đến trap handler |  |
| Xử lý trap |  |  |
| Thực hiện công việc của syscall |  |  |
| return-from-trap |  |  |
|  | khôi phục regs từ kernel stack |  |
|  | chuyển sang user mode |  |
|  | nhảy đến PC sau trap |  |
|  |  | ... |
|  |  | return từ main |
|  |  | trap (qua exit()) |
| Giải phóng memory của process |  |  |
| Xóa khỏi process list |  |  |

Hình 6.2: Protocol Limited Direct Execution

Một thông tin thêm cuối cùng: khả năng thực thi instruction báo cho hardware biết trap table ở đâu là một khả năng rất mạnh. Vì vậy, như bạn có thể đoán, đó cũng là privileged operation. Nếu thử thực thi instruction này trong user mode, hardware sẽ không cho phép, và có lẽ bạn đoán được chuyện gì xảy ra (gợi ý: tạm biệt chương trình vi phạm). Điều đáng suy ngẫm: bạn có thể làm những điều khủng khiếp gì với hệ thống nếu cài được trap table của riêng mình? Bạn có thể chiếm cả máy không?

Timeline (với thời gian tăng từ trên xuống trong Hình 6.2) tóm tắt protocol. Ta giả sử mỗi process có kernel stack, nơi register (bao gồm general purpose register và program counter) được hardware lưu vào và khôi phục từ đó khi chuyển vào và ra khỏi kernel.

Protocol LDE có hai giai đoạn. Trong giai đoạn đầu (lúc boot), kernel khởi tạo trap table và CPU ghi nhớ vị trí để dùng về sau. Kernel làm vậy qua privileged instruction (tất cả privileged instruction được tô đậm).

Trong giai đoạn thứ hai (khi chạy process), kernel thiết lập một vài thứ (ví dụ cấp phát node trong process list, cấp phát memory) trước khi dùng instruction return-from-trap để bắt đầu thực thi process; điều này chuyển CPU sang user mode và bắt đầu chạy process. Khi process muốn thực hiện system call, nó trap trở lại OS, OS xử lý rồi lại trả quyền điều khiển cho process qua return-from-trap. Sau đó process hoàn thành công việc và return từ main(); thường điều này quay về một đoạn stub code để thoát chương trình đúng cách (chẳng hạn gọi system call exit(), trap vào OS). Lúc này, OS dọn dẹp và mọi việc hoàn tất.

## 6.3 Vấn đề #2: Chuyển giữa các process

Vấn đề tiếp theo với direct execution là thực hiện chuyển đổi giữa các process. Chuyển giữa các process hẳn phải đơn giản, đúng không? OS chỉ cần quyết định dừng process này và bắt đầu process khác. Có gì lớn lao đâu? Nhưng thực ra hơi khó: cụ thể, nếu một process đang chạy trên CPU thì theo định nghĩa điều đó có nghĩa OS không chạy. Nếu OS không chạy, làm sao nó làm được bất cứ việc gì? (gợi ý: nó không thể) Dù nghe gần như triết học, đây là vấn đề thực tế: rõ ràng OS không có cách thực hiện hành động nếu không chạy trên CPU. Vì vậy, ta đi đến mấu chốt của vấn đề.

> MẤU CHỐT: LÀM THẾ NÀO ĐỂ GIÀNH LẠI QUYỀN ĐIỀU KHIỂN CPU
>
> Operating system có thể giành lại quyền điều khiển CPU để chuyển giữa các process bằng cách nào?

### Cách tiếp cận cooperative: Chờ system call

Một cách mà một số hệ thống từng dùng trong quá khứ (ví dụ các phiên bản đầu của operating system Macintosh [M11], hoặc hệ thống Xerox Alto cũ [A79]) được gọi là cách tiếp cận cooperative. Theo cách này, OS tin rằng các process của hệ thống sẽ hành xử hợp lý. Những process chạy quá lâu được giả định sẽ định kỳ nhường CPU để OS có thể quyết định chạy tác vụ khác.

Vì vậy, bạn có thể hỏi, process thân thiện nhường CPU như thế nào trong thế giới lý tưởng này? Hóa ra phần lớn process chuyển quyền điều khiển CPU cho OS khá thường xuyên bằng cách thực hiện system call, ví dụ mở file rồi đọc nó, gửi thông điệp đến máy khác hoặc tạo process mới. Những hệ thống như vậy thường có system call yield tường minh, không làm gì ngoài chuyển quyền điều khiển cho OS để nó có thể chạy process khác.

> MẸO: XỬ LÝ ỨNG DỤNG HÀNH XỬ SAI
>
> Operating system thường phải xử lý các process hành xử sai, tức những process cố làm điều không nên làm, do chủ ý thiết kế (ác ý) hoặc vô tình (bug). Trong hệ thống hiện đại, cách OS cố xử lý hành vi sai trái như vậy đơn giản là kết thúc process vi phạm. Vi phạm một lần là bị loại! Có thể khắc nghiệt, nhưng OS nên làm gì khác khi bạn cố truy cập memory trái phép hoặc thực thi illegal instruction?

Ứng dụng cũng chuyển quyền điều khiển cho OS khi làm điều không hợp lệ. Ví dụ, nếu ứng dụng chia cho không hoặc cố truy cập memory mà nó không được phép truy cập, nó sẽ tạo trap vào OS. Khi đó OS lại có quyền điều khiển CPU (và có thể sẽ kết thúc process vi phạm).

Vì vậy, trong hệ thống cooperative scheduling, OS giành lại quyền điều khiển CPU bằng cách chờ system call hoặc một thao tác không hợp lệ nào đó xảy ra. Có lẽ bạn cũng nghĩ: cách tiếp cận thụ động này chẳng phải chưa lý tưởng sao? Ví dụ, điều gì xảy ra nếu process (dù độc hại hay chỉ đầy bug) rơi vào infinite loop và không bao giờ thực hiện system call? Khi đó OS có thể làm gì?

### Cách tiếp cận Non-Cooperative: OS nắm quyền điều khiển

Hóa ra nếu không có hỗ trợ bổ sung từ hardware, OS chẳng làm được gì nhiều khi process từ chối thực hiện system call (hoặc mắc lỗi) để nhờ đó trả quyền điều khiển cho OS. Thực ra, trong cách cooperative, biện pháp duy nhất khi process mắc kẹt trong infinite loop là dùng giải pháp age-old cho mọi vấn đề hệ thống máy tính: reboot máy. Vì thế, ta lại đi đến một bài toán con trên hành trình tổng quát giành quyền điều khiển CPU.

> MẤU CHỐT: LÀM THẾ NÀO ĐỂ GIÀNH QUYỀN ĐIỀU KHIỂN KHI KHÔNG CÓ SỰ HỢP TÁC
>
> Làm thế nào OS giành quyền điều khiển CPU ngay cả khi các process không hợp tác? OS có thể làm gì để bảo đảm process bất trị không chiếm cả máy?

Hóa ra câu trả lời rất đơn giản và đã được nhiều người xây dựng hệ thống máy tính khám phá từ nhiều năm trước: timer interrupt [M+63]. Timer device có thể được lập trình để phát sinh interrupt sau mỗi khoảng vài millisecond; khi interrupt phát sinh, process hiện đang chạy bị dừng và interrupt handler pre-configured trong OS chạy. Lúc này, OS đã giành lại quyền điều khiển CPU nên có thể làm điều nó muốn: dừng process hiện tại và bắt đầu process khác.

> MẸO: DÙNG TIMER INTERRUPT ĐỂ GIÀNH LẠI QUYỀN ĐIỀU KHIỂN
>
> Bổ sung timer interrupt cho OS khả năng chạy lại trên CPU ngay cả khi các process hành xử theo cách non-cooperative. Vì vậy, tính năng hardware này thiết yếu để giúp OS duy trì quyền điều khiển máy.

Như đã thảo luận với system call, OS phải báo cho hardware biết chạy code nào khi timer interrupt xảy ra; vì vậy, lúc boot, OS thực hiện đúng điều đó. Thứ hai, cũng trong chuỗi boot, OS phải khởi động timer, tất nhiên là một privileged operation. Khi timer đã chạy, OS có thể yên tâm rằng cuối cùng quyền điều khiển sẽ được trả lại, nên có thể cho user program chạy. Timer cũng có thể bị tắt (cũng là privileged operation), điều ta sẽ thảo luận sau khi hiểu concurrency chi tiết hơn.

Lưu ý hardware có một số trách nhiệm khi interrupt xảy ra, đặc biệt là lưu đủ trạng thái của chương trình đang chạy lúc interrupt xảy ra để instruction return-from-trap sau đó có thể tiếp tục chương trình đúng cách. Tập hợp hành động này khá giống hành vi của hardware trong một system-call trap tường minh vào kernel: các register được lưu (ví dụ lên kernel stack) và nhờ đó dễ được khôi phục bằng instruction return-from-trap.

### Lưu và khôi phục context

Giờ đây, khi OS đã giành lại quyền điều khiển, dù theo cách cooperative qua system call hay cưỡng chế hơn qua timer interrupt, cần đưa ra quyết định: tiếp tục chạy process currently-running hay chuyển sang process khác. Quyết định này do phần operating system gọi là scheduler đưa ra; ta sẽ thảo luận scheduling policy rất chi tiết trong vài chương tới.

Nếu quyết định chuyển đổi, OS thực thi một đoạn code low-level mà ta gọi là context switch. Về khái niệm, context switch rất đơn giản: tất cả những gì OS phải làm là lưu một vài giá trị register của process currently-executing (ví dụ lên kernel stack của nó) và khôi phục một vài giá trị cho process soon-to-be-executing (từ kernel stack của process đó). Nhờ vậy, OS bảo đảm khi instruction return-from-trap cuối cùng được thực thi, thay vì quay về process đang chạy trước đó, hệ thống tiếp tục thực thi process khác.

Để lưu context của process currently-running, OS thực thi một ít code assembly low-level để lưu general purpose register, PC và kernel stack pointer của process currently-running, rồi khôi phục các register và PC đó, đồng thời chuyển sang kernel stack của process soon-to-be-executing. Bằng cách chuyển stack, kernel đi vào lời gọi code switch trong context của một process (process bị interrupt) và trả về trong context của process khác (process soon-to-be-executing). Khi OS cuối cùng thực thi instruction return-from-trap, process soon-to-be-executing trở thành process currently-running. Và như vậy context switch hoàn tất.

| OS khi boot | Hardware |
|---|---|
| (kernel mode) |  |
| khởi tạo trap table |  |
|  | ghi nhớ address của... |
|  | syscall handler |
|  | timer handler |
| khởi động interrupt timer |  |
|  | khởi động timer |
|  | interrupt CPU sau X ms |

| OS khi chạy | Hardware | Chương trình |
|---|---|---|
| (kernel mode) |  | (user mode) |
|  |  | Process A |
|  |  | ... |
|  | timer interrupt |  |
|  | lưu regs(A) vào k-stack(A) |  |
|  | chuyển sang kernel mode |  |
|  | nhảy đến trap handler |  |
| Xử lý trap |  |  |
| Gọi routine switch() |  |  |
| lưu regs(A) vào proc-struct(A) |  |  |
| khôi phục regs(B) từ proc-struct(B) |  |  |
| chuyển sang k-stack(B) |  |  |
| return-from-trap (vào B) |  |  |
|  | khôi phục regs(B) từ k-stack(B) |  |
|  | chuyển sang user mode |  |
|  | nhảy đến PC của B |  |
|  |  | Process B |
|  |  | ... |

Hình 6.3: Protocol Limited Direct Execution (Timer Interrupt)

Timeline của toàn bộ quá trình được trình bày trong Hình 6.3. Trong ví dụ này, Process A đang chạy rồi bị timer interrupt ngắt. Hardware lưu các register của nó (lên kernel stack) và đi vào kernel (chuyển sang kernel mode). Trong timer interrupt handler, OS quyết định chuyển từ chạy Process A sang Process B. Khi đó, nó gọi routine switch(), cẩn thận lưu các giá trị register hiện tại (vào process structure của A), khôi phục register của Process B (từ entry process structure của nó), rồi chuyển context, cụ thể bằng cách đổi stack pointer để dùng kernel stack của B (thay cho A). Cuối cùng, OS thực hiện returns-from-trap, khôi phục register của B và bắt đầu chạy B.

Lưu ý có hai loại thao tác lưu/khôi phục register xảy ra trong protocol này. Thứ nhất là khi timer interrupt xảy ra; trong trường hợp này, user register của process đang chạy được hardware lưu ngầm, dùng kernel stack của process đó. Thứ hai là khi OS quyết định chuyển từ A sang B; trong trường hợp này, kernel register được software (tức OS) lưu tường minh, nhưng lần này lưu vào memory trong process structure của process. Hành động sau chuyển hệ thống từ thực thi như thể vừa trap vào kernel từ A sang thực thi như thể vừa trap vào kernel từ B.

```
 1   # void swtch(struct context **old, struct context *new);
 2   #
 3   # Save current register context in old
 4   # and then load register context from new.
 5   .globl swtch
 6   swtch:
 7     # Save old registers
 8     movl 4(%esp), %eax  # put old ptr into eax
 9     popl 0(%eax)        # save the old IP
10     movl %esp, 4(%eax)  # and stack
11     movl %ebx, 8(%eax)  # and other registers
12     movl %ecx, 12(%eax)
13     movl %edx, 16(%eax)
14     movl %esi, 20(%eax)
15     movl %edi, 24(%eax)
16     movl %ebp, 28(%eax)
17
18     # Load new registers
19     movl 4(%esp), %eax  # put new ptr into eax
20     movl 28(%eax), %ebp # restore other registers
21     movl 24(%eax), %edi
22     movl 20(%eax), %esi
23     movl 16(%eax), %edx
24     movl 12(%eax), %ecx
25     movl 8(%eax), %ebx
26     movl 4(%eax), %esp  # stack is switched here
27     pushl 0(%eax)       # return addr put in place
28     ret                 # finally return into new ctxt
```

Hình 6.4: Code Context Switch của xv6

Để giúp bạn hình dung rõ hơn cách thực hiện chuyển đổi như vậy, Hình 6.4 trình bày code context switch của xv6. Hãy thử xem bạn có hiểu nó không (để làm vậy, bạn phải biết một chút x86 và xv6). Các context structure old và new lần lượt nằm trong process structure của process cũ và mới.

## 6.4 Lo ngại về concurrency?

Một số bạn, những độc giả chăm chú và hay suy nghĩ, có lẽ đang nghĩ: “Ừm... điều gì xảy ra khi timer interrupt xuất hiện trong lúc thực hiện system call?” hoặc “Điều gì xảy ra khi đang xử lý interrupt này thì interrupt khác xuất hiện? Chẳng phải như vậy sẽ khó xử lý trong kernel sao?” Những câu hỏi hay — chúng tôi thực sự vẫn đặt hy vọng ở bạn!

Câu trả lời là có, OS thực sự cần quan tâm điều gì xảy ra nếu một interrupt khác xuất hiện trong lúc xử lý interrupt hoặc trap. Thực ra, đây chính là chủ đề của toàn bộ phần thứ hai cuốn sách, về concurrency; ta sẽ để dành thảo luận chi tiết đến lúc đó.

> THÔNG TIN THÊM: CONTEXT SWITCH MẤT BAO LÂU
>
> Một câu hỏi tự nhiên mà bạn có thể đặt ra là: thao tác như context switch mất bao lâu? Hay thậm chí system call mất bao lâu? Nếu tò mò, có công cụ tên lmbench [MS96] đo chính xác những điều đó, cùng một số thước đo hiệu năng khác có thể liên quan.
>
> Kết quả đã cải thiện khá nhiều theo thời gian, gần tương ứng với hiệu năng processor. Ví dụ, năm 1996, khi chạy Linux 1.3.37 trên CPU P6 200-MHz, system call mất khoảng 4 microsecond và context switch khoảng 6 microsecond [MS96]. Hệ thống hiện đại có hiệu năng tốt hơn gần một bậc độ lớn, với kết quả sub-microsecond trên hệ thống có processor 2- hoặc 3-GHz.
>
> Cần lưu ý rằng không phải mọi hoạt động operating-system đều cải thiện theo hiệu năng CPU. Như Ousterhout nhận xét, nhiều thao tác OS sử dụng nhiều memory, và memory bandwidth không cải thiện mạnh như tốc độ processor theo thời gian [O90]. Vì vậy, tùy workload, mua processor mới nhất và tốt nhất có thể không làm OS nhanh hơn nhiều như bạn hy vọng.

Để khơi gợi hứng thú, ta sẽ phác thảo vài điều cơ bản về cách OS xử lý những tình huống phức tạp này. Một việc đơn giản OS có thể làm là disable interrupt trong quá trình xử lý interrupt; điều này bảo đảm khi một interrupt đang được xử lý, không interrupt nào khác được chuyển đến CPU. Tất nhiên, OS phải cẩn thận khi làm vậy; disable interrupt quá lâu có thể làm mất interrupt, và điều này (nói theo thuật ngữ kỹ thuật) là tệ.

Operating system cũng phát triển một số locking scheme tinh vi để bảo vệ việc truy cập concurrent vào data structure nội bộ. Điều này cho phép nhiều hoạt động on-going trong kernel cùng lúc, đặc biệt hữu ích trên multiprocessor. Tuy nhiên, như ta sẽ thấy trong phần tiếp theo về concurrency, locking như vậy có thể phức tạp và dẫn đến nhiều bug thú vị, hard-to-find.

## 6.5 Tóm tắt

Ta đã mô tả một số mechanism low-level then chốt để triển khai CPU virtualization, tập hợp kỹ thuật được gọi chung là limited direct execution. Ý tưởng cơ bản rất rõ ràng: chỉ việc chạy chương trình bạn muốn trên CPU, nhưng trước hết bảo đảm thiết lập hardware để giới hạn những gì process có thể làm khi không có OS hỗ trợ.

Cách tiếp cận tổng quát này cũng được áp dụng trong đời thực. Ví dụ, những bạn có con, hoặc ít nhất từng nghe nói về trẻ con, có thể quen khái niệm làm căn phòng an toàn cho trẻ: khóa tủ chứa đồ nguy hiểm và che ổ điện. Khi căn phòng đã sẵn sàng như vậy, bạn có thể để trẻ tự do đi lại, yên tâm rằng những yếu tố nguy hiểm nhất trong phòng đã được hạn chế.

> MẸO: REBOOT RẤT HỮU ÍCH
>
> Trước đó, ta đã lưu ý rằng giải pháp duy nhất cho infinite loop (và hành vi tương tự) dưới cooperative preemption là reboot máy. Dù bạn có thể chế giễu thủ thuật này, các nhà nghiên cứu chỉ ra rằng reboot (hoặc nói chung là khởi động lại một phần software) có thể là công cụ cực kỳ hữu ích để xây dựng hệ thống vững chắc [C+04].
>
> Cụ thể, reboot hữu ích vì đưa software trở lại trạng thái đã biết và có thể đã được kiểm tra nhiều hơn. Reboot còn thu hồi tài nguyên cũ không còn hữu ích hoặc bị leak (ví dụ memory) vốn có thể khó xử lý theo cách khác. Cuối cùng, reboot dễ tự động hóa. Vì tất cả lý do này, trong các dịch vụ Internet trên cluster large-scale, không hiếm khi software quản lý hệ thống định kỳ reboot các nhóm máy để reset và nhận những lợi ích kể trên.
>
> Vì vậy, lần sau khi reboot, bạn không chỉ đang thực hiện một thủ thuật xấu xí. Bạn đang dùng một cách tiếp cận time-tested để cải thiện hành vi hệ thống máy tính. Làm tốt lắm!

Theo cách tương tự, OS làm CPU “an toàn cho trẻ” bằng cách trước tiên (lúc boot) thiết lập trap handler và khởi động interrupt timer, sau đó chỉ chạy process trong mode bị giới hạn. Nhờ vậy, OS có thể khá yên tâm rằng process chạy hiệu quả, chỉ cần OS can thiệp để thực hiện privileged operation hoặc khi đã độc chiếm CPU quá lâu nên cần được chuyển ra.

Như vậy, ta đã có các mechanism cơ bản để virtualize CPU. Nhưng còn một câu hỏi lớn chưa được trả lời: nên chạy process nào tại một thời điểm nhất định? Đó chính là câu hỏi scheduler phải trả lời, và do đó là chủ đề nghiên cứu tiếp theo của ta.

## Tài liệu tham khảo

[A79] “Alto User’s Handbook”

Xerox Palo Alto Research Center, tháng Chín năm 1979

Có tại: http://history-computer.com/Library/AltoUsersHandbook.pdf

Một hệ thống tuyệt vời, vượt xa thời đại. Trở nên nổi tiếng vì Steve Jobs đến thăm, ghi chép, rồi xây dựng Lisa và sau đó là Mac.

[C+04] “Microreboot — A Technique for Cheap Recovery”

George Candea, Shinichi Kawamoto, Yuichi Fujiki, Greg Friedman, Armando Fox

OSDI ’04, San Francisco, CA, tháng Mười Hai năm 2004

Một bài báo xuất sắc chỉ ra reboot có thể giúp tiến xa đến đâu khi xây dựng hệ thống vững chắc hơn.

[I11] “Intel 64 and IA-32 Architectures Software Developer’s Manual”

Tập 3A và 3B: System Programming Guide

Intel Corporation, tháng Một năm 2011

[K+61] “One-Level Storage System”

T. Kilburn, D.B.G. Edwards, M.J. Lanigan, F.H. Sumner

IRE Transactions on Electronic Computers, tháng Tư năm 1962

Atlas đi tiên phong trong nhiều điều bạn thấy ở hệ thống hiện đại. Tuy nhiên, đây không phải bài báo dễ đọc nhất. Nếu chỉ đọc một bài, bạn có thể thử bài viết từ góc nhìn lịch sử bên dưới [L78].

[L78] “The Manchester Mark I and Atlas: A Historical Perspective”

S. H. Lavington

Communications of the ACM, 21:1, tháng Một năm 1978

Lịch sử giai đoạn phát triển đầu tiên của máy tính và những nỗ lực tiên phong của Atlas.

[M+63] “A Time-Sharing Debugging System for a Small Computer”

J. McCarthy, S. Boilen, E. Fredkin, J. C. R. Licklider

AFIPS ’63 (mùa Xuân), tháng Năm, 1963, New York, USA

Một bài báo thời kỳ đầu về time-sharing đề cập việc dùng timer interrupt; đoạn trích thảo luận điều đó: “Tác vụ cơ bản của clock routine thuộc channel 17 là quyết định có đưa người dùng hiện tại ra khỏi core hay không, và nếu có thì quyết định swap in user program nào khi người đó được đưa ra.”

[MS96] “lmbench: Portable tools for performance analysis”

Larry McVoy and Carl Staelin

USENIX Annual Technical Conference, tháng Một năm 1996

Một bài báo thú vị về cách đo nhiều khía cạnh khác nhau của OS và hiệu năng của nó. Hãy tải lmbench về và thử.

[M11] “Mac OS 9”

Tháng Một năm 2011

Có tại: http://en.wikipedia.org/wiki/Mac_OS_9

[O90] “Why Aren’t Operating Systems Getting Faster as Fast as Hardware?”

J. Ousterhout

USENIX Summer Conference, tháng Sáu năm 1990

Một bài báo kinh điển về bản chất hiệu năng operating system.

[P10] “The Single UNIX Specification, Version 3”

The Open Group, tháng Năm năm 2010

Có tại: http://www.unix.org/version3/

Tài liệu này khó đọc và đọc khá khổ sở, nên có lẽ hãy tránh nếu có thể.

[S07] “The Geometry of Innocent Flesh on the Bone: Return-into-libc without Function Calls (on the x86)”

Hovav Shacham

CCS ’07, tháng Mười năm 2007

Một trong những ý tưởng tuyệt vời, mind-blowing mà thỉnh thoảng bạn sẽ gặp trong nghiên cứu. Tác giả cho thấy nếu có thể nhảy tùy ý vào code, về cơ bản bạn có thể ghép bất kỳ chuỗi code nào mình muốn (khi có code base lớn); đọc bài báo để biết chi tiết. Đáng tiếc là kỹ thuật này khiến việc phòng vệ trước tấn công độc hại càng khó hơn.

## Bài tập về nhà (Đo lường)

> THÔNG TIN THÊM: BÀI TẬP ĐO LƯỜNG
>
> Bài tập đo lường là những bài tập nhỏ trong đó bạn viết code chạy trên máy thực để đo một khía cạnh hiệu năng OS hoặc hardware. Ý tưởng đằng sau những bài tập này là cho bạn một chút kinh nghiệm hands-on với operating system thực tế.

Trong bài tập này, bạn sẽ đo chi phí system call và context switch. Đo chi phí system call tương đối dễ. Ví dụ, bạn có thể gọi lặp lại một system call đơn giản (như thực hiện read 0-byte) và đo thời gian; chia thời gian cho số lần lặp sẽ cho ước lượng chi phí một system call.

Một điều bạn phải tính đến là độ phân giải và độ chính xác của timer. Một timer điển hình có thể dùng là gettimeofday(); đọc man page để biết chi tiết. Bạn sẽ thấy gettimeofday() trả thời gian tính bằng microsecond kể từ năm 1970; tuy nhiên, điều này không có nghĩa timer chính xác đến microsecond. Hãy đo các lời gọi gettimeofday() back-to-back để tìm hiểu độ phân giải thực sự của timer; nhờ đó biết phải chạy bao nhiêu lần lặp phép kiểm tra null system-call để có kết quả đo tốt. Nếu gettimeofday() chưa đủ chính xác, bạn có thể tìm hiểu instruction rdtsc có trên máy x86.

Đo chi phí context switch khó hơn một chút. Benchmark lmbench thực hiện bằng cách chạy hai process trên một CPU và thiết lập hai UNIX pipe giữa chúng; pipe chỉ là một trong nhiều cách process trong hệ thống UNIX có thể giao tiếp với nhau. Process đầu tiên thực hiện write vào pipe thứ nhất rồi chờ read từ pipe thứ hai; khi thấy process đầu tiên đang chờ đọc từ pipe thứ hai, OS đặt nó vào trạng thái blocked và chuyển sang process còn lại, process này đọc từ pipe thứ nhất rồi ghi vào pipe thứ hai. Khi process thứ hai thử đọc lại từ pipe thứ nhất, nó bị block, và chu trình giao tiếp back-and-forth cứ tiếp tục. Bằng cách đo chi phí giao tiếp lặp lại như vậy, lmbench có thể ước lượng khá chính xác chi phí context switch. Bạn có thể thử re-create điều tương tự ở đây, dùng pipe hoặc có thể một communication mechanism khác như UNIX socket.

Một khó khăn khi đo chi phí context-switch xuất hiện trên hệ thống có nhiều hơn một CPU; điều bạn cần làm trên hệ thống như vậy là bảo đảm các process context-switching nằm trên cùng processor. May mắn là phần lớn operating system có lời gọi bind process vào processor cụ thể; chẳng hạn trên Linux, sched_setaffinity() chính là lời gọi bạn cần. Bằng cách bảo đảm cả hai process nằm trên cùng processor, bạn bảo đảm mình đo chi phí OS dừng một process rồi khôi phục process khác trên cùng CPU.
