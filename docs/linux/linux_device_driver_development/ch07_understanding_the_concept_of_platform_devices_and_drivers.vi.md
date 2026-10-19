# Chương 7: Tìm hiểu khái niệm Platform Device và Driver

Linux kernel xử lý device bằng khái niệm bus, tức liên kết giữa CPU và những device này. Một số bus đủ thông minh và tích hợp logic discoverability để enumerate các device nằm trên chúng. Với những bus như vậy, ngay đầu giai đoạn boot, Linux kernel yêu cầu chúng cung cấp các device đã enumerate cùng resource (như interrupt line và memory region) mà chúng cần để hoạt động chính xác. PCI, USB và SATA bus đều thuộc họ discoverable bus này.

Đáng tiếc, thực tế không phải lúc nào cũng đẹp như vậy. Có nhiều device mà CPU vẫn không thể phát hiện. Phần lớn non-discoverable device này nằm on-chip, dù một số nằm trên bus chậm hoặc đơn giản không hỗ trợ device discoverability.

Vì vậy, kernel phải cung cấp cơ chế nhận thông tin về hardware và người dùng phải cho kernel biết có thể tìm những device này ở đâu. Trong Linux kernel, các non-discoverable device này được gọi là platform device. Vì chúng không nằm trên bus đã biết như I2C, SPI hoặc bất kỳ non-discoverable bus nào, Linux kernel triển khai khái niệm platform bus (còn gọi là pseudo platform bus) để duy trì mô hình trong đó device luôn kết nối với CPU thông qua bus.

Trong chương này, chúng ta sẽ học cách và nơi tạo instance platform device cùng resource của chúng, cũng như cách viết driver cho chúng, tức platform driver. Để thực hiện điều đó, chương được chia thành các chủ đề sau:

- Tìm hiểu platform core abstraction trong Linux kernel

- Làm việc với platform device

- Platform driver abstraction và architecture

- Ví dụ viết platform driver từ đầu

## Tìm hiểu platform core abstraction trong Linux kernel

Để bao quát danh sách dài non-discoverable device ngày càng được sử dụng nhiều khi System on Chip (SoC) ngày càng phổ biến, platform core được đưa vào. Trong framework này, ba data structure quan trọng nhất gồm: structure biểu diễn platform device, structure biểu diễn resource của nó và cuối cùng là structure biểu diễn platform driver. Platform device được biểu diễn trong kernel bằng instance của `struct platform_device`, định nghĩa trong `<linux/platform_device.h>` như sau:

```
struct platform_device {
     const char       *name;
     u32              id;
     struct device    dev;
     u32              num_resources;
     struct resource *resource;
     const struct platform_device_id  *id_entry;
     struct mfd_cell *mfd_cell;
};
```

Trong data structure trên, `name` là tên platform device. Phải chọn cẩn thận tên gán cho platform device. Platform device được match với driver tương ứng trong pseudo platform bus matching function, tức `platform_match()`. Trong function này, ở những tình huống nhất định (không hỗ trợ device tree hoặc ACPI và không match bảng `id`), matching chuyển sang name matching, so sánh tên driver với tên platform device.

`dev` là device structure bên dưới dành cho Linux device model, còn `id` dùng để mở rộng device name này. Sau đây là cách dùng `id`:

- Khi `id` là `-1` (tương ứng macro `PLATFORM_DEVID_NONE`), device name bên dưới giống platform device name. Platform core thực hiện như sau:

```
dev_set_name(&pdev->dev, "%s", pdev->name);
```

- Khi `id` là `-2` (tương ứng macro `PLATFORM_DEVID_AUTO`), kernel tự tạo ID hợp lệ và đặt tên device bên dưới như sau:

```
dev_set_name(&pdev->dev, "%s.%d.auto", pdev->name,
             <auto_id>);
```

- Trong mọi trường hợp khác, `id` được dùng như sau:

```
dev_set_name(&pdev->dev, "%s.%d", pdev->name,
             pdev->id);
```

`resource` là array resource gán cho platform device, còn `num_resources` là số phần tử trong array đó.

Khi platform device và driver match bằng ID table, `pdev->id_entry`, có type `struct platform_device_id`, trỏ tới ID table entry đã khiến platform driver match với platform device này. Bất kể platform device được đăng ký theo cách nào, chúng cần được điều khiển bởi driver thích hợp, tức platform driver. Driver như vậy phải triển khai tập callback được platform core dùng khi device xuất hiện/biến mất trên platform bus.

Platform driver được biểu diễn trong Linux kernel bằng instance của `struct platform_driver`, định nghĩa như sau:

```
struct platform_driver {
     int (*probe)(struct platform_device *);
     int (*remove)(struct platform_device *);
     void (*shutdown)(struct platform_device *);
     int (*suspend)(struct platform_device *,
                         pm_message_t state);
     int (*resume)(struct platform_device *);
     struct device_driver driver;
     const struct platform_device_id *id_table;
     bool prevent_deferred_probe;
};
```

Sau đây là mô tả các thành phần dùng trong data structure này:

- `probe()`: Đây là function được gọi khi device yêu cầu driver của bạn sau khi match xảy ra. Sau này, chúng ta sẽ thấy cách core gọi `probe`. Khai báo của nó như sau:

```
int my_pdrv_probe(struct platform_device *pdev)
```

Kernel chịu trách nhiệm cung cấp parameter `platform_device`. `probe` được bus driver gọi khi device driver được đăng ký trong kernel.

- `remove()`: Được gọi để loại bỏ driver khi device không còn cần nó; khai báo như sau:

```
static void my_pdrv_remove(struct platform_device *pdev)
```

- `driver` là driver structure bên dưới cho device model và phải được cung cấp name (cũng phải chọn cẩn thận), owner và một số field khác (như device tree matching table) mà chúng ta sẽ xem sau. Với platform driver, trước khi driver và device match, các field `platform_device.name` và `platform_driver.driver.name` phải giống nhau.

- `id_table` là một cách platform driver cung cấp cho bus code để bind device thực tế với driver. Cách khác là thông qua device tree, được bàn trong phần Khai báo device được hỗ trợ trong driver.

Bây giờ đã giới thiệu cả platform device data structure và platform driver data structure, hãy tiến xa hơn và tìm hiểu cách chúng được tạo, đăng ký với hệ thống.

## Làm việc với platform device

Trước khi bắt đầu viết platform driver, phần này hướng dẫn cách và nơi tạo instance platform device. Chỉ sau đó chúng ta mới đi sâu vào triển khai platform driver. Việc tạo instance platform device trong Linux kernel đã tồn tại từ lâu và được cải tiến qua các phiên bản kernel; chúng ta sẽ bàn về đặc điểm riêng của từng phương thức trong phần này.

## Cấp phát và đăng ký platform device

Vì platform device không có cách tự thông báo sự hiện diện cho hệ thống, chúng phải được khai báo thủ công và đăng ký với hệ thống cùng resource và private data. Trong những ngày đầu của platform core, platform device được khai báo trong board file, `arch/arm/mach-*` (là `arch/arm/mach-imx/mach-imx6q.c` với i.MX6), và được thông báo cho kernel bằng `platform_device_add()` hoặc `platform_device_register()`, tùy cách cấp phát từng platform device.

Điều này dẫn tới kết luận rằng có hai phương thức cấp phát và đăng ký platform device.

Phương thức tĩnh gồm liệt kê platform device trong code và gọi `platform_device_register()` trên từng device để đăng ký. API này được định nghĩa như sau:

```
int platform_device_register(struct platform_device *pdev)
```

Một ví dụ về cách dùng đó như sau:

```
static struct platform_device my_pdev = {
    .name           = "my_drv_name",
    .id             = 0,
    .ressource         = jz4740_udc_resources,
    .num_ressources    = ARRY_SIZE(jz4740_udc_resources),
};
int foo()
{
    [...]
    return platform_device_register(&my_pdev);
}
```

Với đăng ký tĩnh, platform device được khởi tạo tĩnh và truyền cho `platform_device_register()`. Phương thức này cũng cho phép thêm hàng loạt platform device. Code tương ứng có thể dùng `platform_add_devices()`, nhận array pointer tới platform device và số phần tử trong array. Function này được định nghĩa như sau:

```
int platform_add_devices(struct platform_device **devs,
                          int num);
```

Mặt khác, cấp phát động yêu cầu gọi `platform_device_alloc()` trước để cấp phát động và khởi tạo platform device; function được định nghĩa như sau:

```
struct platform_device *platform_device_alloc(
                          const char *name, int id);
```

Trong các parameter, `name` là base name của device đang thêm, còn `id` là instance ID của platform device. Khi thành công, function return platform device object hợp lệ; khi lỗi, return `NULL`.

Platform device được cấp phát theo cách này chỉ được đăng ký với hệ thống bằng API `platform_device_add()`, định nghĩa như sau:

```
int platform_device_add(struct platform_device *pdev);
```

Parameter duy nhất là platform device đã được cấp phát bằng `platform_device_alloc()`. Khi thành công, function return `0`; khi thất bại, return error code âm.

Nếu đăng ký platform device bằng `platform_device_add()` thất bại, bạn nên giải phóng memory mà platform device structure chiếm bằng `platform_device_put()`, định nghĩa như sau:

```
void platform_device_put(struct platform_device *pdev);
```

Sau đây là ví dụ cách dùng:

```
status = platform_device_add(evm_led_dev);
if (status < 0) {
     platform_device_put(evm_led_dev);
[...]
}
```

Tuy nhiên, bất kể platform device được cấp phát và đăng ký theo cách nào, phải hủy đăng ký nó bằng `platform_device_unregister()`, định nghĩa như sau:

```
void platform_device_unregister(struct platform_device *pdev)
```

Lưu ý rằng `platform_device_unregister()` gọi nội bộ `platform_device_put()`.

Bây giờ đã biết cách tạo instance platform device theo cách truyền thống, hãy xem có thể làm cùng việc đó tối giản thế nào bằng cách khác: device tree.

## Cách tránh cấp phát platform device trong code

Như đã nói, platform device trước đây được khai báo trong board file hoặc từ driver khác. Phương thức này không linh hoạt. Thêm/xóa platform device, trong trường hợp tốt nhất, cần compile lại module, và trong trường hợp tệ nhất, cần compile lại toàn bộ kernel. Phương thức deprecated này cũng không portable.

Ngày nay có device tree, vốn đã tồn tại khá lâu. Cơ chế này dùng để khai báo non-discoverable device hiện diện trong hệ thống. Là thực thể độc lập, nó có thể được build độc lập với kernel hoặc module khác. Hóa ra đây có thể là lựa chọn thay thế tốt nhất để khai báo platform device.

Điều này được thực hiện bằng cách khai báo platform device là node trong device tree, bên dưới node có compatible string property là `simple-bus`. Compatible string này nghĩa là node được xem như bus không cần xử lý hoặc driver riêng. Ngoài ra, nó chỉ ra không có cách probe bus động và cách duy nhất để định vị child device của bus này là dùng thông tin địa chỉ trong device tree. Sau đó, trong triển khai của mình, Linux tạo platform device cho mỗi sub-node first-level tiên bên dưới node có `simple-bus` trong property `compatible`.

Sau đây là minh họa:

```
foo {
    compatible = "simple-bus";
    bar: bar@0 {
        compatible = "labcsmart,something";
        [...]
        baz: baz@0 {
            compatible = "labcsmart,anotherthing";
            [...]
        }
    }
    foz: foz@1 {
        compatible = "company,product";
        [...]
    };
}
```

Trong ví dụ trên, chỉ node `bar` và `foz` được đăng ký là platform device. `baz` thì không (parent trực tiếp của nó không có `simple-bus` trong compatible string). Vì vậy, nếu có platform driver với `company, product` và/hoặc `labcsmart,something` trong compatible matching table, các platform device này sẽ được probe. Cách dùng phổ biến là khai báo on-chip device bên dưới SoC node hoặc on-chip memory-mapped bus. Cách dùng thường gặp khác là khai báo regulator device, như sau:

```
regulators {
    compatible = "simple-bus";
    #address-cells = <1>;
    #size-cells = <0>;
    reg_usb_h1_vbus: regulator@0 {
        compatible = "regulator-fixed";
        reg = <0>;
        regulator-name = "usb_h1_vbus";
        regulator-min-microvolt = <5000000>;
        regulator-max-microvolt = <5000000>;
        enable-active-high;
        startup-delay-us = <2>;
        gpio = <&gpio7 12 0>;
    };
    reg_panel: regulator@1 {
        compatible = "regulator-fixed";
        reg = <1>;
        regulator-name = "lcd_panel";
        enable-active-high;
         gpio = <&gpio1 2 0>;
     };
};
```

Trong ví dụ trên, hai platform device được đăng ký, mỗi device tương ứng một fixed regulator.

## Làm việc với platform resource

Trái với hot-pluggable device được enumerate và thông báo resource chúng cần, kernel không biết platform device nào hiện diện trên hệ thống, chúng có khả năng gì hoặc cần gì để hoạt động đúng. Không có quá trình auto-negotiation, nên mọi thông tin cung cấp cho kernel về resource mà platform device cần đều hữu ích. Resource có thể là IRQ line, DMA channel, memory region, I/O port, v.v. Trong platform code, resource được biểu diễn bằng instance của struct resource, định nghĩa trong `include/linux/ioport.h` như sau:

```
struct resource {
     resource_size_t start;
     resource_size_t end;
     const char *name;
     unsigned long flags;
};
```

Trong data structure trên, `start`/`end` trỏ tới đầu/cuối resource. Chúng chỉ nơi I/O region hoặc memory region bắt đầu và kết thúc. Vì IRQ line, bus và DMA channel không có range, người ta thường gán cùng giá trị cho `start`/`end`.

`flags` là mask đặc trưng cho loại resource, ví dụ `IORESOURCE_BUS`. Các giá trị có thể có như sau:

- `IORESOURCE_IO` cho PCI/ISA I/O port

- `IORESOURCE_MEM` cho memory region

- `IORESOURCE_REG` cho register offset

- `IORESOURCE_IRQ` cho IRQ line

- `IORESOURCE_DMA` cho DMA channel

- `IORESOURCE_BUS` cho bus

Cuối cùng, thành phần `name` nhận diện hoặc mô tả resource vì resource có thể được trích xuất theo tên.

Có thể gán những resource này cho platform device theo hai cách: thứ nhất, trong cùng compilation unit nơi platform device được khai báo và đăng ký; thứ hai, từ device tree.

Trong phần này, chúng ta đã mô tả resource và cách dùng. Ở phần tiếp theo, hãy xem cách cung cấp chúng cho platform device.

### Cung cấp platform resource – cách cũ và deprecated

Phương thức này dùng với kernel không hỗ trợ device tree hoặc khi không có lựa chọn đó. Nó chủ yếu được dùng với multi-function device (MFD), trong đó master chip (chip bao ngoài) chia sẻ resource với subdevice.

Với phương thức này, resource được cung cấp giống platform device. Sau đây là ví dụ:

```
static struct resource foo_resources[] = {
     [0] = { /* The first memory region */
          .start = 0x10000000,
          .end   = 0x10001000,
          .flags = IORESOURCE_MEM,
          .name  = "mem1",
     },
     [1] = {
          .start = JZ4740_UDC_BASE_ADDR2,
          .end   = JZ4740_UDC_BASE_ADDR2 + 0x10000 -1,
          .flags = IORESOURCE_MEM,
          .name  = "mem2",
     },
     [2] = {
          .start = 90,
          .end   = 90,
          .flags = IORESOURCE_IRQ,
          .name  = "mc-irq",
     },
};
```

Đoạn trích trên thể hiện ba resource (hai thuộc memory type và một thuộc IRQ type), có thể nhận diện type bằng `IORESOURCE_IRQ` và `IORESOURCE_MEM`. Resource đầu tiên là memory region 4 KB, thứ hai cũng là memory region có range được macro định nghĩa, và cuối cùng là IRQ 90.

Gán các resource này cho platform device là thao tác đơn giản. Nếu platform device được cấp phát tĩnh, nên gán resource theo cách sau:

```
static struct platform_device foo_pdev = {
     .name = "foo-device",
     .resource             = foo_resources,
     .num_ressources = ARRY_SIZE(foo_resources),
[...]
};
```

Với platform device cấp phát động, việc này được thực hiện trong function, theo dạng như sau:

```
struct platform_device *foo_pdev;
[...]
my_pdev = platform_device_alloc("foo-device", ...);
if (!my_pdev)
           return -ENOMEM;
my_pdev->resource = foo_resources;
my_pdev->num_ressources = ARRY_SIZE(foo_resources);
```

Có một số helper function để lấy data từ resource array, gồm:

```
struct resource *platform_get_resource(
                       struct platform_device *pdev,
                       unsigned int type, unsigned int n);
struct resource *platform_get_resource_byname(
                      struct platform_device *pdev,
                      unsigned int type, const char *name);
int platform_get_irq(struct platform_device *pdev,
                     unsigned int n);
```

Parameter `n` cho biết muốn resource nào thuộc type đó, với 0 chỉ resource đầu tiên. Vì vậy, ví dụ driver có thể tìm MMIO region thứ hai bằng:

```
r = platform_get_resource(pdev, IORESOURCE_MEM, 1);
```

Cách dùng function này được giải thích trong phần Xử lý resource của Chương 5, Tìm hiểu và sử dụng Device Tree.

### Tìm hiểu khái niệm platform data

Struct resource đã dùng đến đây đủ để tạo instance resource cho platform device đơn giản, nhưng nhiều device phức tạp hơn thế. Data structure này chỉ có thể mã hóa số lượng hữu hạn loại thông tin. Để mở rộng, `platform_device.device.platform_data` được dùng để gán mọi thông tin bổ sung khác cho platform device.

Data có thể được chứa trong structure lớn hơn và gán cho field bổ sung này. Data có thể thuộc bất kỳ type nào driver hiểu được, nhưng phần lớn là những data type khác không nằm trong resource type đã liệt kê ở phần trước. Ví dụ, chúng có thể là regulator constraint hoặc thậm chí pointer tới function riêng cho per-device.

Trong khối code sau, hãy mô tả platform data bổ sung tương ứng với tập pointer tới function riêng của platform device type:

```
static struct foo_low_level foo_ops = {
     .owner          = THIS_MODULE,
     .hw_init         = trizeps_pcmcia_hw_init,
     .socket_state     = trizeps_pcmcia_socket_state,
     .configure_socket = trizeps_pcmcia_configure_socket,
     .socket_init     = trizeps_pcmcia_socket_init,
     .socket_suspend  = trizeps_pcmcia_socket_suspend,
[...]
};
```

Với platform device cấp phát tĩnh, chúng ta thực hiện lệnh sau:

```
static struct platform_device my_device = {
     .name = "foo-pdev",
     .dev  = {
          .platform_data   = (void*)&trizeps_pcmcia_ops,
     },
     [...]
};
```

Nếu platform device được cấp phát động, data được gán bằng helper `platform_device_add_data()`, định nghĩa như sau:

```
int platform_device_add_data(struct platform_device *pdev,
                        const void *data, size_t size);
```

Function trên return `0` khi thành công. `data` là data dùng làm platform data, còn `size` là size của data này.

Trở lại ví dụ tập function, chúng ta thực hiện như sau:

```
int ret;
[…]
ret = platform_device_add_data(foo_pdev,
                  &foo_ops, sizeof(foo_ops));
if (ret == 0)
    ret = platform_device_add(trizeps_pcmcia_device);
if (ret)
     platform_device_put(trizeps_pcmcia_device);
```

Trong platform driver, thành phần `pdev->dev.platform_dat` của platform device sẽ trỏ tới platform data. Dù có thể dereference field này, nên dùng function kernel-provided, `dev_get_platdata()`, định nghĩa như sau:

```
void *dev_get_platdata(const struct device *dev)
```

Sau đó, để lấy lại structure chứa tập function, driver có thể thực hiện như sau:

```
struct foo_low_level *my_ops =
          dev_get_platdata(&pdev->dev);
```

Driver không có cách kiểm tra type của data được truyền vào. Driver đơn giản phải giả định đã được cung cấp structure thuộc type mong đợi vì platform data interface không có bất kỳ type checking nào.

### Cung cấp platform resource – cách mới và được khuyến nghị

Phương thức cung cấp resource đầu tiên có một số nhược điểm, bao gồm việc mọi thay đổi đều yêu cầu build lại kernel hoặc module bị thay đổi, và điều này có thể tăng kernel size.

Với sự xuất hiện của device tree, mọi thứ đơn giản hơn. Để giữ tính tương thích, memory region, interrupt và DMA resource được chỉ định trong device tree được platform core chuyển thành instance của struct resource để `platform_get_resource()`, `platform_get_resource_by_name()` hoặc thậm chí `platform_get_irq()` có thể return resource thích hợp, bất kể resource được khai báo theo cách truyền thống hay từ device tree. Có thể kiểm chứng điều này trong phần Xử lý resource của Chương 5, Tìm hiểu và sử dụng Device Tree.

Dĩ nhiên, device tree cho phép truyền bất kỳ loại thông tin nào driver có thể cần biết. Những data type đó có thể dùng để truyền mọi data đặc thù của device/driver. Có thể thực hiện điều này bằng cách đọc phần Trích xuất data application-specific, cũng trong Chương 5, Tìm hiểu và sử dụng Device Tree.

Tuy nhiên, device tree code không biết structure cụ thể mà driver dùng cho platform data, nên không thể cung cấp thông tin ở dạng đó. Để truyền data bổ sung như vậy, driver có thể dùng field `.data` trong entry `of_device_id` đã khiến platform device và driver match. Field này sau đó có thể trỏ tới platform data. Xem phần Khai báo device được hỗ trợ trong driver trong chương này.

Driver cần platform data theo cách truyền thống nên kiểm tra pointer `platform_device->dev.platform_data`. Nếu có giá trị non-null, nghĩa là device được tạo instance theo cách truyền thống cùng platform data và không dùng device tree; nên dùng platform data như bình thường. Tuy nhiên, nếu device được tạo instance từ device tree code, pointer `platform_data` sẽ là `NULL`, chỉ ra rằng phải lấy thông tin trực tiếp từ device tree. Trong trường hợp này, driver tìm thấy pointer `device_node` trong field `dev.of_node` của platform device. Khi đó có thể dùng các device tree access routine (đáng chú ý nhất là `of_get_property()`) để lấy data cần thiết từ device tree. Bây giờ đã quen với cung cấp platform resource, hãy học cách thiết kế platform device driver.

## Platform driver abstraction và architecture

Trước khi đi tiếp, cần lưu ý rằng không phải mọi platform device đều được platform driver xử lý (hay có thể nói là pseudo platform driver). Platform driver dành cho device không dựa trên bus thông thường. I2C device hoặc SPI device là platform device, nhưng lần lượt dựa trên I2C bus hoặc SPI bus, không phải platform bus. Với platform driver, mọi thứ cần được làm thủ công.

## Probe và giải phóng platform device

Entry point của platform driver là probe method, được gọi sau khi match với platform device xảy ra. Probe method này có prototype sau:

```
int pdrv_probe(struct platform_device *pdev)
```

`pdev` tương ứng với platform device được tạo instance theo cách truyền thống hoặc device mới được platform core cấp phát vì device tree node tương ứng có parent trực tiếp chứa `simple-bus` trong compatible property. Platform data và resource, nếu có, cũng được đặt tương ứng. Nếu platform device trong parameter là device mà driver mong đợi, method này phải return `0`. Nếu không, phải return error code âm thích hợp.

Dù platform device được tạo instance theo cách truyền thống hay từ device tree, resource của nó đều có thể được trích xuất bằng platform core API thông thường, `platform_get_resource()`, `platform_get_resource_by_name()` hoặc thậm chí `platform_get_irq()`, và API tương tự.

Probe method phải yêu cầu mọi resource (GPIO, clock, IIO channel, v.v.) và data mà driver cần. Nếu cần thực hiện mapping, probe method là nơi thích hợp.

Mọi việc đã thực hiện trong method `probe` phải được hoàn tác khi device rời hệ thống hoặc khi platform driver bị hủy đăng ký. Method `remove` là nơi thích hợp để làm việc đó. Nó phải có prototype sau:

```
int pdrv_remove(struct platform_device *dev)
```

Function này chỉ được return `0` nếu mọi thứ đã được hoàn tác và dọn dẹp. Nếu không, phải return error code thích hợp để có thể thông báo cho người dùng. Parameter là cùng platform device đã truyền cho function `probe`. Trong phần Ví dụ viết platform driver từ đầu, chúng ta bàn về mọi mẹo và đặc điểm riêng khi triển khai method `probe` và `remove`.

Bây giờ các driver callback đã sẵn sàng, chúng ta có thể khai báo những device sẽ được driver này xử lý.

## Khai báo device được hỗ trợ trong driver

Bản thân platform driver của chúng ta không hữu ích. Để hữu ích cho device, nó phải thông báo cho kernel những device có thể quản lý. Để làm điều đó, phải cung cấp ID table và gán cho field `platform_driver.id_table`. Điều này cho phép platform device matching. Tuy nhiên, để mở rộng tính năng này sang tự động load module, phải truyền cùng bảng đó cho `MODULE_DEVICE_TABLE` để tạo module alias.

Trở lại code, mỗi entry trong bảng đó có type `struct platform_device_id`, định nghĩa như sau:

```
struct platform_device_id {
     char name[PLATFORM_NAME_SIZE];
     kernel_ulong_t driver_data;
};
```

Trong data structure trên, `name` là tên mô tả device, còn `driver_data` là driver state value. Nó có thể được đặt bằng pointer tới data structure riêng cho per-device. Sau đây là ví dụ, trích từ `drivers/mmc/host/mxs-mmc.c`:

```
static const struct platform_device_id mxs_ssp_ids[] = {
     {
          .name = "imx23-mmc",
          .driver_data = IMX23_SSP,
     }, {
          .name = "imx28-mmc",
          .driver_data = IMX28_SSP,
     }, {
          /* sentinel */
     }
};
MODULE_DEVICE_TABLE(platform, mxs_ssp_ids);
```

Khi `mxs_ssp_ids` được gán cho field `platform_driver.id_table`, platform device có thể match với driver này dựa trên tên của chúng khớp với bất kỳ entry `platform_device_id.name` nào. `platform_device.id_entry` trỏ tới entry trong bảng đã kích hoạt match.

Để cho phép match platform device khai báo trong device tree bằng compatible string của chúng, platform driver phải đặt `platform_driver.driver.of_match_table` bằng danh sách phần tử `struct` `of_device_id`; sau đó, để cũng cho phép tự động load module từ device tree matching, device tree match table này phải được truyền cho `MODULE_DEVICE_TABLE`. Sau đây là ví dụ:

```
static const struct of_device_id mxs_mmc_dt_ids[] = {
    {
        .compatible = "fsl,imx23-mmc",
        .data = (void *) IMX23_SSP,
    },{
        .compatible = "fsl,imx28-mmc",
        .data = (void *) IMX28_SSP,
    }, {
        /* sentinel */
    }
};
MODULE_DEVICE_TABLE(of, mxs_mmc_dt_ids);
```

Nếu `of_device_id` được đặt trong driver, matching được xác định bằng bất kỳ phần tử `of_device_id.compatible` nào khớp với giá trị compatible property trong device node. Để lấy entry `of_device_id` gây ra match, driver nên gọi `of_match_device()`, truyền device tree match table và device structure bên dưới, `platform_device.dev`, làm parameter.

Sau đây là ví dụ:

```
static int mxs_mmc_probe(struct platform_device *pdev)
{
    const struct of_device_id *of_id =
        of_match_device(mxs_mmc_dt_ids, &pdev->dev);
    struct device_node *np = pdev->dev.of_node;
[...]
}
```

Sau khi định nghĩa các match table này, có thể gán chúng cho platform driver structure như sau:

```
static struct platform_driver imx_uart_platform_driver = {
    .probe = imx_uart_probe,
    .remove = imx_uart_remove,
    .id_table = imx_uart_devtype,
    .driver = {
        .name = "imx-uart",
        .of_match_table = imx_uart_dt_ids,
    },
};
```

Với platform driver data structure hoàn chỉnh trên, chúng ta cho device cơ hội match platform driver dựa trên device tree match table hoặc ID table, và cuối cùng là dựa trên tên driver.

## Khởi tạo và đăng ký driver

Đăng ký platform driver với kernel đơn giản là gọi `platform_driver_register()` hoặc `platform_driver_probe()` trong module initialization function. Sau đó, để loại bỏ platform driver đã đăng ký, module phải gọi `platform_driver_unregister()` để hủy đăng ký driver này.

Sau đây là prototype tương ứng của các function này:

```
int platform_driver_register(struct platform_driver *drv);
void platform_driver_unregister(struct platform_driver *);
int platform_driver_probe(struct platform_driver *drv,
                  int (*probe)(struct platform_device *))
```

Khác biệt giữa hai probing function như sau:

- `platform_driver_register()` đăng ký và đặt driver vào danh sách driver do kernel duy trì, nghĩa là function `probe()` của nó có thể được gọi theo yêu cầu mỗi khi có match mới với platform device. Để tránh driver được chèn và đăng ký vào danh sách đó, có thể dùng function tiếp theo. Tuy nhiên, mọi platform driver được đăng ký bằng `platform_driver_register()` đều phải được hủy đăng ký bằng `platform_driver_unregister()`.

- Với `platform_driver_probe()`, kernel chạy matching loop ngay để kiểm tra có platform device nào match với platform driver này hay không và gọi method `probe` cho từng device có match. Nếu không tìm thấy device lúc đó, platform driver đơn giản bị bỏ qua. Phương thức này ngăn deferred probe vì không đăng ký driver trên hệ thống. Ở đây, function `probe` được đặt trong section `__init`, được giải phóng (nếu driver được compile tĩnh, tức built-in) khi kernel boot hoàn tất, nhờ đó ngăn deferred probe và giảm memory footprint của driver. Dùng phương thức này nếu bạn chắc chắn 100% device hiện diện trong hệ thống:

```
ret = platform_driver_probe(&mypdrv, my_pdrv_probe);
```

Procedure `probe()` có thể được đặt trong section `__init` nếu biết device không hot-pluggable.

Thời điểm thích hợp để đăng ký platform driver là ngay sau khi module được load, nên có thể nói nơi thích hợp là module initialization function. Tương tự, hủy đăng ký driver phải được thực hiện trên unloading path của module. Vì vậy, có thể nói function `module_exit` là nơi thích hợp để hủy đăng ký platform driver.

Sau đây là minh họa điển hình về đăng ký platform driver đơn giản với platform core:

```
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/platform_device.h>
static int my_pdrv_probe (struct platform_device *pdev)
{
     pr_info("Hello! device probed!\n");
     return 0;
}
static void my_pdrv_remove(struct platform_device *pdev)
{
     pr_info("good bye reader!\n");
}
static struct platform_driver mypdrv = {
     .probe     = my_pdrv_probe,
     .remove     = my_pdrv_remove,
[...]
};
static int __init foo_init(void)
{
     [...] /* My init code */
     return platform_driver_register(&mypdrv);
}
module_init(foo_init);

static void __exit foo_cleanup(void)
{
     [...] /* My clean up code */
     platform_driver_unregister(&my_driver);
}
module_exit(foo_cleanup);
```

Module của chúng ta không làm gì khác trong initialization/exit function ngoài đăng ký/hủy đăng ký platform driver với platform bus core. Đây là tình huống thường gặp, khi module init/exit method nhẹ và đơn giản. Trong trường hợp này, có thể bỏ `module_init()` và `module_exit()`, rồi dùng macro `module_platform_driver()`, như sau:

```
[...]
static int my_pdrv_probe(struct platform_device *pdev)
{
     [...]
}
static void my_pdrv_remove(struct platform_device *pdev)
{
     [...]
}
static struct platform_driver mypdrv = {
     [...]
};
module_platform_driver(mypdrv);
```

Dù chỉ chèn đoạn code rút ra trong ví dụ trên, như vậy đủ minh họa việc giảm code và làm code rõ ràng hơn.

Để bảo đảm chúng ta có cùng nền tảng kiến thức, hãy tổng hợp mọi khái niệm đã học trong chương thành platform driver thực tế.

## Ví dụ viết platform driver từ đầu

Phần này cố gắng tổng hợp tối đa kiến thức đã thu được xuyên suốt chương. Bây giờ hãy tưởng tượng platform device là memory-mapped, với memory range dùng để điều khiển nó bắt đầu tại `0x02008000` và có size `0x4000`. Sau đó, giả sử platform device này có thể interrupt CPU khi hoàn tất công việc và interrupt line number là `31`. Để đơn giản, hãy không yêu cầu resource nào khác cho device này (có thể hình dung clock, DMA, regulator, v.v.). Đầu tiên, hãy tạo instance platform device này từ device tree. Nếu còn nhớ, để node được platform core đăng ký là platform device, parent trực tiếp của node phải có `simple-bus` trong compatible string list; đó là điều được triển khai ở đây:

```
demo {
    compatible = "simple-bus";
    demo_pdev: demo_pdev@0 {
        compatible = "labcsmart,demo-pdev";
        reg = <0x02008000 0x4000>;
        interrupts = <0 31 IRQ_TYPE_LEVEL_HIGH>;
    };
};
```

Nếu phải tạo instance platform device này cùng resource theo cách truyền thống, chúng ta cần làm tương tự như sau trong file sẽ gọi là `demo-pdev-init.c`:

```
#include <linux/module.h>
#include <linux/init.h>
#include <linux/platform_device.h>
#define DEV_BASE 0x02008000
#define PDEV_IRQ 31
static struct resource pdev_resource[] = {
    [0] = {
        .start = DEV_BASE,
        .end   = DEV_BASE + 0x4000,
        .flags = IORESOURCE_MEM,
    },
    [1] = {
        .start = PDEV_IRQ,
        .end   = PDEV_IRQ,
        .flags = IORESOURCE_IRQ,
    },
};
```

Ở trên, trước tiên chúng ta định nghĩa platform resource. Bây giờ có thể tạo instance platform device và gán resource này như sau, vẫn trong `demo-pdev-init.c`:

```
struct platform_device demo_pdev = {
    .name        = "demo_pdev",
    .id          = 0,
    .num_resources = ARRAY_SIZE(pdev_resource),
    .resource      = pdev_resource,
    /*.dev  = {
     *   .platform_data  = (void*)&big_struct_1,
     *}*/,
};
```

Ở trên, chúng ta comment out phép gán liên quan `dev` chỉ để cho thấy có thể định nghĩa structure lớn hơn chứa mọi thông tin khác mà driver mong đợi và truyền data structure này làm platform data.

Bây giờ mọi data structure đã được thiết lập, có thể đăng ký platform device bằng cách thêm nội dung sau vào cuối `demo-pdev-init.c`:

```
static int demo_pdev_init()
{
    return platform_device_register(&demo_pdev);
}
module_init(demo_pdev_init);
static void demo_pdev_exit()
{
    platform_device_unregister(&demo_pdev);
}
module_exit(demo_pdev_exit);
```

Code trên không làm gì ngoài đăng ký platform device với hệ thống. Trong ví dụ này, chúng ta dùng khởi tạo tĩnh. Tuy nhiên, mọi thứ cũng không khác nhiều với khởi tạo động.

Bây giờ đã hoàn tất tạo instance platform device, hãy tập trung vào chính platform driver, có compilation unit tên `demo-pdriver.c`, và thêm các header file sau vào đó:

```
#include <linux/module.h>
#include <linux/init.h>
#include <linux/interrupt.h>
#include <linux/of_platform.h>
#include <linux/platform_device.h>
```

Bây giờ đã có các header cho phép hỗ trợ API cần thiết và dùng data structure thích hợp, hãy bắt đầu bằng cách liệt kê các device có thể match với platform driver này từ device tree:

```
static const struct of_device_id labcsmart_dt_ids[] = {
    {
        .compatible = " labcsmart,demo-pdev",
        /* .data = (void *)&big_struct_1, */
    },{
        .compatible = " labcsmart,other-pdev ",
        /* .data = (void *) &big_struct_2, */
    }, {
        /* sentinel */
    }
};
MODULE_DEVICE_TABLE(of, labcsmart_dt_ids);
```

Ở trên, device tree match table liệt kê các device được hỗ trợ, phân biệt bằng property `compatible` của chúng. Một lần nữa, phép gán `.data` được comment out chỉ để cho thấy cách truyền platform-specific data theo entry gây ra match với platform device. platform-specific structure này có thể là `big_struct_1` hoặc `big_struct_2`. Đây là cách tôi khuyến nghị khi bạn cần truyền platform data mà vẫn muốn dùng device tree.

Để tạo cơ hội matching bằng ID table, chúng ta điền bảng như sau:

```
static const struct platform_device_id labcsmart_ids[] = {
     {
          .name = "demo-pdev",
          /*.driver_data = &big_struct_1,*/
     }, {
           .name = "other-pdev",
           /*.driver_data = &big_struct_2,*/
     }, {
           /* sentinel */
     }
};
MODULE_DEVICE_TABLE(platform, labcsmart_ids);
```

Phần trên không cần giải thích đặc biệt, ngoại trừ phần commented-out, cho thấy cách dùng extra data tùy device đang được xử lý.

Ở đây, chúng ta đã sẵn sàng triển khai probe method. Vẫn trong compilation unit của demo platform driver, thêm như sau:

```
static u32 *reg_base;
static struct resource *res_irq;
static int demo_pdrv_probe(struct platform_device *pdev)
{
    struct resource *regs;
    regs = platform_get_resource(pdev, IORESOURCE_MEM, 0);
    if (!regs) {
        dev_err(&pdev->dev, "could not get IO memory\n");
        return -ENXIO;
    }
    /* map the base register */
    reg_base = devm_ioremap(&pdev->dev, regs->start,
                              resource_size(regs));
    if (!reg_base) {
        dev_err(&pdev->dev, "could not remap memory\n");
        return 0;
    }
    res_irq = platform_get_resource(pdev,
                                   IORESOURCE_IRQ, 0);
    /* we could have used
     * irqnum = platform_get_irq(pdev, 0); */
    devm_request_irq(&pdev->dev, res_irq->start,
                   top_half, IRQF_TRIGGER_FALLING,
                   "demo-pdev", NULL);
[...]
     return 0;
}
```

Trong probe method trên, nhiều thứ có thể được thêm hoặc thực hiện khác đi. Trường hợp đầu tiên là driver chỉ device tree-compliant và platform device tương ứng cũng được tạo instance từ device tree. Chúng ta có thể làm tương tự như sau:

```
struct device_node *np = pdev->dev.of_node;
const struct of_device_id *of_id =
        of_match_device(labcsmart_dt_ids, &pdev->dev);
struct big_struct *pdata_struct = (big_struct*)of_id->data;
```

Ở trên, chúng ta lấy reference tới device tree node gắn với platform device; trên đó có thể dùng bất kỳ device tree-related API nào (như `of_get_property()`) để trích xuất data. Tiếp theo, nếu platform-specific data structure được truyền khi khai báo device được hỗ trợ trong match table, chúng ta dùng `of_match_device()` để trỏ tới entry tương ứng với kết quả khớp và trích xuất platform-specific data.

Nếu match xảy ra nhờ ID table, `pdev->id_entry` trỏ tới entry gây ra match, còn `pdev->id_entry->driver_data` trỏ tới structure lớn hơn thích hợp.

Tuy nhiên, nếu platform data được khai báo theo phương thức truyền thống, chúng ta dùng như sau:

```
struct big_struct *pdata_struct =
                 (big_struct*)dev_get_platdata(&pdev->dev);
```

Bây giờ đã hoàn tất probe method, tôi muốn bạn chú ý điểm cụ thể: trong method đó, chúng ta chỉ dùng function có tiền tố `devm_` để xử lý resource. Những function này đảm nhận giải phóng resource vào thời điểm thích hợp.

Điều này nghĩa là chúng ta không cần method `remove`. Tuy nhiên, để phục vụ việc giảng giải, sau đây là remove method nếu không dùng resource-managed helper:

```
int demo_pdrv_remove(struct platform_device *dev)
{
    free_irq(res_irq->start, NULL);
    iounmap(reg_base);
    return 0;
}
```

Ở trên, IRQ resource được giải phóng và memory mapping bị hủy.

Bây giờ mọi thứ đã sẵn sàng. Có thể khởi tạo và đăng ký platform driver bằng:

```
static struct platform_driver demo_driver = {
    .probe     = demo_pdrv_probe,
    /* .remove = demo_pdrv_remove, */
    .driver    = {
        .owner    = THIS_MODULE,
        .name    = "demo_pdev",
    },
};
module_platform_driver(demo_driver);
```

Có một điểm quan trọng khác cần xem xét: tên platform device, platform driver và cả device node name trong device tree. Chúng đều giống nhau, tức `demo_pdev`. Đây là cách tạo cơ hội match ngay cả bằng tên platform device và platform driver, vì name matching được dùng làm fallback khi mọi matching bằng device tree, ID table và ACPI đều thất bại.

## Tổng kết

Kernel pseudo platform bus không còn bí mật nào với bạn. Với bus matching mechanism, bạn có thể hiểu cách, thời điểm và lý do driver được load, cũng như device mà nó được viết cho. Chúng ta có thể triển khai bất kỳ probe function nào dựa trên matching mechanism mong muốn. Vì mục đích chính của device driver là xử lý device, giờ chúng ta có thể khai báo device trong hệ thống theo cách truyền thống hoặc từ device tree. Để kết thúc trọn vẹn, chúng ta đã triển khai từ đầu ví dụ platform driver hoạt động được.

Trong chương tiếp theo, chúng ta tiếp tục học cách viết driver cho non-discoverable device, nhưng lần này là device nằm trên I2C bus.
