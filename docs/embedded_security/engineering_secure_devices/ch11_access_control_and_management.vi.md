<a id="ch11"></a>

# <a id="page_199"></a>11 KIỂM SOÁT VÀ QUẢN LÝ TRUY CẬP (ACCESS CONTROL AND MANAGEMENT)

Trong các hệ thống IT, việc quản lý người dùng và quyền có truyền thống lâu đời vì con người đã đóng vai trò trung tâm ngay từ đầu. Ngược lại, embedded system trong quá khứ không được dự định cho việc tương tác và thường chỉ có một vài user hay thậm chí chỉ một system user duy nhất.

Ngày nay, với độ phức tạp ngày càng tăng của các mô hình kinh doanh và kịch bản ứng dụng IoT, nhiều bên tham gia vào các quy trình life-cycle của thiết bị IoT—từ developer đến nhân viên bảo trì đến các nhà cung cấp dịch vụ third-party đến chính người dùng cuối. Thiết bị phải có khả năng *xử lý* tất cả các vai trò này và *tách biệt* chúng với nhau. Hơn nữa, các process và ứng dụng nội bộ chạy trên thiết bị của bạn cũng sẽ đòi hỏi các quyền khác nhau để hoàn thành mục đích của chúng. Việc hạn chế chúng theo nguyên tắc least privilege có thể cứu thiết bị của bạn khỏi thiệt hại nghiêm trọng.

Chương này bắt đầu bằng việc xem xét nhiều tình huống mà access control có thể đóng góp quan trọng vào bảo mật thiết bị. Sau đó, tôi giải thích các khái niệm phổ biến bạn có thể dùng để triển khai các hạn chế truy cập trên thiết bị chạy Linux. Case study ở cuối chương hé lộ các khả năng thực tế của việc hạn chế process bằng công cụ AppArmor.

<a id="ch00lev1_89"></a>

## <a id="page_200"></a>Các mối đe dọa hằng ngày

Việc rò rỉ và xâm phạm cơ sở dữ liệu xảy ra gần như mỗi ngày. Thường thì dữ liệu do tội phạm công bố hay bán chứa các danh sách dài username và mật khẩu. Credential cho các thiết bị IoT của bạn có thể nằm trong số những bí mật đó, cho phép đối thủ đăng nhập vào sản phẩm của bạn. Bạn có thể vội kết luận rằng đây là rủi ro của khách hàng và bạn không có trách nhiệm gì trong trường hợp credential bị đánh cắp, nhưng điều đó không hoàn toàn đúng.

Bạn phải tự hỏi ít nhất hai câu hỏi: “Chúng ta đã tách các tài khoản end-user khỏi các tài khoản nhà sản xuất chưa?” và “Chúng ta đã hạn chế các tài khoản end-user đó nhiều nhất có thể để khoanh vùng thiệt hại trong trường hợp credential bị lộ chưa?” Nếu bạn không xem xét những chủ đề này, chúng có thể phản tác dụng như boomerang và ít nhất là ảnh hưởng tiêu cực đến danh tiếng sản phẩm của bạn.

Thường xuyên, những người làm penetration testing, các nhà nghiên cứu bảo mật hay thậm chí khách hàng xác định được các lỗ hổng chưa biết trong sản phẩm. Và xác suất xảy ra vấn đề bảo mật tăng theo độ phức tạp của thiết bị và phần mềm cũng như số lượng dịch vụ được phơi ra trên các network interface. Mặc dù bạn có thể đã thiết lập một quy trình vulnerability-management vững chắc, như được mô tả trong [Chương 1](ch01_secure_development_process.vi.md#ch01), và thậm chí đã chuẩn bị để triển khai cập nhật an toàn, như được giải thích trong [Chương 9](ch09_secure_firmware_update.vi.md#ch09), sản phẩm của bạn vẫn có thể có lỗ hổng trong một khung thời gian nhất định. Nếu một trường hợp như vậy dẫn đến các cuộc tấn công ngoài hiện trường ảnh hưởng đáng kể đến thiết bị của bạn, câu hỏi hiển nhiên mà các chuyên gia sẽ đặt ra là, “Tại sao ứng dụng có lỗ hổng lại có thể gây tác động lên mọi phần của hệ thống trong khi nó có mục đích khá hạn chế?”

Hiện nay, một chủ đề phổ biến giữa các nhà sản xuất trong nhiều ngành là việc biến thiết bị của họ thành các *nền tảng* (platform) có thể cài đặt và chạy app từ một marketplace tương ứng, marketplace này đến lượt nó được cung cấp bởi các developer app trên khắp thế giới. Một lần nữa, có vẻ hiển nhiên rằng những developer đó chịu trách nhiệm về bảo mật app của họ. Tuy nhiên, nếu một lỗ hổng thực sự bị khai thác trong một app, chính các nhà thiết kế nền tảng có trách nhiệm bảo vệ các process và cấu hình hệ thống cũng như các app khác khỏi app gây rắc rối đó.

Đôi khi access control chỉ được xem xét ở mức phần mềm hay OS. Tuy nhiên, có một mối đe dọa bổ sung có ý nghĩa đáng kể đối với embedded system: truy cập vật lý. Kẻ tấn công cũng như người làm penetration testing và nhà nghiên cứu có thể phân tích một thiết bị về mặt vật lý bằng cách tương tác với các interface (debug) cục bộ như JTAG, Universal Asynchronous Receiver-Transmitter (UART) hay bus Inter-Integrated Circuit (I<sup>2</sup>C).

Việc giảm thiểu mối đe dọa này bằng cách tuyên bố rằng “không ai sẽ mở thiết bị của chúng ta ra” và, ngay cả khi có, “phần bên trong phức tạp đến mức ngay cả kỹ sư của chúng ta cũng không biết hết mọi chi tiết” là phổ biến, nhưng hiếm khi hợp lý. Những kẻ tấn công quan tâm chắc chắn sẽ tháo vỏ sản phẩm và tìm các interface cục bộ, và nếu họ có một động lực nhất định, họ cũng sẽ sẵn lòng dành thời gian reverse engineering thủ công thiết bị cho đến khi đạt được mục tiêu.

<a id="ch00lev1_90"></a>

## <a id="page_201"></a>Access control và khoanh vùng thiệt hại

Trong nhiều trường hợp, việc quản lý access-control vững chắc có thể giảm hay thậm chí ngăn chặn tác động của một cuộc tấn công. Đó là một ví dụ hoàn hảo về cách kỹ sư và developer có thể thực hiện nghiêm túc nguyên tắc defense in depth. Nếu một lớp bảo mật, như confidentiality của credential người dùng, thất bại hay một lỗ hổng phần mềm chưa biết bị phát hiện, lớp access-control sẽ vào cuộc và ngăn chặn những hậu quả tồi tệ nhất.

Tuy nhiên, điều này chỉ hoạt động nếu bạn có một cơ sở vững chắc để quyết định có nên cấp quyền truy cập không và, nếu có, thực sự cần bao nhiêu quyền truy cập. Bạn nên tính đến nhiều thuộc tính khi cấp cho một user quyền truy cập vào một đối tượng như file hay tài nguyên phần cứng.

Quyền có thể được cấp hay từ chối dựa trên định danh của user, đôi khi được biết đến là *identity-based access control (IBAC)*. Tuy nhiên, quản lý từng user hay từng người một cách độc lập có thể quá phức tạp. Do đó, *role-based access control (RBAC)*, vốn đặt quyền theo vai trò của user, đã trở nên phổ biến. Điều này không chỉ làm việc quản lý quyền dễ dàng hơn mà còn đòi hỏi bạn phải gán vai trò một cách tường minh cho mọi user, điều làm tăng tính minh bạch.

Một cách tiếp cận access-control khác nữa dựa vào các attribute của chủ thể, đối tượng và có thể cả môi trường của chúng. Được biết đến là *attribute-based access control (ABAC)*, nó cho phép các quyết định truy cập động hơn IBAC hay RBAC.

Một chiến lược phổ biến để tối ưu hóa access control về mặt bảo mật là giảm quyền xuống mức tối thiểu cần thiết cho một user hay ứng dụng cho trước. Tuy nhiên, đó chính là mấu chốt của vấn đề, vì những yêu cầu tối thiểu đó thường không được biết một cách tường minh.

Vì vậy, developer thường có xu hướng đặt quyền một cách hào phóng, để lại khoảng trống cho các hoạt động độc hại hay việc bị xâm phạm. Lý do của họ là dễ hiểu vì việc hạn chế user và ứng dụng quá nhiều có thể khiến thiết bị không hoạt động được. Và, làm tình hình tệ hơn, nhiệm vụ của một user và đặc quyền truy cập của một ứng dụng có thể thay đổi theo thời gian. Do đó, điều quan trọng là xem xét việc quản lý access-control từ sớm và toàn diện trong suốt toàn bộ life cycle của thiết bị.

<a id="ch00lev2_134"></a>

### *Giai đoạn thiết kế và phát triển*

Trong quá trình thiết kế phần cứng, các cuộc thảo luận về truy cập vật lý vào chân IC, pad và đường mạch trên PCB nên đã có trong chương trình nghị sự. Việc làm rối các debug port hay phủ nhựa epoxy lên các phần trọng yếu có thể là những giải pháp cần nghĩ đến. Tác động của truy cập vật lý cũng có thể được giảm bằng các công tắc tiếp xúc hay lò xo báo cho processor chính biết vỏ sản phẩm đã bị mở.

Để có bảo mật cao hơn, thậm chí có khả năng tích hợp một cấu trúc lưới dẫn điện vào vỏ nhựa, liên tục chạy tín hiệu trên các đường của nó để phát hiện mọi sự can thiệp vào vỏ. Những cơ chế như vậy đã được dùng trong các thiết bị đầu cuối thanh toán.

<a id="page_202"></a>Một phần quan trọng của việc phát triển firmware là đặc tả các system user, vai trò của họ, các thư mục, file ban đầu và quyền tương ứng. Ngay cả khi điều này thoạt nghe có vẻ tầm thường, hãy bảo đảm tính đến toàn bộ phạm vi các use case dự định của thiết bị. Kết quả phải được triển khai trong build system bạn chọn (ví dụ, Yocto hay Buildroot) và nên được giám sát về tính đúng đắn trong suốt toàn bộ quá trình phát triển.

Tiếp theo, bạn phải phân tích mọi ứng dụng và dịch vụ phần mềm của thiết bị. Một mặt, bạn phải chỉ định mỗi ứng dụng nên chạy trong ngữ cảnh user nào. Điều này định nghĩa các quyền mà một process có lúc runtime, điều trở nên đặc biệt quan trọng khi nó bị một tác nhân có ý đồ xấu chiếm quyền. Hãy cân nhắc kỹ xem root có phải luôn là lựa chọn tốt nhất của bạn không.

Mặt khác, các ứng dụng cũng có thể đóng vai trò chủ động trong việc quản lý access-control. Hãy lấy một web server làm ví dụ. Loại ứng dụng phổ biến này kiểm soát các trang web mà nó phục vụ cho các client kết nối tới. Một số phần của web interface, như trang quản trị thiết bị, có thể trọng yếu hơn các phần khác. Dựa trên các user của OS hay hệ thống quản lý user riêng của web server, server phải được cấu hình phù hợp để chỉ cấp quyền admin cho các user hợp lệ.

Dĩ nhiên, ứng dụng có thể có nhiều user “admin”: một `webadmin` cho các tác vụ quản trị do ứng dụng web thực hiện, một `sysadmin` cho việc quản trị hệ thống Linux, và có thể một `superadmin` được dùng cho truy cập của nhà sản xuất. Và tất cả chúng đều có các quyền khác nhau.

<a id="ch00lev2_135"></a>

### *Các cân nhắc về sản xuất*

Việc sản xuất thiết bị thường không được coi là một bước quan trọng trong việc quản lý access-control, nhưng ngày càng nhiều tiêu chuẩn—ví dụ, ETSI EN 303 645 của châu Âu cho điện tử tiêu dùng—đòi hỏi thiết bị không được triển khai mật khẩu mặc định toàn cục. Vì firmware của thiết bị thường là một artifact toàn cục tĩnh, một mật khẩu device-individual phải được tạo và đặt trong quá trình sản xuất.

Và không chỉ firmware phải được cá nhân hóa. Một mẩu giấy, một nhãn dán hay một phần bao bì sản phẩm cũng phải được ghi mật khẩu riêng. Quy trình này phụ thuộc nhiều vào cấu trúc firmware của thiết bị và các quy trình sản xuất của bạn.

Một lựa chọn thay thế cho việc tạo mật khẩu in-production là buộc người dùng cuối đặt một mật khẩu mới, tùy chỉnh ở lần đăng nhập đầu tiên. Ưu điểm của cách tiếp cận này là bạn có thể dùng một firmware image duy nhất, toàn cục, dễ xử lý hơn nhiều trong quá trình sản xuất. Tuy nhiên, sản phẩm của bạn cũng còn lại một mật khẩu mặc định chung có thể được dùng ít nhất một lần trong quá trình khởi tạo—bởi cả người dùng lẫn đối thủ.

<a id="ch00lev2_136"></a>

### <a id="page_203"></a>*Hoạt động của khách hàng và ngừng sử dụng*

Ngoài hiện trường, khách hàng có thể muốn tự tạo thêm user hay thay đổi quyền của các tài khoản cho trước. Bạn phải quyết định xem điều đó có nên khả thi không và, nếu có, trong giới hạn nào. Cho phép khách hàng tự do chọn quyền cần cấp có thể dẫn đến *elevation of privilege* (leo thang đặc quyền), khiến người dùng cuối nhận được nhiều quyền hơn so với ý định ngầm.

Việc thay đổi mật khẩu thủ công trên hàng trăm thiết bị là cực kỳ tẻ nhạt và cũng error-prone. Do đó, các hạ tầng IoT hiện đại đòi hỏi quản lý tập trung các asset và cấu hình—bao gồm user, vai trò và quyền—để có thể quản lý được. Đối với các nhà sản xuất thiết bị, việc chuẩn bị cho thiết bị hỗ trợ tích hợp Lightweight Directory Access Protocol (LDAP) hay tương tự có thể hợp lý để giúp quản lý tập trung dễ dàng hơn. Tuy nhiên, hãy bảo đảm xem xét các mối đe dọa tiềm năng khi bạn tin tưởng một server từ xa xử lý user, credential và quyền cho thiết bị của mình.

Như đã đề cập trước đó, các ứng dụng nên bị hạn chế ở mức quyền tối thiểu cần thiết để hoạt động đúng. Tuy nhiên, với mỗi bản cập nhật firmware, các tính năng và hành vi của các thành phần phần mềm của thiết bị có thể thay đổi. Chức năng mới có thể đòi hỏi thêm quyền, và bảo mật nghiêm ngặt có thể trở thành vật cản. Ngoài ra, các bản cập nhật bảo mật có thể loại bỏ các routine phần mềm từng đòi hỏi quyền cụ thể, và những quyền đó sẽ không còn cần thiết sau đó. Nói chung, nếu bạn làm việc với các công cụ hạn chế ứng dụng phần mềm và bạn cập nhật phần mềm đó, bạn luôn phải double-check rằng các quyền liên quan khớp với phiên bản mới.

Cuối cùng nhưng không kém phần quan trọng, bạn phải xem xét rằng thiết bị của bạn có thể được bán lại và được một khách hàng khác sử dụng. Khách hàng đó vẫn nên có khả năng khởi tạo thiết bị và đặt lại user và quyền, nhưng không nên có quyền truy cập vào dữ liệu do chủ sở hữu trước tạo ra. Điều tương tự áp dụng cho việc ngừng sử dụng cuối cùng, khi những người bới thùng rác tò mò hay người buôn phế liệu có thể muốn chiếm được dữ liệu access-restricted. Khách hàng ban đầu nên được cung cấp một nút “xóa mọi dữ liệu riêng tư” thực sự làm đúng như những gì nó nói, và các user mới được thêm vào không nên có khả năng truy cập dữ liệu của người khác ngay cả khi dữ liệu đó chưa được xóa.

<a id="ch00lev1_91"></a>

## Discretionary Access Control

*Discretionary access control (DAC)* là một cách tiếp cận cơ bản để quản lý quyền truy cập của chủ thể và nhóm vào các đối tượng bên trong một hệ thống. Chủ thể trong trường hợp của chúng ta là các user trong Linux OS, trong khi đối tượng có thể là file, thư mục, vị trí memory, giao tiếp liên process (interprocess communication) và mọi loại thiết bị và interface hệ thống. Phương pháp này là *discretionary* (tùy ý) vì quyền đối với một đối tượng nhất định được cấp *theo ý muốn* của một user sở hữu đối tượng cụ thể này; *owner* có thể chuyển quyền cho các user và group khác.

> <a id="page_204"></a>**LƯU Ý**
>
> *Trong các hệ thống Linux, user root là toàn năng. Nó có thể ghi đè các quyền do owner đặt. Do đó, “trở thành root” là một trong những mục tiêu hấp dẫn nhất đối với kẻ tấn công. Đối với developer, điều này có nghĩa là các process có khả năng bị xâm phạm, như mọi ứng dụng lắng nghe trên các port mạng, không bao giờ nên chạy với quyền root!*

<a id="ch00lev2_137"></a>

### *Quyền filesystem của Linux*

Mỗi file đơn lẻ trong một filesystem Linux có một chuỗi quyền đi kèm. Như được thể hiện trong [Listing 11-1](#ch11list01), công cụ `ls` có thể in chuỗi này luôn ở đầu mỗi dòng.

```
# ls -l
-rw-r--r-- 1 root root    23 Apr 30 13:13 README
lrwxrwxrwx 1 root root    17 Apr 30 14:15 current_logfile -> logs/73944561.log
drwxr-xr-x 2 root root  1024 Apr 30 14:14 logs
-rw-r--r-- 1 bob  guest   12 Apr 30 17:15 my_notes.md
# ls -l logs/73944561.log
-rw-r--r-- 1 root root     9 Apr 30 12:20 73944561.log
```

<a id="ch11list01"></a>

*Listing 11-1: Liệt kê quyền file trên Linux*

Các chuỗi nổi bật `root root` cho thấy mọi file đều thuộc sở hữu của user root từ group root, ngoại trừ file *my_notes.md*, thuộc sở hữu của *bob* trong group *guest*. Hơn nữa, ký tự đầu tiên của mỗi dòng chỉ định đó là một file thông thường (`-`), một thư mục (`d`) hay một symbolic link (`l`). Block device (`b`) và character device (`c`) cũng sẽ được chỉ ra ở đó. Chín ký tự tiếp theo biểu diễn các quyền được cấp cho mỗi file. Chúng được chia thành ba nhóm, mỗi nhóm ba ký tự, lần lượt liên quan đến quyền đọc (`r`), ghi (`w`) và thực thi (`x`) của owner, của một group tương ứng và của bất kỳ ai khác.

Ví dụ, file *README* trong [Listing 11-1](#ch11list01) có thể được user root đọc và ghi, nhưng các user khác trong group root chỉ có thể đọc. Quyền đọc cũng được cấp cho bất kỳ user nào khác, bất kể trong group nào, như được chỉ ra bởi `r--` ở cuối.

Bất cứ khi nào bạn đọc các hướng dẫn hay source code third-party cho việc quản lý access-control trên Linux, bạn có thể sẽ gặp một ký hiệu quyền truy cập three-digit hiệu quả. Các chuỗi quyền 9-bit có thể được viết hiệu quả thành ba số bát phân: một cho quyền của owner, một cho quyền của thành viên group, và số cuối cùng đại diện cho tất cả những người khác.

Ví dụ, `777` có nghĩa là mọi người đều có thể đọc, ghi và thực thi một đối tượng cho trước. Ngược lại, `740` nói rằng owner có thể đọc, ghi và thực thi; thành viên group chỉ được phép đọc; và bất kỳ ai khác hoàn toàn không có quyền truy cập. [Bảng 11-1](#ch11tab01) trình bày chi tiết việc chuyển đổi quyền sang số bát phân và ngược lại.

<a id="ch11tab01"></a>

<a id="page_205"></a>**Bảng 11-1:** Biểu diễn bát phân của quyền file trên Linux

| **Bát phân** | **Nhị phân** | **Quyền** |
|---|---|---|
| 0 | 000 | `---` |
| 1 | 001 | `--x` |
| 2 | 010 | `-w-` |
| 3 | 011 | `-wx` |
| 4 | 100 | `r--` |
| 5 | 101 | `r-x` |
| 6 | 110 | `rw-` |
| 7 | 111 | `rwx` |

Hiểu quyền file khá đơn giản, nhưng thư mục hoạt động hơi khác một chút. Ở đó, quyền đọc cho phép liệt kê các mục bên trong một thư mục. Quyền ghi cấp quyền thêm, xóa hay đổi tên các mục trong thư mục. Quyền thực thi cho phép user di chuyển vào thư mục, như bằng lệnh `cd`, và truy cập các file hay thư mục con.

<a id="ch00lev2_138"></a>

### *Quản lý user và group trên Linux*

Trong Linux, có nhiều công cụ để quản lý user và group. Các lệnh cơ bản nhất, có sẵn trong mọi bản phân phối, ngay cả trên embedded system, là:

|  |  |
|---|---|
| `useradd` | Tạo một user mới |
| `usermod` | Sửa đổi thuộc tính của một user hiện có |
| `userdel` | Xóa một user |
| `groupadd` | Tạo một group mới |
| `groupmod` | Sửa đổi thuộc tính của một group hiện có |
| `groupdel` | Xóa một group |

Khi chế tạo các thiết bị an toàn, các lệnh quan trọng nhất là `useradd` và `groupadd`, vì chúng có thể được dùng lúc image-creation để triển khai các user và vai trò được định nghĩa trong một khái niệm access-control đi kèm.

Để tạo user, dĩ nhiên, tên của user mới phải được cung cấp. Các tùy chọn khác bạn có thể muốn chỉ định là *user identifier*—hay *UID* (`--uid`)—của nó, thư mục home của nó (`--home`), và liệu thư mục này có nên được tạo tự động không (`--create-home`). Ngoài ra, bạn có thể định nghĩa liệu một user group cùng tên có nên được tạo không (`--user-group`) và user nên thuộc những group nào (`--groups`). Tùy chọn `--shell` cho phép chỉ định shell được dùng sau khi đăng nhập, nhưng nó cũng có thể được dùng với `false` và `nologin` để vô hiệu hóa việc đăng nhập của user. Cuối cùng, bạn có thể đặt mật khẩu của user (ở dạng đã hash) bằng tùy chọn `--password`.

<a id="page_206"></a>Các tham số chính cần chỉ định để tạo một group bằng `groupadd` là tên của group và, nếu muốn, một *group identifier (GID)* (`--gid`) tương ứng mà bạn có thể dùng để tham chiếu tới group cụ thể đó sau này.

Cả user lẫn group đều có thể được đánh dấu là thuộc về hệ thống (`--system`), trái với việc là user bên ngoài, có lẽ là con người. Những tài khoản hệ thống như vậy nhận một UID/GID từ một dải hệ thống được dành riêng. Ngoài ra, system user không hết hạn và không được tạo thư mục home.

> **LƯU Ý**
>
> *Các công cụ* `useradd` *và* `adduser` *cũng như* `groupadd` *và* `addgroup` *dễ bị nhầm lẫn. Những công cụ được trình bày trong phần này là các phiên bản cơ bản, portable, trong khi những công cụ kia có thể user-friendly hơn trong một phiên tương tác.*

<a id="ch00lev2_139"></a>

### *Quản lý quyền trên Linux*

Để cấu hình owner, group và quyền của file và thư mục, chúng ta cần ba công cụ phổ biến trên các hệ thống Linux:

`chown` Cho phép bạn đổi owner của một file hay thư mục sang một owner khác. Ví dụ, owner của file *web.conf* có thể được đặt thành *bob* bằng `chown bob web.conf`.

`chgrp` Chỉ định một group mới cho một file hay thư mục cho trước. Ví dụ, group của thư mục *manuals* có thể được đổi thành *guest* bằng `chgrp guest manuals`.

`chmod` Thao tác quyền cho file và thư mục. Lời gọi `chmod +x script.sh` thêm quyền thực thi cho file *script.sh*, trong khi `chmod -wx script.sh` gỡ bỏ quyền ghi và thực thi. Cả hai chỉ ảnh hưởng đến quyền của owner. Bằng cách đặt phía trước `g` cho group, `o` cho others, `u` cho users/owners và `a` cho all, bạn cũng có thể chỉ định phần nào của chuỗi quyền nên bị ảnh hưởng. Ví dụ, `chmod go-rwx private.key` gỡ bỏ mọi quyền truy cập file *private.key* đối với mọi thành viên group và bất kỳ ai khác ngoại trừ owner.

<a id="ch00lev2_140"></a>

### *Access-Control List*

Về nguyên tắc, user và group cho phép chúng ta biểu diễn bất kỳ thiết lập access-control mong muốn nào. Tuy nhiên, trong một số trường hợp, giới hạn rằng một file hay thư mục chỉ có thể có một owner duy nhất và một group đi kèm duy nhất khiến việc quản lý access-control hiệu quả trở nên khó khăn.

Hãy để tôi đưa ra một ví dụ vì tính hữu ích có thể chưa hiển nhiên. Hãy tưởng tượng bạn có một thư mục tên là *internal_logs* để lưu log và dữ liệu runtime. Các file trong thư mục này được tạo bởi năm user, tất cả đều thuộc group *service*. Hai năm sau khi ra mắt thị trường, bạn đưa vào một tính năng bảo trì dự đoán mới và một user `predmain` đi kèm chỉ cần quyền đọc file *internal_logs/freqtrack.dat*, và user đó không được có khả năng ghi bất cứ thứ gì—để khoanh vùng thiệt hại trong trường hợp bị xâm phạm. Bạn không thể thêm *predmain* vào group *service* vì khi đó nó sẽ có quá nhiều quyền, và bạn không thể làm *predmain* thành owner của *freqtrack.dat* vì, một lần nữa, việc bị xâm phạm sẽ để lại cho kẻ tấn công quá nhiều quyền kiểm soát.

<a id="page_207"></a>Một giải pháp là dùng access-control list (ACL), được triển khai dựa trên các extended file attribute (xattr) của một filesystem Linux. Tùy thuộc vào hệ thống của bạn, hỗ trợ ACL phải được cài đặt, và filesystem phải được mount với tùy chọn `acl` trước khi bạn có thể dùng các công cụ command line `getfacl` và `setfacl` để lần lượt xem và thay đổi quyền ở mức fine-grained.

<a id="ch00lev1_92"></a>

## Case Study: Access control cho firmware STM32MP157F-DK2

Trong case study này, trước tiên tôi minh họa một quá trình user- and file-initialization với Yocto. Tiếp theo, tôi khám phá các quyền mặc định mà Linux đặt cho một số file hệ thống nhất định và lý do đằng sau chúng. Cuối cùng, như một ví dụ về access control application-level, tôi xem xét cấu hình của SSH daemon Dropbear.

<a id="ch00lev2_141"></a>

### *Tạo user và cung cấp file trong Yocto*

Câu hỏi đầu tiên về access control mà bạn phải làm rõ trên bất kỳ nền tảng Linux nào là cách bạn muốn xử lý user root. Đặc biệt trong quá trình phát triển, user root có thể được dùng đều đặn và thường xuyên, thậm chí không có mật khẩu. Hãy bảo đảm gỡ bỏ các thiết lập debug cho các image sản xuất. Trong trường hợp của tôi, tôi đã gỡ bỏ tính năng `debug-tweaks` khỏi image `st-image-core` của ST, như được thể hiện trong [Listing 11-2](#ch11list02).

```
EXTRA_IMAGE_FEATURES:remove = "debug-tweaks"
inherit extrausers
ROOT_PASSWORD_HASH = "\$6\$ZsFPzdUpnha4s1lG\$8Zxzo4UhZBomryn/SJSlVq97TLy..."
EXTRA_USERS_PARAMS:append = "usermod --password '${ROOT_PASSWORD_HASH}' root;"
```

<a id="ch11list02"></a>

*Listing 11-2: Chuẩn bị user root cho sản xuất*

Tôi đã kế thừa class `extrausers`, cho phép sửa đổi user root hiện có (ví dụ, để bảo vệ nó bằng một mật khẩu mạnh). Chuỗi cryptic-looking phía sau `ROOT_PASSWORD_HASH` là định dạng password hash của user mà Linux kỳ vọng. Nó thu được bằng cách gọi `openssl passwd -6` `password`, trong đó tham số `-6` cho biết một hash có salt dựa trên SHA-512 được dùng. Cũng lưu ý rằng các ký hiệu `$` đóng vai trò dấu phân cách trong định dạng này và chúng cần được escape trong các recipe Yocto.

> **LƯU Ý**
>
> *Trong nhiều trường hợp, vô hiệu hóa hoàn toàn việc đăng nhập root là hợp lý, trừ khi bạn có lý do thuyết phục để không làm vậy, nhằm loại trừ việc lạm dụng user đầy quyền lực này.*

Yocto còn cung cấp class `useradd` để cung cấp thêm user và group từ bên trong một recipe tùy chỉnh. [Listing 11-3](#ch11list03) cho thấy việc tạo hai system user, *rservice* và *lservice*, cũng như các end user *admin* và *guest*. Ngoài ra, hai group tương ứng được tạo, và các user được thêm vào những group này.

<a id="page_208"></a>

```
inherit useradd
USERADD_PACKAGES = "${PN}"

USERADD_PARAM:${PN} = "--password '\$6\$fu47IexZgSH/T6d0\$9a.LjAl0sL0K...' \
                       --home /home/rservice --system rservice; \
                       --password '\$6\$tSsINjOvlFOaVrky\$9VIgdb7.LIVG...' \
                       --home /home/lservice --system lservice; \
                       --password '\$6\$VOPFagOJM.H.ZWIh\$8lELUZpkIogC...' \
                       --uid 1300 --home /home/admin admin; \
                       --password '\$6\$CPaAzKAYqkSKW42x\$KgivNUKDqsJT...' \
                       --uid 1301 --home /home/guest guest"

GROUPADD_PARAM:${PN} = "--system service; \
                        --gid 890 endusers"

GROUPMEMS_PARAM:${PN} = "--add rservice --group service; \
                         --add lservice --group service; \
                         --add admin --group endusers; \
                         --add guest --group endusers"
```

<a id="ch11list03"></a>

*Listing 11-3: Tạo user và group cho image*

Mọi user đều được khởi tạo với một mật khẩu trong biến `USERADD_PARAM`. Các UID cụ thể chỉ được dùng cho các tài khoản end-user. Biến `GROUPADD_PARAM` cho phép bạn tạo các group mới, trong khi `GROUPMEMS_PARAM` đưa các user đã tạo vào những group đó.

Trong một số trường hợp, bạn cũng có thể muốn tạo thư mục cho user và đặt các file ban đầu vào đó. Trong [Listing 11-4](#ch11list04), một đoạn từ một recipe tùy chỉnh được thể hiện, có thể làm một ví dụ đơn giản về việc cung cấp file cho các user đã tạo, bao gồm các lệnh cần thiết để đặt owner và group tương ứng.

<a id="page_209"></a>

```
do_install () {
        install -d -m 770 ${D}/home/rservice
        install -d -m 740 ${D}/home/lservice
        install -d -m 500 ${D}/home/admin
        install -d -m 550 ${D}/home/guest

        install -p -m 400 administration.md ${D}/home/admin/
        install -p -m 440 README ${D}/home/guest/

        chown -R rservice ${D}/home/rservice
        chown -R lservice ${D}/home/lservice
        chown -R admin ${D}/home/admin
        chown -R guest ${D}/home/guest

        chgrp -R service ${D}/home/rservice
        chgrp -R service ${D}/home/lservice
        chgrp -R endusers ${D}/home/admin
        chgrp -R endusers ${D}/home/guest
}
```

<a id="ch11list04"></a>

*Listing 11-4: Việc cung cấp file cơ bản cho các user đã tạo*

Trước tiên, các thư mục home cho mọi user được tạo với các quyền tương ứng. Ví dụ, end user chỉ nên có khả năng đọc dữ liệu được cung cấp, nhưng không được lưu code của riêng họ lên thiết bị hay thậm chí thực thi nó. Hơn nữa, thông tin quản trị không nên truy cập được đối với user `guest`.

Mặt khác, các service user có quyền cao hơn. Họ có thể nạp dữ liệu tùy chỉnh vào thư mục của mình, trong khi local service user `lservice` có quyền cao nhất vì nó thậm chí có thể đọc và ghi vào thư mục của remote service user.

Với những bước cơ bản này, bạn có thể đặt nền móng cho việc quản lý access-control của thiết bị.

<a id="ch00lev2_142"></a>

### *Khám phá các file hệ thống và user được định nghĩa trước*

May mắn thay, Linux và các bản phân phối của nó đã lo các thiết lập quyền cho nhiều file hệ thống. Hãy xem một số ví dụ cụ thể trong firmware của thiết bị STM32MP157F của tôi.

Việc quản lý user và mật khẩu trên Linux được triển khai bởi các file */etc/passwd* và */etc/shadow*. Như được thể hiện trong [Listing 11-5](#ch11list05), file thứ nhất được đánh dấu là mọi người đều đọc được vì có thể có nhiều lý do chính đáng để đọc danh sách user trên một hệ thống. Tuy nhiên, password hash thực sự của mỗi user không được đưa vào file *passwd*. Nó nằm trong file *shadow*, chỉ root mới đọc được cho mục đích xác minh đăng nhập.

```
# ls -l /etc/passwd /etc/shadow
-rw-r--r-- 1 root root 1404 ... /etc/passwd
-r-------- 1 root root  884 ... /etc/shadow
```

<a id="ch11list05"></a>

*Listing 11-5: Quyền truy cập các file mật khẩu trên Linux*

Việc lưu trữ mật khẩu *shadowing* đã được thực hiện trong nhiều thập kỷ. Ý tưởng chính là hạn chế quyền truy cập của các user không có đặc quyền vào các password hash, vì nếu một user dùng mật khẩu yếu, đối thủ có quyền truy cập vào password hash tương ứng sẽ có thể phát động một cuộc tấn công brute-force vào nó.

> **LƯU Ý**
>
> *Nếu bạn thắc mắc làm thế nào mật khẩu có thể được thay đổi nếu* /etc/shadow *chỉ có thể đọc, ngay cả đối với root: superuser root có sức mạnh tương tự Chuck Norris; nó thậm chí có thể ghi vào các file read-only.*

[Listing 11-6](#ch11list06) cho thấy các chuỗi quyền cho thẻ microSD của thiết bị tôi (*/dev/mmcblk0*), thiết bị RNG của Linux (*/dev/urandom*) và thiết bị RNG phần cứng của STM32MP157F (*/dev/hwrng*).

<a id="page_210"></a>

```
# ls -l /dev/mmcblk0
brw-rw---- 1 root disk 179, 0 Apr 28 17:42 /dev/mmcblk0
# ls -l /dev/urandom /dev/hwrng
crw------- 1 root root 10, 183 Apr 28 17:42 /dev/hwrng
crw-rw-rw- 1 root root  1,   9 Apr 28 17:42 /dev/urandom
```

<a id="ch11list06"></a>

*Listing 11-6: Các quyền cho thẻ microSD và các thiết bị RNG*

Bạn có thể thấy rằng, đối với các device file, chuỗi quyền chỉ ra đó là một block device (`b`) hay một character device (`c`). Kết quả cũng cho thấy thẻ microSD chỉ có thể được đọc bởi root hay các thành viên của group *disk*. Đối với các RNG, hệ thống phân biệt giữa RNG OS-provided `urandom`, có thể được đọc và ghi bởi mọi người, và thiết bị RNG phần cứng `hwrng`, chỉ root mới có thể truy cập.

Hãy chuyển trọng tâm từ file sang process. [Listing 11-7](#ch11list07) cho thấy các ứng dụng điển hình như web server `httpd` hay MQTT broker `mosquitto` và các user tương ứng thực thi những process này.

```
# ps | grep -E 'PID|httpd|mosquitto'
  PID USER       VSZ STAT COMMAND
 1138 root      5680 S    /usr/sbin/httpd -DFOREGROUND -D SSL -D PHP5 -k start
 1148 daemon    224m S    /usr/sbin/httpd -DFOREGROUND -D SSL -D PHP5 -k start
 1149 daemon    224m S    /usr/sbin/httpd -DFOREGROUND -D SSL -D PHP5 -k start
 1150 daemon    224m S    /usr/sbin/httpd -DFOREGROUND -D SSL -D PHP5 -k start
 1235 mosquitt  6792 S    /usr/sbin/mosquitto -c /etc/mosquitto/mosquitto.conf
 2507 daemon    224m S    /usr/sbin/httpd -DFOREGROUND -D SSL -D PHP5 -k start
 2610 root      2320 S    grep -E PID|httpd|mosquitto
```

<a id="ch11list07"></a>

*Listing 11-7: Ngữ cảnh user của các network daemon điển hình*

Web server `httpd` thể hiện một chiến lược phổ biến để hạn chế attack surface trong trường hợp một lỗ hổng có thể bị khai thác từ xa. Nó khởi động dưới user root, bind vào port được chỉ định (ví dụ, 80), rồi cố ý từ bỏ đặc quyền cao của mình bằng cách thay đổi GID và UID lần lượt qua các lời gọi `setgid()` và `setuid()`. Do đó, trong trường hợp của tôi, bốn “worker thread” của `httpd` chạy dưới user low-privilege *daemon*.

Điều tương tự đúng với Mosquitto broker. Bạn có thể suy ra từ tài liệu của nó rằng, ngay cả khi được khởi động với user root, Mosquitto ngay lập tức từ bỏ đặc quyền sau khi đọc file cấu hình và tiếp tục chạy trong ngữ cảnh của một user hạn chế hơn, trong trường hợp của tôi gọi là `mosquitto`.

Đầu ra username của `ps` bị giới hạn ở tám ký tự. Do đó, `mosquitto` trở thành `mosquitt`.

<a id="ch00lev2_143"></a>

### *Cấu hình access-control cho SSH daemon*

*Dropbear* là một SSH daemon gọn nhẹ đặc biệt phổ biến trên embedded system. Nó cho phép truy cập từ xa an toàn vào thiết bị, điều khiến nó hoàn toàn hữu ích nhưng cũng tuyệt đối trọng yếu. Những ứng dụng như vậy xứng đáng được xem xét riêng về các thiết lập access-control, vì nếu chúng triển khai một “chính sách mở cửa,” đó theo đúng nghĩa đen là một lời mời đối với kẻ tấn công.

[Listing 11-8](#ch11list08) cho thấy một phần các argument command line cho daemon `dropbear` đáng quan tâm từ góc nhìn access-control.

<a id="page_211"></a>

```
# dropbear --help
...
-w  Disallow root logins
-G  Restrict logins to members of specified group
-s  Disable password logins
-g  Disable password logins for root
-B  Allow blank password logins
-T  Maximum authentication tries (default 10)
...
```

<a id="ch11list08"></a>

*Listing 11-8: Một số tùy chọn access-control cho* `dropbear`

Vô hiệu hóa truy cập root qua SSH (`-w`) là một ý hay trong hầu hết các trường hợp. Cho case study này, cũng có thể hợp lý khi hạn chế truy cập SSH cho các user từ group *service* (`-G`), vì nó không nên là một tính năng cho end user. Vô hiệu hóa hoàn toàn đăng nhập bằng mật khẩu và chỉ cho phép xác thực public-key sẽ là hoàn hảo, nhưng nếu PKI của bạn chưa sẵn sàng cho bước này, tùy chọn `-s` không khả thi. Vì chúng ta đã vô hiệu hóa hoàn toàn truy cập root, dùng `-g` sẽ là dư thừa. Argument `-B` chỉ nên được dùng trong quá trình phát triển; có lẽ bạn không muốn thấy nó trong một firmware image sản xuất. Cuối cùng, bạn có thể hạn chế số lần thử đăng nhập tối đa—ví dụ, còn ba lần (`-T 3`).

> **LƯU Ý**
>
> *Bạn cũng có thể đổi port của SSH daemon* `dropbear` *từ 22 sang một port tùy chỉnh bằng tùy chọn* `-p`*. Đó chỉ là obscurity, nhưng nó có thể giúp thiết bị internet-connected của bạn không bị phát hiện bởi các lần quét SSH tự động.*

Để lưu các thiết lập `dropbear` của bạn một cách bền vững, bạn phải thay đổi file */etc/dropbear/default* trong firmware image. Dòng quan trọng mà nó nên chứa để triển khai các hạn chế access-control đã thảo luận là `DROPBEAR_EXTRA_ARGS="-w -T 3 -G service"`.

<a id="ch00lev1_93"></a>

## Mandatory Access Control

Trong khi các khái niệm DAC thường được các developer embedded system biết đến, *mandatory access control (MAC)* thường là vùng đất chưa được khám phá. Tuy nhiên, các bản triển khai MAC có thể đóng góp đáng kể vào bảo mật thiết bị và vào việc khoanh vùng thiệt hại trong trường hợp bị xâm phạm.

Ý tưởng cơ bản của các hệ thống MAC cho thiết bị embedded là các quyền và chính sách về cách user và process có thể tương tác với file và các tài nguyên khác được nhà sản xuất quản lý và OS thực thi. Trái với cách tiếp cận user-centric của DAC, user không thể ghi đè các quy tắc do MAC định nghĩa.

Các bản triển khai MAC là những công cụ mạnh, nhưng sức mạnh đi kèm trách nhiệm. *Whitelisting* là một chiến lược access-control phổ biến trong đó truy cập bị từ chối theo mặc định và chỉ được cấp nếu được cho phép tường minh. Cách tiếp cận này cũng có thể được dùng cho các hệ thống MAC để chỉ cho phép các truy cập đã định nghĩa của chủ thể vào đối tượng. Tuy nhiên, nếu bạn bỏ sót việc chỉ định một truy cập hợp lệ là “được phép,” <a id="page_212"></a>có thể vì nó hiếm khi được dùng, một ứng dụng cần nó có thể crash lúc runtime bất cứ khi nào truy cập đó xảy ra.

Nếu bạn chọn cách tiếp cận *blacklisting*—chỉ định nghĩa các trường hợp nguy hiểm mà truy cập nên bị từ chối, như malware được các trình quét virus phát hiện—xác suất làm hỏng chức năng giảm đi. Tuy nhiên, bạn phải bảo đảm rằng các quy tắc tương ứng cho hành vi độc hại mới được phát hiện được đưa vào thiết bị của bạn một cách kịp thời.

<a id="ch00lev2_144"></a>

### *Linux Security Module*

Vì cộng đồng Linux không thể thống nhất về một module bảo mật cụ thể, Linux đã đưa vào framework *Linux Security Module (LSM)*. Nó cho phép triển khai nhiều hệ thống MAC khác nhau cho Linux.

Các LSM này được biên dịch vào Linux kernel và hành động nếu các hook function cụ thể được gọi trong code kernel. Các hook này được tích hợp trong mọi thủ tục liên quan đến access control bên trong OS, từ truy cập file đến tạo task đến giao tiếp liên process. Nếu tới được hook, kernel chuyển quyền điều khiển cho LSM, LSM có thể ít nhất ghi log hành động đã thực hiện hay trực tiếp quyết định có nên cấp hay từ chối truy cập dựa trên tập quy tắc riêng của nó.

Các cách triển khai LSM khác nhau đáng kể về khái niệm, cách cấu hình tập quy tắc và cộng đồng hỗ trợ. Tuy nhiên, chúng cũng có chung một thuộc tính: tất cả đều có tác động tiêu cực lên performance hệ thống. Các phần sau giới thiệu các bản triển khai LSM phổ biến.

<a id="ch00lev2_145"></a>

### *SELinux*

Năm 2000, NSA công bố ý tưởng của họ về một hệ thống MAC cho Linux tới cộng đồng open source: *Security-Enhanced Linux (SELinux)*. Được các bên liên quan khác trong lĩnh vực này ủng hộ, dự án phát triển mạnh và cuối cùng được tích hợp vào phiên bản 2.6 của mainline Linux kernel năm 2003. Kể từ phiên bản 4.3, nó là LSM mặc định trong Android, và nhiều bản phân phối Linux cho ứng dụng desktop và server hỗ trợ nó.

SELinux dựa vào các security policy định nghĩa đối tượng nào có thể được truy cập bởi chủ thể nào. Cho mục đích này, các đối tượng và chủ thể phải được đăng ký trong SELinux với các *label* tương ứng chứa một user, một role và một type đi kèm. Những label này định nghĩa một dạng ngữ cảnh hay domain cho chủ thể và đối tượng. Access control thực sự được triển khai bởi *type enforcement*, vốn định nghĩa liệu một chủ thể có type cụ thể có thể truy cập một đối tượng có type cụ thể không.

Nhiều bản phân phối Linux cung cấp tập SELinux policy được định nghĩa trước của riêng họ để hạn chế nhiều ứng dụng và dịch vụ phổ biến. Hơn nữa, có một cơ sở dữ liệu các reference policy mà bạn có thể dùng cho mục đích của mình. Tuy nhiên, việc tạo các policy tùy chỉnh cho ứng dụng của bạn đòi hỏi know-how sâu về chức năng của chúng và hiểu biết chi tiết về các khái niệm và cấu trúc SELinux. Bạn không nên đánh giá thấp công sức mô tả đặc tính cần thiết, ngay cả khi có các công cụ hỗ trợ bạn.

<a id="page_213"></a>Lúc runtime, SELinux có thể được vận hành theo ba cách. Chế độ *enforcing* dành cho sử dụng thực tế, vì nó áp dụng nghiêm ngặt mọi policy đã cho và ghi log các hoạt động tương ứng. Tuy nhiên, trong quá trình phát triển hay trong một giai đoạn kiểm thử, chế độ *permissive* phù hợp hơn. Nó xử lý mọi policy, nhưng chỉ tạo cảnh báo và dữ liệu log mà không thực thi các quy tắc đã định nghĩa. Điều này có thể cực kỳ hữu ích cho việc fine-tuning các policy tùy chỉnh và xử lý sự cố. Nếu ở chế độ *disabled*, SELinux bị tắt hoàn toàn và không bảo vệ hay hạn chế gì cả.

Mặc dù (hoặc có lẽ chính vì) SELinux cung cấp vô số khả năng, nó là một công cụ khá phức tạp mà nhiều kỹ sư embedded system tránh dùng. Đây có lẽ là lý do chính khiến các cách triển khai LSM khác xuất hiện và trở thành các lựa chọn thay thế phổ biến, như được mô tả trong các phần sau.

<a id="ch00lev2_146"></a>

### *AppArmor*

*AppArmor* là bản triển khai LSM thứ hai đạt được sự phổ biến đáng kể trong các bản phân phối Linux. Nó trở thành một phần của Linux kernel 2.6.36 năm 2010 và hiện là hệ thống MAC mặc định cho Ubuntu và SUSE Linux. Việc phát triển nó được Canonical tài trợ từ năm 2009.

Access control được quản lý dựa trên các profile riêng cho từng ứng dụng. Trái với SELinux, AppArmor dùng đường dẫn filesystem để xác định chủ thể và đối tượng file, nên cú pháp dễ đọc hơn. Hơn nữa, nó cho phép một cách tiếp cận lai giữa các quy tắc whitelisting và blacklisting kiểm soát việc truy cập tài nguyên của một process. Các profile được tạo có thể hạn chế truy cập mạng và nhiều loại Linux capability, nhưng cũng cả quyền đọc, ghi và thực thi file.

AppArmor đi kèm một danh sách các profile được định nghĩa trước, và các profile bổ sung cho các ứng dụng phổ biến được cộng đồng Ubuntu duy trì. Ngoài ra, AppArmor cung cấp nhiều công cụ hỗ trợ developer trong việc profiling các ứng dụng tùy chỉnh và tạo các profile tương ứng.

Nói chung, có hai cách mô tả đặc tính các yêu cầu truy cập. Thứ nhất, profiling có mục tiêu cho phép bạn ghi lại các sự kiện truy cập của một ứng dụng duy nhất và tự động tạo một profile từ đó. Thứ hai, AppArmor có thể áp dụng một cách tiếp cận giám sát có hệ thống, ghi log các thao tác truy cập của một tập ứng dụng đã định nghĩa trong nhiều ngày hay thậm chí nhiều tuần và qua nhiều lần khởi động lại. Thông tin log thu thập được sau đó có thể được biến thành một loạt profile hạn chế các ứng dụng được phân tích theo cách tối ưu nhất có thể.

Mỗi profile AppArmor có sẵn trên một thiết bị có thể được đặt vào một trong ba chế độ lúc runtime: enforce, complain hay audit. Trong *enforcement mode*, các quy tắc do profile đặt ra được thực thi, và các nỗ lực vi phạm được ghi log. *Complain mode* cho phép giám sát hành vi của một ứng dụng dưới một profile đã định nghĩa, và các thao tác vi phạm policy được ghi log. Chế độ này cũng được dùng trong việc tạo profile tự động đã đề cập trước đó và do đó đôi khi được gọi là *learning mode* của AppArmor. Để ghi log mọi truy cập, dù thành công hay không, trong khi thực thi một policy cho trước, phải chọn *audit mode*.

<a id="page_214"></a>AppArmor là một lựa chọn thay thế xứng đáng cho SELinux, thành công trong việc giảm độ phức tạp cấu hình và profiling. Từ góc nhìn bảo mật, đôi khi nó lỏng lẻo hơn đối thủ và để lại khoảng trống để vượt qua access control trong những trường hợp cụ thể. Tuy nhiên, đối với embedded system, nó có thể là một sự thỏa hiệp hoàn hảo để đưa vào các cơ chế MAC.

<a id="ch00lev2_147"></a>

### *Các LSM khác và MAC non-LSM*

Bên cạnh hai bản triển khai LSM phổ biến, SELinux và AppArmor, bạn có thể muốn xem xét thêm các lựa chọn khác.

Như tên gọi gợi ý, hệ thống *Simplified Mandatory Access Control Kernel (SMACK)* được phát triển tập trung vào sự đơn giản, trái với độ phức tạp của SELinux. Nó là một phần của mainline Linux kernel từ năm 2008 và luôn được dành cho việc dùng trong embedded system. Hai dự án OS lớn hơn dựa vào các cơ chế bảo vệ của nó: OS di động Tizen được dùng trong smart TV của Samsung, và bản phân phối Linux automotive-grade dự định là một nền tảng open source cho xe hơi có kết nối. Tuy nhiên, nhìn vào website của SMACK và các Git repository của nó, có vẻ nó không còn được duy trì tích cực.

Một hệ thống MAC khác dựa trên framework LSM được gọi là *TOMOYO*. Dự án được bắt đầu năm 2003 và được hợp nhất vào Linux kernel 2.6.30 năm 2009. Một lần nữa, động lực là việc sử dụng đơn giản hơn và tính dễ dùng cao hơn—ví dụ, như được triển khai bằng việc tạo policy tự động, điều cũng cần thiết vì hệ thống MAC này không đi kèm một tập quy tắc toàn diện cho các dịch vụ phổ biến. Ngoài ra, TOMOYO không chỉ đóng vai trò một bản triển khai MAC mà còn hỗ trợ phân tích hành vi hệ thống. Nó có ba phiên bản: 1.*x*, 2.*x* và AKARI. Phiên bản thứ nhất đòi hỏi vá kernel cụ thể và do đó thường không phải là lựa chọn đầu tiên của bạn. AKARI và TOMOYO 2.*x* dùng framework LSM. Tại thời điểm viết sách, AKARI cung cấp thêm một vài tính năng, nhưng TOMOYO 2.*x* đang bắt kịp.

Mặc dù framework LSM cung cấp vô số khả năng để tích hợp các module bảo mật tùy chỉnh, không phải ai trong cộng đồng cũng hài lòng với bản triển khai của nó, đặc biệt khi xét đến overhead performance mà nó tạo ra. Do đó, cũng tồn tại các hệ thống MAC non-LSM nhắm tới performance cao hơn hay các tính năng module bảo mật nâng cao. Tuy nhiên, vì những bản triển khai đó không thuộc mainline kernel và phải được tích hợp bằng cách áp dụng một tập patch tùy chỉnh, chúng có thể chỉ là một lựa chọn nếu bạn thực sự không thể đạt được yêu cầu của mình với các bản triển khai LSM phổ biến.

<a id="ch00lev1_94"></a>

## Case Study: Giam hãm ứng dụng bằng AppArmor

Trong case study này, tôi làm sáng tỏ việc cài đặt AppArmor với toolchain Yocto của thiết bị STM32MP157F-DK2 của tôi và đi qua cách dùng cơ bản của nó để hạn chế một ứng dụng.

<a id="ch00lev2_148"></a>

### <a id="page_215"></a>*Cài đặt*

AppArmor không có trong bản cài đặt mặc định của bản phân phối OpenSTLinux của ST. May mắn thay, layer Yocto `meta-security` do Armin Kuster duy trì cung cấp một recipe AppArmor dưới *meta-security/recipes-mac/AppArmor*.

Sau khi clone Git repository tương ứng, Linux kernel có thể được cấu hình để dùng AppArmor với các thiết lập được thể hiện trong [Listing 11-9](#ch11list09).

```
CONFIG_SECURITY=y
CONFIG_SECURITY_APPARMOR=y
CONFIG_DEFAULT_SECURITY="apparmor"
CONFIG_SECURITY_APPARMOR_BOOTPARAM_VALUE=1
```

<a id="ch11list09"></a>

*Listing 11-9: Cấu hình Linux kernel để bật AppArmor*

Hai dòng đầu tiên bật AppArmor, và hai dòng cuối đặt nó làm LSM mặc định được dùng. Tuy nhiên, tôi cũng phải thêm `security=apparmor` vào boot argument của kernel trong các file *extlinux.conf* của U-Boot để chọn AppArmor lúc boot.

Để biên dịch và cài đặt các công cụ user-space của AppArmor, hãy thêm dòng `IMAGE_INSTALL += "apparmor"` vào recipe của image. Tôi cũng phải thêm nhiều distro feature vào OpenSTLinux được cung cấp, như được thể hiện trong [Listing 11-10](#ch11list010), để Yocto hoàn tất thành công quá trình build.

```
DISTRO_FEATURES += "security"
DISTRO_FEATURES += "apparmor"
DISTRO_FEATURES += "tpm"
```

<a id="ch11list010"></a>

*Listing 11-10: Các distro feature cho AppArmor từ* `meta-security`

Sau khi boot thiết bị, bạn có thể kiểm tra xem AppArmor có thực sự được bật không bằng lệnh được thể hiện trong [Listing 11-11](#ch11list011). Nếu nó trả về `Y`, AppArmor đã được kích hoạt đúng.

```
# cat /sys/module/apparmor/parameters/enabled
Y
```

<a id="ch11list011"></a>

*Listing 11-11: Kiểm tra xem AppArmor đã được bật đúng chưa*

AppArmor đi kèm công cụ `aa-status`, liệt kê nhiều chi tiết về trạng thái hiện tại của AppArmor, như được thể hiện trong [Listing 11-12](#ch11list012).

<a id="page_216"></a>

```
# aa-status
apparmor module is loaded.
50 profiles are loaded.
50 profiles are in enforce mode.
   ...
   apache2
   ...
   avahi-daemon
   ...
   ping
   ...
   syslogd
   traceroute
   ...
0 profiles are in complain mode.
...
2 processes are in enforce mode.
   /usr/sbin/avahi-daemon (665) avahi-daemon
   /usr/sbin/avahi-daemon (667) avahi-daemon
0 processes are in complain mode.
...
```

<a id="ch11list012"></a>

*Listing 11-12: Đầu ra ban đầu của* `aa-status`

Bạn có thể thấy recipe AppArmor từ layer `meta-security` cũng cài đặt một tập 50 profile tiêu chuẩn được nạp ở enforce mode trên thiết bị của tôi. Tuy nhiên, điều đầu tiên tôi để ý là mặc dù có các profile được nạp cho `apache2` và `syslogd`, các process tương ứng đang chạy lại không bị giam hãm. Chỉ các process `avahi-daemon` bị hạn chế theo profile của chúng.

Để điều tra vấn đề này, chúng ta phải xem các profile AppArmor mặc định được lưu trong */etc/apparmor.d/*. Đối với `apache2`, file chứa profile được cung cấp có tên *usr.sbin.apache2*. Tên file đã là một gợi ý về đường dẫn của file thực thi mà nó giam hãm: trong trường hợp này là */usr/sbin/apache2*. Nhìn vào nội dung của file, bạn có thể thấy một dòng ghi `profile apache2 /usr/{bin, sbin}/apache2`, nghĩa là profile đang xét có tên `apache2` và nhắm tới file thực thi *apache2* nằm tại */usr/bin/* hay */usr/sbin/*.

Đáng tiếc là file này không tồn tại trong bản cài đặt của tôi. Thay vào đó, nó có tên là *httpd*. Do đó, tôi tạo một bản sao của file ban đầu tên là *usr.sbin.httpd*. Tôi cũng đổi tên profile thành `httpd` và đường dẫn của file thực thi thành `/usr/{bin,sbin}/httpd`. Sau đó, tôi nạp profile ở enforce mode như được thể hiện trong [Listing 11-13](#ch11list013) và khởi động lại web server.

```
# aa-enforce /etc/apparmor.d/usr.sbin.httpd
Setting /etc/apparmor.d/usr.sbin.httpd to enforce mode.
# systemctl restart apache2
# aa-disable /etc/apparmor.d/usr.sbin.apache2
Disabling /etc/apparmor.d/usr.sbin.apache2.
```

<a id="ch11list013"></a>

*Listing 11-13: Nạp và vô hiệu hóa profile*

Tôi cũng vô hiệu hóa profile gốc với sự trợ giúp của `aa-disable` để dọn dẹp.

[Listing 11-14](#ch11list014) trình bày đầu ra của một lời gọi `aa-status` khác, cho thấy profile `httpd` đã được nạp đúng và cả bốn instance process tương ứng đang chạy ở enforce mode như mong muốn.

<a id="page_217"></a>

```
# aa-status
...
50 profiles are loaded.
50 profiles are in enforce mode.
...
   httpd
   httpd//DEFAULT_URI
   httpd//HANDLING_UNTRUSTED_INPUT
   httpd//phpsysinfo
...
6 processes are in enforce mode.
   /usr/sbin/avahi-daemon (669) avahi-daemon
   /usr/sbin/avahi-daemon (672) avahi-daemon
   /usr/sbin/httpd (668) httpd
   /usr/sbin/httpd (678) httpd
   /usr/sbin/httpd (679) httpd
   /usr/sbin/httpd (681) httpd
...
```

<a id="ch11list014"></a>

*Listing 11-14: Đầu ra của* `aa-status` *sau khi thay đổi profile*

Mặc dù chúng ta đã thành công kích hoạt profile được định nghĩa trước, chúng ta không biết liệu profile có thực sự hạn chế ứng dụng web server theo cách an toàn không. Một comment trong profile đã cho nói rằng “this profile is completely permissive” (profile này hoàn toàn dễ dãi), nghĩa là bạn vẫn phải tùy chỉnh nó theo ứng dụng và yêu cầu của mình.

Xem nhanh profile *sbin.syslogd* gắn với công cụ `syslogd`, binary ví dụ thứ hai được xác định ở đầu tiểu mục này, cho thấy đường dẫn được cấu hình, */sbin/syslogd*, khớp với đường dẫn của file thực thi tương ứng, nhưng process vẫn không chạy ở enforce mode. Các thuộc tính của binary, như được thể hiện trong [Listing 11-15](#ch11list015), cho thấy file thực thi thực ra là một symbolic link tới một file thực thi khác—cụ thể là */bin/busybox.nosuid*.

```
# ls -l /sbin/syslogd
lrwxrwxrwx 1 root root 19 ... /sbin/syslogd -> /bin/busybox.nosuid
```

<a id="ch11list015"></a>

*Listing 11-15: Một symbolic link tới một file thực thi khác*

Điều này làm tình huống có phần phức tạp vì BusyBox hợp nhất nhiều công cụ trong một binary. Chỉ đổi đường dẫn của profile `syslogd` không giải quyết được vấn đề này mà còn gây thêm vấn đề với các chức năng Busy-Box khác. Trong những trường hợp như vậy, bạn có nhiều lựa chọn. Bạn có thể bỏ qua profile `syslogd`, bạn có thể tìm kiếm hay tạo một profile `busybox` toàn diện, hoặc rốt cuộc bạn có thể cài đặt và dùng ứng dụng `syslogd` gốc.

<a id="ch00lev2_149"></a>

### <a id="page_218"></a>*Profiling ứng dụng*

Đối với các ứng dụng của chính bạn hay các công cụ third-party không đi kèm profile AppArmor được định nghĩa trước, bạn phải tự tạo một profile nếu muốn giam hãm chúng bằng các cơ chế MAC lúc runtime.

Hãy xem một ứng dụng Python rất đơn giản đã được thu gọn đến mức tối thiểu. [Listing 11-16](#ch11list016) cho thấy code.

```
#!/usr/bin/python3

import sys

if len(sys.argv) == 2:
    file_path = sys.argv[1]
    with open(file_path, 'r') as f:
        print(f.read())
else:
    print('Usage:', sys.argv[0], '<filename>')
```

<a id="ch11list016"></a>

*Listing 11-16: Một ứng dụng file-printing đơn giản bằng Python*

Mục đích duy nhất của ứng dụng này là in nội dung của một file văn bản được cho làm argument command line. Tên file của ứng dụng là *printfile.py*, nó nằm trong */home/root/*, và nó được đánh dấu là thực thi được.

Hãy giả sử công cụ này là một phần thiết yếu của web interface của bạn và cần chạy với đặc quyền superuser vì nó phải in nội dung của các file *testfile* và *logfile*, vốn chỉ root mới truy cập được. Tuy nhiên, trong quá trình phân tích mối đe dọa và rủi ro, bạn phát hiện rằng đối thủ có thể đưa vào các đường dẫn file khác ngoài hai đường dẫn dự định, điều có thể dẫn đến việc lộ thông tin nhạy cảm và nên được ngăn chặn—ví dụ, bằng cách dùng một profile AppArmor custom-tailored.

[Listing 11-17](#ch11list017) cho thấy profile ban đầu cơ bản mà tôi đã tạo tại */etc/apparmor.d/ home.root.printfile.py* làm điểm khởi đầu cho việc profiling ứng dụng này. Nó bao gồm quyền đọc (`r`) cho hai file đã đề cập trước đó và từ chối mọi truy cập file khác.

```
/home/root/printfile.py {
   /home/root/testfile     r,
   /home/root/logfile      r,
}
```

<a id="ch11list017"></a>

*Listing 11-17: Profile AppArmor ban đầu cho* printfile.py

Ở bước thứ hai, tôi nạp profile mới tạo ở complain mode, như được thể hiện trong [Listing 11-18](#ch11list018).

```
# aa-complain /etc/apparmor.d/home.root.printfile.py
Setting /etc/apparmor.d/home.root.printfile.py to complain mode.
```

<a id="ch11list018"></a>

*Listing 11-18: Nạp một profile ở complain mode*

<a id="page_219"></a>Nếu giờ bạn thực thi `./printfile.py testfile` trong *home/root/*, ứng dụng sẽ hoạt động không có vấn đề gì nhưng sẽ tạo các mục log cho mọi vi phạm profile.

[Listing 11-19](#ch11list019) cho thấy một tập đã được cắt gọn các thông điệp kernel AppArmor tương ứng với *printfile.py*.

```
# dmesg | grep printfile.py
... audit: type=1400 audit(1652997509.490:132): apparmor="STATUS"
             operation="profile_load" profile="unconfined"
             name="/home/root/printfile.py" pid=1557 comm="apparmor_parser"
... audit: type=1400 audit(1652997771.210:133): apparmor="ALLOWED"
             operation="open" profile="/home/root/printfile.py"
             name="/etc/ld.so.cache" pid=1560 comm="printfile.py"
             requested_mask="r" denied_mask="r" fsuid=0 ouid=0
... audit: type=1300 audit(1652997771.210:133): arch=40000028 ...
             comm="printfile.py" exe="/usr/bin/python3.10"
             subj=/home/root/printfile.py (complain) key=(null)
... audit: type=1400 audit(1652997771.210:134): apparmor="ALLOWED"
             operation="open" profile="/home/root/printfile.py"
             name="/usr/lib/libpython3.10.so.1.0" pid=1560 comm="printfile.py"
             requested_mask="r" denied_mask="r" fsuid=0 ouid=0
... audit: type=1300 audit(1652997771.210:134): arch=40000028 ...
             comm="printfile.py" exe="/usr/bin/python3.10"
             subj=/home/root/printfile.py (complain) key=(null)
... audit: type=1400 audit(1652997771.210:135): apparmor="ALLOWED"
             operation="file_mmap" profile="/home/root/printfile.py"
             name="/usr/lib/libpython3.10.so.1.0" pid=1560 comm="printfile.py"
             requested_mask="rm" denied_mask="rm" fsuid=0 ouid=0
... audit: type=1300 audit(1652997771.210:135): arch=40000028 ...
             comm="printfile.py" exe="/usr/bin/python3.10"
             subj=/home/root/printfile.py (complain) key=(null)
... audit: type=1400 audit(1652997771.210:136): apparmor="ALLOWED"
             operation="open" profile="/home/root/printfile.py"
             name="/lib/libc.so.6" pid=1560 comm="printfile.py"
             requested_mask="r" denied_mask="r" fsuid=0 ouid=0
```

<a id="ch11list019"></a>

*Listing 11-19: Các thông điệp complain của AppArmor cho* printfile.py

Bạn có thể thấy nhiều vi phạm truy cập đã xảy ra chỉ khi gọi *printfile.py* theo cách dự định. Nếu bạn đặt profile ban đầu ở enforce mode, ứng dụng sẽ không hoạt động nữa. Do đó, bạn phải dùng đầu ra được mô tả để mở rộng profile AppArmor cho *printfile.py*. Ví dụ, bạn phải cấp quyền đọc (`r`) cho */etc/ld.so.cache*, quyền thực thi (`ux`) cho */usr/bin/python3.10*, và quyền đọc (`r`) và ánh xạ (`m`) cho */usr/lib/libpython3.10.so.1.0*.

[Listing 11-20](#ch11list020) cho thấy profile cuối cùng sau bốn vòng lặp gồm thực thi ở complain mode, tinh chỉnh profile và nạp lại.

<a id="page_220"></a>

```
/home/root/printfile.py flags=(complain) {
   /home/root/testfile             r,
   /home/root/logfile              r,
   /etc/ld.so.cache                r,
   /usr/bin/python3.10             ux,
   /usr/lib/libpython3.10.so.1.0   rm,
   /lib/libc.so.6                  rm,
   /lib/libm.so.6                  rm,
   /usr/lib/locale/locale-archive  r,
   /usr/lib/python3.10/            r,
   /usr/lib/python3.10/**          r,
   /home/root/printfile.py         r,
}
```

<a id="ch11list020"></a>

*Listing 11-20: Profile AppArmor cho* printfile.py *sau khi tinh chỉnh*

Sau giai đoạn mô tả đặc tính thủ công này, profile đã tạo có thể được nạp ở enforce mode và được kiểm thử về hành vi ([Listing 11-21](#ch11list021)).

```
# aa-enforce /etc/apparmor.d/home.root.printfile.py
Setting /etc/apparmor.d/home.root.printfile.py to enforce mode.
# ./printfile.py testfile
--- --- ---
This is a test file!
--- --- ---
# ./printfile.py logfile
--- --- ---
All the logs...
--- --- ---
# ./printfile.py secrets
Traceback (most recent call last):
  File "/home/root/./printfile.py", line 7, in <module>
    with open(file_path, 'r') as f:
PermissionError: [Errno 13] Permission denied: 'secrets'
# ./printfile.py /etc/passwd
Traceback (most recent call last):
  File "/home/root/./printfile.py", line 7, in <module>
    with open(file_path, 'r') as f:
PermissionError: [Errno 13] Permission denied: '/etc/passwd'
```

<a id="ch11list021"></a>

*Listing 11-21: Kiểm thử* printfile.py *ở enforce mode*

Việc in các file *testfile* và *logfile* hoạt động như dự định. Tuy nhiên, nếu kẻ tấn công cố đọc file *secrets* trong cùng thư mục hay thậm chí file */etc/passwd*, AppArmor bảo vệ thành công khỏi thiệt hại nghiêm trọng.

Case study đơn giản này đã cho thấy tính khả thi cơ bản của việc mô tả đặc tính ứng dụng và việc tạo profile AppArmor tương ứng. Tuy nhiên, ngay cả ví dụ tầm thường này cũng mất nhiều vòng profiling, và profile thu được sẽ cần được duy trì liên tục—ví dụ, nếu bạn chuyển sang <a id="page_221"></a>một bản phân phối khác hay thậm chí một phiên bản Python mới hơn. Hơn nữa, như bạn có thể hình dung, các ứng dụng phức tạp hơn đòi hỏi công sức mô tả đặc tính và kiểm thử nhiều hơn đáng kể.

<a id="ch00lev1_95"></a>

## Tóm tắt

Access control là một chủ đề cực kỳ rộng có thể tự nó lấp đầy cả một cuốn sách. Nó bao gồm các cấu hình cơ bản về user, group, cấu trúc thư mục và quyền truy cập (như được thảo luận trong chương này cho hệ thống DAC của Linux), việc vô hiệu hóa các tính năng và công cụ debug phần cứng không dành cho end user, và lĩnh vực phức tạp của các MAC policy OS-enforced phải được fine-tuned theo hành vi riêng và nhu cầu resource-access của một ứng dụng cụ thể. Và dù tôi không kỳ vọng bạn đầu tư toàn bộ thời gian để thiết kế các thiết lập access-control hoàn hảo, không có cách nào né tránh vấn đề này trong kỹ thuật chế tạo thiết bị an toàn.

Trên thực tế, chúng ta phải tìm ra những thỏa hiệp khả thi trên thực tế. Một cách tiếp cận whitelisting hoàn toàn có thể khó triển khai và có thể dẫn đến các ứng dụng bị hỏng nếu cấu hình sai, điều mà bảo mật sẽ bị đổ lỗi. Mặt khác, blacklisting sẽ không thể ngay lập tức bắt được các mối đe dọa mới xuất hiện ngoài hiện trường. Độ chi tiết tinh của quyền chỉ có thể được quản lý theo thời gian nếu bạn sẵn lòng bỏ ra công sức đáng kể, nhưng nếu khái niệm access-control của bạn quá đơn giản, đối thủ của bạn sẽ cảm ơn bạn vì đã dọn đi chướng ngại vật khó chịu trên đường.

Cuối cùng, tôi muốn chỉ ra rằng các cơ chế access-control luôn có liên hệ mạnh với việc bảo vệ system-integrity, như được mô tả trong [Chương 8](ch08_secure_boot_and_system_integrity.vi.md#ch08). Hãy tưởng tượng nếu bạn đã tỉ mỉ định nghĩa một tập quy tắc truy cập hoàn hảo chỉ để phát hiện ra rằng kẻ tấn công có thể đặt lại tất cả chúng thành 777 trong vài phút. Điều đó sẽ rất đau.
