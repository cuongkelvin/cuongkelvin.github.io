# Chương 1: Bắt đầu (Starting Out)

Bạn sắp bắt tay vào project tiếp theo, và lần này, nó sẽ chạy Linux. Bạn nên suy nghĩ về những gì trước khi đặt tay lên bàn phím? Hãy bắt đầu bằng một cái nhìn high-level về embedded Linux để thấy vì sao nó phổ biến, các license open source có những hàm ý gì, và bạn cần loại phần cứng nào để chạy nó.

Linux lần đầu trở thành một lựa chọn khả thi cho các thiết bị nhúng vào khoảng năm 1999. Đó là lúc AXIS phát hành 2100 Network Camera và TiVo phát hành Digital Video Recorder (DVR) đầu tiên của họ. Cả hai đều là những thiết bị Linux-powered đầu tiên trong loại của chúng. Kể từ năm 1999, Linux ngày càng trở nên phổ biến đến mức ngày nay nó là Operating System (OS) được lựa chọn cho nhiều loại sản phẩm. Vào năm 2024, có hơn ba tỷ thiết bị chạy Linux. Con số đó bao gồm tất cả các smartphone chạy Android, vốn dùng Linux kernel, và hàng trăm triệu set-top box, smart TV và router Wi-Fi. Chúng ta không được quên các thiết bị khác, như thiết bị chẩn đoán xe, thiết bị công nghiệp và thiết bị theo dõi y tế, vốn được xuất xưởng với số lượng nhỏ hơn.

Trong chương này, chúng ta sẽ đề cập các chủ đề sau:

- Chọn Linux

- Khi nào không nên chọn Linux

- Gặp gỡ các bên tham gia

- Đi qua vòng đời của project

- Định hướng trong thế giới open source

- Chọn phần cứng cho embedded Linux

- Chuẩn bị phần cứng cho cuốn sách này

- Chuẩn bị môi trường phát triển của bạn

## Chọn Linux

Vì sao Linux lại phổ biến đến vậy? Và vì sao một thứ đơn giản như chiếc TV lại cần chạy một thứ phức tạp như Linux chỉ để hiển thị video streaming lên màn hình?

Câu trả lời đơn giản là định luật Moore. Gordon Moore, đồng sáng lập Intel, đã quan sát vào năm 1965 rằng mật độ linh kiện trên một chip tăng gấp đôi khoảng mỗi hai năm. Điều đó áp dụng cho các thiết bị mà chúng ta thiết kế và dùng trong cuộc sống hằng ngày không kém gì desktop, laptop và server. Ở trung tâm của hầu hết các thiết bị nhúng là một chip tích hợp cao, chứa một hoặc nhiều lõi xử lý cùng giao tiếp với bộ nhớ chính, bộ lưu trữ dung lượng lớn và nhiều loại thiết bị ngoại vi. Chip này được gọi là System on Chip (SoC). Các SoC ngày càng phức tạp theo đúng định luật Moore. Một SoC điển hình có technical reference manual dài tới hàng nghìn trang.

Chiếc TV của bạn không chỉ đơn giản hiển thị một luồng video như những chiếc TV analog ngày xưa. Luồng video là số, có thể đã được mã hóa, và cần được xử lý để tạo ra hình ảnh. TV của bạn được (hoặc sắp được) kết nối internet. Nó có thể nhận nội dung từ smartphone, tablet, laptop, desktop và home media server. Nó có thể được dùng để chơi game, xem video streaming và hiển thị hình ảnh trực tiếp từ camera an ninh. Bạn cần một OS đầy đủ để quản lý mức độ phức tạp này.

Sau đây là một số điểm thúc đẩy việc áp dụng Linux:

- Linux có đủ chức năng cần thiết. Nó có một bộ lập lịch tốt, một network stack tốt, hỗ trợ USB, Wi-Fi, Bluetooth, nhiều loại phương tiện lưu trữ, thiết bị đa phương tiện, v.v. Nó đáp ứng mọi yêu cầu.

- Linux đã được port sang rất nhiều kiến trúc bộ xử lý, bao gồm một số kiến trúc rất thường gặp trong các thiết kế SoC – Arm, RISC-V, x86, PowerPC và MIPS.

- Linux là open source, vì vậy bạn có quyền tự do lấy source code và sửa đổi nó để đáp ứng nhu cầu của mình. Bạn hoặc một ai đó làm việc thay bạn có thể tạo một board support package cho thiết bị của bạn. Bạn có thể thêm các giao thức, tính năng và công nghệ có thể còn thiếu trong source code mainline. Bạn có thể bỏ các tính năng không cần để giảm yêu cầu về bộ nhớ và lưu trữ. Linux rất linh hoạt.

- Linux có một cộng đồng năng động (với Linux kernel thì rất năng động). Cứ mỗi 8 đến 10 tuần lại có một bản phát hành kernel mới, và mỗi bản phát hành chứa code từ hơn 1,000 developer. Một cộng đồng năng động nghĩa là Linux luôn cập nhật và hỗ trợ phần cứng, giao thức và tiêu chuẩn hiện hành. Linux Foundation là một tổ chức non-profit được các công ty công nghệ lớn hậu thuẫn.

  Quỹ này đóng vai trò quản lý cho nhiều project open source lớn ngoài Linux, bao gồm Kubernetes và PyTorch. Nó cũng tổ chức các sự kiện thường niên trên khắp thế giới như Open Source Summit và Linux Plumbers Conference.

- Các license open source bảo đảm rằng bạn có quyền truy cập source code. Không có vendor lock-in.

Vì những lý do này, Linux là một lựa chọn lý tưởng cho các thiết bị phức tạp. Nhưng có một vài điểm cần lưu ý mà tôi nên nhắc ở đây. Sự phức tạp khiến nó khó hiểu hơn. Cộng với quá trình phát triển fast-moving và cấu trúc phi tập trung của open source, bạn cần bỏ công sức để học cách dùng nó và tiếp tục re-learning khi nó thay đổi. Tôi hy vọng cuốn sách này giúp ích trong quá trình đó.

## Khi nào không nên chọn Linux

Linux có phù hợp với project của bạn không? Linux hoạt động tốt ở những nơi mà vấn đề cần giải quyết xứng đáng với độ phức tạp. Nó đặc biệt tốt ở những nơi cần kết nối, độ bền vững và giao diện người dùng phức tạp. Tuy nhiên, nó không thể giải quyết mọi vấn đề, vì vậy đây là một số điều cần cân nhắc trước khi bạn bắt tay vào:

- Phần cứng của bạn có đủ sức không? So với một Real-Time Operating System (RTOS) truyền thống như VxWorks hay QNX, Linux đòi hỏi nhiều tài nguyên hơn hẳn. Nó cần ít nhất một bộ xử lý 32-bit và nhiều bộ nhớ hơn. Tôi sẽ đi vào chi tiết hơn trong phần Chọn phần cứng cho embedded Linux.

- Bạn có đúng bộ kỹ năng cần thiết không? Các giai đoạn đầu của một project, board bring-up, đòi hỏi kiến thức chi tiết về Linux và cách nó liên quan đến phần cứng của bạn. Tương tự, khi debug và tinh chỉnh ứng dụng, bạn sẽ cần có khả năng diễn giải kết quả. Nếu không có kỹ năng in-house, bạn có thể muốn thuê ngoài một phần công việc. Tất nhiên, đọc cuốn sách này sẽ giúp ích!

- Hệ thống của bạn có phải real time không? Linux có thể xử lý nhiều hoạt động real-time miễn là bạn chú ý đến một số chi tiết nhất định, mà tôi đề cập sâu trong Chương 21.

- Code của bạn có cần được cơ quan quản lý phê duyệt không (y tế, ô tô, hàng không vũ trụ, v.v.)? Gánh nặng của việc kiểm chứng và xác nhận theo quy định có thể khiến một OS khác là lựa chọn tốt hơn. Ngay cả khi bạn chọn Linux cho các môi trường này, việc mua một bản phân phối thương mại từ một công ty đã cung cấp Linux cho các sản phẩm tương tự sản phẩm bạn đang xây dựng có thể là hợp lý. Các nhà cung cấp Linux thương mại này bao gồm Siemens, Timesys và Wind River.

Hãy cân nhắc kỹ những điểm này. Có lẽ dấu hiệu tốt nhất cho sự thành công là nhìn quanh xem các sản phẩm tương tự chạy Linux đã làm như thế nào, và làm theo các thực hành tốt nhất.

## Gặp gỡ các bên tham gia

Phần mềm open source đến từ đâu? Ai viết ra nó? Đặc biệt, nó liên quan như thế nào đến các thành phần then chốt của phát triển nhúng – toolchain, bootloader, kernel và các tiện ích cơ bản có trong root filesystem?

- Cộng đồng open source: Rốt cuộc, đây là động cơ tạo ra phần mềm mà bạn sẽ dùng. Cộng đồng là một liên minh lỏng lẻo của các developer, nhiều người trong số họ được tài trợ theo cách nào đó bởi một tổ chức non-profit, một tổ chức học thuật hoặc một công ty thương mại. Họ làm việc cùng nhau để thúc đẩy mục tiêu của các project khác nhau. Có rất nhiều project – có cái nhỏ, có cái lớn. Một số project mà chúng ta sẽ dùng là chính Linux, U-Boot, BusyBox, Buildroot, The Yocto Project, và nhiều project dưới chiếc ô GNU.

- Các nhà thiết kế kiến trúc CPU: Đây là các tổ chức thiết kế những CPU mà chúng ta dùng. Những tổ chức quan trọng ở đây là Arm/Linaro (Arm Cortex-A), Intel (x86 và x86-64), SiFive (RISC-V) và IBM (PowerPC). Họ triển khai, hoặc ít nhất là ảnh hưởng đến, việc hỗ trợ kiến trúc CPU cơ bản.

- Các nhà cung cấp SoC: Bao gồm Broadcom, Intel, Microchip, NXP, Qualcomm, TI và nhiều hãng khác. Họ lấy kernel và toolchain từ các nhà thiết kế kiến trúc CPU và sửa đổi chúng để hỗ trợ chip của mình. Họ cũng tạo ra các reference board: các thiết kế được cấp tiếp theo dùng để tạo ra development board và sản phẩm hoàn chỉnh.

- Các nhà cung cấp board và OEM: Những người này lấy các thiết kế tham chiếu từ nhà cung cấp SoC và đưa chúng vào các sản phẩm cụ thể như set-top box hay camera. Họ cũng tạo ra các development board general-purpose hơn, như các board của Advantech và Kontron. Một nhóm quan trọng là các Single-Board Computer (SBC) giá rẻ như BeagleBoard và Raspberry Pi, vốn đã tạo ra hệ sinh thái phần mềm và các add-ons phần cứng của riêng chúng.

- Các nhà cung cấp Linux thương mại: Các công ty như Siemens, Timesys và Wind River cung cấp các bản phân phối Linux thương mại đã trải qua quá trình kiểm chứng và xác nhận nghiêm ngặt theo quy định trong nhiều ngành (y tế, ô tô, hàng không vũ trụ, v.v.).

Những bên này tạo thành một chuỗi, với project của bạn thường nằm ở cuối, nghĩa là bạn không được tự do lựa chọn các thành phần. Bạn không thể đơn giản lấy kernel mới nhất từ kernel.org, trừ những trường hợp hiếm hoi, vì nó không hỗ trợ chip hoặc board mà bạn đang dùng.

Đây là một vấn đề dai dẳng trong phát triển nhúng. Lý tưởng nhất, các developer ở mỗi mắt xích của chuỗi sẽ đẩy các thay đổi của họ lên upstream, nhưng họ không làm vậy. Các developer luôn chịu áp lực thời gian, và việc đưa patch được chấp nhận vào Linux kernel tốn rất nhiều công sức. Không hiếm khi gặp một kernel có hàng nghìn patch chưa được merge. Ngoài ra, các nhà cung cấp SoC có xu hướng chỉ tích cực phát triển các thành phần open source cho những chip mới nhất của họ, nghĩa là việc hỗ trợ cho bất kỳ chip nào cũ hơn vài năm sẽ bị đóng băng và không nhận được bản cập nhật nào.

Hệ quả là hầu hết các thiết kế nhúng dựa trên các phiên bản phần mềm cũ. Chúng không nhận được các bản sửa lỗi bảo mật, cải tiến hiệu năng hay các tính năng có trong phiên bản mới hơn. Những vấn đề như Heartbleed (một bug trong thư viện OpenSSL) và Shellshock (một bug trong Bash shell) không được sửa.

Bạn có thể làm gì với điều này? Trước tiên, hãy đặt câu hỏi cho các nhà cung cấp của bạn (NXP, TI và Xilinx, để kể một vài cái tên): chính sách cập nhật của họ là gì, họ cập nhật phiên bản kernel bao lâu một lần, phiên bản kernel hiện tại là gì, phiên bản trước đó là gì, và chính sách của họ về việc merge các thay đổi lên upstream là gì? Một số nhà cung cấp đang có những bước tiến lớn theo hướng này. Bạn nên ưu tiên chip của họ.

Thứ hai, bạn có thể thực hiện các bước để trở nên self-sufficient hơn. Các chương trong Phần 1 giải thích chi tiết hơn về các dependency và cho bạn thấy bạn có thể tự giúp mình ở đâu. Đừng chỉ lấy package mà nhà cung cấp SoC hoặc board đưa cho bạn và dùng nó một cách mù quáng mà không cân nhắc các lựa chọn thay thế.

## Đi qua vòng đời của project

Cuốn sách này được chia thành năm phần phản ánh các giai đoạn của một project. Các giai đoạn không nhất thiết diễn ra tuần tự. Thường thì chúng chồng lấn nhau, và bạn sẽ cần quay lại xem xét những việc đã làm trước đó. Tuy nhiên, chúng đại diện cho các mối bận tâm của một developer khi project tiến triển:

- Các thành phần của Embedded Linux (Chương 1 đến 5) sẽ giúp bạn thiết lập môi trường phát triển và tạo một nền tảng hoạt động được cho các giai đoạn sau. Phần này thường được gọi là giai đoạn board bring-up.

- Build image Embedded Linux (Chương 6 đến 8) cho bạn thấy cách tự động hóa quá trình build một image embedded Linux bằng cách tận dụng một build system như Buildroot hay The Yocto Project. Tự động hóa các task build phức tạp giúp tăng tốc vòng đời project để các nhóm có thể giao các sản phẩm higher-quality trong thời gian ngắn hơn.

- Kiến trúc hệ thống và các lựa chọn thiết kế (Chương 9 đến 14) sẽ cung cấp thông tin cho một số quyết định thiết kế mà bạn sẽ phải đưa ra liên quan đến việc lưu trữ chương trình và dữ liệu, cách phân chia công việc giữa kernel device driver và ứng dụng, và cách khởi tạo hệ thống.

- Phát triển ứng dụng (Chương 15 đến 18) cho bạn thấy cách đóng gói và triển khai các ứng dụng Python, sử dụng hiệu quả mô hình process và thread của Linux, và quản lý bộ nhớ trong một thiết bị resource-constrained. Việc đóng gói và triển khai ứng dụng Python thì liên quan gì đến embedded Linux? Câu trả lời là “không nhiều lắm”, nhưng hãy nhớ rằng từ “development” cũng nằm trong tên của cuốn sách này. Và Chương 15 và 16 hoàn toàn gắn liền với việc phát triển phần mềm modern-day.

- Debug và tối ưu hiệu năng (Chương 19 đến 21) mô tả cách trace, profile và debug code của bạn ở cả ứng dụng lẫn kernel. Chương cuối cùng giải thích cách thiết kế cho hành vi real-time khi cần.

Giờ, hãy tập trung vào bốn thành phần cơ bản của embedded Linux tạo nên phần đầu tiên của cuốn sách.

## Bốn thành phần của embedded Linux

Mọi project đều bắt đầu bằng việc lấy về, tùy chỉnh và triển khai bốn thành phần này: toolchain, bootloader, kernel và root filesystem. Đây là chủ đề của phần đầu tiên của cuốn sách này.

- Toolchain: Đây là cross compiler và các công cụ khác cần để tạo code cho thiết bị target của bạn. Một cross compiler tạo ra mã máy cho một kiến trúc CPU target trong khi chạy trên một kiến trúc CPU host khác.

- Bootloader: Đây là một chương trình bare metal khởi tạo board và Linux kernel. Thuật ngữ “bare metal” nghĩa là chương trình chạy trực tiếp trên CPU, không chạy trên nền một OS.

- Kernel: Đây là trái tim của hệ thống, quản lý tài nguyên hệ thống và giao tiếp với phần cứng.

- Root filesystem: Chứa các thư viện và chương trình được chạy khi kernel đã hoàn tất việc khởi tạo.

Còn có một thành phần thứ năm không được nhắc ở đây. Đó là tập hợp các chương trình dành riêng cho ứng dụng nhúng của bạn, khiến thiết bị làm được việc nó cần làm, dù là cân hàng tạp hóa, chiếu phim, điều khiển robot hay lái drone.

Thông thường, bạn sẽ được cung cấp một vài hoặc tất cả các thành phần này dưới dạng một package khi mua SoC hoặc board. Nhưng vì những lý do đã nêu trước đó, chúng có thể không phải là lựa chọn tốt nhất cho bạn. Trong tám chương đầu, tôi sẽ cung cấp cho bạn kiến thức nền để đưa ra lựa chọn đúng và giới thiệu hai công cụ tự động hóa toàn bộ quá trình cho bạn: Buildroot và The Yocto Project.

## Định hướng trong thế giới open source

Các thành phần của embedded Linux là open source, vì vậy giờ là lúc thích hợp để xem xét điều đó có nghĩa là gì, vì sao các license open source hoạt động theo cách của chúng, và điều này ảnh hưởng như thế nào đến thiết bị nhúng, thường là độc quyền, mà bạn sẽ tạo ra từ nó.

### License

Khi nói về open source, từ free thường được dùng. Những người mới tìm hiểu chủ đề này thường hiểu nó là không phải trả tiền, và các license phần mềm open source quả thực bảo đảm rằng bạn có thể dùng phần mềm để phát triển và triển khai hệ thống mà không mất phí. Tuy nhiên, nghĩa quan trọng hơn ở đây là tự do, vì bạn được tự do lấy source code, sửa đổi nó theo bất kỳ cách nào bạn thấy phù hợp, và triển khai lại nó trong các hệ thống khác. Các license open source trao cho bạn quyền này, nhưng một số license còn yêu cầu bạn chia sẻ những thay đổi này với công chúng.

Hãy so sánh điều đó với các license freeware, vốn cho phép bạn copy các binary miễn phí nhưng không cung cấp source code. Các license khác cho phép bạn dùng phần mềm miễn phí trong một số trường hợp nhất định, ví dụ, cho mục đích cá nhân, nhưng không cho mục đích thương mại. Những license này không phải là open source.

Tôi sẽ đưa ra các nhận xét sau nhằm giúp bạn hiểu những hàm ý của việc làm việc với license open source, nhưng tôi muốn lưu ý rằng tôi là một kỹ sư chứ không phải luật sư. Những gì sau đây là hiểu biết của tôi về các license và cách chúng được diễn giải.

Các license open source nhìn chung chia thành hai loại:

- License copyleft như GNU General Public License (GPL)

- License permissive như license BSD và MIT

Về bản chất, các license permissive nói rằng bạn có thể sửa đổi source code và dùng nó trong các hệ thống do bạn tự chọn, miễn là bạn không thay đổi các điều khoản của license theo bất kỳ cách nào. Nói cách khác, ngoài hạn chế duy nhất đó, bạn có thể làm bất cứ điều gì bạn muốn với nó, kể cả đưa nó vào các hệ thống có thể là độc quyền.

Các license GPL tương tự nhưng có những điều khoản buộc bạn phải chuyển các quyền lấy và sửa đổi phần mềm cho người dùng cuối. Nói cách khác, bạn chia sẻ source code của mình. Một lựa chọn là công khai hoàn toàn bằng cách đặt nó lên một server công khai. Lựa chọn khác là chỉ cung cấp cho người dùng cuối thông qua một đề nghị bằng văn bản sẽ cung cấp code khi được yêu cầu.

GPL còn đi xa hơn khi nói rằng bạn không thể đưa code GPL vào các chương trình độc quyền. Mọi nỗ lực làm vậy sẽ khiến GPL áp dụng cho toàn bộ. Nói cách khác, bạn không thể kết hợp code GPL và code độc quyền trong cùng một chương trình. Ngoài Linux kernel, GNU Compiler Collection và GNU Debugger, cũng như nhiều công cụ miễn phí khác gắn với project GNU, đều thuộc phạm vi của GPL.

Vậy còn các thư viện thì sao? Nếu chúng được cấp phép theo GPL, mọi chương trình link với chúng cũng trở thành GPL. Tuy nhiên, hầu hết các thư viện được cấp phép theo GNU Lesser General Public License (LGPL). Nếu vậy, bạn được phép link với chúng từ một chương trình độc quyền.

LƯU Ý QUAN TRỌNG

Tất cả các mô tả trên liên quan cụ thể đến GPL v2 và LGPL v2. Tôi nên nhắc đến các phiên bản mới nhất là GPL v3 và LGPL v3. Chúng gây tranh cãi và tôi thừa nhận rằng tôi không hiểu đầy đủ các hàm ý của chúng. Tuy nhiên, mục đích là bảo đảm rằng các thành phần GPL v3 và LGPL v3 trong bất kỳ hệ thống nào đều có thể được người dùng cuối thay thế, điều này đúng với tinh thần phần mềm open source cho mọi người.

Tuy vậy, GPL v3 và LGPL v3 cũng có những vấn đề của chúng. Có các vấn đề về bảo mật. Nếu chủ sở hữu thiết bị có quyền truy cập code hệ thống, thì một kẻ xâm nhập không mong muốn cũng có thể có. Cách phòng thủ thường là để các kernel image được ký bởi một bên có thẩm quyền như nhà cung cấp để không thể thực hiện các bản cập nhật trái phép. Đó có phải là vi phạm quyền sửa đổi thiết bị của tôi không? Các ý kiến khác nhau.

LƯU Ý QUAN TRỌNG

Hộp set-top TiVo là một phần quan trọng của cuộc tranh luận này. Nó dùng một Linux kernel, được cấp phép theo GPL v2. TiVo đã phát hành source code phiên bản kernel của họ theo đúng license. TiVo cũng có một bootloader chỉ nạp kernel binary được họ ký. Do đó, bạn có thể build một kernel đã sửa đổi cho hộp TiVo, nhưng bạn không thể nạp nó lên phần cứng.

Free Software Foundation (FSF) có quan điểm rằng điều này không đúng với tinh thần phần mềm open source và gọi quy trình này là tivoization. GPL v3 và LGPL v3 được viết rõ ràng để ngăn điều này xảy ra. Một số project, đặc biệt là Linux kernel, đã ngần ngại áp dụng các license GPL phiên bản 3 vì những hạn chế mà chúng đặt ra cho các nhà sản xuất thiết bị.

## Chọn phần cứng cho embedded Linux

Nếu bạn đang thiết kế hoặc chọn phần cứng cho một project embedded Linux, bạn cần chú ý những gì?

- Thứ nhất, một kiến trúc CPU được kernel hỗ trợ – tất nhiên, trừ khi bạn định tự thêm một kiến trúc mới! Nhìn vào source code của Linux 5.15, có 23 kiến trúc, mỗi kiến trúc được đại diện bởi một thư mục con trong thư mục `arch/`. Tất cả đều là kiến trúc 32-hoặc 64-bit, phần lớn có MMU, nhưng một số thì không. Những kiến trúc thường gặp nhất trong các thiết bị nhúng là Arm, RISC-V, PowerPC, MIPS và x86, mỗi kiến trúc có các biến thể 32-và 64-bit, tất cả đều có Memory Management Unit (MMU).

- Phần lớn cuốn sách này được viết với lớp bộ xử lý này trong đầu. Có một nhóm khác không có MMU và chạy một tập con của Linux được gọi là microcontroller Linux hay uClinux. Các kiến trúc bộ xử lý này bao gồm ARC (Argonaut RISC Core), Blackfin, MicroBlaze và Nios. Thỉnh thoảng tôi sẽ nhắc đến uClinux, nhưng sẽ không đi vào chi tiết vì đó là một loại khá chuyên biệt.

- Thứ hai, bạn sẽ cần một lượng RAM hợp lý. 16 MB là mức tối thiểu tốt, mặc dù hoàn toàn có thể chạy Linux với một nửa số đó. Thậm chí có thể chạy Linux với 4 MB nếu bạn sẵn sàng chịu khó tối ưu từng phần của hệ thống. Thậm chí có thể xuống thấp hơn nữa, nhưng sẽ đến một điểm mà nó không còn là Linux nữa.

- Thứ ba, cần có bộ lưu trữ non-volatile, thường là bộ nhớ flash. 8 MB là đủ cho một thiết bị đơn giản như webcam hoặc router cơ bản. Cũng như với RAM, bạn có thể tạo một hệ thống Linux dùng được với bộ lưu trữ ít hơn nếu thực sự muốn, nhưng càng xuống thấp càng khó. Linux hỗ trợ rộng rãi các thiết bị lưu trữ flash, bao gồm chip raw NOR và NAND flash, và managed flash dưới dạng thẻ SD, chip eMMC, bộ nhớ flash USB, v.v.

- Thứ tư, một cổng serial rất hữu ích, tốt nhất là cổng serial UART-based. Nó không nhất thiết phải được lắp trên các board sản xuất nhưng giúp việc board bring-up, debug và phát triển dễ dàng hơn nhiều.

- Thứ năm, bạn cần một cách nào đó để nạp phần mềm khi bắt đầu từ con số không. Nhiều board vi điều khiển được trang bị giao tiếp Joint Test Action Group (JTAG) cho mục đích này. Các SoC hiện đại cũng có thể nạp boot code trực tiếp từ phương tiện lưu trữ tháo rời, đặc biệt là thẻ SD và microSD, hoặc từ các giao tiếp serial như QSPI hay USB.

Ngoài những điều cơ bản này, còn có các giao tiếp tới những phần cứng cụ thể mà thiết bị của bạn cần để làm được việc của nó. Mainline Linux đi kèm các driver open source cho hàng nghìn thiết bị khác nhau, và còn có các driver (chất lượng không đồng đều) từ nhà sản xuất SoC và từ các OEM của những chip third-party có thể có trong thiết kế.

Hãy nhớ lại nhận xét của tôi về cam kết và năng lực của một số nhà sản xuất. Là một developer hệ thống nhúng, bạn sẽ thấy mình dành khá nhiều thời gian để đánh giá và điều chỉnh code third-party, nếu bạn có nó, hoặc liên lạc với nhà sản xuất nếu bạn không có. Cuối cùng, bạn sẽ phải viết phần hỗ trợ thiết bị cho các giao tiếp chỉ có riêng ở thiết bị, hoặc tìm ai đó làm việc đó cho bạn.

## Chuẩn bị phần cứng cho cuốn sách này

Các ví dụ trong cuốn sách này được dự định là tổng quát. Để chúng thiết thực và dễ làm theo, tôi đã phải chọn phần cứng cụ thể. Tôi đã chọn ba thiết bị tiêu biểu: Raspberry Pi 4, BeaglePlay và QEMU. Thiết bị đầu tiên cho đến nay là SBC Arm-based phổ biến nhất trên thị trường. Thiết bị thứ hai là một SBC dễ mua, cũng có thể được dùng trong phần cứng nhúng nghiêm túc. Thiết bị thứ ba là một machine emulator có thể được dùng để tạo nhiều hệ thống tiêu biểu cho phần cứng nhúng.

Thật hấp dẫn nếu chỉ dùng QEMU, nhưng giống như mọi emulation, nó không hoàn toàn giống thiết bị thật. Dùng Raspberry Pi 4 và BeaglePlay, bạn có được sự thỏa mãn khi tương tác với phần cứng thật và thấy LED thật nhấp nháy. BeaglePlay, cũng như BeagleBone Black trước nó, là phần cứng open source, không giống Raspberry Pi 4. Điều này có nghĩa là tài liệu thiết kế board được cung cấp tự do để bất kỳ ai cũng có thể đưa BeaglePlay hoặc một thiết kế dẫn xuất từ nó vào sản phẩm của mình.

Dù sao đi nữa, tôi khuyến khích bạn thử càng nhiều ví dụ càng tốt, dùng một trong ba nền tảng này hoặc bất kỳ phần cứng nhúng nào bạn có sẵn trong tay.

### Raspberry Pi 4

Từ tháng Sáu năm 2019 đến tháng Mười năm 2023, Raspberry Pi 4 Model B là SBC chủ lực do Raspberry Pi Foundation sản xuất. Thông số kỹ thuật của Raspberry Pi 4 bao gồm:

- Một SoC 64-bit Broadcom BCM2711 1.5 GHz quad-core Cortex-A72 (Arm v8)

- RAM DDR4 2, 4 hoặc 8 GB

- Wireless 802.11ac 2.4 GHz và 5 GHz, Bluetooth 5.0, BLE

- Một cổng serial để debug và phát triển

- Một khe microSD, có thể được dùng làm thiết bị boot

- Một cổng USB-C để cấp nguồn cho board

- Hai cổng host USB 3.0 full-size và hai cổng host USB 2.0 full-size

- Một cổng Gigabit Ethernet

- Hai cổng micro HDMI cho đầu ra video và audio

Ngoài ra, còn có một header mở rộng 40-pin, với rất nhiều loại board con được gọi là Hardware Attached on Top (HAT) cho phép bạn điều chỉnh board để làm nhiều việc khác nhau. Tuy nhiên, bạn sẽ không cần HAT nào cho các ví dụ trong cuốn sách này.

Ngoài bản thân board, bạn sẽ cần những thứ sau:

- Một thẻ microSD và một cách để ghi vào nó từ PC hoặc laptop phát triển của bạn

- Một cáp serial USB-to-TTL với mức logic 3.3 V

- Một bộ nguồn USB-C 5 V có khả năng cấp 3 A

- Một cáp Ethernet và một router để cắm nó vào, vì một số ví dụ cần kết nối mạng

### BeaglePlay

BeaglePlay là một thiết kế phần cứng open source cho một SBC do BeagleBoard.org Foundation sản xuất. Những điểm chính của thông số kỹ thuật là:

- Một SoC Sitara 64-bit TI AM6254 1.4 GHz Arm quad-core Cortex-A53 (Arm v8)

- RAM DDR4 2 GB

- Flash eMMC on-board 16 GB

- Wi-Fi MIMO 2.4 GHz và 5 GHz, BLE, Zigbee

- Một cổng serial để debug và phát triển

- Một khe microSD, có thể được dùng làm thiết bị boot

- Một cổng USB-C để cấp nguồn cho board

- Một cổng host USB 2.0 full-size

- Một cổng Gigabit Ethernet

- Một cổng HDMI full-size cho đầu ra video và audio

Thay vì một header mở rộng lớn, BeaglePlay có các giao tiếp mikroBUS, Grove và Qwiic để kết nối các add-on board.

Ngoài bản thân board, bạn sẽ cần những thứ sau:

- Một thẻ microSD và một cách để ghi vào nó từ PC hoặc laptop phát triển của bạn

- Một cáp serial USB-to-TTL với mức logic 3.3 V

- Một bộ nguồn USB-C 5 V có khả năng cấp 3 A

- Một cáp Ethernet và một router để cắm nó vào, vì một số ví dụ cần kết nối mạng

Ngoài những thứ trên, Chương 12 còn cần những thứ sau:

- Một add-on board MikroE-5764 GNSS 7 Click

- Một ăng-ten GNSS chủ động gắn ngoài có đầu nối SMA

- Một add-on board MikroE-5546 Environment Click

- Một add-on board MikroE-5545 OLED C Click

### QEMU

QEMU là một machine emulator. Nó có nhiều biến thể, mỗi biến thể có thể emulate một kiến trúc bộ xử lý và nhiều board được xây dựng trên kiến trúc đó. Ví dụ, chúng ta có:

- `qemu-system-arm`: Arm 32-bit

- `qemu-system-aarch64`: Arm 64-bit

- `qemu-system-mips`: MIPS

- `qemu-system-ppc`: Power PC

- `qemu-system-x86`: x86 và x86-64

Với mỗi kiến trúc, QEMU emulate nhiều loại phần cứng mà bạn có thể xem bằng tùy chọn `-machine` `help`. Mỗi kiến trúc emulate phần lớn phần cứng thường có trên board đó. Có các tùy chọn để liên kết phần cứng với tài nguyên cục bộ, như dùng một file cục bộ cho ổ đĩa được emulate. Sau đây là một ví dụ cụ thể:

```
$ qemu-system-arm -machine vexpress-a9 -m 256M -drive file=rootfs.
ext4,sd -net nic -net use -kernel zImage -dtb vexpress-v2p-ca9.dtb
-append "console=ttyAMA0,115200 root=/dev/mmcblk0" -serial stdio -net
nic,model=lan9118 -net tap,ifname=tap0
```

LƯU Ý QUAN TRỌNG

Lệnh trên không nhằm để thực thi và sẽ thất bại, vì `qemu-system-arm` chưa được cài đặt và các file `rootfs.ext4.sd`, `zImage` và `vexpress-v2p-ca9.dtb` không tồn tại trên hệ thống host của bạn. Đó chỉ là một ví dụ để chúng ta phân tích.

Các tùy chọn được dùng trong dòng lệnh trên như sau:

- `-machine vexpress -a9`: Tạo một emulation của development board Arm Versatile Express với bộ xử lý Cortex-A9.

- `-m 256M`: Trang bị cho nó 256 MB RAM.

- -`drive file=rootfs.ext4,sd`: Nối giao tiếp SD tới file cục bộ `rootfs.ext4`, chứa một filesystem image.

- `-kernel zImage`: Nạp Linux kernel từ file cục bộ tên là `zImage`.

- `-dtb vexpress-v2p-ca9.dtb`: Nạp device tree từ file cục bộ `vexpress-v2p-ca9.dtb`.

- `-append "…"`: Nối chuỗi trong dấu ngoặc kép làm kernel command line.

- `-serial stdio`: Nối cổng serial tới terminal đã khởi chạy QEMU để bạn có thể đăng nhập vào máy được emulate qua serial console.

- `-net nic,model=lan9118`: Tạo một network interface.

- `-net tap,ifname=tap0`: Nối network interface tới network interface ảo `tap0`.

Để cấu hình phía host của mạng, bạn cần lệnh `tunctl` từ project User Mode Linux (UML). Trên Debian và Ubuntu, package này có tên là `uml-utilities`:

```
$ sudo tunctl -u $(whoami) -t tap0
```

Lệnh này tạo một network interface tên là `tap0`, được nối với network controller trong máy QEMU được emulate. Bạn cấu hình `tap0` giống như mọi network interface khác.

Tất cả các tùy chọn này được mô tả trong các chương sau. Tôi sẽ dùng Versatile Express cho hầu hết các ví dụ, nhưng việc dùng một machine hoặc kiến trúc khác hẳn sẽ dễ dàng.

## Chuẩn bị môi trường phát triển của bạn

Tôi chỉ dùng phần mềm open source cho cả công cụ phát triển lẫn OS/ứng dụng trên target. Tôi giả định bạn sẽ dùng Linux trên hệ thống phát triển của mình.

Tôi đã kiểm thử tất cả các lệnh trên host bằng Ubuntu 24.04 LTS, vì vậy tôi khuyên bạn dùng phiên bản đó trong suốt cuốn sách để tránh mọi vấn đề không mong đợi.

Ngoài Ubuntu, The Yocto Project chỉ hỗ trợ một số ít bản phân phối Linux được chọn: Fedora, Debian, openSUSE, AlmaLinux và Rocky. Nếu bạn hoàn toàn không thể dùng Ubuntu, hãy bảo đảm chọn một trong các distro được hỗ trợ đó cho các bài tập về The Yocto Project.

## Tóm tắt

Phần cứng nhúng tiếp tục trở nên phức tạp hơn theo quỹ đạo do định luật Moore đặt ra. Linux có sức mạnh và sự linh hoạt để tận dụng phần cứng một cách hiệu quả. Cùng nhau, chúng ta sẽ học cách khai thác sức mạnh đó để có thể xây dựng các sản phẩm bền vững làm hài lòng người dùng. Cuốn sách này sẽ đưa bạn đi qua năm giai đoạn trong vòng đời của một project nhúng, bắt đầu với bốn thành phần của embedded Linux.

Sự đa dạng tuyệt đối của các nền tảng nhúng và tốc độ phát triển nhanh dẫn đến các vùng phần mềm biệt lập. Trong nhiều trường hợp, bạn sẽ trở nên phụ thuộc vào phần mềm này, đặc biệt là Linux kernel do nhà cung cấp SoC hoặc board cung cấp, và ở mức độ thấp hơn là toolchain.

Một số nhà sản xuất SoC đang làm tốt hơn trong việc đẩy các thay đổi của họ lên upstream, và việc bảo trì các thay đổi này đang trở nên dễ dàng hơn. Bất chấp những cải thiện này, việc chọn đúng phần cứng cho project embedded Linux của bạn vẫn là một việc đầy rủi ro. Tuân thủ license open source là một chủ đề khác bạn cần lưu ý khi xây dựng sản phẩm trên nền hệ sinh thái embedded Linux.

Trong chương này, bạn đã được giới thiệu về phần cứng và một số phần mềm bạn sẽ dùng trong suốt cuốn sách (cụ thể là QEMU). Về sau, chúng ta sẽ xem xét một số công cụ mạnh có thể giúp bạn tạo và bảo trì phần mềm cho thiết bị của mình. Chúng ta đề cập Buildroot và đi sâu vào The Yocto Project. Trước khi giải quyết các công cụ build này, chúng ta sẽ phân tích bốn thành phần của embedded Linux, những thứ mà bạn có thể áp dụng cho mọi project embedded Linux bất kể chúng được build như thế nào.

## Tham gia cộng đồng của chúng tôi trên Discord

Hãy tham gia không gian Discord của cộng đồng chúng tôi để thảo luận với các tác giả và những độc giả khác: `https://packt.link/embeddedsystems`
