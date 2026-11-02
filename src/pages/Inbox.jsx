import { useEffect, useState, useRef } from 'react';
import { FiSearch, FiMoreVertical, FiImage, FiSmile, FiSend, FiMapPin, FiMic, FiPhone, FiVideo, FiMessageSquare, FiCheckCircle, FiAlertCircle, FiSquare } from 'react-icons/fi';
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

  // Presence state
  const [presence, setPresence] = useState({ online: false, lastSeenAt: null });

  // Moderation state
  const [blocking, setBlocking] = useState(false);
  const [modNotice, setModNotice] = useState('');

  // Voice recording state
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordIntervalRef = useRef(null);

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
  const otherParticipantId = activeConv?.otherParticipant?._id;

  // Fetch real-time presence (GET /messages/presence/:userId)
  useEffect(() => {
    if (!otherParticipantId) {
      setPresence({ online: false, lastSeenAt: null });
      return;
    }

    const fetchPresence = () => {
      apiRequest(`/messages/presence/${otherParticipantId}`)
        .then((res) => {
          if (res?.data) {
            setPresence({
              online: !!res.data.online,
              lastSeenAt: res.data.lastSeenAt || null,
            });
          }
        })
        .catch(() => {});
    };

    fetchPresence();
    const interval = setInterval(fetchPresence, 15000);
    return () => clearInterval(interval);
  }, [otherParticipantId]);

  // Moderation status
  const isBlockedByMe = (activeConv?.blockedBy || []).some((id) => String(id) === String(myUserId));
  const isBlockedAny = (activeConv?.blockedBy || []).length > 0;

  const handleBlockUser = async () => {
    if (!activeConvId) return;
    if (!window.confirm(`Are you sure you want to block this user? You will no longer receive messages in this conversation.`)) return;

    setBlocking(true);
    setModNotice('');
    try {
      await apiRequest(`/messages/conversations/${activeConvId}/block`, { method: 'POST' });
      setConversations((prev) =>
        prev.map((c) =>
          (c._id || c.id) === activeConvId
            ? { ...c, blockedBy: [...(c.blockedBy || []), myUserId] }
            : c
        )
      );
      setModNotice('User has been blocked.');
      setTimeout(() => setModNotice(''), 4000);
    } catch (err) {
      alert(err?.message || 'Failed to block conversation.');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!activeConvId) return;
    setBlocking(true);
    setModNotice('');
    try {
      await apiRequest(`/messages/conversations/${activeConvId}/unblock`, { method: 'POST' });
      setConversations((prev) =>
        prev.map((c) =>
          (c._id || c.id) === activeConvId
            ? { ...c, blockedBy: (c.blockedBy || []).filter((id) => String(id) !== String(myUserId)) }
            : c
        )
      );
      setModNotice('User has been unblocked.');
      setTimeout(() => setModNotice(''), 4000);
    } catch (err) {
      alert(err?.message || 'Failed to unblock conversation.');
    } finally {
      setBlocking(false);
    }
  };

  // Voice message recording (POST /messages/voice-upload)
  const startRecording = async () => {
    if (recording || isBlockedAny) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType: mime });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setRecordSeconds(0);

      recordIntervalRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied:', err.message);
      alert('Microphone access is required to record voice messages.');
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current.stop();
    }
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    audioChunksRef.current = [];
    setRecording(false);
    setRecordSeconds(0);
  };

  const sendVoiceRecording = async () => {
    if (!mediaRecorderRef.current || !activeConvId) return;

    setUploadingVoice(true);
    const duration = recordSeconds || 1;

    mediaRecorderRef.current.onstop = async () => {
      try {
        const mime = mediaRecorderRef.current.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        const ext = mime.includes('mp4') ? 'm4a' : 'webm';
        const file = new File([audioBlob], `voice-msg-${Date.now()}.${ext}`, { type: mime });

        const formData = new FormData();
        formData.append('voice', file);

        // Upload to POST /messages/voice-upload
        const uploadRes = await apiRequest('/messages/voice-upload', {
          method: 'POST',
          body: formData,
        });

        const fileUrl = uploadRes?.data?.url;
        if (!fileUrl) throw new Error('Voice upload did not return URL');

        // Send voice message
        const msgRes = await apiRequest(`/messages/conversations/${activeConvId}/messages`, {
          method: 'POST',
          body: {
            text: 'Voice message',
            voiceUrl: fileUrl,
          },
        });

        if (msgRes?.data) {
          setMessages((prev) => [...prev, msgRes.data]);
        }
      } catch (err) {
        console.warn('Voice send failed:', err.message);
        alert(err?.message || 'Failed to send voice message.');
      } finally {
        setUploadingVoice(false);
        setRecording(false);
        setRecordSeconds(0);
        if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      }
    };

    mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
    mediaRecorderRef.current.stop();
  };

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
    const lastTxt = (c.lastMessage?.text || (c.lastMessage?.voiceUrl ? 'voice message' : '')).toLowerCase();
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
                  : (lastMsg.voiceUrl || lastMsg.type === 'voice')
                  ? '🎤 Voice message'
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
          <header className="thread__head" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <img src={activeAvatar} alt={activeOtherName} onError={(e) => { e.currentTarget.src = img('av-killan.jpg'); }} />
              <span
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: presence.online ? '#22c55e' : '#94a3b8',
                  border: '2px solid #fff',
                }}
              />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px' }}>{activeOtherName}</h2>
              {presence.online ? (
                <small style={{ color: '#16a34a', fontWeight: 600 }}>● Online</small>
              ) : (
                <small style={{ color: '#94a3b8' }}>
                  {presence.lastSeenAt ? `Last seen ${formatChatTime(presence.lastSeenAt)}` : 'Offline'}
                </small>
              )}
            </div>
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
                      ) : (m.voiceUrl || m.fileUrl || m.type === 'voice') ? (
                        <div
                          className={`bubble ${isMe ? 'bubble--me' : ''}`}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                            padding: '10px 14px',
                            borderRadius: '14px',
                            background: isMe ? '#0a5cff' : '#f1f5f9',
                            color: isMe ? '#ffffff' : '#0f172a',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', opacity: 0.9 }}>
                            <FiMic size={14} /> Voice Message {m.voiceDurationSeconds ? `(${m.voiceDurationSeconds}s)` : ''}
                          </div>
                          {(m.voiceUrl || m.fileUrl) ? (
                            <audio
                              controls
                              src={m.voiceUrl || m.fileUrl}
                              style={{
                                height: '32px',
                                width: '220px',
                                outline: 'none',
                                borderRadius: '16px',
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: '12px', fontStyle: 'italic' }}>Audio recording</span>
                          )}
                        </div>
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

          {/* Voice recording bar or Blocked warning or Normal composer */}
          {recording ? (
            <div
              className="composer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '10px 16px',
                borderRadius: '12px',
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#ef4444',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#991b1b', minWidth: '45px' }}>
                {Math.floor(recordSeconds / 60)}:{String(recordSeconds % 60).padStart(2, '0')}
              </span>
              <span style={{ fontSize: '13px', color: '#b91c1c', flex: 1 }}>
                Recording voice message...
              </span>
              <button
                type="button"
                className="chip-btn"
                style={{ background: '#fff', color: '#dc2626', border: '1px solid #fca5a5' }}
                onClick={cancelRecording}
                disabled={uploadingVoice}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '6px 16px', fontSize: '13px' }}
                onClick={sendVoiceRecording}
                disabled={uploadingVoice}
              >
                {uploadingVoice ? 'Uploading...' : 'Send Voice'}
              </button>
            </div>
          ) : isBlockedAny ? (
            <div
              style={{
                padding: '16px 20px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                margin: '12px 0',
                color: '#991b1b',
                fontSize: '14px',
                textAlign: 'center',
              }}
            >
              <strong>Conversation Blocked</strong>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#b91c1c' }}>
                {isBlockedByMe
                  ? 'You have blocked this conversation. Click "Unblock User" in the details panel to resume messaging.'
                  : 'This conversation has been blocked by the other participant.'}
              </p>
            </div>
          ) : (
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
              <button
                type="button"
                onClick={startRecording}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', color: '#0a5cff' }}
                title="Record voice message"
              >
                <FiMic size={22} />
              </button>
              <FiImage size={22} style={{ cursor: 'pointer' }} />
              <FiSmile size={22} style={{ cursor: 'pointer' }} />
              <button type="submit" aria-label="Send" disabled={sending || !text.trim()}>
                <FiSend size={22} />
              </button>
              <FiMapPin size={22} style={{ cursor: 'pointer' }} />
            </form>
          )}
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

          {modNotice && (
            <div
              style={{
                padding: '8px 12px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                color: '#065f46',
                fontSize: '12px',
                margin: '12px 0',
                textAlign: 'center',
              }}
            >
              <FiCheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {modNotice}
            </div>
          )}

          {isBlockedByMe ? (
            <button
              type="button"
              className="btn btn-outline"
              style={{
                width: '100%',
                borderColor: '#0a5cff',
                color: '#0a5cff',
                fontWeight: 600,
                height: '46px',
                borderRadius: '8px',
                marginTop: '12px',
              }}
              onClick={handleUnblockUser}
              disabled={blocking}
            >
              {blocking ? 'Unblocking...' : 'Unblock User'}
            </button>
          ) : (
            <button
              type="button"
              className="btn-block-red"
              style={{ marginTop: '12px' }}
              onClick={handleBlockUser}
              disabled={blocking}
            >
              {blocking ? 'Blocking...' : 'Block User'}
            </button>
          )}
        </aside>
      </div>
    </Layout>
  );
}

