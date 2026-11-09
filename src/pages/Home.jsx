import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaComments, FaVideo, FaWhatsapp, FaPaperclip, FaTimes, FaDonate, FaPrayingHands, FaBible, FaTimesCircle } from 'react-icons/fa';

import Footer from '../components/Footer';
import BirthdayCelebrants from '../components/BirthdayCelebrants';

import { useInView, useCountUp } from '../hooks/useInView';
import localVideo1 from '../assets/videos/sermon1.mp4';
import localVideo2 from '../assets/videos/sermon2.mp4';

import './Home.css';

import commercialVid1 from '../assets/videos/commercial.mp4';
import commercialVid2 from '../assets/videos/commercial.mp4';
import commercialVid3 from '../assets/videos/commercial.mp4';
import commercialVid4 from '../assets/videos/commercial.mp4';
import commercialVid5 from '../assets/videos/commercial.mp4';
import commercialVid6 from '../assets/videos/commercial.mp4';
import commercialVid7 from '../assets/videos/commercial.mp4';

import APNIcon from '../icons/APN.png';
import apnImage16 from '../assets/images/menthorShip.jpeg';

const cmArr = [
  commercialVid1, commercialVid2, commercialVid3, commercialVid4,
  commercialVid5, commercialVid6, commercialVid7,
];

const marqueeMessages = [
  '✨ Special Event This Sunday • Youth Fellowship • Community Outreach • Join Us! ✨',
  '✨ Answered Prayer Network • A place Where destinies are restored and rearranged. • Pray Until the soul cracks ✨',
  '✨ 30 Days of Menthorship Through The Word. Listen discover and share. God richly bless you ✨',
];

const upcomingEvents = [
  { id: 1, title: 'Commanding Your Week', date: 'Every Sunday', time: '3:00 PM', location: 'Main Sanctuary' },
  { id: 2, title: 'Sunday Celebration Service', date: 'Nov 5, 2026', time: '9:00 AM', location: 'Main Sanctuary' },
  { id: 3, title: 'Night of Answered Prayers', date: 'Nov 20, 2026', time: '10:00 PM', location: 'Main Sanctuary' }
];

const dailyVerses = [
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
  { text: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
  { text: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1" },
  { text: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", reference: "Joshua 1:9" }
];

const initialPrayers = [
  { id: 1, name: "Anonymous", request: "Please pray for my family's health and provision.", prayers: 24 },
  { id: 2, name: "Sarah M.", request: "Praying for a breakthrough in my career and peace of mind.", prayers: 18 },
  { id: 3, name: "Anonymous", request: "Agreeing with me for my healing and restoration.", prayers: 32 },
];

const localVideos = [
  { type: 'video', src: 'https://www.youtube.com/watch?v=pHvM7OhRGJc', embedUrl: 'https://www.youtube.com/embed/pHvM7OhRGJc', isYouTube: true, title: '7 HOURS PRAYER: OVERTHROWING DEMONIC ALTARS 2', channel: 'ANSWERED PRAYER NETWORK-GH', duration: '2:07:09', alt: '7 HOURS PRAYER: OVERTHROWING DEMONIC ALTARS 2' },
  // ... (Keep all your existing videos) ...
];

const localAudios = [
  { type: 'audio', src: 'https://drive.google.com/uc?export=download&id=1dIp-bszTMGFEB3y6LNbwWj8IeGD7f2Cp', title: '🎓 Lord teach me your ways', alt: 'Lord teach me your ways', fileName: 'Lord teach me your ways', local: true },
  // ... (Keep all your existing audios) ...
];

const ministries = [
  { icon: APNIcon, title: 'Worship Ministry', desc: 'Join us in worship as we lift our hearts to God through praise, prayer, and the teaching of His Word.' },
  { icon: APNIcon, title: 'Youth Ministry', desc: 'A welcoming environment where young people can grow in faith, build friendships, and discover their purpose in Christ.' },
  { icon: APNIcon, title: 'Prayer Ministry', desc: 'Come together with us in prayer as we seek God, encourage one another, and stand together in faith.' },
  { icon: APNIcon, title: 'Community Ministry', desc: 'Serving our community with compassion, kindness, and practical support while sharing the love of Christ.' },
];

const mediaItems = [
  { type: 'image', src: apnImage16, alt: 'Church Event 16', title: 'Church Event 16' },
  { type: 'video', src: 'https://youtube.com/shorts/dbqnn792Y7M', embedUrl: 'https://www.youtube.com/embed/dbqnn792Y7M', isYouTube: true, alt: 'Sunday Sermon', title: 'Sunday Sermon' },
  { type: 'video', src: 'https://youtube.com/shorts/A7usTs1ds5k', embedUrl: 'https://www.youtube.com/embed/A7usTs1ds5k', isYouTube: true, alt: 'Commanding your week', title: 'Commanding your week' },
  { type: 'video', src: 'https://youtube.com/shorts/mbcNqd7bJGs', embedUrl: 'https://www.youtube.com/embed/mbcNqd7bJGs', isYouTube: true, alt: 'Community Outreach', title: 'Community Outreach' },
  { type: 'video', src: 'https://www.youtube.com/watch?v=Z5QRcyom9bw', embedUrl: 'https://www.youtube.com/embed/Z5QRcyom9bw', isYouTube: true, alt: 'Community Outreach', title: 'Community Outreach' },
  { type: 'video', src: 'https://www.youtube.com/watch?v=JgWr4jljWXU', embedUrl: 'https://www.youtube.com/embed/JgWr4jljWXU', isYouTube: true, alt: 'Community Outreach', title: 'Community Outreach' },
  { type: 'commandingWeek', title: 'Commanding Your Week Videos', alt: 'Commanding Your Week Videos', videos: localVideos },
  ...localVideos,
  ...localAudios,
];

const statsData = [
  { number: '∞', label: 'God’s Grace' },
  { number: '1', label: 'Family In Christ' },
  { number: '1', label: 'Body Of Christ' },
  { number: '24/7', label: 'Prayer & Faith' },
];

function SearchableSelect({ id, label, value, onChange, options, placeholder, noResultsText }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    if (value === '' || value === null || value === undefined) setQuery('');
    else if (selectedOption) setQuery(selectedOption.label);
  }, [value, selectedOption]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');
  const filteredOptions = normalizedQuery === '' ? options : options.filter((o) => o.label.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalizedQuery));

  const highlightMatch = (text, search) => {
    if (!search) return text;
    const regex = new RegExp(`(${search.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => regex.test(part) ? <mark key={i} className="search-highlight">{part}</mark> : part);
  };

  const handleSelect = (opt) => { onChange(opt.value); setQuery(opt.label); setOpen(false); };
  const handleInputChange = (e) => { const val = e.target.value; setQuery(val); setOpen(true); if (val === '') onChange(''); };
  const handleFocus = () => { setOpen(true); if (selectedOption) setQuery(''); };
  const handleBlur = () => { if (selectedOption) setQuery(selectedOption.label); else setQuery(''); setOpen(false); };

  return (
    <div className="ss-container" ref={containerRef} onMouseLeave={() => setOpen(false)}>
      {label && <label htmlFor={id} className="ss-label">{label}</label>}
      <input id={id} type="text" className="ss-input" value={query} placeholder={placeholder} onChange={handleInputChange} onClick={handleFocus} onFocus={handleFocus} onBlur={handleBlur} autoComplete="off" />
      {open && (
        <ul className="ss-dropdown" role="listbox" onMouseDown={(e) => e.preventDefault()}>
          {filteredOptions.length === 0 ? (
            <li className="ss-no-results">{noResultsText || 'No results found'}</li>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value} role="option" aria-selected={isSelected} className={`ss-option ${isSelected ? 'selected' : ''}`} onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}>
                  {highlightMatch(opt.label, query)}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

function StatItem({ number, label }) {
  const [ref, isVisible] = useInView({ threshold: 0.3 });
  const isStatic = number === '∞' || number === '24/7';
  const count = useCountUp(number, 1800, isVisible && !isStatic);
  const displayValue = isStatic ? number : count;

  return (
    <div className="stat-item" ref={ref}>
      <span className={`stat-number ${isVisible ? 'visible' : ''}`}>{displayValue}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAudioIndex, setSelectedAudioIndex] = useState('');
  const [selectedCommandingWeekIndex, setSelectedCommandingWeekIndex] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // --- NEW STATES FOR FEATURES ---
  const [showGiveModal, setShowGiveModal] = useState(false);
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpData, setRsvpData] = useState({ name: '', email: '', guests: 1 });
  const [prayerWall, setPrayerWall] = useState(initialPrayers);
  const [verseOfTheDay] = useState(() => dailyVerses[Math.floor(Math.random() * dailyVerses.length)]);
  
  // --- PRAYER REQUEST STATES ---
  const [prayerName, setPrayerName] = useState('');
  const [prayerEmail, setPrayerEmail] = useState('');
  const [prayerRequest, setPrayerRequest] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const playableMedia = mediaItems.filter((item) => item.type === 'video' || item.type === 'audio');
  const [selectedMediaIndex] = useState(0);

  const commandingWeekItem = mediaItems.find((item) => item.type === 'commandingWeek');
  const audioItems = mediaItems.filter((item) => item.type === 'audio');
  const imageItems = mediaItems.filter((item) => item.type === 'image');

  const isSingleImage = imageItems.length === 1;
  const selectedAudio = selectedAudioIndex !== '' ? audioItems[selectedAudioIndex] : null;
  const selectedCommandingWeekVideo = selectedCommandingWeekIndex !== '' && commandingWeekItem?.videos?.[selectedCommandingWeekIndex] ? commandingWeekItem.videos[selectedCommandingWeekIndex] : null;

  const [showCommercial, setShowCommercial] = useState(false);
  const [commercialUrl, setCommercialUrl] = useState(null);
  const commercialVideoRef = useRef(null);
  const commercialTimeoutRef = useRef(null);
  const commercialShowingRef = useRef(false);
  const commercialAudioRef = useRef(null);
  const audioRef = useRef(null);

  const [randomMessage] = useState(() => marqueeMessages[Math.floor(Math.random() * marqueeMessages.length)]);

  useEffect(() => {
    const unlockAudio = async () => {
      if (commercialAudioRef.current) {
        try {
          commercialAudioRef.current.volume = 0;
          await commercialAudioRef.current.play();
          commercialAudioRef.current.pause();
          commercialAudioRef.current.currentTime = 0;
        } catch { console.warn("Browser requires user interaction before audio can play."); }
      }
    };
    unlockAudio();
  }, []);

  useEffect(() => {
    if (imageItems.length <= 1) return undefined;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => prevIndex === imageItems.length - 1 ? 0 : prevIndex + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [imageItems.length]);

  const getAudioDownloadUrl = (src) => {
    if (!src) return '';
    if (src.includes('drive.google.com')) {
      if (src.includes('uc?export=download') || src.includes('uc?id=')) return src.replace(/export=download/, 'export=download&confirm=t');
      const fileMatch = src.match(/\/file\/d\/([^/]+)/);
      if (fileMatch) return `https://drive.google.com/uc?export=download&confirm=t&id=${fileMatch[1]}`;
    }
    return src;
  };

  const handleFileChange = (e) => { if (e.target.files && e.target.files.length > 0) setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files)]); };
  const removeFile = (indexToRemove) => { setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove)); };

  const handlePrayerSubmit = async (e) => {
    e.preventDefault();
    const message = `*New Prayer Request*\n\n*Name:* ${prayerName || 'Anonymous'}\n*Email:* ${prayerEmail || 'Not provided'}\n\n*Prayer Request:*\n${prayerRequest}`;

    if (selectedFiles.length > 0) {
      if (navigator.canShare && navigator.canShare({ files: selectedFiles })) {
        try {
          await navigator.share({ title: 'Prayer Request', text: message, files: selectedFiles });
          setPrayerName(''); setPrayerEmail(''); setPrayerRequest(''); setSelectedFiles([]);
          return;
        } catch (error) { console.log('Share failed or was cancelled', error); }
      } else {
        alert("Your device or browser does not support attaching files directly via web links. The prayer text will be sent to WhatsApp, but you will need to manually attach the files once WhatsApp opens.");
      }
    }

    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = '23351215212';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setPrayerName(''); setPrayerEmail(''); setPrayerRequest(''); setSelectedFiles([]);
  };

  // --- NEW HANDLERS ---
  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    alert(`✅ Seat reserved for ${rsvpData.name} (${rsvpData.guests} guest(s)) for "${selectedEvent?.title}". We will email you at ${rsvpData.email}.`);
    setShowRsvpModal(false);
    setRsvpData({ name: '', email: '', guests: 1 });
    setSelectedEvent(null);
  };

  const handlePrayForThis = (id) => {
    setPrayerWall(prev => prev.map(prayer => prayer.id === id ? { ...prayer, prayers: prayer.prayers + 1 } : prayer));
  };

  const closeCommercial = () => {
    commercialShowingRef.current = false;
    if (commercialTimeoutRef.current) { clearTimeout(commercialTimeoutRef.current); commercialTimeoutRef.current = null; }
    if (commercialVideoRef.current) { commercialVideoRef.current.pause(); commercialVideoRef.current.currentTime = 0; }
    if (commercialAudioRef.current) { commercialAudioRef.current.pause(); commercialAudioRef.current.currentTime = 0; }
    setShowCommercial(false); setCommercialUrl(null);
  };

  const startCommercial = () => {
    if (commercialShowingRef.current || !cmArr || cmArr.length === 0) return;
    commercialShowingRef.current = true;
    setCommercialUrl(cmArr[Math.floor(Math.random() * cmArr.length)]);
    setShowCommercial(true);
    commercialTimeoutRef.current = setTimeout(() => closeCommercial(), 10000);
  };

  useEffect(() => {
    const timer = setTimeout(() => startCommercial(), 5000);
    return () => { clearTimeout(timer); if (commercialTimeoutRef.current) clearTimeout(commercialTimeoutRef.current); };
  }, []);

  useEffect(() => {
    if (!showCommercial || !commercialUrl) return;
    if (commercialVideoRef.current) { const video = commercialVideoRef.current; video.currentTime = 0; video.muted = false; video.volume = 1.0; video.play().catch(err => console.warn(err)); }
    if (commercialAudioRef.current) { const audio = commercialAudioRef.current; audio.currentTime = 0; audio.volume = 0.3; audio.play().catch(err => console.warn(err)); }
  }, [showCommercial, commercialUrl]);

  useEffect(() => {
    if (!selectedAudio || !audioRef.current) return;
    const audio = audioRef.current; audio.currentTime = 0; audio.play().catch(err => console.warn(err));
  }, [selectedAudio]);

  const [ministriesRef, ministriesVisible] = useInView({ threshold: 0.1 });
  const [welcomeRef, welcomeVisible] = useInView({ threshold: 0.2 });
  const [whyTextRef, whyTextVisible] = useInView({ threshold: 0.2 });
  const [whyImgRef, whyImgVisible] = useInView({ threshold: 0.2 });

  return (
    <>
      {/* ================= MODALS ================= */}
      {/* 1. GIVE MODAL */}
      {showGiveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowGiveModal(false)}><FaTimesCircle /></button>
            <h2 className="modal-title">Give & Support</h2>
            <p className="modal-desc">Your generosity helps us spread the Gospel and serve our community.</p>
            
            <div className="give-number-box">
              <span className="give-label">Send to Mobile Money / WhatsApp:</span>
              <strong className="give-number">233 54 121 5212</strong>
            </div>
            
            <p className="give-notice">
              "You can send to 233 54 121 5212. Kindly add a reference. God bless you!"
            </p>
            
            <button 
              className="copy-number-btn" 
              onClick={() => {
                navigator.clipboard.writeText('233541215212');
                alert('Phone number copied to clipboard!');
              }}
            >
              📋 Copy Number
            </button>
          </div>
        </div>
      )}
      {/* 2. RSVP MODAL */}
      {showRsvpModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowRsvpModal(false)}><FaTimesCircle /></button>
            <h2 className="modal-title">Reserve Your Seat</h2>
            <h3 className="modal-subtitle">{selectedEvent?.title}</h3>
            <p className="modal-desc">📅 {selectedEvent?.date} | ⏰ {selectedEvent?.time}</p>
            <form className="rsvp-form" onSubmit={handleRsvpSubmit}>
              <input type="text" placeholder="Your Full Name" required value={rsvpData.name} onChange={(e) => setRsvpData({...rsvpData, name: e.target.value})} />
              <input type="email" placeholder="Your Email Address" required value={rsvpData.email} onChange={(e) => setRsvpData({...rsvpData, email: e.target.value})} />
              <input type="number" min="1" placeholder="Number of Guests" required value={rsvpData.guests} onChange={(e) => setRsvpData({...rsvpData, guests: e.target.value})} />
              <button type="submit" className="rsvp-submit-btn">Confirm Reservation</button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}

      {showCommercial && commercialUrl && (
        <div className="commercial-overlay" role="dialog" aria-label="Advertisement">
          <video ref={commercialVideoRef} className="commercial-video" src={commercialUrl} autoPlay playsInline preload="auto" controls={false} />
          <div className="commercial-timer">Advertisement</div>
        </div>
      )}

      <audio ref={commercialAudioRef} src="/audios/commercial.mp3" preload="auto" className="hidden-audio" />

      <main className="home">
        <section className="hero">
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="section-eyebrow hero-anim-eyebrow">Welcome To Answered Prayer Network</p>
            <h1 className="hero-title hero-anim-title">A Place To Worship<br />Grow &amp; Belong</h1>
            <p className="hero-desc hero-anim-desc">
              We are a community of believers committed to following Jesus Christ, growing in faith, serving others, and sharing the love of God with our community.
            </p>
            <div className="hero-actions">
              <Link to="/about" className="btn-outline-white hero-anim-btn">Discover Answered Prayer Network</Link>
              <Link to="/contact" className="btn-gold hero-anim-btn">Plan Your Visit</Link>
              <Link to="/meeting" className="btn-gold hero-anim-btn">🎥 Join Live Meeting</Link>
            </div>
          </div>
        </section>

        <section className="adverts">
          <marquee behavior="scroll" direction="left" scrollamount="6">{randomMessage}</marquee>
        </section>

        <BirthdayCelebrants />

        <section className="media-section">
          <div className="media-columns">
            <div className="media-column videos">
              {!isSingleImage && (
                <div className="media-selector-card mb-24">
                  <h2 className="media-selector-title section-title-style">Media Pictures</h2>
                  <div className="media-control-group">
                    <label htmlFor="picture-select" className="picture-select-label">🖼️ Select a picture</label>
                    <select id="picture-select" value={selectedImageIndex} onChange={(e) => setSelectedImageIndex(Number(e.target.value))}>
                      {imageItems.map((item, index) => <option value={index} key={index}>{item.title}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="media-selector-card">
                <h2 className="media-selector-title section-title-style">Media Player</h2>
                <SearchableSelect id="audio-select" label="🎶 30 Days of Mentorship. Listen & Grow in the Word" value={selectedAudioIndex} onChange={setSelectedAudioIndex} options={audioItems.map((item, index) => ({ value: index, label: item.title }))} placeholder="Type to search audios..." noResultsText="No audios found" />

                {selectedAudio && (
                  <div className="selected-audio">
                    <p className="title-bar-style">{selectedAudio.title}</p>
                    <audio key={selectedAudio.src} ref={audioRef} controls className="custom-audio-player">
                      <source src={getAudioDownloadUrl(selectedAudio.src)} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                    <a href={getAudioDownloadUrl(selectedAudio.src)} download={selectedAudio.fileName || `${selectedAudio.title}.mp3`} className="media-download-btn" onClick={(e) => { if (selectedAudio.src.includes('drive.google.com')) { e.preventDefault(); window.open(getAudioDownloadUrl(selectedAudio.src), '_blank', 'noopener,noreferrer'); } }}>
                      ⬇️ Download &ldquo;{selectedAudio.title}&rdquo;
                    </a>
                  </div>
                )}

                <div className="media-divider"></div>

                <SearchableSelect id="commanding-week-select" label="🎬 Select Commanding Your Week videos" value={selectedCommandingWeekIndex} onChange={setSelectedCommandingWeekIndex} options={(commandingWeekItem?.videos || []).map((video, index) => ({ value: index, label: video.title }))} placeholder="Type to search videos..." noResultsText="No videos found" />

                {selectedCommandingWeekVideo && (
                  <div className="selected-video mt-20">
                    <div className="title-bar-style">{selectedCommandingWeekVideo.title}</div>
                    {selectedCommandingWeekVideo.isYouTube ? (
                      <iframe width="100%" height="315" src={selectedCommandingWeekVideo.embedUrl} title={selectedCommandingWeekVideo.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    ) : (
                      <video key={selectedCommandingWeekVideo.src} width="100%" controls preload="metadata">
                        <source src={selectedCommandingWeekVideo.src} />
                      </video>
                    )}
                  </div>
                )}

                <div className="media-selection-hint">
                  <div className="hint-arrow">↑</div>
                  <div className="hint-icon"><FaVideo /></div>
                  <p>Choose an image, audio, or video from the options above.</p>
                  <span>Choose from our available media</span>
                </div>
              </div>
            </div>

            <div className="media-column images">
              <div className="full-height-slider">
                {imageItems.length > 0 && (
                  <img src={isSingleImage ? imageItems[0].src : imageItems[selectedImageIndex]?.src || imageItems[currentIndex].src} alt={isSingleImage ? imageItems[0].alt : imageItems[selectedImageIndex]?.alt || imageItems[currentIndex].alt} />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* UPCOMING EVENTS SECTION */}
        <section className="events-section">
          <div className="events-inner">
            <p className="section-eyebrow text-center">Mark Your Calendar</p>
            <h2 className="section-title text-center color-dark">Upcoming Events</h2>
            <span className="gold-rule centered" />
            <div className="events-grid">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-detail">📅 {event.date}</p>
                  <p className="event-detail">⏰ {event.time}</p>
                  <p className="event-detail mb-20">📍 {event.location}</p>
                  <div className="event-actions">
                    <button 
                      onClick={() => { setSelectedEvent(event); setShowRsvpModal(true); }} 
                      className="event-btn event-btn-rsvp"
                    >
                      RSVP / Learn More
                    </button>
                    <Link to="/meeting" className="event-btn event-btn-join">🎥 Join Live</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRAYER REQUEST SECTION */}
        <section className="prayer-request-section">
          <div className="prayer-inner">
            <h2 className="prayer-title">Need Prayer?</h2>
            <p className="prayer-desc">Our intercessory team is ready to stand in agreement with you. Submit your request below.</p>
            <form className="prayer-form" onSubmit={handlePrayerSubmit}>
              <input type="text" placeholder="Your Name (Optional)" value={prayerName} onChange={(e) => setPrayerName(e.target.value)} className="prayer-input" />
              <input type="email" placeholder="Your Email (Optional)" value={prayerEmail} onChange={(e) => setPrayerEmail(e.target.value)} className="prayer-input" />
              <textarea placeholder="Type your prayer request here..." rows="4" value={prayerRequest} onChange={(e) => setPrayerRequest(e.target.value)} className="prayer-textarea" required></textarea>

              <div className="file-upload-container">
                <label htmlFor="file-upload" className="file-upload-label">
                  <FaPaperclip /> Attach Files (Images, Audio, Video, PDF)
                </label>
                <input id="file-upload" type="file" multiple accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt" onChange={handleFileChange} className="file-input-hidden" />
                {selectedFiles.length > 0 && (
                  <div className="file-preview-list">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="file-preview-item">
                        <span>{file.name}</span>
                        <button type="button" onClick={() => removeFile(index)} className="file-remove-btn"><FaTimes /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="prayer-submit-btn">
                <FaWhatsapp size={24} /> Submit Prayer Request
              </button>
            </form>

            <div className="live-prayer-cta">
              <p className="mb-15">Prefer to pray with us live?</p>
              <Link to="/meeting" className="live-prayer-btn">🎥 Join Live Prayer Meeting</Link>
            </div>
          </div>
        </section>

        {/* NEW: INTERACTIVE PRAYER WALL SECTION */}
        <section className="prayer-wall-section">
          <div className="prayer-wall-inner">
            <p className="section-eyebrow text-center">Community</p>
            <h2 className="section-title text-center color-dark">Interactive Prayer Wall</h2>
            <span className="gold-rule centered" />
            <p className="text-center mb-24" style={{ color: '#64748B' }}>Stand in agreement with others. Click "I Prayed For This" to show support.</p>
            
            <div className="prayer-wall-grid">
              {prayerWall.map((item) => (
                <div key={item.id} className="prayer-wall-card">
                  <div className="prayer-wall-header">
                    <FaPrayingHands className="prayer-wall-icon" />
                    <strong>{item.name}</strong>
                  </div>
                  <p className="prayer-wall-text">"{item.request}"</p>
                  <button className="prayer-wall-btn" onClick={() => handlePrayForThis(item.id)}>
                    🙏 I Prayed For This ({item.prayers})
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="welcome">
          <div className={`welcome-inner anim-fade-up ${welcomeVisible ? 'visible' : ''}`} ref={welcomeRef}>
            <p className="section-eyebrow text-center">Welcome Home</p>
            <h2 className="section-title text-center">You Belong Here</h2>
            <span className="gold-rule centered" />
            <p className="welcome-desc">
              Whether you are discovering faith for the first time, returning to Answered Prayer Network, or looking for a church family, you are welcome here. We gather to worship God, study His Word, pray together, build meaningful relationships, and serve our community with love.
            </p>
          </div>

          <div className="services-grid" ref={ministriesRef}>
            {ministries.map((ministry, index) => (
              <div className={`service-card anim-fade-up delay-${index + 1} ${ministriesVisible ? 'visible' : ''}`} key={ministry.title}>
                <img src={ministry.icon} alt={`${ministry.title} icon`} className="service-icon" />
                <h3 className="service-title">{ministry.title}</h3>
                <p className="service-desc">{ministry.desc}</p>
              </div>
            ))}
          </div>

          <div className="welcome-cta">
            <Link to="/services" className="btn-gold">Explore Our Ministries</Link>
            <Link to="/meeting" className="btn-outline-gold">🎥 Join Live Meeting</Link>
          </div>
        </section>

        <section className="why-us">
          <div className="why-inner">
            <div className={`why-text anim-slide-left ${whyTextVisible ? 'visible' : ''}`} ref={whyTextRef}>
              <p className="section-eyebrow">Our Mission</p>
              <h2 className="section-title color-white">Growing Together<br />In Faith &amp; Love</h2>
              <span className="gold-rule" />
              <p className="why-desc">
                Our desire is to create a Christ-centered community where people can encounter God, grow spiritually, discover their gifts, build lasting relationships, and make a positive difference in the lives of others.
              </p>
              <div className="why-actions">
                <Link to="/about" className="btn-outline-gold">Learn More About Answered Prayer Network</Link>
                <Link to="/meeting" className="btn-gold">🎥 Join Live Meeting</Link>
              </div>
            </div>
            <div className={`why-image anim-slide-right ${whyImgVisible ? 'visible' : ''}`} ref={whyImgRef}>
              <img src="https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1000&q=85" alt="People worshipping together in church" />
              <div className="why-badge">
                <span className="badge-cross">✝</span>
                <span className="badge-label">Faith<br />Hope<br />Love</span>
              </div>
            </div>
          </div>
        </section>

        <section className="stats">
          {statsData.map((stat) => <StatItem key={stat.label} number={stat.number} label={stat.label} />)}
        </section>

        <section className="home-cta">
          <div className="home-cta-inner">
            <p className="section-eyebrow">You Are Welcome</p>
            <h2 className="home-cta-title">Come Worship With Answered Prayer Network</h2>
            <p className="home-cta-desc">
              We would love to welcome you and your family. Come as you are and experience a community built around Christ at Answered Prayer Network.
            </p>
            <div className="home-cta-buttons">
              <Link to="/contact" className="btn-gold">Plan Your Visit</Link>
              <Link to="/services" className="btn-outline-gold">Explore Ministries</Link>
              <Link to="/meeting" className="btn-gold">🎥 Join Live Meeting</Link>
            </div>
          </div>
        </section>

        {/* SERVICE TIMES & LOCATION SECTION */}
        <section className="service-times-section">
          <div className="service-times-inner">
            <div className="service-times-header">
              <p className="section-eyebrow color-dark">Visit Us</p>
              <h2 className="service-times-title">Service Times & Location</h2>
              <span className="gold-rule centered rule-dark" />
            </div>
            <div className="service-times-grid">
              <div className="service-times-info">
                <div className="info-block">
                  <h3 className="info-title"><span>⛪</span> Sunday Service</h3>
                  <p className="info-text">9:00 AM & 11:00 AM</p>
                </div>
                <div className="info-block">
                  <h3 className="info-title"><span>📖</span> Midweek Bible Study</h3>
                  <p className="info-text">Wednesdays • 6:00 PM</p>
                </div>
                <div>
                  <h3 className="info-title"><span>📍</span> Our Location</h3>
                  <p className="info-text no-indent">Fort Greene Hotel - Spintex Hills, Accra, Ghana</p>
                  <div className="location-actions">
                    <a href="https://maps.google.com/?q=Fort+Greene+Hotel+-+Spintex+Hills,+Accra,+Ghana" target="_blank" rel="noopener noreferrer" className="btn-dark">Get Directions</a>
                    <Link to="/meeting" className="btn-dark">🎥 Join Live Meeting</Link>
                  </div>
                </div>
              </div>
              <div className="map-wrapper">
                <iframe
                  src="https://maps.google.com/maps?q=Fort+Greene+Hotel+-+Spintex+Hills,+Accra,+Ghana&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%" height="400" className="map-iframe" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Church Location Map"
                />
              </div>
            </div>
          </div>
        </section>

        {/* NEW: VERSE OF THE DAY WIDGET */}
        <section className="verse-of-the-day-section">
          <div className="verse-inner">
            <FaBible className="verse-icon" />
            <p className="verse-text">"{verseOfTheDay.text}"</p>
            <p className="verse-reference">— {verseOfTheDay.reference}</p>
          </div>
        </section>

        <Footer />

        {/* FLOATING BUTTONS */}
        <button className="give-icon" onClick={() => setShowGiveModal(true)} aria-label="Give Online">
          <FaDonate className="give-icon-symbol" />
          <span>Give Now</span>
        </button>

        <Link to="/chatbot" className="chatbot-icon" aria-label="Answered Prayer Network Chatbot">
          <FaComments className="chatbot-icon-symbol" />
          <span>Chat With Us</span>
        </Link>

        <Link to="/meeting" className="meeting-icon" aria-label="Join Live Meeting">
          <FaVideo className="meeting-icon-symbol" />
          <span>Join Live</span>
        </Link>

      </main>
    </>
  );
}