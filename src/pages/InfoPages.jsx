import { useState } from 'react';
import { FiPhoneCall, FiMail, FiMapPin, FiChevronDown, FiClock, FiAward, FiCrosshair } from 'react-icons/fi';
import { TbSparkles, TbPigMoney, TbCircleCheck, TbCar, TbUserHeart, TbCalendarCheck, TbGauge } from 'react-icons/tb';
import Layout from '../components/Layout';
import { Testimonials } from '../components/Cards';
import { img, blogPosts, LOREM, LOREM_LONG } from '../data';

const roleOf = (role) => role || 'guest';

/* ---------------- About us (S2 / S9 / S49) ---------------- */
const ABOUT_P =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s.";

export function About({ role }) {
  const rows = [img('about-1.jpg'), img('about-2.jpg'), img('about-3.jpg'), img('about-4.jpg')];
  return (
    <Layout role={roleOf(role)}>
      <section className="about-hero">
        <img src={img('about-hero.jpg')} alt="" />
        <div className="container">
          <div className="about-hero__card">
            <h1>About Us</h1>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
          </div>
        </div>
      </section>

      <section className="container about-intro">
        <div className="section-head">
          <h2>About Us</h2>
          <p className="small">{LOREM}</p>
        </div>
        {rows.map((src, i) => (
          <div className={`about-row ${i % 2 ? 'about-row--rev' : ''}`} key={src}>
            <img src={src} alt="" />
            <div>
              <p>{ABOUT_P}</p>
              <a href="#/" onClick={(e) => e.preventDefault()}>
                Read More
              </a>
            </div>
          </div>
        ))}
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
              [TbCar, '540+', 'Cars'],
              [TbUserHeart, '20k+', 'Customers'],
              [TbCalendarCheck, '25+', 'Years'],
              [TbGauge, '20m+', 'Miles'],
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
  const [sent, setSent] = useState(false);
  return (
    <Layout role={roleOf(role)}>
      <section className="contact">
        <div className="contact__info">
          <h2>Contact Information</h2>
          <p>Say something to start a live chat!</p>
          <ul>
            <li>
              <FiPhoneCall size={22} /> +1012 3456 789
            </li>
            <li>
              <FiMail size={22} /> demo@gmail.com
            </li>
            <li>
              <FiMapPin size={22} /> 132 Dartmouth Street Boston, Massachusetts 02156 United States
            </li>
          </ul>
          <span className="contact__circle contact__circle--a" />
          <span className="contact__circle contact__circle--b" />
        </div>
        <form
          className="contact__form"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <h1>Contact US</h1>
          <p className="contact__lead">{LOREM}</p>
          <div className="contact__grid">
            <label className="line-field">
              <span>First Name</span>
              <input />
            </label>
            <label className="line-field">
              <span>Last Name</span>
              <input placeholder="Doe" />
            </label>
            <label className="line-field">
              <span>Email</span>
              <input type="email" />
            </label>
            <label className="line-field">
              <span>Phone Number</span>
              <input defaultValue="+1 012 3456 789" />
            </label>
          </div>
          <p className="contact__subject">Select Subject?</p>
          <div className="contact__radios">
            {[0, 1, 2, 3].map((i) => (
              <label key={i} className={`mini-radio ${subject === i ? 'is-on' : ''}`}>
                <input type="radio" name="subject" checked={subject === i} onChange={() => setSubject(i)} />
                <span />
                General Inquiry
              </label>
            ))}
          </div>
          <label className="line-field line-field--full">
            <span>Message</span>
            <input placeholder="Write your message.." />
          </label>
          <div className="contact__actions">
            <button type="submit" className="btn btn-black">
              {sent ? 'Message Sent ✓' : 'Send Message'}
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
          {faqs.map(([q, a], i) => (
            <div className={`faq__item ${openFaq === i ? 'is-open' : ''}`} key={q}>
              <button type="button" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                <span>{q}</span>
                <FiChevronDown size={28} strokeWidth={1.5} />
              </button>
              {openFaq === i && <p>{a}</p>}
            </div>
          ))}
        </section>
      )}
    </Layout>
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
  return termsSections.map(([title, paras, list, plain]) => (
    <div className="terms__card" key={title}>
      <h2>{title}</h2>
      {paras.map((p) => (
        <p key={p}>{p}</p>
      ))}
      {list && (
        <ul className={plain ? 'plain' : ''}>
          {list.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}
    </div>
  ));
}

export function Terms({ role, title = 'Terms & Conditions' }) {
  return (
    <Layout role={roleOf(role)}>
      <section className="container terms">
        <div className="section-head">
          <h1>{title}</h1>
          <p className="small">{LOREM}</p>
        </div>
        <TermsList />
      </section>
    </Layout>
  );
}

/* ---------------- Blogs (S21 / S22 / S52) ---------------- */
function PostCard({ p }) {
  return (
    <article className="post">
      <img src={p.image} alt="" />
      <p className="post__meta">
        <b>{p.tag}</b> {p.date}
      </p>
      <h3>{p.title}</h3>
      <p className="post__text">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966.</p>
      <a href="#/" onClick={(e) => e.preventDefault()}>
        Read More...
      </a>
    </article>
  );
}

export function Blogs({ role }) {
  return (
    <Layout role={roleOf(role)}>
      <section className="blog-hero">
        <img src={img('blog-hero.jpg')} alt="" />
        <div className="container">
          <h1>Driving Knowledge, One Journey at a Time</h1>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966.</p>
        </div>
      </section>

      <section className="container blog-feature">
        <img src={img('blog-feature.jpg')} alt="" />
        <div className="blog-feature__card">
          <p className="post__meta">
            <b>DEVELOPMENT</b> 16 March 2026
          </p>
          <h2>Enhancing Your Car Rental Experience with Cutting-Edge VR and AI Technology</h2>
          <p>{LOREM_LONG}</p>
          <button type="button" className="btn-outline-blue">
            Read More
          </button>
        </div>
      </section>

      <section className="container blog-section">
        <div className="blog-section__head">
          <h2>Our Recent Post</h2>
          <button type="button" className="btn btn-primary btn-sm">
            View All
          </button>
        </div>
        <div className="blog-side">
          <img src={img('blog-side.jpg')} alt="" />
          <div>
            <p className="post__meta">
              <b>DEVELOPMENT</b> 16 March 2026
            </p>
            <h3>Road Trip Ready: Essential Checklist Before You Hit the Road</h3>
            <p>{LOREM_LONG}</p>
            <button type="button" className="btn-outline-blue">
              Read More
            </button>
          </div>
        </div>
        <div className="post-grid">
          {blogPosts.recent.map((p) => (
            <PostCard key={p.title} p={p} />
          ))}
        </div>
      </section>

      <section className="container blog-section">
        <div className="blog-section__head">
          <h2>Popular Post</h2>
          <button type="button" className="btn btn-primary btn-sm">
            View All
          </button>
        </div>
        <div className="post-grid">
          {blogPosts.popular.map((p) => (
            <PostCard key={p.title} p={p} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
