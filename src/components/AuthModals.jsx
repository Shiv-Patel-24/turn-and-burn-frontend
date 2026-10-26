import { useEffect, useRef, useState } from 'react';
import { FiEyeOff, FiEye } from 'react-icons/fi';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Modal, ModalHeader, Field, Input, Select, Checkbox } from '../ui';
import { navigate } from '../router';
import { apiRequest, setAccessToken, setRefreshToken, setCurrentUser } from '../lib/api';

function Password({ placeholder = 'Enter your password...', value = '', onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-icon">
      <Input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
      <button
        type="button"
        className="input-icon__btn"
        onClick={() => setShow((s) => !s)}
        aria-label="Toggle password"
      >
        {show ? <FiEye size={22} /> : <FiEyeOff size={22} />}
      </button>
    </div>
  );
}

const Terms = () => (
  <>
    I agree to the <a href="#/terms">terms of service</a> and <a href="#/terms">privacy policy.</a>
  </>
);

export function SignUpModal({ onClose, go }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [promo, setPromo] = useState(false);
  const [referredByCode, setReferredByCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agree) {
      setError('Please agree to the terms of service and privacy policy.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneCountryCode,
        phoneNumber: phoneNumber.trim(),
        password,
        promotionsOptIn: promo,
      };
      if (referredByCode.trim()) {
        payload.referredByCode = referredByCode.trim();
      }

      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: payload,
      });

      if (res?.data?.accessToken) {
        setAccessToken(res.data.accessToken);
        if (res.data.refreshToken) setRefreshToken(res.data.refreshToken);
        setCurrentUser(res.data.user);
      }
      onClose();
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} width={639} className="auth">
      <ModalHeader title="Sign up" onClose={onClose} />
      <form className="auth__body" onSubmit={handleSubmit}>
        {error && (
          <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        <Field label="First name">
          <Input
            placeholder="Enter your first name..."
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </Field>
        <Field label="Last name">
          <Input
            placeholder="Enter your last name..."
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            placeholder="Enter your email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Phone number">
          <div className="phone-row">
            <span className="input input--code">{phoneCountryCode}</span>
            <Input
              placeholder="Enter your phone number..."
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
        </Field>
        <Field label="Password">
          <Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label="Referral code (Optional)">
          <Input
            placeholder="e.g. JOHN5678"
            value={referredByCode}
            onChange={(e) => setReferredByCode(e.target.value.toUpperCase())}
          />
        </Field>
        <Checkbox checked={agree} onChange={setAgree}>
          <Terms />
        </Checkbox>
        <Checkbox checked={promo} onChange={setPromo}>
          Send me promotions and announcement via email &amp; SMS
        </Checkbox>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
        <p className="auth__switch">
          Already have an account!{' '}
          <button type="button" onClick={() => go('login')}>
            Log in
          </button>
        </p>
      </form>
    </Modal>
  );
}

export function LoginModal({ onClose, go }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: {
          email: email.trim(),
          password,
        },
      });

      const token = res?.data?.accessToken;
      const refreshToken = res?.data?.refreshToken;
      const user = res?.data?.user;

      if (token) setAccessToken(token);
      if (refreshToken) setRefreshToken(refreshToken);
      if (user) setCurrentUser(user);

      onClose();
      if (user?.activeRole === 'host') {
        navigate('/host');
      } else {
        navigate('/app');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} width={639} className="auth">
      <ModalHeader title="Log in" onClose={onClose} />
      <form className="auth__body" onSubmit={handleSubmit}>
        {error && (
          <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        <Field label="Email">
          <Input
            type="email"
            placeholder="Enter your email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Password">
          <Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <button type="button" className="auth__forgot" onClick={() => go('forgot')}>
          Forget Password
        </button>
        <Checkbox checked={agree} onChange={setAgree}>
          <Terms />
        </Checkbox>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        <p className="auth__switch">
          Don’t have an account!{' '}
          <button type="button" onClick={() => go('signup')}>
            Sign up
          </button>
        </p>
        <p className="auth__or">or</p>
        <button
          type="button"
          className="btn-social"
          onClick={async () => {
            setError('');
            try {
              await apiRequest('/auth/social-login', {
                method: 'POST',
                body: { provider: 'apple', idToken: 'MOCK_APPLE_ID_TOKEN' },
              });
            } catch (err) {
              setError(err.message || 'Apple login is not configured on the server (APPLE_CLIENT_ID)');
            }
          }}
        >
          <FaApple size={30} /> Continue with Apple
        </button>
        <button
          type="button"
          className="btn-social"
          onClick={async () => {
            setError('');
            try {
              await apiRequest('/auth/social-login', {
                method: 'POST',
                body: { provider: 'google', idToken: 'MOCK_GOOGLE_ID_TOKEN' },
              });
            } catch (err) {
              setError(err.message || 'Google login is not configured on the server (GOOGLE_CLIENT_ID)');
            }
          }}
        >
          <FcGoogle size={30} /> Continue with Google
        </button>
      </form>
    </Modal>
  );
}

export function ForgotModal({ onClose, go }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: { email: email.trim() },
      });
      setMessage('Password reset instructions sent if this email is registered.');
    } catch (err) {
      setError(err.message || 'Failed to send password reset request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} width={639} className="auth">
      <ModalHeader title="Forget password" onClose={onClose} />
      <form className="auth__body" onSubmit={handleSubmit}>
        {error && (
          <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ color: '#15803d', backgroundColor: '#dcfce7', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '14px' }}>
            {message}
          </div>
        )}
        <Field label="Email">
          <Input
            type="email"
            placeholder="Enter your registered email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? 'Submitting...' : 'Send Reset Link'}
        </button>
        <p className="auth__switch">
          Remember your password?{' '}
          <button type="button" onClick={() => go('login')}>
            Log in
          </button>
        </p>
      </form>
    </Modal>
  );
}

export function OtpModal({ onClose, go, phoneCountryCode = '+1', phoneNumber = '7778956254' }) {
  const [seconds, setSeconds] = useState(20);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const refs = useRef([]);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleDigitChange = (index, value) => {
    const val = value.slice(-1);
    const updated = [...digits];
    updated[index] = val;
    setDigits(updated);

    if (val && refs.current[index + 1]) {
      refs.current[index + 1].focus();
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      await apiRequest('/auth/otp/send', {
        method: 'POST',
        body: { phoneCountryCode, phoneNumber },
      });
      setSeconds(30);
      setInfo('New verification code requested.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    }
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await apiRequest('/auth/otp/verify', {
        method: 'POST',
        body: { phoneCountryCode, phoneNumber, otp },
      });
      go('login');
    } catch (err) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} width={639} className="auth">
      <ModalHeader title="OTP verification" onClose={onClose} />
      <p className="auth__note">
        Please Check your Phone Number. Code sent to {phoneCountryCode} {phoneNumber}
      </p>
      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px 14px', borderRadius: '8px', margin: '0 0 14px', fontSize: '14px', textAlign: 'center' }}>
          {error}
        </div>
      )}
      {info && (
        <div style={{ color: '#15803d', backgroundColor: '#dcfce7', padding: '10px 14px', borderRadius: '8px', margin: '0 0 14px', fontSize: '14px', textAlign: 'center' }}>
          {info}
        </div>
      )}
      <div className="otp">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            maxLength={1}
            inputMode="numeric"
            value={digits[i]}
            onChange={(e) => handleDigitChange(i, e.target.value)}
          />
        ))}
      </div>
      <p className="otp__resend">
        <button type="button" disabled={seconds > 0} onClick={handleResend}>
          Send code again
        </button>{' '}
        00:{String(seconds).padStart(2, '0')}
      </p>
      <button
        type="button"
        className="btn btn-primary btn-block btn-lg"
        onClick={handleVerify}
        disabled={loading}
      >
        {loading ? 'Verifying...' : 'Verify'}
      </button>
    </Modal>
  );
}
