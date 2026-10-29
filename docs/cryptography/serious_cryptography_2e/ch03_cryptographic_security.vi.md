# Chương 3: Cryptographic Security

Các định nghĩa security của cryptography không giống với những định nghĩa áp dụng cho computer security nói chung. Khác biệt chính giữa software security và cryptographic security là chúng ta có thể định lượng loại thứ hai. Khác với thế giới software, nơi chúng ta thường nói các ứng dụng hoặc an toàn hoặc không an toàn, trong thế giới cryptography thường có thể tính toán lượng công sức cần thiết để phá một cryptographic algorithm. Ngoài ra, trong khi software security tập trung vào việc ngăn kẻ tấn công lạm dụng code của một chương trình, mục tiêu của cryptographic security là làm cho các bài toán well-defined trở nên không thể giải được.

Các bài toán cryptography liên quan đến các khái niệm toán học nhưng không phải toán học phức tạp—ít nhất là không phải trong cuốn sách này. Chương này đi qua một số security notion như vậy và cách bạn có thể áp dụng chúng để giải quyết các vấn đề real-world. Trong các mục sau, tôi sẽ thảo luận cách định lượng crypto security theo những cách vừa vững chắc về mặt lý thuyết vừa có ý nghĩa thực tế. Tôi sẽ thảo luận các khái niệm unconditional security so với computational security, bit security so với full attack cost, provable security so với heuristic security, và symmetric key generation so với asymmetric key generation. Tôi kết thúc chương bằng các ví dụ real-world về những thất bại của cryptography tưởng chừng như mạnh.

## Định nghĩa điều bất khả thi (Defining the Impossible)

Trong Chương 1, tôi đã mô tả security của một cipher dựa trên khả năng và mục tiêu của kẻ tấn công, và coi một cipher là an toàn nếu không thể đạt được các mục tiêu này với những khả năng đã biết của kẻ tấn công. Nhưng bất khả thi có nghĩa là gì trong bối cảnh này?

Hai notion định nghĩa khái niệm bất khả thi trong cryptography: unconditional security và computational security. Nói một cách đại khái, unconditional security nói về sự bất khả thi về mặt lý thuyết, trong khi computational security nói về sự bất khả thi trong thực tế. Unconditional security không định lượng security vì nó xem một cipher hoặc là an toàn hoặc là không an toàn, không có vùng trung gian; vì vậy nó vô dụng trong thực tế, dù nó đóng vai trò quan trọng trong cryptography lý thuyết. Computational security là thước đo độ mạnh của một cipher có ý nghĩa và thực tế hơn.

### Security trên lý thuyết: unconditional security (Security in Theory: Unconditional Security)

Unconditional security không dựa trên việc phá một cipher khó đến mức nào mà dựa trên việc có thể hình dung ra cách phá nó hay không. Một cipher là unconditionally secure chỉ khi, dù có thời gian tính toán và memory không giới hạn, nó vẫn không thể bị phá. Ngay cả khi một attack thành công vào một cipher phải mất hàng nghìn tỷ năm, cipher như vậy vẫn là unconditionally insecure.

Ví dụ, one-time pad trong Chương 1 là unconditionally secure. Hãy nhớ rằng one-time pad mã hóa một plaintext, P, thành một ciphertext, C = P ⊕ K, trong đó K là một bit string ngẫu nhiên, duy nhất cho mỗi plaintext. Cipher này là unconditionally secure vì, khi có một ciphertext và thời gian không giới hạn để thử mọi key K khả dĩ và tính plaintext tương ứng, P, bạn vẫn không thể xác định được K đúng, vì có bao nhiêu K khả dĩ thì có bấy nhiêu P khả dĩ.

### Security trong thực tế: computational security (Security in Practice: Computational Security)

Khác với unconditional security, computational security xem một cipher là an toàn nếu nó không thể bị phá trong một khoảng thời gian hợp lý và với các tài nguyên hợp lý như memory, hardware, ngân sách và năng lượng. Computational security là một cách để định lượng security của một cipher hoặc bất kỳ crypto algorithm nào.

Ví dụ, hãy xét một cipher, E, mà bạn biết một cặp plaintext–ciphertext (P, C) nhưng không biết key 128-bit, K, dùng để tính C = E(K, P). Cipher này không unconditionally secure vì bạn có thể phá nó sau khi thử 2<sup>128</sup> giá trị K 128-bit khả dĩ cho đến khi tìm ra giá trị thỏa mãn E(K, P) = C. Nhưng trong thực tế, ngay cả khi thử 100 tỷ key mỗi giây, sẽ mất hơn 100,000,000,000,000,000,000 năm. Nói cách khác, xét một cách hợp lý, cipher này là computationally secure vì thực tế không thể phá được nó.

Chúng ta có thể biểu diễn computational security theo hai giá trị:

• t, là giới hạn về số phép toán mà một kẻ tấn công sẽ thực hiện

• ε (epsilon), là giới hạn về xác suất thành công của một attack

Khi đó, chúng ta nói rằng một cryptographic scheme là (t, ε)-secure nếu một kẻ tấn công thực hiện tối đa t phép toán—bất kể đó là những phép toán gì—có xác suất thành công không cao hơn ε, trong đó ε tối thiểu là 0 và tối đa là 1. Computational security đưa ra một giới hạn về việc phá một cryptographic algorithm khó đến mức nào.

Hãy nhận thức rằng t và ε chỉ là các giới hạn: nếu một cipher là (t, ε)-secure, thì không kẻ tấn công nào thực hiện ít hơn t phép toán sẽ thành công (với xác suất ε). Tuy nhiên, điều này không có nghĩa là một kẻ tấn công thực hiện đúng t phép toán sẽ thành công, và nó cũng không cho biết số phép toán cần thiết, con số có thể lớn hơn t rất nhiều. Chúng ta nói t là một cận dưới (lower bound) của công sức tính toán cần thiết vì bạn sẽ cần ít nhất t phép toán để xâm phạm security.

Nếu chúng ta biết chính xác cần bao nhiêu công sức để phá một cipher, chúng ta nói rằng (t, ε)-security cho chúng ta một cận chặt (tight bound) khi tồn tại một attack phá được cipher với xác suất ε và đúng t phép toán.

Ví dụ, hãy xét một symmetric cipher có key 128-bit. Lý tưởng nhất, cipher này phải là (t, t/2<sup>128</sup>)-secure với mọi giá trị t nằm giữa 1 và 2<sup>128</sup>. Attack tốt nhất phải là brute force (thử mọi key cho đến khi tìm ra key đúng). Bất kỳ attack nào tốt hơn sẽ phải khai thác một điểm không hoàn hảo nào đó của cipher, vì vậy chúng ta cố gắng tạo ra các cipher mà brute force là attack tốt nhất có thể.

Với phát biểu (t, t/2<sup>128</sup>)-secure, hãy xem xét xác suất thành công của ba attack khả dĩ:

• Trong trường hợp thứ nhất, t = 1, kẻ tấn công thử một key và thành công với xác suất ε = 1/2<sup>128</sup>.

• Trong trường hợp thứ hai, t = 2<sup>128</sup>, kẻ tấn công thử cả 2<sup>128</sup> key, và một key thành công. Vì vậy, xác suất ε = 1. (Nếu kẻ tấn công thử mọi key, thì key đúng chắc chắn nằm trong số đó.)

• Trong trường hợp thứ ba, kẻ tấn công chỉ thử t = 2<sup>64</sup> key và thành công với xác suất ε = 2<sup>64</sup>/2<sup>128</sup> = 2<sup>−64</sup>. Khi kẻ tấn công chỉ thử một phần trong số mọi key, xác suất thành công tỷ lệ với số key đã thử.

Chúng ta có thể kết luận rằng một cipher có key n bit tốt nhất cũng chỉ là (t, t/2<sup>n</sup>)-secure, với mọi t nằm giữa 1 và 2<sup>n</sup>, vì dù cipher có mạnh đến đâu, một brute-force attack nhắm vào nó vẫn luôn thành công. Do đó, key cần đủ dài để vô hiệu hóa các brute-force attack trong thực tế.

> **LƯU Ý** Trong ví dụ này, chúng ta đang đếm số lần tính cipher, chứ không phải thời gian tuyệt đối hay số chu kỳ clock của bộ xử lý. Computational security không phụ thuộc vào công nghệ (technology agnostic), nghĩa là một cipher (t, ε)-secure hôm nay cũng sẽ là (t, ε)-secure vào ngày mai—nhưng những gì được coi là an toàn trong thực tế hôm nay có thể không còn được coi là an toàn vào ngày mai.

## Định lượng security (Quantifying Security)

Khi đã tìm ra một attack, trước tiên bạn nên xác định nó hiệu quả đến mức nào trên lý thuyết và thực tế đến mức nào, nếu có. Tương tự, với một cipher được cho là an toàn, bạn sẽ muốn biết nó có thể chịu được khối lượng công việc bao nhiêu. Để trả lời những câu hỏi đó, tôi sẽ giải thích cách chúng ta đo cryptographic security theo bit (góc nhìn lý thuyết) và những yếu tố nào ảnh hưởng đến chi phí thực tế của một attack.

### Đo security theo bit (Measuring Security in Bits)

Khi nói về computational security, một cipher là t-secure khi một attack thành công cần ít nhất t phép toán. Vì vậy, chúng ta tránh được ký hiệu (t, ε) không trực quan bằng cách giả định một xác suất thành công ε gần với 1, hoặc bất kỳ xác suất nào chúng ta quan tâm trong thực tế. Khi đó, chúng ta biểu diễn security theo bit, trong đó “n-bit security” nghĩa là chúng ta cần khoảng 2<sup>n</sup> phép toán để xâm phạm một security notion cụ thể nào đó.

Nếu bạn biết xấp xỉ cần bao nhiêu phép toán để phá một cipher, bạn có thể xác định security level của nó theo bit bằng cách lấy logarit nhị phân của số phép toán: nếu cần 1,000,000 phép toán, security level là log<sub>2</sub>(1,000,000), hay khoảng 20 bit (vì 1,000,000 xấp xỉ bằng 2<sup>20</sup>). Hãy nhớ rằng một key n-bit sẽ cho tối đa n-bit security vì một brute-force attack với cả 2<sup>n</sup> key khả dĩ sẽ luôn thành công. Nhưng kích thước key không phải lúc nào cũng khớp với security level—nó chỉ cho một cận trên (upper bound), tức là security level cao nhất có thể.

Security level có thể nhỏ hơn kích thước key vì một trong hai lý do:

• Một attack đã phá được cipher với ít phép toán hơn dự kiến—ví dụ, dùng một phương pháp khôi phục key bằng cách chỉ thử một tập con của 2<sup>n</sup> key.

• Security level của cipher được cố ý làm khác với kích thước key của nó, như với phần lớn các public-key algorithm. Ví dụ, algorithm RSA với các phần tử private-key 1,024-bit (do đó với modulus 2,048-bit) cung cấp ít hơn 128-bit security.

Bit security tỏ ra hữu ích khi so sánh security level của các cipher, nhưng nó không cung cấp đủ thông tin về chi phí thực tế của một attack. Đôi khi nó là một sự trừu tượng hóa quá đơn giản vì nó giả định rằng một cipher n-bit-secure cần 2<sup>n</sup> phép toán để phá, bất kể đó là những phép toán gì. Vì vậy, hai cipher có cùng mức bit security có thể có các security level real-world khác nhau rất nhiều khi bạn tính đến chi phí thực tế của một attack đối với một kẻ tấn công thực.

Giả sử chúng ta có hai cipher, mỗi cipher có key 128-bit và security 128-bit. Chúng ta phải tính mỗi cipher 2<sup>128</sup> lần để phá nó, nhưng cipher thứ hai chậm hơn cipher thứ nhất 100 lần. Vì vậy, tính cipher thứ hai 2<sup>128</sup> lần mất thời gian tương đương 100 × 2<sup>128</sup>≈ 2<sup>134.64</sup> lần tính cipher thứ nhất. Nếu đếm theo cipher thứ nhất, nhanh, thì phá cipher chậm hơn cần 2<sup>134.64</sup> phép toán. Nếu đếm theo cipher thứ hai, chậm, thì chỉ cần 2<sup>128</sup> phép toán. Vậy chúng ta có nên nói rằng cipher thứ hai mạnh hơn cipher thứ nhất không? Về nguyên tắc là có, nhưng chúng ta hiếm khi thấy một khác biệt hiệu năng hundred-fold như vậy giữa các cipher thông dụng.

Định nghĩa không nhất quán về một phép toán còn gây thêm khó khăn khi so sánh hiệu quả của các attack. Một số attack tuyên bố làm giảm security của một cipher vì chúng thực hiện 2<sup>120</sup> lần tính một phép toán nào đó thay vì 2<sup>128</sup> lần tính cipher, nhưng tốc độ của từng loại attack lại bị bỏ ra ngoài phân tích. Attack 2<sup>120</sup>-operation không phải lúc nào cũng nhanh hơn một brute-force attack 2<sup>128</sup>.

Dù vậy, bit security vẫn là một notion hữu ích chừng nào phép toán được định nghĩa hợp lý—nghĩa là nhanh xấp xỉ bằng một lần tính cipher. Suy cho cùng, trong đời thực, tất cả những gì cần để xác định một security level có đủ hay không chỉ là một bậc độ lớn.

### Tính full attack cost (Calculating the Full Attack Cost)

Bit security biểu diễn chi phí của attack nhanh nhất nhắm vào một cipher bằng cách ước lượng bậc độ lớn của số phép toán mà nó cần để thành công. Nhưng còn những yếu tố khác ảnh hưởng đến chi phí của một attack, và chúng ta phải tính đến chúng khi ước lượng security level thực tế. Tôi sẽ giải thích bốn yếu tố chính: parallelism, memory, precomputation và số lượng mục tiêu.

#### Parallelism

Yếu tố đầu tiên cần xem xét là computational parallelism—tức là khả năng implementation của attack tận dụng tính toán song song, chẳng hạn các hệ thống multicore.

Ví dụ, hãy xét hai attack sau, mỗi attack gồm 2<sup>56</sup> phép toán:

• Attack thứ nhất thực hiện 2<sup>56</sup> phép toán phụ thuộc tuần tự, tính x<sub>i</sub> <sub>+</sub> <sub>1</sub> = f<sub>i</sub>(x<sub>i</sub>) với một x<sub>0</sub> cố định nào đó và các function phân biệt f<sub>i</sub> (với i từ 1 đến 2<sup>56</sup>).

• Attack thứ hai thực hiện 2<sup>56</sup> phép toán độc lập, tính x<sub>i</sub> = f<sub>i</sub>(x) với một x cố định nào đó và các function phân biệt f<sub>i</sub> (với i từ 1 đến 2<sup>56</sup>). Nó có thể thực thi các phép tính f<sub>i</sub>(x) song song vì mỗi f<sub>i</sub>(x) độc lập với các phép tính khác.

Khác biệt giữa hai attack là người ta có thể song song hóa attack thứ hai nhưng không thể song song hóa attack thứ nhất. Xử lý song song có thể nhanh hơn xử lý tuần tự nhiều bậc độ lớn. Ví dụ, nếu bạn có sẵn 2<sup>16</sup> = 65,536 bộ xử lý, bạn có thể chia khối lượng công việc của attack song song thành 2<sup>16</sup> tác vụ độc lập, mỗi tác vụ thực hiện 2<sup>56</sup>/ 2<sup>16</sup> = 2<sup>40</sup> phép toán. Tuy nhiên, attack thứ nhất không thể hưởng lợi từ việc có nhiều core vì mỗi phép toán dựa vào kết quả của phép toán trước đó. Do đó, attack song song sẽ hoàn thành nhanh hơn attack tuần tự 65,536 lần, dù chúng thực hiện cùng một số phép toán.

> **LƯU Ý** Những algorithm trở nên nhanh hơn N lần khi bị tấn công lúc có sẵn N core được gọi là embarrassingly parallel; thời gian thực thi của chúng tỷ lệ tuyến tính với số core tính toán.

#### Memory

Yếu tố thứ hai khi xác định chi phí của một attack là memory. Chúng ta đánh giá các cryptanalytic attack theo việc sử dụng thời gian và không gian của chúng: Chúng thực hiện bao nhiêu phép toán theo thời gian, chúng tiêu tốn bao nhiêu memory hay không gian, chúng sử dụng không gian đã tiêu tốn như thế nào, và tốc độ của memory có sẵn là bao nhiêu? Đáng tiếc là bit security chỉ tập trung vào thời gian cần để thực hiện một attack.

Về cách một attack sử dụng không gian, điều quan trọng là phải xét attack cần bao nhiêu lần tra cứu memory (memory lookup), tốc độ truy cập memory (có thể khác nhau giữa đọc và ghi), kích thước dữ liệu được truy cập, access pattern (địa chỉ memory liên tiếp hay ngẫu nhiên), và cách attack cấu trúc dữ liệu trong memory. Ví dụ, trên một bộ xử lý Intel Xeon 8380 Ice Lake năm 2021, truy cập một register mất 1 chu kỳ clock, truy cập cache L1 (48kB) mất 5 chu kỳ, truy cập cache L2 (1.25MB) mất 14 chu kỳ, truy cập cache L3 (60MB) mất 63.5 chu kỳ, còn truy cập DRAM thì tốt nhất cũng chỉ nhanh bằng nhưng thường chậm hơn nhiều so với truy cập cache L3 (độ trễ chính xác phụ thuộc vào nhiều yếu tố).

#### Precomputation

Các phép toán precomputation chỉ cần được thực hiện một lần và có thể được dùng lại trong các lần thực thi attack sau đó. Đôi khi chúng ta gọi precomputation là giai đoạn offline của một attack.

Hãy xét time-memory trade-off attack, trong đó kẻ tấn công thực hiện một phép tính khổng lồ tạo ra các lookup table lớn, mà chúng ta sau đó lưu trữ và dùng lại để thực hiện attack thực sự. Ví dụ, một attack nhắm vào mã hóa di động 2G đã mất hai tháng để xây dựng lượng bảng cỡ 2TB, mà kẻ tấn công sau đó dùng để phá mã hóa trong 2G và khôi phục một secret session key chỉ trong vài giây.

#### Số lượng mục tiêu (Number of Targets)

Cuối cùng, chúng ta đến với số lượng mục tiêu của attack. Số mục tiêu càng lớn thì attack surface càng lớn, và kẻ tấn công càng biết được nhiều hơn về các key mà họ nhắm tới.

Ví dụ, hãy xét một brute-force key search: nếu bạn nhắm vào một key n-bit duy nhất, sẽ cần 2<sup>n</sup> lần thử để chắc chắn tìm ra key đúng. Nếu bạn nhắm vào nhiều key n-bit—chẳng hạn một số lượng M—và nếu với một P duy nhất bạn có M ciphertext phân biệt, trong đó C = E(K, P) với mỗi key K trong số M key mà bạn nhắm tới, thì sẽ lại cần 2<sup>n</sup> lần thử để tìm ra mỗi key. Nhưng nếu bạn chỉ quan tâm đến ít nhất một trong M key chứ không phải tất cả, thì trung bình sẽ cần 2<sup>n</sup>/M lần thử để thành công. Ví dụ, để phá một key 128-bit trong số 2<sup>16</sup> = 65,536 key mục tiêu, trung bình sẽ cần 2<sup>128 − 16</sup> = 2<sup>112</sup> lần tính cipher. Tức là chi phí (và tốc độ) của attack giảm khi số lượng mục tiêu tăng.

### Chọn và đánh giá security level (Choosing and Evaluating Security Levels)

Việc chọn một security level thường liên quan đến việc lựa chọn giữa các security level 128-bit và 256-bit có sẵn trong phần lớn các crypto algorithm và implementation tiêu chuẩn. Bạn sẽ gặp các scheme với security 64- hoặc 80-bit, nhưng những scheme này thường không đủ an toàn cho việc sử dụng real-world.

Nói một cách tổng quát, security 128-bit nghĩa là bạn sẽ cần thực hiện xấp xỉ 2<sup>128</sup> phép toán để phá cryptosystem đó. Để bạn hình dung con số này có ý nghĩa gì, hãy xét thực tế rằng vũ trụ có tuổi xấp xỉ 2<sup>88</sup> nano giây (có một tỷ nano giây trong một giây). Vì việc thử một key với công nghệ ngày nay mất không dưới một nano giây, bạn sẽ cần gấp vài lần tuổi của vũ trụ để một attack thành công (chính xác là 2<sup>40</sup> lần).

Nhưng chẳng lẽ parallelism và việc có nhiều mục tiêu không thể giảm đáng kể thời gian cần để hoàn thành một attack thành công sao? Không hẳn. Giả sử bạn muốn phá bất kỳ một mục tiêu nào trong số một triệu mục tiêu và bạn có sẵn một triệu core song song. Điều đó đưa thời gian tìm kiếm từ 2<sup>128</sup> xuống còn (2<sup>128</sup>/ 2<sup>20</sup>) / 2<sup>20</sup> = 2<sup>88</sup>, tương đương với “chỉ” một vòng đời của vũ trụ.

Một điều khác cần xem xét khi đánh giá security level là sự phát triển của công nghệ. Định luật Moore (Moore’s law) cho rằng hiệu năng tính toán tăng gấp đôi khoảng mỗi hai năm. Chúng ta có thể xem điều này như việc mất 1 bit security mỗi hai năm: nếu hôm nay một ngân sách $1,000 cho phép bạn phá, chẳng hạn, một key 40-bit trong một giờ, thì định luật Moore nói rằng hai năm sau, bạn có thể phá một key 41-bit trong một giờ với cùng ngân sách $1,000 (tôi đang đơn giản hóa). Từ đó, chúng ta có thể ngoại suy để nói rằng, theo định luật Moore, chúng ta sẽ có ít hơn 40 bit security sau 80 năm so với ngày nay. Nói cách khác, sau 80 năm, việc thực hiện 2<sup>128</sup> phép toán có thể tốn ngang việc thực hiện 2<sup>88</sup> phép toán ngày nay. Tính cả parallelism và nhiều mục tiêu, chúng ta còn lại 2<sup>48</sup> nano giây tính toán, hay khoảng ba ngày. Nhưng phép ngoại suy này rất thiếu chính xác vì định luật Moore sẽ không và không thể mở rộng đến mức đó. Dù vậy, bạn hiểu ý rồi đấy: những gì trông có vẻ bất khả thi hôm nay có thể trở thành hiện thực trong một thế kỷ.

Sẽ có những lúc một security level thấp hơn 128 bit là hợp lý, chẳng hạn khi bạn cần security trong một khoảng thời gian ngắn và khi chi phí hiện thực một security level cao hơn sẽ ảnh hưởng tiêu cực đến chi phí hoặc khả năng sử dụng của hệ thống. Một ví dụ là các hệ thống truyền hình trả tiền (pay-TV), trong đó encryption key dài 48 hoặc 64 bit. Điều này nghe có vẻ thấp một cách lố bịch nhưng lại đủ, vì key được làm mới cứ mỗi 5 hoặc 10 giây.

Dù vậy, để bảo đảm long-term security, bạn nên chọn security 256-bit hoặc thấp hơn một chút. Ngay cả trong kịch bản worst-case—sự tồn tại của quantum computer (xem Chương 14)—chúng ta cũng khó có thể phá một scheme 256-bit secure trong tương lai gần. Security trên 256 bit thực tế là không cần thiết, ngoại trừ như một công cụ marketing.

Như cryptographer John Kelsey từng nói: “Sự khác biệt giữa 80 bit và 128 bit của key search giống như sự khác biệt giữa một sứ mệnh lên sao Hỏa và một sứ mệnh tới Alpha Centauri. Theo như tôi thấy, không có khác biệt có ý nghĩa nào giữa key 192-bit và 256-bit xét về các brute-force attack thực tế; bất khả thi là bất khả thi.”

## Đạt được security (Achieving Security)

Khi đã chọn được một security level, điều quan trọng là phải bảo đảm rằng các cryptographic scheme của bạn sẽ tuân thủ nó. Nói cách khác, bạn muốn có sự tin tưởng, chứ không chỉ là hy vọng và sự bất định, rằng mọi thứ sẽ hoạt động như dự kiến, mọi lúc.

Khi xây dựng sự tin tưởng vào security của một crypto algorithm, bạn có thể dựa vào các chứng minh toán học, một cách tiếp cận mà chúng ta gọi là provable security, hoặc dựa vào bằng chứng về những lần thử phá algorithm thất bại, mà tôi sẽ gọi là heuristic security (dù đôi khi nó được gọi là probable security). Hai cách tiếp cận này bổ sung cho nhau, và không cách nào tốt hơn cách nào, như bạn sẽ thấy.

### Provable Security

Provable security là việc chứng minh rằng phá crypto scheme của bạn ít nhất cũng khó bằng việc giải một bài toán khác đã được biết là khó. Một security proof như vậy bảo đảm rằng crypto vẫn an toàn chừng nào bài toán khó vẫn còn khó. Loại chứng minh này được gọi là reduction, và nó đến từ lĩnh vực complexity theory. Chúng ta nói bài toán X có thể quy về (reducible to) việc phá một cipher nào đó nếu bất kỳ phương pháp nào để phá cipher cũng cho ra một phương pháp để giải bài toán X. Một reduction như vậy bảo đảm rằng chừng nào bài toán X còn khó, cipher còn an toàn.

Security proof có hai dạng, tùy thuộc vào loại bài toán được cho là khó mà bạn dùng: chứng minh dựa trên một bài toán toán học và chứng minh dựa trên một bài toán cryptography.

#### Chứng minh dựa trên một bài toán toán học (Proofs Relative to a Mathematical Problem)

Nhiều security proof (chẳng hạn những chứng minh cho public-key crypto) cho thấy rằng phá một crypto scheme ít nhất cũng khó bằng việc giải một bài toán toán học khó nào đó. Chúng ta đang nói đến những bài toán mà ta biết lời giải tồn tại và dễ kiểm chứng khi đã biết nó, nhưng lại khó tìm ra về mặt tính toán.

> **LƯU Ý** Không có chứng minh thực sự nào rằng những bài toán toán học trông có vẻ khó thực sự là khó. Thực tế, chứng minh điều này cho một lớp bài toán cụ thể là một trong những thách thức lớn nhất trong lĩnh vực complexity theory. Tại thời điểm tôi viết những dòng này, có một giải thưởng $1,000,000 dành cho bất kỳ ai chứng minh được điều này, do Clay Mathematics Institute trao. Tôi sẽ thảo luận chi tiết hơn về điều này trong Chương 9.

Ví dụ, hãy xét thách thức giải factoring problem, bài toán toán học best-known trong crypto: cho một số mà bạn biết là tích của hai số nguyên tố (n = pq), hãy tìm hai số nguyên tố đó. Ví dụ, nếu n = 15, câu trả lời là 3 và 5. Điều đó dễ với một số nhỏ, nhưng trở nên khó hơn theo hàm mũ khi kích thước của số tăng lên. Ví dụ, nếu một số, n, dài từ 3,000 bit (khoảng 900 chữ số thập phân) trở lên, việc phân tích thừa số được cho là thực tế không khả thi.

Rivest–Shamir–Adleman (RSA) là crypto scheme nổi tiếng nhất dựa trên factoring problem: RSA mã hóa một plaintext, P, được xem như một số lớn, bằng cách tính C = P<sup>e</sup> mod n, trong đó số e và n = pq là public key. Decryption khôi phục plaintext từ ciphertext bằng cách tính P = C<sup>d</sup> mod n, trong đó d là private key gắn với e và n. Nếu chúng ta có thể phân tích n thành thừa số, thì chúng ta có thể phá RSA (bằng cách khôi phục private key từ public key), và nếu chúng ta có được private key, thì chúng ta có thể phân tích n thành thừa số (ví dụ, xem bài viết tại https://eprint.iacr.org/2004/208). Nói cách khác, khôi phục một RSA private key và phân tích n thành thừa số là những bài toán khó tương đương nhau. Đó là loại reduction mà chúng ta tìm kiếm trong provable security. Tuy nhiên, không có gì bảo đảm rằng khôi phục một RSA plaintext khó bằng việc phân tích n thành thừa số, vì việc biết một plaintext không để lộ private key.

#### Chứng minh dựa trên một bài toán crypto khác (Proofs Relative to Another Crypto Problem)

Thay vì so sánh một crypto scheme với một bài toán toán học, bạn có thể so sánh nó với một crypto scheme khác và chứng minh rằng bạn chỉ có thể phá scheme thứ hai nếu bạn có thể phá scheme thứ nhất. Các security proof cho symmetric cipher thường đi theo cách tiếp cận này.

Ví dụ, nếu tất cả những gì bạn có là một permutation algorithm duy nhất, thì bạn có thể xây dựng các symmetric cipher, random bit generator và các crypto object khác như hash function bằng cách kết hợp các lời gọi tới permutation với nhiều loại đầu vào khác nhau (như bạn sẽ thấy trong Chương 6). Khi đó, các chứng minh cho thấy các scheme mới được tạo ra là an toàn nếu permutation an toàn. Nói cách khác, chúng ta biết rằng algorithm mới được tạo ra không yếu hơn algorithm ban đầu. Các chứng minh như vậy thường hoạt động bằng cách xây dựng một attack nhắm vào thành phần nhỏ hơn, khi có một attack nhắm vào thành phần lớn hơn—tức là bằng cách chỉ ra một reduction.

Khi chứng minh rằng một crypto algorithm không yếu hơn một algorithm khác, lợi ích chính là attack surface được thu nhỏ: thay vì phân tích cả core algorithm lẫn tổ hợp, bạn chỉ cần xem xét core algorithm của cipher mới. Cụ thể, nếu bạn viết một cipher dùng một permutation mới được phát triển và một tổ hợp mới, bạn có thể chứng minh rằng tổ hợp đó không làm suy yếu security so với core algorithm. Do đó, để phá tổ hợp, bạn cần phá permutation mới.

#### Những điểm cần lưu ý (Caveats)

Các nhà nghiên cứu cryptography dựa rất nhiều vào security proof, dù là đối với các scheme dựa trên bài toán toán học hay đối với các crypto scheme khác. Nhưng sự tồn tại của một security proof không bảo đảm rằng một cryptographic scheme là hoàn hảo, cũng không phải là cái cớ để xem nhẹ những khía cạnh thực tế hơn của implementation. Suy cho cùng, như cryptographer Lars Knudsen từng nói: “Nếu nó provably secure, thì có lẽ nó không phải vậy,” nghĩa là một security proof không nên được xem như một bảo đảm tuyệt đối về security. Tệ hơn nữa, có nhiều lý do khiến một scheme “provably secure” có thể dẫn đến thất bại về security.

Một vấn đề nằm ở chính cụm từ “proof of security”. Trong toán học, một chứng minh là sự chứng tỏ một chân lý tuyệt đối, nhưng trong crypto, một chứng minh chỉ là sự chứng tỏ một chân lý tương đối. Ví dụ, một chứng minh rằng cipher của bạn khó phá như việc tính discrete logarithm—tìm số x khi cho g và g<sup>x</sup> mod n—bảo đảm rằng nếu cipher của bạn thất bại, rất nhiều cipher khác cũng sẽ thất bại theo, và sẽ chẳng ai trách bạn nếu điều tồi tệ nhất xảy ra.

Một điểm cần lưu ý khác là người ta thường chứng minh security đối với một security notion duy nhất. Ví dụ, bạn có thể chứng minh rằng khôi phục private key của một cipher khó như factoring problem. Nhưng nếu bạn có thể khôi phục plaintext từ ciphertext mà không cần key, bạn sẽ bỏ qua được chứng minh đó, và việc khôi phục key hầu như chẳng còn quan trọng.

Thêm nữa, chứng minh không phải lúc nào cũng đúng, và có thể phá một algorithm dễ hơn so với suy nghĩ ban đầu.

> **LƯU Ý** Đáng tiếc là có ít nhà nghiên cứu kiểm tra cẩn thận các security proof, vốn thường dài hàng chục trang, do đó làm phức tạp việc kiểm soát chất lượng. Dù vậy, việc chứng tỏ một chứng minh là sai không nhất thiết có nghĩa là mục tiêu của chứng minh hoàn toàn sai; nếu kết quả đúng, người ta có thể cứu vãn chứng minh bằng cách sửa các lỗi của nó.

Một điểm quan trọng khác cần xem xét là các bài toán toán học khó đôi khi hóa ra dễ giải hơn dự kiến. Ví dụ, một số tham số yếu nhất định khiến việc phá RSA cryptosystem trở nên dễ dàng. Hoặc bài toán toán học có thể khó trong một số trường hợp nhất định nhưng không khó trung bình, như thường xảy ra khi bài toán tham chiếu còn mới và chưa được hiểu rõ. Đó là điều đã xảy ra khi knapsack encryption scheme năm 1978 của Merkle và Hellman sau đó bị phá bằng các kỹ thuật lattice reduction.

Cuối cùng, dù chứng minh security của một algorithm có thể ổn, implementation của algorithm vẫn có thể yếu. Ví dụ, kẻ tấn công có thể khai thác thông tin side-channel như mức tiêu thụ điện hoặc thời gian thực thi để biết về các thao tác bên trong của một algorithm nhằm phá nó, do đó bỏ qua được chứng minh. Hoặc người hiện thực có thể dùng sai crypto scheme: nếu algorithm quá phức tạp với quá nhiều nút điều chỉnh cần cấu hình, khả năng người dùng hoặc developer cấu hình sai sẽ cao hơn, điều có thể khiến algorithm hoàn toàn không an toàn.

### Heuristic Security

Provable security là một công cụ tuyệt vời để có được sự tin tưởng vào một crypto scheme, nhưng nó không áp dụng được cho mọi loại algorithm. Thực tế, phần lớn symmetric cipher không có security proof. Ví dụ, hằng ngày chúng ta dựa vào AES để liên lạc an toàn bằng điện thoại di động, laptop và máy tính để bàn, nhưng AES không provably secure; không có chứng minh nào rằng nó khó phá như một bài toán well-known nào đó. AES không thể được liên hệ với một bài toán toán học hay với một algorithm khác vì bản thân nó chính là bài toán khó.

Trong những trường hợp provable security không áp dụng được, lý do duy nhất để tin một cipher là vì nhiều người giỏi đã cố phá nó và thất bại. Chúng ta gọi đây là heuristic security.

Khi nào chúng ta có thể chắc chắn một cipher là an toàn? Chúng ta không bao giờ có thể chắc chắn, nhưng chúng ta có thể khá tin tưởng rằng một algorithm sẽ không bị phá khi hàng trăm cryptanalyst có kinh nghiệm, mỗi người đã bỏ ra hàng trăm giờ cố gắng phá nó và công bố những phát hiện của mình—thường là bằng cách thử tấn công các phiên bản đơn giản hóa của một cipher (thường là các phiên bản có ít phép toán hơn, hay ít round hơn, round là những chuỗi phép toán ngắn mà cipher lặp lại để trộn các bit với nhau).

Khi phân tích một cipher mới, các cryptanalyst trước tiên thử phá một round, rồi hai, ba, hay nhiều round nhất có thể. Khi đó, security margin là hiệu giữa tổng số round và số round đã bị tấn công thành công. Sau nhiều năm nghiên cứu, nếu security margin của một cipher vẫn cao, chúng ta trở nên tin tưởng rằng nó (có lẽ) an toàn.

## Tạo key (Generating Keys)

Nếu bạn định mã hóa thứ gì đó, bạn sẽ phải tạo key, dù đó là các “session key” tạm thời (như những key được tạo ra khi duyệt một site HTTPS) hay các public key long-term. Hãy nhớ lại từ Chương 2 rằng secret key là cốt lõi của cryptographic security và phải được tạo ngẫu nhiên để chúng không thể đoán trước và bí mật.

Ví dụ, khi bạn duyệt một website HTTPS, trình duyệt của bạn nhận public key của site và dùng nó để thiết lập một symmetric key chỉ có hiệu lực cho phiên hiện tại, còn public key của site đó và private key gắn với nó có thể có hiệu lực trong nhiều năm. Vì vậy, tốt hơn hết là kẻ tấn công phải khó tìm ra nó. Nhưng tạo một secret key không phải lúc nào cũng đơn giản như việc lấy ra đủ số bit pseudorandom. Chúng ta có thể tạo cryptographic key theo một trong ba cách:

• Ngẫu nhiên, dùng một PRNG cung cấp dữ liệu cho một algorithm key-generation

• Từ một mật khẩu, dùng một password-based key derivation function (PBKDF), biến mật khẩu user-supplied thành một key

• Thông qua một key agreement protocol, là một chuỗi các lần trao đổi message giữa hai hoặc nhiều bên, kết thúc bằng việc thiết lập một key dùng chung

Bây giờ, tôi sẽ giải thích phương pháp đơn giản nhất: tạo ngẫu nhiên (randomized generation).

### Symmetric Key (Symmetric Keys)

Symmetric key là secret key được hai bên dùng chung, và chúng là loại đơn giản nhất để tạo. Chúng thường có cùng độ dài với security level mà chúng cung cấp: một key 128-bit cung cấp security 128-bit, và bất kỳ key nào trong số 2<sup>128</sup> key khả dĩ đều hợp lệ.

Để tạo một symmetric key n bit bằng một cryptographic PRNG, bạn chỉ cần yêu cầu nó cung cấp n bit pseudorandom và dùng các bit đó làm key. Chỉ có vậy. Ví dụ, bạn có thể dùng bộ công cụ OpenSSL để tạo một symmetric key ngẫu nhiên bằng cách xuất ra các byte pseudorandom, như trong lệnh sau:

```
$ openssl rand -hex 16
65a4400ea649d282b855bd2e246812c6
```

Tất nhiên, kết quả của bạn sẽ khác kết quả của tôi.

### Asymmetric Key (Asymmetric Keys)

Khác với symmetric key, asymmetric key thường dài hơn security level mà chúng cung cấp. Nhưng vấn đề chính bắt nguồn từ việc asymmetric key khó tạo hơn symmetric key, vì bạn không thể lấy n bit từ PRNG rồi dùng luôn kết quả. Asymmetric key không chỉ là các chuỗi bit thô. Thay vào đó, chúng biểu diễn một loại đối tượng cụ thể, chẳng hạn một số lớn có những tính chất cụ thể (trong RSA, là tích của hai số nguyên tố). Một giá trị bit string ngẫu nhiên (và do đó một số ngẫu nhiên) khó có khả năng có được các tính chất cần thiết và vì vậy sẽ không phải là một key hợp lệ.

Để tạo một asymmetric key, bạn gửi các bit pseudorandom làm seed cho một algorithm key-generation. Algorithm này nhận đầu vào là một giá trị seed dài ít nhất bằng security level dự kiến và từ đó xây dựng một private key cùng public key tương ứng, bảo đảm rằng cả hai đều thỏa mãn các tiêu chí cần thiết. Ví dụ, một algorithm key-generation ngây thơ cho RSA sẽ tạo ra một số, n = pq, bằng cách dùng một algorithm để tạo hai số nguyên tố ngẫu nhiên có độ dài xấp xỉ nhau. Algorithm đó sẽ chọn các số ngẫu nhiên cho đến khi gặp một số là số nguyên tố, vì vậy bạn cũng sẽ cần một algorithm để kiểm tra một số có phải là số nguyên tố hay không.

Để khỏi phải tự hiện thực algorithm key-generation, bạn có thể dùng OpenSSL để tạo một RSA private key 4,096-bit, như sau:

```
$ openssl genrsa 4096
Generating RSA private key, 4096 bit long modulus (2 primes)
..............................................................................
...............................++
...............................................++
e is 65537 (0x10001)
-----BEGIN RSA PRIVATE KEY-----
MIIJKQIBAAKCAgEA3Qgm6OjMy61YVstaGawk22A9LyMXhiQUU4N8F5QZXEef2Pjq
vTtAIA1hzpK2AJsv16INpNkYcTjNmechAJ0xHraftO6cp2pZFP85dvknsMfUoe8u
btKXZiYvJwpS0fQQ4tzlDtH45Gj8sMHcwFxTO3HSIx0XV0owfJTLMzZbSE3TDlN+
JdW8d9Xd5UVB+o9gUCI8tSfnOjF2dHlLNiOhlfT4w0Rf+G35USIyUJZtOQ0Dh8M+
--snip--
zO/dbYtqRkMT8Ubb/0Q1IW0q8e0WnFetzkwPzAIjwZGXT0kWJu3RYj1OXbTYDr2c
xBRVC/ujoDL6O3NaqPxkWY5HJVmkyKIE5pC04RFNyaQ8+o4APyobabPMylQq5Vo5
N5L2c4mhy1/OH8fvKBRDuvCk2oZinjdoKUo8ZA5DOa4pdvIQfR+b4/4Jjsx4
-----END RSA PRIVATE KEY-----
```

Lưu ý rằng key có một định dạng cụ thể—cụ thể là dữ liệu base64-encoded nằm giữa các marker BEGIN RSA PRIVATE KEY và END RSA PRIVATE KEY. Đó là một định dạng encoding tiêu chuẩn mà phần lớn các hệ thống hỗ trợ và có thể chuyển thành các byte dữ liệu thô. Các chuỗi dấu chấm ở đầu là một kiểu thanh tiến trình, và e is 65537 (0x10001) cho biết tham số được dùng khi mã hóa (hãy nhớ rằng RSA mã hóa bằng cách tính C = P<sup>e</sup> mod n).

### Bảo vệ key (Protecting Keys)

Khi đã có một secret key, bạn cần giữ nó bí mật nhưng vẫn sẵn sàng khi cần đến. Có ba cách để giải quyết vấn đề này:

**Key wrapping (mã hóa key bằng một key thứ hai)**

Vấn đề của cách tiếp cận này là key thứ hai phải có sẵn khi bạn cần giải mã key được bảo vệ. Trong thực tế, key thứ hai này thường được tạo ra từ một mật khẩu do người dùng cung cấp khi họ cần dùng key được bảo vệ. Đó là cách các private key của protocol Secure Shell (SSH) thường được bảo vệ.

**Tạo On-the-fly từ một mật khẩu**

Cách này không đòi hỏi lưu trữ một file đã mã hóa vì key được sinh ra trực tiếp từ mật khẩu. Các hệ thống như cryptocurrency wallet và trình quản lý mật khẩu thường dùng phương pháp này.

Dù phương pháp này trực tiếp hơn key wrapping, nó ít phổ biến hơn, một phần vì nó dễ bị tổn thương hơn trước các mật khẩu yếu. Ví dụ, giả sử một kẻ tấn công đã thu được một message đã mã hóa nào đó: nếu chúng ta dùng key wrapping, kẻ tấn công trước tiên cần lấy được file key được bảo vệ, có thể được lưu cục bộ trên file system của người dùng hoặc trong một key management system (KMS), và do đó không dễ truy cập. Nhưng nếu chúng ta dùng cách tạo on-the-fly, kẻ tấn công có thể trực tiếp tìm mật khẩu đúng bằng cách thử giải mã message đã mã hóa với các mật khẩu ứng viên. Và nếu mật khẩu yếu, key sẽ bị xâm phạm.

**Lưu key trên một hardware token (smart card hoặc USB dongle)**

Trong cách tiếp cận này, chúng ta lưu key trong secure memory, và nó vẫn an toàn ngay cả khi máy tính bị xâm phạm. Đây là cách lưu key an toàn nhất nhưng cũng tốn kém nhất và kém tiện lợi nhất, vì nó đòi hỏi bạn phải mang hardware token theo người và chịu rủi ro làm mất nó. Smart card và USB dongle thường yêu cầu bạn nhập một mật khẩu để mở khóa key từ secure memory.

> **LƯU Ý** Dù dùng phương pháp nào, hãy chắc chắn không nhầm private key với public key khi trao đổi key, và đừng vô tình công khai private key qua email hoặc source code. (Tôi thực sự đã từng tìm thấy private key trên GitHub.)

Để thử key wrapping, hãy chạy lệnh OpenSSL sau với đối số -aes128 để yêu cầu OpenSSL mã hóa key bằng cipher AES-128 (AES với key 128-bit):

```
$ openssl genrsa -aes128 4096
Generating RSA private key, 4096 bit long modulus (2 primes)
..........++
..............................................................................
...............................................++
e is 65537 (0x10001)
Enter pass phrase:
```

OpenSSL sẽ dùng passphrase được yêu cầu để mã hóa key mới được tạo.

## Những gì có thể sai (How Things Can Go Wrong)

Cryptographic security có thể sai theo nhiều cách. Rủi ro lớn nhất là khi bạn có cảm giác an toàn giả tạo nhờ các security proof hoặc các protocol well-studied, như các ví dụ sau minh họa.

### Security proof sai (Incorrect Security Proof)

Ngay cả các chứng minh security của những nhà nghiên cứu nổi tiếng cũng có thể sai. Một trong những ví dụ nổi bật nhất về một chứng minh sai lầm nghiêm trọng là chứng minh cho Optimal Asymmetric Encryption Padding (OAEP), một phương pháp mã hóa an toàn dùng RSA và đã được hiện thực trong nhiều ứng dụng. Một chứng minh sai về security của OAEP trước các kẻ tấn công chosen-ciphertext đã được chấp nhận là hợp lệ trong bảy năm, cho đến khi một nhà nghiên cứu tìm ra lỗi vào năm 2001. Không chỉ chứng minh sai, mà kết quả cũng sai. Một chứng minh mới sau đó cho thấy OAEP chỉ gần như an toàn trước các kẻ tấn công chosen-ciphertext. Giờ đây chúng ta phải tin vào chứng minh mới và hy vọng rằng nó không có lỗi. (Để biết thêm chi tiết, xem bài báo năm 2001 “OAEP Reconsidered” của Victor Shoup.)

### Key ngắn để hỗ trợ hệ thống cũ (Short Keys for Legacy Support)

Năm 2015, các nhà nghiên cứu phát hiện rằng một số site HTTPS và SSH server hỗ trợ public-key cryptography với các key ngắn hơn dự kiến—cụ thể là 512 bit thay vì ít nhất 2,048 bit. Hãy nhớ rằng, với các public-key scheme, security level không bằng kích thước key, và trong trường hợp HTTPS, key 512 bit cung cấp security level xấp xỉ 60 bit. Những key này có thể bị phá chỉ sau khoảng hai tuần tính toán bằng một cluster gồm 72 bộ xử lý. Điều này ảnh hưởng đến nhiều website, bao gồm cả website của Cục Điều tra Liên bang Hoa Kỳ (US Federal Bureau of Investigation, FBI). Dù phần mềm cuối cùng đã được sửa (nhờ các bản vá cho OpenSSL và cho các phần mềm khác), vấn đề này là một bất ngờ khá khó chịu.

## Đọc thêm (Further Reading)

Để tìm hiểu thêm về provable security cho symmetric cipher, hãy đọc tài liệu về sponge function (https://keccak.team/sponge_duplex.html). Sponge function đã đưa ra cách tiếp cận permutation-based trong symmetric crypto, mô tả cách xây dựng một loạt cryptographic function khác nhau chỉ bằng một permutation.

Một số must-reads về chi phí thực của attack gồm bài báo năm 2005 của Daniel J. Bernstein “Understanding Brute Force” và bài báo năm 2004 của Michael Wiener “The Full Cost of Cryptanalytic Attacks”, cả hai đều có miễn phí trên mạng.

Để xác định security level cho một kích thước key cho trước, hãy truy cập https://www.keylength.com. Site này trình bày khuyến nghị của một số cơ quan chính phủ về kích thước key, cũng như bậc độ lớn của security được bảo đảm tùy theo kích thước của public key.

Cuối cùng, như một bài tập, hãy chọn một ứng dụng (chẳng hạn một ứng dụng nhắn tin an toàn) và xác định các crypto scheme, độ dài key và security level tương ứng của nó. Bạn sẽ thường thấy những điểm không nhất quán đáng ngạc nhiên, chẳng hạn scheme thứ nhất cung cấp security level 256-bit nhưng scheme thứ hai chỉ cung cấp security 100-bit. Security của toàn bộ hệ thống thường chỉ mạnh bằng thành phần yếu nhất của nó.
