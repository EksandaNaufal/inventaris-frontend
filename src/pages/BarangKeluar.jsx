import { useEffect, useState } from 'react';
import api from '../Api/axios';
import { useAuth } from '../context/AuthContext';
import { PackageMinus, Plus, X, Trash2 } from 'lucide-react';

function BarangKeluar() {
  const { user } = useAuth();
  const [riwayat, setRiwayat] = useState([]);
  const [barangs, setBarangs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    barang_id: '', jumlah: '', tanggal_keluar: new Date().toISOString().split('T')[0],
    penerima: '', kelas: '', tujuan: '', keterangan: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchData = async () => {
    try {
      const [riwayatRes, barangRes] = await Promise.all([api.get('/barang-keluars'), api.get('/barangs')]);
      setRiwayat(riwayatRes.data);
      setBarangs(barangRes.data);
    } catch (err) {
      setError('Gagal memuat data. Pastikan server Laravel sedang berjalan.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const selectedBarang = barangs.find((b) => b.id === Number(formData.barang_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await api.post('/barang-keluars', { ...formData, user_id: user.id });
      setFormData({
        barang_id: '', jumlah: '', tanggal_keluar: new Date().toISOString().split('T')[0],
        penerima: '', kelas: '', tujuan: '', keterangan: '',
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.message) {
        setFormError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        setFormError(Object.values(err.response.data.errors).flat().join(', '));
      } else {
        setFormError('Gagal menyimpan data barang keluar.');
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus riwayat ini? Stok barang akan dikembalikan.')) return;
    try {
      await api.delete(`/barang-keluars/${id}`);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus data.');
      console.error(err);
    }
  };

  const formatTanggal = (tanggal) =>
    new Date(tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 h-14 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-800">Barang Keluar</h1>
          <p className="text-sm text-gray-400">{riwayat.length} transaksi tercatat</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-brand-800 hover:bg-brand-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Tutup' : 'Catat Barang Keluar'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="font-display text-lg font-semibold text-brand-800 mb-4">Catat Barang Keluar</h2>

          {barangs.length === 0 ? (
            <p className="text-sm text-gray-500">
              Belum ada barang terdaftar. Silakan tambahkan barang terlebih dahulu di menu{' '}
              <span className="font-medium">Kelola Barang</span>.
            </p>
          ) : (
            <>
              {formError && <p className="text-red-500 text-sm mb-3 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Barang</label>
                  <select name="barang_id" value={formData.barang_id} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">Pilih Barang</option>
                    {barangs.map((b) => (
                      <option key={b.id} value={b.id}>{b.nama_barang} (stok: {b.jumlah} {b.satuan})</option>
                    ))}
                  </select>
                  {selectedBarang && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      Stok tersedia: <span className="font-semibold">{selectedBarang.jumlah} {selectedBarang.satuan}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah Keluar</label>
                  <input type="number" name="jumlah" value={formData.jumlah} onChange={handleChange} required min="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Keluar</label>
                  <input type="date" name="tanggal_keluar" value={formData.tanggal_keluar} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Penerima</label>
                  <input type="text" name="penerima" value={formData.penerima} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Nama siswa/staff" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kelas (opsional)</label>
                  <input type="text" name="kelas" value={formData.kelas} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="XI IPA 1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tujuan (opsional)</label>
                  <input type="text" name="tujuan" value={formData.tujuan} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Kebutuhan piket kelas" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan (opsional)</label>
                  <input type="text" name="keterangan" value={formData.keterangan} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={submitting}
                    className="bg-brand-800 hover:bg-brand-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                    {submitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {riwayat.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <PackageMinus className="h-10 w-10 text-gray-200 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-gray-400 text-sm">Belum ada riwayat barang keluar.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/70 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Tanggal</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Barang</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Jumlah</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Penerima</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Kelas</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Tujuan</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{formatTanggal(item.tanggal_keluar)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                          <PackageMinus className="h-4 w-4" strokeWidth={1.75} />
                        </div>
                        <span className="font-medium text-gray-800">{item.barang?.nama_barang ?? '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-orange-700">
                      -{item.jumlah} {item.barang?.satuan}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.penerima}</td>
                    <td className="px-4 py-3 text-gray-600">{item.kelas || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.tujuan || '-'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default BarangKeluar;