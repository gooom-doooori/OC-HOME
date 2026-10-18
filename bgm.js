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
  const NOOP = { page: function () {}, item: function () {}, reset: function () {} };
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
  let engine = null, track = null, curKey = "", note = "";
  let want = false;                            // 사용자가 "재생 중이길" 원하는 상태

  /* 브라우저가 소리 재생을 막았을 때: 화면을 처음 누르는 순간 재생해요 */
  let waiting = false;
  let el = null;
  function wait() {
    if (waiting) return;
    waiting = true;
    const go = function (e) {
      waiting = false;
      document.removeEventListener("pointerdown", go, true);
      document.removeEventListener("keydown", go, true);
      if (e && el && el.contains(e.target)) return;      // 플레이어를 직접 누른 거면 그 버튼이 알아서 해요
      if (want && engine) engine.play();
    };
    document.addEventListener("pointerdown", go, true);
    document.addEventListener("keydown", go, true);
  }
  function kick(p) {
    if (p && p.catch) p.catch(function (err) { if (err && err.name === "NotAllowedError") wait(); });
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
            onReady: function () {
              ready = true;
              player.setVolume(Math.round(vol * 100));
              if (job) { const j = job; job = null; start(j); }
            },
            onStateChange: function (e) {
              if (e.data === 0) { player.seekTo(0, true); player.playVideo(); }   // 끝나면 처음부터 반복
              refresh();
            },
            onError: function () { note = "이 영상은 재생할 수 없어요"; refresh(); }
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
    const src = clean(t.src);
    if (src === curKey) { if (t.title !== (track && track.title)) { track = t; refresh(); } return; }

    if (engine && curKey) saved[curKey] = engine.time();      // 떠나는 곡의 위치 기억
    const old = engine;
    curKey = src;
    track = t;
    note = "";

    if (!src) {                                               // 틀 곡이 없으면 멈춤
      if (old) old.pause();
      engine = null;
      refresh();
      return;
    }
    const id = ytId(src);
    engine = id ? YtEng : FileEng;
    if (old && old !== engine) old.pause();
    engine.vol(vol);
    engine.load(id || src, saved[src] || 0, want);
    refresh();
  }

  /* =====================================================
     화면 (플레이어 모양)
     ===================================================== */
  const ICON_PLAY  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  const ICON_VOL   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  const ICON_MUTE  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';

  el = document.createElement("div");
  el.className = "bgm is-empty";
  el.innerHTML =
    '<div class="bgm-main">' +
      '<span class="bgm-eq"><i></i><i></i><i></i></span>' +
      '<span class="bgm-ttl"><b>BGM</b></span>' +
      '<span class="bgm-time"><em>--:--</em> / <span>--:--</span></span>' +
      '<button type="button" class="bgm-play" aria-label="재생 / 멈춤"></button>' +
      '<button type="button" class="bgm-vbtn" aria-label="음량"></button>' +
      '<div class="bgm-bar"><i></i></div>' +
    '</div>' +
    '<div class="bgm-pop">' +
      '<input class="bgm-range" type="range" min="0" max="100" step="1" aria-label="음량 조절">' +
      '<span class="bgm-pct"></span>' +
    '</div>';
  document.body.appendChild(el);

  const q = function (s) { return el.querySelector(s); };
  const ttl = q(".bgm-ttl"), ttlB = q(".bgm-ttl b");
  const tCur = q(".bgm-time em"), tTot = q(".bgm-time span");
  const playBtn = q(".bgm-play"), volBtn = q(".bgm-vbtn");
  const bar = q(".bgm-bar"), fill = q(".bgm-bar i");
  const range = q(".bgm-range"), pct = q(".bgm-pct");

  let lastTitle = null, lastOn = null, lastMute = null;

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
  function refresh() {
    const on = !!engine && engine.playing();
    if (on !== lastOn) {
      lastOn = on;
      el.classList.toggle("is-playing", on);
      playBtn.innerHTML = on ? ICON_PAUSE : ICON_PLAY;
    }
    el.classList.toggle("is-empty", !engine);
    playBtn.disabled = !engine;

    const d = engine ? engine.dur() : 0, t = engine ? engine.time() : 0;
    tCur.textContent = engine ? fmt(t) : "--:--";
    tTot.textContent = d ? fmt(d) : "--:--";
    fill.style.width = d ? Math.min(100, t / d * 100) + "%" : "0%";

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
    range.value = p;
    range.style.setProperty("--v", p + "%");
    pct.textContent = p + "%";
    const mute = p === 0;
    if (mute !== lastMute) { lastMute = mute; volBtn.innerHTML = mute ? ICON_MUTE : ICON_VOL; }
  }

  /* ----- 버튼 ----- */
  playBtn.addEventListener("click", function () {
    if (!engine) return;
    if (engine.playing()) { want = false; engine.pause(); }
    else { want = true; engine.play(); }
    setTimeout(refresh, 60);
  });
  volBtn.addEventListener("click", function () { el.classList.toggle("vol-open"); });
  range.addEventListener("input", function () {
    vol = (+range.value) / 100;
    if (engine) engine.vol(vol);
    FileEng.vol(vol);
    paintVol();
  });
  document.addEventListener("pointerdown", function (e) {     // 바깥을 누르면 음량 바가 닫혀요
    if (!el.contains(e.target)) el.classList.remove("vol-open");
  });
  bar.addEventListener("click", function (e) {                // 진행 바를 눌러서 이동
    if (!engine) return;
    const d = engine.dur();
    if (!d) return;
    const r = bar.getBoundingClientRect();
    engine.seek(d * Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
    refresh();
  });

  // 편집기(#admin) · 설치 화면(#setup) 에서는 숨겨요
  function route() { el.style.display = /^#\/?(admin|setup)/.test(location.hash) ? "none" : ""; }
  window.addEventListener("hashchange", route);
  route();

  /* =====================================================
     페이지에서 쓰는 함수
     BGM.page(곡, 제목) : 플로어마스터 / Other 페이지 곡
     BGM.item(곡, 제목) : 캐릭터 프로필 · 페어 관계 화면 곡 (비우면 해제)
     BGM.reset()        : 페이지를 옮길 때 (곡 설정만 풀어요)
     ===================================================== */
  window.BGM = {
    page: function (src, title) { layers.page = clean(src) ? { src: clean(src), title: clean(title) } : null; apply(); },
    item: function (src, title) { layers.item = clean(src) ? { src: clean(src), title: clean(title) } : null; apply(); },
    reset: function () { layers.page = null; layers.item = null; apply(); }
  };

  /* =====================================================
     시작
     ===================================================== */
  paintVol();
  if (CFG.autoplay && !PREVIEW) { want = true; wait(); }     // 자동 재생 : 막히면 처음 누를 때 재생
  apply();
  setInterval(refresh, 250);
})();
