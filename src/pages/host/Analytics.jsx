import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import Layout from '../../components/Layout';
import { DateRangeModal } from '../../components/Search';
import { Thumb } from './HostShared';
import { img, fleetThumbs, LOREM_SHORT } from '../../data';

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const earnings = [3300, 4250, 5950, 5500, 4700, 0, 0, 0, 0, 0, 0, 0];
const extra = { 3: ['missed', 130], 4: ['upcoming', 130] };

const legend = [
  ['trip', '$32,369', 'Trip earnings'],
  ['upcoming', '$130', 'Upcoming earnings'],
  ['reimb', '$165', 'Reimbursements'],
  ['incent', '$0', 'Incentives'],
  ['missed', '$132', 'Missed earnings'],
];

const perf = [
  ['Cancellation rate', '0.0%', 'All-Star Host: 3%'],
  ['Five-star rate', '86.0%', 'All-Star Host: 86%'],
  ['Maintenance rate', '84.8%', 'All-Star Host: 80%'],
  ['Cleanliness rate', '85.4%', 'All-Star Host: 80%'],
  ['Completed trips', '172', 'All-Star Host: 20*'],
];

const cats = [
  ['Maintenance', '84%', ['Other (5)', 'Check engine light (2)', 'Low oil light (2)', 'Brakes (1)', 'Low tire pressure (1)']],
  ['Cleanliness', '85%', ['Dirty exterior (5)', 'Dirty interior (2)', 'Not disinfected (2)', 'Upholstery stains (1)']],
  ['Accuracy', '87%', ['Photos (5)']],
  ['Communication', '85%', ['Host responsiveness (5)', 'Pickup instructions (2)', 'Punctuality (1)']],
  ['Convenience', '85%', ['Car pickup (5)', 'Car dropoff (2)']],
];

const reviewers = ['Cheyenne George', 'Allison Culhane', 'Carter George', 'Kierra Workman', 'Davis Press', 'Giana Herwitz'];

/* Figma: "MacBook Pro 14 - 47" — Analytics (Earnings, Performance, Ratings) */
export default function Analytics() {
  const [cal, setCal] = useState(false);
  const [all, setAll] = useState(false);
  const max = 8000;
  return (
    <Layout role="host">
      <div className="container analytics">
        <div className="page-title">
          <div>
            <h1 className="h-md">Earnings</h1>
            <p>{LOREM_SHORT}</p>
          </div>
          <div className="month-nav month-nav--sm">
            <button type="button" aria-label="Previous">
              <FiChevronLeft />
            </button>
            <button type="button" className="month-nav__label" onClick={() => setCal(true)}>
              May, 2026
            </button>
            <button type="button" aria-label="Next">
              <FiChevronRight />
            </button>
          </div>
        </div>

        <div className="earn-head">
          <div>
            <h2>$32,369 earned in 2026</h2>
            <small>All earnings adjustments included.</small>
          </div>
          <button type="button" className="chip-btn chip-btn--white">
            Download CSV
          </button>
        </div>

        <div className="chart">
          <div className="chart__plot">
            {[8000, 6000, 4000, 2000, 0].map((v) => (
              <div className="chart__grid" key={v} style={{ bottom: `${(v / max) * 100}%` }}>
                <span>${v.toLocaleString()}</span>
              </div>
            ))}
            <div className="chart__bars">
              {months.map((m, i) => (
                <div className="chart__col" key={m}>
                  <div className="chart__stack">
                    {extra[i] && <i className={`seg seg--${extra[i][0]}`} style={{ height: `${(extra[i][1] / max) * 100 * 2}%` }} />}
                    <i className="seg seg--trip" style={{ height: `${(earnings[i] / max) * 100}%` }} title={`$${earnings[i]}`} />
                  </div>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart__legend">
            {legend.map(([k, v, l]) => (
              <span key={k}>
                <i className={`seg seg--${k}`} /> <b>{v}</b> {l}
              </span>
            ))}
          </div>
        </div>

        <div className="earn-table">
          <div className="earn-table__head">
            <span>All vehicles</span>
            <span>2026 earnings</span>
          </div>
          {fleetThumbs.map((t, i) => (
            <div className="earn-table__row" key={i}>
              <Thumb src={t} small />
              <b>$5,834.05</b>
            </div>
          ))}
        </div>

        <h2 className="h-md mt-xl">Performance</h2>
        <p className="lead-sm">{LOREM_SHORT}</p>
        <div className="perf">
          <div className="perf__list">
            {perf.map(([k, v, s]) => (
              <div className="perf__row" key={k}>
                <b>{k}</b>
                <div>
                  <span className="pill-green">{v}</span>
                  <small>{s}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="tips-card">
            <img src={img('helpful-tips.png')} alt="Helpful tips" />
            <h4>Performance tips</h4>
            <ol>
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i}>{LOREM_SHORT}</li>
              ))}
            </ol>
          </div>
        </div>

        <h2 className="h-md mt-xl">Ratings &amp; reviews</h2>
        <p className="lead-sm">{LOREM_SHORT}</p>
        <div className="ratings">
          <div>
            <h3>Ratings</h3>
            <small className="muted-sm">Percentage of 5-star ratings, including unrated trips</small>
            <div className="r-card">
              <div className="r-card__head">
                <b>Overall</b>
                <b>85%</b>
              </div>
              {[
                ['5 stars', 85],
                ['4 stars', 2],
                ['3 stars', 1],
                ['2 stars', 0],
                ['1 stars', 1],
                ['Unrated', 11],
              ].map(([l, p]) => (
                <div className="r-bar" key={l}>
                  <span>{l}</span>
                  <i>
                    <b style={{ width: `${p}%` }} />
                  </i>
                  <span>{p}%</span>
                </div>
              ))}
              <div className="r-card__stats">
                <div>
                  <b>Trips</b>
                  <span>186</span>
                </div>
                <div>
                  <b>Ratings</b>
                  <span>166</span>
                </div>
                <div>
                  <b>Average</b>
                  <span>
                    4.92 <FaStar color="#FDB022" />
                  </span>
                </div>
              </div>
            </div>
            {cats.map(([t, p, chips]) => (
              <div className="r-card" key={t}>
                <div className="r-card__head">
                  <b>{t}</b>
                  <b>{p}</b>
                </div>
                <div className="chips">
                  {chips.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3>Reviews</h3>
            <small className="muted-sm">Percentage of 5-star ratings, including unrated trips</small>
            {(all ? [...reviewers, ...reviewers] : reviewers).map((n, i) => (
              <div className="rv" key={i}>
                <img src={img(`rv-${(i % 6) + 1}.jpg`)} alt="" />
                <div>
                  <span className="stars-row stars-row--lg">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FaStar key={s} color="#FDB022" />
                    ))}
                  </span>
                  <p className="rv__who">
                    {n} <span>•</span> July 3, 2026
                  </p>
                  <p className="rv__car">
                    Nissan Pathfinder 2025 <span>•</span> NY <span>•</span> WB12339A
                  </p>
                  <p>{LOREM_SHORT}</p>
                  <button type="button" className="btn-mini">
                    Leave a public response
                  </button>
                </div>
              </div>
            ))}
            <div className="right">
              <button type="button" className="btn-mini btn-mini--dark" onClick={() => setAll(!all)}>
                {all ? 'Show Less' : 'Show All'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {cal && <DateRangeModal onClose={() => setCal(false)} />}
    </Layout>
  );
}
