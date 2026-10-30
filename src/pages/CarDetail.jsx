import { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiHeart, FiShare2, FiMapPin, FiClock, FiShield, FiPhone, FiMail, FiCheck, FiCalendar, FiSettings } from 'react-icons/fi';
import { FaStar, FaHeart } from 'react-icons/fa';
import { TbGauge, TbPalette, TbGasStation } from 'react-icons/tb';
import Layout from '../components/Layout';
import { CarCard } from '../components/Cards';
import { img, carAt, cars, formatVehicle } from '../data';
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
  const [similarVehicles, setSimilarVehicles] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [hostListingsCount, setHostListingsCount] = useState(null);
  const isUser = role === 'user';
  const guard = (fn) => () => (isUser ? fn() : open('signup'));

  useEffect(() => {
    if (!carId) return;
    let active = true;
    setLoading(true);

    apiRequest(`/vehicles/${carId}`)
      .then((res) => {
        if (!active) return;
        const v = res?.data || null;
        setVehicle(v);
        if (v?.isFavorite) setFav(true);

        const hostId = v?.host?._id || (typeof v?.host === 'string' ? v?.host : null);
        if (hostId) {
          apiRequest(`/vehicles/host/${hostId}/listings`)
            .then((hRes) => {
              if (!active) return;
              const count = Array.isArray(hRes?.data) ? hRes.data.length : (hRes?.data?.length || 1);
              setHostListingsCount(count);
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        console.warn('Could not load vehicle from API:', err.message);
        // Fallback: check local cars catalogue first (e.g., id 3 = Audi A8 L)
        const localMatch = cars.find((c) => String(c.id) === String(carId));
        if (localMatch && active) {
          setVehicle(localMatch);
        }

        // Also search vehicles array from API if possible
        apiRequest('/vehicles/search')
          .then((res) => {
            if (!active) return;
            const list = res?.data?.results || res?.data || [];
            const found = list.find((v) => String(v._id) === String(carId) || String(v.id) === String(carId));
            if (found) {
              setVehicle(found);
              const hostId = found?.host?._id || (typeof found?.host === 'string' ? found?.host : null);
              if (hostId) {
                apiRequest(`/vehicles/host/${hostId}/listings`)
                  .then((hRes) => {
                    if (!active) return;
                    const count = Array.isArray(hRes?.data) ? hRes.data.length : (hRes?.data?.length || 1);
                    setHostListingsCount(count);
                  })
                  .catch(() => {});
              }
            }
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
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.reviews)
          ? res.data.reviews
          : [];
        if (list.length > 0) setVehicleReviews(list);
      })
      .catch(() => {});

    apiRequest(`/reviews/vehicle/${carId}/summary`)
      .then((res) => {
        if (!active) return;
        if (res?.data) {
          const s = res.data;
          setReviewSummary({
            ...s,
            averageRating: s.average != null ? s.average : s.averageRating,
            totalReviews: s.count != null ? s.count : s.totalReviews,
            total: s.count != null ? s.count : s.total,
          });
        }
      })
      .catch(() => {});

    // Fetch dynamic similar vehicles
    setSimilarLoading(true);
    apiRequest(`/vehicles/${carId}/similar`)
      .then((res) => {
        if (!active) return;
        const list = res?.data || [];
        setSimilarVehicles(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (active) setSimilarVehicles([]);
      })
      .finally(() => {
        if (active) setSimilarLoading(false);
      });

    return () => {
      active = false;
    };
  }, [carId]);

  const handleStartConversation = async () => {
    const hostId = vehicle?.host?._id || (typeof vehicle?.host === 'string' ? vehicle?.host : null);
    if (!hostId) {
      navigate('/app/inbox');
      return;
    }
    try {
      await apiRequest('/messages/conversations', {
        method: 'POST',
        body: {
          recipientId: hostId,
          vehicleId: vehicle?._id || carId,
          text: `Hi! I'm interested in renting your ${vehicle?.year || ''} ${vehicle?.make || ''} ${vehicle?.model || ''}. Is it available?`,
        },
      });
    } catch (err) {
      console.warn('Start conversation notice:', err.message);
    } finally {
      navigate('/app/inbox');
    }
  };

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

  // Dynamic monthly rental rate calculation (Option A)
  const dailyRateNum = typeof vehicle?.pricing?.dailyRate === 'number'
    ? vehicle.pricing.dailyRate
    : (typeof vehicle?.price === 'number' ? vehicle.price : 60);
  const monthlyDiscount = typeof vehicle?.pricing?.monthlyDiscountPercent === 'number' && vehicle.pricing.monthlyDiscountPercent > 0
    ? vehicle.pricing.monthlyDiscountPercent
    : (typeof vehicle?.pricing?.weeklyDiscountPercent === 'number' && vehicle.pricing.weeklyDiscountPercent > 0
      ? vehicle.pricing.weeklyDiscountPercent
      : 15); // Standard 15% long-term discount if not configured
  const monthlyRate = Math.round(dailyRateNum * 30 * (1 - monthlyDiscount / 100));
  const gallery = (vehicle?.photos && vehicle.photos.length > 0)
    ? vehicle.photos.map((p) => (typeof p === 'string' ? p : p?.url)).filter(Boolean)
    : [];

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

  // Dynamic host/seller details
  const host = (vehicle?.host && typeof vehicle.host === 'object') ? vehicle.host : null;
  const hostName = host
    ? `${host.firstName || ''} ${host.lastName || ''}`.trim() || 'Verified Host'
    : 'Verified Host';
  const hostInitials = host
    ? `${(host.firstName?.[0] || 'V')}${(host.lastName?.[0] || 'H')}`.toUpperCase()
    : 'VH';
  const hostPhoto = host?.profilePhotoUrl || null;
  const hostMemberSince = host?.createdAt
    ? `Member since ${new Date(host.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    : 'Member since March 2024';
  const hostRating = reviewSummary?.averageRating
    ? Number(reviewSummary.averageRating).toFixed(1)
    : (vehicle?.rating ? Number(vehicle.rating).toFixed(1) : '4.9');
  const hostReviewsCount = reviewSummary?.totalReviews !== undefined
    ? reviewSummary.totalReviews
    : (vehicleReviews?.length || 23);
  const hostListingsText = hostListingsCount !== null
    ? `${hostListingsCount} active listing${hostListingsCount === 1 ? '' : 's'}`
    : '3 active listings';

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
                <button
                  type="button"
                  aria-label="Save"
                  onClick={async () => {
                    const token = localStorage.getItem('turn_and_burn_access_token');
                    if (!token || !isUser) {
                      open('signup');
                      return;
                    }
                    const targetId = vehicle?._id || vehicle?.id || carId;
                    if (!targetId) return;
                    const nextFav = !fav;
                    setFav(nextFav);
                    try {
                      if (nextFav) {
                        await apiRequest(`/vehicles/${targetId}/favorite`, { method: 'POST' });
                      } else {
                        await apiRequest(`/vehicles/${targetId}/favorite`, { method: 'DELETE' });
                      }
                    } catch (err) {
                      setFav(!nextFav);
                      console.warn('Could not update favorite status:', err.message);
                    }
                  }}
                >
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
                <button type="button" className="btn btn-outline-primary" onClick={guard(handleStartConversation)}>
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
              {vehicle?.description || `This ${carName} is in excellent condition with only ${vehicle?.odometer ? `${vehicle.odometer.toLocaleString()} miles` : 'low mileage'}. It has been regularly maintained and comes with a full service history. The car has never been in an accident and has a clean title. Features include backup camera, Bluetooth connectivity, adaptive cruise control, and much more. The interior is pristine with no signs of wear. Perfect for someone looking for a reliable, fuel-efficient vehicle.`}
            </p>
          </div>

          <div className="card">
            <h2 className="card__title">Seller Ratings &amp; Reviews</h2>
            <div className="rating-summary">
              <div className="rating-summary__score">
                <strong>{reviewSummary?.average != null ? Number(reviewSummary.average).toFixed(1) : (vehicle?.ratingsAverage != null ? Number(vehicle.ratingsAverage).toFixed(1) : '5.0')}</strong>
                <span className="stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar key={s} color={s <= Math.round(reviewSummary?.average || vehicle?.ratingsAverage || 5) ? '#FDB022' : '#E2E8F0'} />
                  ))}
                </span>
                <small>{reviewSummary?.total != null ? reviewSummary.total : (vehicle?.ratingsCount != null ? vehicle.ratingsCount : vehicleReviews.length)} reviews</small>
              </div>
              <div className="rating-bars">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewSummary?.distribution?.[star] || 0;
                  const total = reviewSummary?.total || vehicleReviews.length || 1;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={star}>
                      <span>{star} star</span>
                      <i>
                        <b style={{ width: `${pct}%` }} />
                      </i>
                      <span>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {vehicleReviews.length > 0 ? (
              vehicleReviews.map((r) => {
                const name = `${r.reviewer?.firstName || 'Guest'} ${r.reviewer?.lastName || ''}`.trim();
                const ini = ((r.reviewer?.firstName?.[0] || 'G') + (r.reviewer?.lastName?.[0] || '')).toUpperCase();
                const date = r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : 'Recent';
                const stars = Math.round(r.overallRating || 5);
                return (
                  <div className="review" key={r._id || r.id || name}>
                    <span className="review__ini">{ini}</span>
                    <div>
                      <div className="review__top">
                        <div>
                          <b>{name}</b>
                          <small>{date}</small>
                        </div>
                        <span className="stars-row">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FaStar key={s} color={s <= stars ? '#FDB022' : '#E2E8F0'} />
                          ))}
                        </span>
                      </div>
                      <p>{r.comment || 'Smooth rental experience.'}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#64748b', fontSize: '14px', padding: '16px 0', textAlign: 'center' }}>
                No reviews yet for this vehicle. Be the first to leave a review after your trip!
              </p>
            )}
            <button type="button" className="btn btn-outline btn-block">
              View All Reviews
            </button>
          </div>
        </div>

        <aside className="detail__side">
          <div className="card seller">
            <div className="seller__head">
              {hostPhoto ? (
                <img
                  src={hostPhoto}
                  alt={hostName}
                  className="seller__ini"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <span className="seller__ini">{hostInitials}</span>
              )}
              <div>
                <b>{hostName}</b>
                <small>Verified Host</small>
                <span className="seller__rating">
                  <FaStar color="#FDB022" /> <b>{hostRating}</b>
                  <small>({hostReviewsCount} reviews)</small>
                </span>
              </div>
            </div>
            <ul className="seller__facts">
              <li>
                <FiMapPin /> {hostMemberSince}
              </li>
              <li>
                <FiClock /> Usually responds in 2 hours
              </li>
              <li>
                <FiShield /> Verified host
              </li>
            </ul>
            <button type="button" className="btn btn-primary btn-block" onClick={guard(handleStartConversation)}>
              Message Seller
            </button>
            <button type="button" className="btn btn-outline btn-block" onClick={guard(() => {})}>
              Call Seller
            </button>
            <div className="seller__listings">
              <small>Seller's other listings</small>
              <div>
                <span>{hostListingsText}</span>
                <a href="#/cars" onClick={(e) => { e.preventDefault(); navigate('/cars'); }}>
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
            <h3>Monthly Rental Rate</h3>
            <strong>${monthlyRate.toLocaleString()}/mo</strong>
            <p>Based on a 30-day extended rental with a {monthlyDiscount}% long-term discount applied</p>
            <button
              type="button"
              className="btn btn-white btn-block"
              onClick={guard(() => navigate(`/app/book?vehicle=${carId || vehicle?._id || ''}`))}
            >
              Book Monthly Trip
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
          {similarLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                className="car-card-skeleton"
                key={idx}
                style={{ width: '300px', flex: 'none' }}
              >
                <div className="skeleton-thumb skeleton-shimmer" />
                <div className="skeleton-title skeleton-shimmer" />
                <div className="skeleton-price skeleton-shimmer" />
                <div className="skeleton-specs">
                  <div className="skeleton-spec-item skeleton-shimmer" />
                  <div className="skeleton-spec-item skeleton-shimmer" />
                  <div className="skeleton-spec-item skeleton-shimmer" />
                  <div className="skeleton-spec-item skeleton-shimmer" />
                </div>
                <div className="skeleton-btn skeleton-shimmer" />
              </div>
            ))
          ) : similarVehicles.length > 0 ? (
            similarVehicles.map((v, i) => {
              const formatted = formatVehicle(v, i);
              return (
                <CarCard
                  key={v._id || v.id || i}
                  car={formatted}
                  onRent={guard(() => navigate(`/app/book?vehicle=${v._id || v.id || ''}`))}
                  onToggleFavorite={async (item, nextLiked) => {
                    const token = localStorage.getItem('turn_and_burn_access_token');
                    if (!token || !isUser) {
                      open('signup');
                      return;
                    }
                    const tId = item?._id || item?.id;
                    if (!tId) return;
                    if (nextLiked) {
                      await apiRequest(`/vehicles/${tId}/favorite`, { method: 'POST' });
                    } else {
                      await apiRequest(`/vehicles/${tId}/favorite`, { method: 'DELETE' });
                    }
                    setSimilarVehicles((prev) =>
                      prev.map((sv) =>
                        String(sv._id || sv.id) === String(tId)
                          ? { ...sv, isFavorite: nextLiked }
                          : sv
                      )
                    );
                  }}
                />
              );
            })
          ) : (
            <div style={{ padding: '24px', color: '#64748b' }}>
              <p>No other similar vehicles found at this time.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

