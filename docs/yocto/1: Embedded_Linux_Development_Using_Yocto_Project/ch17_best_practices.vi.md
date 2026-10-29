# Chương 17: Các thực hành tốt nhất (Best Practices)

Chương này nhằm chia sẻ góc nhìn từ kinh nghiệm cá nhân của chúng tôi (các tác giả) qua nhiều năm làm việc với thiết bị embedded và phát triển embedded Linux. Chúng tôi đã tập hợp một số khía cạnh thường bị đánh giá thấp hoặc bị bỏ qua hoàn toàn, để làm nguồn cảm hứng cho bạn trong project tiếp theo.

Chúng tôi đã chia chương này thành hai phần độc lập, một phần về các hướng dẫn liên quan đến những đặc thù của Yocto Project và phần còn lại về các khía cạnh chung hơn của một project. Như vậy, bạn không phải đọc hai phần theo một thứ tự cụ thể nào.

## Các hướng dẫn nên tuân theo cho Yocto Project

Phần này nhằm tập hợp một số hướng dẫn về các khía cạnh của metadata Yocto Project và các mẹo tổ chức project giúp cuộc sống của chúng ta dễ dàng hơn về mặt bảo trì ngắn hạn và long-term.

### Quản lý layer

Khi hành trình phát triển sản phẩm của chúng ta tiến triển, tất yếu chúng ta sẽ dùng nhiều repository để đáp ứng các nhu cầu gặp phải. Việc theo dõi các repository là một thách thức phức tạp vì chúng ta cần làm những việc sau:

- Bảo đảm có thể tái tạo một lần build trước đó trong tương lai
- Cho phép nhiều thành viên trong nhóm làm việc trên cùng một code base
- Kiểm chứng các thay đổi chúng ta thực hiện bằng các công cụ Continuous Integration
- Tránh các thay đổi tinh vi trong các layer chúng ta dùng

Những mục tiêu đó thật đáng ngại, nhưng có một vài công cụ đang được dùng, với các chiến lược khác nhau để vượt qua những thách thức này.

Giải pháp đơn giản nhất là dùng class `image-buildinfo` ([https://docs.yoctoproject.org/4.0.4/ref-manual/classes.html#image-buildinfo-bbclass](https://docs.yoctoproject.org/4.0.4/ref-manual/classes.html#image-buildinfo-bbclass)), class này ghi một file văn bản thuần chứa thông tin build và revision của các layer vào filesystem của target tại `${sysconfdir}/buildinfo` theo mặc định. Một số công cụ đã được phát triển để hỗ trợ quá trình này. Các công cụ này được bàn đến như sau:

- Google đã phát triển công cụ **repo** ([https://source.android.com/docs/setup/download#repo](https://source.android.com/docs/setup/download#repo)) cho việc phát triển Android. Nó đã được áp dụng cho các project khác. Một khía cạnh quan trọng của repo là nó cần một số công cụ hỗ trợ để tích hợp với các project Yocto Project-based nhằm tự động hóa việc cấu hình thư mục build và môi trường. Hãy xem *O.S. Systems Embedded Linux project* ([https://github.com/OSSystemsEmbeddedLinux/ossystems-embedded-linux-platform](https://github.com/OSSystemsEmbeddedLinux/ossystems-embedded-linux-platform)) như một nguồn cảm hứng để dùng repo trong các project của bạn.
- Siemens đã phát triển **kas** ([https://github.com/siemens/kas](https://github.com/siemens/kas)) để cung cấp một cơ chế dễ dàng cho việc tải source, tự động hóa việc cấu hình thư mục build và môi trường, v.v.
- Garmin đã phát triển **Whisk** ([https://github.com/garmin/whisk](https://github.com/garmin/whisk)) để quản lý các cấu hình sản phẩm phức tạp dùng OpenEmbedded và Yocto Project. Các tính năng chính là một cây source duy nhất, nhiều trục cấu hình, nhiều lần build sản phẩm, cấu hình layer cô lập, v.v.
- Agilent đã phát triển **Yocto Buddy** ([https://github.com/Agilent/yb](https://github.com/Agilent/yb)). Thiết kế của nó nhằm đơn giản hóa việc thiết lập và giữ cho các môi trường Yocto Project-based được đồng bộ. Yocto Buddy được lấy cảm hứng từ tất cả các công cụ đã đề cập ở trên và vẫn đang ở giai đoạn đầu phát triển.

Đây là một tập con của các công cụ hiện có và không nên được xem là một danh sách đầy đủ. Lý tưởng nhất, bạn nên thử nghiệm với chúng trước khi quyết định, vì lựa chọn phụ thuộc vào trường hợp sử dụng của project và chuyên môn của nhóm.

### Tránh tạo quá nhiều layer

Một ưu điểm đáng kể của Yocto Project là nó có khả năng dùng và tạo nhiều layer. Điều này cho phép chúng ta làm những việc sau:

- Dùng lại các BSP layer từ các nhà cung cấp bán dẫn
- Giảm trùng lặp công việc bằng cách chia sẻ các khối có thể dùng lại để cho phép dùng các ứng dụng, ngôn ngữ lập trình mới hoặc cụ thể, v.v.

Tuy nhiên, việc tạo nhiều layer có thể phản tác dụng khi phát triển một project hoặc một tập sản phẩm. Ví dụ, việc phát triển các layer BSP-only có ý nghĩa trong các tình huống sau:

- Board chính là sản phẩm, như trường hợp của các nhà cung cấp **System on Module** (**SoM**)
- Khi việc truy cập từ bên ngoài vào layer là rất quan trọng, nhưng chúng ta muốn giới hạn quyền truy cập đối với source non-BSP

Dùng một layer duy nhất cho sản phẩm, hoặc thậm chí cho cả công ty, có nhiều ưu điểm, như sau:

- Thuận tiện cho việc phát triển các thành phần có thể dùng lại, như một package `packagegroup` cho các công cụ phát triển hoặc tiện ích mạng được nhiều sản phẩm dùng chung
- Giảm rủi ro về các tác dụng phụ không mong đợi do các thay đổi dành cho một sản phẩm hoặc board cụ thể
- Tăng việc dùng lại các bản sửa bug giữa nhiều sản phẩm và dùng lại các thành phần BSP low-level như Linux kernel hoặc bootloader
- Thúc đẩy việc chuẩn hóa giữa nhiều sản phẩm, giảm thời gian học hỏi cho các thành viên mới trong nhóm

Quyết định dùng một hay nhiều layer phụ thuộc vào nhiều khía cạnh; tuy nhiên, chúng tôi khuyên nên bắt đầu đơn giản và, trong tương lai, tách layer nếu cần.

### Chuẩn bị metadata sản phẩm cho các bản phát hành Yocto Project mới

Khi sản phẩm của chúng ta phát triển, metadata và nhu cầu tổ chức tốt cũng tăng theo. Một số trường hợp sử dụng thường thấy trong quá trình phát triển sản phẩm như sau:

- Nhu cầu backport một phiên bản recipe mới do một bản sửa bug hoặc một tính năng
- Một cấu hình package hoặc bản sửa bug còn thiếu, chưa có trong recipe của Yocto Project

Chúng tôi dùng hai thư mục recipe để tổ chức loại nội dung này:

- `recipes-backport`: Các bản backport của recipe đến từ các bản phát hành Yocto Project mới
- `recipes-staging`: Các recipe mới hoặc các file `bbappend` bổ sung các cấu hình package hoặc bản sửa bug còn thiếu

Chúng tôi liên tục gửi các recipe mới hoặc bản sửa bug từ `recipes-staging` tới project upstream tương ứng (ví dụ, OpenEmbedded Core). Sau đó, khi patch được chấp nhận, chúng tôi chuyển thay đổi này từ `recipes-staging` sang thư mục `recipes-backport`. Cách tiếp cận này cho phép chúng ta theo dõi các task upstream đang chờ và dễ dàng nâng cấp meta layer của mình lên một bản phát hành Yocto Project mới. Hơn nữa, chúng ta có thể nhanh chóng xử lý thư mục backport và xóa nó đi.

### Tạo distro tùy chỉnh của bạn

Khi dùng Yocto Project, chúng ta thường thêm nhiều cấu hình vào `build/conf/local.conf`. Tuy nhiên, như đã bàn trong cuốn sách, điều này không tốt vì nó không nằm trong quản lý source control và nhiều khả năng sẽ khác nhau giữa các developer. Dùng một bản phân phối tùy chỉnh có nhiều lợi ích, và một số lợi ích được nêu bật ở đây:

- Cho phép sử dụng nhất quán giữa nhiều developer
- Cung cấp một cái nhìn rõ ràng về các `DISTRO_FEATURES` khác nhau mà chúng ta dùng khi so sánh với bản phân phối cơ sở (ví dụ, `poky`)
- Cung cấp một nơi tập trung để chúng ta có cái nhìn toàn cục về tất cả các cấu hình recipe cần thiết cho sản phẩm, giảm số lượng file `bbappend` cần để cấu hình các recipe (ví dụ, `PACKAGECONFIG:pn-<myrecipe>:append = " myfeature"`)

Bên cạnh những khía cạnh kỹ thuật đó, việc dùng một distro tùy chỉnh còn cho phép gắn thương hiệu phù hợp cho SDK hoặc các artifact Yocto Project-generated khác.

Chúng ta đã học cách tạo một bản phân phối tùy chỉnh trong phần *Dùng một bản phân phối tùy chỉnh* ở *Chương 12*, *Tạo các layer tùy chỉnh*.

### Tránh dùng lại các image có sẵn cho sản phẩm của bạn

Image là nơi mọi thứ khớp lại với nhau. Khi phát triển một sản phẩm, điều quan trọng là giảm thiểu số lượng package được cài đặt trong image vì nhiều lý do:

- Giảm kích thước rootfs
- Giảm thời gian build
- Giảm số lượng license phải xử lý
- Giảm bề mặt tấn công đối với các lỗ hổng bảo mật

Một điểm khởi đầu điển hình là copy file `core-image-base.bb` sang layer tùy chỉnh của chúng ta thành `myproduct-image.bb` và mở rộng nó, thêm những gì chúng ta cần cho image của sản phẩm. Ngoài ra, chúng ta tạo một image tên là `myproduct-image-dev.bb` để dùng trong quá trình phát triển và bảo đảm nó require `myproduct-image.bb` cùng với các artifact chỉ dùng cho phát triển, tránh trùng lặp code. Bằng cách này, chúng ta có hai image cho production và phát triển, nhưng chúng chia sẻ cùng các tính năng và package cốt lõi.

### Standard SDK thường bị đánh giá thấp

Việc phát triển ứng dụng ngụ ý một quá trình tương tác, chủ yếu vì chúng ta thường liên tục build ứng dụng cho đến khi đạt được điều mình hướng tới. Trường hợp sử dụng này không thật phù hợp với Yocto Project, chủ yếu vì những lý do sau:

- Mỗi lần bắt đầu build một recipe, nó loại bỏ các build object trước đó
- Thời gian cần để deploy ứng dụng hoặc image dài hơn nhiều
- Thiếu sự tích hợp phù hợp vào môi trường IDE

Có những giải pháp thay thế cho một vài vấn đề đó, như dùng `devtool` để dùng lại các build object và giúp deploy ứng dụng. Chúng ta đã thấy cách dùng `devtool` trong các phần *Deploy tới target bằng devtool* và *Build một recipe bằng devtool* của *Chương 9*, *Phát triển với Yocto Project*, nhưng trải nghiệm phát triển vẫn còn cồng kềnh.

Dùng Standard SDK để phát triển ứng dụng và các thành phần khác, như Linux kernel và bootloader, vẫn là lựa chọn được ưu tiên hơn. Bằng cách này, chúng ta tập trung vào việc phát triển nhanh hơn, hoãn lại hoặc song song hóa task tích hợp Yocto Project.

### Tránh có quá nhiều patch cho các sửa đổi Linux kernel và bootloader

Nhu cầu patch Linux kernel và bootloader là vốn có trong việc phát triển embedded Linux, vì chúng ta hiếm khi dùng phần cứng mà không có bất kỳ thay đổi nào. Mức độ sửa đổi trên các thành phần đó liên quan đến thiết kế phần cứng của bạn, ví dụ:

- Khi dùng một **Single-Board Computer** (**SBC**), số lượng thay đổi nên ở mức tối thiểu
- Khi dùng **System-On-Module** (**SOM**) với một baseboard tùy chỉnh, số lượng thay đổi có thể khác nhau tùy theo số lượng sửa đổi so với thiết kế phần cứng baseboard của nhà cung cấp
- Cuối cùng, việc dùng thiết kế phần cứng tùy chỉnh ngụ ý việc phát triển một BSP tùy chỉnh và, do đó, một số lượng sửa đổi đáng kể

Những điều đó không phải là bất biến. Ví dụ, hãy xét việc bắt đầu project bằng một SBC. Về sau, chúng ta phát hiện ra rằng nhà cung cấp không cung cấp một BSP tham chiếu tốt, vì vậy số lượng sửa đổi và khối lượng công việc cho BSP sẽ tăng lên đáng kể.

Khi có những thay đổi nhỏ, tốt hơn là xử lý các thay đổi dưới dạng các file patch được thêm vào recipe của thành phần. Nhưng khi công sức bảo trì thành phần tăng lên, việc có một fork riêng của thành phần đó để giữ mọi thay đổi tại chỗ là hợp lý. Dùng một repository fork mang lại cho chúng ta các ưu điểm sau:

- Lịch sử các thay đổi
- Các branch hoặc tag khác nhau cho phát triển và production
- Khả năng merge với các nhà cung cấp khác
- Cho phép dùng các recipe đơn giản hơn nhiều, vì chúng ta không cần mang theo các patch riêng lẻ

Tóm lại, chúng ta nên dùng chiến lược phù hợp với project. Rốt cuộc, điều này sẽ thay đổi, nhưng dùng đúng cách tiếp cận sẽ giảm tổng công sức để hỗ trợ đúng cách phần cứng đang dùng.

### Tránh dùng AUTOREV làm SRCREV

Việc dùng `AUTOREV` làm `SRCREV` thường được áp dụng khi phát triển một sản phẩm. Chúng ta phải thay đổi code một cách tương tác và thử code đó bên trong Yocto Project. Dù vậy, điều này đi kèm với một vài nhược điểm:

- Rất khó tái tạo lần build trước đó, vì mỗi lần build lại image, nó có thể dùng một revision khác cho recipe của chúng ta.
- Giá trị `AUTOREV` chỉ được áp dụng khi BitBake làm mất hiệu lực cache của một recipe cụ thể. Điều đó xảy ra khi chúng ta sửa đổi chính recipe hoặc khi thay đổi điều gì đó kích hoạt việc build lại cache của BitBake, như thay đổi bất kỳ file `.conf` nào.

Những nhược điểm đó khiến `AUTOREV` rất mong manh, và các giải pháp thay thế khác có thể đáp ứng việc thay đổi code tương tác một cách nhất quán hơn. Thông thường, `devtool` được dùng vì nó cho phép chúng ta thay đổi code trực tiếp trong workspace và buộc recipe dùng nó làm source. Một giải pháp thay thế khác là dùng class `externalsrc.bbclass` ([https://docs.yoctoproject.org/4.0.4/index.html#ref-classes-externalsrc](https://docs.yoctoproject.org/4.0.4/index.html#ref-classes-externalsrc)), class này cho phép chúng ta cấu hình một recipe dùng một thư mục làm source cho việc build.

### Tạo Software Bill of Materials

Build system Poky có thể mô tả tất cả các thành phần được dùng trong một image từ license của từng thành phần phần mềm. Mô tả này được tạo ra dưới dạng một **Software Bill of Materials** (**SBOM**) dùng chuẩn **Software Package Data Exchange** (**SPDX**) ([https://spdx.dev/](https://spdx.dev/)). Dùng định dạng SPDX có ưu điểm là tận dụng được các công cụ hiện có, cho phép tự động hóa thêm, điều không thể làm được với định dạng output license chuẩn của Poky.

SBOM là yếu tố quan trọng để bảo đảm việc tuân thủ license open source. Tuy nhiên, SBOM không được tạo ra theo mặc định. Bạn có thể tham khảo phần *Creating a Software Bill of Materials* của *The Yocto Project Development Tasks Manual* ([https://docs.yoctoproject.org/4.0.4/dev-manual/common-tasks.html#creating-a-software-bill-of-materials](https://docs.yoctoproject.org/4.0.4/dev-manual/common-tasks.html#creating-a-software-bill-of-materials)).

## Các hướng dẫn nên tuân theo cho các project nói chung

Phần này bàn về một số hướng dẫn project-related nên tuân theo để giảm rủi ro chung của project và tránh các cạm bẫy thường gặp.

### Liên tục theo dõi các ràng buộc license của project

Tùy theo project chúng ta đang làm, việc tuân thủ license có thể là một chủ đề lớn hoặc nhỏ. Một số project có các ràng buộc license rất chặt chẽ, như sau:

- Không được dùng phần mềm GPLv3-released
- Lây nhiễm copyleft vào tài sản trí tuệ project-specific
- Các ràng buộc license Company-wise

Lời khuyên là bắt đầu quá trình này ngay từ đầu project, giảm khối lượng làm lại trong suốt project. Tuy nhiên, các ràng buộc license của project và license của các thành phần project có thể thay đổi, đòi hỏi chúng ta phải liên tục theo dõi việc tuân thủ license.

### Bảo mật có thể gây hại cho project của bạn

Trong kỷ nguyên hyper-connected của chúng ta, mọi thiết bị kết nối đều là mục tiêu tiềm năng của một cuộc tấn công bảo mật. Là các developer thiết bị embedded, chúng ta nên góp phần tạo nên một nơi an toàn hơn. Chúng ta nên làm những việc sau:

- Quét phần mềm embedded Linux của mình để tìm các lỗ hổng bảo mật đã biết
- Theo dõi các bản sửa lỗi bảo mật cho phần mềm quan trọng
- Triển khai một quy trình để sửa các thiết bị ngoài thực địa

Chúng ta có thể dùng hạ tầng của Yocto Project, như đã bàn trong phần *Checking for Vulnerabilities* của *Yocto Project Development Tasks Manual* ([https://docs.yoctoproject.org/4.0.4/dev-manual/common-tasks.html#checking-for-vulnerabilities](https://docs.yoctoproject.org/4.0.4/dev-manual/common-tasks.html#checking-for-vulnerabilities)), để quét các **Common Vulnerabilities and Exposures** (**CVE**) đã biết cho các recipe của mình. Chúng ta không nên chỉ giới hạn ở đó, vì các thành phần BSP cũng có thể cần các bản sửa lỗi bảo mật, điều mà các nhà cung cấp BSP thường bỏ qua. Tuy vậy, mức độ cảnh giác phụ thuộc vào lĩnh vực của project.

### Đừng đánh giá thấp chi phí bảo trì

Thoạt đầu, việc đưa các thay đổi của chúng ta lên upstream có vẻ không mang tính chiến lược vì những lý do sau:

- Việc đưa lên upstream tốn tài nguyên để điều chỉnh các sửa đổi
- Phản hồi review từ upstream có thể đòi hỏi thêm các lần trao đổi và làm lại
- Phải thực hiện các công việc phát triển không gắn trực tiếp với sản phẩm

Thông thường, các nhóm phát triển và quản lý đánh giá thấp tổng chi phí bảo trì. Nhưng đáng tiếc, đây thường là phần tốn kém nhất của project, vì nó kéo dài nhiều năm. Đưa các thay đổi lên project tương ứng ở upstream cho phép chúng ta làm những việc sau:

- Tránh trùng lặp công việc qua nhiều năm
- Giảm trở ngại khi nâng cấp lên các bản phát hành Yocto Project mới
- Nhận được phản hồi phản biện và mang tính xây dựng về các thay đổi chúng ta đang đưa lên upstream
- Giảm khối lượng công việc với các bản cập nhật bảo mật và bản sửa bug
- Giảm lượng code mà chúng ta phải bảo trì

Công việc upstream là liên tục. Mỗi lần thêm một tính năng mới, chúng ta có thể làm tăng khoảng cách giữa code của mình và upstream. Vì vậy, chúng ta có thể hoãn công việc upstream, nhưng chi phí upstream sẽ bị nhân lên khi bạn cập nhật lên bản phát hành Yocto Project tiếp theo.

### Xử lý các điểm rủi ro và ràng buộc của project càng sớm càng tốt

Vì phần mềm và phần cứng phải hoạt động cùng nhau, một vài khía cạnh phụ thuộc trực tiếp vào thiết kế phần cứng của chúng ta. Để giảm rủi ro cho project, chúng ta nên dự đoán càng nhiều yêu cầu phần mềm và phần cứng quan trọng càng tốt, để có thể kiểm chứng một số khía cạnh, như sau:

- Lượng bộ nhớ chúng ta dự định dùng là đủ hay quá nhiều?
- Lượng điện năng phần cứng sử dụng có đáp ứng được các ràng buộc của chúng ta không?
- GPU của target có khả năng render các animation mà chúng ta cần không?
- Tất cả các thiết bị ngoại vi đã lên kế hoạch có sẵn driver Linux kernel sẵn sàng để dùng không, hay chúng ta cần lên kế hoạch phát triển các driver đó?

Các câu hỏi trên có thể được trả lời bằng cách dùng một board tham chiếu hoặc một board well-known, mà chúng ta có BSP sẵn sàng để dùng. Điều này cho phép chúng ta tạo ra một **Minimal Viable Product** (**MVP**) mà không cần thiết kế phần cứng tùy chỉnh của mình. Sau khi kiểm chứng các rủi ro và ràng buộc của project, các board đó vẫn là những tài sản quý giá cho những việc sau:

- Tiếp tục phát triển phần mềm cho đến khi board và BSP tùy chỉnh sẵn sàng để dùng
- Làm cơ sở so sánh với thiết kế tùy chỉnh của chúng ta
- Làm tham chiếu để xác minh một bug có phải là riêng của board và BSP tùy chỉnh của chúng ta hay không

Xét việc chúng ta có thể phát triển phần mềm bằng một board tham chiếu hoặc một board well-known, chúng ta nên hoãn việc thiết kế board tùy chỉnh càng lâu càng tốt. Việc trì hoãn thiết kế cho chúng ta sự tự do thay đổi nhiều khía cạnh của project, như thay đổi một thiết bị ngoại vi vì một driver cụ thể hoặc thậm chí thay đổi CPU và dung lượng bộ nhớ đã lên kế hoạch sau khi ứng dụng và các tính năng đã hoàn thiện.

Khi cuối cùng quyết định đi theo một thiết kế tùy chỉnh, chúng ta nên giữ nó càng gần càng tốt với board mà chúng ta chọn làm tham chiếu. Nhưng tất nhiên, đôi khi chúng ta cần đi chệch khỏi thiết kế tham chiếu. Tuy vậy, điều đó đi kèm với rủi ro phát sinh các vấn đề thiết kế và làm tăng chi phí cho BSP tùy chỉnh của chúng ta.

## Tóm tắt

Phù! Trong chương cuối cùng này, bạn đã được giới thiệu một tập các thực hành tốt mà các tác giả đã dùng trong các project real-life của mình. Chúng tôi hy vọng chúng đã cho bạn một số điểm cần cân nhắc khi lên kế hoạch cho project tiếp theo.

Xuyên suốt cuốn sách, chúng ta đã đề cập các kiến thức nền tảng cần thiết để bạn có thể tự học bất kỳ khía cạnh nào khác của Yocto Project mà bạn có thể cần. Vì vậy, giờ đây bạn đã có hiểu biết tổng quát về những gì đang diễn ra ở phía sau khi bạn yêu cầu BitBake build một recipe hay một image. Từ bây giờ, bạn đã sẵn sàng giải phóng tâm trí và thử những điều mới. Giờ quả bóng đang ở phía bạn – đây là nơi niềm vui bắt đầu!
