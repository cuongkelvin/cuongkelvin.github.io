// Đếm lượt xem bằng GoatCounter. navigation.instant không tải lại trang,
// nên tắt đếm tự động và đếm mỗi lần Material đổi trang (document$).
// Sau đó hiện lượt xem của bài (dưới tiêu đề) và tổng lượt xem (chân trang).
// Hiện số cần bật "Allow adding visitor counts on your website" trong Settings.
var GC = "https://cuongkelvin.goatcounter.com"

window.goatcounter = { no_onload: true }

// GoatCounter lưu đường dẫn không có "/" cuối (trừ trang chủ).
function gcPath() {
  var p = location.pathname
  return p.length > 1 ? p.replace(/\/$/, "") : p
}

function gcShow(id, path, label, place) {
  var old = document.getElementById(id)
  if (old) old.remove()
  fetch(GC + "/counter/" + encodeURIComponent(path) + ".json")
    .then(function (r) { return r.ok ? r.json() : null })
    .then(function (d) {
      if (!d || document.getElementById(id)) return
      var el = document.createElement("div")
      el.id = id
      el.className = "gc-count"
      el.textContent = label + d.count
      place(el)
    })
    .catch(function () {})
}

function gcRender() {
  var h1 = document.querySelector(".md-content__inner h1")
  if (h1) gcShow("gc-page", gcPath(), "👁 Lượt xem bài: ", function (el) { h1.after(el) })
  var foot = document.querySelector(".md-footer-meta__inner")
  if (foot) gcShow("gc-total", "TOTAL", "Tổng lượt xem: ", function (el) { foot.append(el) })
}

var s = document.createElement("script")
s.async = true
s.src = "https://gc.zgo.at/count.js"
s.dataset.goatcounter = GC + "/count"
s.onload = function () {
  document$.subscribe(function () {
    window.goatcounter.count({ path: location.pathname })
    gcRender()
  })
}
document.head.appendChild(s)
