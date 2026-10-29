<a id="id669"></a>

# Phụ lục. Câu hỏi thảo luận (Appendix. Discussion Questions)

<a id="id279"></a>

## [Chương 1](ch01_introduction.vi.md#ch01-introduction): Giới thiệu (Introduction)

1. Bốn chiều định nghĩa software architecture là gì?<a id="id1756"></a><a id="ix_selfass"></a>
2. Sự khác biệt giữa một architecture decision và một design principle là gì?
3. Liệt kê tám kỳ vọng cốt lõi đối với một kiến trúc sư phần mềm.
4. Định luật thứ nhất của software architecture là gì?

<a id="id379"></a>

## [Chương 2](ch02_architectural_thinking.vi.md#ch-architectural-thinking): Tư duy kiến trúc (Architectural Thinking)

1. Nêu ba tiêu chí để xác định một quyết định thiên về architecture hay thiên về thiết kế.<a id="id1757"></a>
2. Liệt kê ba cấp kiến thức trong tam giác kiến thức và đưa ra một ví dụ cho mỗi cấp.
3. Vì sao đối với một kiến trúc sư, tập trung vào bề rộng kỹ thuật quan trọng hơn chiều sâu kỹ thuật?
4. Một số cách để duy trì chiều sâu kỹ thuật và giữ được sự hands-on với tư cách kiến trúc sư là gì?

<a id="id380"></a>

## [Chương 3](ch03_modularity.vi.md#ch-modularity): Modularity

1. Mô tả sự khác biệt giữa modularity và granularity, và đưa ra một ví dụ cho mỗi khái niệm.<a id="id1758"></a>
2. Sự khác biệt giữa coupling và cohesion là gì?
3. Thuật ngữ *connascence* có nghĩa là gì?
4. Sự khác biệt giữa static connascence và dynamic connascence là gì?
5. Dạng connascence mạnh nhất là gì?
6. Dạng connascence yếu nhất là gì?
7. Trong một code base, cái nào được ưu tiên hơn: static connascence hay dynamic connascence?

<a id="id414"></a>

## [Chương 4](ch04_architectural_characteristics_defined.vi.md#ch04-architecture-characteristics-defined): Định nghĩa các architecture characteristic (Architecture Characteristics Defined)<a id="id698"></a>

1. Một thuộc tính phải đáp ứng ba tiêu chí nào để được coi là một architecture characteristic?
2. Sự khác biệt giữa một characteristic ngầm định và một characteristic tường minh là gì? Đưa ra một ví dụ cho mỗi loại.
3. Đưa ra một ví dụ về một characteristic vận hành.
4. Đưa ra một ví dụ về một characteristic cấu trúc.
5. Đưa ra một ví dụ về một characteristic cross-cutting.
6. Vì sao không thể tạo ra một danh sách tiêu chuẩn industry-wide về các architecture characteristic?

<a id="id415"></a>

## [Chương 5](ch05_identifying_architectural_characteristics.vi.md#ch-identifying): Xác định các architectural characteristic (Identifying Architectural Characteristics)

1. Đưa ra một lý do vì sao giới hạn số lượng characteristic (“-ilities”) mà một architecture nên hỗ trợ là một thực hành tốt.<a id="id1759"></a>
2. Đúng hay sai? Hầu hết các architecture characteristic đến từ yêu cầu nghiệp vụ và user story.
3. Nếu một stakeholder kinh doanh tuyên bố rằng time to market (tức là đưa tính năng mới và bản sửa bug đến người dùng nhanh nhất có thể) là mối quan tâm kinh doanh quan trọng nhất, architecture sẽ cần hỗ trợ những architecture characteristic nào?
4. Sự khác biệt giữa scalability và elasticity là gì?
5. Định nghĩa của một architectural characteristic *tổng hợp* (composite) là gì? Đưa ra một ví dụ.

<a id="id416"></a>

## [Chương 6](ch06_measuring_and_governing_architecture_characteristics.vi.md#ch06-measuring): Đo lường và quản trị các architecture characteristic (Measuring and Governing Architecture Characteristics)

1. Vì sao cyclomatic complexity là một metric quan trọng đến vậy để phân tích cho architecture?<a id="id1760"></a>
2. Architecture fitness function là gì? Chúng có thể được dùng thế nào để phân tích một architecture?
3. Đưa ra một ví dụ về một architecture fitness function để đo scalability của một architecture.
4. Tiêu chí quan trọng nhất để một architecture characteristic cho phép kiến trúc sư và developer tạo fitness function là gì?

<a id="id417"></a>

## [Chương 7](ch07_the_scope_of_architectural_characteristics.vi.md#ch-scope): Phạm vi của các architectural characteristic (The Scope of Architectural Characteristics)

1. Architectural quantum là gì, và vì sao nó quan trọng đối với architecture?<a id="id1761"></a>
2. Giả sử một hệ thống gồm một giao diện người dùng duy nhất với bốn service được deploy độc lập, mỗi service chứa database riêng biệt. Hệ thống này sẽ có một quantum hay bốn quanta? Tại sao?
3. Sự khác biệt giữa coupling *tĩnh* (static) và *động* (dynamic) là gì? Đưa ra một ví dụ cho mỗi loại.
4. Vì sao giao tiếp *đồng bộ* có tác động tiềm tàng lớn hơn lên các architectural characteristic vận hành so với giao tiếp *bất đồng bộ*?

<a id="id381"></a>

## [Chương 8](ch08_component_based_thinking.vi.md#ch08-component-based-thinking): Tư duy dựa trên component (Component-Based Thinking)

1. Chúng tôi định nghĩa thuật ngữ *component* là một khối xây dựng của ứng dụng—một thứ mà ứng dụng làm. <a id="id1762"></a>Một component thường gồm một nhóm class hoặc file nguồn. Các component thường biểu hiện như thế nào trong một ứng dụng hoặc service?
2. Sự khác biệt giữa technical partitioning và domain partitioning là gì? Đưa ra một ví dụ cho mỗi loại.
3. Ưu điểm của domain partitioning là gì?
4. Trong những trường hợp nào technical partitioning sẽ là lựa chọn tốt hơn domain partitioning?
5. Entity Trap là gì? Vì sao nó không phải là một cách tiếp cận tốt để xác định component?
6. Khi nào bạn có thể chọn cách tiếp cận Workflow thay vì cách tiếp cận Actor/Action khi xác định các core component?

<a id="id382"></a>

## [Chương 9](ch09_foundations.vi.md#ch-architecture-styles): Nền tảng (Foundations)

1. Liệt kê tám ngộ nhận về tính toán phân tán.<a id="id1763"></a>
2. Nêu ba thách thức mà các architecture phân tán gặp phải còn các monolithic architecture thì không.
3. Stamp coupling là gì? Một số cách giải quyết stamp coupling là gì?
4. Sự khác biệt giữa technical partitioning và domain partitioning là gì?
5. Liệt kê ba characteristic phân biệt một architectural style với một pattern.

<a id="id383"></a>

## [Chương 10](ch10_layered_architecture_style.vi.md#ch-style-layered): Layered architecture style (Layered Architecture Style)

1. Sự khác biệt giữa một <a id="id1764"></a>layer mở và một layer đóng là gì?
2. Mô tả khái niệm *layers of isolation* và lợi ích của nó.
3. Antipattern Architecture Sinkhole là gì?
4. Một số architecture characteristic chính sẽ thúc đẩy bạn dùng layered architecture là gì?
5. Vì sao testability không được hỗ trợ tốt trong layered architecture style?
6. Vì sao agility không được hỗ trợ tốt trong layered architecture style?

<a id="id699"></a>

## [Chương 11](ch11_the_modular_monolith_architecture_style.vi.md#ch-style-modular-mono): Modular monolith architecture style (Modular Monolith Architecture Style)

1. Modular monolith khác với layered architecture n-tiered như thế nào?
2. Mô tả sự khác biệt giữa cách tiếp cận peer-to-peer và cách tiếp cận mediator khi giao tiếp giữa các module.
3. Ba rủi ro phổ biến gắn với modular monolith architectural style là gì?
4. Nêu ba điểm mạnh chính của modular monolith và khi nào bạn nên cân nhắc dùng nó.
5. Với tính module của nó, vì sao các characteristic vận hành như scalability và fault tolerance lại không tốt ở modular monolith?

<a id="id384"></a>

## [Chương 12](ch12_pipeline_architecture_style.vi.md#ch-style-pipeline): Pipeline architecture style (Pipeline Architecture Style)

1. Pipe trong một pipeline architecture có thể là hai chiều không?<a id="id1765"></a>
2. Nêu bốn loại filter và mục đích của chúng.
3. Một filter có thể gửi dữ liệu ra qua nhiều pipe không?
4. Giải thích vì sao pipeline architecture rất phù hợp với các môi trường cloud-based.
5. Pipeline architecture style được phân vùng theo kỹ thuật hay theo domain?
6. Pipeline architecture hỗ trợ modularity theo cách nào?

<a id="id385"></a>

## [Chương 13](ch13_microkernel_architecture_style.vi.md#ch-style-microkernel): Microkernel architecture style (Microkernel Architecture Style)

1. Một tên gọi khác của microkernel architecture style là gì?<a id="id1766"></a>
2. Trong những tình huống nào thì việc các plug-in component phụ thuộc vào các plug-in component khác là chấp nhận được?
3. Một số công cụ và framework có thể được dùng để quản lý plug-ins là gì?
4. Bạn sẽ làm gì nếu có một plug-in third-party không tuân theo plug-in contract chuẩn trong core system?
5. Đưa ra hai ví dụ về microkernel architecture style.
6. Những characteristic nào của core system quyết định mức độ “microkern-ality” của nó?
7. Vì sao microkernel architecture luôn là một architecture quantum duy nhất?
8. *Domain/architecture isomorphism* là gì?

<a id="id386"></a>

## [Chương 14](ch14_service_based_architecture_style.vi.md#ch-style-service-based): Architecture style dựa trên service (Service-Based Architecture Style)

1. Vì sao các service trong service-based architecture <a id="id1767"></a>được gọi là *domain service*?
2. Nêu hai rủi ro phổ biến gắn với service-based architecture.
3. Bạn có thể dùng những topology database nào (monolith, domain và dedicated) với service-based architecture?
4. Bạn có thể dùng những kỹ thuật nào để quản lý các thay đổi database trong một service-based architecture?
5. Domain service có cần container (như Docker) để chạy không?
6. Architecture style service-based hỗ trợ tốt những architecture characteristic nào?
7. Vì sao elasticity thường không được hỗ trợ tốt trong service-based architecture?
8. Làm sao bạn có thể tăng số lượng architecture quanta trong một service-based architecture?

<a id="id700"></a>

## [Chương 15](ch15_event_driven_architecture_style.vi.md#ch-style-eda): Architecture style hướng sự kiện (Event-Driven Architecture Style)

1. Nêu bốn khác biệt giữa sự kiện và message.
2. Sự khác biệt giữa một initiating event và một derived event là gì?
3. *Poison event* là gì?
4. Một event processor có thể kích hoạt nhiều derived event không? Nếu có, tại sao bạn lại muốn làm điều này?
5. Vì sao bạn lại kích hoạt một sự kiện từ một event processor mà không event processor nào khác phản hồi?
6. Một số trade-offs tiêu cực khi dùng xử lý bất đồng bộ là gì?
7. Mô tả antipattern Swarm of Gnats và giải thích vì sao bạn nên tránh nó.
8. Đưa ra hai lý do chính khiến event-driven architecture có responsiveness cao và có các characteristic performance tuyệt vời.
9. Một số kỹ thuật ngăn ngừa mất dữ liệu khi gửi và nhận message từ một queue là gì?

<a id="id387"></a>

## [Chương 16](ch16_space_based_architecture_style.vi.md#ch-style-space-based): Architecture style dựa trên không gian (Space-Based Architecture Style)

1. Kiến trúc space-based lấy tên từ đâu?<a id="id1768"></a>
2. Một khía cạnh chính của space-based architecture khiến nó khác với các architecture style khác là gì?
3. Nêu bốn component tạo nên virtualized middleware trong một space-based architecture.
4. Vai trò của data writer trong space-based architecture là gì?
5. Trong những điều kiện nào một service sẽ cần truy cập dữ liệu trong database thông qua data reader?
6. Kích thước cache nhỏ làm tăng hay giảm khả năng xảy ra data collision?
7. Sự khác biệt giữa replicated cache và distributed cache là gì? Cái nào thường được dùng trong space-based architecture?
8. Liệt kê ba architecture characteristic được hỗ trợ mạnh nhất trong space-based architecture.
9. Vì sao testability được đánh giá thấp như vậy đối với space-based architecture?

<a id="id388"></a>

## [Chương 17](ch17_orchestration_driven_service_oriented_architecture.vi.md#ch-style-esb-soa): Kiến trúc hướng service điều phối tập trung (Orchestration-Driven Service-Oriented Architecture)

1. Động lực chính <a id="id1769"></a>đằng sau service-oriented architecture là gì?
2. Bốn loại service chính trong một service-oriented architecture là gì?
3. Liệt kê một số yếu tố đã dẫn đến sự suy tàn của service-oriented architecture.
4. SOA được phân vùng theo kỹ thuật hay theo domain?
5. Tái sử dụng domain được giải quyết thế nào trong SOA? Tái sử dụng vận hành được giải quyết thế nào?
6. Công dụng chính của architecture style này trong các hệ thống hiện đại là gì?

<a id="id389"></a>

## [Chương 18](ch18_microservices_architecture.vi.md#ch-style-microservices): Microservices architecture (Microservices Architecture)

1. Mô tả khái niệm *bounded context* trong microservices. Vì sao nó then chốt đến vậy đối với microservices architecture?<a id="id1770"></a>
2. Vì sao việc cô lập dữ liệu trong một microservices architecture lại quan trọng đến vậy?
3. Mô tả ý nghĩa của *protocol-aware heterogeneous interoperability* và cách microservices hỗ trợ nó.
4. Sự khác biệt giữa orchestration và choreography trong microservices là gì? Đưa ra ví dụ về những trường hợp mà mỗi style giao tiếp này sẽ là lựa chọn phù hợp.
5. Vì sao microservices dùng topology database-per-service? Nó có thể dùng topology monolithic database hoặc domain database không?
6. Hai trong số những rủi ro lớn nhất trong microservices architecture là gì?
7. Vì sao agility, testability và deployability được hỗ trợ tốt như vậy trong microservices?
8. Ba lý do khiến performance thường là một vấn đề trong microservices là gì?
9. Mô tả một topology mà trong đó một hệ sinh thái microservices có thể chỉ có một quantum duy nhất.

<a id="id418"></a>

## [Chương 19](ch19_choosing_the_appropriate_architecture_style.vi.md#ch-choosing-style): Chọn architecture style phù hợp (Choosing the Appropriate Architecture Style)

1. Data <a id="id1771"></a>architecture của một hệ thống (cấu trúc của các mô hình dữ liệu logic và vật lý) ảnh hưởng đến lựa chọn architecture style của bạn theo cách nào?
2. Trình bày các bước mà một kiến trúc sư dùng để xác định architecture style, cách phân vùng dữ liệu và style giao tiếp của một hệ thống.
3. Yếu tố nào dẫn một kiến trúc sư hướng tới một architecture phân tán?
4. Một kiến trúc sư cần thực hiện hai phân tích đầu vào nào để chọn một architectural style phù hợp?

<a id="id701"></a>

## [Chương 20](ch20_architectural_patterns.vi.md#ch-architectural-patterns): Các architectural pattern (Architectural Patterns)

1. Nêu hai pattern triển khai mối quan tâm kiến trúc về tách biệt các mối quan tâm vận hành và domain.
2. Một workflow được orchestrate có component nào mà các workflow choreographed không có?
3. Một số ưu điểm của việc dùng một broker duy nhất trong event-driven architecture là gì? Một số nhược điểm là gì?
4. CQRS tách hai thao tác dữ liệu nào?

<a id="id390"></a>

## [Chương 21](ch21_architectural_decisions.vi.md#ch-architectural-decisions): Các quyết định kiến trúc (Architectural Decisions)

1. Antipattern Covering your Assets là gì?<a id="id1772"></a>
2. Một số kỹ thuật để tránh antipattern Email-Driven Architecture là gì?
3. Năm yếu tố mà Michael Nygard định nghĩa để xác định một thứ là architecturally significant là gì?
4. Năm phần cơ bản của một architecture decision record là gì?
5. Bạn thường thêm lý do biện minh cho một architecture decision vào phần nào của ADR?
6. Giả sử bạn không cần một phần Alternatives riêng, bạn sẽ liệt kê các phương án thay thế cho giải pháp đề xuất của mình trong phần nào của ADR?
7. Ba kịch bản cơ bản nào mà trong đó bạn sẽ đánh dấu trạng thái của một ADR là *Proposed*?

<a id="id391"></a>

## [Chương 22](ch22_analyzing_architecture_risk.vi.md#ch-analyzing-architecture-risk): Phân tích rủi ro kiến trúc (Analyzing Architecture Risk)

1. Hai chiều của ma trận đánh giá rủi ro là gì?<a id="id1773"></a>
2. Mô tả ba hoạt động chính trong risk storming.
3. Vì sao risk storming cần là một bài tập cộng tác?
4. Vì sao hoạt động xác định trong risk storming cần là một hoạt động cá nhân chứ không phải cộng tác?
5. Bạn sẽ làm gì nếu ba người tham gia xác định rủi ro là cao (6) cho một vùng cụ thể của architecture, nhưng một người tham gia khác xác định nó chỉ là trung bình (3)?
6. Bạn sẽ gán mức đánh giá rủi ro nào (1–9) cho các công nghệ chưa được kiểm chứng hoặc chưa biết?

<a id="id392"></a>

## [Chương 23](ch23_diagramming_architecture.vi.md#ch-diagramming-architecture): Vẽ sơ đồ architecture (Diagramming Architecture)

1. *Irrational artifact attachment* là gì, và vì sao nó quan trọng đối với việc ghi tài liệu và vẽ sơ đồ architecture?<a id="id1774"></a>
2. *4 Cs* của kỹ thuật mô hình hóa C4 là gì?
3. Khi vẽ sơ đồ architecture, các đường chấm giữa các component có nghĩa là gì?
4. Vì sao luôn quan trọng phải có tiêu đề và chú giải trong một sơ đồ architecture?

<a id="id393"></a>

## [Chương 24](ch24_making_teams_effective.vi.md#ch-making-teams-effective): Làm cho team hiệu quả (Making Teams Effective)

1. Ba loại tính cách kiến trúc sư là gì? Mỗi tính cách tạo ra loại ranh giới nào?<a id="id1775"></a>
2. Bạn nên xem xét năm yếu tố nào khi xác định mức độ tham gia của mình với team?
3. Ba dấu hiệu cảnh báo cho thấy team của bạn đang trở nên quá lớn là gì?
4. Liệt kê ba checklist cơ bản mà một development team nên dùng.

<a id="id394"></a>

## [Chương 25](ch25_negotiation_and_leadership_skills.vi.md#ch-negotiation-skills): Kỹ năng đàm phán và lãnh đạo (Negotiation and Leadership Skills)

1. Vì sao đàm phán là một kỹ năng quan trọng đến vậy đối với một kiến trúc sư?<a id="id1776"></a><a id="id1777"></a>
2. Nêu một số kỹ thuật đàm phán cho kịch bản khi một stakeholder kinh doanh khăng khăng đòi availability năm số chín, nhưng thực sự chỉ cần ba số chín.
3. Bạn có thể suy ra điều gì từ việc một stakeholder kinh doanh nói với bạn, “Tôi cần nó từ hôm qua”?
4. Vì sao kỹ thuật *demonstration defeats discussion* (trình diễn đánh bại tranh luận) lại hiệu quả đến vậy?
5. Quy tắc divide-and-conquer (chia để trị) là gì? Nó có thể được áp dụng thế nào khi đàm phán các architecture characteristic với một stakeholder kinh doanh? Đưa ra một ví dụ.
6. Liệt kê 4 Cs của architecture.
7. Giải thích vì sao một kiến trúc sư cần vừa thực dụng vừa có tầm nhìn.
8. Một số kỹ thuật để quản lý và giảm số lượng cuộc họp mà bạn được mời là gì?

<a id="id702"></a>

## [Chương 26](ch26_architectural_intersections.vi.md#ch-architecture-intersections): Các giao điểm của architecture (Architectural Intersections)

1. Bạn có thể dùng những kỹ thuật nào để bảo đảm sự gắn kết cấu trúc với architecture trong quá trình triển khai?
2. Giải thích vì sao gắn kết architecture và hạ tầng lại quan trọng đến vậy, và đưa ra một ví dụ về sự gắn kết này.
3. Đưa ra một ví dụ về trường hợp team topology có thể không gắn kết với architecture.
4. Vì sao một kiến trúc sư phụ trách một hệ thống cụ thể nên quan tâm đến giao điểm giữa architecture và tích hợp hệ thống? Đưa ra một ví dụ về trường hợp architecture có thể mất gắn kết với tích hợp hệ thống.
5. *Domain/architecture isomorphism* là gì, và vì sao nó quan trọng đến vậy khi xem xét giao điểm giữa architecture và doanh nghiệp?
6. Đưa ra một ví dụ về giao điểm giữa architecture và enterprise.

<a id="id703"></a>

## [Chương 27](ch27_the_laws_of_software_architecture_revisited.vi.md#ch-laws-revisited): Nhìn lại các định luật của software architecture (The Laws of Software Architecture, Revisited)

1. Liệt kê ba ưu điểm chung của thư viện dùng chung so với service dùng chung. Những ưu điểm này có nghĩa là kiến trúc sư nên *luôn luôn* chọn thư viện dùng chung khi trade-off này xuất hiện không?
2. Hệ quả thứ nhất của Định luật thứ nhất của software architecture là gì?
3. Vì sao hệ quả thứ hai của Định luật thứ nhất của software architecture khăng khăng rằng phân tích trade-off phải diễn ra lặp đi lặp lại?
4. Vì sao nhiều quyết định software architecture được hiểu tốt nhất trên một dải phổ thay vì như những lựa chọn nhị phân tiện lợi?
