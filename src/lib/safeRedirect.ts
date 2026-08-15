function trustedOrigin(): string | null {
  if (!process.env.AUTH_URL) return null;
  try {
    return new URL(process.env.AUTH_URL).origin;
  } catch {
    return null;
  }
}

// callbackUrl đến từ query string do người dùng kiểm soát — nếu dùng thẳng làm redirectTo sẽ mở
// lỗ hổng open-redirect. Auth.js/proxy luôn tạo callbackUrl dạng URL TUYỆT ĐỐI (vd
// "https://host/admin"), không phải path tương đối, nên phải parse rồi so sánh origin với
// AUTH_URL thay vì chỉ check tiền tố "/" (check đó sẽ luôn fail và rơi về "/").
export function sanitizeRedirect(value: unknown): string {
  if (typeof value !== 'string' || value === '') return '/';
  if (value.startsWith('/') && !value.startsWith('//')) return value;

  try {
    const url = new URL(value);
    if (url.origin === trustedOrigin()) return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    // không phải URL tuyệt đối hợp lệ — rơi xuống fallback bên dưới
  }

  return '/';
}
