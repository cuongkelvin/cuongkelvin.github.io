**Expert C Programming: Những bí mật sâu kín của C**

Tác giả Peter van der Linden

# Giới thiệu

Code C. Code C chạy. Chạy đi code, chạy đi… xin đấy!

—Barbara Ling

Mọi chương trình C đều làm cùng một việc: nhìn một ký tự rồi chẳng làm gì với nó.

—Peter Weinberger

Bạn có bao giờ nhận thấy có rất nhiều sách C mang những cái tên đầy gợi ý như C Traps and Pitfalls, The C Puzzle Book hay Obfuscated C and Other Mysteries, nhưng những ngôn ngữ lập trình khác lại không có sách như vậy? Có lý do rất chính đáng!

Lập trình C là một nghề cần nhiều năm để hoàn thiện. Người tương đối nhanh trí có thể học kiến thức C cơ bản khá nhanh. Nhưng cần lâu hơn nhiều để nắm vững sắc thái ngôn ngữ, viết đủ nhiều chương trình, với đủ loại khác nhau, để thành chuyên gia. Nếu nói theo ngôn ngữ tự nhiên, đó là khác biệt giữa gọi được một tách cà phê ở Paris và (trên tàu Metro) bảo được một phụ nữ Paris bản xứ nên xuống chỗ nào. Cuốn sách này là tài liệu nâng cao về ngôn ngữ lập trình ANSI C. Nó dành cho người đã viết chương trình C, muốn nhanh chóng tiếp thu một số hiểu biết và kỹ thuật của chuyên gia.

Qua nhiều năm, lập trình viên chuyên gia tích lũy bộ công cụ kỹ thuật: một kho grab-bag gồm idiom, đoạn code và kỹ năng khéo léo. Chúng được thu thập từ từ, học qua quan sát đồng nghiệp giàu kinh nghiệm hơn, trực tiếp hoặc khi bảo trì code người khác viết. Những bài học C khác là self-taught. Gần như mọi người mới lập trình C đều tự phát hiện lại lỗi viết:

```
if (i=3)
```

thay vì:

```
if (i==3)
```

Một khi đã trải qua, lỗi đau đớn này (thực hiện assignment trong khi định thực hiện comparison) hiếm khi lặp lại. Một số lập trình viên có thói quen viết literal trước, như `if (3==i)`. Khi đó, nếu vô tình thiếu một dấu bằng, compiler sẽ phàn nàn về "cố gán cho literal". Điều này không bảo vệ được khi so sánh hai variable, nhưng giúp chút nào hay chút ấy.

## Lỗi trị giá 20 triệu đô la

Mùa xuân năm 1993, nhóm phát triển operating system tại SunSoft nhận một báo cáo bug “priority one” mô tả vấn đề trong asynchronous I/O library. Bug đang cản trở thương vụ hardware trị giá 20 triệu đô la với một khách hàng đặc biệt cần chức năng của library đó, nên chúng tôi có động lực rất lớn để tìm ra nó. Sau một số buổi debug căng thẳng, cuối cùng vấn đề được lần đến một statement như sau:

```
x==2;
```

Đó là lỗi gõ của một statement vốn định thực hiện assignment. Ngón tay lập trình viên đã nảy trên phím “bằng”, vô tình nhấn hai lần thay vì một. Statement đã viết so sánh x với 2, tạo ra true hoặc false, rồi bỏ kết quả.

C thiên về expression đến mức compiler không phàn nàn về một statement đánh giá expression, không có side-effects và đơn giản bỏ đi kết quả. Chúng tôi không biết nên mừng vì may mắn tìm ra vấn đề hay khóc vì thất vọng khi một lỗi gõ thông thường như vậy lại gây hậu quả đắt giá đến thế. Một số phiên bản lint có thể đã phát hiện vấn đề này, nhưng việc bỏ qua sử dụng tự động công cụ thiết yếu đó lại quá dễ dàng.

Sách tập hợp nhiều câu chuyện khác mang tính răn nhắc. Nó ghi lại sự từng trải của nhiều lập trình viên giàu kinh nghiệm, giúp người đọc không phải tự khám phá lại mọi thứ. Nó như người dẫn đường trên vùng đất tuy nhìn chung quen thuộc vẫn còn góc chưa khám phá. Có thảo luận mở rộng về chủ đề lớn như declaration và array/pointer, cùng rất nhiều gợi ý và mẹo ghi nhớ. Thuật ngữ ANSI C được dùng xuyên suốt, kèm diễn giải bằng tiếng Anh thông thường khi cần.

### Thử thách lập trình

![image](images/ch00/img00-01.png)

HOẶC

#### Mẹo thực hành hữu ích

![image](images/ch00/img00-02.png)

#### Khung mẫu

Trong sách, chúng ta có Thử thách lập trình được trình bày trong khung như thế này.

Đó là gợi ý về chương trình bạn nên viết.

Cũng có Mẹo thực hành hữu ích trong các khung riêng.

Đây là các ý tưởng, rules-of-thumb hoặc hướng dẫn có hiệu quả trong thực tế. Bạn có thể tiếp nhận chúng làm cách làm của mình. Hoặc bạn có thể bỏ qua nếu đã có những hướng dẫn riêng mà mình thích hơn.

## Quy ước

Một quy ước của chúng tôi là dùng tên trái cây và rau củ cho variable (tất nhiên chỉ trong đoạn code nhỏ, không trong chương trình thực):

```
char pear[40];
double peach;
int mango = 13;
long melon = 2001;
```

Điều này giúp dễ phân biệt đâu là reserved word của C và đâu là tên do lập trình viên đặt. Có người nói không thể so sánh táo với cam, nhưng tại sao không: cả hai đều là những thứ tròn, ăn được, hand-held và mọc trên cây. Khi đã quen, những vòng lặp trái cây thực sự có vẻ giúp ích. Còn một quy ước nữa: đôi khi chúng tôi lặp lại một điểm chính để nhấn mạnh. Ngoài ra, đôi khi chúng tôi lặp lại một điểm chính để nhấn mạnh.

Như sách công thức dành cho người sành ăn, Expert C Programming có bộ sưu tập miếng ngon sẵn cho người đọc thưởng thức. Mỗi chương chia thành các phần liên quan nhưng self-contained; bạn có thể dễ dàng đọc tuần tự từ đầu đến cuối hoặc mở ngẫu nhiên và xem kỹ từng chủ đề. Chi tiết kỹ thuật xen nhiều chuyện có thật về lập trình C trong thực tế. Hài hước là kỹ thuật quan trọng để nắm vững kiến thức mới, nên mỗi chương kết thúc bằng phần "giải trí nhẹ nhàng", chứa chuyện C vui hoặc giai thoại software để người đọc đổi nhịp.

Người đọc có thể dùng sách làm nguồn ý tưởng, tập hợp mẹo và idiom C, hoặc đơn giản học thêm ANSI C từ người viết compiler giàu kinh nghiệm. Tóm lại, sách có tập hợp ý tưởng hữu ích giúp bạn làm chủ nghệ thuật tinh tế của ANSI C. Nó gom thông tin, gợi ý và hướng dẫn vào một nơi, trình bày để bạn thưởng thức. Vậy hãy lấy mặt sau phong bì, rút cây bút chì lập trình may mắn, ngả người trước terminal thoải mái và bắt đầu cuộc vui!

## Giải trí nhẹ nhàng — Tinh chỉnh filesystem

Một số khía cạnh C và UNIX đôi khi khá vui vẻ. Chút ngẫu hứng well-placed chẳng có gì sai. Kiến trúc IBM/Motorola/Apple PowerPC có instruction E.I.E.I.O. <sup>\[1\]</sup>, viết tắt "Enforce In-order Execution of I/O". Cùng tinh thần đó, UNIX có lệnh `tunefs` mà system administrator sành sỏi dùng để đổi dynamic parameter của filesystem và cải thiện bố cục block trên disk.

<sup>\[1\]</sup> Có lẽ do lão nông nào đó tên McDonald thiết kế.

Các trang manual on-line của `tunefs` ban đầu, như mọi lệnh Berkeley, kết thúc với phần "Bugs". Ở đây, nội dung là:

```
Bugs:
This program should work on mounted and active file systems,
but it doesn't. Because the superblock is not kept in the
buffer cache, the program will only take effect if it is run
on dismounted file systems; if run on the root file system,
the system must be rebooted. You can tune a file system, but
you can't tune a fish.
```

Hay hơn nữa, source code của word-processor có một comment đe dọa bất kỳ ai xóa cụm từ cuối đó! Nó viết:

```
Take this out and a UNIX Demon will dog your steps from now
until the time_t's wrap around.
```

Khi Sun cùng cả thế giới chuyển sang SVr4 UNIX, chúng ta mất viên ngọc này. Manpage SVr4 không có phần "Bugs" — họ đổi tên thành "Notes" (có lừa được ai không?). Cụm "tuna fish" biến mất, và thủ phạm có lẽ vẫn bị UNIX demon đeo bám đến hôm nay. Tốt nhất là lpd.

### Thử thách lập trình

![image](images/ch00/img00-01.png)

Hẹn hò cùng máy tính

Khi nào các `time_t` wrap around?

Viết chương trình tìm câu trả lời.

1\. Xem định nghĩa `time_t`. Nó nằm trong file `/usr/include/time.h`.

2\. Viết một chương trình đặt giá trị lớn nhất vào variable có type `time_t`, rồi truyền nó cho `ctime()` để chuyển thành ASCII string. In string đó. Lưu ý rằng `ctime` không liên quan đến ngôn ngữ C; nó chỉ có nghĩa là “convert time”.

Người viết tài liệu kỹ thuật vô danh đã xóa comment phải lo bị một UNIX daemon đeo bám trong bao nhiêu năm nữa? Hãy sửa chương trình để tìm câu trả lời.

1\. Lấy thời gian hiện tại bằng cách gọi `time()`.

2\. Gọi `difftime()` để lấy số giây giữa hiện tại và giá trị lớn nhất của `time_t`.

3\. Định dạng giá trị đó thành năm, tháng, tuần, ngày, giờ và phút, rồi in ra.

Có dài hơn tuổi thọ dự kiến của bạn không?

#### Lời giải lập trình

![image](images/ch00/img00-03.png)

Hẹn hò cùng máy tính

Kết quả bài thực hành này sẽ khác nhau giữa PC và UNIX system, tùy cách time\_t được lưu. Trên các hệ thống Sun, đây chỉ là một typedef cho long. Lời giải thử đầu tiên của chúng ta là

```
#include <stdio.h>
#include <time.h>

int main() {
 time_t biggest = 0x7FFFFFFF;

 printf("biggest = %s \n", ctime(&biggest) );
 return 0;
}
```

Kết quả là:

```
biggest = Mon Jan 18 19:14:07 2038
```

Tuy nhiên, đây chưa phải câu trả lời đúng! Function `ctime()` chuyển argument thành giờ địa phương, khác với Coordinated Universal Time, còn gọi là Greenwich Mean Time, tùy nơi bạn ở trên địa cầu. California, nơi cuốn sách được viết, chậm London tám giờ và đi trước vài năm.

Thực ra, chúng ta nên dùng function `gmtime()` để lấy giá trị thời gian UTC lớn nhất. Function này không trả về một string có thể in, nên chúng ta gọi `asctime()` để lấy string đó. Ghép tất cả lại, chương trình sửa đổi là

```
#include <stdio.h>
#include <time.h>

int main() {
  time_t biggest = 0x7FFFFFFF;

  printf("biggest = %s \n", asctime(gmtime(&biggest)) );
  return 0;
}
```

Kết quả là:

```
biggest = Tue Jan 19 03:14:07 2038
```

Đấy! Vắt thêm được tám giờ nữa!

Nhưng chúng ta vẫn chưa xong. Nếu dùng locale New Zealand, bạn có thể được thêm 13 giờ, giả sử họ áp dụng daylight savings time vào năm 2038. Họ dùng DST trong tháng Một vì nằm ở nam bán cầu. Do vị trí xa nhất về phía đông xét theo múi giờ, New Zealand có vinh dự không vui là quốc gia đầu tiên gặp các bug được kích hoạt bởi những ngày cụ thể.

Ngay cả những thứ simple-looking đôi khi cũng có bước ngoặt bất ngờ trong software. Và ai nghĩ việc lập trình ngày tháng dễ đúng ngay lần đầu có lẽ chưa làm nhiều công việc đó.
