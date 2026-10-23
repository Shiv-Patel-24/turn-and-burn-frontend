const img = (name) => `./images/${name}`;
export { img };

export const cars = [
  { id: 1, name: 'Porsche Cayenne GTS 2022', image: img('car1.jpg') },
  { id: 2, name: 'Nissan Maxima Platinum 2022', image: img('car2.jpg') },
  { id: 3, name: 'Audi A8 L 2022', image: img('car3.jpg') },
  { id: 4, name: 'BMW M8 Coupe 2022', image: img('car4.jpg') },
  { id: 5, name: 'BMW X7 M50i 2022', image: img('car5.jpg') },
  { id: 6, name: 'Porsche Cayenne GTS 2022', image: img('car6.jpg') },
].map((c) => ({
  ...c,
  price: '78.90',
  mileage: '4,000',
  gearbox: 'Auto',
  seats: '4 Person',
  fuel: 'Electric',
}));

export const carAt = (i) => cars[((i % cars.length) + cars.length) % cars.length];

export function formatVehicle(v, fallbackIndex = 0) {
  if (!v) return carAt(fallbackIndex);
  const primaryPhoto = (v.photos && v.photos.find((p) => p.isPrimary)?.url) || (v.photos && v.photos[0]?.url);
  const dailyRate = v.pricing?.dailyRate;
  const rawPrice = v.price;
  const price = typeof dailyRate === 'number' && Number.isFinite(dailyRate)
    ? `$${dailyRate.toFixed(2)}`
    : rawPrice == null
      ? '$78.90'
      : typeof rawPrice === 'number' && Number.isFinite(rawPrice)
        ? `$${rawPrice.toFixed(2)}`
        : String(rawPrice).trim().startsWith('$')
          ? String(rawPrice).trim()
          : `$${String(rawPrice).trim()}`;
  const rawSeats = v.seats;
  const seats = rawSeats == null
    ? '4 Person'
    : typeof rawSeats === 'number'
      ? `${rawSeats} ${rawSeats === 1 ? 'Person' : 'People'}`
      : /^\d+$/.test(String(rawSeats).trim())
        ? `${Number(rawSeats)} ${Number(rawSeats) === 1 ? 'Person' : 'People'}`
        : String(rawSeats).trim();
  return {
    id: v._id || v.id || fallbackIndex,
    name: v.name || `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim() || 'Vehicle',
    image: primaryPhoto || img(`car${(fallbackIndex % 6) + 1}.jpg`),
    price,
    mileage: v.odometer ? `${v.odometer.toLocaleString()} mi` : (v.mileage || '4,000'),
    gearbox: v.transmission || v.gearbox || 'Auto',
    seats,
    fuel: v.fuelType || v.fuel || 'Gasoline',
    raw: v,
  };
}

export const collectionTabs = ['Popular Car', 'Luxury Car', 'Vintage Car', 'Family Car', 'Off-Road Car'];

export const rentalSections = [
  'Newer car rental in San Francisco',
  'Tesla rental at Honolulu (HNL) airport',
  'Luxury car rental in Atlanta',
  'Newer car rental at Las Vegas (LAS) airport',
  'SUV rental at San Francisco (SFO) airport',
  'Monthly affordable car rentals in Honolulu',
  'Truck rental in Miami',
  'Monthly car rentals in Newark',
  'Monthly SUV rentals in Los Angeles',
  'Tesla rental in Orlando',
];

export const hostVehicles = [
  { id: 1, image: img('v1.jpg'), status: 'Listed' },
  { id: 2, image: img('v2.jpg'), status: 'Listed' },
  { id: 3, image: img('v3.jpg'), status: 'Unlisted' },
  { id: 4, image: img('v4.jpg'), status: 'Unlisted' },
  { id: 5, image: img('v5.jpg'), status: 'Listed' },
  { id: 6, image: img('v6.jpg'), status: 'Listed' },
  { id: 7, image: img('v7.jpg'), status: 'Snoozed' },
  { id: 8, image: img('v8.jpg'), status: 'Snoozed' },
].map((v) => ({ ...v, name: 'Nissan Pathfinder 2025', state: 'NY', plate: 'WB12339A', lastTrip: 'May 6 - May 30', rating: '5.0', trips: 8 }));

/* Thumbnails used in host calendar / trips / analytics, matching the Figma order */
export const fleetThumbs = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => img(`t-${i}.jpg`));
export const tripThumbs = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => img(`trip-${i}.jpg`));

export const blogPosts = {
  recent: [
    { tag: 'Travel', date: '13 March 2026', title: 'How To Save Money On Your Next Car Rental', image: img('blog-1.jpg') },
    { tag: 'DEVELOPMENT', date: '11March 2026', title: 'SUV vs. Sedan: Which Rental Car Is Right for You?', image: img('blog-2.jpg') },
    { tag: 'Sports', date: '10 March 2026', title: 'The Ultimate Guide to Stress-Free Car Rentals', image: img('blog-3.jpg') },
  ],
  popular: [
    { tag: 'Travel', date: '13 March 2026', title: 'Top Weekend Getaway Destinations Worth the Drive', image: img('blog-4.jpg') },
    { tag: 'DEVELOPMENT', date: '11March 2026', title: 'Everything You Need to Know About Rental Car Insurance', image: img('blog-5.jpg') },
    { tag: 'Sports', date: '10 March 2026', title: 'Business Travel Made Easy with Flexible Car Rentals', image: img('blog-6.jpg') },
    { tag: 'Travel', date: '13 March 2026', title: '5 Common Car Rental Mistakes and How to Avoid Them', image: img('blog-7.jpg') },
    { tag: 'DEVELOPMENT', date: '11March 2026', title: 'Why Renting a Car Is Better Than Relying on Ride-Sharing', image: img('blog-8.jpg') },
    { tag: 'Sports', date: '10 March 2026', title: 'From Airport to Adventure: Making the Most of Your Rental Car', image: img('blog-9.jpg') },
  ],
};

export const LOREM_SHORT = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
export const LOREM =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.";
export const LOREM_LONG =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets.";

export const chats = [
  { name: 'Killan James', msg: 'Typing...', time: '4:30 PM', badge: 2, avatar: img('av-1.jpg'), online: true, typing: true },
  { name: 'Design Team', msg: 'Hello! Everyone', time: '9:36 AM', read: true, avatar: img('av-2.jpg') },
  { name: 'Ahmed Medi', msg: 'Wow really Cool 🔥', time: '1:15 AM', avatar: img('av-3.jpg') },
  { section: 'All Message' },
  { name: 'Claudia Maudi', msg: 'Typing...', time: '4:30 PM', avatar: img('av-4.jpg'), typing: true },
  { name: 'Novita', msg: 'yah, nice design', time: '4:30 PM', badge: 2, avatar: img('av-5.jpg'), online: true },
  { name: 'Milie Nose', msg: 'Awesome 🔥', time: '8:20 PM', badge: 1, avatar: img('av-6.jpg'), online: true },
  { name: 'Ikhsan SD', msg: 'Voice message', time: 'yesterday', avatar: img('av-7.jpg'), voice: true },
  { name: 'Aditya', msg: 'publish now', time: 'yesterday', read: true, avatar: img('av-1.jpg'), online: true, dark: true },
];
