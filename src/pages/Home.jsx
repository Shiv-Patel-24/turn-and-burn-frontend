import { useEffect, useState } from 'react';
import { FiChevronRight, FiArrowRight, FiCalendar, FiMapPin, FiSend, FiBarChart2 } from 'react-icons/fi';
import { IoCarSportOutline, IoAirplane } from 'react-icons/io5';
import Layout from '../components/Layout';
import { SearchPanel, Segmented } from '../components/Search';
import { CarCard, CarRow } from '../components/Cards';
import { carAt, collectionTabs, rentalSections, img, formatVehicle } from '../data';
import { navigate } from '../router';
import { useUI } from '../ui';
import { apiRequest } from '../lib/api';

const categories = [
  { label: 'All', icon: IoCarSportOutline },
  { label: 'Airports', icon: IoAirplane },
  { label: 'Monthly', icon: FiCalendar },
  { label: 'Nearby', icon: FiMapPin },
  { label: 'Delivered', icon: FiSend },
  { label: 'Cities', icon: FiBarChart2 },
];

const bodyTypes = [
  ['SUV', 'suv'], ['Crossover', 'crossover'], ['Wagon', 'wagon'], ['Family MBP', 'mpv'], ['Sport Coupe', 'sport'], ['Compact', 'compact'],
  ['Coup', 'coup'], ['Truck', 'truck'], ['Sedan', 'sedan'], ['Limousine', 'limo'], ['Convertible', 'convertible'], ['Crossover', 'crossover'],
];

/* Figma: "MacBook Pro 14 - 1" (guest) and "MacBook Pro 14 - 6" (logged in) */
export default function Home({ role = 'guest' }) {
  const { open } = useUI();
  const [mode, setMode] = useState('Hourly');
  const [trip, setTrip] = useState('One Way Trip');
  const [cat, setCat] = useState('All');
  const [body, setBody] = useState(-1);
  const [tab, setTab] = useState(collectionTabs[0]);
  const [apiVehicles, setApiVehicles] = useState([]);
  const isUser = role === 'user';
  const rent = (c) => {
    const id = c?.id || '1';
    return isUser ? navigate(`/app/car/${id}`) : navigate(`/car/${id}`);
  };

  useEffect(() => {
    let active = true;
    apiRequest('/vehicles/search')
      .then((res) => {
        if (!active) return;
        const list = res?.data?.results || res?.data || [];
        if (list.length) setApiVehicles(list);
      })
      .catch((err) => console.warn('Home vehicles fallback to mock:', err.message));
    return () => {
      active = false;
    };
  }, []);

  const defaultMock = [0, 1, 2, 3, 4, 5, 0, 1, 2].map(carAt);
  const formattedVehicles = apiVehicles.length > 0
    ? apiVehicles.map((v, i) => formatVehicle(v, i))
    : defaultMock;

  // Filter cars when user clicks "Popular Car", "Luxury Car", "Vintage Car", "Family Car", "Off-Road Car"
  const filterByTab = (cars, activeTab) => {
    if (activeTab === 'Luxury Car') {
      const lux = cars.filter((c) => (c.raw?.category || '').toLowerCase() === 'luxury');
      return lux.length > 0 ? lux : cars;
    }
    if (activeTab === 'Family Car') {
      const fam = cars.filter((c) => (c.raw?.style || '').toLowerCase() === 'suv' || (c.raw?.seats >= 5));
      return fam.length > 0 ? fam : cars;
    }
    if (activeTab === 'Off-Road Car') {
      const off = cars.filter((c) => ['suv', 'truck'].includes((c.raw?.style || '').toLowerCase()) || (c.raw?.driveTrain || '').toLowerCase() === 'awd');
      return off.length > 0 ? off : cars;
    }
    if (activeTab === 'Vintage Car') {
      const vin = cars.filter((c) => (c.raw?.year && c.raw.year <= 2020));
      return vin.length > 0 ? vin : cars;
    }
    return cars;
  };

  const filteredTabCars = filterByTab(formattedVehicles, tab);
  const gridCars = filteredTabCars.slice(0, 9);
  const rowCars = formattedVehicles;

  return (
    <Layout role={role}>
      <section className="hero">
        <img className="hero__img" src={img('home-hero.jpg')} alt="" />
        <div className="container hero__inner">
          <h1>Discover the world on wheels with our car rental service</h1>
          <p>Choose from a wide range of cars that fit your style and budget. Experience the freedom of the open road with our reliable and efficient rental service.</p>
          <div className="hero__line" />
          <button type="button" className="hero__contact" onClick={() => navigate(isUser ? '/app/contact' : '/contact')}>
            <span>
              <FiChevronRight size={18} />
            </span>
            Contact us
          </button>
        </div>
      </section>

      <section className="search-band">
        <div className="container">
          <div className="search-band__toggles">
            <Segmented options={['Hourly', 'Daily']} value={mode} onChange={setMode} />
            <Segmented options={['One Way Trip', 'Round Trip']} value={trip} onChange={setTrip} />
          </div>
          <SearchPanel withTime ctaTo={isUser ? '/app/cars' : '/app/cars'} />
        </div>
      </section>

      <section className="container home-cats">
        <div className="cat-tabs">
          {categories.map(({ label, icon: I }) => (
            <button key={label} type="button" className={cat === label ? 'is-active' : ''} onClick={() => setCat(label)}>
              <I size={22} /> {label}
            </button>
          ))}
        </div>
        <h3 className="body-types__title">Rent by body type</h3>
        <div className="body-types">
          {bodyTypes.map(([label, icon], i) => (
            <button
              key={i}
              type="button"
              className={`body-type ${body === i ? 'is-active' : ''}`}
              onClick={() => {
                setBody(i);
                navigate(`/app/cars?style=${encodeURIComponent(label)}`);
              }}
            >
              <img src={img(`body-${icon}.png`)} alt="" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="collection">
        <div className="container">
          <div className="section-head">
            <h2>Our Impressive Collection of Cars</h2>
            <p>Ranging from elegant sedans to powerful sports cars, all carefully selected to provide our customers with the ultimate driving experience.</p>
          </div>
          <div className="pill-tabs">
            {collectionTabs.map((t) => (
              <button key={t} type="button" className={tab === t ? 'is-active' : ''} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="car-grid">
            {gridCars.map((c, i) => (
              <CarCard key={`${tab}-${i}`} car={c} onRent={() => rent(c)} />
            ))}
          </div>
          <div className="center">
            <button type="button" className="btn btn-primary btn-pill" onClick={() => (isUser ? navigate('/app/cars') : open('signup'))}>
              See all Cars <FiArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      <div className="rows">
        {rentalSections.map((t) => (
          <CarRow key={t} title={t} items={rowCars} onRent={rent} />
        ))}
      </div>
    </Layout>
  );
}

