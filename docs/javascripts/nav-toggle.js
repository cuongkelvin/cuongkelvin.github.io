// Nút ẩn/hiện thanh điều hướng bên trái, nhớ lựa chọn trong localStorage (mặc định: hiện).
// Chạy lại sau mỗi lần chuyển trang (navigation.instant) qua document$; không tạo trùng nút.
(function () {
  var KEY = "navHidden";
  var hidden = localStorage.getItem(KEY) === "1";

  function apply() {
    document.body.setAttribute("data-nav", hidden ? "hidden" : "shown");
    var b = document.querySelector(".nav-toggle");
    if (b) b.title = hidden ? "Hiện mục lục trái" : "Ẩn mục lục trái";
  }

  function setup() {
    var inner = document.querySelector(".md-header__inner");
    if (inner && !inner.querySelector(".nav-toggle")) {
      var btn = document.createElement("button");
      btn.className = "md-header__button md-icon nav-toggle";
      btn.type = "button";
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
        '<path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2Z"/></svg>';
      btn.addEventListener("click", function () {
        hidden = !hidden;
        localStorage.setItem(KEY, hidden ? "1" : "0");
        apply();
      });
      var search = inner.querySelector(".md-search");
      if (search) inner.insertBefore(btn, search); else inner.appendChild(btn);
    }
    apply();
  }

  if (typeof document$ !== "undefined") document$.subscribe(setup); else setup();
})();
