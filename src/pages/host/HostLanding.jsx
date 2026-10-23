import { useState } from 'react';
import { FiPlay } from 'react-icons/fi';
import { TbCar, TbUserHeart, TbCalendarCheck, TbGauge } from 'react-icons/tb';
import Layout from '../../components/Layout';
import { Testimonials } from '../../components/Cards';
import { img } from '../../data';
import { navigate } from '../../router';

const GetStarted = ({ big }) => (
  <button type="button" className={`btn btn-primary btn-upper ${big ? 'btn-hero' : 'btn-cta'}`} onClick={() => navigate('/host/list/location')}>
    GET STARTED
  </button>
);

/* Figma: "MacBook Pro 14 - 23" — Host landing */
export default function HostLanding() {
  const [playing, setPlaying] = useState(false);
  return (
    <Layout role="host">
      <section className="host-hero">
        <img src={img('host-hero.jpg')} alt="" />
        <div className="container">
          <p className="host-hero__eyebrow">HOSTS CARS ON TURN AND BURN</p>
          <h1>Launch Your Car Sharing Business on Turn and Burn</h1>
          <p className="host-hero__sub">Hosts across the US earn $10,489 per year per car on average*</p>
          <GetStarted big />
        </div>
      </section>

      <section className="container host-numbers">
        <div className="section-head">
          <h2>Turn and Burn by the numbers**</h2>
          <p className="small">Become an entrepreneur with Turn and Burn, the world’s largest car sharing marketplace.</p>
        </div>
        <div className="facts__grid facts__grid--plain">
          <img className="facts__car" src={img('host-numbers.png')} alt="" />
          {[
            [TbCar, '$6.6B', 'in host earnings'],
            [TbUserHeart, '3.6M+', 'active guests'],
            [TbCalendarCheck, '340,000+', 'active vehicles'],
            [TbGauge, '28,000+', 'cities'],
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
        <div className="center">
          <GetStarted />
        </div>
      </section>

      <section className="container how">
        <div className="section-head">
          <h2>How to Build a Successful Car Rental Business on Turn and Burn</h2>
          <p className="small">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
        </div>
        <div className="how__grid">
          <div className="how__col">
            <div className="how__item">
              <img src={img('icon-bar.png')} alt="" />
              <h3>Grow at your own pace</h3>
              <p>Build a flexible and scalable car sharing business that fits your unique goals.</p>
            </div>
            <div className="how__item">
              <img src={img('icon-ribbon.png')} alt="" />
              <h3>Offer an excellent guest experience</h3>
              <p>
                Give your guests a five-star experience and become an <a href="#/host">All-Star Host</a>, the highest-rated and most dependable hosts on Turo.
              </p>
            </div>
          </div>
          <img className="how__img" src={img('host-why.png')} alt="" />
          <div className="how__col">
            <div className="how__item">
              <img src={img('icon-plane.png')} alt="" />
              <h3>Offer airport delivery</h3>
              <p>
                Nearly a third of trips on Turo start at the airport, so consider delivering to your local airport to help get your business off to a strong start. <a href="#/host">Learn more.</a>
              </p>
            </div>
            <div className="how__item">
              <img src={img('icon-doc.png')} alt="" />
              <h3>Attract monthly trips</h3>
              <p>
                Boost earnings and lower costs by offering monthly trips, the fastest-growing type of trip on Turo. <a href="#/host">Learn more</a> about these more hands-off trips.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container video-sec">
        <h2>Why hosts love monthly trips</h2>
        <div className="video">
          <img src={img('host-video.jpg')} alt="Jordan Miller, a Turo host in Denver, Colorado, shares his experience with monthly trips" />
          <button type="button" className="video__play" onClick={() => setPlaying(!playing)}>
            <span>
              <FiPlay size={18} />
            </span>
            {playing ? 'Playing…' : 'Click to play video'}
          </button>
        </div>
        <h2 className="mt-xl">Start building your business plan</h2>
        <p className="video-sec__lead">List your first car to get started today, and build your plan to take control of your financial future tomorrow.</p>
        <GetStarted />
      </section>

      <section className="container earn">
        <div className="section-head">
          <h2>How much could you earn on Turn and Burn?</h2>
          <p className="small">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
        </div>
        <div className="earn__stats">
          {[
            ['Hosts earn', '$10,489', '/year/car*'],
            ['That\'s', '$874', '/month*'],
            ['Cars are booked', '15', 'days/month*'],
          ].map(([a, b, c]) => (
            <div key={a}>
              <small>{a}</small>
              <strong>{b}</strong>
              <b>{c}</b>
              <small>on average</small>
            </div>
          ))}
        </div>
        <h3 className="earn__title">More cars, more cash</h3>
        <p className="earn__sub">Build your portfolio and expand your earning potential.</p>
        <div className="earn__more">
          <img src={img('earn-illus.jpg')} alt="" />
          <div>
            {[
              ['$10,489', 'Average annual earnings for 1 car*'],
              ['$32,547', 'Average annual earnings for 3 cars*'],
              ['$52,445', 'Average annual earnings for 5 cars*'],
            ].map(([a, b]) => (
              <p key={a}>
                <strong>{a}</strong>
                <small>{b}</small>
              </p>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
    </Layout>
  );
}
