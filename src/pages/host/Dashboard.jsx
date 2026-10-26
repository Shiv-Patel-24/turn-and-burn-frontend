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

function MonthNav({ onOpen }) {
  return (
    <div className="month-nav">
      <button type="button" aria-label="Previous month">
        <FiChevronLeft size={24} strokeWidth={2.5} />
      </button>
      <button type="button" className="month-nav__label" onClick={onOpen}>
        May, 2026
      </button>
      <button type="button" aria-label="Next month">
        <FiChevronRight size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
}

/* Figma: "MacBook Pro 14 - 40" — Host calendar */
export function HostCalendar() {
  const [cal, setCal] = useState(false);
  const bookings = {
    0: [
      ['Alfonso Donin', '1 E 2nd St, New York, NY 10003, USA', '$225.00', 'Total: 24 hours'],
      ['Cooper Dorwart', '75 3rd Ave, New York, NY 10003, USA', '$225.00', 'Total: 25 hours'],
    ],
    2: [['Cristofer George', '40 E 7th St, New York, NY 10003, USA', '$200.00', 'Total: 20 hours']],
  };
  const hours = [49, 0, 20, 0, 0, 0, 0, 0];
  const revenue = ['$450.00', '$0.00', '$200.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00'];
  return (
    <Layout role="host">
      <div className="container host-cal">
        <div className="toolbar">
          <MonthNav onOpen={() => setCal(true)} />
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
                <th>Mon 4/14</th>
                <th>Tue 4/15</th>
                <th>Wed 4/16</th>
                <th>Thu 4/17</th>
                <th className="w-hours">Weekly Hours</th>
                <th className="w-rev">Weekly Revenue</th>
              </tr>
            </thead>
            <tbody>
              {fleetThumbs.map((t, r) => (
                <tr key={r}>
                  <td className="cal-table__car">
                    <Thumb src={t} small />
                  </td>
                  {[0, 1, 2, 3].map((d) => {
                    const b = bookings[r] && bookings[r][d];
                    return (
                      <td key={d}>
                        {b ? (
                          <div className="slot">
                            <div className="slot__box">
                              <b>{b[0]}</b>
                              <small>{b[1]}</small>
                              <small className="muted">{b[2]}</small>
                            </div>
                            <span className="slot__total">{b[3]}</span>
                          </div>
                        ) : (
                          <span className="dash">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="w-hours">{hours[r]}</td>
                  <td className="w-rev">{revenue[r]}</td>
                </tr>
              ))}
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
  const guestName = booking?.guest ? `${booking.guest.firstName || ''} ${booking.guest.lastName || ''}`.trim() : 'Marcus Dorwart';
  const pickupLoc = booking?.pickup?.location || '47 W 13th St, New York, NY 10011, USA';
  const dropoffLoc = booking?.dropoff?.location || '70 Washington Square South, New York, NY 10012, United States';
  const earnings = booking?.pricing?.total != null ? `$${booking.pricing.total.toFixed(2)}` : '$225.00';
  const duration = booking?.pricing?.numberOfHours ? `${booking.pricing.numberOfHours} hours` : '24 hours';
  const carPhoto = booking?.vehicle?.photos?.[0]?.url || thumb;

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
          <b>800 miles</b>
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
  const guestName = booking?.guest ? `${booking.guest.firstName || ''} ${booking.guest.lastName || ''}`.trim() : 'Desirae Carder';
  const pickupLoc = booking?.pickup?.location || '47 W 13th St, New York, NY 10011, USA';
  const dropoffLoc = booking?.dropoff?.location || '70 Washington Square South, New York, NY 10012, United States';
  const earnings = booking?.pricing?.total != null ? `$${booking.pricing.total.toFixed(2)}` : '$225.00';
  const pickupTime = booking?.pickup?.dateTime ? new Date(booking.pickup.dateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Mon, Jul 6';
  const dropoffTime = booking?.dropoff?.dateTime ? new Date(booking.dropoff.dateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Tue, Jul 7';

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
            {guestName} <a href="tel:+15242352369">(+1 524-235-2369)</a>
          </p>
          <p>Reference: {booking?.referenceCode || '#BK-9761'}</p>
          <p>Status: <span style={{ textTransform: 'capitalize' }}>{booking?.status || 'Active'}</span></p>
          <p>Joined Mar 2025</p>
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
          <small>5:00 PM</small>
        </div>
        <FiArrowRight size={40} strokeWidth={1.4} />
        <div>
          <b>{dropoffTime}</b>
          <small>5:00 PM</small>
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
          <p>800 miles</p>
        </div>
        <div>
          <h4>TOTAL MILES DRIVEN</h4>
          <p>{history ? '800 miles' : '669 miles'}</p>
        </div>
        <div>
          <h4>TOTAL EARNINGS</h4>
          <p>{earnings}</p>
        </div>
        <div>
          <h4>CANCELATION POLICY</h4>
          <p>Non-refundable trip</p>
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
            <p>This trip ends in 17 hours</p>
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

  const defaultGroups = history
    ? [
        ['Monday, July 6, 2026', tripThumbs.slice(0, 5)],
        ['Sunday, July 5, 2026', tripThumbs.slice(5)],
      ]
    : [['Monday, July 6, 2026', [img('trip-0.jpg')]]];

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
        {serverBookings.length > 0 ? (
          <div>
            <h2 className="trips__day">{history ? 'Completed Trips' : 'Active Reservations'}</h2>
            {serverBookings.map((b) => (
              <TripCard
                key={b._id || b.id}
                booking={b}
                thumb={b.vehicle?.photos?.[0]?.url || img('trip-0.jpg')}
                ending={!history}
                onOpen={() => setSelectedBooking(b)}
              />
            ))}
          </div>
        ) : (
          defaultGroups.map(([day, list]) => (
            <div key={day}>
              <h2 className="trips__day">{day}</h2>
              {list.map((t, i) => (
                <TripCard key={i} thumb={t} ending={!history} onOpen={() => setSelectedBooking({})} />
              ))}
            </div>
          ))
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

  useEffect(() => {
    let active = true;
    apiRequest('/vehicles')
      .then((res) => {
        if (!active) return;
        const vehicles = res?.data || [];
        if (Array.isArray(vehicles) && vehicles.length > 0) {
          const mapped = vehicles.map((v, i) => ({
            id: v._id || v.id || i + 1,
            name: `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim() || 'Vehicle',
            image: v.photos?.[0]?.url || '',
            plate: v.licensePlate || 'POR1234',
            state: v.licensePlateState || v.location?.state || 'NC',
            status: v.listingStatus === 'listed' ? 'Listed' : v.listingStatus === 'snoozed' ? 'Snoozed' : 'Unlisted',
            lastTrip: 'Active',
            rating: v.ratingsAverage || 5.0,
            trips: v.ratingsCount || 0,
            raw: v,
          }));
          setList(mapped);
        } else if (Array.isArray(vehicles) && vehicles.length === 0) {
          setList([]);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch host vehicles from server:', err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

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

  return (
    <Layout role="host">
      <div className="container vehicles">
        <div className="vehicles__head">
          <div>
            <h1>Vehicles</h1>
            <p>Manage your fleet, availability, and active status.</p>
          </div>
          <div className="toolbar__right">
            <SearchField />
            <TripStatusPopover />
            <ListingStatusPopover />
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
        ) : list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 16 }}>
            <h3 style={{ marginBottom: 8 }}>No vehicles found</h3>
            <p style={{ color: '#888', marginBottom: 20 }}>You have not listed any vehicles yet.</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/host/list/location')}>
              List your first car
            </button>
          </div>
        ) : (
          <div className="veh-grid">
          {list.map((v) => (
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

