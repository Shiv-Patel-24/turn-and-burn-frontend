import { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiHeart, FiShare2, FiMapPin, FiClock, FiShield, FiPhone, FiMail, FiCheck, FiCalendar, FiSettings } from 'react-icons/fi';
import { FaStar, FaHeart } from 'react-icons/fa';
import { TbGauge, TbPalette, TbGasStation } from 'react-icons/tb';
import Layout from '../components/Layout';
import { CarCard } from '../components/Cards';
import { img, carAt } from '../data';
import { navigate, useRoute } from '../router';
import { useUI } from '../ui';
import { apiRequest } from '../lib/api';

const defaultGallery = [img('detail-1.jpg'), img('detail-2.jpg'), img('detail-3.jpg')];

const defaultSpecs = [
  [FiSettings, 'Make', 'Toyota'], [FiSettings, 'Model', 'Camry'], [FiCalendar, 'Year', '2019'],
  [TbGauge, 'Mileage', '50,000 mi'], [TbPalette, 'Color', 'Blue'], [TbGasStation, 'Fuel Type', 'Gasoline'],
  [FiSettings, 'Transmission', 'Automatic'], [FiSettings, 'Drive Train', 'FWD'], [FiSettings, 'Body Type', 'Sedan'],
  [FiSettings, 'Engine', '2.5L 4-Cylinder'], [TbPalette, 'Interior', 'Black Leather'], [FiSettings, 'VIN', '4T1B11HK1KU******'],
];

const features = [
  'Backup Camera', 'Blind Spot Monitoring', 'Adaptive Cruise Control', 'Lane Departure Warning', 'Automatic Emergency Braking',
  'Apple CarPlay & Android Auto', 'Bluetooth Connectivity', 'USB Ports', 'Keyless Entry', 'Push Button Start',
  'Dual-Zone Climate Control', 'Power Windows & Locks', 'Leather Seats', 'Heated Front Seats', 'Power Driver Seat', 'LED Headlights',
];

const services = ['Pre-Purchase Inspection Available', 'Vehicle History Report Included', 'Extended Warranty Options', 'Financing Available', 'Trade-In Accepted', 'Home Delivery Available'];

const reviews = [
  ['SJ', 'Sarah Johnson', 'March 15, 2026', 5, 'Excellent seller! The car was exactly as described. Very smooth transaction and the seller was very helpful throughout the process. Highly recommend!'],
  ['MC', 'Michael Chen', 'March 10, 2026', 5, 'Great experience buying from this seller. The vehicle was in pristine condition and all the paperwork was ready. Would definitely buy from again.'],
  ['ER', 'Emily Rodriguez', 'March 5, 2026', 4, 'Good car and fair price. Minor delay in scheduling the viewing but overall a positive experience. The car runs great!'],
  ['DK', 'David Kim', 'February 28, 2026', 5, 'Very professional seller. Provided all service records and was transparent about the vehicle history. The car is amazing!'],
];

/* Figma: "MacBook Pro 14 - 5" (guest) / "MacBook Pro 14 - 8" (logged in) */
export default function CarDetail({ role = 'guest' }) {
  const { open } = useUI();
  const route = useRoute();
  const carId = route?.params?.id;
  const [vehicle, setVehicle] = useState(null);
  const [vehicleReviews, setVehicleReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [idx, setIdx] = useState(0);
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const isUser = role === 'user';
  const guard = (fn) => () => (isUser ? fn() : open('signup'));

  useEffect(() => {
    if (!carId) return;
    let active = true;
    setLoading(true);

    apiRequest(`/vehicles/${carId}`)
      .then((res) => {
        if (!active) return;
        setVehicle(res?.data || null);
        if (res?.data?.isFavorite) setFav(true);
      })
      .catch((err) => {
        console.warn('Could not load vehicle from API:', err.message);
        // Fallback: search vehicles array
        apiRequest('/vehicles/search')
          .then((res) => {
            if (!active) return;
            const list = res?.data?.results || res?.data || [];
            const found = list.find((v) => String(v._id) === String(carId) || String(v.id) === String(carId));
            if (found) setVehicle(found);
          })
          .catch(() => {});
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Fetch live reviews and summary
    apiRequest(`/reviews/vehicle/${carId}`)
      .then((res) => {
        if (!active) return;
        const list = res?.data?.reviews || [];
        if (Array.isArray(list) && list.length > 0) setVehicleReviews(list);
      })
      .catch(() => {});

    apiRequest(`/reviews/vehicle/${carId}/summary`)
      .then((res) => {
        if (!active) return;
        if (res?.data) setReviewSummary(res.data);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [carId]);

  if (loading && !vehicle) {
    return (
      <Layout role={role}>
        <div className="container" style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="spinner" style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTopColor: 'var(--blue, #2d55fb)', borderRadius: '50%', marginBottom: 16 }} />
          <p style={{ color: '#64748b', fontSize: 16, fontWeight: 500 }}>Loading vehicle details...</p>
        </div>
      </Layout>
    );
  }

  const carName = vehicle
    ? `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim()
    : 'Vehicle Details';
  const carPrice = vehicle?.pricing?.dailyRate
    ? `$${vehicle.pricing.dailyRate.toFixed(2)}`
    : '$78.90';
  const gallery = (vehicle?.photos && vehicle.photos.length > 0)
    ? vehicle.photos.map((p) => p.url)
    : defaultGallery;

  const currentSpecs = vehicle ? [
    [FiSettings, 'Make', vehicle.make || 'N/A'],
    [FiSettings, 'Model', vehicle.model || 'N/A'],
    [FiCalendar, 'Year', String(vehicle.year || 'N/A')],
    [TbGauge, 'Mileage', vehicle.odometer ? `${vehicle.odometer.toLocaleString()} mi` : '50,000 mi'],
    [TbPalette, 'Color', vehicle.color || 'Blue'],
    [TbGasStation, 'Fuel Type', vehicle.fuelType || 'Gasoline'],
    [FiSettings, 'Transmission', vehicle.transmission || 'Automatic'],
    [FiSettings, 'Drive Train', vehicle.driveTrain || 'FWD'],
    [FiSettings, 'Body Type', vehicle.style || 'Sedan'],
    [FiSettings, 'Engine', vehicle.engine || '2.5L 4-Cylinder'],
    [TbPalette, 'Interior', vehicle.interior || 'Black Leather'],
    [FiSettings, 'VIN', vehicle.vin ? `${vehicle.vin.slice(0, 8)}******` : '4T1B11HK1KU******'],
  ] : defaultSpecs;

  return (
    <Layout role={role}>
      <div className="container detail">
        <div className="detail__main">
          <div className="card gallery">
            <div className="gallery__stage">
              <img src={gallery[idx] || defaultGallery[0]} alt={carName} />
              <button type="button" className="gallery__nav gallery__nav--l" aria-label="Previous" onClick={() => setIdx((idx + gallery.length - 1) % gallery.length)}>
                <FiChevronLeft size={20} />
              </button>
              <button type="button" className="gallery__nav gallery__nav--r" aria-label="Next" onClick={() => setIdx((idx + 1) % gallery.length)}>
                <FiChevronRight size={20} />
              </button>
              <span className="gallery__count">{idx + 1} / {gallery.length}</span>
            </div>
            <div className="gallery__thumbs">
              {gallery.map((g, i) => (
                <button type="button" key={g || i} className={i === idx ? 'is-active' : ''} onClick={() => setIdx(i)}>
                  <img src={g} alt="" />
                </button>
              ))}
            </div>
          </div>

          <div className="card detail__title">
            <div className="detail__title-row">
              <h1>{carName}</h1>
              <div className="detail__icons">
                <button type="button" aria-label="Save" onClick={() => setFav(!fav)}>
                  {fav ? <FaHeart color="#ef4444" /> : <FiHeart />}
                </button>
                <button type="button" aria-label="Share">
                  <FiShare2 />
                </button>
              </div>
            </div>
            <p className="detail__meta">
              <span>
                <FiMapPin /> {vehicle?.location?.city ? `${vehicle.location.city}, ${vehicle.location.state || ''}` : 'Charlotte, NC'}
              </span>
              <span>
                <TbGauge /> {vehicle?.odometer ? `${vehicle.odometer.toLocaleString()} miles` : '50,000 miles'}
              </span>
              <span>
                <FaStar color="#FDB022" /> Good condition
              </span>
            </p>
            <div className="detail__price-row">
              <div>
                <small>Price</small>
                <strong>{carPrice}</strong>
              </div>
              <div className="detail__ctas">
                <button type="button" className="btn btn-outline-primary" onClick={guard(() => navigate('/app/inbox'))}>
                  Contact Seller
                </button>
                <button type="button" className="btn btn-primary" onClick={guard(() => navigate(`/app/book?vehicle=${carId || vehicle?._id || ''}`))}>
                  Rent The Car
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card__title">Vehicle Specifications</h2>
            <div className="spec-grid">
              {currentSpecs.map(([I, k, v]) => (
                <div className="spec" key={k}>
                  <span>
                    <I />
                  </span>
                  <div>
                    <small>{k}</small>
                    <b>{v}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="card__title">Included Features</h2>
            <ul className="check-list check-list--blue">
              {features.map((f) => (
                <li key={f}>
                  <FiCheck /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2 className="card__title">Available Services</h2>
            <ul className="check-list check-list--green">
              {services.map((f) => (
                <li key={f}>
                  <FiCheck /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2 className="card__title">Seller's Notes</h2>
            <p className="detail__notes">
              This 2019 Toyota Camry is in excellent condition with only 50,000 miles. It has been regularly maintained and comes with a full service history. The car has never been in an accident and has a clean title. Features include a backup camera, blind spot monitoring, adaptive cruise control, and much more. The interior is pristine with no signs of wear. This is a one-owner vehicle that has been garage-kept. Perfect for someone looking for a reliable, fuel-efficient sedan with modern safety features.
            </p>
          </div>

          <div className="card">
            <h2 className="card__title">Seller Ratings &amp; Reviews</h2>
            <div className="rating-summary">
              <div className="rating-summary__score">
                <strong>{reviewSummary?.average || vehicle?.ratingsAverage || '4.89'}</strong>
                <span className="stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar key={s} color="#FDB022" />
                  ))}
                </span>
                <small>{reviewSummary?.total || vehicle?.ratingsCount || '168'} reviews</small>
              </div>
              <div className="rating-bars">
                {[
                  ['5 star', reviewSummary?.distribution?.[5] || 142, 85],
                  ['4 star', reviewSummary?.distribution?.[4] || 18, 10],
                  ['3 star', reviewSummary?.distribution?.[3] || 5, 3],
                  ['2 star', reviewSummary?.distribution?.[2] || 2, 1],
                  ['1 star', reviewSummary?.distribution?.[1] || 1, 1],
                ].map(([l, n, p]) => (
                  <div key={l}>
                    <span>{l}</span>
                    <i>
                      <b style={{ width: `${p}%` }} />
                    </i>
                    <span>{n}</span>
                  </div>
                ))}
              </div>
            </div>
            {(vehicleReviews.length > 0 ? vehicleReviews.map((r) => [
              (r.reviewer?.firstName?.[0] || 'U') + (r.reviewer?.lastName?.[0] || ''),
              `${r.reviewer?.firstName || 'Guest'} ${r.reviewer?.lastName || ''}`.trim(),
              new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              r.overallRating || 5,
              r.comment || 'Smooth rental experience.'
            ]) : reviews).map(([ini, name, date, stars, text]) => (
              <div className="review" key={name}>
                <span className="review__ini">{ini}</span>
                <div>
                  <div className="review__top">
                    <div>
                      <b>{name}</b>
                      <small>{date}</small>
                    </div>
                    <span className="stars-row">
                      {Array.from({ length: Math.round(stars) }).map((_, s) => (
                        <FaStar key={s} color="#FDB022" />
                      ))}
                    </span>
                  </div>
                  <p>{text}</p>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-block">
              View All Reviews
            </button>
          </div>
        </div>

        <aside className="detail__side">
          <div className="card seller">
            <div className="seller__head">
              <span className="seller__ini">JD</span>
              <div>
                <b>John Doe</b>
                <small>Private Seller</small>
                <span className="seller__rating">
                  <FaStar color="#FDB022" /> <b>4.9</b>
                  <small>(23 reviews)</small>
                </span>
              </div>
            </div>
            <ul className="seller__facts">
              <li>
                <FiMapPin /> Member since March 2024
              </li>
              <li>
                <FiClock /> Usually responds in 2 hours
              </li>
              <li>
                <FiShield /> Verified seller
              </li>
            </ul>
            <button type="button" className="btn btn-primary btn-block" onClick={guard(() => navigate('/app/inbox'))}>
              Message Seller
            </button>
            <button type="button" className="btn btn-outline btn-block" onClick={guard(() => {})}>
              Call Seller
            </button>
            <div className="seller__listings">
              <small>Seller's other listings</small>
              <div>
                <span>3 active listings</span>
                <a href="#/" onClick={(e) => e.preventDefault()}>
                  View all →
                </a>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card__title card__title--sm">Vehicle Highlights</h3>
            <ul className="highlights">
              {['Clean Title', 'One Owner', 'No Accidents', 'Service Records'].map((h) => (
                <li key={h}>
                  <span>
                    <FiCheck />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="card payment-card">
            <h3>Estimated Payment</h3>
            <strong>$320/mo</strong>
            <p>Based on 72 months at 6.5% APR with $2,000 down</p>
            <button type="button" className="btn btn-white btn-block" onClick={guard(() => {})}>
              Get Pre-Approved
            </button>
          </div>

          <div className="card">
            <h3 className="card__title card__title--sm">Need Help?</h3>
            <div className="help-item">
              <FiPhone />
              <div>
                <b>Call Us</b>
                <small>(555) 123-4567</small>
              </div>
            </div>
            <div className="help-item">
              <FiMail />
              <div>
                <b>Email Support</b>
                <small>Response in 24h</small>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="pickup-map">
        <img src={img('map-wide.jpg')} alt="Map" />
        <div className="container">
          <div className="pickup-map__card">
            <div>
              <small>PICKUP AT CAR LOCATION</small>
              <p>Henderson, NV 89011</p>
            </div>
            <div>
              <small>PICKUP LOCATIONS</small>
              <p>Harry Reid International Airport</p>
            </div>
            <div>
              <small>BRING THE CAR TO ME</small>
              <p>Up to 25 miles</p>
            </div>
          </div>
        </div>
      </section>

      <section className="similar">
        <div className="container">
          <h2>Similar Vehicles You May Like</h2>
        </div>
        <div className="car-row__track">
          {[2, 1, 0, 3, 4, 5].map((i) => (
            <CarCard key={i} car={carAt(i)} onRent={guard(() => navigate('/app/book'))} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

