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
  const [saved, setSaved] = useState(false);
  return (
    <Layout role={role}>
      <div className="container profile">
        <PageTitle title="Profile">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
        </PageTitle>
        <div className="profile__head">
          <label className="profile__avatar">
            <img src={img('avatar-user.jpg')} alt="" />
            <span>
              <FiCamera size={22} />
            </span>
            <input type="file" accept="image/*" hidden />
          </label>
          <div>
            <b>Alexa Rawles</b>
            <small>alexarawles@gmail.com</small>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setSaved(true)}>
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
        <div className="profile__grid">
          <Field label="Full Name">
            <Input className="input input--soft" defaultValue="Alexa Rawles" />
          </Field>
          <Field label="Nick Name">
            <Input defaultValue="Ale" />
          </Field>
          <Field label="Gender">
            <Select value="Female" options={['Female', 'Male', 'Other']} />
          </Field>
          <Field label="Country">
            <Select value="US" options={['US', 'UK', 'India']} />
          </Field>
          <Field label="Language">
            <Select value="English" options={['English', 'Spanish', 'Hindi']} />
          </Field>
          <Field label="Time Zone">
            <Select value="Chicago (GMT-5)" options={['Chicago (GMT-5)', 'New York (GMT-4)', 'Los Angeles (GMT-7)']} />
          </Field>
          <Field label="Email">
            <Input defaultValue="example123@email.com" />
          </Field>
          <Field label="Phone No">
            <div className="phone-row">
              <span className="input input--code">+1</span>
              <Input defaultValue="7778 562 369" />
            </div>
          </Field>
        </div>
      </div>
    </Layout>
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

