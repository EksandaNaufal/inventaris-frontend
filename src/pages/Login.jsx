import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 422) {
        setError('Email atau password salah.');
      } else {
        setError('Terjadi kesalahan. Coba lagi.');
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dekorasi siluet menara di background */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none select-none">
        <svg viewBox="0 0 400 400" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
          <g fill="white">
            <rect x="60" y="180" width="16" height="160" />
            <rect x="324" y="180" width="16" height="160" />
            <path d="M50 180 L90 180 L90 140 L50 140 Z" />
            <path d="M314 180 L354 180 L354 140 L314 140 Z" />
            <circle cx="200" cy="80" r="10" />
            <rect x="195" y="90" width="10" height="90" />
            <path d="M160 220 Q200 160 240 220 Z" />
          </g>
        </svg>
      </div>

      <div className="relative w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-[fadeIn_0.4s_ease-out]">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-brand-800 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-gold-400" strokeWidth={1.75} />
            </div>
            <h1 className="font-display text-xl font-bold text-brand-800">Inventaris MA</h1>
            <p className="text-sm text-gray-500">Ali Maksum Krapyak</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-3 py-2 mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                  placeholder="admin@maalimaksum.sch.id"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-800 hover:bg-brand-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-brand-900/20"
            >
              {submitting ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="text-center text-brand-100/60 text-xs mt-6">
          Sistem Informasi Inventaris Barang
        </p>
      </div>
    </div>
  );
}

export default Login;