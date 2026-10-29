# Chương 11: Diffie–Hellman

Tháng Mười Một năm 1976, các nhà nghiên cứu Stanford Whitfield Diffie và Martin Hellman đã công bố một bài báo nghiên cứu có tựa đề “New Directions in Cryptography” đã cách mạng hóa cryptography mãi mãi. Bài báo của họ giới thiệu khái niệm public-key encryption và signature, dù thực ra họ chưa có scheme nào như vậy; họ chỉ có thứ mà họ gọi là một public-key cryptosystem, một protocol cho phép hai bên thiết lập một bí mật chung (shared secret) bằng cách trao đổi thông tin mà kẻ nghe lén có thể nhìn thấy. Ngày nay, nó được biết đến là protocol Diffie–Hellman (DH). Trước Diffie–Hellman, thiết lập một shared secret đòi hỏi những thủ tục rườm rà như trao đổi thủ công các phong bì niêm phong.

Một khi các bên liên lạc đã thiết lập được một giá trị shared secret bằng protocol DH, họ có thể dùng bí mật đó để thiết lập một kênh an toàn bằng cách biến bí mật đó thành một hoặc nhiều symmetric key rồi dùng chúng để mã hóa và xác thực các cuộc liên lạc tiếp theo. Do đó, protocol DH và các biến thể của nó được gọi là key agreement protocol.

Trong phần đầu của chương này, bạn sẽ đọc về nền tảng toán học của protocol Diffie–Hellman, bao gồm các bài toán tính toán mà DH dựa vào để thực hiện phép màu của mình. Sau đó, bạn sẽ học về các phiên bản khác nhau của protocol Diffie–Hellman mà bạn có thể dùng để tạo kênh an toàn. Cuối cùng, vì các scheme Diffie–Hellman chỉ an toàn khi tham số của chúng được chọn tốt, bạn sẽ thấy những kịch bản mà Diffie–Hellman có thể thất bại.

> **LƯU Ý** Diffie và Hellman đã nhận Giải thưởng Turing danh giá năm 2015 cho phát minh public-key cryptography và digital signature của họ, nhưng những người khác cũng xứng đáng được ghi nhận. Năm 1974, khi còn là sinh viên đại học ngành khoa học máy tính, Ralph Merkle đã giới thiệu ý tưởng public-key cryptography với Merkle’s puzzles. Cũng vào khoảng thời gian đó, các nhà nghiên cứu tại British Government Communications Headquarters (GCHQ), cơ quan tương đương NSA của Anh, đã khám phá ra các nguyên lý đằng sau Rivest–Shamir–Adleman (RSA) và Diffie–Hellman key agreement, dù sự thật đó chỉ được giải mật hàng chục năm sau.

## Diffie–Hellman Function (The Diffie–Hellman Function)

Để hiểu các DH key agreement protocol, bạn phải hiểu phép toán cốt lõi của chúng, DH function. Ban đầu, Diffie và Hellman định nghĩa DH function làm việc với các group ký hiệu là Z<sub>p</sub><sup>\*</sup>, gồm các số nguyên khác không modulo một số nguyên tố, thường được ký hiệu là p (xem Chương 9). Một tham số công khai khác là số cơ sở, hay generator, g.

DH function bao gồm hai giá trị riêng (private value) được hai bên liên lạc chọn ngẫu nhiên từ group Z<sub>p</sub><sup>\*</sup>, mà chúng ta sẽ viết là a và b. Một private value a gắn với public value A = g<sup>a</sup> mod p, tức g lũy thừa a modulo p. A này được gửi cho bên kia thông qua một message mà kẻ nghe lén có thể nhìn thấy. Public value gắn với b là B = g<sup>b</sup> mod p, được gửi cho chủ sở hữu của a. Do đó, kẻ tấn công có thể biết A và B.

DH hoạt động bằng cách kết hợp một trong hai public value với private value còn lại, sao cho kết quả là như nhau trong cả hai trường hợp: A<sup>b</sup> = (g<sup>a</sup>)<sup>b</sup> = g<sup>ab</sup> và B<sup>a</sup> = (g<sup>b</sup>)<sup>a</sup> = g<sup>ba</sup> = g<sup>ab</sup>. Giá trị thu được, g<sup>ab</sup>, là shared secret; sau đó bạn đưa nó vào một key derivation function (KDF) để tạo ra một hoặc nhiều symmetric key dùng chung. KDF là một loại hash function trả về một chuỗi random-looking có kích thước bằng độ dài key mong muốn.

Và chỉ có vậy. Giống như nhiều khám phá khoa học vĩ đại (trọng lực, thuyết tương đối, quantum computing, hay RSA), thủ thuật Diffie–Hellman tương đối đơn giản khi nhìn lại.

Tuy nhiên, sự đơn giản của Diffie–Hellman có thể đánh lừa. Trước hết, nó sẽ không hoạt động với bất kỳ số nguyên tố p hay số cơ sở g nào. Một số giá trị của g giới hạn các shared secret g<sup>ab</sup> vào một tập con nhỏ các giá trị khả dĩ, trong khi bạn sẽ kỳ vọng có số giá trị khả dĩ xấp xỉ bằng số phần tử trong Z<sub>p</sub><sup>\*</sup> và do đó cũng chừng ấy giá trị khả dĩ cho shared secret. Để bảo đảm security cao nhất, các tham số DH an toàn phải làm việc với một số nguyên tố p sao cho (p – 1)/2 cũng là số nguyên tố. Một safe prime như vậy bảo đảm rằng group không có các subgroup nhỏ khiến DH dễ bị phá hơn. Với một safe prime, DH có thể làm việc với bất kỳ phần tử nào trong Z<sub>p</sub><sup>\*</sup>, ngoại trừ 1 và p – 1; đáng chú ý, g = 2 làm phép tính nhanh hơn một chút. Nhưng tạo một safe prime p tốn nhiều thời gian hơn so với tạo một số nguyên tố hoàn toàn ngẫu nhiên.

Ví dụ, lệnh dhparam của bộ công cụ OpenSSL chỉ tạo ra các tham số DH an toàn, nhưng các kiểm tra bổ sung được tích hợp trong algorithm làm tăng đáng kể thời gian thực thi, như Listing 11-1 cho thấy.

```
$ time openssl dhparam 2048
Generating DH parameters, 2048 bit long safe prime, generator 2
This is going to take a long time
--snip--
-----BEGIN DH PARAMETERS-----
MIIBCAKCAQEAoSIbyA9e844q7V89rcoEV8vd/l2svwhIIjG9EPwWWr7FkfYhYkU9
fRNttmilGCTfxc9EDf+4dzw+AbRBc6oOL9gxUoPnOd1/G/YDYgyplF5M3xeswqea
SD+B7628pWTaCZGKZham7vmiN8azGeaYAucckTkjVWceHVIVXe5fvU74k7+C2wKk
iiyMFm8th2zm9W/shiKNV2+SsHtD6r3ZC2/hfu7XdOI4iT6ise83YicU/cRaDmK6
zgBKn3SlCjwL4M3+m1J+Vh0UFz/nWTJ1IWAVC+aoLK8upqRgApOgHkVqzP/CgwBw
XAOE8ncQqroJ0mUSB5eLqfpAvyBWpkrwQwIBAg==
-----END DH PARAMETERS-----
openssl dhparam 2048 7.46s user 0.10s system 99% cpu 7.593 total
```

Listing 11-1: Đo thời gian thực thi việc tạo các tham số Diffie–Hellman 2,048-bit bằng bộ công cụ OpenSSL

Mất khoảng tám giây để tạo các tham số DH bằng bộ công cụ OpenSSL (thường thấy thời gian tạo cỡ 30 giây hoặc thậm chí hơn 1 phút).

Để so sánh, Listing 11-2 cho thấy trên cùng hệ thống đó mất bao lâu để tạo các tham số RSA có cùng kích thước (tức là hai số nguyên tố, p và q, mỗi số có kích thước bằng một nửa p được dùng cho DH).

```
$ time openssl genrsa 2048
Generating RSA private key, 2048 bit long modulus
...................................................+++
.............................................................+++
e is 65537 (0x10001)
-----BEGIN RSA PRIVATE KEY-----
--snip--
-----END RSA PRIVATE KEY-----
openssl genrsa 2048  0.16s user 0.01s system 95% cpu 0.171 total
```

Listing 11-2: Tạo các tham số RSA 2,048-bit đồng thời đo thời gian thực thi

Việc tạo tham số DH mất thời gian gấp khoảng 50 lần so với việc tạo tham số RSA có cùng security level, chủ yếu do ràng buộc bổ sung áp đặt lên số nguyên tố được tạo ra để tạo tham số DH.

## Các bài toán Diffie–Hellman (The Diffie–Hellman Problems)

Security của các protocol DH dựa vào độ khó của các bài toán tính toán, đặc biệt là discrete logarithm problem (DLP) trong Chương 9. Bạn có thể phá DH bằng cách khôi phục private value a từ public value g<sup>a</sup> của nó, điều rốt cuộc là giải một instance DLP. Nhưng khi dùng DH để tính shared secret, chúng ta không chỉ quan tâm đến discrete logarithm problem. Chúng ta còn quan tâm đến hai bài toán DH-specific.

### Bài toán tính toán (The Computational Problem)

Bài toán computational Diffie–Hellman (CDH) là bài toán tính shared secret g<sup>ab</sup> khi chỉ có các public value g<sup>a</sup> và g<sup>b</sup>, mà không biết các giá trị bí mật a và b. Động lực là bảo đảm rằng ngay cả khi một kẻ nghe lén bắt được g<sup>a</sup> và g<sup>b</sup>, họ cũng không thể xác định được shared secret g<sup>ab</sup>.

Nếu bạn có thể giải DLP, thì bạn cũng có thể giải CDH; tức là nếu bạn xác định được a và b khi có g<sup>a</sup> và g<sup>b</sup>, thì bạn sẽ có thể tính g<sup>ab</sup>. Nói cách khác, DLP ít nhất cũng khó bằng CDH. Nhưng bạn không biết chắc liệu CDH có ít nhất khó bằng DLP hay không, điều sẽ khiến hai bài toán khó ngang nhau. Nói cách khác, DLP đối với CDH giống như factoring problem đối với RSA problem. (Hãy nhớ rằng factoring cho phép bạn giải RSA problem nhưng chiều ngược lại không nhất thiết đúng.)

Diffie–Hellman còn có một điểm tương đồng khác với RSA ở chỗ DH mang lại security level tương tự RSA với cùng một kích thước modulus. Ví dụ, protocol DH với một số nguyên tố p 2,048-bit cung cấp security khoảng 90-bit, giống như RSA với modulus 2,048-bit. Thật vậy, cách nhanh nhất để phá CDH là giải DLP bằng algorithm number field sieve, một phương pháp tương tự nhưng không giống hệt general number field sieve (GNFS), thứ phá RSA bằng cách phân tích modulus của nó thành thừa số.

### Bài toán quyết định (The Decisional Problem)

Khi bạn cần một giả định có vẻ mạnh hơn độ khó của CDH, hãy đến với bài toán decisional Diffie–Hellman (DDH). Cho g<sup>a</sup>, g<sup>b</sup>, và một giá trị hoặc là g<sup>ab</sup> hoặc là g<sup>c</sup> với một c ngẫu nhiên nào đó (mỗi khả năng có xác suất 1/2), bài toán DDH là xác định xem g<sup>ab</sup> (shared secret tương ứng với g<sup>a</sup> và g<sup>b</sup>) có được chọn hay không.

Dựa vào DDH thay vì CDH có ý nghĩa trong trường hợp sau: hãy tưởng tượng một kẻ tấn công chỉ có thể tính 32 bit đầu tiên của g<sup>ab</sup> khi có các giá trị 2,048-bit của g<sup>a</sup> và g<sup>b</sup>. Dù CDH vẫn chưa bị phá vì 32 bit có thể không đủ để khôi phục hoàn toàn g<sup>ab</sup>, kẻ tấn công vẫn đã biết được điều gì đó về shared secret, điều có thể cho phép họ xâm phạm security của một ứng dụng.

Để bảo đảm kẻ tấn công không thể biết được bất cứ điều gì về shared secret g<sup>ab</sup>, giá trị này cần không thể phân biệt được với một phần tử ngẫu nhiên của group, giống như một encryption scheme an toàn khi ciphertext không thể phân biệt được với các chuỗi ngẫu nhiên. Tức là kẻ tấn công không thể xác định một số cho trước là g<sup>ab</sup> hay g<sup>c</sup> với một c ngẫu nhiên nào đó, khi có g<sup>a</sup>, g<sup>b</sup>. Giả định decisional Diffie–Hellman giả định rằng không kẻ tấn công nào có thể giải DDH một cách hiệu quả.

Nếu DDH khó, thì CDH cũng khó, và bạn không thể biết được gì về g<sup>ab</sup>. Vì vậy, nếu bạn có thể giải CDH, bạn cũng có thể giải DDH: khi có một bộ ba (g<sup>a</sup>, g<sup>b</sup>, x), bạn sẽ có thể suy ra g<sup>ab</sup> từ g<sup>a</sup> và g<sup>b</sup> và kiểm tra xem kết quả có bằng x đã cho hay không.

Điểm mấu chốt là DDH về cơ bản kém khó hơn CDH (đáng chú ý, DDH không khó trên Z<sub>p</sub><sup>\*</sup>, trái với CDH), nhưng độ khó của DDH là một giả định hàng đầu trong cryptography và là một trong những giả định được nghiên cứu nhiều nhất.

### Các biến thể của Diffie–Hellman (Variants of Diffie–Hellman)

Đôi khi các cryptographer nghĩ ra các scheme mới và chứng minh rằng việc phá chúng ít nhất cũng khó bằng việc giải một bài toán khó nào đó. Nhưng những bài toán khó như vậy không phải lúc nào cũng là CDH hay DDH mà có thể là các biến thể của chúng. Chúng ta muốn có thể chứng minh rằng phá một cryptosystem khó như giải CDH hoặc DDH, nhưng điều này không phải lúc nào cũng khả thi với các cơ chế cryptography nâng cao, thường vì những scheme như vậy bao gồm các phép toán phức tạp hơn các protocol Diffie–Hellman cơ bản.

Ví dụ, trong một bài toán DH-like, khi có g<sup>a</sup>, kẻ tấn công cố gắng tính g<sup>1/a</sup>, trong đó 1/a là nghịch đảo của a trong group (thường là Z<sub>p</sub><sup>\*</sup> với một số nguyên tố p nào đó). Trong một bài toán khác, kẻ tấn công có thể phân biệt các cặp (g<sup>a</sup>, g<sup>b</sup>) với các cặp (g<sup>a</sup>, g<sup>1/a</sup>) với a và b ngẫu nhiên. Cuối cùng, trong bài toán twin Diffie–Hellman, khi có g<sup>a</sup>, g<sup>b</sup> và g<sup>c</sup>, kẻ tấn công cố gắng tính hai giá trị g<sup>ab</sup> và g<sup>ac</sup>. Đôi khi các biến thể DH như vậy hóa ra khó ngang CDH hoặc DDH, và đôi khi chúng về cơ bản dễ hơn—và do đó cung cấp các bảo đảm security thấp hơn. Như một bài tập, hãy thử tìm mối liên hệ giữa độ khó của các bài toán này và độ khó của CDH và DDH. (Twin Diffie–Hellman thực ra khó ngang CDH, nhưng điều đó không dễ chứng minh!)

## Key agreement protocol (Key Agreement Protocols)

Bài toán Diffie–Hellman được thiết kế để xây dựng các key agreement protocol an toàn, giúp bảo vệ liên lạc giữa hai hoặc nhiều bên liên lạc qua một mạng nhờ một shared secret. Các bên biến bí mật này thành một hoặc nhiều session key—các symmetric key mã hóa và xác thực thông tin được trao đổi trong suốt session.

Trước khi nghiên cứu các protocol DH thực tế, bạn nên biết điều gì làm cho một key agreement protocol an toàn và các protocol đơn giản hơn hoạt động như thế nào. Chúng ta sẽ bắt đầu thảo luận với một key agreement protocol phổ biến không dựa vào DH.

### Key agreement không dựa trên DH (Non-DH Key Agreement)

Để giúp bạn hình dung một key agreement protocol hoạt động như thế nào và nó an toàn có nghĩa là gì, hãy xem protocol mà các tiêu chuẩn viễn thông 4G và 5G dùng để thiết lập liên lạc giữa một SIM card và một nhà mạng viễn thông: authenticated key agreement (AKA). Nó không dùng Diffie–Hellman function mà thay vào đó chỉ dùng các thao tác symmetric-key. Hình 11-1 trình bày chi tiết cách protocol hoạt động.

![Figure 11-1](images/ch11_diffie_hellman/fig11-1.png)

Hình 11-1: Protocol AKA trong viễn thông 4G và 5G

Trong mô tả protocol này, SIM card có một secret key, K, mà nhà mạng biết. Nhà mạng bắt đầu session bằng cách chọn một giá trị ngẫu nhiên, R, rồi tính hai giá trị, SK và V<sub>1</sub>, dựa trên hai pseudorandom function, PRF0 và PRF1. Tiếp theo, nhà mạng gửi một message tới SIM card chứa các giá trị R và V<sub>1</sub>, vốn có thể bị kẻ tấn công nhìn thấy. Khi SIM card có R, nó có những gì cần thiết để tính SK bằng PRF0, và nó tính SK. Hai bên trong session này cuối cùng có một key dùng chung, SK, mà kẻ tấn công không thể xác định chỉ bằng cách nhìn vào các message được trao đổi giữa các bên, hay thậm chí bằng cách sửa đổi chúng hoặc đưa vào các message mới. SIM card xác minh rằng nó đang nói chuyện với nhà mạng bằng cách tính lại V<sub>1</sub> với PRF1, K và R, rồi kiểm tra để chắc chắn rằng V<sub>1</sub> tính được khớp với V<sub>1</sub> do nhà mạng gửi. Sau đó, SIM card tính một giá trị xác minh, V<sub>2</sub>, bằng một function mới, PRF2, với K và R làm đầu vào, và gửi V<sub>2</sub> cho nhà mạng. Nhà mạng xác minh rằng SIM card biết K bằng cách tính V<sub>2</sub> và kiểm tra xem giá trị tính được có khớp với V<sub>2</sub> nhận được hay không.

Trong protocol như tôi đã mô tả, có một cách để đánh lừa SIM card bằng replay attack. Về cơ bản, nếu kẻ tấn công bắt được một cặp (R, V<sub>1</sub>), họ có thể gửi nó tới SIM card và lừa SIM tin rằng cặp đó đến từ một nhà mạng hợp lệ biết K. Để ngăn chặn attack này, protocol có thêm các kiểm tra bổ sung để bảo đảm cùng một R không bị dùng lại.

Vấn đề phát sinh nếu K bị xâm phạm. Ví dụ, kẻ tấn công xâm phạm được K có thể thực hiện một man-in-the-middle attack và nghe toàn bộ liên lạc cleartext. Kẻ tấn công như vậy có thể gửi message giữa hai bên trong khi giả làm cả nhà mạng SIM card hợp lệ lẫn chính SIM card. Ngay cả khi K chưa bị xâm phạm tại thời điểm của một cuộc liên lạc cho trước, kẻ tấn công vẫn có thể ghi lại các cuộc liên lạc và mọi message được trao đổi trong quá trình key agreement, rồi sau đó giải mã các cuộc liên lạc đó bằng cách dùng các giá trị R đã bắt được nếu họ tìm ra K. Khi đó, kẻ tấn công có thể xác định các session key trong quá khứ và dùng chúng để giải mã traffic đã ghi lại—trong trường hợp đó, protocol không cung cấp forward secrecy.

### Attack model cho key agreement protocol (Attack Models for Key Agreement Protocols)

Không có một định nghĩa security duy nhất cho key agreement protocol, và một key protocol không bao giờ hoàn toàn an toàn nếu không có bối cảnh và không xét đến attack model cùng các security goal. Ví dụ, bạn có thể lập luận rằng protocol 4G/5G ở trên là an toàn vì một kẻ tấn công thụ động sẽ không tìm ra session key, nhưng nó cũng không an toàn vì một khi key K bị rò rỉ, điều này sẽ xâm phạm mọi cuộc liên lạc trước đó và trong tương lai.

Có nhiều notion security khác nhau trong key agreement protocol cũng như ba attack model chính phụ thuộc vào thông tin mà protocol làm rò rỉ. Từ yếu nhất đến mạnh nhất, chúng là network attacker, data leak và breach:

**Network attacker (kẻ tấn công mạng)** Kẻ tấn công này quan sát các message được trao đổi giữa hai bên hợp lệ đang chạy một key agreement protocol và có thể ghi lại, sửa đổi, loại bỏ hoặc đưa thêm message vào. Để chống lại kẻ tấn công như vậy, một key agreement protocol không được làm rò rỉ bất kỳ thông tin nào về shared secret đã được thiết lập.

**Data leak (rò rỉ dữ liệu)** Trong model này, kẻ tấn công có được session key và mọi bí mật tạm thời (như SK trong ví dụ protocol viễn thông) từ một hoặc nhiều lần thực thi protocol, nhưng không có được các bí mật long-term (như K trong cùng protocol đó).

**Breach (hay corruption — xâm phạm)** Trong model này, kẻ tấn công biết được key long-term của một hoặc nhiều bên. Một khi breach xảy ra, security không còn đạt được nữa, vì kẻ tấn công có thể mạo danh một hoặc cả hai bên trong các session tiếp theo của protocol, vì đó là mẩu thông tin duy nhất nhận diện một bên (ít nhất là trên lý thuyết, vì trong thực tế các cơ chế như IP whitelisting có thể giảm rủi ro mạo danh). Dù vậy, kẻ tấn công không thể khôi phục bí mật từ các session được thực thi trước khi thu thập được key.

Giờ chúng ta đã xem các attack model và thấy kẻ tấn công có thể làm gì, hãy tìm hiểu các security goal—tức là các bảo đảm security mà protocol phải cung cấp. Bạn có thể thiết kế một key agreement protocol để thỏa mãn nhiều security goal. Bốn security goal phù hợp nhất được mô tả ở đây, từ đơn giản nhất đến tinh vi nhất:

**Authentication** Protocol phải cho phép mutual authentication (xác thực lẫn nhau), trong đó mỗi bên có thể xác thực bên kia. AKA xảy ra khi một protocol xác thực cả hai bên.

**Key control** Không bên nào được phép chọn shared secret cuối cùng hoặc ép nó nằm trong một tập con cụ thể. Key agreement protocol 4G/5G đã thảo luận trước đó thiếu tính chất này vì nhà mạng chọn giá trị R, thứ hoàn toàn quyết định key dùng chung cuối cùng.

**Forward secrecy** Ngay cả khi mọi bí mật long-term bị lộ, kẻ tấn công cũng không thể tính được các shared secret từ những lần thực thi protocol trước đó, ngay cả khi họ ghi lại mọi lần thực thi trước đó hoặc có thể đưa vào hay sửa đổi message của những lần thực thi trước đó. Một protocol forward-secret, hay forward-secure, bảo đảm rằng ngay cả khi bạn phải giao nộp thiết bị và bí mật của chúng cho một cơ quan chức năng nào đó, họ cũng sẽ không thể giải mã các cuộc liên lạc đã mã hóa trước đây của bạn. (Key agreement protocol 4G/5G không cung cấp forward secrecy.)

**Khả năng chống key-compromise impersonation (KCI)** KCI xảy ra khi kẻ tấn công xâm phạm key long-term của một bên và có thể dùng nó để mạo danh một bên khác. Ví dụ, key agreement protocol 4G/5G cho phép key-compromise impersonation một cách tầm thường vì cả hai bên dùng chung cùng key K. Một key agreement protocol lý tưởng sẽ ngăn chặn loại attack này.

### Hiệu năng (Performance)

Để hữu ích, một key agreement protocol phải vừa hiệu quả vừa an toàn. Bạn nên tính đến nhiều yếu tố khi xét hiệu quả của một key agreement protocol, bao gồm số message được trao đổi, độ dài của chúng, công sức tính toán để triển khai protocol, và liệu có thể tính trước một số phần để tiết kiệm thời gian hay không. Một protocol thường hiệu quả hơn khi trao đổi ít message hơn và ngắn hơn, và tốt nhất là giữ tính tương tác ở mức tối thiểu để không bên nào phải chờ nhận một message trước khi gửi message tiếp theo. Thông thường, bạn có thể đo hiệu quả của một protocol thông qua thời lượng của nó tính theo round trip, tức thời gian cần để gửi một message và nhận một response.

Round-trip time thường là nguyên nhân chính gây ra độ trễ trong các protocol, nhưng lượng tính toán mà các bên phải thực hiện cũng đáng kể; càng ít phép tính bắt buộc và càng nhiều phần có thể tính trước thì càng tốt. Ví dụ, key agreement protocol 4G/5G trao đổi hai message, mỗi message dài vài trăm bit, phải được gửi theo một thứ tự nhất định. Bạn có thể dùng precomputation với protocol này để tiết kiệm thời gian, vì nhà mạng có thể chọn trước nhiều giá trị R; tính trước các giá trị SK, V<sub>1</sub> và V<sub>2</sub> tương ứng; và lưu tất cả chúng trong một database. Trong trường hợp này, precomputation có lợi thế là giảm việc để lộ key long-term.

## Các protocol Diffie–Hellman (Diffie–Hellman Protocols)

Diffie–Hellman function là cốt lõi của phần lớn các public-key agreement protocol đã được triển khai—ví dụ, trong TLS và SSH. Tuy nhiên, không có một protocol Diffie–Hellman duy nhất mà có nhiều cách khác nhau để dùng DH function nhằm thiết lập một shared secret. Chúng ta sẽ xem xét ba protocol trong các mục sau. Trong mỗi phần thảo luận, tôi sẽ dùng các tên đại diện quen thuộc trong crypto và gọi hai bên là Alice và Bob, còn kẻ tấn công là Eve. Tôi sẽ viết g là generator của group được dùng cho các phép toán số học, một giá trị cố định và được Alice, Bob và Eve biết trước.

### Anonymous Diffie–Hellman

Anonymous Diffie–Hellman là protocol Diffie–Hellman đơn giản nhất. Nó là anonymous (ẩn danh) vì nó không được xác thực; các bên tham gia không có danh tính cryptography nào mà bên kia có thể xác minh, và không bên nào giữ key long-term. Alice không thể chứng minh với Bob rằng cô ấy là Alice, và ngược lại.

Trong anonymous Diffie–Hellman, mỗi bên chọn một giá trị ngẫu nhiên (a cho Alice và b cho Bob) để dùng làm private key và gửi public key tương ứng cho bên kia. Hình 11-2 cho thấy quá trình chi tiết hơn.

![Figure 11-2](images/ch11_diffie_hellman/fig11-2.png)

Hình 11-2: Protocol anonymous Diffie–Hellman

Alice dùng số mũ a của mình và cơ số g của group để tính A = g<sup>a</sup>, rồi gửi cho Bob. Bob nhận A và tính A<sup>b</sup>, bằng (g<sup>a</sup>)<sup>b</sup>. Giờ Bob có được giá trị g<sup>ab</sup> và tính B từ số mũ ngẫu nhiên b của mình và giá trị g. Sau đó, anh ấy gửi B cho Alice, và cô ấy dùng nó để tính g<sup>ab</sup>. Alice và Bob cuối cùng có cùng giá trị, g<sup>ab</sup>, sau khi thực hiện các phép toán tương tự nhau, bao gồm việc nâng cả g lẫn giá trị nhận được lên lũy thừa private exponent của họ. Một protocol đơn giản, chỉ an toàn trước những kẻ tấn công lười biếng nhất.

Kẻ tấn công có thể hạ gục anonymous DH bằng một man-in-the-middle attack. Một network attacker chỉ cần chặn các message và giả làm Bob (với Alice) và giả làm Alice (với Bob), như Hình 11-3 mô tả.

![Figure 11-3](images/ch11_diffie_hellman/fig11-3.png)

Hình 11-3: Một man-in-the-middle attack nhắm vào protocol anonymous Diffie–Hellman

Như trong lần trao đổi trước, Alice và Bob chọn các số mũ ngẫu nhiên, a và b. Bây giờ Alice tính và gửi A, nhưng Eve chặn và bỏ message đó. Sau đó, Eve chọn một số mũ ngẫu nhiên, c, và tính C = g<sup>c</sup> để gửi cho Bob. Vì protocol này không có authentication, Bob tin rằng anh ấy đang nhận C từ Alice và tiếp tục tính g<sup>bc</sup>. Sau đó, Bob tính B và gửi giá trị đó cho Alice, nhưng Eve lại chặn và bỏ message đó. Giờ Eve tính g<sup>bc</sup>; chọn một số mũ mới, d; tính g<sup>ad</sup>; tính D từ g<sup>d</sup>; và gửi D cho Alice. Sau đó, Alice cũng tính g<sup>ad</sup>.

Kết quả của attack này là kẻ tấn công Eve dùng chung một bí mật với Alice (g<sup>ad</sup>) và một bí mật khác với Bob (g<sup>bc</sup>), trong khi Alice và Bob tin rằng họ đang dùng chung một bí mật duy nhất với nhau. Sau khi hoàn tất việc thực thi protocol, Alice suy ra các symmetric key từ g<sup>ad</sup> để mã hóa dữ liệu gửi cho Bob, nhưng Eve chặn các message đã mã hóa, giải mã chúng, và mã hóa lại chúng gửi cho Bob bằng một bộ key khác được suy ra từ g<sup>bc</sup>—sau khi có thể đã sửa đổi cleartext. Tất cả những điều này xảy ra mà Alice và Bob không hề hay biết; họ đã tiêu rồi.

Để vô hiệu hóa attack này, bạn cần một cách xác thực các bên để Alice có thể chứng minh cô ấy là Alice thật và Bob có thể chứng minh anh ấy là Bob thật. May thay, có một cách để làm điều đó.

### Authenticated Diffie–Hellman

Authenticated Diffie–Hellman giải quyết các man-in-the-middle attack có thể ảnh hưởng đến anonymous DH. Authenticated DH trang bị cho hai bên cả private key lẫn public key, nhờ đó cho phép Alice và Bob ký message của họ để ngăn Eve gửi message thay mặt họ. Ở đây, các chữ ký không được tính bằng DH function mà bằng một public-key signature scheme như RSA-PSS. Kết quả là, để gửi thành công message thay mặt Alice, kẻ tấn công cần làm giả một chữ ký hợp lệ, điều không thể với một signature scheme an toàn. Hình 11-4 cho thấy authenticated DH hoạt động như thế nào.

![Figure 11-4](images/ch11_diffie_hellman/fig11-4.png)

Hình 11-4: Protocol authenticated Diffie–Hellman

Nhãn Alice (priv<sub>A</sub>, pub<sub>B</sub>) trên dòng đầu tiên nghĩa là Alice giữ private key của riêng mình, priv<sub>A</sub>, cũng như public key của Bob, pub<sub>B</sub>. Cặp key priv/pub này được gọi là long-term key vì nó cố định từ trước và không thay đổi qua các lần chạy liên tiếp của protocol. Alice có thể dùng cặp key priv<sub>A</sub>/pub<sub>A</sub> của mình với các bên khác ngoài Bob, chừng nào họ biết pub<sub>A</sub> (làm thế nào họ biết được nó là một câu hỏi khác và là một trong những vấn đề vận hành khó nhất trong cryptography). Các private key long-term này phải được giữ bí mật, trong khi các public key được coi là kẻ tấn công đã biết.

Alice và Bob bắt đầu bằng cách chọn các số mũ ngẫu nhiên, a và b, như trong anonymous DH. Sau đó, Alice tính A và một chữ ký sig<sub>A</sub> dựa trên sự kết hợp của signing function sign của cô ấy, private key priv<sub>A</sub> của cô ấy, và A. Giờ Alice gửi A và sig<sub>A</sub> cho Bob, và anh ấy xác minh sig<sub>A</sub> bằng public key pub<sub>A</sub> của cô ấy. Nếu chữ ký không hợp lệ, Bob biết rằng message không đến từ Alice, và anh ấy loại bỏ A.

Nếu chữ ký đúng, Bob tính g<sup>ab</sup> từ A và số mũ ngẫu nhiên b của mình. Sau đó, anh ấy tính B và chữ ký của chính mình từ sự kết hợp của function sign, private key priv<sub>B</sub> của mình, và B. Anh ấy gửi B và sig<sub>B</sub> cho Alice, và cô ấy cố gắng xác minh sig<sub>B</sub> bằng public key pub<sub>B</sub> của Bob. Alice chỉ tính g<sup>ab</sup> nếu chữ ký của Bob được xác minh thành công.

#### Security trước network attacker (Security Against Network Attackers)

Authenticated DH an toàn trước network attacker vì họ không thể biết được bất kỳ bit thông tin nào về shared secret g<sup>ab</sup>, vì họ không biết các số mũ DH. Authenticated DH cũng cung cấp forward secrecy: ngay cả khi kẻ tấn công xâm phạm bất kỳ bên nào tại một thời điểm nào đó, như trong breach attack model đã thảo luận trước đó, họ sẽ biết được các private signing key nhưng không biết bất kỳ số mũ DH tạm thời (ephemeral) nào; do đó, họ sẽ không thể biết giá trị của bất kỳ shared secret nào trước đó.

Biến thể authenticated của DH chỉ cung cấp sự bảo vệ một phần đối với key control. Alice không thể tạo ra các giá trị a đặc biệt để giới hạn sự lựa chọn của shared secret g<sup>ab</sup>, vì cô ấy chưa biết g<sup>b</sup>, thứ ảnh hưởng đến kết quả nhiều ngang a. (Một ngoại lệ là nếu Alice chọn a = 0, khi đó bạn sẽ có g<sup>ab</sup> = 1 với mọi b. Do đó, protocol phải từ chối 0, dù các implementation có thể không làm vậy trong thực tế.) Tuy nhiên, Bob có thể thử nhiều giá trị b cho đến khi tìm được một giá trị “hợp ý anh ấy”; ví dụ, giá trị mà g<sup>ab</sup> có những tính chất nhất định, như 16 bit đầu tiên của nó đều là 1.

Bạn có thể loại bỏ quyền lực của Bob đối với giá trị của bí mật bằng cách để Bob gửi Hash(g<sup>b</sup>) cho Alice như message đầu tiên, trước khi Alice gửi g<sup>a</sup> của cô ấy. Tôi sẽ để bạn tự phân tích sửa đổi này và hiểu vì sao nó có tác dụng (message mới được gửi là một commitment đối với public key của Bob).

Authenticated DH còn có những hạn chế khác. Trước hết, Eve có thể giả làm Alice bằng cách ghi lại các giá trị A và sig<sub>A</sub> trước đó và phát lại chúng cho Bob. Bob nhầm tưởng rằng anh ấy đang dùng chung một bí mật với Alice, dù Eve không thể biết được bí mật đó vì cô ta không biết bí mật a của Alice. Do đó, cô ta sẽ không thể tính B<sup>a</sup> từ B mà Bob gửi.

Bạn có thể loại bỏ rủi ro này bằng cách thêm một thủ tục key confirmation, trong đó Alice và Bob chứng minh với nhau rằng họ sở hữu shared secret. Ví dụ, Alice và Bob có thể thực hiện key confirmation bằng cách lần lượt gửi Hash(pub<sub>A</sub> || pub<sub>B</sub> || g<sup>ab</sup>) và Hash(pub<sub>B</sub> || pub<sub>A</sub> || g<sup>ab</sup>), với một hash function Hash nào đó. Cả hai bên có thể xác minh tính đúng đắn của các hash value này bằng cách tính lại kết quả của nó. Thứ tự khác nhau của các public key pub<sub>A</sub> || pub<sub>B</sub> và pub<sub>B</sub> || pub<sub>A</sub> bảo đảm rằng Alice và Bob sẽ gửi các giá trị khác nhau và kẻ tấn công không thể giả làm Alice bằng cách sao chép hash value của Bob.

#### Security trước data leak (Security Against Data Leaks)

Lỗ hổng của authenticated DH trước kẻ tấn công data leak đáng lo ngại hơn. Trong loại attack này, kẻ tấn công biết được giá trị của các bí mật tạm thời, short-term (cụ thể là các số mũ a và b), và dùng thông tin đó để mạo danh một trong các bên liên lạc. Nếu Eve biết được giá trị của một số mũ a cùng với giá trị sig<sub>A</sub> được gửi cho Bob, cô ta có thể khởi tạo một lần thực thi protocol mới và mạo danh Alice, như Hình 11-5 minh họa.

![Figure 11-5](images/ch11_diffie_hellman/fig11-5.png)

Hình 11-5: Một impersonation attack nhắm vào protocol authenticated Diffie–Hellman

Trong kịch bản attack này, Eve biết được giá trị của một a và phát lại A tương ứng cùng chữ ký sig<sub>A</sub> của nó, giả làm Alice. Bob xác minh chữ ký và tính g<sup>ab</sup> từ A rồi gửi B và sig<sub>B</sub>, mà Eve sau đó dùng để tính g<sup>ab</sup>, nhờ a đã đánh cắp. Kết quả là hai bên có một shared secret. Giờ Bob tin rằng anh ấy đang nói chuyện với Alice.

Bạn có thể bảo vệ authenticated DH trước việc rò rỉ các bí mật ephemeral bằng cách tích hợp các long-term key vào phép tính shared secret để bạn không thể xác định shared secret nếu không biết bí mật long-term.

### Menezes–Qu–Vanstone

Protocol Menezes–Qu–Vanstone (MQV) là một cột mốc trong lịch sử các protocol DH-based. Được thiết kế năm 1998, MQV đã được chấp thuận để bảo vệ những tài sản quan trọng nhất khi NSA đưa nó vào Suite B, một danh mục các algorithm được thiết kế để bảo vệ thông tin mật. (NSA cuối cùng đã bỏ MQV, được cho là vì nó không được dùng. Tôi sẽ thảo luận lý do ngay sau đây.)

MQV là Diffie–Hellman được tăng cường mạnh mẽ (on steroids). Nó an toàn hơn authenticated DH, và nó cải thiện các tính chất hiệu năng của authenticated DH. Đặc biệt, MQV cho phép người dùng chỉ gửi hai message, độc lập với nhau, theo thứ tự tùy ý. Người dùng cũng có thể gửi message ngắn hơn so với authenticated DH, và họ không cần gửi các message chữ ký hay xác minh tường minh. Nói cách khác, bạn không cần dùng một signature scheme bên cạnh Diffie–Hellman function.

Cũng như với authenticated DH, trong MQV Alice và Bob mỗi người giữ một private key long-term cũng như public key long-term của bên kia. Khác biệt là các key MQV không phải là signing key: chúng gồm một private exponent, x, và một public value, g<sup>x</sup>. Hình 11-6 cho thấy hoạt động của protocol MQV.

![Figure 11-6](images/ch11_diffie_hellman/fig11-6.png)

Hình 11-6: Protocol MQV

x và y lần lượt là các private key long-term của Alice và Bob, còn X và Y là các public key của họ. Bob và Alice bắt đầu với private key của chính mình và public key của nhau, là g lũy thừa một private key. Mỗi người chọn một số mũ ngẫu nhiên, rồi Alice tính A và gửi cho Bob, sau đó Bob tính B và gửi cho Alice. Khi Alice nhận được public key ephemeral B của Bob, cô ấy kết hợp nó với private key long-term x của mình, private key ephemeral a của mình, và public key long-term Y của Bob bằng cách tính kết quả của (B × Y<sup>B</sup>)<sup>a + xA</sup>, như trong Hình 11-6. Khai triển biểu thức này, bạn có được như sau:

![p256_1](images/ch11_diffie_hellman/p256_1.png)

Trong khi đó, Bob tính kết quả của (A × X<sup>A</sup>)<sup>b + yB</sup>, và bạn có thể kiểm chứng rằng nó bằng giá trị Alice đã tính:

![p256_2](images/ch11_diffie_hellman/p256_2.png)

Bạn có được cùng một giá trị cho cả Alice và Bob, g<sup>(b + yB)(a + xA)</sup>, điều này cho bạn biết rằng Alice và Bob dùng chung cùng một bí mật.

Khác với authenticated DH, bạn không thể phá MQV chỉ bằng việc rò rỉ các bí mật ephemeral. Việc biết a hoặc b sẽ không cho phép kẻ tấn công xác định shared secret cuối cùng, vì họ cần các private key long-term để tính nó.

Điều gì xảy ra trong attack model mạnh nhất, breach model, khi một key long-term bị xâm phạm? Nếu Eve xâm phạm private key long-term x của Alice, các shared secret đã được thiết lập trước đó vẫn an toàn, vì việc tính chúng còn liên quan đến các private key ephemeral của Alice.

Tuy nhiên, MQV không cung cấp perfect forward secrecy do attack sau. Ví dụ, giả sử Eve chặn message A của Alice và thay nó bằng A = g<sup>a</sup> của cô ta với một a nào đó mà Eve chọn. Trong lúc đó, Bob gửi B cho Alice (và Eve ghi lại giá trị của B) và tính key dùng chung. Nếu sau đó Eve xâm phạm private key long-term x của Alice, cô ta có thể xác định key mà Bob đã tính trong session này. Điều này phá vỡ forward secrecy, vì Eve giờ đã khôi phục được shared secret của một lần thực thi protocol trước đó. Tuy nhiên, trong thực tế, bạn có thể loại bỏ rủi ro này bằng một bước key-confirmation, trong đó Alice và Bob sẽ nhận ra rằng họ không dùng chung cùng một key, và họ sẽ hủy protocol trước khi suy ra bất kỳ session key nào.

Dù thanh lịch và an toàn, MQV hiếm khi được dùng trong thực tế vì một vài lý do. Nó từng bị ràng buộc bởi bằng sáng chế, điều đã cản trở việc nó được chấp nhận rộng rãi. Nó cũng khó làm đúng hơn vẻ ngoài. Thực tế, khi cân nhắc với độ phức tạp tăng thêm của nó, lợi ích security của MQV thường được coi là thấp so với authenticated DH đơn giản hơn.

## Những gì có thể sai (How Things Can Go Wrong)

Các protocol Diffie–Hellman có thể thất bại một cách ngoạn mục theo nhiều cách. Các mục sau nêu bật một số trường hợp thường thấy trong thực tế.

### Không hash shared secret (Not Hashing the Shared Secret)

Tôi đã ám chỉ đến thực tế rằng shared secret kết thúc một lần trao đổi session DH (g<sup>ab</sup> trong các ví dụ của chúng ta) được lấy làm đầu vào để suy ra session key nhưng tự nó không phải là một key. Và nó không nên là một key. Một symmetric key phải trông ngẫu nhiên, và mỗi bit phải là 0 hoặc 1 với cùng xác suất. Nhưng g<sup>ab</sup> không phải là một chuỗi ngẫu nhiên; nó là một phần tử ngẫu nhiên trong một group toán học nào đó mà các bit của nó có thể bị lệch về 0 hoặc 1. Một phần tử group ngẫu nhiên khác với một chuỗi bit ngẫu nhiên.

Ví dụ, hãy tưởng tượng bạn đang làm việc trong multiplicative group Z<sub>13</sub><sup>\*</sup> = {1, 2, 3, . . . , 12} dùng g = 2 làm generator của group, nghĩa là g<sup>i</sup> bao phủ mọi giá trị của Z<sub>13</sub><sup>\*</sup> với i trong 1, 2, . . . 12: g<sup>1</sup> = 2, g<sup>2</sup> = 4, g<sup>3</sup> = 8, g<sup>4</sup> = 3, v.v. Nếu số mũ của g là ngẫu nhiên, bạn sẽ có được một phần tử ngẫu nhiên của Z<sub>13</sub><sup>\*</sup>, nhưng việc encode một phần tử Z<sub>13</sub><sup>\*</sup> thành một chuỗi 4-bit sẽ không ngẫu nhiên đều: không phải mọi bit đều có cùng xác suất là 0 hay 1. Trong Z<sub>13</sub><sup>\*</sup>, bảy giá trị có bit có trọng số cao nhất là 0 (các số từ 1 đến 7 trong group), nhưng chỉ năm giá trị có bit có trọng số cao nhất là 1 (từ 8 đến 12). Tức là bit này bằng 0 với xác suất 7/12 ≈ 0.58, trong khi một bit ngẫu nhiên lý tưởng phải bằng 0 với xác suất 0.5. Hơn nữa, các chuỗi 4-bit 1101, 1110 và 1111 sẽ không bao giờ xuất hiện.

Để tránh những độ lệch như vậy trong các session key được suy ra từ một DH shared secret, hãy dùng một cryptographic hash function như BLAKE3 hoặc SHA-3—hoặc tốt hơn nữa, một key derivation function (KDF). Một ví dụ về cấu trúc KDF là HKDF, hay KDF HMAC-based (như được đặc tả trong RFC 5869), nhưng ngày nay BLAKE2 và SHA-3 có các mode chuyên dụng để hoạt động như KDF.

### Anonymous Diffie–Hellman từ TLS 1.0

Protocol TLS là nền tảng security đằng sau các website an toàn HTTPS cũng như nhiều protocol khác, như truyền email bằng Simple Mail Transfer Protocol (SMTP). TLS nhận nhiều tham số, bao gồm loại protocol Diffie–Hellman mà nó sẽ dùng. Vì lý do tương thích ngược, TLS hỗ trợ anonymous DH từ phiên bản 1.0 đến phiên bản 1.2 (tức là không có bất kỳ server authentication nào), dù không có trong phiên bản 1.3. Vì DH chỉ an toàn trước kẻ tấn công thụ động, nó có thể tạo ra một ấn tượng sai lầm về security.

Tài liệu gốc của TLS mô tả các rủi ro của protocol này (https://www.rfc-editor.org/rfc/rfc2246):

> Các kết nối hoàn toàn ẩn danh chỉ cung cấp sự bảo vệ trước việc nghe lén thụ động. Trừ khi một kênh tamper-proof độc lập được dùng để xác minh rằng các message finished không bị kẻ tấn công thay thế, server authentication là bắt buộc trong những môi trường mà các man-in-the-middle attack chủ động là một mối lo ngại.

### Tham số group không an toàn (Unsafe Group Parameters)

Tháng Một năm 2016, những người bảo trì bộ công cụ OpenSSL đã sửa một lỗ hổng high-severity (CVE-2016-0701) cho phép kẻ tấn công khai thác các tham số Diffie–Hellman không an toàn. Nguyên nhân gốc rễ của lỗ hổng là OpenSSL cho phép người dùng làm việc với các tham số DH group không an toàn (cụ thể là một số nguyên tố p không an toàn) thay vì báo lỗi và hủy toàn bộ protocol trước khi thực hiện bất kỳ phép toán số học nào.

Về cơ bản, OpenSSL chấp nhận một số nguyên tố p mà multiplicative group Z<sub>p</sub><sup>\*</sup> của nó (nơi diễn ra mọi phép toán DH) chứa các subgroup nhỏ. Như bạn đã học ở đầu chương này, sự tồn tại của các subgroup nhỏ trong một group lớn hơn trong một cryptographic protocol là điều xấu, vì nó giới hạn các shared secret vào một tập giá trị khả dĩ nhỏ hơn nhiều so với khi dùng toàn bộ group Z<sub>p</sub><sup>\*</sup>. Tệ hơn nữa, kẻ tấn công có thể tạo ra một số mũ DH x mà, khi kết hợp với public key g<sup>y</sup> của nạn nhân, sẽ để lộ thông tin về private key y và cuối cùng là toàn bộ nó.

Dù lỗ hổng thực tế là từ năm 2016, nguyên lý mà attack dùng đã có từ bài báo năm 1997 “A Key Recovery Attack on Discrete Log-based Schemes Using a Prime Order Subgroup” của Chae Hoon Lim và Pil Joong Lee. Cách sửa lỗ hổng rất đơn giản: khi chấp nhận một số nguyên tố p làm group modulus, protocol phải kiểm tra rằng p là một safe prime bằng cách kiểm chứng rằng (p – 1) / 2 cũng là số nguyên tố để bảo đảm rằng group Z<sub>p</sub><sup>\*</sup> sẽ không có các subgroup nhỏ và một attack nhắm vào lỗ hổng này sẽ thất bại.

## Đọc thêm (Further Reading)

Bạn có thể tìm hiểu sâu hơn về các DH key agreement protocol bằng cách đọc một số tiêu chuẩn và ấn phẩm chính thức, bao gồm ANSI X9.42, RFC 2631 và RFC 5114, IEEE 1363, và NIST SP 800-56A. Chúng đóng vai trò tài liệu tham khảo để bảo đảm khả năng tương tác và đưa ra khuyến nghị về các tham số group.

Để tìm hiểu thêm về các protocol DH nâng cao (như MQV và các họ hàng của nó HMQV và OAKE, cùng những protocol khác) và các security notion của chúng (bao gồm unknown-key share attack và group representation attack), hãy đọc bài báo năm 2005 “HMQV: A High-Performance Secure Diffie–Hellman Protocol” của Hugo Krawczyk (https://eprint.iacr.org/2005/176) và bài báo năm 2011 “A New Family of Implicitly Authenticated Diffie–Hellman Protocols” của Andrew C. Yao và Yunlei Zhao (https://eprint.iacr.org/2011/035). Các bài báo này biểu diễn các phép toán Diffie–Hellman khác với chương này. Ví dụ, họ biểu diễn shared secret là xP thay vì g<sup>x</sup>. Nói chung, bạn sẽ thấy phép nhân được thay bằng phép cộng và phép lũy thừa được thay bằng phép nhân, vì những protocol đó thường không được định nghĩa trên các group số nguyên mà trên elliptic curve, như bạn sẽ học trong Chương 12.
