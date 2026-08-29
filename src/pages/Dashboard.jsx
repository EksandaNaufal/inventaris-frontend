import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../Api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Tags,
  ArrowLeftRight,
  AlertTriangle,
  PackagePlus,
  PackageMinus,
  Sparkles,
} from 'lucide-react';

const BATAS_STOK_MENIPIS = 5;

function Dashboard() {
  const { user } = useAuth();
  const [barangs, setBarangs] = useState([]);
  const [totalKategori, setTotalKategori] = useState(0);
  const [barangMasuks, setBarangMasuks] = useState([]);
  const [barangKeluars, setBarangKeluars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barangRes, kategoriRes, masukRes, keluarRes] = await Promise.all([
          api.get('/barangs'),
          api.get('/kategoris'),
          api.get('/barang-masuks'),
          api.get('/barang-keluars'),
        ]);

        setBarangs(barangRes.data);
        setTotalKategori(kategoriRes.data.length);
        setBarangMasuks(masukRes.data);
        setBarangKeluars(keluarRes.data);
      } catch (err) {
        setError('Gagal memuat data. Pastikan server Laravel sedang berjalan.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const today = new Date().toISOString().split('T')[0];

  const transaksiHariIni =
    barangMasuks.filter((item) => item.tanggal_masuk === today).length +
    barangKeluars.filter((item) => item.tanggal_keluar === today).length;

  const stokMenipis = barangs
    .filter((barang) => barang.jumlah < BATAS_STOK_MENIPIS)
    .sort((a, b) => a.jumlah - b.jumlah);

  const aktivitas = [
    ...barangMasuks.map((item) => ({
      id: `masuk-${item.id}`,
      tipe: 'masuk',
      tanggal: item.tanggal_masuk,
      nama_barang: item.barang?.nama_barang ?? '-',
      jumlah: item.jumlah,
      satuan: item.barang?.satuan ?? '',
      keterangan: item.sumber || 'Restok barang',
      createdAt: item.created_at,
    })),
    ...barangKeluars.map((item) => ({
      id: `keluar-${item.id}`,
      tipe: 'keluar',
      tanggal: item.tanggal_keluar,
      nama_barang: item.barang?.nama_barang ?? '-',
      jumlah: item.jumlah,
      satuan: item.barang?.satuan ?? '',
      keterangan: item.penerima ? `Diambil oleh ${item.penerima}` : 'Barang keluar',
      createdAt: item.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const formatTanggal = (tanggal) =>
    new Date(tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  const hariIni = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const namaDepan = user?.name?.split(' ')[0] ?? '';

  const stats = [
    { label: 'Total Jenis Barang', value: barangs.length, icon: Package, color: 'bg-brand-50 text-brand-700' },
    { label: 'Total Kategori', value: totalKategori, icon: Tags, color: 'bg-gold-400/15 text-gold-500' },
    { label: 'Transaksi Hari Ini', value: transaksiHariIni, icon: ArrowLeftRight, color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-400">{hariIni}</p>
          <h1 className="font-display text-2xl font-bold text-brand-800">
            Halo, {namaDepan} 👋
          </h1>
        </div>

        <div className="flex gap-2">
          <Link
            to="/barang-masuk"
            className="flex items-center gap-1.5 bg-brand-800 hover:bg-brand-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <PackagePlus className="h-4 w-4" />
            Barang Masuk
          </Link>
          <Link
            to="/barang-keluar"
            className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <PackageMinus className="h-4 w-4" />
            Barang Keluar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                <Icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-brand-800 font-display">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start" >
        {/* Stok Menipis */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" strokeWidth={2} />
            <h2 className="font-display text-lg font-semibold text-brand-800">Stok Menipis</h2>
            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
              &lt; {BATAS_STOK_MENIPIS}
            </span>
          </div>

          {stokMenipis.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-8 w-8 text-brand-200 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm text-gray-400">Semua stok barang masih aman.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stokMenipis.map((barang) => (
                <div
                  key={barang.id}
                  className="flex items-center justify-between py-2.5 px-3 bg-red-50/70 rounded-xl"
                >
                  <span className="text-sm font-medium text-gray-800">{barang.nama_barang}</span>
                  <span className="text-sm font-bold text-red-600">
                    {barang.jumlah} <span className="font-normal text-red-400">{barang.satuan}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aktivitas Terbaru */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-display text-lg font-semibold text-brand-800 mb-4">Aktivitas Terbaru</h2>

          {aktivitas.length === 0 ? (
            <div className="text-center py-8">
              <ArrowLeftRight className="h-8 w-8 text-gray-200 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm text-gray-400">Belum ada aktivitas.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {aktivitas.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div
                    className={`mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.tipe === 'masuk'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {item.tipe === 'masuk' ? (
                      <PackagePlus className="h-4 w-4" strokeWidth={2.25} />
                    ) : (
                      <PackageMinus className="h-4 w-4" strokeWidth={2.25} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{item.nama_barang}</span>{' '}
                      {item.tipe === 'masuk' ? 'masuk' : 'keluar'} {item.jumlah} {item.satuan}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.keterangan} • {formatTanggal(item.tanggal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;