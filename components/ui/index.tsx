import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

// ─── Stat Card ────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'pink' | 'blue' | 'yellow' | 'green';
  trend?: string;
}
export function StatCard({ label, value, icon: Icon, color = 'pink', trend }: StatCardProps) {
  const colors = {
    pink: { bg: '#FFF0F6', icon: '#FF6BAD', border: 'rgba(255,107,173,0.15)' },
    blue: { bg: '#EBF4FF', icon: '#4DA6FF', border: 'rgba(77,166,255,0.15)' },
    yellow: { bg: '#FFFBE8', icon: '#FFD166', border: 'rgba(255,209,102,0.2)' },
    green: { bg: '#F0FDF4', icon: '#22c55e', border: 'rgba(34,197,94,0.15)' },
  };
  const c = colors[color];
  return (
    <div className="bg-white rounded-2xl p-5 border card-hover"
      style={{ borderColor: c.border, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
          <Icon size={18} style={{ color: c.icon }} />
        </div>
        {trend && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <p className="text-2xl font-black mb-1" style={{ color: '#1A1F5E' }}>{value}</p>
      <p className="text-sm text-gray-500 font-semibold">{label}</p>
    </div>
  );
}

// ─── Page Header ──────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-black" style={{ color: '#1A1F5E', fontFamily: 'Playfair Display, serif' }}>{title}</h1>
        {subtitle && <p className="text-gray-500 font-semibold mt-1 text-sm">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-black text-lg mb-2" style={{ color: '#1A1F5E' }}>{title}</h3>
      <p className="text-gray-500 font-semibold text-sm mb-6 max-w-xs mx-auto">{description}</p>
      {action}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pink' | 'blue' | 'yellow' | 'green' | 'red' | 'gray';
  className?: string;
}
export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  const styles = {
    pink: 'bg-pink-50 text-pink-600 border-pink-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100',
  };
  return (
    <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1', styles[variant], className)}>
      {children}
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: LucideIcon;
}
export function Button({ variant = 'primary', size = 'md', loading, icon: Icon, children, className, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'text-white hover:opacity-90 hover:scale-[1.02]',
    secondary: 'bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-100',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
  };
  const sizes = { sm: 'px-3 py-2 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3.5 text-base' };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      style={variant === 'primary' ? { background: 'linear-gradient(135deg, #FF6BAD, #FF8DC7)', boxShadow: '0 4px 16px rgba(255,107,173,0.25)' } : {}}
      disabled={disabled || loading}
      {...props}>
      {loading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? <Icon size={size === 'sm' ? 14 : 16} /> : null}
      {children}
    </button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-3xl shadow-2xl w-full animate-fade-in max-h-[90vh] flex flex-col', widths[size])}>
        <div className="flex items-center justify-between p-6 border-b border-pink-50 shrink-0">
          <h2 className="text-lg font-black" style={{ color: '#1A1F5E' }}>{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-xl font-bold">×</button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
}
export function Input({ label, error, prefix, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-bold text-gray-700">{label}</label>}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">{prefix}</span>
        )}
        <input
          className={cn(
            'w-full py-3 px-4 rounded-xl border-2 border-gray-100 outline-none text-sm font-semibold transition-all focus:border-pink-300 bg-white',
            prefix && 'pl-8',
            error && 'border-red-300',
            className
          )}
          style={{ fontFamily: 'Nunito, sans-serif' }}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}
export function Select({ label, options, error, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-bold text-gray-700">{label}</label>}
      <select
        className={cn(
          'w-full py-3 px-4 rounded-xl border-2 border-gray-100 outline-none text-sm font-semibold transition-all focus:border-pink-300 bg-white appearance-none',
          error && 'border-red-300',
          className
        )}
        style={{ fontFamily: 'Nunito, sans-serif' }}
        {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}
export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-bold text-gray-700">{label}</label>}
      <textarea
        className={cn('w-full py-3 px-4 rounded-xl border-2 border-gray-100 outline-none text-sm font-semibold transition-all focus:border-pink-300 bg-white resize-none', className)}
        style={{ fontFamily: 'Nunito, sans-serif' }}
        {...props}
      />
    </div>
  );
}
