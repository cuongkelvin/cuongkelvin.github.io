# Bảng thuật ngữ

absolute address Địa chỉ thực tế của biến hoặc routine trong memory.

abstraction Mô hình tạm che giấu chi tiết lower-level của hệ thống máy tính để thuận tiện thiết kế hệ thống phức tạp.

access bit Còn gọi là use bit hoặc reference bit. Trường được đặt mỗi khi truy cập một page, dùng để triển khai LRU hoặc các phương án thay thế khác.

acronym Từ được tạo bằng các chữ cái đầu của một chuỗi từ. Ví dụ: RAM là acronym của Random Access Memory, CPU là acronym của Central Processing Unit.

active matrix display Liquid crystal display dùng transistor để điều khiển sự truyền ánh sáng tại từng pixel riêng lẻ.

address Giá trị dùng để xác định vị trí của phần tử dữ liệu cụ thể trong memory array.

address translation Còn gọi là address mapping. Quá trình ánh xạ virtual address sang địa chỉ dùng để truy cập memory.

addressing mode Một trong những cách định địa chỉ được phân biệt theo cách dùng operand và/hoặc địa chỉ.

aliasing Tình huống hai địa chỉ truy cập cùng đối tượng; có thể xảy ra trong virtual memory khi hai virtual address chỉ cùng physical page.

alignment restriction Yêu cầu dữ liệu được căn chỉnh trong memory theo các ranh giới tự nhiên.

Amdahl’s Law Quy tắc phát biểu rằng mức cải thiện hiệu năng đạt được từ một cải tiến bị giới hạn bởi mức sử dụng tính năng được cải tiến. Đây là phiên bản định lượng của quy luật lợi ích giảm dần.

AND Phép toán logic bit-by-bit với hai operand, chỉ cho kết quả 1 nếu cả hai operand đều có bit 1.

antidependence Còn gọi là name dependence. Thứ tự bị buộc bởi việc dùng lại tên, thường là register, thay vì true dependence mang giá trị giữa hai instruction.

antifuse Cấu trúc trong integrated circuit khi được lập trình sẽ tạo kết nối vĩnh viễn giữa hai dây dẫn.

application binary interface (ABI) Phần dành cho người dùng của instruction set cộng các operating system interface mà lập trình viên ứng dụng dùng. Nó định nghĩa tiêu chuẩn binary portability giữa máy tính.

architectural registers Tập register nhìn thấy được trong instruction set của processor; ví dụ trong RISC-V là 32 integer register và 32 floating-point register.

arithmetic intensity Tỷ số số phép toán floating-point trong chương trình trên số byte dữ liệu chương trình truy cập từ main memory.

arithmetic logic unit (ALU) Hardware thực hiện cộng, trừ và thường cả phép logic như AND và OR.

assembler Chương trình dịch phiên bản ký hiệu của instruction thành phiên bản nhị phân.

assembler directive Thao tác cho assembler biết cách dịch chương trình nhưng không tạo machine instruction; luôn bắt đầu bằng dấu chấm.

assembly language Ngôn ngữ ký hiệu có thể dịch sang machine language nhị phân.

asserted Tín hiệu ở mức logic cao hoặc đúng.

asserted signal Tín hiệu có giá trị (logic) đúng, hay 1.

backpatching Phương pháp dịch assembly language thành machine instruction, trong đó assembler tạo biểu diễn nhị phân (có thể chưa đầy đủ) cho mọi instruction trong một lượt qua chương trình rồi quay lại điền các label trước đó chưa định nghĩa.

basic block Chuỗi instruction không có branch (trừ có thể ở cuối), không có branch target hoặc branch label (trừ có thể ở đầu).

behavioral specification Mô tả cách hệ thống số hoạt động về chức năng.

benchmark Chương trình được chọn để so sánh hiệu năng máy tính.

biased notation Ký hiệu biểu diễn giá trị âm nhất bằng 00…000<sub>two</sub> và dương nhất bằng 11…11<sub>two</sub>, với 0 thường có giá trị 10…00<sub>two</sub>, qua đó dịch giá trị sao cho số cộng bias có biểu diễn không âm.

binary digit Còn gọi là binary bit. Một trong hai số cơ số 2, 0 hoặc 1, tạo thành thông tin.

bisection bandwidth Bandwidth giữa hai nửa bằng nhau của multiprocessor. Thước đo dành cho cách chia worst-case của multiprocessor.

block (or line) Đơn vị thông tin nhỏ nhất có thể hiện diện hoặc không hiện diện trong cache.

blocking assignment Trong Verilog, phép gán hoàn tất trước khi thực thi câu lệnh tiếp theo.

branch address table Còn gọi là branch table. Bảng địa chỉ của những chuỗi instruction thay thế.

branch-and-link instruction Instruction branch đến một địa chỉ, đồng thời lưu địa chỉ instruction tiếp theo vào register (thường là x1 trong RISC-V).

branch not taken or (untaken branch) Branch có điều kiện sai và program counter (PC) trở thành địa chỉ instruction theo ngay sau branch trong thứ tự tuần tự.

branch prediction Phương pháp giải quyết branch hazard bằng cách giả định kết quả conditional branch rồi tiếp tục theo giả định đó thay vì chờ xác định kết quả thực.

branch prediction buffer Còn gọi là branch history table. Memory nhỏ được index bằng phần thấp của địa chỉ branch instruction, chứa một hoặc nhiều bit chỉ branch gần đây có taken hay không.

branch taken Branch có điều kiện thỏa mãn và program counter (PC) trở thành branch target. Mọi unconditional branch đều là taken branch.

branch target address Địa chỉ được xác định trong branch, trở thành program counter (PC) mới nếu branch taken. Trong RISC-V architecture, branch target bằng tổng immediate field của instruction và địa chỉ branch.

branch target buffer Cấu trúc cache PC đích hoặc instruction đích của branch. Thường tổ chức như cache có tag, nên tốn kém hơn prediction buffer đơn giản.

bus Trong logic design, tập data line được xử lý chung như một tín hiệu logic; cũng là tập line chia sẻ với nhiều nguồn và cách dùng.

cache memory Memory nhỏ, nhanh làm buffer cho memory chậm hơn, lớn hơn.

cache miss Yêu cầu dữ liệu từ cache không thể đáp ứng vì dữ liệu không hiện diện trong cache.

callee Procedure thực thi chuỗi instruction đã lưu dựa trên tham số caller cung cấp rồi trả quyền điều khiển về caller.

callee-saved register Register được routine thực hiện procedure call lưu lại.

caller Chương trình khởi gọi procedure và cung cấp giá trị tham số cần thiết.

caller-saved register Register được routine được gọi lưu lại.

capacity miss Cache miss xảy ra vì cache, ngay cả khi full associativity, không chứa được mọi block cần để đáp ứng yêu cầu.

central processing unit (CPU) Còn gọi là central processor unit hay processor. Phần hoạt động của máy tính, chứa datapath và control, cộng số, kiểm tra số, phát tín hiệu kích hoạt thiết bị I/O, v.v.

clock cycle Còn gọi là tick, clock tick, clock period, clock hoặc cycle. Thời gian một clock period, thường của processor clock.

clock cycles per instruction (CPI) Số clock cycle trung bình cho mỗi instruction của chương trình hoặc đoạn chương trình.

clock period Độ dài mỗi clock cycle.

clock skew Chênh lệch thời gian tuyệt đối giữa thời điểm hai state element nhận thấy clock edge.

clocking methodology Cách xác định khi nào dữ liệu hợp lệ và ổn định so với clock.

Cloud Computing chỉ tập hợp server lớn cung cấp dịch vụ qua Internet; một số nhà cung cấp cho thuê số lượng server thay đổi linh hoạt như dịch vụ tiện ích.

cluster Tập máy tính kết nối qua local area network hoạt động như một multiprocessor lớn duy nhất.

clusters Tập hợp máy tính kết nối qua I/O trên network switch tiêu chuẩn để tạo message-passing multiprocessor.

coarse-grained multithreading Phiên bản hardware multithreading chỉ chuyển thread sau sự kiện đáng kể, như last-level cache miss.

combinational element Phần tử thực hiện thao tác, như AND gate hoặc ALU.

combinational logic Hệ thống logic có các block không chứa memory, vì vậy tính cùng output khi cho cùng input.

commit unit Đơn vị trong pipeline dynamic hay out-of-order execution quyết định khi nào an toàn để đưa kết quả thao tác ra register programmer-visible và memory.

compiler Chương trình dịch câu lệnh ngôn ngữ high-level thành câu lệnh assembly language.

compulsory miss Còn gọi là cold-start miss. Cache miss do lần đầu truy cập block chưa từng ở trong cache.

conditional branch Instruction kiểm tra giá trị và cho phép chuyển quyền điều khiển tiếp đến địa chỉ mới trong chương trình dựa trên kết quả kiểm tra.

conflict miss Còn gọi là collision miss. Cache miss trong cache set-associative hoặc direct-mapped khi nhiều block tranh cùng set, được loại bỏ trong fully associative cache cùng kích thước.

context switch Thay đổi trạng thái nội bộ processor để process khác dùng processor, gồm lưu trạng thái cần thiết để trở lại process đang thực thi.

control Thành phần processor điều khiển datapath, memory và thiết bị I/O theo instruction của chương trình.

control hazard Còn gọi là branch hazard. Xuất hiện khi instruction đúng không thể thực thi trong pipeline clock cycle đúng vì instruction đã fetch không phải instruction cần thiết; tức luồng địa chỉ instruction khác điều pipeline dự kiến.

control signal Tín hiệu dùng chọn multiplexor hoặc chỉ đạo thao tác functional unit; khác data signal chứa thông tin được functional unit thao tác.

correlating predictor Branch predictor kết hợp hành vi cục bộ của branch cụ thể với thông tin toàn cục về hành vi của một số branch mới thực thi gần đây.

CPU execution time Còn gọi là CPU time. Thời gian thực tế CPU dành tính toán cho tác vụ cụ thể.

crossbar network Mạng cho phép node bất kỳ giao tiếp node bất kỳ khác bằng một lượt qua mạng.

D flip-flop Một flip-flop có một data input, lưu giá trị tín hiệu input đó vào memory nội bộ khi có clock edge.

data hazard Còn gọi là pipeline data hazard. Khi instruction dự kiến không thể thực thi đúng clock cycle vì dữ liệu cần để thực thi chưa sẵn có.

data race Hai truy cập memory tạo data race nếu đến từ các thread khác nhau đến cùng vị trí, ít nhất một là ghi và chúng xảy ra nối tiếp nhau.

data segment Segment trong UNIX object file hoặc executable file chứa biểu diễn nhị phân của dữ liệu đã khởi tạo mà chương trình dùng.

data transfer instruction Lệnh di chuyển dữ liệu giữa memory và register.

data-level parallelism Parallelism đạt được bằng cách thực hiện cùng thao tác trên dữ liệu độc lập.

datapath Thành phần processor thực hiện phép số học.

datapath element Đơn vị dùng thao tác hoặc giữ dữ liệu bên trong processor. Trong RISC-V implementation, datapath element gồm instruction memory và data memory, register file, ALU và adder.

deasserted Tín hiệu ở mức logic thấp hoặc sai.

deasserted signal Tín hiệu có giá trị (logic) sai, hay 0.

decoder Logic block có input n-bit và 2n output, trong đó chỉ một output asserted cho mỗi tổ hợp input.

defect Lỗi cực nhỏ trong wafer hoặc các bước tạo mẫu có thể khiến die chứa lỗi không hoạt động.

delayed branch Một loại branch trong đó instruction ngay sau branch luôn được thực thi, bất kể điều kiện branch đúng hay sai.

die Các phần hình chữ nhật riêng lẻ cắt từ wafer, thường gọi thân thuộc hơn là chip.

direct-mapped cache Cấu trúc cache mà mỗi vị trí memory ánh xạ đến đúng một vị trí cache.

dividend Số bị chia.

divisor Số dùng để chia dividend.

don’t-care term Phần tử của hàm logic có output không phụ thuộc giá trị của mọi input. Don’t-care term có thể được chỉ định theo nhiều cách.

double precision Giá trị floating-point biểu diễn trong doubleword 64-bit.

doubleword Một đơn vị truy cập tự nhiên khác trong máy tính, thường là nhóm 64 bit; tương ứng kích thước register trong RISC-V architecture.

dynamic branch prediction Dự đoán branch lúc chạy bằng thông tin lúc chạy.

dynamic multiple issue Cách triển khai processor multiple-issue mà processor đưa ra nhiều quyết định trong lúc thực thi.

dynamic pipeline scheduling Hardware hỗ trợ sắp xếp lại thứ tự thực thi instruction để tránh stall.

dynamic random access memory (DRAM) Memory chế tạo dưới dạng integrated circuit; cung cấp random access đến mọi vị trí. Thời gian truy cập 50 nanosecond và chi phí mỗi gigabyte năm 2012 là $5 đến $10.

dynamically linked libraries (DLLs) Các library routine được link vào chương trình trong lúc thực thi.

edge-triggered clocking Cơ chế clocking mà mọi thay đổi trạng thái xảy ra tại clock edge.

embedded computer Máy tính bên trong thiết bị khác, dùng chạy một ứng dụng hay tập software xác định trước.

EOR Phép toán logic bit-by-bit với hai operand tính exclusive OR của hai operand. Tức chỉ cho 1 nếu hai operand có giá trị khác nhau.

error detection code Code cho phép phát hiện lỗi dữ liệu nhưng không xác định vị trí chính xác, vì thế không sửa được lỗi.

exception Còn gọi là interrupt. Sự kiện không được lập lịch làm gián đoạn thực thi chương trình; dùng phát hiện overflow.

exception enable Còn gọi là interrupt enable. Tín hiệu hoặc hành động điều khiển process có đáp ứng exception hay không; cần để ngăn exception trong khoảng trước khi processor lưu an toàn trạng thái cần để khởi động lại.

executable file Chương trình hoạt động được theo định dạng object file không chứa tham chiếu chưa giải quyết. Có thể chứa symbol table và thông tin debug. “Stripped executable” không chứa thông tin đó. Có thể có thông tin relocation cho loader.

exponent Trong hệ biểu diễn số của floating-point arithmetic, giá trị được đặt trong exponent field.

external label Còn gọi là global label. Label chỉ đối tượng có thể được tham chiếu từ file khác với file định nghĩa nó.

false sharing Khi hai shared variable không liên quan nằm trong cùng cache block và cả block được trao đổi giữa processor dù các processor truy cập biến khác nhau.

field programmable devices (FPD) Integrated circuit chứa combinational logic và có thể cả memory device mà người dùng cuối cấu hình được.

field programmable gate array (FPGA) Integrated circuit cấu hình được, chứa cả combinational logic block lẫn flip-flops.

fine-grained multithreading Phiên bản hardware multithreading chuyển thread sau mỗi instruction.

finite-state machine Hàm sequential logic gồm tập input và output, hàm next-state ánh xạ trạng thái hiện tại và input sang trạng thái mới, và hàm output ánh xạ trạng thái hiện tại cùng có thể cả input sang tập output asserted.

flash memory Nonvolatile semiconductor memory. Rẻ hơn, chậm hơn DRAM nhưng đắt hơn trên mỗi bit và nhanh hơn magnetic disk. Thời gian truy cập khoảng 5 đến 50 microsecond và chi phí mỗi gigabyte năm 2012 là $0.75 đến $1.00.

flip-flop Memory element có output bằng giá trị trạng thái lưu bên trong, và trạng thái nội bộ chỉ thay đổi tại clock edge.

floating point Số học máy tính biểu diễn số với dấu chấm nhị phân không cố định.

flush Loại bỏ instruction trong pipeline, thường vì sự kiện ngoài dự kiến.

formal parameter Biến làm đối số cho procedure hoặc macro; được thay bằng đối số đó khi macro được mở rộng.

forward reference Label được dùng trước khi định nghĩa.

forwarding Còn gọi là bypassing. Phương pháp giải quyết data hazard bằng cách lấy phần tử dữ liệu thiếu từ buffer nội bộ thay vì chờ nó đến từ register programmer-visible hoặc memory.

fraction Giá trị, thường giữa 0 và 1, đặt trong fraction field.

frame pointer Giá trị biểu thị vị trí các register đã lưu và biến cục bộ của procedure cụ thể.

fully associative cache Cấu trúc cache trong đó block có thể được đặt ở bất kỳ vị trí nào trong cache.

fully connected network Mạng kết nối các node processor-memory bằng cách cung cấp đường truyền chuyên dụng giữa mọi node.

fused multiply add Instruction floating-point thực hiện cả phép nhân lẫn phép cộng, nhưng chỉ làm tròn một lần sau phép cộng.

gate Thiết bị thực hiện chức năng logic cơ bản như AND hoặc OR.

global miss rate Tỷ lệ tham chiếu bị miss ở mọi mức của multilevel cache.

global pointer Register được dành riêng để trỏ vào static area.

guard Bit đầu tiên trong hai bit bổ sung được giữ bên phải trong tính toán trung gian số floating-point; dùng cải thiện độ chính xác làm tròn.

handler Tên software routine được gọi để “xử lý” exception hoặc interrupt.

hardware description language Ngôn ngữ lập trình mô tả hardware, dùng tạo mô phỏng thiết kế hardware và làm input cho synthesis tool có thể tạo hardware thực.

hardware multithreading Tăng mức sử dụng processor bằng cách chuyển sang thread khác khi một thread bị stall.

hardware synthesis tools Software Computer-aided design có thể tạo thiết kế gate-level dựa trên mô tả hành vi hệ thống số.

hexadecimal Số cơ số 16.

high-level programming language Ngôn ngữ portable như C, C++, Java hoặc Visual Basic, gồm từ ngữ và ký hiệu đại số mà compiler có thể dịch thành assembly language.

hit rate Tỷ lệ truy cập memory tìm được trong một mức của memory hierarchy.

hit time Thời gian cần để truy cập một mức memory hierarchy, gồm thời gian xác định truy cập là hit hay miss.

hold time Thời gian tối thiểu input phải hợp lệ sau clock edge.

implementation Hardware tuân theo abstraction của architecture.

imprecise interrupt Còn gọi là imprecise exception. Interrupt hoặc exception trong máy tính pipeline không gắn với chính xác instruction gây ra interrupt hoặc exception.

in-order commit Commit mà kết quả thực thi pipeline được ghi vào trạng thái lập trình viên thấy được theo cùng thứ tự instruction được fetch.

input device Cơ chế đưa thông tin vào máy tính, như microphone.

instruction Mệnh lệnh mà hardware máy tính hiểu và tuân theo.

instruction count Số instruction được chương trình thực thi.

instruction format Dạng biểu diễn instruction gồm các trường số nhị phân.

instruction latency Execution time vốn có của instruction.

instruction-level parallelism Parallelism giữa các instruction.

instruction mix Thước đo tần suất động của instruction trong một hoặc nhiều chương trình.

instruction set architecture Còn gọi là architecture. Interface trừu tượng giữa hardware và software lowest-level, bao hàm mọi thông tin cần để viết chương trình machine language chạy đúng, gồm instruction, register, truy cập memory, I/O, v.v.

integrated circuit Còn gọi là chip. Thiết bị kết hợp hàng chục đến hàng triệu transistor.

interrupt Exception đến từ bên ngoài processor. (Một số architecture dùng thuật ngữ interrupt cho mọi exception.)

interrupt handler Đoạn code chạy do exception hoặc interrupt.

issue packet Tập instruction được issue cùng nhau trong một clock cycle; packet có thể do compiler xác định tĩnh hoặc processor xác định động.

issue slots Các vị trí mà instruction có thể issue trong clock cycle nhất định; tương tự vị trí trên bàn đạp xuất phát của cuộc chạy nước rút.

Java bytecode Instruction thuộc instruction set thiết kế để thông dịch chương trình Java.

Just In Time compiler (JIT) Tên thường đặt cho compiler hoạt động lúc chạy, dịch các đoạn code thông dịch thành native code của máy tính.

latch Memory element có output bằng giá trị trạng thái lưu bên trong, và trạng thái thay đổi bất cứ khi nào input thích hợp thay đổi trong khi clock asserted.

latency (pipeline) Số stage trong pipeline hoặc số stage giữa hai instruction trong lúc thực thi.

least recently used (LRU) Phương án thay thế mà block bị thay là block không được dùng lâu nhất.

least significant bit Bit ngoài cùng bên phải trong RISC-V doubleword.

level-sensitive clocking Phương pháp định thời mà trạng thái thay đổi ở mức clock cao hoặc thấp, nhưng không tức thời như thay đổi trong thiết kế edge-triggered.

linker Còn gọi là link editor. Chương trình hệ thống kết hợp các chương trình machine language đã assemble độc lập và giải quyết mọi label chưa định nghĩa thành executable file.

liquid crystal display Công nghệ màn hình dùng lớp polymer lỏng mỏng để truyền hoặc chặn ánh sáng tùy có áp điện tích hay không.

load-use data hazard Dạng data hazard cụ thể mà dữ liệu đang được load instruction nạp chưa sẵn có khi instruction khác cần.

loader Chương trình hệ thống đặt object program vào main memory để sẵn sàng thực thi.

local area network (LAN) Mạng thiết kế để truyền dữ liệu trong vùng địa lý giới hạn, thường trong một tòa nhà.

local label Label chỉ đối tượng chỉ được dùng trong file định nghĩa nó.

local miss rate Tỷ lệ tham chiếu đến một mức cache bị miss; dùng trong multilevel hierarchy.

lock Thiết bị synchronization chỉ cho một processor truy cập dữ liệu tại một thời điểm.

lookup tables (LUTs) Trong field programmable device, tên gọi các cell vì chúng gồm lượng nhỏ logic và RAM.

loop unrolling Kỹ thuật tăng hiệu năng vòng lặp truy cập array, tạo nhiều bản sao loop body và lập lịch chung instruction từ các iteration khác nhau.

machine language Biểu diễn nhị phân dùng để giao tiếp bên trong hệ thống máy tính.

macro Cơ chế pattern-matching và thay thế cung cấp cách đơn giản đặt tên chuỗi instruction thường dùng.

magnetic disk Còn gọi là hard disk. Dạng nonvolatile secondary memory gồm phiến đĩa quay phủ vật liệu ghi từ. Vì là thiết bị cơ học quay, thời gian truy cập khoảng 5 đến 20 millisecond và chi phí mỗi gigabyte năm 2012 là $0.05 đến $0.10.

main memory Còn gọi là primary memory. Memory giữ chương trình khi chạy; thường gồm DRAM trong máy tính ngày nay.

memory Vùng lưu trữ giữ chương trình khi chúng đang chạy và chứa dữ liệu cần cho chúng.

memory hierarchy Cấu trúc dùng nhiều mức memory; khi khoảng cách đến processor tăng, cả kích thước memory lẫn thời gian truy cập đều tăng.

message passing Truyền thông giữa nhiều processor bằng cách gửi và nhận thông tin tường minh.

metastability Tình huống khi lấy mẫu tín hiệu chưa ổn định đủ setup time và hold time yêu cầu, có thể khiến giá trị mẫu rơi vào vùng không xác định giữa mức cao và thấp.

microarchitecture Tổ chức processor, gồm các functional unit chính, interconnection và control.

million instructions per second (MIPS) Phép đo tốc độ thực thi chương trình dựa trên số triệu instruction. MIPS bằng instruction count chia tích execution time và 10<sup>6</sup>.

MIMD hay Multiple Instruction streams, Multiple Data streams. Một multiprocessor.

minterms Còn gọi là product term. Tập logic input nối bằng phép hội (AND); product term tạo stage logic đầu của programmable logic array (PLA).

miss penalty Thời gian cần để fetch block từ mức thấp hơn vào một mức memory hierarchy, gồm truy cập block, truyền từ mức này sang mức khác, chèn vào mức bị miss rồi chuyển block cho bên yêu cầu.

miss rate Tỷ lệ truy cập memory không tìm thấy ở một mức memory hierarchy.

most significant bit Bit ngoài cùng bên trái trong RISC-V doubleword.

multicore microprocessor Microprocessor chứa nhiều processor (“core”) trong một integrated circuit. Gần như mọi microprocessor desktop và server hiện nay đều là multicore.

multilevel cache Memory hierarchy có nhiều mức cache, thay vì chỉ cache và main memory.

multiple issue Cơ chế khởi chạy nhiều instruction trong một clock cycle.

multiprocessor Hệ thống máy tính có ít nhất hai processor. Khác với uniprocessor có một processor, loại ngày càng khó tìm hiện nay.

multistage network Mạng cung cấp switch nhỏ ở mỗi node.

NAND gate AND gate có output đảo.

network bandwidth Nói không chính thức là tốc độ truyền đỉnh của mạng; có thể chỉ tốc độ một link hoặc tổng tốc độ truyền mọi link trong mạng.

next-state function Hàm combinational xác định trạng thái tiếp theo của finite-state machine từ input và trạng thái hiện tại.

nonblocking assignment Phép gán tiếp tục sau khi đánh giá right-hand side, chỉ gán giá trị cho left-hand side sau khi mọi right-hand side đã được đánh giá.

nonblocking cache Cache cho phép processor tham chiếu cache trong lúc cache xử lý miss trước đó.

nonuniform memory access (NUMA) Loại multiprocessor có một address space mà một số truy cập memory nhanh hơn nhiều truy cập khác tùy processor nào yêu cầu word nào.

nonvolatile memory Dạng memory giữ dữ liệu ngay khi không có nguồn điện, dùng lưu chương trình giữa các lần chạy. Đĩa DVD là nonvolatile.

nop Instruction không thực hiện thao tác thay đổi trạng thái.

NOR Một phép toán logic bit-by-bit với hai toán hạng, tính NOT của OR của hai toán hạng. Nghĩa là, nó chỉ tính ra 1 nếu cả hai toán hạng đều có bit 0 tại vị trí tương ứng.

NOR gate OR gate có output đảo.

normalized Số trong ký hiệu floating-point không có bit 0 đứng đầu.

NOT Phép logic bit-by-bit với một operand đảo các bit; tức thay mọi 1 bằng 0 và mọi 0 bằng 1.

object oriented language Ngôn ngữ lập trình định hướng quanh đối tượng thay vì hành động, hay dữ liệu thay vì logic.

one’s complement Ký hiệu biểu diễn giá trị âm nhất bằng 10…000<sub>two</sub> và dương nhất bằng 01…11<sub>two</sub>, tạo số lượng số âm, dương bằng nhau nhưng có hai số không, một dương (00…00<sub>two</sub>) và một âm (11…11<sub>two</sub>). Thuật ngữ cũng chỉ việc đảo mọi bit trong mẫu: 0 thành 1 và 1 thành 0.

opcode Trường biểu thị thao tác và format của instruction.

OpenMP API cho shared memory multiprocessing bằng C, C++ hoặc Fortran chạy trên nền tảng UNIX và Microsoft. Gồm compiler directive, thư viện và runtime directive.

OR Phép logic bit-by-bit với hai operand, cho 1 nếu một trong hai operand có bit 1.

out-of-order execution Tình huống thực thi pipeline mà instruction bị chặn thực thi không khiến instruction tiếp theo phải chờ.

output device Cơ chế truyền kết quả tính toán, chẳng hạn màn hình, đến người dùng hoặc máy tính khác.

page fault Sự kiện khi page được truy cập không hiện diện trong main memory.

page table Bảng chứa ánh xạ virtual address sang physical address trong hệ virtual memory. Bảng được lưu trong memory, thường index bằng virtual page number; mỗi entry chứa physical page number của virtual page đó nếu page hiện ở memory.

parallel processing program Một chương trình chạy trên nhiều processor đồng thời.

PC-relative addressing Cách định địa chỉ mà địa chỉ bằng tổng program counter (PC) và hằng số trong instruction.

personal computer (PC) Máy tính thiết kế cho cá nhân sử dụng, thường gồm màn hình đồ họa, bàn phím và chuột.

personal mobile devices (PMDs) Thiết bị không dây nhỏ để kết nối Internet; dựa vào pin cấp nguồn, software được cài bằng cách tải app. Ví dụ thường gặp là điện thoại thông minh và máy tính bảng.

physical address Địa chỉ trong main memory.

physically addressed cache Cache được định địa chỉ bằng physical address.

pipeline stall Còn gọi là bubble. Stall được khởi tạo để giải quyết hazard.

pipelining Kỹ thuật triển khai cho nhiều instruction chồng lấp trong thực thi, giống dây chuyền lắp ráp.

pixel Phần tử ảnh riêng lẻ nhỏ nhất. Màn hình gồm hàng trăm nghìn đến hàng triệu pixel, tổ chức thành ma trận.

pop Lấy phần tử khỏi stack.

precise interrupt Còn gọi là precise exception. Interrupt hoặc exception luôn gắn với đúng instruction trong máy tính pipeline.

prefetching Kỹ thuật đưa sớm block dữ liệu cần trong tương lai vào cache bằng instruction đặc biệt xác định địa chỉ block.

procedure Subroutine được lưu thực hiện nhiệm vụ cụ thể dựa trên tham số được cung cấp.

procedure call frame Block memory dùng giữ giá trị truyền vào procedure làm đối số, lưu register mà procedure có thể sửa nhưng caller không muốn thay đổi, và cung cấp không gian cho biến cục bộ procedure.

procedure frame Còn gọi là activation record. Phần stack chứa register đã lưu và biến cục bộ của procedure.

process Gồm một hoặc nhiều thread, address space và operating system state. Vì vậy process switch thường gọi operating system, nhưng thread switch thì không.

program counter (PC) Register chứa địa chỉ instruction trong chương trình đang thực thi.

programmable array logic (PAL) Chứa and-plane lập trình được, theo sau bằng or-plane cố định.

programmable logic array (PLA) Phần tử structured-logic gồm tập input, các phần bù input tương ứng và hai stage logic; stage đầu tạo product term của input và input bù, stage sau tạo sum term của product term. Do đó PLA triển khai hàm logic dưới dạng sum of products.

programmable logic device (PLD) Integrated circuit chứa combinational logic mà chức năng do người dùng cuối cấu hình.

programmable ROM (PROM) Dạng read-only memory có thể được lập trình khi người thiết kế biết nội dung.

propagation time Thời gian cần để input vào flip-flop lan truyền đến output của flip-flop.

protection Tập cơ chế bảo đảm nhiều process chia sẻ processor, memory hoặc thiết bị I/O không thể cố ý hoặc vô tình can thiệp nhau bằng cách đọc hay ghi dữ liệu của nhau. Cơ chế cũng cách ly operating system khỏi user process.

pseudoinstruction Biến thể phổ biến của assembly language instruction thường được coi như instruction độc lập.

Pthreads API UNIX để tạo và thao tác thread. Được tổ chức dưới dạng thư viện.

push Thêm phần tử vào stack.

quotient Kết quả chính của phép chia; số mà khi nhân divisor rồi cộng remainder sẽ tạo dividend.

read-only memory (ROM) Memory có nội dung xác định khi tạo, sau đó chỉ có thể đọc. ROM dùng như structured logic để triển khai tập hàm logic bằng cách dùng các term trong hàm làm address input và output làm bit trong mỗi word memory.

receive message routine Routine processor trong máy có private memory dùng để nhận message từ processor khác.

recursive procedures Procedure gọi chính nó trực tiếp hoặc gián tiếp qua chuỗi lời gọi.

reduction Hàm xử lý cấu trúc dữ liệu và trả về một giá trị duy nhất.

reference bit Còn gọi là use bit hoặc access bit. Trường được đặt khi page được truy cập, dùng triển khai LRU hoặc phương án thay thế khác.

reg Trong Verilog, một register.

register file State element gồm tập register có thể đọc, ghi bằng cách cung cấp số register cần truy cập.

register renaming Việc compiler hoặc hardware đổi tên register để loại bỏ antidependence.

register use convention Còn gọi là procedure call convention. Giao thức software quy định cách procedure dùng register.

relocation information Segment trong UNIX object file xác định instruction và data word phụ thuộc absolute address.

remainder Kết quả phụ của phép chia; số mà khi cộng vào tích quotient với divisor sẽ tạo dividend.

reorder buffer Buffer giữ kết quả trong processor lập lịch động cho đến khi an toàn để lưu kết quả vào memory hoặc register.

reservation station Buffer trong functional unit giữ operand và thao tác.

response time Còn gọi là execution time. Tổng thời gian máy tính cần để hoàn thành tác vụ, gồm truy cập đĩa, truy cập memory, hoạt động I/O, overhead operating system, CPU execution time, v.v.

restartable instruction Instruction có thể tiếp tục thực thi sau khi giải quyết exception mà exception không ảnh hưởng kết quả instruction.

return address Liên kết đến vị trí gọi, cho phép procedure trở về đúng địa chỉ; trong RISC-V thường lưu ở register x1.

rotational latency Còn gọi là rotational delay. Thời gian sector mong muốn của đĩa quay đến dưới đầu đọc/ghi; thường giả sử bằng nửa thời gian một vòng quay.

round Phương pháp làm kết quả floating-point trung gian vừa format floating-point; mục tiêu thường là tìm số gần nhất có thể biểu diễn trong format. Cũng là tên bit thứ hai trong hai bit bổ sung giữ bên phải khi tính toán floating-point trung gian, giúp cải thiện độ chính xác làm tròn.

scientific notation Ký hiệu biểu diễn số với một chữ số bên trái dấu thập phân.

secondary memory Nonvolatile memory dùng lưu chương trình và dữ liệu giữa các lần chạy; thường gồm flash memory trong PMD và magnetic disk trong server.

sector Một trong các phần tạo thành track trên magnetic disk; sector là lượng thông tin nhỏ nhất được đọc hoặc ghi trên đĩa.

seek Quá trình đặt đầu đọc/ghi trên đúng track của đĩa.

segmentation Phương án ánh xạ địa chỉ variable-size, trong đó địa chỉ gồm hai phần: segment number được ánh xạ sang physical address và segment offset.

selector value Còn gọi là control value. Control signal dùng chọn một input value của multiplexor làm output của multiplexor.

semiconductor Chất dẫn điện không tốt.

send message routine Routine processor trong máy có private memory dùng để gửi message đến processor khác.

sensitivity list Danh sách tín hiệu xác định khi nào always block cần được đánh giá lại.

separate compilation Chia chương trình qua nhiều file, mỗi file có thể compile mà không biết nội dung file khác.

sequential logic Nhóm logic element chứa memory, do đó giá trị phụ thuộc cả input lẫn nội dung memory hiện tại.

server Máy tính dùng chạy chương trình lớn hơn cho nhiều người dùng, thường đồng thời, và thường chỉ truy cập qua mạng.

set-associative cache Cache có số vị trí cố định (ít nhất hai) mà mỗi block có thể được đặt vào.

setup time Thời gian tối thiểu input của memory device phải hợp lệ trước clock edge.

shared memory multiprocessor (SMP) Parallel processor có một physical address space.

sign-extend Tăng kích thước dữ liệu bằng cách nhân bản sign bit high-order của dữ liệu ban đầu vào các bit high-order của dữ liệu đích lớn hơn.

silicon Nguyên tố tự nhiên có tính semiconductor.

silicon crystal ingot Thanh tinh thể silicon có đường kính từ 8 đến 12 inch và dài khoảng 12 đến 24 inch.

SIMD hay Single Instruction stream, Multiple Data streams. Cùng instruction được áp dụng cho nhiều data stream, như trong vector processor.

simple programmable logic device (SPLD) Programmable logic device thường chứa một PAL hoặc PLA.

simultaneous multithreading (SMT) Phiên bản multithreading giảm chi phí bằng cách tận dụng tài nguyên cần cho microarchitecture multiple issue, lập lịch động.

single precision Giá trị floating-point biểu diễn trong word 32-bit.

single-cycle implementation Còn gọi là single clock cycle implementation. Implementation thực thi instruction trong một clock cycle. Tuy dễ hiểu, quá chậm để thực tế.

SISD hay Single Instruction stream, Single Data stream. Một uniprocessor.

Software as a Service (SaaS) cung cấp software và dữ liệu như dịch vụ qua Internet, thường qua chương trình gọn nhẹ như trình duyệt chạy trên thiết bị client cục bộ, thay vì binary code phải cài đặt và chạy hoàn toàn trên thiết bị. Ví dụ gồm tìm kiếm web và mạng xã hội.

source language Ngôn ngữ high-level mà chương trình ban đầu được viết bằng.

spatial locality Nguyên tắc locality phát biểu rằng nếu một vị trí dữ liệu được tham chiếu, những vị trí có địa chỉ lân cận thường sớm được tham chiếu.

speculation Cách tiếp cận compiler hoặc processor đoán kết quả instruction để loại bỏ nó như dependency khi thực thi instruction khác.

split cache Cơ chế mà một mức memory hierarchy gồm hai cache độc lập hoạt động song song, một xử lý instruction, một xử lý dữ liệu.

SPMD Single Program, Multiple Data streams. Mô hình lập trình MIMD thông thường, một chương trình chạy trên mọi processor.

stack Cấu trúc dữ liệu để spill register, tổ chức thành hàng đợi last-in-first-out.

stack pointer Giá trị biểu thị địa chỉ được cấp phát gần nhất trong stack, cho biết nơi spill register hoặc tìm giá trị register cũ. Trong RISC-V là register x2, còn gọi là sp.

stack segment Phần memory chương trình dùng giữ procedure call frame.

state element Memory element, chẳng hạn register hoặc memory.

static data Phần memory chứa dữ liệu có kích thước compiler biết và lifetime kéo dài suốt thời gian thực thi chương trình.

static multiple issue Cách triển khai processor multiple-issue mà compiler quyết định nhiều việc trước lúc thực thi.

static random access memory (SRAM) Memory lưu dữ liệu tĩnh (như trong flip-flops) thay vì động (như DRAM). SRAM nhanh hơn DRAM nhưng mật độ thấp hơn và đắt hơn trên mỗi bit.

sticky bit Bit dùng làm tròn ngoài guard và round, được đặt khi có bit khác 0 bên phải round bit.

stored-program concept Ý tưởng instruction và nhiều loại dữ liệu có thể lưu trong memory dưới dạng số, do đó dễ thay đổi, dẫn đến stored program computer.

strong scaling Speed-up đạt trên multiprocessor mà không tăng kích thước bài toán.

structural hazard Khi instruction dự kiến không thực thi được đúng clock cycle vì hardware không hỗ trợ tổ hợp instruction đã định thực thi.

structural specification Mô tả cách hệ thống số được tổ chức theo kết nối phân cấp của các phần tử.

sum of products Dạng biểu diễn logic dùng tổng logic (OR) của các tích (term nối bằng toán tử AND).

supercomputer Nhóm máy tính có hiệu năng và chi phí cao nhất; cấu hình làm server, thường có giá hàng chục đến hàng trăm triệu đô la.

superscalar Kỹ thuật pipelining tiên tiến cho phép processor thực thi hơn một instruction mỗi clock cycle bằng cách chọn chúng lúc thực thi.

supervisor mode Còn gọi là kernel mode. Mode cho biết process đang chạy là process operating system.

swap space Không gian đĩa dành cho toàn bộ virtual memory space của process.

symbol table Bảng ghép tên label với địa chỉ các memory word mà instruction chiếm.

synchronization Quá trình phối hợp hành vi của hai hay nhiều process, có thể chạy trên processor khác nhau.

synchronizer failure Tình huống flip-flop vào metastable state, một số logic block đọc output của flip-flop thấy 0 trong khi số khác thấy 1.

synchronous system Memory system dùng clock, chỉ đọc data signal khi clock cho biết giá trị tín hiệu ổn định.

system call Instruction đặc biệt chuyển quyền điều khiển từ user mode đến vị trí chuyên dụng trong supervisor code space, đồng thời gọi cơ chế exception.

system CPU time CPU time trong operating system để thực hiện tác vụ thay cho chương trình.

systems software Software cung cấp dịch vụ hữu ích phổ biến, gồm operating system, compiler, loader và assembler.

tag Trường trong bảng dùng cho memory hierarchy chứa thông tin địa chỉ cần để nhận biết block tương ứng trong hierarchy có khớp word được yêu cầu hay không.

task-level parallelism or process-level parallelism Tận dụng nhiều processor bằng cách chạy chương trình độc lập đồng thời.

temporal locality Nguyên tắc phát biểu rằng nếu vị trí dữ liệu được tham chiếu, nó thường sớm được tham chiếu lại.

terabyte (TB) Ban đầu là 1,099,511,627,776 (240) byte, mặc dù nhà phát triển hệ thống truyền thông và secondary storage bắt đầu dùng thuật ngữ với nghĩa 1,000,000,000,000 (10<sup>12</sup>) byte. Để giảm nhầm lẫn, hiện dùng tebibyte (TiB) cho 240 byte, định nghĩa terabyte (TB) là 10<sup>12</sup> byte. (Hình 1.1 cho đầy đủ giá trị và tên thập phân, nhị phân.)

text segment Segment trong UNIX object file chứa machine language code cho routine trong source file.

thread Thread gồm program counter, register state và stack. Nó là lightweight process; thread thường dùng chung một address space, còn process thì không.

three Cs model Mô hình cache phân mọi cache miss thành ba nhóm: compulsory miss, capacity miss và conflict miss.

throughput Còn gọi là bandwidth. Thước đo hiệu năng khác, là số tác vụ hoàn thành mỗi đơn vị thời gian.

tournament branch predictor Branch predictor có nhiều dự đoán cho mỗi branch cùng cơ chế chọn predictor nào được kích hoạt cho branch cụ thể.

track Một trong hàng nghìn đường tròn đồng tâm tạo bề mặt magnetic disk.

transistor Công tắc bật/tắt điều khiển bằng tín hiệu điện.

translation-lookaside buffer (TLB) Cache theo dõi ánh xạ địa chỉ mới dùng gần đây để cố tránh truy cập page table.

truth table Trong logic, biểu diễn phép logic bằng cách liệt kê mọi giá trị input và cho biết output kết quả trong từng trường hợp.

underflow (floating-point) Tình huống exponent âm có độ lớn quá lớn để vừa exponent field.

uniform memory access (UMA) Multiprocessor có latency đến mọi word trong main memory gần bằng nhau bất kể processor nào yêu cầu truy cập.

units in the last place (ulp) Số bit sai ở các bit có trọng số thấp nhất trong significand giữa số thực tế và số biểu diễn được.

unmapped Phần address space không thể xảy ra page fault.

unresolved reference Tham chiếu cần thêm thông tin từ nguồn ngoài để hoàn chỉnh.

use bit Còn gọi là reference bit hoặc access bit. Trường được đặt mỗi khi truy cập page, dùng triển khai LRU hoặc phương án thay thế khác.

use latency Số clock cycle giữa load instruction và instruction có thể dùng kết quả load mà không stall pipeline.

user CPU time CPU time dành cho chính chương trình.

valid bit Trường trong bảng memory hierarchy cho biết block tương ứng chứa dữ liệu hợp lệ.

vector lane Một hoặc nhiều vector functional unit và một phần vector register file. Lấy cảm hứng từ làn đường cao tốc tăng tốc giao thông, nhiều lane thực thi phép vector đồng thời.

vectored interrupt Interrupt có địa chỉ chuyển quyền điều khiển được xác định bởi nguyên nhân exception.

Verilog Một trong hai hardware description language phổ biến nhất.

very-large-scale integrated (VLSI) circuit Thiết bị chứa hàng trăm nghìn đến hàng triệu transistor.

very long instruction word (VLIW) Kiểu instruction set architecture khởi chạy nhiều thao tác được xác định độc lập trong một instruction rộng, thường có nhiều opcode field riêng.

VHDL Một trong hai hardware description language phổ biến nhất.

virtual address Địa chỉ tương ứng vị trí trong virtual space, được address mapping dịch sang physical address khi truy cập memory.

virtual machine Máy tính ảo có vẻ có branch và load không trễ cùng instruction set phong phú hơn hardware thực.

virtual memory Kỹ thuật dùng main memory làm “cache” cho secondary storage.

virtually addressed cache Cache được truy cập bằng virtual address thay vì physical address.

volatile memory Storage, như DRAM, chỉ giữ dữ liệu khi được cấp nguồn.

wafer Lát cắt từ silicon ingot không quá 0.1 inch, dùng tạo chip.

weak scaling Speed-up đạt trên multiprocessor khi mở rộng kích thước bài toán tỷ lệ với mức tăng số processor.

wide area network (WAN) Mạng trải hàng trăm kilômét, có thể bao phủ châu lục.

wire Trong Verilog, chỉ định tín hiệu combinational.

word Đơn vị truy cập tự nhiên trong máy tính, thường gồm 32 bit.

workload Tập chương trình chạy trên máy tính, là tập ứng dụng thực tế người dùng chạy hoặc được tạo từ chương trình thực để xấp xỉ tổ hợp đó. Workload điển hình xác định cả chương trình lẫn tần suất tương đối.

write buffer Hàng đợi giữ dữ liệu trong lúc chờ ghi vào memory.

write-back Cơ chế xử lý ghi bằng cách chỉ cập nhật giá trị trong cache block, rồi ghi block đã sửa xuống mức thấp hơn của hierarchy khi block bị thay thế.

write-through Cơ chế ghi luôn cập nhật cả cache và mức thấp hơn tiếp theo của memory hierarchy, bảo đảm dữ liệu luôn nhất quán giữa hai mức.

yield Tỷ lệ phần trăm die tốt trên tổng số die của wafer.
