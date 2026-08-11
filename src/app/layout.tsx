import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TikTok Spy',
  description: 'Theo dõi sản phẩm TikTok Shop theo từ khoá',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
