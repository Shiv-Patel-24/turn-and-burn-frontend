import { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiTrash2, FiCamera, FiInfo, FiCheck, FiAlertTriangle, FiUpload } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { IoCarOutline, IoClose } from 'react-icons/io5';
import { MdOutlineLocationOn } from 'react-icons/md';
import Layout from '../../components/Layout';
import { Field, Input, Checkbox, Toggle, Modal, Select } from '../../ui';
import { CarSections, LicenseFields, GoalFields, AvailabilityFields, DetailsFields, PriceRange, UploadTile, AddressInput } from './Onboarding';
import { img, LOREM_SHORT, LOREM_LONG } from '../../data';
import { navigate, useRoute, Link } from '../../router';
import { apiRequest } from '../../lib/api';

const NAV = [
  ['location', 'Location'],
  ['vin', 'Car details'],
  ['profile', 'Profile'],
  ['license', 'Driver’s license'],
  ['goals', 'Your goals'],
  ['availability', 'Car availability'],
  ['details', 'Car details'],
  ['photos', 'Car photos'],
  ['pricing', 'Pricing & discounts'],
];

/* Figma: "Frame 2147240014" — Add Custom Location */
function CustomLocationModal({ onClose, onSave, currentRadius = 25 }) {
  const [v, setV] = useState('');
  const [radius, setRadius] = useState(currentRadius);

  const handleApply = () => {
    if (onSave) {
      onSave({ customAddress: v, radius: Number(radius) || 25 });
    }
    onClose();
  };

  return (
    <Modal onClose={onClose} width={1127} className="custom-loc">
      <div className="modal__head">
        <h2 className="modal__title modal__title--md">Add Custom Location</h2>
        <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
          <IoClose size={30} />
        </button>
      </div>
      <AddressInput value={v} setValue={setV} label="Custom delivery dropoff location or airport" />
      <Field label="Delivery Radius (Miles)" className="mt-4">
        <Input
          type="number"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          placeholder="e.g. 25"
        />
      </Field>
      <button type="button" className="btn btn-primary btn-save" disabled={!v} onClick={handleApply}>
        Save Location
      </button>
    </Modal>
  );
}

function SaveBtn({ onSave, loading }) {
  const [s, setS] = useState(false);
  const [err, setErr] = useState('');
  const handleClick = async () => {
    setErr('');
    if (onSave) {
      try {
        await onSave();
        setS(true);
        setTimeout(() => setS(false), 2500);
      } catch (e) {
        setErr(e.message || 'Save failed');
        setTimeout(() => setErr(''), 4000);
      }
    }
  };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <button type="button" className="btn btn-primary btn-upper btn-next" disabled={loading} onClick={handleClick}>
        {s ? 'SAVED ✓' : loading ? 'SAVING...' : 'SAVE'}
      </button>
      {err && <span style={{ color: '#dc2626', fontSize: 13 }}>{err}</span>}
    </div>
  );
}

function DiscountCard({ title, rows, note, action = 'Edit' }) {
  return (
    <div className="discount">
      {note && (
        <p className="discount__note">
          <FiInfo /> {note}
        </p>
      )}
      <h4>{title}</h4>
      {rows.map(([k, sub, v]) => (
        <div className="discount__row" key={k}>
          <div>
            <b>{k}</b>
            {sub && <small>{sub}</small>}
          </div>
          <b>{v}</b>
        </div>
      ))}
      <button type="button" className="btn-mini">
        {action}
      </button>
    </div>
  );
}

/* Figma: "MacBook Pro 14 - 66 … 74" — Vehicle settings */
export default function VehicleEdit() {
  const { params } = useRoute();
  const section = params.section || 'location';

  const [vehicleData, setVehicleData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loadingVeh, setLoadingVeh] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customLoc, setCustomLoc] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // Form states per section
  const [vin, setVin] = useState('');
  const [carDetails, setCarDetails] = useState({});
  const [features, setFeatures] = useState([]);
  const [description, setDescription] = useState('');
  const [plate, setPlate] = useState('');
  const [plateState, setPlateState] = useState('');
  const [auto, setAuto] = useState(true);
  const [dailyRate, setDailyRate] = useState(129);
  const [minPrice, setMinPrice] = useState(99);
  const [maxPrice, setMaxPrice] = useState(220);
  const [advanceNotice, setAdvanceNotice] = useState('1 day (recommended)');
  const [minTripDuration, setMinTripDuration] = useState('1 day (recommended)');
  const [maxTripDuration, setMaxTripDuration] = useState('2 weeks (recommended)');
  const [goals, setGoals] = useState({
    goal: 'Generate side income',
    use: 'Sometimes: a few days per week',
    share: 'Sometimes: about half the month',
  });
  const [deliveryRadius, setDeliveryRadius] = useState(25);
  const [homeAddress, setHomeAddress] = useState('');

  // Host profile name & contact phone state
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneSaved, setPhoneSaved] = useState(false);

  // Driver license state
  const [license, setLicense] = useState({
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

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const reloadVehicle = async () => {
    if (!params.id) return;
    try {
      // 1. Fetch vehicle using authenticated host endpoint /mine/:id first
      let v = null;
      try {
        const mineRes = await apiRequest(`/vehicles/mine/${params.id}`);
        v = mineRes?.data;
      } catch {
        // Fallback to fleet listing
        try {
          const fleetRes = await apiRequest('/vehicles');
          const list = fleetRes?.data || [];
          v = list.find((x) => (x._id || x.id) === params.id);
        } catch {
          // Last resort public endpoint
          const pubRes = await apiRequest(`/vehicles/${params.id}`);
          v = pubRes?.data;
        }
      }

      // 2. Fetch authenticated user profile for real name, phone, avatar, and driver's license
      try {
        const userRes = await apiRequest('/users/me');
        const u = userRes?.data;
        if (u) {
          setUserData(u);
          setFirstName(u.firstName || '');
          setMiddleName(u.middleName || '');
          setLastName(u.lastName || '');
          if (u.phoneNumber) setPhoneNumber(u.phoneNumber);
          if (u.phoneCountryCode) setPhoneCountryCode(u.phoneCountryCode);
          if (u.profilePhotoUrl) setAvatar(u.profilePhotoUrl);

          if (u.license) {
            let expM = '12', expD = '31', expY = '2030';
            let dobM = '07', dobD = '07', dobY = '1990';
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
            setLicense({
              issuingCountry: u.license.issuingCountry || 'United States',
              state: u.license.state || 'New York',
              licenseNumber: u.license.licenseNumber || '',
              firstName: u.license.firstName || u.firstName || '',
              middleName: u.license.middleName || u.middleName || '',
              lastName: u.license.lastName || u.lastName || '',
              expMonth: expM,
              expDay: expD,
              expYear: expY,
              dobMonth: dobM,
              dobDay: dobD,
              dobYear: dobY,
            });
          }

          if (u.hostProfile) {
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
            setGoals({
              goal: goalReverse[u.hostProfile.financialGoal] || 'Generate side income',
              use: useReverse[u.hostProfile.personalUsage] || 'Sometimes: a few days per week',
              share: shareReverse[u.hostProfile.shareFrequency] || 'Sometimes: about half the month',
            });
          }
        }
      } catch (userErr) {
        console.warn('Could not fetch host profile info:', userErr.message);
      }

      if (v) {
        setVehicleData(v);
        setVin(v.vin || '');
        setCarDetails({
          year: v.year ? String(v.year) : '',
          make: v.make || '',
          model: v.model || '',
          trim: v.trim || '',
          style: v.style || 'Sedan',
          odometer: v.odometer ? String(v.odometer) : '',
          transmission: v.transmission || 'Automatic',
          cleanTitle: v.cleanTitle !== false,
          salesTaxCertified: v.salesTaxCertified !== false,
        });
        if (Array.isArray(v.photos)) {
          setPhotos(v.photos);
        }
        if (Array.isArray(v.features)) {
          setFeatures(v.features);
        }
        setDescription(v.description || '');
        setPlate(v.licensePlate || '');
        setPlateState(v.licensePlateState || v.location?.state || 'NY');
        if (v.pricing?.dailyRate) setDailyRate(v.pricing.dailyRate);
        if (v.pricing?.minPrice) setMinPrice(v.pricing.minPrice);
        if (v.pricing?.maxPrice) setMaxPrice(v.pricing.maxPrice);
        if (v.pricing?.automaticPricingEnabled !== undefined) setAuto(v.pricing.automaticPricingEnabled);
        if (v.tripPreferences?.advanceNoticeHours) {
          const days = Math.round(v.tripPreferences.advanceNoticeHours / 24);
          setAdvanceNotice(days === 1 ? '1 day (recommended)' : `${days} day`);
        }
        if (v.tripPreferences?.minTripDurationHours) {
          const days = Math.round(v.tripPreferences.minTripDurationHours / 24);
          setMinTripDuration(days === 1 ? '1 day (recommended)' : `${days} day`);
        }
        if (v.tripPreferences?.maxTripDurationHours) {
          const weeks = Math.round(v.tripPreferences.maxTripDurationHours / (24 * 7));
          setMaxTripDuration(weeks === 2 ? '2 weeks (recommended)' : `${weeks} week${weeks > 1 ? 's' : ''}`);
        }
        if (v.goals) {
          setGoals((prev) => ({
            ...prev,
            ...v.goals,
          }));
        }
        if (v.deliveryRadiusMiles) setDeliveryRadius(v.deliveryRadiusMiles);
        if (v.location?.address) {
          setHomeAddress(`${v.location.address}, ${v.location.city || ''} ${v.location.state || ''}`.trim());
        }
      }
    } catch (err) {
      console.warn('Could not fetch vehicle from server:', err.message);
    } finally {
      setLoadingVeh(false);
    }
  };

  useEffect(() => {
    reloadVehicle();
  }, [params.id]);

  const vehicleId = vehicleData?._id || vehicleData?.id || params.id;
  const vehicleName = vehicleData
    ? `${vehicleData.year || ''} ${vehicleData.make || ''} ${vehicleData.model || ''}`.trim()
    : 'Vehicle Details';
  const vehiclePlate = plate || vehicleData?.licensePlate || 'POR1234';
  const vehicleState = plateState || vehicleData?.licensePlateState || vehicleData?.location?.state || 'NY';
  const vehicleImage = (photos.find((p) => p.isPrimary)?.url) || photos[0]?.url || vehicleData?.photos?.[0]?.url || '';
  const vehicleAddress = homeAddress || (vehicleData?.location?.address
    ? `${vehicleData.location.address}, ${vehicleData.location.city || ''} ${vehicleData.location.state || ''}`.trim()
    : '70 Washington Square South, New York, NY 10012, United States');

  const to = (s) => `/host/vehicles/${vehicleId}/${s}`;

  // Comprehensive save handler covering all sections
  const handleSave = async (extraFields = {}) => {
    setSaving(true);
    try {
      const patch = {
        features,
        description,
        licensePlate: plate,
        licensePlateState: plateState,
        goals,
        tripPreferences: {
          advanceNoticeHours: advanceNotice.includes('2') ? 48 : advanceNotice.includes('3') ? 72 : 24,
          minTripDurationHours: minTripDuration.includes('2') ? 48 : minTripDuration.includes('3') ? 72 : 24,
          maxTripDurationHours: maxTripDuration.includes('1') ? 168 : maxTripDuration.includes('3') ? 504 : 336,
          monthlyTripsEnabled: true,
        },
        pricing: {
          dailyRate: Number(dailyRate) || 129,
          minPrice: Number(minPrice) || 99,
          maxPrice: Number(maxPrice) || 220,
          automaticPricingEnabled: auto,
        },
        deliveryRadiusMiles: Number(deliveryRadius) || 25,
        ...extraFields,
      };

      if (carDetails.make) patch.make = carDetails.make;
      if (carDetails.model) patch.model = carDetails.model;
      if (carDetails.year) patch.year = Number(carDetails.year);
      if (carDetails.trim !== undefined) patch.trim = carDetails.trim;
      if (carDetails.style) patch.style = carDetails.style;
      if (carDetails.transmission) patch.transmission = carDetails.transmission;
      if (carDetails.odometer) patch.odometer = Number(carDetails.odometer);
      if (carDetails.cleanTitle !== undefined) patch.cleanTitle = carDetails.cleanTitle;
      if (carDetails.salesTaxCertified !== undefined) patch.salesTaxCertified = carDetails.salesTaxCertified;

      await apiRequest(`/vehicles/${vehicleId}`, {
        method: 'PATCH',
        body: patch,
      });

      // If on profile section, update user name & phone number
      if (section === 'profile') {
        if (phoneNumber.trim()) {
          try {
            await apiRequest('/users/me/phone', {
              method: 'PATCH',
              body: {
                phoneCountryCode: phoneCountryCode || '+1',
                phoneNumber: phoneNumber.trim(),
              },
            });
            setPhoneSaved(true);
            setTimeout(() => setPhoneSaved(false), 3000);
          } catch (phoneErr) {
            console.warn('Phone update warning:', phoneErr.message);
          }
        }
        if (firstName.trim() || lastName.trim()) {
          try {
            await apiRequest('/users/me', {
              method: 'PATCH',
              body: {
                firstName: firstName.trim(),
                middleName: middleName.trim(),
                lastName: lastName.trim(),
              },
            });
          } catch (uErr) {
            console.warn('User profile name sync warning:', uErr.message);
          }
        }
      }

      // If on driver's license section, update license details on user profile
      if (section === 'license' && license.licenseNumber && license.firstName && license.lastName) {
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

      // If on goals section, sync with host profile
      if (section === 'goals') {
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
            },
          });
        } catch (goalErr) {
          console.warn('Goals profile update warning:', goalErr.message);
        }
      }

      await reloadVehicle();
    } catch (e) {
      console.warn('Vehicle update failed:', e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  // Upload photo handler (single or multiple)
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('photos', f));
      formData.append('angles', 'front');
      await apiRequest(`/vehicles/${vehicleId}/photos`, {
        method: 'POST',
        body: formData,
      });
      await reloadVehicle();
    } catch (err) {
      console.warn('Photo upload failed:', err.message);
      alert(err.message || 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Delete photo handler
  const handleDeletePhoto = async (photoId) => {
    if (!photoId) return;
    try {
      await apiRequest(`/vehicles/${vehicleId}/photos/${photoId}`, {
        method: 'DELETE',
      });
      await reloadVehicle();
    } catch (err) {
      console.warn('Photo deletion failed:', err.message);
    }
  };

  // Make primary photo handler
  const handleSetPrimaryPhoto = async (photoId) => {
    if (!photoId) return;
    try {
      await apiRequest(`/vehicles/${vehicleId}/photos/${photoId}/primary`, {
        method: 'PATCH',
      });
      await reloadVehicle();
    } catch (err) {
      console.warn('Set primary photo failed:', err.message);
    }
  };

  // Delete vehicle handler
  const handleDeleteVehicle = async () => {
    setDeleting(true);
    try {
      await apiRequest(`/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });
      navigate('/host/vehicles');
    } catch (err) {
      console.warn('Delete vehicle failed:', err.message);
      alert(err.message || 'Failed to delete vehicle');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  let body;
  switch (section) {
    case 'location':
      body = (
        <div className="veh-loc">
          <img className="veh-loc__map" src={img('host-map.jpg')} alt="Map" />
          <div className="veh-loc__cards">
            <h6>HOME LOCATION</h6>
            <div className="loc-card">
              <IoCarOutline size={24} />
              <div>
                <h4>{vehicleAddress}</h4>
                <p>{vehicleData?.description || 'Registered host parking and pickup address.'}</p>
              </div>
            </div>
            <h6>CUSTOM LOCATION &amp; DELIVERY</h6>
            <button type="button" className="loc-card" onClick={() => setCustomLoc(true)}>
              <MdOutlineLocationOn size={26} />
              <div>
                <h4>Offer delivery to location of your guest’s choice, within a specific radius.</h4>
                <p>Delivery radius: {deliveryRadius} miles.</p>
              </div>
            </button>
          </div>
        </div>
      );
      break;
    case 'vin':
      body = (
        <div className="veh-form">
          <h2 className="step__h step__h--first">VIN</h2>
          <p className="step__p">Vehicle Identification Number (VIN) registered for this car.</p>
          <Field label="VIN Number">
            <Input value={vin} placeholder="e.g. 1HGCR2F83HA000001" onChange={(e) => setVin(e.target.value.toUpperCase())} />
          </Field>
          <CarSections values={carDetails} onChange={setCarDetails} />
          <SaveBtn onSave={handleSave} loading={saving} />
        </div>
      );
      break;
    case 'profile':
      body = (
        <div className="veh-form">
          <h2 className="step__title">Host profile</h2>
          <p className="step__p">Profile photo and host contact information.</p>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                setAvatar(URL.createObjectURL(f));
                try {
                  const fd = new FormData();
                  fd.append('photo', f);
                  await apiRequest('/users/me/photo', { method: 'POST', body: fd });
                } catch (err) {
                  console.warn('Avatar upload deferred:', err.message);
                }
              }
            }}
          />
          <button type="button" className="photo-change" onClick={() => avatarInputRef.current?.click()}>
            <span>
              {avatar ? <img src={avatar} alt="" /> : <FiUser size={40} />}
              <FiCamera size={40} />
            </span>
            Change photo
          </button>

          <h2 className="step__title" style={{ marginTop: 24 }}>Host Name</h2>
          <div className="grid-3">
            <Field label="First name">
              <Input
                value={firstName}
                placeholder="First name"
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Field>
            <Field label="Middle name">
              <Input
                value={middleName}
                placeholder="Middle name"
                onChange={(e) => setMiddleName(e.target.value)}
              />
            </Field>
            <Field label="Last name">
              <Input
                value={lastName}
                placeholder="Last name"
                onChange={(e) => setLastName(e.target.value)}
              />
            </Field>
          </div>

          <h2 className="step__title" style={{ marginTop: 24 }}>Mobile number</h2>
          <p className="step__p">Trip updates are transmitted to your authenticated contact phone.</p>
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
              />
            </Field>
          </div>
          {phoneSaved && (
            <p style={{ color: '#16a34a', fontSize: 13, marginTop: -8 }}>
              ✓ Host profile updated successfully.
            </p>
          )}
          <SaveBtn onSave={handleSave} loading={saving} />
        </div>
      );
      break;
    case 'license':
      body = (
        <div className="veh-form">
          <h2 className="step__title">Driver’s license</h2>
          <p className="step__p">Your active verified driver credentials on file.</p>
          <LicenseFields value={license} onChange={setLicense} />
          <SaveBtn onSave={handleSave} loading={saving} />
        </div>
      );
      break;
    case 'goals':
      body = (
        <div className="veh-form">
          <h2 className="step__title">Your goals</h2>
          <p className="step__p">Adjust your hosting profile goals and expected vehicle availability.</p>
          <GoalFields value={goals} onChange={setGoals} />
          <SaveBtn onSave={handleSave} loading={saving} />
        </div>
      );
      break;
    case 'availability':
      body = (
        <div className="veh-form">
          <h2 className="step__title">Car availability</h2>
          <p className="step__p">Configure advance booking notice and trip length constraints.</p>
          <AvailabilityFields
            value={{
              notice: advanceNotice,
              min: minTripDuration,
              max: maxTripDuration,
            }}
            onChange={(val) => {
              if (val.notice) setAdvanceNotice(val.notice);
              if (val.min) setMinTripDuration(val.min);
              if (val.max) setMaxTripDuration(val.max);
            }}
          />
          <SaveBtn onSave={handleSave} loading={saving} />
        </div>
      );
      break;
    case 'details':
      body = (
        <div className="veh-form">
          <h2 className="step__title">Car details</h2>
          <p className="step__p">Manage your vehicle license plate, amenities, and public description.</p>
          <DetailsFields
            filled
            features={features}
            setFeatures={setFeatures}
            defaultPlate={plate}
            defaultState={plateState}
            defaultDesc={description}
            onPlateChange={setPlate}
            onStateChange={setPlateState}
            onDescChange={setDescription}
          />
          <SaveBtn onSave={handleSave} loading={saving} />
        </div>
      );
      break;
    case 'photos':
      body = (
        <div className="veh-form">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />
          <h2 className="step__title">Car photos</h2>
          <p className="step__p">Manage your listing photos. Click the star on any image to mark it as the primary cover photo.</p>
          <p className="step__label">Listing Gallery ({photos.length} photos)</p>
          <div className="photo-grid">
            {photos.map((p, i) => {
              const photoId = p._id || p.id;
              const photoUrl = p.url || p;
              const isPrimary = p.isPrimary || i === 0;
              return (
                <figure key={photoId || i} style={{ position: 'relative' }}>
                  <img
                    src={photoUrl}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = img('car1.jpg');
                    }}
                  />
                  {photoId && (
                    <button
                      type="button"
                      title={isPrimary ? 'Primary Photo' : 'Set as Primary'}
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: isPrimary ? '#FDB022' : 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 6px',
                        cursor: 'pointer',
                        fontSize: 11,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      onClick={() => handleSetPrimaryPhoto(photoId)}
                    >
                      <FaStar size={11} /> {isPrimary ? 'Primary' : 'Make Primary'}
                    </button>
                  )}
                  {photoId && (
                    <button
                      type="button"
                      aria-label="Delete photo"
                      style={{ position: 'absolute', top: 8, right: 8 }}
                      onClick={() => handleDeletePhoto(photoId)}
                    >
                      <FiTrash2 size={13} />
                    </button>
                  )}
                </figure>
              );
            })}
            <button
              type="button"
              className="upload-tile"
              disabled={uploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
            >
              <FiUpload size={28} />
              {uploadingPhoto ? 'Uploading...' : 'Upload photo'}
            </button>
          </div>
        </div>
      );
      break;
    default:
      body = (
        <div className="veh-form">
          <h2 className="step__title">Pricing &amp; discounts</h2>
          <p className="step__p">Configure your base daily rate and smart demand pricing.</p>
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
          <h2 className="step__h">Discounts</h2>
          <DiscountCard
            title="Daily trips"
            rows={[
              ['3-day take-home earning', '3% off', `$${Math.round(dailyRate * 3 * 0.97)}`],
              ['Distance per day', null, '200 miles'],
              ['Competitiveness', null, 'High'],
            ]}
          />
          <DiscountCard
            title="Weekly trips"
            rows={[
              ['1-week take-home earning', '5% off', `$${Math.round(dailyRate * 7 * 0.95)}`],
              ['Distance per week', null, '1,400 miles'],
              ['Competitiveness', null, 'Recommended'],
            ]}
          />
          <SaveBtn onSave={handleSave} loading={saving} />
        </div>
      );
  }

  return (
    <Layout role="host">
      <div className="container veh-edit">
        <div className="veh-edit__title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button type="button" className="back-sq" aria-label="Back to vehicles" onClick={() => navigate('/host/vehicles')}>
              <FiChevronLeft size={26} />
            </button>
            <h1>{loadingVeh ? 'Loading vehicle...' : vehicleName}</h1>
          </div>
          {!loadingVeh && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ color: '#dc2626', borderColor: '#fca5a5' }}
              onClick={() => setShowDeleteModal(true)}
            >
              <FiTrash2 size={16} style={{ marginRight: 6 }} /> Delete Vehicle
            </button>
          )}
        </div>
        {loadingVeh ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', color: '#666' }}>
            <div
              className="spinner"
              style={{
                margin: '0 auto 16px',
                width: 36,
                height: 36,
                border: '3px solid #eee',
                borderTopColor: '#0075ff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p>Loading vehicle details...</p>
          </div>
        ) : (
          <>
            <p className="veh-edit__lead">{description || vehicleData?.description || 'Manage vehicle settings, pricing, photos, and location.'}</p>
            <div className="veh-edit__grid">
              <aside className="veh-edit__side">
                <div className="veh-mini">
                  <div className="veh-mini__img">
                    {vehicleImage ? (
                      <img
                        src={vehicleImage}
                        alt={vehicleName}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = img('car1.jpg');
                        }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                        📷
                      </div>
                    )}
                  </div>
                  <div className="veh-mini__body">
                    <h3>{vehicleName}</h3>
                    <p>
                      {vehicleState} <span>•</span> {vehiclePlate}
                    </p>
                    <small>Status: {vehicleData?.listingStatus ? vehicleData.listingStatus.toUpperCase() : 'ACTIVE'}</small>
                  </div>
                </div>
                <nav className="veh-nav">
                  {NAV.map(([k, l]) => (
                    <Link key={k} to={to(k)} className={section === k ? 'is-active' : ''}>
                      {l}
                    </Link>
                  ))}
                </nav>
              </aside>
              <section className="veh-edit__main">{body}</section>
            </div>
          </>
        )}
      </div>

      {/* Delete Vehicle Confirmation Modal */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)} width={480}>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ background: '#fef2f2', padding: 10, borderRadius: '50%', color: '#dc2626' }}>
                <FiAlertTriangle size={24} />
              </span>
              <h3 style={{ margin: 0, fontSize: 20 }}>Delete Vehicle Listing?</h3>
            </div>
            <p style={{ color: '#666', lineHeight: 1.5, marginBottom: 24 }}>
              Are you sure you want to permanently remove <strong>{vehicleName}</strong> ({vehiclePlate}) from your fleet? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                className="btn btn-outline"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                disabled={deleting}
                onClick={handleDeleteVehicle}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Vehicle'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {customLoc && (
        <CustomLocationModal
          currentRadius={deliveryRadius}
          onClose={() => setCustomLoc(false)}
          onSave={({ customAddress, radius }) => {
            setDeliveryRadius(radius);
            if (customAddress) {
              setHomeAddress(customAddress);
              const parts = customAddress.split(',').map((s) => s.trim());
              const city = parts.length >= 2 ? parts[parts.length - 2] : 'New York';
              const state = parts.length >= 3 ? parts[parts.length - 1] : 'NY';
              handleSave({
                deliveryRadiusMiles: radius,
                deliveryEnabled: true,
                location: {
                  address: customAddress,
                  city: city || 'New York',
                  state: state || 'NY',
                  country: 'USA',
                },
              });
            } else {
              handleSave({ deliveryRadiusMiles: radius, deliveryEnabled: true });
            }
          }}
        />
      )}

    </Layout>
  );
}
