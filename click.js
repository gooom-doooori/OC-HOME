/* =====================================================================
   🔊 click.js  ─  클릭 효과음
   =====================================================================
   - 버튼 · 링크 · 이미지 같은 "누를 수 있는 것"을 마우스로 클릭할 때만 소리가 나요.
   - 키보드(Enter · Space)나 코드로 자동 실행된 클릭에서는 소리가 나지 않아요.
   - 편집기(#admin) · 설치 화면(#setup) 에서는 소리가 나지 않아요.
   - index.html 에서 bgm.js 바로 아래에 불러와요.
       <script src="bgm.js"></script>
       <script src="click.js"></script>
   ===================================================================== */
(function () {
  /* ★ 여기만 바꾸면 돼요 */
  var CFG = {
    src: "click.mp3",
    volume: 10,
    // 소리를 낼 대상 (CSS 선택자). 이미지를 빼고 싶으면 맨 뒤의 ", img" 를 지우세요.
    targets: "a, button, summary, label, input, select, textarea, [role='button'], [role='switch'], " +
             ".ch-tile-row, .cd-flip, .fb-flip, .rv, .rt-shot, .dt-shot, .rt-log, .dt-rel-item.linked, .menu-link, img",
    // 소리를 내지 않을 대상 (BGM 플레이어 조작 등)
    except: ".bgm, [data-bgm-btn]"
  };

  var PREVIEW = window.parent !== window && /[?&]preview=1/.test(location.search);
  if (!CFG.src || PREVIEW) return;

  var vol = Math.max(0, Math.min(100, +CFG.volume || 0)) / 100;
  var POOL = 4, pool = [], next = 0, broken = false;

  // 연속으로 눌러도 소리가 끊기지 않게 여러 개를 돌려가며 써요
  for (var i = 0; i < POOL; i++) {
    var a = new Audio();
    a.preload = "auto";
    a.volume = vol;
    a.addEventListener("error", function () { broken = true; });   // 파일이 없으면 조용히 포기
    a.src = CFG.src;
    pool.push(a);
  }

  function off() { return /^#\/?(admin|setup)/.test(location.hash); }

  document.addEventListener("click", function (e) {
    if (broken || off()) return;
    if (!e.detail) return;                                 // 키보드 · 코드로 실행된 클릭은 제외
    if (e.button !== 0) return;                            // 왼쪽 버튼만
    var t = e.target && e.target.closest ? e.target : (e.target && e.target.parentElement);
    if (!t) return;
    if (CFG.except && t.closest(CFG.except)) return;
    if (!t.closest(CFG.targets)) return;

    var s = pool[next];
    next = (next + 1) % POOL;
    try {
      s.currentTime = 0;
      var p = s.play();
      if (p && p.catch) p.catch(function () {});
    } catch (err) {}
  }, true);
})();
