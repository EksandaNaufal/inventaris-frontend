import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../Api/axios';
import { Menu, LogOut, Bell } from 'lucide-react';
import { useUI } from '../context/UIContext';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/kelola-barang': 'Kelola Barang',
  '/kelola-kategori': 'Kelola Kategori',
  '/barang-masuk': 'Barang Masuk',
  '/barang-keluar': 'Barang Keluar',
};

const BATAS_STOK_MENIPIS = 5;

function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [stokMenipisCount, setStokMenipisCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [barangMenipis, setBarangMenipis] = useState([]);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchStok = async () => {
      try {
        const res = await api.get('/barangs');
        const menipis = res.data.filter((b) => b.jumlah < BATAS_STOK_MENIPIS);
        setBarangMenipis(menipis);
        setStokMenipisCount(menipis.length);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStok();
  }, [location.pathname]);

  // Tutup dropdown kalau klik di luar area notifikasi
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { confirm } = useUI();

  const handleLogout = async () => {
    const ok = await confirm('Yakin ingin keluar dari sistem?', { title: 'Keluar', danger: true });
    if (!ok) return;
    await logout();
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';
  const roleLabel = user?.role === 'kepala_sapras' ? 'Kepala Sapras' : 'Staff Sapras';
  const pageTitle = PAGE_TITLES[location.pathname] ?? '';

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-brand-800 hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="font-display text-base font-semibold text-brand-800 hidden md:block">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif((prev) => !prev)}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand-800 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {stokMenipisCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {stokMenipisCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-800">Stok Menipis</p>
              </div>
              {barangMenipis.length === 0 ? (
                <p className="text-sm text-gray-400 px-4 py-4">Semua stok masih aman.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {barangMenipis.map((b) => (
                    <div key={b.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50">
                      <span className="text-sm text-gray-700">{b.nama_barang}</span>
                      <span className="text-xs font-semibold text-red-600">
                        {b.jumlah} {b.satuan}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-gray-100 hidden sm:block" />

        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800 leading-tight">{user?.name ?? 'Sapras'}</p>
          <p className="text-xs text-gray-400 leading-tight">{roleLabel}</p>
        </div>
        <div className="h-9 w-9 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
          {initial}
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-red-500 hover:text-white hover:bg-red-500 font-medium border border-red-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}

export default Header;