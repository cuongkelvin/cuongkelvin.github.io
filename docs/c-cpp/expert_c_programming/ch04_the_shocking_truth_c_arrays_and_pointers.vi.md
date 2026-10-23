# Chương 4. Sự thật gây sốc: Array và pointer C KHÔNG giống nhau!

Array index nên bắt đầu từ 0 hay 1? Phương án dung hòa là 0.5 của tôi đã bị bác bỏ mà, theo tôi, chưa được cân nhắc đúng mức.

—Stan Kelly-Bootle

array KHÔNG phải là pointer…tại sao code của tôi không hoạt động?…declaration là gì? definition là gì?…hãy viết declaration khớp với definition…những khác biệt giữa array và pointer…giải trí nhẹ nhàng — vui với palindrome!

## Array KHÔNG phải pointer!

Một trong những điều đầu tiên mà người mới lập trình C thường nghe là "array giống với pointer". Đáng tiếc, đây là một half-truth nguy hiểm. Đoạn 6.5.4.2 của chuẩn ANSI C khuyên bạn

Lưu ý sự khác biệt giữa các declaration sau:

```
extern int *x;
extern int y[];
```

Declaration đầu tiên khai báo `x` là một pointer tới `int`; declaration thứ hai khai báo `y` là một array gồm các phần tử `int` có kích thước chưa xác định (một incomplete type), với vùng lưu trữ được định nghĩa ở nơi khác.

Chuẩn không trình bày vấn đề này chi tiết hơn nữa. Quá nhiều sách C chỉ giải thích qua loa khi nào array tương đương với pointer và khi nào chúng không tương đương, rồi đẩy phần giải thích xuống chú thích trong khi nó xứng đáng là tiêu đề của cả một chương. Cuốn sách này cố gắng khôi phục sự cân bằng bằng cách giải thích đầy đủ khi nào array tương đương với pointer, khi nào không và tại sao. Không chỉ vậy, chúng tôi còn bảo đảm nhấn mạnh điểm cốt yếu này bằng một tiêu đề chương, thay vì một chú thích.

## Sao code của tôi không chạy?

Nếu tôi nhận được mười xu mỗi lần có người mang đến một chương trình như dưới đây, kèm lời phàn nàn rằng "nó không hoạt động", thì tôi sẽ có, ừm, để xem nào, khoảng two-fifty. File 1:

```
int mango[100];
```

File 2:

```
extern int *mango;
...
/* some code that references mango[i] */
```

Ở đây, file 1 định nghĩa `mango` là một array, nhưng file 2 lại khai báo nó là một pointer. Vậy điều đó có gì sai? Xét cho cùng, "ai cũng biết" array và pointer gần như giống nhau trong C. Vấn đề là "ai cũng" sai! Điều này giống như nhầm lẫn integer với float:

File 1:

```
int guava;
```

File 2:

```
extern float guava;
```

Ví dụ `int` và `float` ở trên là một trường hợp type mismatch rõ ràng và nghiêm trọng; không ai mong nó hoạt động. Vậy tại sao người ta lại nghĩ rằng lúc nào cũng có thể sử dụng pointer và array hoàn toàn thay thế cho nhau? Câu trả lời là mọi array reference đều có thể viết lại thành pointer reference, và có một ngữ cảnh trong đó pointer definition và array definition tương đương nhau. Đáng tiếc, ngữ cảnh này liên quan đến một cách sử dụng array rất phổ biến, nên người ta tự nhiên khái quát hóa và cho rằng chúng tương đương trong mọi trường hợp, kể cả trường hợp rõ ràng sai ở trên: "định nghĩa là array nhưng external declaration lại là pointer".

## Declaration là gì? Definition là gì?

Trước khi tìm hiểu tận gốc vấn đề này, chúng ta cần ôn lại một số thuật ngữ C thiết yếu. Hãy nhớ rằng object trong C phải có đúng một definition, nhưng có thể có nhiều external declaration. Nhân tiện, ở đây không có những lời mumbo-jumbo của C++: khi nói "object", chúng tôi muốn chỉ một "thứ" trong C mà linker biết đến, chẳng hạn một function hoặc một data item.

Definition là một loại declaration đặc biệt có tác dụng tạo object; declaration chỉ ra một tên cho phép bạn tham chiếu tới object được tạo ở đây hoặc ở nơi khác. Hãy ôn lại các thuật ngữ:

definition chỉ xuất hiện tại một vị trí; chỉ định type của object, dành vùng lưu trữ cho object và được dùng để tạo

các object mới

ví dụ: `int my_array[100];`

declaration mô tả type của object; được dùng để tham chiếu tới các object được định nghĩa ở nơi khác và có thể xuất hiện

nhiều lần

ở nơi khác (ví dụ trong một file khác)

ví dụ: `extern int my_array[];`

### Mẹo thực hành hữu ích

![image](images/ch04/img04-01.png)

Phân biệt definition với declaration

Bạn có thể phân biệt hai khái niệm này bằng cách ghi nhớ:

Declaration giống tờ khai hải quan:

Nó không phải chính món đồ, mà chỉ là bản mô tả những hành lý mà bạn nói rằng mình đang có ở đâu đó. Definition là loại declaration đặc biệt xác lập vùng lưu trữ cho một object.

Declaration của một external object cho compiler biết type và tên của object, đồng thời cho biết việc cấp phát memory được thực hiện ở nơi khác. Vì bạn không cấp phát memory cho array tại đây, bạn không cần cung cấp thông tin về tổng kích thước của nó. Tuy nhiên, bạn phải cung cấp kích thước của tất cả các chiều của array ngoại trừ chiều ngoài cùng bên trái; điều này cho compiler đủ thông tin để tạo indexing code.

## Cách truy cập array và pointer

Trong phần này, chúng ta sẽ chỉ ra sự khác biệt giữa một tham chiếu sử dụng array và một tham chiếu sử dụng pointer. Sự phân biệt đầu tiên cần lưu ý là giữa địa chỉ y và nội dung tại địa chỉ y. Đây thực ra là một điểm khá tinh tế, bởi trong phần lớn ngôn ngữ lập trình, chúng ta dùng cùng một symbol để biểu diễn cả hai, và compiler suy ra ý nghĩa dựa trên ngữ cảnh. Hãy xét một phép gán đơn giản như trong Hình 4-1.

Hình 4-1. Khác biệt address (l-value) và nội dung

address (r-value)

![image](images/ch04/img04-02.png)

Symbol xuất hiện bên trái một phép gán đôi khi được gọi là l-value (viết tắt của giá trị "left-hand-side" hoặc "locator"), còn symbol bên phải đôi khi được gọi là r-value (viết tắt của "right-hand-side"). Compiler cấp phát một địa chỉ, hay l-value, cho mỗi variable. Địa chỉ này được xác định tại compiletime và là nơi lưu variable tại runtime. Ngược lại, giá trị được lưu trong variable tại runtime, tức r-value của nó, chỉ được biết khi chương trình chạy. Nếu cần giá trị được lưu trong variable, compiler sẽ sinh code đọc giá trị từ địa chỉ đã cho và đưa nó vào một register.

Điểm cốt yếu ở đây là địa chỉ của mỗi symbol được xác định tại compiletime. Vì vậy, nếu compiler cần thực hiện một thao tác với địa chỉ, chẳng hạn cộng thêm một offset, nó có thể làm trực tiếp mà không cần sinh code lấy địa chỉ trước. Ngược lại, giá trị hiện tại của pointer phải được lấy tại runtime trước khi có thể dereference nó, tức dùng nó trong một thao tác look-up tiếp theo. Sơ đồ A minh họa một array reference.

Hình A. Array reference có subscript

![image](images/ch04/img04-03.png)

Đó là lý do bạn có thể viết `extern char` `a[];` cũng như `extern` `char` `a[100];`. Cả hai declaration đều cho biết a là một array, tức một vị trí memory nơi có thể tìm thấy các character trong array. Compiler không cần biết tổng chiều dài của array vì nó chỉ sinh các offset địa chỉ tính từ đầu array. Để lấy một character trong array, bạn chỉ cần cộng subscript vào địa chỉ mà symbol table ghi nhận cho `a`, rồi lấy nội dung tại vị trí đó. Ngược lại, nếu khai báo `extern char` `*p`, bạn cho compiler biết p là một pointer (một object four-byte trên nhiều máy đương thời), còn object mà nó trỏ tới là một character. Để lấy char, bạn phải lấy nội dung tại địa chỉ p, rồi dùng nội dung đó làm địa chỉ để lấy tiếp nội dung tại đó. Pointer access linh hoạt hơn, nhưng phải trả giá bằng một fetch instruction bổ sung, như Sơ đồ B minh họa.

Hình B. Pointer reference

![image](images/ch04/img04-04.png)

### Khi "định nghĩa pointer/tham chiếu array" thì sao

Bây giờ chúng ta có thể thấy vấn đề phát sinh khi một external array được định nghĩa là pointer nhưng được tham chiếu như array. Kiểu tham chiếu memory gián tiếp dành cho pointer (xem Sơ đồ B) được thực hiện trong khi điều chúng ta thực sự muốn là một tham chiếu memory trực tiếp (như Sơ đồ A). Điều này xảy ra vì chúng ta đã nói với compiler rằng mình có một pointer, và được minh họa trong Sơ đồ C.

Hình C. Pointer reference có subscript

![image](images/ch04/img04-05.png)

Hãy so sánh cách truy cập trong Sơ đồ C ở trang 101

```
char * p = "abcdefgh"; ... p[3]
```

với Sơ đồ A trang 99

```
char a[] = "abcdefgh"; ... a[3]
```

Cả hai đều lấy được character `'d'`, nhưng thực hiện những thao tác look-ups rất khác nhau để đến được đó.

Khi viết `extern char` `*p,` rồi tham chiếu nó dưới dạng `p[3]`, về bản chất bạn đang kết hợp Sơ đồ A và B. Bạn thực hiện một tham chiếu gián tiếp như trong sơ đồ 2, rồi tiến thêm offset do subscript biểu diễn như trong sơ đồ 1. Diễn đạt chính xác hơn, compiler sinh code để:

1\. Lấy địa chỉ mà p biểu diễn và đọc pointer được lưu tại đó.

2\. Cộng offset do subscript biểu diễn vào giá trị pointer.

3\. Truy cập byte tại địa chỉ thu được.

Compiler đã được thông báo rằng p là một pointer tới char. (Ngược lại, array definition cho compiler biết rằng p là một dãy char.) Tham chiếu `p[i]` có nghĩa là "bắt đầu từ nơi p trỏ tới, tiến qua i phần tử, mỗi phần tử là một char, tức dài 1 byte". Với pointer tới các type khác nhau (`int` hoặc `double`, v.v.), scaling factor — kích thước của mỗi phần tử được bước qua — sẽ là một số byte khác.

Vì chúng ta đã khai báo p là một pointer, thao tác look-up sẽ diễn ra theo cách này bất kể ban đầu p được định nghĩa là pointer (khi đó thao tác là đúng) hay array (khi đó thao tác là sai). Hãy xét trường hợp external declaration là `extern char *p;` nhưng definition lại là `char p[10];`. Khi lấy nội dung của `p[i]` thông qua extern, chúng ta nhận được các character nhưng lại coi chúng là một pointer. Việc diễn giải các ASCII character thành địa chỉ sẽ tạo ra một địa chỉ vô nghĩa; nếu may mắn, chương trình sẽ coredump ngay tại đó. Nếu không may, nó sẽ làm hỏng một thứ gì đó trong address space của bạn và gây ra một lỗi bí ẩn tại một thời điểm sau đó trong chương trình.

## Khớp declaration với definition

Vấn đề external declaration của pointer không khớp với array definition rất dễ sửa: thay declaration để nó khớp với definition, như sau:

File 1:

```
int mango[100];
```

File 2:

```
extern int mango[];
...
/* some code that references mango[i] */
```

Array definition của `mango` cấp phát vùng lưu trữ cho 100 integer. Ngược lại, pointer definition:

```
int *raisin;
```

yêu cầu một vùng lưu trữ chứa một pointer. Pointer này được biết đến với tên `raisin` và có thể trỏ tới bất kỳ int nào (hoặc array gồm các int) ở bất kỳ đâu. Bản thân variable `raisin` luôn nằm tại cùng một địa chỉ, nhưng nội dung của nó có thể thay đổi để trỏ tới nhiều int khác nhau tại các thời điểm khác nhau. Mỗi int đó có thể mang một giá trị khác nhau. Array `mango` không thể chuyển sang những nơi khác. Tại các thời điểm khác nhau, nó có thể được điền các giá trị khác nhau, nhưng luôn chỉ tới cùng 100 vị trí memory liên tiếp.

## Khác biệt khác giữa array và pointer

Một cách khác để xem xét sự khác biệt giữa array và pointer là so sánh một số đặc tính của chúng, như trong Bảng 4-1.

Bảng 4-1. Khác biệt array và pointer

| Pointer | Array |
|---|---|
| Lưu địa chỉ của dữ liệu | Lưu dữ liệu |
| Dữ liệu được truy cập gián tiếp: trước hết lấy nội dung của pointer, nạp nội dung đó làm địa chỉ (gọi là "L"), rồi lấy nội dung tại địa chỉ ấy. <br> Nếu pointer có subscript `[i]`, thay vào đó bạn lấy nội dung tại vị trí cách "L" i đơn vị về phía sau | Dữ liệu được truy cập trực tiếp: với a\[i\], bạn chỉ cần lấy nội dung tại vị trí cách a i đơn vị về phía sau. |
| Thường được dùng cho dynamic data structure | Thường được dùng để lưu một số lượng cố định các phần tử có cùng data type |
| Thường được dùng với `malloc(), free()` | Được cấp phát và giải phóng ngầm |
| Thường trỏ tới dữ liệu không có tên | Bản thân là một variable có tên riêng |

Cả array lẫn pointer đều có thể được khởi tạo bằng một literal string trong definition của chúng. Mặc dù hai trường hợp trông giống nhau, những thao tác thực sự diễn ra lại khác nhau.

Pointer definition không cấp phát vùng lưu trữ cho đối tượng được trỏ tới mà chỉ cấp phát cho chính pointer, ngoại trừ khi được gán một literal string. Chẳng hạn, definition dưới đây còn tạo ra string literal:

```
char *p = "breadfruit";
```

Lưu ý rằng điều này chỉ hoạt động với string literal. Bạn không thể mong nó cấp phát vùng lưu trữ cho một float literal, chẳng hạn:

```
float *pip = 3.141; /* Bzzt! won't compile */
```

String literal được tạo bởi pointer initialization được ANSI C quy định là read-only; chương trình sẽ có undefined behavior nếu cố thay đổi literal bằng cách ghi thông qua p. Một số implementation đặt string literal trong text segment, nơi chúng được bảo vệ bằng quyền read-only.

Array cũng có thể được khởi tạo bằng một string literal:

```
char a[] = "gooseberry";
```

Khác với pointer, array được khởi tạo bằng literal string có thể ghi được. Các character riêng lẻ có thể được thay đổi về sau. Câu lệnh sau:

```
strncpy(a, "black", 5);
```

đặt cho string trong array giá trị mới là "`blackberry`".

Chương 9 thảo luận khi nào pointer và array tương đương nhau, sau đó giải thích vì sao sự tương đương này được thiết kế như vậy và nó hoạt động ra sao. Chương 10 mô tả một số thủ thuật hocus-pocus nâng cao với array dựa trên pointer. Nếu đọc đến cuối chương đó, lượng kiến thức về array mà bạn đã quên có lẽ còn nhiều hơn tất cả những gì nhiều lập trình viên C từng biết.

Pointer là một trong những phần khó hiểu và khó áp dụng đúng nhất của C, chỉ đứng sau cú pháp declaration. Tuy nhiên, chúng cũng là một trong những phần quan trọng nhất của C. Lập trình viên C chuyên nghiệp phải sử dụng thành thạo `malloc()` và pointer tới anonymous memory.

## Giải trí nhẹ nhàng — Vui với palindrome!

Palindrome là một từ hoặc cụm từ đọc ngược cũng giống như đọc xuôi, chẳng hạn "do geese see God?" (Trả lời: "O, no!"). Palindrome là một kiểu trò vui giải trí trong phòng khách; những câu hay nhất thường có ý nghĩa tương đối hợp lý, chẳng hạn lời cuối đầy tiếc nuối của Napoleon: "Able was I, ere I saw Elba". Một palindrome kinh điển khác nhắc tới nỗ lực cá nhân phi thường trong việc xây dựng kênh đào Panama: "A man, a plan, a canal—Panama!".

Nhưng dĩ nhiên, để xây dựng kênh đào Panama cần nhiều hơn hẳn một người và một kế hoạch; Jim Saxe, một nghiên cứu sinh ngành computer science tại Carnegie-Mellon University, đã lưu ý điều đó. Vào tháng 10 năm 1983, trong lúc nghịch ngợm với palindrome Panama, Jim đã mở rộng nó thành:

A man, a plan, a cat, a canal—Panama?

Jim đưa câu này lên computer system để các nghiên cứu sinh khác có thể đọc được, và thế là cuộc đua bắt đầu!

Steve Smith tại Yale đã viết một câu nhại lại nỗ lực đó:

A tool, a fool, a pool—loopaloofaloota!

Chỉ trong vài tuần, Guy Jacobson đã mở rộng toàn cảnh này thành:

A man, a plan, a cat, a ham, a yak, a yam, a hat, a canal—Panama!

Lúc này, mọi người thực sự quan tâm đến các palindrome về Panama! Thực tế, Dan Hoey, người vừa tốt nghiệp không lâu trước đó, đã viết một chương trình C để tìm kiếm và xây dựng tuyệt phẩm sau:

A man, a plan, a caret, a ban, a myriad, a sum, a lac, a liar, a hoop, a

pint, a catalpa, a gas, an oil, a bird, a yell, a vat, a caw, a pax, a wag,

a tax, a nay, a ram, a cap, a yam, a gay, a tsar, a wall, a car, a luger, a

ward, a bin, a woman, a vassal, a wolf, a tuna, a nit, a pall, a fret, a

watt, a bay, a daub, a tan, a cab, a datum, a gall, a hat, a fag, a zap, a say, a jaw, a lay, a wet, a gallop, a tug, a trot, a trap, a tram, a torr, a

caper, a top, a tonk, a toll, a ball, a fair, a sax, a minim, a tenor, a

bass, a passer, a capital, a rut, an amen, a ted, a cabal, a tang, a sun, an

ass, a maw, a sag, a jam, a dam, a sub, a salt, an axon, a sail, an ad, a

wadi, a radian, a room, a rood, a rip, a tad, a pariah, a revel, a reel, a

reed, a pool, a plug, a pin, a peek, a parabola, a dog, a pat, a cud, a nu,

a fan, a pal, a rum, a nod, an eta, a lag, an eel, a batik, a mug, a mot, a

nap, a maxim, a mood, a leek, a grub, a gob, a gel, a drab, a citadel, a

total, a cedar, a tap, a gag, a rat, a manor, a bar, a gal, a cola, a pap, a

yaw, a tab, a raj, a gab, a nag, a pagan, a bag, a jar, a bat, a way, a

papa, a local, a gar, a baron, a mat, a rag, a gap, a tar, a decal, a tot, a

led, a tic, a bard, a leg, a bog, a burg, a keel, a doom, a mix, a map, an

atom, a gum, a kit, a baleen, a gala, a ten, a don, a mural, a pan, a faun,

a ducat, a pagoda, a lob, a rap, a keep, a nip, a gulp, a loop, a deer, a

leer, a lever, a hair, a pad, a tapir, a door, a moor, an aid, a raid, a

wad, an alias, an ox, an atlas, a bus, a madam, a jag, a saw, a mass, an

anus, a gnat, a lab, a cadet, an em, a natural, a tip, a caress, a pass, a

baronet, a minimax, a sari, a fall, a ballot, a knot, a pot, a rep, a

carrot, a mart, a part, a tort, a gut, a poll, a gateway, a law, a jay, a

sap, a zag, a fat, a hall, a gamut, a dab, a can, a tabu, a day, a batt, a

waterfall, a patina, a nut, a flow, a lass, a van, a mow, a nib, a draw, a

regular, a call, a war, a stay, a gam, a yap, a cam, a ray, an ax, a tag, a

wax, a paw, a cat, a valley, a drib, a lion, a saga, a plat, a catnip, a

pooh, a rail, a calamus, a dairyman, a bater, a canal—Panama. "Catalpa" (nếu bạn đang thắc mắc) là một từ của người Mỹ bản địa chỉ một loại cây. Bạn có thể tự tra nghĩa của axon và calamus. Dan nhận xét rằng chỉ cần cải tiến search algorithm một chút là có thể làm cho câu này dài gấp vài lần.

Search algorithm này rất tài tình: Dan lập trình một finite state machine để đánh giá một chuỗi các palindrome chưa hoàn chỉnh. Trong mỗi trường hợp, trạng thái gồm phần chưa khớp của palindrome. Bắt đầu từ palindrome ban đầu, Dan nhận thấy "a ca" trong "a canal" nằm ngay chính giữa cụm từ, vì vậy có thể thêm bất kỳ thứ gì sau "a plan", miễn là phần đảo ngược của nó tạo thành một từ hoặc part-word khi được đặt sau đó.

Để chèn thêm các từ sau "a plan", chỉ cần bắt đầu bằng cách nhân đôi "a ca" ở giữa. Ta thu được "…, a plan, a ca… a canal,…". Có thể dừng ngay ở đây nếu "ca" là một từ, nhưng nó không phải. Vì vậy, hãy tìm một phần hoàn chỉnh mảnh từ bên trái rồi thêm chính phần đó, viết ngược, vào bên phải; chẳng hạn "ret … ter.".

Ở mỗi bước, phần cuối của từ được thêm vào được viết ngược và trở thành phần đầu của từ tiếp theo mà chúng ta cần tìm. Bảng 4-2 minh họa quá trình này:

Bảng 4-2. Dựng palindrome

| Trạng thái "-aca": | "A man, a plan, ... a canal, Panama" |
|---|---|
| Trạng thái "ret-": | "... a plan, a caret, ... a canal, Panama" |
| Trạng thái "-aba": | "... a plan, a caret, ... a bater, a canal, ..." |
| Trạng thái "n-": | "... a caret, a ban, ... a bater, a canal, ..." |
| Trạng thái "-adairyma": | "... a caret, a ban, ... a dairyman, a bater, ..." |
| Trạng thái "-a": | "... a ban, a myriad, ... a dairyman, a bater, ..." |

Accepting state của finite state machine là những trạng thái mà bản thân phần chưa khớp đã là palindrome. Nói cách khác, tại bất kỳ thời điểm nào mà những từ vừa chọn tự tạo thành một palindrome, bạn đều có thể dừng lại. Trong trường hợp này, palindrome "… a nag, a pagan, …" nằm ở giữa, và việc chèn "-apa-" đã kết thúc thuật toán.

Dan sử dụng một word list nhỏ chỉ chứa danh từ. Nếu không làm như vậy, bạn sẽ thu được nhiều cụm vô nghĩa như "a how, a running, a would, an expect, an and...". Một cách khác là dùng một từ điển on-line thực sự, chứ không chỉ một word list, trong đó có chỉ rõ những từ nào là danh từ. Nhờ đó có thể tạo ra một palindrome rất lớn. Nhưng như Dan nói: "Nếu tạo được một palindrome 10.000 từ, tôi tự hỏi liệu có ai muốn nó không. Tôi thích câu này vì nó đủ ngắn để truyền cho nhau đọc. Và tôi đã làm xong rồi." Bạn không thể phản bác điều đó!

### Thử thách lập trình

![image](images/ch04/img04-06.png)

Viết palindrome

Hãy giành lấy 15 phút nổi tiếng của mình: viết một chương trình C tạo ra palindrome 10,000-word đó. Để thực sự nổi tiếng, hãy đăng nó lên rec.arts.startrek.misc trên Usenet. Mọi người ở đó đã chán việc thảo luận về tên đệm của Captain Kirk và rất thích nghe về những trò giải trí mới.
