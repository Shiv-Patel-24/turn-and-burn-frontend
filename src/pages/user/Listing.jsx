import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { SearchPanel } from '../../components/Search';
import { CarCard, Pagination } from '../../components/Cards';
import { carAt, formatVehicle } from '../../data';
import { navigate } from '../../router';
import { apiRequest } from '../../lib/api';

const groups = [
  { title: 'TYPE', items: ['Sport (10)', 'SUV (12)', 'MPV (16)', 'Sedan (20)', 'Coupe (14)', 'Hatchback (14)'], on: [0, 1] },
  { title: 'CHAUFFEUR', items: ['Yes', 'No'], on: [0] },
  { title: 'CAPACITY', items: ['2 Person (10)', '4 Person (14)', '6 Person (12)', '8 or More (16)'], on: [0, 3] },
  { title: 'DURATION', items: ['1 Day', '3 Day', '7 Day', '8 or More Day’s'], on: [0, 3] },
];

function DarkCheck({ checked, onChange, children }) {
  return (
    <label className="dark-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span />
      {children}
    </label>
  );
}

/* Figma: "MacBook Pro 14 - 7" — car listing with filter sidebar */
export function Listing() {
  const [period, setPeriod] = useState('DAILY');
  const [state, setState] = useState(() => groups.map((g) => g.items.map((_, i) => false)));
  const [price, setPrice] = useState(300);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read initial search criteria from URL hash query params (e.g. #/app/cars?city=Los+Angeles)
  const getHashQueryParams = () => {
    const hash = window.location.hash || '';
    const qIndex = hash.indexOf('?');
    return new URLSearchParams(qIndex >= 0 ? hash.slice(qIndex) : '');
  };

  const initialParams = getHashQueryParams();
  const [cityFilter, setCityFilter] = useState(initialParams.get('city') || '');
  const [pickupDateFilter, setPickupDateFilter] = useState(initialParams.get('pickupDate') || '');
  const [dropoffDateFilter, setDropoffDateFilter] = useState(initialParams.get('dropoffDate') || '');

  // Listen for hash changes to keep search filter criteria synced
  useEffect(() => {
    const handleHashChange = () => {
      const p = getHashQueryParams();
      if (p.has('city')) setCityFilter(p.get('city') || '');
      if (p.has('pickupDate')) setPickupDateFilter(p.get('pickupDate') || '');
      if (p.has('dropoffDate')) setDropoffDateFilter(p.get('dropoffDate') || '');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Map chosen styles, capacity, price, and city/dates to backend query params
  useEffect(() => {
    let active = true;
    setLoading(true);

    const timer = setTimeout(() => {
      const typeItems = ['Sport Car', 'SUV', 'MPV', 'Sedan', 'Coupe', 'Hatchback'];
      const selectedStyles = [];
      state[0]?.forEach((isSelected, idx) => {
        if (isSelected && typeItems[idx]) selectedStyles.push(typeItems[idx]);
      });

      const capacityMap = [2, 4, 6, 8];
      let selectedSeats = null;
      state[2]?.forEach((isSelected, idx) => {
        if (isSelected && capacityMap[idx]) selectedSeats = capacityMap[idx];
      });

      const params = new URLSearchParams();
      params.set('limit', '20');
      if (cityFilter.trim()) params.set('city', cityFilter.trim());
      if (price > 0) params.set('maxPrice', String(price));
      if (selectedStyles.length > 0) params.set('style', selectedStyles[0]);
      if (selectedSeats) params.set('seats', String(selectedSeats));
      if (pickupDateFilter) {
        const pd = new Date(pickupDateFilter);
        if (!isNaN(pd.getTime())) params.set('pickupDate', pd.toISOString());
      }
      if (dropoffDateFilter) {
        const dd = new Date(dropoffDateFilter);
        if (!isNaN(dd.getTime())) params.set('dropoffDate', dd.toISOString());
      }

      apiRequest(`/vehicles/search?${params.toString()}`)
        .then((res) => {
          if (!active) return;
          const list = res?.data?.results || res?.data || [];
          setVehicles(list);
        })
        .catch((err) => {
          console.warn('Filtered vehicle fetch failed, using fallback:', err.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [state, price, period, cityFilter, pickupDateFilter, dropoffDateFilter]);

  const order = [2, 1, 0, 3, 4, 5, 2, 1, 0, 3, 4, 5];
  const displayCars = vehicles.length > 0
    ? vehicles.map((v, i) => formatVehicle(v, i))
    : order.map((i) => carAt(i));

  const handleToggleFavorite = async (car, isLiked) => {
    if (!car?.id) return;
    try {
      if (isLiked) {
        await apiRequest(`/vehicles/${car.id}/favorite`, { method: 'POST' });
      } else {
        await apiRequest(`/vehicles/${car.id}/favorite`, { method: 'DELETE' });
      }
    } catch (err) {
      console.warn('Could not update favorite status:', err.message);
    }
  };

  return (
    <Layout role="user">
      <div className="listing">
        <aside className="filters">
          <h6>TIME PRIOD</h6>
          {['HOURLY', 'DAILY'].map((p) => (
            <label key={p} className="dark-radio">
              <input type="radio" name="period" checked={period === p} onChange={() => setPeriod(p)} />
              <span />
              {p}
            </label>
          ))}
          {groups.map((g, gi) => (
            <div key={g.title}>
              <h6>{g.title}</h6>
              {g.items.map((it, ii) => (
                <DarkCheck
                  key={it}
                  checked={state[gi][ii]}
                  onChange={(v) => setState((s) => s.map((row, r) => (r === gi ? row.map((c, ci) => (ci === ii ? v : c)) : row)))}
                >
                  {it}
                </DarkCheck>
              ))}
            </div>
          ))}
          <h6>PRICE</h6>
          <input className="range" type="range" min={20} max={500} value={price} onChange={(e) => setPrice(+e.target.value)} />
          <p className="filters__price">Max. ${price.toFixed(2)}</p>
        </aside>
        <section className="listing__main">
          <SearchPanel
            withTime={false}
            ctaDark
            ctaTo="/app/cars"
            className="search--slim"
            initialCity={cityFilter}
            initialPickDate={pickupDateFilter}
            initialDropDate={dropoffDateFilter}
            onSearch={({ city, pickupDate, dropoffDate }) => {
              setCityFilter(city || '');
              setPickupDateFilter(pickupDate || '');
              setDropoffDateFilter(dropoffDate || '');
            }}
          />
          {loading && <p style={{ color: '#aaa', padding: '10px 0' }}>Loading vehicles from server...</p>}
          <div className="car-grid car-grid--sm">
            {displayCars.map((c, k) => (
              <CarCard
                key={c.id || k}
                car={c}
                size="sm"
                onRent={() => navigate(`/app/car/${c.id || 1}`)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
          <Pagination dark />
        </section>
      </div>
    </Layout>
  );
}

/* Figma: "MacBook Pro 14 - 15" — Favorites */
export function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest('/vehicles/favorites/mine')
      .then((res) => {
        if (!active) return;
        const list = res?.data || [];
        setFavorites(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.warn('Could not fetch favorites from server:', err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleToggleFavorite = async (car, isLiked) => {
    if (!car?.id) return;
    try {
      if (isLiked) {
        await apiRequest(`/vehicles/${car.id}/favorite`, { method: 'POST' });
      } else {
        await apiRequest(`/vehicles/${car.id}/favorite`, { method: 'DELETE' });
        setFavorites((prev) => prev.filter((item) => (item._id || item.id) !== car.id));
      }
    } catch (err) {
      console.warn('Could not toggle favorite:', err.message);
    }
  };

  const hasFavorites = favorites.length > 0;
  const displayFavs = hasFavorites
    ? favorites.map((v, i) => ({ ...formatVehicle(v?.vehicle || v, i), isFavorite: true }))
    : [0, 1, 2, 3, 4, 5].map((i) => ({ ...carAt(i), isFavorite: false }));

  return (
    <Layout role="user">
      <div className="container favorites">
        <SearchPanel withTime={false} ctaTo="/app/cars" />
        {loading && <p style={{ color: '#666', padding: '10px 0' }}>Loading your favorite vehicles...</p>}
        {!hasFavorites && !loading && (
          <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <p style={{ color: '#334155', fontWeight: 600, fontSize: '15px', margin: 0 }}>You haven't added any favorite vehicles yet!</p>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
              Explore our fleet below and click the heart icon on any vehicle to save it to your wishlist.
            </p>
          </div>
        )}
        <div className="car-grid car-grid--4">
          {displayFavs.map((c, k) => (
            <CarCard
              key={c.id || k}
              car={c}
              liked={hasFavorites}
              size="sm"
              onRent={() => navigate(`/app/car/${c.id || (k + 1)}`)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
        <Pagination />
      </div>
    </Layout>
  );
}
