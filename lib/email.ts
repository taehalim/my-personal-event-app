import nodemailer from 'nodemailer';
import { appUrl } from '@/lib/formatting';
import type { LamaEvent, RegistrationStatus } from '@/lib/types';

function transport() { return nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } }); }
export async function sendRegistrationEmail(type: 'registration_approved'|'registration_pending'|'registration_rejected'|'registration_cancelled', event: LamaEvent, registration: {name: string; email: string; cancelToken?: string}, reason?: string) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) throw new Error('Gmail 환경변수가 설정되지 않았습니다.');
  const labels: Record<string, [string,string]> = { registration_approved: ['[참가 신청 완료]', '참가 신청이 완료되었습니다.'], registration_pending: ['[신청 접수]', '신청이 접수되었습니다. 관리자 승인 후 참가가 확정됩니다.'], registration_rejected: ['[신청 결과 안내]', '아쉽게도 이번 이벤트 참가 신청이 승인되지 않았습니다.'], registration_cancelled: ['[참가 취소 완료]', reason ?? '참가 신청이 취소되었습니다.'] };
  const [prefix, message] = labels[type];
  const cancel = registration.cancelToken ? `\n참가 취소: ${appUrl(`/${event.slug}/cancel?token=${registration.cancelToken}`)}` : '';
  await transport().sendMail({ from: process.env.GMAIL_USER, to: registration.email, subject: `${prefix} ${event.title}`, text: `${registration.name}님,\n\n${message}\n\n이벤트: ${event.title}\n이벤트 페이지: ${appUrl(`/${event.slug}`)}${cancel}` });
}
export function statusEmailType(status: RegistrationStatus) { return status === 'approved' ? 'registration_approved' : status === 'pending' ? 'registration_pending' : status === 'rejected' ? 'registration_rejected' : 'registration_cancelled'; }
