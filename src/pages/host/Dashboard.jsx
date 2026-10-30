import { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiUser, FiDollarSign, FiClock, FiMapPin, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { TbArrowsRightLeft, TbHourglass } from 'react-icons/tb';
import { FaStar } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import Layout from '../../components/Layout';
import { DateRangeModal } from '../../components/Search';
import { Modal } from '../../ui';
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
  const carPhoto = booking?.vehicle?.photos?.[0]?.url || thumb;
  const milesIncluded = booking?.pricing?.distanceIncluded ? `${booking.pricing.distanceIncluded} miles` : '800 miles';

  return (
    <button type="button" className="trip-card" onClick={onOpen}>
      <Thumb src={carPhoto} />
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
          {ending && <span className="ending">Status: {booking?.status || 'Active'}</span>}
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

/* Figma: "MacBook Pro 14 - 42" (Booked trip) / "MacBook Pro 14 - 44" (Trip history) drawers */
function TripDrawer({ booking, history, onClose }) {
  const guestName = booking?.guest ? `${booking.guest.firstName || ''} ${booking.guest.lastName || ''}`.trim() : 'Guest';
  const pickupLoc = booking?.pickup?.location || 'Pickup location';
  const dropoffLoc = booking?.dropoff?.location || 'Dropoff location';
  const earnings = booking?.pricing?.total != null ? `$${booking.pricing.total.toFixed(2)}` : '$0.00';
  const pickupDate = booking?.pickup?.dateTime ? new Date(booking.pickup.dateTime) : null;
  const dropoffDate = booking?.dropoff?.dateTime ? new Date(booking.dropoff.dateTime) : null;
  const pickupTime = pickupDate ? pickupDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Flexible';
  const dropoffTime = dropoffDate ? dropoffDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Flexible';
  const pickupClock = pickupDate ? pickupDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '12:00 PM';
  const dropoffClock = dropoffDate ? dropoffDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '12:00 PM';

  const milesIncluded = booking?.pricing?.distanceIncluded ? `${booking.pricing.distanceIncluded} miles` : 'Unlimited miles';
  const milesDriven = booking?.totalMilesDriven != null ? `${booking.totalMilesDriven} miles` : '0 miles';

  // Calculate remaining hours if trip is active
  let hoursLeftText = '';
  if (!history && dropoffDate) {
    const diffHours = Math.round((dropoffDate.getTime() - Date.now()) / (1000 * 60 * 60));
    hoursLeftText = diffHours > 0 ? `This trip ends in ~${diffHours} hours` : 'Trip completed or awaiting return';
  }

  return (
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
          <img src={booking?.guest?.profilePhotoUrl || img('client.jpg')} alt="" />
          <span>
            5.0 <FaStar color="#FDB022" />
          </span>
        </div>
        <div>
          <p>
            {guestName} {booking?.guest?.phone && <a href={`tel:${booking.guest.phone}`}>({booking.guest.phone})</a>}
          </p>
          <p>Reference: {booking?.referenceCode || `#BK-${(booking?._id || '0000').slice(-6).toUpperCase()}`}</p>
          <p>Status: <span style={{ textTransform: 'capitalize' }}>{booking?.status || 'Active'}</span></p>
        </div>
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
          <p>{booking?.cancellationPolicy || 'Standard cancellation policy'}</p>
        </div>
      </div>
      <div className="drawer__box">
        {history ? (
          <>
            <button type="button" className="btn btn-outline btn-block">
              Charge for incidentals
            </button>
            <button type="button" className="btn btn-outline btn-block">
              Report issue
            </button>
            <button type="button" className="btn btn-outline btn-block">
              Report damage
            </button>
          </>
        ) : (
          <>
            {hoursLeftText && <p>{hoursLeftText}</p>}
            <button type="button" className="btn btn-outline btn-block" disabled>
              Report damage
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

/* Figma: "MacBook Pro 14 - 41" (Booked) / "MacBook Pro 14 - 43" (History) */
export function HostTrips({ tab = 'booked' }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [serverBookings, setServerBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = tab === 'history';

  useEffect(() => {
    let active = true;
    setLoading(true);
    const scope = history ? 'previous' : 'current';
    apiRequest(`/bookings?role=host&scope=${scope}`)
      .then((res) => {
        if (!active) return;
        const list = res?.data || [];
        if (Array.isArray(list)) {
          setServerBookings(list);
        }
      })
      .catch((err) => console.warn('Could not fetch host bookings from server:', err.message))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
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
                thumb={b.vehicle?.photos?.[0]?.url || b.vehicle?.photos?.[0] || img('trip-0.jpg')}
                ending={!history}
                onOpen={() => setSelectedBooking(b)}
              />
            ))}
          </div>
        )}
      </div>
      {selectedBooking && <TripDrawer booking={selectedBooking} history={history} onClose={() => setSelectedBooking(null)} />}
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

