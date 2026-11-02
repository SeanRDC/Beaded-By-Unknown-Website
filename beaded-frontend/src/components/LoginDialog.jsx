import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../store/auth.jsx';
import { useUi } from '../store/ui.jsx';
import { Sheet } from './Sheet.jsx';

const CODE_SECONDS = 600;
const RESEND_SECONDS = 30;

const HEADINGS = {
  signin: 'Sign in',
  register: 'Create your account',
  verify: 'Check your email',
  forgot: 'Reset your password',
  code: 'Check your email',
  reset: 'Choose a new password'
};

const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

function Field({ label, ...input }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className="input" {...input} />
    </label>
  );
}

function CodeField({ value, onChange, seconds }) {
  return (
    <label className="field">
      <span className="signin__row">
        <span>6-digit code</span>
        <span className="nums">{clock(seconds)}</span>
      </span>
      <input
        className="input signin__code"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        required
      />
    </label>
  );
}

export function LoginDialog() {
  const { panel, closePanel, flash } = useUi();
  const auth = useAuth();
  const [step, setStep] = useState('signin');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', code: '', newPassword: '' });
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const setCode = (code) => setForm((current) => ({ ...current, code }));

  const onCodeScreen = step === 'verify' || step === 'code';

  useEffect(() => {
    if (!onCodeScreen) return undefined;
    const timer = setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [onCodeScreen]);

  useEffect(() => {
    if (onCodeScreen && seconds === 0) {
      flash('That code has expired. Please start again.', 'error');
      setStep(step === 'code' ? 'forgot' : 'signin');
    }
  }, [onCodeScreen, seconds, step, flash]);

  const run = async (task) => {
    setBusy(true);
    try {
      await task();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') flash(err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const toCode = (next) => {
    setCode('');
    setSeconds(CODE_SECONDS);
    setCooldown(RESEND_SECONDS);
    setStep(next);
  };

  const close = () => {
    closePanel();
    setStep('signin');
    setForm((current) => ({ ...current, password: '', code: '', newPassword: '' }));
  };

  const submit = (event) => {
    event.preventDefault();
    run(async () => {
      const { firstName, lastName, email, password, code, newPassword } = form;
      if (step === 'signin') {
        await auth.signIn(email, password);
        toCode('verify');
      } else if (step === 'register') {
        await auth.register({ firstName, lastName, email, password });
        toCode('verify');
      } else if (step === 'verify') {
        await auth.verifyCode(email, code);
        setStep('signin');
        setForm((current) => ({ ...current, password: '', code: '' }));
      } else if (step === 'forgot') {
        await auth.forgotPassword(email);
        toCode('code');
      } else if (step === 'code') {
        await auth.checkResetCode(email, code);
        setStep('reset');
      } else if (step === 'reset') {
        await auth.resetPassword(email, code, newPassword);
        flash('Password changed. Please sign in.', 'success');
        setStep('signin');
        setForm((current) => ({ ...current, password: '', code: '', newPassword: '' }));
      }
    });
  };

  const resend = () => run(async () => {
    await auth.resendCode(form.email);
    setSeconds(CODE_SECONDS);
    setCooldown(RESEND_SECONDS);
    flash('A new code is on its way.', 'success');
  });

  return (
    <Sheet open={panel === 'login'} onClose={close} side="center" label={HEADINGS[step]}>
      <form className="signin" onSubmit={submit}>
        <h2>{HEADINGS[step]}</h2>

        {(step === 'signin' || step === 'register') && (
          <>
            <button type="button" className="btn btn--quiet signin__google" disabled={busy} onClick={() => run(auth.signInWithGoogle)}>
              Continue with Google
            </button>
            <div className="signin__tabs">
              <button type="button" className="chip" aria-pressed={step === 'signin'} onClick={() => setStep('signin')}>Sign in</button>
              <button type="button" className="chip" aria-pressed={step === 'register'} onClick={() => setStep('register')}>Register</button>
            </div>
          </>
        )}

        {step === 'register' && (
          <>
            <Field label="First name" value={form.firstName} onChange={set('firstName')} autoComplete="given-name" required />
            <Field label="Last name" value={form.lastName} onChange={set('lastName')} autoComplete="family-name" required />
          </>
        )}

        {(step === 'signin' || step === 'register' || step === 'forgot') && (
          <Field label="Email" type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
        )}

        {(step === 'signin' || step === 'register') && (
          <Field
            label={step === 'register' ? 'Password, at least 8 characters' : 'Password'}
            type="password"
            value={form.password}
            onChange={set('password')}
            minLength={step === 'register' ? 8 : undefined}
            autoComplete={step === 'register' ? 'new-password' : 'current-password'}
            required
          />
        )}

        {onCodeScreen && (
          <>
            <p className="soft">I sent a code to {form.email}.</p>
            <CodeField value={form.code} onChange={setCode} seconds={seconds} />
          </>
        )}

        {step === 'reset' && (
          <Field label="New password, at least 8 characters" type="password" value={form.newPassword} onChange={set('newPassword')} minLength={8} autoComplete="new-password" required />
        )}

        <button type="submit" className="btn btn--wide" disabled={busy}>
          {busy ? 'One moment' : { signin: 'Sign in', register: 'Create account', verify: 'Verify and sign in', forgot: 'Send code', code: 'Verify code', reset: 'Change password' }[step]}
        </button>

        {step === 'signin' && <button type="button" className="link t-small" onClick={() => setStep('forgot')}>Forgot your password?</button>}
        {step === 'verify' && (
          <button type="button" className="link t-small" disabled={cooldown > 0 || busy} onClick={resend}>
            {cooldown > 0 ? `Send another code in ${cooldown}s` : 'Send another code'}
          </button>
        )}
        {(step === 'forgot' || step === 'code' || step === 'reset') && (
          <button type="button" className="link t-small" onClick={() => setStep('signin')}>Back to sign in</button>
        )}

        <p className="t-small soft">
          By continuing you agree to the <Link className="link" to="/terms" onClick={close}>terms and privacy policy</Link>.
        </p>
      </form>
    </Sheet>
  );
}
