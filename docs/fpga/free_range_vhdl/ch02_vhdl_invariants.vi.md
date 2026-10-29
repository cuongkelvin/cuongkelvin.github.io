# 2 Những điểm bất biến của VHDL

Có một số đặc điểm của VHDL mà bạn nên biết trước khi đi tiếp. Dù hiếm khi việc học thuộc lòng bất cứ thứ gì là một ý hay, bạn nên ghi nhớ những khái niệm cơ bản trình bày trong mục này. Điều này sẽ giúp loại bỏ phần nào sự nhọc nhằn khi học một ngôn ngữ lập trình mới và đặt nền móng giúp bạn tạo ra source code VHDL tốt và dễ nhìn.

## 2.1 Phân biệt chữ hoa/chữ thường

VHDL không phân biệt chữ hoa/chữ thường. Điều này có nghĩa là hai statement trong Listing 2.1 có ý nghĩa hoàn toàn giống nhau (tuy nhiên đừng bận tâm statement đó thực sự có nghĩa là gì). Hãy nhớ rằng Listing 2.1 là một ví dụ về việc VHDL không phân biệt chữ hoa/chữ thường, chứ không phải ví dụ về cách viết code VHDL tốt.

Listing 2.1: Một ví dụ về việc VHDL không phân biệt chữ hoa/chữ thường.

```vhdl
Dout <= A and B;                               doUt <= a AnD b;
```

## 2.2 Khoảng trắng

VHDL không nhạy với khoảng trắng (dấu cách và tab) trong tài liệu nguồn. Hai statement trong Listing 2.2 có ý nghĩa hoàn toàn giống nhau. Một lần nữa, Listing 2.2 không phải ví dụ về phong cách viết code VHDL tốt. Lưu ý rằng Listing 2.2 một lần nữa cho thấy VHDL không phân biệt chữ hoa/chữ thường.

Listing 2.2: Một ví dụ cho thấy VHDL không quan tâm đến khoảng trắng.

```vhdl
nQ <= In_a or In_b;                    nQ   <=in_a OR       in_b;
```

## 2.3 Comment

Comment trong VHDL bắt đầu bằng ký hiệu “--” (hai dấu gạch liên tiếp). VHDL synthesizer bỏ qua mọi thứ đứng sau hai dấu gạch cho đến hết dòng chứa hai dấu gạch đó. Listing 2.3 cho thấy hai kiểu viết comment. Đáng tiếc là VHDL không có comment block-style (comment trải trên nhiều dòng nhưng không cần dấu comment ở mỗi dòng).

Listing 2.3: Hai cách dùng comment điển hình.

```vhdl
-- This next section of code is used to blah-blah
-- This type of comment is the best fake for block-style commenting.
PS_reg <= NS_reg; -- Assign next_state value to present_state
```

Dùng comment thích hợp giúp tăng cả khả năng đọc lẫn khả năng hiểu code VHDL. Quy tắc chung là comment cho bất kỳ dòng hay đoạn code nào có thể không rõ ràng với một người đọc code của bạn ngoài chính bạn. Cách dùng comment duy nhất không thích hợp là nêu ra một điều hiển nhiên rành rành. Thật khó hình dung code nào lại có quá ít comment, nên đừng ngại: hãy dùng thật nhiều comment. Nghiên cứu đã chỉ ra rằng dùng nhiều comment thích hợp thực ra là dấu hiệu của trí thông minh cao.

## 2.4 Dấu ngoặc đơn

VHDL tương đối dễ dãi trong yêu cầu dùng dấu ngoặc đơn. Giống các ngôn ngữ máy tính khác, có một vài quy tắc ưu tiên gắn với các operator khác nhau trong ngôn ngữ VHDL. Dù có thể học hết những quy tắc này và viết source code VHDL khéo léo đến mức người đọc code của bạn phải gãi đầu, một ý tốt hơn là tập thói quen dùng dấu ngoặc đơn thoải mái để bảo đảm người đọc source code của bạn hiểu được mục đích của code. Một lần nữa, hai statement trong Listing 2.4 có cùng ý nghĩa. Lưu ý rằng khoảng trắng đã được thêm vào cùng với dấu ngoặc đơn để statement phía dưới rõ ràng hơn.

Listing 2.4: Ví dụ về dấu ngoặc đơn có thể giúp rõ ràng hơn.

```vhdl
if x = '0' and y = '0' or z = '1' then
    blah; -- some useful statement
    blah; -- some useful statement
end if;
if ( ((x = '0') and (y = '0')) or (z = '1') ) then
    blah; -- some useful statement
    blah; -- some useful statement
end if;
```

## 2.5 Statement của VHDL

Giống các ngôn ngữ máy tính thuật toán khác, mọi statement VHDL đều kết thúc bằng dấu chấm phẩy. Điều này giúp ích khi cố loại bỏ lỗi compile khỏi code của bạn, vì dấu chấm phẩy thường bị bỏ sót khi mới viết code. Khi đó, thách thức chính là biết thế nào là một statement VHDL để biết khi nào cần thêm dấu chấm phẩy. VHDL synthesizer không dễ tính như các ngôn ngữ khác khi có những dấu chấm phẩy thừa trong source code.

## 2.6 Các statement if, case và loop

Như bạn sẽ sớm thấy, ngôn ngữ VHDL có các statement if, case và loop. Một nguồn gây bực bội thường gặp khi học VHDL là những lỗi kinh điển liên quan đến các statement này. Hãy luôn nhớ các quy tắc nêu dưới đây khi viết hoặc debug code VHDL và bạn sẽ tiết kiệm được rất nhiều thời gian. Hãy đánh dấu mục này như một mục bạn có thể muốn đọc lại khi đã được giới thiệu chính thức về những statement cụ thể này.

• Mọi statement if đều có một thành phần then tương ứng

• Mỗi statement if được kết thúc bằng một end if;

• Nếu bạn cần dùng một construct else if, phiên bản VHDL là elsif

• Mỗi statement case được kết thúc bằng một end case;

• Mỗi statement loop có một statement end loop; tương ứng

Nói chung, bạn không nên quá bận tâm về việc ghi nhớ cú pháp code, vì nhiều khả năng bạn sẽ dùng một editor đủ tinh vi để có code snippet (cụ thể là Gedit[^1]). Một lập trình viên giỏi phân biệt mình bằng những cách khác chứ không phải bằng việc nhớ cú pháp code một cách hoàn hảo.

## 2.7 Identifier

Identifier là tên được đặt cho các thành phần khác nhau trong VHDL. Ví dụ về identifier trong các ngôn ngữ higher-level gồm tên biến và tên function. Ví dụ về identifier trong VHDL gồm tên variable, tên signal và tên port (tất cả sẽ sớm được thảo luận). Dưới đây là các quy tắc cứng và mềm (tức là bạn phải tuân theo hoặc bạn nên tuân theo) về identifier trong VHDL.

• Identifier nên self-describing. Nói cách khác, chữ bạn dùng cho identifier nên cung cấp thông tin về cách dùng và mục đích của thành phần mà identifier đó đại diện.

• Identifier có thể dài tùy ý (chứa nhiều ký tự). Tên ngắn hơn giúp code dễ đọc hơn, nhưng tên dài hơn mang nhiều thông tin hơn. Việc chọn độ dài identifier hợp lý là tùy người lập trình.

• Identifier chỉ có thể chứa tổ hợp các chữ cái (A-Z và a-z), chữ số (0-9) và ký tự gạch dưới (“_”).

• Identifier phải bắt đầu bằng một chữ cái.

• Identifier không được kết thúc bằng dấu gạch dưới và không bao giờ được có hai dấu gạch dưới liên tiếp.

• Identifier tốt nhất cho một function tính vị trí của Trái Đất là CalcEarthPosition hoặc calc_earth_position. Hãy cố gắng nhất quán.

• Identifier tốt nhất cho một variable lưu tuổi chiếc xe của bạn là AgeMyCar hoặc age_my_car. Một lần nữa, hãy cố gắng nhất quán.

Hãy nhớ, những lựa chọn thông minh cho identifier giúp code VHDL của bạn dễ đọc hơn, dễ hiểu hơn và gây ấn tượng hơn với đồng nghiệp, cấp trên, gia đình và bạn bè. Một vài ví dụ về cả lựa chọn tốt lẫn lựa chọn tồi cho tên identifier có trong Listing 2.5 và Listing 2.6.

Listing 2.5: Các identifier hợp lệ.

```vhdl
data_bus    --descriptive name
WE          --classic write enable
div_flag    --real winner
port_A      --provides some info
in_bus      --input bus
clk         --classic clock
clk_in
clk_out
mem_read_data
--
--
--
```

Listing 2.6: Các identifier không hợp lệ.

```vhdl
3Bus_val -- begins with a number
DDD      -- not self commenting
mid_$num -- illegal character
last__val-- consec. underscores
str_val_ -- ends with underscore
in       -- uses VHDL reserved word
@#$%%    -- total garbage
it_sucks -- try to avoid
Big_vAlUe-- valid but ugly
pa       -- possibly lacks meaning
sim-val  -- illegal character(dash)
DDE_SUX  -- no comment
```

## 2.8 Reserved word

Có một danh sách các từ đã được ngôn ngữ VHDL gán ý nghĩa đặc biệt. Những từ đặc biệt này, thường gọi là reserved word, không thể được dùng làm identifier khi viết code VHDL. Một danh sách một phần các reserved word mà bạn có thể có xu hướng muốn dùng có trong Listing 2.7. Danh sách đầy đủ các reserved word có trong Phụ lục. Đáng chú ý là Listing 2.7 không có các tên operator chuẩn như AND, OR, XOR, v.v.

Listing 2.7: Một danh sách ngắn các reserved word của VHDL.

```vhdl
access   after      alias       all        attribute    block
body     buffer     bus         constant   exit         file
for      function   generic     group      in           is
label    loop       mod         new        next         null
of       on         open        out        range        rem
return   signal     shared      then       to           type
until    use        variable    wait       while        with
```

## 2.9 Coding style VHDL

Coding style là hình thức trình bày của source code VHDL. Rõ ràng, sự tự do có được nhờ việc không phân biệt chữ hoa/chữ thường, không quan tâm đến khoảng trắng và các quy tắc dễ dãi về dấu ngoặc đơn tạo ra một tình trạng vô chính phủ trong việc viết code. Vì vậy, coding style chú trọng vào khả năng đọc. Đáng tiếc là mức độ dễ đọc của bất kỳ tài liệu nào, nhất là văn bản code, đều mang tính chủ quan. Viết code VHDL cũng giống như viết code trong các ngôn ngữ máy tính khác như C và Java, nơi bạn có thể làm cho tài liệu dễ đọc hơn mà không thay đổi chức năng của code. Việc này chủ yếu được thực hiện bằng cách thụt lề một số phần của chương trình, dùng identifier self-describing và viết comment thích hợp khi nào và ở đâu cần thiết.

Thay vì nêu ở đây một loạt quy tắc để bạn tuân theo về việc code của bạn phải trông như thế nào, bạn nên cố gắng đơn giản là làm cho source code của mình dễ đọc. Dưới đây là một vài suy nghĩ về điều gì làm nên source code dễ đọc.

• Nhiều khả năng là nếu source code VHDL của bạn dễ đọc với chính bạn, nó cũng sẽ dễ đọc với những người khác có thể cần xem kỹ tài liệu của bạn. Những người khác này có thể là người đang giúp bạn làm cho code chạy đúng, người đang chấm điểm code của bạn, hoặc người ký phiếu lương cho bạn vào cuối ngày. Đây là những người bạn muốn làm hài lòng. Những người này có lẽ rất bận và hoàn toàn sẵn lòng chỉ liếc qua code của bạn một cách hời hợt. Code trông đẹp sẽ khiến sự chủ quan đó nghiêng về phía có lợi cho bạn.

• Nếu còn phân vân, hãy làm source code VHDL của bạn theo mẫu một tài liệu VHDL nào đó mà bạn thấy có tổ chức và dễ đọc. Bất kỳ code nào bạn xem được viết ra ở đâu đó nhiều khả năng đều do một người có nhiều kinh nghiệm VHDL hơn một người mới bắt đầu như bạn viết. Hãy bắt chước những phần tốt trong phong cách của họ trên con đường tạo ra một phong cách còn dễ đọc hơn nữa.

• Áp dụng một coding style tốt giúp bạn viết code không mắc lỗi. Như với các compiler khác mà bạn đã có kinh nghiệm, bạn sẽ thấy VHDL compiler làm rất tốt việc biết một tài liệu có lỗi nhưng chỉ làm ở mức tạm được việc cho bạn biết lỗi ở đâu hoặc lỗi là gì. Dùng một coding style nhất quán giúp bạn tìm ra lỗi cả trước khi compile lẫn sau khi compiler đã tìm thấy lỗi.

• Một tài liệu được định dạng đúng cách thể hiện rõ ràng những thông tin về thiết kế của bạn mà nếu không thì sẽ không dễ thấy ngay. Điều này đặc biệt đúng khi dùng thụt lề đúng cách và đủ comment.

---

[^1]: Gedit, text editor chính thức của Linux GNOME: http://projects.gnome.org/gedit
