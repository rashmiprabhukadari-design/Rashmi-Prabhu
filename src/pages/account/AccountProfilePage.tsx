import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function AccountProfilePage() {
  useDocumentTitle('Profile Details');
  const { user, updateProfile } = useAuthStore();
  const showToast = useToastStore((s) => s.showToast);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !/^[6-9]\d{9}$/.test(phone.trim())) {
      setError('Enter a valid name, email address, and 10-digit mobile number.');
      return;
    }
    setError('');
    updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    showToast('Profile details updated');
  };

  return (
    <div className="border border-[#EAEAEC] rounded-lg bg-white p-6 max-w-lg space-y-5">
      <h2 className="text-lg font-bold text-[#282C3F]">Profile Details</h2>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-[#282C3F] mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 px-3 rounded border border-[#EAEAEC] text-sm outline-none focus:border-[#282C3F]"
          />
        </div>
        <div>
          <label className="block font-bold text-[#282C3F] mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-3 rounded border border-[#EAEAEC] text-sm outline-none focus:border-[#282C3F]"
          />
        </div>
        <div>
          <label className="block font-bold text-[#282C3F] mb-1">Mobile Number</label>
          <input
            type="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            className="w-full h-11 px-3 rounded border border-[#EAEAEC] text-sm tabular-nums outline-none focus:border-[#282C3F]"
          />
        </div>

        {error && <p className="text-[#ba1a1a] font-medium">{error}</p>}

        <button
          type="submit"
          className="h-11 px-8 rounded-lg bg-[#FF3F6C] hover:bg-[#E6325D] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Save Details
        </button>
      </form>
    </div>
  );
}
