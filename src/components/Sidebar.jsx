import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../Api/axios';
import { LayoutDashboard, Package, Tags, PackagePlus, PackageMinus, Building2, AlertTriangle } from 'lucide-react';

const BATAS_STOK_MENIPIS = 5;

function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  const [stokMenipisCount, setStokMenipisCount] = useState(0);

  useEffect(() => {
    const fetchStok = async () => {
      try {
        const res = await api.get('/barangs');
        setStokMenipisCount(res.data.filter((b) => b.jumlah < BATAS_STOK_MENIPIS).length);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStok();
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['kepala_sapras', 'staff'] },
    { name: 'Kelola Barang', path: '/kelola-barang', icon: Package, roles: ['kepala_sapras'] },
    { name: 'Kelola Kategori', path: '/kelola-kategori', icon: Tags, roles: ['kepala_sapras'] },
    { name: 'Barang Masuk', path: '/barang-masuk', icon: PackagePlus, roles: ['kepala_sapras', 'staff'] },
    { name: 'Barang Keluar', path: '/barang-keluar', icon: PackageMinus, roles: ['kepala_sapras', 'staff'] },
  ];

  const visibleMenus = menuItems.filter((item) => item.roles.includes(user?.role));

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-brand-800 text-white z-30 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:sticky md:top-0 md:h-screen md:self-start flex flex-col`}
      >
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-gold-400" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="font-display text-base font-bold leading-tight">Inventaris MA</h1>
            <p className="text-xs text-brand-100/70">Ali Maksum Krapyak</p>
          </div>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          {visibleMenus.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-brand-100 hover:bg-white/10'
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Ringkasan stok menipis */}
        <div className="p-3">
          <NavLink
            to="/kelola-barang"
            onClick={() => setIsOpen(false)}
            className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3.5 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-gold-400" strokeWidth={2} />
              <p className="text-xs font-semibold text-white">Stok Menipis</p>
            </div>
            {stokMenipisCount > 0 ? (
              <p className="text-xs text-brand-100/70">
                <span className="text-lg font-bold text-white font-display">{stokMenipisCount}</span> jenis barang perlu direstok
              </p>
            ) : (
              <p className="text-xs text-brand-100/70">Semua stok masih aman</p>
            )}
          </NavLink>
        </div>

        <div className="px-4 py-3 text-xs text-brand-100/40 border-t border-white/10">
          Sistem Informasi Inventaris
        </div>
      </aside>
    </>
  );
}

export default Sidebar;