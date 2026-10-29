# Chương 15: Đóng gói Python (Packaging Python)

Python là ngôn ngữ lập trình phổ biến nhất cho machine learning (ML). Kết hợp điều đó với sự lan rộng của ML trong cuộc sống day-to-day của chúng ta thì không có gì ngạc nhiên khi mong muốn chạy Python trên các thiết bị biên ngày càng mạnh mẽ. Ngay cả trong thời đại của transpiler và WebAssembly, việc đóng gói ứng dụng Python để triển khai vẫn là một vấn đề chưa được giải quyết. Trong chương này, bạn sẽ học có những lựa chọn nào để gói các module Python lại với nhau và khi nào nên dùng phương pháp này thay vì phương pháp khác.

Chúng ta bắt đầu bằng việc nhìn lại nguồn gốc của các giải pháp đóng gói Python ngày nay, từ `distutils` chuẩn built-in đến người kế nhiệm của nó, `setuptools`. Tiếp theo, chúng ta xem xét package manager `pip`, trước khi chuyển sang `venv` cho các môi trường ảo Python, rồi đến `conda`, giải pháp general-purpose cross-platform đang thống trị.

Vì Python là một ngôn ngữ thông dịch, bạn không thể compile một chương trình thành một file thực thi độc lập như bạn có thể làm với một ngôn ngữ như Go. Điều này khiến việc triển khai ứng dụng Python trở nên phức tạp. Chạy một ứng dụng Python đòi hỏi cài đặt một Python interpreter và một số runtime dependency. Các yêu cầu này cần phải code-compatible để ứng dụng hoạt động. Điều đó đòi hỏi quản lý phiên bản chính xác các thành phần phần mềm. Giải quyết các vấn đề triển khai này chính là mục đích của việc đóng gói Python.

Trong chương này, chúng ta sẽ đề cập các chủ đề sau:

- Truy lại nguồn gốc của việc đóng gói Python

- Cài đặt package Python với `pip`

- Quản lý môi trường ảo Python với `venv`

- Cài đặt binary biên dịch sẵn với `conda`

## Yêu cầu kỹ thuật

Để làm theo các ví dụ, hãy bảo đảm bạn đã cài đặt các phần mềm sau trên hệ thống host Linux:

- Python: Python 3 interpreter và thư viện chuẩn

- `pip`: Trình cài đặt package cho Python 3

- `venv`: Module Python để tạo và quản lý các môi trường ảo nhẹ

- Miniconda: Trình cài đặt tối giản cho package manager và trình quản lý môi trường ảo `conda`

Tôi khuyên dùng Ubuntu 24.04 LTS hoặc mới hơn cho chương này. Mặc dù Ubuntu 24.04 LTS chạy được trên Raspberry Pi 4, tôi vẫn thích phát triển trên một máy desktop PC hoặc laptop x86-64. Ubuntu cũng có sẵn Python 3 và `pip` được cài đặt vì Python được dùng rộng rãi khắp hệ thống. Đừng gỡ cài đặt `python3`, nếu không bạn sẽ khiến Ubuntu không dùng được. Để cài đặt `venv` trên Ubuntu, hãy nhập lệnh sau:

```
$ sudo apt install python3-venv
```

LƯU Ý QUAN TRỌNG

Đừng cài đặt Miniconda cho đến khi bạn đến phần về `conda` vì nó can thiệp vào các bài tập `pip` trước đó vốn dựa vào bản cài đặt Python của hệ thống.

## Truy lại nguồn gốc của việc đóng gói Python

Bức tranh đóng gói Python là một nghĩa địa mênh mông của những nỗ lực thất bại và các công cụ bị bỏ rơi. Các best practice về quản lý dependency thay đổi thường xuyên trong cộng đồng Python, và giải pháp được khuyến nghị năm nay có thể là một thứ hỏng hóc không dùng được vào năm sau. Khi tìm hiểu chủ đề này, hãy nhớ xem thông tin được công bố khi nào và đừng tin bất kỳ lời khuyên nào có thể đã lỗi thời.

Hầu hết các thư viện Python được phân phối bằng `setuptools`, bao gồm tất cả các package trên Python Package Index (PyPI). Phương pháp phân phối này dựa vào một file đặc tả project `setup.py` mà trình cài đặt package cho Python (pip) dùng để cài đặt một package. `pip` cũng có thể tạo ra hoặc freeze một danh sách dependency chính xác sau khi một project được cài đặt. File `requirements.txt` tùy chọn này được `pip` dùng kết hợp với `setup.py` để bảo đảm việc cài đặt project có thể lặp lại được.

### distutils

distutils là hệ thống đóng gói nguyên thủy cho Python. Nó được đưa vào thư viện chuẩn Python từ Python 2.0 cho đến khi bị loại bỏ trong Python 3.12. `distutils` cung cấp một package Python cùng tên có thể được import bởi script `setup.py` của bạn. Giờ `distutils` đã bị deprecated, việc dùng trực tiếp package này không còn được hỗ trợ. `setuptools` đã trở thành sự thay thế được ưu tiên của nó.

Mặc dù `distutils` có thể vẫn hoạt động cho các project đơn giản, cộng đồng đã đi tiếp. Ngày nay, `distutils` chỉ tồn tại vì lý do legacy. Nhiều thư viện Python được công bố lần đầu khi `distutils` còn là lựa chọn duy nhất. Port chúng sang `setuptools` bây giờ sẽ tốn công sức đáng kể và có thể làm hỏng những người dùng hiện có.

### setuptools

setuptools mở rộng `distutils` bằng cách thêm hỗ trợ cho các cấu trúc phức tạp, giúp các ứng dụng lớn hơn dựa trên web framework như Flask và FastAPI dễ phân phối hơn. Nó đã trở thành hệ thống đóng gói de facto trong cộng đồng Python. Giống như `distutils`, `setuptools` cung cấp một package Python cùng tên mà bạn có thể import vào script `setup.py` của mình. `distribute` là một fork đầy tham vọng của `setuptools` mà cuối cùng đã được merge trở lại vào `setuptools 0.7`, củng cố vị thế của `setuptools` như lựa chọn dứt khoát cho việc đóng gói Python.

`setuptools` giới thiệu một tiện ích command-line gọi là `easy_install` (nay đã deprecated) và một package Python gọi là `pkg_resources` để khám phá package lúc runtime và truy cập file tài nguyên. `setuptools` cũng có thể tạo ra các package đóng vai trò plugin cho các package mở rộng được khác (ví dụ, framework và ứng dụng). Bạn làm điều này bằng cách đăng ký các entry point trong script `setup.py` để package bao trùm kia import.

Thuật ngữ distribution có nghĩa khác trong ngữ cảnh của Python. Một distribution là một archive có phiên bản gồm các package, module và các file tài nguyên khác dùng để phân phối một release. Một release là một snapshot có phiên bản của một project Python được chụp tại một thời điểm nhất định. Tệ hơn nữa, các thuật ngữ package và distribution bị quá tải nghĩa và thường được các Pythonista dùng thay thế cho nhau. Cho mục đích của chúng ta, hãy nói rằng distribution là thứ bạn tải về, còn package là module được cài đặt và import.

Việc cắt một release có thể tạo ra nhiều distribution, như một source distribution và một hoặc nhiều built distribution. Có thể có các built distribution khác nhau cho các nền tảng khác nhau, như một bản có kèm trình cài đặt Windows. Thuật ngữ built distribution có nghĩa là không cần bước build nào trước khi cài đặt. Nó không nhất thiết có nghĩa là đã biên dịch sẵn. Ví dụ, một số định dạng built distribution như Wheel (`.whl`) loại trừ các file Python đã biên dịch. Một built distribution chứa các extension đã biên dịch được gọi là binary distribution.

Một extension module là một module Python được viết bằng C hoặc C++. Mỗi extension module được compile thành một thư viện nạp động duy nhất, như một shared object (`.so`) trên Linux và một dynamic link library (`.pyd`) trên Windows. Đối lập với điều này là các pure module, vốn phải được viết hoàn toàn bằng Python. Định dạng built distribution Egg (`.egg`) do `setuptools` giới thiệu hỗ trợ cả pure module lẫn extension module. Vì một file source code Python (`.py`) được compile thành một file bytecode (`.pyc`) khi Python interpreter import một module lúc runtime, bạn có thể thấy vì sao một định dạng built distribution như Wheel có thể loại trừ các file Python đã biên dịch sẵn.

### setup.py

Giả sử bạn đang phát triển một chương trình nhỏ bằng Python, có thể là thứ gì đó truy vấn một REST API từ xa và lưu dữ liệu phản hồi vào một cơ sở dữ liệu SQL cục bộ. Làm thế nào để đóng gói chương trình cùng với các dependency của nó để triển khai? Bạn bắt đầu bằng cách định nghĩa một script `setup.py` mà `setuptools` có thể dùng để cài đặt chương trình của bạn. Triển khai với `setuptools` là bước đầu tiên hướng tới các phương án triển khai tự động phức tạp hơn.

Ngay cả khi chương trình của bạn đủ nhỏ để nằm gọn trong một module duy nhất, nhiều khả năng nó sẽ không giữ như vậy lâu. Giả sử chương trình của bạn gồm một file duy nhất tên `follower.py`, như sau:

```
$ tree follower
follower
└── follower.py
```

Sau đó bạn có thể chuyển module này thành một package bằng cách tách `follower.py` thành ba module riêng biệt và đặt chúng bên trong một thư mục lồng nhau, cũng tên là `follower`:

```
$ tree follower/
follower/
└── follower
 ├── fetch.py
 ├── __main__.py
 └── store.py
```

Module `__main__.py` là nơi chương trình của bạn bắt đầu, vì vậy nó chứa chủ yếu các chức năng top-level, user-facing. Module `fetch.py` chứa các hàm gửi HTTP request tới REST API từ xa và module `store.py` chứa các hàm lưu dữ liệu phản hồi vào cơ sở dữ liệu SQL cục bộ. Để chạy package này như một script, bạn cần truyền tùy chọn `-m` cho Python interpreter như sau:

```
$ PYTHONPATH=follower python -m follower
```

Biến môi trường `PYTHONPATH` trỏ tới thư mục chứa các thư mục package của một project đích. Đối số `follower` sau tùy chọn `-m` báo cho Python chạy module `__main__.py` thuộc package `follower`. Lồng các thư mục package bên trong một thư mục project như thế này mở đường cho chương trình của bạn phát triển thành một ứng dụng lớn hơn gồm nhiều package, mỗi package có namespace riêng.

Với các phần của project đã ở đúng chỗ, giờ chúng ta đã sẵn sàng tạo một script `setup.py` tối giản mà `setuptools` có thể dùng để đóng gói và triển khai nó:

```
from setuptools import setup
    setup(
    name='follower',
    version='0.1',
    packages=['follower'],
    include_package_data=True,
    install_requires=['requests', 'sqlalchemy']
)
```

Đối số `install_requires` là danh sách các dependency bên ngoài cần được cài đặt tự động để một project hoạt động lúc runtime. Lưu ý rằng trong ví dụ của tôi, tôi không chỉ định cần phiên bản nào của các dependency này hay lấy chúng từ đâu. Tôi chỉ yêu cầu các thư viện trông và hoạt động như `requests` và `sqlalchemy`. Tách chính sách khỏi hiện thực như thế này cho phép bạn dễ dàng thay phiên bản PyPI chính thức của một dependency bằng phiên bản của riêng bạn trong trường hợp bạn cần sửa một bug hoặc thêm một tính năng.

Ghi chú thông tin

Thêm các version specifier tùy chọn vào khai báo dependency là ổn, nhưng hardcode các URL distribution trong `setup.py` dưới dạng `dependency_links` về nguyên tắc là sai.

Đối số `packages` báo cho `setuptools` những package in-tree nào cần phân phối cùng một release của project. Vì mỗi package được định nghĩa bên trong thư mục con riêng của thư mục project cha, package duy nhất được phát hành trong trường hợp này là `follower`. Tôi đang đưa các file dữ liệu vào cùng với code Python trong distribution này. Để làm điều đó, bạn cần đặt đối số `include_package_data` là `True` để `setuptools` tìm một file `MANIFEST.in` và cài đặt tất cả các file được liệt kê ở đó. Đây là nội dung của file `MANIFEST.in`:

```
include data/events.db
```

Nếu thư mục data chứa các thư mục dữ liệu lồng nhau mà chúng ta muốn đưa vào, chúng ta có thể glob tất cả chúng cùng với nội dung của chúng bằng `recursive-include`:

```
recursive-include data *
```

Đây là bố cục thư mục cuối cùng:

```
$ tree follower
follower
├── data
│   └── events.db
├── follower
│   ├── fetch.py
│   ├── __init__.py
│   └── store.py
├── MANIFEST.in
└── setup.py
```

`setuptools` vượt trội trong việc build và phân phối các package Python phụ thuộc vào các package khác. Nó làm được điều này nhờ các tính năng như entry point và khai báo dependency, vốn đơn giản là không có trong `distutils`. `setuptools` hoạt động tốt với `pip` và các release mới của `setuptools` ra mắt đều đặn. Định dạng build distribution Wheel được tạo ra để thay thế định dạng Egg mà `setuptools` giới thiệu. Nỗ lực đó phần lớn đã thành công với sự bổ sung một extension `setuptools` phổ biến để build wheel và sự hỗ trợ tuyệt vời của `pip` cho việc cài đặt wheel.

## Cài đặt package Python với pip

Giờ bạn đã biết cách định nghĩa các dependency của project trong một script `setup.py`. Nhưng làm thế nào để cài đặt các dependency đó? Làm thế nào để nâng cấp một dependency hoặc thay thế nó khi bạn tìm được một cái tốt hơn? Làm thế nào để quyết định khi nào thì an toàn để xóa một dependency mà bạn không còn cần?

Quản lý dependency của project là một việc khó nhằn. May mắn thay, Python đi kèm một công cụ gọi là pip có thể giúp ích, đặc biệt ở các giai đoạn đầu của project. Cái tên là viết tắt của pip installs Python, một từ viết tắt đệ quy. `pip` là package manager chính thức cho Python.

Bản phát hành 1.0 đầu tiên của `pip` ra mắt vào ngày 4 tháng Tư năm 2011, cùng khoảng thời gian Node.js và `npm` đang cất cánh. Trước khi trở thành `pip`, công cụ này có tên `pyinstall`. `pyinstall` được tạo ra năm 2008 như một lựa chọn thay thế cho `easy_install`, vốn đi kèm `setuptools` vào thời điểm đó. `easy_install` nay đã deprecated và `setuptools` khuyến nghị dùng `pip` thay thế.

Vì `pip` được đưa vào trình cài đặt Python và bạn có thể có nhiều phiên bản Python được cài đặt trên hệ thống (ví dụ, 2.7 và 3.13), sẽ hữu ích khi biết bạn đang chạy phiên bản `pip` nào:

```
$ pip --version
```

Nếu không tìm thấy file thực thi `pip` nào trên hệ thống, điều đó có lẽ có nghĩa là bạn đang dùng Ubuntu 20.04 LTS hoặc mới hơn và không cài đặt Python 2.7. Điều đó không sao. Chúng ta chỉ đơn giản thay `pip` bằng `pip3` và `python` bằng `python3` trong suốt phần còn lại của mục này:

```
$ pip3 --version
```

Nếu có `python3` nhưng không có file thực thi `pip3`, hãy cài đặt nó như sau trên các bản phân phối Debian-based như Ubuntu:

```
$ sudo apt install python3-pip
```

`pip` cài đặt package vào một thư mục gọi là `site-packages`. Để tìm vị trí thư mục `site-packages` của bạn, hãy chạy lệnh sau:

```
$ python3 -m site | grep ^USER_SITE
```

LƯU Ý QUAN TRỌNG

Giờ Python 2 đã bị deprecated, các lệnh `pip3` và `python3` có sẵn trên các bản phân phối Linux phổ biến như Ubuntu. Nếu bản phân phối Linux của bạn không có các lệnh `pip3` và `python3`, hãy dùng các lệnh `pip` và `python` thay thế.

Để lấy danh sách các package đã được cài đặt trên hệ thống, hãy dùng lệnh này:

```
$ pip3 list
```

Danh sách cho thấy `pip` chỉ là một package Python khác, vì vậy bạn có thể dùng `pip` để tự nâng cấp chính nó, nhưng tôi khuyên bạn đừng làm vậy, ít nhất là không về lâu dài. Tôi sẽ giải thích vì sao trong phần tiếp theo khi giới thiệu môi trường ảo.

Để lấy danh sách các package được cài đặt trong thư mục `site-packages` của bạn, hãy dùng lệnh sau:

```
$ pip3 list --user
```

Danh sách này sẽ rỗng hoặc ngắn hơn nhiều so với danh sách package hệ thống.

Quay lại project ví dụ từ phần trước. `cd` vào thư mục `follower` cha, nơi có `setup.py`. Sau đó chạy lệnh sau:

```
$ pip3 install --ignore-installed --user --break-system-packages .
```

`pip` sẽ dùng `setup.py` để lấy và cài đặt các package được khai báo bởi `install_requires` vào thư mục `site-packages` của bạn. Tùy chọn `--user` chỉ thị `pip` cài đặt package vào thư mục `site-packages` của bạn thay vì toàn cục. Tùy chọn `--ignore-installed` buộc `pip` re-install mọi package cần thiết đã có trên hệ thống vào `site-packages` để không dependency nào bị thiếu. Tùy chọn `--break-system-packages` là bắt buộc trên các bản phân phối Linux Debian-based như Ubuntu, vốn không khuyến khích người dùng cài đặt các package non-Debian-packaged ở mức system-wide.

Giờ hãy liệt kê lại tất cả các package trong thư mục `site-packages` của bạn:

```
$ pip3 list --user
Package            Version
------------------ ---------
certifi            2025.1.31
charset-normalizer 3.4.1
follower           0.1
greenlet           3.1.1
idna               3.10
requests           2.32.3
SQLAlchemy         2.0.38
typing_extensions  4.12.2
urllib3            2.3.0
```

Lần này, bạn sẽ thấy cả `requests` và `SQLAlchemy` đều có trong danh sách package.

Để xem chi tiết về package `SQLAlchemy` mà bạn vừa cài đặt, hãy nhập lệnh sau:

```
$ pip3 show sqlalchemy
```

Chi tiết được hiển thị chứa các trường `Requires` và `Required-by`. Cả hai đều là danh sách các package liên quan. Bạn có thể dùng giá trị trong các trường này và các lời gọi `pip show` liên tiếp để lần theo cây dependency của project. Nhưng có lẽ dễ hơn là `pip install` một công cụ command-line gọi là `pipdeptree` và dùng nó thay thế.

Khi một trường `Required-by` trở nên rỗng, đó là một dấu hiệu tốt cho thấy giờ đã an toàn để gỡ cài đặt một package khỏi hệ thống. Nếu không có package nào khác phụ thuộc vào các package trong trường `Requires` của package bị xóa, thì cũng an toàn để gỡ cài đặt chúng. Đây là cách bạn gỡ cài đặt `sqlalchemy` bằng `pip`:

```
$ pip3 uninstall sqlalchemy -y --break-system-packages
```

`-y` ở cuối tắt dấu nhắc xác nhận. Để gỡ cài đặt nhiều package cùng lúc, chỉ cần thêm các tên package trước `-y`. Tùy chọn `--user` được bỏ qua ở đây vì `pip` đủ thông minh để gỡ cài đặt khỏi `site-packages` trước khi một package cũng được cài đặt toàn cục.

MẸO

Hãy gỡ cài đặt package `follower` và tất cả dependency của nó khỏi thư mục `site-packages` để bạn không làm ô nhiễm bản cài đặt Python hay bản phân phối Linux của mình với các package non-Debian-packaged.

Đôi khi bạn cần một package phục vụ một mục đích nào đó hoặc dùng một công nghệ cụ thể, nhưng bạn không biết tên của nó. Bạn có thể dùng `pip` để thực hiện tìm kiếm theo từ khóa trên PyPI từ command line, nhưng cách đó thường cho ra quá nhiều kết quả. Dễ hơn nhiều là tìm package trên website PyPI (`https://pypi.org/search/`), cho phép bạn lọc kết quả theo nhiều classifier khác nhau.

### requirements.txt

`pip` `install` sẽ cài đặt phiên bản mới nhất đã được công bố của một package, nhưng thường bạn muốn cài đặt một phiên bản cụ thể của package mà bạn biết là hoạt động với code của project. Cuối cùng, bạn sẽ muốn nâng cấp các dependency của project. Nhưng trước khi chỉ cho bạn cách làm điều đó, trước tiên tôi cần chỉ cho bạn cách dùng `pip freeze` để cố định các dependency.

Các requirements file cho phép bạn chỉ định chính xác những package và phiên bản nào `pip` nên cài đặt cho project của bạn. Theo quy ước, các requirements file của project luôn được đặt tên là `requirements.txt`. Nội dung của một requirements file chỉ là danh sách các đối số `pip install` liệt kê các dependency của project. Các dependency này có phiên bản chính xác để không có bất ngờ khi ai đó cố build lại và triển khai project của bạn. Thêm một file `requirements.txt` vào repo của project là một thực hành tốt để bảo đảm build có thể tái tạo.

Quay lại project `follower`, giờ chúng ta đã cài đặt tất cả dependency và xác nhận rằng code hoạt động như mong đợi, chúng ta đã sẵn sàng freeze các phiên bản mới nhất của các package mà `pip` đã cài đặt cho chúng ta. `pip` có một lệnh `freeze` xuất ra các package đã cài đặt cùng với phiên bản của chúng. Bạn chuyển hướng output từ lệnh này vào một file `requirements.txt`:

```
$ pip3 freeze --user > requirements.txt
```

Giờ bạn đã có một file `requirements.txt`, những người clone project của bạn có thể cài đặt tất cả dependency của nó bằng tùy chọn `-r` và tên của requirements file:

```
$ pip3 install --user -r requirements.txt
```

Định dạng requirements file tự động tạo mặc định là khớp phiên bản chính xác (`==`). Ví dụ, một dòng như `requests==2.32.3` báo cho `pip` rằng phiên bản `requests` cần cài đặt phải chính xác là `2.32.3`. Có các version specifier khác bạn có thể dùng trong một requirements file, như phiên bản tối thiểu (`>=`), loại trừ phiên bản (`!=`) và phiên bản tối đa (`<=`). Phiên bản tối thiểu (`>=`) khớp với bất kỳ phiên bản nào lớn hơn hoặc bằng vế right-hand. Loại trừ phiên bản (`!=`) khớp với bất kỳ phiên bản nào ngoại trừ vế right-hand. Phiên bản tối đa (`<=`) khớp với bất kỳ phiên bản nào nhỏ hơn hoặc bằng vế right-hand.

Bạn có thể kết hợp nhiều version specifier trên một dòng bằng cách dùng dấu phẩy để phân tách chúng:

```
requests >=2.32.3,<3.0
```

Hành vi mặc định khi `pip` cài đặt các package được chỉ định trong một requirements file là lấy tất cả chúng từ PyPI. Bạn có thể ghi đè URL của PyPI (`https://pypi.org/simple/)` bằng URL của một Python package index thay thế bằng cách thêm một dòng như sau vào đầu file `requirements.txt`:

```
--index-url http://pypi.mydomain.com/mirror
```

Công sức cần thiết để dựng và bảo trì PyPI mirror riêng của bạn không hề nhỏ. Khi tất cả những gì bạn cần làm là sửa một bug hoặc thêm một tính năng cho một dependency của project, sẽ hợp lý hơn khi ghi đè nguồn package thay vì toàn bộ package index.

Tôi đã đề cập trước đó rằng hardcode các URL distribution bên trong `setup.py` là sai. Bạn có thể dùng dạng đối số `-e` trong một requirements file để ghi đè nguồn của từng package:

```
-e git+https://github.com/myteam/flask.git#egg=flask
```

Trong ví dụ này, tôi đang chỉ thị `pip` lấy source của package `flask` từ fork GitHub của nhóm tôi của `pallets/flask.git`. Dạng đối số `-e` cũng nhận một tên Git branch, commit hash hoặc tên tag:

```
-e git+https://github.com/myteam/flask.git@master
-e git+https://github.com/myteam/flask.
git@5142930ef57e2f0ada00248bdaeb95406d18eb7c
-e git+https://github.com/myteam/flask.git@v1.0
```

Dùng `pip` để nâng cấp các dependency của project lên các phiên bản mới nhất được công bố trên PyPI rất đơn giản:

```
pip3 install --user --upgrade -r requirements.txt
```

Sau khi bạn đã xác nhận rằng việc cài đặt các phiên bản mới nhất của dependency không làm hỏng project, bạn có thể ghi chúng trở lại vào requirements file:

```
$ pip3 freeze --user > requirements.txt
```

Hãy bảo đảm rằng việc freeze không ghi đè bất kỳ override hay cách xử lý phiên bản đặc biệt nào trong requirements file. Hoàn tác mọi sai sót và commit file `requirements.txt` đã cập nhật vào version control.

Đến một lúc nào đó, việc nâng cấp các dependency của project sẽ khiến code của bạn bị hỏng. Một release package mới có thể đưa vào một regression hoặc sự không tương thích với project của bạn. Định dạng requirements file cung cấp cú pháp để xử lý các tình huống này. Giả sử bạn đã dùng phiên bản 2.32.3 của `requests` trong project và phiên bản 3.0 được phát hành. Theo thực hành semantic versioning, việc tăng số major version cho biết phiên bản 3.0 của `requests` có các breaking change đối với API của thư viện đó.

Bạn có thể biểu đạt các yêu cầu phiên bản mới như sau:

```
requests ~= 2.32.3
```

Compatible release specifier (`~=`) dựa vào semantic versioning. Compatible nghĩa là lớn hơn hoặc bằng vế right-hand và nhỏ hơn số major của phiên bản kế tiếp (ví dụ, `>= 1.1` và `== 1.*`). Bạn đã thấy tôi biểu đạt cùng các yêu cầu phiên bản này cho `requests` một cách ít mơ hồ hơn như sau:

```
requests >=2.32.3,<3.0
```

Các kỹ thuật quản lý dependency `pip` này hoạt động tốt nếu bạn chỉ phát triển một project Python tại một thời điểm. Nhưng nhiều khả năng bạn dùng cùng một máy để làm việc với nhiều project Python cùng lúc, mỗi project có thể đòi hỏi một phiên bản Python interpreter khác nhau. Vấn đề lớn nhất khi chỉ dùng `pip` cho nhiều project là nó cài đặt tất cả package vào cùng một thư mục `site-packages` của người dùng cho một phiên bản Python cụ thể. Điều này khiến rất khó cô lập dependency giữa các project với nhau.

Như chúng ta sẽ thấy trong chương tiếp theo, `pip` kết hợp tốt với Docker để triển khai ứng dụng Python. Bạn có thể thêm `pip` vào một image Linux Buildroot hoặc Yocto-based nhưng điều đó chỉ cho phép thử nghiệm on-device nhanh. Một trình cài đặt package Python lúc runtime như `pip` ill-suited (không phù hợp) với các môi trường Buildroot và Yocto, nơi bạn muốn định nghĩa toàn bộ nội dung image embedded Linux lúc build. `pip` hoạt động tuyệt vời bên trong các môi trường container hóa như Docker, nơi ranh giới giữa build time và runtime thường mờ nhạt.

Trong Chương 7, bạn đã học về các module Python có sẵn trong layer `meta-python` và cách định nghĩa một custom layer cho ứng dụng của riêng bạn. Bạn có thể dùng các file `requirements.txt` do `pip freeze` tạo ra để định hướng việc chọn dependency từ `meta-python` cho các recipe trong layer của riêng bạn. Buildroot và Yocto đều cài đặt package Python theo cách system-wide, vì vậy các kỹ thuật môi trường ảo mà chúng ta sắp thảo luận tiếp theo bản thân chúng không áp dụng cho các bản build embedded Linux. Tuy nhiên, chúng giúp bạn lập một danh sách đầy đủ các dependency cho các ứng dụng Python nhúng của mình.

## Quản lý môi trường ảo Python với venv

Một môi trường ảo là một cây thư mục self-contained chứa một Python interpreter cho một phiên bản Python cụ thể, một file thực thi `pip` để quản lý dependency của project và một thư mục `site-packages` cục bộ. Chuyển đổi giữa các môi trường ảo đánh lừa shell để nó nghĩ rằng các file thực thi Python và `pip` duy nhất có sẵn là những file có trong môi trường ảo đang active. Best practice yêu cầu bạn tạo một môi trường ảo khác nhau cho mỗi project. Hình thức cô lập này giải quyết vấn đề hai project phụ thuộc vào các phiên bản khác nhau của cùng một package.

Môi trường ảo không phải là điều mới đối với Python. Bản chất system-wide của các bản cài đặt Python khiến chúng trở nên cần thiết. Ngoài việc cho phép bạn cài đặt các phiên bản khác nhau của cùng một package, môi trường ảo cũng cung cấp một cách dễ dàng để bạn chạy nhiều phiên bản Python interpreter. Có một số lựa chọn để quản lý môi trường ảo Python. Một công cụ cực kỳ phổ biến vào khoảng năm 2019 (`pipenv`) từ đó đã suy tàn. Package manager `conda` phổ biến đã hỗ trợ môi trường ảo Python từ cuối năm 2014. Trong khi đó, hỗ trợ built-in cho môi trường ảo của Python 3 (`venv`) được giới thiệu từ năm 2012 đã dần trưởng thành và giờ được áp dụng rộng rãi.

venv đã được phát hành cùng Python từ phiên bản 3.3. Vì nó chỉ đi kèm các bản cài đặt Python 3, `venv` không tương thích với các project đòi hỏi Python 2.7. Vì hỗ trợ cho Python 2.7 chính thức kết thúc vào ngày 1 tháng Một năm 2020, hạn chế này của Python 3 ít đáng lo hơn. `venv` dựa trên công cụ `virtualenv` phổ biến, vẫn đang được bảo trì và có sẵn trên PyPI. Nếu bạn có một hoặc nhiều project vẫn đòi hỏi Python 2.7, thì bạn có thể dùng `virtualenv` thay cho `venv` để làm việc với chúng.

Mặc định, `venv` cài đặt phiên bản Python mới nhất tìm thấy trên hệ thống. Nếu bạn có nhiều phiên bản Python trên hệ thống, bạn có thể chọn một phiên bản Python cụ thể bằng cách chạy `python3` hoặc bất kỳ phiên bản nào bạn muốn khi tạo mỗi môi trường ảo (The Python Tutorial, `https://docs.python.org/3/tutorial/venv.html`). Phát triển với phiên bản Python mới nhất thường ổn cho các project greenfield nhưng không chấp nhận được với hầu hết phần mềm legacy và doanh nghiệp. Chúng ta sẽ dùng phiên bản Python 3 đi kèm hệ thống Ubuntu của bạn để tạo và làm việc với một môi trường ảo.

Để tạo một môi trường ảo, trước tiên hãy quyết định bạn muốn đặt nó ở đâu, rồi chạy module `venv` như một script với đường dẫn thư mục đích:

1\. Bảo đảm `venv` đã được cài đặt trên hệ thống Ubuntu của bạn:

```
$ sudo apt install python3-venv
```

2\. Tạo một thư mục mới cho project của bạn:

```
$ mkdir myproject
```

3\. Chuyển sang thư mục mới đó:

```
$ cd myproject
```

4\. Tạo môi trường ảo bên trong một thư mục con tên `venv`:

```
$ python3 -m venv ./venv
```

Giờ bạn đã tạo một môi trường ảo, đây là cách bạn kích hoạt và xác nhận nó:

1\. Chuyển sang thư mục project nếu bạn chưa làm:

```
$ cd myproject
```

2\. Kiểm tra file thực thi `pip3` của hệ thống được cài đặt ở đâu:

```
$ which pip3
/usr/bin/pip3
```

3\. Kích hoạt môi trường ảo của project:

```
$ source ./venv/bin/activate
```

4\. Kiểm tra file thực thi `pip3` của project được cài đặt ở đâu:

```
(venv) $ which pip3
/home/frank/myproject/venv/bin/pip3
```

5\. Liệt kê các package được cài đặt sẵn cùng môi trường ảo:

```
(venv) $ pip3 list
Package Version
------- -------
pip     24.0
```

Nếu bạn nhập lệnh `which pip` từ bên trong môi trường ảo, bạn sẽ thấy rằng `pip` giờ trỏ tới một file thực thi. Giờ bạn có thể bỏ `3` khi chạy `pip` hoặc `python` từ bên trong môi trường ảo.

Tiếp theo, hãy cài đặt một thư viện kiểm thử property-based tên `hypothesis` vào môi trường ảo hiện có của chúng ta:

1\. Chuyển sang thư mục project nếu bạn chưa làm:

```
$ cd myproject
```

2\. Kích hoạt lại môi trường ảo của project nếu nó chưa active:

```
$ source ./venv/bin/activate
```

3\. Cài đặt package `hypothesis`:

```
(venv) $ pip install hypothesis
```

4\. Liệt kê các package giờ đã được cài đặt bên trong môi trường ảo:

```
(venv) $ pip list
Package          Version
---------------- -------
attrs            25.1.0
hypothesis       6.125.2
pip              24.0
sortedcontainers 2.4.0
```

Lưu ý rằng hai package mới (`attrs` và `sortedcontainers`) đã được thêm vào danh sách bên cạnh `hypothesis`. `hypothesis` phụ thuộc vào hai package này. Giả sử bạn có một project Python khác phụ thuộc vào phiên bản 1.5.10 thay vì phiên bản 2.4.0 của `sortedcontainers`. Hai phiên bản đó sẽ không tương thích và do đó xung đột với nhau. Môi trường ảo cho phép bạn cài đặt cả hai phiên bản của cùng một package, mỗi phiên bản cho một trong hai project.

Bạn có thể đã nhận thấy rằng chuyển ra khỏi một thư mục project không vô hiệu hóa môi trường ảo của nó. Đừng lo. Vô hiệu hóa một môi trường ảo dễ như sau:

```
(venv) $ deactivate
$
```

Điều này đưa bạn trở lại môi trường hệ thống toàn cục, nơi bạn phải nhập lại `python3` và `pip3`. Giờ bạn đã thấy mọi thứ cần biết để bắt đầu với môi trường ảo Python. Tạo và chuyển đổi giữa các môi trường ảo giờ là thực hành phổ biến khi phát triển bằng Python. Các môi trường cô lập giúp dễ theo dõi và quản lý dependency trên nhiều project hơn.

## Cài đặt binary biên dịch sẵn với conda

conda là một hệ thống quản lý package và môi trường ảo được dùng bởi bản phân phối phần mềm Anaconda cho cộng đồng PyData. Bản phân phối Anaconda bao gồm Python cũng như binary cho một số project open source hard-to-build như PyTorch và TensorFlow. `conda` có thể được cài đặt mà không cần bản phân phối Anaconda đầy đủ, vốn rất lớn, hoặc bản phân phối Miniconda tối giản, vẫn chiếm hơn 256 MB.

Mặc dù được tạo ra cho Python ngay sau `pip`, `conda` đã phát triển thành một package manager general-purpose như APT hay Homebrew. Giờ nó có thể được dùng để đóng gói và phân phối phần mềm cho bất kỳ ngôn ngữ nào. Vì `conda` tải về các binary biên dịch sẵn, việc cài đặt các extension module Python trở nên dễ dàng. Một điểm mạnh lớn khác của `conda` là nó cross-platform, hỗ trợ đầy đủ Linux, macOS và Windows.

Ngoài quản lý package, `conda` còn là một trình quản lý môi trường ảo full-blown. Các môi trường ảo `conda` có tất cả lợi ích mà chúng ta mong đợi từ các môi trường `venv` của Python và hơn thế nữa. Giống như `venv`, `conda` cho phép bạn dùng `pip` để cài đặt package từ PyPI vào thư mục `site-packages` cục bộ của project. Nếu thích, bạn có thể dùng khả năng quản lý package riêng của `conda` để cài đặt package từ các channel khác nhau. Channel là các nguồn cấp package do Anaconda và các bản phân phối phần mềm khác cung cấp.

### Quản lý môi trường

Khác với `venv`, trình quản lý môi trường ảo của `conda` có thể dễ dàng xoay xở nhiều phiên bản Python, bao gồm cả Python 2.7. Bạn sẽ cần cài đặt Miniconda trên hệ thống Ubuntu để làm các bài tập sau. Bạn nên dùng Miniconda thay vì Anaconda cho các môi trường ảo của mình vì các môi trường Anaconda đi kèm rất nhiều package cài đặt sẵn, nhiều trong số đó bạn sẽ không bao giờ cần. Các môi trường Miniconda được rút gọn và cho phép bạn dễ dàng cài đặt bất kỳ package nào của Anaconda nếu cần.

Để cài đặt và cập nhật Miniconda trên Ubuntu 24.04 LTS:

1\. Tải Miniconda:

```
$ wget https://repo.anaconda.com/miniconda/Miniconda3-latest-
Linux-x86_64.sh
```

2\. Cài đặt Miniconda:

```
$ bash Miniconda3-latest-Linux-x86_64.sh
```

3\. Cập nhật tất cả các package đã cài đặt trong root environment:

```
(base) $ conda update --all
```

Bản cài đặt Miniconda mới của bạn đi kèm `conda` và một root environment với một Python interpreter và một số package cơ bản đã được cài đặt. Mặc định, các file thực thi `python` và `pip` của root environment của `conda` được cài đặt trong thư mục home của bạn. Root environment của `conda` được gọi là `base`. Bạn có thể xem vị trí của nó, cùng với vị trí của bất kỳ môi trường `conda` có sẵn nào khác, bằng cách nhập lệnh sau:

```
(base) $ conda env list
```

Hãy xác nhận root environment này trước khi tạo môi trường `conda` của riêng bạn:

1\. Mở một shell mới sau khi cài đặt Miniconda.

2\. Kiểm tra file thực thi `python` của root environment được cài đặt ở đâu:

```
(base) $ which python
```

3\. Kiểm tra phiên bản Python:

```
(base) $ python --version
```

4\. Kiểm tra file thực thi `pip` của root environment được cài đặt ở đâu:

```
(base) $ which pip
```

5\. Kiểm tra phiên bản `pip`:

```
(base) $ pip --version
```

6\. Liệt kê các package được cài đặt trong root environment:

```
(base) $ conda list
```

Tiếp theo, hãy tạo và làm việc với môi trường `conda` của riêng bạn tên `py311`:

1\. Tạo một môi trường ảo mới tên `py311`:

```
(base) $ conda create --name py311 python=3.11.9
```

2\. Kích hoạt môi trường ảo mới của bạn:

```
(base) $ source activate py311
```

3\. Kiểm tra file thực thi `python` của môi trường được cài đặt ở đâu:

```
(py311) $ which python
```

4\. Kiểm tra rằng phiên bản Python là 3.11.9:

```
(py311) $ python --version
```

5\. Liệt kê các package được cài đặt trong môi trường của bạn:

```
(py311) $ conda list
```

6\. Vô hiệu hóa môi trường của bạn:

```
(py311) $ conda deactivate
```

Dùng `conda` để tạo một môi trường ảo có cài Python 2.7 đơn giản như sau:

```
(base) $ conda create --name py27 python=2.7.18
```

Xem lại các môi trường `conda` để xem `py311` và `py27` giờ có xuất hiện trong danh sách không:

```
(base) $ conda env list
```

Cuối cùng, hãy xóa môi trường `py27` vì chúng ta sẽ không dùng nó:

```
(base) $ conda remove --name py27 --all
```

Giờ bạn đã biết cách dùng `conda` để quản lý môi trường ảo, hãy dùng nó để quản lý package bên trong các môi trường đó.

### Quản lý package

Vì `conda` hỗ trợ môi trường ảo, chúng ta có thể dùng `pip` để quản lý dependency Python giữa các project theo cách cô lập, giống như đã làm với `venv`. Là một package manager general-purpose, `conda` có các tiện ích riêng để quản lý dependency. Chúng ta biết rằng `conda` `list` liệt kê tất cả các package mà `conda` đã cài đặt trong môi trường ảo đang active. Tôi cũng đã đề cập việc `conda` dùng các nguồn cấp package, được gọi là channel:

1\. Bạn có thể lấy danh sách các URL channel mà `conda` được cấu hình để lấy package bằng cách nhập lệnh này:

```
(base) $ conda info
```

2\. Trước khi đi tiếp, hãy kích hoạt lại môi trường ảo `py311` mà bạn đã tạo trong bài tập trước:

```
(base) $ source activate py311
(py311) $
```

3\. Hầu hết việc phát triển Python ngày nay diễn ra bên trong một Jupyter notebook, vì vậy hãy cài đặt các package đó trước:

```
(py311) $ conda install jupyter notebook
```

4\. Nhập y khi được nhắc. Việc này sẽ cài đặt các package `jupyter` và `notebook` cùng với tất cả dependency của chúng. Khi bạn nhập `conda list`, bạn sẽ thấy danh sách các package đã cài đặt dài hơn nhiều so với trước. Giờ hãy cài đặt thêm một số package Python mà chúng ta sẽ cần cho một project computer vision:

```
(py311) $ conda install opencv matplotlib
```

5\. Một lần nữa, nhập y khi được nhắc. Lần này, số dependency được cài đặt ít hơn. Cả `opencv` và `matplotlib` đều phụ thuộc vào `numpy`, vì vậy `conda` tự động cài đặt package đó mà bạn không cần chỉ định. Nếu bạn muốn chỉ định một phiên bản cũ hơn của `opencv`, bạn có thể cài đặt phiên bản mong muốn của package theo cách này:

```
(py311) $ conda install opencv=4.6.0
```

6\. `conda` sau đó sẽ cố giải môi trường đang active cho dependency này. Vì không có package nào khác được cài đặt trong môi trường ảo đang active này phụ thuộc vào `opencv`, phiên bản đích rất dễ giải. Nếu có, bạn có thể gặp xung đột package và việc cài đặt lại sẽ thất bại. Sau khi giải xong, `conda` sẽ hỏi bạn trước khi hạ cấp `opencv` và các dependency của nó. Nhập y để hạ cấp `opencv` xuống phiên bản 4.6.0.

7\. Giờ giả sử bạn đổi ý hoặc một phiên bản mới hơn của `opencv` được phát hành giải quyết mối lo trước đó của bạn. Đây là cách bạn nâng cấp `opencv` lên phiên bản mới nhất do bản phân phối Anaconda cung cấp:

```
(py311) $ conda update opencv
```

8\. Lần này, `conda` sẽ hỏi bạn có muốn cập nhật `opencv` và các dependency của nó lên phiên bản mới nhất không. Lần này, hãy nhập n để hủy việc cập nhật package. Thay vì cập nhật từng package riêng lẻ, thường dễ hơn là cập nhật tất cả các package được cài đặt trong một môi trường ảo đang active cùng lúc:

```
(py311) $ conda update --all
```

9\. Gỡ bỏ các package đã cài đặt cũng đơn giản:

```
(py311) $ conda remove jupyter notebook
```

   Khi `conda` gỡ bỏ `jupyter` và `notebook`, nó cũng gỡ bỏ tất cả dangling dependency của chúng. Một dangling dependency là một package đã cài đặt mà không có package đã cài đặt nào khác phụ thuộc vào. Giống như hầu hết các package manager general-purpose, `conda` sẽ không gỡ bỏ bất kỳ dependency nào mà các package đã cài đặt khác vẫn còn phụ thuộc.

10\. Đôi khi bạn có thể không biết tên chính xác của package mà bạn muốn cài đặt. Amazon cung cấp một AWS SDK cho Python gọi là Boto. Giống như nhiều thư viện Python, có một phiên bản Boto cho Python 2 và một phiên bản mới hơn (Boto3) cho Python 3. Để tìm trên Anaconda các package có từ `boto` trong tên, hãy nhập lệnh sau:

```
(py311) $ conda search '*boto*'
```

11\. Bạn sẽ thấy `boto3` và `botocore` trong kết quả tìm kiếm. Tại thời điểm viết, phiên bản mới nhất của `boto3` có trên Anaconda là 1.36.3. Để xem chi tiết về phiên bản cụ thể đó của `boto3`, hãy nhập lệnh sau:

```
(py311) $ conda search boto3=1.36.3 --info
```

   Chi tiết package cho thấy `boto3` phiên bản 1.36.3 phụ thuộc vào `botocore` (`botocore` `>=1.36.3,<1.37.0`), vì vậy cài đặt `boto3` sẽ cho bạn cả hai.

Giờ giả sử bạn đã cài đặt tất cả các package cần để phát triển một project OpenCV bên trong một Jupyter notebook. Làm thế nào để chia sẻ các yêu cầu project này với người khác để họ có thể tái tạo môi trường làm việc của bạn? Câu trả lời có thể khiến bạn ngạc nhiên:

1\. Bạn export môi trường ảo đang active ra một file YAML:

```
(py311) $ conda env export > my-environment.yaml
```

2\. Giống như danh sách requirements mà `pip freeze` tạo ra, YAML mà `conda` export là danh sách tất cả các package được cài đặt trong môi trường ảo của bạn cùng với các phiên bản được ghim của chúng. Tạo một môi trường ảo `conda` từ một environment file đòi hỏi tùy chọn `-f` và tên file:

```
$ conda env create -f my-environment.yaml
```

3\. Tên môi trường được đưa vào YAML đã export, vì vậy không cần tùy chọn `--name` để tạo môi trường. Bất kỳ ai tạo một môi trường ảo từ `my-environment.yaml` giờ sẽ thấy `py311` trong danh sách môi trường của họ khi họ nhập `conda env list`.

`conda` là một công cụ rất mạnh trong kho vũ khí của nhà phát triển. Bằng cách kết hợp việc cài đặt package general-purpose với môi trường ảo, nó mang lại một câu chuyện triển khai hấp dẫn. `conda` đạt được nhiều mục tiêu giống như Docker (phần tiếp theo) nhưng không dùng container. Nó có lợi thế hơn Docker đối với Python nhờ tập trung vào cộng đồng data science. Vì các ML framework hàng đầu (như PyTorch và TensorFlow) phần lớn là CUDA-based, việc tìm các binary GPU-accelerated thường khó. `conda` giải quyết vấn đề này bằng cách cung cấp nhiều phiên bản binary biên dịch sẵn của các package.

Export các môi trường ảo `conda` ra file YAML để cài đặt trên các máy khác mang lại một lựa chọn triển khai nữa. Giải pháp này phổ biến trong cộng đồng data science, nhưng nó không hoạt động trong production cho embedded Linux. `conda` không phải là một trong ba package manager mà Yocto hỗ trợ. Ngay cả nếu `conda` là một lựa chọn, dung lượng lưu trữ cần thiết để chứa Miniconda trên một image Linux không phù hợp với hầu hết các hệ thống nhúng do hạn chế về tài nguyên.

Nếu dev board của bạn có GPU NVIDIA như dòng NVIDIA Jetson, thì bạn thực sự nên dùng `conda` cho việc phát triển on-device. May mắn thay, có một trình cài đặt `conda` tên Miniforge (`https://github.com/conda-forge/miniforge)` được biết là hoạt động trên các máy ARM 64-bit như Jetson. Với `conda` trên thiết bị, bạn có thể cài đặt `jupyter`, `numpy`, `pandas`, `scikit-learn` và hầu hết các thư viện data science Python phổ biến khác.

## Tóm tắt

Đến giờ, có lẽ bạn đang tự hỏi, "Tất cả những thứ đóng gói Python này thì liên quan gì đến embedded Linux?" Câu trả lời là "không nhiều", nhưng hãy nhớ rằng từ development cũng tình cờ nằm trong tên của cuốn sách này, và chương này hoàn toàn liên quan đến việc phát triển phần mềm modern-day. Để thành công với tư cách nhà phát triển, bạn cần có khả năng triển khai code lên production nhanh, thường xuyên và theo cách có thể lặp lại. Điều đó có nghĩa là quản lý dependency cẩn thận và tự động hóa càng nhiều quy trình càng tốt. Giờ bạn đã biết cách làm điều đó với Python.

## Tìm hiểu thêm

- Python Packaging User Guide, PyPA – `https://packaging.python.org`

- setup.py vs requirements.txt, của Donald Stufft – `https://caremad.io/posts/2013/07/setup-vs-requirement`

- pip User Guide, PyPA – `https://pip.pypa.io/en/latest/user_guide/`

- Conda User Guide, Anaconda, Inc. – `https://docs.conda.io/projects/conda/en/latest/user-guide`
