# *Chương 16*: Đóng gói Python (Packaging Python)

**Python** là ngôn ngữ lập trình phổ biến nhất cho machine learning. Kết hợp điều đó với sự lan rộng của machine learning trong cuộc sống day-to-day của chúng ta và không có gì ngạc nhiên khi mong muốn chạy Python trên các thiết bị edge đang ngày càng mạnh lên. Ngay cả trong kỷ nguyên của transpiler và WebAssembly, việc đóng gói các application Python để triển khai vẫn là một vấn đề chưa được giải quyết. Trong chương này, bạn sẽ học có những lựa chọn nào để gói các module Python lại với nhau và khi nào nên dùng phương pháp này thay vì phương pháp khác.

Chúng ta bắt đầu bằng việc nhìn lại nguồn gốc của các giải pháp đóng gói Python ngày nay, từ `distutils` tiêu chuẩn built-in tới người kế nhiệm của nó, `setuptools`. Tiếp theo, chúng ta xem xét package manager `pip`, trước khi chuyển sang `venv` cho các Python virtual environment, theo sau là `conda`, giải pháp general-purpose cross-platform đang thống trị. Cuối cùng, tôi sẽ chỉ cho bạn cách dùng Docker để gói các application Python cùng với môi trường user space của chúng để triển khai nhanh lên cloud.

Vì Python là một ngôn ngữ thông dịch, bạn không thể biên dịch một chương trình thành một file thực thi độc lập như bạn có thể làm với một ngôn ngữ như Go. Điều này khiến việc triển khai các application Python phức tạp. Chạy một application Python đòi hỏi cài một Python interpreter và một số runtime dependency. Các yêu cầu này cần code-compatible để application hoạt động. Điều đó đòi hỏi đánh phiên bản chính xác các component phần mềm. Giải quyết các vấn đề triển khai này chính là toàn bộ ý nghĩa của việc đóng gói Python.

Trong chương này, chúng ta sẽ đề cập các chủ đề chính sau:

- Lần lại nguồn gốc của việc đóng gói Python
- Cài package Python bằng `pip`
- Quản lý Python virtual environment bằng `venv`
- Cài binary biên dịch sẵn bằng `conda`
- Triển khai application Python bằng Docker

## Yêu cầu kỹ thuật

Để làm theo các ví dụ, hãy bảo đảm bạn đã cài các package sau trên hệ thống host Linux-based:

- Python: Python 3 interpreter và standard library
- `pip`: Trình cài package cho Python 3
- `venv`: Module Python để tạo và quản lý các virtual environment nhẹ
- Miniconda: Trình cài tối giản cho package manager và virtual environment manager `conda`
- Docker: Công cụ để build, triển khai và chạy phần mềm bên trong container

Tôi khuyên dùng Ubuntu 20.04 LTS trở lên cho chương này. Dù Ubuntu 20.04 LTS chạy được trên Raspberry Pi 4, tôi vẫn thích phát triển trên một PC desktop hay laptop x86-64. Tôi chọn Ubuntu cho môi trường phát triển vì những người bảo trì bản phân phối giữ Docker luôn cập nhật. Ubuntu 20.04 LTS cũng có sẵn Python 3 và `pip` vì Python được dùng rộng rãi khắp hệ thống. Đừng gỡ `python3` nếu không bạn sẽ làm Ubuntu không dùng được. Để cài `venv` trên Ubuntu, nhập lệnh sau:

```
$ sudo apt install python3-venv
```

> **Lưu ý quan trọng**
>
> Đừng cài Miniconda cho đến khi bạn tới mục về `conda` vì nó gây cản trở các bài tập `pip` trước đó vốn dựa vào bản cài Python của hệ thống.

Bây giờ, hãy cài Docker.

### Lấy Docker

Để cài Docker trên Ubuntu 20.04 LTS, chúng ta cần làm như sau:

1. Cập nhật các package repository:

   ```
   $ sudo apt update
   ```

2. Cài Docker:

   ```
   $ sudo apt install docker.io
   ```

3. Khởi động Docker daemon và enable nó khởi động lúc boot:

   ```
   $ sudo systemctl enable --now docker
   ```

4. Thêm mình vào group `docker`:

   ```
   $ sudo usermod -aG docker <username>
   ```

Thay `<username>` trong bước cuối đó bằng username của bạn. Tôi khuyên tạo tài khoản user Ubuntu của riêng bạn thay vì dùng tài khoản user `ubuntu` mặc định, vốn được dành riêng cho các tác vụ quản trị.

## Lần lại nguồn gốc của việc đóng gói Python

Bức tranh đóng gói Python là một nghĩa địa rộng lớn của những nỗ lực thất bại và những công cụ bị bỏ rơi. Các best practice quanh việc quản lý phụ thuộc thay đổi thường xuyên trong cộng đồng Python và giải pháp được khuyến nghị năm nay có thể là một thứ hỏng không dùng được vào năm sau. Khi bạn tìm hiểu chủ đề này, hãy nhớ xem thông tin được công bố khi nào và đừng tin bất kỳ lời khuyên nào có thể đã lỗi thời.

Hầu hết các thư viện Python được phân phối bằng `distutils` hoặc `setuptools`, bao gồm tất cả các package có trên **Python Package Index** (**PyPI**). Cả hai phương pháp phân phối đều dựa vào một file đặc tả project `setup.py` mà **package installer for Python** (**pip**) dùng để cài một package. `pip` cũng có thể tạo hay *freeze* một danh sách phụ thuộc chính xác sau khi một project được cài. File `requirements.txt` tùy chọn này được `pip` dùng kết hợp với `setup.py` để bảo đảm việc cài project có thể lặp lại được.

### distutils

**distutils** là hệ thống đóng gói gốc cho Python. Nó đã được đưa vào Python standard library từ Python 2.0. `distutils` cung cấp một package Python cùng tên có thể được import bởi script `setup.py` của bạn. Dù `distutils` vẫn đi kèm Python, nó thiếu một số tính năng thiết yếu, nên việc dùng trực tiếp `distutils` giờ bị tích cực khuyên không nên. `setuptools` đã trở thành sự thay thế được ưa chuộng.

Dù `distutils` có thể tiếp tục hoạt động với các project đơn giản, cộng đồng đã tiến lên. Ngày nay, `distutils` tồn tại chủ yếu vì lý do di sản. Nhiều thư viện Python được công bố lần đầu hồi `distutils` còn là lựa chọn duy nhất. Port chúng sang `setuptools` bây giờ sẽ tốn công sức đáng kể và có thể làm hỏng những người dùng hiện có.

### setuptools

**setuptools** mở rộng `distutils` bằng cách thêm hỗ trợ cho các construct phức tạp giúp các application lớn hơn dễ phân phối hơn. Nó đã trở thành hệ thống đóng gói de facto trong cộng đồng Python. Giống `distutils`, `setuptools` cung cấp một package Python cùng tên mà bạn có thể import vào script `setup.py` của mình. `distribute` là một fork đầy tham vọng của `setuptools` cuối cùng đã được merge trở lại vào `setuptools 0.7`, củng cố vị thế của `setuptools` như lựa chọn dứt khoát cho việc đóng gói Python.

`setuptools` giới thiệu một tiện ích command-line gọi là `easy_install` (giờ đã deprecated) và một package Python tên `pkg_resources` để khám phá package lúc runtime và truy cập các file tài nguyên. `setuptools` cũng có thể tạo ra các package đóng vai trò plugin cho các package có thể mở rộng khác (chẳng hạn framework và application). Bạn làm điều này bằng cách đăng ký các entry point trong script `setup.py` để package bao trùm kia import.

Thuật ngữ *distribution* có nghĩa khác trong bối cảnh Python. Một distribution là một archive có đánh phiên bản của các package, module và các file tài nguyên khác được dùng để phân phối một release. Một *release* là một snapshot có đánh phiên bản của một project Python được chụp tại một thời điểm cho trước. Tệ hơn nữa, các thuật ngữ *package* và *distribution* bị quá tải nghĩa và thường được các Pythonista dùng thay thế cho nhau. Với mục đích của chúng ta, hãy nói rằng distribution là thứ bạn tải về, và package là (các) module được cài và import.

Cắt một release có thể tạo ra nhiều distribution, chẳng hạn một source distribution và một hoặc nhiều built distribution. Có thể có các built distribution khác nhau cho các nền tảng khác nhau, chẳng hạn một cái bao gồm trình cài Windows. Thuật ngữ *built distribution* có nghĩa là không cần bước build nào trước khi cài. Nó không nhất thiết có nghĩa là biên dịch sẵn. Chẳng hạn, một số định dạng built distribution như **Wheel** (`.whl`) loại trừ các file Python đã biên dịch. Một built distribution chứa các extension đã biên dịch được gọi là *binary distribution*.

Một **extension module** là một module Python được viết bằng C hoặc C++. Mỗi extension module biên dịch thành một thư viện nạp động duy nhất, chẳng hạn một shared object (`.so`) trên Linux và một DLL (`.pyd`) trên Windows. Hãy so sánh điều này với các pure module, phải được viết hoàn toàn bằng Python. Định dạng built distribution Egg (`.egg`) do `setuptools` giới thiệu hỗ trợ cả pure module lẫn extension module. Vì một file source code Python (`.py`) biên dịch thành một file bytecode (`.pyc`) khi Python interpreter import một module lúc runtime, bạn có thể thấy vì sao một định dạng built distribution như Wheel có thể loại trừ các file Python biên dịch sẵn.

### setup.py

Giả sử bạn đang phát triển một chương trình nhỏ bằng Python, có lẽ thứ gì đó truy vấn một REST API từ xa và lưu dữ liệu phản hồi vào một cơ sở dữ liệu SQL cục bộ. Làm sao bạn đóng gói chương trình cùng với các phụ thuộc của nó để triển khai? Bạn bắt đầu bằng việc định nghĩa một script **setup.py** mà `setuptools` có thể dùng để cài chương trình của bạn. Triển khai bằng `setuptools` là bước đầu tiên hướng tới các cơ chế triển khai tự động tinh vi hơn.

Ngay cả khi chương trình của bạn đủ nhỏ để nằm gọn trong một module duy nhất, nhiều khả năng nó sẽ không giữ như vậy lâu. Giả sử chương trình của bạn gồm một file duy nhất tên `follower.py`, như thế này:

```
$ tree follower
follower
└── follower.py
```

Sau đó bạn có thể chuyển module này thành một package bằng cách tách `follower.py` thành ba module riêng biệt và đặt chúng bên trong một thư mục lồng nhau cũng tên `follower`:

```
$ tree follower/
follower/
└── follower
    ├── fetch.py
    ├── __main__.py
    └── store.py
```

Module `__main__.py` là nơi chương trình của bạn bắt đầu, nên nó chứa chủ yếu chức năng top-level, user-facing. Module `fetch.py` chứa các function để gửi HTTP request tới REST API từ xa và module `store.py` chứa các function để lưu dữ liệu phản hồi vào cơ sở dữ liệu SQL cục bộ. Để chạy package này như một script, bạn cần truyền tùy chọn `-m` cho Python interpreter như sau:

```
$ PYTHONPATH=follower python -m follower
```

Biến môi trường `PYTHONPATH` trỏ tới thư mục nơi các thư mục package của một project đích nằm. Đối số `follower` sau tùy chọn `-m` bảo Python chạy module `__main__.py` thuộc package `follower`. Lồng các thư mục package bên trong một thư mục project như thế này mở đường cho chương trình của bạn phát triển thành một application lớn hơn gồm nhiều package, mỗi package có namespace riêng.

Với các phần của project đã ở đúng chỗ, giờ chúng ta sẵn sàng tạo một script `setup.py` tối giản mà `setuptools` có thể dùng để đóng gói và triển khai nó:

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

Đối số `install_requires` là một danh sách các phụ thuộc bên ngoài cần được cài tự động để một project hoạt động lúc runtime. Hãy để ý rằng tôi không chỉ định cần phiên bản nào của các phụ thuộc này hay lấy chúng từ đâu trong ví dụ của mình. Tôi chỉ yêu cầu các thư viện trông và hoạt động giống `requests` và `sqlalchemy`. Tách chính sách khỏi hiện thực như thế này cho phép bạn dễ dàng thay phiên bản PyPI chính thức của một phụ thuộc bằng phiên bản của riêng bạn trong trường hợp bạn cần sửa bug hay thêm tính năng. Thêm các version specifier tùy chọn vào khai báo phụ thuộc là ổn, nhưng hardcode các URL distribution bên trong `setup.py` dưới dạng `dependency_links` là sai về nguyên tắc.

Đối số `packages` cho `setuptools` biết những package in-tree nào cần phân phối cùng một release của project. Vì mỗi package được định nghĩa bên trong thư mục con riêng của nó trong thư mục project cha, package duy nhất được xuất trong trường hợp này là `follower`. Tôi đưa cả các file dữ liệu cùng với code Python vào distribution này. Để làm điều đó, bạn cần đặt đối số `include_package_data` thành `True` để `setuptools` tìm một file `MANIFEST.in` và cài tất cả các file được liệt kê ở đó. Đây là nội dung của file `MANIFEST.in`:

```
include data/events.db
```

Nếu thư mục `data` chứa các thư mục dữ liệu lồng nhau mà chúng ta muốn đưa vào, chúng ta có thể glob tất cả chúng cùng nội dung bằng `recursive-include`:

```
recursive-include data *
```

Đây là layout thư mục cuối cùng:

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

`setuptools` vượt trội ở việc build và phân phối các package Python phụ thuộc vào các package khác. Nó có thể làm điều này nhờ các tính năng như entry point và khai báo phụ thuộc, vốn đơn giản là không có trong `distutils`. `setuptools` hoạt động tốt với `pip` và các bản phát hành mới của `setuptools` ra đều đặn. Định dạng build distribution Wheel được tạo ra để thay thế định dạng Egg mà `setuptools` khởi xướng. Nỗ lực đó phần lớn đã thành công với việc bổ sung một extension `setuptools` phổ biến để build wheel và sự hỗ trợ tuyệt vời của `pip` cho việc cài wheel.

## Cài package Python bằng pip

Giờ bạn đã biết cách định nghĩa các phụ thuộc của project trong một script `setup.py`. Nhưng làm sao bạn cài các phụ thuộc đó? Làm sao bạn nâng cấp một phụ thuộc hay thay nó khi tìm thấy cái tốt hơn? Làm sao bạn quyết định khi nào an toàn để xóa một phụ thuộc bạn không còn cần? Quản lý các phụ thuộc của project là một việc khó nhằn. May mắn là Python đi kèm một công cụ gọi là **pip** có thể giúp, đặc biệt trong các giai đoạn đầu của project.

Bản phát hành 1.0 đầu tiên của `pip` ra mắt ngày 4 tháng Tư năm 2011, cùng khoảng thời gian Node.js và `npm` đang cất cánh. Trước khi trở thành `pip`, công cụ này tên là `pyinstall`. `pyinstall` được tạo năm 2008 như một lựa chọn thay thế cho `easy_install`, vốn đi kèm `setuptools` lúc đó. `easy_install` giờ đã deprecated và `setuptools` khuyến nghị dùng `pip` thay thế.

Vì `pip` được đưa vào trình cài Python và bạn có thể có nhiều phiên bản Python được cài trên hệ thống (chẳng hạn 2.7 và 3.8), biết mình đang chạy phiên bản `pip` nào là hữu ích:

```
$ pip --version
```

Nếu không tìm thấy file thực thi `pip` nào trên hệ thống, điều đó có lẽ có nghĩa là bạn đang dùng Ubuntu 20.04 LTS trở lên và không có Python 2.7 được cài. Điều đó ổn. Chúng ta sẽ chỉ thay `pip` bằng `pip3` và `python` bằng `python3` trong suốt phần còn lại của mục này:

```
$ pip3 --version
```

Nếu có `python3` nhưng không có file thực thi `pip3`, thì hãy cài nó như được thể hiện trên các bản phân phối Debian-based như Ubuntu:

```
$ sudo apt install python3-pip
```

`pip` cài package vào một thư mục gọi là `site-packages`. Để tìm vị trí của thư mục `site-packages`, chạy lệnh sau:

```
$ python3 -m site | grep ^USER_SITE
```

> **Lưu ý quan trọng**
>
> Lưu ý rằng các lệnh `pip3` và `python3` được thể hiện từ đây trở đi chỉ cần thiết với Ubuntu 20.04 LTS trở lên, vốn không còn đi kèm Python 2.7. Hầu hết các bản phân phối Linux vẫn đi kèm các file thực thi `pip` và `python`, nên hãy dùng các lệnh `pip` và `python` nếu đó là những gì hệ thống Linux của bạn đã cung cấp.

Để có danh sách các package đã được cài trên hệ thống, dùng lệnh này:

```
$ pip3 list
```

Danh sách cho thấy `pip` chỉ là một package Python khác, nên bạn có thể dùng `pip` để tự nâng cấp chính nó, nhưng tôi khuyên bạn đừng làm điều đó, ít nhất là không về lâu dài. Tôi sẽ giải thích vì sao ở mục tiếp theo khi giới thiệu virtual environment.

Để có danh sách các package được cài trong thư mục `site-packages` của bạn, dùng lệnh sau:

```
$ pip3 list --user
```

Danh sách này sẽ rỗng hoặc ngắn hơn nhiều so với danh sách package hệ thống.

Quay lại project ví dụ từ mục trước. `cd` vào thư mục cha `follower` nơi có `setup.py`. Sau đó chạy lệnh sau:

```
$ pip3 install --ignore-installed --user .
```

`pip` sẽ dùng `setup.py` để fetch và cài các package được khai báo bởi `install_requires` vào thư mục `site-packages` của bạn. Tùy chọn `--user` chỉ thị `pip` cài package vào thư mục `site-packages` của bạn thay vì cài toàn cục. Tùy chọn `--ignore-installed` buộc `pip` re-install mọi package cần thiết đã có trên hệ thống vào `site-packages` để không phụ thuộc nào bị thiếu. Bây giờ hãy liệt kê lại tất cả các package trong thư mục `site-packages`:

```
$ pip3 list --user
Package    Version
---------- ---------
certifi    2020.6.20
chardet    3.0.4
follower   0.1
idna       2.10
requests   2.24.0
SQLAlchemy 1.3.18
urllib3    1.25.10
```

Lần này, bạn sẽ thấy cả `requests` và `SQLAlchemy` đều nằm trong danh sách package.

Để xem chi tiết về package `SQLAlchemy` mà bạn có lẽ vừa cài, chạy lệnh sau:

```
$ pip3 show sqlalchemy
```

Các chi tiết được hiển thị chứa các trường `Requires` và `Required-by`. Cả hai đều là danh sách các package liên quan. Bạn có thể dùng các giá trị trong các trường này và các lời gọi `pip show` liên tiếp để lần theo cây phụ thuộc của project. Nhưng có lẽ dễ hơn khi `pip install` một công cụ command-line tên `pipdeptree` và dùng nó thay thế.

Khi một trường `Required-by` trở nên rỗng, đó là một dấu hiệu tốt cho thấy giờ đã an toàn để gỡ một package khỏi hệ thống. Nếu không có package nào khác phụ thuộc vào các package trong trường `Requires` của package bị xóa, thì cũng an toàn để gỡ chúng. Đây là cách bạn gỡ `sqlalchemy` bằng `pip`:

```
$ pip3 uninstall sqlalchemy -y
```

`-y` ở cuối chặn dấu nhắc xác nhận. Để gỡ nhiều hơn một package cùng lúc, chỉ cần thêm tên package trước `-y`. Tùy chọn `--user` được bỏ ở đây vì `pip` đủ thông minh để gỡ từ `site-packages` trước khi một package cũng được cài toàn cục.

Đôi khi bạn cần một package phục vụ mục đích nào đó hoặc dùng một công nghệ cụ thể, nhưng bạn không biết tên của nó. Bạn có thể dùng `pip` để thực hiện tìm kiếm theo từ khóa trên PyPI từ command line nhưng cách đó thường cho quá nhiều kết quả. Dễ hơn nhiều khi tìm package trên website PyPI ([https://pypi.org/search/](https://pypi.org/search/)), cho phép bạn lọc kết quả theo các classifier khác nhau.

### requirements.txt

`pip install` sẽ cài phiên bản được công bố mới nhất của một package, nhưng thường bạn muốn cài một phiên bản cụ thể của package mà bạn biết hoạt động với code của project. Cuối cùng, bạn sẽ muốn nâng cấp các phụ thuộc của project. Nhưng trước khi chỉ cho bạn cách làm điều đó, trước tiên tôi cần chỉ cho bạn cách dùng `pip freeze` để cố định các phụ thuộc.

Requirements file cho phép bạn chỉ định chính xác những package và phiên bản nào `pip` nên cài cho project của bạn. Theo quy ước, các **requirements file** của project luôn có tên `requirements.txt`. Nội dung của một requirements file chỉ là một danh sách các đối số `pip install` liệt kê các phụ thuộc của project. Các phụ thuộc này được đánh phiên bản chính xác để không có bất ngờ nào khi ai đó cố build lại và triển khai project của bạn. Thêm một file `requirements.txt` vào repo của project để bảo đảm các bản build có thể tái tạo là một thực hành tốt.

Quay lại project `follower`, giờ chúng ta đã cài tất cả các phụ thuộc và xác minh rằng code hoạt động như mong đợi, chúng ta sẵn sàng freeze các phiên bản mới nhất của các package mà `pip` đã cài cho chúng ta. `pip` có một lệnh `freeze` xuất ra các package đã cài cùng phiên bản của chúng. Bạn chuyển hướng output từ lệnh này vào một file `requirements.txt`:

```
$ pip3 freeze --user > requirements.txt
```

Giờ bạn đã có một file `requirements.txt`, những người clone project của bạn có thể cài tất cả các phụ thuộc của nó bằng tùy chọn `-r` và tên của requirements file:

```
$ pip3 install --user -r requirements.txt
```

Định dạng requirements file tự động tạo mặc định là khớp phiên bản chính xác (`==`). Chẳng hạn, một dòng như `requests==2.22.0` bảo `pip` rằng phiên bản `requests` cần cài phải chính xác là 2.22.0. Có các version specifier khác bạn có thể dùng trong một requirements file, chẳng hạn phiên bản tối thiểu (`>=`), loại trừ phiên bản (`!=`) và phiên bản tối đa (`<=`). Phiên bản tối thiểu (`>=`) khớp mọi phiên bản lớn hơn hoặc bằng right-hand side. Loại trừ phiên bản (`!=`) khớp mọi phiên bản ngoại trừ right-hand side. Phiên bản tối đa khớp mọi phiên bản nhỏ hơn hoặc bằng right-hand side.

Bạn có thể kết hợp nhiều version specifier trên một dòng bằng cách dùng dấu phẩy để ngăn cách chúng:

```
requests >=2.22.0,<3.0
```

Hành vi mặc định khi `pip` cài các package được chỉ định trong một requirements file là fetch tất cả chúng từ PyPI. Bạn có thể override URL của PyPI ([https://pypi.org/simple/](https://pypi.org/simple/)) bằng URL của một Python package index thay thế bằng cách thêm một dòng như sau vào đầu file `requirements.txt`:

```
--index-url http://pypi.mydomain.com/mirror
```

Công sức cần để dựng và bảo trì một PyPI mirror riêng không hề nhỏ. Khi tất cả những gì bạn cần làm là sửa một bug hay thêm một tính năng cho một phụ thuộc của project, sẽ hợp lý hơn khi override nguồn package thay vì toàn bộ package index.

> **Mẹo**
>
> Phiên bản 4.3 của Jetpack SDK cho NVIDIA Jetson Nano dựa trên bản phân phối 18.04 LTS của Ubuntu. Jetpack SDK bổ sung hỗ trợ phần mềm rộng rãi cho 128 lõi CUDA NVIDIA Maxwell của Nano, chẳng hạn GPU driver và các runtime component khác. Bạn có thể dùng `pip` để cài một wheel GPU-accelerated cho TensorFlow từ package index của NVIDIA:
>
> `$ pip install --user --extra-index-url` [https://developer.download.nvidia.com/compute/redist/jp/v43](https://developer.download.nvidia.com/compute/redist/jp/v43) `tensorflow-gpu==2.0.0+nv20.1`

Tôi đã đề cập trước đó việc hardcode các URL distribution bên trong `setup.py` là sai như thế nào. Bạn có thể dùng dạng đối số `-e` trong một requirements file để override nguồn của từng package:

```
-e git+https://github.com/myteam/flask.git#egg=flask
```

Trong ví dụ này, tôi đang chỉ thị `pip` fetch source package `flask` từ fork GitHub của nhóm tôi của `pallets/flask.git`. Dạng đối số `-e` cũng nhận một tên branch Git, commit hash hoặc tên tag:

```
-e git+https://github.com/myteam/flask.git@master
-e git+https://github.com/myteam/flask.git@5142930ef57e2f0ada00248bdaeb95406d18eb7c
-e git+https://github.com/myteam/flask.git@v1.0
```

Dùng `pip` để nâng cấp các phụ thuộc của project lên các phiên bản mới nhất được công bố trên PyPI khá đơn giản:

```
$ pip3 install --upgrade –user -r requirements.txt
```

Sau khi bạn đã xác minh, bằng việc cài với `pip:requirements.txt`, rằng các phiên bản mới nhất của các phụ thuộc không làm hỏng project, bạn có thể ghi chúng trở lại requirements file:

```
$ pip3 freeze --user > requirements.txt
```

Hãy bảo đảm việc freeze không ghi đè bất kỳ override hay xử lý phiên bản đặc biệt nào trong requirements file. Hoàn tác mọi sai sót và commit file `requirements.txt` đã cập nhật vào version control.

Đến một lúc nào đó, nâng cấp các phụ thuộc của project sẽ dẫn tới code của bạn bị hỏng. Một bản phát hành package mới có thể đưa vào một regression hoặc sự không tương thích với project của bạn. Định dạng requirements file cung cấp cú pháp để xử lý những tình huống này. Giả sử bạn đã dùng phiên bản 2.22.0 của `requests` trong project và phiên bản 3.0 được phát hành. Theo thực hành semantic versioning, tăng major version number cho biết phiên bản 3.0 của `requests` bao gồm các breaking change đối với API của thư viện đó. Bạn có thể biểu diễn các yêu cầu phiên bản mới như thế này:

```
requests ~= 2.22.0
```

Compatible release specifier (`~=`) dựa vào semantic versioning. Compatible nghĩa là lớn hơn hoặc bằng right-hand side và nhỏ hơn major number của phiên bản tiếp theo (chẳng hạn `>= 1.1` và `== 1.*`). Bạn đã thấy tôi biểu diễn cùng các yêu cầu phiên bản này cho `requests` một cách ít mơ hồ hơn như sau:

```
requests >=2.22.0,<3.0
```

Các kỹ thuật quản lý phụ thuộc `pip` này hoạt động tốt nếu bạn chỉ phát triển một project Python mỗi lần. Nhưng nhiều khả năng bạn dùng cùng một máy để làm nhiều project Python cùng lúc, mỗi project có thể cần một phiên bản Python interpreter khác nhau. Vấn đề lớn nhất khi chỉ dùng `pip` cho nhiều project là nó cài tất cả package vào cùng một thư mục `site-packages` của user cho một phiên bản Python cụ thể. Điều này khiến rất khó cô lập các phụ thuộc giữa các project.

Như chúng ta sẽ sớm thấy, `pip` kết hợp tốt với Docker để triển khai các application Python. Bạn có thể thêm `pip` vào một Linux image Buildroot- hoặc Yocto-based nhưng điều đó chỉ cho phép thử nghiệm nhanh trên board. Một trình cài package runtime cho Python như `pip` là ill-suited (không phù hợp) cho các môi trường Buildroot và Yocto, nơi bạn muốn định nghĩa toàn bộ nội dung của embedded Linux image lúc build. `pip` hoạt động rất tốt bên trong các môi trường container hóa như Docker, nơi ranh giới giữa lúc build và lúc runtime thường mờ nhạt.

Trong [*Chương 7*](ch07_developing_with_yocto.vi.md), *Phát triển với Yocto*, bạn đã học về các module Python có sẵn cho bạn trong layer `meta-python` và cách định nghĩa một layer tùy biến cho application của riêng bạn. Bạn có thể dùng các file `requirements.txt` được tạo bởi `pip freeze` để định hướng việc chọn các phụ thuộc từ `meta-python` cho các layer recipe của riêng bạn. Buildroot và Yocto đều cài các package Python theo cách system-wide, nên các kỹ thuật virtual environment chúng ta sắp thảo luận tiếp không áp dụng cho các bản build embedded Linux. Tuy nhiên, chúng giúp tạo ra các file `requirements.txt` chính xác dễ dàng hơn.

## Quản lý Python virtual environment bằng venv

Một **virtual environment** là một cây thư mục self-contained chứa một Python interpreter cho một phiên bản Python cụ thể, một file thực thi `pip` để quản lý các phụ thuộc của project, và một thư mục `site-packages` cục bộ. Chuyển giữa các virtual environment đánh lừa shell nghĩ rằng các file thực thi Python và `pip` duy nhất có sẵn là những file có trong virtual environment đang active. Best practice đòi hỏi bạn tạo một virtual environment khác nhau cho mỗi project. Dạng cô lập này giải quyết vấn đề hai project phụ thuộc vào các phiên bản khác nhau của cùng một package.

Virtual environment không mới với Python. Bản chất system-wide của các bản cài Python khiến chúng trở nên cần thiết. Ngoài việc cho phép bạn cài các phiên bản khác nhau của cùng một package, virtual environment cũng cung cấp một cách dễ dàng để chạy nhiều phiên bản Python interpreter. Có vài lựa chọn để quản lý Python virtual environment. Một công cụ cực kỳ phổ biến chỉ mới 2 năm trước (`pipenv`) đã mòn mỏi đi vào thời điểm viết sách. Trong khi đó, một ứng viên mới đã nổi lên (`poetry`) và hỗ trợ built-in của Python 3 cho virtual environment (`venv`) đang bắt đầu được áp dụng nhiều hơn.

**Venv** đã đi kèm Python từ phiên bản 3.3 (phát hành năm 2012). Vì nó chỉ đi kèm các bản cài Python 3, `venv` không tương thích với các project cần Python 2.7. Giờ khi hỗ trợ cho Python 2.7 đã chính thức kết thúc vào ngày 1 tháng Một năm 2020, hạn chế Python 3 này ít đáng lo hơn. `Venv` dựa trên công cụ phổ biến `virtualenv`, công cụ vẫn được bảo trì và có sẵn trên PyPI. Nếu bạn có một hoặc nhiều project vẫn cần Python 2.7 vì lý do này hay lý do khác, thì bạn có thể dùng `virtualenv` thay vì `venv` để làm việc với chúng.

Theo mặc định, `venv` cài phiên bản Python mới nhất tìm thấy trên hệ thống. Nếu bạn có nhiều phiên bản Python trên hệ thống, bạn có thể chọn một phiên bản Python cụ thể bằng cách chạy `python3` hoặc phiên bản nào bạn muốn khi tạo mỗi virtual environment (*The Python Tutorial*, [https://docs.python.org/3/tutorial/venv.html](https://docs.python.org/3/tutorial/venv.html)). Phát triển với phiên bản Python mới nhất thường ổn với các project greenfield nhưng không chấp nhận được với hầu hết phần mềm di sản và doanh nghiệp. Chúng ta sẽ dùng phiên bản Python 3 đi kèm hệ thống Ubuntu của bạn để tạo và làm việc với một virtual environment.

Để tạo một virtual environment, trước tiên hãy quyết định bạn muốn đặt nó ở đâu, rồi chạy module `venv` như một script với đường dẫn thư mục đích:

1. Bảo đảm `venv` đã được cài trên hệ thống Ubuntu:

   ```
   $ sudo apt install python3-venv
   ```

2. Tạo một thư mục mới cho project:

   ```
   $ mkdir myproject
   ```

3. Chuyển vào thư mục mới đó:

   ```
   $ cd myproject
   ```

4. Tạo virtual environment bên trong một thư mục con tên `venv`:

   ```
   $ python3 -m venv ./venv
   ```

Giờ bạn đã tạo một virtual environment, đây là cách bạn kích hoạt và kiểm tra nó:

1. Chuyển vào thư mục project nếu bạn chưa ở đó:

   ```
   $ cd myproject
   ```

2. Kiểm tra file thực thi `pip3` của hệ thống được cài ở đâu:

   ```
   $ which pip3
   /usr/bin/pip3
   ```

3. Kích hoạt virtual environment của project:

   ```
   $ source ./venv/bin/activate
   ```

4. Kiểm tra file thực thi `pip3` của project được cài ở đâu:

   ```
   (venv) $ which pip3
   /home/frank/myproject/venv/bin/pip3
   ```

5. Liệt kê các package được cài sẵn cùng virtual environment:

   ```
   (venv) $ pip3 list
   Package       Version
   ------------- -------
   pip           20.0.2
   pkg-resources 0.0.0
   setuptools    44.0.0
   ```

Nếu bạn nhập lệnh `which pip` từ bên trong virtual environment, bạn sẽ thấy `pip` giờ trỏ tới cùng file thực thi với `pip3`. Trước khi kích hoạt virtual environment, `pip` có lẽ không trỏ tới gì cả vì Ubuntu 20.04 LTS không còn đi kèm Python 2.7. Điều tương tự cũng đúng với `python` so với `python3`. Giờ bạn có thể bỏ `3` khi chạy `pip` hay `python` từ bên trong virtual environment.

Tiếp theo, hãy cài một thư viện test property-based tên `hypothesis` vào virtual environment hiện có:

1. Chuyển vào thư mục project nếu bạn chưa ở đó:

   ```
   $ cd myproject
   ```

2. Kích hoạt lại virtual environment của project nếu nó chưa active:

   ```
   $ source ./venv/bin/activate
   ```

3. Cài package `hypothesis`:

   ```
   (venv) $ pip install hypothesis
   ```

4. Liệt kê các package giờ đã được cài bên trong virtual environment:

   ```
   (venv) $ pip list
   Package          Version
   ---------------- -------
   attrs            19.3.0
   hypothesis       5.16.1
   pip              20.0.2
   pkg-resources    0.0.0
   setuptools       44.0.0
   sortedcontainers 2.2.2
   ```

Hãy để ý rằng hai package mới đã được thêm vào danh sách ngoài `hypothesis`, đó là `attrs` và `sortedcontainers`. `hypothesis` phụ thuộc vào hai package này. Giả sử bạn có một project Python khác phụ thuộc vào phiên bản 18.2.0 thay vì phiên bản 19.3.0 của `sortedcontainers`. Hai phiên bản đó sẽ không tương thích và vì vậy xung đột với nhau. Virtual environment cho phép bạn cài cả hai phiên bản của cùng một package, một phiên bản khác nhau cho mỗi project trong hai project.

Có thể bạn đã để ý rằng chuyển ra khỏi một thư mục project không hủy kích hoạt virtual environment của nó. Đừng lo. Hủy kích hoạt một virtual environment dễ như thế này:

```
(venv) $ deactivate
$
```

Lệnh này đưa bạn quay lại môi trường hệ thống toàn cục, nơi bạn phải nhập lại `python3` và `pip3`. Giờ bạn đã thấy mọi thứ cần biết để bắt đầu với Python virtual environment. Tạo và chuyển giữa các virtual environment giờ là thực hành phổ biến khi phát triển bằng Python. Các môi trường cô lập giúp dễ theo dõi và quản lý các phụ thuộc của bạn qua nhiều project. Triển khai Python virtual environment lên các thiết bị embedded Linux cho production ít hợp lý hơn, nhưng vẫn có thể làm được bằng một công cụ đóng gói Debian tên `dh-virtualenv` ([https://github.com/spotify/dh-virtualenv](https://github.com/spotify/dh-virtualenv)).

## Cài binary biên dịch sẵn bằng conda

**conda** là một hệ thống quản lý package và virtual environment được dùng bởi bản phân phối phần mềm **Anaconda** cho cộng đồng PyData. Bản phân phối Anaconda bao gồm Python cũng như binary cho một số project open source hard-to-build như PyTorch và TensorFlow. `conda` có thể được cài mà không cần bản phân phối Anaconda đầy đủ, vốn rất lớn, hay bản phân phối tối giản **Miniconda**, vốn vẫn trên 256 MB.

Dù được tạo cho Python không lâu sau `pip`, `conda` đã tiến hóa thành một package manager general-purpose như APT hay Homebrew. Giờ nó có thể được dùng để đóng gói và phân phối phần mềm cho bất kỳ ngôn ngữ nào. Vì `conda` tải về binary biên dịch sẵn, cài các extension module Python dễ như trở bàn tay. Một điểm bán hàng lớn khác của `conda` là nó cross-platform, hỗ trợ đầy đủ Linux, macOS và Windows.

Ngoài quản lý package, `conda` cũng là một virtual environment manager full-blown. Các virtual environment `Conda` có tất cả các lợi ích mà chúng ta mong đợi từ các môi trường `venv` của Python và hơn thế. Giống `venv`, `conda` cho phép bạn dùng `pip` để cài package từ PyPI vào thư mục `site-packages` cục bộ của một project. Nếu thích, bạn có thể dùng khả năng quản lý package riêng của `conda` để cài package từ các channel khác nhau. Channel là các package feed được Anaconda và các bản phân phối phần mềm khác cung cấp.

### Quản lý môi trường

Khác với `venv`, virtual environment manager của `conda` có thể dễ dàng xoay xở nhiều phiên bản Python, bao gồm Python 2.7. Bạn sẽ cần cài Miniconda trên hệ thống Ubuntu để làm các bài tập sau. Bạn nên dùng Miniconda thay vì Anaconda cho virtual environment vì các môi trường Anaconda đi kèm rất nhiều package cài sẵn, nhiều trong số đó bạn sẽ không bao giờ cần. Các môi trường Miniconda được rút gọn và cho phép bạn dễ dàng cài bất kỳ package nào của Anaconda nếu cần.

Để cài và cập nhật Miniconda trên Ubuntu 20.04 LTS, hãy làm như sau:

1. Tải về Miniconda:

   ```
   $ wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
   ```

2. Cài Miniconda:

   ```
   $ bash Miniconda3-latest-Linux-x86_64.sh
   ```

3. Cập nhật tất cả các package đã cài trong root environment:

   ```
   (base) $ conda update --all
   ```

Bản cài Miniconda mới của bạn đi kèm `conda` và một root environment chứa một Python interpreter và một số package cơ bản đã được cài. Theo mặc định, các file thực thi `python` và `pip` của root environment của `conda` được cài vào thư mục home của bạn. Root environment của `conda` được gọi là `base`. Bạn có thể xem vị trí của nó cùng vị trí của mọi môi trường `conda` khác có sẵn bằng lệnh sau:

```
(base) $ conda env list
```

Hãy kiểm tra root environment này trước khi tạo môi trường `conda` của riêng bạn:

1. Mở một shell mới sau khi cài Miniconda.

2. Kiểm tra file thực thi `python` của root environment được cài ở đâu:

   ```
   (base) $ which python
   ```

3. Kiểm tra phiên bản Python:

   ```
   (base) $ python --version
   ```

4. Kiểm tra file thực thi `pip` của root environment được cài ở đâu:

   ```
   (base) $ which pip
   ```

5. Kiểm tra phiên bản `pip`:

   ```
   (base) $ pip --version
   ```

6. Liệt kê các package được cài trong root environment:

   ```
   (base) $ conda list
   ```

Tiếp theo, tạo và làm việc với môi trường `conda` của riêng bạn tên `py377`:

1. Tạo một virtual environment mới tên `py377`:

   ```
   (base) $ conda create --name py377 python=3.7.7
   ```

2. Kích hoạt virtual environment mới của bạn:

   ```
   (base) $ source activate py377
   ```

3. Kiểm tra file thực thi `python` của môi trường được cài ở đâu:

   ```
   (py377) $ which python
   ```

4. Kiểm tra phiên bản Python là 3.7.7:

   ```
   (py377) $ python --version
   ```

5. Liệt kê các package được cài trong môi trường:

   ```
   (py377) $ conda list
   ```

6. Hủy kích hoạt môi trường:

   ```
   (py377) $ conda deactivate
   ```

Dùng `conda` để tạo một virtual environment có Python 2.7 đơn giản như sau:

```
(base) $ conda create --name py27 python=2.7.17
```

Xem lại các môi trường `conda` để thấy `py377` và `py27` giờ có xuất hiện trong danh sách không:

```
(base) $ conda env list
```

Cuối cùng, hãy xóa môi trường `py27` vì chúng ta sẽ không dùng nó:

```
(base) $ conda remove --name py27 –all
```

Giờ bạn đã biết cách dùng `conda` để quản lý virtual environment, hãy dùng nó để quản lý package bên trong các môi trường đó.

### Quản lý package

Vì `conda` hỗ trợ virtual environment, chúng ta có thể dùng `pip` để quản lý các phụ thuộc Python giữa các project một cách cô lập giống như đã làm với `venv`. Là một package manager general-purpose, `conda` có các cơ chế riêng để quản lý phụ thuộc. Chúng ta biết `conda list` liệt kê tất cả các package mà `conda` đã cài trong virtual environment đang active. Tôi cũng đã đề cập việc `conda` dùng các package feed, được gọi là channel:

1. Bạn có thể lấy danh sách các URL channel mà `conda` được cấu hình để fetch bằng cách nhập lệnh này:

   ```
   (base) $ conda info
   ```

2. Trước khi đi tiếp, hãy kích hoạt lại virtual environment `py377` mà bạn đã tạo trong bài tập trước:

   ```
   (base) $ source activate py377
   (py377) $
   ```

3. Phần lớn việc phát triển Python ngày nay diễn ra bên trong một Jupyter notebook, nên hãy cài các package đó trước:

   ```
   (py377) $ conda install jupyter notebook
   ```

4. Nhập `y` khi được nhắc. Việc này sẽ cài các package `jupyter` và `notebook` cùng tất cả các phụ thuộc của chúng. Khi bạn nhập `conda list`, bạn sẽ thấy danh sách package đã cài dài hơn nhiều so với trước. Bây giờ, hãy cài thêm một số package Python mà chúng ta sẽ cần cho một project computer vision:

   ```
   (py377) $ conda install opencv matplotlib
   ```

5. Một lần nữa, nhập `y` khi được nhắc. Lần này, số phụ thuộc được cài ít hơn. Cả `opencv` và `matplotlib` đều phụ thuộc vào `numpy`, nên `conda` tự động cài package đó mà bạn không cần chỉ định. Nếu bạn muốn chỉ định một phiên bản cũ hơn của `opencv`, bạn có thể cài phiên bản package mong muốn theo cách này:

   ```
   (py377) $ conda install opencv=3.4.1
   ```

6. `conda` sau đó sẽ cố *solve* môi trường đang active cho phụ thuộc này. Vì không có package nào khác được cài trong virtual environment đang active này phụ thuộc vào `opencv`, phiên bản đích dễ solve. Nếu có, thì bạn có thể gặp xung đột package và việc cài lại sẽ thất bại. Sau khi solve, `conda` sẽ hỏi bạn trước khi hạ cấp `opencv` và các phụ thuộc của nó. Nhập `y` để hạ cấp `opencv` xuống phiên bản 3.4.1.

7. Giờ giả sử bạn đổi ý hoặc một phiên bản `opencv` mới hơn được phát hành giải quyết mối lo trước đó của bạn. Đây là cách bạn nâng cấp `opencv` lên phiên bản mới nhất do bản phân phối Anaconda cung cấp:

   ```
   (py377) $ conda update opencv
   ```

8. Lần này, `conda` sẽ hỏi bạn có muốn cập nhật `opencv` và các phụ thuộc của nó lên phiên bản mới nhất không. Lần này, nhập `n` để hủy việc cập nhật package. Thay vì cập nhật từng package riêng lẻ, thường dễ hơn khi cập nhật tất cả các package được cài trong một virtual environment đang active cùng một lúc:

   ```
   (py377) $ conda update --all
   ```

9. Gỡ các package đã cài cũng đơn giản:

   ```
   (py377) $ conda remove jupyter notebook
   ```

10. Khi `conda` gỡ `jupyter` và `notebook`, nó cũng gỡ tất cả các phụ thuộc lơ lửng của chúng. Một phụ thuộc lơ lửng là một package đã cài mà không package đã cài nào khác phụ thuộc vào. Giống hầu hết các package manager general-purpose, `conda` sẽ không gỡ bất kỳ phụ thuộc nào mà các package đã cài khác vẫn phụ thuộc vào.

11. Đôi khi bạn có thể không biết tên chính xác của một package bạn muốn cài. Amazon cung cấp một AWS SDK cho Python gọi là Boto. Giống nhiều thư viện Python, có một phiên bản Boto cho Python 2 và một phiên bản mới hơn (Boto3) cho Python 3. Để tìm trong Anaconda các package có từ `boto` trong tên, nhập lệnh sau:

    ```
    (py377) $ conda search '*boto*'
    ```

12. Bạn sẽ thấy `boto3` và `botocore` trong kết quả tìm kiếm. Tại thời điểm viết sách, phiên bản `boto3` mới nhất có trên Anaconda là 1.13.11. Để xem chi tiết về phiên bản cụ thể đó của `boto3`, nhập lệnh sau:

    ```
    (py377) $ conda info boto3=1.13.11
    ```

13. Chi tiết package cho thấy `boto3` phiên bản 1.13.11 phụ thuộc vào `botocore` (`botocore >=1.16.11,<1.17.0`), nên cài `boto3` sẽ cho bạn cả hai.

Giờ giả sử bạn đã cài tất cả các package cần để phát triển một project OpenCV bên trong một Jupyter notebook. Làm sao bạn chia sẻ các yêu cầu project này với người khác để họ có thể tái tạo môi trường làm việc của bạn? Câu trả lời có thể làm bạn ngạc nhiên:

1. Bạn export virtual environment đang active ra một file YAML:

   ```
   (py377) $ conda env export > my-environment.yaml
   ```

2. Giống danh sách requirement mà `pip freeze` tạo ra, YAML mà `conda` export là một danh sách tất cả các package được cài trong virtual environment cùng các phiên bản đã ghim của chúng. Tạo một virtual environment `conda` từ một environment file cần tùy chọn `-f` và tên file:

   ```
   $ conda env create -f my-environment.yaml
   ```

3. Tên môi trường có trong YAML đã export, nên không cần tùy chọn `--name` để tạo môi trường. Bất kỳ ai tạo một virtual environment từ `my-environment.yaml` giờ sẽ thấy `py377` trong danh sách môi trường của họ khi chạy `conda env list`.

`conda` là một công cụ rất mạnh trong kho vũ khí của lập trình viên. Bằng cách kết hợp cài package general-purpose với virtual environment, nó mang lại một câu chuyện triển khai hấp dẫn. `conda` đạt được nhiều mục tiêu giống như Docker (sắp tới) nhưng không cần dùng container. Nó có lợi thế hơn Docker đối với Python nhờ tập trung vào cộng đồng data science. Vì các framework machine learning hàng đầu (chẳng hạn PyTorch và TensorFlow) phần lớn CUDA-based, việc tìm binary GPU-accelerated thường khó. `conda` giải quyết vấn đề này bằng cách cung cấp nhiều phiên bản binary biên dịch sẵn của các package.

Export các virtual environment `conda` ra file YAML để cài trên các máy khác mang lại một lựa chọn triển khai khác. Giải pháp này phổ biến trong cộng đồng data science, nhưng nó không hoạt động trong production cho embedded Linux. `conda` không phải là một trong ba package manager mà Yocto hỗ trợ. Ngay cả khi `conda` là một lựa chọn, dung lượng lưu trữ cần để chứa Miniconda trên một Linux image không phù hợp với hầu hết hệ thống nhúng resource-constrained.

Nếu dev board của bạn có GPU NVIDIA như dòng NVIDIA Jetson, thì bạn thực sự nên dùng `conda` để phát triển trên board. May mắn là có một trình cài `conda` tên **Miniforge** ([https://github.com/conda-forge/miniforge](https://github.com/conda-forge/miniforge)) được biết là hoạt động trên các máy ARM 64-bit như Jetson. Với `conda` trên board, bạn có thể cài `jupyter`, `numpy`, `pandas`, `scikit-learn` và hầu hết các thư viện data science Python phổ biến khác.

## Triển khai application Python bằng Docker

**Docker** cung cấp một cách khác để gói code Python với phần mềm viết bằng các ngôn ngữ khác. Ý tưởng đằng sau Docker là thay vì đóng gói và cài application lên một môi trường server được cấu hình sẵn, bạn build và xuất một container image với application và tất cả các runtime dependency của nó. Một **container image** giống một virtual environment hơn là một virtual machine. Một **virtual machine** là một system image hoàn chỉnh bao gồm một kernel và một hệ điều hành. Một container image là một môi trường user space tối giản chỉ đi kèm các binary cần để chạy application của bạn.

Virtual machine chạy trên một **hypervisor** giả lập phần cứng. Container chạy trực tiếp trên hệ điều hành host. Khác với virtual machine, container có thể dùng chung cùng hệ điều hành và kernel mà không cần giả lập phần cứng. Thay vào đó, chúng dựa vào hai tính năng đặc biệt của Linux kernel để cô lập: **namespaces** và **cgroups**. Docker không phát minh ra công nghệ container, nhưng họ là những người đầu tiên xây dựng công cụ giúp chúng dễ dùng. Lời bào chữa nhàm chán *chạy được trên máy tôi* không còn tác dụng giờ khi Docker khiến việc build và triển khai container image đơn giản đến vậy.

### Cấu tạo của một Dockerfile

Một **Dockerfile** mô tả nội dung của một Docker image. Mỗi Dockerfile chứa một tập chỉ thị chỉ định dùng môi trường nào và chạy những lệnh nào. Thay vì viết một Dockerfile từ đầu, chúng ta sẽ dùng một Dockerfile có sẵn cho một project template. Dockerfile này tạo một Docker image cho một web application Flask rất đơn giản mà bạn có thể mở rộng cho phù hợp nhu cầu. Docker image được build trên nền Alpine Linux, một bản phân phối Linux rất gọn thường được dùng cho việc triển khai container. Ngoài Flask, Docker image cũng bao gồm uWSGI và Nginx để có hiệu năng tốt hơn.

Bắt đầu bằng cách trỏ trình duyệt web tới project `uwsgi-nginx-flask-docker` trên GitHub ([https://github.com/tiangolo/uwsgi-nginx-flask-docker](https://github.com/tiangolo/uwsgi-nginx-flask-docker)). Sau đó, click vào link tới Dockerfile `python-3.8-alpine` từ file `README.md`.

Bây giờ hãy xem dòng đầu tiên trong Dockerfile đó:

```
FROM tiangolo/uwsgi-nginx:python3.8-alpine
```

Lệnh `FROM` này bảo Docker pull một image tên `uwsgi-nginx` từ namespace `tiangolo` với tag `python3.8-alpine` từ Docker Hub. Docker Hub là một registry công khai nơi mọi người công bố Docker image của họ để người khác fetch và triển khai. Bạn có thể thiết lập image registry của riêng mình bằng một dịch vụ như AWS ECR hay Quay nếu muốn. Bạn sẽ cần chèn tên dịch vụ registry của bạn vào trước namespace như thế này:

```
FROM quay.io/my-org/my-app:my-tag
```

Nếu không, Docker mặc định fetch image từ Docker Hub. `FROM` giống một statement `include` trong Dockerfile. Nó chèn nội dung của một Dockerfile khác vào Dockerfile của bạn để bạn có thứ gì đó để build lên trên. Tôi thích nghĩ về cách tiếp cận này như việc xếp lớp image. Alpine là lớp nền, tiếp theo là Python 3.8, rồi uWSGI cộng Nginx, và cuối cùng là application Flask của bạn. Bạn có thể học thêm về cách xếp lớp image hoạt động bằng cách đào sâu vào Dockerfile `python3.8-alpine` tại [https://hub.docker.com/r/tiangolo/uwsgi-nginx](https://hub.docker.com/r/tiangolo/uwsgi-nginx).

Dòng đáng chú ý tiếp theo trong Dockerfile là như sau:

```
RUN pip install flask
```

Một chỉ thị `RUN` chạy một lệnh. Docker thực thi các chỉ thị `RUN` chứa trong Dockerfile một cách tuần tự để build ra Docker image kết quả. Chỉ thị `RUN` này cài Flask vào thư mục `site-packages` của hệ thống. Chúng ta biết `pip` có sẵn vì base image Alpine cũng bao gồm Python 3.8.

Hãy bỏ qua các biến môi trường của Nginx và đi thẳng tới việc sao chép:

```
COPY ./app /app
```

Dockerfile cụ thể này nằm bên trong một Git repo cùng với một số file và thư mục con khác. Chỉ thị `COPY` sao chép một thư mục từ môi trường runtime Docker của host (thường là một Git clone của một repo) vào container đang được build.

File `python3.8-alpine.dockerfile` mà bạn đang xem nằm trong một thư mục con `docker-images` của repo `tiangolo/uwsgi-nginx-flask-docker`. Bên trong thư mục `docker-images` đó là một thư mục con `app` chứa một web application Flask Hello World. Chỉ thị `COPY` này sao chép thư mục `app` từ repo ví dụ vào thư mục gốc của Docker image:

```
WORKDIR /app
```

Chỉ thị `WORKDIR` bảo Docker làm việc từ thư mục nào bên trong container. Trong ví dụ này, thư mục `/app` mà nó vừa sao chép trở thành thư mục làm việc. Nếu thư mục làm việc đích không tồn tại, thì `WORKDIR` tạo nó. Mọi đường dẫn non-absolute xuất hiện sau đó trong Dockerfile này do đó là tương đối với thư mục `/app`.

Bây giờ hãy xem một biến môi trường được đặt bên trong container như thế nào:

```
ENV PYTHONPATH=/app
```

`ENV` bảo Docker rằng những gì theo sau là một định nghĩa biến môi trường. `PYTHONPATH` là một biến môi trường mở rộng thành một danh sách các đường dẫn colon-delimited nơi Python interpreter tìm module và package.

Tiếp theo, hãy nhảy xuống vài dòng tới chỉ thị `RUN` thứ hai:

```
RUN chmod +x /entrypoint.sh
```

Chỉ thị `RUN` bảo Docker chạy một lệnh từ shell. Trong trường hợp này, lệnh được chạy là `chmod`, lệnh thay đổi quyền file. Ở đây nó làm `/entrypoint.sh` thành thực thi được.

Dòng tiếp theo trong Dockerfile này là tùy chọn:

```
ENTRYPOINT ["/entrypoint.sh"]
```

`ENTRYPOINT` là chỉ thị thú vị nhất trong Dockerfile này. Nó đưa một file thực thi ra command line của Docker host khi khởi động container. Điều này cho phép bạn truyền đối số từ command line xuống file thực thi bên trong container. Bạn có thể nối các đối số này sau `docker run <image>` trên command line. Nếu có nhiều hơn một chỉ thị `ENTRYPOINT` trong một Dockerfile, thì chỉ `ENTRYPOINT` cuối cùng được thực thi.

Dòng cuối cùng trong Dockerfile như sau:

```
CMD ["/start.sh"]
```

Giống các chỉ thị `ENTRYPOINT`, các chỉ thị `CMD` thực thi lúc khởi động container thay vì lúc build. Khi một chỉ thị `ENTRYPOINT` được định nghĩa trong một Dockerfile, một chỉ thị `CMD` định nghĩa các đối số mặc định được truyền cho `ENTRYPOINT` đó. Trong trường hợp này, đường dẫn `/start.sh` là đối số được truyền cho `/entrypoint.sh`. Dòng cuối cùng trong `/entrypoint.sh` thực thi `/start.sh`:

```
exec "$@"
```

Script `/start.sh` đến từ base image `uwsgi-nginx`. `/start.sh` khởi động Nginx và uWSGI sau khi `/entrypoint.sh` đã cấu hình môi trường runtime của container cho chúng. Khi `CMD` được dùng kết hợp với `ENTRYPOINT`, các đối số mặc định được `CMD` đặt có thể bị override từ command line của Docker host.

Hầu hết Dockerfile không có chỉ thị `ENTRYPOINT`, nên dòng cuối cùng của một Dockerfile thường là một chỉ thị `CMD` chạy ở foreground thay vì các đối số mặc định. Tôi dùng mẹo Dockerfile này để giữ một Docker container general-purpose chạy cho việc phát triển:

```
CMD tail -f /dev/null
```

Ngoại trừ `ENTRYPOINT` và `CMD`, tất cả các chỉ thị trong Dockerfile `python-3.8-alpine` ví dụ này chỉ thực thi khi container đang được build.

### Build một Docker image

Trước khi có thể build một Docker image, chúng ta cần một Dockerfile. Có thể bạn đã có một số Docker image trên hệ thống. Để xem danh sách Docker image, dùng lệnh sau:

```
$ docker images
```

Bây giờ, hãy fetch và build Dockerfile mà chúng ta vừa mổ xẻ:

1. Clone repo chứa Dockerfile:

   ```
   $ git clone https://github.com/tiangolo/uwsgi-nginx-flask-docker.git
   ```

2. Chuyển vào thư mục con `docker-images` bên trong repo:

   ```
   $ cd uwsgi-nginx-flask-docker/docker-images
   ```

3. Sao chép `python3.8-alpine.dockerfile` sang một file tên `Dockerfile`:

   ```
   $ cp python3.8-alpine.dockerfile Dockerfile
   ```

4. Build một image từ Dockerfile:

   ```
   $ docker build -t my-image .
   ```

Khi image đã build xong, nó sẽ xuất hiện trong danh sách Docker image cục bộ của bạn:

```
$ docker images
```

Một base image `uwsgi-nginx` cũng sẽ xuất hiện trong danh sách cùng với `my-image` vừa build. Hãy để ý rằng thời gian trôi qua kể từ khi base image `uwsgi-nginx` được tạo lớn hơn nhiều so với thời gian kể từ khi `my-image` được tạo.

### Chạy một Docker image

Giờ chúng ta đã build xong một Docker image mà chúng ta có thể chạy như một container. Để có danh sách các container đang chạy trên hệ thống, dùng lệnh sau:

```
$ docker ps
```

Để chạy một container dựa trên `my-image`, chạy lệnh `docker run` sau:

```
$ docker run -d --name my-container -p 80:80 my-image
```

Bây giờ hãy quan sát trạng thái của container đang chạy:

```
$ docker ps
```

Bạn sẽ thấy một container tên `my-container` dựa trên một image tên `my-image` trong danh sách. Tùy chọn `-p` trong lệnh `docker run` ánh xạ một port container tới một port host. Vì vậy, port container `80` ánh xạ tới port host `80` trong ví dụ này. Ánh xạ port này cho phép web server Flask chạy bên trong container phục vụ các HTTP request.

Để dừng `my-container`, chạy lệnh này:

```
$ docker stop my-container
```

Bây giờ hãy kiểm tra lại trạng thái của container đang chạy:

```
$ docker ps
```

`my-container` sẽ không còn xuất hiện trong danh sách các container đang chạy. Container đã biến mất chưa? Không, nó chỉ bị dừng. Bạn vẫn có thể thấy `my-container` và trạng thái của nó bằng cách thêm tùy chọn `-a` vào lệnh `docker ps`:

```
$ docker ps -a
```

Chúng ta sẽ xem cách xóa các container không còn cần một chút sau.

### Fetch một Docker image

Trước đó trong mục này, tôi đã đề cập qua các image registry như Docker Hub, AWS ECR và Quay. Hóa ra, Docker image mà chúng ta đã build cục bộ từ một GitHub repo được clone đã được công bố trên Docker Hub. Fetch image dựng sẵn từ Docker Hub nhanh hơn nhiều so với tự build nó trên hệ thống. Các Docker image cho project có thể được tìm thấy tại [https://hub.docker.com/r/tiangolo/uwsgi-nginx-flask](https://hub.docker.com/r/tiangolo/uwsgi-nginx-flask). Để pull cùng Docker image mà chúng ta đã build thành `my-image` từ Docker Hub, nhập lệnh sau:

```
$ docker pull tiangolo/uwsgi-nginx-flask:python3.8-alpine
```

Bây giờ hãy xem lại danh sách Docker image:

```
$ docker images
```

Bạn sẽ thấy một image `uwsgi-nginx-flask` mới trong danh sách.

Để chạy image vừa fetch này, chạy lệnh `docker run` sau:

```
$ docker run -d --name flask-container -p 80:80 tiangolo/uwsgi-nginx-flask:python3.8-alpine
```

Bạn có thể thay tên image đầy đủ (`repo:tag`) trong lệnh `docker run` trên bằng image ID (hash) tương ứng từ `docker images` nếu không muốn gõ ra tên image đầy đủ.

### Công bố một Docker image

Để công bố một Docker image lên Docker Hub, trước tiên bạn phải có một tài khoản và đăng nhập vào đó. Bạn có thể tạo tài khoản trên Docker Hub bằng cách truy cập website, [https://hub.docker.com](https://hub.docker.com), và đăng ký. Khi đã có tài khoản, bạn có thể push một image có sẵn lên Docker Hub repository của mình:

1. Đăng nhập vào image registry Docker Hub từ command line:

   ```
   $ docker login
   ```

2. Nhập username và mật khẩu Docker Hub khi được nhắc.

3. Gắn tag cho một image có sẵn với một tên mới bắt đầu bằng tên repository của bạn:

   ```
   $ docker tag my-image:latest <repository>/my-image:latest
   ```

   Thay `<repository>` trong lệnh trên bằng tên repository của bạn (giống username của bạn) trên Docker Hub. Bạn cũng có thể thay `my-image:latest` bằng tên của một image có sẵn khác mà bạn muốn push.

4. Push image lên image registry Docker Hub:

   ```
   $ docker push <repository>/my-image:latest
   ```

   Một lần nữa, hãy thực hiện các thay thế giống như ở *Bước 3*.

Các image được push lên Docker Hub mặc định là công khai. Để truy cập trang web của image vừa công bố, hãy tới https://hub.docker.com/repository/docker/&lt;repository&gt;/my-image. Thay `<repository>` trong URL trên bằng tên repository của bạn (giống username của bạn) trên Docker Hub. Bạn cũng có thể thay `my-image:latest` bằng tên của image thực tế bạn đã push nếu khác. Nếu bạn click vào tab **Tags** trên trang web đó, bạn sẽ thấy lệnh `docker pull` để fetch image đó.

### Dọn dẹp

Chúng ta biết `docker images` liệt kê image và `docker ps` liệt kê container. Trước khi có thể xóa một Docker image, trước tiên chúng ta phải xóa mọi container tham chiếu tới nó. Để xóa một Docker container, trước tiên bạn cần biết tên hoặc ID của container:

1. Tìm tên của Docker container đích:

   ```
   $ docker ps -a
   ```

2. Dừng container nếu nó đang chạy:

   ```
   $ docker stop flask-container
   ```

3. Xóa Docker container:

   ```
   $ docker rm flask-container
   ```

Thay `flask-container` trong hai lệnh trên bằng tên hoặc ID container từ *Bước 1*. Mọi container xuất hiện dưới `docker ps` cũng có một tên hoặc ID image gắn với nó. Khi đã xóa tất cả các container tham chiếu tới một image, bạn có thể xóa image đó.

Tên Docker image (`repo:tag`) có thể khá dài (chẳng hạn `tiangolo/uwsgi-nginx-flask:python3.8-alpine`). Vì lý do đó, tôi thấy dễ hơn khi chỉ cần sao chép và dán ID (hash) của image khi xóa:

1. Tìm ID của Docker image:

   ```
   $ docker images
   ```

2. Xóa Docker image:

   ```
   $ docker rmi <image-ID>
   ```

Thay `<image-ID>` trong lệnh trên bằng image ID từ *Bước 1*.

Nếu bạn chỉ đơn giản muốn dẹp sạch tất cả các container và image bạn không còn dùng trên hệ thống, thì đây là lệnh:

```
$ docker system prune -a
```

`docker system prune` xóa tất cả các container đã dừng và các image lơ lửng.

Chúng ta đã thấy `pip` có thể được dùng để cài các phụ thuộc của một application Python như thế nào. Bạn chỉ cần thêm một chỉ thị `RUN` gọi `pip install` vào Dockerfile. Vì container là các môi trường sandbox, chúng mang lại nhiều lợi ích giống như virtual environment. Nhưng khác với các virtual environment `conda` và `venv`, Buildroot và Yocto đều hỗ trợ Docker container. Buildroot có các package `docker-engine` và `docker-cli`. Yocto có layer `meta-virtualization`. Nếu thiết bị của bạn cần cô lập vì xung đột package Python, thì bạn có thể đạt được điều đó với Docker.

Lệnh `docker run` cung cấp các tùy chọn để đưa tài nguyên hệ điều hành cho container. Chỉ định một bind mount cho phép một file hoặc thư mục trên máy host được mount bên trong container để đọc và ghi. Theo mặc định, container không công bố port nào ra thế giới bên ngoài. Khi bạn chạy image `my-container`, bạn đã dùng tùy chọn `-p` để công bố port `80` từ container tới port `80` trên host. Tùy chọn `--device` thêm một device file của host dưới `/dev` vào một container unprivileged. Nếu bạn muốn cấp quyền truy cập tất cả các thiết bị trên host, thì hãy dùng tùy chọn `--privileged`.

Điều container vượt trội là triển khai. Khả năng push một Docker image mà sau đó có thể dễ dàng được pull và chạy trên bất kỳ nền tảng cloud lớn nào đã cách mạng hóa phong trào **DevOps**. Docker cũng đang thâm nhập vào lĩnh vực embedded Linux nhờ các giải pháp cập nhật OTA như balena. Một trong những nhược điểm của Docker là storage footprint và memory overhead của runtime. Các binary Go hơi phình to, nhưng Docker chạy tốt trên các SoC ARM 64-bit quad-core như Raspberry Pi 4. Nếu thiết bị target của bạn đủ mạnh, thì hãy chạy Docker trên nó. Nhóm phát triển phần mềm của bạn sẽ cảm ơn bạn.

## Tóm tắt

Đến giờ, có lẽ bạn đang tự hỏi, tất cả những thứ về đóng gói Python này thì liên quan gì tới embedded Linux? Câu trả lời là *không nhiều*, nhưng hãy nhớ rằng từ *programming* cũng nằm trong tên của cuốn sách này. Và chương này hoàn toàn liên quan tới lập trình modern-day. Để thành công như một lập trình viên trong thời đại ngày nay, bạn cần có khả năng triển khai code lên production nhanh, thường xuyên và theo cách có thể lặp lại. Điều đó có nghĩa là quản lý các phụ thuộc cẩn thận và tự động hóa quy trình càng nhiều càng tốt. Giờ bạn đã thấy có những công cụ nào để làm điều đó với Python.

Trong chương tiếp theo, chúng ta sẽ xem chi tiết mô hình process của Linux và mô tả process thực sự là gì, nó liên quan tới thread như thế nào, chúng hợp tác ra sao và được lập lịch thế nào. Hiểu những điều này là quan trọng nếu bạn muốn tạo một hệ thống nhúng bền vững và dễ bảo trì.

## Đọc thêm

Các tài liệu sau có thêm thông tin về các chủ đề đã được giới thiệu trong chương này:

- *Python Packaging User Guide* (Hướng dẫn đóng gói Python), PyPA: [https://packaging.python.org](https://packaging.python.org)
- *setup.py vs requirements.txt*, của Donald Stufft: [https://caremad.io/posts/2013/07/setup-vs-requirement](https://caremad.io/posts/2013/07/setup-vs-requirement)
- *pip User Guide* (Hướng dẫn sử dụng pip), PyPA: [https://pip.pypa.io/en/latest/user_guide/](https://pip.pypa.io/en/latest/user_guide/)
- *Poetry Documentation* (Tài liệu Poetry), Poetry: [https://python-poetry.org/docs](https://python-poetry.org/docs)
- *conda user guide* (Hướng dẫn sử dụng conda), Continuum Analytics: [https://docs.conda.io/projects/conda/en/latest/user-guide](https://docs.conda.io/projects/conda/en/latest/user-guide)
- *docker docs* (Tài liệu docker), Docker Inc.: [https://docs.docker.com/engine/reference/commandline/docker](https://docs.docker.com/engine/reference/commandline/docker)
