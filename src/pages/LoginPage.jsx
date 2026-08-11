import { useNavigate } from 'react-router-dom';

/** Brand portal login. Rebuilt as JSX from the captured screenshot (the live
 *  page redirects when authenticated so we don't have a clean HTML capture).
 *  The user will iterate on this — kept minimal but visually consistent. */
export default function LoginPage() {
  const navigate = useNavigate();
  const onSignIn = (e) => {
    e.preventDefault();
    navigate('/brand/tonypikora/campaigns');
  };
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#fdfcfb', padding: 24 }}>
      <form
        onSubmit={onSignIn}
        style={{
          width: 420, background: '#fff', borderRadius: 16, padding: 32,
          boxShadow: '0 8px 24px rgba(0,0,0,.06)', border: '1px solid #ebebeb',
        }}
      >
        <img src="/images/biz/logo.svg" alt="Benable" style={{ height: 28, marginBottom: 24 }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Sign in</h1>
        <p style={{ color: '#6b7280', margin: '0 0 24px' }}>Welcome back to the Brand Portal.</p>

        <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>Email</label>
        <input type="email" placeholder="Your email address" required
               style={{ width: '100%', marginTop: 6, marginBottom: 14, padding: '10px 12px', border: '1px solid #d5d5d5', borderRadius: 8, fontSize: 14 }} />

        <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>Password</label>
        <input type="password" required
               style={{ width: '100%', marginTop: 6, marginBottom: 20, padding: '10px 12px', border: '1px solid #d5d5d5', borderRadius: 8, fontSize: 14 }} />

        <button type="submit"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 10, background: '#7a5cfa', color: '#fff', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          Sign in
        </button>

        <div style={{ marginTop: 16, fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
          Need an account? Create account · <a href="#" style={{ color: '#7a5cfa' }}>Forgot password</a>
        </div>
      </form>
    </div>
  );
}
