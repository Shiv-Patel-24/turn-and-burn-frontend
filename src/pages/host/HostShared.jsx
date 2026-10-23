import { useState } from 'react';
import { FiChevronDown, FiSearch, FiMoreVertical, FiCheck } from 'react-icons/fi';
import { IoCarSportOutline } from 'react-icons/io5';
import { TbArrowsSort, TbFilter } from 'react-icons/tb';
import { Popover, Checkbox, Radio } from '../../ui';
import { fleetThumbs } from '../../data';

export function SearchField({ placeholder = 'Model name, license plate number...', className = '' }) {
  return (
    <label className={`tool-search ${className}`}>
      <input placeholder={placeholder} />
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

function PopFooter({ close, primary = 'Apply', onReset }) {
  return (
    <div className="pop-foot">
      <button type="button" className="btn btn-outline-muted" onClick={onReset}>
        Reset
      </button>
      <button type="button" className="btn btn-primary" onClick={close}>
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
export function SortPopover() {
  const [v, setV] = useState(0);
  return (
    <Popover align="right" width={524} trigger={({ toggle }) => <ToolButton icon={<TbArrowsSort size={22} />} label="Short by" onClick={toggle} />}>
      {({ close }) => (
        <div className="pop-list">
          {sorts.map((s, i) => (
            <Radio key={s} name="sort" checked={v === i} onChange={() => setV(i)} className="radio--row">
              {s}
              {i > 5 && <small> Based on next 30 days</small>}
            </Radio>
          ))}
          <PopFooter close={close} onReset={() => setV(0)} />
        </div>
      )}
    </Popover>
  );
}

/* Figma: "Frame 2147239885" — Listing status */
export function ListingStatusPopover() {
  const [v, setV] = useState({ Listed: true, Unlisted: false, Snoozed: false });
  return (
    <Popover align="right" width={524} trigger={({ toggle }) => <ToolButton icon={<TbFilter size={22} />} label="Listing Status" onClick={toggle} />}>
      {({ close }) => (
        <div className="pop-list">
          {Object.keys(v).map((k) => (
            <Checkbox key={k} checked={v[k]} onChange={(c) => setV({ ...v, [k]: c })} className="check--row">
              {k}
            </Checkbox>
          ))}
          <PopFooter close={close} primary="Show vehicles" onReset={() => setV({ Listed: false, Unlisted: false, Snoozed: false })} />
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
export function VehiclePopover() {
  const [sel, setSel] = useState(fleetThumbs.map(() => true));
  return (
    <Popover align="right" width={524} trigger={({ toggle }) => <ToolButton icon={<IoCarSportOutline size={22} />} label="Vehicle" onClick={toggle} />}>
      {({ close }) => (
        <div className="pop-list">
          <div className="veh-pick">
            {fleetThumbs.map((t, i) => (
              <button type="button" key={i} className="veh-pick__row" style={{ backgroundImage: `url(${t})` }} onClick={() => setSel(sel.map((s, k) => (k === i ? !s : s)))}>
                <span />
                <i className={sel[i] ? 'is-on' : ''}>{sel[i] && <FiCheck size={20} strokeWidth={3} />}</i>
              </button>
            ))}
          </div>
          <PopFooter close={close} primary="Show vehicles" onReset={() => setSel(sel.map(() => false))} />
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

export function Thumb({ src, small }) {
  return (
    <div className={`thumb ${small ? 'thumb--sm' : ''}`} style={{ backgroundImage: `url(${src})` }} role="img" aria-label="Nissan Pathfinder 2025, WB12339A" />
  );
}
