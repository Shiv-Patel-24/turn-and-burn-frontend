import { useEffect, useRef, useState } from 'react';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { TbGauge, TbManualGearbox, TbUsers, TbGasStation } from 'react-icons/tb';
import { img } from '../data';
import { apiRequest } from '../lib/api';

/* Car card — Figma "Component 6..17 / 20..34" */
export function CarCard({ car, onRent, liked: likedInit = false, size = 'lg', onToggleFavorite }) {
  const [liked, setLiked] = useState(likedInit);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLiked(Boolean(car?.isFavorite || likedInit));
  }, [car?.isFavorite, likedInit]);

  const handleFavClick = async (e) => {
    e.stopPropagation();
    if (busy) return;

    const prevState = liked;
    const nextState = !prevState;
    setLiked(nextState);

    if (!onToggleFavorite) return;

    setBusy(true);
    try {
      await onToggleFavorite(car, nextState);
    } catch (err) {
      setLiked(prevState);
      console.warn('Could not update favorite state:', err?.message || err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={`car-card car-card--${size}`}>
      <div className="car-card__img">
        <img src={car.image} alt={car.name} loading="lazy" />
        <button
          type="button"
          className={`car-card__fav ${liked ? 'is-liked' : ''}`}
          aria-label="Favorite"
          onClick={handleFavClick}
        >
          {liked ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>
      <div className="car-card__body">
        <h3>{car.name}</h3>
        <p className="car-card__price">
          {car.price}
          <small>/day</small>
        </p>
        <ul className="car-card__specs">
          <li>
            <TbGauge />
            {car.mileage}
          </li>
          <li>
            <TbManualGearbox />
            {car.gearbox}
          </li>
          <li>
            <TbUsers />
            {car.seats}
          </li>
          <li>
            <TbGasStation />
            {car.fuel}
          </li>
        </ul>
        <button type="button" className="btn-rent" onClick={onRent}>
          Rent Now
        </button>
      </div>
    </article>
  );
}

/* Horizontal scroller with prev/next (Home "Newer car rental in ..." rows) */
export function CarRow({ title, subtitle = 'Average daily prices for a 3-day trip', items, onRent, onToggleFavorite }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current && ref.current.scrollBy({ left: dir * 449, behavior: 'smooth' });
  return (
    <section className="car-row">
      <div className="container car-row__head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="arrows">
          <button type="button" aria-label="Previous" onClick={() => scroll(-1)}>
            <FiChevronLeft size={26} />
          </button>
          <button type="button" aria-label="Next" onClick={() => scroll(1)}>
            <FiChevronRight size={26} />
          </button>
        </div>
      </div>
      <div className="car-row__track" ref={ref}>
        {items.map((car, i) => (
          <CarCard key={car.id || i} car={car} onRent={() => onRent?.(car)} onToggleFavorite={onToggleFavorite} />
        ))}
      </div>
    </section>
  );
}

const testimonials = [
  { img: img('testimonial-2.jpg'), name: 'Jenny Wilson', text: '“I have been using your services for 3 years. Your service is great, I will continue to use your service.”' },
  { img: img('testimonial-1.jpg'), name: 'Charlie Johnson', text: '“I feel very secure when using caretall\'s services. Your customer care team is very enthusiastic and the driver is always on time.”' },
  { img: img('testimonial-2.jpg'), name: 'Charlie Johnson', text: '“I feel very secure when using caretall\'s services. Your customer care team is very enthusiastic and the driver is always on time.”' },
  { img: img('testimonial-1.jpg'), name: 'Charlie Johnson', text: '“I feel very secure when using caretall\'s services. Your customer care team is very enthusiastic and the driver is always on time.”' },
];

/* "What peole say about us?" testimonial slider */
export function Testimonials() {
  const [liveTestimonials, setLiveTestimonials] = useState([]);
  const ref = useRef(null);
  const scroll = (dir) => ref.current && ref.current.scrollBy({ left: dir * 834, behavior: 'smooth' });

  useEffect(() => {
    let active = true;
    apiRequest('/content/testimonials?limit=8')
      .then((res) => {
        if (!active) return;
        const list = res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setLiveTestimonials(list);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const items = liveTestimonials.length > 0
    ? liveTestimonials.map((t, i) => ({
        img: t.photoUrl || img(`testimonial-${(i % 3) + 1}.jpg`),
        name: t.name || 'Verified Driver',
        text: t.comment ? `“${t.comment}”` : testimonials[i % testimonials.length].text,
        rating: t.rating || 5,
        subtitle: t.vehicle || 'From New York, US',
      }))
    : testimonials.map((t) => ({ ...t, rating: 5, subtitle: 'From New York, US' }));

  return (
    <section className="testimonials">
      <span className="eyebrow">TESTIMONIALS</span>
      <h2>What peole say about us?</h2>
      <div className="testimonials__track" ref={ref}>
        {items.map((t, i) => (
          <article className="testimonial" key={i}>
            <img
              src={t.img}
              alt={t.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = img('testimonial-1.jpg');
              }}
            />
            <div className="testimonial__body">
              <p className="testimonial__score">
                {(t.rating || 5).toFixed(1)} <small>stars</small>
              </p>
              <div className="testimonial__stars">
                {Array.from({ length: Math.round(t.rating || 5) }).map((_, s) => (
                  <FaStar key={s} />
                ))}
              </div>
              <p className="testimonial__text">{t.text}</p>
              <strong>{t.name}</strong>
              <small>{t.subtitle}</small>
            </div>
          </article>
        ))}
      </div>
      <div className="testimonials__nav">
        <button type="button" aria-label="Previous" onClick={() => scroll(-1)}>
          <FiChevronLeft size={22} />
        </button>
        <button type="button" aria-label="Next" onClick={() => scroll(1)}>
          <FiChevronRight size={22} />
        </button>
      </div>
    </section>
  );
}

export function Pagination({ dark, page = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  const handlePage = (p) => {
    if (p >= 1 && p <= totalPages && p !== page) {
      onPageChange?.(p);
    }
  };

  // Generate page numbers
  const pages = [];
  const maxButtons = 5;
  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  let end = Math.min(totalPages, start + maxButtons - 1);
  if (end - start + 1 < maxButtons) {
    start = Math.max(1, end - maxButtons + 1);
  }
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className={`pagination ${dark ? 'pagination--dark' : ''}`}>
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => handlePage(page - 1)}
        style={{ opacity: page <= 1 ? 0.35 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
      >
        <FiChevronLeft size={22} strokeWidth={3} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={p === page ? 'is-active' : ''}
          onClick={() => handlePage(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => handlePage(page + 1)}
        style={{ opacity: page >= totalPages ? 0.35 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
      >
        <FiChevronRight size={22} strokeWidth={3} />
      </button>
    </div>
  );
}
