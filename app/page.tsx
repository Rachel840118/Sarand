"use client";

import { FormEvent, useState } from "react";

const navItems = [
  ["COLLECTIONS", "#collections"],
  ["HERITAGE", "#heritage"],
  ["BESPOKE", "#bespoke"],
  ["BOUTIQUES", "#boutiques"],
] as const;

function Arrow() {
  return <span className="arrow" aria-hidden="true">→</span>;
}

function Monogram() {
  return <span className="monogram" aria-hidden="true"><i /><b /></span>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [newsletterSent, setNewsletterSent] = useState(false);

  function openAppointment() {
    setMenuOpen(false);
    setAppointmentOpen(true);
  }

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterSent(true);
  }

  return (
    <main className="sharand-site">
      <header className="site-header">
        <div className="site-header-inner">
          <a href="#top" className="brand" aria-label="SHARAND JINHWA SEOUL home">
            <Monogram />
            <span><strong>SHARAND</strong><small>JINHWA SEOUL</small></span>
          </a>

          <nav className="primary-nav" aria-label="Primary navigation">
            {navItems.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
          </nav>

          <div className="header-actions">
            <button type="button" className="profile-button" aria-label="Arrange a private visit" onClick={openAppointment}><span /></button>
            <a className="bag-button" href="#collections" aria-label="Explore SHARAND collections"><span /></a>
            <button type="button" className="menu-button" aria-controls="mobile-menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              <span /><span /><span className="sr-only">메뉴</span>
            </button>
          </div>
        </div>
        <nav id="mobile-menu" className={`mobile-nav ${menuOpen ? "is-open" : ""}`} aria-label="Mobile navigation">
          {navItems.map(([label, href]) => <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <button type="button" onClick={openAppointment}>BOOK AN APPOINTMENT</button>
        </nav>
      </header>

      <section id="top" className="hero">
        <div className="hero-image" aria-hidden="true"><img src="/images/visual-hero.png" alt="" /></div>
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">THE ART OF ETERNITY</p>
          <h1>Sculpting Light in the Heart of Seoul</h1>
          <div className="hero-actions">
            <a className="button button-light" href="#collections">DISCOVER THE COLLECTION <Arrow /></a>
            <button type="button" className="button button-outline" onClick={openAppointment}>BOOK AN APPOINTMENT</button>
          </div>
        </div>
        <a className="hero-scroll" href="#collections"><span>SCROLL</span><i /></a>
      </section>

      <section id="collections" className="collections content-shell">
        <div className="section-intro collections-intro">
          <div><p className="section-label">SEASONAL EDIT</p><h2>Celestial Collections</h2></div>
          <a href="#bespoke" className="underlined-link">VIEW ALL COLLECTIONS <Arrow /></a>
        </div>

        <div className="collection-layout">
          <article className="collection-main collection-tile">
            <div className="tile-image"><img src="/images/celestial-ring.png" alt="SHARAND Lunar Radiance high jewelry ring" /></div>
            <h3>Lunar Radiance</h3>
            <p>Inspired by the serenity of a Seoul midnight, where a considered setting lets every facet hold the light.</p>
          </article>
          <div className="collection-side">
            <article className="collection-tile">
              <div className="tile-image tile-image-square"><img src="/images/visual-hat.png" alt="SHARAND Solar Flare fashion portrait" /></div>
              <h3>Solar Flare</h3>
              <p>The warmth of gold, refined into an architectural line.</p>
            </article>
            <article className="collection-tile">
              <div className="tile-image tile-image-square"><img src="/images/visual-night.png" alt="SHARAND Nebula Arc evening portrait" /></div>
              <h3>Nebula Arc</h3>
              <p>A cosmic study in curve, shadow, and rare brilliance.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="atelier" className="craft-section">
        <div className="craft-shell content-shell">
          <div className="craft-copy">
            <p className="section-label">THE ATELIER</p>
            <h2>Precision in Every<br />Facet</h2>
            <p className="body-copy">Our master artisans in Seoul devote their time to a single jewel. Handwork, proportion, and restraint come together in pieces made to be lived with for generations.</p>
            <div className="craft-notes">
              <article><span>01</span><div><h3>ETHICAL SOURCING</h3><p>Every stone is selected with a traceable origin and individual character.</p></div></article>
              <article><span>02</span><div><h3>ARTISANAL HAND-SETTING</h3><p>Details are finished slowly to create seamless light across the surface.</p></div></article>
            </div>
          </div>
          <figure className="craft-image"><img src="/images/editorial-atelier.png" alt="A master jeweler setting a SHARAND high-jewelry piece" /><span aria-hidden="true" /></figure>
        </div>
      </section>

      <section id="heritage" className="heritage content-shell">
        <div className="heritage-intro">
          <p className="section-label">OUR ROOTS</p>
          <h2>The Seoul Heritage</h2>
          <p>Born in the city&apos;s quiet intersections, SHARAND draws from Seoul&apos;s architectural poise and its energy after dark.</p>
        </div>
        <div className="heritage-grid">
          <article className="heritage-card portrait-card">
            <div className="heritage-image"><img src="/images/editorial-portrait.png" alt="A model wearing SHARAND high jewelry" /></div>
            <h3>Architectural Integrity</h3>
            <p>Designs that echo the structural clarity of a modern Seoul maison.</p>
          </article>
          <article className="heritage-card tradition-card">
            <div className="heritage-image"><img src="/images/editorial-hanok.png" alt="Moonlit Korean hanok roofline" /></div>
            <h3>Timeless Tradition</h3>
            <p>Quiet material rituals carried forward with contemporary restraint.</p>
          </article>
          <article className="heritage-card modern-card">
            <div className="heritage-image"><img src="/images/visual-night.png" alt="A SHARAND evening collection portrait" /></div>
            <h3>Modern Seoulite</h3>
            <p>A global expression of Seoul&apos;s quiet confidence and considered light.</p>
          </article>
        </div>
      </section>

      <section id="bespoke" className="journey-section content-shell">
        <div className="journey-panel">
          <p className="section-label">A PRIVATE INVITATION</p>
          <h2>Personalize Your Journey</h2>
          <p>Whether you are discovering a signature collection or considering a bespoke piece, our consultants await you at the SHARAND Seoul maison.</p>
          <div className="journey-actions">
            <button type="button" className="button button-light" onClick={openAppointment}>BOOK A CONSULTATION <Arrow /></button>
            <a className="button button-outline" href="#boutiques">FIND A BOUTIQUE</a>
          </div>
        </div>
      </section>

      <footer id="boutiques" className="site-footer">
        <div className="footer-shell content-shell">
          <div className="footer-brand">
            <a href="#top" className="brand" aria-label="Back to top"><Monogram /><span><strong>SHARAND</strong><small>JINHWA SEOUL</small></span></a>
            <nav aria-label="Footer navigation"><a href="#atelier">Atelier</a><a href="#heritage">Heritage</a><a href="#bespoke">Bespoke</a><button type="button" onClick={openAppointment}>Contact</button></nav>
          </div>
          <form className="newsletter" onSubmit={subscribe}>
            <label htmlFor="newsletter-email">NEWSLETTER</label>
            {newsletterSent ? <p className="newsletter-success">Thank you. Your private letter is reserved.</p> : <div><input id="newsletter-email" required type="email" placeholder="Email Address" /><button type="submit" aria-label="Subscribe to the SHARAND newsletter"><Arrow /></button></div>}
            <small>© {new Date().getFullYear()} SHARAND JINHWA SEOUL. ALL RIGHTS RESERVED.</small>
          </form>
        </div>
      </footer>

      {appointmentOpen && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setAppointmentOpen(false)}>
        <section className="appointment-dialog" role="dialog" aria-modal="true" aria-labelledby="appointment-title" onMouseDown={(event) => event.stopPropagation()}>
          <button type="button" className="close-button" aria-label="Close appointment request" onClick={() => setAppointmentOpen(false)}>×</button>
          <p className="section-label">PRIVATE VISIT</p>
          <h2 id="appointment-title">A moment,<br />set aside for you.</h2>
          <p>SHARAND private visits are arranged with care. Contact the maison directly to begin your appointment.</p>
          <a href="mailto:maison@sharandjinhwa.com?subject=SHARAND%20Private%20Visit" className="button button-light">EMAIL THE MAISON <Arrow /></a>
        </section>
      </div>}
    </main>
  );
}
