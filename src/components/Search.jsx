import { useState } from 'react';
import moment from 'moment';
import { FiMapPin, FiCalendar, FiClock, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Modal } from '../ui';
import { navigate } from '../router';

/* Segmented toggle (Hourly/Daily, One Way/Round Trip) */
export function Segmented({ options, value, onChange, dark = true, className = '' }) {
  return (
    <div className={`segmented ${dark ? 'segmented--dark' : 'segmented--light'} ${className}`}>
      {options.map((o) => (
        <button key={o} type="button" className={value === o ? 'is-active' : ''} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmt = (d) => (d ? moment(d).format('MM/DD/YYYY') : '');

function MonthGrid({ year, month, range, onPick }) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = startOffset - 1; i >= 0; i -= 1) cells.push({ d: prevDays - i, muted: true });
  for (let d = 1; d <= days; d += 1) cells.push({ d, date: new Date(year, month, d) });
  const [s, e] = range;
  const inRange = (dt) => s && e && dt >= s && dt <= e;
  const same = (a, b) => a && b && a.toDateString() === b.toDateString();
  const todayStart = moment().startOf('day').toDate();

  return (
    <div className="cal-month">
      <h4>
        {MONTHS[month]} {year}
      </h4>
      <div className="cal-grid">
        {['SUN', 'MON', 'TUE', 'WED', 'THE', 'FRI', 'SAT'].map((w) => (
          <span key={w} className="cal-dow">
            {w}
          </span>
        ))}
        {cells.map((c, i) => {
          if (c.muted)
            return (
              <span key={i} className="cal-day is-muted">
                {c.d}
              </span>
            );
          const dt = c.date;
          const isPast = dt < todayStart;
          const cls = ['cal-day'];
          if (inRange(dt)) cls.push('in-range');
          if (same(dt, s)) cls.push('is-start');
          if (same(dt, e) || (same(dt, s) && !e)) cls.push('is-end');
          if (isPast) cls.push('is-blocked');
          return (
            <button
              key={i}
              type="button"
              className={cls.join(' ')}
              onClick={() => !isPast && onPick(dt)}
              disabled={isPast}
            >
              {c.d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Two-month range calendar — Figma "Pick-up date" / "Drop-off date" / "Date" overlays */
export function DateRangeModal({ onClose, onSave, compact, initialRange }) {
  const [base, setBase] = useState(() => {
    if (initialRange?.[0] && initialRange[0] instanceof Date && !isNaN(initialRange[0].getTime())) {
      return new Date(initialRange[0].getFullYear(), initialRange[0].getMonth(), 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [range, setRange] = useState(() => {
    if (initialRange?.[0] && initialRange?.[1]) return initialRange;
    const s = moment().startOf('day').toDate();
    const e = moment().startOf('day').add(3, 'days').toDate();
    return [s, e];
  });
  const next = new Date(base.getFullYear(), base.getMonth() + 1, 1);
  const pick = (dt) => {
    const [s, e] = range;
    if (!s || (s && e)) setRange([dt, null]);
    else if (dt < s) setRange([dt, s]);
    else setRange([s, dt]);
  };
  return (
    <Modal onClose={onClose} width={compact ? 926 : 1312} className="calendar-modal">
      <div className="calendar">
        <button type="button" className="cal-nav cal-nav--prev" aria-label="Previous month" onClick={() => setBase(new Date(base.getFullYear(), base.getMonth() - 1, 1))}>
          <FiChevronLeft size={26} strokeWidth={3} />
        </button>
        <button type="button" className="cal-nav cal-nav--next" aria-label="Next month" onClick={() => setBase(next)}>
          <FiChevronRight size={26} strokeWidth={3} />
        </button>
        <div className="calendar__months">
          <MonthGrid year={base.getFullYear()} month={base.getMonth()} range={range} onPick={pick} />
          <MonthGrid year={next.getFullYear()} month={next.getMonth()} range={range} onPick={pick} />
        </div>
        <div className="calendar__actions">
          <button type="button" className="btn-text" onClick={() => setRange([null, null])}>
            Reset
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onSave && onSave(range);
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}

function SearchCell({ label, icon, iconRight, children, className = '', onClick }) {
  return (
    <div className={`search__cell ${className}`}>
      <span className="search__label">{label}</span>
      <div className="search__box" onClick={onClick}>
        {icon}
        {children}
        {iconRight}
      </div>
    </div>
  );
}

/*
 * Search panel used on Home (with time cells) and on the listing/favorites
 * screens (variant="compact", no time cells, dark CTA on listing).
 */
export function SearchPanel({
  withTime = true,
  ctaTo = '/app/cars',
  ctaDark = false,
  className = '',
  initialCity = '',
  initialPickDate = '',
  initialDropDate = '',
  initialPickupTime = '',
  initialDropoffTime = '',
  mode = 'Daily',
  trip = 'Round Trip',
  onSearch,
}) {
  const [cal, setCal] = useState(null);
  const [pickupCity, setPickupCity] = useState(() => {
    if (initialCity) return initialCity;
    try {
      const saved = JSON.parse(sessionStorage.getItem('turn_and_burn_search_criteria') || '{}');
      return saved.pickupCity || saved.city || '';
    } catch {
      return '';
    }
  });
  const [dropoffCity, setDropoffCity] = useState(() => {
    if (initialCity) return initialCity;
    try {
      const saved = JSON.parse(sessionStorage.getItem('turn_and_burn_search_criteria') || '{}');
      return saved.dropoffCity || saved.city || '';
    } catch {
      return '';
    }
  });
  const [pick, setPick] = useState(() => {
    if (initialPickDate) return initialPickDate;
    try {
      const saved = JSON.parse(sessionStorage.getItem('turn_and_burn_search_criteria') || '{}');
      if (saved.pickupDate) return saved.pickupDate;
    } catch {}
    return moment().format('MM/DD/YYYY');
  });
  const [drop, setDrop] = useState(() => {
    if (initialDropDate) return initialDropDate;
    try {
      const saved = JSON.parse(sessionStorage.getItem('turn_and_burn_search_criteria') || '{}');
      if (saved.dropoffDate) return saved.dropoffDate;
    } catch {}
    return moment().add(3, 'days').format('MM/DD/YYYY');
  });
  const [pickupTime, setPickupTime] = useState(() => {
    if (initialPickupTime) return initialPickupTime;
    try {
      const saved = JSON.parse(sessionStorage.getItem('turn_and_burn_search_criteria') || '{}');
      if (saved.pickupTime) return saved.pickupTime;
    } catch {}
    return moment().add(1, 'hour').startOf('hour').format('HH:00');
  });
  const [dropoffTime, setDropoffTime] = useState(() => {
    if (initialDropoffTime) return initialDropoffTime;
    try {
      const saved = JSON.parse(sessionStorage.getItem('turn_and_burn_search_criteria') || '{}');
      if (saved.dropoffTime) return saved.dropoffTime;
    } catch {}
    return moment().add(1, 'hour').startOf('hour').format('HH:00');
  });

  const handleSearchSubmit = () => {
    const searchParams = new URLSearchParams();
    const city = pickupCity.trim() || dropoffCity.trim();
    if (city) searchParams.set('city', city);
    if (pickupCity.trim()) searchParams.set('pickupCity', pickupCity.trim());
    if (dropoffCity.trim()) searchParams.set('dropoffCity', dropoffCity.trim());
    if (pick) searchParams.set('pickupDate', pick);
    if (drop) searchParams.set('dropoffDate', drop);
    if (pickupTime) searchParams.set('pickupTime', pickupTime);
    if (dropoffTime) searchParams.set('dropoffTime', dropoffTime);
    if (mode) searchParams.set('mode', mode.toLowerCase());
    if (trip) searchParams.set('tripType', trip.toLowerCase().includes('one') ? 'oneway' : 'round');

    try {
      sessionStorage.setItem('turn_and_burn_search_criteria', JSON.stringify({
        city,
        pickupCity: pickupCity.trim(),
        dropoffCity: dropoffCity.trim(),
        pickupDate: pick,
        dropoffDate: drop,
        pickupTime,
        dropoffTime,
        mode: mode ? mode.toLowerCase() : 'daily',
        tripType: trip && trip.toLowerCase().includes('one') ? 'oneway' : 'round',
      }));
    } catch {}

    if (onSearch) {
      onSearch({
        city,
        pickupCity: pickupCity.trim(),
        dropoffCity: dropoffCity.trim(),
        pickupDate: pick,
        dropoffDate: drop,
        pickupTime,
        dropoffTime,
        mode: mode.toLowerCase(),
        trip: trip.toLowerCase(),
        params: searchParams,
      });
      return;
    }

    const queryStr = searchParams.toString();
    const target = queryStr ? `${ctaTo}?${queryStr}` : ctaTo;
    navigate(target);
  };

  return (
    <div className={`search ${withTime ? '' : 'search--compact'} ${className}`}>
      <div className="search__fields">
        <SearchCell label="Pick-up Location" className="search__cell--loc" icon={<FiMapPin size={20} />}>
          <input
            placeholder="Search city or location"
            value={pickupCity}
            onChange={(e) => setPickupCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          />
        </SearchCell>
        <SearchCell label="Pick-up date" className="search__cell--date" iconRight={<FiCalendar size={20} />} onClick={() => setCal('pick')}>
          <span>{pick}</span>
        </SearchCell>
        {withTime && (
          <SearchCell label="Pick-up time" className="search__cell--time" iconRight={<FiClock size={20} />}>
            <input
              type="time"
              aria-label="Pick-up time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
            />
          </SearchCell>
        )}
        <SearchCell label="Drop-off Location" className="search__cell--loc" icon={<FiMapPin size={20} />}>
          <input
            placeholder="Search city or location"
            value={dropoffCity}
            onChange={(e) => setDropoffCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          />
        </SearchCell>
        <SearchCell label="Drop-off date" className="search__cell--date" iconRight={<FiCalendar size={20} />} onClick={() => setCal('drop')}>
          <span>{drop}</span>
        </SearchCell>
        {withTime && (
          <SearchCell label="Drop-off time" className="search__cell--time" iconRight={<FiClock size={20} />}>
            <input
              type="time"
              aria-label="Drop-off time"
              value={dropoffTime}
              onChange={(e) => setDropoffTime(e.target.value)}
            />
          </SearchCell>
        )}
      </div>
      <button type="button" className={`btn ${ctaDark ? 'btn-dark' : 'btn-primary'} search__cta`} onClick={handleSearchSubmit}>
        Find a Vehicle <FiArrowRight size={18} />
      </button>
      {cal && (
        <DateRangeModal
          onClose={() => setCal(null)}
          initialRange={[
            moment(pick, 'MM/DD/YYYY').isValid() ? moment(pick, 'MM/DD/YYYY').toDate() : moment().toDate(),
            moment(drop, 'MM/DD/YYYY').isValid() ? moment(drop, 'MM/DD/YYYY').toDate() : moment().add(3, 'days').toDate(),
          ]}
          onSave={([s, e]) => {
            if (s) setPick(fmt(s));
            if (e) setDrop(fmt(e));
          }}
        />
      )}
    </div>
  );
}
