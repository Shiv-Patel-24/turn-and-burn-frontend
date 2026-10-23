import { createContext, useContext, useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

/* ---------- Global UI state (auth modals, side menus, logout confirm) ---------- */

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [modal, setModal] = useState(null); // { name, props }
  const open = (name, props = {}) => setModal({ name, props });
  const close = () => setModal(null);
  return <UIContext.Provider value={{ modal, open, close }}>{children}</UIContext.Provider>;
}

export const useUI = () => useContext(UIContext);

/* ---------- Modal shell ---------- */

export function Modal({ open = true, onClose, children, width = 640, className = '', align = 'center', bare = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className={`overlay overlay--${align}`} onMouseDown={(e) => e.target === e.currentTarget && onClose && onClose()}>
      <div className={`${bare ? '' : 'modal'} ${className}`} style={{ width: `min(${width}px, calc(100vw - 32px))` }} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, onClose, sub, center }) {
  return (
    <div className={`modal__head ${center ? 'modal__head--center' : ''}`}>
      <div>
        <h2 className="modal__title">{title}</h2>
        {sub && <p className="modal__sub">{sub}</p>}
      </div>
      {onClose && (
        <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
          <IoClose size={26} />
        </button>
      )}
    </div>
  );
}

/* ---------- Form primitives ---------- */

export function Field({ label, children, className = '', hint }) {
  return (
    <label className={`field ${className}`}>
      {label && <span className="field__label">{label}</span>}
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return <input className="input" {...props} />;
}

export function Select({ value = '', onChange, options = [], placeholder, className = '' }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <div className={`select ${className} ${v === '' ? 'is-empty' : ''}`}>
      <select
        className="input"
        value={v}
        onChange={(e) => {
          setV(e.target.value);
          if (onChange) onChange(e.target.value);
        }}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <FiChevronDown className="select__chev" size={22} />
    </div>
  );
}

export function Checkbox({ checked, onChange, children, className = '' }) {
  return (
    <label className={`check ${className}`}>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange && onChange(e.target.checked)} />
      <span className="check__box">{checked && <FiCheck size={16} strokeWidth={3} />}</span>
      {children && <span className="check__label">{children}</span>}
    </label>
  );
}

export function Radio({ checked, onChange, children, name, className = '' }) {
  return (
    <label className={`radio ${className}`}>
      <input type="radio" name={name} checked={!!checked} onChange={() => onChange && onChange()} />
      <span className="radio__dot" />
      {children && <span className="radio__label">{children}</span>}
    </label>
  );
}

export function Toggle({ on, onChange }) {
  return (
    <button type="button" className={`toggle ${on ? 'is-on' : ''}`} onClick={() => onChange(!on)} aria-pressed={on}>
      <span />
    </button>
  );
}

export function Stars({ value = 5, size = 16, className = '' }) {
  return (
    <span className={`stars ${className}`}>
      {[1, 2, 3, 4, 5].map((i) =>
        i <= value ? <FaStar key={i} size={size} color="#FDB022" /> : <FaRegStar key={i} size={size} color="#90a3bf" />,
      )}
    </span>
  );
}

export function StarInput({ value, onChange, size = 34 }) {
  return (
    <div className="star-input">
      {[1, 2, 3, 4, 5].map((i) => (
        <button type="button" key={i} onClick={() => onChange(i)} aria-label={`${i} stars`}>
          {i <= value ? <FaStar size={size} color="#FDAC3A" /> : <FaRegStar size={size} color="#90a3bf" />}
        </button>
      ))}
    </div>
  );
}

/* Generic dropdown/popover anchored to a trigger */
export function Popover({ trigger, children, align = 'left', width }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    const t = setTimeout(() => document.addEventListener('click', close), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', close);
    };
  }, [open]);
  return (
    <div className="popover-wrap">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div className={`popover popover--${align}`} style={width ? { width } : undefined} onClick={(e) => e.stopPropagation()}>
          {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
        </div>
      )}
    </div>
  );
}
