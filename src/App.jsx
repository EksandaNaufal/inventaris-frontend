import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KelolaBarang from './pages/KelolaBarang';
import BarangMasuk from './pages/BarangMasuk';
import BarangKeluar from './pages/BarangKeluar';
import KelolaKategori from './pages/KelolaKategori';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/barang-masuk" element={<BarangMasuk />} />
            <Route path="/barang-keluar" element={<BarangKeluar />} />

            <Route
              path="/kelola-barang"
              element={
                <ProtectedRoute allowedRoles={['kepala_sapras']}>
                  <KelolaBarang />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kelola-kategori"
              element={
                <ProtectedRoute allowedRoles={['kepala_sapras']}>
                  <KelolaKategori />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;