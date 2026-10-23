import { useEffect, useRef, useState } from 'react';
import { FiEyeOff, FiEye } from 'react-icons/fi';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Modal, ModalHeader, Field, Input, Select, Checkbox } from '../ui';
import { navigate } from '../router';

function Password({ placeholder = 'Enter your password...' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-icon">
      <Input type={show ? 'text' : 'password'} placeholder={placeholder} />
      <button type="button" className="input-icon__btn" onClick={() => setShow((s) => !s)} aria-label="Toggle password">
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
  const [agree, setAgree] = useState(false);
  const [promo, setPromo] = useState(false);
  return (
    <Modal onClose={onClose} width={639} className="auth">
      <ModalHeader title="Sign up" onClose={onClose} />
      <form
        className="auth__body"
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
          navigate('/app');
        }}
      >
        <Field label="First name">
          <Input placeholder="Enter your first name..." />
        </Field>
        <Field label="Last name">
          <Input placeholder="Enter your last name..." />
        </Field>
        <Field label="Email">
          <Input type="email" placeholder="Enter your email address..." />
        </Field>
        <Field label="Phone number">
          <div className="phone-row">
            <span className="input input--code">+1</span>
            <Input placeholder="Enter your phone number..." />
          </div>
        </Field>
        <Field label="Password">
          <Password />
        </Field>
        <Checkbox checked={agree} onChange={setAgree}>
          <Terms />
        </Checkbox>
        <Checkbox checked={promo} onChange={setPromo}>
          Send me promotions and announcement via email &amp; SMS
        </Checkbox>
        <button type="submit" className="btn btn-primary btn-block btn-lg">
          Sign up
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
  const [agree, setAgree] = useState(false);
  return (
    <Modal onClose={onClose} width={639} className="auth">
      <ModalHeader title="Log in" onClose={onClose} />
      <form
        className="auth__body"
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
          navigate('/app');
        }}
      >
        <Field label="Country code">
          <Select value="+1 United States" options={['+1 United States', '+44 United Kingdom', '+91 India']} />
        </Field>
        <Field label="Phone number">
          <Input placeholder="Enter your phone number..." />
        </Field>
        <Field label="Password">
          <Password />
        </Field>
        <button type="button" className="auth__forgot" onClick={() => go('forgot')}>
          Forget Password
        </button>
        <Checkbox checked={agree} onChange={setAgree}>
          <Terms />
        </Checkbox>
        <button type="submit" className="btn btn-primary btn-block btn-lg">
          Log in
        </button>
        <p className="auth__switch">
          Don’t have an account!{' '}
          <button type="button" onClick={() => go('signup')}>
            Sign up
          </button>
        </p>
        <p className="auth__or">or</p>
        <button type="button" className="btn-social">
          <FaApple size={30} /> Continue with Apple
        </button>
        <button type="button" className="btn-social">
          <FcGoogle size={30} /> Continue with Google
        </button>
      </form>
    </Modal>
  );
}

export function ForgotModal({ onClose, go }) {
  const [remember, setRemember] = useState(false);
  return (
    <Modal onClose={onClose} width={639} className="auth">
      <ModalHeader title="Forget password" onClose={onClose} />
      <form
        className="auth__body"
        onSubmit={(e) => {
          e.preventDefault();
          go('otp');
        }}
      >
        <Field label="Country code">
          <Select value="+1 United States" options={['+1 United States', '+44 United Kingdom', '+91 India']} />
        </Field>
        <Field label="Phone number">
          <Input placeholder="Enter your phone number..." />
        </Field>
        <Field label="Password">
          <Password />
        </Field>
        <Field label="Confirm password">
          <Password />
        </Field>
        <Checkbox checked={remember} onChange={setRemember}>
          Remember Password
        </Checkbox>
        <button type="submit" className="btn btn-primary btn-block btn-lg">
          Next
        </button>
      </form>
    </Modal>
  );
}

export function OtpModal({ onClose, go }) {
  const [seconds, setSeconds] = useState(20);
  const refs = useRef([]);
  useEffect(() => {
    if (seconds <= 0) return undefined;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);
  return (
    <Modal onClose={onClose} width={639} className="auth">
      <ModalHeader title="OTP verification" onClose={onClose} />
      <p className="auth__note">Please Check your Phone Number. We have sent a code to +1 7774 963 369</p>
      <div className="otp">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            maxLength={1}
            inputMode="numeric"
            onChange={(e) => e.target.value && refs.current[i + 1] && refs.current[i + 1].focus()}
          />
        ))}
      </div>
      <p className="otp__resend">
        <button type="button" disabled={seconds > 0} onClick={() => setSeconds(20)}>
          Send code again
        </button>{' '}
        00:{String(seconds).padStart(2, '0')}
      </p>
      <button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => go('login')}>
        Verify
      </button>
    </Modal>
  );
}
