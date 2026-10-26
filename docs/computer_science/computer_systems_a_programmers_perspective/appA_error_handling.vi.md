# A Xử lý lỗi

## A.1 Xử lý lỗi trong các hệ thống Unix

Các lời gọi function systems-level mà chúng ta sẽ gặp trong sách sử dụng ba kiểu trả về lỗi khác nhau: Unix-style, Posix-style và GAI-style.

### Xử lý lỗi Unix-Style

Các function như fork và wait được phát triển trong thời kỳ đầu của Unix (cũng như một số function Posix cũ) sử dụng giá trị trả về của function cho cả error code lẫn kết quả hữu ích. Ví dụ, khi function wait Unix-style gặp lỗi (chẳng hạn không có child process nào để thu hồi), nó trả về −1 và đặt global variable errno thành một error code chỉ nguyên nhân lỗi. Nếu wait hoàn tất thành công, nó trả về kết quả hữu ích là PID của child process đã được thu hồi. Code error-handling Unix-style thường có dạng sau:

```
1       if ((pid = wait(NULL)) < 0) {
2           fprintf(stderr, "wait error: %s\n", strerror(errno));
3           exit(0);
4       }
```

Function strerror trả về một mô tả bằng văn bản cho một giá trị cụ thể của errno.

### Xử lý lỗi Posix-Style

Nhiều function Posix mới hơn như Pthreads chỉ dùng giá trị trả về để biểu thị thành công (0) hoặc thất bại (khác 0). Mọi kết quả hữu ích được trả về thông qua các argument của function được truyền bằng reference. Chúng ta gọi cách tiếp cận này là xử lý lỗi Posix-style. Ví dụ, function pthread_create Posix-style biểu thị thành công hoặc thất bại bằng giá trị trả về, và trả ID của thread mới được tạo (kết quả hữu ích) bằng reference qua argument đầu tiên. Code error-handling Posix-style thường có dạng sau:

```
1    if ((retcode = pthread_create(&tid, NULL, thread, NULL)) != 0) {
2        fprintf(stderr, "pthread_create error: %s\n", strerror(retcode));
3        exit(0);
4    }
```

Function strerror trả về một mô tả bằng văn bản cho một giá trị cụ thể của retcode.

### Xử lý lỗi GAI-Style

Các function getaddrinfo (GAI) và getnameinfo trả về 0 khi thành công và giá trị khác 0 khi thất bại. Code error-handling GAI thường có dạng sau:

```
1    if ((retcode = getaddrinfo(host, service, &hints, &result)) != 0) {
2        fprintf(stderr, "getaddrinfo error: %s\n", gai_strerror(retcode));
3        exit(0);
4    }
```

Function gai_strerror trả về một mô tả bằng văn bản cho một giá trị cụ thể của retcode.

### Tổng kết các function Error-Reporting

Trong toàn bộ cuốn sách, chúng ta sử dụng những function error-reporting sau để đáp ứng các kiểu error-handling khác nhau.

*(ghi chú: sách in Thoughout; đúng là Throughout)*

```
#include "csapp.h"

void unix_error(char *msg);
void posix_error(int code, char *msg);
void gai_error(int code, char *msg);
void app_error(char *msg);
```

Trả về: không có

Như tên gọi cho thấy, các function unix_error, posix_error và gai_error báo các lỗi Unix-style, Posix-style và GAI-style rồi kết thúc. Function app_error được bổ sung để thuận tiện xử lý lỗi ứng dụng. Nó chỉ in input của mình rồi kết thúc. Hình A.1 trình bày code cho các function error-reporting.

## A.2 Wrapper Error-Handling

Sau đây là một số ví dụ về các wrapper error-handling khác nhau.

Các wrapper error-handling Unix-style. Hình A.2 trình bày wrapper cho function wait Unix-style. Nếu wait trả về lỗi, wrapper in một thông báo cung cấp thông tin rồi thoát. Nếu không, nó trả về PID cho caller. Hình A.3 trình bày wrapper cho function kill Unix-style. Lưu ý rằng khác với wait, function này trả về void khi thành công.

Các wrapper error-handling Posix-style. Hình A.4 trình bày wrapper cho function pthread_detach Posix-style. Giống phần lớn function Posix-style, nó không sử dụng chung giá trị trả về cho kết quả hữu ích và error-return code, nên wrapper trả về void khi thành công.

Các wrapper error-handling GAI-style. Hình A.5 trình bày wrapper error-handling cho function getaddrinfo GAI-style.

```
                                                         code/src/csapp.c
 1   void unix_error(char *msg) /* Unix-style error */
 2   {
 3       fprintf(stderr, "%s: %s\n", msg, strerror(errno));
 4       exit(0);
 5   }
 6
 7   void posix_error(int code, char *msg) /* Posix-style error */
 8   {
 9       fprintf(stderr, "%s: %s\n", msg, strerror(code));
10       exit(0);
11   }
12
13   void gai_error(int code, char *msg) /* Getaddrinfo-style error */
14   {
15       fprintf(stderr, "%s: %s\n", msg, gai_strerror(code));
16       exit(0);
17   }
18
19   void app_error(char *msg) /* Application error */
20   {
21       fprintf(stderr, "%s\n", msg);
22       exit(0);
23   }
                                                         code/src/csapp.c
```

Hình A.1 Các function Error-reporting.

```
                                                         code/src/csapp.c
1   pid_t Wait(int *status)
2   {
3       pid_t pid;
4
5       if ((pid  = wait(status)) < 0)
6           unix_error("Wait error");
7       return pid;
8   }
                                                         code/src/csapp.c
```

Hình A.2 Wrapper cho function wait Unix-style.

```
                                                         code/src/csapp.c
1   void Kill(pid_t pid, int signum)
2   {
3       int rc;
4
5       if ((rc = kill(pid, signum)) < 0)
6           unix_error("Kill error");
7   }
                                                         code/src/csapp.c
```

Hình A.3 Wrapper cho function kill Unix-style.

```
                                                         code/src/csapp.c
1   void Pthread_detach(pthread_t tid) {
2       int rc;
3
4       if ((rc = pthread_detach(tid)) != 0)
5           posix_error(rc, "Pthread_detach error");
6   }
                                                         code/src/csapp.c
```

Hình A.4 Wrapper cho function pthread_detach Posix-style.

```
                                                                          code/src/csapp.c
1   void Getaddrinfo(const char *node, const char *service,
2                    const struct addrinfo *hints, struct addrinfo **res)
3   {
4       int rc;
5
6       if ((rc = getaddrinfo(node, service, hints, res)) != 0)
7           gai_error(rc, "Getaddrinfo error");
8   }
                                                                          code/src/csapp.c
```

Hình A.5 Wrapper cho function getaddrinfo GAI-style.
