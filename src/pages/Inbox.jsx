import { useState } from 'react';
import { FiSearch, FiMoreVertical, FiImage, FiSmile, FiSend, FiMapPin, FiMic, FiMessageSquare } from 'react-icons/fi';
import { BsCheck2All } from 'react-icons/bs';
import { FaStar } from 'react-icons/fa';
import { TbBuildingSkyscraper } from 'react-icons/tb';
import Layout from '../components/Layout';
import { chats, img } from '../data';

/* Figma: "MacBook Pro 14 - 16" (user) / "MacBook Pro 14 - 45" (host) — Inbox */
export default function Inbox({ role = 'user' }) {
  const [active, setActive] = useState(0);
  const [text, setText] = useState('');
  const [mine, setMine] = useState(['Great 🔥 That’s a nice design Idea. 😍👏']);
  const send = () => {
    if (!text.trim()) return;
    setMine([...mine, text]);
    setText('');
  };
  return (
    <Layout role={role}>
      <div className="container inbox">
        <aside className="inbox__list">
          <h1>{role === 'user' ? 'Messages' : 'Inbox'}</h1>
          <label className="inbox__search">
            <FiSearch size={20} />
            <input placeholder="Search" />
          </label>
          {chats.map((c, i) =>
            c.section ? (
              <p className="inbox__section" key={i}>
                <FiMessageSquare /> {c.section}
              </p>
            ) : (
              <button type="button" className={`chat ${active === i ? 'is-active' : ''}`} key={i} onClick={() => setActive(i)}>
                <span className="chat__avatar">
                  <img src={c.avatar} alt="" />
                  {c.online && <i />}
                </span>
                <span className="chat__body">
                  <b>{c.name}</b>
                  <small className={c.typing ? 'typing' : ''}>
                    {c.voice && <FiMic />} {c.msg}
                  </small>
                </span>
                <span className="chat__meta">
                  <small>{c.time}</small>
                  {c.badge ? <em>{c.badge}</em> : c.read ? <BsCheck2All color="#22c55e" /> : <span />}
                </span>
                <FiMoreVertical className="chat__more" />
              </button>
            ),
          )}
        </aside>

        <section className="thread">
          <header className="thread__head">
            <img src={img('av-killan.jpg')} alt="" />
            <h2>Killan James</h2>
          </header>
          <div className="thread__msgs">
            <div className="msg">
              <img src={img('av-killan.jpg')} alt="" />
              <div>
                <small>10:12 AM</small>
                <p className="bubble">
                  Lorem Ipsum is simply dummy text <FiMoreVertical />
                </p>
                <p className="bubble">
                  Lorem Ipsum is simply dummy 😁 <FiMoreVertical />
                </p>
              </div>
            </div>
            <div className="thread__day">
              <span>Today, March 24</span>
            </div>
            <div className="msg">
              <img src={img('av-killan.jpg')} alt="" />
              <div>
                <small>10:30 AM</small>
                <p className="bubble">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. <FiMoreVertical />
                </p>
                <p className="bubble">
                  Lorem Ipsum is simply dummy text of <FiMoreVertical />
                </p>
              </div>
            </div>
            <div className="msg msg--me">
              <div>
                <small>10:30 AM</small>
                {mine.map((m, i) => (
                  <p className="bubble bubble--me" key={i}>
                    {m}
                  </p>
                ))}
              </div>
              <img src={img('av-2.jpg')} alt="" />
            </div>
          </div>
          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input placeholder="Type your message..." value={text} onChange={(e) => setText(e.target.value)} />
            <FiImage size={22} />
            <FiSmile size={22} />
            <button type="submit" aria-label="Send">
              <FiSend size={22} />
            </button>
            <FiMapPin size={22} />
          </form>
        </section>

        <aside className="contact-card">
          <img className="contact-card__avatar" src={img('av-killan.jpg')} alt="" />
          <b>Killan James</b>
          <small>@killan james</small>
          <h4>Luxury Car</h4>
          <p>
            <FaStar color="#FDB022" /> 3.8 <span>Mercedes Vito</span>
          </p>
          <p>5 Sitter Car</p>
          <p className="contact-card__brand">
            <TbBuildingSkyscraper /> Nissan GT-R
          </p>
          <strong>$4,955/ month</strong>
          <div className="contact-card__gallery">
            <img src={img('g-1.jpg')} alt="" />
            <img src={img('g-2.jpg')} alt="" />
            <img src={img('g-3.jpg')} alt="" />
            <div>
              <img src={img('g-4.jpg')} alt="" />
              <img src={img('g-5.jpg')} alt="" />
              <img src={img('g-6.jpg')} alt="" />
              <span className="more">
                <img src={img('g-7.jpg')} alt="" />
                <b>5+</b>
              </span>
            </div>
          </div>
          <button type="button" className="btn-block-red">
            Block
          </button>
        </aside>
      </div>
    </Layout>
  );
}
