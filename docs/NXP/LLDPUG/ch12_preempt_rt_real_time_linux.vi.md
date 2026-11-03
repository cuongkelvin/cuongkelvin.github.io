# 12 PREEMPT_RT real-time Linux

Ứng dụng real-time có các deadline vận hành giữa một sự kiện kích hoạt và phản hồi của ứng dụng với sự kiện đó. Để đáp ứng các deadline này, lập trình viên dùng hệ điều hành real-time (RTOS), trên đó thời gian phản hồi tối đa có thể được tính hoặc đo một cách tin cậy cho ứng dụng và môi trường cho trước.

Có nhiều cách để cung cấp Real Time (RT); NXP Layerscape LDP dùng các patch Linux PREEMPT_RT (còn gọi là RT patch) để đáp ứng các yêu cầu này. Có thể tải patch PREEMPT_RT từ kernel.org. Để biết thêm về Preempt RT Linux, xem trang wiki của kernel.org.

## 12.1 Các patch PREEMPT_RT trong Layerscape LDP

Với PREEMPT_RT, dùng các branch riêng của Linux kernel `linux-x.x-rt`. Trong đó x.x là phiên bản kernel.

Các branch RT có tại https://github.com/nxp-qoriq/linux. Các patch PREEMP_RT *(ghi chú: đúng là PREEMPT_RT)* được tích hợp trong các branch kernel này.

## 12.2 Tình trạng hỗ trợ

| Nền tảng: | Hiện hỗ trợ các nền tảng sau:<br>• LS1028A (little endian, ARM64)<br>• LS1043A (little endian, ARM64)<br>• LS1046A (little endian, ARM64)<br>• LS1088A (little endian, ARM64)<br>• LS2088A (little endian, ARM64)<br>• LX2160A (little endian, ARM64) |
|---|---|
| Phần mềm: | Linux (có patch PREEMPT_RT), (SMP-Linux: không KVM) |

## 12.3 Bật Preempt RT trong Linux Kernel

Bật “ CONFIG_PREEMPT_RT=y” trong kernel:

```
General setup --->
  Preemption Model (Fully Preemptible Kernel (Real-Time) --->
    (X) Fully Preemptible Kernel (Real-Time)
```

Tính năng RT được bật mặc định trong file cấu hình `arch/arm64/configs/lsdk.config` của RT kernel Layerscape LDP.

Lưu ý rằng khi bật tính năng preempt RT, hiệu năng throughput của hệ thống có thể giảm (và mức giảm này là dự kiến theo thiết kế của RT). Không cần thay đổi riêng nào cho RT.

## 12.4 Build RT kernel bằng bitbake

Branch kernel mặc định mà bitbake dùng là kernel non-RT. Vì vậy, dùng release tag của RT kernel để build RT kernel và các thành phần khác.

**Build riêng Preempt RT Kernel Image**:

```
bitbake linux-yocto-rt
```

## 12.5 Kiểm chứng trong Linux

Để kiểm chứng patch PREEMPT_RT đã được áp dụng và RT được bật trong cấu hình Linux sau khi Linux boot, kiểm tra phiên bản Linux tại Linux prompt, tìm chuỗi `PREEMPT RT` trong chuỗi phiên bản.

Dùng lệnh sau để kiểm tra mục cấu hình kernel `CONFIG_PREEMPT_RT` đã được bật chưa:

```
root@ls2088ardb:~# zcat /proc/config.gz | grep PREEMPT_RT
CONFIG_PREEMPT_RT=y
```

## 12.6 Công cụ kiểm thử

RT-Tests là một bộ test, chứa các chương trình để kiểm thử nhiều tính năng real-time của Linux. Các chương trình sau là một phần của rt-tests:

- cyclictest: phát hiện latency
- hackbench
- pip_stress
- pi_stress
- pmqtest
- ptsematest
- rt-migrate-test
- sendme
- signaltest
- sigwaittest
- svsematest

RT-Test được tích hợp mặc định vào root filesystem Ubuntu của Layerscape LDP, nhưng không có trong root filesystem Ubuntu main. RT-test có thể được build từ source code tải từ git repository của kernel.org, hoặc cài trong Ubuntu bằng lệnh apt `sudo apt install -y rt-tests`.

Với các benchmark và công cụ kiểm thử khác, xem mục “Benchmarks and Test Cases“ trong RTwiki.

## 12.7 Kiểm thử RT Latency

Cyclictest được dùng phổ biến nhất để benchmark hệ thống RT. Đây là một trong các công cụ được dùng nhiều nhất để đánh giá hiệu năng tương đối của hệ thống real-time. Để đo latency, Cyclictest chạy một master thread non real-time (scheduling class SCHED_OTHER), thread này khởi động một số measuring thread đã định với một real-time priority đã định (scheduling class SCHED_FIFO). Các measuring thread được đánh thức định kỳ theo một khoảng đã định bởi một timer hết hạn (cyclic alarm). Sau đó, độ chênh giữa thời điểm wake-up được lập trình và thời điểm wake-up thực tế được tính và chuyển cho master thread qua shared memory. Master thread theo dõi các giá trị latency và in ra latency nhỏ nhất, lớn nhất và trung bình. Để biết thêm, xem trang wiki Cyclictest.

Ví dụ:

```
root@ls2088ardb:~# cyclictest -a 1 -t 1 -m -n -p 98 -D 2h
```

Lệnh này tạo một RT thread chạy trên CPU Core 1 với priority 98. "`-m`" cho biết nó sẽ lock các cấp phát bộ nhớ hiện tại và tương lai, "-n" cho biết nanosleep sẽ dùng hàm `clock_nanosleep`.

**KHÔNG** chạy cyclictest với priority 99. Có một vài thread quản lý cần chạy với priority cao hơn ứng dụng của bạn, ví dụ các thread watchdog.

## 12.8 Tinh chỉnh hiệu năng RT

RT latency liên quan tới toàn bộ hệ thống real-time gồm phần cứng, firmware, Linux kernel và mọi ứng dụng, dịch vụ user space. Vì vậy cần tinh chỉnh RT latency cho từng hệ thống cụ thể để có RT latency thấp hơn và giảm latency jitter. Nói chung, phương pháp cấu hình hệ thống sau có ích cho việc tinh chỉnh hiệu năng RT.

1. Đổi CPU frequency governor để giảm ảnh hưởng của việc hạ tần số CPU. Ví dụ, đổi cpufreq governor thành "performance" cho CPU Core đang chạy ứng dụng real-time.

   ```
   root@ls1028ardb:~# echo performance > /sys/devices/system/cpu/cpu0/cpufreq/
   scaling_governor
   ```

2. Dùng IRQ Affinity để giảm ảnh hưởng của interrupt lên CPU Core chạy ứng dụng real-time. Ví dụ, dùng lệnh sau để đổi affinity của interrupt 121, interrupt chạy trên CPU Core 0:

   ```
   root@ls1028ardb:~# echo 1 > /proc/irq/121/smp_affinity
   ```

3. Dùng CPU isolation để cô lập Core chạy ứng dụng real-time.

   Ví dụ, thêm `isolcpus=3` vào bootargs để cô lập CPU Core 3, core chạy ứng dụng real-time. Việc này để giảm context switch trên Core 3 và có hiệu năng RT latency tốt hơn.

   Dùng lệnh sau để kiểm tra Core nào được cô lập:

   ```
   root@ls1028ardb:~# cat /sys/devices/system/cpu/isolated
   ```

4. Đặt CPU affinity cho process để cân bằng task trên Core chạy ứng dụng real-time. Ví dụ, để dùng taskset chỉ định một PID có sẵn '2726' chạy trên Core 1, dùng lệnh sau:

   ```
   root@ls1028ardb:~# taskset -pc 1 2726
   ```

5. Tính năng PREEMPT_RT cung cấp tính năng RTT (Real-Time throttling). Để biết chi tiết về RTT, xem `Documentation/scheduler/sched-rt-group.txt` trong source code Linux. RTT có thể bị kích hoạt nếu traffic nặng dẫn tới latency cao. Có thể tắt nó bằng lệnh sau:

   ```
   root@ls1028ardb:~# echo -1 > /proc/sys/kernel/sched_rt_runtime_us
   ```

   Bảo đảm hệ thống không bị treo do mọi tài nguyên CPU bị các thread real-time dùng hết.

6. Build ứng dụng RT của bạn. Ngoài việc làm cho phần cứng và OS có khả năng real time, ta cũng cần tuân theo một số quy tắc khi build ứng dụng real-time để có hiệu năng latency tốt hơn, như cố gắng giảm page-fault, dùng đúng timer và lock, gán đúng RT priority, và cố gắng giảm context switch. Để biết thêm chi tiết, xem HOWTO: Build an RT-application.

## 12.9 Tài liệu hỗ trợ

Các tài liệu hỗ trợ có tại https://wiki.linuxfoundation.org/realtime/start.
