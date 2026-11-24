export default function Footer() {
  const handleNewsletterSubmit = (event) => {
    event.preventDefault()
    event.currentTarget.reset()
  }

  return (
    <footer className="site-footer">
      <section className="trust-section" aria-label="Store guarantees">
        <div className="trust-card">
          <h3>100% Authentic Scents</h3>
          <p>Every fragrance is sourced from trusted suppliers and quality checked.</p>
        </div>
        <div className="trust-card">
          <h3>Fast Delivery</h3>
          <p>Secure packaging and prompt shipping to get your order to you quickly.</p>
        </div>
        <div className="trust-card">
          <h3>Customer Support</h3>
          <p>
            Need help choosing? Chat with us on{' '}
            <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer">
              WhatsApp
            </a>{' '}
            for personalized assistance.
          </p>
        </div>
      </section>

      <section className="footer-main">
        <div>
          <h2 className="footer-brand">Bernard Fragrance</h2>
          <p className="footer-text">
            Luxury perfumes and signature scents curated for every occasion.
          </p>
        </div>
        <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
          <label htmlFor="newsletter-email">Join our newsletter</label>
          <div className="newsletter-row">
            <input
              id="newsletter-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              required
            />
            <button type="submit">Subscribe</button>
          </div>
          <p className="footer-note">Receive new arrivals, offers, and fragrance tips.</p>
        </form>
      </section>

      <p className="copyright">© {new Date().getFullYear()} Bernard Fragrance. All rights reserved.</p>
    </footer>
  )
}
