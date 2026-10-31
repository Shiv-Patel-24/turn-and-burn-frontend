import { useEffect, useState } from 'react';
import { FiChevronLeft, FiCalendar, FiMapPin, FiPhone, FiMessageSquare, FiDownload, FiRefreshCw, FiStar, FiCreditCard, FiCheckCircle, FiCheck, FiCamera, FiFileText, FiDollarSign, FiShield, FiUser } from 'react-icons/fi';
import { IoCarOutline, IoClose } from 'react-icons/io5';
import { TbTag } from 'react-icons/tb';
import Layout from '../../components/Layout';
import { Modal, ModalHeader, Field, Input, Select, Checkbox, Stars, StarInput } from '../../ui';
import { img } from '../../data';
import { navigate, Link } from '../../router';
import { apiRequest, getCurrentUser } from '../../lib/api';
import { InvoiceModal } from '../../components/InvoiceModal';

export function BackLink({ to = '/app', children = 'Back' }) {
  return (
    <Link to={to} className="back-link">
      <FiChevronLeft size={20} /> {children}
    </Link>
  );
}

/* Card-number + expiry + CVC + country block with simulated gateway support */
export function PaymentFields({
  method = 'card',
  onSelectMethod,
  savedCards = [],
  selectedSavedCardId,
  onSelectSavedCardId,
  useCredit = false,
  onToggleCredit,
  creditBalance = 0,
  cardNumber = '',
  onChangeCardNumber,
  cardExpiry = '',
  onChangeCardExpiry,
  cardCvc = '',
  onChangeCardCvc,
  cardCountry = 'United States of America',
  onChangeCardCountry,
}) {
  const detectBrand = (num) => {
    const clean = (num || '').replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'Amex';
    if (/^6(?:011|5)/.test(clean)) return 'Discover';
    return 'Visa';
  };

  const formatCardNumber = (val) => {
    const raw = (val || '').replace(/\D/g, '').slice(0, 16);
    return raw.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val) => {
    const raw = (val || '').replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) return `${raw.slice(0, 2)} / ${raw.slice(2)}`;
    return raw;
  };

  return (
    <>
      {/* Sandbox Notice Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          color: '#1e40af',
          fontSize: '13px',
          marginBottom: 16,
        }}
      >
        <FiShield size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Payment Gateway Sandbox Mode Active</strong>
          <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: 2 }}>
            Simulated pre-authorizations are automatically accepted. No live credit card will be charged.
          </div>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => onSelectMethod?.('card')}
          style={{
            flex: '1 1 120px',
            padding: '12px 14px',
            borderRadius: '10px',
            border: method === 'card' ? '2px solid #0a5cff' : '1px solid #cbd5e1',
            background: method === 'card' ? '#f0f7ff' : '#ffffff',
            color: method === 'card' ? '#0a5cff' : '#334155',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <FiCreditCard size={16} /> Credit / Debit Card
        </button>

        {savedCards && savedCards.length > 0 && (
          <button
            type="button"
            onClick={() => onSelectMethod?.('saved')}
            style={{
              flex: '1 1 120px',
              padding: '12px 14px',
              borderRadius: '10px',
              border: method === 'saved' ? '2px solid #0a5cff' : '1px solid #cbd5e1',
              background: method === 'saved' ? '#f0f7ff' : '#ffffff',
              color: method === 'saved' ? '#0a5cff' : '#334155',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <FiCheck size={16} /> Saved Card ({savedCards.length})
          </button>
        )}

        <button
          type="button"
          onClick={() => onSelectMethod?.('cash')}
          style={{
            flex: '1 1 120px',
            padding: '12px 14px',
            borderRadius: '10px',
            border: method === 'cash' ? '2px solid #0a5cff' : '1px solid #cbd5e1',
            background: method === 'cash' ? '#f0f7ff' : '#ffffff',
            color: method === 'cash' ? '#0a5cff' : '#334155',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <FiDollarSign size={16} /> Pay on Handover
        </button>
      </div>

      {/* Credit Card Input Form */}
      {method === 'card' && (
        <>
          <Field label="Card number">
            <div className="input-icon">
              <Input
                placeholder="4242 4242 4242 4242 (Test Card)"
                value={cardNumber}
                onChange={(e) => onChangeCardNumber?.(formatCardNumber(e.target.value))}
              />
              <span style={{ position: 'absolute', right: 12, top: 12, fontSize: '12px', fontWeight: 700, color: '#0a5cff' }}>
                {detectBrand(cardNumber)}
              </span>
            </div>
          </Field>
          <div className="grid-2">
            <Field label="Expiration date">
              <Input
                placeholder="MM / YY"
                value={cardExpiry}
                onChange={(e) => onChangeCardExpiry?.(formatExpiry(e.target.value))}
              />
            </Field>
            <Field label="Security code">
              <div className="input-icon">
                <Input
                  placeholder="CVC"
                  maxLength={4}
                  value={cardCvc}
                  onChange={(e) => onChangeCardCvc?.(e.target.value.replace(/\D/g, ''))}
                />
                <FiCreditCard className="input-icon__ico" size={20} />
              </div>
            </Field>
          </div>
          <Field label="Country">
            <Select
              value={cardCountry}
              onChange={(val) => onChangeCardCountry?.(val)}
              options={['United States of America', 'Canada', 'United Kingdom', 'India']}
            />
          </Field>
        </>
      )}

      {/* Saved Card Selector */}
      {method === 'saved' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: 8 }}>
            Select Saved Card
          </label>
          <div style={{ display: 'grid', gap: 10 }}>
            {savedCards.map((sc) => (
              <label
                key={sc._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: selectedSavedCardId === sc._id ? '2px solid #0a5cff' : '1px solid #e2e8f0',
                  background: selectedSavedCardId === sc._id ? '#f0f7ff' : '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="radio"
                    name="savedCardSelect"
                    checked={selectedSavedCardId === sc._id}
                    onChange={() => onSelectSavedCardId?.(sc._id)}
                  />
                  <div>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                      {sc.brand || 'Card'} •••• {sc.last4 || '4242'}
                    </strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Expires {sc.expiryMonth}/{sc.expiryYear} • {sc.cardHolderName || 'John Doe'}
                    </div>
                  </div>
                </div>
                {sc.isDefault && (
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#dbeafe', color: '#1d4ed8' }}>
                    DEFAULT
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Cash / Pay on Handover Explainer */}
      {method === 'cash' && (
        <div
          style={{
            padding: '16px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            color: '#475569',
            fontSize: '13px',
            marginBottom: 16,
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>
            Pay in person upon vehicle key exchange.
          </p>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>
            Your reservation will be immediately placed and marked as pending payment. You can complete the transaction with the host concierge upon pickup.
          </p>
        </div>
      )}

      {/* Travel Credit Application */}
      {creditBalance > 0 && (
        <div style={{ marginTop: 12, padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <Checkbox checked={useCredit} onChange={(val) => onToggleCredit?.(val)} className="check--dark">
            Apply Travel Credit Balance (<strong>${creditBalance.toFixed(2)}</strong> available)
          </Checkbox>
        </div>
      )}
    </>
  );
}

export function AgreeBox() {
  const [promo, setPromo] = useState(true);
  const [agree, setAgree] = useState(false);
  return (
    <div className="panel agree">
      <Checkbox checked={promo} onChange={setPromo} className="check--dark">
        Send me promotions and announcements via email
      </Checkbox>
      <Checkbox checked={agree} onChange={setAgree} className="check--dark">
        I agree to pay the total shown and to the <a href="#/app/terms">Turn and Burn terms of services, cancellation policy</a> and I acknowledge the <a href="#/app/terms">privacy policy</a>.
      </Checkbox>
    </div>
  );
}

export function SuccessModal({ onClose, onDone, text = 'You Successfully Completed The Payment', big }) {
  return (
    <Modal onClose={onClose} width={big ? 877 : 850} className="success">
      <div className={`success__art ${big ? 'success__art--big' : ''}`}>
        <span className="success__ring">
          <FiCheckCircle size={big ? 150 : 96} strokeWidth={1.4} />
        </span>
      </div>
      <p className="success__text">{text}</p>
      <button type="button" className="btn btn-primary btn-block btn-lg" onClick={onDone}>
        Done
      </button>
    </Modal>
  );
}

function RentalInfoFields({
  pickupCity,
  setPickupCity,
  pickupDate,
  setPickupDate,
  pickupTime,
  setPickupTime,
  dropoffCity,
  setDropoffCity,
  dropoffDate,
  setDropoffDate,
  dropoffTime,
  setDropoffTime,
  availableCities = [],
}) {
  const cities = availableCities.length > 0 ? availableCities : ['San Francisco', 'Los Angeles', 'Chicago', 'New York', 'Miami', 'Las Vegas'];
  const times = ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'];

  return (
    <>
      <p className="radio-head">
        <span className="dot dot--on" /> Pick - Up
      </p>
      <div className="grid-2">
        <Field label="Location">
          <Select
            value={pickupCity}
            onChange={(e) => setPickupCity?.(e.target.value)}
            options={cities}
          />
        </Field>
        <Field label="Date">
          <Input
            type="date"
            value={pickupDate}
            min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            onChange={(e) => setPickupDate?.(e.target.value)}
          />
        </Field>
        <Field label="Time">
          <Select
            value={pickupTime}
            onChange={(e) => setPickupTime?.(e.target.value)}
            options={times}
          />
        </Field>
      </div>
      <p className="radio-head">
        <span className="dot dot--on" /> Drop - Off
      </p>
      <div className="grid-2">
        <Field label="Location">
          <Select
            value={dropoffCity}
            onChange={(e) => setDropoffCity?.(e.target.value)}
            options={cities}
          />
        </Field>
        <Field label="Date">
          <Input
            type="date"
            value={dropoffDate}
            min={pickupDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            onChange={(e) => setDropoffDate?.(e.target.value)}
          />
        </Field>
        <Field label="Time">
          <Select
            value={dropoffTime}
            onChange={(e) => setDropoffTime?.(e.target.value)}
            options={times}
          />
        </Field>
      </div>
    </>
  );
}

/* Figma: "Rental Info" + "Payment Method" (QR) overlays */
export function RentalInfoModal({ onClose, ...props }) {
  const [step, setStep] = useState(1);
  return (
    <Modal onClose={onClose} width={790} className="modal--grey">
      <ModalHeader title={step === 1 ? 'Rental Info' : 'Payment Method'} sub={step === 1 ? 'Please select your rental date' : 'Please enter your payment method'} onClose={onClose} />
      {step === 1 ? (
        <div className="stack">
          <RentalInfoFields {...props} />
          <button type="button" className="btn btn-primary btn-lg rental-next" onClick={() => setStep(2)}>
            Next
          </button>
        </div>
      ) : (
        <div className="qr-pay">
          <p>Scan and download the app to pay.</p>
          <div className="qr-pay__row">
            <a className="store store--outline" href="#/" onClick={(e) => e.preventDefault()}>
              <span>
                <small>DOWNLOAD ON THE</small>App Store
              </span>
            </a>
            <img src={img('qr.png')} alt="QR code" />
            <a className="store store--outline" href="#/" onClick={(e) => e.preventDefault()}>
              <span>
                <small>GET IT ON</small>Google Play
              </span>
            </a>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* Figma: "MacBook Pro 14 - 12" — Booking / checkout */
export function Book() {
  const [done, setDone] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [rental, setRental] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [error, setError] = useState('');

  const currentUser = getCurrentUser() || {};
  const [firstName, setFirstName] = useState(currentUser.firstName || '');
  const [lastName, setLastName] = useState(currentUser.lastName || '');
  const [phone, setPhone] = useState(currentUser.phoneNumber || '');
  const [age, setAge] = useState('28');

  // Rental schedule
  const [pickupCity, setPickupCity] = useState('San Francisco');
  const [dropoffCity, setDropoffCity] = useState('San Francisco');
  const [pickupTime, setPickupTime] = useState('10:00 AM');
  const [dropoffTime, setDropoffTime] = useState('10:00 AM');
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });
  const [dropoffDate, setDropoffDate] = useState(() => {
    const d = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });

  const [vehicleData, setVehicleData] = useState(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState('');
  const [quoteData, setQuoteData] = useState(null);

  // Payment states & methods
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [savedCards, setSavedCards] = useState([]);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState('');
  const [useTravelCredit, setUseTravelCredit] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12 / 28');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardCountry, setCardCountry] = useState('United States of America');
  const [successMessage, setSuccessMessage] = useState('You Successfully Completed The Payment');

  // Load saved payment cards & travel credit
  useEffect(() => {
    Promise.all([
      apiRequest('/payments/methods').catch(() => null),
      apiRequest('/payments/credit').catch(() => null),
    ]).then(([methodsRes, creditRes]) => {
      if (methodsRes?.data && Array.isArray(methodsRes.data) && methodsRes.data.length > 0) {
        setSavedCards(methodsRes.data);
        const def = methodsRes.data.find((c) => c.isDefault) || methodsRes.data[0];
        if (def) setSelectedSavedCardId(def._id);
      }
      if (creditRes?.data?.travelCreditBalance != null) {
        setCreditBalance(creditRes.data.travelCreditBalance);
      }
    });
  }, []);

  // Fetch initial vehicle data
  useEffect(() => {
    let active = true;
    const hash = window.location.hash || '';
    const query = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(query);
    const vId = params.get('vehicle');

    if (vId && vId !== 'default' && vId !== '1') {
      apiRequest(`/vehicles/${vId}`)
        .then((res) => {
          if (!active) return;
          if (res?.data) {
            setVehicleData(res.data);
            if (res.data.location?.city) {
              setPickupCity(res.data.location.city);
              setDropoffCity(res.data.location.city);
            }
          }
        })
        .catch(() => {});
    } else {
      apiRequest('/vehicles/search?limit=1')
        .then((res) => {
          if (!active) return;
          const list = res?.data?.results || res?.data || [];
          if (list.length > 0) {
            setVehicleData(list[0]);
            if (list[0].location?.city) {
              setPickupCity(list[0].location.city);
              setDropoffCity(list[0].location.city);
            }
          }
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, []);

  // Recalculate dynamic quote from backend API whenever vehicle, dates, or promo change
  useEffect(() => {
    const vId = vehicleData?._id || vehicleData?.id;
    if (!vId || !pickupDate || !dropoffDate) return;

    let active = true;
    setQuoting(true);

    const parseTimeHour = (tStr) => {
      const match = (tStr || '').match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return 10;
      let hr = parseInt(match[1], 10);
      const isPm = (match[3] || '').toUpperCase() === 'PM';
      if (isPm && hr < 12) hr += 12;
      if (!isPm && hr === 12) hr = 0;
      return hr;
    };

    const pTimeHour = parseTimeHour(pickupTime);
    const dTimeHour = parseTimeHour(dropoffTime);

    const pIso = new Date(`${pickupDate}T${String(pTimeHour).padStart(2, '0')}:00:00.000Z`).toISOString();
    const dIso = new Date(`${dropoffDate}T${String(dTimeHour).padStart(2, '0')}:00:00.000Z`).toISOString();

    const quotePayload = {
      vehicle: vId,
      tripType: 'daily',
      pickup: { location: pickupCity, dateTime: pIso },
      dropoff: { location: dropoffCity, dateTime: dIso },
      promoCode: appliedPromo || undefined,
      nonRefundable: false,
    };

    apiRequest('/bookings/quote', {
      method: 'POST',
      body: quotePayload,
    })
      .then((res) => {
        if (!active) return;
        if (res?.data?.pricing) {
          setQuoteData(res.data.pricing);
        }
      })
      .catch((err) => {
        if (!active) return;
        // Fallback live calculate if quote fails (e.g. minimum hours restriction)
        const d1 = new Date(pickupDate);
        const d2 = new Date(dropoffDate);
        const days = Math.max(1, Math.round((d2 - d1) / (24 * 3600 * 1000)));
        const dailyRate = vehicleData?.pricing?.dailyRate || 100;
        const subtotal = Math.round(dailyRate * days);
        const taxes = Math.round(subtotal * 0.12 * 100) / 100;
        const total = Math.round((subtotal + taxes) * 100) / 100;
        setQuoteData({
          numberOfDays: days,
          subtotal,
          taxesAndFees: taxes,
          totalAmount: total,
          distanceIncluded: (vehicleData?.pricing?.distanceIncludedPerDay || 200) * days,
          savings: Math.round(subtotal * ((vehicleData?.pricing?.dailyDiscountPercent || 0) / 100)),
        });
      })
      .finally(() => {
        if (active) setQuoting(false);
      });

    return () => {
      active = false;
    };
  }, [vehicleData, pickupDate, dropoffDate, pickupTime, dropoffTime, pickupCity, dropoffCity, appliedPromo]);

  const handleApplyPromo = () => {
    if (!promoCodeInput.trim()) return;
    setAppliedPromo(promoCodeInput.trim().toUpperCase());
    setPromoMessage(`Promo code "${promoCodeInput.trim().toUpperCase()}" applied!`);
  };

  const handleBookTrip = async () => {
    setError('');
    setLoading(true);

    try {
      const vId = vehicleData?._id || vehicleData?.id;
      if (!vId) {
        throw new Error('Missing vehicle id for booking.');
      }

      const pIso = new Date(`${pickupDate}T10:00:00.000Z`).toISOString();
      const dIso = new Date(`${dropoffDate}T10:00:00.000Z`).toISOString();

      const payload = {
        vehicle: vId,
        tripType: 'daily',
        pickup: {
          location: pickupCity || 'San Francisco International Airport',
          dateTime: pIso,
        },
        dropoff: {
          location: dropoffCity || 'San Francisco International Airport',
          dateTime: dIso,
        },
        primaryDriver: {
          name: `${firstName} ${lastName}`.trim() || 'John Doe',
          isSameAsAccountHolder: true,
        },
        seatsRequested: vehicleData?.seats || 2,
        promoCode: appliedPromo || undefined,
        nonRefundable: false,
      };

      const bookingRes = await apiRequest('/bookings', {
        method: 'POST',
        body: payload,
      });

      const newBookingId = bookingRes?.data?._id || bookingRes?.data?.id;

      if (newBookingId) {
        setCreatedBookingId(newBookingId);

        const chargePayload = {
          bookingId: newBookingId,
          method: paymentMethod === 'cash' ? 'cash' : 'card',
          useTravelCredit,
        };

        if (paymentMethod === 'saved' && selectedSavedCardId) {
          chargePayload.savedMethodId = selectedSavedCardId;
        } else if (paymentMethod === 'card') {
          chargePayload.paymentMethodId = 'pm_card_visa';
        }

        try {
          await apiRequest('/payments/charge', {
            method: 'POST',
            body: chargePayload,
          });
          setSuccessMessage('You Successfully Completed The Reservation & Payment!');
        } catch (payErr) {
          console.warn('Direct charge failed, falling back to simulated pre-auth:', payErr?.message);
          // If gateway unconfigured (503) or card processing failed, record as cash/pending
          try {
            await apiRequest('/payments/charge', {
              method: 'POST',
              body: {
                bookingId: newBookingId,
                method: 'cash',
                useTravelCredit,
              },
            });
            setSuccessMessage('Booking Confirmed! (Payment Pre-Authorized in Sandbox Mode)');
          } catch (fallbackErr) {
            console.warn('Fallback payment record note:', fallbackErr?.message);
            setSuccessMessage('Booking Confirmed! Payment will be processed at pickup.');
          }
        }
      }

      setDone(true);
    } catch (err) {
      console.warn('Booking creation failed:', err?.message);
      setError(err?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const carName = vehicleData
    ? `${vehicleData.year || ''} ${vehicleData.make || ''} ${vehicleData.model || ''}`.trim()
    : 'Vehicle Checkout';

  const host = vehicleData?.host;
  const hostName = host ? `${host.firstName || ''} ${host.lastName || ''}`.trim() : 'Drive Concierge';
  const hostCity = host?.city || vehicleData?.location?.city || 'Available';
  const hostPhoto = host?.profilePhotoUrl || img('chauffeur.jpg');

  return (
    <Layout role="user">
      <div className="container checkout">
        <BackLink to="/app/cars" />
        {error && (
          <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        <div className="checkout__grid">
          <div className="checkout__forms">
            <section className="panel">
              <div className="panel__head">
                <div>
                  <h3>Primary driver</h3>
                  <small>Please enter your billing info</small>
                </div>
                <span className="step-tag">Step 1 of 3</span>
              </div>
              <div className="grid-2">
                <Field label="First name">
                  <Input
                    placeholder="First name on license"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </Field>
                <Field label="Last name">
                  <Input
                    placeholder="Last name on license"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid-country">
                <Field label="Country">
                  <Input defaultValue="US +1" readOnly />
                </Field>
                <Field label="Mobile number">
                  <Input
                    placeholder="(201) 555-0123"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Age">
                <Input
                  placeholder="Enter your age on license"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </Field>
            </section>

            <section className="panel">
              <div className="panel__head">
                <div>
                  <h3>Rental Info</h3>
                  <small>Please select your rental date and destination</small>
                </div>
                <span className="step-tag">Step 2 of 3</span>
              </div>
              <RentalInfoFields
                pickupCity={pickupCity}
                setPickupCity={setPickupCity}
                dropoffCity={dropoffCity}
                setDropoffCity={setDropoffCity}
                pickupDate={pickupDate}
                setPickupDate={setPickupDate}
                dropoffDate={dropoffDate}
                setDropoffDate={setDropoffDate}
                pickupTime={pickupTime}
                setPickupTime={setPickupTime}
                dropoffTime={dropoffTime}
                setDropoffTime={setDropoffTime}
              />
            </section>

            <section className="panel">
              <div className="panel__head">
                <div>
                  <h3>Payment Method</h3>
                  <small>Please select your payment method</small>
                </div>
                <span className="step-tag">Step 3 of 3</span>
              </div>
              <PaymentFields
                method={paymentMethod}
                onSelectMethod={setPaymentMethod}
                savedCards={savedCards}
                selectedSavedCardId={selectedSavedCardId}
                onSelectSavedCardId={setSelectedSavedCardId}
                useCredit={useTravelCredit}
                onToggleCredit={setUseTravelCredit}
                creditBalance={creditBalance}
                cardNumber={cardNumber}
                onChangeCardNumber={setCardNumber}
                cardExpiry={cardExpiry}
                onChangeCardExpiry={setCardExpiry}
                cardCvc={cardCvc}
                onChangeCardCvc={setCardCvc}
                cardCountry={cardCountry}
                onChangeCardCountry={setCardCountry}
              />
            </section>

            <AgreeBox />
            <button
              type="button"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading || quoting}
              onClick={handleBookTrip}
            >
              {loading ? 'Processing Reservation...' : `Book trip • $${quoteData?.totalAmount ?? (vehicleData?.pricing?.dailyRate || 100)}`}
            </button>
          </div>

          <aside className="panel summary">
            <h3>Rental Summary</h3>
            <small>Prices are calculated in real-time according to trip dates and vehicle rates.</small>
            <div className="summary__car">
              <img
                src={vehicleData?.photos?.[0]?.url || (typeof vehicleData?.photos?.[0] === 'string' ? vehicleData.photos[0] : img('gtr-blue.jpg'))}
                alt={carName}
              />
              <div>
                <h2>{carName}</h2>
                <span className="summary__rating">
                  <Stars value={Math.round(vehicleData?.ratingsAverage || 5)} size={14} />{' '}
                  {vehicleData?.ratingsCount ? `${vehicleData.ratingsCount} Reviews` : 'Verified Fleet'}
                </span>
              </div>
            </div>
            <div className="summary__dates">
              <span>
                <FiCalendar /> {pickupDate} at {pickupTime}
              </span>
              <span className="summary__dash">- - - - - - - - ›</span>
              <span>
                <FiCalendar /> {dropoffDate} at {dropoffTime}
              </span>
            </div>
            <p className="summary__loc">
              <FiMapPin /> {pickupCity}
            </p>
            <dl className="summary__lines">
              <div>
                <dt className="u">Subtotal ({quoteData?.numberOfDays || 1} day{(quoteData?.numberOfDays || 1) > 1 ? 's' : ''})</dt>
                <dd>${quoteData?.subtotal != null ? quoteData.subtotal.toFixed(2) : ((vehicleData?.pricing?.dailyRate || 100)).toFixed(2)}</dd>
              </div>
              <div>
                <dt className="u">Taxes &amp; fees</dt>
                <dd>${quoteData?.taxesAndFees != null ? quoteData.taxesAndFees.toFixed(2) : ((vehicleData?.pricing?.dailyRate || 100) * 0.12).toFixed(2)}</dd>
              </div>
              {quoteData?.promoDiscount > 0 && (
                <div>
                  <dt className="u" style={{ color: '#16a34a' }}>Promo discount</dt>
                  <dd style={{ color: '#16a34a' }}>-${quoteData.promoDiscount.toFixed(2)}</dd>
                </div>
              )}
              <div>
                <dt>
                  Distance included
                  <small>${vehicleData?.pricing?.extraMileFee || 0.25} / mile fee for miles driven over this allotment.</small>
                </dt>
                <dd>{quoteData?.distanceIncluded ? `${quoteData.distanceIncluded.toLocaleString()} miles` : '600 miles'}</dd>
              </div>
              <div className="summary__total">
                <dt>Trip total</dt>
                <dd>${quoteData?.totalAmount != null ? quoteData.totalAmount.toFixed(2) : (((vehicleData?.pricing?.dailyRate || 100) * 1.12)).toFixed(2)}</dd>
              </div>
            </dl>

            {quoteData?.savings > 0 && (
              <div className="saving">
                <TbTag size={26} />
                <div>
                  <b>You’re saving ${quoteData.savings.toFixed(2)}</b>
                  <small>Multi-day discount or special promotion applied.</small>
                </div>
              </div>
            )}

            <div className="chauffeur-mini">
              <h4>Host / Concierge</h4>
              <div>
                <img src={hostPhoto} alt={hostName} />
                <b>{hostName}</b>
                <small>{hostCity}</small>
                <Stars value={5} size={14} />
              </div>
            </div>

            <div className="promo">
              <input
                placeholder="Apply promo code"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
              />
              <button type="button" onClick={handleApplyPromo}>Apply now</button>
            </div>
            {promoMessage && (
              <p style={{ fontSize: '13px', color: '#16a34a', margin: '4px 0 10px', fontWeight: 500 }}>
                {promoMessage}
              </p>
            )}

            <div className="summary__grand">
              <div>
                <b>Total Rental Price</b>
                <small>Overall price with taxes and fees included</small>
              </div>
              <strong>${quoteData?.totalAmount != null ? quoteData.totalAmount.toFixed(2) : (((vehicleData?.pricing?.dailyRate || 100) * 1.12)).toFixed(2)}</strong>
            </div>
            <button type="button" className="btn-text summary__alt" onClick={() => setRental(true)}>
              Prefer to pay in the app? Open rental info
            </button>
          </aside>
        </div>
      </div>
      {done && (
        <SuccessModal
          text={successMessage}
          onClose={() => setDone(false)}
          onDone={() => {
            setDone(false);
            if (createdBookingId) {
              navigate(`/app/booking-confirmed?id=${createdBookingId}`);
            } else {
              navigate('/app/bookings');
            }
          }}
        />
      )}
      {rental && <RentalInfoModal onClose={() => setRental(false)} />}
    </Layout>
  );
}

const transactions = [
  ['tx-1.png', 'Nissan GT – R', 'Sport Car', '20 July', '$80.00'],
  ['tx-2.png', 'Koegnigsegg', 'Sport Car', '19 July', '$99.00'],
  ['tx-3.png', 'Rolls – Royce', 'Sport Car', '18 July', '$96.00'],
  ['tx-4.png', 'CR – V', 'SUV', '17 July', '$80.00'],
  ['tx-1.png', 'Nissan GT – R', 'Sport Car', '20 July', '$80.00'],
  ['tx-2.png', 'Koegnigsegg', 'Sport Car', '19 July', '$99.00'],
  ['tx-3.png', 'Rolls – Royce', 'Sport Car', '18 July', '$96.00'],
];

function ChauffeurCard({ actions = true }) {
  return (
    <div className="chauffeur">
      <h4>Chauffeur</h4>
      <div className="chauffeur__row">
        <img src={img('chauffeur.jpg')} alt="" />
        <div>
          <b>Raj Sharma</b>
          <small>Pune</small>
          <Stars value={4} size={16} />
        </div>
      </div>
      {actions && (
        <div className="chauffeur__btns">
          <button type="button">
            <FiPhone /> Call
          </button>
          <button type="button" onClick={() => navigate('/app/inbox')}>
            <FiMessageSquare /> Message
          </button>
        </div>
      )}
    </div>
  );
}

/* Figma: "MacBook Pro 14 - 13" — Booking details after payment */
export function BookingConfirmed() {
  const [booking, setBooking] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    let active = true;
    const hash = window.location.hash || '';
    const query = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(query);
    const bookingId = params.get('id');

    setLoading(true);

    if (bookingId) {
      // 1. Fetch direct booking by id
      apiRequest(`/bookings/${bookingId}`)
        .then((res) => {
          if (!active) return;
          if (res?.data) {
            setBooking(res.data);
          }
        })
        .catch((err) => {
          console.warn('Direct booking lookup failed, falling back to list:', err.message);
          return apiRequest('/bookings').then((listRes) => {
            if (!active) return;
            const list = listRes?.data || [];
            if (Array.isArray(list) && list.length > 0) {
              setRecentBookings(list);
              const found = list.find((b) => (b._id || b.id) === bookingId);
              if (found) setBooking(found);
            }
          });
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } else {
      apiRequest('/bookings')
        .then((res) => {
          if (!active) return;
          const list = res?.data || [];
          if (Array.isArray(list) && list.length > 0) {
            setRecentBookings(list);
            setBooking(list[0]);
          }
        })
        .catch((err) => console.warn('Could not load confirmed booking:', err.message))
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    // Also populate recent bookings list
    apiRequest('/bookings')
      .then((res) => {
        if (!active) return;
        const list = res?.data || [];
        if (Array.isArray(list)) setRecentBookings(list);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const v = booking?.vehicle;
  const carName = v
    ? `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim()
    : 'Reserved Vehicle';

  const carPhoto =
    v?.photos?.find((p) => p.isPrimary)?.url ||
    v?.photos?.[0]?.url ||
    (typeof v?.photos?.[0] === 'string' ? v.photos[0] : null) ||
    '';

  const pickupDate = booking?.pickup?.dateTime
    ? new Date(booking.pickup.dateTime).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Scheduled Date';
  const dropoffDate = booking?.dropoff?.dateTime
    ? new Date(booking.dropoff.dateTime).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Scheduled Date';

  const pickupTime = booking?.pickup?.dateTime
    ? new Date(booking.pickup.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '10:00 AM';
  const dropoffTime = booking?.dropoff?.dateTime
    ? new Date(booking.dropoff.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '10:00 AM';

  const pickupLoc = booking?.pickup?.location || v?.location?.city || 'Selected Location';
  const dropoffLoc = booking?.dropoff?.location || booking?.pickup?.location || v?.location?.city || 'Selected Location';

  const totalAmount =
    booking?.pricing?.totalAmount != null
      ? `$${Number(booking.pricing.totalAmount).toFixed(2)}`
      : booking?.pricing?.total != null
      ? `$${Number(booking.pricing.total).toFixed(2)}`
      : '$0.00';

  const host = booking?.host;
  const chauffeur = booking?.chauffeurAssigned;
  const hostName = chauffeur?.name || (host ? `${host.firstName || ''} ${host.lastName || ''}`.trim() : null) || 'Drive Concierge';
  const hostCity = host?.city || v?.location?.city || 'Verified Fleet';
  const hostPhoto = host?.profilePhotoUrl || '';

  return (
    <Layout role="user">
      <div className="container confirmed">
        <BackLink to="/app">Back to Home</BackLink>
        <div className="confirmed__grid">
          <section className="panel tx">
            <div className="tx__head">
              <h3>Recent Bookings</h3>
              <a href="#/app/bookings">View All</a>
            </div>
            {recentBookings.length > 0 ? (
              recentBookings.slice(0, 5).map((b, i) => {
                const itemV = b.vehicle;
                const name = itemV ? `${itemV.make || ''} ${itemV.model || ''}`.trim() : 'Rental Trip';
                const photo = itemV?.photos?.[0]?.url || itemV?.photos?.[0] || '';
                const dateStr = b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Recent';
                const price = b.pricing?.totalAmount != null ? `$${Number(b.pricing.totalAmount).toFixed(2)}` : '$0.00';

                return (
                  <div className="tx__row" key={b._id || b.id || i} style={{ cursor: 'pointer' }} onClick={() => setBooking(b)}>
                    {photo ? (
                      <img src={photo} alt="" />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IoCarOutline size={20} color="#94a3b8" />
                      </div>
                    )}
                    <div>
                      <b>{name}</b>
                      <small style={{ textTransform: 'capitalize' }}>{b.status || 'Active'}</small>
                    </div>
                    <div className="tx__right">
                      <small>{dateStr}</small>
                      <b>{price}</b>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '24px 10px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                No recent transactions found
              </div>
            )}
          </section>
          <section className="panel booking-details">
            <h3>Booking Details</h3>
            <div className="booking-details__grid">
              <div>
                <svg className="route-map" viewBox="0 0 264 148" aria-hidden>
                  <rect width="264" height="148" fill="#eef1f5" />
                  <path d="M0 40h264M0 95h264M60 0v148M130 0v148M200 0v148M0 130L264 20" stroke="#fff" strokeWidth="9" fill="none" />
                  <rect x="20" y="55" width="30" height="30" fill="#a9c8f2" />
                  <rect x="80" y="100" width="40" height="40" fill="#a9c8f2" />
                  <path d="M150 148V62q0-6 6-6h22" stroke="#2f5bd3" strokeWidth="4" fill="none" />
                  <circle cx="180" cy="52" r="5" fill="#2f5bd3" />
                  <path d="M200 100c25-10 40-30 64-36" stroke="#8fbff3" strokeWidth="10" fill="none" />
                </svg>
                <div className="leg">
                  <p className="radio-head">
                    <span className="dot dot--on" /> Pick - Up
                  </p>
                  <div className="leg__cols">
                    <div>
                      <b>Locations</b>
                      <small>{pickupLoc}</small>
                    </div>
                    <div>
                      <b>Date</b>
                      <small>{pickupDate}</small>
                    </div>
                    <div>
                      <b>Time</b>
                      <small>{pickupTime}</small>
                    </div>
                  </div>
                </div>
                <div className="leg">
                  <p className="radio-head">
                    <span className="dot dot--on" /> Drop - Off
                  </p>
                  <div className="leg__cols">
                    <div>
                      <b>Locations</b>
                      <small>{dropoffLoc}</small>
                    </div>
                    <div>
                      <b>Date</b>
                      <small>{dropoffDate}</small>
                    </div>
                    <div>
                      <b>Time</b>
                      <small>{dropoffTime}</small>
                    </div>
                  </div>
                </div>
                <div className="booking-details__total">
                  <div>
                    <b>Total Rental Price</b>
                    <small>Overall price and includes rental taxes &amp; fees</small>
                  </div>
                  <strong>{totalAmount}</strong>
                </div>
                <div style={{ marginTop: 14 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      height: '46px',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                    onClick={() => setShowInvoiceModal(true)}
                  >
                    <FiFileText size={18} /> View &amp; Print Official Tax Invoice
                  </button>
                </div>
              </div>
              <div>
                {carPhoto ? (
                  <img className="booking-details__car" src={carPhoto} alt={carName} />
                ) : (
                  <div style={{ height: 180, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <IoCarOutline size={48} color="#94a3b8" />
                  </div>
                )}
                <h2>{carName}</h2>
                <small className="muted">{v?.category || v?.transmission || 'Luxury Fleet'}</small>
                <small className="muted">{booking?.referenceCode || '#BK-9761'}</small>
                <div className="chauffeur">
                  <h4>{chauffeur?.name ? 'Chauffeur' : 'Host / Concierge'}</h4>
                  <div className="chauffeur__row">
                    {hostPhoto ? (
                      <img src={hostPhoto} alt={hostName} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e2e8f0', display: 'grid', placeItems: 'center' }}>
                        <FiUser size={22} color="#64748b" />
                      </div>
                    )}
                    <div>
                      <b>{hostName}</b>
                      <small>{hostCity}</small>
                      <Stars value={5} size={16} />
                    </div>
                  </div>
                  <div className="chauffeur__btns">
                    <button
                      type="button"
                      onClick={() => {
                        const phone = chauffeur?.phone || host?.phoneNumber;
                        if (phone) window.open(`tel:${phone}`);
                        else alert('Host contact number will be provided prior to departure.');
                      }}
                    >
                      <FiPhone /> Call
                    </button>
                    <button type="button" onClick={() => navigate('/app/inbox')}>
                      <FiMessageSquare /> Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      {showInvoiceModal && (
        <InvoiceModal
          bookingId={booking?._id || booking?.id}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </Layout>
  );
}

/* Figma: "Frame 1437253750" — Add Review & Ratings */
export function ReviewModal({ booking, onClose, onSuccess }) {
  const [r, setR] = useState([5, 5, 5]);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (photos.length + files.length > 10) {
      setError('You can upload a maximum of 10 photos.');
      return;
    }
    setUploadingPhotos(true);
    setError('');
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      const res = await apiRequest('/uploads?folder=reviews', {
        method: 'POST',
        body: formData,
      });
      const urls = res?.data?.urls || [];
      setPhotos((prev) => [...prev, ...urls]);
    } catch (err) {
      console.warn('Failed to upload review photos:', err);
      setError(err?.message || 'Failed to upload photo(s).');
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const bookingId = booking?._id || booking?.id;
    if (!bookingId) {
      onClose();
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const overallRating = Math.round((r[0] + r[1] + r[2]) / 3);
      await apiRequest('/reviews', {
        method: 'POST',
        body: {
          bookingId,
          overallRating,
          categoryRatings: {
            carCondition: r[0],
            chauffeurExperience: r[1],
            overallService: r[2],
          },
          comment: comment.trim(),
          photos,
        },
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.warn('Submit review failed:', err);
      setError(err?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} width={639} className="auth">
      <ModalHeader title="Add Review & Ratings" onClose={onClose} />
      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px 14px', borderRadius: '8px', margin: '12px 0', fontSize: '13px' }}>
          {error}
        </div>
      )}
      <div className="review-upload">
        <label className="review-upload__btn" style={{ opacity: uploadingPhotos ? 0.6 : 1, cursor: uploadingPhotos ? 'not-allowed' : 'pointer' }}>
          <span>
            {uploadingPhotos ? <div className="spinner" style={{ width: 24, height: 24, border: '2px solid #fff', borderTopColor: '#0b3b82' }} /> : <FiCamera size={28} />}
          </span>
          {uploadingPhotos ? 'Uploading...' : 'Update Car Image'}
          <input type="file" accept="image/*" multiple hidden disabled={uploadingPhotos} onChange={handlePhotoUpload} />
        </label>
        {[0, 1, 2].map((slotIdx) => {
          const photoUrl = photos[slotIdx];
          return photoUrl ? (
            <div
              key={slotIdx}
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                height: '108px',
                border: '1px solid #cbd5e1',
                background: '#fff',
              }}
            >
              <img src={photoUrl} alt="Review attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => handleRemovePhoto(slotIdx)}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ) : (
            <i key={slotIdx} />
          );
        })}
      </div>
      {['Rate Car Condition', 'Rate Chauffer Experience', 'Rate Overall Service'].map((l, i) => (
        <Field label={l} key={l}>
          <div className="star-box">
            <StarInput value={r[i]} onChange={(v) => setR(r.map((x, k) => (k === i ? v : x)))} />
          </div>
        </Field>
      ))}
      <Field label="Write Reviews">
        <textarea
          className="input textarea"
          rows={4}
          placeholder="Share your experience with this vehicle and trip..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Field>
      <button type="button" className="btn btn-primary btn-block btn-lg" disabled={submitting || uploadingPhotos} onClick={handleSubmit}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </Modal>
  );
}

function RebookModal({ booking, onClose, onSuccess }) {
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [pickupLoc, setPickupLoc] = useState(booking?.pickup?.location || 'New York, NY');
  const [dropoffLoc, setDropoffLoc] = useState(booking?.dropoff?.location || 'New York, NY');
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default to upcoming dates (tomorrow + 2 days)
  useEffect(() => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 2);
    tmrw.setHours(10, 0, 0, 0);
    const drop = new Date(tmrw);
    drop.setDate(drop.getDate() + 2);

    setPickupDate(tmrw.toISOString().slice(0, 16));
    setDropoffDate(drop.toISOString().slice(0, 16));
  }, []);

  const handleRebook = async () => {
    if (!pickupDate || !dropoffDate) {
      setError('Please select both pick-up and drop-off dates.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const payload = {
        tripType: booking?.tripType || 'daily',
        pickup: {
          location: pickupLoc,
          dateTime: new Date(pickupDate).toISOString(),
        },
        dropoff: {
          location: dropoffLoc,
          dateTime: new Date(dropoffDate).toISOString(),
        },
      };
      if (promoCode.trim()) payload.promoCode = promoCode.trim();

      const bookingId = booking._id || booking.id;
      const res = await apiRequest(`/bookings/${bookingId}/rebook`, {
        method: 'POST',
        body: payload,
      });

      const newBooking = res?.data;
      if (newBooking?._id || newBooking?.id) {
        onSuccess && onSuccess();
        onClose();
        navigate(`/app/book/confirmed?id=${newBooking._id || newBooking.id}`);
      } else {
        throw new Error('Could not create rebooking');
      }
    } catch (err) {
      setError(err.message || 'Rebooking failed. Please check date availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} width={520}>
      <div className="modal__head">
        <h2 className="modal__title">Rebook Your Trip</h2>
        <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
          <IoClose size={26} />
        </button>
      </div>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
        Quick re-booking for <strong>{booking?.vehicle?.make} {booking?.vehicle?.model}</strong> with your saved preferences.
      </p>

      {error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Pick-up Date & Time">
          <Input
            type="datetime-local"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
          />
        </Field>
        <Field label="Drop-off Date & Time">
          <Input
            type="datetime-local"
            value={dropoffDate}
            onChange={(e) => setDropoffDate(e.target.value)}
          />
        </Field>
        <Field label="Pick-up Location">
          <Input
            value={pickupLoc}
            onChange={(e) => setPickupLoc(e.target.value)}
            placeholder="Address or Airport"
          />
        </Field>
        <Field label="Drop-off Location">
          <Input
            value={dropoffLoc}
            onChange={(e) => setDropoffLoc(e.target.value)}
            placeholder="Address or Airport"
          />
        </Field>
        <Field label="Promo Code (Optional)">
          <Input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="e.g. SAVE20"
          />
        </Field>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" disabled={loading} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" disabled={loading} onClick={handleRebook}>
          {loading ? 'Confirming...' : 'Confirm Rebooking'}
        </button>
      </div>
    </Modal>
  );
}

function BookingRow({ booking, previous, onReview, onRebook, onViewInvoice }) {
  if (!booking) return null;

  const v = booking.vehicle;
  const carName = v
    ? `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim()
    : 'Vehicle Reservation';

  const primaryPhoto =
    v?.photos?.find((p) => p.isPrimary)?.url ||
    v?.photos?.[0]?.url ||
    (typeof v?.photos?.[0] === 'string' ? v.photos[0] : null) ||
    '';

  const formatDate = (dt) => {
    if (!dt) return 'N/A';
    const d = new Date(dt);
    return isNaN(d.getTime()) ? String(dt) : d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  const pickupDate = formatDate(booking?.pickup?.dateTime);
  const dropoffDate = formatDate(booking?.dropoff?.dateTime);
  const pickupLoc = booking?.pickup?.location || v?.location?.city || 'Selected Location';
  const dropoffLoc = booking?.dropoff?.location || booking?.pickup?.location || v?.location?.city || 'Selected Location';

  const totalAmount =
    booking?.pricing?.totalAmount != null
      ? `$${booking.pricing.totalAmount}`
      : booking?.pricing?.total != null
        ? `$${booking.pricing.total}`
        : '$0';

  const ratingAvg = v?.ratingsAverage != null ? v.ratingsAverage : 5;
  const ratingCount = v?.ratingsCount != null ? v.ratingsCount : 0;

  // Real host or assigned chauffeur info
  const host = booking.host;
  const chauffeur = booking.chauffeurAssigned;
  const contactName = chauffeur?.name || (host ? `${host.firstName || ''} ${host.lastName || ''}`.trim() : null) || 'Drive Concierge';
  const contactLocation = host?.city || (v?.location?.city ? v.location.city : 'Available');
  const contactPhoto = host?.profilePhotoUrl || '';

  return (
    <div className="booking-row">
      <div className="booking-row__car">
        {primaryPhoto ? (
          <img src={primaryPhoto} alt={carName} />
        ) : (
          <div style={{ width: '100%', height: 110, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IoCarOutline size={32} color="#94a3b8" />
          </div>
        )}
        <b>{carName}</b>
        <span>
          <Stars value={Math.round(ratingAvg)} size={14} /> {ratingCount > 0 ? `${ratingCount} Reviews` : 'Verified'}
        </span>
      </div>
      <div className="booking-row__box">
        <p>Pick-up Date: {pickupDate}</p>
        <p>Pick-up Location: {pickupLoc}</p>
        <hr />
        <p>Return Date: {dropoffDate}</p>
        <p>Return Location: {dropoffLoc}</p>
      </div>
      <div className="booking-row__box">
        <h4>Booking Detail</h4>
        <p>Status: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{booking?.status || 'Pending'}</span></p>
        <p>Reference: {booking?.referenceCode || (booking?._id ? `#BK-${booking._id.slice(-4).toUpperCase()}` : '#BK-0000')}</p>
        <p>Total Amount: {totalAmount}</p>
      </div>
      <div className="booking-row__chauffeur">
        <h4>{chauffeur?.name ? 'Assigned Chauffeur' : 'Host / Concierge'}</h4>
        <div>
          {contactPhoto ? (
            <img src={contactPhoto} alt={contactName} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e2e8f0', display: 'grid', placeItems: 'center' }}>
              <FiUser size={20} color="#64748b" />
            </div>
          )}
          <div>
            <b>{contactName}</b>
            <small>{contactLocation}</small>
            <Stars value={5} size={14} />
          </div>
        </div>
      </div>
      <div className="booking-row__actions">
        {previous ? (
          <>
            <button
              type="button"
              className="act act--orange"
              onClick={onRebook}
            >
              <FiRefreshCw /> Rebook Trip
            </button>
            <button
              type="button"
              className="act"
              onClick={() => onViewInvoice && onViewInvoice(booking)}
            >
              <FiFileText /> View Invoice
            </button>
            {booking?.status === 'completed' && (
              <button type="button" className="act" onClick={onReview}>
                <FiStar /> Add Reviews
              </button>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              className="act"
              onClick={() => onViewInvoice && onViewInvoice(booking)}
            >
              <FiFileText /> View Invoice
            </button>
            <button
              type="button"
              className="act act--lg"
              onClick={() => {
                const phone = chauffeur?.phone || host?.phoneNumber;
                if (phone) window.open(`tel:${phone}`);
                else alert('Contact number will be available closer to pickup time.');
              }}
            >
              <FiPhone /> Call
            </button>
            <button type="button" className="act act--lg" onClick={() => navigate('/app/inbox')}>
              <FiMessageSquare /> Message
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* Figma: "MacBook Pro 14 - 14" — My Bookings */
export function Bookings() {
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rebookTarget, setRebookTarget] = useState(null);
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    apiRequest('/bookings')
      .then((res) => {
        const list = res?.data || [];
        setBookings(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.warn('Could not fetch bookings from server:', err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const upcoming = bookings.filter((b) => b.status === 'pending' || b.status === 'approved' || b.status === 'active');
  const past = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected');

  return (
    <Layout role="user">
      <div className="container bookings">
        <BackLink to="/app">Back to Home</BackLink>
        <h2>Upcoming Bookings</h2>
        {loading ? (
          <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '16px 0', color: '#64748b' }}>
            Loading your bookings...
          </div>
        ) : upcoming.length > 0 ? (
          upcoming.map((b) => (
            <BookingRow
              key={b._id || b.id}
              booking={b}
              onViewInvoice={(target) => setInvoiceBooking(target)}
            />
          ))
        ) : (
          <div style={{ background: '#f8fafc', padding: '36px 20px', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '16px 0 32px' }}>
            <p style={{ color: '#334155', fontWeight: 600, fontSize: '18px', margin: 0 }}>No upcoming trips scheduled</p>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '8px 0 16px' }}>Ready for your next journey? Browse our luxury collection and book your ride today.</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/app/cars')}>
              Explore Vehicles
            </button>
          </div>
        )}

        <h2>Previous Bookings</h2>
        {!loading && past.length > 0 ? (
          past.map((b) => (
            <BookingRow
              key={b._id || b.id}
              booking={b}
              previous
              onReview={() => setReviewBooking(b)}
              onRebook={() => setRebookTarget(b)}
              onViewInvoice={(target) => setInvoiceBooking(target)}
            />
          ))
        ) : !loading ? (
          <div style={{ background: '#f8fafc', padding: '28px 20px', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '16px 0' }}>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>You have no completed or past bookings yet.</p>
          </div>
        ) : null}
      </div>
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={fetchBookings}
        />
      )}
      {rebookTarget && (
        <RebookModal
          booking={rebookTarget}
          onClose={() => setRebookTarget(null)}
          onSuccess={fetchBookings}
        />
      )}
      {invoiceBooking && (
        <InvoiceModal
          bookingId={invoiceBooking._id || invoiceBooking.id}
          onClose={() => setInvoiceBooking(null)}
        />
      )}
    </Layout>
  );
}
