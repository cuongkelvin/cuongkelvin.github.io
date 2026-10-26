# *Chương 1*: Bắt đầu (Starting Out)

Bạn sắp bắt tay vào project tiếp theo, và lần này nó sẽ chạy Linux. Bạn nên nghĩ đến điều gì trước khi đặt tay lên bàn phím? Hãy bắt đầu với một cái nhìn high-level về embedded Linux để xem vì sao nó phổ biến, các license open source có hàm ý gì, và bạn sẽ cần loại phần cứng nào để chạy Linux.

Linux lần đầu trở thành một lựa chọn khả thi cho các thiết bị nhúng vào khoảng năm 1999. Đó là khi Axis ([https://www.axis.com](https://www.axis.com)) phát hành camera mạng Linux-powered đầu tiên của họ và TiVo ([https://business.tivo.com](https://business.tivo.com)) phát hành **Digital Video Recorder** (**DVR**) đầu tiên. Kể từ năm 1999, Linux ngày càng phổ biến hơn, tới mức ngày nay nó là hệ điều hành được ưa chuộng cho nhiều loại sản phẩm. Năm 2021, có hơn hai tỷ thiết bị chạy Linux. Con số đó bao gồm một lượng lớn smartphone chạy Android, vốn dùng Linux kernel, và hàng trăm triệu set-top box, smart TV và router Wi-Fi, chưa kể một loạt thiết bị rất đa dạng như thiết bị chẩn đoán xe, cân, thiết bị công nghiệp và các bộ theo dõi y tế được xuất xưởng với số lượng nhỏ hơn.

Trong chương này, chúng ta sẽ đề cập các chủ đề sau:

- Chọn Linux
- Khi nào không nên chọn Linux
- Làm quen với các bên tham gia
- Đi qua vòng đời project
- Định hướng trong thế giới open source
- Chọn phần cứng cho embedded Linux
- Có được phần cứng cho cuốn sách này
- Chuẩn bị môi trường phát triển

## Chọn Linux

Vì sao Linux phổ biến khắp nơi như vậy? Và vì sao một thứ đơn giản như chiếc TV lại cần chạy một thứ phức tạp như Linux chỉ để hiển thị video streaming lên màn hình?

Câu trả lời đơn giản là định luật Moore: Gordon Moore, co-founder của Intel, đã nhận thấy vào năm 1965 rằng mật độ linh kiện trên một chip sẽ tăng gấp đôi khoảng mỗi 2 năm. Điều đó áp dụng cho các thiết bị mà chúng ta thiết kế và dùng trong đời sống hằng ngày cũng nhiều như với máy tính để bàn, laptop và server. Ở trung tâm của hầu hết các thiết bị nhúng là một chip tích hợp cao chứa một hoặc nhiều processor core và các giao diện tới bộ nhớ chính, bộ lưu trữ dung lượng lớn và nhiều loại ngoại vi. Nó được gọi là **System on Chip**, hay **SoC**, và các SoC ngày càng phức tạp hơn theo định luật Moore. Một SoC điển hình có technical reference manual dài tới hàng nghìn trang. TV của bạn không chỉ đơn giản hiển thị một luồng video như các TV analog cũ từng làm.

Luồng dữ liệu là số, có thể được mã hóa, và nó cần được xử lý để tạo ra hình ảnh. TV của bạn được (hoặc sẽ sớm được) kết nối internet. Nó có thể nhận nội dung từ smartphone, tablet và home media server. Nó có thể (hoặc sẽ sớm có thể) được dùng để chơi game, v.v. Bạn cần một hệ điều hành đầy đủ để quản lý mức độ phức tạp này.

Dưới đây là một số điểm thúc đẩy việc áp dụng Linux:

- Linux có đủ chức năng cần thiết. Nó có một scheduler tốt, một network stack tốt, hỗ trợ USB, Wi-Fi, Bluetooth, nhiều loại phương tiện lưu trữ, hỗ trợ tốt cho các thiết bị đa phương tiện, v.v. Nó đáp ứng mọi tiêu chí.
- Linux đã được port sang rất nhiều kiến trúc processor, bao gồm một số kiến trúc rất thường gặp trong các thiết kế SoC – Arm, MIPS, x86 và PowerPC.
- Linux là open source, vì vậy bạn được tự do lấy source code và sửa nó cho phù hợp với nhu cầu. Bạn, hoặc ai đó làm việc thay bạn, có thể tạo một board support package cho SoC board hay thiết bị cụ thể của bạn. Bạn có thể thêm các protocol, tính năng và công nghệ có thể còn thiếu trong source code mainline. Bạn có thể loại bỏ các tính năng không cần để giảm yêu cầu về bộ nhớ và lưu trữ. Linux rất linh hoạt.
- Linux có một cộng đồng năng động; với Linux kernel thì rất năng động. Cứ mỗi 8 đến 10 tuần lại có một bản phát hành kernel mới, và mỗi bản phát hành chứa code từ hơn 1,000 lập trình viên. Một cộng đồng năng động có nghĩa là Linux luôn cập nhật và hỗ trợ phần cứng, protocol và tiêu chuẩn hiện hành.
- Các license open source bảo đảm rằng bạn có quyền truy cập source code. Không có sự ràng buộc vào nhà cung cấp (vendor tie-in).

Vì những lý do này, Linux là lựa chọn lý tưởng cho các thiết bị phức tạp. Nhưng có vài điểm cần lưu ý mà tôi nên nhắc ở đây. Sự phức tạp khiến nó khó hiểu hơn. Cộng thêm quá trình phát triển fast-moving và cấu trúc phi tập trung của open source, bạn phải bỏ công học cách dùng nó và tiếp tục re-learning khi nó thay đổi. Tôi hy vọng cuốn sách này sẽ giúp ích trong quá trình đó.

## Khi nào không nên chọn Linux

Linux có phù hợp với project của bạn không? Linux hoạt động tốt khi vấn đề cần giải quyết xứng đáng với độ phức tạp của nó. Nó đặc biệt tốt khi cần khả năng kết nối, độ bền vững và giao diện người dùng phức tạp. Tuy nhiên, nó không thể giải quyết mọi vấn đề, vì vậy đây là một số điều cần cân nhắc trước khi bạn lao vào:

- Phần cứng của bạn có đủ sức không? So với một **real-time operating system** (**RTOS**) truyền thống như VxWorks hay QNX, Linux cần nhiều tài nguyên hơn rất nhiều. Nó cần ít nhất một processor 32-bit và nhiều bộ nhớ hơn hẳn. Tôi sẽ đi vào chi tiết hơn trong mục về yêu cầu phần cứng điển hình.
- Bạn có bộ kỹ năng phù hợp không? Các phần đầu của project, board bring-up, đòi hỏi kiến thức chi tiết về Linux và cách nó liên quan đến phần cứng của bạn. Tương tự, khi debug và tinh chỉnh application, bạn sẽ cần có khả năng diễn giải kết quả. Nếu không có kỹ năng đó in-house, bạn có thể muốn thuê ngoài một phần công việc. Tất nhiên, đọc cuốn sách này sẽ giúp ích!
- Hệ thống của bạn có phải real-time không? Linux có thể xử lý nhiều hoạt động real-time miễn là bạn chú ý đến một số chi tiết nhất định, mà tôi sẽ đề cập chi tiết trong [*Chương 21*](ch21_real_time_programming.vi.md), *Lập trình Real-Time*.
- Code của bạn có cần phê duyệt theo quy định (y tế, ô tô, hàng không vũ trụ, v.v.) không? Gánh nặng của việc verification và validation theo quy định có thể khiến một OS khác là lựa chọn tốt hơn. Ngay cả khi bạn chọn Linux để dùng trong các môi trường này, có thể hợp lý khi mua một bản phân phối thương mại từ một công ty đã cung cấp Linux cho các sản phẩm hiện có giống như sản phẩm bạn đang xây dựng.

Hãy cân nhắc kỹ những điểm này. Có lẽ chỉ báo tốt nhất cho thành công là tìm xem các sản phẩm tương tự chạy Linux và xem họ đã làm như thế nào; hãy theo best practice.

## Làm quen với các bên tham gia

Phần mềm open source đến từ đâu? Ai viết nó? Đặc biệt, điều này liên quan thế nào đến các thành phần then chốt của phát triển nhúng—toolchain, bootloader, kernel, và các tiện ích cơ bản có trong root filesystem?

Các bên tham gia chính như sau:

- **Cộng đồng open source**: Suy cho cùng, đây là động cơ tạo ra phần mềm bạn sẽ dùng. Cộng đồng là một liên minh lỏng lẻo của các lập trình viên, nhiều người trong số đó được tài trợ theo cách nào đó, có thể bởi một tổ chức not-for-profit, một cơ sở học thuật hoặc một công ty thương mại. Họ làm việc cùng nhau để thúc đẩy mục tiêu của các project khác nhau. Có rất nhiều project—có cái nhỏ, có cái lớn. Một số project chúng ta sẽ dùng trong phần còn lại của cuốn sách là bản thân Linux, U-Boot, BusyBox, Buildroot, Yocto Project, và nhiều project dưới cái ô GNU.
- **Các nhà kiến trúc CPU**: Đây là các tổ chức thiết kế CPU mà chúng ta dùng. Những tổ chức quan trọng ở đây là Arm/Linaro (Arm Cortex-A), Intel (x86 và x86_64), SiFive (RISC-V) và IBM (PowerPC). Họ hiện thực, hoặc ít nhất là tác động đến, việc hỗ trợ cho kiến trúc CPU cơ bản.
- **Các SoC vendor** (Broadcom, Intel, Microchip, NXP, Qualcomm, TI, và nhiều hãng khác): Họ lấy kernel và toolchain từ các nhà kiến trúc CPU và sửa chúng để hỗ trợ chip của mình. Họ cũng tạo các reference board: các thiết kế được cấp tiếp theo bên dưới dùng để tạo development board và sản phẩm hoạt động được.
- **Board vendor và OEM**: Những người này lấy thiết kế tham chiếu từ các SoC vendor và đưa chúng vào các sản phẩm cụ thể, chẳng hạn set-top box hay camera, hoặc tạo các development board general-purpose hơn, chẳng hạn của Advantech và Kontron. Một nhóm quan trọng là các development board giá rẻ như BeagleBoard/BeagleBone và Raspberry Pi, những board đã tạo ra hệ sinh thái phần mềm và phần cứng add-ons của riêng mình.
- **Các vendor Linux thương mại**: Các công ty như Siemens (Mentor), Timesys và Wind River cung cấp các bản phân phối Linux thương mại đã trải qua verification và validation nghiêm ngặt theo quy định trong nhiều ngành (y tế, ô tô, hàng không vũ trụ, v.v.).

Những bên này tạo thành một chuỗi, với project của bạn thường nằm ở cuối, nghĩa là bạn không được tự do chọn các thành phần. Bạn không thể đơn giản lấy kernel mới nhất từ [https://www.kernel.org/](https://www.kernel.org/), trừ một vài trường hợp hiếm, vì nó không hỗ trợ chip hay board mà bạn đang dùng.

Đây là một vấn đề dai dẳng trong phát triển nhúng. Lý tưởng nhất, các lập trình viên ở mỗi mắt xích trong chuỗi sẽ đẩy thay đổi của họ lên upstream, nhưng họ không làm vậy. Không hiếm khi gặp một kernel có hàng nghìn patch chưa được merge. Ngoài ra, các SoC vendor có xu hướng chỉ tích cực phát triển các thành phần open source cho các chip mới nhất của họ, nghĩa là việc hỗ trợ cho bất kỳ chip nào đã hơn vài năm tuổi sẽ bị đóng băng và không nhận được bản cập nhật nào.

Hệ quả là hầu hết các thiết kế nhúng đều dựa trên các phiên bản phần mềm cũ. Chúng không nhận được các bản sửa lỗi bảo mật, cải tiến hiệu năng hay các tính năng có trong phiên bản mới hơn. Các vấn đề như Heartbleed (một bug trong thư viện OpenSSL) và ShellShock (một bug trong bash shell) không được sửa. Tôi sẽ nói thêm về điều này ở phần sau của chương này, trong chủ đề bảo mật.

Bạn có thể làm gì với chuyện này? Trước hết, hãy đặt câu hỏi cho các vendor (NXP, Texas Instruments và Xilinx, chỉ kể vài cái tên): chính sách cập nhật của họ là gì, họ sửa đổi phiên bản kernel thường xuyên đến đâu, phiên bản kernel hiện tại là gì, phiên bản trước đó là gì, và chính sách merge thay đổi lên upstream của họ ra sao? Một số vendor đang có những bước tiến lớn theo hướng này. Bạn nên ưu tiên chip của họ.

Thứ hai, bạn có thể thực hiện các bước để trở nên self-sufficient hơn. Các chương trong *Phần 1* giải thích các phụ thuộc chi tiết hơn và chỉ cho bạn những chỗ bạn có thể tự giúp mình. Đừng chỉ lấy gói được SoC vendor hay board vendor đưa cho bạn rồi dùng một cách mù quáng mà không cân nhắc các lựa chọn khác.

## Đi qua vòng đời project

Cuốn sách này được chia thành bốn phần phản ánh các giai đoạn của một project. Các giai đoạn không nhất thiết tuần tự. Thường thì chúng chồng lấn nhau và bạn sẽ cần quay lại xem lại những thứ đã làm trước đó. Tuy nhiên, chúng đại diện cho những mối bận tâm của lập trình viên khi project tiến triển:

- *Các thành phần của Embedded Linux* (*Chương 1* đến *8*) sẽ giúp bạn thiết lập môi trường phát triển và tạo một nền tảng hoạt động được cho các giai đoạn sau. Giai đoạn này thường được gọi là giai đoạn **board bring-up**.
- *Kiến trúc hệ thống và lựa chọn thiết kế* (*Chương 9* đến *15*) sẽ giúp bạn xem xét một số quyết định thiết kế bạn sẽ phải đưa ra liên quan đến việc lưu trữ chương trình và dữ liệu, cách phân chia công việc giữa kernel device driver và application, và cách khởi tạo hệ thống.
- *Viết ứng dụng nhúng* (*Chương 16* đến *18*) chỉ ra cách đóng gói và triển khai các application Python, dùng hiệu quả mô hình process và thread của Linux, và cách quản lý bộ nhớ trên một thiết bị resource-constrained.
- *Debug và tối ưu hiệu năng* (*Chương 19* đến *21*) mô tả cách trace, profile và debug code của bạn ở cả application lẫn kernel. Chương cuối giải thích cách thiết kế cho hành vi real-time khi cần.

Bây giờ, hãy tập trung vào bốn thành phần cơ bản của embedded Linux tạo nên phần đầu tiên của cuốn sách.

### Bốn thành phần của embedded Linux

Mọi project đều bắt đầu bằng việc lấy, tùy biến và triển khai bốn thành phần này: toolchain, bootloader, kernel và root filesystem. Đây là chủ đề của phần đầu tiên trong cuốn sách này.

- **Toolchain**: Compiler và các công cụ khác cần thiết để tạo code cho thiết bị đích.
- **Bootloader**: Chương trình khởi tạo board và nạp Linux kernel.
- **Kernel**: Đây là trái tim của hệ thống, quản lý tài nguyên hệ thống và giao tiếp với phần cứng.
- **Root filesystem**: Chứa các thư viện và chương trình được chạy khi kernel đã hoàn tất việc khởi tạo.

Tất nhiên, còn có một thành phần thứ năm, không được nhắc ở đây. Đó là tập các chương trình đặc thù cho ứng dụng nhúng của bạn, khiến thiết bị làm điều nó cần làm, dù là cân hàng tạp hóa, chiếu phim, điều khiển robot hay lái drone.

Thông thường, bạn sẽ được cung cấp một số hoặc tất cả các thành phần này dưới dạng một gói khi mua SoC hay board. Nhưng, vì những lý do đã nêu ở đoạn trước, chúng có thể không phải lựa chọn tốt nhất cho bạn. Tôi sẽ cung cấp cho bạn nền tảng để đưa ra lựa chọn đúng trong tám chương đầu và giới thiệu hai công cụ tự động hóa toàn bộ quá trình cho bạn: Buildroot và Yocto Project.

## Định hướng trong thế giới open source

Các thành phần của embedded Linux là *open source*, vì vậy đây là lúc thích hợp để xem xét điều đó có nghĩa là gì, vì sao open source vận hành theo cách như vậy, và điều này ảnh hưởng thế nào đến thiết bị nhúng thường là độc quyền (proprietary) mà bạn sẽ tạo ra từ nó.

### License

Khi nói về open source, từ *free* thường được dùng. Những người mới tìm hiểu thường hiểu nó là *không phải trả tiền*, và các license phần mềm open source quả thực bảo đảm rằng bạn có thể dùng phần mềm để phát triển và triển khai hệ thống mà không mất phí. Tuy nhiên, ý nghĩa quan trọng hơn ở đây là sự tự do, vì bạn được tự do lấy source code, sửa nó theo bất kỳ cách nào bạn thấy phù hợp, và triển khai lại nó trong các hệ thống khác. Các license này cho bạn quyền đó. Hãy so sánh với các license freeware, cho phép bạn sao chép binary miễn phí nhưng không cho bạn source code, hoặc các license khác cho phép bạn dùng phần mềm miễn phí trong một số trường hợp nhất định, chẳng hạn cho mục đích cá nhân, nhưng không cho mục đích thương mại. Những license đó không phải open source.

Tôi sẽ đưa ra các nhận xét sau nhằm giúp bạn hiểu các hàm ý của việc làm việc với license open source, nhưng tôi muốn lưu ý rằng tôi là kỹ sư chứ không phải luật sư. Những gì sau đây là cách hiểu của tôi về các license và cách chúng được diễn giải.

Các license open source được chia đại thể thành hai nhóm: các license *copyleft*, chẳng hạn **GNU General Public License** (**GPL**), và các license permissive, chẳng hạn license **BSD** và **MIT**.

Về cơ bản, các license permissive nói rằng bạn có thể sửa source code và dùng nó trong các hệ thống do bạn chọn, miễn là bạn không sửa đổi các điều khoản của license theo bất kỳ cách nào. Nói cách khác, với một hạn chế duy nhất đó, bạn có thể làm với nó bất cứ điều gì bạn muốn, kể cả đưa nó vào các hệ thống có thể là độc quyền.

Các license GPL tương tự nhưng có các điều khoản buộc bạn phải chuyển giao quyền lấy và sửa phần mềm cho người dùng cuối. Nói cách khác, bạn chia sẻ source code của mình. Một lựa chọn là công khai hoàn toàn bằng cách đặt nó lên một server công cộng. Lựa chọn khác là chỉ cung cấp cho người dùng cuối thông qua một văn bản đề nghị cung cấp code khi được yêu cầu. GPL còn đi xa hơn khi nói rằng bạn không thể tích hợp code GPL vào các chương trình độc quyền. Bất kỳ nỗ lực nào làm vậy sẽ khiến GPL áp dụng cho toàn bộ. Nói cách khác, bạn không thể kết hợp code GPL và code độc quyền trong một chương trình. Ngoài Linux kernel, GNU Compiler Collection và GNU Debugger cũng như nhiều công cụ miễn phí khác gắn với project GNU đều nằm dưới cái ô GPL.

Vậy còn thư viện thì sao? Nếu chúng được cấp license GPL, bất kỳ chương trình nào link với chúng cũng trở thành GPL. Tuy nhiên, hầu hết các thư viện được cấp license theo **GNU Lesser General Public License** (**LGPL**). Nếu như vậy, bạn được phép link với chúng từ một chương trình độc quyền.

> **Lưu ý quan trọng**
>
> Toàn bộ mô tả ở trên liên quan cụ thể đến GPL v2 và LGPL v2.1. Tôi nên nhắc đến các phiên bản mới nhất là GPL v3 và LGPL v3. Chúng gây tranh cãi, và tôi phải thừa nhận rằng tôi không hiểu đầy đủ các hàm ý của chúng. Tuy nhiên, mục đích là bảo đảm rằng các thành phần GPL v3 và LGPL v3 trong bất kỳ hệ thống nào đều có thể được người dùng cuối thay thế, điều này đúng với tinh thần phần mềm open source cho mọi người.

Tuy vậy, GPL v3 và LGPL v3 cũng có vấn đề của chúng. Có những vấn đề về bảo mật. Nếu chủ sở hữu thiết bị có quyền truy cập code hệ thống, thì một kẻ xâm nhập không mong muốn cũng có thể có. Thường thì biện pháp phòng thủ là có các kernel image được ký bởi một bên có thẩm quyền như vendor, để các bản cập nhật trái phép không thể thực hiện được. Đó có phải là vi phạm quyền sửa đổi thiết bị của tôi không? Ý kiến còn khác nhau.

> **Lưu ý quan trọng**
>
> TiVo set-top box là một phần quan trọng của cuộc tranh luận này. Nó dùng Linux kernel, được cấp license theo GPL v2. TiVo đã phát hành source code của phiên bản kernel của họ và do đó tuân thủ license. TiVo cũng có một bootloader chỉ nạp kernel binary được họ ký. Do đó, bạn có thể build một kernel đã sửa cho TiVo box, nhưng không thể nạp nó lên phần cứng. **Free Software Foundation** (**FSF**) giữ quan điểm rằng điều này không đúng với tinh thần phần mềm open source và gọi thủ tục này là **Tivoization**. GPL v3 và LGPL v3 được viết ra để ngăn rõ ràng điều này xảy ra. Một số project, đặc biệt là Linux kernel, đã ngần ngại áp dụng license GPL phiên bản 3 vì những hạn chế mà chúng sẽ đặt lên các nhà sản xuất thiết bị.

## Chọn phần cứng cho embedded Linux

Nếu bạn đang thiết kế hoặc chọn phần cứng cho một project embedded Linux, bạn cần chú ý những gì?

Thứ nhất, một kiến trúc CPU được kernel hỗ trợ—tất nhiên trừ khi bạn định tự thêm một kiến trúc mới! Nhìn vào source code của Linux 5.4, có 25 kiến trúc, mỗi kiến trúc được biểu diễn bằng một sub-directory trong thư mục `arch/`. Chúng đều là các kiến trúc 32- hoặc 64-bit, phần lớn có MMU, nhưng một số thì không. Những kiến trúc thường gặp nhất trong thiết bị nhúng là Arm, MIPS, PowerPC và x86, mỗi loại có biến thể 32 và 64-bit, tất cả đều có **memory management unit** (**MMU**).

Phần lớn cuốn sách này được viết với lớp processor này trong đầu. Có một nhóm khác không có MMU và chạy một tập con của Linux được gọi là **microcontroller Linux** hay **uClinux**. Các kiến trúc processor này bao gồm ARC (Argonaut RISC Core), Blackfin, MicroBlaze và Nios. Thỉnh thoảng tôi sẽ nhắc đến uClinux, nhưng sẽ không đi vào chi tiết vì đó là một chủ đề khá chuyên biệt.

Thứ hai, bạn sẽ cần một lượng RAM hợp lý. 16 MiB là mức tối thiểu tốt, dù hoàn toàn có thể chạy Linux với một nửa con số đó. Thậm chí có thể chạy Linux với 4 MiB nếu bạn sẵn sàng bỏ công tối ưu mọi phần của hệ thống. Có thể còn thấp hơn nữa, nhưng sẽ đến một điểm mà nó không còn là Linux nữa.

Thứ ba, có bộ lưu trữ non-volatile, thường là bộ nhớ flash. 8 MiB là đủ cho một thiết bị đơn giản như webcam hay một router đơn giản. Cũng như với RAM, bạn có thể tạo một hệ thống Linux hoạt động được với ít bộ lưu trữ hơn nếu thực sự muốn, nhưng càng xuống thấp thì càng khó. Linux hỗ trợ rộng rãi các thiết bị lưu trữ flash, bao gồm các chip raw NOR và NAND flash, và managed flash dưới dạng thẻ SD, chip eMMC, bộ nhớ flash USB, v.v.

Thứ tư, một cổng serial rất hữu ích, tốt nhất là cổng serial UART-based. Nó không nhất thiết phải được lắp trên board sản xuất, nhưng giúp việc board bring-up, debug và phát triển dễ dàng hơn nhiều.

Thứ năm, bạn cần một cách nào đó để nạp phần mềm khi bắt đầu từ đầu. Nhiều board microcontroller được lắp giao diện **Joint Test Action Group** (**JTAG**) cho mục đích này. Các SoC hiện đại cũng có khả năng nạp boot code trực tiếp từ phương tiện tháo rời được, đặc biệt là thẻ SD và micro SD, hoặc các giao diện serial như UART hay USB.

Ngoài những điều cơ bản này, còn có các giao diện tới những phần cứng cụ thể mà thiết bị của bạn cần để hoàn thành công việc. Linux mainline đi kèm các driver open source cho hàng nghìn thiết bị khác nhau, và có các driver (chất lượng không đồng đều) từ nhà sản xuất SoC và từ các OEM của chip third-party có thể có trong thiết kế, nhưng hãy nhớ những nhận xét của tôi về cam kết và năng lực của một số nhà sản xuất. Là lập trình viên thiết bị nhúng, bạn sẽ thấy mình dành khá nhiều thời gian đánh giá và điều chỉnh code third-party, nếu bạn có nó, hoặc liên hệ với nhà sản xuất nếu không có. Cuối cùng, bạn sẽ phải tự viết phần hỗ trợ thiết bị cho các giao diện chỉ có ở thiết bị của bạn hoặc tìm ai đó làm thay.

## Có được phần cứng cho cuốn sách này

Các ví dụ trong cuốn sách này được dự định mang tính tổng quát, nhưng để chúng phù hợp và dễ theo dõi, tôi đã phải chọn phần cứng cụ thể. Tôi đã chọn ba thiết bị mẫu: Raspberry Pi 4, BeagleBone Black và QEMU. Thiết bị đầu tiên là single board computer Arm-based phổ biến nhất trên thị trường, với khoảng cách rất xa. Thiết bị thứ hai là một development board dễ mua và rẻ, có thể được dùng trong phần cứng nhúng thực thụ. Thiết bị thứ ba là một machine emulator có thể được dùng để tạo nhiều loại hệ thống điển hình của phần cứng nhúng. Thật hấp dẫn khi chỉ dùng QEMU, nhưng, như mọi trình giả lập, nó không hoàn toàn giống thứ thật. Dùng Raspberry Pi 4 và BeagleBone Black, bạn có được sự thỏa mãn khi tương tác với phần cứng thật và thấy LED thật nhấp nháy. Dù BeagleBone Black giờ đã vài năm tuổi, nó vẫn là *open source hardware* (khác với Raspberry Pi). Điều này có nghĩa là các tài liệu thiết kế board có sẵn miễn phí để bất kỳ ai cũng có thể đưa BeagleBone Black hoặc một biến thể của nó vào sản phẩm của mình.

Dù thế nào, tôi khuyến khích bạn thử càng nhiều ví dụ càng tốt, dùng bất kỳ nền tảng nào trong ba nền tảng này, hoặc thực ra là bất kỳ phần cứng nhúng nào bạn có trong tay.

### Raspberry Pi 4

Tại thời điểm viết sách, Raspberry Pi 4 Model B là máy tính để bàn nhỏ gọn, dual-display, chủ lực do Raspberry Pi Foundation sản xuất. Website của họ là [https://raspberrypi.org/](https://raspberrypi.org/). Thông số kỹ thuật của Pi 4 bao gồm:

- Một SoC 64-bit Broadcom BCM2711 1.5 GHz quad-core Cortex-A72 (Arm® v8)
- 2, 4 hoặc 8 GiB RAM DDR4
- Wireless 802.11ac 2.4 GHz và 5.0 GHz, Bluetooth 5.0, BLE
- Một cổng serial cho debug và phát triển
- Một khe MicroSD, có thể được dùng làm thiết bị boot
- Một đầu nối USB-C dùng để cấp nguồn cho board
- 2 × cổng host USB 3.0 kích thước đầy đủ và 2 × cổng host USB 2.0 kích thước đầy đủ
- Một cổng Gigabit Ethernet
- 2 × cổng micro-HDMI cho output video và audio

Ngoài ra, có một expansion header 40-pin, với rất nhiều loại board con, được gọi là **HAT** (**Hardware Attached on Top**), cho phép bạn điều chỉnh board để làm nhiều việc khác nhau. Tuy nhiên, bạn sẽ không cần HAT nào cho các ví dụ trong cuốn sách này. Thay vào đó, bạn sẽ dùng Wi-Fi và Bluetooth built-in của Pi 4 (thứ mà BeagleBone Black không có).

Ngoài bản thân board, bạn sẽ cần những thứ sau:

- Một bộ nguồn USB-C 5V có khả năng cấp 3 A trở lên
- Một cáp serial USB to TTL với các chân logic-level 3.3V như Adafruit 954
- Một thẻ MicroSD và cách ghi vào thẻ từ PC hay laptop phát triển của bạn, thứ sẽ cần để nạp phần mềm lên board
- Một cáp Ethernet và một router để nối vào, vì một số ví dụ cần kết nối mạng

Tiếp theo là BeagleBone Black.

### BeagleBone Black

BeagleBone và BeagleBone Black ra đời sau đó là các thiết kế open hardware cho một development board nhỏ, credit card-sized, do CircuitCo LLC sản xuất. Kho thông tin chính nằm ở [https://beagleboard.org/](https://beagleboard.org/). Các điểm chính của thông số kỹ thuật như sau:

- Một SoC TI AM335x 1 GHz Arm® Cortex-A8 Sitara
- 512 MiB RAM DDR3
- Bộ lưu trữ flash eMMC 8-bit 2 hoặc 4 GiB trên board
- Một cổng serial cho debug và phát triển
- Một khe MicroSD, có thể được dùng làm thiết bị boot
- Một cổng client/host Mini-USB OTG cũng có thể được dùng để cấp nguồn cho board
- Một cổng host USB 2.0 kích thước đầy đủ
- Một cổng Ethernet 10/100
- Một cổng HDMI cho output video và audio

Ngoài ra, có hai expansion header 46-pin, với rất nhiều loại board con, được gọi là **cape**, cho phép bạn điều chỉnh board để làm nhiều việc khác nhau. Tuy nhiên, bạn không cần lắp cape nào cho các ví dụ trong cuốn sách này.

Ngoài bản thân board, bạn sẽ cần những thứ sau:

- Một cáp Mini-USB to USB-A (đi kèm board).
- Một cáp serial có thể giao tiếp với các tín hiệu mức TTL 3.3V 6-pin do board cung cấp. Website BeagleBoard có link tới các cáp tương thích.
- Một thẻ MicroSD và cách ghi vào thẻ từ PC hay laptop phát triển của bạn, thứ sẽ cần để nạp phần mềm lên board.
- Một cáp Ethernet và một router để nối vào, vì một số ví dụ cần kết nối mạng.
- Một bộ nguồn 5V có khả năng cấp 1 A trở lên.

Ngoài những thứ trên, [*Chương 12*](ch12_prototyping_with_breakout_boards.vi.md), *Làm prototype với breakout board*, còn cần những thứ sau:

- Một Breakout board SparkFun model GPS-15193.
- Một logic analyzer Saleae Logic 8. Thiết bị này sẽ được dùng để đo các chân cho giao tiếp SPI giữa BeagleBone Black và NEO-M9N.

### QEMU

QEMU là một machine emulator. Nó có nhiều phiên bản khác nhau, mỗi phiên bản có thể giả lập một kiến trúc processor và một số board được xây dựng trên kiến trúc đó. Ví dụ, chúng ta có:

- `qemu-system-arm`: 32-bit Arm
- `qemu-system-mips`: MIPS
- `qemu-system-ppc`: PowerPC
- `qemu-system-x86`: x86 and x86_64

Với mỗi kiến trúc, QEMU giả lập nhiều loại phần cứng, mà bạn có thể xem bằng tùy chọn `-machine help`. Mỗi machine giả lập phần lớn phần cứng thường có trên board đó. Có các tùy chọn để liên kết phần cứng với tài nguyên cục bộ, chẳng hạn dùng một file cục bộ làm ổ đĩa được giả lập.

Đây là một ví dụ cụ thể:

```
$ qemu-system-arm -machine vexpress-a9 -m 256M -drive file=rootfs.ext4,sd -net nic -net use -kernel zImage -dtb vexpress- v2p-ca9.dtb -append "console=ttyAMA0,115200 root=/dev/mmcblk0" -serial stdio -net nic,model=lan9118 -net tap,ifname=tap0
```

Các tùy chọn được dùng trong command line ở trên như sau:

- `-machine vexpress-a9`: Tạo một bản giả lập development board Arm Versatile Express với processor Cortex A-9
- `-m 256M`: Trang bị cho nó 256 MiB RAM
- `-drive file=rootfs.ext4,sd`: Nối giao diện SD với file cục bộ `rootfs.ext4` (chứa một filesystem image)
- `-kernel zImage`: Nạp Linux kernel từ file cục bộ tên `zImage`
- `-dtb vexpress-v2p- ca9.dtb`: Nạp device tree từ file cục bộ `vexpress-v2p-ca9.dtb`
- `-append "..."`: Thêm chuỗi này làm kernel command line
- `-serial stdio`: Nối cổng serial với terminal đã khởi chạy QEMU, thường là để bạn có thể đăng nhập vào máy được giả lập qua serial console
- `-net nic,model=lan9118`: Tạo một network interface
- `-net tap,ifname=tap0`: Nối network interface với network interface ảo `tap0`

Để cấu hình phía host của mạng, bạn cần lệnh `tunctl` từ project **User Mode Linux** (**UML**); trên Debian và Ubuntu, package có tên là `uml-utilites`:

```
$ sudo tunctl -u $(whoami) -t tap0
```

Lệnh này tạo một network interface tên `tap0` được nối với network controller trong máy QEMU được giả lập. Bạn cấu hình `tap0` theo đúng cách như với bất kỳ interface nào khác.

Tất cả các tùy chọn này được mô tả chi tiết trong các chương tiếp theo. Tôi sẽ dùng Versatile Express cho hầu hết các ví dụ, nhưng việc dùng một machine hay kiến trúc khác hẳn cũng dễ dàng.

## Chuẩn bị môi trường phát triển

Tôi chỉ dùng phần mềm open source, cả cho các công cụ phát triển lẫn hệ điều hành đích và các application. Tôi giả định rằng bạn sẽ dùng Linux trên hệ thống phát triển của mình. Tôi đã test tất cả các lệnh phía host bằng Ubuntu 20.04 LTS, vì vậy có hơi thiên về phiên bản cụ thể đó, nhưng bất kỳ bản phân phối Linux hiện đại nào nhiều khả năng cũng sẽ hoạt động tốt.

## Tóm tắt

Phần cứng nhúng sẽ tiếp tục trở nên phức tạp hơn, theo quỹ đạo do định luật Moore đặt ra. Linux có sức mạnh và sự linh hoạt để tận dụng phần cứng một cách hiệu quả. Cùng nhau, chúng ta sẽ học cách khai thác sức mạnh đó để xây dựng các sản phẩm bền vững làm hài lòng người dùng. Cuốn sách này sẽ đưa bạn qua năm giai đoạn trong vòng đời của project nhúng, bắt đầu với bốn thành phần của embedded Linux.

Sự đa dạng tuyệt đối của các nền tảng nhúng và tốc độ phát triển nhanh dẫn đến những vùng phần mềm biệt lập. Trong nhiều trường hợp, bạn sẽ phụ thuộc vào phần mềm này, đặc biệt là Linux kernel do SoC vendor hay board vendor cung cấp, và ở mức độ thấp hơn là toolchain. Một số nhà sản xuất SoC đang làm tốt hơn trong việc đẩy thay đổi của họ lên upstream và việc bảo trì các thay đổi này đang trở nên dễ dàng hơn. Bất chấp những cải tiến này, việc chọn phần cứng phù hợp cho project embedded Linux vẫn là một việc đầy rủi ro. Tuân thủ license open source là một chủ đề khác bạn cần lưu ý khi xây dựng sản phẩm trên hệ sinh thái embedded Linux.

Trong chương này, bạn đã được giới thiệu về phần cứng và một số phần mềm mà bạn sẽ dùng xuyên suốt cuốn sách (cụ thể là QEMU). Ở phần sau, chúng ta sẽ xem xét một số công cụ mạnh mẽ có thể giúp bạn tạo và bảo trì phần mềm cho thiết bị. Chúng ta sẽ đề cập Buildroot và đi sâu vào Yocto Project. Trước khi mô tả các công cụ build này, tôi sẽ mô tả bốn thành phần của embedded Linux, những điều bạn có thể áp dụng cho mọi project embedded Linux, dù chúng được tạo ra theo cách nào.

Chương tiếp theo hoàn toàn nói về thành phần đầu tiên trong số này, toolchain, thứ bạn cần để biên dịch code cho nền tảng đích.
