import { useState } from 'react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Address } from '../../types';
import { Modal } from '../../components/common/Modal';

export default function AccountAddressesPage() {
  useDocumentTitle('Saved Addresses');
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useAuthStore();
  const showToast = useToastStore((s) => s.showToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [houseLine, setHouseLine] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [type, setType] = useState<Address['type']>('Home');
  const [isDefault, setIsDefault] = useState(true);
  const [error, setError] = useState('');

  const openNew = () => {
    setEditing(null);
    setFullName('');
    setPhone('');
    setPincode('');
    setHouseLine('');
    setLocality('');
    setCity('');
    setStateName('');
    setType('Home');
    setIsDefault(true);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditing(addr);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setPincode(addr.pincode);
    setHouseLine(addr.houseLine);
    setLocality(addr.locality);
    setCity(addr.city);
    setStateName(addr.state);
    setType(addr.type);
    setIsDefault(addr.isDefault);
    setError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !/^[6-9]\d{9}$/.test(phone) || !/^[1-9]\d{5}$/.test(pincode) || !houseLine.trim() || !city.trim() || !stateName.trim()) {
      setError('Please fill all required fields with a valid 10-digit phone and 6-digit pincode.');
      return;
    }

    if (editing) {
      updateAddress({
        id: editing.id,
        fullName: fullName.trim(),
        phone,
        pincode,
        houseLine: houseLine.trim(),
        locality: locality.trim() || city.trim(),
        city: city.trim(),
        state: stateName.trim(),
        type,
        isDefault,
      });
      showToast('Address updated');
    } else {
      addAddress({
        fullName: fullName.trim(),
        phone,
        pincode,
        houseLine: houseLine.trim(),
        locality: locality.trim() || city.trim(),
        city: city.trim(),
        state: stateName.trim(),
        type,
        isDefault,
      });
      showToast('Address added');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#282C3F]">Saved Addresses</h2>
        <button
          type="button"
          onClick={openNew}
          className="h-10 px-4 rounded-lg bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="p-4 border border-[#EAEAEC] rounded-lg bg-white flex flex-col justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#282C3F]">
                  {addr.fullName}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#F5F5F6] text-[10px] font-bold uppercase text-[#535766]">
                  {addr.type}
                </span>
              </div>
              <p className="text-[#535766]">
                {addr.houseLine}, {addr.locality}, {addr.city}, {addr.state} -{' '}
                {addr.pincode}
              </p>
              <p className="text-[#535766]">Mobile: {addr.phone}</p>
              {addr.isDefault && (
                <p className="text-[11px] font-bold text-[#14958F] flex items-center gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Default Address
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-[#F5F5F6]">
              <button
                type="button"
                onClick={() => openEdit(addr)}
                className="inline-flex items-center gap-1 font-bold text-[#282C3F] hover:text-[#FF3F6C] cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAddress(addr.id);
                  showToast('Address removed', 'info');
                }}
                className="inline-flex items-center gap-1 font-bold text-[#535766] hover:text-[#ba1a1a] cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
              {!addr.isDefault && (
                <button
                  type="button"
                  onClick={() => setDefaultAddress(addr.id)}
                  className="ml-auto font-bold text-[#FF3F6C] hover:underline cursor-pointer"
                >
                  Make Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <input
            type="text"
            placeholder="Full Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="tel"
              maxLength={10}
              placeholder="10-digit Mobile *"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="h-10 px-3 rounded border border-[#EAEAEC]"
            />
            <input
              type="text"
              maxLength={6}
              placeholder="6-digit Pincode *"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              className="h-10 px-3 rounded border border-[#EAEAEC]"
            />
          </div>
          <input
            type="text"
            placeholder="Flat, House No., Building *"
            value={houseLine}
            onChange={(e) => setHouseLine(e.target.value)}
            className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
          />
          <input
            type="text"
            placeholder="Locality / Area"
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="City *"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-10 px-3 rounded border border-[#EAEAEC]"
            />
            <input
              type="text"
              placeholder="State *"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              className="h-10 px-3 rounded border border-[#EAEAEC]"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-2">
              {(['Home', 'Work', 'Other'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-1 rounded-full border font-semibold cursor-pointer ${
                    type === t
                      ? 'border-[#FF3F6C] bg-[#FFF0F4] text-[#FF3F6C]'
                      : 'border-[#EAEAEC] text-[#535766]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="accent-[#FF3F6C]"
              />
              <span>Default</span>
            </label>
          </div>
          {error && <p className="text-[#ba1a1a]">{error}</p>}
          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-[#FF3F6C] text-white font-bold uppercase tracking-wider cursor-pointer"
          >
            Save Address
          </button>
        </form>
      </Modal>
    </div>
  );
}
