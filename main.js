/* ==========================================================
   锈湖 Rusty Lake 主题网站 —— 公共脚本
   ========================================================== */
document.addEventListener("DOMContentLoaded", function () {

  /* ---------- 1. 页面淡入 + 开场动画 ---------- */
  var loader = document.getElementById("loader");
  var firstVisit = true;
  try { firstVisit = !sessionStorage.getItem("rl-seen"); sessionStorage.setItem("rl-seen", "1"); } catch (e) {}

  if (loader && firstVisit) {
    requestAnimationFrame(function () { document.body.classList.add("loaded"); });
    setTimeout(function () { loader.classList.add("hide"); }, 1800);
  } else {
    if (loader) loader.remove();
    requestAnimationFrame(function () { document.body.classList.add("loaded"); });
  }

  /* ---------- 2. 页面切换时淡出（丝滑跳转） ---------- */
  document.querySelectorAll("a[href]").forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || a.target === "_blank" || /^(https?:|mailto:)/.test(href)) return;
    a.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      document.body.classList.add("leaving");
      setTimeout(function () { window.location.href = href; }, 350);
    });
  });
  // 浏览器“后退”回来时恢复显示
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) { document.body.classList.remove("leaving"); document.body.classList.add("loaded"); }
  });

  /* ---------- 3. 导航栏：滚动收缩、当前页高亮、手机菜单 ---------- */
  var nav = document.querySelector(".nav");
  var toTop = document.querySelector(".to-top");
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 40);
    if (toTop) toTop.classList.toggle("show", y > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav ul a").forEach(function (a) {
    if (a.getAttribute("href") === current) a.classList.add("active");
  });

  var burger = document.querySelector(".burger");
  if (burger) burger.addEventListener("click", function () { nav.classList.toggle("open"); });

  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- 4. 滚动浮现（同一行的元素依次出现） ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          el.style.transitionDelay = (batch * 0.12) + "s";
          el.classList.add("show");
          batch++;
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("show"); });
  }

  /* ---------- 5. 数字滚动计数 ---------- */
  var nums = document.querySelectorAll("[data-count]");
  if (nums.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = +el.getAttribute("data-count"), start = performance.now(), dur = 1600;
        var from = end > 1000 ? end - 40 : 0;
        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.firstChild.nodeValue = Math.round(from + (end - from) * eased);
          if (p < 1) requestAnimationFrame(tick);
        })(start);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- 6. 图片占位：images 里有同名图片就自动显示 ---------- */
  document.querySelectorAll(".ph[data-img]").forEach(function (ph) {
    var src = ph.getAttribute("data-img");
    var inner = ph.querySelector(".ph-inner");
    var img = new Image();
    img.onload = function () {
      if (inner) inner.style.backgroundImage = "url('" + src + "')";
      ph.classList.add("has-img");
    };
    img.src = src;
  });

  /* ---------- 7. 作品年表：按系列筛选 ---------- */
  var filterBtns = document.querySelectorAll(".filter button");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("on"); });
      btn.classList.add("on");
      var type = btn.getAttribute("data-type");
      document.querySelectorAll("table.works tbody tr").forEach(function (tr, i) {
        var match = type === "all" || tr.getAttribute("data-type") === type;
        tr.classList.toggle("hidden", !match);
        if (match) {
          tr.style.opacity = 0; tr.style.transform = "translateY(10px)";
          setTimeout(function () { tr.style.opacity = 1; tr.style.transform = "none"; }, 30 + i * 25);
        }
      });
    });
  });

  /* ---------- 8. 翻转卡片：手机上点击翻转 ---------- */
  document.querySelectorAll(".flip").forEach(function (card) {
    card.addEventListener("click", function () { card.classList.toggle("turned"); });
  });

  /* ---------- 9. 人物弹窗 ---------- */
  var modal = document.getElementById("modal");
  if (modal) {
    var mImg = modal.querySelector(".ph"), mMeta = modal.querySelector(".meta"),
        mName = modal.querySelector("h3"), mText = modal.querySelector(".m-text");
    document.querySelectorAll(".person").forEach(function (p) {
      p.addEventListener("click", function () {
        var ph = p.querySelector(".ph");
        mImg.className = ph.className;
        mImg.innerHTML = ph.innerHTML;
        mMeta.textContent = p.getAttribute("data-meta");
        mName.textContent = p.querySelector("h3").textContent;
        mText.innerHTML = p.querySelector(".more").innerHTML;
        modal.classList.add("open");
      });
    });
    function closeModal() { modal.classList.remove("open"); }
    modal.querySelector(".modal-close").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  }

  /* ---------- 10. 手风琴 ---------- */
  document.querySelectorAll(".acc-head").forEach(function (h) {
    h.addEventListener("click", function () {
      var item = h.parentElement, wasOpen = item.classList.contains("open");
      document.querySelectorAll(".acc-item").forEach(function (i) { i.classList.remove("open"); });
      if (!wasOpen) item.classList.add("open");
    });
  });

  /* ---------- 11. 图集灯箱（支持键盘左右键） ---------- */
  var lb = document.getElementById("lightbox");
  if (lb) {
    var items = Array.prototype.slice.call(document.querySelectorAll(".gallery .g"));
    var stagePh = lb.querySelector(".ph"), stageCap = lb.querySelector(".cap"), idx = 0;
    function show(i) {
      idx = (i + items.length) % items.length;
      var src = items[idx].querySelector(".ph");
      stagePh.className = src.className;
      stagePh.innerHTML = src.innerHTML;
      stageCap.textContent = items[idx].querySelector("figcaption").textContent;
    }
    items.forEach(function (g, i) { g.addEventListener("click", function () { show(i); lb.classList.add("open"); }); });
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    lb.querySelector(".lb-close").addEventListener("click", function () { lb.classList.remove("open"); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("open"); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "Escape") lb.classList.remove("open");
    });
  }

  /* ---------- 12. 影音页：切换 iframe 内容 ---------- */
  document.querySelectorAll("[data-frame]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var frame = document.getElementById(btn.getAttribute("data-target"));
      frame.style.opacity = 0;
      setTimeout(function () { frame.src = btn.getAttribute("data-frame"); }, 250);
      frame.onload = function () { frame.style.transition = "opacity .5s"; frame.style.opacity = 1; };
      btn.parentElement.querySelectorAll("button").forEach(function (b) { b.classList.remove("on"); });
      btn.classList.add("on");
    });
  });

  /* ---------- 13. 小测验 ---------- */
  var quiz = document.getElementById("quiz");
  if (quiz) {
    var Q = [
      { q: "锈湖工作室位于哪座城市？", o: ["鹿特丹", "阿姆斯特丹", "柏林", "伦敦"], a: 1,
        e: "锈湖是一家位于荷兰阿姆斯特丹的独立游戏工作室。" },
      { q: "锈湖的第一款作品是在哪一年发布的？", o: ["2013", "2014", "2015", "2017"], a: 2,
        e: "2015 年春天，《逃离方块：湖》等作品陆续上线。" },
      { q: "《逃离方块：阿尔勒》致敬的是哪位画家？", o: ["莫奈", "达利", "梵高", "马格利特"], a: 2,
        e: "阿尔勒是梵高晚年创作的地方，这一作充满了他的画作元素。" },
      { q: "《锈湖：天堂岛》中，小岛被什么诅咒笼罩？", o: ["七宗罪", "埃及十灾", "四季轮回", "黑色方块"], a: 1,
        e: "天堂岛的谜题围绕《圣经》中的埃及十灾展开。" },
      { q: "《逃离方块：悖论》与以往作品最大的不同是？", o: ["是多人联机游戏", "同时推出了一部真人短片", "只有文字没有画面", "是一款赛车游戏"], a: 1,
        e: "《悖论》与一部真人短片同步推出，游戏与影片互相补充。" }
    ];
    var qi = 0, score = 0;
    var box = quiz.querySelector(".q-fade"), bar = quiz.querySelector(".progress i");
    function render() {
      bar.style.width = (qi / Q.length * 100) + "%";
      if (qi >= Q.length) {
        var verdict = score === Q.length ? "你已经是湖边的常客了。" : score >= 3 ? "你对锈湖了解不少，再往湖底看看吧。" : "湖水还很深，去作品页多逛逛吧。";
        box.innerHTML = '<div class="q-num">RESULT</div><h3>你答对了 ' + score + " / " + Q.length + " 题</h3>" +
          '<p class="explain">' + verdict + '</p><div class="btn-row" style="justify-content:flex-start"><button class="btn" id="again">再来一次</button></div>';
        document.getElementById("again").addEventListener("click", function () { qi = 0; score = 0; swap(); });
        return;
      }
      var cur = Q[qi];
      box.innerHTML = '<div class="q-num">QUESTION ' + (qi + 1) + " / " + Q.length + "</div><h3>" + cur.q + '</h3><div class="opts"></div><p class="explain"></p>';
      var opts = box.querySelector(".opts"), ex = box.querySelector(".explain");
      cur.o.forEach(function (text, i) {
        var b = document.createElement("button");
        b.textContent = text;
        b.addEventListener("click", function () {
          opts.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
          opts.children[cur.a].classList.add("right");
          if (i === cur.a) score++; else b.classList.add("wrong");
          ex.textContent = cur.e;
          setTimeout(function () { qi++; swap(); }, 1700);
        });
        opts.appendChild(b);
      });
    }
    function swap() { box.classList.add("out"); setTimeout(function () { render(); box.classList.remove("out"); }, 350); }
    render();
  }

  /* ---------- 15. 热门推荐：湖面漂浮的光尘（canvas 粒子） ---------- */
  document.querySelectorAll("canvas.dust").forEach(function (cv) {
    var ctx = cv.getContext("2d"), parts = [], W = 0, H = 0, running = false;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      W = cv.offsetWidth; H = cv.offsetHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(W * H / 9000);
      parts = [];
      for (var i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.6 + .3,
          vx: (Math.random() - .5) * .15, vy: -(Math.random() * .25 + .05),
          tw: Math.random() * Math.PI * 2, ts: Math.random() * .03 + .01,
          warm: Math.random() < .25          // 少数光点带一点铁锈色
        });
      }
    }
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.tw += p.ts;
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5;
        var a = .25 + .55 * (Math.sin(p.tw) * .5 + .5);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.warm ? "rgba(214,140,100," + a + ")" : "rgba(235,226,205," + a + ")";
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = p.r * 4;
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    size();
    window.addEventListener("resize", size);
    // 只在这一块出现在屏幕上时才运行，节省性能
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        var vis = en[0].isIntersecting;
        if (vis && !running) { running = true; frame(); } else if (!vis) running = false;
      }).observe(cv);
    } else { running = true; frame(); }
  });

  /* ---------- 14. 留言板（保存在本机浏览器） ---------- */
  var gform = document.getElementById("guest-form");
  if (gform) {
    var list = document.getElementById("msgs");
    var saved = [];
    try { saved = JSON.parse(localStorage.getItem("rl-msgs") || "[]"); } catch (e) {}
    if (!saved.length) {
      saved = [{ n: "湖边的旅人", f: "锈湖旅馆", t: "第一次玩就被那种又诡异又温柔的气氛吸引了。", d: "2026-10-01" }];
    }
    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    function draw() {
      list.innerHTML = saved.map(function (m) {
        return '<div class="msg"><div class="who">' + esc(m.n) + "<em>最爱：" + esc(m.f) + '</em></div><div class="when">' + esc(m.d) + "</div><p>" + esc(m.t) + "</p></div>";
      }).join("");
    }
    draw();
    gform.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = gform.name.value.trim(), t = gform.text.value.trim();
      if (!n || !t) return;
      saved.unshift({ n: n, f: gform.fav.value, t: t, d: new Date().toISOString().slice(0, 10) });
      try { localStorage.setItem("rl-msgs", JSON.stringify(saved)); } catch (e2) {}
      draw();
      gform.reset();
    });
  }
});
