<a id="p43"></a>

<a id="chapter4"></a>

# 4 Các công ty tiêu biểu

DOI: [10.1201/9781003598145-4](https://doi.org/10.1201/9781003598145-4)

> *Bạn có thể biết một người qua những người mà anh ta giao du.*

Để các chương còn lại của cuốn sách này bớt trừu tượng, tôi giới thiệu hai công ty tưởng tượng trong chương này. Khi đó chúng ta có thể xem xét những khó khăn của họ trong khi họ thiết kế và phát triển sản phẩm để dùng trong các hệ thống safety-critical, và theo chân họ qua các quá trình chứng nhận.

## 4.1 Alpha Device Corporation

**Alpha Device Corporation** (viết tắt là ADC) sản xuất các thiết bị. Đối với mục đích của cuốn sách này, chúng ta không mấy quan tâm liệu đó là các thiết bị y tế được phát triển để đáp ứng IEC 62304/ISO 14971, các thiết bị ô tô (ISO 26262), các thiết bị đường sắt (EN 50716) hay các thiết bị công nghiệp (IEC 61508), nhưng để giảm bớt tính trừu tượng, hãy giả sử chúng là các thiết bị ô tô. Ở những chỗ có khác biệt lớn giữa việc phát triển thiết bị y tế và thiết bị ô tô, những khác biệt này sẽ được chỉ ra khi câu chuyện tiến triển.

Theo thuật ngữ của ngành công nghiệp ô tô, ADC là một nhà cung cấp “tier 1” cho một nhà sản xuất thiết bị gốc (OEM), tức là công ty thực sự sản xuất ô tô.

Dĩ nhiên, ADC không tự tạo ra mọi thành phần trong thiết bị; cả các thành phần phần cứng lẫn phần mềm đều được mua từ các nhà cung cấp và được tích hợp với code ứng dụng riêng của ADC.

Cụ thể, ADC dự định mua một thành phần phần mềm chính từ **Beta Component Incorporated** (BCI), đã thông báo cho BCI về điều này, nhưng đặt điều kiện cho việc mua hàng là BCI phải đạt được một chứng nhận ISO 26262 nói rằng thành phần đó phù hợp để dùng trong các “item” (thuật ngữ của ISO 26262 chỉ một hệ thống hoàn chỉnh được lắp vào ô tô) sẽ được chứng nhận ở Automotive Safety Integrity Level C (ASIL C).

ADC đã tiến thêm một bước trong đàm phán với BCI và đã chỉ định tổ chức chứng nhận mà BCI phải đạt được chứng nhận từ đó. Như được minh họa trong [Hình 3.1](ch03_safety_standards_and_certification.vi.md#fig3_1) ở trang 28, chứng nhận từ bất kỳ tổ chức chứng nhận nào đã được công nhận đều nên tương đương nhau, nhưng về mặt thương mại không phải lúc nào cũng vậy và, để việc chứng nhận của chính mình được dễ dàng, ADC muốn BCI dùng tổ chức chứng nhận của mình.

<a id="p44"></a>

## 4.2 <a id="p44"></a>Beta Component Incorporated

**Beta Component Incorporated** (BCI) sản xuất các thành phần phần mềm để các công ty như ADC dùng trong các ứng dụng mission- và safety-critical. Một lần nữa, đối với mục đích của chúng ta, các thành phần này là gì cũng không thực sự quan trọng; chúng có thể là database, hệ điều hành, communication stack, middleware high-availability hoặc journaling file system.

Để cuộc thảo luận cụ thể hơn, chúng ta sẽ giả sử rằng BCI sẽ cung cấp cho ADC một hệ điều hành và biết rằng việc bán hàng phụ thuộc vào việc đạt được chứng nhận ISO 26262 cho nó.

Vì hệ điều hành này không được phát triển riêng để dùng trong thiết bị của ADC: theo thuật ngữ của ISO 26262, nó là một “Safety Element Out Of Context” (SEooC) — xem [Mục 3.6.2.4](ch03_safety_standards_and_certification.vi.md#sec3_6_2_4). Nếu ADC là một nhà sản xuất thiết bị y tế, thay vì thiết bị ô tô, thì thành phần của BCI, theo thuật ngữ của IEC 62304, sẽ là “software of unknown provenance” (SOUP — phần mềm không rõ nguồn gốc).

Để đáp ứng cả thị trường ô tô lẫn thị trường y tế, có thể BCI đang làm việc để đạt được chứng nhận theo cả hai tiêu chuẩn cho hệ điều hành của mình.

<a id="sec4_3"></a>

## 4.3 Sử dụng một thành phần đã được chứng nhận

Những mô tả về ADC và BCI này rất đơn giản, nhưng chứa một câu có thể cần được mở rộng: “… đặt điều kiện cho việc mua hàng là Beta Component Incorporated phải đạt được một chứng nhận ISO 26262 nói rằng thành phần đó phù hợp để dùng trong các item sẽ được chứng nhận ở ASIL C.”

Biết rằng một thành phần đã được chứng nhận từ BCI nhiều khả năng sẽ đắt hơn thành phần chưa được chứng nhận tương đương (vốn có thể giống hệt), tại sao ADC lại đặt ra hạn chế này cho việc mua hàng?

Chúng ta sẽ giả sử rằng đây không phải, như đôi khi vẫn xảy ra, chỉ là một yêu cầu thiếu suy nghĩ từ ai đó trong phòng mua hàng của ADC, người không hiểu yêu cầu đó có nghĩa là gì và chỉ đơn giản sao chép nó từ một đơn đặt hàng trước đó.

Nếu đây là một quyết định có ý thức, thì ADC đã thực hiện một phép tính thương mại chứ không phải một phép tính kỹ thuật. Bằng việc mua một thành phần đã được chứng nhận, ADC không giảm trách nhiệm pháp lý của mình — các tiêu chuẩn nói rõ rằng nhà sản xuất thiết bị chịu trách nhiệm về mọi thành phần tạo nên thiết bị, dù được phát triển in-house hay mua từ một nhà cung cấp. Bằng việc mua một thành phần đã được chứng nhận, ADC đang giảm khối lượng công việc và rủi ro dự án của mình, và việc liệu khối lượng công việc thêm cần có nếu dùng phiên bản non-certified có lớn hơn chi phí tăng thêm của phiên bản đã được chứng nhận hay không là một quyết định thương mại.

Quyết định mua một thành phần đã được chứng nhận hay một thành phần tiêu chuẩn này được khám phá sâu hơn trong [Chương 8](ch08_using_pre_existing_software_components.vi.md). Dự án
