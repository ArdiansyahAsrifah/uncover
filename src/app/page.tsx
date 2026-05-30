"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert, ShieldCheck, Search, Mail, AlertTriangle,
  Clock, Activity, User, CheckCircle, Info, Lock,
  Trash2, RefreshCw, ArrowLeft, Plus, ExternalLink,
  Camera
} from 'lucide-react';
import { FlaggedComment, MonitoredAccount } from '@/lib/types';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function formatLastScan(dateStr: string | null): string {
  if (!dateStr) return 'Belum pernah di-scan';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit yang lalu`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} jam yang lalu`;
  return `${Math.floor(diffHr / 24)} hari yang lalu`;
}

function RiskBadge({ level }: { level: string }) {
  const styles =
    level === 'Berbahaya'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : level === 'Mencurigakan'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${styles}`}>
      {level}
    </span>
  );
}

// ─────────────────────────────────────────────
// VIEW: LANDING
// ─────────────────────────────────────────────
function LandingView({ onEnter }: { onEnter: (email: string) => void }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) onEnter(email.trim());
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-12 py-10">
      <div className="flex-1 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium">
          <ShieldCheck size={16} />
          <span>Deteksi Dini Cyberbullying</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
          Karena orang tua seharusnya tahu,{' '}
          <span className="text-indigo-600">sebelum terlambat.</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Pantau kolom komentar Instagram anak Anda secara otomatis tanpa perlu
          menyadap HP mereka. Dapatkan laporan jika terdeteksi kata-kata berbahaya.
        </p>
        <ul className="space-y-3 pt-4">
          {[
            'Tanpa perlu login akun Instagram anak',
            'Mendeteksi bahasa gaul & singkatan toxic',
            'Scan ulang kapan saja dengan satu klik',
          ].map((item, idx) => (
            <li key={idx} className="flex items-center gap-3 text-slate-700">
              <CheckCircle size={20} className="text-emerald-500 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <h2 className="text-2xl font-bold mb-2 text-center">Masuk ke Dashboard</h2>
          <p className="text-slate-500 text-sm text-center mb-6">
            Gunakan email Anda untuk melihat akun yang sedang dipantau.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Mail size={16} /> Email Orang Tua
              </label>
              <input
                type="email"
                required
                placeholder="email.anda@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none"
              />
              <p className="text-xs text-slate-500 flex items-start gap-1">
                <Lock size={12} className="mt-0.5 shrink-0" />
                Semua akun yang terhubung ke email ini akan ditampilkan.
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              <Search size={20} />
              Lihat Dashboard Saya
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// VIEW: SCANNING (overlay saat scan berjalan)
// ─────────────────────────────────────────────
function ScanningOverlay({ username }: { username: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm px-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-100 rounded-full flex items-center justify-center">
            <Camera className="text-indigo-600 animate-pulse" size={36} />
          </div>
          <svg className="absolute top-0 left-0 w-20 h-20 animate-spin" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="46"
              fill="none" stroke="currentColor" strokeWidth="4"
              className="text-indigo-600"
              strokeDasharray="289"
              strokeDashoffset="72"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Menganalisis @{username}...</h3>
          <p className="text-slate-500 text-sm mt-1">
            Proses ini membutuhkan 1–2 menit. Mohon tunggu.
          </p>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100 inline-flex items-center gap-2">
          <Activity size={16} className="text-indigo-500 animate-bounce" />
          Mendeteksi kata-kata berbahaya...
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL: Tambah Akun Baru
// ─────────────────────────────────────────────
function AddAccountModal({
  email,
  onClose,
  onSuccess,
}: {
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [username, setUsername] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setScanning(true);
    setError('');

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.replace('@', ''), email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan');
        setScanning(false);
        return;
      }
      onSuccess();
    } catch {
      setError('Gagal menghubungi server. Coba lagi.');
      setScanning(false);
    }
  };

  return (
    <>
      {scanning && <ScanningOverlay username={username.replace('@', '')} />}
      <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Tambah Akun Baru</h2>
          <p className="text-slate-500 text-sm mb-6">
            Masukkan username Instagram anak yang ingin dipantau.
          </p>
          <form onSubmit={handleScan} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User size={16} /> Username Instagram
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-medium">@</span>
                <input
                  type="text"
                  required
                  placeholder="username_anak"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={scanning}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 transition-all"
              >
                <Search size={18} />
                Scan Sekarang
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// VIEW: DASHBOARD
// ─────────────────────────────────────────────
function DashboardView({
  email,
  accounts,
  loading,
  onAddAccount,
  onDeleteAccount,
  onScanAgain,
  onViewDetail,
}: {
  email: string;
  accounts: MonitoredAccount[];
  loading: boolean;
  onAddAccount: () => void;
  onDeleteAccount: (id: string) => void;
  onScanAgain: (account: MonitoredAccount) => void;
  onViewDetail: (account: MonitoredAccount) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Pantauan</h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
            <Mail size={14} /> {email}
          </p>
        </div>
        <button
          onClick={onAddAccount}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus size={18} />
          Tambah Akun
        </button>
      </div>

      {/* Grid akun */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
              <div className="h-8 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-20 text-slate-400 space-y-3">
          <ShieldAlert size={48} className="mx-auto text-slate-300" />
          <p className="font-medium text-slate-500">Belum ada akun yang dipantau.</p>
          <p className="text-sm">Klik <strong>Tambah Akun</strong> untuk mulai memantau.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              onDelete={() => onDeleteAccount(acc.id)}
              onScanAgain={() => onScanAgain(acc)}
              onViewDetail={() => onViewDetail(acc)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENT: Account Card
// ─────────────────────────────────────────────
function AccountCard({
  account,
  onDelete,
  onScanAgain,
  onViewDetail,
}: {
  account: MonitoredAccount;
  onDelete: () => void;
  onScanAgain: () => void;
  onViewDetail: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Top */}
      <div className="flex items-start justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onViewDetail}
        >
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Camera size={20} className="text-indigo-600" />
          </div>
          <div>
            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              @{account.instagram_username}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock size={11} />
              {formatLastScan(account.last_scanned_at)}
            </p>
          </div>
        </div>
        {confirmDelete ? (
          <div className="flex gap-1">
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              onClick={onDelete}
              className="text-xs px-2 py-1 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-600"
            >
              Hapus
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-slate-300 hover:text-rose-500 transition-colors p-1"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onViewDetail}
          className="flex-1 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          Lihat Hasil
        </button>
        <button
          onClick={onScanAgain}
          className="flex-1 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <RefreshCw size={14} />
          Scan Lagi
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// VIEW: DETAIL
// ─────────────────────────────────────────────
function DetailView({
  account,
  email,
  onBack,
}: {
  account: MonitoredAccount;
  email: string;
  onBack: () => void;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/accounts/${account.id}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [account.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const totalDangerous = comments.filter((c) => c.risk_level === 'Berbahaya').length;
  const overallRisk =
    totalDangerous > 0 ? 'Tinggi' : comments.length > 0 ? 'Sedang' : 'Aman';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Hasil Scan{' '}
            <span className="text-indigo-600">@{account.instagram_username}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Scan terakhir: {formatLastScan(account.last_scanned_at)}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: <Search size={24} />,
            bg: 'bg-slate-100',
            color: 'text-slate-600',
            label: 'Total Komentar Discan',
            value: loading ? '...' : comments.length,
            valueColor: 'text-slate-900',
          },
          {
            icon: <AlertTriangle size={24} />,
            bg: 'bg-rose-100',
            color: 'text-rose-600',
            label: 'Komentar Terindikasi',
            value: loading ? '...' : comments.length,
            valueColor: 'text-rose-600',
          },
          {
            icon: <Activity size={24} />,
            bg: overallRisk === 'Tinggi' ? 'bg-rose-100' : overallRisk === 'Sedang' ? 'bg-amber-100' : 'bg-emerald-100',
            color: overallRisk === 'Tinggi' ? 'text-rose-600' : overallRisk === 'Sedang' ? 'text-amber-600' : 'text-emerald-600',
            label: 'Tingkat Risiko',
            value: loading ? '...' : overallRisk,
            valueColor: overallRisk === 'Tinggi' ? 'text-rose-600' : overallRisk === 'Sedang' ? 'text-amber-600' : 'text-emerald-600',
          },
        ].map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`${card.bg} ${card.color} p-3 rounded-lg`}>{card.icon}</div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comments */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Komentar Terindikasi Cyberbullying</h3>
          <span className="text-xs font-medium bg-slate-200 text-slate-700 px-2 py-1 rounded-md">
            {loading ? '...' : comments.length} data
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Activity size={32} className="mx-auto animate-spin text-indigo-400" />
            <p className="text-sm">Memuat data...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShieldCheck size={40} className="mx-auto text-emerald-400" />
            <p className="font-semibold text-slate-700">Tidak ada komentar berbahaya ditemukan</p>
            <p className="text-sm text-slate-400">Akun ini tampak aman dari cyberbullying.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {comments.map((comment, idx) => (
              <div key={idx} className="p-6 space-y-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">@{comment.commenter_username}</span>
                  <RiskBadge level={comment.risk_level} />
                </div>
                <div className="p-3 bg-slate-100 rounded-lg text-slate-800 text-sm border-l-4 border-slate-300">
                  {comment.comment_text
                    .split(new RegExp(`(${(comment.detected_words as string[]).join('|')})`, 'gi'))
                    .map((part: string, i: number) =>
                      (comment.detected_words as string[])
                        .map((w: string) => w.toLowerCase())
                        .includes(part.toLowerCase()) ? (
                        <span key={i} className="bg-rose-200 text-rose-900 font-semibold px-1 rounded mx-px">
                          {part}
                        </span>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>
                    <strong>Deteksi:</strong>{' '}
                    <span className="text-rose-600">{(comment.detected_words as string[]).join(', ')}</span>
                  </span>
                  {comment.post_url && (
                    <a
                      href={comment.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-indigo-500 hover:underline"
                    >
                      <ExternalLink size={12} /> Lihat Post
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rekomendasi */}
      {!loading && comments.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Info size={18} className="text-indigo-600" />
            Rekomendasi Langkah Selanjutnya
          </h3>
          <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
            <li><strong>Ajak Anak Berdiskusi:</strong> Tanyakan kondisi mereka dengan lembut tanpa menghakimi.</li>
            <li><strong>Gunakan Fitur Filter Instagram:</strong> Bantu anak mengatur filter komentar di pengaturan privasi akun mereka.</li>
            <li><strong>Simpan Bukti:</strong> Screenshot dan data komentar dapat digunakan sebagai bukti jika perlu melapor ke pihak sekolah atau berwenang.</li>
          </ul>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'detail'>('landing');
  const [email, setEmail] = useState('');
  const [accounts, setAccounts] = useState<MonitoredAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<MonitoredAccount | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [scanningAccount, setScanningAccount] = useState<MonitoredAccount | null>(null);

  const fetchAccounts = useCallback(async (emailParam: string) => {
    setLoadingAccounts(true);
    try {
      const res = await fetch(`/api/accounts?email=${encodeURIComponent(emailParam)}`);
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch {
      setAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  const handleEnter = (emailVal: string) => {
    setEmail(emailVal);
    setView('dashboard');
    fetchAccounts(emailVal);
  };

  const handleDeleteAccount = async (id: string) => {
    await fetch(`/api/accounts?id=${id}`, { method: 'DELETE' });
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleScanAgain = async (account: MonitoredAccount) => {
    setScanningAccount(account);
    try {
      await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: account.instagram_username, email }),
      });
      await fetchAccounts(email);
    } finally {
      setScanningAccount(null);
    }
  };

  const handleAddSuccess = async () => {
    setShowAddModal(false);
    await fetchAccounts(email);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Scanning overlay global (untuk scan again) */}
      {scanningAccount && <ScanningOverlay username={scanningAccount.instagram_username} />}

      {/* Modal tambah akun */}
      {showAddModal && (
        <AddAccountModal
          email={email}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => { setView('landing'); setEmail(''); setAccounts([]); }}
            >
              <img src="/logo_uncover.png" alt="Uncover" className="h-8 w-auto" />
              <span className="text-xl font-bold text-slate-900 tracking-tight">Uncover</span>
            </div>
            {view === 'detail' && (
              <button
                onClick={() => setView('dashboard')}
                className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={16} /> Kembali ke Dashboard
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'landing' && <LandingView onEnter={handleEnter} />}

        {view === 'dashboard' && (
          <DashboardView
            email={email}
            accounts={accounts}
            loading={loadingAccounts}
            onAddAccount={() => setShowAddModal(true)}
            onDeleteAccount={handleDeleteAccount}
            onScanAgain={handleScanAgain}
            onViewDetail={(acc) => { setSelectedAccount(acc); setView('detail'); }}
          />
        )}

        {view === 'detail' && selectedAccount && (
          <DetailView
            account={selectedAccount}
            email={email}
            onBack={() => setView('dashboard')}
          />
        )}
      </main>
    </div>
  );
}