# Chương 9. File system

## Trong chương này

- 9\.1 Các khái niệm Linux file system 228

- 9\.2 ext2 230

- 9\.3 ext3 235

- 9\.4 ext4 237

- 9\.5 ReiserFS 238

- 9\.6 JFFS2 239

- 9\.7 `cramfs` 242

- 9\.8 Network File System 244

- 9\.9 Pseudo file system 248

- 9\.10 Các file system khác 255

- 9\.11 Tạo file system đơn giản 256

- 9\.12 Tổng kết 258

Có lẽ một trong những quyết định quan trọng nhất của lập trình viên embedded

là triển khai file system nào. Một số file system tối ưu cho hiệu

năng, số khác tối ưu kích thước. Những file system khác nữa tối ưu khôi phục dữ liệu

sau lỗi device hoặc mất nguồn. Chương này giới thiệu các file system chính

dùng trên hệ thống Linux và khảo sát đặc tính từng loại khi áp

dụng cho thiết kế embedded. Chương không nhằm khảo sát

chi tiết kỹ thuật nội bộ từng file system. Thay vào đó, chương khảo sát

đặc tính hoạt động và vấn đề phát triển liên quan đến từng file system

được trình bày.

Bắt đầu từ file system phổ biến nhất trên Linux desktop distribution trước đây,

chúng ta giới thiệu khái niệm từ Second Extended File System (ext2) để

làm nền tảng thảo luận tiếp. Sau đó xem hậu duệ Third

Extended File System (ext3), vốn rất phổ biến với vai trò

file system mặc định của nhiều Linux desktop distribution và server distribution. Sau đó mô tả

các cải tiến dẫn đến ext4.

Sau một số kiến thức nền, chúng ta khảo sát nhiều file system chuyên biệt,

gồm những loại tối ưu khôi phục dữ liệu và dung lượng lưu trữ, cùng

loại thiết kế cho Flash memory device. Network File System

(NFS) được trình bày, tiếp theo là thảo luận những pseudo file system quan trọng hơn,

gồm file system `/proc` và `sysfs`.

## 9.1 Các khái niệm Linux file system

Trước khi đi vào từng file system, hãy xem tổng thể cách lưu dữ liệu trên Linux system. Khi nghiên cứu device driver trong Chương 8, “Kiến thức cơ bản về device driver”, chúng ta xem cấu trúc character device. Nhìn chung, character device lưu và lấy dữ liệu theo serial stream. Ví dụ cơ bản nhất là serial port hoặc mouse. Ngược lại, block device lưu và lấy dữ liệu theo từng phần equal-sized, tại vị trí ngẫu nhiên trên media có thể định địa chỉ. Ví dụ, IDE hard disk controller điển hình có thể truyền 512 byte mỗi lần đến và từ vị trí cụ thể định địa chỉ được trên physical medium.

### 9.1.1 Partition

Trước khi thảo luận file system, chúng ta giới thiệu partition, sự phân chia logic physical device chứa file system. Ở cấp cao nhất, dữ liệu được lưu trên physical device trong partition. Partition là phần chia logic của physical medium (hard disk, Flash memory), có dữ liệu tổ chức theo đặc tả partition type nhất định. Physical device có thể có một partition bao phủ toàn bộ dung lượng, hoặc chia nhiều partition phù hợp tác vụ cụ thể. Có thể xem partition là logical disk để ghi file system hoàn chỉnh lên đó.

Hình 9-1 cho thấy quan hệ giữa partition và file system.

![Figure 9-1](images/ch09/fig09-01.png)

HÌNH 9-1 Partition và file system

Linux dùng tiện ích `fdisk` thao tác partition trên block device. Tiện ích `fdisk` gần đây trong nhiều Linux distribution nhận biết hơn 90 partition type. Thực tế chỉ vài loại thường dùng trên Linux system. Một số partition type phổ biến là Linux, FAT32 và Linux Swap.

Listing 9-1 hiển thị output tiện ích `fdisk` nhắm đến CompactFlash device nối USB port. Trên target system này, physical CompactFlash device được gán cho device node `/dev/sdb`.[^1]

LISTING 9-1 Hiển thị partition information bằng `fdisk`

```
# fdisk /dev/sdb

Command (m for help): p

Disk /dev/sdb: 49 MB, 49349120 bytes
4 heads, 32 sectors/track, 753 cylinders
Units = cylinders of 128 * 512 = 65536 bytes

   Device Boot    Start       End      Blocks   Id  System
/dev/sdb1   *         1       180       11504   83  Linux
/dev/sdb2           181       360       11520   83  Linux
/dev/sdb3           361       540       11520   83  Linux
/dev/sdb4           541       753       13632   83  Linux
```

Trong thảo luận này, chúng ta tạo bốn partition trên device bằng `fdisk`. Một partition đánh dấu bootable, thể hiện qua dấu sao ở cột Boot. Điều này phản ánh boot indicator flag trong data structure biểu diễn partition table trên device. Như listing cho thấy, đơn vị lưu trữ logic mà `fdisk` dùng là cylinder.[^2] Trên device này, cylinder chứa 64KB. Mặt khác, Linux biểu diễn đơn vị lưu trữ nhỏ nhất bằng logical block. Từ listing có thể suy ra block là đơn vị 1024 byte.

Sau khi CompactFlash được partition như vậy, mỗi device biểu diễn partition có thể được format bằng file system bạn chọn. Khi partition được format theo file system type nhất định, Linux có thể mount file system tương ứng từ partition đó.

## 9.2 ext2

Tiếp nối Listing 9-1, cần format các partition tạo bằng `fdisk`. Chúng ta dùng tiện ích Linux `mkfs.ext2`. `mkfs.ext2` tương tự lệnh DOS `format` quen thuộc. Nó tạo file system kiểu ext2 trên partition chỉ định. `mkfs.` `ext2` dành riêng ext2 file system; các file system khác có phiên bản tiện ích riêng. Listing 9-2 ghi output quá trình.

LISTING 9-2 Format partition bằng `mkfs.ext2`

```
# mkfs.ext2 /dev/sdb1 -L CFlash_Boot_Vol
mke2fs 1.40.8 (13-Mar-2008)
Filesystem label=CFlash_Boot_Vol
OS type: Linux
Block size=1024 (log=0)
Fragment size=1024 (log=0)
2880 inodes, 11504 blocks
575 blocks (5.00%) reserved for the super user
First data block=1
Maximum filesystem blocks=11796480
2 block groups
8192 blocks per group, 8192 fragments per group
1440 inodes per group
Superblock backups stored on blocks:
     8193

Writing inode tables: done
Writing superblocks and filesystem accounting information: done

This filesystem will be automatically checked every 33 mounts or 180
days, whichever comes first.  Use tune2fs -c or -i to override.
```

Listing 9-2 chứa nhiều chi tiết liên quan ext2 file system. Đây là cách tốt để bắt đầu hiểu đặc tính hoạt động ext2. Partition này được format kiểu ext2 (biết vì dùng tiện ích `mkfs` của ext2), với volume label `CFlash_Boot_Vol`. Nó được tạo trên Linux partition (OS Type:) với block size 1024 byte. Dung lượng được cấp cho 2.880 inode, chiếm 11.504 block. Inode là data structure nền tảng biểu diễn một file. Để biết thêm cấu trúc nội bộ ext2 file system, xem phần cuối chương.

Nhìn output `mkfs.ext2` trong Listing 9-2, có thể xác định một số đặc tính tổ chức storage device. Chúng ta đã biết block size 1024 byte. Nếu ứng dụng cụ thể cần, có thể yêu cầu `mkfs.ext2` format ext2 file system với block size khác. Implementation hiện tại cho phép block size 1.024, 2.048 và 4.096 block.

Block size luôn là sự cân đối để đạt hiệu năng tốt nhất. Một mặt, block size lớn lãng phí dung lượng hơn trên disk chứa nhiều file nhỏ, vì mỗi file phải vừa số nguyên block. Mọi phần dư trên `block_size *` `n` phải chiếm thêm một block đầy đủ, dù chỉ 1 byte. Mặt khác, block size rất nhỏ tăng overhead quản lý metadata mô tả mapping block-to-file. Benchmark trên hardware implementation và data format cụ thể là cách duy nhất chắc chắn chọn block size tối ưu.

### 9.2.1 Mount file system

Sau khi tạo file system, có thể mount trên Linux system đang chạy. Kernel phải được compile hỗ trợ file system type đó, dưới dạng module compiled-in hoặc dynamically loadable module. Lệnh sau mount ext2 file system vừa tạo vào mount point chúng ta chỉ định:

```
# mount /dev/sdb1 /mnt/flash
```

Ví dụ giả định đã tạo directory `/mnt/flash` trên target Linux machine. Nó gọi là mount point vì cài (mount) file system có gốc tại điểm này trong file system hierarchy. Chúng ta mount Flash device mô tả trước đó được gán device `/dev/sdb1`. Trên Linux desktop machine (phát triển) điển hình, cần root privilege để thực thi lệnh.[^3] Mount point là directory path bất kỳ bạn chọn trong file system, trở thành cấp cao nhất (root) của device mới mount. Trong ví dụ trên, để tham chiếu file trên Flash device, phải thêm prefix `/mnt/flash` vào path.

Lệnh `mount` có nhiều option. Một số option `mount` nhận phụ thuộc target file system type. Phần lớn thời gian, `mount` xác định được kiểu file system đã format đúng mà kernel nhận biết. Chúng ta sẽ bổ sung ví dụ dùng lệnh `mount` xuyên suốt chương.

Listing 9-3 hiển thị directory content của Flash device cấu hình cho embedded system bất kỳ.

LISTING 9-3 Danh sách Flash device

```
$ ls -l /mnt/flash
total 24
drwxr-xr-x  2 root root  1024 Jul 18 20:18 bin
drwxr-xr-x  2 root root  1024 Jul 18 20:18 boot
drwxr-xr-x  2 root root  1024 Jul 18 20:18 dev
drwxr-xr-x  2 root root  1024 Jul 18 20:18 etc
drwxr-xr-x  2 root root  1024 Jul 18 20:18 home
drwxr-xr-x  2 root root  1024 Jul 18 20:18 lib
drwx------  2 root root 12288 Jul 17 13:02 lost+found
drwxr-xr-x  2 root root  1024 Jul 18 20:18 proc
drwxr-xr-x  2 root root  1024 Jul 18 20:18 root
drwxr-xr-x  2 root root  1024 Jul 18 20:18 sbin
drwxr-xr-x  2 root root  1024 Jul 18 20:18 tmp
drwxr-xr-x  2 root root  1024 Jul 18 20:18 usr
drwxr-xr-x  2 root root  1024 Jul 18 20:18 var
$
```

Listing 9-3 là ví dụ hình dạng root file system của embedded system tại cấp cao nhất (root). Chương 6, “Khởi tạo user space”, cung cấp hướng dẫn và ví dụ xác định nội dung root file system.

### 9.2.2 Kiểm tra tính toàn vẹn file system

Lệnh `e2fsck` dùng kiểm tra tính toàn vẹn ext2 file system. File system có thể hỏng vì nhiều lý do. Phổ biến nhất là mất nguồn bất ngờ. Linux distribution đóng mọi file đang mở và unmount file system trong shutdown sequence (giả định shutdown có trình tự). Tuy nhiên với embedded system, power-downs bất ngờ thường xảy ra, nên cần biện pháp phòng vệ. `e2fsck` là tuyến phòng vệ đầu.

Listing 9-4 cho output `e2fsck` chạy trên CompactFlash của các ví dụ trước. Nó đã được format và unmount đúng, nên không nên có lỗi.

LISTING 9-4 Kiểm tra file system sạch

```
# e2fsck /dev/sdb1
e2fsck 1.40.8 (13-Mar-2008)
CFlash_Boot_Vol: clean, 11/2880 files, 471/11504 blocks
#
```

Tiện ích `e2fsck` kiểm tra tính nhất quán của một số khía cạnh file system. Nếu không thấy vấn đề, `e2fsck` đưa thông báo tương tự Listing 9-4. Chú ý chỉ nên chạy `e2fsck` trên file system chưa mount. Dù có thể chạy trên file system đã mount, điều đó có thể gây hư hại đáng kể cấu trúc file system nội bộ trên disk hoặc Flash device.

Để có ví dụ thú vị hơn, Listing 9-5 được tạo bằng cách rút CompactFlash device khỏi khe khi vẫn đang mount. Chúng ta cố ý tạo file và bắt đầu phiên chỉnh sửa file trước khi rút khỏi hệ thống. Điều này có thể làm hỏng cả data structure mô tả file lẫn data block thực chứa dữ liệu file.

LISTING 9-5 Kiểm tra file system hỏng

```
# e2fsck -y /dev/sdb1
e2fsck 1.40.8 (13-Mar-2008)
/dev/sdb1 was not cleanly unmounted, check forced.
Pass 1: Checking inodes, blocks, and sizes
Inode 13, i_blocks is 16, should be 8.  Fix? yes

Pass 2: Checking directory structure
Pass 3: Checking directory connectivity
Pass 4: Checking reference counts
Pass 5: Checking group summary information

/dev/sdb1: ***** FILE SYSTEM WAS MODIFIED *****
/dev/sdb1: 25/2880 files (4.0% non-contiguous), 488/11504 blocks
#
```

Từ Listing 9-5, bạn thấy `e2fsck` phát hiện CompactFlash không được unmount sạch. Hơn nữa thấy xử lý trên file system trong quá trình `e2fsck` kiểm tra. Tiện ích `e2fsck` đi qua file system năm lượt, kiểm tra các phần khác nhau của data structure nội bộ. Lỗi gắn với file có inode[^4] 13 được sửa tự động vì có flag `-y` trên command line `e2fsck`.

Tất nhiên trong hệ thống thực có thể không may như vậy. Một số lỗi file system không thể sửa bằng `e2fsck`. Người thiết kế embedded system cần hiểu nếu mất nguồn không shutdown đúng, boot cycle có thể bị chậm bởi thời gian scan boot device và sửa lỗi. Thực tế, nếu lỗi không sửa được, system boot dừng và cần can thiệp thủ công. Hơn nữa, nếu file system lớn, file system check (`fsck`) có thể mất nhiều phút, thậm chí nhiều giờ với file system nhiều gigabyte.

Biện pháp khác chống hỏng file system là bảo đảm write được commit xuống disk ngay khi ghi. Tiện ích `sync` có thể ép mọi I/O request trong queue được commit vào device tương ứng. Một chiến lược giảm khoảng dễ hỏng dữ liệu vì mất nguồn hoặc drive failure bất ngờ là gọi lệnh `sync` sau mỗi lần ghi file, hoặc ở thời điểm chiến lược theo yêu cầu ứng dụng. trade-off tất nhiên là mất hiệu năng. Hoãn disk write là tối ưu hiệu năng trong mọi operating system hiện đại. Dùng `sync` thực chất vô hiệu hóa tối ưu này.

Ext2 file system đã trưởng thành thành file system nhanh, hiệu quả, vững chắc cho Linux system. Tuy nhiên nếu cần độ tin cậy bổ sung của journaling file system, hoặc boot time sau shutdown không sạch là vấn đề thiết kế, nên cân nhắc ext3 file system.

## 9.3 ext3

Ext3 file system đã trở thành journaling file system mạnh, high-performance và vững chắc. Hiện nó là file system mặc định của nhiều desktop Linux distribution phổ biến.

Về cơ bản ext3 là phần mở rộng ext2 với journaling bổ sung. Journaling là kỹ thuật ghi log từng thay đổi file system vào file đặc biệt để khôi phục được từ journaling point đã biết. Ưu điểm chính của ext3 là mount được ngay sau shutdown không sạch. Như phần trước, khi hệ thống tắt bất ngờ, chẳng hạn mất điện, hệ thống ép kiểm tra tính nhất quán file system, có thể lâu. Với ext3 không cần consistency check vì chỉ cần phát lại journal để bảo đảm tính nhất quán.

Không đi sâu thiết kế ngoài phạm vi sách, chúng ta giải thích nhanh journaling file system hoạt động thế nào. Nó chứa file đặc biệt, thường ẩn với user, lưu file system metadata[^5] và chính file data. File đặc biệt gọi là journal. Khi file system thay đổi (như write operation), thay đổi được ghi trước vào journal. File system driver bảo đảm write này được commit vào journal trước khi thay đổi thực được đưa và commit vào storage medium (disk hoặc Flash). Sau khi ghi log vào journal, driver áp dụng thay đổi lên file thực và metadata trên medium. Nếu mất nguồn khi ghi media và reboot, chỉ cần phát lại thay đổi trong journal để khôi phục tính nhất quán file system.

Một mục tiêu thiết kế quan trọng nhất của ext3 là tương thích backward- và forward-compatible với ext2. Có thể chuyển ext2 sang ext3 rồi ngược lại mà không format hoặc ghi lại toàn bộ dữ liệu disk. Hãy xem cách thực hiện.[^6] Listing 9-6 trình bày chi tiết quy trình.

LISTING 9-6 Chuyển ext2 file system sang ext3 file system

```
# mount /dev/sdb1 /mnt/flash     <<< Mount the ext2 file system
# tune2fs -j /dev/sdb1          <<< Create the journal
tune2fs 1.37 (21-Mar-2005)
Creating journal inode: done
This filesystem will be automatically checked every 23 mounts or 180
days, whichever comes first.  Use tune2fs -c or -i to override.
#
```

Chú ý đầu tiên mount file system tại `/mnt/flash` chỉ để minh họa. Bình thường thực thi lệnh trên ext2 partition chưa mount. Hành vi thiết kế của `tune2fs` khi file system đã mount là tạo journal file `.journal`, một hidden file. File Linux bắt đầu bằng dấu chấm (`.`) được coi là hidden file; phần lớn tiện ích file command-line Linux âm thầm bỏ qua loại này. Trong Listing 9-7 thấy lệnh `ls` gọi với flag `-a`, yêu cầu tiện ích `ls` liệt kê mọi file.

LISTING 9-7 Journal file của ext3

```
$ ls -al /mnt/flash
total 1063
drwxr-xr-x  15 root root    1024 Aug 25 19:25 .
drwxrwxrwx   5 root root    4096 Jul 18 19:49 ..
drwxr-xr-x   2 root root    1024 Aug 14 11:27 bin
drwxr-xr-x   2 root root    1024 Aug 14 11:27 boot
drwxr-xr-x   2 root root    1024 Aug 14 11:27 dev
drwxr-xr-x   2 root root    1024 Aug 14 11:27 etc
drwxr-xr-x   2 root root    1024 Aug 14 11:27 home
-rw-------   1 root root 1048576 Aug 25 19:25 .journal
drwxr-xr-x   2 root root    1024 Aug 14 11:27 lib
drwx------   2 root root   12288 Aug 14 11:27 lost+found
drwxr-xr-x   2 root root    1024 Aug 14 11:27 proc
drwxr-xr-x   2 root root    1024 Aug 14 11:27 root
drwxr-xr-x   2 root root    1024 Aug 14 11:27 sbin
drwxr-xr-x   2 root root    1024 Aug 14 11:27 tmp
drwxr-xr-x   2 root root    1024 Aug 14 11:27 usr
drwxr-xr-x   2 root root    1024 Aug 14 11:27 var
```

Giờ đã tạo journal file trên Flash module, nó thực chất được format thành ext3 file system. Lần reboot tiếp hoặc chạy `e2fsck` trên partition chứa ext3 mới, journal file tự động trở nên vô hình. Metadata lưu trong inode dành riêng cho mục đích đó. Chừng nào file `.journal` còn thấy trong directory listing, sửa hoặc xóa nó là nguy hiểm.

Có thể và đôi khi có lợi khi tạo journal file trên device khác. Ví dụ nếu hệ thống có hơn một physical device, đặt ext3 journaling file system trên drive đầu và journal file trên drive thứ hai. Phương pháp hoạt động dù physical storage dựa trên Flash hay rotational media. Để tạo journaling file system từ ext2 hiện có với journal file ở partition riêng, gọi `tune2fs` như sau:

```
# tune2fs -J device=/dev/sda1 -j /dev/sdb1
```

Để hoạt động, device chứa journal phải được format với journal file từ trước—phải là ext3 file system.

## 9.4 ext4

Ext4 file system xây dựng trên thành công của ext3. Như tiền nhiệm, nó là journaling file system. Nó được phát triển thành chuỗi patch nhằm loại bỏ một số giới hạn ext3. Có khả năng ext4 sẽ trở thành file system mặc định của nhiều Linux distribution phổ biến.

Ext4 loại bỏ giới hạn 16-terabyte của file system, tăng lên 1 exbibyte (2\^60 byte, nếu bạn đếm được cao đến thế!) và hỗ trợ kích thước file riêng tới 1024 gigabyte. (Tôi còn không phát âm nổi exbibyte, huống hồ hiểu lượng đó!) Một số cải tiến khác tăng hiệu năng cho loại tải dự kiến trên server lớn và database system, nơi ext4 dự kiến làm mặc định.

Nếu yêu cầu embedded system bao gồm journaling file system lớn, high-performance, bạn có thể cân nhắc tìm hiểu ext4.

## 9.5 ReiserFS

ReiserFS phổ biến trong một số desktop distribution như SuSE và Gentoo. Reiser4 là phiên bản hiện tại của journaling file system này. Như ext3, ReiserFS bảo đảm một file system operation hoặc hoàn tất toàn bộ hoặc không phần nào hoàn tất. Khác ext3, Reiser4 đưa API cho lập trình viên hệ thống bảo đảm atomicity của file system transaction. Xét ví dụ:

Một database program đang cập nhật record. Một số write được gửi tới file system. Mất nguồn sau write đầu nhưng trước write cuối hoàn tất. Journaling file system bảo đảm metadata change lưu trong journal file để khi cấp nguồn lại, kernel ít nhất thiết lập trạng thái file system nhất quán. Tức nếu file A được báo có 16KB trước mất nguồn, nó vẫn báo 16KB sau đó, và directory entry biểu diễn file (thực tế inode) ghi đúng kích thước. Tuy nhiên điều đó không nghĩa file data được ghi đúng vào file, chỉ cho biết file system không lỗi. Thực tế có thể database program đã mất dữ liệu trong tình huống trên, và database logic phải khôi phục phần đã mất, nếu thực sự còn có thể khôi phục.

Reiser4 triển khai file system operation “atomic” high-performance nhằm bảo vệ cả trạng thái file system (tính nhất quán) và dữ liệu trong operation. Reiser4 cung cấp user-level API để chương trình như database manager gọi file system write command được bảo đảm hoặc thành công toàn bộ, hoặc thất bại toàn bộ tương tự. Điều này không chỉ bảo đảm duy trì nhất quán file system mà còn không để lại dữ liệu một phần hoặc rác trong file sau system crash.

Để biết chi tiết và phần mềm ReiserFS thực, tham khảo tài liệu cuối chương.

## 9.6 JFFS2

Flash memory được dùng rộng trong sản phẩm embedded. Do bản chất công nghệ, nó vốn kém hiệu quả hơn và dễ hỏng dữ liệu do mất nguồn hơn. Nguyên nhân là write time lớn hơn nhiều. Sự kém hiệu quả đến từ block size. Block size của Flash memory device thường tính bằng hàng chục hoặc hàng trăm kilobyte. Flash memory chỉ xóa được từng block, dù write thường thực thi từng byte hoặc word. Để cập nhật một file, phải xóa và ghi lại cả block.

Ai cũng biết phân bố kích thước file trên Linux machine (hay OS khác) có nhiều file nhỏ hơn file lớn. Histogram trong Hình 9-2, tạo bằng `gnuplot`, minh họa phân bố kích thước file trên Linux development system điển hình.

![Figure 9-2](images/ch09/fig09-02.png)

HÌNH 9-2 Kích thước file theo byte

Hình 9-2 cho thấy phần lớn kích thước file thấp hơn nhiều so với khoảng 5KB. Đỉnh tại 4096 biểu diễn directory. Directory entry (bản thân cũng là file) dài đúng 4096 byte và có rất nhiều. Đỉnh trên 40.000 byte là hệ quả phép đo: đếm số file lớn hơn khoảng 40KB, điểm cuối khoảng đo. Điều thú vị là đại đa số file rất nhỏ.

File nhỏ tạo thách thức riêng cho người thiết kế Flash file system. Vì Flash memory phải xóa cả block mỗi lần, và Flash block thường lớn gấp nhiều lần file nhỏ, Flash chịu các operation ghi lại block time-consuming. Ví dụ giả sử Flash block 128KB chứa vài chục file 4096 byte hoặc nhỏ hơn. Giờ giả sử một file cần sửa. Điều này khiến Flash file system invalidate cả block 128KB rồi ghi lại mọi file sang block mới xóa. Quá trình có thể time-consuming.

Vì Flash write có thể time-consuming (chậm hơn hard disk write nhiều), khoảng có thể hỏng dữ liệu do mất nguồn đột ngột tăng lên. Mất nguồn bất ngờ phổ biến trong embedded system. Ví dụ, nếu mất nguồn khi ghi lại block dữ liệu 128KB vừa nói, tất cả vài chục file có thể mất.

Đây là lúc Journaling Flash File System second-generation (JFFS2) xuất hiện. Những vấn đề vừa thảo luận và vấn đề khác phần lớn được giảm hoặc loại bỏ bởi thiết kế JFFS2. JFFS ban đầu do Axis Communications AB của Thụy Điển thiết kế, nhắm riêng Flash memory device phổ biến lúc đó. JFFS hiểu Flash architecture và quan trọng hơn, giới hạn architecture do device áp đặt.

Vấn đề khác của Flash file system là Flash memory có tuổi thọ giới hạn. Flash memory device điển hình được đặc tả tối thiểu 100.000 write cycle, gần đây device 1,000,000-cycle trở nên phổ biến. Đặc tả áp dụng cho từng block Flash device. Giới hạn khác thường đặt yêu cầu trải đều write trên các block Flash memory device. JFFS2 dùng kỹ thuật wear leveling để thực hiện.

### 9.6.1 Build JFFS2 image

Build JFFS2 image tương đối đơn giản. Dù có thể build JFFS2 image trên workstation không có kernel support, bạn không thể mount. Trước khi tiếp tục, bảo đảm kernel hỗ trợ JFFS2 và development workstation có phiên bản tiện ích `mkfs.jffs2` tương thích. Có thể download và build tiện ích từ source code, ftp://ftp.infradead.org/pub/mtd-utils/. Tốt hơn nên có từ người duy trì desktop Linux package. Ví dụ trên Ubuntu có thể cài bằng lệnh:

```
$ sudo apt-get install mtd-tools
```

Distribution có thể gọi tên khác như mtd-utils. Tham khảo tài liệu đi kèm desktop Linux distribution.

JFFS2 image được build từ directory chứa các file muốn có trên file system image. Listing 9-8 cho thấy directory structure điển hình cho Flash device dùng làm root file system.

LISTING 9-8 Directory layout cho JFFS2 file system

```
$ ls -l
total 44
drwxr-xr-x  2 root root 4096 Aug 14 11:27 bin
drwxr-xr-x  2 root root 4096 Aug 14 11:27 dev
drwxr-xr-x  2 root root 4096 Aug 14 11:27 etc
drwxr-xr-x  2 root root 4096 Aug 14 11:27 home
drwxr-xr-x  2 root root 4096 Aug 14 11:27 lib
drwxr-xr-x  2 root root 4096 Aug 14 11:27 proc
drwxr-xr-x  2 root root 4096 Aug 14 11:27 root
drwxr-xr-x  2 root root 4096 Aug 14 11:27 sbin
drwxr-xr-x  2 root root 4096 Aug 14 11:27 tmp
drwxr-xr-x  2 root root 4096 Aug 14 11:27 usr
drwxr-xr-x  2 root root 4096 Aug 14 11:27 var
$
```

Khi có runtime file phù hợp, directory layout này dùng làm mẫu cho lệnh `mkfs.jffs2`. Lệnh `mkfs.jffs2` tạo JFFS2 file system image format đúng từ directory tree như Listing 9-8. Các parameter Command-line truyền cho `mkfs.jffs2` vị trí directory và tên output file nhận JFFS2 image. Mặc định tạo image từ current directory. Listing 9-9 cho lệnh build JFFS2 image.

LISTING 9-9 Ví dụ lệnh `mkfs.jffs2`

```
# mkfs.jffs2 -d ./jffs2-image-dir -o jffs2.bin
# ls -l
total 4772
-rw-r--r--   1 root  root   1098640 Sep 17 22:03 jffs2.bin
drwxr-xr-x  13 root  root      4096 Sep 17 22:02 jffs2-image-dir
#
```

Directory structure và file của Listing 9-8 nằm trong directory `jffs2-image-dir` ở ví dụ. Chúng ta tùy chọn thực thi lệnh `mkfs.jffs2` từ directory bên trên file system image. Dùng flag `-d` báo lệnh `mkfs.jffs2` vị trí file system template. Dùng flag `-o` đặt tên output file nhận JFFS2 image kết quả. Image `jffs2.bin` được dùng trong Chương 10, “MTD subsystem”, khi khảo sát JFFS2 file cùng MTD subsystem.

Cần chỉ ra mọi file system Flash-based hỗ trợ write operation đều chịu điều kiện có thể làm Flash device bên dưới hỏng sớm. Ví dụ bật system logger (`syslogd` và `klogd`) cấu hình ghi dữ liệu vào file system Flash-based dễ làm Flash device quá tải bởi write liên tục. Một số loại lỗi chương trình cũng dẫn đến write liên tục. Cần cẩn thận giới hạn Flash write trong tuổi thọ Flash device.

## 9.7 cramfs

Theo file `README` của dự án `cramfs`, mục tiêu `cramfs` là “nhét file system vào ROM nhỏ”. File system `cramfs` rất hữu ích cho embedded system có ROM hoặc FLASH memory nhỏ chứa dữ liệu và chương trình tĩnh. Trích tiếp README của `cramfs`, “`cramfs` được thiết kế đơn giản, nhỏ và nén tốt”.

File system `cramfs` là read-only. Nó được tạo bằng tiện ích command-line tên `mkcramfs`. Nếu development workstation chưa có, có thể download từ URL cuối chương. Như JFFS2, `mkcramfs` build file system image từ directory chỉ định trên command line. Listing 9-10 trình bày quy trình build image `cramfs`. Chúng ta dùng cùng file system structure từ Listing 9-8 đã dùng build JFFS2 image.

LISTING 9-10 Ví dụ lệnh `mkcramfs`

```
# mkcramfs
usage: mkcramfs [-h] [-v] [-b blksize] [-e edition] [-i file] [-n name]
dirname outfile
 -h         print this help
 -E         make all warnings errors (non-zero exit status)
 -b blksize use this blocksize, must equal page size
 -e edition set edition number (part of fsid)
 -i file    insert a file image into the filesystem (requires >= 2.4.0)
 -n name    set name of cramfs filesystem
 -p         pad by 512 bytes for boot code
 -s         sort directory entries (old option, ignored)
 -v         be more verbose
 -z         make explicit holes (requires >= 2.3.39)
 dirname    root of the directory tree to be compressed
 outfile    output file

# mkcramfs . ../cramfs.image
warning: gids truncated to 8 bits (this may be a security concern)
# ls -l ../cramfs.image
-rw-rw-r--  1 chris chris 1019904 Sep 19 18:06 ../cramfs.image
```

Lệnh `mkcramfs` ban đầu gọi không có command-line parameter để tái hiện usage message. Vì không có man page, đây là cách tốt nhất hiểu cách dùng. Sau đó gọi lệnh với current directory (`.)` làm nguồn file cho file system `cramfs`, và file tên `cramfs.image` làm đích. Cuối cùng liệt kê file vừa tạo và thấy file mới `cramfs.image`.

Chú ý nếu kernel cấu hình hỗ trợ `cramfs`, có thể mount file system image trên Linux development workstation rồi khảo sát nội dung. Tất nhiên vì là file system read-only nên không thể sửa. Listing 9-11 minh họa mount file system `cramfs` tại mount point `/mnt/flash`.

LISTING 9-11 Khảo sát file system `cramfs`

```
# mount -o loop cramfs.image /mnt/flash
# ls -l /mnt/flash
total 6
drwxr-xr-x  1 root  root 704 Dec 31  1969 bin
drwxr-xr-x  1 root  root   0 Dec 31  1969 dev
drwxr-xr-x  1 root  root 416 Dec 31  1969 etc
drwxr-xr-x  1 root  root   0 Dec 31  1969 home
drwxr-xr-x  1 root  root 172 Dec 31  1969 lib
drwxr-xr-x  1 root  root   0 Dec 31  1969 proc
drws------  1 root  root   0 Dec 31  1969 root
drwxr-xr-x  1 root  root 272 Dec 31  1969 sbin
drwxrwxrwt  1 root  root   0 Dec 31  1969 tmp
drwxr-xr-x  1 root  root 124 Dec 31  1969 usr
drwxr-xr-x  1 root  root 212 Dec 31  1969 var
#
```

Có thể bạn thấy cảnh báo group ID (GID) trong Listing 9-10 khi thực thi lệnh `mkcramfs`. File system `cramfs` dùng metadata rất gọn để giảm kích thước và tăng tốc thực thi. Một “tính năng” của file system `cramfs` là cắt group ID field còn 8 bit. Linux dùng group ID field 16-bit. Kết quả là file tạo với group ID lớn hơn 255 bị cắt và phát cảnh báo trong Listing 9-10.

Dù có giới hạn về file size tối đa, số file tối đa, v.v., file system `cramfs` lý tưởng cho boot ROM, nơi operation read-only và nén nhanh là tính năng mong muốn.

## 9.8 Network File System

Nếu từng phát triển trong môi trường UNIX, chắc chắn bạn quen Network File System (NFS). Cấu hình đúng, NFS cho phép export directory trên NFS server rồi mount trên remote client machine như local file system. Điều này hữu ích cho network UNIX/Linux machine lớn và có thể là giải pháp tuyệt vời cho lập trình viên embedded. Dùng NFS trên target board, lập trình viên có thể truy cập lượng lớn file, library, tool và utility trong phát triển, debug, ngay cả khi target embedded system resource-constrained.

Như file system khác, kernel phải cấu hình hỗ trợ NFS cho cả chức năng server-side và client side. Chức năng NFS server và client cấu hình độc lập trong kernel configuration.

Hướng dẫn chi tiết cấu hình, tinh chỉnh NFS ngoài phạm vi sách, nhưng giới thiệu ngắn giúp minh họa NFS hữu ích thế nào khi phát triển embedded. Xem phần cuối chương để có thông tin NFS chi tiết, gồm NFS Howto đầy đủ.

Trên development workstation bật NFS, configuration file chứa danh sách chỉ định từng directory muốn export qua Network File System. Trên Red Hat, Ubuntu và phần lớn distribution khác, file nằm trong directory `/etc`, tên `exports`. Listing 9-12 là `/etc/exports` mẫu như trên workstation phát triển embedded.

LISTING 9-12 Nội dung `/etc/exports`

```
$ cat /etc/exports
# /etc/exports
/coyote-target  *(rw,sync,no_root_squash,no_all_squash,no_subtree_check)
/home/chris/workspace  *(rw,sync,no_root_squash,no_all_squash,no_subtree_check)
$
```

File chứa tên hai directory trên Linux development workstation. Directory đầu chứa target file system cho ADI Engineering Coyote reference board. Directory thứ hai là workspace chung chứa dự án nhắm embedded system. Đây là lựa chọn tùy ý; bạn cấu hình NFS theo ý muốn.

Trên embedded system bật NFS, lệnh sau mount directory `.../workspace` do NFS server export tại mount point tùy chọn:

```
# mount -t nfs pluto:/home/chris/workspace /workspace
```

Chú ý một số điểm quan trọng của lệnh. Chúng ta yêu cầu lệnh `mount` mount remote directory (trên machine tên pluto, development workstation trong ví dụ) tại local mount point `/workspace`. Để ngữ nghĩa lệnh hoạt động, embedded target phải đáp ứng hai yêu cầu. Đầu tiên, để target nhận symbolic machine name pluto, nó phải resolve được tên. Cách dễ nhất là đặt entry trong file `/etc/hosts` trên target. Điều này cho networking subsystem resolve symbolic name sang IP address tương ứng. Entry trong file `/etc/hosts` của target như sau:

```
192.168.11.9        pluto
```

Yêu cầu thứ hai là embedded target có directory trong root directory tên `/workspace`. (Có thể chọn pathname bất kỳ, ví dụ mount tại `/mnt/mywork`.) Đây gọi là mount point. Yêu cầu là target có directory được tạo với tên giống trong lệnh `mount`.

Lệnh `mount` trong ví dụ khiến nội dung directory `/home/chris/workspace` của NFS server có sẵn trên path `/workspace` của embedded system.

Điều này rất hữu ích, đặc biệt trong môi trường cross-development. Giả sử làm dự án lớn cho embedded device. Mỗi khi sửa dự án, cần chuyển ứng dụng đến target để test và debug. Dùng NFS như vừa mô tả, giả sử làm trong directory NFS export trên host, thay đổi sẵn có ngay trên target embedded system mà không upload file dự án mới compile. Điều này tăng tốc phát triển đáng kể.

### 9.8.1 Root file system trên NFS

Mount project workspace trên target embedded system rất hữu ích cho phát triển và debug vì tạo điều kiện truy cập nhanh thay đổi, source code để debug source-level. Đặc biệt hữu ích khi target resource-constrained nghiêm trọng. NFS thực sự tỏa sáng như công cụ phát triển khi mount toàn bộ root file system của embedded system từ NFS server. Trong Listing 9-12, chú ý entry `coyote-target`. Directory này trên development workstation có thể chứa hàng trăm hoặc hàng nghìn file tương thích target architecture.

Embedded Linux distribution hàng đầu cho embedded system cung cấp hàng chục nghìn file đã compile và test cho target architecture chọn. Để minh họa, Listing 9-13 chứa directory listing của directory `coyote-target` tham chiếu trong Listing 9-12.

LISTING 9-13 Tổng quan ví dụ target file system

```
$ du -h --max-depth=1
724M    ./usr
4.0K    ./opt
39M     ./lib
12K     ./dev
27M     ./var
4.0K    ./tmp
3.6M    ./boot
4.0K    ./workspace
1.8M    ./etc
4.0K    ./home
4.0K    ./mnt
8.0K    ./root
29M     ./bin
32M     ./sbin
4.0K    ./proc
64K     ./share
855M    .
$
$ find -type f | wc -l
29430
```

Target file system này chứa gần một gigabyte binary file cho ARM architecture. Như listing cho thấy, đây là hơn 29.000 binary file, configuration file và documentation file. Khó có thể vừa Flash device trung bình trong embedded system!

Đó là sức mạnh NFS root mount. Cho mục đích phát triển, embedded system chứa mọi tool, utility quen trên Linux workstation chỉ có thể tăng năng suất. Thực vậy, có lẽ hàng chục command-line tool và development utility bạn chưa thấy có thể rút ngắn lịch phát triển. Bạn sẽ tìm hiểu thêm trong Chương 13, “Công cụ phát triển”.

Cấu hình embedded system mount root file system qua NFS lúc boot tương đối đơn giản. Đầu tiên cấu hình kernel target hỗ trợ NFS. Cũng có configuration option bật root mount remote NFS directory. Điều này minh họa ở Hình 9-3.

![Figure 9-3](images/ch09/fig09-03.png)

HÌNH 9-3 Kernel configuration cho NFS

Chú ý đã chọn NFS file system support cùng “Root file system on NFS”. Sau khi chọn các parameter kernel-configuration, còn lại là cung cấp thông tin cho kernel biết nơi tìm NFS server. Có thể dùng nhiều phương pháp, một số phụ thuộc target architecture và bootloader chọn. Tối thiểu có thể truyền parameter đúng trên kernel command line để cấu hình IP port và server information lúc power-up. Kernel command line điển hình như sau:

```
console=ttyS0,115200 ip=bootp root=/dev/nfs
```

Điều này yêu cầu kernel chờ root file system qua NFS và lấy parameter liên quan (server name, server IP address, root directory để mount) từ BOOTP server. Đây là cấu hình phổ biến, rất hữu ích trong giai đoạn phát triển dự án. Nếu cấu hình IP address target tĩnh, kernel command line có thể như sau:

```
console=ttyS0,115200                                      \
ip=192.168.11.139:192.168.11.1:192.168.11.1:255.255.255.0:coyote1:eth0:off  \
nfsroot=192.168.11.1:/coyote-target  \
root=/dev/nfs
```

Tấtnhiên,tấtcảnằmmộtdòng.Parameter`ip=`đượcđịnhnghĩatrong`.../Documentation/filesystems/nfsroot.txt` và có cú pháp sau, tất cả trên một dòng:

```
ip=<client-ip>:<server-ip>:<gw-ip>
:<netmask>:<hostname>:<device>:<autoconf>
```

Ở đây, `client-ip` là IP address target; `server-ip` là địa chỉ NFS server; `gw-ip` là gateway (router) nếu server ở subnet khác; còn `netmask` định nghĩa lớp IP addressing. `hostname` là string truyền làm target hostname; `device` là Linux device name như `eth0`; còn `autoconf` định nghĩa giao thức lấy IP parameter ban đầu như BOOTP hoặc DHCP. Cũng có thể đặt `off` để không autoconfiguration.

## 9.9 Pseudo file system

Một số file system nằm trong nhóm Pseudo File Systems của menu kernel-configuration. Cùng nhau, chúng cung cấp nhiều tiện ích hữu ích cho nhiều ứng dụng. Để biết thêm, đặc biệt về file system `/proc`, hãy dành buổi chiều khám phá tiện ích hệ thống hữu ích này. Tham chiếu tài liệu đọc thêm ở phần cuối chương.

### 9.9.1 File system /proc

File system `/proc` lấy tên từ mục đích ban đầu: interface cho kernel truyền thông tin từng process đang chạy trên Linux system. Theo thời gian, nó phát triển để cung cấp nhiều hơn process information. Chúng ta giới thiệu điểm chính ở đây; việc khám phá toàn bộ file system `/proc` để bạn tự thực hiện.

File system `/proc` gần như thiết yếu với mọi Linux system trừ loại đơn giản nhất, kể cả embedded. Nhiều function user-level dựa trên nội dung file system `/proc` để làm việc. Ví dụ lệnh `mount` không có parameter liệt kê mọi mount point đang hoạt động trên hệ thống, từ thông tin `/proc/mounts`. Nếu file system `/proc` không có, lệnh `mount` âm thầm return. Listing 9-14 minh họa trên board ADI Engineering Coyote.

LISTING 9-14 Sự phụ thuộc của mount vào `/proc`

```
# mount
rootfs on / type rootfs (rw)
/dev/root on / type nfs
(rw,v2,rsize=4096,wsize=4096,hard,udp,nolock,addr=192.168.11.19)
tmpfs on /dev/shm type tmpfs (rw)
/proc on /proc type proc (rw,nodiratime)

< Now unmount proc and try again ...>

# umount /proc
# mount
#
```

Chú ý Listing 9-14 liệt kê chính `/proc` là mounted file system, kiểu proc mount tại `/proc`. Đây không phải cách nói vòng vo; hệ thống phải có mount point `/proc` ở directory tree top-level làm nơi mount file system `/proc`.[^7] Để mount file system `/proc`, dùng lệnh `mount` như file system khác:

```
$ mount -t proc /proc /proc
```

Dạng chung lệnh `mount` từ man page là:

```
mount [-t fstype] something somewhere
```

Trong lời gọi trên, có thể thay `none` cho `/proc` như sau:

```
$ mount -t proc none /proc
```

Điều này có vẻ ít vòng vo hơn. Parameter `something` không bắt buộc vì `/proc` là pseudo file system, không phải physical device thực. Tuy nhiên chỉ định `/proc` như ví dụ đầu giúp nhớ đang mount file system `/proc` tại directory `/proc` (đúng hơn là mount point `/proc`).

Tất nhiên đến đây có thể rõ rằng muốn chức năng file system `/proc`, phải bật trong kernel configuration. Option kernel-configuration này nằm trong submenu File Systems dưới nhóm Pseudo File Systems.

Mỗi user process chạy trong kernel được biểu diễn bằng entry trong file system `/proc`. Ví dụ process `init` giới thiệu trong Chương 6 luôn được gán process ID (PID) 1. Process trong file system `/proc` được biểu diễn bằng directory có tên là PID. Ví dụ process `init` PID 1 biểu diễn bằng directory `/proc/1`. Listing 9-15 cho nội dung directory trên embedded Coyote board.

LISTING 9-15 Các entry của process `init` trong `/proc`

```
# ls -l /proc/1
total 0
-r--------    1 root  root   0 Jan  1 00:25 auxv
-r--r--r--    1 root  root   0 Jan  1 00:21 cmdline
lrwxrwxrwx    1 root  root   0 Jan  1 00:25 cwd -> /
-r--------    1 root  root   0 Jan  1 00:25 environ
lrwxrwxrwx    1 root  root   0 Jan  1 00:25 exe -> /sbin/init
dr-x------    2 root  root   0 Jan  1 00:25 fd
-r--r--r--    1 root  root   0 Jan  1 00:25 maps
-rw-------    1 root  root   0 Jan  1 00:25 mem
-r--r--r--    1 root  root   0 Jan  1 00:25 mounts
-rw-r--r--    1 root  root   0 Jan  1 00:25 oom_adj
-r--r--r--    1 root  root   0 Jan  1 00:25 oom_score
lrwxrwxrwx    1 root  root   0 Jan  1 00:25 root -> /
-r--r--r--    1 root  root   0 Jan  1 00:21 stat
-r--r--r--    1 root  root   0 Jan  1 00:25 statm
-r--r--r--    1 root  root   0 Jan  1 00:21 status
dr-xr-xr-x    3 root  root   0 Jan  1 00:25 task
-r--r--r--    1 root  root   0 Jan  1 00:25 wchan
```

Các entry này có trong file system `/proc` cho từng process đang chạy, chứa nhiều thông tin hữu ích, đặc biệt để phân tích, debug process. Ví dụ entry `cmdline` chứa command line đầy đủ gọi process, gồm mọi argument. Directory `cwd` và `root` chứa cách process nhìn current working directory và current root directory.

Một entry hữu ích hơn để debug hệ thống là `maps`. Nó chứa danh sách từng virtual memory segment gán cho chương trình, cùng attribute. Listing 9-16 là output `/proc/1/maps` trong ví dụ process `init`.

LISTING 9-16 Memory segment của process `init` từ `/proc`

```
# cat /proc/1/maps
00008000-0000f000 r-xp 00000000 00:0a 9537567    /sbin/init
00016000-00017000 rw-p 00006000 00:0a 9537567    /sbin/init
00017000-0001b000 rwxp 00017000 00:00 0
40000000-40017000 r-xp 00000000 00:0a 9537183    /lib/ld-2.3.2.so
40017000-40018000 rw-p 40017000 00:00 0
4001f000-40020000 rw-p 00017000 00:0a 9537183    /lib/ld-2.3.2.so
40020000-40141000 r-xp 00000000 00:0a 9537518    /lib/libc-2.3.2.so
40141000-40148000 ---p 00121000 00:0a 9537518    /lib/libc-2.3.2.so
40148000-4014d000 rw-p 00120000 00:0a 9537518    /lib/libc-2.3.2.so
4014d000-4014f000 rw-p 4014d000 00:00 0
befeb000-bf000000 rwxp befeb000 00:00 0
#
```

Tính hữu ích của thông tin này rất rõ. Bạn thấy program segment của chính process `init` trong hai entry đầu. Cũng thấy memory segment của shared library object mà process `init` dùng. Định dạng như sau:

```
vmstart-vmend  attr  pgoffset  devname inode filename
```

Ở đây `vmstart` và `vmend` lần lượt là virtual memory address đầu, cuối. `attr` chỉ memory region attribute như read, write, execute và cho biết region có shareable không. `pgoffset` là page offset của region (kernel virtual memory parameter). `devname`, hiển thị `xx:xx`, là biểu diễn kernel của device ID gắn với memory region. Region không gắn file cũng không gắn device—do đó `00:00`. Hai entry cuối là inode và file gắn với memory region. Tất nhiên nếu memory segment không gắn file, inode field là 0. Đây thường là data segment.

Các entry hữu ích khác được liệt kê cho từng process. Status entry chứa thông tin process đang chạy, gồm parent PID, user ID, group ID, virtual memory usage, signal và capability. Có thể lấy thêm chi tiết từ tham chiếu cuối chương.

Một số entry `/proc` thường dùng là `cpuinfo`, `meminfo` và `version`. Entry `cpuinfo` liệt kê attribute mà kernel phát hiện về processor chạy trên hệ thống. Entry `meminfo` cung cấp thống kê tổng system memory. Entry `version` phản ánh Linux kernel version string, cùng thông tin compiler và machine dùng build kernel.

Kernel sinh nhiều entry `/proc` hữu ích hơn nữa; chúng ta mới chỉ chạm bề mặt subsystem này. Nhiều tiện ích được thiết kế trích xuất, báo cáo thông tin trong file system `/proc`. Hai ví dụ phổ biến là `top` và `ps`, mà mọi lập trình viên embedded Linux nên rất quen. Chúng được giới thiệu trong Chương 13. Tiện ích khác hữu ích để giao tiếp file system `/proc` gồm `free`, `pkill`, `pmap` và `uptime`. Xem package `procps` để biết thêm.

### 9.9.2 sysfs

Như file system `/proc`, sysfs không biểu diễn physical device thực. Thay vào đó, sysfs mô hình các kernel object cụ thể như physical device và cung cấp cách liên kết device với device driver. Một số agent trong Linux distribution điển hình phụ thuộc thông tin trên sysfs.

Có thể hình dung loại object được export bằng cách xem trực tiếp directory structure mà sysfs export. Listing 9-17 cho directory `/sys` top-level trên Coyote board.

LISTING 9-17 Nội dung directory `/sys` Top-Level

```
# ls -l /sys
drwxr-xr-x  2 root root 0 Jan  1 00:00 block
drwxr-xr-x 10 root root 0 Jan  1 00:00 bus
drwxr-xr-x 23 root root 0 Jan  1 00:00 class
drwxr-xr-x  4 root root 0 Jan  1 00:00 dev
drwxr-xr-x  6 root root 0 Jan  1 00:00 devices
drwxr-xr-x  2 root root 0 Jan  1 00:00 firmware
drwxr-xr-x  2 root root 0 Jan  1 00:00 fs
drwxr-xr-x  4 root root 0 Jan  1 00:00 kernel
drwxr-xr-x 20 root root 0 Jan  1 00:00 module
#
```

sysfs cung cấp subdirectory top-level cho một số thành phần hệ thống, gồm system bus. Ví dụ dưới subdirectory `block`, mỗi block device được biểu diễn bằng subdirectory entry. Điều tương tự đúng với các directory khác ở cấp cao nhất.

Phần lớn thông tin sysfs lưu ở định dạng hợp máy đọc hơn người đọc. Ví dụ để tìm device trên PCI bus, có thể xem trực tiếp subdirectory `/sys/bus/pci`. Trên Coyote board chỉ có một PCI device (Ethernet card), directory như sau:

```
# ls -l /sys/bus/pci/devices/
0000:00:0f.0 -> ../../../devices/pci0000:00/0000:00:0f.0
```

Một phần output được cắt cho rõ. Entry thực tế là symbolic link trỏ đến node khác trong sysfs directory tree. Tên symbolic link là biểu diễn PCI bus của kernel, trỏ đến devices subdirectory `pci0000:00` (biểu diễn PCI bus). Subdirectory này chứa một số subdirectory và file biểu diễn attribute của PCI device cụ thể. Như thấy, dữ liệu khá khó tìm và parse.

Một tiện ích hữu ích giúp duyệt sysfs file system directory structure. Tên `systool`, thuộc package sysfsutils trên sourceforge.net. Đây là cách `systool` hiển thị PCI bus từ thảo luận trước:

```
$ systool -b pci
“Bus = “pci”
  0000:00:0f.0 8086:1229
```

Lại thấy biểu diễn bus và device (0f ) của kernel, nhưng công cụ hiển thị vendor ID (8086 = Intel) và device ID (1229 = eepro100 Ethernet card) lấy từ nhánh `/sys/devices/pci0000:00` của `/sys`, nơi giữ attribute. Thực thi không parameter, `systool` hiển thị system hierarchy top-level. Listing 9-18 là ví dụ từ Coyote board.

LISTING 9-18 Output từ `systool`

```
$ systool
Supported sysfs buses:
        hid
        i2c
        ide
        mdio_bus
        pci
        platform
        scsi
        usb
Supported sysfs classes:
        atm
        bdi
        block
        firmware
        hwmon
        i2c-adapter
        i2c-dev
        ide_port
        input
        leds
        mdio_bus
        mem
        misc
        mtd
        net
        pci_bus
        rtc
        scsi_device
        scsi_disk
        scsi_host
        tty
Supported sysfs devices:
        pci0000:00
        platform
        system
        virtual
Supported sysfs modules:
        8250
        ehci_hcd
        hid
        ide_gd_mod
        kernel
        libata
        lockd
        mousedev
        nfs
        printk
        scsi_mod
        spurious
        sunrpc
        tcp_cubic
        uhci_hcd
        usb_storage
        usbcore
        usbhid
```

Từ listing thấy sự đa dạng thông tin hệ thống có sẵn trong sysfs. Nhiều tiện ích dùng để xác định đặc tính system device hoặc áp chính sách hệ thống như power management và khả năng hot-plug.

Bạn có thể học thêm sysfs từ http://en.wikipedia.org/wiki/Sysfs và các tham chiếu ở đó.

## 9.10 Các file system khác

Linux hỗ trợ nhiều file system. Dung lượng trình bày không cho phép bao quát tất cả. Tuy nhiên nên biết một số file system quan trọng thường gặp trong embedded system.

Tốt nhất xem ramfs file system trong context Linux source code module triển khai nó. Listing 9-19 tái hiện vài dòng đầu file đó.

LISTING 9-19 Source module comment của Linux ramfs

```
/*
 * Resizable simple ram filesystem for Linux.
 *
 * Copyright (C) 2000 Linus Torvalds.
 *               2000 Transmeta Corp.
 *
 * Usage limits added by David Gibson, Linuxcare Australia.
 * This file is released under the GPL.
 */
/*
 * NOTE! This filesystem is probably most useful not as a real
 * filesystem, but as an example of how virtual filesystems can be
 * written.
 *
 * It doesn’t get much simpler than this. Consider that this file
 * implements the full semantics of a POSIX-compliant read-write
 * filesystem.
```

Module chủ yếu được viết làm ví dụ cách viết virtual file system. Khác biệt chính giữa file system này và ramdisk facility trong Linux kernel hiện đại là khả năng co, giãn theo sử dụng. Ramdisk không có tính chất này. Source module nhỏ gọn và viết tốt, được trình bày vì giá trị giáo dục. Bạn nên nghiên cứu ví dụ nếu muốn học thêm Linux file system.

Tmpfs file system tương tự và liên quan ramfs. Như ramfs, mọi thứ trong tmpfs lưu ở kernel virtual memory, và nội dung mất khi power-down hoặc reboot. Tmpfs hữu ích để lưu file tạm nhanh. Ví dụ tốt là mount directory `/tmp` trên tmpfs. Nó tăng hiệu năng ứng dụng dùng nhiều file tạm nhỏ. Đây cũng là cách tốt giữ directory `/tmp` sạch vì nội dung mất mỗi reboot. Mount tmpfs tương tự virtual file system khác:

```
# mount -t tmpfs /tmpfs /tmp
```

Như virtual file system khác, chẳng hạn `/proc`, parameter tmpfs đầu trong lệnh `mount` là “no-op”. Nói cách khác, có thể là từ `none` mà vẫn hoạt động. Tuy nhiên nó nhắc rằng đang mount virtual file system tên tmpfs.

## 9.11 Tạo file system đơn giản

Tạo file system image đơn giản khá dễ. Ở đây minh họa Linux kernel loopback device, cho phép dùng regular file như block device. Tóm lại, chúng ta tạo file system image trong regular file rồi dùng Linux loopback device mount file như block device khác.

Để tạo root file system đơn giản, bắt đầu bằng file fixed-sized chứa toàn số 0:

```
# dd if=/dev/zero of=./my-new-fs-image bs=1k count=512
```

Lệnh tạo file 512KB chỉ chứa số 0. Điền 0 để hỗ trợ nén sau đó và có data pattern nhất quán cho data block chưa khởi tạo trong file system. Thận trọng khi dùng lệnh `dd`. Thực thi `dd` không boundary (`count=`) hoặc boundary sai có thể làm đầy hard drive và khiến hệ thống crash. `dd` là công cụ mạnh; hãy dùng thận trọng tương xứng. Lỗi gõ đơn giản trong lệnh như `dd`, chạy bằng root, đã phá hủy vô số file system.

Khi có image file mới, thực sự format file để chứa data structure được file system nhất định định nghĩa. Trong ví dụ, tạo ext2 file system. Listing 9-20 trình bày quy trình.

LISTING 9-20 Tạo ext2 file system image

```
# /sbin/mkfs.ext2 ./my-new-fs-image
mke2fs 1.40.8 (13-Mar-2008)
./my-new-fs-image is not a block special device.
Proceed anyway? (y,n) y
Filesystem label=
OS type: Linux
Block size=1024 (log=0)
Fragment size=1024 (log=0)
64 inodes, 512 blocks
25 blocks (4.88%) reserved for the super user
First data block=1
Maximum filesystem blocks=524288
1 block group
8192 blocks per group, 8192 fragments per group
64 inodes per group

Writing inode tables: done
Writing superblocks and filesystem accounting information: done

This filesystem will be automatically checked every 21 mounts or 180
days, whichever comes first.  Use tune2fs -c or -i to override.
```

Như `dd`, lệnh `mkfs.ext2` có thể phá hủy hệ thống nên cẩn thận. Ở đây yêu cầu `mkfs.ext2` format file thay vì hard drive partition (block device) mà nó vốn nhắm tới. Vì vậy `mkfs.ext2` phát hiện và yêu cầu xác nhận. Sau xác nhận, `mkfs.ext2` ghi ext2 superblock và file system data structure vào file. Sau đó mount file như block device bằng Linux loopback device:

```
# mount -o loop ./my-new-fs-image /mnt/flash
```

Lệnh mount file `my-new-fs-image` như file system tại mount point `/mnt/flash`. Tên mount point không quan trọng; có thể mount bất cứ đâu miễn tồn tại. Dùng `mkdir` tạo mount point.

Sau khi image file mới tạo được mount như file system, có thể sửa tùy ý. Thêm xóa directory, tạo device node, v.v. Có thể dùng tar copy file vào ra. Khi sửa xong, thay đổi lưu trong file, giả sử không vượt kích thước device. Nhớ với phương pháp này kích thước cố định lúc tạo và không đổi được.

## 9.12 Tổng kết

Chương giới thiệu nhiều file system dùng trên desktop/server Linux system và embedded system. Các file system riêng cho embedded, đặc biệt Flash file system được mô tả. Các pseudo file system quan trọng cũng được trình bày.

- Partition là phân chia logic của physical device. Linux hỗ trợ nhiều partition type.

- File system được mount tại mount point trong Linux. Root file system mount ở gốc file system hierarchy và được tham chiếu là `/`.

- Ext2 file system phổ biến, trưởng thành, nhanh. Thường gặp trên embedded và Linux system khác như Red Hat, dòng Fedora Core.

- Ext3 thêm journaling trên ext2 để tăng tính toàn vẹn dữ liệu và độ tin cậy hệ thống.

- ReiserFS là journaling file system phổ biến, high-performance khác trên nhiều embedded và Linux system khác.

- JFFS2 là journaling file system tối ưu cho Flash memory. Có tính năng Flash-friendly như wear leveling để kéo dài tuổi thọ Flash memory.

- cramfs là file system read-only hoàn hảo cho boot ROM small-system và chương trình, dữ liệu read-only khác.

- NFS là một công cụ phát triển mạnh nhất cho lập trình viên embedded, đưa sức mạnh workstation đến target device. Hãy học dùng NFS làm root file system của embedded target. Sự thuận tiện và tiết kiệm thời gian sẽ xứng đáng công sức.

- Linux có nhiều pseudo file system. Một số loại quan trọng hơn được trình bày, gồm file system `/proc` và sysfs.

- Tmpfs file system RAM-based có nhiều công dụng cho embedded system. Cải tiến quan trọng nhất so ramdisk truyền thống là tự resize động đáp ứng yêu cầu hoạt động.

### 9.12.1 Gợi ý đọc thêm

“Design and Implementation of the Second Extended Filesystem” Rémy Card, Theodore Ts’o, and Stephen Tweedie First published in the Proceedings of the First Dutch International Symposium on Linux http://e2fsprogs.sourceforge.net/ext2intro.html

“A Non-Technical Look Inside the EXT2 File System” Randy Appleton www.linuxjournal.com/article/2151

Red Hat’s New Journaling File System: ext3 Michael K. Johnson www.redhat.com/support/wpapers/redhat/ext3/

Reiser4 File System http://en.wikipedia.org/wiki/Reiser4

JFFS: The Journaling Flash File System David Woodhouse http://sources.redhat.com/jffs2/jffs2.pdf

README file của dự án cramfs Không ký tên (giả định tác giả dự án) http://sourceforge.net/projects/cramfs/

Trang chủ NFS http://nfs.sourceforge.net

Tài liệu file system `/proc` www.tldp.org/LDP/lkmpg/2.6/html/c712.htm

“File System Performance: The Solaris OS, UFS, Linux ext3, and ReiserFS” Tài liệu kỹ thuật Dominic Kay www.sun.com/software/whitepapers/solaris10/fs\_performance.pdf Trang này được cố ý để trống

[^1]: Bạn sẽ học cách thực hiện trong Chương 19, “udev”.

[^2]: Thuật ngữ cylinder mượn từ đơn vị lưu trữ trên rotational medium. Nó gồm dữ liệu dưới nhóm head trên sector nhất định của disk device. Ở đây dùng để tương thích file system utility hiện có.

[^3]: Có thể cho nonroot user mount file system, như cdrom, bằng entry thích hợp trong `/etc/fstab`.

[^4]: File trên file system được biểu diễn bởi ext2 internal data structure tên inode.

[^5]: Metadata là dữ liệu về file, trái với chính dữ liệu file. Ví dụ ngày giờ, kích thước, block đã dùng của file, v.v.

[^6]: Chuyển file system theo cách này chỉ nên coi là hoạt động phát triển.

[^7]: Hoàn toàn có thể mount `/proc` bất cứ đâu trong file system, nhưng mọi tiện ích (gồm mount) cần proc đều kỳ vọng nó mount tại `/proc`.
