<a id="part2-putting-things-back-together"></a>

# Phần II. Ghép mọi thứ trở lại (Putting Things Back Together)

> Cố chia một module cohesive chỉ dẫn đến coupling tăng lên và khả năng đọc giảm đi.<a id="idm45798379092504"></a>
>
> —Larry Constantine

Một khi hệ thống đã được tách ra, kiến trúc sư thường thấy cần phải khâu nó lại để nó hoạt động như một đơn vị cohesive. Như Larry Constantine đã ngụ ý rất hùng hồn trong câu trích dẫn trên, việc này không dễ như nghe, với rất nhiều trade-offs liên quan khi tách mọi thứ ra.

Trong phần thứ hai của cuốn sách này, chúng tôi thảo luận nhiều kỹ thuật khác nhau để vượt qua một số thách thức khó gắn với các architecture phân tán, bao gồm quản lý giao tiếp giữa các service, contract, workflow phân tán, transaction phân tán, quyền sở hữu dữ liệu, truy cập dữ liệu và dữ liệu phân tích.

[Phần I](part1_pulling_things_apart.vi.md#part1-pulling-things-apart) là về *cấu trúc*; Phần II là về *giao tiếp*. Một khi kiến trúc sư hiểu cấu trúc và các quyết định dẫn đến nó, đã đến lúc suy nghĩ về cách các phần cấu trúc tương tác với nhau.
