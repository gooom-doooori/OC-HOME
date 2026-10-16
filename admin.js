/* ==========================================================
   admin.js : 사이트 안 관리자 편집기
   ----------------------------------------------------------
   - 주소 뒤에 #admin 을 붙여 열어요.   예) https://내사이트/#admin
   - 구글 로그인 → site.config.js 의 admin.email 과 같은 계정만 편집할 수 있어요.
   - 저장하면 Firestore(site/config)에 올라가고, 이미지는 Storage 에 올라가요.
   - 방명록(비밀글 읽기 / 답글 / 삭제)도 여기서 관리해요.
   ※ 진짜 권한 확인은 Firebase 보안 규칙이 해요. (firestore.rules, storage.rules)
   ========================================================== */
(function () {
  'use strict';

  var VER = (typeof SITE !== 'undefined' && SITE.firebaseSdk) || '13.0.0';
  var BASE = 'https://www.gstatic.com/firebasejs/' + VER + '/';
  var SKIP = { firebase: 1, admin: 1, firebaseSdk: 1 };      /* 편집기에서 건드리지 않는 항목 */
  var ORDER = ['themeColor', 'pageTitle', 'title', 'menus', 'deco', 'characterPage', 'characters',
               'pairPage', 'pairs', 'owner', 'guest', 'colors', 'background', 'fonts'];
  var TAB_NAME = {
    themeColor: '대표 색', pageTitle: '사이트 이름', title: '메인 타이틀', menus: '메인 메뉴', deco: '메인 꾸밈 글자',
    characterPage: '캐릭터 페이지 설정', characters: '캐릭터 목록', pairPage: '페어 페이지 설정', pairs: '페어 목록',
    owner: '오너 페이지', guest: '방명록 안내', colors: '색상', background: '배경', fonts: '글꼴'
  };
  var LABEL = {
    themeColor: '대표 색 (이 색 하나로 사이트 전체 색이 바뀌어요)', pageTitle: '브라우저 탭 이름',
    type: '종류', text: '글', image: '이미지', imageWidth: '로고 가로 크기', subText: '작은 글씨',
    num: '숫자', title: '이름 / 제목', desc: '설명', link: '링크', icon: '아이콘 이미지', newTab: '새 탭으로 열기',
    badge: '왼쪽 위 동그라미 글자', topLabel: '왼쪽 위 라벨', topRight: '오른쪽 위 글자', sideText: '세로 글자',
    titleTag: '타이틀 위 작은 글자', titleFrame: '타이틀 꺾쇠 테두리', info: '왼쪽 아래 소개', show: '보이기',
    heading: '큰 제목',
    label: '라벨', imageTint: '대표색 입히기', tintStrength: '색 진하기(0~1)', idNotice: '학생증 뒷면 안내',
    idIssued: '발급일', idValid: '유효기간', ticketTerms: '티켓 약관', tabs: '탭 이름', galleryEmpty: '갤러리 비었을 때 글',
    relationEmpty: '관계 비었을 때 글', panelStrength: '상세 배경 진하기(0~1)', sdShow: 'SD 보이는 때',
    sdSize: 'SD 크기', wantedPaper: '수배지 종이 이미지',
    color: '대표색', subColor: '보조색', textColor: '글자색', cardTitle: '카드 큰 글자', cardSub: '카드 작은 글자',
    sd: 'SD 이미지', tile: '타일 이미지', tilePosition: '타일 사진 위치', name: '이름', nameEn: '영문 이름 / 직책',
    intro: '한 줄 소개', tags: '태그', seat: '좌석', gate: '입구', row: '열', number: '카드 번호',
    profile: '프로필 항목', value: '내용', quote: '대표 대사', story: '설정 글', gallery: '갤러리', caption: '이미지 설명',
    relations: '관계', customFront: '앞면 이미지', customBack: '뒷면 이미지', customRatio: '카드 비율',
    customRadius: '모서리 둥글기', pairImage: '페어 페이지 사진',
    emptyText: '비었을 때 글', reviewTitle: '리뷰 목록 제목', sortText: '정렬 글자', replyButton: '답글 버튼 글자',
    bestCount: 'BEST 표시 개수', relationTabs: '관계 화면 탭 이름', timelineEmpty: '타임라인 비었을 때 글',
    trpgEmpty: 'TRPG 비었을 때 글', logButton: '로그 버튼 글자', logEmpty: '로그 없을 때 글',
    members: '멤버 (캐릭터 번호)', pairName: '페어 이름', pairNameSub: '페어 이름 아래 글', titleImage: '페어 로고 이미지',
    sides: '캐릭터 칸', catchphrase: '캐치프레이즈', reviews: '리뷰', from: '리뷰 쓴 캐릭터', to: '리뷰 받은 캐릭터',
    call: '호칭', review: '리뷰 내용', likes: '좋아요 수', date: '날짜', replies: '답글 대화',
    timeline: '타임라인', trpg: 'TRPG 백업', system: '룰', role: '역할', file: '로그 파일 위치',
    hint: '아래 안내 글', strap: '목걸이 줄 글자', links: '링크', url: '주소', backNotice: '뒷면 안내',
    sign: '서명', since: '활동 시작일', valid: '유효기간', about: '자기소개', likeTitle: '좋아요 제목',
    dislikeTitle: '싫어요 제목', dislikes: '싫어하는 것', notice: '주의사항', banner: '배너', mineTitle: '내 배너 제목',
    siteUrl: '내 홈페이지 주소', mine: '내 배너', size: '크기 표시', note: '안내 글', copyText: '복사 버튼 글자',
    copiedText: '복사 완료 글자', friendsTitle: '링크 제목', friends: '친구 배너',
    mode: '방식', ownerName: '답글 이름', ownerImage: '답글 프로필 사진', form: '구글 폼 방식(안 써도 돼요)', widget: '위젯 방식',
    sample: '예시 글', formLink: '미리 채워진 링크', sheetCsv: '시트 csv 주소', perPage: '한 번에 보여줄 글 수',
    writeTitle: '쓰기 제목', nameLabel: '이름 칸 제목', namePlaceholder: '이름 칸 안내', messageLabel: '내용 칸 제목',
    messagePlaceholder: '내용 칸 안내', secretLabel: '비밀글 글자', submitText: '버튼 글자', doneText: '완료 글',
    secretText: '비밀글 안내', listTitle: '목록 제목', columns: '시트 열 번호', height: '높이', code: '위젯 코드',
    background: '바탕색', menuBar: '메뉴 막대 색', menuText: '메뉴 글자 색', menuDesc: '메뉴 설명 색', accent: '마름모 색',
    accentText: '마름모 글자 색', dots: '점선 색', deco: '꾸밈 글자 색',
    position: '사진 위치', overlay: '스크린 효과', overlayColor: '덮을 색', overlayStrength: '효과 세기(0~1)', blur: '흐림',
    fade: '아래 그라데이션', fadeColor: '그라데이션 색', fadeHeight: '그라데이션 높이(%)', fadeStrength: '그라데이션 진하기(0~1)',
    grid: '모눈 무늬', gridColor: '선 색', gridSize: '칸 크기', gridLine: '선 두께', gridStrength: '선 진하기(0~1)',
    titleWeight: '타이틀 굵기', menu: '메뉴 글꼴', body: '본문 글꼴', mono: '번호 글꼴', hand: '손글씨 글꼴'
  };
  var LONG_KEYS = { text: 1, desc: 1, intro: 1, about: 1, story: 1, review: 1, idNotice: 1, backNotice: 1, code: 1, message: 1, note: 1 };
  /* 이미지 칸 : [올리기] 버튼이 붙어요 */
  var IMAGE_KEYS = { image: 1, sd: 1, tile: 1, icon: 1, customFront: 1, customBack: 1, pairImage: 1, titleImage: 1,
                     wantedPaper: 1, ownerImage: 1 };
  /* 색 칸 : 색 선택기가 붙어요 */
  var COLOR_KEYS = { themeColor: 1, color: 1, subColor: 1, textColor: 1, overlayColor: 1, fadeColor: 1, gridColor: 1 };
  /* 고르는 칸 : 부모 이름.칸 이름 → 선택지 */
  var SELECTS = {
    'characters.type': [['id', '학생증 / 사원증'], ['ticket', '공연 티켓'], ['wanted', '수배지'], ['custom', '직접 만든 카드']],
    'owner.type': [['id', '학생증 / 사원증'], ['ticket', '공연 티켓'], ['wanted', '수배지'], ['custom', '직접 만든 카드']],
    'title.type': [['text', '글자'], ['image', '로고 이미지']],
    'characterPage.sdShow': [['back', '카드를 뒤집었을 때만'], ['always', '항상']],
    'guest.mode': [['firebase', 'Firebase (비밀글 / 답글 / 삭제)'], ['form', '구글 폼 + 시트'], ['widget', '외부 위젯'], ['links', '익명 질문 링크만']]
  };

  var S = (typeof SITE !== 'undefined') ? SITE : (window.SITE || {});
  var st = { user: null, fb: null, draft: null, dirty: false, tab: null, root: null, view: 'site', busy: false,
             preview: window.innerWidth >= 1000, pvMobile: false, pvFrame: null, pvBody: null, pvRoute: '', pvTimer: null, pvN: 0 };
  /* 편집 탭 → 미리보기에서 보여줄 화면 */
  var TAB_ROUTE = { themeColor: '', pageTitle: '', title: '', menus: '', deco: '', colors: '', background: '', fonts: '',
                    characterPage: 'character', characters: 'character', pairPage: 'pair', pairs: 'pair',
                    owner: 'owner', guest: 'guest', __gb: 'guest' };

  function $(sel, el) { return (el || document).querySelector(sel); }
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') e[k] = attrs[k];
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function blank(v) {
    if (Array.isArray(v)) return [];
    if (v && typeof v === 'object') { var o = {}; Object.keys(v).forEach(function (k) { o[k] = blank(v[k]); }); return o; }
    if (typeof v === 'number') return 0;
    if (typeof v === 'boolean') return false;
    return '';
  }
  function toast(msg, bad) {
    var t = $('#oha-toast'); if (!t) return;
    t.textContent = msg; t.className = 'oha-toast is-on' + (bad ? ' is-bad' : '');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = 'oha-toast'; }, 3200);
  }
  function touch() {
    st.dirty = true;
    var b = $('#oha-save'); if (b) b.disabled = false;
    var d = $('#oha-dirty'); if (d) d.hidden = false;
    schedulePreview();
  }

  /* ---------- 실시간 미리보기 ---------- */
  function pvReload() {
    try {
      var w = st.pvFrame.contentWindow, u = new URL(w.location.href);
      u.searchParams.set('r', String(++st.pvN));
      w.location.replace(u.toString());
    } catch (e) {}
  }
  function schedulePreview() {
    if (!st.preview || !st.pvFrame) return;
    clearTimeout(st.pvTimer);
    st.pvTimer = setTimeout(function () {
      pvReload();
    }, 900);
  }
  function setRoute(r) {
    st.pvRoute = r || '';
    var sel = $('#oha-route'); if (sel && sel.value !== st.pvRoute) sel.value = st.pvRoute;
    if (!st.pvFrame) return;
    try { st.pvFrame.contentWindow.location.hash = st.pvRoute ? '#' + st.pvRoute : '#'; } catch (e) {}
  }
  function layoutPreview() {
    if (!st.pvFrame || !st.pvBody) return;
    var w = st.pvMobile ? 390 : 1280;
    var pw = st.pvBody.clientWidth, ph = st.pvBody.clientHeight;
    if (!pw || !ph) return;                 /* 아직 화면에 안 나온 상태 → 크기가 잡히면 다시 계산 */
    var s = Math.min(pw / w, 1);
    st.pvFrame.style.width = w + 'px';
    st.pvFrame.style.height = (ph / s) + 'px';
    st.pvFrame.style.transform = 'scale(' + s + ')';
    st.pvFrame.style.marginLeft = Math.max(0, (pw - w * s) / 2) + 'px';
  }
  function previewPane() {
    var base = location.href.split('#')[0].split('?')[0];
    var pane = h('div', { class: 'oha-pv' });
    var routes = [['', '메인'], ['character', 'Character'], ['pair', 'Pair'], ['owner', 'Owner'], ['guest', 'Guest']];
    var sel = h('select', { id: 'oha-route', class: 'oha-in', style: 'width:auto;flex:1;min-width:0' },
      routes.map(function (r) { return h('option', { value: r[0], text: r[1] }); }));
    sel.value = st.pvRoute;
    sel.onchange = function () { setRoute(sel.value); };
    var mob = h('button', { class: 'oha-btn', type: 'button', text: st.pvMobile ? 'PC 로 보기' : '모바일로 보기' });
    mob.onclick = function () { st.pvMobile = !st.pvMobile; mob.textContent = st.pvMobile ? 'PC 로 보기' : '모바일로 보기'; layoutPreview(); };
    var rf = h('button', { class: 'oha-btn', type: 'button', text: '새로고침' });
    rf.onclick = function () { pvReload(); };
    var bar = h('div', { class: 'oha-pvbar' }, [h('b', { text: '미리보기' }), sel, mob, rf]);
    var body = h('div', { class: 'oha-pvbody' });
    var fr = h('iframe', { title: '사이트 미리보기', src: base + '?preview=1' + (st.pvRoute ? '#' + st.pvRoute : '') });
    body.appendChild(fr);
    pane.appendChild(bar); pane.appendChild(body);
    st.pvFrame = fr; st.pvBody = body;
    setTimeout(layoutPreview, 0);
    if (window.ResizeObserver) new ResizeObserver(layoutPreview).observe(body);
    return pane;
  }

  /* ---------- Firebase 연결 (index.html 의 OHFB 공유) ---------- */
  function fb() {
    if (st.fb) return st.fb;
    var cfg = window.SITE_FB;
    if (!cfg || !cfg.apiKey) return Promise.reject(new Error('Firebase 설정이 없어요. data.js 의 firebase.config 를 채워 주세요.'));
    st.fb = Promise.all([
      import(BASE + 'firebase-app.js'), import(BASE + 'firebase-auth.js'),
      import(BASE + 'firebase-firestore.js'), import(BASE + 'firebase-storage.js')
    ]).then(function (m) {
      var app = m[0].getApps().length ? m[0].getApps()[0] : m[0].initializeApp(cfg);
      return { app: app, auth: m[1], fs: m[2], store: m[3],
               a: m[1].getAuth(app), db: m[2].getFirestore(app), sg: m[3].getStorage(app) };
    });
    return st.fb;
  }
  function adminEmail() { return ((S.admin || {}).email || '').trim().toLowerCase(); }
  function isAdmin() {
    return !!(st.user && adminEmail() && (st.user.email || '').toLowerCase() === adminEmail());
  }

  /* ---------- 스타일 ---------- */
  function injectCss() {
    if ($('#oha-css')) return;
    var point = ((S.colors || {}).point) || '#2b2b2b';
    var css =
      '#oha{position:fixed;inset:0;z-index:100000;background:#f6f6f6;color:#222;font:14px/1.5 Pretendard,system-ui,sans-serif;overflow:auto}' +
      '#oha *{box-sizing:border-box}#oha[hidden]{display:none}' +
      '.oha-top{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 18px;background:#fff;border-bottom:1px solid #ddd}' +
      '.oha-top h1{font-size:16px;margin:0 8px 0 0}.oha-sp{flex:1}' +
      '.oha-btn{border:1px solid #ccc;background:#fff;border-radius:999px;padding:7px 14px;font:600 13px inherit;cursor:pointer;color:#222}' +
      '.oha-btn:hover{border-color:' + point + '}.oha-btn[disabled]{opacity:.45;cursor:default}' +
      '.oha-btn.is-main{background:' + point + ';border-color:' + point + ';color:#fff}' +
      '.oha-btn.is-bad{color:#b3261e;border-color:#e3b3af}' +
      '.oha-main{display:grid;grid-template-columns:200px 1fr;gap:18px;max-width:1200px;margin:18px auto;padding:0 18px}' +
      '.oha-nav{display:flex;flex-direction:column;gap:6px;position:sticky;top:70px;align-self:start}' +
      '.oha-nav button{text-align:left;border:1px solid #ddd;background:#fff;border-radius:10px;padding:9px 12px;font:600 13px inherit;cursor:pointer}' +
      '.oha-nav button.is-on{background:' + point + ';border-color:' + point + ';color:#fff}' +
      '.oha-panel{background:#fff;border:1px solid #ddd;border-radius:14px;padding:18px}' +
      '.oha-panel h2{margin:0 0 12px;font-size:18px}' +
      '.oha-row{display:grid;grid-template-columns:130px 1fr;gap:10px;margin:8px 0;align-items:start}' +
      '.oha-lab{font-weight:700;font-size:12px;color:#555;padding-top:8px;word-break:keep-all}' +
      '.oha-in,.oha-ta{width:100%;border:1px solid #ccc;border-radius:8px;padding:8px 10px;font:inherit;background:#fff}' +
      '.oha-ta{min-height:76px;resize:vertical}' +
      '.oha-img{display:flex;gap:8px;align-items:center}.oha-img img{width:38px;height:38px;object-fit:cover;border-radius:6px;border:1px solid #ddd;background:#eee}' +
      '.oha-box{border:1px solid #e2e2e2;border-radius:10px;padding:10px 12px;margin:8px 0;background:#fcfcfc}' +
      '.oha-box>summary{cursor:pointer;font-weight:700;display:flex;gap:8px;align-items:center}' +
      '.oha-box>summary .oha-sp{flex:1}.oha-mini{border:1px solid #ccc;background:#fff;border-radius:6px;padding:2px 8px;font-size:12px;cursor:pointer}' +
      '.oha-add{margin-top:6px}.oha-note{color:#777;font-size:12px;margin:4px 0}' +
      '.oha-split{display:flex;height:calc(100vh - 58px)}.oha-ed{flex:1 1 46%;min-width:380px;overflow:auto}' +
      '.oha-split .oha-main{grid-template-columns:140px 1fr;max-width:none;margin:12px;padding:0}' +
      '.oha-split .oha-nav{top:12px}' +
      '.oha-pv{flex:1 1 54%;min-width:0;display:flex;flex-direction:column;border-right:1px solid #ccc;background:#e4e4e4}' +
      '.oha-pvbar{display:flex;gap:8px;align-items:center;padding:8px 10px;background:#fff;border-bottom:1px solid #ddd}' +
      '.oha-pvbody{flex:1;position:relative;overflow:hidden}' +
      '.oha-pvbody iframe{position:absolute;left:0;top:0;border:0;background:#fff;transform-origin:0 0;box-shadow:0 0 0 1px #ccc}' +
      '@media(max-width:999px){.oha-split{flex-direction:column;height:auto}.oha-pv{height:60vh}}' +
      '.oha-setup{max-width:760px;margin:20px auto;padding:0 18px}.oha-step{background:#fff}' +
      '.oha-step-h{display:flex;gap:10px;align-items:center;margin-bottom:8px}' +
      '.oha-num{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:' + point + ';color:#fff;font-size:13px;font-weight:700}' +
      '.oha-pre{white-space:pre-wrap;word-break:break-all;background:#f3f3f3;border-radius:8px;padding:10px;font:12px/1.5 monospace;margin:8px 0 0}' +
      '.oha-ul{margin:4px 0;padding-left:20px}.oha-ul li{margin:4px 0}' +
      '.oha-menu{display:flex;flex-direction:column;gap:4px;margin-top:6px;padding:8px;border:1px solid #ddd;border-radius:10px;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.08)}' +
      '.oha-menu[hidden]{display:none}.oha-menu-item{text-align:left;border:1px solid #e5e5e5;background:#fafafa;border-radius:8px;padding:8px 10px;cursor:pointer;font:inherit;display:flex;flex-direction:column;gap:2px}' +
      '.oha-menu-item:hover{border-color:' + point + ';background:#fff}.oha-menu-item small{color:#777}' +
      '.oha-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(20px);background:#222;color:#fff;padding:10px 16px;border-radius:10px;opacity:0;pointer-events:none;transition:.25s;z-index:100001;max-width:90vw}' +
      '.oha-toast.is-on{opacity:1;transform:translateX(-50%)}.oha-toast.is-bad{background:#b3261e}' +
      '.oha-login{max-width:420px;margin:12vh auto;background:#fff;border:1px solid #ddd;border-radius:16px;padding:28px;text-align:center}' +
      '.oha-login p{color:#555}' +
      '.oha-gb{border:1px solid #e2e2e2;border-radius:10px;padding:10px 12px;margin:8px 0;background:#fff}' +
      '.oha-gb.is-secret{background:#fff7f5;border-color:#efc9c3}.oha-gb small{color:#777}' +
      '.oha-tag{display:inline-block;background:#b3261e;color:#fff;border-radius:999px;padding:1px 8px;font-size:11px;margin-left:6px}' +
      '@media(max-width:760px){.oha-main{grid-template-columns:1fr}.oha-nav{position:static;flex-direction:row;flex-wrap:wrap}.oha-row{grid-template-columns:1fr}}';
    document.head.appendChild(h('style', { id: 'oha-css', text: css }));
  }

  /* ---------- 이미지 올리기 ---------- */
  function upload(file) {
    if (file.size > 10 * 1024 * 1024) return Promise.reject(new Error('파일이 10MB 보다 커요.'));
    return fb().then(function (c) {
      var name = Date.now() + '-' + file.name.replace(/[^\w.\-]/g, '_');
      var r = c.store.ref(c.sg, 'uploads/' + name);
      return c.store.uploadBytes(r, file, { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' }).then(function () {
        return c.store.getDownloadURL(r);
      });
    });
  }

  /* ---------- 값 편집기 (재귀) ---------- */
  function title(item, i) {
    if (item && typeof item === 'object') {
      var k = ['name', 'pairName', 'title', 'label', 'catchphrase', 'call', 'id', 'date'].filter(function (x) { return item[x] && typeof item[x] === 'string'; })[0];
      if (k) return (i + 1) + '. ' + item[k];
    }
    return (i + 1) + '번';
  }

  function stringEd(val, set, key, pkey) {
    var wrap = h('div');
    /* 고르는 칸 */
    var opts = SELECTS[pkey + '.' + key];
    if (opts) {
      var sl = h('select', { class: 'oha-in' }, opts.map(function (o) { return h('option', { value: o[0], text: o[1] }); }));
      if (!opts.some(function (o) { return o[0] === val; })) sl.insertBefore(h('option', { value: val, text: val || '(비어 있음)' }), sl.firstChild);
      sl.value = val;
      sl.onchange = function () { set(sl.value); touch(); };
      return sl;
    }
    /* 색 칸 : 색 선택기 + 글자 입력 */
    if (COLOR_KEYS[key] || pkey === 'colors') {
      var txt = h('input', { class: 'oha-in', type: 'text', placeholder: '#222222  (비우면 자동)' }); txt.value = val;
      var pick = h('input', { type: 'color', style: 'width:44px;height:36px;padding:0;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer' });
      function hex6(s) { s = String(s || '').trim(); if (/^#[0-9a-f]{3}$/i.test(s)) s = '#' + s.slice(1).replace(/./g, '$&$&'); return /^#[0-9a-f]{6}$/i.test(s) ? s : '#ffffff'; }
      pick.value = hex6(val);
      pick.oninput = function () { txt.value = pick.value; set(pick.value); touch(); };
      txt.oninput = function () { set(txt.value); touch(); pick.value = hex6(txt.value); };
      var clr = h('button', { class: 'oha-mini', type: 'button', text: '비우기' });
      clr.onclick = function () { txt.value = ''; set(''); touch(); };
      wrap.appendChild(h('div', { class: 'oha-img' }, [pick, txt, clr]));
      return wrap;
    }
    var isImg = !!(IMAGE_KEYS[key] || IMAGE_KEYS[pkey]);
    var long = LONG_KEYS[key] || String(val).indexOf('\n') >= 0;
    var inp = long ? h('textarea', { class: 'oha-ta' }) : h('input', { class: 'oha-in', type: 'text' });
    inp.value = val;
    inp.oninput = function () { set(inp.value); touch(); if (prev) prev.src = inp.value; };
    var prev = null;
    if (isImg) {
      prev = h('img', { alt: '' }); prev.src = val || '';
      prev.onerror = function () { prev.style.visibility = 'hidden'; };
      prev.onload = function () { prev.style.visibility = 'visible'; };
      var file = h('input', { type: 'file', accept: 'image/*,audio/*', hidden: 'hidden' });
      var up = h('button', { class: 'oha-btn', type: 'button', text: '올리기' });
      up.onclick = function () { file.click(); };
      file.onchange = function () {
        var f = file.files[0]; if (!f) return;
        up.textContent = '올리는 중…'; up.disabled = true;
        upload(f).then(function (url) {
          inp.value = url; set(url); touch(); prev.src = url; toast('올렸어요. 저장을 눌러 주세요.');
        }).catch(function (e) { toast('올리지 못했어요: ' + (e.message || e), true); })
          .then(function () { up.textContent = '올리기'; up.disabled = false; file.value = ''; });
      };
      var row = h('div', { class: 'oha-img' }, [prev, inp, up, file]);
      wrap.appendChild(row);
    } else wrap.appendChild(inp);
    return wrap;
  }

  function valueEd(val, set, key, pkey) {
    if (Array.isArray(val)) return arrayEd(val, key, pkey);
    if (val && typeof val === 'object') return objectEd(val, key);
    if (typeof val === 'boolean') {
      var c = h('input', { type: 'checkbox' }); c.checked = val;
      c.onchange = function () { set(c.checked); touch(); };
      return h('label', null, [c, ' 사용']);
    }
    if (typeof val === 'number' && (key === 'from' || key === 'to' || key === 'link' || key === 'members')) {
      /* 캐릭터 번호 칸 : 이름을 보며 고르기 */
      var cs = chars();
      var rs = h('select', { class: 'oha-in' }, (key === 'link' ? [h('option', { value: '0', text: '연결 안 함' })] : [])
        .concat(cs.map(function (c, i) { return h('option', { value: String(i + 1), text: (i + 1) + '번 · ' + (c.name || '(이름 없음)') }); })));
      if (!rs.querySelector('option[value="' + val + '"]')) rs.appendChild(h('option', { value: String(val), text: val + '번 (없는 캐릭터)' }));
      rs.value = String(val);
      rs.onchange = function () { set(Number(rs.value)); touch(); };
      return rs;
    }
    if (typeof val === 'number') {
      var n = h('input', { class: 'oha-in', type: 'number', step: 'any' }); n.value = val;
      n.oninput = function () { set(n.value === '' ? 0 : Number(n.value)); touch(); };
      return n;
    }
    return stringEd(val == null ? '' : String(val), set, key, pkey);
  }

  /* ==========================================================
     "+ 추가" 메뉴의 틀(템플릿) + 캐릭터 번호(순서) 자동 정리
     ========================================================== */
  function chars() { return (st.draft && st.draft.characters) || []; }
  function charName(n) { var c = chars()[n - 1]; return c ? (c.name || '(이름 없음)') : ''; }

  function profileRows(labels) { return labels.map(function (l) { return { label: l, value: '' }; }); }
  function cardTpl(type) {
    var base = { type: type, color: '', subColor: '', textColor: '', cardTitle: '', cardSub: '', image: '', sd: '', tile: '',
                 tilePosition: 'center 30%', name: '', nameEn: '', intro: '', tags: [], number: '' };
    var tail = { quote: '', story: '', gallery: [], relations: [] };
    var x;
    if (type === 'id') x = { cardTitle: 'STUDENT ID', cardSub: '', number: '0001', profile: profileRows(['나이', '키', '생일', '좋아하는 것', '싫어하는 것']) };
    if (type === 'ticket') x = { cardTitle: 'LIVE CONCERT', cardSub: 'WORLD TOUR', seat: { gate: 'A', row: '01', seat: '01' }, number: '', profile: profileRows(['공연일', '공연장', '나이', '키']) };
    if (type === 'wanted') x = { cardTitle: 'WANTED', cardSub: 'DEAD OR ALIVE', number: '$0.00', profile: profileRows(['나이', '출신', '최근 목격', '별명', '죄목', '직업']) };
    if (type === 'custom') x = { customFront: '', customBack: '', customRatio: '', customRadius: 12, cardTitle: 'MY CARD', number: '', profile: profileRows(['나이', '키']) };
    var o = {}; [base, x, tail].forEach(function (src) { Object.keys(src).forEach(function (k) { o[k] = src[k]; }); });
    return o;
  }
  function pairTpl(n) {
    var m = []; for (var i = 1; i <= n && i <= chars().length; i++) m.push(i);
    var sides = m.map(function () { return { catchphrase: '', desc: '', image: '' }; });
    return { members: m, pairName: '', pairNameSub: '', titleImage: '', label: '', sides: sides, reviews: [], gallery: [], timeline: [], trpg: [] };
  }
  var LIST_TPL = {
    gallery: { image: '', caption: '' }, relations: { name: '', label: '', text: '', image: '', link: 0 },
    profile: { label: '', value: '' }, reviews: { from: 1, to: 2, call: '', review: '', likes: 0, date: '', replies: [] },
    timeline: { date: '', title: '', text: '', image: '' },
    trpg: { title: '', system: 'CoC 7th', date: '', role: '', text: '', file: '', link: '' },
    sides: { catchphrase: '', desc: '', image: '' }, mine: { image: '', size: '200 × 40' }, friends: { name: '', image: '', url: '' }
  };

  function templatesFor(key, pkey) {
    if (key === 'characters' && !pkey) return [
      { name: '학생증 / 사원증 카드', desc: '목걸이 줄 + 링크 칩이 있는 카드', value: cardTpl('id') },
      { name: '공연 티켓 카드', desc: '가로형 티켓 (좌석 정보 포함)', value: cardTpl('ticket') },
      { name: '수배지 카드', desc: '수배지 + 현상금', value: cardTpl('wanted') },
      { name: '직접 만든 카드', desc: '앞면 · 뒷면 이미지를 직접 넣어요', value: cardTpl('custom') }
    ];
    if (key === 'pairs' && !pkey) return [
      { name: '2인 페어', desc: '캐릭터 2명', value: pairTpl(2) },
      { name: '3인 관계', desc: '캐릭터 3명', value: pairTpl(3) },
      { name: '4인 관계', desc: '캐릭터 4명', value: pairTpl(4) }
    ];
    if (key === 'menus') return [
      { name: '캐릭터 메뉴', desc: '#character', value: { num: '', title: 'Character', desc: '캐릭터 소개', link: '#character', icon: '', newTab: false } },
      { name: '페어 메뉴', desc: '#pair', value: { num: '', title: 'Pair', desc: '페어 소개', link: '#pair', icon: '', newTab: false } },
      { name: '오너 메뉴', desc: '#owner', value: { num: '', title: 'Owner', desc: '오너 소개', link: '#owner', icon: '', newTab: false } },
      { name: '방명록 메뉴', desc: '#guest', value: { num: '', title: 'Guest', desc: '방명록', link: '#guest', icon: '', newTab: false } },
      { name: '다른 사이트 링크', desc: '새 탭으로 열려요', value: { num: '', title: '', desc: '', link: 'https://', icon: '', newTab: true } }
    ];
    if (key === 'members') return [{ name: '캐릭터 선택', desc: '', value: 1 }];
    if (key === 'links' && pkey === 'owner') return [{ name: '링크 칩', desc: '', value: { label: 'X', text: '', url: '' } }];
    if (key === 'links' && pkey === 'guest') return [{ name: '익명 질문 링크', desc: '', value: { label: 'ASK', text: '', desc: '', url: '' } }];
    if (key === 'sample') return [{ name: '예시 글', desc: '', value: { time: '', name: '', message: '', reply: '' } }];
    if (LIST_TPL[key]) return [{ name: '추가', desc: '', value: LIST_TPL[key] }];
    return [];
  }

  /* 캐릭터 순서를 바꾸거나 지울 때, 번호로 연결된 곳(페어 멤버 · 리뷰 · 관계 링크)을 같이 고쳐요 */
  function eachRef(fn) {
    (st.draft.pairs || []).forEach(function (p) {
      (p.members || []).forEach(function (n, i) { p.members[i] = fn(n); });
      (p.reviews || []).forEach(function (r) { r.from = fn(r.from); r.to = fn(r.to); });
    });
    chars().forEach(function (c) { (c.relations || []).forEach(function (r) { if (r.link) r.link = fn(r.link); }); });
  }
  function swapRefs(a, b) {
    eachRef(function (n) { return n === a + 1 ? b + 1 : (n === b + 1 ? a + 1 : n); });
  }
  function removeRefs(r) {
    var R = r + 1;
    (st.draft.pairs || []).forEach(function (p) {
      var idx = (p.members || []).indexOf(R);
      if (idx >= 0) { p.members.splice(idx, 1); if (p.sides && p.sides.length > idx) p.sides.splice(idx, 1); }
      if (p.reviews) p.reviews = p.reviews.filter(function (x) { return x.from !== R && x.to !== R; });
    });
    chars().forEach(function (c) { (c.relations || []).forEach(function (x) { if (x.link === R) x.link = 0; }); });
    eachRef(function (n) { return n > R ? n - 1 : n; });
  }

  /* 칸이 없는 항목을 나중에 다시 꺼내 쓰는 "+ 항목 추가" 목록 */
  var OPTIONAL = {
    characters: { pairImage: '', sdSize: 230, subColor: '', textColor: '', seat: { gate: 'A', row: '01', seat: '01' },
                  customFront: '', customBack: '', customRatio: '', customRadius: 12 }
  };

  function objectEd(obj, key) {
    var box = h('div');
    function draw() {
      box.innerHTML = '';
      Object.keys(obj).forEach(function (k) {
        var v = obj[k];
        var complex = v && typeof v === 'object';
        var ed = valueEd(v, function (nv) { obj[k] = nv; }, k, key);
        if (complex) {
          var d = h('details', { class: 'oha-box' }, [h('summary', { text: LABEL[k] || k }), ed]);
          if (!Array.isArray(v)) d.open = false;
          box.appendChild(d);
        } else {
          box.appendChild(h('div', { class: 'oha-row' }, [h('div', { class: 'oha-lab', text: LABEL[k] || k }), ed]));
        }
      });
      var opt = OPTIONAL[key];
      if (opt) {
        var missing = Object.keys(opt).filter(function (k) { return !(k in obj); });
        if (missing.length) {
          var sel = h('select', { class: 'oha-in', style: 'width:auto;display:inline-block' },
            [h('option', { value: '', text: '+ 항목 추가…' })].concat(missing.map(function (k) {
              return h('option', { value: k, text: LABEL[k] || k });
            })));
          sel.onchange = function () {
            if (!sel.value) return;
            obj[sel.value] = clone(opt[sel.value]); touch(); draw();
          };
          box.appendChild(h('div', { class: 'oha-add' }, [sel]));
        }
      }
    }
    draw();
    return box;
  }

  function arrayEd(arr, key, pkey) {
    var box = h('div');
    function draw() {
      box.innerHTML = '';
      var simple = arr.every(function (x) { return typeof x !== 'object'; });
      arr.forEach(function (item, i) {
        var ctl = function () {
          var up = h('button', { class: 'oha-mini', type: 'button', text: '↑' });
          var dn = h('button', { class: 'oha-mini', type: 'button', text: '↓' });
          var rm = h('button', { class: 'oha-mini', type: 'button', text: '✕' });
          up.onclick = function (e) { e.preventDefault(); if (i > 0) { var isC = arr === chars(); arr.splice(i - 1, 0, arr.splice(i, 1)[0]); if (isC) swapRefs(i, i - 1); touch(); draw(); } };
          dn.onclick = function (e) { e.preventDefault(); if (i < arr.length - 1) { var isC = arr === chars(); arr.splice(i + 1, 0, arr.splice(i, 1)[0]); if (isC) swapRefs(i, i + 1); touch(); draw(); } };
          rm.onclick = function (e) { e.preventDefault(); var isC = arr === chars(); if (confirm(isC ? '이 캐릭터를 지울까요? 이 캐릭터가 들어간 페어 멤버 · 리뷰 · 관계 링크도 같이 정리돼요.' : '이 항목을 지울까요?')) { arr.splice(i, 1); if (isC) removeRefs(i); touch(); draw(); } };
          return [up, dn, rm];
        };
        if (simple) {                                   /* 문자열 / 숫자 목록 : 한 줄 */
          var ed = valueEd(item, function (nv) { arr[i] = nv; }, key, key);
          var line = h('div', { class: 'oha-img' }, [h('div', { style: 'flex:1' }, [ed])].concat(ctl()));
          box.appendChild(line);
        } else if (Array.isArray(item) && item.every(function (x) { return typeof x !== 'object'; })) {   /* 표 한 줄 [항목, 내용] */
          var cells = item.map(function (c, j) {
            return h('div', { style: 'flex:1' }, [valueEd(c, function (nv) { item[j] = nv; }, key, key)]);
          });
          box.appendChild(h('div', { class: 'oha-img' }, cells.concat(ctl())));
        } else {                                        /* 객체 목록 : 카드 */
          var sum = h('summary', null, [h('span', { text: title(item, i) }), h('span', { class: 'oha-sp' })].concat(ctl()));
          var d = h('details', { class: 'oha-box' }, [sum, valueEd(item, function (nv) { arr[i] = nv; }, key, key)]);
          box.appendChild(d);
        }
      });
      var tpls = templatesFor(key, pkey);
      var add = h('button', { class: 'oha-btn oha-add', type: 'button', text: tpls.length > 1 ? '+ 추가 ▾' : '+ 추가' });
      var menu = h('div', { class: 'oha-menu' }); menu.hidden = true;
      function push(v) { arr.push(v); touch(); menu.hidden = true; draw(); }
      add.onclick = function () {
        if (!tpls.length) { push(arr.length ? blank(arr[arr.length - 1]) : ''); return; }
        if (tpls.length === 1) { push(clone(tpls[0].value)); return; }
        if (!menu.hidden) { menu.hidden = true; return; }
        menu.innerHTML = '';
        tpls.forEach(function (t) {
          var b = h('button', { class: 'oha-menu-item', type: 'button' }, [h('b', { text: t.name }), t.desc ? h('small', { text: t.desc }) : null]);
          b.onclick = function () { push(clone(t.value)); };
          menu.appendChild(b);
        });
        if (arr.length && typeof arr[arr.length - 1] === 'object') {
          var bl = h('button', { class: 'oha-menu-item', type: 'button' }, [h('b', { text: '마지막 항목과 같은 빈 칸' })]);
          bl.onclick = function () { push(blank(arr[arr.length - 1])); };
          menu.appendChild(bl);
        }
        menu.hidden = false;
      };
      box.appendChild(add);
      box.appendChild(menu);
    }
    draw();
    return box;
  }

  /* ---------- 화면 ---------- */
  function tabs() {
    var keys = Object.keys(st.draft).filter(function (k) { return !SKIP[k]; });
    keys.sort(function (a, b) {
      var ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    return keys;
  }

  function renderEditor(body) {
    var nav = h('div', { class: 'oha-nav' });
    var panel = h('div', { class: 'oha-panel' });
    var keys = tabs();
    if (!st.tab || keys.indexOf(st.tab) < 0) st.tab = keys[0];
    function show() {
      [].forEach.call(nav.children, function (b) { b.classList.toggle('is-on', b.dataset.k === st.tab); });
      panel.innerHTML = '';
      if (st.tab === '__gb') return renderGuestbook(panel);
      panel.appendChild(h('h2', { text: TAB_NAME[st.tab] || st.tab }));
      var v = st.draft[st.tab];
      var ed = valueEd(v, function (nv) { st.draft[st.tab] = nv; }, st.tab, '');
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        /* 최상위 객체는 펼쳐서 보여주기 */
        ed.querySelectorAll(':scope > details.oha-box').forEach(function (d, i) { if (i < 1) d.open = true; });
      }
      panel.appendChild(ed);
    }
    keys.concat(['__gb']).forEach(function (k) {
      var b = h('button', { type: 'button', text: k === '__gb' ? '방명록 관리' : (TAB_NAME[k] || k) });
      b.dataset.k = k; b.onclick = function () {
        st.tab = k; show();
        if (st.preview) setRoute(TAB_ROUTE[k] || '');
      };
      nav.appendChild(b);
    });
    body.appendChild(h('div', { class: 'oha-main' }, [nav, panel]));
    show();
  }

  /* ---------- 방명록 관리 ---------- */
  function renderGuestbook(panel) {
    panel.appendChild(h('h2', { text: '방명록 관리' }));
    panel.appendChild(h('p', { class: 'oha-note', text: '비밀글을 포함해 모든 글이 보여요. 답글을 쓰고 저장하면 방문자 화면에 표시돼요.' }));
    var list = h('div', null, [h('p', { text: '불러오는 중…' })]);
    panel.appendChild(list);
    var col = (S.guest && S.guest.firebase && S.guest.firebase.collection) || 'guests';
    fb().then(function (c) {
      var q = c.fs.query(c.fs.collection(c.db, col), c.fs.orderBy('createdAt', 'desc'), c.fs.limit(200));
      return c.fs.getDocs(q).then(function (snap) {
        list.innerHTML = '';
        if (snap.empty) { list.appendChild(h('p', { text: '아직 글이 없어요.' })); return; }
        snap.forEach(function (d) {
          var v = d.data();
          var when = v.createdAt && v.createdAt.toDate ? v.createdAt.toDate().toLocaleString('ko-KR') : '';
          var card = h('div', { class: 'oha-gb' + (v.secret ? ' is-secret' : '') });
          card.appendChild(h('div', null, [h('b', { text: v.name || '익명' }),
            v.secret ? h('span', { class: 'oha-tag', text: '비밀글' }) : null,
            h('small', { text: '  ' + when })]));
          card.appendChild(h('p', { text: v.message || '', style: 'white-space:pre-wrap;margin:6px 0' }));
          var rp = h('textarea', { class: 'oha-ta', placeholder: '답글 (비우고 저장하면 답글이 지워져요)' });
          rp.value = v.reply || '';
          var sv = h('button', { class: 'oha-btn', type: 'button', text: '답글 저장' });
          var rm = h('button', { class: 'oha-btn is-bad', type: 'button', text: '글 삭제' });
          sv.onclick = function () {
            c.fs.updateDoc(c.fs.doc(c.db, col, d.id), { reply: rp.value.trim() })
              .then(function () { toast('답글을 저장했어요.'); })
              .catch(function (e) { toast('저장하지 못했어요: ' + e.message, true); });
          };
          rm.onclick = function () {
            if (!confirm('이 글을 지울까요? 되돌릴 수 없어요.')) return;
            c.fs.deleteDoc(c.fs.doc(c.db, col, d.id)).then(function () { card.remove(); toast('지웠어요.'); })
              .catch(function (e) { toast('지우지 못했어요: ' + e.message, true); });
          };
          card.appendChild(rp);
          card.appendChild(h('div', { style: 'display:flex;gap:8px;margin-top:8px' }, [sv, rm]));
          list.appendChild(card);
        });
      });
    }).catch(function (e) {
      list.innerHTML = '';
      list.appendChild(h('p', { text: '불러오지 못했어요: ' + (e.message || e) }));
    });
  }

  /* ---------- 저장 / 되돌리기 ---------- */
  function save() {
    if (!isAdmin()) return toast('관리자만 저장할 수 있어요.', true);
    var btn = $('#oha-save'); btn.disabled = true; btn.textContent = '저장 중…';
    var data = clone(st.draft); Object.keys(SKIP).forEach(function (k) { delete data[k]; });
    var json = JSON.stringify(data);
    fb().then(function (c) {
      var rev = Date.now();
      return c.fs.setDoc(c.fs.doc(c.db, 'site', 'config'), { json: json, rev: rev, by: st.user.email }).then(function () {
        try { localStorage.setItem('site-override-v1', JSON.stringify({ rev: rev, data: data })); } catch (e) {}
        st.dirty = false; $('#oha-dirty').hidden = true;
        toast('저장했어요! 사이트를 새로고침하면 반영돼요.');
      });
    }).catch(function (e) { btn.disabled = false; toast('저장하지 못했어요: ' + (e.message || e), true); })
      .then(function () { btn.textContent = '저장'; });
  }

  function reset() {
    if (!isAdmin()) return;
    if (!confirm('저장된 설정을 지우고 data.js 의 기본값으로 되돌릴까요?')) return;
    fb().then(function (c) { return c.fs.deleteDoc(c.fs.doc(c.db, 'site', 'config')); })
      .then(function () {
        try { localStorage.removeItem('site-override-v1'); } catch (e) {}
        toast('기본값으로 되돌렸어요. 새로고침해 주세요.');
      }).catch(function (e) { toast('되돌리지 못했어요: ' + (e.message || e), true); });
  }

  /* ---------- 로그인 화면 / 전체 ---------- */
  function draw() {
    var root = st.root; root.innerHTML = '';
    var top = h('div', { class: 'oha-top' });
    top.appendChild(h('h1', { text: '사이트 편집기' }));
    var close = h('button', { class: 'oha-btn', type: 'button', text: '← 사이트로' });
    close.onclick = function () {
      if (st.dirty && !confirm('저장하지 않은 변경이 있어요. 나갈까요?')) return;
      location.hash = '#';
    };
    top.appendChild(close);
    top.appendChild(h('span', { class: 'oha-sp' }));
    if (st.user) {
      top.appendChild(h('span', { class: 'oha-note', text: st.user.email + (isAdmin() ? '' : ' (관리자가 아니에요)') }));
      var lo = h('button', { class: 'oha-btn', type: 'button', text: '로그아웃' });
      lo.onclick = function () { fb().then(function (c) { return c.auth.signOut(c.a); }); };
      top.appendChild(lo);
    }
    if (isAdmin()) {
      top.appendChild(h('span', { id: 'oha-dirty', class: 'oha-note', text: '● 저장 안 됨', hidden: 'hidden' }));
      var rs = h('button', { class: 'oha-btn is-bad', type: 'button', text: '기본값으로' }); rs.onclick = reset;
      var sv = h('button', { id: 'oha-save', class: 'oha-btn is-main', type: 'button', text: '저장', disabled: 'disabled' }); sv.onclick = save;
      var pv = h('button', { class: 'oha-btn', type: 'button', text: st.preview ? '미리보기 끄기' : '미리보기 켜기' });
      pv.onclick = function () { st.preview = !st.preview; draw(); };
      top.appendChild(pv); top.appendChild(rs); top.appendChild(sv);
    }
    root.appendChild(top);

    /* 연결 설정(site.config.js)이 없거나 #setup 이면 설치 화면 */
    if (st.view === 'setup' || !window.SITE_FB || !adminEmail()) {
      root.appendChild(renderSetup());
      root.appendChild(h('div', { id: 'oha-toast', class: 'oha-toast' }));
      return;
    }

    if (!st.user) {
      var go = h('button', { class: 'oha-btn is-main', type: 'button', text: 'Google 로 로그인' });
      go.onclick = function () {
        fb().then(function (c) { return c.auth.signInWithPopup(c.a, new c.auth.GoogleAuthProvider()); })
          .catch(function (e) { toast('로그인하지 못했어요: ' + (e.message || e), true); });
      };
      root.appendChild(h('div', { class: 'oha-login' }, [h('h2', { text: '관리자 로그인' }),
        h('p', { text: '관리자 계정으로 로그인하면 사이트를 편집할 수 있어요.' }), go]));
    } else if (!isAdmin()) {
      root.appendChild(h('div', { class: 'oha-login' }, [h('h2', { text: '권한이 없어요' }),
        h('p', { text: '이 계정은 관리자가 아니에요. 로그아웃하고 관리자 계정으로 다시 로그인해 주세요.' })]));
    } else {
      if (!st.draft) {
        st.draft = clone(S);
        Object.keys(SKIP).forEach(function (k) { delete st.draft[k]; });
      }
      if (st.preview) {
        var ed = h('div', { class: 'oha-ed' });
        renderEditor(ed);
        var split = h('div', { class: 'oha-split' }, [previewPane(), ed]);
        root.appendChild(split);
      } else {
        st.pvFrame = null; st.pvBody = null;
        renderEditor(root);
      }
    }
    root.appendChild(h('div', { id: 'oha-toast', class: 'oha-toast' }));
  }

  /* ==========================================================
     설치 화면 (#setup) : 코드를 열지 않고 Firebase 를 연결해요
     1) firebaseConfig 붙여넣기  2) 관리자 이메일  3) site.config.js 내려받기
     4) 규칙 복사(이메일이 자동으로 들어가요)  5) 콘솔에서 할 일 체크
     ========================================================== */
  function parseFirebaseConfig(text) {
    var out = {}, re = /([A-Za-z]+)\s*:\s*["']([^"']+)["']/g, m;
    while ((m = re.exec(text || ''))) out[m[1]] = m[2];
    return out;
  }
  function validEmail(s) { return /^[^\s'"\\@]+@[^\s'"\\@]+\.[^\s'"\\@]+$/.test(s); }
  function firestoreRules(email) {
    return "rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n\n" +
      "    function isAdmin() {\n      return request.auth != null\n        && request.auth.token.email == '" + email + "'\n        && request.auth.token.email_verified == true;\n    }\n\n" +
      "    // 방명록 (컬렉션 이름 : guests)\n    match /guests/{id} {\n" +
      "      allow create: if request.resource.data.keys().hasOnly(['name', 'message', 'secret', 'createdAt'])\n" +
      "        && request.resource.data.name is string\n        && request.resource.data.name.size() > 0\n        && request.resource.data.name.size() <= 20\n" +
      "        && request.resource.data.message is string\n        && request.resource.data.message.size() > 0\n        && request.resource.data.message.size() <= 1000\n" +
      "        && request.resource.data.secret is bool\n        && request.resource.data.createdAt == request.time;\n" +
      "      allow read: if resource.data.secret == false || isAdmin();\n      allow update, delete: if isAdmin();\n    }\n\n" +
      "    // 사이트 설정 (편집기가 저장하는 곳)\n    match /site/{docId} {\n      allow read: if true;\n      allow write: if isAdmin();\n    }\n  }\n}\n";
  }
  function storageRules(email) {
    return "rules_version = '2';\nservice firebase.storage {\n  match /b/{bucket}/o {\n    match /uploads/{allPaths=**} {\n      allow read: if true;\n" +
      "      allow write: if request.auth != null\n        && request.auth.token.email == '" + email + "'\n        && request.auth.token.email_verified == true\n" +
      "        && request.resource.size < 10 * 1024 * 1024\n        && request.resource.contentType.matches('image/.*|audio/.*');\n    }\n  }\n}\n";
  }
  function configFileText(cfg, email) {
    var keys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId'];
    var lines = keys.filter(function (k) { return cfg[k]; }).map(function (k) { return '    ' + k + ': ' + JSON.stringify(cfg[k]); });
    return '/* site.config.js : 내 Firebase 연결 + 관리자 이메일 (공개되어도 되는 값이에요) */\n' +
      'window.SITE_CONFIG = {\n  firebase: {\n' + lines.join(',\n') + '\n  },\n  admin: { email: ' + JSON.stringify(email) + ' }\n};\n';
  }
  function copyBtn(label, getText) {
    var b = h('button', { class: 'oha-btn', type: 'button', text: label });
    b.onclick = function () {
      var t = getText();
      var done = function () { toast('복사했어요.'); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () { prompt('복사해서 쓰세요', t); });
      else prompt('복사해서 쓰세요', t);
    };
    return b;
  }

  function renderSetup() {
    var cur = window.SITE_CONFIG || {};
    var curCfg = cur.firebase || {};
    var state = { cfg: curCfg, email: (cur.admin && cur.admin.email) || '' };
    var wrap = h('div', { class: 'oha-setup' });
    wrap.appendChild(h('h2', { text: '설치 화면' }));
    wrap.appendChild(h('p', { class: 'oha-note', text: window.SITE_FB
      ? '이미 연결되어 있어요. 값을 바꾸고 싶을 때만 다시 만드세요.'
      : '아직 Firebase 가 연결되지 않았어요. 아래 순서대로 진행하면 코드를 열지 않고 연결할 수 있어요.' }));

    var ta = h('textarea', { class: 'oha-ta', style: 'min-height:150px;font-family:monospace', placeholder: 'const firebaseConfig = {\n  apiKey: "...",\n  authDomain: "...",\n  ...\n};' });
    var status = h('p', { class: 'oha-note' });
    var emailIn = h('input', { class: 'oha-in', type: 'text', placeholder: 'myname@gmail.com' }); emailIn.value = state.email;
    var dl = h('button', { class: 'oha-btn is-main', type: 'button', text: 'site.config.js 내려받기', disabled: 'disabled' });
    var fsPre = h('pre', { class: 'oha-pre' }), stPre = h('pre', { class: 'oha-pre' });

    function refresh() {
      var cfg = parseFirebaseConfig(ta.value);
      if (!ta.value.trim() && state.cfg.apiKey) cfg = state.cfg;
      var okCfg = !!(cfg.apiKey && cfg.projectId && cfg.appId);
      var email = emailIn.value.trim().toLowerCase();
      var okMail = validEmail(email);
      status.textContent = okCfg ? '✔ 연결 정보를 읽었어요 — 프로젝트 ' + cfg.projectId : '… firebaseConfig 를 붙여넣어 주세요 (apiKey, projectId, appId 가 필요해요)';
      dl.disabled = !(okCfg && okMail);
      state.cfgNow = cfg; state.emailNow = email;
      var e = okMail ? email : '내이메일@gmail.com';
      fsPre.textContent = firestoreRules(e); stPre.textContent = storageRules(e);
    }
    ta.oninput = refresh; emailIn.oninput = refresh;
    dl.onclick = function () {
      var text = configFileText(state.cfgNow, state.emailNow);
      var a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/javascript' })), download: 'site.config.js' });
      document.body.appendChild(a); a.click(); a.remove();
      toast('내려받았어요. 저장소의 site.config.js 를 이 파일로 바꿔 주세요.');
    };

    function step(n, title, kids) {
      return h('div', { class: 'oha-box oha-step' }, [h('div', { class: 'oha-step-h' }, [h('span', { class: 'oha-num', text: String(n) }), h('b', { text: title })])].concat(kids));
    }
    wrap.appendChild(step(1, 'Firebase 연결 정보 붙여넣기', [
      h('p', { class: 'oha-note', text: 'Firebase 콘솔 → ⚙ 프로젝트 설정 → 일반 → 내 앱 → 웹 앱(</>) 의 firebaseConfig 코드를 통째로 복사해 붙여넣으세요.' }), ta, status]));
    wrap.appendChild(step(2, '관리자 이메일', [
      h('p', { class: 'oha-note', text: '#admin 에서 로그인해 사이트를 편집할 구글 계정이에요. 이 이메일은 공개 파일에 들어가요.' }), emailIn]));
    wrap.appendChild(step(3, '설정 파일 만들기', [
      h('p', { class: 'oha-note', text: '내려받은 site.config.js 를 저장소(index.html 이 있는 곳)에 올려 같은 이름 파일을 덮어쓰고 커밋하세요. 1~2분 뒤 반영돼요.' }), dl]));
    wrap.appendChild(step(4, '보안 규칙 붙여넣기 (이메일이 자동으로 들어가요)', [
      h('p', { class: 'oha-note', text: 'Firestore 규칙 → Firestore Database → 규칙 탭에 붙여넣고 게시. Storage 규칙 → Storage → 규칙 탭에 붙여넣고 게시.' }),
      h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, [copyBtn('Firestore 규칙 복사', function () { return fsPre.textContent; }), copyBtn('Storage 규칙 복사', function () { return stPre.textContent; })]),
      h('details', { class: 'oha-box' }, [h('summary', { text: 'Firestore 규칙 보기' }), fsPre]),
      h('details', { class: 'oha-box' }, [h('summary', { text: 'Storage 규칙 보기' }), stPre])]));
    wrap.appendChild(step(5, 'Firebase 콘솔에서 켜 둘 것', [
      h('ul', { class: 'oha-ul' }, [
        h('li', { text: 'Authentication → Sign-in method → Google 사용 설정' }),
        h('li', { text: 'Authentication → 설정 → 승인된 도메인에 내 사이트 주소 추가' }),
        h('li', { text: 'Firestore Database 만들기 (프로덕션 모드)' }),
        h('li', { text: 'Storage 시작하기 — 이미지 업로드를 쓸 때 (요금제 안내를 확인하세요)' })])]));
    var go = h('a', { class: 'oha-btn is-main', href: '#admin', text: '편집기로 가기 (#admin)', style: 'display:inline-block;text-decoration:none' });
    wrap.appendChild(h('div', { style: 'margin:14px 0 30px' }, [go]));
    refresh();
    return wrap;
  }

  function mount(view) {
    injectCss();
    st.view = view || 'admin';
    if (!st.root) {
      st.root = h('div', { id: 'oha' });
      document.body.appendChild(st.root);
      window.addEventListener('hashchange', function () {
        var m = location.hash.match(/^#\/?(admin|setup)/);
        st.root.hidden = !m;
        if (m && st.view !== m[1]) { st.view = m[1]; draw(); }
      });
      window.addEventListener('beforeunload', function (e) {
        if (st.dirty) { e.preventDefault(); e.returnValue = ''; }
      });
      if (adminEmail() && window.SITE_FB) {
        fb().then(function (c) {
          c.auth.onAuthStateChanged(c.a, function (u) { st.user = u; draw(); });
        }).catch(function () { draw(); });
      }
    }
    st.root.hidden = false;
    draw();
  }

  window.OHAdmin = { mount: mount, _state: st, _draw: draw };
})();
