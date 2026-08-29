import { useEffect, useState } from 'react';
import api from '../Api/axios';
import { Package, Plus, X, Pencil, Trash2 } from 'lucide-react';

function KelolaBarang() {
  const [barangs, setBarangs] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    kode_barang: '', nama_barang: '', kategori_id: '', jumlah: '', satuan: '', keterangan: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [selectedBarang, setSelectedBarang] = useState(null);

  const [editingBarang, setEditingBarang] = useState(null);
  const [editFormData, setEditFormData] = useState({
    kode_barang: '', nama_barang: '', kategori_id: '', jumlah: '', satuan: '', keterangan: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);

  const fetchData = async () => {
    try {
      const [barangRes, kategoriRes] = await Promise.all([api.get('/barangs'), api.get('/kategoris')]);
      setBarangs(barangRes.data);
      setKategoris(kategoriRes.data);
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
      await api.post('/barangs', formData);
      setFormData({ kode_barang: '', nama_barang: '', kategori_id: '', jumlah: '', satuan: '', keterangan: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormError(Object.values(err.response.data.errors).flat().join(', '));
      } else {
        setFormError('Gagal menyimpan data barang.');
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Yakin ingin menghapus "${nama}"?`)) return;
    try {
      await api.delete(`/barangs/${id}`);
      setSelectedBarang(null);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus barang.');
      console.error(err);
    }
  };

  const openEditModal = (barang) => {
    setEditingBarang(barang);
    setEditFormData({
      kode_barang: barang.kode_barang,
      nama_barang: barang.nama_barang,
      kategori_id: barang.kategori_id,
      jumlah: barang.jumlah,
      satuan: barang.satuan,
      keterangan: barang.keterangan ?? '',
    });
    setEditError(null);
    setSelectedBarang(null);
  };

  const handleEditChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    setEditError(null);
    try {
      await api.put(`/barangs/${editingBarang.id}`, editFormData);
      setEditingBarang(null);
      fetchData();
    } catch (err) {
      if (err.response?.data?.errors) {
        setEditError(Object.values(err.response.data.errors).flat().join(', '));
      } else {
        setEditError('Gagal menyimpan perubahan.');
      }
      console.error(err);
    } finally {
      setEditSubmitting(false);
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
          <h1 className="font-display text-2xl font-bold text-brand-800">Kelola Barang</h1>
          <p className="text-sm text-gray-400">{barangs.length} jenis barang terdaftar</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-brand-800 hover:bg-brand-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Tutup' : 'Tambah Barang'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="font-display text-lg font-semibold text-brand-800 mb-4">Tambah Barang Baru</h2>
          {formError && <p className="text-red-500 text-sm mb-3 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Barang</label>
              <input type="text" name="kode_barang" value={formData.kode_barang} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow" placeholder="BRG-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Barang</label>
              <input type="text" name="nama_barang" value={formData.nama_barang} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow" placeholder="Sapu Lidi" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
              <select name="kategori_id" value={formData.kategori_id} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow">
                <option value="">Pilih Kategori</option>
                {kategoris.map((kat) => <option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Satuan</label>
              <input type="text" name="satuan" value={formData.satuan} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow" placeholder="pcs / buah / pak" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stok Awal</label>
              <input type="number" name="jumlah" value={formData.jumlah} onChange={handleChange} required min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan (opsional)</label>
              <input type="text" name="keterangan" value={formData.keterangan} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={submitting}
                className="bg-brand-800 hover:bg-brand-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {submitting ? 'Menyimpan...' : 'Simpan Barang'}
              </button>
            </div>
          </form>
        </div>
      )}

      {barangs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package className="h-10 w-10 text-gray-200 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-gray-400 text-sm">Belum ada data barang. Tambahkan barang pertama kamu.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/70 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Kode</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Nama Barang</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Kategori</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Stok</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Satuan</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {barangs.map((barang) => (
                  <tr key={barang.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{barang.kode_barang}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedBarang(barang)} className="flex items-center gap-2.5 text-left group">
                        <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
                          <Package className="h-4 w-4" strokeWidth={1.75} />
                        </div>
                        <span className="font-medium text-gray-800 group-hover:text-brand-600 transition-colors">{barang.nama_barang}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{barang.kategori?.nama_kategori ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${barang.jumlah < 5 ? 'text-red-600' : 'text-gray-800'}`}>{barang.jumlah}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{barang.satuan}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEditModal(barang)} className="text-gray-400 hover:text-brand-600 transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(barang.id, barang.nama_barang)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedBarang && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4" onClick={() => setSelectedBarang(null)}>
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                  <Package className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h2 className="font-display text-xl font-bold text-brand-800">{selectedBarang.nama_barang}</h2>
              </div>
              <button onClick={() => setSelectedBarang(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Kode Barang</span>
                <span className="font-medium text-gray-800">{selectedBarang.kode_barang}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Kategori</span>
                <span className="font-medium text-gray-800">{selectedBarang.kategori?.nama_kategori ?? '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Stok Saat Ini</span>
                <span className="font-medium text-gray-800">{selectedBarang.jumlah} {selectedBarang.satuan}</span>
              </div>
              <div className="py-2">
                <span className="text-gray-500 block mb-1">Keterangan</span>
                <p className="text-gray-800">
                  {selectedBarang.keterangan?.trim() ? selectedBarang.keterangan : <span className="text-gray-400 italic">Tidak ada keterangan</span>}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => openEditModal(selectedBarang)} className="flex-1 border border-brand-200 text-brand-700 hover:bg-brand-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Edit</button>
              <button onClick={() => handleDelete(selectedBarang.id, selectedBarang.nama_barang)} className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Hapus</button>
              <button onClick={() => setSelectedBarang(null)} className="flex-1 bg-brand-800 hover:bg-brand-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {editingBarang && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4" onClick={() => setEditingBarang(null)}>
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-brand-800">Edit Barang</h2>
              <button onClick={() => setEditingBarang(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {editError && <p className="text-red-500 text-sm mb-3 bg-red-50 rounded-lg px-3 py-2">{editError}</p>}
            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Barang</label>
                <input type="text" name="kode_barang" value={editFormData.kode_barang} onChange={handleEditChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Barang</label>
                <input type="text" name="nama_barang" value={editFormData.nama_barang} onChange={handleEditChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
                <select name="kategori_id" value={editFormData.kategori_id} onChange={handleEditChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">Pilih Kategori</option>
                  {kategoris.map((kat) => <option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Satuan</label>
                <input type="text" name="satuan" value={editFormData.satuan} onChange={handleEditChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Stok</label>
                <input type="number" name="jumlah" value={editFormData.jumlah} onChange={handleEditChange} required min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <p className="text-xs text-gray-400 mt-1">Ubah stok di sini hanya untuk koreksi.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan</label>
                <input type="text" name="keterangan" value={editFormData.keterangan} onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="md:col-span-2 flex gap-2 mt-2">
                <button type="submit" disabled={editSubmitting}
                  className="flex-1 bg-brand-800 hover:bg-brand-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {editSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button type="button" onClick={() => setEditingBarang(null)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default KelolaBarang;