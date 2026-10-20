# Chương 6. Pointer và structure

Structure trong C có thể biểu diễn element của data structure, như node của linked list hoặc tree. Pointer là chất kết dính nối các element. Hiểu tính linh hoạt pointer đem lại cho data structure phổ biến giúp bạn tạo data structure riêng. Chương này tìm hiểu cơ bản về cấp memory cho structure trong C và triển khai một số data structure phổ biến.

Structure làm collection như array hữu ích hơn. Muốn tạo array thực thể, như color type có nhiều field, mà không dùng structure, phải khai báo array cho từng field và giữ các giá trị tương ứng tại cùng index trong mỗi array. Với structure, chỉ cần một array, mỗi element là instance của structure.

Chương này mở rộng các khái niệm pointer đã học: giới thiệu pointer notation với structure, bàn cách cấp memory cho structure, kỹ thuật quản lý memory structure sử dụng, và cách dùng function pointer.

Bắt đầu bằng cách cấp memory cho structure. Hiểu allocation sẽ giải thích cơ chế các operation. Sau đó giới thiệu kỹ thuật giảm overhead của heap management.

Phần cuối minh họa tạo nhiều data structure bằng pointer. Linked list được bàn trước, làm nền tảng cho một số data structure khác. Tree được bàn cuối và không dùng linked list.

## Giới thiệu

Có nhiều cách khai báo structure trong C. Phần này chỉ xét hai cách vì tập trung dùng với pointer. Cách đầu khai báo bằng keyword `struct`; cách hai dùng type definition. Trong declaration sau, tên structure có prefix underscore, không bắt buộc nhưng thường dùng như naming convention. Structure `_person` gồm field tên, chức danh và tuổi:

```
struct _person {
    char* firstName;
    char* lastName;
    char* title;
    unsigned int age;
};
```

Declaration structure thường dùng keyword `typedef` để đơn giản hóa việc dùng sau. Sau đây minh họa với `_person`:

```
typedef struct _person {
    char* firstName;
    char* lastName;
    char* title;
    unsigned int age;
} Person;
```

Instance person được khai báo như sau:

```
Person person;
```

Hoặc khai báo pointer đến `Person` rồi cấp memory như sau:

```
Person *ptrPerson;
ptrPerson = (Person*) malloc(sizeof(Person));
```

Nếu dùng declaration structure đơn giản như với `person`, dùng dot notation truy cập field. Ví dụ sau gán giá trị cho field `first` `Name` và `age`:

```
Person person;
person.firstName = (char*)malloc(strlen("Emily")+1);
strcpy(person.firstName,"Emily");
person.age = 23;
```

Tuy nhiên, với pointer đến structure phải dùng points-to operator như sau. Operator gồm dấu gạch ngang rồi dấu lớn hơn:

```
Person *ptrPerson;
ptrPerson = (Person*)malloc(sizeof(Person));
ptrPerson->firstName = (char*)malloc(strlen("Emily")+1);
strcpy(ptrPerson->firstName,"Emily");
ptrPerson->age = 23;
```

Không bắt buộc dùng points-to operator. Có thể dereference pointer trước rồi áp dot operator. Sau đây lặp lại các assignment trước để minh họa:

```
Person *ptrPerson;
ptrPerson = (Person*)malloc(sizeof(Person));
(*ptrPerson).firstName = (char*)malloc(strlen("Emily")+1);
strcpy((*ptrPerson).firstName,"Emily");
(*ptrPerson).age = 23;
```

Cách này vụng hơn nhưng đôi lúc bạn có thể gặp.

### Memory được cấp cho structure thế nào

Khi cấp memory cho structure, lượng tối thiểu là tổng kích thước từng field. Tuy nhiên, thường lớn hơn vì có thể padding giữa field. Padding có thể do cần align data type theo ranh giới cụ thể. Ví dụ short thường align ở address chia hết hai, integer ở address chia hết bốn.

Việc cấp memory bổ sung kéo theo một số hệ quả:

- Phải thận trọng với pointer arithmetic

- Array structure có thể có memory bổ sung giữa element

Ví dụ instance structure `Person` trước được cấp 16 byte—4 byte cho mỗi element. Phiên bản `Person` khác sau dùng short thay unsigned integer cho `age` vẫn được cấp cùng lượng memory, vì có hai byte padding cuối structure:

```
typedef struct _alternatePerson {
    char* firstName;
    char* lastName;
    char* title;
    short age;
} AlternatePerson;
```

Chuỗi sau khai báo instance của cả `Person` và structure `Alternate` `Person`, rồi hiển thị kích thước. Cả hai bằng 16 byte:

```
Person person;
AlternatePerson otherPerson;
```

```
printf("%d\n",sizeof(Person));           // Displays 16
printf("%d\n",sizeof(AlternatePerson));  // Displays 16
```

Nếu tạo array `AlternatePerson` như sau, có padding giữa các element. Hình 6-1 minh họa, vùng tô bóng là khoảng trống giữa element.

```
AlternatePerson people[30];
```

![image](images/ch06/fig06-01.png)

Hình 6-1. Array AlternativePerson

Nếu chuyển field `age` vào giữa hai field structure, khoảng trống nằm bên trong. Điều này có thể quan trọng tùy cách truy cập structure.

## Vấn đề giải phóng structure

Khi cấp memory cho structure, runtime system không tự cấp memory cho pointer định nghĩa trong nó. Tương tự, khi structure biến mất, runtime system không tự giải phóng memory gán cho các pointer bên trong.

Xét structure sau:

```
typedef struct _person {
    char* firstName;
    char* lastName;
    char* title;
    uint age;
} Person;
```

Khi khai báo variable type này hoặc cấp memory động, ba pointer chứa garbage. Chuỗi sau khai báo `Person`. Hình 6-2 cho memory allocation. Ba dấu chấm chỉ memory chưa khởi tạo:

```
void processPerson() {
   Person person;
   ...
}
```

![image](images/ch06/fig06-02.png)

Hình 6-2. Structure Person chưa khởi tạo

Trong initialization, mỗi field được gán giá trị. Các pointer field được cấp memory từ heap và gán cho từng pointer:

```
void initializePerson(Person *person, const char* fn,
        const char* ln, const char* title, uint age) {
    person->firstName = (char*) malloc(strlen(fn) + 1);
    strcpy(person->firstName, fn);
    person->lastName = (char*) malloc(strlen(ln) + 1);
    strcpy(person->lastName, ln);
    person->title = (char*) malloc(strlen(title) + 1);
    strcpy(person->title, title);
    person->age = age;
}
```

Có thể dùng function như sau. Hình 6-3 minh họa memory allocation:

```
void processPerson() {
   Person person;
   initializePerson(&person, "Peter", "Underwood", "Manager", 36);
    ...
}
int main() {
   processPerson();
   ...
}
```

![image](images/ch06/fig06-03.png)

Hình 6-3. Structure Person đã khởi tạo

Vì declaration thuộc function, memory cho `person` biến mất khi function return. Nhưng string cấp động chưa giải phóng và còn trong heap. Đáng tiếc address mất, không thể free, gây memory leak.

Khi dùng xong instance, cần giải phóng memory. Function sau giải phóng memory đã cấp lúc tạo instance:

```
void deallocatePerson(Person *person) {
    free(person->firstName);
    free(person->lastName);
    free(person->title);
}
```

Cần gọi function trước khi function chứa nó kết thúc:

```
void processPerson() {
   Person person;
   initializePerson(&person, "Peter", "Underwood", "Manager", 36);
    ...
   deallocatePerson(&person);
}
```

Đáng tiếc phải nhớ gọi `initialize` và `deallocate`. Ngôn ngữ object-oriented như C++ tự gọi các operation này trên object.

Nếu dùng pointer đến `Person`, phải nhớ giải phóng person như sau:

```
void processPerson() {
    Person *ptrPerson;
    ptrPerson = (Person*) malloc(sizeof(Person));
    initializePerson(ptrPerson, "Peter", "Underwood", "Manager", 36);
      ...
    deallocatePerson(ptrPerson);
    free(ptrPerson);
}
```

Hình 6-4 minh họa memory allocation.

![image](images/ch06/fig06-04.png)

Hình 6-4. Pointer đến person instance

## Tránh overhead malloc/free

Liên tục cấp rồi giải phóng structure gây overhead, có thể ảnh hưởng performance đáng kể. Một cách là duy trì danh sách structure đã cấp. Khi người dùng không cần instance, trả về pool; khi cần, lấy object từ pool. Nếu không có element sẵn, cấp động instance mới. Cách này duy trì pool structure có thể dùng và tái sử dụng khi cần.

Để minh họa dùng structure `Person` trước. Pool person được giữ trong array. Có thể dùng list phức tạp hơn như linked list trong “Single-Linked List” trang 142. Để ví dụ đơn giản, dùng array pointer khai báo sau:

```
#define LIST_SIZE 10
Person *list[LIST_SIZE];
```

Trước khi dùng phải khởi tạo list. Function sau gán `NULL` cho từng element:

```
void initializeList() {
    for(int i=0; i<LIST_SIZE; i++) {
        list[i] = NULL;
    }
}
```

Hai function thêm và lấy person. Đầu là `getPerson` sau: lấy person từ list nếu có thể. So sánh element array với `NULL`. Trả element non-null đầu tiên, rồi gán vị trí của nó trong `list` bằng `NULL`. Nếu không có, tạo và trả instance `Person` mới. Như vậy tránh overhead cấp động memory cho person mỗi lần cần mới. Chỉ cấp nếu pool không có. Có thể khởi tạo instance trước khi trả hoặc do caller làm, tùy application:

```
Person *getPerson() {
    for(int i=0; i<LIST_SIZE; i++) {
        if(list[i] != NULL) {
            Person *ptr = list[i];
            list[i] = NULL;
            return ptr;
        }
    }
    Person *person = (Person*)malloc(sizeof(Person));
    return person;
}
```

Function thứ hai là `returnPerson`, thêm person vào list hoặc giải phóng. Kiểm tra element array có giá trị `NULL` không. Nếu có, thêm `person` tại vị trí đó rồi trả pointer. Nếu list đầy, giải phóng pointer trong `person` bằng `deallocatePerson`, giải phóng `person`, rồi trả `NULL`:

```
Person *returnPerson(Person *person) {
    for(int i=0; i<LIST_SIZE; i++) {
        if(list[i] == NULL) {
            list[i] = person;
            return person;
        }
    }
    deallocatePerson(person);
    free(person);
    return NULL;
}
```

Sau đây minh họa khởi tạo list và thêm person:

```
initializeList();
Person *ptrPerson;

ptrPerson = getPerson();
initializePerson(ptrPerson,"Ralph","Fitsgerald","Mr.",35);
displayPerson(*ptrPerson);
returnPerson(ptrPerson);
```

Một vấn đề là kích thước list. Quá nhỏ thì phải cấp phát/giải phóng động nhiều hơn. Nếu lớn mà structure không dùng, có thể chiếm memory lớn không dành được cho việc khác. Có thể dùng cơ chế quản lý tinh vi hơn để quản lý kích thước list.

## Dùng pointer hỗ trợ data structure

Pointer hỗ trợ linh hoạt hơn cho data structure đơn giản và phức tạp. Tính linh hoạt đến từ cấp động memory và dễ đổi tham chiếu. Memory không phải liên tục như array. Chỉ cần cấp đúng lượng memory.

Phần này xem triển khai data structure phổ biến bằng pointer. Nhiều C library cung cấp hỗ trợ tương đương và rộng hơn ví dụ. Tuy nhiên hiểu implementation hữu ích khi tạo data structure không standard. Một số platform có thể không có library, developer phải tự triển khai.

Chúng ta xét bốn data structure:

Linked list

Một single-linked list

Queue

Một queue first-in first-out đơn giản

Stack

Một stack đơn giản

Tree

Một binary tree

Cùng các data structure, dùng function pointer minh họa sức mạnh xử lý generic structure. Linked list rất hữu ích và làm nền tảng implementation queue, stack. Mỗi data structure được minh họa bằng employee structure. Ví dụ linked list gồm node nối nhau, mỗi node giữ user-supplied data. Structure employee đơn giản như sau. Type `unsigned char` dùng cho tuổi vì đủ chứa tuổi người:

```
typedef struct _employee{
    char name[32];
    unsigned char age;
} Employee;
```

Array đơn giản dùng cho một tên. Dù pointer đến `char` có thể linh hoạt hơn cho field, chúng ta chọn array `char` để ví dụ đơn giản.

Sẽ phát triển hai comparison function. Đầu so hai employee rồi trả integer, mô phỏng `strcmp`. Giá trị 0 nghĩa là hai structure employee bằng nhau; –1 nghĩa là employee đầu đứng trước employee thứ hai theo bảng chữ cái; 1 nghĩa là đứng sau. Function thứ hai hiển thị một employee:

```
int compareEmployee(Employee *e1, Employee *e2) {
    return strcmp(e1->name, e2->name);
}

void displayEmployee(Employee* employee) {
    printf("%s\t%d\n", employee->name, employee->age);
}
```

Ngoài ra dùng hai function pointer sau. `DISPLAY` chỉ function nhận void và trả void, để hiển thị data. Pointer thứ hai, `COMPARE`, biểu diễn function so data mà hai pointer tham chiếu. Nó nên so data và trả 0, –1 hoặc 1 như đã giải thích với `compareEmployee`:

```
typedef void(*DISPLAY)(void*);
typedef int(*COMPARE)(void*, void*);
```

### Single-Linked List

Linked list gồm chuỗi node nối với nhau bằng link. Thường một node gọi head, các node khác theo sau lần lượt. Node cuối gọi tail. Link nối node dễ triển khai bằng pointer. Mỗi node có thể cấp động khi cần.

Cách này tốt hơn array node. Array tạo số node cố định bất kể cần bao nhiêu. Link được triển khai bằng index element. Array không linh hoạt bằng dynamic memory allocation và pointer.

Ví dụ muốn đổi thứ tự element array, phải copy cả hai element, có thể lớn với structure. Thêm hoặc xóa element cũng có thể phải di chuyển phần lớn array để nhường chỗ hoặc xóa element.

Có nhiều loại linked list. Đơn giản nhất single-linked list có một link từ node này sang node kế. Link bắt đầu từ head, cuối cùng tới tail. circular-linked list không có tail: node cuối trỏ lại head. Doubly linked list dùng hai link, một tới trước, một về sau, cho phép duyệt hai hướng. Loại này linh hoạt hơn nhưng khó triển khai. Hình 6-5 minh họa về khái niệm.

![image](images/ch06/fig06-05.png)

Hình 6-5. Các loại linked list Phần này minh họa tạo và dùng single-linked list. Structure hỗ trợ như sau. `Node` biểu diễn node, gồm hai pointer. Đầu là pointer đến void giữ data type tùy ý; thứ hai trỏ node kế. Structure `LinkedList` biểu diễn list, giữ pointer đến head và tail. Pointer current hỗ trợ duyệt:

```
typedef struct _node {
    void *data;
    struct _node *next;
} Node;

typedef struct _linkedList {
    Node *head;
    Node *tail;
    Node *current;
} LinkedList;
```

Sẽ phát triển một số function dùng các structure hỗ trợ linked list:

| void initializeList(LinkedList\*) | Khởi tạo linked list |
|---|---|
| void addHead(LinkedList\*, void\*) | Thêm data vào head linked list |
| void addTail(LinkedList\*, void\*) | Thêm data vào tail linked list |
| void delete(LinkedList\*, Node\*) | Xóa node khỏi linked list |
| Node \*getNode(LinkedList\*, COMPARE, void\*) | Trả pointer đến node chứa data item cụ thể |
| void displayLinkedList(LinkedList\*, DISPLAY) | Hiển thị linked list |

Trước khi dùng linked list phải khởi tạo. Function `initializeList` sau nhận pointer đến object `LinkedList` rồi đặt từng pointer trong structure bằng `NULL`:

```
void initializeList(LinkedList *list) {
    list->head = NULL;
    list->tail = NULL;
    list->current = NULL;
}
```

Function `addHead` và `addTail` lần lượt thêm data vào head và tail. Trong implementation này, function `add` và `delete` chịu trách nhiệm cấp và giải phóng memory node, thay cho người dùng linked list.

Trong `addHead` sau, đầu tiên cấp memory node, gán data truyền vào cho field `data`. Truyền data như pointer đến void cho phép list chứa bất kỳ data type người dùng muốn. Tiếp theo kiểm tra list rỗng không. Nếu có, gán tail pointer trỏ node và gán `NULL` cho field `next`. Nếu không, pointer `next` được gán head của list. Dù trường hợp nào, head của list cũng được gán trỏ node:

```
void addHead(LinkedList *list, void* data) {
    Node *node = (Node*) malloc(sizeof(Node));
    node->data = data;
    if (list->head == NULL) {
        list->tail = node;
        node->next = NULL;
    } else {
        node->next = list->head;
    }
    list->head = node;
}
```

Chuỗi code sau minh họa `initializeList` và `addHead`. Ba employee được thêm vào list. Hình 6-6 cho memory sau thực thi. Bỏ một số mũi tên cho đơn giản; structure `Employee` với array `name` cũng được đơn giản hóa:

```
LinkedList linkedList;

Employee *samuel = (Employee*) malloc(sizeof(Employee));
strcpy(samuel->name, "Samuel");
samuel->age = 32;

Employee *sally = (Employee*) malloc(sizeof(Employee));
strcpy(sally->name, "Sally");
sally->age = 28;

Employee *susan = (Employee*) malloc(sizeof(Employee));
strcpy(susan->name, "Susan");
susan->age = 45;

initializeList(&linkedList);

addHead(&linkedList, samuel);
addHead(&linkedList, sally);
addHead(&linkedList, susan);
```

Function `addTail` như sau. Bắt đầu cấp node mới và gán data cho field `data`. Vì node luôn thêm ở tail, field `next` được gán `NULL`. Nếu list rỗng, pointer `head` là `NULL` và có thể gán `head` trỏ node mới. Nếu không `NULL`, gán pointer `next` của tail trỏ node mới. Dù trường hợp nào, pointer `tail` của list cũng gán trỏ node:

![image](images/ch06/fig06-06.png)

Hình 6-6. Ví dụ addHead

```
void addTail(LinkedList *list, void* data) {
    Node *node = (Node*) malloc(sizeof(Node));
    node->data = data;
    node->next = NULL;
    if (list->head == NULL) {
        list->head = node;
    } else {
        list->tail->next = node;
    }
    list->tail = node;
}
```

Chuỗi sau minh họa `addTail`. Không lặp lại việc tạo employee object ở đây. Dùng `addTail` thêm employee theo thứ tự ngược ví dụ trước, khiến memory allocation giống Hình 6-6:

```
initializeList(&linkedList);

addTail(&linkedList, susan);
addTail(&linkedList, sally);
addTail(&linkedList, samuel);
```

Function `delete` xóa node khỏi list. Cho đơn giản, truyền pointer đến node cần xóa. Người dùng có lẽ có pointer đến data, không có pointer đến node chứa data. Helper function trả pointer đến node để hỗ trợ tìm: `getNode`. Function `getNode` nhận ba parameter:

- Pointer đến linked list

- Pointer đến comparison function

- Pointer đến data cần tìm

Code function `getNode` như sau. Variable `node` ban đầu trỏ head, duyệt đến khi khớp hoặc hết list. Gọi `compare` để xác định khớp. Khi hai data item bằng nhau, nó trả zero.

```
Node *getNode(LinkedList *list, COMPARE compare , void* data) {
    Node *node = list->head;
    while (node != NULL) {
        if (compare(node->data, data) == 0) {
            return node;
        }
        node = node->next;
    }
    return NULL;
}
```

Function `compare` minh họa dùng function pointer tại runtime để quyết định function so sánh. Điều này tăng linh hoạt đáng kể vì không cần hard code tên comparison function trong `getNode`.

Function `delete` như sau. Cho đơn giản, không luôn kiểm tra null trong list hoặc node truyền vào. Câu `if` đầu xử lý xóa head. Nếu head là node duy nhất, gán null cho head và tail. Nếu không, gán head trỏ node sau head.

Câu `else` duyệt từ head tới tail bằng pointer `tmp`. Loop `while` dừng nếu `tmp` được gán `NULL`, nghĩa là node không trong list, hoặc node sau `tmp` là node cần tìm. Vì single-linked list, cần biết node trước target để gán node sau target cho field `next` của node trước. Cuối `delete`, node được giải phóng. Người dùng phải xóa data do node trỏ đến trước khi gọi `delete`.

```
void delete(LinkedList *list, Node *node) {
    if (node == list->head) {
        if (list->head->next == NULL) {
            list->head = list->tail = NULL;
        } else {
            list->head = list->head->next;
        }
    } else {
        Node *tmp = list->head;
        while (tmp != NULL && tmp->next != node) {
            tmp = tmp->next;
        }
        if (tmp != NULL) {
            tmp->next = node->next;
        }
    }
    free(node);
}
```

Chuỗi tiếp minh họa function. Ba employee thêm vào head. Dùng `compareEmployee` trong “Dùng pointer hỗ trợ data structure” trang 141 để so sánh:

```
addHead(&linkedList, samuel);
addHead(&linkedList, sally);
addHead(&linkedList, susan);

Node *node = getNode(&linkedList,
        (int (*)(void*, void*))compareEmployee, sally);
delete(&linkedList, node);
```

Khi chạy, program stack và heap như Hình 6-7.

Function `displayLinkedList` sau minh họa duyệt list. Bắt đầu tại head, hiển thị từng element bằng function truyền làm argument thứ hai. Node pointer nhận giá trị field `next` và dừng khi hiển thị node cuối:

```
void displayLinkedList(LinkedList *list, DISPLAY display) {
    printf("\nLinked List\n");
    Node *current = list->head;
    while (current != NULL) {
        display(current->data);
        current = current->next;
    }
}
```

Sau đây minh họa dùng function `displayEmployee` trong “Dùng pointer hỗ trợ data structure” trang 141:

![image](images/ch06/fig06-07.png)

Hình 6-7. Ví dụ xóa

```
addHead(&linkedList, samuel);
addHead(&linkedList, sally);
addHead(&linkedList, susan);

displayLinkedList(&linkedList, (DISPLAY)displayEmployee);
```

Output của chuỗi như sau:

```
Linked List
Susan     45
Sally     28
Samuel    32
```

### Dùng pointer hỗ trợ queue

Queue là data structure tuyến tính có hành vi giống hàng chờ. Thường hỗ trợ enqueue và dequeue. Enqueue thêm element; dequeue lấy element khỏi queue. Thường element thêm đầu tiên được lấy đầu tiên. Hành vi gọi First-In-First-Out (FIFO).

Linked list thường triển khai queue. Enqueue thêm node vào head; dequeue xóa node từ tail. Để minh họa, dùng linked list phát triển trong “Single-Linked List” trang 142.

Bắt đầu bằng type definition định nghĩa thuật ngữ queue dựa trên linked list như sau. Nay có thể dùng `Queue` thể hiện rõ ý định:

```
typedef LinkedList Queue;
```

Để khởi tạo, chỉ cần dùng `initializeList`. Thay vì gọi trực tiếp, dùng `initializeQueue` sau:

```
void initializeQueue(Queue *queue) {
    initializeList(queue);
}
```

Tương tự, sau đây thêm node vào queue bằng `addHead`:

```
void enqueue(Queue *queue, void *node) {
    addHead(queue, node);
}
```

Implementation linked list trước không có function tường minh xóa tail. Function `dequeue` sau xóa node cuối, xử lý ba trường hợp:

Queue rỗng

Trả `NULL`

Queue một node

Xử lý bằng câu `else if`

Queue nhiều node

Xử lý bằng mệnh đề `else`

Trường hợp cuối, pointer `tmp` tiến từng node đến ngay trước tail. Sau đó thực hiện ba operation theo thứ tự:

1\. Gán tail trỏ node `tmp`

2\. Tiến pointer `tmp` sang node kế

3\. Đặt field `next` của tail bằng `NULL` để chỉ không còn node trong queue

Thứ tự này cần để bảo đảm tính toàn vẹn list, như Hình 6-8 minh họa về khái niệm. Số khoanh tròn tương ứng ba bước trên:

```
void *dequeue(Queue *queue) {
    Node *tmp = queue->head;
    void *data;
    if (queue->head == NULL) {
        data = NULL;
    } else if (queue->head == queue->tail) {
        queue->head = queue->tail = NULL;
        data = tmp->data;
        free(tmp);
    } else {
        while (tmp->next != queue->tail) {
            tmp = tmp->next;
        }
        queue->tail = tmp;
        tmp = tmp->next;
        queue->tail->next = NULL;
        data = tmp->data;
        free(tmp);
    }
    return data;
}
```

![image](images/ch06/fig06-08.png)

Hình 6-8. Ví dụ function dequeue Data gán cho node được trả về và node được giải phóng. Chuỗi code sau minh họa bằng các employee tạo trước:

```
Queue queue;
initializeQueue(&queue);

enqueue(&queue, samuel);
enqueue(&queue, sally);
enqueue(&queue, susan);
```

```
void *data = dequeue(&queue);
printf("Dequeued %s\n", ((Employee*) data)->name);
data = dequeue(&queue);
printf("Dequeued %s\n", ((Employee*) data)->name);
data = dequeue(&queue);
printf("Dequeued %s\n", ((Employee*) data)->name);
```

Output như sau:

```
Dequeued Samuel
Dequeued Sally
Dequeued Susan
```

### Dùng pointer hỗ trợ stack

Stack cũng là loại list. Element được push lên top rồi pop ra. Khi push rồi pop nhiều element, stack thể hiện First-In-Last-Out (FILO): element push đầu tiên được pop cuối cùng.

Như queue, có thể dùng linked list hỗ trợ stack. Hai operation phổ biến nhất là push và pop. Push thực hiện bằng `addHead`. Pop cần function mới xóa head. Bắt đầu định nghĩa stack theo linked list:

```
typedef LinkedList Stack;
```

Để khởi tạo, thêm `initializeStack`, gọi `initializeList`:

```
void initializeStack(Stack *stack) {
    initializeList(stack);
}
```

Push gọi `addHead` như sau:

```
void push(Stack *stack, void* data) {
    addHead(stack, data);
}
```

Implementation pop như sau. Bắt đầu gán head cho pointer `node`. Có ba trường hợp:

Stack rỗng

Function trả `NULL`

Stack có một element

Nếu node trỏ tail thì head và tail là cùng element. Gán `NULL` cho head, tail rồi trả data.

Stack có nhiều hơn một element

Gán head trỏ element kế rồi trả data.

Trong hai trường hợp cuối, giải phóng node:

```
void *pop(Stack *stack) {
    Node *node = stack->head;
    if (node == NULL) {
        return NULL;
    } else if (node == stack->tail) {
        stack->head = stack->tail = NULL;
        void *data = node->data;
        free(node);
        return data;
    } else {
        stack->head = stack->head->next;
        void *data = node->data;
        free(node);
        return data;
    }
}
```

Tái sử dụng employee instance trong “Single-Linked List” trang 142 minh họa stack. Chuỗi sau push ba employee rồi pop khỏi stack:

```
Stack stack;
initializeStack(&stack);

push(&stack, samuel);
push(&stack, sally);
push(&stack, susan);

Employee *employee;
```

```
for(int i=0; i<4; i++) {
    employee = (Employee*) pop(&stack);
    printf("Popped %s\n", employee->name);
}
```

Khi chạy nhận output sau. Vì dùng pop bốn lần, lần cuối trả `NULL`:

```
Popped Susan
Popped Sally
Popped Samuel
Popped (null)
```

Đôi khi stack còn có peek, trả element top nhưng không pop khỏi stack.

### Dùng pointer hỗ trợ tree

Tree là data structure rất hữu ích, tên bắt nguồn quan hệ giữa element. Child node thường gắn với parent node. Hình tổng thể là cây ngược, root node là element bắt đầu.

Tree có thể có số child node bất kỳ. Tuy nhiên binary tree phổ biến hơn, mỗi node có zero, một hoặc hai child. Child gọi left child hoặc right child. Node không có child gọi leaf node, giống lá cây. Các ví dụ phần này minh họa binary tree.

Pointer cho cách rõ ràng và động để duy trì quan hệ node. Có thể cấp động rồi thêm node khi cần. Dùng structure sau cho node. Pointer đến void cho phép xử lý mọi data type cần:

```
typedef struct _tree {
    void *data;
    struct _tree *left;
    struct _tree *right;
} TreeNode;
```

Khi thêm node, nên theo thứ tự cụ thể để operation như tìm kiếm dễ hơn. Một thứ tự phổ biến là thêm sao cho mọi child của node có giá trị nhỏ hơn parent, và mọi child bên phải có giá trị lớn hơn parent. Đây gọi binary search tree.

Function `insertNode` sau thêm node vào binary search tree. Cần so sánh node mới với node hiện có. Dùng function pointer `COMPARE` truyền address comparison function. Phần đầu cấp memory node rồi gán data. Left và right child đặt `NULL` vì node mới luôn thêm dưới dạng leaf:

```
void insertNode(TreeNode **root, COMPARE compare, void* data) {
    TreeNode *node = (TreeNode*) malloc(sizeof(TreeNode));
    node->data = data;
    node->left = NULL;
    node->right = NULL;

    if (*root == NULL) {
        *root = node;
        return;
    }

    while (1) {
        if (compare((*root)->data, data) > 0) {
            if ((*root)->left != NULL) {
                *root = (*root)->left;
            } else {
                (*root)->left = node;
                break;
            }
        } else {
            if ((*root)->right != NULL) {
                *root = (*root)->right;
            } else {
                (*root)->right = node;
                break;
            }
        }
    }
}
```

Trước tiên kiểm tra root để biết tree rỗng không. Nếu rỗng, gán node mới cho root rồi return. Root truyền như pointer đến pointer đến `TreeNode`. Cần vậy vì muốn sửa pointer truyền vào, không phải thứ nó trỏ. Hai mức indirection được nêu kỹ trong “Nhiều mức indirection” trang 25.

Nếu tree không rỗng, vào loop vô hạn, kết thúc khi thêm node mới. Mỗi vòng so node mới và parent hiện tại. Dựa kết quả, local pointer `root` được gán lại left hoặc right child. Pointer `root` trỏ node hiện tại. Nếu child trái hoặc phải là `NULL`, thêm node làm child rồi kết thúc loop.

Để minh họa `insertNode`, dùng employee instance trong “Dùng pointer hỗ trợ data structure” trang 141. Chuỗi sau khởi tạo `TreeNode` rỗng rồi thêm ba employee. Hình 6-9 cho trạng thái program stack và heap. Bỏ vài đường trỏ employee cho đơn giản, và sắp node trong heap phản ánh thứ tự tree:

```
TreeNode *tree = NULL;

insertNode(&tree, (COMPARE) compareEmployee, samuel);
insertNode(&tree, (COMPARE) compareEmployee, sally);
insertNode(&tree, (COMPARE) compareEmployee, susan);
```

![image](images/ch06/fig06-09.png)

Hình 6-9. Function insertNode

Hình 6-10 minh họa cấu trúc logic của tree.

![image](images/ch06/fig06-10.png)

Hình 6-10. Tổ chức logic tree

Binary tree dùng cho nhiều mục đích và có ba cách duyệt: pre-order, in-order, post-order. Ba kỹ thuật dùng cùng bước nhưng khác thứ tự. Ba bước là:

Thăm node

Xử lý node

Đi trái

Chuyển sang node trái

Đi phải

Chuyển sang node phải

Ở đây thăm node nghĩa là hiển thị nội dung. Ba thứ tự là:

In-order

Đi trái, thăm node, đi phải

Pre-order

Thăm node, đi trái, đi phải

Post-order

Đi trái, đi phải, thăm node

Implementation các function như sau. Mỗi function nhận root và function pointer cho display function. Chúng đệ quy, tự gọi miễn root node truyền vào không null. Chỉ khác thứ tự thực hiện ba bước:

```
void inOrder(TreeNode *root, DISPLAY display) {
    if (root != NULL) {
        inOrder(root->left, display);
        display(root->data);
        inOrder(root->right, display);
    }
}

void postOrder(TreeNode *root, DISPLAY display) {
    if (root != NULL) {
        postOrder(root->left, display);
        postOrder(root->right, display);
        display(root->data);
    }
}

void preOrder(TreeNode *root, DISPLAY display) {
    if (root != NULL) {
        display(root->data);
        preOrder(root->left, display);
        preOrder(root->right, display);
    }
}
```

Chuỗi code sau gọi các function:

```
preOrder(tree, (DISPLAY) displayEmployee);
inOrder(tree, (DISPLAY) displayEmployee);
postOrder(tree, (DISPLAY) displayEmployee);
```

Bảng 6-1 cho output từng lời gọi dựa trên initialization trước.

Bảng 6-1. Kỹ thuật duyệt

| pre-order | Samuel 32 Sally 28 Susan 45 |
|---|---|
| in-order | Sally 28 Samuel 32 Susan 45 |
| post-order | Sally 28 Susan 45 Samuel 32 |

Duyệt in-order trả danh sách member đã sort. Duyệt pre-order và post-order có thể evaluate arithmetic expression khi kết hợp stack và queue.

### Tóm tắt

Sức mạnh và tính linh hoạt pointer thể hiện rõ khi tạo và hỗ trợ data structure. Kết hợp cấp động memory cho structure, pointer cho phép data structure dùng memory hiệu quả, tăng giảm theo nhu cầu application.

Chương này bắt đầu bằng cách cấp memory cho structure. Có thể có padding giữa field và giữa phần tử array structure. Dynamic memory allocation và deallocation có thể tốn kém. Đã xét kỹ thuật duy trì pool structure để giảm overhead.

Cũng đã minh họa implementation một số data structure phổ biến. Linked list hỗ trợ nhiều structure trong đó. Function pointer tăng linh hoạt bằng cách xác định comparison hoặc display function tại runtime.
