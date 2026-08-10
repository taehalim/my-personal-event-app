import './globals.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';

export const metadata: Metadata = {
  title: 'Inha의 이벤트',
  description: '이벤트 생성과 참가 신청',
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko" className={GeistSans.variable}><body>{children}</body></html>;
}
