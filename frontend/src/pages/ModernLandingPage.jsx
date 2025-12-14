import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGraduationCap,
  FaArrowRight,
  FaCheckCircle,
  FaUsers,
  FaBook,
  FaClipboardList,
  FaMoneyBillWave,
  FaBell,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import heroImg from "../assets/dashboard-preview.png";
// import "./styles/ModernLandingPage.css";
import '../styles/ModernLandingPage.css';

export default function ModernLandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    carouselRef.current = setInterval(() => {
      setCarouselIndex((s) => (s + 1) % 3);
    }, 3600);
    return () => clearInterval(carouselRef.current);
  }, []);

  const features = [
    { icon: <FaClipboardList />, title: "Admissions", desc: "Apply & manage applications" },
    { icon: <FaMoneyBillWave />, title: "Fees", desc: "Invoices, receipts & ledger" },
    { icon: <FaBook />, title: "Attendance", desc: "Daily tracking & reports" },
    { icon: <FaUsers />, title: "Students", desc: "Profiles, performance & history" },
    { icon: <FaCheckCircle />, title: "Exams", desc: "Grades, schedules & analytics" },
    { icon: <FaBell />, title: "Notifications", desc: "Alerts and announcements" },
  ];

  const workflow = [
    { step: 1, label: "Register", text: "Sign up with basic institution details" },
    { step: 2, label: "Apply", text: "Students submit applications online" },
    { step: 3, label: "Review", text: "Admins validate and verify documents" },
    { step: 4, label: "Approve", text: "Approve records and assign classes" },
    { step: 5, label: "Onboard", text: "Access dashboard and tools" },
  ];

  const faq = [
    { q: "How do I register?", a: "Click Get Started, fill the form and submit. Admin will confirm." },
    { q: "Can we accept online payments?", a: "Yes — integrate gateways and auto-generate receipts." },
    { q: "Is data backed up?", a: "Daily backups and role-based access control are enabled." },
    { q: "Can teachers use mobile?", a: "Teacher pages are mobile-responsive for quick attendance." },
  ];

  const stats = {
    students: 1248,
    admissions: 42,
    feesDue: 12800,
    attendance: 92,
  };

  return (
    <div className="mlp-root">
      {/* NAV */}
      <header className="mlp-nav">
        <div className="mlp-container nav-inner">
          <div className="brand" onClick={() => navigate("/")}>
            <div className="brand-icon"><FaGraduationCap /></div>
            <div className="brand-text">
              <div className="brand-title">EduERP</div>
              <div className="brand-sub">Student Management</div>
            </div>
          </div>

          <nav className="nav-links">
            <a href="#home" className="nav-link">Home</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#workflow" className="nav-link">Process</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </nav>

          <div className="nav-actions">
            <button className="btn ghost" onClick={() => navigate("/login")}>Login</button>
            <button className="btn solid" onClick={() => navigate("/register")}>Get Started <FaArrowRight /></button>

            <button className="mobile-toggle" onClick={() => setMobileOpen((s) => !s)}>
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mobile-menu">
            <a onClick={() => { navigate("/"); setMobileOpen(false); }}>Home</a>
            <a onClick={() => { navigate("/features"); setMobileOpen(false); }}>Features</a>
            <a onClick={() => { navigate("/workflow"); setMobileOpen(false); }}>Process</a>
            <a onClick={() => { navigate("/faq"); setMobileOpen(false); }}>FAQ</a>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="home" className="mlp-hero">
        <div className="mlp-container hero-grid">
          <div className="hero-left">
            <h1 className="hero-title">A calm, modern ERP for schools and colleges</h1>
            <p className="hero-sub">
              Manage admissions, attendance, fees and academic records in one elegant platform.
              Designed for administrators, teachers and students — simple, secure, serene.
            </p>

            <div className="hero-ctas">
              <button className="btn solid lg" onClick={() => navigate("/register")}>Get Started</button>
              <button className="btn ghost lg" onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}>Explore features</button>
            </div>

            <ul className="hero-stats">
              <li>
                <div className="stat-num">{stats.students}</div>
                <div className="stat-label">Students</div>
              </li>
              <li>
                <div className="stat-num">{stats.admissions}</div>
                <div className="stat-label">Open Admissions</div>
              </li>
              <li>
                <div className="stat-num">${stats.feesDue.toLocaleString()}</div>
                <div className="stat-label">Fees Due</div>
              </li>
            </ul>
          </div>

          <div className="hero-right">
            <div className="hero-mockup-wrap">
              <img src={heroImg} alt="Dashboard preview" className="hero-mockup" />
              <div className="mockup-floating top-left">
                <div className="mf-title">Quick stats</div>
                <div className="mf-body">Attendance 92% • New applications 42</div>
              </div>
              <div className="mockup-floating bottom-right">
                <div className="mf-title">Announcements</div>
                <div className="mf-body">Timetable on Friday • Staff meeting 10AM</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mlp-section features">
        <div className="mlp-container">
          <h2 className="section-title">Powerful modules for modern institutions</h2>
          <p className="section-sub">Everything you need — organized, accessible and beautiful.</p>

          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i} onClick={() => { /* small click hook */ }}>
                <div className={"feature-icon " + (i % 3 === 0 ? "fi-green" : i % 3 === 1 ? "fi-lav" : "fi-peach")}>
                  {f.icon}
                </div>
                <div className="feature-body">
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS / STATS */}
      <section className="mlp-section benefits">
        <div className="mlp-container benefits-grid">
          <div className="benefit-left card">
            <h3 className="card-title">Why EduERP?</h3>
            <p className="card-sub">Save time, reduce paperwork, and make data-driven decisions with visual reports and lightning-fast tools.</p>

            <ul className="benefit-list">
              <li>Role-based access & encryption</li>
              <li>Automated fee calculation & receipts</li>
              <li>Attendance analytics & alerts</li>
            </ul>

            <div className="card-cta">
              <button className="btn solid" onClick={() => navigate("/register")}>Start free trial</button>
            </div>
          </div>

          <div className="benefit-right card stats-card">
            <div className="stats-circle">
              <svg viewBox="0 0 36 36">
                <path d="M18 2a16 16 0 1 0 0 32" stroke="#E6E7EA" strokeWidth="4" fill="none"></path>
                <path d="M18 2a16 16 0 1 0 0 32" stroke="#6EE7B7" strokeWidth="4" strokeDasharray={`${stats.attendance}, 100`} strokeLinecap="round" fill="none"></path>
              </svg>
              <div className="stats-center">
                <div className="stats-num">{stats.attendance}%</div>
                <div className="stats-label">Avg Attendance</div>
              </div>
            </div>

            <div className="small-stats">
              <div className="ss-item">
                <div className="ss-title">New admissions</div>
                <div className="ss-value">+{stats.admissions}</div>
              </div>
              <div className="ss-item">
                <div className="ss-title">Open inquiries</div>
                <div className="ss-value">18</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="mlp-section workflow">
        <div className="mlp-container">
          <h2 className="section-title">Admission process</h2>
          <p className="section-sub">Easy 5-step flow for applicants and admins.</p>

          <div className="timeline">
            {workflow.map((w) => (
              <div className="timeline-item" key={w.step}>
                <div className="ti-badge">Step {w.step}</div>
                <div className="ti-card">
                  <h4 className="ti-title">{w.label}</h4>
                  <p className="ti-text">{w.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + CTA */}
      <section id="faq" className="mlp-section faq">
        <div className="mlp-container faq-grid">
          <div className="faq-left card">
            <h3 className="card-title">Frequently asked questions</h3>
            <div className="accordion">
              {faq.map((f, i) => (
                <div key={i} className="acc-item">
                  <button className="acc-q" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                    <span>{f.q}</span>
                    <span className="acc-toggle">{activeFaq === i ? "−" : "+"}</span>
                  </button>
                  {activeFaq === i && <div className="acc-a">{f.a}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="faq-right card cta-card">
            <h3 className="card-title">Ready to transform your institution?</h3>
            <p className="card-sub">Join schools and colleges using EduERP to modernize operations.</p>
            <button className="btn solid" onClick={() => navigate("/register")}>Get Started</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mlp-footer">
        <div className="mlp-container footer-grid">
          <div className="footer-brand">
            <div className="brand-small"><FaGraduationCap /></div>
            <div>
              <div className="brand-title">EduERP</div>
              <div className="brand-sub muted">Student Management</div>
            </div>
          </div>

          <div className="footer-links">
            <div className="link-col">
              <div className="col-title">Product</div>
              <a href="#features">Features</a>
              <a href="#workflow">How it works</a>
              <a href="#faq">FAQ</a>
            </div>

            <div className="link-col">
              <div className="col-title">Company</div>
              <a href="#home">About</a>
              <a href="#home">Blog</a>
              <a href="#home">Contact</a>
            </div>

            <div className="link-col">
              <div className="col-title">Legal</div>
              <a href="#home">Privacy</a>
              <a href="#home">Terms</a>
            </div>
          </div>
        </div>

        <div className="mlp-container footer-bottom">
          <div className="muted">© {new Date().getFullYear()} EduERP • Built with care for institutions</div>
          <div className="badges">
            <span className="badge">🔒 Secure</span>
            <span className="badge">⚡ Fast</span>
            <span className="badge">🌍 Global</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
