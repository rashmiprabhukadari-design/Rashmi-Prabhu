import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Smartphone } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function LoginPage() {
  useDocumentTitle('Login or Sign Up');
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/account';

  const { loginWithOtp, loginWithGoogle } = useAuthStore();
  const showToast = useToastStore((s) => s.showToast);

  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError('Please enter a valid 10-digit Indian mobile number (starts with 6-9).');
      return;
    }
    setError('');
    setOtpSent(true);
    showToast('Demo OTP "123456" sent to your mobile', 'info');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim() !== '123456') {
      setError('Invalid OTP. Please enter demo OTP 123456.');
      return;
    }
    setError('');
    loginWithOtp(phone.trim(), 'customer');
    showToast('Signed in to StyleKart!');
    navigate(from, { replace: true });
  };

  const handleGoogleSignIn = () => {
    loginWithGoogle();
    showToast('Signed in with Google');
    navigate(from, { replace: true });
  };

  const handleAdminSignIn = () => {
    loginWithOtp('9999999999', 'admin');
    showToast('Signed in to StyleKart Admin Console');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-[75vh] bg-[#FAF8FF] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#EAEAEC] rounded-lg overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#FF3F6C] to-[#FF905A] p-6 text-white">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-90">
            StyleKart Member Access
          </p>
          <h1 className="text-2xl font-extrabold mt-1">
            FLAT ₹300 OFF + Free Shipping
          </h1>
          <p className="text-xs opacity-90 mt-1">
            Use code <span className="font-mono-tabular font-bold">FIRST300</span> on your first order
          </p>
        </div>

        <div className="p-6 space-y-5">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="login-phone"
                  className="block text-xs font-bold text-[#282C3F] mb-1.5"
                >
                  Login or Signup with Mobile Number
                </label>
                <div className="flex items-center border border-[#EAEAEC] rounded focus-within:border-[#282C3F] overflow-hidden">
                  <span className="px-3 text-xs font-bold text-[#535766] bg-[#F5F5F6] h-11 flex items-center border-r border-[#EAEAEC]">
                    +91
                  </span>
                  <input
                    id="login-phone"
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="flex-1 h-11 px-3 text-sm text-[#282C3F] outline-none tabular-nums"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="text-xs font-medium text-[#ba1a1a]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full h-11 rounded-lg bg-[#FF3F6C] hover:bg-[#E6325D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                Request OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-otp"
                    className="text-xs font-bold text-[#282C3F]"
                  >
                    Enter 6-Digit OTP sent to +91 {phone}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setError('');
                    }}
                    className="text-[11px] font-bold text-[#FF3F6C] cursor-pointer"
                  >
                    Change
                  </button>
                </div>
                <input
                  id="login-otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter demo OTP: 123456"
                  className="w-full h-11 px-3 rounded border border-[#EAEAEC] text-sm font-mono-tabular tracking-widest outline-none focus:border-[#282C3F]"
                />
                <p className="text-[11px] text-[#14958F] mt-1 font-medium">
                  Demo OTP is <strong className="font-mono-tabular">123456</strong>
                </p>
              </div>

              {error && (
                <p role="alert" className="text-xs font-medium text-[#ba1a1a]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full h-11 rounded-lg bg-[#FF3F6C] hover:bg-[#E6325D] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Verify &amp; Continue
              </button>
            </form>
          )}

          <div className="relative flex items-center justify-center text-[11px] text-[#94969F]">
            <span className="border-t border-[#EAEAEC] flex-1" />
            <span className="px-3">OR</span>
            <span className="border-t border-[#EAEAEC] flex-1" />
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-11 rounded-lg border border-[#EAEAEC] bg-white hover:border-[#282C3F] text-xs font-bold text-[#282C3F] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Continue with Google (Demo)</span>
            </button>

            <button
              type="button"
              onClick={handleAdminSignIn}
              className="w-full h-10 rounded-lg border border-[#14958F]/40 bg-[#14958F]/5 hover:bg-[#14958F]/10 text-xs font-bold text-[#14958F] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign in as Store Admin (Demo)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
