import './globals.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';

export const metadata: Metadata = { title: 'Lama', description: 'AI 커뮤니티 이벤트 생성과 참가 신청' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko" className={GeistSans.variable}><body>{children}</body></html>;
}
