# Chương 5: Tìm hiểu và sử dụng Device Tree

Device tree là file mô tả hardware easy-to-read, có cách định dạng JSON-like. Đây là cấu trúc cây đơn giản, trong đó device được biểu diễn bằng node và các property của chúng. Property có thể rỗng (tức chỉ có key để mô tả giá trị Boolean) hoặc là cặp key-value, trong đó value có thể chứa byte stream tùy ý. Chương này giới thiệu đơn giản về device tree. Mỗi kernel subsystem hoặc framework có device tree binding riêng; chúng ta sẽ bàn về những binding cụ thể đó khi xử lý các chủ đề liên quan.

Device tree bắt nguồn từ Open Firmware (OF), một tiêu chuẩn được các công ty máy tính ủng hộ, có mục đích chính là định nghĩa interface cho hệ thống firmware máy tính. Bạn có thể tìm hiểu thêm về đặc tả device tree tại http://www.devicetree.org/. Vì vậy, chương này sẽ đề cập những kiến thức cơ bản về device tree, bao gồm:

- Tìm hiểu khái niệm cơ bản của cơ chế device tree

- Mô tả các data type và API của chúng

- Biểu diễn và định địa chỉ device

- Xử lý resource

## Tìm hiểu khái niệm cơ bản của cơ chế device tree

Hỗ trợ device tree được enable trong kernel bằng cách đặt option `CONFIG_OF` thành `Y`. Để sử dụng device tree API từ driver, bạn phải thêm các header sau:

```
#include <linux/of.h>
#include <linux/of_device.h>
```

Device tree hỗ trợ một số data type và quy ước viết mà chúng ta có thể tổng hợp bằng mô tả node mẫu:

```
/* This is a comment */
// This is another comment
node_label: nodename@reg{
   string-property = "a string";
   string-list = "red fish", "blue fish";
   one-int-property = <197>; /* One cell in the property */
   int-list-property = <0xbeef 123 0xabcd4>;
   mixed-list-property = "a string", <35>,[0x01 0x23 0x45];
   byte-array-property = [0x01 0x23 0x45 0x67];
   boolean-property;
};
```

Trong ví dụ trên, `int-list-property` là property trong đó mỗi number (hay cell) là integer 32-bit (`uint32`), và property này có ba cell. Ở đây, đúng như tên gọi, `mixed-list-property` là property có các phần tử thuộc nhiều type khác nhau.

Sau đây là một số định nghĩa về data type được dùng trong device tree:

- Text string được biểu diễn bằng dấu ngoặc kép. Có thể dùng dấu phẩy để tạo danh sách string.

- Cell là unsigned integer 32-bit nằm trong dấu ngoặc nhọn góc.

- Data Boolean chỉ là property rỗng. Giá trị true hay false phụ thuộc property có hiện diện hay không.

Chúng ta đã dễ dàng liệt kê các loại data có thể gặp trong device tree. Trước khi tìm hiểu những API có thể dùng để parse data này, hãy hiểu cách quy ước đặt tên của device tree hoạt động.

## Quy ước đặt tên trong device tree

Mỗi node phải có tên theo dạng `<name>[@<address>]`, trong đó `<name>` là string dài tối đa 31 character, còn `[@<address>]` là tùy chọn, phụ thuộc node có biểu diễn device có thể định địa chỉ hay không. Theo đó, `<address>` nên là địa chỉ chính dùng để truy cập device. Ví dụ, với memory-mapped device, nó phải tương ứng địa chỉ bắt đầu của memory region; với I2C device là địa chỉ device trên bus; và với SPI device node là chip-select index (tương đối so với controller).

Sau đây là một số ví dụ đặt tên device:

```
i2c@021a0000 {
    compatible = "fsl,imx6q-i2c", "fsl,imx21-i2c";
    reg = <0x021a0000 0x4000>;
    [...]
    expander@20 {
        compatible = "microchip,mcp23017";
        reg = <20>;
        [...]
    };
};
```

Trong đoạn trích device tree trên, I2C controller là memory-mapped device. Vì thế, phần địa chỉ trong tên node tương ứng với đầu memory region của nó, tương đối so với memory map của System on Chip (SoC). Tuy nhiên, expander là I2C device. Do đó, phần địa chỉ trong tên node của nó tương ứng với I2C address.

## Giới thiệu khái niệm alias, label, phandle và path

Alias, label, phandle và path là các từ khóa bạn cần quen thuộc khi làm việc với device tree. Có khả năng bạn sẽ gặp ít nhất một, nếu không phải tất cả, các thuật ngữ này khi làm việc với device driver. Để mô tả chúng, hãy lấy đoạn trích device tree sau làm ví dụ:

```
aliases {
    ethernet0 = &fec;
    gpio0 = &gpio1;
    [...];
};
bus@2000000 { /* AIPS1 */
    gpio1: gpio@209c000 {
        compatible = "fsl,imx6q-gpio", "fsl,imx35-gpio";
        reg = <0x0209c000 0x4000>;
        interrupts = <0 66 IRQ_TYPE_LEVEL_HIGH>,
                    <0 67 IRQ_TYPE_LEVEL_HIGH>;
        gpio-controller;
        #gpio-cells = <2>;
        interrupt-controller;
        #interrupt-cells = <2>;
    };
    [...];
};
bus@2100000 { /* AIPS2 */
    [...]
    i2c1: i2c@21a0000 {
        compatible = "fsl,imx6q-i2c", "fsl,imx21-i2c";
        reg = <0x021a0000 0x4000>;
        interrupts = <0 36 IRQ_TYPE_LEVEL_HIGH>;
        clocks = <&clks IMX6QDL_CLK_I2C1>;
    };
};
&i2c1 {
    eeprom-24c512@55 {
        compatible = "atmel,24c512";
        reg = <0x55>;
    };
    accelerometer@1d {
        compatible = "adi,adxl345";
        reg = <0x1d>;
        interrupt-parent = <&gpio1>;
        interrupts = <24 IRQ_TYPE_LEVEL_HIGH>,
        <25 IRQ_TYPE_LEVEL_HIGH>;
        [...]
    };
[...]
};
```

Trong device tree có hai cách tham chiếu node: bằng path hoặc bằng phandle. Khi tham chiếu node bằng path, bạn phải chỉ định tường minh full path của node trong device tree source, điều này có thể phức tạp với node lồng sâu. Mặt khác, phandle là giá trị 32-bit duy nhất gắn với node, được dùng để nhận diện duy nhất node đó. Nó được gán cho node thông qua property `phandle` và đôi khi được lặp lại trong property `linux,phandle` vì lý do lịch sử.

Tuy nhiên, định dạng device tree source cho phép gắn label vào bất kỳ node hoặc property value nào. Vì label phải duy nhất trên toàn bộ device tree source của một board, rõ ràng nó cũng có thể dùng để nhận diện node, và người ta đã quyết định làm như vậy. Do đó, logic đã được thêm vào device tree compiler (DTC) để mỗi khi tên label có tiền tố dấu ampersand (`&`) trong cell property, nó được thay bằng phandle của node gắn label đó. Ngoài ra, với cùng logic, khi label có tiền tố ampersand bên ngoài cell (phép gán giá trị đơn giản), nó được thay bằng full path của node gắn label. Theo cách này, phandle reference và path reference có thể được tạo tự động bằng cách tham chiếu label thay vì chỉ định tường minh phandle value hoặc full path tới node. LƯU Ý

Label chỉ được dùng trong định dạng device tree source và không được mã hóa trong device tree blob (DTB). Khi node được gắn label và được tham chiếu ở nơi khác bằng label đó, tại compile time, công cụ `dtc` sẽ xóa label khỏi node và thêm property `phandle` vào node, tạo và gán giá trị 32-bit duy nhất. Sau đó công cụ `dtc` sẽ dùng phandle này trong mọi cell nơi node được tham chiếu bằng label (có tiền tố ampersand).

Trở lại đoạn trích trên, node `gpio@0209c000` có label `gpio1`, và label này cũng được dùng làm reference. Điều đó yêu cầu DTC tạo phandle cho node này. Vì vậy, trong node `accelerometer@1d`, bên trong property `interrupt-parent`, cell value (`&gpio1`) sẽ được thay bằng phandle của node gắn `gpio1` (phép gán bên trong cell). Tương tự, trong node `aliases`, `&gpio1` sẽ được thay bằng full path của node gắn `gpio1` (phép gán bên ngoài cell).

Sau khi compile rồi decompile đoạn trích device tree ban đầu, chúng ta thu được kết quả sau, trong đó label không còn tồn tại và label reference được thay bằng phandle hoặc full node path:

```
aliases {
    gpio0 = "/soc/aips-bus@2000000/gpio@209c000";
    ethernet0 = "/soc/aips-bus@2100000/ethernet@2188000";
    [...]
};
aips-bus@2000000 {
    gpio@209c000 {
        compatible = "fsl,imx6q-gpio", "fsl,imx35-gpio";
        gpio-controller;
        #interrupt-cells = <0x2>;
        interrupts = <0x0 0x42 0x4 0x0 0x43 0x4>;
        phandle = <0x40>;
        reg = <0x209c000 0x4000>;
        #gpio-cells = <0x2>;
        interrupt-controller;
    };
};
aips-bus@2100000 {
    i2c@21a8000 {
        compatible = "fsl,imx6q-i2c", "fsl,imx21-i2c";
        clocks = <0x4 0x7f>;
        interrupts = <0x0 0x26 0x4>;
        reg = <0x21a8000 0x4000>;
        eeprom-24c512@55 {
            compatible = "atmel,24c512";
            reg = <0x55>;
        };
        accelerometer@1d {
            compatible = "adi,adxl345";
            interrupt-parent = <0x40>;
            interrupts = <0x18 0x4 0x19 0x4>;
            reg = <0x1d>;
        };
    };
};
```

Trong đoạn code trên, cell của property `interrupt-parent` trong accelerometer node được gán giá trị `0x40`. Nhìn vào node `gpio@209c000`, có thể thấy giá trị này tương ứng giá trị property `phandle` của nó, được DTC tạo ở compile time. Tương tự với node `aliases`, nơi node reference đã được thay bằng full path của chúng.

Điều này dẫn tới định nghĩa alias: alias đơn giản là các node được tham chiếu qua absolute path để tra cứu nhanh. Node `aliases` có thể được xem là bảng tra cứu nhanh. Khác với label, alias xuất hiện trong device tree output, dù path được tạo bằng cách tham chiếu label. Với alias, handle tới node mà nó đề cập được lấy bằng cách tìm trong phần alias thay vì tìm trên toàn bộ device tree như khi tra cứu bằng phandle. Có thể xem alias là shortcut hoặc tương tự alias chúng ta đặt trong Unix shell để đề cập tới path/command đầy đủ, dài hoặc lặp đi lặp lại.

Linux kernel dereference alias thay vì dùng trực tiếp chúng trong device tree source. Khi dùng `of_find_node_by_path()` hoặc `of_find_node_opts_by_path()` để tìm node theo path, nếu path cung cấp không bắt đầu bằng `/`, phần tử đầu tiên của path phải là property name trong node `/aliases`. Phần tử đó được thay bằng full path từ alias.

LƯU Ý Gắn label cho node chỉ hữu ích nếu node dự kiến được tham chiếu từ property của node khác. Có thể coi label là pointer tới node, qua path hoặc qua reference.

## Tìm hiểu ghi đè node và property

Sau khi xem kỹ kết quả decompile đoạn trích, bạn sẽ nhận thấy thêm một điều: trong source ban đầu, node `i2c@21a0000` được tham chiếu qua label như external node (`&i2c1 { [...] }`) với một số nội dung bên trong. Tuy nhiên, đáng ngạc nhiên là sau khi decompile, nội dung cuối cùng của node `i2c@21a0000` được merge với nội dung của external reference, và external reference node không còn tồn tại.

Đây là cách dùng thứ ba của label: cho phép ghi đè node và property. Trong external reference, mọi nội dung mới (chẳng hạn node hoặc property) được nối vào nội dung node ban đầu tại compile time. Tuy nhiên, nếu trùng lặp (node hoặc property), nội dung external reference được ưu tiên hơn nội dung ban đầu.

Xét ví dụ sau:

```
bus@2100000 { /* AIPS2 */
    [...]
    i2c1: i2c@21a0000 {
        [...]
        status = "disabled";
    };
};
```

Hãy tham chiếu node `i2c@21a0000` qua label `i2c1` của nó, như sau:

```
&i2c1 {
    [...]
    status = "okay";
};
```

Chúng ta sẽ thấy kết quả compile là property `status` có giá trị `"okay"`. Điều này là vì nội dung external reference được ưu tiên hơn nội dung ban đầu.

Tóm lại, định nghĩa phía sau luôn ghi đè định nghĩa trước đó. Để ghi đè toàn bộ node, chỉ cần định nghĩa lại chúng như cách làm với property.

## Device tree source và compiler

Device tree (còn gọi là DT) có hai dạng. Thứ nhất là dạng text, biểu diễn source (còn gọi là DTS). Thứ hai là dạng binary blob, biểu diễn device tree đã compile, còn gọi là DTB (device tree blob) hoặc FDT (flattened device tree). Source file có phần mở rộng `.dts`, trong khi dạng binary có phần mở rộng `.dtb` hoặc `.dtbo`. .`dtbo` là phần mở rộng đặc biệt dùng cho device tree overlay đã compile (DTBO nghĩa là device tree blob for overlay), như sẽ thấy trong phần tiếp theo. Ngoài ra có text file `.dtsi` (chữ `i` cuối có nghĩa "include"). Chúng chứa định nghĩa ở SoC-level và được dự kiến include vào file `.dts`, nơi chứa định nghĩa ở board-level.

Cú pháp device tree cho phép dùng `/include/` hoặc `#include` để include file khác. Cơ chế include này cho phép dùng `#define`, nhưng trên hết, cho phép tách những đặc điểm chung của nhiều platform vào các file dùng chung.

Việc tách phần chung này cho phép chia source file thành các cấp trong cây, phổ biến nhất là cấp SoC do SoC vendor cung cấp (ví dụ NXP), cấp System on Module (SoM) (ví dụ Engicam), và cuối cùng là cấp carrier board hoặc customer board.

Vì vậy, mọi board điện tử dùng cùng SoC không phải định nghĩa lại từ đầu toàn bộ peripheral của SoC: mô tả này được tách vào file chung. Theo quy ước, file chung dùng phần mở rộng `.dtsi`, còn device tree cuối cùng dùng phần mở rộng `.dts`.

Trong Linux kernel source, ARM device tree source file có thể được tìm thấy trong thư mục `arch/arm/boot/dts/` và `arch/arm64/boot/dts/<vendor>/`, lần lượt cho ARM SoC/board 32-bit và 64-bit. Trong mỗi thư mục có file `Makefile` liệt kê các device tree source file có thể compile.

Tiện ích dùng để compile file DTS thành file DTB được gọi là DTC. DTC source tồn tại ở hai nơi:

- Dưới dạng dự án upstream độc lập: Dự án DTC upstream được duy trì tại https://git.kernel.org/cgit/utils/dtc/dtc.git. Nó được đưa vào Linux kernel source tree định kỳ.

- In-kernel: Phiên bản Linux của DTC có thể được tìm thấy trong thư mục kernel source tại `scripts/dtc/`. Phiên bản mới được lấy định kỳ từ dự án upstream. DTC được Linux kernel build process build như dependency khi cần (ví dụ trước khi compile device tree). Có thể dùng lệnh `make scripts` nếu muốn build tường minh nó trong Linux kernel source tree.

Từ thư mục chính trong kernel source, bạn có thể compile một device tree cụ thể hoặc mọi device tree cho một SoC cụ thể. Trong cả hai trường hợp, phải enable config option thích hợp để enable file hoặc các file device tree đó. Để compile một device tree, make target là tên file `.dts` với `.dts` đổi thành `.dtb`. Để compile mọi device tree đã enable, make target nên dùng là `dtbs`. Trong cả hai trường hợp, cần bảo đảm config option enable `dtb` đã được đặt.

Xét đoạn trích sau từ `arch/arm/boot/dts/Makefile`:

```
dtb-$(CONFIG_SOC_IMX6Q) += \
    imx6dl-alti6p.dtb \
    imx6dl-aristainetos_7.dtb \
[...]
    imx6q-hummingboard.dtb \
    imx6q-hummingboard2.dtb \
    imx6q-hummingboard2-emmc-som-v15.dtb \
    imx6q-hummingboard2-som-v15.dtb \
    imx6q-icore.dtb \
[...]
```

Bằng cách enable `CONFIG_SOC_IMX6Q`, bạn có thể compile mọi device tree file được liệt kê ở đó hoặc chọn một device tree cụ thể. Khi chạy `make dtbs`, kernel DTC sẽ compile mọi device tree file được liệt kê trong các config option đã enable.

Trước tiên, hãy bảo đảm config option thích hợp đã được đặt:

```
$ grep CONFIG_SOC_IMX6Q .config
CONFIG_SOC_IMX6Q =y
```

Sau đó, hãy compile mọi device tree file:

```
ARCH=arm CROSS_COMPILE=arm-linux-gnueabihf- make dtbs
```

Giả sử platform của chúng ta là ARM64 platform, chúng ta sẽ dùng như sau:

```
ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- make dtbs
```

Một lần nữa, phải đặt đúng kernel config option.

Bạn có thể nhắm tới build một device tree cụ thể (chẳng hạn `imx6q-hummingboard2.dts`), dùng lệnh như sau:

```
ARCH=arm CROSS_COMPILE=arm-linux-gnueabihf- make imx6q-hummingboard2.dtb
```

Cần lưu ý rằng với một device tree file đã compile (`.dtb`), bạn có thể thực hiện thao tác ngược và trích xuất source file (`.dts`):

```
$ dtc -I dtb -O dts arch/arm/boot/dts/imx6q-hummingboard2.dtb > path/to/my_devicetree.dts
```

Để debug, có thể hữu ích khi cung cấp cho user space device tree hiện tại của hệ thống đang chạy, tức so-called live device tree. Để làm điều đó, phải enable kernel config option `CONFIG_PROC_DEVICETREE`. Sau đó có thể khám phá và duyệt device tree trong thư mục `/proc/device-tree`.

Nếu được cài trên hệ thống đang chạy, DTC có thể dùng để chuyển filesystem tree sang dạng dễ đọc hơn bằng lệnh sau:

```
# dtc -I fs -O dts /sys/firmware/devicetree/base > MySBC.dts
```

Sau khi lệnh này return, file `MySBC.dts` sẽ chứa source tương ứng với device tree hiện tại.

### Device tree overlay

Device tree overlaying là cơ chế cho phép patch live device tree, tức sửa device tree hiện tại ở runtime. Nó cho phép cập nhật device tree hiện tại ở runtime bằng cách cập nhật node và property có sẵn hoặc tạo mới. Tuy nhiên, nó không cho phép xóa node hoặc property.

Device tree overlay có định dạng sau:

```
/dts-v1/;
/plugin/; /* allow undefined label references and record them */
/{
    fragment@0 { /* first child node */
        target=<phandle>; /* phandle of the target node to extend */
    or
        target-path="/path"; /* full path of the node to extend */
        __overlay__ {
            property-a;  /* add property-a to the target */
            property-b = <0x80>; /* update property-b value */
            node-a { /* add to an existing, or create a node-a */
                    ...
            };
        };
    };
    fragment@1 {
         /* second fragment overlay ... */
    };
    /* more fragments follow */
}
```

Từ đoạn trích trên, có thể thấy mỗi node trong base device tree cần được overlay phải nằm bên trong node `fragment` trong overlay device tree.

Sau đó, mỗi fragment có hai thành phần:

- Một trong hai property sau:

  - `target-path`: Chỉ định absolute path tới node mà fragment sẽ sửa.

  - `target`: Chỉ định relative path tới node alias (có tiền tố dấu ampersand) mà fragment sẽ sửa.

- Một node tên `__overlay__`, chứa những thay đổi cần áp dụng cho node được tham chiếu. Thay đổi có thể là node mới (được thêm), property mới (được thêm), hoặc property đã có (bị ghi đè bằng giá trị mới). Không có thao tác xóa vì không thể xóa property hoặc node.

Bây giờ đã nắm kiến thức cơ bản về device tree overlaying, chúng ta có thể học cách compile chúng thành binary blob có thể load theo yêu cầu.

Build device tree overlay

Trừ khi device tree overlay chỉ thêm node mới bên dưới root node (khi đó có thể chỉ định `/` trong property `target-path` của fragment), việc chỉ định target node qua phandle (`<&label_name>`) sẽ dễ hơn nhiều vì tránh phải tính thủ công full path của node (đặc biệt nếu node lồng nhau).

Vấn đề là không có tương quan hay liên kết trực tiếp giữa base device tree và overlay. Mỗi bên được build độc lập. Vì vậy, tham chiếu remote node (tức node trong base device tree) từ device tree overlay sẽ gây lỗi, và build overlay sẽ thất bại vì reference hoặc label chưa được định nghĩa. Điều này giống như build ứng dụng dynamically linked mà không có chỗ cho symbol resolution.

Để giải quyết vấn đề, hỗ trợ command-line flag `-@` đã được thêm vào DTC. Phải chỉ định flag này cho cả base device tree lẫn mọi overlay cần compile. Nó yêu cầu DTC tạo thêm node trong root (chẳng hạn `__symbols__`, `__fixups__` và `__local_fixups__`) chứa resolution data để chuyển đổi phandle name. Các node bổ sung này được phân bố như sau:

- Khi thêm option `-@` để build overlay, nó nhận diện dòng `/plugin/;` đánh dấu device tree fragment/object. Dòng đó điều khiển việc tạo node `__fixups__` và `__local_fixups__`.

- Khi thêm option `-@` để build base device tree, không có `/plugin/;`, nên source được nhận diện là base device tree, dẫn tới chỉ tạo node `__symbols__`.

Các node bổ sung này tạo chỗ cho symbol resolution.

LƯU Ý Hỗ trợ option `-@` chỉ có trong `dtc` phiên bản 1.4.4 trở lên. Chỉ Linux kernel phiên bản v4.14 trở lên mới chứa phiên bản `dtc` built-in đáp ứng yêu cầu này. Không cần option này nếu device tree overlay chỉ dùng property `target-path` (tức non-phandle-based).

Build binary device tree overlay theo cùng quy trình như build binary device tree truyền thống. Ví dụ, xét base device tree sau. Hãy gọi nó là `base.dts`:

```
/dts-v1/;
/ {
        foo: foonode {
                foo-bool-property;
                foo-int-property = <0x80>;
                status = "disabled";
        };
};
```

Sau đó, hãy build base device tree này bằng lệnh sau:

```
dtc -@ -I dts -O dtb -o base.dtb base.dts
```

Ở bước tiếp theo, xét device tree overlay sau. Hãy gọi nó là `foo-verlay.dts`:

```
/dts-v1/;
/plugin/;
/ {
        fragment@1 {
                target = <&foo>;
                __overlay__ {
                        overlay-1-property;
                        status = "okay";
                        bar: barnode {
                                bar-property;
                        };
                };
        };
};
```

Trong device tree overlay trên, property `status` của node `foo` trong base device tree được đổi từ `disabled` thành `okay`, kích hoạt node này. Sau đó, Boolean property `overlay-1-property` được thêm vào, và cuối cùng sub-node `bar` được thêm với một Boolean property duy nhất. Device tree overlay này có thể được compile bằng lệnh sau:

```
dtc -@ -I dts -O dtb -o foo-overlay.dtbo foo-overlay.dts
```

Như bạn thấy, flag `-@` được thêm ở cả hai phía, tạo chỗ cho symbol resolution.

LƯU Ý

Trong Yocto build system, có thể thêm flag này vào machine configuration hoặc, trong quá trình phát triển, vào file `local.conf`, như sau: `DEVICETREE_FLAGS += "-@"`.

Để Linux kernel build device tree overlay, bạn nên thêm nó vào device tree `Makefile` của SoC architecture, ví dụ `arch/arm64/boot/dts/freescale/Makefile` hoặc `arm/arm/boot/dts/Makefile`, cùng phần mở rộng `dtbo`, như sau:

```
dtb-y += foo-overlay.dtbo
```

Bây giờ đã có thể build device tree overlay riêng, hãy xét bước tiếp theo hợp lý: load các overlay này vào hệ thống.

Load device tree overlay qua configfs

Phần này được đặt tên có đề cập cách device tree overlay sẽ được load (configfs), vì có nhiều cách load device tree overlay. Trong phần này, chúng ta tập trung thực hiện trên hệ thống đang chạy, kernel đã boot và root filesystem đã được mount.

Để các bước sau hoạt động, kernel của bạn phải được compile với `CONFIG_OF_OVERLAY` và `CONFIG_CONFIGFS`. Sau đây là bước kiểm tra, giả sử kernel config sẵn có trên target:

```
~# zcat /proc/config.gz | grep CONFIGFS
CONFIG_CONFIGFS_FS=y
~# zcat /proc/config.gz | grep OF_OVERLAY
CONFIG_OF_OVERLAY=y
~#
```

Bây giờ đã đến lúc chèn DTB vào kernel đang chạy bằng `configfs`. Trước tiên, mount filesystem `configfs` nếu nó chưa được mount trên hệ thống:

```
# mount -t configfs none /sys/kernel/config
```

Khi `configfs` được mount đúng, thư mục sẽ có các base subdirectory (`device-tree/overlays`), theo mount path của chúng ta sẽ tạo thành `/sys/kernel/config/device-tree/overlays`, như minh họa sau:

```
# mkdir -p /sys/kernel/config/device-tree/overlays/
```

Sau đó, mỗi overlay entry phải được thêm từ trong thư mục `overlays`. Cần lưu ý rằng overlay entry được tạo và thao tác bằng filesystem I/O tiêu chuẩn.

Để load overlay, phải tạo thư mục tương ứng với overlay đó bên dưới thư mục `overlays`. Trong ví dụ, hãy dùng tên `foo`:

```
# mkdir /sys/kernel/config/device-tree/overlays/foo
```

Tiếp theo, để thực sự load overlay, bạn có thể `echo` path của overlay firmware file vào property file `path`, như sau:

```
# echo /path/to/foo-overlay.dtbo > /sys/kernel/config/device-tree/overlays/foo/path
```

Hoặc có thể `cat` nội dung overlay vào file `dtbo`:

```
# cat foo.dtbo > /sys/kernel/config/device-tree/overlays/foo/dtbo
```

Sau đó, overlay file được áp dụng và device được tạo/hủy theo yêu cầu.

Để xóa overlay và hoàn tác thay đổi của nó, chỉ cần `rmdir` thư mục overlay tương ứng. Trong ví dụ của chúng ta, sẽ như sau:

```
# rmdir /sys/kernel/config/device-tree/overlays/foo
```

Dù đã load device tree overlay động, như vậy vẫn chưa đủ; device driver cho device node được thêm phải được load để device hoạt động, trừ khi driver này đã built-in và được enable (tức được chọn bằng `y` trong `make menuconfig`).

Ở đây, chúng ta đã hoàn tất các nội dung compilation-related device tree. Bây giờ có thể học cách viết device tree riêng, bắt đầu từ định địa chỉ và biểu diễn device.

## Biểu diễn và định địa chỉ device

Trong device tree, node là đơn vị biểu diễn device. Nói cách khác, device được biểu diễn bằng ít nhất một node. Theo đó, device node có thể chứa các node khác (tạo quan hệ parent-child) hoặc các property (mô tả device tương ứng với node chứa chúng).

Dù mỗi device có thể hoạt động độc lập, có tình huống device muốn được parent truy cập hoặc parent muốn truy cập một child của nó. Ví dụ, điều này xảy ra khi bus controller (parent node) muốn truy cập một hoặc nhiều device (được khai báo là sub-node) trên bus của nó. Ví dụ điển hình gồm I2C controller và I2C device, SPI controller và SPI device, CPU và memory-mapped device, v.v. Vì vậy, khái niệm định địa chỉ device xuất hiện. Định địa chỉ device được đưa vào với property `reg`, dùng trong mỗi device có thể định địa chỉ, nhưng ý nghĩa hoặc cách diễn giải phụ thuộc parent (phần lớn là bus controller). Ý nghĩa và cách diễn giải `reg` trong child device phụ thuộc các property `#address-cells` và `#size-cells` của parent. Ký tự `#` (sharp) trước `size-cells` và `address-cells` có thể được hiểu là "độ dài của".

Mỗi device có thể định địa chỉ có property `reg` là danh sách tuple theo dạng `reg = <address0` `size0 [address1 size1] [address2 size2] ... >`, trong đó mỗi tuple biểu diễn address range mà device dùng. `#size-cells` chỉ số cell 32-bit dùng để biểu diễn size, có thể là 0 nếu size không liên quan. Mặt khác, `#address-cells` chỉ số cell 32-bit dùng để biểu diễn address. Nói cách khác, phần tử address của mỗi tuple được diễn giải theo `#address-cells`; điều này cũng áp dụng cho phần tử size, được diễn giải theo `#size-cells`. Tóm lại, device có thể định địa chỉ kế thừa các property `#size-cell` và `#address-cell` của parent, thường là node biểu diễn bus controller. Sự hiện diện của `#size-cell` và `#address-cell` trong một device không ảnh hưởng bản thân device đó mà ảnh hưởng các child của nó nếu chúng có thể định địa chỉ.

Bây giờ đã thấy cách định địa chỉ hoạt động nói chung, hãy xét cách định địa chỉ cụ thể cho non-discoverable device, bắt đầu với SPI và I2C.

## Xử lý định địa chỉ SPI device và I2C device

SPI device và I2C device đều thuộc non-memory-mapped device vì CPU không truy cập được địa chỉ của chúng. Thay vào đó, driver của parent device (bus controller driver) thực hiện truy cập gián tiếp thay cho CPU. Mỗi I2C/SPI device node luôn được biểu diễn là sub-node của I2C/SPI controller node mà device nằm trên đó. Với non-memory-mapped device, property `#size-cells` là 0 và phần tử size trong addressing tuple để trống. Điều này nghĩa là property `reg` của loại device này luôn có một cell. Sau đây là ví dụ:

```
&i2c3 {
    [...]
    status = "okay";
    temperature-sensor@49 {
        compatible = "national,lm73";
        reg = <0x49>;
    };
    pcf8523: rtc@68 {
        compatible = "nxp,pcf8523";
        reg = <0x68>;
    };
};
&ecspi1 {
    fsl,spi-num-chipselects = <3>;
    cs-gpios = <&gpio5 17 0>, <&gpio5 17 0>, <&gpio5 17 0>;
    status = "okay";
    [...]
    ad7606r8_0: ad7606r8@1 {
        compatible = "ad7606-8";
        reg = <1>;
        spi-max-frequency = <1000000>;
        interrupt-parent = <&gpio4>;
        interrupts = <30 0x0>;
        convst-gpio = <&gpio6 18 0>;
    };
};
```

Nếu xem file SoC-level trong `arch/arm/boot/dts/imx6qdl.dtsi`, bạn sẽ thấy `#size-cells` và `#address-cells` được đặt lần lượt là `0` và `1` trong cả I2C controller node và SPI controller node (có label `i2c3` và `ecspi1`). Điều này giúp hiểu property `reg` của chúng, chỉ có một cell cho address value và không có cell cho size value.

Property `reg` của I2C device dùng để chỉ định địa chỉ device trên bus. Với SPI device, `reg` biểu diễn index của chip-select line được gán cho device trong danh sách chip select của controller node. Ví dụ, với ADC `ad7606r8`, chip-select index là 1, tương ứng với `<&gpio5 17 0>` trong `cs-gpios.` Đây là danh sách chip select của controller node. Binding của controller khác có thể khác, và bạn nên tham khảo tài liệu của chúng trong `Documentation/devicetree/bindings/spi`.

## Memory-mapped device và định địa chỉ device

Phần này đề cập các memory-mapped device đơn giản có memory region mà CPU truy cập được. Với device node như vậy, property `reg` vẫn định nghĩa địa chỉ device, và mẫu `reg =` `<address0 size0 [address1 size1] [address2 size2] ... >` được áp dụng. Mỗi region được biểu diễn bằng tuple cell, trong đó cell đầu tiên là base address của memory region và cell thứ hai là size của region. Có thể chuyển thành mẫu sau: `reg = <base0` `length0 [base1 length1] [address2 length2] ... >`. Ở đây, mỗi tuple biểu diễn address range mà device dùng.

Xét ví dụ sau:

```
soc {
    #address-cells = <1>;
    #size-cells = <1>;
    compatible = "simple-bus";
    aips-bus@02000000 { /* AIPS1 */
        compatible = "fsl,aips-bus", "simple-bus";
        #address-cells = <1>;
        #size-cells = <1>;
        reg = <0x02000000 0x100000>;
        [...];
        spba-bus@02000000 {
            compatible = "fsl,spba-bus", "simple-bus";
            #address-cells = <1>;
            #size-cells = <1>;
             reg = <0x02000000 0x40000>;
             [...]

            ecspi1: ecspi@02008000 {
                #address-cells = <1>;
                #size-cells = <0>;
                compatible = "fsl,imx6q-ecspi", "fsl,imx51-ecspi";
                reg = <0x02008000 0x4000>;
                [...]
            };
            i2c1: i2c@021a0000 {
                #address-cells = <1>;
                #size-cells = <0>;
                compatible = "fsl,imx6q-i2c", "fsl,imx21-i2c";
                reg = <0x021a0000 0x4000>;
              [...]
            };
        };
    };
};
```

Trong đoạn trích trên, device node có `simple-bus` trong property `compatible` là memory-mapped bus controller nội bộ SoC, kết nối các IP core (như I2C, SPI, USB, Ethernet và IP nội bộ khác của SoC) tới CPU. Các sub-nodes của chúng, là IP core hoặc bus nội bộ khác, kế thừa các property `#address-cells` và `#size-cells`. Có thể thấy I2C controller `i2c@021a0000` (label `i2c1`) được kết nối với bus `spba-bus@02000000`. Tất cả sẽ xuất hiện dưới dạng platform device trên hệ thống ở runtime. Mặt khác, I2C controller này thay đổi addressing scheme bằng cách định nghĩa property `#address-cells` và `#size-cells` riêng, được các I2C device kết nối với nó kế thừa. Điều tương tự áp dụng với SPI controller. Tóm lại, trong thực tế, không nên diễn giải property `reg` trong node khi chưa biết property `#size-cells` và `#address-cells` của parent. Memory-mapped device phải đặt field `size` trong property `reg` bằng size của memory region của device, đồng thời field `address` phải được định nghĩa tương ứng với đầu device memory region trong SoC memory map, như thể hiện trong SoC datasheet.

LƯU Ý

String simple-bus-compatible cũng chỉ ra rằng bus không có driver đặc biệt, không có cách probe bus động, và các child node trực tiếp (chỉ child level-1) sẽ được đăng ký là platform device. Đôi khi, điều này được dùng trong device tree board-level để tạo instance GPIO-based fixed regulator.

## Xử lý resource

Mục đích chính của device driver là cung cấp tập function điều khiển cho một device và cung cấp khả năng của nó cho người dùng. Ở đây, mục tiêu là thu thập các configuration parameter của device, đặc biệt là resource (như memory region, interrupt line, DMA channel, v.v.) giúp driver thực hiện công việc.

## struct resource

Sau khi được probe, các device resource gán cho device (trong device hoặc board/machine file) được core `of_platform` hoặc `platform` thu thập và cấp phát bằng `struct resource`, như sau:

```
struct resource {
    resource_size_t start;
    resource_size_t end;
    const char *name;
    unsigned long flags;
[...]
};
```

Sau đây là ý nghĩa các thành phần trong data structure:

- `start`: Tùy resource flag, đây có thể là địa chỉ bắt đầu memory region, IRQ line number, DMA channel number hoặc register offset.

- `end`: Đây là cuối memory region hoặc cuối register offset. Với IRQ hoặc DMA channel, phần lớn trường hợp giá trị `start` và `end` giống nhau.

- `name`: Đây là tên resource nếu có. Chúng ta sẽ bàn chi tiết hơn trong phần tiếp theo.

- `flags`: Chỉ loại resource. Các giá trị có thể có gồm:

  - `IORESOURCE_IO`: Chỉ PCI/ISA I/O port region. `start` là port đầu tiên của region và `end` là port cuối cùng.

  - `IORESOURCE_MEM`: Dùng cho I/O memory region. `start` chỉ địa chỉ bắt đầu region và `end` chỉ nơi kết thúc.

  - `IORESOURCE_REG`: Đề cập tới register offset. Chủ yếu dùng với MFD device. `start` chỉ offset tương đối so với register của parent device, còn `end` chỉ nơi register section kết thúc.

  - `IORESOURCE_IRQ`: Resource là IRQ line number. Trong trường hợp này, `start` và `end` có cùng giá trị hoặc `end` không liên quan.

  - `IORESOURCE_DMA`: Chỉ rằng resource là DMA channel number. Nên xem `end` tương tự trường hợp IRQ. Tuy nhiên, điều xảy ra khi có nhiều hơn một cell cho DMA channel identifier hoặc khi có nhiều DMA controller chưa được định nghĩa rõ ràng. `IORESOURCE_DMA` không có khả năng mở rộng cho hệ thống nhiều controller.

Mỗi resource được cấp phát một instance của data structure này. Nghĩa là với device được gán hai memory region và một IRQ line, sẽ có ba data structure được cấp phát. Ngoài ra, resource cùng type được cấp phát và đánh index (bắt đầu từ 0) theo thứ tự khai báo trong device tree (hoặc board file). Điều này nghĩa là memory region được gán đầu tiên có index 0, v.v.

Để lấy resource thích hợp, chúng ta dùng generic API `platform_get_resource()`, với resource type và index của nó trong type đó. Function này được định nghĩa như sau:

```
struct resource *platform_get_resource(
                      struct platform_device *dev,
                      unsigned int type, unsigned int num)
```

Trong prototype trên, `dev` là platform device mà chúng ta viết driver cho nó, `type` là resource type và `num` là index của resource này trong cùng type. Khi thành công, function return pointer hợp lệ tới `struct resource`; nếu không, return `NULL`.

Khi có nhiều resource cùng type, dùng index có thể gây nhầm lẫn. Bạn có thể chọn dựa vào resource name thay thế; khi đó có biến thể theo tên của `platform_get_resource()`, là `platform_get_resource_byname()`. Function này nhận resource flag (hoặc type) và tên của resource, rồi return resource thích hợp, bất kể thứ tự khai báo của chúng.

Nó được định nghĩa như sau:

```
struct resource *platform_get_resource_byname(
                             struct platform_device *dev,
                             unsigned int type,
                           const char *name)
```

Để hiểu cách dùng function này, trước tiên hãy giới thiệu khái niệm named resource. Chúng ta sẽ bàn về điều đó tiếp theo.

### Khái niệm named resource

Khi driver cần danh sách resource thuộc một type nhất định (chẳng hạn hai IRQ line, line đầu cho Tx và line thứ hai cho Rx), không có gì bảo đảm thứ tự danh sách và driver không được giả định. Điều gì xảy ra nếu logic driver được hardcode để chờ Rx IRQ trước, nhưng device tree lại chứa Tx trước? Để tránh sai lệch như vậy, khái niệm named resource (như clock, IRQ, DMA channel và memory region) được đưa vào. Nó gồm việc định nghĩa danh sách resource và đặt tên cho chúng, để bất kể index, một tên luôn khớp với resource tương ứng. Khái niệm named resource cũng giúp dễ đọc và hiểu việc gán resource trong device tree.

Các property tương ứng để đặt tên resource như sau:

- `reg-names`: Danh sách tên các memory region trong property `reg`.

- `interrupt-names`: Đặt tên cho từng interrupt line trong property `interrupts`.

- `dma-names`: Dành cho property `dma`.

- `clock-names`: Đặt tên clock trong property `clocks`. Lưu ý sách này không bàn về clock.

Để minh họa khái niệm, xét device node entry giả lập sau:

```
fake_device {
    compatible = "packt,fake-device";
    reg = <0x4a064000 0x800>,
          <0x4a064800 0x200>,
          <0x4a064c00 0x200>;
    reg-names = "ohci", "ehci", "config";
    interrupts = <0 66 IRQ_TYPE_LEVEL_HIGH>,
                 <0 67 IRQ_TYPE_LEVEL_HIGH>;
    interrupt-names = "ohci", "ehci";
};
```

Trong ví dụ trên, device được gán ba memory region và hai interrupt line. Danh sách resource name và resource tuân theo ánh xạ one-to-one. Ví dụ, điều này nghĩa là tên tại index `0` được gán cho resource tại cùng index. Code trong driver để trích xuất từng named resource như sau:

```
struct resource *res_mem_config, resirq, *res_mem1;
int txirq, rxirq;
/*let's grab region <0x4a064000 0x800>*/
res_mem1 = platform_get_resource_byname(pdev,
                   IORESOURCE_MEM, "ohci");
/*let's grab region <0x4a064c00 0x200>*/
res_mem_config = platform_get_resource_byname(pdev,
                  IORESOURCE_MEM, "config");
txirq = platform_get_resource_byname(pdev,
                          IORESOURCE_IRQ, "ohci");
rxirq = platform_get_resource_byname(pdev,
                          IORESOURCE_MEM, "ehci");
```

Như bạn thấy, yêu cầu resource theo tên ít gây lỗi hơn. Cả `platform_get_resource()` lẫn `platform_get_resource_byname()` là generic API dùng để xử lý resource. Tuy nhiên, có các API chuyên dụng giúp giảm công sức phát triển (chẳng hạn `platform_get_irq_byname()`, `platform_get_irq()` hoặc `platform_get_and_ioremap_resource()`), như sẽ học trong các chương sau.

## Trích xuất data application-specific

Data Application-specific là data nằm ngoài resource thông thường (không phải IRQ number, memory region, regulator hay clock). Đây là những property và child node tùy ý có thể gán cho device. Thông thường, property như vậy dùng tiền tố nhà sản xuất. Chúng có thể là bất kỳ loại string, Boolean hoặc integer value nào, với API tương ứng được định nghĩa trong `drivers/of/base.c` trong Linux source. Lưu ý các ví dụ bàn ở đây không bao quát tất cả. Bây giờ hãy dùng lại node đã định nghĩa trước trong chương:

```
node_label: nodename@reg{
    string-property = "a string";
    string-list = "red fish", "blue fish";
    one-int-property = <197>; /* One cell property */
   /* in the following line, each number (cell) is a
    * 32-bit integer(uint32). There are 3 cells in
    * this property */
    int-list-property = <0xbeef 123 0xabcd4>;
    mixed-list-property = "a string", <0xadbcd45>,
                          <35>, [0x01 0x23 0x45];
    byte-array-property = [0x01 0x23 0x45 0x67];
    one-cell-property = <197>;
    boolean-property;
};
```

Trong các phần tiếp theo, chúng ta sẽ học cách lấy từng property trong đoạn trích device tree node trên.

### Trích xuất string property

Sau đây là đoạn trích từ ví dụ trước, thể hiện property một string và nhiều string:

```
string-property = "a string";
string-list = "red fish", "blue fish";
```

Trở lại driver, có những API khác nhau có thể dùng tùy nhu cầu. Nên dùng `of_property_read_string()` để đọc property có một string value. Prototype của nó được định nghĩa như sau:

```
int of_property_read_string(const struct device_node *np,
                           const char *propname,
                           const char **out_string)
int of_property_read_string_index(const struct
                                 device_node *np,
                                 const char *propname,
                                 int index,
                                 const char **output)
int of_property_read_string_array(
                  const struct device_node *np,
                  const char *propname,
                  const char **out_strs,
                  size_t sz)
```

Trong các function trên, `np` là node cần đọc string property. `propname` là tên property chứa string hoặc danh sách string, còn `sz` là số phần tử array cần đọc. `out_string` là output parameter có pointer value được thay đổi để trỏ tới các string value.

`of_property_read_string()` và `of_property_read_string_index()` return `-ENODATA` nếu property không có value. Chúng return `-EINVAL` nếu property hoàn toàn không tồn tại. Ngoài ra, `-EILSEQ` được return nếu string không được kết thúc bằng `NULL` trong phạm vi độ dài property data. Cuối cùng, khi thành công, chúng return `0`.

`of_property_read_string_array()` tìm property chỉ định trong device tree node đã cho, lấy danh sách string value kết thúc bằng `NULL` (thực ra là pointer tới các string này, không phải bản copy) trong property đó và gán cho `out_strs`. Ngoài các giá trị được `of_property_read_string()` và `of_property_read_string_index()` return, function này đặc biệt ở chỗ return số string đã đọc nếu target array chứa pointer không phải `NULL`. Có thể bỏ parameter `out_strs` (`NULL`) nếu chỉ muốn đếm số string trong property.

Code sau cho thấy cách dùng chúng:

```
size_t count;
const char **res;
const char *my_string = NULL;
const char *blue_fish = NULL;
of_property_read_string(pdev->dev.of_node,
                      "string-property", &my_string);
of_property_read_string_index(pdev->dev.of_node,
                      "string-list", 1, &blue_fish);
count = of_property_read_string_array(dp,
                      "string-list", res, count);
```

Trong ví dụ trên, chúng ta đã học cách trích xuất string property, từ property single-value hoặc từ danh sách. Cần lưu ý rằng pointer tới string (hoặc danh sách string) được return, không phải bản copy. Ngoài ra, ở dòng cuối, chúng ta thấy cách trích xuất số lượng phần tử string NULL-terminated được chỉ định trong array. Một lần nữa, pointer tới các phần tử được return, không phải bản copy của chúng.

### Đọc cell và unsigned integer 32-bit

Đây là các property `int` của chúng ta:

```
one-int-property = <197>;
int-list-property = <1350000 0x54dae47 1250000 1200000>;
```

Trở lại driver, giống string property, có tập API bạn có thể chọn theo nhu cầu. Nên dùng `of_property_read_u32()` để đọc cell value. Prototype của nó được định nghĩa như sau:

```
int of_property_read_u32(const struct device_node *np,
                        const char *propname,
                        u32 *out_value)
int of_property_read_u32_index(
                      const struct device_node *np,
                      const char *propname,
                      u32 index, u32 *out_value)
int of_property_read_u32_array(
                      const struct device_node *np,
                      const char *propname,
                      u32 *out_values, size_t sz)
```

Các API trên hoạt động giống những API tương ứng `_string`, `_string_index` và `_string_array`. Đó là vì tất cả đều return `0` khi thành công, `-EINVAL` nếu property hoàn toàn không tồn tại hoặc `-ENODATA` khi property không có value. Khác biệt là type của value cần đọc ở đây là `u32`, có lỗi `-EOVERFLOW` nếu property data không đủ lớn, và phải cấp phát `out_values` trước vì các value được return đã được copy.

Sau đây là cách dùng các API này trong ví dụ với `int` và danh sách property `int` của chúng ta:

```
unsigned int number;
of_property_read_u32(pdev->dev.of_node,
                    "one-cell-property", &number);
```

Có thể dùng `of_property_read_u32_array` để đọc danh sách cell. Prototype của nó như sau:

```
int of_property_read_u32_array(
                           const struct device_node *np,
                           const char *propname,
                           u32 *out_values, size_t sz);
```

Ở đây, `sz` là số phần tử array cần đọc. Hãy xem `drivers/of/base.c` để biết cách diễn giải return value:

```
unsigned int cells_array[4]; /* return value by copy */
if (!of_property_read_u32_array(pdev->dev.of_node,
    "int-list-property", cells_array, 4))
    dev_info(&pdev->dev, "u32 list read successfully\n");
/* can now process values in cells_array */
[...]
```

Ở đây, chúng ta đã minh họa việc xử lý array cell, tức array integer value 32-bit, dễ dàng thế nào. Trong phần tiếp theo, chúng ta sẽ xem cách làm với Boolean property.

### Xử lý Boolean property

Nên dùng `of_property_read_bool()` để đọc Boolean property có tên được truyền trong argument thứ hai của function:

```
bool my_bool = of_property_read_bool(pdev->dev.of_node,
                                  "boolean-property");
if(my_bool){
    /* boolean is true */
} else
    /* boolean is false */
}
```

Ví dụ trên minh họa cách xử lý Boolean property. Bây giờ có thể tìm hiểu các API phức tạp hơn nhiều, bắt đầu với trích xuất và parse sub-node.

### Trích xuất và parse sub-nodes

Lưu ý bạn được phép thêm bất kỳ sub-node nào muốn vào device node. Cách dùng này phổ biến trong nhiều trường hợp, như điền partition trong MTD device node hoặc mô tả regulator constraint trong power management chip node. Ví dụ, với node biểu diễn flash memory device, partition có thể được biểu diễn là sub-node lồng nhau. Đoạn trích sau cho thấy cách thực hiện:

```
eeprom: ee24lc512@55 {
    compatible = "microchip,24xx512";
    reg = <0x55>;
    partition@1 {
        read-only;
        part-name = "private";
        offset = <0>;
        size = <1024>;
    };
    config@2 {
        part-name = "data";
        offset = <1024>;
        size = <64512>;
    };
};
```

Có thể dùng `for_each_child_of_node()` để duyệt các sub-nodes của node đã cho:

```
structdevice_node *np = pdev->dev.of_node;
structdevice_node *sub_np;
for_each_child_of_node(np, sub_np) {
    /* sub_np will point successively to each sub-node */
    [...]
    int size;
    of_property_read_u32(client->dev.of_node,
                        "size", &size);
    ...
}
```

Trong đoạn trích trên, chúng ta đã học cách lặp qua các sub-nodes của một device tree node.

## Tổng kết

Đã đến lúc chuyển từ device configuration hardcode sang device tree. Chương này cung cấp toàn bộ nền tảng để xử lý device tree. Bây giờ bạn có kỹ năng cần thiết để tùy chỉnh hoặc thêm bất kỳ node và property nào muốn vào device tree và trích xuất chúng từ driver.

Trong chương tiếp theo, chúng ta sẽ bàn về I2C driver và dùng device tree API để liệt kê và cấu hình I2C device.
