import { useEffect, useState, useRef } from 'react';
import { FiPhoneCall, FiMail, FiMapPin, FiChevronDown, FiChevronUp, FiClock, FiAward, FiCrosshair, FiMessageSquare, FiSend, FiCheckCircle, FiUploadCloud, FiX, FiAlertCircle, FiSearch, FiHelpCircle, FiFileText, FiUser, FiCheck } from 'react-icons/fi';
import { TbSparkles, TbPigMoney, TbCircleCheck, TbCar, TbUserHeart, TbCalendarCheck, TbGauge } from 'react-icons/tb';
import Layout from '../components/Layout';
import { Testimonials } from '../components/Cards';
import { img, blogPosts, LOREM, LOREM_LONG } from '../data';
import { apiRequest, getCurrentUser } from '../lib/api';

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
  const currentUser = getCurrentUser();
  const token = localStorage.getItem('turn_and_burn_access_token');
  const isAuthenticated = !!token;

  const [activeTab, setActiveTab] = useState('contact'); // 'contact' | 'tickets' | 'feedback'
  const [subject, setSubject] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phoneNumber || '');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [ticketNum, setTicketNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(true);
  const [error, setError] = useState('');
  const [companyInfo, setCompanyInfo] = useState(null);

  // Tickets state
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [replying, setReplying] = useState(false);

  // In-app Feedback state
  const [myFeedback, setMyFeedback] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [fbTitle, setFbTitle] = useState('');
  const [fbDesc, setFbDesc] = useState('');
  const [fbFiles, setFbFiles] = useState([]);
  const [fbPreviews, setFbPreviews] = useState([]);
  const [submittingFb, setSubmittingFb] = useState(false);
  const [fbSuccess, setFbSuccess] = useState('');
  const [fbError, setFbError] = useState('');
  const fbFileInputRef = useRef(null);

  const subjectOptions = [
    'General Inquiry',
    'Billing Issue',
    'Cancellation Request',
    'Vehicle Condition',
    'Roadside Assistance'
  ];

  // Load company information
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

  // Fetch support tickets
  const fetchMyTickets = () => {
    if (!isAuthenticated) return;
    setLoadingTickets(true);
    apiRequest('/support-tickets/mine')
      .then((res) => {
        const list = res?.data || [];
        setMyTickets(Array.isArray(list) ? list : []);
        if (list.length > 0 && !expandedTicketId) {
          setExpandedTicketId(list[0]._id);
        }
      })
      .catch((err) => {
        console.warn('Could not load tickets:', err.message);
      })
      .finally(() => setLoadingTickets(false));
  };

  // Fetch feedback
  const fetchMyFeedback = () => {
    if (!isAuthenticated) return;
    setLoadingFeedback(true);
    apiRequest('/feedback/mine')
      .then((res) => {
        const list = res?.data || [];
        setMyFeedback(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.warn('Could not load feedback:', err.message);
      })
      .finally(() => setLoadingFeedback(false));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyTickets();
      fetchMyFeedback();
    }
  }, [isAuthenticated]);

  // Reply to ticket
  const handleReplyTicket = async (ticketId) => {
    const text = replyText[ticketId]?.trim();
    if (!text || replying) return;
    setReplying(true);
    try {
      const res = await apiRequest(`/support-tickets/${ticketId}/reply`, {
        method: 'POST',
        body: { text },
      });
      setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
      if (res?.data) {
        setMyTickets((prev) =>
          prev.map((t) => (t._id === ticketId ? res.data : t))
        );
      } else {
        fetchMyTickets();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit reply');
    } finally {
      setReplying(false);
    }
  };

  // Submit contact / ticket form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const selectedCategory = subjectOptions[subject] || 'General Inquiry';

    try {
      let createdTicketNumber = '';

      if (isAuthenticated) {
        // Authenticated customer/host endpoint: POST /support-tickets
        const res = await apiRequest('/support-tickets', {
          method: 'POST',
          body: {
            subject: selectedCategory,
            category: selectedCategory,
            message: message.trim(),
          },
        });
        createdTicketNumber = res?.data?.ticketNumber || '';
      } else {
        // Public contact endpoint: POST /contact
        const res = await apiRequest('/contact', {
          method: 'POST',
          body: {
            name: `${firstName} ${lastName}`.trim() || 'Guest User',
            email: email.trim(),
            phone: phone.trim(),
            category: selectedCategory,
            subject: selectedCategory,
            message: message.trim(),
          },
        });
        createdTicketNumber = res?.data?.ticketNumber || '';
      }

      setSent(true);
      if (createdTicketNumber) {
        setTicketNum(createdTicketNumber);
      }
      setMessage('');
      if (isAuthenticated) {
        fetchMyTickets();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit contact message');
    } finally {
      setLoading(false);
    }
  };

  // Feedback attachments handling
  const handleFbFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const combined = [...fbFiles, ...selected].slice(0, 5);
    setFbFiles(combined);
    setFbPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeFbFile = (index) => {
    const nextFiles = fbFiles.filter((_, i) => i !== index);
    const nextPreviews = fbPreviews.filter((_, i) => i !== index);
    setFbFiles(nextFiles);
    setFbPreviews(nextPreviews);
  };

  // Submit In-App Feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!fbTitle.trim()) {
      setFbError('Please enter a feedback title.');
      return;
    }
    if (!fbDesc.trim()) {
      setFbError('Please enter feedback details.');
      return;
    }
    if (fbDesc.length > 1000) {
      setFbError('Feedback description cannot exceed 1000 characters.');
      return;
    }

    setFbError('');
    setSubmittingFb(true);

    try {
      const formData = new FormData();
      formData.append('title', fbTitle.trim());
      formData.append('description', fbDesc.trim());
      fbFiles.forEach((file) => formData.append('attachments', file));

      const res = await apiRequest('/feedback', {
        method: 'POST',
        body: formData,
      });

      setFbSuccess('Thank you! Your feedback has been submitted to our team.');
      setFbTitle('');
      setFbDesc('');
      setFbFiles([]);
      setFbPreviews([]);
      if (res?.data) {
        setMyFeedback((prev) => [res.data, ...prev]);
      } else {
        fetchMyFeedback();
      }
      setTimeout(() => setFbSuccess(''), 4000);
    } catch (err) {
      setFbError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFb(false);
    }
  };

  // Filtered tickets
  const filteredTickets = myTickets.filter((t) => {
    if (ticketStatusFilter !== 'all' && t.status !== ticketStatusFilter) return false;
    if (!ticketSearch.trim()) return true;
    const q = ticketSearch.toLowerCase();
    const num = (t.ticketNumber || '').toLowerCase();
    const subj = (t.subject || '').toLowerCase();
    const cat = (t.category || '').toLowerCase();
    return num.includes(q) || subj.includes(q) || cat.includes(q);
  });

  return (
    <Layout role={roleOf(role)}>
      {/* Sub-Navigation Tabs */}
      <div className="container" style={{ paddingTop: '28px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '12px',
            marginBottom: '28px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '999px',
              border: 'none',
              background: activeTab === 'contact' ? '#0a5cff' : '#f1f5f9',
              color: activeTab === 'contact' ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <FiMail size={16} />
            <span>Contact & Support</span>
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setActiveTab('tickets')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '999px',
                border: 'none',
                background: activeTab === 'tickets' ? '#0a5cff' : '#f1f5f9',
                color: activeTab === 'tickets' ? '#ffffff' : '#475569',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <FiFileText size={16} />
              <span>My Tickets</span>
              {myTickets.length > 0 && (
                <span
                  style={{
                    backgroundColor: activeTab === 'tickets' ? '#ffffff' : '#0a5cff',
                    color: activeTab === 'tickets' ? '#0a5cff' : '#ffffff',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '1px 7px',
                  }}
                >
                  {myTickets.length}
                </span>
              )}
            </button>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '999px',
                border: 'none',
                background: activeTab === 'feedback' ? '#0a5cff' : '#f1f5f9',
                color: activeTab === 'feedback' ? '#ffffff' : '#475569',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <FiMessageSquare size={16} />
              <span>In-App Feedback</span>
              {myFeedback.length > 0 && (
                <span
                  style={{
                    backgroundColor: activeTab === 'feedback' ? '#ffffff' : '#64748b',
                    color: activeTab === 'feedback' ? '#0a5cff' : '#ffffff',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '1px 7px',
                  }}
                >
                  {myFeedback.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* TAB 0: Contact Form */}
      {activeTab === 'contact' && (
        <section className="contact">
          <div className="contact__info">
            <h2>Contact Information</h2>
            <p>Say something to start a live support ticket!</p>
            <ul>
              <li>
                <FiPhoneCall size={22} />{' '}
                <span>{infoLoading ? 'Loading phone...' : (companyInfo?.supportPhone || companyInfo?.phone || '+1 (800) 555-0200')}</span>
              </li>
              <li>
                <FiMail size={22} />{' '}
                <span>{infoLoading ? 'Loading email...' : (companyInfo?.supportEmail || companyInfo?.businessEmail || 'support@turnandburn.com')}</span>
              </li>
              <li>
                <FiMapPin size={22} />{' '}
                <span>{infoLoading ? 'Loading address...' : (companyInfo?.address || '100 Main Street, Suite 400, Charlotte, NC')}</span>
              </li>
            </ul>
            <span className="contact__circle contact__circle--a" />
            <span className="contact__circle contact__circle--b" />
          </div>

          <form className="contact__form" onSubmit={handleSubmit}>
            <h1>{isAuthenticated ? 'Submit Support Request' : 'Contact Us'}</h1>
            <p className="contact__lead">
              {isAuthenticated
                ? 'Your request will be routed directly to our dedicated support specialists with priority tracking.'
                : 'Have questions or need assistance? Our support team is here to help.'}
            </p>

            {error && (
              <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '14px' }}>
                {error}
              </div>
            )}
            {sent && (
              <div style={{ color: '#15803d', backgroundColor: '#dcfce7', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                <strong>Thanks! Your request has been logged.</strong>
                {ticketNum && (
                  <div style={{ marginTop: '4px' }}>
                    Reference Ticket: <strong style={{ color: '#0a5cff' }}>{ticketNum}</strong>
                    {isAuthenticated && ' — Viewable anytime in the "My Tickets" tab.'}
                  </div>
                )}
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

            <p className="contact__subject">Select Category / Subject</p>
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
              <span>Message / Details</span>
              <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Please detail your question, vehicle reference, or incident..." required />
            </label>

            <div className="contact__actions">
              <button type="submit" className="btn btn-black" disabled={loading}>
                {loading ? 'Submitting...' : sent ? 'Request Logged ✓' : isAuthenticated ? 'Create Support Ticket' : 'Send Message'}
              </button>
            </div>
            <img className="contact__plane" src={img('letter.png')} alt="" />
          </form>
        </section>
      )}

      {/* TAB 1: My Support Tickets */}
      {activeTab === 'tickets' && isAuthenticated && (
        <section className="container" style={{ margin: '16px auto 48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Support Ticket History</h2>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>
                Track responses, reply to agents, and review ticket status in real-time.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <FiSearch size={15} style={{ position: 'absolute', left: 10, top: 11, color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  style={{
                    padding: '8px 12px 8px 32px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    width: '180px',
                  }}
                />
              </div>

              {['all', 'open', 'replied', 'closed'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTicketStatusFilter(status)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: ticketStatusFilter === status ? '#0a5cff' : '#e2e8f0',
                    background: ticketStatusFilter === status ? '#eff6ff' : '#ffffff',
                    color: ticketStatusFilter === status ? '#0a5cff' : '#64748b',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loadingTickets ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>Loading your support tickets...</p>
          ) : filteredTickets.length === 0 ? (
            <div style={{ padding: '40px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', textAlign: 'center' }}>
              <FiHelpCircle size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No support tickets found</p>
              <p style={{ margin: '4px 0 16px', fontSize: '13px' }}>
                {myTickets.length === 0
                  ? "You haven't submitted any support tickets yet."
                  : 'No tickets match your search criteria.'}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveTab('contact')}
                style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '8px' }}
              >
                Create a Ticket
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredTickets.map((t) => {
                const isExpanded = expandedTicketId === t._id;
                const messagesList = Array.isArray(t.messages) ? t.messages : [];

                return (
                  <div
                    key={t._id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpandedTicketId(isExpanded ? null : t._id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '13px',
                            backgroundColor: '#eff6ff',
                            color: '#0a5cff',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontWeight: 700,
                          }}
                        >
                          {t.ticketNumber}
                        </span>
                        <strong style={{ fontSize: '16px', color: '#0f172a' }}>{t.subject || 'Support Request'}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>• {t.category || 'General'}</span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          • {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor:
                              t.status === 'closed'
                                ? '#dcfce7'
                                : t.status === 'replied'
                                ? '#eff6ff'
                                : '#fef3c7',
                            color:
                              t.status === 'closed'
                                ? '#15803d'
                                : t.status === 'replied'
                                ? '#0a5cff'
                                : '#b45309',
                            textTransform: 'capitalize',
                          }}
                        >
                          {t.status || 'open'}
                        </span>
                        {isExpanded ? <FiChevronUp size={18} color="#64748b" /> : <FiChevronDown size={18} color="#64748b" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                        {/* Message history */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                          {messagesList.length > 0 ? (
                            messagesList.map((m, mi) => {
                              const isAdmin = m.sender === 'admin';
                              return (
                                <div
                                  key={mi}
                                  style={{
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    background: isAdmin ? '#f8fafc' : '#eff6ff',
                                    border: `1px solid ${isAdmin ? '#e2e8f0' : '#bfdbfe'}`,
                                    alignSelf: isAdmin ? 'flex-start' : 'flex-end',
                                    maxWidth: '85%',
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
                                    <strong style={{ fontSize: '12px', color: isAdmin ? '#0f172a' : '#1d4ed8' }}>
                                      {isAdmin ? '🛡 Support Specialist' : (m.senderName || 'You')}
                                    </strong>
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                      {m.sentAt || m.createdAt ? new Date(m.sentAt || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                                    {m.text}
                                  </p>
                                </div>
                              );
                            })
                          ) : (
                            <p style={{ color: '#64748b', fontSize: '13px' }}>{t.message || 'No additional messages.'}</p>
                          )}
                        </div>

                        {/* Reply box */}
                        {t.status !== 'closed' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              placeholder="Type a response back to the support team..."
                              value={replyText[t._id] || ''}
                              onChange={(e) => setReplyText({ ...replyText, [t._id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleReplyTicket(t._id);
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '13px',
                                outline: 'none',
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                              disabled={replying || !replyText[t._id]?.trim()}
                              onClick={() => handleReplyTicket(t._id)}
                            >
                              <FiSend size={14} />
                              <span>{replying ? 'Sending...' : 'Reply'}</span>
                            </button>
                          </div>
                        ) : (
                          <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                            This support ticket has been closed. Create a new inquiry if you need further help.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: In-App Feedback */}
      {activeTab === 'feedback' && isAuthenticated && (
        <section className="container" style={{ margin: '16px auto 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 480px) 1fr', gap: '32px', alignItems: 'start' }}>
            {/* Feedback submit panel */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                Share Your Feedback
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
                Have an idea, found a bug, or want a feature? Share it with our development team.
              </p>

              {fbError && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '13px', marginBottom: '14px' }}>
                  {fbError}
                </div>
              )}
              {fbSuccess && (
                <div style={{ padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '13px', marginBottom: '14px' }}>
                  {fbSuccess}
                </div>
              )}

              <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Title <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={fbTitle}
                    maxLength={120}
                    onChange={(e) => setFbTitle(e.target.value)}
                    placeholder="e.g. Booking filter suggestion"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      Description <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <span style={{ fontSize: '12px', color: fbDesc.length > 950 ? '#ef4444' : '#64748b', fontWeight: 600 }}>
                      {fbDesc.length}/1000
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={fbDesc}
                    maxLength={1000}
                    onChange={(e) => setFbDesc(e.target.value)}
                    placeholder="Describe your suggestion or report in detail..."
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Screenshots <span style={{ color: '#64748b', fontWeight: 400 }}>(Optional, up to 5)</span>
                  </label>
                  <input
                    type="file"
                    ref={fbFileInputRef}
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFbFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fbFileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: '#475569',
                      fontSize: '13px',
                    }}
                  >
                    <FiUploadCloud size={16} />
                    <span>Upload screenshots</span>
                  </button>

                  {fbPreviews.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {fbPreviews.map((src, i) => (
                        <div
                          key={i}
                          style={{
                            position: 'relative',
                            width: '56px',
                            height: '56px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <img src={src} alt="attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => removeFbFile(i)}
                            style={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              background: 'rgba(0,0,0,0.6)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '16px',
                              height: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            <FiX size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingFb || !fbTitle.trim() || !fbDesc.trim()}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', fontSize: '14px', marginTop: '4px' }}
                >
                  {submittingFb ? 'Submitting...' : 'Send Feedback'}
                </button>
              </form>
            </div>

            {/* Previous feedback list */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
                Your Previous Submissions
              </h3>

              {loadingFeedback ? (
                <p style={{ color: '#64748b' }}>Loading feedback history...</p>
              ) : myFeedback.length === 0 ? (
                <div style={{ padding: '36px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                  <FiMessageSquare size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>No feedback submitted yet</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                    Any feature requests or comments you submit will be tracked here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {myFeedback.map((fb) => (
                    <div
                      key={fb._id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '15px', color: '#0f172a' }}>{fb.title}</strong>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor:
                              fb.status === 'resolved'
                                ? '#dcfce7'
                                : fb.status === 'reviewed'
                                ? '#ede9fe'
                                : '#eff6ff',
                            color:
                              fb.status === 'resolved'
                                ? '#15803d'
                                : fb.status === 'reviewed'
                                ? '#6d28d9'
                                : '#0a5cff',
                            textTransform: 'capitalize',
                          }}
                        >
                          {fb.status === 'new' ? 'Under Review' : fb.status}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                        {fb.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <small style={{ color: '#94a3b8', fontSize: '11px' }}>
                          Submitted {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : ''}
                        </small>
                        {Array.isArray(fb.attachments) && fb.attachments.length > 0 && (
                          <span style={{ fontSize: '11px', color: '#0a5cff', fontWeight: 600 }}>
                            {fb.attachments.length} attachment{fb.attachments.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faq && (
        <section className="container faq" style={{ marginTop: '40px' }}>
          <h2>Frequently asked questions</h2>
          <p className="faq__lead">
            Can’t find the answer here? Check out our <a href="#/host/more">Help Center</a> or submit a ticket above.
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

export function TermsList({ endpoint = '/content/terms' }) {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest(endpoint)
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
  }, [endpoint]);

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: '#6b7280' }}>
        <p>Loading terms and policies...</p>
      </div>
    );
  }

  if (!terms || terms.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: '#6b7280' }}>
        <p>No sections found for this policy.</p>
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
  const isPrivacy = title.toLowerCase().includes('privacy');
  const endpoint = isPrivacy ? '/content/privacy' : '/content/terms';

  return (
    <Layout role={roleOf(role)}>
      <section className="container terms">
        <div className="section-head">
          <h1>{title}</h1>
        </div>
        <TermsList endpoint={endpoint} />
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

  const handleSelectArticle = async (p) => {
    setActiveArticle(p);
    const lookupKey = p.slug || p.id || p._id;
    if (lookupKey) {
      try {
        const res = await apiRequest(`/blog/${lookupKey}`);
        if (res?.data) {
          const detailed = formatPost(res.data, 0);
          setActiveArticle(detailed);
        }
      } catch (err) {
        console.warn('Could not load detailed blog post:', err.message);
      }
    }
  };

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
      slug: post.slug,
      title: post.title,
      tag: (post.category || 'General').toUpperCase(),
      category: post.category || 'General',
      date: pubDate,
      publishedAt: post.publishedAt,
      image: cover,
      fallbackImage: fallbackImgs[idx % fallbackImgs.length],
      excerpt: post.excerpt || post.content?.slice(0, 200) || LOREM_LONG,
      content: post.content || post.excerpt || LOREM_LONG,
      author: typeof post.author === 'string' ? 'Turn & Burn Team' : `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Turn & Burn Team',
    };
  };

  const liveFormatted = posts.map((p, i) => formatPost(p, i));

  // Determine category options dynamically from live posts and API
  const categoryList = ['All'];
  if (categories && categories.length > 0) {
    categories.forEach((c) => {
      const name = typeof c === 'string' ? c : c?.category || c?.name || c?.label || c?._id;
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
            onClick={() => handleSelectArticle(featurePost)}
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
              onClick={() => handleSelectArticle(sidePost)}
            >
              Read More
            </button>
          </div>
        </div>
        <div className="post-grid">
          {recentList.map((p, idx) => (
            <PostCard key={p.id || p.title || idx} p={p} onSelect={handleSelectArticle} idx={idx} />
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
            <PostCard key={p.id || p.title || idx} p={p} onSelect={handleSelectArticle} idx={idx + 3} />
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
