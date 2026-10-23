import { useState } from 'react';
import Layout from '../../components/Layout';
import { SearchPanel } from '../../components/Search';
import { CarCard, Pagination } from '../../components/Cards';
import { carAt } from '../../data';
import { navigate } from '../../router';

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
  const [period, setPeriod] = useState('HOURLY');
  const [state, setState] = useState(() => groups.map((g) => g.items.map((_, i) => g.on.includes(i))));
  const [price, setPrice] = useState(100);
  const order = [2, 1, 0, 3, 4, 5, 2, 1, 0, 3, 4, 5];
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
          <input className="range" type="range" min={20} max={140} value={price} onChange={(e) => setPrice(+e.target.value)} />
          <p className="filters__price">Max. ${price.toFixed(2)}</p>
        </aside>
        <section className="listing__main">
          <SearchPanel withTime={false} ctaDark ctaTo="/app/cars" className="search--slim" />
          <div className="car-grid car-grid--sm">
            {order.map((i, k) => (
              <CarCard key={k} car={carAt(i)} size="sm" onRent={() => navigate('/app/car/1')} />
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
  const order = [3, 2, 1, 0, 2, 1, 4, 5, 3, 2, 1, 0, 3, 4, 5, 0];
  return (
    <Layout role="user">
      <div className="container favorites">
        <SearchPanel withTime={false} ctaTo="/app/cars" />
        <div className="car-grid car-grid--4">
          {order.map((i, k) => (
            <CarCard key={k} car={carAt(i)} liked size="sm" onRent={() => navigate('/app/car/1')} />
          ))}
        </div>
        <Pagination />
      </div>
    </Layout>
  );
}
