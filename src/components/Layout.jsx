import { FaApple, FaGooglePlay, FaInstagram, FaDribbble, FaTwitter, FaYoutube } from 'react-icons/fa';
import { FiHome, FiHeart, FiMessageSquare, FiUser, FiMapPin, FiGift, FiHeadphones, FiLogOut, FiCalendar, FiMoreVertical } from 'react-icons/fi';
import { IoCarSportOutline, IoSwapHorizontal, IoClose } from 'react-icons/io5';
import { TbFileText, TbReceipt, TbRoad, TbChartBar } from 'react-icons/tb';
import { Link, navigate } from '../router';
import { img } from '../data';
import { useUI, Modal } from '../ui';
import { clearSession, getRefreshToken, apiRequest } from '../lib/api';

/* role: 'guest' | 'user' | 'host' */
export const base = (role) => (role === 'user' ? '/app' : role === 'host' ? '/host' : '');

export function Logo({ role = 'guest' }) {
  return (
    <Link to={role === 'user' ? '/app' : role === 'host' ? '/host' : '/'} className="logo" aria-label="Turn and Burn home">
      <img src={img('logo.png')} alt="Turn and Burn" />
    </Link>
  );
}

export function Header({ role = 'guest' }) {
  const { open } = useUI();
  return (
    <header className="header">
      <div className="container header__inner">
        <Logo role={role} />
        {role === 'guest' ? (
          <button type="button" className="btn-outline-light" onClick={() => open('signup')}>
            Login / Register
          </button>
        ) : (
          <div className="header__right">
            <button type="button" className="btn-switch" onClick={() => navigate(role === 'user' ? '/host' : '/app')}>
              {role === 'user' ? 'Switch to host' : 'Switch to guest'}
            </button>
            <button type="button" className="header__menu" aria-label="Open menu" onClick={() => open(role === 'user' ? 'userMenu' : 'hostMenu')}>
              <span className="burger">
                <i />
                <i />
                <i />
              </span>
              <span className="header__avatar">
                <FiUser size={30} strokeWidth={1.6} />
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export function StoreButtons({ size = 'md' }) {
  return (
    <div className={`stores stores--${size}`}>
      <a className="store" href="#/" onClick={(e) => e.preventDefault()}>
        <FaApple size={size === 'md' ? 32 : 30} />
        <span>
          <small>Download on the</small>App Store
        </span>
      </a>
      <a className="store" href="#/" onClick={(e) => e.preventDefault()}>
        <FaGooglePlay size={size === 'md' ? 26 : 26} />
        <span>
          <small>Get it on</small>Google Play
        </span>
      </a>
    </div>
  );
}

export function Footer({ role = 'guest' }) {
  const { open } = useUI();
  const b = base(role);
  const links = [
    role !== 'host' && { label: 'Rent', to: role === 'user' ? '/app/cars' : null },
    { label: 'Blogs', to: `${b}/blogs` },
    { label: 'Terms & Conditions', to: `${b}/terms` },
    { label: 'About us', to: `${b}/about` },
    { label: 'Contact', to: role === 'host' ? '/host/more' : `${b}/contact` },
  ].filter(Boolean);
  return (
    <footer className="footer">
      <div className="footer__app">
        <div className="footer__app-inner">
          <div>
            <h3>
              Download our mobile app <span aria-hidden>⚡️</span>
            </h3>
            <p>Get exclusive access to car rentals with our mobile app. Download now and experience convenience on the go.</p>
          </div>
          <StoreButtons />
        </div>
      </div>
      <div className="container footer__bottom">
        <Logo role={role} />
        <nav className="footer__links">
          {links.map((l) =>
            l.to ? (
              <Link key={l.label} to={l.to}>
                {l.label}
              </Link>
            ) : (
              <button key={l.label} type="button" onClick={() => open('signup')}>
                {l.label}
              </button>
            ),
          )}
        </nav>
        <div className="footer__social">
          {[FaInstagram, FaDribbble, FaTwitter, FaYoutube].map((I, i) => (
            <a key={i} href="#/" onClick={(e) => e.preventDefault()} aria-label="social">
              <I size={12} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ role = 'guest', children, footer = true, className = '' }) {
  return (
    <div className={`page page--${role} ${className}`}>
      <Header role={role} />
      <main>{children}</main>
      {footer && <Footer role={role} />}
    </div>
  );
}

/* ---------- Side menus (Figma "Frame 5061" & "Frame 1707480163") ---------- */

function MenuPanel({ items, onClose }) {
  const { open } = useUI();
  return (
    <div className="side-menu">
      <div className="side-menu__head">
        <img src={img('avatar-menu.jpg')} alt="" />
        <strong>Kaylynn Bergson</strong>
        <button type="button" className="icon-btn" aria-label="Close menu" onClick={onClose}>
          <IoClose size={26} />
        </button>
      </div>
      {items.map((group, gi) => (
        <div className="side-menu__group" key={gi}>
          {group.map(({ icon: I, label, to, action }) => (
            <button
              key={label}
              type="button"
              className="side-menu__item"
              onClick={() => {
                if (action === 'logout') open('logout');
                else {
                  onClose();
                  navigate(to);
                }
              }}
            >
              <I size={30} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export function UserMenu({ onClose }) {
  const items = [
    [
      { icon: FiHome, label: 'Home', to: '/app' },
      { icon: FiHeart, label: 'Favorites', to: '/app/favorites' },
      { icon: FiMessageSquare, label: 'Inbox', to: '/app/inbox' },
      { icon: IoCarSportOutline, label: 'My Bookings', to: '/app/bookings' },
    ],
    [
      { icon: FiUser, label: 'My Profile', to: '/app/profile' },
      { icon: IoSwapHorizontal, label: 'Switch to Host', to: '/host/calendar' },
      { icon: FiMapPin, label: 'Saved Locations', to: '/app/saved-locations' },
      { icon: TbReceipt, label: 'Payment History', to: '/app/payments' },
    ],
    [
      { icon: FiGift, label: 'Gift Cards', to: '/app/gift-cards' },
      { icon: FiHeadphones, label: 'Contact Us', to: '/app/contact' },
      { icon: TbFileText, label: 'Legal', to: '/app/legal' },
    ],
    [{ icon: FiLogOut, label: 'Log Out', action: 'logout' }],
  ];
  return <MenuPanel items={items} onClose={onClose} />;
}

export function HostMenu({ onClose }) {
  const items = [
    [
      { icon: FiCalendar, label: 'Calendar', to: '/host/calendar' },
      { icon: TbRoad, label: 'Trips', to: '/host/trips' },
      { icon: FiMessageSquare, label: 'Inbox', to: '/host/inbox' },
      { icon: IoCarSportOutline, label: 'Vehicles', to: '/host/vehicles' },
      { icon: TbChartBar, label: 'Analytics', to: '/host/analytics' },
      { icon: FiUser, label: 'My Profile', to: '/host/profile' },
      { icon: FiMoreVertical, label: 'More', to: '/host/more' },
    ],
    [{ icon: FiLogOut, label: 'Log Out', action: 'logout' }],
  ];
  return <MenuPanel items={items} onClose={onClose} />;
}

export function LogoutModal({ onClose }) {
  const handleConfirmLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: { refreshToken },
        }).catch(() => {});
      }
    } catch {
      
    } finally {
      clearSession();
      onClose();
      navigate('/');
    }
  };

  return (
    <Modal onClose={onClose} width={924} className="logout">
      <button type="button" className="icon-btn logout__x" aria-label="Close" onClick={onClose}>
        <IoClose size={26} />
      </button>
      <h2>Do you want to log out!</h2>
      <p>Are you sure you want to log out of your account?</p>
      <div className="logout__actions">
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <span />
        <button
          type="button"
          onClick={handleConfirmLogout}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
}
