# 2 Giới thiệu về Operating Systems

Nếu đang học một học phần operating system ở bậc đại học, bạn hẳn đã hình dung được phần nào chương trình máy tính làm gì khi chạy. Nếu chưa, cuốn sách này (và học phần tương ứng) sẽ khá khó — vì vậy, có lẽ bạn nên ngừng đọc cuốn sách này, hoặc chạy đến hiệu sách gần nhất và nhanh chóng đọc các tài liệu nền tảng cần thiết trước khi tiếp tục (cả sách của Patt/Patel [PP03] lẫn, đặc biệt là, Bryant/O’Hallaron [BOH10] đều rất hay).

Vậy điều gì xảy ra khi một chương trình chạy?

Một chương trình đang chạy làm một việc rất đơn giản: thực thi instruction. Hàng triệu lần mỗi giây (và ngày nay thậm chí hàng tỷ lần), processor fetch một instruction từ memory, decode nó (tức là xác định đây là instruction nào), rồi thực thi nó (tức là làm việc mà nó phải làm, chẳng hạn cộng hai số, truy cập memory, kiểm tra một điều kiện, nhảy đến một hàm, v.v.). Sau khi hoàn thành instruction này, processor chuyển sang instruction tiếp theo, rồi cứ thế tiếp tục cho đến khi chương trình cuối cùng hoàn tất[^1].

Như vậy, chúng ta vừa mô tả những điều cơ bản của mô hình tính toán Von Neumann[^2]. Nghe đơn giản, phải không? Nhưng trong học phần này, ta sẽ học rằng trong khi một chương trình chạy, còn có rất nhiều điều bất ngờ khác diễn ra với mục tiêu chính là làm cho hệ thống dễ sử dụng.

Thực ra, có một tập hợp phần mềm chịu trách nhiệm giúp việc chạy chương trình trở nên dễ dàng (thậm chí cho phép bạn có cảm giác đang chạy nhiều chương trình cùng lúc), cho phép các chương trình chia sẻ memory, cho phép chương trình tương tác với thiết bị và những việc thú vị khác tương tự. Tập hợp phần mềm đó được gọi là operating system (OS)[^3], vì nó chịu trách nhiệm bảo đảm hệ thống hoạt động đúng và hiệu quả theo cách easy-to-use.

> MẤU CHỐT CỦA VẤN ĐỀ:
>
> LÀM THẾ NÀO ĐỂ VIRTUALIZE TÀI NGUYÊN
>
> Một câu hỏi trọng tâm mà ta sẽ trả lời trong cuốn sách này khá đơn giản: operating system virtualize tài nguyên như thế nào? Đây là mấu chốt của vấn đề chúng ta đang xét. Vì sao OS làm điều đó không phải câu hỏi chính, bởi câu trả lời hẳn đã rõ: nó làm hệ thống dễ sử dụng hơn. Vì vậy, ta tập trung vào cách thực hiện: OS triển khai những mechanism và policy nào để đạt được virtualization? OS thực hiện điều đó hiệu quả bằng cách nào? Cần hardware hỗ trợ những gì? Ta sẽ dùng các mục “mấu chốt của vấn đề”, trong những khung nền tô màu như khung này, để làm nổi bật các vấn đề cụ thể mà ta đang cố giải quyết khi xây dựng operating system. Vì vậy, trong phần ghi chép về một chủ đề cụ thể, bạn có thể gặp một hoặc nhiều “cruces” (đúng vậy, đây là dạng số nhiều chính xác của “crux”) để nhấn mạnh vấn đề. Tất nhiên, các chi tiết trong chương sẽ trình bày lời giải, hoặc ít nhất những yếu tố cơ bản của một lời giải.

Cách chủ yếu để OS thực hiện điều này là thông qua một kỹ thuật tổng quát mà ta gọi là virtualization. Nghĩa là OS lấy một tài nguyên vật lý (như processor, memory hoặc đĩa) và biến nó thành một dạng virtual tổng quát hơn, mạnh mẽ hơn và easy-to-use của chính tài nguyên đó. Vì vậy, đôi khi ta gọi operating system là một virtual machine.

Tất nhiên, để người dùng có thể yêu cầu OS làm việc gì đó và nhờ đó sử dụng các tính năng của virtual machine (như chạy chương trình, cấp phát memory hoặc truy cập file), OS cũng cung cấp một số interface (API) mà bạn có thể gọi. Trên thực tế, một OS điển hình cung cấp vài trăm system call cho ứng dụng sử dụng. Vì OS cung cấp các lời gọi này để chạy chương trình, truy cập memory và thiết bị, cùng những hoạt động liên quan khác, đôi khi ta cũng nói OS cung cấp một standard library cho ứng dụng.

Cuối cùng, vì virtualization cho phép nhiều chương trình chạy (do đó chia sẻ CPU), nhiều chương trình truy cập đồng thời instruction và dữ liệu riêng của chúng (do đó chia sẻ memory), và nhiều chương trình truy cập thiết bị (do đó chia sẻ đĩa, v.v.), OS đôi khi được gọi là resource manager. CPU, memory và đĩa đều là tài nguyên của hệ thống; vì thế, operating system có vai trò quản lý các tài nguyên đó một cách hiệu quả, công bằng hoặc thực sự còn hướng đến nhiều mục tiêu khả dĩ khác. Để hiểu rõ hơn một chút vai trò của OS, hãy xem một vài ví dụ.

```
 1   #include <stdio.h>
 2   #include <stdlib.h>
 3   #include <sys/time.h>
 4   #include <assert.h>
 5   #include "common.h"
 6
 7   int
 8   main(int argc, char *argv[])
 9   {
10       if (argc != 2) {
11           fprintf(stderr, "usage: cpu <string>\n");
12           exit(1);
13       }
14       char *str = argv[1];
15       while (1) {
16           Spin(1);
17           printf("%s\n", str);
18       }
19       return 0;
20   }
```

Hình 2.1: Ví dụ đơn giản: Code lặp và in (cpu.c)

## 2.1 Virtualize CPU

Hình 2.1 trình bày chương trình đầu tiên của chúng ta. Nó không làm gì nhiều. Thực ra, tất cả những gì nó làm là gọi Spin(), một hàm liên tục kiểm tra thời gian và trả về sau khi đã chạy được một giây. Sau đó, nó in chuỗi mà người dùng truyền vào trên command line, rồi lặp lại mãi mãi.

Giả sử ta lưu file này thành cpu.c và quyết định compile rồi chạy trên một hệ thống có một processor duy nhất (hay CPU, như đôi khi ta sẽ gọi). Đây là những gì ta sẽ thấy:

```
prompt> gcc -o cpu cpu.c -Wall
prompt> ./cpu "A"
A
A
A
A
ˆC
prompt>
```

Lần chạy này không thú vị lắm — hệ thống bắt đầu chạy chương trình, chương trình liên tục kiểm tra thời gian cho đến khi một giây trôi qua. Sau một giây, code in chuỗi đầu vào mà người dùng truyền vào (trong ví dụ này là chữ “A”), rồi tiếp tục. Lưu ý rằng chương trình sẽ chạy mãi; ta chỉ có thể dừng nó bằng cách nhấn “Control-c” (trên hệ thống UNIX-based, thao tác này sẽ kết thúc chương trình đang chạy ở foreground).

Bây giờ, hãy làm tương tự, nhưng lần này chạy nhiều instance khác nhau của cùng chương trình. Hình 2.2 cho thấy kết quả của ví dụ phức tạp hơn một chút này.

```
prompt> ./cpu A & ; ./cpu B & ; ./cpu C & ; ./cpu D &
[1] 7353
[2] 7354
[3] 7355
[4] 7356
A
B
D
C
A
B
D
C
A
C
B
D
...
```

Hình 2.2: Chạy nhiều chương trình cùng lúc

Giờ thì mọi thứ bắt đầu thú vị hơn một chút. Mặc dù chỉ có một processor, bằng cách nào đó cả bốn chương trình này dường như đều đang chạy cùng lúc! Điều kỳ diệu này xảy ra như thế nào?[^4]

Hóa ra operating system, với một chút hỗ trợ từ hardware, chịu trách nhiệm tạo ra ảo giác này, tức là ảo giác rằng hệ thống có rất nhiều virtual CPU. Biến một CPU duy nhất (hoặc một nhóm nhỏ CPU) thành số lượng CPU dường như vô hạn, nhờ đó cho phép nhiều chương trình dường như chạy cùng lúc, chính là điều ta gọi là virtualize CPU, trọng tâm của phần chính đầu tiên trong cuốn sách này.

Tất nhiên, để chạy chương trình, dừng chúng và nói chung là yêu cầu OS chạy những chương trình nào, cần có một số interface (API) mà bạn có thể dùng để truyền đạt mong muốn của mình đến OS. Ta sẽ nói về các API này xuyên suốt cuốn sách; thực ra, chúng là phương thức chủ yếu để phần lớn người dùng tương tác với operating system.

Bạn cũng có thể nhận thấy khả năng chạy nhiều chương trình cùng lúc làm nảy sinh đủ loại câu hỏi mới. Ví dụ, nếu hai chương trình cùng muốn chạy tại một thời điểm cụ thể thì chương trình nào nên được chạy? Một policy của OS sẽ trả lời câu hỏi này; policy được dùng ở nhiều nơi khác nhau trong OS để trả lời những câu hỏi kiểu như vậy, nên ta sẽ nghiên cứu chúng khi tìm hiểu các mechanism cơ bản mà operating system triển khai (chẳng hạn khả năng chạy nhiều chương trình cùng lúc). Đó cũng là lý do OS đóng vai trò resource manager.

```
 1   #include <unistd.h>
 2   #include <stdio.h>
 3   #include <stdlib.h>
 4   #include "common.h"
 5
 6   int
 7   main(int argc, char *argv[])
 8   {
 9       int *p = malloc(sizeof(int));             // a1
10       assert(p != NULL);
11       printf("(%d) memory address of p: %08x\n",
12              getpid(), (unsigned) p);           // a2
13       *p = 0;                                   // a3
14       while (1) {
15           Spin(1);
16           *p = *p + 1;
17           printf("(%d) p: %d\n", getpid(), *p); // a4
18       }
19       return 0;
20   }
```

Hình 2.3: Một chương trình truy cập memory (mem.c)

## 2.2 Virtualize memory

Bây giờ hãy xét memory. Mô hình physical memory mà máy hiện đại cung cấp rất đơn giản. Memory chỉ là một array gồm các byte; để đọc memory, cần chỉ định một address để truy cập dữ liệu lưu tại đó; để ghi (hoặc cập nhật) memory, cũng cần chỉ định dữ liệu sẽ ghi vào address đã cho.

Memory được truy cập liên tục khi chương trình chạy. Chương trình giữ mọi data structure của nó trong memory và truy cập chúng thông qua các instruction khác nhau, như load và store hoặc các instruction tường minh khác truy cập memory khi thực hiện công việc. Đừng quên rằng mỗi instruction của chương trình cũng nằm trong memory; do đó, memory được truy cập trong mỗi lần instruction fetch.

Hãy xem một chương trình (trong Hình 2.3) cấp phát một ít memory bằng cách gọi malloc(). Đầu ra của chương trình này như sau:

```
prompt> ./mem
(2134) memory address of p: 00200000
(2134) p: 1
(2134) p: 2
(2134) p: 3
(2134) p: 4
(2134) p: 5
ˆC
```

Chương trình làm một số việc. Đầu tiên, nó cấp phát một ít memory (dòng a1). Sau đó, nó in address của vùng memory đó (a2), rồi đặt số không vào vị trí đầu tiên của vùng memory vừa cấp phát (a3). Cuối cùng, nó lặp, chờ một giây rồi tăng giá trị lưu tại address được giữ trong p. Với mỗi câu lệnh in, nó cũng in ra cái gọi là process identifier (PID) của chương trình đang chạy. PID này là duy nhất đối với mỗi process đang chạy.

```
prompt> ./mem &; ./mem &
[1] 24113
[2] 24114
(24113) memory address of p: 00200000
(24114) memory address of p: 00200000
(24113) p: 1
(24114) p: 1
(24114) p: 2
(24113) p: 2
(24113) p: 3
(24114) p: 3
(24113) p: 4
(24114) p: 4
...
```

Hình 2.4: Chạy chương trình memory nhiều lần

Một lần nữa, kết quả đầu tiên này không thú vị lắm. Vùng memory vừa cấp phát nằm tại address 00200000. Khi chương trình chạy, nó từ từ cập nhật giá trị và in kết quả.

Bây giờ, ta lại chạy nhiều instance của cùng chương trình để xem điều gì xảy ra (Hình 2.4). Từ ví dụ, ta thấy mỗi chương trình đang chạy đều đã cấp phát memory tại cùng address (00200000), nhưng mỗi chương trình dường như lại cập nhật giá trị tại 00200000 một cách độc lập! Cứ như thể mỗi chương trình đang chạy có memory riêng, thay vì chia sẻ cùng physical memory với những chương trình đang chạy khác[^5].

Thực ra, đó chính xác là điều đang diễn ra ở đây khi OS virtualize memory. Mỗi process truy cập virtual address space riêng (đôi khi chỉ gọi là address space), và bằng cách nào đó OS ánh xạ nó lên physical memory của máy. Một memory reference trong một chương trình đang chạy không ảnh hưởng đến address space của các process khác (hay của chính OS); từ góc nhìn của chương trình đang chạy, toàn bộ physical memory là của riêng nó. Tuy nhiên, thực tế physical memory là tài nguyên dùng chung do operating system quản lý. Cách thực hiện chính xác tất cả những điều này cũng là nội dung của phần đầu cuốn sách, với chủ đề virtualization.

## 2.3 Concurrency

Một chủ đề chính khác của cuốn sách này là concurrency. Ta dùng thuật ngữ khái niệm này để chỉ rất nhiều vấn đề nảy sinh và cần được giải quyết khi thực hiện nhiều việc cùng lúc (tức là concurrently) trong cùng một chương trình. Những vấn đề concurrency đầu tiên xuất hiện ngay bên trong operating system; như bạn thấy ở các ví dụ virtualization bên trên, OS đang xoay xở nhiều việc cùng lúc, chạy process này rồi đến process khác, v.v. Hóa ra làm như vậy dẫn đến một số vấn đề sâu sắc và thú vị.

```
 1   #include <stdio.h>
 2   #include <stdlib.h>
 3   #include "common.h"
 4
 5   volatile int counter = 0;
 6   int loops;
 7
 8   void *worker(void *arg) {
 9       int i;
10       for (i = 0; i < loops; i++) {
11           counter++;
12       }
13       return NULL;
14   }
15
16   int
17   main(int argc, char *argv[])
18   {
19       if (argc != 2) {
20           fprintf(stderr, "usage: threads <value>\n");
21           exit(1);
22       }
23       loops = atoi(argv[1]);
24       pthread_t p1, p2;
25       printf("Initial value : %d\n", counter);
26
27       Pthread_create(&p1, NULL, worker, NULL);
28       Pthread_create(&p2, NULL, worker, NULL);
29       Pthread_join(p1, NULL);
30       Pthread_join(p2, NULL);
31       printf("Final value   : %d\n", counter);
32       return 0;
33   }
```

Hình 2.5: Một chương trình Multi-threaded (threads.c)

Đáng tiếc là những vấn đề concurrency không còn giới hạn trong chính OS. Thực ra, chương trình multi-threaded hiện đại cũng gặp những vấn đề tương tự. Hãy minh họa bằng một ví dụ về chương trình multi-threaded (Hình 2.5).

Mặc dù hiện tại bạn có thể chưa hiểu đầy đủ ví dụ này (ta sẽ học thêm rất nhiều trong những chương sau, ở phần concurrency của cuốn sách), ý tưởng cơ bản rất đơn giản. Chương trình chính tạo hai thread bằng Pthread_create()[^6]. Bạn có thể hình dung thread là một hàm chạy trong cùng memory space với các hàm khác, với nhiều hơn một hàm hoạt động tại một thời điểm. Trong ví dụ này, mỗi thread bắt đầu chạy trong một routine tên worker(), ở đó nó chỉ tăng một counter trong một vòng lặp với số lần lặp bằng loops.

Dưới đây là bản ghi những gì xảy ra khi chạy chương trình này với giá trị đầu vào của variable loops được đặt bằng 1000. Giá trị loops quyết định số lần mỗi worker trong hai worker tăng shared counter trong vòng lặp. Khi chạy chương trình với loops bằng 1000, bạn kỳ vọng giá trị cuối cùng của counter là bao nhiêu?

> MẤU CHỐT CỦA VẤN ĐỀ:
>
> LÀM THẾ NÀO ĐỂ XÂY DỰNG CONCURRENT PROGRAM ĐÚNG
>
> Khi có nhiều thread thực thi đồng thời trong cùng memory space, làm thế nào để xây dựng một chương trình hoạt động đúng? Cần những primitive nào từ OS? Hardware nên cung cấp những mechanism nào? Ta có thể dùng chúng để giải quyết các vấn đề concurrency như thế nào?

```
prompt> gcc -o thread thread.c -Wall -pthread
prompt> ./thread 1000
Initial value : 0
Final value   : 2000
```

Như có lẽ bạn đã đoán, khi hai thread hoàn tất, giá trị cuối cùng của counter là 2000, vì mỗi thread đã tăng counter 1000 lần. Thực ra, khi đặt giá trị đầu vào của loops bằng N, ta kỳ vọng đầu ra cuối cùng của chương trình là 2N. Nhưng hóa ra mọi chuyện không đơn giản như vậy. Hãy chạy cùng chương trình với giá trị loops lớn hơn để xem điều gì xảy ra:

```
prompt> ./thread 100000
Initial value : 0
Final value   : 143012    // huh??
prompt> ./thread 100000
Initial value : 0
Final value   : 137298    // what the??
```

Trong lần chạy này, khi đưa vào giá trị 100,000, thay vì nhận giá trị cuối cùng 200,000, ban đầu ta lại nhận được 143,012. Sau đó, khi chạy chương trình lần thứ hai, ta không chỉ lại nhận giá trị sai mà còn nhận giá trị khác lần trước. Thực ra, nếu chạy đi chạy lại chương trình với giá trị loops lớn, đôi khi bạn có thể thấy mình thậm chí nhận được đáp án đúng! Vậy vì sao điều này xảy ra?

Hóa ra nguyên nhân của những kết quả kỳ lạ và bất thường này liên quan đến cách instruction được thực thi: từng instruction một. Đáng tiếc là một phần then chốt trong chương trình trên, nơi shared counter được tăng lên, cần ba instruction: một để load giá trị counter từ memory vào register, một để tăng nó và một để store trở lại memory. Vì ba instruction này không thực thi atomically (tất cả cùng một lúc), những chuyện lạ có thể xảy ra. Chính vấn đề concurrency này sẽ được ta giải quyết rất chi tiết trong phần thứ hai của cuốn sách.

```
 1   #include <stdio.h>
 2   #include <unistd.h>
 3   #include <assert.h>
 4   #include <fcntl.h>
 5   #include <sys/types.h>
 6
 7   int
 8   main(int argc, char *argv[])
 9   {
10       int fd = open("/tmp/file", O_WRONLY | O_CREAT | O_TRUNC, S_IRWXU);
11       assert(fd > -1);
12       int rc = write(fd, "hello world\n", 13);
13       assert(rc == 13);
14       close(fd);
15       return 0;
16   }
```

Hình 2.6: Một chương trình thực hiện I/O (io.c)

## 2.4 Persistence

Chủ đề lớn thứ ba của học phần là persistence. Trong system memory, dữ liệu dễ bị mất vì các thiết bị như DRAM lưu giá trị theo cách volatile; khi mất điện hoặc hệ thống crash, mọi dữ liệu trong memory đều bị mất. Vì vậy, ta cần hardware và software có khả năng lưu dữ liệu persistently; cách lưu trữ này rất quan trọng với mọi hệ thống vì người dùng rất quan tâm đến dữ liệu của họ.

Hardware ở đây là một loại thiết bị input/output hay I/O nào đó; trong hệ thống hiện đại, hard drive là nơi lưu trữ phổ biến cho thông tin long-lived, dù các solid-state drive (SSD) cũng đang ngày càng phát triển trong lĩnh vực này.

Phần mềm trong operating system thường quản lý đĩa được gọi là file system; vì thế, nó chịu trách nhiệm lưu mọi file người dùng tạo ra trên đĩa của hệ thống một cách tin cậy và hiệu quả.

Khác với các abstraction mà OS cung cấp cho CPU và memory, OS không tạo một đĩa virtualized riêng cho mỗi ứng dụng. Thay vào đó, người ta giả định rằng người dùng thường muốn chia sẻ thông tin trong file. Ví dụ, khi viết chương trình C, trước hết bạn có thể dùng một editor (như Emacs[^7]) để tạo và chỉnh sửa file C (emacs -nw main.c). Khi xong, bạn có thể dùng compiler để biến source code thành executable (ví dụ gcc -o main main.c). Sau đó, bạn có thể chạy executable mới (ví dụ ./main). Như vậy, bạn có thể thấy file được chia sẻ giữa các process khác nhau ra sao. Đầu tiên, Emacs tạo một file làm đầu vào cho compiler; compiler dùng file đầu vào đó để tạo một executable file mới (qua nhiều bước — hãy học một học phần compiler để biết chi tiết); cuối cùng, executable mới được chạy. Và thế là một chương trình mới ra đời!

Để hiểu rõ hơn, hãy xem một ít code. Hình 2.6 trình bày code tạo một file (/tmp/file) chứa chuỗi “hello world”.

> MẤU CHỐT CỦA VẤN ĐỀ:
>
> LÀM THẾ NÀO ĐỂ LƯU DỮ LIỆU PERSISTENTLY
>
> File system là phần của OS chịu trách nhiệm quản lý persistent data. Cần những kỹ thuật nào để thực hiện điều đó đúng? Cần những mechanism và policy nào để thực hiện với hiệu năng cao? Làm thế nào để đạt được độ tin cậy khi hardware và software gặp sự cố?

Để thực hiện tác vụ này, chương trình thực hiện ba lời gọi vào operating system. Đầu tiên, lời gọi open() mở file và tạo nó; thứ hai, write() ghi một ít dữ liệu vào file; thứ ba, close() chỉ đóng file, qua đó cho biết chương trình sẽ không ghi thêm dữ liệu vào đó nữa. Những system call này được chuyển đến phần operating system gọi là file system, nơi xử lý yêu cầu và trả về một loại error code nào đó cho người dùng.

Có lẽ bạn đang tự hỏi OS làm gì để thực sự ghi xuống đĩa. Chúng tôi có thể cho bạn xem, nhưng trước hết bạn phải hứa nhắm mắt lại; chuyện đó khó chịu đến vậy đấy. File system phải làm khá nhiều việc: trước hết xác định dữ liệu mới này sẽ nằm ở đâu trên đĩa, rồi theo dõi nó trong các structure khác nhau mà file system duy trì. Việc đó đòi hỏi gửi I/O request đến storage device bên dưới để đọc các structure hiện có hoặc cập nhật (ghi) chúng. Bất kỳ ai từng viết device driver[^8] đều biết rằng điều khiển thiết bị làm một việc theo yêu cầu là một quá trình phức tạp và nhiều chi tiết. Nó đòi hỏi hiểu biết sâu về device interface low-level và ngữ nghĩa chính xác của interface đó. May mắn thay, OS cung cấp một cách đơn giản và chuẩn hóa để truy cập thiết bị qua system call. Vì thế, đôi khi OS được xem là một standard library.

Tất nhiên, còn rất nhiều chi tiết khác về cách truy cập thiết bị và cách file system quản lý dữ liệu persistently trên những thiết bị đó. Vì lý do hiệu năng, phần lớn file system trước hết trì hoãn các lần ghi như vậy một thời gian, với hy vọng gộp chúng thành các nhóm lớn hơn. Để xử lý vấn đề hệ thống crash trong khi ghi, phần lớn file system tích hợp một write protocol phức tạp nào đó, chẳng hạn journaling hoặc copy-on-write, sắp xếp cẩn thận thứ tự ghi xuống đĩa để bảo đảm rằng nếu xảy ra sự cố trong chuỗi ghi, hệ thống có thể khôi phục về trạng thái hợp lý sau đó. Để các thao tác thông dụng khác nhau hoạt động hiệu quả, file system sử dụng nhiều data structure và phương thức truy cập khác nhau, từ list đơn giản đến b-trees phức tạp. Nếu tất cả điều này chưa có ý nghĩa gì với bạn thì tốt! Ta sẽ nói nhiều hơn về tất cả những điều này trong phần thứ ba của cuốn sách về persistence, nơi ta thảo luận thiết bị và I/O nói chung, rồi trình bày rất chi tiết về đĩa, RAID và file system.

## 2.5 Mục tiêu thiết kế

Đến đây, bạn đã hình dung phần nào OS thực sự làm gì: nó lấy các tài nguyên vật lý như CPU, memory hoặc đĩa và virtualize chúng. Nó xử lý những vấn đề khó khăn và phức tạp liên quan đến concurrency. Và nó lưu file persistently, qua đó giữ chúng an toàn trong long-term. Khi muốn xây dựng một hệ thống như vậy, ta cần xác định một số mục tiêu để định hướng thiết kế và triển khai, đồng thời thực hiện trade-offs khi cần; tìm được tập hợp trade-offs phù hợp là chìa khóa để xây dựng hệ thống.

Một trong những mục tiêu cơ bản nhất là xây dựng các abstraction để làm hệ thống thuận tiện và dễ sử dụng. Abstraction là nền tảng của mọi việc ta làm trong khoa học máy tính. Abstraction cho phép viết một chương trình lớn bằng cách chia nó thành những phần nhỏ và dễ hiểu, viết chương trình như vậy bằng ngôn ngữ high-level như C[^9] mà không phải nghĩ đến assembly, viết code bằng assembly mà không phải nghĩ đến logic gate, và xây dựng processor từ các gate mà không phải nghĩ quá nhiều đến transistor. Abstraction cơ bản đến mức đôi khi ta quên tầm quan trọng của nó, nhưng ở đây ta sẽ không quên; vì vậy, trong mỗi phần, ta sẽ thảo luận một số abstraction chủ yếu đã phát triển theo thời gian, cho bạn một cách suy nghĩ về các thành phần của OS.

Một mục tiêu khi thiết kế và triển khai operating system là cung cấp hiệu năng cao; nói cách khác, mục tiêu của ta là giảm thiểu overhead của OS. Virtualization và việc làm cho hệ thống dễ sử dụng rất đáng giá, nhưng không phải bằng mọi giá; vì vậy, ta phải cố cung cấp virtualization và các tính năng OS khác mà không gây overhead quá mức. Overhead xuất hiện dưới nhiều dạng: thời gian bổ sung (nhiều instruction hơn) và không gian bổ sung (trong memory hoặc trên đĩa). Ta sẽ tìm những lời giải giảm thiểu một trong hai hoặc cả hai, nếu có thể. Tuy nhiên, không phải lúc nào cũng đạt được sự hoàn hảo, và đó là điều ta sẽ học cách nhận biết và (khi phù hợp) chấp nhận.

Một mục tiêu khác là cung cấp protection giữa các ứng dụng, cũng như giữa OS và ứng dụng. Vì muốn cho phép nhiều chương trình chạy cùng lúc, ta cần bảo đảm hành vi xấu do cố ý hoặc vô tình của một chương trình không làm hại các chương trình khác; chắc chắn ta không muốn một ứng dụng có thể làm hại chính OS (vì điều đó sẽ ảnh hưởng đến mọi chương trình đang chạy trên hệ thống). Protection là cốt lõi của một trong những nguyên tắc nền tảng chính của operating system, đó là isolation; cô lập các process với nhau là chìa khóa cho protection và vì thế là nền tảng của phần lớn những gì OS phải làm.

Operating system cũng phải chạy non-stop; khi nó gặp sự cố, mọi ứng dụng đang chạy trên hệ thống cũng gặp sự cố. Vì sự phụ thuộc này, operating system thường cố gắng cung cấp độ tin cậy cao. Khi operating system ngày càng phức tạp (đôi khi chứa hàng triệu dòng code), xây dựng một operating system tin cậy là một thách thức lớn — và thực ra, phần lớn nghiên cứu on-going trong lĩnh vực này (bao gồm một số công trình của chính chúng tôi [BS+09, SS+10]) tập trung vào đúng vấn đề đó.

Những mục tiêu khác cũng hợp lý: energy-efficiency quan trọng trong thế giới ngày càng chú trọng môi trường; security (thực chất là phần mở rộng của protection) chống ứng dụng độc hại là thiết yếu, đặc biệt trong thời đại highly-networked này; mobility ngày càng quan trọng khi OS chạy trên thiết bị ngày càng nhỏ. Tùy cách sử dụng hệ thống, OS có những mục tiêu khác nhau, do đó nhiều khả năng sẽ được triển khai theo những cách ít nhất cũng hơi khác nhau. Tuy nhiên, như ta sẽ thấy, nhiều nguyên tắc xây dựng OS được trình bày ở đây hữu ích trên nhiều thiết bị khác nhau.

## 2.6 Một chút lịch sử

Trước khi kết thúc phần giới thiệu này, hãy trình bày ngắn gọn lịch sử phát triển operating system. Giống mọi hệ thống do con người xây dựng, các ý tưởng hay dần tích lũy trong operating system theo thời gian, khi kỹ sư hiểu được điều gì quan trọng trong thiết kế. Ở đây, ta thảo luận một vài bước phát triển lớn. Để tìm hiểu sâu hơn, hãy đọc công trình lịch sử operating system xuất sắc của Brinch Hansen [BH00].

### Operating system thời kỳ đầu: Chỉ là thư viện

Ban đầu, operating system không làm gì nhiều. Về cơ bản, nó chỉ là một tập hợp thư viện chứa các hàm commonly-used; ví dụ, thay vì để mỗi lập trình viên của hệ thống tự viết code xử lý I/O low-level, “OS” sẽ cung cấp các API đó, nhờ vậy giúp công việc của lập trình viên dễ dàng hơn.

Thông thường, trên các hệ thống mainframe cũ này, mỗi lần chỉ chạy một chương trình, dưới sự điều khiển của một nhân viên vận hành. Phần lớn những gì bạn nghĩ OS hiện đại sẽ làm (chẳng hạn quyết định thứ tự chạy các job) đều do người này thực hiện. Nếu là lập trình viên khôn ngoan, bạn sẽ đối xử tốt với nhân viên vận hành để họ có thể chuyển job của bạn lên đầu queue.

Chế độ tính toán này được gọi là batch processing, vì một số job được thiết lập rồi được nhân viên vận hành cho chạy theo một “batch”. Khi đó, máy tính chưa được sử dụng theo cách tương tác vì chi phí: để người dùng ngồi trước máy tính và sử dụng đơn giản là quá đắt, vì khi đó phần lớn thời gian máy sẽ nằm idle, khiến cơ sở vận hành tốn hàng trăm nghìn đô la mỗi giờ [BH00].

### Vượt ra ngoài thư viện: Protection

Khi vượt ra ngoài vai trò thư viện đơn giản cung cấp các dịch vụ commonly-used, operating system đảm nhận vai trò trung tâm hơn trong quản lý máy. Một khía cạnh quan trọng là nhận ra code chạy thay mặt OS có tính chất đặc biệt; nó điều khiển thiết bị và do đó phải được đối xử khác code ứng dụng thông thường. Vì sao? Hãy tưởng tượng bạn cho phép mọi ứng dụng đọc ở bất kỳ đâu trên đĩa; khái niệm riêng tư sẽ biến mất, vì mọi chương trình đều có thể đọc mọi file. Vì vậy, triển khai file system (để quản lý file của bạn) dưới dạng thư viện chẳng có mấy ý nghĩa. Thay vào đó, cần một thứ khác.

Vì thế, ý tưởng system call ra đời, với hệ thống máy tính Atlas đi tiên phong [K+61,L78]. Thay vì cung cấp các OS routine dưới dạng thư viện (nơi bạn chỉ thực hiện procedure call để truy cập chúng), ý tưởng ở đây là bổ sung một cặp đặc biệt gồm hardware instruction và hardware state để việc chuyển vào OS trở thành một quá trình chính thức hơn và được kiểm soát.

Khác biệt then chốt giữa system call và procedure call là system call chuyển quyền điều khiển (tức là nhảy) vào OS đồng thời nâng hardware privilege level. Ứng dụng người dùng chạy trong chế độ gọi là user mode, nghĩa là hardware giới hạn những gì ứng dụng có thể làm; ví dụ, ứng dụng chạy trong user mode thường không thể khởi tạo I/O request đến đĩa, truy cập bất kỳ physical memory page nào hoặc gửi packet trên network. Khi system call được khởi tạo (thường thông qua một hardware instruction đặc biệt gọi là trap), hardware chuyển quyền điều khiển đến một trap handler pre-specified (do OS thiết lập trước đó) và đồng thời nâng privilege level lên kernel mode. Trong kernel mode, OS có toàn quyền truy cập hardware của hệ thống, do đó có thể làm những việc như khởi tạo I/O request hoặc cung cấp thêm memory cho chương trình. Khi OS xử lý xong yêu cầu, nó trả quyền điều khiển về người dùng qua một instruction return-from-trap đặc biệt, chuyển lại user mode đồng thời trả quyền điều khiển đến chỗ ứng dụng đã dừng trước đó.

### Kỷ nguyên Multiprogramming

Operating system thực sự phát triển mạnh trong kỷ nguyên tính toán vượt ra ngoài mainframe, tức kỷ nguyên minicomputer. Các máy kinh điển như dòng PDP của Digital Equipment khiến máy tính dễ tiếp cận hơn rất nhiều về giá; vì thế, thay vì mỗi tổ chức lớn chỉ có một mainframe, giờ đây một nhóm người nhỏ hơn trong tổ chức có thể có máy tính riêng. Không ngạc nhiên khi một trong những tác động lớn của việc giảm chi phí là hoạt động phát triển phần mềm gia tăng; nhiều người tài giỏi hơn được tiếp cận máy tính, nhờ vậy khiến hệ thống máy tính làm những việc thú vị và đẹp đẽ hơn.

Đặc biệt, multiprogramming trở nên phổ biến do mong muốn tận dụng tốt hơn tài nguyên máy. Thay vì mỗi lần chỉ chạy một job, OS load một số job vào memory và chuyển nhanh giữa chúng, qua đó cải thiện CPU utilization. Việc chuyển đổi này đặc biệt quan trọng vì thiết bị I/O chậm; để một chương trình chờ trên CPU trong khi I/O của nó được xử lý là lãng phí CPU time. Thay vào đó, tại sao không chuyển sang job khác và chạy nó một lúc?

Mong muốn hỗ trợ multiprogramming và thực thi chồng lấn khi có I/O và interrupt buộc sự phát triển về mặt khái niệm của operating system phải đổi mới theo nhiều hướng. Những vấn đề như memory protection trở nên quan trọng; ta không muốn chương trình này có thể truy cập memory của chương trình khác. Hiểu cách xử lý vấn đề concurrency do multiprogramming tạo ra cũng rất quan trọng; bảo đảm OS hoạt động đúng dù có interrupt là một thách thức lớn. Ta sẽ nghiên cứu những vấn đề này và các chủ đề liên quan ở phần sau cuốn sách.

Một trong những tiến bộ thực tiễn lớn lúc đó là sự ra đời của operating system UNIX, chủ yếu nhờ Ken Thompson (và Dennis Ritchie) tại Bell Labs (đúng vậy, công ty điện thoại). UNIX tiếp thu nhiều ý tưởng hay từ các operating system khác nhau (đặc biệt từ Multics [O72], và một số từ các hệ thống như TENEX [B+72] và Berkeley Time- Sharing System [S+68]), nhưng làm chúng đơn giản và dễ sử dụng hơn. Chẳng bao lâu, nhóm này gửi các cuộn băng chứa source code UNIX cho mọi người trên khắp thế giới, nhiều người sau đó tham gia và tự bổ sung vào hệ thống; xem phần thông tin thêm (trang tiếp theo) để biết chi tiết[^10].

### Kỷ nguyên hiện đại

Sau minicomputer xuất hiện một loại máy mới, rẻ hơn, nhanh hơn và dành cho đại chúng: personal computer, hay PC như ta gọi ngày nay. Với những máy đầu tiên của Apple (như Apple II) và IBM PC dẫn đầu, loại máy mới này sớm trở thành lực lượng thống trị trong điện toán, vì đặc tính low-cost cho phép mỗi bàn làm việc có một máy thay vì mỗi nhóm làm việc dùng chung một minicomputer.

Đáng tiếc là đối với operating system, ban đầu PC là một bước lùi lớn, vì các hệ thống đầu tiên quên mất (hoặc chưa từng biết) những bài học từ kỷ nguyên minicomputer. Ví dụ, các operating system đầu tiên như DOS (Disk Operating System, của Microsoft) không xem memory protection là quan trọng; do đó, một ứng dụng độc hại (hoặc có lẽ chỉ poorly-programmed) có thể ghi bừa khắp memory. Những thế hệ Mac OS đầu tiên (v9 trở về trước) dùng phương pháp cooperative cho job scheduling; vì thế, một thread vô tình mắc kẹt trong infinite loop có thể chiếm toàn hệ thống, buộc phải reboot. Danh sách đáng buồn những tính năng OS còn thiếu ở thế hệ hệ thống này rất dài, quá dài để thảo luận đầy đủ tại đây.

May mắn thay, sau vài năm khổ sở, những tính năng cũ của operating system trên minicomputer bắt đầu có mặt trên desktop. Ví dụ, Mac OS X có UNIX làm nền tảng, bao gồm mọi tính năng mà ta kỳ vọng ở một hệ thống trưởng thành như vậy. Windows cũng tiếp thu nhiều ý tưởng tuyệt vời trong lịch sử điện toán, đặc biệt bắt đầu từ Windows NT, một bước tiến lớn về công nghệ OS của Microsoft. Ngay cả điện thoại di động ngày nay cũng chạy operating system (như Linux) giống những gì minicomputer chạy vào thập niên 1970 hơn rất nhiều so với những gì PC chạy vào thập niên 1980 (thật may); thật tốt khi thấy các ý tưởng hay được phát triển trong thời hoàng kim của OS đã bước vào thế giới hiện đại. Tốt hơn nữa, các ý tưởng đó tiếp tục phát triển, cung cấp thêm tính năng và làm hệ thống hiện đại ngày càng tốt hơn cho người dùng và ứng dụng.

> THÔNG TIN THÊM: TẦM QUAN TRỌNG CỦA UNIX
>
> Khó có thể nói quá về tầm quan trọng của UNIX trong lịch sử operating system. Chịu ảnh hưởng từ các hệ thống đi trước (đặc biệt là hệ thống Multics nổi tiếng của MIT), U NIX tập hợp nhiều ý tưởng tuyệt vời và tạo ra một hệ thống vừa đơn giản vừa mạnh mẽ. Nền tảng của UNIX “Bell Labs” ban đầu là nguyên tắc thống nhất: xây dựng các chương trình nhỏ, mạnh mẽ, có thể kết nối với nhau để tạo workflow lớn hơn. Shell, nơi bạn nhập lệnh, cung cấp các primitive như pipe để hỗ trợ kiểu lập trình meta-level này, nhờ vậy dễ dàng nối các chương trình với nhau nhằm hoàn thành tác vụ lớn hơn. Ví dụ, để tìm những dòng trong một text file có từ “foo”, rồi đếm xem có bao nhiêu dòng như vậy, bạn sẽ gõ: grep foo file.txt|wc -l, tức là dùng các chương trình grep và wc (word count) để hoàn thành tác vụ. Môi trường UNIX thân thiện với cả người lập trình lẫn người phát triển phần mềm, đồng thời cung cấp compiler cho ngôn ngữ lập trình C mới. Việc giúp lập trình viên dễ viết và chia sẻ chương trình của mình khiến UNIX cực kỳ phổ biến. Việc các tác giả phát bản sao miễn phí cho bất kỳ ai yêu cầu, một hình thức phần mềm open-source ban đầu, có lẽ cũng giúp ích rất nhiều. Khả năng tiếp cận và tính dễ đọc của code cũng cực kỳ quan trọng. Một kernel nhỏ, đẹp, được viết bằng C mời gọi người khác thử nghiệm và bổ sung các tính năng mới thú vị. Ví dụ, một nhóm đầy sáng kiến tại Berkeley do Bill Joy dẫn đầu đã tạo một distribution tuyệt vời (Berkeley Systems Distribution, hay BSD) có các subsystem virtual memory, file system và networking tiên tiến. Sau đó, Joy co-founded Sun Microsystems. Đáng tiếc là sự lan rộng của UNIX chậm lại phần nào khi các công ty cố khẳng định quyền sở hữu và thu lợi từ nó, một hệ quả đáng tiếc (nhưng thường gặp) khi luật sư tham gia. Nhiều công ty có biến thể riêng: SunOS của Sun Microsystems, AIX của IBM, HPUX (còn gọi là “H-Pucks”) của HP và IRIX của SGI. Những tranh chấp pháp lý giữa AT&T/Bell Labs và các bên khác phủ bóng đen lên UNIX, khiến nhiều người tự hỏi nó có sống sót không, đặc biệt khi Windows xuất hiện và chiếm phần lớn thị trường PC...

> THÔNG TIN THÊM: RỒI LINUX XUẤT HIỆN
>
> May mắn cho UNIX, một hacker trẻ người Phần Lan tên Linus Torvalds quyết định viết phiên bản UNIX riêng, kế thừa rất nhiều nguyên tắc và ý tưởng của hệ thống ban đầu nhưng không lấy từ code base, nhờ đó tránh được vấn đề pháp lý. Anh kêu gọi nhiều người khác trên khắp thế giới giúp đỡ, và chẳng bao lâu Linux ra đời (cùng phong trào phần mềm open-source hiện đại). Khi kỷ nguyên internet bắt đầu, phần lớn công ty (như Google, Amazon, Facebook và các công ty khác) chọn chạy Linux vì miễn phí và có thể dễ dàng sửa đổi cho phù hợp nhu cầu; thực sự khó hình dung thành công của những công ty mới này nếu không có một hệ thống như vậy. Khi điện thoại thông minh trở thành nền tảng user-facing chủ đạo, Linux cũng có chỗ đứng vững chắc ở đó (qua Android), vì nhiều lý do tương tự. Và Steve Jobs mang môi trường operating system NeXTStep UNIX-based của mình đến Apple, nhờ đó làm UNIX phổ biến trên desktop (dù nhiều người dùng công nghệ Apple có lẽ còn không biết điều này). Và như vậy UNIX vẫn sống tiếp, ngày nay quan trọng hơn bao giờ hết. Nếu bạn tin có các vị thần điện toán, hãy cảm ơn họ vì kết quả tuyệt vời này.

## 2.7 Tóm tắt

Như vậy, ta đã có phần giới thiệu về OS. Operating system ngày nay giúp hệ thống tương đối dễ sử dụng, và hầu như mọi operating system bạn dùng hiện nay đều chịu ảnh hưởng của những bước phát triển mà ta sẽ thảo luận xuyên suốt cuốn sách.

Đáng tiếc là do giới hạn thời gian, có một số phần của OS ta sẽ không trình bày trong sách. Ví dụ, operating system chứa rất nhiều networking code; bạn hãy học học phần networking để tìm hiểu thêm. Tương tự, thiết bị đồ họa đặc biệt quan trọng; hãy học học phần đồ họa để mở rộng kiến thức theo hướng đó. Cuối cùng, một số sách operating system nói rất nhiều về security; ta cũng sẽ đề cập theo nghĩa OS phải cung cấp protection giữa các chương trình đang chạy và cho người dùng khả năng bảo vệ file, nhưng sẽ không đi sâu vào những vấn đề security mà bạn có thể gặp trong một học phần security.

Tuy nhiên, ta sẽ trình bày nhiều chủ đề quan trọng, bao gồm nền tảng virtualization của CPU và memory, concurrency, và persistence thông qua thiết bị cùng file system. Đừng lo! Dù có rất nhiều nội dung cần học, phần lớn khá thú vị, và khi đi hết chặng đường, bạn sẽ có cách nhìn mới đầy trân trọng về cách hệ thống máy tính thực sự hoạt động. Giờ thì bắt tay vào việc thôi!

## Tài liệu tham khảo

[BS+09] “Tolerating File-System Mistakes with EnvyFS”

Lakshmi N. Bairavasundaram, Swaminathan Sundararaman, Andrea C. Arpaci-Dusseau, Remzi H. Arpaci-Dusseau

USENIX ’09, San Diego, CA, tháng 6 năm 2009

Một bài báo thú vị về việc dùng nhiều file system cùng lúc để chịu được lỗi trong bất kỳ file system nào.

[BH00] “The Evolution of Operating Systems”

P. Brinch Hansen

Trong Classic Operating Systems: From Batch Processing to Distributed Systems

Springer-Verlag, New York, 2000

Bài luận này giới thiệu một tuyển tập tuyệt vời các bài báo về những hệ thống có ý nghĩa lịch sử.

[B+72] “TENEX, A Paged Time Sharing System for the PDP-10”

Daniel G. Bobrow, Jerry D. Burchfiel, Daniel L. Murphy, Raymond S. Tomlinson

CACM, Tập 15, Số 3, tháng 3 năm 1972

TENEX có nhiều mechanism mà ta thấy trong operating system hiện đại; hãy đọc thêm để thấy đầu thập niên 1970 đã có nhiều đổi mới đến mức nào.

[B75] “The Mythical Man-Month”

Fred Brooks

Addison-Wesley, 1975

Một tác phẩm kinh điển về kỹ nghệ phần mềm; rất đáng đọc.

[BOH10] “Computer Systems: A Programmer’s Perspective”

Randal E. Bryant and David R. O’Hallaron

Addison-Wesley, 2010

Một phần giới thiệu tuyệt vời khác về cách hệ thống máy tính hoạt động. Sách có một chút nội dung trùng với cuốn này — vì vậy, nếu muốn, bạn có thể bỏ qua vài chương cuối của cuốn đó, hoặc cứ đọc để có góc nhìn khác về một số nội dung tương tự. Dù sao, một cách tốt để xây dựng kiến thức của mình là lắng nghe càng nhiều góc nhìn khác càng tốt, rồi hình thành quan điểm và suy nghĩ riêng về vấn đề. Bạn biết đấy, bằng cách suy nghĩ!

[K+61] “One-Level Storage System”

T. Kilburn, D.B.G. Edwards, M.J. Lanigan, F.H. Sumner

IRE Transactions on Electronic Computers, tháng 4 năm 1962

Atlas đi tiên phong trong nhiều điều bạn thấy ở hệ thống hiện đại. Tuy nhiên, bài báo này không phải lựa chọn dễ đọc nhất. Nếu chỉ đọc một bài, bạn có thể thử bài viết từ góc nhìn lịch sử bên dưới [L78].

[L78] “The Manchester Mark I and Atlas: A Historical Perspective”

S. H. Lavington

Communications of the ACM archive

Tập 21, Số 1 (tháng 1 năm 1978), trang 4-12

Một bài viết lịch sử hay về giai đoạn phát triển đầu tiên của hệ thống máy tính và những nỗ lực tiên phong của Atlas. Tất nhiên, bạn có thể quay lại đọc chính các bài báo về Atlas, nhưng bài này cung cấp cái nhìn tổng quan rất tốt và bổ sung góc nhìn lịch sử.

[O72] “The Multics System: An Examination of its Structure”

Elliott Organick, 1972

Một cái nhìn tổng quan tuyệt vời về Multics. Rất nhiều ý tưởng hay, nhưng đó là một hệ thống over-designed, nhắm đến quá nhiều thứ nên chưa bao giờ thực sự hoạt động như kỳ vọng. Một ví dụ kinh điển về điều Fred Brooks gọi là “hiệu ứng second-system” [B75].

[PP03] “Introduction to Computing Systems: From Bits and Gates to C and Beyond”

Yale N. Patt and Sanjay J. Patel

McGraw-Hill, 2003

Một trong những cuốn sách nhập môn hệ thống máy tính mà chúng tôi yêu thích. Bắt đầu từ transistor và đưa bạn đi đến tận C; phần nội dung ban đầu đặc biệt hay.

[RT74] “The UNIX Time-Sharing System”

Dennis M. Ritchie and Ken Thompson

CACM, Tập 17, Số 7, tháng 7 năm 1974, trang 365-375

Một bản tổng kết tuyệt vời về UNIX do chính những người viết nó biên soạn khi UNIX đang chinh phục thế giới điện toán.

[S68] “SDS 940 Time-Sharing System”

Scientific Data Systems Inc.

TÀI LIỆU HƯỚNG DẪN KỸ THUẬT, SDS 90 11168 tháng 8 năm 1968

Có tại: http://goo.gl/EN0Zrn

Đúng vậy, tài liệu hướng dẫn kỹ thuật là thứ tốt nhất mà chúng tôi tìm được. Nhưng đọc những tài liệu hệ thống cũ này và thấy cuối thập niên 1960 đã có nhiều thứ đến đâu thật thú vị. Một trong những người đứng sau Berkeley Time-Sharing System (sau này trở thành hệ thống SDS) là Butler Lampson, người sau đó giành giải Turing nhờ những đóng góp về hệ thống.

[SS+10] “Membrane: Operating System Support for Restartable File Systems”

Swaminathan Sundararaman, Sriram Subramanian, Abhishek Rajimwale,

Andrea C. Arpaci-Dusseau, Remzi H. Arpaci-Dusseau, Michael M. Swift

FAST ’10, San Jose, CA, tháng 2 năm 2010

Điều tuyệt vời khi tự viết ghi chép bài giảng: bạn có thể quảng bá nghiên cứu của chính mình. Nhưng bài báo này thực sự khá hay — khi file system gặp bug rồi crash, Membrane auto-magically khởi động lại nó mà không ảnh hưởng đến ứng dụng hay phần còn lại của hệ thống.

---

[^1]: Tất nhiên, processor hiện đại thực hiện nhiều điều kỳ lạ và đáng sợ bên trong để chương trình chạy nhanh hơn, chẳng hạn thực thi nhiều instruction cùng lúc, thậm chí issue và hoàn tất chúng không theo thứ tự! Nhưng đó không phải điều ta quan tâm ở đây; ta chỉ quan tâm mô hình đơn giản mà phần lớn chương trình giả định: các instruction dường như thực thi từng cái một, theo thứ tự và tuần tự.

[^2]: Von Neumann là một trong những người tiên phong đầu tiên về hệ thống máy tính. Ông cũng có công trình tiên phong về lý thuyết trò chơi và bom nguyên tử, và chơi ở NBA trong sáu năm. Được rồi, một trong những điều đó không đúng.

[^3]: Một tên gọi ban đầu khác của OS là supervisor, hoặc thậm chí master control program. Có vẻ tên sau nghe hơi quá đà (xem phim Tron để biết chi tiết), vì vậy, thật may là “operating system” đã trở nên phổ biến thay cho nó.

[^4]: Lưu ý cách ta chạy bốn process cùng lúc bằng ký hiệu &. Làm vậy sẽ chạy một job ở background trong tcsh shell, nghĩa là người dùng có thể lập tức nhập lệnh tiếp theo, trong trường hợp này là chạy một chương trình khác. Dấu semi-colon giữa các lệnh cho phép chạy nhiều chương trình cùng lúc trong tcsh. Nếu dùng shell khác (như bash), cách làm hơi khác; hãy đọc tài liệu trực tuyến để biết chi tiết.

[^5]: Để ví dụ này hoạt động, bạn cần bảo đảm address-space randomization bị tắt; hóa ra randomization có thể là biện pháp phòng vệ tốt trước một số loại lỗ hổng security. Hãy tự tìm hiểu thêm, đặc biệt nếu bạn muốn học cách đột nhập hệ thống máy tính qua các cuộc tấn công stack-smashing. Không phải chúng tôi khuyên bạn làm vậy đâu...

[^6]: Lời gọi thực tế phải dùng pthread_create() lower-case; phiên bản upper-case là wrapper riêng của chúng tôi, gọi pthread_create() và bảo đảm return code cho biết lời gọi đã thành công. Xem code để biết chi tiết.

[^7]: Bạn nên dùng Emacs. Nếu đang dùng vi, có lẽ bạn có gì đó không ổn. Nếu đang dùng thứ gì đó không phải code editor thực thụ thì còn tệ hơn.

[^8]: Device driver là phần code trong operating system biết cách làm việc với một thiết bị cụ thể. Ta sẽ nói thêm về thiết bị và device driver ở phần sau.

[^9]: Một số bạn có thể phản đối việc gọi C là ngôn ngữ high-level. Nhưng hãy nhớ đây là học phần OS, nơi ta đơn giản chỉ vui vì không phải lúc nào cũng viết code bằng assembly!

[^10]: Ta sẽ dùng các phần thông tin thêm và khung văn bản liên quan khác để thu hút sự chú ý đến những nội dung không thật sự phù hợp với mạch trình bày chính. Đôi khi, ta thậm chí dùng chúng chỉ để kể chuyện cười, vì sao không vui một chút trên đường học nhỉ? Đúng vậy, nhiều câu đùa khá dở.
