# Chương 9: Các bài toán khó (Hard Problems)

Các bài toán tính toán khó là nền tảng của cryptography hiện đại. Đó là những bài toán mà ngay cả algorithm tốt nhất cũng không tìm ra lời giải trước khi mặt trời tắt.

Vào những năm 1970, việc nghiên cứu chặt chẽ các bài toán khó đã làm nảy sinh một ngành khoa học mới gọi là computational complexity theory, ngành đã tác động mạnh mẽ đến cryptography và nhiều lĩnh vực khác, bao gồm kinh tế học, vật lý và sinh học. Trong chương này, bạn sẽ học các công cụ khái niệm từ complexity theory cần thiết để hiểu nền tảng của cryptographic security. Tôi cũng sẽ giới thiệu các bài toán khó đằng sau các public-key scheme, như RSA encryption và Diffie–Hellman key agreement. Tôi sẽ chạm đến một số khái niệm sâu sắc, nhưng sẽ giảm thiểu các chi tiết kỹ thuật và chỉ lướt qua bề mặt. Dù vậy, tôi hy vọng bạn sẽ thấy được vẻ đẹp trong cách cryptography tận dụng computational complexity theory để tối đa hóa sự bảo đảm về security.

## Độ khó tính toán (Computational Hardness)

Một bài toán tính toán là một câu hỏi mà người ta có thể trả lời bằng cách tính toán đủ nhiều—ví dụ, “217 có phải là số nguyên tố không?” hay “Có bao nhiêu chữ i trong incomprehensibilities?” Câu hỏi thứ nhất là một decision problem (bài toán quyết định), vì nó có thể được trả lời bằng “có” hoặc “không”, còn câu hỏi thứ hai là một search problem (bài toán tìm kiếm).

Computational hardness là tính chất của những bài toán tính toán không có algorithm nào chạy được trong một khoảng thời gian hợp lý. Những bài toán như vậy còn được gọi là intractable. Computational hardness không phụ thuộc vào loại thiết bị tính toán được dùng, dù đó là một bộ xử lý trung tâm general-purpose (CPU), một bộ xử lý đồ họa (GPU), một mạch tích hợp, hay một Turing machine cơ học. Thật vậy, một trong những phát hiện đầu tiên của computational complexity theory là mọi model tính toán đều tương đương nhau. Nếu một thiết bị tính toán có thể giải một bài toán hiệu quả, thì bất kỳ thiết bị nào khác cũng có thể giải nó hiệu quả bằng cách chuyển algorithm sang ngôn ngữ của thiết bị kia—một ngoại lệ là quantum computer, mà chúng ta sẽ thảo luận trong Chương 14. Vì vậy, tôi sẽ không cần chỉ rõ thiết bị tính toán hay hardware bên dưới khi thảo luận về computational hardness; thay vào đó, chúng ta sẽ chỉ thảo luận về algorithm.

Để đánh giá computational hardness, trước tiên bạn cần một cách đo độ phức tạp của một algorithm, hay thời gian chạy của nó. Sau đó, bạn phân loại thời gian chạy là khó hay dễ.

### Thời gian chạy (Running Time)

Độ phức tạp tính toán (computational complexity) của một algorithm là số phép toán xấp xỉ mà nó thực hiện, như một function của kích thước đầu vào. Bạn có thể đếm kích thước theo bit hoặc theo số phần tử nhận làm đầu vào. Ví dụ, hãy xét algorithm trong Listing 9-1, được viết bằng pseudocode. Nó tìm một giá trị, x, trong một mảng n phần tử rồi trả về vị trí index của nó, hoặc –1 nếu không tìm thấy x.

```
search(x, array, n) {
    for i from 0 to n - 1 {
        if (array[i] == x) {
            return i;
        }
    }
    return -1;
}
```

Listing 9-1: Một algorithm tìm kiếm đơn giản có độ phức tạp tuyến tính theo độ dài mảng n

Algorithm này dùng một vòng for để tìm một giá trị cụ thể, x, trong một mảng, lặp qua các giá trị của biến i, bắt đầu từ 0. Nó kiểm tra xem giá trị ở vị trí i trong array có bằng giá trị x hay không. Nếu có, nó trả về vị trí i. Nếu không, nó tăng i và thử vị trí tiếp theo cho đến khi đạt n – 1, vị trí cuối cùng trong mảng, lúc đó nó trả về –1.

Với loại algorithm này, bạn đếm độ phức tạp bằng số lần lặp của vòng for: 1 trong trường hợp tốt nhất (nếu x bằng array[0]), n trong trường hợp xấu nhất (nếu x bằng array[n - 1] hoặc nếu không tìm thấy x trong array), và trung bình n/2 nếu x được phân phối ngẫu nhiên đều ở một trong n ô của mảng. Với một mảng lớn gấp 10 lần, algorithm sẽ chậm gấp 10 lần. Do đó, độ phức tạp tỷ lệ với n, hay “tuyến tính” theo n. Một độ phức tạp tuyến tính theo kích thước đầu vào được coi là nhanh, trái ngược với các độ phức tạp hàm mũ. Trong ví dụ này, dù xử lý các giá trị đầu vào lớn hơn thì chậm hơn, chi phí tính toán sẽ không bùng nổ theo hàm mũ mà vẫn tỷ lệ với kích thước bảng.

Tuy nhiên, nhiều algorithm hữu ích chậm hơn thế và có độ phức tạp cao hơn tuyến tính. Ví dụ kinh điển trong sách giáo khoa là các algorithm sắp xếp: với một danh sách n giá trị theo thứ tự ngẫu nhiên, trong trường hợp xấu nhất bạn cần n × log n phép toán cơ bản để sắp xếp danh sách, đôi khi được gọi là độ phức tạp linearithmic. Vì n × log n tăng nhanh hơn n, tốc độ sắp xếp chậm đi nhanh hơn mức tỷ lệ với n. Dù vậy, các algorithm sắp xếp như vậy vẫn nằm trong phạm vi tính toán thực tế, tức là tính toán mà người ta có thể thực hiện trong một khoảng thời gian hợp lý.

Thứ thường không hợp lý là các độ phức tạp hàm mũ theo kích thước đầu vào. Đến một lúc nào đó, bạn sẽ chạm trần của những gì khả thi, ngay cả với độ dài đầu vào tương đối nhỏ. Hãy lấy ví dụ đơn giản nhất từ cryptanalysis: brute-force search tìm một secret key. Hãy nhớ lại từ Chương 1 rằng với một plaintext P và một ciphertext C = E(K, P), cần tối đa 2<sup>n</sup> lần thử để khôi phục một symmetric key n-bit vì có 2<sup>n</sup> key khả dĩ—một ví dụ về độ phức tạp tăng theo hàm mũ. Một bài toán có độ phức tạp hàm mũ thực tế là không thể giải, vì khi n tăng, công sức nhanh chóng trở nên không khả thi.

Bạn có thể phản đối rằng chúng ta đang so sánh cam với táo ở đây: trong function search() ở Listing 9-1, chúng ta đếm số phép toán if (array[i] == x), trong khi việc khôi phục key đếm số lần mã hóa, mỗi lần chậm hơn hàng nghìn lần so với một phép so sánh == duy nhất. Sự không nhất quán bề ngoài này có thể tạo ra khác biệt nếu bạn so sánh hai algorithm có độ phức tạp rất giống nhau, nhưng phần lớn thời gian nó không quan trọng, vì số phép toán có ảnh hưởng lớn hơn chi phí của từng phép toán riêng lẻ. Ngoài ra, các ước lượng độ phức tạp bỏ qua các hệ số hằng: khi chúng ta nói một algorithm tốn thời gian cỡ n<sup>3</sup> phép toán (tức độ phức tạp bậc ba), thực tế nó có thể tốn 41 × n<sup>3</sup> phép toán, hoặc thậm chí 12,345 × n<sup>3</sup> phép toán—nhưng một lần nữa, khi n tăng, các hệ số hằng mất dần ý nghĩa đến mức bạn có thể bỏ qua chúng. Phân tích độ phức tạp là về độ khó lý thuyết như một function của kích thước đầu vào; nó không quan tâm đến số chu kỳ CPU chính xác mà algorithm tốn trên máy tính của bạn.

Bạn thường có thể dùng ký hiệu O() (big O) để biểu diễn độ phức tạp. Ví dụ, O(n<sup>3</sup>) nghĩa là độ phức tạp tăng không nhanh hơn n<sup>3</sup>, bỏ qua các hệ số hằng tiềm năng. O() ký hiệu cận trên của độ phức tạp của một algorithm. Ký hiệu O(1) nghĩa là một algorithm chạy trong thời gian hằng —tức là thời gian chạy không phụ thuộc vào độ dài đầu vào. Ví dụ, algorithm xác định tính chẵn lẻ của một số nguyên bằng cách nhìn vào bit có trọng số thấp nhất (least significant bit, LSB) của nó và trả về “chẵn” nếu bit đó bằng không và “lẻ” trong trường hợp ngược lại sẽ làm cùng một việc với cùng một chi phí, bất kể độ dài của số nguyên.

Để thấy sự khác biệt giữa độ phức tạp thời gian tuyến tính, bậc hai và hàm mũ, hãy xem độ phức tạp tăng như thế nào với O(n) (tuyến tính) so với O(n<sup>2</sup>) (bậc hai) so với O(2<sup>n</sup>) (hàm mũ) trong Hình 9-1.

![Figure 9-1](images/ch09_hard_problems/fig9-1.png)

Hình 9-1: Sự tăng trưởng của các độ phức tạp hàm mũ, bậc hai và tuyến tính, từ tăng nhanh nhất đến tăng chậm nhất

Độ phức tạp hàm mũ nghĩa là bài toán thực tế không thể giải, và độ phức tạp tuyến tính nghĩa là lời giải khả thi, còn độ phức tạp bậc hai nằm ở đâu đó giữa hai loại này.

### Thời gian đa thức so với siêu đa thức (Polynomial vs. Superpolynomial Time)

Độ phức tạp bậc hai O(n<sup>2</sup>) (đường cong ở giữa trong Hình 9-1) là một trường hợp đặc biệt của lớp rộng hơn gồm các độ phức tạp đa thức, hay O(n<sup>k</sup>), trong đó k là một số cố định nào đó như 3, 2.373, 7/10, hay căn bậc hai của 17. Các algorithm Polynomial-time cực kỳ quan trọng trong complexity theory và trong cryptography vì chúng chính là định nghĩa của khả thi trong thực tế. Khi một algorithm chạy trong thời gian đa thức (polynomial time), hay gọi tắt là polytime, nó hoàn tất trong một khoảng thời gian chấp nhận được ngay cả khi đầu vào lớn. Đó là lý do polynomial time đồng nghĩa với “hiệu quả” đối với các nhà complexity theory và các cryptographer.

Ngược lại, bạn có thể xem các algorithm chạy trong thời gian siêu đa thức (superpolynomial time)—tức là trong O(f(n)), trong đó f(n) là bất kỳ function nào tăng nhanh hơn mọi đa thức—là không thực tế. Tôi nói siêu đa thức, chứ không chỉ là hàm mũ, vì có những độ phức tạp nằm giữa đa thức và độ phức tạp hàm mũ well-known O(2<sup>n</sup>), chẳng hạn O(n<sup>log(n)</sup>), như Hình 9-2 cho thấy.

![Figure 9-2](images/ch09_hard_problems/fig9-2.png)

Hình 9-2: Sự tăng trưởng của các function 2<sup>n</sup>, n<sup>log(n)</sup> và n<sup>2</sup>, từ tăng nhanh nhất đến tăng chậm nhất

O(n<sup>2</sup>) hoặc O(n<sup>3</sup>) có thể hiệu quả, nhưng O(n<sup>99,999,999,999</sup>) rõ ràng là không. Nói cách khác, polytime nhanh trong thực tế chừng nào số mũ không quá lớn. May thay, mọi algorithm polynomial-time được tìm ra để giải các bài toán thực tế đều có số mũ nhỏ. Ví dụ, O(n<sup>2.373</sup>) là độ phức tạp thời gian của algorithm tốt nhất đã biết để nhân hai ma trận n × n trên lý thuyết, vì algorithm này không bao giờ được dùng trong thực tế. Algorithm tất định polytime mang tính đột phá năm 2002 để nhận diện các số nguyên tố n-bit ban đầu có độ phức tạp O(n<sup>12</sup>), nhưng sau đó đã được cải thiện xuống O(n<sup>6</sup>). Như vậy, polynomial time có thể không phải là định nghĩa hoàn hảo về thời gian thực tế cho một algorithm, nhưng đó là định nghĩa tốt nhất mà chúng ta có.

Mở rộng ra, bạn có thể coi một bài toán không thể giải bằng một algorithm polynomial-time là không thực tế, hay khó. Ví dụ, với một key search đơn giản, không có cách nào vượt qua được độ phức tạp O(2<sup>n</sup>) trừ khi cipher bị phá theo cách nào đó.

> **LƯU Ý** Độ phức tạp hàm mũ O(2<sup>n</sup>) không phải là tệ nhất bạn có thể gặp. Một số độ phức tạp còn tăng nhanh hơn và do đó đặc trưng cho những algorithm còn chậm hơn nữa—ví dụ, độ phức tạp O(n<sup>n</sup>) hay exponential factorial O(n<sup>f(n – 1)</sup>), trong đó với mọi x, function f ở đây được định nghĩa đệ quy là f(x) = x<sup>f(x – 1)</sup>. Trong thực tế, bạn sẽ không bao giờ gặp các algorithm có độ phức tạp vô lý như vậy.

Bạn biết rằng không có cách nào vượt qua độ phức tạp O(2<sup>n</sup>) của một brute-force key search (chừng nào cipher còn an toàn), nhưng nói chung bạn sẽ không phải lúc nào cũng biết cách nhanh nhất để giải một bài toán tính toán. Một phần lớn nghiên cứu trong complexity theory là về việc chứng minh các cận độ phức tạp đối với thời gian chạy của các algorithm giải một bài toán cho trước. Để công việc dễ dàng hơn, các nhà complexity theory đã phân loại các bài toán tính toán thành các nhóm, hay lớp (class), khác nhau theo công sức cần để giải chúng.

## Các lớp độ phức tạp (Complexity Classes)

Trong toán học, một lớp là một nhóm đối tượng có một thuộc tính tương tự nào đó. Ví dụ, mọi bài toán tính toán có thể giải trong thời gian O(n<sup>2</sup>), mà các nhà complexity theory ký hiệu đơn giản là TIME(n<sup>2</sup>), tạo thành một lớp. Tương tự, TIME(n<sup>3</sup>) là lớp các bài toán có thể giải trong thời gian O(n<sup>3</sup>), TIME(2<sup>n</sup>) là lớp các bài toán có thể giải trong thời gian O(2<sup>n</sup>), v.v. Cũng vì lý do một siêu máy tính có thể tính bất cứ thứ gì một laptop có thể tính, bất kỳ bài toán nào giải được trong O(n<sup>2</sup>) cũng giải được trong O(n<sup>3</sup>). Do đó, bất kỳ bài toán nào trong lớp TIME(n<sup>2</sup>) cũng thuộc về lớp TIME(n<sup>3</sup>), và cả hai đều thuộc về lớp TIME(n<sup>4</sup>), v.v. Hợp của mọi lớp TIME(n<sup>k</sup>), với mọi hằng số k, là P, viết tắt của polynomial time.

Nếu bạn đã từng lập trình máy tính, bạn sẽ biết rằng những algorithm trông có vẻ nhanh vẫn có thể làm sập hệ thống của bạn vì ngốn hết tài nguyên memory. Khi chọn một algorithm, bạn nên xét không chỉ độ phức tạp thời gian của nó mà còn lượng memory nó dùng, tức độ phức tạp không gian (space complexity). Điều này đặc biệt quan trọng vì một lần truy cập memory thường chậm hơn một phép toán số học cơ bản trong CPU nhiều bậc độ lớn.

Về mặt hình thức, bạn định nghĩa mức tiêu thụ memory của một algorithm như một function của độ dài đầu vào, n, theo cùng cách bạn đã định nghĩa độ phức tạp thời gian. Lớp các bài toán có thể giải bằng f(n) bit memory là SPACE(f(n)). Ví dụ, SPACE(n<sup>3</sup>) là lớp các bài toán có thể giải bằng khoảng n<sup>3</sup> bit memory. Giống như bạn đã có P là hợp của mọi TIME(n<sup>k</sup>), hợp của mọi bài toán SPACE(n<sup>k</sup>) là PSPACE.

Dù memory càng ít càng tốt, một lượng memory đa thức không nhất thiết có nghĩa là một algorithm là thực tế. Lấy ví dụ một brute-force key search, tốn memory không đáng kể nhưng chậm kinh khủng. Tổng quát hơn, một algorithm có thể chạy mãi mãi, ngay cả khi nó chỉ dùng vài byte memory.

Bất kỳ bài toán nào giải được trong thời gian f(n) cần tối đa f(n) memory, vì vậy TIME(f(n)) được chứa trong SPACE(f(n)). Trong thời gian f(n), bạn có thể ghi tối đa f(n) bit, và không hơn, vì việc ghi (hoặc đọc) 1 bit được giả định là tốn một đơn vị thời gian; do đó, bất kỳ bài toán nào trong TIME(f(n)) cũng không thể dùng nhiều hơn f(n) không gian. Kết quả là P là một tập con của PSPACE.

### Thời gian đa thức không tất định (Nondeterministic Polynomial Time)

NP, nondeterministic polynomial time, là lớp độ phức tạp quan trọng thứ hai, sau lớp P gồm mọi algorithm polynomial-time.

NP là lớp các decision problem mà bạn có thể kiểm chứng một lời giải trong thời gian đa thức—tức là một cách hiệu quả—dù lời giải có thể khó tìm. Nói kiểm chứng, ý tôi là khi có một lời giải tiềm năng, bạn có thể chạy một algorithm polynomial-time nào đó để kiểm tra xem bạn đã tìm được một lời giải thực sự hay chưa. Ví dụ, bài toán quyết định xem có tồn tại một key K sao cho C = E(K, P), khi có P và C, với một symmetric cryptosystem E, là thuộc NP. Đó là vì khi có một key ứng viên K<sub>0</sub>, bạn có thể kiểm tra K<sub>0</sub> có phải là key đúng hay không bằng cách kiểm chứng E(K<sub>0</sub>, P) có bằng C hay không. Bạn không thể tìm ra một key tiềm năng (lời giải), nếu nó tồn tại, trong thời gian đa thức, nhưng bạn có thể kiểm tra một key có đúng hay không.

Giờ là một phản ví dụ: Còn known-ciphertext attack thì sao? Lần này, bạn chỉ có một số giá trị E(K, P) với các plaintext P ngẫu nhiên chưa biết. Nếu bạn không biết các P là gì, thì không có cách nào kiểm chứng một key tiềm năng, K<sub>0</sub>, có đúng hay không. Nói cách khác, bài toán key-recovery dưới known-ciphertext attack không thuộc NP (chứ đừng nói đến P), vì bạn không thể biểu diễn nó dưới dạng một decision problem.

Một ví dụ khác về một bài toán không thuộc NP là bài toán kiểm chứng sự không tồn tại của lời giải cho một bài toán. Kiểm chứng một lời giải đúng rốt cuộc là tính toán một algorithm nào đó với lời giải ứng viên làm đầu vào rồi kiểm tra giá trị trả về. Tuy nhiên, để kiểm chứng rằng không có lời giải nào tồn tại, bạn có thể cần duyệt qua mọi đầu vào khả dĩ. Nếu có một số lượng đầu vào hàm mũ, bạn sẽ không thể chứng minh một cách hiệu quả rằng không có lời giải nào tồn tại. Sự không tồn tại của lời giải rất khó chỉ ra đối với những bài toán khó nhất trong lớp NP—các bài toán so-called NP-complete.

### Các bài toán NP-Complete

Các bài toán NP-complete là những decision problem khó nhất trong lớp NP; bạn sẽ không biết cách giải các instance worst-case của những bài toán này trong thời gian đa thức. Như các nhà complexity theory đã phát hiện vào những năm 1970 khi họ phát triển lý thuyết NP-completeness, các bài toán khó nhất của NP về cơ bản đều khó như nhau. Điều này được chứng minh bằng cách chỉ ra rằng bạn có thể biến bất kỳ lời giải hiệu quả nào cho bất kỳ bài toán NP-complete nào thành một lời giải hiệu quả cho bất kỳ bài toán NP-complete nào khác. Nói cách khác, nếu bạn có thể giải hiệu quả bất kỳ bài toán NP-complete nào, bạn có thể giải tất cả chúng, cũng như mọi bài toán trong NP. Làm sao có thể như vậy?

Các bài toán NP-complete có nhiều hình dạng khác nhau, nhưng về mặt toán học chúng về cơ bản giống nhau. Thực tế, bạn có thể quy (reduce) bất kỳ bài toán NP-complete nào về bất kỳ bài toán NP-complete nào khác sao cho khả năng giải bài toán thứ hai kéo theo khả năng giải bài toán thứ nhất. Hãy nhớ rằng NP chứa các decision problem, không phải search problem. Bạn có thể biến đổi hiệu quả một algorithm có khả năng giải một search problem thành một algorithm có khả năng giải decision problem tương ứng, dù chiều ngược lại không phải lúc nào cũng khả thi. May thay, điều đó lại khả thi với các bài toán NP-complete, và điều này giải thích vì sao người ta thường lẫn lộn hai loại.

Sau đây là một số ví dụ về các bài toán NP-complete:

**Bài toán người bán hàng du lịch (The traveling salesman problem)** Cho một tập điểm trên bản đồ (như các thành phố) cùng khoảng cách giữa mỗi điểm với mọi điểm khác và cho một khoảng cách tối đa x, hãy quyết định xem có tồn tại một đường đi đi qua mọi điểm sao cho tổng khoảng cách nhỏ hơn x hay không. (Lưu ý rằng bạn có thể tìm một đường đi như vậy với độ phức tạp về cơ bản giống như decision problem, nhưng việc quyết định một đường đi có tối ưu hay không thì không thuộc NP, vì bạn không thể kiểm chứng hiệu quả tính đúng của một lời giải.)

**Bài toán clique (The clique problem)** Cho một số, x, và một đồ thị (một tập các nút được nối bởi các cạnh, như trong Hình 9-3), hãy xác định xem có tồn tại một tập tối đa x nút đều được nối với nhau hay không.

![Figure 9-3](images/ch09_hard_problems/fig9-3.png)

Hình 9-3: Một đồ thị chứa một clique gồm bốn nút. Bài toán tổng quát tìm một clique (tập các nút đều được nối với nhau) có kích thước cho trước trong một đồ thị là NP-complete.

**Bài toán cái túi (The knapsack problem)** Cho hai số, x và y, và một tập vật phẩm, mỗi vật có giá trị và trọng lượng đã biết, hãy quyết định xem có tồn tại một nhóm vật phẩm sao cho tổng giá trị ít nhất là x và tổng trọng lượng tối đa là y hay không.

Bạn có thể tìm thấy những bài toán NP-complete như vậy ở khắp nơi, từ lập lịch (cho các công việc có độ ưu tiên và thời lượng nào đó cùng một hoặc nhiều bộ xử lý, hãy gán công việc cho các bộ xử lý theo đúng độ ưu tiên trong khi tối thiểu hóa tổng thời gian thực thi) đến constraint-satisfaction (xác định các giá trị thỏa mãn một tập ràng buộc toán học, như các phương trình logic). Ngay cả nhiệm vụ chiến thắng một số trò chơi điện tử nhất định cũng đã được chứng minh là NP-hard (với các trò chơi nổi tiếng như Tetris, Super Mario Bros., Pokémon và Candy Crush Saga). Ví dụ, bài viết “Classic Nintendo Games are (Computationally) Hard” xét “decision problem về khả năng tiếp cận” để xác định khả năng đi đến điểm đích từ một điểm xuất phát cụ thể (https://arxiv.org/abs/1203.1895).

Một số bài toán trò chơi điện tử này ít nhất cũng khó bằng các bài toán NP-complete và được gọi là NP-hard. Một bài toán (không nhất thiết là bài toán quyết định) là NP-hard khi nó ít nhất cũng khó bằng các bài toán NP-complete (quyết định) và nếu bất kỳ phương pháp nào giải được nó cũng có thể được dùng hiệu quả để giải các bài toán NP-complete.

Các bài toán NP-complete phải là bài toán quyết định; tức là các bài toán có câu trả lời có hoặc không. Do đó, nói một cách chặt chẽ, các bài toán tính giá trị “tốt nhất” của một lời giải không thể là NP-complete nhưng có thể là NP-hard. Ví dụ, hãy lấy bài toán người bán hàng du lịch: bài toán “Có tồn tại một đường đi qua mọi điểm với khoảng cách nhỏ hơn X không?” là NP-complete, trong khi “Hãy tìm đường đi nhanh hơn qua mọi điểm” là NP-hard.

Lưu ý rằng không phải mọi instance của các bài toán NP-hard đều thực sự khó giải. Bạn có thể giải hiệu quả một số instance vì chúng nhỏ hoặc có cấu trúc đặc biệt. Lấy ví dụ đồ thị trong Hình 9-3. Bạn có thể nhanh chóng nhận ra clique, chính là bốn nút được nối với nhau ở phía trên—dù bài toán clique-finding đã nói ở trên là NP-hard, ở đây chẳng có gì khó cả. Là NP-hard không có nghĩa là mọi instance của một bài toán cho trước đều khó, mà là khi kích thước bài toán tăng lên, một số instance sẽ khó. Đó là lý do các cryptographer quan tâm hơn đến những bài toán khó trung bình (on average), chứ không chỉ khó trong trường hợp xấu nhất.

### Bài toán P vs. NP (The P vs. NP Problem)

Nếu bạn có thể giải những bài toán NP khó nhất trong thời gian đa thức, thì bạn có thể giải mọi bài toán NP trong thời gian đa thức, và do đó NP sẽ bằng P. Một sự bằng nhau như vậy nghe thật vô lý: Chẳng phải có những bài toán mà lời giải dễ kiểm chứng nhưng khó tìm sao? Ví dụ, chẳng phải hiển nhiên là brute force exponential-time là cách nhanh nhất để khôi phục key của một symmetric cipher, và do đó bài toán này không thể thuộc P sao?

Dù nghe có vẻ điên rồ, chưa ai chứng minh được P khác NP, bất chấp một giải thưởng $1 triệu. Clay Mathematics Institute sẽ trao giải thưởng này cho bất kỳ ai chứng minh được P ≠ NP hoặc P = NP. Bài toán này, được biết đến với tên P vs. NP, đã được nhà complexity theory nổi tiếng Scott Aaronson gọi là “một trong những câu hỏi sâu sắc nhất mà con người từng đặt ra”. Hãy nghĩ mà xem: nếu P bằng NP, thì bất kỳ lời giải dễ kiểm tra nào cũng sẽ dễ tìm. Mọi cryptography được dùng trong thực tế sẽ không an toàn, vì bạn có thể khôi phục symmetric key và đảo ngược hash function một cách hiệu quả.

Nhưng đừng hoảng: phần lớn các nhà complexity theory tin rằng P không bằng NP và do đó P là một tập con thực sự của NP, như Hình 9-4 cho thấy, trong đó các bài toán NP-complete là một tập con khác của NP không giao với P. Nói cách khác, những bài toán trông có vẻ khó thì thực sự khó. Chỉ là rất khó chứng minh điều này về mặt toán học. Trong khi chứng minh P = NP chỉ cần một algorithm polynomial-time cho một bài toán NP-complete, thì chứng minh sự không tồn tại của một algorithm như vậy về cơ bản khó hơn nhiều. Điều này không ngăn cản các nhà toán học đưa ra những chứng minh đơn giản mà, dù thường sai rành rành, lại thường đọc rất vui; để xem ví dụ, hãy xem “The P-versus-NP page” (https://www.win.tue.nl/~wscor/woeginger/P-versus-NP.htm).

![Figure 9-4](images/ch09_hard_problems/fig9-4.png)

Hình 9-4: Các lớp NP và P và tập các bài toán NP-complete

Nếu chúng ta gần như chắc chắn rằng các bài toán khó tồn tại trong NP, thì sao không tận dụng chúng để xây dựng crypto mạnh, provably secure? Hãy tưởng tượng một chứng minh rằng việc phá một cipher nào đó là NP-hard và do đó cipher đó không thể bị phá chừng nào P không bằng NP. Nhưng thực tế thật đáng thất vọng: các phiên bản tìm kiếm của các bài toán NP-complete đã tỏ ra khó dùng cho mục đích crypto, vì chính cấu trúc làm cho chúng khó trong trường hợp xấu nhất có thể làm cho chúng dễ trong những trường hợp cụ thể đôi khi xuất hiện trong crypto. Thay vào đó, cryptography thường dựa vào những bài toán có lẽ không phải là NP-hard.

## Bài toán phân tích thừa số (The Factoring Problem)

Factoring problem là việc tìm các số nguyên tố p và q khi có một số lớn, N = p × q. Các algorithm RSA được dùng rộng rãi dựa trên độ khó của việc phân tích thừa số: RSA encryption và signature scheme an toàn vì factoring là một bài toán khó. Trước khi chúng ta xem RSA tận dụng factoring problem như thế nào trong Chương 10, tôi muốn thuyết phục bạn rằng phiên bản quyết định của bài toán này (“N có ước số nào nhỏ hơn k và khác 1 không?”) thực sự khó nhưng có lẽ không phải là NP-complete.

Trước tiên, một chút toán cơ bản. Một số nguyên tố không chia hết cho bất kỳ số nào khác ngoài chính nó và 1. Ví dụ, các số 3, 7 và 11 là số nguyên tố; các số 4 (tức 2 × 2), 6 (2 × 3) và 12 (2 × 2 × 3) thì không. Một định lý cơ bản của lý thuyết số nói rằng bạn có thể viết bất kỳ số nguyên nào một cách duy nhất dưới dạng tích các số nguyên tố, một cách biểu diễn được gọi là sự phân tích thừa số (factorization) của số đó. Ví dụ, factorization của 123,456 là 2<sup>6</sup> × 3 × 643, factorization của 1,234,567 là 127 × 9,721, v.v. Bất kỳ số nguyên nào cũng có một factorization duy nhất, hay một cách duy nhất để viết nó dưới dạng tích các số nguyên tố. Các algorithm kiểm tra tính nguyên tố Polynomial-time cho phép chúng ta kiểm tra hiệu quả một số cho trước có phải là số nguyên tố hay không, hoặc một factorization cho trước có chỉ chứa số nguyên tố hay không. Tuy nhiên, đi từ một số đến các thừa số nguyên tố của nó lại là một chuyện khác.

### Phân tích thừa số các số lớn (Factoring Large Numbers)

Vậy làm thế nào để đi từ một số đến factorization của nó—tức là sự phân tích nó thành tích các số nguyên tố? Cách cơ bản nhất để phân tích một số, N, thành thừa số là thử chia nó cho mọi số nhỏ hơn nó cho đến khi tìm được một số, x, chia hết N. Sau đó thử chia N cho số tiếp theo, x + 1, v.v. Cuối cùng bạn sẽ có một danh sách các thừa số của N. Độ phức tạp thời gian của việc này là bao nhiêu? Trước hết, hãy nhớ rằng chúng ta biểu diễn độ phức tạp như một function của độ dài đầu vào. Độ dài bit của số N là n = log<sub>2</sub> N. Theo định nghĩa của logarit, điều này có nghĩa là N = 2<sup>n</sup>. Vì mọi số nhỏ hơn N/2 đều là những phỏng đoán hợp lý cho các thừa số khả dĩ của N, có khoảng N/2 = 2<sup>n</sup>/2 giá trị cần thử. Do đó, độ phức tạp của algorithm phân tích thừa số ngây thơ của chúng ta là O(2<sup>n</sup>), bỏ qua hệ số 1/2 trong ký hiệu O().

Dù nhiều số dễ phân tích thừa số bằng cách trước tiên tìm các thừa số nhỏ bất kỳ (2, 3, 5, v.v.) rồi lặp lại việc phân tích các thừa số không nguyên tố khác, ở đây chúng ta quan tâm đến các số có dạng N = p × q, trong đó p và q lớn, như thường gặp trong cryptography.

Hãy thông minh hơn một chút: vì chúng ta không cần thử mọi số nhỏ hơn N/2 mà chỉ cần thử các số nguyên tố, chúng ta có thể bắt đầu bằng cách thử những số nhỏ hơn căn bậc hai của N. Nếu N không phải là số nguyên tố, thì nó phải có ít nhất một thừa số nhỏ hơn căn bậc hai √N của nó. Đó là vì nếu cả hai thừa số p và q của N đều lớn hơn √N, thì tích của chúng sẽ lớn hơn √N × √N = N, điều không thể xảy ra. Ví dụ, nếu N = 100, các thừa số p và q của nó không thể cùng lớn hơn 10, vì điều đó sẽ cho ra một tích lớn hơn 100. p hoặc q phải nhỏ hơn hoặc bằng √N.

Vậy độ phức tạp của việc chỉ thử các số nguyên tố nhỏ hơn √N là bao nhiêu? Định lý số nguyên tố (prime number theorem) phát biểu rằng có xấp xỉ N/log N số nguyên tố nhỏ hơn N. Do đó, có xấp xỉ √N/log √N số nguyên tố nhỏ hơn √N. Biểu diễn giá trị này theo n = log<sub>2</sub> N, chúng ta có xấp xỉ 2<sup>n/2 + 1</sup>/n thừa số nguyên tố khả dĩ và do đó độ phức tạp là O(2<sup>n/2</sup>/n), vì √N = 2<sup>n/2</sup> và 1/log √N = 1/(n/2) = 2/n. Cách này nhanh hơn việc thử mọi số nguyên tố, nhưng vẫn chậm một cách đau đớn—cỡ 2<sup>120</sup> phép toán cho một số 256-bit. Đó là một khối lượng tính toán khá phi thực tế. Nhưng chúng ta có thể làm tốt hơn nhiều.

Algorithm phân tích thừa số nhanh nhất là general number field sieve (GNFS), mà tôi sẽ không mô tả ở đây vì nó đòi hỏi phải giới thiệu nhiều khái niệm toán học nâng cao. Một ước lượng thô về độ phức tạp của GNFS là exp(1.91 × n<sup>1/3</sup>(log n)<sup>2/3</sup>), trong đó n = log<sub>2</sub> N là độ dài bit của N và exp(. . .) chỉ là một cách ký hiệu khác cho hàm mũ e<sup>x</sup>, với e là hằng số mũ xấp xỉ bằng 2.718. Tuy nhiên, rất khó có được một ước lượng chính xác về độ phức tạp thực tế của GNFS với một kích thước số cho trước. Do đó, chúng ta phải dựa vào các ước lượng độ phức tạp heuristic, cho thấy security tăng như thế nào khi n dài hơn. Ví dụ:

• Phân tích thừa số một số 1,024-bit, có hai thừa số nguyên tố mỗi thừa số khoảng 500 bit, tốn cỡ 2<sup>70</sup> phép toán cơ bản.

• Phân tích thừa số một số 2,048-bit, có hai thừa số nguyên tố mỗi thừa số khoảng 1,000 bit, tốn cỡ 2<sup>90</sup> phép toán cơ bản—chậm hơn khoảng một triệu lần so với một số 1,024-bit.

Bạn có thể ước tính rằng để đạt security 128-bit cần ít nhất 4,096 bit. Hãy tiếp nhận những giá trị này một cách dè dặt, vì các nhà nghiên cứu không phải lúc nào cũng đồng ý về những ước lượng này. Các kết quả thực nghiệm sau cho thấy chi phí thực tế của việc phân tích thừa số:

• Năm 2005, sau khoảng 18 tháng tính toán—và nhờ sức mạnh của một cluster gồm 80 bộ xử lý, với tổng công sức tương đương 75 năm tính toán trên một bộ xử lý duy nhất—một nhóm nhà nghiên cứu đã phân tích thừa số một số 663-bit (200-decimal digit, tức chừng ấy chữ số thập phân).

• Năm 2009, sau khoảng hai năm và dùng vài trăm bộ xử lý, với tổng công sức tương đương khoảng 2,000 năm tính toán trên một bộ xử lý duy nhất, một nhóm nhà nghiên cứu khác đã phân tích thừa số một số 768-bit (232-decimal digit, tức chừng ấy chữ số thập phân).

• Năm 2020, sau vài tháng tính toán, dùng hàng chục nghìn bộ xử lý và một siêu máy tính, với tổng công sức tương đương khoảng 2,700 năm tính toán trên một bộ xử lý duy nhất, một nhóm khác đã phân tích thừa số một số 829-bit (250-decimal digit, tức chừng ấy chữ số thập phân).

Như bạn có thể thấy, các số được các nhà nghiên cứu phân tích thừa số ngắn hơn các số trong ứng dụng thực tế, vốn ít nhất là 1,024-bit và thường hơn 2,048-bit. Tại thời điểm tôi viết những dòng này, chưa ai báo cáo việc phân tích thừa số một số 1,024-bit, nhưng nhiều người phỏng đoán rằng các tổ chức well-funded như NSA có thể làm được.

Tóm lại, bạn nên xem RSA 1,024-bit là không an toàn và dùng RSA với giá trị ít nhất 2,048-bit, nhưng tốt hơn là 4,096-bit để bảo đảm security cao hơn.

### Factoring có lẽ không phải là NP-Hard

Chúng ta không biết cách phân tích thừa số các số lớn một cách hiệu quả, điều này gợi ý rằng factoring problem không thuộc P. Tuy nhiên, phiên bản quyết định của factoring rõ ràng thuộc NP, vì khi có một factorization, chúng ta có thể kiểm chứng lời giải bằng cách kiểm tra rằng mọi thừa số đều là số nguyên tố, nhờ algorithm kiểm tra tính nguyên tố đã nói ở trên, và rằng khi nhân với nhau, các thừa số cho ra đúng số mong đợi. Ví dụ, để kiểm tra 3 × 5 là factorization của 15, hãy xác nhận rằng cả 3 và 5 đều là số nguyên tố và 3 nhân 5 bằng 15.

Vậy là chúng ta có một bài toán thuộc NP và trông có vẻ khó, nhưng liệu nó có khó bằng những bài toán NP khó nhất không? Nói cách khác, phiên bản quyết định của factoring có phải là NP-complete không, và do đó factoring có phải là NP-hard không? Tiết lộ trước: có lẽ là không.

Không có chứng minh toán học nào rằng factoring không phải là NP-hard, nhưng chúng ta có một vài bằng chứng gián tiếp. Thứ nhất, mọi bài toán NP-hard đã biết trong NP có thể có một lời giải, nhiều hơn một lời giải, hoặc không có lời giải nào. Ngược lại, factoring luôn có đúng một lời giải. Ngoài ra, factoring problem có một cấu trúc toán học cho phép algorithm GNFS vượt trội đáng kể so với một algorithm ngây thơ, một cấu trúc mà các bài toán NP-hard không có. Factoring sẽ dễ dàng với một quantum computer, một model tính toán khai thác các hiện tượng cơ học lượng tử để chạy các loại algorithm khác nhau và sẽ có khả năng phân tích thừa số các số lớn một cách hiệu quả (không phải vì nó chạy algorithm nhanh hơn mà vì nó có thể chạy một quantum algorithm chuyên dùng để phân tích thừa số các số lớn). Tuy nhiên, một quantum computer như vậy vẫn chưa tồn tại—và có thể không bao giờ tồn tại. Dù sao thì quantum computer được cho là vô dụng trong việc giải các bài toán NP-hard, vì nó sẽ không nhanh hơn một máy tính cổ điển (xem Chương 14).

Về lý thuyết, factoring có thể dễ hơn một chút so với việc giải các bài toán NP-hard, nhưng xét về cryptography, nó đủ khó, và thậm chí còn đáng tin cậy hơn các bài toán NP-hard. Thật vậy, xây dựng cryptosystem trên factoring problem dễ hơn trên các phiên bản tìm kiếm của bài toán NP-complete, vì rất khó biết chính xác việc phá một cryptosystem dựa trên những bài toán như vậy khó đến mức nào—nói cách khác, bạn sẽ có được bao nhiêu bit security. Như đã đề cập trước đó, điều này liên quan đến thực tế là NP quan tâm đến độ khó worst-case, trong khi các cryptographer tìm kiếm độ khó average-case.

Factoring problem là một trong số nhiều bài toán bạn có thể dùng trong cryptography làm một giả định độ khó (hardness assumption), tức là một giả định rằng một bài toán nào đó là khó về mặt tính toán. Bạn có thể dùng giả định này khi chứng minh rằng việc phá security của một cryptosystem ít nhất cũng khó bằng việc giải bài toán đó. Một bài toán khác bạn có thể dùng làm hardness assumption, discrete logarithm problem (DLP), thực ra là một họ các bài toán.

## Bài toán logarit rời rạc (The Discrete Logarithm Problem)

Discrete Logarithm Problem (DLP) có trước factoring problem trong lịch sử chính thức của cryptography. Trong khi RSA xuất hiện năm 1977, một đột phá cryptography khác, Diffie–Hellman key agreement (xem Chương 11), đã ra đời sớm hơn khoảng một năm, đặt nền tảng security của nó trên độ khó của DLP. Giống như factoring problem, DLP làm việc với các số lớn, nhưng nó kém đơn giản hơn và cần nhiều toán hơn factoring. Hãy bắt đầu bằng việc giới thiệu khái niệm toán học về group (nhóm) trong bối cảnh discrete logarithm.

### Group (Groups)

Trong bối cảnh toán học, một group là một tập phần tử (thường là các số) liên hệ với nhau theo một số quy tắc well-defined nhất định. Một ví dụ về group là tập các số nguyên khác không modulo một số nguyên tố p (tức là các số từ 1 đến p – 1) với phép nhân modular là phép toán của group. Chúng ta ký hiệu một group như vậy là (Z<sub>p</sub><sup>\*</sup>, ×), hoặc chỉ là Z<sub>p</sub><sup>\*</sup> khi đã rõ phép toán của group là phép nhân.

Với p = 5, bạn có group Z<sub>5</sub><sup>\*</sup> = {1, 2, 3, 4}. Trong group Z<sub>5</sub><sup>\*</sup>, các phép toán được thực hiện modulo 5; do đó, bạn không có 3 × 4 = 12 mà thay vào đó là 3 × 4 = 2, vì 12 mod 5 = 2. Dù vậy, bạn vẫn có thể dùng cùng ký hiệu (×) mà bạn dùng cho phép nhân số nguyên thông thường. Bạn cũng có thể dùng ký hiệu số mũ để biểu thị phép nhân một phần tử của group với chính nó mod p, một phép toán phổ biến trong cryptography. Ví dụ, trong bối cảnh Z<sub>5</sub><sup>\*</sup>, 2<sup>3</sup> = 2 × 2 × 2 = 3 chứ không phải 8, vì 8 mod 5 bằng 3.

Để là một group, một tập toán học và phép toán của nó phải có các đặc điểm sau, được gọi là các tiên đề group (group axiom):

**Closure (tính đóng)** Với bất kỳ hai phần tử x và y nào của group, x × y cũng thuộc group. Trong Z<sub>5</sub><sup>\*</sup>, 2 × 3 = 1 (vì 6 = 1 mod 5), 2 × 4 = 3, v.v.

**Associativity (tính kết hợp)** Với bất kỳ các phần tử x, y, z nào của group, (x × y) × z = x × (y × z). Trong Z<sub>5</sub><sup>\*</sup>, (2 × 3) × 4 = 1 × 4 = 2 × (3 × 4) = 2 × 2 = 4.

**Identity existence (tồn tại phần tử đơn vị)** Group có một phần tử e sao cho e × x = x × e = x. Một phần tử như vậy được gọi là phần tử đơn vị (identity). Trong mọi Z<sub>p</sub><sup>\*</sup>, phần tử đơn vị là 1.

**Inverse existence (tồn tại phần tử nghịch đảo)** Với bất kỳ x nào trong group, có một y sao cho x × y = y × x = e. Trong Z<sub>5</sub><sup>\*</sup>, nghịch đảo của 2 là 3, và nghịch đảo của 3 là 2, còn 4 là nghịch đảo của chính nó vì 4 × 4 = 16 = 1 mod 5.

Ngoài ra, một group là giao hoán (commutative), hay abelian, nếu x × y = y × x với mọi phần tử x và y của group. Điều đó cũng đúng với mọi multiplicative group các số nguyên Z<sub>p</sub><sup>\*</sup>. Đặc biệt, Z<sub>5</sub><sup>\*</sup>là giao hoán: 3 × 4 = 4 × 3, 2 × 3 = 3 × 2, v.v.

Một group là cyclic nếu có ít nhất một phần tử g sao cho các lũy thừa của nó (g<sup>1</sup>, g<sup>2</sup>, g<sup>3</sup>, v.v.) mod p bao phủ mọi phần tử phân biệt của group. Khi đó, phần tử g là một generator của group. Z<sub>5</sub><sup>\*</sup> là cyclic và có hai generator, 2 và 3, vì 2<sup>1</sup> = 2, 2<sup>2</sup> = 4, 2<sup>3</sup> = 3, 2<sup>4</sup> = 1, và 3<sup>1</sup> = 3, 3<sup>2</sup> = 4, 3<sup>3</sup> = 2, 3<sup>4</sup> = 1.

Lưu ý rằng tôi đang dùng phép nhân làm toán tử của group, nhưng bạn cũng có thể có group từ các toán tử khác. Ví dụ, group đơn giản nhất là tập mọi số nguyên, dương và âm, với phép cộng là phép toán của group. Hãy kiểm tra rằng các tiên đề group đúng với phép cộng, theo thứ tự ở trên: số x + y là một số nguyên nếu x và y là số nguyên (closure); (x + y) + z = x + (y + z) với mọi x, y và z (associativity); số không là phần tử đơn vị; và nghịch đảo của bất kỳ số x nào trong group là – x vì x + (–x) = 0 với mọi số nguyên x. Tuy nhiên, một khác biệt lớn là group số nguyên này có kích thước vô hạn, trong khi trong crypto bạn sẽ chỉ làm việc với các group hữu hạn, tức các group có số phần tử hữu hạn, vì lý do triển khai. Thông thường, bạn sẽ dùng các group Z<sub>p</sub><sup>\*</sup>, trong đó p dài hàng nghìn bit (tức là các group chứa khoảng 2<sup>m</sup> số nếu p dài m-bit).

### Điều khó (The Hard Thing)

Discrete logarithm problem như ban đầu được dùng trong cryptography là việc tìm y sao cho g<sup>y</sup> = x, khi có một generator g trong một group Z<sub>p</sub><sup>\*</sup> nào đó, trong đó p là một số nguyên tố, và khi có một phần tử y của group. Chúng ta thường biểu diễn DLP bằng ký hiệu cộng thay vì ký hiệu nhân, như trong các group elliptic curve. Trong trường hợp này, bài toán là tìm hệ số nhân k sao cho k × P = Q, trong đó bạn biết các điểm P và Q. Đây được gọi là elliptic curve DLP (ECDLP).

DLP là rời rạc (discrete) vì bạn làm việc với các số nguyên đếm được, trái ngược với các số thực không đếm được, và nó là một logarit vì bạn đang tìm logarit của x cơ số g. Ví dụ, logarit của 256 cơ số hai là 8 vì 2<sup>8</sup> = 256.

Factoring khó xấp xỉ ngang, do đó an toàn ngang, discrete logarithm. Thực tế, các algorithm giải DLP có những điểm tương đồng với các algorithm phân tích thừa số số nguyên, và bạn có được security level xấp xỉ như nhau với các số n-bit hard-to-factor như với discrete logarithm trong một group n-bit. Cũng vì lý do giống factoring, DLP không phải là NP-hard. (Có một số group nhất định mà DLP dễ giải hơn, nhưng chúng không được dùng trong cryptography, ít nhất là không ở những nơi cần độ khó của DLP.)

## Những gì có thể sai (How Things Can Go Wrong)

Hơn 40 năm sau, chúng ta vẫn không biết cách phân tích thừa số hiệu quả các số lớn hay giải discrete logarithm. Khi chưa có chứng minh toán học, luôn có thể phỏng đoán rằng một ngày nào đó chúng sẽ bị phá. Nhưng chúng ta cũng không có chứng minh rằng P ≠ NP, vì vậy bạn có thể phỏng đoán rằng P có thể bằng NP; tuy nhiên, theo các chuyên gia, bất ngờ đó khó có khả năng xảy ra. Phần lớn public-key crypto được triển khai ngày nay dựa vào factoring (RSA) hoặc DLP (Diffie–Hellman, ElGamal, elliptic curve cryptography). Dù toán học có thể không làm chúng ta thất vọng, các vấn đề real-world và lỗi của con người vẫn có thể lẻn vào.

### Khi factoring dễ (When Factoring Is Easy)

Phân tích thừa số các số lớn không phải lúc nào cũng khó. Ví dụ, hãy lấy số N 1,024-bit sau:

179769313486231590772930519078902473361797697894230657273430081157739343819933

842986982557174198257278917258638193709265819186026626180659730665062710995556

578639447715608415186895652841691982921107202317165369124890481512388558039053

427125099290315449262324709315263256083132540461407052872832790915388014592

Với các số 1,024-bit trong RSA encryption hoặc signature scheme, nơi N = pq, chúng ta kỳ vọng các algorithm phân tích thừa số tốt nhất cần khoảng 2<sup>70</sup> phép toán, như đã thảo luận trước đó. Nhưng bạn có thể phân tích thừa số số mẫu này trong vài giây bằng SageMath, một phần mềm toán học Python-based. Dùng function factor() của SageMath trên chiếc MacBook năm 2023 của tôi, mất chưa đến một giây để tìm ra factorization sau:

![p219_1](images/ch09_hard_problems/p219_1.png)

× 37414057161322375957408148834323969

Đúng vậy, tôi đã gian lận. Số này không có dạng N = pq vì nó không chỉ có hai thừa số nguyên tố lớn mà có đến năm thừa số, trong đó có những thừa số rất nhỏ, khiến nó dễ phân tích. Trước tiên, bạn xác định phần 2<sup>800</sup> × 641 × 6,700,417 bằng cách thử các số nguyên tố nhỏ từ một danh sách số nguyên tố được tính trước, điều này để lại cho bạn một số 192-bit dễ phân tích thừa số hơn nhiều so với một số 1,024-bit có hai thừa số lớn.

Factoring có thể dễ không chỉ khi n có các thừa số nguyên tố nhỏ mà còn khi N hoặc các thừa số p và q của nó có những dạng đặc biệt—ví dụ, khi N = pq với p và q đều gần một 2<sup>b</sup> nào đó, khi N = pq và một số bit của p hoặc q đã được biết, hoặc khi N có dạng N = p<sup>r</sup>q<sup>s</sup> và r lớn hơn log p. Tuy nhiên, việc trình bày chi tiết lý do của những điểm yếu này quá nặng về kỹ thuật đối với cuốn sách này.

Kết cục là các algorithm RSA encryption và signature (xem Chương 10) cần làm việc với một giá trị N = pq, trong đó p và q được chọn cẩn thận, để tránh việc N dễ bị phân tích thừa số, điều có thể dẫn đến một thảm họa security.

### Bài toán khó cỡ nhỏ thì không khó (Small Hard Problems Aren’t Hard)

Các bài toán khó về mặt tính toán, và ngay cả các algorithm exponential-time, cũng trở nên thực tế khi chúng đủ nhỏ. Một symmetric cipher có thể an toàn theo nghĩa không có attack nào nhanh hơn brute force 2<sup>n</sup>-time, nhưng nếu độ dài key là n = 32, bạn sẽ phá được cipher trong vài phút. Điều này nghe có vẻ hiển nhiên, và bạn sẽ nghĩ rằng không ai ngây thơ đến mức dùng key nhỏ, nhưng trong thực tế, có rất nhiều lý do khiến điều này có thể xảy ra. Sau đây là hai câu chuyện có thật.

Giả sử bạn là một developer không biết gì về crypto nhưng có một API nào đó để mã hóa bằng RSA và được yêu cầu mã hóa với security 128-bit. Bạn sẽ chọn kích thước RSA key nào? Tôi đã thấy những trường hợp thực tế dùng RSA 128-bit, tức RSA dựa trên một số 128-bit N = pq. Tuy nhiên, dù việc phân tích thừa số là khó đến mức phi thực tế với một N dài hàng nghìn bit, phân tích thừa số một số 128-bit lại rất dễ. Dùng phần mềm SageMath, các lệnh trong Listing 9-2 hoàn tất tức thì.

```
sage: p = random_prime(2**64)
sage: print(p)
6822485253121677229
sage: q = random_prime(2**64)
sage: print(q)
17596998848870549923
Sage: N = p*q
sage: factor(N)
6822485253121677229 * 17596998848870549923
```

Listing 9-2: Tạo một RSA modulus bằng cách chọn hai số nguyên tố ngẫu nhiên và phân tích thừa số nó tức thì

Listing 9-2 cho thấy bạn có thể dễ dàng phân tích thừa số một số 128-bit được lấy ngẫu nhiên là tích của hai số nguyên tố 64-bit trên một laptop thông thường. Tuy nhiên, nếu tôi chọn các số nguyên tố 1,024-bit thay vào đó bằng cách dùng p = random_prime(2\*\*1024), lệnh factor(p\*q) sẽ không bao giờ hoàn tất, ít nhất là không trong đời tôi.

Công bằng mà nói, các công cụ có sẵn không giúp ngăn chặn việc dùng ngây thơ các tham số ngắn không an toàn. Ví dụ, bộ công cụ OpenSSL từng cho phép bạn tạo RSA key ngắn chỉ 31 bit mà không có bất kỳ cảnh báo nào; những key ngắn như vậy hoàn toàn không an toàn, như Listing 9-3 cho thấy. OpenSSL đã được sửa từ đó, và phiên bản 1.1.1t của nó (từ tháng Hai năm 2023) trả về lỗi “key size too small” nếu bạn yêu cầu một key ngắn hơn 512 bit.

```
$ openssl genrsa 31
Generating RSA private key, 31 bit long modulus
.+++++++++++++++++++++++++++
.+++++++++++++++++++++++++++
e is 65537 (0x10001)
-----BEGIN RSA PRIVATE KEY-----
MCsCAQACBHHqFuUCAwEAAQIEP6zEJQIDANATAgMAjCcCAwCSBwICTGsCAhpp
-----END RSA PRIVATE KEY-----
```

Listing 9-3: Tạo một RSA private key không an toàn bằng một phiên bản cũ của bộ công cụ OpenSSL

Khi xem xét cryptography, bạn nên kiểm tra không chỉ loại algorithm được dùng mà còn cả tham số của chúng và độ dài các giá trị bí mật của chúng. Tuy nhiên, như bạn sẽ thấy trong câu chuyện sau, những gì đủ an toàn hôm nay có thể không an toàn vào ngày mai.

Năm 2015, các nhà nghiên cứu phát hiện rằng nhiều server HTTPS và email server hỗ trợ một phiên bản Diffie–Hellman key agreement protocol cũ hơn, không an toàn. Cụ thể, implementation TLS bên dưới hỗ trợ Diffie–Hellman trong một group, Z<sub>p</sub><sup>\*</sup>, được định nghĩa bởi một số nguyên tố, p, chỉ dài 512 bit, nơi discrete logarithm problem không còn là bất khả thi về mặt tính toán trong thực tế.

Không chỉ các server hỗ trợ một algorithm yếu, mà kẻ tấn công còn có thể buộc một client vô hại dùng algorithm đó bằng cách đưa traffic độc hại vào session của client. Tệ hơn nữa (tốt hơn cho kẻ tấn công), phần lớn nhất của attack có thể được thực hiện một lần và dùng lại để tấn công nhiều client. Sau khoảng một tuần tính toán để tấn công một group cụ thể, Z<sub>p</sub><sup>\*</sup>, chỉ mất 70 giây để phá từng session riêng lẻ của những người dùng khác nhau.

Một protocol an toàn là vô giá trị nếu nó bị phá hoại bởi một algorithm bị làm yếu, và một algorithm đáng tin cậy là vô dụng nếu bị phá hoại bởi các tham số yếu. Trong cryptography, bạn nên luôn đọc kỹ phần chữ nhỏ.

Để biết thêm chi tiết về câu chuyện này, hãy xem bài báo nghiên cứu “Imperfect Forward Secrecy: How Diffie–Hellman Fails in Practice” (https://weakdh.org/imperfect-forward-secrecy-ccs15.pdf).

## Đọc thêm (Further Reading)

Tôi khuyến khích bạn tìm hiểu sâu hơn các khía cạnh nền tảng của tính toán trong bối cảnh computability (những function nào có thể được tính?) và complexity (với chi phí bao nhiêu?) và cách chúng liên quan đến cryptography. Tôi chủ yếu nói về các lớp P và NP, nhưng còn nhiều lớp khác và nhiều điểm đáng quan tâm đối với các cryptographer. Tôi rất khuyến nghị cuốn sách Quantum Computing Since Democritus của Scott Aaronson (Cambridge University Press, 2013). Phần lớn nó nói về quantum computing, nhưng các chương đầu của nó giới thiệu complexity theory và cryptography một cách xuất sắc.

Trong tài liệu nghiên cứu cryptography, bạn sẽ tìm thấy các bài toán tính toán khó khác. Tôi sẽ đề cập đến chúng trong các chương sau, nhưng đây là một số ví dụ minh họa sự đa dạng của các bài toán được các cryptographer tận dụng:

• Diffie–Hellman problem (cho g<sup>x</sup> và g<sup>y</sup>, tìm g<sup>xy</sup>) là một biến thể của discrete logarithm problem và được dùng rộng rãi trong các key agreement protocol.

• Các bài toán lattice, như shortest vector problem (SVP) cũng như các bài toán short integer solutions (SIS) và learning with errors (LWE), có thể là NP-hard, tùy thuộc vào tham số của chúng.

• Các bài toán coding dựa trên độ khó của việc giải mã các mã error-correcting khi không có đủ thông tin và đã được nghiên cứu từ cuối những năm 1970. Chúng cũng có thể là NP-hard.

• Các bài toán multivariate liên quan đến việc giải các hệ phương trình phi tuyến và có thể là NP-hard, nhưng chúng đã không cung cấp được các cryptosystem đáng tin cậy, vì các phiên bản khó quá lớn và chậm, còn các phiên bản thực tế thì bị phát hiện là không an toàn.

Trong Chương 10, chúng ta sẽ tiếp tục tìm hiểu các bài toán khó, đặc biệt là factoring và biến thể chính của nó, RSA problem.
