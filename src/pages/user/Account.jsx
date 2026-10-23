import { useState } from 'react';
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
function LocationModal({ onClose }) {
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
      <div className="loc-modal__body">
        <small>Your selected address</small>
        <p className="loc-modal__addr">
          <MdLocationOn size={22} />
          <span>
            <b>Ashok Nagar</b>
            <small>Hyderabad, Telangana</small>
          </span>
        </p>
        <fieldset>
          <legend>Location Details</legend>
          <label className="float-field">
            <span>Block/Door No/Flat No/Street name</span>
            <input placeholder="Type her" />
          </label>
          <label className="float-field">
            <span>Land Mark(Optional)</span>
            <input placeholder="Type here" />
          </label>
        </fieldset>
        <fieldset>
          <legend>Contact Person Details</legend>
          <label className="float-field">
            <span>Name</span>
            <input placeholder="Type Name" />
          </label>
          <label className="float-field">
            <span>Phone Number</span>
            <input placeholder="+91" />
          </label>
        </fieldset>
        <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
          Save
        </button>
      </div>
    </Modal>
  );
}

/* Figma: "MacBook Pro 14 - 17" — Saved Locations */
export function SavedLocations() {
  const [modal, setModal] = useState(false);
  const [items, setItems] = useState([1, 2, 3]);
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
        />
        <div className="saved">
          <div className="saved__list">
            {items.map((id) => (
              <div className="saved__card" key={id}>
                <div className="saved__top">
                  <MdLocationOn size={20} />
                  <div>
                    <b>New York City</b>
                    <small>New York City, New York</small>
                  </div>
                  <button type="button" aria-label="Edit" onClick={() => setModal(true)}>
                    <FiEdit2 />
                  </button>
                  <button type="button" aria-label="Delete" onClick={() => setItems(items.filter((x) => x !== id))}>
                    <FiTrash2 />
                  </button>
                </div>
                <p>Flat No.: 108/77</p>
                <p>Land Mark : New York Airport</p>
                <p>Name : John Dow</p>
                <p>Phone Number : +1 7778 956 254</p>
              </div>
            ))}
          </div>
          <img className="saved__map" src={img('saved-map.jpg')} alt="Map" />
        </div>
      </div>
      {modal && <LocationModal onClose={() => setModal(false)} />}
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

  return (
    <Layout role={role}>
      <div className="container profile">
        <PageTitle title="Profile">
          Manage your account profile, contact details, and platform preferences.
        </PageTitle>
        <div className="profile__head">
          <label className="profile__avatar">
            <img src={user.profilePhotoUrl || img('avatar-user.jpg')} alt="" />
            <span>
              <FiCamera size={22} />
            </span>
            <input type="file" accept="image/*" hidden />
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
                <button type="button" className="chip-btn">
                  Export CSV <FiFileText />
                </button>
                <button type="button" className="chip-btn">
                  Download Invoices <FiFileText />
                </button>
              </div>
            </div>
          }
        >
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
        </PageTitle>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(([d, ic, from, to, amt, st], i) => (
                <tr key={i}>
                  <td>456789356</td>
                  <td>{d}</td>
                  <td>
                    <span className={`src src--${ic}`}>{ic === 'W' ? '7' : ic}</span>
                    {from}
                  </td>
                  <td>{to}</td>
                  <td className={amt.startsWith('-') ? 'muted' : 'b'}>{amt}</td>
                  <td>
                    <span className={`status status--${st.toLowerCase()}`}>{st}</span>
                  </td>
                  <td>
                    <button type="button" className="icon-btn" aria-label="Actions">
                      <FiMoreVertical />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {cal && <DateRangeModal compact onClose={() => setCal(false)} />}
    </Layout>
  );
}

/* Figma: "Frame 2147238977" — Gift card payment overlay */
function GiftPayModal({ onClose, onPaid }) {
  return (
    <Modal onClose={onClose} width={850} className="gift-pay">
      <div className="panel">
        <div className="center-head">
          <h3>Payment Method</h3>
          <small>Please enter your payment method</small>
        </div>
        <PaymentFields />
      </div>
      <AgreeBox />
      <button type="button" className="btn btn-primary btn-block btn-xl" onClick={onPaid}>
        Pay now
      </button>
    </Modal>
  );
}

/* Figma: "MacBook Pro 14 - 30" — Gift cards */
export function GiftCards() {
  const [value, setValue] = useState('$50');
  const [via, setVia] = useState('');
  const [msg, setMsg] = useState('');
  const [step, setStep] = useState(null);
  return (
    <Layout role="user">
      <div className="container">
        <PageTitle title="Turo gift cards">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
        </PageTitle>
        <div className="gift-hero">
          <img src={img('gift-1.jpg')} alt="" />
          <img src={img('gift-2.jpg')} alt="" />
          <img src={img('gift-3.jpg')} alt="" />
        </div>
        <div className="form-narrow gift-form">
          <h2>Value (USD)</h2>
          <p className="sm">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
          <div className="values">
            {['$50', '$100', '$200', '$500'].map((v) => (
              <button key={v} type="button" className={value === v ? 'is-active' : ''} onClick={() => setValue(v)}>
                {v}
              </button>
            ))}
            <label className={`values__custom ${value === 'custom' ? 'is-active' : ''}`}>
              $ <input placeholder="Custom" onFocus={() => setValue('custom')} />
            </label>
          </div>
          <p className="sm">The recipient will add the value of this gift card to their travel credit balance, and it’ll never expire.</p>
          <h3>How would you like to send it?</h3>
          <Radio name="via" checked={via === 'email'} onChange={() => setVia('email')}>
            Email
          </Radio>
          <Radio name="via" checked={via === 'text'} onChange={() => setVia('text')}>
            Text message
          </Radio>
          <h3>Who is it for?</h3>
          <Field label="Recipient name">
            <Input placeholder="Enter.." />
          </Field>
          <Field label="Recipient email">
            <Input placeholder="Enter.." />
          </Field>
          <Field label="Add a custom message" hint={`${150 - msg.length} characters left`}>
            <textarea className="input textarea" rows={5} maxLength={150} placeholder="Here’s a Turn and Burn gift card to help you get on the road!" value={msg} onChange={(e) => setMsg(e.target.value)} />
          </Field>
          <h3>Who is it from?</h3>
          <Field label="Name">
            <Input placeholder="Enter.." />
          </Field>
          <Field label="Send on">
            <Input defaultValue="July 04, 2026 (Today)" />
          </Field>
          <p className="sm">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged.
          </p>
          <button type="button" className="btn btn-primary btn-lg btn-upper" onClick={() => setStep('pay')}>
            PAY NOW
          </button>
        </div>
      </div>
      {step === 'pay' && <GiftPayModal onClose={() => setStep(null)} onPaid={() => setStep('done')} />}
      {step === 'done' && (
        <SuccessModal
          text="You Successfully Completed The Payment And The Gift Card Has Beed Successfully Send To The Recipient's Email Address."
          onClose={() => setStep(null)}
          onDone={() => navigate('/app')}
        />
      )}
    </Layout>
  );
}

