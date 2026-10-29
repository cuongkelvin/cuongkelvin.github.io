# Chương 18: Quản lý bộ nhớ (Managing Memory)

Chương này đề cập các vấn đề liên quan đến quản lý bộ nhớ, một chủ đề quan trọng đối với mọi hệ thống Linux nhưng đặc biệt với embedded Linux, nơi bộ nhớ hệ thống thường có hạn. Sau khi ôn lại ngắn gọn về virtual memory, tôi sẽ chỉ cho bạn cách đo mức sử dụng bộ nhớ và cách phát hiện các vấn đề về cấp phát bộ nhớ, bao gồm memory leak, cũng như điều gì xảy ra khi bạn hết bộ nhớ. Bạn sẽ phải hiểu các công cụ có sẵn, từ các công cụ đơn giản như `free` và `top` đến các công cụ phức tạp như `mtrace` và Valgrind.

Chúng ta sẽ học sự khác biệt giữa bộ nhớ kernel- và user-space, và cách kernel ánh xạ các trang bộ nhớ vật lý vào không gian địa chỉ của một process. Sau đó chúng ta sẽ tìm và đọc các memory map của từng process dưới filesystem `proc`. Chúng ta sẽ thấy system call `mmap` có thể được dùng như thế nào để ánh xạ bộ nhớ của một chương trình vào một file, để nó có thể cấp phát bộ nhớ hàng loạt hoặc chia sẻ nó với một process khác. Ở nửa sau của chương này, chúng ta sẽ dùng `ps` để đo mức sử dụng bộ nhớ per-process trước khi chuyển sang các công cụ chính xác hơn như `smem` và `ps_mem`.

Trong chương này, chúng ta sẽ đề cập các chủ đề sau:

- Cơ bản về virtual memory

- Bố cục bộ nhớ Kernel-space

- Bố cục bộ nhớ User-space

- Memory map của process

- Quản lý bộ nhớ

- Swapping

- Ánh xạ bộ nhớ với `mmap`

- Ứng dụng của tôi dùng bao nhiêu bộ nhớ?

- Mức sử dụng bộ nhớ Per-process

- Xác định memory leak

- Hết bộ nhớ

## Yêu cầu kỹ thuật

Để làm theo các ví dụ, hãy bảo đảm bạn có một hệ thống host Linux-based đã cài đặt `gcc`, `make`, `top`, `procps`, `valgrind` và `smem`.

Tất cả các công cụ này đều có sẵn trên hầu hết các bản phân phối Linux phổ biến (như Ubuntu, Arch, v.v.).

Code dùng trong chương này có trong thư mục của chương trong GitHub repository của cuốn sách: `https://github.com/PacktPublishing/Mastering-Embedded-Linux-Development/tree/main/Chapter18`.

## Cơ bản về virtual memory

Tóm tắt lại, Linux cấu hình Memory Management Unit (MMU) của CPU để trình bày cho một chương trình đang chạy một không gian địa chỉ ảo bắt đầu từ không và kết thúc ở địa chỉ cao nhất, `0xffffffff`, trên một bộ xử lý 32-bit. Không gian địa chỉ này được chia thành các trang 4 KB theo mặc định. Nếu các trang 4 KB quá nhỏ cho ứng dụng của bạn, bạn có thể cấu hình kernel dùng HugePages, giảm lượng tài nguyên hệ thống cần để truy cập các page table entry và tăng tỷ lệ hit của Translation Lookaside Buffer (TLB).

Linux chia không gian địa chỉ ảo này thành một vùng cho các ứng dụng, gọi là user space, và một vùng cho kernel, gọi là kernel space. Ranh giới giữa hai vùng được đặt bởi một tham số cấu hình kernel tên `PAGE_OFFSET`. Trong một hệ thống nhúng 32-bit điển hình, `PAGE_OFFSET` là `0xc0000000`, dành 3 gigabyte thấp cho user space và gigabyte trên cùng cho kernel space. Không gian địa chỉ người dùng được cấp phát theo từng process để mỗi process chạy trong một sandbox, tách biệt với các process khác. Không gian địa chỉ kernel giống nhau cho mọi process, vì chỉ có một kernel.

Các trang trong không gian địa chỉ ảo này được ánh xạ tới địa chỉ vật lý bởi MMU, vốn dùng các page table để thực hiện ánh xạ.

Mỗi trang virtual memory có thể không được ánh xạ hoặc được ánh xạ như sau:

- Không được ánh xạ, vì vậy cố truy cập các địa chỉ này sẽ dẫn đến một `SIGSEGV`.

- Được ánh xạ tới một trang bộ nhớ vật lý riêng của process.

- Được ánh xạ tới một trang bộ nhớ vật lý được chia sẻ với các process khác.

- Được ánh xạ và chia sẻ với cờ copy-on-write (CoW) được đặt: một lần ghi bị bẫy trong kernel, kernel tạo một bản sao của trang và ánh xạ nó vào process thay cho trang gốc trước khi cho phép việc ghi diễn ra.

- Được ánh xạ tới một trang bộ nhớ vật lý được kernel sử dụng.

Ngoài ra kernel có thể ánh xạ các trang tới các vùng bộ nhớ dành riêng, ví dụ, để truy cập các thanh ghi và memory buffer trong device driver.

Một câu hỏi hiển nhiên là: tại sao chúng ta làm theo cách này thay vì đơn giản tham chiếu trực tiếp tới bộ nhớ vật lý, như một RTOS điển hình vẫn làm?

Virtual memory có rất nhiều ưu điểm, một số được mô tả ở đây:

- Các truy cập bộ nhớ không hợp lệ bị bẫy và các ứng dụng được cảnh báo bằng `SIGSEGV`.

- Các process chạy trong không gian bộ nhớ riêng, cô lập với các process khác.

- Sử dụng bộ nhớ hiệu quả thông qua việc chia sẻ code và dữ liệu chung, ví dụ, trong các thư viện.

- Khả năng tăng lượng bộ nhớ vật lý biểu kiến bằng cách thêm swap file, mặc dù swapping trên các target nhúng là hiếm.

Đây là những lập luận mạnh mẽ, nhưng tôi phải thừa nhận rằng cũng có một số nhược điểm. Rất khó xác định ngân sách bộ nhớ thực tế của một ứng dụng, đây là một trong những mối quan tâm chính của chương này. Chiến lược cấp phát mặc định là overcommit, dẫn đến các tình huống out-of-memory khó xử lý, điều mà tôi cũng sẽ thảo luận sau, trong phần Running out of memory. Cuối cùng, các độ trễ do code quản lý bộ nhớ gây ra khi xử lý các exception—page fault—khiến hệ thống kém tất định hơn, điều quan trọng đối với các chương trình real-time. Tôi sẽ đề cập điều này trong Chương 21.

Quản lý bộ nhớ khác nhau đối với kernel space và user space. Các phần sắp tới mô tả những khác biệt thiết yếu và những điều bạn cần biết.

## Bố cục bộ nhớ Kernel-space

Bộ nhớ kernel được quản lý theo cách đơn giản. Nó không demand-paged, nghĩa là với mỗi lần cấp phát bằng `kmalloc()` hoặc một hàm tương tự, đều có bộ nhớ vật lý thực. Bộ nhớ kernel không bao giờ bị loại bỏ hay bị page out.

Một số kiến trúc hiển thị bản tóm tắt ánh xạ bộ nhớ lúc boot trong các thông điệp kernel log. Trace này được lấy từ một thiết bị Arm 32-bit (một BeagleBone Black):

```
Memory: 511MB = 511MB total
Memory: 505980k/505980k available, 18308k reserved, 0K highmem
Virtual kernel memory layout:
    vector  : 0xffff0000 - 0xffff1000   ( 4 kB)
    fixmap  : 0xfff00000 - 0xfffe0000   ( 896 kB)
    vmalloc : 0xe0800000 - 0xff000000   ( 488 MB)
    lowmem  : 0xc0000000 - 0xe0000000   ( 512 MB)
    pkmap   : 0xbfe00000 - 0xc0000000   ( 2 MB)
    modules : 0xbf800000 - 0xbfe00000   ( 6 MB)
      .text : 0xc0008000 - 0xc0763c90   (7536 kB)
      .init : 0xc0764000 - 0xc079f700   ( 238 kB)
      .data : 0xc07a0000 - 0xc0827240   ( 541 kB)
      .bss  : 0xc0827240 - 0xc089e940   ( 478 kB)
```

Con số 505,980 KB khả dụng là lượng bộ nhớ trống mà kernel nhìn thấy khi bắt đầu thực thi nhưng trước khi bắt đầu thực hiện các cấp phát động.

Những thứ tiêu thụ bộ nhớ kernel-space bao gồm:

- Bản thân kernel, nói cách khác, code và dữ liệu được nạp từ file kernel image lúc boot. Điều này được thể hiện trong kernel log trên ở các segment `.text`, `.init`, `.data` và `.bss`. Segment `.init` được giải phóng khi kernel đã hoàn thành khởi tạo.

- Bộ nhớ được cấp phát qua slab allocator, được dùng cho các cấu trúc dữ liệu kernel thuộc nhiều loại khác nhau. Điều này bao gồm các cấp phát thực hiện bằng `kmalloc()`. Chúng đến từ vùng được đánh dấu lowmem.

- Bộ nhớ được cấp phát qua `vmalloc()`, thường cho các khối bộ nhớ lớn hơn những gì có thể cấp qua `kmalloc()`. Chúng nằm trong vùng vmalloc.

- Một ánh xạ để các device driver truy cập các thanh ghi và bộ nhớ thuộc nhiều phần cứng khác nhau, mà bạn có thể thấy bằng cách đọc `/proc/iomem`. Chúng cũng đến từ vùng vmalloc, nhưng vì chúng được ánh xạ tới bộ nhớ vật lý nằm ngoài bộ nhớ hệ thống chính, chúng không chiếm bộ nhớ thực nào.

- Các kernel module được nạp vào vùng được đánh dấu modules.

- Các cấp phát low-level khác không được theo dõi ở đâu khác.

Giờ chúng ta đã biết bố cục bộ nhớ trong kernel space, hãy tìm hiểu kernel đang dùng bao nhiêu bộ nhớ.

### Kernel dùng bao nhiêu bộ nhớ?

Thật không may, không có câu trả lời chính xác cho câu hỏi kernel dùng bao nhiêu bộ nhớ, nhưng những gì sau đây là gần nhất mà chúng ta có thể đạt được.

Thứ nhất, bạn có thể thấy bộ nhớ bị chiếm bởi code và dữ liệu kernel trong kernel log được trình bày trước đó, hoặc bạn có thể dùng lệnh `size`:

```
$ cd ~
$ cd build_arm64
$ aarch64-buildroot-linux-gnu-size vmlinux
   text     data    bss      dec  hex     filename
26412819 15636144 620032 42668995 28b13c3 vmlinux
```

Thông thường, lượng bộ nhớ mà kernel chiếm cho các segment code và dữ liệu tĩnh được trình bày ở đây là nhỏ so với tổng lượng bộ nhớ. Nếu không phải vậy, bạn cần xem lại cấu hình kernel và loại bỏ các thành phần mà bạn không cần. Một nỗ lực cho phép build các kernel nhỏ, được biết đến với tên Linux Kernel Tinification, đã tiến triển tốt cho đến khi project bị đình trệ, và các patch của Josh Triplett cuối cùng đã bị loại khỏi cây `linux-next` vào năm 2016. Giờ, lựa chọn tốt nhất của bạn để giảm kích thước in-memory của kernel là Execute-in-Place (XIP), nơi bạn đánh đổi RAM lấy flash (`https://lwn.net/Articles/748198/`).

Bạn có thể có thêm thông tin về mức sử dụng bộ nhớ bằng cách đọc `/proc/meminfo`:

```
# cat /proc/meminfo
MemTotal:        1996796 kB
MemFree:         1917020 kB
MemAvailable:    1894044 kB
Buffers:            2444 kB
Cached:            11976 kB
SwapCached:            0 kB
Active:             9440 kB
Inactive:           8964 kB
Active(anon):         92 kB
Inactive(anon):     4096 kB
Active(file):       9348 kB
Inactive(file):     4868 kB
Unevictable:           0 kB
Mlocked:               0 kB
SwapTotal:             0 kB
SwapFree:              0 kB
Dirty:                 8 kB
Writeback:             0 kB
AnonPages:          4008 kB
Mapped:             6864 kB
Shmem:               200 kB
KReclaimable:       7412 kB
Slab:              20924 kB
SReclaimable:       7412 kB
SUnreclaim:        13512 kB
KernelStack:        1552 kB
PageTables:          540 kB
SecPageTables:         0 kB
NFS_Unstable:          0 kB
Bounce:                0 kB
WritebackTmp:          0 kB
CommitLimit:      998396 kB
Committed_AS:       7396 kB
VmallocTotal:   135288315904 kB
VmallocUsed:        4072 kB
VmallocChunk:          0 kB
<…>
```

Có mô tả cho từng trường này trên manual page `proc(5)`. Mức sử dụng bộ nhớ của kernel là tổng của các thành phần sau:

- `Slab`: tổng bộ nhớ được cấp phát bởi slab allocator

- `KernelStack`: không gian stack được dùng khi thực thi code kernel

- `PageTables`: bộ nhớ được dùng để lưu các page table

- `VmallocUsed`: bộ nhớ được cấp phát bởi `vmalloc()`

Trong trường hợp cấp phát slab, bạn có thể có thêm thông tin bằng cách đọc `/proc/slabinfo`. Tương tự, có một bảng phân tích các cấp phát trong `/proc/vmallocinfo` cho vùng vmalloc. Trong cả hai trường hợp, bạn cần kiến thức chi tiết về kernel và các subsystem của nó để thấy chính xác subsystem nào đang thực hiện các cấp phát và tại sao, điều nằm ngoài phạm vi của phần thảo luận này.

Với các module, bạn có thể dùng `lsmod` để tìm không gian bộ nhớ bị chiếm bởi code và dữ liệu:

```
# lsmod
Module          Size  Used by
g_multi        47670  2
libcomposite   14299  1 g_multi
mt7601Usta    601404  0
```

Còn lại các cấp phát low-level, vốn không có bản ghi nào, và điều đó ngăn chúng ta tạo ra một bản kê chính xác về mức sử dụng bộ nhớ kernel-space. Điều này sẽ xuất hiện dưới dạng bộ nhớ bị thiếu khi chúng ta cộng tất cả các cấp phát kernel- và user-space mà chúng ta biết.

Đo mức sử dụng bộ nhớ kernel-space rất phức tạp. Thông tin trong `/proc/meminfo` khá hạn chế và thông tin bổ sung do `/proc/slabinfo` và `/proc/vmallocinfo` cung cấp khó diễn giải. User space mang lại khả năng nhìn rõ hơn về mức sử dụng bộ nhớ thông qua process memory map.

## Bố cục bộ nhớ User-space

Linux dùng một chiến lược cấp phát lười (lazy allocation) cho user space, chỉ ánh xạ các trang bộ nhớ vật lý khi chương trình truy cập nó. Ví dụ, cấp phát một buffer 1 MB bằng `malloc(3)` trả về một con trỏ tới một khối địa chỉ bộ nhớ nhưng không có bộ nhớ vật lý thực nào. Một cờ được đặt trong các page table entry sao cho mọi truy cập đọc hoặc ghi đều bị kernel bẫy. Điều này được gọi là page fault. Chỉ tại thời điểm này kernel mới cố tìm một trang bộ nhớ vật lý và thêm nó vào ánh xạ page table của process. Hãy minh họa điều này bằng một chương trình đơn giản từ `MELD/Chapter18/pagefault-demo`:

```
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/resource.h>

#define BUFFER_SIZE (1024 * 1024)

void print_pgfaults(void)
{
    int ret;
    struct rusage usage;

    ret = getrusage(RUSAGE_SELF, &usage);

    if (ret == -1) {
        perror("getrusage");
    } else {
        printf("Major page faults %ld\n", usage.ru_majflt);
        printf("Minor page faults %ld\n", usage.ru_minflt);
    }
}

int main(int argc, char *argv[])
{
    unsigned char *p;

    printf("Initial state\n");
    print_pgfaults();

    p = malloc(BUFFER_SIZE);
    printf("After malloc\n");
    print_pgfaults();

    memset(p, 0x42, BUFFER_SIZE);
    printf("After memset\n");
    print_pgfaults();

    memset(p, 0x42, BUFFER_SIZE);
    printf("After 2nd memset\n");
    print_pgfaults();

    return 0;
}
```

Khi chạy nó, bạn sẽ thấy output như sau:

```
Initial state
Major page faults 0
Minor page faults 172
After malloc
Major page faults 0
Minor page faults 186
After memset
Major page faults 0
Minor page faults 442
After 2nd memset
Major page faults 0
Minor page faults 442
```

Có 172 minor page fault xảy ra sau khi khởi tạo môi trường của chương trình và thêm 14 khi gọi `getrusage(2)` (các con số này sẽ khác nhau tùy theo kiến trúc và phiên bản thư viện C mà bạn đang dùng). Phần quan trọng là sự gia tăng khi lấp đầy bộ nhớ bằng dữ liệu: 442 - 186 = 256. Buffer là 1 MB, tức 256 trang. Lời gọi thứ hai tới `memset(3)` không tạo ra khác biệt nào vì tất cả các trang giờ đã được ánh xạ.

Như bạn có thể thấy, một page fault được tạo ra khi kernel bẫy truy cập tới một trang chưa được ánh xạ. Thực ra, có hai loại page fault: `minor` và `major`. Với một minor fault, kernel chỉ cần tìm một trang bộ nhớ vật lý và ánh xạ nó vào không gian địa chỉ của process, như được thể hiện trong code trên. Một major page fault xảy ra khi virtual memory được ánh xạ tới một file, ví dụ, bằng `mmap(2)`, mà tôi sẽ mô tả ngay sau đây. Đọc từ vùng nhớ này có nghĩa là kernel không chỉ phải tìm một trang bộ nhớ và ánh xạ nó vào mà còn phải lấp đầy nó bằng dữ liệu từ file. Do đó, major fault tốn kém hơn nhiều về thời gian và tài nguyên hệ thống.

Mặc dù `getrusage(2)` cung cấp các số liệu hữu ích về minor và major page fault bên trong một process, đôi khi điều chúng ta thực sự muốn thấy là toàn bộ memory map của một process.

## Memory map của process

Mỗi process đang chạy trong user space đều có một process map mà chúng ta có thể kiểm tra. Các memory map này cho chúng ta biết bộ nhớ của một chương trình được cấp phát như thế nào và nó được link với những shared library nào. Bạn có thể xem memory map của một process thông qua filesystem `proc`. Đây là map của process `init` (PID 1):

```
# cat /proc/1/maps
aaaaaf830000-aaaaaf83a000 r-xp 00000000 b3:62 397   /sbin/init.sysvinit
aaaaaf84f000-aaaaaf850000 r--p 0000f000 b3:62 397   /sbin/init.sysvinit
aaaaaf850000-aaaaaf851000 rw-p 00010000 b3:62 397   /sbin/init.sysvinit
aaaae9d63000-aaaae9d84000 rw-p 00000000 00:00 0     [heap]
ffff7ffb0000-ffff8013b000 r-xp 00000000 b3:62 309   /lib/libc.so.6
ffff8013b000-ffff8014d000 ---p 0018b000 b3:62 309   /lib/libc.so.6
ffff8014d000-ffff80150000 r--p 0018d000 b3:62 309   /lib/libc.so.6
ffff80150000-ffff80152000 rw-p 00190000 b3:62 309   /lib/libc.so.6
ffff80152000-ffff8015e000 rw-p 00000000 00:00 0
ffff8016c000-ffff80193000 r-xp 00000000 b3:62 304   /lib/ld-linux-aarch64.so.1
ffff801a4000-ffff801a6000 rw-p 00000000 00:00 0
ffff801a6000-ffff801a8000 r--p 00000000 00:00 0     [vvar]
ffff801a8000-ffff801aa000 r-xp 00000000 00:00 0     [vdso]
ffff801aa000-ffff801ac000 r--p 0002e000 b3:62 304   /lib/ld-linux-aarch64.so.1
ffff801ac000-ffff801ae000 rw-p 00030000 b3:62 304   /lib/ld-linux-aarch64.so.1
ffffd73ca000-ffffd73eb000 rw-p 00000000 00:00 0     [stack]
```

Hai cột đầu tiên cho thấy địa chỉ ảo bắt đầu và kết thúc và quyền của mỗi ánh xạ. Các quyền được thể hiện ở đây:

- `r`: đọc

- `w`: ghi

- `x`: thực thi

- `s`: chia sẻ

- `p`: riêng (copy-on-write)

Nếu ánh xạ gắn với một file, tên file xuất hiện ở cột cuối cùng, và các cột ba, bốn và năm chứa offset tính từ đầu file, số hiệu block device và inode của file. Hầu hết các ánh xạ là tới chính chương trình và các thư viện mà nó được link. Có hai vùng mà chương trình có thể cấp phát bộ nhớ, được đánh dấu `[heap]` và `[stack]`. Bộ nhớ được cấp phát bằng malloc đến từ vùng trước (ngoại trừ các cấp phát rất lớn, mà chúng ta sẽ đề cập sau); các cấp phát trên stack đến từ vùng sau. Kích thước tối đa của cả hai vùng được điều khiển bởi `ulimit` của process:

- heap: `ulimit -d`, mặc định không giới hạn

- stack: `ulimit -s`, mặc định 8 MB

Các cấp phát vượt quá giới hạn bị từ chối bằng `SIGSEGV`.

Khi hết bộ nhớ, kernel có thể quyết định loại bỏ các trang được ánh xạ tới một file và là read-only. Nếu trang đó được truy cập lại, nó sẽ gây ra một major page fault và được đọc lại từ file.

## Swapping

Ý tưởng của swapping là dành ra một vùng lưu trữ nơi kernel có thể đặt các trang bộ nhớ không được ánh xạ tới một file, giải phóng bộ nhớ cho các mục đích khác. Nó tăng kích thước hiệu dụng của bộ nhớ vật lý thêm bằng kích thước của swap file. Nó không phải là thuốc chữa bách bệnh: có một cái giá cho việc copy các trang vào và ra khỏi swap file, điều trở nên rõ ràng trên một hệ thống có quá ít bộ nhớ thực cho workload nó đang gánh và vì vậy swapping trở thành hoạt động chính. Điều này đôi khi được gọi là disk thrashing.

Swapping hiếm khi được dùng trên các thiết bị nhúng vì nó không hoạt động tốt với bộ nhớ flash, nơi việc ghi liên tục sẽ làm nó mòn nhanh chóng. Tuy nhiên, bạn có thể muốn cân nhắc swapping vào RAM nén (zram).

### Swapping vào bộ nhớ nén (zram)

Driver zram tạo các block device RAM-based tên `/dev/zram0`, `/dev/zram1`, v.v. Các trang được ghi vào các thiết bị này được nén trước khi được lưu. Với tỷ lệ nén trong khoảng 30% đến 50%, bạn có thể kỳ vọng bộ nhớ trống tổng thể tăng khoảng 10% với cái giá là xử lý nhiều hơn và mức dùng điện tăng tương ứng.

Để bật zram, hãy cấu hình kernel với các tùy chọn sau:

```
CONFIG_SWAP
CONFIG_CGROUP_MEM_RES_CTLR
CONFIG_CGROUP_MEM_RES_CTLR_SWAP
CONFIG_ZRAM
```

Sau đó, mount zram lúc boot bằng cách thêm nội dung sau vào `/etc/fstab`:

```
/dev/zram0 none swap defaults zramsize=<size in bytes>, swapprio=<swap
partition priority>
```

Bạn có thể bật và tắt swapping bằng các lệnh sau:

```
# swapon /dev/zram0
# swapoff /dev/zram0
```

Swapping bộ nhớ ra zram tốt hơn swapping ra bộ nhớ flash, nhưng không kỹ thuật nào thay thế được bộ nhớ vật lý đầy đủ.

User-space process phụ thuộc vào kernel để quản lý virtual memory cho chúng. Đôi khi một chương trình muốn kiểm soát memory map của nó nhiều hơn mức kernel có thể cung cấp. Có một system call cho phép chúng ta ánh xạ bộ nhớ vào một file để truy cập trực tiếp hơn từ user space.

## Ánh xạ bộ nhớ với mmap

Một process bắt đầu cuộc đời với một lượng bộ nhớ nhất định được ánh xạ tới các segment text (code) và data của file chương trình, cùng với các shared library mà nó được link. Nó có thể cấp phát bộ nhớ trên heap lúc runtime bằng `malloc(3)` và trên stack thông qua các biến cục bộ và bộ nhớ được cấp phát qua `alloca(3)`. Nó cũng có thể nạp thư viện động lúc runtime bằng `dlopen(3)`. Tất cả các ánh xạ này đều do kernel lo liệu. Tuy nhiên, một process cũng có thể thao tác memory map của nó một cách tường minh bằng `mmap(2)`:

```
void *mmap(void *addr, size_t length, int prot, int flags,int fd, off_t
offset);
```

Hàm này ánh xạ `length` byte bộ nhớ từ file có descriptor `fd`, bắt đầu tại `offset` trong file, và trả về một con trỏ tới ánh xạ, giả sử nó thành công. Vì phần cứng bên dưới làm việc theo trang, `length` được làm tròn lên số trang nguyên gần nhất. Tham số bảo vệ, `prot`, là sự kết hợp của các quyền đọc, ghi và thực thi, và tham số `flags` chứa ít nhất `MAP_SHARED` hoặc `MAP_PRIVATE`. Có nhiều cờ khác, được mô tả trong manpage `mmap`.

Có nhiều thứ bạn có thể làm với `mmap`. Tôi sẽ trình bày một số trong các phần sắp tới.

### Dùng mmap để cấp phát bộ nhớ riêng

Bạn có thể dùng `mmap` để cấp phát một vùng bộ nhớ riêng bằng cách đặt `MAP_ANONYMOUS` trong tham số `flags` và đặt file descriptor `fd` là `-1`. Điều này tương tự như cấp phát bộ nhớ từ heap bằng `malloc`, ngoại trừ việc bộ nhớ là page-aligned và theo bội số của trang. Bộ nhớ được cấp phát trong cùng vùng với vùng dùng cho các thư viện. Thực ra, vì lý do này một số người gọi vùng này là vùng `mmap`.

Anonymous mapping tốt hơn cho các cấp phát lớn vì chúng không ghim heap bằng các khối bộ nhớ, điều sẽ khiến phân mảnh dễ xảy ra hơn. Thú vị là, bạn sẽ thấy `malloc` (ít nhất là trong `glibc`) ngừng cấp phát bộ nhớ từ heap cho các yêu cầu trên 128 KB và dùng `mmap` theo cách này, vì vậy trong hầu hết các trường hợp, chỉ cần dùng `malloc` là đúng. Hệ thống sẽ chọn cách tốt nhất để đáp ứng yêu cầu.

### Dùng mmap để chia sẻ bộ nhớ

Như chúng ta đã thấy trong Chương 17, POSIX shared memory đòi hỏi `mmap` để truy cập segment bộ nhớ. Trong trường hợp này, bạn đặt cờ `MAP_SHARED` và dùng file descriptor từ `shm_open()`:

```
int shm_fd;
char *shm_p;

shm_fd = shm_open("/myshm", O_CREAT | O_RDWR, 0666);
ftruncate(shm_fd, 65536);
shm_p = mmap(NULL, 65536, PROT_READ | PROT_WRITE, MAP_SHARED, shm_fd, 0);
```

Một process khác dùng cùng các lời gọi, tên file, độ dài và cờ để ánh xạ tới vùng nhớ đó nhằm chia sẻ. Các lời gọi `msync(2)` sau đó điều khiển khi nào các cập nhật trên bộ nhớ được chuyển xuống file bên dưới.

Chia sẻ bộ nhớ qua `mmap` cũng cung cấp một cách đơn giản để đọc từ và ghi vào bộ nhớ thiết bị.

### Dùng mmap để truy cập bộ nhớ thiết bị

Như tôi đã đề cập trong Chương 11, một driver có thể cho phép device node của nó được memory map và chia sẻ một phần bộ nhớ thiết bị với một ứng dụng. Cách hiện thực chính xác phụ thuộc vào driver.

Một ví dụ là Linux framebuffer, `/dev/fb0`. Các FPGA như dòng Xilinx Zynq cũng được truy cập như bộ nhớ qua `mmap` từ Linux. Giao diện framebuffer được định nghĩa trong `/usr/include/linux/fb.h`, bao gồm một hàm `ioctl` để lấy kích thước màn hình và số bit trên mỗi pixel. Sau đó bạn có thể dùng `mmap` để yêu cầu video driver chia sẻ framebuffer với ứng dụng và đọc, ghi pixel:

```
int f;
int fb_size;
unsigned char *fb_mem;

f = open("/dev/fb0", O_RDWR);
/* Use ioctl FBIOGET_VSCREENINFO to find the display
 dimensions and calculate fb_size */
fb_mem = mmap(0, fb_size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
/* read and write pixels through pointer fb_mem */
```

Ví dụ thứ hai là giao diện streaming video, Video 4 Linux 2 (V4L2), được định nghĩa trong `/usr/include/linux/videodev2.h`. Mỗi thiết bị video có một node tên `/dev/video<N>`, bắt đầu với `/dev/video0`. Có một hàm `ioctl` để yêu cầu driver cấp phát một số video buffer mà bạn có thể `mmap` vào user space. Sau đó, chỉ còn là vấn đề luân chuyển các buffer và lấp đầy hoặc làm rỗng chúng bằng dữ liệu video, tùy thuộc vào việc bạn đang phát lại hay đang capture một luồng video.

Giờ chúng ta đã đề cập bố cục và ánh xạ bộ nhớ, hãy xem xét mức sử dụng bộ nhớ, bắt đầu với cách đo nó.

## Ứng dụng của tôi dùng bao nhiêu bộ nhớ?

Cũng như với kernel space, các cách khác nhau để cấp phát, ánh xạ và chia sẻ bộ nhớ user-space khiến khá khó trả lời câu hỏi có vẻ đơn giản này.

Để bắt đầu, bạn có thể hỏi kernel xem nó nghĩ có bao nhiêu bộ nhớ khả dụng, điều bạn có thể làm bằng lệnh `free`. Đây là một ví dụ điển hình về output:

```
        total        used   free shared buffers cached
Mem:   509016      504312   4704 0      26456   363860
-/+ buffers/cache: 113996 395020
Swap:       0           0      0
```

Thoạt nhìn, đây có vẻ là một hệ thống gần như hết bộ nhớ, chỉ còn 4,704 KB trống trên 509,016 KB: chưa tới 1%. Tuy nhiên, lưu ý rằng 26,456 KB nằm trong buffer và con số khổng lồ 363,860 KB nằm trong cache. Linux tin rằng bộ nhớ trống là bộ nhớ lãng phí; kernel dùng bộ nhớ trống cho buffer và cache với hiểu biết rằng chúng có thể được thu nhỏ khi có nhu cầu. Loại bỏ buffer và cache khỏi phép đo cho ra bộ nhớ trống thực sự, là 395,020 KSB: 77% tổng số. Khi dùng `free`, các con số ở dòng thứ hai được đánh dấu `-/+ buffers/cache` là những con số quan trọng.

Bạn có thể buộc kernel giải phóng cache bằng cách ghi một số từ 1 đến 3 vào `/proc/sys/vm/drop_caches`:

```
# echo 3 > /proc/sys/vm/drop_caches
```

Con số này thực ra là một bitmask xác định loại nào trong hai loại cache lớn mà bạn muốn giải phóng: `1` cho page cache và `2` cho dentry cache và inode cache gộp lại. Vì `1` và `2` là các bit khác nhau, ghi `3` sẽ giải phóng cả hai loại cache.

Vai trò chính xác của các cache này không đặc biệt quan trọng ở đây, chỉ cần biết rằng có bộ nhớ mà kernel đang dùng nhưng có thể được thu hồi ngay khi cần.

Lệnh `free` cho chúng ta biết bao nhiêu bộ nhớ đang được dùng và bao nhiêu còn lại. Nó không cho biết process nào đang dùng phần bộ nhớ không khả dụng cũng như theo tỷ lệ nào. Để đo điều đó, chúng ta cần các công cụ khác.

## Mức sử dụng bộ nhớ Per-process

Có một số thước đo để đo lượng bộ nhớ mà một process đang dùng. Tôi sẽ bắt đầu với hai thước đo dễ lấy nhất: virtual set size (VSS) và resident memory size (RSS), cả hai đều có sẵn trong hầu hết các bản hiện thực của lệnh `ps` và `top`:

- VSS: Được gọi là `VSZ` trong lệnh `ps` và `VIRT` trong `top`, đây là tổng lượng bộ nhớ được một process ánh xạ. Nó là tổng của tất cả các vùng được hiển thị trong `/proc/<PID>/map`. Con số này ít được quan tâm vì chỉ một phần virtual memory được gắn vào bộ nhớ vật lý tại bất kỳ thời điểm nào.

- RSS: Được gọi là `RSS` trong `ps` và `RES` trong `top`, đây là tổng bộ nhớ được ánh xạ tới các trang bộ nhớ vật lý. Con số này gần hơn với ngân sách bộ nhớ thực tế của process, nhưng có một vấn đề: nếu bạn cộng RSS của tất cả các process, bạn sẽ được một con số ước tính quá cao về bộ nhớ đang dùng vì một số trang sẽ được chia sẻ.

Hãy tìm hiểu thêm về các lệnh `top` và `ps`.

### Dùng top và ps

Các phiên bản `top` và `ps` từ BusyBox cung cấp thông tin rất hạn chế. Các ví dụ sau dùng các phiên bản đầy đủ từ package `procps`.

Đây là output từ một lệnh `ps` với định dạng tùy chỉnh bao gồm `vsz` và `rss`:

```
# ps -eo pid,tid,class,rtprio,stat,vsz,rss,comm
    PID     TID CLS RTPRIO STAT    VSZ   RSS COMMAND
      1       1 TS       - Ss     4496  2652 systemd
    <…>
    205     205 TS       - Ss     4076  1296 systemd-journal
    228     228 TS       - Ss     2524  1396 udevd
    581     581 TS       - Ss     2880  1508 avahi-daemon
    584     584 TS       - Ss     2848  1512 dbus-daemon
    590     590 TS       - Ss     1332   680 acpid
    594     594 TS       - Ss     4600  1564 wpa_supplicant
```

Tương tự, `top` hiển thị bản tóm tắt bộ nhớ trống và mức sử dụng bộ nhớ theo từng process:

```
top - 21:17:52 up 10:04, 1 user, load average: 0.00, 0.01, 0.05
Tasks: 96 total, 1 running, 95 sleeping, 0 stopped, 0 zombie
%Cpu(s):  1.7 us,  2.2 sy,  0.0 ni, 95.9 id,  0.0 wa,  0.0 hi
KiB Mem : 509016 total, 278524 used, 230492 free,  25572 buffers
KiB Swap:      0 total,      0 used,      0 free, 170920 cached
PID USER PR NI   VIRT   RES   SHR S  %CPU  %MEM    TIME+ COMMAND
595 root 20  0  64920  9.8m  4048 S   0.0   2.0  0:01.09 node
866 root 20  0  28892  9152  3660 S   0.2   1.8  0:36.38 Xorg
<…>
```

Các lệnh đơn giản này cho bạn cảm nhận về mức sử dụng bộ nhớ và cung cấp dấu hiệu đầu tiên rằng bạn có một memory leak khi thấy RSS của một process cứ tiếp tục tăng. Tuy nhiên, chúng không chính xác lắm trong các phép đo tuyệt đối về mức sử dụng bộ nhớ.

### Dùng smem

Năm 2009, Matt Mackall bắt đầu xem xét vấn đề tính toán các trang được chia sẻ trong phép đo bộ nhớ process và đã thêm hai thước đo mới gọi là unique set size (USS) và proportional set size (PSS):

- USS: Đây là lượng bộ nhớ được gắn vào bộ nhớ vật lý và là duy nhất cho một process; nó không được chia sẻ với process nào khác. Đây là lượng bộ nhớ sẽ được giải phóng nếu process kết thúc.

- PSS: Thước đo này chia phần tính toán các trang được chia sẻ đã gắn vào bộ nhớ vật lý giữa tất cả các process có ánh xạ chúng. Ví dụ, nếu một vùng code thư viện dài 12 trang và được sáu process chia sẻ, mỗi process sẽ tích lũy hai trang trong PSS. Do đó, nếu bạn cộng các con số PSS của tất cả các process, bạn sẽ có lượng bộ nhớ thực tế được các process đó sử dụng. Nói cách khác, PSS là con số mà chúng ta đang tìm kiếm.

Thông tin về PSS có sẵn trong `/proc/<PID>/smaps`, file chứa thông tin bổ sung cho từng ánh xạ được hiển thị trong `/proc/<PID>/maps`. Đây là một phần từ một file như vậy cung cấp thông tin về ánh xạ cho code segment của `libc`:

```
ffffbd080000-ffffbd20b000 r-xp 00000000 b3:62 309 /lib/libc.so.6
Size:               1580 kB
KernelPageSize:        4 kB
MMUPageSize:           4 kB
Rss:                1132 kB
Pss:                 112 kB
Pss_Dirty:             0 kB
Shared_Clean:       1132 kB
Shared_Dirty:          0 kB
Private_Clean:         0 kB
Private_Dirty:         0 kB
Referenced:         1132 kB
Anonymous:             0 kB
KSM:                   0 kB
LazyFree:              0 kB
AnonHugePages:         0 kB
ShmemPmdMapped:        0 kB
FilePmdMapped:         0 kB
Shared_Hugetlb:        0 kB
Private_Hugetlb:       0 kB
Swap:                  0 kB
SwapPss:               0 kB
Locked:                0 kB
THPeligible:           0
VmFlags: rd ex mr mw me
```

Lưu ý rằng `Rss` là `1132 kB`, nhưng vì nó được chia sẻ giữa nhiều process khác, `Pss` chỉ là `112 kB`.

Có một công cụ tên smem tổng hợp thông tin từ các file `smaps` và trình bày nó theo nhiều cách khác nhau, bao gồm dưới dạng biểu đồ tròn hoặc biểu đồ cột. Trang project của `smem` là `https://www.selenic.com/smem/`. Nó có sẵn dưới dạng package trong hầu hết các bản phân phối desktop. Tuy nhiên, vì nó được viết bằng Python, việc cài đặt nó trên một target nhúng đòi hỏi một môi trường Python, điều có thể quá phiền phức chỉ vì một công cụ. Để giúp việc này, có một chương trình nhỏ tên smemcap ghi lại trạng thái từ `/proc` trên target và lưu nó vào một file TAR có thể được phân tích sau trên máy host. `smemcap` là một phần của BusyBox, nhưng nó cũng có thể được compile từ source.

Nếu bạn chạy `smem` native, với `root`, bạn sẽ thấy các kết quả sau:

```
# smem -t
PID User Command                     Swap   USS   PSS   RSS
  1 root init [5]                       0   136   267  1532
361 root /sbin/klogd -n                 0   104   273  1708
367 root /sbin/getty 38400 tty1         0   108   278  1788
369 root /sbin/getty -L 115200 ttyS2    0   108   278  1788
358 root /sbin/syslogd -n -O /var/lo    0   108   279  1728
306 root udhcpc -R -b -p /var/run/ud    0   168   284  1372
366 root /bin/sh /bin/start_getty 11    0   116   315  1736
383 root -sh                            0   220   506  2184
129 root /sbin/udevd -d                 0  1436  1517  2380
351 root sshd: /usr/sbin/sshd [liste    0   928  1893  3764
380 root sshd: root@pts/0               0  3816  4900  7160
387 root python3 /usr/bin/smem -t       0 11968 12136 13456
-----------------------------------------------------------
 12 1                                   0 19216 22926 40596
```

Bạn có thể thấy từ dòng cuối cùng của output rằng, trong trường hợp này, tổng PSS bằng khoảng một nửa RSS.

Nếu bạn không có hoặc không muốn cài đặt Python trên target, bạn có thể ghi lại trạng thái bằng `smemcap`, một lần nữa với `root`:

```
# smemcap > smem-beagleplay-cap.tar
```

Sau đó, copy file TAR sang host và đọc nó bằng `smem -t -S`, dù lần này không cần chạy lệnh với `root`:

```
$ smem -t -S smem-beagleplay-cap.tar
```

Output giống hệt output chúng ta nhận được khi chạy `smem` native.

### Các công cụ khác cần cân nhắc

Một cách khác để hiển thị PSS là qua ps\_mem (`https://github.com/pixelb/ps_mem`), công cụ in ra thông tin gần như tương tự nhưng ở định dạng đơn giản hơn. Nó cũng được viết bằng Python.

Android cũng có một công cụ hiển thị bản tóm tắt USS và PSS cho mỗi process, tên procrank, có thể được cross-compiled cho embedded Linux với một vài thay đổi nhỏ. Bạn có thể lấy code từ `https://github.com/csimmonds/procrank_linux`.

Giờ chúng ta đã biết cách đo mức sử dụng bộ nhớ per-process. Giả sử chúng ta dùng các công cụ vừa trình bày để tìm process ngốn bộ nhớ trong hệ thống. Sau đó làm thế nào để đào sâu vào process đó để tìm ra nó sai ở đâu? Đó là chủ đề của phần tiếp theo.

## Xác định memory leak

Memory leak xảy ra khi bộ nhớ được cấp phát nhưng không được giải phóng khi không còn cần nữa. Rò rỉ bộ nhớ hoàn toàn không phải là đặc thù của hệ thống nhúng, nhưng nó trở thành vấn đề một phần vì các target vốn không có nhiều bộ nhớ ngay từ đầu và một phần vì chúng thường chạy trong thời gian dài mà không reboot, khiến các chỗ rò rỉ trở thành một vũng lớn.

Bạn sẽ nhận ra có rò rỉ khi chạy `free` hoặc `top` và thấy bộ nhớ trống liên tục giảm ngay cả khi bạn drop cache, như được thể hiện ở phần trước. Bạn sẽ có thể xác định thủ phạm (hoặc các thủ phạm) bằng cách xem USS và RSS theo từng process.

Có một số công cụ để xác định memory leak trong một chương trình. Tôi sẽ xem xét hai công cụ: `mtrace` và `valgrind`.

### mtrace

mtrace là một thành phần của `glibc` theo dõi các lời gọi tới `malloc`, `free` và các hàm liên quan, và xác định các vùng bộ nhớ không được giải phóng khi chương trình thoát. Bạn cần gọi hàm `mtrace()` từ bên trong chương trình để bắt đầu theo dõi và sau đó, lúc runtime, ghi một đường dẫn vào biến môi trường `MALLOC_TRACE`, nơi thông tin trace được ghi vào. Nếu `MALLOC_TRACE` không tồn tại hoặc nếu file không thể mở được, các hook `mtrace` sẽ không được cài đặt.

Mặc dù thông tin trace được ghi dưới dạng ASCII, thông thường người ta dùng lệnh `mtrace` để xem nó. Đây là một ví dụ về một chương trình dùng `mtrace` từ `MELD/Chapter18/mtrace-example`:

```
#include <mcheck.h>
#include <stdlib.h>
#include <stdio.h>

int main(int argc, char *argv[])
{
    int j;

    mtrace();
    for (j = 0; j < 2; j++)
        malloc(100); /* Never freed:a memory leak */

    calloc(16, 16); /* Never freed:a memory leak */
    exit(EXIT_SUCCESS);
}
```

Đây là những gì bạn có thể thấy khi chạy chương trình và xem trace:

```
$ export MALLOC_TRACE=mtrace.log
$ ./mtrace-example
$ mtrace mtrace-example mtrace.log

Memory not freed:
-----------------
           Address   Size      Caller
0x0000000001479460    0x64  at /home/chris/mtrace-example.c:12
0x00000000014794d0    0x64  at /home/chris/mtrace-example.c:12
0x0000000001479540   0x100  at /home/chris/mtrace-example.c:14
```

Thật không may, `mtrace` không cho bạn biết về bộ nhớ bị rò rỉ trong khi chương trình chạy. Nó phải kết thúc trước.

### Valgrind

Valgrind là một công cụ rất mạnh được dùng để phát hiện các vấn đề bộ nhớ bao gồm rò rỉ và những thứ khác. Một ưu điểm là bạn không phải compile lại các chương trình và thư viện mà bạn muốn kiểm tra, dù nó hoạt động tốt hơn nếu chúng đã được compile với tùy chọn `-g` để chúng bao gồm các bảng debug symbol. Nó hoạt động bằng cách chạy chương trình trong một môi trường giả lập và bẫy việc thực thi ở nhiều điểm khác nhau. Điều này dẫn đến nhược điểm lớn của Valgrind, đó là chương trình chạy chỉ bằng một phần nhỏ tốc độ bình thường, khiến nó kém hữu ích hơn cho việc kiểm thử bất cứ thứ gì có ràng buộc real-time.

MẸO

Nhân tiện, cái tên thường bị phát âm sai: Valgrind FAQ nói rằng phần grind được phát âm với âm i ngắn, như trong grinned (vần với tinned) thay vì grind (vần với find). FAQ, tài liệu và các bản tải về có tại `https://valgrind.org`.

Valgrind chứa một số công cụ chẩn đoán:

- `memcheck`: Đây là công cụ mặc định, và nó phát hiện memory leak và việc dùng sai bộ nhớ nói chung.

- `cachegrind`: Công cụ này tính tỷ lệ hit của cache bộ xử lý.

- `callgrind`: Công cụ này tính chi phí của mỗi lời gọi hàm.

- `helgrind`: Công cụ này làm nổi bật việc dùng sai Pthread API, bao gồm các deadlock tiềm ẩn và race condition.

- `DRD`: Đây là một công cụ phân tích Pthread khác.

- `massif`: Công cụ này profile việc sử dụng heap và stack.

Bạn có thể chọn công cụ mình muốn bằng tùy chọn `-tool`. Valgrind chạy trên các nền tảng nhúng chính: Arm (Cortex-A), PowerPC, MIPS và x86 ở các biến thể 32-bit và 64-bit. Nó có sẵn dưới dạng package trong cả The Yocto Project và Buildroot.

Để tìm memory leak của chúng ta, chúng ta cần dùng công cụ `memcheck` mặc định, với tùy chọn `-–leak-check=full` để in ra các dòng nơi tìm thấy rò rỉ:

```
$ valgrind --leak-check=full ./mtrace-example
==3384686== Memcheck, a memory error detector
==3384686== Copyright (C) 2002-2022, and GNU GPL'd, by Julian Seward et
al.
==3384686== Using Valgrind-3.22.0 and LibVEX; rerun with -h for copyright
info
==3384686== Command: ./mtrace-example
==3384686==
==3384686==
==3384686== HEAP SUMMARY:
==3384686==     in use at exit: 456 bytes in 3 blocks
==3384686==   total heap usage: 3 allocs, 0 frees, 456 bytes allocated
==3384686==
==3384686== 200 bytes in 2 blocks are definitely lost in loss record 1 of
2
==3384686==    at 0x4846828: malloc (in /usr/libexec/valgrind/vgpreload_
memcheck-amd64-linux.so)
==3384686==    by 0x1091D3: main (mtrace-example.c:12)
==3384686==
==3384686== 256 bytes in 1 blocks are definitely lost in loss record 2 of
2
==3384686==    at 0x484D953: calloc (in /usr/libexec/valgrind/vgpreload_
memcheck-amd64-linux.so)
==3384686==    by 0x1091EC: main (mtrace-example.c:14)
==3384686==
==3384686== LEAK SUMMARY:
==3384686==    definitely lost: 456 bytes in 3 blocks
==3384686==    indirectly lost: 0 bytes in 0 blocks
==3384686==      possibly lost: 0 bytes in 0 blocks
==3384686==    still reachable: 0 bytes in 0 blocks
==3384686==         suppressed: 0 bytes in 0 blocks
==3384686==
==3384686== For lists of detected and suppressed errors, rerun with: -s
==3384686== ERROR SUMMARY: 2 errors from 2 contexts (suppressed: 0 from 0)
```

Output từ Valgrind cho thấy hai memory leak đã được tìm thấy trong `mtrace-example.c`: một `malloc` ở dòng 12 và một `calloc` ở dòng 14. Các lời gọi `free` sau đó lẽ ra phải đi kèm hai lần cấp phát bộ nhớ này bị thiếu trong chương trình. Nếu không được kiểm soát, memory leak trong một process long-running cuối cùng có thể dẫn đến việc hệ thống hết bộ nhớ.

## Hết bộ nhớ

Chính sách cấp phát bộ nhớ chuẩn là overcommit, nghĩa là kernel sẽ cho phép các ứng dụng cấp phát nhiều bộ nhớ hơn lượng bộ nhớ vật lý có. Phần lớn thời gian, điều này hoạt động tốt vì các ứng dụng thường yêu cầu nhiều bộ nhớ hơn mức chúng thực sự cần. Điều này cũng giúp ích trong việc hiện thực `fork(2)`: việc tạo một bản sao của một chương trình lớn là an toàn vì các trang bộ nhớ được chia sẻ với cờ copy-on-write được đặt. Trong phần lớn các trường hợp, `fork` được theo sau bởi một lời gọi hàm `exec`, vốn hủy chia sẻ bộ nhớ rồi nạp một chương trình mới.

Tuy nhiên, luôn có khả năng một workload cụ thể sẽ khiến một nhóm process cùng lúc cố đòi các cấp phát mà chúng đã được hứa và vì vậy đòi nhiều hơn lượng thực sự có. Đây là một tình huống out-of-memory, hay OOM. Tại thời điểm này, không còn lựa chọn nào khác ngoài việc kill các process cho đến khi vấn đề biến mất. Đây là công việc của out-of-memory killer.

Trước khi đến đó, có một tham số tinh chỉnh cho các cấp phát kernel trong `/proc/sys/vm/overcommit_memory`, mà bạn có thể đặt thành các giá trị sau:

- `0`: overcommit theo heuristic

- `1`: luôn overcommit; không bao giờ kiểm tra

- `2`: luôn kiểm tra; không bao giờ overcommit

Tùy chọn `0` là mặc định và là lựa chọn tốt nhất trong phần lớn các trường hợp.

Tùy chọn `1` chỉ hữu ích nếu bạn chạy các chương trình làm việc với các mảng thưa lớn và cấp phát các vùng bộ nhớ lớn nhưng chỉ ghi vào một phần nhỏ của chúng. Các chương trình như vậy hiếm gặp trong bối cảnh hệ thống nhúng.

Tùy chọn `2` có vẻ là một lựa chọn tốt nếu bạn lo lắng về việc hết bộ nhớ, có lẽ trong một ứng dụng mission hoặc safety-critical. Nó sẽ làm thất bại các cấp phát lớn hơn commit limit, là kích thước của swap space cộng với tổng bộ nhớ nhân với overcommit ratio. Overcommit ratio được điều khiển bởi /`proc/sys/vm/overcommit_ratio` và có giá trị mặc định là 50%.

Ví dụ, giả sử bạn có một thiết bị với 2 GB RAM hệ thống và bạn đặt một tỷ lệ thực sự thận trọng là 25%:

```
# echo 25 > /proc/sys/vm/overcommit_ratio
# grep -e MemTotal -e CommitLimit /proc/meminfo
MemTotal:        1996796 kB
CommitLimit:      499196 kB
```

Không có swap, vì vậy commit limit là 25% của `MemTotal`, như mong đợi.

Có một biến quan trọng khác trong `/proc/meminfo`, gọi là `Committed_AS`. Đây là tổng lượng bộ nhớ cần để đáp ứng tất cả các cấp phát đã thực hiện cho đến nay. Tôi tìm thấy kết quả sau trên một hệ thống:

```
# grep -e MemTotal -e Committed_AS /proc/meminfo
MemTotal:        1996796 kB
Committed_AS:    2907335 kB
```

Nói cách khác, kernel đã hứa nhiều bộ nhớ hơn lượng bộ nhớ khả dụng. Do đó, đặt `overcommit_memory` thành `2` sẽ có nghĩa là mọi cấp phát sẽ thất bại bất kể `overcommit_ratio`. Để có một hệ thống hoạt động được, tôi sẽ phải hoặc lắp gấp đôi lượng RAM hoặc giảm mạnh số lượng process đang chạy, vốn có khoảng 40 process.

Trong mọi trường hợp, tuyến phòng thủ cuối cùng là `oom-killer`. Nó dùng một phương pháp heuristic để tính một điểm badness từ 0 đến 1,000 cho mỗi process rồi kết thúc những process có điểm cao nhất cho đến khi có đủ bộ nhớ trống. Bạn sẽ thấy thứ gì đó như sau trong kernel log:

```
[44510.490320] eatmem invoked oom-killer: gfp_mask=0x200da, order=0, oom_
score_adj=0
```

Bạn có thể ép một sự kiện OOM bằng `echo f > /proc/sysrq-trigger`.

Bạn có thể tác động tới điểm badness của một process bằng cách ghi một giá trị điều chỉnh vào `/proc/<PID>/oom_score_adj`. Giá trị `-1000` nghĩa là điểm badness không bao giờ có thể lớn hơn không và vì vậy nó sẽ không bao giờ bị kill; giá trị `+1000` nghĩa là nó sẽ luôn lớn hơn 1,000 và vì vậy nó sẽ luôn bị kill.

## Tóm tắt

Tính toán từng byte bộ nhớ được dùng trong một hệ thống virtual memory đơn giản là không thể. Tuy nhiên, bạn có thể tìm được một con số khá chính xác về tổng lượng bộ nhớ trống, không tính phần bị buffer và cache chiếm, bằng lệnh `free`. Bằng cách theo dõi nó trong một khoảng thời gian và với các workload khác nhau, bạn sẽ trở nên tự tin rằng nó sẽ duy trì trong một giới hạn nhất định.

Khi bạn muốn tinh chỉnh mức sử dụng bộ nhớ hoặc xác định nguồn gốc của các cấp phát bất ngờ, có những nguồn tài nguyên cho thông tin chi tiết hơn. Đối với kernel space, thông tin hữu ích nhất nằm trong `/proc`: `meminfo`, `slabinfo` và `vmallocinfo`.

Khi cần có các phép đo chính xác cho user space, thước đo tốt nhất là PSS, như được hiển thị bởi `smem` và các công cụ khác. Để debug bộ nhớ, bạn có thể nhờ đến các tracer đơn giản như `mtrace`, hoặc bạn có lựa chọn nặng ký là công cụ `memcheck` của Valgrind.

Nếu bạn lo ngại về hậu quả của một tình huống OOM, bạn có thể fine-tune cơ chế cấp phát qua `/proc/sys/vm/overcommit_memory` và bạn có thể kiểm soát khả năng các process cụ thể bị kill thông qua tham số `oom_score_adj`.

Chương tiếp theo hoàn toàn nói về việc debug code user-space và code kernel bằng GNU Debugger và những hiểu biết bạn có thể thu được khi quan sát code lúc nó chạy, bao gồm các hàm quản lý bộ nhớ mà tôi đã mô tả ở đây.

## Tìm hiểu thêm

- Linux Kernel Development, 3rd edition, của Robert Love

- Linux System Programming, 2nd Edition, của Robert Love

- Understanding the Linux Virtual Memory Manager, của Mel Gorman – `https://www.kernel.org/doc/gorman/pdf/understand.pdf`

- Valgrind 3.3: Advanced Debugging and Profiling for GNU/Linux Applications, của Julian Seward, Nicholas Nethercote và Josef Weidendorfer
