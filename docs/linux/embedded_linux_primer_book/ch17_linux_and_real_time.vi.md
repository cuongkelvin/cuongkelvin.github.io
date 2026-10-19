# Chương 17. Linux và real time

## Trong chương này

- 17\.1 Real time là gì? 466

- 17\.2 Kernel preemption 469

- 17\.3 Kernel patch Real-Time 473

- 17\.4 Phân tích hiệu năng kernel Real-Time 478

- 17\.5 Tổng kết 485

Khi Linux bắt đầu trên Intel i386 processor, không ai ngờ

thành công của Linux trong server application. Thành công ấy

dẫn đến port Linux sang nhiều architecture và được dùng bởi

lập trình viên embedded system từ cellular handset tới telecommunications

switch. Cách đây không lâu, nếu ứng dụng có yêu cầu real-time, bạn

có lẽ không đưa Linux vào lựa chọn operating system.

Điều đó đã đổi nhờ phát triển Linux real-time, được thúc đẩy phần

lớn bởi ứng dụng audio, multimedia.

Chương bắt đầu bằng lịch sử ngắn phát triển tính năng Linux real-time.

Sau đó xem tiện ích cho lập trình viên real-time

và cách dùng.

## 17.1 Real time là gì?

Hỏi năm người “real time” nghĩa gì, có lẽ nhận năm đáp án. Có người còn nêu con số. Trong thảo luận này sẽ xét nhiều tình huống rồi đề xuất định nghĩa. Nhiều yêu cầu được gọi soft real time, số khác hard real time.

### 17.1.1 Soft real time

Phần lớn đồng ý soft real time nghĩa operation có deadline. Nếu trễ, chất lượng trải nghiệm giảm nhưng không chí mạng. Desktop workstation là ví dụ hoàn hảo yêu cầu soft real-time. Khi sửa tài liệu, mong thấy kết quả gõ trên màn hình ngay. Khi phát mp3 ưa thích, mong audio high-quality không tiếng click, pop hoặc ngắt quãng.

Nhìn chung con người không thấy, nghe delay dưới vài chục millisecond. Tất nhiên nhạc sĩ nói delay nhỏ hơn vẫn ảnh hưởng nhạc. Nếu sự kiện soft real-time so-called này lỡ deadline, kết quả có thể không mong muốn, giảm “chất lượng” trải nghiệm nhưng không thảm họa.

### 17.1.2 Hard real time

Hard real time đặc trưng bởi hậu quả lỡ deadline. Trong hệ hard real-time, hậu quả thường thảm họa. Tất nhiên thảm họa là tương đối. Nếu embedded device điều khiển fuel flow của jet aircraft engine, lỡ deadline phản hồi pilot input hoặc thay đổi đặc tính vận hành có thể dẫn hậu quả tai hại.

Chú ý thời lượng deadline không quyết định đặc tính real-time. Phục vụ tick atomic clock là ví dụ. Miễn xử lý tick trong cửa sổ 1-second trước tick tiếp, dữ liệu hợp lệ. Bỏ xử lý tick có thể làm GPS lệch nhiều foot, thậm chí mile!

Với điều này, dùng định nghĩa phổ biến soft/hard real time. Với soft real-time, giá trị computation/result giảm nếu trễ. Với hard real-time, theo định nghĩa chỉ lỡ một deadline cũng coi hệ thống thất bại, có thể hậu quả thảm họa.

### 17.1.3 Linux scheduling

UNIX/Linux thiết kế công bằng process scheduling. Scheduler cố phân phối resource giữa mọi process cần CPU, bảo đảm tiến triển. Mục tiêu này trái yêu cầu real-time process. Process real-time phải được ưu tiên tuyệt đối khi ready. Real time nghĩa latency dự đoán, lặp lại được.

### 17.1.4 Latency

Process Real-time thường gắn physical event như interrupt từ peripheral. Hình 17-1 minh họa latency component Linux. Bắt đầu đo khi nhận interrupt muốn xử lý, thời điểm t0. Sau đó interrupt diễn ra, quyền sang interrupt service routine (ISR), t1. Interrupt latency gần hoàn toàn do maximum interrupt off time[^1]—thời gian trong execution thread tắt hardware interrupt.

![Figure 17-1](images/ch17/fig17-01.png)

HÌNH 17-1 Các latency component

Giảm xử lý trong ISR thực là thực hành thiết kế tốt. Execution context này hạn chế (ISR không gọi blocking function có thể sleep). Vì vậy nên chỉ phục vụ hardware device, để xử lý dữ liệu cho Linux bottom half, còn gọi softirq. Có nhiều kiểu xử lý bottom-half, mô tả tốt nhất trong Linux Kernel Development của Robert Love; tham chiếu cuối chương.

Khi ISR/bottom half xong, thường wake user space process chờ data, t2 Hình 17-1. Sau đó scheduler chọn real-time process và giao CPU, t3. Scheduling latency chủ yếu ảnh hưởng bởi số process chờ CPU và priority. Đặt attribute Real Time (`SCHED_FIFO` hoặc `SCHED_RR`) ưu tiên hơn normal Linux process, cho được chọn tiếp, giả định là process real-time highest-priority chờ CPU. Process real-time highest-priority ready (không block I/O) luôn chạy. Sẽ thấy cách đặt attribute ngay sau.

## 17.2 Kernel preemption

Thời Linux 1.x chưa có kernel preemption. Khi user space process request kernel service, không task khác được schedule tới khi process block (sleep) chờ gì đó (thường I/O) hoặc kernel request xong. Làm kernel preemptable[^2] nghĩa khi process chạy trong kernel, process khác preempt và chạy dù process đầu chưa xong xử lý in-kernel. Hình 17-2 minh họa.

![Figure 17-2](images/ch17/fig17-02.png)

HÌNH 17-2 Kernel preemption

Trong hình, Process A vào kernel qua system call, có thể `write()` tới console hoặc file. Khi kernel thực thi thay A, Process B priority cao hơn được interrupt wake. Kernel preempt A, giao CPU B, dù A chưa block, chưa xong kernel processing.

### 17.2.1 Trở ngại preemption

Thách thức kernel fully preemptable là xác định mọi nơi phải bảo vệ khỏi preemption. Đây là critical section không được preempt. Ví dụ A Hình 17-2 đang file system operation trong kernel. Đến lúc code cần ghi in-kernel data structure biểu diễn file. Để tránh hỏng structure, phải khóa mọi process khác truy cập shared data structure. Listing 17-1 minh họa bằng cú pháp C.

LISTING 17-1 Khóa critical section

```
...
  preempt_disable();
  ...
  /* Critical section */
  update_shared_data();
  ...
  preempt_enable();
...
```

Nếu không bảo vệ shared data như vậy, process cập nhật có thể bị preempt giữa chừng. Process khác thử cập nhật cùng shared data gần chắc chắn hỏng. Ví dụ kinh điển hai process thao tác trực tiếp common variable, quyết định dựa value. Hình 17-3 minh họa.

![Figure 17-3](images/ch17/fig17-03.png)

HÌNH 17-3 Shared data concurrency error

Hình 17-3, A bị interrupt sau update shared data nhưng trước quyết định dựa nó. Theo thiết kế A không phát hiện bị preempt. B đổi value trước A chạy lại. Thấy A quyết định theo value B xác định. Nếu không muốn hành vi này, phải tắt preemption ở A quanh shared data—ở đây operation, quyết định trên variable count.

### 17.2.2 Preemption model

Giải pháp đầu kernel preemption đặt check tại vị trí chiến lược biết an toàn preempt current execution thread: entry/exit system call, release một số kernel lock, return từ interrupt processing. Ở mỗi điểm dùng code tương tự Listing 17-2 để preempt.

LISTING 17-2 Kiểm tra preemption theo Linux 2.4+ preempt patch

```
...
  /*
   * This code is executed at strategic locations within
   * the Linux kernel where it is known to be safe to
   * preempt the current thread of execution
   */
  if (kernel_is_preemptable() && current->need_resched)
    preempt_schedule();
...

  /*
   * This code is in .../kernel/sched.c and is invoked from
   * those strategic locations as above
   */
  #ifdef CONFIG_PREEMPT
  asmlinkage void preempt_schedule(void)
  {
    while (current->need_resched) {
        ctx_sw_off();
        current->state |= TASK_PREEMPTED;
        schedule();
        current->state &= ~TASK_PREEMPTED;
        ctx_sw_on_no_preempt();
    }
  }
  #endif
...
```

Code snippet đầu Listing 17-2 (đơn giản hóa code thực) gọi tại vị trí chiến lược vừa nói, biết kernel an toàn preempt. Snippet thứ hai trong Listing 17-2 là code thực kernel Linux 2.4 đầu áp preempt patch. Loop `while` thú vị gây context switch qua `schedule()` tới khi đáp ứng mọi preemption request.

Dù giảm latency, cách này chưa lý tưởng. Người làm low latency sớm thấy cần “đảo logic”. Với model trước:

- Linux kernel cơ bản nonpreemptable.

- Preemption check rải tại vị trí chiến lược biết an toàn.

- Chỉ bật preemption tại điểm known-safe.

Muốn giảm latency thêm đáng kể, cần preemptable kernel:

- Linux kernel fully preemptable mọi nơi.

- Chỉ tắt preemption quanh critical section.

Đây là hướng kernel developer từ original preemptable kernel patch series. Nhưng không dễ: xem toàn source code base, phân tích chính xác data cần bảo vệ concurrency, chỉ tắt preemption ở đó. Phương pháp là instrument kernel đo latency, tìm code path lâu nhất, sửa. Kernel Linux 2.6 mới hơn có thể cấu hình cho ứng dụng low-latency nhờ nỗ lực phương pháp “lock-breaking”.

### 17.2.3 SMP kernel

Thú vị là nhiều việc tạo multiprocessor architecture hiệu quả cũng lợi real time. Symmetric multiprocessing (SMP) có nhiều CPU thường trên một board dùng chung memory, resource. Thách thức phức tạp hơn uniprocessor vì thêm concurrency cần bảo vệ. Uniprocessor chỉ một task thực thi trong kernel mỗi lúc, chỉ cần chống interrupt/exception processing. SMP có nhiều execution thread trong kernel ngoài nguy cơ interrupt/exception.

SMP hỗ trợ từ kernel Linux 2.x đầu. Big kernel lock (BKL) bảo vệ concurrency khi chuyển uniprocessor sang SMP. BKL là global spinlock ngăn task khác thực thi kernel. Trong Linux Kernel Development, Robert Love gọi BKL là “đứa con ghẻ tóc đỏ của kernel”. Khi mô tả, Robert đùa thêm “xấu xa” vào attribute!

SMP kernel ban đầu dựa BKL gây scheduling kém hiệu quả đáng kể, một CPU có thể idle lâu. Nhiều việc tạo SMP hiệu quả cũng trực tiếp lợi ứng dụng real-time—chủ yếu hạ latency. Thay BKL bằng locking smaller-grained chỉ quanh shared data cần bảo vệ giảm đáng kể preemption latency.

### 17.2.4 Nguồn preemption latency

Hệ real-time phải phục vụ task real-time trong upper time boundary chỉ định. Đạt preemption latency thấp nhất quán thiết yếu với hệ real-time. Hai đóng góp lớn nhất là xử lý interrupt-context, critical section tắt interrupt. Đã biết nỗ lực giảm kích thước (thời lượng) critical section. Còn interrupt-context là thách thức tiếp, được giải bằng Linux 2.6 real-time patch.

## 17.3 Kernel patch Real-Time

Hard real time vẫn chưa trong mainline kernel.org source tree. Muốn bật phải áp patch. Patch real-time kernel là kết quả tích lũy nhiều sáng kiến giảm latency, nhiều người đóng góp, hiện Ingo Molnar duy trì tại www.kernel.org/pub/linux/kernel/projects/rt/. Hiệu năng soft real-time kernel 2.6 tăng mạnh từ release đầu. Khi 2.6 mới ra, 2.4 tốt hơn đáng kể về soft real-time. Từ khoảng 2.6.12 dễ đạt soft real-time single-digit millisecond trên x86 khá nhanh. Latency lặp lại được cỡ microsecond cần real-time patch.

Patch real-time thêm nhiều tính năng quan trọng. Hình 17-4 cho configuration option Preemption mode sau patch real-time.

![Figure 17-4](images/ch17/fig17-04.png)

HÌNH 17-4 Preemption mode với real-time patch

Patch real-time thêm mode thứ tư `PREEMPT_RT`, Preempt Real Time. Bốn mode:

- `PREEMPT_NONE`—Không forced preemption. Latency tổng tốt trung bình nhưng đôi khi delay dài. Hợp nhất khi overall throughput là tiêu chí hàng đầu.

- `PREEMPT_VOLUNTARY`—Bước giảm latency đầu. Thêm explicit preemption point tại vị trí chiến lược kernel. Đổi chút throughput lấy latency thấp.

- `PREEMPT_DESKTOP`—Bật preemption mọi nơi trừ critical section. Hữu ích ứng dụng soft real-time như audio, multimedia. Đổi throughput lấy latency thấp hơn.

- `PREEMPT_RT`—Thêm tính năng patch real-time, gồm thay spinlock bằng preemptable mutex. Cho involuntary preemption mọi nơi trừ vùng `preempt_disable()` bảo vệ. Làm mượt mạnh biến thiên latency (jitter), cho latency thấp, dự đoán được với ứng dụng real-time time-critical.

Nếu bật kernel preemption trong configuration, tắt lúc boot bằng parameter sau trên command line:

```
preempt=0
```

### 17.3.1 Tính năng Real-Time

Một số tính năng kernel mới bật với `CONFIG_PREEMPT_RT`. Hình 17-4 có setting mới. Những tính năng này và khác của real-time patch được mô tả đây.

Patch real-time chuyển phần lớn spinlock thành mutex priority-inheritance. Giảm overall latency đổi thêm overhead xử lý spinlock (mutex), giảm throughput. Lợi ích chuyển là có thể preempt. Nếu A giữ lock, B priority cao hơn cần cùng lock, A có thể preempt B khi giữ mutex.

Chọn `CONFIG_PREEMPT_HARDIRQS`, ISR buộc chạy process context. Cho developer điều khiển priority ISR vì thành schedulable entity. Như vậy cũng preemptable cho interrupt hardware higher-priority xử lý trước. Vì schedule được, có thể gán priority như task khác theo yêu cầu.

Tính năng mạnh. Một số hardware architecture không enforce interrupt priority. Loại có cũng có thể không khớp mục tiêu real-time. Dùng `CONFIG_PREEMPT_HARDIRQS` tự định nghĩa priority mỗi IRQ chạy.

`CONFIG_PREEMPT_SOFTIRQS` giảm latency bằng chạy softirq trong context kernel softirq daemon (ksoftirqd). Ksoftirqd là Linux task (process) đúng nghĩa, có priority, schedule cùng task khác. Nếu kernel real time và bật `CONFIG_PREEMPT_SOFTIRQS`, task ksoftirqd nâng real-time priority xử lý softirq.[^3] Listing 17-3 cho code kernel gần đây trong `.../kernel/softirq.c`.

LISTING 17-3 Nâng ksoftirqd lên trạng thái Real-Time

```
static int ksoftirqd(void * __data)
{
   /* Priority needs to be below hardirqs */
    struct sched_param param = { .sched_priority = MAX_USER_RT_PRIO/2 - 1};
    struct softirqdata *data = __data;
    u32 softirq_mask = (1 << data->nr);
    struct softirq_action *h;
    int cpu = data->cpu;

    sys_sched_setscheduler(current->pid, SCHED_FIFO, &param);
    current->flags |= PF_SOFTIRQ;
...
```

Thấy kernel task `ksoftirqd` nâng thành real-time task (`SCHED_FIFO`) bằng kernel function `sys_sched_setscheduler()`.

### 17.3.2 O(1) scheduler

O(1) scheduler có từ Linux 2.5. Nêu vì thiết yếu giải pháp real-time, cải tiến đáng kể scheduler cũ. Mở rộng tốt hơn với nhiều process, giúp overall latency thấp hơn.

Nếu thắc mắc O(1) là ký hiệu toán cho hệ bậc một. Ở context này nghĩa thời gian scheduling decision không phụ thuộc số process trên runqueue. Scheduler cũ không có, hiệu năng giảm theo số process.[^4]

### 17.3.3 Tạo process Real-Time

Có thể đánh dấu process real time bằng process attribute scheduler dùng trong thuật toán. Listing 17-4 cho phương pháp chung.

LISTING 17-4 Tạo process Real-Time

```
#include <sched.h>

#define MY_RT_PRIORITY MAX_USER_RT_PRIO /* Highest possible */

int main(int argc, char **argv)
{
      ...
      int rc, old_scheduler_policy;
      struct sched_param my_params;
      ...

      /* Passing zero specifies caller’s (our) policy */
      old_scheduler_policy = sched_getscheduler(0);

      my_params.sched_priority = MY_RT_PRIORITY;
      /* Passing zero specifies callers (our) pid */
      rc = sched_setscheduler(0, SCHED_RR, &my_params);
      if ( rc == -1 )
            handle_error();
      ...
}
```

Snippet làm hai việc trong `sched_setscheduler()`: đổi policy `SCHED_RR`, nâng priority tối đa hệ thống. Linux hỗ trợ ba policy:

- `SCHED_OTHER`—Normal Linux process, fairness scheduling.

- `SCHED_RR`—Process Real-time có time slice. Tức nếu không block, được chạy khoảng thời gian scheduler xác định.

- `SCHED_FIFO`—Process Real-time chạy đến block hoặc chủ động yield processor, hoặc process `SCHED_FIFO` higher-priority khác runnable.

Man page `sched_setscheduler()` có thêm chi tiết ba policy.

## 17.4 Phân tích hiệu năng kernel Real-Time

Instrumentation xem hiệu năng kernel real-time từng hơi tùy biến. Thời đó qua rồi. Ftrace thay cơ chế cũ khi bản đầu sách xuất bản. Bộ tracing tool mạnh cho xem chi tiết trong kernel. Documentation đầy đủ tại `.../Documentation/trace/ftrace.txt` trong source tree.

### 17.4.1 Dùng Ftrace để tracing

Phải bật Ftrace trong kernel configuration trước dùng. Hình 17-5 cho parameter liên quan từ release gần đây.

![Figure 17-5](images/ch17/fig17-05.png)

HÌNH 17-5 Kernel configuration cho Ftrace

Ftrace có nhiều module. Nên chỉ chọn thứ cần cho test session vì mỗi loại thêm overhead kernel.

Framework bật tracing qua interface export ra debugfs. Giả sử bật Ftrace đúng, phải mount debugfs như sau:

```
# mount -t debugfs debug /sys/kernel/debug
```

Xong thấy directory dưới `/sys/kernel/debug` tên `tracing`. Directory `tracing` chứa mọi control, output source của Ftrace. Sẽ rõ khi tương tác các phần sau. Theo gợi ý kernel documentation, dùng symlink `/tracing` đơn giản hóa báo cáo, tương tác subsystem:

```
# ln -s /sys/kernel/debug/tracing /tracing
```

Từ đây tham chiếu `/tracing` thay path dài `/sys/kernel/debug/tracing`.

### 17.4.2 Đo preemption off latency

Kernel dùng lời gọi tắt preemption khi xử lý critical shared data structure. Khi tắt, interrupt vẫn xảy ra nhưng process higher-priority không chạy được. Có thể profile preempt off time bằng preemptoff Ftrace.

Bật đo bằng `PREEMPT_TRACER`, `PREEMPT_OFF_HIST` trong submenu Kernel hacking. Trace mode phát hiện latency path dài nhất khi tắt preemption.

Phương pháp chung chuẩn bị Ftrace đo preemptoff:

```
# echo preemptoff >/tracing/current_tracer
# echo latency-format > /tracing/trace_options
# echo 0 >/tracing/tracing_max_latency
# echo 1 > /tracing/tracing_enabled
 <do some processing>
# echo 0 > /tracing/tracing_enable
```

Listing 17-5 cho trace output từ chuỗi lệnh. Chú ý maximum latency 221 microsecond trong header.

LISTING 17-5 Preemptoff trace

```
# cat /tracing/trace
# tracer: preemptoff
#
# preemptoff latency trace v1.1.5 on 2.6.33.4-rt20
# --------------------------------------------------------------------
# latency: 221 us, #239/239, CPU#0 | (M:preempt VP:0, KP:0, SP:0 HP:0 #P:8)
#    -----------------
#    | task: -0 (uid:0 nice:0 policy:0 rt_prio:0)
#    -----------------
#  => started at: acpi_idle_enter_bm
#  => ended at:   rest_init
#
#
#                  _------=> CPU#
#                 / _-----=> irqs-off
#                | / _----=> need-resched
#                || / _---=> hardirq/softirq
#                ||| / _--=> preempt-depth
#                |||| /_--=> lock-depth
#                |||||/     delay
#  cmd     pid   |||||| time  |   caller
#     \   /      ||||||   \   |   /
  <idle>-0       0d..1.    0us : acpi_idle_do_entry <-acpi_idle_enter_bm
  <idle>-0       0d..1.    1us : ktime_get_real <-acpi_idle_enter_bm
  <idle>-0       0d..1.    1us : getnstimeofday <-ktime_get_real
  <idle>-0       0d..1.    1us : ns_to_timeval <-acpi_idle_enter_bm
  <idle>-0       0d..1.    1us : ns_to_timespec <-ns_to_timeval
<... many lines omitted for brievity...>
  <idle>-0       0d..3.  220us : native_apic_mem_write <-lapic_next_event
  <idle>-0       0d..3.  220us : _raw_spin_unlock_irqrestore
<-tick_broadcast_oneshot_control
  <idle>-0       0d..2.  220us : _raw_spin_unlock_irqrestore <-clockevents_notify
  <idle>-0       0d..1.  220us : enter_idle <-cpu_idle
  <idle>-0       0d..1.  221us : __rcu_read_lock <-__atomic_notifier_call_chain
  <idle>-0       0d..1.  221us : __rcu_read_unlock
<-__atomic_notifier_call_chain
  <idle>-0       0d..1.  221us : cpu_idle <-rest_init
  <idle>-0       0d..1.  221us : stop_critical_timings <-rest_init

# cat /tracing/tracing_max_latency
221
```

Chú ý hai dòng cuối Listing 17-5. Hiện maximum latency Ftrace ghi bằng nội dung `tracing_max_latency`. Giá trị luôn cập nhật maximum latency ghi được và output trace file (toàn Listing 17-5) tương ứng path qua hệ thống gắn latency dài nhất.

### 17.4.3 Đo wakeup latency

Phép đo quan trọng nhất với developer real-time là bao lâu task high-priority chạy sau được báo. Khi process real-time (attribute `SCHED_FIFO` hoặc `SCHED_RR`) chạy, theo định nghĩa chia sẻ processor với task khác. Khi event cần phục vụ, task real-time được wake, tức báo scheduler cần chạy. Wakeup timing từ wakeup event tới lúc task thực có CPU, bắt đầu chạy.

Ftrace có trace facility wakeup, wakeup\_rt, ghi, trace latency dài nhất từ wake tới run khi tracer bật.

Listing 17-6 sinh từ C test program tạo, ghi file. Trước I/O, nâng thành `SCHED_RR` priority 99, setup tracing bằng write stdio tương tự lệnh shell:

```
# echo 0 > /tracing/tracing_enabled
# echo 0 > /tracing/tracing_max_latency (resets the max record back to zero)
# echo wakeup > /tracing/current_tracer
# echo 1 > /tracing/tracing_enabled
```

Sau test program gọi, tracing hoàn tất. Listing 17-6 cho kết quả, maximum wakeup latency 7 microsecond.

LISTING 17-6 Wakeup timing trace

```
root@speedy:~# cat /tracing/trace
# tracer: wakeup
#
# wakeup latency trace v1.1.5 on 2.6.33.4-rt20
# --------------------------------------------------------------------
# latency: 7 us, #35/35, CPU#4 | (M:preempt VP:0, KP:0, SP:0 HP:0 #P:8)
#    -----------------
#    | task: -6006 (uid:0 nice:0 policy:2 rt_prio:99)
#    -----------------
#
#                  _------=> CPU#
#                 / _-----=> irqs-off
#                | / _----=> need-resched
#                || / _---=> hardirq/softirq
#                ||| / _--=> preempt-depth
#                |||| /_--=> lock-depth
#                |||||/     delay
#  cmd     pid   |||||| time  |   caller
#     \   /      ||||||   \   |   /
    sshd-1789    4d.h3.    0us :   1789:120:R   + [004]  6006:  0:S rt
    sshd-1789    4d.h3.    1us : wake_up_process <-hrtimer_wakeup
    sshd-1789    4d.h2.    1us : check_preempt_wakeup <-try_to_wake_up
    sshd-1789    4d.h2.    1us : resched_task <-check_preempt_wakeup
    sshd-1789    4dNh2.    2us : task_woken_rt <-try_to_wake_up
    sshd-1789    4dNh2.    2us : _raw_spin_unlock_irqrestore <-try_to_wake_up
    sshd-1789    4dNh1.    2us : preempt_schedule <-_raw_spin_unlock_irqrestore
    sshd-1789    4dNh..    2us : preempt_schedule <-try_to_wake_up
    sshd-1789    4dNh..    2us : _raw_spin_lock <-__run_hrtimer
    sshd-1789    4dNh1.    3us : _raw_spin_unlock <-hrtimer_interrupt
    sshd-1789    4dNh..    3us : preempt_schedule <-_raw_spin_unlock
    sshd-1789    4dNh..    3us : tick_program_event <-hrtimer_interrupt
    sshd-1789    4dNh..    3us : tick_dev_program_event <-tick_program_event
    sshd-1789    4dNh..    4us : ktime_get <-tick_dev_program_event
    sshd-1789    4dNh..    4us : clockevents_program_event
<-tick_dev_program_event
    sshd-1789    4dNh..    4us : lapic_next_event <-clockevents_program_event
    sshd-1789    4dNh..    4us : native_apic_mem_write <-lapic_next_event
    sshd-1789    4dNh..    4us : irq_exit <-smp_apic_timer_interrupt
    sshd-1789    4dN.1.    4us : rcu_irq_exit <-irq_exit
    sshd-1789    4dN.1.    5us : idle_cpu <-irq_exit
    sshd-1789    4dN...    5us : preempt_schedule_irq <-retint_kernel
    sshd-1789    4dN...    5us : __schedule <-preempt_schedule_irq
    sshd-1789    4dN...    5us : rcu_sched_qs <-__schedule
    sshd-1789    4dN.1.    6us : _raw_spin_lock_irq <-__schedule
    sshd-1789    4d..2.    6us : put_prev_task_fair <-__schedule
    sshd-1789    4d..2.    6us : update_curr <-put_prev_task_fair
    sshd-1789    4d..2.    6us : task_of <-update_curr
    sshd-1789    4d..2.    6us : cpuacct_charge <-update_curr
    sshd-1789    4d..2.    6us : __rcu_read_lock <-cpuacct_charge
    sshd-1789    4d..2.    7us : __rcu_read_unlock <-cpuacct_charge
    sshd-1789    4d..2.    7us : __enqueue_entity <-put_prev_task_fair
    sshd-1789    4d..2.    7us : pick_next_task_rt <-__schedule
    sshd-1789    4d..2.    7us : dequeue_pushable_task <-pick_next_task_rt
    sshd-1789    4d..3.    8us : __schedule <-preempt_schedule_irq
    sshd-1789    4d..3.    8us :   1789:120:R ==> [004]  6006:  0:R rt
```

Khi chạy, test program làm file I/O rồi sleep, bảo đảm yield processor dù không block I/O. Trace Listing 17-6 thú vị: header cho PID 6006 priority 99, maximum latency 7 microsecond—rất chấp nhận được.

Dòng đầu trace là wakeup event. Process PID 1789 (ssh daemon) đang chạy lúc đó. Trace cuối là context switch thực từ `sshd` sang test program PID 6006 RT priority. Dòng giữa là kernel path và relative time.

Tham khảo subdirectory a`.../Documentation` của kernel source tree cho `trace/ftrace.txt` để thêm chi tiết.

Maximum latency cung cấp riêng trong trace file khác. Để hiện maximum wakeup latency trong tracing run cụ thể, gọi:

```
root@speedy:~# cat /tracing/tracing_max_latency
7
```

### 17.4.4 Interrupt off timing

Muốn đo maximum interrupt off timing, bảo đảm bật `IRQSOFF_TRACER`. Option đo thời gian critical section tắt IRQ. Hoạt động như wakeup latency timing. Bật phép đo với root:

```
# echo irqsoff >/tracing/current_tracer
# echo latency-format > /tracing/trace_options
# echo 0 > /tracing/tracing_max_latency
# echo 1 > /tracing/tracing_enabled
< ... some processing ...>
# echo 0 > /tracing/tracing_enabled
```

Đọc current maximum bằng hiện nội dung `/tracing/tracing_max_latency`:

```
# cat /tracing/tracing_max_latency
97
```

Thấy wakeup, interrupt off latency cùng bật, hiển thị qua một file. Tức chỉ cấu hình một phép đo mỗi lần hoặc kết quả có thể sai. Vì thêm runtime overhead đáng kể, bật hết cùng lúc cũng không khôn ngoan.

### 17.4.5 Phát hiện soft lockup

Bật `DETECT_SOFTLOCKUP` trong configuration để phát hiện thời gian dài kernel mode không context switch. Có trong kernel non-real-time nhưng hữu ích phát hiện path very-high-latency hoặc soft deadlock. Chỉ bật, theo dõi report console/system log. Report dạng:

```
BUG: soft lockup detected on CPU0
```

Khi kernel phát message thường kèm backtrace, thông tin như process name/PID. Giống kernel oops đầy đủ register. Xem `.../kernel/softlockup.c`. Dùng thông tin tìm nguồn lockup.

## 17.5 Tổng kết

Linux ngày càng dùng nơi cần real-time performance: multimedia, robot controller, industrial controller, automotive controller. Chương trình bày khái niệm nền, kỹ thuật phân tích giúp phát triển, debug ứng dụng real-time.

- Hệ Real-time đặc trưng deadline. Lỡ deadline gây bất tiện, giảm trải nghiệm là soft real time. Ngược lại hard real-time coi thất bại khi lỡ deadline.

- Kernel preemption là tính năng lớn đầu trong Linux kernel xử lý latency system-wide.

- Kernel gần đây hỗ trợ nhiều preemption mode từ không tới full real-time.

- Patch real-time thêm tính năng then chốt cho latency thấp đáng tin.

- Patch real-time có công cụ đo quan trọng giúp debug, mô tả implementation Linux real-time.

### 17.5.1 Gợi ý đọc thêm

Linux Kernel Development, 3rd Edition Robert Love Addison-Wesley, 2010 Trang này được cố ý để trống

[^1]: Bỏ qua context switching time interrupt vì thường không đáng kể so interrupt off time.

[^2]: Thú vị là có nhiều tranh luận viết preemptable thế nào đúng! Tôi theo khảo sát Rick Lehrbaum tại www.linuxdevices.com/articles/AT5136316996.html.

[^3]: Xem Linux Kernel Development cuối chương để học thêm softirq.

[^4]: Lại giới thiệu sách Robert Love cho thảo luận tuyệt vời O(1) scheduler và phê phán thú vị algorithmic complexity, nguồn ký hiệu O(1).
