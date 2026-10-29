# Phụ lục B: Bảo vệ bí mật qua các giai đoạn boot

Trong phần “Chain-of-Trust” ở Chương [2](ch02_what_secure_boot_is_and_what_it_is_not.vi.md), chúng ta đã thấy Chain-of-Trust hoạt động thế nào, tức là mỗi giai đoạn chịu trách nhiệm xác minh giai đoạn kế tiếp trước khi thực thi nó ra sao. Trong hoạt động bình thường, mọi giai đoạn nên độc lập với nhau. Tức là, những gì một giai đoạn làm trong quá trình thực thi của nó không nên phụ thuộc vào giai đoạn trước, để bảo đảm chuỗi không bị phá vỡ, chẳng hạn do việc trao đổi thông tin quan trọng giữa các giai đoạn. Tuy nhiên, đạt được chế độ hoạt động này thực sự rất khó, đặc biệt là giữa bootloader và giai đoạn kernel, hoặc giữa kernel và giai đoạn user space ban đầu tiếp theo (initramfs).

Thực tế, việc bootloader truyền một số thiết lập cho kernel hoặc, thông qua kernel, cho các ứng dụng user-space là rất phổ biến; những ví dụ thực tế cho điều chúng tôi đang nói chính là các bản triển khai thực tế mà chúng tôi đã trình bày trong các chương trước của cuốn sách này, nơi chúng tôi đã giới thiệu Rescue schema và A/B schema (xem các phần “Rescue Schema” và “A/B Schema” trong Chương [3](ch03_real_implementations.vi.md)). Trong ví dụ của chúng ta, bootloader chịu trách nhiệm thông báo cho kernel booting schema hiện tại là gì và liệu kernel có phải thực thi một lần factory reset hay một lần system update hay không!

Đối với một developer là chuyên gia bảo mật, việc trao đổi dữ liệu này có thể bị coi là một rủi ro bảo mật có thể làm tổn hại Chain-of-Trust. Thực tế, U-Boot giữ environment của nó trong một số thiết bị lưu trữ non-volatile, chẳng hạn một block của eMMC, một phân vùng của thiết bị flash, hoặc trong EEPROM, v.v. Thông thường, environment không được mã hóa cũng không được ký, nên kẻ tấn công có thể thay đổi nó để giành quyền truy cập vào initramfs rồi thực thi code độc hại hoặc đọc các bí mật!

> Bạn đọc nên lưu ý rằng mặc dù đây không phải là việc dễ dàng (vì kẻ tấn công phải giành được quyền root thông qua một ứng dụng mạng đã bị xâm phạm hoặc bằng cách truy cập vật lý vào serial console hay vào toàn bộ hệ thống nói chung), về mặt lý thuyết nó vẫn khả thi. Vì vậy, chúng ta phải cân nhắc khả năng này và cố gắng tìm ra các cách khắc phục hiệu quả.

Ví dụ, nếu chúng ta giả sử kẻ tấn công đã giành được quyền root qua mạng, họ có thể đọc environment của U-Boot bằng lệnh `fw_printenv`, như dưới đây:

```
$ fw_printenv
ab_selector=b
arch=arm
baudrate=115200
...
bootmode=normal
bootname=boot
bootpart=1
...
mmcboot=echo Booting from mmc ...; run mmcargs; setenv kernelargs ${kernelargs} initramfs_${bootmode} boot_schema=${schema} root_name=${rootname}; run optargs; bootm ${loadaddr}#conf-${board_sof}; echo ERROR: Cannot boot from fitimage;
mmcdev=2
optargs=setenv bootargs ${bootargs} ${kernelargs};
prepare_mcore=setenv mcore_clk clk-imx8mp.mcore_booted;
rootname=root
rootpart=2
...
```

Trong output trên, chúng ta có thể nhận ra một số tham số dùng để quản lý A/B booting schema và cách nội dung cuối cùng của `bootargs` được thiết lập. Biến bootargs chứa các tham số được kernel dùng trong quá trình boot, nên kẻ tấn công có thể chèn thiết lập này để ép kernel dừng việc thực thi `init` ở lần boot tiếp theo và đưa ra một dấu nhắc lệnh:

```
$ fw_setenv kernelargs 'rdinit=/bin/sh'
```

> Mọi người dùng/developer Linux đều nên biết rằng theo mặc định, kernel, ở cuối quá trình boot, cố gắng thực thi tiến trình user-space đầu tiên (PID 1), thường được lưu trong file `/sbin/init` của root filesystem. Trong dòng lệnh kernel Linux, chúng ta có thể thay đổi hành vi này bằng cả hai tham số tùy chọn `init=` và `rdinit=`, vốn được dùng để chỉ định chương trình mà kernel nên chạy làm tiến trình init. Khác biệt cơ bản giữa hai tùy chọn này nằm ở chỗ kernel tìm chương trình đó trong filesystem nào. Tham số thứ nhất cho kernel biết binary nào cần thực thi từ root filesystem thật (filesystem được chỉ định bởi `root=`). Nếu không được chỉ định, theo truyền thống kernel sẽ thử `/sbin/init`, `/etc/init`, `/bin/init`, và cuối cùng là `/bin/sh`.

> Chúng ta có thể thấy hành vi này trong file `init/main.c` trong source code của Linux:
>
> ```
> static int __ref kernel_init(void *unused)
> {
> ...
>        if (ramdisk_execute_command) {
>                 ret = run_init_process(ramdisk_execute_command);
>                 if (!ret)
>                         return 0;
>                 pr_err("Failed to execute %s (error %d)\n", ramdisk_execute_command, ret);
>         }
>
>         /*
>          * We try each of these until one succeeds.
>          *
>          * The Bourne shell can be used instead of init if we are
>          * trying to recover a really broken machine.
>          */
>         if (execute_command) {
>                 ret = run_init_process(execute_command);
>                 if (!ret)
>                         return 0;
>                 panic("Requested init %s failed (error %d).", execute_command, ret);
>         }
>
>         if (CONFIG_DEFAULT_INIT[0] != '\0') {
>                 ret = run_init_process(CONFIG_DEFAULT_INIT);
>                 if (ret)
>                         pr_err("Default init %s failed (error %d)\n",
>                                CONFIG_DEFAULT_INIT, ret);
>                 else
>                         return 0;
>         }
>
>         if (!try_to_run_init_process("/sbin/init") ||
>             !try_to_run_init_process("/etc/init") ||
>             !try_to_run_init_process("/bin/init") ||
>             !try_to_run_init_process("/bin/sh"))
>                 return 0;
>
>         panic("No working init found. Try passing init= option to kernel." "See Linux Documentation/admin-guide/init.rst for guidance.");
> }
> ```

> Tham số thứ hai (`rdinit`) cho kernel biết binary nào cần thực thi từ initramfs (hay *initrd*—cái tên có nghĩa là RAM Disk Init). Nếu chúng ta không chỉ định nó, kernel mặc định tìm `/init` trong initramfs. Thực tế, trong đoạn code trên, chúng ta có thể thấy kernel cố gắng thực thi bất cứ thứ gì có trong `ramdisk_execute_command`, biến này được thiết lập ở đầu file như sau
>
> ```
> static char *ramdisk_execute_command = "/init";
> ```

Bây giờ, ở lần boot tiếp theo, chúng ta nhận được trên serial console của hệ thống:

```
$ reboot
$          Stopping Session c1 of User root...
[  OK  ] Stopped target Graphical Interface.
...
[    3.717206] Freeing unused kernel memory: 43520K
[    3.721970] Run /bin/sh as init process
```

> Bạn đọc nên lưu ý rằng, để hoạt động được, thủ thuật trên phụ thuộc vào hai điều kiện:
>
> 1) Kẻ tấn công phải biết chính xác giá trị đúng cho `rdinit=`, nếu không hệ thống sẽ bị treo trong lần khởi động lại tiếp theo.
>
> 2) Trong trường hợp chúng ta dùng BusyBox ([https://busybox.net/](https://busybox.net/)) để tạo `initramfs` và đặc biệt là để triển khai tiến trình shell `/bin/sh`, chúng ta được an toàn. Thực tế, BusyBox được thiết kế để là một tiện ích nhỏ gọn, all-in-one, nhưng khi được khởi động với PID 1 bằng `rdinit=/bin/sh`, nó mong đợi một hành vi cụ thể từ hệ thống `init`. Nó cố gắng hành xử như một `init` thật, hoặc, nếu nó là một shell, nó cố gắng chạy một script khởi tạo.
>
>    > Cụ thể, điều kiện thứ hai thực sự đóng vai trò như một biện pháp bảo mật, và khi được dùng, kẻ tấn công sẽ nhận được lỗi như dưới đây:

```
...
[    3.649832] Run /bin/sh as init process
[    3.656073] Kernel panic - not syncing: Attempted to kill init! exitcode=0x00000200
/bin/sh: can't open 'initramfs_normal': No such file or directory
[    1.199403] Kernel panic - not syncing: Attempted to kill init! exitcode=0x00000200
...
```

Trong các phần tiếp theo, chúng tôi sẽ đề xuất một số giải pháp để giải quyết những vấn đề này (đặc biệt là khi thủ thuật `rdinit=/bin/sh` có tác dụng).

## B.1 Sửa dòng lệnh kernel

Bây giờ, hãy giả sử chúng ta có thể thay việc thực thi `init` bằng một shell; chúng tôi đã dùng một wrapper script tên là `sh.sh` như dưới đây:

```
#!/bin/sh

/bin/sh
```

Trong kịch bản này, kẻ tấn công sẽ dùng tham số tùy chọn `rdinit=/sh.sh` như đã trình bày ở trên, và họ có thể dễ dàng đánh cắp encryption key tĩnh của root filesystem chỉ bằng cách thực hiện lệnh sau khi dấu nhắc lệnh đã sẵn sàng:

```
[    3.155364] Run /sh.sh as init process
/bin/sh: can't access tty; job control turned off
~ # ls /etc/
...
rootfs.iv
rootfs.key
rootfs.sign.key
...
# cat /etc/rootfs.key
24ccd69079643e8335e2d8dbbf81cb54ad365b798c53993b3fc7fb73d8574209
```

> Lưu ý rằng nếu file `/etc/rootfs.key` là một file binary, kẻ tấn công có thể đọc nó đơn giản bằng cách thực thi lệnh sau:
>
> ```
> $ while IFS= read -r -n 1 char ; do \
>           printf "%02x" "'$char" ; \
>   done < /etc/rootfs.key
> 24ccd69079643e8335e2d8dbbf81cb54ad365b798c53993b3fc7fb73d8574209
> ```

Giải pháp đầu tiên và dễ nhất để giải quyết vấn đề trên (khi chúng ta không thể dùng BusyBox) là vô hiệu hóa hoàn toàn tham số tùy chọn kernel `rdinit=`. Tính năng này được quản lý trong file `init/main.c` trong source code của kernel, như dưới đây:

```
static int __init rdinit_setup(char *str)
{
        unsigned int i;

        ramdisk_execute_command = str;
        /* See "auto" comment in init_setup */
        for (i = 1; i < MAX_INIT_ARGS; i++)
                argv_init[i] = NULL;
        return 1;
}
__setup("rdinit=", rdinit_setup);
```

Chúng ta có thể đơn giản xóa đoạn code này hoặc sửa nó như dưới đây:

```
static int __init rdinit_setup(char *str)
{
        pr_warn("rdinit= option argument disabled!\n");

        return 1;
}
__setup("rdinit=", rdinit_setup);
```

> Dĩ nhiên, cách sửa tương tự cũng có thể được áp dụng cho tham số tùy chọn kernel `init=` nếu cần.

Một khi kernel đã được biên dịch lại và cài đặt, kẻ tấn công sẽ nhận được thứ gì đó như dưới đây:

```
...
[    0.000000] Kernel command line: console=ttymxc1,115200 device=/dev/mmcblk2 root=/dev/mmcblk2p4 rootwait rw rdinit=/bin/sh initramfs_normal boot_schema=a_b root_name=root_b
[    0.000000] rdinit= option argument disabled!
[    0.000000] Unknown kernel command line parameters "initramfs_normal device=/dev/mmcblk2 boot_schema=a_b root_name=root_b", will be passed to user space.
...
```

Và quá trình boot sẽ tiếp tục như thường lệ:

```
...
[    3.120893] Freeing unused kernel memory: 43520K
[    3.125603] Run /init as init process
init: factory_reset: subprocess 02-factory-reset.sh not enabled! Skipped
init: resize_partitions: subprocess 05-resize-partitions.sh not enabled! Skipped
init: system_update: subprocess 10-system-update.sh not enabled! Skipped
...
```

## B.2 Nhúng bí mật vào kernel

Ngay cả khi có thể dùng mọi giải pháp ở trên, chúng ta vẫn còn nghi ngại về khả năng kẻ tấn công có thể đọc các bí mật của chúng ta từ initramfs. Trong trường hợp các bí mật đó là encryption key, chúng ta có thể chuyển những thông tin đó vào trong kernel và bảo vệ chúng bằng kernel keyring, như đã thấy trong phần “Linux Key-Management Facility” ở Chương [1](ch01_linux_cryptography.vi.md).

Ví dụ, chúng ta có thể xóa encryption key tĩnh của root filesystem khỏi file `/etc/rootfs.key` và đặt nó trực tiếp vào trong kernel bằng một kernel module.

> Bạn đọc nên lưu ý rằng việc dùng một kernel module không được link tĩnh vào kernel là một lỗ hổng bảo mật lớn! Thực tế, bí mật được nhúng có thể dễ dàng bị trích xuất từ file `.ko` (xem bên dưới trong phần này).

> Kịch bản này được dùng như một ví dụ về cách chúng ta có thể nhúng một key vào code kernel; các ứng dụng thực tế nên tránh hoàn toàn việc dùng module!

> Cũng xin lưu ý rằng giải pháp được trình bày ở đây chỉ nhằm mục đích là một ví dụ giáo dục. Trong các ứng dụng industrial-grade và security-critical, encryption key không bao giờ nên được mã hóa cứng trực tiếp trong source code (trừ khi điều này đã được các developer cân nhắc kỹ lưỡng).

Code của kernel module khá dài (và có thể lấy tại [https://github.com/giometti/key-injector](https://github.com/giometti/key-injector)), nên trong cuốn sách này chúng tôi sẽ chia nó thành nhiều đoạn logic.

Đoạn đầu tiên là phần định nghĩa chính:

```
#define pr_fmt(fmt) "%s:%s: " fmt, KBUILD_MODNAME, __func__
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/key.h>
#include <linux/key-type.h>
#include <linux/err.h>

static const unsigned char key_payload[] = {
        0x24, 0xcc, 0xd6, 0x90, 0x79, 0x64, 0x3e, 0x83,
        0x35, 0xe2, 0xd8, 0xdb, 0xbf, 0x81, 0xcb, 0x54,
        0xad, 0x36, 0x5b, 0x79, 0x8c, 0x53, 0x99, 0x3b,
        0x3f, 0xc7, 0xfb, 0x73, 0xd8, 0x57, 0x42, 0x09
};
static const size_t key_len = sizeof(key_payload);

static struct key *keyring, *key;
static const char *keyring_description = "keyring-injector",
                  *key_description = "rootfskey:fitimage";
...
```

> Mặc dù lập trình kernel Linux không được đề cập trong cuốn sách này, bạn đọc biết lập trình C hẳn sẽ dễ dàng theo dõi những gì chúng tôi sắp giải thích trong phần này.

Trong mảng `key_payload`, chúng tôi đã đặt encryption key mà chúng ta muốn nhúng vào kernel, còn `keyring_description` và `key_description` được dùng để chứa, lần lượt, tên keyring và tên key dùng để định danh kernel key mới cùng keyring của nó.

Tiếp theo là hàm chính, `key_injector_init()`, được dùng để chèn dữ liệu `key_payload` vào keyring:

```
static int __init key_injector_init(void)
{
        key_ref_t key_ref;
        int ret;

        pr_info("allocate keyring %s\n", keyring_description);
        keyring = keyring_alloc(keyring_description,
                        GLOBAL_ROOT_UID, GLOBAL_ROOT_GID,
                        current_cred(),
                        (KEY_POS_ALL & ~KEY_POS_SETATTR) | \
                                             KEY_USR_ALL | KEY_USR_LINK,
                        KEY_ALLOC_NOT_IN_QUOTA, NULL, NULL);
        if (IS_ERR(keyring)) {
                ret = PTR_ERR(keyring);
                pr_err("error allocating keyring\n");
                goto error_keyring_alloc;
        }
        pr_info("keyring %s allocated with serial #%d\n",
                        keyring_description, keyring->serial);

        pr_info("insert logon key %s (%zu bytes)\n",
                        key_description, key_len);
        key_ref = key_create_or_update(make_key_ref(keyring, true), "logon", key_description,
                        (const char *) key_payload, key_len,
                        (KEY_POS_ALL & ~KEY_POS_SETATTR) | KEY_USR_ALL, KEY_ALLOC_NOT_IN_QUOTA);
        if (IS_ERR(key_ref)) {
                pr_err("error inserting key\n");
                ret = PTR_ERR(key_ref);
                goto error_key_create;
        }

        ret = key_link(keyring, key_ref_to_ptr(key_ref));
        if (ret < 0) {
                pr_err("can't link key to keyring\n");
                goto error_key_link;
        }

        key = key_ref_to_ptr(key_ref);
        pr_info("logon key %s inserted with serial #%d\n",
                        key_description, key->serial);

        return 0;

error_key_link:
        key_put(key);
error_key_create:
        key_put(keyring);

error_keyring_alloc:
        return ret;
}
```

Trước hết, hàm này cấp phát keyring nơi sẽ đặt key bằng hàm `keyring_alloc()`:

- Biến `keyring_description` là tên của keyring mới.
- Các define `GLOBAL_ROOT_UID`, `GLOBAL_ROOT_GID` đặt quyền sở hữu keyring cho người dùng root (với UID 0 và GID 0).
- Hàm `current_cred()` cung cấp security context của process/thread đang thực thi đoạn code này. Kernel dùng context này để xác minh rằng bên gọi có đủ các quyền cần thiết (ví dụ, capability `CAP_SYS_ADMIN`) để tạo một keyring root-owned.
- Ý nghĩa của các thiết lập quyền là
  - `KEY_POS_ALL & ~KEY_POS_SETATTR`: Cấp mọi quyền kernel ngoại trừ quyền thay đổi các thuộc tính của key (owner, group, hoặc permission)
  - `KEY_USR_ALL`: Cấp mọi quyền user (read, write, search, link) cho owner của keyring
  - `KEY_USR_LINK`: Cấp tường minh quyền link cho owner của keyring, cho phép gắn các key khác vào keyring này (cần thiết để có thể thực thi subcommand `keyctl link` trên keyring—xem bên dưới)
  - `KEY_ALLOC_NOT_IN_QUOTA`: Cấp phát keyring mà không tính nó vào key quota của người dùng.

Nếu mọi thứ hoạt động tốt (hay nói cách khác, không có lỗi nào phát sinh), hàm này dùng `key_create_or_update()` để tạo key và chèn nó vào keyring vừa được tạo:

- Hàm `make_key_ref(keyring, true)` cung cấp một key reference trỏ tới keyring vừa được tạo, làm context cho việc tạo/tìm kiếm.
- Chuỗi `logon` chỉ định loại key đang được tạo (xem phần “Logon key” trong Chương [1](ch01_linux_cryptography.vi.md)).
- `key_description` là tên của key.
- `key_payload` và `key_len` định nghĩa dữ liệu bí mật thực tế (payload) và độ dài của nó.

Một lần nữa, nếu mọi thứ hoạt động tốt, hàm sẽ trả về thành công, và key được chèn thành công!

Tuy nhiên, trước khi trả về, hàm gọi `key_link()` để link key vừa được tạo vào một keyring. Thực tế, một key có thể tồn tại toàn cục trong kernel, nhưng nó phải được link vào một keyring thì các tiến trình khác có quyền truy cập keyring đó mới có thể tìm thấy nó.

Sau đó module tiếp tục bằng việc định nghĩa hàm `key_injector_exit()`, được dùng khi module bị gỡ (unload):

```
static void __exit key_injector_exit(void)
{
        if (keyring && key) {
                key_invalidate(key);
                key_unlink(keyring, key);
                key_put(key);
                pr_info("key %s (#%d) removed\n",
                                key_description, key->serial);
        }
        if (keyring) {
                key_put(keyring);
                pr_info("keyring %s (#%d) removed\n",
                                keyring_description, keyring->serial);
        }

        pr_info("module unloaded\n");
}
```

Hàm này vô dụng trong một ví dụ thực tế vì, như đã giải thích ở trên, đoạn code này nên được link tĩnh vào trong một kernel đã mã hóa, nên hàm này thực tế không bao giờ được gọi.

Sau đó, phần cuối cùng (nhưng không kém phần quan trọng) là phần định nghĩa module:

```
module_init(key_injector_init);
module_exit(key_injector_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Rodolfo Giometti <giometti@enneenne.com>");
MODULE_DESCRIPTION("Inject a logon key into the kernel keyring");
```

Đây là cách kinh điển để định nghĩa một kernel module, trong đó chúng ta phải báo cho compiler biết đâu là các hàm init và exit của module.

> Như đã nói, cuốn sách này sẽ không đề cập đến lập trình kernel cũng như việc biên dịch kernel module. Bạn đọc được khuyến khích tìm trên Internet cách biên dịch và cài đặt module này trên hệ thống của mình.

Một khi kernel khởi động, key giờ có thể được truy cập như thường lệ qua công cụ `keyctl` và được sử dụng bằng công cụ `crypto-afalg` của chúng ta như đã giải thích trong phần “Linux Key-Management Facility” ở Chương [1](ch01_linux_cryptography.vi.md). Để định vị key, chúng ta có thể dùng các lệnh sau:

```
$ grep keyring-injector /proc/keys
18cfeb61 I------     1 perm 1f3f0000     0     0 keyring   keyring-injector: 1
$ keyctl show 0x18cfeb61
Keyring
 416279393 --alswrv      0     0  keyring: keyring-injector
 710245733 --alswrv      0     0   \_ logon: rootfskey:fitimage
```

> Kernel module có thể được nạp theo nhiều cách; tuy nhiên, chúng tôi đã dùng cách sau:
>
> ```
> $ insmod /usr/lib/modules/$(uname -r)/updates/key_injector.ko
> ```

> Một khi được nạp, kernel sẽ hiển thị thứ gì đó như dưới đây:
>
> ```
> [  191.415250] key_injector: loading out-of-tree module taints kernel.
> [  191.421833] key_injector:key_injector_init: allocate keyring keyring-injector
> [  191.429099] key_injector:key_injector_init: keyring keyring-injector allocated with serial #416279393
> [  191.438380] key_injector:key_injector_init: insert logon key rootfske y:fitimage (32 bytes)
> [  191.438421] key_injector:key_injector_init: logon key rootfskey:fitim age inserted with serial #710245733
> ```

Để chứng minh rằng key được chèn này giống với key chúng ta đã dùng cho A/B schema trong phần “A/B Schema” ở Chương [3](ch03_real_implementations.vi.md), chúng ta có thể bắt đầu bằng việc lưu ý rằng trong user keyring chúng ta có những thứ sau:

```
$ keyctl show @u
Keyring
 456807198 --alswrv      0 65534  keyring: _uid.0
 403996962 --alsw-v      0     0   \_ logon: rootfskey:fitimage
```

Vì vậy, chúng ta có thể truy cập cả hai key bằng cách link cả user keyring lẫn keyring `keyring-injector` vào session keyring như dưới đây:

```
$ keyctl link 0x18cfeb61 @s
$ keyctl link @u @s
$ keyctl show
Session Keyring
 685038700 --alswrv      0     0  keyring: _ses
 857531075 ----s-rv      0     0   \_ user: invocation_id
 456807198 --alswrv      0 65534   \_ keyring: _uid.0
 403996962 --alsw-v      0     0   |   \_ logon: rootfskey:fitimage
 416279393 --alswrv      0     0   \_ keyring: keyring-injector
 710245733 --alswrv      0     0       \_ logon: rootfskey:fitimage
```

Trong kịch bản này, cách tốt hơn để định danh đúng từng key là dùng serial number của nó, nên chúng ta có thể dùng lệnh tiếp theo để mã hóa một thông điệp bằng một key rồi giải mã nó bằng key còn lại:

```
$ echo 'Very secret message' | \
        crypto-afalg encrypt aes-256-cbc -S 403996962 \
                -V $(cat /etc/rootfs.iv) | \
        crypto-afalg decrypt aes-256-cbc -S 710245733 \
                -V $(cat /etc/rootfs.iv)
Very secret message
```

Tuyệt! Giờ đã chứng tỏ được rằng hai key có cùng payload.

Trong kịch bản này, chương trình `init` có thể tránh việc chuyển nội dung `/etc/rootfs.key` từ file vào key của kernel, như được trình bày trong phần “Thực hiện một lần boot bình thường” ở Chương [3](ch03_real_implementations.vi.md), và dùng trực tiếp key đã được chèn.

Trước khi kết thúc phần này, hãy xem kẻ tấn công có thể tìm ra encryption key như thế nào nếu họ có quyền truy cập file `.ko`. Bằng cách dùng một cross-toolchain, chúng ta có thể lấy danh sách các symbol từ file kernel object:

```
$ aarch64-linux-gnu-nm key_injector.ko
0000000000000000 T cleanup_module
0000000000000000 r __func__.0
0000000000000038 r __func__.1
0000000000000000 T init_module
0000000000000008 b key
                 U key_create_or_update
0000000000000000 t key_injector_exit
0000000000000000 t key_injector_init
                 U key_invalidate
                 U key_link
0000000000000018 r key_payload
                 U key_put
...
```

Symbol `key_payload` được đánh dấu bằng chữ `r` viết thường trong output trên. Điều này có nghĩa là `key_payload` là một biến nằm trong section `.rodata` (Read-Only Data) của kernel module. Section `.rodata` chứa dữ liệu hằng read-only đã được khởi tạo trong source code. Vì vậy, để đọc nội dung của nó, chúng ta phải dùng `objdump` với offset 0x18 của biến như đã thấy ở trên:

```
$ aarch64-linux-gnu-objdump -s -j .rodata key_injector.ko

key_injector.ko:     file format elf64-littleaarch64

Contents of section .rodata:
 0000 6b65795f 696e6a65 63746f72 5f696e69  key_injector_ini
 0010 74000000 00000000 24ccd690 79643e83  t.......$...yd>.
 0020 35e2d8db bf81cb54 ad365b79 8c53993b  5......T.6[y.S.;
 0030 3fc7fb73 d8574209 6b65795f 696e6a65  ?..s.WB.key_inje
 0040 63746f72 5f657869 7400               ctor_exit.
```

Và chúng ta có thể thấy rằng dữ liệu mong muốn là 32 byte tại offset `0x18`, tức là `24ccd690 79643e83 35e2d8db bf81cb54 ad365b79 8c53993b 3fc7fb73 d8574209`.
