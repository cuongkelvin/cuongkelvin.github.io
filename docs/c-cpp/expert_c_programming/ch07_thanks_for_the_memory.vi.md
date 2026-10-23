# Chương 7. Cảm ơn memory

Một vị sư phụ đang giải thích bản chất của Đạo cho một đệ tử mới.

“Đạo hiện diện trong mọi software, dù software ấy nhỏ bé đến đâu,” sư phụ nói.

“Đạo có trong một máy tính bỏ túi hand-held không?” đệ tử hỏi. “Có,” sư phụ đáp.

“Đạo có trong một trò chơi điện tử không?” đệ tử hỏi tiếp. “Ngay cả trong trò chơi điện tử cũng có Đạo,” sư phụ nói.

“Vậy Đạo có trong DOS của một máy tính cá nhân không?”

Sư phụ ho một tiếng rồi hơi đổi tư thế. “Cái đó nằm trong stack frame, Bob ạ, và bài học hôm nay kết thúc ở đây,” ông nói.

—Geoffrey James, The Tao of Programming

họ Intel 80x86… memory model của Intel 80x86 và quá trình hình thành… virtual memory… cache memory… data segment và heap… memory leak… bus error — hãy đi tàu… giải trí nhẹ nhàng — Vua đồ vật và trò paging

Chương này bắt đầu bằng phần thảo luận về kiến trúc memory của họ processor Intel 80x86, loại processor nằm ở trung tâm của IBM PC. Chương đối chiếu memory trên PC với tính năng virtual memory có trên các hệ thống khác. Hiểu kiến trúc memory giúp lập trình viên nắm được một số quy ước và giới hạn của C.

## Họ Intel 80x86

Các processor Intel hiện đại có thể truy nguyên nguồn gốc về những chip Intel đầu tiên. Khi khách hàng sử dụng các chipset ngày càng tinh vi và đặt ra yêu cầu cao hơn, Intel luôn sẵn sàng cung cấp những processor follow-on tương thích. Tính tương thích giúp khách hàng dễ chuyển sang chip mới, nhưng cũng hạn chế nghiêm trọng khả năng đổi mới. Pentium hiện đại là hậu duệ trực tiếp của Intel 8086 ra đời trước đó 15 năm; kiến trúc của nó chứa những điểm bất quy tắc nhằm duy trì khả năng tương thích ngược, nghĩa là chương trình được compile cho 8086 vẫn chạy được trên Pentium. Nói về sự đánh đổi innovation/compatibility trade-off, một số người đã bình luận khá cay độc rằng “Intel đưa chữ backward vào backward compatible…” (xem Hình 7-1).

Hình 7-1. Họ Intel 80x86: Đưa “Backward” vào “Backward Compatible”

![image](images/ch07/img07-01.png)

Intel 4004 là một microcontroller 4-bit được xây dựng năm 1970 để đáp ứng nhu cầu cụ thể của một khách hàng duy nhất: Busicom, một công ty máy tính bỏ túi của Nhật Bản. Kỹ sư thiết kế Intel nảy ra ý tưởng sản xuất một chip lập trình được general-purpose, thay vì thiết kế logic riêng cho từng khách hàng như thông lệ lúc bấy giờ. Intel nghĩ rằng họ sẽ bán được vài trăm chiếc, nhưng thiết kế general-purpose hóa ra có phạm vi ứng dụng rộng hơn rất nhiều. Bốn bit quá hạn chế, nên tháng 4 năm 1972, phiên bản 8-bit mang tên 8008 được giới thiệu. Hai năm sau, phiên bản này lại sinh ra 8080, chip đầu tiên đủ mạnh để được gọi là microcomputer. Nó chứa toàn bộ instruction set của 8008 và bổ sung thêm 30 instruction riêng, mở đầu một xu hướng vẫn tiếp tục đến ngày nay. Nếu 4004 là chip giúp Intel khởi nghiệp thì 8080 là chip đem lại sự giàu có cho hãng: doanh thu hằng năm vượt 1 tỷ đô la và công ty vươn lên thứ hạng cao trong danh sách Fortune 500.

Processor 8085 tận dụng tiến bộ của công nghệ tích hợp để gộp tổ hợp ba chip vào một chip duy nhất. Về bản chất, nó kết hợp 8080 với clock driver 8224 và controller 8228 trên cùng một chip. Dù data bus bên trong vẫn là 8-bit, nó sử dụng address bus 16-bit, nhờ đó có thể đánh địa chỉ 2<sup>16</sup>, tức 64 Kbyte memory.

Được giới thiệu năm 1978, 8086 cải tiến 8085 bằng cách cho phép data bus có 16 bit và address bus có 20 bit, hỗ trợ dung lượng memory tối đa 1 Mbyte, một con số khổng lồ lúc ấy. Trong một quyết định thiết kế khác thường, địa chỉ được tạo bằng cách cho hai word 16-bit chồng lên nhau để hình thành địa chỉ 20-bit, thay vì nối chúng thành địa chỉ 32-bit (xem Hình 7-2). 8086 không 8085-compatible ở cấp instruction-set, nhưng assembler macro giúp chuyển đổi chương trình sang kiến trúc mới một cách dễ dàng.

Hình 7-2. Cách Intel 8086 đánh địa chỉ memory

![image](images/ch07/img07-02.png)

Cách đánh địa chỉ bất quy tắc này giúp 8086 chạy code 8085-ported đơn giản hơn: khi segment register đã được nạp một giá trị cố định, có thể bỏ qua chúng và sử dụng trực tiếp các địa chỉ 16-bit của 8085. Nhóm thiết kế bác bỏ ý tưởng tạo địa chỉ bằng cách nối segment word, vì cách đó sẽ cung cấp địa chỉ 32 bit, tương ứng 4 Gbyte, một dung lượng memory lớn đến mức không tưởng vào thời điểm ấy.

Một khi memory model cơ bản này đã được xác lập, mọi processor 80x86 tiếp theo đều phải tuân theo hoặc từ bỏ tính tương thích. Nếu 8080 là chip đưa Intel lên vị trí nổi bật thì 8086 là chip giúp hãng giữ vững vị trí ấy. Có lẽ chúng ta sẽ không bao giờ biết chính xác vì sao năm 1979 IBM chọn Intel 8088, người anh em 8-bit của 8086, làm CPU cho PC mới, dù có rất nhiều lựa chọn vượt trội về kỹ thuật từ Motorola hoặc National Semiconductor. Việc chọn chip Intel đã bảo đảm sự thịnh vượng của Intel trong hai thập niên tiếp theo, cũng như việc chọn MS-DOS làm hệ điều hành đã đem lại sự thịnh vượng cho Microsoft. Trớ trêu thay, tháng 8 năm 1993, giá trị cổ phiếu Intel đạt 26,6 tỷ đô la, vượt mức 24,5 tỷ của IBM; Intel thay IBM trở thành công ty điện tử có giá trị lớn nhất nước Mỹ. Trên thực tế, Intel và Microsoft đã trở thành IBM mới, thu những khoản lợi nhuận trời cho không xứng đáng từ các hệ thống độc quyền khép kín. IBM đang tuyệt vọng tìm lại vị thế cũ bằng PowerPC để thách thức thế độc quyền hardware của Intel và bằng OS/2 để thách thức thế độc quyền software của Microsoft. Thách thức từ OS/2 có lẽ đã thất bại, nhưng còn quá sớm để kết luận về PowerPC.

Processor 8088 được dùng trong IBM PC đầu tiên chỉ là phiên bản 8-bit giá rẻ của 8086, cho phép tận dụng vô số chip hỗ trợ 8-bit sẵn có. Mọi cải tiến 80x86 tiếp theo đều theo hướng “nhỏ hơn, nhanh hơn, đắt hơn và có thêm instruction”. 80186 đi theo con đường này, giới thiệu 10 instruction mới not-very-important. 80286 thực chất là 80186 bỏ đi một số peripheral port built-in, nhưng có nỗ lực đầu tiên nhằm mở rộng address space. Nó đưa memory controller off-chip và cung cấp một chế độ được đặt tên đầy tham vọng là virtual mode: thay vì cộng segment register với offset, nó dùng register này để đánh chỉ mục vào bảng chứa địa chỉ segment thực. Cách đánh địa chỉ này còn được gọi là protected mode và vẫn dựa trên 16-bit-based. MS-Windows sử dụng protected mode của 286 làm chế độ đánh địa chỉ tiêu chuẩn.

80386 là 80286 được bổ sung hai chế độ đánh địa chỉ mới: protected mode 32-bit và virtual 8086 mode. Hệ điều hành đầu bảng mới của Microsoft là NT và MS-Windows ở enhanced mode đều sử dụng protected mode 32-bit. Vì vậy NT cần ít nhất một 386 để chạy. Chế độ còn lại, virtual 8086 mode, tạo ra một máy 8086 ảo có address space 1 Mbyte. Có thể chạy đồng thời nhiều máy như vậy để hỗ trợ nhiều phiên MS-DOS ảo; mỗi phiên đều tưởng rằng nó đang chạy trên 8086 riêng. Đến đây, có lẽ bạn đang nghĩ những động tác xoay xở để khắc phục giới hạn của cách đánh địa chỉ ban đầu thật khó tin; bạn nghĩ đúng đấy. 80x86 là một kiến trúc khó chịu và đầy trở ngại khi viết compiler cũng như chương trình ứng dụng.

Tất cả các processor này đều có thể có coprocessor, thường nhằm thực hiện phép toán floating point bằng hardware. Coprocessor 8087 và 80287 giống nhau, ngoại trừ 287 có thể đánh địa chỉ extended memory giống 286. 387 có thể đánh địa chỉ bằng các chế độ giống 386, đồng thời bổ sung một số hàm siêu việt built-in.

### Giáo điều software

![image](images/ch07/img07-03.png)

Chọn thành phần IBM PC

Một số, thậm chí có lẽ là phần lớn, quyết định của IBM về PC rõ ràng dựa trên cơ sở non-technical. Trước khi chọn MS-DOS, IBM sắp xếp cuộc gặp Gary Kildall của Digital Research để cân nhắc CP/M. Theo câu chuyện được kể lại, ngày hôm ấy thời tiết đẹp đến mức Gary quyết định đi lái máy bay riêng. Các nhà quản lý IBM, có lẽ bực mình vì bị cho leo cây, chẳng bao lâu sau đã đạt thỏa thuận với Microsoft.

Bill Gates đã mua quyền đối với QDOS của Seattle Computer Products, <sup>\[1\]</sup> chỉnh sửa nó đôi chút và đổi tên thành “MS-DOS”. Phần còn lại, như người ta thường nói, đã trở thành lịch sử. IBM vui, Intel vui, còn Microsoft thì rất, rất vui. Digital Research không vui; Seattle Computer Products thì ngày càng kém vui khi nhận ra họ gần như đã cho không quyền đối với chương trình máy tính best-selling nhất mọi thời đại. Họ vẫn giữ quyền bán MS-DOS nếu bán kèm hardware. Vì vậy trước kia bạn có thể thấy Seattle Computer Products bán MS-DOS đi kèm những board và chip Intel vô dụng đến đáng lo ngại, một sự kết hợp khó tin chỉ để đáp ứng đúng câu chữ trong hợp đồng với Microsoft.

Đừng quá thương hại Seattle Computer Products: bản thân QDOS của họ dựa rất nhiều vào CP/M của Gary Kildall, còn ông thì thích đi lái máy bay hơn. Sau đó Bill Gates dùng phần lợi nhuận của mình mua một chiếc Porsche 959 super-fast. Chiếc xe có giá three-quarters triệu đô la, nhưng gặp rắc rối với Hải quan Mỹ khi nhập khẩu. Porsche 959 không được chạy tại Mỹ vì chưa vượt qua các cuộc thử nghiệm crash-worthiness government-mandated. Đến nay chiếc xe vẫn nằm không trong một nhà kho ở Oakland: một sản phẩm của Gates chắc chắn sẽ không bao giờ crash.

<sup>\[1\]</sup> Tên này có nghĩa đen là “Quick and Dirty Operating System”.

80486 là 80386 được đóng gói lại và nhanh hơn đôi chút vì bus không còn những trạng thái cho phép coprocessor hoạt động. Coprocessor của 486 hoặc được tích hợp, hoặc không được phép có, tương ứng với tên DX và SX. 486 bổ sung vài instruction nhỏ và có cache on-board, tức memory nhanh của processor; cache giải thích phần lớn mức tăng hiệu năng còn lại. Đến hiện tại, trong một đợt bùng nổ đổi mới và tranh chấp nhãn hiệu dữ dội, Intel đặt tên chip mới nhất là Pentium thay vì 80586. Nó nhanh hơn, đắt hơn, hỗ trợ toàn bộ instruction trước đó và bổ sung một số instruction mới. Có thể an tâm dự đoán rằng 80686 cũng được dự tính sẽ nhanh hơn, đắt hơn và cung cấp thêm instruction. Khẩu hiệu nội bộ của Intel khi liên tục ra chip mới là “nhanh lên hoặc chết”, và quả thực hãng sống theo khẩu hiệu ấy. Như bà tôi thường nói khi miệt mài bên guồng quay sợi: “Ai không nhớ lịch sử thì nhất định sẽ gặp những vấn đề tương thích ngược nghiêm trọng, nhất là khi thay đổi chế độ đánh địa chỉ hoặc wordsize của kiến trúc.”

## Memory model Intel 80x86 và nguồn gốc

Như đã thấy ở chương trước, thuật ngữ segment có ít nhất hai nghĩa khác nhau; ngoài ra còn nghĩa thứ ba memory-management-related trong hệ điều hành:

Một segment trên UNIX là một phần của binary chứa những thành phần có liên quan với nhau.

Một segment trong memory model Intel x86 là kết quả của thiết kế mà address space, vì lý do tương thích, không đồng nhất mà được chia thành các vùng 64-Kbyte gọi là segment.

Ở dạng cơ bản nhất trên 8086, segment ban đầu là một vùng memory 64-Kbyte được segment register trỏ tới. Địa chỉ được tạo bằng cách lấy giá trị trong segment register rồi dịch trái bốn vị trí, tương đương nhân với 16. Một cách nhìn thứ ba là giá trị segment register đã được biến thành đại lượng 20-bit bằng cách thêm bốn số không vào cuối.

Sau đó, offset 16-bit cho biết địa chỉ nằm ở đâu trong segment ấy. Cộng nội dung segment register với offset sẽ thu được địa chỉ cuối cùng. Có một điểm khác thường: giống như nhiều cặp số khác nhau có thể cùng có tổng là 24, nhiều cặp segment + offset khác nhau cũng có thể cùng trỏ tới một địa chỉ.

### Mẹo thực hành hữu ích

![image](images/ch07/img07-04.png)

Các pointer Different-Looking nhưng cùng địa chỉ

Địa chỉ trên Intel 8086 được tạo bằng cách kết hợp segment 16-bit với offset 16-bit. Segment được dịch trái bốn vị trí trước khi cộng offset. Vì vậy, nhiều cặp segment/offset khác nhau có thể trỏ đến cùng một địa chỉ.

segment offset địa chỉ kết quả

(dịch trái 4 bit)

`A0000` `+` `FFFF` `=` `AFFFF` `:`

`AFFF0` `+` `000F` `=` `AFFFF`

Nói chung, có 0x1000 (4096) tổ hợp segment/offset khác nhau cùng trỏ tới một địa chỉ.

Người viết compiler-writer C cần bảo đảm các pointer trên PC được so sánh ở dạng canonical; nếu không, hai pointer có bit pattern khác nhau nhưng cùng chỉ một địa chỉ có thể bị kết luận sai là không bằng nhau. Từ khóa “huge” sẽ thực hiện điều đó cho bạn, nhưng memory model “large” thì không. Từ khóa `far` trong Microsoft C cho biết pointer lưu nội dung segment register và offset. Từ khóa `near` có nghĩa pointer chỉ chứa offset 16-bit và sử dụng giá trị đã có trong data segment register hoặc stack segment register.

#### Mẹo thực hành hữu ích

![image](images/ch07/img07-04.png)

Hướng dẫn memory prefix

Tiền tố Lũy thừa của hai Ý nghĩa Số byte Kilo 2<sup>10</sup> Một nghìn byte 1,024 Mega 2<sup>20</sup> Một triệu byte 1,048,576 Giga 2<sup>30</sup> Một tỷ byte 1,073,741,824 Tera 2<sup>40</sup> Một nghìn tỷ byte 1,099,511,627,776 Bubba 2<sup>64</sup> Mười tám tỷ tỷ byte 18,446,744,073,709,551,616 Nhân nói về các con số này, hãy lưu ý rằng mọi nhà sản xuất đĩa đều dùng ký hiệu thập phân thay vì nhị phân để chỉ dung lượng đĩa. Vì vậy, đĩa 2-Gbyte chứa 2,000,000,000 byte chứ không phải 2,147,483,648 byte.

Address space 64-bit thực sự rất lớn. Nó có thể chứa trọn một bộ phim truyền hình high-definition trong memory cùng lúc. Thông số truyền hình high-definition vẫn chưa được thống nhất, nhưng có lẽ sẽ gần với SVGA: 1024 x 768 pixel, mỗi pixel cần khoảng ba byte thông tin màu.

Ở tốc độ 30 frame mỗi giây, như chuẩn NTSC hiện tại, một bộ phim two-hour sẽ cần:

120 phút= x 60 giây x 30 frame x 786,432 pixel x 3 byte màu

\= 509,607,936,000 byte

\= 500Gbyte memory

Như vậy, một virtual address space 64-bit có thể chứa không chỉ một mà tới 36 triệu bộ phim truyền hình high-definition, nhiều hơn tổng số phim từng được sản xuất đến nhiều bậc độ lớn, và vẫn còn dư. Bạn vẫn phải chừa chỗ cho hệ điều hành, nhưng điều đó không sao. SVID <sup>\[1\]</sup> hiện tại giới hạn UNIX kernel ở 512 Mbyte. Dĩ nhiên vẫn còn vấn đề nhỏ là phải có đĩa vật lý để lưu phần virtual memory này.

<sup>\[1\]</sup> SVID — System V Interface Definition — là một tài liệu đồ sộ mô tả API của System V.

Thách thức thực sự của kiến trúc máy tính ngày nay là tốc độ memory chứ không phải dung lượng. Chip Pentium mới tinh, đỏ bóng của bạn sẽ chẳng đem lại lợi ích gì nếu software thực sự bị giới hạn bởi latency của đĩa và memory, tức thời gian truy cập. Cụ thể, khoảng cách hiệu năng giữa memory và CPU vừa lớn vừa tiếp tục tăng. Trong thập niên qua, tốc độ CPU tăng gấp đôi sau mỗi one-and-a-half đến hai năm. Trong cùng thời gian, mật độ memory tăng gấp đôi, từ chip 64-Kb lên 128 Kb, nhưng thời gian truy cập chỉ cải thiện 10%. Thời gian truy cập main memory còn quan trọng hơn trên máy có address space khổng lồ. Khi truy cập lượng data rất lớn, latency để di chuyển data bắt đầu chi phối hiệu năng software. Hãy chờ đợi cache và các công nghệ liên quan được sử dụng nhiều hơn nữa trong tương lai.

#### Mẹo thực hành hữu ích

![image](images/ch07/img07-04.png)

Giới hạn MS-DOS 640Kb từ đâu

Ứng dụng chạy dưới MS-DOS chịu giới hạn cứng là chỉ có 640 Kbyte memory khả dụng. Giới hạn này xuất phát từ phạm vi địa chỉ tối đa của Intel 8086, máy DOS nguyên thủy. 8086 hỗ trợ địa chỉ 20-bit nên tổng memory bị giới hạn ở 1 Mbyte. Address space ấy còn bị thu hẹp do một số segment, mỗi segment 64 Kbyte, được dành cho hệ thống:

segment phần dành riêng `F0000` đến `FFFFF` 64 Kb cho vùng ROM thường trực: BIOS, chẩn đoán, v.v. `D0000` đến `EFFFF` 128 Kb cho vùng cartridge ROM `C0000` đến `CFFFF` 64 Kb cho BIOS extension (đĩa cứng XT) `B0000` đến `BFFFF` 64 Kb cho memory hiển thị thông thường `A0000` đến `AFFFF` 64 Kb cho phần mở rộng display memory

chỉ còn lại

`00000` đến `9FFFF` 640 Kb dành cho chương trình ứng dụng.

“Billion” và “trillion” có nghĩa khác nhau tại Mỹ và Anh. Ở Mỹ, chúng lần lượt là một nghìn triệu (10<sup>9</sup>) và một triệu triệu (10<sup>12</sup>). Ở Anh, chúng lớn hơn: lần lượt là một triệu triệu (10<sup>12</sup>) và một triệu triệu triệu (10<sup>18)</sup>). Chúng tôi thích cách dùng của Mỹ hơn vì các mức tăng độ lớn nhất quán từ thousand (10<sup>3</sup>) đến million (10<sup>6</sup>), billion (10<sup>9</sup>) rồi trillion (10<sup>12</sup>). Một billionaire ở Anh giàu hơn nhiều so với một billionaire ở Mỹ — ít nhất cho đến khi tỷ giá rơi xuống £1,000 đổi $1.

Giới hạn 640 Kb trong MS-DOS bắt nguồn từ tổng address space 1 Mbyte của chip 8086. MS-DOS dành riêng trọn sáu segment để sử dụng, nên ứng dụng chỉ còn 10 segment 64-Kbyte bắt đầu từ địa chỉ 0; ngay cả những địa chỉ thấp nhất trong block 0 cũng dành cho buffer và vùng làm việc của MS-DOS. Bill Gates từng nói năm 1981: “640 K hẳn phải đủ cho bất kỳ ai.” Khi PC mới ra mắt, 640 Kb có vẻ là một lượng memory khổng lồ. Thực tế, cấu hình tiêu chuẩn của chiếc PC đầu tiên chỉ có 16 K RAM.

#### Mẹo thực hành hữu ích

![image](images/ch07/img07-04.png)

Memory model PC

Microsoft C nhận biết những memory model sau:

small Mọi pointer đều là 16 bit, nên code và data mỗi loại chỉ nằm trong một segment,

và tổng kích thước chương trình bị giới hạn ở 128 K.

large Mọi pointer đều là 32 bit. Chương trình có thể chứa nhiều segment 64-K. medium Function pointer là 32 bit, nên có thể có nhiều code segment. Data

pointer là 16 bit, nên chỉ có thể có một data segment 64-K.

compact Ngược lại với medium: function pointer là 16 bit, vì vậy

code phải nhỏ hơn 64 K. Data pointer là 32 bit nên data có thể chiếm nhiều segment. Tuy nhiên, stack data vẫn bị giới hạn trong một segment 64-K.

Microsoft C nhận biết những từ khóa non-standard sau; khi áp dụng cho object pointer hoặc function pointer, chúng chỉ ghi đè memory model của riêng pointer ấy.

`__near` Pointer 16-bit `__far` Pointer 32-bit, nhưng toàn bộ object được trỏ tới phải nằm trong một segment (không

object nào được lớn hơn 64 K), nghĩa là sau khi nạp segment register, bạn có thể dùng nó để đánh địa chỉ toàn bộ object.

`__huge` Pointer 32-bit, và giới hạn yêu cầu mọi thứ nằm trong một segment được

gỡ bỏ.

Ví dụ: `char __huge * banana;`

Lưu ý rằng các từ khóa này sửa đổi thành phần nằm ngay bên phải chúng, trái với các type qualifier `const` và `volatile`, vốn sửa đổi pointer nằm ngay bên trái.

Ngoài các mặc định, bạn luôn có thể khai báo tường minh pointer near, far và huge trong bất kỳ memory model nào. Huge pointer luôn thực hiện phép so sánh và pointer arithmetic dựa trên giá trị canonical <sup>\[1\]</sup>. Ở dạng canonical, offset của pointer luôn nằm trong khoảng 0 đến 15. Nếu hai pointer đều ở dạng canonical, phép so sánh unsigned long sẽ cho kết quả chính xác.

Việc compile các tương tác giữa kích thước array và struct, kích thước pointer, memory model và chế độ hoạt động hardware 80x86 vừa khó vừa error-prone.

<sup>\[1\]</sup> Biết rồi, biết rồi. Chúng tôi đang dùng “canonical” theo đúng nghĩa canonical của nó.

Khi spreadsheet và word processor dần chứng tỏ giá trị, chúng đặt ra yêu cầu ever-increasing đối với memory. Người ta đã bỏ ra vô số công sức để ứng phó với address space hạn chế của IBM PC. Nhiều bộ mở rộng và tăng cường memory đã được sản xuất, nhưng vẫn không có giải pháp portable thỏa đáng. MS-DOS 1.0 về cơ bản là bản port CP/M sang 8086. Mọi phiên bản sau đều giữ tương thích với phiên bản đầu. Đó là lý do DOS 6.0 vẫn single-tasking và vẫn dùng chế độ “real-address” (8086-compatible) của 80x86, duy trì các giới hạn address space của chương trình người dùng. Memory model 8086 còn có những tác động không mong muốn khác. Mọi chương trình trên MS-DOS đều chạy với đặc quyền không hạn chế, tạo điều kiện cho virus software dễ dàng tấn công. Virus PC hẳn gần như không tồn tại nếu MS-DOS sử dụng hardware bảo vệ memory và task đã được tích hợp trong mọi processor Intel x86 từ 80286 trở đi.

## Virtual memory

Nếu nó có ở đó và bạn nhìn thấy được — đó là thực.

Nếu nó không ở đó mà bạn vẫn nhìn thấy được — đó là ảo.

Nếu nó có ở đó mà bạn không nhìn thấy được — đó là trong suốt.

Nếu nó không ở đó và bạn cũng không nhìn thấy được — bạn đã xóa nó rồi!

—Áp phích IBM giải thích virtual memory, khoảng năm 1978. Việc chương trình bị giới hạn bởi lượng main memory lắp trên máy, như trong MS-DOS, rất bất tiện. Vì thế, khái niệm virtual memory được phát triển từ những ngày đầu của ngành máy tính để loại bỏ giới hạn này. Ý tưởng cơ bản là dùng dung lượng đĩa rẻ nhưng chậm để mở rộng main memory nhanh nhưng đắt. Những vùng memory mà chương trình thực sự sử dụng tại một thời điểm được đưa vào physical memory. Những vùng không được đụng đến trong một thời gian có thể được lưu ra đĩa để nhường chỗ cho các vùng đang được sử dụng. Mọi hệ thống máy tính hiện đại, từ supercomputer lớn nhất đến workstation nhỏ nhất, đều sử dụng virtual memory; PC là ngoại lệ duy nhất.

Việc đưa các phần không dùng ra đĩa từng do lập trình viên thực hiện thủ công, vào thời xa xưa của ngành máy tính, khi rắn còn biết đi. Họ phải bỏ rất nhiều công sức theo dõi những gì đang có trong memory tại từng thời điểm và đưa segment vào, ra khi cần. Các ngôn ngữ lâu đời như COBOL vẫn chứa cả một hệ thống tính năng để diễn đạt memory overlaying, những thứ hoàn toàn lỗi thời và không thể giải thích nổi với thế hệ lập trình viên hiện nay.

Lưu trữ nhiều cấp là khái niệm quen thuộc. Chúng ta gặp nó ở những nơi khác trong máy tính, chẳng hạn giữa register và main memory. Về lý thuyết, mọi vị trí memory đều có thể là register. Trong thực tế, chi phí như vậy cao đến mức không thể chấp nhận, nên phải đánh đổi tốc độ truy cập để có cách thực hiện rẻ hơn. Virtual memory chỉ mở rộng thêm một cấp, dùng đĩa thay cho main memory để chứa image của process đang chạy. Như vậy, ta có một dải liên tục các cấp lưu trữ.

### Mẹo thực hành hữu ích

![image](images/ch07/img07-04.png)

![image](images/ch07/img07-05.png)

Process trên SunOS thực thi trong address space 32-bit. Hệ điều hành sắp xếp để mỗi process tưởng rằng nó có quyền sử dụng độc chiếm toàn bộ address space. Ảo giác này được sus-tained bởi “virtual memory”, cơ chế chia sẻ physical memory của máy và dùng đĩa lưu data khi memory đầy. Trong lúc process chạy, data liên tục được chuyển từ memory ra đĩa rồi trở lại. Hardware quản lý memory chuyển virtual address thành physical address và cho phép process chạy ở bất kỳ vị trí nào trong memory thực của hệ thống. Lập trình viên ứng dụng chỉ thấy virtual address và không có cách biết process đã chuyển ra đĩa rồi trở lại memory, trừ khi quan sát thời gian trôi qua hoặc xem các lệnh hệ thống như “`ps`”. Hình 7-3 minh họa những nguyên lý cơ bản của virtual memory.

Hình 7-3. Những nguyên lý cơ bản của virtual memory

![image](images/ch07/img07-06.png)

Virtual memory được tổ chức thành các “page”. Page là đơn vị mà hệ điều hành di chuyển và bảo vệ, thường có kích thước vài Kbyte. Bạn có thể xem pagesize của hệ thống bằng cách gõ `/usr/ucb/pagesize`. Khi memory image di chuyển giữa đĩa và physical memory, ta gọi là paged in nếu đi vào memory và paged out nếu đi ra đĩa.

Hệ thống có thể cần sử dụng toàn bộ memory gắn với một process. Nếu process ít có khả năng sớm chạy lại, có thể do thuộc loại low-priority hoặc đang sleep, toàn bộ tài nguyên physical memory đã cấp cho nó có thể bị thu hồi và lưu ra đĩa. Khi ấy process được gọi là “swapped out”. Trên đĩa có một “swap area” đặc biệt để chứa memory đã được page hoặc swap. Swap area thường lớn gấp nhiều lần physical memory trên máy. Chỉ user process mới page và swap; SunOS kernel luôn memory-resident.

Process chỉ có thể thao tác trên page đang nằm trong memory. Khi process tham chiếu đến một page không có trong memory, MMU phát sinh page fault. Kernel đáp ứng sự kiện và quyết định tham chiếu đó hợp lệ hay không. Nếu không hợp lệ, kernel gửi signal “segmentation violation” cho process. Nếu hợp lệ, kernel lấy page từ đĩa vào. Khi page đã trở lại memory, process hết bị block và có thể tiếp tục chạy, hoàn toàn không biết mình từng bị giữ lại để chờ một sự kiện page-in.

SunOS có cách nhìn thống nhất đối với disk filesystem và main memory. Hệ điều hành sử dụng cùng một data structure nền tảng, vnode hay “virtual node”, để thao tác với cả hai. Mọi thao tác virtual memory đều được tổ chức theo triết lý duy nhất: map một vùng file vào một vùng memory. Cách này cải thiện hiệu năng và cho phép tái sử dụng đáng kể code. Bạn cũng có thể nghe đến “hat layer”: đó là software “hardware address translation” điều khiển MMU. Nó phụ thuộc rất mạnh vào hardware, tức hardware-dependent, và phải được viết lại cho từng kiến trúc máy tính mới.

Virtual memory hiện là kỹ thuật không thể thiếu của công nghệ hệ điều hành: nó cho phép lượng process cỡ bình một quart chạy trong chiếc bình memory chỉ có một pint. Phần giải trí nhẹ nhàng cuối chương còn mô tả virtual memory bằng một truyện ngụ ngôn. Đó là một tác phẩm kinh điển.

#### Thử thách lập trình

![image](images/ch07/img07-07.png)

Bạn có thể cấp phát bao nhiêu memory?

Chạy chương trình sau để xem bạn có thể cấp phát bao nhiêu memory trong process của mình.

```
#include <stdio.h>
#include <stdlib.h>
main() {
    int Mb = 0;
    while ( malloc(1<<20)) ++Mb;
    printf("Allocated %d Mb total\n", Mb);
}
```

Tổng dung lượng phụ thuộc vào swap space và process limit được cấu hình trên hệ thống. Nếu cấp phát từng block nhỏ hơn một Mbyte, bạn có lấy được nhiều memory hơn không? Vì sao?

Để chạy chương trình trên MS-DOS memory-limited, hãy cấp phát từng block 1-Kbyte thay vì 1-Mbyte.

## Cache memory

Cache memory mở rộng thêm khái niệm lưu trữ multi-level. Đó là một memory buffer nhỏ, đắt nhưng cực nhanh, nằm đâu đó giữa CPU và physical memory. Cache có thể nằm về phía CPU của memory management unit (MMU), như trên Sun SPARCstation 2. Khi ấy nó cache virtual address và phải được flush sau mỗi context switch. (Xem Hình 7-4.) Hoặc cache có thể nằm về phía physical memory của MMU, như trên SPARCstation 10. Nhờ cache physical address, cách này cho phép các CPU trong hệ multiprocessor chia sẻ cache dễ dàng.

Hình 7-4. Những nguyên lý cơ bản của cache memory

![image](images/ch07/img07-08.png)

Mọi processor hiện đại đều sử dụng cache memory. Mỗi khi đọc data từ memory, cả một “line”, thường là 16 hoặc 32 byte, được đưa vào cache. Nếu chương trình có locality of reference tốt, chẳng hạn duyệt dọc một chuỗi ký tự, những tham chiếu sau đến data lân cận có thể lấy từ cache nhanh thay vì main memory chậm. Cache hoạt động với cùng chu kỳ của hệ thống, nên với processor 50 MHz, thời gian cache là 20 nanosecond. Main memory thường có thể chậm hơn bốn lần! Cache đắt hơn, chiếm nhiều diện tích và tiêu thụ nhiều điện hơn memory thông thường, nên ta dùng nó để bổ trợ thay vì làm hình thức memory duy nhất của hệ thống.

Cache chứa danh sách địa chỉ cùng nội dung của chúng. Danh sách địa chỉ liên tục thay đổi khi processor tham chiếu các vị trí mới. Cả đọc lẫn ghi đều đi qua cache. Khi processor muốn lấy data từ một địa chỉ cụ thể, yêu cầu trước tiên được gửi tới cache. Nếu data đã có trong cache, nó được trả về ngay. Nếu không, cache chuyển tiếp yêu cầu và một lần truy cập main memory chậm hơn sẽ diễn ra. Một line mới được lấy về và chiếm chỗ trong cache.

Nếu chương trình có hành vi khá trái khoáy và lần nào cũng vừa trượt cache, hiệu năng cuối cùng còn tệ hơn khi không có cache. Nguyên nhân là toàn bộ logic bổ sung để xác định thứ gì nằm ở đâu đều phải trả giá.

Hiện Sun sử dụng hai loại cache:

- Write-through cache— Mỗi lần ghi vào cache, nó luôn đồng thời khởi động một lần ghi vào main memory.

- Write-back cache— Ban đầu, nó chỉ ghi vào cache. Data được chuyển tới main memory khi cache line sắp bị ghi lại mà chưa được lưu. Data cũng được chuyển đi khi context switch sang một process khác hoặc sang kernel.

Trong cả hai trường hợp, instruction stream tiếp tục ngay khi truy cập cache hoàn tất, không chờ memory chậm hơn theo kịp.

Cache trên SPARCstation 2 chứa 64 Kbyte data write-through và mỗi line có kích thước 32 byte. Cache lớn hơn nhiều đang trở nên phổ biến: SPARCserver 1000 có cache memory write-back 1-Mbyte. Có thể có cache riêng cho I/O bus nếu processor sử dụng memory-mapped I/O; instruction và data cũng thường có cache riêng. Ngoài ra còn có cache nhiều cấp, và cache có thể được áp dụng ở bất kỳ giao diện nào giữa thiết bị nhanh và chậm, chẳng hạn giữa đĩa và memory. PC thường dùng cache trong main memory để hỗ trợ đĩa chậm, gọi là “RAMdisk”. Trong UNIX, inode của đĩa được cache trong memory. Đó là lý do filesystem có thể hỏng nếu power-ing, tức tắt nguồn máy, mà chưa dùng lệnh “sync” flush cache ra đĩa.

Cache và virtual memory đều vô hình đối với lập trình viên ứng dụng, nhưng cần hiểu lợi ích mà chúng mang lại cũng như cách chúng có thể tác động mạnh đến hiệu năng.

Bảng 7-1. Cache memory được cấu thành từ những gì

| Thuật ngữ | Định nghĩa |
|---|---|
| Line | Line là đơn vị truy cập cache. Mỗi line có hai phần: phần data và tag chỉ định địa chỉ mà nó đại diện. |
| Block | Nội dung data của một line được gọi là block. Block chứa các byte được chuyển giữa một line và main memory. Kích thước block điển hình là 32 byte. <br> Nội dung cache line đại diện cho một block memory cụ thể và sẽ đáp ứng nếu processor cố truy cập phạm vi địa chỉ đó. Cache line “giả làm” phạm vi địa chỉ ấy trong memory, nhưng nhanh hơn đáng kể. <br> Phần lớn người trong ngành máy tính sử dụng “block” và “line” một cách không chặt chẽ và thay thế cho nhau. |
| Cache | Cache gồm một tập hợp lớn các line, thường từ 64 Kbyte đến 1 Mbyte hoặc hơn. Đôi khi associative memory hardware được dùng để tăng tốc truy cập tag. Cache nằm ngay cạnh CPU để đạt tốc độ cao; memory system và bus được tinh chỉnh rất kỹ để tối ưu việc di chuyển những khối data cache-block-sized. |

### Mẹo thực hành hữu ích

![image](images/ch07/img07-04.png)

Một trải nghiệm với cache

Chạy chương trình sau để xem bạn có phát hiện được ảnh hưởng của cache trên hệ thống hay không.

```
#define DUMBCOPY for (i = 0; i < 65536; i++) \
 destination[i] = source[i]

#define SMARTCOPY memcpy(destination, source, 65536)

main()
{
    char source[65536], destination[65536];
    int i, j;
    for (j = 0; j < 100; j++)
SMARTCOPY;

}

% cc -O cache.c
% time a.out
1.0 seconds user time

# change to DUMBCOPY and recompile
% time a.out
7.0 seconds user time
```

Compile và đo thời gian chạy chương trình trên theo hai cách: trước tiên giữ nguyên, sau đó đổi lời gọi macro thành `DUMBCOPY`. Chúng tôi đo trên SPARCstation 2 và thấy hiệu năng liên tục suy giảm đáng kể với cách copy ngây ngô.

Sự chậm lại xảy ra vì khoảng cách giữa source và destination đúng bằng một bội số của kích thước cache. Cache line trên SS2 không được điền tuần tự: thuật toán cụ thể được sử dụng lại điền cùng một line cho những địa chỉ main memory cách nhau đúng các bội số kích thước cache. Điều này bắt nguồn từ cách tối ưu lưu trữ tag: trong thiết kế này, tag chỉ chứa các bit high-order của từng địa chỉ.

Mọi máy sử dụng cache, bao gồm supercomputer, PC hiện đại và tất cả những loại ở giữa, đều có thể bị giảm hiệu năng do những trường hợp bất thường như thế này. Kết quả cụ thể sẽ khác tùy máy và cách triển khai cache.

Trong trường hợp cụ thể này, cả source và destination sử dụng cùng cache line, khiến mọi tham chiếu memory đều cache miss và làm processor dừng chờ memory thông thường cung cấp data. Routine thư viện `memcpy()` được tinh chỉnh đặc biệt để có hiệu năng cao. Nó unroll loop để đọc trọn một cache line rồi mới ghi, nhờ đó tránh được vấn đề. Với cách copy thông minh, chúng tôi đạt mức cải thiện hiệu năng rất lớn. Điều này cũng cho thấy sự ngớ ngẩn của việc rút ra kết luận từ các chương trình benchmark simple-minded.

## Data segment và heap

Chúng ta đã xem xét nền tảng của các vấn đề memory system-related, nên giờ là lúc trở lại cách bố trí memory bên trong từng process. Khi đã hiểu các vấn đề ở cấp hệ thống, bạn sẽ thấy các vấn đề ở cấp process dễ hiểu hơn nhiều. Cụ thể, trước tiên ta sẽ xem kỹ hơn data segment trong process.

Giống như stack segment tăng trưởng động theo nhu cầu, data segment cũng chứa một thành phần có khả năng ấy: heap, được minh họa ở Hình 7-5. Heap dành cho storage được cấp phát động, tức storage lấy qua `malloc` (memory allocate) và truy cập qua pointer. Mọi thứ trong heap đều vô danh: bạn không thể truy cập trực tiếp bằng tên mà chỉ gián tiếp qua pointer. Lời gọi thư viện `malloc` và các hàm cùng họ như calloc, realloc, v.v. là cách duy nhất lấy storage từ heap. Hàm `c` `alloc` giống malloc, nhưng đặt memory về zero trước khi trả pointer. Đừng nghĩ chữ “`c` ” trong `c` `alloc`() liên quan đến lập trình C: nó có nghĩa là “cấp phát memory đã được đặt về zero”. Hàm `realloc()` thay đổi kích thước block memory được trỏ tới, làm nó lớn lên hoặc nhỏ đi, thường bằng cách copy nội dung sang nơi khác rồi trả pointer tới vị trí mới. Điều này hữu ích khi tăng kích thước bảng một cách động; Chương 10 sẽ nói thêm.

Hình 7-5. Heap ở đâu

![image](images/ch07/img07-09.png)

Heap memory không phải được trả lại theo thứ tự đã lấy, thậm chí không bắt buộc trả lại, nên các thao tác malloc/free không theo thứ tự cuối cùng gây heap fragmentation. Heap phải theo dõi những vùng khác nhau và biết chúng đang được sử dụng hay sẵn sàng cho malloc. Một phương án là duy trì linked list của các block khả dụng, gọi là “free store”, và đặt trước mỗi block giao cho malloc một số đếm kích thước đi kèm. Một số người dùng thuật ngữ arena để chỉ tập block do memory allocator quản lý; trong SunOS, đó là vùng từ cuối data segment đến vị trí hiện tại của break. Memory do malloc cấp luôn được align phù hợp với kích thước atomic access lớn nhất của máy; kích thước yêu cầu malloc có thể được làm tròn lên một lũy thừa hai thuận tiện. Memory được free trở lại heap để tái sử dụng, nhưng không có cách thuận tiện để loại nó khỏi process và trả lại hệ điều hành.

Cuối heap được đánh dấu bằng một pointer gọi là “break”. <sup>\[2\]</sup> Khi heap manager cần thêm memory, nó có thể đẩy break ra xa hơn bằng system call `brk` và `sbrk`. Thông thường bạn không tự gọi brk tường minh, nhưng nếu malloc đủ nhiều memory thì cuối cùng brk sẽ được gọi thay bạn. Các lời gọi quản lý memory gồm:

<sup>\[2\]</sup> Chương trình của bạn sẽ “break”, tức hỏng, nếu tham chiếu vượt quá break…

`malloc` và `free`— lấy memory từ heap và trả lại heap

`brk` và `sbrk`— điều chỉnh kích thước data segment tới một giá trị tuyệt đối hoặc theo một lượng tăng

Một điều cần thận trọng: chương trình của bạn không được gọi cả `malloc()` lẫn `brk()`. Nếu dùng malloc, hàm này kỳ vọng có toàn quyền quyết định khi nào gọi brk và sbrk. Vì sbrk là cách duy nhất để process trả data segment memory cho kernel, sử dụng malloc trên thực tế khiến bạn không thể thu nhỏ data segment của chương trình. Để lấy memory có thể trả lại kernel sau này, hãy dùng system call mmap để map file /dev/zero. Muốn trả memory ấy, hãy dùng munmap.

## Memory leak

Một số chương trình không cần quản lý việc sử dụng dynamic memory: chúng chỉ cấp phát những gì cần và chẳng bận tâm free. Nhóm này gồm compiler và các chương trình khác chạy trong khoảng thời gian cố định hoặc có giới hạn rồi kết thúc. Khi kết thúc, chương trình tự động trả toàn bộ memory, nên ít cần bỏ công trả từng byte ngay khi không còn sử dụng.

Những chương trình khác thì long-lived hơn. Một số tiện ích như calendar manager, mailtool và chính hệ điều hành phải chạy liên tục nhiều ngày hoặc nhiều tuần, nên phải quản lý việc cấp phát và giải phóng dynamic memory. Vì C thường không có garbage collection, tức tự động nhận diện và giải phóng block memory không còn sử dụng, các chương trình C này phải hết sức thận trọng với `malloc()` và `free()`. Có hai loại vấn đề heap thường gặp:

- Free hoặc ghi đè một thứ vẫn đang được sử dụng: đây là “memory corruption”.

- Không free một thứ không còn được sử dụng: đây là “memory leak”.

Đây là những vấn đề khó debug bậc nhất. Nếu lập trình viên không free từng block do malloc cấp khi không còn cần đến, process sẽ lấy ngày càng nhiều memory mà không giải phóng những phần đã hết sử dụng.

### Mẹo thực hành hữu ích

![image](images/ch07/img07-04.png)

Tránh memory leak

Mỗi khi viết `malloc`, hãy viết một statement `free` tương ứng.

Nếu không biết đặt “free” tương ứng với “malloc” ở đâu, rất có thể bạn đã tạo ra memory leak!

Một cách đơn giản để tránh điều này là dùng `alloca()` cho nhu cầu cấp phát động khi có thể. Routine `alloca()` cấp memory trên stack; khi rời function nơi bạn đã gọi nó, memory tự động được free.

Rõ ràng không thể dùng cách này cho structure cần sống lâu hơn lần gọi function đã tạo nó. Nhưng với những thứ chấp nhận giới hạn ấy, cấp phát dynamic memory trên stack là lựa chọn low-overhead. Một số người không tán thành alloca vì nó không phải cấu trúc portable. Khó triển khai `alloca()` hiệu quả trên processor không hỗ trợ stack bằng hardware.

Ta dùng thuật ngữ “memory leak” vì một tài nguyên khan hiếm đang rút dần khỏi process. Triệu chứng user-visible chính là process gây lỗi trở nên chậm hơn. Process lớn có khả năng phải bị swap out cao hơn để các process khác có cơ hội chạy, đồng thời mất nhiều thời gian swap in và swap out hơn. Theo định nghĩa, memory bị leak không còn được tham chiếu, nhưng nó có thể nằm chung page với data vẫn được tham chiếu, làm working set lớn lên và giảm hiệu năng. Cũng cần lưu ý rằng lượng leak thường lớn hơn kích thước data structure bị quên, vì `malloc()` thường làm tròn yêu cầu storage lên power-of-two kế tiếp. Trong trường hợp cực đoan, process có memory leak có thể làm chậm cả máy chứ không chỉ người dùng chương trình gây lỗi. Mỗi process có giới hạn kích thước lý thuyết khác nhau tùy hệ điều hành. Trên các bản SunOS hiện tại, address space của process có thể đạt 4 Gbyte; thực tế, swap space sẽ cạn từ lâu trước khi leak đủ để process lớn đến vậy. Nếu đọc cuốn sách sau năm năm, khoảng lúc bước sang thiên niên kỷ mới, có lẽ bạn sẽ bật cười trước giới hạn khi ấy đã long-obsolete này.

### Cách kiểm tra memory leak

Tìm memory leak là quy trình two-step. Trước tiên, dùng lệnh swap để xem còn bao nhiêu swap space:

```
/usr/sbin/swap -s
total: 17228k bytes allocated + 5396k reserved = 22624k used,
29548k
available
```

Gõ lệnh ba hoặc bốn lần trong một đến hai phút để xem swap space khả dụng có liên tục giảm không. Bạn cũng có thể dùng các công cụ `/usr/bin/*stat` khác như `netstat,` `vmstat`, v.v. Nếu memory sử dụng tăng lên mà không bao giờ được giải phóng, một cách giải thích có thể là process đang bị memory leak.

#### Mẹo thực hành hữu ích

![image](images/ch07/img07-04.png)

Nghe nhịp mạng: click để chỉnh

Trong mọi công cụ điều tra network, đứng đầu tuyệt đối là `snoop.`

Là công cụ thay `etherfind` trong SVr4, `snoop` bắt packet từ network và hiển thị trên workstation. Bạn có thể yêu cầu snoop chỉ tập trung vào một hoặc hai máy, chẳng hạn workstation của mình và server. Điều này hữu ích khi xử lý lỗi kết nối: snoop cho biết các byte có thực sự rời máy của bạn hay không.

Tuy nhiên, tính năng tuyệt nhất của snoop là tùy chọn `-a`. Nó khiến snoop phát một tiếng click qua loa workstation cho mỗi packet. Nhờ đó bạn nghe được traffic trên mạng Ethernet; độ dài packet khác nhau tạo điều biến âm thanh khác nhau. Nếu dùng `snoop -a` thường xuyên, bạn sẽ giỏi nhận ra các âm thanh đặc trưng, từ đó xử lý sự cố và tinh chỉnh network “bằng tai” theo nghĩa đen!

Bước thứ hai là xác định process đáng nghi và xem nó có thực sự gây memory leak không. Có thể bạn đã biết process nào gây vấn đề. Nếu chưa, lệnh `ps -lu` `username` hiển thị kích thước mọi process của bạn, như ví dụ dưới:

```
F S UID PID PPID C PRI NI ADDR    SZ  WCHAN    TTY   TIME COMD
8 S 5303 226 224 80 1 20 ff38f000 199 ff38f1d0 pts/3 0:01 csh
8 O 5303 921 226 29 1 20 ff38c000 143          pts/3 0:00 ps
```

Cột `SZ` là kích thước process tính bằng page. Nếu thật sự muốn biết dung lượng Kbyte, lệnh `pagesize` sẽ cho bạn biết kích thước mỗi page. Hãy lặp lại lệnh vài lần: bạn có thể quan sát bất kỳ chương trình cấp phát dynamic memory nào tăng kích thước. Nếu process có vẻ lớn lên liên tục mà không bao giờ ổn định, hãy nghi ngờ memory leak. Một sự thật đáng buồn là quản lý dynamic memory là nhiệm vụ lập trình rất khó. Một số ứng dụng X-Window thuộc public domain nổi tiếng vì rò rỉ hệt như hội đồng quản trị Apple Computer.

Hệ thống thường cung cấp nhiều thư viện malloc khác nhau: có thư viện tối ưu tốc độ, có thư viện tối ưu dung lượng và có thư viện hỗ trợ debug. Hãy nhập lệnh

```
man -s 3c malloc
```

để xem manpage và toàn bộ routine trong họ malloc. Hãy bảo đảm bạn link với thư viện thích hợp. Debugger SPARCWorks trên Solaris 2.x có nhiều tính năng phát hiện memory leak, thay thế các thư viện malloc chuyên biệt của Solaris 1.x.

#### Giáo điều software

![image](images/ch07/img07-03.png)

Chủ tịch và printtool — Lỗi memory leak

Dạng memory leak đơn giản nhất là:

```
for (i=0; i<10; i++)
     p = malloc(1024);
```

Đây là tàu Exxon Valdez của software: nó làm rò rỉ mọi thứ bạn đưa cho nó.

Qua mỗi lần lặp, địa chỉ trước đó giữ trong p bị ghi đè, và block memory một Kbyte mà nó trỏ tới “rò rỉ mất”. Vì không còn gì trỏ tới block, không có cách truy cập hoặc free memory ấy. Phần lớn memory leak không lộ liễu đến mức ghi đè pointer duy nhất tới block trước khi free, nên khó nhận diện và debug hơn.

Một trường hợp thú vị xảy ra với software printtool ở Sun. Một bản thử nghiệm nội bộ của hệ điều hành được cài trên máy desktop của Scott McNealy, chủ tịch công ty. <sup>\[1\]</sup> Ông sớm nhận thấy workstation chậm dần trong vài ngày. Reboot lập tức khắc phục vấn đề. Ông báo lỗi, và chẳng có gì khiến người ta tập trung bằng bug report do chủ tịch công ty gửi.

Chúng tôi phát hiện “printtool”, giao diện cửa sổ bao quanh lệnh in, kích hoạt vấn đề. “Printtool” là loại software chủ tịch công ty hay dùng nhưng các nhà phát triển hệ điều hành ít dùng, vì vậy lỗi trước đó chưa bị phát hiện. Kill printtool khiến memory leak ngừng, nhưng `ps -lu scott` cho thấy printtool chỉ kích hoạt leak chứ bản thân không tăng kích thước. Cần xem xét các system call mà printtool sử dụng.

Theo thiết kế, printtool cấp phát một named pipe, loại file đặc biệt cho phép hai process không liên quan giao tiếp, rồi dùng nó để nói chuyện với process line printer. Cứ vài giây nó tạo pipe mới, rồi hủy nếu chẳng có gì đáng nói với printer. Memory leak thực sự nằm trong system call tạo pipe. Khi pipe được tạo, kernel memory được cấp để chứa vnode data structure điều khiển nó, nhưng code duy trì reference count của structure bị lệch một đơn vị.

Do đó, khi số người dùng pipe thực sự giảm về zero, bộ đếm vẫn giữ giá trị 1, khiến kernel luôn tưởng pipe còn đang được sử dụng. Vnode struct vì thế không bao giờ được free như lẽ ra phải làm khi đóng pipe. Mỗi lần đóng pipe, vài trăm byte memory bị leak trong kernel. Tổng cộng mỗi ngày mất nhiều megabyte, đủ khiến chiếc workstation entry-level mà chúng tôi cấp cho chủ tịch quỵ xuống sau hai hoặc ba ngày.

Chúng tôi sửa bug off-by-one trong thuật toán reference count của vnode, và routine giải phóng kernel memory thông thường bắt đầu hoạt động đúng như dự kiến. Chúng tôi cũng sửa printtool để dùng thuật toán thông minh hơn thay vì cứ vài giây lại lải nhải hỏi printer. Memory leak được bịt lại, các lập trình viên thở phào, quản lý kỹ thuật lại mỉm cười và chủ tịch tiếp tục dùng printtool.

<sup>\[1\]</sup> Thật ra đây là ý tưởng khá hay. Để chủ tịch chạy software phát hành sớm và tham gia thử nghiệm nội bộ khiến mọi người luôn cảnh giác. Việc đó bảo đảm quản lý cấp cao hiểu rõ sản phẩm đang phát triển và tốc độ cải thiện của nó, đồng thời cung cấp cho nhóm kỹ thuật cả động lực lẫn nguồn lực để loại bỏ những bug cuối cùng.

Kernel của hệ điều hành cũng quản lý memory một cách động. Nhiều bảng data trong kernel được cấp phát động để không phải đặt trước giới hạn cố định. Nếu lỗi lập trình kernel gây memory leak, máy sẽ chậm lại; trường hợp cực đoan có thể hang, thậm chí panic. Khi routine kernel xin memory, chúng thường đợi đến lúc có memory khả dụng. Nếu memory cứ leak, cuối cùng chẳng còn gì và mọi bên đều chờ: máy bị hang. Memory leak trong kernel thường lộ ra nhanh vì phần lớn đường thực thi qua kernel được sử dụng rất nhiều. Chúng tôi cũng có các công cụ software chuyên biệt để thử nghiệm và kiểm tra hoạt động quản lý kernel memory.

## Bus error, đi tàu đi

Khi mới lập trình UNIX vào cuối thập niên 1970, giống nhiều người khác, tôi nhanh chóng gặp hai runtime error phổ biến:

```
bus error (core dumped)
```

và

```
segmentation fault (core dumped)
```

Khi ấy, những lỗi này rất khó chịu: không có lời giải thích đơn giản về loại lỗi source code gây ra chúng, thông báo không gợi ý nên tìm ở đâu trong code, và sự khác nhau giữa chúng hoàn toàn không rõ. Đến nay tình hình vẫn vậy.

Phần lớn vấn đề nằm ở chỗ các lỗi đại diện cho bất thường mà hệ điều hành phát hiện, và bất thường ấy được thông báo theo cách thuận tiện nhất cho hệ điều hành. Vì thế, nguyên nhân chính xác của bus error và segmentation fault thay đổi giữa các phiên bản hệ điều hành. Ở đây, chúng tôi mô tả ý nghĩa và nguyên nhân của chúng trên SunOS chạy kiến trúc SPARC.

Cả hai lỗi xảy ra khi hardware báo cho hệ điều hành một tham chiếu memory có vấn đề. Hệ điều hành thông báo cho process gây lỗi bằng cách gửi signal. Signal là thông báo sự kiện hoặc interrupt software-generated, rất hay dùng trong lập trình UNIX system nhưng hầu như không dùng trong lập trình ứng dụng. Mặc định, khi nhận signal “bus error” hoặc “segmentation fault”, process sẽ dump core rồi kết thúc; tuy nhiên, bạn có thể thiết lập signal handler để thực hiện hành động khác.

Signal được mô phỏng theo hardware interrupt. Lập trình interrupt khó vì mọi thứ xảy ra bất đồng bộ, vào thời điểm không dự đoán được; do đó lập trình và debug signal cũng khó. Bạn có thể tìm hiểu thêm bằng cách đọc manpage của signal và xem include file

```
/usr/include/sys/signal.h.
```

### Thử thách lập trình

![image](images/ch07/img07-07.png)

Bắt signal trên PC

Các hàm xử lý signal nay thuộc ANSI C và áp dụng cho cả PC lẫn UNIX. Chẳng hạn, lập trình viên PC có thể dùng signal() để bắt Ctrl-Break và ngăn người dùng thoát khỏi chương trình.

Hãy viết signal handler bắt signal INT 1B (Ctrl-Break) trên PC. Cho nó in một thông báo user-friendly nhưng không thoát.

Nếu dùng UNIX, hãy viết signal handler sao cho khi nhận control-C (control-C được chuyển tới UNIX process dưới dạng signal `SIGINT`), chương trình khởi động lại thay vì thoát. Các typedef giúp định nghĩa signal handler được trình bày trong Chương 3 về declaration.

Mọi source file sử dụng signal đều cần include header file `<signal.h>`.

Phần “core dump” trong thông báo chỉ là di sản từ thời mọi memory đều làm bằng vòng ferrite, hay “core”. Semiconductor memory đã phổ biến suốt ít nhất 15 năm, nhưng “core” vẫn tồn tại như từ đồng nghĩa với “main memory”.

### Bus error

Trong thực tế, bus error hầu như luôn do thao tác đọc hoặc ghi misaligned gây ra. Nó được gọi là bus error vì address bus là thành phần bị nghẽn khi có yêu cầu load hoặc store misaligned. Alignment nghĩa là data item chỉ được lưu tại địa chỉ là bội số của kích thước nó. Trên kiến trúc hiện đại, đặc biệt RISC, data alignment là bắt buộc vì logic bổ sung để hỗ trợ alignment tùy ý làm cả memory system lớn và chậm hơn nhiều. Buộc từng lần truy cập memory nằm trong một cache line hoặc một page giúp đơn giản hóa đáng kể, do đó tăng tốc, hardware như cache controller và memory management unit.

Cách diễn đạt quy tắc “không data item nào được vượt ranh giới page hoặc cache” hơi gián tiếp: ta nói theo address alignment thay vì cấm vượt ranh giới page, nhưng thực chất là một. Chẳng hạn, chỉ được truy cập double 8-byte tại địa chỉ chia hết cho 8 byte. Vì vậy có thể lưu double ở địa chỉ 24, 8008 hoặc 32768, nhưng không ở 1006 vì số này không chia hết cho 8. Kích thước page và cache được thiết kế cẩn thận để tuân thủ alignment sẽ bảo đảm không atomic data item nào tràn qua ranh giới page hoặc cache block.

Yêu cầu lưu data đúng alignment luôn khiến chúng tôi nhớ trò trẻ con đi trên vỉa hè mà tránh giẫm lên khe giữa các viên lát. “Giẫm lên khe nứt, làm gãy lưng mẹ” đã biến thành “dereference lệch hàng rồi chửi, gây lỗi trên bus”. Có lẽ đó là chuyện kiểu Freud: mẹ từng bị một kênh I/O Fortran làm hoảng sợ ở tuổi dễ bị tác động. Một chương trình nhỏ gây bus error là:

```
union { char a[10];
        int i;
      } u;
int *p= (int*) &(u.a[1]);
*p = 17; /* the misaligned addr in p causes a bus error! */
```

Chương trình gây bus error vì union array/int bảo đảm character array “a” cũng nằm tại địa chỉ align đủ cho integer, nên “a+1” chắc chắn không như vậy. Sau đó ta cố lưu 4 byte vào địa chỉ chỉ align cho truy cập single-byte. Compiler tốt sẽ cảnh báo misalignment nhưng không thể phát hiện mọi trường hợp.

Compiler tự động cấp phát và thêm padding cho data trong memory để đạt alignment. Dĩ nhiên đĩa hoặc băng từ không có yêu cầu alignment như vậy, nên lập trình viên có thể chẳng biết gì về nó cho đến khi cast char pointer thành int pointer và gặp bus error bí hiểm. Vài năm trước, phát hiện memory parity error cũng gây bus error. Ngày nay chip memory đáng tin cậy và được bảo vệ tốt bằng mạch phát hiện, sửa lỗi đến mức lập trình ứng dụng gần như không còn nghe đến parity error. Tham chiếu memory không tồn tại vật lý cũng có thể gây bus error; có lẽ bạn khó phá hỏng đến mức ấy nếu không có một device driver nghịch ngợm hỗ trợ.

### Segmentation fault

Với segment model đã giải thích trước đó, segmentation fault hay violation hẳn đã rõ. Trên hardware Sun, segmentation fault được tạo bởi exception trong memory management unit, hardware chịu trách nhiệm hỗ trợ virtual memory. Nguyên nhân thông thường là dereference, tức xem nội dung tại địa chỉ chứa trong pointer, một pointer có giá trị chưa khởi tạo hoặc bất hợp lệ. Pointer gây tham chiếu memory tới segment không thuộc address space của bạn, và hệ điều hành can thiệp. Một chương trình nhỏ gây segmentation fault là:

```
int *p=0;
*p = 17;     /* causes a segmentation fault */
```

Một điểm tinh tế là thường có một lỗi lập trình khác khiến pointer mang giá trị không hợp lệ. Khác bus error, segmentation fault vì vậy là triệu chứng gián tiếp chứ không phải nguyên nhân của lỗi.

Điểm tinh tế còn tệ hơn là nếu giá trị pointer chưa khởi tạo tình cờ misaligned đối với kích thước data truy cập, nó sẽ gây bus error thay vì segmentation violation. Điều này đúng trên phần lớn kiến trúc vì CPU thấy địa chỉ trước khi gửi nó tới MMU.

#### Thử thách lập trình

![image](images/ch07/img07-07.png)

Thử làm software của bạn crash

Hãy hoàn thiện các đoạn chương trình thử nghiệm ở trên.

Chạy thử để xem hệ điều hành báo những bug này như thế nào.

Điểm thưởng: viết signal handler bắt signal bus error và segmentation fault. Cho chúng in thông báo user-friendly hơn rồi thoát.

Chạy lại chương trình của bạn.

Việc dereference giá trị pointer bất hợp lệ có thể xảy ra tường minh trong code như trên, hoặc trong routine thư viện nếu bạn truyền giá trị sai. Không may, thay đổi chương trình, chẳng hạn compile để debug hoặc thêm statement debug, dễ làm nội dung memory thay đổi đến mức vấn đề chuyển chỗ hay biến mất. Segmentation fault rất khó giải quyết, chỉ người mạnh mới sống sót. Bạn biết đó là bug thật sự khó khi thấy đồng nghiệp nghiêm nghị mang logic analyz-ers và oscilloscope vào phòng thử nghiệm!

#### Giáo điều software

![image](images/ch07/img07-03.png)

Lỗi segmentation violation SunOS

Gần đây chúng tôi phải giải quyết segmentation fault xảy ra khi chạy tiện ích ncheck trên filesystem hỏng. Bug này đặc biệt khó chịu vì bạn rất có thể dùng ncheck chính để điều tra filesystem nghi bị hỏng.

Triệu chứng là ncheck thất bại trong printf do dereference null pointer và gây segmentation violation. Statement sai là:

```
(void) printf("%s", p->name);
```

Phần lớn lập trình viên mới ở Yoyodyne Software Corp. sẽ sửa theo cách long-winded như sau:

```
if (p->name != NULL)
        (void) printf("%s", p->name );
else
        (void) printf("(null)");
```

Tuy nhiên, trong những trường hợp như thế, có thể dùng conditional operator để đơn giản hóa code và giữ locality of reference:

```
(void) printf("%s", p->name ? p->name : "(null)");
```

Nhiều người không thích conditional operator — ? — : — vì thấy khó hiểu. Operator này dễ hiểu hơn nhiều khi so sánh với statement if:

```
if (expression) statement-when-non-zero else statement-
when-zero
    expression ?  expression-when-non-zero: expression-
when-zero
```

Nhìn theo cách ấy, conditional operator khá trực quan và cho phép ta hài lòng với one-liner thay vì tăng kích thước code không cần thiết. Nhưng đừng bao giờ lồng conditional operator này vào conditional operator khác vì sẽ nhanh chóng khó nhận ra thành phần nào đi với thành phần nào.

Các nguyên nhân trực tiếp thường gặp của segmentation fault:

- Dereference pointer không chứa giá trị hợp lệ.

- Dereference null pointer, thường do system routine trả null pointer rồi chương trình dùng mà không kiểm tra.

- Truy cập một thứ khi không có permission phù hợp; chẳng hạn cố lưu giá trị vào text segment read-only sẽ gây lỗi này.

- Hết stack hoặc heap space: virtual memory rất lớn nhưng không vô hạn.

Dù có phần đơn giản hóa quá mức, trên phần lớn kiến trúc và trong phần lớn trường hợp, bus error nghĩa là CPU không chấp nhận một điều gì đó ở tham chiếu memory, còn segv nghĩa là MMU không chấp nhận nó.

Theo thứ tự thường gặp, các lỗi lập trình cuối cùng dẫn tới segmentation fault gồm:

1\. Lỗi giá trị pointer: dùng pointer trước khi gán giá trị hoặc truyền pointer sai cho routine thư viện. Đừng để trường hợp sau đánh lừa bạn! Debugger cho thấy segv xảy ra trong system routine không có nghĩa hệ thống gây ra lỗi; vấn đề vẫn rất có thể nằm trong code của bạn. Cách phổ biến thứ ba tạo pointer sai là truy cập một thứ sau khi free. Bạn có thể sửa statement free để xóa pointer sau khi free thứ nó trỏ tới:

`2.`

```
free(p); p = NULL;
```

Cách này bảo đảm rằng nếu dùng pointer sau khi đã free, ít nhất chương trình cũng dump core ngay lập tức.

3\. Lỗi ghi đè: ghi vượt một trong hai đầu array, ghi vượt một trong hai đầu block do malloc cấp, hoặc ghi đè các structure quản lý heap; điều cuối rất dễ xảy ra nếu ghi trước đầu block do malloc cấp.

`4.`

```
p=malloc(256); p[-1]=0; p[256]=0;
```

5\. Lỗi free: free cùng block hai lần, free thứ không do malloc cấp, free memory vẫn được sử dụng hoặc free pointer không hợp lệ. Một lỗi free rất phổ biến là cdr <sup>\[3\]</sup> dọc linked list bằng vòng lặp `for (p=start; p; p=p->next)`, rồi gọi `free(p)` trong thân vòng lặp. Điều này khiến lần lặp kế tiếp dereference pointer đã free, cho kết quả không dự đoán được.

<sup>\[3\]</sup> Car và cdr là hai thuật ngữ LISP lần lượt chỉ phần đầu và phần còn lại của list. Cdr dọc list nghĩa là xử lý list bằng cách lần lượt lấy phần tử ở đầu. Car và cdr bắt nguồn từ IBM 704, processor vacuum-tube 36-bit có địa chỉ 15-bit. Các vị trí core memory được gọi là “register”. CAR là “contents of address part of register”, còn CDR là “contents of decrement part of register”. Đây là những routine ngắn; tài liệu LISP 1.5 (MIT Press, 1962) liệt kê toàn bộ chúng. Đây là CAR

```
CAR   SXA CARX,4
      PDX 0,4
      CLA 0,4
      PAX 0,4
      PXD 0,4
CARX  AXT **,4
      TRA 1,4
```

LISP 1.0 ban đầu còn có CTR và CXR, tương ứng với contents of tag part of register và contents of index part of register. Chúng không hữu ích lắm nên bị loại khỏi LISP 1.5.

#### Mẹo thực hành hữu ích

![image](images/ch07/img07-04.png)

Cách free phần tử trong linked list

Cách đúng để free phần tử khi duyệt linked list là dùng biến tạm lưu địa chỉ phần tử kế tiếp. Khi ấy bạn có thể an toàn free phần tử hiện tại bất cứ lúc nào mà không phải lo tham chiếu lại nó để lấy địa chỉ phần tử kế tiếp. Code như sau:

```
struct node *p, *start, *tmp;
for (p=start; p; p=tmp) {
        tmp=p->next;
        free(p);
}
```

#### Giáo điều software

![image](images/ch07/img07-03.png)

Chương trình của bạn có hết memory không?

Nếu chương trình cần nhiều memory hơn hệ điều hành có thể cấp, nó sẽ kết thúc với “segmentation fault”. Bạn có thể phân biệt loại này với các segmentation fault bug-based bằng phương pháp dưới đây.

Để biết chương trình có chạy hết stack hay không, hãy chạy dưới dbx:

```
% dbx a.out

(dbx) catch SIGSEGV
(dbx) run
...
signal SEGV (segmentation violation) in <some_routine>
at 0xeff57708
(dbx) where
```

Nếu lúc này thấy call chain, chương trình chưa hết stack space.

Ngược lại, nếu thấy dạng như sau:

```
fetch at 0xeffe7a60 failed -- I/O error
(dbx)
```

thì có lẽ chương trình đã hết stack space. Số hex đó là địa chỉ stack không thể map hoặc lấy về. Bạn cũng có thể thử điều chỉnh segment limit trong C-shell:

```
limit stacksize 10
```

Trong C-shell, bạn có thể điều chỉnh kích thước tối đa của stack và data segment. Dòng trên đặt nó thành 10 Kbyte. Hãy thử cấp ít stack space hơn để xem chương trình có thất bại sớm hơn không; sau đó cấp nhiều hơn để xem nó có chạy thành công không. Tổng thể, process vẫn bị giới hạn bởi kích thước swap space, có thể xem bằng lệnh `swap -s`.

Với giá trị pointer sai, chuyện gì cũng có thể xảy ra. Người ta thường nói nếu “may mắn”, pointer trỏ ra ngoài address space nên lần dùng đầu tiên khiến chương trình dump core rồi dừng. Nếu “không may”, nó trỏ vào bên trong address space và cor-rupt, tức ghi đè, vùng memory ấy. Điều này dẫn tới bug mơ hồ rất khó tìm. Những năm gần đây đã xuất hiện nhiều công cụ software xuất sắc giúp giải quyết loại vấn đề này.

## Giải trí nhẹ nhàng — Vua đồ vật và trò paging

Phần tiếp theo do Jeff Berryman viết năm 1972, khi làm ở project MAC và vận hành một trong những hệ thống virtual memory đầu tiên. Jeff bình luận hơi rue-fully rằng trong mọi bài ông từng viết, đây là bài phổ biến và được đọc rộng rãi nhất. Ngày nay nó vẫn phù hợp như hai mươi năm trước.

### Trò paging

Ghi chú này là tài liệu non-working chính thức của Project MAC Computer Systems Research Division. Hãy sao chép và phân phát nó ở bất cứ nơi nào thiếu tiếng cười; bạn có thể viện dẫn nó trong ấn phẩm khác nhưng phải tự chịu rủi ro.

### Luật

1\. Mỗi người chơi nhận được vài triệu đồ vật.

2\. Đồ vật được giữ trong thùng, mỗi thùng chứa 4096 món. Những món cùng thùng được gọi là crate-mates.

3\. Thùng được cất trong xưởng hoặc kho. Xưởng gần như luôn quá nhỏ để chứa tất cả thùng.

4\. Chỉ có một xưởng nhưng có thể có nhiều kho. Mọi người dùng chung chúng.

5\. Mỗi đồ vật có số hiệu riêng.

6\. Thao tác bạn làm với đồ vật gọi là zark. Mọi người lần lượt zark.

7\. Bạn chỉ được zark đồ của mình, không được zark đồ của người khác.

8\. Đồ vật chỉ có thể được zark khi nằm trong xưởng.

9\. Chỉ Vua đồ vật biết một món nằm trong xưởng hay trong kho.

10\. Một món càng lâu không được zark thì được coi là càng bẩn.

11\. Muốn có đồ vật, bạn phải xin Vua đồ vật. Ông chỉ phát số lượng là bội của tám để giảm overhead hoàng gia.

12\. Muốn zark một món, bạn đưa số hiệu của nó. Nếu món mang số đó tình cờ ở trong xưởng, nó được zark ngay. Nếu nó ở kho, Vua đồ vật đưa thùng chứa món ấy về xưởng. Nếu xưởng hết chỗ, trước tiên ông tìm thùng bẩn nhất trong xưởng, dù của bạn hay người khác, và gửi nó cùng toàn bộ crate-mates ra kho. Ông đặt thùng chứa món của bạn vào chỗ trống. Món ấy được zark, và bạn chẳng bao giờ biết nó không phải luôn ở trong xưởng.

13\. Đồ vật của mỗi người có những số hiệu giống đồ của mọi người khác. Vua đồ vật luôn biết món nào thuộc về ai và đang đến lượt ai, nên bạn không bao giờ vô tình zark đồ của người khác dù nó cùng số hiệu với đồ của bạn.

### Ghi chú

1\. Theo truyền thống, Vua đồ vật ngồi bên một chiếc bàn lớn chia thành nhiều segment và có các page hầu cận, so-called “table pages”, giúp ông nhớ mọi món nằm ở đâu và thuộc về ai.

2\. Một hệ quả của Luật 13 là số hiệu đồ vật của mọi người tương tự nhau giữa các ván chơi, bất kể số người chơi.

3\. Vua đồ vật có vài món riêng. Một số di chuyển qua lại giữa xưởng và kho giống đồ của người khác, nhưng một số quá nặng nên không thể đưa khỏi xưởng.

4\. Với bộ luật đã nêu, đồ oft-zarked có xu hướng chủ yếu nằm trong xưởng, còn đồ little-zarked chủ yếu ở kho. Đây là cách kiểm soát hàng tồn hiệu quả.

Vua đồ vật muôn năm!

Chẳng phải cách kể ấy thú vị hơn nhiều so với phiên bản chuyển dịch non-allegorical dưới đây sao?

### Luật

1\. Mỗi người chơi nhận được vài triệu “byte”.

2\. Byte được giữ trong “page”, mỗi page chứa 4096 byte. Những byte cùng page có “locality of reference”.

3\. Page được lưu trong memory hoặc trên đĩa. Memory gần như luôn quá nhỏ để chứa tất cả page.

4\. Chỉ có một memory nhưng có thể có nhiều đĩa. Mọi người dùng chung chúng.

5\. Mỗi byte có “virtual address” riêng.

6\. Thao tác bạn làm với byte gọi là “reference”. Mọi người lần lượt reference.

7\. Bạn chỉ được reference byte của mình, không được reference byte của người khác.

8\. Byte chỉ có thể được reference khi nằm trong memory.

9\. Chỉ “VM manager” biết một byte nằm trong memory hay trên đĩa.

10\. Một byte càng lâu không được reference thì được coi là càng “già”.

11\. Muốn có byte, bạn phải xin VM manager. Nó chỉ cấp số byte là bội của lũy thừa hai để giảm overhead.

12\. Muốn reference một byte, bạn đưa virtual address của nó. Nếu byte tại địa chỉ ấy tình cờ nằm trong memory, nó được reference ngay. Nếu ở đĩa, VM manager đưa page chứa byte ấy về memory. Nếu memory hết chỗ, trước tiên nó tìm page già nhất trong memory, dù của bạn hay người khác, rồi đưa page ấy cùng phần còn lại của page ra đĩa. Nó đặt page chứa byte của bạn vào chỗ trống. Byte ấy được reference, và bạn chẳng bao giờ biết nó không phải luôn ở trong memory.

13\. Byte của mỗi người có những virtual address giống byte của mọi người khác. VM manager luôn biết byte nào thuộc về ai và đang đến lượt ai, nên bạn không bao giờ vô tình reference byte của người khác dù nó cùng virtual address với byte của bạn.

### Ghi chú

1\. Theo truyền thống, VM manager dùng một bảng lớn chia segment cùng các “page table” để nhớ tất cả byte nằm ở đâu và thuộc về ai.

2\. Một hệ quả của Luật 13 là virtual address của mọi người tương tự nhau giữa các lần chạy, bất kể số process.

3\. VM manager có vài byte riêng. Một số di chuyển qua lại giữa memory và đĩa như byte của người khác, nhưng một số được sử dụng quá nhiều nên không thể đưa khỏi memory.

4\. Với bộ luật đã nêu, byte oft-referenced có xu hướng chủ yếu nằm trong memory, còn byte little-used chủ yếu ở đĩa. Đây là cách sử dụng memory hiệu quả.

VM Manager muôn năm!

#### Lời giải lập trình

![image](images/ch07/img07-10.png)

Signal handler bắt signal segv

```
#include <signal.h>
#include <stdio.h>

void handler(int s)
{
    if (s == SIGBUS) printf(" now got a bus error
signal\n");
    if (s == SIGSEGV) printf(" now got a segmentation
violation signal\n");
    if (s == SIGILL) printf(" now got an illegal
instruction signal\n");
    exit(1);
}

main () {
    int *p=NULL;
    signal(SIGBUS, handler);
    signal(SIGSEGV, handler);
    signal(SIGILL, handler);
    *p=0;
}
```

Chạy chương trình cho kết quả sau:

```
% a.out

now got a segmentation violation signal
```

Lưu ý: đây là ví dụ phục vụ giảng dạy. Mục 7.7.1.1 của chuẩn ANSI chỉ rõ rằng trong hoàn cảnh ở đây, hành vi là undefined nếu signal handler gọi bất kỳ hàm thư viện tiêu chuẩn nào, chẳng hạn printf.

#### Lời giải lập trình

![image](images/ch07/img07-10.png)

Dùng setjmp/longjmp để phục hồi sau signal

Chương trình này sử dụng `setjmp/longjmp` và xử lý signal để khi nhận control-C, được chuyển tới UNIX process dưới dạng signal `SIGINT`, chương trình khởi động lại thay vì thoát.

```
#include <setjmp.h>
#include <signal.h>
#include <stdio.h>
jmp_buf buf;
void handler(int s)
{
    if (s == SIGINT) printf(" now got a SIGINT
signal\n");
    longjmp(buf, 1);
    /*NOTREACHED*/
}
main () {
    signal(SIGINT, handler);
    if (setjmp(buf)) {
        printf("back in main\n");
        return 0;
    }else
        printf("first time through\n");
loop:
    /* spin here, waiting for ctrl-c */
    goto loop;
}
```

Lưu ý: signal handler không được gọi hàm thư viện, ngoại trừ những hoàn cảnh hạn chế được chuẩn quy định. Nếu signal phát sinh trong printf “lần đầu”, printf của signal handler chen vào giữa có thể bị rối. Ở đây chúng tôi gian lận vì I/O tương tác là cách dễ thấy điều đang xảy ra nhất. Đừng gian lận trong code thực tế, nhé?

Chạy chương trình cho kết quả sau:

```
% a.out

first time through
^C now got a SIGINT signal
back in main
```

Chương trình này sử dụng `setjmp/longjmp` và xử lý signal để khi nhận control-C, được chuyển tới UNIX process dưới dạng signal `SIGINT`, chương trình khởi động lại thay vì thoát.
