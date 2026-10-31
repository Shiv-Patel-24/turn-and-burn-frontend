import { useState, useEffect } from 'react';
import { FiChevronDown, FiSearch, FiMoreVertical, FiCheck } from 'react-icons/fi';
import { IoCarSportOutline } from 'react-icons/io5';
import { TbArrowsSort, TbFilter } from 'react-icons/tb';
import { Popover, Checkbox, Radio } from '../../ui';
import { fleetThumbs } from '../../data';
import { apiRequest } from '../../lib/api';

export function SearchField({ value, onChange, placeholder = 'Model name, license plate number...', className = '' }) {
  return (
    <label className={`tool-search ${className}`}>
      <input placeholder={placeholder} value={value || ''} onChange={(e) => onChange && onChange(e.target.value)} />
      <FiSearch size={22} />
    </label>
  );
}

function ToolButton({ icon, label, onClick }) {
  return (
    <button type="button" className="tool-btn" onClick={onClick}>
      {icon}
      {label}
      <FiChevronDown size={22} />
    </button>
  );
}

function PopFooter({ close, primary = 'Apply', onReset, onPrimary }) {
  return (
    <div className="pop-foot">
      <button type="button" className="btn btn-outline-muted" onClick={onReset}>
        Reset
      </button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          if (onPrimary) onPrimary();
          close();
        }}
      >
        {primary}
      </button>
    </div>
  );
}

/* Figma: "Frame 2147239887" — Sort by */
const sorts = [
  'Make/model/year (A-Z)', 'Make/model/year (Z-A)', 'License plate (A-Z)', 'License plate (Z-A)',
  'Today’s price (High to low)', 'Today’s price (Low to high)', 'Booked days (Most to least)', 'Booked days (Least to most)',
];
export function SortPopover({ value = 0, onChange }) {
  const [v, setV] = useState(value);
  return (
    <Popover align="right" width={524} trigger={({ toggle }) => <ToolButton icon={<TbArrowsSort size={22} />} label="Short by" onClick={toggle} />}>
      {({ close }) => (
        <div className="pop-list">
          {sorts.map((s, i) => (
            <Radio key={s} name="sort" checked={v === i} onChange={() => {
              setV(i);
              if (onChange) onChange(i);
            }} className="radio--row">
              {s}
              {i > 5 && <small> Based on next 30 days</small>}
            </Radio>
          ))}
          <PopFooter close={close} onReset={() => {
            setV(0);
            if (onChange) onChange(0);
          }} />
        </div>
      )}
    </Popover>
  );
}

/* Figma: "Frame 2147239885" — Listing status */
export function ListingStatusPopover({ value, onChange }) {
  const current = value || { Listed: true, Unlisted: true, Snoozed: true };
  const [v, setV] = useState(current);
  return (
    <Popover align="right" width={524} trigger={({ toggle }) => <ToolButton icon={<TbFilter size={22} />} label="Listing Status" onClick={toggle} />}>
      {({ close }) => (
        <div className="pop-list">
          {Object.keys(v).map((k) => (
            <Checkbox key={k} checked={v[k]} onChange={(c) => {
              const updated = { ...v, [k]: c };
              setV(updated);
              if (onChange) onChange(updated);
            }} className="check--row">
              {k}
            </Checkbox>
          ))}
          <PopFooter close={close} primary="Show vehicles" onReset={() => {
            const reset = { Listed: true, Unlisted: true, Snoozed: true };
            setV(reset);
            if (onChange) onChange(reset);
          }} />
        </div>
      )}
    </Popover>
  );
}

/* Figma: "Frame 2147239888" — Trip status */
export function TripStatusPopover() {
  const [v, setV] = useState(0);
  const opts = [
    ['CURRENT AVAILABILITY', 'Make/model/year (A-Z)'],
    [null, 'Make/model/year (Z-A)'],
    ['FUTURE AVAILABILITY', 'License plate (A-Z)'],
    [null, 'License plate (Z-A)'],
  ];
  return (
    <Popover align="right" width={524} trigger={({ toggle }) => <ToolButton icon={<TbFilter size={22} />} label="Trip Status" onClick={toggle} />}>
      {({ close }) => (
        <div className="pop-list">
          {opts.map(([h, o], i) => (
            <div key={o}>
              {h && <h6 className="pop-list__h">{h}</h6>}
              <Radio name="trip" checked={v === i} onChange={() => setV(i)} className="radio--row">
                {o}
              </Radio>
            </div>
          ))}
          <PopFooter close={close} onReset={() => setV(0)} />
        </div>
      )}
    </Popover>
  );
}

/* Figma: "Frame 2147239886" — Vehicle picker */
export function VehiclePopover({ selectedVehicles, onSelectionChange }) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    let active = true;
    apiRequest('/vehicles')
      .then((res) => {
        if (!active) return;
        const list = res?.data || [];
        if (Array.isArray(list)) {
          setVehicles(list);
          setSelectedIds(list.map((v) => v._id || v.id));
        }
      })
      .catch(() => {
        setVehicles([]);
        setSelectedIds([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleApply = (close) => {
    if (onSelectionChange) onSelectionChange(selectedIds);
    close();
  };

  return (
    <Popover align="right" width={480} trigger={({ toggle }) => <ToolButton icon={<IoCarSportOutline size={22} />} label="Vehicle" onClick={toggle} />}>
      {({ close }) => (
        <div className="pop-list">
          <div className="veh-pick">
            {vehicles.map((v, i) => {
              const vId = v._id || v.id || i;
              const photo = v.photos?.[0]?.url || v.photos?.[0] || v.photo || fleetThumbs[i % fleetThumbs.length];
              const title = v.name || `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim() || `Vehicle #${i + 1}`;
              const plate = v.licensePlate ? `Plate: ${v.licensePlate}` : '';
              const isChecked = selectedIds.includes(vId);

              return (
                <button
                  type="button"
                  key={vId}
                  className="veh-pick__row"
                  style={{ backgroundImage: `url(${photo})` }}
                  onClick={() => toggleOne(vId)}
                >
                  <div style={{ position: 'relative', zIndex: 1, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    <b style={{ fontSize: 13, fontWeight: 700 }}>{title}</b>
                    {plate && <small style={{ display: 'block', opacity: 0.9 }}>{plate}</small>}
                  </div>
                  <i className={isChecked ? 'is-on' : ''}>
                    {isChecked && <FiCheck size={18} strokeWidth={3} />}
                  </i>
                </button>
              );
            })}
          </div>
          <PopFooter
            close={close}
            primary="Show vehicles"
            onReset={() => setSelectedIds([])}
            onPrimary={() => handleApply(close)}
          />
        </div>
      )}
    </Popover>
  );
}

/* Figma: "Component 1144" — status badge + kebab menu */
export function StatusMenu({ status, onChange, small }) {
  return (
    <div className={`status-menu ${small ? 'status-menu--sm' : ''}`}>
      <span className={`badge badge--${status.toLowerCase()}`}>{status}</span>
      <Popover
        align="right"
        width={180}
        trigger={({ toggle }) => (
          <button type="button" className="kebab" aria-label="Change status" onClick={toggle}>
            <FiMoreVertical size={small ? 14 : 20} />
          </button>
        )}
      >
        {({ close }) => (
          <div className="kebab-menu">
            {['Listed', 'Unlisted', 'Snoozed'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onChange && onChange(s);
                  close();
                }}
              >
                Mark as {s.toLowerCase()} {status === s && <FiCheck color="#0075ff" />}
              </button>
            ))}
          </div>
        )}
      </Popover>
    </div>
  );
}

export function Thumb({ src, small, carName, plate }) {
  return (
    <div className={`thumb ${small ? 'thumb--sm' : ''}`} style={{ backgroundImage: `url(${src})` }} role="img" aria-label={carName || 'Vehicle'}>
      {(carName || plate) && (
        <span style={{ position: 'relative', zIndex: 1, textShadow: '0 1px 4px rgba(0,0,0,0.85)', background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', width: '100%' }}>
          {carName && <b>{carName}</b>}
          {plate && <small>{plate}</small>}
        </span>
      )}
    </div>
  );
}
