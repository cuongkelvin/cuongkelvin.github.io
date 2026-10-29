<a id="_idParaDest-115"></a>

# Chương 07: Composition và Aggregation (Composition and Aggregation)

Trong chương trước, chúng ta đã nói về encapsulation và information hiding. Trong chương này, chúng ta tiếp tục với hướng đối tượng trong C và sẽ thảo luận về các mối quan hệ khác nhau có thể tồn tại giữa hai class. Rốt cuộc, điều này sẽ cho phép chúng ta mở rộng object model và biểu diễn các mối quan hệ giữa các object trong các chương sắp tới.

Trong chương này, chúng ta thảo luận:

- Các loại quan hệ có thể tồn tại giữa hai object và các class tương ứng của chúng: Chúng ta sẽ nói về các quan hệ *to-have* (có) và *to-be* (là), nhưng trọng tâm của chúng ta trong chương này sẽ là các quan hệ to-have.
- *Composition* là quan hệ to-have đầu tiên của chúng ta: Một ví dụ sẽ được đưa ra để minh họa một quan hệ composition thật giữa hai class. Dùng ví dụ được đưa ra, chúng ta khám phá cấu trúc memory mà chúng ta thường có trong trường hợp composition.
- *Aggregation* là quan hệ to-have thứ hai: Nó tương tự composition vì cả hai đều đề cập một quan hệ to-have. Nhưng chúng khác nhau. Chúng tôi sẽ đưa ra một ví dụ hoàn chỉnh riêng để trình bày một trường hợp aggregation. Sự khác biệt giữa aggregation và composition sẽ hiện rõ qua memory layout gắn với những quan hệ này.

Đây là chương thứ hai trong bốn chương trình bày OOP trong C. Quan hệ to-be, còn được gọi là *inheritance*, sẽ được trình bày trong chương tiếp theo.

<a id="_idParaDest-116"></a>

## Quan hệ giữa các class

Một object model là một tập<a id="_idIndexMarker547"></a> các object có liên quan với nhau. Số lượng quan hệ có thể rất nhiều, nhưng chỉ có một vài loại quan hệ có thể tồn tại giữa hai object. Nói chung, có hai nhóm quan hệ được tìm thấy giữa các object (hay các class tương ứng của chúng): quan hệ to-have và quan hệ to-be.

Chúng ta sẽ khám phá sâu các quan hệ to-have<a id="_idIndexMarker548"></a> trong chương này, và sẽ trình bày các quan hệ to-be trong chương tiếp theo. Ngoài ra, chúng ta cũng sẽ thấy cách các quan hệ giữa các object khác nhau có thể dẫn đến quan hệ giữa các class tương ứng của chúng. Trước khi xử lý điều đó, chúng ta cần có khả năng phân biệt giữa một class và một object.

<a id="_idParaDest-117"></a>

## Object so với class

Nếu bạn còn nhớ từ<a id="_idIndexMarker549"></a> chương trước, chúng ta có hai cách tiếp cận để tạo dựng object. Một cách tiếp cận là *prototype-based* và cách kia là *class-based*.

Trong cách tiếp cận prototype-based<a id="_idIndexMarker550"></a>, chúng ta tạo dựng một object hoặc trống (không có attribute hay behavior nào), hoặc chúng ta <a id="_idIndexMarker551"></a>clone nó từ một object hiện có. Trong ngữ cảnh này, *instance* và *object* có cùng nghĩa. Vì vậy, cách tiếp cận prototype-based có thể được hiểu là cách tiếp cận object-based; một cách tiếp cận bắt đầu từ các object trống thay vì từ class.

Trong cách tiếp cận class-based, chúng ta<a id="_idIndexMarker552"></a> không thể tạo dựng một object mà không có một bản thiết kế thường được gọi là *class*. Vì vậy, chúng ta nên bắt đầu từ một class. Và sau đó, chúng ta có thể tạo instance một object từ nó. Trong chương trước, chúng ta đã giải thích kỹ thuật implicit encapsulation định nghĩa một class như một tập khai báo được đặt trong một header file. Chúng ta cũng đã đưa ra một số ví dụ cho thấy điều này hoạt động như thế nào trong C.

Giờ, trong phần này, chúng ta muốn nói thêm về những khác biệt giữa một class và một object. Dù những khác biệt có vẻ tầm thường, chúng ta muốn đi sâu hơn và nghiên cứu chúng cẩn thận. Chúng ta bắt đầu bằng việc đưa ra một ví dụ.

Giả sử rằng chúng ta định nghĩa một class, `Person`. Nó có các attribute sau: `name`, `surname` và `age`. Chúng ta sẽ không nói về các behavior vì những khác biệt thường đến từ các attribute, chứ không phải từ các behavior.

Trong C, chúng ta có thể viết class `Person` với các attribute public như sau:

```
typedef struct {
  char name[32];
  char surname[32];
  unsigned int age;
} person_t;
```

*Code Box 7-1: Attribute structure Person trong C*

Và trong C++:

```
class Person {
public:
  std::string name;
  std::string family;
  uint32_t age;
};
```

*Code Box 7-2: Class của class Person trong C++*

Các code box trên<a id="_idIndexMarker553"></a> là giống hệt nhau. Thực tế, thảo luận hiện tại có thể được áp dụng cho cả C và C++, và thậm chí các ngôn ngữ OOP khác như Java. Một class (hay một object template) là một bản thiết kế chỉ xác định các attribute cần có mặt trong mọi<a id="_idIndexMarker554"></a> object, và *không* xác định các giá trị mà những attribute này có thể có trong một object cụ thể. Thực tế, mỗi object có tập giá trị cụ thể của riêng nó cho cùng các attribute tồn tại trong các object khác được tạo instance từ cùng class.

Khi một object được tạo ra dựa trên một class, memory của nó được cấp phát trước. Memory được cấp phát này sẽ là chỗ chứa cho các giá trị attribute. Sau đó, chúng ta cần khởi tạo các giá trị attribute bằng một số giá trị. Đây là một bước quan trọng, nếu không, object có thể có một state không hợp lệ sau khi được tạo ra. Như bạn đã thấy, bước này được gọi là *construction* (tạo dựng).

Thường có một hàm riêng thực hiện bước tạo dựng, được gọi là *constructor*. Các hàm `list_init` và `car_construct` trong các ví dụ ở chương trước là các hàm constructor. Rất có thể là trong quá trình tạo dựng một object, chúng ta cần cấp phát thêm memory cho các tài nguyên như các object khác, buffer, mảng, stream, v.v. mà object đó cần. Các tài nguyên thuộc sở hữu của object phải được giải phóng trước khi object sở hữu được giải phóng.

Chúng ta cũng có một hàm khác, tương tự constructor, chịu trách nhiệm giải phóng mọi tài nguyên đã cấp phát. Nó được gọi là *destructor*. Tương tự, các hàm `list_destroy` và `car_destruct` trong các ví dụ ở chương trước là các destructor. Sau khi hủy một object, memory đã cấp phát của nó được giải phóng, nhưng trước đó, mọi tài nguyên được sở hữu và memory tương ứng của chúng phải được giải phóng.

Trước khi tiếp tục, hãy tóm tắt những gì chúng ta đã giải thích cho đến giờ:

- Một class là một bản thiết kế được dùng như một tấm bản đồ để tạo ra các object.
- Nhiều object có thể được tạo ra từ cùng một class.
- Một class xác định những attribute nào nên có mặt trong mọi object tương lai được tạo ra dựa trên class đó. Nó không nói gì về các giá trị khả dĩ mà chúng có thể có.
- Bản thân một class không tiêu thụ<a id="_idIndexMarker555"></a> memory nào (ngoại trừ trong một số ngôn ngữ lập trình khác C và C++) và chỉ tồn tại ở mức source và vào lúc biên dịch. Nhưng object tồn tại vào lúc runtime và tiêu thụ memory.
- Khi tạo một object, việc cấp phát memory diễn ra trước. Ngoài ra, việc giải phóng memory là thao tác cuối cùng đối với một object.
- Khi tạo một object, nó nên được tạo dựng ngay sau khi cấp phát memory. Nó cũng nên được hủy ngay trước khi giải phóng memory.
- Một object có thể <a id="_idIndexMarker556"></a>sở hữu một số tài nguyên như stream, buffer, mảng, v.v., phải được giải phóng trước khi object bị hủy.

Giờ bạn đã biết những khác biệt giữa một class và một object, chúng ta có thể tiếp tục và giải thích các quan hệ khác nhau có thể tồn tại giữa hai object và các class tương ứng của chúng. Chúng ta sẽ bắt đầu với composition.

<a id="_idParaDest-118"></a>

## Composition

Như thuật ngữ "composition" ngụ ý, khi một object chứa hay sở hữu một object khác – nói cách khác, nó được cấu thành từ một object khác – chúng ta nói rằng có một quan hệ composition giữa chúng.

Ví dụ, một chiếc xe hơi có một<a id="_idIndexMarker557"></a> động cơ; một chiếc xe hơi là một object chứa một object động cơ. Do đó, các object xe hơi và động cơ có một quan hệ composition. Có một điều kiện quan trọng mà một quan hệ composition phải có: *vòng đời của object được chứa bị ràng buộc với vòng đời của object chứa*.

Chừng nào object chứa còn tồn tại, object được chứa phải tồn tại. Nhưng khi object chứa sắp bị hủy, object được chứa phải đã bị hủy trước. Điều kiện này ngụ ý rằng object được chứa thường là nội bộ và private đối với object chứa.

Một số phần của object được chứa có thể vẫn truy cập được thông qua public interface (hay các behavior function) của class chứa, nhưng vòng đời của object được chứa phải được object chứa quản lý nội bộ. Nếu một mẩu code có thể hủy object được chứa mà không hủy object chứa, đó là một sự vi phạm quan hệ composition và quan hệ đó không còn là composition nữa.

Ví dụ sau, *ví dụ 7.1*, minh họa quan hệ composition giữa một object xe hơi và một object động cơ.

Nó gồm năm file: hai header file, khai báo public interface của các class `Car` và `Engine`; hai source file, chứa bản triển khai của các class `Car` và `Engine`; và cuối cùng, một source file, chứa hàm `main` và <a id="_idIndexMarker558"></a>thực thi một kịch bản đơn giản dùng một chiếc xe và object động cơ của nó.

Lưu ý rằng, trong một số domain, chúng ta có thể có các object động cơ bên ngoài các object xe hơi; ví dụ, trong phần mềm CAD kỹ thuật cơ khí. Vì vậy, loại quan hệ giữa các object khác nhau được xác định bởi domain của vấn đề. Vì mục đích của ví dụ, hãy tưởng tượng một domain trong đó các object động cơ không thể tồn tại bên ngoài các object xe hơi.

Code box sau thể hiện header file cho class `Car`:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_7_1_CAR_H
#define EXTREME_C_EXAMPLES_CHAPTER_7_1_CAR_H
struct car_t;
// Memory allocator
struct car_t* car_new();
// Constructor
void car_ctor(struct car_t*);
// Destructor
void car_dtor(struct car_t*);
// Behavior functions
void car_start(struct car_t*);
void car_stop(struct car_t*);
double car_get_engine_temperature(struct car_t*);
#endif
```

*Code Box 7-3 [ExtremeC_examples_chapter7_1_car.h]: Public interface của class Car*

Như bạn thấy, các khai báo trên đã được thực hiện theo cách tương tự như những gì chúng ta đã làm cho class `List` trong ví dụ cuối của chương trước, *ví dụ 6.3*. Một trong những khác biệt là chúng ta đã chọn một hậu tố mới cho hàm constructor; `car_new` thay vì `car_construct`. Khác biệt kia là chúng ta chỉ khai báo attribute structure `car_t`. Chúng ta chưa định nghĩa các trường của nó, và điều này được gọi là một *forward declaration* (khai báo trước). Định nghĩa cho structure `car_t` sẽ nằm trong source file có trong code box 7-5. Lưu ý rằng trong header file trên, kiểu `car_t` được coi là một kiểu chưa hoàn chỉnh chưa được định nghĩa.

Code box sau chứa header file cho class `Engine`:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_7_1_ENGINE_H
#define EXTREME_C_EXAMPLES_CHAPTER_7_1_ENGINE_H
struct engine_t;
// Memory allocator
struct engine_t* engine_new();
// Constructor
void engine_ctor(struct engine_t*);
// Destructor
void engine_dtor(struct engine_t*);
// Behavior functions
void engine_turn_on(struct engine_t*);
void engine_turn_off(struct engine_t*);
double engine_get_temperature(struct engine_t*);
#endif
```

*Code Box 7-4 [ExtremeC_examples_chapter7_1_engine.h]: Public interface của class Engine*

Các code box sau chứa các bản triển khai được thực hiện cho các class `Car` và `Engine`. Chúng ta bắt đầu với class `Car`:

```
#include <stdlib.h>
// Car is only able to work with the public interface of Engine
#include "ExtremeC_examples_chapter7_1_engine.h"
typedef struct {
  // Composition happens because of this attribute
  struct engine_t* engine;
} car_t;
car_t* car_new() {
  return (car_t*)malloc(sizeof(car_t));
}
void car_ctor(car_t* car) {
  // Allocate memory for the engine object
  car->engine = engine_new();
  // Construct the engine object
  engine_ctor(car->engine);
}
void car_dtor(car_t* car) {
  // Destruct the engine object
  engine_dtor(car->engine);
  // Free the memory allocated for the engine object
  free(car->engine);
}
void car_start(car_t* car) {
  engine_turn_on(car->engine);
}
void car_stop(car_t* car) {
  engine_turn_off(car->engine);
}
double car_get_engine_temperature(car_t* car) {
  return engine_get_temperature(car->engine);
}
```

*Code Box 7-5 [ExtremeC_examples_chapter7_1_car.c]: Định nghĩa của class Car*

Code box trên cho thấy <a id="_idIndexMarker560"></a>cách chiếc xe đã chứa động cơ. Như bạn thấy, chúng ta có một attribute mới trong attribute structure `car_t`, và nó có kiểu `struct engine_t*`. Composition diễn ra nhờ attribute này.

Dù kiểu `struct engine_t*` vẫn chưa hoàn chỉnh bên trong source file này, nó có thể trỏ tới một object từ một kiểu `engine_t` hoàn chỉnh vào lúc runtime. Attribute này sẽ trỏ tới một object sẽ được tạo dựng trong constructor của class `Car`, và nó sẽ được giải phóng bên trong destructor. Ở cả hai chỗ, object xe hơi đều tồn tại, và điều này có nghĩa là vòng đời của động cơ nằm trong vòng đời của xe.

Pointer `engine` là private, và không có pointer nào bị rò rỉ ra từ bản triển khai. Đó là một lưu ý quan trọng. Khi bạn đang triển khai một quan hệ composition, không pointer nào được để rò rỉ ra ngoài, nếu không nó khiến code bên ngoài có thể thay đổi state của object được chứa. Giống như encapsulation, không pointer nào được để rò rỉ ra ngoài khi nó cho phép truy cập trực tiếp vào các phần private của một object. Các phần private nên luôn được truy cập một cách gián tiếp qua các behavior function.

Hàm `car_get_engine_temperature` trong code box cho phép truy cập attribute `temperature` của động cơ. Tuy nhiên, có một lưu ý quan trọng về hàm này. Nó dùng public interface của động cơ. Nếu bạn để ý, bạn sẽ thấy rằng *bản triển khai private của xe* đang sử dụng *public interface của động cơ*.

Điều này có nghĩa là bản thân chiếc xe không biết gì về các chi tiết triển khai của động cơ. Đây là cách nó nên như vậy.

*Hai object không cùng kiểu, trong hầu hết các trường hợp, không được biết về chi tiết triển khai của nhau*. Đây là những gì information hiding quy định. Hãy nhớ rằng các behavior của xe được coi là bên ngoài đối với động cơ.

Bằng cách này, chúng ta có thể thay bản triển khai của động cơ bằng một cách triển khai khác, và nó vẫn sẽ hoạt động, chừng nào bản triển khai mới cung cấp định nghĩa cho cùng các hàm public được khai báo trong header file của động cơ.

Giờ, hãy xem bản triển khai của class `Engine`:

```
#include <stdlib.h>
typedef enum {
  ON,
  OFF
} state_t;
typedef struct {
  state_t state;
  double temperature;
} engine_t;
// Memory allocator
engine_t* engine_new() {
  return (engine_t*)malloc(sizeof(engine_t));
}
// Constructor
void engine_ctor(engine_t* engine) {
  engine->state = OFF;
  engine->temperature = 15;
}
// Destructor
void engine_dtor(engine_t* engine) {
  // Nothing to do
}
// Behavior functions
void engine_turn_on(engine_t* engine) {
  if (engine->state == ON) {
    return;
  }
  engine->state = ON;
  engine->temperature = 75;
}
void engine_turn_off(engine_t* engine) {
  if (engine->state == OFF) {
    return;
  }
  engine->state = OFF;
  engine->temperature = 15;
}
double engine_get_temperature(engine_t* engine) {
  return engine->temperature;
}
```

*Code Box 7-6 [ExtremeC_examples_chapter7_1_engine.c]: Định nghĩa của class Engine*

Code trên chỉ dùng cách tiếp cận implicit<a id="_idIndexMarker562"></a> encapsulation cho bản triển khai private của nó, và nó rất giống các ví dụ trước. Nhưng có một điều cần lưu ý về điều này. Như bạn thấy, object `engine` không biết rằng một object bên ngoài sẽ chứa nó trong một quan hệ composition. Điều này giống như thế giới thực. Khi một công ty đang chế tạo động cơ, không rõ động cơ nào sẽ đi vào chiếc xe nào. Dĩ nhiên, chúng ta có thể đã giữ một pointer tới object `car` chứa, nhưng trong ví dụ này, chúng ta không cần.

Code box sau minh họa kịch bản trong đó chúng ta tạo một object `car` và gọi một số public API của nó để trích xuất thông tin về động cơ của xe:

```
#include <stdio.h>
#include <stdlib.h>
#include "ExtremeC_examples_chapter7_1_car.h"
int main(int argc, char** argv) {
  // Allocate memory for the car object
  struct car_t *car = car_new();
  // Construct the car object
  car_ctor(car);
  printf("Engine temperature before starting the car: %f\n",
          car_get_engine_temperature(car));
  car_start(car);
  printf("Engine temperature after starting the car: %f\n",
          car_get_engine_temperature(car));
  car_stop(car);
  printf("Engine temperature after stopping the car: %f\n",
          car_get_engine_temperature(car));
  // Destruct the car object
  car_dtor(car);
  // Free the memory allocated for the car object
  free(car);
  return 0;
}
```

*Code Box 7-7 [ExtremeC_examples_chapter7_1_main.c]: Hàm main của ví dụ 7.1*

Để build<a id="_idIndexMarker563"></a> ví dụ trên, trước tiên chúng ta cần biên dịch ba source file trước đó. Sau đó, chúng ta cần link chúng lại với nhau để tạo ra executable object file cuối cùng. Lưu ý rằng main source file (source file chứa hàm `main`) chỉ phụ thuộc vào public interface của xe. Vì vậy, khi link, nó chỉ cần triển khai private của object `car`. Tuy nhiên, bản triển khai private của object `car` dựa vào public interface của interface động cơ; do đó, khi link, chúng ta cần cung cấp bản triển khai private của object `engine`. Vì vậy, chúng ta cần link cả ba object file để có executable cuối cùng.

Các lệnh sau cho thấy cách build ví dụ và chạy executable cuối cùng:

```
$ gcc -c ExtremeC_examples_chapter7_1_engine.c -o engine.o
$ gcc -c ExtremeC_examples_chapter7_1_car.c -o car.o
$ gcc -c ExtremeC_examples_chapter7_1_main.c -o main.o
$ gcc engine.o car.o main.o -o ex7_1.out
$ ./ex7_1.out
Engine temperature before starting the car: 15.000000
Engine temperature after starting the car: 75.000000
Engine temperature after stopping the car: 15.000000
$
```

*Shell Box 7-1: Biên dịch, link và thực thi ví dụ 7.1*

Trong phần này, chúng ta đã giải thích một loại quan hệ có thể tồn tại giữa hai object. Trong phần tiếp theo, chúng ta sẽ nói về quan hệ tiếp theo. Nó có khái niệm tương tự quan hệ composition, nhưng có một số khác biệt đáng kể.

<a id="_idParaDest-119"></a>

## Aggregation

Aggregation cũng liên quan đến một object container <a id="_idIndexMarker565"></a>chứa một object khác. Khác biệt chính là trong aggregation, vòng đời của object được chứa độc lập với vòng đời của object chứa.

Trong aggregation, object được chứa có thể được tạo dựng ngay cả trước khi object chứa được tạo dựng. Điều này trái ngược với composition, trong đó object được chứa phải có vòng đời ngắn hơn hoặc bằng object chứa.

Ví dụ sau, *ví dụ 7.2*, minh họa một quan hệ aggregation. Nó mô tả một kịch bản game rất đơn giản trong đó một người chơi nhặt một khẩu súng, bắn nhiều lần, rồi bỏ súng xuống.

Object `player` sẽ là một object chứa trong một khoảng thời gian, và object `gun` sẽ là một object được chứa chừng nào object người chơi còn cầm nó. Vòng đời của object súng độc lập với vòng đời của object người chơi.

Code box sau thể hiện header file của class `Gun`:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_7_2_GUN_H
#define EXTREME_C_EXAMPLES_CHAPTER_7_2_GUN_H
typedef int bool_t;
// Type forward declarations
struct gun_t;
// Memory allocator
struct gun_t* gun_new();
// Constructor
void gun_ctor(struct gun_t*, int);
// Destructor
void gun_dtor(struct gun_t*);
// Behavior functions
bool_t gun_has_bullets(struct gun_t*);
void gun_trigger(struct gun_t*);
void gun_refill(struct gun_t*);
#endif
```

*Code Box 7-8 [ExtremeC_examples_chapter7_2_gun.h]: Public interface của class Gun*

Như bạn thấy, chúng ta chỉ <a id="_idIndexMarker566"></a>khai báo attribute structure `gun_t` vì chúng ta chưa định nghĩa các trường của nó. Như chúng ta đã giải thích trước đây, điều này được gọi là một forward declaration và nó tạo ra một kiểu chưa hoàn chỉnh không thể được tạo instance.

Code box sau thể hiện header file của class `Player`:

```
#ifndef EXTREME_C_EXAMPLES_CHAPTER_7_2_PLAYER_H
#define EXTREME_C_EXAMPLES_CHAPTER_7_2_PLAYER_H
// Type forward declarations
struct player_t;
struct gun_t;
// Memory allocator
struct player_t* player_new();
// Constructor
void player_ctor(struct player_t*, const char*);
// Destructor
void player_dtor(struct player_t*);
// Behavior functions
void player_pickup_gun(struct player_t*, struct gun_t*);
void player_shoot(struct player_t*);
void player_drop_gun(struct player_t*);
#endif
```

*Code Box 7-9 [ExtremeC_examples_chapter7_2_player.h]: Public interface của class Player*

Code box trên định nghĩa public interface của mọi object người chơi. Nói cách khác, nó định nghĩa public interface của class `Player`.

Một lần nữa, chúng ta phải khai báo trước các structure `gun_t` và `player_t`. Chúng ta cần có kiểu `gun_t` được khai báo vì một số behavior function của class `Player` có argument thuộc kiểu này.

Bản triển khai của class `Player` như sau:

```
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "ExtremeC_examples_chapter7_2_gun.h"
// Attribute structure
typedef struct {
  char* name;
  struct gun_t* gun;
} player_t;
// Memory allocator
player_t* player_new() {
  return (player_t*)malloc(sizeof(player_t));
}
// Constructor
void player_ctor(player_t* player, const char* name) {
  player->name =
      (char*)malloc((strlen(name) + 1) * sizeof(char));
  strcpy(player->name, name);
  // This is important. We need to nullify aggregation pointers
  // if they are not meant to be set in constructor.
  player->gun = NULL;
}
// Destructor
void player_dtor(player_t* player) {
  free(player->name);
}
// Behavior functions
void player_pickup_gun(player_t* player, struct gun_t* gun) {
  // After the following line the aggregation relation begins.
  player->gun = gun;
}
void player_shoot(player_t* player) {
  // We need to check if the player has picked up the gun
  // otherwise, shooting is meaningless
  if (player->gun) {
    gun_trigger(player->gun);
  } else {
    printf("Player wants to shoot but he doesn't have a gun!");
    exit(1);
  }
}
void player_drop_gun(player_t* player) {
  // After the following line the aggregation relation
  // ends between two objects. Note that the object gun
  // should not be freed since this object is not its
  // owner like composition.
  player->gun = NULL;
}
```

*Code Box 7-10 [ExtremeC_examples_chapter7_2_player.c]: Định nghĩa của class Player*

Bên trong structure `player_t`, chúng ta khai báo<a id="_idIndexMarker568"></a> attribute pointer `gun` sẽ sớm trỏ tới một object `gun`. Chúng ta cần đặt nó về null trong constructor vì không giống composition, attribute này không được dự định để được đặt trong constructor.

Nếu một aggregation pointer cần được đặt khi tạo dựng, address của object đích nên được truyền như một argument cho constructor. Khi đó, tình huống này được gọi là một *mandatory aggregation* (aggregation bắt buộc).

Nếu aggregation pointer có thể được để null trong constructor, thì đó là một *optional aggregation* (aggregation tùy chọn), như trong code trên. Việc đặt các optional aggregation pointer về null trong constructor là rất quan trọng.

Trong hàm `player_pickup_gun`, quan hệ aggregation bắt đầu, và nó kết thúc trong hàm `player_drop_gun` khi người chơi bỏ súng xuống.

Lưu ý rằng chúng ta cần đặt pointer `gun` về null sau khi bỏ quan hệ aggregation. Không giống trong composition, object chứa không phải là *owner* của object được chứa. Vì vậy, nó không có quyền kiểm soát vòng đời của object đó. Do đó, chúng ta không nên giải phóng object súng ở bất kỳ chỗ nào bên trong code triển khai của người chơi.

Trong các quan hệ optional aggregation, chúng ta có thể chưa đặt object được chứa vào một thời điểm nào đó trong chương trình. Do đó, chúng ta nên cẩn thận khi dùng aggregation pointer vì mọi truy cập tới một pointer chưa được đặt, hay một pointer là `null`, đều có thể dẫn đến segmentation fault. Về cơ bản đó là lý do tại sao trong hàm `player_shoot`, chúng ta kiểm tra pointer `gun` có hợp lệ không. Nếu aggregation pointer là null, điều đó có nghĩa là code dùng object người chơi đang dùng sai nó. Nếu trường hợp đó xảy ra, chúng ta hủy bỏ việc thực thi bằng cách trả về 1 làm *exit* code của process.

Code sau là bản triển khai của class `Gun`:

```
#include <stdlib.h>
typedef int bool_t;
// Attribute structure
typedef struct {
  int bullets;
} gun_t;
// Memory allocator
gun_t* gun_new() {
  return (gun_t*)malloc(sizeof(gun_t));
}
// Constructor
void gun_ctor(gun_t* gun, int initial_bullets) {
  gun->bullets = 0;
  if (initial_bullets > 0) {
    gun->bullets = initial_bullets;
  }
}
// Destructor
void gun_dtor(gun_t* gun) {
  // Nothing to do
}
// Behavior functions
bool_t gun_has_bullets(gun_t* gun) {
  return (gun->bullets > 0);
}
void gun_trigger(gun_t* gun) {
  gun->bullets--;
}
void gun_refill(gun_t* gun) {
  gun->bullets = 7;
}
```

*Code Box 7-11 [ExtremeC_examples_chapter7_2_gun.c]: Định nghĩa của class Gun*

Code trên rất đơn giản, và nó được viết theo cách mà một object súng không biết rằng nó sẽ được chứa trong bất kỳ object nào.

Cuối cùng, code box sau minh họa một kịch bản ngắn tạo một object `player` và một object `gun`. Sau đó, <a id="_idIndexMarker570"></a>người chơi nhặt súng và bắn cho đến khi hết đạn. Sau đó, người chơi nạp lại súng và làm tương tự. Cuối cùng, họ bỏ súng xuống:

```
#include <stdio.h>
#include <stdlib.h>
#include "ExtremeC_examples_chapter7_2_player.h"
#include "ExtremeC_examples_chapter7_2_gun.h"
int main(int argc, char** argv) {
  // Create and constructor the gun object
  struct gun_t* gun = gun_new();
  gun_ctor(gun, 3);
  // Create and construct the player object
  struct player_t* player = player_new();
  player_ctor(player, "Billy");
  // Begin the aggregation relation.
  player_pickup_gun(player, gun);
  // Shoot until no bullet is left.
  while (gun_has_bullets(gun)) {
    player_shoot(player);
  }
  // Refill the gun
  gun_refill(gun);
  // Shoot until no bullet is left.
  while (gun_has_bullets(gun)) {
    player_shoot(player);
  }
  // End the aggregation relation.
  player_drop_gun(player);
  // Destruct and free the player object
  player_dtor(player);
  free(player);
  // Destruct and free the gun object
  gun_dtor(gun);
  free(gun);
  return 0;
}
```

*Code Box 7-12 [ExtremeC_examples_chapter7_2_main.c]: Hàm main của ví dụ 7.2*

Như bạn thấy ở đây, các object `gun` và `player` độc lập với nhau. Logic chịu trách nhiệm tạo và <a id="_idIndexMarker571"></a>hủy những object này là hàm `main`. Vào một thời điểm nào đó trong quá trình thực thi, chúng hình thành một quan hệ aggregation và thực hiện vai trò của mình, rồi vào một thời điểm khác, chúng trở nên tách rời. Điều quan trọng trong aggregation là object chứa không nên thay đổi vòng đời của object được chứa, và chừng nào quy tắc này được tuân theo, sẽ không có vấn đề memory nào phát sinh.

Shell box sau cho thấy cách build ví dụ và chạy executable file thu được. Như bạn thấy, hàm `main` trong *Code Box 7-12* không tạo ra output nào:

```
$ gcc -c ExtremeC_examples_chapter7_2_gun.c -o gun.o $ gcc -c ExtremeC_examples_chapter7_2_player.c -o player.o $ gcc -c ExtremeC_examples_chapter7_2_main.c -o main.o $ gcc gun.o player.o main.o -o ex7_2.out $ ./ex7_2.out $
```

*Shell Box 7-2: Biên dịch, link và thực thi ví dụ 7.2*

Trong một object model được tạo ra cho một dự án thật, số lượng quan hệ aggregation<a id="_idIndexMarker572"></a> thường lớn hơn số lượng quan hệ composition. Ngoài ra, các quan hệ aggregation dễ thấy hơn từ bên ngoài vì, để tạo một quan hệ aggregation, cần một số behavior function riêng, ít nhất trong public interface của object chứa, để đặt và gỡ object được chứa.

Như bạn thấy trong ví dụ trên, các object `gun` và `player` tách rời nhau từ đầu. Chúng trở nên có liên quan trong một khoảng thời gian ngắn, và sau đó chúng lại tách rời. Điều này có nghĩa là quan hệ aggregation là tạm thời, không giống quan hệ composition, vốn là vĩnh viễn. Điều này cho thấy composition là một dạng mạnh hơn của quan hệ *sở hữu* (to-have) giữa các object, trong khi aggregation thể hiện một quan hệ yếu hơn.

Giờ, một câu hỏi nảy ra. Nếu một quan hệ aggregation là tạm thời giữa hai object, liệu nó có tạm thời giữa các class tương ứng của chúng không? Câu trả lời là không. Quan hệ aggregation là vĩnh viễn giữa các kiểu. Nếu có một khả năng nhỏ rằng trong tương lai, hai object từ hai kiểu khác nhau trở nên có liên quan dựa trên một quan hệ aggregation, thì các kiểu của chúng nên ở trong quan hệ aggregation một cách vĩnh viễn. Điều này cũng đúng với composition.

Ngay cả một khả năng thấp về việc có một quan hệ aggregation cũng nên khiến chúng ta khai báo một số pointer trong attribute structure của object chứa, và điều này có nghĩa là attribute structure bị thay đổi vĩnh viễn. Dĩ nhiên, điều này chỉ đúng với các ngôn ngữ lập trình class-based.

Composition và aggregation đều mô tả sự sở hữu một số object. Nói cách khác, những quan hệ này mô tả một tình huống "to-have" hay "has-a"; một người chơi **có** một khẩu súng, hay một chiếc xe **có** một động cơ. Mỗi lần bạn cảm thấy rằng một object sở hữu một object khác, điều đó có nghĩa là phải có hoặc một quan hệ composition hoặc một quan hệ aggregation giữa chúng (và các class tương ứng của chúng).

Trong chương tiếp theo, chúng ta sẽ tiếp tục thảo luận về các loại quan hệ bằng việc xem xét quan hệ *inheritance* hay *extension* (mở rộng).

<a id="_idParaDest-120"></a>

## Tóm tắt

Trong chương này, các chủ đề sau đã được thảo luận:

- Các loại quan hệ khả dĩ giữa các class và object.
- Những khác biệt và tương đồng giữa một class, một object, một instance và một reference.
- Composition, vốn kéo theo việc một object được chứa hoàn toàn phụ thuộc vào object chứa nó.
- Aggregation, trong đó object được chứa có thể sống tự do mà không phụ thuộc gì vào object chứa nó.
- Thực tế rằng aggregation có thể là tạm thời giữa các object, nhưng nó được định nghĩa vĩnh viễn giữa các kiểu (hay class) của chúng.

Trong chương tiếp theo, chúng ta tiếp tục khám phá OOP, chủ yếu đề cập hai trụ cột tiếp theo mà nó dựa trên: inheritance và polymorphism.
