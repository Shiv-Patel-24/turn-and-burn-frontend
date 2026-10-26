import { useState } from 'react';
import { FiSearch, FiPlus, FiUser, FiHelpCircle, FiArrowLeft, FiArrowRight, FiChevronDown, FiArrowUp, FiRotateCw, FiDownload } from 'react-icons/fi';
import { MdLocationOn } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import Layout from '../../components/Layout';
import { Field, Input, Select, Checkbox, Radio, Toggle, Modal } from '../../ui';
import { PaymentFields, AgreeBox, SuccessModal } from '../user/Booking';
import { TermsList } from '../InfoPages';
import { img, LOREM_SHORT, LOREM_LONG } from '../../data';
import { navigate, useRoute, Link } from '../../router';

/* Order + labels exactly as in the Figma onboarding frames (S24 → S39) */
export const STEPS = [
  { key: 'location', n: 1, next: 'VIN' },
  { key: 'vin', n: 1, next: 'Profile photo' },
  { key: 'car', n: 1, next: 'Profile photo' },
  { key: 'photo', n: 2, next: 'Mobile number' },
  { key: 'mobile', n: 3, next: 'Driver’s license' },
  { key: 'verify', n: 3, next: 'Driver’s license' },
  { key: 'license', n: 4, next: 'Your goals' },
  { key: 'goals', n: 5, next: 'Car availability' },
  { key: 'availability', n: 6, next: 'Car details' },
  { key: 'details', n: 7, next: 'Car photos' },
  { key: 'photos', n: 8, next: 'Pricing and payout' },
  { key: 'pricing', n: 9, next: 'Terms and conditions' },
  { key: 'terms', n: 10, next: 'Acknowledgment' },
  { key: 'acknowledgment', n: 11 },
];

export const FEATURES = [
  'All-wheel drive', 'Android Auto', 'Apple CarPlay', 'AUX input', 'Backup camera', 'Bike rack', 'Blind spot warning', 'Bluetooth', 'Child seat',
  'Convertible', 'GPS', 'Heated seats', 'Keyless entry', 'Pet friendly', 'Ski rack', 'Snow tires or chains', 'Sunroof', 'Toll pass', 'USB charger', 'USB input', 'Wheelchair accessible',
];

export const GOAL_OPTIONS = {
  goal: ['Cover your car payment', 'Generate side income', 'Expand an existing business', 'Build a primary source of income', 'Not sure yet'],
  use: ['Never', 'Rarely: once a week or less', 'Sometimes: a few days per week', 'Often: most days per week', 'Always: every day'],
  share: ['Not sure yet or just curious', 'Rarely: a few times per month', 'Sometimes: about half the month', 'Often: most of the month', 'Always: as often as possible'],
  notice: ['1 day (recommended)', '2 day', '3 day'],
  min: ['1 day (recommended)', '2 day', '3 day'],
  max: ['1 week', '2 weeks (recommended)', '3 weeks'],
};

/* Figma: "Frame 2147238945" — OS-style file upload dialog */
export function FileDialog({ onClose, onPick }) {
  const files = [img('avatar-host.jpg'), img('up-6.jpg')];
  const [sel, setSel] = useState(null);
  return (
    <Modal onClose={onClose} width={854} className="file-dlg" bare>
      <div className="file-dlg__bar">
        <span className="file-dlg__app" />
        File Upload
        <button type="button" aria-label="Close" onClick={onClose}>
          <IoClose size={24} />
        </button>
      </div>
      <div className="file-dlg__nav">
        <FiArrowLeft size={20} />
        <FiArrowRight size={20} />
        <FiChevronDown size={16} />
        <FiArrowUp size={20} />
        <div className="file-dlg__path">
          <FiDownload color="#22c55e" /> › Downloads ›<FiChevronDown className="ml-auto" />
          <FiRotateCw />
        </div>
        <div className="file-dlg__search">
          Search Downloads <FiSearch />
        </div>
      </div>
      <div className="file-dlg__tools">
        <span>Organize ▾</span>
        <span>New folder</span>
        <FiHelpCircle className="ml-auto" color="#0ea5e9" size={22} />
      </div>
      <div className="file-dlg__main">
        <ul className="file-dlg__side">
          <li className="is-active">› ABC - Personal</li>
          {['Desktop', 'Downloads', 'Documents', 'Pictures', 'Music', 'Videos'].map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <div className="file-dlg__files">
          <p>⌄ Today</p>
          <div className="file-dlg__grid">
            {files.map((f, i) => (
              <button type="button" key={f} className={sel === i ? 'is-sel' : ''} onClick={() => setSel(i)} onDoubleClick={() => onPick(f)}>
                <img src={f} alt="" />
                Lorem Ipsum is simply dummy text.jpg
              </button>
            ))}
          </div>
          <p>⌄ Earlier this week</p>
        </div>
        <div className="file-dlg__preview">{sel === null ? 'Select a file to preview.' : <img src={files[sel]} alt="" />}</div>
      </div>
      <div className="file-dlg__foot">
        <label>
          File name: <input readOnly value={sel === null ? '' : 'Lorem Ipsum is simply dummy text.jpg'} />
        </label>
        <span className="file-dlg__type">All Supported Types ▾</span>
        <button type="button" disabled={sel === null} onClick={() => onPick(files[sel])}>
          Open
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}

/* Address autocomplete (Figma "Component 1145") */
export function AddressInput({ value, setValue, label = 'Where is your car located?' }) {
  const [focus, setFocus] = useState(false);
  const suggestions = ['Terminal 4 Terminal 4 Departures, Jamaica, NY 11430, USA', '4 Terminal 4 Departures, Jamaica, NY 11430, USA'];
  const show = focus && value.length > 0 && !suggestions.includes(value);
  return (
    <Field label={label} className="addr">
      <Input placeholder="Enter address" value={value} onChange={(e) => setValue(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)} />
      {show && (
        <div className="addr__list">
          {suggestions.map((s) => (
            <button type="button" key={s} onClick={() => setValue(s)}>
              <span>
                <MdLocationOn size={26} />
              </span>
              {s}
            </button>
          ))}
          <button type="button" onClick={() => setFocus(false)}>
            <span>
              <FiHelpCircle size={24} />
            </span>
            I don’t see my address
          </button>
        </div>
      )}
    </Field>
  );
}

export function UploadTile({ onClick }) {
  return (
    <button type="button" className="upload-tile" onClick={onClick}>
      <FiPlus size={30} />
      Upload photo
    </button>
  );
}

export function CarSections({ values }) {
  const isObj = typeof values === 'object' && values !== null;
  const initialTrans = isObj ? (values.transmission || 'Automatic') : (values ? 'Automatic' : '');
  const [trans, setTrans] = useState(initialTrans);
  const [salvage, setSalvage] = useState(!!values);
  const [tax, setTax] = useState(values ? 'Yes' : '');
  return (
    <>
      <h2 className="step__h">Make and model</h2>
      <p className="step__p">is simply dummy text of the printing and typesetting industry.</p>
      <Field label="Year">
        <Input placeholder="e.g., 2020" defaultValue={isObj ? values.year : (values ? '2020' : '')} />
      </Field>
      <Field label="Make">
        <Input placeholder="e.g., BMW" defaultValue={isObj ? values.make : (values ? 'BMW' : '')} />
      </Field>
      <Field label="Model">
        <Input placeholder="e.g., 4 Series" defaultValue={isObj ? values.model : (values ? '4 Series' : '')} />
      </Field>
      <h2 className="step__h">Trim and style</h2>
      <p className="step__p">is simply dummy text of the printing and typesetting industry.</p>
      <Field label="Trim">
        <Input placeholder="Enter your vehicle Trim" defaultValue={isObj ? (values.trim || 'Standard') : (values ? 'Vehicle Trim' : '')} />
      </Field>
      <Field label="Style">
        <Input placeholder="e.g., Coupe" defaultValue={isObj ? values.style : (values ? 'Coupe' : '')} />
      </Field>
      <h2 className="step__h">Odometer and transmission</h2>
      <p className="step__p">is simply dummy text of the printing and typesetting industry.</p>
      <p className="step__label">Odometer</p>
      <Field label="What is your car's odometer reading?">
        <Input placeholder="Enter your odometer reading e.g., 10-20k miles" defaultValue={isObj ? (values.odometer ? `${values.odometer} miles` : '35,000 miles') : (values ? '10-20k miles' : '')} />
      </Field>
      <p className="step__label">Transmission</p>
      <div className="stack-sm">
        <Radio name="trans" checked={trans === 'Automatic'} onChange={() => setTrans('Automatic')}>
          Automatic
        </Radio>
        <Radio name="trans" checked={trans === 'Manual'} onChange={() => setTrans('Manual')}>
          Manual
        </Radio>
      </div>
      <h2 className="step__h">Car History</h2>
      <p className="step__p">is simply dummy text of the printing and typesetting industry.</p>
      <Checkbox checked={salvage} onChange={setSalvage}>
        My car has never a branded or salvage title
      </Checkbox>
      <p className="step__q">I certify I paid applicable sales or related taxes on the purchase of this vehicle.</p>
      <div className="stack-sm">
        <Radio name="tax" checked={tax === 'Yes'} onChange={() => setTax('Yes')}>
          Yes
        </Radio>
        <Radio name="tax" checked={tax === 'No'} onChange={() => setTax('No')}>
          No
        </Radio>
      </div>
    </>
  );
}

function ProgressHeader({ step }) {
  const total = 11;
  return (
    <div className="container onboard-top">
      <label className="big-search">
        <FiSearch size={30} strokeWidth={1.5} />
        <input placeholder="Airport, hotel, address, city..." />
      </label>
      <h3>List your car</h3>
      <p className="onboard-top__meta">
        {step.n} of {total} steps {step.next && <>&nbsp; I &nbsp; Next: {step.next} &nbsp; I &nbsp;</>}
        {step.next ? <Link to="/host/list/location">Start over</Link> : null}
      </p>
      <div className="progress">
        <span style={{ width: `${(step.n / total) * 100}%` }} />
      </div>
    </div>
  );
}

/* Figma: "MacBook Pro 14 - 24 … 39" — List your car wizard */
export default function Onboarding() {
  const { params } = useRoute();
  const idx = Math.max(0, STEPS.findIndex((s) => s.key === params.step));
  const step = STEPS[idx];
  const go = (k) => navigate(`/host/list/${k}`);
  const nextKey = STEPS[idx + 1] ? STEPS[idx + 1].key : null;
  const [address, setAddress] = useState('');
  const [vinOld, setVinOld] = useState(false);
  const [file, setFile] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [photos, setPhotos] = useState([img('up-6.jpg')]);
  const [smsOk, setSmsOk] = useState(false);
  const [goals, setGoals] = useState({ goal: '', use: '', share: '' });
  const [avail, setAvail] = useState({ notice: '', min: '1 day (recommended)', max: '2 weeks (recommended)' });
  const [feat, setFeat] = useState([]);
  const [auto, setAuto] = useState(true);
  const [paid, setPaid] = useState(false);

  const Next = ({ disabled, onClick }) => (
    <button type="button" className="btn btn-primary btn-upper btn-next" disabled={disabled} onClick={onClick || (() => go(nextKey))}>
      NEXT
    </button>
  );

  let body;
  switch (step.key) {
    case 'location':
      body = (
        <>
          <h1 className="step__title">Location</h1>
          <p className="step__p">Turn and Burn needs your location to ensure we operate where you are.</p>
          <AddressInput value={address} setValue={setAddress} />
          <Next disabled={!address} />
        </>
      );
      break;
    case 'vin':
      body = (
        <>
          <h1 className="step__title">VIN</h1>
          <p className="step__p">We’ll use your Vehicle Identification Number (VIN) to identify your specific car</p>
          <Field label="Enter your VIN">
            <Input placeholder="Enter 17 digit VIN" maxLength={17} />
          </Field>
          <Checkbox checked={vinOld} onChange={setVinOld}>
            My vehicle is older than 1981
          </Checkbox>
          <Next />
        </>
      );
      break;
    case 'car':
      body = (
        <>
          <CarSections />
          <Next />
        </>
      );
      break;
    case 'photo':
      body = (
        <>
          <h1 className="step__title">Profile photo</h1>
          <p className="step__p">Adding a photo helps hosts and guests recognize each other when picking up the car.</p>
          <div className="photo-pick">
            <span className="photo-pick__circle">{avatar ? <img src={avatar} alt="" /> : <FiUser size={60} />}</span>
            <button type="button" className="btn btn-outline" onClick={() => setFile('avatar')}>
              Upload profile photo
            </button>
          </div>
          <Next />
        </>
      );
      break;
    case 'mobile':
    case 'verify':
      body = (
        <>
          <h1 className="step__title">Mobile number</h1>
          <p className="step__p">Enter your mobile number and we’ll text you a verification code.</p>
          <div className="grid-phone">
            <Field label="Country code">
              <div className="flag-select">
                <span className="flag" aria-hidden>
                  🇺🇸
                </span>
                +1
              </div>
            </Field>
            <Field label="Phone number">
              <Input defaultValue="555 1722-123" readOnly={step.key === 'verify'} />
            </Field>
          </div>
          {step.key === 'mobile' ? (
            <Checkbox checked={smsOk} onChange={setSmsOk}>
              Get important trip updates via text message.
            </Checkbox>
          ) : (
            <>
              <button type="button" className="link-btn" onClick={() => go('mobile')}>
                Change phone number.
              </button>
              <Field label="Enter your OTP">
                <Input placeholder="Enter" maxLength={6} />
              </Field>
              <button type="button" className="link-btn link-btn--muted">
                Re-send OTP
              </button>
            </>
          )}
          <Next />
        </>
      );
      break;
    case 'license':
      body = (
        <>
          <h1 className="step__title">Driver’s license</h1>
          <p className="step__p">{LOREM_SHORT}</p>
          <LicenseFields />
          <Next />
        </>
      );
      break;
    case 'goals':
      body = (
        <>
          <h1 className="step__title">Your goals</h1>
          <p className="step__p">{LOREM_SHORT}</p>
          <GoalFields value={goals} onChange={setGoals} />
          <Next />
        </>
      );
      break;
    case 'availability':
      body = (
        <>
          <h1 className="step__title">Car availability</h1>
          <p className="step__p">{LOREM_SHORT}</p>
          <AvailabilityFields value={avail} onChange={setAvail} />
          <Next />
        </>
      );
      break;
    case 'details':
      body = (
        <>
          <h1 className="step__title">Car details</h1>
          <p className="step__p">{LOREM_SHORT}</p>
          <DetailsFields features={feat} setFeatures={setFeat} />
          <Next />
        </>
      );
      break;
    case 'photos':
      body = (
        <>
          <h1 className="step__title">Car photos</h1>
          <p className="step__p">{LOREM_LONG}</p>
          <p className="step__label">Car photo tips</p>
          <div className="tips">
            {['Front', '3/4 Front-side', 'Left Side', 'Right Side', 'Back'].map((t, i) => (
              <figure key={t}>
                <img src={img(`up-${i + 1}.jpg`)} alt={t} />
                <figcaption>{t}</figcaption>
              </figure>
            ))}
          </div>
          <p className="step__label">Upload your car photos</p>
          <div className="tips">
            {photos.map((p, i) => (
              <figure key={i}>
                <img src={p} alt="" />
              </figure>
            ))}
            <UploadTile onClick={() => setFile('photo')} />
          </div>
          <Next />
        </>
      );
      break;
    case 'pricing':
      body = (
        <>
          <h1 className="step__title">Pricing &amp; discounts</h1>
          <p className="step__p">{LOREM_SHORT}</p>
          <p className="step__label">Automatic Pricing</p>
          <p className="step__p2">Boost earning by letting your price automatically adjust to match demand.</p>
          <Toggle on={auto} onChange={setAuto} />
          <PriceRange />
          <h2 className="step__h">Payout</h2>
          <p className="step__p">{LOREM_LONG}</p>
          <div className="stack">
            <PaymentFields />
          </div>
          <AgreeBox />
          <Next onClick={() => setPaid(true)} />
        </>
      );
      break;
    case 'terms':
      body = (
        <>
          <h1 className="step__title">Terms and conditions</h1>
          <p className="step__p">{LOREM_LONG}</p>
          <div className="terms terms--embed">
            <TermsList />
          </div>
          <Next />
        </>
      );
      break;
    default:
      body = (
        <>
          <h1 className="step__title">Acknowledgment</h1>
          <p className="step__p">{LOREM_LONG}</p>
          <div className="ack">
            <p>{LOREM_LONG}</p>
            <p>{LOREM_LONG}</p>
          </div>
          <div className="ack">
            <p>{LOREM_LONG}</p>
            <p>{LOREM_LONG}</p>
          </div>
          <button type="button" className="btn btn-primary btn-upper btn-hero" onClick={() => navigate('/host/calendar')}>
            GET STARTED
          </button>
        </>
      );
  }

  return (
    <Layout role="host">
      <ProgressHeader step={step} />
      <section className={`step ${step.key === 'acknowledgment' || step.key === 'terms' ? 'step--wide' : ''}`}>{body}</section>
      {file && (
        <FileDialog
          onClose={() => setFile(null)}
          onPick={(f) => {
            if (file === 'avatar') setAvatar(f);
            else setPhotos([...photos, f]);
            setFile(null);
          }}
        />
      )}
      {paid && <SuccessModal text="You Successfully Completed The Payment." onClose={() => setPaid(false)} onDone={() => go('terms')} />}
    </Layout>
  );
}

/* ---------- field groups reused by the vehicle-edit screens ---------- */

export function LicenseFields({ filled }) {
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const years = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
  return (
    <>
      <div className="grid-license">
        <Field label="Issuing country">
          <Select value="United Status" options={['United Status', 'Canada', 'Mexico']} />
        </Field>
        <Field label="State">
          <Select value="Texas" options={['Texas', 'New York', 'California']} />
        </Field>
        <Field label="Driver’s license number">
          <Input placeholder="Enter..." defaultValue={filled ? 'TX58U1331' : ''} />
        </Field>
      </div>
      <p className="step__p2">Enter your name exactly as it appears on your driver’s license</p>
      <div className="grid-3">
        <Field label="First name">
          <Input placeholder="Enter" defaultValue={filled ? 'Kianna' : ''} />
        </Field>
        <Field label="Middle name">
          <Input placeholder="Enter" />
        </Field>
        <Field label="Last name">
          <Input placeholder="Enter" defaultValue={filled ? 'Dorwart' : ''} />
        </Field>
      </div>
      <p className="step__label">Expiration date</p>
      <div className="grid-3">
        <Select placeholder={filled ? undefined : 'Month'} value={filled ? '12' : ''} options={months} />
        <Select placeholder={filled ? undefined : 'Day'} value={filled ? '31' : ''} options={days} />
        <Select placeholder={filled ? undefined : 'Year'} value={filled ? '2030' : ''} options={years(2026, 2040)} />
      </div>
      <p className="step__label">Date of birth</p>
      <div className="grid-3">
        <Select placeholder={filled ? undefined : 'Month'} value={filled ? '07' : ''} options={months} />
        <Select placeholder={filled ? undefined : 'Day'} value={filled ? '07' : ''} options={days} />
        <Select placeholder={filled ? undefined : 'Year'} value={filled ? '1987' : ''} options={years(1940, 2008)} />
      </div>
      <p className="step__p2">{LOREM_SHORT}</p>
    </>
  );
}

function ControlledSelect({ value, onChange, options }) {
  const [v, setV] = useState(value);
  return (
    <Select
      value={v}
      onChange={(x) => {
        setV(x);
        onChange && onChange(x);
      }}
      placeholder="Select..."
      options={options}
    />
  );
}

export function GoalFields({ value = {}, onChange }) {
  const set = (k) => (v) => onChange && onChange({ ...value, [k]: v });
  return (
    <>
      <Field label="What is your primary financial goal for sharing this car on Turn and Burn?">
        <ControlledSelect value={value.goal || ''} onChange={set('goal')} options={GOAL_OPTIONS.goal} />
      </Field>
      <Field label="How often do you or your family currently use this car?">
        <ControlledSelect value={value.use || ''} onChange={set('use')} options={GOAL_OPTIONS.use} />
      </Field>
      <Field label="How often do you want to share your car?">
        <ControlledSelect value={value.share || ''} onChange={set('share')} options={GOAL_OPTIONS.share} />
      </Field>
      <p className="step__p2">{LOREM_SHORT}</p>
    </>
  );
}

export function AvailabilityFields({ value = {}, onChange }) {
  const set = (k) => (v) => onChange && onChange({ ...value, [k]: v });
  return (
    <>
      <p className="step__label">Advance notice</p>
      <Field label="How much advance notice do you need before a trip starts?" className="field--normal">
        <ControlledSelect value={value.notice || ''} onChange={set('notice')} options={GOAL_OPTIONS.notice} />
      </Field>
      <p className="step__label">Trip duration</p>
      <p className="step__p2">What’s the shortest and longest possible trip you’ll accept?</p>
      <div className="grid-2">
        <Field label="Minimum trip duration" className="field--normal">
          <ControlledSelect value={value.min || ''} onChange={set('min')} options={GOAL_OPTIONS.min} />
        </Field>
        <Field label="Maximum trip duration" className="field--normal">
          <ControlledSelect value={value.max || ''} onChange={set('max')} options={GOAL_OPTIONS.max} />
        </Field>
      </div>
    </>
  );
}

export function DetailsFields({ features, setFeatures, filled, defaultPlate, defaultState, defaultDesc }) {
  const toggle = (f) => setFeatures(features.includes(f) ? features.filter((x) => x !== f) : [...features, f]);
  const stateVal = defaultState || (filled ? 'Taxus' : '');
  const stateOptions = ['Taxus', 'New York', 'California', 'NC'];
  return (
    <>
      <p className="step__label">About car</p>
      <div className="grid-2">
        <Field label="License plate number" className="field--normal">
          <Input placeholder="Plate number" defaultValue={defaultPlate || (filled ? 'TX58U1332' : '')} />
        </Field>
        <Field label="State" className="field--normal">
          <Select
            placeholder={stateVal ? undefined : 'State / Province'}
            value={stateVal}
            options={stateOptions.includes(stateVal) ? stateOptions : [...stateOptions, stateVal]}
          />
        </Field>
      </div>
      <p className="step__label">Car feature</p>
      <div className="features">
        {FEATURES.map((f) => (
          <Checkbox key={f} checked={features.includes(f)} onChange={() => toggle(f)} className="check--blue">
            {f}
          </Checkbox>
        ))}
      </div>
      <p className="step__label">Description</p>
      <textarea
        className="input textarea"
        rows={5}
        placeholder="Please describe your car details..."
        defaultValue={defaultDesc || (filled ? LOREM_LONG : '')}
      />
    </>
  );
}

export function PriceRange({ filled }) {
  return (
    <>
      <p className="step__label">Price range</p>
      <p className="step__p2">Set your minimum and maximum daily price, and Automatic Pricing will adapt your price within that range. Prices are before any applicable discounts.</p>
      <div className="grid-2">
        <Field label="Maximum price" className="field--normal" hint="Recommended: $30">
          <Input placeholder="$" defaultValue={filled ? '$30' : ''} />
        </Field>
        <Field label="Minimum price" className="field--normal" hint="Recommended: $80">
          <Input placeholder="$" defaultValue={filled ? '$80' : ''} />
        </Field>
      </div>
    </>
  );
}
