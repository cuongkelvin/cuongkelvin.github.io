# *Chương 18*: Quản lý bộ nhớ (Managing Memory)

Chương này đề cập các vấn đề liên quan tới quản lý bộ nhớ, một chủ đề quan trọng với mọi hệ thống Linux nhưng đặc biệt với embedded Linux, nơi bộ nhớ hệ thống thường có hạn. Sau một phần ôn lại ngắn về virtual memory, tôi sẽ chỉ cho bạn cách đo mức sử dụng bộ nhớ, cách phát hiện các vấn đề với cấp phát bộ nhớ, bao gồm memory leak, và điều gì xảy ra khi bạn hết bộ nhớ. Bạn sẽ phải hiểu các công cụ có sẵn, từ các công cụ đơn giản như `free` và `top`, tới các công cụ phức tạp như `mtrace` và Valgrind.

Chúng ta sẽ học sự khác biệt giữa bộ nhớ kernel space và user space, và cách kernel ánh xạ các page bộ nhớ vật lý vào không gian địa chỉ của một process. Sau đó chúng ta sẽ tìm và đọc memory map của từng process dưới filesystem `proc`. Chúng ta sẽ thấy system call `mmap` có thể được dùng để ánh xạ bộ nhớ của một chương trình tới một file như thế nào, để nó có thể cấp phát bộ nhớ hàng loạt hoặc chia sẻ với một process khác. Trong nửa sau của chương này, chúng ta sẽ dùng `ps` để đo mức sử dụng bộ nhớ per-process trước khi chuyển sang các công cụ chính xác hơn như `smem` và `ps_mem`.

Trong chương này, chúng ta sẽ đề cập các chủ đề sau:

- Những điều cơ bản về virtual memory
- Layout bộ nhớ kernel space
- Layout bộ nhớ user space
- Memory map của process
- Swapping
- Ánh xạ bộ nhớ bằng `mmap`
- Application của tôi dùng bao nhiêu bộ nhớ?
- Mức sử dụng bộ nhớ Per-process
- Nhận diện memory leak
- Hết bộ nhớ

## Yêu cầu kỹ thuật

Để làm theo các ví dụ, hãy bảo đảm bạn có những thứ sau:

- Một hệ thống host Linux-based đã cài `gcc`, `make`, `top`, `procps`, `valgrind` và `smem`

Tất cả các công cụ này đều có sẵn trên hầu hết các bản phân phối Linux phổ biến (chẳng hạn Ubuntu, Arch, v.v.).

Toàn bộ code cho chương này có thể được tìm thấy trong thư mục `Chapter18` của repository GitHub của sách: [https://github.com/PacktPublishing/Mastering-Embedded-Linux-Programming-Third-Edition](https://github.com/PacktPublishing/Mastering-Embedded-Linux-Programming-Third-Edition).

## Những điều cơ bản về virtual memory

Tóm tắt lại, Linux cấu hình **memory management unit** (**MMU**) của CPU để trình bày cho một chương trình đang chạy một không gian địa chỉ ảo bắt đầu từ không và kết thúc ở địa chỉ cao nhất, `0xffffffff`, trên một processor 32-bit. Không gian địa chỉ này mặc định được chia thành các page 4 KiB. Nếu page 4 KiB quá nhỏ cho application của bạn, thì bạn có thể cấu hình kernel dùng **HugePages**, giảm lượng tài nguyên hệ thống cần để truy cập các page table entry và tăng tỷ lệ hit của **Translation Lookaside Buffer** (**TLB**).

Linux chia không gian địa chỉ ảo này thành một vùng cho application, gọi là **user space**, và một vùng cho kernel, gọi là **kernel space**. Sự phân chia giữa hai vùng được đặt bởi một tham số cấu hình kernel tên `PAGE_OFFSET`. Trong một hệ thống nhúng 32-bit điển hình, `PAGE_OFFSET` là `0xc0000000`, dành 3 gigabyte thấp cho user space và gigabyte trên cùng cho kernel space. Không gian địa chỉ user được cấp phát per process để mỗi process chạy trong một sandbox, tách biệt với các process khác. Không gian địa chỉ kernel giống nhau cho mọi process, vì chỉ có một kernel.

Các page trong không gian địa chỉ ảo này được MMU ánh xạ tới địa chỉ vật lý, MMU dùng các page table để thực hiện ánh xạ.

Mỗi page virtual memory có thể không được ánh xạ hoặc được ánh xạ như sau:

- Không được ánh xạ, nên cố truy cập các địa chỉ này sẽ dẫn tới một `SIGSEGV`.
- Được ánh xạ tới một page bộ nhớ vật lý riêng của process.
- Được ánh xạ tới một page bộ nhớ vật lý được chia sẻ với các process khác.
- Được ánh xạ và chia sẻ với flag **copy on write** (**CoW**) được đặt: một lần ghi bị bẫy trong kernel, kernel tạo một bản sao của page và ánh xạ nó vào process thay cho page gốc trước khi cho phép lần ghi diễn ra.
- Được ánh xạ tới một page bộ nhớ vật lý được kernel dùng.

Kernel có thể thêm vào đó ánh xạ các page tới các vùng nhớ được dành riêng, chẳng hạn để truy cập các thanh ghi và memory buffer trong device driver.

Một câu hỏi hiển nhiên là: vì sao chúng ta làm theo cách này thay vì đơn giản tham chiếu trực tiếp bộ nhớ vật lý, như một RTOS điển hình vẫn làm?

Virtual memory có rất nhiều ưu điểm, một số được mô tả ở đây:

- Các truy cập bộ nhớ không hợp lệ bị bẫy và application được cảnh báo bằng `SIGSEGV`.
- Các process chạy trong không gian bộ nhớ riêng, cô lập với các process khác.
- Sử dụng bộ nhớ hiệu quả nhờ chia sẻ code và dữ liệu chung, chẳng hạn trong thư viện.
- Khả năng tăng lượng bộ nhớ vật lý biểu kiến bằng cách thêm swap file, dù swapping trên target nhúng là hiếm.

Đây là những lập luận mạnh mẽ, nhưng tôi phải thừa nhận rằng cũng có một số nhược điểm. Khó xác định ngân sách bộ nhớ thực tế của một application, đây là một trong những mối quan tâm chính của chương này. Chiến lược cấp phát mặc định là over-commit, dẫn tới các tình huống out-of-memory khó xử lý, mà tôi cũng sẽ thảo luận sau trong mục *Hết bộ nhớ*. Cuối cùng, các độ trễ do code quản lý bộ nhớ gây ra khi xử lý exception—page fault—làm hệ thống kém tất định hơn, điều quan trọng với các chương trình real-time. Tôi sẽ đề cập điều này trong [*Chương 21*](ch21_real_time_programming.vi.md), *Lập trình Real-Time*.

Quản lý bộ nhớ khác nhau giữa kernel space và user space. Các mục sắp tới mô tả những khác biệt cốt yếu và những điều bạn cần biết.

## Layout bộ nhớ kernel space

Bộ nhớ kernel được quản lý theo một cách khá đơn giản. Nó không demand-paged, nghĩa là với mỗi lần cấp phát bằng `kmalloc()` hoặc function tương tự, đều có bộ nhớ vật lý thực. Bộ nhớ kernel không bao giờ bị loại bỏ hay page out.

Một số kiến trúc hiển thị tóm tắt ánh xạ bộ nhớ lúc boot trong các kernel log message. Trace này được lấy từ một thiết bị Arm 32-bit (một BeagleBone Black):

```
Memory: 511MB = 511MB total
Memory: 505980k/505980k available, 18308k reserved, 0K highmem
Virtual kernel memory layout:
    vector  : 0xffff0000 - 0xffff1000  (   4 kB)
    fixmap  : 0xfff00000 - 0xfffe0000  ( 896 kB)
    vmalloc : 0xe0800000 - 0xff000000  ( 488 MB)
    lowmem  : 0xc0000000 - 0xe0000000  ( 512 MB)
    pkmap   : 0xbfe00000 - 0xc0000000  (   2 MB)
    modules : 0xbf800000 - 0xbfe00000  (   6 MB)
      .text : 0xc0008000 - 0xc0763c90  (7536 kB)
      .init : 0xc0764000 - 0xc079f700  ( 238 kB)
      .data : 0xc07a0000 - 0xc0827240  ( 541 kB)
       .bss : 0xc0827240 - 0xc089e940  ( 478 kB)
```

Con số 505,980 KiB có sẵn là lượng bộ nhớ trống mà kernel thấy khi nó bắt đầu thực thi nhưng trước khi nó bắt đầu thực hiện các cấp phát động.

Những thứ tiêu thụ bộ nhớ kernel space bao gồm:

- Bản thân kernel, nói cách khác, code và dữ liệu được nạp từ file kernel image lúc boot. Điều này được thể hiện trong kernel log trên ở các segment `.text`, `.init`, `.data` và `.bss`. Segment `.init` được giải phóng một khi kernel đã hoàn tất khởi tạo.
- Bộ nhớ được cấp phát qua slab allocator, được dùng cho các cấu trúc dữ liệu kernel đủ loại. Điều này bao gồm các cấp phát được thực hiện bằng `kmalloc()`. Chúng đến từ vùng được đánh dấu **lowmem**.
- Bộ nhớ được cấp phát qua `vmalloc()`, thường cho các khối bộ nhớ lớn hơn mức có thể qua `kmalloc()`. Chúng nằm trong vùng **vmalloc**.
- Ánh xạ cho device driver truy cập các thanh ghi và bộ nhớ thuộc các phần cứng khác nhau, mà bạn có thể thấy bằng cách đọc `/proc/iomem`. Chúng cũng đến từ vùng **vmalloc**, nhưng vì chúng được ánh xạ tới bộ nhớ vật lý nằm ngoài bộ nhớ hệ thống chính, chúng không chiếm bộ nhớ thực nào.
- Kernel module, được nạp vào vùng được đánh dấu **modules**.
- Các cấp phát low-level khác không được theo dõi ở bất kỳ đâu khác.

Giờ chúng ta đã biết layout bộ nhớ trong kernel space, hãy tìm hiểu kernel thực sự đang dùng bao nhiêu bộ nhớ.

### Kernel dùng bao nhiêu bộ nhớ?

Đáng tiếc, không có câu trả lời chính xác cho câu hỏi kernel dùng bao nhiêu bộ nhớ, nhưng những gì sau đây là gần nhất mà chúng ta có thể có.

Thứ nhất, bạn có thể thấy bộ nhớ bị chiếm bởi code và dữ liệu kernel trong kernel log được thể hiện trước đó, hoặc bạn có thể dùng lệnh `size`, như sau:

```
$ arm-poky-linux-gnueabi-size vmlinux
text data bss dec hex filename
9013448 796868 8428144 18238460 1164bfc vmlinux
```

Thông thường, lượng bộ nhớ kernel chiếm cho các segment code và dữ liệu tĩnh được thể hiện ở đây là nhỏ so với tổng lượng bộ nhớ. Nếu không phải vậy, bạn cần xem lại cấu hình kernel và loại bỏ các component bạn không cần. Một nỗ lực cho phép build các kernel nhỏ gọi là **Linux Kernel Tinification** đã tiến triển tốt cho đến khi project bị đình trệ, và các patch của Josh Triplett cuối cùng đã bị gỡ khỏi cây `linux-next` năm 2016. Bây giờ, cách tốt nhất để giảm kích thước in-memory của kernel là **Execute-in-Place** (**XIP**), nơi bạn đánh đổi RAM lấy flash ([https://lwn.net/Articles/748198/](https://lwn.net/Articles/748198/)).

Bạn có thể có thêm thông tin về mức sử dụng bộ nhớ bằng cách đọc `/proc/meminfo`:

```
# cat /proc/meminfo
MemTotal: 509016 kB
MemFree: 410680 kB
Buffers: 1720 kB
Cached: 25132 kB
SwapCached: 0 kB
Active: 74880 kB
Inactive: 3224 kB
Active(anon): 51344 kB
Inactive(anon): 1372 kB
Active(file): 23536 kB
Inactive(file): 1852 kB
Unevictable: 0 kB
Mlocked: 0 kB
HighTotal: 0 kB
HighFree: 0 kB
LowTotal: 509016 kB
LowFree: 410680 kB
SwapTotal: 0 kB
SwapFree: 0 kB
Dirty: 16 kB
Writeback: 0 kB
AnonPages: 51248 kB
Mapped: 24376 kB
Shmem: 1452 kB
Slab: 11292 kB
SReclaimable: 5164 kB
SUnreclaim: 6128 kB
KernelStack: 1832 kB
PageTables: 1540 kB
NFS_Unstable: 0 kB
Bounce: 0 kB
WritebackTmp: 0 kB
CommitLimit: 254508 kB
Committed_AS: 734936 kB
VmallocTotal: 499712 kB
VmallocUsed: 29576 kB
VmallocChunk: 389116 kB
```

Có mô tả cho từng trường này trong manual page `proc(5)`. Mức sử dụng bộ nhớ kernel là tổng của những thứ sau:

- `Slab`: Tổng bộ nhớ được slab allocator cấp phát
- `KernelStack`: Không gian stack được dùng khi thực thi code kernel
- `PageTables`: Bộ nhớ được dùng để lưu page table
- `VmallocUsed`: Bộ nhớ được `vmalloc()` cấp phát

Trong trường hợp cấp phát slab, bạn có thể có thêm thông tin bằng cách đọc `/proc/slabinfo`. Tương tự, có bảng phân tích các cấp phát trong `/proc/vmallocinfo` cho vùng **vmalloc**. Trong cả hai trường hợp, bạn cần hiểu biết chi tiết về kernel và các subsystem của nó để thấy chính xác subsystem nào đang thực hiện cấp phát và vì sao, điều nằm ngoài phạm vi cuộc thảo luận này.

Với module, bạn có thể dùng `lsmod` để tìm không gian bộ nhớ bị chiếm bởi code và dữ liệu:

```
# lsmod
Module Size Used by
g_multi 47670 2
libcomposite 14299 1 g_multi
mt7601Usta 601404 0
```

Điều này còn lại các cấp phát low-level, không có bản ghi nào về chúng, và điều đó ngăn chúng ta tạo ra một bản thống kê chính xác về mức sử dụng bộ nhớ kernel space. Phần này sẽ xuất hiện như bộ nhớ bị thiếu khi chúng ta cộng tất cả các cấp phát kernel và user space mà chúng ta biết.

Đo mức sử dụng bộ nhớ kernel space rất phức tạp. Thông tin trong `/proc/meminfo` khá hạn chế và thông tin bổ sung do `/proc/slabinfo` và `/proc/vmallocinfo` cung cấp khó diễn giải. User space mang lại khả năng nhìn rõ hơn về mức sử dụng bộ nhớ thông qua memory map của process.

## Layout bộ nhớ user space

Linux dùng một chiến lược cấp phát lazy cho user space, chỉ ánh xạ các page bộ nhớ vật lý khi chương trình truy cập nó. Chẳng hạn, cấp phát một buffer 1 MiB bằng `malloc(3)` trả về một con trỏ tới một khối địa chỉ bộ nhớ nhưng không có bộ nhớ vật lý thực nào. Một flag được đặt trong các page table entry sao cho mọi truy cập đọc hay ghi đều bị kernel bẫy. Điều này được gọi là một **page fault**. Chỉ tại thời điểm này kernel mới cố tìm một page bộ nhớ vật lý và thêm nó vào ánh xạ page table của process. Đáng để minh họa điều này bằng một chương trình đơn giản, `MELP/Chapter18/pagefault-demo`:

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

Khi chạy nó, bạn sẽ thấy output như thế này:

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

Có 172 minor page fault xảy ra sau khi khởi tạo môi trường của chương trình và thêm 14 khi gọi `getrusage(2)` (các con số này sẽ thay đổi tùy kiến trúc và phiên bản thư viện C bạn đang dùng). Phần quan trọng là mức tăng khi điền dữ liệu vào bộ nhớ: 442 - 186 = 256. Buffer là 1 MiB, tức 256 page. Lời gọi thứ hai tới `memset(3)` không tạo khác biệt vì tất cả các page giờ đã được ánh xạ.

Như bạn có thể thấy, một page fault được tạo ra khi kernel bẫy một truy cập tới một page chưa được ánh xạ. Thực ra, có hai loại page fault: `minor` và `major`. Với một minor fault, kernel chỉ phải tìm một page bộ nhớ vật lý và ánh xạ nó vào không gian địa chỉ process, như được thể hiện trong code trên. Một major page fault xảy ra khi virtual memory được ánh xạ tới một file, chẳng hạn bằng `mmap(2)`, mà tôi sẽ mô tả ngay sau đây. Đọc từ vùng nhớ này có nghĩa là kernel không chỉ phải tìm một page bộ nhớ và ánh xạ nó vào mà còn phải điền dữ liệu từ file vào đó. Do đó, major fault tốn kém hơn nhiều về thời gian và tài nguyên hệ thống.

Dù `getrusage(2)` cung cấp các chỉ số hữu ích về minor page fault và major page fault bên trong một process, đôi khi điều chúng ta thực sự muốn thấy là toàn bộ memory map của một process.

## Memory map của process

Mỗi process đang chạy trong user space có một process map mà chúng ta có thể kiểm tra. Các memory map này cho chúng ta biết bộ nhớ của một chương trình được cấp phát thế nào và nó được link với những shared library nào.

Bạn có thể xem memory map của một process qua filesystem `proc`. Làm ví dụ, đây là map cho process `init`, PID `1`:

```
# cat /proc/1/maps
00008000-0000e000 r-xp 00000000 00:0b 23281745 /sbin/init
00016000-00017000 rwxp 00006000 00:0b 23281745 /sbin/init
00017000-00038000 rwxp 00000000 00:00 0        [heap]
b6ded000-b6f1d000 r-xp 00000000 00:0b 23281695 /lib/libc-2.19.so
b6f1d000-b6f24000 ---p 00130000 00:0b 23281695 /lib/libc-2.19.so
b6f24000-b6f26000 r-xp 0012f000 00:0b 23281695 /lib/libc-2.19.so
b6f26000-b6f27000 rwxp 00131000 00:0b 23281695 /lib/libc-2.19.so
b6f27000-b6f2a000 rwxp 00000000 00:00 0
b6f2a000-b6f49000 r-xp 00000000 00:0b 23281359 /lib/ld-2.19.so
b6f4c000-b6f4e000 rwxp 00000000 00:00 0
b6f4f000-b6f50000 r-xp 00000000 00:00 0        [sigpage]
b6f50000-b6f51000 r-xp 0001e000 00:0b 23281359 /lib/ld-2.19.so
b6f51000-b6f52000 rwxp 0001f000 00:0b 23281359 /lib/ld-2.19.so
beea1000-beec2000 rw-p 00000000 00:00 0        [stack]
ffff0000-ffff1000 r-xp 00000000 00:00 0        [vectors]
```

Hai cột đầu tiên cho thấy địa chỉ ảo bắt đầu và kết thúc và quyền của mỗi ánh xạ. Các quyền được thể hiện ở đây:

- `r`: Đọc
- `w`: Ghi
- `x`: Thực thi
- `s`: Chia sẻ
- `p`: Riêng (copy on write)

Nếu ánh xạ gắn với một file, tên file xuất hiện ở cột cuối cùng, và các cột ba, bốn và năm chứa offset tính từ đầu file, số block device và inode của file. Hầu hết các ánh xạ là tới bản thân chương trình và các thư viện mà nó được link. Có hai vùng mà chương trình có thể cấp phát bộ nhớ, được đánh dấu `[heap]` và `[stack]`. Bộ nhớ được cấp phát bằng malloc đến từ vùng trước (ngoại trừ các cấp phát rất lớn, mà chúng ta sẽ nói tới sau); các cấp phát trên stack đến từ vùng sau. Kích thước tối đa của cả hai vùng được điều khiển bởi `ulimit` của process:

- **Heap**: `ulimit -d`, mặc định không giới hạn
- **Stack**: `ulimit -s`, mặc định 8 MiB

Các cấp phát vượt quá giới hạn bị từ chối bằng `SIGSEGV`.

Khi hết bộ nhớ, kernel có thể quyết định loại bỏ các page được ánh xạ tới một file và là read-only. Nếu page đó được truy cập lại, nó sẽ gây ra một major page fault và được đọc lại từ file.

## Swapping

Ý tưởng của swapping là dành riêng một ít bộ lưu trữ nơi kernel có thể đặt các page bộ nhớ không được ánh xạ tới file, giải phóng bộ nhớ cho các mục đích khác. Nó tăng kích thước hiệu dụng của bộ nhớ vật lý thêm bằng kích thước swap file. Nó không phải thuốc chữa bách bệnh: có cái giá cho việc sao chép page tới và từ swap file, điều trở nên rõ ràng trên một hệ thống có quá ít bộ nhớ thực cho workload nó đang gánh và vì vậy swapping trở thành hoạt động chính. Điều này đôi khi được gọi là **disk thrashing**.

Swap hiếm khi được dùng trên thiết bị nhúng vì nó không hoạt động tốt với bộ lưu trữ flash, nơi việc ghi liên tục sẽ làm mòn nó nhanh chóng. Tuy nhiên, bạn có thể muốn cân nhắc swapping sang RAM nén `(zram)`.

### Swapping sang bộ nhớ nén (zram)

Driver **zram** tạo các block device RAM-based tên `/dev/zram0`, `/dev/zram1`, v.v. Các page được ghi vào các device này được nén trước khi được lưu. Với tỷ lệ nén trong khoảng 30% tới 50%, bạn có thể kỳ vọng tổng bộ nhớ trống tăng khoảng 10% với cái giá là xử lý nhiều hơn và mức tiêu thụ điện tăng tương ứng.

Để enable zram, cấu hình kernel với các tùy chọn sau:

```
CONFIG_SWAP
CONFIG_CGROUP_MEM_RES_CTLR
CONFIG_CGROUP_MEM_RES_CTLR_SWAP
CONFIG_ZRAM
```

Sau đó, mount zram lúc boot bằng cách thêm dòng này vào `/etc/fstab`:

```
/dev/zram0 none swap defaults zramsize=<size in bytes>,
swapprio=<swap partition priority>
```

Bạn có thể bật và tắt swap bằng các lệnh sau:

```
# swapon /dev/zram0
# swapoff /dev/zram0
```

Swapping bộ nhớ ra zram tốt hơn swapping ra bộ lưu trữ flash, nhưng không kỹ thuật nào thay thế được việc có đủ bộ nhớ vật lý.

Các process user space phụ thuộc vào kernel để quản lý virtual memory cho chúng. Đôi khi một chương trình muốn kiểm soát memory map của nó nhiều hơn mức kernel có thể cung cấp. Có một system call cho phép chúng ta ánh xạ bộ nhớ tới một file để truy cập trực tiếp hơn từ user space.

## Ánh xạ bộ nhớ bằng mmap

Một process bắt đầu vòng đời với một lượng bộ nhớ nhất định được ánh xạ tới các segment **text** (code) và **data** của file chương trình, cùng với các shared library mà nó được link. Nó có thể cấp phát bộ nhớ trên heap lúc runtime bằng `malloc(3)` và trên stack qua các biến có phạm vi cục bộ và bộ nhớ được cấp phát qua `alloca(3)`. Nó cũng có thể nạp thư viện động lúc runtime bằng `dlopen(3)`. Tất cả các ánh xạ này đều được kernel lo liệu. Tuy nhiên, một process cũng có thể thao tác memory map của nó một cách tường minh bằng `mmap(2)`:

```
void *mmap(void *addr, size_t length, int prot, int flags,
int fd, off_t offset);
```

Function này ánh xạ `length` byte bộ nhớ từ file có descriptor `fd`, bắt đầu tại `offset` trong file, và trả về một con trỏ tới ánh xạ, giả sử nó thành công. Vì phần cứng bên dưới làm việc theo page, `length` được làm tròn lên số nguyên page gần nhất. Tham số bảo vệ, `prot`, là tổ hợp các quyền đọc, ghi và thực thi và tham số `flags` chứa ít nhất `MAP_SHARED` hoặc `MAP_PRIVATE`. Có nhiều flag khác, được mô tả trong manpage của `mmap`.

Có nhiều điều bạn có thể làm với `mmap`. Tôi sẽ cho thấy một số trong các mục sắp tới.

### Dùng mmap để cấp phát bộ nhớ riêng

Bạn có thể dùng `mmap` để cấp phát một vùng nhớ riêng bằng cách đặt `MAP_ANONYMOUS` trong tham số `flags` và đặt file descriptor `fd` thành `-1`. Điều này tương tự cấp phát bộ nhớ từ heap bằng `malloc`, ngoại trừ việc bộ nhớ được page-aligned và là bội số của page. Bộ nhớ được cấp phát trong cùng vùng với vùng được dùng cho thư viện. Thực ra, vì lý do này một số người gọi vùng này là vùng `mmap`.

Các ánh xạ anonymous tốt hơn cho các cấp phát lớn vì chúng không ghim heap bằng các khối bộ nhớ, điều vốn làm phân mảnh dễ xảy ra hơn. Thú vị là bạn sẽ thấy `malloc` (ít nhất trong `glibc`) ngừng cấp phát bộ nhớ từ heap cho các yêu cầu trên 128 KiB và dùng `mmap` theo cách này, nên trong hầu hết trường hợp, chỉ dùng `malloc` là đúng. Hệ thống sẽ chọn cách tốt nhất để đáp ứng yêu cầu.

### Dùng mmap để chia sẻ bộ nhớ

Như chúng ta đã thấy trong [*Chương 17*](ch17_learning_about_processes_and_threads.vi.md), *Tìm hiểu về process và thread*, POSIX shared memory cần `mmap` để truy cập segment bộ nhớ. Trong trường hợp này, bạn đặt flag `MAP_SHARED` và dùng file descriptor từ `shm_open()`:

```
int shm_fd;
char *shm_p;
shm_fd = shm_open("/myshm", O_CREAT | O_RDWR, 0666);
ftruncate(shm_fd, 65536);
shm_p = mmap(NULL, 65536, PROT_READ | PROT_WRITE,
MAP_SHARED, shm_fd, 0);
```

Một process khác dùng cùng các lời gọi, tên file, độ dài và flag để ánh xạ tới vùng nhớ đó nhằm chia sẻ. Các lời gọi `msync(2)` tiếp theo điều khiển khi nào các cập nhật bộ nhớ được chuyển xuống file bên dưới.

Chia sẻ bộ nhớ qua `mmap` cũng mang lại một cách đơn giản để đọc từ và ghi vào bộ nhớ thiết bị.

### Dùng mmap để truy cập bộ nhớ thiết bị

Như tôi đã đề cập trong [*Chương 11*](ch11_interfacing_with_device_drivers.vi.md), *Giao tiếp với device driver*, một driver có thể cho phép device node của nó được memory map và chia sẻ một phần bộ nhớ thiết bị với một application. Hiện thực chính xác phụ thuộc vào driver.

Một ví dụ là Linux framebuffer, `/dev/fb0`. Các FPGA như dòng Xilinx Zynq cũng được truy cập như bộ nhớ qua `mmap` từ Linux. Giao diện framebuffer được định nghĩa trong `/usr/include/linux/fb.h`, bao gồm một function `ioctl` để lấy kích thước màn hình và số bit mỗi pixel. Sau đó bạn có thể dùng `mmap` để yêu cầu video driver chia sẻ framebuffer với application và đọc ghi pixel:

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

Ví dụ thứ hai là giao diện streaming video, **Video 4 Linux, version 2**, hay **V4L2**, được định nghĩa trong `/usr/include/linux/videodev2.h`. Mỗi thiết bị video có một node tên `/dev/videoN`, bắt đầu với `/dev/video0`. Có một function `ioctl` để yêu cầu driver cấp phát một số video buffer mà bạn có thể `mmap` vào user space. Sau đó, chỉ còn là việc luân chuyển các buffer và điền hoặc lấy dữ liệu video từ chúng, tùy bạn đang phát lại hay đang bắt một video stream.

Giờ chúng ta đã đề cập layout và ánh xạ bộ nhớ, hãy xem mức sử dụng bộ nhớ, bắt đầu với cách đo nó.

## Application của tôi dùng bao nhiêu bộ nhớ?

Giống kernel space, các cách khác nhau để cấp phát, ánh xạ và chia sẻ bộ nhớ user space khiến khá khó trả lời câu hỏi tưởng chừng đơn giản này.

Để bắt đầu, bạn có thể hỏi kernel xem nó nghĩ có bao nhiêu bộ nhớ có sẵn, điều bạn có thể làm bằng lệnh `free`. Đây là một ví dụ điển hình về output:

```
   total used free shared buffers cached
Mem: 509016 504312 4704 0 26456 363860
-/+ buffers/cache: 113996 395020
Swap: 0 0 0
```

Thoạt nhìn, đây có vẻ là một hệ thống gần như hết bộ nhớ với chỉ 4,704 KiB trống trên 509,016 KiB: chưa tới 1%. Tuy nhiên, lưu ý rằng 26,456 KiB nằm trong buffer và tới 363,860 KiB nằm trong cache. Linux tin rằng bộ nhớ trống là bộ nhớ lãng phí; kernel dùng bộ nhớ trống cho buffer và cache với hiểu biết rằng chúng có thể được thu nhỏ khi cần. Loại buffer và cache khỏi phép đo cho ra bộ nhớ trống thực sự, là 395,020 KiB: 77% tổng số. Khi dùng `free`, các con số trên dòng thứ hai được đánh dấu `-/+ buffers/cache` là những con số quan trọng.

Bạn có thể buộc kernel giải phóng cache bằng cách ghi một số từ 1 tới 3 vào `/proc/sys/vm/drop_caches`:

```
# echo 3 > /proc/sys/vm/drop_caches
```

Con số thực ra là một bitmask xác định loại nào trong hai loại cache lớn bạn muốn giải phóng: `1` cho page cache và `2` cho dentry cache và inode cache gộp lại. Vì `1` và `2` là các bit khác nhau, ghi `3` sẽ giải phóng cả hai loại cache. Vai trò chính xác của các cache này không đặc biệt quan trọng ở đây, chỉ cần biết rằng có bộ nhớ mà kernel đang dùng nhưng có thể được thu hồi ngay khi cần.

Lệnh `free` cho chúng ta biết bao nhiêu bộ nhớ đang được dùng và bao nhiêu còn lại. Nó không cho chúng ta biết process nào đang dùng bộ nhớ không có sẵn đó và theo tỷ lệ nào. Để đo điều đó, chúng ta cần các công cụ khác.

## Mức sử dụng bộ nhớ Per-process

Có vài chỉ số để đo lượng bộ nhớ một process đang dùng. Tôi sẽ bắt đầu với hai chỉ số dễ lấy nhất: **virtual set size** (**VSS**) và **resident set size** (**RSS**), cả hai đều có sẵn trong hầu hết các hiện thực của lệnh `ps` và `top`:

- **VSS**: Được gọi là VSZ trong lệnh `ps` và VIRT trong `top`, đây là tổng lượng bộ nhớ được một process ánh xạ. Nó là tổng của tất cả các vùng được hiển thị trong `/proc/<PID>/maps`. Con số này ít được quan tâm vì chỉ một phần virtual memory được commit vào bộ nhớ vật lý tại bất kỳ thời điểm nào.
- **RSS**: Được gọi là RSS trong `ps` và RES trong `top`, đây là tổng bộ nhớ được ánh xạ tới các page bộ nhớ vật lý. Con số này gần hơn với ngân sách bộ nhớ thực tế của process, nhưng có một vấn đề: nếu bạn cộng RSS của tất cả các process, bạn sẽ có một ước lượng cao hơn thực tế về bộ nhớ đang dùng vì một số page sẽ được chia sẻ.

Hãy tìm hiểu thêm về các lệnh `top` và `ps`.

### Dùng top và ps

Các phiên bản `top` và `ps` từ BusyBox cung cấp thông tin rất hạn chế. Các ví dụ sau dùng phiên bản đầy đủ từ package `procps`.

Lệnh `ps` hiển thị **VSS** `(VSZ)` **và RSS** `(RSS)` với các tùy chọn `-Aly`, hoặc bạn có thể dùng một định dạng tùy biến bao gồm `vsz` và `rss`, như được thể hiện ở đây:

```
# ps -eo pid,tid,class,rtprio,stat,vsz,rss,comm
PID TID CLS RTPRIO STAT VSZ RSS COMMAND
1   1   TS -Ss 4496 2652 systemd
[…]
205 205 TS -Ss 4076 1296 systemd-journal
228 228 TS -Ss 2524 1396 udevd
581 581 TS -Ss 2880 1508 avahi-daemon
584 584 TS -Ss 2848 1512 dbus-daemon
590 590 TS -Ss 1332 680  acpid
594 594 TS -Ss 4600 1564 wpa_supplicant
```

Tương tự, `top` hiển thị tóm tắt về bộ nhớ trống và mức sử dụng bộ nhớ per process:

```
top - 21:17:52 up 10:04, 1 user, load average: 0.00, 0.01, 0.05
Tasks: 96 total, 1 running, 95 sleeping, 0 stopped, 0 zombie
%Cpu(s): 1.7 us, 2.2 sy, 0.0 ni, 95.9 id, 0.0 wa, 0.0 hi
KiB Mem: 509016 total, 278524 used, 230492 free, 25572 buffers
KiB Swap: 0 total, 0 used, 0 free, 170920 cached
PID USER PR NI VIRT RES SHR S %CPU %MEM TIME+ COMMAND
595 root 20 0 64920 9.8m 4048 S 0.0 2.0 0:01.09 node
866 root 20 0 28892 9152 3660 S 0.2 1.8 0:36.38 Xorg
[…]
```

Các lệnh đơn giản này cho bạn cảm nhận về mức sử dụng bộ nhớ và cung cấp dấu hiệu đầu tiên rằng bạn có memory leak khi thấy RSS của một process cứ tăng mãi. Tuy nhiên, chúng không chính xác lắm trong các phép đo tuyệt đối về mức sử dụng bộ nhớ.

### Dùng smem

Năm 2009, Matt Mackall bắt đầu xem xét vấn đề tính toán các page được chia sẻ trong việc đo bộ nhớ process và đã thêm hai chỉ số mới gọi là **unique set size**, hay **USS**, và **proportional set size**, hay **PSS**:

- **USS**: Đây là lượng bộ nhớ được commit vào bộ nhớ vật lý và là duy nhất của một process; nó không được chia sẻ với process nào khác. Đây là lượng bộ nhớ sẽ được giải phóng nếu process kết thúc.
- **PSS**: Chỉ số này chia việc tính các page được chia sẻ đã commit vào bộ nhớ vật lý giữa tất cả các process có ánh xạ chúng. Chẳng hạn, nếu một vùng code thư viện dài 12 page và được sáu process chia sẻ, mỗi process sẽ tích lũy hai page trong PSS. Vì vậy, nếu bạn cộng các số PSS của tất cả process, bạn sẽ có lượng bộ nhớ thực tế đang được các process đó dùng. Nói cách khác, PSS là con số chúng ta đang tìm.

Thông tin về PSS có trong `/proc/<PID>/smaps`, file chứa thông tin bổ sung cho mỗi ánh xạ được hiển thị trong `/proc/<PID>/maps`. Đây là một phần của một file như vậy cung cấp thông tin về ánh xạ cho code segment của `libc`:

```
b6e6d000-b6f45000 r-xp 00000000 b3:02 2444 /lib/libc-2.13.so
Size: 864 kB
Rss: 264 kB
Pss: 6 kB
Shared_Clean: 264 kB
Shared_Dirty: 0 kB
Private_Clean: 0 kB
Private_Dirty: 0 kB
Referenced: 264 kB
Anonymous: 0 kB
AnonHugePages: 0 kB
Swap: 0 kB
KernelPageSize: 4 kB
MMUPageSize: 4 kB
Locked: 0 kB
VmFlags: rd ex mr mw me
```

Lưu ý rằng RSS là 264 KiB, nhưng vì nó được chia sẻ giữa nhiều process khác, PSS chỉ là 6 KiB.

Có một công cụ tên **smem** đối chiếu thông tin từ các file `smaps` và trình bày theo nhiều cách khác nhau, bao gồm dưới dạng biểu đồ tròn hoặc biểu đồ cột. Trang project của smem là [https://www.selenic.com/smem/](https://www.selenic.com/smem/). Nó có sẵn dưới dạng package trong hầu hết các bản phân phối desktop. Tuy nhiên, vì nó được viết bằng Python, cài nó trên một target nhúng cần một môi trường Python, điều có thể quá phiền phức chỉ cho một công cụ. Để giúp việc này, có một chương trình nhỏ tên **smemcap** bắt trạng thái từ `/proc` trên target và lưu nó vào một file TAR có thể được phân tích sau trên máy host. Nó là một phần của BusyBox, nhưng cũng có thể được biên dịch từ source `smem`.

Chạy `smem` native, với tư cách `root`, bạn sẽ thấy các kết quả này:

```
# smem -t
PID User Command Swap USS PSS RSS
610 0 /sbin/agetty -s ttyO0 11 0 128 149 720
1236 0 /sbin/agetty -s ttyGS0 1 0 128 149 720
609 0 /sbin/agetty tty1 38400 0 144 163 724
578 0 /usr/sbin/acpid 0 140 173 680
819 0 /usr/sbin/cron 0 188 201 704
634 103 avahi-daemon: chroot hel 0 112 205 500
980 0 /usr/sbin/udhcpd -S /etc 0 196 205 568
[...]
836 0 /usr/bin/X :0 -auth /var 0 7172 7746 9212
583 0 /usr/bin/node autorun.js 0 8772 9043 10076
1089 1000 /usr/bin/python -O /usr/ 0 9600 11264 16388
--------------------------------------------------------------
53 6 0 65820 78251 146544
```

Bạn có thể thấy từ dòng cuối của output rằng trong trường hợp này, tổng PSS khoảng một nửa RSS.

Nếu bạn không có hoặc không muốn cài Python trên target, bạn có thể bắt trạng thái bằng `smemcap`, lại với tư cách `root`:

```
# smemcap > smem-bbb-cap.tar
```

Sau đó, sao chép file TAR sang host và đọc nó bằng `smem -S`, dù lần này không cần chạy với tư cách `root`:

```
$ smem -t -S smem-bbb-cap.tar
```

Output giống hệt output chúng ta có khi chạy `smem` native.

### Các công cụ khác cần cân nhắc

Một cách khác để hiển thị PSS là qua **ps_mem** ([https://github.com/pixelb/ps_mem](https://github.com/pixelb/ps_mem)), công cụ in ra gần như cùng thông tin nhưng theo định dạng đơn giản hơn. Nó cũng được viết bằng Python.

Android cũng có một công cụ hiển thị tóm tắt USS và PSS cho mỗi process, tên **procrank**, có thể được cross-compiled cho embedded Linux với vài thay đổi nhỏ. Bạn có thể lấy code từ [https://github.com/csimmonds/procrank_linux](https://github.com/csimmonds/procrank_linux).

Giờ chúng ta đã biết cách đo mức sử dụng bộ nhớ per-process. Giả sử chúng ta dùng các công cụ vừa trình bày để tìm process ngốn bộ nhớ trong hệ thống. Làm sao để đi sâu vào process đó để tìm ra nó sai ở đâu? Đó là chủ đề của mục tiếp theo.

## Nhận diện memory leak

Memory leak xảy ra khi bộ nhớ được cấp phát nhưng không được giải phóng khi không còn cần. Rò rỉ bộ nhớ không hề là đặc thù của hệ thống nhúng, nhưng nó trở thành vấn đề một phần vì target vốn không có nhiều bộ nhớ ngay từ đầu và một phần vì chúng thường chạy trong thời gian dài mà không reboot, khiến các chỗ rò rỉ trở thành một vũng lớn.

Bạn sẽ nhận ra có rò rỉ khi chạy `free` hoặc `top` và thấy bộ nhớ trống liên tục giảm ngay cả khi bạn drop cache, như được thể hiện ở mục trước. Bạn sẽ có thể nhận diện thủ phạm (hoặc các thủ phạm) bằng cách xem USS và RSS per process.

Có vài công cụ để nhận diện memory leak trong một chương trình. Tôi sẽ xem hai công cụ: `mtrace` và `valgrind`.

### mtrace

**mtrace** là một component của `glibc` theo dõi các lời gọi tới `malloc`, `free` và các function liên quan, và nhận diện các vùng nhớ không được giải phóng khi chương trình thoát. Bạn cần gọi function `mtrace()` từ bên trong chương trình để bắt đầu theo dõi và rồi lúc runtime, ghi một đường dẫn vào biến môi trường `MALLOC_TRACE`, nơi thông tin trace được ghi vào. Nếu `MALLOC_TRACE` không tồn tại hoặc nếu file không thể được mở, các hook `mtrace` không được cài. Dù thông tin trace được ghi bằng ASCII, thông thường người ta dùng lệnh `mtrace` để xem nó.

Đây là một ví dụ:

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
    Address Size Caller
0x0000000001479460 0x64 at /home/chris/mtrace-example.c:11
0x00000000014794d0 0x64 at /home/chris/mtrace-example.c:11
0x0000000001479540 0x100 at /home/chris/mtrace-example.c:15
```

Đáng tiếc, `mtrace` không cho bạn biết về bộ nhớ bị rò rỉ trong khi chương trình chạy. Chương trình phải kết thúc trước.

### Valgrind

**Valgrind** là một công cụ rất mạnh được dùng để phát hiện các vấn đề bộ nhớ bao gồm rò rỉ và những thứ khác. Một ưu điểm là bạn không phải biên dịch lại các chương trình và thư viện bạn muốn kiểm tra, dù nó hoạt động tốt hơn nếu chúng đã được biên dịch với tùy chọn `-g` để chúng chứa bảng debug symbol. Nó hoạt động bằng cách chạy chương trình trong một môi trường giả lập và bẫy việc thực thi tại các điểm khác nhau. Điều này dẫn tới nhược điểm lớn của Valgrind, đó là chương trình chạy chỉ bằng một phần nhỏ tốc độ bình thường, khiến nó ít hữu ích hơn khi test bất cứ thứ gì có ràng buộc real-time.

> **Lưu ý quan trọng**
>
> Nhân tiện, cái tên thường bị phát âm sai: Valgrind FAQ nói rằng phần grind được phát âm với âm *i* ngắn, như trong grinned (vần với tinned) chứ không như grind (vần với find). FAQ, tài liệu và bản tải về có tại [https://valgrind.org](https://valgrind.org).

Valgrind chứa vài công cụ chẩn đoán:

- `memcheck`: Đây là công cụ mặc định, và nó phát hiện memory leak và việc dùng sai bộ nhớ nói chung.
- `cachegrind`: Công cụ này tính tỷ lệ hit của processor cache.
- `callgrind`: Công cụ này tính chi phí của mỗi lời gọi function.
- `helgrind`: Công cụ này làm nổi bật việc dùng sai Pthread API, bao gồm các deadlock tiềm ẩn và race condition.
- `DRD`: Đây là một công cụ phân tích Pthread khác.
- `massif`: Công cụ này profile việc sử dụng heap và stack.

Bạn có thể chọn công cụ mình muốn bằng tùy chọn `-tool`. Valgrind chạy trên các nền tảng nhúng chính: Arm (Cortex-A), PowerPC, MIPS và x86 ở các biến thể 32-bit và 64-bit. Nó có sẵn dưới dạng package trong cả Yocto Project và Buildroot.

Để tìm memory leak của chúng ta, chúng ta cần dùng công cụ `memcheck` mặc định, với tùy chọn `-–leak-check=full` để in ra các dòng nơi tìm thấy rò rỉ:

```
$ valgrind --leak-check=full ./mtrace-example
==17235== Memcheck, a memory error detector
==17235== Copyright (C) 2002-2013, and GNU GPL'd, by Julian Seward et al.==17235==Using Valgrind-3.10.0.SVN and LibVEX; rerun with -h for copyright info
==17235== Command: ./mtrace-example
==17235==
==17235==
==17235== HEAP SUMMARY:
==17235== in use at exit: 456 bytes in 3 blocks
==17235== total heap usage: 3 allocs, 0 frees, 456 bytes allocated
==17235==
==17235== 200 bytes in 2 blocks are definitely lost in loss record
1 of 2==17235== at 0x4C2AB80: malloc (in /usr/lib/valgrind/vgpreload_memcheck-linux.so)
==17235== by 0x4005FA: main (mtrace-example.c:12)
==17235==
==17235== 256 bytes in 1 blocks are definitely lost in loss record
2 of 2==17235== at 0x4C2CC70: calloc (in /usr/lib/valgrind/vgpreload memcheck-linux so)
==17235== by 0x400613: main (mtrace-example.c:14)
==17235==
==17235== LEAK SUMMARY:
==17235== definitely lost: 456 bytes in 3 blocks
==17235== indirectly lost: 0 bytes in 0 blocks
==17235== possibly lost: 0 bytes in 0 blocks
==17235== still reachable: 0 bytes in 0 blocks
==17235== suppressed: 0 bytes in 0 blocks
==17235==
==17235== For counts of detected and suppressed errors, rerun with: -v==17235== ERROR SUMMARY: 2 errors from 2 contexts (suppressed: 0 from 0)
```

Output từ Valgrind cho thấy hai memory leak được tìm thấy trong `mtrace-example.c`: một `malloc` ở dòng 12 và một `calloc` ở dòng 14. Các lời gọi `free` tương ứng lẽ ra phải đi kèm hai lần cấp phát bộ nhớ này bị thiếu trong chương trình. Nếu không được kiểm soát, memory leak trong một process long-running cuối cùng có thể dẫn tới hệ thống hết bộ nhớ.

## Hết bộ nhớ

Chính sách cấp phát bộ nhớ tiêu chuẩn là **over-commit**, nghĩa là kernel sẽ cho phép các application cấp phát nhiều bộ nhớ hơn lượng bộ nhớ vật lý có. Hầu hết thời gian, điều này hoạt động tốt vì các application thường yêu cầu nhiều bộ nhớ hơn mức thực sự cần. Điều này cũng giúp ích cho việc hiện thực `fork(2)`: an toàn khi tạo một bản sao của một chương trình lớn vì các page bộ nhớ được chia sẻ với flag copy on write được đặt. Trong đa số trường hợp, `fork` được theo sau bởi một lời gọi function `exec`, lời gọi này bỏ chia sẻ bộ nhớ rồi nạp một chương trình mới.

Tuy nhiên, luôn có khả năng một workload cụ thể sẽ khiến một nhóm process cố đòi lấy cùng lúc các cấp phát mà chúng đã được hứa và vì vậy đòi hỏi nhiều hơn lượng thực sự có. Đây là một tình huống **out of memory**, hay **OOM**. Tại thời điểm này, không còn cách nào khác ngoài kill các process cho đến khi vấn đề biến mất. Đây là công việc của **out of memory killer**.

Trước khi tới đó, có một tham số tinh chỉnh cho các cấp phát kernel trong `/proc/sys/vm/overcommit_memory`, mà bạn có thể đặt thành:

- `0`: over-commit theo heuristic
- `1`: Luôn over-commit; không bao giờ kiểm tra
- `2`: Luôn kiểm tra; không bao giờ over-commit

Tùy chọn `0` là mặc định và là lựa chọn tốt nhất trong đa số trường hợp.

Tùy chọn `1` chỉ thực sự hữu ích nếu bạn chạy các chương trình làm việc với các mảng thưa lớn và cấp phát các vùng nhớ lớn nhưng chỉ ghi vào một phần nhỏ trong đó. Các chương trình như vậy hiếm gặp trong bối cảnh hệ thống nhúng.

Tùy chọn `2`, không bao giờ over-commit, có vẻ là một lựa chọn tốt nếu bạn lo lắng về việc hết bộ nhớ, có lẽ trong một application quan trọng về nhiệm vụ (mission) hay safety-critical. Nó sẽ làm thất bại các cấp phát lớn hơn commit limit, là kích thước swap space cộng với tổng bộ nhớ nhân với overcommit ratio. Tỷ lệ over-commit được điều khiển bởi `/proc/sys/vm/overcommit_ratio` và có giá trị mặc định là 50%.

Làm ví dụ, giả sử bạn có một thiết bị với 512 MB RAM hệ thống và bạn đặt một tỷ lệ thực sự thận trọng là 25%:

```
# echo 25 > /proc/sys/vm/overcommit_ratio
# grep -e MemTotal -e CommitLimit /proc/meminfo
MemTotal: 509016 kB
CommitLimit: 127252 kB
```

Không có swap, nên commit limit là 25% của `MemTotal`, đúng như dự kiến.

Có một biến quan trọng khác trong `/proc/meminfo`, gọi là `Committed_AS`. Đây là tổng lượng bộ nhớ cần để đáp ứng tất cả các cấp phát đã được thực hiện cho đến giờ. Tôi đã thấy như sau trên một hệ thống:

```
# grep -e MemTotal -e Committed_AS /proc/meminfo
MemTotal: 509016 kB
Committed_AS: 741364 kB
```

Nói cách khác, kernel đã hứa nhiều bộ nhớ hơn lượng bộ nhớ có sẵn. Do đó, đặt `overcommit_memory` thành `2` sẽ có nghĩa là mọi cấp phát sẽ thất bại bất kể `overcommit_ratio`. Để có một hệ thống hoạt động, tôi sẽ phải hoặc lắp gấp đôi lượng RAM hoặc giảm mạnh số process đang chạy, vốn khoảng 40 process.

Trong mọi trường hợp, tuyến phòng thủ cuối cùng là `oom-killer`. Nó dùng một phương pháp heuristic để tính một điểm badness từ 0 tới 1,000 cho mỗi process rồi kết thúc những process có điểm cao nhất cho đến khi có đủ bộ nhớ trống. Bạn sẽ thấy đại loại như thế này trong kernel log:

```
[44510.490320] eatmem invoked oom-killer: gfp_mask=0x200da,
order=0, oom_score_adj=0
...
```

Bạn có thể ép một sự kiện OOM bằng `echo f > /proc/sysrq-trigger`.

Bạn có thể tác động tới điểm badness của một process bằng cách ghi một giá trị điều chỉnh vào `/proc/<PID>/oom_score_adj`. Giá trị `-1000` có nghĩa là điểm badness không bao giờ có thể lớn hơn không và vì vậy process sẽ không bao giờ bị kill; giá trị `+1000` có nghĩa là nó sẽ luôn lớn hơn 1,000 và vì vậy process sẽ luôn bị kill.

## Tóm tắt

Tính toán từng byte bộ nhớ được dùng trong một hệ thống virtual memory đơn giản là không thể. Tuy nhiên, bạn có thể tìm một con số khá chính xác cho tổng lượng bộ nhớ trống, trừ phần bị buffer và cache chiếm, bằng lệnh `free`. Bằng cách giám sát nó trong một khoảng thời gian và với các workload khác nhau, bạn sẽ tự tin rằng nó sẽ giữ trong một giới hạn cho trước.

Khi bạn muốn tinh chỉnh mức sử dụng bộ nhớ hoặc nhận diện nguồn gốc của các cấp phát bất ngờ, có những tài nguyên cung cấp thông tin chi tiết hơn. Với kernel space, thông tin hữu ích nhất nằm trong `/proc`: `meminfo`, `slabinfo` và `vmallocinfo`.

Khi cần các phép đo chính xác cho user space, chỉ số tốt nhất là PSS, như được `smem` và các công cụ khác hiển thị. Để debug bộ nhớ, bạn có thể nhờ tới các tracer đơn giản như `mtrace`, hoặc bạn có lựa chọn hạng nặng là công cụ `memcheck` của Valgrind.

Nếu bạn lo ngại về hệ quả của một tình huống OOM, bạn có thể fine-tune cơ chế cấp phát qua `/proc/sys/vm/overcommit_memory` và bạn có thể điều khiển khả năng các process cụ thể bị kill qua tham số `oom_score_adj`.

Chương tiếp theo hoàn toàn nói về debug code user space và kernel bằng GNU debugger và những hiểu biết bạn có thể thu được từ việc quan sát code khi nó chạy, bao gồm các function quản lý bộ nhớ mà tôi đã mô tả ở đây.

## Đọc thêm

Các tài liệu sau có thêm thông tin về các chủ đề đã được giới thiệu trong chương này:

- *Linux Kernel Development*, *3rd Edition*, của Robert Love
- *Linux System Programming*, *2nd Edition*, của Robert Love
- *Understanding the Linux VM Manager* của Mel Gorman: [https://www.kernel.org/doc/gorman/pdf/understand.pdf](https://www.kernel.org/doc/gorman/pdf/understand.pdf)
- *Valgrind 3.3 - Advanced Debugging and Profiling for Gnu/Linux Applications* của J Seward, N. Nethercote và J. Weidendorfer
