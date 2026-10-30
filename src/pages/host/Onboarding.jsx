import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiPlus, FiUser, FiHelpCircle, FiArrowLeft, FiArrowRight, FiChevronDown, FiArrowUp, FiRotateCw, FiDownload, FiCheck, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import { MdLocationOn } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import Layout from '../../components/Layout';
import { Field, Input, Select, Checkbox, Radio, Toggle, Modal } from '../../ui';
import { PaymentFields, AgreeBox, SuccessModal } from '../user/Booking';
import { TermsList } from '../InfoPages';
import { img, LOREM_SHORT, LOREM_LONG } from '../../data';
import { navigate, useRoute, Link } from '../../router';
import { apiRequest } from '../../lib/api';

/* Order + labels exactly as in the Figma onboarding frames (S24 → S39) */
export const STEPS = [
  { key: 'location', n: 1, next: 'VIN' },
  { key: 'vin', n: 1, next: 'Car details' },
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

// Wizard persistence key so steps seamlessly share state and never reset on route change
const WIZARD_STORAGE_KEY = 'turn_and_burn_onboarding_draft';

export function getStoredDraft() {
  try {
    const raw = sessionStorage.getItem(WIZARD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredDraft(data) {
  try {
    sessionStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function clearStoredDraft() {
  try {
    sessionStorage.removeItem(WIZARD_STORAGE_KEY);
  } catch {}
}

/* Address autocomplete with dynamic open Nominatim search */
export function AddressInput({ value, setValue, label = 'Where is your car located?' }) {
  const [focus, setFocus] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);

  // Debounced dynamic search against OpenStreetMap Nominatim
  useEffect(() => {
    const query = (value || '').trim();
    if (query.length < 3) {
      setDynamicSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=us,ca&limit=5`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const list = data.map((item) => item.display_name);
            setDynamicSuggestions(list);
          }
        }
      } catch (err) {
        console.warn('Geocode lookup warning:', err.message);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  const showList = focus && (dynamicSuggestions.length > 0 || (value.length > 0 && !dynamicSuggestions.includes(value)));

  return (
    <Field label={label} className="addr">
      <Input
        placeholder="Type any address, city, or landmark (e.g. Central Park West, NY)..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 250)}
      />
      {showList && (
        <div className="addr__list">
          {dynamicSuggestions.map((s) => (
            <button type="button" key={s} onMouseDown={() => { setValue(s); setFocus(false); }}>
              <span>
                <MdLocationOn size={26} />
              </span>
              {s}
            </button>
          ))}
          {dynamicSuggestions.length === 0 && (
            <button type="button" onMouseDown={() => setFocus(false)}>
              <span>
                <MdLocationOn size={26} />
              </span>
              Use entered location: &quot;{value}&quot;
            </button>
          )}
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

export function CarSections({ values, onChange }) {
  const isObj = typeof values === 'object' && values !== null;
  const current = isObj ? values : {};
  const update = (patch) => {
    if (onChange) onChange({ ...current, ...patch });
  };

  return (
    <>
      <h2 className="step__h">Make and model</h2>
      <p className="step__p">Verify vehicle brand, model, and manufacturing year.</p>
      <Field label="Year">
        <Input
          placeholder="e.g., 2020"
          value={current.year || ''}
          onChange={(e) => update({ year: e.target.value })}
        />
      </Field>
      <Field label="Make">
        <Input
          placeholder="e.g., Honda"
          value={current.make || ''}
          onChange={(e) => update({ make: e.target.value })}
        />
      </Field>
      <Field label="Model">
        <Input
          placeholder="e.g., Accord"
          value={current.model || ''}
          onChange={(e) => update({ model: e.target.value })}
        />
      </Field>
      <h2 className="step__h">Trim and style</h2>
      <p className="step__p">Body style and vehicle trim.</p>
      <Field label="Trim">
        <Input
          placeholder="Enter vehicle trim (e.g. EX-L, Sport)"
          value={current.trim || ''}
          onChange={(e) => update({ trim: e.target.value })}
        />
      </Field>
      <Field label="Style">
        <Select
          value={current.style || 'Sedan'}
          onChange={(val) => update({ style: val })}
          options={['Sedan', 'SUV', 'Coupe', 'Convertible', 'Hatchback', 'Truck', 'Wagon', 'Compact', 'Crossover', 'Sport Car', 'MPV']}
        />
      </Field>
      <h2 className="step__h">Odometer and transmission</h2>
      <p className="step__p">Current mileage and gear setup.</p>
      <Field label="Odometer reading (miles)">
        <Input
          placeholder="e.g., 25000"
          value={current.odometer || ''}
          onChange={(e) => update({ odometer: e.target.value.replace(/[^0-9]/g, '') })}
        />
      </Field>
      <p className="step__label">Transmission</p>
      <div className="stack-sm">
        <Radio name="trans" checked={(current.transmission || 'Automatic') === 'Automatic'} onChange={() => update({ transmission: 'Automatic' })}>
          Automatic
        </Radio>
        <Radio name="trans" checked={current.transmission === 'Manual'} onChange={() => update({ transmission: 'Manual' })}>
          Manual
        </Radio>
      </div>
      <h2 className="step__h">Car History</h2>
      <p className="step__p">Safety title confirmation and tax compliance.</p>
      <Checkbox checked={current.cleanTitle !== false} onChange={(checked) => update({ cleanTitle: checked })}>
        My car has never had a branded or salvage title
      </Checkbox>
      <p className="step__q">I certify I paid applicable sales or related taxes on the purchase of this vehicle.</p>
      <div className="stack-sm">
        <Radio name="tax" checked={current.salesTaxCertified !== false} onChange={() => update({ salesTaxCertified: true })}>
          Yes
        </Radio>
        <Radio name="tax" checked={current.salesTaxCertified === false} onChange={() => update({ salesTaxCertified: false })}>
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

/* In-memory photo file storage so selected real files persist across hash-route transitions */
let globalPhotoFiles = [];
let globalAvatarFile = null;

/* Figma: "MacBook Pro 14 - 24 … 39" — List your car wizard */
export default function Onboarding() {
  const { params } = useRoute();
  const idx = Math.max(0, STEPS.findIndex((s) => s.key === params.step));
  const step = STEPS[idx];
  const go = (k) => navigate(`/host/list/${k}`);
  const nextKey = STEPS[idx + 1] ? STEPS[idx + 1].key : null;

  // Initial draft from storage
  const draft = getStoredDraft() || {};

  // Onboarding Wizard Form State
  const [address, setAddress] = useState(draft.address || '');
  const [vin, setVin] = useState(draft.vin || '');
  const [vinDecoding, setVinDecoding] = useState(false);
  const [vinSuccess, setVinSuccess] = useState(null);
  const [vinError, setVinError] = useState('');
  const [vinOld, setVinOld] = useState(draft.vinOld || false);

  const [carData, setCarData] = useState(draft.carData || {
    year: '',
    make: '',
    model: '',
    trim: '',
    style: 'Sedan',
    odometer: '',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    cleanTitle: true,
    salesTaxCertified: true,
  });

  const avatarInputRef = useRef(null);
  const carPhotoInputRef = useRef(null);

  const [avatar, setAvatar] = useState(draft.avatar || null);
  const [photos, setPhotos] = useState(draft.photos || []);
  const [phoneCountryCode, setPhoneCountryCode] = useState(draft.phoneCountryCode || '+1');
  const [phoneNumber, setPhoneNumber] = useState(draft.phoneNumber || '');
  const [smsOk, setSmsOk] = useState(draft.smsOk !== false);

  // Driver License State
  const [license, setLicense] = useState(draft.license || {
    issuingCountry: 'United States',
    state: 'New York',
    licenseNumber: '',
    firstName: '',
    middleName: '',
    lastName: '',
    expMonth: '12',
    expDay: '31',
    expYear: '2030',
    dobMonth: '07',
    dobDay: '07',
    dobYear: '1990',
  });

  const [goals, setGoals] = useState(draft.goals || { goal: 'Generate side income', use: 'Sometimes: a few days per week', share: 'Sometimes: about half the month' });
  const [avail, setAvail] = useState(draft.avail || { notice: '1 day (recommended)', min: '1 day (recommended)', max: '2 weeks (recommended)' });
  const [plate, setPlate] = useState(draft.plate || '');
  const [plateState, setPlateState] = useState(draft.plateState || 'New York');
  const [description, setDescription] = useState(draft.description || '');
  const [feat, setFeat] = useState(draft.feat || ['All-wheel drive', 'Bluetooth', 'Backup camera', 'Apple CarPlay']);
  const [auto, setAuto] = useState(draft.auto !== false);
  const [dailyRate, setDailyRate] = useState(draft.dailyRate || '');
  const [minPrice, setMinPrice] = useState(draft.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(draft.maxPrice || '');
  const [paid, setPaid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch logged in user profile to prefill phone and name if empty
  useEffect(() => {
    let active = true;
    apiRequest('/users/me')
      .then((res) => {
        if (!active || !res?.data) return;
        const u = res.data;
        if (!phoneNumber && u.phoneNumber) setPhoneNumber(u.phoneNumber);
        if (u.phoneCountryCode) setPhoneCountryCode(u.phoneCountryCode);
        if (!avatar && u.profilePhotoUrl) setAvatar(u.profilePhotoUrl);
        if (u.license) {
          setLicense((prev) => {
            let expM = prev.expMonth || '12', expD = prev.expDay || '31', expY = prev.expYear || '2030';
            let dobM = prev.dobMonth || '07', dobD = prev.dobDay || '07', dobY = prev.dobYear || '1990';
            if (u.license.expirationDate) {
              const ed = new Date(u.license.expirationDate);
              if (!isNaN(ed.getTime())) {
                expM = String(ed.getMonth() + 1).padStart(2, '0');
                expD = String(ed.getDate()).padStart(2, '0');
                expY = String(ed.getFullYear());
              }
            }
            if (u.dateOfBirth || u.license.dateOfBirth) {
              const bd = new Date(u.dateOfBirth || u.license.dateOfBirth);
              if (!isNaN(bd.getTime())) {
                dobM = String(bd.getMonth() + 1).padStart(2, '0');
                dobD = String(bd.getDate()).padStart(2, '0');
                dobY = String(bd.getFullYear());
              }
            }
            return {
              ...prev,
              firstName: prev.firstName || u.license.firstName || u.firstName || '',
              middleName: prev.middleName || u.license.middleName || u.middleName || '',
              lastName: prev.lastName || u.license.lastName || u.lastName || '',
              issuingCountry: prev.issuingCountry || u.license.issuingCountry || 'United States',
              state: prev.state || u.license.state || 'New York',
              licenseNumber: prev.licenseNumber || u.license.licenseNumber || '',
              expMonth: expM,
              expDay: expD,
              expYear: expY,
              dobMonth: dobM,
              dobDay: dobD,
              dobYear: dobY,
            };
          });
        }
        if (u.hostProfile) {
          // Map backend goal enum back to labels if not already drafted
          const goalReverse = {
            cover_car_payment: 'Cover your car payment',
            side_income: 'Generate side income',
            expand_business: 'Expand an existing business',
            primary_income: 'Build a primary source of income',
            not_sure: 'Not sure yet',
          };
          const useReverse = {
            never: 'Never',
            rarely_weekly: 'Rarely: once a week or less',
            rarely_monthly: 'Rarely: once a week or less',
            sometimes_weekly: 'Sometimes: a few days per week',
            sometimes_half: 'Sometimes: a few days per week',
            often_weekly: 'Often: most days per week',
            often_month: 'Often: most days per week',
            always: 'Always: every day',
          };
          const shareReverse = {
            not_sure: 'Not sure yet or just curious',
            rarely_monthly: 'Rarely: a few times per month',
            sometimes_half: 'Sometimes: about half the month',
            often_month: 'Often: most of the month',
            always_max: 'Always: as often as possible',
          };
          setGoals((prev) => ({
            goal: prev.goal || goalReverse[u.hostProfile.financialGoal] || 'Generate side income',
            use: prev.use || useReverse[u.hostProfile.personalUsage] || 'Sometimes: a few days per week',
            share: prev.share || shareReverse[u.hostProfile.shareFrequency] || 'Sometimes: about half the month',
          }));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Persist form state to sessionStorage on every change
  useEffect(() => {
    saveStoredDraft({
      address,
      vin,
      vinOld,
      carData,
      avatar,
      photos,
      phoneCountryCode,
      phoneNumber,
      smsOk,
      license,
      goals,
      avail,
      plate,
      plateState,
      description,
      feat,
      auto,
      dailyRate,
      minPrice,
      maxPrice,
    });
  }, [address, vin, vinOld, carData, avatar, photos, phoneCountryCode, phoneNumber, smsOk, license, goals, avail, plate, plateState, description, feat, auto, dailyRate, minPrice, maxPrice]);

  // Handle native file selection for profile avatar
  const handleAvatarChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setAvatar(URL.createObjectURL(f));
      globalAvatarFile = f;
    }
  };

  // Handle native file selection for car photos (multiple allowed)
  const handleCarPhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const previews = files.map((f) => URL.createObjectURL(f));
      setPhotos((prev) => [...prev, ...previews]);
      globalPhotoFiles = [...globalPhotoFiles, ...files];
    }
    e.target.value = '';
  };

  // Remove photo from wizard state
  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    globalPhotoFiles = globalPhotoFiles.filter((_, i) => i !== index);
  };

  // Handle VIN Decode
  const handleDecodeVin = async (vinToDecode) => {
    const cleanVin = (vinToDecode || vin).trim().toUpperCase();
    if (!cleanVin || cleanVin.length !== 17) {
      setVinError('Please enter a valid 17-character VIN number.');
      return;
    }
    setVinDecoding(true);
    setVinError('');
    setVinSuccess(null);
    try {
      const res = await apiRequest(`/vehicles/vin/${cleanVin}/decode`);
      const d = res?.data;
      if (d) {
        const decodedSummary = `${d.year || ''} ${d.make || ''} ${d.model || ''} ${d.trim || ''}`.trim();
        setVinSuccess(`Decoded: ${decodedSummary}`);
        const updatedCar = {
          ...carData,
          year: d.year ? String(d.year) : carData.year,
          make: d.make || carData.make,
          model: d.model || carData.model,
          trim: d.trim || carData.trim,
          style: d.style || carData.style || 'Sedan',
          fuelType: d.fuelType || carData.fuelType || 'Gasoline',
          transmission: d.transmission || carData.transmission || 'Automatic',
        };
        setCarData(updatedCar);
        saveStoredDraft({ ...getStoredDraft(), vin: cleanVin, carData: updatedCar });
      }
    } catch (err) {
      setVinError(err.message || 'VIN lookup failed. You can proceed to enter vehicle details manually.');
    } finally {
      setVinDecoding(false);
    }
  };

  // Final submission of vehicle to backend
  const handleCreateVehicle = async () => {
    setSubmitting(true);
    setSubmitError('');

    // Parse location city and state
    let city = 'New York';
    let state = 'NY';
    const parts = (address || '').split(',').map((s) => s.trim());
    if (parts.length >= 2) {
      city = parts[parts.length - 2] || 'New York';
    }

    const payload = {
      make: carData.make || 'Vehicle',
      model: carData.model || 'Listing',
      year: Number(carData.year) || 2022,
      trim: carData.trim || '',
      style: carData.style || 'Sedan',
      category: 'regular',
      transmission: carData.transmission || 'Automatic',
      fuelType: carData.fuelType || 'Gasoline',
      vin: vin.trim() || '1HGCR2F83HA000001',
      licensePlate: plate || 'NYC1234',
      licensePlateState: plateState || 'NY',
      odometer: Number(carData.odometer) || 15000,
      seats: 5,
      cleanTitle: carData.cleanTitle !== false,
      salesTaxCertified: carData.salesTaxCertified !== false,
      description: description || 'Vehicle ready for hosting.',
      features: feat,
      location: {
        address: address || 'Current Location',
        city: city || 'New York',
        state: state || 'NY',
        country: 'USA',
      },
      pricing: {
        dailyRate: Number(dailyRate) || 120,
        minPrice: Number(minPrice) || 80,
        maxPrice: Number(maxPrice) || 250,
        automaticPricingEnabled: auto,
      },
      tripPreferences: {
        minTripDurationHours: avail.min?.includes('2') ? 48 : avail.min?.includes('3') ? 72 : 24,
        maxTripDurationHours: avail.max?.includes('1') ? 168 : avail.max?.includes('3') ? 504 : 336,
        advanceNoticeHours: avail.notice?.includes('2') ? 48 : avail.notice?.includes('3') ? 72 : 24,
        monthlyTripsEnabled: true,
      },
    };

    try {
      // 1. Create vehicle
      const res = await apiRequest('/vehicles', {
        method: 'POST',
        body: payload,
      });
      const newVehicle = res?.data;
      const newVehicleId = newVehicle?._id || newVehicle?.id;

      // 2. Upload vehicle photos
      if (newVehicleId && globalPhotoFiles.length > 0) {
        try {
          const formData = new FormData();
          globalPhotoFiles.forEach((f) => formData.append('photos', f));
          formData.append('angles', 'front');
          await apiRequest(`/vehicles/${newVehicleId}/photos`, {
            method: 'POST',
            body: formData,
          });
        } catch (uploadErr) {
          console.warn('Vehicle photo upload warning:', uploadErr.message);
        }
      }

      // 3. Upload avatar photo if selected
      if (globalAvatarFile) {
        try {
          const avData = new FormData();
          avData.append('photo', globalAvatarFile);
          await apiRequest('/users/me/photo', {
            method: 'POST',
            body: avData,
          });
        } catch (avErr) {
          console.warn('Avatar upload warning:', avErr.message);
        }
      }

      // 4. Update user phone & profile name
      if (phoneNumber.trim() || license.firstName) {
        try {
          if (phoneNumber.trim()) {
            await apiRequest('/users/me/phone', {
              method: 'PATCH',
              body: {
                phoneCountryCode: phoneCountryCode || '+1',
                phoneNumber: phoneNumber.trim(),
              },
            });
          }
          if (license.firstName && license.lastName) {
            await apiRequest('/users/me', {
              method: 'PATCH',
              body: {
                firstName: license.firstName,
                middleName: license.middleName || '',
                lastName: license.lastName,
              },
            });
          }
        } catch (uErr) {
          console.warn('User profile sync warning:', uErr.message);
        }
      }

      // 5. Submit Driver's License
      if (license.licenseNumber && license.firstName && license.lastName) {
        try {
          const expDate = `${license.expYear}-${String(license.expMonth).padStart(2, '0')}-${String(license.expDay).padStart(2, '0')}`;
          const dobDate = `${license.dobYear}-${String(license.dobMonth).padStart(2, '0')}-${String(license.dobDay).padStart(2, '0')}`;
          await apiRequest('/users/me/license', {
            method: 'POST',
            body: {
              issuingCountry: license.issuingCountry || 'United States',
              state: license.state || 'New York',
              licenseNumber: license.licenseNumber,
              firstName: license.firstName,
              middleName: license.middleName || '',
              lastName: license.lastName,
              expirationDate: expDate,
              dateOfBirth: dobDate,
            },
          });
        } catch (licErr) {
          console.warn('License submission warning:', licErr.message);
        }
      }

      // 6. Sync Host Goals & Profile
      try {
        const goalEnumMap = {
          'Cover your car payment': 'cover_car_payment',
          'Generate side income': 'side_income',
          'Expand an existing business': 'expand_business',
          'Build a primary source of income': 'primary_income',
          'Not sure yet': 'not_sure',
        };
        const useEnumMap = {
          'Never': 'never',
          'Rarely: once a week or less': 'rarely_weekly',
          'Sometimes: a few days per week': 'sometimes_weekly',
          'Often: most days per week': 'often_weekly',
          'Always: every day': 'always',
        };
        const shareEnumMap = {
          'Not sure yet or just curious': 'not_sure',
          'Rarely: a few times per month': 'rarely_monthly',
          'Sometimes: about half the month': 'sometimes_half',
          'Often: most of the month': 'often_month',
          'Always: as often as possible': 'always_max',
        };
        await apiRequest('/users/me/host-profile', {
          method: 'PATCH',
          body: {
            financialGoal: goalEnumMap[goals.goal] || 'side_income',
            personalUsage: useEnumMap[goals.use] || 'sometimes_weekly',
            shareFrequency: shareEnumMap[goals.share] || 'sometimes_half',
            acceptTerms: true,
            acceptAcknowledgment: true,
          },
        });
      } catch (hostProfileErr) {
        console.warn('Host profile goals sync warning:', hostProfileErr.message);
      }

      // Clear draft session and navigate to host fleet dashboard
      clearStoredDraft();
      globalPhotoFiles = [];
      globalAvatarFile = null;
      navigate('/host/vehicles');
    } catch (err) {
      setSubmitError(err.message || 'Failed to list vehicle. Please check required fields.');
      setSubmitting(false);
    }
  };

  const Next = ({ disabled, onClick }) => (
    <button type="button" className="btn btn-primary btn-upper btn-next" disabled={disabled || submitting} onClick={onClick || (() => go(nextKey))}>
      {submitting ? 'CREATING...' : 'NEXT'}
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
          <Next disabled={!address.trim()} />
        </>
      );
      break;
    case 'vin':
      body = (
        <>
          <h1 className="step__title">VIN</h1>
          <p className="step__p">We’ll use your Vehicle Identification Number (VIN) to identify your specific car</p>
          <Field label="Enter your VIN" hint="17 alphanumeric characters">
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                placeholder="e.g. 1HGCR2F83HA000001"
                maxLength={17}
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '0 20px', minWidth: 120, height: 48, fontSize: 14 }}
                disabled={vin.trim().length !== 17 || vinDecoding}
                onClick={() => handleDecodeVin(vin)}
              >
                {vinDecoding ? 'DECODING...' : 'LOOKUP'}
              </button>
            </div>
          </Field>
          {vinSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 8, marginTop: 8 }}>
              <FiCheck size={18} />
              <span>{vinSuccess}</span>
            </div>
          )}
          {vinError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: 8, marginTop: 8 }}>
              <FiAlertCircle size={18} />
              <span>{vinError}</span>
            </div>
          )}
          <Checkbox checked={vinOld} onChange={setVinOld} className="mt-4">
            My vehicle is older than 1981 (Manual entry)
          </Checkbox>
          <Next onClick={() => go('car')} disabled={!vin.trim() && !vinOld} />
        </>
      );
      break;
    case 'car':
      body = (
        <>
          <CarSections values={carData} onChange={setCarData} />
          <Next onClick={() => go('photo')} />
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
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <button type="button" className="btn btn-outline" onClick={() => avatarInputRef.current?.click()}>
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
                {phoneCountryCode}
              </div>
            </Field>
            <Field label="Phone number">
              <Input
                value={phoneNumber}
                placeholder="e.g. 555 1722-123"
                onChange={(e) => setPhoneNumber(e.target.value)}
                readOnly={step.key === 'verify'}
              />
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
              <Field label="Enter your OTP" hint="Demo test OTP: 123456">
                <Input placeholder="Enter" maxLength={6} defaultValue="123456" />
              </Field>
              <button type="button" className="link-btn link-btn--muted">
                Re-send OTP
              </button>
            </>
          )}
          <Next disabled={!phoneNumber.trim()} />
        </>
      );
      break;
    case 'license':
      body = (
        <>
          <h1 className="step__title">Driver’s license</h1>
          <p className="step__p">Confirm your valid driver license credentials to list vehicles.</p>
          <LicenseFields value={license} onChange={setLicense} />
          <Next disabled={!license.licenseNumber || !license.firstName || !license.lastName} />
        </>
      );
      break;
    case 'goals':
      body = (
        <>
          <h1 className="step__title">Your goals</h1>
          <p className="step__p">Tell us your hosting expectations and availability intentions.</p>
          <GoalFields value={goals} onChange={setGoals} />
          <Next />
        </>
      );
      break;
    case 'availability':
      body = (
        <>
          <h1 className="step__title">Car availability</h1>
          <p className="step__p">Configure your advance notice and preferred trip durations.</p>
          <AvailabilityFields value={avail} onChange={setAvail} />
          <Next />
        </>
      );
      break;
    case 'details':
      body = (
        <>
          <h1 className="step__title">Car details</h1>
          <p className="step__p">Specify license plate, amenities, and write an inviting vehicle overview.</p>
          <DetailsFields
            filled
            features={feat}
            setFeatures={setFeat}
            defaultPlate={plate}
            defaultState={plateState}
            defaultDesc={description}
            onPlateChange={setPlate}
            onStateChange={setPlateState}
            onDescChange={setDescription}
          />
          <Next />
        </>
      );
      break;
    case 'photos':
      body = (
        <>
          <input
            ref={carPhotoInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleCarPhotosChange}
          />
          <h1 className="step__title">Car photos</h1>
          <p className="step__p">High-resolution photos increase booking conversion by over 40%.</p>
          <p className="step__label">Car photo tips</p>
          <div className="tips">
            {['Front', '3/4 Front-side', 'Left Side', 'Right Side', 'Back'].map((t, i) => (
              <figure key={t}>
                <img src={img(`up-${i + 1}.jpg`)} alt={t} />
                <figcaption>{t}</figcaption>
              </figure>
            ))}
          </div>
          <p className="step__label">Upload your car photos ({photos.length} selected)</p>
          <div className="tips">
            {photos.map((p, i) => (
              <figure key={i} style={{ position: 'relative' }}>
                <img src={p} alt="" />
                <button
                  type="button"
                  aria-label="Remove photo"
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    background: 'rgba(0,0,0,0.65)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 26,
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleRemovePhoto(i)}
                >
                  <FiTrash2 size={13} />
                </button>
              </figure>
            ))}
            <UploadTile onClick={() => carPhotoInputRef.current?.click()} />
          </div>
          <Next />
        </>
      );
      break;
    case 'pricing':
      body = (
        <>
          <h1 className="step__title">Pricing &amp; discounts</h1>
          <p className="step__p">Set your daily rate and let Smart Pricing adjust for peak travel periods.</p>
          <p className="step__label">Automatic Pricing</p>
          <p className="step__p2">Boost earning by letting your price automatically adjust to match demand.</p>
          <Toggle on={auto} onChange={setAuto} />
          <PriceRange
            min={minPrice}
            max={maxPrice}
            onMinChange={setMinPrice}
            onMaxChange={setMaxPrice}
          />
          <Field label="Daily Base Rate ($)" className="mt-4">
            <Input
              type="number"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              placeholder="e.g. 129"
            />
          </Field>
          <h2 className="step__h">Payout</h2>
          <p className="step__p">Configure your direct deposit account for timely earnings payout.</p>
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
          <p className="step__p">Please review and accept our host vehicle listing terms.</p>
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
          <p className="step__p">Ready to list your vehicle? Click below to create your listing on the fleet marketplace.</p>
          <div className="ack">
            <p><strong>Vehicle Summary:</strong> {carData.year || ''} {carData.make || ''} {carData.model || ''} {carData.trim ? `(${carData.trim})` : ''}</p>
            <p><strong>Driver:</strong> {license.firstName} {license.lastName} (License #{license.licenseNumber})</p>
            <p><strong>Contact Phone:</strong> {phoneCountryCode} {phoneNumber}</p>
            <p><strong>Location:</strong> {address || 'Not specified'}</p>
            <p><strong>Base Rate:</strong> ${dailyRate || 120}/day | Automatic Pricing: {auto ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Photos:</strong> {photos.length} photo(s) selected</p>
          </div>
          {submitError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: 8, margin: '16px 0' }}>
              <FiAlertCircle size={20} />
              <span>{submitError}</span>
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary btn-upper btn-hero"
            disabled={submitting}
            onClick={handleCreateVehicle}
          >
            {submitting ? 'PUBLISHING LISTING...' : 'PUBLISH & GET STARTED'}
          </button>
        </>
      );
  }

  return (
    <Layout role="host">
      <ProgressHeader step={step} />
      <section className={`step ${step.key === 'acknowledgment' || step.key === 'terms' ? 'step--wide' : ''}`}>{body}</section>
      {paid && <SuccessModal text="You Successfully Completed The Payment." onClose={() => setPaid(false)} onDone={() => go('terms')} />}
    </Layout>
  );
}

/* ---------- field groups reused by the vehicle-edit screens ---------- */

export function LicenseFields({ value = {}, onChange, filled }) {
  const current = value || {};
  const update = (patch) => {
    if (onChange) onChange({ ...current, ...patch });
  };

  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const years = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => String(from + i));

  return (
    <>
      <div className="grid-license">
        <Field label="Issuing country">
          <Select
            value={current.issuingCountry || 'United States'}
            onChange={(val) => update({ issuingCountry: val })}
            options={['United States', 'Canada', 'Mexico']}
          />
        </Field>
        <Field label="State">
          <Select
            value={current.state || 'New York'}
            onChange={(val) => update({ state: val })}
            options={['New York', 'California', 'Texas', 'Florida', 'North Carolina']}
          />
        </Field>
        <Field label="Driver’s license number">
          <Input
            placeholder="Enter license number..."
            value={current.licenseNumber || ''}
            onChange={(e) => update({ licenseNumber: e.target.value.toUpperCase() })}
          />
        </Field>
      </div>
      <p className="step__p2">Enter your name exactly as it appears on your driver’s license</p>
      <div className="grid-3">
        <Field label="First name">
          <Input
            placeholder="First name"
            value={current.firstName || ''}
            onChange={(e) => update({ firstName: e.target.value })}
          />
        </Field>
        <Field label="Middle name">
          <Input
            placeholder="Middle name (optional)"
            value={current.middleName || ''}
            onChange={(e) => update({ middleName: e.target.value })}
          />
        </Field>
        <Field label="Last name">
          <Input
            placeholder="Last name"
            value={current.lastName || ''}
            onChange={(e) => update({ lastName: e.target.value })}
          />
        </Field>
      </div>
      <p className="step__label">Expiration date</p>
      <div className="grid-3">
        <Select
          placeholder="Month"
          value={current.expMonth || '12'}
          onChange={(val) => update({ expMonth: val })}
          options={months}
        />
        <Select
          placeholder="Day"
          value={current.expDay || '31'}
          onChange={(val) => update({ expDay: val })}
          options={days}
        />
        <Select
          placeholder="Year"
          value={current.expYear || '2030'}
          onChange={(val) => update({ expYear: val })}
          options={years(2026, 2040)}
        />
      </div>
      <p className="step__label">Date of birth</p>
      <div className="grid-3">
        <Select
          placeholder="Month"
          value={current.dobMonth || '07'}
          onChange={(val) => update({ dobMonth: val })}
          options={months}
        />
        <Select
          placeholder="Day"
          value={current.dobDay || '07'}
          onChange={(val) => update({ dobDay: val })}
          options={days}
        />
        <Select
          placeholder="Year"
          value={current.dobYear || '1990'}
          onChange={(val) => update({ dobYear: val })}
          options={years(1940, 2008)}
        />
      </div>
      <p className="step__p2">Your information is securely encrypted and validated.</p>
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
      <p className="step__p2">We use this information to recommend optimal availability and pricing strategies.</p>
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

export function DetailsFields({ features, setFeatures, filled, defaultPlate, defaultState, defaultDesc, onPlateChange, onStateChange, onDescChange }) {
  const toggle = (f) => setFeatures(features.includes(f) ? features.filter((x) => x !== f) : [...features, f]);
  const stateVal = defaultState || 'New York';
  const stateOptions = ['New York', 'California', 'Texas', 'Florida', 'North Carolina'];
  return (
    <>
      <p className="step__label">About car</p>
      <div className="grid-2">
        <Field label="License plate number" className="field--normal">
          <Input
            placeholder="e.g. TX58U1332"
            value={defaultPlate || ''}
            onChange={(e) => onPlateChange && onPlateChange(e.target.value.toUpperCase())}
          />
        </Field>
        <Field label="State" className="field--normal">
          <Select
            placeholder={stateVal ? undefined : 'State / Province'}
            value={stateVal}
            onChange={(val) => onStateChange && onStateChange(val)}
            options={stateOptions.includes(stateVal) ? stateOptions : [...stateOptions, stateVal]}
          />
        </Field>
      </div>
      <p className="step__label">Car features</p>
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
        value={defaultDesc || ''}
        onChange={(e) => onDescChange && onDescChange(e.target.value)}
      />
    </>
  );
}

export function PriceRange({ min, max, onMinChange, onMaxChange, filled }) {
  return (
    <>
      <p className="step__label">Price range</p>
      <p className="step__p2">Set your minimum and maximum daily price, and Automatic Pricing will adapt your price within that range. Prices are before any applicable discounts.</p>
      <div className="grid-2">
        <Field label="Maximum price ($)" className="field--normal" hint="Recommended: $220">
          <Input
            type="number"
            placeholder="e.g. 220"
            value={max !== undefined ? max : ''}
            onChange={(e) => onMaxChange && onMaxChange(e.target.value)}
          />
        </Field>
        <Field label="Minimum price ($)" className="field--normal" hint="Recommended: $80">
          <Input
            type="number"
            placeholder="e.g. 80"
            value={min !== undefined ? min : ''}
            onChange={(e) => onMinChange && onMinChange(e.target.value)}
          />
        </Field>
      </div>
    </>
  );
}
