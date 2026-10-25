# Đáp án Tự kiểm tra

## Chương 1

§1.1, trang 10: Câu hỏi thảo luận: nhiều câu trả lời được chấp nhận.

§1.4, trang 24: DRAM memory: volatile, thời gian truy cập ngắn từ 50 đến 70 nanosecond, và chi phí mỗi GB là $5 đến $10. Disk memory: nonvolatile, thời gian truy cập chậm hơn DRAM 100,000 đến 400,000 lần, và chi phí mỗi GB rẻ hơn DRAM 100 lần. Flash memory: nonvolatile, thời gian truy cập chậm hơn DRAM 100 đến 1000 lần, và chi phí mỗi GB rẻ hơn DRAM 7 đến 10 lần.

§1.5, trang 28: 1, 3 và 4 là những lý do hợp lệ. Đáp án 5 nhìn chung có thể đúng vì sản lượng cao có thể khiến việc đầu tư thêm để giảm kích thước die, chẳng hạn 10%, trở thành quyết định kinh tế tốt, nhưng điều đó không nhất thiết đúng.

§1.6, trang 33: 1. a: cả hai, b: latency, c: không yếu tố nào. 7 giây.

§1.6, trang 40: b.

§1.10, trang 51: a. Máy tính A có chỉ số MIPS cao hơn. b. Máy tính B nhanh hơn.

## Chương 2

§2.2, trang 66: RISC-V, C, Java.

§2.3, trang 73: 2) Rất chậm.

§2.4, trang 80: 2) −8<sub>ten</sub>

§2.5, trang 89: 3) sub x11, x10, x9

§2.6, trang 92: Cả hai. AND với mẫu mask gồm các bit 1 sẽ để lại bit 0 ở mọi nơi trừ trường mong muốn. Dịch trái một lượng thích hợp loại bỏ các bit bên trái trường. Dịch phải một lượng thích hợp đặt trường vào các bit right-most của doubleword, với bit 0 ở phần còn lại của doubleword. Lưu ý rằng AND giữ trường tại vị trí ban đầu, còn cặp phép dịch chuyển trường đến phần ngoài cùng bên phải của doubleword.

§2.7, trang 97: I. Tất cả đều đúng. II. 1).

§2.8, trang 108: Cả hai đều đúng.

§2.9, trang 113: I. 1) và 2) II. 3).

§2.10, trang 121: I. 4) ±4 K. II. 4) ± 1 M.

§2.11, trang 124: Cả hai đều đúng.

§2.12, trang 133: 4) Tính độc lập với máy.

## Chương 3

§3.2, trang 177: 2.

§3.5, trang 215: 3.

## Chương 4

§4.1, trang 240: 3 trong 5: Control, Datapath, Memory. Thiếu Input và Output.

§4.2, trang 243: sai. Các state element Edge-triggered cho phép đọc và ghi đồng thời, đồng thời làm cho những thao tác đó không mơ hồ.

§4.3, trang 250: I. a. II. c.

§4.4, trang 262: Có, Branch và ALUOp0 giống hệt nhau. Ngoài ra, có thể tận dụng tính linh hoạt của các bit don’t care để kết hợp những tín hiệu khác. Có thể làm ALUSrc và MemtoReg giống nhau bằng cách đặt hai bit don’t care của MemtoReg thành 1 và 0. Có thể làm ALUOp1 và MemtoReg đảo nhau bằng cách đặt bit don’t care của MemtoReg thành 1. Không cần inverter; chỉ cần dùng tín hiệu còn lại và đảo thứ tự input của MemtoReg multiplexor!

§4.5, trang 275: 1. Stall do load-use data hazard của kết quả ld. 2. Tránh stall ở instruction thứ ba do read-after-write data hazard trên x11 bằng cách forwarding kết quả add. 3. Không cần stall, ngay cả khi không forwarding.

§4.6, trang 288: Phát biểu 2 và 4 đúng; các phát biểu còn lại sai.

§4.8, trang 314: 1. Dự đoán not taken. 2. Dự đoán taken. 3. Dynamic prediction.

§4.9, trang 321: Instruction đầu tiên, vì về logic nó được thực thi trước các instruction khác.

§4.10, trang 334: 1. Cả hai. 2. Cả hai. 3. Software. 4. Hardware. 5. Hardware. 6. Hardware. 7. Cả hai. 8. Hardware. 9. Cả hai.

§4.12, trang 344: Hai phát biểu đầu sai và hai phát biểu cuối đúng.

## Chương 5

§5.1, trang 369: 1 và 4. (3 sai vì chi phí memory hierarchy khác nhau giữa các máy tính, nhưng năm 2016 chi phí cao nhất thường là DRAM.)

§5.3, trang 390: 1 và 4: Miss penalty thấp hơn có thể cho phép block nhỏ hơn, vì không có nhiều latency cần phân bổ, nhưng memory bandwidth cao hơn thường dẫn đến block lớn hơn, vì miss penalty chỉ lớn hơn chút ít.

§5.4, trang 409: 1.

§5.8, trang 449: 2. (Cả block lớn lẫn prefetching đều có thể giảm compulsory miss, nên 1 sai.)

## Chương 6

§6.1, trang 494: Sai. Task-level parallelism có thể hỗ trợ ứng dụng tuần tự và có thể làm ứng dụng tuần tự chạy trên hardware song song, dù khó khăn hơn.

§6.2, trang 499: Sai. Weak scaling có thể bù cho phần tuần tự của chương trình vốn sẽ hạn chế scalability, nhưng strong scaling thì không.

§6.3, trang 504: Đúng, nhưng chúng thiếu những tính năng vector hữu ích như gather-scatter và vector length register để cải thiện hiệu quả vector architecture. (Như phần giải thích thêm trong mục này đề cập, các mở rộng SIMD AVX2 cung cấp indexed load qua thao tác gather nhưng không cung cấp scatter cho indexed store. Thế hệ x86 microprocessor Haswell là thế hệ đầu hỗ trợ AVX2.)

§6.4, trang 509: 1. Đúng. 2. Đúng.

§6.5, trang 513: Sai. Vì shared address là physical address, nhiều tác vụ, mỗi tác vụ trong virtual address space riêng, có thể chạy tốt trên shared memory multiprocessor.

§6.6, trang 521: Sai. Chip graphics DRAM được đánh giá cao vì bandwidth cao hơn.

§6.7, trang 526: 1. Sai. Gửi và nhận message là synchronization ngầm định, đồng thời là cách chia sẻ dữ liệu. 2. Đúng.

§6.8, trang 528: Đúng.

§6.10, trang 540: Đúng. Có lẽ cần đổi mới ở mọi mức trong hardware và software stack để điện toán song song thành công.
