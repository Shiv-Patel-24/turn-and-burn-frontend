import { useEffect, useRef, useState } from 'react';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { TbGauge, TbManualGearbox, TbUsers, TbGasStation } from 'react-icons/tb';
import { img } from '../data';

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
export function CarRow({ title, subtitle = 'Average daily prices for a 3-day trip', items, onRent }) {
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
          <CarCard key={i} car={car} onRent={() => onRent?.(car)} />
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
  const ref = useRef(null);
  const scroll = (dir) => ref.current && ref.current.scrollBy({ left: dir * 834, behavior: 'smooth' });
  return (
    <section className="testimonials">
      <span className="eyebrow">TESTIMONIALS</span>
      <h2>What peole say about us?</h2>
      <div className="testimonials__track" ref={ref}>
        {testimonials.map((t, i) => (
          <article className="testimonial" key={i}>
            <img src={t.img} alt={t.name} />
            <div className="testimonial__body">
              <p className="testimonial__score">
                5.0 <small>stars</small>
              </p>
              <div className="testimonial__stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar key={s} />
                ))}
              </div>
              <p className="testimonial__text">{t.text}</p>
              <strong>{t.name}</strong>
              <small>From New York, US</small>
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

export function Pagination({ dark }) {
  const [page, setPage] = useState(1);
  return (
    <div className={`pagination ${dark ? 'pagination--dark' : ''}`}>
      <button type="button" aria-label="Previous page" onClick={() => setPage((p) => Math.max(1, p - 1))}>
        <FiChevronLeft size={22} strokeWidth={3} />
      </button>
      {[1, 2, 3].map((p) => (
        <button key={p} type="button" className={p === page ? 'is-active' : ''} onClick={() => setPage(p)}>
          {p}
        </button>
      ))}
      <button type="button" aria-label="Next page" onClick={() => setPage((p) => Math.min(3, p + 1))}>
        <FiChevronRight size={22} strokeWidth={3} />
      </button>
    </div>
  );
}
