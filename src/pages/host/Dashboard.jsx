import { useEffect, useState, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiUser, FiDollarSign, FiClock, FiMapPin, FiCheckCircle, FiArrowRight, FiCheck, FiX, FiAlertTriangle, FiUpload } from 'react-icons/fi';
import { TbArrowsRightLeft, TbHourglass } from 'react-icons/tb';
import { FaStar } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import Layout from '../../components/Layout';
import { DateRangeModal } from '../../components/Search';
import { Modal, Field, Input, Select } from '../../ui';
import { SearchField, SortPopover, ListingStatusPopover, VehiclePopover, TripStatusPopover, StatusMenu, Thumb } from './HostShared';
import { img, fleetThumbs, tripThumbs, hostVehicles, LOREM_SHORT } from '../../data';
import { navigate } from '../../router';
import { apiRequest } from '../../lib/api';

function MonthNav({ currentDate, onChange, onOpen }) {
  const label = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    onChange(d);
  };
  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    onChange(d);
  };

  return (
    <div className="month-nav">
      <button type="button" aria-label="Previous week" onClick={prevWeek}>
        <FiChevronLeft size={24} strokeWidth={2.5} />
      </button>
      <button type="button" className="month-nav__label" onClick={onOpen}>
        {label}
      </button>
      <button type="button" aria-label="Next week" onClick={nextWeek}>
        <FiChevronRight size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
}

/* Figma: "MacBook Pro 14 - 40" — Host calendar */
export function HostCalendar() {
  const [cal, setCal] = useState(false);
  const [baseDate, setBaseDate] = useState(() => new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);

  // Calculate 7-day window from current baseDate (Monday to Sunday)
  const dayOfWeek = (baseDate.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(baseDate);
  monday.setDate(monday.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);

  const daysWindow = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const fromStr = monday.toISOString();
  const sunday = new Date(daysWindow[6]);
  sunday.setHours(23, 59, 59, 999);
  const toStr = sunday.toISOString();

  useEffect(() => {
    let active = true;
    setLoading(true);

    const params = new URLSearchParams({ from: fromStr, to: toStr });

    Promise.all([
      apiRequest(`/host/calendar?${params.toString()}`).catch((err) => {
        console.warn('Could not fetch host calendar:', err.message);
        return null;
      }),
      apiRequest('/vehicles').catch(() => null),
    ]).then(([calRes, vehRes]) => {
      if (!active) return;
      if (calRes?.data) {
        setCalendarData(calRes.data);
      }
      const myVehicles = vehRes?.data || [];
      if (Array.isArray(myVehicles) && myVehicles.length > 0) {
        setVehicles(myVehicles);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [fromStr, toStr]);

  // Displayed vehicle list (from backend vehicles or calendarData.vehicles)
  const displayVehicles =
    vehicles.length > 0
      ? vehicles
      : calendarData?.vehicles?.length > 0
      ? calendarData.vehicles
      : [];

  // Group bookings by vehicleId and date (YYYY-MM-DD)
  const bookingsMap = {};
  if (calendarData?.days && Array.isArray(calendarData.days)) {
    calendarData.days.forEach((dayItem) => {
      const dateKey = dayItem.date ? dayItem.date.split('T')[0] : '';
      if (!bookingsMap[dateKey]) {
        bookingsMap[dateKey] = {};
      }
      if (dayItem.bookings && Array.isArray(dayItem.bookings)) {
        dayItem.bookings.forEach((b) => {
          const vId = b.vehicle?._id || b.vehicle || b.vehicleId;
          if (vId) {
            bookingsMap[dateKey][vId] = b;
          }
        });
      }
    });
  }

  return (
    <Layout role="host">
      <div className="container host-cal">
        <div className="toolbar">
          <MonthNav currentDate={baseDate} onChange={setBaseDate} onOpen={() => setCal(true)} />
          <div className="toolbar__right">
            <SearchField />
            <SortPopover />
            <ListingStatusPopover />
            <VehiclePopover />
          </div>
        </div>
        <div className="table-scroll">
          <table className="cal-table">
            <thead>
              <tr>
                <th className="cal-table__car">Cars</th>
                {daysWindow.map((d, i) => (
                  <th key={i}>
                    {d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                  </th>
                ))}
                <th className="w-hours">Weekly Hours</th>
                <th className="w-rev">Weekly Revenue</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    Loading calendar schedule...
                  </td>
                </tr>
              ) : displayVehicles.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
                    No listed vehicles found. Add a vehicle to view its schedule and availability here.
                  </td>
                </tr>
              ) : (
                displayVehicles.map((veh, r) => {
                  const vehId = veh._id || veh.id;
                  const photo = veh.photos?.[0]?.url || veh.photos?.[0] || fleetThumbs[r % fleetThumbs.length];
                  let vehWeeklyHours = 0;
                  let vehWeeklyRev = 0;

                  return (
                    <tr key={vehId || r}>
                      <td className="cal-table__car">
                        <Thumb src={photo} small />
                      </td>
                      {daysWindow.map((d, cIdx) => {
                        const dateKey = d.toISOString().split('T')[0];
                        const b = bookingsMap[dateKey]?.[vehId];

                        if (b) {
                          const hrs = b.pricing?.numberOfHours || 24;
                          const rev = b.pricing?.total || 0;
                          vehWeeklyHours += hrs;
                          vehWeeklyRev += rev;
                          const guestName = b.guest ? `${b.guest.firstName || ''} ${b.guest.lastName || ''}`.trim() : 'Guest';
                          const loc = b.pickup?.location || veh.location?.address || 'Pickup location';

                          return (
                            <td key={cIdx}>
                              <div className="slot">
                                <div className="slot__box">
                                  <b>{guestName}</b>
                                  <small title={loc}>{loc}</small>
                                  <small className="muted">${Number(rev).toFixed(2)}</small>
                                </div>
                                <span className="slot__total">Total: {hrs} hrs</span>
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td key={cIdx}>
                            <span className="dash">-</span>
                          </td>
                        );
                      })}
                      <td className="w-hours">{vehWeeklyHours || 0} hrs</td>
                      <td className="w-rev">${vehWeeklyRev.toFixed(2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="hscroll">
          <span />
        </div>
      </div>
      {cal && <DateRangeModal onClose={() => setCal(false)} />}
    </Layout>
  );
}

function TripCard({ booking, thumb, ending, onOpen }) {
  const guestName = booking?.guest ? `${booking.guest.firstName || ''} ${booking.guest.lastName || ''}`.trim() : 'Guest';
  const pickupLoc = booking?.pickup?.location || 'Pickup location';
  const dropoffLoc = booking?.dropoff?.location || 'Dropoff location';
  const earnings = booking?.pricing?.total != null ? `$${booking.pricing.total.toFixed(2)}` : '$0.00';
  const duration = booking?.pricing?.numberOfHours ? `${booking.pricing.numberOfHours} hours` : 'Flexible';
  
  const v = booking?.vehicle;
  const carPhoto =
    (v?.photos?.find((p) => p.isPrimary)?.url) ||
    v?.photos?.[0]?.url ||
    (typeof v?.photos?.[0] === 'string' ? v.photos[0] : null) ||
    thumb;
  const carTitle = v ? `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim() : '';
  const carPlate = v?.licensePlate ? `Plate: ${v.licensePlate}` : '';
  const milesIncluded = booking?.pricing?.distanceIncluded ? `${booking.pricing.distanceIncluded} miles` : '800 miles';

  const status = booking?.status || 'pending';
  const statusColor =
    status === 'approved'
      ? { bg: '#dcfce7', fg: '#166534' }
      : status === 'active'
      ? { bg: '#dbeafe', fg: '#1e40af' }
      : status === 'completed'
      ? { bg: '#f1f5f9', fg: '#475569' }
      : status === 'cancelled' || status === 'rejected'
      ? { bg: '#fee2e2', fg: '#991b1b' }
      : { bg: '#fef3c7', fg: '#92400e' };

  return (
    <button type="button" className="trip-card" onClick={onOpen}>
      <Thumb src={carPhoto} carName={carTitle} plate={carPlate} />
      <div className="trip-card__info">
        <div className="trip-card__row">
          <span className="ico-box">
            <FiUser />
          </span>
          <b>{guestName}</b>
          <span className="ico-box">
            <TbArrowsRightLeft />
          </span>
          <b>{milesIncluded}</b>
          <span className="ico-box">
            <TbHourglass />
          </span>
          <b>{duration}</b>
          <span
            className="ending"
            style={{
              background: statusColor.bg,
              color: statusColor.fg,
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: 12,
              padding: '6px 14px',
            }}
          >
            Status: {status}
          </span>
        </div>
        <div className="trip-card__row">
          <span className="ico-box">
            <FiDollarSign />
          </span>
          <b>{earnings}</b>
        </div>
        <div className="route">
          <p>
            <i className="route__dot" /> {pickupLoc}
          </p>
          <p>
            <FiMapPin className="route__pin" /> {dropoffLoc}
          </p>
        </div>
      </div>
    </button>
  );
}

function AssignChauffeurModal({ booking, onClose, onSuccess }) {
  const [name, setName] = useState(booking?.chauffeurAssigned?.name || '');
  const [phone, setPhone] = useState(booking?.chauffeurAssigned?.phone || '');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      setErr('Please enter both chauffeur name and phone number.');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const id = booking._id || booking.id;
      const res = await apiRequest(`/bookings/${id}/chauffeur`, {
        method: 'POST',
        body: { name: name.trim(), phone: phone.trim() },
      });
      onSuccess && onSuccess(res?.data);
      onClose();
    } catch (e) {
      setErr(e.message || 'Failed to assign chauffeur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} width={440}>
      <div className="modal__head">
        <h2 className="modal__title">Assign Chauffeur</h2>
        <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
          <IoClose size={26} />
        </button>
      </div>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
        Assign a dedicated driver for reservation <strong>#{booking?.referenceCode || (booking?._id || '').slice(-6).toUpperCase()}</strong>.
      </p>
      {err && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', marginBottom: 14, fontSize: 14 }}>
          {err}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Chauffeur Full Name">
          <Input placeholder="e.g. Michael Vance" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Contact Phone Number">
          <Input placeholder="e.g. +1 555-019-2834" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
      </div>
      <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" disabled={loading} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" disabled={loading} onClick={handleSave}>
          {loading ? 'Assigning...' : 'Save Chauffeur'}
        </button>
      </div>
    </Modal>
  );
}

function RecordOdometerModal({ booking, onClose, onSuccess }) {
  const isStart = booking?.odometerStart == null;
  const [phase, setPhase] = useState(isStart ? 'start' : 'end');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSave = async () => {
    const num = Number(value);
    if (!value || isNaN(num) || num < 0) {
      setErr('Please enter a valid non-negative odometer mileage reading.');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const id = booking._id || booking.id;
      const res = await apiRequest(`/bookings/${id}/odometer`, {
        method: 'POST',
        body: { phase, value: num },
      });
      onSuccess && onSuccess(res?.data);
      onClose();
    } catch (e) {
      setErr(e.message || 'Failed to record odometer reading');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} width={440}>
      <div className="modal__head">
        <h2 className="modal__title">Record Trip Odometer</h2>
        <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
          <IoClose size={26} />
        </button>
      </div>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
        Track mileage before and after the rental for accurate extra-mileage reporting.
      </p>
      {err && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', marginBottom: 14, fontSize: 14 }}>
          {err}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Trip Phase">
          <Select
            value={phase}
            onChange={setPhase}
            options={['start', 'end']}
          />
        </Field>
        {booking?.odometerStart != null && (
          <p style={{ fontSize: 13, color: '#64748b', margin: '-6px 0 4px' }}>
            Starting reading recorded: <strong>{booking.odometerStart.toLocaleString()} miles</strong>
          </p>
        )}
        <Field label={`${phase === 'start' ? 'Start' : 'End'} Mileage Reading (miles)`}>
          <Input
            type="number"
            placeholder="e.g. 14250"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Field>
      </div>
      <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" disabled={loading} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" disabled={loading} onClick={handleSave}>
          {loading ? 'Saving...' : 'Record Mileage'}
        </button>
      </div>
    </Modal>
  );
}

function ReportDamageModal({ booking, onClose, onSuccess }) {
  const [damageType, setDamageType] = useState('Body Scratch');
  const [severity, setSeverity] = useState('Minor');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('files', f));
      const res = await apiRequest('/uploads?folder=damage', {
        method: 'POST',
        body: fd,
      });
      const urls = res?.data?.urls || [];
      setPhotos((prev) => [...prev, ...urls]);
    } catch (uErr) {
      console.warn('Damage photo upload error:', uErr.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!description.trim()) {
      setErr('Please provide a description of the observed damage.');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const id = booking._id || booking.id;
      const res = await apiRequest(`/bookings/${id}/damage-report`, {
        method: 'POST',
        body: {
          damageType,
          severity,
          description: description.trim(),
          photoUrls: photos,
        },
      });
      onSuccess && onSuccess(res?.data);
      onClose();
    } catch (e) {
      setErr(e.message || 'Failed to submit damage report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} width={480}>
      <div className="modal__head">
        <h2 className="modal__title">Report Vehicle Damage</h2>
        <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
          <IoClose size={26} />
        </button>
      </div>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
        Submit photo evidence and details for review by Turn and Burn Trust & Safety.
      </p>
      {err && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', marginBottom: 14, fontSize: 14 }}>
          {err}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Damage Category">
          <Select
            value={damageType}
            onChange={setDamageType}
            options={['Body Scratch', 'Glass Damage', 'Interior Damage', 'Missing Part', 'Underbody / Tire', 'Incidental', 'Other']}
          />
        </Field>
        <Field label="Severity">
          <Select
            value={severity}
            onChange={setSeverity}
            options={['Minor', 'Moderate', 'Major']}
          />
        </Field>
        <Field label="Description">
          <textarea
            className="input textarea"
            rows={3}
            placeholder="Describe the damage, location on vehicle, and circumstances..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <div>
          <label className="field__label" style={{ display: 'block', marginBottom: 6 }}>
            Damage Photos ({photos.length} uploaded)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {photos.map((u, i) => (
              <img
                key={i}
                src={u}
                alt="Damage proof"
                style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover', border: '1px solid #cbd5e1' }}
              />
            ))}
            <button
              type="button"
              className="btn btn-outline"
              style={{ height: 56, padding: '0 14px', fontSize: 13 }}
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <FiUpload size={14} style={{ marginRight: 6 }} />
              {uploading ? 'Uploading...' : 'Add Photos'}
            </button>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" disabled={loading} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" disabled={loading} onClick={handleSave}>
          {loading ? 'Submitting...' : 'File Damage Report'}
        </button>
      </div>
    </Modal>
  );
}

/* Modal: Report Issue (POST /bookings/:id/issue-report) */
function ReportIssueModal({ booking, onClose, onSuccess }) {
  const [category, setCategory] = useState('Mechanical');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSave = async () => {
    if (!description.trim()) {
      setErr('Please describe the issue observed.');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const id = booking._id || booking.id;
      const res = await apiRequest(`/bookings/${id}/issue-report`, {
        method: 'POST',
        body: { category, description: description.trim() },
      });
      onSuccess && onSuccess(res?.data);
      onClose();
    } catch (e) {
      setErr(e.message || 'Failed to submit issue report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} width={440}>
      <div className="modal__head">
        <h2 className="modal__title">Report An Issue</h2>
        <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
          <IoClose size={26} />
        </button>
      </div>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
        Report non-damage issues such as cleanliness, tardiness, mechanical alerts, or safety concerns.
      </p>
      {err && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', marginBottom: 14, fontSize: 14 }}>
          {err}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Issue Category">
          <Select
            value={category}
            onChange={setCategory}
            options={['Mechanical', 'Cleanliness', 'Late Return', 'Safety', 'Fuel Level', 'Other']}
          />
        </Field>
        <Field label="Description">
          <textarea
            className="input textarea"
            rows={3}
            placeholder="Details about what happened..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
      </div>
      <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" disabled={loading} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" disabled={loading} onClick={handleSave}>
          {loading ? 'Submitting...' : 'Submit Issue'}
        </button>
      </div>
    </Modal>
  );
}

function IncidentalChargeModal({ booking, onClose, onSuccess }) {
  const [description, setDescription] = useState('Fuel charge');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSave = async () => {
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setErr('Please enter a valid positive dollar amount.');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const id = booking._id || booking.id;
      const res = await apiRequest(`/bookings/${id}/incidental-charge`, {
        method: 'POST',
        body: { description: description.trim(), amount: num },
      });
      onSuccess && onSuccess(res?.data);
      onClose();
    } catch (e) {
      setErr(e.message || 'Failed to submit incidental charge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} width={440}>
      <div className="modal__head">
        <h2 className="modal__title">Charge for Incidentals</h2>
        <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
          <IoClose size={26} />
        </button>
      </div>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
        Charge guest for fuel refill, unpaid tolls, or cleaning fees.
      </p>
      {err && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', marginBottom: 14, fontSize: 14 }}>
          {err}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Charge Description">
          <Input placeholder="e.g. Fuel Refill, Tolls, Cleaning" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Amount ($)">
          <Input type="number" placeholder="e.g. 45.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
      </div>
      <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" disabled={loading} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" disabled={loading} onClick={handleSave}>
          {loading ? 'Submitting...' : 'Apply Charge'}
        </button>
      </div>
    </Modal>
  );
}

/* Figma: "MacBook Pro 14 - 42" (Booked trip) / "MacBook Pro 14 - 44" (Trip history) drawers */
function TripDrawer({ booking, history, onClose, onRefresh }) {
  const [activeBooking, setActiveBooking] = useState(booking);
  const [modal, setModal] = useState(null); // 'chauffeur' | 'odometer' | 'damage' | 'issue' | 'incidental'
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const guestName = activeBooking?.guest ? `${activeBooking.guest.firstName || ''} ${activeBooking.guest.lastName || ''}`.trim() : 'Guest';
  const pickupLoc = activeBooking?.pickup?.location || 'Pickup location';
  const dropoffLoc = activeBooking?.dropoff?.location || 'Dropoff location';
  const earnings = activeBooking?.pricing?.total != null ? `$${activeBooking.pricing.total.toFixed(2)}` : '$0.00';
  const pickupDate = activeBooking?.pickup?.dateTime ? new Date(activeBooking.pickup.dateTime) : null;
  const dropoffDate = activeBooking?.dropoff?.dateTime ? new Date(activeBooking.dropoff.dateTime) : null;
  const pickupTime = pickupDate ? pickupDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Flexible';
  const dropoffTime = dropoffDate ? dropoffDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Flexible';
  const pickupClock = pickupDate ? pickupDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '12:00 PM';
  const dropoffClock = dropoffDate ? dropoffDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '12:00 PM';

  const milesIncluded = activeBooking?.pricing?.distanceIncluded ? `${activeBooking.pricing.distanceIncluded} miles` : 'Unlimited miles';
  const milesDriven = activeBooking?.totalMilesDriven != null ? `${activeBooking.totalMilesDriven} miles` : '0 miles';

  // Calculate remaining hours if trip is active
  let hoursLeftText = '';
  if (!history && dropoffDate) {
    const diffHours = Math.round((dropoffDate.getTime() - Date.now()) / (1000 * 60 * 60));
    hoursLeftText = diffHours > 0 ? `This trip ends in ~${diffHours} hours` : 'Trip completed or awaiting return';
  }

  const handleStatusTransition = async (newStatus, reason = '') => {
    setStatusLoading(true);
    setStatusMsg('');
    try {
      const id = activeBooking._id || activeBooking.id;
      const res = await apiRequest(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: { status: newStatus, cancellationReason: reason },
      });
      if (res?.data) {
        setActiveBooking(res.data);
        setStatusMsg(`Status updated to ${newStatus.toUpperCase()}`);
        onRefresh && onRefresh();
      }
    } catch (err) {
      alert(err.message || 'Could not update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const currentStatus = activeBooking?.status || 'pending';

  return (
    <>
      <Modal onClose={onClose} width={500} className="drawer" align="right">
        <div className="drawer__head">
          <h2>{history ? 'Trip history' : 'Booked trip'}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <IoClose size={28} />
          </button>
        </div>
        <h4>CLIENTS DETAILS</h4>
        <div className="client">
          <div className="client__avatar">
            {activeBooking?.guest?.profilePhotoUrl ? (
              <img src={activeBooking.guest.profilePhotoUrl} alt="" />
            ) : (
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#e2e8f0', display: 'grid', placeItems: 'center' }}>
                <FiUser size={30} color="#64748b" />
              </div>
            )}
            <span>
              5.0 <FaStar color="#FDB022" />
            </span>
          </div>
          <div>
            <p>
              {guestName} {activeBooking?.guest?.phone && <a href={`tel:${activeBooking.guest.phone}`}>({activeBooking.guest.phone})</a>}
            </p>
            <p>Reference: {activeBooking?.referenceCode || `#BK-${(activeBooking?._id || '0000').slice(-6).toUpperCase()}`}</p>
            <p>
              Status:{' '}
              <span
                style={{
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: 12,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: currentStatus === 'approved' ? '#dcfce7' : currentStatus === 'active' ? '#dbeafe' : currentStatus === 'completed' ? '#f1f5f9' : '#fef3c7',
                  color: currentStatus === 'approved' ? '#166534' : currentStatus === 'active' ? '#1e40af' : currentStatus === 'completed' ? '#475569' : '#92400e',
                }}
              >
                {currentStatus}
              </span>
            </p>
          </div>
        </div>

        {activeBooking?.chauffeurAssigned?.name && (
          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, margin: '8px 0', border: '1px solid #e2e8f0', fontSize: 13 }}>
            <strong>Assigned Chauffeur:</strong> {activeBooking.chauffeurAssigned.name} ({activeBooking.chauffeurAssigned.phone})
          </div>
        )}

        {statusMsg && (
          <div style={{ padding: '8px 12px', background: '#dcfce7', color: '#166534', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
            ✓ {statusMsg}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, margin: '14px 0', flexWrap: 'wrap' }}>
          {currentStatus === 'pending' && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: 13 }}
                disabled={statusLoading}
                onClick={() => handleStatusTransition('approved')}
              >
                <FiCheck size={14} style={{ marginRight: 4 }} /> Approve
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px', fontSize: 13, color: '#dc2626', borderColor: '#fca5a5' }}
                disabled={statusLoading}
                onClick={() => {
                  const r = prompt('Decline reason (optional):');
                  if (r !== null) handleStatusTransition('rejected', r);
                }}
              >
                <FiX size={14} style={{ marginRight: 4 }} /> Decline
              </button>
            </>
          )}

          {currentStatus === 'approved' && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: 13 }}
                disabled={statusLoading}
                onClick={() => handleStatusTransition('active')}
              >
                Start Trip
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px', fontSize: 13, color: '#dc2626', borderColor: '#fca5a5' }}
                disabled={statusLoading}
                onClick={() => {
                  const r = prompt('Cancellation reason:');
                  if (r) handleStatusTransition('cancelled', r);
                }}
              >
                Cancel Trip
              </button>
            </>
          )}

          {currentStatus === 'active' && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: 13, background: '#16a34a', borderColor: '#16a34a' }}
                disabled={statusLoading}
                onClick={() => handleStatusTransition('completed')}
              >
                Complete Trip
              </button>
            </>
          )}
        </div>

        <h4>VERIFIED INFO</h4>
        {['Approved to drive', 'Email address', 'Phone number'].map((v) => (
          <p className="verified" key={v}>
            {v} <FiCheckCircle color="#0075ff" size={22} />
          </p>
        ))}
        <hr />
        <h4>TRIP DETAILS</h4>
        <div className="trip-dates">
          <div>
            <b>{pickupTime}</b>
            <small>{pickupClock}</small>
          </div>
          <FiArrowRight size={40} strokeWidth={1.4} />
          <div>
            <b>{dropoffTime}</b>
            <small>{dropoffClock}</small>
          </div>
        </div>
        <div className="route route--lg">
          <p>
            <i className="route__dot" /> {pickupLoc}
          </p>
          <p>
            <FiMapPin className="route__pin" /> {dropoffLoc}
          </p>
        </div>
        <div className="trip-facts">
          <div>
            <h4>TOTAL MILES INCLUDED</h4>
            <p>{milesIncluded}</p>
          </div>
          <div>
            <h4>TOTAL MILES DRIVEN</h4>
            <p>{milesDriven}</p>
          </div>
          <div>
            <h4>TOTAL EARNINGS</h4>
            <p>{earnings}</p>
          </div>
          <div>
            <h4>CANCELATION POLICY</h4>
            <p>{activeBooking?.cancellationPolicy || 'Standard cancellation policy'}</p>
          </div>
        </div>
        <div className="drawer__box" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            type="button"
            className="btn btn-outline btn-block"
            onClick={() => setModal('odometer')}
          >
            Record Odometer / Mileage
          </button>
          <button
            type="button"
            className="btn btn-outline btn-block"
            onClick={() => setModal('chauffeur')}
          >
            {activeBooking?.chauffeurAssigned?.name ? 'Change Chauffeur' : 'Assign Chauffeur'}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-block"
            onClick={() => setModal('incidental')}
          >
            Charge for Incidentals
          </button>
          <button
            type="button"
            className="btn btn-outline btn-block"
            onClick={() => setModal('issue')}
          >
            Report Issue
          </button>
          <button
            type="button"
            className="btn btn-outline btn-block"
            onClick={() => setModal('damage')}
          >
            Report Damage
          </button>
        </div>
      </Modal>

      {modal === 'chauffeur' && (
        <AssignChauffeurModal
          booking={activeBooking}
          onClose={() => setModal(null)}
          onSuccess={(upd) => {
            if (upd) setActiveBooking(upd);
            onRefresh && onRefresh();
          }}
        />
      )}
      {modal === 'odometer' && (
        <RecordOdometerModal
          booking={activeBooking}
          onClose={() => setModal(null)}
          onSuccess={(upd) => {
            if (upd) setActiveBooking(upd);
            onRefresh && onRefresh();
          }}
        />
      )}
      {modal === 'damage' && (
        <ReportDamageModal
          booking={activeBooking}
          onClose={() => setModal(null)}
          onSuccess={(upd) => {
            if (upd) setActiveBooking(upd);
            onRefresh && onRefresh();
          }}
        />
      )}
      {modal === 'issue' && (
        <ReportIssueModal
          booking={activeBooking}
          onClose={() => setModal(null)}
          onSuccess={(upd) => {
            if (upd) setActiveBooking(upd);
            onRefresh && onRefresh();
          }}
        />
      )}
      {modal === 'incidental' && (
        <IncidentalChargeModal
          booking={activeBooking}
          onClose={() => setModal(null)}
          onSuccess={(upd) => {
            if (upd) setActiveBooking(upd);
            onRefresh && onRefresh();
          }}
        />
      )}
    </>
  );
}

/* Figma: "MacBook Pro 14 - 41" (Booked) / "MacBook Pro 14 - 43" (History) */
export function HostTrips({ tab = 'booked' }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [serverBookings, setServerBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = tab === 'history';

  const fetchTrips = () => {
    let active = true;
    setLoading(true);
    const scope = history ? 'previous' : 'current';
    apiRequest(`/bookings?role=host&scope=${scope}`)
      .then((res) => {
        if (!active) return;
        const list = res?.data || [];
        if (Array.isArray(list)) {
          setServerBookings(list);
          // If drawer is currently open, keep active booking state in sync
          setSelectedBooking((prev) => {
            if (!prev) return null;
            const updated = list.find((b) => (b._id || b.id) === (prev._id || prev.id));
            return updated || prev;
          });
        }
      })
      .catch((err) => console.warn('Could not fetch host bookings from server:', err.message))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  };

  useEffect(() => {
    return fetchTrips();
  }, [history]);

  return (
    <Layout role="host">
      <div className="container trips">
        <div className="trips__head">
          <div>
            <h1>Trips</h1>
            <p>{LOREM_SHORT}</p>
          </div>
          <div className="trips__tools">
            <div className="seg-blue">
              <button type="button" className={!history ? 'is-active' : ''} onClick={() => navigate('/host/trips')}>
                Booked
              </button>
              <button type="button" className={history ? 'is-active' : ''} onClick={() => navigate('/host/trips/history')}>
                History
              </button>
            </div>
            <VehiclePopover />
          </div>
        </div>
        {loading && <p style={{ color: '#888', padding: '10px 0' }}>Loading host reservations...</p>}
        {!loading && serverBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
            <p style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
              {history ? 'No trip history found' : 'No active reservations'}
            </p>
            <p>
              {history
                ? 'Completed trips and past rentals for your vehicles will show here.'
                : 'When guests reserve or check in to your vehicles, active trips will appear here.'}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="trips__day">{history ? 'Completed Trips' : 'Active Reservations'}</h2>
            {serverBookings.map((b) => (
              <TripCard
                key={b._id || b.id}
                booking={b}
                thumb={b.vehicle?.photos?.[0]?.url || b.vehicle?.photos?.[0] || ''}
                ending={!history}
                onOpen={() => setSelectedBooking(b)}
              />
            ))}
          </div>
        )}
      </div>
      {selectedBooking && (
        <TripDrawer
          booking={selectedBooking}
          history={history}
          onClose={() => setSelectedBooking(null)}
          onRefresh={fetchTrips}
        />
      )}
    </Layout>
  );
}

/* Figma: "MacBook Pro 14 - 46" — Vehicles */
export function HostVehicles() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState({ Listed: true, Unlisted: true, Snoozed: true });

  const fetchVehicles = () => {
    let active = true;
    setLoading(true);

    // Build query params
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());

    // Check if only a single status is selected
    const activeStatuses = Object.keys(statusFilter).filter((k) => statusFilter[k]);
    if (activeStatuses.length === 1) {
      params.append('status', activeStatuses[0].toLowerCase());
    }

    const queryStr = params.toString() ? `?${params.toString()}` : '';

    apiRequest(`/vehicles${queryStr}`)
      .then((res) => {
        if (!active) return;
        const vehicles = res?.data || [];
        if (Array.isArray(vehicles) && vehicles.length > 0) {
          const mapped = vehicles.map((v, i) => ({
            id: v._id || v.id || i + 1,
            name: `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim() || 'Vehicle',
            image: (v.photos?.find((p) => p.isPrimary)?.url) || v.photos?.[0]?.url || '',
            plate: v.licensePlate || 'POR1234',
            state: v.licensePlateState || v.location?.state || 'NY',
            status: v.listingStatus === 'listed' ? 'Listed' : v.listingStatus === 'snoozed' ? 'Snoozed' : 'Unlisted',
            lastTrip: 'Active',
            rating: v.ratingsAverage || 5.0,
            trips: v.ratingsCount || 0,
            raw: v,
          }));
          setList(mapped);
        } else {
          setList([]);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch host vehicles from server:', err.message);
        setList([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleStatusChange = async (vehicleId, newStatus) => {
    let previousStatus = null;
    setList((prev) =>
      prev.map((x) => {
        if (x.id === vehicleId) {
          previousStatus = x.status;
          return { ...x, status: newStatus };
        }
        return x;
      }),
    );
    try {
      const backendStatus = newStatus.toLowerCase();
      await apiRequest(`/vehicles/${vehicleId}/listing-status`, {
        method: 'PATCH',
        body: { listingStatus: backendStatus },
      });
    } catch (err) {
      console.warn('Could not update vehicle status on backend:', err.message);
      if (previousStatus !== null) {
        setList((prev) => prev.map((x) => (x.id === vehicleId ? { ...x, status: previousStatus } : x)));
      }
    }
  };

  // Client-side filter fallback in case multiple statuses are chosen
  const filteredList = list.filter((v) => {
    if (statusFilter[v.status] === false) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return v.name.toLowerCase().includes(q) || v.plate.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <Layout role="host">
      <div className="container vehicles">
        <div className="vehicles__head">
          <div>
            <h1>Vehicles</h1>
            <p>Manage your fleet, availability, and active status.</p>
          </div>
          <div className="toolbar__right">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search make, model, plate..."
            />
            <TripStatusPopover />
            <ListingStatusPopover
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <button type="button" className="btn btn-primary btn-list" onClick={() => navigate('/host/list/location')}>
              List your car
            </button>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <div className="spinner" style={{ margin: '0 auto 16px', width: 36, height: 36, border: '3px solid #eee', borderTopColor: '#0075ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p>Loading your vehicles...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 16 }}>
            <h3 style={{ marginBottom: 8 }}>No vehicles found</h3>
            <p style={{ color: '#888', marginBottom: 20 }}>
              {search ? 'No vehicles match your search criteria.' : 'You have not listed any vehicles yet.'}
            </p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/host/list/location')}>
              List your first car
            </button>
          </div>
        ) : (
          <div className="veh-grid">
          {filteredList.map((v) => (
            <article className="veh-card" key={v.id}>
              <div className="veh-card__img" onClick={() => navigate(`/host/vehicles/${v.id}/location`)}>
                {v.image ? (
                  <img
                    src={v.image}
                    alt={v.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = img('car1.jpg');
                    }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', minHeight: 180, background: '#f4f6f8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    <span style={{ fontSize: 32, marginBottom: 4 }}>📷</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>No photos uploaded</span>
                  </div>
                )}
              </div>
              <StatusMenu status={v.status} onChange={(s) => handleStatusChange(v.id, s)} />
              <button type="button" className="veh-card__body" onClick={() => navigate(`/host/vehicles/${v.id}/location`)}>
                <h3>{v.name}</h3>
                <p className="veh-card__plate">
                  {v.state} <span>•</span> {v.plate}
                </p>
                <p className="veh-card__foot">
                  <small>Last trip: {v.lastTrip}</small>
                  <span>
                    <b>{v.rating}</b> <FaStar color="#FDB022" /> ({v.trips} trips)
                  </span>
                </p>
              </button>
            </article>
          ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

