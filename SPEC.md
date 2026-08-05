# Lama MVP Specification

## 1. 제품 개요

Lama는 국내 AI 커뮤니티와 기술 행사에서 사용할 수 있는 이벤트 생성·공유·참가 신청 웹앱이다.

관리자는 이벤트를 만들고 직접 링크를 공유한다. 방문자는 회원가입 없이 링크로 이벤트를 확인하고 참가 신청한다.

핵심 흐름:

~~~text
관리자 로그인
  -> 이벤트 생성
  -> 대표 이미지 업로드
  -> 공개 링크 발급
  -> 링크 공유
  -> 방문자가 이벤트 조회
  -> 참가 신청
  -> 참가 상태에 따른 이메일 발송
~~~

제품명은 Lama를 사용한다. 공개 이벤트 목록이나 디스커버리 기능은 제공하지 않는다.

## 2. 목표와 범위

### 목표

- 이벤트 생성·수정·삭제
- 대표 이미지 업로드
- 직접 링크 기반 이벤트 공유
- 회원가입 없는 참가 신청
- 이벤트별 추가 신청 질문 설정
- 자동 승인과 수동 승인
- 정원 및 신청 기간 관리
- 참가 취소 링크
- 참가자 관리와 CSV 다운로드
- 참가 상태 이메일
- Supabase Free와 Vercel Hobby에서 동작
- 오픈소스 셀프호스팅 가능

### MVP 제외

- 공개 이벤트 검색·디스커버리·카테고리
- 이벤트 목록 홈
- 결제·티켓 가격·쿠폰·환불
- 반복 이벤트와 다중 세션
- 대기자
- SMS, WhatsApp, Push
- 행사 전 리마인더
- QR 체크인
- 모바일 앱
- Zoom·Google Meet 자동 연동
- 뉴스레터와 캘린더 팔로우
- 채팅과 참가자 메시지
- 다중 관리자·조직·SSO
- 관리자 회원가입
- 사용자 프로필과 소셜 기능

## 3. 사용자와 권한

### 관리자

각 배포 인스턴스에는 관리자 계정이 존재한다.

- Supabase Auth 이메일·비밀번호 로그인
- 회원가입 UI 없음
- 이벤트 생성·수정·삭제
- 대표 이미지 업로드·삭제
- 신청 질문 생성·수정·삭제
- 참가자 목록 조회·검색·필터
- 참가 승인·거절·취소
- 이메일 재발송
- CSV 다운로드
- 공개 링크 복사

관리자 계정은 Supabase Dashboard 또는 초기화 스크립트로 생성한다.

### 방문자

- 로그인 없이 published 이벤트 조회
- 로그인 없이 참가 신청
- 로그인 없이 참가 취소 링크 사용
- 이벤트 생성 불가
- 관리자 페이지와 참가자 목록 접근 불가

관리자 페이지는 애플리케이션 인증과 Supabase RLS로 보호한다. Vercel Hobby에서 Production URL 전체를 네트워크 수준으로 비공개 처리하는 것은 범위에 포함하지 않는다.

## 4. 이벤트 도메인 규칙

### 공개 범위

모든 이벤트는 direct-link private 방식이다.

- 이벤트 목록에 표시하지 않음
- 검색 기능에 노출하지 않음
- 검색엔진에 noindex 요청
- URL을 가진 방문자는 이벤트 페이지에 접근 가능
- URL을 모르면 이벤트를 탐색할 수 없음

### 이벤트 상태

events.status는 페이지의 생명주기를 나타낸다.

~~~text
draft       아직 공개하지 않음
published   공개 링크로 조회 가능
cancelled   취소된 이벤트 페이지
~~~

규칙:

- draft는 관리자만 조회 가능
- published는 공개 조회 가능
- cancelled는 공개 조회 가능하되 취소 안내를 표시
- cancelled 이벤트는 참가 신청 불가
- 이벤트 삭제는 관리자 확인 후 실제 삭제
- 이벤트를 취소하면 데이터를 보존하고 status만 cancelled로 변경

### 참가 신청 상태

참가 신청 가능 여부는 이벤트 상태, 관리자 설정, 신청 기간, 정원을 함께 계산한다.

~~~text
not_open    아직 신청 시작 전
open        신청 가능
closed      관리자가 닫았거나 신청 종료 시각이 지남
full        승인 인원이 정원에 도달함
cancelled   이벤트가 취소됨
~~~

events.registration_enabled가 false이면 closed로 표시한다.

registrationState 계산 순서:

~~~text
status = cancelled                           -> cancelled
status != published                          -> not_open
registration_enabled = false                -> closed
현재 시각 < registration_open_at             -> not_open
현재 시각 >= registration_close_at           -> closed
capacity가 있고 approved count >= capacity  -> full
그 외                                        -> open
~~~

모든 저장 시각은 UTC timestamptz로 저장하고, 화면 표시는 events.timezone으로 변환한다.

기본값:

- 이벤트 공개 시 신청 가능
- 신청 시작 시각이 없으면 published 직후 신청 가능
- 신청 종료 시각이 없으면 관리자가 닫을 때까지 신청 가능
- 이벤트 종료 시각만으로 자동 마감하지 않음
- 정원에 도달하면 자동으로 full 처리
- 관리자가 다시 열 수 있음

### 승인 방식

~~~text
auto      신청 즉시 approved
manual    신청 후 pending, 관리자 승인 필요
~~~

기본값은 auto다.

수동 승인 상태 전이:

~~~text
pending -> approved
pending -> rejected
approved -> cancelled
~~~

- rejected 참가자는 참가자로 집계하지 않음
- cancelled 참가자는 참가자로 집계하지 않음
- capacity는 approved 상태만 집계
- 기존 참가자의 상태는 승인 방식 변경으로 자동 변경하지 않음

## 5. URL과 라우팅

이벤트 URL은 /{slug} 형식이다.

~~~text
https://<project>.vercel.app/zztpevrb
~~~

### Slug

- 영문 소문자와 숫자
- 정확히 8자
- nanoid 기반 생성
- 데이터베이스 unique index
- 생성 후 변경 불가
- 충돌 시 재생성

### 예약 경로

~~~text
/
/login
/admin
/api
~~~

### 애플리케이션 라우트

~~~text
/                         최소 안내와 관리자 로그인 링크
/login                    관리자 로그인
/admin                    관리자 이벤트 목록
/admin/events/new         이벤트 생성
/admin/events/[id]        이벤트 관리
/admin/events/[id]/registrations 참가자 관리
/[slug]                   공개 이벤트 페이지
/[slug]/cancel            참가 취소 결과 페이지
~~~

### API 라우트

~~~text
POST   /api/register
POST   /api/register/cancel
GET    /api/admin/events
POST   /api/admin/events
GET    /api/admin/events/[id]
PATCH  /api/admin/events/[id]
DELETE /api/admin/events/[id]
GET    /api/admin/events/[id]/registrations.csv
PATCH  /api/admin/registrations/[id]
POST   /api/admin/upload
POST   /api/admin/email
~~~

## 6. 정보 구조와 카피

### 공개 이벤트 페이지

데스크톱은 2컬럼, 모바일은 1컬럼으로 표시한다.

데스크톱 구조:

~~~text
왼쪽
- 대표 이미지
- 호스트명
- 승인된 참가자 수

오른쪽
- 이벤트 제목
- 날짜와 시간
- 장소 또는 온라인 링크
- 참가 상태
- Registration 카드
- 참가 신청 버튼
- About Event 본문
~~~

공개 페이지에 표시하지 않는 정보:

- 참가자 이름
- 참가자 이메일
- 신청 답변
- 관리자 이메일
- 내부 상태와 토큰

### Register 모달

모달 제목은 참가자 정보로 한다.

고정 필드:

- 이름: 필수
- 이메일: 필수
- 개인정보 수집·이용 동의: 필수 체크박스

동의 문구:

~~~text
행사 운영 및 참가 안내를 위한 개인정보 수집·이용에 동의합니다.
~~~

관리자 설정 필드:

~~~text
text
textarea
select
checkbox
~~~

필드 속성:

- id
- type
- label
- description
- placeholder
- required
- options
- sort_order

버튼과 상태 문구:

~~~text
참가 신청
신청 중...
참가 신청이 완료되었습니다.
이미 신청한 이메일입니다.
이 행사는 정원이 마감되었습니다.
참가 신청 기간이 아닙니다.
~~~

### 카피 원칙

- 한국어 기본
- 짧고 명확한 문장
- 따뜻하지만 과장하지 않는 톤
- 행사 내용과 참가 이유를 우선
- 관리자 UI는 실용적인 표현 사용
- 필요한 경우에만 Register, About Event 사용

기본 카피:

~~~text
AI 커뮤니티의 다음 만남을 시작하세요.
새로운 행사를 만들어보세요.
이 행사에 참여하려면 아래 정보를 입력해주세요.
행사 링크 복사
아직 만든 행사가 없습니다.
~~~

## 7. 이벤트 생성과 관리

### 이벤트 필드

관리자는 다음 필드를 입력한다.

~~~text
title                 필수, 최대 120자
description           필수, Markdown, 최대 20,000자
host_name             필수, 최대 80자
cover_image_path      선택
start_at              필수
end_at                필수
timezone              필수, 기본 Asia/Seoul
location_type         필수, in_person | online
location_name         in_person일 때 필수
location_url          online일 때 필수
map_url               선택
registration_enabled  기본 true
registration_open_at  선택
registration_close_at 선택
capacity              선택, null이면 무제한
approval_mode         auto | manual, 기본 auto
status                draft | published | cancelled, 기본 draft
~~~

제약:

- start_at < end_at
- capacity는 null 또는 0보다 큰 정수
- 장소 유형에 맞지 않는 필드는 비워도 됨
- published로 저장할 때 필수 필드 재검증
- cover image가 없으면 기본 placeholder 사용
- 이벤트 설명은 Markdown으로 저장하고 sanitize 후 렌더링

### 관리자 화면

admin:

- 이벤트 카드 목록
- 제목
- 상태
- 행사 날짜
- 참가자 수
- 신청 상태
- 공개 링크 복사
- 수정
- 삭제

이벤트 생성·수정 화면 섹션 순서:

1. 대표 이미지
2. 기본 정보
3. 날짜와 시간
4. 장소
5. 참가 설정
6. 신청 질문
7. 공개 상태
8. 미리보기와 저장

참가자 관리:

- 이름 검색
- 이메일 검색
- 상태 필터
- 신청 일시 정렬
- 승인
- 거절
- 취소
- CSV 다운로드
- 확인 이메일 재발송

CSV 컬럼:

~~~text
name,email,status,consent_at,registered_at,cancelled_at,answers
~~~

CSV 인코딩은 UTF-8 BOM으로 한다.

## 8. 참가 신청과 취소

### 신청 처리

POST /api/register는 다음을 수행한다.

1. 입력값 검증
2. 이벤트 공개 상태와 신청 가능 여부 확인
3. 신청 필드와 답변 검증
4. 개인정보 동의 확인
5. 이벤트 row lock
6. 중복 이메일 확인
7. 승인 인원과 정원 확인
8. registration 저장
9. 취소 토큰 hash 저장
10. 상태에 맞는 이메일 발송
11. 이메일 발송 결과 저장
12. 결과 반환

신청 질문은 해당 event_id에 속한 field만 허용한다. select 답변은 options에 존재하는 value인지 검증한다.

동시 신청으로 정원을 초과하지 않도록 transaction 또는 register_for_event RPC를 사용한다.

### 중복 이메일

이메일 비교 전 trim과 lowercase 정규화를 적용한다.

~~~text
normalized_email = trim(lower(email))
~~~

동일 이벤트에서 normalized email이 이미 approved 또는 pending 상태로 존재하면 재신청을 허용하지 않는다. rejected와 cancelled는 재신청을 허용한다.

### 참가 취소

확인 이메일에 다음 링크를 넣는다.

~~~text
https://<project>.vercel.app/{slug}/cancel?token=<token>
~~~

- token 원문은 저장하지 않고 hash만 저장
- 유효한 token만 취소 가능
- 취소 후 같은 이메일로 재신청 가능
- 취소 결과 페이지에서 이벤트 제목과 취소 상태 표시
- 관리자도 참가자 관리 화면에서 취소 가능

## 9. 이메일

Gmail SMTP와 Nodemailer를 사용한다. 이메일 발송 Route Handler는 Node.js runtime을 사용한다.

### 이메일 종류

~~~text
registration_approved
registration_pending
registration_rejected
registration_cancelled
~~~

상태별 발송 규칙:

~~~text
auto 신청 완료         -> registration_approved
manual 신청 접수       -> registration_pending
관리자 승인             -> registration_approved
관리자 거절             -> registration_rejected
참가자 또는 관리자 취소 -> registration_cancelled
이벤트 취소             -> registration_cancelled
~~~

범위:

- 리마인더 없음
- 뉴스레터 없음
- 마케팅 이메일 없음
- 각 이메일은 상태 안내와 이벤트 정보만 포함
- approved/pending 이메일에는 참가 취소 링크 포함
- rejected 이메일에는 취소 링크 없음
- cancelled 이메일에는 이벤트 취소 안내 포함

### 이메일 내용

공통 포함:

- 이벤트 제목
- 날짜와 시간
- 타임존
- 장소 또는 온라인 링크
- 참가자 이름
- 이벤트 페이지 링크

approved/pending:

- 참가 취소 링크

권장 제목:

~~~text
[참가 신청 완료] {event_title}
[신청 접수] {event_title}
[신청 결과 안내] {event_title}
[참가 취소 완료] {event_title}
~~~

### 재발송

이메일 발송 시도마다 email_deliveries에 별도 row를 생성한다.

- 자동 발송은 이메일 종류별 최초 1회
- 관리자가 재발송하면 attempt_no 증가
- 가장 최근 성공 시각과 실패 메시지를 관리자 화면에 표시
- 재발송은 기존 발송 row를 덮어쓰지 않음
- 참가 신청 자체는 이메일 발송 실패와 무관하게 성공 처리

## 10. 이미지와 Open Graph

### 이미지 업로드

Supabase Storage bucket:

~~~text
event-covers
~~~

클라이언트에서 업로드 전에 이미지를 WebP로 변환한다.

변환 기준:

- 입력 형식: JPG, PNG, WebP
- 입력 최대 크기: 10MB
- 출력 형식: WebP
- 출력 최대 크기: 2MB
- 최대 가로·세로: 1600px
- 대표 이미지 비율: 1:1
- 변환 실패 시 업로드 중단
- 관리자만 업로드·삭제 가능

권장 라이브러리:

~~~text
browser-image-compression
~~~

Storage 경로:

~~~text
event-covers/{event_id}/{random_filename}.webp
~~~

### Open Graph

/[slug]에서 generateMetadata를 사용한다.

~~~text
og:title       event.title
og:description description의 첫 160자
og:image       대표 이미지 public URL
og:url         이벤트 canonical URL
og:type        website
twitter:card   summary_large_image
~~~

대표 이미지가 없으면 /placeholders/event-og.webp를 사용한다.

직접 링크 이벤트이므로 다음을 추가한다.

~~~text
robots: noindex, nofollow
canonical: https://<project>.vercel.app/{slug}
~~~

## 11. 데이터 모델

### admin_users

~~~text
user_id       uuid primary key references auth.users on delete cascade
created_at    timestamptz not null default now()
~~~

### events

~~~text
id                       uuid primary key
slug                     varchar(8) not null unique
title                    text not null
description              text not null
cover_image_path         text
host_name                varchar(80) not null
start_at                 timestamptz not null
end_at                   timestamptz not null
timezone                 text not null default 'Asia/Seoul'
location_type            text not null
location_name            text
location_url             text
map_url                  text
registration_enabled     boolean not null default true
registration_open_at     timestamptz
registration_close_at    timestamptz
capacity                 integer
approval_mode            text not null default 'auto'
status                   text not null default 'draft'
created_by               uuid not null references auth.users
created_at               timestamptz not null default now()
updated_at               timestamptz not null default now()
~~~

Checks:

~~~text
location_type in ('in_person', 'online')
approval_mode in ('auto', 'manual')
status in ('draft', 'published', 'cancelled')
capacity is null or capacity > 0
start_at < end_at
~~~

### registration_fields

~~~text
id             uuid primary key
event_id       uuid not null references events on delete cascade
type           text not null
label          varchar(120) not null
description    text
placeholder    varchar(200)
options        jsonb
required       boolean not null default false
sort_order     integer not null default 0
created_at     timestamptz not null default now()
~~~

type:

~~~text
text | textarea | select | checkbox
~~~

select만 options를 사용한다.

options 예시:

~~~json
[
  { "label": "개발자", "value": "developer" },
  { "label": "기획자", "value": "planner" }
]
~~~

### registrations

~~~text
id                 uuid primary key
event_id           uuid not null references events on delete cascade
name               varchar(120) not null
email              text not null
normalized_email   text not null
answers            jsonb not null default '{}'
status             text not null
consent_at         timestamptz not null
cancel_token_hash  text not null
registered_at      timestamptz not null default now()
updated_at         timestamptz not null default now()
cancelled_at       timestamptz
~~~

status:

~~~text
pending | approved | rejected | cancelled
~~~

중복 방지:

~~~sql
create unique index registrations_event_email_unique
on registrations (event_id, normalized_email)
where status in ('pending', 'approved');
~~~

### email_deliveries

~~~text
id               uuid primary key
registration_id  uuid not null references registrations on delete cascade
email_type       text not null
attempt_no       integer not null
to_email         text not null
status           text not null
sent_at          timestamptz
error_message    text
created_at       timestamptz not null default now()
~~~

Unique:

~~~text
unique(registration_id, email_type, attempt_no)
~~~

status:

~~~text
pending | sent | failed
~~~

## 12. API 계약

모든 JSON API는 Content-Type application/json을 사용한다. 실패 응답은 공통 형식을 사용한다.

~~~json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자에게 표시할 메시지"
  }
}
~~~

### POST /api/register

Request:

~~~json
{
  "eventId": "uuid",
  "name": "홍길동",
  "email": "user@example.com",
  "answers": {
    "field-uuid": "answer"
  },
  "consent": true,
  "website": ""
}
~~~

website는 honeypot이며 값이 있으면 저장하지 않고 성공처럼 응답한다.

Response 201:

~~~json
{
  "registrationId": "uuid",
  "status": "approved",
  "emailStatus": "sent"
}
~~~

manual 이벤트의 status는 pending이다.

emailStatus:

~~~text
sent | failed
~~~

필수 오류 코드:

~~~text
INVALID_INPUT
EVENT_NOT_FOUND
REGISTRATION_NOT_OPEN
EVENT_FULL
DUPLICATE_EMAIL
CONSENT_REQUIRED
UNAUTHORIZED
FORBIDDEN
INVALID_STATUS_TRANSITION
NOT_FOUND
INTERNAL_ERROR
~~~

### POST /api/register/cancel

Request:

~~~json
{
  "slug": "zztpevrb",
  "token": "raw-cancel-token"
}
~~~

Response 200:

~~~json
{
  "registrationId": "uuid",
  "status": "cancelled"
}
~~~

### GET /api/admin/events

Query:

~~~text
status: all | draft | published | cancelled
q: title search
~~~

Response:

~~~json
{
  "events": [
    {
      "id": "uuid",
      "slug": "zztpevrb",
      "title": "AI 행사",
      "status": "published",
      "registrationState": "open",
      "approvedCount": 12,
      "capacity": 100,
      "startAt": "2026-08-07T10:00:00.000Z"
    }
  ]
}
~~~

### POST /api/admin/events

Request:

~~~json
{
  "title": "AI Agent Meetup",
  "description": "행사 설명",
  "hostName": "Lama Community",
  "coverImagePath": null,
  "startAt": "2026-08-07T10:00:00.000Z",
  "endAt": "2026-08-07T12:00:00.000Z",
  "timezone": "Asia/Seoul",
  "locationType": "in_person",
  "locationName": "Seoul",
  "locationUrl": null,
  "mapUrl": null,
  "registrationEnabled": true,
  "registrationOpenAt": null,
  "registrationCloseAt": null,
  "capacity": 100,
  "approvalMode": "auto",
  "status": "draft",
  "fields": [
    {
      "type": "select",
      "label": "참여 유형",
      "description": null,
      "placeholder": null,
      "options": [
        { "label": "개발자", "value": "developer" }
      ],
      "required": true,
      "sortOrder": 0
    }
  ]
}
~~~

이벤트를 먼저 draft로 생성한 뒤 반환된 event id를 사용해 대표 이미지를 업로드한다. 업로드 성공 후 coverImagePath를 PATCH한다. 대표 이미지 없이 published 저장하는 경우 기본 placeholder를 사용한다.

Response 201:

~~~json
{
  "event": {
    "id": "uuid",
    "slug": "zztpevrb",
    "status": "draft",
    "publicUrl": "https://<project>.vercel.app/zztpevrb"
  }
}
~~~

### GET /api/admin/events/[id]

Response:

~~~json
{
  "event": {},
  "fields": [],
  "registrationSummary": {
    "pending": 0,
    "approved": 0,
    "rejected": 0,
    "cancelled": 0
  }
}
~~~

event는 생성 Request와 같은 필드를 반환한다.

### PATCH /api/admin/events/[id]

Request:

~~~json
{
  "title": "수정된 행사 제목",
  "status": "published",
  "registrationEnabled": true,
  "fields": []
}
~~~

전달한 필드만 수정한다. Response는 수정된 event를 반환한다.

fields가 전달되면 기존 registration_fields를 모두 삭제한 뒤 전달된 배열로 교체한다. fields가 생략되면 기존 질문을 유지한다.

### DELETE /api/admin/events/[id]

- 관리자 확인 후 이벤트와 관련된 fields, registrations, email_deliveries, Storage 이미지를 삭제
- 성공 Response 204
- 이미 삭제된 이벤트는 EVENT_NOT_FOUND

### PATCH /api/admin/registrations/[id]

Request:

~~~json
{
  "status": "approved"
}
~~~

허용 전이:

~~~text
pending -> approved
pending -> rejected
approved -> cancelled
~~~

approved/rejected 상태 변경 시 해당 상태 이메일을 발송한다.

emailType은 registration_approved, registration_pending, registration_rejected, registration_cancelled 중 하나만 허용한다.

### GET /api/admin/events/[id]/registrations.csv

- 관리자만 접근
- UTF-8 BOM CSV
- 컬럼은 name,email,status,consent_at,registered_at,cancelled_at,answers
- 답변 JSON은 하나의 answers 컬럼에 JSON 문자열로 저장

### POST /api/admin/upload

Request:

~~~text
multipart/form-data
file: WebP image
eventId: uuid
~~~

검증:

- 관리자 세션
- eventId 소유권
- WebP MIME type
- 최대 2MB
- 최대 1600x1600

Response 201:

~~~json
{
  "path": "event-covers/event-id/random.webp",
  "publicUrl": "https://..."
}
~~~

### POST /api/admin/email

Request:

~~~json
{
  "registrationId": "uuid",
  "emailType": "registration_approved"
}
~~~

서버는 해당 registration의 다음 attempt_no를 생성한다.

Response 201:

~~~json
{
  "deliveryId": "uuid",
  "status": "sent",
  "attemptNo": 2
}
~~~

발송 실패 시에도 HTTP 201을 반환하고 status는 failed, errorMessage를 함께 반환한다. 재발송 시 attemptNo는 transaction으로 증가시킨다.

## 13. 인증과 보안

### Auth

- Supabase Auth 이메일·비밀번호
- 회원가입 UI 없음
- 로그인 세션은 @supabase/ssr cookie 방식
- /admin과 모든 관리자 API는 세션 확인
- 관리자 여부는 admin_users.user_id = auth.uid()로 확인
- 로그인 실패 메시지는 계정 존재 여부를 노출하지 않음

### RLS

모든 public schema 테이블에 RLS를 활성화한다.

정책 기준:

- events: published/cancelled 공개 조회, 관리자 CRUD
- registration_fields: published/cancelled 이벤트 공개 조회, 관리자 CRUD
- registrations: 관리자만 조회·수정·삭제
- email_deliveries: 관리자만 조회·수정
- admin_users: 본인 여부 확인에 필요한 최소 접근
- Storage event-covers: 공개 read, 관리자 insert/update/delete

참가 신청은 public table 직접 insert가 아니라 register_for_event RPC만 사용한다.

register_for_event는 다음을 transaction으로 처리한다.

1. 이벤트 row lock
2. 신청 가능 여부 확인
3. 필드와 답변 검증
4. normalized email 중복 확인
5. approved count와 capacity 확인
6. status 결정
7. cancel token hash 저장
8. registration 생성

RPC는 SECURITY DEFINER로 만들고 search_path를 고정한다.

### 입력과 콘텐츠

- 모든 API 입력은 Zod 검증
- 이메일 trim/lowercase
- Markdown은 허용 태그만 렌더링
- 외부 URL은 https 또는 허용된 URL만 사용
- 파일 이름은 사용자 입력을 사용하지 않음
- 서비스 키와 Gmail 앱 비밀번호는 서버 환경변수에만 저장
- honeypot으로 단순 봇 요청 차단

## 14. 기술 스택과 의존성

### 애플리케이션

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Server Components
- Route Handlers
- 이메일 Route Handler는 Node.js runtime

### UI

- shadcn/ui
- Radix UI primitives
- Lucide icons
- 자체 디자인 토큰

사용할 shadcn/ui:

~~~text
Button
Card
Badge
Dialog
Form
Input
Textarea
Select
Checkbox
Calendar
Popover
Table
AlertDialog
Sonner
Skeleton
~~~

### 의존성

~~~text
@supabase/ssr
@supabase/supabase-js
react-hook-form
zod
@hookform/resolvers
date-fns
date-fns-tz
lucide-react
react-markdown
rehype-sanitize
nanoid
nodemailer
browser-image-compression
~~~

동일 목적의 별도 UI 라이브러리는 추가하지 않는다.

## 15. 디자인 시스템

### 색상 토큰

~~~css
--background: #f8f5ff;
--foreground: #1d1728;
--primary: #7c4dce;
--primary-foreground: #ffffff;
--muted: #eee9f7;
--muted-foreground: #766d82;
--border: #e5def0;
--card: #ffffff;
--destructive: #c94b62;
--radius: 18px;
~~~

### 레이아웃

- 최대 콘텐츠 너비: 1280px
- 데스크톱 좌측 컬럼: 420px
- 데스크톱 컬럼 간격: 64px
- 모바일 breakpoint: 768px
- 모바일 좌우 여백: 20px
- 카드 radius: 18px
- 기본 버튼 높이: 48px
- 모바일 주요 버튼: width 100%
- 대표 이미지 비율: 1:1
- 본문 최대 너비: 720px
- Featured / Category 영역은 구현하지 않는다.

### 상태 UI

모든 비동기 화면에 다음 상태를 구현한다.

~~~text
idle
loading
success
error
empty
~~~

필수 예외:

- 존재하지 않는 slug
- draft 이벤트 접근
- cancelled 이벤트
- 신청 시작 전
- 신청 마감
- 정원 마감
- 중복 이메일
- 이미지 용량 초과
- 잘못된 이미지 형식
- 세션 만료
- Gmail 발송 실패
- Supabase 연결 실패

## 16. 프로젝트 구조

~~~text
app/
  page.tsx
  login/page.tsx
  admin/page.tsx
  admin/events/new/page.tsx
  admin/events/[id]/page.tsx
  admin/events/[id]/registrations/page.tsx
  [slug]/page.tsx
  [slug]/cancel/page.tsx
  api/register/route.ts
  api/register/cancel/route.ts
  api/admin/events/route.ts
  api/admin/events/[id]/route.ts
  api/admin/events/[id]/registrations.csv/route.ts
  api/admin/registrations/[id]/route.ts
  api/admin/upload/route.ts
  api/admin/email/route.ts
components/
  ui/
  event/
  registration/
  admin/
  shared/
lib/
  supabase/
  auth.ts
  validations.ts
  slug.ts
  email.ts
  formatting.ts
supabase/
  migrations/0001_initial.sql
  seed.sql
public/
  placeholders/event-og.webp
tests/
  e2e/
middleware.ts
components.json
tailwind.config.ts
next.config.ts
vercel.json
README.md
LICENSE
.env.example
~~~

필수 scripts:

~~~json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test:e2e": "playwright test"
}
~~~

## 17. 환경변수와 배포

### .env.example

~~~env
NEXT_PUBLIC_APP_URL=https://<project>.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
GMAIL_USER=
GMAIL_APP_PASSWORD=
~~~

secret key와 Gmail 앱 비밀번호는 브라우저 코드에 노출하지 않는다.

### Vercel

- GitHub 저장소 연결
- Production URL은 *.vercel.app
- 모든 환경변수 등록
- NEXT_PUBLIC_APP_URL에 실제 Production URL 설정
- 이메일 Route Handler는 Node.js runtime 사용

### Supabase

1. 프로젝트 생성
2. migration 실행
3. RLS 정책 실행
4. event-covers bucket 생성
5. 관리자 Auth 사용자 생성
6. admin_users에 관리자 user id 추가
7. Auth redirect URL에 Vercel URL 추가
8. Storage 정책 확인

### Gmail

1. 전용 Gmail 계정 생성 또는 사용
2. 2단계 인증 활성화
3. 앱 비밀번호 생성
4. Vercel 환경변수에 입력
5. 테스트 이벤트에서 수신 확인

### 오픈소스

- LICENSE는 MIT로 생성한다.
- README에는 설치, 환경변수, Supabase 설정, Vercel 배포 절차를 포함한다.

## 18. 테스트 기준과 완료 조건

### Playwright 핵심 시나리오

1. 관리자가 로그인한다.
2. 일반 방문자가 /admin에 접근하면 /login으로 이동한다.
3. 관리자가 이벤트를 draft로 생성한다.
4. draft 이벤트가 공개 URL에서 보이지 않는다.
5. 관리자가 대표 이미지를 업로드한다.
6. 관리자가 이벤트를 published로 변경한다.
7. 8자리 slug 공개 URL이 동작한다.
8. 공개 페이지의 OG 메타데이터가 이벤트 값으로 생성된다.
9. 방문자가 참가 신청 모달을 연다.
10. 고정 필드와 추가 필드를 입력한다.
11. 개인정보 동의 없이 제출할 수 없다.
12. auto 이벤트 신청이 approved로 저장된다.
13. manual 이벤트 신청이 pending으로 저장된다.
14. pending 참가자를 관리자가 approve한다.
15. pending 참가자를 관리자가 reject한다.
16. 중복 이메일 신청이 차단된다.
17. 정원 초과 신청이 차단된다.
18. 참가 취소 링크가 동작한다.
19. 이메일 발송 실패가 참가 신청 실패가 되지 않는다.
20. 관리자 이메일 재발송이 새 delivery row를 만든다.
21. CSV가 UTF-8 BOM으로 다운로드된다.
22. cancelled 이벤트는 안내를 표시하고 신청을 막는다.
23. 참가자 개인정보가 공개 HTML과 API에 노출되지 않는다.

### MVP 완료 조건

- 관리자만 이벤트 생성 가능
- 이벤트 URL은 /{8자리 slug}
- 공개 이벤트 목록 없음
- 대표 이미지 업로드와 WebP 압축 동작
- 독자적인 이벤트 상세 페이지 동작
- 이벤트별 신청 질문 동작
- auto/manual 승인 동작
- 정원과 신청 기간 동작
- 참가 취소 링크 동작
- 참가 상태 이메일 동작
- 이메일 재발송 동작
- OG 메타데이터 동작
- 개인정보 동의 저장
- 참가자 목록·검색·필터·CSV 동작
- RLS와 관리자 권한 검증 동작
- Vercel과 Supabase Free에서 배포 가능
