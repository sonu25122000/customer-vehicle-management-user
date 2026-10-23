import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';
import { checkResetToken, forgotPassword, sendLoginEmailCode, sendSignupEmailCode } from '../api/portal';
import EmailCodeStep from '../components/EmailCodeStep';
import { whatsappLink } from '../utils/contact';
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
            {footer && <p className="mt-5 text-center text-sm text-gray-600">{footer}</p>}
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

// "+91 | 98765 43210" — the mobile number both ways of logging in start with.
function MobileField({ value, onChange, autoFocus }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">Mobile Number</span>
      <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 transition-colors focus-within:border-accent-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-accent-100">
        <span className="flex items-center gap-1.5 border-r border-gray-200 py-3 pl-3 pr-2.5 text-sm font-semibold text-gray-500">
          <PhoneIcon className="h-4 w-4 text-gray-400" /> +91
        </span>
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
          required
          pattern="[0-9]{10}"
          title="10-digit mobile number"
          autoFocus={autoFocus}
          autoComplete="tel-national"
          placeholder="10-digit mobile number"
          className="w-full bg-transparent px-3 py-3 text-sm tracking-wide text-gray-900 outline-none"
        />
      </div>
    </label>
  );
}

function GetHelp() {
  return (
    <p className="mt-3 text-center text-xs text-gray-500">
      Having trouble logging in?{' '}
      <a
        href={whatsappLink('Hi Roam Wheels! I need help logging in to my account.')}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-accent-600 hover:underline"
      >
        Get help
      </a>
    </p>
  );
}

const switchClass = 'cursor-pointer font-semibold text-accent-600 hover:underline';

// Login: by default with a 6-digit code emailed to the account (no password to remember) — mobile
// number -> Get OTP -> enter the code. "Log in using Password" switches to the mobile + password form.
export function LoginPage() {
  const { customer, login, loginWithCode } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState('otp'); // 'otp' | 'password'
  const [mobile, setMobile] = useState(() => (/^[0-9]{10}$/.test(params.get('mobile') || '') ? params.get('mobile') : ''));
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // After "Get OTP": { email (masked), expiresAt, resendAt }.
  const [sent, setSent] = useState(null);
  const [code, setCode] = useState('');
  const next = safeNext(params.get('next'));
  const signupLink = `/signup${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`;

  if (customer) return <Navigate to={customer.mustChangePassword ? `/change-password?next=${encodeURIComponent(next)}` : next} replace />;

  function welcome(c) {
    toast.success(`Welcome back, ${c.name.split(' ')[0]}!`);
    navigate(next, { replace: true });
  }

  function switchToPassword() {
    setMode('password');
    setSent(null);
    setCode('');
  }

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const c = await login(mobile, password);
      if (c.mustChangePassword) {
        toast(`Welcome, ${c.name.split(' ')[0]}! Please set your own password to continue.`, { icon: '🔐' });
        navigate(`/change-password?next=${encodeURIComponent(next)}`, { replace: true });
        return;
      }
      welcome(c);
    } catch (err) {
      toast.error(errorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  }

  async function requestCode() {
    const result = await sendLoginEmailCode(mobile);
    setSent(result);
    setCode('');
    return result;
  }

  async function handleGetOtp(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await requestCode();
    } catch (err) {
      const errCode = err?.response?.data?.code;
      if (errCode === 'NO_EMAIL') {
        toast("There's no email on this account yet — please log in with your password.", { icon: '🔑' });
        switchToPassword();
      } else if (errCode === 'NO_ACCOUNT' || errCode === 'SIGNUP_REQUIRED') {
        toast.error(errorMessage(err));
        navigate(signupLink);
      } else {
        toast.error(errorMessage(err, 'Could not send the OTP'));
      }
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    try {
      await requestCode();
      toast.success('A new OTP is on its way');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not send the OTP'));
    }
  }

  async function verify(otp) {
    if (loading) return;
    setLoading(true);
    try {
      welcome(await loginWithCode(mobile, otp));
    } catch (err) {
      toast.error(errorMessage(err, 'Login failed'));
      setCode('');
    } finally {
      setLoading(false);
    }
  }

  // Step 2: the code. Logs in as soon as all 6 digits are in.
  if (mode === 'otp' && sent) {
    return (
      <AuthShell
        title="Verify with OTP"
        subtitle={`Sent to the email on your account for +91 ${mobile}`}
        footer={
          <>
            Log in using{' '}
            <button type="button" onClick={switchToPassword} className={switchClass}>
              Password
            </button>
          </>
        }
      >
        <EmailCodeStep
          email={sent.email}
          sent={sent}
          code={code}
          onCodeChange={(value) => {
            setCode(value);
            if (value.length === 6) verify(value);
          }}
          busy={loading}
          submitLabel="Verify & Log In"
          backLabel="Change number"
          onSubmit={verify}
          onResend={resendCode}
          onBack={() => setSent(null)}
        />
        <GetHelp />
      </AuthShell>
    );
  }

  const footer = (
    <>
      New to Roam Wheels?{' '}
      <Link to={signupLink} className="font-semibold text-accent-600 hover:underline">
        Create an account
      </Link>
    </>
  );

  if (mode === 'password') {
    return (
      <AuthShell title="Login with Password" subtitle="Log in to book cars and see your trips" footer={footer}>
        <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
          <MobileField value={mobile} onChange={setMobile} autoFocus={!mobile} />
          <Field label="Password" icon={LockIcon}>
            <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
          </Field>
          <Link
            to={`/forgot-password${mobile.length === 10 ? `?mobile=${mobile}` : ''}`}
            className="-mt-2 self-end text-sm font-semibold text-accent-600 hover:underline"
          >
            Forgot password?
          </Link>
          <SubmitButton loading={loading}>{loading ? 'Logging in...' : 'Log In'}</SubmitButton>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t remember it?{' '}
          <button type="button" onClick={() => setMode('otp')} className={switchClass}>
            Log in with OTP
          </button>
        </p>
      </AuthShell>
    );
  }

  // Step 1: the mobile number.
  return (
    <AuthShell title="Login" subtitle="No password needed — we'll email you a one-time code" footer={footer}>
      <form onSubmit={handleGetOtp} className="flex flex-col gap-4">
        <MobileField value={mobile} onChange={setMobile} autoFocus />
        <p className="-mt-2 flex items-start gap-1.5 text-xs text-gray-500">
          <MailIcon className="mt-px h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
          The OTP goes to the email address on your Roam Wheels account.
        </p>
        <SubmitButton loading={loading}>{loading ? 'Sending OTP...' : 'Get OTP'}</SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Log in using{' '}
        <button type="button" onClick={switchToPassword} className={switchClass}>
          Password
        </button>
      </p>
      <GetHelp />
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
  // Step 2: the code emailed to verify the address ({ expiresAt, resendAt } once sent).
  const [sent, setSent] = useState(null);
  const [code, setCode] = useState('');
  const next = safeNext(params.get('next'));

  if (customer) return <Navigate to={next} replace />;

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const payload = () => ({ name: form.name.trim(), mobile: form.mobile, email: form.email.trim(), password: form.password });

  // Step 1: check the form, then email a code to the address.
  async function handleSubmit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error('Enter a valid email address');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      setSent(await sendSignupEmailCode(payload()));
      setCode('');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not send the code'));
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    try {
      setSent(await sendSignupEmailCode(payload()));
      setCode('');
      toast.success('A new code is on its way');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not send the code'));
    }
  }

  // Step 2: the account is created only with the right code.
  async function createAccount(emailCode) {
    setLoading(true);
    try {
      await signup({ ...payload(), emailCode });
      toast.success('Email verified. Welcome to Roam Wheels!');
      navigate(next, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Signup failed'));
      const errCode = err?.response?.data?.code;
      if (errCode === 'EMAIL_OTP_INVALID' || errCode === 'EMAIL_OTP_LOCKED' || errCode === 'EMAIL_OTP_EXPIRED') setCode('');
      // The form itself was refused (e.g. the number or email got taken meanwhile): back to it.
      if (err?.response?.status === 409) setSent(null);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthShell title="Verify Your Email" subtitle="One last step to create your account" footer={null}>
        <EmailCodeStep
          email={form.email.trim()}
          sent={sent}
          code={code}
          onCodeChange={setCode}
          busy={loading}
          submitLabel="Verify & Create Account"
          onSubmit={createAccount}
          onResend={resendCode}
          onBack={() => setSent(null)}
        />
      </AuthShell>
    );
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
        <Field label="Email" icon={MailIcon} hint="We'll email you a code to verify it">
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email')(e.target.value)}
            required
            maxLength={254}
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
        <SubmitButton loading={loading}>{loading ? 'Sending code...' : 'Continue'}</SubmitButton>
      </form>
    </AuthShell>
  );
}

const IDENTIFIER_RE = /^(?:[0-9]{10}|[^\s@]+@[^\s@]+\.[^\s@]+)$/;

// Forgot password, step 1: mobile number or email -> we email a reset link (the server answers the
// same way whether or not an account matched).
export function ForgotPasswordPage() {
  const { customer } = useAuth();
  const [params] = useSearchParams();
  const [identifier, setIdentifier] = useState(params.get('mobile') || '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (customer) return <Navigate to="/profile" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    const value = identifier.trim();
    if (!IDENTIFIER_RE.test(value)) {
      toast.error('Enter your 10-digit mobile number or your email address');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(value);
      setSent(true);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not send the reset link. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="We'll email you a link to set a new password"
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-accent-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="flex flex-col gap-4 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <MailIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="font-bold text-gray-900">Check your email</p>
            <p className="mt-1 text-sm text-gray-600">
              If <span className="font-semibold">{identifier.trim()}</span> matches an account with an email address, we&apos;ve sent it a link to
              reset your password. The link works for 30 minutes.
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Didn&apos;t get it? Check your spam folder, or{' '}
            <button type="button" onClick={() => setSent(false)} className="cursor-pointer font-semibold text-accent-600 hover:underline">
              try again
            </button>
            . No email on your account?{' '}
            <a
              href={whatsappLink('Hi Roam Wheels! I forgot my password and need help logging in.')}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent-600 hover:underline"
            >
              WhatsApp us
            </a>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Mobile Number or Email" icon={UserIcon} hint="We'll send the reset link to the email on your account.">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              maxLength={254}
              autoFocus
              autoComplete="username"
              placeholder="10-digit mobile number or email"
              className={inputClass}
            />
          </Field>
          <SubmitButton loading={loading}>{loading ? 'Sending link...' : 'Send Reset Link'}</SubmitButton>
        </form>
      )}
    </AuthShell>
  );
}

// Forgot password, step 2: the emailed link (/reset-password?token=...) — choose a new password, then
// they're logged in.
export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [link, setLink] = useState({ status: token ? 'checking' : 'invalid', name: '' });
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    checkResetToken(token)
      .then((data) => !cancelled && setLink({ status: 'ok', name: data.name }))
      .catch(() => !cancelled && setLink({ status: 'invalid', name: '' }));
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const c = await resetPassword(token, password);
      toast.success(`Password updated. Welcome back, ${c.name.split(' ')[0]}!`);
      navigate('/profile', { replace: true });
    } catch (err) {
      if (err?.response?.data?.code === 'RESET_LINK_INVALID') setLink({ status: 'invalid', name: '' });
      else toast.error(errorMessage(err, 'Could not reset your password'));
    } finally {
      setLoading(false);
    }
  }

  const footer = (
    <>
      Remembered it?{' '}
      <Link to="/login" className="font-semibold text-accent-600 hover:underline">
        Log in
      </Link>
    </>
  );

  if (link.status === 'checking') {
    return (
      <AuthShell title="Set a New Password" subtitle="Checking your reset link…" footer={footer}>
        <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
      </AuthShell>
    );
  }

  if (link.status === 'invalid') {
    return (
      <AuthShell title="Link Expired" subtitle="This reset link doesn't work any more" footer={footer}>
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-gray-600">
            Reset links work once, for 30 minutes, and a newer link replaces older ones. Ask for a new link and use the latest email.
          </p>
          <Link
            to="/forgot-password"
            className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-bold text-primary shadow-md shadow-accent/20 transition-colors hover:bg-accent-600"
          >
            Get a New Link
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a New Password"
      subtitle={link.name ? `Hi ${link.name}, choose a new password for your account` : 'Choose a new password for your account'}
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="New Password" icon={LockIcon}>
          <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" placeholder="At least 6 characters" />
        </Field>
        <Field label="Confirm New Password" icon={LockIcon}>
          <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" placeholder="Re-enter the new password" />
        </Field>
        <SubmitButton loading={loading}>{loading ? 'Saving...' : 'Save & Log In'}</SubmitButton>
      </form>
    </AuthShell>
  );
}
