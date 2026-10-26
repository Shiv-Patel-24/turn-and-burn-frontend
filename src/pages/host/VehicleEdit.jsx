import { useState, useEffect } from 'react';
import { FiChevronLeft, FiTrash2, FiCamera, FiInfo } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { IoCarOutline, IoClose } from 'react-icons/io5';
import { MdOutlineLocationOn } from 'react-icons/md';
import Layout from '../../components/Layout';
import { Field, Input, Checkbox, Toggle, Modal } from '../../ui';
import { CarSections, LicenseFields, GoalFields, AvailabilityFields, DetailsFields, PriceRange, FileDialog, UploadTile, AddressInput } from './Onboarding';
import { img, hostVehicles, LOREM_SHORT, LOREM_LONG } from '../../data';
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
function CustomLocationModal({ onClose }) {
  const [v, setV] = useState('');
  return (
    <Modal onClose={onClose} width={1127} className="custom-loc">
      <div className="modal__head">
        <h2 className="modal__title modal__title--md">Add Custom Location</h2>
        <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
          <IoClose size={30} />
        </button>
      </div>
      <AddressInput value={v} setValue={setV} />
      <button type="button" className="btn btn-primary btn-save" disabled={!v} onClick={onClose}>
        Save
      </button>
    </Modal>
  );
}

function SaveBtn({ onSave, loading }) {
  const [s, setS] = useState(false);
  const handleClick = async () => {
    if (onSave) {
      await onSave();
    }
    setS(true);
    setTimeout(() => setS(false), 2500);
  };
  return (
    <button type="button" className="btn btn-primary btn-upper btn-next" disabled={loading} onClick={handleClick}>
      {s ? 'SAVED' : loading ? 'SAVING...' : 'SAVE'}
    </button>
  );
}

const photoList = Array.from({ length: 11 }, (_, i) => img(`ph-${i + 1}.jpg`));

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
  const fallback = hostVehicles.find((v) => String(v.id) === params.id) || hostVehicles[0];

  const [vehicleData, setVehicleData] = useState(null);
  const [loadingVeh, setLoadingVeh] = useState(true);
  const [customLoc, setCustomLoc] = useState(false);
  const [file, setFile] = useState(null);
  const [avatar, setAvatar] = useState(img('avatar-host.jpg'));
  const [photos, setPhotos] = useState(photoList);
  const [sms, setSms] = useState(false);
  const [features, setFeatures] = useState(['All-wheel drive', 'Android Auto', 'AUX input', 'Backup camera', 'Blind spot warning', 'Bluetooth', 'Child seat', 'Heated seats', 'Keyless entry', 'Sunroof', 'USB charger', 'USB input']);
  const [auto, setAuto] = useState(true);
  const [dailyRate, setDailyRate] = useState(189.9);
  const [minPrice, setMinPrice] = useState(120);
  const [maxPrice, setMaxPrice] = useState(250);

  useEffect(() => {
    if (!params.id) return;
    let active = true;
    const fetchCar = async () => {
      try {
        let res = await apiRequest(`/vehicles/${params.id}`);
        let v = res?.data;
        if (!v) {
          res = await apiRequest(`/vehicles/mine/${params.id}`);
          v = res?.data;
        }
        if (!v) {
          const fleetRes = await apiRequest('/vehicles');
          const list = fleetRes?.data || [];
          v = list.find((x) => (x._id || x.id) === params.id);
        }
        if (active && v) {
          setVehicleData(v);
          if (v.photos && v.photos.length > 0) {
            setPhotos(v.photos.map((p) => p.url));
          }
          if (v.features && Array.isArray(v.features)) {
            setFeatures(v.features);
          }
          if (v.pricing?.dailyRate) {
            setDailyRate(v.pricing.dailyRate);
          }
          if (v.pricing?.minPrice) setMinPrice(v.pricing.minPrice);
          if (v.pricing?.maxPrice) setMaxPrice(v.pricing.maxPrice);
        }
      } catch (err) {
        try {
          const fleetRes = await apiRequest('/vehicles');
          const list = fleetRes?.data || [];
          const v = list.find((x) => (x._id || x.id) === params.id);
          if (active && v) {
            setVehicleData(v);
          }
        } catch {
          console.warn('Could not fetch vehicle from server:', err.message);
        }
      } finally {
        if (active) setLoadingVeh(false);
      }
    };
    fetchCar();
    return () => {
      active = false;
    };
  }, [params.id]);

  const vehicleId = vehicleData?._id || vehicleData?.id || params.id;
  const vehicleName = vehicleData
    ? `${vehicleData.year || ''} ${vehicleData.make || ''} ${vehicleData.model || ''}`.trim()
    : 'Vehicle Details';
  const vehiclePlate = vehicleData?.licensePlate || 'POR1234';
  const vehicleState = vehicleData?.licensePlateState || vehicleData?.location?.state || 'NC';
  const vehicleImage = vehicleData?.photos?.[0]?.url || '';
  const vehicleAddress = vehicleData?.location?.address
    ? `${vehicleData.location.address}, ${vehicleData.location.city || ''} ${vehicleData.location.state || ''}`.trim()
    : '70 Washington Square South, New York, NY 10012, United States';

  const to = (s) => `/host/vehicles/${vehicleId}/${s}`;

  const handleSave = async () => {
    try {
      await apiRequest(`/vehicles/${vehicleId}`, {
        method: 'PATCH',
        body: {
          features,
          pricing: {
            dailyRate: Number(dailyRate) || 189.9,
            minPrice: Number(minPrice) || 120,
            maxPrice: Number(maxPrice) || 250,
            automaticPricingEnabled: auto,
          },
        },
      });
    } catch (e) {
      console.warn('Vehicle update failed:', e.message);
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
                <p>{vehicleData?.description || LOREM_SHORT}</p>
              </div>
            </div>
            <h6>CUSTOM LOCATION</h6>
            <button type="button" className="loc-card" onClick={() => setCustomLoc(true)}>
              <MdOutlineLocationOn size={26} />
              <div>
                <h4>Offer delivery to location of your guest’s choice, within a specific radius.</h4>
                <p>Delivery radius: {vehicleData?.deliveryRadiusMiles || 25} miles.</p>
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
          <p className="step__p">We’ll use your Vehicle Identification Number (VIN) to identify your specific car</p>
          <Field label="Enter your VIN">
            <Input defaultValue={vehicleData?.vin || 'WP1AA2AY5NDA00001'} />
          </Field>
          <Checkbox checked={false} onChange={() => {}} className="check--blue">
            My vehicle is older than 1981
          </Checkbox>
          <CarSections
            values={
              vehicleData
                ? {
                    year: vehicleData.year,
                    make: vehicleData.make,
                    model: vehicleData.model,
                    style: vehicleData.style,
                    odometer: vehicleData.odometer,
                    transmission: vehicleData.transmission,
                  }
                : true
            }
          />
          <SaveBtn onSave={handleSave} />
        </div>
      );
      break;
    case 'profile':
      body = (
        <div className="veh-form">
          <h2 className="step__title">Profile photo</h2>
          <p className="step__p">Adding a photo helps hosts and guests recognize each other when picking up the car.</p>
          <button type="button" className="photo-change" onClick={() => setFile('avatar')}>
            <span>
              <img src={avatar} alt="" />
              <FiCamera size={40} />
            </span>
            Change photo
          </button>
          <h2 className="step__title">Mobile number</h2>
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
              <Input defaultValue="555 1722-123" />
            </Field>
          </div>
          <Checkbox checked={sms} onChange={setSms}>
            Get important trip updates via text message.
          </Checkbox>
          <SaveBtn onSave={handleSave} />
        </div>
      );
      break;
    case 'license':
      body = (
        <div className="veh-form">
          <h2 className="step__title">Driver’s license</h2>
          <p className="step__p">{LOREM_SHORT}</p>
          <LicenseFields filled />
          <SaveBtn onSave={handleSave} />
        </div>
      );
      break;
    case 'goals':
      body = (
        <div className="veh-form">
          <h2 className="step__title">Your goals</h2>
          <p className="step__p">{LOREM_SHORT}</p>
          <GoalFields value={{ goal: 'Cover your car payment', use: 'Rarely: once a week or less', share: 'Rarely: a few times per month' }} />
          <SaveBtn onSave={handleSave} />
        </div>
      );
      break;
    case 'availability':
      body = (
        <div className="veh-form">
          <h2 className="step__title">Car availability</h2>
          <p className="step__p">{LOREM_SHORT}</p>
          <AvailabilityFields
            value={{
              notice: vehicleData?.tripPreferences?.advanceNoticeHours ? `${vehicleData.tripPreferences.advanceNoticeHours / 24} day` : '1 day (recommended)',
              min: '1 day (recommended)',
              max: '2 weeks (recommended)',
            }}
          />
          <SaveBtn onSave={handleSave} />
        </div>
      );
      break;
    case 'details':
      body = (
        <div className="veh-form">
          <h2 className="step__title">Car details</h2>
          <p className="step__p">{vehicleData?.description || LOREM_SHORT}</p>
          <DetailsFields
            filled
            features={features}
            setFeatures={setFeatures}
            defaultPlate={vehiclePlate}
            defaultState={vehicleState}
            defaultDesc={vehicleData?.description}
          />
          <SaveBtn onSave={handleSave} />
        </div>
      );
      break;
    case 'photos':
      body = (
        <div className="veh-form">
          <h2 className="step__title">Car photos</h2>
          <p className="step__p">{LOREM_LONG}</p>
          <p className="step__label">Car photos</p>
          <div className="photo-grid">
            {photos.map((p, i) => (
              <figure key={p + i}>
                <img src={p} alt="" />
                <button type="button" aria-label="Delete photo" onClick={() => setPhotos(photos.filter((_, k) => k !== i))}>
                  <FiTrash2 size={13} />
                </button>
              </figure>
            ))}
            <UploadTile onClick={() => setFile('photo')} />
          </div>
          <SaveBtn />
        </div>
      );
      break;
    default:
      body = (
        <div className="veh-form">
          <h2 className="step__title">Pricing &amp; discounts</h2>
          <p className="step__p">{LOREM_SHORT}</p>
          <p className="step__label">Last-minute boost pricing</p>
          <p className="step__p2 sm">
            Earn more on last-minute trips by automatically boosting your prices for same-day bookings.
            <br />
            Make sure your vehicle’s advance notice settings allow for same-day bookings in your Trip preferences.
          </p>
          <Field label="Price boost" hint="Recommended: 5%">
            <Input defaultValue="5%" />
          </Field>
          <h2 className="step__h">Pricing</h2>
          <p className="step__p">{LOREM_SHORT}</p>
          <p className="step__label">Automatic Pricing</p>
          <p className="step__p2">Boost earning by letting your price automatically adjust to match demand.</p>
          <Toggle on={auto} onChange={setAuto} />
          <PriceRange filled />
          <h2 className="step__h">Discounts</h2>
          <p className="step__p">{LOREM_SHORT}</p>
          <p className="step__label">Attract longer trips</p>
          <DiscountCard
            title="Daily trips"
            rows={[
              ['3-day take-home earning', '3% off', '$119'],
              ['Distance per day', null, '200 miles'],
              ['Competitiveness', null, 'N/A'],
            ]}
          />
          <DiscountCard
            title="Weekly trips"
            rows={[
              ['1-week take-home earning', '5% off', '$256'],
              ['2-week take-home earning', '10% off', '$476'],
              ['3-week take-home earning', '15% off', '$687'],
              ['Distance per week', null, '1,400 miles'],
              ['Competitiveness', null, 'N/A'],
            ]}
          />
          <DiscountCard
            note="Monthly trips are turned off. Turn them on in your trip preference to be more price competitive."
            title="Monthly trips"
            rows={[
              ['1-month take-home earning', '45% off', '$647'],
              ['Distance per month', null, '3,300 miles'],
              ['Competitiveness', null, 'N/A'],
            ]}
          />
          <div className="discount">
            <h4>Non-refundable discount</h4>
            <p className="discount__text">All vehicles are required to offer a 10% non-refundable discount for trips booked at least four days in advance. This protects your earnings if a guest cancels.</p>
            <button type="button" className="btn-mini">
              Learn more
            </button>
          </div>
          <SaveBtn />
        </div>
      );
  }

  return (
    <Layout role="host">
      <div className="container veh-edit">
        <div className="veh-edit__title">
          <button type="button" className="back-sq" aria-label="Back to vehicles" onClick={() => navigate('/host/vehicles')}>
            <FiChevronLeft size={26} />
          </button>
          <h1>{loadingVeh ? 'Loading vehicle...' : vehicleName}</h1>
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
            <p className="veh-edit__lead">{vehicleData?.description || LOREM_SHORT}</p>
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
      {customLoc && <CustomLocationModal onClose={() => setCustomLoc(false)} />}
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
    </Layout>
  );
}
