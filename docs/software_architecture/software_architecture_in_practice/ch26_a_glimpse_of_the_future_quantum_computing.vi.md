<a id="ch26"></a>

# 26. Thoáng nhìn tương lai: quantum computing (A Glimpse of the Future: Quantum Computing)

> [Một máy tính lượng tử có thể được so sánh] với chiếc máy bay mà anh em nhà Wright đã bay tại Kitty Hawk năm 1903. Wright Flyer gần như chỉ vừa nhấc khỏi mặt đất, nhưng nó đã báo trước một cuộc cách mạng.<br>
> —wired.com/2015/12/for-google-quantum-computing-is-like-learning-to-fly/

Tương lai sẽ mang lại điều gì về những phát triển ảnh hưởng đến thực hành software architecture? Con người nổi tiếng là kém trong việc dự đoán tương lai long-term, nhưng chúng ta vẫn tiếp tục thử vì, ừ thì, nó vui. Để khép lại cuốn sách, chúng tôi đã chọn tập trung vào một khía cạnh cụ thể vốn bám rễ vững chắc trong tương lai nhưng dường như gần với hiện thực một cách đầy hấp dẫn: quantum computing (điện toán lượng tử).

Máy tính lượng tử nhiều khả năng sẽ trở nên thực tiễn trong vòng năm đến mười năm tới. Hãy xem xét rằng hệ thống bạn đang làm hiện nay có thể có vòng đời cỡ hàng chục—số nhiều—năm. Code được viết trong thập niên 1960s và 1970s vẫn đang được dùng hằng ngày hôm nay. Nếu các hệ thống bạn đang làm có vòng đời ở mức đó, bạn có thể cần chuyển đổi chúng để tận dụng khả năng của máy tính lượng tử khi máy tính lượng tử trở nên thực tiễn.

Máy tính lượng tử đang thu hút sự quan tâm lớn vì tiềm năng thực hiện các phép tính ở tốc độ vượt xa những máy tính cổ điển có năng lực và mạnh mẽ nhất. Năm 2019, Google công bố rằng máy tính lượng tử của họ đã hoàn thành một phép tính phức tạp trong 200 giây. Cùng phép tính đó, Google tuyên bố, sẽ khiến ngay cả những siêu máy tính mạnh nhất mất khoảng 10,000 năm để hoàn thành. Không phải là máy tính lượng tử làm những gì máy tính cổ điển làm, chỉ nhanh hơn một cách phi thường; mà đúng hơn, chúng làm những gì máy tính cổ điển không thể làm bằng cách dùng các tính chất other-worldly của vật lý lượng tử.

Máy tính lượng tử sẽ không tốt hơn máy tính cổ điển trong việc giải mọi bài toán. Ví dụ, với nhiều tác vụ data-processing transaction-oriented phổ biến nhất, chúng có lẽ không liên quan. Chúng sẽ giỏi ở các bài toán liên quan đến tổ hợp và khó về mặt tính toán đối với máy tính cổ điển. Tuy nhiên, khó có khả năng một máy tính lượng tử sẽ bao giờ cung cấp sức mạnh cho điện thoại hay đồng hồ của bạn hoặc nằm trên bàn làm việc của bạn.

Việc hiểu cơ sở lý thuyết của một máy tính lượng tử đòi hỏi hiểu biết sâu về vật lý, bao gồm vật lý lượng tử, và điều đó nằm xa ngoài phạm vi của chúng tôi. Để có bối cảnh, điều tương tự cũng đã đúng với máy tính cổ điển khi chúng được phát minh vào thập niên 1940s. Theo thời gian, yêu cầu phải hiểu CPU và bộ nhớ hoạt động như thế nào đã biến mất nhờ sự ra đời của các abstraction hữu ích, như các ngôn ngữ lập trình high-level. Điều tương tự sẽ xảy ra với máy tính lượng tử. Trong chương này, chúng tôi giới thiệu các khái niệm thiết yếu của quantum computing mà không đề cập đến vật lý nền tảng (thứ đã được biết là có thể khiến đầu óc thực sự nổ tung).

<a id="sec26_1"></a>

## 26.1 Qubit đơn (Single Qubit)

Đơn vị tính toán cơ bản trong một máy tính lượng tử là một đơn vị thông tin lượng tử gọi là *qubit* (sẽ nói thêm về nó ngay sau đây). Định nghĩa đơn giản của một máy tính lượng tử là một processor thao tác trên các qubit. Vào thời điểm cuốn sách này được xuất bản, máy tính lượng tử tốt nhất đang tồn tại chứa vài trăm qubit.

Một “QPU” sẽ tương tác với một CPU cổ điển theo cùng cách mà một graphic processing unit tương tác với CPU ngày nay. Nói cách khác, CPU sẽ xem QPU như một service được cung cấp một số đầu vào và sẽ tạo ra một số đầu ra. Giao tiếp giữa CPU và QPU sẽ dưới dạng các bit cổ điển. Những gì QPU làm với đầu vào để tạo ra đầu ra nằm ngoài phạm vi của CPU.

Một bit trong máy tính cổ điển có giá trị 0 hoặc 1 và, khi hoạt động đúng, không có sự mơ hồ nào về việc nó mang giá trị nào. Ngoài ra, một bit trong máy tính cổ điển có phép đọc không phá hủy. Tức là, đo giá trị sẽ cho bạn một 0 hoặc một 1, và bit sẽ giữ nguyên giá trị mà nó có khi thao tác đọc bắt đầu.

Một qubit khác biệt ở cả hai đặc điểm. Một qubit được đặc trưng bởi ba con số. Hai trong số các con số này là xác suất: xác suất một phép đo sẽ cho ra 1 và xác suất một phép đo sẽ cho ra 0. Con số thứ ba, gọi là pha (phase), mô tả một phép quay của qubit. Một phép đo qubit sẽ trả về hoặc 0 hoặc 1 (với xác suất như đã chỉ định) và sẽ phá hủy giá trị hiện tại của qubit và thay thế nó bằng giá trị mà nó đã trả về. Một qubit có xác suất non-zero cho cả 0 và 1 được gọi là ở trạng thái chồng chập (superposition).

Các pha được quản lý bằng cách biến các xác suất thành số phức. Các biên độ (xác suất) được ký hiệu là |α|<sup>2</sup> và |β|<sup>2</sup>. Nếu |α|<sup>2</sup> là 40 phần trăm và |β|<sup>2</sup> là 60 phần trăm, thì 4 trên mười phép đo sẽ là 0 và 6 trên 10 phép đo đó sẽ là 1. Các biên độ này chịu một xác suất lỗi đo nào đó, và việc giảm xác suất lỗi này là một trong những thách thức kỹ thuật của việc xây dựng máy tính lượng tử.

Có hai hệ quả của định nghĩa này:

1. |α|<sup>2</sup> + |β|<sup>2</sup> = 1. Vì |α|<sup>2</sup> và |β|<sup>2</sup> lần lượt là xác suất một phép đo cho ra 0 hoặc 1, và vì một phép đo sẽ cho ra cái này hoặc cái kia, tổng các xác suất phải là 1.
2. Không có việc sao chép một qubit. Một phép sao chép từ bit cổ điển A sang bit cổ điển B là một phép đọc bit A theo sau là một phép lưu giá trị đó vào B. Phép đo (tức là đọc) qubit A sẽ phá hủy A và cho ra hoặc giá trị 0 hoặc giá trị 1. Phép lưu vào qubit B do đó sẽ là 0 hoặc 1 và sẽ không bao hàm các xác suất hay pha đã được nhúng vào A.

Giá trị pha là một góc giữa 0 và 2Π radian. Nó không ảnh hưởng đến các xác suất của trạng thái chồng chập, nhưng cung cấp thêm một đòn bẩy để thao tác qubit. Một số thuật toán lượng tử đánh dấu một số qubit nhất định bằng cách thao tác pha của chúng.

### Các phép toán trên qubit (Operations on Qubits)

Một số phép toán trên qubit đơn là tương tự của các phép toán trên bit cổ điển, trong khi những phép toán khác là đặc thù cho qubit. Một đặc điểm của hầu hết các phép toán lượng tử là chúng khả nghịch; tức là, khi biết kết quả của một phép toán, có thể khôi phục đầu vào của phép toán đó. Tính khả nghịch là một điểm khác biệt nữa giữa các phép toán bit cổ điển và các phép toán qubit. Ngoại lệ duy nhất đối với tính khả nghịch là phép toán READ: Vì phép đo có tính phá hủy, kết quả của một phép toán READ không cho phép khôi phục qubit ban đầu. Ví dụ về các phép toán qubit bao gồm:

1. Một phép toán READ nhận đầu vào là một qubit đơn và tạo ra đầu ra là 0 hoặc 1 với xác suất được xác định bởi các biên độ của qubit đầu vào. Giá trị của qubit đầu vào sụp đổ thành 0 hoặc 1.
2. Một phép toán NOT nhận một qubit ở trạng thái chồng chập và hoán đổi các biên độ. Tức là, xác suất qubit kết quả là 0 bằng xác suất ban đầu của nó là 1, và ngược lại.
3. Một phép toán Z cộng Π vào pha của qubit (modulo 2Π).
4. Một phép toán HAD (viết tắt của Hadamard) tạo ra một trạng thái chồng chập đều, nghĩa là các biên độ của qubit với giá trị 0 và 1 lần lượt bằng nhau. Một giá trị đầu vào 0 tạo ra pha 0 radian, và một giá trị đầu vào 1 tạo ra pha Π radian.

Có thể xâu chuỗi nhiều phép toán lại với nhau để tạo ra các đơn vị chức năng tinh vi hơn.

Một số toán tử làm việc trên nhiều hơn một qubit. Toán tử two-qubit chính là CNOT—một phép not có điều khiển (controlled not). Qubit thứ nhất là bit điều khiển. Nếu nó là 1, thì phép toán thực hiện một NOT trên qubit thứ hai. Nếu qubit thứ nhất là 0, thì qubit thứ hai giữ nguyên.

### Vướng víu lượng tử (Entanglement)

Entanglement là một trong những yếu tố then chốt của quantum computing. Nó không có tương tự trong điện toán cổ điển, và mang lại cho quantum computing một số tính chất rất kỳ lạ và kỳ diệu, cho phép nó làm những gì máy tính cổ điển không thể.

Hai qubit được gọi là “vướng víu” (entangled) nếu, khi được đo, phép đo qubit thứ hai khớp với phép đo của qubit thứ nhất. Entanglement có thể xảy ra bất kể khoảng thời gian giữa hai phép đo, hay khoảng cách vật lý giữa các qubit. Điều này dẫn chúng ta đến cái được gọi là quantum teleportation (dịch chuyển lượng tử). Hãy thắt dây an toàn.

<a id="sec26_2"></a>

## 26.2 Dịch chuyển lượng tử (Quantum Teleportation)

Hãy nhớ rằng không thể sao chép trực tiếp một qubit sang một qubit khác. Do đó, nếu chúng ta muốn sao chép một qubit sang một qubit khác, chúng ta phải dùng các phương tiện gián tiếp. Hơn nữa, chúng ta phải chấp nhận việc phá hủy trạng thái của qubit ban đầu. Qubit nhận sẽ có cùng trạng thái với qubit ban đầu đã bị phá hủy. *Quantum teleportation* là tên được đặt cho việc sao chép trạng thái này. Không có yêu cầu rằng qubit ban đầu và qubit nhận phải có bất kỳ mối quan hệ vật lý nào, cũng không có ràng buộc nào về khoảng cách giữa chúng. Do đó, có thể truyền thông tin qua những khoảng cách lớn, thậm chí hàng trăm hoặc hàng nghìn kilômét, giữa các qubit đã được triển khai về mặt vật lý.

Việc dịch chuyển trạng thái của một qubit phụ thuộc vào entanglement. Hãy nhớ rằng entanglement có nghĩa là một phép đo một qubit bị vướng víu sẽ bảo đảm rằng một phép đo qubit thứ hai sẽ có cùng giá trị. Teleportation dùng ba qubit. Qubit A và Β được làm vướng víu, rồi qubit ψ được làm vướng víu với qubit A. Qubit ψ được dịch chuyển đến vị trí của qubit Β, và trạng thái của nó trở thành trạng thái của qubit Β. Nói đại khái, teleportation diễn ra qua bốn bước sau:

1. Làm vướng víu các qubit A và Β. Chúng tôi đã thảo luận điều này có nghĩa là gì trong mục trước. Vị trí của A và Β có thể tách biệt về mặt vật lý.
2. Chuẩn bị “payload.” Qubit payload sẽ có trạng thái cần được dịch chuyển. Payload, tức là qubit ψ, được chuẩn bị tại vị trí của A.
3. Truyền payload. Việc truyền bao gồm hai bit cổ điển được chuyển đến vị trí của Β. Việc truyền cũng bao gồm việc đo A và ψ, điều này phá hủy trạng thái của cả hai qubit này.
4. Re-create trạng thái của ψ trong Β.

Chúng tôi đã bỏ qua nhiều chi tiết then chốt, nhưng điểm chính là: Quantum teleportation là một thành phần thiết yếu của giao tiếp lượng tử. Nó dựa vào việc truyền hai bit qua các kênh giao tiếp thông thường. Nó an toàn một cách cố hữu, vì tất cả những gì một kẻ nghe lén có thể xác định là hai bit được gửi qua các kênh thông thường. Vì A và Β giao tiếp thông qua entanglement, chúng không được gửi vật lý qua một đường truyền. National Institute of Science and Technology (NIST) của Mỹ đang xem xét nhiều protocol giao tiếp quantum-based khác nhau làm cơ sở cho một transport protocol gọi là HTTPQ, nhằm thay thế HTTPS. Vì việc thay thế một communication protocol bằng một cái khác mất hàng thập kỷ, mục tiêu là để HTTPQ được áp dụng trước khi có những máy tính lượng tử có thể phá HTTPS.

<a id="sec26_3"></a>

## 26.3 Quantum computing và mã hóa (Quantum Computing and Encryption)

Máy tính lượng tử cực kỳ thành thạo trong việc tính nghịch đảo của một hàm—đặc biệt là nghịch đảo của một hàm hash. Có nhiều trường hợp mà loại tính toán này sẽ cực kỳ hữu ích, nhưng đặc biệt là trong việc giải mã mật khẩu. Mật khẩu hầu như không bao giờ được lưu trực tiếp; thay vào đó, hash của chúng được lưu. Giả định đằng sau việc chỉ lưu hash là việc tính nghịch đảo của hàm hash là khó về mặt tính toán và sẽ mất hàng trăm, nếu không phải hàng nghìn, năm để thực hiện—tức là, khi dùng máy tính thông thường. Tuy nhiên, máy tính lượng tử thay đổi phép tính này.

Thuật toán Grover là một ví dụ về thuật toán xác suất tính nghịch đảo của một hàm. Nó cần cỡ 2<sup>128</sup> vòng lặp để tính nghịch đảo của một hash dựa trên 256 bit. Điều này thể hiện một sự tăng tốc bậc hai so với các thuật toán tính toán thông thường, nghĩa là thời gian của thuật toán lượng tử xấp xỉ căn bậc hai của thời gian thuật toán thông thường. Điều này khiến một lượng khổng lồ tài liệu password-protected, trước đây được cho là an toàn, trở nên khá dễ bị tấn công.

Các thuật toán mã hóa an toàn hiện đại dựa trên độ khó của việc phân tích tích của hai số nguyên tố lớn. Cho *p* và *q* là hai số nguyên tố phân biệt, mỗi số có độ lớn hơn 128 bit. Tích của hai số nguyên tố này *pq* có độ lớn khoảng 256 bit. Tích này tương đối dễ tính khi biết *p* và *q*. Tuy nhiên, việc phân tích tích *pq* và khôi phục *p* và *q* là rất khó về mặt tính toán trên một máy tính cổ điển: Nó thuộc loại *NP*-hard.

Điều này có nghĩa là với một message được mã hóa dựa trên các số nguyên tố *p* và *q*, việc giải mã message này tương đối dễ nếu bạn biết *p* và *q* nhưng thực tế là không thể nếu bạn không biết—ít nhất là trên một máy tính cổ điển. Tuy nhiên, máy tính lượng tử có thể phân tích *pq* hiệu quả hơn nhiều so với máy tính cổ điển. Thuật toán Shor là một thuật toán lượng tử có thể phân tích *pq* với thời gian chạy cỡ log (số bit trong *p* và *q*).

<a id="sec26_4"></a>

## 26.4 Các thuật toán khác (Other Algorithms)

Quantum computing nắm giữ tiềm năng game-changing tương tự cho nhiều ứng dụng. Ở đây, chúng tôi bắt đầu thảo luận bằng việc giới thiệu một phần cứng cần thiết nhưng hiện chưa tồn tại—QRAM.

### QRAM

Quantum random access memory (QRAM) là một element then chốt để triển khai và áp dụng nhiều thuật toán lượng tử. QRAM, hoặc thứ gì đó tương tự, sẽ cần thiết để cung cấp truy cập hiệu quả tới lượng dữ liệu lớn như dữ liệu được dùng trong các ứng dụng machine learning. Hiện tại, chưa có bản triển khai QRAM nào tồn tại, nhưng một số nhóm nghiên cứu đang khám phá cách một bản triển khai như vậy có thể hoạt động.

RAM thông thường gồm một thiết bị phần cứng nhận đầu vào là một vị trí bộ nhớ và trả về đầu ra là nội dung của vị trí bộ nhớ đó. QRAM tương tự về mặt khái niệm: Nó nhận đầu vào là một vị trí bộ nhớ (nhiều khả năng là một trạng thái chồng chập của các vị trí bộ nhớ) và trả về đầu ra là nội dung ở trạng thái chồng chập của các vị trí bộ nhớ đó. Các vị trí bộ nhớ có nội dung được trả về đã được ghi theo cách thông thường; tức là, mỗi bit có một giá trị. Các giá trị được trả về ở trạng thái chồng chập, và các biên độ được xác định bởi đặc tả của các vị trí bộ nhớ cần trả về. Vì các giá trị ban đầu được ghi theo cách thông thường, chúng có thể được sao chép theo cách không phá hủy.

Một vấn đề với QRAM được đề xuất là số lượng tài nguyên vật lý cần thiết tăng tuyến tính theo số bit được truy xuất. Do đó, có thể không thực tế để xây dựng QRAM cho các lần truy xuất rất lớn. Như với phần lớn thảo luận về máy tính lượng tử, QRAM đang ở giai đoạn thảo luận lý thuyết thay vì giai đoạn kỹ thuật. Hãy chờ xem.

Các thuật toán còn lại mà chúng tôi thảo luận giả định sự tồn tại của một cơ chế để truy cập hiệu quả dữ liệu được thao tác bởi một thuật toán, như với QRAM.

### Nghịch đảo ma trận (Matrix Inversion)

Nghịch đảo ma trận là nền tảng của nhiều bài toán trong khoa học. Machine learning, chẳng hạn, đòi hỏi khả năng nghịch đảo các ma trận lớn. Máy tính lượng tử hứa hẹn tăng tốc việc nghịch đảo ma trận trong bối cảnh này. Thuật toán HHL của Harrow, Hassidim và Lloyd sẽ nghịch đảo một ma trận tuyến tính, với một số ràng buộc. Bài toán tổng quát là giải phương trình *Ax* = *b*, trong đó *A* là một ma trận *N* × *N*, *x* là một tập *N* ẩn số, và *b* là một tập *N* giá trị đã biết. Bạn đã học về trường hợp đơn giản nhất (*N* = 2) trong đại số sơ cấp. Tuy nhiên, khi *N* tăng lên, nghịch đảo ma trận trở thành kỹ thuật chuẩn để giải hệ phương trình.

Các ràng buộc sau áp dụng khi giải bài toán này bằng máy tính lượng tử:

1. Các *b* phải truy cập được nhanh chóng. Đây là vấn đề mà QRAM được kỳ vọng sẽ giải quyết.
2. Ma trận *A* phải thỏa mãn một số điều kiện nhất định. Nếu nó là một ma trận thưa, thì nhiều khả năng nó có thể được xử lý hiệu quả trên một máy tính lượng tử. Ma trận cũng phải well conditioned; tức là, định thức của ma trận phải non-zero và không quá gần không. Một định thức nhỏ gây ra vấn đề khi nghịch đảo một ma trận trên máy tính cổ điển, nên đây không phải là một vấn đề riêng của lượng tử.
3. Kết quả của việc áp dụng thuật toán HHL là các giá trị *x* xuất hiện ở trạng thái chồng chập. Do đó, cần một cơ chế để tách hiệu quả các giá trị thực tế khỏi trạng thái chồng chập.

Thuật toán thực tế quá phức tạp để chúng tôi trình bày ở đây. Tuy nhiên, một yếu tố đáng chú ý là nó dựa vào một kỹ thuật khuếch đại biên độ dựa trên việc dùng pha.

<a id="sec26_5"></a>

## 26.5 Các ứng dụng tiềm năng (Potential Applications)

Máy tính lượng tử được kỳ vọng sẽ có tác động đến nhiều lĩnh vực ứng dụng khác nhau. IBM, chẳng hạn, đang tập trung vào an ninh mạng, phát triển thuốc, mô hình hóa tài chính, pin tốt hơn, phân bón sạch hơn, tối ưu hóa giao thông, dự báo thời tiết và biến đổi khí hậu, và trí tuệ nhân tạo cùng machine learning, chỉ kể ra một vài.

Cho đến nay, ngoại trừ an ninh mạng, danh sách các ứng dụng quantum computing tiềm năng này phần lớn vẫn là suy đoán. Một số thuật toán an ninh mạng đã được chứng minh mang lại cải thiện đáng kể so với các thuật toán cổ điển, nhưng các lĩnh vực ứng dụng còn lại, cho đến nay, là chủ đề của nhiều nghiên cứu sôi nổi. Tuy nhiên, cho đến giờ, chưa có nỗ lực nào trong số này tạo ra kết quả công khai.

Như câu trích dẫn chapter-opening đã gợi ý, máy tính lượng tử đang ở giai đoạn mà máy bay đã ở vào thời anh em nhà Wright. Lời hứa hẹn là rất lớn nhưng một lượng công việc khổng lồ phải được thực hiện để biến lời hứa hẹn thành hiện thực.

<a id="sec26_6"></a>

## 26.6 Suy nghĩ cuối cùng (Final Thoughts)

Máy tính lượng tử hiện đang ở giai đoạn sơ khai. Các ứng dụng cho những máy tính như vậy chủ yếu là suy đoán vào thời điểm này, đặc biệt là các ứng dụng đòi hỏi lượng dữ liệu lớn. Tuy vậy, tiến bộ đang diễn ra nhanh chóng về số lượng qubit tồn tại vật lý thực sự. Có vẻ hợp lý rằng định luật Moore sẽ áp dụng cho máy tính lượng tử, cũng như nó đã áp dụng trong điện toán thông thường. Nếu vậy, số lượng qubit sẵn có sẽ tăng theo cấp số mũ theo thời gian.

Các phép toán qubit được thảo luận trong [Mục 26.2](#sec26_2) phù hợp với một phong cách lập trình trong đó các phép toán được xâu chuỗi lại với nhau để thực hiện chức năng hữu ích. Điều này nhiều khả năng sẽ đi theo cùng quỹ đạo như ngôn ngữ máy cho máy tính cổ điển. Ngôn ngữ máy vẫn tồn tại nhưng đã trở thành một lĩnh vực chỉ dành cho một số ít lập trình viên. Hầu hết lập trình viên dùng nhiều ngôn ngữ higher-level khác nhau. Chúng ta nên kỳ vọng thấy cùng sự tiến hóa trong việc lập trình máy tính lượng tử. Các nỗ lực thiết kế ngôn ngữ cho quantum computing đang được tiến hành nhưng vẫn ở trạng thái sơ khai.

Ngôn ngữ lập trình chỉ là phần nổi của tảng băng. Còn các chủ đề khác mà chúng tôi đã đề cập trong cuốn sách này thì sao? Có những quality attribute mới liên quan đến máy tính lượng tử, những architectural pattern mới, một architecture view bổ sung không? Gần như chắc chắn.

Một mạng máy tính lượng tử sẽ trông như thế nào? Các mạng lai giữa máy tính lượng tử và máy tính cổ điển có trở nên phổ biến không? Tất cả những điều này là các lĩnh vực tiềm năng mà quantum computing gần như chắc chắn sẽ tiến hóa vào—rốt cuộc.

Kiến trúc sư có thể làm gì trong lúc chờ đợi? Thứ nhất, hãy chú ý đến những phát triển đột phá. Nếu các hệ thống bạn đang làm hôm nay liên quan đến các lĩnh vực mà quantum computing nhiều khả năng sẽ ảnh hưởng (hoặc, nhiều khả năng hơn, đảo lộn hoàn toàn), hãy cô lập các phần đó của hệ thống để giảm thiểu sự xáo trộn khi quantum computing cuối cùng xuất hiện. Đặc biệt với các hệ thống bảo mật, hãy theo dõi lĩnh vực này để biết phải làm gì khi các thuật toán mã hóa thông thường của bạn trở nên vô giá trị.

Nhưng sự chuẩn bị của bạn không nhất thiết phải hoàn toàn mang tính phòng thủ. Hãy tưởng tượng bạn có thể làm gì với một mạng giao tiếp có khả năng truyền thông tin tức thời, bất kể khoảng cách vật lý giữa các node. Nếu điều này nghe có vẻ far-fetched—thì, máy bay ngày xưa cũng từng như vậy.

Như mọi khi, chúng tôi háo hức chờ đợi tương lai.

<a id="sec26_7"></a>

## 26.7 Đọc thêm (For Further Reading)

Tổng quan chung:

- *Programming Quantum Computers* của Eric Johnston, Nic Harrigan và Mercedes Gimeno-Segovia thảo luận quantum computing mà không đề cập đến vật lý hay đại số tuyến tính [Johnston 19].
- *Quantum Computing: Progress and Prospects* [NASEM 19] cung cấp một tổng quan về tình trạng hiện tại của quantum computing và các thách thức cần vượt qua để tạo ra máy tính lượng tử thực sự.
- Máy tính lượng tử không chỉ cung cấp giải pháp nhanh hơn so với máy tính cổ điển, mà còn giải quyết một số bài toán *chỉ* có thể được giải bằng máy tính lượng tử. Kết quả lý thuyết mạnh mẽ này xuất hiện vào tháng Năm 2018: [quantamagazine.org/finally-a-problem-that-only-quantum-computers-will-ever-be-able-to-solve-20180621/](http://quantamagazine.org/finally-a-problem-that-only-quantum-computers-will-ever-be-able-to-solve-20180621/).
