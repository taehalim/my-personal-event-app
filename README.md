# Lama

직접 링크로 공유하는 AI 커뮤니티 이벤트 생성·참가 신청 MVP입니다.

## 시작하기

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`에 Supabase URL, Publishable Key, Secret Key를 입력합니다. Supabase SQL Editor에서 `supabase/migrations/0001_initial.sql`을 실행한 뒤 Auth에서 관리자 이메일·비밀번호 사용자를 만들고, 해당 UUID를 `admin_users`에 추가하세요.

```sql
insert into public.admin_users(user_id) values ('AUTH_USER_UUID');
```

Gmail SMTP를 사용하려면 2단계 인증과 앱 비밀번호를 설정하고 `GMAIL_USER`, `GMAIL_APP_PASSWORD`를 등록합니다. 이메일 환경변수가 없어도 참가 신청 자체는 성공하고 관리자 화면에는 발송 실패가 기록됩니다.

## 명령어

```bash
npm run typecheck
npm run lint
npm run build
```

## 배포

Vercel에 저장소를 연결하고 `.env.example`의 환경변수를 Production에 등록합니다. `NEXT_PUBLIC_APP_URL`은 실제 Vercel URL이어야 합니다. Supabase Auth Redirect URL에도 해당 URL을 추가하세요.

MIT License.
