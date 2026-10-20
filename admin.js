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
  var ORDER = ['themeColor', 'pageTitle', 'title', 'menus', 'deco', 'bgmPlayer','characterPage', 'characters', 'floormasterPage', 'floormasters', 'otherPage', 'others',
               'pairPage', 'pairs', 'owner', 'guest', 'colors', 'background', 'fonts'];
  var TAB_NAME = {
    themeColor: '대표 색', pageTitle: '사이트 이름', title: '메인 타이틀', menus: '메인 메뉴', deco: '메인 꾸밈 글자',
    bgmPlayer: 'BGM 플레이어',
    characterPage: '캐릭터 페이지 설정', characters: '캐릭터 목록', pairPage: '페어 페이지 설정', floormasterPage: '플로어마스터 페이지 설정', floormasters: '플로어마스터 목록', otherPage: 'Other 페이지 설정', others: 'Other 목록', pairs: '페어 목록',
    owner: '오너 페이지', guest: '방명록 안내', colors: '색상', background: '배경', fonts: '글꼴'
  };
  var LABEL = {
    themeColor: '전체 테마색', pageTitle: '브라우저 탭 이름',
    type: '종류', text: '글', image: '이미지', imageWidth: '로고 가로 크기', subText: '작은 글씨',
    num: '숫자', title: '이름 / 제목', desc: '설명', link: '링크', icon: '아이콘 이미지', newTab: '새 탭으로 열기', left: '왼쪽에 띄우기',
    badge: '왼쪽 위 동그라미 글자', topLabel: '왼쪽 위 라벨', topRight: '오른쪽 위 글자', sideText: '세로 글자',
    titleTag: '타이틀 위 작은 글자', titleFrame: '타이틀 꺾쇠 테두리', info: '왼쪽 아래 소개', show: '보이기',
    heading: '큰 제목',
    bgmPlayer: 'BGM 플레이어', autoplay: '자동 재생', volume: '음량',
    bgm: '테마곡', bgmTitle: '곡 제목',
    label: '라벨', imageTint: '대표색 입히기', tintStrength: '색 진하기(0~1)', idNotice: '학생증 뒷면 안내',
    idIssued: '발급일', idValid: '유효기간', ticketTerms: '티켓 약관', tabs: '탭 이름', galleryEmpty: '갤러리 비었을 때 글',
    relationEmpty: '관계 비었을 때 글', panelStrength: '상세 배경 진하기(0~1)', sdShow: 'SD 보이는 때',
    sdSize: 'SD 크기', wantedPaper: '수배지 종이 이미지',
    color: '대표색', subColor: '보조색', textColor: '글자색', cardTitle: '카드 큰 글자', cardSub: '카드 작은 글자',
    fullBody: '전신 일러스트', portraits: '포트레이트 (최대 3개, 선택)',
    sd: 'SD 이미지', tile: '타일 이미지', tilePosition: '타일 사진 위치', name: '이름', nameEn: '영문 이름 / 직책', faction: '진영', spoiler: '스포일러 캐릭터',
    intro: '한 줄 소개', tags: '태그', seat: '좌석', gate: '입구', row: '열', number: '카드 번호',
    profile: '프로필 항목', value: '내용', quote: '대표 대사', story: '설정 글', gallery: '갤러리', caption: '이미지 설명',
    relations: '관계', customFront: '앞면 이미지', customBack: '뒷면 이미지', customRatio: '카드 비율',
    customRadius: '모서리 둥글기', pairImage: '페어 페이지 사진',
    emptyText: '비었을 때 글', reviewTitle: '리뷰 목록 제목', sortText: '정렬 글자', replyButton: '답글 버튼 글자',
    bestCount: 'BEST 표시 개수', relationTabs: '관계 화면 탭 이름', timelineEmpty: '타임라인 비었을 때 글',
    trpgEmpty: 'TRPG 비었을 때 글', logButton: '로그 버튼 글자', logEmpty: '로그 없을 때 글',
    members: '페어 멤버', pairName: '페어 이름', pairNameSub: '페어 이름 아래 글', titleImage: '페어 로고 이미지',
    sides: '캐릭터 칸', catchphrase: '캐치프레이즈', reviews: '리뷰', from: '리뷰 쓴 캐릭터', to: '리뷰 받은 캐릭터',
    call: '닉네임', review: '리뷰 내용', likes: '좋아요 수', date: '날짜', replies: '답글 대화',
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
    position: '사진 위치', width: '배경 사진 가로 크기', overlay: '스크린 효과', overlayColor: '덮을 색', overlayStrength: '효과 세기(0~1)', blur: '흐림',
    fade: '아래 그라데이션', fadeColor: '그라데이션 색', fadeHeight: '그라데이션 높이(%)', fadeStrength: '그라데이션 진하기(0~1)',
    grid: '모눈 무늬', gridColor: '선 색', gridSize: '칸 크기', gridLine: '선 두께', gridStrength: '선 진하기(0~1)',
    frontImage: '격자 위 이미지', frontPosition: '격자 위 이미지 위치', frontWidth: '격자 위 이미지 가로 크기', frontOpacity: '격자 위 이미지 진하기(0~1)',
    titleWeight: '타이틀 굵기', menu: '메뉴 글꼴', body: '본문 글꼴', mono: '번호 글꼴', hand: '손글씨 글꼴'
  };
  var LONG_KEYS = { text: 1, desc: 1, intro: 1, about: 1, story: 1, review: 1, idNotice: 1, backNotice: 1, code: 1, message: 1, note: 1 };
  /* 이미지 칸 : [올리기] 버튼이 붙어요 */
  var IMAGE_KEYS = { image: 1, frontImage: 1, sd: 1, tile: 1, fullBody: 1, portraits: 1, icon: 1, customFront: 1, customBack: 1, pairImage: 1, titleImage: 1,
                     wantedPaper: 1, ownerImage: 1, bgm: 1};
  /* 색 칸 : 색 선택기가 붙어요 */
  var COLOR_KEYS = { themeColor: 1, color: 1, subColor: 1, textColor: 1, overlayColor: 1, fadeColor: 1, gridColor: 1 };
  /* 체크 칸 옆에 붙는 글자 (없으면 "사용") */
  var BOOL_TEXT = { spoiler: '스포일러 포함 — 체크하면 열람 전에 경고 팝업이 떠요' };
  /* 고르는 칸 : 부모 이름.칸 이름 → 선택지 */
  var SELECTS = {
    'characters.type': [['id', '학생증 / 사원증'], ['ticket', '공연 티켓'], ['wanted', '수배지'], ['custom', '직접 만든 카드']],
    'owner.type': [['id', '학생증 / 사원증'], ['ticket', '공연 티켓'], ['wanted', '수배지'], ['custom', '직접 만든 카드']],
    'floormasters.type': [['id', '학생증 / 사원증'], ['ticket', '공연 티켓'], ['wanted', '수배지'], ['custom', '직접 만든 카드']],
    'others.type': [['id', '학생증 / 사원증'], ['ticket', '공연 티켓'], ['wanted', '수배지'], ['custom', '직접 만든 카드']],
    'title.type': [['text', '글자'], ['image', '로고 이미지']],
    'characterPage.sdShow': [['back', '카드를 뒤집었을 때만'], ['always', '항상']],
    'guest.mode': [['firebase', 'Firebase (비밀글 / 답글 / 삭제)'], ['form', '구글 폼 + 시트'], ['widget', '외부 위젯'], ['links', '익명 질문 링크만']]
  };

  /* ==========================================================
     편집기 보기 개선용 설정
     - PH      : 이름만 봐서는 알기 어려운 칸의 한 줄 설명 (placeholder)
     - SCHEMA  : 항목을 섹션 / 세로줄 묶음으로 나누는 틀
     - *_DEFAULTS : 예전에 "+ 항목 추가"로 꺼내던 칸을 처음부터 넣어두기
     ========================================================== */
  var ICON_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>';
  var ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/><path d="M10 11v6M14 11v6"/></svg>';
  var ICON_ARROW_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>';
  var ICON_ARROW_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  var ICON_GRIP = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.7"/><circle cx="15" cy="6" r="1.7"/><circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/><circle cx="9" cy="18" r="1.7"/><circle cx="15" cy="18" r="1.7"/></svg>';
  var ICON_BUSY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9"/></svg>';

  var PH_CARD = {
    nameEn: '직책 · 영문 이름 등',
    faction: '같은 진영끼리 왼쪽 목록에서 묶여요.',
    intro: '카드 앞면 한 줄 소개',
    number: '학생증 - ID No. · 티켓 - 코드 · 수배지 - 현상금',
    cardTitle: '예: STUDENT ID',
    cardSub: '소속 · 학교 이름 등',
    color: 'HEX코드 입력',
    subColor: 'HEX코드 입력',
    textColor: 'HEX코드 입력',
    image: '카드에 들어갈 캐릭터 이미지',
    pairImage: '페어 페이지 프로필 이미지(페어 상세 페이지와 다름)',
    sd: '',
    sdSize: '기본 230px',
    tile: '왼쪽 목록 타일 이미지',
    tilePosition: 'top | center | bottom 숫자% 형식으로 작성',
    fullBody: '',
    portraits: '포트레이트 이미지',
    quote: '대표 대사',
    story: '설정 글',
    customFront: '커스텀 앞면 이미지',
    customBack: '커스텀 뒷면 이미지',
    customRatio: '가로 / 세로 (예: 2 / 3)',
    bgm: '음악 파일 · 유튜브 링크',
    bgmTitle: ''
  };
  var PH = {
    'tags.tags': '# 없이 작성', 'likes.likes': '', 'dislikes.dislikes': '',
    'notice.notice': '주의사항', 'ticketTerms.ticketTerms': '주의사항', 'replies.replies': '답글',
    'profile.label': '제목', 'profile.value': '내용',
    'gallery.image': '', 'gallery.caption': '이미지 설명 혹은 제목',
    'relations.name': '상대 이름', 'relations.label': '', 'relations.text': '상세 설명',
    'relations.image': '상대 사진',
    'seat.gate': '', 'seat.row': '', 'seat.seat': '',
    'menus.num': '', 'menus.desc': '제목 아래 작은 설명', 'menus.link': '#character 또는 다른 사이트 주소',
    'menus.icon': '',
    'deco.badge': '', 'deco.topLabel': '', 'deco.topRight': '',
    'deco.sideText': '', 'deco.titleTag': '',
    'info.heading': '', 'info.text': '',
    'title.text': '', 'title.image': '', 'title.imageWidth': '',
    'title.subText': '',
    'pairs.pairName': '페어 상세 페이지 제목', 'pairs.pairNameSub': '',
    'pairs.titleImage': '이름 대신 넣을 로고 이미지', 'pairs.label': '관계 (친구 · 연인 · 라이벌 등)',
    'pairs.bgm': '페어 테마곡 파일 · 유튜브 링크', 'pairs.bgmTitle': '',
    'sides.catchphrase': '', 'sides.desc': '3~4줄 내외의 간단한 서사', 'sides.image': '상세 페이지용 캐릭터 이미지 (투명 png 추천)',
    'reviews.call': '자신의 닉네임', 'reviews.review': '', 'reviews.date': '리뷰 아래 작은 글씨 (날짜 등)',
    'timeline.date': '날짜', 'timeline.title': '제목', 'timeline.text': '내용', 'timeline.image': '이미지 주소 (선택)',
    'trpg.title': '시나리오 제목', 'trpg.system': '룰 (예: CoC 7th)', 'trpg.date': '날짜', 'trpg.role': '역할 (KPC · PC 등)',
    'trpg.text': '후기', 'trpg.file': '로그 파일 위치 (예: logs/log1.html)', 'trpg.link': '파일 대신 쓸 외부 링크',
    'links.label': '앞에 붙는 짧은 글자 (X · ASK 등)', 'links.text': '표시할 글자 (@아이디 · 서비스 이름)', 'links.url': '연결 주소',
    'links.desc': '아래 작은 설명 (방명록 링크만)',
    'mine.image': '배너 이미지 주소', 'mine.size': '이미지 없을 때 표시할 크기 (예: 200 × 40)',
    'friends.name': '친구 이름', 'friends.image': '친구 배너 이미지', 'friends.url': '친구 홈페이지 주소',
    'banner.mineTitle': '내 배너 제목', 'banner.siteUrl': '내 홈 주소',
    'banner.note': '내 배너 아래 안내 글', 'banner.copyText': '복사 버튼 글자',
    'banner.copiedText': '복사 완료 글자', 'banner.friendsTitle': '친구 링크 제목',
    'bgmPlayer.bgm': '기본 BGM 파일 · 유튜브 링크', 'bgmPlayer.bgmTitle': '',
    'background.image': '', 'background.position': 'top | center | bottom 숫자% 형식으로 작성', 'background.width': '',
    'background.frontImage': '격자무늬 위에 올라오는 이미지', 'background.frontPosition': '이미지 위치 (예: center)',
    'background.frontWidth': '',
    'guest.label': '왼쪽 위 뱃지 옆 글자', 'guest.title': '가운데 큰 제목', 'guest.intro': '제목 아래 안내 글',
    'guest.ownerName': '답글 쓴 사람 이름', 'guest.ownerImage': '답글 프로필 사진',
    'form.formLink': '구글 폼의 "미리 채워진 링크"', 'form.sheetCsv': '시트를 웹에 게시해서 받은 csv 주소',
    'widget.url': '주소 형태일 때 작성', 'widget.code': '코드 형태일 때 작성',
    'pairPage.label': '왼쪽 위 뱃지 옆 글자', 'pairPage.reviewTitle': '리뷰 목록 위 글자 (옆에 개수가 붙어요)',
    'pairPage.sortText': '오른쪽 위 정렬 글자', 'pairPage.replyButton': '리뷰 아래 답글 버튼 글자',
    'pairPage.logButton': 'TRPG 백업 카드 버튼 글자', 'pairPage.logEmpty': '로그 파일이 없을 때 안내 글',
    'tabs.profile': '프로필 탭 이름', 'tabs.gallery': '갤러리 탭 이름', 'tabs.relation': '관계 탭 이름',
    'tabs.taste': '취향 탭 이름', 'tabs.notice': '주의사항 탭 이름', 'tabs.banner': '배너 탭 이름',
    'relationTabs.timeline': '타임라인 탭 이름', 'relationTabs.gallery': '갤러리 탭 이름', 'relationTabs.trpg': 'TRPG 탭 이름'
  };
  ['characters', 'floormasters', 'others', 'owner'].forEach(function (k) {
    Object.keys(PH_CARD).forEach(function (f) { PH[k + '.' + f] = PH_CARD[f]; });
  });
  ['characterPage', 'floormasterPage', 'otherPage'].forEach(function (k) {
    PH[k + '.label'] = '왼쪽 위 뱃지 옆 글자';
    PH[k + '.idNotice'] = '학생증 뒷면 안내 글';
    PH[k + '.idIssued'] = '발급일 (예: 2026.03.02)';
    PH[k + '.idValid'] = '유효기간 (예: 2029.02.28)';
    PH[k + '.wantedPaper'] = '수배지 종이 질감 이미지 변경';
    PH[k + '.galleryEmpty'] = '갤러리가 비었을 때 보여줄 글';
    PH[k + '.relationEmpty'] = '관계가 비었을 때 보여줄 글';
    PH[k + '.bgm'] = '이 페이지 테마곡 파일 · 유튜브 링크';
    PH[k + '.bgmTitle'] = '';
  });
  ['title', 'menu', 'body', 'mono', 'hand', 'sign', 'jet', 'MU'].forEach(function (f) { PH['fonts.' + f] = '구글 폰트 이름(영문)'; });
  PH['owner.label'] = '왼쪽 위 뱃지 옆 글자';
  PH['owner.hint'] = '화면 아래 안내 글';
  PH['owner.image'] = '프로필 사진';
  PH['owner.sd'] = '';
  PH['owner.cardTitle'] = '카드 위쪽 큰 글자';
  PH['owner.number'] = '카드 번호 · 티켓 코드 · 수배지 현상금';
  PH['owner.strap'] = '사원증 카드만 적용';
  PH['owner.backNotice'] = '카드 뒷면 안내 글';
  PH['owner.sign'] = '서명란 텍스트';
  PH['owner.since'] = '';
  PH['owner.valid'] = '';
  PH['owner.about'] = '';
  PH['owner.likeTitle'] = '비우면 LIKE';
  PH['owner.dislikeTitle'] = '비우면 DISLIKE';

  /* 카드 한 장에 들어가는 모든 칸의 기본값 (비어 있으면 사이트는 예전과 똑같이 동작해요) */
  var CARD_DEFAULTS = {
    type: 'id', color: '', subColor: '', textColor: '', cardTitle: '', cardSub: '', image: '', pairImage: '', sd: '', sdSize: '',
    tile: '', tilePosition: 'center 30%', fullBody: '', portraits: ['', '', ''], name: '', nameEn: '', faction: '', spoiler: false, intro: '', tags: [],
    number: '', seat: { gate: '', row: '', seat: '' }, profile: [], quote: '', story: '', gallery: [], relations: [],
    customFront: '', customBack: '', customRatio: '', customRadius: 12, bgm: '', bgmTitle: ''
  };
  var OWNER_DEFAULTS = {
    label: '', hint: '', type: 'id', color: '', subColor: '', textColor: '', strap: '', cardTitle: '', cardSub: '', image: '', sd: '', sdSize: '',
    name: '', nameEn: '', intro: '', number: '', seat: { gate: '', row: '', seat: '' }, tags: [],
    customFront: '', customBack: '', customRatio: '', customRadius: 12, links: [],
    backNotice: '', sign: '', since: '', valid: '', profile: [], about: '', likeTitle: '', likes: [], dislikeTitle: '', dislikes: [], notice: [],
    panelStrength: 0.18,
    banner: { mineTitle: '', siteUrl: '', mine: [], note: '', copyText: '', copiedText: '', friendsTitle: '', friends: [] }
  };
  var PAIR_DEFAULTS = { members: [], pairName: '', pairNameSub: '', titleImage: '', label: '', bgm: '', bgmTitle: '', sides: [], reviews: [], gallery: [], timeline: [], trpg: [] };

  function fillDefaults(o, def) {
    Object.keys(def).forEach(function (k) {
      var d = def[k];
      if (!(k in o)) o[k] = clone(d);
      else if (d && typeof d === 'object' && !Array.isArray(d) && o[k] && typeof o[k] === 'object' && !Array.isArray(o[k])) fillDefaults(o[k], d);
    });
  }
  /* 이미 만들어 둔 캐릭터 · 오너 · 페어 · 메뉴에도 같은 칸이 처음부터 보이게 해요 */
  function ensureDefaults(d) {
    ['characters', 'floormasters', 'others'].forEach(function (k) {
      (d[k] || []).forEach(function (c) { if (c && typeof c === 'object') fillDefaults(c, CARD_DEFAULTS); });
    });
    (d.owner || []).forEach(function (o) { if (o && typeof o === 'object') fillDefaults(o, OWNER_DEFAULTS); });
    (d.pairs || []).forEach(function (p) {
      if (!p || typeof p !== 'object') return;
      fillDefaults(p, PAIR_DEFAULTS);
      (p.sides || []).forEach(function (s) { if (s && typeof s === 'object') fillDefaults(s, { catchphrase: '', desc: '', image: '' }); });
    });
    (d.menus || []).forEach(function (m) { if (m && typeof m === 'object') fillDefaults(m, { left: false }); });
    ['floormasterPage', 'otherPage'].forEach(function (k) { if (d[k] && typeof d[k] === 'object') fillDefaults(d[k], { bgm: '', bgmTitle: '' }); });
    if (d.background && typeof d.background === 'object') fillDefaults(d.background, { width: '' });
  }

  /* ---------- 섹션 틀 ----------
     rows 안의 [a, b, c] 는 "함께 쓰는 항목"이라 세로줄로 이어서 보여줘요.
     when 이 있는 섹션은 그 상태일 때만 나타나요. */
  function cardType(o) { return ['id', 'ticket', 'wanted', 'custom'].indexOf(o.type) > -1 ? o.type : 'id'; }
  var CARD_SECTIONS = [
    { t: '기본 정보', tag: '공통', rows: [['name', 'nameEn'], 'faction', 'spoiler', 'intro', 'tags'] },
    { t: '카드 외형', tag: '공통', rows: ['type', ['color', 'subColor', 'textColor'], ['cardTitle', 'cardSub'], 'number'] },
    { t: '이미지', tag: '공통', rows: [['image', 'pairImage'], ['tile', 'tilePosition'], ['fullBody', 'portraits'], ['sd', 'sdSize']] },
    { t: '상세 프로필', tag: '공통', rows: ['profile', 'quote', 'story'] },
    { t: '갤러리 · 관계', tag: '공통', rows: ['gallery', 'relations'] },
    { t: '테마곡', tag: '선택', rows: [['bgm', 'bgmTitle']] },
    { t: '티켓 카드 전용', tag: '티켓일 때만', when: function (o) { return cardType(o) === 'ticket'; }, rows: ['seat'] },
    { t: '직접 만든 카드 전용', tag: '직접 만든 카드일 때만', when: function (o) { return cardType(o) === 'custom'; },
      rows: [['customFront', 'customBack'], ['customRatio', 'customRadius']] }
  ];
  var PAGE_SECTIONS = [
    { t: '페이지 글자', tag: '공통', rows: ['label', 'tabs', ['galleryEmpty', 'relationEmpty']] },
    { t: '카드 이미지 색', tag: '공통', rows: [['imageTint', 'tintStrength'], 'panelStrength'] },
    { t: 'SD 이미지', tag: '공통', rows: [['sdShow', 'sdSize']] },
    { t: '학생증 / 사원증 뒷면', tag: '학생증 모드에서 표시', rows: ['idNotice', ['idIssued', 'idValid']] },
    { t: '티켓 약관', tag: '티켓 모드에서 표시', rows: ['ticketTerms'] },
    { t: '수배지', tag: '수배지 모드에서 표시', rows: ['wantedPaper'] },
    { t: '페이지 테마곡', tag: '선택', rows: [['bgm', 'bgmTitle']] }
  ];
  var SCHEMA = {
    characters: CARD_SECTIONS, floormasters: CARD_SECTIONS, others: CARD_SECTIONS,
    characterPage: PAGE_SECTIONS, floormasterPage: PAGE_SECTIONS, otherPage: PAGE_SECTIONS,
    owner: [
      { t: '페이지 글자', tag: '공통', rows: ['label', 'hint'] },
      { t: '기본 정보', tag: '공통', rows: [['name', 'nameEn'], 'intro', 'tags'] },
      { t: '카드 외형', tag: '공통', rows: ['type', ['color', 'subColor', 'textColor'], ['cardTitle', 'cardSub'], 'number'] },
      { t: '이미지', tag: '공통', rows: ['image', ['sd', 'sdSize']] },
      { t: '상세 소개', tag: '공통', rows: ['profile', 'about', 'links'] },
      { t: '취향 · 주의사항', tag: '공통', rows: [['likeTitle', 'likes'], ['dislikeTitle', 'dislikes'], 'notice'] },
      { t: '탭 · 배너', tag: '공통', rows: ['tabs', 'panelStrength', 'banner'] },
      { t: '학생증 / 사원증 전용', tag: '학생증일 때만', when: function (o) { return cardType(o) === 'id'; }, rows: ['strap', 'backNotice', ['sign', 'since', 'valid']] },
      { t: '티켓 카드 전용', tag: '티켓일 때만', when: function (o) { return cardType(o) === 'ticket'; }, rows: ['seat'] },
      { t: '직접 만든 카드 전용', tag: '직접 만든 카드일 때만', when: function (o) { return cardType(o) === 'custom'; },
        rows: [['customFront', 'customBack'], ['customRatio', 'customRadius']] }
    ],
    banner: [
      { t: '내 배너', rows: [['mineTitle', 'siteUrl'], 'mine', 'note'] },
      { t: '복사 버튼', rows: [['copyText', 'copiedText']] },
      { t: '친구 링크', rows: [['friendsTitle', 'friends']] }
    ],
    pairs: [
      { t: '페어 기본', tag: '공통', rows: ['members', ['pairName', 'pairNameSub', 'titleImage'], 'label'] },
      { t: '캐릭터 칸', tag: '공통', rows: ['sides'] },
      { t: '리뷰', tag: '공통', rows: ['reviews'] },
      { t: '관계 화면 탭', tag: '공통', rows: ['timeline', 'gallery', 'trpg'] },
      { t: '테마곡', tag: '선택', rows: [['bgm', 'bgmTitle']] }
    ],
    pairPage: [
      { t: '리뷰 목록 글자', tag: '공통', rows: ['label', ['reviewTitle', 'sortText'], ['replyButton', 'emptyText'], 'bestCount'] },
      { t: '관계 화면 글자', tag: '공통', rows: ['relationTabs', ['timelineEmpty', 'galleryEmpty', 'trpgEmpty'], ['logButton', 'logEmpty']] }
    ],
    menus: [
      { t: '메뉴 표시', tag: '공통', rows: [['num', 'title', 'desc'], 'icon'] },
      { t: '이동 · 위치', tag: '공통', rows: [['link', 'newTab'], 'left'] }
    ],
    title: [
      { t: '타이틀', tag: '공통', rows: ['type', 'subText'] },
      { t: '글자 타이틀', tag: '', when: function (o) { return o.type !== 'image'; }, rows: ['text'] },
      { t: '로고 이미지 타이틀', tag: '', when: function (o) { return o.type === 'image'; }, rows: [['image', 'imageWidth']] }
    ],
    deco: [
      { t: '화면 글자', tag: '공통', rows: ['badge', 'topLabel', 'topRight', 'sideText', 'titleTag'] },
      { t: '타이틀 · 소개 블록', tag: '공통', rows: ['titleFrame', 'info'] }
    ],
    bgmPlayer: [
      { t: '플레이어', tag: '공통', rows: ['show', ['autoplay', 'volume']] },
      { t: '기본 BGM', tag: '선택', rows: [['bgm', 'bgmTitle']] }
    ],
    background: [
      { t: '배경 사진', tag: '공통', rows: [['image', 'position', 'width', 'blur']] },
      { t: '스크린 효과', tag: '선택', rows: [['overlay', 'overlayColor', 'overlayStrength']] },
      { t: '아래 그라데이션', tag: '선택', rows: [['fade', 'fadeColor', 'fadeHeight', 'fadeStrength']] },
      { t: '모눈 무늬', tag: '선택', rows: [['grid', 'gridColor', 'gridSize', 'gridLine', 'gridStrength']] },
      { t: '격자 위 이미지', tag: '선택', rows: [['frontImage', 'frontPosition', 'frontWidth', 'frontOpacity']] }
    ],
    colors: [
      { t: '바탕 · 글자', tag: '공통', rows: ['background', 'title', 'subText'] },
      { t: '메뉴', tag: '공통', rows: [['menuBar', 'menuText', 'menuDesc']] },
      { t: '마름모 · 꾸밈', tag: '공통', rows: [['accent', 'accentText'], 'icon', 'dots', 'deco'] }
    ],
    fonts: [
      { t: '제목', tag: '공통', rows: [['title', 'titleWeight']] },
      { t: '본문 · 기타', tag: '공통', rows: ['menu', 'body', 'mono', 'hand'] }
    ],
    guest: [
      { t: '기본 글자', tag: '공통', rows: ['label', 'mode', 'title', 'intro', ['ownerName', 'ownerImage']] },
      { t: '구글 폼 / Firebase 방식', tag: 'form · firebase 방식일 때만', when: function (o) { var m = o.mode || 'form'; return m === 'form' || m === 'firebase'; }, rows: ['form'] },
      { t: '외부 위젯 방식', tag: 'widget 방식일 때만', when: function (o) { return o.mode === 'widget'; }, rows: ['widget'] },
      { t: '익명 질문 링크', tag: '공통', rows: ['links'] },
      { t: '예시 글', tag: '선택', rows: ['sample'] }
    ],
    /* 아래는 작은 목록 항목 : 제목 없이 세로줄 묶음만 */
    gallery: [{ rows: [['image', 'caption']] }],
    relations: [{ rows: [['name', 'label'], 'text', ['image', 'link']] }],
    timeline: [{ rows: [['date', 'title'], 'text', 'image'] }],
    trpg: [{ rows: [['title', 'system', 'date', 'role'], 'text', ['file', 'link']] }],
    reviews: [{ rows: [['from', 'to', 'call'], 'review', ['likes', 'date'], 'replies'] }],
    sides: [{ rows: [['catchphrase', 'desc'], 'image'] }],
    links: [{ rows: [['label', 'text', 'desc', 'url']] }],
    mine: [{ rows: [['image', 'size']] }],
    friends: [{ rows: [['name', 'image', 'url']] }],
    seat: [{ rows: [['gate', 'row', 'seat']] }],
    info: [{ rows: [['show', 'heading', 'text']] }]
  };
  /* 토글 상자 없이 제목 + 세로줄로 바로 펼쳐 보여줄 객체 */
  var INLINE = { seat: 1, info: 1 };

  var S = (typeof SITE !== 'undefined') ? SITE : (window.SITE || {});
  var st = { user: null, fb: null, draft: null, dirty: false, tab: null, root: null, view: 'site', busy: false,
             preview: window.innerWidth >= 1000, pvMobile: false, pvFrame: null, pvBody: null, pvRoute: '', pvTimer: null, pvN: 0 };
  /* 편집 탭 → 미리보기에서 보여줄 화면 */
  var TAB_ROUTE = { themeColor: '', pageTitle: '', title: '', menus: '', deco: '', bgmPlayer: '', colors: '', background: '', fonts: '',
                    characterPage: 'character', characters: 'character', floormasterPage: 'floormaster', floormasters: 'floormaster',otherPage: 'other', others: 'other', pairPage: 'pair', pairs: 'pair',
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
    var routes = [['', '메인'], ['character', 'Character'], ['floormaster', 'Floormaster'], ['other', 'Other'], ['pair', 'Pair'], ['owner', 'Owner'], ['guest', 'Guest']];
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
      '.oha-split{display:flex;height:calc(100vh - var(--oha-top,58px))}.oha-ed{flex:1 1 46%;min-width:380px;overflow:auto}' +
      '.oha-split .oha-main{grid-template-columns:140px 1fr;max-width:none;margin:12px;padding:0}' +
      '.oha-split .oha-nav{top:12px}' +
      '.oha-pv{flex:1 1 54%;min-width:0;display:flex;flex-direction:column;border-right:1px solid #ccc;background:#e4e4e4}' +
      '.oha-pvbar{display:flex;gap:8px;align-items:center;padding:8px 10px;background:#fff;border-bottom:1px solid #ddd}' +
      '.oha-pvbody{flex:1;position:relative;overflow:hidden}' +
      '.oha-pvbody iframe{position:absolute;left:0;top:0;border:0;background:#fff;transform-origin:0 0;box-shadow:0 0 0 1px #ccc}' +
      '@media(max-width:999px){.oha-split{flex-direction:column;height:auto}.oha-pv{height:60vh}.oha-ed{overflow:visible}' +
      '.oha-split .oha-snip-wrap{top:var(--oha-top,58px)}.oha-split .oha-nav{top:calc(var(--oha-top,58px) + var(--oha-snip,104px) + 12px)}}' +
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
      '.oha-obj{display:block}' +
      '.oha-sec{margin:0 0 18px}.oha-sec.is-bare{margin:0 0 8px}' +
      '.oha-sec-h{display:flex;align-items:center;gap:8px;margin:0 0 4px;padding:0 0 6px;border-bottom:2px solid #e4e4e8}' +
      '.oha-sec-h b{font-size:16px;color:#222}' +
      '.oha-pill{font-size:11px;font-weight:700;line-height:1.6;padding:0 8px;border-radius:999px;background:#ececf0;color:#666}' +
      '.oha-pill.is-cond{background:' + point + ';color:#fff}' +
      '.oha-subhead{font-weight:700;font-size:12px;color:#555;margin:8px 0 2px}' +
      '.oha-link{position:relative;margin:8px 0;padding-left:16px}' +
      '.oha-link::before{content:"";position:absolute;left:3px;top:18px;bottom:18px;width:2px;border-radius:2px;background:' + point + ';opacity:.55}' +
      '.oha-link>.oha-row{position:relative;margin:6px 0}' +
      '.oha-link>.oha-row::before{content:"";position:absolute;left:-16px;top:13px;width:8px;height:8px;border-radius:50%;background:' + point + ';box-shadow:0 0 0 2px #fff}' +
      '.oha-link>details.oha-box{margin:6px 0}' +
      'details.oha-box{padding:0;background:#f3f3f3;border:1px solid #cfcfd6;overflow:hidden}' +
      'details.oha-box details.oha-box{background:#eeeef1}' +
      'details.oha-box>summary{list-style:none;padding:9px 12px;user-select:none}' +
      'details.oha-box>summary::-webkit-details-marker{display:none}' +
      'details.oha-box>summary:hover{background:rgba(0,0,0,.04)}' +
      "details.oha-box>summary::before{content:\"\";flex:none;width:20px;height:20px;border-radius:6px;border:1px solid #bdbdc6;background:#fff center/12px no-repeat url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23444' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>\");transform:rotate(-90deg);transition:transform .15s}" +
      'details.oha-box[open]>summary::before{transform:none}' +
      'details.oha-box[open]>summary{border-bottom:1px solid #d3d3da}' +
      'details.oha-box>:not(summary){margin-left:12px;margin-right:12px}' +
      'details.oha-box>summary+*{margin-top:10px}details.oha-box>:last-child{margin-bottom:12px}' +
      '.oha-icobtn{width:36px;height:36px;flex:none;padding:0;display:inline-grid;place-items:center;border-radius:8px}' +
      '.oha-icobtn svg{width:18px;height:18px}' +
      '.oha-icobtn.is-busy svg{animation:oha-spin .8s linear infinite}@keyframes oha-spin{to{transform:rotate(360deg)}}' +
      '.oha-snip-wrap{position:sticky;top:var(--oha-top,58px);z-index:4;background:#f6f6f6;border-bottom:1px solid #ddd;box-shadow:0 2px 6px rgba(0,0,0,.05)}' +
      '.oha-snip{display:flex;align-items:center;gap:12px;max-width:1200px;margin:0 auto;padding:8px 18px}' +
      '.oha-split .oha-snip-wrap{top:0}.oha-split .oha-snip{max-width:none;padding:8px 12px}' +
      '.oha-snip-l{flex:none;display:flex;flex-direction:column;line-height:1.25}' +
      '.oha-snip-l b{font-size:12px}.oha-snip-l small{font-size:11px;color:#777}' +
      '.oha-snip-b{display:flex;flex-wrap:wrap;flex:1;min-width:0;gap:6px;padding:2px 0}' +
      '.oha-snipbtn{flex:none;display:inline-flex;align-items:center;gap:5px;border:1px solid #ccc;background:#fff;border-radius:8px;padding:6px 10px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;white-space:nowrap;color:#222}' +
      '.oha-snipbtn:hover{border-color:' + point + '}.oha-snipbtn:active{transform:translateY(1px)}' +
      '.oha-snipbtn .k{font-style:normal;display:inline-grid;place-items:center;min-width:18px;height:18px;border-radius:4px;background:#ececf0;font-size:11px}' +
      '.oha-ico{width:26px;height:26px;padding:0;display:inline-grid;place-items:center;flex:none;color:#444}' +
      '.oha-ico svg{width:14px;height:14px}.oha-ico[disabled]{opacity:.3;cursor:default}' +
      '.oha-ico.is-del:hover:not([disabled]){border-color:#b3261e;color:#b3261e;background:#fdeceb}' +
      '.oha-grip{cursor:grab;background:#fff;border:1px solid #ccc;border-radius:6px}.oha-grip:active{cursor:grabbing}' +
      '.oha-li{position:relative;margin:6px 0}.oha-img.oha-li{align-items:center}' +
      '.oha-li.is-dragging{opacity:.4}' +
      '.oha-li.drop-before{box-shadow:0 -3px 0 0 ' + point + '}.oha-li.drop-after{box-shadow:0 3px 0 0 ' + point + '}' +
      '.oha-snip-b.is-two{align-content:center}' +
      '#oha.is-editor{display:flex;flex-direction:column;overflow:hidden}' +
      '#oha.is-editor>.oha-top,#oha.is-editor .oha-snip-wrap{flex:none;position:relative;top:auto}' +
      '#oha.is-editor .oha-main{flex:1;min-height:0;width:100%;margin:12px auto;grid-template-rows:minmax(0,1fr)}' +
      '#oha.is-editor .oha-nav{position:static;align-self:stretch;min-height:0;overflow-y:auto}' +
      '#oha.is-editor .oha-panel{min-height:0;overflow-y:auto}' +
      '#oha.is-editor .oha-split{flex:1;min-height:0;height:auto}' +
      '#oha.is-editor .oha-ed{display:flex;flex-direction:column;min-height:0;overflow:hidden}' +
      '#oha.is-editor .oha-split .oha-main{margin:12px;width:auto}' +
      '@media(max-width:999px){#oha.is-editor .oha-split{flex-direction:column}#oha.is-editor .oha-pv{flex:none;height:35vh}#oha.is-editor .oha-ed{flex:1;min-width:0}}' +
      '@media(max-width:760px){#oha.is-editor .oha-main{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}#oha.is-editor .oha-nav{flex-direction:row;flex-wrap:wrap;max-height:30vh}}' +
      '.oha-nav{z-index:3;top:calc(var(--oha-top,58px) + var(--oha-snip,104px) + 12px)}.oha-split .oha-nav{top:calc(var(--oha-snip,104px) + 12px)}' +
      '.oha-hl{isolation:isolate}' +
      '.oha-hl{position:relative;background:#fff;border:1px solid #ccc;border-radius:8px}' +
      '.oha-hl:focus-within{border-color:' + point + '}' +
      '.oha-hl pre,.oha-hl textarea{margin:0;padding:8px 10px;border:0;box-sizing:border-box;font:13px/1.65 ui-monospace,Menlo,Consolas,"Noto Sans KR",monospace;letter-spacing:0;white-space:pre-wrap;overflow-wrap:break-word;word-break:normal;tab-size:2;overflow:auto;scrollbar-gutter:stable}' +
      '.oha-hl pre{position:absolute;inset:0;color:#111;pointer-events:none;scrollbar-color:transparent transparent}' +
      '.oha-hl pre::-webkit-scrollbar-thumb,.oha-hl pre::-webkit-scrollbar-track{background:transparent}' +
      '.oha-hl textarea{position:relative;z-index:1;display:block;width:100%;min-height:76px;resize:none;outline:none;background:transparent;color:transparent;-webkit-text-fill-color:transparent;caret-color:#111}' +
      '.oha-hl textarea::selection{background:rgba(60,120,255,.28)}' +
      '.oha-hl textarea::placeholder{color:#999;-webkit-text-fill-color:#999}' +
      '.oha-hl.is-one textarea{min-height:0;overflow:hidden;scrollbar-gutter:auto}.oha-hl.is-one pre{overflow:hidden;scrollbar-gutter:auto}' +
      '.oha-hl.is-nowrap pre,.oha-hl.is-nowrap textarea{white-space:pre;overflow-wrap:normal;word-break:normal;overflow:hidden}' +
      '.oha-hl.is-fill{height:100%}.oha-hl.is-fill textarea{height:100%}' +
      '.hl-t{color:#aeaeb8}.hl-l{color:#0b66d6;text-decoration:underline}' +
      '.oha-xrow{display:flex;gap:8px;align-items:center;margin-top:4px}.oha-xs{padding:4px 10px;font-size:12px}' +
      '.oha-legend{font-size:11px;color:#777}' +
      '.oha-pop{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:2vh 2vw}' +
      '.oha-pop-panel{display:flex;flex-direction:column;width:min(1500px,100%);height:100%;background:#f6f6f6;border-radius:14px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35)}' +
      '.oha-pop-head{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#fff;border-bottom:1px solid #ddd}.oha-pop-head h3{margin:0;font-size:15px}' +
      '.oha-pop .oha-snip-wrap{position:static}.oha-pop .oha-snip{max-width:none;padding:8px 16px}' +
      '.oha-pop-body{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px}' +
      '.oha-pop-col{display:flex;flex-direction:column;min-height:0;min-width:0;background:#fff;border:1px solid #ddd;border-radius:10px;overflow:hidden}' +
      '.oha-pop-col>header{flex:none;padding:8px 12px;font-size:12px;font-weight:700;color:#555;border-bottom:1px solid #eee;background:#fafafa}' +
      '.oha-pop-col .oha-hl{flex:1;min-height:0;border:0;border-radius:0}' +
      '.oha-pop-col>header.has-tg{display:flex;align-items:center;gap:10px}.oha-pop-col>header small{font-weight:400;color:#999}' +
      '.oha-linkmenu{position:fixed;z-index:100002;display:flex;gap:6px;padding:6px;background:#fff;border:1px solid #ccc;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18)}' +
      '.oha-lm{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:62px;padding:8px 10px;border:1px solid #e2e2e2;border-radius:8px;background:#fafafa;font:600 11px inherit;color:#222;cursor:pointer}' +
      '.oha-lm:hover{border-color:' + point + ';background:#fff}.oha-lm svg{width:20px;height:20px}' +
      '.oha-linkmenu.is-list{flex-direction:column;gap:3px;min-width:200px;max-height:300px;overflow-y:auto}' +
      '.oha-linkmenu.is-list .oha-lm{flex-direction:row;justify-content:flex-start;gap:8px;width:100%;min-width:0;padding:7px 10px;font-size:12px;text-align:left}' +
      '.oha-seg{margin-left:auto;display:inline-flex;border:1px solid #ccc;border-radius:999px;overflow:hidden;background:#fff}' +
      '.oha-seg button{border:0;background:transparent;padding:3px 14px;font:600 12px inherit;cursor:pointer;color:#555}' +
      '.oha-seg button.is-on{background:' + point + ';color:#fff}' +
      '.oha-pop-pvin.dt-story{flex:1;margin:0;opacity:1;overflow:auto;padding:16px 18px;color:#222}.oha-pop-pvin img{max-width:100%;height:auto}' +
      '@media(max-width:760px){.oha-pop-body{grid-template-columns:1fr;grid-template-rows:1fr 1fr}}' +
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

  /* ==========================================================
     코드 구분 입력칸 (회색 = 태그 코드, 파랑 = 링크 / 이미지 주소, 검정 = 본문)
     + 크게 편집 팝업 (왼쪽 미리보기 / 오른쪽 편집 / 위에 코드 버튼 바)
     ========================================================== */
  var HL_RE = /(<\/?[a-zA-Z][^>]*>?)|(https?:\/\/[^\s<>"']+)|(\b[\w\-.\/%]+\.(?:png|jpe?g|gif|webp|svg|bmp|mp3|ogg|wav|html?)\b)/gi;
  var LINK_RE = /(https?:\/\/[^\s<>"']+|[\w\-.\/%]+\.(?:png|jpe?g|gif|webp|svg|bmp|mp3|ogg|wav|html?)\b)/gi;
  function escH(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function hlTag(raw) {
    var out = '', last = 0, m;
    LINK_RE.lastIndex = 0;
    while ((m = LINK_RE.exec(raw))) {
      out += escH(raw.slice(last, m.index)) + '<span class="hl-l">' + escH(m[0]) + '</span>';
      last = m.index + m[0].length;
    }
    return '<span class="hl-t">' + out + escH(raw.slice(last)) + '</span>';
  }
  function highlight(v) {
    var out = '', last = 0, m;
    HL_RE.lastIndex = 0;
    while ((m = HL_RE.exec(v))) {
      if (!m[0].length) { HL_RE.lastIndex++; continue; }
      out += escH(v.slice(last, m.index));
      out += m[1] ? hlTag(m[1]) : '<span class="hl-l">' + escH(m[0]) + '</span>';
      last = m.index + m[0].length;
    }
    out += escH(v.slice(last));
    if (/\n$/.test(v)) out += ' ';
    return out;
  }

  /* 글자는 투명한 textarea, 색은 뒤에 깔린 <pre> 가 보여줘요 (두 층이 정확히 겹쳐요) */
  function hlArea(value, onChange, opt) {
    opt = opt || {};
    var pre = h('pre', { class: 'oha-hl-pre', 'aria-hidden': 'true' });
    var ta = h('textarea', { spellcheck: 'false', rows: opt.one ? '1' : null });
    ta.value = value;
    var box = h('div', { class: 'oha-hl' + (opt.fill ? ' is-fill' : '') + (opt.one ? ' is-one' : '') + (opt.nowrap ? ' is-nowrap' : '') }, [pre, ta]);
    var lastW = -1;
    function paint() { pre.innerHTML = highlight(ta.value); pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; }
    function fit() {
      if (opt.fill) return;
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, opt.max || 260) + 'px';
    }
    function refresh() { fit(); paint(); }
    ta.addEventListener('input', function () {
      if (opt.one && /[\r\n]/.test(ta.value)) {          /* 한 줄 칸: 붙여넣은 줄바꿈은 띄어쓰기로 */
        var p = ta.selectionStart;
        ta.value = ta.value.replace(/[\r\n]+/g, ' ');
        ta.setSelectionRange(p, p);
      }
      refresh(); if (onChange) onChange(ta.value);
    });
    if (opt.one) ta.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });   /* 한 줄 칸: 엔터 막기 */
    ta.addEventListener('scroll', function () { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; });
    /* 엔터 = <br> 자동 입력 (Shift+Enter 는 그냥 줄바꿈 / 태그 안쪽 · 목록 같은 블록 태그 바로 뒤에서는 넣지 않아요) */
    function insertAt(t) {
      ta.focus();
      if (!document.execCommand || !document.execCommand('insertText', false, t)) {
        ta.setRangeText(t, ta.selectionStart, ta.selectionEnd, 'end');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    if (opt.autoBr) {
      ta.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' || e.shiftKey || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
        var before = ta.value.slice(0, ta.selectionStart);
        if (before.lastIndexOf('<') > before.lastIndexOf('>')) return;
        if (/<\/?(?:ul|ol|li|details|summary|div|p|h[1-6])\b[^>]*>\s*$/i.test(before)) return;
        e.preventDefault();
        insertAt('<br>\n');
      });
      ta.addEventListener('paste', function (e) {          /* 이미 쓴 글을 붙여넣어도 엔터 친 곳마다 <br> 가 붙어요 */
        var t = e.clipboardData && e.clipboardData.getData('text');
        if (!t || !/\n/.test(t)) return;
        var before = ta.value.slice(0, ta.selectionStart);
        if (before.lastIndexOf('<') > before.lastIndexOf('>')) return;   /* 태그 안쪽에 붙여넣을 땐 그대로 */
        var BLOCK = /<\/?(?:ul|ol|li|details|summary|div|p|h[1-6])\b[^>]*>\s*$/i;
        var lines = t.replace(/\r\n?/g, '\n').split('\n'), prevBlock = false;
        var out = lines.map(function (ln, i) {
          if (i === lines.length - 1) return ln;                       /* 마지막 줄은 뒤에 이어지는 글과 붙어요 */
          var tr = ln.replace(/\s+$/, '');
          var isBlock = BLOCK.test(tr);
          var skip = /<br\s*\/?>$/i.test(tr) || isBlock || (tr === '' && prevBlock);   /* 이미 <br> 가 있거나 블록 태그 뒤면 줄바꿈만 */
          prevBlock = isBlock || (tr === '' && prevBlock);
          return ln + (skip ? '' : '<br>');
        }).join('\n');
        e.preventDefault();
        insertAt(out);
      });
    }
    paint();
    setTimeout(refresh, 0);
    if (window.ResizeObserver) {                       /* 접혀 있던 칸이 펼쳐질 때 / 너비가 바뀔 때 다시 맞춰요 */
      new ResizeObserver(function () {
        var w = box.clientWidth;
        if (w && w !== lastW) { lastW = w; refresh(); }
      }).observe(box);
    }
    return { el: box, ta: ta, refresh: refresh };
  }

  /* 크게 편집 : 왼쪽 미리보기 / 오른쪽 편집 */
  function openEditor(label, hl, set, autoBr, ctx) {
    var old = $('.oha-pop'); if (old) old.remove();
    var pvIn = h('div', { class: 'oha-pop-pvin dt-story' });
    /* 설정 글(story)은 사이트와 똑같이 카드 모드(전신 일러스트 2단) / 전신 모드(글만) 로 골라서 볼 수 있어요 */
    var view = st.storyView || 'card';
    function paintPv(v) {
      if (!ctx) { pvIn.innerHTML = v; return; }
      if (view === 'card' && ctx.fullBody) {
        var tmp = document.createElement('div'), toggles = [];
        tmp.innerHTML = v || '';
        [].forEach.call(tmp.querySelectorAll('details.tg'), function (d) {
          if (d.parentElement && d.parentElement.closest('details.tg')) return;
          toggles.push(d.outerHTML); d.remove();
        });
        pvIn.innerHTML = '<div class="dt-story dt-story-art"><div>' + tmp.innerHTML + '</div><img src="' + escH(ctx.fullBody) + '" alt=""></div>' +
          (toggles.length ? '<div class="dt-story dt-story-tg">' + toggles.join('') + '</div>' : '');
      } else pvIn.innerHTML = v;
    }
    var area = hlArea(hl.ta.value, function (v) {
      hl.ta.value = v; hl.refresh();                   /* 원래 칸 · 저장할 값 · 미리보기에 바로 반영 */
      set(v); touch();
      paintPv(v);
    }, { fill: true, autoBr: autoBr });
    paintPv(area.ta.value);

    function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
    function close() { pop.remove(); document.removeEventListener('keydown', onKey, true); hl.refresh(); }
    document.addEventListener('keydown', onKey, true);

    var closeBtn = h('button', { class: 'oha-btn is-main', type: 'button', text: '닫기' });
    closeBtn.onclick = close;
    var legend = h('span', { class: 'oha-legend' });
    legend.innerHTML = '<span class="hl-t">&lt;회색&gt;</span> 코드 · <span class="hl-l">파랑</span> 링크 · 검정 본문';
    var head = h('div', { class: 'oha-pop-head' }, [h('h3', { text: label + ' 편집' }), legend, h('span', { class: 'oha-sp' }), closeBtn]);
    var bar = snipBar(function () { return area.ta; });
    var pvHead = h('header', { text: '미리보기 (실제 사이트 표시)' });
    if (ctx) {
      pvHead.className = 'has-tg';
      if (!ctx.fullBody) pvHead.appendChild(h('small', { text: '전신 일러스트가 없으면 두 모드가 같아요' }));
      var seg = h('div', { class: 'oha-seg', role: 'group', 'aria-label': '보기 모드' });
      [['card', '카드 모드'], ['full', '전신 모드']].forEach(function (m) {
        var b = h('button', { type: 'button', text: m[1] });
        b.classList.toggle('is-on', view === m[0]);
        b.onclick = function () {
          view = st.storyView = m[0];
          [].forEach.call(seg.children, function (x, i) { x.classList.toggle('is-on', ['card', 'full'][i] === view); });
          paintPv(area.ta.value);
        };
        seg.appendChild(b);
      });
      pvHead.appendChild(seg);
    }
    var left = h('div', { class: 'oha-pop-col' }, [pvHead, pvIn]);
    var right = h('div', { class: 'oha-pop-col' }, [h('header', { text: '편집' }), area.el]);
    var pop = h('div', { class: 'oha-pop' }, [h('div', { class: 'oha-pop-panel' }, [head, bar, h('div', { class: 'oha-pop-body' }, [left, right])])]);
    st.root.appendChild(pop);
    area.refresh();
    area.ta.focus();
  }

  function stringEd(val, set, key, pkey, obj) {
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
      var phc = PH[pkey + '.' + key] || PH[key] || '#222222  (비우면 자동)';
      var txt = h('input', { class: 'oha-in', type: 'text', placeholder: phc }); txt.value = val;
      var pick = h('input', { type: 'color', style: 'width:44px;height:36px;padding:0;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer' });
      function hex6(s) { s = String(s || '').trim(); if (/^#[0-9a-f]{3}$/i.test(s)) s = '#' + s.slice(1).replace(/./g, '$&$&'); return /^#[0-9a-f]{6}$/i.test(s) ? s : '#ffffff'; }
      pick.value = hex6(val);
      pick.oninput = function () { txt.value = pick.value; set(pick.value); touch(); };
      txt.oninput = function () { set(txt.value); touch(); pick.value = hex6(txt.value); };
      var clr = h('button', { class: 'oha-btn oha-icobtn is-bad', type: 'button', title: '비우기', 'aria-label': '비우기' }); clr.innerHTML = ICON_TRASH;
      clr.onclick = function () { txt.value = ''; set(''); touch(); };
      wrap.appendChild(h('div', { class: 'oha-img oha-color' }, [pick, txt, clr]));
      return wrap;
    }
    var isImg = !!(IMAGE_KEYS[key] || IMAGE_KEYS[pkey]);
    var long = LONG_KEYS[key] || (key === 'value' && pkey === 'profile') || String(val).indexOf('\n') >= 0;
    if (long && !isImg) {
      var autoBr = key !== 'code' && key !== 'message';
      var hl = hlArea(val, function (v) { set(v); touch(); }, { autoBr: autoBr });
      var phl = PH[pkey + '.' + key] || PH[key]; if (phl) hl.ta.placeholder = phl;
      var ex = h('button', { class: 'oha-btn oha-xs', type: 'button', text: '⤢ 크게 편집 · 미리보기' });
      var ctx = (key === 'story' && obj && /^(characters|floormasters|others)$/.test(pkey)) ? obj : null;
      ex.onclick = function () { openEditor(LABEL[key] || key, hl, set, autoBr, ctx); };
      var lg = h('span', { class: 'oha-legend' });
      lg.innerHTML = '<span class="hl-t">회색</span> 코드 · <span class="hl-l">파랑</span> 링크';
      wrap.appendChild(hl.el);
      wrap.appendChild(h('div', { class: 'oha-xrow' }, [ex, lg]));
      return wrap;
    }
    /* 일반 입력칸도 코드(회색) · 링크(파랑) · 본문(검정) 색으로 구분해요 */
    var hl1 = hlArea(val, function (v) { set(v); touch(); if (prev) prev.src = v; }, { one: !long, nowrap: isImg && !long });   /* 이미지 · 음악 주소 칸은 줄바꿈 없이 한 줄 높이 그대로 */
    var inp = hl1.ta;
    var ph = PH[pkey + '.' + key] || PH[key]; if (ph) inp.placeholder = ph;
    var prev = null;
    if (isImg) {
      prev = h('img', { alt: '' }); prev.src = val || '';
      prev.onerror = function () { prev.style.visibility = 'hidden'; };
      prev.onload = function () { prev.style.visibility = 'visible'; };
      var file = h('input', { type: 'file', accept: 'image/*,audio/*', hidden: 'hidden' });
      var up = h('button', { class: 'oha-btn oha-icobtn', type: 'button', title: '이미지 · 음악 올리기', 'aria-label': '올리기' }); up.innerHTML = ICON_UP;
      up.onclick = function () { file.click(); };
      file.onchange = function () {
        var f = file.files[0]; if (!f) return;
        up.innerHTML = ICON_BUSY; up.classList.add('is-busy'); up.disabled = true;
        upload(f).then(function (url) {
          inp.value = url; hl1.refresh(); set(url); touch(); prev.src = url; toast('올렸어요. 저장을 눌러 주세요.');
        }).catch(function (e) { toast('올리지 못했어요: ' + (e.message || e), true); })
          .then(function () { up.innerHTML = ICON_UP; up.classList.remove('is-busy'); up.disabled = false; file.value = ''; });
      };
      hl1.el.style.cssText = 'flex:1;min-width:0';
      var row = h('div', { class: 'oha-img' }, [prev, hl1.el, up, file]);
      wrap.appendChild(row);
    } else wrap.appendChild(hl1.el);
    return wrap;
  }

  function valueEd(val, set, key, pkey, obj) {
    if (Array.isArray(val)) return arrayEd(val, key, pkey);
    if (val && typeof val === 'object') return objectEd(val, key);
    if (typeof val === 'boolean') {
      var c = h('input', { type: 'checkbox' }); c.checked = val;
      c.onchange = function () { set(c.checked); touch(); };
      return h('label', null, [c, ' ' + (BOOL_TEXT[key] || '사용')]);
    }
        if ((typeof val === 'number' || isFRef(val) || isORef(val)) && (key === 'from' || key === 'to' || key === 'link' || key === 'members')) {
      /* 캐릭터 번호 칸 : 이름을 보며 고르기 */
      var cs = chars(), fs = floors(), os = others();
      var opts = (key === 'link' ? [h('option', { value: '0', text: '연결 안 함' })] : [])
        .concat(cs.map(function (c, i) { return h('option', { value: String(i + 1), text: (i + 1) + '번 · ' + (c.name || '(이름 없음)') }); }))
        .concat(fs.map(function (c, i) { return h('option', { value: 'F' + (i + 1), text: 'F' + (i + 1) + ' · ' + (c.name || '(이름 없음)') }); }))
        .concat(os.map(function (c, i) { return h('option', { value: 'O' + (i + 1), text: 'O' + (i + 1) + ' · ' + (c.name || '(이름 없음)') }); }));
      var rs = h('select', { class: 'oha-in' }, opts);
      var cur = (isFRef(val) || isORef(val)) ? String(val).toUpperCase() : String(val);
      if (!rs.querySelector('option[value="' + cur + '"]')) rs.appendChild(h('option', { value: cur, text: cur + ' (없는 캐릭터)' }));
      rs.value = cur;
      rs.onchange = function () { set(/^[FO]/.test(rs.value) ? rs.value : Number(rs.value)); touch(); };
      return rs;
    }
    if (typeof val === 'number') {
      var n = h('input', { class: 'oha-in', type: 'number', step: 'any' }); n.value = val;
      var phn = PH[pkey + '.' + key] || PH[key]; if (phn) n.placeholder = phn;
      n.oninput = function () { set(n.value === '' ? 0 : Number(n.value)); touch(); };
      return n;
    }
    return stringEd(val == null ? '' : String(val), set, key, pkey, obj);
  }

  /* ==========================================================
     "+ 추가" 메뉴의 틀(템플릿) + 캐릭터 번호(순서) 자동 정리
     ========================================================== */
  function chars() { return (st.draft && st.draft.characters) || []; }
  function allChars() { return ((st.draft && st.draft.characters) || []).concat((st.draft && st.draft.floormasters) || [], (st.draft && st.draft.others) || []); }
  function floors() { return (st.draft && st.draft.floormasters) || []; }
  function others() { return (st.draft && st.draft.others) || []; }
  function isFRef(v) { return typeof v === 'string' && /^F\d+$/i.test(v); }
  function isORef(v) { return typeof v === 'string' && /^O\d+$/i.test(v); }
  
  function charName(n) { var c = allChars()[n - 1]; return c ? (c.name || '(이름 없음)') : ''; }

  function profileRows(labels) { return labels.map(function (l) { return { label: l, value: '' }; }); }
  function cardTpl(type) {
    var base = { type: type, color: '', subColor: '', textColor: '', cardTitle: '', cardSub: '', image: '', sd: '', tile: '',
      tilePosition: 'center 30%', fullBody: '', portraits: ['', '', ''], name: '', nameEn: '', faction: '', intro: '', tags: [], number: '' };
    var tail = { quote: '', story: '', gallery: [], relations: [], bgm: '', bgmTitle: '' };
    var x;
    if (type === 'id') x = { cardTitle: 'STUDENT ID', cardSub: '', number: '0001', profile: profileRows(['나이', '키', '생일', '좋아하는 것', '싫어하는 것']) };
    if (type === 'ticket') x = { cardTitle: 'LIVE CONCERT', cardSub: 'WORLD TOUR', seat: { gate: 'A', row: '01', seat: '01' }, number: '', profile: profileRows(['공연일', '공연장', '나이', '키']) };
    if (type === 'wanted') x = { cardTitle: 'WANTED', cardSub: 'DEAD OR ALIVE', number: '$0.00', profile: profileRows(['나이', '출신', '최근 목격', '별명', '죄목', '직업']) };
    if (type === 'custom') x = { customFront: '', customBack: '', customRatio: '', customRadius: 12, cardTitle: 'MY CARD', number: '', profile: profileRows(['나이', '키']) };
    var o = {}; [base, x, tail].forEach(function (src) { Object.keys(src).forEach(function (k) { o[k] = src[k]; }); });
    fillDefaults(o, CARD_DEFAULTS);
    return o;
  }
    function ownerTpl(type) {
    var o = { type: type, color: '', subColor: '', textColor: '', strap: 'Blue Hour', cardTitle: 'OWNER ID', cardSub: '', image: '', sd: '',
              name: '', nameEn: 'OWNER', intro: '', number: '0001', seat: { gate: 'A', row: '01', seat: '01' }, tags: [],
              customFront: '', customBack: '', customRatio: '', customRadius: 12,
              links: [{ label: 'X', text: '', url: '' }],
              backNotice: '', sign: '', since: '', valid: '',
              profile: profileRows(['활동명', '생일', '주 장르', '연락']), about: '',
              likeTitle: 'LIKE', likes: [], dislikeTitle: 'DISLIKE', dislikes: [], notice: [], panelStrength: 0.18,
              banner: { mineTitle: 'MY BANNER', siteUrl: '', mine: [{ image: '', size: '200 × 40' }], note: '', copyText: 'COPY', copiedText: 'COPIED!', friendsTitle: 'LINK', friends: [] } };
    if (type === 'ticket') { o.cardTitle = 'OWNER TICKET'; o.strap = false; }
    if (type === 'wanted') { o.cardTitle = 'WANTED'; o.strap = false; o.number = '$0.00'; }
    if (type === 'custom') { o.cardTitle = 'MY CARD'; o.strap = false; }
    fillDefaults(o, OWNER_DEFAULTS);
    return o;
  }
  function pairTpl(n) {
    var m = []; for (var i = 1; i <= n && i <= allChars().length; i++) m.push(i);
    var sides = m.map(function () { return { catchphrase: '', desc: '', image: '' }; });
    return { members: m, pairName: '', pairNameSub: '', titleImage: '', label: '', bgm: '', bgmTitle: '', sides: sides, reviews: [], gallery: [], timeline: [], trpg: [] };
  }
  var LIST_TPL = {
    gallery: { image: '', caption: '' }, relations: { name: '', label: '', text: '', image: '', link: 0 },
    profile: { label: '', value: '' }, reviews: { from: 1, to: 2, call: '', review: '', likes: 0, date: '', replies: [] },
    timeline: { date: '', title: '', text: '', image: '' },
    trpg: { title: '', system: 'CoC 7th', date: '', role: '', text: '', file: '', link: '' },
    sides: { catchphrase: '', desc: '', image: '' }, mine: { image: '', size: '200 × 40' }, friends: { name: '', image: '', url: '' }
  };

  function templatesFor(key, pkey) {
    if ((key === 'characters' || key === 'floormasters' || key === 'others')  && !pkey) return [
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
        if (key === 'owner' && !pkey) return [
      { name: '학생증 / 사원증 카드', desc: '목걸이 줄 + 링크 칩이 있는 카드', value: ownerTpl('id') },
      { name: '공연 티켓 카드', desc: '가로형 티켓 (좌석 정보 포함)', value: ownerTpl('ticket') },
      { name: '수배지 카드', desc: '수배지 + 현상금', value: ownerTpl('wanted') },
      { name: '직접 만든 카드', desc: '앞면 · 뒷면 이미지를 직접 넣어요', value: ownerTpl('custom') }
    ];
    if (key === 'menus') return [
      { name: '캐릭터 메뉴', desc: '#character', value: { num: '', title: 'Character', desc: '캐릭터 소개', link: '#character', icon: '', newTab: false, left: false } },
      { name: '페어 메뉴', desc: '#pair', value: { num: '', title: 'Pair', desc: '페어 소개', link: '#pair', icon: '', newTab: false, left: false } },
      { name: '오너 메뉴', desc: '#owner', value: { num: '', title: 'Owner', desc: '오너 소개', link: '#owner', icon: '', newTab: false, left: false } },
      { name: '방명록 메뉴', desc: '#guest', value: { num: '', title: 'Guest', desc: '방명록', link: '#guest', icon: '', newTab: false, left: false } },
      { name: '다른 사이트 링크', desc: '새 탭으로 열려요', value: { num: '', title: '', desc: '', link: 'https://', icon: '', newTab: true, left: false } }
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
    chars().concat(floors(), others()).forEach(function (c) { (c.relations || []).forEach(function (r) { if (r.link) r.link = fn(r.link); }); });
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
    chars().concat(floors(), others()).forEach(function (c) { (c.relations || []).forEach(function (x) { if (x.link === R) x.link = 0; }); });
    eachRef(function (n) { return n > R ? n - 1 : n; });
  }

    function swapFRefs(a, b) {
    eachRef(function (v) {
      if (!isFRef(v)) return v;
      var k = +String(v).slice(1);
      return k === a + 1 ? 'F' + (b + 1) : (k === b + 1 ? 'F' + (a + 1) : v);
    });
  }
  function removeFRefs(i) {
    var R = 'F' + (i + 1);
    var is = function (v) { return String(v).toUpperCase() === R; };
    (st.draft.pairs || []).forEach(function (p) {
      var idx = -1;
      (p.members || []).forEach(function (m, k) { if (idx < 0 && is(m)) idx = k; });
      if (idx >= 0) { p.members.splice(idx, 1); if (p.sides && p.sides.length > idx) p.sides.splice(idx, 1); }
      if (p.reviews) p.reviews = p.reviews.filter(function (x) { return !is(x.from) && !is(x.to); });
    });
    chars().concat(floors(), others()).forEach(function (c) { (c.relations || []).forEach(function (x) { if (is(x.link)) x.link = 0; }); });
    eachRef(function (v) {
      if (isFRef(v)) { var k = +String(v).slice(1); if (k > i + 1) return 'F' + (k - 1); }
      return v;
    });
  }

    function swapORefs(a, b) {
    eachRef(function (v) {
      if (!isORef(v)) return v;
      var k = +String(v).slice(1);
      return k === a + 1 ? 'O' + (b + 1) : (k === b + 1 ? 'O' + (a + 1) : v);
    });
  }
  function removeORefs(i) {
    var R = 'O' + (i + 1);
    var is = function (v) { return String(v).toUpperCase() === R; };
    (st.draft.pairs || []).forEach(function (p) {
      var idx = -1;
      (p.members || []).forEach(function (m, k) { if (idx < 0 && is(m)) idx = k; });
      if (idx >= 0) { p.members.splice(idx, 1); if (p.sides && p.sides.length > idx) p.sides.splice(idx, 1); }
      if (p.reviews) p.reviews = p.reviews.filter(function (x) { return !is(x.from) && !is(x.to); });
    });
    chars().concat(floors(), others()).forEach(function (c) { (c.relations || []).forEach(function (x) { if (is(x.link)) x.link = 0; }); });
    eachRef(function (v) {
      if (isORef(v)) { var k = +String(v).slice(1); if (k > i + 1) return 'O' + (k - 1); }
      return v;
    });
  }

  /* 칸이 없는 항목을 나중에 다시 꺼내 쓰는 "+ 항목 추가" 목록 */
  var OPTIONAL = {
    characters: { pairImage: '', sdSize: 230, subColor: '', textColor: '', seat: { gate: 'A', row: '01', seat: '01' },
                  customFront: '', customBack: '', customRatio: '', customRadius: 12, bgm: '', bgmTitle: '' },
    pairs: { bgm: '', bgmTitle: '' },
    floormasterPage: { bgm: '', bgmTitle: '' },
    otherPage: { bgm: '', bgmTitle: '' },
    menus: { left: false },
    background: { width: '' }
  };

  function objectEd(obj, key) {
    var box = h('div', { class: 'oha-obj' });
    var defs = SCHEMA[key] || null;
    var conds = [];
    function refresh() { conds.forEach(function (c) { c.el.hidden = !c.when(obj); }); }

    /* 칸 하나 (글자 칸은 한 줄, 목록 · 객체는 토글 상자) */
    function rowFor(k) {
      var v = obj[k];
      var complex = v && typeof v === 'object';
      var ed = valueEd(v, function (nv) { obj[k] = nv; refresh(); }, k, key, obj);
      if (complex && !Array.isArray(v) && INLINE[k]) {
        return h('div', { class: 'oha-inline' }, [h('div', { class: 'oha-subhead', text: LABEL[k] || k }), ed]);
      }
      if (complex) return h('details', { class: 'oha-box' }, [h('summary', null, [h('span', { text: LABEL[k] || k })]), ed]);
      return h('div', { class: 'oha-row' }, [h('div', { class: 'oha-lab', text: LABEL[k] || k }), ed]);
    }

    /* 섹션 하나 : rows 안의 배열은 세로줄로 이어 붙여요 */
    function sectionFor(def) {
      var sec = h('section', { class: 'oha-sec' + (def.t ? '' : ' is-bare') });
      if (def.t) {
        sec.appendChild(h('header', { class: 'oha-sec-h' }, [
          h('b', { text: def.t }),
          def.tag ? h('span', { class: 'oha-pill' + (def.when ? ' is-cond' : ''), text: def.tag }) : null
        ]));
      }
      var any = false;
      def.rows.forEach(function (r) {
        var ks = (Array.isArray(r) ? r : [r]).filter(function (k) { return k in obj; });
        if (!ks.length) return;
        any = true;
        if (ks.length > 1) {
          var g = h('div', { class: 'oha-link', title: '함께 사용하는 항목이에요' });
          ks.forEach(function (k) { g.appendChild(rowFor(k)); });
          sec.appendChild(g);
        } else sec.appendChild(rowFor(ks[0]));
      });
      if (!any) return null;
      if (def.when) conds.push({ el: sec, when: def.when });
      return sec;
    }

    function draw() {
      box.innerHTML = ''; conds = [];
      if (defs) {
        var used = {};
        defs.forEach(function (d) { d.rows.forEach(function (r) { (Array.isArray(r) ? r : [r]).forEach(function (k) { used[k] = 1; }); }); });
        defs.forEach(function (d) { var s = sectionFor(d); if (s) box.appendChild(s); });
        var rest = Object.keys(obj).filter(function (k) { return !used[k]; });
        if (rest.length) {
          var titled = defs.some(function (d) { return d.t; });
          var s2 = sectionFor({ t: titled ? '기타' : '', tag: titled ? '공통' : '', rows: rest });
          if (s2) box.appendChild(s2);
        }
      } else {
        Object.keys(obj).forEach(function (k) { box.appendChild(rowFor(k)); });
      }
      /* 아직 칸이 없는 항목만 예전처럼 "+ 항목 추가"로 꺼내 쓸 수 있어요 */
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
      refresh();
    }
    draw();
    return box;
  }

  /* 목록 항목 순서 바꾸기 (끌어서 이동은 한 번에 한 목록 안에서만) */
  var dragState = null;
  function arrKind(arr) { return { c: arr === chars(), f: arr === floors(), o: arr === others() }; }
  function swapAdj(arr, a, b) {
    var k = arrKind(arr), t = arr[a]; arr[a] = arr[b]; arr[b] = t;
    if (k.c) swapRefs(a, b);            /* 캐릭터 번호로 연결된 페어 · 리뷰 · 관계도 같이 따라가요 */
    if (k.f) swapFRefs(a, b);
    if (k.o) swapORefs(a, b);
  }
  function moveItem(arr, from, to) {
    if (from === to || to < 0 || to >= arr.length) return false;
    var step = from < to ? 1 : -1;
    for (var k = from; k !== to; k += step) swapAdj(arr, k, k + step);
    return true;
  }

  function arrayEd(arr, key, pkey) {
    var box = h('div');
    var openItems = [];                                  /* 순서를 바꿔도 펼쳐 둔 항목은 그대로 펼쳐져 있게 */
    function draw() {
      box.innerHTML = '';
      var simple = arr.every(function (x) { return typeof x !== 'object'; });
      arr.forEach(function (item, i) {
        var holder = null, headOf = null;                /* holder: 이 항목 전체, headOf: 위 / 아래 판정에 쓸 줄 */
        function icoBtn(cls, icon, tip, fn, off) {
          var b = h('button', { class: 'oha-mini oha-ico ' + cls, type: 'button', title: tip, 'aria-label': tip });
          b.innerHTML = icon;
          if (off) b.disabled = true;
          b.onclick = function (e) { e.preventDefault(); e.stopPropagation(); fn(); };
          return b;
        }
        var ctl = function () {
          var grip = h('span', { class: 'oha-mini oha-ico oha-grip', draggable: 'true', title: '끌어서 순서 바꾸기', role: 'button', 'aria-label': '끌어서 순서 바꾸기' });
          grip.innerHTML = ICON_GRIP;
          grip.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });
          grip.addEventListener('dragstart', function (e) {
            dragState = { box: box, from: i };
            if (e.dataTransfer) {
              e.dataTransfer.effectAllowed = 'move';
              try { e.dataTransfer.setData('text/plain', String(i)); } catch (x) {}
              try { e.dataTransfer.setDragImage(headOf(), 12, 12); } catch (x) {}
            }
            holder.classList.add('is-dragging');
            e.stopPropagation();
          });
          grip.addEventListener('dragend', function () {
            dragState = null; holder.classList.remove('is-dragging');
            [].forEach.call(box.querySelectorAll(':scope > .drop-before, :scope > .drop-after'), function (x) { x.classList.remove('drop-before', 'drop-after'); });
          });
          var up = icoBtn('', ICON_ARROW_UP, '위로', function () { if (moveItem(arr, i, i - 1)) { touch(); draw(); } }, i === 0);
          var dn = icoBtn('', ICON_ARROW_DOWN, '아래로', function () { if (moveItem(arr, i, i + 1)) { touch(); draw(); } }, i === arr.length - 1);
          var rm = icoBtn('is-del', ICON_TRASH, '삭제', function () {
            var k = arrKind(arr), isObj = item && typeof item === 'object';
            var msg = (k.c || k.f || k.o) ? '이 캐릭터를 지울까요? 이 캐릭터가 들어간 페어 멤버 · 리뷰' + (k.c ? ' · 관계 링크' : '') + '도 같이 정리돼요.' : '이 항목을 지울까요?';
            if (isObj && !confirm(msg)) return;
            arr.splice(i, 1);
            if (k.c) removeRefs(i);
            if (k.f) removeFRefs(i);
            if (k.o) removeORefs(i);
            touch(); draw();
          });
          return [grip, up, dn, rm];
        };
        if (simple) {                                   /* 문자열 / 숫자 목록 : 한 줄 */
          var ed = valueEd(item, function (nv) { arr[i] = nv; }, key, key);
          holder = h('div', { class: 'oha-img oha-li' }, [h('div', { style: 'flex:1' }, [ed])].concat(ctl()));
          headOf = function () { return holder; };
        } else if (Array.isArray(item) && item.every(function (x) { return typeof x !== 'object'; })) {   /* 표 한 줄 [항목, 내용] */
          var cells = item.map(function (c, j) {
            return h('div', { style: 'flex:1' }, [valueEd(c, function (nv) { item[j] = nv; }, key, key)]);
          });
          holder = h('div', { class: 'oha-img oha-li' }, cells.concat(ctl()));
          headOf = function () { return holder; };
        } else {                                        /* 객체 목록 : 카드 */
          var sum = h('summary', null, [h('span', { text: title(item, i) }), h('span', { class: 'oha-sp' })].concat(ctl()));
          holder = h('details', { class: 'oha-box oha-li' }, [sum, valueEd(item, function (nv) { arr[i] = nv; }, key, key)]);
          if (openItems.indexOf(item) > -1) holder.open = true;
          holder.addEventListener('toggle', function () {
            if (!item || typeof item !== 'object') return;
            var at = openItems.indexOf(item);
            if (holder.open && at < 0) openItems.push(item);
            if (!holder.open && at > -1) openItems.splice(at, 1);
          });
          headOf = function () { return sum; };
        }
        /* 끌어서 놓기 : 이 항목 위쪽 절반이면 앞에, 아래쪽 절반이면 뒤에 들어가요 */
        function side(e) { var r = headOf().getBoundingClientRect(); return e.clientY > r.top + r.height / 2 ? 'after' : 'before'; }
        holder.addEventListener('dragover', function (e) {
          if (!dragState || dragState.box !== box) return;
          e.preventDefault(); e.stopPropagation();
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
          var sd = side(e);
          holder.classList.toggle('drop-before', sd === 'before');
          holder.classList.toggle('drop-after', sd === 'after');
        });
        holder.addEventListener('dragleave', function (e) {
          if (e.relatedTarget && holder.contains(e.relatedTarget)) return;
          holder.classList.remove('drop-before', 'drop-after');
        });
        holder.addEventListener('drop', function (e) {
          if (!dragState || dragState.box !== box) return;
          e.preventDefault(); e.stopPropagation();
          var from = dragState.from, at = i + (side(e) === 'after' ? 1 : 0);
          dragState = null;
          var to = at > from ? at - 1 : at;               /* 뺀 뒤의 자리 번호로 바꿔요 */
          if (moveItem(arr, from, to)) { touch(); draw(); }
          else holder.classList.remove('drop-before', 'drop-after');
        });
        box.appendChild(holder);
      });
      var tpls = templatesFor(key, pkey);
      var add = h('button', { class: 'oha-btn oha-add', type: 'button', text: tpls.length > 1 ? '+ 추가 ▾' : '+ 추가' });
      var menu = h('div', { class: 'oha-menu' }); menu.hidden = true;
      function push(v) { arr.push(v); touch(); menu.hidden = true; draw(); }
      add.onclick = function () {
        if (key === 'portraits' && arr.length >= 3) { toast('포트레이트는 3개까지 넣을 수 있어요.', true); return; }
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

  /* ---------- 자주 쓰는 코드 버튼 (편집기 위쪽) ----------
     글을 드래그해서 선택한 뒤 버튼을 누르면 그 부분에 코드가 자동으로 적용돼요.
     선택한 글이 없으면 예시 글이 들어가고, 바꿔 적을 부분이 선택돼요. */
  var lastField = null;
  function wrapSnip(open, close, ph) {
    return function (sel) { var inner = sel || ph; return { text: open + inner + close, from: open.length, to: open.length + inner.length }; };
  }
  function listSnip(cls) {
    return function (sel) {
      var lines = sel ? sel.split(/\r?\n/).filter(function (l) { return l.trim(); }) : ['내용', '내용'];
      if (!lines.length) lines = ['내용'];
      var t = '<ul class="' + cls + '">' + lines.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>';
      return { text: t, from: t.length, to: t.length };
    };
  }
  var ICON_NEWTAB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>';
  var ICON_SAMETAB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 15h8"/><path d="M13 12l3 3-3 3"/></svg>';
  var ICON_IMG_TWO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h8M3 10h8M3 14h8M3 18h6"/><rect x="14" y="5" width="7" height="14" rx="1.5"/><path d="M14 15l2.5-2.5L21 17"/></svg>';
  var ICON_IMG_ONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M3 17l5-4.5 4 3.5 3-2.5 6 4.5"/></svg>';
  /* 이미지 추가 : 주소 칸(https://)이 바로 선택돼서 붙여넣기만 하면 돼요 */
  function imgOne(sel) {
    var o = '<img class="st-img" src="', url = 'https://';
    return { text: o + url + '" alt="">' + (sel || ''), from: o.length, to: o.length + url.length };
  }
  function imgTwo(sel) {
    var o = '<div class="st-two"><div>' + (sel || '글 내용') + '</div><img src="', url = 'https://';
    return { text: o + url + '" alt=""></div>', from: o.length, to: o.length + url.length };
  }
  /* 스포일러 주의 안내칸 : 글을 선택해 두면 그 글만 안내문 아래에 묶여요 */
  function spoilNote(sel) {
    var t = '<div class="spoil-box"><p class="spoil-box-head">아래 내용에는 직·간접적인 스포일러가 포함되어 있습니다.</p>' +
      (sel ? '<div class="spoil-box-body">' + sel + '</div>' : '') + '</div>';
    return { text: t, from: t.length, to: t.length };
  }
  /* 캐릭터 링크 : 관계 탭 링크와 같은 방식으로 그 캐릭터 상세 프로필을 열어요 */
  function chLinkSnip(ref, name) {
    return function (sel) {
      var o = '<a class="ch-link" data-ch="' + ref + '">', inner = sel || name;
      return { text: o + inner + '</a>', from: o.length, to: o.length + inner.length };
    };
  }
  function charChoices() {
    var out = [];
    function add(ref, c) {
      var name = (c && c.name) || '';
      out.push({ icon: '', label: ref + ' · ' + (name || '(이름 없음)'), tip: '이 캐릭터의 상세 프로필 열기', make: chLinkSnip(ref, name || '캐릭터 이름') });
    }
    chars().forEach(function (c, i) { add(String(i + 1), c); });
    floors().forEach(function (c, i) { add('F' + (i + 1), c); });
    others().forEach(function (c, i) { add('O' + (i + 1), c); });
    return out;
  }
  function linkSnip(newTab) {
    return function (sel) {
      var o = '<a href="', url = 'https://';
      return { text: o + url + '"' + (newTab ? ' target="_blank" rel="noopener"' : '') + '>' + (sel || '링크 글') + '</a>', from: o.length, to: o.length + url.length };
    };
  }
  var SNIPS = [
    { html: '<i class="k">↵</i>줄바꿈', tip: '<br>',
      make: function (sel) { var t = sel + '<br>'; return { text: t, from: t.length, to: t.length }; } },
    { html: '<i class="k"><b>B</b></i>볼드체', tip: '<b>내용</b>', make: wrapSnip('<b>', '</b>', '내용') },
    { html: '<i class="k"><em>I</em></i>기울임체', tip: '<i>내용</i>', make: wrapSnip('<i>', '</i>', '내용') },
    { html: '<i class="k"><s>S</s></i>취소선', tip: '<s>내용</s>', make: wrapSnip('<s>', '</s>', '내용') },
    { html: '<i class="k">↗</i>링크 ▾', tip: '링크 걸기 (새 탭 / 현재 탭 선택)',
      choices: [
        { icon: ICON_NEWTAB, label: '새 탭', tip: '<a href="주소" target="_blank" rel="noopener">내용</a>', make: linkSnip(true) },
        { icon: ICON_SAMETAB, label: '현재 탭', tip: '<a href="주소">내용</a>', make: linkSnip(false) }
      ] },
    { html: '<i class="k">☺</i>캐릭터 링크 ▾', tip: '글을 누르면 그 캐릭터 상세 프로필이 열려요', listMenu: true, choices: charChoices },
    { html: '<i class="k">▣</i>이미지 추가 ▾', tip: '이미지 넣기 (2단 뷰 / 일반 삽입) — 넣은 뒤 주소를 바로 붙여넣어요',
      choices: [
        { icon: ICON_IMG_TWO, label: '2단 뷰', tip: '선택한 글 + 이미지를 2단으로', make: imgTwo },
        { icon: ICON_IMG_ONE, label: '일반 삽입', tip: '이미지만 삽입', make: imgOne }
      ] },
    { html: '<i class="k">振</i>요미가나', tip: '<ruby>한자<rt>요미가나</rt></ruby>',
      make: function (sel) {
        var o = '<ruby>' + (sel || '한자') + '<rt>', rt = '요미가나';
        return { text: o + rt + '</rt></ruby>', from: o.length, to: o.length + rt.length };
      } },
    { html: '<i class="k">▒</i>스포일러', tip: '<span class="spoil">숨길 내용</span>',
      make: wrapSnip('<span class="spoil">', '</span>', '숨길 내용') },
    { html: '<i class="k" style="color:#d93025">⚠</i>스포 주의', tip: '스포일러 주의 안내칸 (글을 선택하면 그 글만 묶여요)', make: spoilNote },
    { html: '<i class="k">¹</i>각주', tip: '각주<sup class="fn" tabindex="0">1<span>각주 내용</span></sup>',
      make: function (sel) {
        var o = (sel || '각주 달 글') + '<sup class="fn" tabindex="0">1<span>', c = '각주 내용';
        return { text: o + c + '</span></sup>', from: o.length, to: o.length + c.length };
      } },
    { html: '<i class="k">▸</i>토글', tip: '<details class="tg"><summary>제목</summary><div>펼쳐질 내용</div></details>',
      make: function (sel) {
        var o = '<details class="tg"><summary>', c = '제목';
        return { text: o + c + '</summary><div>' + (sel || '펼쳐질 내용') + '</div></details>', from: o.length, to: o.length + c.length };
      } },
    { html: '<i class="k">-</i>목록', tip: '<ul class="dash-list"><li>내용</li></ul>', make: listSnip('dash-list') },
    { html: '<i class="k">•</i>목록', tip: '<ul class="dot-list"><li>내용</li></ul>', make: listSnip('dot-list') }
  ];

  function applySnippet(it, el) {
    if (!el || !document.body.contains(el)) { toast('먼저 글을 적을 칸을 눌러 주세요.', true); return; }
    var s = el.selectionStart, e = el.selectionEnd, v = el.value;
    var r = it.make(v.slice(s, e));
    el.focus();
    el.value = v.slice(0, s) + r.text + v.slice(e);
    el.setSelectionRange(s + r.from, s + r.to);
    el.dispatchEvent(new Event('input', { bubbles: true }));     /* 저장할 값에 반영 + 미리보기 갱신 */
  }

  /* 링크 버튼처럼 "선택지"가 있는 코드 버튼 : 버튼 아래에 아이콘 메뉴가 떠요 */
  var choiceMenu = null, choiceBtn = null;
  function closeChoices() {
    if (!choiceMenu) return;
    choiceMenu.remove(); choiceMenu = null; choiceBtn = null;
    document.removeEventListener('mousedown', onChoiceOutside, true);
    document.removeEventListener('keydown', onChoiceKey, true);
    window.removeEventListener('resize', closeChoices);
  }
  function onChoiceOutside(e) {
    if (choiceMenu && !choiceMenu.contains(e.target) && !(choiceBtn && choiceBtn.contains(e.target))) closeChoices();
  }
  function onChoiceKey(e) { if (e.key === 'Escape') closeChoices(); }
  function toggleChoices(btn, it, getTarget) {
    if (choiceBtn === btn) { closeChoices(); return; }
    closeChoices();
    var list = typeof it.choices === 'function' ? it.choices() : it.choices;
    if (!list.length) { toast('먼저 캐릭터를 추가해 주세요.', true); return; }
    var menu = h('div', { class: 'oha-linkmenu' + (it.listMenu ? ' is-list' : ''), role: 'menu' });
    list.forEach(function (c) {
      var b = h('button', { class: 'oha-lm', type: 'button', title: c.tip, role: 'menuitem' });
      b.innerHTML = c.icon || '';
      b.appendChild(h('span', { text: c.label }));
      b.addEventListener('mousedown', function (ev) { ev.preventDefault(); });   /* 글 선택이 풀리지 않게 */
      b.addEventListener('click', function () { closeChoices(); applySnippet(c, getTarget()); });
      menu.appendChild(b);
    });
    st.root.appendChild(menu);
    var r = btn.getBoundingClientRect();
    menu.style.top = Math.max(8, Math.min(r.bottom + 6, window.innerHeight - menu.offsetHeight - 8)) + 'px';
    menu.style.left = Math.max(8, Math.min(r.left, window.innerWidth - menu.offsetWidth - 8)) + 'px';
    choiceMenu = menu; choiceBtn = btn;
    document.addEventListener('mousedown', onChoiceOutside, true);
    document.addEventListener('keydown', onChoiceKey, true);
    window.addEventListener('resize', closeChoices);
  }

  function snipBar(getTarget, twoRows) {
    var btns = h('div', { class: 'oha-snip-b' + (twoRows ? ' is-two' : '') });
    SNIPS.forEach(function (it) {
      var b = h('button', { class: 'oha-snipbtn', type: 'button', title: it.tip });
      b.innerHTML = it.html;
      b.addEventListener('mousedown', function (ev) { ev.preventDefault(); });   /* 눌러도 글 선택이 풀리지 않게 */
      b.addEventListener('click', function () {
        if (it.choices) { toggleChoices(b, it, getTarget); return; }
        closeChoices();
        applySnippet(it, getTarget());
      });
      btns.appendChild(b);
    });
    btns.addEventListener('scroll', closeChoices);
    /* 버튼이 넘치면 마우스 휠(세로)로도 좌우로 스크롤돼요. 끝에 닿으면 페이지가 스크롤돼요 */
    btns.addEventListener('wheel', function (e) {
      var max = btns.scrollWidth - btns.clientWidth;
      if (max <= 0) return;
      var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if ((d < 0 && btns.scrollLeft <= 0) || (d > 0 && btns.scrollLeft >= max - 1)) return;
      e.preventDefault();
      btns.scrollLeft += d;
    }, { passive: false });
    return h('div', { class: 'oha-snip-wrap' }, [h('div', { class: 'oha-snip' }, [
      h('div', { class: 'oha-snip-l' }, [h('b', { text: '자주 쓰는 코드' }), h('small', { text: '글을 드래그 → 버튼 클릭' })]),
      btns
    ])]);
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
    body.appendChild(snipBar(function () { return lastField; }, true));
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
    var root = st.root; root.innerHTML = ''; root.classList.remove('is-editor');
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
    /* 위쪽 바 · 코드 버튼 바의 실제 높이를 재서, 스크롤해도 코드 버튼 바가 상단 바 바로 아래에 계속 붙어 있게 해요 */
    function syncBars() {
      root.style.setProperty('--oha-top', top.offsetHeight + 'px');
      var sn = root.querySelector('.oha-snip-wrap');
      if (sn) { root.style.setProperty('--oha-snip', sn.offsetHeight + 'px'); if (st.ro) st.ro.observe(sn); }
    }
    if (st.ro) st.ro.disconnect();
    if (window.ResizeObserver) { st.ro = new ResizeObserver(syncBars); st.ro.observe(top); }
    syncBars(); setTimeout(syncBars, 0); setTimeout(syncBars, 300);

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
      root.classList.add('is-editor');
      if (!st.draft) {
        st.draft = clone(S);
        if (st.draft.owner && !Array.isArray(st.draft.owner)) st.draft.owner = [st.draft.owner];
        if (st.draft.background) {
          [['frontImage', ''], ['frontPosition', 'center'], ['frontWidth', ''], ['frontOpacity', 1]].forEach(function (d) {
            if (!(d[0] in st.draft.background)) st.draft.background[d[0]] = d[1];
          });
        }
        ['characters', 'floormasters', 'others'].forEach(function (k) {
          (st.draft[k] || []).forEach(function (c) {
            if (!c || 'faction' in c) return;
            var keep = {};
            Object.keys(c).forEach(function (x) { keep[x] = c[x]; delete c[x]; });
            Object.keys(keep).forEach(function (x) { c[x] = keep[x]; if (x === 'nameEn') c.faction = ''; });
            if (!('faction' in c)) c.faction = '';
          });
        });
        /* 전신 일러스트 · 포트레이트 칸: 예전 캐릭터에도 기본으로 보이게 */
        ['characters', 'floormasters'].forEach(function (k) {
          (st.draft[k] || []).forEach(function (c) {
            if (!c || ('fullBody' in c && 'portraits' in c)) return;
            var keep = {}, done = false;
            Object.keys(c).forEach(function (x) { keep[x] = c[x]; delete c[x]; });
            var anchor = 'tilePosition' in keep ? 'tilePosition' : ('tile' in keep ? 'tile' : ('sd' in keep ? 'sd' : ''));
            function put() {
              if (done) return; done = true;
              c.fullBody = 'fullBody' in keep ? keep.fullBody : '';
              c.portraits = 'portraits' in keep ? keep.portraits : ['', '', ''];
            }
            Object.keys(keep).forEach(function (x) {
              if (x === 'fullBody' || x === 'portraits') return;
              c[x] = keep[x];
              if (x === anchor) put();
            });
            put();
          });
        });
        ensureDefaults(st.draft);
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
      st.root.addEventListener('focusin', function (e) {      /* 코드 버튼을 적용할 칸 기억하기 */
        var t = e.target;
        if (t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.type === 'text')) && !t.closest('.oha-snip-wrap') && !t.closest('.oha-color') && !t.closest('.oha-pop')) lastField = t;
      });
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
