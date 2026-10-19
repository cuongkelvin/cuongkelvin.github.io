# Chương 14: Giới thiệu Linux Device Model

Cho tới phiên bản 2.5, Linux kernel chưa có cách mô tả và quản lý object, và khả năng tái sử dụng code chưa được cải tiến như hiện nay. Nói cách khác, chưa có device topology hay cách tổ chức như sysfs ngày nay. Không có thông tin về quan hệ subsystem, cũng không có thông tin cách hệ thống kết hợp với nhau. Sau đó Linux Device Model (LDM) xuất hiện, đưa vào những tính năng sau:

- Khái niệm class. Class dùng để nhóm device cùng type hoặc cung cấp cùng chức năng (ví dụ mouse và keyboard đều là input device).

- Giao tiếp với user space qua virtual filesystem, cho phép quản lý và enumerate device cùng property chúng cung cấp từ user space.

- Quản lý object life cycle bằng reference counting.

- Khả năng power management, cho phép xử lý thứ tự device cần shutdown.

- Tái sử dụng code. Class và framework cung cấp interface, hoạt động như hợp đồng mà mọi driver đăng ký với chúng phải tuân thủ.

- Phong cách lập trình giống object-oriented (OO) và encapsulation trong kernel.

Trong chương này, chúng ta sử dụng LDM và export một số property tới user space qua sysfs filesystem. Để làm vậy, sẽ đề cập các chủ đề sau:

- Giới thiệu LDM data structure

- Đi sâu vào LDM

- Tổng quan device model từ sysfs

## Giới thiệu LDM data structure

Linux device model đưa vào device hierarchy. Nó được xây trên một số data structure. Trong số đó có bus, biểu diễn trong kernel bằng instance `struct bus_type`; device driver, biểu diễn bằng structure `struct device_driver`; và device, thành phần cuối cùng, biểu diễn bằng instance của structure `struct device`. Trong phần này, chúng ta giới thiệu mọi structure đó và tìm hiểu cách chúng tương tác với nhau.

## Bus data structure

Bus là kênh liên kết giữa device và processor. Thực thể hardware quản lý bus và cung cấp protocol cho device gọi là bus controller. Ví dụ, USB controller cung cấp hỗ trợ USB, còn I2C controller cung cấp hỗ trợ I2C bus. Tuy nhiên, bus controller tự nó là device nên phải được đăng ký như mọi device. Nó là parent của các device cần nằm trên bus này. Nói cách khác, mọi device trên bus phải có parent field trỏ tới bus device. Bus được biểu diễn trong kernel bằng structure `struct bus_type`, có định nghĩa sau:

```
struct bus_type {
    const char        *name;
    const char        *dev_name;
    struct device     *dev_root;
    const struct attribute_group **bus_groups;
    const struct attribute_group **dev_groups;
    const struct attribute_group **drv_groups;
    int (*match)(struct device *dev,
                 struct device_driver *drv);
    int (*probe)(struct device *dev);
    void (*sync_state)(struct device *dev);
    int (*remove)(struct device *dev);
    void (*shutdown)(struct device *dev);
    int (*suspend)(struct device *dev, pm_message_t state);
    int (*resume)(struct device *dev);
    const struct dev_pm_ops *pm;
[...]
};
```

Ở đây chỉ liệt kê thành phần liên quan sách này; hãy xem chi tiết hơn:

- `match` là callback được gọi mỗi khi device hoặc driver mới được thêm vào bus này. Callback phải đủ thông minh và nên return giá trị khác 0 khi device match với driver, cả hai được truyền làm parameter. Mục đích chính của callback `match` là cho phép bus xác định device cụ thể có thể được driver xử lý hay không, hoặc theo chiều ngược lại, driver có hỗ trợ device đã cho hay không. Phần lớn trường hợp, kiểm tra được làm bằng so sánh string đơn giản (device name và driver name, table và device tree-compatible property, v.v.). Với enumerated device (PCI, USB), kiểm tra được làm bằng cách so sánh device ID driver hỗ trợ với device ID của device đã cho, mà không làm mất chức năng bus-specific.

- `probe` là callback được gọi khi device hoặc driver mới được thêm vào bus sau khi match xảy ra. Function chịu trách nhiệm cấp phát bus device structure cụ thể và gọi function `probe` của driver đã cho, được dự kiến quản lý device (đã cấp phát trước đó).

- `remove` được gọi khi device rời bus này.

- `suspend` là method được gọi khi device trên bus cần vào sleep mode.

- `resume` được gọi khi device trên bus phải được đưa ra khỏi sleep mode.

- `pm` là tập power management operation cho bus, cũng có thể gọi power management operation driver-specific.

- `drv_groups` là pointer tới danh sách (array) phần tử `struct attribute_group`, mỗi phần tử có pointer tới danh sách (array) phần tử `struct attribute`. Nó biểu diễn default attribute của device driver trên bus. Attribute truyền vào field này được cấp cho mọi driver đăng ký với bus. Có thể tìm attribute trong driver directory tại `/sys/bus/<bus-name>/drivers/<driver-name>`.

- `dev_groups` biểu diễn default attribute của device trên bus. Mọi attribute truyền (qua danh sách/array phần tử `struct attribute_group`) cho field này được cấp cho mọi device đăng ký với bus. Có thể tìm attribute trong device directory tại `/sys/bus/<bus-name>/devices/<device-name>`.

- `bus_group` chứa tập (group) default attribute tự động được thêm khi bus đăng ký với core.

Ngoài định nghĩa `bus_type`, bus driver phải định nghĩa driver structure bus-specific mở rộng generic `struct device_driver`, cùng device structure bus-specific mở rộng generic structure `struct device`. Cả hai thuộc device model core. Bus driver cũng phải cấp phát bus-specific device structure cho mỗi physical device được phát hiện khi probing. Nó cũng chịu trách nhiệm thiết lập field bus và parent của device, cùng đăng ký chúng với LDM core. Các field phải trỏ tới structure `bus_type` và `bus_device` được định nghĩa trong bus driver. LDM core dùng chúng để xây device hierarchy và khởi tạo field khác.

Mỗi bus quản lý nội bộ hai danh sách quan trọng: danh sách device đã thêm và nằm trên nó, cùng danh sách driver đã đăng ký với nó. Mỗi khi thêm/đăng ký hoặc xóa/hủy đăng ký device/driver với bus, danh sách tương ứng được cập nhật bằng entry mới. Bus driver phải cung cấp helper function để đăng ký/hủy đăng ký device driver có thể xử lý device trên bus đó, cùng helper function để đăng ký/hủy đăng ký device trên bus. Những helper function này luôn wrap generic function do LDM core cung cấp: `driver_register()`, `device_register()`, `driver_unregister()` và `device_unregister()`.

Bây giờ hãy bắt đầu viết bus infrastructure mới tên `PACKT`. `PACKT` sẽ là bus của chúng ta; device nằm trên bus là `PACKT` device, còn driver là `PACKT` driver. Hãy bắt đầu viết helper cho phép đăng ký `PACKT` device và driver:

```
/*
* Let's write and export symbols that people
* writing drivers for packt devices must use.
*/
int packt_register_driver(struct packt_driver *driver)
{
    driver->driver.bus = &packt_bus_type;
    return driver_register(&driver->driver);
}
EXPORT_SYMBOL(packt_register_driver);
void packt_unregister_driver(struct packt_driver *driver)
{
    driver_unregister(&driver->driver);
}
EXPORT_SYMBOL(packt_unregister_driver);
int packt_register_device(struct packt_device *packt)
{
    packt->dev.bus = &packt_bus_type;
    return device_register(&packt->dev);
}
EXPORT_SYMBOL(packt_device_register);
void packt_unregister_device(struct packt_device *packt)
{
    device_unregister(&packt->dev);
}
EXPORT_SYMBOL(packt_unregister_device);
```

Bây giờ đã tạo registration helper, hãy viết function duy nhất cho phép cấp phát `PACKT` device mới và đăng ký device này với `PACKT` core:

```
struct packt_device * packt_device_alloc(const char *name,
                                          int id)
{
    struct packt_device    *packt_dev;
    int                    status;
    packt_dev = kzalloc(sizeof(*packt_dev), GFP_KERNEL);
    if (!packt_dev)
        return NULL;
    /* devices on the bus are children of the bus device */
    strcpy(packt_dev->name, name);
    packt_dev->dev.id = id;
    dev_dbg(&packt_dev->dev,
      "device [%s] registered with PACKT bus\n",
       packt_dev->name);
    return packt_dev;
}
EXPORT_SYMBOL_GPL(packt_device_alloc);
```

Function `packt_device_alloc()` cấp phát bus-specific device structure phải dùng để đăng ký `PACKT` device với bus. Tại đây, nên cung cấp helper cho phép cấp phát `PACKT` controller device và đăng ký nó — tức đăng ký `PACKT` bus mới. Để làm vậy, phải định nghĩa `PACKT` controller data structure như sau:

```
struct packt_controller {
    char name[48];
    struct device dev;    /* the controller device */
    struct list_head  list;
    int (*send_msg) (stuct packt_device *pdev,
                       const char *msg, int count);
    int (*recv_msg) (stuct packt_device *pdev,
                        char *dest, int count);
};
```

Trong data structure trên, `name` biểu diễn controller name, `dev` biểu diễn struct device bên dưới gắn với controller này, `list` dùng để chèn controller vào global list các `PACKT` controller của hệ thống, còn `send_msg` và `recv_msg` là hook mà controller phải cung cấp để truy cập `PACKT` device nằm trên nó:

```
/* system global list of controllers */
static LIST_HEAD(packt_controller_list);
struct packt_controller
    *packt_alloc_controller(struct device *dev)
{
    struct packt_controller *ctlr;
    if (!dev)
        return NULL;
    ctlr = kzalloc(sizeof(packt_controller), GFP_KERNEL);
    if (!ctlr)
        return NULL;
    device_initialize(&ctlr->dev);
    [...]
    return ctlr;
}
EXPORT_SYMBOL_GPL(packt_alloc_controller);
int packt_register_controller(
                           struct packt_controller *ctlr)
{
    /* must provide at least on hook */
if (!ctlr->send_msg && !ctlr->recv_msg){
        pr_err("Registering PACKT controller failure\n");
    }
    device_add(&ctlr->dev);
    [...] /* other sanity check */
    list_add_tail(&ctlr->list, &packt_controller_list);
}
EXPORT_SYMBOL_GPL(packt_register_controller);
```

Trong hai function này, chúng ta minh họa controller allocation operation và registration operation. Allocation method cấp phát memory và khởi tạo cơ bản, để driver làm phần còn lại. Lưu ý sau khi đăng ký controller, nó xuất hiện dưới `/sys/devices` trong sysfs. Mọi device thêm vào bus này xuất hiện dưới `/sys/devices/packt-`

```
0/.
```

### Đăng ký bus

Bus controller tự nó là device và trong phần lớn trường hợp, bus là memory-mapped platform device (kể cả bus hỗ trợ device enumeration). Ví dụ, PCI controller là platform device, driver tương ứng cũng vậy. Nên dùng function `bus_register(struct *bus_type)` để đăng ký bus với kernel. `PACKT` bus structure có dạng sau:

```
/* This is our bus structure */
struct bus_type packt_bus_type = {
    .name     = "packt",
    .match    = packt_device_match,
    .probe    = packt_device_probe,
    .remove   = packt_device_remove,
    .shutdown = packt_device_shutdown,
};
```

Bây giờ đã định nghĩa basic bus operation, cần đăng ký `PACKT` bus framework để cả controller driver lẫn slave driver dùng được. Bus controller tự nó là device; phải được đăng ký với kernel và sẽ dùng làm parent của device trên bus. Việc này thực hiện trong probe function hoặc function `init` của bus controller. Với `PACKT` bus, code như sau:

```
static int __init packt_init(void)
{
    int status;
    status = bus_register(&packt_bus_type);
    if (status < 0)
        goto err0;
    status = class_register(&packt_master_class);
    if (status < 0)
        goto err1;
    return 0;
err1:
    bus_unregister(&packt_bus_type);
err0:
    return status;
}
postcore_initcall(packt_init);
```

Khi device được bus controller driver đăng ký, member `parent` của device phải trỏ tới bus controller device (device driver nên làm việc này), và property `bus` phải trỏ tới `PACKT` bus type (core làm việc này) để xây physical device tree. Để đăng ký `PACKT` device, phải gọi `packt_device_register()`, nhận argument là `PACKT` device được cấp phát bằng `packt_device_alloc()`:

```
int packt_device_register(struct packt_device *packt)
{
    packt->dev.bus = &packt_bus_type;
    return device_register(&packt->dev);
}
EXPORT_SYMBOL(packt_device_register);
```

Bây giờ đã hoàn tất đăng ký bus, hãy xem driver infrastructure và cách thiết kế.

## Driver data structure

Driver là tập method cho phép điều khiển device đã cho. Global device hierarchy cho phép biểu diễn mọi device trong hệ thống theo cùng cách. Điều này giúp core dễ duyệt device tree và thực hiện tác vụ như power management transition đúng thứ tự.

Mỗi device driver được biểu diễn bằng instance `struct device_driver`, định nghĩa như sau:

```
struct device_driver {
    const char        *name;
    struct bus_type   *bus;
    struct module     *owner;
    const struct of_device_id   *of_match_table;
    const struct acpi_device_id  *acpi_match_table;
    int (*probe) (struct device *dev);
    int (*remove) (struct device *dev);
    void (*shutdown) (struct device *dev);
    int (*suspend) (struct device *dev,
                    pm_message_t state);
    int (*resume) (struct device *dev);
    const struct attribute_group **groups;
    const struct dev_pm_ops *pm;
};
```

Hãy xem thành phần trong data structure này:

- `name` biểu diễn driver name. Có thể dùng cho matching bằng cách so sánh với device name.

- `bus` biểu diễn bus mà driver nằm trên. Driver `bus` phải điền field này.

- `module` biểu diễn module sở hữu driver. Trong 99% trường hợp, phải đặt field thành `THIS_MODULE`.

- `of_match_table` là pointer tới array `struct of_device_id`. Structure `struct of_device_id` dùng để thực hiện open firmware match qua file đặc biệt gọi là device tree, được truyền cho kernel trong boot process:

```
struct of_device_id {
    char       compatible[128];
    const void *data;
};
```

- `suspend` và `resume` là power management callback, lần lượt được gọi để đưa device vào sleep hoặc đánh thức từ sleep state. Callback `remove` được gọi khi device bị tháo vật lý khỏi hệ thống hoặc reference count về `0`. Callback `remove` cũng được gọi khi system reboot.

- `probe` là probe callback chạy khi thử bind driver với device. Bus driver phụ trách gọi probe function của device driver.

- `group` là pointer tới danh sách (array) `struct attribute_group`, dùng làm default attribute cho driver. Nên dùng phương thức này thay vì tạo attribute riêng.

Bây giờ đã quen driver data structure và mọi thành phần, hãy tìm hiểu kernel cung cấp API nào để đăng ký nó.

### Đăng ký driver

low-level function `driver_register()` dùng để đăng ký device driver với bus và thêm nó vào driver list của bus. Khi device driver đăng ký với bus, core duyệt danh sách device trên cùng bus và gọi match callback của bus cho mỗi device chưa có driver. Nó làm vậy để tìm device mà driver có thể xử lý.

Sau đây là khai báo driver infrastructure của chúng ta:

```
/*
* Bus specific driver structure
* You should provide your device's probe
* and remove functions.
*/
struct packt_driver {
    int     (*probe)(struct packt_device *packt);
    int     (*remove)(struct packt_device *packt);
    void    (*shutdown)(struct packt_device *packt);
    struct device_driver driver;
    const struct i2c_device_id *id_table;
};
#define to_packt_driver(d) \
        container_of(d, struct packt_driver, driver)
#define to_packt_device(d) container_of(d, \
                             struct packt_device, dev)
```

Trong ví dụ, có hai helper macro để lấy `PACKT` device và `PACKT` driver từ generic `struct device` hoặc `struct driver` đã cho.

Tiếp đến là structure dùng nhận diện `PACKT` device, định nghĩa như sau:

```
struct packt_device_id {
    char name[PACKT_NAME_SIZE];
    kernel_ulong_t driver_data;   /* Data private to the driver */
};
```

Device và device driver được bind với nhau khi match. Binding là quá trình gắn device với device driver, được bus framework thực hiện.

Bây giờ trở lại đăng ký driver với `PACKT` bus. Driver phải dùng `packt_register_driver(struct packt_driver *driver)`, wrapper của `driver_register()`. Parameter `driver` phải được điền trước khi đăng ký `PACKT` driver. LDM core cung cấp helper function để lặp qua danh sách driver đã đăng ký với bus:

```
int bus_for_each_drv(struct bus_type * bus,
                struct device_driver * start, void * data,
                int (*fn)(struct device_driver *, void *));
```

Helper này lặp qua driver list của bus và gọi callback `fn` cho từng driver trong danh sách.

## Device data structure

`struct device` là generic data structure dùng mô tả và đặc trưng mỗi device trên hệ thống, vật lý hoặc không. Nó chứa chi tiết physical attribute của device và cung cấp linkage information thích hợp để xây device tree phù hợp và reference counting:

```
struct device {
    struct device *parent;
    struct kobject kobj;
    const struct device_type *type;
    struct bus_type      *bus;
    struct device_driver *driver;
    void    *platform_data;
    void    *driver_data;
    struct device_node      *of_node;
    struct class *class;
    const struct attribute_group **groups;
    void    (*release)(struct device *dev);
[...]
};
```

Data structure trên đã được rút ngắn để dễ đọc. Hãy xem các thành phần được cung cấp:

- `parent` biểu diễn parent của device và dùng xây device tree hierarchy. Khi đăng ký với bus, bus driver chịu trách nhiệm đặt field này bằng bus device.

- `bus` biểu diễn bus mà device nằm trên. Bus driver phải điền field này.

- `type` nhận diện device type.

- `kobj` là kobject, xử lý reference counting và hỗ trợ device model.

- `of_node` là pointer tới open firmware (device tree) node gắn với device. Bus driver chịu trách nhiệm đặt field này.

- `platform_data` là pointer tới platform data đặc thù device. Thường được khai báo trong board-specific file khi khai báo device.

- `driver_data` là pointer tới private data cho driver.

- `class` là pointer tới class mà device thuộc về.

- `group` là pointer tới danh sách (array) `struct attribute_group`, dùng làm default attribute cho device. Nên dùng cách này thay vì tạo attribute riêng.

- `release` là callback được gọi khi device reference count về 0. Bus có trách nhiệm thiết lập field này. `PACKT` bus driver cho thấy cách làm.

Bây giờ đã mô tả device structure, hãy học cách đưa nó thành một phần hệ thống bằng đăng ký.

### Đăng ký device

`device_register()` là function do LDM core cung cấp để đăng ký device với bus. Sau lời gọi, driver list của bus được duyệt để tìm driver hỗ trợ device; sau đó device được thêm vào device list của bus. Nội bộ `device_register()` gọi `device_add()`:

```
int device_add(struct device *dev)
{
    [...]
    bus_probe_device(dev);
        if (parent)
                klist_add_tail(&dev->p->knode_parent,
                            &parent->p->klist_children);
    [...]
}
```

Helper function kernel cung cấp để lặp qua device list của bus là `bus_for_each_dev`. Định nghĩa như sau:

```
int bus_for_each_dev(struct bus_type * bus,
                    struct device * start, void * data,
                    int (*fn)(struct device *, void *));
```

Mỗi khi device được thêm, core gọi matching method của bus driver (`bus_type->match`). Nếu matching function thành công, core gọi probing function của bus driver (`bus_type->probe`), truyền cả device và driver đã match làm parameter. Sau đó bus driver chịu trách nhiệm gọi probing method của device driver (tức `driver->probe`). Với `PACKT` bus driver, function dùng đăng ký device là `packt_device_register(struct` `packt_device *packt)`, nội bộ gọi `device_register()`. Ở đây parameter là `PACKT` device đã cấp phát bằng `packt_device_alloc()`.

bus-specific device data structure được định nghĩa như sau:

```
/*
* Bus specific device structure
* This is what a PACKT device structure looks like
*/
struct packt_device {
    struct module        *owner;
    unsigned char        name[30];
    unsigned long        price;
    struct device        dev;
};
```

Trong code trên, `dev` là structure `struct device` bên dưới cho device model, còn `name` là device name.

Bây giờ đã định nghĩa data structure, hãy tìm hiểu cơ chế bên dưới LDM.

## Đi sâu vào LDM

Đến đây, chúng ta đã bàn bus, driver và device, dùng xây system device topology. Dù đúng như vậy, những chủ đề trước chỉ là phần nổi của tảng băng. Bên trong, LDM dựa trên ba data structure thấp nhất: `kobject`, `kobj_type` và `kset`. Chúng dùng liên kết object.

Trước khi đi tiếp, hãy định nghĩa một số thuật ngữ dùng xuyên suốt chương:

- sysfs: sysfs là in-memory virtual filesystem thể hiện kernel object hierarchy, được trừu tượng hóa bằng instance `struct`

```
kobject.
```

- Attribute: Attribute (hoặc sysfs attribute) xuất hiện như file trong sysfs. Trong kernel, nó có thể được map tới bất kỳ thứ gì: biến, device property, buffer hoặc thứ hữu ích nào với driver cần được export ra bên ngoài.

Trong phần này, chúng ta học cách mỗi structure tham gia device model.

## Tìm hiểu kobject structure

`struct kobject`, nghĩa là kernel object (cũng viết tắt kobject xuyên suốt chương), là core data structure của device model, cũng là cốt lõi các khái niệm phía sau sysfs. Với mỗi directory trong sysfs, có một `struct kobject` ở đâu đó trong kernel. Ngoài ra, kobject có thể export một hoặc nhiều attribute, xuất hiện dưới dạng file trong sysfs directory của Kobject đó. Giờ trở lại code — `struct kobject` được định nghĩa trong kernel như sau:

```
struct kobject {
    const char              *name;
    struct list_head        entry;
    struct kobject          *parent;
    struct kset             *kset;
    struct kobj_type        *ktype;
    struct sysfs_dirent     *sd;
    struct kref             kref;
[...]
};
```

Trong data structure trên, chỉ thành phần chính được liệt kê. Hãy xem chi tiết hơn:

- `name` là tên kobject này. Có thể sửa bằng function `kobject_set_name(struct kobject *kobj, const` `char *name)`. Nó dùng làm tên directory `kobject` này.

- `parent` là pointer tới kobject khác, được xem là parent của kobject này. Dùng xây topology và mô tả quan hệ giữa object.

- `sd` trỏ tới structure `struct sysfs_dirent`, biểu diễn directory của kobject này trong sysfs. `name` được dùng làm tên directory. Nếu đặt `parent`, directory này là sub-directory trong parent directory.

- `kref` cung cấp reference counting cho kobject. Giúp theo dõi object còn được dùng hay không và có thể giải phóng nếu không còn dùng. Ngược lại, có thể ngăn xóa nếu vẫn đang dùng. Khi dùng trong kernel object, giá trị ban đầu là `1`.

- `ktype` mô tả kobject. Mỗi kobject được cấp tập default attribute khi tạo. Thành phần `ktype`, thuộc structure `struct kobj_type`, dùng chỉ định default attribute này. Structure cho phép kernel object chia sẻ common operation (`sysfs_ops`), dù object có liên quan chức năng hay không.

- `kset` cho biết object này thuộc set (group) object nào.

Trước khi dùng kobject, phải cấp phát động (chỉ theo cách này) rồi khởi tạo. Driver có thể dùng function `kzalloc()` (hoặc `kmalloc()`) hay `kobject_create()`. Với `kzalloc()`, object được cấp phát và rỗng, phải khởi tạo bằng API khác, `kobject_init()`. Với `kobject_create()`, cấp phát và khởi tạo ngầm được thực hiện. API định nghĩa như sau:

```
void kobject_init(struct kobject *kobj,
                  struct kobj_type *ktype)
struct kobject *kobject_create(void)
```

Trong code trên, parameter đầu của `kobject_init()` phải là kobject đã cấp phát ban đầu, ví dụ qua `kzalloc()`. Parameter thứ hai, `ktype`, bắt buộc nên không được là `NULL`; nếu không kernel sẽ phàn nàn (`dump_stack()`). Ngược lại, `kobject_create()` không cần gì; nó ngầm cấp phát và khởi tạo (nội bộ gọi `kzalloc()` và `kobject_init()`). Khi thành công, return kobject object vừa khởi tạo.

Sau khi kobject được khởi tạo, driver có thể dùng `kobject_add()` để liên kết object với hệ thống, tạo sysfs directory entry cho kobject. Vị trí directory được tạo phụ thuộc parent element của kobject có được đặt hay không. Tuy nhiên, nếu parent chưa đặt, có thể chỉ định khi thêm kobject vào hệ thống bằng `kobject_add()`, định nghĩa như sau:

```
int kobject_add(struct kobject *kobj, struct kobject *parent,
                const char *fmt, ...);
```

Trong function trên, `kobj` là kernel object cần thêm vào hệ thống, `parent` là parent của nó. Directory `kobject` được tạo là sub-directory của parent. Nếu `parent` là `NULL`, directory được tạo trực tiếp dưới `/sys/`.

Thay vì dùng riêng `kobject_init()` hoặc `kobject_create()` rồi `kobject_add()`, có thể dùng `kobject_init_and_add()`, kết hợp hành động của chúng. Định nghĩa như sau:

```
int kobject_init_and_add(struct kobject *kobj,
                         struct kobj_type *ktype,
                         struct kobject *parent,
                         const char *fmt, ...);
```

Trong interface trên, cần cấp phát object trước. Có helper khác ngầm cấp phát, khởi tạo và thêm kobject vào hệ thống. Function là `kobject_create_and_add()`, định nghĩa như sau:

```
struct kobject * kobject_create_and_add(const char *name,
                                     struct kobject *parent);
```

Function trên nhận tên kobject dùng làm directory name, cùng parent kobject mà directory tạo ra sẽ là subdirectory của nó. Truyền `NULL` làm parameter thứ hai khiến directory được tạo trực tiếp dưới `/sys/`.

Tuy nhiên, một số kobject định sẵn trong kernel đã biểu diễn một số directory dưới `/sys/`. Hãy xem vài object:

- `kernel_kobj`: Kobject này phụ trách directory `/sys/kernel`.

- `mm_kobj`: Phụ trách `/sys/kernel/mm`.

- `fs_kobj`: Filesystem kobject, phụ trách `/sys/fs`.

- `hypervisor_kobj`: Phụ trách `/sys/hypervisor`.

- `power_kobj`: Power management kobject dùng làm gốc của `/sys/power`.

- `firmware_kobj`: Firmware kobject sở hữu directory `/sys/firmware`.

Khi dùng xong kobject, driver nên giải phóng nó. low-level function có thể dùng là `kobject_release()`. Tuy nhiên, API không xét người dùng tiềm năng khác của kobject, mà thao tác trực tiếp và đơn giản. Nên dùng `kobject_put()` thay thế, giảm reference counter của kobject rồi giải phóng nếu giá trị mới là `0`. Nhớ rằng khi kobject được khởi tạo, reference counter đặt là `1`. Ngoài ra, nên bao việc dùng kobject bằng function `kobject_get()` và `kobject_put()`, trong đó `kobject_get()` chỉ tăng reference counter.

Các API có prototype sau:

```
void kobject_put(struct kobject * kobj);
struct kobject *kobject_get(struct kobject *kobj);
```

Trong code trên, `kobject_get()` nhận kobject cần tăng reference counter làm parameter và return cùng kobject sau khi parameter được khởi tạo. `kobject_put()` giảm reference counter đi 1 và nếu giá trị mới là `0`, `kobject_release()` tự động được gọi trên object để giải phóng nó.

Code sau cho thấy cách kết hợp `kobject_create()`, `kobject_init()` và `kobject_add()` để tạo, thêm kernel object vào hệ thống:

```
/* Somewhere */
static struct kobject *mykobj;
[...]
mykobj = kobject_create();
if (!mykobj)
    return -ENOMEM;
kobject_init(mykobj, &my_ktype);
if (kobject_add(mykobj, NULL, "%s", "hello")) {
    pr_info("ldm: kobject_add() failed\n");
    kobject_put(mykobj);
    mykobj = NULL;
    return -1;
}
```

Như thấy, có thể dùng all-in-one function như `kobject_create_and_add()`, nội bộ gọi `kobject_create()` và `kobject_add()`. Đoạn trích sau từ `drivers/base/core.c` cho thấy cách dùng:

```
static struct kobject * class_kobj   = NULL;
static struct kobject * devices_kobj = NULL;
/* Create /sys/class */
class_kobj = kobject_create_and_add("class", NULL);
if (!class_kobj)
    return -ENOMEM;
[...]
/* Create /sys/devices */
devices_kobj = kobject_create_and_add("devices", NULL);
if (!devices_kobj)
    return -ENOMEM;
```

Nhớ rằng với mỗi `struct kobject`, có thể tìm kobject directory tương ứng trong `/sys/`, và upper directory được `kobj->parent` trỏ tới.

LƯU Ý

Vì bắt buộc cung cấp `kobj_type` khi khởi tạo kobject, all-in-one helper dùng `kobj_type` mặc định kernel-provided, tức `dynamic_kobj_ktype`. Vì vậy, trừ khi có lý do chính đáng để khởi tạo `kobj_type` riêng (phần lớn khi muốn điền default attribute), nên dùng biến thể `kobject_create*()`, dùng kobject type kernel-provided, thay vì `kobject_init*()`, yêu cầu cung cấp `kobj_type` tự khởi tạo.

## Tìm hiểu structure kobj\_type

Structure `struct kobj_type`, nghĩa là kernel object type, là data structure định nghĩa hành vi kobject element và điều khiển điều xảy ra với kobject khi được tạo hoặc hủy. Ngoài ra, `kobj_type` chứa default attribute của kobject cùng hook cho phép thao tác các attribute.

Vì phần lớn device cùng type có cùng attribute, những attribute này được tách riêng và lưu trong thành phần `ktype`. Điều đó cho phép quản lý linh hoạt. Mỗi kobject phải có structure `kobj_type` tương ứng. Data structure định nghĩa như sau:

```
struct kobj_type {
    void (*release)(struct kobject *);
    const struct sysfs_ops sysfs_ops;
    struct attribute **default_attrs;
};
```

Trong data structure trên, `release` là callback được gọi trên release path của kobject để driver có cơ hội giải phóng resource đã cấp phát cho kobject. Callback ngầm chạy khi `kobject_put()` sắp giải phóng kobject. `default_attrs` là array pointer tới structure `attribute`. Field liệt kê attribute cần tạo cho mọi kobject type này, còn `sysfs_ops` cung cấp tập method cho phép truy cập attribute.

Code sau thể hiện định nghĩa data structure `struct sysfs_ops` trong kernel:

```
struct sysfs_ops {
    ssize_t (*show)(struct kobject *kobj,
                   struct attribute *attr, char *buf);
    ssize_t (*store)(struct kobject *kobj,
                   struct attribute *attr, const char *buf,
                   size_t size);
};
```

Trong code trên, `show` là callback được gọi để đáp ứng read operation trên attribute do `kobj_type` này cung cấp — tức mỗi khi attribute được đọc từ user space. `buf` là output buffer. Buffer size cố định, dài `PAGE_SIZE`. Data cần cung cấp phải đặt trong `buf`, tốt nhất bằng `scnprintf()`. Cuối cùng, nếu callback thành công, phải return size (theo byte) của data đã ghi vào buffer, hoặc lỗi âm nếu thất bại. Theo quy tắc sysfs, mỗi attribute nên chứa/cung cấp một value hoặc property human-readable; nếu có nhiều data cần return, nên cân nhắc chia thành nhiều attribute.

`store` được gọi để ghi — tức khi người dùng ghi vào attribute. Parameter `buf` tối đa `PAGE_SIZE` nhưng có thể nhỏ hơn. Phải return size (theo byte) data đã đọc từ buffer khi thành công hoặc lỗi âm khi thất bại (hoặc nhận giá trị không mong muốn).

Pointer `attr` được truyền làm argument cho cả hai method và có thể dùng xác định attribute đang truy cập. Method `show`/`store` thường thực hiện chuỗi kiểm tra trên attribute name để làm vậy. Ngược lại, triển khai khác bao attribute structure trong data structure chứa bên ngoài, cung cấp data cần để return attribute value (`struct kobject_attribute`, `struct device_attribute`, `struct driver_attribute` và `struct class_attribute` là ví dụ); khi đó, macro `container_of` dùng để lấy pointer tới embedding structure. Đây là phương thức được `kobj_sysfs_ops` dùng, biểu diễn operation do `dynamic_kobj_ktype` cung cấp. Cả hai được minh họa trong ví dụ đi kèm sách.

## Tìm hiểu kset structure

Mục đích chính của `struct kset` là nhóm kernel object liên quan. `kset` viết tắt kernel object sets, có thể hiểu là tập kobject. Nói cách khác, `kset` tập hợp kobject liên quan vào một nơi, như mọi block device.

Data structure `kset` được định nghĩa trong kernel như sau:

```
struct kset {
    struct list_head list;
    spinlock_t list_lock;
    struct kobject kobj;
};
```

Mọi thành phần có ý nghĩa khá rõ. Nói đơn giản, `list` là linked list mọi kobject trong `kset`, `list_lock` là spinlock bảo vệ linked list access (khi thêm hoặc xóa kobject element trong `kset`), còn `kobj` biểu diễn base class kobject cho set. Kobject này được dùng làm default parent của kobject thêm vào set có parent `NULL`.

Mỗi `kset` được đăng ký tương ứng sysfs directory tạo thay cho thành phần `kobj` của nó. Có thể tạo và thêm `kset` bằng function `kset_create_and_add()`, rồi xóa bằng `kset_unregister()`. Code sau thể hiện định nghĩa cả hai:

```
struct kset * kset_create_and_add(const char *name,
                      const struct kset_uevent_ops *u,
                      struct kobject *parent_kobj);
void kset_unregister (struct kset * k);
```

Trong API trên, `name` là tên `kset`, cũng dùng làm tên directory tạo cho `kset`. Parameter `u` là pointer tới `struct uevent_ops`, biểu diễn tập user event (uevent) operation được gọi mỗi khi `kset` thay đổi để, chẳng hạn, thêm environment variable mới hoặc lọc uevent nếu muốn. Parameter có thể (và thường là) `NULL`. Cuối cùng, `parent_kobj` là parent kobject của `kset`.

Thêm kobject vào set đơn giản là chỉ định field `.kset` của nó cho đúng `kset`:

```
static struct kobject foo_kobj, bar_kobj;
[...]
example_kset = kset_create_and_add("kset_example",
                           NULL, kernel_kobj);
/* since we have a kset for this kobject,
  * we need to set it before calling into the kobject core.
  */
foo_kobj.kset = example_kset;
bar_kobj.kset = example_kset;
retval = kobject_init_and_add(&foo_kobj, &foo_ktype,
                              NULL, "foo_name");
retval = kobject_init_and_add(&bar_kobj, &bar_ktype,
                              NULL, "bar_name");
```

Khi dùng xong `kset`, có thể giải phóng bằng `kset_unregister()`, sau đó nó được giải phóng động khi không còn dùng. Code sau giải phóng đối tượng trong ví dụ của chúng ta

```
kset:
kset_unregister(example_kset);
```

Bây giờ đã quen kobject và type structure, hãy học cách làm việc với non-default sysfs attribute.

## Làm việc với non-default attribute

Attribute là sysfs file được export tới user space qua kobject. Dù default attribute thường đủ, có thể thêm attribute khác. Attribute có thể đọc, ghi hoặc cả hai từ user space.

Định nghĩa attribute như sau:

```
struct attribute {
        char              *name;
        struct module     *owner;
        umode_t           mode;
};
```

Trong attribute data structure, `name` là attribute name, cũng là tên file entry tương ứng. `owner` là attribute owner — thường là `THIS_MODULE` — và `mode` chỉ read/write permission cho attribute theo định dạng user-group-other (ugo).

Default attribute rất tiện dùng nhưng chưa đủ linh hoạt. Ngoài ra, simple attribute không thể đọc/ghi ngoại trừ qua sysfs ops của `kobj_type`, nghĩa là nếu có quá nhiều attribute, các nhánh trong show/store function sẽ rối. Để giải quyết, kobject core cung cấp cơ chế nhúng mỗi attribute trong data structure đặc biệt chứa bên ngoài: `struct kobj_attribute`. Data structure cung cấp wrapper routine để đọc và ghi.

`struct kobj_attribute` (định nghĩa trong `include/linux/kobject.h`) có dạng sau:

```
struct kobj_attribute {
struct attribute attr;
ssize_t (*show)(struct kobject *kobj,
                 struct kobj_attribute *attr, char *buf);
ssize_t (*store)(struct kobject *kobj,
                 struct kobj_attribute *attr,
                 const char *buf, size_t count);
};
```

Trong data structure này, `attr` là attribute biểu diễn file cần tạo, `show` là pointer tới function được gọi khi file được đọc từ user space, và `store` là pointer tới function được gọi khi file được ghi, cũng từ user space.

Dùng structure `kobj_attribute` chứa bên ngoài giúp phát triển tổng quát hơn và tăng tính linh hoạt của attribute. Theo cách này, pointer tới `attr` được truyền cho function `store` hoặc `show`, không chỉ dùng xác định attribute đang truy cập mà còn lấy data structure chứa nó (tức `kobj_attribute`), từ đó có thể gọi method `show`/`store` của attribute. Để làm vậy, có thể dùng macro `container_of` lấy pointer tới embedding structure.

Sau đây là đoạn trích từ `lib/kobject.c`, minh họa cơ chế tổng quát này trong cả method `show` và `store` của sysfs operations element kernel-provided: `kobj_sysfs_ops`. Thành phần này cũng là sysfs operations data structure (thành phần `kobj_type->sysfs_ops`) được dùng bởi

```
dynamic_kobj_ktype:
static ssize_t kobj_attr_show(struct kobject *kobj,
                     struct attribute *attr, char *buf)
{
   struct kobj_attribute *kattr;
   ssize_t ret = -EIO;
   kattr = container_of(attr, struct kobj_attribute, attr);
   if (kattr->show)
       ret = kattr->show(kobj, kattr, buf);
   return ret;
}
static ssize_t kobj_attr_store(struct kobject *kobj,
                          struct attribute *attr,
                          const char *buf, size_t count)
{
   struct kobj_attribute *kattr;
   ssize_t ret = -EIO;
   kattr = container_of(attr, struct kobj_attribute, attr);
   if (kattr->store)
       ret = kattr->store(kobj, kattr, buf, count);
   return ret;
}
const struct sysfs_ops kobj_sysfs_ops = {
   .show  = kobj_attr_show,
   .store = kobj_attr_store,
};
```

Trong code trên, macro `container_of` làm mọi việc. Điều này cũng bảo đảm với cách này, chúng ta vẫn tương thích mọi kobject implementation bus-, device-, class- và driver-related, như sẽ thấy trong phần tiếp theo.

Hãy trở lại API. Có lẽ bạn luôn biết trước muốn cung cấp attribute nào; vì vậy attribute gần như luôn được khai báo tĩnh. Để hỗ trợ, kernel cung cấp macro `__ATTR` để khởi tạo `kobj_attribute`. Macro được định nghĩa như sau:

```
#define __ATTR(_name, _mode, _show, _store) {         \
    .attr = {.name = __stringify(_name),              \
           .mode = VERIFY_OCTAL_PERMISSIONS(_mode) },\
     .show   = _show,                              \
     .store = _store,                               \
}
```

Trong định nghĩa macro trên, `_name` được stringify và dùng làm attribute name, `_mode` biểu diễn attribute mode, còn `_show` và `_store` lần lượt là pointer tới method `show` và `store` của attribute.

Sau đây là ví dụ khai báo hai attribute, `bar` và `foo` (ví dụ được dùng làm cơ sở ở phần sau):

```
static struct kobj_attribute foo_attr =
    __ATTR(foo, 0660, attr_show, attr_store);
static struct kobj_attribute bar_attr =
    __ATTR(bar, 0660, attr_show, attr_store);
```

Trong ví dụ trên, có hai attribute với permission `0660`. Attribute đầu tên `foo`, thứ hai tên `bar`, cả hai dùng cùng method `show` và `store`.

Bây giờ phải tạo file bên dưới. low-level kernel API dùng thêm/xóa attribute khỏi sysfs filesystem lần lượt là `sysfs_create_file()` và `sysfs_remove_file()`. Định nghĩa như sau:

```
int sysfs_create_file(struct kobject * kobj,
                      const struct attribute * attr);
void sysfs_remove_file(struct kobject * kobj,
                        const struct attribute * attr);
```

`sysfs_create_file()` return 0 khi thành công hoặc lỗi âm khi thất bại. `sysfs_remove_file()` phải nhận cùng parameter để xóa file attribute.

Hãy dùng API này thêm attribute `bar` và `foo` vào hệ thống:

```
struct kobject *demo_kobj;
int err;
demo_kobj = kobject_create_and_add("demo", kernel_kobj);
if (!demo_kobj) {
    pr_err("demo: demo_kobj registration failed.\n");
    return -ENOMEM;
}
err = sysfs_create_file(demo_kobj, &foo_attr.attr);
if (err)
    pr_err("unable to create foo attribute\n");
err = sysfs_create_file(demo_kobj, &bar_attr.attr);
if (err){
    sysfs_remove_file(demo_kobj, &foo_attr.attr);
    pr_err("unable to create bar attribute\n");
}
```

Sau khi code trên thực thi, file `bar` và `foo` hiển thị trong sysfs, tại directory `/sys/demo`. Trong ví dụ, dùng macro `__ATTR` để định nghĩa attribute. Phải chỉ định name, mode và method `show`/`store`. Kernel cung cấp convenience macro cho trường hợp thường gặp nhất để chỉ định attribute và viết code ngắn gọn, dễ đọc, dễ làm hơn. Macro như sau:

- `__ATTR_RO(name)`: Giả định `name_show` là show callback name và đặt mode thành `0444`.

- `__ATTR_WO(name)`: Giả định `name_store` là store function name và giới hạn mode `0200`, nghĩa là chỉ root có quyền ghi.

- `__ATTR_RW(name)`: Giả định `name_show` và `name_store` lần lượt là callback name của `show` và `store`, đặt mode thành `0644`.

- `__ATTR_NULL`: Dùng làm list terminator. Đặt cả name thành `NULL` và dùng làm chỉ báo cuối danh sách (xem `kernel/workqueue.c`).

Mọi macro này chỉ cần attribute name làm parameter. Khác biệt là không giống `__ATTR`, có function name `store`/`show` tùy ý, attribute ở đây được xây với giả định method `show` và `store` lần lượt tên `<attribute_name>_show` và `<attribute_name>_store`. Code sau minh họa bằng macro `__ATTR_RW_MODE`, định nghĩa như sau:

```
#define __ATTR_RW_MODE(_name, _mode) {                 \
    .attr = { .name = __stringify(_name),              \
          .mode = VERIFY_OCTAL_PERMISSIONS(_mode) },\
    .show   = _name##_show,                            \
    .store  = _name##_store,                          \
}
```

Như thấy, field `.show` và `.store` được đặt bằng attribute name có hậu tố lần lượt `_show` và `_store`. Hãy xem ví dụ sau:

```
static struct kobj_attribute attr_foo = __ATTR_RW(foo);
```

Khai báo attribute trên giả định method `show` và `store` lần lượt được định nghĩa là `foo_show` và `foo_store`.

LƯU Ý Nếu cần cung cấp một cặp store/show operation cho mọi attribute, có lẽ nên định nghĩa bằng `__ATTR`. Tuy nhiên, nếu xử lý attribute cần cặp show/store riêng cho mỗi attribute, có thể dùng attribute definition macro khác.

Code sau cho thấy triển khai show/store function cho attribute `foo` và `bar` đã định nghĩa:

```
static ssize_t attr_store(struct kobject *kobj,
                      struct kobj_attribute *attr,
                      const char *buf, size_t count)
{
    int value, ret;
    ret = kstrtoint(buf, 10, &value);
    if (ret < 0)
        return ret;
    if (strcmp(attr->attr.name, "foo") == 0)
        foo = value;
    else /* if (strcmp(attr->attr.name, "bar") == 0) */
        bar = value;
    return count;
}
static ssize_t attr_show(struct kobject *kobj,
                      struct kobj_attribute *attr,
                    char *buf)
{
    int value;
    if (strcmp(attr->attr.name, "foo") == 0)
        value = foo;
    else
        value = bar;
     return sprintf(buf, "%d\n", value);
}
```

Trong code trên, thay vì cung cấp cặp show/store operation cho từng attribute, chúng ta dùng cùng cặp function cho mọi attribute và phân biệt bằng tên tương ứng. Đây là cách thường gặp khi dùng generic `kobject_attribute` thay framework-specific attribute. Lý do là đôi khi chúng áp đặt show/store function name khác nhau cho từng attribute vì không dựa vào macro `__ATTR` để định nghĩa attribute.

### Làm việc với binary attribute

Đến đây, chúng ta đã quen nguyên tắc sysfs và đề cập rằng attribute phải lưu một property/value ở dạng text human-readable, đồng thời có giới hạn `PAGE_SIZE`. Tuy nhiên, có thể có tình huống, dù hiếm, cần trao đổi data lớn hơn ở binary format, chẳng hạn toàn bộ đều có random access. Ví dụ là device firmware transfer, nơi user space upload binary data để đẩy tới hardware, hoặc PCI device cung cấp một phần hoặc toàn bộ configuration address space.

Để bao quát các trường hợp đó, sysfs framework cung cấp binary attribute. Lưu ý attribute này dùng gửi/nhận binary data hoàn toàn không được kernel diễn giải/thao tác. Chỉ nên dùng làm pass-through tới và từ hardware, không có kernel diễn giải. Thao tác duy nhất có thể làm là kiểm tra magic number và size chẳng hạn.

Giờ trở lại code. Binary attribute được biểu diễn bằng `struct bin_attribute`, định nghĩa như sau:

```
struct bin_attribute {
    struct attribute attr;
    size_t     size;
    void             *private;
    ssize_t (*read)(struct file *filp,
              struct kobject *kobj,
              struct bin_attribute *attr,
              char *buffer, loff_t off, size_t count);
    ssize_t (*write)(struct file *filp,
             struct kobject *kobj,
             struct bin_attribute *attr,
             const char *buffer,
             loff_t off, size_t count);
    int (*mmap)(struct file *filp, struct kobject *kobj,
                  struct bin_attribute *attr,
                  struct vm_area_struct *vma);
};
```

Trong code trên, `attr` là classic attribute bên dưới binary attribute, chứa name, owner và permission của binary attribute. `size` biểu diễn size tối đa của binary attribute (hoặc 0 nếu không giới hạn tối đa). `private` là field có thể dùng tùy nhu cầu, thường được gán buffer của binary attribute. Function `read()`, `write()` và `mmap()` tùy chọn, hoạt động tương tự bên tương ứng của normal `char` driver. Trong parameter, `filp` là opened file pointer instance gắn với attribute, và `kobj` là `kobject` bên dưới gắn với binary attribute này. `buffer` lần lượt là output buffer hoặc input buffer cho read operation hoặc write operation. `off` là cùng offset argument có trong mọi read/write method của mọi file type. Nó chỉ offset từ đầu file — tức offset vào binary data. Cuối cùng, `count` là số byte cần đọc hoặc ghi.

LƯU Ý

Dù binary attribute có thể không giới hạn size, data lớn luôn được yêu cầu/gửi theo từng khối `PAGE_SIZE`. Nghĩa là ví dụ function `write()` có thể được gọi nhiều lần cho một lần load. Tuy nhiên, kernel xử lý việc chia này, nên trong suốt với driver. Nhược điểm là sysfs không có cách báo kết thúc chuỗi write operation, nên code triển khai binary attribute phải xác định bằng cách khác.

Để tạo binary attribute, phải cấp phát và khởi tạo. Giống classic attribute, có hai cách cấp phát binary attribute — tĩnh hoặc động. Với cấp phát tĩnh, framework cung cấp low-level macro `__BIN_ATTR`, định nghĩa như sau:

```
#define __BIN_ATTR(_name, _mode, _read, _write, _size) {  \
   .attr = { .name = __stringify(_name), .mode = _mode }, \
   .read    = _read,                        \
   .write   = _write,                       \
    .size      = _size,                          \
```

Nó hoạt động giống macro `__ATTR`. Về parameter, `_name` là binary attribute name, `_mode` biểu diễn permission, `_read` và `_write` lần lượt là read function và write function, còn `_size` là size binary attribute.

Giống classic attribute, binary attribute có high-level helper macro riêng để dễ định nghĩa. Một số macro như sau:

```
BIN_ATTR_RO(name, size)
BIN_ATTR_WO(name, size)
BIN_ATTR_RW(name, size)
```

Macro này khai báo một instance `struct bin_attribute`, có biến tương ứng tên `bin_attribute_<name>`, như trong định nghĩa `BIN_ATTR` sau:

```
#define BIN_ATTR_RW(_name, _size)         \
struct bin_attribute bin_attr_##_name =   \
                __BIN_ATTR_RW(_name, _size)
```

Ngoài ra, giống classic attribute, high-level macro yêu cầu read/write method lần lượt tên `<attribute_name>_read` và `<attribute_name>_write`, như trong định nghĩa `__BIN_ATTR_RW` sau:

```
#define __BIN_ATTR_RW(_name, _size) \
__BIN_ATTR(_name, 0644, _name##_read, _name##_write, \
             _size)
```

Với cấp phát động, `kzalloc()` đơn giản là đủ. Tuy nhiên, binary attribute được cấp phát động phải được khởi tạo bằng `sysfs_bin_attr_init()`, như sau:

```
void sysfs_bin_attr_init(strict bin_attribute *bin_attr)
```

Sau đó, driver phải đặt property khác như mode, name và permission của attribute bên dưới, cùng read/write/map function tùy chọn. Khác classic attribute có thể thiết lập làm default attribute, binary attribute phải được tạo tường minh. Có thể dùng `sysfs_create_bin_file()` như sau:

```
int sysfs_create_bin_file(struct kobject *kobj,
                          struct bin_attribute *attr);
```

Function return `0` khi thành công hoặc lỗi âm khi thất bại. Khi dùng xong binary attribute, có thể xóa bằng `sysfs_remove_bin_file()`, định nghĩa như sau:

```
int sysfs_remove_bin_file(struct kobject *kobj,
                          struct bin_attribute *attr);
```

Sau đây là đoạn trích (bản đầy đủ trong `drivers/i2c/i2c-slave-eeprom.c`) của ví dụ cụ thể làm rõ cách dùng binary attribute được cấp phát và khởi tạo động:

```
struct eeprom_data {
[...]
    struct bin_attribute bin;
    u8 buffer[];
};
static int i2c_slave_eeprom_probe(
                             struct i2c_client *client)
{
    struct eeprom_data *eeprom;
    int ret;
    unsigned int size = FIELD_GET(I2C_SLAVE_BYTELEN,
                                  id->driver_data) + 1;
    eeprom = devm_kzalloc(&client->dev,
                sizeof(struct eeprom_data) + size,
                GFP_KERNEL);
    if (!eeprom)
        return -ENOMEM;
    [...]
    sysfs_bin_attr_init(&eeprom->bin);
    eeprom->bin.attr.name = "slave-eeprom";
    eeprom->bin.attr.mode = S_IRUSR | S_IWUSR;
    eeprom->bin.read = i2c_slave_eeprom_bin_read;
    eeprom->bin.write = i2c_slave_eeprom_bin_write;
    eeprom->bin.size = size;
    ret = sysfs_create_bin_file(&client->dev.kobj,
                                  &eeprom->bin);
    if (ret)
        return ret;
    [...]
    return 0;
};
```

Trên unloading path của module hoặc khi device rời đi, binary file tương ứng được xóa như sau:

```
static int i2c_slave_eeprom_remove(struct i2c_client *client)
{
   struct eeprom_data *eeprom = i2c_get_clientdata(client);
   sysfs_remove_bin_file(&client->dev.kobj, &eeprom->bin);
[...]
   return 0;
}
```

Sau đó, khi triển khai read/write function, có thể chuyển data qua lại bằng `memcpy()`, như sau:

```
static ssize_t i2c_slave_eeprom_bin_read(struct file *filp,
          struct kobject *kobj, struct bin_attribute *attr,
          char *buf, loff_t off, size_t count)
{
    struct eeprom_data *eeprom;
    eeprom = dev_get_drvdata(kobj_to_dev(kobj));
[...]
    memcpy(buf, &eeprom->buffer[off], count);
[...]
    return count;
}
static ssize_t i2c_slave_eeprom_bin_write(
         struct file *filp, struct kobject *kobj,
         struct bin_attribute *attr,
         char *buf, loff_t off, size_t count)
{
     struct eeprom_data *eeprom;
     eeprom = dev_get_drvdata(kobj_to_dev(kobj));
[...]
     memcpy(&eeprom->buffer[off], buf, count);
[...]
    return count;
}
```

Trong đoạn trích trên, offset (parameter `off`) trỏ tới nơi data cần đọc/ghi, còn `count` xác định size data.

### Khái niệm attribute group

Đến đây, chúng ta đã học thêm riêng từng (binary) attribute bằng function `sysfs_create_file()` hoặc `sysfs_create_bin_file()`. Dù đủ nếu chỉ có vài attribute cần thêm, nó có thể khó khăn khi số attribute tăng, cả khi thêm lẫn xóa. Driver phải lặp qua attribute để tạo từng cái hoặc gọi `sysfs_create_file()` số lần bằng số attribute. Đây là nơi attribute group xuất hiện. Nó dựa trên structure `struct attribute_group`, định nghĩa như sau:

```
struct attribute_group {
    const char        *name;
    umode_t           (*is_visible)(struct kobject *,
                         struct attribute *, int);
    umode_t           (*is_bin_visible)(struct kobject *,
                         struct bin_attribute *, int);
    struct attribute  **attrs;
    struct bin_attribute   **bin_attrs;
};
```

Nếu không có tên, khi định nghĩa group attribute, attribute group đặt mọi attribute trực tiếp trong kobject directory. Nếu cung cấp `name`, subdirectory được tạo cho attribute, có directory name là tên attribute group. `is_visible()` là callback tùy chọn nhằm return permission gắn với attribute cụ thể trong group. Nó được gọi lặp lại cho từng (non-binary) attribute trong group. Callback phải return read/write permission của attribute hoặc `0` nếu hoàn toàn không cho truy cập attribute. `is_bin_visible()` tương ứng `is_visible()` cho binary attribute. Value/permission return thay thế static permission đã định nghĩa trong `struct` `attribute`. Thành phần `attrs` là pointer tới danh sách attribute kết thúc bằng `NULL`, còn `bin_attrs` tương ứng cho binary attribute.

Kernel function dùng thêm/xóa group attribute vào/khỏi filesystem như sau:

```
int sysfs_create_group(struct kobject *kobj,
                       const struct attribute_group *grp)
void sysfs_remove_group(struct kobject * kobj,
                        const struct attribute_group * grp)
```

Trở lại ví dụ demo với standard attribute, hai attribute `bar` và `foo` có thể nhúng vào `struct attribute_group`. Điều đó cho phép thêm chúng vào hệ thống một lần bằng một function call như sau:

```
static struct kobj_attribute foo_attr =
    __ATTR(foo, 0660, attr_show, attr_store);
static struct kobj_attribute bar_attr =
    __ATTR(bar, 0660, attr_show, attr_store);
/* attrs is aa array of pointers to attributes */
static struct attribute *demo_attrs[] = {
    &bar_foo_attr.attr,
    &bar_attr.attr,
    NULL,
};
static struct attribute_group my_attr_group = {
    .attrs = demo_attrs,
    /*.bin_attrs = demo_bin_attrs,*/
};
```

Cuối cùng, để tạo attribute một lần, cần dùng `sysfs_create_group()`, như trong code sau:

```
struct kobject *demo_kobj;
int err;
demo_kobj = kobject_create_and_add("demo", kernel_kobj);
if (!demo_kobj) {
    pr_err("demo: demo_kobj registration failed.\n");
    return -ENOMEM;
}
err = sysfs_create_group(demo_kobj, &foo_attr.attr);
```

Ở đây, chúng ta minh họa tầm quan trọng của tạo group attribute và API dễ dùng thế nào. Đến đây mới xét dạng tổng quát; phần tiếp theo học cách tạo framework-specific attribute.

### Tạo symbolic link

Driver có thể tạo/xóa symbolic link trên kobject (directory) hiện có bằng function `sysfs_{create|remove}_link()`, như sau:

```
int sysfs_create_link(struct kobject * kobj,
                     struct kobject * target, char * name);
void sysfs_remove_link(struct kobject * kobj, char * name);
```

Điều này cho phép object tồn tại ở nhiều nơi hoặc tạo shortcut. Function `create` tạo symbolic link tên `name`, trỏ tới sysfs entry của remote `target` kobject. Link được tạo trong directory kobject `kobj`. Ví dụ well-known là device xuất hiện trong cả `/sys/bus` và `/sys/devices` vì bus controller trước hết tự nó là device trước khi cung cấp bus. Tuy nhiên, lưu ý symbolic link đã tạo sẽ tồn tại (trừ khi reboot hệ thống), ngay cả sau khi target bị xóa. Vì vậy, driver phải cân nhắc điều này khi device tương ứng rời hệ thống hoặc module unload.

## Tổng quan device model từ sysfs

sysfs là non-persistent virtual filesystem cung cấp global view của hệ thống và kernel object hierarchy (topology) qua kobject của chúng. Mỗi kobject xuất hiện như directory. File trong directory biểu diễn kernel variable do kobject liên quan export. Những file này gọi là attribute, có thể đọc hoặc ghi.

Nếu kobject đã đăng ký tạo directory trong sysfs, vị trí tạo directory phụ thuộc parent của kobject này (cũng là kobject, thể hiện internal object hierarchy). Trong sysfs, top-level directory biểu diễn tổ tiên chung của object hierarchy hoặc subsystem mà object thuộc về.

Có thể tìm top-level sysfs directory trong directory `/sys/` như sau:

```
/sys$ tree -L 1
├── block
├── bus
├── class
├── dev
├── devices
├── firmware
├── fs
├── hypervisor
├── kernel
├── module
└── power
```

`block` chứa một directory cho mỗi block device trên hệ thống. Mỗi directory chứa subdirectory cho partition trên device. `bus` chứa bus đã đăng ký trên hệ thống. `dev` chứa device node đã đăng ký theo dạng thô (không hierarchy), mỗi cái là symbolic link tới device thực trong directory `/sys/devices`. Directory `devices` cung cấp góc nhìn thực về device topology trong hệ thống. `firmware` thể hiện cây low-level subsystem system-specific như ACPI, EFI và OF (device tree). `fs` liệt kê filesystem được dùng trên hệ thống. `kernel` chứa kernel configuration option và status information. Cuối cùng, `module` là danh sách module đã load và `power` là system power management control interface từ user space.

Mỗi directory này tương ứng kobject, một số được export thành kernel symbol. Chúng như sau:

- `kernel_kobj`, tương ứng `/sys/kernel`.

- `power_kobj`, tương ứng `/sys/power`.

- `firmware_kobj`, tương ứng `/sys/firmware`. Được export trong source file `drivers/base/firmware.c`.

- `hypervisor_kobj`, tương ứng `/sys/hypervisor`. Được export trong source file `drivers/base/hypervisor.c`.

- `fs_kobj`, tương ứng `/sys/fs`. Được export trong source file `fs/namespace.c`.

Với phần còn lại, `class/`, `dev/` và `devices/` được tạo lúc boot bởi function `devices_init()` trong `drivers/base/core.c` trong kernel source, `block/` được tạo trong `block/genhd.c`, còn `bus/` được tạo dưới dạng `kset` trong `drivers/base/bus.c`.

## Tạo attribute device-, driver-, bus- và class-related

Đến đây, chúng ta học tạo kobject chuyên dụng để chứa attribute. Tuy nhiên, device framework, driver framework, bus framework và class framework cung cấp attribute abstraction và file creation, trong đó attribute tạo ra gắn trực tiếp với framework tương ứng trong kobject directory thích hợp. Để làm vậy, mỗi framework cung cấp framework-specific attribute data structure chứa default attribute và cho phép cung cấp show/store callback tùy chỉnh. Đó lần lượt là `struct` `device_attribute`, `struct driver_attribute`, `struct bus_atttribute` và `struct class_attribute` cho device framework, driver framework, bus framework và class framework. Chúng được định nghĩa như `kboj_attribute` nhưng dùng tên khác. Hãy xem data structure tương ứng:

- Device có attribute data structure sau:

```
struct driver_attribute {
    struct attribute attr;
    ssize_t (*show)(struct device_driver *driver,
                char *buf);
    ssize_t (*store)(struct device_driver *driver,
                const char *buf, size_t count);
};
```

- Class có attribute data structure sau:

```
struct class_attribute {
    struct attribute attr;
    ssize_t (*show)(struct class *class,
             struct class_attribute *attr, char *buf);
    ssize_t (*store)(struct class *class,
             struct class_attribute *attr,
             const char *buf, size_t count);
};
```

- Bus framework có attribute data structure sau:

```
struct bus_attribute {
    struct attribute  attr;
    ssize_t (*show)(struct bus_type *bus, char *buf);
    ssize_t (*store)(struct bus_type *bus,
                 const char *buf, size_t count);
};
```

- Device có attribute data structure sau:

```
struct device_attribute {
    struct attribute  attr;
    ssize_t (*show)(struct device *dev,
                 struct device_attribute *attr,
                 char *buf);
    ssize_t (*store)(struct device *dev,
                       struct device_attribute *attr,
                       const char *buf, size_t count);
};
```

Function `show` của device-specific data structure trên nhận thêm parameter `count`, còn những structure khác thì không.

Có thể cấp phát động bằng `kzalloc()` và khởi tạo bằng cách đặt field của inner attribute element, cung cấp callback function thích hợp. Tuy nhiên, mỗi framework cung cấp tập macro để cấp phát tĩnh, khởi tạo và gán một instance attribute data structure tương ứng. Hãy xem macro:

- Bus infrastructure cung cấp macro sau:

```
BUS_ATTR_RW(_name)
BUS_ATTR_RO(_name)
BUS_ATTR_WO(_name)
```

Với bus framework-specific macro này, bus attribute variable kết quả có tên `bus_attr_<_name>`. Ví dụ, variable name sinh từ `BUS_ATTR_RW(foo)` là `bus_attr_foo`, có type `struct bus_attribute`.

- Với driver, macro sau được cung cấp:

```
DRIVER_ATTR_RW(_name)
DRIVER_ATTR_RO(_name)
DRIVER_ATTR_WO(_name)
```

driver-specific attribute definition macro này đặt tên biến kết quả theo mẫu `driver_attr_<_name>`. Vì thế, biến sinh từ `DRIVER_ATTR_RW(foo)` có type `struct driver_attribute` và tên `driver_attr_foo`.

- Class framework làm việc với macro sau:

```
CLASS_ATTR_RW(_name)
CLASS_ATTR_RO(_name)
CLASS_ATTR_WO(_name)
```

Dùng class-specific macro này, biến kết quả có type `struct class_atribute` và được đặt tên theo mẫu `class_attr_<_name>`. Vì vậy, variable name sinh từ `CLASS_ATTR_RW(foo)` là `class_attr_foo`.

- Cuối cùng, device-specific attribute có thể được cấp phát tĩnh và khởi tạo bằng macro sau:

```
DEVICE_ATTR(_name, _mode, _show, _store)
DEVICE_ATTR_RW(_name)
DEVICE_ATTR_RO(_name)
DEVICE_ATTR_WO(_name)
```

Device-specific attribute definition macro dùng mẫu variable name riêng là `dev_attr_<_name>`. Vì vậy, ví dụ `DEVICE_ATTR_RO(foo)` tạo object `struct device_attribute` tên `dev_attr_foo`.

Vì mọi macro này xây trên `__ATTR_RW`, `__ATTR_RO` và `__ATTR_WO`, chúng cấp phát tĩnh và khởi tạo một instance framework-specific attribute data structure, giả định show/store function lần lượt tên `<attribute_name>_show` và `<attribute_name>_store` (nhớ rằng vì chúng không dựa trên macro `__ATTR`). Có ngoại lệ cho `DEVICE_ATTR()`, dùng show/store function đúng như truyền vào, không suffix hay prefix. Ngoại lệ này do `DEVICE_ATTR` dựa trên `__ATTR` để định nghĩa attribute.

Như đã thấy, mọi framework-specific macro dùng prefix định sẵn để đặt tên biến object framework-specific attribute kết quả. Hãy xem class attribute sau:

```
static CLASS_ATTR_RW(foo);
```

Điều này tạo static variable type `struct class_attribute` tên `class_attr_foo` và giả định show function, store function lần lượt tên `foo_show` và `foo_store`. Có thể tham chiếu trong group bằng inner attribute element, như sau:

```
static struct attribute *fake_class_attrs[] = {
    &class_attr_foo.attr,
    [...]
    NULL,
};
static struct attribute_group fake_attr_group = {
    .attrs = fake_class_attrs,
};
```

Điều quan trọng nhất khi tạo file tương ứng là driver có thể chọn API thích hợp từ danh sách sau:

```
int device_create_file(struct device *device,
            const struct device_attribute *entry);
int driver_create_file(struct device_driver *driver,
            const struct driver_attribute *attr);
int bus_create_file(struct bus_type *bus,
            struct bus_attribute *);
int class_create_file(struct class *class,
            const struct class_attribute *attr)
```

Ở đây, argument `device`, `driver`, `bus` và `class` là thực thể device, driver, bus và class tương ứng mà attribute phải được thêm vào. Ngoài ra, attribute được tạo trong directory tương ứng inner kobject của mỗi thực thể, như code sau:

```
int device_create_file(struct device *dev,
                   const struct device_attribute *attr)
{
    [...]
    error = sysfs_create_file(&dev->kobj, &attr->attr);
    [...]
}
int class_create_file(struct class *cls,
                    const struct class_attribute *attr)
{
    [...]
    error =
        sysfs_create_file(&cls->p->class_subsys.kobj,
                          &attr->attr);
    return error;
}
int bus_create_file(struct bus_type *bus,
                   struct bus_attribute *attr)
{
    [...]
    error =
        sysfs_create_file(&bus->p->subsys.kobj,
                           &attr->attr);
    [...]
}
```

Để một công đôi việc, code trên cũng cho thấy `device_create_file()`, `bus_create_file()`, `driver_create_file()` và `class_create_file()` đều gọi nội bộ tới

```
sysfs_create_file().
```

Khi dùng xong mỗi attribute object tương ứng, phải gọi removal method thích hợp. Code sau thể hiện các lựa chọn có thể:

```
void device_remove_file(struct device *device,
             const struct device_attribute *entry);
void driver_remove_file(struct device_driver *driver,
                const struct driver_attribute *attr);
void bus_remove_file(struct bus_type *,
                struct bus_attribute *);
void class_remove_file(struct class *class,
                       const struct class_attribute *attr);
```

Mỗi API này nhận cùng argument đã truyền khi tạo attribute.

Bây giờ đã biết cách inner show/store function của phần tử `kobj_atribute` được gọi, bạn cũng có thể dễ thấy cách framework-specific show/store function được gọi.

Hãy xem triển khai device. Device framework có `kobj_type` nội bộ triển khai device-specific show function và store function. Những function nhận inner attribute element làm một argument. Sau đó macro `container_of` lấy pointer tới data structure chứa bên ngoài (framework-specific attribute data structure), từ đó framework-specific show/store function được gọi.

Sau đây là đoạn trích từ `drivers/base/core.c`, thể hiện triển khai device-specific `sysfs_ops`:

```
static ssize_t dev_attr_show(struct kobject *kobj,
                            struct attribute *attr,
                            char *buf)
{
    struct device_attribute *dev_attr = to_dev_attr(attr);
    struct device *dev = kobj_to_dev(kobj);
    ssize_t ret = -EIO;
    if (dev_attr->show)
          ret = dev_attr->show(dev, dev_attr, buf);
    if (ret >= (ssize_t)PAGE_SIZE) {
        print_symbol("dev_attr_show:
                        %s returned bad count\n",
                    (unsigned long)dev_attr->show);
    }
    return ret;
}
static ssize_t dev_attr_store(struct kobject *kobj,
                      struct attribute *attr,
                      const char *buf, size_t count)
{
    struct device_attribute *dev_attr = to_dev_attr(attr);
    struct device *dev = kobj_to_dev(kobj);
    ssize_t ret = -EIO;
    if (dev_attr->store)
        ret = dev_attr->store(dev, dev_attr, buf, count);
    return ret;
}
static const struct sysfs_ops dev_sysfs_ops = {
    .show     = dev_attr_show,
    .store    = dev_attr_store,
};
```

Lưu ý trong code trên, `to_dev_attr()`, macro dùng `container_of`, được định nghĩa như sau:

```
#define to_dev_attr(_attr) \
       container_of(_attr, struct device_attribute, attr)
```

Nguyên tắc giống nhau cho attribute của bus (trong `drivers/base/bus.c`), driver (trong `drivers/base/bus.c`) và class (trong `drivers/base/class.c`).

## Làm sysfs attribute poll- và select-compatible

Dù đây không phải yêu cầu để làm việc với sysfs attribute, ý tưởng chính là cho phép dùng system call `poll()` hoặc `select()` trên attribute để chờ thay đổi thụ động. Thay đổi có thể là firmware trở nên sẵn có, alarm notification hoặc thông tin attribute value đã thay đổi. Trong khi người dùng sleep trên file để chờ thay đổi, driver phải gọi `sysfs_notify()` để đánh thức mọi người dùng đang sleep.

Notification API định nghĩa như sau:

```
void sysfs_notify(struct kobject *kobj, const char *dir,
                  const char *attr)
```

Nếu parameter `dir` không là `NULL`, nó dùng để tìm subdirectory trong directory của `kobj`, chứa attribute (có lẽ tạo bằng `sysfs_create_group`). Lời gọi khiến mọi polling process thức dậy và xử lý event (có thể đọc giá trị mới, xử lý alarm, v.v.).

LƯU Ý Không có notification nếu không gọi function này; vì vậy mọi polling process cuối cùng chờ vô hạn (trừ khi chỉ định timeout trong system call).

Code sau, thể hiện function `store()` của attribute, được cung cấp cùng sách:

```
static ssize_t store(struct kobject *kobj,
                     struct attribute *attr,
                     const char *buf, size_t len)
{
    struct d_attr *da = container_of(attr, struct d_attr,
                                      attr);
    sscanf(buf, "%d", &da->value);
    pr_info("sysfs_foo store %s = %d\n",
             a->attr.name, a->value);
    if (strcmp(a->attr.name, "foo") == 0){
        foo.value = a->value;
        sysfs_notify(mykobj, NULL, "foo");
    }
    else if(strcmp(a->attr.name, "bar") == 0){
        bar.value = a->value;
        sysfs_notify(mykobj, NULL, "bar");
    }
    return sizeof(int);
}
```

Trong code trên, gọi `sysfs_notify()` sau khi giá trị được cập nhật là hợp lý để user code đọc giá trị chính xác.

User code có thể trực tiếp truyền attribute file đã mở cho `poll()` hoặc `select()` mà không cần đọc nội dung ban đầu của attribute. Làm vậy tùy sự thuận tiện của developer. Tuy nhiên, lưu ý khi được thông báo, `poll()` return `POLLERR|POLLPRI` (là flag mà người dùng phải yêu cầu khi gọi `poll()`), còn `select()` return file descriptor dù đang chờ read event, write event hay exception event.

## Tổng kết

Hoàn tất chương này, bạn đã quen LDM, data structure của nó (bus, class, device và driver), cùng low-level data structure là `kobject`, `kset`, `kobj_type` và `attributes` (hoặc group của chúng). Giờ bạn biết cách object được biểu diễn trong kernel (device topology) và có thể tạo attribute (hoặc group) cung cấp tính năng, property của device hoặc driver qua sysfs.

Trong chương tiếp theo, chúng ta đề cập IIO (Industrial I/O) framework, sử dụng nhiều sức mạnh của sysfs.
