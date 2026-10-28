import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCamera, FiCalendar, FiFileText, FiMoreVertical, FiMapPin } from 'react-icons/fi';
import { MdLocationOn } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import Layout from '../../components/Layout';
import { DateRangeModal } from '../../components/Search';
import { Modal, Select, Radio, Field, Input } from '../../ui';
import { img, LOREM } from '../../data';
import { PaymentFields, AgreeBox, SuccessModal } from './Booking';
import { navigate } from '../../router';
import { apiRequest, getCurrentUser, setCurrentUser } from '../../lib/api';

function PageTitle({ title, children, right }) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{children || LOREM}</p>
      </div>
      {right}
    </div>
  );
}

/* Figma: "Frame 1707480130" — add / edit a saved address */
function LocationModal({ onClose, onCreated }) {
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('Home');
  const [landmark, setLandmark] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest('/locations', {
        method: 'POST',
        body: {
          address: address.trim(),
          label: label.trim() || 'Home',
          landmark: landmark.trim(),
        },
      });
      if (res?.data && onCreated) {
        onCreated(res.data);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} width={932} className="loc-modal" bare>
      <div className="loc-modal__map">
        <img src={img('modal-map.jpg')} alt="" />
        <span className="loc-modal__tip">Ashok Nagar, Hydera...</span>
        <MdLocationOn className="loc-modal__pin" size={44} />
        <button type="button" className="icon-btn loc-modal__x" aria-label="Close" onClick={onClose}>
          <IoClose size={30} />
        </button>
      </div>
      <form className="loc-modal__body" onSubmit={handleSubmit}>
        <small>Your selected address</small>
        {error && (
          <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '8px 12px', borderRadius: '8px', marginBottom: '8px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <fieldset>
          <legend>Location Details</legend>
          <label className="float-field">
            <span>Label (e.g. Home, Office)</span>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Home" />
          </label>
          <label className="float-field">
            <span>Address / Street name</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Type address here..." required />
          </label>
          <label className="float-field">
            <span>Landmark (Optional)</span>
            <input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Near city center..." />
          </label>
        </fieldset>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </Modal>
  );
}

/* Figma: "MacBook Pro 14 - 17" — Saved Locations */
export function SavedLocations() {
  const [modal, setModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = () => {
    apiRequest('/locations')
      .then((res) => {
        const list = res?.data || [];
        setLocations(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.warn('Could not load locations from server:', err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleDelete = async (id) => {
    if (!id) return;
    setLocations((prev) => prev.filter((loc) => loc._id !== id));
    try {
      await apiRequest(`/locations/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Delete location error:', err.message);
    }
  };

  return (
    <Layout role="user">
      <div className="container">
        <PageTitle
          title="Saved Locations"
          right={
            <button type="button" className="btn btn-black btn-pill" onClick={() => setModal(true)}>
              <FiPlus /> Add A New Location
            </button>
          }
        >
          Manage your saved addresses for fast pick-up and drop-off during checkout.
        </PageTitle>

        {loading ? (
          <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '16px 0', color: '#64748b' }}>
            Loading your saved addresses...
          </div>
        ) : locations.length === 0 ? (
          <div style={{ background: '#f8fafc', padding: '40px 24px', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '20px 0' }}>
            <p style={{ color: '#334155', fontWeight: 600, fontSize: '18px', margin: 0 }}>No saved locations yet</p>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '8px 0 20px' }}>
              Add your home, office, or airport address to quickly prefill your reservation trips.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => setModal(true)}>
              <FiPlus style={{ marginRight: '6px' }} /> Add Your First Location
            </button>
          </div>
        ) : (
          <div className="saved">
            <div className="saved__list">
              {locations.map((loc) => (
                <div className="saved__card" key={loc._id}>
                  <div className="saved__top">
                    <MdLocationOn size={20} />
                    <div>
                      <b>{loc.label || 'Saved Location'}</b>
                      <small>{loc.address}</small>
                    </div>
                    <button type="button" aria-label="Delete" onClick={() => handleDelete(loc._id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                  <p>Address: {loc.address}</p>
                  {loc.landmark && <p>Landmark: {loc.landmark}</p>}
                </div>
              ))}
            </div>
            <img className="saved__map" src={img('saved-map.jpg')} alt="Map" />
          </div>
        )}
      </div>
      {modal && <LocationModal onClose={() => setModal(false)} onCreated={fetchLocations} />}
    </Layout>
  );
}

/* Figma: "MacBook Pro 14 - 19" (user) / "MacBook Pro 14 - 53" (host) — Profile */
export function Profile({ role = 'user' }) {
  const [user, setUser] = useState(() => getCurrentUser() || {});
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Female');
  const [country, setCountry] = useState('US');
  const [language, setLanguage] = useState('English');
  const [timeZone, setTimeZone] = useState('Chicago (GMT-5)');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest('/users/me')
      .then((res) => {
        if (!active) return;
        const u = res?.data || {};
        setUser(u);
        setCurrentUser(u);
        setFullName(`${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User');
        if (u.gender) setGender(u.gender);
        if (u.country) setCountry(u.country);
        if (u.language) setLanguage(u.language);
        if (u.timeZone) setTimeZone(u.timeZone);
      })
      .catch((err) => {
        console.warn('Could not load current user from API:', err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const parts = fullName.trim().split(' ');
      const firstName = parts[0] || user.firstName || 'User';
      const lastName = parts.slice(1).join(' ') || user.lastName || '';
      const res = await apiRequest('/users/me', {
        method: 'PATCH',
        body: {
          firstName,
          lastName,
          gender,
          country,
          language,
          timeZone,
        },
      });
      if (res?.data) {
        setUser(res.data);
        setCurrentUser(res.data);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    try {
      setLoading(true);
      const res = await apiRequest('/users/me/photo', {
        method: 'POST',
        body: formData,
      });
      if (res?.data) {
        setUser(res.data);
        setCurrentUser(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to upload profile photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role={role}>
      <div className="container profile">
        <PageTitle title="Profile">
          Manage your account profile, contact details, and platform preferences.
        </PageTitle>
        <div className="profile__head">
          <label className="profile__avatar" style={{ cursor: 'pointer' }}>
            <img
              src={user.profilePhotoUrl || img('avatar-user.jpg')}
              alt={(fullName || '').trim() ? `${fullName.trim()}'s profile picture` : 'User profile picture'}
            />
            <span>
              <FiCamera size={22} />
            </span>
            <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
          </label>
          <div>
            <b>{fullName || 'Alexa Rawles'}</b>
            <small>{user.email || 'alexarawles@gmail.com'}</small>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>
        <div className="profile__grid">
          <Field label="Full Name">
            <Input
              className="input input--soft"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>
          <Field label="Role">
            <Input value={user.activeRole || role} readOnly disabled />
          </Field>
          <Field label="Gender">
            <Select value={gender} onChange={setGender} options={['Female', 'Male', 'Other']} />
          </Field>
          <Field label="Country">
            <Select value={country} onChange={setCountry} options={['US', 'United States', 'UK', 'India']} />
          </Field>
          <Field label="Language">
            <Select value={language} onChange={setLanguage} options={['English', 'Spanish', 'Hindi']} />
          </Field>
          <Field label="Time Zone">
            <Select value={timeZone} onChange={setTimeZone} options={['Chicago (GMT-5)', 'New York (GMT-4)', 'Los Angeles (GMT-7)']} />
          </Field>
          <Field label="Email">
            <Input value={user.email || 'example123@email.com'} readOnly disabled />
          </Field>
          <Field label="Phone No">
            <div className="phone-row">
              <span className="input input--code">{user.phoneCountryCode || '+1'}</span>
              <Input value={user.phoneNumber || '7778 562 369'} readOnly disabled />
            </div>
          </Field>
        </div>

        <DriverLicenseSection user={user} onUpdate={(updated) => setUser(updated)} />
      </div>
    </Layout>
  );
}

function DriverLicenseSection({ user, onUpdate }) {
  const license = user?.license || {};
  const [country, setCountry] = useState(license.issuingCountry || 'US');
  const [state, setState] = useState(license.state || 'CA');
  const [licenseNumber, setLicenseNumber] = useState(license.licenseNumber || '');
  const [expDate, setExpDate] = useState(() => {
    if (license.expirationDate) return new Date(license.expirationDate).toISOString().split('T')[0];
    const d = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const statusLabel = license.status || 'not_submitted';
  const statusColor = statusLabel === 'approved' ? '#16a34a' : statusLabel === 'pending' ? '#d97706' : '#6b7280';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('issuingCountry', country);
      formData.append('state', state);
      formData.append('licenseNumber', licenseNumber);
      formData.append('expirationDate', new Date(expDate).toISOString());
      formData.append('firstName', user?.firstName || 'User');
      formData.append('lastName', user?.lastName || 'Account');
      if (file) formData.append('document', file);

      const res = await apiRequest('/users/me/license', {
        method: 'POST',
        body: formData,
      });

      setMsg('Driver’s license uploaded successfully and is pending review!');
      if (res?.data) {
        onUpdate(res.data);
      }
    } catch (e) {
      setErr(e.message || 'Failed to submit license details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '36px', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Driver’s License Verification</h3>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>Required to rent and list vehicles on Turn &amp; Burn</p>
        </div>
        <span style={{ backgroundColor: `${statusColor}15`, color: statusColor, padding: '6px 12px', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>
          Status: {statusLabel.replace('_', ' ')}
        </span>
      </div>

      {err && <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '14px' }}>{err}</div>}
      {msg && <div style={{ color: '#15803d', backgroundColor: '#dcfce7', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '14px' }}>{msg}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Country</label>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country (e.g. US)" required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>State / Province</label>
          <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State (e.g. CA)" required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>License Number</label>
          <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g. D1234567" required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Expiration Date</label>
          <Input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Upload License Document / Photo</label>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0])} style={{ fontSize: '13px' }} />
        </div>
        <div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Upload & Verify'}
          </button>
        </div>
      </form>
    </div>
  );
}

const payments = [
  ['Sep 9, 2025, 04:30pm', 'F', 'fadel@email.com', 'Mira Stanton', '+$5,670.00', 'Pending'],
  ['Sep 8, 2025, 03:13pm', 'W', 'Wise - 5466xxxx', 'Carla Saris', '+$15,000.00', 'Completed'],
  ['Sep 7, 2025, 1:00pm', 'P', 'Paypal - 3345xxxx', 'Aspen Geidt', '-$3,456.00', 'Cancelled'],
  ['Sep 6, 2025, 07:00am', 'F', 'kikikarisma@email.com', 'Marcus Workman', '+$30,000.00', 'Pending'],
  ['Sep 8, 2025, 03:13pm', 'W', 'Wise - 5466xxxx', 'Dulce Vaccaro', '+$8,000.00', 'Completed'],
  ['Sep 8, 2025, 03:13pm', 'W', 'Wise - 5466xxxx', 'Davis Bator', '+$8,000.00', 'Completed'],
  ['Sep 8, 2025, 03:13pm', 'W', 'Wise - 5466xxxx', 'Madelyn Aminoff', '+$8,000.00', 'Completed'],
];

/* Figma: "MacBook Pro 14 - 20" — Payment History */
export function PaymentHistory() {
  const [cal, setCal] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest('/payments')
      .then((res) => {
        if (!active) return;
        const items = res?.data || [];
        setList(Array.isArray(items) ? items : []);
      })
      .catch((err) => {
        console.warn('Could not load payments from server:', err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleExportCsv = async () => {
    try {
      const token = localStorage.getItem('turn_and_burn_access_token');
      const res = await fetch('https://turn-and-burn-backend.onrender.com/api/v1/payments/export/csv', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'payments_export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('CSV export error:', err);
    }
  };

  const handleDownloadInvoice = (paymentId) => {
    if (!paymentId) return;
    const token = localStorage.getItem('turn_and_burn_access_token');
    window.open(`https://turn-and-burn-backend.onrender.com/api/v1/payments/${paymentId}/invoice?token=${token}`, '_blank');
  };

  const displayPayments = list.length > 0 ? list : payments.map((p, i) => ({
    _id: `mock-${i}`,
    referenceCode: '456789356',
    createdAt: p[0],
    payer: { firstName: p[2] },
    payee: { firstName: p[3] },
    amount: parseFloat(p[4].replace(/[^0-9.-]/g, '')) || 100,
    status: p[5].toLowerCase(),
    method: p[1] === 'P' ? 'paypal' : 'card',
  }));

  return (
    <Layout role="user">
      <div className="container">
        <PageTitle
          title="Payment History"
          right={
            <div className="ph-actions">
              <button type="button" className="chip-btn chip-btn--wide" onClick={() => setCal(true)}>
                Sep 9, 2024 - Sep 15, 2024 <FiCalendar />
              </button>
              <div>
                <button type="button" className="chip-btn" onClick={handleExportCsv}>
                  Export CSV <FiFileText />
                </button>
              </div>
            </div>
          }
        >
          View your completed and pending transactions, receipts, and invoices.
        </PageTitle>
        {loading && <p style={{ color: '#888', padding: '10px 0' }}>Loading your transactions...</p>}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Transaction Date</th>
                <th>From</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {displayPayments.map((p) => {
                const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
                const fromName = p.payer ? `${p.payer.firstName || ''} ${p.payer.lastName || ''}`.trim() || 'You' : 'You';
                const toName = p.payee ? `${p.payee.firstName || ''} ${p.payee.lastName || ''}`.trim() || 'Turn & Burn' : 'Turn & Burn';
                const statusStr = p.status || 'succeeded';
                const isSuccess = statusStr === 'succeeded';
                return (
                  <tr key={p._id}>
                    <td>{p.referenceCode || p._id?.slice(-8)}</td>
                    <td>{dateStr}</td>
                    <td>{fromName}</td>
                    <td>{toName}</td>
                    <td className="b">${Number(p.amount || 0).toFixed(2)}</td>
                    <td>
                      <span className={`status status--${isSuccess ? 'completed' : statusStr}`}>{statusStr}</span>
                    </td>
                    <td>
                      <button type="button" className="chip-btn" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleDownloadInvoice(p._id)}>
                        PDF <FiFileText />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {cal && <DateRangeModal compact onClose={() => setCal(false)} />}
    </Layout>
  );
}

/* Figma: "Frame 2147238977" — Gift card payment overlay */
function GiftPayModal({ onClose, onPaid, loading, amount }) {
  return (
    <Modal onClose={onClose} width={850} className="gift-pay">
      <div className="panel">
        <div className="center-head">
          <h3>Payment Method</h3>
          <small>Confirm your payment of ${amount.toFixed(2)} to complete your gift card purchase</small>
        </div>
        <PaymentFields />
      </div>
      <AgreeBox />
      <button type="button" className="btn btn-primary btn-block btn-xl" disabled={loading} onClick={onPaid}>
        {loading ? 'Processing Payment...' : `Pay $${amount.toFixed(2)} now`}
      </button>
    </Modal>
  );
}

/* Figma: "MacBook Pro 14 - 30" — Gift cards */
export function GiftCards() {
  const currentUser = getCurrentUser() || {};
  const [value, setValue] = useState('50');
  const [customValue, setCustomValue] = useState('');
  const [via, setVia] = useState('email');
  const [msg, setMsg] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [senderName, setSenderName] = useState(() => `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'A Friend');
  const [sendOnDate, setSendOnDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [step, setStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Balance and history
  const [creditBalance, setCreditBalance] = useState(0);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemMsg, setRedeemMsg] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const fetchCardData = () => {
    apiRequest('/payments/gift-cards/mine')
      .then((res) => {
        if (typeof res?.data?.travelCreditBalance === 'number') {
          setCreditBalance(res.data.travelCreditBalance);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCardData();
  }, []);

  const numericAmount = value === 'custom' ? parseFloat(customValue) || 50 : parseFloat(value) || 50;

  const handleValidateForm = () => {
    setError('');
    if (!recipientName.trim()) {
      setError('Please provide the recipient name.');
      return false;
    }
    if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
      setError('Please provide a valid recipient email address.');
      return false;
    }
    if (!senderName.trim()) {
      setError('Please specify your name as the sender.');
      return false;
    }
    if (numericAmount < 10 || numericAmount > 1000) {
      setError('Gift card amount must be between $10 and $1,000.');
      return false;
    }
    return true;
  };

  const handleProceedToPayment = () => {
    if (handleValidateForm()) {
      setStep('pay');
    }
  };

  const handleExecutePurchase = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim(),
        recipientPhone: recipientPhone.trim() || undefined,
        deliveryMethod: via,
        senderName: senderName.trim(),
        message: msg.trim() || undefined,
        amount: [50, 100, 200, 500].includes(numericAmount) ? numericAmount : undefined,
        customAmount: ![50, 100, 200, 500].includes(numericAmount) ? numericAmount : undefined,
        sendOn: new Date(`${sendOnDate}T12:00:00.000Z`).toISOString(),
        paymentMethodId: 'pm_card_visa', // standard test token accepted by backend payment provider
      };

      await apiRequest('/payments/gift-card', {
        method: 'POST',
        body: payload,
      });

      setStep('done');
      fetchCardData();
    } catch (err) {
      console.warn('Gift card purchase error:', err);
      setError(err?.message || 'Failed to complete gift card purchase. Please check your details.');
      setStep(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;
    setRedeeming(true);
    setRedeemMsg('');
    try {
      const res = await apiRequest('/payments/gift-cards/redeem', {
        method: 'POST',
        body: { code: redeemCode.trim().toUpperCase() },
      });
      setRedeemMsg(`Success! $${res?.data?.credited || ''} has been added to your travel credit.`);
      setRedeemCode('');
      fetchCardData();
    } catch (err) {
      setRedeemMsg(err?.message || 'Invalid or already redeemed gift card code.');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <Layout role="user">
      <div className="container">
        <PageTitle title="Turn and Burn Gift Cards">
          Give the gift of unforgettable journeys. Turn and Burn gift cards never expire and are redeemable towards any luxury vehicle in our fleet.
        </PageTitle>

        {/* Travel Credit & Redeem Banner */}
        <div style={{ background: '#f8fafc', padding: '20px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '20px 0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Travel Credit Balance</span>
            <h2 style={{ margin: '4px 0 0', color: '#0f172a', fontSize: '28px' }}>${creditBalance.toFixed(2)}</h2>
          </div>
          <form onSubmit={handleRedeem} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              placeholder="Enter Gift Card Code"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', minWidth: '220px', textTransform: 'uppercase' }}
            />
            <button type="submit" className="btn btn-black" disabled={redeeming || !redeemCode.trim()}>
              {redeeming ? 'Redeeming...' : 'Redeem Code'}
            </button>
          </form>
        </div>

        {redeemMsg && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', backgroundColor: redeemMsg.startsWith('Success') ? '#dcfce7' : '#fee2e2', color: redeemMsg.startsWith('Success') ? '#15803d' : '#b91c1c' }}>
            {redeemMsg}
          </div>
        )}

        {error && (
          <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div className="gift-hero">
          <img src={img('gift-1.jpg')} alt="Gift Card" />
          <img src={img('gift-2.jpg')} alt="Gift Card" />
          <img src={img('gift-3.jpg')} alt="Gift Card" />
        </div>

        <div className="form-narrow gift-form">
          <h2>Select Value (USD)</h2>
          <p className="sm">Choose an amount or enter a custom balance between $10 and $1,000.</p>
          <div className="values">
            {['50', '100', '200', '500'].map((v) => (
              <button
                key={v}
                type="button"
                className={value === v ? 'is-active' : ''}
                onClick={() => {
                  setValue(v);
                  setCustomValue('');
                }}
              >
                ${v}
              </button>
            ))}
            <label className={`values__custom ${value === 'custom' ? 'is-active' : ''}`}>
              ${' '}
              <input
                placeholder="Custom"
                type="number"
                min="10"
                max="1000"
                value={customValue}
                onChange={(e) => {
                  setCustomValue(e.target.value);
                  setValue('custom');
                }}
                onFocus={() => setValue('custom')}
              />
            </label>
          </div>
          <p className="sm">The recipient can redeem this gift card directly into their travel credit balance to use on any future rental.</p>

          <h3>How would you like to deliver it?</h3>
          <Radio name="via" checked={via === 'email'} onChange={() => setVia('email')}>
            Email Address
          </Radio>
          <Radio name="via" checked={via === 'text'} onChange={() => setVia('text')}>
            SMS / Text message
          </Radio>

          <h3>Who is it for?</h3>
          <Field label="Recipient name">
            <Input
              placeholder="e.g. Sarah Connor"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </Field>
          <Field label="Recipient email">
            <Input
              type="email"
              placeholder="e.g. sarah@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </Field>
          {via === 'text' && (
            <Field label="Recipient mobile phone">
              <Input
                placeholder="e.g. +1 555-0199"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
              />
            </Field>
          )}
          <Field label="Personal message" hint={`${150 - msg.length} characters left`}>
            <textarea
              className="input textarea"
              rows={4}
              maxLength={150}
              placeholder="Here’s a Turn and Burn gift card to help you get on the road!"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
          </Field>

          <h3>Sender details</h3>
          <Field label="Your name">
            <Input
              placeholder="Your full name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </Field>
          <Field label="Send on date">
            <Input
              type="date"
              value={sendOnDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSendOnDate(e.target.value)}
            />
          </Field>

          <button
            type="button"
            className="btn btn-primary btn-lg btn-upper"
            style={{ marginTop: '20px' }}
            onClick={handleProceedToPayment}
          >
            CONTINUE TO PAYMENT • ${numericAmount.toFixed(2)}
          </button>
        </div>
      </div>

      {step === 'pay' && (
        <GiftPayModal
          amount={numericAmount}
          loading={loading}
          onClose={() => setStep(null)}
          onPaid={handleExecutePurchase}
        />
      )}

      {step === 'done' && (
        <SuccessModal
          text={`Your gift card of $${numericAmount.toFixed(2)} has been successfully purchased and sent to ${recipientEmail}.`}
          onClose={() => setStep(null)}
          onDone={() => setStep(null)}
        />
      )}
    </Layout>
  );
}

