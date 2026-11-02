import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { navigate } from '../router';
import { IoCarSportOutline } from 'react-icons/io5';
import { FiTrendingUp, FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi';

export function CityPriceWidget({ defaultCity = '' }) {
  const [city, setCity] = useState(defaultCity);
  const [days, setDays] = useState(3);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cities = [
    { label: 'All Cities', value: '' },
    { label: 'Charlotte', value: 'Charlotte' },
    { label: 'New York', value: 'New York' },
    { label: 'Miami', value: 'Miami' },
    { label: 'Atlanta', value: 'Atlanta' },
    { label: 'Los Angeles', value: 'Los Angeles' },
  ];

  const durations = [
    { label: '1 Day', value: 1 },
    { label: '3 Days', value: 3 },
    { label: '7 Days', value: 7 },
    { label: '14 Days', value: 14 },
    { label: '30 Days', value: 30 },
  ];

  useEffect(() => {
    let active = true;
    setLoading(true);
    const qCity = city ? `city=${encodeURIComponent(city)}&` : '';
    apiRequest(`/content/city-prices?${qCity}days=${days}`)
      .then((res) => {
        if (!active) return;
        if (res?.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.warn('Could not load city prices:', err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [city, days]);

  const rows = data?.byStyle || [];

  return (
    <section className="container" style={{ margin: '54px auto 32px' }}>
      <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 28px' }}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#0a5cff',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            backgroundColor: '#eff6ff',
            padding: '4px 12px',
            borderRadius: '999px',
            display: 'inline-block',
            marginBottom: '8px',
          }}
        >
          MARKET PRICING & INSIGHTS
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: '4px 0 8px' }}>
          Transparent Rates for Every Journey
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.5, margin: 0 }}>
          Real-time average rental prices calculated across our verified host fleets by city and trip duration.
        </p>
      </div>

      {/* City & Duration Toggles */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          background: '#ffffff',
          padding: '16px 20px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          marginBottom: '24px',
        }}
      >
        {/* City Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <FiMapPin size={16} color="#0a5cff" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginRight: '4px' }}>City:</span>
          {cities.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setCity(c.value)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                background: city === c.value ? '#0a5cff' : '#f1f5f9',
                color: city === c.value ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Duration Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <FiCalendar size={16} color="#0a5cff" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginRight: '4px' }}>Trip Length:</span>
          {durations.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => setDays(d.value)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                background: days === d.value ? '#0f172a' : '#f1f5f9',
                color: days === d.value ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid #bfdbfe',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            <FiTrendingUp size={16} /> Average Daily Rate
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#1e3a8a' }}>
            ${loading ? '...' : (data?.overallAverageDaily || 0).toFixed(2)}
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#3b82f6' }}> / day</span>
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid #bbf7d0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            <FiCalendar size={16} /> Total for {days} Day{days > 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#14532d' }}>
            ${loading ? '...' : (data?.overallAverageTrip || 0).toFixed(2)}
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#22c55e' }}> est. total</span>
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid #e9d5ff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7e22ce', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            <IoCarSportOutline size={18} /> Active Fleet Analyzed
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#581c87' }}>
            {loading ? '...' : (data?.cars || 0)}
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#a855f7' }}> verified cars</span>
          </div>
        </div>
      </div>

      {/* Style Breakdown Grid */}
      {rows.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {rows.map((r) => (
            <div
              key={r.style}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '18px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '16px', color: '#0f172a' }}>{r.style}</strong>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      padding: '2px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    {r.cars} vehicle{r.cars > 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '10px 0 4px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Daily Rate:</span>
                  <strong style={{ fontSize: '18px', color: '#0a5cff' }}>${r.averageDaily.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{days}-Day Trip:</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>${r.averageTrip.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const hasToken = Boolean(localStorage.getItem('turn_and_burn_access_token'));
                  navigate(`${hasToken ? '/app/cars' : '/cars'}?style=${encodeURIComponent(r.style)}`);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  padding: '9px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#0a5cff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>Browse {r.style}s</span>
                <FiArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

