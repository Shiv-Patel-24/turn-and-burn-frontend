import { useEffect, useState, useRef } from 'react';
import { FiSearch, FiMoreVertical, FiImage, FiSmile, FiSend, FiMapPin, FiMic, FiPhone, FiVideo, FiMessageSquare } from 'react-icons/fi';
import { BsCheck2All } from 'react-icons/bs';
import { FaStar } from 'react-icons/fa';
import { TbBuildingSkyscraper } from 'react-icons/tb';
import Layout from '../components/Layout';
import { chats as fallbackChats, img } from '../data';
import { apiRequest, getCurrentUser } from '../lib/api';

function formatChatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatDayDivider(dateStr) {
  if (!dateStr) return 'Today';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Today';
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  return d.toLocaleDateString([], { weekday: 'short', month: 'long', day: 'numeric' });
}

/* Figma: "MacBook Pro 14 - 16" (user) / "MacBook Pro 14 - 45" (host) — Inbox */
export default function Inbox({ role = 'user' }) {
  const [active, setActive] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  const currentUser = getCurrentUser() || {};
  const myUserId = currentUser._id || currentUser.id;

  // Auto-scroll to bottom of thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations list
  const loadConversations = () => {
    let activeEffect = true;
    setLoadingConv(true);
    apiRequest('/messages/conversations')
      .then((res) => {
        if (!activeEffect) return;
        const list = res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setConversations(list);
        } else {
          setConversations([]);
        }
      })
      .catch((err) => {
        console.warn('Could not load live conversations from server:', err.message);
        // keep empty or fallback
      })
      .finally(() => {
        if (activeEffect) setLoadingConv(false);
      });

    return () => {
      activeEffect = false;
    };
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const activeConv = conversations[active];
  const activeConvId = activeConv?._id || activeConv?.id;

  // Load messages for currently selected conversation and mark as read
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }
    let activeEffect = true;
    setLoadingMsgs(true);
    apiRequest(`/messages/conversations/${activeConvId}/messages`)
      .then((res) => {
        if (!activeEffect) return;
        const msgList = res?.data || [];
        setMessages(Array.isArray(msgList) ? msgList : []);

        // Mark conversation as read on the backend
        apiRequest(`/messages/conversations/${activeConvId}/read`, { method: 'PATCH' })
          .then(() => {
            setConversations((prev) =>
              prev.map((c) =>
                (c._id || c.id) === activeConvId ? { ...c, unreadCount: 0 } : c
              )
            );
          })
          .catch(() => {});
      })
      .catch((err) => {
        console.warn('Could not load messages from server:', err.message);
        setMessages([]);
      })
      .finally(() => {
        if (activeEffect) setLoadingMsgs(false);
      });

    return () => {
      activeEffect = false;
    };
  }, [activeConvId]);

  const send = async () => {
    if (!text.trim() || sending) return;
    const currentText = text.trim();
    setText('');
    setSending(true);

    if (activeConvId) {
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg = {
        _id: tempId,
        conversation: activeConvId,
        sender: myUserId,
        type: 'text',
        text: currentText,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        const res = await apiRequest(`/messages/conversations/${activeConvId}/messages`, {
          method: 'POST',
          body: { text: currentText },
        });

        if (res?.data) {
          setMessages((prev) => prev.map((m) => (m._id === tempId ? res.data : m)));
        }

        setConversations((prev) =>
          prev.map((c) =>
            (c._id || c.id) === activeConvId
              ? {
                  ...c,
                  lastMessage: res?.data || optimisticMsg,
                  lastMessageAt: new Date().toISOString(),
                }
              : c,
          ),
        );
      } catch (err) {
        console.warn('Failed to send live message to server:', err.message);
      } finally {
        setSending(false);
      }
    } else {
      setMessages((prev) => [
        ...prev,
        {
          _id: `mock-${Date.now()}`,
          sender: myUserId,
          type: 'text',
          text: currentText,
          createdAt: new Date().toISOString(),
        },
      ]);
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const other = c.otherParticipant || {};
    const name = `${other.firstName || ''} ${other.lastName || ''}`.toLowerCase();
    const vehicleName = `${c.vehicle?.year || ''} ${c.vehicle?.make || ''} ${c.vehicle?.model || ''}`.toLowerCase();
    const lastTxt = (c.lastMessage?.text || '').toLowerCase();
    return name.includes(q) || vehicleName.includes(q) || lastTxt.includes(q);
  });

  const activeOther = activeConv?.otherParticipant || {};
  const activeOtherName = activeOther.firstName ? `${activeOther.firstName} ${activeOther.lastName || ''}`.trim() : 'Killan James';
  const activeAvatar = activeOther.profilePhotoUrl || img('av-killan.jpg');
  const activeVehicle = activeConv?.vehicle;
  const vehicleTitle = activeVehicle ? `${activeVehicle.year || ''} ${activeVehicle.make || ''} ${activeVehicle.model || ''}`.trim() : 'Mercedes Vito';
  const vehiclePrimaryPhoto = activeVehicle?.photos?.find((p) => p.isPrimary)?.url || activeVehicle?.photos?.[0]?.url || img('g-1.jpg');

  return (
    <Layout role={role}>
      <div className="container inbox">
        <aside className="inbox__list">
          <h1>{role === 'user' ? 'Messages' : 'Inbox'}</h1>
          <label className="inbox__search">
            <FiSearch size={20} />
            <input
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>

          {loadingConv ? (
            <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Loading messages...</p>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((c, i) => {
              const other = c.otherParticipant || {};
              const name = other.firstName ? `${other.firstName} ${other.lastName || ''}`.trim() : 'Participant';
              const avatar = other.profilePhotoUrl || img('av-1.jpg');
              const isSelected = active === i;
              const lastMsg = c.lastMessage || {};
              const preview =
                lastMsg.type === 'call'
                  ? lastMsg.text || 'Call'
                  : lastMsg.type === 'voice'
                  ? 'Voice message'
                  : lastMsg.text || 'No messages yet';
              const timeDisplay = formatChatTime(c.lastMessageAt || lastMsg.createdAt || c.updatedAt);

              return (
                <button
                  type="button"
                  className={`chat ${isSelected ? 'is-active' : ''}`}
                  key={c._id || i}
                  onClick={() => setActive(i)}
                >
                  <span className="chat__avatar">
                    <img src={avatar} alt={name} onError={(e) => { e.currentTarget.src = img('av-1.jpg'); }} />
                    <i />
                  </span>
                  <span className="chat__body">
                    <b>{name}</b>
                    <small>
                      {lastMsg.type === 'call' ? <FiPhone size={12} /> : lastMsg.type === 'voice' ? <FiMic size={12} /> : null} {preview}
                    </small>
                  </span>
                  <span className="chat__meta">
                    <small>{timeDisplay}</small>
                    {c.unreadCount > 0 ? <em>{c.unreadCount}</em> : <BsCheck2All color="#22c55e" />}
                  </span>
                  <FiMoreVertical className="chat__more" />
                </button>
              );
            })
          ) : conversations.length === 0 ? (
            fallbackChats.map((c, i) =>
              c.section ? (
                <p className="inbox__section" key={i}>
                  <FiMessageSquare /> {c.section}
                </p>
              ) : (
                <button
                  type="button"
                  className={`chat ${active === i ? 'is-active' : ''}`}
                  key={i}
                  onClick={() => setActive(i)}
                >
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
            )
          ) : (
            <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No conversations match your search</p>
          )}
        </aside>

        <section className="thread">
          <header className="thread__head">
            <img src={activeAvatar} alt={activeOtherName} onError={(e) => { e.currentTarget.src = img('av-killan.jpg'); }} />
            <h2>{activeOtherName}</h2>
          </header>

          <div className="thread__msgs" style={{ minHeight: '380px', maxHeight: '580px', overflowY: 'auto' }}>
            {loadingMsgs ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '30px' }}>Loading conversation...</p>
            ) : messages.length > 0 ? (
              messages.map((m, idx) => {
                const isMe = m.sender === myUserId || (typeof m.sender === 'object' && m.sender?._id === myUserId);
                const senderPhoto = isMe ? (currentUser.profilePhotoUrl || img('av-2.jpg')) : activeAvatar;
                const time = formatChatTime(m.createdAt);

                return (
                  <div key={m._id || idx} className={`msg ${isMe ? 'msg--me' : ''}`}>
                    {!isMe && (
                      <img
                        src={senderPhoto}
                        alt=""
                        onError={(e) => { e.currentTarget.src = img('av-killan.jpg'); }}
                      />
                    )}
                    <div>
                      <small>{time}</small>
                      {m.type === 'call' ? (
                        <p className={`bubble ${isMe ? 'bubble--me' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {m.callMeta?.callType === 'video' ? <FiVideo size={16} /> : <FiPhone size={16} />}
                          <span>{m.text || 'Call session'}</span>
                        </p>
                      ) : m.type === 'voice' ? (
                        <p className={`bubble ${isMe ? 'bubble--me' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <FiMic size={16} />
                          <span>Voice Message {m.voiceDurationSeconds ? `(${m.voiceDurationSeconds}s)` : ''}</span>
                        </p>
                      ) : (
                        <p className={`bubble ${isMe ? 'bubble--me' : ''}`}>
                          {m.text}
                        </p>
                      )}
                    </div>
                    {isMe && (
                      <img
                        src={senderPhoto}
                        alt=""
                        onError={(e) => { e.currentTarget.src = img('av-2.jpg'); }}
                      />
                    )}
                  </div>
                );
              })
            ) : (
              activeConv ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
                  <p>No messages in this conversation yet. Send a message to start!</p>
                </div>
              ) : (
                <>
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
                    </div>
                  </div>
                </>
              )
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              placeholder="Type your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={sending}
            />
            <FiImage size={22} style={{ cursor: 'pointer' }} />
            <FiSmile size={22} style={{ cursor: 'pointer' }} />
            <button type="submit" aria-label="Send" disabled={sending || !text.trim()}>
              <FiSend size={22} />
            </button>
            <FiMapPin size={22} style={{ cursor: 'pointer' }} />
          </form>
        </section>

        <aside className="contact-card">
          <img
            className="contact-card__avatar"
            src={activeAvatar}
            alt={activeOtherName}
            onError={(e) => { e.currentTarget.src = img('av-killan.jpg'); }}
          />
          <b>{activeOtherName}</b>
          <small>@{activeOtherName.toLowerCase().replace(/\s+/g, '')}</small>
          <h4>{activeVehicle?.style || 'Luxury Car'}</h4>
          <p>
            <FaStar color="#FDB022" /> 5.0 <span>{vehicleTitle}</span>
          </p>
          <p>{activeVehicle?.seats ? `${activeVehicle.seats} Seater Car` : '5 Seater Car'}</p>
          <p className="contact-card__brand">
            <TbBuildingSkyscraper /> {activeVehicle ? `${activeVehicle.make} ${activeVehicle.model}` : 'Nissan GT-R'}
          </p>
          <strong>{activeVehicle?.pricing?.dailyRate ? `$${activeVehicle.pricing.dailyRate}/ day` : '$4,955/ month'}</strong>

          <div className="contact-card__gallery">
            <img
              src={vehiclePrimaryPhoto}
              alt=""
              onError={(e) => { e.currentTarget.src = img('g-1.jpg'); }}
            />
            <img
              src={activeVehicle?.photos?.[1]?.url || img('g-2.jpg')}
              alt=""
              onError={(e) => { e.currentTarget.src = img('g-2.jpg'); }}
            />
            <img
              src={activeVehicle?.photos?.[2]?.url || img('g-3.jpg')}
              alt=""
              onError={(e) => { e.currentTarget.src = img('g-3.jpg'); }}
            />
            <div>
              <img
                src={activeVehicle?.photos?.[3]?.url || img('g-4.jpg')}
                alt=""
                onError={(e) => { e.currentTarget.src = img('g-4.jpg'); }}
              />
              <img
                src={activeVehicle?.photos?.[4]?.url || img('g-5.jpg')}
                alt=""
                onError={(e) => { e.currentTarget.src = img('g-5.jpg'); }}
              />
              <img
                src={activeVehicle?.photos?.[5]?.url || img('g-6.jpg')}
                alt=""
                onError={(e) => { e.currentTarget.src = img('g-6.jpg'); }}
              />
              <span className="more">
                <img src={img('g-7.jpg')} alt="" />
                <b>{activeVehicle?.photos?.length > 4 ? `+${activeVehicle.photos.length - 4}` : '5+'}</b>
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

