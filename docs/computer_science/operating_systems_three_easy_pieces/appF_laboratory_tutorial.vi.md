# F Phòng lab: Hướng dẫn

Đây là tài liệu rất ngắn giúp làm quen nền tảng môi trường lập trình C trên hệ thống UNIX. Nó không toàn diện hay đặc biệt chi tiết, chỉ cung cấp vừa đủ để bắt đầu.

Một vài lời khuyên chung: muốn trở thành lập trình viên chuyên gia, bạn phải thành thạo nhiều hơn cú pháp ngôn ngữ. Cụ thể, cần hiểu tool, library và documentation. Tool liên quan đến compile C là gcc, gdb và có thể ld. Có rất nhiều library routine, nhưng may mắn phần lớn functionality nằm trong libc, được link mặc định với mọi chương trình C; chỉ cần include đúng header file. Cuối cùng, biết tìm library routine cần thiết (như tìm và đọc man page) là kỹ năng đáng học. Ta sẽ nói kỹ từng phần sau.

Như hầu hết điều đáng làm trong đời, trở thành chuyên gia các lĩnh vực này cần thời gian. Dành thời gian up-front tìm hiểu tool và môi trường chắc chắn đáng công.

## F.1 Chương trình C đơn giản

Ta bắt đầu bằng chương trình C đơn giản, có thể lưu trong file “hw.c”. Khác Java, tên file không nhất thiết liên hệ nội dung; vì vậy hãy dùng lẽ thường để đặt tên thích hợp.

Dòng đầu chỉ định file cần include, ở đây là stdio.h, khai báo prototype cho nhiều input/output routine phổ biến; ta quan tâm printf(). Khi dùng directive #include, bạn bảo C preprocessor (cpp) tìm file cụ thể (như stdio.h) rồi chèn thẳng vào code tại vị trí #include. Mặc định, cpp tìm trong directory /usr/include/to để tìm file.

Phần tiếp theo chỉ định signature của main(): trả về integer (int) và được gọi với hai argument,

```
/* header files go up here */
/* note that C comments are enclosed within a slash and a star, and
   may wrap over lines */
// if you use gcc, two slashes will work too (and may be preferred)
#include <stdio.h>

/* main returns an integer */
int main(int argc, char *argv[]) {
    /* printf is our output function;
       by default, writes to standard out */
    /* printf returns an integer, but we ignore that */
    printf("hello, world\n");

    /* return 0 to indicate all went well */
    return(0);
}
```

một integer argc đếm số argument trên command line và một array pointer tới character (argv), mỗi pointer chứa một từ trên command line, phần cuối là null. Ta sẽ nói thêm về pointer và array bên dưới.

Sau đó chương trình chỉ in string “hello, world” và chuyển output stream xuống dòng tiếp theo nhờ backslash theo sau bởi “n” ở cuối call printf(). Sau đó chương trình hoàn tất bằng cách trả giá trị về shell đã thực thi nó. Script hoặc user tại terminal có thể kiểm tra giá trị này (trong shell csh và tcsh, nó lưu ở biến status) để xem chương trình thoát bình thường hay lỗi.

## F.2 Compile và thực thi

Giờ ta học cách compile chương trình. Dùng gcc làm ví dụ, dù trên một số nền tảng có thể dùng compiler native khác là cc.

Tại shell prompt, chỉ cần gõ:

```
prompt> gcc hw.c
```

gcc không thực sự là compiler mà là chương trình “compiler driver”, điều phối nhiều bước compilation. Thường có bốn đến năm bước. Đầu tiên gcc chạy cpp, C preprocessor, xử lý một số directive (như #define và #include. Chương trình cpp chỉ là translator source-to-source nên end-product vẫn là source code (tức file C). Sau đó compilation thật sự bắt đầu, thường bằng command cc1, chuyển code C source-level thành assembly code low-level riêng cho host machine. Tiếp theo assembler as chạy, tạo object code (các bit và những thứ máy thực sự hiểu), cuối cùng link-editor (hay linker) ld ghép mọi thứ thành executable program cuối. May mắn(!), với phần lớn mục đích, bạn có thể không cần biết gcc hoạt động thế nào mà chỉ dùng đúng flag.

Kết quả compile trên là executable mặc định tên a.out. Để chạy, chỉ cần gõ:

```
prompt> ./a.out
```

Khi chạy chương trình, OS đặt argc, argv đúng để chương trình xử lý argument command-line khi cần. Cụ thể, argc bằng 1, argv[0] là string “./a.out”, argv[1] là null báo cuối array.

## F.3 Các flag hữu ích

Trước khi chuyển sang ngôn ngữ C, ta nêu một số compilation flag hữu ích của gcc.

```
prompt> gcc -o hw hw.c  # -o: to specify the executable name
prompt> gcc -Wall hw.c  # -Wall: gives much better warnings
prompt> gcc -g hw.c     # -g: to enable debugging with gdb
prompt> gcc -O hw.c     # -O: to turn on optimization
```

Dĩ nhiên, có thể kết hợp flag tùy ý (như gcc -o hw -g -Wall hw.c). Trong số này, luôn nên dùng -Wall để có nhiều warning bổ sung về lỗi có thể xảy ra. Đừng bỏ qua warning! Hãy sửa để chúng biến mất một cách dễ chịu.

## F.4 Link với library

Đôi khi bạn muốn dùng library routine trong chương trình. Vì C library có rất nhiều routine (và tự động link với mọi chương trình), thường chỉ cần tìm đúng file #include. Cách tốt nhất là manual page, thường gọi ngắn là man page.

Chẳng hạn, muốn dùng fork() system call[^1]. Gõ man fork tại shell prompt sẽ nhận mô tả fork() hoạt động. Trên cùng có đoạn code ngắn cho biết cần #include file nào để compile. Với fork(), cần #include cả sys/types.h và unistd.h, như sau:

```
#include <sys/types.h>
#include <unistd.h>
```

Tuy nhiên, một số routine không nằm trong C library, nên phải làm thêm. Chẳng hạn math library có nhiều routine hữu ích như sine, cosine, tangent, v.v. Nếu muốn đưa tan() vào code, trước tiên lại xem man page. Trên đầu Linux man page cho tan có hai dòng sau:

```
#include <math.h>
...
Link with -lm.
```

Bạn đã hiểu dòng đầu: cần #include math library, nằm ở vị trí tiêu chuẩn trong file system (tức /usr/include/math.h). Dòng sau cho biết cách “link” chương trình với math library. Có nhiều library hữu ích để link; nhiều cái nằm trong /usr/lib, cũng chính là nơi có math library.

Có hai loại library: statically-linked (đuôi .a) và dynamically-linked (đuôi .so). Library Statically-linked được ghép trực tiếp vào executable; code low-level của library được linker chèn vào executable, tạo binary object lớn hơn nhiều. Dynamic linking cải thiện bằng cách chỉ đưa reference tới library vào executable; khi chạy, operating system loader link library động. Phương pháp này được ưu tiên hơn static vì tiết kiệm disk space (không tạo executable lớn không cần thiết), cho ứng dụng chia sẻ library code và static data trong memory. Math library có cả hai phiên bản: static là /usr/lib/libm.a, dynamic là /usr/lib/libm.so.

Dù thế nào, để link math library phải chỉ định library cho link-editor; gọi gcc với đúng flag sẽ làm điều này.

```
prompt> gcc -o hw hw.c -Wall -lm
```

Flag -lXXX bảo linker tìm libXXX.so hoặc libXXX.a, có lẽ theo thứ tự đó. Nếu vì lý do nào đó nhất quyết dùng static thay dynamic library, có flag khác; hãy tự tìm xem là gì. Đôi khi người ta thích static library vì dynamic library có chi phí performance nhỏ.

Lưu ý cuối: nếu muốn compiler tìm header trong path khác thường lệ hoặc link library chỉ định, dùng flag -I/foo/bar để tìm header trong directory /foo/bar, và -L/foo/bar để tìm library trong /foo/bar. Directory thường được chỉ định như vậy là “.” (gọi “dot”), cách viết UNIX chỉ current directory. Flag -I nằm ở compile line, còn -L ở link line.

## F.5 Compile riêng từng phần

Khi chương trình đủ lớn, có thể muốn tách file, compile riêng rồi link lại. Chẳng hạn có hai file hw.c và helper.c, muốn compile từng file rồi link với nhau.

```
# we are using -Wall for warnings, -O for optimization
prompt> gcc -Wall -O -c hw.c
prompt> gcc -Wall -O -c helper.c
prompt> gcc -o hw hw.o helper.o -lm
```

Flag -c bảo compiler chỉ tạo object file, ở đây là hw.o và helper.o. Chúng không phải executable mà là biểu diễn machine-level của code trong mỗi source file. Để ghép thành executable phải “link” lại; dòng thứ ba gcc -o hw hw.o helper.o) làm điều đó. gcc thấy input không phải source file (.c) mà là object file (.o), nên bỏ thẳng tới bước cuối và gọi link-editor ld ghép thành một executable. Vì chức năng đó, dòng này thường gọi “link line”, nơi chỉ định command link-specific như -lm. Tương tự, flag -Wall, -O chỉ cần trong compile phase nên chỉ đặt trên compile line, không cần trên link line.

Dĩ nhiên, có thể đưa mọi source file C lên một dòng gcc (gcc -Wall -O -o hw hw.c helper.c), nhưng vậy hệ thống phải compile lại mọi file source-code, có thể rất time-consuming. Compile riêng tiết kiệm thời gian bằng cách chỉ re-compiling file đã thay đổi khi chỉnh sửa, nhờ đó tăng năng suất. Chương trình make quản lý quá trình này tốt nhất, như ta sẽ mô tả.

## F.6 Makefile

Chương trình make tự động hóa phần lớn build process, nên là tool cực kỳ quan trọng với mọi chương trình (và lập trình viên) nghiêm túc. Hãy xem ví dụ đơn giản lưu trong file Makefile.

Để build, giờ chỉ cần gõ:

```
prompt> make
```

Theo mặc định, nó tìm Makefile hoặc makefile và dùng làm input (có thể chỉ định makefile khác bằng flag; đọc

```
hw: hw.o helper.o
    gcc -o hw hw.o helper.o -lm

hw.o: hw.c
    gcc -O -Wall -c hw.c

helper.o: helper.c
    gcc -O -Wall -c helper.c

clean:
    rm -f hw.o helper.o hw
```

man page để biết flag nào). Bản gnu của make là gmake có nhiều tính năng hơn make truyền thống, nên phần còn lại tập trung vào nó (dù dùng hai tên thay nhau). Phần lớn ghi chú dựa trên gmake info page; xem phần Documentation bên dưới để biết cách tìm. Lưu ý thêm: trên Linux, gmake và make là cùng một chương trình.

Makefile dựa trên rule để quyết định cần làm gì. Dạng rule tổng quát:

```
target: prerequisite1 prerequisite2 ...
    command1
    command2
    ...
```

Target thường là tên file được chương trình tạo ra, như executable hoặc object file. Target còn có thể là tên hành động cần làm, như “clean” trong ví dụ.

Prerequisite là file input dùng để tạo target. Target thường phụ thuộc nhiều file. Chẳng hạn, để build executable hw, trước tiên cần hai object file hw.o và helper.o.

Cuối cùng, command là hành động make thực hiện. Rule có thể có nhiều command, mỗi command một dòng. Quan trọng: phải đặt một ký tự tab ở đầu mỗi command line! Nếu chỉ đặt space, make in error message khó hiểu rồi thoát.

Command thường ở trong rule có prerequisite, dùng tạo target file nếu prerequisite nào thay đổi. Tuy nhiên, rule chỉ định command cho target không bắt buộc có prerequisite. Chẳng hạn rule chứa command xóa gắn với target “clean” không có prerequisite.

Quay lại ví dụ, make đại khái hoạt động như sau: trước tiên đến target hw, thấy muốn build phải có hai prerequisite hw.o và helper.o, nên hw phụ thuộc hai object file đó. Sau đó make xét từng target. Với hw.o, nó thấy phụ thuộc hw.c. Điểm mấu chốt: nếu hw.c được sửa sau thời điểm tạo hw.o, make biết hw.o đã cũ, cần tạo lại; nó chạy gcc -O -Wall -c hw.c để tạo hw.o. Vì vậy, với chương trình lớn, make biết object file nào cần re-generated dựa trên dependency, chỉ làm lượng công việc cần thiết để tạo lại executable. hw.o cũng được tạo nếu chưa tồn tại.

Tiếp theo, helper.o cũng có thể được tạo hoặc tạo lại theo cùng tiêu chí. Khi cả hai object file đã được tạo, make sẵn sàng chạy command tạo executable cuối và quay lại làm việc đó: gcc -o hw hw.o helper.o -lm.

Đến giờ, ta bỏ qua target clean trong makefile. Để dùng, phải yêu cầu tường minh. Gõ

```
prompt> make clean
```

Nó thực thi command trên command line. Vì clean không có prerequisite, gõ make clean luôn thực hiện các command. Ở đây clean xóa object file và executable, rất tiện nếu muốn build lại toàn chương trình từ đầu.

Có thể bạn nghĩ: “Cũng ổn, nhưng các makefile này cồng kềnh quá!” Bạn đúng nếu luôn phải viết như vậy. May mắn có nhiều cách viết tắt khiến make dễ dùng hơn. Chẳng hạn makefile sau cùng chức năng nhưng dễ dùng hơn chút:

```
# specify all source files here
SRCS = hw.c helper.c
# specify target here (name of executable)
TARG = hw
# specify compiler, compile flags, and needed libs
CC   = gcc
OPTS = -Wall -O
LIBS = -lm

# this translates .c files in src list to .o’s
OBJS = $(SRCS:.c=.o)

# all is not really needed, but is used to generate the target
all: $(TARG)

# this generates the target executable
$(TARG): $(OBJS)
    $(CC) -o $(TARG) $(OBJS) $(LIBS)

# this is a generic rule for .o files
%.o: %.c
    $(CC) $(OPTS) -c $< -o $@

# and finally, a clean line
clean:
    rm -f $(OBJS) $(TARG)
```

Dù không đi sâu cú pháp make, như thấy, makefile này giúp cuộc sống dễ hơn. Chẳng hạn, chỉ thêm source file mới vào biến SRCS ở đầu makefile để đưa vào build. Cũng dễ đổi tên executable qua dòng TARG, và sửa compiler, flag, library specification.

Điều cuối về make: xác định prerequisite của target không luôn đơn giản, nhất là chương trình lớn, phức tạp. Không ngạc nhiên có tool hỗ trợ tên makedepend. Hãy tự đọc và xem có tích hợp vào makefile được không.

## F.7 Debugging

Cuối cùng, sau khi tạo build environment tốt và chương trình compile đúng, bạn có thể thấy chương trình có bug. Một cách sửa là suy nghĩ thật kỹ; đôi khi hiệu quả nhưng thường không. Vấn đề là thiếu thông tin: không biết chính xác điều đang diễn ra bên trong nên không tìm ra vì sao chương trình không hoạt động như mong đợi. May mắn có trợ giúp: gdb, GNU debugger.

Xét code có bug sau, lưu trong buggy.c và compile thành executable buggy.

```
#include <stdio.h>

struct Data {
    int x;
};

int
main(int argc, char *argv[])
{
    struct Data *p = NULL;
    printf("%d\n", p->x);
}
```

Trong ví dụ, main dereference biến p khi nó là NULL, gây segmentation fault. Dĩ nhiên, vấn đề dễ sửa khi đọc code, nhưng trong chương trình phức tạp hơn không phải lúc nào cũng dễ tìm.

Để chuẩn bị debugging session, compile lại và nhớ truyền -g ở mọi compile line. Nó thêm debugging information vào executable, hữu ích khi debug. Đừng bật optimization (-O); dù có thể hoạt động, cũng có thể gây nhầm lẫn khi debugging.

Sau khi re-compiling với -g, bạn sẵn sàng dùng debugger. Khởi động gdb tại command prompt như sau:

```
prompt> gdb buggy
```

Bạn được đưa vào interactive session với debugger. Cũng có thể dùng debugger xem “core” file từ những lần chạy lỗi, hoặc attach vào chương trình already-running; đọc documentation để biết thêm.

Khi vào, có thể thấy như sau:

```
prompt> gdb buggy
GNU gdb ...
Copyright 2008 Free Software Foundation, Inc.
(gdb)
```

Điều đầu tiên có thể muốn làm là chạy chương trình. Chỉ cần gõ run tại gdb command prompt. Ở đây, có thể thấy như sau:

```
(gdb) run
Starting program: buggy

Program received signal SIGSEGV, Segmentation fault.
0x8048433 in main (argc=1, argv=0xbffff844) at buggy.cc:19
19          printf("%d\n", p->x);
```

Như ví dụ cho thấy, gdb lập tức chỉ chính xác nơi có vấn đề: “segmentation fault” xuất hiện tại dòng cố dereference p. Điều này chỉ nghĩa là đã truy cập memory không được phép. Lúc đó, lập trình viên tinh ý xem code và nói “à! chắc p không trỏ tới thứ hợp lệ nên không được dereference!”, rồi sửa.

Tuy nhiên, nếu chưa biết chuyện gì xảy ra, có thể muốn xem biến nào đó. gdb cho phép làm tương tác trong debug session.

```
(gdb) print p
1 = (Data *) 0x0
```

Dùng primitive print, ta xem p và thấy nó vừa là pointer tới struct kiểu Data, vừa hiện được đặt NULL (hoặc số không, hoặc hex zero được hiển thị “0x0”).

Cuối cùng, còn có thể đặt breakpoint trong chương trình để debugger dừng tại routine nhất định. Sau đó thường hữu ích khi đi từng bước thực thi (từng dòng) và xem điều xảy ra.

```
(gdb) break main
Breakpoint 1 at 0x8048426: file buggy.cc, line 17.
(gdb) run
Starting program: /homes/hacker/buggy

Breakpoint 1, main (argc=1, argv=0xbffff844) at buggy.cc:17
17          struct Data *p = NULL;
(gdb) next
19          printf("%d\n", p->x);
(gdb)

Program received signal SIGSEGV, Segmentation fault.
0x8048433 in main (argc=1, argv=0xbffff844) at buggy.cc:19
19          printf("%d\n", p->x);
```

Trong ví dụ trên, breakpoint đặt tại main(); vì thế khi chạy, debugger gần như lập tức dừng ở main. Khi đó command “next” được gửi, thực thi command source-level tiếp theo. Cả “next” và “step” đều hữu ích để tiến qua chương trình; đọc documentation để biết thêm [^2].

Thảo luận này chưa thể hiện hết gdb: đây là debugging tool phong phú, linh hoạt, nhiều tính năng hơn có thể mô tả trong chỗ giới hạn này. Hãy tự đọc thêm và trở thành chuyên gia trong quỹ thời gian rảnh dồi dào của bạn.

## F.8 Documentation

Để biết nhiều hơn, cần hai việc: dùng tool và tự đọc thêm. Một cách tìm hiểu gcc, gmake, gdb là đọc man page: gõ man gcc, man gmake hoặc man gdb tại command prompt. Cũng có thể dùng man -k tìm keyword trong man page, dù không phải lúc nào cũng hiệu quả như mong muốn; tìm Google có lẽ tốt hơn ở đây.

Điểm khó về man page: gõ man XXX có thể không ra điều muốn tìm nếu có nhiều thứ tên XXX. Chẳng hạn, muốn man page của kill() system call mà chỉ gõ man kill sẽ gặp trang sai vì có chương trình command-line tên kill. Man page chia thành section, mặc định man trả trang ở section thấp nhất tìm được, ở đây là section 1. Nhìn đầu trang để biết đang xem gì: thấy kill(2) nghĩa là đúng trang trong Section 2, nơi chứa system call. Gõ man man để biết từng section chứa gì. Cũng có thể dùng man -a kill để lần lượt xem mọi man page tên “kill”.

Man page hữu ích để tìm hiểu nhiều thứ. Cụ thể, bạn thường cần tra argument truyền cho library call hoặc header file phải include để dùng. Tất cả nên có trong man page. Chẳng hạn, tra open() system call sẽ thấy:

```
SYNOPSIS
     #include <sys/types.h>
     #include <sys/stat.h>
     #include <fcntl.h>

     int open(const char *path, int oflag, /* mode_t mode */...);
```

Nó cho biết phải include header sys/types.h, sys/stat.h và fcntl.h để dùng open. Cũng chỉ parameter cần truyền: string tên path, integer flag oflag và argument tùy chọn chỉ định mode của file. Nếu cần link library để dùng call, nó cũng cho biết ở đây.

Dùng man page hiệu quả cần công sức. Chúng thường chia nhiều phần tiêu chuẩn. Phần chính mô tả cách truyền parameter khác nhau để function hoạt động khác nhau.

Phần đặc biệt hữu ích tên RETURN VALUES cho biết function trả gì khi thành công hay thất bại. Lại từ man page open():

```
RETURN VALUES
     Upon successful completion, the open() function opens the
     file and return a non-negative integer representing the
     lowest numbered unused file descriptor. Otherwise, -1 is
     returned, errno is set to indicate the error, and no files
     are created or modified.
```

Vì vậy, kiểm tra giá trị open trả về cho biết có thành công không. Nếu không, open (và nhiều standard library routine) đặt global variable errno thành giá trị báo lỗi. Xem phần ERRORS của man page để biết thêm.

Điều khác có thể muốn làm là tìm định nghĩa structure không được mô tả trong man page. Chẳng hạn, man page của gettimeofday() có synopsis sau:

```
SYNOPSIS
     #include <sys/time.h>
     int gettimeofday(struct timeval *restrict tp,
                      void *restrict tzp);
```

Từ trang này, thấy thời gian được đưa vào structure kiểu timeval nhưng man page có thể không cho biết struct có field nào! (Ở đây có, nhưng không phải lúc nào cũng may.) Vì vậy có thể phải tìm. Mọi include file nằm dưới directory /usr/include, nên dùng tool như grep để tìm. Chẳng hạn gõ:

```
prompt> grep ’struct timeval’ /usr/include/sys/*.h
```

Nó tìm định nghĩa structure trong mọi file đuôi .h ở /usr/include/sys. Đáng tiếc không phải luôn hiệu quả, vì include file có thể include file khác nằm nơi khác.

Cách tốt hơn là dùng tool sẵn có: compiler. Viết chương trình include header time.h, gọi là main.c. Sau đó thay vì compile, dùng compiler gọi preprocessor. Preprocessor xử lý mọi directive như command #define, #include. Gõ gcc -E main.c để làm vậy. Kết quả là file C chứa mọi structure và prototype cần thiết, gồm định nghĩa struct timeval.

Có lẽ cách tốt hơn nữa là Google. Luôn tìm Google về thứ chưa biết; thật kinh ngạc khi học được nhiều đến thế chỉ bằng tra cứu!

### Info page

Info page cũng rất hữu ích khi tìm documentation, cung cấp tài liệu chi tiết hơn nhiều về các GNU tool. Truy cập bằng chương trình info hoặc qua emacs, editor được hacker ưa thích, bằng Meta-x info. Chương trình như gcc có hàng trăm flag, một số hữu ích bất ngờ. gmake có nhiều tính năng cải thiện build environment. Cuối cùng, gdb là debugger tinh vi. Đọc man và info page, thử tính năng chưa dùng, và trở thành power user của programming tool.

## F.9 Tài liệu đọc gợi ý

Ngoài man và info page còn nhiều sách hữu ích. Phần lớn thông tin có miễn phí on-line; tuy nhiên, đôi khi hình thức sách giúp dễ học hơn. Ngoài ra, luôn tìm sách O’Reilly về chủ đề quan tâm; chúng hầu như luôn có chất lượng cao.

• “The C Programming Language”, của Brian Kernighan và Dennis Ritchie. Đây là cuốn C chuẩn mực cần có.

• “Managing Projects with make”, của Andrew Oram và Steve Talbott. Cuốn sách ngắn, hợp lý về make.

• “Debugging with GDB: The GNU Source-Level Debugger”, của Richard M. Stallman, Roland H. Pesch. Sách nhỏ về sử dụng GDB.

• “Advanced Programming in the UNIX Environment”, của W. Richard Stevens và Steve Rago. Stevens viết một số sách xuất sắc; đây là tài liệu phải có cho hacker U NIX. Ông còn có bộ sách xuất sắc về TCP/IP và Sockets programming.

• “Expert C Programming”, của Peter Van der Linden. Nhiều mẹo hữu ích về compiler, v.v. ở trên được lấy thẳng từ đây. Hãy đọc! Cuốn sách xuất sắc và eye-opening dù hơi cũ.

---

[^1]: Lời gọi fork() là system call, không chỉ library routine. Tuy nhiên, C library cung cấp C wrapper cho mọi system call, mỗi wrapper chỉ trap vào operating system.

[^2]: Cụ thể, có thể dùng command tương tác “help” khi debugging bằng gdb
