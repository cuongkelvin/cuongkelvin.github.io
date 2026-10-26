# 1 Giới thiệu về VHDL

VHDL có một lịch sử phong phú và thú vị[^1]. Nhưng vì biết lịch sử này có lẽ sẽ không giúp bạn viết code VHDL tốt hơn, nó chỉ được nhắc qua ở đây. Những ai quan tâm có thể tìm thêm thông tin trong các tài liệu khác dài hơn hoặc qua search engine. Về từ viết tắt VHDL, chữ V là viết tắt của một từ viết tắt khác nữa: VHSIC, tức Very High-Speed Integrated Circuit. HDL là viết tắt của Hardware Description Language. Rõ ràng, tình hình kỹ thuật ngày nay đã chẳng còn cần đến những từ viết tắt lồng nhau. VHDL là một ngôn ngữ máy tính thực sự, đi kèm một bộ quy tắc về cú pháp và cách dùng. Nhưng, khác với các ngôn ngữ máy tính higher-level, VHDL chủ yếu được dùng để mô tả phần cứng. Phần lớn những người đã quen với một ngôn ngữ máy tính higher-level như C hay Java có xu hướng xem VHDL chỉ là thêm một ngôn ngữ máy tính nữa. Đây không hẳn là một cách tiếp cận tồi nếu cách nhìn đó giúp hiểu và ghi nhớ cú pháp và cấu trúc của ngôn ngữ. Sai lầm phổ biến của người theo cách tiếp cận này là cố lập trình bằng VHDL giống như cách họ lập trình một ngôn ngữ máy tính higher-level. Các ngôn ngữ máy tính Higher-level về bản chất là tuần tự; VHDL thì không.

VHDL được tạo ra để mô tả phần cứng, và thực tế VHDL là một ngôn ngữ concurrent. Điều này có nghĩa là, thông thường, các instruction VHDL đều được thực thi cùng một lúc (một cách concurrent), bất kể kích thước bản hiện thực của bạn. Một cách nhìn khác là các ngôn ngữ máy tính higher-level được dùng để mô tả thuật toán (thực thi tuần tự), còn VHDL được dùng để mô tả phần cứng (thực thi song song). Sự khác biệt cố hữu này hẳn sẽ thúc đẩy bạn re-think cách bạn viết code VHDL. Những nỗ lực viết code VHDL theo phong cách ngôn ngữ high-level thường cho ra code mà không ai hiểu nổi. Hơn nữa, các công cụ dùng để synthesize[^2] loại code này có xu hướng tạo ra những mạch thường không hoạt động đúng và có những bug gần như không thể lần ra. Và nếu mạch có thực sự hoạt động, nó nhiều khả năng sẽ kém hiệu quả do phần cứng tạo ra lớn một cách không cần thiết và quá phức tạp. Vấn đề này càng trầm trọng khi kích thước và độ phức tạp của các mạch của bạn càng tăng.

Các ngôn ngữ mô tả phần cứng như VHDL có hai mục đích chính. Thứ nhất, VHDL có thể được dùng để mô hình hóa các mạch và hệ thống số. Dù chữ “model” là một trong những từ bị dùng quá nhiều trong kỹ thuật, trong ngữ cảnh này nó chỉ đơn giản là một mô tả về một thứ gì đó, thể hiện một mức chi tiết nhất định. Điểm hay của VHDL là mức chi tiết này không mơ hồ nhờ các quy tắc cú pháp phong phú đi kèm với nó. Nói cách khác, VHDL cung cấp mọi thứ cần thiết để mô tả bất kỳ mạch số nào. Tương tự, một mạch/hệ thống số là bất kỳ mạch nào xử lý hoặc lưu trữ thông tin số. Thứ hai, có một dạng model nào đó của mạch cho phép tiếp đó simulation và/hoặc test mạch. Model VHDL cũng có thể được chuyển sang một dạng có thể dùng để tạo ra những mạch thực sự hoạt động. Model VHDL được các công cụ phần mềm diễn giải một cách kỳ diệu[^3] để tạo ra những mạch số thực sự, trong một quá trình gọi là synthesis.

Có những ngôn ngữ logic khác dùng để mô hình hóa hành vi của các thiết kế mạch số, và chúng dễ dùng vì cung cấp một phương pháp đồ họa để mô hình hóa mạch. Với những ngôn ngữ đó, người ta có xu hướng thích cách tiếp cận đồ họa vì nó có một learning curve rất dễ chịu. Nhưng, như bạn có thể dễ dàng hình dung, kiến thức ngày càng tăng của bạn về các khái niệm số đi kèm với độ phức tạp ever-increasing của các mạch số mà bạn phải xử lý. Việc nối một đống đường dây trên màn hình máy tính bằng đồ họa sẽ nhanh chóng trở nên nhàm chán. Cách tiếp cận thông minh hơn đối với thiết kế mạch số là bắt đầu với một hệ thống có khả năng mô tả chính xác cách mạch số của bạn hoạt động (nói cách khác, là mô hình hóa nó) mà không phải lo về chi tiết nối một số lượng lớn đường tín hiệu. Có kiến thức thực hành về VHDL sẽ cho bạn công cụ để mô hình hóa các mạch số theo một cách thông minh hơn nhiều.

Cuối cùng, bạn sẽ có thể dùng code VHDL của mình để tạo ra những mạch thực sự hoạt động. Điều này cho phép bạn hiện thực những mạch tương đối phức tạp trong một khoảng thời gian tương đối ngắn. Phương pháp thiết kế bạn sẽ dùng cho phép bạn dành nhiều thời gian hơn để thiết kế mạch và ít thời gian hơn để “lắp ráp” chúng. Thời của việc đặt, đi dây và gỡ lỗi nhiều mạch tích hợp trên một proto-board đã qua rồi.

VHDL là một ngôn ngữ rất thú vị, có thể cho phép thiết kế và hiện thực những chức năng có khả năng xử lý một lượng dữ liệu khổng lồ bằng cách dùng phần cứng tương đối low-cost và low-power. Hơn nữa, điều thực sự ấn tượng là, qua những module VHDL đơn giản, bạn có thể truy cập trực tiếp các sự kiện logic ns-level cơ bản, cũng như giao tiếp qua một cổng USB hay điều khiển một màn hình VGA để hiển thị đồ họa có độ phức tạp vừa phải.

Mô hình hóa mạch số bằng VHDL là một dạng digital design hiện đại, khác với các cách tiếp cận schematic-based. Người lập trình viết một mô tả lỏng về những gì mạch logic cuối cùng cần làm, và một compiler ngôn ngữ, trong trường hợp này gọi là synthesizer, cố gắng “suy ra” mạch logic vật lý cuối cùng thực sự phải như thế nào. Những người lập trình mới vào nghề không phải lúc nào cũng thuyết phục được synthesizer hiện thực một thứ có vẻ rất rõ ràng trong đầu họ. Một lựa chọn thay thế có phần old-fashioned cho một ngôn ngữ mô tả như VHDL là cách trong đó người lập trình chỉ đơn giản nối với nhau một số hữu hạn các khối số mà họ đã lấy từ một library, với nỗ lực đạt được cùng mục tiêu. Cách tiếp cận này không chỉ rất tốn thời gian mà còn tự nó mang tính hạn chế và rất dễ sai.

Digital design hiện đại chủ yếu là việc mô hình hóa các mạch số một cách thích hợp và duy trì một mô tả chất lượng về mạch. Việc còn lại bây giờ là học cách dùng VHDL đúng cách để mô tả những gì bạn muốn hiện thực.

## 1.1 Những quy tắc vàng của VHDL

Trước khi bắt đầu, đây là một vài điểm bạn không bao giờ được quên khi làm việc với VHDL.

VHDL là một ngôn ngữ hardware-design. Dù phần lớn mọi người có lẽ đã tiếp xúc với một dạng ngôn ngữ máy tính higher-level nào đó, những kỹ năng này chỉ áp dụng gián tiếp được cho VHDL. Khi làm việc với VHDL, bạn không lập trình, bạn đang “thiết kế phần cứng”. Code VHDL của bạn nên phản ánh thực tế này. Điều này có nghĩa là gì? Nó có nghĩa là, trừ khi bạn đang ở bên trong một số construct nhất định, các dòng code của bạn sẽ được thực thi gần như tất cả cùng một lúc. Nếu code VHDL của bạn trông quá giống code của một ngôn ngữ máy tính higher-level, nó có lẽ là code VHDL tồi. Điều này cực kỳ quan trọng.

Hãy có một hình dung tổng quát về việc phần cứng của bạn sẽ trông như thế nào. Dù VHDL vô cùng mạnh, nếu bạn không hiểu các construct số cơ bản, bạn có lẽ sẽ không thể tạo ra những mạch số hiệu quả. Digital design giống với lập trình bằng ngôn ngữ higher-level ở chỗ ngay cả việc lập trình phức tạp nhất ở bất kỳ mức nào cũng có thể được chia nhỏ thành một số construct lập trình đơn giản. Có một sự tương đồng mạnh với digital design ở chỗ ngay cả những mạch số phức tạp nhất cũng có thể được mô tả bằng các construct số cơ bản. Nói cách khác, nếu bạn không thể hình dung đại khái mạch số mà bạn đang cố mô hình hóa dưới dạng các mạch số cơ bản, bạn có lẽ sẽ dùng sai VHDL, và như vậy sẽ làm các vị thần VHDL nổi giận. VHDL rất hay, nhưng nó không kỳ diệu như thoạt đầu nó có vẻ.

## 1.2 Các công cụ cần cho việc phát triển VHDL

VHDL là một ngôn ngữ dùng để hiện thực phần cứng, mà phần cứng đó sẽ chạy phần mềm khác (ví dụ C). Field Programmable Gate Array (FPGA) có lẽ là thiết bị phổ biến nhất mà bạn có thể dùng cho các bản hiện thực VHDL của mình. Nếu bạn muốn viết code VHDL cho FPGA, bạn sẽ phải chơi theo những luật mà các nhà sản xuất FPGA lớn hiện nay đã đặt ra để giúp bạn (những luật này cũng bảo đảm họ tiếp tục tồn tại trên thị trường).

Việc hiện thực thành công một hệ thống VHDL-based đại khái đòi hỏi các bước sau: viết code VHDL, compile, simulation và synthesis. Tất cả các nhà sản xuất FPGA lớn đều có một bộ công cụ phần mềm và phần cứng mà bạn có thể dùng để thực hiện các bước nêu trên. Phần lớn các công cụ phần mềm này miễn phí nhưng không phải open-source. Tuy vậy, chính các công cụ này áp dụng một cơ chế license, theo đó việc trả một khoản tiền nhất định cho phép bạn tận dụng các tính năng phần mềm tinh vi hoặc có được các library độc quyền với rất nhiều thành phần (ví dụ một processor 32-bit) mà bạn có thể dễ dàng đưa vào project của riêng mình.

Nếu bạn không quan tâm đến các library độc quyền, bạn có thể dùng các giải pháp open-source (ví dụ GHDL[^4] hoặc BOOT[^5]), chúng sẽ cho phép bạn compile và simulate code VHDL của mình bằng công cụ open-source gcc[^6]. Vào thời điểm viết sách, chưa có giải pháp open-source nào cho quá trình synthesis. Tuy nhiên, synthesis có thể được thực hiện bằng một phiên bản free-license của công cụ phần mềm của bất kỳ nhà sản xuất FPGA lớn nào (ví dụ Xilinx Vivado).

Nhờ cộng đồng open-source, bạn có thể viết, compile và simulate các hệ thống VHDL bằng những giải pháp open-source tuyệt vời. Cuốn sách này sẽ chỉ cho bạn cách bắt đầu làm việc được với ngôn ngữ VHDL. Với các tác vụ tiếp theo như synthesis và nạp code của bạn vào FPGA, có thể dùng Xilinx Vivado[^7] miễn phí hoặc công cụ tương đương của Altera là Quartus.

---

[^1]: VHDL-Wikipedia: http://en.wikipedia.org/wiki/VHDL

[^2]: Synthesis: quá trình diễn giải code VHDL và xuất ra một định nghĩa về bản hiện thực mạch vật lý để lập trình lên một thiết bị như FPGA.

[^3]: Thực ra không phải phép thuật. Thực tế có một nền khoa học well-defined đứng sau nó.

[^4]: Simulator VHDL GHDL: http://ghdl.free.fr

[^5]: Công cụ phần mềm VHDL BOOT: https://github.com/fabriziotappero/Free-Range-VHDL-book

[^6]: Compiler open-source Multi-language GCC: http://gcc.gnu.org

[^7]: Xilinx Vivado: https://www.xilinx.com/products/design-tools/vivado.html
