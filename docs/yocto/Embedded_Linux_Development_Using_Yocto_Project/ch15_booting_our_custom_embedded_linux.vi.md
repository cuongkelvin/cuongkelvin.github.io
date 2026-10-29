# Chương 15: Boot hệ thống embedded Linux tùy chỉnh của chúng ta (Booting Our Custom Embedded Linux)

Đã đến lúc! Chúng ta đã sẵn sàng boot hệ thống embedded Linux custom-made của mình, vì chúng ta đã học các khái niệm cần thiết và có đủ kiến thức về Yocto Project và Poky. Trong chương này, chúng ta sẽ thực hành những gì đã học cho đến nay về việc dùng Poky với các BSP layer bên ngoài để tạo một image dùng cho các machine sau và boot nó bằng thẻ SD:

- BeagleBone Black
- Raspberry Pi 4
- VisionFive

Các khái niệm trong chương này có thể được áp dụng cho mọi board khác, miễn là nhà cung cấp có cung cấp một BSP layer để dùng với Yocto Project.

## Tìm BSP layer phù hợp

Trong *Chương 11*, *Khám phá các layer bên ngoài*, chúng ta đã học rằng Yocto Project cho phép chia metadata của nó ra các layer khác nhau. Nó tổ chức metadata để chúng ta có thể chọn chính xác meta layer nào sẽ thêm vào project của mình.

Cách tìm BSP cho một board thay đổi tùy trường hợp, nhưng nhìn chung, chúng ta có thể tìm thấy nó bằng cách truy cập [https://layers.openembedded.org](https://layers.openembedded.org). Chúng ta có thể tìm theo tên machine và website sẽ tìm ra layer nào chứa machine đó trong cơ sở dữ liệu của nó.

### Xem xét các khía cạnh ảnh hưởng đến việc dùng phần cứng

Các board được dùng trong chương này được bảo trì tốt và dễ dùng. Tuy nhiên, dùng một board khác cũng là một lựa chọn hợp lệ, nhưng kết quả có thể khác nhau.

Khi chọn một board, bước đầu tiên là kiểm tra chất lượng hỗ trợ phần mềm của nó. Các thành phần low-level bao gồm những thứ sau:

- Bootloader (như U-Boot, GRUB hoặc systemd-boot)
- Linux kernel (cùng các driver cần thiết khác như GPU hoặc WiFi)
- Các package user space cần cho tăng tốc phần cứng

Đó là những thành phần quan trọng nhưng không phải là những khía cạnh duy nhất cần xem xét. Việc tích hợp vào bên trong Yocto Project, dưới dạng một BSP layer, giảm bớt trở ngại khi dùng board vì nó thường cung cấp những thứ sau:

- Một bố cục phân vùng đĩa có thể dùng lại (ví dụ, một template WIC `.wks`)
- Các định nghĩa machine Ready-to-use
- Các package user space được tích hợp cho tăng tốc phần cứng (dùng được ngay)

Mức độ trưởng thành của việc hỗ trợ phần mềm, và BSP Yocto Project, ảnh hưởng đáng kể đến trở ngại khi dùng board và trải nghiệm out-of-the-box khi dùng Poky cho các board khác nhau.

### Xem qua các BSP layer được dùng rộng rãi

Chúng ta sẽ xem một danh sách các BSP layer được dùng rộng rãi trong chương này. Không nên xem đây là một danh sách đầy đủ hay một danh sách chính thức. Tuy vậy, chúng tôi muốn giúp bạn dễ tìm layer cần thiết hơn trong trường hợp bạn có sẵn bên mình một board của một nhà cung cấp cụ thể. Danh sách như sau, theo thứ tự bảng chữ cái:

- *Allwinner*: Có layer `meta-allwinner`
- *AMD*: Có layer `meta-amd`
- *Intel*: Có layer `meta-intel`
- *NXP*: Có các layer `meta-freescale` và `meta-freescale-3rdparty`
- *Raspberry Pi*: Có layer `meta-raspberrypi`
- *RISC-V*: Có layer `meta-riscv`
- *Texas Instruments*: Có layer `meta-ti`

Trong các phần tiếp theo, chúng ta bắt đầu làm việc với các board ví dụ.

## Dùng phần cứng vật lý

Để thuận tiện cho việc khám phá các khả năng của Yocto Project, tốt nhất là có một board thật để chúng ta có thể tận hưởng trải nghiệm boot hệ thống embedded được tùy chỉnh của mình. Vì vậy, chúng tôi đã cố gắng chọn những board phổ biến nhất để khả năng bạn sở hữu một board là cao hơn.

Các phần tiếp theo sẽ đề cập các bước cho những board sau:

- *BeagleBone Black*: BeagleBone Black là community-based, với các thành viên trên toàn thế giới. Thông tin thêm có tại [https://beagleboard.org/black/](https://beagleboard.org/black/).
- *Raspberry Pi 4*: Board ARM64-based nổi tiếng nhất với cộng đồng trải rộng nhất trên toàn thế giới. Xem thêm chi tiết tại [https://www.raspberrypi.org/](https://www.raspberrypi.org/).
- *VisionFive*: Thế hệ board RISC-V giá phải chăng đầu tiên trên thế giới được thiết kế để chạy Linux. Xem thêm chi tiết tại [https://www.starfivetech.com/en](https://www.starfivetech.com/en).

Tất cả các board được liệt kê đều được duy trì bởi các tổ chức non-profit hoạt động dựa trên giáo dục và hướng dẫn, điều này khiến cộng đồng trở thành một nơi màu mỡ để khám phá thế giới embedded Linux. Bảng sau tóm tắt các board và các tính năng chính của chúng:

| **Phiên bản board** | **Tính năng** |
|---|---|
| BeagleBone Black | TI AM335x (single-core) RAM 512 MB |
| Raspberry Pi 4 | CPU Broadcom BCM2711 64bit (quad-core) RAM từ 1 GB đến 8 GB |
| VisionFive | U74 Dual-Core RAM 8 GB |

*Bảng 15.1 – Thông số phần cứng của các board được đề cập*

Trong các phần tiếp theo, chúng ta sẽ build và boot image Yocto Project cho từng machine được đề xuất. Bạn chỉ nên đọc phần dành cho board mà bạn sở hữu. Hãy bảo đảm tham khảo tài liệu của board để hiểu cách chuẩn bị board cho việc vận hành.

## BeagleBone Black

Trong hai phần tiếp theo, chúng ta sẽ đi qua các bước build và boot một image cho board *BeagleBone Black*.

### Build cho BeagleBone Black

Để dùng board này, chúng ta có thể dựa vào layer `meta-yocto-bsp`, được bao gồm mặc định trong Poky. Meta layer này có thể được truy cập tại [https://git.yoctoproject.org/meta-yocto/tree/meta-yocto-bsp?h=kirkstone](https://git.yoctoproject.org/meta-yocto/tree/meta-yocto-bsp?h=kirkstone).

Để tạo cấu trúc source, hãy tải Poky bằng dòng lệnh sau:

```
git clone git://git.yoctoproject.org/poky -b kirkstone
```

Sau khi hoàn tất việc này, chúng ta phải tạo thư mục build mà chúng ta dùng cho các lần build. Chúng ta có thể làm điều này bằng dòng lệnh sau:

```
source oe-init-build-env build
```

Sau khi đã có thư mục `build` và các BSP layer được thiết lập đúng cách, chúng ta có thể bắt đầu build. Bên trong thư mục `build`, chúng ta phải gọi lệnh sau:

```
MACHINE=beaglebone-yocto bitbake core-image-full-cmdline
```

Biến `MACHINE` có thể được thay đổi tùy theo board mà chúng ta muốn dùng, hoặc được đặt trong `build/conf/local.conf`.

### Boot BeagleBone Black

Sau khi quá trình build kết thúc, image sẽ có sẵn bên trong thư mục `build/tmp/deploy/images/beaglebone-yocto/`. File mà chúng ta muốn dùng là `core-image-full-cmdline-beaglebone-yocto.wic`.

Hãy bảo đảm bạn trỏ tới đúng thiết bị và double-check để không ghi đè lên ổ cứng của bạn.

Để copy image `core-image-full-cmdline` vào thẻ SD, chúng ta nên dùng tiện ích `dd`, như sau:

```
sudo dd if=core-image-full-cmdline-beaglebone-yocto.wic of=/dev/<media>
```

Sau khi copy nội dung vào thẻ SD, hãy cắm thẻ vào khe thẻ SD, nối cáp HDMI và bật nguồn machine. Nó sẽ boot suôn sẻ.

> **Lưu ý**
>
> Trình tự boot của BeagleBone Black bắt đầu bằng việc thử boot từ eMMC và chỉ thử boot từ thẻ SD trong trường hợp boot từ eMMC thất bại. Nhấn nút **USER**/**BOOT** khi bật nguồn sẽ tạm thời thay đổi thứ tự boot, bảo đảm việc boot diễn ra từ thẻ SD. Để điều chỉnh thêm các hướng dẫn này cho board của bạn, hãy tham khảo tài liệu tại [http://www.beagleboard.org/black](http://www.beagleboard.org/black).

## Raspberry Pi 4

Trong hai phần tiếp theo, chúng ta sẽ đi qua các bước build và boot một image cho board *Raspberry Pi 4*.

### Build cho Raspberry Pi 4

Để thêm hỗ trợ board này vào project, chúng ta cần đưa vào meta layer `meta-raspberrypi`, là BSP layer hỗ trợ các board Raspberry Pi, bao gồm Raspberry Pi 4 nhưng không giới hạn ở đó. Meta layer này có thể được truy cập tại [http://git.yoctoproject.org/cgit.cgi/meta-raspberrypi/log/?h=kirkstone](http://git.yoctoproject.org/cgit.cgi/meta-raspberrypi/log/?h=kirkstone).

Để tạo cấu trúc source, hãy tải Poky bằng dòng lệnh sau:

```
git clone git://git.yoctoproject.org/poky -b kirkstone
```

Sau khi hoàn tất việc này, chúng ta phải tạo thư mục `build` mà chúng ta dùng cho các lần build và thêm BSP layer. Chúng ta có thể làm điều này bằng các dòng lệnh sau:

```
source oe-init-build-env build
bitbake-layers layerindex-fetch meta-raspberrypi
```

Sau khi đã có thư mục `build` và các BSP layer được thiết lập đúng cách, chúng ta có thể bắt đầu build. Bên trong thư mục `build`, chúng ta phải gọi lệnh sau:

```
MACHINE=raspberrypi4 bitbake core-image-full-cmdline
```

Biến `MACHINE` có thể được thay đổi tùy theo board mà chúng ta muốn dùng, hoặc được đặt trong `build/conf/local.conf`.

### Boot Raspberry Pi 4

Sau khi quá trình build kết thúc, image sẽ có sẵn bên trong thư mục `build/tmp/deploy/images/raspberrypi4/`. File mà chúng ta muốn dùng là `core-image-full-cmdline-raspberrypi4.wic.bz2`.

Hãy bảo đảm bạn trỏ tới đúng thiết bị và double-check để không ghi đè lên ổ cứng của bạn.

Để copy image `core-image-full-cmdline` vào thẻ SD, chúng ta nên dùng tiện ích `dd`, như sau:

```
bzcat core-image-full-cmdline-raspberrypi4.wic.bz2 | sudo dd of=/dev/<media>
```

Sau khi copy nội dung vào thẻ SD, hãy cắm thẻ vào khe thẻ SD, nối cáp HDMI và bật nguồn machine. Nó sẽ boot suôn sẻ.

## VisionFive

Trong hai phần tiếp theo, chúng ta sẽ đi qua các bước build và boot một image cho board *VisionFive*.

### Build cho VisionFive

Để thêm hỗ trợ board này vào project, chúng ta cần đưa vào meta layer `meta-riscv`, là BSP layer hỗ trợ các board RISC-V-based, bao gồm VisionFive nhưng không giới hạn ở đó. Meta layer này có thể được truy cập tại [https://github.com/riscv/meta-riscv/tree/kirkstone](https://github.com/riscv/meta-riscv/tree/kirkstone).

Để tạo cấu trúc source, hãy tải Poky bằng dòng lệnh sau:

```
git clone git://git.yoctoproject.org/poky -b kirkstone
```

Sau khi hoàn tất việc này, chúng ta phải tạo thư mục `build` mà chúng ta sẽ dùng cho các lần build và thêm BSP layer. Chúng ta có thể làm điều này bằng các dòng lệnh sau:

```
source oe-init-build-env build
bitbake-layers layerindex-fetch meta-riscv
```

Sau khi đã có thư mục `build` và các BSP layer được thiết lập đúng cách, chúng ta có thể bắt đầu build. Bên trong thư mục `build`, chúng ta phải gọi lệnh sau:

```
MACHINE=visionfive bitbake core-image-full-cmdline
```

Biến `MACHINE` có thể được thay đổi tùy theo board mà chúng ta muốn dùng, hoặc được đặt trong `build/conf/local.conf`.

### Boot VisionFive

Sau khi quá trình build kết thúc, image sẽ có sẵn bên trong thư mục `build/tmp/deploy/images/visionfive/`. File mà chúng ta muốn dùng là `core-image-full-cmdline-visionfive.wic.gz`.

Hãy bảo đảm bạn trỏ tới đúng thiết bị và double-check để không ghi đè lên ổ cứng của bạn.

Để copy image `core-image-full-cmdline` vào thẻ SD, chúng ta nên dùng tiện ích `dd`, như sau:

```
zcat core-image-full-cmdline-visionfive.wic.gz | sudo dd of=/dev/<media>
```

Sau khi copy nội dung vào thẻ SD, hãy cắm thẻ vào khe thẻ SD, nối cáp HDMI và bật nguồn machine.

> **Lưu ý**
>
> VisionFive không có boot target mặc định và cần can thiệp thủ công để boot. Hãy dùng các lệnh sau bên trong dấu nhắc U-Boot qua một serial console:
>
> **setenv bootcmd “run distro\_bootcmd”**
>
> **saveenv**
>
> **boot**
>
> Lệnh `saveenv` là tùy chọn, giúp cấu hình mới được lưu lại để nó có thể hoạt động ngay sau khi khởi động lại.
>
> Hãy xem cách lấy serial console trong *Quick Start Guide* ([https://doc-en.rvspace.org/VisionFive/Quick\_Start\_Guide/](https://doc-en.rvspace.org/VisionFive/Quick_Start_Guide/)).

## Các bước tiếp theo

Phù! Chúng ta đã làm xong! Giờ đây bạn đã biết những điều cơ bản về build system Yocto Project và có khả năng mở rộng các lĩnh vực kiến thức khác của mình. Chúng tôi đã cố gắng đề cập các task hằng ngày phổ biến nhất khi dùng Yocto Project. Có một vài điều bạn có thể muốn thực hành:

- Tạo các file `bbappend` để áp dụng patch hoặc thực hiện các thay đổi khác cho một recipe
- Tạo các image tùy chỉnh của bạn
- Thay đổi file cấu hình Linux kernel (`defconfig`)
- Thay đổi cấu hình BusyBox và đưa vào các configuration fragment để thêm hoặc bỏ một tính năng trong một layer
- Thêm một recipe mới cho một package
- Tạo một product layer với các machine, recipe và image product-specific của bạn

Hãy nhớ rằng, source code là nguồn kiến thức tối thượng, vì vậy hãy dùng nó.

Khi tìm cách làm một việc gì đó, việc tìm một recipe tương tự giúp bạn tiết kiệm thời gian thử nghiệm các cách tiếp cận khác nhau để giải quyết vấn đề.

Rốt cuộc, nhiều khả năng bạn sẽ thấy mình ở vị trí sửa hoặc cải thiện một điều gì đó trong OpenEmbedded Core, một meta layer, hoặc trong một BSP. Vì vậy, đừng ngại – hãy gửi patch và đón nhận phản hồi cùng các yêu cầu thay đổi như một cơ hội để học hỏi và cải thiện cách giải quyết vấn đề của bạn.

## Tóm tắt

Chúng ta đã học cách tìm BSP cho một board mà chúng ta muốn dùng trong project. Chúng ta đã củng cố kiến thức về Yocto Project bằng cách thêm các BSP layer bên ngoài và dùng chúng trên các board thật với một image được tạo ra. Chúng ta cũng đã củng cố các kiến thức nền tảng cần thiết để tìm hiểu bất kỳ khía cạnh nào khác của Yocto Project mà bạn có thể cần.

Trong chương tiếp theo, chúng ta sẽ khám phá cách dùng QEMU giúp tăng tốc việc phát triển sản phẩm bằng cách cho phép chúng ta không phải phụ thuộc vào phần cứng trong mọi chu kỳ phát triển.
