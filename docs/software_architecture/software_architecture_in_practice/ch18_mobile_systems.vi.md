<a id="ch18"></a>

# 18. Hệ thống di động (Mobile Systems)

Cùng với Yazid Hamdi và Greg Hartman

> Điện thoại sẽ được dùng để báo cho mọi người biết rằng một bức điện tín đã được gửi đi.<br>
> —Alexander Graham Bell

Vậy rốt cuộc Alexander Graham Bell thì biết gì chứ? Các hệ thống di động, bao gồm và đặc biệt là điện thoại, có mặt ở khắp nơi trong thế giới ngày nay. Ngoài điện thoại, chúng bao gồm tàu hỏa, máy bay và ô tô; chúng bao gồm tàu thủy và vệ tinh, các thiết bị giải trí và điện toán cá nhân, và các hệ thống robot (tự hành hay không); chúng bao gồm về cơ bản mọi hệ thống hoặc thiết bị không có kết nối cố định với một nguồn điện dồi dào liên tục.

Một hệ thống di động có khả năng di chuyển trong khi vẫn tiếp tục cung cấp một phần hoặc toàn bộ chức năng của nó. Điều này khiến việc xử lý một số đặc điểm của nó khác với việc xử lý các hệ thống cố định. Trong chương này, chúng tôi tập trung vào năm đặc điểm như vậy:

1. *Năng lượng (Energy)*. Các hệ thống di động có nguồn điện hạn chế và phải quan tâm đến việc sử dụng điện năng hiệu quả.
2. *Kết nối mạng (Network connectivity)*. Các hệ thống di động có xu hướng cung cấp phần lớn chức năng của mình bằng cách trao đổi thông tin với các thiết bị khác trong khi đang di chuyển. Do đó, chúng phải kết nối với những thiết bị đó, nhưng tính di động khiến các kết nối này trở nên khó khăn.
3. *Cảm biến và actuator (Sensors and actuators)*. Các hệ thống di động có xu hướng thu thập nhiều thông tin từ cảm biến hơn so với các hệ thống cố định, và chúng thường dùng actuator để tương tác với môi trường.
4. *Tài nguyên (Resources)*. Các hệ thống di động có xu hướng resource-constrained hơn các hệ thống cố định. Một mặt, chúng thường khá nhỏ, đến mức việc đóng gói vật lý trở thành một yếu tố giới hạn. Mặt khác, tính di động thường khiến trọng lượng trở thành một yếu tố. Các thiết bị di động phải nhỏ và nhẹ có giới hạn về tài nguyên mà chúng có thể cung cấp.
5. *Vòng đời (Life cycle)*. Kiểm thử các hệ thống di động khác với kiểm thử các hệ thống khác. Việc deploy các phiên bản mới cũng đặt ra một số vấn đề đặc biệt.

Khi thiết kế một hệ thống cho một nền tảng di động, bạn phải xử lý một số lượng lớn các yêu cầu domain-specific. Các ô tô self-driving và drone tự hành phải an toàn; smartphone phải cung cấp một nền tảng mở cho nhiều loại ứng dụng rất khác nhau; các hệ thống giải trí phải làm việc với một phạm vi rộng các định dạng nội dung và nhà cung cấp dịch vụ. Trong chương này, chúng tôi sẽ tập trung vào những đặc điểm chung của nhiều (nếu không phải tất cả) hệ thống di động mà kiến trúc sư phải xem xét khi thiết kế một hệ thống.

<a id="sec18_1"></a>

## 18.1 Năng lượng (Energy)

Trong mục này, chúng tôi tập trung vào các mối quan tâm về architecture liên quan nhất đến việc quản lý năng lượng của các hệ thống di động. Với nhiều thiết bị di động, nguồn năng lượng của chúng là một viên pin có dung lượng rất hữu hạn để cung cấp năng lượng đó. Các thiết bị di động khác, như ô tô và máy bay, chạy bằng điện năng do máy phát tạo ra, mà đến lượt chúng có thể được vận hành bởi các động cơ chạy bằng nhiên liệu—một lần nữa, là một tài nguyên hữu hạn.

### Các mối quan tâm của kiến trúc sư (The Architect’s Concerns)

Kiến trúc sư phải quan tâm đến việc giám sát nguồn điện, điều tiết mức sử dụng năng lượng, và chịu đựng việc mất điện. Chúng tôi trình bày chi tiết các mối quan tâm này trong ba tiểu mục tiếp theo.

#### Giám sát nguồn điện (Monitoring the Power Source)

Trong [Chương 6](ch06_energy_efficiency.vi.md#ch06) về energy efficiency, chúng tôi đã giới thiệu một loại tactic gọi là “resource monitoring” để giám sát việc sử dụng tài nguyên tính toán, vốn là những thứ tiêu thụ năng lượng. Trong các hệ thống di động, chúng ta cần giám sát nguồn năng lượng, để có thể khởi tạo hành vi thích hợp khi năng lượng có sẵn trở nên thấp. Cụ thể, trong một thiết bị di động chạy bằng pin, chúng ta có thể cần thông báo cho người dùng rằng mức pin thấp, đưa thiết bị vào chế độ battery-saving, cảnh báo các ứng dụng về việc thiết bị sắp tắt để chúng có thể chuẩn bị cho việc khởi động lại, và xác định mức sử dụng điện năng của từng ứng dụng.

Tất cả những cách sử dụng này đều phụ thuộc vào việc giám sát trạng thái hiện tại của pin. Hầu hết laptop hoặc smartphone dùng một smart battery làm nguồn điện. Smart battery là một bộ pin sạc lại được có một battery management system (BMS) built-in. BMS có thể được truy vấn để lấy trạng thái hiện tại của pin. Các hệ thống di động khác có thể dùng một công nghệ pin khác, nhưng tất cả đều có một năng lực tương đương nào đó. Vì mục đích của mục này, chúng tôi sẽ giả định rằng số đọc xác định phần trăm dung lượng còn lại.

Các hệ thống di động battery-powered bao gồm một component, thường nằm trong kernel của hệ điều hành, biết cách tương tác với BMS và có thể trả về dung lượng pin hiện tại khi được yêu cầu. Một battery manager chịu trách nhiệm định kỳ truy vấn component đó để lấy trạng thái của pin. Điều này cho phép hệ thống thông báo cho người dùng về tình trạng năng lượng và kích hoạt chế độ battery-saving, nếu cần. Để thông báo cho các ứng dụng rằng thiết bị sắp tắt, các ứng dụng phải đăng ký với battery manager.

Hai đặc điểm của pin thay đổi khi pin lão hóa: dung lượng pin tối đa và dòng điện duy trì tối đa. Kiến trúc sư phải cho phép quản lý mức tiêu thụ trong giới hạn thay đổi của điện năng có sẵn để thiết bị vẫn hoạt động ở mức chấp nhận được. Việc giám sát cũng đóng vai trò trong các hệ thống generator-equipped, vì một số ứng dụng có thể cần bị tắt hoặc đặt ở chế độ chờ khi đầu ra của máy phát thấp. Battery manager cũng có thể xác định những ứng dụng nào đang active và mức tiêu thụ năng lượng của chúng là bao nhiêu. Khi đó, tổng phần trăm thay đổi của dung lượng pin có thể được ước tính dựa trên thông tin này.

Tất nhiên, bản thân battery manager cũng dùng tài nguyên—memory và thời gian CPU. Lượng thời gian CPU mà battery manager tiêu thụ có thể được quản lý bằng cách điều chỉnh khoảng thời gian truy vấn.

#### Điều tiết mức sử dụng năng lượng (Throttling Energy Usage)

Mức sử dụng năng lượng có thể được giảm bằng cách kết thúc hoặc làm suy giảm các phần của hệ thống tiêu thụ năng lượng; đây là tactic throttle usage được mô tả trong [Chương 6](ch06_energy_efficiency.vi.md#ch06). Chi tiết cụ thể về cách làm điều này phụ thuộc vào từng element riêng lẻ của hệ thống, nhưng một ví dụ phổ biến là giảm độ sáng hoặc tần số làm mới của màn hình trên smartphone. Các kỹ thuật khác để điều tiết mức sử dụng năng lượng bao gồm giảm số core active của processor, giảm tần số clock của các core, và giảm tần suất đọc cảm biến. Ví dụ, thay vì yêu cầu dữ liệu vị trí GPS mỗi vài giây, hãy yêu cầu nó khoảng mỗi phút. Thay vì dựa vào nhiều nguồn dữ liệu vị trí khác nhau như GPS và trạm phát sóng di động, hãy chỉ dùng một trong số đó.

#### Chịu đựng việc mất điện (Tolerating a Loss of Power)

Các hệ thống di động nên chịu đựng một cách nhẹ nhàng các sự cố mất điện và khởi động lại. Ví dụ, một yêu cầu của hệ thống như vậy có thể là sau khi có điện trở lại, hệ thống sẽ bật lại và hoạt động ở chế độ danh nghĩa trong vòng 30 giây. Yêu cầu này ngụ ý rằng các yêu cầu khác nhau áp dụng cho các phần khác nhau của hệ thống, chẳng hạn như sau:

- Ví dụ về yêu cầu phần cứng:
- Máy tính của hệ thống không bị hỏng vĩnh viễn nếu bị cắt điện vào bất kỳ lúc nào.
- Máy tính của hệ thống khởi động (lại) OS một cách robust bất cứ khi nào được cung cấp đủ điện.
- OS của hệ thống đã lên lịch cho phần mềm khởi chạy ngay khi OS sẵn sàng.
- Ví dụ về yêu cầu phần mềm:
- Môi trường runtime có thể bị kill bất kỳ lúc nào mà không ảnh hưởng đến tính toàn vẹn của binary, cấu hình và dữ liệu vận hành trong bộ lưu trữ bền vững, đồng thời giữ trạng thái nhất quán sau khi khởi động lại (dù đó là reset hay resume).
- Ứng dụng cần một chiến lược để xử lý dữ liệu đến trong khi ứng dụng không hoạt động.
- Runtime có thể khởi động sau một failure sao cho thời gian khởi động, từ lúc hệ thống bật nguồn đến lúc phần mềm ở trạng thái sẵn sàng, nhỏ hơn một khoảng thời gian xác định.

<a id="sec18_2"></a>

## 18.2 Kết nối mạng (Network Connectivity)

Trong mục này, chúng tôi tập trung vào các mối quan tâm về architecture liên quan nhất đến kết nối mạng của các hệ thống di động. Chúng tôi sẽ tập trung vào việc giao tiếp không dây giữa nền tảng di động và thế giới bên ngoài. Mạng có thể được dùng để điều khiển thiết bị hoặc để gửi và nhận thông tin.

Mạng không dây được phân loại dựa trên khoảng cách mà chúng hoạt động.

- *Trong phạm vi 4 centimet*. Near Field Communication (NFC) được dùng cho thẻ khóa và các hệ thống thanh toán không tiếp xúc. Các tiêu chuẩn trong lĩnh vực này đang được GSM Alliance phát triển.
- *Trong phạm vi 10 mét*. Họ tiêu chuẩn IEEE 802.15 bao quát khoảng cách này. Bluetooth và Zigbee là các protocol phổ biến trong loại này
- *Trong phạm vi 100 mét*. Họ tiêu chuẩn IEEE 802.11 (Wi-Fi) được dùng trong khoảng cách này.
- *Trong phạm vi vài kilomet*. Các tiêu chuẩn IEEE 802.16 bao quát khoảng cách này. WiMAX là tên thương mại của các tiêu chuẩn IEEE 802.16.
- *Hơn vài kilomet*. Điều này đạt được bằng liên lạc di động (cellular) hoặc vệ tinh.

Trong tất cả các loại này, công nghệ và tiêu chuẩn đang tiến hóa nhanh chóng.

### Các mối quan tâm của kiến trúc sư (The Architect’s Concerns)

Thiết kế cho giao tiếp và kết nối mạng đòi hỏi kiến trúc sư cân bằng một số lượng lớn các mối quan tâm, bao gồm:

- *Số lượng communication interface cần hỗ trợ*. Với tất cả các protocol khác nhau và sự tiến hóa nhanh chóng của chúng, kiến trúc sư dễ bị cám dỗ đưa vào mọi loại network interface có thể có. Mục tiêu khi thiết kế một hệ thống di động thì ngược lại: Chỉ nên đưa vào những interface thực sự cần thiết để tối ưu mức tiêu thụ điện năng, lượng nhiệt sinh ra và việc phân bổ không gian.
- *Chuyển từ protocol này sang protocol khác*. Dù cần có cách tiếp cận tối giản với interface, kiến trúc sư phải tính đến khả năng trong một session, hệ thống di động có thể di chuyển từ một môi trường hỗ trợ một protocol sang một môi trường hỗ trợ protocol khác. Ví dụ, một video có thể đang được stream qua Wi-Fi, nhưng sau đó hệ thống có thể di chuyển đến một môi trường không có Wi-Fi và video sẽ được nhận qua mạng di động. Những chuyển đổi như vậy nên liền mạch đối với người dùng.
- *Chọn protocol thích hợp một cách động*. Trong trường hợp có nhiều protocol cùng sẵn có, hệ thống nên chọn protocol một cách động dựa trên các yếu tố như chi phí, băng thông và mức tiêu thụ điện năng.
- *Modifiability*. Với số lượng lớn protocol và sự tiến hóa nhanh chóng của chúng, nhiều khả năng trong vòng đời của một hệ thống di động, sẽ cần hỗ trợ các protocol mới hoặc thay thế. Hệ thống nên được thiết kế để hỗ trợ việc thay đổi hoặc thay thế các element của hệ thống liên quan đến giao tiếp.
- *Băng thông (Bandwidth)*. Thông tin cần giao tiếp với các hệ thống khác nên được phân tích về các yêu cầu khoảng cách, khối lượng và độ trễ để có thể đưa ra các lựa chọn architecture thích hợp. Các protocol đều khác nhau về những chất lượng đó.
- *Kết nối gián đoạn/hạn chế/không có kết nối*. Liên lạc có thể bị mất trong khi thiết bị đang di chuyển (ví dụ: một smartphone đi qua đường hầm). Hệ thống nên được thiết kế sao cho tính toàn vẹn dữ liệu được duy trì trong trường hợp mất kết nối, và việc tính toán có thể được tiếp tục mà không mất tính nhất quán khi kết nối trở lại. Hệ thống nên được thiết kế để xử lý một cách nhẹ nhàng việc kết nối bị hạn chế hoặc thậm chí không có kết nối. Các chế độ suy giảm và chế độ dự phòng nên có sẵn một cách động để xử lý những tình huống như vậy.
- *Security*. Các thiết bị di động đặc biệt dễ bị tấn công spoofing, nghe lén và man-in-the-middle, nên việc phản ứng với những cuộc tấn công như vậy nên là một phần trong các mối quan tâm của kiến trúc sư.

<a id="sec18_3"></a>

## 18.3 Cảm biến và actuator (Sensors and Actuators)

Một *sensor* (cảm biến) là một thiết bị phát hiện các đặc điểm vật lý của môi trường xung quanh và chuyển những đặc điểm đó thành một biểu diễn điện tử. Một thiết bị di động thu thập dữ liệu môi trường hoặc để dẫn dắt hoạt động của chính nó (như cao độ kế trong một drone), hoặc để báo cáo dữ liệu đó lại cho người dùng (như la bàn từ trong smartphone của bạn).

Một *transducer* cảm nhận các xung điện tử bên ngoài và chuyển đổi chúng thành một dạng nội bộ hữu dụng hơn. Trong mục này. chúng tôi sẽ dùng thuật ngữ “sensor” để bao hàm cả transducer, và giả định biểu diễn điện tử là dạng số.

Một *sensor hub* là một coprocessor giúp tích hợp dữ liệu từ các cảm biến khác nhau và xử lý nó. Một sensor hub có thể giúp giảm tải những công việc này khỏi CPU chính của sản phẩm, nhờ đó tiết kiệm pin và cải thiện performance.

Bên trong hệ thống di động, phần mềm sẽ trừu tượng hóa một số đặc điểm của môi trường. Sự trừu tượng hóa này có thể ánh xạ trực tiếp tới một cảm biến, như với việc đo nhiệt độ hoặc áp suất, hoặc có thể tích hợp đầu vào của nhiều cảm biến, như việc nhận diện người đi bộ trong một bộ điều khiển ô tô self-driving.

Một *actuator* là ngược lại của một cảm biến: Nó nhận một biểu diễn số làm đầu vào và gây ra một hành động nào đó trong môi trường. Tính năng hỗ trợ giữ làn đường trên ô tô dùng actuator, cũng như một cảnh báo âm thanh từ smartphone của bạn.

### Các mối quan tâm của kiến trúc sư (The Architect’s Concerns)

Kiến trúc sư có một số mối quan tâm liên quan đến cảm biến:

- Cách tạo ra một biểu diễn chính xác về môi trường dựa trên đầu vào của cảm biến.
- Hệ thống nên phản hồi biểu diễn môi trường đó như thế nào.
- Security và quyền riêng tư của dữ liệu cảm biến và lệnh actuator.
- Vận hành suy giảm. Nếu cảm biến hỏng hoặc không đọc được, hệ thống nên đi vào chế độ suy giảm. Ví dụ, nếu số đọc GPS không có trong đường hầm, hệ thống có thể dùng các kỹ thuật dead reckoning để ước tính vị trí.

Biểu diễn môi trường được hệ thống tạo ra và hành động dựa trên đó là domain specific, cũng như cách tiếp cận thích hợp cho việc vận hành suy giảm. Chúng tôi đã thảo luận chi tiết về security và quyền riêng tư trong [Chương 8](ch08_modifiability.vi.md#ch08), nhưng ở đây chúng tôi sẽ chỉ tập trung vào mối quan tâm đầu tiên: tạo ra một biểu diễn chính xác về môi trường dựa trên dữ liệu do cảm biến trả về. Việc này được thực hiện bằng sensor stack—một liên minh các thiết bị và software driver giúp biến dữ liệu thô thành thông tin đã được diễn giải về môi trường.

Các nền tảng và domain khác nhau có xu hướng có sensor stack riêng, và sensor stack thường đi kèm framework riêng để giúp xử lý các thiết bị dễ dàng hơn. Theo thời gian, cảm biến nhiều khả năng sẽ bao hàm ngày càng nhiều chức năng; đến lượt mình, các chức năng của một stack cụ thể sẽ thay đổi theo thời gian. Ở đây, chúng tôi liệt kê một số chức năng phải đạt được trong stack bất kể một cách phân rã cụ thể đã đặt chúng ở đâu:

- *Đọc dữ liệu thô (Reading raw data).* Mức thấp nhất của stack là một software driver để đọc dữ liệu thô. Driver đọc cảm biến hoặc trực tiếp hoặc, trong trường hợp cảm biến là một phần của sensor hub, thông qua hub. Driver lấy số đọc từ cảm biến một cách định kỳ. Tần suất chu kỳ là một tham số sẽ ảnh hưởng đến cả tải processor do việc đọc và xử lý cảm biến lẫn độ chính xác của biểu diễn được tạo ra.
- *Làm mượt dữ liệu (Smoothing data).* Dữ liệu thô thường có rất nhiều nhiễu hoặc biến động. Biến động điện áp, bụi bẩn trên cảm biến, và vô số nguyên nhân khác có thể khiến hai lần đọc liên tiếp của một cảm biến khác nhau. Làm mượt là một quá trình dùng một chuỗi phép đo theo thời gian để tạo ra một ước tính có xu hướng chính xác hơn các lần đọc đơn lẻ. Tính trung bình trượt (moving average) và dùng bộ lọc Kalman là hai trong số nhiều kỹ thuật làm mượt dữ liệu.
- *Chuyển đổi dữ liệu (Converting data).* Cảm biến có thể báo cáo dữ liệu theo nhiều định dạng—từ số đọc điện áp tính bằng milivôn đến độ cao so với mực nước biển tính bằng feet đến nhiệt độ tính bằng độ C. Tuy nhiên, có thể hai cảm biến khác nhau đo cùng một hiện tượng lại báo cáo dữ liệu theo các định dạng khác nhau. Bộ chuyển đổi chịu trách nhiệm chuyển các số đọc từ bất kỳ dạng nào mà cảm biến báo cáo sang một dạng chung có ý nghĩa với ứng dụng. Như bạn có thể hình dung, chức năng này có thể cần xử lý rất nhiều loại cảm biến.
- *Sensor fusion.* Sensor fusion kết hợp dữ liệu từ nhiều cảm biến để xây dựng một biểu diễn môi trường chính xác hơn, đầy đủ hơn hoặc đáng tin cậy hơn mức có thể từ bất kỳ cảm biến riêng lẻ nào. Ví dụ, làm thế nào một chiếc ô tô nhận ra người đi bộ trên đường đi của nó hoặc có khả năng sẽ ở trên đường đi của nó vào lúc nó đến đó, ngày hay đêm, trong mọi loại thời tiết? Không cảm biến đơn lẻ nào có thể làm được kỳ tích này. Thay vào đó, ô tô phải kết hợp một cách thông minh các đầu vào từ các cảm biến như camera nhiệt, radar, lidar và camera.

<a id="sec18_4"></a>

## 18.4 Tài nguyên (Resources)

Trong mục này, chúng tôi thảo luận tài nguyên tính toán từ góc độ đặc điểm vật lý của chúng. Ví dụ, trong các thiết bị có năng lượng đến từ pin, chúng ta cần quan tâm đến thể tích, trọng lượng và đặc tính nhiệt của pin. Điều tương tự cũng đúng với các tài nguyên như mạng, processor và cảm biến.

Tradeoff trong việc lựa chọn tài nguyên là giữa sự đóng góp của tài nguyên cụ thể đang được xem xét với thể tích, trọng lượng và chi phí của nó. Chi phí luôn là một yếu tố. Chi phí bao gồm cả chi phí sản xuất lẫn chi phí kỹ thuật không lặp lại (nonrecurring engineering). Nhiều hệ thống di động được sản xuất hàng triệu chiếc và rất price-sensitive. Do đó, một khác biệt nhỏ về giá của một processor nhân với hàng triệu bản sao của hệ thống chứa processor đó có thể tạo ra khác biệt đáng kể đối với lợi nhuận của tổ chức sản xuất hệ thống. Chiết khấu số lượng lớn và tái sử dụng phần cứng giữa các sản phẩm khác nhau là những kỹ thuật mà các nhà cung cấp thiết bị dùng để giảm chi phí.

Thể tích, trọng lượng và chi phí là các ràng buộc đến từ cả bộ phận marketing của một tổ chức lẫn các cân nhắc vật lý về việc sử dụng nó. Bộ phận marketing quan tâm đến phản ứng của khách hàng. Các cân nhắc vật lý về việc sử dụng thiết bị phụ thuộc vào cả yếu tố con người lẫn yếu tố sử dụng. Màn hình smartphone phải đủ lớn để con người đọc được; ô tô bị ràng buộc bởi giới hạn trọng lượng trên đường; tàu hỏa bị ràng buộc bởi khổ đường ray; v.v.

Các ràng buộc khác đối với tài nguyên của hệ thống di động (và do đó đối với software architect) phản ánh các yếu tố sau:

- *Các cân nhắc về safety*. Các tài nguyên vật lý có hệ quả về safety không được hỏng hoặc phải có dự phòng. Processor, mạng hoặc cảm biến dự phòng làm tăng chi phí và trọng lượng, cũng như chiếm không gian. Ví dụ, nhiều máy bay có một nguồn điện khẩn cấp có thể được dùng trong trường hợp động cơ hỏng.
- *Giới hạn nhiệt*. Nhiệt có thể được chính hệ thống tạo ra (hãy nghĩ đến đùi bạn nơi đặt chiếc laptop), điều có thể có tác động bất lợi lên performance của hệ thống, thậm chí đến mức gây ra failure. Nhiệt độ môi trường xung quanh—quá cao hoặc quá thấp—cũng có thể có tác động. Cần có hiểu biết về môi trường mà hệ thống sẽ được vận hành trước khi đưa ra các lựa chọn phần cứng.
- *Các mối quan tâm khác về môi trường*. Các mối quan tâm khác bao gồm việc tiếp xúc với các điều kiện bất lợi như độ ẩm hoặc bụi, hoặc việc bị rơi.

### Các mối quan tâm của kiến trúc sư (The Architect’s Concerns)

Kiến trúc sư phải đưa ra một số quyết định quan trọng xoay quanh tài nguyên và việc sử dụng chúng:

- *Giao tác vụ cho các electronic control unit (ECU).* Các hệ thống di động lớn hơn, như ô tô hoặc máy bay, có nhiều ECU với công suất và năng lực khác nhau. Một software architect phải quyết định hệ thống con nào sẽ được giao cho ECU nào. Quyết định này có thể dựa trên một số yếu tố:
- *Mức độ phù hợp của ECU với chức năng*. Các chức năng phải được phân bổ cho các ECU có đủ năng lực để thực hiện chức năng đó. Một số ECU có thể có processor chuyên dụng; ví dụ, một ECU có graphics processor phù hợp hơn cho các chức năng đồ họa.
- *Mức độ then chốt (Criticality)*. Các ECU mạnh hơn có thể được dành cho các chức năng then chốt. Ví dụ, bộ điều khiển động cơ quan trọng hơn và đáng tin cậy hơn hệ thống con về các tính năng tiện nghi.
- *Vị trí trong phương tiện*. Hành khách first-class có thể có kết nối Wi-Fi tốt hơn hành khách second-class.
- *Kết nối*. Một số chức năng có thể được chia cho nhiều ECU. Nếu vậy, chúng phải nằm trên cùng một mạng nội bộ và có thể giao tiếp với nhau.
- *Tính cục bộ của giao tiếp*. Đặt các component giao tiếp dày đặc với nhau trên cùng một ECU sẽ cải thiện performance của chúng và giảm network traffic.
- *Chi phí*. Thông thường một nhà sản xuất muốn giảm thiểu số ECU được triển khai.
- *Chuyển bớt chức năng lên cloud (Offloading functionality to the cloud).* Các ứng dụng như xác định lộ trình và nhận dạng mẫu có thể được thực hiện một phần bởi chính hệ thống di động—nơi đặt các cảm biến—và một phần từ các phần của ứng dụng nằm trên cloud—nơi có nhiều bộ lưu trữ dữ liệu hơn và processor mạnh hơn. Kiến trúc sư phải xác định liệu hệ thống di động có đủ năng lực cho các chức năng cụ thể không, liệu có đủ kết nối để chuyển bớt một số chức năng không, và làm thế nào để thỏa mãn các yêu cầu performance khi các chức năng được chia giữa hệ thống di động và cloud. Kiến trúc sư cũng nên tính đến bộ lưu trữ dữ liệu có sẵn cục bộ, khoảng thời gian cập nhật dữ liệu, và các mối quan tâm về quyền riêng tư.
- *Tắt các chức năng tùy theo chế độ vận hành.* Các hệ thống con không được sử dụng có thể thu nhỏ footprint của mình, cho phép các hệ thống con cạnh tranh truy cập nhiều tài nguyên hơn, và nhờ đó mang lại performance tốt hơn. Trong xe thể thao, một ví dụ là bật “race mode”, chế độ này vô hiệu hóa các process chịu trách nhiệm tính các tham số hệ thống treo thoải mái dựa trên mặt đường và kích hoạt các phép tính phân bổ mô-men xoắn, lực phanh, độ cứng hệ thống treo và lực ly tâm.
- *Chiến lược hiển thị thông tin.* Vấn đề này gắn với độ phân giải màn hình có sẵn. Có thể làm bản đồ kiểu GPS trên một màn hình 320 × 320 pixel, nhưng phải tốn nhiều công sức để giảm thiểu thông tin trên màn hình. Ở độ phân giải 1,280 × 720, có nhiều pixel hơn, nên việc hiển thị thông tin có thể phong phú hơn. (Khả năng thay đổi thông tin trên màn hình là một động lực mạnh cho một pattern như MVC [xem [Chương 13](ch13_usability.vi.md#ch13)] để view có thể được hoán đổi dựa trên đặc điểm cụ thể của màn hình.)

<a id="sec18_5"></a>

## 18.5 Vòng đời (Life Cycle)

Vòng đời của các hệ thống di động có xu hướng có một số đặc thù mà kiến trúc sư cần tính đến, và những đặc thù này khác với các lựa chọn được đưa ra cho các hệ thống truyền thống (không di động). Chúng ta sẽ đi thẳng vào vấn đề.

### Các mối quan tâm của kiến trúc sư (The Architect’s Concerns)

Kiến trúc sư phải quan tâm đến các lựa chọn phần cứng, kiểm thử, deploy bản cập nhật và ghi log. Chúng tôi trình bày chi tiết các mối quan tâm này trong bốn tiểu mục tiếp theo.

#### Phần cứng trước (Hardware First)

Với nhiều hệ thống di động, phần cứng được chọn trước khi phần mềm được thiết kế. Do đó, software architecture phải sống chung với các ràng buộc do phần cứng đã chọn áp đặt.

Các stakeholder chính trong các lựa chọn phần cứng sớm là ban quản lý, bộ phận bán hàng và các cơ quan quản lý. Mối quan tâm của họ thường tập trung vào các cách giảm rủi ro hơn là các cách thúc đẩy quality attribute. Cách tiếp cận tốt nhất cho một software architect là chủ động dẫn dắt những cuộc thảo luận sớm này, nhấn mạnh các tradeoff liên quan, thay vì thụ động chờ đợi kết quả của chúng.

#### Kiểm thử (Testing)

Các thiết bị di động đặt ra một số cân nhắc riêng cho việc kiểm thử:

- *Kiểm thử bố cục hiển thị*. Smartphone và tablet có rất nhiều hình dạng, kích thước và tỷ lệ khung hình khác nhau. Việc xác minh tính đúng đắn của bố cục trên tất cả các thiết bị này là phức tạp. Một số framework của hệ điều hành cho phép user interface được vận hành từ unit test, nhưng có thể bỏ sót một số edge case khó chịu. Ví dụ, giả sử bạn hiển thị các nút điều khiển trên màn hình, với bố cục được đặc tả bằng HTML và CSS, và giả sử nó được tạo tự động cho mọi thiết bị hiển thị bạn dự kiến dùng. Một cách tạo ngây thơ cho một màn hình tí hon có thể tạo ra một nút điều khiển trên một ô 1 × 1 pixel, hoặc các nút điều khiển nằm ngay sát mép màn hình, hoặc các nút điều khiển chồng lên nhau. Những lỗi này có thể dễ dàng lọt qua quá trình kiểm thử.
- *Kiểm thử các edge case vận hành*.
- Một ứng dụng nên sống sót qua việc cạn pin và tắt hệ thống. Việc bảo toàn trạng thái trong những trường hợp như vậy cần được bảo đảm và kiểm thử.
- User interface thường hoạt động bất đồng bộ với phần mềm cung cấp chức năng. Khi user interface không phản ứng đúng, việc tái tạo (re-creating) chuỗi sự kiện gây ra vấn đề là khó khăn vì vấn đề có thể phụ thuộc vào thời điểm, hoặc vào một tập thao tác cụ thể đang diễn ra vào lúc đó.
- *Kiểm thử mức sử dụng tài nguyên*. Một số nhà cung cấp sẽ cung cấp trình mô phỏng thiết bị của họ cho software architect. Điều đó hữu ích, nhưng việc kiểm thử mức sử dụng pin bằng trình mô phỏng là có vấn đề.
- *Kiểm thử việc chuyển mạng*. Việc bảo đảm hệ thống đưa ra lựa chọn tốt nhất khi có nhiều mạng truyền thông sẵn có cũng khó khăn. Khi một thiết bị di chuyển từ mạng này sang mạng khác (ví dụ: từ mạng Wi-Fi sang mạng di động rồi sang một mạng Wi-Fi khác), người dùng không nên nhận ra những chuyển đổi này.

Việc kiểm thử cho các hệ thống giao thông vận tải hoặc công nghiệp có xu hướng diễn ra ở bốn mức: mức software component riêng lẻ, mức chức năng, mức thiết bị và mức hệ thống. Các mức và ranh giới giữa chúng có thể khác nhau tùy hệ thống, nhưng chúng được ngụ ý trong một số quy trình và tiêu chuẩn tham chiếu như Automotive SPICE.

Ví dụ, giả sử chúng ta đang kiểm thử chức năng hỗ trợ giữ làn đường của một chiếc ô tô, trong đó xe giữ nguyên trong làn được xác định bởi các vạch kẻ trên đường, và làm vậy mà không cần đầu vào từ tài xế. Việc kiểm thử hệ thống này có thể giải quyết các mức sau:

1. *Software component*. Một software component phát hiện làn đường sẽ được kiểm thử thông qua các kỹ thuật thông thường cho unit testing và end-to-end testing, với mục tiêu xác nhận tính ổn định và tính đúng đắn của phần mềm.
2. *Chức năng (Function)*. Bước tiếp theo là chạy software component cùng với các component khác của chức năng hỗ trợ giữ làn đường, như một component bản đồ để nhận diện lối ra xa lộ, trong một môi trường mô phỏng. Mục tiêu là xác nhận việc giao tiếp qua interface và tính đồng thời an toàn khi mọi component của chức năng làm việc cùng nhau. Ở đây, các trình mô phỏng được dùng để cung cấp cho chức năng phần mềm các đầu vào tương ứng với một chiếc xe đang chạy trên một con đường có vạch kẻ.
3. *Thiết bị (Device)*. Chức năng hỗ trợ giữ làn đường đã đóng gói, ngay cả khi nó vượt qua các test trong môi trường mô phỏng và trên các máy tính phát triển, cần được deploy lên ECU đích của nó và được kiểm thử ở đó về performance và tính ổn định. Trong giai đoạn kiểm thử thiết bị này, môi trường vẫn được mô phỏng, nhưng lần này thông qua các đầu vào bên ngoài được mô phỏng (message từ các ECU khác, đầu vào cảm biến, v.v.) được kết nối tới các port của ECU.
4. *Hệ thống (System)*. Trong giai đoạn kiểm thử tích hợp hệ thống cuối cùng, mọi thiết bị với mọi chức năng và mọi component được lắp vào các cấu hình full-size, trước tiên trong một phòng thí nghiệm kiểm thử rồi trong một nguyên mẫu thử nghiệm. Ví dụ, chức năng hỗ trợ giữ làn đường có thể được đưa vào kiểm thử, cùng với các tác động của nó lên các chức năng lái và tăng tốc/phanh, trong khi được cung cấp một hình ảnh chiếu hoặc một video về con đường. Vai trò của các test này là xác nhận rằng các hệ thống con đã tích hợp làm việc cùng nhau và mang lại chức năng cũng như các quality attribute của hệ thống mong muốn.

Một điểm quan trọng ở đây là khả năng truy vết test (test traceability): Nếu phát hiện một vấn đề ở bước 4, nó cần có thể tái hiện và truy vết qua mọi thiết lập test, vì một bản sửa sẽ phải đi qua cả bốn mức test một lần nữa.

#### Deploy bản cập nhật (Deploying Updates)

Trong một thiết bị di động, các bản cập nhật cho hệ thống hoặc sửa vấn đề, cung cấp chức năng mới, hoặc cài đặt các tính năng chưa hoàn thiện nhưng có lẽ đã được cài đặt một phần vào thời điểm phát hành trước đó. Một bản cập nhật như vậy có thể nhắm vào phần mềm, dữ liệu, hoặc (ít thường xuyên hơn) phần cứng. Ví dụ, ô tô hiện đại đòi hỏi các bản cập nhật phần mềm, được lấy qua mạng hoặc tải về qua cổng USB. Ngoài việc cung cấp năng lực cập nhật trong khi vận hành, các vấn đề cụ thể sau liên quan đến việc deploy bản cập nhật:

- *Duy trì tính nhất quán dữ liệu*. Với các thiết bị tiêu dùng, việc nâng cấp có xu hướng tự động và one-way (không có cách nào roll back về phiên bản trước). Điều này gợi ý rằng giữ dữ liệu trên cloud là một ý tưởng tốt—nhưng khi đó mọi tương tác giữa cloud và ứng dụng cần được kiểm thử.
- *Safety*. Kiến trúc sư cần xác định trạng thái nào của hệ thống có thể hỗ trợ cập nhật một cách an toàn. Ví dụ, cập nhật phần mềm điều khiển động cơ của một chiếc xe trong khi xe đang chạy trên xa lộ là một ý tưởng tồi. Đến lượt mình, điều này ngụ ý rằng hệ thống cần nhận biết các trạng thái safety-relevant đối với việc cập nhật.
- *Deploy một phần hệ thống*. Re-deploying toàn bộ một ứng dụng hoặc một hệ thống con lớn sẽ tiêu tốn cả băng thông lẫn thời gian. Ứng dụng hoặc hệ thống con nên được thiết kế architecture sao cho các phần thay đổi thường xuyên có thể dễ dàng được cập nhật. Điều này đòi hỏi một loại modifiability cụ thể (xem [Chương 8](ch08_modifiability.vi.md#ch08)) và sự chú ý đến deployability (xem [Chương 5](ch05_deployability.vi.md#ch05)). Ngoài ra, việc cập nhật nên dễ dàng và tự động. Việc truy cập các bộ phận vật lý của một thiết bị để cập nhật chúng có thể bất tiện. Quay lại ví dụ bộ điều khiển động cơ, việc cập nhật phần mềm bộ điều khiển không nên đòi hỏi truy cập vào động cơ.
- *Khả năng mở rộng (Extendability)*. Các hệ thống phương tiện di động có xu hướng có vòng đời tương đối dài. Việc trang bị thêm (retrofitting) cho ô tô, tàu hỏa, máy bay, vệ tinh, v.v. nhiều khả năng sẽ trở nên cần thiết vào một lúc nào đó. Retrofitting có nghĩa là thêm công nghệ mới vào các hệ thống cũ, bằng cách thay thế hoặc bổ sung. Điều này có thể xảy ra vì những lý do sau:
- Component đi đến cuối vòng đời trước khi toàn bộ hệ thống đi đến cuối vòng đời. Cuối vòng đời có nghĩa là việc hỗ trợ sẽ bị ngừng, điều tạo ra rủi ro cao trong trường hợp có failure: Sẽ không có nguồn đáng tin cậy nào để nhận câu trả lời hoặc hỗ trợ với chi phí hợp lý—tức là, mà không phải mổ xẻ và reverse-engineer component đó.
- Công nghệ mới hơn tốt hơn đã ra đời, thúc đẩy một đợt nâng cấp phần cứng/phần mềm. Một ví dụ là trang bị thêm cho một chiếc xe đời những năm 2000s một hệ thống infotainment smartphone-connected thay cho một đầu radio/CD cũ.
- Có sẵn công nghệ mới hơn bổ sung chức năng mà không thay thế chức năng hiện có. Ví dụ, giả sử chiếc xe 2000s-era chưa bao giờ có đầu radio/CD, hoặc thiếu camera lùi.

#### Ghi log (Logging)

Log rất quan trọng khi điều tra và giải quyết các sự cố đã xảy ra hoặc có thể xảy ra. Trong các hệ thống di động, log nên được chuyển ra một vị trí có thể truy cập bất kể khả năng truy cập của chính hệ thống di động. Điều này hữu ích không chỉ cho việc xử lý sự cố, mà còn cho việc thực hiện nhiều loại phân tích khác nhau về việc sử dụng hệ thống. Nhiều ứng dụng phần mềm làm điều tương tự khi chúng gặp vấn đề và xin phép gửi chi tiết cho nhà cung cấp. Đối với các hệ thống di động, năng lực ghi log này đặc biệt quan trọng, và chúng rất có thể sẽ không xin phép để lấy dữ liệu.

<a id="sec18_6"></a>

## 18.6 Tóm tắt (Summary)

Các hệ thống di động trải trên một phạm vi rộng các hình thức và ứng dụng, từ smartphone và tablet đến các phương tiện như ô tô và máy bay. Chúng tôi đã phân loại những khác biệt giữa hệ thống di động và hệ thống cố định dựa trên năm đặc điểm: năng lượng, kết nối, cảm biến, tài nguyên và vòng đời.

Năng lượng trong nhiều hệ thống di động đến từ pin. Pin được giám sát để xác định cả thời gian còn lại của pin lẫn mức sử dụng của từng ứng dụng. Mức sử dụng năng lượng có thể được kiểm soát bằng cách điều tiết từng ứng dụng. Ứng dụng nên được xây dựng để sống sót qua sự cố mất điện và khởi động lại liền mạch khi có điện trở lại.

Kết nối có nghĩa là kết nối với các hệ thống khác và Internet thông qua các phương tiện không dây. Giao tiếp không dây có thể thông qua các protocol short-distance như Bluetooth, các protocol medium-range như các protocol Wi-Fi, và các protocol di động long-distance. Giao tiếp nên liền mạch khi chuyển từ lớp protocol này sang lớp protocol khác, và các cân nhắc như băng thông và chi phí giúp kiến trúc sư quyết định nên hỗ trợ những protocol nào.

Các hệ thống di động dùng nhiều loại cảm biến. Cảm biến cung cấp số đọc về môi trường bên ngoài, mà kiến trúc sư sau đó dùng để phát triển một biểu diễn của môi trường bên ngoài bên trong hệ thống. Số đọc cảm biến được xử lý bởi một sensor stack dành riêng cho mỗi hệ điều hành; các stack này sẽ cung cấp các số đọc có ý nghĩa đối với biểu diễn. Có thể cần nhiều cảm biến để phát triển một biểu diễn có ý nghĩa, với số đọc từ các cảm biến này sau đó được hợp nhất (fuse—tích hợp). Cảm biến cũng có thể bị suy giảm theo thời gian, nên có thể cần nhiều cảm biến để có được một biểu diễn chính xác về hiện tượng đang được đo.

Tài nguyên có các đặc điểm vật lý như kích thước và trọng lượng, có năng lực xử lý, và có chi phí. Các lựa chọn thiết kế bao gồm các tradeoff giữa những yếu tố này. Các chức năng then chốt có thể đòi hỏi tài nguyên mạnh hơn và đáng tin cậy hơn. Một số chức năng có thể được chia giữa hệ thống di động và cloud, và một số chức năng có thể bị tắt ở một số chế độ nhất định để giải phóng tài nguyên cho các chức năng khác.

Các vấn đề life-cycle bao gồm lựa chọn phần cứng, kiểm thử, deploy bản cập nhật và ghi log. Việc kiểm thử user interface có thể phức tạp hơn với hệ thống di động so với hệ thống cố định. Tương tự, deployment phức tạp hơn vì băng thông, các cân nhắc về safety, và các vấn đề khác.

<a id="sec18_7"></a>

## 18.7 Đọc thêm (For Further Reading)

Battery University ([https://batteryuniversity.com/](https://batteryuniversity.com/)) có nhiều tài liệu hơn mức bạn quan tâm về các loại pin khác nhau và cách đo chúng.

Bạn có thể đọc thêm về các network protocol khác nhau tại các trang sau:

[link-labs.com/blog/complete-list-iot-network-protocols](http://link-labs.com/blog/complete-list-iot-network-protocols)

[https://en.wikipedia.org/wiki/Wireless_ad_hoc_network](https://en.wikipedia.org/wiki/Wireless_ad_hoc_network)

[https://searchnetworking.techtarget.com/tutorial/Wireless-protocols-learning-guide](https://searchnetworking.techtarget.com/tutorial/Wireless-protocols-learning-guide)

[https://en.wikipedia.org/wiki/IEEE_802](https://en.wikipedia.org/wiki/IEEE_802)

Bạn có thể tìm hiểu thêm về cảm biến trong [Gajjarby 17].

Một số công cụ kiểm thử cho ứng dụng di động có thể được tìm thấy tại hai trang sau:

[https://codelabs.developers.google.com/codelabs/firebase-test-lab/index.html#0](https://codelabs.developers.google.com/codelabs/firebase-test-lab/index.html#0)

[https://firebase.google.com/products/test-lab](https://firebase.google.com/products/test-lab)

Một số khó khăn liên quan đến việc làm cho xe self-driving an toàn được thảo luận trong “Adventures in Self Driving Car Safety”, bài trình bày của Philip Koopman trên Slideshare: [slideshare.net/PhilipKoopman1/adventures-in-self-driving-car-safety?qid=eb5f5305-45fb-419e-83a5-998a0b667004&v=&b=&from_search=3](http://slideshare.net/PhilipKoopman1/adventures-in-self-driving-car-safety?qid=eb5f5305-45fb-419e-83a5-998a0b667004&v=&b=&from_search=3).

Bạn có thể tìm hiểu về Automotive SPICE tại [automotivespice.com](http://automotivespice.com/).

ISO 26262, “Road Vehicles: Functional Safety”, là một tiêu chuẩn quốc tế về functional safety của các hệ thống điện và/hoặc điện tử ô tô ([iso.org/standard/68383.html](http://iso.org/standard/68383.html)).

<a id="sec18_8"></a>

## 18.8 Câu hỏi thảo luận (Discussion Questions)

1. Bạn sẽ đưa ra những lựa chọn architecture nào để thiết kế một hệ thống có thể chịu được việc mất điện hoàn toàn và có khả năng khởi động lại từ chỗ nó đã dừng mà không làm tổn hại tính toàn vẹn của dữ liệu?
2. Các vấn đề architecture liên quan đến việc chuyển mạng là gì, chẳng hạn như bắt đầu truyền file qua Bluetooth rồi đi ra khỏi phạm vi Bluetooth và chuyển sang Wi-Fi , trong khi vẫn giữ việc truyền tiếp tục liền mạch?
3. Hãy xác định trọng lượng và kích thước pin trong một trong các hệ thống di động của bạn. Bạn nghĩ kiến trúc sư đã thỏa hiệp những gì vì kích thước và trọng lượng?
4. Một công cụ kiểm thử CSS có thể tìm thấy những loại vấn đề nào? Nó bỏ sót những gì? Những cân nhắc này ảnh hưởng đến việc kiểm thử thiết bị di động như thế nào?
5. Hãy xét một tàu thăm dò liên hành tinh như những tàu được dùng trong chương trình thám hiểm sao Hỏa của NASA. Nó có đáp ứng tiêu chí của một thiết bị di động không? Hãy đặc trưng các đặc điểm năng lượng, các vấn đề kết nối mạng (rõ ràng, không loại mạng nào được thảo luận trong [Mục 18.2](#sec18_2) đủ sức đảm đương nhiệm vụ này), cảm biến, các vấn đề tài nguyên, và các cân nhắc life-cycle đặc biệt của nó.
6. Hãy xem tính di động không phải như một lớp hệ thống tính toán, mà như một quality attribute, giống như security hay modifiability. Hãy viết một general scenario cho tính di động (mobility). Hãy viết một mobility scenario cụ thể cho một thiết bị di động do bạn chọn. Hãy mô tả một tập tactic để đạt được quality attribute “mobility”.
7. [Mục 18.5](#sec18_5) đã thảo luận một số khía cạnh của kiểm thử mang tính thách thức hơn trong các hệ thống di động. Những testability tactic nào từ [Chương 12](ch12_testability.vi.md#ch12) có thể giúp giải quyết các vấn đề này?
