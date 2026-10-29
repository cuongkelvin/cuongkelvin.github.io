# Chương 4: Viết Character Device Driver

Các hệ thống Unix-based cung cấp hardware cho user space thông qua các special file, tất cả đều được tạo trong thư mục `/dev` khi device được đăng ký với hệ thống. Chương trình muốn truy cập một device phải tìm device file tương ứng của nó trong `/dev` và thực hiện system call thích hợp trên file đó; system call sẽ được chuyển hướng tới driver của device bên dưới gắn với special file ấy. Dù operating system thực hiện việc chuyển hướng system call, những system call được hỗ trợ lại phụ thuộc loại device và cách triển khai driver.

Về loại device, xét từ góc độ hardware có rất nhiều loại, nhưng chúng được nhóm thành hai họ special device file trong `/dev` — block device và character device. Chúng khác nhau ở cách truy cập, tốc độ và cách truyền data giữa chúng với hệ thống. Thông thường, character device chậm và truyền data tới hoặc từ ứng dụng người dùng tuần tự từng byte (character này đến character khác — vì thế có tên như vậy). Những device này bao gồm serial port và input device (keyboard, mouse, touchpad, video device, v.v.). Ngược lại, block device nhanh vì được truy cập khá thường xuyên và truyền data theo block. Chúng chủ yếu là storage device (hard drive, CD-ROMs, solid-state drive, v.v.).

Trong chương này, chúng ta sẽ tập trung vào character device và driver của chúng, các API và data structure thường dùng. Chúng ta sẽ giới thiệu phần lớn các khái niệm của chúng và viết character device driver đầu tiên.

Chúng ta sẽ đề cập các chủ đề sau trong chương này:

- Khái niệm major và minor

- Giới thiệu data structure của character device

- Tạo device node

- Triển khai file operation

## Khái niệm major và minor

Linux luôn yêu cầu nhận diện device file bằng một identifier duy nhất, gồm hai phần: major và minor. Dù những loại file khác (link, directory và socket) có thể tồn tại trong `/dev`, character device file hoặc block device file có thể được nhận ra qua type của chúng, hiển thị bằng lệnh `ls -l`:

```
$ ls -la /dev
crw-------  1 root root    254,     0 août  22 20:28 gpiochip0
crw-------  1 root root    240,     0 août  22 20:28 hidraw0
[...]
brw-rw----  1 root disk    259,     0 août  22 20:28 nvme0n1
brw-rw----  1 root disk    259,     1 août  22 20:28 nvme0n1p1
brw-rw----  1 root disk    259,     2 août  22 20:28 nvme0n1p2
[...]
crw-rw----+ 1 root video    81,     0 août  22 20:28 video0
crw-rw----+ 1 root video    81,     1 août  22 20:28 video1
```

Trong đoạn trích trên, ở cột đầu tiên, `c` nhận diện character device file và `b` nhận diện block device file. Ở cột thứ năm và thứ sáu, chúng ta lần lượt thấy major number và minor number. Major number nhận diện loại device hoặc có thể được gắn với một driver. Minor number nhận diện device trong phạm vi driver hoặc các device cùng loại. Điều này giải thích vì sao một số device file có cùng major number trong output trên.

Bây giờ đã hoàn tất các khái niệm cơ bản về character device trong hệ thống Linux, chúng ta có thể bắt đầu khám phá kernel code, trước hết bằng việc giới thiệu các data structure chính.

## Giới thiệu data structure của character device

Character device driver là device driver cơ bản nhất trong kernel source. Character device được biểu diễn trong kernel bằng instance của `struct cdev`, khai báo trong `include/linux/cdev.h`:

```
struct cdev {
    struct kobject kobj;
    struct module *owner;
    const struct file_operations *ops;
    dev_t dev;
[...]
};
```

Đoạn trích trên chỉ liệt kê những thành phần chúng ta quan tâm. Sau đây là ý nghĩa của các thành phần này trong data structure:

- `kobj`: Đây là kernel object bên dưới của character device object này, dùng để thực thi Linux device model. Chúng ta sẽ bàn về nó trong Chương 14, Giới thiệu Linux Device Model.

- `owner`: Thành phần này nên được đặt bằng macro `THIS_MODULE`.

- `ops`: Đây là tập file operation gắn với character device này.

- `dev`: Đây là identifier của character device.

Sau khi giới thiệu data structure này, data structure tiếp theo hợp lý để thảo luận là structure cung cấp các file operation mà system call sẽ dựa vào. Vì vậy, hãy giới thiệu data structure cho phép tương tác giữa user space và kernel space thông qua character device.

## Giới thiệu device file operation

Thành phần `cdev->ops` trỏ tới các file operation mà một device hỗ trợ. Mỗi operation là đích đến của một system call cụ thể: khi chương trình trong user space gọi system call trên character device, system call này được chuyển hướng trong kernel tới file operation tương ứng trong `cdev->ops`. `struct file_operations` là data structure chứa các operation đó. Nó có dạng như sau:

```
struct file_operations {
   struct module *owner;
   loff_t (*llseek) (struct file *, loff_t, int);
   ssize_t (*read) (struct file *, char __user *,
                     size_t, loff_t *);
   ssize_t (*write) (struct file *, const char __user *,
                     size_t, loff_t *);
   unsigned int (*poll) (struct file *,
                         struct poll_table_struct *);
   int (*mmap) (struct file *, struct vm_area_struct *);
   int (*open) (struct inode *, struct file *);
   int (*flush) (struct file *, fl_owner_t id);
   long (*unlocked_ioctl) (struct file *, unsigned int,
                           unsigned long);
   int (*release) (struct inode *, struct file *);
   int (*fsync) (struct file *, loff_t, loff_t,
                 int datasync);
   int (*flock) (struct file *, int, struct file_lock *);
   [...]
};
```

Đoạn trích trên chỉ liệt kê các method quan trọng của structure, đặc biệt là những method phù hợp với nhu cầu của sách này. Code đầy đủ nằm trong `include/linux/fs.h` trong kernel source. Mỗi callback này là backend của một system call và không callback nào là bắt buộc. Sau đây là ý nghĩa của các thành phần trong structure:

- `struct module *owner`: Đây là field bắt buộc, nên trỏ tới module sở hữu structure này. Nó được dùng để thực hiện reference counting chính xác. Phần lớn trường hợp, nó được đặt là `THIS_MODULE`, một macro định nghĩa trong `<linux/module.h>`.

- `loff_t (*llseek) (struct file *, loff_t, int);`: Method này dùng để di chuyển vị trí cursor hiện tại trong file được truyền làm parameter đầu tiên. Khi di chuyển thành công, function phải return vị trí mới; nếu không, phải return giá trị âm. Nếu method này không được triển khai, mọi thao tác seek trên file này đều thành công bằng cách thay đổi position counter trong structure `file` (`file->f_pos`), ngoại trừ seek tương đối so với end-of-file, vốn sẽ thất bại.

- `ssize_t (*read) (struct file *, char *, size_t, loff_t *);`: Vai trò của function này là lấy data từ device. Vì return value có type "signed size", function phải return số byte (dương) đã đọc thành công, hoặc return error code âm thích hợp khi có lỗi. Nếu function không được triển khai, mọi system call `read()` trên device file đều thất bại, return `-EINVAL` ("argument không hợp lệ").

- `ssize_t (*write) (struct file *, const char *, size_t, loff_t *);`: Vai trò của function này là gửi data tới device. Giống function `read()`, nó phải return số dương, trong trường hợp này biểu diễn số byte đã ghi thành công, hoặc return error code âm thích hợp khi có lỗi. Tương tự, nếu driver không triển khai nó, việc gọi system call `write()` sẽ thất bại với `-EINVAL`.

- `int (*flush) (struct file *, fl_owner_t id);`: Operation này được gọi khi file structure đang được giải phóng. Giống `open`, `release` có thể là `NULL`.

- `unsigned int (*poll) (struct file *, struct poll_table_struct *);`: File operation này phải return bitmask mô tả trạng thái device. Nó là kernel backend cho cả system call `poll()` và `select()`, đều dùng để truy vấn device có thể ghi, có thể đọc hay đang ở trạng thái đặc biệt nào đó. Bất kỳ bên nào gọi method này sẽ block cho đến khi device vào trạng thái được yêu cầu. Nếu file operation này không được triển khai, device luôn được coi là có thể đọc, có thể ghi và không ở trạng thái đặc biệt nào.

- `int (*mmap) (struct file *, struct vm_area_struct *);`: Operation này dùng để yêu cầu map một phần hoặc toàn bộ device memory vào address space của process. Nếu file operation này không được triển khai, mọi lần gọi system call `mmap()` trên device file đều thất bại, return `-ENODEV`.

- `int (*open) (struct inode *, struct file *);` File operation này là backend của system call `open()`; nếu nó không được triển khai (nếu là `NULL`), mọi lần mở device đều thành công và driver không được thông báo về operation đó.

- `int (*release) (struct inode *, struct file *);`: Operation này được gọi khi file đang được giải phóng, để đáp ứng system call `close()`. Giống `open`, `release` không bắt buộc và có thể là `NULL`.

- `int (*fsync) (struct file *, loff_t, loff_t, int datasync);`: Operation này là backend của system call `fsync()`, có mục đích flush mọi data đang pending. Nếu nó không được triển khai, mọi lần gọi `fsync()` trên device file đều thất bại, return `-EINVAL`.

- `long (*unlocked_ioctl) (struct file *, unsigned int, unsigned long);`: Đây là backend của system call `ioctl`, có mục đích mở rộng các command có thể gửi tới device (chẳng hạn format một track của floppy disk, vốn không phải đọc cũng không phải ghi). Các command do function này định nghĩa sẽ mở rộng tập command định sẵn mà kernel đã nhận biết mà không cần tham khảo file operation này. Vì thế, với bất kỳ command nào không được định nghĩa (do function này không được triển khai hoặc không hỗ trợ command được chỉ định), system call sẽ return `-ENOTTY`, nghĩa là "Không có ioctl như vậy cho device". Mọi giá trị non-negative do function này return đều được chuyển lại cho chương trình gọi để báo hoàn tất thành công.

Bây giờ đã quen với các file operation callback, hãy tìm hiểu bên trong kernel và cách file được xử lý để hiểu rõ hơn các cơ chế phía sau character device.

## Biểu diễn file trong kernel

Nhìn vào file operation table, ít nhất một parameter của mỗi operation có type `struct inode` hoặc `struct file`. `struct inode` đề cập tới file trên disk. Tuy nhiên, để đề cập tới file đang mở (gắn với file descriptor trong một process), structure `struct file` được sử dụng.

Sau đây là khai báo của structure `inode`:

```
struct inode {
    [...]
    union {
        struct pipe_inode_info  *i_pipe;
        struct cdev    *i_cdev;
        char           *i_link;
        unsigned       i_dir_seq;
    };
    [...]
}
```

Field quan trọng nhất trong structure là `union`, đặc biệt là thành phần `i_cdev`, được thiết lập khi file bên dưới là character device. Điều này cho phép chuyển qua lại giữa `struct inode` và `struct cdev`.

Mặt khác, `struct file` là filesystem data structure chứa thông tin về file (type của nó: character, block, pipe, v.v.), phần lớn chỉ liên quan đến OS. Structure `struct file` (được định nghĩa trong `include/linux/fs.h`) có định nghĩa như sau:

```
struct file {
[...]
   struct path f_path;
   struct inode *f_inode;
   const struct file_operations *f_op;
   loff_t f_pos;
   void *private_data;
[...]
}
```

Trong data structure trên, `f_path` biểu diễn path thực tế của file trong filesystem, còn `f_inode` là `inode` bên dưới trỏ tới file đang mở này. Điều này cho phép chuyển qua lại giữa `struct file` và `cdev` bên dưới thông qua thành phần `f_inode`. `f_op` biểu diễn file operation table. Vì `struct file` biểu diễn file descriptor đang mở, nó theo dõi vị trí đọc/ghi hiện tại trong instance đang mở. Việc này được thực hiện qua thành phần `f_pos`, và `f_pos` là vị trí đọc/ghi hiện tại.

## Tạo device node

Việc tạo device node giúp nó hiển thị với người dùng và cho phép người dùng tương tác với device bên dưới. Linux yêu cầu các bước trung gian trước khi device node được tạo, và phần sau sẽ thảo luận những bước này.

## Nhận diện device

Để nhận diện chính xác device, identifier của chúng phải duy nhất. Dù identifier có thể được cấp phát động, phần lớn driver vẫn dùng identifier tĩnh vì lý do tương thích. Bất kể phương thức cấp phát, Linux kernel lưu file device number trong các phần tử có type `dev_t`, là unsigned integer 32-bit trong đó major được biểu diễn bằng `12` bit đầu tiên và minor được mã hóa trên `20` bit còn lại.

Tất cả điều này được nêu trong `include/linux/kdev_t.h`, chứa một số macro, bao gồm những macro có thể return minor number hoặc major number khi nhận biến có type `dev_t`:

```
#define MINORBITS    20
#define MINORMASK    ((1U << MINORBITS) - 1)
#define MAJOR(dev)    ((unsigned int) ((dev) >> MINORBITS))
#define MINOR(dev)    ((unsigned int) ((dev) & MINORMASK))
#define MKDEV(ma,mi)  (((ma) << MINORBITS) | (mi))
```

Macro cuối cùng nhận minor number và major number rồi return identifier có type `dev_t`, được kernel dùng để lưu identifier. Đoạn trích trên cũng mô tả cách tạo identifier `character device` bằng bit shift. Tại đây, chúng ta có thể đi sâu vào code, sử dụng các API mà kernel cung cấp để cấp phát code.

## Đăng ký và hủy đăng ký character device number

Có hai cách xử lý device number — đăng ký (phương thức tĩnh) và cấp phát (phương thức động). Đăng ký, còn gọi là cấp phát tĩnh, chỉ hữu ích nếu bạn biết trước major number muốn bắt đầu, sau khi bảo đảm nó không xung đột với driver khác dùng cùng major (dù không phải lúc nào cũng dự đoán được điều này). Đăng ký là phương thức brute-force: bạn cho kernel biết device number mong muốn bằng cách cung cấp cặp major/minor bắt đầu và số lượng minor, rồi kernel cấp chúng cho bạn hoặc không (tùy tính sẵn có). Function dùng để đăng ký device number như sau:

```
int register_chrdev_region(dev_t first, unsigned int count,
                           char *name);
```

Method này return `0` khi thành công hoặc error code âm khi thất bại. Parameter `first` là identifier bạn phải tạo từ major number và minor đầu tiên của dải mong muốn. Có thể dùng macro `MKDEV(maj, min)` để làm việc đó. `count` là số lượng device minor liên tiếp cần có, còn `name` nên là tên của device hoặc driver tương ứng.

Tuy nhiên, lưu ý rằng `register_chrdev_region()` hoạt động tốt nếu bạn biết chính xác device number muốn có, và dĩ nhiên những number đó phải còn trống trên hệ thống đang chạy. Vì điều này có thể gây xung đột với device driver khác, nên ưu tiên cấp phát động, trong đó kernel sẵn sàng cấp phát major number cho bạn ngay khi cần. `alloc_chrdev_region()` là API phải dùng để cấp phát động. Sau đây là prototype của nó:

```
int alloc_chrdev_region(
                      dev_t *dev, unsigned int firstminor,
                      unsigned int count, char *name);
```

Method này return `0` khi thành công hoặc error code âm khi thất bại. `dev` là output parameter duy nhất. Nó biểu diễn number đầu tiên (được tạo từ major đã cấp phát và minor đầu tiên được yêu cầu) mà kernel đã gán. `firstminor` là minor đầu tiên trong dải minor number được yêu cầu, `count` là số lượng minor liên tiếp cần có, còn `name` nên là tên của device hoặc driver tương ứng.

Khác biệt giữa cấp phát tĩnh và cấp phát động là với cách đầu tiên, bạn phải biết trước device number cần dùng. Khi load driver trên máy khác, không có gì bảo đảm number đã chọn còn trống trên máy đó, và điều này có thể gây xung đột và rắc rối. Driver mới được khuyến khích dùng cấp phát động để lấy major device number thay vì chọn ngẫu nhiên một number đang trống, vốn có thể dẫn tới xung đột. Nói cách khác, driver của bạn nên dùng `alloc_chrdev_region()` thay vì `register_chrdev_region()`.

## Khởi tạo và đăng ký character device trên hệ thống

Việc đăng ký character device được thực hiện bằng cách chỉ định device identifier (type `dev_t`). Trong chương này, chúng ta sẽ dùng cấp phát động thông qua `alloc_chrdev_region()`. Sau khi identifier được cấp phát, bạn phải khởi tạo character device và thêm nó vào hệ thống lần lượt bằng `cdev_init()` và `cdev_add(),`. Sau đây là prototype của chúng:

```
void cdev_init(struct cdev *cdev,
               const struct file_operations *fops);
int cdev_add (struct cdev * p, dev_t dev, unsigned count);
```

Trong `cdev_init()`, `cdev` là structure cần khởi tạo và `fops` là instance `file_operations` cho device này, giúp nó sẵn sàng được thêm vào hệ thống. Trong `cdev_add()`, `p` là structure `cdev` cho device, `dev` là device number đầu tiên mà device này chịu trách nhiệm (được lấy động), và `count` là số lượng minor number liên tiếp tương ứng với device này. Khi thành công, `cdev_add()` return `0`; nếu không, nó return error code âm.

Operation ngược tương ứng của `cdev_add()` là `cdev_del()`, xóa character device khỏi hệ thống và có prototype như sau:

```
void cdev_del(struct cdev *);
```

Ở bước này, device là một phần của hệ thống nhưng chưa hiện diện về mặt vật lý. Nói cách khác, nó chưa hiển thị trong `/dev`. Để tạo node, bạn phải dùng `device_create()`, có prototype như sau:

```
struct device * device_create(struct class *class,
                              struct device *parent,
                              dev_t devt,
                              void *drvdata,
                              const char *fmt, ...)
```

Method này tạo device và đăng ký nó với Sysfs. Trong các argument, `class` là pointer tới `struct` `class` mà device này cần được đăng ký vào, `parent` là pointer tới parent `struct device` của device mới nếu có, `devt` là device number cho char device cần thêm, và `drvdata` là data cần thêm vào device cho các callback.

LƯU Ý QUAN TRỌNG

Trong trường hợp có nhiều minor, các API `device_create()` và `device_destroy()` có thể được đặt trong vòng lặp `for`, và string `<device name format>` có thể được nối thêm loop counter, như sau:

```
device_create(class, NULL, MKDEV(MAJOR(first_devt), MINOR(first_devt) + i), NULL,
"mynull%d", i);
```

Vì device cần class có sẵn trước khi được tạo, bạn phải tạo class hoặc dùng class đã có. Hiện tại, chúng ta sẽ tạo class; để làm việc đó, cần dùng function `class_create()`, được khai báo như sau:

```
struct class * class_create(struct module * owner,
                            const char * name);
```

Sau đó, class sẽ hiển thị trong `/sys/class`, và chúng ta có thể tạo device bằng class đó. Sau đây là ví dụ sơ lược:

```
#define EEP_NBANK 8
#define EEP_DEVICE_NAME "eep-mem"
#define EEP_CLASS "eep-class"
static struct class *eep_class;
static struct cdev eep_cdev[EEP_NBANK];
static dev_t dev_num;
static int __init my_init(void)
{
    int i;
    dev_t curr_dev;
    /* Request for a major and EEP_NBANK minors */
    alloc_chrdev_region(&dev_num, 0, EEP_NBANK,
                        EEP_DEVICE_NAME);
    /* create our device class, visible in /sys/class */
    eep_class = class_create(THIS_MODULE, EEP_CLASS);
    /* Each bank is represented as a character device (cdev) */
    for (i = 0; i < EEP_NBANK; i++) {
        /* bind file_operations to the cdev */
        cdev_init(&my_cdev[i], &eep_fops);
        eep_cdev[i].owner = THIS_MODULE;
        /* Device number to use to add cdev to the core */
        curr_dev = MKDEV(MAJOR(dev_num),
                          MINOR(dev_num) + i);
        /* Make the device live for the users to access */
        cdev_add(&eep_cdev[i], curr_dev, 1);
        /* create a node for each device */
        device_create(eep_class,
              NULL,     /* no parent device */
              curr_dev,
              NULL,     /* no additional data */
              EEP_DEVICE_NAME "%d", i); /* eep-mem[0-7] */
    }
    return 0;
}
```

Trong code trên, `device_create()` sẽ tạo node cho từng device — `/dev/eep-mem0`, `dev/eep-mem1`, v.v., với class của chúng ta được biểu diễn bằng `eep_class`. Ngoài ra, cũng có thể xem device trong `/sys/class/eep-class`. Trong khi đó, operation ngược như sau:

```
for (i = 0; i < EEP_NBANK; i++) {
    device_destroy(eep_class,
              MKDEV(MAJOR(dev_num), (MINOR(dev_num) +i)));
    cdev_del(&eep_cdev[i]);
}
class_unregister(eep_class);
class_destroy(eep_class);
unregister_chrdev_region(chardev_devt, EEP_NBANK);
```

Trong code trên, `device_destroy()` xóa device node khỏi `/dev`, `cdev_del()` khiến hệ thống quên character device này, `class_unregister()` và `class_destroy()` hủy đăng ký và xóa class khỏi hệ thống, và cuối cùng `unregister_chrdev_region()` giải phóng device number của chúng ta.

Bây giờ đã quen với mọi điều kiện tiên quyết về character device, chúng ta có thể bắt đầu triển khai file operation, cho phép người dùng tương tác với device bên dưới.

## Triển khai file operation

Sau khi giới thiệu file operation trong phần trước, đã đến lúc triển khai chúng để tăng khả năng của driver và cung cấp các method của device cho user space (dĩ nhiên thông qua system call). Mỗi method có đặc điểm riêng mà chúng ta sẽ làm rõ trong phần này.

## Trao đổi data giữa kernel space và user space

Như đã thấy khi giới thiệu file operation table, method `read` và `write` dùng để trao đổi data với device bên dưới. Cả hai đều là system call, nghĩa là data sẽ xuất phát từ hoặc có đích đến là user space. Khi xem prototype của method `read` và `write`, điểm đầu tiên gây chú ý là việc dùng `__user`. Đây là cookie được Sparse (semantic checker mà kernel dùng để tìm lỗi code có thể xảy ra) sử dụng để báo cho developer rằng họ sắp dùng không đúng cách một pointer không đáng tin cậy (hoặc pointer có thể không hợp lệ trong virtual address mapping hiện tại); họ không nên dereference nó mà thay vào đó dùng các kernel function chuyên dụng để truy cập memory mà pointer này trỏ tới.

Điều này dẫn chúng ta đến hai function chính cho phép trao đổi data giữa kernel và user space, `copy_from_user()` và `copy_to_user()`, lần lượt copy buffer từ user space sang kernel space và ngược lại:

```
unsigned long copy_from_user(void *to,
               const void __user *from, unsigned long n)
unsigned long copy_to_user(void __user *to,
               const void *from, unsigned long n)
```

Trong cả hai trường hợp, pointer có tiền tố `__user` trỏ tới memory (không đáng tin cậy) trong user space. `n` biểu diễn số byte cần copy tới hoặc từ user space. `from` biểu diễn địa chỉ nguồn và `to` là địa chỉ đích. Mỗi function return số byte không thể copy, nếu có; khi thành công, chúng return `0`. Lưu ý rằng những routine này có thể sleep vì chạy trong user context và không cần được gọi trong atomic context.

## Triển khai file operation open

File operation `open` là backend của system call open. Người ta thường dùng method này để khởi tạo device và data structure, sau đó nó nên return `0` khi thành công hoặc error code âm nếu có vấn đề. Prototype của file operation `open` được định nghĩa như sau:

```
int (*open) (struct inode *inode, struct file *filp);
```

Nếu nó không được triển khai, việc mở device luôn thành công nhưng driver không biết điều đó; đây không nhất thiết là vấn đề nếu device không cần khởi tạo đặc biệt.

### Data riêng cho Per-device

Như đã thấy trong prototype của file operation, gần như luôn có argument `struct file`. `struct` `file` có một thành phần có thể tùy ý sử dụng, đó là `private_data`. Nếu được thiết lập, `file->private_data` sẽ sẵn có cho các system call khác được gọi trên cùng file descriptor. Bạn có thể dùng field này trong suốt lifetime của file descriptor. Nên thiết lập field này trong method `open` vì đây luôn là system call đầu tiên trên mọi file.

Sau đây là data structure của chúng ta:

```
struct pcf2127 {
    struct cdev cdev;
    unsigned char *sram_data;
    struct i2c_client *client;
    int sram_size;
    [...]
};
```

Với data structure này, method `open` sẽ có dạng như sau:

```
static unsigned int sram_major = 0;
static struct class *sram_class = NULL;
static int sram_open(struct inode *inode,
                     struct file *filp)
{
    unsigned int maj = imajor(inode);
    unsigned int min = iminor(inode);
    struct pcf2127 *pcf = NULL;
    pcf = container_of(inode->i_cdev,
                        struct pcf2127, cdev);
    pcf->sram_size = SRAM_SIZE;
    if (maj != sram_major || min < 0 ){
        pr_err ("device not found\n");
        return -ENODEV; /* No such device */
    }
    /* prepare the buffer if the device is
     * opened for the first time
       */
    if (pcf->sram_data == NULL) {
        pcf->sram_data =
                  kzalloc(pcf->sram_size, GFP_KERNEL);
        if (pcf->sram_data == NULL) {
            pr_err("memory allocation failed\n");
            return -ENOMEM;
        }
    }
    filp->private_data = pcf;
    return 0;
}
```

Phần lớn trường hợp, operation `open` thực hiện một số khởi tạo và yêu cầu resource sẽ được dùng trong khi người dùng giữ một instance đang mở của device node. Mọi thứ thực hiện trong operation này phải được hoàn tác và giải phóng khi device được đóng, như sẽ thấy trong operation tiếp theo.

## Triển khai file operation release

Method `release` được gọi khi device được đóng, ngược với method `open`. Khi đó, bạn phải hoàn tác mọi thứ đã làm trong operation `open`. Cụ thể có thể là giải phóng mọi private memory đã cấp phát, shutdown device (nếu được hỗ trợ), và loại bỏ mọi buffer vào lần đóng cuối cùng (nếu device hỗ trợ multi-opening hoặc driver có thể xử lý nhiều device cùng lúc).

Sau đây là đoạn trích của function `release`:

```
static int sram_release(struct inode *inode,
                        struct file *filp)
{
    struct pcf2127 *pcf = NULL;
    pcf = container_of(inode->i_cdev,
                        struct pcf2127, cdev);
    mutex_lock(&device_list_lock);
    filp->private_data = NULL;
    /* last close? */
    pcf2127->users--;
    if (!pcf2127->users) {
        kfree(tx_buffer);
        kfree(rx_buffer);
        tx_buffer = NULL;
        rx_buffer = NULL;
        [...]
        if (any_other_dynamic_struct)
            kfree(any_other_dynamic_struct);
    }
    mutex_unlock(&device_list_lock);
    return 0;
}
```

Code trên giải phóng mọi resource đã lấy khi device node được mở. Đó chính là toàn bộ những việc cần làm trong file operation này. Nếu device node có hardware device bên dưới, operation này cũng có thể đưa device đó vào trạng thái thích hợp.

Tại đây, chúng ta đã có thể triển khai entry point (`open`) và exit point (`release)` cho character device. Giờ chỉ còn triển khai từng operation có thể thực hiện ở giữa.

## Triển khai file operation write

Method `write` dùng để gửi data tới device; mỗi khi người dùng gọi system call `write()` trên file của device, triển khai tương ứng trong kernel cuối cùng sẽ được gọi. Prototype của nó như sau:

```
ssize_t(*write)(struct file *filp, const char __user *buf,
                size_t count, loff_t *pos);
```

File operation này phải return số byte (size) đã ghi, và sau đây là định nghĩa các argument của nó:

- `*buf` biểu diễn data buffer đến từ user space.

- `count` là size của lần truyền được yêu cầu.

- `*pos` chỉ vị trí bắt đầu cần ghi data trong file (hoặc trong memory region tương ứng nếu character device file memory-backed).

Thông thường, trong file operation này, việc đầu tiên cần làm là kiểm tra yêu cầu sai hoặc không hợp lệ đến từ user space (ví dụ, kiểm tra giới hạn size trong trường hợp device memory-backed và kiểm tra size overflow). Sau đây là ví dụ:

```
/* if trying to Write beyond the end of the file,
* return error. "filesize" here corresponds to the size
* of the device memory (if any)
*/
if (*pos >= filesize) return –EINVAL;
```

Sau các kiểm tra, người ta thường thực hiện một số điều chỉnh, đặc biệt với `count,`, để không vượt quá file size. Bước này cũng không bắt buộc:

```
/* filesize corresponds to the size of device memory */
if (*pos + count > filesize)
    count = filesize - *pos;
```

Bước tiếp theo là tìm vị trí sẽ bắt đầu ghi. Bước này chỉ liên quan nếu device có physical memory bên dưới, nơi method `write()` được dự kiến lưu data đã cho:

```
/* convert pos into valid address */
void *from = pos_to_address(*pos);
```

Cuối cùng, bạn có thể copy data từ user space vào kernel memory, sau đó thực hiện operation `write` trên device bên dưới và điều chỉnh `*pos`, như đoạn trích sau:

```
if (copy_from_user(dev->buffer, buf, count) != 0){
    retval = -EFAULT;
    goto out;
}
/* now move data from dev->buffer to physical device */
write_error = device_write(dev->buffer, count);
if (write_error)
    return –EFAULT;
/* Increase the current position of the cursor in the file,
* according to the number of bytes written and finally,
* return the number of bytes copied
*/
*pos += count;
return count;
```

Sau đây là ví dụ về method `write`, tổng hợp các bước đã mô tả đến đây:

```
ssize_t
eeprom_write(struct file *filp, const char __user *buf,
             size_t count, loff_t *f_pos)
{
    struct eeprom_dev *eep = filp->private_data;
    int part_origin = PART_SIZE * eep->part_index;
    int register_address;
    ssize_t retval = 0;
    /* step (1) */
    if (*f_pos >= eep->part_size)
        /* Can't write beyond the end of a partition. */
        return -EINVAL;
    /* step (2) */
    if (*pos + count > eep->part_size)
        count = eep->part_size - *pos;
    /* step (3) */
    register_address = part_origin + *pos;
    /* step(4) */
    /* Copy data from user space to kernel space */
    if (copy_from_user(eep->data, buf, count) != 0)
        return -EFAULT;
    /* step (5) */
    /* perform the write to the device */
    if (write_to_device(register_address, buff, count)
        < 0){
        pr_err("i2c_transfer failed\n");
        return –EFAULT;
     }
    /* step (6) */
    *f_pos += count;
    return count;
}
```

Sau khi data được đọc và xử lý, có thể cần ghi lại output của quá trình xử lý. Vì đã bắt đầu bằng việc ghi, operation tiếp theo có thể nghĩ tới là `read`, như sẽ thấy trong phần sau.

## Triển khai file operation read

Method `read` có prototype như sau:

```
ssize_t (*read) (struct file *filp, char __user *buf,
                 size_t count, loff_t *pos);
```

Operation này là backend của system call `read()`. Các argument của nó được mô tả như sau:

- `*buf` là buffer chúng ta nhận từ user space.

- `count` là size của lần truyền được yêu cầu (size của user buffer).

- `*pos` chỉ vị trí bắt đầu cần đọc data trong file.

Nó phải return size của data đã đọc thành công. Tuy nhiên, size này có thể nhỏ hơn `count` (chẳng hạn khi đến cuối file trước khi đạt `count` mà người dùng yêu cầu).

Triển khai read operation tương tự write operation vì cần thực hiện một số sanity check. Trước tiên, có thể ngăn đọc vượt quá file size và return phản hồi end-of-file:

```
if (*pos >= filesize)
    return 0; /* 0 means EOF */
```

Sau đó, nên bảo đảm số byte đọc không vượt quá file size và có thể điều chỉnh `count` cho thích hợp:

```
if (*pos + count > filesize)
    count = filesize – (*pos);
```

Tiếp theo, bạn có thể tìm vị trí bắt đầu đọc, rồi copy data vào buffer trong user space và return lỗi nếu thất bại, sau đó tăng vị trí hiện tại của file theo số byte đã đọc và return số byte đã copy:

```
/* convert pos into valid address */
void *from = pos_to_address (*pos);
sent = copy_to_user(buf, from, count);
if (sent)
    return –EFAULT;
*pos += count;
return count;
```

Sau đây là ví dụ về file operation `read()` của driver, nhằm cung cấp cái nhìn tổng quan về những gì có thể thực hiện ở đây:

```
ssize_t  eep_read(struct file *filp, char __user *buf,
                  size_t count, loff_t *f_pos)
{
    struct eeprom_dev *eep = filp->private_data;
    if (*f_pos >= EEP_SIZE) /* EOF */
        return 0;
    if (*f_pos + count > EEP_SIZE)
        count = EEP_SIZE - *f_pos;
    /* Find location of next data bytes */
    int part_origin  =  PART_SIZE * eep->part_index;
    int eep_reg_addr_start  =  part_origin + *pos;
    /* perform the read from the device */
    if (read_from_device(eep_reg_addr_start, buff, count)
        < 0){
        pr_err("i2c_transfer failed\n");
        return –EFAULT;
    }
    /* copy from kernel to user space */
    if(copy_to_user(buf, dev->data, count) != 0)
        return -EIO;
    *f_pos += count;
    return count;
}
```

Dù đọc và ghi data làm di chuyển vị trí cursor, có một operation với mục đích chính là di chuyển vị trí cursor mà hoàn toàn không đụng tới data. Operation này giúp bắt đầu ghi hoặc đọc data từ bất kỳ đâu bằng cách di chuyển cursor tới vị trí mong muốn.

## Triển khai file operation llseek

File operation `llseek` là kernel backend cho system call `lseek()`, dùng để di chuyển vị trí cursor trong file. Prototype của nó như sau:

```
loff_t(*llseek) (struct file *filp, loff_t offset,
                 int whence);
```

Callback này phải return vị trí mới trong file. Sau đây là định nghĩa các parameter của nó:

- `loff_t` là offset tương đối so với vị trí file hiện tại, xác định vị trí đó sẽ thay đổi bao nhiêu.

- `whence` xác định nơi bắt đầu seek. Các giá trị có thể có như sau:

  - `SEEK_SET`: Đưa cursor tới vị trí tương đối so với đầu file

  - `SEEK_CUR`: Đưa cursor tới vị trí tương đối so với vị trí file hiện tại

  - `SEEK_END`: Điều chỉnh cursor tới vị trí tương đối so với cuối file

Khi triển khai operation này, nên dùng statement `switch` để kiểm tra từng trường hợp `whence` có thể có, vì số lượng của chúng hữu hạn, rồi điều chỉnh vị trí mới tương ứng:

```
switch( whence ){
    case SEEK_SET:/* relative from the beginning of file */
        newpos = offset; /* offset become the new position */
        break;
    case SEEK_CUR: /* relative to current file position */
        /* just add offset to the current position */
        newpos = file->f_pos + offset;
        break;
    case SEEK_END: /* relative to end of file */
        newpos = filesize + offset;
        break;
    default:
        return -EINVAL;
}
/* Check whether newpos is valid **/
if ( newpos < 0 )
    return –EINVAL;
/* Update f_pos with the new position */
filp->f_pos = newpos;
/* Return the new file-pointer position */
return newpos;
```

Sau đoạn trích kernel backend trên, sau đây là ví dụ chương trình người dùng lần lượt đọc và seek trong file. Driver bên dưới sau đó sẽ thực thi entry file operation `llseek()`:

```
#include <unistd.h>
#include <fcntl.h>
#include <sys/types.h>
#include <stdio.h>
#define CHAR_DEVICE "foo"
int main(int argc, char **argv)
{
    int fd = 0;
    char buf[20];
    if ((fd = open(CHAR_DEVICE, O_RDONLY)) < -1)
        return 1;
    /* Read 20 bytes */
    if (read(fd, buf, 20) != 20)
        return 1;
    printf("%s\n", buf);
    /* Move the cursor to ten time relative to
     * its actual position
     */
    if (lseek(fd, 10, SEEK_CUR) < 0)
        return 1;
    if (read(fd, buf, 20) != 20)
        return 1;
    printf("%s\n",buf);
    /* Move the cursor seven time, relative from
     * the beginning of the file
     */
    if (lseek(fd, 7, SEEK_SET) < 0)
        return 1;
    if (read(fd, buf, 20) != 20)
        return 1;
    printf("%s\n",buf);
    close(fd);
    return 0;
}
```

Code tạo ra output sau:

```
jma@jma:~/work/tutos/sources$ cat toto
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
ut labore et dolore magna aliqua.
jma@jma:~/work/tutos/sources$ ./seek
Lorem ipsum dolor si
nsectetur adipiscing
psum dolor sit amet,
jma@jma:~/work/tutos/sources$
```

Trong phần này, chúng ta đã giải thích khái niệm seeking bằng ví dụ, cho thấy cách relative seeking và absolute seeking hoạt động. Bây giờ đã hoàn tất các operation di chuyển data, có thể chuyển sang operation tiếp theo: phát hiện khả năng đọc hoặc ghi data trong character device.

## Method poll

Method `poll` là backend của cả system call `poll()` và `select()`. Các system call này dùng để phát hiện khả năng đọc/ghi trong file một cách thụ động (bằng cách sleep, không lãng phí CPU cycle). Để hỗ trợ chúng, driver phải triển khai `poll`, có prototype như sau:

```
unsigned int (*poll) (struct file *, struct poll_table_struct *);
```

Kernel function cốt lõi trong việc triển khai method này là `poll_wait()`, được định nghĩa trong `<linux/poll.h>`, header mà bạn phải include trong driver code. Nó có khai báo như sau:

```
void poll_wait(struct file * filp,
               wait_queue_head_t * wait_address, poll_table *p)
```

`poll_wait()` thêm device gắn với structure `struct file` (truyền làm parameter đầu tiên) vào danh sách những device có thể đánh thức các process (được đưa vào sleep trong structure `struct wait_queue_head_t` truyền làm parameter thứ hai), theo các event được đăng ký trong structure `struct poll_table` truyền làm parameter thứ ba. User process có thể gọi system call `poll()`, `select()` hoặc `epoll()` để thêm một tập file vào danh sách cần chờ, nhằm biết device tương ứng (nếu có) đã sẵn sàng hay chưa. Sau đó kernel gọi entry `poll` của driver gắn với từng device file. Method `poll` của mỗi driver khi đó nên gọi `poll_wait()` để đăng ký với kernel các event mà process cần được thông báo, đưa process đó vào sleep cho đến khi một trong những event này xảy ra, và đăng ký driver là một trong những bên có thể đánh thức process. Cách thông thường là dùng một wait queue cho mỗi loại event (một cho khả năng đọc, một cho khả năng ghi, và có thể một cho exception nếu cần), theo các event mà system call `select()` (hoặc `poll()`) hỗ trợ.

Return value của file operation (`*poll`) phải có `POLLIN | POLLRDNORM` được đặt nếu có data để đọc, `POLLOUT | POLLWRNORM` nếu device có thể ghi, và `0` nếu không có data mới và device chưa thể ghi. Trong ví dụ sau, chúng ta giả định device hỗ trợ cả blocking read và blocking write. Dĩ nhiên, bạn có thể chỉ triển khai một trong hai. Nếu driver không định nghĩa method này, device được coi là luôn có thể đọc và ghi, và system call `poll()` hoặc `select()` return ngay lập tức.

Triển khai poll operation có thể yêu cầu điều chỉnh read file operation hoặc write file operation sao cho khi ghi, reader được thông báo về khả năng đọc, và khi đọc, writer được thông báo về khả năng ghi:

```
#include <linux/poll.h>
/* declare a wait queue for each event type (read, write ...) */
static DECLARE_WAIT_QUEUE_HEAD(my_wq);
static DECLARE_WAIT_QUEUE_HEAD(my_rq);
static unsigned int eep_poll(struct file *file,
                             poll_table *wait)
{
    unsigned int reval_mask = 0;
    poll_wait(file, &my_wq, wait);
    poll_wait(file, &my_rq, wait);
    if (new_data_is_ready)
        reval_mask |= (POLLIN | POLLRDNORM);
    if (ready_to_be_written)
       reval_mask |= (POLLOUT | POLLWRNORM);
    return reval_mask;
}
```

Trong đoạn code trên, chúng ta đã triển khai operation `poll`, có thể đưa process vào sleep nếu device không thể ghi hoặc đọc. Tuy nhiên, chưa có cơ chế thông báo khi một trong các trạng thái ấy thay đổi. Vì vậy, operation `write` (hoặc operation bất kỳ làm data sẵn có, chẳng hạn IRQ) phải thông báo cho các process đang sleep trong readability wait queue; tương tự đối với operation `read` (hoặc operation bất kỳ làm device sẵn sàng để ghi), vốn phải thông báo cho các process đang sleep trong writability wait queue. Sau đây là ví dụ:

```
wake_up_interruptible(&my_rq); /* Ready to read */
/* set flag accordingly in case poll is called */
new_data_is_ready = true;
wake_up_interruptible(&my_wq); /* Ready to be written to */
ready_to_be_written = true;
```

Cụ thể hơn, bạn có thể thông báo readable event từ trong method `write()` của driver, nghĩa là data đã ghi có thể được đọc lại, hoặc từ trong IRQ handler, nghĩa là device bên ngoài đã data-send có thể được đọc lại. Mặt khác, bạn có thể thông báo writable event từ trong method `read()` của driver, nghĩa là buffer trống và có thể được nạp lại, hoặc từ trong IRQ handler, nghĩa là device đã hoàn tất operation gửi data và sẵn sàng nhận data lần nữa. Đừng quên đặt các flag trở lại `false` khi trạng thái thay đổi. Sau đây là đoạn code dùng `select()` trên một character device để phát hiện data sẵn có:

```
#include <unistd.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/select.h>
#define NUMBER_OF_BYTE 100
#define CHAR_DEVICE "/dev/packt_char"
char data[NUMBER_OF_BYTE];
int main(int argc, char **argv)
{
    int fd, retval;
    ssize_t read_count;
    fd_set readfds;
    fd = open(CHAR_DEVICE, O_RDONLY);
    if(fd < 0)
        /* Print a message and exit*/
        [...]
    while(1){
        FD_ZERO(&readfds);
        FD_SET(fd, &readfds);
       ret = select(fd + 1, &readfds, NULL, NULL, NULL);
        /* From here, the process is already notified */
        if (ret == -1) {
            fprintf(stderr, "select: an error ocurred");
            break;
        }

        /* we are interested in one file only */
        if (FD_ISSET(fd, &readfds)) {
            read_count = read(fd, data, NUMBER_OF_BYTE);
            if (read_count < 0)
                /* An error occurred. Handle this */
                [...]
            if (read_count != NUMBER_OF_BYTE)
                /* We have read less than needed bytes */
                [...] /* handle this */
            else
            /* Now we can process the data we have read */
            [...]
        }
    }
    close(fd);
    return EXIT_SUCCESS;
}
```

Trong code mẫu trên, chúng ta dùng `select()` không có timeout, theo cách chỉ được thông báo các event "read". Từ dòng đó, process được đưa vào sleep cho đến khi nhận thông báo về event mà nó đã đăng ký.

## Method ioctl

Một hệ thống Linux thông thường có khoảng 350 system call (syscall), nhưng chỉ một vài trong số đó gắn với file operation. Đôi khi, device cần triển khai command đặc thù mà system call không cung cấp, đặc biệt là các system call gắn với file. Trong trường hợp này, giải pháp là dùng input/output control (ioctl), một method cho phép mở rộng danh sách command gắn với device. Bạn có thể dùng nó để gửi command đặc biệt tới device (reset, shutdown, configure, v.v.). Nếu driver không định nghĩa method này, kernel sẽ return lỗi `-ENOTTY` cho mọi system call `ioctl()`. Sau đây là prototype của nó:

```
long ioctl(struct file *f, unsigned int cmd,
           unsigned long arg);
```

Trong prototype trên, `f` là pointer tới file descriptor biểu diễn một instance đang mở của device, `cmd` là ioctl command, còn `arg` là user parameter, có thể là địa chỉ của bất kỳ user memory nào mà driver có thể gọi `copy_to_user()` hoặc `copy_from_user()` trên đó. Nói ngắn gọn, và vì những lý do rõ ràng, IOCTL command cần được nhận diện bằng một number, nên là duy nhất trên hệ thống. Tính duy nhất của IOCTL number trên toàn hệ thống giúp tránh gửi đúng command tới nhầm device hoặc truyền sai argument cho đúng command (với IOCTL number trùng lặp). Linux cung cấp bốn helper macro để tạo IOCTL identifier, tùy việc có truyền data hay không và chiều truyền. Prototype tương ứng của chúng như sau:

```
_IO(MAGIC, SEQ_NO)
_IOR(MAGIC, SEQ_NO, TYPE)
_IOW(MAGIC, SEQ_NO, TYPE)
_IORW(MAGIC, SEQ_NO, TYPE)
```

Mô tả của chúng như sau:

- `_IO`: IOCTL command không cần truyền data.

- `_IOR`: Điều này nghĩa là chúng ta tạo IOCTL command number để truyền thông tin từ kernel tới user space (tức đọc data). Driver được phép return `sizeof(TYPE)` byte cho người dùng mà return value này không bị coi là lỗi.

- `_IOW`: Giống `_IOR`, nhưng lần này người dùng gửi data tới driver.

- `_IOWR`: IOCTL command cần cả write parameter lẫn read parameter.

Ý nghĩa của các parameter (theo thứ tự truyền vào) được mô tả ở đây:

- Một number mã hóa trên 8 bit (`0` đến `255`), gọi là magic number.

- Một sequence number hoặc command ID, cũng trên 8 bit.

- Một data type, nếu có, cho kernel biết size cần copy. Đây có thể là tên structure hoặc data type.

Điều này được ghi rõ trong `Documentation/ioctl/ioctl-decoding.txt` trong kernel source, còn các IOCTL command đã có được liệt kê trong `Documentation/ioctl/ioctl-number.txt`, nơi phù hợp để bắt đầu khi bạn cần tạo IOCTL command riêng.

### Tạo IOCTL number (command)

Nên tạo IOCTL number riêng trong một header file chuyên dụng, vì header này cũng phải sẵn có trong user space. Nói cách khác, bạn nên xử lý việc tạo bản sao (chẳng hạn bằng symbolic link) của IOCTL header file để có một bản trong kernel và một bản trong user space, có thể được include trong user app. Bây giờ hãy tạo một số IOCTL number trong ví dụ thực tế và gọi header này là `eep_ioctl.h`:

```
#ifndef PACKT_IOCTL_H
#define PACKT_IOCTL_H
/* We need to choose a magic number for our driver,
* and sequential numbers for each command:
*/
#define EEP_MAGIC 'E'
#define ERASE_SEQ_NO 0x01
#define RENAME_SEQ_NO 0x02
#define GET_FOO 0x03
#define GET_SIZE 0x04
/*
* Partition name must be 32 byte max
*/
#define MAX_PART_NAME 32
/*
* Now let's define our ioctl numbers:
*/
#define EEP_ERASE _IO(EEP_MAGIC, ERASE_SEQ_NO)
#define EEP_RENAME_PART _IOW(EEP_MAGIC, RENAME_SEQ_NO, \
                             unsigned long)
#define EEP_GET_FOO  _IOR(EEP_MAGIC, GET_FOO, \
                          struct my_struct *)
#define EEP_GET_SIZE _IOR(EEP_MAGIC, GET_SIZE, int *)
#endif
```

Sau khi định nghĩa các command, cần include header trong code cuối cùng. Ngoài ra, vì tất cả đều duy nhất và có số lượng hữu hạn, nên dùng statement `switch ... case` để xử lý từng command và return error code `-ENOTTY` khi một command `ioctl` chưa định nghĩa được gọi. Sau đây là ví dụ:

```
#include "eep_ioctl.h"
static long eep_ioctl(struct file *f, unsigned int cmd,
                      unsigned long arg)
{
    int part;
    char *buf = NULL;
    int size = 2048;
    switch(cmd){
        case EEP_ERASE:
            erase_eepreom();
            break;
        case EEP_RENAME_PART:
            buf = kmalloc(MAX_PART_NAME, GFP_KERNEL);
            copy_from_user(buf, (char *)arg,
                            MAX_PART_NAME);
            rename_part(buf);
            break;
        case EEP_GET_SIZE:
            if (copy_to_user((int*)arg,
                           &size, sizeof(int)))
                return -EFAULT;
            break;
        default:
            return –ENOTTY;
    }
    return 0;
}
```

Cả kernel lẫn user space đều phải include các header file chứa IOCTL command. Vì vậy, trong dòng đầu tiên của đoạn trích trên, chúng ta đã include `eep_ioctl.h`, header file nơi các IOCTL command của chúng ta được định nghĩa.

Nếu bạn cho rằng IOCTL command sẽ cần nhiều hơn một argument, nên gom những argument đó vào một structure và chỉ truyền pointer tới structure cho `ioctl`.

Bây giờ, từ user space, bạn phải dùng cùng header `ioctl` như trong code của driver:

```
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include "eep_ioctl.h" /* our ioctl header file */
int main()
{
    int size = 0;
    int fd;
    char *new_name = "lorem_ipsum";
    fd = open("/dev/eep-mem1", O_RDWR);
    if (fd < 0){
        printf("Error while opening the eeprom\n");
        return 1;
    }
    /* ioctl to erase partition */
    ioctl(fd, EEP_ERASE);
    /* call to get partition size */
    ioctl(fd, EEP_GET_SIZE, &size);
    /* rename partition */
    ioctl(fd, EEP_RENAME_PART, new_name);
    close(fd);
    return 0;
}
```

Trong code trên, chúng ta đã minh họa cách dùng kernel IOCTL command từ user space. Như vậy, xuyên suốt phần này, chúng ta đã học cách triển khai callback `ioctl` của character device và cách trao đổi data giữa kernel với user space.

## Tổng kết

Trong chương này, chúng ta đã làm rõ character device và xem cách cho phép người dùng tương tác với driver thông qua device file. Chúng ta đã học cách cung cấp file operation cho user space và điều khiển hành vi của chúng từ bên trong kernel. Chúng ta đã đi xa đến mức bạn thậm chí có thể triển khai hỗ trợ multi-device.

Chương tiếp theo hardware-oriented hơn một chút, vì bàn về device tree, cơ chế cho phép khai báo với kernel các hardware device có trên hệ thống. Hẹn gặp bạn trong chương tiếp theo.
