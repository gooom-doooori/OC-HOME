/* =====================================================================
   🎵 bgm.js  ─  BGM 플레이어
   =====================================================================
   - index.html 에서 메인 <script> 바로 위에 불러와요.
       <script src="bgm.js"></script>
   - 플레이어는 #app 바깥에 있어서, 페이지를 옮겨도 음악이 끊기지 않아요.
   - 곡 주소(bgm)는 두 가지를 쓸 수 있어요.
       1) 업로드한 음악 파일 주소 / 사이트 폴더 안 파일  예) "audio/theme.mp3"
       2) 유튜브 링크  예) "https://youtu.be/xxxxxxxxxxx"
   - 어떤 곡을 틀지는 이 순서로 정해져요.
       캐릭터 프로필 · 페어 관계 화면의 곡  >  플로어마스터 / Other 페이지 곡  >  기본 BGM
     (칸이 비어 있으면 다음 순서 곡이 그대로 나와요)
   ===================================================================== */
(function () {
  const S = (typeof SITE !== "undefined") ? SITE : {};
  const CFG = S.bgmPlayer || {};
  const NOOP = { page: function () {}, item: function () {}, reset: function () {}, bind: function () { return false; } };
  window.BGM = NOOP;

  const PREVIEW = window.parent !== window && /[?&]preview=1/.test(location.search);
  const clean = function (s) { return String(s == null ? "" : s).trim(); };

  // 사이트 어디에도 곡이 없으면 플레이어를 안 만들어요
  function anySong() {
    if (clean(CFG.bgm)) return true;
    if (clean((S.floormasterPage || {}).bgm) || clean((S.otherPage || {}).bgm)) return true;
    return [].concat(S.characters || [], S.pairs || []).some(function (x) { return x && clean(x.bgm); });
  }
  if (CFG.show === false || !anySong()) return;

  /* =====================================================
     작은 도구들
     ===================================================== */
  function ytId(u) {
    u = clean(u);
    if (!/(youtube\.com|youtu\.be|youtube-nocookie\.com)/i.test(u)) return "";
    const m = u.match(/youtu\.be\/([\w-]{11})/i) ||
              u.match(/[?&]v=([\w-]{11})/i) ||
              u.match(/\/(?:embed|shorts|live|v)\/([\w-]{11})/i);
    return m ? m[1] : "";
  }
  function fmt(t) {
    t = Math.max(0, Math.floor(+t || 0));
    const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60;
    const p = function (n) { return (n < 10 ? "0" : "") + n; };
    return (h ? h + ":" + p(m) : p(m)) + ":" + p(s);
  }
  // 파일 주소 → 곡 제목 (업로드할 때 붙는 숫자와 확장자를 떼요)
  function nameOf(src) {
    let n = src.split("#")[0].split("?")[0];
    n = n.substring(n.lastIndexOf("/") + 1);
    try { n = decodeURIComponent(n); } catch (e) {}
    n = n.substring(n.lastIndexOf("/") + 1);
    n = n.replace(/\.[a-z0-9]{2,5}$/i, "").replace(/^\d{10,}-/, "").replace(/_/g, " ");
    return n || "BGM";
  }

  /* =====================================================
     상태
     ===================================================== */
  const DEF = { src: clean(CFG.bgm), title: clean(CFG.bgmTitle) };
  let vol = Math.max(0, Math.min(100, CFG.volume != null && CFG.volume !== "" ? +CFG.volume : 40)) / 100;
  const layers = { page: null, item: null };   // page: 플로어마스터 / Other 페이지 곡, item: 프로필 · 페어 곡
  const saved = {};                            // 곡별로 멈춘 위치 (돌아오면 이어서 재생)
  let engine = null, track = null, curKey = "", note = "", curItem = false;   // curItem: 지금 곡이 프로필 · 페어 곡인지
  let want = false;                            // 사용자가 "재생 중이길" 원하는 상태

  /* 브라우저가 소리 재생을 막았을 때: 화면을 처음 누르는 순간 재생해요.
     (모바일은 pointerdown 이 아니라 손을 뗄 때 · click 부터 "눌렀다" 고 인정해서 여러 입력을 같이 들어요) */
  const GESTURES = ["pointerup", "click", "touchend", "keydown"];
  let waiting = false;
  let el = null;
  function wait() {
    if (waiting) return;
    waiting = true;
    const off = function () {
      waiting = false;
      GESTURES.forEach(function (n) { document.removeEventListener(n, go, true); });
    };
    const go = function (e) {
      if (engine && engine.playing()) { off(); return; }          // 이미 재생 중이면 끝
      if (!want || !engine || inAdmin) return;
      if (e && el && el.contains(e.target)) return;
      if (e && e.target && e.target.closest && e.target.closest("[data-bgm-btn]")) return;   // 페어 상세의 BGM 버튼도 마찬가지
      engine.play();
      setTimeout(refresh, 60);
      setTimeout(function () { if (engine && engine.playing()) off(); }, 500);   // 그래도 안 되면 다음 입력에 다시 시도
    };
    GESTURES.forEach(function (n) { document.addEventListener(n, go, true); });
  }
  function kick(p) {
    if (p && p.catch) p.catch(function (err) { if (err && err.name === "NotAllowedError") wait(); });
  }

  /* 자동 재생 우회 시도 : 소리 없는 음악 파일을 allow="autoplay" iframe 으로 먼저 불러와요.
     (예전 크롬에서 통하던 방법이라 지금은 막혀 있을 수 있어요. 안 통해도 아무 일도 일어나지 않고,
      그땐 기존처럼 화면을 처음 누를 때 재생돼요) */
  function unlockFrame() {
    const f = document.createElement("iframe");
    f.src = clean(CFG.silence) || "silence.mp3";
    f.setAttribute("allow", "autoplay");
    f.setAttribute("aria-hidden", "true");
    f.tabIndex = -1;
    f.style.display = "none";
    f.addEventListener("load", function () {                  // iframe 이 불러와진 뒤 한 번 더 재생 시도
      if (want && engine && !engine.playing()) { engine.play(); setTimeout(refresh, 60); }
    });
    document.body.appendChild(f);
  }

  /* =====================================================
     엔진 1 : 음악 파일
     ===================================================== */
  const FileEng = (function () {
    const a = new Audio();
    a.preload = "metadata";
    a.loop = true;
    let at = 0;
    a.addEventListener("loadedmetadata", function () {
      if (at > 0 && isFinite(a.duration)) { try { a.currentTime = Math.min(at, Math.max(0, a.duration - 1)); } catch (e) {} }
      at = 0;
    });
    a.addEventListener("error", function () { note = "파일을 불러오지 못했어요"; refresh(); });
    return {
      load: function (src, from, play) { at = from || 0; a.src = src; if (play) kick(a.play()); },
      play: function () { kick(a.play()); },
      pause: function () { a.pause(); },
      vol: function (v) { a.volume = v; },
      time: function () { return a.currentTime || 0; },
      dur: function () { return isFinite(a.duration) ? a.duration : 0; },
      seek: function (t) { try { a.currentTime = t; } catch (e) {} },
      playing: function () { return !a.paused; },
      title: function () { return ""; }
    };
  })();

  /* =====================================================
     엔진 2 : 유튜브 (보이지 않는 플레이어로 소리만 재생)
     ===================================================== */
  const YtEng = (function () {
    let player = null, ready = false, job = null, apiP = null;
    function api() {
      if (apiP) return apiP;
      apiP = new Promise(function (res) {
        if (window.YT && window.YT.Player) return res();
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function () { if (prev) prev(); res(); };
        const s = document.createElement("script");
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      });
      return apiP;
    }
    function start(j) {
      const v = { videoId: j.id, startSeconds: j.at || 0 };
      if (j.play) player.loadVideoById(v); else player.cueVideoById(v);
    }
    function boot() {
      api().then(function () {
        const host = document.createElement("div");
        host.className = "bgm-yt";
        const slot = document.createElement("div");
        host.appendChild(slot);
        document.body.appendChild(host);
        player = new window.YT.Player(slot, {
          width: 200, height: 200,
          playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0, fs: 0, iv_load_policy: 3 },
          events: {
            onReady: function (e) {
              // 간혹 onReady 가 먼저 불려서 아직 player 에 함수가 안 붙어 있을 때가 있어요 → 붙을 때까지 잠깐 기다려요
              if (e && e.target && typeof e.target.setVolume === "function") player = e.target;
              (function wait(n) {
                if (player && typeof player.setVolume === "function") {
                  ready = true;
                  try { player.setVolume(Math.round(vol * 100)); } catch (x) {}
                  if (job) { const j = job; job = null; start(j); }
                  return;
                }
                if (n > 0) setTimeout(function () { wait(n - 1); }, 250);
                else { note = "유튜브 플레이어를 불러오지 못했어요"; refresh(); }
              })(24);
            },
            onStateChange: function (e) {
              if (e.data === 0) { player.seekTo(0, true); player.playVideo(); }   // 끝나면 처음부터 반복
              refresh();
            },
            onError: function (e) {
              const c = e && e.data;
              const why = { 2: "주소(영상 ID)가 올바르지 않아요", 5: "브라우저에서 재생 중 오류가 났어요", 100: "영상이 삭제됐거나 비공개예요",
                            101: "영상 주인이 외부 사이트 재생을 막아뒀어요", 150: "영상 주인이 외부 사이트 재생을 막아뒀어요", 153: "재생에 필요한 사이트 정보(referrer)가 없어요" }[c];
              note = "이 영상은 재생할 수 없어요" + (c != null ? " (오류 " + c + (why ? " · " + why : "") + ")" : "");
              if (window.console) console.warn("[BGM] YouTube 오류 코드:", c);
              refresh();
            }
          }
        });
      });
    }
    return {
      load: function (id, from, play) {
        job = { id: id, at: from || 0, play: !!play };
        if (ready) { const j = job; job = null; start(j); }
        else if (!player) boot();
      },
      play: function () { if (ready) player.playVideo(); else if (job) job.play = true; },
      pause: function () { if (ready) player.pauseVideo(); else if (job) job.play = false; },
      vol: function (v) { if (ready) player.setVolume(Math.round(v * 100)); },
      time: function () { return ready && player.getCurrentTime ? (player.getCurrentTime() || 0) : 0; },
      dur: function () { return ready && player.getDuration ? (player.getDuration() || 0) : 0; },
      seek: function (t) { if (ready) player.seekTo(t, true); },
      playing: function () {
        if (!ready) return !!(job && job.play);
        const s = player.getPlayerState && player.getPlayerState();
        return s === 1 || s === 3;
      },
      title: function () {
        try { return ready && player.getVideoData ? clean(player.getVideoData().title) : ""; } catch (e) { return ""; }
      }
    };
  })();

  /* =====================================================
     어떤 곡을 틀지 정하기
     ===================================================== */
  function apply() {
    const t = layers.item || layers.page || DEF;
    const isItem = t === layers.item && !!layers.item;
    const src = clean(t.src);
    if (src === curKey) { if (t.title !== (track && track.title)) { track = t; refresh(); } return; }

    if (engine && curKey && !curItem) saved[curKey] = engine.time();
    const old = engine;
    curKey = src;
    curItem = isItem;
    track = t;
    note = "";

    if (!src) {
      if (old) old.pause();
      engine = null;
      refresh();
      return;
    }
    const id = ytId(src);
    engine = id ? YtEng : FileEng;
    if (old && old !== engine) old.pause();
    engine.vol(vol);
    engine.load(id || src, isItem ? 0 : (saved[src] || 0), want);
    refresh();
  }

  /* =====================================================
     화면 (플레이어 모양)
     ===================================================== */
  const ICON_PLAY  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  const ICON_VOL   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  const ICON_NOTE  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>';
  const ICON_MUTE  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';

  el = document.createElement("div");
  el.className = "bgm is-empty";
  el.innerHTML =
    '<button type="button" class="bgm-note" aria-label="BGM 열기"></button>' +
    '<div class="bgm-main">' +
      '<span class="bgm-eq"><i></i><i></i><i></i></span>' +
      '<span class="bgm-ttl"><b>BGM</b></span>' +
      '<span class="bgm-time"><em>--:--</em> / <span>--:--</span></span>' +
      '<button type="button" class="bgm-play" aria-label="재생 / 멈춤"></button>' +
      '<button type="button" class="bgm-vbtn" aria-label="음량"></button>' +
      '<div class="bgm-bar"><i></i></div>' +
    '</div>' +
    '<div class="bgm-pop">' +
      '<span class="bgm-pct"></span>' +
      '<div class="bgm-vs" role="slider" tabindex="0" aria-orientation="vertical" aria-label="음량 조절" aria-valuemin="0" aria-valuemax="100"><i></i></div>' +
    '</div>';
  document.body.appendChild(el);

  const q = function (s) { return el.querySelector(s); };
  const noteBtn = q(".bgm-note");
  noteBtn.innerHTML = ICON_NOTE;
  const ttl = q(".bgm-ttl"), ttlB = q(".bgm-ttl b");
  const tCur = q(".bgm-time em"), tTot = q(".bgm-time span");
  const playBtn = q(".bgm-play"), volBtn = q(".bgm-vbtn");
  const bar = q(".bgm-bar"), fill = q(".bgm-bar i");
  const vs = q(".bgm-vs"), pct = q(".bgm-pct");
  bar.setAttribute("role", "slider");
  bar.setAttribute("aria-label", "재생 위치");
  bar.tabIndex = 0;

  let lastTitle = null, lastOn = null, lastMute = null;
  let seeking = false, seekRatio = 0, hold = null;   // 진행 바 드래그 중 / 놓은 직후 잠깐 위치 고정

  function fitTitle() {                                       // 제목이 길면 천천히 흘러가요
    ttlB.classList.remove("run");
    const d = ttlB.scrollWidth - ttl.clientWidth;
    if (d > 4) {
      ttlB.style.setProperty("--d", "-" + d + "px");
      ttlB.style.setProperty("--t", Math.max(6, d / 16) + "s");
      ttlB.classList.add("run");
    }
  }
  function titleText() {
    if (note) return note;
    if (!engine) return "—";
    if (track && track.title) return track.title;
    const t = engine.title();
    if (t) return t;
    return engine === YtEng ? "YouTube" : nameOf(curKey);
  }
  /* ----- 다른 곳에 둔 "재생/멈춤 버튼" (예: 페어 상세 화면) 도 같이 움직여요 ----- */
  const bound = [];
  function paintBound(on) {
    for (let i = bound.length - 1; i >= 0; i--) {
      const b = bound[i];
      if (!b.isConnected) { bound.splice(i, 1); continue; }
      b.classList.toggle("is-playing", on);
      b.disabled = !engine;
      b.setAttribute("aria-label", on ? "BGM 멈춤" : "BGM 재생");
    }
  }
  function toggle() {
    if (!engine) return;
    if (engine.playing()) { want = false; engine.pause(); }
    else { want = true; engine.play(); }
    setTimeout(refresh, 60);
  }
  function refresh() {
    const on = !!engine && engine.playing();
    paintBound(on);
    if (on !== lastOn) {
      lastOn = on;
      el.classList.toggle("is-playing", on);
      playBtn.innerHTML = on ? ICON_PAUSE : ICON_PLAY;
    }
    el.classList.toggle("is-empty", !engine);
    playBtn.disabled = !engine;

    const d = engine ? engine.dur() : 0;
    let t = engine ? engine.time() : 0;
    if (seeking && d) t = d * seekRatio;                                  // 드래그하는 동안은 손가락 위치를 보여줘요
    else if (hold && Date.now() < hold.until) t = hold.t;                 // 놓은 직후엔 이동한 위치를 잠깐 유지 (유튜브 반응 지연 보정)
    tCur.textContent = engine ? fmt(t) : "--:--";
    tTot.textContent = d ? fmt(d) : "--:--";
    fill.style.width = d ? Math.max(0, Math.min(100, t / d * 100)) + "%" : "0%";
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", String(Math.floor(d)));
    bar.setAttribute("aria-valuenow", String(Math.floor(t)));

    const title = titleText();
    if (title !== lastTitle) {
      lastTitle = title;
      ttlB.textContent = title;
      el.title = title;
      setTimeout(fitTitle, 30);
    }
  }
  function paintVol() {
    const p = Math.round(vol * 100);
    vs.style.setProperty("--v", p + "%");
    vs.setAttribute("aria-valuenow", p);
    pct.textContent = p + "%";
    const mute = p === 0;
    if (mute !== lastMute) { lastMute = mute; volBtn.innerHTML = mute ? ICON_MUTE : ICON_VOL; }
  }

  /* ----- 버튼 ----- */
  playBtn.addEventListener("click", toggle);
  noteBtn.addEventListener("click", function () {
    el.classList.toggle("mini-open");
    if (!el.classList.contains("mini-open")) el.classList.remove("vol-open");
  });
  volBtn.addEventListener("click", function () { el.classList.toggle("vol-open"); });
  /* ----- 세로 음량 바 : 누르거나 위아래로 드래그 (위 = 크게, 아래 = 작게) ----- */
  function setVol(p) {
    p = Math.max(0, Math.min(100, Math.round(p)));
    vol = p / 100;
    if (engine) engine.vol(vol);
    FileEng.vol(vol);
    paintVol();
  }
  function volFromY(e) {
    const r = vs.getBoundingClientRect();
    setVol((1 - (e.clientY - r.top) / r.height) * 100);
  }
  let vDrag = false;
  vs.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    vDrag = true;
    try { vs.setPointerCapture(e.pointerId); } catch (err) {}
    e.preventDefault();
    vs.focus();
    volFromY(e);
  });
  vs.addEventListener("pointermove", function (e) { if (vDrag) volFromY(e); });
  const vEnd = function () { vDrag = false; };
  vs.addEventListener("pointerup", vEnd);
  vs.addEventListener("pointercancel", vEnd);
  vs.addEventListener("keydown", function (e) {               // 키보드: ↑→ 크게 / ↓← 작게
    const p = Math.round(vol * 100);
    const m = { ArrowUp: p + 5, ArrowRight: p + 5, ArrowDown: p - 5, ArrowLeft: p - 5, PageUp: p + 10, PageDown: p - 10, Home: 0, End: 100 };
    if (!(e.key in m)) return;
    e.preventDefault();
    setVol(m[e.key]);
  });
  document.addEventListener("pointerdown", function (e) {     // 바깥을 누르면 음량 바가 닫혀요
    if (!el.contains(e.target)) el.classList.remove("vol-open", "mini-open");
  });
  /* ----- 진행 바 : 누르거나 좌우로 드래그해서 이동 (손을 떼는 순간 그 위치로 이동) ----- */
  function ratioOf(e) {
    const r = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  }
  function seekTo(t) {
    if (!engine) return;
    const d = engine.dur();
    if (!d) return;
    t = Math.max(0, Math.min(d, t));
    engine.seek(t);
    hold = { t: t, until: Date.now() + 500 };
    refresh();
  }
  bar.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (!engine || !engine.dur()) return;
    seeking = true;
    seekRatio = ratioOf(e);
    el.classList.add("is-seek");
    try { bar.setPointerCapture(e.pointerId); } catch (err) {}
    e.preventDefault();
    refresh();
  });
  bar.addEventListener("pointermove", function (e) {
    if (!seeking) return;
    seekRatio = ratioOf(e);
    refresh();
  });
  function endSeek(commit) {
    if (!seeking) return;
    seeking = false;
    el.classList.remove("is-seek");
    if (commit && engine) seekTo(engine.dur() * seekRatio);
    else refresh();
  }
  bar.addEventListener("pointerup", function (e) { seekRatio = ratioOf(e); endSeek(true); });
  bar.addEventListener("pointercancel", function () { endSeek(false); });
  bar.addEventListener("keydown", function (e) {              // 키보드: ←→ 5초 이동
    if (!engine) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); seekTo(engine.time() + 5); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); seekTo(engine.time() - 5); }
  });

  // 편집기(#admin) · 설치 화면(#setup) 에서는 숨겨요
  // 편집기에서는 플레이어만 숨기는 게 아니라 소리도 멈춰요. (편집기 안 미리보기 화면은 그대로 재생돼요)
  // 사이트로 돌아오면, 재생 중이었거나 자동 재생이 켜져 있던 경우 다시 이어서 틀어요.
  let inAdmin = false, wasWant = false;
  function route() {
    const adm = /^#\/?(admin|setup)/.test(location.hash);
    el.style.display = adm ? "none" : "";
    if (adm === inAdmin) return;
    inAdmin = adm;
    if (adm) {
      wasWant = wasWant || want;
      want = false;
      if (engine) engine.pause();
      setTimeout(refresh, 60);
    } else if (wasWant) {
      wasWant = false;
      want = true;
      if (engine) engine.play();
      wait();
      setTimeout(refresh, 60);
    }
  }
  window.addEventListener("hashchange", route);
  route();

  /* =====================================================
     페이지에서 쓰는 함수
     BGM.page(곡, 제목) : 플로어마스터 / Other 페이지 곡
     BGM.item(곡, 제목) : 캐릭터 프로필 · 페어 관계 화면 곡 (비우면 해제)
     BGM.reset()        : 페이지를 옮길 때 (곡 설정만 풀어요)
     ===================================================== */
  // 지금 보고 있는 페이지 이름 (#floormaster → "floormaster")
  const here = function () { return location.hash.slice(1); };

  window.BGM = {
    page: function (src, title) { layers.page = clean(src) ? { src: clean(src), title: clean(title), at: here() } : null; apply(); },
    item: function (src, title) { layers.item = clean(src) ? { src: clean(src), title: clean(title), at: here() } : null; apply(); },
    reset: function () { layers.page = null; layers.item = null; apply(); },
    bind: function (btn) {
      if (!btn) return false;
      btn.setAttribute("data-bgm-btn", "");
      btn.addEventListener("click", toggle);
      bound.push(btn);
      paintBound(!!engine && engine.playing());
      return true;
    }
  };

  // 곡을 지정했던 페이지를 벗어나면 그 곡 설정을 스스로 풀고 기본 BGM 으로 돌아가요.
  // (페이지 쪽 코드가 새 곡을 지정하는 걸 기다렸다가 확인해서, 플로어마스터 ↔ Other 이동 때 기본곡이 잠깐 끼어들지 않아요)
  window.addEventListener("hashchange", function () {
    setTimeout(function () {
      let changed = false;
      ["page", "item"].forEach(function (k) {
        if (layers[k] && layers[k].at !== here()) { layers[k] = null; changed = true; }
      });
      if (changed) apply();
    }, 0);
  });

  /* =====================================================
     시작
     ===================================================== */
  paintVol();
  if (CFG.autoplay && !PREVIEW) {
    if (inAdmin) wasWant = true;                                  // 편집기로 바로 들어온 경우: 사이트로 나갈 때 재생
    else { want = true; wait(); unlockFrame(); }
  }     // 자동 재생 : 막히면 처음 누를 때 재생
  apply();
  setInterval(refresh, 250);
})();
