import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { SearchPanel } from '../../components/Search';
import { CarCard, Pagination } from '../../components/Cards';
import { formatVehicle } from '../../data';
import { navigate } from '../../router';
import { apiRequest } from '../../lib/api';
import { useUI } from '../../ui';

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
  const { open } = useUI();
  const [period, setPeriod] = useState('DAILY');
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState(null);
  const [chauffeur, setChauffeur] = useState(null);
  const [duration, setDuration] = useState(null);
  const [filterMeta, setFilterMeta] = useState(null);
  const [price, setPrice] = useState(300);
  const [priceRange, setPriceRange] = useState({ min: 20, max: 500 });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 9;

  // Read initial search criteria from URL hash query params (e.g. #/app/cars?city=Los+Angeles&style=Sedan)
  const getHashQueryParams = () => {
    const hash = window.location.hash || '';
    const qIndex = hash.indexOf('?');
    return new URLSearchParams(qIndex >= 0 ? hash.slice(qIndex) : '');
  };

  const initialParams = getHashQueryParams();
  const [cityFilter, setCityFilter] = useState(initialParams.get('city') || '');
  const [pickupDateFilter, setPickupDateFilter] = useState(initialParams.get('pickupDate') || '');
  const [dropoffDateFilter, setDropoffDateFilter] = useState(initialParams.get('dropoffDate') || '');

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedStyles, selectedSeats, price, period, cityFilter, pickupDateFilter, dropoffDateFilter]);

  // Fetch dynamic filter metadata from backend (/vehicles/filters)
  useEffect(() => {
    let active = true;
    apiRequest('/vehicles/filters')
      .then((res) => {
        if (!active) return;
        const meta = res?.data;
        if (meta) {
          setFilterMeta(meta);
          if (meta.price?.max) {
            setPriceRange({ min: Math.floor(meta.price.min || 20), max: Math.ceil(meta.price.max || 500) });
            setPrice((prev) => (prev === 300 ? Math.ceil(meta.price.max) : prev));
          }
        }
      })
      .catch((err) => {
        console.warn('Could not fetch filter metadata:', err.message);
      });

    return () => {
      active = false;
    };
  }, []);

  // Listen for hash changes to keep search filter criteria synced
  useEffect(() => {
    const handleHashChange = () => {
      const p = getHashQueryParams();
      if (p.has('city')) setCityFilter(p.get('city') || '');
      if (p.has('pickupDate')) setPickupDateFilter(p.get('pickupDate') || '');
      if (p.has('dropoffDate')) setDropoffDateFilter(p.get('dropoffDate') || '');
      if (p.has('style')) {
        const s = p.get('style');
        if (s) setSelectedStyles([s]);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Map chosen styles, capacity, price, page, and city/dates to backend query params
  useEffect(() => {
    let active = true;
    setLoading(true);

    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      params.set('limit', String(pageSize));
      params.set('page', String(page));
      if (cityFilter.trim()) params.set('city', cityFilter.trim());
      if (price > 0) params.set('maxPrice', String(price));
      if (selectedStyles.length > 0) params.set('style', selectedStyles[0]);
      if (selectedSeats != null) params.set('seats', String(selectedSeats));
      if (pickupDateFilter) {
        const pd = new Date(pickupDateFilter);
        if (!isNaN(pd.getTime())) params.set('pickupDate', pd.toISOString());
      }
      if (dropoffDateFilter) {
        const dd = new Date(dropoffDateFilter);
        if (!isNaN(dd.getTime())) params.set('dropoffDate', dd.toISOString());
      }

      Promise.all([
        apiRequest(`/vehicles/search?${params.toString()}`),
        localStorage.getItem('turn_and_burn_access_token')
          ? apiRequest('/vehicles/favorites/mine').catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
      ])
        .then(([searchRes, favRes]) => {
          if (!active) return;
          const list = searchRes?.data?.results || searchRes?.data || [];
          const total = typeof searchRes?.data?.total === 'number' ? searchRes.data.total : list.length;
          const pages = typeof searchRes?.data?.pages === 'number'
            ? searchRes.data.pages
            : Math.ceil(total / pageSize);

          const favList = Array.isArray(favRes?.data) ? favRes.data : [];
          const favIdSet = new Set(
            favList.map((f) => String(f?.vehicle?._id || f?.vehicle?.id || f?._id || f?.id))
          );

          const enrichedList = list.map((v) => {
            const vId = String(v?._id || v?.id);
            return {
              ...v,
              isFavorite: favIdSet.has(vId) || Boolean(v.isFavorite),
            };
          });

          setVehicles(enrichedList);
          setTotalCount(total);
          setTotalPages(Math.max(1, pages));
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
  }, [selectedStyles, selectedSeats, price, period, page, cityFilter, pickupDateFilter, dropoffDateFilter]);

  const displayCars = (vehicles || []).map((v, i) => formatVehicle(v, i));

  const handleToggleFavorite = async (car, isLiked) => {
    const token = localStorage.getItem('turn_and_burn_access_token');
    if (!token) {
      open('signup');
      return;
    }
    const targetId = car?.id || car?._id;
    if (!targetId) return;
    try {
      if (isLiked) {
        await apiRequest(`/vehicles/${targetId}/favorite`, { method: 'POST' });
      } else {
        await apiRequest(`/vehicles/${targetId}/favorite`, { method: 'DELETE' });
      }
      setVehicles((prev) =>
        prev.map((v) =>
          String(v._id || v.id) === String(targetId)
            ? { ...v, isFavorite: isLiked }
            : v
        )
      );
    } catch (err) {
      console.warn('Could not update favorite status:', err.message);
    }
  };

  const handleStyleToggle = (styleName) => {
    setSelectedStyles((prev) =>
      prev.includes(styleName) ? prev.filter((s) => s !== styleName) : [styleName]
    );
  };

  const handleSeatToggle = (seatsNum) => {
    setSelectedSeats((prev) => (prev === seatsNum ? null : seatsNum));
  };

  // Dynamic style list with real counts from backend
  const availableStyles = (filterMeta?.styles && filterMeta.styles.length > 0)
    ? filterMeta.styles
    : [
        { value: 'Sport Car', count: 0 },
        { value: 'SUV', count: 0 },
        { value: 'MPV', count: 0 },
        { value: 'Sedan', count: 0 },
        { value: 'Coupe', count: 0 },
        { value: 'Hatchback', count: 0 }
      ];

  // Dynamic capacity buckets with real counts from backend
  const availableCapacities = (filterMeta?.seatBuckets && filterMeta.seatBuckets.length > 0)
    ? filterMeta.seatBuckets
    : [
        { label: '2 Person', seats: 2, count: 0 },
        { label: '4 Person', seats: 4, count: 0 },
        { label: '6 Person', seats: 6, count: 0 },
        { label: '8 or More', seats: 8, count: 0 }
      ];

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

          <div>
            <h6>TYPE</h6>
            {availableStyles.map((item) => (
              <DarkCheck
                key={item.value}
                checked={selectedStyles.includes(item.value)}
                onChange={() => handleStyleToggle(item.value)}
              >
                {item.value} ({item.count})
              </DarkCheck>
            ))}
          </div>

          <div>
            <h6>CHAUFFEUR</h6>
            {['Yes', 'No'].map((c) => (
              <DarkCheck
                key={c}
                checked={chauffeur === c}
                onChange={() => setChauffeur((prev) => (prev === c ? null : c))}
              >
                {c}
              </DarkCheck>
            ))}
          </div>

          <div>
            <h6>CAPACITY</h6>
            {availableCapacities.map((item) => (
              <DarkCheck
                key={item.label}
                checked={selectedSeats === item.seats}
                onChange={() => handleSeatToggle(item.seats)}
              >
                {item.label} ({item.count})
              </DarkCheck>
            ))}
          </div>

          <div>
            <h6>DURATION</h6>
            {['1 Day', '3 Day', '7 Day', '8 or More Day’s'].map((d) => (
              <DarkCheck
                key={d}
                checked={duration === d}
                onChange={() => setDuration((prev) => (prev === d ? null : d))}
              >
                {d}
              </DarkCheck>
            ))}
          </div>

          <h6>PRICE</h6>
          <input
            className="range"
            type="range"
            min={priceRange.min}
            max={priceRange.max > priceRange.min ? priceRange.max : 500}
            value={price}
            onChange={(e) => setPrice(+e.target.value)}
          />
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
          <div className="car-grid car-grid--sm">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div className="car-card-skeleton" key={idx}>
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
            ) : displayCars.length > 0 ? (
              displayCars.map((c, k) => (
                <CarCard
                  key={c.id || k}
                  car={c}
                  size="sm"
                  onRent={() => navigate(`/app/car/${c.id || 1}`)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                <p style={{ fontSize: '18px', fontWeight: 600, color: '#334155' }}>No vehicles match your search criteria.</p>
                <p style={{ fontSize: '14px', marginTop: '6px' }}>Try adjusting your filters, location, or dates to find available cars.</p>
              </div>
            )}
          </div>
          {!loading && totalPages > 1 && (
            <Pagination
              dark
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
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
    const targetId = car?.id || car?._id;
    if (!targetId) return;
    try {
      if (isLiked) {
        await apiRequest(`/vehicles/${targetId}/favorite`, { method: 'POST' });
      } else {
        await apiRequest(`/vehicles/${targetId}/favorite`, { method: 'DELETE' });
        setFavorites((prev) =>
          prev.filter((item) => {
            const v = item?.vehicle || item;
            const itemId = String(v?._id || v?.id || item?._id || item?.id);
            return itemId !== String(targetId);
          })
        );
      }
    } catch (err) {
      console.warn('Could not toggle favorite:', err.message);
    }
  };

  const [favPage, setFavPage] = useState(1);
  const favPageSize = 8;
  const hasFavorites = favorites.length > 0;
  const totalFavPages = Math.ceil(favorites.length / favPageSize);
  const paginatedFavorites = favorites.slice((favPage - 1) * favPageSize, favPage * favPageSize);
  const displayFavs = paginatedFavorites.map((v, i) => ({ ...formatVehicle(v?.vehicle || v, i), isFavorite: true }));

  return (
    <Layout role="user">
      <div className="container favorites">
        <SearchPanel withTime={false} ctaTo="/app/cars" />
        {loading ? (
          <div className="car-grid car-grid--4" style={{ marginTop: '24px' }}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div className="car-card-skeleton" key={idx}>
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
            ))}
          </div>
        ) : !hasFavorites ? (
          <div style={{ background: '#f8fafc', padding: '36px 20px', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '24px 0' }}>
            <p style={{ color: '#334155', fontWeight: 600, fontSize: '18px', margin: 0 }}>You haven't added any favorite vehicles yet!</p>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '8px 0 0' }}>
              Explore our fleet from the cars page and click the heart icon on any vehicle to save it to your wishlist.
            </p>
          </div>
        ) : (
          <div className="car-grid car-grid--4" style={{ marginTop: '24px' }}>
            {displayFavs.map((c, k) => (
              <CarCard
                key={c.id || k}
                car={c}
                liked={true}
                size="sm"
                onRent={() => navigate(`/app/car/${c.id || (k + 1)}`)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
        {!loading && totalFavPages > 1 && (
          <Pagination
            page={favPage}
            totalPages={totalFavPages}
            onPageChange={(p) => setFavPage(p)}
          />
        )}
      </div>
    </Layout>
  );
}
