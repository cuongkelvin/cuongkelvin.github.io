<a id="_idParaDest-5"></a>

# Lời nói đầu

Trong thời đại hiện đại này, chúng ta thường xuyên được chứng kiến những công nghệ mind-blowing và trải nghiệm sự tiện nghi cùng niềm vui thích vượt xa những gì có thể tưởng tượng được dù chỉ vài thập kỷ trước. Chúng ta đang đứng trước ngưỡng cửa nơi xe tự hành dần trở thành hiện thực trên các đường phố. Những tiến bộ trong vật lý và các ngành khoa học khác đang thay đổi cách chúng ta nhìn nhận chính thực tại. Chúng ta đọc tin tức về việc các nhà nghiên cứu đang chập chững những bước đi đầu tiên trong quantum computation, những tin đồn về công nghệ blockchain và tiền mã hóa, cùng các kế hoạch thuộc địa hóa các hành tinh khác. Thật khó tin nhưng sự đa dạng của những đột phá như vậy đều bắt nguồn từ một vài công nghệ cốt lõi. Cuốn sách này viết về một trong những công nghệ đó: C.

Tôi bắt đầu lập trình với C++ khi đang học năm đầu cấp ba. Ở đó, tôi tham gia một đội mô phỏng bóng đá 2D dành cho thanh thiếu niên (junior). Không lâu sau C++, tôi được tiếp cận với Linux và C. Tôi phải thừa nhận rằng trong những năm tháng đó mình không hiểu nhiều về tầm quan trọng của C và Unix, nhưng theo thời gian, khi tích lũy được nhiều kinh nghiệm hơn trong việc sử dụng chúng qua nhiều project khác nhau, cũng như khi học hỏi về chúng qua con đường giáo dục, tôi dần nhận ra vai trò và vị thế then chốt của chúng. Càng hiểu biết nhiều về C, sự tôn trọng của tôi dành cho ngôn ngữ này càng lớn dần. Cuối cùng, tôi quyết định trở thành một chuyên gia về ngôn ngữ lập trình đã thu hút trọn vẹn sự quan tâm của mình. Tôi cũng quyết định trở thành người ủng hộ và lan tỏa kiến thức để giúp mọi người nhận thức rõ tầm quan trọng của C. Cuốn sách này chính là kết quả của tham vọng đó.

Bất chấp quan niệm sai lầm cho rằng C là một ngôn ngữ đã chết, và bất chấp sự thờ ơ chung mà C phải nhận từ giới công nghệ, chỉ số TIOBE index tại [https://www.tiobe.com/tiobe-index](https://www.tiobe.com/tiobe-index/c) chứng minh điều ngược lại. Trên thực tế, C luôn là một trong những ngôn ngữ lập trình phổ biến nhất trong suốt 15 năm qua cùng với Java, và đã ngày càng trở nên phổ biến hơn trong những năm gần đây.

Tôi viết cuốn sách này sau nhiều năm kinh nghiệm phát triển và thiết kế bằng C, C++, Golang, Java và Python trên nhiều nền tảng khác nhau, bao gồm nhiều biến thể BSD Unix, Linux và Microsoft Windows. Mục tiêu chính của cuốn sách này là nâng cao kỹ năng của độc giả lên một tầm cao mới; giúp họ tiến thêm một bước trong việc sử dụng C và áp dụng nó vào thực tế theo cách được đúc kết từ những trải nghiệm hard-earned. Đây sẽ không phải là một hành trình dễ dàng cho chúng ta, và đó là lý do tại sao chúng tôi đặt tên cuốn sách này là *Extreme C*. Hành trình này là trọng tâm cốt lõi của cuốn sách, và chúng ta sẽ không tham gia vào cuộc tranh luận giữa C với các ngôn ngữ lập trình khác. Cuốn sách cố gắng duy trì tính thực tiễn, nhưng chúng ta vẫn phải đối mặt với một khối lượng đáng kể lý thuyết chuyên sâu (hardcore theory) có liên quan trực tiếp đến ứng dụng thực tế. Cuốn sách có rất nhiều ví dụ nhằm chuẩn bị cho bạn khả năng xử lý những vấn đề mà bạn sẽ gặp phải trong một hệ thống thực tế.

Quả thực là một vinh dự lớn lao khi có thể đề cập đến một chủ đề trang trọng và ý nghĩa như vậy. Lời nói là không đủ, nên tôi chỉ muốn nói rằng thật là một niềm vui không thể tin được khi có cơ hội viết về một chủ đề gắn bó sâu sắc với trái tim mình. Và tôi có được niềm vui cùng sự ngạc nhiên này là nhờ Andrew Waldron, người đã cho phép tôi đảm nhận cuốn sách này như trải nghiệm viết sách đầu tiên của đời mình.

Cùng với đó, tôi muốn gửi lời chào đặc biệt và lời cảm ơn sâu sắc nhất tới Ian Hough, Development Editor, người đã đồng hành cùng tôi qua từng chương sách trong suốt hành trình này, tới Aliakbar Abbasi vì những phản hồi peer review không mệt mỏi, và tới Kishor Rit, Gaurav Gavas, Veronica Pais cùng nhiều người quý giá khác đã nỗ lực hết mình trong việc chuẩn bị và xuất bản cuốn sách này.

Với những điều đã chia sẻ, tôi mời bạn trở thành người bạn đồng hành của tôi trên chuyến hành trình dài này. Tôi hy vọng rằng việc đọc cuốn sách này sẽ mang tính chuyển hóa, giúp bạn nhìn nhận C dưới một lăng kính mới, và trở thành một lập trình viên giỏi hơn trong quá trình đó.

<a id="_idParaDest-6"></a>

## Cuốn sách này dành cho ai

Cuốn sách này được viết cho nhóm độc giả đã có mức độ kiến thức tối thiểu về phát triển C và C++. Các kỹ sư C/C++ trình độ junior và intermediate là đối tượng độc giả chính có thể tiếp thu được nhiều nhất từ cuốn sách này và nâng tầm chuyên môn cũng như kiến thức của mình. Hy vọng rằng sau khi đọc cuốn sách này, họ có thể được thăng tiến trong vị trí công việc và trở thành senior engineer. Ngoài ra, sau khi đọc cuốn sách này, chuyên môn của họ sẽ phù hợp hơn với nhiều cơ hội việc làm liên quan đầy thách thức và thường có mức đãi ngộ cao. Một số chủ đề vẫn có thể hữu ích đối với các senior engineer C/C++, nhưng dự kiến phần lớn các chủ đề đều đã được họ biết đến và chỉ một số chi tiết bổ sung là còn mang lại giá trị.

Nhóm độc giả khác có thể hưởng lợi từ việc đọc cuốn sách này là sinh viên và các nhà nghiên cứu. Sinh viên theo học các chương trình cử nhân, thạc sĩ hoặc tiến sĩ (PhD) trong bất kỳ ngành khoa học hoặc kỹ thuật nào như computer science, software engineering, trí tuệ nhân tạo, **Internet of Things** (**IoT**), thiên văn học, vật lý hạt và vũ trụ học, cũng như tất cả các nhà nghiên cứu trong những lĩnh vực này, đều có thể sử dụng cuốn sách để nâng cao mức độ hiểu biết của mình về C/C++, các hệ điều hành Unix-like và những kỹ năng lập trình liên quan. Cuốn sách này sẽ rất phù hợp cho các kỹ sư và nhà khoa học đang làm việc trên các hệ thống phức tạp, multithreaded hoặc thậm chí là multi-process thực hiện điều khiển thiết bị từ xa, mô phỏng, xử lý big data, machine learning, deep learning, vân vân.

<a id="_idParaDest-7"></a>

## Nội dung cuốn sách

Cuốn sách này có 7 phần. Trong mỗi phần trong số 7 phần này, chúng ta sẽ đề cập đến một số khía cạnh cụ thể của lập trình C. Phần thứ nhất tập trung vào cách build một project C, phần thứ hai tập trung vào memory, phần thứ ba nói về hướng đối tượng (object orientation), và phần thứ tư chủ yếu xem xét Unix cùng mối quan hệ của nó với C. Phần thứ năm sau đó thảo luận về concurrency, phần thứ sáu đề cập đến inter-process communication, và cuối cùng phần thứ bảy của cuốn sách nói về kiểm thử và bảo trì. Dưới đây là phần tóm tắt của từng chương trong số 23 chương có trong cuốn sách này.

*Chương 1*, *Các tính năng thiết yếu (Essential Features)*: Chương này nói về các tính năng thiết yếu có trong C vốn có ảnh hưởng sâu sắc đến cách chúng ta sử dụng C. Chúng ta sẽ thường xuyên sử dụng các tính năng này xuyên suốt cuốn sách. Những chủ đề chính gồm có preprocessing và các chỉ thị để định nghĩa macro, variable pointer và function pointer, cơ chế gọi function, cùng các structure.

*Chương 2*, *Biên dịch và Liên kết (Compilation and Linking)*: Trong chương này, chúng ta thảo luận về cách build một project C. Compilation pipeline được nghiên cứu rất chi tiết, xét trên cả phương diện tổng thể của pipeline lẫn phương diện từng thành phần riêng lẻ của pipeline.

*Chương 3*, *Object File*: Chương này xem xét các sản phẩm đầu ra của một project C sau khi đã build nó bằng compilation pipeline. Chúng tôi giới thiệu về các object file cùng các loại object file khác nhau của chúng. Chúng ta cũng sẽ nhìn sâu vào bên trong các object file này và xem những thông tin nào có thể được trích xuất.

*Chương 4*, *Cấu trúc memory của process (Process Memory Structure)*: Trong chương này, chúng ta khám phá memory layout của một process. Chúng ta sẽ thấy những segment nào có thể tìm thấy trong memory layout này và static memory layout cũng như dynamic memory layout có ý nghĩa gì.

*Chương 5*, *Stack và Heap*: Trong chương này, chúng ta thảo luận cụ thể về các segment Stack và Heap. Chúng ta nói về các biến trên Stack và biến trên Heap cũng như cách quản lý lifetime của chúng trong C. Chúng ta thảo luận về một số best practice liên quan đến các biến trên Heap và cách quản lý chúng.

*Chương 6*, *OOP và Encapsulation*: Đây là chương đầu tiên trong nhóm bốn chương thảo luận về hướng đối tượng trong C. Trong chương này, chúng ta đi qua phần lý thuyết đằng sau hướng đối tượng và đưa ra các định nghĩa quan trọng cho những thuật ngữ thường được sử dụng trong các tài liệu chuyên ngành.

*Chương 7*, *Composition và Aggregation*: Chương này tập trung vào composition và một dạng đặc biệt của nó: aggregation. Chúng ta thảo luận về sự khác biệt giữa composition và aggregation, đồng thời đưa ra các ví dụ để minh họa cho những khác biệt này.

*Chương 8*, *Inheritance và Polymorphism*: Inheritance là một trong những chủ đề quan trọng nhất trong **lập trình hướng đối tượng** (**object-oriented programming** - **OOP**). Trong chương này, chúng tôi chỉ ra cách thiết lập mối quan hệ inheritance giữa hai class và cách thực hiện điều đó trong C. Polymorphism cũng là một chủ đề lớn khác được thảo luận trong chương này.

*Chương 9*, *Abstraction và OOP trong C++*: Là chương cuối cùng trong phần thứ ba của cuốn sách, chúng ta sẽ nói về abstraction. Chúng ta thảo luận về các abstract data type và cách hiện thực chúng trong C. Chúng ta thảo luận về cấu trúc nội bộ của C++ và chứng minh cách các khái niệm object-oriented được hiện thực trong C++.

*Chương 10*, *Unix – Lịch sử và Architecture*: Bạn không thể nói về C mà lại quên đi Unix. Trong chương này, chúng tôi mô tả lý do tại sao chúng lại gắn kết chặt chẽ với nhau, và cách mà Unix và C đã hỗ trợ lẫn nhau để tồn tại cho đến tận ngày nay. Architecture của Unix cũng được nghiên cứu, và chúng ta sẽ thấy cách một chương trình sử dụng các chức năng được hệ điều hành cung cấp ra ngoài.

*Chương 11*, *System Call và Kernel*: Trong chương này, chúng ta tập trung vào vòng kernel trong architecture Unix. Chúng ta thảo luận chi tiết hơn về các system call và bổ sung một system call mới vào Linux. Chúng ta cũng nói về nhiều loại kernel khác nhau, đồng thời viết một kernel module đơn giản mới cho Linux để minh họa cách hoạt động của kernel module.

*Chương 12*, *Phiên bản C mới nhất (The Most Recent C)*: Trong chương này, chúng ta xem xét phiên bản tiêu chuẩn C gần đây nhất là C18. Chúng ta sẽ thấy nó khác biệt như thế nào so với phiên bản trước đó là C11. Chúng ta cũng sẽ minh họa một số tính năng mới được bổ sung so với C99.

*Chương 13*, *Concurrency*: Đây là chương đầu tiên của phần thứ năm của cuốn sách, và nội dung của nó là về concurrency. Chương này chủ yếu nói về các môi trường concurrent và những thuộc tính đa dạng của chúng như interleaving. Chúng tôi giải thích tại sao các hệ thống này lại mang tính non-determinant và đặc tính này có thể dẫn đến các vấn đề concurrency như race condition ra sao.

*Chương 14*, *Synchronization*: Trong chương này, chúng ta tiếp tục cuộc thảo luận về các môi trường concurrent, và thảo luận về nhiều loại vấn đề khác nhau mà chúng ta có thể gặp phải trong một hệ thống concurrent. Race condition, data race và deadlock nằm trong số những vấn đề mà chúng ta sẽ thảo luận. Chúng ta cũng nói về các kỹ thuật có thể sử dụng để khắc phục những vấn đề này. Semaphore, mutex và condition variable sẽ được thảo luận trong chương này.

*Chương 15*, *Thực thi Thread (Thread Execution)*: Trong chương này, chúng tôi chứng minh cách thực thi một số thread và cách quản lý chúng. Chúng tôi cũng đưa ra các ví dụ C thực tế về những vấn đề concurrency đã được thảo luận trong chương trước.

*Chương 16*, *Thread Synchronization*: Trong chương này, chúng ta xem xét các kỹ thuật có thể dùng để đồng bộ hóa một số thread. Semaphore, mutex và condition variable nằm trong số những chủ đề đáng chú ý được thảo luận và chứng minh trong chương này.

*Chương 17*, *Process Execution*: Chương này nói về những cách mà chúng ta có thể tạo hoặc sinh ra (spawn) một process mới. Chúng tôi cũng thảo luận về các kỹ thuật push-based và pull-based để chia sẻ trạng thái giữa nhiều process. Chúng tôi cũng minh họa các vấn đề concurrency đã thảo luận trong *Chương 14*, *Synchronization* bằng những ví dụ C thực tế.

*Chương 18*, *Process Synchronization*: Chương này chủ yếu xử lý các cơ chế có sẵn để đồng bộ hóa nhiều process cùng nằm trên một máy. Process-shared semaphore, process-shared mutex và process-shared condition variable nằm trong số những kỹ thuật được thảo luận trong chương này.

*Chương 19*, *Single-Host IPC và Socket*: Trong chương này, chúng tôi chủ yếu thảo luận về các kỹ thuật **interprocess communication** (**IPC**) dạng push-based. Trọng tâm của chúng tôi là các kỹ thuật khả dụng cho những process nằm trên cùng một máy. Chúng tôi cũng giới thiệu về socket programming cùng nền tảng cần thiết để thiết lập các channel giữa những process nằm trên các node khác nhau trong một mạng.

*Chương 20*, *Socket Programming*: Trong chương này, chúng ta thảo luận về socket programming thông qua các ví dụ code. Chúng tôi dẫn dắt cuộc thảo luận bằng cách đưa ra một ví dụ sẽ hỗ trợ nhiều loại socket khác nhau. Các Unix domain socket, socket TCP và UDP hoạt động trên channel stream hoặc datagram sẽ được thảo luận.

*Chương 21*, *Tích hợp với các ngôn ngữ khác (Integration with Other Languages)*: Trong chương này, chúng tôi minh họa cách một library C, được build dưới dạng shared object file, có thể được nạp và sử dụng trong các chương trình được viết bằng C++, Java, Python và Golang.

*Chương 22*, *Unit Testing và Debugging*: Chương này dành riêng cho việc testing và debugging. Đối với nửa phần về testing, chúng tôi giải thích các cấp độ kiểm thử khác nhau, nhưng tập trung vào unit testing trong C. Chúng tôi cũng giới thiệu CMocka và Google Test như hai library có sẵn để viết các bộ test suite trong C. Đối với nửa phần về debugging, chúng tôi điểm qua nhiều công cụ khả dụng khác nhau có thể được sử dụng để debug các loại bug khác nhau.

*Chương 23*, *Build System*: Trong chương cuối cùng của cuốn sách, chúng ta thảo luận về các build system và bộ sinh build script. Make, Ninja và Bazel là các build system mà chúng tôi giải thích trong chương này. CMake cũng là công cụ sinh build script duy nhất mà chúng tôi thảo luận trong chương này.

<a id="_idParaDest-8"></a>

## Để tận dụng tối đa cuốn sách này

Như chúng tôi đã giải thích trước đó, cuốn sách này đòi hỏi bạn phải có mức độ kiến thức và kỹ năng tối thiểu về lập trình máy tính. Các yêu cầu tối thiểu được liệt kê dưới đây:

- Kiến thức chung về computer architecture: Bạn nên biết về memory, CPU, các thiết bị ngoại vi và đặc tính của chúng, cũng như cách một chương trình tương tác với các thành phần này trong một hệ thống máy tính.
- Kiến thức chung về lập trình: Bạn nên biết thuật toán là gì, cách lần vết quá trình thực thi của nó ra sao, source code là gì, binary number là gì và các phép toán số học liên quan đến chúng hoạt động như thế nào.
- Quen thuộc với việc sử dụng *Terminal* và các *lệnh shell* cơ bản trong một hệ điều hành Unix-like như Linux hoặc macOS.
- Kiến thức trung cấp về các chủ đề lập trình như câu lệnh điều kiện, các loại vòng lặp khác nhau, structure hoặc class trong ít nhất một ngôn ngữ lập trình, pointer trong C hoặc C++, function, vân vân.
- Kiến thức cơ bản về OOP: Điều này không bắt buộc vì chúng tôi sẽ giải thích chi tiết về OOP, nhưng nó có thể giúp bạn hiểu rõ hơn khi đọc các chương trong phần thứ ba của cuốn sách, *Object Orientation*.

> Ngoài ra, chúng tôi đặc biệt khuyến nghị bạn nên tải về repository chứa code và làm theo các lệnh được cung cấp trong các hộp shell box. Vui lòng sử dụng một nền tảng đã cài đặt Linux hoặc macOS. Các hệ điều hành POSIX-compliant khác vẫn có thể được sử dụng.

<a id="_idParaDest-9"></a>

### Tải về các file code ví dụ

Bạn có thể tải về các file code ví dụ cho cuốn sách này từ tài khoản của mình tại [www.packt.com/](http://www.packt.com/). Nếu bạn đã mua cuốn sách này ở nơi khác, bạn có thể truy cập [www.packtpub.com/support](https://www.packtpub.com/support) và đăng ký để nhận các file được gửi trực tiếp qua email cho bạn.

Bạn có thể tải về các file code bằng cách làm theo các bước sau:

1. Đăng nhập hoặc đăng ký tại [http://www.packt.com](http://www.packt.com).
2. Chọn tab **Support**.
3. Nhấp vào **Code Downloads**.

1. Nhập tên cuốn sách vào hộp **Search** và làm theo các hướng dẫn on-screen.

Sau khi file đã được tải về, vui lòng đảm bảo rằng bạn giải nén hoặc trích xuất thư mục bằng phiên bản mới nhất của:

- WinRAR / 7-Zip dành cho Windows
- Zipeg / iZip / UnRarX dành cho Mac
- 7-Zip / PeaZip dành cho Linux

Gói code của cuốn sách cũng được lưu trữ trên GitHub tại [https://github.com/PacktPublishing/Extreme-C](https://github.com/PacktPublishing/Extreme-C). Trong trường hợp có bản cập nhật cho code, nó sẽ được cập nhật trên GitHub repository hiện có.

Chúng tôi cũng có các gói code khác từ danh mục sách và video phong phú của mình tại [https://github.com/PacktPublishing/](https://github.com/PacktPublishing/). Hãy cùng khám phá nhé!

<a id="_idParaDest-10"></a>

### Các quy ước được sử dụng

Trong cuốn sách này, chúng tôi sử dụng các code box và shell box. Code box chứa một đoạn code C hoặc pseudo-code. Nếu nội dung của một code box được lấy từ một file code, tên của file code đó sẽ được hiển thị ngay bên dưới hộp. Dưới đây, bạn có thể thấy một ví dụ về code box:

```
#include <stdio.h>
#include <unistd.h>
int main(int argc, char** argv) {
  printf("This is the parent process with process ID: %d\n",
          getpid());
  printf("Before calling fork() ...\n");
  pid_t ret = fork();
  if (ret) {
    printf("The child process is spawned with PID: %d\n", ret);
  } else {
    printf("This is the child process with PID: %d\n", getpid());
  }
  printf("Type CTRL+C to exit ...\n");
  while (1);
  return 0;
}
```

*Code Box 17-1 [ExtremeC_examples_chapter17_1.c]: Tạo một process con bằng fork API*

Như bạn có thể thấy, đoạn code trên có thể được tìm thấy trong file `ExtremeC_examples_chapter17_1.c`, như một phần của gói code của cuốn sách, trong thư mục của *Chương 17, Process Execution*. Bạn có thể lấy gói code từ GitHub tại [https://github.com/PacktPublishing/Extreme-C](https://github.com/PacktPublishing/Extreme-C).

Nếu một code box không có tên file liên kết kèm theo, thì nó chứa pseudo-code hoặc code C không tìm thấy trong gói code. Một ví dụ được đưa ra dưới đây:

```
Task P {
    1. num = 5
    2. num++
    3. num = num – 2
    4. x = 10
    5. num = num + x
}
```

*Code Box 13-1: Một task đơn giản với 5 instruction*

Đôi khi có thể có một số dòng được hiển thị bằng phông chữ in đậm bên trong các code box. Những dòng này thường là các dòng code được thảo luận trước hoặc sau code box. Chúng được in đậm nhằm giúp bạn tìm thấy chúng dễ dàng hơn.

Các shell box được sử dụng để hiển thị output của Terminal trong khi chạy một số shell command. Các command thường được in đậm và output có phông chữ bình thường. Một ví dụ được hiển thị bên dưới:

```
$ ls /dev/shm
shm0
$ gcc ExtremeC_examples_chapter17_5.c -lrt -o ex17_5.out
$ ./ex17_5.out
Shared memory is opened with fd: 3
The contents of the shared memory object: ABC
$ ls /dev/shm
$
```

*Shell Box 17-6: Đọc từ shared memory object đã tạo trong ví dụ 17.4 và cuối cùng xóa nó*

Các command bắt đầu bằng `$` hoặc `#`. Những command bắt đầu bằng `$` nên được chạy với quyền user thông thường, và những command bắt đầu bằng `#` nên được chạy với quyền super user.

Thư mục làm việc của một shell box thường là thư mục của chương tương ứng tìm thấy trong gói code. Trong các trường hợp cần chọn một thư mục cụ thể làm thư mục làm việc, chúng tôi sẽ cung cấp cho bạn thông tin cần thiết liên quan đến điều đó.

**In đậm**: Biểu thị một thuật ngữ mới, một từ quan trọng. Những từ mà bạn nhìn thấy trên màn hình, chẳng hạn như trong các menu hoặc hộp thoại, cũng xuất hiện trong văn bản theo cách này. Ví dụ: "Select **System info** from the **Administration** panel."

> Các cảnh báo hoặc ghi chú quan trọng xuất hiện như thế này.

> Các mẹo và thủ thuật xuất hiện như thế này.

<a id="_idParaDest-11"></a>

## Liên hệ

Phản hồi từ độc giả của chúng tôi luôn luôn được chào đón.

**Phản hồi chung**: Nếu bạn có câu hỏi về bất kỳ khía cạnh nào của cuốn sách này, hãy đề cập đến tiêu đề sách trong dòng chủ đề của thư và gửi email cho chúng tôi theo địa chỉ `customercare@packtpub.com`.

**Đính chính**: Mặc dù chúng tôi đã hết sức cẩn trọng để bảo đảm tính chính xác của nội dung, sai sót vẫn có thể xảy ra. Nếu bạn phát hiện một sai sót trong cuốn sách này, chúng tôi sẽ rất biết ơn nếu bạn báo cáo điều đó cho chúng tôi.

Vui lòng truy cập, [www.packtpub.com/support/errata](https://www.packtpub.com/support/errata), chọn cuốn sách của bạn, nhấp vào liên kết Errata Submission Form và nhập thông tin chi tiết.

**Vấn đề vi phạm bản quyền**: Nếu bạn bắt gặp bất kỳ bản sao bất hợp pháp nào đối với các tác phẩm của chúng tôi dưới bất kỳ hình thức nào trên Internet, chúng tôi sẽ rất biết ơn nếu bạn cung cấp cho chúng tôi địa chỉ hoặc tên trang web đó. Vui lòng liên hệ với chúng tôi tại `copyright@packt.com` kèm theo link dẫn đến tài liệu.

**Nếu bạn quan tâm đến việc trở thành tác giả**: Nếu có một chủ đề mà bạn có chuyên môn và bạn quan tâm đến việc viết hoặc đóng góp cho một cuốn sách, vui lòng truy cập [authors.packtpub.com](http://authors.packtpub.com/).

<a id="_idParaDest-12"></a>

### Đánh giá

Xin vui lòng để lại một đánh giá. Sau khi bạn đã đọc và sử dụng cuốn sách này, tại sao lại không để lại đánh giá trên trang web mà bạn đã mua nó? Khi đó, những độc giả tiềm năng có thể thấy và sử dụng ý kiến khách quan của bạn để đưa ra quyết định mua hàng, chúng tôi tại Packt có thể hiểu được bạn nghĩ gì về sản phẩm của chúng tôi, và các tác giả của chúng tôi có thể thấy phản hồi của bạn về cuốn sách của họ. Xin cảm ơn bạn!

Để biết thêm thông tin về Packt, vui lòng truy cập packt.com.
