# Chương 11. Quản lý memory

Chương này trình bày các vấn đề memory management, chủ đề quan trọng cho mọi hệ thống Linux, đặc biệt embedded Linux nơi system memory thường hạn chế. Sau khi ôn ngắn về virtual memory, tôi chỉ cách đo memory usage, phát hiện vấn đề memory allocation gồm memory leak, và điều xảy ra khi hết memory. Bạn cần hiểu công cụ sẵn có, từ công cụ đơn giản như `free`, `top` đến công cụ phức tạp như mtrace, Valgrind.

## Cơ bản về virtual memory

Nhắc lại, Linux cấu hình memory management unit của CPU để cung cấp virtual address space cho chương trình đang chạy, bắt đầu từ zero và kết thúc ở địa chỉ cao nhất, `0xffffffff` trên processor 32-bit. Address space chia thành page 4 KiB (hiếm có hệ thống dùng page size khác).

Linux chia virtual address space thành vùng cho ứng dụng gọi user space và vùng cho kernel gọi kernel space. Điểm chia được đặt bằng tham số cấu hình kernel `PAGE_OFFSET`. Trong embedded system 32-bit điển hình, `PAGE_OFFSET` là `0xc0000000`, dành ba GiB thấp cho user space và một GiB cao cho kernel space. User address space được cấp phát theo process để mỗi process chạy trong sandbox, tách khỏi process khác. Kernel address space giống nhau cho mọi process: chỉ có một kernel.

Page trong virtual address space được memory management unit (MMU) map sang physical address, dùng page table để mapping.

Mỗi page virtual memory có thể:

- Chưa map, truy cập gây `SIGSEGV`

- Map tới page physical memory riêng của process

- Map tới page physical memory chia sẻ với process khác

- Map và chia sẻ với flag `copy on write`: thao tác ghi bị trap vào kernel, kernel sao chép page và map bản sao vào process thay page gốc trước khi cho ghi

- Map tới page physical memory do kernel sử dụng

Kernel còn có thể map page tới reserved memory region, ví dụ để truy cập register và buffer memory trong device driver.

Câu hỏi hiển nhiên là vì sao làm như vậy thay vì tham chiếu physical memory trực tiếp như RTOS thông thường?

Virtual memory có nhiều ưu điểm, một số được mô tả ở đây:

- Truy cập memory không hợp lệ bị trap và ứng dụng được báo bằng `SIGSEGV`

- Process chạy trong memory space riêng, cách ly khỏi process khác

- Dùng memory hiệu quả bằng chia sẻ code, data chung, ví dụ trong library

- Có thể tăng lượng physical memory biểu kiến bằng thêm swap file, dù swapping trên embedded target hiếm gặp

Đây là lập luận mạnh, nhưng cũng phải thừa nhận một số nhược điểm. Khó xác định memory budget thực tế của ứng dụng, một mối quan tâm chính của chương. Chiến lược allocation mặc định là over-commit, dẫn đến tình huống out-of-memory khó xử lý, cũng sẽ bàn sau. Cuối cùng, độ trễ do code memory management xử lý exception – page fault – khiến hệ thống kém deterministic hơn, quan trọng với chương trình real-time. Tôi sẽ trình bày trong Chương 14, Lập trình Real-time.

Memory management khác nhau giữa kernel space và user space. Các phần sau mô tả khác biệt cốt yếu và điều cần biết.

## Bố cục memory kernel space

Kernel memory được quản lý tương đối trực tiếp. Nó không demand-paged, nghĩa là mọi allocation dùng `kmalloc()` hay hàm tương tự đều có physical memory thật. Kernel memory không bao giờ bị loại bỏ hay paged out. Một số kiến trúc hiển thị tổng hợp memory mapping khi boot trong kernel log. Trace này lấy từ thiết bị ARM 32-bit (BeagleBone Black):

```
Memory: 511MB = 511MB total
Memory: 505980k/505980k available, 18308k reserved, 0K highmem
Virtual kernel memory layout:
  vector  : 0xffff0000 - 0xffff1000   (   4 kB)
  fixmap  : 0xfff00000 - 0xfffe0000   ( 896 kB)
  vmalloc : 0xe0800000 - 0xff000000   ( 488 MB)
  lowmem  : 0xc0000000 - 0xe0000000   ( 512 MB)
  pkmap   : 0xbfe00000 - 0xc0000000   (   2 MB)
  modules : 0xbf800000 - 0xbfe00000   (   6 MB)
    .text : 0xc0008000 - 0xc0763c90   (7536 kB)
    .init : 0xc0764000 - 0xc079f700   ( 238 kB)
    .data : 0xc07a0000 - 0xc0827240   ( 541 kB)
     .bss : 0xc0827240 - 0xc089e940   ( 478 kB)
```

Con số 505980 KiB available là free memory kernel thấy khi bắt đầu thực thi nhưng trước khi bắt đầu dynamic allocation.

Các thành phần dùng memory kernel-space gồm:

- Chính kernel, nghĩa là code và data nạp từ kernel image file khi boot. Trong code trên, chúng ở segment `.text`, `.init`, `.data`, `.bss`. Segment `.init` được giải phóng khi kernel khởi tạo xong.

- Memory cấp phát qua slab allocator, dùng cho nhiều loại kernel data structure. Gồm allocation bằng `kmalloc()`. Chúng đến từ vùng `lowmem`.

- Memory cấp phát qua `vmalloc()`, thường cho khối memory lớn hơn khả năng `kmalloc()`. Chúng nằm trong vùng vmalloc.

- Mapping để device driver truy cập register và memory thuộc hardware, có thể thấy bằng đọc `/proc/iomem`. Chúng đến từ vùng vmalloc nhưng vì map tới physical memory ngoài main system memory nên không chiếm memory thực của hệ thống.

- Kernel module, nạp vào vùng đánh dấu modules.

- Allocation cấp thấp khác không được theo dõi nơi nào khác.

### Kernel dùng bao nhiêu memory?

Tiếc rằng không có câu trả lời hoàn chỉnh, nhưng phần sau là gần nhất có thể.

Đầu tiên, có thể xem memory do code và data kernel chiếm trong kernel log đã nêu, hoặc dùng lệnh `size` như sau:

```
$ arm-poky-linux-gnueabi-size vmlinux
text      data     bss       dec       hex       filename
9013448   796868   8428144   18238460  1164bfc   vmlinux
```

Thông thường kích thước nhỏ so với tổng memory. Nếu không, cần xem cấu hình kernel và loại bỏ thành phần không cần. Có nỗ lực đang diễn ra để cho phép build kernel nhỏ: tìm Linux-tiny hoặc Linux Kernel Tinification. Trang dự án cho nỗ lực sau là `https://tiny.wiki.kernel.org/`.

Có thể lấy thêm thông tin memory usage bằng đọc `/proc/meminfo`:

```
# cat /proc/meminfo
MemTotal:         509016 kB
MemFree:          410680 kB
Buffers:            1720 kB
Cached:            25132 kB
SwapCached:            0 kB
Active:            74880 kB
Inactive:           3224 kB
Active(anon):      51344 kB
Inactive(anon):     1372 kB
Active(file):      23536 kB
Inactive(file):     1852 kB
Unevictable:           0 kB
Mlocked:               0 kB
HighTotal:             0 kB
HighFree:              0 kB
LowTotal:         509016 kB
LowFree:          410680 kB
SwapTotal:             0 kB
SwapFree:              0 kB
Dirty:                16 kB
Writeback:             0 kB
AnonPages:         51248 kB
Mapped:            24376 kB
Shmem:              1452 kB
Slab:              11292 kB
SReclaimable:       5164 kB
SUnreclaim:         6128 kB
KernelStack:        1832 kB
PageTables:         1540 kB
NFS_Unstable:          0 kB
Bounce:                0 kB
WritebackTmp:          0 kB
CommitLimit:      254508 kB
Committed_AS:     734936 kB
VmallocTotal:     499712 kB
VmallocUsed:       29576 kB
VmallocChunk:     389116 kB
```

Man page `proc(5)` mô tả từng field. Kernel memory usage là tổng:

- Slab: Tổng memory do slab allocator cấp phát

- KernelStack: Stack space dùng khi thực thi kernel code

- PageTables: Memory lưu page table

- VmallocUsed: Memory cấp phát bằng `vmalloc()`

Với slab allocation, lấy thêm thông tin bằng đọc `/proc/slabinfo`. Tương tự, có phân tích allocation trong `/proc/vmallocinfo` cho vùng vmalloc. Cả hai trường hợp đều cần hiểu chi tiết kernel và subsystem để thấy chính xác subsystem nào allocation và vì sao, nằm ngoài phạm vi thảo luận.

Với module, có thể dùng `lsmod` tìm memory space do code và data chiếm:

```
# lsmod
Module            Size  Used by
g_multi          47670  2
libcomposite     14299  1 g_multi
mt7601Usta       601404  0
```

Còn lại allocation cấp thấp không có ghi nhận, ngăn chúng ta thống kê chính xác memory usage kernel space. Chúng xuất hiện như memory thiếu khi cộng mọi allocation kernel và user space đã biết.

## Bố cục memory user space

Linux dùng chiến lược lazy allocation cho user space, chỉ map physical page khi chương trình truy cập. Ví dụ, cấp phát buffer 1 MiB bằng `malloc(3)` trả pointer đến khối memory address nhưng chưa có physical memory thực. Flag được đặt trong page table entry để mọi truy cập đọc ghi bị kernel trap. Đây gọi là page fault. Chỉ lúc đó kernel mới thử tìm page physical memory và thêm vào page table mapping của process. Nên minh họa bằng chương trình đơn giản như sau:

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
    printf ("Major page faults %ld\n", usage.ru_majflt);
    printf ("Minor page faults %ld\n", usage.ru_minflt);
  }
}

int main (int argc, char *argv[])
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

Khi chạy, bạn thấy nội dung tương tự:

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

Có 172 minor page fault khi khởi tạo environment chương trình, và thêm 14 khi gọi `getrusage(2)` (số này thay đổi theo kiến trúc và phiên bản C library). Phần quan trọng là mức tăng khi điền dữ liệu vào memory: 442 – 186 = 256. Buffer 1 MiB, tức 256 page. Lần gọi `memset(3)` thứ hai không làm khác biệt vì mọi page đã map.

Như thấy, page fault sinh ra khi kernel trap truy cập page chưa map. Thực tế có hai loại page fault: minor và major. Với minor fault, kernel chỉ cần tìm page physical memory và map vào process address space như code trên. Major page fault xảy ra khi virtual memory map tới file, ví dụ bằng `mmap(2)`, sẽ mô tả ngay sau. Đọc memory này nghĩa là kernel không chỉ tìm page memory và map, mà còn phải điền dữ liệu từ file. Vì vậy major fault tốn thời gian và system resource hơn nhiều.

## Process memory map

Có thể xem memory map process qua filesystem `proc`. Ví dụ, đây là map của process `init`, PID 1:

```
# cat /proc/1/maps
00008000-0000e000 r-xp 00000000 00:0b 23281745   /sbin/init
00016000-00017000 rwxp 00006000 00:0b 23281745   /sbin/init
00017000-00038000 rwxp 00000000 00:00 0          [heap]
b6ded000-b6f1d000 r-xp 00000000 00:0b 23281695   /lib/libc-2.19.so
b6f1d000-b6f24000 ---p 00130000 00:0b 23281695   /lib/libc-2.19.so
b6f24000-b6f26000 r-xp 0012f000 00:0b 23281695   /lib/libc-2.19.so
b6f26000-b6f27000 rwxp 00131000 00:0b 23281695   /lib/libc-2.19.so
b6f27000-b6f2a000 rwxp 00000000 00:00 0
b6f2a000-b6f49000 r-xp 00000000 00:0b 23281359   /lib/ld-2.19.so
b6f4c000-b6f4e000 rwxp 00000000 00:00 0
b6f4f000-b6f50000 r-xp 00000000 00:00 0          [sigpage]
b6f50000-b6f51000 r-xp 0001e000 00:0b 23281359   /lib/ld-2.19.so
b6f51000-b6f52000 rwxp 0001f000 00:0b 23281359   /lib/ld-2.19.so
beea1000-beec2000 rw-p 00000000 00:00 0          [stack]
ffff0000-ffff1000 r-xp 00000000 00:00 0          [vectors]
```

Ba cột đầu cho biết virtual address đầu, cuối và permission mỗi mapping. Permission như sau:

- `r` = read

- `w` = write

- `x` = execute

- `s` = shared

- `p` = private (copy on write)

Nếu mapping gắn với file, filename xuất hiện cột cuối; cột bốn, năm, sáu chứa offset từ đầu file, block device number và inode của file. Phần lớn mapping tới chính chương trình và library được link. Có hai vùng cho chương trình allocation, đánh dấu `[heap]` và `[stack]`. Memory cấp bằng `malloc(3)` đến từ vùng đầu (trừ allocation rất lớn sẽ nói sau); allocation trên stack từ vùng sau. Kích thước tối đa cả hai do `ulimit` của process điều khiển:

- heap: `ulimit -d`, mặc định không giới hạn

- stack: `ulimit -s`, mặc định 8 MiB

Allocation vượt giới hạn bị từ chối bằng `SIGSEGV`.

Khi gần hết memory, kernel có thể quyết định loại bỏ page map tới file và read-only. Nếu truy cập lại page đó, nó gây major page fault và được đọc lại từ file.

## Swap

Ý tưởng swapping là dành storage nơi kernel đặt page memory không map tới file, để giải phóng memory cho việc khác. Nó tăng kích thước physical memory hiệu dụng bằng kích thước swap file. Đây không phải thuốc chữa mọi bệnh: sao chép page đến và từ swap file có chi phí, lộ rõ khi hệ thống quá ít memory thật cho workload và bắt đầu disk thrashing.

Swap ít dùng trên thiết bị embedded vì không hoạt động tốt với flash storage, nơi ghi liên tục làm mòn nhanh. Tuy nhiên có thể cân nhắc swap tới compressed RAM (zram).

### Swap tới compressed memory (zram)

Driver zram tạo block device RAM-based tên `/dev/zram0`, `/dev/zram1`, v.v. Page ghi tới thiết bị được nén trước khi lưu. Với compression ratio trong khoảng 30% đến 50%, có thể kỳ vọng tăng tổng free memory khoảng 10%, đổi lại xử lý nhiều hơn và tăng điện năng tương ứng. Nó được dùng trong một số thiết bị Android ít memory.

Để bật zram, cấu hình kernel với các tùy chọn:

```
CONFIG_SWAP
CONFIG_CGROUP_MEM_RES_CTLR
CONFIG_CGROUP_MEM_RES_CTLR_SWAP
CONFIG_ZRAM
```

Sau đó mount zram khi boot bằng cách thêm vào `/etc/fstab`:

```
/dev/zram0 none swap defaults zramsize=<size in
  bytes>,swapprio=<swap partition priority>
```

Có thể bật, tắt swap bằng các lệnh:

```
# swapon /dev/zram0
# swapoff /dev/zram0
```

## Mapping memory bằng mmap

Process bắt đầu với lượng memory nhất định map tới text segment (code) và data segment của program file, cùng shared library được link. Nó có thể allocation trên heap tại runtime bằng `malloc(3)`, trên stack qua variable phạm vi cục bộ và memory cấp bằng `alloca(3)`. Nó cũng có thể nạp library động tại runtime bằng `dlopen(3)`. Kernel lo mọi mapping này. Tuy nhiên, process còn có thể thao tác memory map tường minh bằng `mmap(2)`:

```
void *mmap(void *addr, size_t length, int prot, int flags,
  int fd, off_t offset);
```

Nó map `length` byte memory từ file có descriptor `fd`, bắt đầu tại `offset` trong file, rồi trả pointer tới mapping nếu thành công. Vì hardware bên dưới làm việc theo page, `length` được làm tròn lên số nguyên page gần nhất. Tham số bảo vệ `prot` kết hợp permission read, write, execute, còn tham số `flags` chứa ít nhất `MAP_SHARED` hoặc `MAP_PRIVATE`. Có nhiều flag khác, mô tả trong man page.

Có nhiều việc làm được với mmap. Dưới đây là vài ví dụ.

### Dùng mmap cấp phát private memory

Có thể dùng mmap cấp vùng private memory bằng cách đặt flag `MAP_ANONYMOUS` và file descriptor `fd` thành `-1`. Tương tự allocation từ heap bằng `malloc(3)`, trừ memory được page-aligned và kích thước là bội số page. Memory được cấp trong cùng vùng dùng cho library. Thực tế vì vậy một số người gọi vùng này là mmap area.

Anonymous mapping tốt hơn cho allocation lớn vì không giữ chặt các khối trên heap, điều làm fragmentation dễ xảy ra hơn. Thú vị là `malloc(3)` (ít nhất trong glibc) dừng allocation từ heap cho yêu cầu trên 128 KiB và dùng mmap theo cách này; vì vậy phần lớn trường hợp chỉ dùng malloc là đúng. Hệ thống sẽ chọn cách tốt nhất đáp ứng yêu cầu.

### Dùng mmap chia sẻ memory

Như đã thấy trong Chương 10, Tìm hiểu process và thread, POSIX shared memory cần mmap để truy cập memory segment. Ở đây, đặt flag `MAP_SHARED` và dùng file descriptor từ `shm_open()`:

```
int shm_fd;
char *shm_p;

shm_fd = shm_open("/myshm", O_CREAT | O_RDWR, 0666);
ftruncate(shm_fd, 65536);
shm_p = mmap(NULL, 65536, PROT_READ | PROT_WRITE,
  MAP_SHARED, shm_fd, 0);
```

### Dùng mmap truy cập device memory

Như nhắc trong Chương 8, Giới thiệu device driver, driver có thể cho device node được mmap, nhờ đó chia sẻ một phần device memory với ứng dụng. Triển khai chính xác phụ thuộc driver.

Một ví dụ là Linux frame buffer, `/dev/fb0`. Giao diện định nghĩa trong `/usr/include/linux/fb.h`, gồm hàm `ioctl` lấy display size và bits per pixel. Sau đó có thể dùng mmap yêu cầu video driver chia sẻ frame buffer với ứng dụng rồi đọc ghi pixel:

```
int f;
int fb_size;
unsigned char *fb_mem;

f = open("/dev/fb0", O_RDWR);
/* Use ioctl FBIOGET_VSCREENINFO to find the display dimensions
  and calculate fb_size */
fb_mem = mmap(0, fb_size, PROT_READ | PROT_WRITE, MAP_SHARED, f,
  0);
/* read and write pixels through pointer fb_mem */
```

Ví dụ thứ hai là giao diện streaming video, Video 4 Linux phiên bản 2, hay V4L2, định nghĩa trong `/usr/include/linux/videodev2.h`. Mỗi video device có node `/dev/videoN`, bắt đầu `/dev/video0`. Có hàm `ioctl` yêu cầu driver cấp một số video buffer để mmap vào user space. Sau đó chỉ cần luân chuyển buffer và điền hoặc lấy dữ liệu video, tùy đang phát lại hay capture video stream.

## Ứng dụng dùng bao nhiêu memory?

Giống kernel space, nhiều cách allocation, mapping và chia sẻ memory user space khiến câu hỏi tưởng đơn giản khá khó trả lời.

Đầu tiên, có thể hỏi kernel nó cho rằng còn bao nhiêu memory, bằng lệnh `free`. Đây là ví dụ đầu ra điển hình:

```
             total     used     free   shared  buffers   cached
Mem:        509016   504312     4704        0    26456   363860
-/+ buffers/cache:   113996   395020
Swap:            0        0        0
```

Thoạt nhìn, hệ thống dường như gần hết memory, chỉ 4704 KiB free trên 509.016 KiB: dưới 1%. Tuy nhiên, lưu ý 26.456 KiB trong buffer và tới 363.860 KiB trong cache. Linux coi memory trống là lãng phí nên kernel dùng free memory cho buffer, cache, biết rằng có thể thu nhỏ khi cần. Loại buffer và cache khỏi phép đo cho free memory thật, 395.020 KiB, tức 77% tổng. Khi dùng free, các số dòng thứ hai `-/+ buffers/cache` mới quan trọng.

Có thể buộc kernel giải phóng cache bằng ghi số từ 1 đến 3 vào `/proc/sys/vm/drop_caches`:

```
# echo 3 > /proc/sys/vm/drop_caches
```

Số này thực ra là bit mask xác định muốn giải phóng loại cache nào trong hai nhóm: 1 cho page cache, 2 cho dentry và inode cache cùng nhau. Vai trò chính xác của cache không quá quan trọng ở đây, chỉ cần biết có memory kernel đang dùng nhưng thu hồi nhanh được.

## Memory usage Per-process

Có nhiều metric đo memory process dùng. Tôi bắt đầu với hai metric dễ lấy nhất – virtual set size (vss) và resident memory size (rss), cả hai có trong phần lớn triển khai lệnh `ps` và `top`:

- Vss: Gọi VSZ trong lệnh `ps`, VIRT trong `top`, là tổng memory process map. Đây là tổng mọi region trong `/proc/<PID>/map`. Con số ít đáng quan tâm vì tại mỗi thời điểm chỉ một phần virtual memory được gắn physical memory.

- Rss: Gọi RSS trong `ps`, RES trong `top`, là tổng memory map tới physical page. Gần memory budget thực tế hơn, nhưng có vấn đề: cộng Rss mọi process sẽ ước tính quá cao memory đang dùng vì một số page được chia sẻ.

### Dùng top và ps

Phiên bản `top`, `ps` trong BusyBox cho thông tin rất hạn chế. Ví dụ sau dùng bản đầy đủ từ package `procps`.

Lệnh `ps` hiển thị Vss (VSZ) và Rss (RSS) với tùy chọn `-Aly`, cùng custom format chứa `vsz`, `rss`, như sau:

```
# ps -eo pid,tid,class,rtprio,stat,vsz,rss,comm

  PID   TID CLS RTPRIO STAT    VSZ   RSS COMMAND
    1     1 TS       - Ss     4496  2652 systemd
  ...
  205   205 TS       - Ss     4076  1296 systemd-journal
  228   228 TS       - Ss     2524  1396 udevd
  581   581 TS       - Ss     2880  1508 avahi-daemon
  584   584 TS       - Ss     2848  1512 dbus-daemon
  590   590 TS       - Ss     1332   680 acpid
  594   594 TS       - Ss     4600  1564 wpa_supplicant
```

Tương tự, `top` tổng hợp free memory và memory usage mỗi process:

```
top - 21:17:52 up 10:04,  1 user,  load average: 0.00, 0.01, 0.05
Tasks:  96 total,   1 running,  95 sleeping,   0 stopped,   0
zombie
%Cpu(s):  1.7 us,  2.2 sy,  0.0 ni, 95.9 id,  0.0 wa,  0.0 hi,
0.2 si,  0.0 st
KiB Mem:    509016 total,   278524 used,   230492 free,    25572
buffers
KiB Swap:        0 total,        0 used,        0 free,   170920
cached

PID USER      PR  NI  VIRT  RES  SHR S  %CPU %MEM    TIME+
  COMMAND
1098 debian    20   0 29076  16m 8312 S   0.0  3.2   0:01.29
  wicd-client
  595 root      20   0 64920 9.8m 4048 S   0.0  2.0   0:01.09 node
  866 root      20   0 28892 9152 3660 S   0.2  1.8   0:36.38 Xorg
```

Lệnh đơn giản này giúp cảm nhận memory usage và chỉ dấu đầu tiên về memory leak khi Rss của process liên tục tăng. Tuy nhiên, chúng không chính xác lắm về số đo memory usage tuyệt đối.

### Dùng smem

Năm 2009, Matt Mackall bắt đầu xem vấn đề tính shared page khi đo memory process, thêm hai metric mới gọi unique set size, Uss, và proportional set size, Pss:

- Uss: Memory gắn với physical memory và riêng cho process, không chia sẻ với bất kỳ process khác. Đây là lượng memory được giải phóng nếu process kết thúc.

- Pss: Chia phần tính shared page gắn với physical memory cho mọi process map chúng. Ví dụ, vùng library code dài 12 page chia sẻ bởi sáu process, mỗi process được tính hai page trong Pss. Vì vậy cộng Pss mọi process cho lượng memory thực tế chúng dùng. Nói cách khác, Pss là con số cần tìm.

Thông tin có trong `/proc/<PID>/smaps`, chứa thông tin bổ sung cho mỗi mapping trong `/proc/<PID>/maps`. Đây là một phần file, cung cấp thông tin mapping code segment `libc`:

```
b6e6d000-b6f45000 r-xp 00000000 b3:02 2444 /lib/libc-2.13.so
Size:                864 kB
Rss:                 264 kB
Pss:                   6 kB
Shared_Clean:        264 kB
Shared_Dirty:          0 kB
Private_Clean:         0 kB
Private_Dirty:         0 kB
Referenced:          264 kB
Anonymous:             0 kB
AnonHugePages:         0 kB
Swap:                  0 kB
KernelPageSize:        4 kB
MMUPageSize:           4 kB
Locked:                0 kB
VmFlags: rd ex mr mw me
```

Lưu ý Rss 264 KiB nhưng do chia sẻ giữa nhiều process khác, Pss chỉ 6 KiB.

Có công cụ smem tổng hợp thông tin từ file `smaps`, trình bày theo nhiều cách, gồm pie chart hoặc bar chart. Trang dự án là `https://www.selenic.com/smem`. Nó có dạng package trong phần lớn desktop distribution. Tuy nhiên, vì viết bằng Python, cài trên embedded target cần Python environment, có thể quá phiền chỉ cho một công cụ. Để hỗ trợ, có chương trình nhỏ `smemcap` capture trạng thái từ `/proc` trên target, lưu thành TAR file để phân tích sau trên host computer. Nó thuộc BusyBox nhưng cũng biên dịch được từ source `smem`.

Chạy `smem` trực tiếp bằng `root`, bạn thấy:

```
# smem -t
 PID User  Command                   Swap      USS     PSS     RSS
 610 0     /sbin/agetty -s ttyO0 11     0      128     149     720
1236 0     /sbin/agetty -s ttyGS0 1     0      128     149     720
 609 0     /sbin/agetty tty1 38400      0      144     163     724
 578 0     /usr/sbin/acpid              0      140     173     680
 819 0     /usr/sbin/cron               0      188     201     704
 634 103   avahi-daemon: chroot hel     0      112     205     500
 980 0     /usr/sbin/udhcpd -S /etc     0      196     205     568
  ...
 836 0     /usr/bin/X :0 -auth /var     0     7172    7746    9212
 583 0     /usr/bin/node autorun.js     0     8772    9043   10076
1089 1000  /usr/bin/python -O /usr/     0     9600   11264   16388
------------------------------------------------------------------
  53 6                                  0    65820   78251  146544
```

Dòng cuối output cho thấy trong trường hợp này tổng Pss khoảng nửa Rss.

Nếu không có hoặc không muốn cài Python trên target, capture trạng thái bằng `smemcap`, cũng bằng `root`:

```
# smemcap > smem-bbb-cap.tar
```

Sau đó sao chép TAR file về host, đọc bằng `smem -S`, lần này không cần chạy bằng `root`:

```
$ smem -t -S smem-bbb-cap.tar
```

Output giống hệt khi chạy trực tiếp.

### Công cụ khác nên xét

Cách khác hiển thị Pss là qua `ps_mem` (`https://github.com/pixelb/ps_mem`), in thông tin gần tương tự nhưng định dạng đơn giản hơn. Nó cũng viết bằng Python.

Android còn có công cụ `procrank`, có thể cross compile cho embedded Linux với vài thay đổi nhỏ. Lấy code từ `https://github.com/csimmonds/procrank_linux`.

## Nhận diện memory leak

Memory leak xảy ra khi memory được cấp nhưng không giải phóng lúc không còn cần. Memory leakage không riêng embedded system, nhưng thành vấn đề một phần vì target vốn ít memory, một phần vì thường chạy lâu không reboot, khiến các rò rỉ tích thành vũng lớn.

Bạn nhận ra leak khi chạy `free` hoặc `top`, thấy free memory liên tục giảm dù drop cache như phần trước. Có thể tìm thủ phạm bằng xem Uss và Rss từng process. Có nhiều công cụ nhận diện memory leak trong chương trình. Tôi xem hai công cụ: `mtrace` và `Valgrind`.

### mtrace

`mtrace` là thành phần glibc trace lời gọi `malloc(3)`, `free(3)` và hàm liên quan, nhận diện vùng memory chưa free khi chương trình thoát. Cần gọi hàm `mtrace()` trong chương trình để bắt đầu tracing, rồi tại runtime ghi path name vào environment variable `MALLOC_TRACE`, nơi ghi trace information. Nếu `MALLOC_TRACE` không tồn tại hoặc không mở được file, hook `mtrace` không được cài. Dù trace information viết dạng ASCII, thường dùng lệnh `mtrace` để xem.

Đây là ví dụ:

```
#include <mcheck.h>
#include <stdlib.h>
#include <stdio.h>

int main(int argc, char *argv[])
{
  int j;
  mtrace();
  for (j = 0; j < 2; j++)
    malloc(100);  /* Never freed:a memory leak */
  calloc(16, 16);  /* Never freed:a memory leak */
  exit(EXIT_SUCCESS);
}
```

Đây là những gì có thể thấy khi chạy chương trình và xem trace:

```
$ export MALLOC_TRACE=mtrace.log
$ ./mtrace-example
$ mtrace mtrace-example mtrace.log

Memory not freed:
-----------------
           Address     Size     Caller
0x0000000001479460     0x64  at /home/chris/mtrace-example.c:11
0x00000000014794d0     0x64  at /home/chris/mtrace-example.c:11
0x0000000001479540    0x100  at /home/chris/mtrace-example.c:15
```

Tiếc là `mtrace` không cho biết memory bị leak khi chương trình đang chạy. Nó phải kết thúc trước.

### Valgrind

Valgrind là công cụ rất mạnh phát hiện vấn đề memory gồm leak và nhiều vấn đề khác. Ưu điểm là không cần biên dịch lại chương trình, library muốn kiểm tra, dù hoạt động tốt hơn nếu biên dịch với tùy chọn `-g` để có debug symbol table. Nó chạy chương trình trong môi trường giả lập và trap execution ở nhiều điểm. Điều đó dẫn tới nhược điểm lớn: chương trình chỉ chạy với một phần tốc độ bình thường, giảm tính hữu ích khi kiểm thử thứ có ràng buộc real-time.

Nhân tiện, tên thường bị phát âm sai: Valgrind FAQ nói grind phát âm với i ngắn -- như grinned (vần với tinned), thay vì grined (vần với find). FAQ, tài liệu và bản tải có tại `http://valgrind.org`.

Valgrind chứa nhiều công cụ chẩn đoán:

- memcheck: Công cụ mặc định, phát hiện memory leak và dùng sai memory nói chung

- cachegrind: Tính processor cache hit rate

- callgrind: Tính chi phí mỗi function call

- helgrind: Chỉ ra dùng sai Pthread API, deadlock tiềm ẩn và race condition

- DRD: Công cụ phân tích Pthread khác

- massif: Profile việc sử dụng heap và stack

Chọn công cụ bằng tùy chọn `-tool`. Valgrind chạy trên nền tảng embedded chính: ARM (Cortex A), PPC, MIPS và x86 ở biến thể 32- và 64-bit. Có package trong cả Yocto Project và Buildroot.

Để tìm memory leak của chúng ta, cần dùng công cụ `memcheck` mặc định với tùy chọn `--leakcheck=full` để in dòng phát hiện leak:

```
$ valgrind --leak-check=full ./mtrace-example
==17235== Memcheck, a memory error detector
==17235== Copyright (C) 2002-2013, and GNU GPL'd, by Julian Seward
  et al.
==17235== Using Valgrind-3.10.0.SVN and LibVEX; rerun with -h for
  copyright info
==17235== Command: ./mtrace-example
==17235==
==17235==
==17235== HEAP SUMMARY:
==17235==  in use at exit: 456 bytes in 3 blocks
==17235==  total heap usage: 3 allocs, 0 frees, 456 bytes
  allocated
==17235==
==17235== 200 bytes in 2 blocks are definitely lost in loss record
  1 of 2
==17235==    at 0x4C2AB80: malloc (in
  /usr/lib/valgrind/vgpreload_memcheck-linux.so)
==17235==    by 0x4005FA: main (mtrace-example.c:12)
==17235==
==17235== 256 bytes in 1 blocks are definitely lost in loss record
  2 of 2
==17235==    at 0x4C2CC70: calloc (in
  /usr/lib/valgrind/vgpreload_memcheck-linux.so)
==17235==    by 0x400613: main (mtrace-example.c:14)
==17235==
==17235== LEAK SUMMARY:
==17235==    definitely lost: 456 bytes in 3 blocks
==17235==    indirectly lost: 0 bytes in 0 blocks
==17235==      possibly lost: 0 bytes in 0 blocks
==17235==    still reachable: 0 bytes in 0 blocks
==17235==         suppressed: 0 bytes in 0 blocks
==17235==
==17235== For counts of detected and suppressed errors, rerun
  with: -v
==17235== ERROR SUMMARY: 2 errors from 2 contexts (suppressed: 0
  from 0)
```

## Hết memory

Memory allocation policy chuẩn là over-commit, nghĩa là kernel cho ứng dụng allocation nhiều hơn physical memory hiện có. Phần lớn thời gian hoạt động tốt vì ứng dụng thường yêu cầu nhiều memory hơn thực cần. Nó còn hỗ trợ triển khai `fork(2)`: an toàn sao chép chương trình lớn vì page memory chia sẻ với flag `copy-on-write`. Trong phần lớn trường hợp, `fork` được theo sau bởi lời gọi hàm `exec`, bỏ chia sẻ memory rồi nạp chương trình mới.

Tuy nhiên luôn có khả năng workload cụ thể khiến nhóm process đồng thời đòi dùng allocation đã được hứa, nên yêu cầu vượt lượng thật. Đây là tình huống out of memory, OOM. Lúc đó không còn lựa chọn ngoài giết process đến khi vấn đề biến mất. Đó là việc của out of memory killer. Trước đó, có tham số tinh chỉnh allocation kernel trong `/proc/sys/vm/overcommit_memory`, có thể đặt:

- `0`: over-commit theo heuristic (mặc định)

- `1`: Luôn over-commit, không kiểm tra

- `2`: Luôn kiểm tra, không over-commit

Lựa chọn 1 chỉ thực sự hữu ích nếu chạy chương trình làm việc với sparse array lớn, cấp phát vùng memory lớn nhưng chỉ ghi phần nhỏ. Chương trình như vậy hiếm trong embedded system.

Lựa chọn 2, không bao giờ over-commit, có vẻ tốt nếu lo hết memory, có thể trong ứng dụng nhiệm vụ trọng yếu hoặc safety-critical. Nó làm allocation vượt commit limit thất bại; limit bằng swap space cộng tổng memory nhân over-commit ratio. Tỷ lệ over-commit được điều khiển bởi `/proc/sys/vm/overcommit_ratio`, mặc định 50%.

Ví dụ, giả sử thiết bị có 512 MB system RAM, đặt ratio rất thận trọng 25%:

```
# echo 25 > /proc/sys/vm/overcommit_ratio
# grep -e MemTotal -e CommitLimit /proc/meminfo
MemTotal:         509016 kB
CommitLimit:      127252 kB
```

Không có swap nên commit limit là 25% `MemTotal`, như dự kiến.

Có variable quan trọng khác trong `/proc/meminfo: Committed_AS`. Đây là tổng memory cần để đáp ứng mọi allocation đến nay. Tôi thấy trên một hệ thống:

```
# grep -e MemTotal -e Committed_AS /proc/meminfo
MemTotal:         509016 kB
Committed_AS:     741364 kB
```

Nói cách khác, kernel đã hứa nhiều memory hơn lượng hiện có. Vì vậy, đặt `overcommit_memory` thành `2` khiến mọi allocation thất bại, bất kể `overcommit_ratio`. Để hệ thống chạy được, phải lắp RAM gấp đôi hoặc giảm mạnh số process đang chạy, hiện khoảng 40. Trong mọi trường hợp, phòng tuyến cuối là OOM killer. Nó dùng heuristic tính badness score từ 0 đến 1.000 mỗi process, rồi kết thúc process điểm cao nhất đến khi đủ free memory. Bạn thấy nội dung tương tự trong kernel log:

```
[44510.490320] eatmem invoked oom-killer: gfp_mask=0x200da,
order=0, oom_score_adj=0
...
```

Có thể buộc OOM event bằng `echo f > /proc/sysrq-trigger`.

Có thể tác động badness score process bằng ghi giá trị điều chỉnh vào `/proc/<PID>/oom_score_adj`. Giá trị `-1000` nghĩa là badness score không bao giờ lớn hơn zero nên không bao giờ bị giết; giá trị `+1000` nghĩa là luôn lớn hơn 1000 nên luôn bị giết.

## Đọc thêm

Các tài nguyên sau cung cấp thêm thông tin về chủ đề trong chương:

- Linux Kernel Development, 3rd Edition, by Robert Love, Addison Wesley, O'Reilly Media; (Jun. 2010) ISBN-10: 0672329468

- Linux System Programming, 2nd Edition, by Robert Love, O'Reilly Media; (8 Jun. 2013) ISBN-10: 1449339530

- Understanding the Linux VM Manager by Mel Gorman: `https://www.kernel.org/doc/gorman/pdf/understand.pdf`

- Valgrind 3.3 - Advanced Debugging and Profiling for Gnu/Linux Applications by J Seward, N. Nethercote, and J. Weidendorfer, Network Theory Ltd; (1 Mar. 2008) ISBN 978-0954612054

## Tổng kết

Không thể thống kê từng byte memory dùng trong virtual memory system. Tuy nhiên, có thể tìm số khá chính xác cho tổng free memory, loại phần buffer và cache, bằng lệnh `free`. Theo dõi theo thời gian và workload khác nhau giúp tự tin nó luôn nằm trong giới hạn cho trước.

Khi muốn tinh chỉnh memory usage hay tìm nguồn allocation bất ngờ, có tài nguyên cung cấp chi tiết hơn. Với kernel space, thông tin hữu ích nhất trong `/proc: meminfo`, `slabinfo`, `vmallocinfo`. Để đo chính xác user space, metric tốt nhất là Pss, được `smem` và công cụ khác hiển thị. Với memory debugging, có thể dùng tracer đơn giản như `mtrace`, hoặc lựa chọn hạng nặng Valgrind memcheck.

Nếu lo hậu quả out of memory, có thể fine-tune allocation mechanism qua `/proc/sys/vm/overcommit_memory` và điều khiển khả năng process cụ thể bị giết qua tham số `oom_score_adj`.

Chương tiếp theo trình bày debug user space và kernel code bằng GNU debugger, những hiểu biết có được khi quan sát code chạy, gồm cả hàm memory management đã mô tả ở đây.
