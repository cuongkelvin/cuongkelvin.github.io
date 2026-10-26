# 5 Phần thực hành xen kẽ: Process API

> THÔNG TIN THÊM: CÁC PHẦN THỰC HÀNH XEN KẼ
>
> Các phần thực hành xen kẽ sẽ trình bày những khía cạnh thực tiễn hơn của hệ thống, đặc biệt tập trung vào API của operating system và cách sử dụng. Nếu không thích những điều thực tiễn, bạn có thể bỏ qua các phần này. Nhưng bạn nên thích chúng, vì nhìn chung chúng hữu ích trong cuộc sống thực; chẳng hạn, các công ty thường không tuyển bạn vì những kỹ năng non-practical.

Trong phần thực hành xen kẽ này, ta thảo luận việc tạo process trong hệ thống UNIX. UNIX cung cấp một trong những cách tạo process mới thú vị nhất thông qua cặp system call: fork() và exec(). Một routine thứ ba, wait(), có thể được dùng khi một process muốn chờ process mà nó đã tạo hoàn tất. Giờ ta sẽ trình bày chi tiết hơn các interface này, với một vài ví dụ đơn giản để thấy lý do cần đến chúng. Và như vậy, vấn đề của ta là:

> MẤU CHỐT: LÀM THẾ NÀO ĐỂ TẠO VÀ ĐIỀU KHIỂN PROCESS
>
> OS nên cung cấp những interface nào để tạo và điều khiển process? Nên thiết kế các interface này như thế nào để vừa dễ sử dụng vừa hữu ích?

## 5.1 System call fork()

System call fork() được dùng để tạo process mới [C63]. Tuy nhiên, hãy chuẩn bị tinh thần: chắc chắn đây là routine kỳ lạ nhất mà bạn từng gọi[^1]. Cụ thể hơn, bạn có một chương trình đang chạy với code như trong Hình 5.1; hãy xem xét code, hoặc tốt hơn nữa, tự gõ vào và chạy thử!

```
 1   #include <stdio.h>
 2   #include <stdlib.h>
 3   #include <unistd.h>
 4
 5   int
 6   main(int argc, char *argv[])
 7   {
 8       printf("hello world (pid:%d)\n", (int) getpid());
 9       int rc = fork();
10       if (rc < 0) {         // fork failed; exit
11           fprintf(stderr, "fork failed\n");
12           exit(1);
13       } else if (rc == 0) { // child (new process)
14           printf("hello, I am child (pid:%d)\n", (int) getpid());
15       } else {              // parent goes down this path (main)
16           printf("hello, I am parent of %d (pid:%d)\n",
17                   rc, (int) getpid());
18       }
19       return 0;
20   }
```

Hình 5.1: Gọi fork() (p1.c)

Khi chạy chương trình này (có tên p1.c), bạn sẽ thấy như sau:

```
prompt> ./p1
hello world (pid:29146)
hello, I am parent of 29147 (pid:29146)
hello, I am child (pid:29147)
prompt>
```

Hãy tìm hiểu chi tiết hơn những gì đã xảy ra trong p1.c. Khi vừa bắt đầu chạy, process in một thông báo hello world; thông báo này có chứa process identifier của nó, còn gọi là PID. Process có PID bằng 29146; trong hệ thống UNIX, PID được dùng để định danh process khi muốn thực hiện thao tác nào đó với nó, chẳng hạn dừng nó chạy. Đến đây mọi thứ vẫn ổn.

Giờ phần thú vị bắt đầu. Process gọi system call fork(), được OS cung cấp như một cách tạo process mới. Điều kỳ lạ là process được tạo ra là bản sao (gần như) chính xác của process gọi hàm. Nghĩa là từ góc nhìn OS, giờ đây dường như có hai bản sao chương trình p1 đang chạy, và cả hai đều sắp trả về từ system call fork(). Process newly-created (gọi là child, khác với parent đã tạo ra nó) không bắt đầu chạy tại main() như bạn có thể kỳ vọng (lưu ý thông báo “hello, world” chỉ được in một lần); thay vào đó, nó xuất hiện như thể chính nó đã gọi fork().

Có lẽ bạn đã nhận thấy: child không phải bản sao chính xác hoàn toàn. Cụ thể, mặc dù giờ nó có bản sao address space riêng (tức memory riêng), register riêng, PC riêng, v.v., giá trị trả về cho bên gọi fork() lại khác. Cụ thể, trong khi parent nhận PID của child newly-created, child chỉ nhận giá trị trả về 0. Sự phân biệt này hữu ích, vì nhờ đó có thể dễ dàng viết code xử lý hai trường hợp khác nhau (như bên trên).

```
 1   #include <stdio.h>
 2   #include <stdlib.h>
 3   #include <unistd.h>
 4   #include <sys/wait.h>
 5
 6   int
 7   main(int argc, char *argv[])
 8   {
 9       printf("hello world (pid:%d)\n", (int) getpid());
10       int rc = fork();
11       if (rc < 0) {         // fork failed; exit
12           fprintf(stderr, "fork failed\n");
13           exit(1);
14       } else if (rc == 0) { // child (new process)
15           printf("hello, I am child (pid:%d)\n", (int) getpid());
16       } else {              // parent goes down this path (main)
17           int wc = wait(NULL);
18           printf("hello, I am parent of %d (wc:%d) (pid:%d)\n",
19                   rc, wc, (int) getpid());
20       }
21       return 0;
22   }
```

Hình 5.2: Gọi fork() và wait() (p2.c)

Bạn cũng có thể nhận thấy đầu ra (của p1.c) không deterministic. Khi child process được tạo ra, trong hệ thống có hai process đang hoạt động mà ta quan tâm: parent và child. Giả sử đang chạy trên hệ thống có một CPU duy nhất (để đơn giản), thì child hoặc parent đều có thể chạy tại thời điểm đó. Trong ví dụ bên trên, parent chạy trước nên in thông báo trước. Trong các trường hợp khác, điều ngược lại có thể xảy ra, như trace đầu ra sau đây:

```
prompt> ./p1
hello world (pid:29146)
hello, I am child (pid:29147)
hello, I am parent of 29147 (pid:29146)
prompt>
```

CPU scheduler, một chủ đề ta sẽ sớm thảo luận rất chi tiết, quyết định process nào chạy tại một thời điểm nhất định; vì scheduler phức tạp, thông thường ta không thể đưa ra giả định chắc chắn về lựa chọn của nó, và do đó về process nào sẽ chạy trước. Hóa ra tính non-determinism này dẫn đến một số vấn đề thú vị, đặc biệt trong chương trình multi-threaded; vì vậy, ta sẽ gặp nhiều non-determinism hơn nữa khi nghiên cứu concurrency ở phần thứ hai của cuốn sách.

## 5.2 System call wait()

Đến đây, ta chưa làm gì nhiều: chỉ tạo một child in thông báo rồi thoát. Hóa ra đôi khi parent chờ child process hoàn thành công việc đang làm là điều rất hữu ích. Tác vụ này được thực hiện bằng system call wait() (hoặc hàm cùng họ đầy đủ hơn là waitpid()); xem Hình 5.2 để biết chi tiết.

Trong ví dụ này (p2.c), parent process gọi wait() để trì hoãn việc thực thi của nó cho đến khi child thực thi xong. Khi child hoàn tất, wait() trả về cho parent.

Thêm lời gọi wait() vào code bên trên khiến đầu ra trở thành deterministic. Bạn có thấy vì sao không? Hãy thử suy nghĩ xem.

(đang đợi bạn suy nghĩ .... và xong)

Giờ bạn đã suy nghĩ một chút, đây là đầu ra:

```
prompt> ./p2
hello world (pid:29266)
hello, I am child (pid:29267)
hello, I am parent of 29267 (wc:29267) (pid:29266)
prompt>
```

Với code này, giờ ta biết child luôn in trước. Vì sao ta biết điều đó? Nó có thể đơn giản là chạy trước như lúc nãy, và vì vậy in trước parent. Tuy nhiên, nếu parent thực sự chạy trước, nó sẽ lập tức gọi wait(); system call này sẽ không trả về cho đến khi child đã chạy và thoát[^2]. Vì vậy, ngay cả khi parent chạy trước, nó vẫn lịch sự chờ child chạy xong, rồi wait() trả về, sau đó parent mới in thông báo.

## 5.3 Cuối cùng là system call exec()

Một thành phần cuối cùng và quan trọng của API tạo process là system call exec()[^3]. System call này hữu ích khi bạn muốn chạy chương trình khác với chương trình gọi hàm. Ví dụ, gọi fork() trong p2.c chỉ hữu ích nếu muốn tiếp tục chạy các bản sao của cùng chương trình. Tuy nhiên, bạn thường muốn chạy một chương trình khác; exec() thực hiện đúng điều đó (Hình 5.3, trang 5).

Trong ví dụ này, child process gọi execvp() để chạy chương trình wc, chương trình đếm từ. Thực ra, nó chạy wc trên source file p3.c, qua đó cho biết file có bao nhiêu dòng, từ và byte:

```
prompt> ./p3
hello world (pid:29383)
hello, I am child (pid:29384)
      29     107    1030 p3.c
hello, I am parent of 29384 (wc:29384) (pid:29383)
prompt>
 1   #include <stdio.h>
 2   #include <stdlib.h>
 3   #include <unistd.h>
 4   #include <string.h>
 5   #include <sys/wait.h>
 6
 7   int
 8   main(int argc, char *argv[])
 9   {
10       printf("hello world (pid:%d)\n", (int) getpid());
11       int rc = fork();
12       if (rc < 0) {         // fork failed; exit
13           fprintf(stderr, "fork failed\n");
14           exit(1);
15       } else if (rc == 0) { // child (new process)
16           printf("hello, I am child (pid:%d)\n", (int) getpid());
17           char *myargs[3];
18           myargs[0] = strdup("wc");   // program: "wc" (word count)
19           myargs[1] = strdup("p3.c"); // argument: file to count
20           myargs[2] = NULL;           // marks end of array
21           execvp(myargs[0], myargs);  // runs word count
22           printf("this shouldn’t print out");
23       } else {              // parent goes down this path (main)
24           int wc = wait(NULL);
25           printf("hello, I am parent of %d (wc:%d) (pid:%d)\n",
26                   rc, wc, (int) getpid());
27       }
28       return 0;
29   }
```

Hình 5.3: Gọi fork(), wait() và exec() (p3.c)

System call fork() khá kỳ lạ; “đồng phạm” của nó, exec(), cũng chẳng bình thường hơn. Nó hoạt động như sau: với tên một executable (ví dụ wc) và một số argument (ví dụ p3.c), nó load code (và static data) từ executable đó rồi ghi đè lên code segment hiện tại (và static data hiện tại); heap, stack và các phần khác trong memory space của chương trình được re-initialized. Sau đó, OS chỉ việc chạy chương trình đó, truyền các argument dưới dạng argv của process. Vì vậy, nó không tạo process mới; thay vào đó, nó biến chương trình hiện đang chạy (trước đây là p3) thành một chương trình đang chạy khác (wc). Sau exec() trong child, gần như có thể xem p3.c chưa từng chạy; lời gọi exec() thành công không bao giờ trả về.

## 5.4 Vì sao? Lý do đằng sau thiết kế API

Tất nhiên, có thể bạn có một câu hỏi lớn: tại sao lại xây dựng interface kỳ lạ như vậy cho một việc lẽ ra đơn giản là tạo process mới? Hóa ra tách biệt fork() và exec() là điều thiết yếu để xây dựng UNIX shell, vì nó cho phép shell chạy code sau lời gọi fork() nhưng trước lời gọi exec(); code này có thể thay đổi môi trường của chương trình about-to-be-run, nhờ đó dễ dàng xây dựng nhiều tính năng thú vị.

> MẸO: LÀM CHO ĐÚNG (ĐỊNH LUẬT LAMPSON)
>
> Như Lampson phát biểu trong bài viết well-regarded “Hints for Computer Systems Design” [L83]: “Hãy làm cho đúng. Cả abstraction lẫn sự đơn giản đều không thể thay thế việc làm cho đúng.” Đôi khi bạn chỉ cần làm điều đúng, và khi làm được, kết quả tốt hơn hẳn những lựa chọn khác. Có nhiều cách thiết kế API tạo process; tuy nhiên, sự kết hợp fork() và exec() vừa đơn giản vừa cực kỳ mạnh mẽ. Ở đây, những người thiết kế UNIX đơn giản là đã làm đúng. Và vì Lampson thường xuyên “làm đúng” như vậy, ta đặt tên định luật để vinh danh ông.

Shell chỉ là một user program[^4]. Nó hiển thị prompt rồi chờ bạn nhập gì đó. Sau đó bạn nhập một lệnh (tức tên một executable program kèm các argument, nếu có); trong phần lớn trường hợp, shell xác định executable nằm ở đâu trong file system, gọi fork() để tạo child process mới chạy lệnh, gọi một biến thể của exec() để chạy lệnh, rồi chờ lệnh hoàn tất bằng cách gọi wait(). Khi child hoàn tất, shell trả về từ wait() và lại in prompt, sẵn sàng nhận lệnh tiếp theo của bạn.

Việc tách biệt fork() và exec() cho phép shell thực hiện nhiều việc hữu ích khá dễ dàng. Ví dụ:

```
prompt> wc p3.c > newfile.txt
```

Trong ví dụ bên trên, đầu ra chương trình wc được redirect vào output file newfile.txt (ký hiệu greater-than được dùng để biểu thị redirection này). Cách shell thực hiện tác vụ khá đơn giản: khi child được tạo, trước khi gọi exec(), shell đóng standard output và mở file newfile.txt. Nhờ vậy, mọi đầu ra từ chương trình wc soon-to-be-running được gửi đến file thay vì màn hình.

Hình 5.4 cho thấy một chương trình thực hiện chính xác điều này. Redirection hoạt động được là nhờ một giả định về cách operating system quản lý file descriptor. Cụ thể, hệ thống UNIX bắt đầu tìm file descriptor còn trống từ không. Trong trường hợp này, STDOUT_FILENO là descriptor đầu tiên sẵn có nên được gán khi gọi open(). Những lần ghi sau đó của child process vào standard output file descriptor, ví dụ bằng routine như printf(), sẽ được chuyển hướng trong suốt đến file newly-opened thay vì màn hình.

Đây là đầu ra khi chạy chương trình p4.c:

```
prompt> ./p4
prompt> cat p4.output
      32     109     846 p4.c
prompt>
 1   #include <stdio.h>
 2   #include <stdlib.h>
 3   #include <unistd.h>
 4   #include <string.h>
 5   #include <fcntl.h>
 6   #include <sys/wait.h>
 7
 8   int
 9   main(int argc, char *argv[])
10   {
11       int rc = fork();
12       if (rc < 0) {          // fork failed; exit
13           fprintf(stderr, "fork failed\n");
14           exit(1);
15       } else if (rc == 0) { // child: redirect standard output to a file
16           close(STDOUT_FILENO);
17           open("./p4.output", O_CREAT|O_WRONLY|O_TRUNC, S_IRWXU);
18
19           // now exec "wc"...
20           char *myargs[3];
21           myargs[0] = strdup("wc");   // program: "wc" (word count)
22           myargs[1] = strdup("p4.c"); // argument: file to count
23           myargs[2] = NULL;           // marks end of array
24           execvp(myargs[0], myargs);  // runs word count
25       } else {              // parent goes down this path (main)
26           int wc = wait(NULL);
27       }
28       return 0;
29   }
```

Hình 5.4: Kết hợp tất cả những điều trên với redirection (p4.c)

Bạn sẽ nhận thấy (ít nhất) hai điểm thú vị về đầu ra này. Thứ nhất, khi p4 chạy, có vẻ chẳng có gì xảy ra; shell chỉ in command prompt và lập tức sẵn sàng nhận lệnh tiếp theo. Tuy nhiên, thực tế không phải vậy; chương trình p4 thực sự đã gọi fork() để tạo child mới, rồi chạy chương trình wc qua lời gọi execvp(). Bạn không thấy đầu ra nào trên màn hình vì nó đã được redirect đến file p4.output. Thứ hai, bạn có thể thấy khi ta dùng cat để xem output file, toàn bộ đầu ra mong đợi từ việc chạy wc đều có trong đó. Hay đấy chứ?

UNIX pipe được triển khai tương tự, nhưng dùng system call pipe(). Trong trường hợp này, đầu ra của một process được nối với pipe in-kernel (tức queue), và đầu vào của process khác được nối với cùng pipe đó; nhờ vậy, đầu ra của process này được dùng liền mạch làm đầu vào cho process tiếp theo, cho phép nối các lệnh thành những chuỗi dài và hữu ích. Ví dụ đơn giản, hãy xét việc tìm một từ trong file rồi đếm số lần từ đó xuất hiện; với pipe và các tiện ích grep cùng wc, việc này rất dễ — chỉ cần gõ grep -o foo file | wc -l vào command prompt và chiêm ngưỡng kết quả.

Cuối cùng, dù ta mới phác thảo process API ở mức khái quát, vẫn còn nhiều chi tiết về các lời gọi này cần học và hiểu; chẳng hạn, ta sẽ tìm hiểu thêm về file descriptor khi nói đến file system trong phần thứ ba của sách. Hiện tại, chỉ cần nói rằng sự kết hợp fork()/exec() là cách mạnh mẽ để tạo và thao tác với process.

> THÔNG TIN THÊM: RTFM — HÃY ĐỌC MAN PAGE
>
> Nhiều lần trong sách, khi đề cập một system call hoặc library call cụ thể, ta sẽ khuyên bạn đọc manual page, gọi ngắn gọn là man page. Man page là hình thức tài liệu ban đầu trên hệ thống UNIX; hãy nhớ rằng chúng được tạo ra trước khi có thứ gọi là web. Dành thời gian đọc man page là một bước quan trọng trong quá trình trưởng thành của lập trình viên hệ thống; những trang đó ẩn chứa rất nhiều thông tin nhỏ hữu ích. Một số trang đặc biệt đáng đọc là man page của shell bạn đang dùng (ví dụ tcsh hoặc bash), và chắc chắn là của mọi system call mà chương trình gọi (để biết các return value và error condition có thể có). Cuối cùng, đọc man page còn giúp bạn tránh chút ngượng ngùng. Khi bạn hỏi đồng nghiệp về một chi tiết phức tạp của fork(), họ có thể chỉ đáp: “RTFM.” Đây là cách đồng nghiệp nhẹ nhàng thúc giục bạn Read The Man pages. Chữ F trong RTFM chỉ thêm chút sắc thái cho cụm từ...

## 5.5 Các phần khác của API

Ngoài fork(), exec() và wait(), còn có nhiều interface khác để tương tác với process trong hệ thống UNIX. Ví dụ, system call kill() được dùng để gửi signal đến process, gồm các chỉ thị đi ngủ, kết thúc và những mệnh lệnh hữu ích khác. Thực ra, toàn bộ signal subsystem cung cấp một hạ tầng phong phú để chuyển external event đến process, bao gồm các cách nhận và xử lý những signal đó.

Cũng có nhiều công cụ command-line hữu ích. Ví dụ, dùng lệnh ps cho phép xem process nào đang chạy; hãy đọc man page để biết các flag hữu ích có thể truyền cho ps. Công cụ top cũng rất hữu ích vì hiển thị các process của hệ thống cùng lượng CPU và tài nguyên khác mà chúng đang tiêu thụ. Khá buồn cười là nhiều lần khi chạy, top tự nhận nó là chương trình ngốn tài nguyên hàng đầu; có lẽ nó hơi tự cao. Cuối cùng, có nhiều loại công cụ đo CPU mà bạn có thể dùng để nắm nhanh tải hệ thống; chẳng hạn, chúng tôi luôn để MenuMeters (của Raging Menace software) chạy trên toolbar Macintosh để thấy mức sử dụng CPU tại bất kỳ thời điểm nào. Nhìn chung, càng có nhiều thông tin về những gì đang diễn ra càng tốt.

## 5.6 Tóm tắt

Ta đã giới thiệu một số API liên quan đến việc tạo process trong UNIX: fork(), exec() và wait(). Tuy nhiên, ta mới chỉ chạm đến bề mặt. Để biết thêm chi tiết, tất nhiên hãy đọc Stevens và Rago [SR05], đặc biệt là các chương Process Control, Process Relationships và Signals. Có rất nhiều điều để học hỏi từ kiến thức sâu sắc trong đó.

## Tài liệu tham khảo

[C63] “A Multiprocessor System Design”

Melvin E. Conway

AFIPS ’63 Fall Joint Computer Conference

New York, USA 1963

Một bài báo thời kỳ đầu về cách thiết kế hệ thống multiprocessing; có thể đây là nơi đầu tiên thuật ngữ fork() được dùng khi thảo luận việc tạo process mới.

[DV66] “Programming Semantics for Multiprogrammed Computations”

Jack B. Dennis and Earl C. Van Horn

Communications of the ACM, Tập 9, Số 3, tháng Ba năm 1966

Một bài báo kinh điển phác thảo những điều cơ bản của hệ thống máy tính multiprogrammed. Chắc chắn nó có ảnh hưởng lớn đến Project MAC, Multics và cuối cùng là UNIX.

[L83] “Hints for Computer Systems Design”

Butler Lampson

ACM Operating Systems Review, 15:5, tháng Mười năm 1983

Những gợi ý nổi tiếng của Lampson về cách thiết kế hệ thống máy tính. Bạn nên đọc vào một thời điểm nào đó trong đời, và có lẽ nên đọc lại vào nhiều thời điểm khác nhau.

[SR05] “Advanced Programming in the UNIX Environment”

W. Richard Stevens and Stephen A. Rago

Addison-Wesley, 2005

Mọi sắc thái và chi tiết tinh tế khi sử dụng UNIX API đều có ở đây. Hãy mua cuốn sách này! Đọc nó! Và quan trọng nhất, sống cùng nó.

> THÔNG TIN THÊM: BÀI TẬP VIẾT CODE
>
> Bài tập viết code là những bài tập nhỏ trong đó bạn viết code chạy trên máy thực để có kinh nghiệm với một số API cơ bản mà operating system hiện đại cung cấp. Dù sao, bạn (có lẽ) là người làm khoa học máy tính, nên hẳn phải thích viết code, đúng không? Tất nhiên, để thực sự trở thành chuyên gia, bạn phải dành không ít thời gian mày mò trên máy; thật vậy, hãy tìm mọi lý do có thể để viết code và xem nó hoạt động ra sao. Hãy dành thời gian và trở thành bậc thầy am hiểu mà bạn biết mình có thể trở thành.

## Bài tập về nhà (Code)

Trong bài tập này, bạn sẽ làm quen với các API quản lý process vừa đọc. Đừng lo – nó còn vui hơn cả lời mô tả! Nhìn chung, bạn sẽ tiến bộ hơn nhiều nếu dành nhiều thời gian nhất có thể để viết code[^5], vậy tại sao không bắt đầu ngay?

### Câu hỏi

1. Viết chương trình gọi fork(). Trước khi gọi fork(), cho main process truy cập một variable (ví dụ x) và đặt giá trị nào đó cho nó (ví dụ 100). Variable trong child process có giá trị gì? Điều gì xảy ra với variable khi cả child lẫn parent đều thay đổi giá trị x?

2. Viết chương trình mở file (bằng system call open()) rồi gọi fork() để tạo process mới. Cả child lẫn parent có thể truy cập file descriptor mà open() trả về không? Điều gì xảy ra khi chúng ghi vào file concurrently, tức cùng lúc?

3. Viết một chương trình khác dùng fork(). Child process phải in “hello”; parent process phải in “goodbye”. Bạn nên cố bảo đảm child process luôn in trước; bạn có thể làm điều này mà không gọi wait() trong parent không?

4. Viết chương trình gọi fork() rồi gọi một dạng exec() nào đó để chạy chương trình /bin/ls. Hãy thử tất cả biến thể exec(), bao gồm execl(), execle(), execlp(), execv(), execvp() và execvP(). Vì sao bạn nghĩ có nhiều biến thể của cùng một lời gọi cơ bản như vậy?

5. Bây giờ viết chương trình dùng wait() trong parent để chờ child process hoàn tất. wait() trả về gì? Điều gì xảy ra nếu dùng wait() trong child?

6. Sửa đổi một chút chương trình trước, lần này dùng waitpid() thay cho wait(). Khi nào waitpid() hữu ích?

7. Viết chương trình tạo child process, rồi trong child đóng standard output (STDOUT_FILENO). Điều gì xảy ra nếu child gọi printf() để in đầu ra sau khi đóng descriptor?

8. Viết chương trình tạo hai child rồi nối standard output của một child với standard input của child kia bằng system call pipe().

---

[^1]: Được rồi, chúng tôi thừa nhận không biết chắc điều đó; ai biết bạn gọi những routine nào khi chẳng ai nhìn? Nhưng fork() khá kỳ lạ, bất kể thói quen routine-calling của bạn bất thường đến đâu.

[^2]: Có một vài trường hợp wait() trả về trước khi child thoát; như thường lệ, hãy đọc man page để biết chi tiết. Và hãy cảnh giác với mọi phát biểu tuyệt đối và không kèm điều kiện trong sách này, chẳng hạn “child sẽ luôn in trước” hoặc “UNIX là thứ tuyệt vời nhất thế giới, còn hơn cả kem.”

[^3]: Thực ra có sáu biến thể exec(): execl(), execle(), execlp(), execv() và execvp(). Đọc man page để tìm hiểu thêm.

[^4]: Và có rất nhiều shell; có thể kể đến tcsh, bash và zsh. Bạn nên chọn một shell, đọc man page của nó và tìm hiểu thêm; mọi chuyên gia UNIX đều làm vậy.

[^5]: Nếu không thích viết code nhưng muốn trở thành người làm khoa học máy tính, điều này có nghĩa bạn cần hoặc (a) trở nên thật giỏi lý thuyết khoa học máy tính, hoặc (b) có lẽ suy nghĩ lại về toàn bộ chuyện “khoa học máy tính” mà bạn vẫn kể với mọi người.
