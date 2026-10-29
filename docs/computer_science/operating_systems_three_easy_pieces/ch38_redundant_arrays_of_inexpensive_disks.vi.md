# 38 Redundant Arrays of Inexpensive Disks (RAID)

Khi dùng disk, đôi lúc ta muốn nó nhanh hơn; I/O operation chậm nên có thể là bottleneck toàn hệ thống. Khi dùng disk, đôi lúc ta muốn nó lớn hơn; ngày càng nhiều dữ liệu được đưa online nên disk ngày càng đầy. Khi dùng disk, đôi lúc ta muốn nó đáng tin cậy hơn; khi disk hỏng, nếu dữ liệu không được backup, toàn bộ dữ liệu quý giá đó biến mất.

> MẤU CHỐT: LÀM SAO TẠO DISK LỚN, NHANH VÀ ĐÁNG TIN CẬY
>
> Làm sao tạo storage system lớn, nhanh và đáng tin cậy? Các kỹ thuật then chốt là gì? Có những trade-offs nào giữa các cách tiếp cận?

Chương này giới thiệu Redundant Array of Inexpensive Disks, thường gọi RAID [P+88], kỹ thuật phối hợp nhiều disk để xây disk system nhanh hơn, lớn hơn và đáng tin cậy hơn. Thuật ngữ được nhóm nghiên cứu U.C. Berkeley giới thiệu cuối những năm 1980 (do giáo sư David Patterson và Randy Katz cùng sinh viên khi đó Garth Gibson dẫn dắt); khoảng thời gian đó nhiều nhà nghiên cứu khác nhau đồng thời đi tới ý tưởng cơ bản dùng nhiều disk xây storage system tốt hơn [BG88, K86,K88,PB86,SG86].

Bên ngoài, RAID giống disk: tập block có thể đọc hoặc ghi. Bên trong, RAID là thực thể phức tạp gồm nhiều disk, memory (cả volatile lẫn non-) và một hoặc nhiều processor quản lý hệ thống. Hardware RAID rất giống hệ thống máy tính, chuyên biệt cho task quản lý nhóm disk.

RAID có nhiều ưu điểm so với disk đơn. Một ưu điểm là hiệu năng. Dùng nhiều disk song song có thể tăng tốc I/O đáng kể. Lợi ích khác là dung lượng. Tập dữ liệu lớn cần disk lớn. Cuối cùng, RAID cải thiện reliability; trải dữ liệu trên nhiều disk (không có kỹ thuật RAID) khiến dữ liệu dễ tổn thương khi mất một disk; với dạng redundancy nào đó, RAID chịu được mất disk và tiếp tục hoạt động như không có vấn đề.

> MẸO: TRANSPARENCY GIÚP TRIỂN KHAI
>
> Khi cân nhắc thêm chức năng mới vào hệ thống, luôn nên xét liệu có thể thêm nó một cách transparent mà không đòi hỏi thay đổi phần còn lại hay không. Đòi viết lại toàn bộ phần mềm hiện có (hay thay đổi hardware triệt để) làm giảm cơ hội tạo tác động của ý tưởng. RAID là ví dụ hoàn hảo, và chắc chắn transparency góp vào thành công; quản trị viên có thể lắp SCSI-based RAID storage array thay SCSI disk, còn phần còn lại (host computer, OS, v.v.) không phải thay đổi chút nào để bắt đầu dùng nó. Nhờ giải quyết vấn đề triển khai này, RAID thành công hơn ngay từ đầu.

Điều tuyệt vời là RAID cung cấp các ưu điểm này một cách transparent cho hệ thống dùng nó, tức với host system, RAID chỉ giống disk lớn. Cái hay của transparency dĩ nhiên là cho phép thay disk bằng RAID mà không đổi một dòng software nào; operating system và client application tiếp tục hoạt động không sửa đổi. Nhờ vậy transparency cải thiện mạnh khả năng triển khai RAID, cho phép người dùng và quản trị viên dùng RAID mà không lo tương thích phần mềm.

Giờ ta bàn vài khía cạnh quan trọng của RAID. Bắt đầu với interface, fault model, rồi bàn cách đánh giá RAID design theo ba trục quan trọng: capacity, reliability và performance. Sau đó bàn những vấn đề khác quan trọng trong thiết kế và triển khai RAID.

## 38.1 Interface và bên trong RAID

Với file system bên trên, RAID giống disk lớn, (hy vọng) nhanh và (hy vọng) đáng tin cậy. Giống disk đơn, nó thể hiện như linear array block, mỗi block có thể được file system (hoặc client khác) đọc hoặc ghi.

Khi file system phát logical I/O request tới RAID, bên trong RAID phải tính disk nào cần truy cập để hoàn tất request, rồi phát một hoặc nhiều physical I/O để làm vậy. Bản chất chính xác các physical I/O phụ thuộc RAID level, sẽ bàn chi tiết bên dưới. Nhưng ví dụ đơn giản, xét RAID giữ hai bản sao mỗi block (mỗi bản trên disk riêng); khi ghi tới mirrored RAID system như vậy, RAID phải thực hiện hai physical I/O cho mỗi logical I/O được phát tới nó.

RAID system thường được xây như hộp hardware riêng, kết nối chuẩn (ví dụ SCSI hay SATA) tới host. Tuy nhiên bên trong RAID khá phức tạp, gồm microcontroller chạy firmware điều khiển hoạt động RAID, volatile memory như DRAM để buffer data block khi đọc ghi, và đôi khi non-volatile memory để buffer write an toàn, có thể cả logic chuyên biệt tính parity (hữu ích ở một số RAID level, như sẽ thấy). Nhìn tổng quát, RAID rất giống hệ thống máy tính chuyên biệt: có processor, memory và disk; nhưng thay vì chạy ứng dụng, nó chạy software chuyên biệt được thiết kế vận hành RAID.

## 38.2 Fault Model

Để hiểu RAID và so sánh các cách tiếp cận, cần có fault model. RAID được thiết kế phát hiện và phục hồi từ một số loại disk fault; vì thế biết chính xác phải dự kiến fault nào là then chốt để có thiết kế hoạt động được.

Fault model đầu tiên ta giả định khá đơn giản, gọi là fail-stop fault model [S84]. Trong mô hình, disk chỉ ở đúng một trong hai trạng thái: đang hoạt động hoặc đã hỏng. Với disk hoạt động, mọi block đọc ghi được. Ngược lại khi disk hỏng, ta giả định mất vĩnh viễn.

Khía cạnh then chốt của fail-stop model là giả định về phát hiện fault. Cụ thể, khi disk hỏng, ta giả định dễ phát hiện. Ví dụ trong RAID array, ta giả định RAID controller hardware (hoặc software) quan sát ngay được disk hỏng.

Vì thế hiện chưa cần lo failure “im lặng” phức tạp hơn như disk corruption. Cũng chưa cần lo một block không truy cập được trên disk còn hoạt động (đôi khi gọi latent sector error). Ta xem những disk fault phức tạp hơn (và đáng tiếc thực tế hơn) này sau.

## 38.3 Cách đánh giá RAID

Như sắp thấy, có nhiều cách xây RAID. Mỗi cách có đặc tính khác nhau đáng đánh giá để hiểu điểm mạnh yếu.

Cụ thể, đánh giá mỗi RAID design theo ba trục. Trục đầu là capacity; với N disk mỗi disk có B block, client RAID dùng được bao nhiêu dung lượng hữu ích? Không redundancy, đáp án là N · B; ngược lại nếu hệ thống giữ hai bản sao mỗi block (gọi mirroring), capacity hữu ích là (N · B)/2. Những phương án khác (ví dụ parity-based) thường nằm giữa.

Trục đánh giá thứ hai là reliability. Thiết kế chịu được bao nhiêu disk fault? Phù hợp fault model, ta chỉ giả định cả disk có thể hỏng; ở chương sau (về data integrity), sẽ xét xử lý failure mode phức tạp hơn.

Cuối cùng, trục thứ ba là performance. Đánh giá performance hơi khó vì phụ thuộc mạnh workload đưa tới disk array. Do đó trước đánh giá performance, sẽ trình bày tập workload điển hình nên xem xét.

Giờ xét ba RAID design quan trọng: RAID Level 0 (striping), RAID Level 1 (mirroring), và RAID Levels 4/5 (parity-based redundancy). Gọi mỗi design là một “level” bắt nguồn từ công trình tiên phong của Patterson, Gibson và Katz tại Berkeley [P+88].

## 38.4 RAID Level 0: Striping

RAID level đầu thực ra không phải RAID level, vì không có redundancy. Tuy nhiên RAID level 0, thường biết hơn với tên striping, là upper-bound tuyệt vời cho performance và capacity nên đáng tìm hiểu.

Dạng striping đơn giản nhất trải block trên các disk hệ thống như sau (giả sử array 4-disk):

| Disk 0 | Disk 1 | Disk 2 | Disk 3 |
|---|---|---|---|
| 0 | 1 | 2 | 3 |
| 4 | 5 | 6 | 7 |
| 8 | 9 | 10 | 11 |
| 12 | 13 | 14 | 15 |

Hình 38.1: RAID-0: Striping đơn giản

Từ Hình 38.1, bạn hiểu ý tưởng cơ bản: trải block array trên disk theo kiểu round-robin. Cách này được thiết kế lấy nhiều parallelism nhất từ array khi request nhắm các chunk liên tục (ví dụ sequential read lớn). Các block cùng hàng gọi stripe; vì thế block 0, 1, 2 và 3 cùng stripe trên.

Trong ví dụ, ta giả định đơn giản hóa rằng chỉ 1 block (mỗi block chẳng hạn 4KB) được đặt trên mỗi disk trước khi chuyển sang disk tiếp. Nhưng không nhất thiết phải bố trí vậy. Ví dụ có thể bố trí block trên disk như Hình 38.2:

| Disk 0 | Disk 1 | Disk 2 | Disk 3 |  |
|---|---|---|---|---|
| 0 | 2 | 4 | 6 | chunk size: |
| 1 | 3 | 5 | 7 | 2 block |
| 8 | 10 | 12 | 14 |  |
| 9 | 11 | 13 | 15 |  |

Hình 38.2: Striping với Chunk Size lớn hơn

Ở ví dụ này, ta đặt hai block 4KB trên mỗi disk trước khi sang disk tiếp. Do đó chunk size RAID array là 8KB, và stripe gồm 4 chunk hay 32KB dữ liệu.

> BỔ SUNG: RAID MAPPING PROBLEM
>
> Trước khi nghiên cứu capacity, reliability và performance của RAID, ta bổ sung về điều gọi mapping problem. Vấn đề này xuất hiện ở mọi RAID array; đơn giản là với logical block cần đọc ghi, làm sao RAID biết chính xác physical disk và offset nào cần truy cập?
>
> Với RAID level đơn giản này, không cần quá phức tạp để map đúng logical block sang vị trí vật lý. Lấy ví dụ striping đầu tiên (chunk size = 1 block = 4KB). Khi có logical block address A, RAID dễ tính disk và offset mong muốn với hai phương trình đơn giản:
>
> ```
> Disk   = A % number_of_disks
> Offset = A / number_of_disks
> ```
>
> Lưu ý đây đều là phép toán số nguyên (ví dụ 4 / 3 = 1 chứ không phải 1.33333...).
>
> Xem chúng hoạt động với ví dụ đơn giản. Tưởng tượng RAID đầu có request block 14. Vì có 4 disk, disk cần tìm là (14 % 4 = 2): disk 2. Block cụ thể tính là (14 / 4 = 3): block 3. Vì vậy block 14 nằm ở block thứ tư (block 3, bắt đầu từ 0) trên disk thứ ba (disk 2, bắt đầu từ 0), đúng vị trí của nó.
>
> Bạn có thể nghĩ cách sửa phương trình để hỗ trợ chunk size khác. Hãy thử! Không quá khó.

### Chunk Sizes

Chunk size chủ yếu ảnh hưởng performance array. Ví dụ chunk size nhỏ khiến nhiều file được stripe trên nhiều disk, tăng parallelism đọc ghi một file; nhưng positioning time để truy cập block trên nhiều disk tăng, vì positioning time toàn request do giá trị lớn nhất trong các positioning time request trên mọi drive quyết định.

Ngược lại chunk size lớn giảm intra-file parallelism này nên dựa vào nhiều concurrent request để đạt throughput cao. Nhưng chunk size lớn giảm positioning time; nếu một file vừa trong chunk và nằm trên một disk, positioning time khi truy cập chỉ là positioning time của disk đó.

Vì thế xác định chunk size “tốt nhất” khó, cần biết rất nhiều về workload đưa tới disk system [CL95]. Trong phần còn lại, ta giả sử array dùng chunk size một block (4KB). Hầu hết array dùng chunk lớn hơn (ví dụ 64 KB), nhưng với vấn đề bên dưới, chunk size chính xác không quan trọng; do đó dùng một block cho đơn giản.

### Trở lại phân tích RAID-0

Giờ đánh giá capacity, reliability và performance của striping. Về capacity, nó hoàn hảo: N disk mỗi disk B block cung cấp N ·B block hữu ích. Về reliability, striping cũng hoàn hảo, nhưng theo nghĩa xấu: bất kỳ disk failure nào dẫn tới mất dữ liệu. Cuối cùng performance xuất sắc: mọi disk được dùng, thường song song, để phục vụ user I/O request.

### Đánh giá RAID Performance

Khi phân tích RAID performance, có thể xét hai performance metric. Thứ nhất là single-request latency. Hiểu latency của một I/O request tới RAID hữu ích vì cho thấy có thể có bao nhiêu parallelism trong một logical I/O operation. Thứ hai là steady-state throughput của RAID, tức tổng bandwidth nhiều concurrent request. Vì RAID thường dùng trong môi trường high-performance, steady-state bandwidth rất quan trọng nên là trọng tâm phân tích.

Để hiểu throughput chi tiết hơn, cần đưa ra workload quan tâm. Trong thảo luận này giả định hai loại: sequential và random. Với sequential workload, giả định request tới array là các chunk lớn liên tục; ví dụ request (hoặc chuỗi request) truy cập 1 MB dữ liệu, từ block x tới block (x+1 MB), được xem sequential. Sequential workload phổ biến trong nhiều môi trường (nghĩ tới tìm keyword trong file lớn) nên được xem quan trọng.

Với random workload, giả định mỗi request khá nhỏ, tới vị trí ngẫu nhiên khác nhau trên disk. Ví dụ luồng request ngẫu nhiên có thể đầu tiên truy cập 4KB ở logical address 10, rồi 550,000, rồi 20,100, v.v. Vài workload quan trọng như transactional workload trên database management system (DBMS) có access pattern này, nên đây là workload quan trọng.

Dĩ nhiên workload thực không đơn giản vậy, thường kết hợp thành phần sequential và random-seeming cùng hành vi in-between hai loại. Cho đơn giản, ta chỉ xét hai khả năng này.

Như bạn thấy, sequential và random workload cho đặc tính performance disk rất khác. Với sequential access, disk hoạt động hiệu quả nhất, dành ít thời gian seek và đợi rotation, phần lớn thời gian transfer. Random access thì ngược lại: phần lớn thời gian seek và đợi rotation, tương đối ít transfer. Để thể hiện khác biệt, giả định disk truyền dữ liệu ở S MB/s với sequential workload và R MB/s với random workload. Nói chung S lớn hơn R rất nhiều (tức S ≫ R).

Để chắc chắn hiểu khác biệt, hãy làm bài tập đơn giản. Cụ thể tính S và R với đặc tính disk sau. Giả định sequential transfer trung bình 10 MB và random transfer trung bình 10 KB. Cũng giả định những đặc tính disk sau:

Average seek time 7 ms

Average rotational delay 3 ms

Transfer rate của disk 50 MB/s

Để tính S, trước tiên xác định thời gian phân bổ trong transfer 10 MB điển hình. Đầu tiên mất 7 ms seek, rồi 3 ms rotation. Cuối cùng bắt đầu transfer; 10 MB @ 50 MB/s cho 1/5 giây, hay 200 ms transfer. Vì vậy mỗi request 10 MB mất 210 ms hoàn tất. Để tính S chỉ cần chia:

S = (Amount of Data)/(Time to access) = (10 MB)/(210 ms) = 47.62 MB/s

Như thấy được, vì thời gian transfer lớn, S rất gần peak bandwidth của disk (chi phí seek và rotation đã được amortized).

Có thể tính R tương tự. Seek và rotation giống nhau; sau đó tính transfer time, bằng 10 KB @ 50 MB/s, hay 0.195 ms.

R = (Amount of Data)/(Time to access) = (10 KB)/(10.195 ms) = 0.981 MB/s

Như thấy được, R nhỏ hơn 1 MB/s, S/R gần 50.

### Lại trở về phân tích RAID-0

Giờ đánh giá performance striping. Như nói trên, nhìn chung nó tốt. Ví dụ về latency, single-block request có latency gần như disk đơn; xét cho cùng RAID-0 chỉ chuyển request tới một disk của nó.

Về steady-state throughput, kỳ vọng đạt toàn bandwidth hệ thống. Vì vậy throughput bằng N (số disk) nhân S (sequential bandwidth disk đơn). Với nhiều random I/O, ta lại dùng mọi disk nên đạt N · R MB/s. Như sẽ thấy, đây vừa là các giá trị đơn giản nhất để tính vừa là upper bound so với RAID level khác.

## 38.5 RAID Level 1: Mirroring

RAID level đầu tiên ngoài striping là RAID level 1, hay mirroring. Với mirrored system, chỉ cần tạo nhiều hơn một bản sao mỗi block; dĩ nhiên mỗi bản trên disk riêng. Nhờ vậy chịu được disk failure.

Trong mirrored system điển hình, giả định với mỗi logical block, RAID giữ hai physical copy. Đây là ví dụ:

| Disk 0 | Disk 1 | Disk 2 | Disk 3 |
|---|---|---|---|
| 0 | 0 | 1 | 1 |
| 2 | 2 | 3 | 3 |
| 4 | 4 | 5 | 5 |
| 6 | 6 | 7 | 7 |

Hình 38.3: RAID-1 đơn giản: Mirroring

Trong ví dụ, disk 0 và disk 1 có nội dung giống nhau, disk 2 và disk 3 cũng vậy; dữ liệu được stripe trên các mirror pair này. Thực ra bạn có thể nhận thấy có nhiều cách đặt block copy trên disk. Bố trí trên phổ biến, đôi khi gọi RAID-10 hay (RAID 1+0), vì dùng mirrored pair (RAID-1) rồi stripe (RAID-0) trên chúng; bố trí phổ biến khác là RAID-01 (hay RAID 0+1), gồm hai striping array lớn (RAID-0), rồi mirror (RAID-1) trên chúng. Hiện ta chỉ bàn mirroring với bố trí trên.

Khi đọc block từ mirrored array, RAID có lựa chọn: đọc bản sao nào cũng được. Ví dụ nếu phát read logical block 5, RAID tự do đọc từ disk 2 hoặc disk 3. Nhưng khi ghi block không có lựa chọn: RAID phải cập nhật cả hai bản để duy trì reliability. Lưu ý các lần ghi có thể song song; ví dụ ghi logical block 5 có thể tiến hành đồng thời tới disk 2 và 3.

### Phân tích RAID-1

Hãy đánh giá RAID-1. Về capacity, RAID-1 tốn kém; với mirroring level = 2, chỉ có nửa capacity hữu ích tối đa. Với N disk có B block, capacity hữu ích RAID-1 là (N · B)/2.

Về reliability, RAID-1 làm tốt. Nó chịu được bất kỳ một disk hỏng. Có chút may mắn, RAID-1 còn có thể tốt hơn. Tưởng tượng trong hình trên disk 0 và disk 2 cùng hỏng. Không mất dữ liệu! Tổng quát hơn, mirrored system (mirroring level 2) chắc chắn chịu được 1 disk failure, và tới N/2 failure tùy disk nào hỏng. Thực tế ta thường không muốn phó mặc chuyện này cho may rủi; vì vậy đa số xem mirroring tốt để xử lý một failure.

Cuối cùng phân tích performance. Về latency một read request, thấy giống latency disk đơn; RAID-1 chỉ chuyển read tới một bản sao. Write hơi khác: cần hai physical write hoàn tất trước khi xong. Hai write song song nên thời gian gần bằng single write; nhưng vì logical write phải chờ cả hai physical write xong, nó chịu seek và rotational delay worst-case của hai request, nên (trung bình) cao hơn chút so với ghi disk đơn.

> BỔ SUNG: RAID CONSISTENT-UPDATE PROBLEM
>
> Trước khi phân tích RAID-1, hãy bàn vấn đề xảy ra trong mọi multi-disk RAID system, gọi consistent-update problem [DAA05]. Nó xảy ra khi ghi tới RAID phải cập nhật nhiều disk trong một logical operation. Ở đây giả sử xét mirrored disk array.
>
> Tưởng tượng write được phát tới RAID, RAID quyết định phải ghi tới disk 0 và disk 1. RAID phát write tới disk 0, nhưng ngay trước khi phát request tới disk 1 thì mất điện (hoặc system crash). Trong trường hợp không may này, giả sử request disk 0 hoàn tất (nhưng rõ ràng request disk 1 chưa, vì chưa được phát).
>
> Kết quả mất điện sai thời điểm là hai bản block không nhất quán: bản trên disk 0 là mới, trên disk 1 là cũ. Ta muốn state cả hai disk đổi atomically, tức hoặc cả hai là bản mới hoặc không bản nào.
>
> Cách giải tổng quát là dùng một loại write-ahead log để ghi trước việc RAID sắp làm (tức cập nhật hai disk với dữ liệu nào đó), rồi mới làm. Nhờ vậy có thể bảo đảm khi crash thì hành vi đúng vẫn xảy ra; chạy recovery procedure phát lại mọi transaction chờ tới RAID bảo đảm không có hai mirrored copy (trường hợp RAID-1) lệch nhau.
>
> Lưu ý cuối: vì logging xuống disk mỗi write tốn kém quá mức, đa số RAID hardware có chút non-volatile RAM (ví dụ battery-backed) để logging kiểu này. Vì vậy consistent update được cung cấp mà không chịu chi phí logging xuống disk cao.

Để phân tích steady-state throughput, bắt đầu sequential workload. Khi ghi disk sequential, mỗi logical write phải tạo hai physical write; ví dụ ghi logical block 0 (hình trên), RAID bên trong ghi cả disk 0 lẫn disk 1. Vì vậy maximum bandwidth khi sequential write tới mirrored array là ((N/2) · S), hay nửa peak bandwidth.

Đáng tiếc, sequential read có đúng cùng performance. Có thể nghĩ sequential read tốt hơn vì chỉ cần đọc một bản dữ liệu. Nhưng hãy dùng ví dụ để thấy vì sao không giúp nhiều. Tưởng tượng cần đọc block 0, 1, 2, 3, 4, 5, 6 và 7. Giả sử phát read 0 tới disk 0, read 1 tới disk 2, read 2 tới disk 1, read 3 tới disk 3. Tiếp tục phát read 4, 5, 6, 7 lần lượt tới disk 0, 2, 1, 3. Có thể ngây thơ nghĩ dùng mọi disk nghĩa là đạt toàn bandwidth array.

Nhưng để thấy không (nhất thiết) vậy, xét request một disk nhận (chẳng hạn disk 0). Đầu tiên request block 0; sau đó block 4 (bỏ block 2). Thực ra mỗi disk nhận request cách một block. Khi quay qua block bị bỏ, nó không cung cấp bandwidth hữu ích cho client. Vì vậy mỗi disk chỉ cho nửa peak bandwidth. Do đó sequential read chỉ đạt ((N/2) · S) MB/s.

Random read là trường hợp tốt nhất của mirrored RAID. Có thể phân phối read trên mọi disk, đạt toàn bandwidth có thể. Vì vậy random read RAID-1 đạt N · R MB/s.

Cuối cùng random write như bạn dự kiến: (N/2) · R MB/s. Mỗi logical write phải thành hai physical write, nên dù dùng mọi disk, client chỉ thấy nửa bandwidth sẵn có. Dù ghi logical block x thành hai parallel write tới hai physical disk khác, bandwidth nhiều small request chỉ đạt nửa kết quả striping. Như sắp thấy, nửa bandwidth sẵn có thực ra khá tốt!

## 38.6 RAID Level 4: Tiết kiệm không gian bằng Parity

Giờ giới thiệu phương pháp khác thêm redundancy vào disk array gọi parity. Cách Parity-based cố dùng ít capacity hơn, vượt qua tổn thất không gian lớn của mirrored system. Nhưng phải trả giá: performance.

| Disk 0 | Disk 1 | Disk 2 | Disk 3 | Disk 4 |
|---|---|---|---|---|
| 0 | 1 | 2 | 3 | P0 |
| 4 | 5 | 6 | 7 | P1 |
| 8 | 9 | 10 | 11 | P2 |
| 12 | 13 | 14 | 15 | P3 |

Hình 38.4: RAID-4 với Parity

Đây là ví dụ RAID-4 five-disk (Hình 38.4). Với mỗi data stripe, thêm một parity block lưu thông tin redundant của stripe. Ví dụ parity block P1 có thông tin redundant tính từ block 4, 5, 6 và 7.

Để tính parity, cần mathematical function cho phép chịu mất bất kỳ một block trong stripe. Hóa ra XOR đơn giản làm việc này rất tốt. Với tập bit, XOR tất cả trả 0 nếu số bit 1 chẵn, trả 1 nếu số bit 1 lẻ. Ví dụ:

| C0 | C1 | C2 | C3 | P |
|---|---|---|---|---|
| 0 | 0 | 1 | 1 | XOR(0,0,1,1) = 0 |
| 0 | 1 | 0 | 0 | XOR(0,1,0,0) = 1 |

Ở hàng đầu (0,0,1,1), có hai số 1 (C2, C3), nên XOR mọi giá trị bằng 0 (P); tương tự hàng thứ hai chỉ có một số 1 (C1), nên XOR phải bằng 1 (P). Có thể nhớ đơn giản: số 1 trong bất kỳ hàng nào phải chẵn (không lẻ); đó là invariant RAID phải duy trì để parity đúng.

Từ ví dụ, có thể đoán cách dùng parity information phục hồi failure. Tưởng tượng mất cột C2. Để xác định giá trị trong cột, chỉ cần đọc mọi giá trị khác cùng hàng (kể cả parity bit đã XOR) và tái tạo đáp án đúng. Cụ thể giả sử mất giá trị hàng đầu cột C2 (là 1); đọc các giá trị khác (0 từ C0, 0 từ C1, 1 từ C3 và 0 từ cột parity P) thu được 0, 0, 1, 0. Vì biết XOR giữ số 1 chẵn ở mỗi hàng, biết dữ liệu thiếu phải là 1. Đó là reconstruction trong XOR-based parity scheme! Cũng lưu ý cách tính giá trị khôi phục: chỉ XOR data bit với parity bit, như lúc tính parity ban đầu.

Giờ bạn có thể thắc mắc: đang XOR mọi bit, nhưng biết RAID đặt block 4KB (hoặc hơn) trên mỗi disk; áp dụng XOR cho các block để tính parity thế nào? Hóa ra cũng dễ. Chỉ thực hiện bitwise XOR trên mỗi bit các data block; đặt kết quả mỗi bitwise XOR vào vị trí bit tương ứng trong parity block. Ví dụ nếu block có kích thước 4 bit (đúng, vẫn nhỏ hơn block 4KB nhiều, nhưng bạn hiểu ý), chúng có thể như sau:

| Block0 | Block1 | Block2 | Block3 | Parity |
|---|---|---|---|---|
| 00 | 10 | 11 | 10 | 11 |
| 10 | 01 | 00 | 01 | 10 |

Như hình cho thấy, parity được tính cho mỗi bit của mỗi block và kết quả đặt trong parity block.

### Phân tích RAID-4

Giờ phân tích RAID-4. Về capacity, RAID-4 dùng 1 disk lưu parity information cho mỗi nhóm disk nó bảo vệ. Do đó capacity hữu ích của RAID group là (N − 1) · B.

Reliability cũng dễ hiểu: RAID-4 chịu được 1 disk failure, không hơn. Nếu mất nhiều hơn một disk, đơn giản không có cách khôi phục dữ liệu mất.

Cuối cùng là performance. Lần này bắt đầu bằng steady-state throughput. Sequential read có thể dùng mọi disk trừ parity disk, đạt peak effective bandwidth (N − 1) · S MB/s (trường hợp dễ).

| Disk 0 | Disk 1 | Disk 2 | Disk 3 | Disk 4 |
|---|---|---|---|---|
| 0 | 1 | 2 | 3 | P0 |
| 4 | 5 | 6 | 7 | P1 |
| 8 | 9 | 10 | 11 | P2 |
| 12 | 13 | 14 | 15 | P3 |

Hình 38.5: Full-stripe Write trong RAID-4

Để hiểu performance sequential write, trước tiên phải hiểu cách thực hiện. Khi ghi chunk dữ liệu lớn xuống disk, RAID-4 có thể làm tối ưu đơn giản gọi full-stripe write. Ví dụ tưởng tượng block 0, 1, 2 và 3 được gửi tới RAID trong một write request (Hình 38.5).

Ở đây RAID chỉ cần tính giá trị mới P0 (XOR các block 0, 1, 2, 3), rồi ghi mọi block (kể cả parity block) song song xuống năm disk trên (tô xám trong hình). Vì thế full-stripe write là cách RAID-4 ghi disk hiệu quả nhất.

Khi hiểu full-stripe write, tính performance sequential write RAID-4 dễ; effective bandwidth cũng (N − 1) · S MB/s. Dù parity disk liên tục được dùng trong thao tác, client không được lợi performance từ nó.

Giờ phân tích performance random read. Như hình trên, tập random read 1-block trải trên data disk nhưng không parity disk. Vì vậy effective performance là: (N − 1) · R MB/s.

Random write, để cuối cùng, là trường hợp thú vị nhất cho RAID-4. Tưởng tượng muốn ghi đè block 1 trong ví dụ. Có thể cứ ghi đè, nhưng sẽ có vấn đề: parity block P0 không còn phản ánh đúng parity của stripe; ở đây P0 cũng phải cập nhật. Làm sao cập nhật vừa đúng vừa hiệu quả?

Hóa ra có hai phương pháp. Thứ nhất, additive parity, đòi làm như sau. Để tính parity block mới, đọc song song mọi data block khác trong stripe (ở ví dụ block 0, 2, 3), XOR chúng với block mới (1). Kết quả là parity block mới. Để hoàn tất write, ghi data mới và parity mới xuống disk tương ứng, cũng song song.

Vấn đề là kỹ thuật này tăng theo số disk, nên RAID lớn cần nhiều read để tính parity. Vì vậy có subtractive parity method.

Ví dụ, tưởng tượng chuỗi bit này (4 data bit, một parity):

| C0 | C1 | C2 | C3 | P |
|---|---|---|---|---|
| 0 | 0 | 1 | 1 | XOR(0,0,1,1) = 0 |

Tưởng tượng muốn ghi đè bit C2 bằng giá trị mới gọi C2<sub>new</sub>. Subtractive method có ba bước. Đầu tiên đọc dữ liệu cũ tại C2 (C2<sub>old</sub> = 1) và parity cũ (P<sub>old</sub> = 0). Rồi so dữ liệu cũ và mới; nếu giống nhau (ví dụ C2<sub>new</sub> = C2<sub>old</sub>), biết parity bit cũng không đổi (tức P<sub>new</sub> = P<sub>old</sub>). Nhưng nếu khác, phải đảo parity bit cũ sang trạng thái ngược lại, tức nếu (P<sub>old</sub> == 1), đặt P<sub>new</sub> thành 0; nếu (P<sub>old</sub> == 0), đặt P<sub>new</sub> thành 1. Có thể biểu diễn gọn toàn bộ bằng XOR (⊕ là XOR operator):

P<sub>new</sub> = (C<sub>old</sub> ⊕ C<sub>new</sub>) ⊕ P<sub>old</sub> (38.1)

Vì xử lý block chứ không bit, ta tính trên mọi bit trong block (ví dụ 4096 byte mỗi block nhân 8 bit mỗi byte). Vì vậy đa số trường hợp block mới khác block cũ, nên parity block mới cũng khác.

Giờ bạn phải xác định được khi nào dùng additive parity calculation và khi nào dùng subtractive method. Nghĩ xem hệ thống cần bao nhiêu disk để additive method thực hiện ít I/O hơn subtractive method; cross-over point là gì?

Để phân tích performance, giả sử dùng subtractive method. Vì vậy mỗi write, RAID phải thực hiện 4 physical I/O (hai read và hai write). Giờ tưởng tượng rất nhiều write gửi tới RAID; RAID-4 thực hiện song song được bao nhiêu? Để hiểu, hãy xem lại RAID-4 layout (Hình 38.6).

| Disk 0 | Disk 1 | Disk 2 | Disk 3 | Disk 4 |
|---|---|---|---|---|
| 0 | 1 | 2 | 3 | P0 |
| <sup>∗</sup>4 | 5 | 6 | 7 | <sup>+</sup>P1 |
| 8 | 9 | 10 | 11 | P2 |
| 12 | <sup>∗</sup>13 | 14 | 15 | <sup>+</sup>P3 |

Hình 38.6: Ví dụ: Ghi tới 4, 13 và Parity Block tương ứng

Giờ tưởng tượng 2 small write gửi tới RAID-4 gần đồng thời, tới block 4 và 13 (đánh dấu <sup>∗</sup> trong sơ đồ). Dữ liệu trên disk 0 và 1, nên read và write dữ liệu có thể song song, điều này tốt. Vấn đề phát sinh ở parity disk; cả hai request phải đọc parity block liên quan cho 4 và 13, là parity block 1 và 3 (đánh dấu <sup>+</sup>). Hy vọng vấn đề giờ đã rõ: parity disk là bottleneck dưới workload này; do đó đôi khi gọi đây là small-write problem của parity-based RAID. Vì thế dù data disk có thể truy cập song song, parity disk ngăn mọi parallelism hiện thực hóa; mọi write hệ thống sẽ serialized vì parity disk. Vì parity disk cần hai I/O (một read, một write) mỗi logical I/O, có thể tính performance small random write RAID-4 bằng performance parity disk cho hai I/O đó, đạt (R/2) MB/s. RAID-4 throughput với random small write rất tệ; không cải thiện khi thêm disk.

Kết thúc bằng phân tích I/O latency RAID-4. Như đã biết, một read (giả sử không failure) chỉ map tới một disk, nên latency tương đương single disk request. Latency một write cần hai read rồi hai write; các read có thể song song, write cũng vậy, nên tổng latency khoảng gấp đôi disk đơn (có chút khác vì phải chờ cả hai read xong nên chịu positioning time worst-case, nhưng các update không chịu seek cost nên có thể có positioning cost better-than-average).

## 38.7 RAID Level 5: Rotating Parity

Để giải quyết small-write problem (ít nhất một phần), Patterson, Gibson và Katz giới thiệu RAID-5. RAID-5 gần như giống RAID-4, trừ việc luân phiên parity block trên drive (Hình 38.7).

| Disk 0 | Disk 1 | Disk 2 | Disk 3 | Disk 4 |
|---|---|---|---|---|
| 0 | 1 | 2 | 3 | P0 |
| 5 | 6 | 7 | P1 | 4 |
| 10 | 11 | P2 | 8 | 9 |
| 15 | P3 | 12 | 13 | 14 |
| P4 | 16 | 17 | 18 | 19 |

Hình 38.7: RAID-5 với Parity luân phiên

Như bạn thấy, parity block mỗi stripe giờ luân phiên trên các disk để bỏ bottleneck parity-disk của RAID-4.

### Phân tích RAID-5

Phần lớn phân tích RAID-5 giống RAID-4. Ví dụ effective capacity và failure tolerance hai level giống nhau. Sequential read và write performance cũng vậy. Latency một request (read hay write) cũng giống RAID-4.

Random read performance tốt hơn chút vì giờ dùng được mọi disk. Cuối cùng random write performance cải thiện rõ so với RAID-4 vì cho phép parallelism giữa request. Tưởng tượng ghi block 1 và ghi block 10; chúng thành request tới disk 1 và disk 4 (cho block 1 và parity) và request tới disk 0 và disk 2 (cho block 10 và parity). Vì vậy có thể song song. Thực ra thường có thể giả định với nhiều random request, ta giữ mọi disk bận gần đều nhau. Nếu vậy tổng bandwidth small write là N/4 · R MB/s. Mất đi hệ số bốn vì mỗi RAID-5 write vẫn tạo tổng 4 I/O operation, đơn giản là giá phải trả cho parity-based RAID.

|  | RAID-0 | RAID-1 | RAID-4 | RAID-5 |
|---|---|---|---|---|
| Dung lượng | N · B | (N · B)/2 | (N − 1) · B | (N − 1) · B |
| Reliability | 0 | 1 (chắc chắn)<br>N/2 (nếu may mắn) | 1 | 1 |
| Throughput |  |  |  |  |
| Sequential Read | N · S | (N/2) · S | (N − 1) · S | (N − 1) · S |
| Sequential Write | N · S | (N/2) · S | (N − 1) · S | (N − 1) · S |
| Random Read | N · R | N · R | (N − 1) · R | N · R |
| Random Write | N · R | (N/2) · R | 1/2 · R | N/4 R |
| Latency |  |  |  |  |
| Read | T | T | T | T |
| Write | T | T | 2T | 2T |

Hình 38.8: Capacity, Reliability và Performance của RAID

Vì RAID-5 về cơ bản giống RAID-4 trừ vài trường hợp nó tốt hơn, nó gần như thay hoàn toàn RAID-4 trên thị trường. Nơi duy nhất chưa thay là hệ thống biết chắc chỉ thực hiện large write, do đó tránh hẳn small-write problem [HLM94]; ở đó đôi khi dùng RAID-4 vì xây dựng đơn giản hơn chút.

## 38.8 So sánh RAID: Tổng kết

Giờ tổng kết so sánh RAID level đơn giản hóa trong Hình 38.8. Lưu ý đã bỏ vài chi tiết để đơn giản phân tích. Ví dụ ghi mirrored system có average seek time cao hơn chút so với disk đơn, vì seek time là max của hai seek (mỗi disk một). Do đó random write performance hai disk thường thấp hơn chút random write disk đơn. Ngoài ra khi cập nhật parity disk RAID-4/5, read parity cũ đầu tiên có thể cần full seek và rotation, nhưng write parity thứ hai chỉ cần rotation.

Tuy nhiên so sánh Hình 38.8 nắm được khác biệt cốt yếu, hữu ích để hiểu tradeoff giữa RAID level. Với phân tích latency, chỉ dùng T đại diện thời gian request tới disk đơn.

Kết luận, nếu chỉ muốn performance không quan tâm reliability, striping rõ ràng tốt nhất. Nếu muốn random I/O performance và reliability, mirroring tốt nhất; giá là mất capacity. Nếu capacity và reliability là mục tiêu chính, RAID- 5 thắng; giá là small-write performance. Cuối cùng nếu luôn sequential I/O và muốn capacity tối đa, RAID-5 cũng hợp lý nhất.

## 38.9 Các vấn đề RAID thú vị khác

Có nhiều ý tưởng thú vị khác có thể (và có lẽ nên) bàn khi nghĩ về RAID. Đây là những điều cuối cùng có thể chúng tôi sẽ viết.

Ví dụ có nhiều RAID design khác, gồm Level 2 và 3 trong phân loại ban đầu, Level 6 chịu nhiều disk fault [C+04]. Còn việc RAID làm khi disk hỏng; đôi khi có hot spare chờ thay disk hỏng. Performance lúc failure và khi reconstruction disk hỏng thế nào? Còn fault model thực tế hơn, tính latent sector error hay block corruption [B+08], và nhiều kỹ thuật xử lý chúng (xem chương data integrity). Cuối cùng, thậm chí xây RAID như software layer được: software RAID rẻ hơn nhưng có vấn đề khác, gồm consistent-update problem [DAA05].

## 38.10 Tổng kết

Chúng ta đã thảo luận RAID. RAID biến nhiều disk độc lập thành một thực thể lớn, nhiều dung lượng và đáng tin cậy hơn; điều quan trọng là làm một cách transparent, nên hardware và software bên trên tương đối không cần biết thay đổi.

Có nhiều RAID level để chọn, và level cụ thể phụ thuộc mạnh điều quan trọng với end-user. Ví dụ mirrored RAID đơn giản, đáng tin cậy, thường performance tốt nhưng chi phí capacity cao. Ngược lại RAID-5 đáng tin cậy, tốt hơn về capacity nhưng performance rất kém khi workload có small write. Chọn RAID và đặt parameter (chunk size, số disk, v.v.) phù hợp workload cụ thể là thách thức, vẫn mang tính nghệ thuật hơn khoa học.

## Tài liệu tham khảo

[B+08] “An Analysis of Data Corruption in the Storage Stack”

Lakshmi N. Bairavasundaram, Garth R. Goodson, Bianca Schroeder, Andrea C. Arpaci-Dusseau, Remzi H. Arpaci-Dusseau

FAST ’08, San Jose, CA, February 2008

Công trình của chúng tôi phân tích tần suất disk thực sự làm hỏng dữ liệu. Không thường xuyên, nhưng đôi khi có! Vì vậy reliable storage system phải xét tới.

[BJ88] “Disk Shadowing”

D. Bitton and J. Gray

VLDB 1988

Một trong các bài đầu bàn mirroring, ở đây gọi “shadowing”.

[CL95] “Striping in a RAID level 5 disk array”

Peter M. Chen, Edward K. Lee

SIGMETRICS 1995

Phân tích hay về một số parameter quan trọng của RAID-5 disk array.

[C+04] “Row-Diagonal Parity for Double Disk Failure Correction”

P. Corbett, B. English, A. Goel, T. Grcanac, S. Kleiman, J. Leong, S. Sankar

FAST ’04, February 2004

Dù không phải bài đầu về RAID dùng hai disk parity, đây là phiên bản gần đây và highly-understandable của ý tưởng đó. Đọc để biết thêm.

[DAA05] “Journal-guided Resynchronization for Software RAID”

Timothy E. Denehy, A. Arpaci-Dusseau, R. Arpaci-Dusseau

FAST 2005

Công trình của chúng tôi về consistent-update problem. Ở đây giải quyết cho Software RAID bằng tích hợp cơ chế journaling của file system bên trên với software RAID bên dưới.

[HLM94] “File System Design for an NFS File Server Appliance”

Dave Hitz, James Lau, Michael Malcolm

USENIX Winter 1994, San Francisco, California, 1994

Bài báo ngắn giới thiệu sản phẩm storage cột mốc, write-anywhere file layout hay WAFL file system nền tảng của NetApp file server.

[K86] “Synchronized Disk Interleaving”

M.Y. Kim.

IEEE Transactions on Computers, Volume C-35: 11, November 1986

Một số công trình RAID sớm nhất có ở đây.

[K88] “Small Disk Arrays - The Emerging Approach to High Performance”

F. Kurzweil.

Presentation at Spring COMPCON ’88, March 1, 1988, San Francisco, California

Tài liệu RAID ban đầu khác.

[P+88] “Redundant Arrays of Inexpensive Disks”

D. Patterson, G. Gibson, R. Katz.

SIGMOD 1988

Đây được xem là bài báo RAID, do các tác giả nổi tiếng Patterson, Gibson và Katz viết. Từ đó bài giành nhiều giải test-of-time và mở thời đại RAID, gồm cả chính tên RAID!

[PB86] “Providing Fault Tolerance in Parallel Secondary Storage Systems”

A. Park and K. Balasubramaniam

Department of Computer Science, Princeton, CS-TR-O57-86, November 1986

Công trình RAID ban đầu khác.

[SG86] “Disk Striping”

K. Salem and H. Garcia-Molina.

IEEE International Conference on Data Engineering, 1986

Và đúng, lại công trình RAID ban đầu khác. Có rất nhiều bài như vậy, dường như bất ngờ xuất hiện khắp nơi khi bài RAID công bố tại SIGMOD.

[S84] “Byzantine Generals in Action: Implementing Fail-Stop Processors”

F.B. Schneider.

ACM Transactions on Computer Systems, 2(2):145154, May 1984

Cuối cùng, bài không về RAID! Bài này thực ra về cách hệ thống hỏng và làm sao để một thứ hoạt động theo kiểu fail-stop.

## Bài tập

Phần này giới thiệu raid.py, RAID simulator đơn giản có thể dùng củng cố hiểu biết về hoạt động RAID system. Xem README để biết chi tiết.

### Câu hỏi

1. Dùng simulator thực hiện vài RAID mapping test cơ bản. Chạy level khác nhau (0, 1, 4, 5), xem có xác định được mapping cho tập request không. Với RAID-5, xem có tìm được khác biệt giữa bố trí left-symmetric và left-asymmetric không. Dùng random seed khác để tạo bài toán khác ở trên.

2. Làm như bài đầu nhưng lần này đổi chunk size bằng -C. Chunk size thay mapping thế nào?

3. Làm như trên nhưng dùng flag -r đảo bản chất mỗi bài toán.

4. Giờ dùng reverse flag nhưng tăng kích thước mỗi request với flag -S. Thử kích thước 8k, 12k và 16k, đồng thời đổi RAID level. I/O pattern bên dưới thế nào khi request size tăng? Nhớ thử cả sequential workload (-W sequential); với request size nào RAID-4 và RAID-5 hiệu quả I/O hơn nhiều?

5. Dùng timing mode simulator (-t) ước lượng performance của 100 random read tới RAID, thay đổi RAID level, dùng 4 disk.

6. Làm như trên nhưng tăng số disk. Performance mỗi RAID level scale thế nào khi số disk tăng?

7. Làm như trên nhưng dùng toàn write (-w 100) thay read. Giờ performance mỗi RAID level scale thế nào? Có thể ước lượng sơ bộ thời gian hoàn tất workload 100 random write không?

8. Chạy timing mode lần cuối nhưng với sequential workload (-W sequential). Performance thay thế nào theo RAID level, và khi read so với write? Khi đổi kích thước mỗi request thì sao? Nên ghi kích thước bao nhiêu tới RAID khi dùng RAID-4 hay RAID-5?
