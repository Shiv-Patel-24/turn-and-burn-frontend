import { useEffect, useState } from 'react';
import { FiPhoneCall, FiMail, FiMapPin, FiChevronDown, FiClock, FiAward, FiCrosshair } from 'react-icons/fi';
import { TbSparkles, TbPigMoney, TbCircleCheck, TbCar, TbUserHeart, TbCalendarCheck, TbGauge } from 'react-icons/tb';
import Layout from '../components/Layout';
import { Testimonials } from '../components/Cards';
import { img, blogPosts, LOREM, LOREM_LONG } from '../data';
import { apiRequest } from '../lib/api';

const roleOf = (role) => role || 'guest';

/* ---------------- About us (S2 / S9 / S49) ---------------- */
const ABOUT_P =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s.";

const CHAR_LIMIT = 260; // Only show 'Read More' if text exceeds this limit

function AboutRowItem({ imgSrc, title, fullContent, isRev }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = (fullContent || '').length > CHAR_LIMIT;
  const displayedText = isLong && !expanded ? fullContent.slice(0, CHAR_LIMIT).trim() + '...' : fullContent;

  return (
    <div className={`about-row ${isRev ? 'about-row--rev' : ''}`}>
      <img src={imgSrc} alt={title || 'About'} />
      <div>
        {title && <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>{title}</h3>}
        <p>{displayedText}</p>
        {isLong && (
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              setExpanded(!expanded);
            }}
            style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--blue, #2d55fb)' }}
          >
            {expanded ? 'Show Less' : 'Read More'}
          </a>
        )}
      </div>
    </div>
  );
}

export function About({ role }) {
  const [sections, setSections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const defaultRows = [img('about-1.jpg'), img('about-2.jpg'), img('about-3.jpg'), img('about-4.jpg')];

  useEffect(() => {
    let active = true;
    apiRequest('/content/about-us')
      .then((res) => {
        if (!active) return;
        const list = res?.data?.sections || [];
        setSections(list);
      })
      .catch(() => {
        if (!active) return;
        setSections([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    apiRequest('/content/stats')
      .then((res) => {
        if (!active) return;
        if (res?.data) {
          setStats(res.data);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Filter text blocks vs image blocks from backend
  const textSections = (sections || []).filter((s) => s.blockType === 'text');
  const heroSection = textSections[0];
  const storySections = textSections.length > 1 ? textSections.slice(1) : [];

  return (
    <Layout role={roleOf(role)}>
      <section className="about-hero">
        <img src={img('about-hero.jpg')} alt="" />
        <div className="container">
          <div className="about-hero__card">
            <h1>About Us</h1>
            <p>
              {loading ? 'Loading...' : heroSection?.content || ''}
            </p>
          </div>
        </div>
      </section>

      <section className="container about-intro">
        <div className="section-head">
          <h2>About Us</h2>
          {sections && sections[1]?.content && (
            <p className="small">{sections[1].content}</p>
          )}
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
            <p>Loading about details...</p>
          </div>
        ) : storySections.length > 0 ? (
          storySections.map((item, i) => {
            const imgSrc = (typeof item === 'object' && item.imageUrl) || defaultRows[i % defaultRows.length];
            const title = (typeof item === 'object' && item.title) || '';
            const fullContent = (typeof item === 'object' && item.content) || '';

            return (
              <AboutRowItem
                key={item._id || i}
                imgSrc={imgSrc}
                title={title}
                fullContent={fullContent}
                isRev={Boolean(i % 2)}
              />
            );
          })
        ) : null}
      </section>

      <section className="services">
        <div className="container">
          <div className="section-head section-head--light">
            <h2>Our Services &amp; Benefits</h2>
            <p>To make renting easy and hassle-free, we provide a variety of services and advantages. We have you covered with a variety of vehicles and flexible rental terms.</p>
          </div>
          <div className="benefits">
            {[
              [TbSparkles, 'Quality Choice', 'We offer a wide range of high-quality vehicles to choose from, including luxury cars, SUVs, vans, and more.'],
              [TbPigMoney, 'Affordable Prices', 'Our rental rates are highly competitive and affordable, allowing our customers to enjoy their trips without breaking the bank.'],
              [TbCircleCheck, 'Convenient Online Booking', 'With our easy-to-use online booking system, customers can quickly and conveniently reserve their rental car from anywhere, anytime.'],
            ].map(([I, t, d]) => (
              <div className="benefit" key={t}>
                <span>
                  <I size={22} />
                </span>
                <h4>{t}</h4>
                <p>{d}</p>
              </div>
            ))}
          </div>
          <div className="section-head section-head--light premium-head">
            <h2>Our Premium Services</h2>
            <p>Carent is a reputable car rental company that offers a wide range of useful services for every taste.</p>
          </div>
        </div>
      </section>
      <div className="container premium">
        {[
          [FiClock, '24 Hours Support', 'We support you all hours of the day,'],
          [FiAward, 'Qualified Assurance', 'All cars have a valid insurance.'],
          [FiCrosshair, 'GPS on Cars', 'All cars are equipped with GPS navigation system.'],
        ].map(([I, t, d]) => (
          <div className="premium__card" key={t}>
            <I size={36} />
            <h4>{t}</h4>
            <p>{d}</p>
          </div>
        ))}
      </div>

      <Testimonials />

      <section className="container">
        <div className="facts">
          <h2>Facts In Numbers</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco labo</p>
          <div className="facts__grid">
            <img className="facts__car" src={img('host-numbers.png')} alt="" />
            {[
              [TbCar, stats?.carsListed != null ? `${stats.carsListed}+` : '540+', 'Cars'],
              [TbUserHeart, stats?.happyCustomers != null ? `${stats.happyCustomers >= 1000 ? Math.round(stats.happyCustomers / 1000) + 'k+' : stats.happyCustomers + '+'}` : '20k+', 'Customers'],
              [TbCalendarCheck, stats?.yearsExperience != null ? `${stats.yearsExperience}+` : '25+', 'Years'],
              [TbGauge, stats?.milesDriven != null ? `${stats.milesDriven >= 1000000 ? Math.round(stats.milesDriven / 1000000) + 'm+' : stats.milesDriven >= 1000 ? Math.round(stats.milesDriven / 1000) + 'k+' : stats.milesDriven}` : '20m+', 'Miles'],
            ].map(([I, n, l]) => (
              <div className="stat" key={l}>
                <span>
                  <I size={28} />
                </span>
                <div>
                  <strong>{n}</strong>
                  <small>{l}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

/* ---------------- Contact (S3 / S10) + FAQ (S48 host "More") ---------------- */
const faqs = [
  ['How does it work?', 'OpenPhone uses Internet to provide you with additional phone numbers on top of your existing devices. Download OpenPhone on your mobile or use it on the web to make and receive calls and messages.'],
  ['What devices do you support?', LOREM],
  ['Does OpenPhone use my phone plan’s minutes?', LOREM],
  ['How good is the call quality?', LOREM],
  ['What countries can I call and text?', LOREM],
  ['Can I use OpenPhone with my team?', LOREM],
  ['Can I distinguish between business and personal calls?', LOREM],
  ['What if I want to cancel my subscription?', LOREM],
  ['What number will my customers see when I call?', LOREM],
  ['Can I use my OpenPhone number to receive two factor authentication (2FA) codes?', LOREM],
];

export function Contact({ role, faq = false }) {
  const [subject, setSubject] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [ticketNum, setTicketNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(true);
  const [error, setError] = useState('');
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    let active = true;
    apiRequest('/content/company')
      .then((res) => {
        if (!active) return;
        if (res?.data) {
          setCompanyInfo(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setInfoLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const subjectOptions = [
    'General Inquiry',
    'Billing Issue',
    'Cancellation Request',
    'Roadside Assistance'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/contact', {
        method: 'POST',
        body: {
          name: `${firstName} ${lastName}`.trim() || 'Guest User',
          email: email.trim(),
          phone: phone.trim(),
          category: subjectOptions[subject] || 'General Inquiry',
          subject: subjectOptions[subject] || 'General Inquiry',
          message: message.trim(),
        },
      });

      setSent(true);
      if (res?.data?.ticketNumber) {
        setTicketNum(res.data.ticketNumber);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit contact message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role={roleOf(role)}>
      <section className="contact">
        <div className="contact__info">
          <h2>Contact Information</h2>
          <p>Say something to start a live chat!</p>
          <ul>
            <li>
              <FiPhoneCall size={22} />{' '}
              <span>{infoLoading ? 'Loading phone...' : (companyInfo?.supportPhone || companyInfo?.phone || 'Not available')}</span>
            </li>
            <li>
              <FiMail size={22} />{' '}
              <span>{infoLoading ? 'Loading email...' : (companyInfo?.supportEmail || companyInfo?.businessEmail || 'Not available')}</span>
            </li>
            <li>
              <FiMapPin size={22} />{' '}
              <span>{infoLoading ? 'Loading address...' : (companyInfo?.address || 'Not available')}</span>
            </li>
          </ul>
          <span className="contact__circle contact__circle--a" />
          <span className="contact__circle contact__circle--b" />
        </div>
        <form className="contact__form" onSubmit={handleSubmit}>
          <h1>Contact US</h1>
          <p className="contact__lead">Have questions or need assistance? Our support team is here to help.</p>
          {error && (
            <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '14px' }}>
              {error}
            </div>
          )}
          {sent && (
            <div style={{ color: '#15803d', backgroundColor: '#dcfce7', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '14px' }}>
              Thanks! Your message has been received. {ticketNum && `Ticket Reference: ${ticketNum}`}
            </div>
          )}
          <div className="contact__grid">
            <label className="line-field">
              <span>First Name</span>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" required />
            </label>
            <label className="line-field">
              <span>Last Name</span>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" required />
            </label>
            <label className="line-field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john.doe@gmail.com" required />
            </label>
            <label className="line-field">
              <span>Phone Number</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555-123-4567" />
            </label>
          </div>
          <p className="contact__subject">Select Subject?</p>
          <div className="contact__radios">
            {subjectOptions.map((opt, i) => (
              <label key={opt} className={`mini-radio ${subject === i ? 'is-on' : ''}`}>
                <input type="radio" name="subject" checked={subject === i} onChange={() => setSubject(i)} />
                <span />
                {opt}
              </label>
            ))}
          </div>
          <label className="line-field line-field--full">
            <span>Message</span>
            <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message.." required />
          </label>
          <div className="contact__actions">
            <button type="submit" className="btn btn-black" disabled={loading}>
              {loading ? 'Sending...' : sent ? 'Message Sent ✓' : 'Send Message'}
            </button>
          </div>
          <img className="contact__plane" src={img('letter.png')} alt="" />
        </form>
      </section>

      {faq && (
        <section className="container faq">
          <h2>Frequently asked questions</h2>
          <p className="faq__lead">
            Can’t find the answer here? Check out our <a href="#/host/more">Help Center</a>.
          </p>
          <FaqAccordion openFaq={openFaq} setOpenFaq={setOpenFaq} />
        </section>
      )}
    </Layout>
  );
}

function FaqAccordion({ openFaq, setOpenFaq }) {
  const [faqList, setFaqList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest('/content/faq')
      .then((res) => {
        if (!active) return;
        const sections = res?.data?.sections || [];
        setFaqList(sections.map((s) => [s.title, s.content]));
      })
      .catch(() => {
        if (!active) return;
        setFaqList([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 0', color: '#6b7280' }}>
        <p>Loading FAQs...</p>
      </div>
    );
  }

  if (!faqList || faqList.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 0', color: '#6b7280' }}>
        <p>No FAQs available right now.</p>
      </div>
    );
  }

  return (
    <>
      {faqList.map(([q, a], i) => (
        <div className={`faq__item ${openFaq === i ? 'is-open' : ''}`} key={q}>
          <button type="button" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
            <span>{q}</span>
            <FiChevronDown size={28} strokeWidth={1.5} />
          </button>
          {openFaq === i && <p>{a}</p>}
        </div>
      ))}
    </>
  );
}

/* ---------------- Terms & Conditions (S4 / S11 / S18 Legal / S50) ---------------- */
export const termsSections = [
  ['1. Introduction', ['Welcome to our service. These Terms and Conditions outline the rules and regulations for the use of our website and services.', 'By accessing this website, we assume you accept these terms and conditions. Do not continue to use our services if you do not agree to take all of the terms and conditions stated on this page.']],
  ['2. License to Use', ['Unless otherwise stated, we own the intellectual property rights for all material on this website. All intellectual property rights are reserved.', 'You must not:'], ['Republish material from this website', 'Sell, rent, or sub-license material from this website', 'Reproduce, duplicate, or copy material from this website', 'Redistribute content from this website']],
  ['3. User Accounts', ['When you create an account with us, you must provide information that is accurate, complete, and current at all times.', 'You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.', 'You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.']],
  ['4. Privacy Policy', ['Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information.', 'By using our services, you agree to the collection and use of information in accordance with our Privacy Policy.']],
  ['5. Termination', ['We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.', 'Upon termination, your right to use the service will immediately cease. If you wish to terminate your account, you may simply discontinue using the service.']],
  ['6. Limitation of Liability', ['In no event shall we, nor our directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.', 'This includes, without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.']],
  ['7. Changes to Terms', ['We reserve the right, at our sole discretion, to modify or replace these Terms at any time.', 'By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.']],
  ['8. Contact Us', ['If you have any questions about these Terms and Conditions, please contact us:'], ['Email: support@example.com', 'Phone: +1 (555) 123-4567', 'Address: 123 Business Street, City, State 12345'], true],
];

export function TermsList() {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest('/content/terms')
      .then((res) => {
        if (!active) return;
        const sections = res?.data?.sections || [];
        setTerms(sections);
      })
      .catch(() => {
        if (!active) return;
        setTerms([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: '#6b7280' }}>
        <p>Loading terms and conditions...</p>
      </div>
    );
  }

  if (!terms || terms.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: '#6b7280' }}>
        <p>No terms and conditions found.</p>
      </div>
    );
  }

  return terms.map((sec, idx) => (
    <div className="terms__card" key={sec._id || idx}>
      <h2>{sec.title}</h2>
      <p>{sec.content}</p>
    </div>
  ));
}

export function Terms({ role, title = 'Terms & Conditions' }) {
  return (
    <Layout role={roleOf(role)}>
      <section className="container terms">
        <div className="section-head">
          <h1>{title}</h1>
        </div>
        <TermsList />
      </section>
    </Layout>
  );
}

/* ---------------- Blogs (S21 / S22 / S52) ---------------- */
function PostCard({ p, onSelect, idx = 0 }) {
  const fallbackImgs = [
    img('blog-1.jpg'),
    img('blog-2.jpg'),
    img('blog-3.jpg'),
    img('blog-4.jpg'),
    img('blog-5.jpg'),
    img('blog-6.jpg'),
    img('blog-7.jpg'),
    img('blog-8.jpg'),
    img('blog-9.jpg'),
  ];
  const fallback = fallbackImgs[idx % fallbackImgs.length];

  return (
    <article className="post">
      <img
        src={p.image || fallback}
        alt={p.title || 'Post'}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallback;
        }}
      />
      <p className="post__meta">
        <b>{p.tag || p.category || 'General'}</b> {p.date || 'Recent'}
      </p>
      <h3>{p.title}</h3>
      <p className="post__text">{p.excerpt || p.text || LOREM}</p>
      <a
        href="#/blogs"
        onClick={(e) => {
          e.preventDefault();
          if (onSelect) onSelect(p);
        }}
        style={{ cursor: 'pointer' }}
      >
        Read More...
      </a>
    </article>
  );
}

export function Blogs({ role }) {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAllPopular, setShowAllPopular] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest('/blog?limit=50')
      .then((res) => {
        if (!active) return;
        const list = res?.data?.posts || res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setPosts(list);
        }
      })
      .catch((err) => console.warn('Could not load blog posts:', err.message));

    apiRequest('/blog/categories')
      .then((res) => {
        if (!active) return;
        const cats = res?.data || [];
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const formatPost = (post, idx) => {
    const fallbackImgs = [
      img('blog-feature.jpg'),
      img('blog-side.jpg'),
      img('blog-hero.jpg'),
      img('blog-1.jpg'),
      img('blog-2.jpg'),
      img('blog-3.jpg'),
      img('blog-4.jpg'),
      img('blog-5.jpg'),
      img('blog-6.jpg'),
      img('blog-7.jpg'),
      img('blog-8.jpg'),
      img('blog-9.jpg'),
    ];
    const pubDate = post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
      : '16 March 2026';
    
    // Check if coverImageUrl is missing or is an unstyled placeholder (e.g. placehold.co)
    const isPlaceholder = !post.coverImageUrl || post.coverImageUrl.includes('placehold.co') || post.coverImageUrl.includes('via.placeholder');
    const cover = isPlaceholder ? fallbackImgs[idx % fallbackImgs.length] : post.coverImageUrl;

    return {
      id: post._id || post.id || `post-${idx}`,
      title: post.title,
      tag: (post.category || 'General').toUpperCase(),
      category: post.category || 'General',
      date: pubDate,
      image: cover,
      fallbackImage: fallbackImgs[idx % fallbackImgs.length],
      excerpt: post.excerpt || post.content?.slice(0, 200) || LOREM_LONG,
      content: post.content || post.excerpt || LOREM_LONG,
      author: typeof post.author === 'string' ? 'Turn & Burn Team' : post.author?.name || 'Turn & Burn Team',
    };
  };

  const liveFormatted = posts.map((p, i) => formatPost(p, i));

  // Determine category options dynamically from live posts and API
  const categoryList = ['All'];
  if (categories && categories.length > 0) {
    categories.forEach((c) => {
      const name = typeof c === 'string' ? c : c?.name || c?.label;
      if (name && !categoryList.includes(name)) categoryList.push(name);
    });
  }
  // Also collect categories directly from the live posts
  liveFormatted.forEach((p) => {
    if (p.category && !categoryList.includes(p.category)) {
      categoryList.push(p.category);
    }
  });

  // Filter posts if category is selected
  const filteredPosts =
    selectedCat === 'All'
      ? liveFormatted
      : liveFormatted.filter((p) => (p.category || '').toLowerCase() === selectedCat.toLowerCase());

  // Distribute posts cleanly across Featured, Spotlight, Recent, and Popular
  const featurePost = filteredPosts[0] || liveFormatted[0] || {
    title: '5 Tips for Renting a Car in New York City',
    tag: 'TIPS & GUIDES',
    category: 'Tips & Guides',
    date: '27 August 2026',
    image: img('blog-feature.jpg'),
    excerpt: "Navigating New York can be overwhelming - here's what every first-time renter should know before they hit the road.",
    content: "Navigating New York can be overwhelming - here's what every first-time renter should know before they hit the road.\n\n" + LOREM_LONG,
    author: 'Turn & Burn Team',
  };

  const sidePost = filteredPosts[1] || liveFormatted[1] || {
    title: 'Why Electric Vehicles Are the Future of Car Rentals',
    tag: 'INDUSTRY NEWS',
    category: 'Industry News',
    date: '20 August 2026',
    image: img('blog-side.jpg'),
    excerpt: 'With EV adoption accelerating, Turn & Burn is expanding its electric fleet to meet growing demand.',
    content: 'With EV adoption accelerating, Turn & Burn is expanding its electric fleet to meet growing demand.\n\n' + LOREM_LONG,
    author: 'Turn & Burn Team',
  };

  // Recent: remaining items starting from index 2
  const remaining = filteredPosts.length > 2 ? filteredPosts.slice(2) : liveFormatted.slice(2);
  const fullRecent = remaining.length > 0 ? remaining : blogPosts.recent;
  const recentList = showAllRecent ? fullRecent : fullRecent.slice(0, 3);

  // Popular: show all live posts or curated popular posts
  const fullPopular = liveFormatted.length >= 4 ? liveFormatted.slice(1) : blogPosts.popular;
  const popularList = showAllPopular ? fullPopular : fullPopular.slice(0, 6);

  return (
    <Layout role={roleOf(role)}>
      {/* Hero section */}
      <section className="blog-hero">
        <img src={img('blog-hero.jpg')} alt="" />
        <div className="container">
          <h1>Driving Knowledge, One Journey at a Time</h1>
          <p>Explore articles, rental guides, and the latest news from Turn & Burn to empower your next journey on the road.</p>
        </div>
      </section>

      {/* Category Pills Filter */}
      <section className="container" style={{ paddingTop: 32, paddingBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 0.8 }}>Filter by Topic:</span>
          {categoryList.map((cat) => {
            const isSelected = selectedCat.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '8px 22px',
                  borderRadius: 24,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid var(--blue, #2d55fb)' : '1.5px solid #e2e8f0',
                  background: isSelected ? 'var(--blue, #2d55fb)' : '#fff',
                  color: isSelected ? '#fff' : '#475569',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(45, 85, 251, 0.25)' : 'none',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Post Card */}
      <section className="container blog-feature">
        <img
          src={featurePost.image}
          alt={featurePost.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = img('blog-feature.jpg');
          }}
        />
        <div className="blog-feature__card">
          <p className="post__meta">
            <b>{featurePost.tag}</b> {featurePost.date}
          </p>
          <h2>{featurePost.title}</h2>
          <p>{featurePost.excerpt}</p>
          <button
            type="button"
            className="btn-outline-blue"
            onClick={() => setActiveArticle(featurePost)}
          >
            Read More
          </button>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="container blog-section">
        <div className="blog-section__head">
          <h2>Our Recent Post</h2>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowAllRecent(!showAllRecent)}
          >
            {showAllRecent ? 'Show Less' : 'View All'}
          </button>
        </div>
        <div className="blog-side">
          <img
            src={sidePost.image}
            alt={sidePost.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = img('blog-side.jpg');
            }}
          />
          <div>
            <p className="post__meta">
              <b>{sidePost.tag}</b> {sidePost.date}
            </p>
            <h3>{sidePost.title}</h3>
            <p>{sidePost.excerpt}</p>
            <button
              type="button"
              className="btn-outline-blue"
              onClick={() => setActiveArticle(sidePost)}
            >
              Read More
            </button>
          </div>
        </div>
        <div className="post-grid">
          {recentList.map((p, idx) => (
            <PostCard key={p.id || p.title || idx} p={p} onSelect={setActiveArticle} idx={idx} />
          ))}
        </div>
      </section>

      {/* Popular Posts Section */}
      <section className="container blog-section">
        <div className="blog-section__head">
          <h2>Popular Post</h2>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowAllPopular(!showAllPopular)}
          >
            {showAllPopular ? 'Show Less' : 'View All'}
          </button>
        </div>
        <div className="post-grid">
          {popularList.map((p, idx) => (
            <PostCard key={p.id || p.title || idx} p={p} onSelect={setActiveArticle} idx={idx + 3} />
          ))}
        </div>
      </section>

      {/* Full Article Reader Modal */}
      {activeArticle && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 24,
          }}
          onClick={() => setActiveArticle(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              maxWidth: 780,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image */}
            <div style={{ position: 'relative', width: '100%', height: 320, background: '#1e293b' }}>
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  color: '#0f172a',
                }}
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div style={{ padding: '32px 36px 40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span
                  style={{
                    background: '#e0e7ff',
                    color: '#2d55fb',
                    fontWeight: 700,
                    fontSize: 12,
                    padding: '4px 12px',
                    borderRadius: 16,
                    letterSpacing: 0.5,
                  }}
                >
                  {activeArticle.tag || activeArticle.category || 'ARTICLE'}
                </span>
                <span style={{ fontSize: 13, color: '#64748b' }}>{activeArticle.date}</span>
                {activeArticle.author && (
                  <span style={{ fontSize: 13, color: '#64748b' }}>• By {activeArticle.author}</span>
                )}
              </div>

              <h2
                style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: 28,
                  fontWeight: 700,
                  lineHeight: 1.35,
                  color: '#0f172a',
                  marginBottom: 20,
                }}
              >
                {activeArticle.title}
              </h2>

              <div
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: '#334155',
                  fontFamily: 'var(--font-alt, sans-serif)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                }}
              >
                {activeArticle.content
                  ? activeArticle.content
                      .split('\n\n')
                      .filter(Boolean)
                      .map((para, i) => <p key={i}>{para}</p>)
                  : <p>{activeArticle.excerpt || LOREM_LONG}</p>}
              </div>

              <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveArticle(null)}
                  style={{ padding: '10px 28px', borderRadius: 10 }}
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
