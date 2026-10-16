import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';
import { UserIcon, LockIcon, EyeIcon, PhoneIcon, MailIcon, ShieldCheckIcon, ArrowLeftIcon, CarIcon } from '../components/icons';
import heroImage from '../assets/login-hero.png';
import logo from '../assets/logo.png';

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors focus:border-accent-300 focus:bg-white focus:ring-2 focus:ring-accent-100';

// Only same-site paths are followed after login, never an absolute URL from the query string.
function safeNext(next) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/profile';
}

function Field({ label, icon: Icon, children, hint }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
        {children}
      </div>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

function PasswordInput({ value, onChange, autoComplete, placeholder = 'Enter your password' }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={6}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${inputClass} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
      >
        <EyeIcon off={show} className="h-4.5 w-4.5" />
      </button>
    </>
  );
}

const pillClass =
  'inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-primary shadow-md ring-1 ring-slate-200 backdrop-blur transition-colors hover:bg-white hover:text-accent-700';

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center overflow-y-auto bg-slate-100 px-4 pb-8 pt-4 sm:pt-6">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="absolute inset-0 bg-white/10" />

      {/* Always a clear way back to the site — not just the logo. */}
      <nav aria-label="Site" className="relative z-10 flex w-full max-w-5xl items-center justify-between gap-3">
        <Link to="/" className={pillClass}>
          <ArrowLeftIcon className="h-4 w-4" /> Back to Home
        </Link>
        <Link to="/cars" className={pillClass}>
          <CarIcon className="h-4 w-4" /> <span className="hidden sm:inline">Browse</span> Cars
        </Link>
      </nav>

      <div className="relative z-10 mt-4 w-full max-w-md">
        <Link to="/" className="mx-auto mb-4 block w-fit" aria-label="Roam Wheels home">
          <img src={logo} alt="Roam Wheels" className="h-20 w-auto drop-shadow-[0_1px_6px_rgba(255,255,255,0.9)]" />
        </Link>

        <div className="rounded-3xl bg-primary p-5 shadow-2xl sm:p-8">
          <div className="relative rounded-2xl bg-white p-6 pt-12 shadow-2xl sm:p-8 sm:pt-14">
            <span className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-primary shadow-lg ring-4 ring-white">
              <LockIcon className="h-6 w-6" />
            </span>
            <h1 className="text-center text-xl font-bold text-gray-900">{title}</h1>
            <p className="mb-6 mt-1 text-center text-xs text-gray-500">{subtitle}</p>
            {children}
            <p className="mt-5 text-center text-sm text-gray-600">{footer}</p>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-100">
            <ShieldCheckIcon className="h-3.5 w-3.5" /> Rent &middot; Roam &middot; Repeat
          </p>
        </div>

        <p className="mt-4 text-center text-sm font-semibold text-primary">
          <Link to="/" className="rounded-full bg-white/85 px-4 py-2 shadow-sm ring-1 ring-slate-200 backdrop-blur hover:bg-white hover:text-accent-700">
            Just looking? Continue to the home page &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}

function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 w-full cursor-pointer rounded-lg bg-accent px-4 py-3 text-sm font-bold text-primary shadow-md shadow-accent/20 transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function LoginPage() {
  const { customer, login } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const next = safeNext(params.get('next'));

  if (customer) return <Navigate to={customer.mustChangePassword ? `/change-password?next=${encodeURIComponent(next)}` : next} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const c = await login(mobile, password);
      if (c.mustChangePassword) {
        toast(`Welcome, ${c.name.split(' ')[0]}! Please set your own password to continue.`, { icon: '🔐' });
        navigate(`/change-password?next=${encodeURIComponent(next)}`, { replace: true });
        return;
      }
      toast.success(`Welcome back, ${c.name.split(' ')[0]}!`);
      navigate(next, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Customer Login"
      subtitle="Log in to book cars and see your trips"
      footer={
        <>
          New to Roam Wheels?{' '}
          <Link to={`/signup${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-accent-600 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Mobile Number" icon={PhoneIcon}>
          <input
            type="tel"
            inputMode="numeric"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            required
            pattern="[0-9]{10}"
            title="10-digit mobile number"
            autoFocus
            autoComplete="tel-national"
            placeholder="10-digit mobile number"
            className={inputClass}
          />
        </Field>
        <Field label="Password" icon={LockIcon}>
          <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
        </Field>
        <SubmitButton loading={loading}>{loading ? 'Logging in...' : 'Log In'}</SubmitButton>
      </form>
    </AuthShell>
  );
}

// Shown right after the first login of a customer our team created (or whose password we reset):
// they replace the temporary password before they can use the rest of the site.
export function ChangePasswordPage() {
  const { customer, signedOut, changePassword, logout } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ current: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const next = safeNext(params.get('next'));

  // Logged out from this page: go home rather than back to the login page.
  if (!customer) return <Navigate to={signedOut ? '/' : `/login?next=${encodeURIComponent(next)}`} replace />;

  const forced = customer.mustChangePassword;
  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (form.password === form.current) {
      toast.error('Choose a new password that is different from the current one');
      return;
    }
    setLoading(true);
    try {
      await changePassword(form.current, form.password);
      toast.success('Password updated');
      navigate(next, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update your password'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={forced ? 'Set Your Password' : 'Change Password'}
      subtitle={
        forced
          ? 'Your account was created by our team. For your security, please replace the temporary password before continuing.'
          : 'Choose a new password for your account'
      }
      footer={
        <button
          type="button"
          onClick={async () => {
            navigate('/', { replace: true });
            await logout();
          }}
          className="cursor-pointer font-semibold text-accent-600 hover:underline"
        >
          Log out
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label={forced ? 'Temporary Password' : 'Current Password'} icon={LockIcon}>
          <PasswordInput
            value={form.current}
            onChange={set('current')}
            autoComplete="current-password"
            placeholder={forced ? 'The password you just logged in with' : 'Your current password'}
          />
        </Field>
        <Field label="New Password" icon={LockIcon}>
          <PasswordInput value={form.password} onChange={set('password')} autoComplete="new-password" placeholder="At least 6 characters" />
        </Field>
        <Field label="Confirm New Password" icon={LockIcon}>
          <PasswordInput value={form.confirm} onChange={set('confirm')} autoComplete="new-password" placeholder="Re-enter your new password" />
        </Field>
        <SubmitButton loading={loading}>{loading ? 'Saving...' : 'Save Password'}</SubmitButton>
      </form>
    </AuthShell>
  );
}

export function SignupPage() {
  const { customer, signup } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', mobile: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const next = safeNext(params.get('next'));

  if (customer) return <Navigate to={next} replace />;

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signup({ name: form.name.trim(), mobile: form.mobile, email: form.email.trim(), password: form.password });
      toast.success('Welcome to Roam Wheels!');
      navigate(next, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Signup failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create Account"
      subtitle="Sign up to book your next ride in minutes"
      footer={
        <>
          Already have an account?{' '}
          <Link to={`/login${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-accent-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Full Name" icon={UserIcon}>
          <input
            value={form.name}
            onChange={(e) => set('name')(e.target.value)}
            required
            maxLength={50}
            autoFocus
            autoComplete="name"
            placeholder="Your full name"
            className={inputClass}
          />
        </Field>
        <Field label="Mobile Number" icon={PhoneIcon} hint="You'll use this to log in">
          <input
            type="tel"
            inputMode="numeric"
            value={form.mobile}
            onChange={(e) => set('mobile')(e.target.value.replace(/\D/g, '').slice(0, 10))}
            required
            pattern="[0-9]{10}"
            title="10-digit mobile number"
            autoComplete="tel-national"
            placeholder="10-digit mobile number"
            className={inputClass}
          />
        </Field>
        <Field label="Email (optional)" icon={MailIcon}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email')(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </Field>
        <Field label="Password" icon={LockIcon}>
          <PasswordInput value={form.password} onChange={set('password')} autoComplete="new-password" placeholder="At least 6 characters" />
        </Field>
        <Field label="Confirm Password" icon={LockIcon}>
          <PasswordInput value={form.confirm} onChange={set('confirm')} autoComplete="new-password" placeholder="Re-enter your password" />
        </Field>
        <SubmitButton loading={loading}>{loading ? 'Creating account...' : 'Sign Up'}</SubmitButton>
      </form>
    </AuthShell>
  );
}
