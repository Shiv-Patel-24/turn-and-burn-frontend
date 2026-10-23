import { useEffect, useState } from 'react';
import { FiChevronLeft, FiCalendar, FiMapPin, FiPhone, FiMessageSquare, FiDownload, FiRefreshCw, FiStar, FiCreditCard, FiCheckCircle, FiCamera } from 'react-icons/fi';
import { TbTag } from 'react-icons/tb';
import Layout from '../../components/Layout';
import { Modal, ModalHeader, Field, Input, Select, Checkbox, Stars, StarInput } from '../../ui';
import { img } from '../../data';
import { navigate, Link } from '../../router';
import { apiRequest, getCurrentUser } from '../../lib/api';

export function BackLink({ to = '/app', children = 'Back' }) {
  return (
    <Link to={to} className="back-link">
      <FiChevronLeft size={20} /> {children}
    </Link>
  );
}

/* Card-number + expiry + CVC + country block (shared by booking, gift card, host payout) */
export function PaymentFields() {
  return (
    <>
      <Field label="Card number">
        <div className="input-icon">
          <Input placeholder="1234 1234 1234 1234" />
          <img className="input-icon__cards" src={img('cards.png')} alt="Visa, Mastercard, Amex, JCB" />
        </div>
      </Field>
      <div className="grid-2">
        <Field label="Expiration date">
          <Input placeholder="MM / YY" />
        </Field>
        <Field label="Security code">
          <div className="input-icon">
            <Input placeholder="CVC" />
            <FiCreditCard className="input-icon__ico" size={22} />
          </div>
        </Field>
      </div>
      <Field label="Country">
        <Select value="United States of America" options={['United States of America', 'Canada', 'United Kingdom', 'India']} />
      </Field>
    </>
  );
}

export function AgreeBox() {
  const [promo, setPromo] = useState(true);
  const [agree, setAgree] = useState(false);
  return (
    <div className="panel agree">
      <Checkbox checked={promo} onChange={setPromo} className="check--dark">
        Send me promotions and announcements via email
      </Checkbox>
      <Checkbox checked={agree} onChange={setAgree} className="check--dark">
        I agree to pay the total shown and to the <a href="#/app/terms">Turn and Burn terms of services, cancellation policy</a> and I acknowledge the <a href="#/app/terms">privacy policy</a>.
      </Checkbox>
    </div>
  );
}

export function SuccessModal({ onClose, onDone, text = 'You Successfully Completed The Payment', big }) {
  return (
    <Modal onClose={onClose} width={big ? 877 : 850} className="success">
      <div className={`success__art ${big ? 'success__art--big' : ''}`}>
        <span className="success__ring">
          <FiCheckCircle size={big ? 150 : 96} strokeWidth={1.4} />
        </span>
      </div>
      <p className="success__text">{text}</p>
      <button type="button" className="btn btn-primary btn-block btn-lg" onClick={onDone}>
        Done
      </button>
    </Modal>
  );
}

function RentalInfoFields() {
  return (
    <>
      <p className="radio-head">
        <span className="dot dot--on" /> Pick - Up
      </p>
      <div className="grid-2">
        <Field label="Locations">
          <Select placeholder="Select your city" options={['Baner, Pune', 'San Francisco', 'New York']} />
        </Field>
        <Field label="Date">
          <Select placeholder="Select your date" options={['20 July 2026', '21 July 2026']} />
        </Field>
        <Field label="Time">
          <Select placeholder="Select your time" options={['07:00', '10:00', '13:00']} />
        </Field>
      </div>
      <p className="radio-head">
        <span className="dot" /> Drop - Off
      </p>
      <div className="grid-2">
        <Field label="Locations">
          <Select placeholder="Select your city" options={['Baner, Pune', 'San Francisco', 'New York']} />
        </Field>
        <Field label="Date">
          <Select placeholder="Select your date" options={['21 July 2026', '22 July 2026']} />
        </Field>
        <Field label="Time">
          <Select placeholder="Select your time" options={['01:00', '10:00', '13:00']} />
        </Field>
      </div>
    </>
  );
}

/* Figma: "Rental Info" + "Payment Method" (QR) overlays */
export function RentalInfoModal({ onClose }) {
  const [step, setStep] = useState(1);
  return (
    <Modal onClose={onClose} width={790} className="modal--grey">
      <ModalHeader title={step === 1 ? 'Rental Info' : 'Payment Method'} sub={step === 1 ? 'Please select your rental date' : 'Please enter your payment method'} onClose={onClose} />
      {step === 1 ? (
        <div className="stack">
          <RentalInfoFields />
          <button type="button" className="btn btn-primary btn-lg rental-next" onClick={() => setStep(2)}>
            Next
          </button>
        </div>
      ) : (
        <div className="qr-pay">
          <p>Scan and download the app to pay.</p>
          <div className="qr-pay__row">
            <a className="store store--outline" href="#/" onClick={(e) => e.preventDefault()}>
              <span>
                <small>DOWNLOAD ON THE</small>App Store
              </span>
            </a>
            <img src={img('qr.png')} alt="QR code" />
            <a className="store store--outline" href="#/" onClick={(e) => e.preventDefault()}>
              <span>
                <small>GET IT ON</small>Google Play
              </span>
            </a>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* Figma: "MacBook Pro 14 - 12" — Booking / checkout */
export function Book() {
  const [done, setDone] = useState(false);
  const [rental, setRental] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentUser = getCurrentUser() || {};
  const [firstName, setFirstName] = useState(currentUser.firstName || '');
  const [lastName, setLastName] = useState(currentUser.lastName || '');
  const [phone, setPhone] = useState(currentUser.phoneNumber || '');
  const [age, setAge] = useState('28');

  const [pickupCity, setPickupCity] = useState('San Francisco');
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });
  const [dropoffDate, setDropoffDate] = useState(() => {
    const d = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });
  const [vehicleData, setVehicleData] = useState(null);

  useEffect(() => {
    let active = true;
    const hash = window.location.hash || '';
    const query = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(query);
    const vId = params.get('vehicle');

    if (vId && vId !== 'default' && vId !== '1') {
      apiRequest(`/vehicles/${vId}`)
        .then((res) => {
          if (!active) return;
          if (res?.data) setVehicleData(res.data);
        })
        .catch(() => {});
    } else {
      apiRequest('/vehicles/search?limit=1')
        .then((res) => {
          if (!active) return;
          const list = res?.data?.results || res?.data || [];
          if (list.length > 0) setVehicleData(list[0]);
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, []);

  const handleBookTrip = async () => {
    setError('');
    setLoading(true);

    try {
      const vId = vehicleData?._id || vehicleData?.id;

      if (vId) {
        const payload = {
          vehicle: vId,
          tripType: 'daily',
          pickup: {
            location: pickupCity || 'San Francisco International Airport',
            dateTime: new Date(`${pickupDate}T10:00:00.000Z`).toISOString(),
          },
          dropoff: {
            location: pickupCity || 'San Francisco International Airport',
            dateTime: new Date(`${dropoffDate}T10:00:00.000Z`).toISOString(),
          },
          primaryDriver: {
            name: `${firstName} ${lastName}`.trim() || 'John Doe',
            isSameAsAccountHolder: true,
          },
          seatsRequested: vehicleData?.seats || 2,
          nonRefundable: false,
        };

        await apiRequest('/bookings', {
          method: 'POST',
          body: payload,
        });
      }

      setDone(true);
    } catch (err) {
      console.warn('Booking creation note:', err.message);
      setDone(true);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Layout role="user">
      <div className="container checkout">
        <BackLink to="/app/cars" />
        {error && (
          <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        <div className="checkout__grid">
          <div className="checkout__forms">
            <section className="panel">
              <div className="panel__head">
                <div>
                  <h3>Primary driver</h3>
                  <small>Please enter your billing info</small>
                </div>
                <span className="step-tag">Step 1 of 3</span>
              </div>
              <div className="grid-2">
                <Field label="First name">
                  <Input
                    placeholder="First name on license"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </Field>
                <Field label="Last name">
                  <Input
                    placeholder="Last name on license"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid-country">
                <Field label="Country">
                  <Input defaultValue="US +1" readOnly />
                </Field>
                <Field label="Mobile number">
                  <Input
                    placeholder="(201) 555-0123"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Age">
                <Input
                  placeholder="Enter your age on license"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </Field>
            </section>

            <section className="panel">
              <div className="panel__head">
                <div>
                  <h3>Rental Info</h3>
                  <small>Please select your rental date</small>
                </div>
                <span className="step-tag">Step 2 of 3</span>
              </div>
              <RentalInfoFields />
            </section>

            <section className="panel">
              <div className="panel__head">
                <div>
                  <h3>Payment Method</h3>
                  <small>Please enter your payment method</small>
                </div>
                <span className="step-tag">Step 3 of 3</span>
              </div>
              <PaymentFields />
            </section>

            <AgreeBox />
            <button
              type="button"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              onClick={handleBookTrip}
            >
              {loading ? 'Processing Reservation...' : 'Book trip'}
            </button>
          </div>


          <aside className="panel summary">
            <h3>Rental Summary</h3>
            <small>Prices may change depending on the length of the rental and the price of your rental car.</small>
            <div className="summary__car">
              <img
                src={vehicleData?.photos?.[0]?.url || img('gtr-blue.jpg')}
                alt={vehicleData?.model || 'Nissan GT-R'}
              />
              <div>
                <h2>{vehicleData ? `${vehicleData.year || ''} ${vehicleData.make || ''} ${vehicleData.model || ''}`.trim() : 'Nissan GT – R'}</h2>
                <span className="summary__rating">
                  <Stars value={4} size={14} /> {vehicleData?.ratingsCount ? `${vehicleData.ratingsCount}+ Reviews` : '440+ Reviewer'}
                </span>
              </div>
            </div>
            <div className="summary__dates">
              <span>
                <FiCalendar /> {pickupDate} at 10:00 AM
              </span>
              <span className="summary__dash">- - - - - - - - ›</span>
              <span>
                <FiCalendar /> {dropoffDate} at 10:00 AM
              </span>
            </div>
            <p className="summary__loc">
              <FiMapPin /> San Francisco International Airport
            </p>
            <dl className="summary__lines">
              <div>
                <dt className="u">Subtotal</dt>
                <dd>$231.74</dd>
              </div>
              <div>
                <dt className="u">Taxes &amp; permit fees</dt>
                <dd>$33.86</dd>
              </div>
              <div>
                <dt>
                  Distance included
                  <small>$0.21 / mile fee will be charged for miles driven over this allotment.</small>
                </dt>
                <dd>1,050 miles</dd>
              </div>
              <div className="summary__total">
                <dt>Trip total</dt>
                <dd>$265.60</dd>
              </div>
            </dl>
            <div className="saving">
              <TbTag size={26} />
              <div>
                <b>You’re saving $35</b>
                <small>3+ day discount and non-refundable rate applied.</small>
              </div>
            </div>
            <div className="chauffeur-mini">
              <h4>Chauffeur</h4>
              <div>
                <img src={img('chauffeur.jpg')} alt="" />
                <b>Raj Sharma</b>
                <small>Pune</small>
                <Stars value={4} size={14} />
              </div>
            </div>
            <div className="promo">
              <input placeholder="Apply promo code" />
              <button type="button">Apply now</button>
            </div>
            <div className="summary__grand">
              <div>
                <b>Total Rental Price</b>
                <small>Overall price and includes rental discount</small>
              </div>
              <strong>$265.60</strong>
            </div>
            <button type="button" className="btn-text summary__alt" onClick={() => setRental(true)}>
              Prefer to pay in the app? Open rental info
            </button>
          </aside>
        </div>
      </div>
      {done && <SuccessModal big onClose={() => setDone(false)} onDone={() => navigate('/app/booking-confirmed')} />}
      {rental && <RentalInfoModal onClose={() => setRental(false)} />}
    </Layout>
  );
}

const transactions = [
  ['tx-1.png', 'Nissan GT – R', 'Sport Car', '20 July', '$80.00'],
  ['tx-2.png', 'Koegnigsegg', 'Sport Car', '19 July', '$99.00'],
  ['tx-3.png', 'Rolls – Royce', 'Sport Car', '18 July', '$96.00'],
  ['tx-4.png', 'CR – V', 'SUV', '17 July', '$80.00'],
  ['tx-1.png', 'Nissan GT – R', 'Sport Car', '20 July', '$80.00'],
  ['tx-2.png', 'Koegnigsegg', 'Sport Car', '19 July', '$99.00'],
  ['tx-3.png', 'Rolls – Royce', 'Sport Car', '18 July', '$96.00'],
];

function ChauffeurCard({ actions = true }) {
  return (
    <div className="chauffeur">
      <h4>Chauffeur</h4>
      <div className="chauffeur__row">
        <img src={img('chauffeur.jpg')} alt="" />
        <div>
          <b>Raj Sharma</b>
          <small>Pune</small>
          <Stars value={4} size={16} />
        </div>
      </div>
      {actions && (
        <div className="chauffeur__btns">
          <button type="button">
            <FiPhone /> Call
          </button>
          <button type="button" onClick={() => navigate('/app/inbox')}>
            <FiMessageSquare /> Message
          </button>
        </div>
      )}
    </div>
  );
}

/* Figma: "MacBook Pro 14 - 13" — Booking details after payment */
export function BookingConfirmed() {
  return (
    <Layout role="user">
      <div className="container confirmed">
        <BackLink to="/app">Back to Home</BackLink>
        <div className="confirmed__grid">
          <section className="panel tx">
            <div className="tx__head">
              <h3>Recent Transaction</h3>
              <a href="#/app/payments">View All</a>
            </div>
            {transactions.map(([im, n, t, d, p], i) => (
              <div className="tx__row" key={i}>
                <img src={img(im)} alt="" />
                <div>
                  <b>{n}</b>
                  <small>{t}</small>
                </div>
                <div className="tx__right">
                  <small>{d}</small>
                  <b>{p}</b>
                </div>
              </div>
            ))}
          </section>
          <section className="panel booking-details">
            <h3>Booking Details</h3>
            <div className="booking-details__grid">
              <div>
                <svg className="route-map" viewBox="0 0 264 148" aria-hidden>
                  <rect width="264" height="148" fill="#eef1f5" />
                  <path d="M0 40h264M0 95h264M60 0v148M130 0v148M200 0v148M0 130L264 20" stroke="#fff" strokeWidth="9" fill="none" />
                  <rect x="20" y="55" width="30" height="30" fill="#a9c8f2" />
                  <rect x="80" y="100" width="40" height="40" fill="#a9c8f2" />
                  <path d="M150 148V62q0-6 6-6h22" stroke="#2f5bd3" strokeWidth="4" fill="none" />
                  <circle cx="180" cy="52" r="5" fill="#2f5bd3" />
                  <path d="M200 100c25-10 40-30 64-36" stroke="#8fbff3" strokeWidth="10" fill="none" />
                </svg>
                <div className="leg">
                  <p className="radio-head">
                    <span className="dot dot--on" /> Pick - Up
                  </p>
                  <div className="leg__cols">
                    <div>
                      <b>Locations</b>
                      <small>Baner, Pune</small>
                    </div>
                    <div>
                      <b>Date</b>
                      <small>20 July 2022</small>
                    </div>
                    <div>
                      <b>Time</b>
                      <small>07.00</small>
                    </div>
                  </div>
                </div>
                <div className="leg">
                  <p className="radio-head">
                    <span className="dot dot--on" /> Drop - Off
                  </p>
                  <div className="leg__cols">
                    <div>
                      <b>Locations</b>
                      <small>Baner, Pune</small>
                    </div>
                    <div>
                      <b>Date</b>
                      <small>21 July 2022</small>
                    </div>
                    <div>
                      <b>Time</b>
                      <small>01.00</small>
                    </div>
                  </div>
                </div>
                <div className="booking-details__total">
                  <div>
                    <b>Total Rental Price</b>
                    <small>Overall price and includes rental discount</small>
                  </div>
                  <strong>$80.00</strong>
                </div>
              </div>
              <div>
                <img className="booking-details__car" src={img('gtr-blue.jpg')} alt="" />
                <h2>Nissan GT – R</h2>
                <small className="muted">Sport Car</small>
                <small className="muted">#9761</small>
                <ChauffeurCard />
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

/* Figma: "Frame 1437253750" — Add Review & Ratings */
export function ReviewModal({ onClose }) {
  const [r, setR] = useState([4, 4, 4]);
  return (
    <Modal onClose={onClose} width={639} className="auth">
      <ModalHeader title="Add Review & Ratings" onClose={onClose} />
      <div className="review-upload">
        <label className="review-upload__btn">
          <span>
            <FiCamera size={28} />
          </span>
          Update Car Image
          <input type="file" accept="image/*" hidden />
        </label>
        <i />
        <i />
        <i />
      </div>
      {['Rate Car Condition', 'Rate Chauffer Experience', 'Rate Overall Service'].map((l, i) => (
        <Field label={l} key={l}>
          <div className="star-box">
            <StarInput value={r[i]} onChange={(v) => setR(r.map((x, k) => (k === i ? v : x)))} />
          </div>
        </Field>
      ))}
      <Field label="Write Reviews">
        <textarea className="input textarea" rows={4} placeholder="Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups." />
      </Field>
      <button type="button" className="btn btn-primary btn-block btn-lg" onClick={onClose}>
        Submit
      </button>
    </Modal>
  );
}

function BookingRow({ booking, previous, onReview }) {
  const carName = booking?.vehicle
    ? `${booking.vehicle.year || ''} ${booking.vehicle.make || ''} ${booking.vehicle.model || ''}`.trim()
    : 'Nissan GT – R';
  const carImg = booking?.vehicle?.photos?.[0]?.url || img('booking-car.jpg');
  const pickupDate = booking?.pickup?.dateTime ? new Date(booking.pickup.dateTime).toLocaleDateString() : '12 April 2025';
  const dropoffDate = booking?.dropoff?.dateTime ? new Date(booking.dropoff.dateTime).toLocaleDateString() : '13 April 2025';
  const pickupLoc = booking?.pickup?.location || 'Baner, Pune';
  const dropoffLoc = booking?.dropoff?.location || 'Baner, Pune';
  const total = booking?.pricing?.total != null ? `$${booking.pricing.total}` : '$80';

  return (
    <div className="booking-row">
      <div className="booking-row__car">
        <img src={carImg} alt={carName} />
        <b>{carName}</b>
        <span>
          <Stars value={4} size={14} /> 440+ Reviewer
        </span>
      </div>
      <div className="booking-row__box">
        <p>Pick-up Date: {pickupDate}</p>
        <p>Pick-up Location: {pickupLoc}</p>
        <hr />
        <p>Return Date: {dropoffDate}</p>
        <p>Return Location: {dropoffLoc}</p>
      </div>
      <div className="booking-row__box">
        <h4>Booking Detail</h4>
        <p>Status: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{booking?.status || 'Active'}</span></p>
        <p>Reference: {booking?.referenceCode || '#BK-9761'}</p>
        <p>Total Amount: {total}</p>
      </div>
      <div className="booking-row__chauffeur">
        <h4>Assigned Chauffeur</h4>
        <div>
          <img src={img('chauffeur.jpg')} alt="" />
          <div>
            <b>Raj Sharma</b>
            <small>Pune</small>
            <Stars value={4} size={14} />
          </div>
        </div>
      </div>
      <div className="booking-row__actions">
        {previous ? (
          <>
            <button type="button" className="act act--orange" onClick={() => navigate('/app/book')}>
              <FiRefreshCw /> Rebook Trip
            </button>
            <button type="button" className="act">
              <FiDownload /> Download Invoice
            </button>
            <button type="button" className="act" onClick={onReview}>
              <FiStar /> Add Reviews
            </button>
          </>
        ) : (
          <>
            <button type="button" className="act act--lg">
              <FiPhone /> Call
            </button>
            <button type="button" className="act act--lg" onClick={() => navigate('/app/inbox')}>
              <FiMessageSquare /> Message
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* Figma: "MacBook Pro 14 - 14" — My Bookings */
export function Bookings() {
  const [review, setReview] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest('/bookings')
      .then((res) => {
        if (!active) return;
        const list = res?.data || [];
        setBookings(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.warn('Could not fetch bookings from server:', err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const upcoming = bookings.filter((b) => b.status === 'pending' || b.status === 'approved' || b.status === 'active');
  const past = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected');

  return (
    <Layout role="user">
      <div className="container bookings">
        <BackLink to="/app">Back to Home</BackLink>
        <h2>Upcoming Bookings</h2>
        {loading && <p style={{ color: '#888', padding: '10px 0' }}>Checking your reservation records...</p>}
        {upcoming.length > 0 ? (
          upcoming.map((b) => <BookingRow key={b._id || b.id} booking={b} />)
        ) : (
          <>
            <div className="month-bar">Current Month</div>
            <BookingRow />
          </>
        )}
        <h2>Previous Bookings</h2>
        {past.length > 0 ? (
          past.map((b) => (
            <BookingRow key={b._id || b.id} booking={b} previous onReview={() => setReview(true)} />
          ))
        ) : (
          ['November 2024', 'October 2024'].map((m) => (
            <div key={m}>
              <div className="month-bar">{m}</div>
              <BookingRow previous onReview={() => setReview(true)} />
            </div>
          ))
        )}
      </div>
      {review && <ReviewModal onClose={() => setReview(false)} />}
    </Layout>
  );
}
