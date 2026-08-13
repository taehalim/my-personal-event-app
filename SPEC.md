# My Personal Event App 제품 명세

> 이 문서는 My Personal Event App의 단일 구현 기준이다. 이 문서만 전달받은 개발자가 현재 제품을 재구현할 수 있어야 한다. 이전 PRD, 화면 캡처, 기존 코드와 충돌하면 이 문서를 우선한다.

## 1. 제품

My Personal Event App은 주최자가 이벤트를 만들고, 가입 때 입력한 표시 이름을 기준으로 공개 링크 및 `X의 이벤트` 목록으로 공유하는 한국어 이벤트 운영 앱이다.

~~~text
회원가입 또는 로그인 → 이벤트 생성 → 이미지·페이지 스타일·일정·장소·소개 설정
→ 공개 링크 공유 → 방문자 참가 신청 → 자동/수동 승인 → 참가자 관리·CSV
~~~

### 포함

- 공개 이벤트 목록과 slug 기반 공개 페이지
- 관리자 가입·로그인·비밀번호 재설정
- 이벤트 생성·수정·삭제, 대표 이미지, 배경 효과
- 장소·Google Maps, Markdown 소개
- 참가 신청·취소·추가 질문·정원·신청 기간·승인·이메일·CSV

### 제외

결제/티켓/쿠폰, 반복 이벤트, 대기자, QR 체크인, SMS/푸시, 채팅, 소셜 프로필, 다중 조직/SSO, 공개 검색·추천은 구현하지 않는다.

## 2. 역할과 인증

| 역할 | 권한 |
| --- | --- |
| 방문자 | published 이벤트 조회, 참가 신청·취소 |
| 가입 사용자 | 로그인만 가능 |
| 관리자 | 자신이 만든 이벤트·이미지·참가자 관리 |

- 회원가입은 Supabase Auth 이메일/비밀번호 가입이며, 필수 표시 이름(1~80자)을 함께 받는다. 이 값은 Auth user metadata의 `display_name`으로 저장한다.
- 새 이벤트의 `host_name`은 요청 body가 아니라 로그인한 관리자의 `display_name`에서 서버가 결정한다. 따라서 주최자, 관리자 목록의 `X의 이벤트`, 공개 페이지의 뒤로가기 문구가 같은 이름을 사용한다.
- 가입만으로 관리자가 되지 않는다. admin_users.user_id = auth.uid()인 사용자만 관리자다.
- 비관리자 /admin 접근은 /login 또는 권한 없음으로 처리한다.
- 공개 목록/공개 이벤트에는 관리자 로그인 링크를 노출하지 않는다.
- 비밀번호는 평문으로 조회할 수 없다. 비밀번호 재설정은 존재하지 않는 이메일에 성공 응답을 반환하거나 메일을 보내지 않는다.

## 3. 라우트

| 경로 | 화면 | 접근 |
| --- | --- | --- |
| / | `X의 이벤트` 공개 목록 | 모두 |
| /:slug | 공개 이벤트 | published만 |
| /:slug/cancel?token= | 참가 취소 | 토큰 소유자 |
| /login, /signup, /forgot-password, /auth/reset-password | 인증 | 모두 |
| /admin | 관리자 이벤트 목록 | 관리자 |
| /admin/events/new | 이벤트 생성 | 관리자 |
| /admin/events/:id | 이벤트 수정 | 생성 관리자 |
| /admin/events/:id/registrations | 참가자 관리 | 생성 관리자 |

공개 이벤트는 noindex,nofollow 및 slug canonical URL을 사용한다.

## 4. 전역 디자인 시스템

- 모든 UI는 자연스러운 한국어, 기본 글꼴은 **Geist Sans**다.
- 콘텐츠 최대 폭은 **960px**이다. 넓은 화면에서 이보다 넓게 퍼뜨리지 않는다.
- 820px 이하는 한 열, 640px 이하는 약 16px 좌우 여백을 쓴다. 터치 컨트롤은 최소 44px이다.
- 구분은 여백·타이포그래피·약한 명암을 우선한다. 큰 외곽 카드, 불필요한 border/divider, 화면 전체를 감싸는 흰/검정 컨테이너를 만들지 않는다.
- 이벤트 제목만 큰 크기를 사용한다. 빈 상태와 관리 제목은 과장하지 않는다.
- 배경 테마와 무관하게 hover/focus/disabled/위험 버튼의 텍스트 대비가 유지되어야 한다.

### 공통 이벤트 캔버스

공개/생성/수정은 다음 공통 레이아웃 계약을 사용한다.

~~~text
desktop: [ left visual rail 220~250px ] [ right main flexible ]  gap 28~42px
mobile ≤820px: left rail 다음 right main의 한 열
max width: 960px
~~~

- EventExperienceLayout이 이 계약의 단일 컴포넌트다.
- 생성·수정은 같은 캔버스에서 편집 필드를 보이고, 공개 페이지는 같은 데이터를 읽기 전용으로 보인다. 필드 UI는 달라도 콘텐츠 폭·열·배경 레이어의 구조는 같아야 한다.
- 공개 페이지 left rail은 desktop에서 sticky일 수 있으나 참가 신청 폼을 연 동안에는 static으로 바꾼다. 중첩 스크롤바나 본문 겹침은 금지한다.

## 5. 페이지 스타일(배경 효과)

페이지 스타일은 이벤트 데이터다. 생성/수정에서 선택하면 저장 전 즉시 현재 캔버스에 반영되고, 저장 후 공개 페이지에서도 같은 방식으로 보인다.

### 렌더링 계약

- 배경은 position:fixed; inset:0; min-height:100dvh viewport 레이어다. 문서 높이를 기준으로 absolute 배경을 확대하지 않는다.
- 배경은 pointer-events:none, 콘텐츠보다 낮은 z-index다.
- 편집/공개 화면에 서로 다른 opacity, scale, background-size, 흰색 wrapper, 임의 overlay를 적용하지 않는다.
- 정적 테마도 viewport 전체를 채우며 바깥 흰 여백, 컨테이너 배경, 테두리를 남기지 않는다.
- prefers-reduced-motion에서 애니메이션을 낮추거나 정지한다.
- 무료 React Bits 컴포넌트만 프로젝트에 vendoring하여 쓴다. Pro 컴포넌트, 유료 API, CSS로 흉내 낸 오래된 효과를 사용하지 않는다.

| id | 이름 | 유형 | 실제 배경 |
| --- | --- | --- | --- |
| galaxy | 갤럭시 | 동적 | React Bits Galaxy |
| balatro | 발라트로 | 동적 | React Bits Balatro |
| prism | 프리즘 | 동적 | React Bits Prism |
| plasma | 플라즈마 | 동적 | React Bits Plasma |
| tunnel | 라이트 터널 | 동적 | React Bits Light Tunnel |
| warp | 하이퍼스피드 | 동적 | React Bits Hyperspeed |
| threads | 스레드 | 동적 | React Bits Threads |
| aurora | 오로라 | 동적 | React Bits Aurora |
| midnight | 나이트 | 정적 | 남색/검정 그라데이션 |
| paper | 페이퍼 | 정적 | 따뜻한 종이 질감 |

- aurora, paper는 밝은 테마, 나머지는 어두운 테마다.
- 모든 색은 event-bg, event-fg, event-muted, event-control, event-action 의미 토큰으로 결정한다.
- 과거 값 정규화: constellation→warp, orbit→threads, bubbles→aurora, sparkles→tunnel, rain→plasma, confetti→balatro, plain→galaxy; 그 외는 galaxy. 새 값은 위 10개만 저장한다.

## 6. 공개 목록 /

- 중앙 제목은 현재 관리자의 표시 이름을 사용한 `X의 이벤트`다. 예: `태하의 이벤트`.
- 제목 아래에는 pill 컨테이너 없는 독립 텍스트 탭 예정된 이벤트, 지난 이벤트가 있다. 활성은 선명하게, 비활성은 흐리게 보인다.
- 예정은 end_at >= now, 지난 이벤트는 그 이전이며 날짜별로 묶고 시간순으로 보인다.
- 목록 자체의 최대 폭은 공통 이벤트 캔버스보다 좁은 **820px**이며 중앙 정렬한다.
- 목록 헤더는 제목, 탭 순서로 중앙 정렬한다. desktop 제목은 최대 46px, 탭은 17px·간격 28px이며 날짜 그룹 사이 간격은 34px다. 날짜 제목은 18px, 요일은 13px 저대비 텍스트다.
- 공개 목록과 관리자 목록은 별도 카드 마크업을 만들지 않고 같은 `EventDirectoryCard`를 사용한다. 관리자 전용 액션만 선택적으로 추가한다.
- 카드 전체 클릭은 공개 slug로 이동한다. 카드에는 시간, 제목, 한 줄 말줄임 장소, 참가자 정보, 정사각형 대표 이미지만 둔다.
- desktop 카드는 padding 24px, 본문/이미지는 `1fr 128px`, 높이 128px, 간격 20px다. mobile 카드는 padding 18px, 본문/이미지는 `1fr 120px`, 높이 120px, 간격 14px다. 제목·장소가 길어도 한 줄 말줄임하여 카드 높이가 달라지지 않는다.
- 기본 카드는 border, shadow, 색이 칠해진 배경이 없다. 바탕은 투명하고 hover에서만 중립 회색(`#f7f7f7`)을 약하게 보여준다. 키보드 focus는 배경색 대신 2px 검정 outline으로 명확히 표시한다.
- 예정 이벤트에는 상태 문구나 뱃지를 붙이지 않고 시작 시각만 보인다.
- 진행 중 이벤트는 시간 행 안에 **6px 빨간 점 + `지금 진행 중` + 시작–종료 시각**을 인라인으로 보인다. 예: `● 지금 진행 중  오후 7:00–10:00`.
- 진행 중 표시는 작은 보조 메타데이터이며 pill/badge가 아니다. 카드 배경을 분홍색으로 칠하거나 빨간 왼쪽 border, glow, shadow를 추가하지 않는다. 진행 중 카드의 hover도 다른 카드와 같은 중립 회색이다.
- 지난 이벤트는 카드 전체 opacity를 약 0.5로 낮추고 대표 이미지를 거의 grayscale로 만든다. hover에서도 opacity는 약 0.68을 넘기지 않는다. `종료` 뱃지는 붙이지 않는다.
- 취소된 이벤트도 대비를 낮추고 이미지를 grayscale 처리하되 목록 시각 계층을 바꾸는 큰 경고 뱃지는 쓰지 않는다.
- 공개 목록의 참가자 행은 신청 가능 여부에 따라 `참가 신청 가능` 또는 `참가 안내`, 관리자 목록은 승인 인원에 따라 `N명 참가` 또는 `참가자 없음`을 쓴다.
- 대표 이미지 실패 시 깨진 아이콘 대신 placeholder를 보인다.
- 빈 상태는 카드와 같은 폭에서 아이콘·짧은 카피·보조 설명으로 중앙 정렬한다. 관리자 CTA는 관리자 화면에만 보인다.

### 목록 상태 판정·시간 표기

| 상태 | 판정 | 카드 첫 행 |
| --- | --- | --- |
| 예정 | `now < start_at` | 로컬 시작 시각만 |
| 진행 중 | `start_at <= now <= end_at` | 빨간 점, `지금 진행 중`, 로컬 시작–종료 시각 |
| 지난 이벤트 | `end_at < now` | 로컬 시작 시각만, 카드 전체 저대비 |
| 취소됨 | `status = cancelled` | 로컬 시작 시각만, 카드 전체 저대비 |

- 시간은 이벤트 timezone으로 포맷한다. 시작과 종료의 오전/오후가 같으면 종료 시각에서 같은 표기를 반복하지 않는다. 예: `오후 7:00–10:00`; 서로 다르면 양쪽에 오전/오후를 표시한다.
- 진행 중 점은 장식 요소이므로 스크린 리더에서 숨기고, 카드 링크의 접근 가능한 이름에는 `진행 중` 상태를 포함한다.

## 7. 공개 이벤트 /:slug

### 정보 구조

1. ← X의 이벤트
2. left rail: 대표 이미지 → 주최자 → 참가자 → 참가 신청
3. main: 제목 → 일정 → 오시는 길(해당 시) → 이벤트 소개

긴 제목도 main 폭 안에서 읽기 좋은 줄폭과 줄높이를 유지한다.

### left rail

- 대표 이미지는 1:1 둥근 모서리다.
- 주최자 아래에 원형 이니셜 avatar와 이름을 보인다. 이름은 일반 굵기다.
- 참가자에는 승인된 참가자를 최대 8개의 겹친 avatar로 보이고, hover/focus tooltip과 접근 가능한 이름 label을 제공한다. 인원 수를 표시하며 없으면 아직 참가자가 없어요를 보인다.
- 참가 신청 CTA와 폼은 left rail 안에만 있다. main에 중복 신청 카드나 viewport-fixed drawer를 만들지 않는다.
- CTA를 누르면 버튼 바로 아래에서 inline 폼이 열린다. 닫기, 이름, 이메일, 동의, 추가 질문, 제출을 제공한다.
- 폼이 열릴 때 rail sticky를 끄므로 내용이 겹치거나 rail 내부 scrollbar가 생기면 안 된다.

### main

- 일정: 아이콘, 날짜, 시간. 예: 2026년 8월 27일 목요일, 07:00–10:00.
- 오프라인 장소에 map_url이 있으면 일정에 장소를 중복하지 않는다. 다음 오시는 길에 장소명, 짧은 도시, 길찾기 ↗, Google Maps iframe을 한 번만 둔다.
- 온라인/지도 없는 경우만 일정 아래에 장소 또는 온라인 링크를 간결하게 둔다.
- 지도 iframe은 유지하되 left rail·소개 안이 아니라 오시는 길 안에만, 본문 폭의 16:9 내외로 둔다.
- 이벤트 소개는 react-markdown + remark-gfm + remark-breaks + rehype-sanitize로 안전하게 렌더한다. raw HTML/XSS는 실행하지 않는다.
- 공개 페이지에서 참가자 이메일·답변·관리자 전용 데이터는 절대 노출하지 않는다.
- 공개 본문에는 section divider를 사용하지 않는다.

| 상태 | CTA |
| --- | --- |
| 신청 시작 전 | 신청 시작 전 |
| 신청 가능 | 참가 신청 |
| 신청 마감 | 신청 마감 |
| 정원 마감 | 정원 마감 |
| 취소됨 | 취소된 이벤트 |

서버가 중복 이메일, 정원, 신청 기간을 다시 검증한다. 자동 승인은 approved, 수동 승인은 pending이다.

## 8. 관리자 목록 /admin

- 공개 목록과 동일한 820px 폭, 제목, 탭, 날짜 그룹, 상태 판정, 시간 포맷, `EventDirectoryCard` 시각 계층을 쓴다. 공개/관리자 목록에서 카드 상태를 각각 구현하지 않는다.
- 우측 상단은 배경 없는 + 이벤트 만들기 텍스트 액션이다.
- 카드 클릭은 공개 링크로 가며, 별도 액션 이벤트 관리, 참가자 관리, 링크 복사는 클릭 전파를 막는다.
- 카드에는 시간, 제목, 장소, 참가자 정보, 대표 이미지, 관리 액션만 우선한다. 주최자/공개 상태를 과하게 반복하지 않는다.
- 액션 위계는 이벤트 관리만 검정 채움 primary다. 참가자 관리와 링크 복사는 투명 배경의 text/ghost action이며 평상시 회색, hover에서만 약한 중립 배경을 쓴다. 세 액션을 모두 채워진 버튼으로 만들지 않는다.
- 관리자 빈 상태는 같은 밀도를 유지하며 새 이벤트 만들기 CTA만 추가한다.

## 9. 이벤트 생성·수정

생성과 수정은 하나의 EventForm과 960px 공통 이벤트 캔버스를 사용한다. 수정은 기존 값을 불러오며 제목·이미지·페이지 스타일·소개가 저장 전 즉시 반영된다.

### 골격

- 상단은 ← X의 이벤트. 수정에서는 공개 링크 보기, 참가자 관리, 이벤트 삭제를 충분한 대비로 둔다.
- left rail은 실시간 대표 이미지, 대표 이미지, 페이지 스타일, 주최자 avatar/이름이다.
- main은 새 이벤트/이벤트 편집, 제목 입력, 필수 이벤트 설정, 선택 이벤트 설정, 저장 바 순서다.
- form 전체를 큰 card, 외곽 border, 흰색 wrapper로 감싸지 않는다.
- 하단 저장 바는 캔버스 안에만 있고 긴 폼을 가리거나 별도 스크롤을 만들지 않는다.

### 대표 이미지·페이지 스타일

- 이미지 preview는 1:1이며 선택 즉시 반영된다.
- JPG/PNG/WebP 최대 10MB 업로드를 받고, 브라우저에서 WebP·최대 2MB·최대 1600px로 압축하여 event-covers Storage에 저장한다.
- 무료 기본 이미지 8개 라이브러리를 제공하며 선택 즉시 반영한다.
- 페이지 스타일 패널은 제5절의 정확한 10개 preset을 이름·설명·미리보기와 함께 보인다.

### 필수 이벤트 설정

1. **일정**: timezone은 Asia/Seoul. 시작/종료 날짜·시간을 각각 입력한다. 종료는 시작 뒤여야 하고, 시작 변경으로 무효가 되면 시작+1시간으로 보정한다.
2. **장소**: 오프라인/온라인 segmented control. 오프라인은 장소명 필수, 온라인은 HTTPS URL 필수. 오프라인 입력 즉시 map preview와 Maps 링크를 보인다.
3. **이벤트 소개**: 필수 Markdown 원문. 별도 작성/미리보기 토글 대신 MDXEditor 같은 WYSIWYG Markdown 에디터에서 입력 즉시 서식이 렌더된다.

### 선택 이벤트 설정

1. **참가 설정**: 참가 신청 on/off, 정원(빈 값=무제한), 자동/수동 승인, 선택적인 신청 기간.
2. **신청 질문**: text/textarea/select/checkbox, 질문명, 필수 여부, 정렬, select 옵션.

### 저장·삭제

- 새 이벤트는 검증 후 published로 즉시 생성한다. 혼란스러운 공개로 생성 별도 표시는 없다.
- 수정에서만 published/draft/cancelled 상태를 선택한다. draft 공개 URL은 404다.
- 버튼은 생성 시 이벤트 만들기, 수정 시 변경사항 저장. 변경은 공개 페이지에 즉시 반영됨을 알린다.
- 삭제는 이벤트와 참가 기록을 삭제할까요? 확인 단계 후에만 실행한다.

## 10. 참가자 관리

- /admin/events/:id/registrations는 같은 최대 폭·서체·여백·액션 체계를 쓴다.
- 상단: ← 이벤트 편집, eyebrow 참가자 관리, 이벤트 제목, 인원 수, CSV 다운로드.
- 검색(이름/이메일), 상태 필터, 검색 버튼을 제공하며 모바일에서는 쌓인다.
- 큰 외곽 card 대신 행 중심 목록으로 이름, 이메일, 상태, 신청 일시, 상태별 관리 액션을 보인다.
- 빈 상태는 사용자 아이콘과 아직 신청한 참가자가 없어요를 중앙 정렬한다.

## 11. 데이터 모델

~~~text
events
  id uuid PK, slug unique, title, description(Markdown), cover_image_path,
  background_preset, host_name, start_at, end_at, timezone=Asia/Seoul,
  location_type(in_person|online), location_name, location_url, map_url,
  registration_enabled, registration_open_at, registration_close_at,
  capacity nullable, approval_mode(auto|manual),
  status(draft|published|cancelled), created_by, created_at, updated_at

registrations
  id, event_id, name, email, normalized_email, answers jsonb,
  status(pending|approved|rejected|cancelled), consent_at, registered_at,
  updated_at, cancelled_at, cancel_token_hash

registration_fields
  id, event_id, type, label, description, placeholder, options jsonb,
  required, sort_order

admin_users
  user_id PK, created_at
~~~

- end_at > start_at, capacity는 존재하면 양수다.
- normalized_email은 이벤트별 unique다.
- approved 수만 정원 계산에 사용하고 수동 승인 직전에 서버가 다시 확인한다.
- Storage 공개 읽기는 공개 cover만 허용하고 관리자는 자기 이벤트 경로만 쓸 수 있다.

## 12. 서버와 기술

- Next.js 16 App Router, React 19, TypeScript
- Supabase Auth/Postgres/Storage/SSR, Zod, Lucide, date/time utility
- CSS Modules와 app/globals.css의 의미 토큰. Tailwind/shadcn/Radix를 전제로 하지 않는다.
- MDXEditor, react-markdown, remark-gfm, remark-breaks, rehype-sanitize, browser-image-compression, Nodemailer, Playwright
- Route Handler는 Zod로 input을 검증한다. 클라이언트 검증은 UX용이고 권한·정원·기간은 서버가 최종 검증한다.
- RLS는 published 이벤트/공개 cover만 익명 읽기, 관리자는 created_by=auth.uid() 행만 CUD, registration 답변은 해당 관리자와 작성자만 접근하도록 한다.
- 이메일은 등록·승인·거절·취소에만 발송한다. SMTP 비밀값은 서버 환경 변수에만 둔다.

## 13. 완료 조건

1. /에 한국어 공개 목록과 예정/지난 이벤트가 있으며 관리자 로그인 링크가 없다.
2. 새 이벤트는 즉시 published, 공개 slug와 목록에서 확인된다. draft만 404다.
3. 생성/수정/공개는 같은 960px event canvas와 같은 viewport 기반 background preset을 쓴다.
4. 모든 10개 preset은 전체 viewport를 채운다. 동적 8개는 무료 React Bits 효과이며 정적 2개도 외곽 흰 여백/보더가 없다.
5. 긴 소개 글이 배경을 세로로 늘리거나 공개/편집의 배경 비율을 다르게 만들지 않는다.
6. 신청 폼은 left rail에서만 열리고, 열려도 overlap/nested scrollbar가 없다.
7. 지도는 오시는 길에 한 번만 나오고, Markdown 소개는 안전하게 렌더된다.
8. 1440px와 390px에서 공개 목록, 공개 상세, 생성/수정, 참가자 관리의 screenshot 회귀 테스트를 둔다. 긴 제목·긴 장소·긴 소개, dark/light preset, 신청 폼 열린 상태를 포함한다.
9. lint, type check, production build, 핵심 Playwright 플로우가 통과해야 한다.
10. 같은 진행 중 이벤트가 `/`와 `/admin`에서 동일한 투명 카드, 빨간 점, `지금 진행 중`, 시작–종료 시각으로 보인다. 분홍 배경·빨간 카드 border·상태 pill이 없어야 한다.
11. 예정/진행 중/지난/취소 상태와 긴 제목·긴 장소를 fixture로 두고 카드 높이, 말줄임, 저대비, 관리자 액션 위계를 screenshot으로 검증한다.

## 14. 구현 금지

- 공개와 편집에 서로 다른 배경 구현/scale/overlay를 두는 것
- 문서 높이를 기준으로 확장되는 absolute 배경, 화면을 감싸는 흰/검정 card·보더
- 모든 섹션에 divider를 긋는 것
- 공개/관리자 이벤트 목록 카드를 서로 다른 컴포넌트나 상태 스타일로 구현하는 것
- 진행 중 상태를 분홍 카드 배경, 빨간 테두리·왼쪽 선, pill/badge로 표현하는 것
- 참가자 관리·링크 복사를 이벤트 관리와 같은 채움 primary 버튼으로 표현하는 것
- main에 중복 참가 신청 폼을 만들거나 fixed left drawer를 쓰는 것
- 레거시 preset, Pro React Bits, 유료 API, 무단 외부 이미지 의존성
- RLS/정원/권한 검증을 클라이언트 조건문으로 대체하는 것
