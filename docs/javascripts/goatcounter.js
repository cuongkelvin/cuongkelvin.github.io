// Đếm lượt xem bằng GoatCounter. navigation.instant không tải lại trang,
// nên tắt đếm tự động và đếm mỗi lần Material đổi trang (document$).
window.goatcounter = { no_onload: true }

var s = document.createElement("script")
s.async = true
s.src = "https://gc.zgo.at/count.js"
s.dataset.goatcounter = "https://cuongkelvin.goatcounter.com/count"
s.onload = function () {
  document$.subscribe(function () {
    window.goatcounter.count({ path: location.pathname })
  })
}
document.head.appendChild(s)
