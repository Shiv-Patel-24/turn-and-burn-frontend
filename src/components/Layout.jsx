import { useState, useEffect } from 'react';
import { FaApple, FaGooglePlay, FaInstagram, FaDribbble, FaTwitter, FaYoutube } from 'react-icons/fa';
import { FiHome, FiHeart, FiMessageSquare, FiUser, FiMapPin, FiGift, FiHeadphones, FiLogOut, FiCalendar, FiMoreVertical, FiBell, FiTrash2, FiCheck, FiUsers, FiGlobe } from 'react-icons/fi';
import { IoCarSportOutline, IoSwapHorizontal, IoClose } from 'react-icons/io5';
import { TbFileText, TbReceipt, TbRoad, TbChartBar } from 'react-icons/tb';
import { Link, navigate } from '../router';
import { img } from '../data';
import { useUI, Modal } from '../ui';
import { clearSession, getRefreshToken, apiRequest, getCurrentUser, setCurrentUser } from '../lib/api';

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
  const [unread, setUnread] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = () => {
    if (role === 'guest') return;
    apiRequest('/notifications?limit=30')
      .then((res) => {
        const count = res?.data?.unreadCount || 0;
        setUnread(count);
        setNotifications(res?.data?.notifications || []);
      })
      .catch(() => {});
  };

  const loadUnreadMessages = () => {
    if (role === 'guest') return;
    apiRequest('/messages/unread-count')
      .then((res) => {
        const count = res?.data?.unreadCount || 0;
        setUnreadMessages(count);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
    loadUnreadMessages();

    // Periodic badge polling every 25 seconds
    const interval = setInterval(() => {
      loadNotifications();
      loadUnreadMessages();
    }, 25000);

    const onFocus = () => {
      loadNotifications();
      loadUnreadMessages();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [role]);

  const handleMarkAllRead = async () => {
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' });
    } catch {}
  };

  const handleMarkOneRead = async (id, e) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnread((prev) => Math.max(0, prev - 1));
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch {}
  };

  const handleDeleteOne = async (id, e) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await apiRequest(`/notifications/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) return;
    setNotifications([]);
    setUnread(0);
    try {
      await apiRequest('/notifications', { method: 'DELETE' });
    } catch {}
  };

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
            {/* Quick access to Inbox with unread message badge */}
            <button
              type="button"
              className="btn-switch"
              style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => navigate(role === 'user' ? '/app/inbox' : '/host/inbox')}
              aria-label="Inbox"
              title="Inbox Messages"
            >
              <FiMessageSquare size={18} />
              {unreadMessages > 0 && (
                <span style={{ backgroundColor: '#0a5cff', color: '#fff', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold', padding: '1px 6px' }}>
                  {unreadMessages}
                </span>
              )}
            </button>

            {/* Notification bell with unread badge */}
            <button
              type="button"
              className="btn-switch"
              style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setNotifOpen(true)}
              aria-label="Notifications"
              title="Notifications"
            >
              <FiBell size={18} />
              {unread > 0 && (
                <span style={{ backgroundColor: '#ef4444', color: '#fff', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold', padding: '1px 6px' }}>
                  {unread}
                </span>
              )}
            </button>
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

      {notifOpen && (
        <Modal onClose={() => setNotifOpen(false)} width={480} className="drawer" align="right">
          <div className="drawer__head">
            <h2>Notifications</h2>
            <button type="button" className="icon-btn" aria-label="Close" onClick={() => setNotifOpen(false)}>
              <IoClose size={26} />
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 10px' }}>
            <button type="button" style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer' }} onClick={handleMarkAllRead}>
              Mark all as read
            </button>
            <button type="button" style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer' }} onClick={handleDeleteAll}>
              Clear all
            </button>
          </div>
          <div style={{ maxHeight: '75vh', overflowY: 'auto', padding: '0 20px 20px' }}>
            {notifications.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', margin: '40px 0' }}>No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={(e) => !n.isRead && handleMarkOneRead(n._id, e)}
                  style={{
                    backgroundColor: n.isRead ? '#f9fafb' : '#eff6ff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '10px',
                    position: 'relative',
                    cursor: n.isRead ? 'default' : 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <b style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#111827' }}>{n.title}</b>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteOne(n._id, e)}
                      style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px' }}
                      title="Delete notification"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', lineHeight: 1.4 }}>{n.body}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <small style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                    </small>
                    {!n.isRead && (
                      <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>Unread</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
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
  const [languages, setLanguages] = useState([]);
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('turn_and_burn_lang') || 'en');

  useEffect(() => {
    let active = true;
    apiRequest('/content/languages')
      .then((res) => {
        if (!active) return;
        const list = res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setLanguages(list);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleLangChange = async (code) => {
    setCurrentLang(code);
    localStorage.setItem('turn_and_burn_lang', code);
    const selectedObj = languages.find((l) => l.code === code);
    const selectedName = selectedObj?.name || 'English';

    // If logged in, update language in profile
    const user = getCurrentUser();
    if (user && user._id) {
      try {
        await apiRequest('/users/me', {
          method: 'PATCH',
          body: { language: selectedName },
        });
        setCurrentUser({ ...user, language: selectedName });
      } catch (err) {
        console.warn('Could not sync user language preference:', err.message);
      }
    }
  };

  const links = [
    role !== 'host' && { label: 'Rent', to: role === 'user' ? '/app/cars' : '/cars' },
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Dynamic Language Selector */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <FiGlobe size={15} color="#94a3b8" />
            <select
              value={currentLang}
              onChange={(e) => handleLangChange(e.target.value)}
              aria-label="Select Language"
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '12px',
                color: '#334155',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {languages.length > 0 ? (
                languages.map((l) => (
                  <option key={l.code || l.name} value={l.code}>
                    {l.name}
                  </option>
                ))
              ) : (
                <option value="en">English</option>
              )}
            </select>
          </div>

          <div className="footer__social">
            {[FaInstagram, FaDribbble, FaTwitter, FaYoutube].map((I, i) => (
              <a key={i} href="#/" onClick={(e) => e.preventDefault()} aria-label="social">
                <I size={12} />
              </a>
            ))}
          </div>
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
  const user = getCurrentUser() || {};
  const name = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Kaylynn Bergson';
  const [unreadMsg, setUnreadMsg] = useState(0);

  useEffect(() => {
    apiRequest('/messages/unread-count')
      .then((res) => setUnreadMsg(res?.data?.unreadCount || 0))
      .catch(() => {});
  }, []);

  const handleItemClick = async ({ to, action }) => {
    if (action === 'logout') {
      open('logout');
      return;
    }
    if (action === 'feedback') {
      onClose();
      open('feedback');
      return;
    }
    if (action === 'switch-role-host') {
      try {
        await apiRequest('/users/me/switch-role', {
          method: 'POST',
          body: { role: 'host' },
        });
        const updated = { ...user, activeRole: 'host' };
        setCurrentUser(updated);
      } catch (err) {
        console.warn('Could not switch role on server:', err.message);
      }
      onClose();
      navigate('/host');
      return;
    }
    if (action === 'switch-role-guest') {
      try {
        await apiRequest('/users/me/switch-role', {
          method: 'POST',
          body: { role: 'guest' },
        });
        const updated = { ...user, activeRole: 'guest' };
        setCurrentUser(updated);
      } catch (err) {
        console.warn('Could not switch role on server:', err.message);
      }
      onClose();
      navigate('/app');
      return;
    }
    onClose();
    if (to) navigate(to);
  };

  return (
    <div className="side-menu">
      <div className="side-menu__head">
        <img src={user.profilePhotoUrl || img('avatar-menu.jpg')} alt={name} />
        <strong>{name}</strong>
        <button type="button" className="icon-btn" aria-label="Close menu" onClick={onClose}>
          <IoClose size={26} />
        </button>
      </div>
      {items.map((group, gi) => (
        <div className="side-menu__group" key={gi}>
          {group.map((item) => {
            const { icon: I, label } = item;
            return (
              <button
                key={label}
                type="button"
                className="side-menu__item"
                onClick={() => handleItemClick(item)}
              >
                <I size={30} strokeWidth={1.5} />
                <span>{label}</span>
                {label === 'Inbox' && unreadMsg > 0 && (
                  <span style={{ marginLeft: 'auto', backgroundColor: '#0a5cff', color: '#fff', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold', padding: '1px 8px' }}>
                    {unreadMsg}
                  </span>
                )}
              </button>
            );
          })}
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
      { icon: IoSwapHorizontal, label: 'Switch to Host', action: 'switch-role-host' },
      { icon: FiMapPin, label: 'Saved Locations', to: '/app/saved-locations' },
      { icon: TbReceipt, label: 'Payment History', to: '/app/payments' },
    ],
    [
      { icon: FiGift, label: 'Gift Cards', to: '/app/gift-cards' },
      { icon: FiUsers, label: 'Refer & Earn', to: '/app/referrals' },
      { icon: FiHeadphones, label: 'Contact Us', to: '/app/contact' },
      { icon: FiMessageSquare, label: 'Send Feedback', action: 'feedback' },
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
      { icon: IoSwapHorizontal, label: 'Switch to Guest', action: 'switch-role-guest' },
      { icon: FiHeadphones, label: 'Help & Support', to: '/host/more' },
      { icon: FiMessageSquare, label: 'Send Feedback', action: 'feedback' },
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
