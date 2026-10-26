<a id="_idParaDest-121"></a>

# Chương 08: Inheritance và Polymorphism (Inheritance and Polymorphism)

Chương này là phần tiếp nối của hai chương trước, nơi chúng ta đã giới thiệu cách bạn có thể làm OOP trong C và đi đến các khái niệm composition và aggregation. Chương này chủ yếu tiếp tục thảo luận về các quan hệ giữa các object và các class tương ứng của chúng và trình bày inheritance và polymorphism. Trong chương này, chúng ta kết thúc chủ đề này và tiếp tục với *Abstraction* trong chương tiếp theo.

Chương này phụ thuộc rất nhiều vào lý thuyết được giải thích trong hai chương trước, nơi chúng ta đã thảo luận về các quan hệ khả dĩ giữa các class. Chúng ta đã giải thích các quan hệ *composition* và *aggregation*, và giờ chúng ta sẽ nói về quan hệ *extension* hay *inheritance* trong chương này, cùng với một vài chủ đề khác.

Sau đây là các chủ đề sẽ được giải thích trong suốt chương này:

- Như đã giải thích trước đó, quan hệ inheritance là chủ đề đầu tiên chúng ta thảo luận. Các phương pháp hiện thực quan hệ inheritance trong C sẽ được trình bày, và chúng ta sẽ tiến hành so sánh giữa chúng.
- Chủ đề lớn tiếp theo là *polymorphism*. Polymorphism cho phép chúng ta có các phiên bản khác nhau của cùng một behavior trong các class con, trong trường hợp có một quan hệ inheritance giữa những class đó. Chúng ta sẽ thảo luận các phương pháp để có một hàm polymorphic trong C; đây sẽ là bước đầu tiên trong việc hiểu cách C++ cung cấp polymorphism.

Hãy bắt đầu thảo luận với quan hệ inheritance.

<a id="_idParaDest-122"></a>

## Inheritance

Chúng ta đã khép lại chương<a id="_idIndexMarker574"></a> trước bằng việc nói về các quan hệ *to-have*, rốt cuộc dẫn chúng ta tới các quan hệ composition và aggregation. Trong phần này, chúng ta sẽ nói về các quan hệ *to-be* hay *is-a*. Quan hệ inheritance là một quan hệ to-be.

Một quan hệ inheritance cũng có thể được gọi là một *extension relationship* (quan hệ mở rộng) vì nó chỉ thêm các attribute và behavior bổ sung vào một object hay class hiện có. Trong các phần sau, chúng ta sẽ giải thích inheritance có nghĩa là gì và nó có thể được hiện thực như thế nào trong C.

Có những tình huống khi một object cần có cùng các attribute tồn tại trong một object khác. Nói cách khác, object mới là một sự mở rộng của object kia.

Ví dụ, một sinh viên có mọi attribute của một người, nhưng cũng có thể có thêm các attribute khác. Xem *Code Box 8-1*:

```
typedef struct {
  char first_name[32];
  char last_name[32];
  unsigned int birth_year;
} person_t;
typedef struct {
  char first_name[32];
  char last_name[32];
  unsigned int birth_year;
  char student_number[16]; // Extra attribute
  unsigned int passed_credits; // Extra attribute
} student_t;
```

*Code Box 8-1: Các attribute structure của class Person và class Student*

Ví dụ này cho thấy rõ cách `student_t` mở rộng các attribute của `person_t` bằng các attribute mới, `student_number` và `passed_credits`, vốn là các attribute student-specific (đặc thù cho sinh viên).

Như chúng ta đã chỉ ra trước đây, inheritance (hay extension) là một quan hệ to-be, không giống composition và aggregation, vốn là các quan hệ to-have. Do đó, với ví dụ trên, chúng ta có thể nói rằng "một sinh viên là một người", điều có vẻ đúng trong domain phần mềm giáo dục. Bất cứ khi nào một quan hệ to-be tồn tại trong một domain, nó có lẽ là một quan hệ inheritance. Trong ví dụ trên, `person_t` thường được gọi là *supertype*, hay kiểu *base*, hay đơn giản là kiểu *parent* (cha), và `student_t` thường được gọi là kiểu *child* (con) hay *inherited subtype*.

<a id="_idParaDest-123"></a>

### Bản chất của inheritance

Nếu bạn đào <a id="_idIndexMarker576"></a>sâu hơn và xem một quan hệ inheritance thực sự là gì, bạn sẽ phát hiện ra rằng về bản chất nó thực sự là một quan hệ composition. Ví dụ, chúng ta có thể nói rằng một sinh viên có bản chất của một người bên trong họ. Nói cách khác, chúng ta có thể giả định rằng có một object người private bên trong attribute structure của class `Student`. Tức là, một quan hệ inheritance có thể tương đương với một quan hệ composition one-to-one.

Vì vậy, các structure trong *Code Box 8-1* có thể được viết là:

```
typedef struct {
  char first_name[32];
  char last_name[32];
  unsigned int birth_year;
} person_t;
typedef struct {
  person_t person;
  char student_number[16]; // Extra attribute
  unsigned int passed_credits; // Extra attribute
} student_t;
```

*Code Box 8-2: Các attribute structure của các class Person và Student nhưng lần này lồng nhau*

Cú pháp này hoàn toàn hợp lệ trong C, và thực tế, việc lồng các structure bằng cách dùng biến structure (không phải pointer) là một thiết lập mạnh mẽ. Nó cho phép bạn có một biến structure bên trong structure mới của mình mà thực sự là một sự mở rộng của structure trước.

Với thiết lập trên, nhất thiết phải có một trường kiểu `person_t` làm trường đầu tiên, một pointer `student_t` có thể dễ dàng được cast sang một pointer `person_t`, và cả hai có thể trỏ tới cùng một address trong memory.

Điều này được gọi là *upcasting*. Nói cách khác, việc cast một pointer thuộc kiểu attribute structure của con sang kiểu attribute structure của cha là upcasting. Lưu ý rằng với biến structure, bạn không thể có tính năng này.

*Ví dụ 8.1* minh họa điều này như sau:

```
#include <stdio.h>
typedef struct {
  char first_name[32];
  char last_name[32];
  unsigned int birth_year;
} person_t;
typedef struct {
  person_t person;
  char student_number[16]; // Extra attribute
  unsigned int passed_credits; // Extra attribute
} student_t;
int main(int argc, char** argv) {
  student_t s;
  student_t* s_ptr = &s;
  person_t* p_ptr = (person_t*)&s;
  printf("Student pointer points to %p\n", (void*)s_ptr);
  printf("Person pointer points to %p\n", (void*)p_ptr);
  return 0;
}
```

*Code Box 8-3 [ExtremeC_examples_chapter8_1.c]: Ví dụ 8.1, thể hiện upcasting giữa các pointer object Student và Person*

Như bạn có thể thấy, chúng ta kỳ vọng <a id="_idIndexMarker577"></a>rằng các pointer `s_ptr` và `p_ptr` đang trỏ tới cùng một address trong memory. Sau đây là output sau khi build và chạy *ví dụ 8.1*:

```
$ gcc ExtremeC_examples_chapter8_1.c -o ex8_1.out
$ ./ex8_1.out
Student pointer points to 0x7ffeecd41810
Person pointer points to 0x7ffeecd41810
$
```

*Shell Box 8-1: Output của ví dụ 8.1*

Và đúng vậy, chúng đang trỏ tới cùng một address. Lưu ý rằng các address được hiển thị có thể khác nhau mỗi lần chạy, nhưng điểm mấu chốt là các pointer đang tham chiếu tới cùng một address. Điều này có nghĩa là một biến structure thuộc kiểu `student_t` thực sự đang kế thừa structure `person_t` trong memory layout của nó. Điều này ngụ ý rằng chúng ta có thể dùng các behavior function của class `Person` với một pointer đang trỏ tới một object `student`. Nói cách khác, các behavior function của class `Person` có thể được tái sử dụng cho các object `student`, đây là một thành tựu lớn.

Lưu ý rằng code sau là sai, và nó sẽ không biên dịch được:

```
struct person_t;
typedef struct {
  struct person_t person; // Generates an error!
  char student_number[16]; // Extra attribute
  unsigned int passed_credits; // Extra attribute
} student_t;
```

*Code Box 8-4: Thiết lập một quan hệ inheritance không biên dịch được!*

Dòng khai báo trường `person`<a id="_idIndexMarker578"></a> sinh ra một lỗi vì bạn không thể tạo một biến từ một *incomplete type*. Bạn nên nhớ rằng forward declaration của một structure (tương tự dòng đầu tiên trong *Code Box 8-4*) dẫn đến việc khai báo một incomplete type. Bạn chỉ có thể có pointer của các incomplete type, *không phải* biến. Như bạn đã thấy trước đây, bạn thậm chí không thể cấp phát memory Heap cho một incomplete type.

Vậy, điều này có nghĩa là gì? Nó có nghĩa là nếu bạn định dùng các biến structure lồng nhau để hiện thực inheritance, structure `student_t` phải thấy được định nghĩa thực sự của `person_t`, vốn, dựa trên những gì chúng ta đã học về encapsulation, nên là private và không hiển thị với bất kỳ class nào khác.

Do đó, bạn có hai cách tiếp cận để hiện thực quan hệ inheritance:

- Làm sao cho class con có quyền truy cập hiện thực private (định nghĩa thực sự) của class base.
- Làm sao cho class con chỉ có quyền truy cập public interface của class base.

<a id="_idParaDest-124"></a>

#### Cách tiếp cận thứ nhất để có inheritance trong C

Chúng tôi sẽ minh họa<a id="_idIndexMarker579"></a> cách tiếp cận thứ nhất trong ví dụ sau, *ví dụ 8.2*, và cách tiếp cận thứ hai trong *ví dụ 8.3*, sẽ có trong phần tiếp theo. Cả hai đều biểu diễn cùng các class, `Student` và `Person`, với một số behavior function, có một số object tham gia một kịch bản đơn giản trong hàm `main`.

Chúng ta sẽ bắt đầu với *ví dụ 8.2*, trong đó class `Student` cần có quyền truy cập định nghĩa private thực sự của attribute structure của class `Person`. Các code box sau trình bày các header và source cho các class `Student` và `Person` cùng với hàm `main`. Hãy bắt đầu với header file khai báo class `Person`:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_8_2_PERSON_H
#define EXTREME_C_EXAMPLES_CHAPTER_8_2_PERSON_H
// Forward declaration
struct person_t;
// Memory allocator
struct person_t* person_new();
// Constructor
void person_ctor(struct person_t*,
                 const char*  /* first name */,
                 const char*  /* last name */,
                 unsigned int /* birth year */);
// Destructor
void person_dtor(struct person_t*);
// Behavior functions
void person_get_first_name(struct person_t*, char*);
void person_get_last_name(struct person_t*, char*);
unsigned int person_get_birth_year(struct person_t*);
#endif
```

*Code Box 8-5 [ExtremeC_examples_chapter8_2_person.h]: Ví dụ 8.2, public interface của class Person*

Hãy xem hàm constructor<a id="_idIndexMarker580"></a> trong *Code Box 8-5*. Nó nhận mọi giá trị cần thiết để tạo một object `person`: `first_name`, `second_name` và `birth_year`. Như bạn thấy, attribute structure `person_t` là chưa hoàn chỉnh, do đó class `Student` không thể dùng header file trên để thiết lập một quan hệ inheritance, tương tự những gì chúng ta đã minh họa trong phần trước.

Mặt khác, header file trên không được chứa định nghĩa thực sự của attribute structure `person_t`, vì header file trên sẽ được dùng bởi các phần khác của code vốn không nên biết gì về phần bên trong của `Person`. Vậy, chúng ta nên làm gì? Chúng ta muốn một phần nhất định của logic biết về một định nghĩa structure mà các phần khác của code không được biết. Đó là lúc *private header file* xuất hiện.

Một private header file là một header file thông thường được dự định để được include và dùng bởi một phần code nhất định hay một class nhất định thực sự cần nó. Đối với *ví dụ 8.2*, định nghĩa thực sự của `person_t` nên là một phần của một private header. Trong code box sau, bạn sẽ thấy một ví dụ về một private header file:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_8_2_PERSON_P_H
#define EXTREME_C_EXAMPLES_CHAPTER_8_2_PERSON_P_H
// Private definition
typedef struct {
  char first_name[32];
  char last_name[32];
  unsigned int birth_year;
} person_t;
#endif
```

*Code Box 8-6 [ExtremeC_examples_chapter8_2_person_p.h]: Private header file chứa định nghĩa thực sự của person_t*

Như bạn thấy, nó chỉ chứa<a id="_idIndexMarker581"></a> định nghĩa của structure `person_t` và không gì hơn. Đây là phần của class `Person` nên giữ private, nhưng nó cần trở nên public đối với class `Student`. Chúng ta sẽ cần định nghĩa này để định nghĩa attribute structure `student_t`. Code box tiếp theo minh họa hiện thực private của class `Person`:

```
#include <stdlib.h>
#include <string.h>
// person_t is defined in the following header file.
#include "ExtremeC_examples_chapter8_2_person_p.h"
// Memory allocator
person_t* person_new() {
  return (person_t*)malloc(sizeof(person_t));
}
// Constructor
void person_ctor(person_t* person,
                 const char* first_name,
                 const char* last_name,
                 unsigned int birth_year) {
  strcpy(person->first_name, first_name);
  strcpy(person->last_name, last_name);
  person->birth_year = birth_year;
}
// Destructor
void person_dtor(person_t* person) {
  // Nothing to do
}
// Behavior functions
void person_get_first_name(person_t* person, char* buffer) {
  strcpy(buffer, person->first_name);
}
void person_get_last_name(person_t* person, char* buffer) {
  strcpy(buffer, person->last_name);
}
unsigned int person_get_birth_year(person_t* person) {
  return person->birth_year;
}
```

*Code Box 8-7 [ExtremeC_examples_chapter8_2_person.c]: Định nghĩa của class Person*

Không có gì đặc biệt về<a id="_idIndexMarker582"></a> định nghĩa của class `Person` và nó giống như mọi ví dụ trước. Code box sau thể hiện public interface của class `Student`:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_8_2_STUDENT_H
#define EXTREME_C_EXAMPLES_CHAPTER_8_2_STUDENT_H
//Forward declaration
struct student_t;
// Memory allocator
struct student_t* student_new();
// Constructor
void student_ctor(struct student_t*,
                  const char*  /* first name */,
                  const char*  /* last name */,
                  unsigned int /* birth year */,
                  const char*  /* student number */,
                  unsigned int /* passed credits */);
// Destructor
void student_dtor(struct student_t*);
// Behavior functions
void student_get_student_number(struct student_t*, char*);
unsigned int student_get_passed_credits(struct student_t*);
#endif
```

*Code Box 8-8 [ExtremeC_examples_chapter8_2_student.h]: Public interface của class Student*

Như bạn có thể thấy, constructor của class nhận các argument tương tự constructor của class `Person`. Đó là vì một object `student` thực sự chứa một object `person` và nó cần những giá trị đó để điền vào object `person` được composed của nó.

Điều này ngụ ý rằng constructor của `student` cần đặt các attribute cho phần `person` của `student`.

Lưu ý rằng chúng ta chỉ có thêm hai behavior function trong class `Student`, và đó là vì chúng ta có thể dùng các behavior function của class `Person` cho các object `student` nữa.

Code box tiếp theo chứa hiện thực private của class `Student`:

```
#include <stdlib.h>
#include <string.h>
#include "ExtremeC_examples_chapter8_2_person.h"
// person_t is defined in the following header
// file and we need it here.
#include "ExtremeC_examples_chapter8_2_person_p.h"
//Forward declaration
typedef struct {
  // Here, we inherit all attributes from the person class and
  // also we can use all of its behavior functions because of
  // this nesting.
  person_t person;
  char* student_number;
  unsigned int passed_credits;
} student_t;
// Memory allocator
student_t* student_new() {
  return (student_t*)malloc(sizeof(student_t));
}
// Constructor
void student_ctor(student_t* student,
                  const char* first_name,
                  const char* last_name,
                  unsigned int birth_year,
                  const char* student_number,
                  unsigned int passed_credits) {
  // Call the constructor of the parent class
  person_ctor((struct person_t*)student,
          first_name, last_name, birth_year);
  student->student_number = (char*)malloc(16 * sizeof(char));
  strcpy(student->student_number, student_number);
  student->passed_credits = passed_credits;
}
// Destructor
void student_dtor(student_t* student) {
  // We need to destruct the child object first.
  free(student->student_number);
  // Then, we need to call the destructor function
  // of the parent class
  person_dtor((struct person_t*)student);
}
// Behavior functions
void student_get_student_number(student_t* student,
                                char* buffer) {
  strcpy(buffer, student->student_number);
}
unsigned int student_get_passed_credits(student_t* student) {
  return student->passed_credits;
}
```

*Code Box 8-9 [ExtremeC_examples_chapter8_2_student.c]: Định nghĩa private của class Student*

Code box trên <a id="_idIndexMarker584"></a>chứa đoạn code quan trọng nhất liên quan đến quan hệ inheritance. Trước hết, chúng ta cần include private header của class `Person` vì trong việc định nghĩa `student_t`, chúng ta muốn có trường đầu tiên thuộc kiểu `person_t`. Và, vì trường đó là một biến thực sự chứ không phải một pointer, nó đòi hỏi chúng ta phải có `person_t` đã được định nghĩa. Lưu ý rằng biến này phải là *trường đầu tiên* trong structure. Nếu không, chúng ta mất khả năng dùng các behavior function của class `Person`.

Một lần nữa, trong code box trên, trong constructor của class `Student`, chúng ta gọi constructor của cha để khởi tạo các attribute của object cha (được composed). Hãy xem cách chúng ta cast pointer `student_t` sang một pointer `person_t` khi truyền nó cho hàm `person_ctor`. Điều này khả thi chỉ vì trường `person` là thành viên đầu tiên của `student_t`.

Tương tự, trong destructor của class `Student`, chúng ta đã gọi destructor của cha. Việc hủy này nên diễn ra trước ở mức con và sau đó ở mức cha, theo thứ tự ngược với việc tạo dựng. Code box tiếp theo chứa kịch bản chính của *ví dụ 8.2*, sẽ dùng class `Student` và tạo một object thuộc kiểu `Student`:

```
#include <stdio.h>
#include <stdlib.h>
#include "ExtremeC_examples_chapter8_2_person.h"
#include "ExtremeC_examples_chapter8_2_student.h"
int main(int argc, char** argv) {
  // Create and construct the student object
  struct student_t* student = student_new();
  student_ctor(student, "John", "Doe",
          1987, "TA5667", 134);
  // Now, we use person's behavior functions to
  // read person's attributes from the student object
  char buffer[32];
  // Upcasting to a pointer of parent type
  struct person_t* person_ptr = (struct person_t*)student;
  person_get_first_name(person_ptr, buffer);
  printf("First name: %s\n", buffer);
  person_get_last_name(person_ptr, buffer);
  printf("Last name: %s\n", buffer);
  printf("Birth year: %d\n", person_get_birth_year(person_ptr));
  // Now, we read the attributes specific to the student object.
  student_get_student_number(student, buffer);
  printf("Student number: %s\n", buffer);
  printf("Passed credits: %d\n",
          student_get_passed_credits(student));
  // Destruct and free the student object
  student_dtor(student);
  free(student);
  return 0;
}
```

*Code Box 8-10 [ExtremeC_examples_chapter8_2_main.c]: Kịch bản chính của ví dụ 8.2*

Như bạn thấy trong kịch bản chính, chúng ta đã include public interface của cả hai class `Person` và `Student` (không phải private header file), nhưng chúng ta<a id="_idIndexMarker586"></a> chỉ tạo một object `student`. Như bạn có thể thấy, object `student` đã kế thừa mọi attribute từ object `person` bên trong của nó, và chúng có thể được đọc qua các behavior function của class `Person`.

Shell box sau cho thấy cách biên dịch và chạy *ví dụ 8.2*:

```
$ gcc -c ExtremeC_examples_chapter8_2_person.c -o person.o
$ gcc -c ExtremeC_examples_chapter8_2_student.c -o student.o
$ gcc -c ExtremeC_examples_chapter8_2_main.c -o main.o
$ gcc person.o student.o main.o -o ex8_2.out
$ ./ex8_2.out
First name: John
Last name: Doe
Birth year: 1987
Student number: TA5667
Passed credits: 134
$
```

*Shell Box 8-2: Build và chạy ví dụ 8.2*

Ví dụ sau, *ví dụ 8.3*, sẽ đề cập cách tiếp cận thứ hai để hiện thực các quan hệ inheritance trong C. Output sẽ rất giống *ví dụ 8.2*.

<a id="_idParaDest-125"></a>

#### Cách tiếp cận thứ hai để có inheritance trong C

Dùng cách tiếp cận thứ nhất<a id="_idIndexMarker587"></a>, chúng ta đã giữ một biến structure làm trường đầu tiên trong attribute structure của con. Giờ, dùng cách tiếp cận thứ hai, chúng ta sẽ giữ một pointer tới biến structure của cha. Bằng cách này, class con có thể độc lập với hiện thực của class cha, đây là một điều tốt, xét về các mối lo ngại information-hiding.

Chúng ta được một số ưu điểm, và mất một số khi chọn cách tiếp cận thứ hai. Sau khi minh họa *ví dụ 8.3*, chúng ta sẽ tiến hành so sánh giữa hai cách tiếp cận, và bạn sẽ thấy ưu điểm và nhược điểm của việc dùng mỗi kỹ thuật này.

*Ví dụ 8.3*, dưới đây, rất giống *ví dụ 8.2*, đặc biệt là về output và kết quả cuối cùng. Tuy nhiên, khác biệt chính là trong ví dụ này, class `Student` chỉ dựa vào public interface của class `Person`, chứ không dựa vào định nghĩa private của nó. Điều này rất tốt vì nó tách rời các class và cho phép chúng ta dễ dàng thay đổi hiện thực của class cha mà không phải thay đổi hiện thực của class con.

Trong ví dụ trước, class `Student` không vi phạm nghiêm ngặt các nguyên tắc information-hiding, nhưng nó đã có thể làm điều đó vì nó có quyền truy cập định nghĩa thực sự của `person_t` và các trường của nó. Kết quả là, nó có thể đọc hay sửa đổi các trường mà không dùng các behavior function của `Person`.

Như đã lưu ý, *ví dụ 8.3* rất giống *ví dụ 8.2*, nhưng nó có một số khác biệt cơ bản. Class `Person` có cùng public interface trong ví dụ mới. Nhưng điều này không đúng với class `Student` và public interface của nó phải được thay đổi. Code box sau thể hiện public interface mới của class `Student`:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_8_3_STUDENT_H
#define EXTREME_C_EXAMPLES_CHAPTER_8_3_STUDENT_H
//Forward declaration
struct student_t;
// Memory allocator
struct student_t* student_new();
// Constructor
void student_ctor(struct student_t*,
                  const char*  /* first name */,
                  const char*  /* last name */,
                  unsigned int /* birth year */,
                  const char*  /* student number */,
                  unsigned int /* passed credits */);
// Destructor
void student_dtor(struct student_t*);
// Behavior functions
void student_get_first_name(struct student_t*, char*);
void student_get_last_name(struct student_t*, char*);
unsigned int student_get_birth_year(struct student_t*);
void student_get_student_number(struct student_t*, char*);
unsigned int student_get_passed_credits(struct student_t*);
#endif
```

*Code Box 8-11 [ExtremeC_examples_chapter8_3_student.h]: Public interface mới của class Student*

Vì những lý do bạn sẽ <a id="_idIndexMarker589"></a>nhận ra ngay sau đây, class `Student` phải lặp lại mọi behavior function được khai báo trong class `Person`. Đó là do thực tế rằng chúng ta không còn có thể cast một pointer `student_t` sang một pointer `person_t`. Nói cách khác, upcasting không còn hoạt động đối với các pointer `Student` và `Person`.

Dù public interface của class `Person` không thay đổi so với *ví dụ 8.2*, hiện thực của nó đã thay đổi. Code box sau minh họa hiện thực của class `Person` trong *ví dụ 8.3*:

```
#include <stdlib.h>
#include <string.h>
// Private definition
typedef struct {
  char first_name[32];
  char last_name[32];
  unsigned int birth_year;
} person_t;
// Memory allocator
person_t* person_new() {
  return (person_t*)malloc(sizeof(person_t));
}
// Constructor
void person_ctor(person_t* person,
                 const char* first_name,
                 const char* last_name,
                 unsigned int birth_year) {
  strcpy(person->first_name, first_name);
  strcpy(person->last_name, last_name);
  person->birth_year = birth_year;
}
// Destructor
void person_dtor(person_t* person) {
  // Nothing to do
}
// Behavior functions
void person_get_first_name(person_t* person, char* buffer) {
  strcpy(buffer, person->first_name);
}
void person_get_last_name(person_t* person, char* buffer) {
  strcpy(buffer, person->last_name);
}
unsigned int person_get_birth_year(person_t* person) {
  return person->birth_year;
}
```

*Code Box 8-12 [ExtremeC_examples_chapter8_3_person.c]: Hiện thực mới của class Person*

Như bạn thấy, định nghĩa<a id="_idIndexMarker590"></a> private của `person_t` được đặt bên trong source file và chúng ta không còn dùng private header nữa. Điều này có nghĩa là chúng ta sẽ hoàn toàn không chia sẻ định nghĩa với các class khác như class `Student`. Chúng ta muốn thực hiện một encapsulation hoàn chỉnh cho class `Person` và che giấu mọi chi tiết hiện thực của nó.

Sau đây là hiện thực private của class `Student`:

```
#include <stdlib.h>
#include <string.h>
// Public interface of the person class
#include "ExtremeC_examples_chapter8_3_person.h"
//Forward declaration
typedef struct {
  char* student_number;
  unsigned int passed_credits;
  // We have to have a pointer here since the type
  // person_t is incomplete.
  struct person_t* person;
} student_t;
// Memory allocator
student_t* student_new() {
  return (student_t*)malloc(sizeof(student_t));
}
// Constructor
void student_ctor(student_t* student,
                  const char* first_name,
                  const char* last_name,
                  unsigned int birth_year,
                  const char* student_number,
                  unsigned int passed_credits) {
  // Allocate memory for the parent object
  student->person = person_new();
  person_ctor(student->person, first_name,
          last_name, birth_year);
  student->student_number = (char*)malloc(16 * sizeof(char));
  strcpy(student->student_number, student_number);
  student->passed_credits = passed_credits;
}
// Destructor
void student_dtor(student_t* student) {
  // We need to destruct the child object first.
  free(student->student_number);
  // Then, we need to call the destructor function
  // of the parent class
  person_dtor(student->person);
  // And we need to free the parent object's allocated memory
  free(student->person);
}
// Behavior functions
void student_get_first_name(student_t* student, char* buffer) {
  // We have to use person's behavior function
  person_get_first_name(student->person, buffer);
}
void student_get_last_name(student_t* student, char* buffer) {
  // We have to use person's behavior function
  person_get_last_name(student->person, buffer);
}
unsigned int student_get_birth_year(student_t* student) {
  // We have to use person's behavior function
  return person_get_birth_year(student->person);
}
void student_get_student_number(student_t* student,
                                char* buffer) {
  strcpy(buffer, student->student_number);
}
unsigned int student_get_passed_credits(student_t* student) {
  return student->passed_credits;
}
```

*Code Box 8-13 [ExtremeC_examples_chapter8_3_student.c]: Hiện thực mới của class Student*

Như đã minh họa trong code box trên, chúng ta đã dùng public interface của class `Person` bằng cách include header file của nó. Ngoài ra, trong định nghĩa của `student_t`, chúng ta đã thêm một trường pointer, trỏ tới object `Person` cha. Điều này hẳn nhắc bạn nhớ về hiện thực của một quan hệ composition được thực hiện trong chương trước.

Lưu ý rằng không cần<a id="_idIndexMarker591"></a> trường pointer này là mục đầu tiên trong attribute structure. Điều này trái ngược với những gì chúng ta đã thấy trong cách tiếp cận thứ nhất. Các pointer thuộc kiểu `student_t` và `person_t` không còn có thể thay thế cho nhau, và chúng đang trỏ tới các address khác nhau trong memory vốn không nhất thiết nằm kề nhau. Điều này một lần nữa trái ngược với những gì chúng ta đã làm trong cách tiếp cận trước.

Lưu ý rằng, trong constructor của class `Student`, chúng ta tạo instance object cha. Sau đó, chúng ta tạo dựng nó bằng cách gọi constructor của class `Person` và truyền các tham số cần thiết. Điều này cũng tương tự với destructor và chúng ta hủy object cha sau cùng trong destructor của class `Student`.

Vì chúng ta không thể dùng các behavior của class `Person` để đọc các attribute được kế thừa, class `Student` cần cung cấp tập behavior function của nó để phơi ra các attribute được kế thừa và private đó.

Nói cách khác, class `Student` phải cung cấp một số hàm wrapper để phơi ra các attribute private của object `person` cha bên trong nó. Lưu ý rằng bản thân object `Student` không biết gì về các attribute private của object `Person`, và điều này trái ngược với những gì chúng ta đã thấy trong cách tiếp cận thứ nhất.

Kịch bản chính <a id="_idIndexMarker592"></a>cũng rất giống với kịch bản trong *ví dụ 8.2*. Code box sau minh họa điều đó:

```
#include <stdio.h>
#include <stdlib.h>
#include "ExtremeC_examples_chapter8_3_student.h"
int main(int argc, char** argv) {
  // Create and construct the student object
  struct student_t* student = student_new();
  student_ctor(student, "John", "Doe",
          1987, "TA5667", 134);
  // We have to use student's behavior functions because the
  // student pointer is not a person pointer and we cannot
  // access to private parent pointer in the student object.
  char buffer[32];
  student_get_first_name(student, buffer);
  printf("First name: %s\n", buffer);
  student_get_last_name(student, buffer);
  printf("Last name: %s\n", buffer);
  printf("Birth year: %d\n", student_get_birth_year(student));
  student_get_student_number(student, buffer);
  printf("Student number: %s\n", buffer);
  printf("Passed credits: %d\n",
          student_get_passed_credits(student));
  // Destruct and free the student object
  student_dtor(student);
  free(student);
  return 0;
}
```

*Code Box 8-14 [ExtremeC_examples_chapter8_3_main.c]: Kịch bản chính của ví dụ 8.3*

So với hàm main trong *ví dụ 8.2*, chúng ta đã không include public interface của class `Person`. Chúng ta cũng đã cần dùng các behavior function của class `Student` vì các pointer `student_t` và `person_t` không còn có thể thay thế cho nhau.

Shell box sau <a id="_idIndexMarker593"></a>minh họa cách biên dịch và chạy *ví dụ 8.3*. Như bạn có thể đã đoán, các output giống hệt nhau:

```
$ gcc -c ExtremeC_examples_chapter8_3_person.c -o person.o
$ gcc -c ExtremeC_examples_chapter8_3_student.c -o student.o
$ gcc -c ExtremeC_examples_chapter8_3_main.c -o main.o
$ gcc person.o student.o main.o -o ex8_3.out
$ ./ex8_3.out
First name: John
Last name: Doe
Birth year: 1987
Student number: TA5667
Passed credits: 134
$
```

*Shell Box 8-3: Build và chạy ví dụ 8.3*

Trong phần sau, chúng ta sẽ so sánh các cách tiếp cận đã nêu để hiện thực một quan hệ inheritance trong C.

<a id="_idParaDest-126"></a>

#### So sánh hai cách tiếp cận

Giờ bạn đã thấy hai<a id="_idIndexMarker594"></a> cách tiếp cận khác nhau mà chúng ta có thể chọn để hiện thực inheritance trong C, chúng ta có thể so sánh chúng. Các gạch đầu dòng sau nêu ra những điểm tương đồng và khác biệt giữa hai cách tiếp cận:

- Cả hai cách tiếp cận về bản chất đều thể hiện các quan hệ composition.
- Cách tiếp cận thứ nhất giữ một biến structure trong attribute structure của con và dựa vào việc có quyền truy cập hiện thực private của class cha. Tuy nhiên, cách tiếp cận thứ hai giữ một structure pointer từ incomplete type của attribute structure của cha, và do đó, nó không dựa vào hiện thực private của class cha.
- Trong cách tiếp cận thứ nhất, các kiểu cha và con phụ thuộc chặt chẽ vào nhau. Trong cách tiếp cận thứ hai, các class độc lập với nhau, và mọi thứ bên trong hiện thực của cha đều được che giấu khỏi con.
- Trong cách tiếp cận thứ nhất, bạn chỉ có thể có một cha. Nói cách khác, nó là một cách để hiện thực *single inheritance* trong C. Tuy nhiên, trong cách tiếp cận thứ hai, bạn có thể có bao nhiêu cha tùy thích, qua đó minh họa khái niệm *multiple inheritance*.
- Trong cách tiếp cận thứ nhất, biến structure của cha phải là trường đầu tiên trong attribute structure của class con, nhưng trong cách tiếp cận thứ hai, các pointer tới object cha có thể được đặt ở bất cứ đâu trong structure.
- Trong cách tiếp cận thứ nhất, không có hai object cha và con riêng biệt. Object cha được bao gồm trong object con, và một pointer tới object con thực ra là một pointer tới object cha.
- Trong cách tiếp cận thứ nhất, chúng ta <a id="_idIndexMarker595"></a>có thể dùng các behavior function của class cha, nhưng trong cách tiếp cận thứ hai, chúng ta cần chuyển tiếp các behavior function của cha thông qua các behavior function mới trong class con.

Cho đến giờ, chúng ta chỉ nói về bản thân inheritance và chưa đi qua các cách dùng của nó. Một trong những cách dùng quan trọng nhất của inheritance là để có *polymorphism* trong object model của bạn. Trong phần sau, chúng ta sẽ nói về polymorphism và cách nó có thể được hiện thực trong C.

<a id="_idParaDest-127"></a>

## Polymorphism

Polymorphism <a id="_idIndexMarker596"></a>thực ra không phải là một quan hệ giữa hai class. Nó chủ yếu là một kỹ thuật để giữ cùng một đoạn code trong khi có các behavior khác nhau. Nó cho phép chúng ta mở rộng code hay thêm chức năng mà không phải biên dịch lại toàn bộ code base.

Trong phần này, chúng ta cố gắng trình bày polymorphism là gì và làm thế nào chúng ta có thể có nó trong C. Điều này cũng cho chúng ta một cái nhìn tốt hơn về cách các ngôn ngữ lập trình hiện đại như C++ hiện thực polymorphism. Chúng ta sẽ bắt đầu bằng việc định nghĩa polymorphism.

<a id="_idParaDest-128"></a>

### Polymorphism là gì?

Polymorphism <a id="_idIndexMarker597"></a>đơn giản có nghĩa là có các behavior khác nhau chỉ bằng cách dùng cùng một public interface (hay tập behavior function).

Giả sử rằng chúng ta có hai class, `Cat` và `Duck`, và mỗi class có một behavior function, `sound`, khiến chúng in ra tiếng kêu đặc trưng của mình. Giải thích polymorphism không phải là một việc dễ làm và chúng ta sẽ cố gắng chọn một cách tiếp cận top-down để giải thích nó. Trước tiên, chúng tôi sẽ cố gắng cho bạn một ý niệm về việc code polymorphic trông như thế nào và hoạt động ra sao, và sau đó chúng ta sẽ đi sâu vào việc hiện thực nó trong C. Một khi bạn nắm được ý tưởng, sẽ dễ dàng hơn để chuyển sang hiện thực. Trong các code box sau, trước tiên chúng ta tạo một số object, và sau đó chúng ta xem chúng ta sẽ kỳ vọng một hàm polymorphic hoạt động như thế nào nếu có polymorphism. Trước tiên, hãy tạo ba object. Chúng ta đã giả định rằng cả hai class `Cat` và `Duck` đều là con của class `Animal`:

```
struct animal_t* animal = animal_malloc();
animal_ctor(animal);
struct cat_t* cat = cat_malloc();
cat_ctor(cat);
struct duck_t* duck = duck_malloc();
duck_ctor(duck);
```

*Code Box 8-15: Tạo ba object thuộc các kiểu Animal, Cat và Duck*

*Không có* polymorphism, chúng ta sẽ phải gọi behavior function `sound` cho mỗi object như sau:

```
// This is not a polymorphism
animal_sound(animal);
cat_sound(cat);
duck_sound(duck);
```

*Code Box 8-16: Gọi behavior function sound trên các object đã tạo*

Và output sẽ như sau:

```
Animal: Beeeep
Cat: Meow
Duck: Quack
```

*Shell Box 8-4: Output của các lời gọi hàm*

Code box trên không minh họa polymorphism vì nó dùng các hàm khác nhau, `cat_sound` và `duck_sound`, để gọi các behavior cụ thể từ các object `Cat` và `Duck`. Tuy nhiên, code box sau cho thấy cách chúng ta kỳ vọng một hàm polymorphic hoạt động. Code box sau chứa một ví dụ hoàn hảo về polymorphism:

```
// This is a polymorphism
animal_sound(animal);
animal_sound((struct animal_t*)cat);
animal_sound((struct animal_t*)duck);
```

*Code Box 8-17: Gọi cùng behavior function sound trên cả ba object*

Dù gọi <a id="_idIndexMarker599"></a>cùng một hàm ba lần, chúng ta kỳ vọng thấy các behavior khác nhau. Có vẻ như việc truyền các object pointer khác nhau làm thay đổi behavior thực sự đằng sau `animal_sound`. Shell box sau sẽ là output của *Code Box 8-17* nếu `animal_sound` là polymorphic:

```
Animal: Beeeep
Cat: Meow
Duck: Quake
```

*Shell Box 8-5: Output của các lời gọi hàm*

Như bạn thấy trong *Code Box 8-17*, chúng ta đã dùng cùng một hàm, `animal_sound`, nhưng với các pointer khác nhau, và kết quả là, các hàm khác nhau đã được gọi ở phía sau hậu trường.

> **CẢNH BÁO**:
>
> Xin đừng đi tiếp nếu bạn gặp khó khăn trong việc hiểu code trên; nếu vậy, hãy ôn lại phần trước.

Code polymorphic trên ngụ ý rằng phải có một quan hệ inheritance giữa các class `Cat` và `Duck` với một class thứ ba, `Animal`, vì chúng ta muốn có thể cast các pointer `duck_t` và `cat_t` sang một pointer `animal_t`. Điều này cũng ngụ ý một điều khác: chúng ta phải dùng cách tiếp cận thứ nhất để hiện thực inheritance trong C nhằm tận dụng cơ chế polymorphism mà chúng ta đã giới thiệu trước đây.

Bạn có thể nhớ lại rằng trong cách tiếp cận thứ nhất để hiện thực inheritance, class con có quyền truy cập hiện thực private của class cha, và ở đây một biến structure từ kiểu `animal_t` phải được đặt làm trường đầu tiên trong định nghĩa của các attribute structure `duck_t` và `cat_t`. Code sau cho thấy quan hệ giữa ba class này:

```
typedef struct {
  ...} animal_t;
typedef struct {
  animal_t animal;
  ...
} cat_t;
typedef struct {
  animal_t animal;
  ...
} duck_t;
```

*Code Box 8-18: Định nghĩa của các attribute structure của các class Animal, Cat và Duck*

Với thiết lập này, chúng ta có thể cast các pointer `duck_t` và `cat_t` sang các pointer `animal_t`, và sau đó chúng ta có thể dùng cùng các behavior function cho cả hai class con.

Cho đến giờ, chúng ta đã <a id="_idIndexMarker600"></a>cho thấy một hàm polymorphic được kỳ vọng hoạt động như thế nào và một quan hệ inheritance nên được định nghĩa giữa các class như thế nào. Điều chúng ta chưa cho thấy là behavior polymorphic này được thực hiện như thế nào. Nói cách khác, chúng ta chưa nói về cơ chế thực sự đằng sau polymorphism.

Giả sử rằng behavior function `animal_sound` được định nghĩa như có thể thấy trong code box 8-19. Bất kể pointer bạn gửi vào làm argument là gì, chúng ta sẽ luôn có một behavior và các lời gọi hàm sẽ không phải là polymorphic nếu không có cơ chế bên dưới. Cơ chế này sẽ được giải thích trong *ví dụ 8.4* mà bạn sẽ thấy ngay sau đây:

```
void animal_sound(animal_t* ptr) {
  printf("Animal: Beeeep");
}
// This could be a polymorphism, but it is NOT!
animal_sound(animal);
animal_sound((struct animal_t*)cat);
animal_sound((struct animal_t*)duck);
```

*Code Box 8-19: Hàm animal_sound chưa phải là polymorphic!*

Như bạn thấy tiếp theo, việc gọi behavior function `animal_sound` với các pointer khác nhau sẽ không thay đổi logic của behavior function; nói cách khác, nó không phải là polymorphic. Chúng ta sẽ làm cho hàm này trở thành polymorphic trong ví dụ tiếp theo, *ví dụ 8.4*:

```
Animal: Beeeep
Animal: Beeeep
Animal: Beeeep
```

*Shell Box 8-6: Output của các lời gọi hàm trong Code Box 8-19*

Vậy, cơ chế bên dưới cho phép các behavior function polymorphic là gì? Chúng ta trả lời câu hỏi đó trong các phần sắp tới, nhưng trước đó chúng ta cần biết tại sao chúng ta muốn có polymorphism ngay từ đầu.

<a id="_idParaDest-129"></a>

### Tại sao chúng ta cần polymorphism?

Trước khi nói<a id="_idIndexMarker601"></a> thêm về cách mà chúng ta sẽ hiện thực polymorphism trong C, chúng ta nên dành chút thời gian nói về những lý do đằng sau nhu cầu về polymorphism. Lý do chính tại sao cần polymorphism là chúng ta muốn giữ một mẩu code "nguyên trạng" (as is), ngay cả khi dùng nó với các subtype khác nhau của một kiểu base. Bạn sẽ thấy một số minh họa cho điều này ngay sau đây trong các ví dụ.

Chúng ta không muốn sửa đổi logic hiện tại quá thường xuyên khi chúng ta thêm các subtype mới vào hệ thống, hay khi behavior của một subtype đang bị thay đổi. Việc không có thay đổi nào khi một tính năng mới được thêm vào là không thực tế – sẽ luôn có một số thay đổi – nhưng dùng polymorphism, chúng ta có thể giảm đáng kể số lượng thay đổi cần thiết.

Một động lực khác để có polymorphism là do khái niệm *abstraction*. Khi chúng ta có các kiểu (hay class) trừu tượng, chúng thường có một số behavior function mơ hồ hay chưa được hiện thực cần được *override* trong các class con và polymorphism là cách then chốt để làm điều này.

Vì chúng ta muốn dùng các kiểu trừu tượng để viết logic của mình, chúng ta cần một cách để gọi đúng hiện thực khi làm việc với pointer của các kiểu rất trừu tượng. Đây là một chỗ khác mà polymorphism xuất hiện. Bất kể ngôn ngữ là gì, chúng ta cần một cách để có các behavior polymorphic, nếu không chi phí bảo trì một dự án lớn có thể tăng nhanh, chẳng hạn khi chúng ta sắp thêm một subtype mới vào code.

Giờ chúng ta đã xác lập tầm quan trọng của polymorphism, đã đến lúc giải thích làm thế nào chúng ta có thể có nó trong C.

<a id="_idParaDest-130"></a>

### Làm thế nào để có behavior polymorphic trong C

Nếu chúng ta muốn có<a id="_idIndexMarker602"></a> polymorphism trong C, chúng ta cần dùng cách tiếp cận thứ nhất mà chúng ta đã khám phá để hiện thực inheritance trong C. Để đạt được behavior polymorphic, chúng ta có thể tận dụng *function pointer*. Tuy nhiên, lần này, những function pointer này cần được giữ như một số trường trong attribute structure. Hãy hiện thực ví dụ tiếng kêu động vật để minh họa điều này.

Chúng ta có ba class, `Animal`, `Cat` và `Duck`, và `Cat` và `Duck` là các subtype của `Animal`. Mỗi class có một header và một source. Class `Animal` có thêm một private header file chứa định nghĩa thực sự của attribute structure của nó. Private header này là cần thiết vì chúng ta đang chọn cách tiếp cận thứ nhất để hiện thực inheritance. Private header sẽ được dùng bởi các class `Cat` và `Duck`.

Code box sau thể hiện public interface của class `Animal`:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_8_4_ANIMAL_H
#define EXTREME_C_EXAMPLES_CHAPTER_8_4_ANIMAL_H
// Forward declaration
struct animal_t;
// Memory allocator
struct animal_t* animal_new();
// Constructor
void animal_ctor(struct animal_t*);
// Destructor
void animal_dtor(struct animal_t*);
// Behavior functions
void animal_get_name(struct animal_t*, char*);
void animal_sound(struct animal_t*);
#endif
```

*Code Box 8-20 [ExtremeC_examples_chapter8_4_animal.h]: Public interface của class Animal*

Class `Animal` có hai behavior function. Hàm `animal_sound` được dự định là polymorphic và có thể bị override bởi các class con, trong khi behavior function kia, `animal_get_name`, không phải là polymorphic, và các class con không thể override nó.

Sau đây là định nghĩa private của attribute structure `animal_t`:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_8_4_ANIMAL_P_H
#define EXTREME_C_EXAMPLES_CHAPTER_8_4_ANIMAL_P_H
// The function pointer type needed to point to
// different morphs of animal_sound
typedef void (*sound_func_t)(void*);
// Forward declaration
typedef struct {
  char* name;
  // This member is a pointer to the function which
  // performs the actual sound behavior
  sound_func_t sound_func;
} animal_t;
#endif
```

*Code Box 8-21 [ExtremeC_examples_chapter8_4_animal_p.h]: Private header của class Animal*

Trong polymorphism, mọi<a id="_idIndexMarker604"></a> class con có thể cung cấp phiên bản riêng của hàm `animal_sound`. Nói cách khác, mọi class con có thể override hàm được kế thừa từ class cha của nó. Do đó, chúng ta cần có một hàm khác nhau cho mỗi class con muốn override nó. Điều này có nghĩa là, nếu class con đã override `animal_sound`, hàm override của chính nó nên được gọi.

Đó là lý do tại sao chúng ta dùng function pointer ở đây. Mỗi instance của `animal_t` sẽ có một function pointer dành riêng cho behavior `animal_sound`, và pointer đó đang trỏ tới định nghĩa thực sự của hàm polymorphic bên trong class.

Với mỗi behavior function polymorphic, chúng ta có một function pointer riêng. Ở đây, bạn sẽ thấy cách chúng ta dùng function pointer này để thực hiện lời gọi hàm đúng trong mỗi subclass. Nói cách khác, chúng tôi cho thấy polymorphism thực sự hoạt động như thế nào.

Code box sau thể hiện định nghĩa của class `Animal`:

```
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "ExtremeC_examples_chapter8_4_animal_p.h"
// Default definition of the animal_sound at the parent level
void __animal_sound(void* this_ptr) {
  animal_t* animal = (animal_t*)this_ptr;
  printf("%s: Beeeep\n", animal->name);
}
// Memory allocator
animal_t* animal_new() {
  return (animal_t*)malloc(sizeof(animal_t));
}
// Constructor
void animal_ctor(animal_t* animal) {
  animal->name = (char*)malloc(10 * sizeof(char));
  strcpy(animal->name, "Animal");
  // Set the function pointer to point to the default definition
  animal->sound_func = __animal_sound;
}
// Destructor
void animal_dtor(animal_t* animal) {
  free(animal->name);
}
// Behavior functions
void animal_get_name(animal_t* animal, char* buffer) {
  strcpy(buffer, animal->name);
}
void animal_sound(animal_t* animal) {
  // Call the function which is pointed by the function pointer.
  animal->sound_func(animal);
}
```

*Code Box 8-22 [ExtremeC_examples_chapter8_4_animal.c]: Định nghĩa của class Animal*

Behavior <a id="_idIndexMarker605"></a>polymorphic thực sự diễn ra trong *Code Box 8-22*, bên trong hàm `animal_sound`. Hàm private `__animal_sound` được dự định là behavior mặc định của hàm `animal_sound` khi các subclass quyết định không override nó. Bạn sẽ thấy trong chương tiếp theo rằng các behavior function polymorphic có một định nghĩa mặc định sẽ được kế thừa và dùng nếu subclass không cung cấp phiên bản override.

Tiếp theo, bên trong constructor `animal_ctor`, chúng ta lưu address của `__animal_sound` vào trường `sound_func` của object `animal`. Hãy nhớ rằng `sound_func` là một function pointer. Trong thiết lập này, mọi object con đều kế thừa function pointer này, vốn trỏ tới định nghĩa mặc định `__animal_sound`.

Và bước cuối cùng, bên trong behavior function `animal_sound`, chúng ta chỉ gọi hàm đang được trỏ tới bởi trường `sound_func`. Một lần nữa, `sound_func` là trường function pointer trỏ tới định nghĩa thực sự của behavior sound, mà trong trường hợp trên là `__animal_sound`. Lưu ý rằng hàm `animal_sound` hoạt động giống một trạm chuyển tiếp tới behavior function thực sự hơn.

Dùng thiết lập này, nếu trường `sound_func` đang trỏ tới một hàm khác, thì hàm đó sẽ được gọi nếu `animal_sound` được gọi. Đó là mánh mà chúng ta sẽ dùng trong các class `Cat` và `Duck` để override định nghĩa mặc định của behavior `sound`.

Giờ, đã đến lúc <a id="_idIndexMarker606"></a>trình bày các class `Cat` và `Duck`. Các code box sau sẽ thể hiện public interface và hiện thực private của class `Cat`. Trước tiên, chúng tôi thể hiện public interface của class `Cat`:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_8_4_CAT_H
#define EXTREME_C_EXAMPLES_CHAPTER_8_4_CAT_H
// Forward declaration
struct cat_t;
// Memory allocator
struct cat_t* cat_new();
// Constructor
void cat_ctor(struct cat_t*);
// Destructor
void cat_dtor(struct cat_t*);
// All behavior functions are inherited from the animal class.
#endif
```

*Code Box 8-23 [ExtremeC_examples_chapter8_4_cat.h]: Public interface của class Cat*

Như bạn sẽ thấy ngay sau đây, nó sẽ kế thừa behavior `sound` từ class cha của nó, class `Animal`.

Code box sau thể hiện định nghĩa của class `Cat`:

```
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "ExtremeC_examples_chapter8_4_animal.h"
#include "ExtremeC_examples_chapter8_4_animal_p.h"
typedef struct {
  animal_t animal;
} cat_t;
// Define a new behavior for the cat's sound
void __cat_sound(void* ptr) {
  animal_t* animal = (animal_t*)ptr;
  printf("%s: Meow\n", animal->name);
}
// Memory allocator
cat_t* cat_new() {
  return (cat_t*)malloc(sizeof(cat_t));
}
// Constructor
void cat_ctor(cat_t* cat) {
  animal_ctor((struct animal_t*)cat);
  strcpy(cat->animal.name, "Cat");
  // Point to the new behavior function. Overriding
  // is actually happening here.
  cat->animal.sound_func = __cat_sound;
}
// Destructor
void cat_dtor(cat_t* cat) {
  animal_dtor((struct animal_t*)cat);
}
```

*Code Box 8-24 [ExtremeC_examples_chapter8_4_cat.c]: Hiện thực private của class Cat*

Như bạn thấy trong <a id="_idIndexMarker607"></a>code box trước, chúng ta đã định nghĩa một hàm mới cho tiếng kêu của mèo, `__cat_sound`. Sau đó bên trong constructor, chúng ta làm cho pointer `sound_func` trỏ tới hàm này.

Giờ, việc override đang diễn ra, và từ giờ trở đi, mọi object `cat` sẽ thực sự gọi `__cat_sound` thay vì `__animal_sound`. Kỹ thuật tương tự được dùng cho class `Duck`.

Code box sau thể hiện public interface của class `Duck`:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_8_4_DUCK_H
#define EXTREME_C_EXAMPLES_CHAPTER_8_4_DUCK_H
// Forward declaration
struct duck_t;
// Memory allocator
struct duck_t* duck_new();
// Constructor
void duck_ctor(struct duck_t*);
// Destructor
void duck_dtor(struct duck_t*);
// All behavior functions are inherited from the animal class.
#endif
```

*Code Box 8-25 [ExtremeC_examples_chapter8_4_duck.h]: Public interface của class Duck*

Như bạn thấy, nó<a id="_idIndexMarker608"></a> khá giống class `Cat`. Hãy đưa ra định nghĩa private của class `Duck`:

```
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "ExtremeC_examples_chapter8_4_animal.h"
#include "ExtremeC_examples_chapter8_4_animal_p.h"
typedef struct {
  animal_t animal;
} duck_t;
// Define a new behavior for the duck's sound
void __duck_sound(void* ptr) {
  animal_t* animal = (animal_t*)ptr;
  printf("%s: Quacks\n", animal->name);
}
// Memory allocator
duck_t* duck_new() {
  return (duck_t*)malloc(sizeof(duck_t));
}
// Constructor
void duck_ctor(duck_t* duck) {
  animal_ctor((struct animal_t*)duck);
  strcpy(duck->animal.name, "Duck");
  // Point to the new behavior function. Overriding
  // is actually happening here.
  duck->animal.sound_func = __duck_sound;
}
// Destructor
void duck_dtor(duck_t* duck) {
  animal_dtor((struct animal_t*)duck);
}
```

*Code Box 8-26 [ExtremeC_examples_chapter8_4_duck.c]: Hiện thực private của class Duck*

Như bạn có thể thấy, <a id="_idIndexMarker609"></a>kỹ thuật này đã được dùng để override định nghĩa mặc định của behavior `sound`. Một behavior function private mới, `__duck_sound`, đã được định nghĩa để tạo ra tiếng kêu duck-specific (đặc trưng của vịt), và pointer `sound_func` được cập nhật để trỏ tới hàm này. Về cơ bản đây là cách polymorphism được đưa vào C++. Chúng ta sẽ nói thêm về điều này trong chương tiếp theo.

Cuối cùng, code box sau minh họa kịch bản chính của *ví dụ 8.4*:

```
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
// Only public interfaces
#include "ExtremeC_examples_chapter8_4_animal.h"
#include "ExtremeC_examples_chapter8_4_cat.h"
#include "ExtremeC_examples_chapter8_4_duck.h"
int main(int argc, char** argv) {
  struct animal_t* animal = animal_new();
  struct cat_t* cat = cat_new();
  struct duck_t* duck = duck_new();
  animal_ctor(animal);
  cat_ctor(cat);
  duck_ctor(duck);
  animal_sound(animal);
  animal_sound((struct animal_t*)cat);
  animal_sound((struct animal_t*)duck);
  animal_dtor(animal);
  cat_dtor(cat);
  duck_dtor(duck);
  free(duck);
  free(cat);
  free(animal);
  return 0;
}
```

*Code Box 8-27 [ExtremeC_examples_chapter8_4_main.c]: Kịch bản chính của ví dụ 8.4*

Như bạn thấy trong code box trên, chúng ta chỉ dùng public interface của các class `Animal`, `Cat` và `Duck`. Vì vậy, hàm `main` không biết gì về hiện thực bên trong của <a id="_idIndexMarker610"></a>các class. Việc gọi hàm `animal_sound` với việc truyền các pointer khác nhau minh họa cách một behavior polymorphic nên hoạt động. Hãy xem output của ví dụ.

Shell box sau cho thấy cách biên dịch và chạy *ví dụ 8.4*:

```
$ gcc -c ExtremeC_examples_chapter8_4_animal.c -o animal.o
$ gcc -c ExtremeC_examples_chapter8_4_cat.c -o cat.o
$ gcc -c ExtremeC_examples_chapter8_4_duck.c -o duck.o
$ gcc -c ExtremeC_examples_chapter8_4_main.c -o main.o
$ gcc animal.o cat.o duck.o main.o -o ex8_4.out
$ ./ex8_4.out
Animal: Beeeep
Cat: Meow
Duck: Quake
$
```

*Shell Box 8-7: Biên dịch, thực thi và output của ví dụ 8.4*

Như bạn có thể thấy trong *ví dụ 8.4*, trong các ngôn ngữ lập trình class-based, các behavior function mà chúng ta muốn là polymorphic cần được chăm sóc đặc biệt và nên được đối xử khác đi. Nếu không, một behavior function đơn giản không có cơ chế bên dưới mà chúng ta đã thảo luận trong *ví dụ 8.4* không thể là polymorphic. Đó là lý do tại sao chúng ta có một cái tên đặc biệt cho những behavior function này, và tại sao chúng ta dùng các từ khóa cụ thể để đánh dấu một hàm là polymorphic trong một ngôn ngữ như C++. Những hàm này được gọi là các hàm *virtual*. Hàm virtual là các behavior function có thể bị override bởi các class con. Hàm virtual cần được compiler theo dõi, và các pointer phù hợp nên được đặt trong các object tương ứng để trỏ tới các định nghĩa thực sự khi bị override. Những pointer này được dùng vào lúc runtime để thực thi đúng phiên bản của hàm.

Trong chương tiếp theo, chúng ta sẽ thấy cách C++ xử lý các quan hệ object-oriented giữa các class. Ngoài ra, chúng ta sẽ tìm hiểu cách C++ hiện thực polymorphism. Chúng ta cũng sẽ thảo luận về *Abstraction*, vốn là một kết quả trực tiếp của polymorphism.

<a id="_idParaDest-131"></a>

## Tóm tắt

Trong chương này, chúng ta đã tiếp tục khám phá các chủ đề trong OOP, tiếp nối từ nơi chúng ta đã dừng lại trong chương trước. Các chủ đề sau đã được thảo luận trong chương này:

- Chúng ta đã giải thích inheritance hoạt động như thế nào và xem xét hai cách tiếp cận mà chúng ta có thể dùng để hiện thực inheritance trong C.
- Cách tiếp cận thứ nhất cho phép truy cập trực tiếp mọi attribute private của class cha, nhưng cách tiếp cận thứ hai có một cách làm thận trọng hơn, che giấu các attribute private của class cha.
- Chúng ta đã so sánh các cách tiếp cận này, và chúng ta đã thấy rằng mỗi cách có thể phù hợp trong một số trường hợp sử dụng.
- Polymorphism là chủ đề tiếp theo mà chúng ta đã khám phá. Nói đơn giản, nó cho phép chúng ta có các phiên bản khác nhau của cùng một behavior và gọi đúng behavior bằng public API của một supertype trừu tượng.
- Chúng ta đã thấy cách viết code polymorphic trong C và thấy function pointer góp phần vào việc chọn đúng phiên bản của một behavior cụ thể vào lúc runtime như thế nào.

Chương tiếp theo sẽ là chương cuối cùng của chúng ta về hướng đối tượng. Trong đó, chúng ta sẽ khám phá cách C++ xử lý encapsulation, inheritance và polymorphism. Hơn thế nữa, chúng ta sẽ thảo luận chủ đề abstraction và cách nó dẫn đến một loại class kỳ lạ được gọi là *abstract class*. Chúng ta không thể tạo object từ những class này!
