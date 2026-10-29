<a id="p325"></a>

<a id="appA"></a>

# A Goal Structuring Notation

DOI: [10.1201/9781003598145-25](https://doi.org/10.1201/9781003598145-25)

[Chương 6](ch06_the_safety_case.vi.md) đề cập đến các ký hiệu Goal Structuring Notation (GSN) và Bayesian Belief Network (BBN) để biểu diễn một lập luận safety case. Phụ lục này đưa ra một mô tả ngắn gọn về GSN, còn [Phụ lục B](ch26_appendix_b_bayesian_belief_networks.vi.md) mô tả BBN.

GSN<a id="fn1_1cb"></a>[<sup>1</sup>](#fn1_1c) là một ký hiệu đồ họa được dùng để *“ghi lại một cách tường minh các phần tử và cấu trúc của một lập luận cùng mối quan hệ của lập luận với bằng chứng.”* Nó được tiêu chuẩn hóa trong tài liệu tham khảo [<a id="brefbib25_2"></a>[2](#refbib25_2)] và Safety Critical Systems Club duy trì tiêu chuẩn đó.

ISO/PAS 8800, ISO 26262-10 và tài liệu tham khảo [<a id="brefbib25_3"></a>[3](#refbib25_3)], được soạn với sự co-operation của Food and Drug Administration của Mỹ, nêu rõ GSN là một ký hiệu phù hợp cho một lập luận safety case.

Tóm lại, các ký hiệu đồ họa như sau:

- Một hình chữ nhật chứa một tuyên bố (được gọi là một “goal” theo GSN-speak). Đây sẽ là câu mà chúng ta muốn chứng tỏ là đúng.

  *Ví dụ: “Từ tiếng Đức chỉ thứ Sáu là ‘Freitag’.”*

- Một hình bình hành chứa một chiến lược: chiến lược nào được dùng để biện minh cho tuyên bố?

  *Ví dụ: “Chiến lược sẽ là tra một cuốn từ điển có uy tín.”*

- Một hình chữ nhật bo góc chứa một ngữ cảnh: tuyên bố được đưa ra trong một ngữ cảnh cụ thể.

  *Ví dụ: “Chúng tôi chỉ tuyên bố rằng từ tiếng Đức chỉ thứ Sáu là Freitag trong tiếng Đức hiện đại — chúng tôi không đưa ra tuyên bố nào về các dạng cũ hơn của ngôn ngữ này.”*

- Một hình bầu dục chứa một giả định: điều gì được giả định khi đưa ra tuyên bố?

  *Ví dụ: “Chúng tôi giả định rằng chỉ có một từ tiếng Đức duy nhất chỉ thứ Sáu”* (không giống, chẳng hạn, thứ Bảy).

- Một hình tròn biểu diễn một giải pháp: thực chất là một mô tả về bằng chứng sẽ được trình bày để biện minh cho tuyên bố.

  *Ví dụ: “Trang 234, cột thứ hai, của danh sách từ EU chính thức của Duden.”*

- Gạch bỏ một tuyên bố chỉ ra rằng nó đã bị đánh bại (xem [Mục 6.10](ch06_the_safety_case.vi.md#sec6_10)).

  *Ví dụ: “Nhưng danh sách từ EU chính thức của Duden được viết năm 1991 và không đại diện cho cách dùng hiện đại.*

- Một hình thoi biểu diễn công việc chưa hoàn tất; những hình này nên biến mất trong case cuối cùng.

<a id="fn1_1c"></a>

[<sup>1</sup>](#fn1_1cb)Xem [http://www.goalstructuringnotation.info/](http://www.goalstructuringnotation.info/) và tài liệu [<a id="brefbib25_1"></a>[1](#refbib25_1)].

<a id="p326"></a>Để minh họa định dạng GSN, hãy xét ví dụ biện minh cho tuyên bố của chúng ta rằng một thuật toán cụ thể mà chúng ta sẽ dùng trong một thiết bị là đúng. Chúng ta có các bằng chứng sau:

- Một chứng minh hình thức của một phiên bản đơn giản hóa của thuật toán, vì thuật toán đầy đủ đã tỏ ra quá khó đối với công cụ chứng minh hình thức. Thuật toán đơn giản hóa giống thuật toán thật ngoại trừ việc nó dùng các số infinite-precision thay vì các số dấu phẩy động IEEE 754.
- Một discrete event simulation của toàn bộ thuật toán, chạy qua không chỉ các điều kiện input bình thường, mà còn nhiều corner case và edge case. Các system test đã được sinh ra từ mô phỏng này.
- Hồ sơ của một đợt kiểm tra code được thực hiện trên phần hiện thực của thuật toán.
- Kết quả từ phòng thí nghiệm kiểm thử của chúng ta, nơi các test động đã được chạy trên phần hiện thực của thuật toán, bao gồm các test case được rút ra từ mô hình mô phỏng. Khi có thể, những kết quả này đã được kiểm tra đối chiếu với kết quả mô phỏng, nhưng không thể tái tạo trong phòng thí nghiệm mọi điều kiện đã gặp trong mô phỏng (đây là mối quan hệ bình thường giữa mô hình và kiểm thử động — mô phỏng chạy qua nhiều corner-cases hơn).

[Hình 6.3](ch06_the_safety_case.vi.md#fig6_3) ở trang 62 minh họa lập luận này ở dạng GSN: một phần rất nhỏ của một bức tranh lớn hơn nhiều. Tuyên bố chính (G152) là thuật toán thỏa đáng. Chiến lược của chúng ta là chứng tỏ rằng thuật toán đúng và phần hiện thực của chúng ta đúng. Sau đó chúng ta cung cấp các link (SN231, SN237, SN429, SN476) tới bằng chứng mà chúng ta tin là biện minh cho mỗi tuyên bố đó. Chúng ta đưa ra tuyên bố rằng thuật toán chỉ thỏa đáng nếu tốc độ lấy mẫu nhỏ hơn 250 mẫu/giây (C17). Mỗi node bằng chứng nên trỏ tới tài liệu, phân tích, hoặc file test case và kết quả.

Đây là loại sơ đồ có thể được mang đến cho assessor sớm trong quá trình phát triển, đặt câu hỏi: *“Nếu chúng tôi tìm được bằng chứng để hỗ trợ lập luận này, liệu nó có thuyết phục được ông không?”* Trong trường hợp này, auditor có thể trả lời rằng sẽ cần thêm bằng chứng ở dạng một phân tích về các lỗi làm tròn dấu phẩy động — điều tốt hơn là nên biết sớm thay vì muộn.

## Tài liệu tham khảo

<a id="refbib25_1"></a>[1] T. Kelly and R. Weaver, “The Goal Structuring Notation — A Safety Argument Notation,” in *Proc. of Dependable Systems and Networks 2004 Workshop on Assurance Cases*, 2004.[⏎](#brefbib25_1)

<a id="refbib25_2"></a>[2] SCSC, “*GSN Community Standard*,” Tech. Rep. SCSC-141C, Safety-Critical Systems Club, 2021. [https://scsc.uk/r141C](https://scsc.uk/r141C).[⏎](#brefbib25_2)

<a id="refbib25_3"></a>[3] C. Weinstock and J. Goodenough, “*Towards an Assurance Case Practice for Medical Devices*,” tech. rep., Software Engineering Institute, Carnegie Mellon, 2009.[⏎](#brefbib25_3)
