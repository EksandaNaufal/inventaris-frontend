import { useEffect, useState } from 'react';
import api from '../Api/axios';
import { Tags, Plus, Trash2, X } from 'lucide-react';
import { useUI } from '../context/UIContext';

function KelolaKategori() {
  const [kategoris, setKategoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast, confirm } = useUI();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nama_kategori: '', keterangan: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/kategoris');
      setKategoris(res.data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await api.post('/kategoris', formData);
      setFormData({ nama_kategori: '', keterangan: '' });
      setShowForm(false);
      fetchData();
      toast.success('Kategori berhasil ditambahkan.');
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormError(Object.values(err.response.data.errors).flat().join(', '));
      } else {
        setFormError('Gagal menyimpan kategori.');
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    const ok = await confirm(
      `Yakin ingin menghapus kategori "${nama}"? Barang yang memakai kategori ini juga akan terhapus.`,
      { title: 'Hapus Kategori', danger: true }
    );
    if (!ok) return;
    try {
      await api.delete(`/kategoris/${id}`);
      fetchData();
      toast.success('Kategori berhasil dihapus.');
    } catch (err) {
      toast.error('Gagal menghapus kategori.');
      console.error(err);
    }
  };

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
          <h1 className="font-display text-2xl font-bold text-brand-800">Kelola Kategori</h1>
          <p className="text-sm text-gray-400">{kategoris.length} kategori terdaftar</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-brand-800 hover:bg-brand-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Tutup' : 'Tambah Kategori'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="font-display text-lg font-semibold text-brand-800 mb-4">Tambah Kategori Baru</h2>
          {formError && <p className="text-red-500 text-sm mb-3 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Kategori</label>
              <input type="text" name="nama_kategori" value={formData.nama_kategori} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                placeholder="Alat Tulis Kantor" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan (opsional)</label>
              <input type="text" name="keterangan" value={formData.keterangan} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                placeholder="Pulpen, pensil, penghapus, dll" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={submitting}
                className="bg-brand-800 hover:bg-brand-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {submitting ? 'Menyimpan...' : 'Simpan Kategori'}
              </button>
            </div>
          </form>
        </div>
      )}

      {kategoris.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Tags className="h-10 w-10 text-gray-200 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-gray-400 text-sm">Belum ada kategori. Tambahkan kategori pertama kamu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kategoris.map((kat) => (
            <div key={kat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-gold-400/15 text-gold-500 flex items-center justify-center flex-shrink-0">
                <Tags className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800">{kat.nama_kategori}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{kat.keterangan || 'Tidak ada keterangan'}</p>
              </div>
              <button
                onClick={() => handleDelete(kat.id, kat.nama_kategori)}
                className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KelolaKategori;