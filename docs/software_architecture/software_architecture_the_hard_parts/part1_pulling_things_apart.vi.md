<a id="part1-pulling-things-apart"></a>

# Phần I. Tách rời mọi thứ (Pulling Things Apart)

Như nhiều người trong chúng ta đã khám phá khi còn nhỏ, một cách tuyệt vời để hiểu một thứ được ghép lại như thế nào là trước tiên tháo rời nó ra. Để hiểu các chủ đề phức tạp (như trade-offs trong các architecture phân tán), kiến trúc sư phải tìm ra nơi bắt đầu gỡ rối.

Trong cuốn sách [*What Every Programmer Should Know About Object-Oriented Design*](https://oreil.ly/bLPm4) (Dorset House), Meilir Page-Jones <a id="idm45798388336472"></a><a id="idm45798388335832"></a><a id="idm45798388335192"></a><a id="idm45798388334520"></a>đã đưa ra nhận xét sắc sảo rằng coupling trong architecture có thể được chia thành static coupling và dynamic coupling. Coupling *tĩnh* (static) chỉ cách các phần kiến trúc (class, component, service, v.v.) được *nối* với nhau: các phụ thuộc, mức độ coupling, các điểm kết nối, v.v. <a id="idm45798388332120"></a><a id="idm45798388331112"></a>Kiến trúc sư thường có thể đo static coupling tại thời điểm biên dịch vì nó biểu diễn các phụ thuộc tĩnh trong architecture.

Coupling *động* (dynamic) chỉ cách các phần <a id="idm45798388329336"></a><a id="idm45798388328072"></a><a id="idm45798388327400"></a>architecture *gọi* nhau: loại giao tiếp nào, thông tin gì được truyền, mức độ chặt chẽ của contract, v.v.

Mục tiêu của chúng tôi là tìm hiểu cách phân tích trade-off trong các architecture phân tán; để làm điều đó, chúng ta phải tách các mảnh chuyển động ra để có thể thảo luận chúng một cách riêng biệt nhằm hiểu chúng đầy đủ trước khi ghép chúng lại với nhau.

Phần I chủ yếu đề cập *cấu trúc kiến trúc* (architectural structure), cách các thứ được coupling tĩnh với nhau. Trong [Chương 2](ch02_discerning_coupling_in_software_architecture.vi.md#ch02-discerning), chúng tôi giải quyết vấn đề định nghĩa phạm vi của static coupling và dynamic coupling trong architecture, và trình bày toàn bộ bức tranh mà chúng ta phải tách ra để hiểu. [Chương 3](ch03_architectural_modularity.vi.md#ch03-architectural-modularity) bắt đầu quá trình đó, định nghĩa modularity và sự tách biệt trong architecture. [Chương 4](ch04_architectural_decomposition.vi.md#ch04-architectural-decomposition) cung cấp công cụ để đánh giá và phân rã codebase, và [Chương 5](ch05_component_based_decomposition_patterns.vi.md#ch05-decomposition-patterns) cung cấp các pattern hỗ trợ quá trình đó.

Dữ liệu và transaction ngày càng trở nên quan trọng trong architecture, dẫn dắt nhiều quyết định trade-off của kiến trúc sư và DBA. [Chương 6](ch06_pulling_apart_operational_data.vi.md#ch06-decomposing-operational-data) đề cập các tác động kiến trúc của dữ liệu, bao gồm cách dung hòa ranh giới service và ranh giới dữ liệu. Cuối cùng, [Chương 7](ch07_service_granularity.vi.md#ch07-service-granularity) gắn kết coupling kiến trúc với các mối quan tâm dữ liệu để định nghĩa *integrator* và *disintegrator*—những lực thúc đẩy kích thước và ranh giới service lớn hơn hoặc nhỏ hơn.
