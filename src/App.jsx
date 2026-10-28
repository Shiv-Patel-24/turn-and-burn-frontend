import { Router, Link } from './router';
import { UIProvider, useUI } from './ui';
import { UserMenu, HostMenu, LogoutModal } from './components/Layout';
import { SignUpModal, LoginModal, ForgotModal, OtpModal } from './components/AuthModals';
import Home from './pages/Home';
import { About, Contact, Terms, Blogs } from './pages/InfoPages';
import CarDetail from './pages/CarDetail';
import Inbox from './pages/Inbox';
import { Listing, Favorites } from './pages/user/Listing';
import { Book, BookingConfirmed, Bookings } from './pages/user/Booking';
import { SavedLocations, Profile, PaymentHistory, GiftCards } from './pages/user/Account';
import HostLanding from './pages/host/HostLanding';
import Onboarding, { STEPS } from './pages/host/Onboarding';
import { HostCalendar, HostTrips, HostVehicles } from './pages/host/Dashboard';
import VehicleEdit from './pages/host/VehicleEdit';
import Analytics from './pages/host/Analytics';
import { Modal } from './ui';

/* Every Figma frame mapped to a route. [path, Component, props, Figma frame name] */
export const routes = [
  // ----- Guest (logged out) -----
  ['/', Home, { role: 'guest' }, 'MacBook Pro 14" - 1 · Home'],
  ['/about', About, { role: 'guest' }, 'MacBook Pro 14" - 2 · About us'],
  ['/contact', Contact, { role: 'guest' }, 'MacBook Pro 14" - 3 · Contact'],
  ['/terms', Terms, { role: 'guest' }, 'MacBook Pro 14" - 4 · Terms & Conditions'],
  ['/car/:id', CarDetail, { role: 'guest' }, 'MacBook Pro 14" - 5 · Car detail'],
  ['/blogs', Blogs, { role: 'guest' }, 'MacBook Pro 14" - 21 · Blogs'],

  // ----- Guest user (logged in) -----
  ['/app', Home, { role: 'user' }, 'MacBook Pro 14" - 6 · Home (logged in)'],
  ['/app/cars', Listing, {}, 'MacBook Pro 14" - 7 · Car listing + filters'],
  ['/app/car/:id', CarDetail, { role: 'user' }, 'MacBook Pro 14" - 8 · Car detail (logged in)'],
  ['/app/about', About, { role: 'user' }, 'MacBook Pro 14" - 9 · About us'],
  ['/app/contact', Contact, { role: 'user' }, 'MacBook Pro 14" - 10 · Contact'],
  ['/app/terms', Terms, { role: 'user' }, 'MacBook Pro 14" - 11 · Terms & Conditions'],
  ['/app/book', Book, {}, 'MacBook Pro 14" - 12 · Booking / checkout'],
  ['/app/booking-confirmed', BookingConfirmed, {}, 'MacBook Pro 14" - 13 · Booking details'],
  ['/app/bookings', Bookings, {}, 'MacBook Pro 14" - 14 · My Bookings'],
  ['/app/favorites', Favorites, {}, 'MacBook Pro 14" - 15 · Favorites'],
  ['/app/inbox', Inbox, { role: 'user' }, 'MacBook Pro 14" - 16 · Inbox'],
  ['/app/saved-locations', SavedLocations, {}, 'MacBook Pro 14" - 17 · Saved Locations'],
  ['/app/legal', Terms, { role: 'user', title: 'Legal' }, 'MacBook Pro 14" - 18 · Legal'],
  ['/app/profile', Profile, { role: 'user' }, 'MacBook Pro 14" - 19 · Profile'],
  ['/app/payments', PaymentHistory, {}, 'MacBook Pro 14" - 20 · Payment History'],
  ['/app/blogs', Blogs, { role: 'user' }, 'MacBook Pro 14" - 22 · Blogs'],
  ['/app/gift-cards', GiftCards, {}, 'MacBook Pro 14" - 30 · Gift cards'],

  // ----- Host -----
  ['/host', HostLanding, {}, 'MacBook Pro 14" - 23 · Host landing'],
  ['/host/list/:step', Onboarding, {}, 'MacBook Pro 14" - 24…39 · List your car'],
  ['/host/calendar', HostCalendar, {}, 'MacBook Pro 14" - 40 · Calendar'],
  ['/host/trips', HostTrips, { tab: 'booked' }, 'MacBook Pro 14" - 41 / 42 · Trips (booked) + drawer'],
  ['/host/trips/history', HostTrips, { tab: 'history' }, 'MacBook Pro 14" - 43 / 44 · Trips (history) + drawer'],
  ['/host/inbox', Inbox, { role: 'host' }, 'MacBook Pro 14" - 45 · Inbox'],
  ['/host/vehicles', HostVehicles, {}, 'MacBook Pro 14" - 46 · Vehicles'],
  ['/host/vehicles/:id/:section', VehicleEdit, {}, 'MacBook Pro 14" - 66…74 · Vehicle settings'],
  ['/host/analytics', Analytics, {}, 'MacBook Pro 14" - 47 · Analytics'],
  ['/host/more', Contact, { role: 'host', faq: true }, 'MacBook Pro 14" - 48 · More (Contact + FAQ)'],
  ['/host/about', About, { role: 'host' }, 'MacBook Pro 14" - 49 · About us'],
  ['/host/terms', Terms, { role: 'host' }, 'MacBook Pro 14" - 50 · Terms & Conditions'],
  ['/host/blogs', Blogs, { role: 'host' }, 'MacBook Pro 14" - 52 · Blogs'],
  ['/host/profile', Profile, { role: 'host' }, 'MacBook Pro 14" - 53 · Profile'],
];

const vehicleSections = ['location', 'vin', 'profile', 'license', 'goals', 'availability', 'details', 'photos', 'pricing'];
const vehicleFrames = ['66', '67', '68', '69', '70', '71', '72', '73', '74'];
const stepFrames = ['24', '25', '26', '27', '28', '29', '31', '32', '33', '35', '36', '37', '38', '39'];

/* Index of every screen — handy for QA and client review (#/screens) */
function Screens() {
  const groups = [
    ['Guest (logged out)', routes.filter(([p]) => !p.startsWith('/app') && !p.startsWith('/host'))],
    ['Guest (logged in)', routes.filter(([p]) => p.startsWith('/app'))],
    ['Host', routes.filter(([p]) => p.startsWith('/host'))],
  ];
  const href = (p) => p.replace(':id', '1').replace(':step', 'location').replace(':section', 'location');
  return (
    <div className="screens">
      <h1>Turn and Burn — all screens</h1>
      <p>Each link opens the React implementation of a Figma frame. Popups (login, sign up, menus, calendars, filters, drawers, success dialogs) open from the buttons inside those screens.</p>
      {groups.map(([g, list]) => (
        <section key={g}>
          <h2>{g}</h2>
          <ul>
            {list.map(([p, , , name]) => (
              <li key={p}>
                <Link to={href(p)}>{name}</Link>
                <code>#{href(p)}</code>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section>
        <h2>List your car — every step</h2>
        <ul>
          {STEPS.map((s, i) => (
            <li key={s.key}>
              <Link to={`/host/list/${s.key}`}>
                MacBook Pro 14" - {stepFrames[i]} · {s.key}
              </Link>
              <code>#/host/list/{s.key}</code>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Vehicle settings — every tab</h2>
        <ul>
          {vehicleSections.map((s, i) => (
            <li key={s}>
              <Link to={`/host/vehicles/1/${s}`}>
                MacBook Pro 14" - {vehicleFrames[i]} · {s}
              </Link>
              <code>#/host/vehicles/1/{s}</code>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function NotFound() {
  return (
    <div className="screens">
      <h1>Page not found</h1>
      <p>
        <Link to="/">Go home</Link> · <Link to="/screens">All screens</Link>
      </p>
    </div>
  );
}

function GlobalModals() {
  const { modal, open, close } = useUI();
  if (!modal) return null;
  const go = (name) => open(name);
  switch (modal.name) {
    case 'signup':
      return <SignUpModal onClose={close} go={go} initialRole={modal?.props?.role || 'guest'} />;
    case 'login':
      return <LoginModal onClose={close} go={go} initialRole={modal?.props?.role || 'guest'} />;
    case 'forgot':
      return <ForgotModal onClose={close} go={go} />;
    case 'otp':
      return <OtpModal onClose={close} go={go} />;
    case 'userMenu':
      return (
        <Modal onClose={close} width={638} align="top-right" bare>
          <UserMenu onClose={close} />
        </Modal>
      );
    case 'hostMenu':
      return (
        <Modal onClose={close} width={638} align="top-right" bare>
          <HostMenu onClose={close} />
        </Modal>
      );
    case 'logout':
      return <LogoutModal onClose={close} />;
    default:
      return null;
  }
}

export default function App() {
  const table = [...routes.map(([p, C, props]) => [p, C, props]), ['/screens', Screens]];
  return (
    <UIProvider>
      <Router routes={table} fallback={NotFound} />
      <GlobalModals />
    </UIProvider>
  );
}
